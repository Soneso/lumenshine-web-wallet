<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card :class="{'text-center': inProgress}" class="p-4 single-card">
        <h4 class="form-headline text-uppercase pl-2">Join Lumenshine</h4>
        <div v-if="!inProgress" class="pb-4 pl-2"><small>Please fill in the form below</small></div>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <spinner v-if="inProgress" align="center" class="py-3"/>
        <registration-form v-show="!loading && !registrationStatus.res" :loading="loading" :errors="registrationStatus.err" @submit="onRegisterSubmit"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import workerCaller from '@/util/workerCaller';
import redirectHandler from '@/util/redirectHandler';

import CryptoHelper from '@/helpers/CryptoHelper';

import registrationForm from '@/components/forms/auth/RegistrationForm';
import spinner from '@/components/ui/spinner';

export default {
  components: { registrationForm, spinner },

  data () {
    return {
      inProgress: false,
      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['registrationStatus', 'userStatus', 'tfaData', 'sep10Challenge']),
    loading () {
      return this.inProgress || this.registrationStatus.loading;
    }
  },

  methods: {
    ...mapActions(['registerUser', 'setMnemonic', 'setPublicKeys']),
    async onRegisterSubmit (formData, password) {
      this.inProgress = true;

      const securityData = await CryptoHelper.generateSecurityData(password);

      const registrationParams = {
        ...formData,

        kdf_salt: securityData.kdf_salt,
        mnemonic_master_key: securityData.mnemonic_master_key,
        mnemonic_master_iv: securityData.mnemonic_master_iv,
        wordlist_master_key: securityData.wordlist_master_key,
        wordlist_master_iv: securityData.wordlist_master_iv,
        mnemonic: securityData.encrypted_mnemonic,
        mnemonic_iv: securityData.encryption_mnemonic_iv,
        wordlist: securityData.encrypted_wordlist,
        wordlist_iv: securityData.encryption_wordlist_iv,
        public_key_0: securityData.public_key,

        public_key_188: 'GAMJCCE5HESTOMPDRTFS332QXZQRDPTGHHGLTNVHB2IBI612' + Math.random().toString(36).substring(2, 10).toUpperCase(), // TODO remove
      };

      await this.registerUser(registrationParams);

      await this.setMnemonic(securityData.mnemonic);
      const publicKeys = await workerCaller('getPublicKeys', securityData.mnemonic);
      this.setPublicKeys(publicKeys);

      this.inProgress = false;

      if (!this.tfaData) {
        return;
      }

      const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
      if (redirectRes) {
        this.$router.push(redirectRes);
      }
    }
  },
};
</script>
