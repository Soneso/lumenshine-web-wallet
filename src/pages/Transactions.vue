<template>
  <b-row align-h="center">
    <b-col cols="6" md="12">
      <b-card class="p-4 my-4">
        <b-form-group label-for="transaction-wallet" label="Wallet">
          <b-form-select id="transaction-wallet" v-model="selectedWallet" :options="walletOptions"/>
        </b-form-group>

        <b-form-group label-for="transaction-date-start" class="mx-2">
          <div class="datepicker-wrapper p-0">
            <datepicker id="transaction-date-start" v-model="dateFrom" :disabled-dates="dateStartDisabled" format="yyyy.MM.dd" placeholder="Date from" class="py-1"/>
            <i class="icon-calendar"/>
          </div>
          <small class="form-text text-muted">Date from</small>
        </b-form-group>

        <b-form-group label-for="transaction-date-end" class="mx-2">
          <div class="datepicker-wrapper p-0">
            <datepicker id="transaction-date-end" v-model="dateTo" :disabled-dates="dateEndDisabled" format="yyyy.MM.dd" placeholder="Date to" class="py-1"/>
            <i class="icon-calendar"/>
          </div>
          <small class="form-text text-muted">Date to</small>
        </b-form-group>

        <b-form-group label-for="transaction-memo" class="mx-2" label="Memo">
          <b-form-input
            id="transaction-memo"
            v-model="filterMemo"
            type="text"
            placeholder="Memo"/>
        </b-form-group>

        <hr class="separator">

        <b-form-checkbox v-model="showPayment">Payment</b-form-checkbox>

        <b-form-group v-if="showPayment">
          <b-form-checkbox-group id="filter-payment-types" v-model="showPaymentTypes">
            <b-form-checkbox value="RECEIVED">Received</b-form-checkbox>
            <b-form-checkbox value="SENT">Sent</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>

        <hr class="separator">

        <b-form-checkbox v-model="showOffers">Offers</b-form-checkbox>
        <hr class="separator">
        <b-form-checkbox v-model="showOther">Other</b-form-checkbox>

        <b-form-group v-if="showOther">
          <b-form-checkbox-group id="filter-other-types" v-model="showOtherTypes">
            <b-form-checkbox value="SET_OPTIONS">Set options</b-form-checkbox>
            <b-form-checkbox value="TRUST">Trust</b-form-checkbox>
            <b-form-checkbox value="ACCOUNT_MERGE">Account merge</b-form-checkbox>
            <b-form-checkbox value="MANAGE_DATA">Manage data</b-form-checkbox>
            <b-form-checkbox value="BUMP_SEQUENCE">Bump sequence</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-card>
    </b-col>
    <b-col cols="6" md="12">
      <b-card class="p-4">
        <h4 class="form-headline text-uppercase text-center">Transactions history</h4>
        <br>
        <spinner v-if="inProgress" align="center" class="mt-3"/>
        <b-table :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :items="tableItems" :fields="fields" bordered head-variant="dark">
          <template v-for="field in fields" slot-scope="row" :slot="field.key">
            <span v-if="field.key === 'date'" :key="field.key" v-html="formatDate(row.item[field.key])"/>
            <span v-else-if="field.key === 'details'" :key="field.key">
              <transaction-details :item="row.item['details']" :selected-wallet="selectedWallet"/>
            </span>
            <span v-else :key="field.key" v-html="row.item[field.key]"/>
          </template>
        </b-table>
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

import OperationType from '@/util/OperationType';

import TransactionDetails from '@/components/TransactionDetails';

