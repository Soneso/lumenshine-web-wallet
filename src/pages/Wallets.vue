<template>
  <b-container fluid class="px-3">
    <b-row align-h="center" align-v="center">
      <b-col>
        <b-container fluid>
          <transition name="fade">
            <div v-if="wallets.loading" class="loading-indicator">Loading...</div>
          </transition>
          <b-row align-h="start" align-v="center">
            <wallet-card v-for="wallet in wallets.res" :key="wallet.public_key_0" :data="wallet"/>
          </b-row>
          <b-modal v-model="addWalletModalShown" hide-footer title="Add new wallet">
            <add-wallet-form v-if="nextFreePublicKey" :errors="addWalletStatus.err" :next-public-key="nextFreePublicKey" @cancel="onModalClose" @submit="onSubmitNewWallet"/>
          </b-modal>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StellarSdk from 'stellar-sdk';

import config from '@/config';

import WalletCard from '@/components/cards/WalletCard';
import AddWalletForm from '@/components/forms/wallets/AddWalletForm';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { WalletCard, AddWalletForm },
  data () {
    return {
      nextFreePublicKey: null,
      inProgress: false,
      addWalletModalShown: this.$route.params.add === 'add',
    };
  },
  computed: {
    ...mapGetters(['wallets', 'publicKeys', 'addWalletStatus']),
  },
  watch: {
    addWalletModalShown (val) {
      if (val) {
        this.getFreePublicKey();
      } else {
        this.onModalClose();
      }
    },
    $route (val) {
      this.addWalletModalShown = this.$route.params.add === 'add';
    }
  },
  async created () {
    await this.getWallets();
    if (this.addWalletModalShown) {
      await this.getFreePublicKey();
    }
  },
  methods: {
    ...mapActions(['getWallets', 'addWallet', 'editWallet']),
    async getFreePublicKey () {
      this.nextFreePublicKey = null;
      const wallets = this.wallets.res;
      for (const pk of this.publicKeys) {
        if (wallets.find(w => w.public_key_0 === pk)) continue;
        try {
          await StellarAPI.loadAccount(pk);
        } catch (err) {
          this.nextFreePublicKey = pk;
          break;
        }
      }
    },
    onModalClose () {
      this.$router.push({ name: 'Wallets', params: {} });
    },
    async onSubmitNewWallet ({ walletName, onHomescreen }) {
      this.inProgress = true;
      await this.addWallet({
        public_key_0: this.nextFreePublicKey,
        wallet_name: walletName,
      });
      if (this.addWalletStatus.err.length > 0) {
        this.inProgress = false;
        return;
      }
      if (onHomescreen && this.addWalletStatus.res && this.addWalletStatus.res.id) {
        await this.editWallet({
          id: this.addWalletStatus.res.id,
          onHomescreen: true
        });
      }
      this.onModalClose();
      this.inProgress = false;
    }
  }
};
</script>
