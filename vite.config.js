import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
            manifest: {
                name: 'Japanese Player',
                short_name: 'JapPlayer',
                description: 'A simple phrase player for learning Japanese',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/logo.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                "apple-mobile-web-app-capable": "yes",
                "apple-mobile-web-app-status-bar-style": "black-translucent"
            },
            workbox: {
                clientsClaim: true,
                skipWaiting: true
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
