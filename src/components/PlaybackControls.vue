<template>
    <v-container class="controls d-flex justify-space-between">
        <div class="d-flex flex-column align-center justify-end">
            <v-btn icon @click="$emit('restart')" :readonly="!enabled" size="64">
                <v-icon size="30">mdi-skip-backward</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">начало</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn icon @click="$emit('prev')" :readonly="!enabled" size="64">
                <v-icon size="30">mdi-skip-previous</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">пред</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn icon @click="$emit('playPause')" :readonly="!enabled" size="64">
                <v-icon size="30">{{ isPlaying && isPlayingCurrent ? 'mdi-pause' : 'mdi-replay' }}</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">ещё</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn icon @click="$emit('next')" :readonly="!enabled" size="80">
                <v-icon size="38">{{ isPlaying && !isPlayingCurrent ? 'mdi-pause' : 'mdi-skip-next' }}</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">след</div>
        </div>
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

.control-btn {
    width: 64px;
    height: 64px;
}

</style>
