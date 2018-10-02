<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="8" md="6" lg="5" xl="4">
      <b-card class="p-4">
        <h4 class="form-headline text-uppercase">Login</h4>
        <div class="pb-5"><small>Please fill in the form below</small></div>
        <div v-if="inProgress">Loading...</div>
        <login-form v-show="decryptError || (!loading && !loginStatus.res)" :loading="loading" :errors="loginStatus.err" :decrypt-error="decryptError" @submit="onLoginSubmit"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import loginForm from '@/components/forms/auth/LoginForm';
import workerCaller from '@/util/workerCaller';

import redirectHandler from '@/util/redirectHandler';

export default {
  components: { loginForm },
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
      this.password = pass;

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

      const kdfPass = await workerCaller('derivePassword', this.password, this.encryptedServerData.kdf_password_salt);
      const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
        workerCaller('decryptMasterKey', kdfPass, this.encryptedServerData.mnemonic_master_key_encryption_iv, this.encryptedServerData.encrypted_mnemonic_master_key),
        workerCaller('decryptMasterKey', kdfPass, this.encryptedServerData.wordlist_master_key_encryption_iv, this.encryptedServerData.encrypted_wordlist_master_key)
      ]);

      const [ mnemonicIndices, wordlist ] = await Promise.all([
        workerCaller('decryptMnemonic', mnemonicMasterKey, this.encryptedServerData.mnemonic_encryption_iv, this.encryptedServerData.encrypted_mnemonic),
        workerCaller('decryptWordlist', wordlistMasterKey, this.encryptedServerData.wordlist_encryption_iv, this.encryptedServerData.encrypted_wordlist)
      ]);

      const isValidWordlist = !!(wordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
      if (!isValidWordlist) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const mnemonic = await workerCaller('indicesToMnemonic', mnemonicIndices, wordlist);
      const publicKeys = await workerCaller('getPublicKeys', mnemonic);
      this.setPublicKeys(publicKeys);

      try {
        await this.loginStep2({ key: publicKeys[188] });
      } catch (err) {
        this.inProgress = false;
        return;
      }

      if (this.userStatus.res && !this.userStatus.res.mnemonic_confirmed) {
        this.setMnemonic(mnemonic);
      }

      this.$router.push(redirectHandler(this.userStatus.res, this.$route.name));
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
