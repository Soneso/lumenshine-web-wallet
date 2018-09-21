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

<style lang="scss" scoped>
@import "assets/scss/variables";
.header {
  position: relative;
  padding: 15px;
  background: #597EAA;
  text-align: center;
  color: #fff;
  @include breakpoint(tablet) {
    padding: 3px 0;
  }
  h2 {
    color: #FE9800;
    font-size: 30px;
    @include breakpoint(tablet) {
      display: none;
    }
  }
  h3 {
    color: #fff;
    font-weight: normal;
    font-size: 18px;
    @include breakpoint(tablet) {
      display: none;
    }
  }
  &__amounts {
    @include breakpoint(tablet) {
      display: none;
    }
  }
  &--full {
    @include breakpoint(tablet) {
      h2, h3, .header__amounts {
        display: block;
      }
    }
  }
  .user-info {
    position: absolute;
    right: 20px;
    bottom: 15px;
    @include breakpoint(tablet) {
      position: relative;
      right: auto;
      bottom: auto;
    }
    &__email {
      font-weight: bold;
    }
    a {
      text-decoration: underline;
      color: #fff;
    }
  }
  &__buttons {
    position: absolute;
    bottom: 20px;
    right: 20px;
    a {
      color: #fff;
    }
    .header__button-description {
      display: block;
      @include breakpoint(tablet) {
        display: none;
      }
    }
  }
}
</style>
