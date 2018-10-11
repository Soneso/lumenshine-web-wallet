<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <p v-if="!fieldOpen || loading">
      <strong>Short stellar address</strong>
      <a v-if="!fieldOpen && address" href="#" class="text-danger" @click.prevent="onRemoveAddressClick">remove address</a>
      <a v-else-if="!fieldOpen && !address" href="#" @click.prevent="onSetAddressClick">set address</a>
      <br>
      <span v-if="!address">
        <span class="text-danger">none</span><br>
        <small>Hint: You can set a stellar address to this wallet, so that others can add your wallet to their contacts for payments easily.</small>
      </span>
      <span v-else-if="!fieldOpen">{{ address }}*{{ config.FEDERATION_DOMAIN }}</span>
      <i v-if="loading && removingWallet" class="fa fa-spinner fa-spin fa-fw"/>
    </p>

    <!-- <div v-if="hasUnknownError" class="error">Unknown backend error!</div> -->

    <b-card v-if="fieldOpen && !loading" style="max-width: 20rem;">
      <strong>Short stellar address</strong><br>
      <b-row>
        <b-col class="text-nowrap">
          <b-row>
            <b-form-group v-if="fieldOpen && !loading" :label-for="`addressInput_${uuid}`">
              <b-form-input
                :id="`addressInput_${uuid}`"
                :class="{ error: $v.address.$error }"
                :aria-describedby="`inputLiveAddressHelp_${uuid} inputLiveAddressFeedback_${uuid}`"
                :state="!$v.address.$error"
                v-model="address"
                type="text"
                placeholder="Wallet address"
                required
                @blur="$v.address.$touch()"/>

              <b-form-invalid-feedback :id="`inputLiveAddressFeedback_${uuid}`">
                <template v-if="$v.address.$error" class="field__errors">
                  <template v-if="!$v.address.required">Wallet address is required</template>
                  <template v-if="!$v.address.uniqueAddress">Already in use, please choose a different address</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text :id="`inputLiveAddressHelp_${uuid}`">
                Address of the wallet
              </b-form-text>
            </b-form-group>

            <span class="text-warning">{{ domain }}</span>

            <a v-if="!fieldOpen && address" href="#" class="text-danger px-2" @click.prevent="onRemoveAddressClick">remove address</a>
            <a v-else-if="!fieldOpen && !address" href="#" class="text-success px-2" @click.prevent="onSetAddressClick">set address</a>
            <a v-else-if="fieldOpen" href="#" class="text-danger px-2" @click.prevent="onCancelClick">cancel</a>

            <a v-if="fieldOpen" href="#" class="text-success px-2" @click.prevent="onSubmitClick">
              <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
              <span v-else>save</span>
            </a>
          </b-row>
        </b-col>
      </b-row>
    </b-card>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';

import config from '@/config';

function stripDomain (text) {
  return text.replace('*' + config.FEDERATION_DOMAIN, '');
}

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    walletAddress: { // contains domain too
      type: String,
      default: () => null,
    }
  },
  data () {
    return {
      fieldOpen: false,
      address: stripDomain(this.walletAddress), /* not includes domain */
      removingWallet: false,
      config
    };
  },
  computed: {
    domain () {
      return '*' + config.FEDERATION_DOMAIN;
    }
  },
  watch: {
    loading (loading) {
      if (!loading) {
        if (this.walletAddress === this.address + this.domain) { // reset form and close
          this.fieldOpen = false;
        }
        if (this.removingWallet) {
          this.removingWallet = false;
          if (this.errors.length === 0) {
            this.address = stripDomain(this.walletAddress);
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
      this.$emit('submit', this.address + this.domain);
    },
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
