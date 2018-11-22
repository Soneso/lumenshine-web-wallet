<template>
  <b-form class="form" @submit.prevent="onSubmitClick">
    <div>
      <span class="font-weight-600">Secret seed / Private key</span>
      <a v-if="!fieldOpen && !secretSeed" href="#" @click.prevent="onRevealClick">reveal</a>
      <a v-if="fieldOpen && !secretSeed && !loading" href="#" class="text-warning" @click.prevent="onCancelClick">cancel</a>
      <a v-if="secretSeed && !loading" href="#" class="text-warning" @click.prevent="onHideClick">hide</a>
      <br>
      <span>
        {{ secretSeed || '***********************' }}
        <template v-if="secretSeed">
          <public-key :text="secretSeed" color="text-info"/>
        </template>
      </span>
    </div>

    <small v-if="hasUnknownError" class="d-block text-danger">An error occured, please try again</small>

    <b-card v-if="fieldOpen && !loading && !secretSeed" class="flat-card">
      <b-form-group>
        <b-form-input
          v-model="password"
          :id="`passwordInput_${uuid}`"
          :class="{ error: $v.password.$error }"
          :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
          :state="!$v.password.$error"
          :type="passwordIsHidden ? 'password' : 'text'"
          placeholder="Insert password to reveal"
          required
          @blur.native="$v.password.$touch()"/>

        <password-assets :password="['passwordIsHidden', passwordIsHidden]" @passwordUpdated="updatePasswordState($event)"/>

        <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
          <template v-if="$v.password.$error" class="field__errors">
            <template v-if="!$v.password.required">Password is required! <br></template>
            <template v-if="!$v.password.decryptValid">Wrong password!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
          Your password.
        </b-form-text>
      </b-form-group>
    </b-card>

    <a v-if="fieldOpen && !secretSeed" href="#" class="mx-3 mt-3 d-inline-block" @click.prevent="onSubmitClick">
      <span v-if="!loading">reveal</span>
      <spinner v-else :size="21" message="revealing..." width="100"/>
    </a>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

import spinner from '@/components/ui/spinner';
import publicKey from '@/components/ui/publicKey';
import passwordAssets from '@/components/ui/passwordAssets';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

export default {
  components: { passwordAssets, spinner, publicKey },
  mixins: [ formMixin, updatePasswordVisibilityState ],
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
      passwordIsHidden: true
    };
  },
  watch: {
    loading (loading) {
      if (!loading && !this.decryptionError && this.errors.length === 0) {
        this.fieldOpen = false;
        if (this.password !== '') {
          this.password = '';
        }
      }
    }
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
      this.$v.$reset();
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
