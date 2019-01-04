import Vue from 'vue';

export default {
  async loadMemoInVisibility ({ commit, getters }) {
    const email = getters.userStatus.email;
    const invisible = Vue.localStorage.get('memoInVisible', {}, Object)[email];
    commit('SET_MEMO_INVISIBILITY', { invisible, email });
  },

  async setMemoInVisibility ({ commit, getters }, invisible) {
    const email = getters.userStatus.email;
    commit('SET_MEMO_INVISIBILITY', { invisible, email });
  },
};
