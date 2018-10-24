<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">

        <h4 class="page-headline text-uppercase">Contacts <a href="#" class="h3 float-right" @click.prevent="addModalVisible = true">+</a></h4>

        <p>
          <br>
          <b-form-group label-for="contactSearchInput">
            <b-form-input
              id="contactSearchInput"
              v-model="searchField"
              placeholder="Search"
              type="text"
              required/>
          </b-form-group>
        </p>

        <b-row v-for="contact in filteredContacts" :key="contact.id">
          <b-col>
            <h6>{{ contact.contact_name }}</h6>
            <p>{{ contact.stellar_address || contact.public_key }}</p>
            <b-row>
              <b-col class="text-right">
                <b-button variant="outline-info" size="sm" class="btn-rounded" @click="() => onEditClick(contact.id)">Edit</b-button>
                <b-button variant="outline-info" size="sm" class="btn-rounded" @click="() => onOpenSendPaymentClick(contact.id)">Send Payment</b-button>
              </b-col>
            </b-row>

            <hr class="divider">
          </b-col>
        </b-row>

        <b-modal v-model="addModalVisible" hide-footer size="sm" title="New contact">
          <edit-contact-form
            v-if="addModalVisible"
            :loading="addContactStatus.loading"
            @add="onAddContact"
            @close="addModalVisible = false"/>
        </b-modal>

        <b-modal v-model="editModalVisible" hide-footer size="sm" title="Edit contact">
          <edit-contact-form
            v-if="editModalVisible"
            :contact="contacts.res.find(c => c.id === editingContact)"
            :loading="editContactStatus.loading || editContactStatus.loading"
            @edit="onEditContact"
            @remove="onRemoveContact"
            @close="editModalVisible = false"/>
        </b-modal>

        <b-modal v-model="sendModalVisible" hide-footer size="sm" title="Send">
          <send-payment-form
            v-if="sendModalVisible && availableWallets.length > 0"
            :result="sendPaymentStatus.res"
            :loading="sendPaymentStatus.loading || decryptedWallet.loading"
            :errors="sendPaymentStatus.err"
            :exchanges="exchanges"
            :transaction="sendPaymentTransaction"
            :available-wallets="availableWallets"
            :contact="contacts.res.find(c => c.id === selectedContact)"
            @reset="resetSendPayment"
            @close="sendModalVisible = false"
            @submit="onSendPaymentClick"/>
          <span v-else-if="sendModalVisible && availableWallets.length === 0">Can not send payment, please fund your wallet first.</span>
        </b-modal>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import EditContactForm from '@/components/forms/contacts/EditContactForm';
import SendPaymentForm from '@/components/forms/wallets/SendPaymentForm';
import validators from '@/validators';

export default {
  name: 'Contacts',
  components: { EditContactForm, SendPaymentForm },
  data () {
    return {
      addModalVisible: false,
      editModalVisible: false,
      sendModalVisible: false,

      editingContact: null,
      searchField: '',

      selectedContact: null,
    };
  },
  computed: {
    ...mapGetters(['contacts', 'addContactStatus', 'editContactStatus', 'removeContactStatus', 'wallets', 'exchanges', 'sendPaymentStatus', 'decryptedWallet', 'transactions']),

    filteredContacts () {
      if (this.searchField === '') {
        return this.contacts.res;
      }
      return this.contacts.res.filter(contact => {
        const str = this.searchField.toLowerCase();
        return [contact.contact_name, contact.stellar_address, contact.public_key].map(x => x.toLowerCase()).some(x => x.includes(str));
      });
    },

    availableWallets () {
      return this.wallets.res.filter(wallet => {
        if (!wallet.stellar_data) return false;
        return true;
      });
    },

    sendPaymentTransaction () {
      if (!this.sendPaymentStatus.res) return;
      const transactionId = this.sendPaymentStatus.res.transactionId;
      return this.transactions.find(tr => tr.id === transactionId);
    },
  },
  created () {
    this.getContacts();
    this.getWallets();
  },
  methods: {
    ...mapActions(['getContacts', 'addContact', 'editContact', 'removeContact', 'getWallets', 'sendPayment', 'resetSendPayment']),

    async onAddContact ({ contactName, address }) {
      const hasFederationAddress = validators.federationAddress().federationAddress(address);
      await this.addContact({
        contact_name: contactName,
        ...(hasFederationAddress ? { stellar_address: address } : { public_key: address })
      });
      if (this.addContactStatus.err.length === 0) {
        this.addModalVisible = false;
      }
    },

    onEditClick (id) {
      this.editingContact = id;
      this.editModalVisible = true;
    },

    async onEditContact ({ id, contactName, address }) {
      const hasFederationAddress = validators.federationAddress().federationAddress(address);
      await this.editContact({
        id,
        contact_name: contactName,
        ...(hasFederationAddress ? { stellar_address: address } : { public_key: address })
      });
      if (this.editContactStatus.err.length === 0) {
        this.editModalVisible = false;
      }
    },

    async onRemoveContact (id) {
      await this.removeContact({
        id,
      });
      if (this.removeContactStatus.err.length === 0) {
        this.editModalVisible = false;
      }
    },

    onOpenSendPaymentClick (contactId) {
      this.selectedContact = contactId;
      this.sendModalVisible = true;
    },

    async onSendPaymentClick (data) {
      await this.sendPayment(data);
    },
  }
};
</script>
