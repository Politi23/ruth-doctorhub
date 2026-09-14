import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext()

// PostgREST avisa con PGRST205 (o 42P01) cuando la tabla no existe todavía.
// Se distingue de un error real de conexión o de permisos, que sí debe fallar:
// un módulo opcional sin su tabla no puede tumbar la app entera.
const faltaLaTabla = (error) =>
  !!error && (error.code === 'PGRST205' || error.code === '42P01' ||
              /Could not find the table/i.test(error.message || ''))

export function AppProvider({ children }) {
  const [pacientes, setPacientes] = useState([])
  const [ingresos,  setIngresos]  = useState([])
  const [citas,     setCitas]     = useState([])
  const [egresos,   setEgresos]   = useState([])
  const [historiales, setHistoriales] = useState([])
  const [medidas,     setMedidas]     = useState([])
  const [informes,    setInformes]    = useState([])
  // Módulos opcionales cuya tabla todavía no está creada en la base.
  const [modulosListos, setModulosListos] = useState({ historial: true, informes: true })
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // ── Carga inicial ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function cargarDatos() {
      // Solo cargar si hay sesión activa (BUG-30)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || cancelled) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const [resPacientes, resIngresos, resCitas, resEgresos,
               resHistoriales, resMedidas, resInformes] = await Promise.all([
          supabase.from('pacientes').select('*').order('created_at', { ascending: false }).limit(5000),
          supabase.from('ingresos').select('*').order('created_at',  { ascending: false }).limit(5000),
          supabase.from('citas').select('*').order('created_at',     { ascending: false }).limit(5000),
          supabase.from('egresos').select('*').order('created_at',   { ascending: false }).limit(5000),
          supabase.from('historiales').select('*').order('created_at', { ascending: false }).limit(5000),
          supabase.from('medidas').select('*').order('fecha',          { ascending: false }).limit(20000),
          supabase.from('informes').select('*').order('created_at',    { ascending: false }).limit(5000),
        ])

        if (cancelled) return

        if (resPacientes.error) throw resPacientes.error
        if (resIngresos.error)  throw resIngresos.error
        if (resCitas.error)     throw resCitas.error
        if (resEgresos.error)   throw resEgresos.error

        // El historial y los informes son módulos opcionales: si su tabla no
        // existe, se cargan vacíos y su entrada queda oculta. Cualquier otro
        // error sí se reporta, para no esconder fallas reales.
        for (const r of [resHistoriales, resMedidas, resInformes])
          if (r.error && !faltaLaTabla(r.error)) throw r.error

        const sinHistorial = faltaLaTabla(resHistoriales.error) || faltaLaTabla(resMedidas.error)
        const sinInformes  = faltaLaTabla(resInformes.error)
        if (sinHistorial) console.warn('[DoctorHub] Faltan las tablas del historial médico: el módulo queda oculto hasta correr su SQL.')
        if (sinInformes)  console.warn('[DoctorHub] Falta la tabla "informes": el módulo queda oculto hasta correr su SQL.')

        setPacientes(resPacientes.data || [])
        setIngresos(resIngresos.data   || [])
        setCitas(resCitas.data         || [])
        setEgresos(resEgresos.data     || [])
        setHistoriales(resHistoriales.data || [])
        setMedidas(resMedidas.data         || [])
        setInformes(resInformes.data       || [])
        setModulosListos({ historial: !sinHistorial, informes: !sinInformes })
      } catch (err) {
        if (!cancelled) {
          console.error('[Supabase] Error al cargar datos:', err.message)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    cargarDatos()

    // Recargar datos al autenticarse, limpiar al cerrar sesión (BUG-30)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setLoading(true)
        setError(null)
        cargarDatos()
      } else if (event === 'SIGNED_OUT') {
        setPacientes([])
        setIngresos([])
        setCitas([])
        setEgresos([])
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // ── Pacientes ──────────────────────────────────────────────
  const agregarPaciente = async (datos) => {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setPacientes(prev => [data, ...prev])
    return data
  }

  const actualizarPaciente = async (id, datos) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPacientes(prev => prev.map(p => p.id === id ? data : p))
  }

  const eliminarPaciente = async (id) => {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id)
    if (error) throw error
    setPacientes(prev => prev.filter(p => p.id !== id))
    setIngresos(prev  => prev.filter(i => i.paciente_id !== id))
    setCitas(prev     => prev.filter(c => c.paciente_id !== id))
    setHistoriales(prev => prev.filter(h => h.paciente_id !== id))
    setMedidas(prev     => prev.filter(m => m.paciente_id !== id))
    setInformes(prev    => prev.filter(r => r.paciente_id !== id))
  }

  // ── Ingresos ───────────────────────────────────────────────
  const agregarIngreso = async (datos) => {
    const { data, error } = await supabase
      .from('ingresos')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setIngresos(prev => [data, ...prev])
    return data
  }

  const actualizarIngreso = async (id, datos) => {
    const { data, error } = await supabase
      .from('ingresos')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setIngresos(prev => prev.map(i => i.id === id ? data : i))
  }

  const eliminarIngreso = async (id) => {
    const { error } = await supabase
      .from('ingresos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setIngresos(prev => prev.filter(i => i.id !== id))
  }

  // ── Citas ──────────────────────────────────────────────────
  const agregarCita = async (datos) => {
    const { data, error } = await supabase
      .from('citas')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setCitas(prev => [data, ...prev])
    return data
  }

  const actualizarCita = async (id, datos) => {
    const { data, error } = await supabase
      .from('citas')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setCitas(prev => prev.map(c => c.id === id ? data : c))
  }

  const eliminarCita = async (id) => {
    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', id)
    if (error) throw error
    setCitas(prev => prev.filter(c => c.id !== id))
  }

  // ── Egresos ────────────────────────────────────────────────
  const agregarEgreso = async (datos) => {
    const { data, error } = await supabase
      .from('egresos')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setEgresos(prev => [data, ...prev])
    return data
  }

  const actualizarEgreso = async (id, datos) => {
    const { data, error } = await supabase
      .from('egresos')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setEgresos(prev => prev.map(e => e.id === id ? data : e))
  }

  const eliminarEgreso = async (id) => {
    const { error } = await supabase
      .from('egresos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setEgresos(prev => prev.filter(e => e.id !== id))
  }

  // ── Módulo médico ──────────────────────────────────────────
  // El historial es uno solo por paciente: se crea o se actualiza.
  const guardarHistorial = async (pacienteId, datos) => {
    const existente = historiales.find(h => h.paciente_id === pacienteId)
    if (existente) {
      const { data, error } = await supabase
        .from('historiales')
        .update(datos)
        .eq('id', existente.id)
        .select()
        .single()
      if (error) throw error
      setHistoriales(prev => prev.map(h => h.id === existente.id ? data : h))
      return data
    }
    const { data, error } = await supabase
      .from('historiales')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setHistoriales(prev => [data, ...prev])
    return data
  }

  const agregarMedida = async (datos) => {
    const { data, error } = await supabase
      .from('medidas')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setMedidas(prev => [data, ...prev])
    return data
  }

  const eliminarMedida = async (id) => {
    const { error } = await supabase.from('medidas').delete().eq('id', id)
    if (error) throw error
    setMedidas(prev => prev.filter(m => m.id !== id))
  }

  const agregarInforme = async (datos) => {
    const { data, error } = await supabase
      .from('informes')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setInformes(prev => [data, ...prev])
    return data
  }

  const eliminarInforme = async (id) => {
    const { error } = await supabase.from('informes').delete().eq('id', id)
    if (error) throw error
    setInformes(prev => prev.filter(r => r.id !== id))
  }

  return (
    <AppContext.Provider value={{
      pacientes, ingresos, citas, egresos,
      historiales, medidas, informes, modulosListos,
      loading, error,
      agregarPaciente, actualizarPaciente, eliminarPaciente,
      agregarIngreso, actualizarIngreso, eliminarIngreso,
      agregarCita, actualizarCita, eliminarCita,
      agregarEgreso, actualizarEgreso, eliminarEgreso,
      guardarHistorial, agregarMedida, eliminarMedida,
      agregarInforme, eliminarInforme,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
