<template>
  <b-container fluid class="pl-5 pr-4 ml-3 mr-0">
    <b-row align-h="center" align-v="center">
      <b-col>
        <b-container fluid>
          <div v-if="wallets.loading" class="p-2 text-info">Loading...</div>
          <b-row align-h="start" align-v="center">
            <wallet-card v-for="wallet in homescreenWallets" :key="wallet.public_key_0" :data="wallet"/>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
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
