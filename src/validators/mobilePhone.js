const mobileRegex = /^[+]?[0-9]{11,16}$/;

export default function () {
  return {
    validPhone: value => value === '' ? true : mobileRegex.test(value),
  };
};
