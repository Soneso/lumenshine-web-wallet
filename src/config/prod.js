/* global __NODE_SCRIPT__ */
const nodeScript = __NODE_SCRIPT__;

export default {
  APP_TITLE: 'Lumenshine (Beta)',
  APP_SUBTITLE: 'A Wallet for the Stellar Network by Soneso',

  REGISTRATION_OPTIONAL_FIELDS: [
    'forename',
    'lastname',
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
  FEDERATION_DOMAIN: 'lumenshine.com',

  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9001' : 'https://api.lumenshine.com',

  HORIZON_URL: 'https://horizon.lumenshine.com',
  IS_TEST_NETWORK: false,

  MAINTENANCE_MODE: false,

  SERVER_PUBLIC_KEY: 'GDNHKZED65H2RY2LAA5TK7W5PWM5TPWIJ3H3QZQEJPPELUWYSC4SUHAF',
};
