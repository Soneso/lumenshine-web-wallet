<template>
  <b-form class="form">
    <div v-for="transaction in transactions" :key="transaction.id" class="transaction">
      <div v-for="operation in transaction.operations" :key="operation.id">
        <b-row>
          <b-col>
            Date: {{ dayjs(transaction.created_at).format('DD MMM YYYY HH:mm:ss') }}<br>
            <span v-if="transaction.memo_type !== 'none'">Memo type: {{ transaction.memo_type }}<br></span>
            <span v-if="transaction.memo_type !== 'none'">Memo: {{ transaction.memo }}</span>
          </b-col>
          <b-col>
            <span>Operation - Type: {{ operation.type }}<br></span>
            <span>Operation - ID: {{ operation.id }}<br></span>
            <span v-if="operation.amount">
              Amount:
              <span :class="{ 'text-success': operation.amount >= 0, 'text-danger': operation.amount < 0}">
                {{ operation.amount }} {{ operation.asset_type === 'native' ? 'XLM' : operation.asset_code }}
              </span>
              <br>
            </span>
            <br>
            <a href="#" @click.prevent="onDetailsClick(operation)">Details</a>
          </b-col>
        </b-row>
        <hr class="divider">
      </div>
    </div>
    <b-row align-h="center">
      <b-col cols="6" md="4" class="text-center">
        <a v-if="!loading" href="#" @click.prevent="onLoadMore">Load more</a>
        <spinner v-else width="200" message="Loading transactions..."/>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import StellarSdk from 'stellar-sdk';
import dayjs from 'dayjs';

import config from '@/config';

import spinner from '@/components/ui/spinner1.vue';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { spinner },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      transactions: [],
      loading: false,
    };
  },
  async created () {
    this.loading = true;
    this.transactionQuery = await StellarAPI.transactions()
      .forAccount(this.data.public_key_0)
      .order('desc')
      .limit(3)
      .call();
    await this.processTransactionQuery();
    this.loading = false;
  },
  methods: {
    async processTransactionQuery () {
      const transactions = this.transactionQuery.records;
      const operationQueries = await Promise.all(transactions.map(t => t.operations()));
      const operations = operationQueries.map(q => q.records).reduce((acc, c) => acc.concat(c), []);
      transactions.forEach(t => {
        t.operations = operations.filter(o => o.transaction_hash === t.hash);
      });
      this.transactions = [...this.transactions, ...transactions];
    },
    async onLoadMore () {
      this.loading = true;
      this.transactionQuery = await this.transactionQuery.next();
      await this.processTransactionQuery();
      this.loading = false;
    },
    onDetailsClick (operation) {
      this.$emit('openOperationsModal', operation);
    },
    dayjs
  },
};
</script>
