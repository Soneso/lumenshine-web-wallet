<template>
  <b-row align-h="center">
    <b-col cols="6" md="12">
      <b-card class="p-4 my-4">
        <b-form-group label-for="transaction-wallet" label="Wallet">
          <b-form-select id="transaction-wallet" v-model="selectedWallet" :options="walletOptions"/>
        </b-form-group>

        <b-form-group label-for="transaction-date-start" class="mx-2">
          <div class="datepicker-wrapper p-0">
            <datepicker id="transaction-date-start" v-model="dateFrom" format="yyyy.MM.dd" placeholder="Date from" class="py-1"/>
            <i class="icon-calendar"/>
          </div>
          <small class="form-text text-muted">Date from</small>
        </b-form-group>

        <b-form-group label-for="transaction-date-end" class="mx-2">
          <div class="datepicker-wrapper p-0">
            <datepicker id="transaction-date-end" v-model="dateTo" format="yyyy.MM.dd" placeholder="Date to" class="py-1"/>
            <i class="icon-calendar"/>
          </div>
          <small class="form-text text-muted">Date to</small>
        </b-form-group>
      </b-card>
    </b-col>
    <b-col cols="6" md="12">
      <b-card class="p-4">
        <h4 class="form-headline text-uppercase text-center">Transactions history</h4>
        <spinner v-if="inProgress" align="center" class="mt-3"/>
        <table>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Fee</th>
            <th>Details</th>
          </tr>
          <tr v-for="item in operations" :key="item.transaction.transaction_hash">
            <td>{{ formatDate(item.transaction.created_at) }}</td>
            <td>{{ getOperationName(item) }}</td>
            <td v-html="getAmount(item)"/>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
        </table>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import dayjs from 'dayjs';
import Datepicker from 'vuejs-datepicker';

import spinner from '@/components/ui/spinner1.vue';
import Amount from '@/util/Amount';

const OperationType = {
  0: 'CREATE_ACCOUNT',
  CREATE_ACCOUNT: 0,
  1: 'PAYMENT',
  PAYMENT: 1,
  2: 'PATH_PAYMENT',
  PATH_PAYMENT: 2,
  3: 'MANAGE_OFFER',
  MANAGE_OFFER: 3,
  4: 'CREATE_PASSIVE_OFFER',
  CREATE_PASSIVE_OFFER: 4,
  5: 'SET_OPTIONS',
  SET_OPTIONS: 5,
  6: 'CHANGE_TRUST',
  CHANGE_TRUST: 6,
  7: 'ALLOW_TRUST',
  ALLOW_TRUST: 7,
  8: 'ACCOUNT_MERGE',
  ACCOUNT_MERGE: 8,
  9: 'INFLATION',
  INFLATION: 9,
  10: 'MANAGE_DATA',
  MANAGE_DATA: 10,
  11: 'BUMP_SEQUENCE',
  BUMP_SEQUENCE: 11,
};

export default {
  name: 'Transactions',
  components: { spinner, Datepicker },

  data () {
    return {
      inProgress: false,

      selectedWallet: null,

      dateFrom: dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
      dateTo: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
  },

  computed: {
    ...mapGetters(['transactions', 'wallets']),
    loading () {
      return this.inProgress;
    },

    operations () {
      const ops = [];
      if (!this.transactions.res) return [];
      this.transactions.res.forEach(tr => {
        const transactionBase = { ...tr };
        delete transactionBase.operations;
        tr.operations.forEach(op => {
          op.details = JSON.parse(op.details);
          ops.push({ transaction: transactionBase, operation: op });
        });
      });
      console.log('operations', ops);
      return ops;
    },

    walletOptions () {
      if (!this.wallets.res) return [];
      return this.wallets.res.map(w => ({
        value: w.public_key,
        text: w.wallet_name,
      }));
    },
  },

  watch: {
    selectedWallet () {
      this.reloadTransactions();
    },
    dateFrom () {
      this.reloadTransactions();
    },
    dateTo () {
      this.reloadTransactions();
    }
  },

  async created () {
    await this.getWallets();
    if (this.wallets.res.length > 0) {
      this.selectedWallet = this.wallets.res[0].public_key;
    }
    this.reloadTransactions();
  },

  methods: {
    ...mapActions(['loadTransactions', 'getWallets']),
    getOperationName (item) {
      switch (item.operation.type) {
        case OperationType.CREATE_ACCOUNT:
          return 'create account';
        case OperationType.PAYMENT:
          return item.operation.details.from === this.selectedWallet ? 'payment sent' : 'payment received';
      };
      return 'unkn';
    },

    getAmount (item) {
      const allowedTypes = [
        OperationType.CREATE_ACCOUNT,
        OperationType.PAYMENT,
        OperationType.PATH_PAYMENT,
        OperationType.MANAGE_OFFER,
        OperationType.CREATE_PASSIVE_OFFER,
        OperationType.ACCOUNT_MERGE
      ];
      if (!allowedTypes.includes(item.operation.type)) return '';

      switch (item.operation.type) {
        case OperationType.CREATE_ACCOUNT:
          return 'xxx';
        case OperationType.PAYMENT:
          return (item.operation.details.from === this.selectedWallet ? '-' : '') + new Amount(item.operation.details.amount).format();
      }
      return '';
    },

    formatDate (date) {
      return dayjs(date).format('DD.MM.YYYY hh:mm:ssA');
    },

    async reloadTransactions () {
      this.inProgress = true;
      await this.loadTransactions({
        stellar_account_pk: this.selectedWallet,
        start_timestamp: dayjs(this.dateFrom).format('YYYY-MM-DD HH:mm:ss'),
        end_timestamp: dayjs(this.dateTo).format('YYYY-MM-DD HH:mm:ss'),
      });
      this.inProgress = false;
    },

    async onSubmitClick (data) {
      this.inProgress = true;
      await this.loadTransactions();
      this.inProgress = false;
    }
  }
};
</script>
