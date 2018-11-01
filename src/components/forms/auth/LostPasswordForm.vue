<template>
  <form class="form" @submit.prevent="onSaveClick">
    <div v-if="!loading">
      <p class="text-gray-600 pb-3">Reset password: Please insert your new password below. </p>
      <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown backend error!</small>
      <b-row>
        <b-col cols="12">
          <!--Password field-->
          <b-form-group>
            <b-form-input
              id="lost-password1"
              :class="{ error: $v.password.$error }"
              v-model="password"
              :state="!$v.password.$error"
              :type="password1IsHidden ? 'password' : 'text'"
              placeholder="New Password"
              tabindex="1"
              aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
              required
              @blur.native="$v.password.$touch()"/>

            <!-- a special row that flows over the input field providing contextual actions -->
            <b-row class="floating-icons align-right two-items">
              <b-col>
                <i
                  v-b-popover.hover="'Your new password must have at least 9 characters \nIt must contain numbers, small and capital letters.'"
                  class="icon-help" title="Password requirement"/>
              </b-col>
              <b-col>
                <i :class="{'icon-show': password1IsHidden, 'icon-hide': !password1IsHidden}" @click="password1IsHidden = !password1IsHidden" />
              </b-col>
            </b-row>

            <b-form-invalid-feedback id="inputLivePasswordFeedback">
              <template v-if="$v.password.$error" class="field__errors">
                <template v-if="!$v.password.required">Password is required! <br></template>
                <template v-if="!$v.password.minLength">Password should be longer than 9 characters! <br></template>
                <template v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character! <br></template>
                <template v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character! <br></template>
                <template v-if="!$v.password.hasNumber">Password should contain at least one number! <br></template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text id="inputLivePasswordHelp">
              Your password
            </b-form-text>
          </b-form-group>
        </b-col>
        <b-col cols="12">
          <!--Password repeat field-->
          <b-form-group>
            <b-form-input
              id="signup-password-confirm"
              :class="{ error: $v.passwordConfirm.$error }"
              v-model="passwordConfirm"
              :state="!$v.passwordConfirm.$error"
              :type="password2IsHidden ? 'password' : 'text'"
              placeholder="Repeat new password"
              tabindex="3"
              aria-describedby="inputLivePasswordConfirmHelp inputLivePasswordConfirmFeedback"
              required
              @blur.native="$v.passwordConfirm.$touch()"/>

            <!-- a special row that flows over the input field providing contextual actions -->
            <b-row class="floating-icons align-right one-item">
              <b-col>
                <i :class="{'icon-show': password2IsHidden, 'icon-hide': !password2IsHidden}" @click="password2IsHidden = !password2IsHidden" />
              </b-col>
            </b-row>

            <b-form-invalid-feedback id="inputLivePasswordConfirmFeedback">
              <template v-if="$v.passwordConfirm.$error" class="field-errors">
                <template v-if="!$v.passwordConfirm.required">Password is required again! <br></template>
                <template v-if="!$v.passwordConfirm.sameAsPass">The two passwords don't match!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text id="inputLivePasswordConfirmHelp">
              Your password again
            </b-form-text>
          </b-form-group>
        </b-col>
      </b-row>
    </div>
    <b-button variant="success" class="btn-rounded text-uppercase" @click.prevent="onSaveClick">Set new password</b-button>
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
      password1IsHidden: true,
      password2IsHidden: true
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
