<template>
  <b-form class="form">
    <div v-for="operation in operations" :key="operation.id" class="transaction"> <!-- App transaction = Stellar operation != Stellar transaction -->
      <b-row>
        <b-col>
          Date: {{ dayjs(operation.transaction.created_at).format('DD MMM YYYY HH:mm:ss') }}<br>
          <span v-if="operation.transaction.memo_type !== 'none'">Memo type: {{ operation.transaction.memo_type }}<br></span>
          <span v-if="operation.transaction.memo_type !== 'none'">Memo: {{ operation.transaction.memo }}</span>
        </b-col>
        <b-col>
          <div>Operation - Type: {{ operation.type }}<br></div>
          <div>Operation - ID:  <a href="#" @click.prevent="openedDetails = (openedDetails === operation.id ? null : operation.id)">{{ operation.id }}</a><br></div>
          <div v-if="operation.amount">
            Amount:
            <span :class="data.public_key === operation.to ? 'text-success' : 'text-danger'">
              {{ data.public_key === operation.to ? '' : '-' }}{{ operation.amount }}
              {{ operation.asset_type === 'native' ? 'XLM' : operation.asset_code }}
            </span>
            <br>
          </div>
          <div :id="`operation-${operation.id}-details`" :class="['btn-rounded-lg', openedDetails === operation.id ? 'd-block' : 'd-none']">
            <pre style="font-size: 11px" class="p-2 mt-3 text-success bg-dark">{{ operation }}</pre>
          </div>
        </b-col>
      </b-row>
      <hr class="divider">
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

import spinner from '@/components/ui/spinner';

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
      operations: [],
      loading: false,
      openedDetails: null,
    };
  },

  async created () {
    this.loading = true;
    this.transactions = {};
    this.operationQuery = await StellarAPI.operations()
      .forAccount(this.data.public_key)
      .order('desc')
      .limit(20)
      .call();
    await this.processOperationQuery();
    this.loading = false;
  },

  methods: {
    async processOperationQuery () {
      const operations = this.operationQuery.records;
      const requiredTransactions = operations.map(op => op.transaction_hash).filter(tx => this.transactions[tx] === undefined);
      const transactionQueries = await Promise.all(requiredTransactions.map(tx => StellarAPI.transactions().transaction(tx).call()));
      transactionQueries.forEach(tx => {
        this.transactions[tx.hash] = tx;
      });
      operations.forEach(op => {
        op.transaction = this.transactions[op.transaction_hash];
      });
      this.operations = [...this.operations, ...operations];
    },
    async onLoadMore () {
      this.loading = true;
      this.operationQuery = await this.operationQuery.next();
      await this.processOperationQuery();
      this.loading = false;
    },
    dayjs
  },
};
</script>
