import Vue from 'vue';

export default {
  SET_MEMO_INVISIBILITY (state, { invisible, email }) {
    state.memoInVisible = invisible;
    const storedValues = Vue.localStorage.get('memoInVisible', {}, Object);
    storedValues[email] = invisible;
    Vue.localStorage.set('memoInVisible', JSON.stringify(storedValues));
  },

  mutateChangePasswordStep (state, changePasswordStep) {
    state.changePasswordStep = changePasswordStep;
  },
  mutateChange2faStep (state, change2faStep) {
    state.change2faStep = change2faStep;
  }
};
