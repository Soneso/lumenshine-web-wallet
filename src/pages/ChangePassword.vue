<template>
  <div class="page-box form">
    <h1>Change Password</h1>
    <div>
      <div v-if="inProgress">Loading...</div>
      <div v-if="step === 'password'">
        <change-password-form v-show="!loading" :loading="loading" :errors="changePasswordStatus.err" :decrypt-error="decryptError" @submit="onPasswordSubmitClick"/>
      </div>
      <div v-if="step === 'finish'">
        Password successfully changed.<br>
        <button @click="onDoneClick">Done</button>
      </div>
      <div v-if="step === 'error'">
        Cannot update password, please try again later.
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import workerCaller from '@/util/workerCaller';

import changePasswordForm from '@/components/forms/ChangePasswordForm';

export default {
  components: { changePasswordForm },
  data () {
    return {
      inProgress: false,
      decryptError: false,
      step: 'password',
    };
  },
  computed: {
    ...mapGetters(['userAuthData', 'changePasswordStatus']),
    loading () {
      return this.inProgress || this.changePasswordStatus.loading;
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
    ...mapActions(['getUserAuthData', 'changePassword']),
    async onPasswordSubmitClick (currentPassword, newPassword) {
      this.inProgress = true;

      const authData = this.userAuthData.res;

      const oldKdfPass = await workerCaller('derivePassword', currentPassword, authData.kdf_password_salt);
      const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
        workerCaller('decryptMasterKey', oldKdfPass, authData.mnemonic_master_key_encryption_iv, authData.encrypted_mnemonic_master_key),
        workerCaller('decryptMasterKey', oldKdfPass, authData.wordlist_master_key_encryption_iv, authData.encrypted_wordlist_master_key)
      ]);

      const [ oldMnemonicIndices, oldWordlist ] = await Promise.all([
        workerCaller('decryptMnemonic', mnemonicMasterKey, authData.mnemonic_encryption_iv, authData.encrypted_mnemonic),
        workerCaller('decryptWordlist', wordlistMasterKey, authData.wordlist_encryption_iv, authData.encrypted_wordlist)
      ]);

      const isValidWordlist = !!(oldWordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
      if (!isValidWordlist) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const [ kdfSalt, wordlistMasterKeyIV, mnemonicMasterKeyIV, mnemonic ] =
        await Promise.all([
          workerCaller('generateSalt'),
          workerCaller('generateIV'),
          workerCaller('generateIV'),
          workerCaller('indicesToMnemonic', oldMnemonicIndices, oldWordlist),
        ]);

      const [ publicKey188, kdfPass ] =
        await Promise.all([
          workerCaller('getPublicKey', mnemonic, 188),
          workerCaller('derivePassword', newPassword, kdfSalt),
        ]);

      const [ encryptedMnemonicMasterKey, encryptedWordlistMasterKey ] =
        await Promise.all([
          workerCaller('cryptMasterKey', kdfPass, mnemonicMasterKeyIV, mnemonicMasterKey),
          workerCaller('cryptMasterKey', kdfPass, wordlistMasterKeyIV, wordlistMasterKey),
        ]);

      const params = {
        kdf_salt: kdfSalt,
        mnemonic_master_key: encryptedMnemonicMasterKey,
        mnemonic_master_iv: mnemonicMasterKeyIV,
        wordlist_master_key: encryptedWordlistMasterKey,
        wordlist_master_iv: wordlistMasterKeyIV,
        public_key_188: publicKey188,
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
      this.$router.push({ name: 'Dashboard' });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
