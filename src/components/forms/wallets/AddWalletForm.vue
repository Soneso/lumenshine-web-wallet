<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <div v-if="!loading && nextPublicKey !== null">
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.walletName.$error" class="field__errors">
          <div v-if="!$v.walletName.required">Wallet name is required</div>
          <div v-if="!$v.walletName.maxLength">Max. 40 characters allowed</div>
        </div>
        <input :class="{ error: $v.walletName.$error }" v-model="walletName" placeholder="Wallet name" @blur="$v.walletName.$touch()">
      </div>
      <h3>Stellar public key</h3>
      <p class="centered">
        <strong>Account ID / Public key</strong>
        <br>
        <span v-if="showCopiedText" class="copiedtext info">Copied to clipboard<br></span>
        {{ nextPublicKey }}
        <a
          v-clipboard:copy="nextPublicKey"
          v-clipboard:success="onCopy"
          class="wallet-link">
          <i class="fa fa-clone"/>
        </a>
        <br>
        <input id="homeScreenCheckbox" v-model="homescreen" type="checkbox" class="switch">
        <label for="homeScreenCheckbox">Show wallet on home screen</label>
      </p>
    </div>
    <button @click.prevent="onCancelClick">Cancel</button>
    <button @click.prevent="onSubmitClick">Add</button>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required, maxLength } from 'vuelidate/lib/validators';

export default {
  mixins: [ formMixin ],
  props: {
    nextPublicKey: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      showCopiedText: false,
      walletName: '',
      homescreen: false,
    };
  },
  methods: {
    onCancelClick () {
      this.$emit('cancel');
    },
    onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { walletName: this.walletName, onHomescreen: this.homescreen };
      this.$emit('submit', this.backendQuery);
    },
    onCopy () {
      this.showCopiedText = true;
    }
  },
  validations () {
    return {
      walletName: {
        required,
        maxLength: maxLength(40),
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.form {
  text-align: center;
}
p {
  word-wrap: break-word;
}
</style>
