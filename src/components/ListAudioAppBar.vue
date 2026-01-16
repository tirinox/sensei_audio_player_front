<template>

    <v-btn icon id="menu-activator">
        <v-icon>mdi-menu</v-icon>
    </v-btn>

    <MainMenu></MainMenu>

    <!-- Title -->
    <v-toolbar-title>Список записей</v-toolbar-title>

</template>
<script setup lang="ts">
import MainMenu from "@/components/MainMenu.vue";
</script>