<template>
  <b-container fluid class="px-3">
    <b-row align-h="center" align-v="center">
      <b-col>
        <b-container fluid>
          <spinner v-if="wallets.loading" align="center"/>

          <b-row align-h="start" class="equal-heights">
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
