import apiBase from './apiBase';
import axios from 'axios';

export default {
  async getWallets () {
    const response = await apiBase.get('/portal/user/dashboard/get_user_wallets');
    return response.data;
  },
  async addWallet (params) {
    const response = await apiBase.post('/portal/user/dashboard/add_wallet', params);
    return response;
  },
  async removeWallet (id) {
    const response = await apiBase.post('/portal/user/dashboard/remove_wallet', { id });
    return response;
  },
  async updateWallet (params) {
    const response = await apiBase.post('/portal/user/dashboard/change_wallet_data', params);
    return response;
  },
  async addWalletToHomescreen (params) {
    const response = await apiBase.post('/portal/user/dashboard/wallet_set_homescreen', params);
    return response;
  },
  async removeFederationAddressFromWallet (id) {
    const response = await apiBase.post('/portal/user/dashboard/remove_wallet_federation_address', { id });
    return response;
  },
  async getCurrencyPairs () {
    const response = await apiBase.get('/portal/chart/chart_currency_pairs');
    return response.data;
  },
  async getCurrencyRates (params) {
    const response = await apiBase.post('/portal/chart/chart_current_rates', params);
    return response.data;
  },
  async fundAccountWithFriendbot (account) {
    const response = await axios.get('https://friendbot.stellar.org', { params: { addr: account } });
    return response;
  },
  async getKnownCurrencies (params) {
    const response = await apiBase.post('/portal/user/dashboard/get_known_currencies', params);
    return response.data;
  },
  async getKnownInflationDestinations (params) {
    const response = await apiBase.post('/portal/user/dashboard/get_known_inflation_destinations', params);
    return response.data;
  },
};
