<template>
  <div id="app" :class="[authClass]">
    <div :class="['offcanvas-overlay', {'open': offCanvasMenuOpen}]"/>
    <off-canvas-menu v-if="registrationComplete && authTokenType !== 'partial'">
      <dashboard-menu/>
    </off-canvas-menu>

    <b-container v-if="userStatus.res || userStatus.err" id="page-wrapper" ref="pageWrapper" fluid>
      <b-row>
        <b-col>
          <div ref="header">
            <page-header :single-card-page="isSingleCard"/>
          </div>
          <div ref="content">
            <router-view/>
          </div>
          <page-footer :is-logged-in="!(!userStatus.res || authTokenType === 'partial')" :sticky-classes="stickyClasses" ref="footerWrapper"/>
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

import WebSocketService from '@/services/websocket';

import config from '@/config';

export default {
  name: 'App',

  components: {
    pageHeader,
    pageFooter,
    dashboardMenu,
    offCanvasMenu
  },

  data () {
    return {
      refreshInterval: null,
      debounceWindowResizeId: null,
      appReady: false,
      stickyFooter: false
    };
  },

  computed: {
    ...mapGetters([
      'userStatus',
      'authTokenType',
      'authToken',
      'registrationComplete',
      'offCanvasMenuOpen',
      'viewportWidth',
      'viewportHeight',
      'walletsLoading',
      'addWalletLoading',
      'transactions',
      'transactionsLoaded'
    ]),

    stickyClasses () {
      let sc = [];
      if (this.stickyFooter) {
        sc.push('sticky');
      }
      if (this.isMobile) {
        sc.push('mobile');
      }
      if (this.offCanvasMenuOpen) {
        sc.push('off-canvas-menu-open');
      }
      return sc;
    },

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

    pageDimensionsAndCurrentPage () {
      this.viewportWidth;
      this.viewportHeight;
      this.transactions;
      this.walletsLoading;
      this.transactionsLoaded;
      return Date.now();
    }
  },

  watch: {
    $route (to, from) {
      this.interactionHandler();

      const fromRoute = this.baseRoute(from);
      const toRoute = this.baseRoute(to);
      document.body.classList.replace(fromRoute, toRoute === '' ? 'home' : toRoute);
    },
    pageDimensionsAndCurrentPage () {
      this.setFooterPosition();
    }
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

    this.setFooterPosition();

    this.$store.watch(state => state, () => this.interactionHandler(), { deep: true });

    const initialRoute = this.baseRoute(this.$route);
    document.body.classList.add(initialRoute === '' ? 'home' : initialRoute, `${this.authClass}-page`);
  },

  beforeDestroy () {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
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
      'mutateViewportWidth',
      'mutateViewportHeight'
    ]),

    baseRoute (str) {
      return str.path.split('/')[1];
    },

    onResize () {
      clearTimeout(this.debounceWindowResizeId);

      this.debounceWindowResizeId = setTimeout(() => {
        const newScreenWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
        this.mutateViewportWidth(newScreenWidth);

        const newScreenHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        this.mutateViewportHeight(newScreenHeight);
      }, 300);
    },

    setFooterPosition () {
      const baseRoute = this.baseRoute(this.$route);
      const setFooterClass = () => {
        const headerRect = this.$refs.header.getBoundingClientRect();
        const contentRect = this.$refs.content.getBoundingClientRect();
        const footerRect = this.$refs.footerWrapper.$refs.footer.getBoundingClientRect();
        this.stickyFooter = (headerRect.height + contentRect.height + footerRect.height) < this.viewportHeight;
      };

      if (baseRoute === 'wallets' || baseRoute === 'dashboard') {
        let loading;
        for (let w in this.walletsLoading) {
          loading = this.walletsLoading[w];
        }
        if (!loading) {
          setFooterClass();
        }
      }

      if (baseRoute === 'transactions' && !this.transactions.loading) {
        setFooterClass();
      }
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

    async interactionHandler () {
      const lastInteraction = this.$store.state.lastInteraction;
      if (lastInteraction === null) {
        await this.catchInteraction();
        return;
      }
      const now = new Date().getTime();
      const diffSeconds = (now - lastInteraction) / 1000;
      if (diffSeconds > 5 * 60) {
        this.clearInteraction();
        await this.refreshAuthToken();
      }
    }
  }
};
</script>
