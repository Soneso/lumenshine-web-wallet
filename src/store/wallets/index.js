import Vue from 'vue';

import config from '@/config';

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

function replaceNull (value) {
  return value === 'null' ? null : value;
}

function parsePublicKeys (pk) {
  return pk ? pk.split(',') : pk;
}

function getInitialState (clearAuthToken = false) {
  return {
    walletsErrors: [],
    walletsLoading: false,
    walletsResult: null,

    addWalletErrors: [],
    addWalletResult: null,
    addWalletLoading: false,

    editWalletErrors: [],
    editWalletLoading: false,

    inflationDestErrors: [],
    inflationDestLoading: false,

    addCurrencyErrors: [],
    addCurrencyLoading: false,

    removeCurrencyErrors: [],
    removeCurrencyLoading: false,

    currencyPairsErrors: [],
    currencyPairsLoading: false,
    currencyPairsResult: null,

    currencyDataErrors: [],
    currencyDataLoading: false,
    currencyDataResult: null,

    fundWithFriendbotLoading: false,
    fundWithFriendbotError: [],

    publicKeys: config.KEEP_LOGGED_IN && !clearAuthToken
      ? parsePublicKeys(replaceNull(Vue.localStorage.get('publicKeys', null)))
      : null,
  };
}

export default {
  state: getInitialState(),
  mutations: {
    ...mutations,
    RESET (state) {
      const s = getInitialState(true);
      Object.keys(s).forEach(key => {
        state[key] = s[key];
      });
      Vue.localStorage.remove('publicKeys');
    }
  },
  getters,
  actions
};
