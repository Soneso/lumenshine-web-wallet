<template>
  <div class="page-box form">
    <h1>Lumenshine</h1>
    <p>Landing page</p>
    <p v-if="!authToken">
      <button @click.prevent="$router.push({ name: 'Login' })">Login</button>
      <button @click.prevent="$router.push({ name: 'Registration' })">Sign Up</button>
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['authToken']),
  }
};
</script>

<style lang="scss" scoped>
</style>
