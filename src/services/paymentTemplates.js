import apiBase from './apiBase';

export default {
  async getPaymentTemplates (id) {
    const response = await apiBase.get('/portal/user/dashboard/get_payment_templates', { timestamp: Date.now(), wallet_id: id });
    return response.data;
  },

  async addPaymentTemplate (params) {
    const response = await apiBase.post('/portal/user/dashboard/add_payment_template', { ...params });
    return response.data;
  },

  async removePaymentTemplate (templateId) {
    const response = await apiBase.post('/portal/user/dashboard/remove_payment_template', { id: templateId });
    return response.data;
  },
};
