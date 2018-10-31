<template>
  <b-form class="form" @submit.prevent="onSaveClick">
    <b-row v-if="!loading">
      <b-col cols="12 pb-4 mb-3">
        <div class="mt-2">To change your password please provide current and new password.</div>
        <div v-if="hasUnknownError" class="text-danger">Unknown backend error!</div>
      </b-col>

      <b-col cols="12">
        <!--Current Password field-->
        <b-form-group>
          <b-form-input
            id="change-password-current-password"
            :class="{ error: $v.password.$error }"
            v-model="password"
            :state="!$v.password.$error"
            :type="password1IsHidden ? 'password' : 'text'"
            placeholder="Current password"
            tabindex="1"
            autocomplete="off"
            aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
            required
            @blur="$v.password.$touch()"/>

          <password-assets :password="['password1IsHidden', password1IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

          <b-form-invalid-feedback id="inputLivePasswordFeedback">
            <template v-if="$v.password.$error" class="field-errors">
              <template v-if="!$v.password.required">Password is required!</template>
              <template v-if="!$v.password.decryptValid">Wrong password!</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLivePasswordHelp">
            Your current password
          </b-form-text>
        </b-form-group>
      </b-col>

      <b-col cols="12">
        <!-- New Password field-->
        <b-form-group>
          <b-form-input
            id="change-password-new-password"
            :class="{ error: $v.newPassword.$error }"
            v-model="newPassword"
            :state="!$v.newPassword.$error"
            :type="password2IsHidden ? 'password' : 'text'"
            placeholder="New Password"
            tabindex="2"
            autocomplete="off"
            aria-describedby="inputLiveNewPasswordHelp inputLiveNewPasswordFeedback"
            required
            @blur="$v.newPassword.$touch()"/>

          <password-assets
            :password="['password2IsHidden', password2IsHidden]"
            :help-title="'Password requirement'"
            :help-text="'Your new password must have at least 9 characters \nIt must contain numbers, small and capital letters.'"
            @passwordUpdated="updatePasswordState($event)"/>

          <b-form-invalid-feedback id="inputLiveNewPasswordFeedback">
            <template v-if="$v.newPassword.$error" class="field-errors">
              <template v-if="!$v.newPassword.required">Password is required!</template>
              <template v-if="!$v.newPassword.minLength">Password should be longer than 9 characters!</template>
              <template v-if="!$v.newPassword.hasUpperCaseLetter">Password should contain at least one uppercase character!</template>
              <template v-if="!$v.newPassword.hasLowerCaseLetter">Password should contain at least one lowercase character!</template>
              <template v-if="!$v.newPassword.hasNumber">Password should contain at least one number!</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLiveNewPasswordHelp">
            Your new password
          </b-form-text>
        </b-form-group>
      </b-col>

      <b-col cols="12">
        <!-- Confirm New Password field-->
        <b-form-group>
          <b-form-input
            id="change-password-confirm-current-password"
            :class="{ error: $v.passwordConfirm.$error }"
            v-model="passwordConfirm"
            :state="!$v.passwordConfirm.$error"
            :type="password3IsHidden ? 'password' : 'text'"
            placeholder="Repeat new password"
            tabindex="2"
            autocomplete="off"
            aria-describedby="inputLiveConfimNewPasswordHelp inputLiveConfimNewPasswordFeedback"
            required
            @blur="$v.passwordConfirm.$touch()"/>

          <password-assets :password="['password3IsHidden', password3IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

          <b-form-invalid-feedback id="inputLiveConfimNewPasswordFeedback">
            <template v-if="$v.passwordConfirm.$error" class="field-errors">
              <template v-if="!$v.passwordConfirm.required">Password is required!</template>
              <template v-if="!$v.passwordConfirm.sameAsPass">The two passwords don't match!</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLiveConfimNewPasswordHelp">
            Confirm your new password
          </b-form-text>
        </b-form-group>
      </b-col>
      <b-col class="text-center pt-4">
        <b-button variant="success" class="btn-rounded text-uppercase" @click.prevent="onSaveClick">Change password</b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import { sameAs, required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';

import passwordValidator from '@/validators/password';

import passwordAssets from '@/components/ui/passwordAssets';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

export default {
  name: 'ChangePasswordForm',
  components: { passwordAssets },
  mixins: [ formMixin, updatePasswordVisibilityState ],
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
      password1IsHidden: true,
      password2IsHidden: true,
      password3IsHidden: true
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
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      },
      newPassword: passwordValidator.call(this),
      passwordConfirm: {
        required,
        sameAsPass: sameAs('newPassword'),
      },
    };
  }
};
</script>
