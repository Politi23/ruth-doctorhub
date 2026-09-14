import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useBcv } from '../hooks/useBcv'
import { useToast } from '../context/ToastContext'
import { Save, Search, Plus, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { hoyVE } from '../lib/fecha'
import { NEGOCIO, TERM } from '../config/negocio'

const CONCEPTOS = NEGOCIO.conceptosIngreso
const METODOS   = ['Efectivo USD','Efectivo Bs','Transferencia bancaria','Zelle','PayPal','Pago Móvil','Binance / Cripto','Otro']

const METODOS_BS  = ['Efectivo Bs', 'Transferencia bancaria', 'Pago Móvil']
const METODOS_USD = ['Efectivo USD', 'Zelle', 'PayPal', 'Binance / Cripto']

export default function NuevoIngreso() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id: editId } = useParams()
  const { pacientes, ingresos, agregarIngreso, actualizarIngreso } = useApp()
  const { data: bcv } = useBcv()
  const pacienteParam = searchParams.get('paciente') || ''

  const esEdicion = !!editId
  const ingresoExistente = esEdicion ? ingresos.find(i => i.id === editId) : null
  const toast = useToast()

  const [form, setForm] = useState({
    paciente_id: '', paciente_nombre: '',
    fecha: hoyVE(),
    conceptos: [], concepto_custom: '',
    monto: '', moneda: 'USD',
    metodo_pago: 'Efectivo USD', notas: ''
  })
  const [busqueda, setBusqueda] = useState('')
  const [mostrarBuscador, setMostrarBuscador] = useState(!pacienteParam && !esEdicion)
  const [errores, setErrores] = useState({})
  const [bsPersonalizado, setBsPersonalizado] = useState(false)
  const [montoBsCustom, setMontoBsCustom] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Segundo método de pago
  const [pago2Activo, setPago2Activo] = useState(false)
  const [pago2, setPago2] = useState({ metodo: 'Pago Móvil', monto: '', moneda: 'USD' })
  const [bs2Personalizado, setBs2Personalizado] = useState(false)
  const [montoBs2Custom, setMontoBs2Custom] = useState('')

  // Pre-fill si es edición
  useEffect(() => {
    if (esEdicion && ingresoExistente) {
      const partes = ingresoExistente.concepto ? ingresoExistente.concepto.split(' + ') : []
      const enLista = partes.filter(p => CONCEPTOS.includes(p))
      const custom  = partes.filter(p => !CONCEPTOS.includes(p)).join(', ')
      setForm({
        paciente_id: ingresoExistente.paciente_id,
        paciente_nombre: ingresoExistente.paciente_nombre,
        fecha: ingresoExistente.fecha,
        conceptos: enLista.length ? (custom ? [...enLista, 'Otro'] : enLista) : ['Otro'],
        concepto_custom: custom,
        monto: String(ingresoExistente.monto),
        moneda: ingresoExistente.moneda,
        metodo_pago: ingresoExistente.metodo_pago,
        notas: ingresoExistente.notas || ''
      })
      if (ingresoExistente.moneda !== 'Bs' && METODOS_BS.includes(ingresoExistente.metodo_pago) && ingresoExistente.tasa_bcv) {
        const montoBsGuardado = (Number(ingresoExistente.monto) * ingresoExistente.tasa_bcv).toFixed(2)
        setBsPersonalizado(true)
        setMontoBsCustom(montoBsGuardado)
      }
      setMostrarBuscador(false)
    }
  }, [esEdicion, ingresoExistente])

  // Pre-fill por query param
  useEffect(() => {
    if (!esEdicion && pacienteParam) {
      const p = pacientes.find(p => p.id === pacienteParam)
      if (p) { setForm(prev => ({ ...prev, paciente_id: p.id, paciente_nombre: `${p.nombre} ${p.apellido}` })); setMostrarBuscador(false) }
    }
  }, [pacienteParam, pacientes, esEdicion])

  const set = (c, v) => { setForm(prev => ({ ...prev, [c]: v })); if (errores[c]) setErrores(prev => ({ ...prev, [c]: '' })) }

  const setMetodo = (metodo) => {
    let moneda = form.moneda
    if (METODOS_USD.includes(metodo)) moneda = 'USD'
    setBsPersonalizado(false)
    setMontoBsCustom('')
    setForm(prev => ({ ...prev, metodo_pago: metodo, moneda }))
  }

  const setMoneda = (moneda) => {
    setBsPersonalizado(false)
    setMontoBsCustom('')
    setForm(prev => ({ ...prev, moneda }))
  }

  const setMetodo2 = (metodo) => {
    let moneda = pago2.moneda
    if (METODOS_USD.includes(metodo)) moneda = 'USD'
    setBs2Personalizado(false)
    setMontoBs2Custom('')
    setPago2(prev => ({ ...prev, metodo, moneda }))
  }

  const setMoneda2 = (moneda) => {
    setBs2Personalizado(false)
    setMontoBs2Custom('')
    setPago2(prev => ({ ...prev, moneda }))
  }

  const activarPago2 = () => {
    setPago2Activo(true)
    setPago2({ metodo: 'Pago Móvil', monto: '', moneda: 'USD' })
    setBs2Personalizado(false)
    setMontoBs2Custom('')
  }

  const desactivarPago2 = () => {
    setPago2Activo(false)
    setBs2Personalizado(false)
    setMontoBs2Custom('')
  }

  const seleccionar = (p) => { setForm(prev => ({ ...prev, paciente_id: p.id, paciente_nombre: `${p.nombre} ${p.apellido}` })); setMostrarBuscador(false); setBusqueda('') }
  const recientes = pacientes.slice(0, 5)
  const filtrados = busqueda.trim()
    ? pacientes.filter(p => { const q = busqueda.toLowerCase(); return p.nombre.toLowerCase().includes(q) || p.apellido.toLowerCase().includes(q) || (p.cedula||'').includes(q) }).slice(0, 8)
    : recientes

  const tasaEur = bcv?.eur ?? null
  const monto1 = Number(form.monto)
  const monto2 = Number(pago2.monto)
  const esBs = form.moneda === 'Bs'
  const esBs2 = pago2.moneda === 'Bs'
  const metodoBs = METODOS_BS.includes(form.metodo_pago)
  const metodoBs2 = METODOS_BS.includes(pago2.metodo)
  const soloUsd = METODOS_USD.includes(form.metodo_pago)
  const soloUsd2 = METODOS_USD.includes(pago2.metodo)
  const mostrarConvBs = !esBs && metodoBs && monto1 > 0
  const mostrarConvBs2 = pago2Activo && !esBs2 && metodoBs2 && monto2 > 0
  const montoBsAuto = tasaEur ? (monto1 * tasaEur).toFixed(2) : null
  const montoBs2Auto = tasaEur ? (monto2 * tasaEur).toFixed(2) : null
  const montoBsMostrar = bsPersonalizado ? montoBsCustom : montoBsAuto
  const montoBs2Mostrar = bs2Personalizado ? montoBs2Custom : montoBs2Auto
  const montoEur = esBs && tasaEur && monto1 > 0 ? (monto1 / tasaEur).toFixed(2) : null

  const monto1EnUSD = esBs && tasaEur ? monto1 / tasaEur : monto1
  const monto2EnUSD = pago2Activo && esBs2 && tasaEur ? monto2 / tasaEur : monto2
  const totalUSD = pago2Activo ? (monto1EnUSD + monto2EnUSD).toFixed(2) : null

  const toggleConcepto = (c) => {
    setForm(prev => {
      const ya = prev.conceptos.includes(c)
      const next = ya ? prev.conceptos.filter(x => x !== c) : [...prev.conceptos, c]
      return { ...prev, conceptos: next }
    })
  }

  const guardar = async () => {
    const e = {}
    if (!form.paciente_id) e.paciente_id = `Selecciona ${TERM.un} ${TERM.s}`
    if (!form.monto || monto1 <= 0) e.monto = 'Monto inválido'
    if (pago2Activo && (!pago2.monto || monto2 <= 0)) e.monto2 = 'Monto del segundo método inválido'
    setErrores(e)
    if (Object.keys(e).length) return

    const partes = form.conceptos.length
      ? form.conceptos.map(c => c === 'Otro' ? (form.concepto_custom.trim() || 'Otro') : c)
      : ['Sin especificar']
    const concepto = partes.join(' + ')

    // Construye una línea de ingreso con la moneda correcta según el método:
    // un método en Bs (Pago Móvil, transferencia, efectivo Bs) con monto en USD
    // se registra convertido a Bs; los métodos en divisas quedan en USD.
    const construirLinea = (metodo, montoNum, monedaSel, bsPers, bsCustom) => {
      const esMetodoBs = METODOS_BS.includes(metodo)
      if (esMetodoBs && monedaSel === 'USD' && tasaEur) {
        return {
          monto: bsPers && Number(bsCustom) > 0 ? Number(bsCustom) : montoNum * tasaEur,
          moneda: 'Bs', metodo_pago: metodo, tasa_bcv: tasaEur,
        }
      }
      if (monedaSel === 'Bs') {
        return { monto: montoNum, moneda: 'Bs', metodo_pago: metodo, tasa_bcv: tasaEur || null }
      }
      return { monto: montoNum, moneda: 'USD', metodo_pago: metodo, tasa_bcv: null }
    }

    const base = {
      paciente_id: form.paciente_id, paciente_nombre: form.paciente_nombre,
      fecha: form.fecha, concepto, notas: form.notas.trim(),
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        const linea = construirLinea(form.metodo_pago, monto1, form.moneda, bsPersonalizado, montoBsCustom)
        await actualizarIngreso(editId, { ...base, ...linea })
        toast('Ingreso actualizado', 'success')
        navigate(-1)
      } else if (pago2Activo) {
        // Dos métodos → dos ingresos separados, cada uno en su moneda real
        const l1 = construirLinea(form.metodo_pago, monto1, form.moneda, bsPersonalizado, montoBsCustom)
        const l2 = construirLinea(pago2.metodo, monto2, pago2.moneda, bs2Personalizado, montoBs2Custom)
        await agregarIngreso({ ...base, ...l1 })
        await agregarIngreso({ ...base, ...l2 })
        toast('Ingreso registrado (2 métodos)', 'success')
        pacienteParam ? navigate(`/pacientes/${pacienteParam}`) : navigate('/ingresos')
      } else {
        const linea = construirLinea(form.metodo_pago, monto1, form.moneda, bsPersonalizado, montoBsCustom)
        await agregarIngreso({ ...base, ...linea })
        toast('Ingreso registrado', 'success')
        pacienteParam ? navigate(`/pacientes/${pacienteParam}`) : navigate('/ingresos')
      }
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader title={esEdicion ? 'Editar Ingreso' : 'Nuevo Ingreso'} back />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Paciente */}
        <div className="glass-card space-y-3">
          <label className="glass-label">{TERM.S} *</label>
          {form.paciente_id && !mostrarBuscador ? (
            <div className="flex items-center justify-between rounded-2xl px-3 py-3"
                 style={{background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)'}}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{form.paciente_nombre.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                </div>
                <span className="text-white text-sm font-semibold">{form.paciente_nombre}</span>
              </div>
              {!esEdicion && <button onClick={() => { setMostrarBuscador(true); set('paciente_id',''); set('paciente_nombre','') }} className="text-white/45 text-xs">Cambiar</button>}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input className="glass-input" style={{paddingLeft:'40px'}} placeholder={`Buscar ${TERM.s}...`} value={busqueda} onChange={e => setBusqueda(e.target.value)} autoFocus />
              </div>
              {!busqueda.trim() && recientes.length > 0 && <p className="text-white/30 text-xs px-1">Recientes</p>}
              {filtrados.length > 0 && (
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {filtrados.map(p => (
                    <button key={p.id} onClick={() => seleccionar(p)} className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 active:bg-white/10 text-left" style={{background:'rgba(255,255,255,0.06)'}}>
                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">{p.nombre[0]}{p.apellido[0]}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{p.nombre} {p.apellido}</p>
                        <p className="text-white/40 text-xs">{p.cedula}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errores.paciente_id && <p className="text-red-400 text-xs">{errores.paciente_id}</p>}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="glass-card space-y-4">

          <div>
            <label className="glass-label">Fecha</label>
            <input type="date" className="glass-input" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </div>

          <div>
            <label className="glass-label">Concepto <span className="text-white/35 font-normal">(puedes elegir varios)</span></label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CONCEPTOS.map(c => {
                const activo = form.conceptos.includes(c)
                return (
                  <button key={c} type="button" onClick={() => toggleConcepto(c)}
                          className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                          style={{
                            background: activo ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${activo ? 'rgba(139,92,246,0.70)' : 'rgba(255,255,255,0.15)'}`,
                            color: activo ? 'white' : 'rgba(255,255,255,0.50)',
                          }}>
                    {c}
                  </button>
                )
              })}
            </div>
            {form.conceptos.includes('Otro') && (
              <input className="glass-input mt-2" placeholder="Especifica el concepto..." value={form.concepto_custom} onChange={e => set('concepto_custom', e.target.value)} maxLength={120} />
            )}
          </div>

          {/* Método de pago 1 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="glass-label">{pago2Activo ? 'Primer método de pago' : 'Método de pago'}</label>
            </div>
            <select className="glass-input" value={form.metodo_pago} onChange={e => setMetodo(e.target.value)}>
              {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Monto 1 */}
          <div>
            <label className="glass-label">{pago2Activo ? 'Monto — primer método *' : 'Monto *'}</label>
            <div className="flex gap-2">
              <div className="flex rounded-2xl overflow-hidden flex-shrink-0" style={{border:'1px solid rgba(255,255,255,0.20)'}}>
                {['USD','Bs'].map(m => {
                  const bloqueado = soloUsd && m === 'Bs'
                  return (
                    <button key={m} onClick={() => !bloqueado && setMoneda(m)}
                            className="px-4 py-3 text-sm font-bold transition-colors"
                            style={{
                              background: form.moneda === m ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                              color: bloqueado ? 'rgba(255,255,255,0.20)' : 'white',
                              cursor: bloqueado ? 'not-allowed' : 'pointer'
                            }}>
                      {m}
                    </button>
                  )
                })}
              </div>
              <input type="number" step="0.01" min="0" className={`glass-input flex-1${errores.monto ? ' error' : ''}`} placeholder="0.00" value={form.monto} onChange={e => set('monto', e.target.value)} />
            </div>
            {errores.monto && <p className="text-red-400 text-xs mt-1">{errores.monto}</p>}

            {mostrarConvBs && (
              <div className="mt-2 rounded-2xl px-3 py-2.5 space-y-2"
                   style={{background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.30)'}}>
                <div className="flex items-center justify-between">
                  <span className="text-violet-300/70 text-xs">Equivalente en Bs</span>
                  <button
                    type="button"
                    onClick={() => { setBsPersonalizado(v => !v); setMontoBsCustom(montoBsAuto || '') }}
                    className="text-xs font-semibold"
                    style={{color: bsPersonalizado ? 'rgba(167,139,250,1)' : 'rgba(255,255,255,0.40)'}}
                  >
                    {bsPersonalizado ? 'Usar BCV' : 'Personalizar'}
                  </button>
                </div>
                {bsPersonalizado ? (
                  <input
                    type="number" step="0.01" min="0"
                    className="glass-input"
                    placeholder="Monto en Bs exacto..."
                    value={montoBsCustom}
                    onChange={e => setMontoBsCustom(e.target.value)}
                  />
                ) : (
                  <div className="flex items-end justify-between">
                    {tasaEur ? (
                      <>
                        <p className="text-violet-200 text-sm font-bold">Bs {montoBsAuto}</p>
                        <p className="text-white/35 text-xs">Tasa EUR: {parseFloat(tasaEur.toFixed(4))}</p>
                      </>
                    ) : (
                      <p className="text-white/40 text-xs">Sin tasa disponible</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {esBs && monto1 > 0 && !pago2Activo && (
              <div className="mt-2 rounded-2xl px-3 py-2.5 flex items-center justify-between"
                   style={{background:'rgba(52,211,153,0.10)', border:'1px solid rgba(52,211,153,0.20)'}}>
                <span className="text-emerald-300/70 text-xs">Equivalente EUR</span>
                <div className="text-right">
                  {tasaEur ? (
                    <>
                      <p className="text-emerald-300 text-sm font-bold">€{montoEur}</p>
                      <p className="text-white/35 text-xs">Tasa BCV: Bs {parseFloat(tasaEur.toFixed(4))}</p>
                    </>
                  ) : (
                    <p className="text-white/40 text-xs">Sin tasa disponible</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Segundo método de pago */}
          {pago2Activo ? (
            <div className="space-y-3 rounded-2xl px-3 py-3" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)'}}>
              <div className="flex items-center justify-between">
                <label className="glass-label mb-0">Segundo método de pago</label>
                <button type="button" onClick={desactivarPago2} className="text-white/35 hover:text-white/60 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <select className="glass-input" value={pago2.metodo} onChange={e => setMetodo2(e.target.value)}>
                {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <div>
                <label className="glass-label">Monto — segundo método *</label>
                <div className="flex gap-2">
                  <div className="flex rounded-2xl overflow-hidden flex-shrink-0" style={{border:'1px solid rgba(255,255,255,0.20)'}}>
                    {['USD','Bs'].map(m => {
                      const bloqueado = soloUsd2 && m === 'Bs'
                      return (
                        <button key={m} onClick={() => !bloqueado && setMoneda2(m)}
                                className="px-4 py-3 text-sm font-bold transition-colors"
                                style={{
                                  background: pago2.moneda === m ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                                  color: bloqueado ? 'rgba(255,255,255,0.20)' : 'white',
                                  cursor: bloqueado ? 'not-allowed' : 'pointer'
                                }}>
                          {m}
                        </button>
                      )
                    })}
                  </div>
                  <input type="number" step="0.01" min="0" className={`glass-input flex-1${errores.monto2 ? ' error' : ''}`} placeholder="0.00" value={pago2.monto} onChange={e => { setPago2(prev => ({ ...prev, monto: e.target.value })); if (errores.monto2) setErrores(prev => ({ ...prev, monto2: '' })) }} />
                </div>
                {errores.monto2 && <p className="text-red-400 text-xs mt-1">{errores.monto2}</p>}

                {mostrarConvBs2 && (
                  <div className="mt-2 rounded-2xl px-3 py-2.5 space-y-2"
                       style={{background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.30)'}}>
                    <div className="flex items-center justify-between">
                      <span className="text-violet-300/70 text-xs">Equivalente en Bs</span>
                      <button
                        type="button"
                        onClick={() => { setBs2Personalizado(v => !v); setMontoBs2Custom(montoBs2Auto || '') }}
                        className="text-xs font-semibold"
                        style={{color: bs2Personalizado ? 'rgba(167,139,250,1)' : 'rgba(255,255,255,0.40)'}}
                      >
                        {bs2Personalizado ? 'Usar BCV' : 'Personalizar'}
                      </button>
                    </div>
                    {bs2Personalizado ? (
                      <input
                        type="number" step="0.01" min="0"
                        className="glass-input"
                        placeholder="Monto en Bs exacto..."
                        value={montoBs2Custom}
                        onChange={e => setMontoBs2Custom(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-end justify-between">
                        {tasaEur ? (
                          <>
                            <p className="text-violet-200 text-sm font-bold">Bs {montoBs2Auto}</p>
                            <p className="text-white/35 text-xs">Tasa EUR: {parseFloat(tasaEur.toFixed(4))}</p>
                          </>
                        ) : (
                          <p className="text-white/40 text-xs">Sin tasa disponible</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {monto1 > 0 && monto2 > 0 && (
                <div className="rounded-2xl px-3 py-2.5 flex items-center justify-between"
                     style={{background:'rgba(139,92,246,0.20)', border:'1px solid rgba(139,92,246,0.35)'}}>
                  <span className="text-violet-300/80 text-xs font-semibold">Total</span>
                  <span className="text-white font-bold text-sm">${totalUSD} USD</span>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={activarPago2}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-white/50 hover:text-white/75 transition-colors"
              style={{background:'rgba(255,255,255,0.05)', border:'1px dashed rgba(255,255,255,0.20)'}}
            >
              <Plus size={15} />
              Agregar segundo método de pago
            </button>
          )}

          <div>
            <label className="glass-label">Notas</label>
            <input className="glass-input" placeholder="Observaciones..." value={form.notas} onChange={e => set('notas', e.target.value)} maxLength={200} />
          </div>

        </div>

        <button onClick={guardar} disabled={guardando} className="glass-btn-primary" style={guardando ? {opacity:0.6} : {}}>
          <Save size={18} />
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar ingreso'}
        </button>
      </div>
    </div>
  )
}
