import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Edit2, Trash2, DollarSign, Plus, Phone, Calendar, Clock, Copy, Check, MessageCircle, CalendarPlus, Stethoscope, FileText, Pill, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { hoyVE } from '../lib/fecha'
import { NEGOCIO, TERM } from '../config/negocio'

function formatFecha(isoStr) {
  if (!isoStr) return ''
  const [y, m, d] = isoStr.split('-')
  return `${d}/${m}/${y}`
}

function formatHora(hora) {
  if (!hora) return ''
  const [h, m] = hora.split(':')
  const hNum = parseInt(h)
  return `${hNum % 12 || 12}:${m} ${hNum >= 12 ? 'PM' : 'AM'}`
}

const ESTADO_CFG = {
  pendiente:    { label: 'Pendiente',    bg: 'rgba(255,255,255,0.12)',  color: 'rgba(255,255,255,0.55)' },
  atendida:     { label: 'Atendida',     bg: 'rgba(52,211,153,0.18)',   color: '#6ee7b7' },
  cancelada:    { label: 'Cancelada',    bg: 'rgba(239,68,68,0.18)',    color: '#fca5a5' },
  no_asistio:   { label: 'No asistió',   bg: 'rgba(251,146,60,0.18)',   color: '#fdba74' },
}

export default function DetallePaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pacientes, ingresos, citas, eliminarPaciente, eliminarIngreso, modulosListos } = useApp()
  const [confirmar, setConfirmar] = useState(false)
  const [confirmarIngreso, setConfirmarIngreso] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [tabActivo, setTabActivo] = useState('pagos') // 'pagos' | 'citas'
  const [copiado, setCopiado] = useState(false)

  const formatTel = (tel) => {
    if (!tel) return ''
    const d = tel.replace(/\D/g, '')
    return d.startsWith('0') && d.length === 11 ? `+58 ${d.slice(1, 4)}-${d.slice(4)}` : tel
  }

  const copiarTelefono = () => {
    if (!paciente?.telefono) return
    navigator.clipboard.writeText(paciente.telefono)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const paciente = pacientes.find(p => p.id === id)

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card text-center py-10">
          <p className="text-white/60 mb-4">{TERM.S} no encontrad{TERM.o}</p>
          <div className="flex justify-center">
            <button onClick={() => navigate('/pacientes')} className="glass-btn-primary" style={{width:'auto', padding:'10px 24px'}}>
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  const historial = ingresos
    .filter(i => i.paciente_id === id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const citasPaciente = citas
    .filter(c => c.paciente_id === id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || (b.hora||'').localeCompare(a.hora||''))

  const hoyStr = hoyVE()
  const proximaCita = citas
    .filter(c => c.paciente_id === id && c.fecha >= hoyStr && (c.estado === 'pendiente' || !c.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora||'').localeCompare(b.hora||''))
    [0] || null

  const totalUSD = historial.filter(i => i.moneda === 'USD').reduce((a, i) => a + Number(i.monto), 0)
  const totalBs  = historial.filter(i => i.moneda === 'Bs').reduce((a, i) => a + Number(i.monto), 0)

  return (
    <div className="min-h-screen">
      <PageHeader
        title={`${paciente.nombre} ${paciente.apellido}`}
        back
        action={
          <div className="flex gap-2 justify-end">
            <button onClick={() => navigate(`/pacientes/${id}/editar`)} className="glass-btn-icon w-10 h-10 flex items-center justify-center">
              <Edit2 size={17} className="text-white" />
            </button>
            <button onClick={() => setConfirmar(true)} className="glass-btn-icon danger w-10 h-10 flex items-center justify-center">
              <Trash2 size={17} className="text-red-300" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Perfil */}
        <div className="glass-card flex flex-col items-center gap-3 py-6">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center"
               style={{boxShadow:'inset 0 1px 0 rgba(255,255,255,0.40)'}}>
            <span className="text-white text-2xl font-bold">
              {(paciente.nombre||' ')[0]}{(paciente.apellido||' ')[0]}
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-white text-lg font-bold">{paciente.nombre} {paciente.apellido}</h2>
            <p className="text-white/50 text-sm">{paciente.cedula}</p>
            {paciente.telefono && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <a
                  href={`https://wa.me/${paciente.telefono.replace(/\D/g, '').replace(/^0/, '58')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <MessageCircle size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">WhatsApp</span>
                </a>
                <span className="text-white/20 text-xs">·</span>
                <a href={`tel:+58${paciente.telefono.replace(/\D/g, '').slice(1)}`} className="flex items-center gap-1.5">
                  <Phone size={13} className="text-violet-300" />
                  <span className="text-violet-300 text-sm font-medium">{formatTel(paciente.telefono)}</span>
                </a>
                <button onClick={copiarTelefono} className="text-white/30 active:text-white/70 transition-colors">
                  {copiado ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Próxima cita */}
        {proximaCita ? (
          <div className="glass-card flex items-center gap-3"
               style={{background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.30)'}}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{background:'rgba(139,92,246,0.20)', border:'1px solid rgba(139,92,246,0.35)'}}>
              <Calendar size={19} className="text-violet-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-violet-200 text-xs font-semibold mb-0.5">Próxima cita</p>
              <p className="text-white font-semibold truncate">{proximaCita.motivo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-white/55 text-xs">{formatFecha(proximaCita.fecha)}</span>
                {proximaCita.hora && (
                  <>
                    <span className="text-white/25 text-xs">·</span>
                    <span className="flex items-center gap-0.5 text-white/55 text-xs">
                      <Clock size={10} />
                      {formatHora(proximaCita.hora)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => navigate(`/citas/${proximaCita.id}/editar`)}
                    className="text-white/35 active:text-white/70 flex-shrink-0">
              <Edit2 size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => navigate(`/citas/nueva?paciente=${id}`)}
                  className="glass-card flex items-center gap-3 w-full text-left"
                  style={{border:'1px dashed rgba(139,92,246,0.30)'}}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{background:'rgba(139,92,246,0.10)'}}>
              <CalendarPlus size={19} className="text-violet-400/60" />
            </div>
            <div>
              <p className="text-white/40 text-sm font-semibold">Sin próxima cita</p>
              <p className="text-violet-400/60 text-xs">Toca para agendar</p>
            </div>
          </button>
        )}

        {/* Totales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card text-center py-4" style={{background:'rgba(52,211,153,0.10)', border:'1px solid rgba(52,211,153,0.20)'}}>
            <p className="text-xs text-emerald-300/70 mb-1">Total USD</p>
            <p className="text-xl font-bold text-emerald-300">${totalUSD.toFixed(2)}</p>
          </div>
          <div className="glass-card text-center py-4" style={{background:'rgba(125,211,252,0.10)', border:'1px solid rgba(125,211,252,0.20)'}}>
            <p className="text-xs text-sky-300/70 mb-1">Total Bs.</p>
            <p className="text-xl font-bold text-sky-300">{totalBs.toFixed(2)}</p>
          </div>
        </div>

        {/* Historial médico */}
        {NEGOCIO.modulos?.historial && modulosListos.historial && (
          <button onClick={() => navigate(`/pacientes/${id}/historial`)}
                  className="glass-card w-full flex items-center gap-3 text-left active:bg-white/10 transition-colors"
                  style={{background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.30)'}}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{background:'rgba(139,92,246,0.20)', border:'1px solid rgba(139,92,246,0.35)'}}>
              <Stethoscope size={19} className="text-violet-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Historial médico</p>
              <p className="text-white/45 text-xs">Antecedentes, peso y talla, curva de crecimiento</p>
            </div>
            <ChevronRight size={17} className="text-white/25 flex-shrink-0" />
          </button>
        )}

        {/* Informes médicos */}
        {NEGOCIO.modulos?.informes && modulosListos.informes && (
          <button onClick={() => navigate(`/pacientes/${id}/informes`)}
                  className="glass-card w-full flex items-center gap-3 text-left active:bg-white/10 transition-colors"
                  style={{background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.30)'}}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{background:'rgba(167,139,250,0.20)', border:'1px solid rgba(167,139,250,0.35)'}}>
              <FileText size={19} className="text-violet-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Informes médicos</p>
              <p className="text-white/45 text-xs">Redactar e imprimir informes con membrete</p>
            </div>
            <ChevronRight size={17} className="text-white/25 flex-shrink-0" />
          </button>
        )}

        {/* Récipes médicos */}
        {NEGOCIO.modulos?.recipes && modulosListos.recipes && (
          <button onClick={() => navigate(`/pacientes/${id}/recipes`)}
                  className="glass-card w-full flex items-center gap-3 text-left active:bg-white/10 transition-colors"
                  style={{background:'rgba(192,132,252,0.12)', border:'1px solid rgba(192,132,252,0.30)'}}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{background:'rgba(192,132,252,0.20)', border:'1px solid rgba(192,132,252,0.35)'}}>
              <Pill size={19} className="text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Récipes</p>
              <p className="text-white/45 text-xs">Emitir e imprimir récipes médicos</p>
            </div>
            <ChevronRight size={17} className="text-white/25 flex-shrink-0" />
          </button>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'pagos', label: `Pagos (${historial.length})` },
            { key: 'citas', label: `Citas (${citasPaciente.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTabActivo(t.key)}
                    className="py-2.5 rounded-2xl text-sm font-semibold transition-all"
                    style={{
                      background: tabActivo === t.key ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: tabActivo === t.key ? 'white' : 'rgba(255,255,255,0.40)'
                    }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Pagos */}
        {tabActivo === 'pagos' && (
          <div className="glass-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Historial de pagos</span>
              <button onClick={() => navigate(`/ingresos/nuevo?paciente=${id}`)} className="glass-btn-icon" style={{padding:'6px'}}>
                <Plus size={15} className="text-white" />
              </button>
            </div>
            {historial.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">Sin pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {historial.map(i => (
                  <div key={i.id} className="flex items-center gap-3 rounded-2xl px-3 py-3"
                       style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)'}}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{background:'rgba(52,211,153,0.15)'}}>
                      <DollarSign size={15} className="text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{i.concepto}</p>
                      <p className="text-white/40 text-xs">{formatFecha(i.fecha)} · {i.metodo_pago}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${i.moneda === 'USD' ? 'text-emerald-300' : 'text-sky-300'}`}>
                        {i.moneda === 'USD' ? '$' : 'Bs.'}{Number(i.monto).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3 justify-end mt-0.5">
                        <button onClick={() => navigate(`/ingresos/${i.id}/editar`)} className="text-white/35 active:text-white/70">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setConfirmarIngreso(i)} className="text-red-400/55 text-xs active:text-red-400">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Citas */}
        {tabActivo === 'citas' && (
          <div className="glass-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Historial de citas</span>
              <button onClick={() => navigate(`/citas/nueva?paciente=${id}`)} className="glass-btn-icon" style={{padding:'6px'}}>
                <Plus size={15} className="text-white" />
              </button>
            </div>
            {citasPaciente.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">Sin citas registradas</p>
            ) : (
              <div className="space-y-2">
                {citasPaciente.map(c => {
                  const cfg = ESTADO_CFG[c.estado || 'pendiente'] || ESTADO_CFG.pendiente
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-2xl px-3 py-3"
                         style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)'}}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{background:'rgba(167,139,250,0.15)'}}>
                        <Calendar size={15} className="text-violet-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{c.motivo}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-white/40 text-xs">{formatFecha(c.fecha)}</p>
                          {c.hora && (
                            <span className="flex items-center gap-0.5 text-white/35 text-xs">
                              <Clock size={10} />
                              {formatHora(c.hora)}
                            </span>
                          )}
                        </div>
                        {c.notas && <p className="text-white/30 text-xs italic truncate">{c.notas}</p>}
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-xl flex-shrink-0"
                            style={{background: cfg.bg, color: cfg.color}}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal eliminar ingreso */}
      {confirmarIngreso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{background:'rgba(0,0,0,0.65)'}}>
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-white font-bold text-lg text-center">¿Eliminar ingreso?</h3>
            <p className="text-white/60 text-sm text-center">
              {confirmarIngreso.concepto} ·{' '}
              <strong className="text-white">{confirmarIngreso.moneda === 'USD' ? '$' : 'Bs.'}{Number(confirmarIngreso.monto).toFixed(2)}</strong>.
              Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmarIngreso(null)} className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)'}}>
                Cancelar
              </button>
              <button
                disabled={eliminando}
                onClick={async () => {
                  setEliminando(true)
                  try { await eliminarIngreso(confirmarIngreso.id) } catch {}
                  setEliminando(false)
                  setConfirmarIngreso(null)
                }}
                className="py-3 rounded-2xl text-white font-semibold text-sm transition-opacity"
                style={{background:'rgba(239,68,68,0.55)', border:'1px solid rgba(239,68,68,0.50)', opacity: eliminando ? 0.6 : 1}}>
                {eliminando ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar paciente */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{background:'rgba(0,0,0,0.65)'}}>
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-white font-bold text-lg text-center">¿Eliminar {TERM.s}?</h3>
            <p className="text-white/60 text-sm text-center">
              Se eliminará a <strong className="text-white">{paciente.nombre} {paciente.apellido}</strong> y todo su historial. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmar(false)} className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)'}}>
                Cancelar
              </button>
              <button
                disabled={eliminando}
                onClick={async () => {
                  setEliminando(true)
                  try { await eliminarPaciente(id) } catch {}
                  navigate('/pacientes', { replace: true })
                }}
                className="py-3 rounded-2xl text-white font-semibold text-sm transition-opacity"
                style={{background:'rgba(239,68,68,0.55)', border:'1px solid rgba(239,68,68,0.50)', opacity: eliminando ? 0.6 : 1}}>
                {eliminando ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
