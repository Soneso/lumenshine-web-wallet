<template>
  <form class="form" @submit.prevent>
    <div class="text-center">
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>

      <b-form-group :label-for="`contactNameInput_${uuid}`">
        <b-form-input
          :id="`contactNameInput_${uuid}`"
          :class="{ error: $v.contactName.$error }"
          :state="!$v.contactName.$error"
          :aria-describedby="`inputLiveContactNameFeedback_${uuid}`"
          v-model="contactName"
          placeholder="Contact name"
          type="text"
          required
          @blur="$v.contactName.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveContactNameFeedback_${uuid}`">
          <template v-if="$v.contactName.$error" class="field__errors">
            <template v-if="!$v.contactName.required">Contact name is required</template>
          </template>
        </b-form-invalid-feedback>
      </b-form-group>

      <hr class="divider">

      <b-form-group :label-for="`contactAddressInput_${uuid}`">
        <b-form-input
          :id="`contactAddressInput_${uuid}`"
          :class="{ error: $v.address.$error || isInvalidAddress }"
          :state="!($v.address.$error || isInvalidAddress)"
          :aria-describedby="`inputLiveContactAddressHelp_${uuid} inputLiveContactAddressFeedback_${uuid}`"
          v-model="address"
          placeholder="Stellar address or public key"
          type="text"
          required
          @blur="$v.address.$touch()"/>
        <b-form-invalid-feedback :id="`inputLiveContactAddressFeedback_${uuid}`">
          <template v-if="$v.address.$error || isInvalidAddress" class="field__errors">
            <template v-if="!$v.address.required">Address is required</template>
            <template v-if="!$v.address.validRecipient">Not valid recipient!</template>
            <template v-if="isInvalidAddress">Address does not exists!</template>
          </template>
        </b-form-invalid-feedback>
        <b-form-text :id="`inputLiveContactAddressHelp_${uuid}`">
          Example: max*lumenshine.com or GBXQ42QBCADBS235DA...
        </b-form-text>
      </b-form-group>

      <b-row v-if="isAdd">
        <b-col class="text-right">
          <b-button variant="info" class="btn-rounded" @click="onAddClick">
            <spinner2 v-if="loading || pendingValidation"/>
            <span v-else>Add</span>
          </b-button>
        </b-col>
      </b-row>

      <template v-else>
        <b-button v-if="!loading || !removeClicked" variant="info" class="btn-rounded" @click="onUpdateClick">
          <spinner2 v-if="loading || pendingValidation"/>
          <span v-else>Update</span>
        </b-button>

        <b-button v-if="!loading || removeClicked" variant="danger" class="btn-rounded" @click="onRemoveClick">
          <spinner2 v-if="loading"/>
          <span v-else>Remove</span>
        </b-button>
      </template>

    </div>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import StellarSdk from 'stellar-sdk';

import formMixin from '@/mixins/form';
import validators from '@/validators';
import spinner2 from '@/components/ui/spinner2';

export default {
  components: { spinner2 },
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: Object,
      default: () => null,
    },
  },
  data () {
    return {
      showCopiedText: false,
      contactName: this.contact ? this.contact.contact_name : '',
      address: this.contact ? this.contact.stellar_address || this.contact.public_key : '',

      removeClicked: false,

      isInvalidAddress: undefined, // undefined if needs validation
      pendingValidation: false,
    };
  },
  computed: {
    isAdd () {
      return this.contact === null;
    },
  },
  watch: {
    address () {
      this.isInvalidAddress = undefined;
    }
  },
  methods: {
    onCancelClick () {
      this.$emit('cancel');
    },

    async onAddClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      if (this.isInvalidAddress === undefined) {
        await this.validateFederationAddress();
      }
      if (this.isInvalidAddress) return;

      this.backendQuery = { contactName: this.contactName, address: this.address };
      this.$emit('add', this.backendQuery);
    },

    async onUpdateClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      if (this.isInvalidAddress === undefined) {
        await this.validateFederationAddress();
      }
      if (this.isInvalidAddress) return;

      this.backendQuery = { id: this.contact.id, contactName: this.contactName, address: this.address };
      this.$emit('edit', this.backendQuery);
    },

    onRemoveClick () {
      this.removeClicked = true;
      this.$emit('remove', this.contact.id);
      this.removeClicked = false;
    },

    async validateFederationAddress () {
      this.isInvalidAddress = undefined;
      this.pendingValidation = true;
      if (!validators.federationAddress.call(this).federationAddress(this.address)) {
        this.isInvalidAddress = false;
        this.pendingValidation = false;
        return;
      }
      try {
        await StellarSdk.FederationServer.resolve(this.address);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.code === 'not_found') {
          this.isInvalidAddress = true;
          this.pendingValidation = false;
          return; // if federation server is working and account cannot be found then show an error
        }
      }
      this.isInvalidAddress = false;
      this.pendingValidation = false;
    }
  },
  validations () {
    return {
      contactName: {
        required,
      },

      address: {
        required,
        validRecipient: value => validators.publicKey.call(this).publicKey(value) || validators.federationAddress.call(this).federationAddress(value),
      }
    };
  }
};
</script>
