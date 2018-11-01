<template>
  <b-form class="form" @submit.prevent="onSaveClick">
    <b-row v-if="!loading">
      <b-col cols="12 pb-4 mb-3">
        <div v-if="hasUnknownError" class="text-danger">Unknown backend error!</div>
      </b-col>

      <b-col cols="12" role="tablist">
        <b-card no-body class="flat-card mt-3">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn v-b-toggle.personal-data-accordion-my-data block href="#" variant="default">My Data</b-btn>
          </b-card-header>
          <b-collapse id="personal-data-accordion-my-data" accordion="personal-data-accordion" role="tabpanel">
            <b-card-body>
              <b-form-group :label-for="`personal-data-salutation`" label="Salutation">
                <b-form-select :id="`personal-data-salutation`" v-model="salutation" :options="salutationOptions"/>
              </b-form-group>

              <b-form-group label-for="personal-data-last-name">
                <b-form-input
                  id="personal-data-last-name"
                  :class="{ error: $v.lastName.$error }"
                  v-model="lastName"
                  :state="!$v.lastName.$error"
                  type="text"
                  placeholder="Last name"
                  aria-describedby="inputLiveLastNameHelp inputLiveLastNameFeedback"
                  required
                  @blur.native="$v.lastName.$touch()"/>
                <b-form-invalid-feedback id="inputLiveLastNameFeedback">
                  <template v-if="$v.lastName.$error" class="field-errors">
                    <template v-if="!$v.lastName.maxLength">Lastname should be shorter than 64 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveLastNameHelp">
                  Last name
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-first-name">
                <b-form-input
                  id="personal-data-first-name"
                  :class="{ error: $v.firstName.$error }"
                  v-model="firstName"
                  :state="!$v.firstName.$error"
                  type="text"
                  placeholder="First name"
                  aria-describedby="inputLiveFirstNameHelp inputLiveFirstNameFeedback"
                  required
                  @blur.native="$v.firstName.$touch()"/>
                <b-form-invalid-feedback id="inputLiveFirstNameFeedback">
                  <template v-if="$v.firstName.$error" class="field-errors">
                    <template v-if="!$v.firstName.maxLength">First name should be shorter than 64 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveFirstNameHelp">
                  First name
                </b-form-text>
              </b-form-group>
              <b-form-group label-for="personal-data-additional-name">
                <b-form-input
                  id="personal-data-additional-name"
                  :class="{ error: $v.additionalName.$error }"
                  v-model="additionalName"
                  :state="!$v.additionalName.$error"
                  type="text"
                  placeholder="Additional name"
                  aria-describedby="inputLiveAdditionalNameHelp inputLiveAdditionalNameFeedback"
                  required
                  @blur.native="$v.additionalName.$touch()"/>
                <b-form-invalid-feedback id="inputLiveAdditionalNameFeedback">
                  <template v-if="$v.additionalName.$error" class="field-errors">
                    <template v-if="!$v.additionalName.maxLength">Additional name should be shorter than 256 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveAdditionalNameHelp">
                  Additional name
                </b-form-text>
              </b-form-group>

              <b-form-group :label-for="`personal-data-country`" label="Country">
                <b-form-select :id="`personal-data-country`" v-model="country" :options="countryOptions"/>
              </b-form-group>

              <b-form-group label-for="personal-data-state">
                <b-form-input
                  id="personal-data-state"
                  :class="{ error: $v.state.$error }"
                  v-model="state"
                  :state="!$v.state.$error"
                  type="text"
                  placeholder="State"
                  aria-describedby="inputLiveStateHelp inputLiveStateFeedback"
                  required
                  @blur.native="$v.state.$touch()"/>
                <b-form-invalid-feedback id="inputLiveStateFeedback">
                  <template v-if="$v.state.$error" class="field-errors">
                    <template v-if="!$v.state.maxLength">State should be shorter than 128 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveStateHelp">
                  State
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-city">
                <b-form-input
                  id="personal-data-city"
                  :class="{ error: $v.city.$error }"
                  v-model="city"
                  :state="!$v.city.$error"
                  type="text"
                  placeholder="City"
                  aria-describedby="inputLiveCityHelp inputLiveCityFeedback"
                  required
                  @blur.native="$v.city.$touch()"/>
                <b-form-invalid-feedback id="inputLiveCityFeedback">
                  <template v-if="$v.city.$error" class="field-errors">
                    <template v-if="!$v.city.maxLength">City should be shorter than 128 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveCityHelp">
                  City
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-zip-code">
                <b-form-input
                  id="personal-data-zip-code"
                  :class="{ error: $v.zipCode.$error }"
                  v-model="zipCode"
                  :state="!$v.zipCode.$error"
                  type="text"
                  placeholder="Postal code"
                  aria-describedby="inputLiveZipCodeHelp inputLiveZipCodeFeedback"
                  required
                  @blur.native="$v.zipCode.$touch()"/>
                <b-form-invalid-feedback id="inputLiveZipCodeFeedback">
                  <template v-if="$v.zipCode.$error" class="field-errors">
                    <template v-if="!$v.zipCode.zipFormat">Invalid ZIP code!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveZipCodeHelp">
                  Postal code
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-address">
                <b-form-input
                  id="personal-data-address"
                  :class="{ error: $v.address.$error }"
                  v-model="address"
                  :state="!$v.address.$error"
                  type="text"
                  placeholder="Address"
                  aria-describedby="inputLiveAddressHelp inputLiveAddressFeedback"
                  required
                  @blur.native="$v.address.$touch()"/>
                <b-form-invalid-feedback id="inputLiveAddressFeedback">
                  <template v-if="$v.address.$error" class="field-errors">
                    <template v-if="!$v.address.maxLength">Address should be shorter than 512 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveAddressHelp">
                  Address
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-mobile">
                <b-form-input
                  id="personal-data-mobile"
                  :class="{ error: $v.mobileNum.$error }"
                  v-model="mobileNum"
                  :state="!$v.mobileNum.$error"
                  type="text"
                  placeholder="Mobile number"
                  aria-describedby="inputLiveMobileNumberHelp inputLiveMobileNumberFeedback"
                  required
                  @blur.native="$v.mobileNum.$touch()"/>
                <b-form-invalid-feedback id="inputLiveMobileNumberFeedback">
                  <template v-if="$v.mobileNum.$error" class="field-errors">
                    <template v-if="!$v.mobileNum.validPhone">Invalid phone number!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveMobileNumberHelp">
                  Mobile number
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-birth-date" class="mx-2">
                <div class="datepicker-wrapper p-0">
                  <datepicker id="personal-data-birth-date" v-model="birthDate" format="yyyy-MM-dd" placeholder="Birth date" class="py-1"/>
                  <i class="icon-calendar"/>
                </div>
                <small class="form-text text-muted">Birth date</small>
              </b-form-group>

              <b-form-group label-for="personal-data-birth-place">
                <b-form-input
                  id="personal-data-birth-place"
                  v-model="birthPlace"
                  type="text"
                  placeholder="Birth place"
                  aria-describedby="inputLiveBirthPlaceHelp inputLiveBirthPlaceFeedback"
                  required
                  @blur.native="$v.birthPlace.$touch()"/>
                <b-form-invalid-feedback id="inputLiveBirthPlaceFeedback">
                  <template v-if="$v.birthPlace.$error" class="field-errors">
                    <template v-if="!$v.birthPlace.maxLength">Birth place should be shorter than 128 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveBirthPlaceHelp">
                  Birth place
                </b-form-text>
              </b-form-group>

              <b-form-group :label-for="`personal-data-birth-country`" label="Birth Country">
                <b-form-select :id="`personal-data-birth-country`" v-model="birthCountry" :options="countryOptions"/>
              </b-form-group>

              <b-form-group :label-for="`personal-data-language`" label="Primary language">
                <b-form-select :id="`personal-data-language`" v-model="language" :options="languageOptions"/>
              </b-form-group>
            </b-card-body>
          </b-collapse>
        </b-card>

        <b-card no-body class="flat-card mt-3">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn v-b-toggle.personal-data-accordion-my-occupation block href="#" variant="default">My Occupation</b-btn>
          </b-card-header>
          <b-collapse id="personal-data-accordion-my-occupation" accordion="personal-data-accordion" role="tabpanel">
            <b-card-body>

              <b-form-group :label-for="`personal-data-occupation`" label="Occupation">
                <div class="select-wrapper">
                  <v-select :input-id="`personal-data-occupation`" :value="occupation" :options="occupationOptions" :loading="loadingOccupations" :on-search="onOccupationSearch" :on-change="onChangeOccupation"/>
                </div>
              </b-form-group>

              <b-form-group label-for="personal-data-employer-name">
                <b-form-input
                  id="personal-data-employer-name"
                  v-model="employerName"
                  type="text"
                  placeholder="Employer name"
                  aria-describedby="inputLiveEmployerNameHelp inputLiveEmployerNameFeedback"
                  required
                  @blur.native="$v.employerName.$touch()"/>
                <b-form-invalid-feedback id="inputLiveEmployerNameFeedback">
                  <template v-if="$v.employerName.$error" class="field-errors">
                    <template v-if="!$v.employerName.maxLength">Employer name should be shorter than 512 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveEmployerNameHelp">
                  Employer name
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-employer-address">
                <b-form-input
                  id="personal-data-employer-address"
                  v-model="employerAddress"
                  type="text"
                  placeholder="Employer address"
                  aria-describedby="inputLiveEmployerAddressHelp inputLiveEmployerAddressFeedback"
                  required
                  @blur.native="$v.employerAddress.$touch()"/>
                <b-form-invalid-feedback id="inputLiveEmployerAddressFeedback">
                  <template v-if="$v.employerAddress.$error" class="field-errors">
                    <template v-if="!$v.employerAddress.maxLength">Employer address should be shorter than 512 characters!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveEmployerAddressHelp">
                  Employer address
                </b-form-text>
              </b-form-group>
            </b-card-body>
          </b-collapse>
        </b-card>

        <b-card no-body class="flat-card mt-3">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn v-b-toggle.personal-data-accordion-my-bank block href="#" variant="default">My Bank account</b-btn>
          </b-card-header>
          <b-collapse id="personal-data-accordion-my-bank" accordion="personal-data-accordion" role="tabpanel">
            <b-card-body>
              <b-form-group label-for="personal-data-bank-account-number">
                <b-form-input
                  id="personal-data-bank-account-number"
                  v-model="bankAccountNumber"
                  type="text"
                  placeholder="Bank account number"
                  aria-describedby="inputLiveBankAccountNumberHelp"
                  required
                  @focus.native="onUpdateBankData"
                  @blur.native="onBlurBankData"/>
                <b-form-text id="inputLiveBankAccountNumberHelp">
                  Bank account number
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-bank-number">
                <b-form-input
                  id="personal-data-bank-number"
                  v-model="bankNumber"
                  type="text"
                  placeholder="Bank number"
                  aria-describedby="inputLiveBankNumberHelp"
                  required
                  @focus.native="onUpdateBankData"
                  @blur.native="onBlurBankData"/>
                <b-form-text id="inputLiveBankNumberHelp">
                  Bank number
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-bank-phone-number">
                <b-form-input
                  id="personal-data-bank-phone-number"
                  :class="{ error: $v.bankPhoneNumber.$error }"
                  v-model="bankPhoneNumber"
                  :state="!$v.bankPhoneNumber.$error"
                  type="text"
                  placeholder="Bank phone number"
                  aria-describedby="inputLiveBankPhoneNumberHelp inputLiveBankPhoneNumberFeedback"
                  required
                  @focus.native="onUpdateBankData"
                  @blur.native="onBlurBankData, $v.bankPhoneNumber.$touch()"/>
                <b-form-invalid-feedback id="inputLiveBankPhoneNumberFeedback">
                  <template v-if="$v.bankPhoneNumber.$error" class="field-errors">
                    <template v-if="!$v.bankPhoneNumber.validPhone">Invalid phone number!</template>
                  </template>
                </b-form-invalid-feedback>
                <b-form-text id="inputLiveBankPhoneNumberHelp">
                  Bank phone number
                </b-form-text>
              </b-form-group>
            </b-card-body>
          </b-collapse>
        </b-card>

        <b-card no-body class="flat-card mt-3">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn v-b-toggle.personal-data-accordion-my-tax block href="#" variant="default">My Tax info</b-btn>
          </b-card-header>
          <b-collapse id="personal-data-accordion-my-tax" accordion="personal-data-accordion" role="tabpanel">
            <b-card-body>

              <b-form-group label-for="personal-data-tax-id">
                <b-form-input
                  id="personal-data-tax-id"
                  v-model="taxId"
                  type="text"
                  placeholder="Tax ID"
                  aria-describedby="inputLiveTaxIdHelp"
                  required/>
                <b-form-text id="inputLiveTaxIdHelp">
                  Tax ID
                </b-form-text>
              </b-form-group>

              <b-form-group label-for="personal-data-tax-id-name">
                <b-form-input
                  id="personal-data-tax-id-name"
                  v-model="taxIdName"
                  type="text"
                  placeholder="Tax ID Name"
                  aria-describedby="inputLiveTaxIdNameHelp"
                  required/>
                <b-form-text id="inputLiveTaxIdNameHelp">
                  Tax ID Name
                </b-form-text>
              </b-form-group>
            </b-card-body>
          </b-collapse>
        </b-card>
      </b-col>

      <b-col class="text-center pt-4">
        <b-button variant="success" class="btn-rounded text-uppercase" @click.prevent="onSaveClick">Save</b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

