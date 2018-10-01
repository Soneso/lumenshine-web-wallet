/* global __BUILD_CONFIG__ */

export default {
  APP_VERSION: '0.1.0',

  // do not forget authToken on page reload (for development)
  KEEP_LOGGED_IN: process.env.NODE_ENV === 'development',

  ...((__BUILD_CONFIG__ === 'demo') ? require('./demo').default : require('./alpha').default)
};
