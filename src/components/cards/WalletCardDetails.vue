<template>
  <div>
    <p class="card__checkbox float-right p-3">
      <input id="homeScreenCheckbox" v-model="homescreen" type="checkbox" class="switch">
      <label for="homeScreenCheckbox">Show wallet on home screen</label>
    </p>

    <wallet-name-form
      :loading="saveWalletLoading"
      :errors="editWalletStatus.err"
      :wallet-name="data.wallet_name"
      class="py-3"
      @submit="onSaveWalletName"/>

    <p>
      <strong>Stellar public key</strong>
      <br>
      <span v-if="accountIDCopied" class="text-info">Copied to clipboard<br></span>
      {{ data.public_key_0 }}
      <a
        v-clipboard:copy="data.public_key_0"
        v-clipboard:success="onCopy">
        <i class="icon-copy"/>
      </a>
    </p>

    <wallet-address-form
      :loading="saveWalletLoading"
      :errors="editWalletStatus.err"
      :wallet-address="data.federation_address"
      class="py-3"
      @remove="onRemoveWalletAddress"
      @submit="onSaveWalletAddress"/>

    <wallet-inflation-form
      v-if="knownDestinations && data"
      :loading="inflationDestinationLoading"
      :decryption-error="decryptedWallet.err"
      :known-destinations="knownDestinations"
      :data="data"
      @submit="onSetInflationDestination"/>

    <wallet-currencies-form
      v-if="knownCurrencies && data"
      :loading="walletDetailsLoading"
      :errors="[...addCurrencyStatus.err, ...removeCurrencyStatus.err]"
      :decryption-error="decryptedWallet.err"
      :known-currencies="knownCurrencies"
      :data="data"
      @remove="onRemoveCurrency"
      @add="onAddCurrency"/>

    <p class="d-none d-sm-block d-md-none">
      <strong>Balances</strong>
      <br>
      <table v-if="!data.stellar_data">
        <tr>
          <td>0.0</td>
          <td>XLM</td>
        </tr>
      </table>
      <table v-else>
        <tr v-for="item in balances" :key="item.type + item.issuer">
          <td>{{ item.balance }}</td>
          <td>{{ item.type }}</td>
        </tr>
      </table>
    </p>

    <p class="d-none d-sm-block d-md-none">
      <strong>Available</strong>
      <br>
      <table>
        <tr v-for="item in balances" :key="item.type + item.issuer">
          <td>{{ item.available }}</td>
          <td>{{ item.type }}</td>
        </tr>
      </table>
    </p>

    <div class="form-buttons">
      <a class="d-none d-sm-block d-md-none" href="#" @click.prevent="$emit('close', 'send')">send</a>
      <a class="d-none d-sm-block d-md-none" href="#" @click.prevent="$emit('close', 'receive')">receive</a>
    </div>

    <wallet-secret-seed-form
      :data="data"
      :secret-seed="decryptedWallet.secretSeed"
      :loading="decryptedWallet.loading"
      :decryption-error="decryptedWallet.err"
      @hide="resetDecryptedWallet"
      @reveal="onDecryptWallet"/>

    <strong>Transactions</strong>
    <wallet-card-transactions :data="data" @openOperationsModal="data => $emit('openOperationsModal', data)"/>
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
    onCopy (e) {
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
