import {computed, unref} from "vue";
import {extractFurigana, parenthesesToRuby, stripFurigana} from "@/helpers/Nihongo.js";

export function usePhrases(phrasesRef, currentIndexRef, modeRef) {
    const currentPhrase = computed(() => {
        const phrases = unref(phrasesRef) || [];
        const idx = Number(unref(currentIndexRef)) - 1;
        return phrases[idx]?.text ?? "";
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
    };

    const displayedPhrase = computed(() => {
        const mode = unref(modeRef);
        const phrase = unref(currentPhrase);
        return extractTextWithMode(mode, phrase);
    });

    return {
        currentPhrase,
        displayedPhrase,
        extractTextWithMode,
    };
}
