// Supabase de mentira, en memoria, para el modo demo (`npm run demo`).
// Permite entrar, navegar y guardar como si fuera real: los cambios viven
// mientras la pestaña esté abierta y se pierden al recargar.
// Este archivo NO entra en la app de producción: solo lo resuelve
// vite.demo.config.js, que reemplaza src/lib/supabase.js.

import { PACIENTES, HISTORIALES, MEDIDAS, INFORMES, RECIPES, CITAS, INGRESOS, EGRESOS } from './datos.js'

export const supabaseListo = true

const tablas = {
  pacientes:   [...PACIENTES],
  citas:       [...CITAS],
  ingresos:    [...INGRESOS],
  egresos:     [...EGRESOS],
  historiales: [...HISTORIALES],
  medidas:     [...MEDIDAS],
  informes:    [...INFORMES],
  recipes:     [...RECIPES],
}

const id = () => Math.random().toString(16).slice(2) + Date.now().toString(16)
const codigo = () => Math.random().toString(16).slice(2, 10).padEnd(8, '0')

// Constructor de consultas con lo mínimo que usa la app:
// .select().order().limit() para leer, y .insert()/.update()/.delete() con
// .eq() y .select().single() para escribir.
function consulta(nombre) {
  const estado = { filas: tablas[nombre] || [], operacion: 'select', datos: null, filtro: null }

  const resolver = () => {
    const t = tablas[nombre] || []
    if (estado.operacion === 'insert') {
      const nuevo = {
        id: id(),
        created_at: new Date().toISOString(),
        ...(('recipes informes'.includes(nombre)) ? { codigo: codigo() } : {}),
        ...estado.datos,
      }
      t.unshift(nuevo)
      return { data: nuevo, error: null }
    }
    if (estado.operacion === 'update') {
      const i = t.findIndex(f => f[estado.filtro.campo] === estado.filtro.valor)
      if (i < 0) return { data: null, error: { message: 'No encontrado' } }
      t[i] = { ...t[i], ...estado.datos }
      return { data: t[i], error: null }
    }
    if (estado.operacion === 'delete') {
      tablas[nombre] = t.filter(f => f[estado.filtro.campo] !== estado.filtro.valor)
      return { data: null, error: null }
    }
    let filas = t
    if (estado.filtro) filas = filas.filter(f => f[estado.filtro.campo] === estado.filtro.valor)
    return { data: filas, error: null }
  }

  const c = {
    select: () => c,
    order:  () => c,
    eq: (campo, valor) => { estado.filtro = { campo, valor }; return c },
    insert: (datos) => { estado.operacion = 'insert'; estado.datos = datos; return c },
    update: (datos) => { estado.operacion = 'update'; estado.datos = datos; return c },
    delete: () => { estado.operacion = 'delete'; return c },
    single: () => c,
    limit:  async () => resolver(),
    then:   (r) => Promise.resolve(resolver()).then(r),
  }
  return c
}

const SESION = { user: { id: 'demo', email: 'demo@doctorhub.app' } }
let escuchas = []

export const supabase = {
  from: consulta,

  // Verificación pública de documentos, igual que la función de la base real.
  rpc: async (fn, args) => {
    if (fn !== 'verificar_documento') return { data: [], error: null }
    const cod = String(args?.p_codigo || '').trim().toLowerCase()
    const enmascarar = (c) => !c || c.length < 7 ? c
      : c.slice(0, 3) + '*'.repeat(c.length - 6) + c.slice(-3)

    const r = tablas.recipes.find(x => x.codigo === cod)
    if (r) return { data: [{ tipo: 'recipe', datos: { ...r, paciente_cedula: enmascarar(r.paciente_cedula) } }], error: null }

    const i = tablas.informes.find(x => x.codigo === cod)
    if (i) {
      const p = tablas.pacientes.find(x => x.id === i.paciente_id) || {}
      return { data: [{ tipo: 'informe', datos: {
        ...i,
        paciente_nombre: `${p.nombre || ''} ${p.apellido || ''}`.trim(),
        paciente_cedula: enmascarar(p.cedula),
      } }], error: null }
    }
    return { data: [], error: null }
  },

  auth: {
    // En demo se entra con cualquier correo y contraseña.
    getSession: async () => ({ data: { session: SESION } }),
    onAuthStateChange: (cb) => {
      escuchas.push(cb)
      return { data: { subscription: { unsubscribe() { escuchas = escuchas.filter(x => x !== cb) } } } }
    },
    signInWithPassword: async () => { escuchas.forEach(cb => cb('SIGNED_IN', SESION)); return { error: null } },
    signOut: async () => { escuchas.forEach(cb => cb('SIGNED_OUT', null)) },
  },
}
