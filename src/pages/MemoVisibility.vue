<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h3 :class="['form-headline', 'text-uppercase', 'text-center']">Hide memos</h3>

        <br>
        <p>Here you can toggle whether memos should be hidden when showing data about transactions.</p>
        <br>
        <div v-if="memoInvisibleValue !== null" class="card-checkbox">
          <input id="memoCheckbox" v-model="memoInvisibleValue" type="checkbox" class="switch">
          <label for="memoCheckbox" style="min-width: 130px">Hidden</label>
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
      memoInvisibleValue: null,
    };
  },

  computed: {
    ...mapGetters(['memoVisible']),
  },

  watch: {
    memoInvisibleValue (visible) {
      this.setMemoVisibility(!visible);
    },
  },

  async created () {
    await this.loadMemoVisibility();
    this.memoInvisibleValue = !this.memoVisible;
  },

  methods: {
    ...mapActions(['setMemoVisibility', 'loadMemoVisibility']),
  }
};
</script>
