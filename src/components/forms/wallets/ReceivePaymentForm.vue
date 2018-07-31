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
            <span v-if="data.stellar_data.balances.length < 2">Stellar Lumens (XLM)</span>
            <select v-else v-model="assetCode">
              <option v-for="balance in data.stellar_data.balances" :key="balance.asset_code" :value="balance.asset_code || 'XLM'">{{ balance.asset_code || 'Stellar Lumens (XLM)' }}</option>
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
      config,
    };
  },
  computed: {
    emailBody () {
      return `QR code\nPublic key: ${this.data.public_key_0}\nCurrency: ${this.assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : this.assetCode}\nAmount: ${this.amount}`;
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

<style lang="scss" scoped>
@import "assets/scss/variables";
.form {
  text-align: left;
  display: flex;
  justify-content: space-between;
  word-break: break-all;
  @include breakpoint(tablet) {
    flex-direction: column;
    text-align: center;
  }
}
.column {
  &--left {
    width: 26%;
    @include breakpoint(tablet) {
      width: 100%;
    }
  }
  &--right {
    width: 70%;
    @include breakpoint(tablet) {
      width: 100%;
    }
  }
  img {
    max-width: 100%;
  }
}
table {
  width: 100%;
  td {
    font-weight: bold;
  }
}
</style>
