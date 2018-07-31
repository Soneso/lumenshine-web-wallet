<template>
  <div class="page-box form">
    <h1>Setup Wallet</h1>
    <h2>Step 1 of 3</h2>
    <h3>2 Factor Authentication (2FA)</h3>
    <div class="warning">For security reasons, your wallet will be protected by 2 Factor Authentication (2FA).</div>
    <confirm-tfa-form :tfa-data="tfaData" :loading="loading" :errors="registration2FAStatus.err" :decrypt-error="decryptError" @submit="onSubmitClick"/>
  </div>
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
    onError (e) {
      alert('Failed to copy texts');
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
