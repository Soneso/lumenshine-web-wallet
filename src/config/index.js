/* global __BUILD_CONFIG__ */

export default {
  APP_VERSION: '0.1.0',

  // do not forget authToken on page reload (for development)
  KEEP_LOGGED_IN: process.env.NODE_ENV === 'development',

  ...((__BUILD_CONFIG__ === 'demo') ? require('./demo').default : {}),
  ...((__BUILD_CONFIG__ === 'alpha') ? require('./alpha').default : {}),
  ...((__BUILD_CONFIG__ === 'lsdev') ? require('./lsdev').default : {}),
  ...((__BUILD_CONFIG__ === 'lsstage') ? require('./lsstage').default : {}),
  ...((__BUILD_CONFIG__ === 'prod') ? require('./prod').default : {}),
};
