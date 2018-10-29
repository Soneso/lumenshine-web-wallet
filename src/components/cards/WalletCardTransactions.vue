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
            <div>Operation - Type: {{ operation.type }}<br></div>
            <div>Operation - ID:  <a href="#" @click.prevent="onDetailsClick(operation)">{{ operation.id }}</a><br></div>
            <div v-if="operation.amount">
              Amount:
              <span :class="data.public_key_0 === operation.to ? 'text-success' : 'text-danger'">
                {{ data.public_key_0 === operation.to ? '' : '-' }}{{ operation.amount }}
                {{ operation.asset_type === 'native' ? 'XLM' : operation.asset_code }}
              </span>
              <br>
            </div>
            <div :id="`operation-${operation.id}-details`" class="d-none btn-rounded-lg">
              <pre style="font-size: 11px" class="p-2 mt-3 text-success bg-dark">
                {{ operation }}
              </pre>
            </div>
          </b-col>
        </b-row>
        <hr class="divider">
      </div>
    </div>
    <b-row align-h="center">
      <b-col cols="6" md="4" class="text-center">
        <a v-if="!loading" href="#" @click.prevent="onLoadMore">Load more</a>
        <spinner v-else :size="21" width="180" message="Loading transactions..."/>
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
      const el = document.getElementById(`operation-${operation.id}-details`);
      el.classList[el.classList.contains('d-none') ? 'remove' : 'add']('d-none');
      el.classList[el.classList.contains('d-block') ? 'remove' : 'add']('d-block');
    },
    dayjs
  },
};
</script>
