import Vue from 'vue';
import config from '@/config';

export default {
  SET_AUTH_TOKEN (state, token) {
    state.authToken = token.token;
    state.authTokenType = token.type;
    if (config.KEEP_LOGGED_IN) {
      Vue.localStorage.set('authToken', token.token);
      Vue.localStorage.set('authTokenType', token.type);
    }
  },

  SET_REGISTRATION_LOADING (state, msg) {
    state.registrationLoading = msg;
  },
  SET_REGISTRATION_ERROR (state, msg) {
    state.registrationErrors = msg;
  },

  SET_LOST_PASSWORD_LOADING (state, msg) {
    state.lostPasswordLoading = msg;
  },
  SET_LOST_PASSWORD_RESULT (state, msg) {
    state.lostPasswordResult = msg;
    state.lostPasswordErrors = [];
  },
  SET_LOST_PASSWORD_ERROR (state, msg) {
    state.lostPasswordResult = null;
    state.lostPasswordErrors = msg;
  },

  SET_LOST_TFA_LOADING (state, msg) {
    state.lostTfaLoading = msg;
  },
  SET_LOST_TFA_ERROR (state, msg) {
    state.lostTfaErrors = msg;
  },

  SET_RESET_TFA_LOADING (state, msg) {
    state.resetTfaLoading = msg;
  },
  SET_RESET_TFA_ERROR (state, msg) {
    state.resetTfaErrors = msg;
  },

  SET_REGISTRATION_2FA_ERROR (state, msg) {
    state.registration2FAErrors = msg;
  },

  SET_CONFIRM_EMAIL_LOADING (state, msg) {
    state.confirmEmailLoading = msg;
  },
  SET_CONFIRM_EMAIL_RESULT (state, msg) {
    state.confirmEmailResult = msg;
    state.confirmEmailErrors = [];
  },
  SET_CONFIRM_EMAIL_ERROR (state, msg) {
    state.confirmEmailResult = null;
    state.confirmEmailErrors = msg;
  },

  SET_RESEND_EMAIL_LOADING (state, msg) {
    state.resendEmailLoading = msg;
  },
  SET_RESEND_EMAIL_ERROR (state, msg) {
    state.resendEmailErrors = msg;
  },

  SET_CONFIRM_MNEMONIC_LOADING (state, msg) {
    state.confirmMnemonicLoading = msg;
  },
  SET_CONFIRM_MNEMONIC_ERROR (state, msg) {
    state.confirmMnemonicErrors = msg;
  },

  SET_LOGIN_LOADING (state, msg) {
    state.loginLoading = msg;
  },
  SET_LOGIN_ERROR (state, msg) {
    state.loginErrors = msg;
  },

  SET_ENCRYPTED_SERVER_DATA (state, msg) {
    state.encryptedServerData = msg;
  },

  SET_MNEMONIC (state, mnemonic) {
    state.mnemonic = mnemonic;
  },

  SET_TFA_DATA (state, data) {
    state.tfaData = data;
  },

  SET_USER_EMAIL (state, email) {
    state.userEmail = email;
    if (config.KEEP_LOGGED_IN) {
      Vue.localStorage.set('userEmail', email);
    }
  },

  SET_USER_STATUS (state, msg) {
    state.userStatusResult = msg;
    if (msg && msg.mnemonic_confirmed) {
      state.mnemonic = null; // clear mnemonic from memory
    }
    state.userStatusErrors = [];
  },
  SET_USER_STATUS_LOADING (state, msg) {
    state.userStatusLoading = msg;
  },
  SET_USER_STATUS_ERROR (state, msg) {
    state.userStatusErrors = msg;
    state.userStatusResult = null;
  },

  SET_USER_AUTH_DATA (state, msg) {
    state.userAuthData = msg;
    state.userAuthErrors = [];
  },
  SET_USER_AUTH_LOADING (state, msg) {
    state.userAuthLoading = msg;
  },
  SET_USER_AUTH_ERROR (state, msg) {
    state.userAuthErrors = msg;
    state.userAuthData = null;
  },

  SET_CHANGE_PASSWORD_LOADING (state, msg) {
    state.changePasswordLoading = msg;
  },
  SET_CHANGE_PASSWORD_ERROR (state, msg) {
    state.changePasswordErrors = msg;
    state.changePasswordLoading = false;
  },

  SET_CHECK_PASSWORD_LOADING (state, msg) {
    state.checkPasswordLoading = msg;
  },
  SET_CHECK_PASSWORD_ERROR (state, msg) {
    state.checkPasswordErrors = msg;
    state.checkPasswordLoading = false;
  },
  SET_CHECK_PASSWORD_NEEDED (state, msg) {
    state.checkPasswordNeeded = msg.need2fa_reset_pwd;
    state.checkPasswordLoading = false;
  }
};
