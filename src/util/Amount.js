import { BigNumber } from 'bignumber.js';
BigNumber.set({ DECIMAL_PLACES: 7 });
BigNumber.config({ FORMAT: {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0
} });

class Amount {
  constructor (val) {
    if (!(val instanceof Amount || typeof val === 'string')) {
      throw new Error('Amount should be string');
    }
    if (val instanceof Amount) {
      this.val = BigNumber(val.val);
    } else {
      this.val = BigNumber(val.replace(/,/g, ''));
    }
  }

  plus (newVal) {
    if (!(newVal instanceof Amount || typeof newVal === 'string')) {
      throw new Error('Amount should be string');
    }
    if (newVal instanceof Amount) {
      this.val = this.val.plus(newVal.val);
    } else {
      this.val = this.val.plus(newVal);
    }
    return this;
  }

  minus (newVal) {
    if (!(newVal instanceof Amount || typeof newVal === 'string')) {
      throw new Error('Amount should be string');
    }
    if (newVal instanceof Amount) {
      this.val = this.val.minus(newVal.val);
    } else {
      this.val = this.val.minus(newVal);
    }
    return this;
  }

  multiply (newVal) {
    if (!(newVal instanceof Amount || typeof newVal === 'string')) {
      throw new Error('Amount should be string');
    }
    if (newVal instanceof Amount) {
      this.val = this.val.times(newVal.val);
    } else {
      this.val = this.val.times(newVal);
    }
    return this;
  }

  divide (newVal) {
    if (!(newVal instanceof Amount || typeof newVal === 'string')) {
      throw new Error('Amount should be string');
    }
    if (newVal instanceof Amount) {
      this.val = this.val.div(newVal.val);
    } else {
      this.val = this.val.div(newVal);
    }
    return this;
  }

  format () {
    // max 7 characters after decimal point
    // min 2 characters after decimal point
    const value = this.val.toFormat(7);
    const parts = value.split('.');
    while (parts[1].charAt(parts[1].length - 1) === '0') {
      parts[1] = parts[1].substring(0, parts[1].length - 1);
    }
    while (parts[1].length < 2) {
      parts[1] += '0';
    }
    return parts[0] + '.' + parts[1];
  }

  toNumber () {
    return this.val.toNumber();
  }

  toFixed (x) {
    return this.val.toFixed(x);
  }

  toStellarAmount () {
    return this.val.toFixed(7);
  }

  equal (x) {
    if (!(x instanceof Amount || typeof x === 'string')) {
      throw new Error('Amount should be string');
    }
    if (x instanceof Amount) {
      return this.val.eq(x.val);
    } else {
      return this.val.eq(x);
    }
  }
};

export default Amount;
