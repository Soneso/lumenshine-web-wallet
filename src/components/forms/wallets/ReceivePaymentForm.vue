<template>
  <form class="form">
    <div class="column column--left">
      <strong>QR-Code</strong><br>
      <p><img src="@/assets/qr.svg"></p>
    </div>
    <div class="column column--right">
      <strong>Receive public key</strong>
      <a
        v-clipboard:copy="data.public_key_0"
        v-clipboard:success="onCopy"
        class="wallet-link">
        <i class="fa fa-clone"/>
      </a>
      <p>
        <span v-if="showCopiedText" class="copiedtext info">Copied to clipboard<br></span>
        {{ data.public_key_0 }}
      </p>
      <p v-if="data.federation_address">
        <strong>Stellar address</strong>
        <br>
        <span class="warning">{{ data.federation_address }}</span>
      </p>

      <b-form-group :label-for="`currencyInput_${uuid}`" label="Currency">
        <span v-if="uniqueCurrencies.length < 2">Stellar Lumens (XLM)</span>
        <b-form-select v-else :id="`currencyInput_${uuid}`" v-model="assetCode" :options="currencyOptions"/>
      </b-form-group>

      <b-form-group v-if="currentAssetCodeBalances.length > 1" :label-for="`issuerInput_${uuid}`" label="Issuer">
        <b-form-select :id="`issuerInput_${uuid}`" v-model="issuer" :options="issuerOptions"/>
      </b-form-group>

      <b-form-group :label-for="`amountInput_${uuid}`">
        {{ assetCode }}
        <b-form-input
          :id="`amountInput_${uuid}`"
          :class="{ error: $v.amount.$error }"
          :state="!$v.amount.$error"
          :aria-describedby="`inputAmountHelp_${uuid} inputAmountFeedback_${uuid}`"
          v-model="amount"
          placeholder="Amount to receive"
          type="text"
          required
          @blur="$v.amount.$touch()"/>
        <b-form-invalid-feedback :id="`inputAmountFeedback_${uuid}`">
          <template v-if="$v.amount.$error" class="field__errors">
            <template v-if="!$v.amount.required">Amount is required</template>
            <template v-if="!$v.amount.decimal">Amount should be numeric!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputAmountHelp_${uuid}`">
          Amount to receive.
        </b-form-text>
      </b-form-group>

      <b-button-group>
        <b-button variant="success" @click="onSendEmailClick">Send by email</b-button>
        <b-button variant="info" @click="onPrintClick">Print</b-button>
        <b-button variant="warning" @click="onDoneClick">Done</b-button>
      </b-button-group>
    </div>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import config from '@/config';

import { required, decimal } from 'vuelidate/lib/validators';

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
    };
  },
  computed: {
    emailBody () {
      return `QR code\n
      Public key: ${this.data.public_key_0}\n
      Currency: ${this.assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : this.assetCode}\n
      Issuer: ${this.issuer}\n
      Amount: ${this.amount}`;
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
    }
  },
  watch: {
    assetCode (val) {
      if (!this.data.stellar_data) return;
      const balance = this.data.stellar_data.balances.find(b => b.asset_code === val);
      this.issuer = balance ? balance.asset_issuer : '';
    }
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
    return {
      amount: {
        required,
        decimal,
      }
    };
  }
};
</script>
