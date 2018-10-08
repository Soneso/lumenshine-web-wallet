<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <div>
      <p>
        <strong>Secret seed / Private key</strong>
        <a v-if="!fieldOpen && !secretSeed" href="#" class="only-desktop" @click.prevent="onRevealClick">reveal</a>
        <a v-else-if="fieldOpen && !secretSeed" href="#" class="only-desktop error" @click.prevent="onCancelClick">cancel</a>
        <a v-else-if="secretSeed" href="#" class="only-desktop" @click.prevent="onHideClick">hide</a>
        <br>
        {{ secretSeed || '***********************' }}
      </p>

      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>

      <b-form-group v-if="fieldOpen && !loading && !secretSeed" label="Password" label-for="passwordInput">
        <b-form-input
          id="passwordInput"
          :class="{ error: $v.password.$error }"
          v-model="password"
          :state="!$v.password.$error"
          type="password"
          placeholder="Insert password to reveal"
          aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
          required
          @blur="$v.password.$touch()"/>
        <b-form-invalid-feedback id="inputLivePasswordFeedback">
          <template v-if="$v.password.$error" class="field__errors">
            <template v-if="!$v.password.required">Password is required!</template>
            <template v-if="!$v.password.decryptValid">Wrong password!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text id="inputLivePasswordHelp">
          Your password.
        </b-form-text>
      </b-form-group>

      <a v-else-if="fieldOpen && !secretSeed" href="#" class="error only-mobile" @click.prevent="onCancelClick">cancel</a>
      <a v-else-if="secretSeed" href="#" class="only-mobile" @click.prevent="onHideClick">hide</a>
      <a v-if="fieldOpen && !secretSeed" href="#" @click.prevent="onSubmitClick">
        <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
        <span v-else>reveal</span>
        <br><br>
      </a>
    </div>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    decryptionError: {
      type: Boolean,
      required: true,
    },
    secretSeed: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      fieldOpen: false,
      password: '',
    };
  },
  methods: {
    onCancelClick () {
      this.fieldOpen = false;
    },
    onRevealClick () {
      this.fieldOpen = true;
    },
    onHideClick () {
      this.fieldOpen = false;
      this.$emit('hide');
    },
    onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid || this.loading) {
        return;
      }
      this.backendQuery = { password: this.password };
      this.$emit('reveal', this.password);
    }
  },
  validations () {
    return {
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptionError,
      }
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
