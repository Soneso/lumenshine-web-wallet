<template>
  <b-form class="text-center" @submit.prevent="onSubmitClick">
    <div class="text-success pb-3">New 2FA Secret</div>
    <b-row v-if="!loading" align-h="center">
      <b-col cols="12">
        <p>1. Download or open a two-factor authenticator app (like Google Authenticator)</p>
        <p>2. Scan QR code or input following 2FA secret into your authenticator app:</p>

        <h6 v-if="tfaData" class="text-center pt-2">
          Your 2FA Secret: <public-key :text="tfaData.tfa_secret" message="2FA secret copied to clipboard" color="text-info"/><br>
          <img :src="`data:image/png;base64,${tfaData && tfaData.tfa_qr_image}`" class="bar-code-img">
        </h6>

        <p>3. Enter the generated 2FA code from the authenticator app and press "Next"</p>
        <small v-if="hasUnknownError" class="text-danger d-block">An error occured, please try again</small>
      </b-col>

      <b-col cols="10" sm="8" md="6">
        <!-- Password field-->
        <b-form-group>
          <b-form-input
            id="change-2fa-password"
            :class="{ error: $v.tfaCode.$error }"
            v-model="tfaCode"
            :state="!$v.tfaCode.$error"
            :type="'text'"
            placeholder="2FA Code"
            autocomplete="off"
            aria-describedby="inputLive2faHelp inputLive2faFeedback"
            required
            @blur.native="$v.tfaCode.$touch()"/>

          <b-form-invalid-feedback id="inputLive2faFeedback">
            <template v-if="$v.tfaCode.$error" class="field__errors">
              <template v-if="!$v.tfaCode.numeric">2FA code should be numeric!</template>
              <template v-if="!$v.tfaCode.length">2FA code should have length of 6 characters!</template>
              <template v-if="!$v.tfaCode.validTfa">2FA code is invalid</template>
              <template v-if="!$v.tfaCode.required">2FA code is required</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLive2faHelp">
            Your 2FA code
          </b-form-text>
        </b-form-group>
      </b-col>
      <b-col cols="12" class="text-center py-4">
        <b-button variant="info" class="btn-rounded text-uppercase" @click.prevent="onSubmitClick">Next</b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

import tfaValidator from '@/validators/twoFactorCode';
import publicKey from '@/components/ui/publicKey';

export default {
  name: 'ChangeTfaForm',
  components: { publicKey },
  mixins: [ formMixin ],
  props: {
    tfaData: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      showCopiedText: false,
      tfaCode: '',
      password1IsHidden: true
    };
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
