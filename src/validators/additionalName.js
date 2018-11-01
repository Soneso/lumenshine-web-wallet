import { maxLength } from 'vuelidate/lib/validators';

export default function () {
  return {
    maxLength: maxLength(256),
    // hasOnlyLetters: value => !/[^a-zA-Z]/.test(value),
  };
};
