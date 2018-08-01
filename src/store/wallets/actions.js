import StellarSdk from 'stellar-sdk';

import config from '@/config';

import WalletService from '@/services/wallet';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
StellarSdk.Network.useTestNetwork();

export default {
  async getWallets ({ commit, getters }) {
    commit('SET_WALLETS_LOADING', true);
    try {
      const backendRes = await WalletService.getWallets();
      const stellarRes = await Promise.all(
        backendRes.map(account =>
          StellarAPI.loadAccount(account.public_key_0).catch(err => err)
        )
      );
      const extended = backendRes.map(account => {
        const stellarData = stellarRes.find(acc => acc.id === account.public_key_0);
        return { ...account, stellar_data: stellarData };
      });
      commit('SET_WALLETS', extended);
    } catch (err) {
      commit('SET_WALLETS_ERROR', err.data);
    }
    commit('SET_WALLETS_LOADING', false);
  },

  async addWallet ({ commit, dispatch }, params) {
    commit('ADD_WALLET_LOADING', true);
    try {
      const res = await WalletService.addWallet(params);
      commit('ADD_WALLET_RESULT', res.data);
      await dispatch('getWallets');
    } catch (err) {
      commit('ADD_WALLET_ERROR', err.data);
    }
    commit('ADD_WALLET_LOADING', false);
  },

  async editWallet ({ commit, dispatch, getters }, params) {
    commit('EDIT_WALLET_LOADING', true);
    try {
      const oldWallet = getters.wallets.res.find(w => w.id === params.id);
      if (oldWallet && oldWallet.wallet_name !== params.wallet_name) {
        await WalletService.updateWallet(params);
      }
      if (!oldWallet || oldWallet.show_on_homescreen !== params.onHomescreen) {
        await WalletService.addWalletToHomescreen({ id: params.id, visible: params.onHomescreen });
      }
      await dispatch('getWallets');
      commit('EDIT_WALLET_ERROR', []);
    } catch (err) {
      commit('EDIT_WALLET_ERROR', err.data);
    }
    commit('EDIT_WALLET_LOADING', false);
  },

  async removeWalletAddress ({ commit, dispatch }, id) {
    commit('EDIT_WALLET_LOADING', true);
    try {
      await WalletService.removeFederationAddressFromWallet(id);
      await dispatch('getWallets');
      commit('EDIT_WALLET_ERROR', []);
    } catch (err) {
      commit('EDIT_WALLET_ERROR', err.data);
    }
    commit('EDIT_WALLET_LOADING', false);
  },

  async setInflationDestination ({ commit, dispatch }, { secretSeed, destination }) {
    commit('SET_INFLATION_DEST_LOADING', true);
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secretSeed);
      const sourcePublicKey = sourceKeypair.publicKey();

      const account = await StellarAPI.loadAccount(sourcePublicKey);

      const transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.setOptions({
          inflationDest: destination
        }))
        .build();

      transaction.sign(sourceKeypair);

      await StellarAPI.submitTransaction(transaction);
      await dispatch('getWallets');
      commit('SET_INFLATION_DEST_ERROR', []);
    } catch (err) {
      console.error(err);
      commit('SET_INFLATION_DEST_ERROR', [{ error_message: 'Cannot update data, try again later.' }]);
    }
    commit('SET_INFLATION_DEST_LOADING', false);
  },

  async addCurrency ({ commit, dispatch }, { secretSeed, assetCode, issuer }) {
    commit('ADD_CURRENCY_LOADING', true);
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secretSeed);
      const sourcePublicKey = sourceKeypair.publicKey();

      const account = await StellarAPI.loadAccount(sourcePublicKey);

      const transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: new StellarSdk.Asset(assetCode, issuer),
        }))
        .build();

      transaction.sign(sourceKeypair);

      await StellarAPI.submitTransaction(transaction);
      await dispatch('getWallets');
      commit('ADD_CURRENCY_ERROR', []);
    } catch (err) {
      console.error(err);
      if (err.message === 'Issuer is invalid') {
        commit('ADD_CURRENCY_ERROR', [{ error_code: 'INVALID_ISSUER' }]);
      } else {
        commit('ADD_CURRENCY_ERROR', [{ error_code: 'UNKNOWN_ERROR' }]);
      }
    }
    commit('ADD_CURRENCY_LOADING', false);
  },

  async removeCurrency ({ commit, dispatch }, { secretSeed, assetCode, issuer }) {
    commit('REMOVE_CURRENCY_LOADING', true);
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secretSeed);
      const sourcePublicKey = sourceKeypair.publicKey();

      const account = await StellarAPI.loadAccount(sourcePublicKey);

      const transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: new StellarSdk.Asset(assetCode, issuer),
          limit: '0'
        }))
        .build();

      transaction.sign(sourceKeypair);

      await StellarAPI.submitTransaction(transaction);
      await dispatch('getWallets');
      commit('REMOVE_CURRENCY_ERROR', []);
    } catch (err) {
      console.error(err);
      if (err.message === 'Issuer is invalid') {
        commit('REMOVE_CURRENCY_ERROR', [{ error_code: 'INVALID_ISSUER' }]);
      } else {
        commit('REMOVE_CURRENCY_ERROR', [{ error_code: 'UNKNOWN_ERROR' }]);
      }
    }
    commit('REMOVE_CURRENCY_LOADING', false);
  },

  // used for storing the available wallet public keys on login
  setPublicKeys ({ commit }, publicKeys) {
    commit('SET_PUBLIC_KEYS', publicKeys);
  },

  async getCurrencyPairs ({ commit }) {
    commit('SET_CURRENCY_PAIRS_LOADING', true);
    try {
      const pairs = await WalletService.getCurrencyPairs();
      commit('SET_CURRENCY_PAIRS', pairs);
    } catch (err) {
      commit('SET_CURRENCY_PAIRS_ERROR', err.data);
    }
    commit('SET_CURRENCY_PAIRS_LOADING', false);
  },

  async getCurrencyData ({ commit }) {
    commit('SET_CURRENCY_DATA_LOADING', true);
    try {
      const data = await WalletService.getCurrencyData();
      commit('SET_CURRENCY_DATA', data);
    } catch (err) {
      commit('SET_CURRENCY_DATA_ERROR', err.data);
    }
    commit('SET_CURRENCY_DATA_LOADING', false);
  },

  async fundAccountWithFriendbot ({ commit, dispatch }, account) {
    commit('SET_FUND_WITH_FRIENDBOT_LOADING', true);
    try {
      await WalletService.fundAccountWithFriendbot(account);
      await dispatch('getWallets');
      commit('SET_FUND_WITH_FRIENDBOT_ERROR', []);
    } catch (err) {
      commit('SET_FUND_WITH_FRIENDBOT_ERROR', err.data);
    }
    commit('SET_FUND_WITH_FRIENDBOT_LOADING', false);
  }

};
