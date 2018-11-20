<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card :class="{'text-center': inProgress}" class="p-4 single-card">
        <h4 class="form-headline text-uppercase pl-2">Join Lumenshine</h4>
        <div v-if="!inProgress" class="pb-4 pl-2"><small>Please fill in the form below</small></div>
        <small v-if="hasUnknownError" class="d-block text-danger text-center pb-2">Unknown error, please try again later!</small>
        <spinner v-if="inProgress" align="center" class="py-3"/>
        <registration-form v-show="!loading && !registrationStatus.res" :loading="loading" :errors="registrationStatus.err" @submit="onRegisterSubmit"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import registrationForm from '@/components/forms/auth/RegistrationForm';
import spinner from '@/components/ui/spinner';
import onRegistrationSubmit from '@/mixins/onRegistrationSubmit';

export default {
  components: { registrationForm, spinner },
  mixins: [ onRegistrationSubmit ],

  data () {
    return {
      inProgress: false,
      hasUnknownError: false,
    };
  },

  computed: {
    ...mapGetters(['registrationStatus', 'userStatus', 'tfaData', 'sep10Challenge']),
    loading () {
      return this.inProgress || this.registrationStatus.loading;
    }
  },

  methods: {
    ...mapActions(['registerUser', 'setMnemonic', 'setPublicKeys'])
  },
};
</script>
