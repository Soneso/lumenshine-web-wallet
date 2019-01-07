import Vue from 'vue';

export default {
  SET_MEMO_VISIBILITY (state, { visible, email }) {
    state.memoVisible = visible;
    const storedValues = Vue.localStorage.get('memoVisible', {}, Object);
    storedValues[email] = visible;
    Vue.localStorage.set('memoVisible', JSON.stringify(storedValues));
  },

  mutateChangePasswordStep (state, changePasswordStep) {
    state.changePasswordStep = changePasswordStep;
  },
  mutateChange2faStep (state, change2faStep) {
    state.change2faStep = change2faStep;
  }
};
