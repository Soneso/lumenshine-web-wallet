<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 text-center">
        <h4 class="form-headline text-uppercase pl-2">Setup Wallet</h4>
        <small class="text-secondary">Step 2 of 3</small>
        <h6 class="text-danger py-3">Note & confirm backup secret (mnemonic)</h6>
        <hr class="divider light">
        <h6 class="text-danger py-3">This step is very important</h6>
        <p>Please write down your backup secret (mnemonic). You can use it if you lose your password to recover your wallet. It can be also used in other apps / wallets that support import from mnemonic. If you lose your password and the mnemonic you will not be able to access your funds any more. We cannot recover your account if you lose both (password and mnemonic). We do not store password and mnemonic.</p>
        <p>Read more about mnemonics <a href="#">here</a></p>
        <hr class="divider light">
        <strong>Your Secret (24 words mnemonic):</strong>
        <div class="words">
          <b-row v-for="(word, index) in mnemonicWords" :key="index" h-align="center">
            <b-col cols="2" offset="3" class="text-right px-1">
              <small>{{ index + 1 }}.</small>
            </b-col>
            <b-col cols="7" class="text-left px-1">{{ word }}</b-col>
          </b-row>
        </div>
        <b-button v-if="!isMobile" type="submit" variant="danger" size="lg" class="btn-rounded" @click="onNext">Confirm noting of your mnemonic</b-button>
        <div v-else="" class="text-white bg-danger p-2 btn-rounded" @click="onNext">Confirm noting of your mnemonic</div>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['mnemonic', 'isMobile']),
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
