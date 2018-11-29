<script>
import { Line, mixins } from 'vue-chartjs';
export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: {
    options: {
      type: Object,
      required: true,
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options);
  },
};
</script>
