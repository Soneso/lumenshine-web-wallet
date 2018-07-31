<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <div>
      <div v-for="transaction in transactions" :key="transaction.id" class="transaction">
        <div v-for="operation in transaction.operations" :key="operation.id">
          <p>
            Date: {{ dayjs(transaction.created_at).format('DD MMM YYYY HH:mm:ss') }}<br>
            <span v-if="transaction.memo_type !== 'none'">Memo type: {{ transaction.memo_type }}<br></span>
            <span v-if="transaction.memo_type !== 'none'">Memo: {{ transaction.memo }}</span>
          </p>
          <p>
            <span>Operation - Type: {{ operation.type }}<br></span>
            <span>Operation - ID: {{ operation.id }}<br></span>
            <span v-if="operation.amount">Amount: <span :class="{ info: operation.amount >= 0, error: operation.amount < 0}">{{ operation.amount }} {{ operation.asset_type === 'native' ? 'XLM' : operation.asset_code }}</span><br></span>
            <br>
            <a href="#" @click.prevent="onDetailsClick(operation)">Details</a>
          </p>
          <hr>
        </div>
      </div>
      <a v-if="!loading" href="#" @click.prevent="onLoadMore">Load more</a>
    </div>
    <div v-if="loading">Loading transactions... <i class="fa fa-spinner fa-spin fa-fw"/></div>
    <modal v-if="detailsModalShown" @close="detailsModalShown = false">
      <template slot="title">
        Operation details
      </template>
      <pre>
        {{ JSON.stringify(detailsModalData, null, 2) }}
      </pre>
    </modal>
  </form>
</template>

<script>
import StellarSdk from 'stellar-sdk';
import dayjs from 'dayjs';

import config from '@/config';
import Modal from '@/components/Modal';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { Modal },
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
      detailsModalShown: false,
      detailsModalData: null,
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
      this.detailsModalData = operation;
      this.detailsModalShown = true;
    },
    dayjs
  },
};
</script>

<style lang="scss" scoped>
@import "assets/scss/variables";
.transaction {
  p {
    @include breakpoint(desktop) {
      width: 49%;
      display: inline-block;
      vertical-align: top;
    }
  }
}
</style>
