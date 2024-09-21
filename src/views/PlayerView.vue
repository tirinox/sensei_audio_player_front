<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-app-bar
            app
            fixed
            elevation="2"
        >

          <v-btn icon @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <!-- Title -->
          <v-toolbar-title>Проигрыватель</v-toolbar-title>

        </v-app-bar>

        <v-row v-if="playerStore.currentTrack">
          <v-col>
            <v-card>
              <v-card-title>

                <v-progress-circular
                    v-if="playerStore.isLoading"
                    indeterminate
                    color="primary"></v-progress-circular>

                <h2>{{ playerStore.currentTrack ? playerStore.currentTrack.title : 'Нет записи' }}</h2>
              </v-card-title>
              <v-card-text>
                <!--                <KaraokeText/>-->
                <p>{{ currentPhraseIndex + 1 }} / {{ playerStore.totalPhrases }}</p>

                <p v-html="playerStore.currentPhrase.text" class="phrase-text"></p>
                <ProgressBar
                    :currentTime="currentTime"
                    :duration="phraseDuration"
                />

              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="card-controls">
          <v-col>
            <v-card>
              <v-card-text>
                <PlaybackControls
                    :isPlaying="isPlaying"
                    :enabled="controlsEnabled"
                    @prev="prevPhrase"
                    @playPause="togglePlayPause"
                    @next="nextPhrase"
                    @restart="restartTrack"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>


      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {usePlayerStore} from '../stores/usePlayerStore';

// import KaraokeText from '../components/KaraokeText.vue';
import ProgressBar from '../components/ProgressBar.vue';
import PlaybackControls from '../components/PlaybackControls.vue';

const playerStore = usePlayerStore();
const router = useRouter();

const currentTime = ref(0);

const currentPhraseIndex = computed(() => playerStore.currentPhraseIndex);
const isPlaying = computed(() => playerStore.isPlaying);


const phraseDuration = computed(() => {
  return 300;
});

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
.card-controls {
  padding-bottom: 50px;
}
</style>
