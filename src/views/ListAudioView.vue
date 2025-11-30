<template>
    <!-- Content -->
    <v-container>

        <!-- Toolbar -->
        <v-app-bar app elevation="1">
            <v-btn icon id="menu-activator">
                <v-icon>mdi-menu</v-icon>
            </v-btn>

            <MainMenu></MainMenu>

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
            @click="trackListStore.pickRandom"
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
                    v-for="track in trackListStore.playlistFiltered"
                    :key="track.id"
                    @click="trackListStore.selectTrack(track)"
                    :subtitle="track.n_segments + ' фраз.'"
                >
                    <template v-slot:prepend>
                        <v-avatar :color="!isDark ? 'grey-lighten-1' : 'grey-darken-3'">
                            <v-icon :color="'white'">mdi-volume-high</v-icon>
                        </v-avatar>
                    </template>

                    <span class="text-primary">{{ track.title }}</span>
                    <template v-slot:append>
                        {{ toHHMMSS(track.length) }}
                    </template>
                </v-list-item>

                <v-list-item v-if="!trackListStore.isAnyTracksMatching">
                    <v-list-item-title>Нет записей</v-list-item-title>
                </v-list-item>

            </v-list>
        </v-pull-to-refresh>
    </v-container>

</template>

<script setup>
import {toHHMMSS} from "@/helpers/DateHelpers.js";
import {useAccess} from "@/stores/protectionStore.js";
import {useTrackListStore} from "@/stores/trackListStore.js";
import MainMenu from "@/components/MainMenu.vue";
import {useIsDark} from "@/helpers/Themes.js";

const accessStore = useAccess()
const trackListStore = useTrackListStore();
const isDark = useIsDark()

const pullToRefresh = async ({done}) => {
    accessStore.loadOnStart().then(() => done());
};

</script>