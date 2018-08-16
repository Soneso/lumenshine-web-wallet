<template>
  <form class="form" @submit.prevent="onLoginClick">
    <div v-if="!loading">
      <!-- <div v-if="errors.length > 0" class="error">
        Backend errors: <br>
        <div v-for="error in errors" :key="error.error_code">{{error}}</div>
      </div> -->
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.email.$error" class="field__errors">
          <div v-if="!$v.email.required">Email is required!</div>
          <div v-if="!$v.email.email">Not valid email!</div>
          <div v-if="!$v.email.backendHasUser">No user is registered with this email address!</div>
        </div>
        <input
          :class="{ error: $v.email.$error }"
          v-model="email"
          type="text"
          placeholder="Email"
          tabindex="1"
          @blur="$v.email.$touch()">
      </div>
      <div class="field">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required!</div>
          <div v-if="!$v.password.decryptValid">Wrong password!</div>
        </div>
        <input
          :class="{ error: $v.password.$error }"
          v-model="password"
          type="password"
          placeholder="Password"
          tabindex="2"
          @blur="$v.password.$touch()">
        <br>
        <a href="#" class="field__link" @click="onLostPasswordClick">Lost password?</a>
      </div>
      <div class="field">
        <div v-if="$v.twoFactorCode.$error" class="field__errors">
          <div v-if="!$v.twoFactorCode.numeric">2FA code should be numeric!</div>
          <div v-if="!$v.twoFactorCode.length">2FA code should have length of 6 characters!</div>
          <div v-if="!$v.twoFactorCode.validTfa">2FA code is invalid</div>
          <div v-if="!$v.twoFactorCode.requiredTfa">2FA code is required</div>
        </div>
        <input
          :class="{ error: $v.twoFactorCode.$error }"
          v-model="twoFactorCode"
          type="text"
          placeholder="2FA Code"
          tabindex="3"
          @blur="$v.twoFactorCode.$touch()">
        <br>
        <a href="#" class="field__link" @click="onLostTfaClick">Lost 2FA Secret?</a>
      </div>
    </div>
    <button tabindex="4" @click.prevent="onLoginClick">Login</button><br>
    <span>Don't have an account? Sign up <router-link to="/register">here</router-link></span>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import formMixin from '@/mixins/form';

import emailValidator from '@/validators/email';
import tfaValidator from '@/validators/twoFactorCode';

export default {
  mixins: [ formMixin ],
  props: {
    decryptError: {
      type: Boolean,
      required: true
    },
  },
  data () {
    return {
      email: '',
      password: '',
      twoFactorCode: '',
    };
  },
  methods: {
    onLoginClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { email: this.email, password: this.password, twoFactorCode: this.twoFactorCode };
      this.$emit('submit', this.email, this.password, this.twoFactorCode);
    },
    onLostPasswordClick (e) {
      e.preventDefault();
      this.$router.push({ name: 'LostPasswordStep1' });
    },
    onLostTfaClick (e) {
      e.preventDefault();
      this.$router.push({ name: 'LostTfaStep1' });
    }
  },
  validations () {
    return {
      email: {
        ...emailValidator.call(this),
        backendHasUser: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1)
      },
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      },
      twoFactorCode: {
        ...tfaValidator.call(this),
        validTfa: value => this.backendQuery.twoFactorCode !== value || !this.errors.find(err => err.error_code === 1000),
        requiredTfa: value => this.backendQuery.twoFactorCode !== value || !this.errors.find(err => err.error_code === 1009)
      }
    };
  }
};
</script>

<style lang="scss" scoped>

</style>
