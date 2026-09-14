import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { NEGOCIO } from './src/config/negocio.js'

// Reemplaza los %PLACEHOLDERS% de index.html con los datos del negocio
const htmlNegocio = () => ({
  name: 'html-negocio',
  transformIndexHtml(html) {
    return html
      .replaceAll('%APP_NOMBRE%', NEGOCIO.nombreApp)
      .replaceAll('%APP_DESCRIPCION%', NEGOCIO.descripcionApp)
      .replaceAll('%APP_COLOR%', NEGOCIO.colorTema)
  },
})

export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-supa':   ['@supabase/supabase-js'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
  plugins: [
    react(),
    htmlNegocio(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: NEGOCIO.nombreApp,
        short_name: NEGOCIO.nombreApp,
        description: NEGOCIO.descripcionApp,
        theme_color: NEGOCIO.colorTema,
        background_color: NEGOCIO.colorFondo,
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,   // borra cachés viejos tras cada redeploy
        skipWaiting: true,             // el SW nuevo toma control de inmediato
        clientsClaim: true,
        navigateFallback: '/index.html',           // toda navegación resuelve al shell
        navigateFallbackDenylist: [/^\/api\//],    // menos las llamadas al API
      }
    })
  ]
})
