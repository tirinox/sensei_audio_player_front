<template>
    <v-container class="controls d-flex justify-space-between align-end ga-2">
        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="64"
                class="player-btn"
                :readonly="!enabled"
                @click="onClick($event, 'prev')"
                v-on="longPressHandlers('prev')"
            >
                <v-icon size="30">mdi-skip-previous</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">пред</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="92"
                class="player-btn player-btn--primary"
                :readonly="!enabled"
                @click="onClick($event, 'playPause')"
                v-on="longPressHandlers('playPause')"
            >
                <v-icon size="44">
                    {{ isPlaying ? "mdi-pause" : "mdi-play" }}
                </v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">{{ isPlaying ? 'пауза' : 'плей' }}</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="64"
                class="player-btn"
                :readonly="!enabled"
                @click="onClick($event, 'replay')"
                v-on="longPressHandlers('replay')"
            >
                <v-icon size="30">mdi-replay</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">ещё</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="80"
                class="player-btn"
                :readonly="!enabled"
                @click="onClick($event, 'next')"
                v-on="longPressHandlers('next')"
            >
                <v-icon size="38">mdi-skip-next</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">след</div>
        </div>

    </v-container>

    <Teleport to="body">
        <Transition name="slowdown-pop">
            <div
                v-if="previewVisible"
                class="slowdown-preview"
                :style="{
                    left: `${previewLeft}px`,
                    top: `${previewTop}px`,
                    '--arrow-left': `${previewArrowLeft}px`,
                }"
                role="status"
                aria-live="off"
            >
                <div class="slowdown-preview__label">Замедление</div>
                <div class="slowdown-preview__values">
                    <span class="slowdown-preview__percent">
                        <span :key="previewPercent" class="slowdown-preview__tick">−{{ previewPercent }}%</span>
                    </span>
                    <span class="slowdown-preview__rate">{{ previewRate.toFixed(2) }}×</span>
                </div>
                <div class="slowdown-preview__track">
                    <div class="slowdown-preview__fill" :style="{ width: `${previewProgress}%` }"></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import {
    MAX_SLOW_RATE,
    SHORT_TAP_MAX_DURATION,
    slowdownRate,
} from "@/helpers/playbackSlowdown.js";

const props = defineProps({
    isPlaying: { type: Boolean, required: true },
    enabled: { type: Boolean, required: true },
});

const emit = defineEmits(["longTap"]);

// ---- long press impl ----
const isEnabled = computed(() => !!props.enabled);

let pressStartedAtMs = 0;
let activeAction = null;
let activePointerId = null;
let previewTimer = null;
let activeButton = null;

const previewVisible = ref(false);
const previewPercent = ref(0);
const previewRate = ref(1);
const previewLeft = ref(0);
const previewTop = ref(0);
const previewArrowLeft = ref(88);
const previewProgress = computed(() => previewPercent.value / ((1 - MAX_SLOW_RATE) * 100) * 100);

/**
 * Возвращает набор обработчиков, которые можно навесить через v-on="..."
 * Используем Pointer Events: они хорошо работают и на мыши, и на таче.
 */
function longPressHandlers(action) {
    return {
        pointerdown: (e) => onPressStart(e, action),
        pointerup: onPressEnd,
        pointercancel: onPressCancel,
        // на всякий случай, если браузер шлёт touchcancel отдельно
        touchcancel: onPressCancel,
        contextmenu: (e) => e.preventDefault(), // чтобы долгий тап не вызывал меню на мобилках
    };
}

function onPressStart(e, action) {
    if (!isEnabled.value || activeAction) return;

    // только основная кнопка мыши (если это мышь)
    if (e.pointerType === "mouse" && e.button !== 0) return;

    activeAction = action;
    activePointerId = e.pointerId;
    activeButton = e.currentTarget;
    pressStartedAtMs = performance.now();
    previewPercent.value = 0;
    previewRate.value = 1;

    previewTimer = window.setInterval(updatePreview, 40);

    // чтобы pointerup гарантированно прилетел на эту же кнопку
    try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
}

