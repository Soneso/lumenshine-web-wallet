<template>
  <div>
    <b-modal v-model="fundWalletModalVisible" :title="!config.IS_TEST_NETWORK ? 'Fund Wallet' : 'Fund Wallet via Friendbot'" size="sm" hide-footer>
      <div class="text-center">
        <img v-if="!config.IS_TEST_NETWORK" src="@/assets/qr.svg" class="bar-code-img pt-3 pb-4"><br>
        <div v-if="!config.IS_TEST_NETWORK" class="font-weight-600">Account ID / Public key</div>
        <div v-else class="font-weight-600">Stellar test net public key</div>
        <br>
        <div class="break-word with-hyphens">
          <public-key :text="data.public_key"/>
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
      <div v-else class="text-center pt-3"> <!-- config.IS_TEST_NETWORK -->
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
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import config from '@/config';

export default {
  name: 'WalletDeposits',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      config,

      fundWalletLoading: false,
      fundWalletModalVisible: true,
    };
  },

  computed: {

  },

  methods: {
    ...mapActions([
      'fundAccountWithFriendbot',
    ]),
    async fundWithFriendbot () {
      this.fundWalletLoading = true;
      await this.fundAccountWithFriendbot(this.data.public_key);
      this.fundWalletLoading = false;
      this.fundWalletModalVisible = false;
    },
  }
};
</script>
