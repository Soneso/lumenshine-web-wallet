<template>
  <footer class="py-4 text-center">
    <b-row class="py-2">
      <b-col>
        <router-link to="/" class="language-button">
          <i class="icon-flags"/>
        </router-link>
      </b-col>
    </b-row>
    <b-row class="py-2 footer-menu">
      <b-col>
        <div class="menu">
          <!-- No user was logged in -->
          <template v-if="!authToken" class="menu">
            <router-link to="/about">About</router-link>
            <router-link to="/help">Help</router-link>
            <router-link to="/login">Login</router-link>
            <router-link to="/register">Sign up</router-link>
            <router-link to="/impressum">Impressum</router-link>
            <a href="https://soneso.com" target="_blank">Soneso</a>
          </template>

          <!-- Partial user was logged in (without all registration steps completed) -->
          <template v-if="authToken && authTokenType === 'partial'" class="menu">
            <router-link to="/about">About</router-link>
            <router-link to="/help">Help</router-link>
            <router-link to="/">&nbsp;</router-link>
            <a href="/login" @click="onLogoutClick">Sign out</a>
            <router-link to="/impressum">Impressum</router-link>
            <a href="https://soneso.com" target="_blank">Soneso</a>
          </template>

          <!-- Logged in user -->
          <template v-if="authToken && authTokenType !== 'partial'" class="menu menu--short">
            <a href="https://soneso.com" target="_blank">Developed by Soneso</a>
            <router-link to="/impressum">Impressum</router-link>
          </template>
        </div>
      </b-col>
    </b-row>

    <b-row class="py-2 soneso-logo">
      <b-col class="text-uppercase">
        <p>Powered by</p>
        <a href="https://soneso.com" target="_blank">
          <img class="not-stretching" src="../assets/images/ui/soneso-logo.svg">
        </a>
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
    async onLogoutClick () {
      await this.logout();
      this.$router.push({ name: 'Home' });
    }
  }
};
</script>
