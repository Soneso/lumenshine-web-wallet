<template>
  <nav :class="['menu', { 'menu--closed': !menuOpen }]">
    <div class="menu__toggle-button">
      <a href="#" class="menu__toggle-button--desktop" @click="toggleMenu">
        <i :class="['fa', { 'fa-arrow-left': menuOpen, 'fa-arrow-right': !menuOpen }]"/>
      </a>
      <a href="#" class="menu__toggle-button--mobile only-mobile" @click="toggleMenu">
        <i :class="['fa', { 'fa-arrow-left': menuOpen, 'fa-bars': !menuOpen }]"/>
      </a>
    </div>
    <div class="menu__container">
      <a href="#"><i class="fa fa-snowflake-o"/>{{ userStatus.email }}</a>
      <div class="separator"/>
      <router-link to="/dashboard"><i class="fa fa-home"/>Home</router-link>
      <router-link to="/wallets"><i class="fa fa-credit-card"/>Wallets</router-link>
      <a href="#"><i class="fa fa-exchange"/>Transactions</a>
      <a href="#"><i class="fa fa-delicious"/>Currencies</a>
      <a href="#"><i class="fa fa-user"/>Contacts</a>
      <a href="#"><i class="fa fa-star-o"/>Extras</a>
      <div class="separator"/>
      <router-link to="/settings">
        <i class="fa fa-cog"/>
        Settings
        <div class="submenu">
          <router-link to="/change-password">Change Password</router-link>
          <router-link to="/change-tfa">Change 2FA Secret</router-link>
          <router-link to="/backup-mnemonic">Backup Secret/Mnemonic</router-link>
          <!-- <router-link to="/dashboard">Avatar</router-link> -->
        </div>
      </router-link>
      <a href="#"><i class="fa fa-question-circle"/>Help</a>
      <div class="separator"/>
      <a href="#" @click="onLogoutClick"><i class="fa fa-sign-out"/>Sign Out</a>
    </div>
  </nav>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

export default {
  props: {
    menuOpen: {
      type: Boolean,
      required: true,
    }
  },
  data () {
    return {
      config
    };
  },
  computed: {
    ...mapGetters(['userStatus', 'authToken']),
  },
  methods: {
    ...mapActions(['logout']),
    async onLogoutClick (e) {
      e.preventDefault();
      await this.logout();
      this.$router.push({ name: 'Login' });
    },
    toggleMenu () {
      this.$emit('toggleMenu');
    }
  }
};
</script>

<style lang="scss" scoped>
@import "assets/scss/variables";
.menu {
  background: #075393;
  padding: 15px;
  color: #fff;
  width: $menu-width;
  transition: width 0.4s;
  @include breakpoint(tablet) {
    position: fixed;
    top: 0;
    min-height: 100vh;
    margin-left: -$menu-width;
  }

  i.fa {
    margin-right: 15px;
  }
  a {
    position: relative;
    display: block;
    color: #fff;
    padding: 20px 15px;
    &:hover {
      background: #063a64;
      .submenu {
        @include breakpoint(desktop) {
          display: block;
        }
      }
    }

    .submenu {
      display: none;
      top: 0;
      background: #CCCCCC;
      position: absolute;
      right: -300px;
      width: 300px;
      z-index: 10000;
      a {
        color: #000;
        &:hover {
          background: #777;
        }
      }
    }
  }
  .separator {
    display: block;
    border-top: 1px solid #fff;
  }
  &__toggle-button {
    text-align: right;
    @include breakpoint(tablet) {
      position: absolute;
      top: 0;
    }
    i.fa {
      margin-right: 0;
    }
    &--desktop {
      @include breakpoint(tablet) {
        display: none !important;
      }
    }
    &--mobile {
      @include breakpoint(desktop) {
        display: none !important;
      }
    }
    @include breakpoint(tablet) {
      left: $menu-width + 15px;
    }
  }
  &--closed {
    width: 76px;
    @include breakpoint(tablet) {
      padding: 0;
      margin-left: 0;
      width: auto;
    }
    a {
      font-size: 0;
    }
    i.fa {
      font-size: 18px;
      margin-right: 0;
    }
    .submenu a {
      font-size: 16px;
    }
    .menu__container {
      @include breakpoint(tablet) {
        display: none;
      }
    }
    .menu__toggle-button {
      @include breakpoint(tablet) {
        left: 0px;
      }
    }
  }
}
</style>
