<template>
  <b-col :md="wideCard ? 12 : 6" :style="{ order }" cols="12" class="px-1 mb-2" >
    <b-card :class="wideCard ? 'card-wide' : 'card-normal'">
      <b-row class="card-header">
        <b-col>
          <h6 class="mb-0">
            <span class="font-weight-700">{{ data.wallet_name }}</span>
            <span>WALLET</span>
          </h6>
          <b-badge v-if="!data.stellar_data" variant="secondary" class="text-white font-weight-700 mb-2 text-uppercase">not funded</b-badge>
          <b-badge v-else :variant="data.federation_address ? 'warning' : 'secondary'" class="text-white font-weight-700 mb-2">
            {{ data.federation_address || 'no short address' }}
          </b-badge>
        </b-col>
      </b-row>
      <spinner v-if="walletLoading(data.id)" align="center" class="pt-4 pb-5"/>
      <wallet-card-balances v-else="" :wide-card="wideCard" :balances="balances" :data="data"/>

      <b-row slot="footer" :class="{'invisible': walletLoading(data.id)}">
        <b-col>
          <template v-if="!data.stellar_data">
            <div class="mx-2 py-2 text-right">
              <a href="#" class="p-1" @click.prevent="depositModalVisible = true">Fund Wallet</a>
            </div>
          </template>

          <template v-else-if="showActions">
            <div v-if="!config.IS_TEST_NETWORK" class="mx-2 py-2 float-left">
              <a href="#" class="px-1" @click.prevent="depositModalVisible = true">Deposit</a>
            </div>
            <div class="mx-2 py-2 text-right">
              <a href="#" class="px-1" @click.prevent="resetSendPayment(), sendModalVisible = true">Send</a>
              <a href="#" class="px-1" @click.prevent="receiveModalVisible = true">Receive</a>
              <a href="#" class="px-1" @click.prevent="detailsModalVisible = true">Details</a>
            </div>
          </template>
        </b-col>
      </b-row>
    </b-card>

    <!-- modals -->
    <b-modal v-model="receiveModalVisible" hide-footer title="Receive" size="sm">
      <receive-payment-form v-if="receiveModalVisible" :data="data" @cancel="receiveModalVisible = false"/>
    </b-modal>

    <b-modal v-model="sendModalVisible" hide-footer size="sm" title="Send">
      <send-payment-form
        v-if="sendModalVisible && data && balances"
        :result="sendPaymentStatus.res"
        :loading="sendPaymentStatus.loading || decryptedWallet.loading"
        :data="data"
        :errors="sendPaymentStatus.err"
        :exchanges="exchanges"
        :transaction="sendPaymentTransaction"
        @reset="resetSendPayment"
        @close="sendModalVisible = false"
        @submit="onSendPaymentClick"/>
    </b-modal>

    <b-modal v-model="detailsModalVisible" hide-footer title="Wallet details">
      <wallet-card-details
        v-if="detailsModalVisible"
        :data="data"
        :balances="balances"
        :decrypt-wallet-loading="decryptedWallet.loading"
        :inflation-destination-loading="setInflationDestLoading"
        :wallet-details-loading="walletDetailsLoading"
        @setInflationDestination="onSetInflationDestination"
        @addCurrency="onAddCurrency"
        @removeCurrency="onRemoveCurrency"
        @openOperationDetails="data => {operationDetailsModalData = data}"
        @close="onDetailsClose"/>
    </b-modal>

    <b-modal v-model="depositModalVisible" title="Deposit" size="md" hide-footer>
      <wallet-deposits v-if="depositModalVisible" :data="data" @close="depositModalVisible = false" @changelly="onShowChangelly"/>
    </b-modal>

    <div v-if="!config.IS_TEST_NETWORK" id="changellyModal" :style="{display: changellyModalVisible ? 'block' : 'none'}">
      <div class="changellyModal-content">
        <span class="changellyModal-close" @click="changellyModalVisible = false">x</span>
        <iframe v-if="changellyModalVisible" :src="`https://old.changelly.com/widget/v1?auth=email&from=${changellyCurrency}&to=XLM&merchant_id=dcaa3ae0e64f&address=${data.public_key}&amount=0.1&ref_id=dcaa3ae0e64f&color=00cf70`" width="600" height="500" class="changelly" scrolling="no" style="overflow-y: hidden; border: none">
          Can't load widget
        </iframe>
      </div>
    </div>
  </b-col>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import Amount from '@/util/Amount';
import balanceMixin from '@/mixins/balance';
import ReceivePaymentForm from '@/components/forms/wallets/ReceivePaymentForm';
import SendPaymentForm from '@/components/forms/wallets/SendPaymentForm';
import WalletSecretSeedForm from '@/components/forms/wallets/WalletSecretSeedForm';

import WalletCardDetails from '@/components/cards/WalletCardDetails';
import WalletCardBalances from '@/components/cards/WalletCardBalances';
import WalletDeposits from '@/components/cards/WalletDeposits';

