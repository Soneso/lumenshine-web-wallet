<template>
  <b-row class="floating-icons align-right two-items">
    <b-col v-if="helpTitle || helpText">
      <i v-b-popover.hover="helpText" :title="helpTitle || ''" class="icon-help"/>
    </b-col>
    <b-col>
      <i :class="password[1] ? 'icon-show': 'icon-hide'" @click="togglePasswordVisibility" />
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'PasswordAssets',
  props: {
    helpTitle: {
      type: String,
      required: false
    },
    helpText: {
      type: String,
      required: false
    },
    password: {
      type: Array
    }
  },
  methods: {
    togglePasswordVisibility () {
      const updated = [this.password[0], !this.password[1]];
      this.$emit('passwordUpdated', updated);
    }
  }
};
</script>
