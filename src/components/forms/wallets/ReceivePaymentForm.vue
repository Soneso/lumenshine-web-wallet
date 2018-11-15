<template>
  <b-form class="form">
    <b-row align-h="center">
      <b-col cols="10">
        <div class="text-center pt-2">
          <qrcode :options="{ width: 200, margin: 0, color: { light: '#F4F6F2', dark: $v.$invalid ? '#ED1C24' : '#000000' } }" :value="qrData"/>
          <small v-if="$v.amount.$error" class="d-block text-danger text-center pb-2">Invalid amount!</small>
          <small v-if="$v.memo.$error" class="d-block text-danger text-center pb-2">Invalid memo!</small>
          <br>
          <div class="pt-3">
            <span class="font-weight-600">Receive public key</span>
            <br>
            <small class="break-word with-hyphens font-weight-bold">{{ data.public_key.slice(0, 20) }}...</small>
            <a v-clipboard:copy="data.public_key" v-clipboard:success="onCopy" class="wallet-link">
              <i class="icon-copy text-info"/>
            </a>
            <small v-if="showCopiedText" class="text-info"><br>Copied to clipboard<br></small>
          </div>

          <div v-if="data.federation_address" class="pt-4">
            <div class="font-weight-600">Stellar address</div>
            <small class="pb-3 text-warning d-block">{{ data.federation_address }}</small>
          </div>
        </div>

        <b-form-group :label-for="`currencyInput_${uuid}`" label="Currency">
          <div v-if="uniqueCurrencies.length < 2" class="blind-field">Stellar Lumens (XLM)</div>
          <b-form-select v-else :id="`currencyInput_${uuid}`" v-model="assetCode" :options="currencyOptions" :class="{'disabled': currencyOptions.length < 2}"/>
        </b-form-group>

        <b-form-group v-if="currentAssetCodeBalances.length > 1" :label-for="`issuerInput_${uuid}`" label="Issuer">
          <b-form-select :id="`issuerInput_${uuid}`" v-model="issuer" :options="issuerOptions" :class="{'disabled': issuerOptions.length < 2}"/>
        </b-form-group>

        <b-form-group :label-for="`amountInput_${uuid}`">
          <label :for="`amountInput_${uuid}`" class="col-form-label">{{ assetCode }}</label>
          <b-form-input
            :id="`amountInput_${uuid}`"
            :class="{ error: $v.amount.$error }"
            :state="!$v.amount.$error"
            :aria-describedby="`inputAmountFeedback_${uuid}`"
            v-model="amount"
            placeholder="Amount to receive"
            type="text"
            required
            @input.native="$v.amount.$touch()"/>
          <b-form-invalid-feedback :id="`inputAmountFeedback_${uuid}`">
            <template v-if="$v.amount.$error" class="field__errors">
              <template v-if="!$v.amount.required">Amount is required</template>
              <template v-if="!$v.amount.decimal">Amount should be numeric!</template>
            </template>
          </b-form-invalid-feedback>
        </b-form-group>

        <hr class="divider">

        <b-form-group :label-for="`memoTypeInput_${uuid}`" label="Memo (optional)">
          <b-form-select :id="`memoTypeInput_${uuid}`" v-model="memoType" :options="memoTypeOptions"/>
        </b-form-group>

        <b-form-group :label-for="`memoInput_${uuid}`">
          <b-form-input
            :id="`memoInput_${uuid}`"
            :class="{ error: $v.memo.$error }"
            :placeholder="memoPlaceholder"
            :state="!$v.memo.$error"
            :aria-describedby="`inputLiveMemoFeedback_${uuid}`"
            v-model="memo"
            type="text"
            required
            @input.native="$v.memo.$touch()"/>
          <b-form-invalid-feedback :id="`inputLiveMemoFeedback_${uuid}`">
            <template v-if="$v.memo.$error" class="field__errors">
              <template v-if="$v.memo.required === false">Memo is required when sending payments to exchanges.</template>
              <template v-if="$v.memo.maxLength === false">Max length is 28 characters!</template>
              <template v-if="$v.memo.validLength === false">Memo should have a length of 64 characters.</template>
            </template>
          </b-form-invalid-feedback>
        </b-form-group>

        <hr class="divider">

        <div class="text-center py-4">
          <b-button-group size="sm">
            <b-button :disabled="$v.$invalid" variant="success" class="text-uppercase" @click="onSendEmailClick">Send by email</b-button>
            <b-button :disabled="$v.$invalid" variant="warning" class="text-uppercase" @click="onPrintClick">Print</b-button>
            <b-button variant="info" class="text-uppercase" @click="onDoneClick">Done</b-button>
          </b-button-group>
        </div>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import StellarSdk from 'stellar-sdk';
