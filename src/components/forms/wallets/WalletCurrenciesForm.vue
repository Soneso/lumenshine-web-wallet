<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <div>
      <p>
        <strong>Currencies</strong>
        <a v-if="!addCurrency" href="#" class="only-desktop" @click.prevent="openAddCurrency">add currency</a>
      </p>
      <p v-for="balance in balances" :key="balance.type" class="balance">
        <span>
          {{ getCurrencyName(balance.type) ? `${getCurrencyName(balance.type)} (${ balance.type })`: balance.type }}
        </span>
        <a v-if="balance.type !== 'XLM' && removeFieldBalance !== balance" href="#" class="error only-desktop" @click.prevent="openRemoveCurrency(balance)">remove</a>
        <span v-if="balance.issuer && !removeFieldBalance" class="balance__details">Issuer public key: {{ balance.issuer }}</span>
      </p>

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
          <div v-if="!$v.password.decryptValid">Invalid password</div>
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
    decryptError: {
      type: Boolean,
      required: true,
    }
  },
  data () {
    return {
      removeFieldBalance: null,
      password: '',
      assetCode: '',
      issuer: '',
      addCurrency: false,
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
  methods: {
    openAddCurrency () {
      this.addCurrency = true;
      this.removeFieldBalance = null;
    },
    openRemoveCurrency (balance) {
      this.addCurrency = false;
      this.removeFieldBalance = balance;
    },
    async onAddClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { assetCode: this.assetCode, issuer: this.issuer, password: this.password };
      this.$emit('add', this.backendQuery);
    },
    async onRemoveClick (balance) {
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
      assetCode: {
        required,
        ...assetCodeValidator.call(this),
      },
      issuer: {
        required,
        ...publicKeyValidator.call(this),
        validIssuer: value => this.backendQuery.issuer !== value || !this.errors.find(err => err.error_code === 'INVALID_ISSUER'),
      },
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.decryptError,
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
</style>
