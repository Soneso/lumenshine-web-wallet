import StellarSdk from 'stellar-sdk';

import config from '@/config';
import workerCaller from '@/util/workerCaller';

import validators from '@/validators';

import WalletService from '@/services/wallet';
import WebSocketService from '@/services/websocket';

import StellarErrorParser from '@/util/StellarErrorParser';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

function createWebsocket ({ commit, dispatch }, retryCount = 0) {
  return new Promise(async (resolve, reject) => {
    if (retryCount > 5) {
      return reject(new Error('Cannot connect to websocket'));
    }
    const ws = await WebSocketService.getWebSocket();
    if (!ws) return reject(new Error('Not logged in'));

    ws.addEventListener('open', event => {
      commit('SET_WEBSOCKET', ws);
      resolve(ws);
    });

    ws.addEventListener('message', event => {
      try {
        const changes = event.data.split('\n');
        const publicKeys = changes.map(change => JSON.parse(change).account);
        dispatch('updateWallets', publicKeys);
      } catch (err) {
        console.error('Error updating wallet', err);
      }
    });

    ws.addEventListener('error', event => {
      console.error('Websocket connection error', event);
      commit('SET_WEBSOCKET', null);
      setTimeout(() => {
        createWebsocket({ commit, dispatch }, retryCount + 1).then(() => resolve()).catch(err => reject(err));
      }, 3000);
    });

    ws.addEventListener('close', event => {
      commit('SET_WEBSOCKET', null);
    });
  });
}

function waitAndResolveTx ({ commit, dispatch }, { publicKeys, transactionId }) {
  setTimeout(async () => {
    try {
      const txData = await StellarAPI.transactions()
        .transaction(transactionId)
        .limit(1)
        .call();
      const operations = await txData.operations();
      txData.operation = operations.records[0];
      commit('RESOLVE_TRANSACTION', txData);
      dispatch('updateWallets', publicKeys);
    } catch (err) {
      console.error('Cannot fetch tx info, retrying...');
      waitAndResolveTx({ commit }, transactionId);
    }
  }, 1500);
}

