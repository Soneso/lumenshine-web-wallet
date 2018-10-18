<template>
  <b-form @submit.prevent="onSubmitClick">
    <div v-if="!fieldOpen || loading">
      <span class="font-weight-600">Wallet name</span>
      <a v-if="!fieldOpen" class="only-desktop" href="#" @click.prevent="onEditClick">change name</a>
      <br>
      {{ walletName }}
    </div>

    <b-card v-if="fieldOpen && !loading" class="flat-card">
      <div class="font-weight-600">Wallet name</div><br>
      <ul class="inline-list">
        <li>
          <b-form-group :label-for="`nameInput_${uuid}`">
            <b-form-input
              :id="`nameInput_${uuid}`"
              :class="[{ error: $v.name.$error }, '']"
              :state="!$v.name.$error"
              :aria-describedby="`inputLiveNameFeedback_${uuid}`"
              v-model="name"
              type="text"
              placeholder="Wallet name"
              required
              @blur="$v.name.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveNameFeedback_${uuid}`">
              <template v-if="$v.name.$error" class="field__errors">
                <template v-if="!$v.name.required">Wallet name is required</template>
                <template v-if="!$v.name.uniqueName">Wallet name is already used</template>
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </li>
        <li>
          <a href="#" class="text-danger px-2" @click.prevent="onCancelClick">cancel</a>
        </li>
        <li>
          <a v-if="fieldOpen" href="#" @click.prevent="onSubmitClick">
            <i v-if="loading" class="fa fa-spinner fa-spin fa-fw"/>
            <span v-else class="text-success px-2">save</span>
          </a>
        </li>
      </ul>
    </b-card>
  </b-form>
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
