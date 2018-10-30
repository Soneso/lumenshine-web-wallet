<template>
  <b-form @submit.prevent="onCheckConfirmation">
    <template v-if="!loading">
      <p>Your email address is not verified. We sent a verification message to your email account. Click the link to verify your email address. After doing so, please come back and press the "Already confirmed" button to finish resetting your password.</p>
      <div v-if="inProgress" class="py-4 px-2">Loading...</div>
      <template v-else>
        <b-button variant="info" class="btn-rounded text-uppercase" @click.prevent="onCheckConfirmation">Already confirmed</b-button>
        <small v-if="alreadyConfirmedFailed" class="d-block text-danger py-2">Please confirm your email address first.</small>
        <b-button variant="warning" class="btn-rounded text-uppercase mt-4" @click.prevent="onResendEmail">Resend confirmation mail</b-button>
        <small v-if="emailResent" class="d-block text-success py-2">RESEND VERIFICATION LINK</small>
      </template>
    </template>
  </b-form>
</template>

<script>
import formMixin from '@/mixins/form';

export default {
  mixins: [ formMixin ],
  props: {
    emailResent: {
      type: Boolean,
      required: true,
    },
    alreadyConfirmedFailed: {
      type: Boolean,
      required: true,
    },
  },
  data () {
    return {
      inProgress: false,
    };
  },
  methods: {
    onCheckConfirmation () {
      this.$emit('recheck');
    },
    onResendEmail () {
      this.$emit('resend');
    }
  },
};
</script>
