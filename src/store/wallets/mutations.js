import Vue from 'vue';
import config from '@/config';
import WebSocketService from '@/services/websocket';

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
  SET_WALLETS_LOADING (state, payload) {
    if (payload.id === undefined) { // set all to loading
      state.walletsLoading = {};
      return;
    }
    if (Array.isArray(payload.id)) {
      payload.id.forEach(id => Vue.set(state.walletsLoading, id, payload.loading));
      return;
    }
    Vue.set(state.walletsLoading, payload.id, payload.loading);
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

  SET_TRANSACTIONS (state, msg) {
    state.transactionResult = msg;
    state.transactionErrors = [];
  },
  SET_TRANSACTIONS_LOADING (state, msg) {
    state.transactionLoading = msg;
    if (msg) {
      state.transactionResult = null;
    }
  },
  SET_TRANSACTIONS_ERROR (state, msg) {
    state.transactionErrors = msg;
    state.transactionResult = null;
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

  SET_CURRENCY_RATE_HISTORY (state, msg) {
    state.currencyRateHistoryResult = msg;
    state.currencyRateHistoryErrors = [];
  },
  REFRESH_CURRENCY_RATE_HISTORY (state, msg) {
    state.currencyRateHistoryResult = msg;
    state.currencyRateHistoryErrors = [];
  },
  SET_CURRENCY_RATE_HISTORY_LOADING (state, msg) {
    state.currencyRateHistoryLoading = msg;
  },
  SET_CURRENCY_RATE_HISTORY_ERROR (state, msg) {
    state.currencyRateHistoryErrors = msg;
    state.currencyRateHistoryResult = null;
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
  },

  SET_TRANSACTIONS_LOADED (state, msg) {
    state.transactionsLoaded = msg;
  },

  SET_WEBSOCKET (state, ws) {
    if (ws === null) {
      state.watchedWallets = [];
    }
    if (state.websocket) {
      state.websocket.close();
      WebSocketService.close();
    }
    state.websocket = ws;
  },

  TRY_DESTROYING_WEBSOCKET (state, tryDestroy = true) {
    if (state.websocket === null) return;
    if (tryDestroy) {
      if (state.closingWebsocketTimer === null) {
        state.closingWebsocketTimer = setTimeout(() => {
          state.watchedWallets = [];
          state.websocket.close();
          WebSocketService.close();
          state.websocket = null;
        }, 3000);
      }
    } else { // stop destroying it
      if (state.closingWebsocketTimer !== null) {
        clearTimeout(state.closingWebsocketTimer);
        state.closingWebsocketTimer = null;
      }
    }
  },

  SET_WATCHED_WALLETS (state, wallets) {
    if (wallets.length === 0) return; // in this case the websocket connection will be closed by a timer
    // remove disappeared accounts
    state.watchedWallets.forEach(w => {
      if (!wallets.includes(w)) {
        WebSocketService.removeAccount(w);
      }
    });

    // add new accounts
    wallets.forEach(w => {
      if (!state.watchedWallets.includes(w)) {
        WebSocketService.addAccount(w);
      }
    });

    state.watchedWallets = [...wallets];
  },
};
