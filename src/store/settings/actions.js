import Vue from 'vue';

export default {
  async loadMemoVisibility ({ commit, getters }) {
    const email = getters.userStatus.email;
    let visible = Vue.localStorage.get('memoVisible', {}, Object)[email];
    if (visible === undefined) {
      visible = true;
    }
    commit('SET_MEMO_VISIBILITY', { visible, email });
  },

  async setMemoVisibility ({ commit, getters }, visible) {
    const email = getters.userStatus.email;
    commit('SET_MEMO_VISIBILITY', { visible, email });
  },
};
