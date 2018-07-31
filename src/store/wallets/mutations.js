import Vue from 'vue';
import config from '@/config';

export default {
  SET_WALLETS (state, msg) {
    state.walletsResult = msg;
    state.walletsErrors = [];
  },
  SET_WALLETS_LOADING (state, msg) {
    state.walletsLoading = msg;
  },
  SET_WALLETS_ERROR (state, msg) {
    state.walletsErrors = msg;
    state.walletsResult = null;
  },

  ADD_WALLET_LOADING (state, msg) {
    state.addWalletLoading = msg;
  },
  ADD_WALLET_RESULT (state, msg) {
    state.addWalletResult = msg;
    state.addWalletErrors = [];
  },
  ADD_WALLET_ERROR (state, msg) {
    state.addWalletErrors = msg;
    state.addWalletResult = null;
  },

  EDIT_WALLET_LOADING (state, msg) {
    state.editWalletLoading = msg;
  },
  EDIT_WALLET_ERROR (state, msg) {
    state.editWalletErrors = msg;
  },

  SET_INFLATION_DEST_LOADING (state, msg) {
    state.inflationDestLoading = msg;
  },
  SET_INFLATION_DEST_ERROR (state, msg) {
    state.inflationDestErrors = msg;
  },

  ADD_CURRENCY_LOADING (state, msg) {
    state.addCurrencyLoading = msg;
  },
  ADD_CURRENCY_ERROR (state, msg) {
    state.addCurrencyErrors = msg;
  },

  REMOVE_CURRENCY_LOADING (state, msg) {
    state.removeCurrencyLoading = msg;
  },
  REMOVE_CURRENCY_ERROR (state, msg) {
    state.removeCurrencyErrors = msg;
  },

  SET_CURRENCY_PAIRS (state, msg) {
    state.currencyPairsResult = msg;
    state.currencyPairsErrors = [];
  },
  SET_CURRENCY_PAIRS_LOADING (state, msg) {
    state.currencyPairsLoading = msg;
  },
  SET_CURRENCY_PAIRS_ERROR (state, msg) {
    state.currencyPairsErrors = msg;
    state.currencyPairsResult = null;
  },

  SET_CURRENCY_DATA (state, msg) {
    state.currencyDataResult = msg;
    state.currencyDataErrors = [];
  },
  SET_CURRENCY_DATA_LOADING (state, msg) {
    state.currencyDataLoading = msg;
  },
  SET_CURRENCY_DATA_ERROR (state, msg) {
    state.currencyDataErrors = msg;
    state.currencyDataResult = null;
  },

  SET_FUND_WITH_FRIENDBOT_LOADING (state, msg) {
    state.fundWithFriendbotLoading = msg;
  },
  SET_FUND_WITH_FRIENDBOT_ERROR (state, msg) {
    state.fundWithFriendbotErrors = msg;
  },

  // used for storing the available wallet public keys on login
  SET_PUBLIC_KEYS (state, msg) {
    state.publicKeys = msg;
    if (config.KEEP_LOGGED_IN) {
      Vue.localStorage.set('publicKeys', msg);
    }
  }
};
