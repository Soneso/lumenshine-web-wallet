<template>
  <b-form @submit.prevent="onSubmitClick">
    <div v-if="!fieldOpen || loading">
      <span class="font-weight-600">Short stellar address</span>
      <a v-if="!fieldOpen && address" href="#" class="text-danger" @click.prevent="onRemoveAddressClick">remove address</a>
      <a v-else-if="!fieldOpen && !address" href="#" @click.prevent="onSetAddressClick">set address</a>
      <br>
      <span v-if="!address">
        <span class="text-danger">none</span><br>
        <small>Hint: You can set a stellar address to this wallet, so that others can add your wallet to their contacts for payments easily.</small>
      </span>
      <span v-else-if="!fieldOpen">{{ address }}*{{ config.FEDERATION_DOMAIN }}</span>
      <spinner2 v-if="loading && removingWallet" color="text-secondary"/>
    </div>

    <b-card v-if="fieldOpen && !loading" class="flat-card">
      <div class="font-weight-600">Short stellar address</div><br>
      <ul class="inline-list">
        <li>
          <ul class="inline-list">
            <li>
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
            </li>
            <li>
              <span class="text-warning">{{ domain }}</span>
            </li>
          </ul>
        </li>
        <li v-if="!fieldOpen && address">
          <a href="#" class="text-danger px-2" @click.prevent="onRemoveAddressClick">remove address</a>
        </li>
        <li v-if="!fieldOpen && !address">
          <a href="#" class="text-success px-2" @click.prevent="onSetAddressClick">set address</a>
        </li>
        <li v-if="fieldOpen">
          <a href="#" class="text-danger px-2" @click.prevent="onCancelClick">cancel</a>
        </li>
        <li v-if="fieldOpen">
          <a href="#" class="p-0" @click.prevent="onSubmitClick">
            <spinner2 v-if="loading" color="text-secondary" message="saving..."/>
            <span v-else class="text-success">save</span>
          </a>
        </li>
      </ul>
    </b-card>
  </b-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';

import config from '@/config';

import spinner2 from '@/components/ui/spinner2';

function stripDomain (text) {
  return text.replace('*' + config.FEDERATION_DOMAIN, '');
}

export default {
  name: 'WalletAddressForm',
  components: { spinner2 },
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
