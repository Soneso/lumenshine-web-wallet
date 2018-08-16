<template>
  <form class="form" @submit.prevent="onSaveClick">
    <div v-if="!loading">
      <p>Reset password: Please insert your new password below.</p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required!</div>
          <div v-if="!$v.password.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.password.hasNumber">Password should contain at least one number!</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
      </div>
      <div class="field">
        <div v-if="$v.passwordConfirm.$error" class="field__errors">
          <div v-if="!$v.passwordConfirm.required">Password is required!</div>
          <div v-if="!$v.passwordConfirm.sameAsPass">The two passwords don't match!</div>
        </div>
        <input :class="{ error: $v.passwordConfirm.$error }" v-model="passwordConfirm" type="password" placeholder="Repeat password" @blur="$v.passwordConfirm.$touch()">
      </div>
    </div>
    <button @click.prevent="onSaveClick">Set new password</button>
  </form>
</template>

<script>
import { sameAs, required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';

import passwordValidator from '@/validators/password';

export default {
  mixins: [ formMixin ],
  data () {
    return {
      password: '',
      passwordConfirm: '',
    };
  },
  methods: {
    onSaveClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { password: this.password };
      this.$emit('submit', this.password);
    }
  },
  validations () {
    return {
      password: passwordValidator.call(this),
      passwordConfirm: {
        required,
        sameAsPass: sameAs('password'),
      },
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
