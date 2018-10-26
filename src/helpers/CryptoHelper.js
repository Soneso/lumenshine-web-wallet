import workerCaller from '@/util/workerCaller';

import StellarSdk from 'stellar-sdk';

import config from '@/config';

if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

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
    const [publicKeys, secretSeed] = await Promise.all([workerCaller('getPublicKeys', mnemonic), workerCaller('getSecretSeed', mnemonic, 0)]);

    if (publicKeys[0] !== encryptedServerData.public_key_index0) {
      return null;
    }

    return {
      mnemonic,
      publicKeys,
      secretSeed,
      mnemonicMasterKey,
      wordlistMasterKey,
    };
  },

  async signSep10Challenge (localSecret, challenge) {
    const transaction = new StellarSdk.Transaction(challenge);
    if (transaction.sequence !== '0') {
      return null;
    }

    const now = Date.now() / 1000;
    if (transaction.timeBounds.minTime > now || transaction.timeBounds.maxTime < now) {
      return null;
    }

    if (transaction.operations.length !== 1) {
      return null;
    }

    const localKey = StellarSdk.Keypair.fromSecret(localSecret);
    const operation = transaction.operations[0];
    if (!operation.name.endsWith(' auth') || operation.source !== localKey.publicKey() || operation.type !== 'manageData') {
      return null;
    }

    if (transaction.signatures.length !== 1) {
      return null;
    }

    let serverPublicKey = config.SERVER_PUBLIC_KEY;
    if (transaction.source !== serverPublicKey) {
      try {
        const toml = await StellarSdk.StellarTomlResolver.resolve(config.FEDERATION_DOMAIN);
        serverPublicKey = toml.SIGNING_KEY;
      } catch (err) {
        return null;
      }
    }

    if (transaction.source !== serverPublicKey) {
      return null;
    }

    const serverKey = StellarSdk.Keypair.fromPublicKey(serverPublicKey);
    const serverSignature = transaction.signatures[0].signature();
    if (!serverKey.verify(transaction.hash(), serverSignature)) {
      return null;
    }

    transaction.sign(localKey);
    return transaction.toEnvelope().toXDR().toString('base64');
  },

  async generateSecurityData (password, mnemonic = null) {
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

    if (mnemonic === null) {
      mnemonic = await workerCaller('generateMnemonic');
    }

    const [ publicKey0, secretSeed, kdfPass, encryptedWordlist, mnemonicIndices ] =
      await Promise.all([
        workerCaller('getPublicKey', mnemonic, 0),
        workerCaller('getSecretSeed', mnemonic, 0),
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

      secretSeed,
      mnemonic,
    };
  },
};

export default cryptoHelper;
