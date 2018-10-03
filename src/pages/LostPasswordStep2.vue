<template>
  <div class="page-box form">
    <h1>Lost Password</h1>
    <!-- Token: {{$route.params.token}} -->
    <div v-if="confirmEmailStatus.err.length > 0">
      <div v-if="tokenNotFound" class="error">Could not find this token in the database.</div>
      <div v-if="tokenExpired" class="error">Token expired.</div>
      <div v-if="emailAlreadyConfirmed" class="error">Email address already confirmed.</div>
    </div>
    <div v-else-if="userStatus.res">
      <div v-if="inProgress">loading...</div>
      <div v-if="userStatus.res.tfa_confirmed === false">
        <div v-if="userStatus.res.mnemonic_confirmed === true">
          <h3>Error - 001</h3>
          <p>Please contact</p>
          <p><a :href="`mailto:${config.SUPPORT_MAIL}?subject=${encodeURIComponent('Error - 001 - Lost password')}`">support</a></p>
        </div>
        <div v-else-if="userStatus.res.mnemonic_confirmed === false">
          <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" @submit="onGenerateNewData"/>
        </div>
      </div>
      <div v-else> <!-- userStatus.res.tfa_confirmed === true -->
        <div v-if="step === 'tfa'">
          <lost-password-tfa-form v-show="!loading && !lostPasswordStatus.res" :loading="loading" :errors="lostPasswordStatus.err" @submit="onTfaSubmitClick"/>
        </div>
        <div v-else-if="step === 'mnemonic'">
          <lost-password-mnemonic-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :mnemonic-error="mnemonicError" @submit="onMnemonicSubmitClick"/>
        </div>
        <div v-else-if="step === 'password' && userStatus.res.mnemonic_confirmed === false"> <!-- When need to reset mnemonic -->
          <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" @submit="onGenerateNewData"/>
        </div>
        <div v-else-if="step === 'password'">
          <lost-password-form v-show="!loading" :loading="loading" :errors="lostPasswordStatus.err" :update-error="updateError" @submit="onPasswordSubmitClick"/>
        </div>
      </div>
    </div>
    <div v-else-if="step === 'finish'">
      <p class="info">Your password has been reset successfully</p>
      <button @click="$router.push({ name: 'Login' })">Login</button>
    </div>
    <div v-else-if="step === 'error'">
      Cannot change password, please try again later.
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import workerCaller from '@/util/workerCaller';

import lostPasswordTfaForm from '@/components/forms/auth/LostPasswordTfaForm';
import lostPasswordMnemonicForm from '@/components/forms/auth/LostPasswordMnemonicForm';
import lostPasswordForm from '@/components/forms/auth/LostPasswordForm';

