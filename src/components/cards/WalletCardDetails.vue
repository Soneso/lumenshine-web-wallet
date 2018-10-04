<template>
  <div class="card__details">
    <h3>Details <i data-v-221f4c5c="" class="fa fa-question-circle-o"/></h3>
    <a href="#" class="card__close" @click.prevent="$emit('close')"><i data-v-221f4c5c="" class="fa fa-close"/></a>

    <wallet-name-form
      :loading="saveWalletLoading"
      :errors="editWalletStatus.err"
      :wallet-name="data.wallet_name"
      @submit="onSaveWalletName"/>

    <p class="card__checkbox">
      <input id="homeScreenCheckbox" v-model="homescreen" type="checkbox" class="switch">
      <label for="homeScreenCheckbox">Show wallet on home screen</label>
    </p>

    <wallet-address-form
      :loading="saveWalletLoading"
      :errors="editWalletStatus.err"
      :wallet-address="data.federation_address"
      @remove="onRemoveWalletAddress"
      @submit="onSaveWalletAddress"/>

    <wallet-inflation-form
      v-if="knownDestinations"
      :loading="inflationDestinationLoading"
      :decryption-error="decryptedWallet.err"
      :known-destinations="knownDestinations"
      :data="data"
      @submit="onSetInflationDestination"/>

    <wallet-currencies-form
      v-if="knownCurrencies"
      :loading="walletDetailsLoading"
      :errors="[...addCurrencyStatus.err, ...removeCurrencyStatus.err]"
      :decryption-error="decryptedWallet.err"
      :known-currencies="knownCurrencies"
      :data="data"
      @remove="onRemoveCurrency"
      @add="onAddCurrency"/>

    <p class="only-mobile">
      <strong>Balances</strong>
      <br>
      <table v-if="!data.stellar_data">
        <tr>
          <td>0.0</td>
          <td>XLM</td>
        </tr>
      </table>
      <table v-else>
        <tr v-for="balance in balances" :key="balance.type + balance.issuer">
          <td>{{ balance.balance }}</td>
          <td>{{ balance.type }}</td>
        </tr>
      </table>
    </p>

    <p class="only-mobile">
      <strong>Available</strong>
      <br>
      <table>
        <tr v-for="balance in avalaibleBalances" :key="balance.type + balance.issuer">
          <td>{{ balance.balance }}</td>
          <td>{{ balance.type }}</td>
        </tr>
      </table>
    </p>

    <div class="form-buttons">
      <a class="only-mobile" href="#" @click.prevent="$emit('close', 'send')">send</a>
      <a class="only-mobile" href="#" @click.prevent="$emit('close', 'receive')">receive</a>
    </div>

    <p>
      <strong>Stellar public key</strong>
      <br>
      <span v-if="accountIDCopied" class="copiedtext info">Copied to clipboard<br></span>
      {{ data.public_key_0 }}
      <a
        v-clipboard:copy="data.public_key_0"
        v-clipboard:success="onCopy"
        class="wallet-link">
        <i class="fa fa-clone"/>
      </a>
    </p>

    <wallet-secret-seed-form
      :data="data"
      :secret-seed="decryptedWallet.secretSeed"
      :loading="decryptedWallet.loading"
      :decryption-error="decryptedWallet.err"
      @hide="resetDecryptedWallet"
      @reveal="onDecryptWallet"/>

    <strong>Transactions</strong>
    <wallet-card-transactions :data="data"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import WalletSecretSeedForm from '@/components/forms/wallets/WalletSecretSeedForm';
import WalletNameForm from '@/components/forms/wallets/WalletNameForm';
import WalletAddressForm from '@/components/forms/wallets/WalletAddressForm';
import WalletInflationForm from '@/components/forms/wallets/WalletInflationForm';
import WalletCurrenciesForm from '@/components/forms/wallets/WalletCurrenciesForm';
import WalletCardTransactions from '@/components/cards/WalletCardTransactions';

export default {
  components: {
    WalletSecretSeedForm,
    WalletCardTransactions,
    WalletNameForm,
    WalletCurrenciesForm,
    WalletAddressForm,
    WalletInflationForm
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    balances: {
      type: Array,
      required: true,
    },
    avalaibleBalances: {
      type: Array,
      required: true,
    },
    inflationDestinationLoading: {
      type: Boolean,
      required: true,
    },
    walletDetailsLoading: {
      type: Boolean,
      required: true,
    }
  },
  data () {
    return {
      accountIDCopied: false,

      sendingPaymentLoading: false,
      saveWalletLoading: false,

      setInflationLoading: false,
      inflationDest: null,

      homescreen: this.data.show_on_homescreen,

      errors: [],
      config
    };
  },
  computed: {
    ...mapGetters(['addCurrencyStatus', 'removeCurrencyStatus', 'editWalletStatus', 'decryptedWallet', 'knownDestinationsStatus', 'knownCurrenciesStatus', 'knownDestinations', 'knownCurrencies']),
  },
  watch: {
    async homescreen (val) {
      this.saveWalletLoading = true;
      await this.editWallet({
        id: this.data.id,
        onHomescreen: val,
      });
      this.saveWalletLoading = false;
    }
  },
  created () {
    if (this.knownDestinationsStatus.shouldLoad) {
      this.getKnownDestinations();
    }
    if (this.knownCurrenciesStatus.shouldLoad) {
      this.getKnownCurrencies();
    }
  },
  methods: {
    ...mapActions(['editWallet', 'removeWalletAddress', 'decryptWallet', 'resetDecryptedWallet', 'getKnownDestinations', 'getKnownCurrencies']),
    onCopy () {
      this.accountIDCopied = true;
    },
    async onDecryptWallet (password) {
      await this.decryptWallet({ publicKey: this.data.public_key_0, password });
      // setTimeout(() => {
      //   this.resetDecryptedWallet();
      // }, 5000);
    },
    async onSaveWalletName ({ name }) {
      this.saveWalletLoading = true;
      await this.editWallet({
        id: this.data.id,
        wallet_name: name,
        onHomescreen: this.homescreen,
      });
      this.saveWalletLoading = false;
    },
    async onSaveWalletAddress (address) {
      this.saveWalletLoading = true;
      await this.editWallet({
        id: this.data.id,
        federation_address: address,
        onHomescreen: this.homescreen,
      });
      this.saveWalletLoading = false;
    },
    async onRemoveWalletAddress () {
      this.saveWalletLoading = true;
      await this.removeWalletAddress(this.data.id);
      this.saveWalletLoading = false;
    },
    async onSetInflationDestination (params) {
      this.$emit('setInflationDestination', params);
    },
    async onAddCurrency (params) {
      this.$emit('addCurrency', params);
    },
    async onRemoveCurrency (params) {
      this.$emit('removeCurrency', params);
    }
  }
};
</script>
