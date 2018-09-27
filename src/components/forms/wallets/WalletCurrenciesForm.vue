<template>
  <form class="form" @submit.prevent>
    <div>
      <p>
        <strong>Currencies</strong>
        <a v-if="!addCurrency" href="#" class="only-desktop" @click.prevent="openAddCurrency">add currency</a>
      </p>
      <div v-if="!removeFieldBalance && !addCurrency" class="currencies">
        <p v-for="balance in balances" :key="balance.type + balance.issuer" class="balance">
          <span>
            {{ getCurrencyName(balance.type) ? `${getCurrencyName(balance.type)} (${ balance.type })`: balance.type }}
          </span>
          <a v-if="balance.type !== 'XLM' && removeFieldBalance !== balance" href="#" class="error only-desktop" @click.prevent="openRemoveCurrency(balance)">remove</a>
          <span v-if="balance.issuer && !removeFieldBalance" class="balance__details">Issuer public key: {{ balance.issuer }}</span>
        </p>
      </div>

      <div v-if="removeFieldBalance" class="field balance balance--sub">
        <strong>Remove currency</strong>
        <a href="#" class="error only-desktop" @click.prevent="removeFieldBalance = null">cancel</a>
        <br>
        <span>
          {{ getCurrencyName(removeFieldBalance.type) ? `${getCurrencyName(removeFieldBalance.type)} (${ removeFieldBalance.type })`: removeFieldBalance.type }}
        </span>
        <span v-if="removeFieldBalance.issuer" class="balance__details">Issuer public key: {{ removeFieldBalance.issuer }}</span>
        <span>
          Balance: {{ removeFieldBalance.balance.format() }} {{ removeFieldBalance.type }}
        </span>
        <span v-if="!removeFieldBalance.balance.equal('0')" class="error"><br>Balance is not zero. If you remove this currency, your credits will also be removed.</span>
        <br>

        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required</div>
          <div v-if="!$v.password.decryptValid">Invalid password</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
        <br>
        <span>Password required to remove currency</span>
        <div class="form-buttons">
          <a href="#" @click.prevent="onRemoveClick(removeFieldBalance)">
            <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
            <span v-else-if="!removeFieldBalance.balance.equal('0')">remove & abandon credits</span>
            <span v-else>remove</span>
          </a>
        </div>
      </div>

      <div v-if="addCurrency" class="field balance">
        <strong>Add currency</strong>
        <a href="#" class="error only-desktop" @click.prevent="addCurrency = false">cancel</a>
        <br>

        <ul class="button-group">
          <li :class="['button-group__button', {'button-group__button--active': addCurrencyFormType === 'known'}]"><button @click="onTabChange('known')">Known Currencies</button></li>
          <li :class="['button-group__button', {'button-group__button--active': addCurrencyFormType === 'fields'}]"><button @click="onTabChange('fields')">Provide Currency Data</button></li>
        </ul>

        <div v-if="addCurrencyFormType === 'fields'" class="tab-page">
          <div>
            <div v-if="$v.assetCode.$error" class="field__errors">
              <div v-if="!$v.assetCode.required">Asset code is required</div>
              <div v-if="!$v.assetCode.validAssetCode">Invalid asset code</div>
            </div>
            <input :class="{ error: $v.assetCode.$error }" v-model="assetCode" type="text" placeholder="Currency/asset code, e.g. MOBI" @blur="$v.assetCode.$touch()">
            <br>

            <div v-if="$v.issuer.$error" class="field__errors">
              <div v-if="!$v.issuer.required">Issuer is required</div>
              <div v-if="!$v.issuer.publicKey">Invalid issuer</div>
              <div v-if="!$v.issuer.validIssuer">Issuer does not exists</div>
            </div>
            <input :class="{ error: $v.issuer.$error }" v-model="issuer" type="text" placeholder="Public key of currency issuer" @blur="$v.issuer.$touch()">
            <br>
            <div v-if="$v.password.$error" class="field__errors">
              <div v-if="!$v.password.required">Password required</div>
              <div v-if="!$v.password.validPassword">Invalid password</div>
            </div>
            <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">

            <br>
            <span>Password required to add currency</span>
            <div class="form-buttons">
              <a href="#" @click.prevent="onAddClick">
                <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
                <span v-else>add</span>
              </a>
            </div>
          </div>
        </div>
        <div v-else> <!-- Known currencies -->
          <ul class="known-currencies">
            <li v-for="currency in knownCurrencies" :key="currency.asset_code + currency.issuer_public_key">
              <h4>{{ currency.name }} ({{ currency.asset_code }})</h4>
              <span v-if="currency.needsAuth" class="error">needs issuer athorization</span>
              <p>Issuer public key: {{ currency.issuer_public_key.slice(0, 10) }}...</p>
              <div v-if="openedKnownCurrency === null" class="form-buttons">
                <a href="#" @click.prevent="onOpenKnownCurrency(currency)">add</a>
              </div>
              <div v-else-if="openedKnownCurrency === currency">
                <div v-if="$v.password.$error" class="field__errors">
                  <div v-if="!$v.password.required">Password required</div>
                  <div v-if="!$v.password.validPassword">Invalid password</div>
                </div>
                <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">

                <br>
                <span>Password required to add currency</span>
                <div class="form-buttons">
                  <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
                  <div v-else>
                    <a href="#" @click.prevent="onOpenKnownCurrency(null)">cancel</a>
                    <a href="#" @click.prevent="onAddClick">add</a>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import Amount from '@/util/Amount';

