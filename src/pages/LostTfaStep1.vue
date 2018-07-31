<template>
  <div class="page-box form">
    <h1>Lost 2FA Secret</h1>
    <div v-if="inProgress">Loading...</div>
    <div v-if="emailSuccess">
      <h3>Lost 2FA Secret lost email sent</h3>
      <p>For resetting your 2FA Secret, an email has been sent to your email account. Please check your inbox and follow the instructions in the received email to reset your 2FA Secret.</p>
      <div v-if="emailLostTfaResent" class="info">Resent email</div>
      <button @click="onEmailLostTfaResendClick">Resend email</button>
      <button @click="onDoneClick">Done</button>
    </div>
    <lost-tfa-email-form v-if="!emailSuccess" v-show="!loading && !lostTfaStatus.res" :loading="loading" :errors="lostTfaStatus.err" @submit="onEmailSubmitClick"/>
    <confirm-email-form v-if="emailNotConfirmed" :email-resent="emailResent" :already-confirmed-failed="alreadyConfirmedFailed" @recheck="onEmailRecheckClick" @resend="onEmailResendClick"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import lostTfaForm from '@/components/forms/auth/LostTfaForm';
import lostTfaEmailForm from '@/components/forms/auth/LostTfaEmailForm';
import lostTfaPasswordForm from '@/components/forms/auth/LostTfaPasswordForm';
import confirmEmailForm from '@/components/forms/auth/ConfirmEmailForm';

export default {
  components: { lostTfaEmailForm, lostTfaPasswordForm, lostTfaForm, confirmEmailForm },
  data () {
    return {
      inProgress: false,
      emailSuccess: false,
      lastEmail: null,
      alreadyConfirmedFailed: false,
      emailResent: false,
      emailLostTfaResent: false,
    };
  },
  computed: {
    ...mapGetters(['lostTfaStatus', 'resendEmailStatus']),
    loading () {
      return this.inProgress || this.lostTfaStatus.loading;
    },
    emailNotConfirmed () {
      return !!(this.lostTfaStatus.err.find(err => err.error_code === 1010));
    }
  },
  methods: {
    ...mapActions(['initLostTfa', 'resendConfirmationEmail']),
    async onEmailSubmitClick (email) {
      email = email || this.lastEmail;
      this.inProgress = true;
      await this.initLostTfa(email);
      this.lastEmail = email;
      if (this.lostTfaStatus.err.length === 0) {
        this.emailSuccess = true;
      } else if (this.lostTfaStatus.err.find(err => err.error_code === 1010)) {
        await this.resendConfirmationEmail(email);
      }
      this.inProgress = false;
    },
    async onEmailRecheckClick () {
      const email = this.lastEmail;
      this.alreadyConfirmedFailed = false;
      this.inProgress = true;
      await this.initLostTfa(email);
      if (this.lostTfaStatus.err.length === 0) {
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
    async onEmailLostTfaResendClick () {
      await this.onEmailSubmitClick();
      this.emailLostTfaResent = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
