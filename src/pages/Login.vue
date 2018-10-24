<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase pl-2 pb-4">Log in</h4>
        <spinner v-if="inProgress" align="center"/>
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
import spinner from '@/components/ui/spinner1.vue';

export default {
  components: { LoginForm, spinner },
  data () {
    return {
      inProgress: false,
      decryptError: false
    };
  },
  computed: {
    ...mapGetters(['loginStatus', 'encryptedServerData', 'userStatus']),
    loading () {
      return this.inProgress || this.loginStatus.loading;
    }
  },
  methods: {
    ...mapActions(['loginStep1', 'loginStep2', 'setMnemonic', 'setPublicKeys', 'clearAuthToken']),
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
        await this.clearAuthToken();
        return;
      }

      this.setPublicKeys(decryptedServerData.publicKeys);

      try {
        await this.loginStep2({ key: decryptedServerData.publicKeys[188] });
      } catch (err) {
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

<style lang="scss" scoped>
</style>
