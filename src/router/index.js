import {createRouter, createWebHistory} from 'vue-router'
import ListAudioView from '../views/ListAudioView.vue'
import PlayerView from '../views/PlayerView.vue'
import LoginView from '../views/LoginView.vue'
import {useAccess} from "@/stores/userProtection.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '',
            name: 'login',
            component: LoginView
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

// Redirect to loading page if data isn't loaded yet
router.beforeEach((to, from, next) => {
    const accessStore = useAccess()

    if (accessStore.isLoading && to.name !== 'login') {
        next({name: 'login'})
    } else {
        next()
    }
})

export default router
