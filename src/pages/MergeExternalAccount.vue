<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h3 :class="['form-headline', 'text-uppercase', 'text-center']">Merge external account</h3>

        <merge-external-account-form
          v-if="wallets.res && availableWallets.length > 0"
          :transaction="mergeTransaction"
          :result="mergeExternalAccountStatus.res"
          :loading="mergeExternalAccountStatus.loading"
          :available-wallets="availableWallets"
          :errors="mergeExternalAccountStatus.err"
          @submit="onMergeClick"/>
        <div v-else-if="availableWallets.length === 0" class="text-danger my-3">You have no funded wallets. Fund a wallet first and try again.</div>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import MergeExternalAccountForm from '@/components/forms/MergeExternalAccountForm';

export default {
  name: 'MergeExternalAccount',
  components: { MergeExternalAccountForm },
  data () {
    return {
    };
  },

  computed: {
    ...mapGetters(['wallets', 'mergeExternalAccountStatus', 'finishedTransactions']),
    availableWallets () {
      if (!this.wallets.res) return [];
      return this.wallets.res.filter(wallet => {
        if (!wallet.stellar_data) return false;
        return true;
      });
    },
    mergeTransaction () {
      if (!this.mergeExternalAccountStatus.res) return;
      const transactionId = this.mergeExternalAccountStatus.res.transactionId;
      return this.finishedTransactions.find(tr => tr.id === transactionId);
    },
  },

  created () {
    this.getWallets();
    this.resetMergeExternalAccount();
  },

  methods: {
    ...mapActions(['getWallets', 'mergeExternalAccount', 'resetMergeExternalAccount']),

    async onMergeClick ({ destination, secretSeed, memo, memoType }) {
      const params = {
        destination,
        secretSeed,
        memo,
        memoType,
      };

      await this.mergeExternalAccount(params);
      await this.getWallets();
    },
  }
};
</script>
