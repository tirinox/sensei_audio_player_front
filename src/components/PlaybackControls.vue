<template>
  <div class="controls">
    <v-btn icon @click="$emit('prev')">
      <v-icon>mdi-skip-previous</v-icon>
    </v-btn>

    <v-btn icon @click="$emit('playPause')">
      <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
    </v-btn>

    <v-btn icon @click="$emit('next')">
      <v-icon>mdi-skip-next</v-icon>
    </v-btn>

    <v-btn icon @click="$emit('restart')">
      <v-icon>mdi-replay</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  isPlaying: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.controls {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

v-ons-button {
  width: 50px;
  height: 50px;
}
</style>
