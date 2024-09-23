<template>
  <v-slider
      v-model="model1"
      height="10"
      :max="duration"
      :min="1"
      :step="1"
      color="blue-lighten-1"
      thumb-label
      class="mt-1 mb-1"

      v-if="!props.isLoading"
  ></v-slider>
  <v-progress-linear
      indeterminate height="10" class="mt-1 mb-1"
      color="blue-lighten-1" rounded v-else
  ></v-progress-linear>
</template>

<script setup>

const model1 = defineModel()

// Define props
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    required: true,
  },
});

</script>

<style scoped>

</style>
