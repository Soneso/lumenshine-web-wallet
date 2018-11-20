<template>
  <span>
    Operation ID: <a href="#" @click.prevent="openModal">{{ item.op_id }}</a><br>
    <b-modal v-model="modalVisible" hide-footer title="Operation details" size="md">
      <spinner v-if="operationDetails === null" message="Loading operation..." width="200"/>
      <pre v-else style="font-size: 11px" class="p-2 mt-3 text-success bg-dark">{{ operationDetails }}</pre>
    </b-modal>
    <template v-if="item.tx_memo">Memo: {{ item.tx_memo }}<br></template>
    <template v-if="item.op_type === OperationType.CREATE_ACCOUNT">
      <template v-if="item.op_details.funder === selectedWallet">
        Created account: <public-key :public-key="item.op_details.account"/><br>
      </template>
      <template v-else>
        Account created by: <public-key :public-key="item.op_details.funder"/><br>
      </template>
    </template>

    <template v-if="item.op_type === OperationType.PAYMENT">
      <template v-if="item.op_details.from === selectedWallet">
        Recipient: <public-key :public-key="item.op_details.to"/><br>
      </template>
      <template v-else>
        Sender: <public-key :public-key="item.op_details.from"/><br>
      </template>
    </template>

    <template v-if="item.op_type === OperationType.PATH_PAYMENT">
      <template v-if="item.op_details.from === selectedWallet"> <!-- sending -->
        Maximum send amount: {{ new Amount(item.op_details.source_max).format() }}<br>
        Recipient: <public-key :public-key="item.op_details.to"/><br>
        Received amount: {{ new Amount(item.op_details.amount).format() }} {{ item.op_details.asset_code }}<br>
      </template>
      <template v-else> <!-- receiving -->
        Sender: <public-key :public-key="item.op_details.from"/><br>
      </template>
      Payment path: {{ paymentPath }}<br>
    </template>

    <template v-else-if="item.op_type === OperationType.CHANGE_TRUST">
      Type: {{ item.op_details.limit === '0.0000000' ? 'remove' : 'add' }}<br>
      Asset: {{ item.op_details.asset_code }}<br>
      Issuer: <public-key :public-key="item.op_details.asset_issuer"/><br>
      Trust limit: {{ new Amount(item.op_details.limit).format() }}<br>
    </template>

    <template v-else-if="item.op_type === OperationType.ALLOW_TRUST">
      Trustor: <public-key :public-key="item.op_details.trustor"/><br>
      Asset code: {{ item.op_details.asset_code || 'XLM' }}<br>
      Authorize: {{ item.op_details.authorize ? 'true' : 'false' }}<br>
    </template>

    <template v-else-if="item.op_type === OperationType.CREATE_PASSIVE_OFFER">
      Offer ID: <spinner v-if="!offerId" :size="15" inline/><template v-else>{{ offerId }}</template><br>
      Buying: {{ item.op_details.buying_asset_type === 'native' ? 'XLM' : item.op_details.buying_asset_code }}<br>
      Selling: {{ new Amount(item.op_details.amount).format() }} {{ item.op_details.selling_asset_type === 'native' ? 'XLM' : item.op_details.selling_asset_code }}<br>
      Price for 1 unit of asset for sale: {{ new Amount(item.op_details.price).format() }} {{ item.op_details.buying_asset_type === 'native' ? 'XLM' : item.op_details.buying_asset_code }}<br>
    </template>

    <template v-else-if="item.op_type === OperationType.MANAGE_OFFER">
      Offer ID:  <spinner v-if="!offerId" :size="15" inline/><template v-else>{{ offerId }}</template><br>
      Buying: {{ item.op_details.buying_asset_type === 'native' ? 'XLM' : item.op_details.buying_asset_code }}<br>
      Selling: {{ new Amount(item.op_details.amount).format() }} {{ item.op_details.selling_asset_type === 'native' ? 'XLM' : item.op_details.selling_asset_code }}<br>
      Price for 1 unit of asset for sale: {{ new Amount(item.op_details.price).format() }} {{ item.op_details.buying_asset_type === 'native' ? 'XLM' : item.op_details.buying_asset_code }}<br>
    </template>

    <template v-else-if="item.op_type === OperationType.SET_OPTIONS">
      <template v-if="item.op_details.inflation_dest">Inflation destination: <public-key :public-key="item.op_details.inflation_dest"/><br></template>
      <template v-if="item.op_details.set_flags_s">Set flags: {{ item.op_details.set_flags_s.map(f => formatFlagName(f)).join(', ') }}<br></template>
      <template v-if="item.op_details.clear_flags_s">Clear flags: {{ item.op_details.clear_flags_s.map(f => formatFlagName(f)).join(', ') }}<br></template>
      <template v-if="item.op_details.master_key_weight">Master weight: {{ item.op_details.master_key_weight }}<br></template>
      <template v-if="item.op_details.low_threshold">Low threshold: {{ item.op_details.low_threshold }}<br></template>
      <template v-if="item.op_details.med_threshold">Medium threshold: {{ item.op_details.med_threshold }}<br></template>
      <template v-if="item.op_details.high_threshold">High threshold: {{ item.op_details.high_threshold }}<br></template>
      <template v-if="item.op_details.signer_weight === 0">Signer removed: <public-key :public-key="item.op_details.signer_key"/><br></template>
      <template v-if="item.op_details.signer_weight > 0">Signer added: <public-key :public-key="item.op_details.signer_key"/><br></template>
      <template v-if="item.op_details.signer_weight !== undefined">Signer type: {{ getSignerType(item.op_details.signer_key) }}<br></template>
      <template v-if="item.op_details.signer_weight > 0">Signer weight: {{ item.op_details.signer_weight }}<br></template>
      <template v-if="item.op_details.home_domain">Home domain: {{ item.op_details.home_domain }}<br></template>
    </template>

    <template v-else-if="item.op_type === OperationType.ACCOUNT_MERGE">
      Merged account: <public-key :public-key="item.op_details.account"/><br>
    </template>

    <template v-else-if="item.op_type === OperationType.MANAGE_DATA">
      Entry name: {{ item.op_details.name }}<br>
      Entry value: {{ item.op_details.value === null ? 'deleted' : tryDecodeData(item.op_details.value) }}<br>
    </template>

    <template v-else-if="item.op_type === OperationType.BUMP_SEQUENCE">
      Bumped to: {{ item.op_details.bump_to }}<br>
    </template>

    <template v-if="item.tx_source_account !== selectedWallet">
      Source account: <public-key :public-key="item.tx_source_account"/>
    </template>
  </span>
