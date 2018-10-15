<template>
  <b-form class="form">
    <b-row align-h="center">
      <b-col cols="10">
        <div class="text-center pt-2">
          <img class="bar-code-img" src="@/assets/qr.svg">
          <br>
          <div :class="['pt-3', {'pb-4': data.federation_address}]">
            <span class="font-weight-600">Receive public key</span>
            <br>
            <small class="break-word with-hyphens">{{ data.public_key_0 }}</small>
            <a v-clipboard:copy="data.public_key_0" v-clipboard:success="onCopy" class="wallet-link"> <i class="icon-copy text-info"/> </a>
            <small v-if="showCopiedText" class="text-info"><br>Copied to clipboard<br></small>
          </div>

          <div v-if="!data.federation_address" class="pt-3">
            <div class="font-weight-600">Stellar address</div>
            <small class="pb-4 text-warning d-block">{{ data.federation_address }}dskjlsdjkldskljdsklj sd sdljk</small>
          </div>
        </div>

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
            :aria-describedby="`inputAmountFeedback_${uuid}`"
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
        </b-form-group>

        <div class="text-center py-4">
          <b-button-group size="sm">
            <b-button variant="success" class="text-uppercase" @click="onSendEmailClick">Send by email</b-button>
            <b-button variant="warning" class="text-uppercase" @click="onPrintClick">Print</b-button>
            <b-button variant="info" class="text-uppercase" @click="onDoneClick">Done</b-button>
          </b-button-group>
        </div>
      </b-col>
    </b-row>
  </b-form>
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
