import mutations from './mutations';
import actions from './actions';
import getters from './getters';

function getInitialState () {
  return {
    contactsErrors: [],
    contactsLoading: false,
    contactsResult: null,

    addContactErrors: [],
    addContactLoading: false,

    editContactErrors: [],
    editContactLoading: false,

    removeContactErrors: [],
    removeContactLoading: false,
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
