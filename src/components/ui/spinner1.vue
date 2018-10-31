<template>
  <div id="spinner1" :style="spinnerContainerStyle" :class="spinnerContainerClass">
    <div v-show="status" :style="spinnerStyle" class="spinner"/>
    <div v-if="message" :class="['message', `text-${variant}`]" :style="textPadding">{{ message }}</div>
  </div>
</template>

<script>
import colors from '@/util/appColors';

export default {
  props: {
    align: {
      type: String,
      default: 'none'
    },
    message: {
      type: [String, Boolean],
      default: ''
    },
    status: {
      type: Boolean,
      default: true
    },
    rotation: {
      type: String,
      default: 'spinning'
    },
    rotationDirection: {
      type: String,
      default: 'normal'
    },
    size: {
      type: Number,
      default: 32
    },
    depth: {
      type: Number,
      default: 1
    },
    speed: {
      type: Number,
      default: 0.75
    },
    variant: {
      type: String,
      default: 'info'
    },
    width: {
      type: String,
      default: '32'
    },
    top: {
      type: String
    },
    left: {
      type: String
    }
  },
  data () {
    return {
      sizeUnits: 'px',
      timeUnits: 's',
      colors,
    };
  },
  computed: {
    selectedColor () {
      return this.colors[this.variant];
    },
    spinnerContainerStyle () {
      let styles = {
        width: this.width + this.sizeUnits
      };

      if (this.top) {
        styles.top = this.top + this.sizeUnits;
      }

      if (this.left) {
        styles.left = this.left + this.sizeUnits;
      }

      return styles;
    },
    spinnerContainerClass () {
      switch (this.align) {
        case 'none':
          return '';

        case 'left':
          return 'pull-left clearfix';

        case 'right':
          return 'pull-right clearfix';

        default:
          return 'mx-auto';
      }
    },
    spinnerSize () {
      return this.size + this.sizeUnits;
    },
    spinnerDepth () {
      return this.depth + this.sizeUnits;
    },
    spinnerSpeed () {
      return this.speed + this.timeUnits;
    },
    spinnerStyle () {
      return {
        borderTopColor: this.hexToRGB(this.selectedColor, 0.25),
        borderRightColor: this.hexToRGB(this.selectedColor, 0.25),
        borderBottomColor: this.hexToRGB(this.selectedColor, 0.25),
        borderLeftColor: this.selectedColor,
        width: this.spinnerSize,
        height: this.spinnerSize,
        borderWidth: this.spinnerDepth,
        animationName: this.rotation,
        animationDirection: this.rotationDirection,
        animationDuration: this.spinnerSpeed
      };
    },
    textPadding () {
      return {
        padding: (this.size / 2 - 10) + 'px 0',
        margin: 0
      };
    }
  },
  methods: {
    hexToRGB (hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      return alpha ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
    }
  }
};
</script>
