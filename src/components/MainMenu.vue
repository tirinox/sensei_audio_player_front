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

            <v-list-item @click="openAboutDialog">
                <v-list-item-title>О приложении</v-list-item-title>
            </v-list-item>

            <v-list-item @click="exit">
                <v-list-item-title>Выход</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>

    <v-dialog v-model="isAboutDialogOpen" max-width="420">
        <v-card>
            <v-card-title class="text-center pt-6">
                О приложении
            </v-card-title>

            <v-card-text class="text-center">
                <v-img
                    src="logo.png"
                    width="96"
                    height="96"
                    class="mx-auto mb-4 rounded-circle"
                />

                <div class="text-h6 mb-2">Sensei Audio</div>
                <div class="mb-1">Версия: {{ accessStore.appVersion }}</div>
                <div class="mb-1">Автор: Tirinox</div>
                <div>&copy; {{ copyrightYears }} Tirinox</div>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="isAboutDialogOpen = false">
                    Закрыть
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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
const COPYRIGHT_START_YEAR = 2024

const isMenuOpen = ref(false)
const isAboutDialogOpen = ref(false)
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

const copyrightYears = computed(() => {
    const currentYear = new Date().getFullYear()

    return currentYear > COPYRIGHT_START_YEAR
        ? `${COPYRIGHT_START_YEAR}-${currentYear}`
        : `${COPYRIGHT_START_YEAR}`
})

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

function openAboutDialog() {
    isAboutDialogOpen.value = true
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