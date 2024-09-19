<template>
  <v-ons-page>
    <!-- Toolbar -->
    <v-ons-toolbar>
      <div class="center">Список записей</div>
    </v-ons-toolbar>

    <!-- Content -->
    <div class="content">
      <v-ons-list>
        <v-ons-list-item
            v-for="track in playlist"
            :key="track.id"
            tappable
            @click="selectTrack(track)"
        >
          {{ track.title }}
        </v-ons-list-item>
      </v-ons-list>
    </div>
  </v-ons-page>
</template>

<script setup>
import {computed, onMounted} from 'vue';
import { usePlayerStore } from '../stores/usePlayerStore';
import router from "@/router/index.js";

const playerStore = usePlayerStore();

const selectTrack = (track) => {
  playerStore.currentTrack = track;
  playerStore.currentPhraseIndex = 0;
  router.push('/player');
};

onMounted(() => {
  playerStore.fetchPlaylist();
});

const playlist = computed(() => playerStore.playlist);

</script>