import validators from '@/validators';
import UserService from '@/services/user';

import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

import Datepicker from 'vuejs-datepicker';

export default {
  name: 'PersonalDataForm',
  components: { Datepicker },
  mixins: [ formMixin, updatePasswordVisibilityState ],

  props: {
    data: {
      type: Object,
      required: true,
    },
    languages: {
      type: Array,
      required: true,
    },
    countries: {
      type: Array,
      required: true,
    },
    salutations: {
      type: Array,
      required: true,
    },
  },

  data () {
    return {
      salutation: this.data.salutation,
      lastName: this.data.lastname,
      firstName: this.data.forename,
      additionalName: this.data.additional_name,
      country: this.data.country_code,
      state: this.data.state,
      city: this.data.city,
      zipCode: this.data.zip_code,
      address: this.data.address,
      mobileNum: this.data.mobile_nr,
      language: this.data.language_code,
      birthDate: this.data.birth_day || '',
      birthPlace: this.data.birth_place,
      birthCountry: this.data.birth_country_code,
      occupation: this.data.occupation_name, // `${this.data.occupation_code08}_${this.data.occupation_code88}`,
      occupationCode08: this.data.occupation_code08,
      occupationCode88: this.data.occupation_code88,
      employerName: this.data.employer_name,
      employerAddress: this.data.employer_address,
      bankAccountNumber: this.data.bank_account_number ? `****${this.data.bank_account_number}` : '',
      bankNumber: this.data.bank_number ? `****${this.data.bank_number}` : '',
      bankPhoneNumber: this.data.bank_phone_number ? `****${this.data.bank_phone_number}` : '',
      taxId: this.data.tax_id,
      taxIdName: this.data.tax_id_name,

      updatingBankData: false,

      loadingOccupations: false,

      occupations: [],
    };
  },

  computed: {
    salutationOptions () {
      return [...this.salutations];
    },
    languageOptions () {
      return this.languages.map(l => ({ value: l.lang_code, text: l.lang_name }));
    },
    occupationOptions () {
      return this.occupations.map(o => ({ value: `${o.code08}_${o.code88}`, label: o.name }));
    },
    countryOptions () {
      return this.countries.map(c => ({ value: c.code, text: c.name }));
    },
    strippedMobileNum () {
      return this.mobileNum.replace(/[()\- ]/g, '');
    },
    strippedBankPhone () {
      return this.bankPhoneNumber.replace(/[()\- ]/g, '');
    },
  },

  created () {
    this.onOccupationSearch('');
  },

  methods: {
    async onOccupationSearch (search) {
      this.loadingOccupations = true;
      this.occupations = await UserService.getOccupationList({ name: search });
      this.loadingOccupations = false;
    },
    onChangeOccupation (val) {
      if (!val) {
        this.occupationCode08 = '';
        this.occupationCode88 = '';
        this.occupation = '';
      } else if (typeof val !== 'string') {
        const splitted = val.value.split('_');
        this.occupationCode08 = splitted[0];
        this.occupationCode88 = splitted[1];
        this.occupation = val.label;
      }
    },
    onUpdateBankData () {
      if (this.updatingBankData) return;
      this.updatingBankData = true;
      this.bankAccountNumber = '';
      this.bankNumber = '';
      this.bankPhoneNumber = '';
    },
    onBlurBankData () {
      if (!this.updatingBankData) return;
      if (!this.bankAccountNumber && !this.bankNumber && !this.bankPhoneNumber) {
        this.updatingBankData = false;
        this.bankAccountNumber = this.data.bank_account_number ? `****${this.data.bank_account_number}` : '';
        this.bankNumber = this.data.bank_number ? `****${this.data.bank_number}` : '';
        this.bankPhoneNumber = this.data.bank_phone_number ? `****${this.data.bank_phone_number}` : '';
      }
    },
    onSaveClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      let birthDate = '';
      const bDay = new Date(this.birthDate);
      if ((bDay instanceof Date && isFinite(bDay))) {
        const month = `0${bDay.getMonth() + 1}`;
        const day = `0${bDay.getDate()}`;
        birthDate = `${bDay.getFullYear()}-${month.slice(-2)}-${day.slice(-2)}`;
      }

      this.backendQuery = {
        forename: this.firstName,
        lastname: this.lastName,
        salutation: this.salutation,
        address: this.address,
        zip_code: this.zipCode,
        city: this.city,
        state: this.state,
        country_code: this.country,
        mobile_nr: this.mobileNum,
        birth_day: birthDate,
        birth_place: this.birthPlace,
        additional_name: this.additionalName,
        birth_country_code: this.birthCountry,
        ...(this.updatingBankData ? {
          bank_account_number: this.bankAccountNumber,
          bank_number: this.bankNumber,
          bank_phone_number: this.bankPhoneNumber,
        } : {}),
        tax_id: this.taxId,
        tax_id_name: this.taxIdName,
        occupation_name: this.occupation,
        occupation_code08: this.occupationCode08,
        occupation_code88: this.occupationCode88,
        employer_name: this.employerName,
        employer_address: this.employerAddress,
        language_code: this.language,
      };

      this.$emit('submit', this.backendQuery);
    }
  },

  validations () {
    return {
      firstName: validators.forename.call(this),
      lastName: validators.lastname.call(this),
      additionalName: validators.additionalName.call(this),
      state: validators.state.call(this),
      city: validators.city.call(this),
      zipCode: validators.zipCode.call(this),
      address: validators.streetAddress.call(this),
      mobileNum: {
        validPhone: () => validators.mobilePhone.call(this).validPhone(this.strippedMobileNum),
      },
      birthDate: {},
      birthPlace: validators.birthPlace.call(this),
      employerName: validators.employerName.call(this),
      employerAddress: validators.employerAddress.call(this),
      bankPhoneNumber: {
        validPhone: () => !this.updatingBankData || validators.mobilePhone.call(this).validPhone(this.strippedBankPhone),
      },
    };
  }
};
</script>
