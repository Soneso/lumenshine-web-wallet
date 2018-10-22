<template>
  <b-form @submit.prevent="onSubmitClick">
    <div v-if="!loading && nextPublicKey !== null" class="text-center pb-3">
      <small v-if="hasUnknownError" class="text-danger">Unknown backend error!</small>

      <b-form-group :label-for="`nameInput_${uuid}`" class="normal-input pt-3 col-9 mx-auto">
        <b-form-input
          :id="`nameInput_${uuid}`"
          :class="[{ error: $v.walletName.$error }, 'default-placeholders']"
          :state="!$v.walletName.$error"
          :aria-describedby="`inputLiveAmountHelp_${uuid} inputLiveAmountFeedback_${uuid}`"
          v-model="walletName"
          placeholder="Wallet name"
          type="text"
          required
          @blur="$v.walletName.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveAmountFeedback_${uuid}`">
          <template v-if="$v.walletName.$error" class="field__errors">
            <template v-if="!$v.walletName.required">Wallet name is required</template>
            <template v-if="!$v.walletName.maxLength">Max. 40 characters allowed</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveAmountHelp_${uuid}`">
          New wallet name.
        </b-form-text>
      </b-form-group>

      <p class="pb-4">
        <span class="text-info font-weight-600">Stellar public key</span><br>
        <span>Account ID / Public key</span>
        <br>
        <span v-if="showCopiedText" class="copiedtext info">Copied to clipboard<br></span>
        <b-row align-h="center">
          <span class="col-10 font-weight-600 d-inline-block text-truncate">{{ nextPublicKey }}</span>
          <copy-to-clipboard :text="nextPublicKey"/>
        </b-row>
        <br>
        <input :id="`homeScreenCheckbox_${uuid}`" v-model="homescreen" type="checkbox" class="switch">
        <label :for="`homeScreenCheckbox_${uuid}`">Show wallet on home screen</label>
      </p>
      <b-button class="btn-rounded text-uppercase" @click="onCancelClick">Cancel</b-button>
      <b-button variant="info" class="btn-rounded text-uppercase" @click="onSubmitClick">Add</b-button>
    </div>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required, maxLength } from 'vuelidate/lib/validators';

import copyToClipboard from '@/components/ui/copyToClipboard';

export default {
  name: 'AddWalletForm',
  components: { copyToClipboard },
  mixins: [ formMixin ],
  props: {
    nextPublicKey: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      showCopiedText: false,
      walletName: '',
      homescreen: true,
    };
  },
  methods: {
    onCancelClick () {
      this.$emit('cancel');
    },
    onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { walletName: this.walletName, onHomescreen: this.homescreen };
      this.$emit('submit', this.backendQuery);
    },
    onCopy () {
      this.showCopiedText = true;
    }
  },
  validations () {
    return {
      walletName: {
        required,
        maxLength: maxLength(40),
      }
    };
  }
};
</script>
