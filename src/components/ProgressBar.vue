<template>
  <v-progress-linear :value="progress" height="10"></v-progress-linear>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
  currentTime: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
});

const progress = computed(() => {
  if (props.duration > 0) {
    return ((props.currentTime / props.duration) * 100).toFixed(2);
  }
  return 0;
});
</script>

<style scoped>
v-ons-progress-bar {
  margin: 16px;
}
</style>
