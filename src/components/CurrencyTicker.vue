<template>
  <div class="currency-ticker">
    <div>
      <p class="div__amounts">{{ totalXLMAmount.toFixed(2) }} XLM ~ {{ totalUSDAmount }} USD</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import Amount from '@/util/Amount';

export default {
  data () {
    return {
      config
    };
  },
  computed: {
    ...mapGetters(['wallets', 'currencyPairs', 'currencyData']),

    totalXLMAmount () {
      const wallets = this.wallets.res;
      if (!wallets) return new Amount('0');
      let sum = new Amount('0');
      for (const wallet of wallets) {
        if (wallet.stellar_data) {
          const xlmBalance = wallet.stellar_data.balances.find(b => b.asset_type === 'native');
          if (xlmBalance) {
            sum = sum.plus(xlmBalance.balance);
          }
        }
      }
      return sum;
    },
    totalUSDAmount () {
      if (!this.currencyData.res) {
        return '';
      }
      const rate = this.currencyData.res.rates.find(rate => rate.asset_code === 'XLM').rate;
      return (this.totalXLMAmount.toNumber() * rate).toFixed(2);
    }
  },
  async created () {
    await this.getCurrencyPairs();
    await this.getCurrencyData();
  },
  methods: {
    ...mapActions(['getCurrencyPairs', 'getCurrencyData']),
  }
};
</script>

<style lang="scss" scoped>
@import "assets/scss/variables";

</style>