export default {
  components: { lostPasswordTfaForm, lostPasswordMnemonicForm, lostPasswordForm },
  data () {
    return {
      inProgress: false,
      emailSuccess: false,
      step: 'tfa',
      mnemonicError: false,
      mnemonic: null,
      lastTfaCode: null,
      config
    };
  },
  computed: {
    ...mapGetters(['lostPasswordStatus', 'confirmEmailStatus', 'userStatus']),
    loading () {
      return this.inProgress || this.lostPasswordStatus.loading || this.userStatus.loading;
    },
    tokenNotFound () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1000));
    },
    tokenExpired () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1006));
    },
    emailAlreadyConfirmed () {
      return !!(this.confirmEmailStatus.err.find(err => err.error_code === 1008));
    }
  },
  async created () {
    if (this.$route.params.token) {
      this.inProgress = true;
      await this.confirmEmail(this.$route.params.token);
      await this.getUserStatus();
      this.inProgress = false;
    }
  },
  mounted () {
    this.mnemonicError = false;
    this.inProgress = false;
    this.emailSuccess = false;
    this.updateError = false;
    this.lastTfaCode = null;
    this.step = 'tfa';
  },
  methods: {
    ...mapActions(['getUserStatus', 'confirmEmail', 'setLostPasswordTfa', 'lostPasswordUpdate', 'updateSecurityData', 'setMnemonic', 'setPublicKeys', 'resetTfa', 'logout', 'loginStep2']),
    async onTfaSubmitClick (tfaCode) {
      this.inProgress = true;
      await this.setLostPasswordTfa(tfaCode);
      this.lastTfaCode = tfaCode;
      if (this.lostPasswordStatus.err.length === 0) {
        if (this.userStatus.res.mnemonic_confirmed === false) {
          this.step = 'password';
        } else {
          this.step = 'mnemonic';
        }
      }
      this.inProgress = false;
    },
    async onMnemonicSubmitClick (mnemonic) {
      this.inProgress = true;
      this.mnemonicError = false;
      const pk0 = this.lostPasswordStatus.res.public_key_0;
      const isValidMnemonic = await workerCaller('validateMnemonic', mnemonic);
      if (!isValidMnemonic) {
        this.mnemonicError = true;
        this.inProgress = false;
        return;
      }
      const pk0Mnemonic = await workerCaller('getPublicKey', mnemonic, 0);
      if (pk0 !== pk0Mnemonic) {
        this.mnemonicError = true;
        this.inProgress = false;
        return;
      }
      this.mnemonic = mnemonic;
      this.step = 'password';
      this.inProgress = false;
    },
    async generateSecurityData (password, mnemonic) {
      const [ kdfSalt, wordlistMasterKey, wordlistMasterKeyIV, mnemonicMasterKey, mnemonicMasterKeyIV, mnemonicIV, wordlist, wordlistIV ] =
        await Promise.all([
          workerCaller('generateSalt'),
          workerCaller('generateMasterKey'),
          workerCaller('generateIV'),
          workerCaller('generateMasterKey'),
          workerCaller('generateIV'),
          workerCaller('generateIV'),
          workerCaller('generateWordlist'),
          workerCaller('generateIV')
        ]);

      const [ publicKey0, publicKey188, kdfPass, encryptedWordlist, mnemonicIndices ] =
        await Promise.all([
          workerCaller('getPublicKey', mnemonic, 0),
          workerCaller('getPublicKey', mnemonic, 188),
          workerCaller('derivePassword', password, kdfSalt),
          workerCaller('cryptWordlist', wordlistMasterKey, wordlistIV, wordlist),
          workerCaller('mnemonicToIndices', mnemonic, wordlist),
        ]);

      const [ encryptedMnemonicMasterKey, encryptedWordlistMasterKey, mnemonicEncrypted ] =
        await Promise.all([
          workerCaller('cryptMasterKey', kdfPass, mnemonicMasterKeyIV, mnemonicMasterKey),
          workerCaller('cryptMasterKey', kdfPass, wordlistMasterKeyIV, wordlistMasterKey),
          workerCaller('cryptMnemonic', mnemonicMasterKey, mnemonicIV, mnemonicIndices),
        ]);

      return {
        kdf_salt: kdfSalt,
        mnemonic_master_key: encryptedMnemonicMasterKey,
        mnemonic_master_iv: mnemonicMasterKeyIV,
        wordlist_master_key: encryptedWordlistMasterKey,
        wordlist_master_iv: wordlistMasterKeyIV,
        encrypted_mnemonic: mnemonicEncrypted,
        encryption_mnemonic_iv: mnemonicIV,
        encrypted_wordlist: encryptedWordlist,
        encryption_wordlist_iv: wordlistIV,
        public_key_0: publicKey0,
        public_key_188: publicKey188,
      };
    },
    async onGenerateNewData (password) {
      this.inProgress = true;
      const newMnemonic = await workerCaller('generateMnemonic');
      this.setMnemonic(newMnemonic);
      const params = await this.generateSecurityData(password, newMnemonic);

      await this.updateSecurityData({ ...params, tfa_code: this.lastTfaCode });

      // generate new tfa secret, needed by next screen (setup screen)
      await this.resetTfa(params.public_key_188);
      await this.getUserStatus();

      const publicKeys = await workerCaller('getPublicKeys', newMnemonic);
      this.setPublicKeys(publicKeys);

      await this.loginStep2({ key: publicKeys[188] });

      if (this.lostPasswordStatus.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      this.inProgress = false;
      this.$router.push({ name: 'ConfirmTfa' });
    },
    async onPasswordSubmitClick (password) {
      this.inProgress = true;
      const params = await this.generateSecurityData(password, this.mnemonic);

      await this.lostPasswordUpdate(params);

      if (this.lostPasswordStatus.err.length > 0) {
        this.step = 'error';
        this.inProgress = false;
        return;
      }

      this.step = 'finish';
      await this.logout();
      this.inProgress = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
