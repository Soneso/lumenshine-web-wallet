<template>
  <b-card-group deck>
    <b-card :bg-variant="data.stellar_data ? 'success' : 'danger'" :style="{'max-width': data.stellar_data ? null : '25%'}" text-variant="white">
      <h5 class="text-uppercase">{{ balances && balances.length > 1 ? 'Balances' : 'Balance' }}</h5>
      <p v-if="!data.stellar_data">{{ new Amount('0').format() }} <small>XLM</small></p>
      <ul v-else class="list-unstyled">
        <li v-for="item in balances" :key="item.type + item.issuer">
          {{ item.balance }} <small>{{ item.type }}</small>
        </li>
      </ul>
    </b-card>

    <b-card v-if="data.stellar_data">
      <h5 class="text-info text-uppercase">Available</h5>
      <ul class="list-unstyled">
        <li v-for="item in balances" :key="item.type + item.issuer">
          {{ item.available }} <small>{{ item.type }}</small>
          <i
            v-b-popover.hover.html="() => getAvailablePopup(item)"
            v-if="item.available !== item.balance"
            :title="`Available ${item.type}`"
            class="icon-help"/>
        </li>
      </ul>
    </b-card>
  </b-card-group>
</template>

<script>
import Amount from '@/util/Amount';

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
  methods: {
    getAvailablePopup (balance) {
      const baseReserve = 0.5;
      if (!this.data.stellar_data) return '';

      if (balance.type === 'XLM') {
        const header = `
          <strong>Minimum balance</strong>
          <p>All Stellar accounts/wallets must maintain a minimum balance of lumens that can not be spent. The minimum balance for a basic account is 1.0 XLM. Additional entries such as trustlines for other currencies and additional signers increase the minimum balance.</p>
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
  }
};
</script>
