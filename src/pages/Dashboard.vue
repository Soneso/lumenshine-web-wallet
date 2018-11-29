<template>
  <section>
    <b-row align-h="start" class="equal-heights">
      <!--<card-spinner :loading="wallets.loading"/>-->
      <chart-card />
      <wallet-card v-for="(wallet, key) in dashboardWallets" :key="wallet.public_key" :order="key > 0 ? key + 2 : 1" :data="wallet" @recheck="recheckWallets"/>
    </b-row>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import WalletCard from '@/components/cards/WalletCard';
import ChartCard from '@/components/cards/ChartCard';
import cardSpinner from '@/components/ui/cardSpinner.vue';

export default {
  components: { WalletCard, ChartCard, cardSpinner },
  data () {
    return {
      walletIds: [], // needed for the case when details view is open, and user unchecks the "Show wallet on home screen" checkbox. In this case the wallets cannot be filtered using the boolean show_on_homescreen flag. Old card should remain there.
    };
  },

  computed: {
    ...mapGetters(['wallets']),
    dashboardWallets () {
      if (!this.wallets.res) return [];
      return this.walletIds.map(wId => this.wallets.res.find(w => w.id === wId));
    }
  },

  async created () {
    await this.getWallets();
    this.recheckWallets();
    await this.watchWallets(this.dashboardWallets.map(w => w.public_key));
  },

  async beforeDestroy () {
    await this.watchWallets([]);
  },

  methods: {
    ...mapActions(['getWallets', 'watchWallets']),
    recheckWallets () {
      if (!this.wallets.res) {
        this.walletIds = [];
        return;
      }
      this.walletIds = this.wallets.res.filter(w => w.show_on_homescreen).map(w => w.id);
    }
  }
};
</script>
