<template>
  <b-form class="form" @submit.prevent="onMergeClick">
    <b-row v-if="!result">
      <b-col cols="12">
        <div v-if="hasUnknownError" class="text-danger">An error occured, please try again</div>
      </b-col>

      <b-col cols="12">
        <!--"Merge into Lumenshine wallet" field-->
        <template v-if="availableWallets.length > 0">
          <b-form-group :label-for="`walletInput_${uuid}`" label="Merge Lumenshine wallet:">
            <b-form-select :id="`walletInput_${uuid}`" v-model="selectedWallet" :options="walletOptions" required/>
          </b-form-group>
        </template>
      </b-col>

      <b-col cols="12">
        <b-form-group>
          <b-form-input
            :id="`passwordInput_${uuid}`"
            :class="{ error: $v.password.$error }"
            :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
            :state="!$v.password.$error"
            :type="password2IsHidden ? 'password' : 'text'"
            v-model="password"
            placeholder="Password"
            autocomplete="new-password"
            required
            @blur.native="$v.password.$touch()"/>

          <password-assets :password="['password2IsHidden', password2IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

          <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
            <template v-if="$v.password.$error" class="field-errors">
              <template v-if="!$v.password.required">Password is required! <br></template>
              <template v-if="!$v.password.decryptValid">Invalid password</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
            Your password.
          </b-form-text>
        </b-form-group>
      </b-col>

      <b-col cols="12">
        <b-form-group :label-for="`destinationInput_${uuid}`">
          <b-form-input
            :id="`destinationInput_${uuid}`"
            :class="{ error: $v.destination.$error }"
            :aria-describedby="`inputLiveDestinationHelp_${uuid} inputLiveDestinationFeedback_${uuid}`"
            :state="!$v.destination.$error"
            v-model="destination"
            type="text"
            placeholder="Destination account"
            required
            @blur.native="$v.destination.$touch()"/>
          <b-form-invalid-feedback :id="`inputLiveDestinationFeedback_${uuid}`">
            <template v-if="$v.destination.$error" class="field__errors">
              <template v-if="!$v.destination.publicKeyOrAddress">Invalid destination!</template>
              <template v-if="!$v.destination.required">Wallet destination is required <br></template>
              <template v-if="!$v.destination.noDestination">Cannot find this stellar address!<br></template>
              <template v-if="!$v.destination.validDestination">Invalid destination!</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text :id="`inputLiveDestinationHelp_${uuid}`">
            Public key or stellar address of the account
          </b-form-text>
        </b-form-group>
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
              <template v-else-if="$v.memo.validLength === false">Memo should have a length of 64 characters.</template>
              <template v-else-if="$v.memo.validMemo === false">Invalid memo.</template>
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
import { required } from 'vuelidate/lib/validators';

import Amount from '@/util/Amount';

import formMixin from '@/mixins/form';
import passwordAssets from '@/components/ui/passwordAssets';
import spinner from '@/components/ui/spinner';

import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';
import validators from '@/validators';

export default {
  name: 'CloseWalletForm',
  components: { spinner, passwordAssets },
  mixins: [ formMixin, updatePasswordVisibilityState ],
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
      password2IsHidden: true,
      password: '',
      destination: '',
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
        publicKey: this.availableWallets[this.selectedWallet] ? this.availableWallets[this.selectedWallet].public_key : null,
        destination: this.destination,
        password: this.password,
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
    return {
      memo: {
        ...validators.memo.call(this, this.memoType),
      },
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.errors.find(err => err.error_code === 'WRONG_PASSWORD'),
      },
      destination: {
        required,
        publicKeyOrAddress: value => value === '' || validators.publicKey.call(this).publicKey(value) || validators.federationAddress.call(this).federationAddress(value),
        noDestination: value => this.backendQuery.destination !== value || !this.errors.find(err => err.error_code === 'NO_DESTINATION'),
        validDestination: value => this.backendQuery.destination !== value || !this.errors.find(err => err.error_code === 'INVALID_DESTINATION'),
      },
    };
  }
};
</script>
