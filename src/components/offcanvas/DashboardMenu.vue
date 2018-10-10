<template>
  <div class="menu-container">
    <a href="#">{{ userStatus.email }}</a>
    <div class="separator"/>
    <router-link to="/dashboard">Home</router-link>
    <router-link to="/wallets">Wallets</router-link>
    <a href="#">Transactions</a>
    <a href="#">Currencies</a>
    <a href="#">Contacts</a>
    <a href="#">Extras</a>
    <div class="separator"/>
    <router-link to="/settings">
      Settings
      <div class="submenu">
        <router-link to="/change-password">Change Password</router-link>
        <router-link to="/change-tfa">Change 2FA Secret</router-link>
        <router-link to="/backup-mnemonic">Backup Secret/Mnemonic</router-link>
        <!-- <router-link to="/dashboard">Avatar</router-link> -->
      </div>
    </router-link>
    <a href="#">Help</a>
    <div class="separator"/>
    <a href="#" @click="onLogoutClick">Sign Out</a>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

export default {
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
    }
  }
};
</script>
