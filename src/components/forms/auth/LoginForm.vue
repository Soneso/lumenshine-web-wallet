<template>

  <b-form v-if="!loading" id="login-form" @submit.prevent="onLoginClick">
    <!--Email field-->
    <template v-if="hasUnknownError" class="error">Unknown backend error!</template>
    <b-form-group>
      <b-form-input
        id="login-email"
        :class="{ error: $v.email.$error }"
        v-model="email"
        :state="!$v.email.$error"
        type="text"
        placeholder="email"
        tabindex="1"
        aria-describedby="inputLiveEmailHelp inputLiveEmailFeedback"
        required
        @blur="$v.email.$touch()"/>
      <b-form-invalid-feedback id="inputLiveEmailFeedback">
        <template v-if="$v.email.$error" class="field__errors">
          <template v-if="!$v.email.required">Email is required!</template>
          <template v-if="!$v.email.email">Not valid email!</template>
          <template v-if="!$v.email.backendHasUser">No user is registered with this email address!</template>
        </template>
      </b-form-invalid-feedback>
      <b-form-text id="inputLiveEmailHelp">
        Your email address.
      </b-form-text>
    </b-form-group>

    <!-- Password field -->
    <b-form-group>
      <b-form-input
        id="login-password"
        :class="{ error: $v.password.$error }"
        v-model="password"
        :state="!$v.password.$error"
        :type="passwordIsHidden ? 'password' : 'text'"
        placeholder="password"
        tabindex="2"
        aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
        required
        @blur="$v.password.$touch()"/>

      <!-- a special row that flows over the input field providing contextual actions -->
      <b-row class="floating-icons align-right one-item">
        <b-col>
          <i :class="{'icon-show': passwordIsHidden, 'icon-hide': !passwordIsHidden}" @click="passwordIsHidden = !passwordIsHidden" />
        </b-col>
      </b-row>

      <b-form-invalid-feedback id="inputLivePasswordFeedback">
        <template v-if="$v.password.$error" class="field__errors">
          <template v-if="!$v.password.required">Password is required!</template>
          <template v-if="!$v.password.decryptValid">Wrong password!</template>
        </template>
      </b-form-invalid-feedback>
      <b-form-text id="inputLivePasswordHelp">
        <a href="#" @click="onLostPasswordClick">Lost password?</a>
      </b-form-text>
    </b-form-group>

    <!-- 2FA field -->
    <b-form-group>
      <b-form-input
        id="login-2fa"
        :class="{ error: $v.twoFactorCode.$error }"
        v-model="twoFactorCode"
        :state="!$v.twoFactorCode.$error"
        type="text"
        placeholder="2FA CODE"
        tabindex="3"
        aria-describedby="inputLive2faHelp inputLive2faFeedback"
        required
        @blur="$v.twoFactorCode.$touch()"/>
      <b-form-invalid-feedback id="inputLive2faFeedback">
        <template v-if="$v.twoFactorCode.$error" class="field__errors">
          <template v-if="!$v.twoFactorCode.numeric">2FA code should be numeric!</template>
          <template v-if="!$v.twoFactorCode.length">2FA code should have length of 6 characters!</template>
          <template v-if="!$v.twoFactorCode.validTfa">2FA code is invalid</template>
          <template v-if="!$v.twoFactorCode.requiredTfa">2FA code is required</template>
        </template>
      </b-form-invalid-feedback>
      <b-form-text id="inputLive2faHelp">
        <a href="#" @click="onLostTfaClick">Lost 2FA Secret?</a>
      </b-form-text>
    </b-form-group>

    <!-- submit action -->
    <div class="text-center">
      <b-button type="submit" variant="success" class="btn-rounded text-uppercase my-3" tabindex="4" size="lg" @click.prevent="onLoginClick">Login</b-button>
      <br>
      <small>Don't have an account? Sign up <router-link to="/register">here</router-link></small>
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
      passwordIsHidden: true,
      twoFactorCode: '',
    };
  },
  computed: {
    nameState () {
      return this.email.length > 2;
    }
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