export default {
  async getWallets ({ commit }) {
    try {
      commit('SET_WALLETS_LOADING', { loading: true }); // set all to loading
      const backendRes = await WalletService.getWallets();
      const stellarRes = await Promise.all(
        backendRes.map(account =>
          StellarAPI.loadAccount(account.public_key).catch(err => err)
        )
      );
      const extended = backendRes.map(account => {
        const stellarData = stellarRes.find(acc => acc.id === account.public_key);
        return { ...account, stellar_data: stellarData };
      });

      commit('SET_WALLETS', extended);
      commit('SET_WALLETS_LOADING', { id: extended.map(acc => acc.id), loading: false });
    } catch (err) {
      commit('SET_WALLETS_ERROR', err.data);
    }
  },

  async watchWallets ({ commit, state, dispatch }, wallets) {
    if (wallets.length === 0 && state.websocket !== null) {
      commit('TRY_DESTROYING_WEBSOCKET', true);
    } else {
      commit('TRY_DESTROYING_WEBSOCKET', false);
      if (state.websocket === null || state.websocket.readyState !== 1) { // WebSocket is not open
        await createWebsocket({ commit, state, dispatch });
      }
      commit('SET_WATCHED_WALLETS', wallets);
    }
  },

  async updateWallets ({ commit, getters }, keywords) {
    // transform public keys to wallet ids
    const ids = keywords.map(k => {
      if (Number.isInteger(k)) {
        return k;
      }
      const wallet = getters.wallets.res.find(w => w.public_key === k);
      return wallet ? wallet.id : null;
    }).filter(k => k);
    commit('SET_WALLETS_LOADING', { id: ids, loading: true });

    try {
      // TODO: add backend interface for querying one wallet

      const backendRes = (await WalletService.getWallets()).filter(wallet => ids.includes(wallet.id));
      const stellarRes = await Promise.all(
        backendRes.map(account =>
          new Promise(async resolve => {
            const stellarData = await StellarAPI.loadAccount(account.public_key).catch(err => err);
            resolve(stellarData);
          })
        )
      );
      const extended = backendRes.map(account => {
        const stellarData = stellarRes.find(acc => acc.id === account.public_key);
        return { ...account, stellar_data: stellarData };
      });
      commit('UPDATE_WALLETS', extended);
    } catch (err) {
      commit('UPDATE_WALLETS_ERROR', err.data);
    }
    commit('SET_WALLETS_LOADING', { id: ids, loading: false });
  },

  resetAddWallet ({ commit }) {
    commit('ADD_WALLET_ERROR', []);
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

  resetEditWallet ({ commit }) {
    commit('EDIT_WALLET_ERROR', []);
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

    const hasFederationAddress = validators.federationAddress().federationAddress(destination);
    if (hasFederationAddress) {
      try {
        const federationRecord = await StellarSdk.FederationServer.resolve(destination);
        destination = federationRecord.account_id;
      } catch (err) {
        commit('SET_INFLATION_DEST_LOADING', false);
        return commit('SET_INFLATION_DEST_ERROR', [{ error_code: 'NO_DESTINATION' }]);
      }
    }

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

    const hasFederationAddress = validators.federationAddress().federationAddress(issuer);
    if (hasFederationAddress) {
      try {
        const federationRecord = await StellarSdk.FederationServer.resolve(issuer);
        issuer = federationRecord.account_id;
      } catch (err) {
        commit('ADD_CURRENCY_LOADING', false);
        return commit('ADD_CURRENCY_ERROR', [{ error_code: 'NO_ISSUER' }]);
      }
    }

    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secretSeed);
      const sourcePublicKey = sourceKeypair.publicKey();

      if (issuer === sourcePublicKey) {
        commit('ADD_CURRENCY_LOADING', false);
        return commit('ADD_CURRENCY_ERROR', [{ error_code: 'SAME_WALLET' }]);
      }

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

  async loadTransactions ({ commit }, params) {
    commit('SET_TRANSACTIONS_LOADING', true);
    try {
      const transactions = await WalletService.getStellarTransactions(params);
      commit('SET_TRANSACTIONS', transactions);
    } catch (err) {
      commit('SET_TRANSACTIONS_ERROR', err.data);
    }
    commit('SET_TRANSACTIONS_LOADING', false);
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

  async getCurrencyRateHistory ({ commit }, params) {
    commit('SET_CURRENCY_RATE_HISTORY_LOADING', true);
    try {
      const data = await WalletService.getCurrencyRateHistory(params);
      data.rates.reverse();
      commit('SET_CURRENCY_RATE_HISTORY', data);
    } catch (err) {
      commit('SET_CURRENCY_RATE_HISTORY_ERROR', err.data);
    }
    commit('SET_CURRENCY_RATE_HISTORY_LOADING', false);
  },

  async refreshCurrencyRateHistory ({ commit }, params) {
    try {
      const data = await WalletService.getCurrencyRateHistory(params);
      data.rates.reverse();
      commit('REFRESH_CURRENCY_RATE_HISTORY', data);
    } catch (err) {
    }
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
    commit('SET_SEND_PAYMENT_ERROR', []);

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

    if ((currentAccount instanceof Error || destinationAccount instanceof Error) && data.assetCode !== 'XLM') {
      commit('SET_SEND_PAYMENT_LOADING', false);
      commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'CANNOT_FUND' }]);
      return;
    }

    try {
      let transaction;

      if (currentAccount instanceof Error || destinationAccount instanceof Error) {
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
      waitAndResolveTx({ commit, dispatch }, { publicKeys: [sourcePublicKey, data.recipient], transactionId });

      // await dispatch('updateWallets', [sourcePublicKey, data.recipient]);
    } catch (err) {
      console.error(err);
      commit('SET_SEND_PAYMENT_LOADING', false);
      const errorCode = StellarErrorParser(err);
      if (errorCode === 'op_no_trust') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'NOT_TRUSTED', err }]);
      } else if (errorCode === 'op_underfunded') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'UNDERFUNDED', err }]);
      } else if (errorCode === 'op_no_destination') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'NO_DESTINATION', err }]);
      } else if (errorCode === 'tx_bad_seq') {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'BAD_SEQUENCE', err }]);
      } else {
        return commit('SET_SEND_PAYMENT_ERROR', [{ error_code: 'UNKNOWN_ERROR', err }]);
      }
    }
  },

  async resetMergeExternalAccount ({ commit, dispatch, getters }, data) {
    commit('SET_MERGE_EXTERNAL_ACCOUNT_LOADING', false);
    commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', []);
    commit('SET_MERGE_EXTERNAL_ACCOUNT_RESULT', null);
  },

  async mergeExternalAccount ({ commit, dispatch, getters }, data) {
    commit('SET_MERGE_EXTERNAL_ACCOUNT_LOADING', true);
    commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', []);

    const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secretSeed);
    const sourcePublicKey = sourceKeypair.publicKey();

    const sourceAccount = await StellarAPI.loadAccount(sourcePublicKey).catch(err => err);

    if (sourceAccount instanceof Error) {
      commit('SET_MERGE_EXTERNAL_ACCOUNT_LOADING', false);
      commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', [{ error_code: 'NO_SOURCE_ACCOUNT' }]);
      return;
    }

    const errors = [];
    console.log('sourceAccount', sourceAccount);
    if (sourceAccount.data_attr && Object.values(sourceAccount.data_attr).length > 0) {
      errors.push({ error_code: 'HAS_DATA' });
    }

    if (sourceAccount.balances.length > 1) {
      errors.push({ error_code: 'HAS_TRUSTLINES' });
    }

    if (errors.length > 0) {
      commit('SET_MERGE_EXTERNAL_ACCOUNT_LOADING', false);
      commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', errors);
      return;
    }

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

    try {
      let transaction = new StellarSdk.TransactionBuilder(sourceAccount, memo)
        .addOperation(StellarSdk.Operation.accountMerge({
          destination: data.destination
        }))
        .build();

      transaction.sign(sourceKeypair);

      const res = await StellarAPI.submitTransaction(transaction);

      const transactionIdMatch = res._links.transaction.href.match(/transactions\/([0-9a-f]+)/);
      if (!transactionIdMatch || !transactionIdMatch[1]) {
        return commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', [{ error_code: 'UNKNOWN' }]);
      }
      const transactionId = transactionIdMatch[1];
      res.transactionId = transactionId;

      commit('ADD_PENDING_TRANSACTION', transactionId);
      commit('SET_MERGE_EXTERNAL_ACCOUNT_RESULT', res);
      waitAndResolveTx({ commit, dispatch }, { publicKeys: [sourcePublicKey, data.recipient], transactionId });

      // await dispatch('updateWallets', [sourcePublicKey, data.recipient]);
    } catch (err) {
      console.error(err);
      commit('SET_MERGE_EXTERNAL_ACCOUNT_LOADING', false);
      const errorCode = StellarErrorParser(err);
      if (errorCode === 'op_underfunded') {
        return commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', [{ error_code: 'UNDERFUNDED', err }]);
      } else if (errorCode === 'op_no_destination') {
        return commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', [{ error_code: 'NO_DESTINATION', err }]);
      } else if (errorCode === 'tx_bad_seq') {
        return commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', [{ error_code: 'BAD_SEQUENCE', err }]);
      } else {
        return commit('SET_MERGE_EXTERNAL_ACCOUNT_ERROR', [{ error_code: 'UNKNOWN_ERROR', err }]);
      }
    }
  }
};
