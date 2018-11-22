<template>
  <span :title="text">
    {{ formattedPublicKey }}
    <a v-clipboard:copy="text" v-b-tooltip="message" :id="tooltipId" @click.prevent="showTooltip(tooltipId)">
      <i :class="['icon-copy', color]"/>
    </a>
  </span>
</template>

<script>
export default {
  name: 'PublicKey',
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
    chars: {
      type: Number,
      required: false
    },
    tuneWith: {
      type: String,
      required: false
    }
  },

  computed: {
    formattedPublicKey () {
      if (this.text.length !== 56) {
        return 'Error';
      }
      const pubKeySizeL = this.chars ? Math.floor((this.chars - 3) / 2) : 10;
      const pubKeySizeR = this.chars ? Math.ceil((this.chars - 3) / 2) : 10;
      return `${this.text.slice(0, pubKeySizeL)}...${this.text.slice(-pubKeySizeR)}`;
    },
    tooltipId () {
      let id = `tooltip-${this._uid}`;
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
