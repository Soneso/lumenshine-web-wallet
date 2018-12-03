import Vue from 'vue';
import Vuex from 'vuex';
import VueLocalStorage from 'vue-localstorage';

import UserService from '@/services/user';

Vue.use(VueLocalStorage);
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    settings: require('./settings').default,
    contacts: require('./contacts').default,
    offcanvas: require('./offcanvas').default,
    paymentTemplates: require('./paymentTemplates').default,
    users: require('./users').default,
    wallets: require('./wallets').default
  },

  state: {
    lastInteraction: null,
    staticDataLoaded: false,
    countryList: [],
    salutationList: [],
    languageList: [],
  },

  getters: {
    languages: state => state.languageList,
    countries: state => state.countryList,
    salutations: state => state.salutationList,
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
    },
    async loadStaticData ({ commit, state }) {
      if (state.staticDataLoaded) {
        return;
      }
      try {
        const [ salutations, countries, languages ] = await Promise.all([UserService.getSalutationList(), UserService.getCountryList(), UserService.getLanguageList()]);
        const data = { salutations, countries, languages };
        commit('SET_STATIC_DATA', data);
      } catch (err) {
        commit('SET_STATIC_DATA', null);
      }
    },
  },

  mutations: {
    SET_INTERACTION (state, value) {
      state.lastInteraction = value;
    },
    SET_STATIC_DATA (state, data) {
      if (!data) {
        state.staticDataLoaded = false;
        return;
      }
      state.languageList = data.languages;
      state.countryList = data.countries;
      state.salutationList = data.salutations;
      state.staticDataLoaded = true;
    },
  },
});