import spinner from '@/components/ui/spinner';
import publicKey from '@/components/ui/publicKey';

export default {
  components: {
    ReceivePaymentForm,
    SendPaymentForm,
    WalletSecretSeedForm,
    WalletCardDetails,
    WalletCardBalances,
    WalletDeposits,
    spinner,
    publicKey
  },
  mixins: [ balanceMixin ],
  props: {
    data: {
      type: Object,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: undefined,
    },
  },
  data () {
    return {
      accountIDCopied: false,

      saveWalletLoading: false,
      setInflationDestLoading: false,
      walletDetailsLoading: false,
      fundWalletLoading: false,

      changellyModalVisible: false,
      depositModalVisible: false,
      receiveModalVisible: false,
      sendModalVisible: false,
      detailsModalVisible: false,

      changellyCurrency: 'USD',

      config
    };
  },
  computed: {
    ...mapGetters([
      'publicKeys',
      'sendPaymentStatus',
      'decryptedWallet',
      'exchanges',
      'finishedTransactions',
      'walletLoading'
    ]),
    wideCard () {
      return this.balances.length > 3;
    },
    currentWallet () {
      return this.data;
    },
    sendPaymentTransaction () {
      if (!this.sendPaymentStatus.res) return;
      const transactionId = this.sendPaymentStatus.res.transactionId;
      return this.finishedTransactions.find(tr => tr.id === transactionId);
    }
  },
  watch: {
    detailsModalVisible (visible) {
      if (!visible) {
        this.resetDecryptedWallet(); // clear revealed secret seed after closing modal
        this.$emit('recheck'); // hide wallet from dashboard screen if "Show wallet on home screen" was unchecked
      }
    },
  },
  methods: {
    ...mapActions([
      'setInflationDestination',
      'getWallets',
      'addCurrency',
      'removeCurrency',
      'fundAccountWithFriendbot',
      'sendPayment',
      'decryptWallet',
      'resetSendPayment',
      'updateWallets',
      'resetDecryptedWallet'
    ]),

    onShowChangelly (currency) {
      this.changellyCurrency = currency;
      this.depositModalVisible = false;
      this.changellyModalVisible = true;
    },

    onCopy () {
      this.accountIDCopied = true;
      setTimeout(() => { this.accountIDCopied = false; }, 2e3);
    },

    async onSendPaymentClick (data) {
      await this.sendPayment(data);
    },

    async onSetInflationDestination (data) {
      this.setInflationDestLoading = true;
      let secretSeed;
      if (data.password) {
        await this.decryptWallet({ publicKey: this.data.public_key, password: data.password });

        if (this.decryptedWallet.err) {
          this.setInflationDestLoading = false;
          return;
        }
        secretSeed = this.decryptedWallet.secretSeed;
        await this.resetDecryptedWallet();
      } else {
        secretSeed = data.signerSeed;
      }
      await this.setInflationDestination({
        publicKey: this.data.public_key,
        secretSeed,
        destination: data.destination,
      });
      this.setInflationDestLoading = false;
    },

    async onAddCurrency (data) {
      this.walletDetailsLoading = true;
      let secretSeed;
      if (data.password) {
        await this.decryptWallet({ publicKey: this.data.public_key, password: data.password });

        if (this.decryptedWallet.err) {
          this.walletDetailsLoading = false;
          return;
        }
        secretSeed = this.decryptedWallet.secretSeed;
        await this.resetDecryptedWallet();
      } else {
        secretSeed = data.signerSeed;
      }
      await this.addCurrency({
        publicKey: this.data.public_key,
        secretSeed,
        assetCode: data.assetCode,
        issuer: data.issuer,
      });
      this.walletDetailsLoading = false;
    },

    async onRemoveCurrency (data) {
      this.walletDetailsLoading = true;
      let secretSeed;
      if (data.password) {
        await this.decryptWallet({ publicKey: this.data.public_key, password: data.password });

        if (this.decryptedWallet.err) {
          this.walletDetailsLoading = false;
          return;
        }

        secretSeed = this.decryptedWallet.secretSeed;
        await this.resetDecryptedWallet();
      } else {
        secretSeed = data.signerSeed;
      }
      await this.removeCurrency({
        publicKey: this.data.public_key,
        secretSeed,
        assetCode: data.assetCode,
        issuer: data.issuer,
      });
      this.walletDetailsLoading = false;
    },
    async fundWithFriendbot () {
      this.fundWalletLoading = true;
      await this.fundAccountWithFriendbot(this.data.public_key);
      this.fundWalletLoading = false;
      this.depositModalVisible = false;
    },
    onDetailsClose (next) {
      this.detailsModalVisible = false;
      if (next === 'send') {
        this.sendModalVisible = true;
      } else if (next === 'receive') {
        this.receiveModalVisible = true;
      }
    },
    Amount
  }
};
</script>