</template>

<script>
import Amount from '@/util/Amount';
import OperationType from '@/util/OperationType';
import copyToClipboard from '@/components/ui/copyToClipboard';

import StellarSdk from 'stellar-sdk';

import config from '@/config';
import spinner from '@/components/ui/spinner';

import PublicKey from '@/components/ui/PublicKey';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);

export default {
  components: { copyToClipboard, spinner, PublicKey },

  props: {
    item: {
      type: Object,
      required: true,
    },
    selectedWallet: {
      type: String,
      required: true,
    }
  },

  data () {
    return {
      modalVisible: false,

      transactionDataXDR: null,

      operationDetails: null,
    };
  },

  computed: {
    offerId () {
      if (this.item.op_type !== OperationType.CREATE_PASSIVE_OFFER && this.item.op_type !== OperationType.MANAGE_OFFER) return '';
      if (this.item.op_details.offer_id) return this.item.op_details.offer_id;
      if (!this.transactionDataXDR) return '';
      const parsedXDR = StellarSdk.xdr.TransactionResult.fromXDR(this.transactionDataXDR, 'base64');
      const resultArray = parsedXDR._attributes.result._value;
      if (resultArray.length !== 1) return ''; // TODO - handle the case when multiple operations are in one transaction
      const operations = resultArray.map(r => ({ type: r._value._arm, offerId: r._value._value._value._attributes.offer._value._attributes.offerId.toString() }));
      return operations[0].offerId;
    },

    paymentPath () {
      if (this.item.op_type !== OperationType.PATH_PAYMENT) return '';
      const path = [{ code: this.item.op_details.source_asset_code, type: this.item.op_details.source_asset_type }];
      this.item.op_details.path.forEach(p => {
        path.push({ code: p.asset_code, type: p.asset_type });
      });
      path.push({ code: this.item.op_details.asset_code, type: this.item.op_details.asset_type });
      return path.map(p => p.type === 'native' ? 'XLM' : p.code).join(' => ');
    },
  },

  async created () {
    this.Amount = Amount;
    this.OperationType = OperationType;
    if (this.item.op_type === OperationType.CREATE_PASSIVE_OFFER || this.item.op_type === OperationType.MANAGE_OFFER) {
      if (!this.item.op_details.offer_id) {
        const tx = await StellarAPI.transactions()
          .transaction(this.item.tx_transaction_hash)
          .call();
        this.transactionDataXDR = tx.result_xdr;
      }
    }
  },

  methods: {
    async openModal () {
      this.modalVisible = true;
      this.operationDetails = await StellarAPI.operations()
        .operation(this.item.op_id + '')
        .call();
    },

    tryDecodeData (data) {
      try {
        const decoded = atob(data);
        if (!decoded.match(/[^x00-x7F]/i)) {
          return decoded;
        }
      } catch (err) {}
      return data;
    },

    formatFlagName (flag) {
      switch (flag) {
        case 'auth_required':
          return 'Authorization required';
        case 'auth_revocable':
          return 'Authorization revocable';
        case 'auth_immutable':
          return 'Authorization immutable';
      }
      return '';
    },

    getSignerType (signerKey) {
      switch (signerKey.charAt(0)) {
        case 'G':
          return 'Ed25519 Public Key';
        case 'X':
          return 'sha256 Hash';
        case 'T':
          return 'Pre-authorized Transaction Hash';
      }
      return '';
    },
  }
};
</script>
