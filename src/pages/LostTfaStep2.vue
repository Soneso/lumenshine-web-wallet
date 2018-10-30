<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h3 class="form-headline pb-3">Lost 2FA Secret</h3>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <template v-if="confirmEmailStatus.err.length > 0">
          <small v-if="tokenNotFound" class="text-danger d-block">Token could not be found in the database.</small>
          <small v-if="tokenExpired" class="text-danger d-block">Token expired.</small>
          <small v-if="emailAlreadyConfirmed" class="text-danger d-block">Email address already confirmed.</small>
        </template>
        <template v-else-if="userStatus.res">
          <spinner v-if="inProgress" align="center"/>

          <template v-if="userStatus.res.tfa_confirmed === false">
            <template v-if="userStatus.res.mnemonic_confirmed === true">
              <p class="text-danger">Error - 002</p>
              <p>Please contact</p>
              <p><a :href="`mailto:${config.SUPPORT_MAIL}?subject=${encodeURIComponent('Error - 002 - Lost 2FA Secret')}`">support</a></p>
            </template>
            <template v-else-if="userStatus.res.mnemonic_confirmed === false">
              <lost-tfa-password-form v-show="!loading" :loading="loading" :errors="lostTfaStatus.err" :decrypt-error="decryptError" @submit="onLoginToSetup"/>
            </template>
          </template>

          <template v-else> <!-- userStatus.res.tfa_confirmed === true -->
            <template v-if="step === 'password'">
              <lost-tfa-password-form v-show="!loading && !lostTfaStatus.res" :decrypt-error="decryptError" :loading="loading" :errors="lostTfaStatus.err" @submit="onPasswordSubmitClick"/>
            </template>
            <template v-if="step === 'tfa'">
              <lost-tfa-form v-show="!loading && !lostTfaStatus.res" :tfa-data="tfaData" :loading="loading" :errors="registration2FAStatus.err" @submit="onTfaSubmitClick"/>
            </template>
          </template>
        </template>

        <template v-if="step === 'finish'">
          <p class="text-success">Your 2FA Secret has been reset successfully.</p>
          <b-button variant="info" class="btn-rounded text-uppercase" @click="$router.push({ name: 'Login' })">Login</b-button>
        </template>

        <div v-if="step == 'error'">
          <p class="text-danger">Cannot update 2FA, please try again later.</p>
        </div>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import CryptoHelper from '@/helpers/CryptoHelper';

import lostTfaForm from '@/components/forms/auth/LostTfaForm';
import lostTfaPasswordForm from '@/components/forms/auth/LostTfaPasswordForm';
import spinner from '@/components/ui/spinner1.vue';

export default {
  components: { lostTfaPasswordForm, lostTfaForm, spinner },

  data () {
    return {
      inProgress: false,
      decryptError: false,
      step: 'password',

      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['lostTfaStatus', 'confirmEmailStatus', 'userAuthData', 'resetTfaStatus', 'tfaData', 'registration2FAStatus', 'userStatus', 'checkPasswordNeeded', 'sep10Challenge']),
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
    this.config = config;
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
    ...mapActions(['getUserStatus', 'confirmEmail', 'getUserAuthData', 'resetTfa', 'confirmTwoFactorAuthToken', 'logout', 'setMnemonic', 'setPublicKeys', 'loginStep2', 'checkResetPasswordNeeded', 'clearAuthToken', 'updateSep10']),
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

      const decryptedServerData = await CryptoHelper.decryptServerData(password, authData);

      if (!decryptedServerData) {
        this.decryptError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      await this.updateSep10();
      const signedTransaction = await CryptoHelper.signSep10Challenge(decryptedServerData.secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      await this.resetTfa(signedTransaction);

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

      const decryptedServerData = await CryptoHelper.decryptServerData(password, encryptedData);

      if (!decryptedServerData) {
        this.decryptError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      await this.updateSep10();
      const signedTransaction = await CryptoHelper.signSep10Challenge(decryptedServerData.secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      try {
        await this.loginStep2({ sep10_transaction: signedTransaction });
      } catch (err) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      this.setMnemonic(decryptedServerData.mnemonic);
      this.setPublicKeys(decryptedServerData.publicKeys);

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
