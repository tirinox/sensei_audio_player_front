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

    <v-skeleton-loader type="heading" v-if="props.isLoading" class="mb-3"/>

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
