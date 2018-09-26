<template>
  <footer>

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
