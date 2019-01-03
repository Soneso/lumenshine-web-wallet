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
  FEDERATION_DOMAIN: 'lsstage.ponytest.de',

  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9001' : 'https://lsstageapi.ponytest.de',

  HORIZON_URL: 'https://lsstagehorizon.ponytest.de',
  IS_TEST_NETWORK: false,

  MAINTENANCE_MODE: false,

  STELLAR_BASE_FEE: '0.00001',
  STELLAR_BASE_RESERVE: '0.5',

  SERVER_PUBLIC_KEY: 'GBGXAY3HDXMUWAUDATBZ5SVGLFUC5GKJC4BNN5MEPVLWKCOMBXQUIUWM',
};
