<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="8" md="6" lg="5" xl="4">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase pl-2">Login</h4>
        <div class="pb-4 pl-2"><small>Please fill in the form below</small></div>
        <div v-if="inProgress" class="py-4 px-2">Loading...</div>
        <login-form v-show="decryptError || (!loading && !loginStatus.res)" :loading="loading" :errors="loginStatus.err" :decrypt-error="decryptError" @submit="onLoginSubmit"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import LoginForm from '@/components/forms/auth/LoginForm';

import CryptoHelper from '@/helpers/CryptoHelper';

import redirectHandler from '@/util/redirectHandler';

export default {
  components: { LoginForm },
  data () {
    return {
      inProgress: false,
      decryptError: false,
    };
  },
  computed: {
    ...mapGetters(['loginStatus', 'encryptedServerData', 'userStatus']),
    loading () {
      return this.inProgress || this.loginStatus.loading;
    }
  },
  methods: {
    ...mapActions(['loginStep1', 'loginStep2', 'setMnemonic', 'setPublicKeys']),
    async onLoginSubmit (email, pass, tfaCode) {
      this.inProgress = true;
      this.decryptError = false;

      try {
        await this.loginStep1({ email, tfa_code: tfaCode });
      } catch (err) {
        this.inProgress = false;
        return;
      }

      if (this.loginStatus.err.length > 0) {
        this.inProgress = false;
        return;
      }

      const decryptedServerData = await CryptoHelper.decryptServerData(pass, this.encryptedServerData);

      if (!decryptedServerData) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      this.setPublicKeys(decryptedServerData.publicKeys);

      try {
        await this.loginStep2({ key: decryptedServerData.publicKeys[188] });
      } catch (err) {
        this.inProgress = false;
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

<style lang="scss" scoped>
</style>
