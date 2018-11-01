<template>
  <b-form class="form" @submit.prevent="onSubmitClick">
    <b-row align-h="center">
      <b-col cols="12">
        <span class="font-weight-500">Your Secret (24 words mnemonic)</span>
        <a v-if="!fieldOpen && !mnemonic" href="#" @click.prevent="onRevealClick">reveal</a>
        <a v-if="fieldOpen && !mnemonic" href="#" class="text-secondary" @click.prevent="onCancelClick">
          <spinner v-if="loading" variant="secondary"/>
          <template v-else>cancel</template>
        </a>
        <a v-if="!!mnemonic" href="#" @click.prevent="onHideClick">hide</a>
        <div v-if="!!mnemonicList && mnemonicList.length > 0" class="pt-4">
          <b-row v-for="(item, index) in mnemonicList" :key="index" align-h="center" class="w-auto m-auto py-1">
            <b-col cols="3" sm="5" class="text-right px-1 text-gray-300">
              {{ +index + 1 }}.
            </b-col>
            <b-col cols="9" sm="7" class="px-1 text-left">
              {{ item }}
            </b-col>
          </b-row>
        </div>
        <div v-else>***********************</div>
        <small v-if="hasUnknownError" class="text-danger">Unknown backend error!</small>
      </b-col>
      <b-col v-if="fieldOpen && !loading && !mnemonic" cols="10" md="8">
        <b-form-group>
          <b-form-input
            id="reveal-mnemonic-password"
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
              <template v-if="!$v.password.required">Password is required</template>
              <template v-if="!$v.password.decryptValid">Wrong password!</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLivePasswordHelp">
            Your password
          </b-form-text>
        </b-form-group>

        <b-button v-if="fieldOpen && !mnemonic" variant="info" class="text-uppercase btn-rounded" @click.prevent="onSubmitClick">
          <spinner v-if="loading" width="100" message="Revealing..."/>
          <span v-else>reveal</span>
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

import { required } from 'vuelidate/lib/validators';

import spinner from '@/components/ui/spinner1.vue';
import passwordAssets from '@/components/ui/passwordAssets';

export default {
  name: 'BackupMnemonicForm',
  components: { passwordAssets, spinner },
  mixins: [ formMixin, updatePasswordVisibilityState ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    decryptError: {
      type: Boolean,
      required: true,
    },
    mnemonic: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      fieldOpen: false,
      password: '',
      password1IsHidden: true
    };
  },
  computed: {
    mnemonicList () {
      if (this.mnemonic) {
        return this.mnemonic.split(' ');
      }
    }
  },
  methods: {
    onCancelClick () {
      this.fieldOpen = false;
      this.$emit('cancel');
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
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
      }
    };
  }
};
</script>
