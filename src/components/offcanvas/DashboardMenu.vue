<template>
  <ul class="menu-container pt-5">
    <li v-if="userStatus.email">
      <a href="#">{{ userStatus.email }}</a>
    </li>

    <div class="separator mt-5"/>

    <li>
      <router-link to="/dashboard">
        <i class="icon-home"/>
        <div :style="toggleText">Home</div>
      </router-link>
    </li>

    <li>
      <router-link to="/wallets">
        <i class="icon-card"/>
        <div :style="toggleText">Wallets</div>
      </router-link>
    </li>

    <li>
      <a href="#">
        <i class="icon-transaction"/>
        <div :style="toggleText">Transactions</div>
      </a>
    </li>

    <li>
      <a href="#">
        <i class="icon-fa"/>
        <div :style="toggleText">Currencies</div>
      </a>
    </li>

    <li>
      <a href="#">
        <i class="icon-user"/>
        <div :style="toggleText">Contacts</div>
      </a>
    </li>

    <li>
      <a href="#">
        <i class="icon-star"/>
        <div :style="toggleText">Extras</div>
      </a>
    </li>

    <li>
      <router-link to="/settings">

        <i class="icon-settings"/>
        <div :style="toggleText">Settings</div>
        <ul class="submenu">
          <li>
            <router-link to="/change-password">
              <i class="icon-home"/>
              <div :style="toggleText">Change Password</div>
            </router-link>
          </li>

          <li>
            <router-link to="/change-tfa">
              <i class="icon-home"/>
              <div :style="toggleText">Change 2FA Secret</div>
            </router-link>
          </li>

          <li>
            <router-link to="/backup-mnemonic">
              <i class="icon-home"/>
              <div :style="toggleText">Backup Secret/Mnemonic</div>
            </router-link>
          </li>

        </ul>
      </router-link>
    </li>

    <div class="separator"/>

    <li>
      <a href="#">
        <i class="icon-help"/>
        <div :style="toggleText">Help</div>
      </a>
    </li>

    <li>
      <a href="#" @click="onLogoutClick">
        <i class="icon-logout"/>
        <div :style="toggleText">Sign Out</div>
      </a>
    </li>
    <div class="separator"/>
  </ul>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import config from '@/config';

export default {
  name: 'DashboardMenu',
  data: () => ({ config }),
  computed: {
    ...mapGetters(['offCanvasMenuOpen', 'userStatus', 'authToken']),
    toggleText () {
      return {
        opacity: this.offCanvasMenuOpen ? 1 : 0
      };
    }
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
