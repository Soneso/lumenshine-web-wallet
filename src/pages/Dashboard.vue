<template>
  <section>
    <b-row align-h="start" class="equal-heights">
      <spinner v-if="wallets.loading" align="center"/>
      <wallet-card v-for="wallet in homescreenWallets" v-else :key="wallet.public_key" :data="wallet"/>
    </b-row>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import WalletCard from '@/components/cards/WalletCard';
import spinner from '@/components/ui/spinner1.vue';

export default {
  components: { WalletCard, spinner },
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
