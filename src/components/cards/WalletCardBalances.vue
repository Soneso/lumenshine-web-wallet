<template>
  <b-row class="balance-row">
    <b-col v-for="balanceLine in balanceRows" :key="JSON.stringify(balanceLine)" cols="12">
      <b-row class="balance-line">
        <template v-for="balances in balanceLine">

          <b-col
            :key="balances.map(b => 'b' + b.type + b.issuer).join('')"
            :cols="data.stellar_data ? 12 : 10"
            :sm="data.stellar_data ? 6 : 5"
            :md="data.stellar_data ? (wideCard ? 6 : 12) : 9"
            :lg="data.stellar_data ? (wideCard ? 3 : 6) : 5"
            class="balance-list current">

            <div :class="data.stellar_data ? 'bg-success' : 'bg-danger'">
              <h6>{{ balances && balances.length > 1 ? 'Balances' : 'Balance' }}</h6>
              <p v-if="!data.stellar_data">{{ new Amount('0').format() }} <small>XLM</small></p>

              <ul v-else>
                <li v-for="item in balances" :key="'b' + item.type + item.issuer" class="font-weight-300">
                  {{ item.balance }} <small class="font-weight-600">{{ item.type }}</small>
                </li>
              </ul>
            </div>

          </b-col>

          <b-col
            v-if="data.stellar_data" :key="balances.map(b => 'a' + b.type + b.issuer).join('')"
            :md="wideCard ? 6 : 12"
            :lg="wideCard ? 3 : 6"
            :class="['balance-list', 'available', {'pl-sm-3 pl-md-2 pl-lg-3': !wideCard, 'pl-sm-3': wideCard}]"
            cols="12"
            sm="6">

            <div>
              <h6 class="text-info">Available</h6>

              <ul>
                <li v-for="item in balances" :key="'a' + item.type + item.issuer">
                  {{ item.available }} <small>{{ item.type }}</small>
                  <i
                    v-b-popover.hover.html="getAvailablePopup(item)"
                    v-if="item.available !== item.balance"
                    :title="`Available ${item.type}`"
                    class="icon-help"/>
                </li>
              </ul>
            </div>

          </b-col>

        </template>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
import Amount from '@/util/Amount';
import config from '@/config';

export default {
  props: {
    wideCard: {
      type: Boolean,
      required: true,
    },
    balances: {
      type: Array,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    }
  },
  computed: {
    balanceGroups () {
      const groups = [];
      const maxItems = 3;
      for (let i = 0; i < this.balances.length; i += maxItems) {
        groups.push(this.balances.slice(i, i + maxItems));
      }
      if (groups.length === 0) { /* for empty box */
        groups.push([{ balance: 0 }]);
      }
      return groups;
    },
    balanceRows () {
      const rows = [];
      const maxItems = 2;
      for (let i = 0; i < this.balanceGroups.length; i += maxItems) {
        rows.push(this.balanceGroups.slice(i, i + maxItems));
      }
      return rows;
    }
  },
  methods: {
    getAvailablePopup (balance) {
      const baseReserve = parseFloat(config.STELLAR_BASE_RESERVE);
      if (!this.data.stellar_data) return '';

      if (balance.type === 'XLM') {
        const header = `
          <strong>Minimum balance</strong>
          <p>All Stellar accounts/wallets must maintain a minimum balance of lumens that can not be spent. The minimum balance for a basic account is ${(2 * baseReserve).toFixed(1)} XLM. Additional entries such as trustlines for other currencies and additional signers increase the minimum balance.</p>
          <p>The minimum balance for this account is:</p>
        `;

        const trustlines = this.data.stellar_data.balances.length - 1;
        const signers = this.data.stellar_data.signers.length - 1;
        const dataEntries = Object.keys(this.data.stellar_data.data_attr).length;
        const offers = this.data.stellar_data.subentry_count - trustlines - signers - dataEntries;
        const items = [
          `${(2 * baseReserve).toFixed(2)} XLM - account reserve`,
          ...trustlines > 0 ? (trustlines === 1 ? [`${baseReserve.toFixed(2)} XLM - 1 trustline to other currency`] : [`${(trustlines * baseReserve).toFixed(2)} XLM - ${trustlines} trustlines to other currencies`]) : [],
          ...signers > 0 ? (signers === 1 ? [`${baseReserve.toFixed(2)} XLM - 1 additional signer`] : [`${(signers * baseReserve).toFixed(2)} XLM - ${signers} additional signers`]) : [],
          ...dataEntries > 0 ? (dataEntries === 1 ? [`${baseReserve.toFixed(2)} XLM - 1 data entry`] : [`${(dataEntries * baseReserve).toFixed(2)} XLM - ${dataEntries} data entries`]) : [],
          ...offers > 0 ? (offers === 1 ? [`${baseReserve.toFixed(2)} XLM - 1 offer`] : [`${(offers * baseReserve).toFixed(2)} XLM - ${offers} offers`]) : [],
        ];

        const liabilities = balance.sellingLiabilities && balance.sellingLiabilities !== '0.0000000' ? `
          <strong>Selling liabilities</strong>
          <p>Selling liabilities equal the total amount of this currency offered to sell aggregated over all offers owned by this wallet. This amount can not be spent.</p>
          <p>The amount reserved for selling liabilities in this account is:</p>
          <p>${new Amount(balance.sellingLiabilities).format()} XLM</p>
        ` : '';

        let totalAmount = new Amount(((2 + this.data.stellar_data.subentry_count) * baseReserve).toString());
        if (balance.sellingLiabilities) {
          totalAmount = totalAmount.plus(balance.sellingLiabilities);
        }

        const total = `
          <strong>Total amount reserved</strong>
          <p>${totalAmount.format()} XLM</p>
        `;
        return header + items.join('<br>') + '<br><br>' + liabilities + total;
      } else {
        return `
          <strong>Selling liabilities</strong>
          <p>Selling liabilities equal the total amount of this currency offered to sell aggregated over all offers owned by this wallet. This amount can not be spent.</p>
          <p>The amount reserved for selling liabilities in this account is:</p>
          <p>${new Amount(balance.sellingLiabilities).format()} ${balance.type}</p>
        `;
      }
    },
    Amount,
  }
};
</script>
