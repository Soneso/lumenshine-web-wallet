/* global __NODE_SCRIPT__ */
const nodeScript = __NODE_SCRIPT__;

export default {
  APP_TITLE: 'Lumenshine',
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
  FEDERATION_DOMAIN: 'lsdev.ponytest.de',

  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9001' : 'https://lsdevapi.ponytest.de',
  // API_BASE: 'http://192.168.1.56:9001',
  // API_BASE: 'http://localhost:9001',

  HORIZON_URL: 'https://lsdevhorizon.ponytest.de',
  // HORIZON_URL: 'https://horizon-testnet.stellar.org',
  IS_TEST_NETWORK: true,

  MAINTENANCE_MODE: false,

  STELLAR_BASE_FEE: '0.00001',
  STELLAR_BASE_RESERVE: '0.5',

  SERVER_PUBLIC_KEY: 'GCP4BR7GWG664577XMLX2BRUPSHKHTAXQ4I4HZORLMQNILNNVMSFWVUV',
};
