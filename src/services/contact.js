import apiBase from './apiBase';

export default {
  async getContacts () {
    const response = await apiBase.get('/portal/user/dashboard/contact_list');
    return response.data;
  },

  async addContact (params) {
    const response = await apiBase.post('/portal/user/dashboard/add_contact', params);
    return response;
  },

  async editContact (params) {
    const response = await apiBase.post('/portal/user/dashboard/edit_contact', params);
    return response;
  },

  async removeContact (params) {
    const response = await apiBase.post('/portal/user/dashboard/remove_contact', params);
    return response;
  },
};
