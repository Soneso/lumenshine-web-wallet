<template>
  <div class="page-box form">
    <div v-if="!hasToken">
      <h1>Setup Wallet</h1>
      <h3>Email confirmation required</h3>
      <p>In order to be able continue the setup process, you need to confirm your email address first. A mail with a confirmation link has been sent to your inbox. Please follow the instructions from the received mail to confirm your email-address.</p>
      <div v-if="inProgress">Loading...</div>
      <div v-else>
        <div>
          <div v-if="alreadyConfirmedFailed" class="error">Please confirm your email address first.</div>
          <button @click="onCheckConfirmation">Continue</button>
        </div>

        <div v-if="emailResent && resendEmailStatus.err.length > 0" class="error">An error happened during email resend</div>
        <div v-else-if="emailResent" class="info">Resent confirmation mail</div>
        <button @click="onResendEmail">Resend confirmation mail</button>
      </div>
    </div>
    <div v-else>
      <h1>Email Confirmation</h1>
      <p v-if="confirmEmailStatus.loading">
        Confirming email address. Loading...
      </p>
      <div v-if="!confirmEmailStatus.loading">
        <div v-if="confirmEmailStatus.err.length > 0" class="error">
          <div v-for="err in confirmEmailStatus.err" :key="err.error_code">Error: {{ err.error_message }}</div>
          <div v-if="confirmEmailStatus.err.find(err => err.error_code === 1000)">Invalid confirmation URL!</div>
          <div v-if="confirmEmailStatus.err.find(err => err.error_code === 1006)">Token expired!</div>
          <div v-if="confirmEmailStatus.err.find(err => err.error_code === 1008)">Email already confirmed!</div>
        </div>
        <div v-else>
          <p>Thank you for confirming your email address.</p>
          <button @click="onLoginClick">Login</button>
        </div>
      </div>
    </div>
  </div>
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
    async onLoginClick () {
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
