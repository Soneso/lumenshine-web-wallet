<template>
  <b-form class="form" @submit.prevent="onMergeClick">
    <b-row v-if="!result">
      <b-col cols="12 pb-4 mb-3">
        <div v-if="hasUnknownError" class="text-danger">An error occured, please try again</div>
      </b-col>

      <b-col cols="12">
        <p>Here you can merge an external Stellar account into a funded Lumenshine wallet. Your external account must not trust other currencies than Stellar Lumens and it must have no data entries.</p>
      </b-col>

      <b-col cols="12">
        <!--"Secret seed of the account to merge" field-->
        <b-form-group>
          <b-form-input
            :class="{ error: $v.secretSeed.$error }"
            v-model="secretSeed"
            :state="!$v.secretSeed.$error"
            placeholder="Secret seed of the account to merge"
            aria-describedby="inputLiveSecretSeedHelp inputLiveSecretSeedFeedback"
            required
            @blur.native="$v.secretSeed.$touch()"/>

          <b-form-invalid-feedback id="inputLiveSecretSeedFeedback">
            <template v-if="$v.secretSeed.$error" class="field-errors">
              <template v-if="!$v.secretSeed.required">Secret seed is required! <br></template>
              <template v-else-if="!$v.secretSeed.secretSeed">Invalid secret seed!</template>
              <template v-else-if="!$v.secretSeed.hasAccount">Account does not exist.</template>
              <template v-else-if="!$v.secretSeed.hasNoTrustlines && !$v.secretSeed.hasNoData">Account has trustlines and data entries. Remove and try again.</template>
              <template v-else-if="!$v.secretSeed.hasNoTrustlines">Account has trustlines to other currencies than Stellar Lumens. Remove and try again.</template>
              <template v-else-if="!$v.secretSeed.hasNoData">Account has data entries. Remove and try again.</template>
              <template v-else-if="!$v.secretSeed.hasFunds">Account has not enough funds for the transaction.</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLiveSecretSeedHelp">
            Secret seed of the account to merge
          </b-form-text>
        </b-form-group>
      </b-col>

      <b-col cols="12">
        <!--"Merge into Lumenshine wallet" field-->
        <template v-if="availableWallets.length > 0">
          <b-form-group :label-for="`walletInput_${uuid}`" label="Wallet:">
            <b-form-select :id="`walletInput_${uuid}`" v-model="selectedWallet" :options="walletOptions" required/>
          </b-form-group>
        </template>
      </b-col>

      <b-col cols="12">
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
            @blur.native="$v.memo.$touch()"/>
          <b-form-invalid-feedback :id="`inputLiveMemoFeedback_${uuid}`">
            <template v-if="$v.memo.$error" class="field__errors">
              <template v-if="$v.memo.maxLength === false">Max length is 28 characters!</template>
              <template v-if="$v.memo.validLength === false">Memo should have a length of 64 characters.</template>
            </template>
          </b-form-invalid-feedback>
        </b-form-group>
      </b-col>

      <b-col class="text-center pt-4">
        <b-button variant="success" class="btn-rounded text-uppercase" @click.prevent="onMergeClick">
          <spinner v-if="loading" :size="21" message="Merging..." variant="white" width="130"/>
          <span v-else>Merge</span>
        </b-button>
      </b-col>
    </b-row>
    <b-row v-else> <!-- on tx result -->
      <b-col cols="12">
        <br>
        <p><strong>Account merge</strong></p>
        <p class="small">
          <strong>Status: </strong><strong class="text-success text-uppercase">success</strong><br>
        </p>
        <p v-if="memo" class="small">
          <strong>Memo: {{ memo }}</strong><br>
          <strong>Memo Type: {{ memoType }}</strong>
        </p>
        <p class="small">
          <strong>Operation ID: {{ transaction ? transaction.operation.id : '' }}</strong><br>
          <strong>Transaction fee: {{ transactionFee.format() }} XLM</strong>
        </p>
        <div class="text-center py-4">
          <b-button variant="success" class="text-uppercase btn-rounded" @click.prevent="onDoneClick">Done</b-button>
        </div>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import { maxLength, required } from 'vuelidate/lib/validators';

import Amount from '@/util/Amount';

import formMixin from '@/mixins/form';
import spinner from '@/components/ui/spinner';

import validators from '@/validators';

export default {
  name: 'MergeExternalAccountForm',
  components: { spinner },
  mixins: [ formMixin ],
  props: {
    result: {
      type: Object,
      default: null,
    },
    transaction: {
      type: Object,
      default: null,
    },
    availableWallets: {
      type: Array,
      required: true,
    },
  },

  data () {
    return {
      secretSeed: '',
      selectedWallet: 0,
      memo: '',
      memoType: 'MEMO_TEXT',
    };
  },

  computed: {
    walletOptions () {
      return this.availableWallets.map((wallet, key) => ({ value: key, text: wallet.wallet_name }));
    },
    transactionFee () {
      if (!this.transaction) return new Amount('0');
      return new Amount(`${this.transaction.fee_paid}`).divide('10000000');
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
  },

  created () {
    this.memoTypeOptions = [
      'MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN'
    ];
  },

  methods: {
    onMergeClick () {
      this.$emit('clear');
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = {
        secretSeed: this.secretSeed,
        destination: this.availableWallets[this.selectedWallet] ? this.availableWallets[this.selectedWallet].public_key : null,
        memo: this.memo,
        memoType: this.memoType,
      };
      this.$emit('submit', this.backendQuery);
    },
    onDoneClick () {
      this.$router.push({ name: 'Dashboard' });
    },
  },

  validations () {
    let memoValidators = { };
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
    return {
      memo: {
        ...memoValidators,
      },
      secretSeed: {
        required,
        ...validators.secretSeed.call(this),
        hasAccount: value => !this.errors.find(err => err.error_code === 'NO_SOURCE_ACCOUNT'),
        hasNoTrustlines: value => !this.errors.find(err => err.error_code === 'HAS_TRUSTLINES'),
        hasNoData: value => !this.errors.find(err => err.error_code === 'HAS_DATA'),
        hasFunds: value => !this.errors.find(err => err.error_code === 'UNDERFUNDED'),
      },
    };
  }
};
</script>
