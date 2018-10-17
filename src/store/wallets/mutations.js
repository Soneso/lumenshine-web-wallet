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
    const wallets = [...msg].sort((a, b) => a.id - b.id);
    state.walletsResult = wallets;
    state.walletsErrors = [];
  },
  SET_WALLETS_LOADING (state, msg) {
    state.walletsLoading = msg;
  },
  SET_WALLETS_ERROR (state, msg) {
    state.walletsErrors = msg;
    state.walletsResult = null;
  },

  UPDATE_WALLETS (state, newWallets) {
    const newResult = [...state.walletsResult];
    for (const index in newResult) {
      const res = newWallets.find(w => w.id === newResult[index].id);
      if (res) {
        newResult[index] = res;
      }
    }
    state.walletsResult = newResult;
    state.walletsErrors = [];
  },
  UPDATE_WALLETS_LOADING (state, msg) {
    state.walletsLoading = msg;
  },
  UPDATE_WALLETS_ERROR (state, msg) {
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

  SET_KNOWN_DESTINATIONS (state, msg) {
    if (Array.isArray(msg)) {
      msg.sort((a, b) => a.order_index - b.order_index);
    }
    state.knownDestinationsResult = msg;
    state.knownDestinationsErrors = [];
  },
  SET_KNOWN_DESTINATIONS_LOADING (state, msg) {
    state.knownDestinationsLoading = msg;
  },
  SET_KNOWN_DESTINATIONS_ERROR (state, msg) {
    state.knownDestinationsErrors = msg;
    state.knownDestinationsResult = null;
  },

  SET_KNOWN_CURRENCIES (state, msg) {
    if (Array.isArray(msg)) {
      msg.sort((a, b) => a.order_index - b.order_index);
    }
    state.knownCurrenciesResult = msg;
    state.knownCurrenciesErrors = [];
  },
  SET_KNOWN_CURRENCIES_LOADING (state, msg) {
    state.knownCurrenciesLoading = msg;
  },
  SET_KNOWN_CURRENCIES_ERROR (state, msg) {
    state.knownCurrenciesErrors = msg;
    state.knownCurrenciesResult = null;
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
    state.sendPaymentLoading = false;
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
  },

  ADD_PENDING_TRANSACTION (state, id) {
    state.transactionQueue = [...state.transactionQueue, { id, data: null }];
  },

  RESOLVE_TRANSACTION (state, data) {
    const queue = [...state.transactionQueue];
    const tx = queue.find(tx => tx.id === data.id);
    if (tx) {
      tx.data = data;
    }
    state.transactionQueue = queue;
  }
};
