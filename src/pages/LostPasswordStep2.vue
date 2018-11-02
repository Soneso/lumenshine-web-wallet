<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h4 class="form-headline pb-3">Lost Password</h4>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <template v-if="confirmEmailStatus.err.length > 0">
          <small v-if="tokenNotFound" class="text-danger d-block">Could not find this token in the database.</small>
          <small v-if="tokenExpired" class="text-danger d-block">Token expired.</small>
          <small v-if="emailAlreadyConfirmed" class="text-danger d-block">Email address already confirmed.</small>
        </template>
        <template v-else-if="userStatus.res">
          <spinner v-if="inProgress" align="center"/>

          <template v-if="userStatus.res.tfa_confirmed === false">
            <template v-if="userStatus.res.mnemonic_confirmed === true">
              <h3>Error - 001</h3>
              <p>Please contact</p>
              <p><a :href="`mailto:${config.SUPPORT_MAIL}?subject=${encodeURIComponent('Error - 001 - Lost password')}`">support</a></p>
            </template>
            <template v-else-if="userStatus.res.mnemonic_confirmed === false">
              <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" @submit="onGenerateNewData"/>
            </template>
          </template>
          <template v-else> <!-- userStatus.res.tfa_confirmed === true -->
            <template v-if="step === 'tfa'">
              <lost-password-tfa-form v-show="!loading && !lostPasswordStatus.res" :loading="loading" :errors="lostPasswordStatus.err" @submit="onTfaSubmitClick"/>
            </template>
            <template v-else-if="step === 'mnemonic'">
              <lost-password-mnemonic-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :mnemonic-error="mnemonicError" @submit="onMnemonicSubmitClick"/>
            </template>
            <template v-else-if="step === 'password' && userStatus.res.mnemonic_confirmed === false"> <!-- When need to reset mnemonic -->
              <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" @submit="onGenerateNewData"/>
            </template>
            <template v-else-if="step === 'password'">
              <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" @submit="onPasswordSubmitClick"/>
            </template>
          </template>
        </template>

        <template v-else-if="step === 'finish'">
          <div class="text-center text-success pb-4">Your password has been reset successfully</div>
          <b-button variant="info" class="btn-rounded text-uppercase" @click="$router.push({ name: 'Login' })">Login</b-button>
        </template>

        <template v-else-if="step === 'error'">
          <div v-if="emailAlreadyConfirmed" class="text-center text-danger pb-4">Cannot change password, please try again later.</div>
        </template>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import workerCaller from '@/util/workerCaller';

import CryptoHelper from '@/helpers/CryptoHelper';

import lostPasswordTfaForm from '@/components/forms/auth/LostPasswordTfaForm';
import lostPasswordMnemonicForm from '@/components/forms/auth/LostPasswordMnemonicForm';
import lostPasswordForm from '@/components/forms/auth/LostPasswordForm';
import spinner from '@/components/ui/spinner';

