<script setup>
import AccessCodeDialog from "@/components/AccessCodeDialog.vue";
</script>

<template>
  <v-app>
    <v-main>
      <AccessCodeDialog></AccessCodeDialog>

      <v-container fluid fill-height name="routedcont" style="height: 100vh;">
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
