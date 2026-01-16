<script setup lang="ts">
import {useRouter} from "vue-router";
import {usePlayerStore} from "@/stores/playerStore.js";

const router = useRouter();
const playerStore = usePlayerStore();

const goBack = () => {
    playerStore.stop()
    router.push('/');
};


</script>

<template>
    <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <v-toolbar-title>{{ playerStore.title }}
    </v-toolbar-title>
</template>

<style scoped>

</style>