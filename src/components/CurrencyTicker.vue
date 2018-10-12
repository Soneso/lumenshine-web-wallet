<template>
  <div class="currency-ticker">
    <div v-if="pairs.length > 0">
      <swiper :options="{ loop: true, autoplay: { delay: 8000 }, direction: 'vertical' }">
        <swiper-slide v-for="pair in pairs" :key="pair.type + pair.issuer" class="div-amounts">
          {{ pair.amount.format() }} {{ pair.source }} ≈ {{ pair.value.format(2) }} {{ pair.destination }}
        </swiper-slide>
        <swiper-slide class="div-amounts">
          Value in your wallets ≈ {{ totalUSDAmount.format(2) }} USD
        </swiper-slide>
      </swiper>
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
    ...mapGetters(['wallets', 'currencyPairs', 'currencyRates']),
    totalBalances () {
      if (!this.wallets.res) return [];
      const totalBalances = {};
      this.wallets.res.forEach(wallet => {
        if (!wallet.stellar_data) return;
        const balances = wallet.stellar_data.balances;
        if (!totalBalances.XLM) totalBalances.XLM = [];
        totalBalances.XLM.push({ balance: new Amount(balances.find(b => b.asset_type === 'native').balance), type: 'XLM' });

        const otherBalances = balances
          .filter(b => b.asset_type !== 'native')
          .map(bal => ({ balance: new Amount(bal.balance), type: bal.asset_code, issuer: bal.asset_issuer }));
        otherBalances.forEach(bal => {
          if (!totalBalances[bal.type]) totalBalances[bal.type] = [];
          totalBalances[bal.type].push(bal);
        });
      });

      for (const type in totalBalances) {
        const amount = totalBalances[type].map(b => b.balance).reduce((acc, val) => new Amount(acc).plus(val));
        totalBalances[type] = { balance: amount, type, issuer: totalBalances[type][0].issuer };
      }

      if (!totalBalances.XLM) { // in case the user has no funded wallets
        return [];
      }

      return [totalBalances.XLM, ...Object.keys(totalBalances).filter(b => b !== 'XLM').map(b => totalBalances[b])];
    },
    totalUSDAmount () {
      return this.pairs.map(p => p.value).reduce((acc, cur) => new Amount(acc).plus(cur));
    },
    flatCurrencyPairs () {
      if (!this.currencyRates.res) {
        return [];
      }
      return this.currencyRates.res.rates.map(rate => ({
        source: rate.source_currency.asset_code,
        rate: rate.rate,
        issuer: rate.source_currency.issuer_public_key || undefined,
        destination: 'USD'
      }));
    },
    pairs () {
      return this.totalBalances
        .map(b => {
          const rate = this.flatCurrencyPairs.find(p => p.source === b.type && p.issuer === b.issuer);
          if (!rate) return null;
          return { ...rate, amount: b.balance, value: new Amount(`${rate.rate}`).multiply(b.balance) };
        }).filter(x => x);
    },
  },
  watch: {
    wallets () {
      this.refreshRates();
    },
    currencyPairs () {
      this.refreshRates();
    }
  },
  async created () {
    await this.getCurrencyPairs();
  },
  methods: {
    ...mapActions(['getCurrencyPairs', 'getCurrencyRates']),
    async refreshRates () {
      if (!this.currencyPairs.res || !this.wallets.res) return;
      const currencies = this.currencyPairs.res.map(cp => ({ type: cp.source_currency.asset_code, issuer: cp.source_currency.issuer_public_key || undefined }));

      const fetchableCurrencies = this.totalBalances.filter(tb => currencies.find(c => c.type === tb.type && c.issuer === tb.issuer));

      await this.getCurrencyRates({
        destination_currency: 'USD',
        source_currencies: fetchableCurrencies.map(c => ({ asset_code: c.type, issuer_public_key: c.issuer || '' }))
      });
    }
  }
};
</script>
