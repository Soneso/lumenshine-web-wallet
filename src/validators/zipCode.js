export default function () {
  return {
    zipFormat: value => value === '' ? true : /^[0-9]{5}(-[0-9]{5})?$/.test(value),
  };
};
