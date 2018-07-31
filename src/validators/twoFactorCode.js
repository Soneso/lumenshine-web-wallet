import { numeric } from 'vuelidate/lib/validators';

export default function () {
  return {
    numeric,
    length: value => value.length === 6 || value.length === 0,
  };
};
