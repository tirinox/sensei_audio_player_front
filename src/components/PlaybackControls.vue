<template>
    <v-container class="controls">
        <v-row class="d-flex align-end">
            <v-col class="text-center" cols="3">
                <v-btn icon @click="$emit('restart')" :readonly="!enabled">
                    <v-icon>mdi-skip-backward</v-icon>
                </v-btn>
                <div class="mt-2 text-subtitle-2">начало</div>
            </v-col>

            <v-col class="text-center" cols="3">
                <v-btn icon @click="$emit('prev')" :readonly="!enabled">
                    <v-icon>mdi-skip-previous</v-icon>
                </v-btn>
                <div class="mt-2 text-subtitle-2">пред</div>
            </v-col>

            <v-col class="text-center" cols="3">
                <v-btn icon @click="$emit('playPause')"  :readonly="!enabled" class="large">
                    <v-icon>{{ isPlaying && isPlayingCurrent ? 'mdi-pause' : 'mdi-replay' }}</v-icon>
                </v-btn>
                <div class="mt-2 text-subtitle-2">ещё</div>
            </v-col>

            <v-col class="text-center" cols="3">
                <v-btn icon @click="$emit('next')" :readonly="!enabled" class="large">
                    <v-icon>{{ isPlaying && !isPlayingCurrent ? 'mdi-pause' : 'mdi-skip-next' }}</v-icon>
                </v-btn>
                <div class="mt-2 text-subtitle-2">след</div>
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
    padding: 0 !important;
    max-width: 500px;
}

.large {
    //font-size: 1.1em;
    scale: 1.2;
}
</style>
