<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase pl-2 pb-4">Log in</h4>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <spinner v-if="inProgress" align="center" message="Logging you in..." width="150" />
        <login-form v-show="decryptError || lockoutTime || (!loading && !loginStatus.res)" :loading="loading" :errors="loginStatus.err" :decrypt-error="decryptError" @submit="onLoginSubmit"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import LoginForm from '@/components/forms/auth/LoginForm';
import spinner from '@/components/ui/spinner';

import CryptoHelper from '@/helpers/CryptoHelper';

import redirectHandler from '@/util/redirectHandler';

export default {
  components: { LoginForm, spinner },

  data () {
    return {
      inProgress: false,
      decryptError: false,

      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['loginStatus', 'encryptedServerData', 'userStatus', 'sep10Challenge', 'lockoutTime']),
    loading () {
      return this.inProgress || this.loginStatus.loading;
    }
  },

  watch: {
    lockoutTime (val) {
      if (val) {
        this.inProgress = false;
      }
    }
  },

  methods: {
    ...mapActions(['loginStep1', 'loginStep2', 'setMnemonic', 'setPublicKeys', 'clearAuthToken', 'clearLoginError']),
    async onLoginSubmit (email, pass, tfaCode) {
      this.hasUnknownError = false;
      this.inProgress = true;
      this.decryptError = false;

      try {
        await this.loginStep1({ email, tfa_code: tfaCode });
        if (this.loginStatus.err.length > 0 || this.lockoutTime) throw new Error();
      } catch (err) {
        this.inProgress = false;
        return;
      }

      const decryptedServerData = await CryptoHelper.decryptServerData(pass, this.encryptedServerData);

      if (!decryptedServerData) { // invalid password
        // send unsigned transaction to trigger user lock out after some invalid retries
        const transaction = CryptoHelper.getUnsignedSep10Challenge(this.sep10Challenge);
        try { await this.loginStep2({ sep10_transaction: transaction }); } catch (err) {}
        this.clearLoginError(); // invalid transaction error from loginStep2 should be cleared
        await this.clearAuthToken();
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const signedTransaction = await CryptoHelper.signSep10Challenge(decryptedServerData.secretSeed, this.sep10Challenge);
      if (!signedTransaction || this.lockoutTime) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      this.setPublicKeys(decryptedServerData.publicKeys);

      try {
        await this.loginStep2({ sep10_transaction: signedTransaction });
        if (this.lockoutTime) throw new Error();
      } catch (err) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      if (this.userStatus.res && !this.userStatus.res.mnemonic_confirmed) {
        this.setMnemonic(decryptedServerData.mnemonic);
      }

      this.$router.push(redirectHandler(this.userStatus.res, this.$route.name));
    },
  }
};
</script>
