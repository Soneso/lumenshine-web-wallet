import workerCaller from '@/util/workerCaller';

const cryptoHelper = {
  async decryptServerData (password, encryptedServerData) {
    const kdfPass = await workerCaller('derivePassword', password, encryptedServerData.kdf_password_salt);
    const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
      workerCaller('decryptMasterKey', kdfPass, encryptedServerData.mnemonic_master_key_encryption_iv, encryptedServerData.encrypted_mnemonic_master_key),
      workerCaller('decryptMasterKey', kdfPass, encryptedServerData.wordlist_master_key_encryption_iv, encryptedServerData.encrypted_wordlist_master_key)
    ]);

    const [ mnemonicIndices, wordlist ] = await Promise.all([
      workerCaller('decryptMnemonic', mnemonicMasterKey, encryptedServerData.mnemonic_encryption_iv, encryptedServerData.encrypted_mnemonic),
      workerCaller('decryptWordlist', wordlistMasterKey, encryptedServerData.wordlist_encryption_iv, encryptedServerData.encrypted_wordlist)
    ]);

    const isValidWordlist = !!(wordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
    if (!isValidWordlist) {
      return null;
    }

    const mnemonic = await workerCaller('indicesToMnemonic', mnemonicIndices, wordlist);
    const publicKeys = await workerCaller('getPublicKeys', mnemonic);
    return {
      mnemonic,
      publicKeys,
    };
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
};

export default cryptoHelper;
