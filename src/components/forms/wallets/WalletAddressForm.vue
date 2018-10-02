<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <div>
      <p>
        <strong>Stellar address</strong>
        <a v-if="!fieldOpen && address" href="#" class="error only-desktop" @click.prevent="onRemoveAddressClick">remove address</a>
        <a v-else-if="!fieldOpen && !address" href="#" class="only-desktop" @click.prevent="onSetAddressClick">set address</a>
        <a v-else-if="fieldOpen" href="#" class="error only-desktop" @click.prevent="onCancelClick">cancel</a>
        <br>
        <span v-if="!address">
          <span class="left error">none</span>
          <span class="right info">Hint: You can set a stellar address to this wallet, so that others can add your wallet to their contacts for payments easily.</span>
        </span>
        <span v-else-if="!fieldOpen">{{ address }}*{{ config.FEDERATION_DOMAIN }}</span>
        <i v-if="loading && removingWallet" class="fa fa-spinner fa-spin fa-fw"/>
      </p>
      <!-- <div v-if="hasUnknownError" class="error">Unknown backend error!</div> -->
      <div v-if="fieldOpen && !loading" class="field">
        <div v-if="$v.address.$error" class="field__errors">
          <div v-if="!$v.address.required">Wallet address is required</div>
          <div v-if="!$v.address.uniqueAddress">Already in use, please choose a different address</div>
        </div>
        <input :class="{ error: $v.address.$error }" v-model="address" placeholder="Wallet address" @blur="$v.address.$touch()">
        <span class="warning">*{{ config.FEDERATION_DOMAIN }}</span>
      </div>
      <div class="form-buttons">
        <a v-if="!fieldOpen && address" href="#" class="error only-mobile" @click.prevent="onRemoveAddressClick">remove address</a>
        <a v-else-if="!fieldOpen && !address" href="#" class="only-mobile" @click.prevent="onSetAddressClick">set address</a>
        <a v-else-if="fieldOpen" href="#" class="error only-mobile" @click.prevent="onCancelClick">cancel</a>
        <a v-if="fieldOpen" href="#" @click.prevent="onSubmitClick">
          <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
          <span v-else>submit</span>
        </a>
      </div>
    </div>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';

import config from '@/config';

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    walletAddress: {
      type: String,
      default: () => null,
    }
  },
  data () {
    return {
      fieldOpen: false,
      address: this.walletAddress,
      removingWallet: false,
      config
    };
  },
  watch: {
    loading (loading) {
      if (!loading) {
        if (this.walletAddress === this.address) { // reset form and close
          this.fieldOpen = false;
        }
        if (this.removingWallet) {
          this.removingWallet = false;
          if (this.errors.length === 0) {
            this.address = this.walletAddress;
          }
        }
      }
    }
  },
  methods: {
    onCancelClick () {
      this.fieldOpen = false;
    },
    onSetAddressClick () {
      this.fieldOpen = true;
    },
    onRemoveAddressClick () {
      this.$emit('remove');
      this.removingWallet = true;
    },
    onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { address: this.address };
      this.$emit('submit', this.address + '*' + config.FEDERATION_DOMAIN);
    }
  },
  validations () {
    return {
      address: {
        required,
        uniqueAddress: value => this.backendQuery.address !== value || !this.errors.find(err => err.error_code === 1017),
      }
    };
  }
};
</script>

<style lang="scss" scoped>
input {
  width: auto !important;
}
</style>
