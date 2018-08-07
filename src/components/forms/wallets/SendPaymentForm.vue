<template>
  <form class="form">
    <table v-if="!loading">
      <tr>
        <td>Currency</td>
        <td>
          <!-- <span v-if="data.stellar_data.balances.length < 2">Stellar Lumens (XLM)</span> -->
          <select v-model="assetCode">
            <option v-for="assetCode in uniqueCurrencies" :key="assetCode" :value="assetCode">{{ assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : assetCode }}</option>
            <option value="_other">Other</option>
          </select>
        </td>
      </tr>
      <tr v-if="assetCode === '_other'">
        <td>Asset code</td>
        <td>
          <div v-if="$v.customAssetCode.$error" class="field__errors">
            <div v-if="!$v.customAssetCode.required">Asset code is required!</div>
            <div v-if="!$v.customAssetCode.validAssetCode">Not valid asset code!</div>
          </div>
          <input :class="{ error: $v.customAssetCode.$error }" v-model="customAssetCode" style="width:100%" placeholder="Asset code" @blur="$v.customAssetCode.$touch()">
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
        <td>Send to</td>
        <td>
          <div v-if="$v.recipient.$error" class="field__errors">
            <div v-if="!$v.recipient.required">Recipient is required!</div>
            <div v-if="!$v.recipient.publicKey">Not valid recipient!</div>
            <div v-if="!$v.recipient.isTrusted">Not trusted asset!</div>
            <div v-if="!$v.recipient.canFund">Cannot fund user with other asset than XLM!</div>
          </div>
          <input :class="{ error: $v.recipient.$error }" v-model="recipient" style="width:100%" placeholder="Recepient's public key or address" @blur="$v.recipient.$touch()">
          <i class="fa fa-question-circle-o"/>
        </td>
      </tr>
      <tr>
        <td>Amount</td>
        <td>
          <div v-if="$v.amount.$error" class="field__errors">
            <div v-if="!$v.amount.required">Amount is required!</div>
            <div v-if="!$v.amount.decimal">Not valid amount!</div>
            <div v-if="!$v.amount.hasEnoughFunds">Not enough funds!</div>
          </div>
          <input :class="{ error: $v.amount.$error }" v-model="amount" placeholder="Amount to send" @blur="$v.amount.$touch()"> {{ currentAssetCode }}
        </td>
      </tr>
      <tr>
        <td>Memo (optional)</td>
        <td>
          <select v-model="memoType">
            <option value="MEMO_TEXT">MEMO_TEXT</option>
            <option value="MEMO_ID">MEMO_ID</option>
            <option value="MEMO_HASH">MEMO_HASH</option>
            <option value="MEMO_RETURN">MEMO_RETURN</option>
          </select>
          <div v-if="$v.memo.$error" class="field__errors">
            <div v-if="!$v.memo.maxLength">Max length is 28 characters!</div>
            <div v-if="!$v.memo.validLength">Memo should have length of 64 characters.</div>
          </div>
          <input :class="{ error: $v.memo.$error }" v-model="memo" :placeholder="memoPlaceholder" @blur="$v.memo.$touch()">
        </td>
      </tr>
      <tr>
        <td>Password</td>
        <td>
          <div v-if="$v.password.$error" class="field__errors">
            <div v-if="!$v.password.required">Password is required!</div>
            <div v-if="!$v.password.minLength">Password should be longer than 9 characters!</div>
            <div v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
            <div v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
            <div v-if="!$v.password.hasNumber">Password should contain at least one number!</div>
            <div v-if="!$v.password.decryptValid">Wrong password!</div>
          </div>
          <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Your password" @blur="$v.password.$touch()">
        </td>
      </tr>
    </table>
    <div v-if="errors.find(err => err.error_code === 'SHOULD_FUND')">
      <span class="error">Warning: Recipient account does not exist or is not funded. Send Anyway:</span>
    </div>
    <button @click.prevent="onSendClick">
      <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
      <span v-else>Send {{ currentAssetCode }}</span>
    </button>
  </form>
</template>

<script>
import { required, decimal, maxLength } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';
import validators from '@/validators';

export default {
  mixins: [ formMixin ],
  props: {
    data: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    }
  },
  data () {
    return {
      showCopiedText: false,
      assetCode: 'XLM',
      customAssetCode: '',
      recipient: '',
      memo: '',
      memoType: 'MEMO_TEXT',
      amount: '',
      issuer: '',
      password: '',
    };
  },
  computed: {
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
    currentAssetCode () {
      return this.assetCode === '_other' ? this.customAssetCode : this.assetCode;
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
    onSendClick () {
      this.$v.$touch();
      if (this.$v.$invalid || this.loading) {
        return;
      }
      const data = {
        recipient: this.recipient,
        assetCode: this.assetCode,
        customAssetCode: this.customAssetCode,
        issuer: this.issuer,
        memo: this.memo,
        memoType: this.memoType,
        amount: this.amount,
        password: this.password,
        shouldFund: !!this.errors.find(err => err.error_code === 'SHOULD_FUND')
      };
      this.backendQuery = data;

      this.$emit('submit', data);
    }
  },
  validations () {
    let memoValidators;
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
    }

    const customAssetCodeValidators = this.assetCode === '_other' ? { required, ...validators.assetCode.call(this) } : {};

    return {
      recipient: {
        required,
        ...validators.publicKey.call(this),
        isTrusted: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'NOT_TRUSTED'),
        canFund: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'CANNOT_FUND'),
      },
      customAssetCode: {
        ...customAssetCodeValidators,
      },
      memo: {
        ...memoValidators
      },
      password: {
        required,
        ...validators.password.call(this),
        decryptValid: value => this.backendQuery.password !== value || !this.errors.find(err => err.error_code === 'WRONG_PASSWORD'),
      },
      amount: {
        required,
        decimal,
        hasEnoughFunds: value => this.backendQuery.amount !== value || !this.errors.find(err => err.error_code === 'UNDERFUNDED'),
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.form {
  table {
    width: 100%;
  }
  input, select {
    width: auto;
  }
}
</style>
