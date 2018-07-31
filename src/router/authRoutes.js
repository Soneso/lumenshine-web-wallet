export default [
  {
    path: '/register',
    name: 'Registration',
    component: require('@/pages/Registration').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/confirm-email/:token?',
    name: 'ConfirmEmail',
    component: require('@/pages/ConfirmEmail').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/confirm-tfa',
    name: 'ConfirmTfa',
    component: require('@/pages/ConfirmTfa').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/mnemonic-quiz',
    name: 'MnemonicQuiz',
    component: require('@/pages/MnemonicQuiz').default,
    meta: {
      authNeeded: true,
      fullHeader: true,
    }
  },
  {
    path: '/mnemonic',
    name: 'ShowMnemonic',
    component: require('@/pages/ShowMnemonic').default,
    meta: {
      authNeeded: true,
      fullHeader: true,
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: require('@/pages/Login').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/lost-password/',
    name: 'LostPasswordStep1',
    component: require('@/pages/LostPasswordStep1').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/lost-password/:token',
    name: 'LostPasswordStep2',
    component: require('@/pages/LostPasswordStep2').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/lost-tfa/',
    name: 'LostTfaStep1',
    component: require('@/pages/LostTfaStep1').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/lost-tfa/:token',
    name: 'LostTfaStep2',
    component: require('@/pages/LostTfaStep2').default,
    meta: {
      fullHeader: true,
    }
  },
  {
    path: '/lost-password-and-tfa/',
    name: 'LostPasswordAndTfa',
    component: require('@/pages/LostPasswordAndTfa').default,
    meta: {
      fullHeader: true,
    }
  },
  // {
  //   path: '/crypto',
  //   name: 'CryptoTest',
  //   component: require('@/pages/CryptoTest').default,
  //   meta: {
  //     authNeeded: true,
  //     fullHeader: true,
  //   }
  // },
];
