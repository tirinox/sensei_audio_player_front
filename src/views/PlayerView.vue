<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-app-bar
            app
            fixed
            elevation="2"
        >
          <!-- Back Button -->
          <v-btn icon @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <!-- Title -->
          <v-toolbar-title>Page Title</v-toolbar-title>

        </v-app-bar>

        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                <h2>{{ currentTrack ? currentTrack.title : '' }}</h2>
              </v-card-title>
              <v-card-text>
                <ProgressBar
                    :currentTime="currentTime"
                    :duration="phraseDuration"
                />
<!--                <KaraokeText/>-->
              </v-card-text>
              <v-card-actions>

                <PlaybackControls
                  :isPlaying="isPlaying"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {usePlayerStore} from '../stores/usePlayerStore';

// import KaraokeText from '../components/KaraokeText.vue';
import ProgressBar from '../components/ProgressBar.vue';
import PlaybackControls from '../components/PlaybackControls.vue';

const playerStore = usePlayerStore();
const router = useRouter();

const currentTime = ref(0);

const currentTrack = computed(() => playerStore.currentTrack);
// const currentPhraseIndex = computed(() => playerStore.currentPhraseIndex);
const isPlaying = computed(() => playerStore.isPlaying);

const phraseDuration = computed(() => {
  return 300;
});

const goBack = () => {
  router.push('/');
};

</script>

<style scoped>
</style>
