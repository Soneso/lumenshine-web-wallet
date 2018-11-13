import { required, maxLength } from 'vuelidate/lib/validators';

export default function () {
  return {
    required,
    maxLength: maxLength(64),
    minLength: value => value === '' || value.trim().length >= 2,
    hasNoNumbers: value => !/[0-9]/.test(value),
  };
};
