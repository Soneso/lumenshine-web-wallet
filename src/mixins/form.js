let uuid = 0;

export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Array,
      default: () => [],
    }
  },
  data () {
    return {
      backendQuery: {}
    };
  },
  beforeCreate () {
    this.uuid = uuid.toString();
    uuid += 1;
  },
  computed: {
    hasUnknownError () {
      if (Object.keys(this.backendQuery).some(key => this.backendQuery[key] !== this[key])) { // fields were changed
        return false;
      }
      return !this.$v.$invalid && this.errors.length > 0;
    }
  },
};
