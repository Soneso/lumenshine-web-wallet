<template>
  <ul :class="['menu-container', 'pt-5', {'expanded': offCanvasMenuOpen, 'collapsed': !offCanvasMenuOpen}]">
    <li class="user-section text-center">
      <div class="user-avatar">
        <template v-if="userStatus.avatar">
          <img src="#" alt="">
        </template>
        <template v-else>
          <i class="icon-user-circle"/>
        </template>
      </div>
      <div :style="toggleText" class="user-email text-white">
        <small>{{ userStatus.email }}</small>
      </div>
    </li>

    <li>
      <div class="separator"/>
    </li>

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
      <router-link to="/contacts">
        <i class="icon-user"/>
        <div :style="toggleText">Contacts</div>
      </router-link>
    </li>

    <li>
      <a href="#">
        <i class="icon-star"/>
        <div :style="toggleText">Extras</div>
      </a>
    </li>

    <li class="has-submenu">
      <router-link to="/settings">

        <i class="icon-settings"/>
        <div :style="toggleText">Settings</div>
        <div class="submenu">
          <ul>
            <li>
              <a href="#" class="py-1 d-block text-gray-500 font-weight-500"
                 @click.stop.prevent="switchToChangePasswordView">
                <div>Change Password</div>
              </a>
            </li>

            <li>
              <a href="#" class="py-1 d-block text-gray-500 font-weight-500"
                 @click.stop.prevent="switchToChange2faView">
                <div>Change 2FA Secret</div>
              </a>
            </li>

            <li>
              <router-link to="/backup-mnemonic">
                <div>Backup Secret/Mnemonic</div>
              </router-link>
            </li>
          </ul>
        </div>
      </router-link>
    </li>

    <li>
      <div class="separator"/>
    </li>

    <li>
      <a href="#">
        <i class="icon-help"/>
        <div :style="toggleText">Help</div>
      </a>
    </li>

    <li>
      <a href="#" @click.prevent="onLogoutClick">
        <i class="icon-logout"/>
        <div :style="toggleText">Sign Out</div>
      </a>
    </li>
    <li>
      <div class="separator"/>
    </li>
  </ul>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import config from '@/config';
import offcanvasNavigation from '../../mixins/offcanvasNavigation.js';

export default {
  name: 'DashboardMenu',
  mixins: [offcanvasNavigation],
  data: () => ({ config }),
  computed: {
    ...mapGetters(['changePasswordStep', 'change2faStep', 'offCanvasMenuOpen', 'userStatus', 'authToken']),
    toggleText () {
      return {
        opacity: this.offCanvasMenuOpen ? 1 : 0
      };
    }
  },
  methods: {
    ...mapActions(['logout']),
    ...mapMutations(['mutateChangePasswordStep', 'mutateChange2faStep']),

    switchToChangePasswordView () {
      if (this.changePasswordStep !== 'password') {
        this.mutateChangePasswordStep('password');
      }
      this.$router.push({name: 'ChangePassword'});
    },

    switchToChange2faView () {
      if (this.change2faStep !== 'password') {
        this.mutateChange2faStep('password');
      }
      this.$router.push({name: 'ChangeTfa'});
    },

    async onLogoutClick () {
      this.$store.commit('mutateOffCanvasMenuOpen', false);
      this.closeMenuAnimation();
      await this.logout();
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
