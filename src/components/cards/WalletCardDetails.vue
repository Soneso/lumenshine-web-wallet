<template>
  <div class="px-2">
    <!-- change name + show wallet on dashboard-->
    <b-row align-v="center" align-h="between" class="pb-2">
      <b-col cols="12" sm="auto">
        <wallet-name-form
          :loading="saveWalletLoading"
          :errors="editWalletStatus.err"
          :wallet-name="data.wallet_name"
          @submit="onSaveWalletName"/>
      </b-col>

      <b-col cols="12" sm="5">
        <div class="card-checkbox float-right px-sm-3">
          <input id="homeScreenCheckbox" v-model="homescreen" type="checkbox" class="switch">
          <label for="homeScreenCheckbox">Show wallet on home screen</label>
        </div>
      </b-col>
    </b-row>
    <hr class="divider">
    <!-- stellar pub key -->
    <b-row class="pb-2">
      <b-col>
        <div class="font-weight-600">Stellar public key</div>
        <span class="break-word with-hyphens">{{ data.public_key_0 }}</span>
        <copy-to-clipboard :text="data.public_key_0" color="text-info"/>
      </b-col>
    </b-row>
    <hr class="divider">
    <!-- set address-->
    <b-row class="pb-2">
      <b-col>
        <wallet-address-form
          :loading="saveWalletLoading"
          :errors="editWalletStatus.err"
          :wallet-address="data.federation_address"
          @remove="onRemoveWalletAddress"
          @submit="onSaveWalletAddress"/>
      </b-col>
    </b-row>
    <hr class="divider">
    <!-- set inflation destination -->
    <b-row class="pb-2">
      <b-col>
        <wallet-inflation-form
          v-if="knownDestinations && data"
          :loading="inflationDestinationLoading"
          :decryption-error="decryptedWallet.err"
          :known-destinations="knownDestinations"
          :data="data"
          @submit="onSetInflationDestination"/>
      </b-col>
    </b-row>
    <hr class="divider">
    <!-- add currencies -->
    <b-row class="pb-2">
      <b-col>
        <wallet-currencies-form
          v-if="knownCurrencies && data"
          :loading="walletDetailsLoading"
          :errors="[...addCurrencyStatus.err, ...removeCurrencyStatus.err]"
          :decryption-error="decryptedWallet.err"
          :known-currencies="knownCurrencies"
          :data="data"
          @remove="onRemoveCurrency"
          @add="onAddCurrency"/>
      </b-col>
    </b-row>
    <hr class="divider">
    <!--balances / available-->
    <b-row class="pb-2">
      <b-col cols="12" sm="6" class="px-4">
        <div class="font-weight-600">Balances</div>
        <table v-if="!data.stellar_data">
          <tr>
            <td>0.0</td>
            <td>XLM</td>
          </tr>
        </table>
        <table v-else>
          <tr v-for="item in balances" :key="item.type + item.issuer">
            <td><small>{{ item.balance }}</small></td>
            <td><small>{{ item.type }}</small></td>
          </tr>
        </table>
      </b-col>

      <b-col cols="12" sm="6" class="px-4 pt-4 pt-sm-0">
        <div class="font-weight-600">Available</div>
        <table>
          <tr v-for="item in balances" :key="item.type + item.issuer">
            <td><small>{{ item.available }}</small></td>
            <td><small>{{ item.type }}</small></td>
          </tr>
        </table>
      </b-col>

      <b-col cols="12" class="px-4 pt-4">
        <a class="pr-4 text-success text-uppercase font-weight-500" href="#" @click.prevent="$emit('close', 'send')">send</a>
        <a class=" text-warning text-uppercase font-weight-500" href="#" @click.prevent="$emit('close', 'receive')">receive</a>
      </b-col>
    </b-row>
    <hr class="divider">
    <!--secret seed-->
    <b-row class="pb-2">
      <b-col>
        <wallet-secret-seed-form
          :data="data"
          :secret-seed="decryptedWallet.secretSeed"
          :loading="decryptedWallet.loading"
          :decryption-error="decryptedWallet.err"
          @hide="resetDecryptedWallet"
          @reveal="onDecryptWallet"/>
      </b-col>
    </b-row>
    <hr class="divider">
    <!-- transactions -->
    <b-row class="pb-2">
      <b-col>
        <h6 class="mb-3">Transactions</h6>
        <wallet-card-transactions :data="data" @openOperationsModal="data => $emit('openOperationsModal', data)"/>
      </b-col>
    </b-row>
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

import CopyToClipboard from '@/components/ui/copyToClipboard';

export default {
  components: {
    WalletSecretSeedForm,
    WalletCardTransactions,
    WalletNameForm,
    WalletCurrenciesForm,
    WalletAddressForm,
    WalletInflationForm,
    CopyToClipboard
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
