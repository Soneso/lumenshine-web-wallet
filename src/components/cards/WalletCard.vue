<template>
  <b-col :md="wideCard ? 12 : 6" cols="12" class="px-1 mb-2">
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

      <wallet-card-balances :wide-card="wideCard" :balances="balances" :data="data"/>

      <b-row slot="footer">
        <b-col>
          <template v-if="!data.stellar_data">
            <div class="mx-2 py-2 text-right">
              <a href="#" class="p-1" @click.prevent="fundWalletModalVisible = true">Fund Wallet</a>
            </div>
          </template>

          <template v-else-if="showActions">
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
        @close="detailsModalVisible = false"/>
    </b-modal>

    <b-modal v-model="fundWalletModalVisible" :title="!config.IS_TEST_NETWORK ? 'Fund Wallet' : 'Fund Wallet via Friendbot'" size="sm" hide-footer>
      <div class="text-center">
        <img v-if="!config.IS_TEST_NETWORK" src="@/assets/qr.svg" class="bar-code-img pt-3 pb-4"><br>
        <div v-if="!config.IS_TEST_NETWORK" class="font-weight-600">Account ID / Public key</div>
        <div v-else class="font-weight-600">Stellar test net public key</div>
        <br>
        <div class="break-word with-hyphens">
          {{ data.public_key }}
          <copy-to-clipboard :text="data.public_key"/>
          <small v-if="accountIDCopied" class="text-info">Copied to clipboard<br></small>
        </div>

      </div>
      <div v-if="!config.IS_TEST_NETWORK">
        <p>In order to prevent people from making a huge number of unnecessary accounts, each account in the stellar blockchain must have a minimum balance of 1 XLM (Stellar Lumen). Please send your Stellar Lumens (XLM) to the above displayed Account ID / Public key. At least 1 XLM is needed to fund your wallet in the stellar blockchain. We recommend a minimum of 2 XLM.</p>
        <p>Q: I don't have Stellar Lumens. Where can I get Stellar Lumens (XLM)?</p>
        <p> A: You can pay an exchange that sells lumens in order to fund your wallet. <a href="http://coinmarketcap.com/currencies/stellar/#markets" target="_blank">CoinMarketCap</a> maintains a list of exchanges that sell Stellar Lumens (XML). After purchasing the lumens withdraw them from the exchange to your wallet by sending them to the above displayed Account ID / Public key in order to fund your wallet.</p>
        <a id="changellyButton" :href="`https://changelly.com/widget/v1?auth=email&from=USD&to=XLM&merchant_id=dcaa3ae0e64f&address=${data.public_key}&amount=100&ref_id=dcaa3ae0e64f&color=00cf70`" target="_blank" @click.prevent="changellyModalVisible = true, fundWalletModalVisible = false">
          <img src="https://changelly.com/pay_button_pay_with.png">
        </a>
      </div>
      <div v-else class="text-center pt-3">
        <small>This client operates on the test net. Do not send real Stellar Lumens from the main/public net. To fund your wallet for testing purposes we can kindly ask Friendbot to send you some test lumens. Please press the button below to receive the test net lumens from Freindbot.</small>
        <br>
        <b-button v-if="!fundWalletLoading" variant="primary" class="btn-rounded my-3" @click.prevent="fundWithFriendbot">
          Fund with test lumens
        </b-button>
        <b-button v-else variant="primary" class="btn-rounded my-3">
          <spinner :size="24" variant="white" message="funding..." width="90"/>
        </b-button>
      </div>
    </b-modal>

    <div v-if="!config.IS_TEST_NETWORK" id="changellyModal" :style="{display: changellyModalVisible ? 'block' : 'none'}">
      <div class="changellyModal-content">
        <span class="changellyModal-close" @click="changellyModalVisible = false">x</span>
        <iframe :src="`https://changelly.com/widget/v1?auth=email&from=USD&to=XLM&merchant_id=dcaa3ae0e64f&address=${data.public_key}&amount=100&ref_id=dcaa3ae0e64f&color=00cf70`" width="600" height="500" class="changelly" scrolling="no" style="overflow-y: hidden; border: none">
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

import spinner from '@/components/ui/spinner1.vue';
import copyToClipboard from '@/components/ui/copyToClipboard.vue';

export default {
  components: {
    ReceivePaymentForm,
    SendPaymentForm,
    WalletSecretSeedForm,
    WalletCardDetails,
    WalletCardBalances,
    spinner,
    copyToClipboard
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
  },
  data () {
    return {
      accountIDCopied: false,

      saveWalletLoading: false,
      setInflationDestLoading: false,
      walletDetailsLoading: false,
      fundWalletLoading: false,

      changellyModalVisible: false,
      fundWalletModalVisible: false,
      receiveModalVisible: false,
      sendModalVisible: false,
      detailsModalVisible: false,

      config
    };
  },
  computed: {
    ...mapGetters(['publicKeys', 'sendPaymentStatus', 'decryptedWallet', 'exchanges', 'transactions']),
    wideCard () {
      return this.balances.length > 3;
    },
    currentWallet () {
      return this.data;
    },
    sendPaymentTransaction () {
      if (!this.sendPaymentStatus.res) return;
      const transactionId = this.sendPaymentStatus.res.transactionId;
      return this.transactions.find(tr => tr.id === transactionId);
    }
  },
  watch: {
    detailsModalVisible (visible) {
      if (!visible) {
        this.resetDecryptedWallet(); // clear revealed secret seed after closing modal
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
    onCopy () {
      this.accountIDCopied = true;
      setTimeout(() => {
        this.accountIDCopied = false;
      }, 2e3);
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
      this.fundWalletModalVisible = false;
    },
    Amount
  }
};
</script>
