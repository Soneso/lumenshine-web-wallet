export default {
  paymentTemplates: state => ({ err: state.paymentTemplateErrors, loading: state.paymentTemplateLoading, res: state.paymentTemplateResult }),
  addPaymentTemplateStatus: state => ({ err: state.addPaymentTemplateErrors, loading: state.addPaymentTemplateLoading }),
  removePaymentTemplateStatus: state => ({ err: state.removePaymentTemplateErrors, loading: state.removePaymentTemplateLoading }),
};
