export default {
  decryptedWallet: state => ({ err: state.decryptionError, publicKey: state.decryptedPublicKey, secretSeed: state.decryptedSecret, loading: state.decryptionLoading }),
  wallets: state => ({ err: state.walletsErrors, loading: state.walletsLoading, res: state.walletsResult }),
  addWalletStatus: state => ({ err: state.addWalletErrors, loading: state.addWalletLoading, res: state.addWalletResult }),
  editWalletStatus: state => ({ err: state.editWalletErrors, loading: state.editWalletLoading }),
  addCurrencyStatus: state => ({ err: state.addCurrencyErrors, loading: state.addCurrencyLoading }),
  addInflationDestinationStatus: state => ({ err: state.inflationDestErrors, loading: state.inflationDestLoading }),
  removeCurrencyStatus: state => ({ err: state.removeCurrencyErrors, loading: state.removeCurrencyLoading }),
  fundWithFriendbotStatus: state => ({ err: state.fundWithFriendbotErrors, loading: state.fundWithFriendbotLoading }),
  publicKeys: state => state.publicKeys,
  transactions: state => ({ err: state.transactionErrors, loading: state.transactionLoading, res: state.transactionResult }),
  currencyPairs: state => ({ err: state.currencyPairsErrors, loading: state.currencyPairsLoading, res: state.currencyPairsResult }),
  currencyRates: state => ({ err: state.currencyRatesErrors, loading: state.currencyRatesLoading, res: state.currencyRatesResult }),
  sendPaymentStatus: state => ({ err: state.sendPaymentErrors, loading: state.sendPaymentLoading, res: state.sendPaymentResult }),
  exchanges: state => state.exchanges,
  knownCurrencies: state => state.knownCurrenciesResult,
  knownCurrenciesStatus: state => ({
    err: state.knownCurrenciesErrors,
    loading: state.knownCurrenciesLoading,
    shouldLoad: state.knownCurrenciesErrors.length === 0 && !state.knownCurrenciesLoading && !state.knownCurrenciesResult
  }),
  knownDestinations: state => state.knownDestinationsResult,
  knownDestinationsStatus: state => ({
    err: state.knownDestinationsErrors,
    loading: state.knownDestinationsLoading,
    shouldLoad: state.knownDestinationsErrors.length === 0 && !state.knownDestinationsLoading && !state.knownDestinationsResult
  }),
  pendingTransactions: state => state.transactionQueue.filter(tr => !tr.data).map(tr => tr.id),
  finishedTransactions: state => state.transactionQueue.filter(tr => tr.data).map(tr => tr.data),
};
