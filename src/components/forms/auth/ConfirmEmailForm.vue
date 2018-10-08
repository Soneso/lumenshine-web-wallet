<template>
  <b-form @submit.prevent="onCheckConfirmation">
    <template v-if="!loading">
      <p>An email has been sent to your email account. Please check your inbox and confirm your email address first. After doing so, please come back and press the "Already confirmed" button to continue.</p>
      <div v-if="inProgress" class="py-4 px-2">Loading...</div>
      <template v-else>
        <b-button variant="info" class="btn-rounded text-uppercase" @click.prevent="onCheckConfirmation">Already confirmed</b-button>
        <div v-if="alreadyConfirmedFailed" class="text-danger pt-2 pb-3">Please confirm your email address first.</div>
        <b-button variant="warning" class="btn-rounded text-uppercase" @click.prevent="onResendEmail">Resend confirmation mail</b-button>
        <div v-if="emailResent" class="text-success pt-2 pb-3">Resent confirmation mail</div>
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
