<template>
  <div class="page-box form">
    <h1>Lost 2FA Secret</h1>
    <!-- Token: {{$route.params.token}} -->
    <div v-if="confirmEmailStatus.err.length > 0">
      <div v-if="tokenNotFound" class="error">Token could not be found in the database.</div>
      <div v-if="tokenExpired" class="error">Token expired.</div>
      <div v-if="emailAlreadyConfirmed" class="error">Email address already confirmed.</div>
    </div>
    <div v-else-if="userStatus.res">
      <div v-if="inProgress">Loading...</div>
      <div v-if="userStatus.res.tfa_confirmed === false">
        <div v-if="userStatus.res.mnemonic_confirmed === true">
          <h3>Error - 002</h3>
          <p>Please contact</p>
          <p><a :href="`mailto:${config.SUPPORT_MAIL}?subject=${encodeURIComponent('Error - 002 - Lost 2FA Secret')}`">support</a></p>
        </div>
        <div v-else-if="userStatus.res.mnemonic_confirmed === false">
          <lost-tfa-password-form v-show="!loading" :loading="loading" :errors="lostTfaStatus.err" :decrypt-error="decryptError" @submit="onLoginToSetup"/>
        </div>
      </div>
      <div v-else> <!-- userStatus.res.tfa_confirmed === true -->
        <div v-if="step === 'password'">
          <lost-tfa-password-form v-show="!loading && !lostTfaStatus.res" :decrypt-error="decryptError" :loading="loading" :errors="lostTfaStatus.err" @submit="onPasswordSubmitClick"/>
        </div>
        <div v-if="step === 'tfa'">
          <lost-tfa-form v-show="!loading && !lostTfaStatus.res" :tfa-data="tfaData" :loading="loading" :errors="registration2FAStatus.err" @submit="onTfaSubmitClick"/>
        </div>
      </div>
    </div>
    <div v-if="step === 'finish'">
      <p class="info">Your 2FA Secret has been reset successfully.</p>
      <button @click="$router.push({ name: 'Login' })">Login</button>
    </div>
    <div v-if="step === 'error'">
      Cannot update 2FA, please try again later.
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import workerCaller from '@/util/workerCaller';

import config from '@/config';

import lostTfaForm from '@/components/forms/auth/LostTfaForm';
import lostTfaPasswordForm from '@/components/forms/auth/LostTfaPasswordForm';

export default {
  components: { lostTfaPasswordForm, lostTfaForm },
  data () {
    return {
      inProgress: false,
      decryptError: false,
      step: 'password',
      config
    };
  },
  computed: {
    ...mapGetters(['lostTfaStatus', 'confirmEmailStatus', 'userAuthData', 'resetTfaStatus', 'tfaData', 'registration2FAStatus', 'userStatus', 'checkPasswordNeeded']),
    loading () {
      return this.inProgress || this.lostTfaStatus.loading;
    },
    tokenNotFound () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1000));
    },
    tokenExpired () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1006));
    },
    emailAlreadyConfirmed () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1008));
    }
  },
  mounted () {
    this.decryptError = false;
    this.inProgress = false;
    this.step = 'password';
  },
  async created () {
    if (this.$route.params.token) {
      this.inProgress = true;
      await this.confirmEmail(this.$route.params.token);
      if (!this.userAuthData.res) {
        await this.getUserAuthData();
      }
      await this.getUserStatus();
      await this.checkResetPasswordNeeded();
      if (!this.checkPasswordNeeded) {
        await this.resetTfa();
        this.step = 'tfa';
      }
      this.inProgress = false;
    }
  },
  methods: {
    ...mapActions(['getUserStatus', 'confirmEmail', 'getUserAuthData', 'resetTfa', 'confirmTwoFactorAuthToken', 'logout', 'setMnemonic', 'setPublicKeys', 'loginStep2', 'checkResetPasswordNeeded']),
    async onPasswordSubmitClick (password) {
      this.inProgress = true;
      if (!this.userAuthData) {
        await this.getUserAuthData();
      }
      if (this.userAuthData.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      const authData = this.userAuthData.res;

      const oldKdfPass = await workerCaller('derivePassword', password, authData.kdf_password_salt);
      const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
        workerCaller('decryptMasterKey', oldKdfPass, authData.mnemonic_master_key_encryption_iv, authData.encrypted_mnemonic_master_key),
        workerCaller('decryptMasterKey', oldKdfPass, authData.wordlist_master_key_encryption_iv, authData.encrypted_wordlist_master_key)
      ]);

      const [ oldMnemonicIndices, oldWordlist ] = await Promise.all([
        workerCaller('decryptMnemonic', mnemonicMasterKey, authData.mnemonic_encryption_iv, authData.encrypted_mnemonic),
        workerCaller('decryptWordlist', wordlistMasterKey, authData.wordlist_encryption_iv, authData.encrypted_wordlist)
      ]);

      const isValidWordlist = !!(oldWordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
      if (!isValidWordlist) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const mnemonic = await workerCaller('indicesToMnemonic', oldMnemonicIndices, oldWordlist);
      const publicKey188 = await workerCaller('getPublicKey', mnemonic, 188);

      await this.resetTfa(publicKey188);

      this.inProgress = false;

      if (this.resetTfaStatus.err.length > 0) {
        this.step = 'error';
        return;
      }

      this.step = 'tfa';
    },
    async onLoginToSetup (password) {
      this.inProgress = true;

      const encryptedData = this.userAuthData.res;

      const kdfPass = await workerCaller('derivePassword', password, encryptedData.kdf_password_salt);
      const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
        workerCaller('decryptMasterKey', kdfPass, encryptedData.mnemonic_master_key_encryption_iv, encryptedData.encrypted_mnemonic_master_key),
        workerCaller('decryptMasterKey', kdfPass, encryptedData.wordlist_master_key_encryption_iv, encryptedData.encrypted_wordlist_master_key)
      ]);

      const [ mnemonicIndices, wordlist ] = await Promise.all([
        workerCaller('decryptMnemonic', mnemonicMasterKey, encryptedData.mnemonic_encryption_iv, encryptedData.encrypted_mnemonic),
        workerCaller('decryptWordlist', wordlistMasterKey, encryptedData.wordlist_encryption_iv, encryptedData.encrypted_wordlist)
      ]);

      const isValidWordlist = !!(wordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
      if (!isValidWordlist) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const mnemonic = await workerCaller('indicesToMnemonic', mnemonicIndices, wordlist);
      this.setMnemonic(mnemonic);
      const publicKeys = await workerCaller('getPublicKeys', mnemonic);
      this.setPublicKeys(publicKeys);

      try {
        await this.loginStep2({ key: publicKeys[188] });
      } catch (err) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      this.inProgress = false;
      this.$router.push({ name: 'ConfirmTfa' });
    },
    async onTfaSubmitClick (tfaCode) {
      this.inProgress = true;
      await this.confirmTwoFactorAuthToken(tfaCode);
      this.inProgress = false;
      if (this.registration2FAStatus.err.length > 0) {
        return;
      }
      await this.logout();
      this.step = 'finish';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
