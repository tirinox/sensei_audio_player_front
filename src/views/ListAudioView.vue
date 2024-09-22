<template>
  <!-- Content -->
  <v-container>

    <!-- Toolbar -->
    <v-app-bar app elevation="1">

      <!-- Title -->
      <v-toolbar-title>Список записей</v-toolbar-title>

    </v-app-bar>

    <v-pull-to-refresh
        :pull-down-threshold="64"
        @load="pullToRefresh"
    >
      <v-list
          lines="two"
          item-props
      >
        <v-list-item
            v-for="track in playlist"
            :key="track.id"
            @click="selectTrack(track)"
            :subtitle="track.n_segments + ' фраз.'"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon color="white">mdi-volume-high</v-icon>
            </v-avatar>
          </template>

          <span class="text-primary">{{ track.title }}</span>
          <template v-slot:append>
            {{ toHHMMSS(track.length) }}
          </template>

        </v-list-item>
      </v-list>
    </v-pull-to-refresh>
  </v-container>

</template>

<script setup>
import {computed, onMounted} from 'vue';
import {usePlayerStore} from '../stores/usePlayerStore';
import router from "@/router/index.js";
import {toHHMMSS} from "@/helpers/DateHelpers.js";


const playerStore = usePlayerStore();

const selectTrack = (track) => {
  playerStore.selectTrack(track);
  router.push('/player');
};

onMounted(() => {
  playerStore.fetchPlaylist();
});


const pullToRefresh = async ({done}) => {
  await playerStore.fetchPlaylist();
  done();
};

const playlist = computed(() => playerStore.playlist);

</script>