import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'

import App from './App.vue'
import router from './router'
import VueOnsen from 'vue-onsenui'


const app = createApp(App)

app.use(VueOnsen)
import * as components from 'vue-onsenui/esm/components';

Object.values(components).forEach(component =>
    app.component(component.name, component));

app.use(createPinia())
app.use(router)

app.mount('#app')
