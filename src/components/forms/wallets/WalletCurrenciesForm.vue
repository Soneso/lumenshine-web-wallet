<template>
  <b-form @submit.prevent>
    <!-- remove currencies / add currency / currencies list buttons -->
    <template v-if="removeFieldBalance">
      <span class="font-weight-600">Remove currency</span>
      <a v-if="!loading" href="#" class="text-warning" @click.prevent="removeFieldBalance = null">cancel</a>
    </template>
    <template v-else-if="addCurrency">
      <span class="font-weight-600">Add currency</span>
      <a v-if="!loading" href="#" class="text-warning" @click.prevent="addCurrency = false">cancel</a>
    </template>
    <template v-else>
      <span class="font-weight-600">Currencies</span>
      <a href="#" class="text-info" @click.prevent="openAddCurrency">add currency</a>
    </template>

    <!-- currencies list -->
    <b-list-group v-if="!removeFieldBalance && !addCurrency" class="py-3">
      <b-list-group-item v-for="balance in balances" :key="balance.type + balance.issuer" :id="balance.type + balance.issuer">
        <h6 class="m-0">
          {{ getCurrencyName(balance.type) ? `${getCurrencyName(balance.type)} (${ balance.type })`: balance.type }}
          <template v-if="!removeFieldBalance && issuerHomeAccount[balance.issuer] && issuerDetails[issuerHomeAccount[balance.issuer]] !== null">
            <a v-if="issuerDetails[issuerHomeAccount[balance.issuer]] !== undefined && openedCurrencyDetails !== `${balance.type}-${balance.issuer}`" href="#" @click.prevent="openedCurrencyDetails = `${balance.type}-${balance.issuer}`"><small>details</small></a>
          </template>
          <a v-if="balance.type !== 'XLM' && removeFieldBalance !== balance" href="#" class="text-danger small pull-right" @click.prevent="openRemoveCurrency(balance)">remove</a>
        </h6>
        <small v-if="balance.issuer && !removeFieldBalance" class="break-word with-hyphens">
          Issuer public key: <public-key :text="balance.issuer" :tune-with="balance.type" color="text-secondary"/>
        </small>
        <template v-if="!removeFieldBalance && issuerHomeAccount[balance.issuer]">
          <small class="break-word with-hyphens">
            <br>Home domain: <a :href="`https://${issuerHomeAccount[balance.issuer]}`" target="_blank" rel="noopener noreferrer">https://{{ issuerHomeAccount[balance.issuer] }}</a>
          </small>
          <small v-if="issuerDetails[issuerHomeAccount[balance.issuer]] === null" class="break-word with-hyphens">
            <br>Issuer details: no information found
          </small>
          <small v-if="openedCurrencyDetails === `${balance.type}-${balance.issuer}`">
            <issuer-details :details="issuerDetails[issuerHomeAccount[balance.issuer]]" :asset-code="balance.type" :issuer="balance.issuer" :home-domain="issuerHomeAccount[balance.issuer]"/>
          </small>
        </template>
      </b-list-group-item>
    </b-list-group>

    <!-- remove currency -->
    <template v-if="removeFieldBalance">
      <b-card class="flat-card my-3">
        <h6>{{ getCurrencyName(removeFieldBalance.type) ? `${getCurrencyName(removeFieldBalance.type)} (${ removeFieldBalance.type })`: removeFieldBalance.type }}</h6>
        <small v-if="removeFieldBalance.issuer" class="d-block">Issuer public key: <public-key :text="removeFieldBalance.issuer" :chars="isMobile ? 22 : 36" color="text-secondary"/></small>
        <small>Balance: <span class="font-weight-600">{{ removeFieldBalance.balance.format() }} {{ removeFieldBalance.type }}</span><br></small>
        <small v-if="!removeFieldBalance.selling_liabilities.equal('0')">Selling liabilities: <span class="font-weight-600">{{ removeFieldBalance.selling_liabilities.format() }} {{ removeFieldBalance.type }}</span><br></small>
        <small v-if="!removeFieldBalance.buying_liabilities.equal('0')">Buying liabilities: <span class="font-weight-600">{{ removeFieldBalance.buying_liabilities.format() }} {{ removeFieldBalance.type }}</span><br></small>
        <small v-if="!removeFieldBalance.balance.equal('0') || !removeFieldBalance.selling_liabilities.equal('0') || !removeFieldBalance.buying_liabilities.equal('0')" class="text-danger d-block py-3">
          The currency can only be removed if its balance is zero and if it has no liabilities<br>
          Hint: you can abandon your credits by sending them to the issuer account displayed above.
        </small>
        <template v-else>
          <b-form-group>
            <b-form-input
              id="nameInput_1"
              :class="{ error: $v.password.$error }"
              :state="!$v.password.$error"
              :type="password1IsHidden ? 'password' : 'text'"
              v-model="password"
              aria-describedby="inputLiveNameFeedback_1"
              placeholder="Password"
              required
              @blur.native="$v.password.$touch()"/>

            <password-assets :password="['password1IsHidden', password1IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

            <b-form-invalid-feedback id="inputLiveNameFeedback_1">
              <template v-if="$v.password.$error" class="field-errors">
                <template v-if="!$v.password.required">Password is required <br></template>
                <template v-if="!$v.password.decryptValid">Invalid password</template>
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
          <div v-if="hasUnknownError" class="text-danger">An error occured, please try again</div>
          <div class="form-buttons">
            <a href="#" @click.prevent="onRemoveClick(removeFieldBalance)">
              <spinner v-if="loading" :size="21" message="removing..." width="100"/>
              <span v-else-if="!removeFieldBalance.balance.equal('0')">remove & abandon credits</span>
              <span v-else>remove</span>
            </a>
          </div>
        </template>
      </b-card>
    </template>

    <div v-if="addCurrency">
      <b-button-group v-if="knownCurrencies.length > 0" size="sm" class="my-2">
        <b-button :class="addCurrencyFormType === 'fields' ? 'text-info' : 'text-gray-500'" variant="outline-secondary" @click="onTabChange('fields')">Provide Currency Data</b-button>
        <b-button :class="addCurrencyFormType === 'known' ? 'text-info' : 'text-gray-500'" variant="outline-secondary" @click="onTabChange('known')">Known Currencies</b-button>
      </b-button-group>
      <div v-else class="my-3"/>

      <div v-if="addCurrencyFormType === 'known'"> <!-- Known currencies -->
        <b-card v-if="openedKnownCurrency" class="flat-card">
          <b-form-group v-if="canSignWithPassword">
            <b-form-input
              :id="`passwordInput_${uuid}`"
              :class="{ error: $v.password.$error }"
              :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
              :state="!$v.password.$error"
              :type="password3IsHidden ? 'password' : 'text'"
              v-model="password"
              placeholder="Your password"
              autocomplete="new-password"
              required
              @blur.native="$v.password.$touch()"/>

            <password-assets :password="['password3IsHidden', password3IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

            <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
              <template v-if="$v.password.$error" class="field-errors">
                <template v-if="!$v.password.required">Password is required! <br></template>
                <template v-if="!$v.password.decryptValid">Invalid password</template>
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
              @blur.native="$v.signerSeed.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveSignerSeedFeedback_${uuid}`">
              <template v-if="$v.signerSeed.$error" class="field-errors">
                <template v-if="!$v.signerSeed.required">Secret seed is required! <br></template>
                <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
              Your secret seed for selected signer.
            </b-form-text>
          </b-form-group>
          <div v-if="hasUnknownError" class="text-danger">An error occured, please try again</div>
          <div class="mt-3 mb-2">
            <div>
              <a v-if="!loading" href="#" class="text-warning mr-2 d-inline-block" @click.prevent="onOpenKnownCurrency(null)">cancel</a>
              <a href="#" class="text-info d-inline-block" @click.prevent="onAddClick">
                <template v-if="!loading">add</template>
                <spinner v-else :size="21" message="adding..." width="100" />
              </a>
            </div>
          </div>
        </b-card>

        <b-list-group>
          <b-list-group-item v-for="currency in knownCurrencies" :key="currency.asset_code + currency.issuer_public_key">
            <h6>{{ currency.name }} ({{ currency.asset_code }})</h6>
            <span v-if="currency.needsAuth" class="text-danger">needs issuer athorization</span>
            <small class="break-word with-hyphens">
              Issuer public key: <public-key :text="currency.issuer_public_key" :tune-with="currency.asset_code + currency.issuer_public_key" :chars="isMobile ? 22 : 36" color="text-secondary"/>
            </small>
            <div v-if="openedKnownCurrency === null" class="pt-3">
              <a href="#" @click.prevent="onOpenKnownCurrency(currency)">add</a>
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>

      <div v-else class="tab-page">  <!-- New currencies -->
        <b-card class="flat-card">
          <b-form-group :label-for="`assetCodeInput_${uuid}`" label="Asset code">
            <b-form-input
              :id="`assetCodeInput_${uuid}`"
              :class="{ error: $v.assetCode.$error }"
              :aria-describedby="`inputLiveAssetCodeHelp_${uuid} inputLiveAssetCodeFeedback_${uuid}`"
              v-model="assetCode"
              :state="!$v.assetCode.$error"
              type="text"
              placeholder="Currency/asset code, e.g. MOBI"
              required
              @blur.native="$v.assetCode.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveAssetCodeFeedback_${uuid}`">
              <template v-if="$v.assetCode.$error" class="field-errors">
                <template v-if="!$v.assetCode.required">Asset code is required <br></template>
                <template v-if="!$v.assetCode.validAssetCode">Invalid asset code</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveAssetCodeHelp_${uuid}`">
              Currency/asset code, e.g. MOBI
            </b-form-text>
          </b-form-group>

          <b-form-group :label-for="`issuerInput_${uuid}`" label="Currency issuer">
            <b-form-input
              :id="`issuerInput_${uuid}`"
              :class="{ error: $v.issuer.$error }"
              :aria-describedby="`inputLiveIssuerHelp_${uuid} inputLiveIssuerFeedback_${uuid}`"
              v-model="issuer"
              :state="!$v.issuer.$error"
              type="text"
              placeholder="Currency issuer"
              required
              @blur.native="$v.issuer.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveIssuerFeedback_${uuid}`">
              <template v-if="$v.issuer.$error" class="field-errors">
                <template v-if="!$v.issuer.publicKeyOrAddress">Invalid destination!</template>
                <template v-if="!$v.issuer.noIssuer">Cannot find this stellar address!<br></template>
                <template v-if="!$v.issuer.required">Issuer is required <br></template>
                <template v-if="!$v.issuer.notThisWallet">Issuer cannot have the same public key as the wallet<br></template>
                <template v-if="!$v.issuer.validIssuer">Issuer does not exists</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveIssuerHelp_${uuid}`">
              Currency issuer
            </b-form-text>
          </b-form-group>

          <b-form-group v-if="canSignWithPassword">
            <b-form-input
              :id="`passwordInput_${uuid}`"
              :class="{ error: $v.password.$error }"
              :aria-describedby="`inputLivePasswordHelp_${uuid} inputLivePasswordFeedback_${uuid}`"
              :state="!$v.password.$error"
              :type="password2IsHidden ? 'password' : 'text'"
              v-model="password"
              placeholder="Password"
              autocomplete="new-password"
              required
              @blur.native="$v.password.$touch()"/>

            <password-assets :password="['password2IsHidden', password2IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

            <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
              <template v-if="$v.password.$error" class="field-errors">
                <template v-if="!$v.password.required">Password is required! <br></template>
                <template v-if="!$v.password.decryptValid">Invalid password</template>
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
              @blur.native="$v.signerSeed.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveSignerSeedFeedback_${uuid}`">
              <template v-if="$v.signerSeed.$error" class="field-errors">
                <template v-if="!$v.signerSeed.required">Secret seed is required! <br></template>
                <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
              Your secret seed for selected signer.
            </b-form-text>
          </b-form-group>
          <div v-if="hasUnknownError" class="text-danger">An error occured, please try again</div>
          <div class="py-3">
            <a v-if="!loading" href="#" class="text-warning mr-2 d-inline-block" @click.prevent="addCurrency = false">cancel</a>
            <a href="#" class="d-inline-block" @click.prevent="onAddClick">
              <spinner v-if="loading" :size="21" message="adding..." width="100"/>
              <template v-else>add</template>
            </a>
          </div>
        </b-card>
      </div>
    </div>
  </b-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';
