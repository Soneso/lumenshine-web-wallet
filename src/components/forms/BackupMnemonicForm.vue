<template>
  <b-form class="form" @submit.prevent="onSubmitClick">
    <b-row align-h="center">
      <b-col cols="12">
        <span class="font-weight-500">Mnemonic</span>
        <a v-if="!fieldOpen && !mnemonic" href="#" @click.prevent="onRevealClick">reveal</a>
        <a v-if="fieldOpen && !mnemonic" href="#" class="text-secondary" @click.prevent="onCancelClick">
          <spinner2 v-if="loading" color="text-secondary"/>
          <template v-else>cancel</template>
        </a>
        <a v-if="!!mnemonic" href="#" @click.prevent="onHideClick">hide</a>
        <div v-if="!!mnemonicList && mnemonicList.length > 0" class="pb-4">
          <div v-for="(item, index) in mnemonicList" :key="index" class="py-1">
            <b-row align-h="center">
              <b-col cols="2" sm="1" class="text-right px-1 text-gray-300">
                {{ +index + 1 }}.
              </b-col>
              <b-col cols="10" sm="3" md="4" class="px-1 text-left">
                {{ item }}
              </b-col>
            </b-row>
          </div>
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
            @blur="$v.password.$touch()"/>

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
          <spinner2 v-if="loading" color="text-info" width="100" message="Revealing..."/>
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

import spinner2 from '@/components/ui/spinner2.vue';
import passwordAssets from '@/components/ui/passwordAssets';

export default {
  name: 'BackupMnemonicForm',
  components: { passwordAssets, spinner2 },
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
