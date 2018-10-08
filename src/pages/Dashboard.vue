<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="8" sm="12" md="8" lg="8" xl="8">
      <b-container fluid>
        <div v-if="wallets.loading" class="py-4 px-2">Loading...</div>
        <b-row align-h="start" align-v="center">
          <wallet-card v-for="wallet in homescreenWallets" :key="wallet.public_key_0" :data="wallet"/>
        </b-row>
      </b-container>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import WalletCard from '@/components/cards/WalletCard';

export default {
  components: { WalletCard },
  computed: {
    ...mapGetters(['wallets']),
    homescreenWallets () {
      if (!this.wallets.res) return [];
      return this.wallets.res.filter(w => w.show_on_homescreen);
    }
  },
  created () {
    this.getWallets();
  },
  methods: {
    ...mapActions(['getWallets'])
  }
};
</script>
