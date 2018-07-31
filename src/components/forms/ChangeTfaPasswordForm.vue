<template>
  <form class="form" @submit.prevent="onNextClick">
    <div v-if="!loading">
      <p>To change your 2FA Secret please insert your password.</p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required!</div>
          <div v-if="!$v.password.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.password.hasNumber">Password should contain at least one number!</div>
          <div v-if="!$v.password.decryptValid">Invalid password!</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
      </div>
    </div>
    <button @click.prevent="onNextClick">Next</button>
  </form>
</template>

<script>
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
    };
  },
  methods: {
    onNextClick () {
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
      password: {
        ...passwordValidator.call(this),
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      }
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
