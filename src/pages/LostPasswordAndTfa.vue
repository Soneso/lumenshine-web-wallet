<template>
  <div class="page-box form">
    <h1>Lost Password & 2FA Secret</h1>
    <p>We can not recover your account automatically, please contact</p>
    <p><a :href="`mailto:${config.SUPPORT_MAIL}?subject=${encodeURIComponent('Lost Password & 2FA Secret')}`">support</a></p>
  </div>
</template>

<script>
import config from '@/config';

export default {
  data () {
    return {
      config
    };
  }
};
</script>

<style lang="scss" scoped>
h1 {
  color: #CF2A29;
}
</style>
