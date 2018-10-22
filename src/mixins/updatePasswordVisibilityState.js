export default {
  methods: {
    updatePasswordState (newPassword) {
      this[newPassword[0]] = newPassword[1];
    }
  }
};
