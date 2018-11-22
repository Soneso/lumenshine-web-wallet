<template>
  <section>
    <b-row align-h="start" class="equal-heights">
      <wallet-card v-for="wallet in wallets.res" :key="wallet.public_key" :data="wallet"/>
    </b-row>

    <b-modal v-model="addWalletModalShown" size="sm" hide-footer title="ADD NEW WALLET">
      <add-wallet-form :visible="addWalletModalShown" :loading="inProgress" :errors="addWalletStatus.err" :next-public-key="nextFreePublicKey" @cancel="onModalClose" @submit="onSubmitNewWallet"/>
    </b-modal>
  </section>
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
        this.resetAddWallet();
        this.resetEditWallet();
        this.getFreePublicKey();
      } else {
        this.onModalClose();
      }
    },
    $route () {
      this.addWalletModalShown = this.$route.params.add === 'add';
    }
  },

  async created () {
    await this.getWallets();
    this.watchWallets(this.wallets.res.map(w => w.public_key));
    this.getFreePublicKey();
  },

  async beforeDestroy () {
    await this.watchWallets([]);
  },

  methods: {
    ...mapActions(['getWallets', 'addWallet', 'editWallet', 'resetAddWallet', 'resetEditWallet', 'watchWallets']),
    async getFreePublicKey () {
      // check if already computed wallet it is still empty
      if (this.nextFreePublicKey) {
        try {
          await StellarAPI.loadAccount(this.nextFreePublicKey);
        } catch (err) {
          return;
        }
      }

      // search for new empty key
      this.nextFreePublicKey = null;
      const wallets = this.wallets.res;
      for (const pk of this.publicKeys) {
        if (wallets.find(w => w.public_key === pk)) continue;
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
      this.resetAddWallet();
      this.resetEditWallet();
      await this.addWallet({
        public_key: this.nextFreePublicKey,
        wallet_name: walletName,
      });
      if (this.addWalletStatus.err.length > 0) {
        this.inProgress = false;
        return;
      }
      this.nextFreePublicKey = null;
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
