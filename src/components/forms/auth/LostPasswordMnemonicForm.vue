<template>
  <b-form class="form" @submit.prevent="onSaveClick">
    <template v-if="!loading">
      <p>To reset your password please insert your backup secret (24 words mnemonic) and press "Next".</p>
      <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown backend error!</small>

      <div v-for="(item, index) in $v.mnemonic.$each.$iter" :key="index" class="field">
        <b-row align-h="center">
          <b-col cols="2" class="text-right px-1 text-gray-300">
            <div class="pt-2">{{ +index + 1 }}.</div>
          </b-col>
          <b-col cols="6" sm="5" md="4" lg="3" class="px-1">
            <b-form-group class="pb-1">
              <b-form-input
                v-model="item.word.$model"
                :class="['default-placeholders', { error: item.$error }]"
                :tabindex="+index + 1"
                placeholder="word"
                type="text"
                @blur.native="item.$touch()"/>
              <template v-if="item.$error">
                <small v-if="!item.required" class="text-danger d-block text-left pl-2">Mandatory</small>
              </template>
            </b-form-group>
          </b-col>
        </b-row>
      </div>

    </template>
    <b-button variant="info" class="btn-rounded mt-4" @click.prevent="onSaveClick">Next</b-button>
    <small v-if="$v.mnemonic.$error" class="text-danger d-block pt-2">Invalid mnemonic, please verify</small>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

export default {
  mixins: [ formMixin ],

  props: {
    mnemonicError: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      mnemonic: new Array(24).fill('').map(() => ({ word: '' })),
    };
  },

  methods: {
    onSaveClick () {
      // maybe we want to paste all mnemonic in the first input field; then...
      const submittedMnemonic = this.mnemonic[0].word.split(' ');
      if (submittedMnemonic.length === 24) this.mnemonic = submittedMnemonic.map(w => ({ word: w }));

      this.mnemonic = [ ...this.mnemonic.map(m => ({ word: m.word.trim() })) ];
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      const mnemonic = this.mnemonic.map(v => v.word.trim()).join(' ');
      this.backendQuery = { mnemonic };
      this.$emit('submit', mnemonic);
    }
  },

  validations () {
    return {
      mnemonic: {
        validMnemonic: value => this.backendQuery.mnemonic !== value.map(v => v.word.trim()).join(' ') || !this.mnemonicError,
        $each: {
          word: {
            required,
          }
        }
      }
    };
  }
};
</script>
