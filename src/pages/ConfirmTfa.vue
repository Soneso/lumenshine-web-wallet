<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 text-center">
        <h4 class="form-headline text-uppercase pl-2">Setup Wallet</h4>
        <small class="text-secondary">Step 1 of 3</small>
        <h6 class="text-danger py-3">2 Factor Authentication (2FA)</h6>
        <div class="text-danger pb-3">For security reasons, your wallet will be protected by 2FA.</div>
        <confirm-tfa-form :tfa-data="tfaData" :loading="loading" :errors="registration2FAStatus.err" :decrypt-error="decryptError" @submit="onSubmitClick"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import redirectHandler from '@/util/redirectHandler';
import confirmTfaForm from '@/components/forms/auth/ConfirmTfaForm';

export default {
  components: { confirmTfaForm },
  data () {
    return {
      inProgress: false,
      decryptError: false
    };
  },
  computed: {
    ...mapGetters(['tfaData', 'userStatus', 'registration2FAStatus']),
    loading () {
      return this.inProgress || this.registration2FAStatus.loading;
    }
  },
  async created () {
    if (!this.userStatus) {
      await this.getUserStatus();
    }
    if (!this.tfaData) {
      return this.$router.push({ name: 'Login' });
    }
    const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
    if (redirectRes) {
      this.$router.push(redirectRes);
    }
  },
  methods: {
    ...mapActions(['confirmTwoFactorAuthToken', 'getUserStatus']),
    async onSubmitClick (tfaCode) {
      // const intTFCode = parseInt(this.tfCode.replace(/\s/g, ''), 10);
      await this.confirmTwoFactorAuthToken(tfaCode.replace(/\s/g, ''));

      const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
      if (redirectRes) {
        this.$router.push(redirectRes);
      }
    },
    onCopy (e) {
      alert('You just copied: ' + e.text);
    },
    onError () {
      alert('Failed to copy texts');
    }
  }
};
</script>
