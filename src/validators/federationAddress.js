export default function () {
  return {
    federationAddress: value => {
      return /^([^*]+)\*([^*]+\.[a-zA-Z]{2,})$/.test(value);
    }
  };
};
