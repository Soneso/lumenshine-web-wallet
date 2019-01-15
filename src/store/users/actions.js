import UserService from '@/services/user';

export default {
  async clearAuthToken ({ commit }) {
    commit('SET_AUTH_TOKEN', { token: null, type: null });
  },

  async refreshAuthToken ({ commit, getters, state }) {
    if (!getters.authToken) return;
    try {
      const res = await UserService.refreshToken(getters.authTokenType);
      commit('REFRESH_AUTH_TOKEN', { token: res.token, type: state.authTokenType });
    } catch (err) {
      console.log('RefreshAuthToken error', err);
    }
  },

  async registerUser ({ commit }, params) {
    commit('SET_REGISTRATION_LOADING', true);
    commit('SET_REGISTRATION_ERROR', []);
    try {
      const res = await UserService.registerUser(params);
      commit('SET_TFA_DATA', { tfa_qr_image: res.data.tfa_qr_image, tfa_secret: res.data.tfa_secret });
      commit('SET_USER_STATUS', {
        mail_confirmed: false,
        mnemonic_confirmed: false,
        tfa_confirmed: false
      });
      commit('SET_USER_EMAIL', params.email);
      commit('SET_AUTH_TOKEN', { token: res.headers.authorization, type: 'partial' });
    } catch (err) {
      commit('SET_REGISTRATION_ERROR', err.data);
      commit('SET_TFA_DATA', null);
      commit('SET_USER_STATUS', null);
      commit('SET_AUTH_TOKEN', { token: null, type: null });
    }
    commit('SET_REGISTRATION_LOADING', false);
  },

  async confirmTwoFactorAuthToken ({ commit, getters, dispatch }, params) {
    commit('SET_REGISTRATION_LOADING', true);
    commit('SET_REGISTRATION_2FA_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.confirmTfa(params, getters.authTokenType === 'partial');
      commit('SET_USER_STATUS', res.data);
      if (res.headers.authorization) {
        commit('SET_AUTH_TOKEN', { token: res.headers.authorization, type: 'full' });
      }
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_REGISTRATION_2FA_ERROR', err.data);
      }
    }
    commit('SET_REGISTRATION_LOADING', false);
  },

  async initLostPassword ({ commit, dispatch, getters }, email) {
    commit('SET_LOST_PASSWORD_LOADING', true);
    commit('SET_LOST_PASSWORD_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      await UserService.lostPassword(email);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_LOST_PASSWORD_ERROR', err.data);
      }
    }
    commit('SET_LOST_PASSWORD_LOADING', false);
  },

  async setLostPasswordTfa ({ commit, dispatch, getters }, tfaCode) {
    commit('SET_LOST_PASSWORD_LOADING', true);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.lostPasswordTfa(tfaCode);
      commit('SET_LOST_PASSWORD_RESULT', res.data);
      if (res.headers.authorization) {
        commit('SET_AUTH_TOKEN', { token: res.headers.authorization, type: 'partial' });
      }
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_LOST_PASSWORD_ERROR', err.data);
      }
    }
    commit('SET_LOST_PASSWORD_LOADING', false);
  },

  async lostPasswordUpdate ({ commit, dispatch, getters }, params) {
    commit('SET_LOST_PASSWORD_LOADING', true);
    commit('SET_LOST_PASSWORD_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      await UserService.lostPasswordUpdate(params);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_LOST_PASSWORD_ERROR', err.data);
      }
    }
    commit('SET_LOST_PASSWORD_LOADING', false);
  },

  async initLostTfa ({ commit, dispatch, getters }, email) {
    commit('SET_LOST_TFA_LOADING', true);
    commit('SET_LOST_TFA_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      await UserService.lostTfa(email);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_LOST_TFA_ERROR', err.data);
      }
    }
    commit('SET_LOST_TFA_LOADING', false);
  },

  async resetTfa ({ commit, getters, dispatch }, signedTransaction) {
    commit('SET_RESET_TFA_LOADING', true);
    commit('SET_RESET_TFA_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.getNewTfaSecret(signedTransaction, getters.authTokenType === 'partial');
      commit('SET_TFA_DATA', res.data);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_RESET_TFA_ERROR', err.data);
      }
    }
    commit('SET_RESET_TFA_LOADING', false);
  },

  async confirmNewTfa ({ commit, dispatch, getters }, tfaCode) {
    commit('SET_RESET_TFA_LOADING', true);
    commit('SET_RESET_TFA_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.confirmNewTfaSecret(tfaCode);
      commit('SET_TFA_DATA', res.data);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_RESET_TFA_ERROR', err.data);
      }
    }
    commit('SET_RESET_TFA_LOADING', false);
  },

  async confirmEmail ({ commit }, token) {
    commit('SET_CONFIRM_EMAIL_LOADING', true);
    commit('SET_CONFIRM_EMAIL_ERROR', []);
    try {
      const res = await UserService.confirmEmail(token);
      commit('SET_CONFIRM_EMAIL_RESULT', {
        email: res.data.email,
        token_already_confirmed: res.data.token_already_confirmed,
      });
      if (res.headers.authorization) {
        commit('SET_AUTH_TOKEN', { token: res.headers.authorization, type: 'partial' });
      } else {
        commit('SET_AUTH_TOKEN', { token: null, type: null });
      }
    } catch (err) {
      commit('SET_CONFIRM_EMAIL_ERROR', err.data);
    }
    commit('SET_CONFIRM_EMAIL_LOADING', false);
  },

  async resendConfirmationEmail ({ commit }, email) {
    commit('SET_RESEND_EMAIL_LOADING', true);
    commit('SET_RESEND_EMAIL_ERROR', []);
    try {
      await UserService.resendConfirmationEmail(email);
    } catch (err) {
      commit('SET_RESEND_EMAIL_ERROR', err.data);
    }
    commit('SET_RESEND_EMAIL_LOADING', false);
  },

  async updateSecurityData ({ commit }, params) {
    commit('SET_LOST_PASSWORD_LOADING', true);
    commit('SET_LOST_PASSWORD_ERROR', []);
    try {
      await UserService.updateSecurityData(params);
    } catch (err) {
      commit('SET_LOST_PASSWORD_ERROR', err.data);
    }
    commit('SET_LOST_PASSWORD_LOADING', false);
  },

  async confirmMnemonic ({ commit }, token) {
    commit('SET_CONFIRM_MNEMONIC_LOADING', true);
    commit('SET_CONFIRM_MNEMONIC_ERROR', []);
    try {
      const res = await UserService.confirmMnemonic(token);
      commit('SET_USER_STATUS', {
        mail_confirmed: res.data.mail_confirmed,
        mnemonic_confirmed: res.data.mnemonic_confirmed,
        tfa_confirmed: res.data.tfa_confirmed
      });
      commit('SET_MNEMONIC', null);
    } catch (err) {
      commit('SET_CONFIRM_MNEMONIC_ERROR', err.data);
    }
    commit('SET_CONFIRM_MNEMONIC_LOADING', false);
  },

  async loginStep1 ({ commit, dispatch, getters }, params) {
    commit('SET_LOGIN_LOADING', true);
    commit('SET_LOGIN_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.loginStep1(params);
      commit('SET_ENCRYPTED_SERVER_DATA', res.data);
      commit('SET_USER_EMAIL', params.email);
      commit('SET_SEP10_CHALLENGE', res.data.sep10_transaction_challenge);
      commit('SET_AUTH_TOKEN', { token: res.headers.authorization, type: 'partial' });
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_LOGIN_ERROR', err.data);
      }
    }
    commit('SET_LOGIN_LOADING', false);
  },

  async loginStep2 ({ commit, dispatch, getters }, params) {
    commit('SET_LOGIN_LOADING', true);
    commit('SET_LOGIN_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.loginStep2(params);

      if (res.data.tfa_qr_image) {
        commit('SET_TFA_DATA', { tfa_qr_image: res.data.tfa_qr_image, tfa_secret: res.data.tfa_secret });
      }

      commit('SET_USER_STATUS', {
        mail_confirmed: res.data.mail_confirmed,
        mnemonic_confirmed: res.data.mnemonic_confirmed,
        tfa_confirmed: res.data.tfa_confirmed
      });

      commit('SET_AUTH_TOKEN', { token: res.headers.authorization, type: res.data.tfa_confirmed ? 'full' : 'partial' });
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_LOGIN_ERROR', err.data);
      }
    }
    commit('SET_LOGIN_LOADING', false);
  },

  logout ({ dispatch, commit }) {
    commit('SET_LOGIN_LOADING', false);
    commit('SET_AUTH_TOKEN', { token: null, type: null });
    commit('SET_USER_EMAIL', null);
    dispatch('resetStore');
  },

  setMnemonic ({ commit }, mnemonic) {
    commit('SET_MNEMONIC', mnemonic);
  },

  setEmail ({ commit }, email) {
    commit('SET_USER_EMAIL', email);
  },

  async getUserStatus ({ commit, getters }) {
    commit('SET_USER_STATUS_LOADING', true);
    try {
      const res = await UserService.getUserStatus(getters.authTokenType === 'partial');
      commit('SET_USER_STATUS', res);
    } catch (err) {
      commit('SET_USER_STATUS_ERROR', err.data);
    }
    commit('SET_USER_STATUS_LOADING', false);
  },

  async getUserAuthData ({ commit, getters }) {
    commit('SET_USER_AUTH_LOADING', true);
    try {
      const res = await UserService.getAuthData(getters.authTokenType === 'partial');
      commit('SET_USER_AUTH_DATA', res.data);
    } catch (err) {
      commit('SET_USER_AUTH_ERROR', err.data);
    }
    commit('SET_USER_AUTH_LOADING', false);
  },

  async getUserData ({ commit }) {
    commit('SET_USER_DATA_LOADING', true);
    try {
      const res = await UserService.getUserData();
      commit('SET_USER_DATA', res.data);
    } catch (err) {
      commit('SET_USER_DATA_ERROR', err.data);
    }
    commit('SET_USER_DATA_LOADING', false);
  },

  async updateUserData ({ commit }, params) {
    commit('SET_UPDATE_USER_DATA_LOADING', true);
    commit('SET_UPDATE_USER_DATA_ERROR', []);
    try {
      await UserService.updateUserData(params);
    } catch (err) {
      commit('SET_UPDATE_USER_DATA_ERROR', err.data);
    }
    commit('SET_UPDATE_USER_DATA_LOADING', false);
  },

  async changePassword ({ commit, dispatch, getters }, params) {
    commit('SET_CHANGE_PASSWORD_LOADING', true);
    commit('SET_CHANGE_PASSWORD_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      await UserService.changePassword(params);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_CHANGE_PASSWORD_ERROR', err.data);
      }
    }
    commit('SET_CHANGE_PASSWORD_LOADING', false);
  },

  async checkResetPasswordNeeded ({ commit, dispatch, getters }) {
    commit('SET_CHECK_PASSWORD_LOADING', true);
    commit('SET_CHECK_PASSWORD_ERROR', []);
    if (getters.lockoutTime) dispatch('unlockUser');
    try {
      const res = await UserService.isResetPasswordNeeded();
      commit('SET_CHECK_PASSWORD_NEEDED', res.data);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        commit('SET_CHECK_PASSWORD_ERROR', err.data);
      }
    }
    commit('SET_CHECK_PASSWORD_LOADING', false);
  },

  async updateSep10 ({ commit, getters, dispatch }) {
    try {
      const res = await UserService.getSEP10Challenge(getters.authTokenType === 'partial');
      if (!res.data || !res.data.sep10_transaction) throw Error('Invalid response');
      commit('SET_SEP10_CHALLENGE', res.data.sep10_transaction);
    } catch (err) {
      if (err.data && err.data.lockout_minutes !== undefined) {
        dispatch('lockUser', err.data.lockout_minutes);
      } else {
        console.error('Error updating SEP10 challenge', err);
      }
    }
  },

  lockUser ({ commit }, m) {
    const minutes = parseInt(m, 10);
    const timer = setTimeout(() => {
      commit('CLEAR_LOCKOUT_TIME');
    }, minutes * 60 * 1000);
    commit('SET_LOCKOUT_TIME', { minutes, timer });
  },

  unlockUser ({ commit }) {
    commit('CLEAR_LOCKOUT_TIME');
  }
};
