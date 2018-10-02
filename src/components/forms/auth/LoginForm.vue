<template>

  <b-form v-if="!loading" @submit.prevent="onLoginClick">
    <div v-if="!loading">
      <b-form-group id="login-form" label="Email" label-for="login-email">
        <b-form-input
          id="login-email"
          :class="{ error: $v.email.$error }"
          v-model="email"
          :state="nameState"
          type="text"
          placeholder="Email"
          tabindex="1"
          aria-describedby="inputLiveHelp inputLiveFeedback"
          required
          @blur="$v.email.$touch()"
        />
        <b-form-invalid-feedback id="inputLiveFeedback">
          <template v-if="hasUnknownError" class="error">Unknown backend error!</template>
          <template v-if="$v.email.$error" class="field__errors">
            <template v-if="!$v.email.required">Email is required!</template>
            <template v-if="!$v.email.email">Not valid email!</template>
            <template v-if="!$v.email.backendHasUser">No user is registered with this email address!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text id="inputLiveHelp">
          Your full name.
        </b-form-text>
      </b-form-group>

    </div>

    <div class="text-center">
      <b-button type="submit" variant="success" class="btn-rounded text-uppercase my-3" tabindex="4" size="lg" @click.prevent="onLoginClick">Login</b-button>
      <br>
      <span>Don't have an account? Sign up <router-link to="/register">here</router-link></span>
    </div>
  </b-form>

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
