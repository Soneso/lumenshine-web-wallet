import StellarSdk from 'stellar-sdk';

import config from '@/config';
import workerCaller from '@/util/workerCaller';

import validators from '@/validators';

import WalletService from '@/services/wallet';

import StellarErrorParser from '@/util/StellarErrorParser';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

export default {
  async getWallets ({ commit, getters, dispatch }) {
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
      extended.forEach(async acc => {
        if (acc.stellar_data) {
          const lastTransaction = await StellarAPI.transactions()
            .forAccount(acc.public_key_0)
            .order('desc')
            .limit(1)
            .call();
          StellarAPI.transactions()
            .forAccount(acc.public_key_0)
            .cursor(lastTransaction.records[0].paging_token)
            .stream({
              onmessage: async tx => {
                if (getters.pendingTransactions.find(t => t === tx.id)) {
                  const operations = await tx.operations();
                  tx.operation = operations.records[0];
                  commit('RESOLVE_TRANSACTION', tx);
                }
                dispatch('updateWallets', [acc.public_key_0]);
              }
            });
        }
      });
      commit('SET_WALLETS', extended);
    } catch (err) {
      commit('SET_WALLETS_ERROR', err.data);
    }
    commit('SET_WALLETS_LOADING', false);
  },

  async updateWallets ({ commit, getters }, keywords) {
    commit('UPDATE_WALLETS_LOADING', true);
    try {
      // TODO: add backend interface for querying one wallet

      // transform public keys to wallet ids
      const ids = keywords.map(k => {
        if (Number.isInteger(k)) {
          return k;
        }
        const wallet = getters.wallets.res.find(w => w.public_key_0 === k);
        return wallet ? wallet.id : null;
      }).filter(k => k);
      const backendRes = (await WalletService.getWallets()).filter(wallet => ids.includes(wallet.id));
      const stellarRes = await Promise.all(
        backendRes.map(account =>
          StellarAPI.loadAccount(account.public_key_0).catch(err => err)
        )
      );
      const extended = backendRes.map(account => {
        const stellarData = stellarRes.find(acc => acc.id === account.public_key_0);
        return { ...account, stellar_data: stellarData };
      });
      commit('UPDATE_WALLETS', extended);
    } catch (err) {
      commit('UPDATE_WALLETS_ERROR', err.data);
    }
    commit('UPDATE_WALLETS_LOADING', false);
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
      await dispatch('updateWallets', [params.id]);
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

  async resetInflationDestinationActions ({ commit }) {
    commit('SET_INFLATION_DEST_LOADING', false);
    commit('SET_INFLATION_DEST_ERROR', []);
  },

  async setInflationDestination ({ commit, dispatch }, { publicKey, secretSeed, destination }) {
    commit('SET_INFLATION_DEST_LOADING', true);
    commit('SET_INFLATION_DEST_ERROR', []);
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
      await dispatch('updateWallets', [ publicKey ]);
    } catch (err) {
      console.error(err);
      const errorCode = StellarErrorParser(err);
      if (errorCode === 'op_invalid_inflation') {
        commit('SET_INFLATION_DEST_ERROR', [{ error_code: 'INVALID_DESTINATION', err }]);
      } else {
        commit('SET_INFLATION_DEST_ERROR', [{ error_code: 'UNKNOWN_ERROR', err }]);
      }
    }
    commit('SET_INFLATION_DEST_LOADING', false);
  },

  async resetCurrencyActions ({ commit }) {
    commit('ADD_CURRENCY_LOADING', false);
    commit('ADD_CURRENCY_ERROR', []);
    commit('REMOVE_CURRENCY_LOADING', false);
    commit('REMOVE_CURRENCY_ERROR', []);
  },

  async addCurrency ({ commit, dispatch }, { publicKey, secretSeed, assetCode, issuer }) {
    commit('ADD_CURRENCY_LOADING', true);
    commit('ADD_CURRENCY_ERROR', []);
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
      await dispatch('updateWallets', [ publicKey ]);
    } catch (err) {
      console.error(err);
      const errorCode = StellarErrorParser(err);
      if (err.message === 'Issuer is invalid') {
        commit('ADD_CURRENCY_ERROR', [{ error_code: 'INVALID_ISSUER', err }]);
      } else if (errorCode === 'op_no_issuer') {
        commit('ADD_CURRENCY_ERROR', [{ error_code: 'INVALID_ISSUER', err }]);
      } else {
        commit('ADD_CURRENCY_ERROR', [{ error_code: 'UNKNOWN_ERROR', err }]);
      }
    }
    commit('ADD_CURRENCY_LOADING', false);
  },

  async removeCurrency ({ commit, dispatch }, { publicKey, secretSeed, assetCode, issuer }) {
    commit('REMOVE_CURRENCY_LOADING', true);
    commit('REMOVE_CURRENCY_ERROR', []);
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
      await dispatch('updateWallets', [ publicKey ]);
    } catch (err) {
      console.error(err);
      const errorCode = StellarErrorParser(err);
      if (err.message === 'Issuer is invalid') {
        commit('REMOVE_CURRENCY_ERROR', [{ error_code: 'INVALID_ISSUER', err }]);
      } else if (errorCode === 'op_no_issuer') {
        commit('REMOVE_CURRENCY_ERROR', [{ error_code: 'INVALID_ISSUER', err }]);
      } else {
        commit('REMOVE_CURRENCY_ERROR', [{ error_code: 'UNKNOWN_ERROR', err }]);
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

  async getCurrencyRates ({ commit }, params) {
    commit('SET_CURRENCY_RATES_LOADING', true);
    try {
      const data = await WalletService.getCurrencyRates(params);
      commit('SET_CURRENCY_RATES', data);
    } catch (err) {
      commit('SET_CURRENCY_RATES_ERROR', err.data);
    }
    commit('SET_CURRENCY_RATES_LOADING', false);
  },

  async getKnownDestinations ({ commit }, params) {
    commit('SET_KNOWN_DESTINATIONS_LOADING', true);
    try {
      const data = await WalletService.getKnownInflationDestinations(params);
      commit('SET_KNOWN_DESTINATIONS', data);
    } catch (err) {
      commit('SET_KNOWN_DESTINATIONS_ERROR', err.data);
    }
    commit('SET_KNOWN_DESTINATIONS_LOADING', false);
  },

  async getKnownCurrencies ({ commit }, params) {
    commit('SET_KNOWN_CURRENCIES_LOADING', true);
    try {
      const data = await WalletService.getKnownCurrencies(params);
      commit('SET_KNOWN_CURRENCIES', data);
    } catch (err) {
      commit('SET_KNOWN_CURRENCIES_ERROR', err.data);
    }
    commit('SET_KNOWN_CURRENCIES_LOADING', false);
  },

  async fundAccountWithFriendbot ({ commit, dispatch }, publicKey) {
    commit('SET_FUND_WITH_FRIENDBOT_LOADING', true);
    try {
      await WalletService.fundAccountWithFriendbot(publicKey);
      await dispatch('updateWallets', [ publicKey ]);
      commit('SET_FUND_WITH_FRIENDBOT_ERROR', []);
    } catch (err) {
      commit('SET_FUND_WITH_FRIENDBOT_ERROR', err.data);
    }
    commit('SET_FUND_WITH_FRIENDBOT_LOADING', false);
  },

  async decryptWallet ({ commit, getters, dispatch }, { publicKey, password }) {
    if (getters.decryptedWallet.publicKey === publicKey) {
      return;
    }
    commit('SET_DECRYPTION_LOADING');

    await dispatch('getUserAuthData');

    const authData = getters.userAuthData.res;

    const kdfPass = await workerCaller('derivePassword', password, authData.kdf_password_salt);
    const [ mnemonicMasterKey, wordlistMasterKey ] = await Promise.all([
      workerCaller('decryptMasterKey', kdfPass, authData.mnemonic_master_key_encryption_iv, authData.encrypted_mnemonic_master_key),
      workerCaller('decryptMasterKey', kdfPass, authData.wordlist_master_key_encryption_iv, authData.encrypted_wordlist_master_key)
    ]);

    const [ mnemonicIndices, wordlist ] = await Promise.all([
      workerCaller('decryptMnemonic', mnemonicMasterKey, authData.mnemonic_encryption_iv, authData.encrypted_mnemonic),
      workerCaller('decryptWordlist', wordlistMasterKey, authData.wordlist_encryption_iv, authData.encrypted_wordlist)
    ]);

    const isValidWordlist = !!(wordlist.toString().match(/^([a-z,]{3,25}\s?)+$/));
    if (!isValidWordlist) {
      commit('SET_DECRYPTION_ERROR');
      return;
    }

    const mnemonic = await workerCaller('indicesToMnemonic', mnemonicIndices, wordlist);
    if (!getters.publicKeys) {
      commit('SET_DECRYPTION_ERROR');
      return;
    }
    const keyIndex = getters.publicKeys.indexOf(publicKey);
    if (keyIndex === -1) {
      commit('SET_DECRYPTION_ERROR');
      return;
    }

    const secretSeed = await workerCaller('getSecretSeed', mnemonic, keyIndex);
    commit('SET_DECRYPTED_WALLET', { publicKey: publicKey, secretSeed });
  },

  async resetDecryptedWallet ({ commit }) {
    commit('RESET_DECRYPTED_WALLET');
  },

  async resetSendPayment ({ commit }) {
    commit('SET_SEND_PAYMENT_LOADING', false);
    commit('SET_SEND_PAYMENT_RESULT', null);
  },

  async sendPayment ({ commit, dispatch, getters }, data) {
    commit('SET_SEND_PAYMENT_LOADING', true);

    const hasFederationAddress = validators.federationAddress().federationAddress(data.recipient);
    if (hasFederationAddress) {
      try {
        const federationRecord = await StellarSdk.FederationServer.resolve(data.recipient);
        data.recipient = federationRecord.account_id;
      } catch (err) {
        commit('SET_SEND_PAYMENT_LOADING', false);
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'NO_DESTINATION' }]);
      }
    }

    let sourceKeypair;
    if (data.password) {
      await dispatch('decryptWallet', { publicKey: data.publicKey, password: data.password });
      if (getters.decryptedWallet.err) {
        commit('SET_SEND_PAYMENT_LOADING', false);
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'WRONG_PASSWORD' }]);
      }
      sourceKeypair = StellarSdk.Keypair.fromSecret(getters.decryptedWallet.secretSeed);
      commit('RESET_DECRYPTED_WALLET');
    } else {
      sourceKeypair = StellarSdk.Keypair.fromSecret(data.signerSeed);
    }
    const sourcePublicKey = sourceKeypair.publicKey();

    let memo;
    if (data.memo !== '') {
      switch (data.memoType) {
        case 'MEMO_TEXT':
          memo = { memo: StellarSdk.Memo.text(data.memo) };
          break;
        case 'MEMO_ID':
          memo = { memo: StellarSdk.Memo.id(data.memo) };
          break;
        case 'MEMO_HASH':
          memo = { memo: StellarSdk.Memo.hash(data.memo) };
          break;
        case 'MEMO_RETURN':
          memo = { memo: StellarSdk.Memo.returnHash(data.memo) };
          break;
      }
    }
    const [ currentAccount, destinationAccount ] =
      await Promise.all([
        StellarAPI.loadAccount(sourcePublicKey),
        StellarAPI.loadAccount(data.recipient).catch(e => e)
      ]);

    if (!data.shouldFund && (currentAccount instanceof Error || destinationAccount instanceof Error)) {
      commit('SET_SEND_PAYMENT_LOADING', false);
      if (data.assetCode !== 'XLM') {
        commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'CANNOT_FUND' }]);
      } else {
        commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'SHOULD_FUND' }]);
      }
      return;
    }

    try {
      let transaction;

      if (data.shouldFund) {
        transaction = new StellarSdk.TransactionBuilder(currentAccount, memo)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: data.recipient,
            startingBalance: data.amount
          }))
          .build();
      } else { // wallet already funded
        let asset;
        if (data.assetCode === '_other') {
          asset = new StellarSdk.Asset(data.customAssetCode, sourcePublicKey);
        } else if (data.assetCode === 'XLM') {
          asset = StellarSdk.Asset.native();
        } else {
          asset = new StellarSdk.Asset(data.assetCode, data.issuer);
        }

        transaction = new StellarSdk.TransactionBuilder(currentAccount, memo)
          .addOperation(StellarSdk.Operation.payment({
            destination: data.recipient,
            asset,
            amount: data.amount
          }))
          .build();
      }

      transaction.sign(sourceKeypair);

      const res = await StellarAPI.submitTransaction(transaction);
      const transactionIdMatch = res._links.transaction.href.match(/transactions\/([0-9a-f]+)/);
      if (!transactionIdMatch || !transactionIdMatch[1]) {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'UNKNOWN' }]);
      }
      const transactionId = transactionIdMatch[1];
      res.transactionId = transactionId;
      commit('ADD_PENDING_TRANSACTION', transactionId);
      commit('SET_SEND_PAYMENT_RESULT', res);
      // await dispatch('updateWallets', [sourcePublicKey, data.recipient]);
    } catch (err) {
      commit('SET_SEND_PAYMENT_LOADING', false);
      const errorCode = StellarErrorParser(err);
      if (errorCode === 'op_no_trust') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'NOT_TRUSTED', err }]);
      } else if (errorCode === 'op_underfunded') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'UNDERFUNDED', err }]);
      } else if (errorCode === 'op_no_destination') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'NO_DESTINATION', err }]);
      } else {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'UNKNOWN_ERROR', err }]);
      }
    }
  }

};
