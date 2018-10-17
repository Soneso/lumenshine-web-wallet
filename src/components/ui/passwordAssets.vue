<template>
  <b-row class="floating-icons align-right two-items">
    <b-col v-if="helpTitle !== undefined || helpText !== undefined">
      <i v-b-popover.hover="helpText" :title="helpTitle || ''" class="icon-help"/>
    </b-col>
    <b-col>
      <i :class="value ? 'icon-show': 'icon-hide'" @click="togglePasswordVisibility" />
    </b-col>
  </b-row>
</template>
<!--<password-assets-->
<!--:pass1hidden.sync="pass1hidden"-->
<!--:help-title="'Password requirement'"-->
<!--:help-text="'Your new password must have at least 9 characters \nIt must contain numbers, small and capital letters.'"/>-->

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
    value: {
      type: Boolean
    }
  },
  mounted () {
    console.log('initial:', this.value);
  },
  methods: {
    togglePasswordVisibility () {
      this.value = !this.value;
      this.$emit('update:value', this.value);
      console.log('mutated', this.value);
    }
  }
};
</script>