export default {
  name: 'Transactions',
  components: { spinner, Datepicker, TransactionDetails },

  data () {
    return {
      inProgress: false,

      selectedWallet: null,

      filterMemo: '',
      showPayment: true,
      showOffers: true,
      showOther: true,

      showOtherTypes: ['SET_OPTIONS', 'TRUST', 'ACCOUNT_MERGE', 'MANAGE_DATA', 'BUMP_SEQUENCE'],
      showPaymentTypes: ['RECEIVED', 'SENT'],

      fields: [
        { key: 'date', sortable: true },
        { key: 'type', sortable: true },
        { key: 'amount', sortable: true },
        { key: 'currency', sortable: true },
        { key: 'fee', sortable: false },
        { key: 'details', sortable: false },
      ],

      sortBy: 'date',
      sortDesc: false,

      dateFrom: dayjs().subtract(2, 'weeks').format('YYYY-MM-DD HH:mm:ss'),
      dateTo: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
  },

  computed: {
    ...mapGetters(['transactions', 'wallets']),
    loading () {
      return this.inProgress;
    },

    dateStartDisabled () {
      return {
        from: new Date(),
      };
    },

    dateEndDisabled () {
      return {
        from: new Date(Math.min(dayjs(this.dateFrom).add(2, 'weeks').toDate(), new Date())),
        to: dayjs(this.dateFrom).toDate(),
      };
    },

    operations () {
      const ops = [];
      if (!this.transactions.res) return [];
      this.transactions.res.forEach(tr => {
        const transactionBase = { ...tr };
        transactionBase.op_details = JSON.parse(transactionBase.op_details);
        ops.push(transactionBase);
      });
      return ops;
    },

    filteredItems () {
      const filtered = this.operations.filter(op => {
        if (this.filterMemo !== '') {
          if (op.tx_memo.toLowerCase().indexOf(this.filterMemo.toLowerCase()) === -1) {
            return false;
          }
        }

        switch (op.op_type) {
          case OperationType.CREATE_ACCOUNT:
            if (!this.showPayment) return false;
            if (!this.showPaymentTypes.includes('RECEIVED')) return false;
            break;
          case OperationType.PAYMENT:
          case OperationType.PATH_PAYMENT:
            if (!this.showPayment) return false;
            if (!this.showPaymentTypes.includes('RECEIVED') && op.op_details.to === this.selectedWallet) return false;
            if (!this.showPaymentTypes.includes('SENT') && op.op_details.from === this.selectedWallet) return false;
            break;
          case OperationType.MANAGE_OFFER:
          case OperationType.CREATE_PASSIVE_OFFER:
            if (!this.showOffers) return false;
            break;
          case OperationType.SET_OPTIONS:
            if (!this.showOther) return false;
            if (!this.showOtherTypes.includes('SET_OPTIONS')) return false;
            break;
          case OperationType.CHANGE_TRUST:
          case OperationType.ALLOW_TRUST:
            if (!this.showOther) return false;
            if (!this.showOtherTypes.includes('TRUST')) return false;
            break;
          case OperationType.ACCOUNT_MERGE:
            if (!this.showOther) return false;
            if (!this.showOtherTypes.includes('ACCOUNT_MERGE')) return false;
            break;
          case OperationType.INFLATION:
          case OperationType.MANAGE_DATA:
            if (!this.showOther) return false;
            if (!this.showOtherTypes.includes('MANAGE_DATA')) return false;
            break;
          case OperationType.BUMP_SEQUENCE:
            if (!this.showOther) return false;
            if (!this.showOtherTypes.includes('BUMP_SEQUENCE')) return false;
            break;
        }
        return true;
      });
      return filtered;
    },

    tableItems () {
      return this.filteredItems.map(item => ({
        date: dayjs(item.tx_created_at),
        type: this.getOperationName(item),
        amount: this.getAmount(item),
        currency: this.getCurrency(item),
        fee: this.getFee(item),
        details: item,
      }));
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
    dateFrom (val) {
      const fromDate = dayjs(val);
      if (dayjs(this.dateTo).isAfter(fromDate.add(2, 'weeks'))) {
        this.dateTo = fromDate.add(2, 'weeks').format('YYYY-MM-DD HH:mm:ss');
      } else if (dayjs(this.dateTo).isBefore(fromDate)) {
        this.dateTo = fromDate.format('YYYY-MM-DD HH:mm:ss');
      }
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
        case OperationType.PATH_PAYMENT:
          return item.op_details.from === this.selectedWallet ? '<span class="text-danger">payment sent</span>' : '<span class="text-success">payment received</span>';
        case OperationType.MANAGE_OFFER:
          if (item.op_details.amount === '0.0000000') return 'offer removed';
          if (item.op_details.offer_id === 0) return 'offer created';
          return 'offer updated';
        case OperationType.CREATE_PASSIVE_OFFER:
          return 'passive offer created';
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
        case OperationType.PATH_PAYMENT:
          if (item.op_details.from === this.selectedWallet) return '-' + new Amount(item.op_details.source_amount).format(); // sending
          return new Amount(item.op_details.amount).format(); // receiving
        case OperationType.MANAGE_OFFER:
          return new Amount(item.op_details.amount).format();
        case OperationType.CREATE_PASSIVE_OFFER:
          return new Amount(item.op_details.amount).format();
      }
      return '';
    },

    getCurrency (item) {
      switch (item.op_type) {
        case OperationType.CREATE_ACCOUNT:
          return 'XLM';
        case OperationType.PAYMENT:
          return item.op_details.asset_type === 'native' ? 'XLM' : item.op_details.asset_code;
        case OperationType.PATH_PAYMENT:
          if (item.op_details.from === this.selectedWallet) return item.op_details.source_asset_type === 'native' ? 'XLM' : item.op_details.source_asset_code; // sending
          return item.op_details.asset_type === 'native' ? 'XLM' : item.op_details.asset_code; // receiving
        case OperationType.CHANGE_TRUST:
          return item.op_details.asset_code;
        case OperationType.MANAGE_OFFER:
          return item.op_details.selling_asset_type === 'native' ? 'XLM' : item.op_details.selling_asset_code;
        case OperationType.CREATE_PASSIVE_OFFER:
          return item.op_details.selling_asset_type === 'native' ? 'XLM' : item.op_details.selling_asset_code;
      }
      return '-';
    },

    getFee (item) {
      if (this.selectedWallet === item.tx_source_account) {
        return item.tx_fee_paid / item.tx_operation_count;
      }
      return 0;
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
