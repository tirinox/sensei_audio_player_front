<script setup>
</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <transition>
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>


</template>

<style scoped>
</style>
