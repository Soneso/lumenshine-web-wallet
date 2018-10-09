<template>
  <form v-if="data.stellar_data" class="form" @submit.prevent>
    <div>
      <p>
        <strong>Inflation destination</strong>
        <a v-if="!fieldOpen" href="#" class="only-desktop" @click.prevent="onSetDestinationClick">set inflation destination</a>
        <a v-else href="#" class="error only-desktop" @click.prevent="onCancelClick">cancel</a>
        <br>
        <span v-if="!data.stellar_data.inflation_destination">
          <span class="left text-danger">none</span><br>
          <small>Hint: Vote or earn free lumens by setting the inflation destination</small>
        </span>
        <span v-else>{{ data.stellar_data.inflation_destination }}</span>
      </p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div v-if="fieldOpen && !loading" class="field">

        <b-button-group>
          <b-button :disabled="formType === 'known'" variant="default" @click="onTabChange('known')">Known Destinations</b-button>
          <b-button :disabled="formType === 'fields'" variant="default" @click="onTabChange('fields')">Provide Destination Data</b-button>
        </b-button-group>

        <div v-if="formType === 'fields'" class="tab-page">
          <b-form-group :label-for="`destinationInput_${uuid}`">
            <b-form-input
              :id="`destinationInput_${uuid}`"
              :class="{ error: $v.destination.$error }"
              :aria-describedby="`inputLiveDestinationHelp_${uuid} inputLiveDestinationFeedback_${uuid}`"
              :state="!$v.destination.$error"
              v-model="destination"
              type="text"
              placeholder="Public key of destination account"
              required
              @blur="$v.destination.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveDestinationFeedback_${uuid}`">
              <template v-if="$v.destination.$error" class="field__errors">
                <template v-if="!$v.destination.required">Wallet destination is required</template>
                <template v-if="!$v.destination.publicKey">Not valid public key!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveDestinationHelp_${uuid}`">
              Public key of destination account
            </b-form-text>
          </b-form-group>

          <b-form-group v-if="canSignWithPassword" :label-for="`passwordInput_${uuid}`" label="Password">
            <b-form-input
              :id="`passwordInput_${uuid}`"
              :class="{ error: $v.password.$error }"
              :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
              :state="!$v.password.$error"
              v-model="password"
              type="password"
              placeholder="Your password"
              required
              @blur="$v.password.$touch()"/>
            <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
              <template v-if="$v.password.$error" class="field__errors">
                <template v-if="!$v.password.required">Password is required!</template>
                <template v-if="!$v.password.decryptValid">Wrong password!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
              Your password.
            </b-form-text>
          </b-form-group>

          <b-form-group v-if="!canSignWithPassword" :label-for="`signerInput_${uuid}`" label="Select signer for payment">
            <b-form-select :id="`signerInput_${uuid}`" v-model="signer" :options="signers.map(signer => signer.public_key)" placeholder="Signers"/>
            <b-form-input
              :class="{ error: $v.signerSeed.$error }"
              :aria-describedby="`inputLiveSignerSeedHelp_${uuid} inputLiveSignerSeedFeedback_${uuid}`"
              :state="!$v.signerSeed.$error"
              v-model="signerSeed"
              type="text"
              placeholder="Seed for selected signer"
              required
              @blur="$v.signerSeed.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveSignerSeedFeedback_${uuid}`">
              <template v-if="$v.signerSeed.$error" class="field__errors">
                <template v-if="!$v.signerSeed.required">Secret seed is required!</template>
                <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
              Your secret seed for selected signer.
            </b-form-text>
          </b-form-group>

          <div class="form-buttons">
            <a v-if="!fieldOpen" href="#" class="only-mobile" @click.prevent="onSetDestinationClick">set inflation destination</a>
            <a v-else href="#" class="error only-mobile" @click.prevent="onCancelClick">cancel</a>
            <a v-if="fieldOpen" href="#" @click.prevent="onSubmitClick">
              <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
              <span v-else>submit</span>
            </a>
          </div>
        </div>
        <div v-else> <!-- Known destinations -->
          <ul class="known-destinations">
            <li v-for="destination in knownDestinations" :key="destination.asset_code + destination.issuer_public_key">
              <p class="checkbox">
                <input :id="`currencyCheckbox${destination.issuer_public_key}`" :checked="destination.issuer_public_key === data.stellar_data.inflation_destination" type="checkbox" class="switch" @input.prevent="e => { openedKnownDestination = e.target.checked ? destination : null }">
                <label :for="`currencyCheckbox${destination.issuer_public_key}`"/>
              </p>
              <h4>{{ destination.name }}</h4>
              <p>{{ destination.short_description }}</p>
              <p>Public key: {{ destination.issuer_public_key.slice(0, 10) }}...</p>
              <a href="#" @click.prevent>details</a>
              <div v-if="openedKnownDestination === destination">

                <b-form-group v-if="canSignWithPassword" :label-for="`passwordInput_${uuid}`" label="Password">
                  <b-form-input
                    :id="`passwordInput_${uuid}`"
                    :class="{ error: $v.password.$error }"
                    :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
                    :state="!$v.password.$error"
                    v-model="password"
                    type="password"
                    placeholder="Your password"
                    required
                    @blur="$v.password.$touch()"/>
                  <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
                    <template v-if="$v.password.$error" class="field__errors">
                      <template v-if="!$v.password.required">Password is required!</template>
                      <template v-if="!$v.password.decryptValid">Wrong password!</template>
                    </template>
                  </b-form-invalid-feedback>
                  <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
                    Your password.
                  </b-form-text>
                </b-form-group>

                <b-form-group v-if="!canSignWithPassword" :label-for="`signerInput_${uuid}`" label="Select signer for payment">
                  <b-form-select :id="`signerInput_${uuid}`" v-model="signer" :options="signers.map(signer => signer.public_key)" placeholder="Signers"/>
                  <b-form-input
                    :class="{ error: $v.signerSeed.$error }"
                    :aria-describedby="`inputLiveSignerSeedHelp_${uuid} inputLiveSignerSeedFeedback_${uuid}`"
                    :state="!$v.signerSeed.$error"
                    v-model="signerSeed"
                    type="text"
                    placeholder="Seed for selected signer"
                    required
                    @blur="$v.signerSeed.$touch()"/>
                  <b-form-invalid-feedback :id="`inputLiveSignerSeedFeedback_${uuid}`">
                    <template v-if="$v.signerSeed.$error" class="field__errors">
                      <template v-if="!$v.signerSeed.required">Secret seed is required!</template>
                      <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
                    </template>
                  </b-form-invalid-feedback>
                  <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
                    Your secret seed for selected signer.
                  </b-form-text>
                </b-form-group>

                <span>Password required to {{ data.stellar_data.inflation_destination === openedKnownDestination.issuer_public_key ? 'add' : 'remove' }} destination</span>
                <div class="form-buttons">
                  <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
                  <div v-else>
                    <a href="#" @click.prevent="openKnownDestination(null)">cancel</a>
                    <a href="#" @click.prevent="onSubmitClick">add</a>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
    </div>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';
