<template>
  <div class="page">
    <h1>Dashboard</h1>
    <div v-if="wallets.loading">Loading...</div>
    <div class="card-container">
      <wallet-card v-for="wallet in homescreenWallets" :key="wallet.public_key_0" :data="wallet"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import WalletCard from '@/components/cards/WalletCard';

export default {
  components: { WalletCard },
  computed: {
    ...mapGetters(['wallets']),
    homescreenWallets () {
      return this.wallets.res.filter(w => w.show_on_homescreen);
    }
  },
  created () {
    this.getWallets();
  },
  methods: {
    ...mapActions(['getWallets']),
  }
};
</script>

<style lang="scss" scoped>
</style>
