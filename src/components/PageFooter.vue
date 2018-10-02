<template>
  <footer class="py-5 text-center">
    <b-row class="py-2">
      <b-col>
        <router-link to="/" class="language-button">
          <i class="icon-flags"/>
        </router-link>
      </b-col>
    </b-row>
    <b-row class="py-2 footer-menu">
      <b-col>
        <!-- No user was logged in -->
        <div v-if="!authToken" class="menu">
          <router-link to="/about">About</router-link>
          <router-link to="/help">Help</router-link>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Sign up</router-link>
          <router-link to="/impressum">Impressum</router-link>
          <a href="https://soneso.com" target="_blank">Soneso</a>
        </div>

        <!-- Partial user was logged in (without all registration steps completed) -->
        <div v-if="authToken && authTokenType === 'partial'" class="menu">
          <router-link to="/about">About</router-link>
          <router-link to="/help">Help</router-link>
          <router-link to="/">&nbsp;</router-link>
          <a href="/login" @click="onLogoutClick">Sign out</a>
          <router-link to="/impressum">Impressum</router-link>
          <a href="https://soneso.com" target="_blank">Soneso</a>
        </div>

        <!-- Logged in user -->
        <div v-if="authToken && authTokenType !== 'partial'" class="menu menu--short">
          <a href="https://soneso.com" target="_blank">Developed by Soneso</a>
          <router-link to="/impressum">Impressum</router-link>
          <a href="#"><i class="fa fa-flag"/></a>
        </div>
      </b-col>
    </b-row>

    <b-row class="py-2 soneso-logo">
      <b-col class="text-uppercase">
        <p>Powered by</p>
        <img src="../assets/images/ui/soneso-logo.svg">
      </b-col>
    </b-row>

  </footer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

export default {
  props: {
    isLoggedIn: {
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
    ...mapGetters(['userStatus', 'authToken', 'authTokenType']),
  },
  methods: {
    ...mapActions(['logout']),
    async onLogoutClick (e) {
      e.preventDefault();
      await this.logout();
      this.$router.push({ name: 'Home' });
    }
  }
};
</script>
