<template>
  <b-form @submit.prevent="onSubmitClick">
    <div class="text-center pb-3">
      <small v-if="hasUnknownError" class="text-danger">Unknown backend error!</small>

      <b-form-group :label-for="`nameInput_${uuid}`" class="normal-input pt-3 col-9 mx-auto">
        <b-form-input
          :id="`nameInput_${uuid}`"
          :class="[{ error: $v.walletName.$error }, 'default-placeholders']"
          :state="!$v.walletName.$error"
          :aria-describedby="`inputLiveWalletNameHelp_${uuid} inputLiveWalletNameFeedback_${uuid}`"
          v-model="walletName"
          placeholder="Wallet name"
          type="text"
          required
          @blur.native="$v.walletName.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveWalletNameFeedback_${uuid}`">
          <template v-if="$v.walletName.$error" class="field__errors">
            <template v-if="!$v.walletName.required">Wallet name is required</template>
            <template v-if="!$v.walletName.maxLength">Max. 40 characters allowed</template>
            <template v-if="!$v.walletName.uniqueName">This name is already used</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveWalletNameHelp_${uuid}`">
          New wallet name.
        </b-form-text>
      </b-form-group>

      <p class="pb-4">
        <span class="text-info font-weight-600">Stellar public key</span><br>
        <span>Account ID / Public key</span>
        <br>
        <template v-if="nextPublicKey !== null">
          <span v-if="showCopiedText" class="copiedtext info">Copied to clipboard<br></span>
          <b-row align-h="center">
            <span class="col-10 font-weight-600 d-inline-block break-word with-hyphens">{{ nextPublicKey }}</span>
            <copy-to-clipboard :text="nextPublicKey"/>
          </b-row>
        </template>
        <spinner v-else class="my-3" inline/>
        <br>
        <input :id="`homeScreenCheckbox_${uuid}`" v-model="homescreen" type="checkbox" class="switch">
        <label :for="`homeScreenCheckbox_${uuid}`">Show wallet on home screen</label>
      </p>

      <template v-if="!loading">
        <b-button class="btn-rounded text-uppercase" @click="onCancelClick">Cancel</b-button>
        <b-button :disabled="nextPublicKey === null" variant="info" class="btn-rounded text-uppercase" @click="onSubmitClick">Add</b-button>
      </template>
      <b-row v-else align-h="center">
        <spinner width="140" message="Adding wallet..."/>
      </b-row>
    </div>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required, maxLength } from 'vuelidate/lib/validators';

import copyToClipboard from '@/components/ui/copyToClipboard';
import spinner from '@/components/ui/spinner';

export default {
  name: 'AddWalletForm',
  components: { copyToClipboard, spinner },
  mixins: [ formMixin ],

  props: {
    nextPublicKey: {
      type: String,
      default: null,
    },
    visible: {
      type: Boolean,
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

  watch: {
    visible (val) {
      if (!val) {
        this.walletName = '';
        this.homescreen = true;
        this.showCopiedText = false;
        this.backendQuery = {};
        this.$v.$reset();
      }
    }
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
        uniqueName: value => this.backendQuery.walletName !== value || !this.errors.find(err => err.error_code === 1000 && err.parameter_name === 'wallet_name'),
      }
    };
  }
};
</script>
