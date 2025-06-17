import 'vuetify/styles'; // Global CSS has to be imported
import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VPullToRefresh } from 'vuetify/labs/VPullToRefresh'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createVuetify({
    theme: {
        defaultTheme: 'light',
    },
    components: {
        VPullToRefresh,
        ...components,
    },
    directives,
}))

document.title = 'SenseiAudioPlayer'

app.mount('#app')
