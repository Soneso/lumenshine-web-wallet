export default function () {
  return {
    publicKey: value => {
      return /^G[0-9A-Z]{55}$/.test(value);
    }
  };
};
