<template>
  <v-container class="controls">
    <v-row class="d-flex align-end">
      <v-col class="text-center" cols="3">
        <v-btn icon @click="$emit('restart')" :readonly="!enabled">
          <v-icon>mdi-skip-backward</v-icon>
        </v-btn>
        <v-label>начало</v-label>
      </v-col>

      <v-col class="text-center" cols="3">
        <v-btn icon @click="$emit('prev')" :readonly="!enabled">
          <v-icon>mdi-skip-previous</v-icon>
        </v-btn>
        <v-label>пред</v-label>
      </v-col>

      <v-col class="text-center" cols="3">
        <v-btn icon @click="$emit('playPause')" size="x-large" :readonly="!enabled">
          <v-icon>{{ isPlaying && isPlayingCurrent ? 'mdi-pause' : 'mdi-replay' }}</v-icon>
        </v-btn>
        <v-label>еще</v-label>
      </v-col>

      <v-col class="text-center" cols="3">
        <v-btn icon @click="$emit('next')" size="x-large" :readonly="!enabled">
          <v-icon>{{ isPlaying && !isPlayingCurrent ? 'mdi-pause' : 'mdi-skip-next' }}</v-icon>
        </v-btn>
        <v-label>след</v-label>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {defineProps} from 'vue';

defineProps({
  isPlaying: {
    type: Boolean,
    required: true,
  },
  isPlayingCurrent: {
    type: Boolean,
    required: true,
  },
  enabled: {
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
