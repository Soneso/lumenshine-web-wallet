import StellarSdk from 'stellar-sdk';
import { maxLength } from 'vuelidate/lib/validators';

export default function (memoType) {
  let memoValidators;

  switch (memoType) {
    case 'MEMO_TEXT':
      memoValidators = {
        maxLength: maxLength(28),
        validMemo: val => {
          try {
            StellarSdk.Memo.text(val);
            return true;
          } catch (err) {
            return false;
          }
        },
      };
      break;

    case 'MEMO_ID':
      memoValidators = {
        maxLength: maxLength(28),
        validMemo: val => {
          try {
            StellarSdk.Memo.id(val);
            return true;
          } catch (err) {
            return false;
          }
        },
      };
      break;

    case 'MEMO_HASH':
      memoValidators = {
        validLength: val => typeof val === 'string' && val.length === 64,
        validMemo: val => {
          try {
            StellarSdk.Memo.hash(val);
            return true;
          } catch (err) {
            return false;
          }
        },
      };
      break;

    case 'MEMO_RETURN':
      memoValidators = {
        validLength: val => typeof val === 'string' && val.length === 64,
        validMemo: val => {
          try {
            StellarSdk.Memo.returnHash(val);
            return true;
          } catch (err) {
            return false;
          }
        },
      };
      break;
  }
  return memoValidators;
};