import validators from '@/validators';

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    decryptionError: {
      type: Boolean,
      required: true,
    },
    knownDestinations: {
      type: Array,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      fieldOpen: false,
      destination: this.inflationDestination,
      password: '',
      formType: 'known',
      openedKnownDestination: null,

      signer: null,
      signerSeed: '',
    };
  },
  computed: {
    signers () {
      if (!this.data.stellar_data) return [];
      const stellarData = this.data.stellar_data;
      const threshold = stellarData.thresholds.med_threshold;
      return stellarData.signers.filter(signer => signer.weight >= threshold);
    },
    canSignWithPassword () {
      return !!this.signers.find(signer => signer.public_key === this.data.public_key_0);
    },
  },
  watch: {
    loading (loading) {
      if (!loading && !this.decryptionError && this.errors.length === 0) {
        this.fieldOpen = false;
        this.openedKnownDestination = null;
      }
    }
  },
  methods: {
    onTabChange (val) {
      this.formType = val;
      this.resetForms();
    },
    resetForms () {
      this.password = '';
      this.destination = '';
      this.signer = null;
      this.signerSeed = '';
      this.$v.$reset();
    },
    onCancelClick () {
      this.fieldOpen = false;
    },
    onSetDestinationClick () {
      this.fieldOpen = true;
    },
    openKnownDestination (val) {
      this.openedKnownDestination = val;
      this.resetForms();
    },
    async onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.backendQuery = {
        destination: this.openedKnownDestination ? this.openedKnownDestination.issuer_public_key : this.destination,
        ...(this.canSignWithPassword ? {
          password: this.password,
        } : {
          signer: this.signer,
          signerSeed: this.signerSeed,
        }),
      };

      this.$emit('submit', this.backendQuery);
    }
  },
  validations () {
    const signerValidators = this.canSignWithPassword ? {
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptionError,
      },
    } : {
      signerSeed: {
        required,
        ...validators.secretSeed.call(this),
      },
    };

    return {
      ...(this.formType === 'known' ? {} : {
        destination: {
          required,
          ...validators.publicKey.call(this),
        },
      }),
      ...signerValidators
    };
  }
};
</script>
