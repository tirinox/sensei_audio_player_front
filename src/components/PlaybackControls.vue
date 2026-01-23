<template>
    <v-container class="controls d-flex justify-space-between">
        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="64"
                class="player-btn"
                :readonly="!enabled"
                @click="emit('restart')"
                v-on="longPressHandlers('restart')"
            >
                <v-icon size="30">mdi-skip-backward</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">начало</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="64"
                class="player-btn"
                :readonly="!enabled"
                @click="emit('prev')"
                v-on="longPressHandlers('prev')"
            >
                <v-icon size="30">mdi-skip-previous</v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">пред</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="64"
                class="player-btn"
                :readonly="!enabled"
                @click="emit('playPause')"
                v-on="longPressHandlers('playPause')"
            >
                <v-icon size="30">
                    {{ isPlaying && isPlayingCurrent ? "mdi-pause" : "mdi-replay" }}
                </v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">ещё</div>
        </div>

        <div class="d-flex flex-column align-center justify-end">
            <v-btn
                icon
                size="80"
                class="player-btn"
                :readonly="!enabled"
                @click="emit('next')"
                v-on="longPressHandlers('next')"
            >
                <v-icon size="38">
                    {{ isPlaying && !isPlayingCurrent ? "mdi-pause" : "mdi-skip-next" }}
                </v-icon>
            </v-btn>
            <div class="mt-2 text-subtitle-2">след</div>
        </div>
    </v-container>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    isPlaying: { type: Boolean, required: true },
    isPlayingCurrent: { type: Boolean, required: true },
    enabled: { type: Boolean, required: true },
});

/**
 * click-события — как раньше
 * longTap — новый: длительность удержания в секундах
 */
const emit = defineEmits(["restart", "prev", "playPause", "next", "longTap"]);

// ---- long press impl ----
const isEnabled = computed(() => !!props.enabled);

let pressStartedAtMs = 0;
let activeAction = null;

/**
 * Возвращает набор обработчиков, которые можно навесить через v-on="..."
 * Используем Pointer Events: они хорошо работают и на мыши, и на таче.
 */
function longPressHandlers(action) {
    return {
        pointerdown: (e) => onPressStart(e, action),
        pointerup: onPressEnd,
        pointercancel: onPressCancel,
        pointerleave: onPressCancel,
        // на всякий случай, если браузер шлёт touchcancel отдельно
        touchcancel: onPressCancel,
        contextmenu: (e) => e.preventDefault(), // чтобы долгий тап не вызывал меню на мобилках
    };
}

function onPressStart(e, action) {
    if (!isEnabled.value) return;

    // только основная кнопка мыши (если это мышь)
    if (e.pointerType === "mouse" && e.button !== 0) return;

    activeAction = action;
    pressStartedAtMs = performance.now();

    // чтобы pointerup гарантированно прилетел на эту же кнопку
    try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
}

function onPressEnd() {
    if (!isEnabled.value) return;
    if (!activeAction) return;

    const seconds = Math.max(0, (performance.now() - pressStartedAtMs) / 1000);
    emit("longTap", { action: activeAction, seconds });

    activeAction = null;
    pressStartedAtMs = 0;
}

function onPressCancel() {
    activeAction = null;
    pressStartedAtMs = 0;
}
</script>

<style scoped>
.controls {
    padding: 0 !important;
    max-width: 500px;
}

.player-btn {
    touch-action: manipulation; /* снижает шанс double-tap zoom */
    -webkit-tap-highlight-color: transparent;

    user-select: none;
    -webkit-user-select: none;

    -webkit-touch-callout: none; /* iOS: контекстное меню */
}
</style>
