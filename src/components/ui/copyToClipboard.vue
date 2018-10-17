<template>
  <span>
    <a v-clipboard:copy="text" v-b-tooltip="{title: message, delay: {show: 500, hide: 1000}, target: 'click'}">
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
  }
};
</script>
