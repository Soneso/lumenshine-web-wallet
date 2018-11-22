import apiBase from './apiBase';
import config from '@/config';

let wskey = null;

export default {
  async getWebSocket () {
    wskey = new Array(16).fill('').map(() => (~~(Math.random() * 36)).toString(36)).join('');
    const ws = new WebSocket(`${config.API_BASE.replace(/https?:\/\//, 'wss://')}/portal/sse/unsafe_get_ws?random_key=${wskey}`);
    return ws;
  },

  async addAccount (account) {
    const response = await apiBase.post('/portal/sse/listen_account', { key: wskey, account });
    return response.data;
  },

  async removeAccount (account) {
    const response = await apiBase.post('/portal/sse/remove_account', { key: wskey, account });
    return response.data;
  },

  async close () {
    const response = await apiBase.post('/portal/sse/remove_ws', { key: wskey });
    return response.data;
  },
};
