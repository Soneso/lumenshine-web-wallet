<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 :class="['form-headline', 'text-uppercase', {'text-center': step === 'finish' || step === 'error'}]">Change Password</h4>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <spinner v-if="inProgress" align="center"/>

        <template v-if="step === 'password'">
          <change-password-form v-show="!loading" :loading="loading" :errors="changePasswordStatus.err" :decrypt-error="decryptError" @submit="onPasswordSubmitClick"/>
        </template>
        <template v-if="step === 'finish'">
          <b-row>
            <b-col class="text-center">
              <h6 class="text-success py-3">Password successfully changed.</h6>
              <b-button variant="info" class="btn-rounded text-uppercase my-3" @click="onDoneClick">Done</b-button>
            </b-col>
          </b-row>
        </template>
        <template v-if="step === 'error'">
          <b-row>
            <b-col class="text-center">
              <h6 class="text-danger text-center py-3">
                Cannot update password, please try again later.
              </h6>
            </b-col>
          </b-row>
        </template>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';

import workerCaller from '@/util/workerCaller';

import changePasswordForm from '@/components/forms/ChangePasswordForm';
import spinner from '@/components/ui/spinner1.vue';

import CryptoHelper from '@/helpers/CryptoHelper';

export default {
  name: 'ChangePassword',
  components: { changePasswordForm, spinner },
  data () {
    return {
      inProgress: false,
      decryptError: false,
      step: 'password',
      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['userAuthData', 'changePasswordStatus', 'changePasswordStep', 'sep10Challenge']),
    loading () {
      return this.inProgress || this.changePasswordStatus.loading;
    }
  },

  watch: {
    changePasswordStep () {
      if (this.changePasswordStep === 'password') {
        this.step = 'password';
      }
    },
    step () {
      if (this.step === 'error' || this.step === 'finish') {
        this.mutateChangePasswordStep('');
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
    ...mapMutations(['mutateChangePasswordStep']),
    ...mapActions(['getUserAuthData', 'changePassword']),

    async onPasswordSubmitClick (currentPassword, newPassword) {
      this.inProgress = true;

      const authData = this.userAuthData.res;

      const decryptedOldServerData = await CryptoHelper.decryptServerData(currentPassword, authData);

      if (!decryptedOldServerData) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const [ kdfSalt, wordlistMasterKeyIV, mnemonicMasterKeyIV ] =
        await Promise.all([
          workerCaller('generateSalt'),
          workerCaller('generateIV'),
          workerCaller('generateIV'),
        ]);

      const [ secretSeed, kdfPass ] =
        await Promise.all([
          workerCaller('getSecretSeed', decryptedOldServerData.mnemonic, 0),
          workerCaller('derivePassword', newPassword, kdfSalt),
        ]);

      const [ encryptedMnemonicMasterKey, encryptedWordlistMasterKey ] =
        await Promise.all([
          workerCaller('cryptMasterKey', kdfPass, mnemonicMasterKeyIV, decryptedOldServerData.mnemonicMasterKey),
          workerCaller('cryptMasterKey', kdfPass, wordlistMasterKeyIV, decryptedOldServerData.wordlistMasterKey),
        ]);

      const signedTransaction = await CryptoHelper.signSep10Challenge(secretSeed, this.sep10Challenge);
      if (!signedTransaction) {
        this.hasUnknownError = true;
        this.inProgress = false;
        return;
      }

      const params = {
        kdf_salt: kdfSalt,
        mnemonic_master_key: encryptedMnemonicMasterKey,
        mnemonic_master_iv: mnemonicMasterKeyIV,
        wordlist_master_key: encryptedWordlistMasterKey,
        wordlist_master_iv: wordlistMasterKeyIV,
        sep10_transaction: signedTransaction,

        public_key_188: 'GAMJCCE5HESTOMPDRTFS332QXZQRDPTGHHGLTNVHB2IBI612' + Math.random().toString(36).substring(2, 10).toUpperCase(), // TODO remove
      };

      await this.changePassword(params);
      await this.getUserAuthData();

      if (this.changePasswordStatus.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      this.step = 'finish';
      this.inProgress = false;
    },

    onDoneClick () {
      this.$router.push({ name: 'Settings' });
    }
  }
};
</script>
