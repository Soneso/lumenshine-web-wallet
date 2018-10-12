<template>
  <header :class="[ 'header', { 'header--full': $route.meta.fullHeader } ]">
    <small v-if="authToken && !registrationComplete" class="user-info">
      <div class="user-info-email">
        {{ userStatus.email }} <br>
        <a v-if="userStatus.email.length > 5" href="#" class="user-info-logout" @click="onLogoutClick">Sign out</a>
      </div>
    </small>

    <b-container fluid class="pl-5 pr-0 ml-4 mr-0">
      <b-row>
        <b-col :class="['', {'wide': registrationComplete, 'narrow': !registrationComplete}]">
          <div id="logo-group">
            <div class="logo">
              <img id="logo" src="../assets/images/ui/logo.svg">
            </div>
            <div class="text pl-3 pt-3 mt-2  d-none d-sm-block">
              <h1>{{ config.APP_TITLE }}</h1>
              <h2>{{ config.APP_SUBTITLE }}</h2>
              <div v-if="registrationComplete" style="height: 100px"> <!-- TODO -->
                <!-- <currency-ticker/> -->
                <!--<p>{{ $route.meta ? $route.meta.pageName : '' }}</p>-->
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
  data: () => ({ config }),
  computed: {
    ...mapGetters([
      'offCanvasMenuOpen',
      'userStatus',
      'authToken',
      'registrationComplete'
    ]),
  },
  methods: {
    ...mapActions(['logout']),
    async onLogoutClick () {
      this.$store.commit('mutateOffCanvasMenuOpen', false);
      this.closeMenuAnimation();
      await this.logout();
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
