import Vue from 'vue';

import config from '@/config';

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

import exchanges from '@/config/exchanges.json';

const replaceNull = value => value === 'null' ? null : value;
const parsePublicKeys = pk => pk ? pk.split(',') : pk;

function getInitialState (clearAuthToken = false) {
  return {
    decryptionError: false,
    decryptedPublicKey: null,
    decryptedSecret: null,
    decryptionLoading: false,

    walletsErrors: [],
    walletsResult: null,

    walletsLoading: {},

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

    transactionErrors: [],
    transactionLoading: false,
    transactionResult: null,

    currencyPairsErrors: [],
    currencyPairsLoading: false,
    currencyPairsResult: null,

    currencyRatesErrors: [],
    currencyRatesLoading: false,
    currencyRatesResult: null,

    fundWithFriendbotLoading: false,
    fundWithFriendbotError: [],

    sendPaymentErrors: [],
    sendPaymentLoading: false,
    sendPaymentResult: null,

    knownDestinationsErrors: [],
    knownDestinationsLoading: false,
    knownDestinationsResult: null,

    knownCurrenciesErrors: [],
    knownCurrenciesLoading: false,
    knownCurrenciesResult: null,

    transactionQueue: [],

    publicKeys: config.KEEP_LOGGED_IN && !clearAuthToken
      ? parsePublicKeys(replaceNull(Vue.localStorage.get('publicKeys', null)))
      : null,

    exchanges,
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
