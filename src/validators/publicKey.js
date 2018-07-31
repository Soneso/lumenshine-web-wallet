export default function () {
  return {
    publicKey: value => {
      return /^[0-9A-Z]{56}$/.test(value);
    }
  };
};
