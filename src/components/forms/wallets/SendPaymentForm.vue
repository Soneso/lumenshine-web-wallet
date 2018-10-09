<template>
  <form class="form">
    <div v-if="!result">
      <b-form-group :label-for="`assetCodeInput_${uuid}`" label="Currency:">
        <b-form-select :id="`assetCodeInput_${uuid}`" v-model="assetCode" :options="assetCodeOptions" required/>
      </b-form-group>

      <b-form-group v-if="assetCode === '_other'" :label-for="`customAssetCodeInput_${uuid}`" label="Asset code">
        <b-form-input
          :id="`customAssetCodeInput_${uuid}`"
          :class="{ error: $v.customAssetCode.$error }"
          :aria-describedby="`inputAssetCodeHelp_${uuid} inputAssetCodeFeedback_${uuid}`"
          v-model="customAssetCode"
          :state="!$v.customAssetCode.$error"
          type="text"
          placeholder="Asset code"
          tabindex="1"
          required
          @blur="$v.customAssetCode.$touch()"/>
        <b-form-invalid-feedback :id="`inputAssetCodeFeedback_${uuid}`">
          <template v-if="$v.customAssetCode.$error" class="field__errors">
            <template v-if="!$v.customAssetCode.required">Asset code is required!</template>
            <template v-if="!$v.customAssetCode.validAssetCode">Not valid asset code!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputAssetCodeHelp_${uuid}`">
          Your custom asset code.
        </b-form-text>
      </b-form-group>

      <b-form-group v-if="currentAssetCodeBalances.length > 1" :label-for="`issuerInput_${uuid}`" label="Issuer:">
        <b-form-select :id="`issuerInput_${uuid}`" v-model="issuer" :options="issuerOptions" required/>
      </b-form-group>

      <b-form-group :label-for="`recipientInput_${uuid}`" label="Send to">
        <b-form-input
          :id="`recipientInput_${uuid}`"
          :class="{ error: $v.recipient.$error }"
          :aria-describedby="`inputLiveRecipientHelp_${uuid} inputLiveRecipientFeedback_${uuid}`"
          v-model="recipient"
          :state="!$v.recipient.$error"
          type="text"
          placeholder="Recepient's public key or address"
          tabindex="2"
          required
          @blur="$v.recipient.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveRecipientFeedback_${uuid}`">
          <template v-if="$v.recipient.$error" class="field__errors">
            <template v-if="!$v.recipient.required">Recipient is required!</template>
            <template v-if="!$v.recipient.validRecipient">Not valid recipient!</template>
            <template v-if="!$v.recipient.isTrusted">Not trusted asset!</template>
            <template v-if="!$v.recipient.canFund">Cannot fund user with other asset than XLM!</template>
            <template v-if="!$v.recipient.noDestination">Invalid destination!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveRecipientHelp_${uuid}`">
          Your destination.
        </b-form-text>
      </b-form-group>

      <b-form-group :label-for="`amountInput_${uuid}`" label="Send to">
        <b-form-input
          :id="`amountInput_${uuid}`"
          :class="{ error: $v.amount.$error }"
          :aria-describedby="`inputLiveAmountHelp_${uuid} inputLiveAmountFeedback_${uuid}`"
          v-model="amount"
          :state="!$v.amount.$error"
          type="text"
          placeholder="Amount to send"
          tabindex="3"
          required
          @blur="$v.amount.$touch()"/>
        {{ currentAssetCode }}
        <b-form-invalid-feedback :id="`inputLiveAmountFeedback_${uuid}`">
          <template v-if="$v.amount.$error" class="field__errors">
            <template v-if="!$v.amount.required">Amount is required!</template>
            <template v-if="!$v.amount.decimal">Not valid amount!</template>
            <template v-if="!$v.amount.hasEnoughFunds">Not enough funds!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveAmountHelp_${uuid}`">
          Your amount to send.
        </b-form-text>
      </b-form-group>

      <b-form-group :label-for="`memoTypeInput_${uuid}`" label="Memo Type">
        <b-form-select :id="`memoTypeInput_${uuid}`" v-model="memoType" :options="memoTypeOptions"/>
      </b-form-group>

      <b-form-group :label-for="`memoInput_${uuid}`" label="Memo (optional)">
        <b-form-input
          :id="`memoInput_${uuid}`"
          :class="{ error: $v.memo.$error }"
          :placeholder="memoPlaceholder"
          :state="!$v.memo.$error"
          :aria-describedby="`inputLiveMemoHelp_${uuid} inputLiveMemoFeedback_${uuid}`"
          v-model="memo"
          type="text"
          tabindex="4"
          required
          @blur="$v.memo.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveMemoFeedback_${uuid}`">
          <template v-if="$v.memo.$error" class="field__errors">
            <template v-if="!$v.memo.required">Memo is required when sending payments to exchanges.</template>
            <template v-if="!$v.memo.maxLength">Max length is 28 characters!</template>
            <template v-if="$v.memo.validLength === false">Memo should have a length of 64 characters.</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveMemoHelp_${uuid}`">
          Your memo.
        </b-form-text>
      </b-form-group>

      <b-form-group v-if="canSignWithPassword" :label-for="`passwordInput_${uuid}`" label="Password">
        <b-form-input
          :id="`passwordInput_${uuid}`"
          :class="{ error: $v.password.$error }"
          :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
          :state="!$v.password.$error"
          v-model="password"
          type="password"
          placeholder="Your password"
          tabindex="5"
          required
          @blur="$v.password.$touch()"/>
        <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
          <template v-if="$v.password.$error" class="field__errors">
            <template v-if="!$v.password.required">Password is required!</template>
            <template v-if="!$v.password.decryptValid">Wrong password!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
          Your password.
        </b-form-text>
      </b-form-group>

      <b-form-group v-if="!canSignWithPassword" :label-for="`signerInput_${uuid}`" label="Select signer for payment">
        <b-form-select :id="`signerInput_${uuid}`" v-model="signer" :options="signers.map(signer => signer.public_key)" placeholder="Signers"/>
        <b-form-input
          :class="{ error: $v.signerSeed.$error }"
          :aria-describedby="`inputLiveSignerSeedHelp_${uuid} inputLiveSignerSeedFeedback_${uuid}`"
          v-model="signerSeed"
          :state="!$v.signerSeed.$error"
          type="text"
          placeholder="Seed for selected signer"
          tabindex="6"
          required
          @blur="$v.signerSeed.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveSignerSeedFeedback_${uuid}`">
          <template v-if="$v.signerSeed.$error" class="field__errors">
            <template v-if="!$v.signerSeed.required">Secret seed is required!</template>
            <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
          Your secret seed for selected signer.
        </b-form-text>
      </b-form-group>

      <div v-if="errors.find(err => err.error_code === 'SHOULD_FUND')">
        <span class="error">Warning: Recipient account does not exist or is not funded. Send Anyway?</span>
      </div>
      <b-button variant="primary" class="btn-rounded" @click.prevent="onSendClick">
        <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
        <span v-else>Send {{ currentAssetCode }}</span>
      </b-button>
    </div>
    <div v-else-if="result">
      <table>
        <tr>
          <td><strong>Status</strong></td>
          <td><strong>success</strong></td>
        </tr>
        <tr>
          <td><strong>Currency</strong></td>
          <td>{{ assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : customAssetCode || assetCode }}</td>
          <td v-if="currentAssetCodeBalances.length > 1"><strong>Issuer</strong></td>
          <td v-if="currentAssetCodeBalances.length > 1">{{ issuer }}</td>
        </tr>
        <tr>
          <td><strong>Amount</strong></td>
          <td colspan="3">{{ amount }} {{ currentAssetCode }}</td>
        </tr>
        <tr>
          <td><strong>Recepient</strong></td>
          <td colspan="3">{{ recipient }}</td>
        </tr>
        <tr v-if="memo">
          <td><strong>Memo</strong></td>
          <td>{{ memo }}</td>
          <td><strong>Memo type</strong></td>
          <td>{{ memoType }}</td>
        </tr>
        <tr>
          <td><strong>Operation ID</strong></td>
          <td>{{ result.operation.id }}</td>
          <td><strong>Transaction fee</strong></td>
          <td>{{ transactionFee.format() }} XLM</td>
        </tr>
      </table>
      <b-button-group>
        <b-button variant="success" @click.prevent="reset">Send other</b-button>
        <b-button variant="info" @click.prevent="window.print()">Print</b-button>
        <b-button variant="warning" @click.prevent="$emit('close')">Done</b-button>
      </b-button-group>
    </div>
  </form>
