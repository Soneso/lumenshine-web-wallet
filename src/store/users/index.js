import Vue from 'vue';

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

import config from '@/config';

function replaceNull (value) {
  return value === 'null' ? null : value;
}

const localStorage = {
  authToken: replaceNull(Vue.localStorage.get('authToken', null)),
  authTokenType: replaceNull(Vue.localStorage.get('authTokenType', null)),

  userEmail: replaceNull(Vue.localStorage.get('userEmail', null)),
};

function getInitialState (clearAuthToken = false) {
  return {
    authToken: config.KEEP_LOGGED_IN && !clearAuthToken ? localStorage.authToken : null,
    authTokenType: config.KEEP_LOGGED_IN && !clearAuthToken ? localStorage.authTokenType : null,

    userEmail: config.KEEP_LOGGED_IN && !clearAuthToken ? localStorage.userEmail : null,

    tfaData: null, // storing 2FA secret + qr code after login / registration
    mnemonic: null,
    encryptedServerData: null, // for storing ecrypted mnemonic / masterkey on login
    sep10Challenge: null,

    registrationErrors: [],
    registrationLoading: false,

    lostPasswordErrors: [],
    lostPasswordResult: null,
    lostPasswordLoading: false,

    lostTfaErrors: [],
    lostTfaLoading: false,

    resetTfaErrors: [],
    resetTfaLoading: false,

    registration2FAErrors: [],

    confirmEmailLoading: false,
    confirmEmailErrors: [],
    confirmEmailResult: null,

    resendEmailLoading: false,
    resendEmailErrors: [],

    confirmMnemonicLoading: false,
    confirmMnemonicErrors: [],

    loginErrors: [],
    loginLoading: false,

    changePasswordLoading: false,
    changePasswordErrors: [],

    checkPasswordLoading: false,
    checkPasswordErrors: [],
    checkPasswordNeeded: undefined,

    userStatusErrors: [],
    userStatusLoading: false,
    userStatusResult: null,

    userAuthData: null,
    userAuthLoading: false,
    userAuthErrors: [],

    userData: null,
    userDataLoading: false,
    userDataErrors: [],

    updateUserDataLoading: false,
    updateUserDataErrors: [],
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
      Vue.localStorage.remove('authToken');
      Vue.localStorage.remove('authTokenType');
      Vue.localStorage.remove('userEmail');
    }
  },
  getters,
  actions
};
