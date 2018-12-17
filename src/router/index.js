import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store/store';

import config from '@/config';

import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: require('@/pages/Home').default
    },
    {
      path: '/kitchen-sink',
      name: 'KitchenSink',
      component: require('@/pages/KitchenSink').default
    },
    ...authRoutes,
    ...dashboardRoutes,
    {
      path: '*',
      component: require('@/pages/NotFound').default,
    },
    {
      path: '/terms',
      name: 'TermsOfService',
      component: require('@/pages/TermsOfService').default
    },
    {
      path: '/privacy',
      name: 'PrivacyPolicy',
      component: require('@/pages/PrivacyPolicy').default
    },
    {
      path: '/guidelines',
      name: 'WalletGuidelines',
      component: require('@/pages/WalletGuidelines').default
    },
    {
      path: '/about',
      name: 'About',
      component: require('@/pages/About').default
    },
    {
      path: '/impressum',
      name: 'Impressum',
      component: require('@/pages/Impressum').default
    },
    {
      path: '/help',
      name: 'Help',
      component: require('@/pages/Help').default
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: require('@/pages/Maintenance').default
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (config.MAINTENANCE_MODE && to.path !== '/maintenance') {
    return next({
      path: '/maintenance',
    });
  }
  if (to.matched.some(record => record.meta.authNeeded)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.getters.authToken) {
      next({
        path: '/login',
        // query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
