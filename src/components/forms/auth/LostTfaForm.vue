<template>
  <b-form @submit.prevent="onRecoverClick">
    <p class="text-success">New 2FA Secret</p>
    <template v-if="!loading">
      <small v-if="lockedOutError" class="d-block text-danger text-center py-2">{{ lockedOutError }}</small>
      <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">An error occured, please try again</small>

      <p>1. Download or open a two-factor authenticator app (like Google Authenticator)</p>
      <p>2. Scan QR code or input following 2FA secret into your authenticator app:</p>
      <p v-if="tfaData">
        <strong>
          <div v-if="showCopiedText" class="copiedtext info">2FA secret copied to clipboard</div>
          Your 2FA Secret: {{ tfaData.tfa_secret }}
          <copy-to-clipboard :text="tfaData.tfa_secret" :chars="30" color="text-info"/>
        </strong>
      </p>
      <p><img :src="`data:image/png;base64,${tfaData && tfaData.tfa_qr_image}`" class="bar-code-img"></p>
      <p>3. Enter the generated 2FA code from the authenticator app and press "Next"</p>
      <p class="w-50 pt-4 m-auto">
        <!--tfaCode field-->
        <b-form-group>
          <b-form-input
            :class="{ error: $v.tfaCode.$error }"
            :state="!$v.tfaCode.$error"
            v-model="tfaCode"
            type="text"
            placeholder="2FA code"
            aria-describedby="inputLive2FACodeHelp inputLive2FACodeFeedback"
            @blur.native="onTwoFactorCodeBlur"/>

          <b-form-invalid-feedback id="inputLive2FACodeFeedback">
            <template v-if="$v.tfaCode.$error" class="field-errors">
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
    <b-button type="submit" variant="info" class="btn-rounded text-uppercase my-3" @click.prevent="onRecoverClick">Next</b-button>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';
import lockedOutMixin from '@/mixins/lockedOut';

import { required } from 'vuelidate/lib/validators';

import tfaValidator from '@/validators/twoFactorCode';
import copyToClipboard from '@/components/ui/copyToClipboard';

export default {
  name: 'LostTfaForm',
  components: { copyToClipboard },
  mixins: [ formMixin, lockedOutMixin ],
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

  watch: {
    tfaCode () {
      this.tfaCode = this.tfaCode.split(' ').join('');
    }
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
