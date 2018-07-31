import { required } from 'vuelidate/lib/validators';

export default function () {
  return {
    required,
    wordLength: value => value.split(' ').length === 24,
  };
};
