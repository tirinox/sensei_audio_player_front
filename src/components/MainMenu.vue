<template>
    <v-menu activator="#menu-activator">
        <v-list>
            <v-list-item>
                <v-list-item-title @click="trackListStore.fetchPlaylist()">Обновить</v-list-item-title>
            </v-list-item>

            <v-list-item>
                <v-btn
                    variant="text"
                    @click="toggleTheme"
                >
                    Тема: {{ nextThemeLabel }}
                </v-btn>
            </v-list-item>

            <v-list-item>
                <v-list-item-title @click="accessStore.exit()">Выход</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup>
import {useTheme} from 'vuetify'
import {ref, computed, onMounted} from 'vue'
import {useAccess} from '@/stores/userProtection.js'
import {useTrackList} from '@/stores/useTrackList.js'

const accessStore = useAccess()
const trackListStore = useTrackList()

const theme = useTheme()
const THEME_KEY = 'app_theme_mode' // 'light' or 'dark'

const currentMode = ref('light')

// Load theme from localStorage
onMounted(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') {
        theme.global.name.value = saved
        currentMode.value = saved
    }
})

// Compute label for next mode
const nextThemeLabel = computed(() =>
    currentMode.value === 'light' ? 'Тёмная' : 'Светлая'
)

// Toggle theme
function toggleTheme() {
    currentMode.value = currentMode.value === 'light' ? 'dark' : 'light'
    theme.global.name.value = currentMode.value
    localStorage.setItem(THEME_KEY, currentMode.value)
}
</script>