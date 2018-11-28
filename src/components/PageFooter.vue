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
            <router-link to="/about" target="_blank" rel="noreferrer">About</router-link>
            <router-link to="/help" target="_blank" rel="noreferrer">Help</router-link>
            <router-link to="/login">Log in</router-link>
            <a href="/terms" target="_blank" rel="noreferrer">Terms</a>
            <router-link to="/register">Sign up</router-link>
            <router-link to="/impressum" target="_blank" rel="noreferrer">Impressum</router-link>
            <a href="https://soneso.com" target="_blank" rel="noreferrer">Soneso</a>
          </template>

          <!-- Partial user was logged in (without all registration steps completed) -->
          <template v-if="authToken && authTokenType === 'partial'" class="menu">
            <router-link to="/about" target="_blank" rel="noreferrer">About</router-link>
            <router-link to="/help" target="_blank" rel="noreferrer">Help</router-link>
            <a href="/terms" target="_blank" rel="noreferrer">Terms</a>
            <a href="/login" @click="onLogoutClick">Sign out</a>
            <router-link to="/impressum" target="_blank" rel="noreferrer">Impressum</router-link>
            <a href="https://soneso.com" target="_blank" rel="noreferrer">Soneso</a>
          </template>

          <!-- Logged in user -->
          <template v-if="authToken && authTokenType !== 'partial'" class="menu menu--short">
            <a href="https://soneso.com" target="_blank" rel="noreferrer">Developed by Soneso</a>
            <a href="/terms" target="_blank" rel="noreferrer">Terms</a>
            <router-link to="/impressum" target="_blank" rel="noreferrer">Impressum</router-link>
          </template>
        </div>
      </b-col>
    </b-row>
    <b-row class="py-2 soneso-logo">
      <b-col class="text-uppercase">
        <p>Powered by</p>
        <a href="https://soneso.com" target="_blank" rel="noreferrer">
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
  name: 'Footer',
  props: {
    isLoggedIn: {
      type: Boolean,
      required: true,
    }
  },
  data: () => ({ config }),
  computed: {
    ...mapGetters([
      'userStatus',
      'authToken',
      'authTokenType'
    ])
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
