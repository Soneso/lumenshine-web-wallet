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

// individual bootstrap components and directives
import {
  Alert,
  Badge,
  // Breadcrumb,
  Button,
  ButtonToolbar,
  ButtonGroup,
  Card,
  // Carousel,
  Collapse,
  Dropdown,
  // Embed,
  Form,
  FormGroup,
  FormInput,
  FormTextarea,
  FormFile,
  FormCheckbox,
  FormRadio,
  FormSelect,
  Image,
  InputGroup,
  // Jumbotron,
  Layout,
  Link,
  ListGroup,
  // Media,
  Modal,
  // Nav,
  // Navbar,
  // Pagination,
  // PaginationNav,
  Popover as PopoverComponent,
  Progress,
  Table,
  // Tabs,
  // Tooltip
} from 'bootstrap-vue/es/components';

import {
//   ToggleDirective,
//   ModalDirective,
//   ScrollspyDirective,
  Tooltip,
  Popover
} from 'bootstrap-vue/es/directives';

// bundled version is also available
// import BootstrapVue from 'bootstrap-vue';

import i18n from './plugins/i18n/i18n';
import Meta from 'vue-meta';
import vSelect from 'vue-select';

Vue.config.productionTip = false;

Vue.use(Vuelidate);
VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);
Vue.component('v-select', vSelect);

Vue.use(VueAwesomeSwiper);

// Bootstrap bundle
// Vue.use(BootstrapVue);

// Bootstrap components + directives
Vue.use(Alert);
Vue.use(Badge);
// Vue.use(Breadcrumb);
Vue.use(Button);
Vue.use(ButtonToolbar);
Vue.use(ButtonGroup);
Vue.use(Card);
// Vue.use(Carousel);
Vue.use(Collapse);
Vue.use(Dropdown);
// Vue.use(Embed);
Vue.use(Form);
Vue.use(FormGroup);
Vue.use(FormInput);
Vue.use(FormTextarea);
Vue.use(FormFile);
Vue.use(FormCheckbox);
Vue.use(FormRadio);
Vue.use(FormSelect);
Vue.use(Image);
Vue.use(InputGroup);
// Vue.use(Jumbotron);
Vue.use(Layout);
Vue.use(Link);
Vue.use(ListGroup);
// Vue.use(Media);
Vue.use(Modal);
// Vue.use(Nav);
// Vue.use(Navbar);
// Vue.use(Pagination);
// Vue.use(PaginationNav);
Vue.use(Popover);
Vue.use(Progress);
Vue.use(Table);
// Vue.use(Tabs);
Vue.use(Tooltip);

// Vue.use(Toggle);
// Vue.use(Modal);
// Vue.use(Scrollspy);
// Vue.use(Tooltip);
Vue.use(PopoverComponent);

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
const root = new Vue(Vue.util.extend({ router, store, i18n }, App));
// mount the app in the appropriate target element when the DOM content has loaded
root.$mount('#app');
