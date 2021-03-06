<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h4 class="form-headline pb-3">Lost Password</h4>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>

        <template v-if="confirmEmailStatus.err.length > 0">
          <small v-if="tokenNotFound" class="text-danger d-block">Could not find this token in the database.</small>
          <small v-if="tokenExpired" class="text-danger d-block">Token expired.</small>
        </template>

        <template v-else-if="tokenUsed">
          <small class="text-danger d-block">Token was already used. Please request a new one.</small>
          <b-button variant="info" class="btn-rounded text-uppercase mt-4" @click="$router.push({ name: 'LostPasswordStep1' })">Request new one</b-button>
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
            <template v-if="step === 'tfa' && userStatus.res.mnemonic_confirmed === false"> <!-- When need to reset mnemonic -->
              <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" ask-for-tfa @submit="onGenerateNewData"/>
            </template>
            <template v-else-if="step === 'tfa'">
              <lost-password-tfa-form v-show="!loading && !lostPasswordStatus.res" :loading="loading" :errors="lostPasswordStatus.err" @submit="onTfaSubmitClick"/>
            </template>
            <template v-else-if="step === 'mnemonic'">
              <lost-password-mnemonic-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :mnemonic-error="mnemonicError" @submit="onMnemonicSubmitClick"/>
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

      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['lostPasswordStatus', 'confirmEmailStatus', 'userStatus', 'sep10Challenge', 'lockoutTime']),
    loading () {
      return this.inProgress || this.lostPasswordStatus.loading || this.userStatus.loading;
    },
    tokenUsed () {
      if (!this.confirmEmailStatus.res) return false;
      return !!(this.confirmEmailStatus.res.token_already_confirmed);
    },
    tokenNotFound () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1000));
    },
    tokenExpired () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1006));
    },
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
    this.step = 'tfa';
  },

  methods: {
    ...mapActions([
      'getUserStatus',
      'confirmEmail',
      'setLostPasswordTfa',
      'lostPasswordUpdate',
      'updateSecurityData',
      'setMnemonic',
      'setPublicKeys',
      'resetTfa',
      'logout',
      'loginStep2',
      'updateSep10'
    ]),

    async onTfaSubmitClick (tfaCode) {
      this.inProgress = true;
      // need to update SEP10 here, because setLostPasswordTfa will give another JWT which does not works with SEP10 endpoint
      await this.updateSep10();
      if (this.lockoutTime) {
        this.inProgress = false;
        return;
      }

      await this.setLostPasswordTfa(tfaCode);
      if (this.lockoutTime) {
        this.inProgress = false;
        return;
      }

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
      const pk0 = this.lostPasswordStatus.res.public_key_0;
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

    async onGenerateNewData ({ password, twoFactorCode }) {
      this.inProgress = true;

      const newMnemonic = await workerCaller('generateMnemonic');
      this.setMnemonic(newMnemonic);

      const securityData = await CryptoHelper.generateSecurityData(password, newMnemonic);

      await this.updateSecurityData({
        kdf_salt: securityData.kdf_salt,
        mnemonic_master_key: securityData.mnemonic_master_key,
        mnemonic_master_iv: securityData.mnemonic_master_iv,
        wordlist_master_key: securityData.wordlist_master_key,
        wordlist_master_iv: securityData.wordlist_master_iv,
        mnemonic: securityData.encrypted_mnemonic,
        mnemonic_iv: securityData.encryption_mnemonic_iv,
        wordlist: securityData.encrypted_wordlist,
        wordlist_iv: securityData.encryption_wordlist_iv,
        public_key_0: securityData.public_key,

        tfa_code: twoFactorCode,
      });

      if (this.lostPasswordStatus.err.length > 0 && this.lostPasswordStatus.err.find(err => err.error_code === 1000)) {
        this.inProgress = false;
        return;
      } else if (this.lostPasswordStatus.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      this.step = 'finish';
      await this.logout();
      this.inProgress = false;
    },

    async onPasswordSubmitClick ({ password }) {
      this.inProgress = true;
      const securityData = await CryptoHelper.generateSecurityData(password, this.mnemonic);

      const signedTransaction = await CryptoHelper.signSep10Challenge(securityData.secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      await this.lostPasswordUpdate({
        encrypted_mnemonic: securityData.encrypted_mnemonic,
        encrypted_wordlist: securityData.encrypted_wordlist,
        encryption_mnemonic_iv: securityData.encryption_mnemonic_iv,
        encryption_wordlist_iv: securityData.encryption_wordlist_iv,
        kdf_salt: securityData.kdf_salt,
        mnemonic: securityData.mnemonic,
        mnemonic_master_iv: securityData.mnemonic_master_iv,
        mnemonic_master_key: securityData.mnemonic_master_key,
        public_key_0: securityData.public_key,
        wordlist_master_iv: securityData.wordlist_master_iv,
        wordlist_master_key: securityData.wordlist_master_key,

        sep10_transaction: signedTransaction,
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
