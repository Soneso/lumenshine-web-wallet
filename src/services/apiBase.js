import axios from 'axios';
import config from '@/config';
import store from '@/store/store';

export default {
  async get (path = '', params = null) {
    if (!store.getters.authToken && axios.defaults.headers.common['Authorization'] !== null) {
      delete axios.defaults.headers.common['Authorization'];
    } else if (store.getters.authToken) {
      axios.defaults.headers.common['Authorization'] = store.getters.authToken;
    }
    try {
      var response = await axios.get(`${config.API_BASE}${path}`, { params });
    } catch (err) {
      if (store.getters.authToken && err.response.status === 401) { // log out user
        store.dispatch('clearAuthToken');
        const newError = new Error('Logged out');
        throw newError;
      }
      const errorData = err.response.data;
      if (!errorData || err.response.status === 404) {
        const backendError = new Error('Unknown backend error');
        backendError.data = [{ error_code: -1 }];
        throw backendError;
      }
      const newError = new Error(errorData.error_message);
      newError.data = errorData;
      throw newError;
    }
    return response;
  },
  async post (path = '', params = null) {
    if (!store.getters.authToken && axios.defaults.headers.common['Authorization'] !== null) {
      delete axios.defaults.headers.common['Authorization'];
    } else if (store.getters.authToken) {
      axios.defaults.headers.common['Authorization'] = store.getters.authToken;
    }
    try {
      var response = await axios.post(`${config.API_BASE}${path}`, params);
    } catch (err) {
      if (store.getters.authToken && err.response.status === 401) { // log out user
        store.dispatch('clearAuthToken');
        const newError = new Error('Logged out');
        throw newError;
      }
      const errorData = err.response.data;
      if (!errorData || err.response.status === 404) {
        const backendError = new Error('Unknown backend error');
        backendError.data = [{ error_code: -1 }];
        throw backendError;
      }
      const newError = new Error(errorData.error_message);
      newError.data = errorData;
      throw newError;
    }
    return response;
  }
};
