export default function () {
  return {
    secretSeed: value => {
      return /^S[0-9A-Z]{55}$/.test(value);
    }
  };
};
