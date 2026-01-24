<template>
  <v-slider
      v-model="model1"
      :max="duration"
      :min="1"
      :step="1"
      color="blue-lighten-1"
      thumb-label
      v-if="!props.isLoading"
  ></v-slider>
    <v-skeleton-loader type="heading" v-else/>
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
