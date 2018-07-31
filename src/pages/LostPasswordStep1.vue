<template>
  <div class="page-box form">
    <h1>Lost Password</h1>
    <div v-if="inProgress">Loading...</div>
    <div v-if="emailSuccess">
      <h3>Password lost email sent</h3>
      <p>For resetting your password, an email has been sent to your email account. Please check your inbox and follow the instructions in the received email to reset your password.</p>
      <div v-if="emailLostPasswordResent" class="info">Resent email</div>
      <button @click="onEmailLostPasswordResendClick">Resend email</button>
      <button @click="onDoneClick">Done</button>
    </div>
    <lost-password-email-form v-if="!emailSuccess" v-show="!loading && !lostPasswordStatus.res" :loading="loading" :errors="lostPasswordStatus.err" @submit="onEmailSubmitClick"/>
    <confirm-email-form v-if="emailNotConfirmed" :email-resent="emailResent" :already-confirmed-failed="alreadyConfirmedFailed" @recheck="onEmailRecheckClick" @resend="onEmailResendClick"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import lostPasswordEmailForm from '@/components/forms/auth/LostPasswordEmailForm';
import confirmEmailForm from '@/components/forms/auth/ConfirmEmailForm';

export default {
  components: { lostPasswordEmailForm, confirmEmailForm },
  data () {
    return {
      inProgress: false,
      emailSuccess: false,
      lastEmail: null,
      alreadyConfirmedFailed: false,
      emailResent: false,
      emailLostPasswordResent: false,
    };
  },
  computed: {
    ...mapGetters(['lostPasswordStatus', 'resendEmailStatus']),
    loading () {
      return this.inProgress || this.lostPasswordStatus.loading;
    },
    emailNotConfirmed () {
      return !!(this.lostPasswordStatus.err.find(err => err.error_code === 1010));
    }
  },
  mounted () {
    this.inProgress = false;
    this.emailSuccess = false;
    this.updateError = false;
    this.alreadyConfirmedFailed = false;
    this.emailResent = false;
  },
  methods: {
    ...mapActions(['initLostPassword', 'resendConfirmationEmail']),
    async onEmailSubmitClick (email) {
      email = email || this.lastEmail;
      this.inProgress = true;
      await this.initLostPassword(email);
      this.lastEmail = email;
      if (this.lostPasswordStatus.err.length === 0) {
        this.emailSuccess = true;
      } else if (this.lostPasswordStatus.err.find(err => err.error_code === 1010)) {
        await this.resendConfirmationEmail(email);
      }
      this.inProgress = false;
    },
    async onEmailRecheckClick () {
      const email = this.lastEmail;
      this.alreadyConfirmedFailed = false;
      this.inProgress = true;
      await this.initLostPassword(email);
      if (this.lostPasswordStatus.err.length === 0) {
        this.emailSuccess = true;
      } else {
        this.alreadyConfirmedFailed = true;
      }
      this.inProgress = false;
    },
    async onEmailResendClick (email) {
      email = email || this.lastEmail;
      this.inProgress = true;
      this.emailResent = false;
      await this.resendConfirmationEmail(email);
      if (this.resendEmailStatus.err.length === 0) {
        this.emailResent = true;
      }
      this.inProgress = false;
    },
    onDoneClick () {
      this.$router.push({ name: 'Login' });
    },
    async onEmailLostPasswordResendClick () {
      await this.onEmailSubmitClick();
      this.emailLostPasswordResent = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
