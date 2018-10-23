import apiBase from './apiBase';

export default {
  async refreshToken (tokenType) {
    let path = 'auth';
    switch (tokenType) {
      case 'full':
        path = 'dashboard';
        break;
      case 'partial':
        path = 'auth';
        break;
      case 'lostpw':
        path = 'auth2';
        break;
    }
    const response = await apiBase.post(`/portal/user/${path}/refresh`);
    return response.data;
  },

  async getSalutationList () {
    const response = await apiBase.get('/portal/user/salutation_list');
    return response.data.salutations;
  },

  async getCountryList () {
    const response = await apiBase.get('/portal/user/country_list');
    return response.data.countries;
  },

  // async getRegistrationStatus () {
  //   const response = await apiBase.get('/portal/user/auth/get_user_registration_status');
  //   return response.data;
  // },

  async getUserStatus (isPartialAuth = true) {
    const response = await apiBase.get(`/portal/user/${isPartialAuth ? 'auth' : 'dashboard'}/get_user_registration_status`);
    return response.data;
  },

  async registerUser (params) {
    const response = await apiBase.post('/portal/user/register_user', params);
    return response;
  },

  async updateSecurityData (params) {
    const response = await apiBase.post('/portal/user/auth/update_security_data', params);
    return response;
  },

  async confirmTfa (tfaCode, isPartialAuth = true) {
    const response = await apiBase.post(`/portal/user/${isPartialAuth ? 'auth' : 'dashboard'}/confirm_tfa_registration`, { tfa_code: tfaCode });
    return response;
  },

  async confirmEmail (token) {
    const response = await apiBase.post('/portal/user/confirm_token', { token });
    return response;
  },

  async resendConfirmationEmail (email) {
    const response = await apiBase.post('/portal/user/resend_confirmation_mail', { email });
    return response;
  },

  async confirmMnemonic (token) {
    const response = await apiBase.post('/portal/user/dashboard/confirm_mnemonic', { token });
    return response;
  },

  async loginStep1 (params) {
    const response = await apiBase.post('/portal/user/login_step1', params);
    return response;
  },

  async loginStep2 (params) {
    const response = await apiBase.post('/portal/user/auth/login_step2', params);
    return response;
  },

  async getTfaSecret (key188) {
    const response = await apiBase.post('/portal/dashboard/tfa_secret', key188);
    return response;
  },

  async lostPassword (email) {
    const response = await apiBase.post('/portal/user/lost_password', { email });
    return response;
  },

  async lostPasswordTfa (tfaCode) {
    const response = await apiBase.post('/portal/user/auth/lost_password_tfa', { tfa_code: tfaCode });
    return response;
  },

  async lostPasswordUpdate (params) {
    const response = await apiBase.post('/portal/user/auth2/lost_password_update', params);
    return response;
  },

  async getAuthData (isPartialAuth = true) {
    const response = await apiBase.get(`/portal/user/${isPartialAuth ? 'auth' : 'dashboard'}/user_auth_data`);
    return response;
  },

  async changePassword (params) {
    const response = await apiBase.post('/portal/user/dashboard/change_password', params);
    return response;
  },

  async lostTfa (email) {
    const response = await apiBase.post('/portal/user/lost_tfa', { email });
    return response;
  },

  async getNewTfaSecret (key188, isPartialAuth = true) {
    const response = await apiBase.post(`/portal/user/${isPartialAuth ? 'auth' : 'dashboard'}/new_2fa_secret`, { public_key_188: key188 });
    return response;
  },

  async confirmNewTfaSecret (tfaCode) {
    const response = await apiBase.post('/portal/user/dashboard/confirm_new_2fa_secret', { tfa_code: tfaCode });
    return response;
  },

  async isResetPasswordNeeded () {
    const response = await apiBase.get('/portal/user/auth/need_2fa_reset_pwd');
    return response;
  },
};