export default {
  components: { lostPasswordTfaForm, lostPasswordMnemonicForm, lostPasswordForm, spinner },

  data () {
    return {
      inProgress: false,
      emailSuccess: false,
      step: 'tfa',
      mnemonicError: false,
      mnemonic: null,
      lastTfaCode: null,

      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['lostPasswordStatus', 'confirmEmailStatus', 'userStatus']),
    loading () {
      return this.inProgress || this.lostPasswordStatus.loading || this.userStatus.loading;
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

  async created () {
    this.config = config;
    if (this.$route.params.token) {
      this.inProgress = true;
      await this.confirmEmail(this.$route.params.token);
      await this.getUserStatus();
      this.inProgress = false;
    }
  },

  mounted () {
    this.mnemonicError = false;
    this.inProgress = false;
    this.emailSuccess = false;
    this.updateError = false;
    this.lastTfaCode = null;
    this.step = 'tfa';
  },

  methods: {
    ...mapActions(['getUserStatus', 'confirmEmail', 'setLostPasswordTfa', 'lostPasswordUpdate', 'updateSecurityData', 'setMnemonic', 'setPublicKeys', 'resetTfa', 'logout', 'loginStep2', 'updateSep10']),
    async onTfaSubmitClick (tfaCode) {
      this.inProgress = true;
      await this.setLostPasswordTfa(tfaCode);
      this.lastTfaCode = tfaCode;

      if (this.lostPasswordStatus.err.length === 0) {
        if (this.userStatus.res.mnemonic_confirmed === false) {
          this.step = 'password';
        } else {
          this.step = 'mnemonic';
        }
      }

      this.inProgress = false;
    },

    async onMnemonicSubmitClick (mnemonic) {
      this.inProgress = true;
      this.mnemonicError = false;
      const pk0 = this.lostPasswordStatus.res.public_key;
      const isValidMnemonic = await workerCaller('validateMnemonic', mnemonic);

      if (!isValidMnemonic) {
        this.mnemonicError = true;
        this.inProgress = false;
        return;
      }

      const pk0Mnemonic = await workerCaller('getPublicKey', mnemonic, 0);
      if (pk0 !== pk0Mnemonic) {
        this.mnemonicError = true;
        this.inProgress = false;
        return;
      }

      this.mnemonic = mnemonic;
      this.step = 'password';
      this.inProgress = false;
    },

    async onGenerateNewData (password) {
      this.inProgress = true;

      const newMnemonic = await workerCaller('generateMnemonic');
      this.setMnemonic(newMnemonic);

      const securityData = await CryptoHelper.generateSecurityData(password, newMnemonic);

      await this.updateSecurityData({
        kdf_salt: securityData.kdfSalt,
        mnemonic_master_key: securityData.mnemonic_master_key,
        mnemonic_master_iv: securityData.mnemonic_master_iv,
        wordlist_master_key: securityData.wordlist_master_key,
        wordlist_master_iv: securityData.wordlist_master_iv,
        mnemonic: securityData.encrypted_mnemonic,
        mnemonic_iv: securityData.encryption_mnemonic_iv,
        wordlist: securityData.encryptedWordlist,
        wordlist_iv: securityData.encryption_wordlist_iv,
        public_key: securityData.public_key,

        tfa_code: this.lastTfaCode,
      });

      await this.updateSep10();
      const signedTransaction = await CryptoHelper.signSep10Challenge(securityData.secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      // generate new tfa secret, needed by next screen (setup screen)
      await this.resetTfa(signedTransaction);
      await this.getUserStatus();

      const publicKeys = await workerCaller('getPublicKeys', newMnemonic);
      this.setPublicKeys(publicKeys);

      await this.loginStep2({ sep10_transaction: signedTransaction });

      if (this.lostPasswordStatus.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      this.inProgress = false;
      this.$router.push({ name: 'ConfirmTfa' });
    },

    async onPasswordSubmitClick (password) {
      this.inProgress = true;
      const securityData = await CryptoHelper.generateSecurityData(password, this.mnemonic);

      await this.lostPasswordUpdate({
        encrypted_mnemonic: securityData.encrypted_mnemonic,
        encrypted_wordlist: securityData.encrypted_wordlist,
        encryption_mnemonic_iv: securityData.encryption_mnemonic_iv,
        encryption_wordlist_iv: securityData.encryption_wordlist_iv,
        kdf_salt: securityData.kdf_salt,
        mnemonic: securityData.mnemonic,
        mnemonic_master_iv: securityData.mnemonic_master_iv,
        mnemonic_master_key: securityData.mnemonic_master_key,
        public_key: securityData.public_key,
        wordlist_master_iv: securityData.wordlist_master_iv,
        wordlist_master_key: securityData.wordlist_master_key,

        public_key_188: 'GAMJCCE5HESTOMPDRTFS332QXZQRDPTGHHGLTNVHB2IBI612' + Math.random().toString(36).substring(2, 10).toUpperCase(), // TODO remove
      });

      if (this.lostPasswordStatus.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      this.step = 'finish';
      await this.logout();
      this.inProgress = false;
    }
  }
};
</script>
