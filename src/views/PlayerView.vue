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
      <v-toolbar-title>Проигрыватель</v-toolbar-title>
    </v-app-bar>

    <v-row v-if="playerStore.currentTrack">
      <v-col>
        <v-card>
          <v-card-title>
            <h2>{{ playerStore.currentTrack ? playerStore.currentTrack.title : 'Нет записи' }}</h2>
          </v-card-title>
          <v-card-text>

            <p v-html="playerStore.currentPhrase.text" class="phrase-text pb-2"></p>
            <ProgressBar
                :duration="playerStore.totalPhrases"
                :is-loading="playerStore.isLoading"
                v-model="progress"
            />
            <p>{{ currentPhraseIndex }} / {{ playerStore.totalPhrases }}</p>

          </v-card-text>
        </v-card>

      </v-col>
    </v-row>

    <v-footer absolute inset app width="auto">
      <v-container>
        <v-row justify="center">
          <v-col lg="4" cols="12" align-self="center">
            <v-card class="controls pa-1" elevation="0" >
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
import {computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {usePlayerStore} from '../stores/usePlayerStore';

// import KaraokeText from '../components/KaraokeText.vue';
import ProgressBar from '../components/ProgressBar.vue';
import PlaybackControls from '../components/PlaybackControls.vue';

const playerStore = usePlayerStore();
const router = useRouter();

const currentPhraseIndex = computed(() => playerStore.currentPhraseIndex);
const isPlaying = computed(() => playerStore.isPlaying);


const goBack = () => {
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

const progress = computed({
  get: () => playerStore.currentPhraseIndex,
  set: (value) => playerStore.setPhrase(Math.round(value))
});

// on mount if there is no track selected then redirect to the list
onMounted(() => {
});

const controlsEnabled = computed(() => {
  return !!(playerStore.currentTrack && !playerStore.isLoading)
});

</script>

<style scoped>
.phrase-text {
  font-size: 2em;
}

</style>
