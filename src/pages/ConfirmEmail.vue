<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 text-center single-card">
        <template v-if="!hasToken">
          <h4 class="form-headline text-uppercase pl-2">Setup Wallet</h4>
          <h6 class="text-danger py-3">Email confirmation required</h6>
          <p>In order to be able continue the setup process, you need to confirm your email address first. A mail with a confirmation link has been sent to your inbox. Please follow the instructions from the received mail to confirm your email address.</p>
          <transition v-if="inProgress" name="fade">
            <div class="loading-indicator">Loading...</div>
          </transition>
          <div v-else>
            <div class="py-3">
              <b-button type="submit" variant="info" class="btn-rounded text-uppercase" @click="onCheckConfirmation">Continue</b-button>
              <div v-if="alreadyConfirmedFailed" class="text-danger pt-2">Please confirm your email address first.</div>
            </div>
            <br>
            <b-button type="submit" variant="primary" class="btn-rounded text-uppercase" @click="onResendEmail">Resend confirmation email</b-button>
            <div v-if="emailResent && resendEmailStatus.err.length > 0" class="text-danger pt-2">An error happened during email resend</div>
            <div v-else-if="emailResent" class="text-success pt-2">Resent confirmation mail</div>
          </div>
        </template>
        <template v-else>
          <h4 class="form-headline text-uppercase pl-2">Email Confirmation</h4>
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
              <p class="text-success pb-4">Thank you for confirming your email address.</p>
              <b-button type="submit" variant="info" class="btn-rounded text-uppercase" @click="onLoginClick">Login</b-button>
            </div>
          </div>
        </template>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import redirectHandler from '@/util/redirectHandler';

export default {
  data () {
    return {
      inProgress: false,
      emailResent: false,
      alreadyConfirmedFailed: false,
    };
  },
  computed: {
    ...mapGetters(['confirmEmailStatus', 'resendEmailStatus', 'userStatus']),
    hasToken () {
      return this.$route.params.token;
    }
  },
  async created () {
    if (this.$route.params.token) {
      await this.confirmEmail(this.$route.params.token);
      await this.getUserStatus();
    }
  },
  methods: {
    ...mapActions(['confirmEmail', 'resendConfirmationEmail', 'getUserStatus']),
    async onResendEmail () {
      this.inProgress = true;
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
    onLoginClick () {
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
