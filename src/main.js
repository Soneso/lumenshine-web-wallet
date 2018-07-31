// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuelidate from 'vuelidate';
import VueClipboard from 'vue-clipboard2';

import store from '@/store/store';
import router from '@/router';
import GeneralService from '@/services/general';
import App from '@/App';

Vue.config.productionTip = false;

Vue.use(Vuelidate);
Vue.use(VueClipboard);

async function logBuildDates () {
  /* global __BUILD_DATE__ */
  const backendVersion = await GeneralService.getServerInfo();
  console.log(`Web client v0.1.0 - Build date: ${__BUILD_DATE__}`);
  console.log(`Backend v${backendVersion.Version} - Build date: ${backendVersion.BuildDate}`);
}

logBuildDates();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  store,
  router,
  template: '<App/>'
});
