<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h4 class="form-headline text-uppercase pb-4">Backup Secret/Mnemonic</h4>
        <backup-mnemonic-form
          :mnemonic="mnemonic"
          :loading="inProgress"
          :decrypt-error="decryptError"
          @hide="setMnemonic(null)"
          @cancel="canceled = true"
          @reveal="onRevealClick"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import workerCaller from '@/util/workerCaller';

import BackupMnemonicForm from '@/components/forms/BackupMnemonicForm';

export default {
  name: 'BackupMnemonic',
  components: { BackupMnemonicForm },
  data () {
    return {
      inProgress: false,
      decryptError: false,
      canceled: false,
    };
  },
  computed: {
    ...mapGetters(['userAuthData', 'mnemonic']),
  },
  async created () {
    this.inProgress = true;
    if (!this.userAuthData.res) {
      await this.getUserAuthData();
    }
    this.inProgress = false;
  },
  beforeDestroy () {
    this.setMnemonic(null);
  },
  methods: {
    ...mapActions(['getUserAuthData', 'setMnemonic']),
    async onRevealClick (password) {
      this.canceled = false;
      this.decryptError = false;
      this.inProgress = true;

      const authData = this.userAuthData.res;

      const kdfPass = await workerCaller('derivePassword', password, authData.kdf_password_salt);
      const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
        workerCaller('decryptMasterKey', kdfPass, authData.mnemonic_master_key_encryption_iv, authData.encrypted_mnemonic_master_key),
        workerCaller('decryptMasterKey', kdfPass, authData.wordlist_master_key_encryption_iv, authData.encrypted_wordlist_master_key)
      ]);

      const [ mnemonicIndices, wordlist ] = await Promise.all([
        workerCaller('decryptMnemonic', mnemonicMasterKey, authData.mnemonic_encryption_iv, authData.encrypted_mnemonic),
        workerCaller('decryptWordlist', wordlistMasterKey, authData.wordlist_encryption_iv, authData.encrypted_wordlist)
      ]);

      const isValidWordlist = !!(wordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
      if (!isValidWordlist) {
        this.decryptError = true;
        this.inProgress = false;
        return;
      }

      const mnemonic = await workerCaller('indicesToMnemonic', mnemonicIndices, wordlist);

      if (!this.canceled) {
        this.setMnemonic(mnemonic);
      }

      this.inProgress = false;
    },
  }
};
</script>
