const mobileRegex = /^\+?[1-9]\d{1,14}$/;

export default function () {
  return {
    validPhone: value => value === '' ? true : mobileRegex.test(value),
  };
};
