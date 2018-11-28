<template>
  <b-col md="6" cols="12" class="px-1 mb-2">
    <b-card class="card-normal">
      <b-row class="card-header">
        <b-col>
          <h6 class="mb-0">
            <span class="font-weight-700">Stellar Lumens (XLM)</span>
            <div>{{ periodValues.find(v => v.value === period).text }} - updated {{ timeSinceUpdate }}</div>
          </h6>
        </b-col>
      </b-row>

      <div class="chart-wrapper" style="height: 150px" @mouseleave="currentValue = null">
        <spinner v-if="currencyRateHistory.loading"/>
        <currency-chart v-else-if="currencyRateHistory.res" :chart-data="datacollection" :options="chartOptions" :height="150"/>
      </div>

      <div class="chart-legend px-2">
        <div v-if="currencyRateHistory.res" class="mx-2 float-left">
          {{ currentValue || currencyRateHistory.res.rates[currencyRateHistory.res.rates.length - 1].rate }} USD
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
            <a href="#" class="px-1 font-weight-600" @click.prevent="loadData">Refresh</a>
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
import { clearInterval, setInterval } from 'timers';

export default {
  components: {
    CurrencyChart,
    spinner,
  },

  data () {
    return {
      datacollection: null,
      currentValue: null,
      currentIncrease: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: false,
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItems, data) => {
              this.currentValue = tooltipItems.yLabel;
              return tooltipItems.yLabel + ' $';
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
              drawBorder: false,
            },
          }]
        },
      },
      period: 7 * 24, // 7 days
      periodValues: [
        { value: 1, text: '1 hour' },
        { value: 24, text: '24 hours' },
        { value: 7 * 24, text: '7 days' },
        { value: 31 * 24, text: '1 month' },
        { value: 6 * 31 * 24, text: '6 months' },
        { value: 365 * 24, text: '1 year' },
      ],
      now: dayjs(),
      nowTimer: null,
      config
    };
  },

  computed: {
    ...mapGetters([
      'currencyRateHistory',
    ]),
    timeSinceUpdate () {
      if (!this.currencyRateHistory.res) return '';
      const updatedAt = dayjs(this.currencyRateHistory.res.last_updated + ' GMT');
      if (this.now.diff(updatedAt, 'month') > 1) {
        return `${this.now.diff(updatedAt, 'month')} months ago`;
      }
      if (this.now.diff(updatedAt, 'month') === 1) {
        return '1 month ago';
      }
      if (this.now.diff(updatedAt, 'day') > 1) {
        return `${this.now.diff(updatedAt, 'day')} days ago`;
      }
      if (this.now.diff(updatedAt, 'day') === 1) {
        return '1 day ago';
      }
      if (this.now.diff(updatedAt, 'hour') > 1) {
        return `${this.now.diff(updatedAt, 'hour')} hours ago`;
      }
      if (this.now.diff(updatedAt, 'hour') === 1) {
        return '1 hour ago';
      }
      if (this.now.diff(updatedAt, 'minute') > 1) {
        return `${this.now.diff(updatedAt, 'minute')} minutes ago`;
      }
      if (this.now.diff(updatedAt, 'minute') === 1) {
        return '1 minute ago';
      }
      if (this.now.diff(updatedAt, 'second') > 5) {
        return `${this.now.diff(updatedAt, 'second')} seconds ago`;
      }
      return 'few seconds ago';
    },
    changePercentage () {
      if (!this.currencyRateHistory.res) return '';
      const old = this.currencyRateHistory.res.rates[0].rate;
      const current = this.currencyRateHistory.res.rates[this.currencyRateHistory.res.rates.length - 1].rate;
      return ((current / old - 1) * 100).toFixed(2);
    },
  },

  watch: {
    currencyRateHistory () {
      this.fillData();
    },
    period () {
      this.loadData();
    }
  },

  async mounted () {
    await this.loadData();
    this.fillData();
    this.nowTimer = setInterval(() => { this.now = dayjs(); }, 5000);
  },

  beforeDestroy () {
    if (this.nowTimer) {
      clearInterval(this.nowTimer);
    }
  },

  methods: {
    ...mapActions([
      'getCurrencyRateHistory',
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
    },

    fillData () {
      if (!this.currencyRateHistory.res) return;
      this.datacollection = {
        labels: this.currencyRateHistory.res.rates.map(x => dayjs(x.date + ' GMT').format('YYYY-MM-DD HH:mm')),
        datasets: [
          {
            label: 'XLM',
            fill: false,
            borderColor: '#3AACE2',
            data: this.currencyRateHistory.res.rates.map(x => x.rate),
          },
        ]
      };
    },
  }
};
</script>
