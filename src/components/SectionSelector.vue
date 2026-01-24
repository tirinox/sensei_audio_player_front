<script setup>
const props = defineProps({
    sections: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits([
    "select",
]);

function onSelect(section) {
    emit("select", section);
}
</script>

<template>
    <div
        v-if="sections.length"
        class="section-selector text-body-2"
    >
        <template v-for="(s, idx) in sections" :key="s.index">
            <a
                href="#"
                class="section-link"
                @click.prevent="onSelect(s)"
            >
                {{ s.text }}
            </a>

            <span
                v-if="idx < sections.length - 1"
                class="section-sep"
            >
                |
            </span>
        </template>
    </div>
</template>

<style scoped>
.section-selector {
    line-height: 1.6;
    word-break: break-word;
}

.section-link {
    color: rgb(var(--v-theme-primary));
    cursor: pointer;
    text-decoration: none;
}

.section-link:hover {
    text-decoration: underline;
}

.section-sep {
    margin: 0 2px;
    opacity: 0.5;
}
</style>
