import { maxLength } from 'vuelidate/lib/validators';

export default function () {
  return {
    maxLength: maxLength(512),
    // hasOnlyASCII: value => /^[\x20-\x7F]*$/.test(value),
  };
};
