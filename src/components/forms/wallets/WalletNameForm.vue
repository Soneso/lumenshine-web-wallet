<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <p v-if="!fieldOpen || loading">
      <strong>Wallet name</strong>
      <a v-if="!fieldOpen" class="only-desktop" href="#" @click.prevent="onEditClick">change name</a>
      <br>
      {{ walletName }}
    </p>

    <b-card v-if="fieldOpen && !loading" style="max-width: 20rem;">
      <strong>Wallet name</strong><br>
      <b-row>
        <b-form-group label-for="nameInput">
          <b-form-input
            id="nameInput"
            :class="{ error: $v.name.$error }"
            v-model="name"
            :state="!$v.name.$error"
            type="text"
            placeholder="Wallet name"
            aria-describedby="inputLiveNameHelp inputLiveNameFeedback"
            required
            @blur="$v.name.$touch()"/>
          <b-form-invalid-feedback id="inputLiveNameFeedback">
            <template v-if="$v.name.$error" class="field__errors">
              <template v-if="!$v.name.required">Wallet name is required</template>
              <template v-if="!$v.name.uniqueName">Wallet name is already used</template>
            </template>
          </b-form-invalid-feedback>
          <b-form-text id="inputLiveNameHelp">
            Name of the wallet
          </b-form-text>
        </b-form-group>

        <a href="#" class="text-danger" @click.prevent="onCancelClick">cancel</a>
        <a v-if="fieldOpen" href="#" @click.prevent="onSubmitClick">
          <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
          <span v-else class="text-success">save</span>
        </a>
      </b-row>
    </b-card>
  </form>
</template>

<script>
import formMixin from '@/mixins/form';

import { required } from 'vuelidate/lib/validators';

export default {
  mixins: [ formMixin ],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    walletName: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      fieldOpen: false,
      name: this.walletName,
    };
  },
  watch: {
    loading (loading) {
      if (!loading) {
        if (this.walletName === this.name) { // reset form and close
          this.fieldOpen = false;
        }
      }
    }
  },
  methods: {
    onCancelClick () {
      this.fieldOpen = false;
    },
    onEditClick () {
      this.fieldOpen = true;
    },
    onSubmitClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.backendQuery = { name: this.name };
      this.$emit('submit', this.backendQuery);
    }
  },
  validations () {
    return {
      name: {
        required,
        uniqueName: value => this.backendQuery.name !== value || !this.errors.find(err => err.error_code === 1000),
      }
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
