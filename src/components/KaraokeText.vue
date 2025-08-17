<template>
    <div class="karaoke-text pb-2">
        <v-chip class="d">
            {{ currentIndex }} / {{ phrases.length }}
        </v-chip>

        <v-btn
            @click="toggleMode"
            density="comfortable"
            variant="text"
            class="ml-2"
        >
            <span>{{ modeIcons[showTextMode] }}</span>
        </v-btn>

        <v-btn
            @click="copyButton"
            density="comfortable"
            variant="text"
            class="ml-2">
            <v-icon>mdi-content-copy</v-icon>
        </v-btn>

        <v-btn
            @click="translateDeeplButton"
            density="comfortable"
            variant="text"
            class="ml-2">
            <v-icon>mdi-translate</v-icon>
        </v-btn>

        <v-btn
            @click="chatGtpExplainGrammarButton"
            density="comfortable"
            variant="text"
            class="ml-2">
            <v-icon>mdi-chat</v-icon>
        </v-btn>

        <p class="phrase-text mt-4 mb-2">
            <span v-html="displayedPhrase"></span>
        </p>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import {extractFurigana, parenthesesToRuby, stripFurigana} from "@/helpers/Nihongo.js";

const textModesOrder = [
    "full",
    "kanji",
    "hiragana",
    "none"
]

const modeIcons = {
    kanji: '漢字',
    hiragana: 'かな',
    full: '字＋あ',
    none: '...'
}

// From LocalStorage or default to "full"
let initTextMode = localStorage.getItem("karaokeTextMode") || "full";

// check if initTextMode is valid
if (!textModesOrder.includes(initTextMode)) {
    initTextMode = textModesOrder[0];
}

const showTextMode = ref(initTextMode);

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
    return props.phrases[props.currentIndex - 1].text;
});

const extractTextWithMode = (mode, phrase) => {
    switch (mode) {
        case "full":
            return parenthesesToRuby(phrase);
        case "kanji":
            return stripFurigana(phrase);
        case "hiragana":
            return extractFurigana(phrase);
        default:
            return "...";
    }
}

const displayedPhrase = computed(() => {
    return extractTextWithMode(showTextMode.value, currentPhrase.value);
})


const toggleMode = () => {
    const currentIndex = textModesOrder.indexOf(showTextMode.value);
    const nextIndex = (currentIndex + 1) % textModesOrder.length;
    showTextMode.value = textModesOrder[nextIndex];
    localStorage.setItem("karaokeTextMode", showTextMode.value);
}

const copyButton = () => {
    const phrase = extractTextWithMode('kanji', currentPhrase.value);
    navigator.clipboard.writeText(phrase)
        .then(() => {
            console.log("Phrase copied to clipboard:", phrase);
        })
        .catch(err => {
            console.error("Failed to copy phrase:", err);
        });
}

const translateDeeplButton = () => {
    const phrase = extractTextWithMode('kanji', currentPhrase.value);
    const deeplUrl = `https://www.deepl.com/translator#ja/ru/${encodeURIComponent(phrase)}`;
    window.open(deeplUrl, '_blank');
}

const chatGtpExplainGrammarButton = () => {
    const phrase = extractTextWithMode('kanji', currentPhrase.value);
    const ruPrompt = `Объясни грамматику следующей фразы на русском языке: "${phrase}"`;
    const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(ruPrompt)}`;
    window.open(chatGptUrl, '_blank');
}

</script>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>

.phrase-text {
    font-size: 2em;
}

rt {
    color: var(--v-theme-on-surface);
    opacity: 0.6; /* optional for subtler appearance */
}

ruby {
    color: var(--v-theme-on-surface);
}

</style>
