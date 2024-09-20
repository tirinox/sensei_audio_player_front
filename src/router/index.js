import {createRouter, createWebHistory} from 'vue-router'
import ListAudioView from '../views/ListAudioView.vue'
import PlayerView from '../views/PlayerView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/playlist'
        },
        {
            path: '/playlist',
            name: 'playlist',
            component: ListAudioView
        },
        {
            path: '/player',
            name: 'player',
            component: PlayerView
        }
    ]
})

export default router
