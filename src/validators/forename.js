import { maxLength } from 'vuelidate/lib/validators';

export default function () {
  return {
    maxLength: maxLength(64),
    // hasOnlyLetters: value => !/[^a-zA-Z]/.test(value),
  };
};
