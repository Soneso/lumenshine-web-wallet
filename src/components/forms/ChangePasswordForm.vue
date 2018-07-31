<template>
  <form class="form" @submit.prevent="onSaveClick">
    <div v-if="!loading">
      <p>To change your password please provide current and new password.</p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required!</div>
          <div v-if="!$v.password.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.password.hasNumber">Password should contain at least one number!</div>
          <div v-if="!$v.password.decryptValid">Wrong password!</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Current password" @blur="$v.password.$touch()">
      </div>
      <div class="field">
        <div v-if="$v.newPassword.$error" class="field__errors">
          <div v-if="!$v.newPassword.required">Password is required!</div>
          <div v-if="!$v.newPassword.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.newPassword.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.newPassword.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.newPassword.hasNumber">Password should contain at least one number!</div>
        </div>
        <input :class="{ error: $v.newPassword.$error }" v-model="newPassword" type="password" placeholder="New password" @blur="$v.newPassword.$touch()">
        <div class="field__info">
          <div class="field__info__modal">
            <h3>Password requirements</h3>
            <p>Your new password must have at least 9 characters</p>
            <p>It must contain small letters and capitals...</p>
          </div>
        </div>
      </div>
      <div class="field">
        <div v-if="$v.passwordConfirm.$error" class="field__errors">
          <div v-if="!$v.passwordConfirm.required">Password is required!</div>
          <div v-if="!$v.passwordConfirm.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.passwordConfirm.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.passwordConfirm.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.passwordConfirm.hasNumber">Password should contain at least one number!</div>
          <div v-if="!$v.passwordConfirm.sameAsPass">The two passwords don't match!</div>
        </div>
        <input :class="{ error: $v.passwordConfirm.$error }" v-model="passwordConfirm" type="password" placeholder="Repeat new password" @blur="$v.passwordConfirm.$touch()">
      </div>
    </div>
    <button @click.prevent="onSaveClick">Change password</button>
  </form>
</template>

<script>
import { sameAs } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';

import passwordValidator from '@/validators/password';

export default {
  mixins: [ formMixin ],
  props: {
    decryptError: {
      type: Boolean,
      required: true,
    },
  },
  data () {
    return {
      password: '',
      newPassword: '',
      passwordConfirm: '',
    };
  },
  methods: {
    onSaveClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { password: this.password, newPassword: this.newPassword };
      this.$emit('submit', this.password, this.newPassword);
    }
  },
  validations () {
    return {
      password: {
        ...passwordValidator.call(this),
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      },
      newPassword: passwordValidator.call(this),
      passwordConfirm: {
        ...passwordValidator.call(this),
        sameAsPass: sameAs('newPassword'),
      },
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
