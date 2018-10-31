<template>
  <!-- loading indicator displayed from an empty card -->
  <transition>
    <b-col v-if="loading" cols="12" md="6" class="mb-2 px-1">
      <b-card class="card-normal">
        <b-row class="card-header" align-v="center">
          <b-col class="text-center pt-4">
            <spinner :size="60" class="two-lines-spinner" align="center" message="Loading wallet cards..." width="180"/>
          </b-col>
        </b-row>
      </b-card>
    </b-col>
  </transition>
</template>

<script>
import spinner from '@/components/ui/spinner1.vue';

export default {
  name: 'CardSpinner',
  components: { spinner },
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  }
};
</script>
