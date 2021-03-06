<template>

  <b-form v-if="!loading" id="login-form" @submit.prevent="onLoginClick">
    <!--Email field-->
    <div v-if="hasUnknownError" class="text-center mb-2 small text-danger">An error occured, please try again</div>
    <div v-if="lockedOutError" class="text-center mb-2 small text-danger">{{ lockedOutError }}</div>

    <b-form-group v-if="showEmailField">
      <b-form-input
        id="login-email"
        :class="{ error: $v.email.$error }"
        v-model="email"
        :state="!$v.email.$error"
        type="text"
        tabindex="1"
        placeholder="email"
        aria-describedby="inputLiveEmailHelp inputLiveEmailFeedback"
        autocomplete="false"
        required
        @blur.native="$v.email.$touch()"/>
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
        autocomplete="false"
        required
        @blur.native="$v.password.$touch()"/>

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
        <a :target="currentRoute === 'confirm-email' ? '_blank' : null" :rel="currentRoute === 'confirm-email' ? 'noreferrer' : null" href="#" @click.prevent="onLostPasswordClick">Lost password?</a>
      </b-form-text>
    </b-form-group>

    <!-- 2FA field -->
    <b-form-group v-if="showTfaField">
      <b-form-input
        id="login-2fa"
        :class="{ error: $v.twoFactorCode.$error }"
        v-model="twoFactorCode"
        :state="!$v.twoFactorCode.$error"
        type="text"
        tabindex="3"
        placeholder="2FA CODE"
        aria-describedby="inputLive2faHelp inputLive2faFeedback"
        autocomplete="false"
        required
        @blur.native="onTwoFactorCodeBlur(twoFactorCode)"/>
      <b-form-invalid-feedback id="inputLive2faFeedback">
        <template v-if="$v.twoFactorCode.$error" class="field__errors">
          <template v-if="!$v.twoFactorCode.numeric">2FA code should be numeric!</template>
          <template v-if="!$v.twoFactorCode.length">2FA code should have length of 6 characters!</template>
          <template v-if="!$v.twoFactorCode.validTfa">2FA code is invalid</template>
          <template v-if="!$v.twoFactorCode.requiredTfa">2FA code is required</template>
        </template>
      </b-form-invalid-feedback>
      <b-form-text id="inputLive2faHelp">
        <a :target="currentRoute === 'confirm-email' ? '_blank' : null" :rel="currentRoute === 'confirm-email' ? 'noreferrer' : null" href="#" @click.prevent="onLostTfaClick">Lost 2FA Secret?</a>
      </b-form-text>
    </b-form-group>

    <!-- submit action -->
    <div class="text-center">
      <b-button type="submit" variant="success" class="btn-rounded text-uppercase my-3" size="lg" tabindex="4" @click.prevent="onLoginClick">{{ shouldContinue ? 'Continue' : 'Log in' }}</b-button>
      <br v-if="!shouldContinue">
      <small v-if="!shouldContinue" class="text-gray-500">Don't have an account? Sign up <router-link to="/register">here</router-link></small>
    </div>
  </b-form>

</template>

<script>
import { required } from 'vuelidate/lib/validators';
import formMixin from '@/mixins/form';
import lockedOutMixin from '@/mixins/lockedOut';

import emailValidator from '@/validators/email';
import tfaValidator from '@/validators/twoFactorCode';

export default {
  mixins: [ formMixin, lockedOutMixin ],
  props: {
    decryptError: {
      type: Boolean,
      required: true
    },
    showEmailField: {
      type: Boolean,
      default: true,
    },
    showTfaField: {
      type: Boolean,
      default: true,
    },
    shouldContinue: {
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      email: '',
      password: '',
      passwordIsHidden: true,
      twoFactorCode: '',
      currentRoute: ''
    };
  },
  computed: {
    nameState () {
      return this.email.length > 2;
    }
  },
  watch: {
    twoFactorCode () {
      this.twoFactorCode = this.twoFactorCode.split(' ').join('');
    }
  },
  mounted () {
    this.currentRoute = this.$route.path.split('/')[1];
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
    onLostPasswordClick () {
      this.$router.push({ name: 'LostPasswordStep1' });
    },
    onLostTfaClick () {
      this.$router.push({ name: 'LostTfaStep1' });
    },
    onTwoFactorCodeBlur () {
      this.$v.twoFactorCode.$touch();
    }
  },
  validations () {
    const emailValidators = this.showEmailField ? {
      email: {
        ...emailValidator.call(this),
        backendHasUser: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1)
      },
    } : {};

    const tfaValidators = this.showTfaField ? {
      twoFactorCode: {
        ...tfaValidator.call(this),
        validTfa: value => this.backendQuery.twoFactorCode !== value || !this.errors.find(err => err.error_code === 1000),
        requiredTfa: value => this.backendQuery.twoFactorCode !== value || !this.errors.find(err => err.error_code === 1009)
      }
    } : {};

    return {
      ...emailValidators,
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      },
      ...tfaValidators,
    };
  }
};
</script>
