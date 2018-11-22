<template>
  <form class="form" @submit.prevent="onRegisterClick">
    <template v-if="!loading">
      <b-row>
        <b-col cols="12">
          <small v-if="hasUnknownError" class="d-block pl-2 pb-3 text-danger">Unknown backend error!</small>
        </b-col>

        <b-col cols="12">
          <!--Forename field-->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('forename')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-forename"
                :class="{ error: $v.forename.$error }"
                v-model="forename"
                :state="!$v.forename.$error"
                type="text"
                placeholder="Forename"
                aria-describedby="inputLiveForenameHelp inputLiveForenameFeedback"
                @blur.native="$v.forename.$touch()"/>

              <b-form-invalid-feedback id="inputLiveForenameFeedback">
                <template v-if="$v.forename.$error" class="field-errors">
                  <template v-if="!$v.forename.required">Forename is required!</template>
                  <template v-if="!$v.forename.maxLength">Forename should be shorter than 64 characters!</template>
                  <template v-if="!$v.forename.minLength">Forename should be at least 2 characters long!</template>
                  <template v-if="!$v.forename.hasNoNumbers">Forename should not contain numbers!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveForenameHelp">
                Forename
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="12">
          <!--Lastname field-->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('lastname')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-lastname"
                :class="{ error: $v.lastname.$error }"
                v-model="lastname"
                :state="!$v.lastname.$error"
                type="text"
                placeholder="Last name"
                aria-describedby="inputLiveLastnameHelp inputLiveLastnameFeedback"
                @blur.native="$v.lastname.$touch()"/>

              <b-form-invalid-feedback id="inputLiveLastnameFeedback">
                <template v-if="$v.lastname.$error" class="field-errors">
                  <template v-if="!$v.lastname.required">Lastname is required!</template>
                  <template v-if="!$v.lastname.maxLength">Lastname should be shorter than 64 characters!</template>
                  <template v-if="!$v.lastname.minLength">Lastname should be at least 2 characters long!</template>
                  <template v-if="!$v.lastname.hasNoNumbers">Lastname should not contain numbers!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveLastnameHelp">
                Lastname
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="12">
          <!--Email field-->
          <b-form-group>
            <b-form-input
              id="signup-email"
              :class="{ error: $v.email.$error }"
              v-model="email"
              :state="!$v.email.$error"
              type="text"
              placeholder="email"
              aria-describedby="inputLiveEmailHelp inputLiveEmailFeedback"
              required
              @blur.native="$v.email.$touch()"/>
            <b-form-invalid-feedback id="inputLiveEmailFeedback">
              <template v-if="$v.email.$error" class="field-errors">
                <template v-if="!$v.email.required">Email is required! <br></template>
                <template v-if="!$v.email.email">Not valid email! <br></template>
                <template v-if="!$v.email.backendHasUser">Email already exists!</template>
                <template v-if="!$v.email.validBackendEmail">Not valid email!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text id="inputLiveEmailHelp">
              Your email address
            </b-form-text>
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <!--Password field-->
          <b-form-group>
            <b-form-input
              id="signup-password"
              :class="{ error: $v.password.$error }"
              v-model="password"
              :state="!$v.password.$error"
              :type="password1IsHidden ? 'password' : 'text'"
              placeholder="Password"
              autocomplete="off"
              aria-describedby="inputLivePasswordHelp inputLivePasswordFeedback"
              required
              @blur.native="$v.password.$touch()"/>

            <password-assets
              :password="['password1IsHidden', password1IsHidden]"
              :help-title="'Password requirement'"
              :help-text="'Your new password must have at least 9 characters \nIt must contain numbers, small and capital letters.'"
              @passwordUpdated="updatePasswordState($event)"/>

            <b-form-invalid-feedback id="inputLivePasswordFeedback">
              <template v-if="$v.password.$error" class="field-errors">
                <template v-if="!$v.password.required">Password is required! <br></template>
                <template v-if="!$v.password.minLength">Password should be longer than 9 characters! <br></template>
                <template v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character! <br></template>
                <template v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character! <br></template>
                <template v-if="!$v.password.hasNumber">Password should contain at least one number!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text id="inputLivePasswordHelp">
              Your password
            </b-form-text>
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <!--Password repeat field-->
          <b-form-group>
            <b-form-input
              id="signup-password-confirm"
              :class="{ error: $v.passwordConfirm.$error }"
              v-model="passwordConfirm"
              :state="!$v.passwordConfirm.$error"
              :type="password2IsHidden ? 'password' : 'text'"
              placeholder="Repeat password"
              autocomplete="off"
              aria-describedby="inputLivePasswordConfirmHelp inputLivePasswordConfirmFeedback"
              required
              @blur.native="$v.passwordConfirm.$touch()"/>

            <password-assets :password="['password2IsHidden', password2IsHidden]" @passwordUpdated="updatePasswordState($event)"/>

            <b-form-invalid-feedback id="inputLivePasswordConfirmFeedback">
              <template v-if="$v.passwordConfirm.$error" class="field-errors">
                <template v-if="!$v.passwordConfirm.required">Password is required again! <br></template>
                <template v-if="!$v.passwordConfirm.sameAsPass">The two passwords don't match!</template>
              </template>
            </b-form-invalid-feedback>
            <b-form-text id="inputLivePasswordConfirmHelp">
              Your password again
            </b-form-text>
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <!-- companyName field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('companyName')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-company-name"
                :class="{ error: $v.companyName.$error }"
                v-model="companyName"
                :state="!$v.companyName.$error"
                type="text"
                placeholder="Company name"
                aria-describedby="inputLiveCompanynameHelp inputLiveCompanynameFeedback"
                @blur.native="$v.companyName.$touch()"/>

              <b-form-invalid-feedback id="inputLiveCompanynameFeedback">
                <template v-if="$v.companyName.$error" class="field-errors">
                  <template v-if="!$v.companyName.maxLength">Company name should be shorter than 64 characters!</template>
                  <template v-if="!$v.companyName.hasOnlyASCII">Company name should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveCompanynameHelp">
                Company name
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- salutation field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('salutation')" class="field">
            <b-form-select v-model="salutation" class="mb-4">
              <option value="" disabled selected>Salutation</option>
              <option v-for="(option, index) in salutationOptions" :key="index">{{ option }}</option>
            </b-form-select>
          </template>
        </b-col>
        <b-col cols="12">
          <!-- title field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('title')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-title"
                :class="{ error: $v.title.$error }"
                v-model="title"
                :state="!$v.title.$error"
                type="text"
                placeholder="Title"
                aria-describedby="inputLiveTitleHelp inputLiveTitleFeedback"
                @blur.native="$v.title.$touch()"/>

              <b-form-invalid-feedback id="inputLiveTitleFeedback">
                <template v-if="$v.title.$error" class="field-errors">
                  <template v-if="!$v.title.maxLength">Title should be shorter than 64 characters!</template>
                  <template v-if="!$v.title.hasOnlyASCII">Title should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveTitleHelp">
                Title
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="12">
          <!-- streetAddress field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('streetAddress')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-street-address"
                :class="{ error: $v.streetAddress.$error }"
                v-model="streetAddress"
                :state="!$v.streetAddress.$error"
                type="text"
                placeholder="Street address"
                aria-describedby="inputLiveStreetAddressHelp inputLiveStreetAddressFeedback"
                @blur.native="$v.streetAddress.$touch()"/>

              <b-form-invalid-feedback id="inputLiveStreetAddressFeedback">
                <template v-if="$v.streetAddress.$error" class="field-errors">
                  <template v-if="!$v.streetAddress.maxLength">Street address should be shorter than 128 characters!</template>
                  <template v-if="!$v.streetAddress.hasOnlyASCII">Street address should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveStreetAddressHelp">
                Street address
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- streetNumber field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('streetNumber')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-street-number"
                :class="{ error: $v.streetNumber.$error }"
                v-model="streetNumber"
                :state="!$v.streetNumber.$error"
                type="text"
                placeholder="Street number"
                aria-describedby="inputLiveStreetNumberHelp inputLiveStreetNumberFeedback"
                @blur.native="$v.streetNumber.$touch()"/>

              <b-form-invalid-feedback id="inputLiveStreetNumberFeedback">
                <template v-if="$v.streetNumber.$error" class="field-errors">
                  <template v-if="!$v.streetNumber.maxLength">Street number should be shorter than 128 characters!</template>
                  <template v-if="!$v.streetNumber.hasOnlyASCII">Street number should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveStreetNumberHelp">
                Street number
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- zipCode field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('zipCode')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-zip"
                :class="{ error: $v.zipCode.$error }"
                v-model="zipCode"
                :state="!$v.zipCode.$error"
                type="text"
                placeholder="Zip code"
                aria-describedby="inputLiveZipCodeHelp inputLiveZipCodeFeedback"
                @blur.native="$v.zipCode.$touch()"/>

              <b-form-invalid-feedback id="inputLiveZipCodeFeedback">
                <template v-if="$v.zipCode.$error" class="field-errors">
                  <template v-if="!$v.zipCode.zipFormat">Invalid ZIP code!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveZipCodeHelp">
                Zip code
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="12">
          <!-- state field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('state')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-state"
                :class="{ error: $v.state.$error }"
                v-model="state"
                :state="!$v.state.$error"
                type="text"
                placeholder="State"
                aria-describedby="inputLiveStateHelp inputLiveStateFeedback"
                @blur.native="$v.state.$touch()"/>

              <b-form-invalid-feedback id="inputLiveStateFeedback">
                <template v-if="$v.state.$error" class="field-errors">
                  <template v-if="!$v.state.maxLength">State should be shorter than 64 characters!</template>
                  <template v-if="!$v.state.hasOnlyASCII">State should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveStateHelp">
                State
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="12">
          <!-- city field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('city')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-city"
                :class="{ error: $v.city.$error }"
                v-model="city"
                :state="!$v.city.$error"
                type="text"
                placeholder="City"
                aria-describedby="inputLiveCityHelp inputLiveCityFeedback"
                @blur.native="$v.city.$touch()"/>

              <b-form-invalid-feedback id="inputLiveCityFeedback">
                <template v-if="$v.city.$error" class="field-errors">
                  <template v-if="!$v.city.maxLength">City should be shorter than 64 characters!</template>
                  <template v-if="!$v.city.hasOnlyASCII">City should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveCityHelp">
                City
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="12">
          <!-- mobilePhone field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('mobilePhone')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-mobile-phone"
                :class="{ error: $v.strippedMobilePhone.$error }"
                v-model="strippedMobilePhone"
                :state="!$v.strippedMobilePhone.$error"
                type="text"
                placeholder="Mobile phone"
                aria-describedby="inputLiveMobilePhoneHelp inputLiveMobilePhoneFeedback"
                @blur.native="$v.strippedMobilePhone.$touch()"/>

              <b-form-invalid-feedback id="inputLiveMobilePhoneFeedback">
                <template v-if="$v.strippedMobilePhone.$error" class="field-errors">
                  <template v-if="!$v.strippedMobilePhone.validPhone">Invalid phone number!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveMobilePhoneHelp">
                Mobile phone
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- country field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('country')" class="field">
            <b-form-select v-model="country" class="mb-4">
              <option value="" disabled selected>Country</option>
              <option v-for="(option, index) in countryOptions" :key="index" :value="option.code">{{ option.name }}</option>
            </b-form-select>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- nationality field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('nationality')" class="field">
            <b-form-select v-model="nationality" class="mb-4">
              <option value="" disabled selected>Nationality</option>
              <option v-for="(option, index) in countryOptions" :key="index" :value="option.code">{{ option.name }}</option>
            </b-form-select>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- birthPlace field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('birthPlace')" class="field">
            <b-form-group>
              <b-form-input
                id="signup-birth-place"
                :class="{ error: $v.birthPlace.$error }"
                v-model="birthPlace"
                :state="!$v.birthPlace.$error"
                type="text"
                placeholder="Birth place"
                aria-describedby="inputLiveBirthPlaceHelp inputLiveBirthPlaceFeedback"
                @blur.native="$v.birthPlace.$touch()"/>

              <b-form-invalid-feedback id="inputLiveBirthPlaceFeedback">
                <template v-if="$v.birthPlace.$error" class="field-errors">
                  <template v-if="!$v.birthPlace.maxLength">Birth place should be shorter than 64 characters!</template>
                  <template v-if="!$v.birthPlace.hasOnlyASCII">Birth place should contain only ASCII characters!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveBirthPlaceHelp">
                Birth place
              </b-form-text>
            </b-form-group>
          </template>
        </b-col>

        <b-col cols="6">
          <!-- birthday field -->
          <template v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('birthday')" class="field">
            <div class="datepicker-wrapper">
              <datepicker v-model="birthday" format="yyyy-MM-dd" placeholder="Birth day" class="py-3"/>
              <i class="icon-calendar"/>
            </div>
          </template>
        </b-col>
      </b-row>
    </template>

    <!-- submit action -->
    <div class="text-center">
      <b-form-checkbox id="signup-agreement" v-model="agreed" value="accepted" unchecked-value="not_accepted" class="py-3">
        <small>
          You agree to abide by Lumenshine's <a href="/terms" target="_blank" rel="noreferrer">terms of service</a>
        </small>
      </b-form-checkbox>
      <b-button :disabled="agreed !== 'accepted'" :variant="agreed !== 'accepted' ? 'secondary' : 'success'" type="submit" class="btn-rounded text-uppercase my-3" size="lg" @click.prevent="onRegisterClick">Sign Up</b-button>
      <br>
      <small class="text-gray-500">Already have an account? Log in <router-link to="/login">here</router-link></small>
    </div>
  </form>
