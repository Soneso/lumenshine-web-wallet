<template>
  <b-col style="order:2" md="6" cols="12" class="px-1 mb-2">
    <b-card class="card-normal">
      <b-row class="card-header">
        <b-col>
          <h6 class="mb-0">
            <span class="font-weight-700">Stellar Lumens (XLM)</span>
            <small class="d-block pt-1">{{ periodValues.find(v => v.value === period).text }} - {{ timeSinceUpdate }}</small>
          </h6>
        </b-col>
      </b-row>

      <div class="chart-wrapper" style="height: 150px">
        <spinner v-if="currencyRateHistory.loading"/>
        <currency-chart v-else-if="currencyRateHistory.res" :chart-data="dataCollection" :options="chartOptions" :height="150"/>
      </div>

      <div class="chart-legend px-2">
        <div v-if="currencyRateHistory.res" class="mx-2 float-left">
          {{ currencyRateHistory.res.current_rate.toFixed(4) }} USD
        </div>
        <div class="mx-2 float-right">
          {{ changePercentage }} %
        </div>
      </div>

      <b-row slot="footer">
        <b-col>
          <div class="mx-2 float-left">
            <b-form-select v-model="period" :options="periodValues"/>
          </div>
          <div class="mx-2 py-2 text-right">
            <a href="#" class="px-1" @click.prevent="loadData">Refresh</a>
          </div>
        </b-col>
      </b-row>
    </b-card>
  </b-col>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';

import config from '@/config';

import Amount from '@/util/Amount';

import spinner from '@/components/ui/spinner';
import CurrencyChart from '@/components/ui/currencyChart';

export default {
  components: {
    CurrencyChart,
    spinner,
  },

  data () {
    return {
      // datacollection: null,
      currentIncrease: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: false,
        tooltips: {
          mode: 'index',
          intersect: false,
          displayColors: false,
          callbacks: {
            label: (tooltipItems, data) => {
              return tooltipItems.yLabel + ' USD';
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: false,
            },
            ticks: {
              display: false,
            },
            gridLines: {
              color: 'rgba(0, 0, 0, 0.05)',
              zeroLineWidth: 0,
              zeroLineColor: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false,
            },
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: false,
            },
            ticks: {
              display: false,
            },
            gridLines: {
              color: 'rgba(0, 0, 0, 0.05)',
              zeroLineWidth: 0,
              zeroLineColor: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false,
            },
          }]
        },
      },
      period: 6,
      periodValues: [
        { value: 1, text: '1 hour' },
        { value: 6, text: '6 hours' },
        { value: 24, text: '24 hours' },
        { value: 7 * 24, text: '7 days' },
        { value: 31 * 24, text: '1 month' },
        { value: 365 / 2 * 24, text: '6 months' },
        { value: 365 * 24, text: '1 year' },
      ],
      now: dayjs(),
      nowTimer: null,
      refreshTimer: null,
      lastUpdate: null,
      config
    };
  },

  computed: {
    ...mapGetters([
      'currencyRateHistory',
    ]),
    timeSinceUpdate () {
      if (!this.lastUpdate) return '';
      const minuteDiff = this.now.diff(this.lastUpdate, 'minute');
      if (minuteDiff > 1) {
        return `updated ${minuteDiff} minutes ago`;
      }
      if (minuteDiff === 1) {
        return 'updated 1 minute ago';
      }
      return 'updated just now';
    },
    changePercentage () {
      if (!this.currencyRateHistory.res) return '';
      const old = this.currencyRateHistory.res.rates[0].rate;
      const current = this.currencyRateHistory.res.current_rate;
      return ((current / old - 1) * 100).toFixed(2);
    },
    dataCollection () {
      if (!this.currencyRateHistory.res) return {};
      return {
        labels: this.currencyRateHistory.res.rates.map(x => dayjs(x.date + ' GMT').format('YYYY-MM-DD HH:mm')),
        datasets: [
          {
            label: 'XLM',
            fill: false,
            borderColor: '#3AACE2',
            ...(this.period < 2 * 31 * 24 ? { pointBorderColor: '#FFFFFF' } : { pointRadius: 0 }),
            pointHitRadius: 10,
            pointHoverBackgroundColor: '#FBB03B',
            data: this.currencyRateHistory.res.rates.map(x => x.rate.toFixed(4)),
          },
        ]
      };
    },
  },

  watch: {
    period () {
      this.loadData();
    }
  },

  async mounted () {
    await this.loadData();
    this.nowTimer = setInterval(() => { this.now = dayjs(); }, 5 * 1000);
    this.refreshTimer = setInterval(() => { this.refreshData(); }, 5 * 60 * 1000);
  },

  beforeDestroy () {
    if (this.nowTimer) {
      clearInterval(this.nowTimer);
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  },

  methods: {
    ...mapActions([
      'getCurrencyRateHistory',
      'refreshCurrencyRateHistory',
    ]),
    Amount,
    async loadData () {
      await this.getCurrencyRateHistory({
        source_currency: {
          asset_code: 'XLM',
          issuer_public_key: '',
        },
        destination_currency: 'USD',
        range_hours: this.period,
      });
      this.lastUpdate = dayjs();
    },
    async refreshData () {
      await this.refreshCurrencyRateHistory({
        source_currency: {
          asset_code: 'XLM',
          issuer_public_key: '',
        },
        destination_currency: 'USD',
        range_hours: this.period,
      });
      this.lastUpdate = dayjs();
    },
  }
};
</script>
