<template>
  <b-form class="form" @submit.prevent="onSaveClick">
    <template v-if="!loading">
      <p>Thank you for confirming your email address. To continue, please insert your current 2FA code from the authenticator app and press "Next"</p>
      <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown backend error!</small>

      <b-form-group class="py-4">
        <b-form-input
          :class="{ 'error': $v.twoFactorCode.$error }"
          v-model="twoFactorCode"
          :state="!$v.twoFactorCode.$error"
          type="text"
          placeholder="2FA code"
          aria-describedby="inputLiveTwoFactorCodeHelp inputLiveTwoFactorCodeFeedback"
          @blur.native="$v.twoFactorCode.$touch()"/>
        <b-form-invalid-feedback id="inputLiveTwoFactorCodeFeedback">
          <template v-if="$v.twoFactorCode.$error" class="field-errors">
            <template v-if="!$v.twoFactorCode.numeric">2FA code should be numeric! <br></template>
            <template v-if="!$v.twoFactorCode.length">2FA code should have length of 6 characters! <br></template>
            <template v-if="!$v.twoFactorCode.validTfa || !$v.twoFactorCode.backendTfaError">2FA code is invalid <br></template>
            <template v-if="!$v.twoFactorCode.required">2FA code is required <br></template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text id="inputLiveTwoFactorCodeHelp">
          <a href="/lost-password-and-tfa" target="_blank" rel="noreferrer">Lost 2FA Secret?</a>
        </b-form-text>
      </b-form-group>

    </template>
    <b-button variant="info" class="btn-rounded" @click.prevent="onSaveClick">Next</b-button>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';
import tfaValidator from '@/validators/twoFactorCode';

export default {
  mixins: [ formMixin ],

  data () {
    return {
      twoFactorCode: '',
    };
  },

  methods: {
    onSaveClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { twoFactorCode: this.twoFactorCode };
      this.$emit('submit', this.twoFactorCode);
    }
  },

  validations () {
    return {
      twoFactorCode: {
        required,
        ...tfaValidator.call(this),
        backendTfaError: value => this.backendQuery.twoFactorCode !== value || !this.errors.find(err => err.error_code === 1000),
      },
    };
  }
};
</script>

<style lang="scss" scoped>

</style>
