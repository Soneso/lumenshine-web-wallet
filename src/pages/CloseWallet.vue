<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h3 :class="['form-headline', 'text-uppercase', 'text-center']">Merge / close wallet</h3>

        <br>
        <p>Here you can merge a funded Lumenshine wallet into another stellar account.</p>
        <p>You can only merge wallets that have enough funding, that do not trust other currencies than Stellar Lumens and that have no data entries.</p>

        <close-wallet-form
          v-if="wallets.res && availableWallets.length > 0"
          :transaction="closeTransaction"
          :result="closeAccountStatus.res"
          :loading="closeAccountStatus.loading"
          :available-wallets="availableWallets"
          :errors="closeAccountStatus.err"
          @clear="resetCloseAccount"
          @submit="onMergeClick"/>
        <div v-else-if="availableWallets.length === 0" class="text-danger my-3">You have no eligible wallets.</div>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import config from '@/config';
import CloseWalletForm from '@/components/forms/CloseWalletForm';

export default {
  name: 'CloseWallet',
  components: { CloseWalletForm },

  computed: {
    ...mapGetters(['wallets', 'closeAccountStatus', 'finishedTransactions']),
    availableWallets () {
      if (!this.wallets.res) return [];
      return this.wallets.res.filter(wallet => {
        if (!wallet.stellar_data) return false;
        if (wallet.stellar_data.balances.length > 1) return false;
        const xlmBalance = wallet.stellar_data.balances.find(bal => bal.asset_type === 'native').balance;
        if (parseFloat(xlmBalance) < parseFloat(config.STELLAR_BASE_FEE)) return false;
        const dataEntries = Object.keys(wallet.stellar_data.data_attr).length;
        if (dataEntries > 0) return false;
        return true;
      });
    },
    closeTransaction () {
      if (!this.closeAccountStatus.res) return;
      const transactionId = this.closeAccountStatus.res.transactionId;
      return this.finishedTransactions.find(tr => tr.id === transactionId);
    },
  },

  created () {
    this.getWallets();
    this.resetCloseAccount();
  },

  methods: {
    ...mapActions(['getWallets', 'closeAccount', 'resetCloseAccount']),

    async onMergeClick ({ publicKey, password, destination, memo, memoType }) {
      const params = {
        publicKey,
        password,
        destination,
        memo,
        memoType,
      };

      await this.closeAccount(params);
      await this.getWallets();
    },
  }
};
</script>
