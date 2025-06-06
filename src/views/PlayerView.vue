<template>
    <v-container class="cont">
        <v-app-bar
            app
            fixed
            elevation="2"
        >
            <v-btn icon @click="goBack">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>{{
                    playerStore.currentTrack ? playerStore.currentTrack.title : 'Проигрыватель'
                }}
            </v-toolbar-title>
        </v-app-bar>

        <v-row v-if="playerStore.currentTrack">
            <v-col>
                <v-card>
                    <v-card-text>
                        <div>{{ currentPhraseIndex }} / {{ playerStore.totalPhrases }}</div>
                        <KaraokeText
                            :current-index="playerStore.currentPhraseIndex"
                            :phrases="playerStore.currentTrack.segments"
                            v-if="playerStore.currentTrack"
                        ></KaraokeText>

                        <ProgressBar
                            :duration="playerStore.totalPhrases"
                            :is-loading="playerStore.isLoading"
                            v-model="progress"
                        />


                        <v-row class="d-flex justify-left">
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

                    </v-card-text>
                </v-card>

            </v-col>
        </v-row>

        <v-footer absolute inset app width="auto">
            <v-container>
                <v-row justify="center">
                    <v-col lg="4" cols="12" align-self="center">
                        <v-card class="controls pa-1" elevation="0">
                            <PlaybackControls
                                :isPlaying="isPlaying"
                                :isPlayingCurrent="playerStore.isPlayingCurrent"
                                :enabled="controlsEnabled"
                                @prev="prevPhrase"
                                @playPause="togglePlayPause"
                                @next="nextPhrase"
                                @restart="restartTrack"
                            />
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>

    </v-container>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {usePlayerStore} from '../stores/usePlayerStore';

import ProgressBar from '../components/ProgressBar.vue';
import PlaybackControls from '../components/PlaybackControls.vue';
import KaraokeText from "@/components/KaraokeText.vue";

const playerStore = usePlayerStore();
const router = useRouter();

const currentPhraseIndex = computed(() => playerStore.currentPhraseIndex);
const isPlaying = computed(() => playerStore.isPlaying);

const goBack = () => {
    playerStore.stop()
    router.push('/');
};

const togglePlayPause = () => {
    playerStore.togglePlayPause();
};

const prevPhrase = () => {
    playerStore.prevPhrase();
};

const nextPhrase = () => {
    playerStore.nextPhrase();
};

const restartTrack = () => {
    playerStore.restartTrack();
};

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
    if (event.key === ' ') {
        playerStore.playCurrentPhrase()
    } else if (event.key === 'ArrowLeft') {
        prevPhrase();
    } else if (event.key === 'ArrowRight') {
        nextPhrase();
    }
};

</script>

<style scoped>
</style>
