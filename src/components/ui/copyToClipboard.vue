<template>
  <span>
    <a v-clipboard:copy="text" v-b-tooltip="message" :id="`tooltip-${now}`" @click.prevent="showTooltip">
      <i :class="['icon-copy', color]"/>
    </a>
  </span>
</template>

<script>
export default {
  name: 'CopyToClipboard',
  props: {
    text: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: false,
      default: 'Copied to clipboad'
    },
    color: {
      type: String,
      required: false,
      default: 'text-info'
    }
  },
  data () {
    return {
      now: new Date().getTime()
    };
  },
  mounted () {
    this.$root.$emit('bv::disable::tooltip', `tooltip-${this.now}`);
  },
  methods: {
    showTooltip () {
      this.$root.$emit('bv::enable::tooltip', `tooltip-${this.now}`);
      this.$root.$emit('bv::show::tooltip', `tooltip-${this.now}`);
    }
  }
};
</script>
