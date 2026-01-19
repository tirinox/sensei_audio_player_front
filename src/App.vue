<script setup>
import PlayerAppBar from "@/components/PlayerAppBar.vue";
import ListAudioAppBar from "@/components/ListAudioAppBar.vue";
import {useRoute} from "vue-router";
import {computed} from "vue";
import {useAccess} from "@/stores/protectionStore.js";

const route = useRoute();

const appBarComponent = computed(() => {
    switch (route.name) {
        case "player":
            return PlayerAppBar;
        case "playlist":
        default:
            return ListAudioAppBar;
    }
});

const accessStore = useAccess();
</script>

<template>
    <v-app>
        <v-app-bar app elevation="1" class="appbar" v-if="!accessStore.isLoading && accessStore.accessGranted">
            <component :is="appBarComponent"/>
        </v-app-bar>

        <v-main class="main">
            <router-view/>
        </v-main>
    </v-app>
</template>

<style>

/* safe area именно на верхний layout */
.appbar {
    padding-top: env(safe-area-inset-top);
}

.main {
    padding-top: env(safe-area-inset-top);
}

/* важно: не делай внутренний скролл-контейнер на appcont */
html, body, #app {
    height: 100%;
}

body {
    margin: 0;
    overflow-x: hidden;
}

</style>
