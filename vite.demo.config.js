import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NEGOCIO } from './src/config/negocio.js'
import { fileURLToPath } from 'node:url'

// Modo demo: la app con datos de ejemplo en memoria, sin Supabase.
//   npm run demo
// Solo sirve para probar y mostrar: no se usa para compilar producción.
const DEMO = fileURLToPath(new URL('./demo/supabase-demo.js', import.meta.url))

const placeholders = () => ({
  name: 'placeholders-html',
  transformIndexHtml: (html) => html
    .replace(/%APP_NOMBRE%/g, NEGOCIO.nombreApp)
    .replace(/%APP_DESCRIPCION%/g, NEGOCIO.descripcionApp)
    .replace(/%APP_COLOR%/g, NEGOCIO.colorTema),
})

export default defineConfig({
  plugins: [
    react(),
    placeholders(),
    {
      name: 'supabase-demo',
      enforce: 'pre',
      resolveId(id) { if (id.endsWith('lib/supabase')) return DEMO },
    },
  ],
  server: { port: 5180, open: true },
})
