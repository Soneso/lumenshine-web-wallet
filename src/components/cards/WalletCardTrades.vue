<template>
  <b-form class="form">
    <div v-for="trade in trades" :key="trade.id" class="transaction"> <!-- App transaction = Stellar operation != Stellar transaction -->
      <b-row>
        <b-col>
          Date: {{ moment(trade.ledger_close_time).format('DD MMM YYYY HH:mm:ss') }}<br>
        </b-col>
        <b-col>
          <div>Trade - ID:  <a href="#" @click.prevent="openedDetails = (openedDetails === trade.id ? null : trade.id)">{{ trade.id }}</a><br></div>
          <div>Offer - ID: {{ trade.offer_id }}<br></div>
          <div v-if="trade.counter_account === data.public_key">
            Amount received:
            <span class="text-success">
              {{ new Amount(trade.base_amount).format() }}
              {{ trade.base_asset_type === 'native' ? 'XLM' : trade.base_asset_code }}
            </span>
            <br>
            Amount sent:
            <span class="text-danger">
              -{{ new Amount(trade.counter_amount).format() }}
              {{ trade.counter_asset_type === 'native' ? 'XLM' : trade.counter_asset_code }}
            </span>
            <br>
          </div>
          <div v-else-if="trade.counter_account !== data.public_key">
            Amount received:
            <span class="text-success">
              {{ new Amount(trade.counter_amount).format() }}
              {{ trade.counter_asset_type === 'native' ? 'XLM' : trade.counter_asset_code }}
            </span>
            <br>
            Amount sent:
            <span class="text-danger">
              -{{ new Amount(trade.base_amount).format() }}
              {{ trade.base_asset_type === 'native' ? 'XLM' : trade.base_asset_code }}
            </span>
            <br>
          </div>
          <div :id="`trade-${trade.id}-details`" :class="['btn-rounded-lg', openedDetails === trade.id ? 'd-block' : 'd-none']">
            <pre style="font-size: 11px" class="p-2 mt-3 text-success bg-dark">{{ trade }}</pre>
          </div>
        </b-col>
      </b-row>
      <hr class="divider">
    </div>
    <b-row align-h="center">
      <b-col cols="6" md="4" class="text-center">
        <a v-if="!loading" href="#" @click.prevent="onLoadMore">Load more</a>
        <spinner v-else :size="21" width="180" message="Loading trades..."/>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import StellarSdk from 'stellar-sdk';
import moment from 'moment';

import Amount from '@/util/Amount';

import config from '@/config';

import spinner from '@/components/ui/spinner';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { spinner },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      trades: [],
      loading: false,
      openedDetails: null,
    };
  },

  async created () {
    this.loading = true;
    this.tradeQuery = await StellarAPI.trades()
      .forAccount(this.data.public_key)
      .order('desc')
      .limit(20)
      .call();
    await this.processTradeQuery();
    this.loading = false;
  },

  methods: {
    async processTradeQuery () {
      const trades = this.tradeQuery.records;
      this.trades = [...this.trades, ...trades];
    },
    async onLoadMore () {
      this.loading = true;
      this.tradeQuery = await this.tradeQuery.next();
      await this.processTradeQuery();
      this.loading = false;
    },
    moment,
    Amount
  },
};
</script>
