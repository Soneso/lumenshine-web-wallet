<template>
  <form class="form" @submit.prevent="onRecoverClick">
    <div v-if="!loading">
      <p>Thank you for confirming your email address. To continue, please insert your password and press "Next"</p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required!</div>
          <div v-if="!$v.password.decryptValid">Invalid Password</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
        <br>
        <a href="#" class="field__link" @click="$router.push({ name: 'LostPasswordAndTfa' })">Lost password?</a>
      </div>
    </div>
    <button @click.prevent="onRecoverClick">Next</button>
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
