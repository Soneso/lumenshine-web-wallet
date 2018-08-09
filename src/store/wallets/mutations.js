import Vue from 'vue';
import config from '@/config';

export default {
  RESET_DECRYPTED_WALLET (state) {
    state.decryptedPublicKey = null;
    state.decryptedSecret = null;
    state.decryptionError = false;
    state.decryptionLoading = false;
  },
  SET_DECRYPTED_WALLET (state, msg) {
    state.decryptedPublicKey = msg.publicKey;
    state.decryptedSecret = msg.secretSeed;
    state.decryptionError = false;
    state.decryptionLoading = false;
  },
  SET_DECRYPTION_ERROR (state) {
    state.decryptionError = true;
    state.decryptionLoading = false;
  },
  SET_DECRYPTION_LOADING (state) {
    state.decryptionError = false;
    state.decryptionLoading = true;
  },

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

  SET_CURRENCY_RATES (state, msg) {
    state.currencyRatesResult = msg;
    state.currencyRatesErrors = [];
  },
  SET_CURRENCY_RATES_LOADING (state, msg) {
    state.currencyRatesLoading = msg;
  },
  SET_CURRENCY_RATES_ERROR (state, msg) {
    state.currencyRatesErrors = msg;
    state.currencyRatesResult = null;
  },

  SET_FUND_WITH_FRIENDBOT_LOADING (state, msg) {
    state.fundWithFriendbotLoading = msg;
  },
  SET_FUND_WITH_FRIENDBOT_ERROR (state, msg) {
    state.fundWithFriendbotErrors = msg;
  },

  SET_SEND_PAYMENT_RESULT (state, msg) {
    state.sendPaymentResult = msg;
    state.sendPaymentErrors = [];
  },
  SET_SEND_PAYMENT_LOADING (state, msg) {
    state.sendPaymentLoading = msg;
  },
  SET_SEND_PAYMENT_ERROR (state, msg) {
    state.sendPaymentErrors = msg;
    state.sendPaymentResult = null;
  },

  // used for storing the available wallet public keys on login
  SET_PUBLIC_KEYS (state, msg) {
    state.publicKeys = msg;
    if (config.KEEP_LOGGED_IN) {
      Vue.localStorage.set('publicKeys', msg);
    }
  }
};
