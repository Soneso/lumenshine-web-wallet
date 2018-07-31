import { required, minLength } from 'vuelidate/lib/validators';

export default function () {
  return {
    required,
    minLength: minLength(9),
    hasUpperCaseLetter: value => /[A-Z]/.test(value),
    hasLowerCaseLetter: value => /[a-z]/.test(value),
    hasNumber: value => /[0-9]/.test(value),
  };
};