</template>

<script>
import { required, decimal, maxLength } from 'vuelidate/lib/validators';

import Amount from '@/util/Amount';

import formMixin from '@/mixins/form';
import validators from '@/validators';

export default {
  mixins: [ formMixin ],
  props: {
    data: {
      type: Object,
      required: true,
    },
    result: {
      type: Object,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    exchanges: {
      type: Object,
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

      signer: null,
      signerSeed: '',

      issuer: '',
      password: '',

      memoTypeOptions: [
        'MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN'
      ]
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
    transactionFee () {
      if (!this.result) return new Amount('0');
      return new Amount(`${this.result.transaction.fee_paid}`).divide('10000000');
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
    },
    signers () {
      if (!this.data.stellar_data) return [];
      const stellarData = this.data.stellar_data;
      const threshold = stellarData.thresholds.med_threshold;
      return stellarData.signers.filter(signer => signer.weight >= threshold);
    },
    canSignWithPassword () {
      return !!this.signers.find(signer => signer.public_key === this.data.public_key_0);
    },
    assetCodeOptions () {
      return [
        ...this.uniqueCurrencies.map(assetCode => ({ text: assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : assetCode, value: assetCode })),
        { text: 'Other', value: '_other' },
      ];
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
    },
    recipient (recipient) {
      if (!this.exchanges[recipient] || !this.exchanges[recipient].memo) {
        return;
      }
      const memo = this.exchanges[recipient].memo;
      this.memoType = memo;
    },
    memo (val) {
      if (this.memoType === 'MEMO_ID' && val.match(/[a-z]/ig)) {
        this.memoType = 'MEMO_TEXT';
      }
    },
    data () {
      if (!this.canSignWithPassword) {
        this.signer = this.signers[0] ? this.signers[0].public_key : null;
      }
    }
  },
  created () {
    if (!this.canSignWithPassword) {
      this.signer = this.signers[0] ? this.signers[0].public_key : null;
    }
  },
  methods: {
    async reset () {
      this.$v.$reset();
      this.$emit('reset');
      const data = {
        showCopiedText: false,
        assetCode: 'XLM',
        customAssetCode: '',
        recipient: '',
        memo: '',
        memoType: 'MEMO_TEXT',
        amount: '',
        issuer: '',
        password: '',
        signer: null,
        signerSeed: '',
      };
      Object.keys(data).forEach(d => { this[d] = data[d]; });
    },
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
        shouldFund: !!this.errors.find(err => err.error_code === 'SHOULD_FUND'),
        ...(this.canSignWithPassword ? {
          password: this.password,
        } : {
          signer: this.signer,
          signerSeed: this.signerSeed,
        }),
      };
      this.backendQuery = data;

      this.$emit('submit', data);
    }
  },
  validations () {
    const isExchange = !!this.exchanges[this.recipient];
    let memoValidators = isExchange ? { required } : {};
    switch (this.memoType) {
      case 'MEMO_TEXT':
        memoValidators = { ...memoValidators, maxLength: maxLength(28) };
        break;
      case 'MEMO_ID':
        memoValidators = { ...memoValidators, maxLength: maxLength(28) };
        break;
      case 'MEMO_HASH':
      case 'MEMO_RETURN':
        memoValidators = { ...memoValidators, validLength: val => val.length === 64 };
        break;
    }

    const customAssetCodeValidators = this.assetCode === '_other' ? { required, ...validators.assetCode.call(this) } : {};

    const signerValidators = this.canSignWithPassword ? {
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.errors.find(err => err.error_code === 'WRONG_PASSWORD'),
      },
    } : {
      signerSeed: {
        required,
        ...validators.secretSeed.call(this),
      },
    };

    return {
      recipient: {
        required,
        validRecipient: value => validators.publicKey.call(this).publicKey(value) || validators.federationAddress.call(this).federationAddress(value),
        isTrusted: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'NOT_TRUSTED'),
        canFund: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'CANNOT_FUND'),
        noDestination: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'NO_DESTINATION'),
      },
      customAssetCode: {
        ...customAssetCodeValidators,
      },
      memo: {
        ...memoValidators
      },
      ...signerValidators,
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
