<template>
  <b-form @submit.prevent="onSubmitClick">
    <div class="text-center pb-3">
      <small v-if="hasUnknownError" class="text-danger">An error occured, please try again</small>

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

      <p>
        <span class="text-info font-weight-600">Stellar public key</span><br>
        <span>Account ID / Public key</span>
        <br>
        <template v-if="nextPublicKey !== null">
          <span v-if="showCopiedText" class="copiedtext info">Copied to clipboard<br></span>
          <b-row align-h="center">
            <public-key :text="nextPublicKey"/>
          </b-row>
        </template>
        <spinner v-else class="my-3" inline/>
      </p>

      <ul class="inline-list">
        <li>
          <b-form-group :label-for="`addressInput_${uuid}`" class="normal-input mr-0 text-left">
            <b-form-input
              :id="`addressInput_${uuid}`"
              :class="[{ error: $v.walletAddress.$error }, 'default-placeholders']"
              :state="!$v.walletAddress.$error"
              :aria-describedby="`inputLiveWalletAddressHelp_${uuid} inputLiveWalletAddressFeedback_${uuid}`"
              v-model="walletAddress"
              placeholder="Wallet address"
              type="text"
              @blur.native="$v.walletAddress.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveWalletAddressFeedback_${uuid}`">
              <template v-if="$v.walletAddress.$error" class="field__errors">
                <template v-if="!$v.walletAddress.uniqueAddress">Already in use, please choose a different address</template>
                <template v-if="!$v.walletAddress.noStar">The character '*' is not allowed</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveWalletAddressHelp_${uuid}`">
              Address of the wallet.
            </b-form-text>
          </b-form-group>
        </li>
        <li>
          <h4>
            <b-badge id="add-wallet-domain-name" variant="secondary" class="text-white">
              {{ domain }}
            </b-badge>
          </h4>
        </li>
      </ul>

      <p class="pb-4">
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

import publicKey from '@/components/ui/publicKey';
import spinner from '@/components/ui/spinner';
import config from '@/config';

export default {
  name: 'AddWalletForm',
  components: { publicKey, spinner },
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
      walletAddress: '',
    };
  },

  computed: {
    domain () {
      return '*' + config.FEDERATION_DOMAIN;
    }
  },

  watch: {
    visible (val) {
      if (!val) {
        this.walletName = '';
        this.walletAddress = '';
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
      this.backendQuery = { walletName: this.walletName, walletAddress: this.walletAddress, onHomescreen: this.homescreen };
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
      },
      walletAddress: {
        uniqueAddress: value => this.backendQuery.walletAddress !== value || !this.errors.find(err => err.error_code === 1017),
        noStar: value => /^[^*]*$/.test(value),
      }
    };
  }
};
</script>
