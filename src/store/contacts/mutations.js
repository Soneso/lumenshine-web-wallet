export default {
  SET_CONTACTS (state, res) {
    state.contactsResult = res;
    state.contactsErrors = [];
  },

  SET_CONTACTS_LOADING (state, loading) {
    state.contactsLoading = loading;
    if (loading) {
      state.contactsErrors = [];
    }
  },
  SET_CONTACTS_ERROR (state, err) {
    state.contactsErrors = err;
    state.contactsResult = null;
  },

  ADD_CONTACT_LOADING (state, loading) {
    state.addContactLoading = loading;
    if (loading) {
      state.addContactErrors = [];
    }
  },

  ADD_CONTACT_ERROR (state, err) {
    state.addContactErrors = err;
  },

  EDIT_CONTACT_LOADING (state, loading) {
    state.editContactLoading = loading;
    if (loading) {
      state.editContactErrors = [];
    }
  },

  EDIT_CONTACT_ERROR (state, err) {
    state.editContactErrors = err;
  },

  REMOVE_CONTACT_LOADING (state, loading) {
    state.removeContactLoading = loading;
    if (loading) {
      state.removeContactErrors = [];
    }
  },

  REMOVE_CONTACT_ERROR (state, err) {
    state.removeContactErrors = err;
  },
};
