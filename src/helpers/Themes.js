import {computed} from 'vue'
import {useTheme} from 'vuetify'

export function useIsDark() {
    const theme = useTheme()

    return computed(() => theme.global.current.value === 'dark')
}
