<template>
    <v-menu
        v-model="isMenuOpen"
        activator="#menu-activator"
        :close-on-content-click="false"
    >
        <v-list>
            <v-list-item @click="refreshPlaylist">
                <v-list-item-title>Обновить</v-list-item-title>
            </v-list-item>

            <v-list-group value="recent-access-codes">
                <template #activator="{ props }">
                    <v-list-item v-bind="props">
                        <v-list-item-title>Коды</v-list-item-title>
                    </v-list-item>
                </template>

                <v-list-item
                    v-for="item in accessStore.recentAccessCodes"
                    :key="item.accessCode"
                    :active="item.accessCode === accessStore.accessCode"
                    @click="switchAccessCode(item.accessCode)"
                >
                    <v-list-item-title>{{ item.accessCode }}</v-list-item-title>
                    <v-list-item-subtitle>{{ formatTrackCount(item.trackCount) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item
                    v-if="!accessStore.recentAccessCodes.length"
                    disabled
                >
                    <v-list-item-title>Нет недавних кодов</v-list-item-title>
                </v-list-item>
            </v-list-group>

            <v-list-item>
                <v-btn
                    variant="text"
                    @click="toggleTheme"
                >
                    Тема: {{ nextThemeLabel }}
                </v-btn>
            </v-list-item>

            <v-list-item @click="exit">
                <v-list-item-title>Выход</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup>
import {useTheme} from 'vuetify'
import {ref, computed, onMounted} from 'vue'
import {useAccess} from '@/stores/protectionStore.js'
import {useTrackListStore} from '@/stores/trackListStore.js'

const accessStore = useAccess()
const trackListStore = useTrackListStore()

const theme = useTheme()
const THEME_KEY = 'app_theme_mode' // 'light' or 'dark'

const isMenuOpen = ref(false)
const currentMode = ref('light')

// Load theme from localStorage
onMounted(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') {
        theme.change(saved);
        currentMode.value = saved;
    }
})

// Compute label for next mode
const nextThemeLabel = computed(() =>
    currentMode.value === 'light' ? 'Тёмная' : 'Светлая'
)

// Toggle theme
function closeMenu() {
    isMenuOpen.value = false
}

async function refreshPlaylist() {
    await trackListStore.fetchPlaylist()
    closeMenu()
}

function toggleTheme() {
    currentMode.value = currentMode.value === 'light' ? 'dark' : 'light'
    theme.global.name.value = currentMode.value
    localStorage.setItem(THEME_KEY, currentMode.value)
    closeMenu()
}

function pluralizeTracks(trackCount) {
    const mod10 = trackCount % 10
    const mod100 = trackCount % 100

    if (mod10 === 1 && mod100 !== 11) {
        return 'трек'
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return 'трека'
    }

    return 'треков'
}

function formatTrackCount(trackCount) {
    return `${trackCount} ${pluralizeTracks(trackCount)}`
}

async function switchAccessCode(accessCode) {
    await accessStore.submitAccessCode(accessCode)
    closeMenu()
}

function exit() {
    accessStore.exit()
    closeMenu()
}
</script>