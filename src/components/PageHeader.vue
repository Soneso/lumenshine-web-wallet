<template>
  <header :class="[ 'header', { 'header--full': $route.meta.fullHeader } ]">
    <h2>{{ config.APP_TITLE }}</h2>
    <h3>{{ config.APP_SUBTITLE }}</h3>
    <div v-if="registrationComplete">
      <currency-ticker/>
      <p>{{ $route.meta ? $route.meta.pageName : '' }}</p>
    </div>
    <div v-if="authToken && !registrationComplete" class="user-info">
      <div class="user-info__email">{{ userStatus.email }}</div>
      <a href="#" class="user-info__logout" @click="onLogoutClick">Sign out</a>
    </div>
    <div v-if="$route.name === 'Wallets'" class="header__buttons">
      <a href="#" @click.prevent="$router.push({ name: 'Wallets', params: { add: 'add' } })">
        <i class="fa fa-plus"/>
        <span class="header__button-description">Add Wallet</span>
      </a>
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
