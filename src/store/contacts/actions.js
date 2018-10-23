import ContactService from '@/services/contact';

export default {
  async getContacts ({ commit }) {
    commit('SET_CONTACTS_LOADING', true);
    try {
      const backendRes = await ContactService.getContacts();
      commit('SET_CONTACTS', backendRes);
    } catch (err) {
      commit('SET_CONTACTS_ERROR', err.data);
    }
    commit('SET_CONTACTS_LOADING', false);
  },

  async addContact ({ commit, dispatch }, params) {
    commit('ADD_CONTACT_LOADING', true);
    try {
      await ContactService.addContact(params);
      dispatch('getContacts');
    } catch (err) {
      commit('ADD_CONTACT_ERROR', err.data);
    }
    commit('ADD_CONTACT_LOADING', false);
  },

  async editContact ({ commit, dispatch }, params) {
    commit('EDIT_CONTACT_LOADING', true);
    try {
      await ContactService.editContact(params);
      dispatch('getContacts');
    } catch (err) {
      commit('EDIT_CONTACT_ERROR', err.data);
    }
    commit('EDIT_CONTACT_LOADING', false);
  },

  async removeContact ({ commit, dispatch }, params) {
    commit('REMOVE_CONTACT_LOADING', true);
    try {
      await ContactService.removeContact(params);
      dispatch('getContacts');
    } catch (err) {
      commit('REMOVE_CONTACT_ERROR', err.data);
    }
    commit('REMOVE_CONTACT_LOADING', false);
  },
};
