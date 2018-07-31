export default function () {
  return {
    validDate: value => {
      if (value === '') return true;
      const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return false;
      const d = new Date(value);
      if (!d) return false;
      return d.getFullYear() === parseInt(m[1], 10) && d.getMonth() + 1 === parseInt(m[2], 10) && d.getDate() === parseInt(m[3], 10);
    }
  };
};
