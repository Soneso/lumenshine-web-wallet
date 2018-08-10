<template>
  <div :class="['card', {'card--wide': balances && balances.length > 1}]">
    <header v-if="!data.stellar_data">
      <h3>{{ data.wallet_name }}</h3>
      <span class="error">(not funded)</span>
    </header>
    <header v-else>
      <h3>{{ data.wallet_name }}</h3>
      <span v-if="data.federation_address" class="warning card__federation-address">{{ data.federation_address }}{{ config.FEDERATION_DOMAIN }}</span>
    </header>
    <section>
      <h4>{{ balances && balances.length > 1 ? 'Balances' : 'Balance' }}</h4>
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
    </section>
    <section v-if="data.stellar_data">
      <h4>Available</h4>
      <table>
        <tr v-for="balance in avalaibleBalances" :key="balance.type + balance.issuer">
          <td>{{ balance.balance }}</td>
          <td>{{ balance.type }}</td>
        </tr>
      </table>
    </section>
    <footer v-if="!data.stellar_data">
      <div class="actions">
        <a href="#" @click.prevent="onFundWallet">Fund Wallet</a>
      </div>
    </footer>
    <footer v-else-if="showActions">
      <div class="help">
        <i class="fa fa-question-circle-o" />
      </div>
      <div class="actions">
        <a href="#" @click.prevent="onWalletInfo">Info</a>
        <a href="#" @click.prevent="openedDetails = 'send'">Send</a>
        <a href="#" @click.prevent="openedDetails = 'receive'">Receive</a>
        <a href="#" @click.prevent="openedDetails = 'details'">Details</a>
      </div>
    </footer>
    <div v-if="openedDetails === 'receive'" class="card__details">
      <h3>Receive <i data-v-221f4c5c="" class="fa fa-question-circle-o"/></h3>
      <a href="#" class="card__close" @click.prevent="openedDetails = null"><i data-v-221f4c5c="" class="fa fa-close"/></a>
      <receive-payment-form :data="data" @cancel="openedDetails = null"/>
    </div>
    <div v-if="openedDetails === 'send'" class="card__details">
      <h3>Send <i data-v-221f4c5c="" class="fa fa-question-circle-o"/></h3>
      <a href="#" class="card__close" @click.prevent="openedDetails = null"><i data-v-221f4c5c="" class="fa fa-close"/></a>
      <send-payment-form
        :result="sendPaymentStatus.res"
        :loading="sendPaymentStatus.loading || decryptedWallet.loading"
        :data="data"
        :errors="sendPaymentStatus.err"
        @reset="resetSendPayment"
        @close="openedDetails = null"
        @submit="onSendPaymentClick"/>
    </div>
    <wallet-card-details
      v-if="openedDetails === 'details'"
      :data="data"
      :balances="balances"
      :avalaible-balances="avalaibleBalances"
      :decrypt-wallet-loading="decryptedWallet.loading"
      :inflation-destination-loading="setInflationDestLoading"
      :wallet-details-loading="walletDetailsLoading"
      @setInflationDestination="onSetInflationDestination"
      @addCurrency="onAddCurrency"
      @removeCurrency="onRemoveCurrency"
      @close="(next) => openedDetails = next || null"/>

    <modal v-if="fundWalletModalShown" @close="onModalClose">
      <template slot="title">
        <span v-if="!config.IS_TEST_NETWORK">Fund Wallet</span>
        <span v-else>Fund Wallet via Friendbot</span>
      </template>

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
      </div>
      <div v-else class="form">
        <p>This client operates on the test net. Do not send real Stellar Lumens from the main/public net. To fund your wallet for testing purposes we can kindly ask Friendbot to send you some test lumens. Please press the button below to receive the test net lumens from Freindbot.</p>
        <button v-if="!fundWalletLoading" @click.prevent="fundWithFriendbot">Fund with test lumens</button>
        <button v-else><i class="fa fa-spinner fa-spin fa-fw"/></button>
      </div>
    </modal>
    <modal v-if="infoModalShown" @close="onModalClose">
      <template slot="title">
        Info
      </template>

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
    </modal>
  </div>
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
      fundWalletModalShown: false,
      infoModalShown: false,
      accountIDCopied: false,
      openedDetails: null,

      saveWalletLoading: false,
      setInflationDestLoading: false,
      walletDetailsLoading: false,
      fundWalletLoading: false,

      config
    };
  },
  computed: {
    ...mapGetters(['userAuthData', 'publicKeys', 'sendPaymentStatus', 'decryptedWallet']),
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
      return minBalance;
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
    onFundWallet (e) {
      this.fundWalletModalShown = true;
    },
    onWalletInfo (e) {
      this.infoModalShown = true;
    },
    onModalClose () {
      this.fundWalletModalShown = false;
      this.infoModalShown = false;
    },
    onCopy () {
      this.accountIDCopied = true;
    },
    async onSendPaymentClick (data) {
      await this.sendPayment({ ...data, publicKey: this.data.public_key_0, password: data.password });
    },
    async onSetInflationDestination (data) {
      this.setInflationDestLoading = true;
      await this.decryptWallet({ publicKey: this.data.public_key_0, password: data.password });

      if (this.decryptedWallet.err) {
        this.setInflationDestLoading = false;
        return;
      }
      const secretSeed = this.decryptedWallet.secretSeed;
      await this.resetDecryptedWallet();
      await this.setInflationDestination({
        publicKey: this.data.public_key_0,
        secretSeed,
        destination: this.inflationDest,
      });
      this.setInflationDestLoading = false;
    },
    async onAddCurrency (data) {
      this.walletDetailsLoading = true;
      await this.decryptWallet({ publicKey: this.data.public_key_0, password: data.password });

      if (this.decryptedWallet.err) {
        this.walletDetailsLoading = false;
        return;
      }
      const secretSeed = this.decryptedWallet.secretSeed;
      await this.resetDecryptedWallet();
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
      await this.decryptWallet({ publicKey: this.data.public_key_0, password: data.password });

      if (this.decryptedWallet.err) {
        this.walletDetailsLoading = false;
        return;
      }

      const secretSeed = this.decryptedWallet.secretSeed;
      await this.resetDecryptedWallet();
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
      this.fundWalletModalShown = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.centered {
  text-align: center;
}
.wallet-link {
  color: #222;
}
</style>
