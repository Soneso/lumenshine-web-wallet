<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase pl-2">Sign up</h4>
        <div class="pb-4 pl-2"><small>Please fill in the form below</small></div>
        <transition v-if="loading" name="fade">
          <div class="loading-indicator">Loading...</div>
        </transition>
        <registration-form v-show="!loading && !registrationStatus.res" :loading="loading" :errors="registrationStatus.err" @submit="onRegisterSubmit"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import registrationForm from '@/components/forms/auth/RegistrationForm';
import workerCaller from '@/util/workerCaller';

import redirectHandler from '@/util/redirectHandler';

export default {
  components: { registrationForm },
  data () {
    return {
      inProgress: false,
    };
  },
  computed: {
    ...mapGetters(['registrationStatus', 'userStatus', 'tfaData']),
    loading () {
      return this.inProgress || this.registrationStatus.loading;
    }
  },
  methods: {
    ...mapActions(['registerUser', 'loginStep2', 'setMnemonic', 'setPublicKeys']),
    async onRegisterSubmit (formData, pass) {
      this.inProgress = true;

      const [ kdfSalt, wordlistMasterKey, wordlistMasterKeyIV, mnemonicMasterKey, mnemonicMasterKeyIV, mnemonic, mnemonicIV, wordlist, wordlistIV ] =
        await Promise.all([
          workerCaller('generateSalt'),
          workerCaller('generateMasterKey'),
          workerCaller('generateIV'),
          workerCaller('generateMasterKey'),
          workerCaller('generateIV'),
          workerCaller('generateMnemonic'),
          workerCaller('generateIV'),
          workerCaller('generateWordlist'),
          workerCaller('generateIV')
        ]);

      const [ publicKey0, publicKey188, kdfPass, encryptedWordlist, mnemonicIndices ] =
        await Promise.all([
          workerCaller('getPublicKey', mnemonic, 0),
          workerCaller('getPublicKey', mnemonic, 188),
          workerCaller('derivePassword', pass, kdfSalt),
          workerCaller('cryptWordlist', wordlistMasterKey, wordlistIV, wordlist),
          workerCaller('mnemonicToIndices', mnemonic, wordlist),
        ]);

      const [ encryptedMnemonicMasterKey, encryptedWordlistMasterKey, mnemonicEncrypted ] =
        await Promise.all([
          workerCaller('cryptMasterKey', kdfPass, mnemonicMasterKeyIV, mnemonicMasterKey),
          workerCaller('cryptMasterKey', kdfPass, wordlistMasterKeyIV, wordlistMasterKey),
          workerCaller('cryptMnemonic', mnemonicMasterKey, mnemonicIV, mnemonicIndices),
        ]);

      const registrationParams = {
        ...formData,
        kdf_salt: kdfSalt,
        mnemonic_master_key: encryptedMnemonicMasterKey,
        mnemonic_master_iv: mnemonicMasterKeyIV,
        wordlist_master_key: encryptedWordlistMasterKey,
        wordlist_master_iv: wordlistMasterKeyIV,
        mnemonic: mnemonicEncrypted,
        mnemonic_iv: mnemonicIV,
        wordlist: encryptedWordlist,
        wordlist_iv: wordlistIV,
        public_key_0: publicKey0,
        public_key_188: publicKey188,
      };
      await this.registerUser(registrationParams);

      await this.setMnemonic(mnemonic);
      const publicKeys = await workerCaller('getPublicKeys', mnemonic);
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

<style lang="scss" scoped>
</style>
