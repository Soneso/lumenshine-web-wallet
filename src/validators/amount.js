import { decimal } from 'vuelidate/lib/validators';

export default function () {
  return {
    decimal,
    isNotTooSmall: value => parseFloat(value) >= 0.0000001,
    isNotTooPrecise: value => value.indexOf('.') === -1 || value.length - value.indexOf('.') <= 8,
    isNotTooLarge: value => parseFloat(value) <= 922337203685,
  };
};