import StellarSdk from 'stellar-sdk';

import Amount from '@/util/Amount';

import validators from '@/validators';

import formMixin from '@/mixins/form';
import spinner from '@/components/ui/spinner';
import publicKey from '@/components/ui/publicKey';
import passwordAssets from '@/components/ui/passwordAssets';
import IssuerDetails from '@/components/IssuerDetails';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

import config from '@/config';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

export default {
  components: { passwordAssets, spinner, publicKey, IssuerDetails },
  mixins: [ formMixin, updatePasswordVisibilityState ],

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
      addCurrencyFormType: 'fields',
      openedKnownCurrency: null,
      signer: null,
      signerSeed: '',
      newCurrency: '',
      password1IsHidden: true,
      password2IsHidden: true,
      password3IsHidden: true,

      issuerHomeAccount: {},
      issuerDetails: {},
      openedCurrencyDetails: null,
    };
  },

  computed: {
    ...mapGetters(['isMobile']),
    balances () {
      if (!this.data.stellar_data) return [];
      const balances = this.data.stellar_data.balances;
      const xlm = balances.find(b => b.asset_type === 'native');
      const xlmBalance = {
        balance: new Amount(xlm.balance),
        type: 'XLM',
        selling_liabilities: new Amount(xlm.selling_liabilities || '0'),
        buying_liabilities: new Amount(xlm.buying_liabilities || '0'),
      };

      const otherBalances = balances.filter(b => b.asset_type !== 'native');
      return [
        xlmBalance,
        ...otherBalances.map(bal => ({
          balance: new Amount(bal.balance),
          type: bal.asset_code,
          issuer: bal.asset_issuer,
          selling_liabilities: new Amount(bal.selling_liabilities || '0'),
          buying_liabilities: new Amount(bal.buying_liabilities || '0'),
        })),
      ];
    },
    signers () {
      if (!this.data.stellar_data) return [];
      const stellarData = this.data.stellar_data;
      const threshold = stellarData.thresholds.med_threshold;
      return stellarData.signers.filter(signer => signer.weight >= threshold);
    },
    canSignWithPassword () {
      return true;
      // !!this.signers.find(signer => signer.public_key === this.data.public_key);
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
    },
    issuerHomeAccount () {
      this.loadIssuerDetails();
    },
    balances () {
      if (this.newCurrencyId) {
        this.emphasise(this.newCurrencyId);
      }
      this.loadIssuerHomeAccounts();
    },
    removeFieldBalance (newVal) {
      if (!newVal) {
        this.resetForms();
      }
    },
    addCurrency (visible) {
      if (!visible) {
        this.resetForms();
      }
    }
  },

  created () {
    this.loadIssuerHomeAccounts();
  },

  mounted () {
    this.$on('add', (v) => {
      this.newCurrencyId = v.assetCode + v.issuer;
    });
  },

  methods: {
    async loadIssuerHomeAccounts () {
      const issuers = this.balances.map(bal => bal.issuer).filter(x => x);
      for (const issuerPub of issuers) {
        if (this.issuerHomeAccount[issuerPub] === undefined) {
          try {
            const data = await StellarAPI.loadAccount(issuerPub);
            if (data && data.home_domain) {
              this.$set(this.issuerHomeAccount, issuerPub, data.home_domain);
            } else {
              throw new Error('');
            }
          } catch (err) {
            this.$set(this.issuerHomeAccount, issuerPub, null);
          }
        }
      }
    },
    async loadIssuerDetails () {
      const homeDomains = Object.values(this.issuerHomeAccount).filter(x => x);
      for (const homeDomain of homeDomains) {
        if (this.issuerDetails[homeDomain] === undefined) {
          try {
            const toml = await StellarSdk.StellarTomlResolver.resolve(homeDomain);
            if (toml && toml.DOCUMENTATION) {
              this.$set(this.issuerDetails, homeDomain, toml);
            } else {
              throw new Error('');
            }
          } catch (err) {
            this.$set(this.issuerDetails, homeDomain, null);
          }
        }
      }
    },
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
      this.newCurrency = '';
      this.$emit('reset');
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
    },
    emphasise (id) {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('shining');
        el.scrollTop = el.scrollHeight;
        setTimeout(() => { el.classList.remove('shining'); }, 1e4);
      }
      this.newCurrencyId = '';
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
          publicKeyOrAddress: value => value === '' || validators.publicKey.call(this).publicKey(value) || validators.federationAddress.call(this).federationAddress(value),
          noIssuer: value => this.backendQuery.issuer !== value || !this.errors.find(err => err.error_code === 'NO_ISSUER'),
          notThisWallet: value => value !== this.data.public_key && !this.errors.find(err => err.error_code === 'SAME_WALLET'),
          validIssuer: value => this.backendQuery.issuer !== value || !this.errors.find(err => err.error_code === 'INVALID_ISSUER'),
        },
      }),
      ...signerValidators
    };
  }
};
</script>
