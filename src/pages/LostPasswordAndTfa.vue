<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h4 class="form-headline pb-3">Lost Password & 2FA Secret</h4>
        <p>We can not recover your account automatically, please contact</p>
        <p><a :href="`mailto:${config.SUPPORT_MAIL}?subject=${encodeURIComponent('Lost Password & 2FA Secret')}`">support</a></p>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import config from '@/config';

export default {
  data: () => ({ config })
};
</script>
