<template>
  <div class="page-box form">
    <h1>Setup Wallet</h1>
    <h2>Step 2 of 3</h2>
    <h3>Note & confirm backup secret (mnemonic)</h3>
    <hr>

    <h3>This step is very important</h3>
    <p>Please write down your backup secret (mnemonic). You can use it if you lose your password to recover your wallet. It can be also used in other apps / wallets that support import from mnemonic. If you lose your password and the mnemonic you will not be able to access your funds any more. We cannot recover your account if you lose both (password and mnemonic). We do not store password and mnemonic.</p>
    <hr>

    <p>Your Secret (24 words mnemonic):</p>
    <p class="words">
      <span v-for="(word, key) in mnemonicWords" :key="key">{{ key + 1 }}. {{ word }}<br></span>
    </p>
    <button @click="onNext">Confirm noting of your mnemonic</button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['mnemonic']),
    mnemonicWords () {
      return this.mnemonic.split(' ');
    }
  },
  async created () {
    if (!this.mnemonic) { // mnemonic lost -> should relogin
      console.log('Mnemonic is lost, redirecting to login');
      await this.clearAuthToken();
      this.$router.push({ name: 'Login' });
    }
  },
  methods: {
    ...mapActions(['clearAuthToken']),
    onNext () {
      this.$router.push({ name: 'MnemonicQuiz' });
    }
  }
};
</script>

<style lang="scss" scoped>
h3 {
  color: red;
}
button {
  background: #ff9090 !important;
}
.words {
  text-align: left;
  position: relative;
  left: 50%;
  margin-left: -10%;
}
</style>
