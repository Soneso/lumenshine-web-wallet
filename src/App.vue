<template>
  <div id="app" :class="[authClass]">
    <inactivity-modal v-if="authToken && showInactivityModal" @continue="() => { catchInteraction(), showInactivityModal = false }" @logout="showInactivityModal = false"/>

    <div :class="['offcanvas-overlay', {'open': offCanvasMenuOpen}]"/>
    <off-canvas-menu v-if="registrationComplete && authTokenType !== 'partial'">
      <dashboard-menu/>
    </off-canvas-menu>

    <b-container v-if="userStatus.res || userStatus.err" id="page-wrapper" fluid>
      <b-row>
        <b-col id="main-column" style="min-height: 100vh">
          <page-header :single-card-page="isSingleCard"/>
          <router-view/>
          <page-footer :is-logged-in="!(!userStatus.res || authTokenType === 'partial')"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import redirectHandler from '@/util/redirectHandler';

import pageHeader from '@/components/PageHeader';
import pageFooter from '@/components/PageFooter';

import dashboardMenu from '@/components/offcanvas/DashboardMenu';
import offCanvasMenu from '@/components/offcanvas/OffCanvasMenu';

import inactivityModal from '@/components/InactivityModal';

import WebSocketService from '@/services/websocket';

import config from '@/config';
import { setTimeout } from 'timers';

export default {
  name: 'App',

  components: {
    pageHeader,
    pageFooter,
    dashboardMenu,
    offCanvasMenu,
    inactivityModal,
  },

  data () {
    return {
      debounceWindowResizeId: null,
      appReady: false,
      stickyFooter: false,
      showInactivityModal: false,
    };
  },

  computed: {
    ...mapGetters([
      'userStatus',
      'authTokenType',
      'authToken',
      'registrationComplete',
      'offCanvasMenuOpen',
    ]),

    isSingleCard () {
      const nakedRoute = this.$route.path.split('/')[1];
      const routes = ['',
        'contacts',
        'settings',
        'change-password',
        'change-tfa',
        'backup-mnemonic',
        'lost-password',
        'lost-tfa',
        'lost-password-and-tfa',
        'personal-data',
        'terms',
        'privacy',
        'guidelines'
      ];
      return routes.includes(nakedRoute);
    },

    authClass () {
      return this.registrationComplete && this.authTokenType !== 'partial' ? 'authenticated' : 'anonymous';
    },
  },

  watch: {
    $route (to, from) {
      if (!this.authToken && to && to.meta && to.meta.authNeeded === true) {
        return this.$router.push({ name: 'Login' });
      }
      setTimeout(this.interactionHandler, 0);

      const fromRoute = this.baseRoute(from);
      const toRoute = this.baseRoute(to);
      document.body.classList.replace(fromRoute, toRoute === '' ? 'home' : toRoute);
    },
    authToken (token) {
      if (token) {
        this.refreshAuthTokenHandler();
      } else if (this.jwtRefreshTimer) {
        clearTimeout(this.jwtRefreshTimer);
        this.jwtRefreshTimer = null;
      }
    },
  },

  async created () {
    if (this.authTokenType) {
      await this.getUserStatus();
      if (this.userStatus.err !== undefined && this.userStatus.err.length > 0) { // clear invalid token
        this.clearAuthToken();
        return;
      }
    }

    if (this.$route.meta.authNeeded) {
      const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
      if (redirectRes) {
        this.$router.push(redirectRes);
      }
    }
  },

  mounted () {
    window.addEventListener('beforeunload', this.unloadHandler);
    window.addEventListener('resize', this.onResize);

    this.$store.subscribe(mutation => {
      if (mutation.type === 'SET_INTERACTION') return; // avoid infinite loop
      if (mutation.type === 'REFRESH_AUTH_TOKEN') return; // no interaction at JWT refresh
      if (mutation.type === 'REFRESH_CURRENCY_RATE_HISTORY') return; // no interaction at chart refresh
      if (mutation.type === 'SET_WEBSOCKET' || mutation.type === 'TRY_DESTROYING_WEBSOCKET') return; // no interaction at websocket handling
      setTimeout(this.catchInteraction, 0);
    });

    this.refreshAuthTokenHandler();

    const initialRoute = this.baseRoute(this.$route);
    document.body.classList.add(initialRoute === '' ? 'home' : initialRoute, `${this.authClass}-page`);

    if (process.env.NODE_ENV !== 'development') {
      this.inactivityTimer = setInterval(() => {
        if (!this.authToken || !this.registrationComplete || this.showInactivityModal) return;
        const lastInteraction = this.$store.state.lastInteraction;
        if (lastInteraction === null) return;
        const now = new Date().getTime();
        const diffSeconds = (now - lastInteraction) / 1000;
        if (diffSeconds >= 10 * 60) {
          this.showInactivityModal = true;
        }
      }, 2000);
    }
  },

  beforeDestroy () {
    if (this.inactivityTimer !== null) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.jwtRefreshTimer) {
      clearTimeout(this.jwtRefreshTimer);
      this.jwtRefreshTimer = null;
    }
  },

  methods: {
    ...mapActions([
      'getUserStatus',
      'logout',
      'clearAuthToken',
      'refreshAuthToken',
      'catchInteraction',
      'clearInteraction'
    ]),

    ...mapMutations([
      'SET_VIEWPORT_WIDTH',
      'SET_VIEWPORT_HEIGHT'
    ]),

    baseRoute (str) {
      return str.path.split('/')[1];
    },

    onResize () {
      clearTimeout(this.debounceWindowResizeId);

      this.debounceWindowResizeId = setTimeout(() => {
        const newScreenWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
        this.SET_VIEWPORT_WIDTH(newScreenWidth);

        const newScreenHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        this.SET_VIEWPORT_HEIGHT(newScreenHeight);
      }, 300);
    },

    unloadHandler () {
      // remove websocket on page unload
      if (this.authToken) {
        try {
          const client = new XMLHttpRequest();
          client.open('POST', `${config.API_BASE}/portal/sse/remove_ws`, false); // third parameter indicates sync xhr
          client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
          client.setRequestHeader('Authorization', this.authToken);
          const data = { key: WebSocketService.getKey() };
          client.send(JSON.stringify(data));
        } catch (err) {}
      }
    },

    refreshAuthTokenHandler () {
      if (this.authToken) {
        if (this.jwtRefreshTimer) {
          clearTimeout(this.jwtRefreshTimer);
          this.jwtRefreshTimer = null;
        }
        this.jwtRefreshTimer = setTimeout(() => {
          this.refreshAuthToken();
          this.jwtRefreshTimer = null;
          this.refreshAuthTokenHandler(); // prepare next refresh
        }, 5 * 60 * 1000); // refresh JWT token in every 5 minutes
      }
    },
  }
};
</script>
