export default function () {
  return {
    validAssetCode: value => {
      return /^[a-zA-Z0-9]{1,12}$/.test(value);
    }
  };
};
