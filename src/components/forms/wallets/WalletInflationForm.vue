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
        <div v-if="$v.destination.$error" class="field__errors">
          <div v-if="!$v.destination.required">Wallet destination is required</div>
        </div>
        <input :class="{ error: $v.destination.$error }" v-model="destination" placeholder="Public key of destination account" @blur="$v.destination.$touch()">
        <div v-if="$v.password.$error" class="field__errors">
          <div v-if="!$v.password.required">Password is required</div>
        </div>
        <input :class="{ error: $v.password.$error }" v-model="password" type="password" placeholder="Password" @blur="$v.password.$touch()">
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

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    updateError: {
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
    };
  },
  methods: {
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
      },
      password: {
        required,
      }
    };
  }
};
</script>

<style lang="scss" scoped>
p {
  word-wrap: break-word;
}
</style>
