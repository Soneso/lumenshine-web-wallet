// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuelidate from 'vuelidate';
import VueClipboard from 'vue-clipboard2';
import VueAwesomeSwiper from 'vue-awesome-swiper';

// require styles
import './assets/scss/main.scss';

import store from '@/store/store';
import router from '@/router';
import GeneralService from '@/services/general';
import App from '@/App';
import config from './config';

import BootstrapVue from 'bootstrap-vue';
import i18n from './plugins/i18n/i18n';
import Meta from 'vue-meta';

Vue.config.productionTip = false;

Vue.use(Vuelidate);
Vue.use(VueClipboard);

Vue.use(VueAwesomeSwiper);
Vue.use(BootstrapVue);
Vue.use(Meta);

async function logBuildDates () {
  /* global __BUILD_DATE__ */
  const backendVersion = await GeneralService.getServerInfo();
  console.log(`Web client v${config.APP_VERSION} - Build date: ${__BUILD_DATE__}`);
  console.log(`Backend v${backendVersion.Version} - Build date: ${backendVersion.BuildDate}`);
}

logBuildDates();

// extend a Vue instance with important classes like i18n, router and store
// eslint-disable no-new
const root = new Vue(Vue.util.extend({router, store, i18n}, App));
// mount the app in the appropriate target element when the DOM content has loaded
root.$mount('#app');
