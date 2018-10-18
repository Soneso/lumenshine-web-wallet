<template>
  <div class="px-2">
    <!-- change name + show wallet on dashboard-->
    <b-row align-v="center" align-h="between" class="pb-4">
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

    <!-- stellar pub key -->
    <b-row class="pb-4">
      <b-col>
        <strong>Stellar public key</strong>
        <br>
        <span class="break-word with-hyphens">{{ data.public_key_0 }}</span>
        <copy-to-clipboard :text="data.public_key_0" color="text-info"/>
      </b-col>
    </b-row>

    <!-- set address-->
    <b-row class="pb-4">
      <b-col>
        <wallet-address-form
          :loading="saveWalletLoading"
          :errors="editWalletStatus.err"
          :wallet-address="data.federation_address"
          @remove="onRemoveWalletAddress"
          @submit="onSaveWalletAddress"/>
      </b-col>
    </b-row>

    <!-- set inflation destination -->
    <b-row class="pb-4">
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

    <!-- add currencies -->
    <b-row class="pb-4">
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

    <!--balances / available-->
    <b-row class="pb-4 d-none d-sm-block d-md-none">
      <b-col>
        <div>
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
        </div>

        <div>
          <strong>Available</strong>
          <br>
          <table>
            <tr v-for="item in balances" :key="item.type + item.issuer">
              <td>{{ item.available }}</td>
              <td>{{ item.type }}</td>
            </tr>
          </table>
        </div>

        <div>
          <a href="#" @click.prevent="$emit('close', 'send')">send</a>
          <a href="#" @click.prevent="$emit('close', 'receive')">receive</a>
        </div>
      </b-col>
    </b-row>

    <!--secret seed-->
    <b-row class="pb-4">
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

    <!-- transactions -->
    <b-row class="pb-4">
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
