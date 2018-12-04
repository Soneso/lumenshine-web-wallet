<template>
  <b-modal v-model="modalVisible" title="Hint" centered hide-footer size="sm">
    <p>Your session is going to expire very soon. Please press the "Continue session" button below if you want to continue your session.</p>
    <p><strong>Automatic Sign-out in: <span class="text-danger">{{ remainingTime }}</span> minutes.</strong></p>
    <b-button variant="info" class="btn-rounded text-uppercase" @click.prevent="onContinue">Continue session</b-button>
    <b-button variant="danger" class="btn-rounded text-uppercase" @click.prevent="onLogout">Sign out</b-button>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';

export default {
  name: 'InactivityModal',

  data () {
    return {
      expirationTime: dayjs().add(1, 'minute'),
      remainingTime: '1:00',

      modalVisible: true,
    };
  },

  computed: {
    ...mapGetters([
    ]),
  },

  watch: {
    modalVisible (val) {
      if (!val) {
        this.onContinue();
      }
    }
  },

  mounted () {
    this.timer = setInterval(() => {
      this.remainingTime = `0:${('0' + this.expirationTime.diff(dayjs(), 'second')).slice(-2)}`;
      if (this.remainingTime === '0:00') {
        clearInterval(this.timer);
        this.timer = null;
        this.onLogout();
      }
    }, 1000);
  },

  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  methods: {
    ...mapActions([
      'logout',
    ]),

    onLogout () {
      this.$emit('logout');
      this.logout();
      this.$router.push({ name: 'Login' });
    },

    onContinue () {
      this.$emit('continue');
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  }
};
</script>
