<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase text-center">Personal Data</h4>
        <spinner v-if="inProgress" align="center" class="mt-3"/>
        <personal-data-form
          v-if="!loading"
          :data="userData.res"
          :languages="languages"
          :countries="countries"
          :salutations="salutations"
          :loading="loading"
          :errors="[]"
          @submit="onSubmitClick"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import PersonalDataForm from '@/components/forms/PersonalDataForm';
import spinner from '@/components/ui/spinner';

export default {
  name: 'PersonalData',
  components: { PersonalDataForm, spinner },

  data () {
    return {
      inProgress: false,
    };
  },

  computed: {
    ...mapGetters(['userAuthData', 'languages', 'countries', 'salutations', 'userData']),
    loading () {
      return this.inProgress || this.userData.loading;
    }
  },

  async created () {
    this.inProgress = true;
    await Promise.all([this.loadStaticData(), this.getUserData()]);
    this.inProgress = false;
  },

  methods: {
    ...mapActions(['loadStaticData', 'getUserData', 'updateUserData']),
    async onSubmitClick (data) {
      this.inProgress = true;
      await this.updateUserData(data);
      await this.getUserData();
      this.inProgress = false;
    }
  }
};
</script>
