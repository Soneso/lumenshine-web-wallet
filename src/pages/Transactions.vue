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
          <tr v-for="item in operations" :key="item.tx_transaction_hash">
            <td>{{ formatDate(item.tx_created_at) }}</td>
            <td v-html="getOperationName(item)"/>
            <td v-html="getAmount(item)"/>
            <td v-html="getCurrency(item)"/>
            <td v-html="getFee(item)"/>
            <td v-html="getDetails(item)"/>
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

import spinner from '@/components/ui/spinner.vue';
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
        transactionBase.op_details = JSON.parse(transactionBase.op_details);
        ops.push(transactionBase);
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
      switch (item.op_type) {
        case OperationType.CREATE_ACCOUNT:
          return 'create account';
        case OperationType.PAYMENT:
          return item.op_details.from === this.selectedWallet ? '<span class="text-danger">payment sent</span>' : '<span class="text-success">payment received</span>';
        case OperationType.PATH_PAYMENT:
          return 'path payment';
        case OperationType.MANAGE_OFFER:
          return 'manage offer';
        case OperationType.CREATE_PASSIVE_OFFER:
          return 'create passive offer';
        case OperationType.SET_OPTIONS:
          return 'set options';
        case OperationType.CHANGE_TRUST:
          return 'change trust';
        case OperationType.ALLOW_TRUST:
          return 'allow trust';
        case OperationType.ACCOUNT_MERGE:
          return 'account merge';
        case OperationType.INFLATION:
          return 'inflation';
        case OperationType.MANAGE_DATA:
          return 'manage data';
        case OperationType.BUMP_SEQUENCE:
          return 'bump sequence';
      };
      return OperationType[item.op_type];
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
      if (!allowedTypes.includes(item.op_type)) return '';

      switch (item.op_type) {
        case OperationType.CREATE_ACCOUNT:
          return new Amount(item.op_details.starting_balance).format();
        case OperationType.PAYMENT:
          return (item.op_details.from === this.selectedWallet ? '-' : '') + new Amount(item.op_details.amount).format();
      }
      return '';
    },

    getCurrency (item) {
      switch (item.op_type) {
        case OperationType.CREATE_ACCOUNT:
          return 'XLM';
        case OperationType.PAYMENT:
          return item.op_details.asset_type === 'native' ? 'XLM' : item.op_details.asset_code;
        case OperationType.CHANGE_TRUST:
          return item.op_details.asset_code;
      }
      return '-';
    },

    getFee (item) {
      if (this.selectedWallet === item.tx_source_account) {
        return item.tx_fee_paid / item.tx_operation_count;
      }
      return 0;
    },

    getDetails (item) {
      const lines = [`Operation ID: ${item.op_id}`];
      switch (item.op_type) {
        case OperationType.CHANGE_TRUST:
          lines.push(`Type: add`); // TODO
          lines.push(`Asset: ${item.op_details.asset_code}`);
          lines.push(`Issuer: ${item.op_details.asset_issuer}`);
          lines.push(`Trust limit: ${new Amount(item.op_details.limit).format()}`);
          break;
        case OperationType.SET_OPTIONS:
          item.op_details.inflation_dest && lines.push(`Inflation destination: ${item.op_details.inflation_dest}`);
          // item.op_details.inflation_dest && lines.push(`Set flags: ${item.op_details.inflation_dest}`);
          // item.op_details.inflation_dest && lines.push(`Clear flags: ${item.op_details.inflation_dest}`);
          item.op_details.master_key_weight && lines.push(`Master weight: ${item.op_details.master_key_weight}`);
          item.op_details.low_threshold && lines.push(`Low threshold: ${item.op_details.low_threshold}`);
          item.op_details.med_threshold && lines.push(`Medium threshold: ${item.op_details.med_threshold}`);
          item.op_details.high_threshold && lines.push(`High threshold: ${item.op_details.high_threshold}`);
          // item.op_details.inflation_dest && lines.push(`Signer added: ${item.op_details.inflation_dest}`);
          // item.op_details.inflation_dest && lines.push(`Signer removed: ${item.op_details.inflation_dest}`);
          // item.op_details.inflation_dest && lines.push(`Signer type: ${item.op_details.inflation_dest}`);
          // item.op_details.inflation_dest && lines.push(`Signer weight: ${item.op_details.inflation_dest}`);
          item.op_details.home_domain && lines.push(`Home domain: ${item.op_details.home_domain}`);
          break;
      }
      false && lines.push(`Source account: `);
      return lines.join('<br>');
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
