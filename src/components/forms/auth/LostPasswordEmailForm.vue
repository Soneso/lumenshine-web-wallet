<template>
  <b-form @submit.prevent="onRecoverClick">
    <template v-if="!loading">
      <small v-if="lockedOutError" class="d-block text-danger text-center py-2">{{ lockedOutError }}</small>
      <small v-if="hasUnknownError" class="d-block text-danger text-center py-2">An error occured, please try again</small>
      <div v-if="!$v.email.backendEmailConfirmed" class="text-danger text-center py-2">Verify your email address.</div>

      <template v-else>

        <b-form-group class="py-4">
          <b-form-input
            :class="{ error: $v.email.$error }"
            v-model="email"
            :state="!$v.email.$error"
            type="text"
            placeholder="Your email address"
            aria-describedby="inputLiveEmailHelp inputLiveEmailFeedback"
            required
            @blur.native="$v.email.$touch()"/>
          <b-form-invalid-feedback id="inputLiveEmailFeedback">
            <template v-if="$v.email.$error" class="field-errors">
              <template v-if="!$v.email.required">Email is required!</template>
              <template v-if="!$v.email.email">Not valid email!</template>
              <template v-if="!$v.email.backendHasUser">User not found</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLiveEmailHelp">
            Your email address
          </b-form-text>
        </b-form-group>

        <b-button v-if="$v.email.backendEmailConfirmed" variant="info" class="btn-rounded text-uppercase" @click.prevent="onRecoverClick">Next</b-button>
      </template>
    </template>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';
import lockedOutMixin from '@/mixins/lockedOut';

import emailValidator from '@/validators/email';

export default {
  mixins: [ formMixin, lockedOutMixin ],

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
