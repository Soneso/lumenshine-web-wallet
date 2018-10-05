<template>
  <div class="modal" style="display: block">
    <div class="modal__bg" @click="onCloseClick"/>
    <div class="modal__content">
      <div class="modal__header">
        <slot name="title"/>
        <a href="#" @click="onCloseClick"><i class="fa fa-close"/></a>
      </div>
      <div class="modal__content-wrapper">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  methods: {
    onCloseClick (e) {
      e.preventDefault();
      this.$emit('close');
    }
  }
};
</script>
