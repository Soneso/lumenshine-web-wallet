<template>
  <div class="p-4">
    <div v-if="!config.IS_TEST_NETWORK"> <!-- Live net -->
      <div v-if="step === 'main'">
        <h4 class="font-weight-700 mb-3">WHAT WOULD YOU LIKE TO DEPOSIT?</h4>
        <p>Lumenshine accepts Stellar Lumens (XLM). But you can also use Changelly, our cross-chain exchange provider to convert funds to XLM.</p>
        <!-- <b-button variant="info" class="btn-rounded my-3" @click.prevent="step = 'usd'">USD</b-button> -->
        <b-button variant="info" class="btn-rounded my-3 mx-1" @click.prevent="step = 'xlm'">XLM</b-button>
        <b-button variant="info" class="btn-rounded my-3 mx-1" @click.prevent="step = 'other'">Other currency</b-button>
      </div>

      <div v-else-if="step === 'usd'">
        <p class="font-weight-700">Deposit with ANCHORUSD</p>
        <p>You can deposits US dollar via <a href="https://www.anchorusd.com/" target="_blank" rel="noopener">AnchorUSD</a>, the first platform on Stellar to offer the convenience of direct ACH debit. You’ll need to submit some basic identity information to them and their banking partner, which takes just a few seconds.</p>
        <p>Then you can connect your bank and begin depositing USD directly to your Stellar account. The minimum cash deposit is 1000 USD, and AnchorUSD charges a flat 25 USD fee for the service.</p>
        <!-- <a href="#" target="_blank" class="changelly-button" @click.prevent="$emit('changelly', 'USD')">
          <img src="@/assets/images/ui/pay-with-changelly.png">
        </a> -->
      </div>

      <div v-else-if="step === 'xlm'">
        <h4 class="font-weight-700 mb-3">XLM</h4>
        <p class="my-1">Funding with XLM is free and only takes a few seconds to confirm.</p>
        <p class="mb-3">{{ !data.federation_address ? 'Send XLM to the below displayed public key of your wallet.' : 'Send XLM to the below displayed public key or stellar address of your wallet.' }}</p>
        <b-card class="flat-card">
          <b-row>
            <b-col>
              <div :class="['break-word with-hyphens', data.federation_address ? 'my-3' : 'my-4']">
                <div class="my-2"><strong>Public key: </strong><public-key :text="data.public_key"/></div>
                <div v-if="data.federation_address" class="my-2"><strong>Stellar address: </strong><span>{{ data.federation_address }}</span></div>
              </div>
            </b-col>
            <b-col cols="3" class="text-right">
              <qrcode :options="{ width: 88, margin: 0 }" :value="data.public_key" class="bar-code-img"/>
            </b-col>
          </b-row>
        </b-card>
        <span class="mx-1"><b-button variant="info" class="btn-rounded my-3" @click.prevent="step = 'main'">Back</b-button></span>
        <span class="mx-1"><b-button variant="success" class="btn-rounded my-3" @click.prevent="$emit('close')">OK, done</b-button></span>
      </div>
      <div v-else-if="step === 'other'">
        <h4 class="font-weight-700 mb-3">Other Currency</h4>
        <p>Lumenshine uses Changelly as a cross-chain exchange provider. They convert your funds to XLM at the best rates by bidding out your order worldwide. They charge 0.5% for the conversion.</p>
        <span class="mx-1"><b-button variant="info" class="btn-rounded my-3" @click.prevent="step = 'main'">Back</b-button></span>
        <a href="#" target="_blank" class="changelly-button" @click.prevent="$emit('changelly', 'BTC')">
          <img src="@/assets/images/ui/pay-with-changelly.png">
        </a>
      </div>
    </div>

    <div v-if="config.IS_TEST_NETWORK" class="pt-3">
      <p class="font-weight-700">Stellar test net public key</p>
      <div class="break-word with-hyphens my-1">
        <public-key :text="data.public_key"/>
      </div>
      <small>This client operates on the test net. Do not send real Stellar Lumens from the main/public net. To fund your wallet for testing purposes we can kindly ask Friendbot to send you some test lumens. Please press the button below to receive the test net lumens from Freindbot.</small>
      <br>
      <b-button v-if="!fundWalletLoading" variant="info" class="btn-rounded my-3" @click.prevent="fundWithFriendbot">
        Fund with test lumens
      </b-button>
      <b-button v-else variant="info" class="btn-rounded my-3">
        <spinner :size="24" variant="white" message="funding..." width="90"/>
      </b-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import config from '@/config';

import spinner from '@/components/ui/spinner';
import publicKey from '@/components/ui/publicKey';

export default {
  name: 'WalletDeposits',
  components: { spinner, publicKey },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      step: 'main',

      fundWalletLoading: false,
      fundWalletModalVisible: true,
    };
  },

  created () {
    this.config = config;
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