</template>

<script>
import { sameAs, required } from 'vuelidate/lib/validators';
import Datepicker from 'vuejs-datepicker';

import formMixin from '@/mixins/form';
import validators from '@/validators';
import config from '@/config';

import userService from '@/services/user';

import passwordAssets from '@/components/ui/passwordAssets';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';

export default {
  components: { Datepicker, passwordAssets },
  mixins: [ formMixin, updatePasswordVisibilityState ],
  data () {
    return {
      agreed: 'not_accepted',
      email: '',
      password: '',
      passwordConfirm: '',
      password1IsHidden: true,
      password2IsHidden: true,
      forename: '',
      lastname: '',
      companyName: '',
      salutation: '',
      title: '',
      streetAddress: '',
      streetNumber: '',
      zipCode: '',
      city: '',
      state: '',
      country: '',
      nationality: '',
      mobilePhone: '',
      birthday: '',
      birthPlace: '',
      salutationOptions: [],
      countryOptions: [],
      countries: {},
      config
    };
  },
  computed: {
    strippedMobilePhone () {
      return this.mobilePhone.replace(/[()\- ]/g, '');
    },
    birthdayFormatted () {
      if (!(this.birthday instanceof Date && isFinite(this.birthday))) {
        return '';
      }
      const month = `0${this.birthday.getMonth() + 1}`;
      const day = `0${this.birthday.getDate()}`;
      return `${this.birthday.getFullYear()}-${month.slice(-2)}-${day.slice(-2)}`;
    }
  },
  async created () {
    this.salutationOptions = await userService.getSalutationList();
    this.countryOptions = await userService.getCountryList();
  },
  methods: {
    onRegisterClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      const data = {
        email: this.email,
        salutation: this.salutation,
        title: this.title,
        forename: this.forename,
        lastname: this.lastname,
        company_name: this.companyName,
        street_address: this.streetAddress,
        street_number: this.streetNumber,
        zip_code: this.zipCode,
        city: this.city,
        state: this.state,
        country_code: this.country_code,
        nationality: this.nationality,
        mobile_nr: this.strippedMobilePhone,
        birth_day: this.birthdayFormatted,
        birth_place: this.birthPlace
      };
      this.backendQuery = {
        email: this.email,
        salutation: this.salutation,
        title: this.title,
        forename: this.forename,
        lastname: this.lastname,
        companyName: this.companyName,
        streetAddress: this.streetAddress,
        streetNumber: this.streetNumber,
        zipCode: this.zipCode,
        city: this.city,
        state: this.state,
        country_code: this.country_code,
        nationality: this.nationality,
        strippedMobilePhone: this.strippedMobilePhone,
        birthdayFormatted: this.birthdayFormatted,
        birthPlace: this.birthPlace
      };
      this.$emit('submit', data, this.password);
    }

  },
  validations () {
    return {
      email: {
        ...validators.email.call(this),
        backendHasUser: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1001),
        validBackendEmail: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1000 && err.parameter_name === 'email'),
      },
      password: validators.password.call(this),
      passwordConfirm: {
        required,
        sameAsPass: sameAs('password'),
      },
      forename: validators.forename.call(this),
      lastname: validators.lastname.call(this),
      companyName: validators.companyName.call(this),
      title: validators.title.call(this),
      streetAddress: validators.streetAddress.call(this),
      streetNumber: validators.streetNumber.call(this),
      zipCode: validators.zipCode.call(this),
      city: validators.city.call(this),
      state: validators.state.call(this),
      strippedMobilePhone: validators.mobilePhone.call(this),
      // birthday: validators.birthday.call(this),
      birthPlace: validators.birthPlace.call(this),
    };
  },
};
</script>
