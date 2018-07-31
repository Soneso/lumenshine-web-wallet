<template>
  <div v-if="userStatus.res || userStatus.err" id="app">
    <page-header :class="[{ 'header--open': menuOpen }]"/>
    <div :class="['content', {'content--open': menuOpen}]">
      <dashboard-menu v-if="registrationComplete && authTokenType !== 'partial'" :menu-open="menuOpen" @toggleMenu="toggleMenu"/>
      <router-view/>
    </div>
    <page-footer :is-logged-in="!(!userStatus.res || authTokenType === 'partial')"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import redirectHandler from '@/util/redirectHandler';

import pageHeader from '@/components/PageHeader';
import pageFooter from '@/components/PageFooter';

import dashboardMenu from '@/components/DashboardMenu';

export default {
  name: 'App',
  components: { pageHeader, pageFooter, dashboardMenu },
  data () {
    return {
      menuOpen: false,
      refreshInterval: null,
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
    },
    toggleMenu () {
      this.menuOpen = !this.menuOpen;
    }
  }
};
</script>

<style lang="scss">
@import "assets/scss/main";
</style>

<style lang="scss" scoped>
@import "assets/scss/variables";
.content {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  margin-left: 0;
  transition: margin 0.4s;
  &--open {
    @include breakpoint(tablet) {
      margin-left: $menu-width;
    }
  }
}
.header {
  margin-left: 0;
  transition: margin 0.4s;
  width: 100%;
  &--open {
    @include breakpoint(tablet) {
      margin-left: $menu-width;
    }
  }
}
</style>
