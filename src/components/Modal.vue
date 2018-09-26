<template>
  <div class="modal">
    fsdfsd
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

<style lang="scss" scoped>
@import "assets/scss/variables";
.modal {
  display: block;
  &__bg {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #000;
    opacity: 0.6;
    z-index: 1;
  }
  &__content {
    position: fixed;
    top: 15%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    z-index: 100;
    padding: 30px;
    background: #fff;
    border: 1px solid #aaa;
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    @include breakpoint(tablet) {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }
  &__content-wrapper {
    max-height: 100%;
    overflow-y: auto;
  }
  &__header {
    border-bottom: 1px solid #aaa;
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    padding: 10px 0;
    a {
      color: #222;
      float: right;
      @include breakpoint(tablet) {
        float: left;
      }
    }
  }
}
</style>
