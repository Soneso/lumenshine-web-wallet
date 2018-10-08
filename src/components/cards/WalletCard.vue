<template>
  <b-col cols="6" sm="8" md="6" lg="6" xl="6">
    <b-card :class="['p-4 my-1', 'card', {'card--wide': balances && balances.length > 1}]">
      <header v-if="!data.stellar_data">
        <h3>{{ data.wallet_name }} WALLET</h3>
        <span class="text-danger">not funded</span>
      </header>

      <header v-else>
        <h3>{{ data.wallet_name }} WALLET</h3>
        <span v-if="data.federation_address" class="warning card__federation-address">{{ data.federation_address }}</span>
      </header>

      <b-card-group deck>
        <b-card :bg-variant="data.stellar_data ? 'success' : 'danger'" :style="{'max-width': data.stellar_data ? null : '25%'}" text-variant="white">
          <h4 class="text-uppercase">{{ balances && balances.length > 1 ? 'Balances' : 'Balance' }}</h4>
          <p v-if="!data.stellar_data">0.0 <small>XLM</small></p>
          <ul v-else class="list-unstyled">
            <li v-for="balance in balances" :key="balance.type + balance.issuer">
              {{ balance.balance }} <small>{{ balance.type }}</small>
            </li>
          </ul>
        </b-card>

        <b-card v-if="data.stellar_data">
          <h4 class="text-info text-uppercase">Available</h4>
          <ul class="list-unstyled">
            <li v-for="balance in avalaibleBalances" :key="balance.type + balance.issuer">
              {{ balance.balance }} <small>{{ balance.type }}</small>
            </li>
          </ul>
        </b-card>
      </b-card-group>

      <div slot="footer">
        <footer v-if="!data.stellar_data">
          <div class="actions">
            <a href="#" @click.prevent="$refs.fundWalletModal.show()">Fund Wallet</a>
          </div>
        </footer>

        <footer v-else-if="showActions">
          <div class="actions">
            <a href="#" @click.prevent="$refs.infoModal.show()">Info</a>
            <a href="#" @click.prevent="$refs.sendModal.show()">Send</a>
            <a href="#" @click.prevent="$refs.receiveModal.show()">Receive</a>
            <a href="#" @click.prevent="$refs.detailsModal.show()">Details</a>
          </div>
        </footer>
      </div>

      <b-modal ref="receiveModal" hide-footer title="Receive">
        <receive-payment-form :data="data" @cancel="$refs.receiveModal.hide()"/>
      </b-modal>

      <b-modal ref="sendModal" hide-footer title="Send">
        <send-payment-form
          v-if="data"
          :result="sendPaymentStatus.res"
          :loading="sendPaymentStatus.loading || decryptedWallet.loading"
          :data="data"
          :errors="sendPaymentStatus.err"
          :exchanges="exchanges"
          @reset="resetSendPayment"
          @close="$refs.sendModal.hide()"
          @submit="onSendPaymentClick"/>
      </b-modal>

      <b-modal ref="detailsModal" hide-footer title="Details">
        <wallet-card-details
          :data="data"
          :balances="balances"
          :avalaible-balances="avalaibleBalances"
          :decrypt-wallet-loading="decryptedWallet.loading"
          :inflation-destination-loading="setInflationDestLoading"
          :wallet-details-loading="walletDetailsLoading"
          @setInflationDestination="onSetInflationDestination"
          @addCurrency="onAddCurrency"
          @removeCurrency="onRemoveCurrency"
          @close="$refs.detailsModal.hide()"/>
      </b-modal>

      <link rel="stylesheet" href="https://changelly.com/widget.css"> <!-- needed by changelly modal -->

      <b-modal ref="fundWalletModal" :title="!config.IS_TEST_NETWORK ? 'Fund Wallet' : 'Fund Wallet via Friendbot'" hide-footer>
        <p class="centered">
          <img v-if="!config.IS_TEST_NETWORK" src="@/assets/qr.svg"><br>
          <span v-if="accountIDCopied" class="copiedtext info">Copied to clipboard<br></span>
          <strong v-if="!config.IS_TEST_NETWORK">Account ID / Public key</strong>
          <strong v-else>Stellar test net public key</strong>
          <br> {{ data.public_key_0 }}
          <a v-clipboard:copy="data.public_key_0" v-clipboard:success="onCopy" class="wallet-link">
            <i class="fa fa-clone" />
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
        <div v-else class="form">
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

      <b-modal ref="infoModal" hide-footer title="Info">
        <p>This is a wallet card.</p>
        <p>Wallet name<br> Shows the name of your wallet in the title of the card. You can change the name by pressing the Details button.</p>
        <p>Federation Address<br> If this wallet is connected to a federation address, the address is displayed below of the name of the wallet. To add a federation address, pls press the Details button. To learn more about federation address please click here.</p>
        <p>Balance<br> Shows the overall balance of Stellar Lumens (XLM) that the wallet holds. If you have other curencies in this wallet, the card also shows their balances.</p>
        <p>Base reserve<br> In order to prevent people from making a huge number of unnecessary accounts, each account in the stellar blockchain must have a minimum balance of 1 XLM (Stellar Lumen) - also called base reserve. One can not spend the base reserve.</p>
        <p>Transaction fee<br> The amount of stellar lumens needed to perform a transaction, such as a payment transaction.</p>
        <p>Available balance<br> Shows the amount that can be spent. It is calculated by substracting the base reserve and stellar transaction fee from the overall balance.</p>
        <p>Send<br> Press the Send button to send lumens or other currencies form this wallet.</p>
        <p>Receive<br> Press the Receive button to receive lumens or other currencies to this wallet.</p>
        <p>Details<br> Press the Details button to see all details about your Wallet.</p>
      </b-modal>
    </b-card>
  </b-col>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import config from '@/config';

