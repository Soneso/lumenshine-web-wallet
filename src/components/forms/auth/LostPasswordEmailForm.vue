<template>
  <form class="form" @submit.prevent="onRecoverClick">
    <div v-if="!loading">
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div v-if="!$v.email.backendEmailConfirmed" class="error">Your email address is not confirmed.</div>
      <div v-else class="field">
        <div v-if="$v.email.$error" class="field__errors">
          <div v-if="!$v.email.required">Email is required!</div>
          <div v-if="!$v.email.email">Not valid email!</div>
          <div v-if="!$v.email.backendHasUser">User not found</div>
        </div>
        <input
          :class="{ error: $v.email.$error }"
          v-model="email"
          type="text"
          placeholder="Your email address"
          @blur="$v.email.$touch()">
      </div>
    </div>
    <button v-if="$v.email.backendEmailConfirmed" @click.prevent="onRecoverClick">Next</button>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import emailValidator from '@/validators/email';

export default {
  mixins: [ formMixin ],
  data () {
    return {
      email: ''
    };
  },
  methods: {
    onRecoverClick () {
      if (!this.$v.email.backendEmailConfirmed) {
        return;
      }
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { email: this.email };
      this.$emit('submit', this.email);
    }
  },
  validations () {
    return {
      email: {
        ...emailValidator.call(this),
        backendHasUser: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1),
        backendEmailConfirmed: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1010),
      }
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
