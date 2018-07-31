export default [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: require('@/pages/Dashboard').default,
    meta: {
      authNeeded: true,
      pageName: 'Dashboard',
      fullHeader: true,
    }
  },
  {
    path: '/wallets/:add?',
    name: 'Wallets',
    component: require('@/pages/Wallets').default,
    meta: {
      authNeeded: true,
      pageName: 'Wallets',
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: require('@/pages/Settings').default,
    meta: {
      authNeeded: true,
      pageName: 'Settings',
    }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: require('@/pages/ChangePassword').default,
    meta: {
      authNeeded: true,
      pageName: 'Change password',
    }
  },
  {
    path: '/change-tfa',
    name: 'ChangeTfa',
    component: require('@/pages/ChangeTfa').default,
    meta: {
      authNeeded: true,
      pageName: 'Change 2FA',
    }
  },
  {
    path: '/backup-mnemonic',
    name: 'BackupMnemonic',
    component: require('@/pages/BackupMnemonic').default,
    meta: {
      authNeeded: true,
      pageName: 'Backup Mnemonic',
    }
  },
];
