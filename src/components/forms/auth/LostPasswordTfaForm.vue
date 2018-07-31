<template>
  <form class="form" @submit.prevent="onSaveClick">
    <div v-if="!loading">
      <p>Thank you for confirming your email address. To continue, please insert your current 2FA code from the authenticator app and press "Next"</p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.twoFactorCode.$error" class="field__errors">
          <div v-if="!$v.twoFactorCode.numeric">2FA code should be numeric!</div>
          <div v-if="!$v.twoFactorCode.length">2FA code should have length of 6 characters!</div>
          <div v-if="!$v.twoFactorCode.validTfa || !$v.twoFactorCode.backendTfaError">2FA code is invalid</div>
          <div v-if="!$v.twoFactorCode.required">2FA code is required</div>
        </div>
        <input :class="{ error: $v.twoFactorCode.$error }" v-model="twoFactorCode" type="twoFactorCode" placeholder="2FA code" @blur="$v.twoFactorCode.$touch()">
        <br>
        <a href="#" class="field__link" @click="$router.push({ name: 'LostPasswordAndTfa' })">Lost 2FA Secret?</a>
      </div>
    </div>
    <button @click.prevent="onSaveClick">Next</button>
  </form>
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
