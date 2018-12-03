import PaymentTemplateService from '@/services/paymentTemplates';

export default {
  async getPaymentTemplates ({ commit }, walletId) {
    commit('SET_PAYMENT_TEMPLATES_LOADING', true);
    try {
      const backendRes = await PaymentTemplateService.getPaymentTemplates(walletId);
      commit('SET_PAYMENT_TEMPLATES', backendRes);
    } catch (err) {
      commit('SET_PAYMENT_TEMPLATES_ERROR', err.data);
    }
    commit('SET_PAYMENT_TEMPLATES_LOADING', false);
  },

  async addPaymentTemplate ({ commit, dispatch }, params) {
    commit('ADD_PAYMENT_TEMPLATE_LOADING', true);
    try {
      await PaymentTemplateService.addPaymentTemplate(params);
      dispatch('getPaymentTemplates', params.wallet_id);
    } catch (err) {
      commit('ADD_PAYMENT_TEMPLATE_ERROR', err.data);
    }
    commit('ADD_PAYMENT_TEMPLATE_LOADING', false);
  },

  async removePaymentTemplate ({ commit, dispatch }, { templateId, walletId }) {
    commit('REMOVE_PAYMENT_TEMPLATE_LOADING', true);
    try {
      await PaymentTemplateService.removePaymentTemplate(templateId);
      dispatch('getPaymentTemplates', walletId);
    } catch (err) {
      commit('REMOVE_PAYMENT_TEMPLATE_ERROR', err.data);
    }
    commit('REMOVE_PAYMENT_TEMPLATE_LOADING', false);
  },
};
