<template>
  <b-form class="form" @submit.prevent="onSubmitClick">
    <div>
      <span class="font-weight-600">Secret seed / Private key</span>
      <a v-if="!fieldOpen && !secretSeed" href="#" @click.prevent="onRevealClick">
        <spinner2 v-if="loading" color="text-info" message="revealing..." width="100"/>
        <template v-else>reveal</template>
      </a>
      <a v-if="fieldOpen && !secretSeed && !loading" href="#" class="text-warning" @click.prevent="onCancelClick">cancel</a>
      <a v-if="secretSeed && !loading" href="#" class="text-warning" @click.prevent="onHideClick">hide</a>
      <br>
      <span>
        {{ secretSeed || '***********************' }}
        <template v-if="secretSeed">
          <copy-to-clipboard :text="secretSeed" color="text-info"/>
        </template>
      </span>
    </div>

    <small v-if="hasUnknownError" class="d-block text-danger">Unknown backend error!</small>

    <b-card v-if="fieldOpen && !loading && !secretSeed" class="flat-card">
      <b-form-group :label-for="`passwordInput_${uuid}`" label="Password">
        <b-form-input
          :id="`passwordInput_${uuid}`"
          :class="{ error: $v.password.$error }"
          :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
          :state="!$v.password.$error"
          v-model="password"
          type="password"
          placeholder="Insert password to reveal"
          required
          @blur="$v.password.$touch()"/>
        <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
          <template v-if="$v.password.$error" class="field__errors">
            <template v-if="!$v.password.required">Password is required!</template>
            <template v-if="!$v.password.decryptValid">Wrong password!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
          Your password.
        </b-form-text>
      </b-form-group>

      <a v-if="fieldOpen && !secretSeed" href="#" class="text-warning mr-3" @click.prevent="onCancelClick">cancel</a>
      <a v-if="secretSeed" href="#" class="text-warning mr-3" @click.prevent="onHideClick">hide</a>
      <a v-if="fieldOpen && !secretSeed" href="#" @click.prevent="onSubmitClick">
        <span v-if="!loading">reveal</span>
      </a>
    </b-card>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

import Spinner2 from '@/components/ui/spinner2';
import CopyToClipboard from '@/components/ui/copyToClipboard';

export default {
  components: {Spinner2, CopyToClipboard},
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
