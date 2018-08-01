<template>
  <div class="page">
    <div v-if="wallets.loading">Loading...</div>
    <div v-else class="card-container">
      <wallet-card v-for="wallet in wallets.res" :key="wallet.public_key_0" :data="wallet"/>
    </div>
    <modal v-if="addWalletModalShown" @close="onModalClose">
      <template slot="title">
        Add Wallet
      </template>

      <add-wallet-form v-if="nextFreePublicKey" :errors="addWalletStatus.err" :next-public-key="nextFreePublicKey" @cancel="onModalClose" @submit="onSubmitNewWallet"/>
    </modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StellarSdk from 'stellar-sdk';

import config from '@/config';

import WalletCard from '@/components/cards/WalletCard';
import AddWalletForm from '@/components/forms/wallets/AddWalletForm';
import Modal from '@/components/Modal';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { WalletCard, Modal, AddWalletForm },
  data () {
    return {
      nextFreePublicKey: null,
      inProgress: false,
    };
  },
  computed: {
    ...mapGetters(['wallets', 'publicKeys', 'addWalletStatus']),
    addWalletModalShown () {
      return this.$route.params.add === 'add';
    }
  },
  watch: {
    addWalletModalShown (val) {
      if (val) {
        this.getFreePublicKey();
      }
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

<style lang="scss" scoped>
</style>
