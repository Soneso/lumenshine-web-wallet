export default function () {
  return {
    domain: value => {
      return value === '' || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(value);
    }
  };
};
