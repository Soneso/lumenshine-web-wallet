import Vue from 'vue';
import Vuex from 'vuex';
import VueLocalStorage from 'vue-localstorage';

import debounce from 'lodash/debounce';

Vue.use(VueLocalStorage);
Vue.use(Vuex);

let setInteraction = debounce(({ commit }) => {
  commit('SET_INTERACTION', new Date().getTime());
}, 500);

export default new Vuex.Store({
  modules: {
    users: require('./users').default,
    wallets: require('./wallets').default,
  },
  store: {
    lastInteraction: 0,
  },
  actions: {
    resetStore ({ commit }) {
      commit('RESET');
    },
    catchInteraction ({ commit }) {
      setInteraction({ commit });
    }
  },
  mutations: {
    SET_INTERACTION  (state, timestamp) {
      state.lastInteraction = timestamp;
    },
  },
});
