export default {
  SET_PAYMENT_TEMPLATES (state, res) {
    state.paymentTemplateResult = res;
    state.paymentTemplateErrors = [];
  },

  SET_PAYMENT_TEMPLATES_LOADING (state, loading) {
    state.paymentTemplateLoading = loading;
    if (loading) {
      state.paymentTemplateErrors = [];
    }
  },
  SET_PAYMENT_TEMPLATES_ERROR (state, err) {
    state.paymentTemplateErrors = err;
    state.paymentTemplateResult = null;
  },

  ADD_PAYMENT_TEMPLATE_LOADING (state, loading) {
    state.addPaymentTemplateLoading = loading;
    if (loading) {
      state.addPaymentTemplateErrors = [];
    }
  },

  ADD_PAYMENT_TEMPLATE_ERROR (state, err) {
    state.addPaymentTemplateErrors = err;
  },

  REMOVE_PAYMENT_TEMPLATE_LOADING (state, loading) {
    state.removePaymentTemplateLoading = loading;
    if (loading) {
      state.removePaymentTemplateErrors = [];
    }
  },

  REMOVE_PAYMENT_TEMPLATE_ERROR (state, err) {
    state.removePaymentTemplateErrors = err;
  },
};
