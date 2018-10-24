<template>
  <section>
    <spinner v-if="wallets.loading" align="center"/>

    <b-row align-h="start" class="equal-heights">
      <wallet-card v-for="wallet in wallets.res" :key="wallet.public_key_0" :data="wallet"/>
    </b-row>

    <b-modal v-model="addWalletModalShown" size="sm" hide-footer title="ADD NEW WALLET">
      <add-wallet-form v-if="nextFreePublicKey" :errors="addWalletStatus.err" :next-public-key="nextFreePublicKey" @cancel="onModalClose" @submit="onSubmitNewWallet"/>
    </b-modal>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StellarSdk from 'stellar-sdk';

import config from '@/config';

import WalletCard from '@/components/cards/WalletCard';
import AddWalletForm from '@/components/forms/wallets/AddWalletForm';
import spinner from '@/components/ui/spinner1.vue';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { WalletCard, AddWalletForm, spinner },
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
    $route () {
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
