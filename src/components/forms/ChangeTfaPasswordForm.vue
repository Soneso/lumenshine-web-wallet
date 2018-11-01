<template>
  <b-form class="form" @submit.prevent="onNextClick">
    <b-row v-if="!loading">
      <b-col cols="12 pb-4 mb-3">
        <div class="mt-2">To change your 2FA Secret please insert your password.</div>
        <div v-if="hasUnknownError" class="text-danger">Unknown backend error!</div>
      </b-col>

      <b-col cols="12">
        <!-- Password field-->
        <b-form-group>
          <b-form-input
            id="change-password-current-password"
            :class="{ error: $v.password.$error }"
            v-model="password"
            :state="!$v.password.$error"
            :type="password1IsHidden ? 'password' : 'text'"
            placeholder="Password"
            tabindex="1"
            autocomplete="off"
            aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
            required
            @blur.native="$v.password.$touch()"/>

          <password-assets :password="['password1IsHidden', password1IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

          <b-form-invalid-feedback id="inputLivePasswordFeedback">
            <template v-if="$v.password.$error" class="field-errors">
              <template v-if="!$v.password.required">Password is required!</template>
              <template v-if="!$v.password.decryptValid">Invalid password!</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLivePasswordHelp">
            Your password
          </b-form-text>
        </b-form-group>
      </b-col>

      <b-col class="text-center pt-4">
        <b-button variant="info" class="btn-rounded text-uppercase" @click.prevent="onNextClick">Next</b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import formMixin from '@/mixins/form';
import passwordAssets from '@/components/ui/passwordAssets';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

export default {
  name: 'ChangeTfaPasswordForm',
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
      password1IsHidden: true
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
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      }
    };
  }
};
</script>
