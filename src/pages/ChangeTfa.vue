<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 :class="['form-headline', 'text-uppercase', {'text-center': step !== 'qr'}]">Change 2FA Secret</h4>
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
          <b-row>
            <b-col class="text-center">
              <h6 class="text-success pt-2 pb-4">Your 2FA Secret has been changed successfully.</h6>
              <b-button variant="info" class="btn-rounded text-uppercase" @click="onDoneClick">Done</b-button>
            </b-col>
          </b-row>
        </template>
        <template v-if="step === 'error'">
          <b-row>
            <b-col class="text-center">
              <h6 class="text-danger pt-2 pb-4">Cannot update 2FA, please try again later.</h6>
            </b-col>
          </b-row>
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
