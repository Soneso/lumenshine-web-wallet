<template>
  <div class="card__details">
    <h3>Details <i data-v-221f4c5c="" class="fa fa-question-circle-o"/></h3>
    <a href="#" class="card__close" @click.prevent="$emit('close')"><i data-v-221f4c5c="" class="fa fa-close"/></a>

    <wallet-name-form
      :loading="saveWalletLoading"
      :update-error="decryptError"
      :wallet-name="data.wallet_name"
      @submit="onSaveWalletName"/>

    <p class="card__checkbox">
      <input id="homeScreenCheckbox" v-model="homescreen" type="checkbox" class="switch">
      <label for="homeScreenCheckbox">Show wallet on home screen</label>
    </p>

    <wallet-address-form
      :loading="saveWalletLoading"
      :update-error="decryptError"
      :errors="editWalletStatus.err"
      :wallet-address="data.federation_address"
      @remove="onRemoveWalletAddress"
      @submit="onSaveWalletAddress"/>

    <wallet-inflation-form
      :loading="inflationDestinationLoading"
      :update-error="decryptError"
      :data="data"
      @submit="onSetInflationDestination"/>

    <wallet-currencies-form
      :loading="walletDetailsLoading"
      :errors="[...addCurrencyStatus.err, ...removeCurrencyStatus.err]"
      :decrypt-error="decryptError"
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
        <tr v-for="balance in balances" :key="balance.type">
          <td>{{ balance.balance }}</td>
          <td>{{ balance.type }}</td>
        </tr>
      </table>
    </p>

    <p class="only-mobile">
      <strong>Available</strong>
      <br>
      <table>
        <tr v-for="balance in avalaibleBalances" :key="balance.type">
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
      :secret-seed="secretSeed"
      :loading="decryptWalletLoading"
      :decrypt-error="decryptError"
      @hide="secretSeed = null"
      @reveal="pw => $emit('decrypt', pw)"/>

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
    secretSeed: {
      type: String,
      default: null,
    },
    inflationDestinationLoading: {
      type: Boolean,
      required: true,
    },
    decryptError: {
      type: Boolean,
      required: true,
    },
    decryptWalletLoading: {
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
    ...mapGetters(['addCurrencyStatus', 'removeCurrencyStatus', 'editWalletStatus']),
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
  methods: {
    ...mapActions(['editWallet', 'removeWalletAddress']),
    onCopy () {
      this.accountIDCopied = true;
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
        federation_address: address
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

<style lang="scss" scoped>
@import "assets/scss/variables";
.centered {
  text-align: center;
}
.wallet-link {
  color: #222;
}
p {
  word-wrap: break-word;
}
.card {
  &__checkbox {
    @include breakpoint(desktop) {
      position: absolute;
      right: 0;
      top: 63px;
    }
  }
}
</style>
