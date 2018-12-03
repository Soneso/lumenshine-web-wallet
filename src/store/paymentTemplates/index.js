import mutations from './mutations';
import actions from './actions';
import getters from './getters';

function getInitialState () {
  return {
    paymentTemplateErrors: [],
    paymentTemplateLoading: false,
    paymentTemplateResult: null,

    addPaymentTemplateErrors: [],
    addPaymentTemplateLoading: false,

    removePaymentTemplateErrors: [],
    removePaymentTemplateLoading: false,
  };
}

export default {
  state: getInitialState(),
  mutations: {
    ...mutations,
    RESET (state) {
      const s = getInitialState(true);
      Object.keys(s).forEach(key => {
        state[key] = s[key];
      });
    }
  },
  getters,
  actions
};
