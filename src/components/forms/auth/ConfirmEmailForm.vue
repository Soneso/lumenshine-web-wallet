<template>
  <form class="form" @submit.prevent="onCheckConfirmation">
    <div v-if="!loading">
      <p>An email has been sent to your email account. Please check your inbox and confirm your email address first. After doing so, please come back and press the "Already confirmed" button to continue.</p>
      <p v-if="inProgress">Loading...</p>
      <div v-else>
        <div>
          <div v-if="alreadyConfirmedFailed" class="error">Please confirm your email address first.</div>
          <button @click.prevent="onCheckConfirmation">Already confirmed</button>
        </div>

        <div v-if="emailResent" class="info">Resent confirmation mail</div>
        <button @click.prevent="onResendEmail">Resend confirmation mail</button>
      </div>
    </div>
  </form>
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

<style lang="scss" scoped>
</style>
