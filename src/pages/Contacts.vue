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
                <b-button variant="outline-info" size="sm" class="btn-rounded" @click="() => onSendPaymentClick(contact.id)">Send Payment</b-button>
              </b-col>
            </b-row>

            <hr class="divider">
          </b-col>
        </b-row>

        <b-modal v-model="addModalVisible" hide-footer title="New contact">
          <edit-contact-form
            v-if="addModalVisible"
            :loading="addContactStatus.loading"
            @add="onAddContact"
            @close="addModalVisible = false"/>
        </b-modal>

        <b-modal v-model="editModalVisible" hide-footer title="Edit contact">
          <edit-contact-form
            v-if="editModalVisible"
            :contact="contacts.res.find(c => c.id === editingContact)"
            :loading="editContactStatus.loading || editContactStatus.loading"
            @edit="onEditContact"
            @remove="onRemoveContact"
            @close="editModalVisible = false"/>
        </b-modal>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import EditContactForm from '@/components/forms/contacts/EditContactForm';
import validators from '@/validators';

export default {
  name: 'Contacts',
  components: { EditContactForm },
  data () {
    return {
      addModalVisible: false,
      editModalVisible: false,

      editingContact: null,
      searchField: '',
    };
  },
  computed: {
    ...mapGetters(['contacts', 'addContactStatus', 'editContactStatus', 'removeContactStatus']),

    filteredContacts () {
      if (this.searchField === '') {
        return this.contacts.res;
      }
      return this.contacts.res.filter(contact => contact.contact_name.includes(this.searchField) || contact.stellar_address.includes(this.searchField) || contact.public_key.includes(this.searchField));
    },
  },
  async created () {
    await this.getContacts();
  },
  methods: {
    ...mapActions(['getContacts', 'addContact', 'editContact', 'removeContact']),

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

    onSendPaymentClick () {
    },
  }
};
</script>
