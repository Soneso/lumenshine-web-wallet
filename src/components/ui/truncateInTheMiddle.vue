<template>
  <div :title="text" :class="{'d-inline': inline}">{{ cutInTheMiddle }}</div>
</template>

<script>
export default {
  name: 'TruncateInTheMiddle',
  props: {
    text: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cutInTheMiddle () {
      if (this.text.length <= this.size) return this.text;

      const separator = '...';
      const charsToShow = this.size - separator.length;
      const firstChars = Math.ceil(charsToShow / 2);
      const lastChars = Math.floor(charsToShow / 2);

      return this.text.substr(0, firstChars) + separator + this.text.substr(0, lastChars);
    }
  }
};
</script>
