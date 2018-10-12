<template>
  <b-col :cols="wideCard ? 12 : 6" :md="wideCard ? 12 : 6" sm="8">
    <b-card :class="['p-4 my-1', 'card', {'card--wide': balances && balances.length > 1}]">
      <header>
        <h5><strong>{{ data.wallet_name }}</strong> WALLET</h5>
        <div style="margin-top: -6px; margin-bottom: 5px"> <!-- TODO -->
          <span v-if="!data.stellar_data" class="text-danger">not funded</span>
          <span v-else class="text-warning">{{ data.federation_address ? data.federation_address : 'no short address' }}</span>
        </div>
      </header>

      <wallet-card-balances :wide-card="wideCard" :balances="balances" :data="data"/>

      <div slot="footer">
        <footer v-if="!data.stellar_data">
          <div class="border-top pt-3 text-right">
            <a href="#" class="p-1" @click.prevent="$refs.fundWalletModal.show()">Fund Wallet</a>
          </div>
        </footer>

        <footer v-else-if="showActions">
          <div class="border-top pt-3 text-right">
            <!-- <a href="#" class="p-1" @click.prevent="$refs.infoModal.show()">Info</a> -->
            <a href="#" class="p-1" @click.prevent="resetSendPayment(), $refs.sendModal.show()">Send</a>
            <a href="#" class="p-1" @click.prevent="$refs.receiveModal.show()">Receive</a>
            <a href="#" class="p-1" @click.prevent="$refs.detailsModal.show()">Details</a>
          </div>
        </footer>
      </div>

      <b-modal ref="receiveModal" hide-footer title="Receive">
        <receive-payment-form :data="data" @cancel="$refs.receiveModal.hide()"/>
      </b-modal>

      <b-modal ref="sendModal" hide-footer title="Send">
        <send-payment-form
          v-if="data && balances"
          :balances="balances"
          :result="sendPaymentStatus.res"
          :loading="sendPaymentStatus.loading || decryptedWallet.loading"
          :data="data"
          :errors="sendPaymentStatus.err"
          :exchanges="exchanges"
          @reset="resetSendPayment"
          @close="$refs.sendModal.hide()"
          @submit="onSendPaymentClick"/>
      </b-modal>

      <b-modal ref="detailsModal" hide-footer title="Wallet details">
        <wallet-card-details
          :data="data"
          :balances="balances"
          :decrypt-wallet-loading="decryptedWallet.loading"
          :inflation-destination-loading="setInflationDestLoading"
          :wallet-details-loading="walletDetailsLoading"
          @setInflationDestination="onSetInflationDestination"
          @addCurrency="onAddCurrency"
          @removeCurrency="onRemoveCurrency"
          @openOperationsModal="data => {operationDetailsModalData = data, $refs.operationDetailsModal.show()}"
          @close="$refs.detailsModal.hide()"/>
      </b-modal>

      <b-modal ref="operationDetailsModal" title="Operation details">
        <pre>
          {{ JSON.stringify(operationDetailsModalData, null, 2) }}
        </pre>
      </b-modal>

      <link rel="stylesheet" href="https://changelly.com/widget.css"> <!-- needed by changelly modal -->

      <b-modal ref="fundWalletModal" :title="!config.IS_TEST_NETWORK ? 'Fund Wallet' : 'Fund Wallet via Friendbot'" hide-footer>
        <p class="text-center">
          <img v-if="!config.IS_TEST_NETWORK" src="@/assets/qr.svg"><br>
          <strong v-if="!config.IS_TEST_NETWORK">Account ID / Public key</strong>
          <strong v-else>Stellar test net public key</strong>
          <br><span class="text-wrap">{{ data.public_key_0 }}</span>
          <span v-if="accountIDCopied" class="text-info">Copied to clipboard<br></span>
          <a v-clipboard:copy="data.public_key_0" v-clipboard:success="onCopy" class="wallet-link">
            <i class="icon-copy" />
          </a>
        </p>
        <div v-if="!config.IS_TEST_NETWORK">
          <p>In order to prevent people from making a huge number of unnecessary accounts, each account in the stellar blockchain must have a minimum balance of 1 XLM (Stellar Lumen). Please send your Stellar Lumens (XLM) to the above displayed Account ID / Public key. At least 1 XLM is needed to fund your wallet in the stellar blockchain. We recommend a minimum of 2 XLM.</p>
          <p>Q: I don't have Stellar Lumens. Where can I get Stellar Lumens (XLM)?</p>
          <p>A: You can pay an exchange that sells lumens in order to fund your wallet.
          <a href="http://coinmarketcap.com/currencies/stellar/#markets" target="_blank">CoinMarketCap</a> maintains a list of exchanges that sell Stellar Lumens (XML). After purchasing the lumens withdraw them from the exchange to your wallet by sending them to the above displayed Account ID / Public key in order to fund your wallet.</p>
          <a id="changellyButton" :href="`https://changelly.com/widget/v1?auth=email&from=USD&to=XLM&merchant_id=dcaa3ae0e64f&address=${data.public_key_0}&amount=100&ref_id=dcaa3ae0e64f&color=00cf70`" target="_blank" @click.prevent="changellyModalVisible = true, $refs.fundWalletModal.hide()">
            <img src="https://changelly.com/pay_button_pay_with.png">
          </a>
        </div>
        <div v-else class="text-center">
          <p>This client operates on the test net. Do not send real Stellar Lumens from the main/public net. To fund your wallet for testing purposes we can kindly ask Friendbot to send you some test lumens. Please press the button below to receive the test net lumens from Freindbot.</p>
          <b-button v-if="!fundWalletLoading" variant="primary" @click.prevent="fundWithFriendbot">Fund with test lumens</b-button>
          <b-button v-else variant="primary"><i class="fa fa-spinner fa-spin fa-fw"/></b-button>
        </div>
      </b-modal>

      <div id="changellyModal" :style="{display: changellyModalVisible ? 'block' : 'none'}">
        <div class="changellyModal-content">
          <span class="changellyModal-close" @click="changellyModalVisible = false">x</span>
          <iframe :src="`https://changelly.com/widget/v1?auth=email&from=USD&to=XLM&merchant_id=dcaa3ae0e64f&address=${data.public_key_0}&amount=100&ref_id=dcaa3ae0e64f&color=00cf70`" width="600" height="500" class="changelly" scrolling="no" style="overflow-y: hidden; border: none">
            Can't load widget
          </iframe>
        </div>
      </div>

      <!-- <b-modal ref="infoModal" hide-footer title="Info">
        <p>This is a wallet card.</p>
        <p><strong>Wallet name</strong><br> Shows the name of your wallet in the title of the card. You can change the name by pressing the Details button.</p>
        <p><strong>Federation Address</strong><br> If this wallet is connected to a federation address, the address is displayed below of the name of the wallet. To add a federation address, pls press the Details button. To learn more about federation address please click here.</p>
        <p><strong>Balance</strong><br> Shows the overall balance of Stellar Lumens (XLM) that the wallet holds. If you have other curencies in this wallet, the card also shows their balances.</p>
        <p><strong>Base reserve</strong><br> In order to prevent people from making a huge number of unnecessary accounts, each account in the stellar blockchain must have a minimum balance of 1 XLM (Stellar Lumen) - also called base reserve. One can not spend the base reserve.</p>
        <p><strong>Transaction fee</strong><br> The amount of stellar lumens needed to perform a transaction, such as a payment transaction.</p>
        <p><strong>Available balance</strong><br> Shows the amount that can be spent. It is calculated by substracting the base reserve and stellar transaction fee from the overall balance.</p>
        <p><strong>Send</strong><br> Press the Send button to send lumens or other currencies form this wallet.</p>
        <p><strong>Receive</strong><br> Press the Receive button to receive lumens or other currencies to this wallet.</p>
        <p><strong>Details</strong><br> Press the Details button to see all details about your Wallet.</p>
      </b-modal> -->
    </b-card>
  </b-col>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import Amount from '@/util/Amount';
