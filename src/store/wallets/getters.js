export default {
  wallets: state => ({ err: state.walletsErrors, loading: state.walletsLoading, res: state.walletsResult }),
  addWalletStatus: state => ({ err: state.addWalletErrors, loading: state.addWalletLoading, res: state.addWalletResult }),
  editWalletStatus: state => ({ err: state.editWalletErrors, loading: state.editWalletLoading }),
  addCurrencyStatus: state => ({ err: state.addCurrencyErrors, loading: state.addCurrencyLoading }),
  removeCurrencyStatus: state => ({ err: state.removeCurrencyErrors, loading: state.removeCurrencyLoading }),
  fundWithFriendbotStatus: state => ({ err: state.fundWithFriendbotErrors, loading: state.fundWithFriendbotLoading }),
  publicKeys: state => state.publicKeys,
  currencyPairs: state => ({ err: state.currencyPairsErrors, loading: state.currencyPairsLoading, res: state.currencyPairsResult }),
  currencyRates: state => ({ err: state.currencyRatesErrors, loading: state.currencyRatesLoading, res: state.currencyRatesResult }),
};
