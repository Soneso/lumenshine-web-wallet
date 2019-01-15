import moment from 'moment';
import { mapGetters } from 'vuex';

export default {
  data () {
    return {
      lockedOutError: null, // this should be used in the component
    };
  },

  computed: {
    ...mapGetters(['lockoutTime']),
  },

  watch: {
    lockoutTime (val) {
      this.lockoutWatcher(val);
    }
  },

  created () {
    this.lockoutWatcher(this.lockoutTime);
  },

  methods: {
    lockoutWatcher (val) {
      if (!val) {
        this.lockedOutError = null;
        clearInterval(this.lockedOutInterval);
        this.lockedOutInterval = null;
        return;
      }

      if (this.lockedOutInterval) {
        clearInterval(this.lockedOutInterval);
      }

      this.lockoutErrorUpdater();
      this.lockedOutInterval = setInterval(this.lockoutErrorUpdater, 1000);
    },

    lockoutErrorUpdater () {
      if (!this.lockoutTime) {
        clearInterval(this.lockedOutInterval);
        this.lockedOutInterval = null;
        this.lockedOutError = null;
        return;
      }
      const now = moment(new Date());
      const lockOutTime = moment(this.lockoutTime);
      const minutesLeft = lockOutTime.diff(now, 'minutes');
      const intervalText = minutesLeft > 1 ? `${minutesLeft} minutes` : `${lockOutTime.diff(now, 'seconds')} seconds`;

      this.lockedOutError = `Your account is locked. Try again in ${intervalText}.`;
    },
  },
};
