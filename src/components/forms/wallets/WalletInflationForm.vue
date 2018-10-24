<template>
  <b-form v-if="data.stellar_data" @submit.prevent>
    <span class="font-weight-600">Inflation destination</span>
    <a v-if="!fieldOpen" href="#" @click.prevent="onSetDestinationClick">set inflation destination</a>
    <a v-if="fieldOpen && !loading" href="#" class="text-warning" @click.prevent="onCancelClick">cancel</a>
    <br>
    <div v-if="!data.stellar_data.inflation_destination">
      <span class="left text-danger">none</span><br>
      <small>Hint: Vote or earn free lumens by setting the inflation destination</small>
    </div>
    <div v-else="" class="break-word with-hyphens">
      {{ data.stellar_data.inflation_destination }}
      <copy-to-clipboard :text="data.stellar_data.inflation_destination" color="text-info"/>
      <br>
    </div>

    <h6 v-if="hasUnknownError" class="text-danger">Unknown backend error!</h6>

    <div v-if="fieldOpen && !loading">
      <b-button-group size="sm" class="my-3">
        <b-button :class="formType === 'known' ? 'text-info': 'text-gray-500'" variant="outline-secondary" @click="onTabChange('known')">Known Destinations</b-button>
        <b-button :class="formType === 'fields' ? 'text-info': 'text-gray-500'" variant="outline-secondary" @click="onTabChange('fields')">Provide Destination Data</b-button>
      </b-button-group>

      <div v-if="formType === 'fields'" class="tab-page"><!-- new destination -->
        <b-card class="flat-card">
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
                <template v-if="!$v.destination.required">Wallet destination is required <br></template>
                <template v-if="!$v.destination.publicKey">Not valid public key!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveDestinationHelp_${uuid}`">
              Public key of destination account
            </b-form-text>
          </b-form-group>

          <b-form-group v-if="canSignWithPassword">
            <b-form-input
              :id="`passwordInput_${uuid}`"
              :class="{ error: $v.password.$error }"
              :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
              :state="!$v.password.$error"
              v-model="password"
              :type="password1IsHidden ? 'password' : 'text'"
              placeholder="Your password"
              required
              @blur="$v.password.$touch()"/>
            <password-assets :password="['password1IsHidden', password1IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

            <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
              <template v-if="$v.password.$error" class="field__errors">
                <template v-if="!$v.password.required">Password is required! <br></template>
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
                <template v-if="!$v.signerSeed.required">Secret seed is required! <br></template>
                <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
              Your secret seed for selected signer.
            </b-form-text>
          </b-form-group>

          <div>
            <a v-if="!fieldOpen" href="#" class="px-2" @click.prevent="onSetDestinationClick">set inflation destination</a>
            <template v-else>
              <a href="#" class="text-warning px-2" @click.prevent="onCancelClick">cancel</a>
              <a href="#" class="text-info px-2" @click.prevent="onSubmitClick">
                <spinner v-if="loading" width="140" message="settings inflation..."/>
                <span v-else>submit</span>
              </a>
            </template>
          </div>
        </b-card>
      </div>
      <div v-else> <!-- Known destinations -->
        <b-list-group class="flat-card">
          <b-list-group-item v-for="destination in knownDestinations" :key="destination.asset_code + destination.issuer_public_key">
            <b-row align-h="between">
              <b-col cols="10">
                <h6>{{ destination.name }}</h6>
                <small class="d-block">
                  {{ destination.short_description }}
                  <!--<a href="#" class="pull-right" @click.prevent>details</a>-->
                </small>
                <small class="d-block break-word with-hyphens">Public key: {{ destination.issuer_public_key }}</small>
              </b-col>
              <b-col cols="2" class="text-right">
                <input :id="`currencyCheckbox${destination.issuer_public_key}`" :checked="destination.issuer_public_key === data.stellar_data.inflation_destination" type="checkbox" class="switch" @input.prevent="e => { openedKnownDestination = e.target.checked ? destination : null }">
                <label :for="`currencyCheckbox${destination.issuer_public_key}`"/>
              </b-col>
            </b-row>

            <div v-if="openedKnownDestination === destination" class="pt-4 pb-1">
              <b-form-group v-if="canSignWithPassword">
                <b-form-input
                  :id="`passwordInput_${uuid}`"
                  :class="{ error: $v.password.$error }"
                  :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
                  :state="!$v.password.$error"
                  v-model="password"
                  :type="password2IsHidden ? 'password' : 'text'"
                  placeholder="Your password"
                  required
                  @blur="$v.password.$touch()"/>

                <password-assets :password="['password2IsHidden', password2IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

                <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
                  <template v-if="$v.password.$error" class="field__errors">
                    <template v-if="!$v.password.required">Password is required! <br></template>
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
                    <template v-if="!$v.signerSeed.required">Secret seed is required! <br></template>
                    <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
                  Your secret seed for selected signer.
                </b-form-text>
              </b-form-group>

              <small class="d-block mb-3 font-italic">Password required to {{ data.stellar_data.inflation_destination === openedKnownDestination.issuer_public_key ? 'add' : 'remove' }} destination</small>
              <div>
                <spinner v-if="loading" message="adding..." width="90"/>
                <div v-else>
                  <a href="#" class="text-warning mr-3" @click.prevent="openKnownDestination(null)">cancel</a>
                  <a href="#" class="text-info" @click.prevent="onSubmitClick">add</a>
                </div>
              </div>
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
    <spinner v-if="loading"/>
    <br>
  </b-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import formMixin from '@/mixins/form';
import validators from '@/validators';
import spinner from '@/components/ui/spinner1';
import copyToClipboard from '@/components/ui/copyToClipboard';
import passwordAssets from '@/components/ui/passwordAssets';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

export default {
  name: 'WalletInflationForm',
  components: { passwordAssets, spinner, copyToClipboard },
  mixins: [ formMixin, updatePasswordVisibilityState ],
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
      password1IsHidden: true,
      password2IsHidden: true,
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
