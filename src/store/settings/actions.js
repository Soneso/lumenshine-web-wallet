import Vue from 'vue';

export default {
  async loadMemoVisibility ({ commit, getters }) {
    const email = getters.userStatus.email;
    const visible = Vue.localStorage.get('memoVisible', {}, Object)[email];
    commit('SET_MEMO_VISIBILITY', { visible, email });
  },

  async setMemoVisibility ({ commit, getters }, visible) {
    const email = getters.userStatus.email;
    commit('SET_MEMO_VISIBILITY', { visible, email });
  },
};
