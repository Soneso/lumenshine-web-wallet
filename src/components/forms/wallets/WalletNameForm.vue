<template>
  <form class="form" @submit.prevent="onSubmitClick">
    <div>
      <p>
        <strong>Wallet name</strong>
        <a v-if="!fieldOpen" class="only-desktop" href="#" @click.prevent="onEditClick">change name</a>
        <a v-else href="#" class="error only-desktop" @click.prevent="onCancelClick">cancel</a>
        <br>
        {{ walletName }}
      </p>
      <div v-if="fieldOpen && !loading" class="field">
        <div v-if="$v.name.$error" class="field__errors">
          <div v-if="!$v.name.required">Wallet name is required</div>
          <div v-if="!$v.name.uniqueName">Wallet name is already used</div>
        </div>
        <input :class="{ error: $v.name.$error }" v-model="name" type="name" placeholder="Wallet name" @blur="$v.name.$touch()">
      </div>
      <div class="form-buttons">
        <a v-if="!fieldOpen" class="only-mobile" href="#" @click.prevent="onEditClick">change name</a>
        <a v-else href="#" class="error only-mobile" @click.prevent="onCancelClick">cancel</a>
        <a v-if="fieldOpen" href="#" @click.prevent="onSubmitClick">
          <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
          <span v-else>save</span>
        </a>
      </div>
    </div>
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