import formMixin from '@/mixins/form';

import config from '@/config';

import { required, decimal, maxLength } from 'vuelidate/lib/validators';

export default {
  mixins: [formMixin],
  props: {
    data: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      showCopiedText: false,
      amount: '',
      assetCode: 'XLM',
      issuer: '',
      config,

      memo: '',
      memoType: 'MEMO_TEXT',
      memoTypeOptions: [
        'MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN'
      ],
    };
  },
  computed: {
    emailBody () {
      return `Public key: ${this.data.public_key}\n
      Currency: ${this.assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : this.assetCode}\n
      Issuer: ${this.issuer}\n
      Amount: ${this.amount}\n
      Memo type: ${this.memoType}\n
      Memo: ${this.memo}`;
    },
    uniqueCurrencies () {
      if (!this.data.stellar_data) return [];
      const obj = {};
      this.data.stellar_data.balances.forEach(bal => {
        obj[bal.asset_code || 'XLM'] = true;
      });
      return Object.keys(obj);
    },
    currentAssetCodeBalances () {
      if (!this.data.stellar_data) return [];
      return this.data.stellar_data.balances.filter(b => b.asset_code === this.assetCode);
    },
    currencyOptions () {
      return this.uniqueCurrencies.map(assetCode => ({
        text: assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : assetCode,
        value: assetCode,
      }));
    },
    issuerOptions () {
      return this.currentAssetCodeBalances.map(bal => bal.asset_issuer);
    },
    memoPlaceholder () {
      switch (this.memoType) {
        case 'MEMO_TEXT':
          return 'Up to 28 characters';
        case 'MEMO_ID':
          return 'Enter memo ID number';
        case 'MEMO_HASH':
        case 'MEMO_RETURN':
          return 'Enter 64 characters encoded string';
      }
      return '';
    },
    qrData () {
      const networkCode = StellarSdk.Network.current().networkId().toString('hex').slice(0, 8);
      const data = JSON.stringify({
        stellar: {
          payment: {
            destination: this.data.public_key,
            ...(networkCode === '7ac33997' ? {} : { network: networkCode }), // only needed if not on live network
            amount: this.amount + '' || '0',
            ...(this.assetCode === 'XLM' ? {} : { asset: {
              code: this.assetCode,
              issuer: this.issuer,
            } }),
            ...(this.memo === '' ? {} : { memo: {
              type: this.memoType,
              value: this.memo,
            } }),
          },
        },
      });
      return data;
    }
  },
  watch: {
    assetCode (val) {
      if (!this.data.stellar_data) return;
      const balance = this.data.stellar_data.balances.find(b => b.asset_code === val);
      this.issuer = balance ? balance.asset_issuer : '';
    },
    memo (val) {
      if (this.memoType === 'MEMO_ID' && val.match(/[a-z]/ig)) {
        this.memoType = 'MEMO_TEXT';
      }
    },
  },
  methods: {
    onDoneClick () {
      this.$emit('cancel');
    },
    onSendEmailClick (e) {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      const win = window.open(`mailto:?subject=${encodeURIComponent('Payment data')}&body=${encodeURIComponent(this.emailBody)}`, '_blank');
      win.focus();
    },
    onPrintClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      window.print();
    },
    onCopy () {
      this.showCopiedText = true;
    }
  },
  validations () {
    let memoValidators = {};
    switch (this.memoType) {
      case 'MEMO_TEXT':
        memoValidators = { maxLength: maxLength(28) };
        break;
      case 'MEMO_ID':
        memoValidators = { maxLength: maxLength(28) };
        break;
      case 'MEMO_HASH':
      case 'MEMO_RETURN':
        memoValidators = { validLength: val => val.length === 64 };
        break;
    }
    return {
      amount: {
        required,
        decimal,
      },
      memo: {
        ...memoValidators
      },
    };
  }
};
</script>
