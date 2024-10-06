<template>
  <div class="karaoke-text pb-2">
    <v-row>
      <v-col cols="auto" class="d-flex flex-column justify-center">
        <v-btn
            :icon="showText ? 'mdi-eye-off' : 'mdi-eye'"
            @click="showText = !showText"
            density="comfortable"
            variant="text"
        ></v-btn>
      </v-col>
      <v-col>
        <p v-html="currentPhrase" class="phrase-text" v-show="showText"></p>
      </v-col>
    </v-row>

    <!--    <p v-html="previousPhrase" class="blurry"></p>-->
    <!--    <p v-html="nextPhrase" class="blurry"></p>-->

  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import {parenthesesToRuby} from "@/helpers/Nihongo.js";

const showText = ref(true);

const props = defineProps({
  phrases: {
    type: Array,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
});

const currentPhrase = computed(() => {
  return parenthesesToRuby(props.phrases[props.currentIndex - 1].text)
});

// const previousPhrase = computed(() => {
//   if (props.currentIndex > 1) {
//     return props.phrases[props.currentIndex - 2].text;
//   }
//   return '';
// });
//
// const nextPhrase = computed(() => {
//   if (props.currentIndex < props.phrases.length) {
//     return props.phrases[props.currentIndex].text;
//   }
//   return '';
// });
</script>

<style scoped>

.phrase-text {
  font-size: 2em;
}

.blurry {
  font-size: 1.5em;
  color: #ccc;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

</style>