import Amount from '@/util/Amount';
import Modal from '@/components/Modal';
import ReceivePaymentForm from '@/components/forms/wallets/ReceivePaymentForm';
import SendPaymentForm from '@/components/forms/wallets/SendPaymentForm';
import WalletSecretSeedForm from '@/components/forms/wallets/WalletSecretSeedForm';

import WalletCardDetails from '@/components/cards/WalletCardDetails';

export default {
  components: {
    Modal,
    ReceivePaymentForm,
    SendPaymentForm,
    WalletSecretSeedForm,
    WalletCardDetails,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    }
  },
  data () {
    return {
      accountIDCopied: false,

      saveWalletLoading: false,
      setInflationDestLoading: false,
      walletDetailsLoading: false,
      fundWalletLoading: false,

      changellyModalVisible: false,

      config
    };
  },
  computed: {
    ...mapGetters(['userAuthData', 'publicKeys', 'sendPaymentStatus', 'decryptedWallet', 'exchanges']),
    balances () {
      if (!this.data.stellar_data) return [];
      const balances = this.data.stellar_data.balances;
      const xlmBalance = { balance: new Amount(balances.find(b => b.asset_type === 'native').balance).format(), type: 'XLM' };

      const otherBalances = balances.filter(b => b.asset_type !== 'native');
      return [xlmBalance, ...otherBalances.map(bal => ({ balance: new Amount(bal.balance).format(), type: bal.asset_code, issuer: bal.asset_issuer }))];
    },
    minBalance () {
      if (!this.data.stellar_data) return new Amount('0');
      const entryCount = this.data.stellar_data.subentry_count;
      const baseReserve = 0.5;
      const minBalance = new Amount(`${(2 + entryCount) * baseReserve}`);
      return minBalance.plus('0.00001'); // transaction cost
    },
    avalaibleBalances () {
      if (!this.data.stellar_data) return [];
      const balances = this.data.stellar_data.balances;
      const xlmBalance = { balance: new Amount(balances.find(b => b.asset_type === 'native').balance), type: 'XLM' };

      const xlmAvailble = { balance: new Amount(xlmBalance.balance).minus(this.minBalance).format(), type: 'XLM' };

      const otherBalances = balances.filter(b => b.asset_type !== 'native');
      return [xlmAvailble, ...otherBalances.map(bal => ({ balance: new Amount(bal.balance).format(), type: bal.asset_code, issuer: bal.asset_issuer }))];
    }
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
    }
  }
};
</script>
