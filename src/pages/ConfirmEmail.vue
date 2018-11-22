<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 text-center single-card">
        <template v-if="!hasToken">
          <h4 class="form-headline text-uppercase pl-2">Setup Wallet</h4>
          <h6 class="text-danger py-3">VERIFY YOUR EMAIL ADDRESS</h6>
          <p>We sent a verification message to {{ userStatus.email }}. Click the link to verify your email address.</p>
          <spinner v-if="inProgress" align="center"/>

          <template v-else>
            <div class="pt-4 pb-3">
              <b-button type="submit" variant="info" class="btn-rounded text-uppercase" @click="onCheckConfirmation">Continue</b-button>
              <div v-if="alreadyConfirmedFailed" class="text-danger pt-2">Please confirm your email address first.</div>
            </div>
            <br>
            <b-button v-if="!isMobile" type="submit" variant="warning" class="btn-rounded text-uppercase" @click="onResendEmail">RESEND VERIFICATION LINK</b-button>
            <div v-else="" class="text-white bg-warning p-2 btn-rounded" @click="onResendEmail">RESEND VERIFICATION LINK</div>
            <div v-if="emailResent && resendEmailStatus.err.length > 0" class="text-danger pt-2">An error happened during email resend</div>
            <div v-else-if="emailResent" class="text-success pt-2">Resent confirmation mail</div>
          </template>
        </template>
        <template v-else> <!-- hasToken = true -->
          <h4 class="form-headline text-uppercase pl-2">Continue your account setup</h4>
          <p v-if="confirmEmailStatus.loading" class="text-info py-5">
            Confirming email address. Loading...
          </p>
          <div v-else="" class="pt-4 pb-1">
            <div v-if="confirmEmailStatus.err.length > 0" class="text-danger">
              <div v-for="err in confirmEmailStatus.err" :key="err.error_code" class="pb-2">Error: {{ err.error_message }}</div>
              <div v-if="confirmEmailStatus.err.find(err => err.error_code === 1000)" class="pb-2">Invalid confirmation URL!</div>
              <div v-if="confirmEmailStatus.err.find(err => err.error_code === 1006)" class="pb-2">Token expired!</div>
              <div v-if="confirmEmailStatus.err.find(err => err.error_code === 1008)" class="pb-2">Email already confirmed!</div>
            </div>
            <div v-else>
              <spinner v-if="inProgress" align="center" message="Logging you in..." width="150"/>
              <template v-else="">
                <div class="pb-5">Thank you for confirming your email address. Let's continue with the account setup so you can access your wallet.</div>
                <div v-if="hasUnknownError" class="text-danger text-center pb-2">Unknown error, please try again later!</div>

                <login-form
                  v-show="decryptError || (!loading && !loginStatus.res)"
                  :loading="loading"
                  :errors="loginStatus.err"
                  :decrypt-error="decryptError"
                  :show-email-field="showFullLoginForm"
                  :show-tfa-field="showFullLoginForm"
                  :should-continue="true"
                  class="text-left"
                  @submit="onLoginSubmit"/>
              </template>
            </div>
          </div>
        </template>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import LoginForm from '@/components/forms/auth/LoginForm';

import CryptoHelper from '@/helpers/CryptoHelper';

import redirectHandler from '@/util/redirectHandler';
import spinner from '@/components/ui/spinner';

export default {
  components: { LoginForm, spinner },

  data () {
    return {
      emailResent: false,
      alreadyConfirmedFailed: false,

      inProgress: false,
      decryptError: false,

      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters([
      'isMobile',
      'confirmEmailStatus',
      'resendEmailStatus',
      'userStatus',
      'loginStatus',
      'encryptedServerData',
      'userAuthData',
      'sep10Challenge'
    ]),
    hasToken () {
      return this.$route.params.token;
    },
    loading () {
      return this.inProgress || this.loginStatus.loading;
    },
    showFullLoginForm () {
      return !this.confirmEmailStatus.res || this.confirmEmailStatus.res.token_already_confirmed;
    },
  },

  async created () {
    if (this.$route.params.token) {
      await this.confirmEmail(this.$route.params.token);
      await this.getUserStatus();
      await this.getUserAuthData();
    }
  },

  methods: {
    ...mapActions([
      'confirmEmail',
      'resendConfirmationEmail',
      'getUserStatus',
      'loginStep1',
      'loginStep2',
      'setMnemonic',
      'setPublicKeys',
      'getUserAuthData',
      'setEmail',
      'clearAuthToken',
      'updateSep10'
    ]),

    async onResendEmail () {
      this.inProgress = true;
      this.alreadyConfirmedFailed = false;
      await this.resendConfirmationEmail(this.userStatus.email);
      this.inProgress = false;
      if (this.resendEmailStatus.err.length === 0) {
        this.emailResent = true;
      }
    },

    async onCheckConfirmation () {
      this.alreadyConfirmedFailed = false;
      this.inProgress = true;
      await this.getUserStatus();
      this.inProgress = false;
      if (this.userStatus.err.length !== 0 || !this.userStatus.res.mail_confirmed) {
        this.alreadyConfirmedFailed = true;
        return;
      }
      const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
      if (redirectRes) {
        this.$router.push(redirectRes);
      }
    },

    async onLoginSubmit (email, pass, tfaCode) {
      this.inProgress = true;
      this.decryptError = false;

      let authData;
      if (this.showFullLoginForm) {
        try {
          await this.loginStep1({ email, tfa_code: tfaCode });
          authData = this.encryptedServerData;
        } catch (err) {
          this.inProgress = false;
          return;
        }

        if (this.loginStatus.err.length > 0) {
          this.inProgress = false;
          return;
        }
      } else { // use partial JWT
        authData = this.userAuthData.res;
        if (this.confirmEmailStatus.res.email) {
          await this.setEmail(this.confirmEmailStatus.res.email);
        }
      }

      const decryptedServerData = await CryptoHelper.decryptServerData(pass, authData);

      if (!decryptedServerData) {
        this.decryptError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      if (!this.showFullLoginForm) {
        await this.updateSep10();
      }
      const signedTransaction = await CryptoHelper.signSep10Challenge(decryptedServerData.secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      await this.setPublicKeys(decryptedServerData.publicKeys);

      try {
        await this.loginStep2({ sep10_transaction: signedTransaction });
      } catch (err) {
        this.hasUnknownError = true;
        this.inProgress = false;
        await this.clearAuthToken();
        return;
      }

      await this.getUserStatus();

      if (this.userStatus.res && !this.userStatus.res.mnemonic_confirmed) {
        await this.setMnemonic(decryptedServerData.mnemonic);
      }

      this.$router.push(redirectHandler(this.userStatus.res, this.$route.name));
    },
  }
};
</script>
