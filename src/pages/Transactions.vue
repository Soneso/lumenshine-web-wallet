<template>
  <b-row>
    <b-col cols="4" xl="4" md="12" class="my-2">
      <b-card class="p-4">
        <b-form-group label-for="transaction-wallet" label="Wallet">
          <b-form-select id="transaction-wallet" v-model="selectedWallet" :options="walletOptions"/>
        </b-form-group>

        <b-row>
          <b-col>
            <b-form-group label-for="transaction-date-start" class="mx-2">
              <div class="datepicker-wrapper p-0">
                <datepicker id="transaction-date-start" v-model="dateFrom" :disabled-dates="dateStartDisabled" format="yyyy.MM.dd" placeholder="Date from" class="py-1"/>
                <i class="icon-calendar"/>
              </div>
              <small class="form-text text-muted">Date from</small>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label-for="transaction-date-end" class="mx-2">
              <div class="datepicker-wrapper p-0">
                <datepicker id="transaction-date-end" v-model="dateTo" :disabled-dates="dateEndDisabled" format="yyyy.MM.dd" placeholder="Date to" class="py-1"/>
                <i class="icon-calendar"/>
              </div>
              <small class="form-text text-muted">Date to</small>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group label-for="transaction-memo">
              <b-form-input
                id="transaction-memo"
                v-model="filterMemo"
                type="text"
                placeholder="MEMO"/>
            </b-form-group>
          </b-col>
          <b-col class="text-right text-uppercase">
            <a v-if="!advancedFiltersOpened" href="#" @click.prevent="advancedFiltersOpened = true">More filters</a>
            <a v-else href="#" @click.prevent="advancedFiltersOpened = false">Less filters</a>
          </b-col>
        </b-row>

        <template v-if="advancedFiltersOpened">
          <b-form-checkbox v-model="filterPayments" :indeterminate="filterPaymentIndeterminate" class="my-2">Payments</b-form-checkbox>

          <b-row v-if="filterPayments" class="mx-1">
            <b-col>
              <b-form-checkbox v-model="filterPaymentReceived" class="my-2">Received</b-form-checkbox>
            </b-col>
            <b-col v-if="filterPaymentReceived">
              <b-form-group label-for="payment-received-from" label="Amount from">
                <b-form-input
                  id="payment-received-from"
                  :class="{ error: $v.filterPaymentReceivedAmountFrom.$error }"
                  :state="!$v.filterPaymentReceivedAmountFrom.$error"
                  v-model="filterPaymentReceivedAmountFrom"
                  aria-describedby="inputLivePaymentReceivedFromFeedback"
                  type="text"
                  @blur.native="$v.filterPaymentReceivedAmountFrom.$touch()"/>
                <b-form-invalid-feedback id="inputLivePaymentReceivedFromFeedback">
                  <template v-if="$v.filterPaymentReceivedAmountFrom.$error" class="field__errors">
                    <template v-if="!$v.filterPaymentReceivedAmountFrom.decimal">Amount should be numeric</template>
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col v-if="filterPaymentReceived">
              <b-form-group label-for="payment-received-to" label="Amount to">
                <b-form-input
                  id="payment-received-to"
                  :class="{ error: $v.filterPaymentReceivedAmountTo.$error }"
                  :state="!$v.filterPaymentReceivedAmountTo.$error"
                  v-model="filterPaymentReceivedAmountTo"
                  aria-describedby="inputLivePaymentReceivedToFeedback"
                  type="text"
                  @blur.native="$v.filterPaymentReceivedAmountTo.$touch()"/>
                <b-form-invalid-feedback id="inputLivePaymentReceivedToFeedback">
                  <template v-if="$v.filterPaymentReceivedAmountTo.$error" class="field__errors">
                    <template v-if="!$v.filterPaymentReceivedAmountTo.decimal">Amount should be numeric</template>
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row v-if="filterPayments" class="mx-1">
            <b-col>
              <b-form-checkbox v-model="filterPaymentSent" class="my-2">Sent</b-form-checkbox>
            </b-col>
            <b-col v-if="filterPaymentSent">
              <b-form-group label-for="payment-sent-from" label="Amount from">
                <b-form-input
                  id="payment-sent-from"
                  :class="{ error: $v.filterPaymentSentAmountFrom.$error }"
                  :state="!$v.filterPaymentSentAmountFrom.$error"
                  v-model="filterPaymentSentAmountFrom"
                  aria-describedby="inputLivePaymentSentFromFeedback"
                  type="text"
                  @blur.native="$v.filterPaymentSentAmountFrom.$touch()"/>
                <b-form-invalid-feedback id="inputLivePaymentSentFromFeedback">
                  <template v-if="$v.filterPaymentSentAmountFrom.$error" class="field__errors">
                    <template v-if="!$v.filterPaymentSentAmountFrom.decimal">Amount should be numeric</template>
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col v-if="filterPaymentSent">
              <b-form-group label-for="payment-sent-to" label="Amount to">
                <b-form-input
                  id="payment-sent-to"
                  :class="{ error: $v.filterPaymentSentAmountTo.$error }"
                  :state="!$v.filterPaymentSentAmountTo.$error"
                  v-model="filterPaymentSentAmountTo"
                  aria-describedby="inputLivePaymentSentToFeedback"
                  type="text"
                  @blur.native="$v.filterPaymentSentAmountTo.$touch()"/>
                <b-form-invalid-feedback id="inputLivePaymentSentToFeedback">
                  <template v-if="$v.filterPaymentSentAmountTo.$error" class="field__errors">
                    <template v-if="!$v.filterPaymentSentAmountTo.decimal">Amount should be numeric</template>
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row v-if="filterPayments" class="mx-1">
            <b-col><b-form-checkbox v-model="filterPaymentCurrency" class="my-2">Currency</b-form-checkbox></b-col>
            <b-col v-if="filterPaymentCurrency">
              <b-form-group label-for="payment-currency-from" label="Currency">
                <b-form-select id="payment-currency-from" v-model="filterPaymentCurrencyType" :options="currencyOptions"/>
              </b-form-group>
            </b-col>
          </b-row>

          <hr class="separator">

          <b-form-checkbox v-model="filterOffers" class="my-2">Offers</b-form-checkbox>
          <b-row v-if="filterOffers">
            <b-col>
              <b-form-group label-for="offer-selling-currency-from" label="Selling currency">
                <b-form-select id="offer-selling-currency-from" v-model="filterSellingCurrencyType" :options="offerCurrencyOptions"/>
              </b-form-group>
            </b-col>
            <b-col v-if="filterSellingCurrencyType === 'OTHER'">
              <b-form-group label-for="offer-selling-currency-asset" label="Asset code">
                <b-form-input
                  id="offer-selling-currency-asset"
                  v-model="filterSellingCurrencyAsset"
                  type="text"/>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row v-if="filterOffers">
            <b-col>
              <b-form-group label-for="offer-buying-currency-from" label="Buying currency">
                <b-form-select id="offer-buying-currency-from" v-model="filterBuyingCurrencyType" :options="offerCurrencyOptions"/>
              </b-form-group>
            </b-col>
            <b-col v-if="filterBuyingCurrencyType === 'OTHER'">
              <b-form-group label-for="offer-buying-currency-asset" label="Asset code">
                <b-form-input
                  id="offer-buying-currency-asset"
                  v-model="filterBuyingCurrencyAsset"
                  type="text"/>
              </b-form-group>
            </b-col>
          </b-row>

          <hr class="separator">
          <b-form-checkbox v-model="filterOther" :indeterminate="filterOtherTypes.length > 0 && filterOtherTypes.length < 5" class="my-2">Other</b-form-checkbox>

          <b-row v-if="filterOther" class="mx-1">
            <b-col>
              <b-form-group>
                <b-form-checkbox-group id="filter-other-types" v-model="filterOtherTypes">
                  <b-form-checkbox value="SET_OPTIONS" class="my-2">Set options</b-form-checkbox>
                  <b-form-checkbox value="TRUST" class="my-2">Trust</b-form-checkbox>
                  <b-form-checkbox value="ACCOUNT_MERGE" class="my-2">Account merge</b-form-checkbox>
                  <b-form-checkbox value="MANAGE_DATA" class="my-2">Manage data</b-form-checkbox>
                  <b-form-checkbox value="BUMP_SEQUENCE" class="my-2">Bump sequence</b-form-checkbox>
                </b-form-checkbox-group>
              </b-form-group>
            </b-col>
          </b-row>
        </template>
      </b-card>
    </b-col>
    <b-col cols="8" xl="8" md="12" class="my-2">
      <b-card class="p-4">
        <h4 class="form-headline text-uppercase text-center">Transactions history</h4>
        <div v-if="inProgress" style="min-height: 208px" class="mb-3 d-flex justify-content-center align-items-center">
          <br><spinner align="center"/><br>
        </div>
        <br>
        <b-table v-if="selectedWallet && tableItems.length > 0" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :items="tableItems" :fields="fields" :sort-compare="sortCompare" class="transaction-table">
          <template v-for="field in fields" slot-scope="row" :slot="field.key">
            <span v-if="field.key === 'date'" :key="field.key" v-html="formatDate(row.item[field.key])"/>
            <span v-else-if="field.key === 'details'" :key="field.key">
              <transaction-details :item="row.item['details']" :selected-wallet="selectedWallet"/>
            </span>
            <strong v-else-if="['currency', 'amount'].includes(field.key)" :key="field.key" v-html="row.item[field.key]"/>
            <span v-else :key="field.key" v-html="row.item[field.key]"/>
          </template>
        </b-table>
        <div v-else-if="selectedWallet && !inProgress && tableItems.length === 0" style="min-height: 208px" class="d-flex justify-content-center align-items-center">
          <p>No transactions found</p>
        </div>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { decimal } from 'vuelidate/lib/validators';

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

      advancedFiltersOpened: false,

      filterMemo: '',
      filterPayments: false,
      filterOffers: false,
      filterOther: false,

      filterOtherTypes: [],

      filterPaymentReceived: false,
      filterPaymentSent: false,
      filterPaymentCurrency: false,

      filterPaymentReceivedAmountFrom: '',
      filterPaymentReceivedAmountTo: '',
      filterPaymentSentAmountFrom: '',
      filterPaymentSentAmountTo: '',
      filterPaymentCurrencyType: null,

      filterSellingCurrencyType: 'ALL',
      filterBuyingCurrencyType: 'ALL',
      filterSellingCurrencyAsset: '',
      filterBuyingCurrencyAsset: '',

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
        if (!this.filterPayments && !this.filterOffers && !this.filterOther) return true;

        switch (op.op_type) {
          case OperationType.CREATE_ACCOUNT:
            if (!this.filterPayments) return false;
            if (this.filterPaymentCurrency && this.filterPaymentCurrencyType !== null && this.filterPaymentCurrencyType !== 'XLM') return false;
            if (!this.filterPaymentReceived && !this.filterPaymentSent) return true;
            if (!this.filterPaymentReceived && op.op_details.account === this.selectedWallet) return false;
            if (this.filterPaymentReceived) {
              if (this.filterPaymentReceivedAmountFrom !== '' && !this.$v.filterPaymentReceivedAmountFrom.$error && parseFloat(op.op_details.starting_balance) < this.filterPaymentReceivedAmountFrom) return false;
              if (this.filterPaymentReceivedAmountTo !== '' && !this.$v.filterPaymentReceivedAmountTo.$error && parseFloat(op.op_details.starting_balance) > this.filterPaymentReceivedAmountTo) return false;
            }
            if (!this.filterPaymentSent && op.op_details.funder === this.selectedWallet) return false;
            if (this.filterPaymentSent) {
              if (this.filterPaymentSentAmountFrom !== '' && !this.$v.filterPaymentSentAmountFrom.$error && parseFloat(op.op_details.starting_balance) < this.filterPaymentSentAmountFrom) return false;
              if (this.filterPaymentSentAmountTo !== '' && !this.$v.filterPaymentSentAmountTo.$error && parseFloat(op.op_details.starting_balance) > this.filterPaymentSentAmountTo) return false;
            }
            break;
          case OperationType.PAYMENT:
          case OperationType.PATH_PAYMENT:
            if (!this.filterPayments) return false;
            if (this.filterPaymentCurrency && this.filterPaymentCurrencyType !== null && this.getCurrency(op) !== this.filterPaymentCurrencyType) return false;
            if (!this.filterPaymentReceived && !this.filterPaymentSent) return true;
            if (!this.filterPaymentReceived && op.op_details.to === this.selectedWallet) return false;
            const amount = parseFloat(op.op_type === OperationType.PATH_PAYMENT && op.op_details.from === this.selectedWallet ? op.op_details.source_amount : op.op_details.amount);
            if (this.filterPaymentReceived) {
              if (this.filterPaymentReceivedAmountFrom !== '' && !this.$v.filterPaymentReceivedAmountFrom.$error && amount < this.filterPaymentReceivedAmountFrom) return false;
              if (this.filterPaymentReceivedAmountTo !== '' && !this.$v.filterPaymentReceivedAmountTo.$error && amount > this.filterPaymentReceivedAmountTo) return false;
            }
            if (!this.filterPaymentSent && op.op_details.from === this.selectedWallet) return false;
            if (this.filterPaymentSent) {
              if (this.filterPaymentSentAmountFrom !== '' && !this.$v.filterPaymentSentAmountFrom.$error && amount < this.filterPaymentSentAmountFrom) return false;
              if (this.filterPaymentSentAmountTo !== '' && !this.$v.filterPaymentSentAmountTo.$error && amount > this.filterPaymentSentAmountTo) return false;
            }
            break;
          case OperationType.MANAGE_OFFER:
          case OperationType.CREATE_PASSIVE_OFFER:
            if (!this.filterOffers) return false;
            const buyingAssetCode = op.op_details.buying_asset_code || 'XLM';
            if (this.filterBuyingCurrencyType === 'OTHER' && buyingAssetCode.indexOf(this.filterBuyingCurrencyAsset) === -1) return false;
            const sellingAssetCode = op.op_details.selling_asset_code || 'XLM';
            if (this.filterSellingCurrencyType === 'OTHER' && sellingAssetCode.indexOf(this.filterSellingCurrencyAsset) === -1) return false;
            break;
          case OperationType.SET_OPTIONS:
            if (!this.filterOther) return false;
            if (this.filterOtherTypes.length > 0 && !this.filterOtherTypes.includes('SET_OPTIONS')) return false;
            break;
          case OperationType.CHANGE_TRUST:
          case OperationType.ALLOW_TRUST:
            if (!this.filterOther) return false;
            if (this.filterOtherTypes.length > 0 && !this.filterOtherTypes.includes('TRUST')) return false;
            break;
          case OperationType.ACCOUNT_MERGE:
            if (!this.filterOther) return false;
            if (this.filterOtherTypes.length > 0 && !this.filterOtherTypes.includes('ACCOUNT_MERGE')) return false;
            break;
          case OperationType.INFLATION:
          case OperationType.MANAGE_DATA:
            if (!this.filterOther) return false;
            if (this.filterOtherTypes.length > 0 && !this.filterOtherTypes.includes('MANAGE_DATA')) return false;
            break;
          case OperationType.BUMP_SEQUENCE:
            if (!this.filterOther) return false;
            if (this.filterOtherTypes.length > 0 && !this.filterOtherTypes.includes('BUMP_SEQUENCE')) return false;
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
        order: item.op_application_order,
      }));
    },

    walletOptions () {
      if (!this.wallets.res) return [];
      let wallets = this.wallets.res.filter(w => w.stellar_data);
      if (wallets.length === 0) {
        wallets = this.wallets.res;
      }
      return wallets.map(w => ({
        value: w.public_key,
        text: w.wallet_name,
      }));
    },

    currentWallet () {
      if (this.selectedWallet) {
        return this.wallets.res.find(w => w.public_key === this.selectedWallet);
      }
      return null;
    },

    currencyOptions () {
      if (!this.currentWallet || !this.currentWallet.stellar_data) return [];
      const balances = this.currentWallet.stellar_data.balances;
      return [{ value: null, text: 'All' }, { value: 'XLM', text: 'XLM' }, ...balances.filter(b => b.asset_code).map(b => ({ value: b.asset_code, text: b.asset_code }))];
    },

    offerCurrencyOptions () {
      return [
        { value: 'ALL', text: 'All' },
        { value: 'OTHER', text: 'Other' },
      ];
    },

    filterPaymentIndeterminate () {
      const sum = this.filterPaymentReceived ? 1 : 0 + this.filterPaymentSent ? 1 : 0 + this.filterPaymentCurrency ? 1 : 0;
      return sum > 0 && sum < 3;
    }
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
    },

    filterPayments (value) {
      if (!value) {
        this.filterPaymentReceived = false;
        this.filterPaymentSent = false;
        this.filterPaymentCurrency = false;
      }
    },
    filterPaymentReceived (value) {
      if (!value) {
        this.filterPaymentReceivedAmountFrom = '';
        this.filterPaymentReceivedAmountTo = '';
      }
    },
    filterPaymentSent (value) {
      if (!value) {
        this.filterPaymentSentAmountFrom = '';
        this.filterPaymentSentAmountTo = '';
      }
    },
    filterPaymentCurrency (value) {
      if (!value) {
        this.filterPaymentCurrencyType = null;
      }
    },
    filterOffers (value) {
      if (!value) {
        this.filterSellingCurrencyType = 'ALL';
        this.filterBuyingCurrencyType = 'ALL';
        this.filterSellingCurrencyAsset = '';
        this.filterBuyingCurrencyAsset = '';
      }
    },
    filterOther (value) {
      if (!value) {
        this.filterOtherTypes = [];
      }
    },
  },

  async created () {
    await this.getWallets();
    if (this.walletOptions.length > 0) {
      this.selectedWallet = this.walletOptions[0].value;
    }
    this.reloadTransactions();
  },

  methods: {
    ...mapActions(['loadTransactions', 'getWallets']),
    sortCompare (a, b, key) {
      if (key === 'date') {
        if (a.date.isSame(b.date)) return a.order < b.order ? -1 : (a.order > b.order ? 1 : 0); // take into consideration operation order when dates are the same
        return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0);
      }
      return null; // use default sort handler for other cases
    },

    getOperationName (item) {
      switch (item.op_type) {
        case OperationType.CREATE_ACCOUNT:
          return item.op_details.funder === this.selectedWallet ? 'payment sent' : 'payment received';
        case OperationType.PAYMENT:
        case OperationType.PATH_PAYMENT:
          return item.op_details.from === this.selectedWallet ? 'payment sent' : 'payment received';
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
      switch (item.op_type) {
        case OperationType.CREATE_ACCOUNT:
          return (item.op_details.funder === this.selectedWallet ? `<span class="text-danger">-${new Amount(item.op_details.starting_balance).format()}</span>` : `<span class="text-success">${new Amount(item.op_details.starting_balance).format()}</span>`);
        case OperationType.PAYMENT:
          return (item.op_details.from === this.selectedWallet ? `<span class="text-danger">-${new Amount(item.op_details.amount).format()}</span>` : `<span class="text-success">${new Amount(item.op_details.amount).format()}</span>`);
        case OperationType.PATH_PAYMENT:
          if (item.op_details.from === this.selectedWallet) return `<span class="text-danger">-${new Amount(item.op_details.source_amount).format()}</span>`; // sending
          return `<span class="text-success">${new Amount(item.op_details.amount).format()}</span>`; // receiving
        case OperationType.MANAGE_OFFER:
          return new Amount(item.op_details.amount).format();
        case OperationType.CREATE_PASSIVE_OFFER:
          return new Amount(item.op_details.amount).format();
      }
      return '-';
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
        case OperationType.ALLOW_TRUST:
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
        return new Amount('0.0000001').multiply(item.tx_fee_paid / item.tx_operation_count + '').format() + '<br>XLM';
      }
      return '0.00<br>XLM';
    },

    formatDate (date) {
      return dayjs(date).format('DD.MM.YYYY<br>hh:mm:ssA');
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
  },

  validations () {
    return {
      filterPaymentReceivedAmountFrom: {
        decimal
      },
      filterPaymentReceivedAmountTo: {
        decimal
      },
      filterPaymentSentAmountFrom: {
        decimal
      },
      filterPaymentSentAmountTo: {
        decimal
      },
    };
  }
};
</script>
