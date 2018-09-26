<template>
  <form class="form" @submit.prevent="onSubmitClick">
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
        </div>
        <div v-else> <!-- Known currencies -->
          <ul class="known-currencies">
            <li v-for="currency in knownCurrencies" :key="currency.asset_code + currency.issuer">
              <p class="checkbox">
                <input :id="`currencyCheckbox${currency.public_key}`" :checked="openedKnownCurrency === currency" type="checkbox" class="switch" @input="e => openedKnownCurrency = e.target.checked ? currency : null">
                <label :for="`currencyCheckbox${currency.public_key}`"></label>
              </p>
              <h4>{{ currency.name }}</h4>
              <p>{{ currency.details }}</p>
              <p>Public key: {{ currency.public_key.slice(0, 10) }}...</p>
              <div v-if="openedKnownCurrency === currency">
                <div v-if="$v.password.$error" class="field__errors">
                  <div v-if="!$v.password.required">Password is required</div>
                  <div v-if="!$v.password.decryptValid">Invalid password</div>
                </div>
                <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">

                <br>
                <span>Password required to add currency</span>
                <div class="form-buttons">
                  <a href="#" @click.prevent="onAddClick">
                    <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
                    <span v-if="!loading" @click.prevent="onOpenKnownCurrency(null)">cancel</span>
                    <span v-if="!loading">add</span>
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="form-buttons">
        <a v-if="!fieldOpen" href="#" class="only-mobile" @click.prevent="onSetDestinationClick">set inflation destination</a>
        <a v-else href="#" class="error only-mobile" @click.prevent="onCancelClick">cancel</a>
        <a v-if="fieldOpen" href="#" @click.prevent="onSubmitClick">
          <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
          <span v-else>submit</span>
        </a>
      </div>
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
      openedKnownCurrency: null,
    };
  },
  computed: {
    knownCurrencies () {
      return [
        { name: 'Lumenauts', details: '100 % return from inflation pool', public_key: 'ABCD12313ABCD643563546345783456' },
        { name: 'Greenpeace', details: 'vote for the environment', public_key: 'AFFF12313ABCD643563546345783451' },
        { name: 'Naomi foundation', details: 'vote for children', public_key: 'ACCC12313ABCD643563546345783456' },
      ];
    }
  },
  watch: {
    loading (loading) {
      if (!loading && this.errors.length === 0) {
        this.fieldOpen = false;
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
    async onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { destination: this.destination, password: this.password };
      this.$emit('submit', this.backendQuery);
    }
  },
  validations () {
    return {
      destination: {
        required,
        ...validators.publicKey.call(this),
      },
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

.known-currencies {
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
  .error {
    margin: -12px 0;
    display: block;
  }
  .checkbox {
    float: right;
  }
}
</style>
