<template>
  <form class="form" @submit.prevent>
    <div>
      <p>
        <strong>Inflation destination</strong>
        <a v-if="!fieldOpen" href="#" class="only-desktop" @click.prevent="onSetDestinationClick">set inflation destination</a>
        <a v-else href="#" class="error only-desktop" @click.prevent="onCancelClick">cancel</a>
        <br>
        <span v-if="!data.stellar_data.inflation_destination">
          <span class="left error">none</span>
          <span class="right info">Hint: Vote or earn free lumens by setting the inflation destination</span>
        </span>
        <span v-else>{{ data.stellar_data.inflation_destination }}</span>
      </p>
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div v-if="fieldOpen && !loading" class="field">
        <ul class="button-group">
          <li :class="['button-group__button', {'button-group__button--active': formType === 'known'}]"><button @click="onTabChange('known')">Known Destinations</button></li>
          <li :class="['button-group__button', {'button-group__button--active': formType === 'fields'}]"><button @click="onTabChange('fields')">Provide Destination Data</button></li>
        </ul>
        <div v-if="formType === 'fields'" class="tab-page">
          <div v-if="$v.destination.$error" class="field__errors">
            <div v-if="!$v.destination.required">Wallet destination is required</div>
            <div v-if="!$v.destination.publicKey">Not valid public key!</div>
          </div>
          <input :class="{ error: $v.destination.$error }" v-model="destination" placeholder="Public key of destination account" @blur="$v.destination.$touch()">
          <div v-if="$v.password.$error" class="field__errors">
            <div v-if="!$v.password.required">Password is required</div>
            <div v-if="!$v.password.decryptValid">Invalid password</div>
          </div>
          <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
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
                <div v-if="$v.password.$error" class="field__errors">
                  <div v-if="!$v.password.required">Password is required</div>
                  <div v-if="!$v.password.decryptValid">Invalid password</div>
                </div>
                <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">

                <br>
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
    };
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

      this.backendQuery = this.openedKnownDestination
        ? { destination: this.openedKnownDestination.issuer_public_key, password: this.password }
        : { destination: this.destination, password: this.password };

      this.$emit('submit', this.backendQuery);
    }
  },
  validations () {
    return {
      ...(this.formType === 'known' ? {} : {
        destination: {
          required,
          ...validators.publicKey.call(this),
        },
      }),
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptionError,
      }
    };
  }
};
</script>

<style lang="scss" scoped>
p {
  word-wrap: break-word;
}

.known-destinations {
  display: block;
  padding: 0;
  margin: 0 auto;
  list-style: none;
  min-width: 300px;
  width: 50%;
  li {
    padding-bottom: 8px;
    border-bottom: 1px solid #666;
  }
  input.error {
    margin-bottom: -12px;
    display: block;
  }
  .checkbox {
    float: right;
  }
}
</style>
