<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="8" md="6" lg="5" xl="4">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase">Change 2FA Secret</h4>
        <transition v-if="inProgress" name="fade">
          <div class="loading-indicator">Loading...</div>
        </transition>
        <template v-if="step === 'password'" v-show="!loading">
          <change-tfa-password-form :loading="loading" :errors="resetTfaStatus.err" :decrypt-error="decryptError" @submit="onPasswordSubmitClick"/>
        </template>
        <template v-if="step === 'qr'" v-show="!loading">
          <change-tfa-form :tfa-data="tfaData" :loading="loading" :errors="resetTfaStatus.err" :decrypt-error="decryptError" @submit="onTfaSubmit"/>
        </template>
        <template v-if="step === 'finish'">
          Your 2FA Secret has been changed successfully.<br>
          <button @click="onDoneClick">Done</button>
        </template>
        <template v-if="step === 'error'">
          Cannot update 2FA, please try again later.
        </template>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import workerCaller from '@/util/workerCaller';

import changeTfaPasswordForm from '@/components/forms/ChangeTfaPasswordForm';
import changeTfaForm from '@/components/forms/ChangeTfaForm';

export default {
  components: { changeTfaPasswordForm, changeTfaForm },
  data () {
    return {
      inProgress: false,
      decryptError: false,
      step: 'password',
    };
  },
  computed: {
    ...mapGetters(['userAuthData', 'resetTfaStatus', 'tfaData']),
    loading () {
      return this.inProgress || this.resetTfaStatus.loading;
    }
  },
  async created () {
    this.inProgress = true;
    if (!this.userAuthData.res) {
      await this.getUserAuthData();
    }
    this.inProgress = false;
  },
  mounted () {
    this.decryptError = false;
    this.inProgress = false;
    this.step = 'password';
  },
  methods: {
    ...mapActions(['getUserAuthData', 'resetTfa', 'confirmNewTfa']),
    async onPasswordSubmitClick (currentPassword) {
      this.inProgress = true;

      const authData = this.userAuthData.res;

      const oldKdfPass = await workerCaller('derivePassword', currentPassword, authData.kdf_password_salt);
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

      this.step = 'qr';
      // await this.getUserStatus();

      // this.$router.push({ name: 'ConfirmTfa' });
    },
    async onTfaSubmit (tfaCode) {
      this.inProgress = true;
      await this.confirmNewTfa(tfaCode);
      this.inProgress = false;

      if (this.resetTfaStatus.err.length > 0) {
        return;
      }

      this.step = 'finish';
    },
    onDoneClick () {
      this.$router.push({ name: 'Dashboard' });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
