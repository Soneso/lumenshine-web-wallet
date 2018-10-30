<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h3 class="form-headline pb-3 text-center">Change 2FA Secret</h3>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <spinner v-if="inProgress" align="center"/>

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
import { mapActions, mapMutations, mapGetters } from 'vuex';

import changeTfaPasswordForm from '@/components/forms/ChangeTfaPasswordForm';
import changeTfaForm from '@/components/forms/ChangeTfaForm';
import spinner from '@/components/ui/spinner1.vue';

import CryptoHelper from '@/helpers/CryptoHelper';

export default {
  components: { changeTfaPasswordForm, changeTfaForm, spinner },

  data () {
    return {
      inProgress: false,
      decryptError: false,
      step: 'password',
      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['userAuthData', 'resetTfaStatus', 'tfaData', 'change2faStep', 'sep10Challenge']),
    loading () {
      return this.inProgress || this.resetTfaStatus.loading;
    }
  },

  watch: {
    change2faStep () {
      if (this.change2faStep === 'password') {
        this.step = 'password';
      }
    },
    step () {
      if (this.step === 'error' || this.step === 'finish') {
        this.mutateChange2faStep('');
      }
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
    ...mapMutations(['mutateChange2faStep']),
    ...mapActions(['getUserAuthData', 'resetTfa', 'confirmNewTfa', 'updateSep10']),

    async onPasswordSubmitClick (currentPassword) {
      this.inProgress = true;

      const authData = this.userAuthData.res;

      const decryptedOldServerData = await CryptoHelper.decryptServerData(currentPassword, authData);

      if (!decryptedOldServerData) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      await this.updateSep10();
      const signedTransaction = await CryptoHelper.signSep10Challenge(decryptedOldServerData.secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.hasUnknownError = true;
        this.inProgress = false;
        return;
      }

      await this.resetTfa(signedTransaction);

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
