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
    return new Promise(resolve => {
      setTimeout(() => resolve({
        XLM: [
          'ETH',
          'CNY',
          'USD',
          'BTC',
          'EUR',
          'KRW'
        ]
      }), 50);
    });
    // const response = await apiBase.get('/portal/chart/chart_currency_pairs');
    // return response.data;
  },
  async getCurrencyData (params) {
    return new Promise(resolve => {
      setTimeout(() => resolve({
        'destination_currency': 'USD',
        'rates': [
          {
            'asset_code': 'XLM',
            'issuer_public_key': '',
            'rate': 0.313823,
            'last_updated': '2018-07-19T07:45:24Z'
          }
        ]
      }), 50);
    });
    // const response = await apiBase.post('/portal/chart/chart_current_data', params);
    // return response.data;
  },
  async fundAccountWithFriendbot (account) {
    const response = await axios.get('https://friendbot.stellar.org', { params: { addr: account } });
    return response;
  }
};
