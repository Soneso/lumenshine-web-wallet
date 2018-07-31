import StellarHDWallet from 'stellar-hd-wallet';
import pbkdf2 from 'pbkdf2';
import base64 from 'base64-js';
import { Buffer } from 'safe-buffer';
import randomBytes from 'randombytes';
import forge from 'node-forge';
import bip39 from 'bip39';

// https://bost.ocks.org/mike/shuffle/compare.html Fisher - Yates shuffle
function shuffleArray (arr) {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[i], arr[m]] = [arr[m], arr[i]];
  }
  return arr;
}

function addPaddingAndEncode (data) { // 16 bytes length
  const buf = forge.util.createBuffer(data);
  const mod = buf.length() % 16;
  if (mod > 0) {
    buf.putBytes(Buffer.alloc(16 - mod, 0x20));
  }
  return forge.util.encode64(buf.getBytes());
}

function decodeAndRemovePadding (data) {
  const decoded = forge.util.decode64(data);
  return decoded.trim();
}

function cryptAES (key, iv, data) {
  const cipher = forge.cipher.createCipher('AES-CBC', forge.util.decode64(key));
  cipher.mode.pad = false;
  cipher.start({iv: forge.util.decode64(iv)});
  cipher.update(forge.util.createBuffer(forge.util.decode64(data)));
  if (!cipher.finish()) {
    return null;
  }
  return forge.util.encode64(cipher.output.getBytes());
}

function decryptAES (key, iv, data) {
  const decipher = forge.cipher.createDecipher('AES-CBC', forge.util.decode64(key));
  decipher.mode.unpad = false;
  decipher.start({iv: forge.util.decode64(iv)});
  decipher.update(forge.util.createBuffer(forge.util.decode64(data)));
  if (!decipher.finish()) {
    return null;
  }
  return forge.util.encode64(decipher.output.getBytes());
}

const crypto = {
  validateMnemonic (mnemonic) {
    try {
      StellarHDWallet.fromMnemonic(mnemonic);
      return true;
    } catch (err) {
      return false;
    }
  },
  generateMnemonic () {
    const mnemonic = StellarHDWallet.generateMnemonic();
    return mnemonic;
  },
  getPublicKey (mnemonic, index) {
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);
    return wallet.getPublicKey(index);
  },
  getSecretSeed (mnemonic, index) {
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);
    return wallet.getSecret(index);
  },
  getPublicKeys (mnemonic) {
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);
    return new Array(256).fill(null).map((_, k) => wallet.getPublicKey(k));
  },
  derivePassword (password, kdfSalt) {
    const salt = Buffer.from(base64.toByteArray(kdfSalt));
    return base64.fromByteArray(pbkdf2.pbkdf2Sync(password, salt, 20000, 32, 'sha1'));
  },
  mnemonicToIndices (mnemonic, wordlistStr) {
    const wordlist = wordlistStr.split(',');
    const mnemonicIndices = mnemonic.split(' ').map(w => wordlist.indexOf(w));
    const buf = forge.util.createBuffer();
    mnemonicIndices.forEach(x => buf.putInt16(x));
    return forge.util.encode64(buf.getBytes());
  },
  indicesToMnemonic (indices, wordlistStr) {
    const wordlist = wordlistStr.split(',');
    const buf = forge.util.createBuffer(forge.util.decode64(indices));
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push(buf.getInt16());
    }
    return data.map(w => wordlist[w]).join(' ');
  },
  generateIV () {
    return base64.fromByteArray(randomBytes(16));
  },
  generateMasterKey () {
    return base64.fromByteArray(randomBytes(32));
  },
  generateSalt () {
    return base64.fromByteArray(randomBytes(32));
  },
  generateWordlist () {
    const wordlist = [...bip39.wordlists.english];
    return shuffleArray(wordlist).join(',');
  },
  cryptMasterKey (kdfPass, masterKeyIV, masterKey) {
    return cryptAES(kdfPass, masterKeyIV, masterKey);
  },
  decryptMasterKey (kdfPass, masterKeyIV, masterKey) {
    return decryptAES(kdfPass, masterKeyIV, masterKey);
  },
  cryptWordlist (wordlistPass, wordlistIV, wordlist) {
    const paddedWordlist = addPaddingAndEncode(wordlist);
    return cryptAES(wordlistPass, wordlistIV, paddedWordlist);
  },
  decryptWordlist (wordlistPass, wordlistIV, wordlist) {
    return decodeAndRemovePadding(decryptAES(wordlistPass, wordlistIV, wordlist));
  },
  cryptMnemonic (masterKey, mnemonicIV, mnemonic) {
    return cryptAES(masterKey, mnemonicIV, mnemonic);
  },
  decryptMnemonic (masterKey, mnemonicIV, mnemonic) {
    return decryptAES(masterKey, mnemonicIV, mnemonic);
  },
  decode64 (data) {
    return forge.util.decode64(data);
  },
  addPaddingAndEncode // needed for tests
};

export default crypto;
