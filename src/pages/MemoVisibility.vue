<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h3 :class="['form-headline', 'text-uppercase', 'text-center']">Show memos</h3>

        <br>
        <p>Here you can toggle whether memos are visible when showing data about transactions.</p>
        <br>
        <div v-if="memoVisibleValue !== null" class="card-checkbox">
          <input id="memoCheckbox" v-model="memoVisibleValue" type="checkbox" class="switch">
          <label for="memoCheckbox" style="min-width: 130px">{{ memoVisibleValue ? 'Visible' : 'Invisible' }}</label>
        </div>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'MemoVisibility',

  data () {
    return {
      memoVisibleValue: null,
    };
  },

  computed: {
    ...mapGetters(['memoVisible']),
  },

  watch: {
    memoVisibleValue (visible) {
      this.setMemoVisibility(visible);
    },
  },

  async created () {
    await this.loadMemoVisibility();
    this.memoVisibleValue = this.memoVisible;
  },

  methods: {
    ...mapActions(['setMemoVisibility', 'loadMemoVisibility']),
  }
};
</script>
