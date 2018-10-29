import StellarSdk from 'stellar-sdk';

export default function () {
  return {
    secretSeed: value => {
      const isFormatValid = /^S[0-9A-Z]{55}$/.test(value);
      if (!isFormatValid) return false;
      return StellarSdk.StrKey.isValidEd25519SecretSeed(value);
    }
  };
};
