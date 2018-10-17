<template>
  <div :style="spinnerWidth" class="spinner-wrapper">
    <div>
      <i :class="['icon-spinner2 spin cw', color]">
        <span class="path1"/><span class="path2"/><span class="path3"/><span class="path4"/><span class="path5"/><span class="path6"/><span class="path7"/><span class="path8"/><span class="path9"/><span class="path10"/><span class="path11"/>
      </i>
    </div>
    <div v-if="message">
      <small :class="color">{{ message }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Spinner2',
  props: {
    width: {
      type: Number,
      required: false
    },
    color: {
      type: String,
      required: false
    },
    message: {
      type: String,
      required: false
    }
  },
  computed: {
    spinnerWidth () {
      return {
        width: this.message && !this.width ? '200px' : this.width + 'px'
      };
    }
  }
};
</script>
