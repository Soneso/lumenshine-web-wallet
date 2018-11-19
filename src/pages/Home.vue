<template>
  <b-row align-h="center" align-v="center" class="text-center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <strong>Landing page</strong>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['authToken'])
  }
};
</script>
