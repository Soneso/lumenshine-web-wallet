import workerCaller from '@/util/workerCaller';
import redirectHandler from '@/util/redirectHandler';
import CryptoHelper from '@/helpers/CryptoHelper';

export default {
  methods: {
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

      if (!this.tfaData) return;

      const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
      if (redirectRes) {
        this.$router.push(redirectRes);
      }
    }
  }
};
