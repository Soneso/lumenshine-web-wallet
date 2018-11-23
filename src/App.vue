<template>
  <div id="app" :class="[authClass]">
    <div :class="['offcanvas-overlay', {'open': offCanvasMenuOpen}]"/>
    <off-canvas-menu v-if="registrationComplete && authTokenType !== 'partial'">
      <dashboard-menu/>
    </off-canvas-menu>

    <b-container v-if="userStatus.res || userStatus.err" id="page-wrapper" fluid>
      <b-row>
        <b-col>
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
      refreshInterval: null
    };
  },

  computed: {
    ...mapGetters([
      'userStatus',
      'authTokenType',
      'authToken',
      'registrationComplete',
      'viewportWidth',
      'offCanvasMenuOpen'
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
    }
  },

  watch: {
    $route (to, from) {
      this.interactionHandler();

      const fromRoute = from.path.substr(1, from.path.length);
      const toRoute = to.path.substr(1, to.path.length);
      document.body.classList.replace(fromRoute, toRoute === '' ? 'home' : toRoute);
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

    this.$store.watch(state => state, () => this.interactionHandler(), {
      deep: true,
    });

    window.addEventListener('resize', () => {
      const newScreenWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
      this.mutateViewportWidth(newScreenWidth);
    }, true);

    const initialRoute = this.$route.path.substr(1, this.$route.path.length).split('/')[0];
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
    ]),

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
