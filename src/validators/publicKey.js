import StellarSdk from 'stellar-sdk';

export default function () {
  return {
    publicKey: value => {
      const isFormatValid = /^G[0-9A-Z]{55}$/.test(value);
      if (!isFormatValid) return false;
      return StellarSdk.StrKey.isValidEd25519PublicKey(value);
    }
  };
};
