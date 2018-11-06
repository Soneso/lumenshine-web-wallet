<template>
  <form class="form" @submit.prevent="onRecoverClick">
    <template v-if="!loading">
      <p>Thank you for confirming your email address. To continue, please insert your password and press "Next".</p>
      <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown backend error!</small>

      <b-form-group class="my-4">
        <b-form-input
          :class="{ error: $v.password.$error }"
          v-model="password"
          :state="!$v.password.$error"
          :type="passwordIsHidden ? 'password' : 'text'"
          placeholder="Password"
          aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
          required
          @blur.native="$v.password.$touch()"/>
        <!-- a special row that flows over the input field providing contextual actions -->
        <b-row class="floating-icons align-right one-item">
          <b-col>
            <i :class="{'icon-show': passwordIsHidden, 'icon-hide': !passwordIsHidden}" @click="passwordIsHidden = !passwordIsHidden" />
          </b-col>
        </b-row>

        <b-form-invalid-feedback id="inputLivePasswordFeedback">
          <template v-if="$v.password.$error" class="field-errors">
            <template v-if="!$v.password.required">Password is required! <br></template>
            <template v-if="!$v.password.decryptValid">Invalid Password <br></template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text id="inputLivePasswordHelp">
          Your password
        </b-form-text>
      </b-form-group>
      <b-button variant="info" class="text-uppercase btn-rounded my-3" @click.prevent="onRecoverClick">Next</b-button>
      <a href="/lost-password-and-tfa" target="_blank" class="d-block">Lost password?</a>
    </template>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

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
      password: '',
      passwordIsHidden: true
    };
  },

  methods: {
    onRecoverClick () {
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
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      }
    };
  }
};
</script>

<style lang="scss" scoped>

</style>
