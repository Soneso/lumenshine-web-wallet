<template>
  <div class="page-box form">
    <h1>Setup Wallet</h1>
    <h2>Step 2 of 3</h2>
    <h3>Note & confirm backup secret (mnemonic)</h3>

    <hr>
    <p>Your Secret (24 words mnemonic):</p>
    <p>{{ mnemonic }}</p>
    <hr>

    <h3>This step is very important</h3>
    <p>Please write down your backup secret (mnemonic). You can use it if you loose your password to recover your wallet. It can be also used in other apps / wallets that support import from mnemonic. If you loose your password and the mnemonic you will not be able to access your funds any more. We can not recover your account if you loose both (password and mnemonic). We do not store password and mnemonic.</p>
    <button @click="onNext">Confirm noting of your mnemonic</button>
    <p>More info about the mnemonic: Lorem ipsum...</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['mnemonic']),
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
</style>
