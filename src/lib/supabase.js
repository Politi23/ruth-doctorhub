import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sin credenciales, createClient lanza excepción al importarse y la app queda
// en blanco sin explicar nada. Se detecta antes y se muestra una pantalla que
// diga qué falta.
export const supabaseListo = Boolean(url && key)

const SIN_CONFIG = { message: 'Supabase no está configurado' }

const clienteVacio = {
  from: () => {
    const c = {
      select: () => c, order: () => c, eq: () => c, insert: () => c,
      update: () => c, delete: () => c, single: () => c,
      limit: async () => ({ data: [], error: SIN_CONFIG }),
      then: (r) => Promise.resolve({ data: [], error: SIN_CONFIG }).then(r),
    }
    return c
  },
  rpc: async () => ({ data: [], error: SIN_CONFIG }),
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: async () => ({ error: SIN_CONFIG }),
    signOut: async () => {},
  },
}

if (!supabaseListo) {
  console.error(
    'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.\n' +
    'Copia .env.example a .env y complétalas, o prueba la app con datos de ejemplo: npm run demo'
  )
}

export const supabase = supabaseListo ? createClient(url, key) : clienteVacio
