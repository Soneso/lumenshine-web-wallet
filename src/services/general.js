import apiBase from './apiBase';

export default {
  async getServerInfo () {
    const response = await apiBase.get('/portal/info');
    return response.data;
  },
};
