<template>
  <header :class="[ 'header', { 'header--full': $route.meta.fullHeader } ]">
    <small v-if="authToken && !registrationComplete" class="user-info">
      <div v-if="userStatus.email" class="user-info-email">
        {{ userStatus.email }} <br>
        <a href="#" class="user-info-logout" @click.prevent="onLogoutClick">Sign out</a>
      </div>
    </small>

    <b-container fluid class="px-4">
      <b-row>
        <b-col :class="[{'wide': registrationComplete, 'narrow': !registrationComplete || singleCardPage}]">
          <div id="logo-group">
            <div class="logo">
              <router-link to="/">
                <img id="logo" src="../assets/images/ui/logo.svg">
              </router-link>
            </div>
            <div class="text">
              <h1 class="title">{{ config.APP_TITLE }}</h1>
              <h2 class="subtitle">{{ config.APP_SUBTITLE }}</h2>
              <div v-if="registrationComplete">
                <currency-ticker v-if="currentRoute === 'dashboard' || currentRoute === 'wallets'"/>
              </div>
            </div>
            <div v-if="$route.name === 'Wallets'" class="add-wallet">
              <a href="#" @click.prevent="$router.push({ name: 'Wallets', params: { add: 'add' } })">
                <i>+</i>
                <span class="header-button-description">Add Wallet</span>
              </a>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';
import CurrencyTicker from '@/components/CurrencyTicker';
import offcanvasNavigation from '../mixins/offcanvasNavigation.js';

export default {
  name: 'PageHeader',
  components: { CurrencyTicker },
  mixins: [offcanvasNavigation],
  props: {
    singleCardPage: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      currentRoute: '',
    };
  },
  computed: {
    ...mapGetters([
      'offCanvasMenuOpen',
      'userStatus',
      'authToken',
      'registrationComplete'
    ])
  },
  created () {
    this.config = config;
  },
  mounted () {
    this.currentRoute = this.$route.path.split('/')[1];
  },
  methods: {
    ...mapActions(['logout']),
    async onLogoutClick () {
      this.$store.commit('SET_OFFCANVAS_MENU_OPEN', false);
      this.closeMenuAnimation();
      await this.logout();
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
