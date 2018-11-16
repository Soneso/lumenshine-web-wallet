<template>
  <span>{{ formattedPublicKey }} <copy-to-clipboard :text="publicKey"/></span>
</template>

<script>
import copyToClipboard from '@/components/ui/copyToClipboard';

export default {
  name: 'PublicKey',
  components: { copyToClipboard },
  props: {
    publicKey: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedPublicKey () {
      if (this.publicKey.length !== 56) {
        return 'Error';
      }
      return `${this.publicKey.slice(0, 10)}...${this.publicKey.slice(-10)}`;
    }
  }
};
</script>
