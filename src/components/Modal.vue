<template>
  <b-modal :title="title" :value="value" centered hide-footer @input="e => $emit('input', e)">
    <div class="modal-wrapper">
      <transition
        name="slide-left"
        mode="out-in"
        @before-leave="beforeLeave"
        @enter="enter"
        @after-enter="afterEnter">
        <component :is="component" v-bind="props"/>
      </transition>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    component: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    props: {
      type: Object,
      default: () => ({}),
    }
  },
  data () {
    return {
      prevHeight: 0,
    };
  },
  methods: {
    onCloseClick (e) {
      e.preventDefault();
      this.$emit('close');
    },
    beforeLeave (element) {
      this.prevHeight = getComputedStyle(element).height;
    },
    enter (element) {
      const { height } = getComputedStyle(element);

      element.style.height = this.prevHeight;

      setTimeout(() => {
        element.style.height = height;
      });
    },
    afterEnter (element) {
      element.style.height = 'auto';
    },
  }
};
</script>
