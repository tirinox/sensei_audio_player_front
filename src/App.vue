<script setup></script>

<template>
  <v-app>
    <v-main>
      <v-container name="appcont" class="appcont">
        <router-view v-slot="{ Component }">
          <transition>
            <component :is="Component"/>
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>

html, body, #app {
  height: 100%;
  overflow-x: hidden; /* Prevents horizontal scrolling */
  overflow-y: auto; /* Ensures vertical scrolling */
  -webkit-overflow-scrolling: touch; /* Enables smooth scrolling on iOS */
}

</style>
