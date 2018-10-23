import Vue from 'vue';
import Vuex from 'vuex';
import VueLocalStorage from 'vue-localstorage';

Vue.use(VueLocalStorage);
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
<<<<<<< HEAD
    settings: require('./settings').default,
=======
    contacts: require('./contacts').default,
>>>>>>> Contacts page.
    offcanvas: require('./offcanvas').default,
    users: require('./users').default,
    wallets: require('./wallets').default
  },
  state: {
    lastInteraction: null,
  },
  actions: {
    resetStore ({ commit }) {
      commit('RESET');
    },
    catchInteraction ({ commit, state }) {
      if (state.lastInteraction === null) {
        commit('SET_INTERACTION', new Date().getTime());
      }
    },
    clearInteraction ({ commit }) {
      commit('SET_INTERACTION', null);
    }
  },
  mutations: {
    SET_INTERACTION (state, value) {
      state.lastInteraction = value;
    }
  },
});
