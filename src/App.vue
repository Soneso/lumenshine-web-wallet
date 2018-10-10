<template>
  <div id="app">
    <off-canvas-menu v-if="!registrationComplete && authTokenType !== 'partial'">
      <dashboard-menu/>
    </off-canvas-menu>

    <div v-if="userStatus.res || userStatus.err" id="page-wrapper">
      <page-header/>
      <router-view/>
      <page-footer :is-logged-in="!(!userStatus.res || authTokenType === 'partial')"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import redirectHandler from '@/util/redirectHandler';

import pageHeader from '@/components/PageHeader';
import pageFooter from '@/components/PageFooter';

import dashboardMenu from '@/components/offcanvas/DashboardMenu';
import offCanvasMenu from '@/components/offcanvas/OffCanvasMenu';

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
    ...mapGetters(['userStatus', 'authTokenType', 'registrationComplete']),
  },
  watch: {
    $route () {
      this.interactionHandler();
    },
  },
  async created () {
    await this.getUserStatus();
    if (this.userStatus.err.length > 0) { // clear invalid token
      this.clearAuthToken();
      return;
    }

    if (this.$route.meta.authNeeded) {
      const redirectRes = redirectHandler(this.userStatus.res, this.$route.name);
      if (redirectRes) {
        this.$router.push(redirectRes);
      }
    }
  },
  mounted () {
    this.$store.watch(state => state, () => this.interactionHandler(), {
      deep: true,
    });
  },
  beforeDestroy () {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },
  methods: {
    ...mapActions(['getUserStatus', 'logout', 'clearAuthToken', 'refreshAuthToken', 'catchInteraction']),
    async interactionHandler () {
      const recordedTime = this.$store.state.lastInteraction;
      const now = new Date().getTime();
      const diffSeconds = (now - recordedTime) / 1000;
      if (diffSeconds > 60 * 10) {
        await this.refreshAuthToken();
      }
      await this.catchInteraction();
    },
    async onLogoutClick () {
      await this.logout();
      window.location.href = '/login';
    }
  }
};
</script>
