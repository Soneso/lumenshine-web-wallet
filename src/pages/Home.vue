<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="12" sm="11" md="10" lg="9" xl="8">
      <b-card class="p-4">
        <b-row>
          <b-col>
            <h3 class="text-info">Introducing Lumenshine app</h3>
            <p>Nulla nulla nisi, tincidunt in pretium ut, ultrices sit amet arcu. Donec a rutrum leo. Curabitur vestibulum imperdiet nisl, sed dapibus magna pulvinar ut. Proin imperdiet dolor vitae bibendum dapibus. Nam consectetur ullamcorper suscipit. Phasellus accumsan vel neque non tempor. Ut id nunc ante.</p>
          </b-col>
          <b-col>
            <img src="/static/app-screenshot.png">
          </b-col>
        </b-row>
        <hr class="divider light my-5">
        <b-row>
          <b-col>
            <h3 class="text-info">All assets, peer-to-peer</h3>
            <p>StellarX is built on Stellar’s universal order book. Trades happen directly between traders. No middlemen, no miners. You trade from your own wallet and keep total control of your keys.</p>
          </b-col>
        </b-row>
        <hr class="divider light my-5">
        <b-row>
          <b-col>
            <h3 class="text-info">Fast and actually free</h3>
            <p>Transactions settle in seconds, and trading on StellarX costs nothing. We refund your network fees and we even return Stellar’s automatic 1% APR inflation to our users, keeping none of the weekly airdrops for ourselves.</p>
          </b-col>
        </b-row>
        <hr class="divider light my-5">
        <b-row>
          <b-col>
            <registration-form v-show="!loading && !registrationStatus.res" :loading="loading" :errors="registrationStatus.err" @submit="onRegisterSubmit"/>
          </b-col>
        </b-row>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';
import registrationForm from '@/components/forms/auth/RegistrationForm';
import onRegistrationSubmit from '@/mixins/onRegistrationSubmit';

export default {
  name: 'LandingPage',
  components: { registrationForm },
  mixins: [ onRegistrationSubmit ],
  data () {
    return {
      inProgress: false
    };
  },
  computed: {
    ...mapGetters(['registrationStatus']),
    loading () {
      return this.inProgress || this.registrationStatus.loading;
    }
  }
};
</script>
