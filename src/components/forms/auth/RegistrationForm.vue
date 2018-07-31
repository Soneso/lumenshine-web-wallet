<template>
  <form class="form" @submit.prevent="onRegisterClick">
    <div v-if="!loading">
      <div v-if="hasUnknownError" class="error">Unknown backend error!</div>
      <div class="field">
        <div v-if="$v.email.$error" class="field__errors">
          <div v-if="!$v.email.required">Email is required!</div>
          <div v-if="!$v.email.email">Not valid email!</div>
          <div v-if="!$v.email.backendHasUser">Email already exists!</div>
        </div>
        <input :class="{ error: $v.email.$error }" v-model="email" type="text" placeholder="Email" @blur="$v.email.$touch()">
      </div>
      <div class="field">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required!</div>
          <div v-if="!$v.password.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.password.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.password.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.password.hasNumber">Password should contain at least one number!</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
        <div class="field__info">
          <div class="field__info__modal">
            <h3>Password requirements</h3>
            <p>Your new password must have at least 9 characters</p>
            <p>It must contain small letters and capitals...</p>
          </div>
        </div>
      </div>
      <div class="field">
        <div v-if="$v.passwordConfirm.$error" class="field__errors">
          <div v-if="!$v.passwordConfirm.required">Password is required!</div>
          <div v-if="!$v.passwordConfirm.minLength">Password should be longer than 9 characters!</div>
          <div v-if="!$v.passwordConfirm.hasUpperCaseLetter">Password should contain at least one uppercase character!</div>
          <div v-if="!$v.passwordConfirm.hasLowerCaseLetter">Password should contain at least one lowercase character!</div>
          <div v-if="!$v.passwordConfirm.hasNumber">Password should contain at least one number!</div>
          <div v-if="!$v.passwordConfirm.sameAsPass">The two passwords don't match!</div>
        </div>
        <input :class="{ error: $v.passwordConfirm.$error }" v-model="passwordConfirm" type="password" placeholder="Repeat password" @blur="$v.passwordConfirm.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('forename')" class="field">
        <div v-if="$v.forename.$error" class="field__errors">
          <div v-if="!$v.forename.maxLength">Forename should be shorter than 64 characters!</div>
          <!-- <div v-if="!$v.forename.hasOnlyLetters">Forename should contain only letters!</div> -->
        </div>
        <input :class="{ error: $v.forename.$error }" v-model="forename" type="text" placeholder="Forename" @blur="$v.forename.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('lastname')" class="field">
        <div v-if="$v.lastname.$error" class="field__errors">
          <div v-if="!$v.lastname.maxLength">Lastname should be shorter than 64 characters!</div>
          <!-- <div v-if="!$v.lastname.hasOnlyLetters">Lastname should contain only letters!</div> -->
        </div>
        <input :class="{ error: $v.lastname.$error }" v-model="lastname" type="text" placeholder="Lastname" @blur="$v.lastname.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('companyName')" class="field">
        <div v-if="$v.companyName.$error" class="field__errors">
          <div v-if="!$v.companyName.maxLength">Company name should be shorter than 64 characters!</div>
          <div v-if="!$v.companyName.hasOnlyASCII">Company name should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.companyName.$error }" v-model="companyName" type="text" placeholder="Company name" @blur="$v.companyName.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('salutation')" class="field">
        <select v-model="salutation">
          <option value="" disabled selected>Salutation</option>
          <option v-for="option in salutationOptions" :key="option">{{ option }}</option>
        </select>
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('title')" class="field">
        <div v-if="$v.title.$error" class="field__errors">
          <div v-if="!$v.title.maxLength">Title should be shorter than 64 characters!</div>
          <div v-if="!$v.title.hasOnlyASCII">Title should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.title.$error }" v-model="title" type="text" placeholder="Title" @blur="$v.title.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('streetAddress')" class="field">
        <div v-if="$v.streetAddress.$error" class="field__errors">
          <div v-if="!$v.streetAddress.maxLength">Street address should be shorter than 128 characters!</div>
          <div v-if="!$v.streetAddress.hasOnlyASCII">Street address should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.streetAddress.$error }" v-model="streetAddress" type="text" placeholder="Street address" @blur="$v.streetAddress.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('streetNumber')" class="field">
        <div v-if="$v.streetNumber.$error" class="field__errors">
          <div v-if="!$v.streetNumber.maxLength">Street number should be shorter than 128 characters!</div>
          <div v-if="!$v.streetNumber.hasOnlyASCII">Street number should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.streetNumber.$error }" v-model="streetNumber" type="text" placeholder="Street number" @blur="$v.streetNumber.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('zipCode')" class="field">
        <div v-if="$v.zipCode.$error" class="field__errors">
          <div v-if="!$v.zipCode.zipFormat">Invalid ZIP code!</div>
        </div>
        <input :class="{ error: $v.zipCode.$error }" v-model="zipCode" type="text" placeholder="Zip code" @blur="$v.zipCode.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('city')" class="field">
        <div v-if="$v.city.$error" class="field__errors">
          <div v-if="!$v.city.maxLength">City should be shorter than 64 characters!</div>
          <div v-if="!$v.city.hasOnlyASCII">City should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.city.$error }" v-model="city" type="text" placeholder="City" @blur="$v.city.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('state')" class="field">
        <div v-if="$v.state.$error" class="field__errors">
          <div v-if="!$v.state.maxLength">State should be shorter than 64 characters!</div>
          <div v-if="!$v.state.hasOnlyASCII">State should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.state.$error }" v-model="state" type="text" placeholder="State" @blur="$v.state.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('country')" class="field">
        <select v-model="country">
          <option value="" disabled selected>Country</option>
          <option v-for="option in countryOptions" :key="option.code" :value="option.code">{{ option.name }}</option>
        </select>
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('nationality')" class="field">
        <select v-model="nationality">
          <option value="" disabled selected>Nationality</option>
          <option v-for="option in countryOptions" :key="option.code" :value="option.code">{{ option.name }}</option>
        </select>
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('mobilePhone')" class="field">
        <div v-if="$v.strippedMobilePhone.$error" class="field__errors">
          <div v-if="!$v.strippedMobilePhone.validPhone">Invalid phone number!</div>
        </div>
        <input :class="{ error: $v.strippedMobilePhone.$error }" v-model="mobilePhone" type="text" placeholder="Mobile phone" @blur="$v.strippedMobilePhone.$touch()">
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('birthday')" class="field">
        <datepicker v-model="birthday" format="yyyy-MM-dd" placeholder="Birth day"/>
      </div>
      <div v-if="config.REGISTRATION_OPTIONAL_FIELDS.includes('birthPlace')" class="field">
        <div v-if="$v.birthPlace.$error" class="field__errors">
          <div v-if="!$v.birthPlace.maxLength">Birth place should be shorter than 64 characters!</div>
          <div v-if="!$v.birthPlace.hasOnlyASCII">Birth place should contain only ASCII characters!</div>
        </div>
        <input :class="{ error: $v.birthPlace.$error }" v-model="birthPlace" type="text" placeholder="Birth place" @blur="$v.birthPlace.$touch()">
      </div>
    </div>
    <button @click.prevent="onRegisterClick">Sign Up</button>
    <br>
    <span>Already have an account? Login <router-link to="/login">here</router-link></span>
  </form>
</template>

<script>
import { sameAs } from 'vuelidate/lib/validators';
import Datepicker from 'vuejs-datepicker';

import formMixin from '@/mixins/form';
import validators from '@/validators';
import config from '@/config';

import userService from '@/services/user';

export default {
  components: { Datepicker },
  mixins: [ formMixin ],
  data () {
    return {
      email: '',
      password: '',
      passwordConfirm: '',
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
        backendHasUser: value => this.backendQuery.email !== value || !this.errors.find(err => err.error_code === 1001)
      },
      password: validators.password.call(this),
      passwordConfirm: {
        ...validators.password.call(this),
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

<style lang="scss" scoped>
.vdp-datepicker {
  display: inline-block;
}
</style>