import assetCodeValidator from '@/validators/assetCode';
import publicKeyValidator from '@/validators/publicKey';

import formMixin from '@/mixins/form';

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    decryptionError: {
      type: Boolean,
      required: true,
    },
    knownCurrencies: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      removeFieldBalance: null,
      password: '',
      assetCode: '',
      issuer: '',
      addCurrency: false,
      addCurrencyFormType: 'known',
      openedKnownCurrency: null,
    };
  },
  computed: {
    balances () {
      if (!this.data.stellar_data) return [];
      const balances = this.data.stellar_data.balances;
      const xlmBalance = { balance: new Amount(balances.find(b => b.asset_type === 'native').balance), type: 'XLM' };

      const otherBalances = balances.filter(b => b.asset_type !== 'native');
      return [xlmBalance, ...otherBalances.map(bal => ({ balance: new Amount(bal.balance), type: bal.asset_code, issuer: bal.asset_issuer }))];
    },
  },
  watch: {
    loading (loading) {
      if (!loading && !this.decryptionError && this.errors.length === 0) {
        this.password = '';
        this.assetCode = '';
        this.issuer = '';
        this.$v.$reset();
        if (this.addCurrency) {
          this.addCurrency = false;
        }
        if (this.removeFieldBalance) {
          this.removeFieldBalance = null;
        }
        this.openedKnownCurrency = null;
      }
    }
  },
  methods: {
    onTabChange (val) {
      this.addCurrencyFormType = val;
      this.openedKnownCurrency = null;
      this.resetForms();
    },
    onOpenKnownCurrency (val) {
      this.openedKnownCurrency = val;
      this.resetForms();
    },
    resetForms () {
      this.$v.$reset();
      this.password = '';
      this.assetCode = '';
      this.issuer = '';
    },
    openAddCurrency () {
      this.addCurrency = true;
      this.removeFieldBalance = null;
    },
    openRemoveCurrency (balance) {
      this.addCurrency = false;
      this.removeFieldBalance = balance;
    },
    onAddClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.backendQuery = this.openedKnownCurrency
        ? { assetCode: this.openedKnownCurrency.asset_code, issuer: this.openedKnownCurrency.issuer_public_key, password: this.password }
        : { assetCode: this.assetCode, issuer: this.issuer, password: this.password };

      this.$emit('add', this.backendQuery);
    },
    onRemoveClick (balance) {
      this.$v.password.$touch();
      if (this.$v.password.$invalid) {
        return;
      }

      this.backendQuery = { assetCode: balance.type, issuer: balance.issuer, password: this.password };
      this.$emit('remove', this.backendQuery);
    },
    getCurrencyName (currency) {
      switch (currency) {
        case 'XLM':
          return 'Stellar Lumens';
        case 'CALI':
          return 'Cali Coin';
      }
      return null;
    }
  },
  validations () {
    return {
      ...(this.openedKnownCurrency ? {} : {
        assetCode: {
          required,
          ...assetCodeValidator.call(this),
        },
        issuer: {
          required,
          ...publicKeyValidator.call(this),
          validIssuer: value => this.backendQuery.issuer !== value || !this.errors.find(err => err.error_code === 'INVALID_ISSUER'),
        },
      }),
      password: {
        required,
        validPassword: value => this.backendQuery.password !== value || !this.decryptionError,
      }
    };
  }
};
</script>

<style lang="scss" scoped>
p {
  word-wrap: break-word;
}
.balance {
  &--sub {
    padding-left: 20px;
  }
  &__details {
    display: block;
    font-size: 12px;
  }
  input {
    width: auto;
  }
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
  input.error {
    margin-bottom: -12px;
    display: block;
  }
}

.tab-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    text-align: left;
  }
}
</style>
