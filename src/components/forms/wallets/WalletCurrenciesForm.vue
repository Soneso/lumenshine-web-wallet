<template>
  <form class="form" @submit.prevent>
    <div>
      <p>
        <strong>Currencies</strong>
        <a v-if="!addCurrency" href="#" class="only-desktop" @click.prevent="openAddCurrency">add currency</a>
      </p>
      <b-list-group v-if="!removeFieldBalance && !addCurrency" class="py-3">
        <b-list-group-item v-for="balance in balances" :key="balance.type + balance.issuer">
          <h5>
            {{ getCurrencyName(balance.type) ? `${getCurrencyName(balance.type)} (${ balance.type })`: balance.type }}
            <a v-if="balance.type !== 'XLM' && removeFieldBalance !== balance" href="#" class="text-danger small" @click.prevent="openRemoveCurrency(balance)">remove</a>
          </h5>
          <span v-if="balance.issuer && !removeFieldBalance" class="balance__details">Issuer public key: <small>{{ balance.issuer }}</small></span>
        </b-list-group-item>
      </b-list-group>

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

        <b-button-group class="py-2">
          <b-button :disabled="addCurrencyFormType === 'known'" variant="default" @click="onTabChange('known')">Known Currencies</b-button>
          <b-button :disabled="addCurrencyFormType === 'fields'" variant="default" @click="onTabChange('fields')">Provide Currency Data</b-button>
        </b-button-group>

        <div v-if="addCurrencyFormType === 'fields'" class="tab-page">
          <div>
            <b-form-group :label-for="`assetCodeInput_${uuid}`" label="Public key of currency issuer">
              <b-form-input
                :id="`assetCodeInput_${uuid}`"
                :class="{ error: $v.assetCode.$error }"
                :aria-describedby="`inputLiveAssetCodeHelp_${uuid} inputLiveAssetCodeFeedback_${uuid}`"
                v-model="assetCode"
                :state="!$v.assetCode.$error"
                type="text"
                placeholder="Currency/asset code, e.g. MOBI"
                required
                @blur="$v.assetCode.$touch()"/>
              <b-form-invalid-feedback :id="`inputLiveAssetCodeFeedback_${uuid}`">
                <template v-if="$v.assetCode.$error" class="field__errors">
                  <template v-if="!$v.assetCode.required">Asset code is required</template>
                  <template v-if="!$v.assetCode.validAssetCode">Invalid asset code</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text :id="`inputLiveAssetCodeHelp_${uuid}`">
                Currency/asset code, e.g. MOBI
              </b-form-text>
            </b-form-group>

            <b-form-group :label-for="`issuerInput_${uuid}`" label="Public key of currency issuer">
              <b-form-input
                :id="`issuerInput_${uuid}`"
                :class="{ error: $v.issuer.$error }"
                :aria-describedby="`inputLiveIssuerHelp_${uuid} inputLiveIssuerFeedback_${uuid}`"
                v-model="issuer"
                :state="!$v.issuer.$error"
                type="text"
                placeholder="Public key of currency issuer"
                required
                @blur="$v.issuer.$touch()"/>
              <b-form-invalid-feedback :id="`inputLiveIssuerFeedback_${uuid}`">
                <template v-if="$v.issuer.$error" class="field__errors">
                  <template v-if="!$v.issuer.required">Issuer is required</template>
                  <template v-if="!$v.issuer.publicKey">Invalid issuer</template>
                  <template v-if="!$v.issuer.validIssuer">Issuer does not exists</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text :id="`inputLiveIssuerHelp_${uuid}`">
                Public key of currency issuer
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
                placeholder="Password"
                required
                @blur="$v.password.$touch()"/>
              <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
                <template v-if="$v.password.$error" class="field__errors">
                  <template v-if="!$v.password.required">Password is required!</template>
                  <template v-if="!$v.password.validPassword">Wrong password!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text :id="`inputLivePasswordHelp_${uuid}`">
                Your password.
              </b-form-text>
            </b-form-group>

            <b-form-group v-if="!canSignWithPassword" :label-for="`signerInput_${uuid}`" label="Select signer for payment">
              <b-form-select id="signerInput" v-model="signer" :options="signers.map(signer => signer.public_key)" placeholder="Signers"/>
              <b-form-input
                :id="`signerSeedInput_${uuid}`"
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
          <b-list-group>
            <b-list-group-item v-for="currency in knownCurrencies" :key="currency.asset_code + currency.issuer_public_key">
              <h5>{{ currency.name }} ({{ currency.asset_code }})</h5>
              <span v-if="currency.needsAuth" class="text-danger">needs issuer athorization</span>
              <p>Issuer public key: {{ currency.issuer_public_key.slice(0, 10) }}...</p>
            </b-list-group-item>
          </b-list-group>
          <div v-if="openedKnownCurrency === null" class="form-buttons">
            <a href="#" @click.prevent="onOpenKnownCurrency(currency)">add</a>
          </div>
          <div v-else-if="openedKnownCurrency === currency">
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
                  <template v-if="!$v.password.validPassword">Wrong password!</template>
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
                v-model="signerSeed"
                :state="!$v.signerSeed.$error"
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
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import Amount from '@/util/Amount';

import validators from '@/validators';

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
      signer: null,
      signerSeed: '',
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
      this.signer = null;
      this.signerSeed = '';
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

      const signerData = this.canSignWithPassword
        ? { password: this.password }
        : {
          signer: this.signer,
          signerSeed: this.signerSeed,
        };

      if (this.openedKnownCurrency) {
        this.backendQuery = {
          assetCode: this.openedKnownCurrency.asset_code,
          issuer: this.openedKnownCurrency.issuer_public_key,
          ...signerData,
        };
      } else {
        this.backendQuery = {
          assetCode: this.assetCode,
          issuer: this.issuer,
          ...signerData
        };
      }

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
      ...(this.openedKnownCurrency ? {} : {
        assetCode: {
          required,
          ...validators.assetCode.call(this),
        },
        issuer: {
          required,
          ...validators.publicKey.call(this),
          validIssuer: value => this.backendQuery.issuer !== value || !this.errors.find(err => err.error_code === 'INVALID_ISSUER'),
        },
      }),
      ...signerValidators
    };
  }
};
</script>