function updatePreview() {
    if (!activeAction) return;

    const seconds = (performance.now() - pressStartedAtMs) / 1000;
    if (seconds < SHORT_TAP_MAX_DURATION) return;

    const rect = activeButton.getBoundingClientRect();
    const buttonCenter = rect.left + rect.width / 2;
    previewLeft.value = Math.min(Math.max(buttonCenter, 88), window.innerWidth - 88);
    previewTop.value = rect.top - 12;
    previewArrowLeft.value = Math.min(Math.max(88 + buttonCenter - previewLeft.value, 12), 164);

    const rate = slowdownRate(seconds);
    previewPercent.value = Math.round((1 - rate) * 100);
    previewRate.value = Number(rate.toFixed(2));
    previewVisible.value = true;
}

function onPressEnd(e) {
    if (!activeAction || e.pointerId !== activePointerId) return;

    const seconds = Math.max(0, (performance.now() - pressStartedAtMs) / 1000);
    const action = activeAction;
    resetPress();
    if (isEnabled.value) emit("longTap", { action, seconds });
}

function resetPress() {
    if (previewTimer !== null) {
        window.clearInterval(previewTimer);
        previewTimer = null;
    }
    previewVisible.value = false;
    activeAction = null;
    activePointerId = null;
    activeButton = null;
    pressStartedAtMs = 0;
}

function onPressCancel(e) {
    if ("pointerId" in e && e.pointerId !== activePointerId) return;
    resetPress();
}

function onClick(e, action) {
    // Клавиатура и вспомогательные средства активируют кнопку без Pointer Events.
    if (e.detail === 0 && isEnabled.value) {
        emit("longTap", { action, seconds: 0 });
    }
}

watch(isEnabled, (enabled) => {
    if (!enabled) resetPress();
});

onBeforeUnmount(resetPress);
</script>

<style scoped>
.controls {
    padding: 0 !important;
    max-width: 640px;
}

.player-btn {
    touch-action: manipulation; /* снижает шанс double-tap zoom */
    -webkit-tap-highlight-color: transparent;

    user-select: none;
    -webkit-user-select: none;

    -webkit-touch-callout: none; /* iOS: контекстное меню */
}

.player-btn--primary {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}

.controls :deep(.v-btn) {
    flex-shrink: 0;
}

.slowdown-preview {
    position: fixed;
    z-index: 3000;
    width: 152px;
    padding: 10px 12px 11px;
    border-radius: 14px;
    background: #24283b;
    color: #fff;
    box-shadow: 0 10px 28px rgba(22, 27, 45, 0.28);
    pointer-events: none;
    transform: translate(-50%, -100%);
    user-select: none;
}

.slowdown-preview::after {
    content: "";
    position: absolute;
    left: calc(var(--arrow-left) - 6px);
    bottom: -6px;
    width: 12px;
    height: 12px;
    background: #24283b;
    transform: rotate(45deg);
}

.slowdown-preview__label {
    font-size: 11px;
    line-height: 1.2;
    opacity: 0.72;
}

.slowdown-preview__values {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 3px;
    font-variant-numeric: tabular-nums;
}

.slowdown-preview__percent {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: #ffd86c;
}

.slowdown-preview__tick {
    display: inline-block;
    animation: slowdown-tick 130ms ease-out;
}

.slowdown-preview__rate {
    font-size: 13px;
    opacity: 0.8;
}

.slowdown-preview__track {
    height: 4px;
    margin-top: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
}

.slowdown-preview__fill {
    height: 100%;
    border-radius: inherit;
    background: #ffd86c;
    transition: width 40ms linear;
}

.slowdown-pop-enter-active,
.slowdown-pop-leave-active {
    transition: opacity 170ms ease, margin-top 170ms ease;
}

.slowdown-pop-enter-from,
.slowdown-pop-leave-to {
    opacity: 0;
    margin-top: 8px;
}

@keyframes slowdown-tick {
    from { opacity: 0.55; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
    .slowdown-preview__tick { animation: none; }
    .slowdown-preview__fill,
    .slowdown-pop-enter-active,
    .slowdown-pop-leave-active { transition: none; }
}
</style>
