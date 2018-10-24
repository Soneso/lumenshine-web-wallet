<template>
  <span>
    <a v-clipboard:copy="text" v-b-tooltip="message" :id="tooltipId" @click.prevent="showTooltip(tooltipId)">
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
    },
    tuneWith: {
      type: String,
      required: false
    }
  },
  computed: {
    tooltipId () {
      let id = `tooltip-${new Date().getTime()}`;
      if (this.tuneWith) {
        id += `-${this.tuneWith}`;
      }
      return id;
    }
  },
  mounted () {
    this.disableTooltips();
  },
  destroyed () {
    this.disableTooltips();
  },
  methods: {
    showTooltip (id) {
      this.disableTooltips();
      this.$root.$emit('bv::enable::tooltip', id);
      this.$root.$emit('bv::show::tooltip', id);
      setTimeout(() => { this.disableTooltip(id); }, 3e3);
    },
    disableTooltip (id) {
      this.$root.$emit('bv::disable::tooltip', id);
      this.$root.$emit('bv::hide::tooltip', id);
    },
    disableTooltips () {
      this.$root.$emit('bv::disable::tooltip');
      this.$root.$emit('bv::hide::tooltip');
    }
  }
};
</script>
