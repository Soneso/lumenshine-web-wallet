/* global __NODE_SCRIPT__ */
const nodeScript = __NODE_SCRIPT__;

export default {
  APP_TITLE: 'Lumenshine',
  APP_SUBTITLE: 'A Wallet for the Stellar Network by Soneso',

  REGISTRATION_OPTIONAL_FIELDS: [
    // 'forename',
    // 'lastname',
    // 'companyName',
    // 'salutation',
    // 'title',
    // 'streetAddress',
    // 'streetNumber',
    // 'zipCode',
    // 'city',
    // 'state',
    // 'country',
    // 'nationality',
    // 'mobilePhone',
    // 'birthday',
    // 'birthPlace'
  ],

  SUPPORT_MAIL: 'support@lumenshine.com',
  FEDERATION_DOMAIN: 'alpha.lumenshine.com',

  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9001' : 'https://alphaapi.lumenshine.com',

  HORIZON_URL: 'https://alphahorizon.lumenshine.com',
  IS_TEST_NETWORK: false,
};
