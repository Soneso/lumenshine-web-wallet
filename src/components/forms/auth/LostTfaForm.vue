<template>
  <form class="form" @submit.prevent="onRecoverClick">
    <h3>New 2FA Secret</h3>
    <div v-if="!loading">
      <p>1. Download or open a two-factor authenticator app (like Google Authenticator)</p>
      <p>2. Scan QR code or input following 2FA secret into your authenticator app:</p>
      <p v-if="tfaData">
        <strong>
          <div v-if="showCopiedText" class="copiedtext info">2FA secret copied to clipboard</div>
          Your 2FA Secret: {{ tfaData.tfa_secret }}
          <button
            v-clipboard:copy="tfaData.tfa_secret"
            v-clipboard:success="onCopy"
            type="button">
            Copy
          </button>
        </strong>
      </p>
      <p><img :src="`data:image/png;base64,${tfaData && tfaData.tfa_qr_image}`"></p>
      <p>3. Enter the generated 2FA code from the authenticator app and press "Next"</p>

      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.tfaCode.$error" class="field__errors">
          <div v-if="!$v.tfaCode.numeric">2FA code should be numeric!</div>
          <div v-if="!$v.tfaCode.length">2FA code should have length of 6 characters!</div>
          <div v-if="!$v.tfaCode.validTfa">2FA code is invalid</div>
          <div v-if="!$v.tfaCode.required">2FA code is required</div>
        </div>
        <input :class="{ error: $v.tfaCode.$error }" v-model="tfaCode" placeholder="2FA code" @blur="$v.tfaCode.$touch()">
      </div>
    </div>
    <button @click.prevent="onRecoverClick">Next</button>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

import tfaValidator from '@/validators/twoFactorCode';

export default {
  mixins: [ formMixin ],
  props: {
    tfaData: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      tfaCode: '',
      showCopiedText: false,
    };
  },
  methods: {
    onRecoverClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { tfaCode: this.tfaCode };
      this.$emit('submit', this.tfaCode);
    },
    onCopy () {
      this.showCopiedText = true;
    }
  },
  validations () {
    return {
      tfaCode: {
        ...tfaValidator.call(this),
        required,
        validTfa: value => this.backendQuery.tfaCode !== value || !this.errors.find(err => err.error_code === 1000),
      }
    };
  }
};
</script>

<style lang="scss" scoped>

</style>
