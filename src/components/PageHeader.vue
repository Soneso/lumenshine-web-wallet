<template>
  <header :class="[ 'header', { 'header--full': $route.meta.fullHeader } ]">
    <div id="logo-group">
      <div class="logo">
        <img id="logo" src="../assets/images/ui/logo.svg">
      </div>
      <div class="text">
        <h1>{{ config.APP_TITLE }}</h1>
        <h2>{{ config.APP_SUBTITLE }}</h2>

        <div v-if="registrationComplete">
          <currency-ticker/>
          <p>{{ $route.meta ? $route.meta.pageName : '' }}</p>
        </div>

        <small v-if="authToken && !registrationComplete" class="user-info">
          <div class="user-info-email">
            {{ userStatus.email }}
            <a href="#" class="user-info-logout" @click="onLogoutClick">Sign out</a>
          </div>
        </small>

        <div v-if="$route.name === 'Wallets'" class="header-buttons">
          <a href="#" @click.prevent="$router.push({ name: 'Wallets', params: { add: 'add' } })">
            <i class="fa fa-plus"/>
            <span class="header-button-description">Add Wallet</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';
import CurrencyTicker from '@/components/CurrencyTicker';

export default {
  components: { CurrencyTicker },
  data () {
    return {
      config
    };
  },
  computed: {
    ...mapGetters(['userStatus', 'authToken', 'registrationComplete']),
  },
  methods: {
    ...mapActions(['logout']),
    async onLogoutClick () {
      await this.logout();
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
