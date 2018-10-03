<template>
  <b-row align-h="center" align-v="center" class="text-center">
    <b-col cols="11" sm="8" md="6" lg="5" xl="4">
      <b-card class="p-4">
        <h3>Lumenshine</h3>
        <p>Landing page</p>
        <p v-if="!authToken">
          <b-button type="submit" variant="success" class="btn-rounded text-uppercase my-3" @click.prevent="$router.push({ name: 'Login' })">Login</b-button>
          <b-button type="submit" variant="success" class="btn-rounded text-uppercase my-3" @click.prevent="$router.push({ name: 'Registration' })">Sign Up</b-button>
        </p>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['authToken']),
  }
};
</script>
