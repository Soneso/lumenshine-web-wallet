<template>
  <b-row v-if="!sendFormVisible" align-h="center">
    <b-col cols="9">

      <h4 class="page-headline text-uppercase">Payment templates <a href="#" class="h3 float-right" @click.prevent="creatingTemplate = true,sendFormVisible = true">+</a></h4>

      <p>
        <br>
        <b-form-group label-for="templateSearchInput">
          <b-form-input
            id="templateSearchInput"
            v-model="searchField"
            placeholder="Search"
            type="text"
            required/>
        </b-form-group>
      </p>

      <b-row v-for="(template, templateKey) in filteredTemplates" :key="template.id">
        <b-col>
          <h6>{{ template.template_name || '(unnamed)' }}</h6>
          <p>
            <span v-if="template.recipient_stellar_address">{{ template.recipient_stellar_address }}</span>
            <public-key :text="template.recipient_pk" :chars="20"/>
            <br>
            <span v-if="template.amount">{{ template.amount }} {{ template.asset_code }}<br></span>
            <span v-if="template.issuer_pk && template.asset_code && template.asset_code !== 'XLM'">
              Issuer: <public-key :text="template.issuer_pk" :chars="20"/><br>
            </span>
            <span v-if="template.memo">{{ template.memo_type }} {{ template.memo }}<br></span>
          </p>
          <b-row>
            <b-col class="text-right">
              <b-button variant="outline-danger" size="sm" class="btn-rounded" @click="() => onRemoveTemplate(template.id)">Remove</b-button>
              <b-button variant="outline-info" size="sm" class="btn-rounded" @click="selectedTemplate = template, sendFormVisible = true">Use template</b-button>
            </b-col>
          </b-row>

          <hr v-if="templateKey !== filteredTemplates.length - 1" class="divider light">
          <br v-else>
        </b-col>
      </b-row>
      <p v-if="searchField !== '' && filteredTemplates.length === 0">No results</p>
      <p v-else-if="filteredTemplates.length === 0">No payment templates</p>

    </b-col>
  </b-row>
  <!-- when sendFormVisible -->
  <send-payment-form
    v-else
    :creating-template="creatingTemplate"
    :data="data"
    :result="result"
    :loading="loading"
    :errors="errors"
    :exchanges="exchanges"
    :transaction="transaction"
    :available-wallets="availableWallets"
    :contact="contact"
    :default-values="selectedTemplate"
    @template="sendFormVisible = false"
    @reset="$emit('reset')"
    @close="sendFormVisible = false"
    @submit="data => creatingTemplate ? onSaveTemplateClick(data) : $emit('submit', data)"/>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import publicKey from '@/components/ui/publicKey';
import spinner from '@/components/ui/spinner';

import SendPaymentForm from '@/components/forms/wallets/SendPaymentForm';

export default {
  name: 'SendPaymentWithTemplates',
  components: { publicKey, spinner, SendPaymentForm },

  props: {
    errors: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Object,
      default: null,
    },
    result: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    exchanges: {
      type: Object,
      required: true,
    },
    transaction: {
      type: Object,
      default: null,
    },
    availableWallets: { // used in contacts form when users needs to select one wallet
      type: Array,
      default: () => [],
    },
    contact: { // used to prefill forms with contact data
      type: Object,
      default: null,
    }
  },

  data () {
    return {
      sendFormVisible: true,
      creatingTemplate: false,

      searchField: '',
      selectedTemplate: null,
    };
  },

  computed: {
    ...mapGetters([
      'paymentTemplates',
    ]),
    filteredTemplates () {
      if (this.searchField === '') {
        return this.paymentTemplates.res;
      }
      return this.paymentTemplates.res.filter(template => {
        const str = this.searchField.toLowerCase();
        return [template.template_name, template.asset_code, template.issuer_pk, template.memo, template.amount, template.recipient_stellar_address, template.recipient_pk].map(x => x.toLowerCase()).some(x => x.includes(str));
      });
    }
  },

  mounted () {
    this.getPaymentTemplates(this.data.id);
  },

  methods: {
    ...mapActions([
      'getPaymentTemplates',
      'addPaymentTemplate',
      'removePaymentTemplate',
    ]),
    async onSaveTemplateClick (formData) {
      await this.addPaymentTemplate({
        wallet_id: this.data.id,
        ...(formData.recipient.indexOf('*') !== -1 ? { recipient_stellar_address: formData.recipient } : { recipient_pk: formData.recipient }),
        asset_code: formData.customAssetCode || formData.assetCode,
        issuer_pk: formData.issuer,
        amount: formData.amount,
        memo_type: formData.memoType,
        memo: formData.memo,
        template_name: formData.templateName,
      });
      this.creatingTemplate = false;
      this.sendFormVisible = false;
    },
    async onRemoveTemplate (id) {
      await this.removePaymentTemplate({ templateId: id, walletId: this.data.id });
    },
    onCancelClick () {
      this.$emit('cancel');
    },
  },
};
</script>