import ReceivePaymentForm from '@/components/forms/wallets/ReceivePaymentForm';
import SendPaymentForm from '@/components/forms/wallets/SendPaymentForm';
import WalletSecretSeedForm from '@/components/forms/wallets/WalletSecretSeedForm';

import WalletCardDetails from '@/components/cards/WalletCardDetails';
import WalletCardBalances from '@/components/cards/WalletCardBalances';

export default {
  components: {
    ReceivePaymentForm,
    SendPaymentForm,
    WalletSecretSeedForm,
    WalletCardDetails,
    WalletCardBalances,
  },
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

      operationDetailsModalData: null,

      config
    };
  },
  computed: {
    ...mapGetters(['userAuthData', 'publicKeys', 'sendPaymentStatus', 'decryptedWallet', 'exchanges']),
    wideCard () {
      return this.balances.length > 3;
    },
    minXLMBalance () {
      if (!this.data.stellar_data) return new Amount('0');
      const entryCount = this.data.stellar_data.subentry_count;
      const baseReserve = 0.5;
      const reserved = new Amount(`${(2 + entryCount) * baseReserve}`);
      const xlmBalance = this.data.stellar_data.balances.find(b => b.asset_type === 'native');
      const minBalance = xlmBalance.selling_liabilities ? reserved.minus(xlmBalance.selling_liabilities) : reserved;
      return minBalance;
    },
    balances () {
      if (!this.data.stellar_data) return [];
      const balances = this.data.stellar_data.balances;
      const xlmBalanceObject = balances.find(b => b.asset_type === 'native');
      const xlmBalance = new Amount(xlmBalanceObject.balance);
      const xlmAvailble = new Amount(xlmBalance).minus(this.minXLMBalance);

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
  methods: {
    ...mapActions([
      'getUserAuthData',
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
    },
    async onSendPaymentClick (data) {
      await this.sendPayment({ ...data, publicKey: this.data.public_key_0 });
    },
    async onSetInflationDestination (data) {
      this.setInflationDestLoading = true;
      let secretSeed;
      if (data.password) {
        await this.decryptWallet({ publicKey: this.data.public_key_0, password: data.password });

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
        publicKey: this.data.public_key_0,
        secretSeed,
        destination: data.destination,
      });
      this.setInflationDestLoading = false;
    },
    async onAddCurrency (data) {
      this.walletDetailsLoading = true;
      let secretSeed;
      if (data.password) {
        await this.decryptWallet({ publicKey: this.data.public_key_0, password: data.password });

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
        publicKey: this.data.public_key_0,
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
        await this.decryptWallet({ publicKey: this.data.public_key_0, password: data.password });

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
        publicKey: this.data.public_key_0,
        secretSeed,
        assetCode: data.assetCode,
        issuer: data.issuer,
      });
      this.walletDetailsLoading = false;
    },
    async fundWithFriendbot () {
      this.fundWalletLoading = true;
      await this.fundAccountWithFriendbot(this.data.public_key_0);
      this.fundWalletLoading = false;
      this.$refs.fundWalletModal.hide();
    },
    Amount
  }
};
</script>
