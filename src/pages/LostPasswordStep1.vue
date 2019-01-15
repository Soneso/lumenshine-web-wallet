<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h3 class="form-headline">Lost Password</h3>
        <spinner v-if="inProgress" align="center"/>

        <template v-if="emailSuccess">
          <div class="text-success py-3">Email sent</div>
          <p>For resetting your password, an email has been sent to your email account. Please check your inbox and follow the instructions in the received email to reset your password.</p>
          <b-button variant="warning" class="text-uppercase btn-rounded mt-4" @click="onEmailLostPasswordResendClick">Resend email</b-button>
          <br>
          <small v-if="emailLostPasswordResent" class="d-block pt-2 text-success">Resent email</small>
          <b-button variant="info" class="mt-4 text-uppercase btn-rounded" @click="onDoneClick">Done</b-button>
        </template>

        <lost-password-email-form v-else v-show="lockoutTime || (!loading && !lostPasswordStatus.res)" :loading="loading" :errors="lostPasswordStatus.err" @submit="onEmailSubmitClick"/>
        <confirm-email-form v-if="emailNotConfirmed" :email-resent="emailResent" :already-confirmed-failed="alreadyConfirmedFailed" @recheck="onEmailRecheckClick" @resend="onEmailResendClick"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import lostPasswordEmailForm from '@/components/forms/auth/LostPasswordEmailForm';
import confirmEmailForm from '@/components/forms/auth/ConfirmEmailForm';
import spinner from '@/components/ui/spinner';

export default {
  components: { lostPasswordEmailForm, confirmEmailForm, spinner },
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
    ...mapGetters(['lostPasswordStatus', 'resendEmailStatus', 'lockoutTime']),
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
      if (this.lostPasswordStatus.err.length === 0 && !this.lockoutTime) {
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
        setTimeout(() => { this.emailResent = false; }, 3e3);
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
