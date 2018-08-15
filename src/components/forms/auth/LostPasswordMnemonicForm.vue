<template>
  <form class="form" @submit.prevent="onSaveClick">
    <div v-if="!loading">
      <p>To reset your password please insert your backup secret (24 words mnemonic) and press "Next".</p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div v-for="(item, index) in $v.mnemonic.$each.$iter" :key="index" class="field">
        <div v-if="item.$error" class="field__errors">
          <div v-if="!item.required">Mandatory</div>
        </div>
        <input :class="{ error: item.$error }" v-model="item.word.$model" :placeholder="`${parseInt(index, 10) + 1}. Word`" @blur="item.$touch()">
      </div>
    </div>
    <div v-if="$v.mnemonic.$error" class="error">Invalid mnemonic, please verify</div>
    <button @click.prevent="onSaveClick">Next</button>
  </form>
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

<style lang="scss" scoped>

</style>
