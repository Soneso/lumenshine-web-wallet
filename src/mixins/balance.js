import Amount from '@/util/Amount';
import config from '@/config';

export default {
  computed: {
    reservedXLM () {
      if (!this.currentWallet.stellar_data) return new Amount('0');
      const entryCount = this.currentWallet.stellar_data.subentry_count;
      const reserved = new Amount(`${2 + entryCount}`).multiply(config.STELLAR_BASE_RESERVE);
      const xlmBalance = this.currentWallet.stellar_data.balances.find(b => b.asset_type === 'native');
      const fullReserve = xlmBalance.selling_liabilities ? reserved.plus(xlmBalance.selling_liabilities) : reserved;
      return fullReserve;
    },

    balances () {
      if (!this.currentWallet.stellar_data) return [];
      const balances = this.currentWallet.stellar_data.balances;
      const xlmBalanceObject = balances.find(b => b.asset_type === 'native');
      const xlmBalance = new Amount(xlmBalanceObject.balance);
      const xlmAvailble = new Amount(xlmBalance).minus(this.reservedXLM);

      const otherBalances = balances.filter(b => b.asset_type !== 'native');
      return [
        { balance: xlmBalance.format(), available: xlmAvailble.format(), type: 'XLM', sellingLiabilities: xlmBalanceObject.selling_liabilities },
        ...otherBalances.map(bal => ({
          balance: new Amount(bal.balance).format(),
          available: bal.selling_liabilities ? new Amount(bal.balance).minus(bal.selling_liabilities).format() : new Amount(bal.balance).format(),
          type: bal.asset_code,
          issuer: bal.asset_issuer,
          sellingLiabilities: bal.selling_liabilities,
        }))
      ];
    },
  },
};
