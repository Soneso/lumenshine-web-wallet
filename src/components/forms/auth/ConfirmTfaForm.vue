<template>
  <b-form @submit.prevent="onSubmitClick">
    <template v-if="!loading && tfaData">
      <p>1. Download a two-factor authenticator app (like Google Authenticator)</p>
      <p>2. Scan QR code or input following 2FA secret into your authenticator app:</p>
      <h6 v-if="tfaData" class="text-center pt-2">
        Your 2FA Secret: {{ tfaData.tfa_secret }}
        <copy-to-clipboard :text="tfaData.tfa_secret" message="2FA secret copied to clipboard" color="text-info"/>
        <br>
        <img :src="`data:image/png;base64,${tfaData && tfaData.tfa_qr_image}`" class="bar-code-img">
      </h6>
      <p>3. Enter the generated 2FA code from the authenticator app and press "Next"</p>
      <template v-if="hasUnknownError" class="error">An error occured, please try again<br></template>
      <p class="w-50 pt-4 m-auto">
        <!--tfaCode field-->
        <b-form-group>
          <b-form-input
            id="tfa-code"
            :class="{ error: $v.tfaCode.$error }"
            v-model="tfaCode"
            :state="!$v.tfaCode.$error"
            type="text"
            placeholder="2FA code"
            aria-describedby="inputLive2FACodeHelp inputLive2FACodeFeedback"
            required
            @blur.native="onTwoFactorCodeBlur"/>

          <b-form-invalid-feedback id="inputLive2FACodeFeedback">
            <template v-if="$v.tfaCode.$error" class="field__errors">
              <template v-if="!$v.tfaCode.numeric">2FA code should be numeric! <br></template>
              <template v-if="!$v.tfaCode.length">2FA code should have length of 6 characters! <br></template>
              <template v-if="!$v.tfaCode.validTfa">2FA code is invalid <br></template>
              <template v-if="!$v.tfaCode.required">2FA code is required <br></template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLive2FACodeHelp">
            Your 2FA code
          </b-form-text>
        </b-form-group>
      </p>
    </template>
    <b-button type="submit" variant="info" class="btn-rounded text-uppercase my-3" size="lg" @click.prevent="onSubmitClick">Next</b-button>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

import tfaValidator from '@/validators/twoFactorCode';
import copyToClipboard from '@/components/ui/copyToClipboard';

export default {
  components: { copyToClipboard },
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
    };
  },
  watch: {
    tfaCode () {
      this.tfaCode = this.tfaCode.split(' ').join('');
    }
  },
  methods: {
    onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { tfaCode: this.tfaCode };
      this.$emit('submit', this.tfaCode);
    },
    onTwoFactorCodeBlur () {
      this.$v.tfaCode.$touch();
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
