<template>
  <ul :class="['menu-container', {'pt-5': !isMobile, 'pt-0': isMobile, 'expanded': offCanvasMenuOpen, 'collapsed': !offCanvasMenuOpen}]">
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
      <a :class="{ active: activeMenu === 'dashboard'}" href="#" @click.prevent.stop="goto('dashboard')">
        <i class="icon-home"/>
        <div :style="toggleText">Home</div>
      </a>
    </li>

    <li>
      <a :class="{ active: activeMenu === 'wallets'}" href="#" @click.prevent.stop="goto('wallets')">
        <i class="icon-card"/>
        <div :style="toggleText">Wallets</div>
      </a>
    </li>

    <li>
      <a :class="{ active: activeMenu === 'transactions'}" href="#" @click.prevent.stop="goto('transactions')">
        <i class="icon-transaction"/>
        <div :style="toggleText">Transactions</div>
      </a>
    </li>

    <!--<li>-->
    <!--<a href="#">-->
    <!--<i class="icon-fa"/>-->
    <!--<div :style="toggleText">Currencies</div>-->
    <!--</a>-->
    <!--</li>-->

    <li>
      <a :class="{ active: activeMenu === 'contacts'}" href="#" @click.prevent.stop="goto('contacts')">
        <i class="icon-user"/>
        <div :style="toggleText">Contacts</div>
      </a>
    </li>

    <!--<li>-->
    <!--<a href="#">-->
    <!--<i class="icon-star"/>-->
    <!--<div :style="toggleText">Extras</div>-->
    <!--</a>-->
    <!--</li>-->

    <li class="has-submenu">
      <a :class="{ active: activeMenu === 'settings'}" href="#" @click.prevent.stop="goto('settings')">

        <i class="icon-settings"/>
        <div :style="toggleText">Settings</div>
        <div v-if="!isMobile" class="submenu">
          <ul>
            <li>
              <a href="#" class="py-1 d-block text-gray-500 font-weight-500" @click.stop.prevent="switchToChangePasswordView">
                <div>Change Password</div>
              </a>
            </li>

            <li>
              <a href="#" class="py-1 d-block text-gray-500 font-weight-500" @click.stop.prevent="switchToChange2faView">
                <div>Change 2FA Secret</div>
              </a>
            </li>

            <li>
              <a :class="{ active: activeMenu === 'backup-mnemonic'}" href="#" @click.prevent.stop="goto('backup-mnemonic')">
                <div>Backup Secret/Mnemonic</div>
              </a>
            </li>

            <li>
              <a :class="{ active: activeMenu === 'personal-data'}" href="#" @click.prevent.stop="goto('personal-data')">
                <div>Personal data</div>
              </a>
            </li>
          </ul>
        </div>
      </a>
    </li>
    <li>
      <div class="separator"/>
    </li>

    <li>
      <a ref="help" href="#" @click.prevent.stop="goto('help')">
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
  data () {
    return {
      activeMenu: 'dashboard',
      config
    };
  },
  computed: {
    ...mapGetters([
      'changePasswordStep',
      'change2faStep',
      'offCanvasMenuOpen',
      'userStatus',
      'authToken',
      'isMobile'
    ]),
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
      this.goto('change-password');
    },

    switchToChange2faView () {
      if (this.change2faStep !== 'password') {
        this.mutateChange2faStep('password');
      }
      this.goto('change-tfa');
    },

    goto (url) {
      this.activeMenu = url;
      this.$router.push(url);
      this.closeMenu();
    },

    closeMenu () {
      this.$store.commit('mutateOffCanvasMenuOpen', false);
      this.closeMenuAnimation();
    },

    async onLogoutClick () {
      this.closeMenu();
      await this.logout();
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
