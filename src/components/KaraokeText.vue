<template>
  <div class="karaoke-text">
    <p class="blurred">{{ previousPhrase }}</p>
    <p class="current">{{ currentPhrase.text }}</p>
    <p class="blurred">{{ nextPhrase }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
  return props.phrases[props.currentIndex] || { text: '' };
});

const previousPhrase = computed(() => {
  if (props.currentIndex > 0) {
    return props.phrases[props.currentIndex - 1].text;
  }
  return '';
});

const nextPhrase = computed(() => {
  if (props.currentIndex < props.phrases.length - 1) {
    return props.phrases[props.currentIndex + 1].text;
  }
  return '';
});
</script>

<style scoped>
.karaoke-text {
  text-align: center;
  margin: 20px 0;
}

.blurred {
  color: #ccc;
  font-size: 18px;
}

.current {
  font-weight: bold;
  font-size: 24px;
}
</style>
