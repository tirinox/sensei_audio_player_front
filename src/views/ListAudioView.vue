<template>
    <!-- Content -->
    <v-container>

        <!-- Toolbar -->
        <v-app-bar app elevation="1">

            <v-btn icon id="menu-activator">
                <v-icon>mdi-menu</v-icon>
            </v-btn>

            <v-menu activator="#menu-activator">
                <v-list>
                    <v-list-item>
                        <v-list-item-title @click="playerStore.fetchPlaylist()">Обновить</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-title @click="accessStore.exit()">Выход</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <!-- Title -->
            <v-toolbar-title>Список записей</v-toolbar-title>

        </v-app-bar>

        <!-- Text field for filtering -->
        <v-text-field
            v-model="trackListStore.searchQuery"
            label="Поиск по записям..."
            append-icon="mdi-magnify"
            clearable
        >
        </v-text-field>

        <v-btn
            size="small"
            @click="pickRandom"
            class="mb-1"
        >
            <v-icon>mdi-shuffle-variant</v-icon>
            Случайная
        </v-btn>

        <v-pull-to-refresh
            :pull-down-threshold="64"
            @load="pullToRefresh"
        >

            <v-list
                lines="two"
                item-props
            >
                <v-list-item
                    v-for="track in playlistFiltered"
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

                <v-list-item v-if="playlistFiltered.length === 0">
                    <v-list-item-title>Нет записей</v-list-item-title>
                </v-list-item>

            </v-list>
        </v-pull-to-refresh>
    </v-container>

</template>

<script setup>
import {computed} from 'vue';
import {usePlayerStore} from '../stores/usePlayerStore';
import router from "@/router/index.js";
import {toHHMMSS} from "@/helpers/DateHelpers.js";
import {useAccess} from "@/stores/userProtection.js";
import {useTrackList} from "@/stores/useTrackList.js";

const accessStore = useAccess()
const playerStore = usePlayerStore();

const trackListStore = useTrackList();

const selectTrack = (track) => {
    playerStore.selectTrack(track);
    router.push('/player');
};


const pullToRefresh = async ({done}) => {
    accessStore.loadOnStart().then(() => done());
};

const pickRandom = () => {
    // todo! move to store
    if (playerStore.playlist.length > 0) {
        const randomIndex = Math.floor(Math.random() * playerStore.playlist.length);
        const randomTrack = playerStore.playlist[randomIndex];
        selectTrack(randomTrack);
    } else {
        console.warn("Playlist is empty, cannot pick a random track.");
    }
};

const playlistFiltered = computed(() => {
    // todo! move to store
    try {
        if (!trackListStore.searchQuery) {
            return playerStore.playlist;
        } else {
            const searchQ = trackListStore.searchQuery.trim().toLowerCase()
            return playerStore.playlist.filter(track => track.title.toLowerCase().includes(searchQ));
        }
    } catch (e) {
        console.error(e)
        return []
    }
});

</script>