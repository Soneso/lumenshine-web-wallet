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
        <span class="warning">{{ data.federation_address }}{{ config.FEDERATION_DOMAIN }}</span>
      </p>
      <table>
        <tr>
          <td>Currency</td>
          <td>
            <span v-if="uniqueCurrencies.length < 2">Stellar Lumens (XLM)</span>
            <select v-else v-model="assetCode">
              <option v-for="assetCode in uniqueCurrencies" :key="assetCode" :value="assetCode">{{ assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : assetCode }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="currentAssetCodeBalances.length > 1">
          <td>Issuer</td>
          <td>
            <select v-model="issuer">
              <option v-for="bal in currentAssetCodeBalances" :key="bal.asset_issuer" :value="bal.asset_issuer">{{ bal.asset_issuer }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>{{ assetCode }}</td>
          <td><input :class="{ error: $v.amount.$error }" v-model="amount" placeholder="Amount to receive" @blur="$v.amount.$touch()"></td>
        </tr>
      </table>
      <a :href="`mailto:?subject=${encodeURIComponent('Payment data')}&body=${encodeURIComponent(emailBody)}`" class="button" target="_blank" @click="onSendEmailClick">Send by email</a>
      <button @click.prevent="onPrintClick">Print</button>
      <button @click.prevent="onDoneClick">Done</button>
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
        e.preventDefault();
      }
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
