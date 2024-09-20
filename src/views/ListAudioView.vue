<template>
  <v-app>
    <v-container fluid>
      <!-- Toolbar -->
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
        <v-toolbar-title>Список записей</v-toolbar-title>

      </v-app-bar>

      <!-- Content -->
      <v-main>
        <v-container>
          <v-pull-to-refresh
              :pull-down-threshold="64"
              @load="pullToRefresh"
          >
            <v-list lines="one">
              <v-list-item
                  v-for="track in playlist"
                  :key="track.id"
                  @click="selectTrack(track)"
              >
                {{ track.title }}
              </v-list-item>
            </v-list>
          </v-pull-to-refresh>
        </v-container>
      </v-main>
    </v-container>
  </v-app>
</template>

<script setup>
import {computed, onMounted} from 'vue';
import {usePlayerStore} from '../stores/usePlayerStore';
import router from "@/router/index.js";


const playerStore = usePlayerStore();

const selectTrack = (track) => {
  playerStore.selectTrack(track);
  router.push('/player');
};

onMounted(() => {
  playerStore.fetchPlaylist();
});

const goBack = () => {
  // router to to player
  router.push('/');
};

const pullToRefresh = async ({done}) => {
  await playerStore.fetchPlaylist();
  done();
};

const playlist = computed(() => playerStore.playlist);

</script>