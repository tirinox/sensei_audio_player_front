import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            manifest: {
                name: 'Japanese Player',
                short_name: 'JapPlayer',
                description: 'A simple phrase player for learning Japanese',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                orientation: 'portrait'
            },
            registerType: 'autoUpdate',
            workbox: {
                clientsClaim: true,
                skipWaiting: true
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
