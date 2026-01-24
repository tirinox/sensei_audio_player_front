<template>
    <v-container class="d-flex flex-column h-100">
        <v-card v-if="playerStore.currentTrack" class="rounded-xl" elevation="2">
            <v-card-text>
                <KaraokeText
                    :current-index="currentPhraseIndex"
                    :phrases="track.segments"
                    v-if="track"
                ></KaraokeText>

                <v-row class="d-flex justify-left" v-if="SPEED_CONTROL_ENABLED">
                    <div class="ml-2">Скорость речи:</div>
                    <v-btn
                        v-for="rate in [0.5, 0.75, 1, 1.25]"
                        :key="rate"
                        variant="text"
                        size="s"
                        @click="playerStore.setRatePlaybackRate(rate)"
                        :color="playerStore.playbackRate === rate ? 'primary' : 'default'"
                        class="ml-1"
                    >
                        {{ rate }}x
                    </v-btn>
                </v-row>

                <v-row class="" v-if="playerStore.temporaryPlaybackRate">
                    <div class="ml-2">Временная скорость речи: {{ playerStore.temporaryPlaybackRate }}x</div>
                </v-row>

            </v-card-text>
        </v-card>

        <v-spacer></v-spacer>

        <v-card class="rounded-xl" elevation="2">
            <v-card-text class="text-center">
                <v-chip class="d mr-2" v-if="track">
                    {{ currentPhraseIndex }} / {{ track.segments.length }}
                </v-chip>

                <ProgressBar
                    :duration="playerStore.totalPhrases"
                    :is-loading="playerStore.isLoading"
                    v-model="progress"
                />

                <SectionSelector
                    :sections="playerStore.sections"
                    @select="goToSection"
                    v-if="track"
                />
            </v-card-text>

        </v-card>

        <v-footer absolute inset app>
            <v-card class="pa-2 w-100" elevation="0">
                <PlaybackControls
                    :isPlaying="isPlaying"
                    :isPlayingCurrent="playerStore.isPlayingCurrent"
                    :enabled="controlsEnabled"
                    @longTap="longTapPlayerAction"
                />
            </v-card>
        </v-footer>

    </v-container>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {usePlayerStore} from '../stores/playerStore.js';

import ProgressBar from '../components/ProgressBar.vue';
import PlaybackControls from '../components/PlaybackControls.vue';
import KaraokeText from "@/components/KaraokeText.vue";
import SectionSelector from "@/components/SectionSelector.vue";

const playerStore = usePlayerStore();
const router = useRouter();

const isPlaying = computed(() => playerStore.isPlaying);

const SPEED_CONTROL_ENABLED = false;
const MAX_SLOW_RATE = 0.5;
const SHORT_TAP_MAX_DURATION = 0.17; // seconds
const LONG_TAP_MAX_DURATION = 2.0; // seconds

const track = computed(() => playerStore.currentTrack);
const currentPhraseIndex = computed(() => playerStore.currentPhraseIndex);


const st = {
    scrollTimeout: null,
}

const progress = computed({
    get: () => playerStore.currentPhraseIndex,
    set: (value) => {
        playerStore.setPhrase(Math.round(value))
        // after some time play current phrase
        if (st.scrollTimeout) {
            clearTimeout(st.scrollTimeout);
        }
        st.scrollTimeout = setTimeout(() => {
            playerStore.playCurrentPhrase()
        }, 300)
    }
});


// on mount if there is no track selected then redirect to the list
onMounted(() => {
    if (!playerStore.currentTrack) {
        router.push('/');
        return
    }

    window.addEventListener('keydown', keyDownHandler);
    playerStore.setupMediaSession()
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyDownHandler);
    playerStore.clearMediaSession()
});

const controlsEnabled = computed(() => {
    return !!(playerStore.currentTrack && !playerStore.isLoading)
});

const keyDownHandler = (event) => {
    playerStore.restorePlaybackRate()
    if (event.key === ' ') {
        playerStore.togglePlayPause()
    } else if (event.key === 'ArrowLeft') {
        playerStore.prevPhrase();
    } else if (event.key === 'ArrowRight') {
        playerStore.nextPhrase();
    }
};

const longTapPlayerAction = ({action, seconds}) => {
    if (seconds > SHORT_TAP_MAX_DURATION) {
        const clampedSeconds = Math.min(Math.max(seconds, SHORT_TAP_MAX_DURATION), LONG_TAP_MAX_DURATION);
        // slow down rate from 1.0 to MAX_SLOW_RATE linearly
        const newRate = 1.0 - (clampedSeconds - SHORT_TAP_MAX_DURATION) /
            (LONG_TAP_MAX_DURATION - SHORT_TAP_MAX_DURATION) * (1.0 - MAX_SLOW_RATE);

        console.log(`Long tap detected: ${seconds.toFixed(2)}s, setting rate to ${newRate.toFixed(2)}x`);
        playerStore.setRatePlaybackRate(parseFloat(newRate.toFixed(2)), true);
    } else {
        playerStore.restorePlaybackRate()
    }

    switch (action) {
        case 'prev':
            playerStore.prevPhrase();
            break;
        case 'playPause':
            playerStore.togglePlayPause();
            break;
        case 'next':
            playerStore.nextPhrase();
            break;
        case 'restart':
            playerStore.restartTrack();
            break;
    }
};

const goToSection = ({index}) => {
    playerStore.currentPhraseIndex = index;
    playerStore.playCurrentPhrase();
}

</script>

<style scoped>
</style>
