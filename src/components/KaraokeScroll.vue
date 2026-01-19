<script setup>
import {computed, nextTick, onMounted, ref, toRefs, watch} from "vue";
import {usePhrases} from "@/helpers/Phrases.js";

// props
const props = defineProps({
    phrases: {type: Array, required: true},
    currentIndex: {type: Number, required: true}, // 1-based
    // optional: режим отображения (full/kanji/hiragana/none) — если хочешь синхронизировать с KaraokeText
    mode: {type: String, default: "full"},

    // optional: высота окна
    height: {type: [Number, String], default: 280},

    // optional: можно ли выбирать кликом
    selectable: {type: Boolean, default: true},
});

const emit = defineEmits(["select"]);

const {phrases, currentIndex} = toRefs(props);

// mode как computed-ref, чтобы usePhrases жило в reactive мире
const modeRef = computed(() => props.mode);

// refs на контейнер и элементы
const boxRef = ref(null);
const itemRefs = ref([]);

// --- usePhrases: хотим получать displayedPhrase для "текущей" фразы
const {displayedPhrase} = usePhrases(phrases, currentIndex, modeRef);

// Для списка: текст каждого элемента. Делать отдельный usePhrases на каждый — дорого.
// Поэтому используем extractTextWithMode из usePhrases (оно чистое) через маленький хелпер.
const {extractTextWithMode} = usePhrases(phrases, currentIndex, modeRef);

const currentIdx0 = computed(() => Math.max(0, (Number(props.currentIndex) || 1) - 1));

const getPhraseHtml = (p) => {
    const text = p?.text ?? "";
    return extractTextWithMode(props.mode, text);
};

const scrollToCurrent = async (behavior = "smooth") => {
    await nextTick();

    const box = boxRef.value;
    const el = itemRefs.value?.[currentIdx0.value];

    if (!box || !el) return;

    // центрируем выбранный элемент внутри контейнера
    const boxRect = box.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const currentScrollTop = box.scrollTop;
    const elTopInsideBox = (elRect.top - boxRect.top) + currentScrollTop;

    const target =
        elTopInsideBox - (box.clientHeight / 2) + (el.clientHeight / 2);

    box.scrollTo({top: Math.max(0, target), behavior});
};

const onSelect = (idx0) => {
    if (!props.selectable) return;
    emit("select", idx0 + 1); // 1-based наружу, как у тебя currentIndex
};

// Авто-центрирование при изменениях
watch([currentIndex, phrases], () => scrollToCurrent("smooth"));
onMounted(() => scrollToCurrent("auto"));
</script>

<template>
    <div class="karaoke-scroll">
        <!-- сверху можно оставить текущую фразу (как подсказку), если хочешь -->
        <!-- <div class="current-preview" v-html="displayedPhrase" /> -->

        <div
            ref="boxRef"
            class="scroll-box"
            :style="{ height: typeof height === 'number' ? `${height}px` : height }"
        >
            <!-- Небольшие паддинги, чтобы было куда центрировать -->
            <div class="pad"/>

            <div
                v-for="(p, idx0) in phrases"
                :key="p.id || p.public_id || idx0"
                :ref="(el) => (itemRefs[idx0] = el)"
                class="phrase-row"
                :class="{ active: idx0 === currentIdx0 }"
                @click="onSelect(idx0)"
            >
                <div class="row-inner">
                    <span class="idx">{{ idx0 + 1 }}</span>

                    <!-- HTML (ruby) -->
                    <span
                        class="text"
                        v-html="getPhraseHtml(p)"
                    />
                </div>
            </div>

            <div class="pad"/>
        </div>
    </div>
</template>

<style scoped>
.karaoke-scroll {
    width: 100%;
}

.scroll-box {
    overflow-y: auto;
    border-radius: 14px;
    padding: 6px 10px;
    /* лёгкая рамка как у виджета */
    border: 1px solid rgba(0, 0, 0, 0.12);
}

/* “воздух” сверху/снизу чтобы активная реально могла стать по центру */
.pad {
    height: 40%;
}

/* строка */
.phrase-row {
    padding: 10px 6px;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;

    opacity: 0.35;
    transition: opacity 120ms ease, transform 120ms ease, background-color 120ms ease;
}

.phrase-row:hover {
    opacity: 0.55;
    background: rgba(0, 0, 0, 0.04);
}

/* активная (текущая) */
.phrase-row.active {
    opacity: 1;
    transform: scale(1.02);
    background: rgba(0, 0, 0, 0.06);
}

/* внутренности */
.row-inner {
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.idx {
    font-size: 12px;
    opacity: 0.5;
    min-width: 2.2em;
    text-align: right;
}

.text {
    font-size: 1.4em;
    line-height: 1.25;
}

/* ruby styling как у тебя */
rt {
    opacity: 0.6;
}
</style>
