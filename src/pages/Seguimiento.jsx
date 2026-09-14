import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { UserCheck, MessageCircle, CalendarPlus, Clock, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { hoyVE } from '../lib/fecha'
import { NEGOCIO, TERM } from '../config/negocio'

const OPCIONES = [
  { meses: 3,  label: '3 meses' },
  { meses: 6,  label: '6 meses' },
  { meses: 12, label: '1 año' },
]

function mesesDiff(fechaStr, hoyStr) {
  const [ay, am, ad] = hoyStr.split('-').map(Number)
  const [by, bm, bd] = fechaStr.split('-').map(Number)
  return (ay - by) * 12 + (am - bm)
}

function labelTiempo(fechaStr, hoyStr) {
  const dias = Math.floor((new Date(hoyStr) - new Date(fechaStr)) / 86400000)
  if (dias < 30)  return `${dias} días`
  const m = Math.floor(dias / 30)
  if (m < 12) return `${m} ${m === 1 ? 'mes' : 'meses'}`
  const a = Math.floor(m / 12)
  return `${a} ${a === 1 ? 'año' : 'años'}`
}

export default function Seguimiento() {
  const { pacientes, citas } = useApp()
  const navigate = useNavigate()
  const [meses, setMeses] = useState(6)

  const hoyStr = hoyVE()
  const [hy, hm, hd] = hoyStr.split('-').map(Number)
  const limD = new Date(hy, hm - 1 - meses, hd)
  const limiteStr = `${limD.getFullYear()}-${String(limD.getMonth()+1).padStart(2,'0')}-${String(limD.getDate()).padStart(2,'0')}`

  const perdidas = pacientes
    .map(p => {
      const citasPac = citas
        .filter(c => c.paciente_id === p.id && c.estado !== 'cancelada')
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
      const ultima = citasPac[0] || null
      return { p, ultima }
    })
    .filter(({ ultima }) => !ultima || ultima.fecha <= limiteStr)
    .sort((a, b) => {
      if (!a.ultima && !b.ultima) return 0
      if (!a.ultima) return -1
      if (!b.ultima) return 1
      return a.ultima.fecha.localeCompare(b.ultima.fecha)
    })

  const abrirWhatsApp = (tel, nombre) => {
    const num = tel.replace(/\D/g, '').replace(/^0/, '58')
    const msg = encodeURIComponent(NEGOCIO.msgSeguimiento(nombre))
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Seguimiento" back />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Filtro */}
        <div className="glass-card space-y-2">
          <p className="text-white/50 text-xs font-semibold">{TERM.P} sin cita en más de...</p>
          <div className="grid grid-cols-3 gap-2">
            {OPCIONES.map(({ meses: m, label }) => (
              <button key={m} onClick={() => setMeses(m)}
                      className="py-2.5 rounded-2xl text-sm font-semibold transition-all"
                      style={{
                        background: meses === m ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: meses === m ? 'white' : 'rgba(255,255,255,0.40)'
                      }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {perdidas.length === 0 ? (
          <div className="glass-card text-center py-12">
            <UserCheck size={32} className="text-emerald-400/50 mx-auto mb-3" />
            <p className="text-white/60 font-semibold">¡Tod{TERM.o}s al día!</p>
            <p className="text-white/30 text-sm mt-1">No hay {TERM.p} sin cita en los últimos {meses === 12 ? '12 meses' : `${meses} meses`}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-white/40 text-xs px-1">{perdidas.length} {perdidas.length === 1 ? TERM.s : TERM.p} sin cita reciente</p>
            {perdidas.map(({ p, ultima }) => (
              <div key={p.id} className="glass-card space-y-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/pacientes/${p.id}`)}
                          className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{p.nombre[0]}{p.apellido[0]}</span>
                  </button>
                  <button onClick={() => navigate(`/pacientes/${p.id}`)} className="flex-1 min-w-0 text-left">
                    <p className="text-white font-semibold truncate">{p.nombre} {p.apellido}</p>
                    {ultima ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-amber-400/70" />
                        <p className="text-amber-300/80 text-xs">
                          Última cita hace {labelTiempo(ultima.fecha, hoyStr)} · {ultima.motivo}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertCircle size={11} className="text-red-400/70" />
                        <p className="text-red-300/70 text-xs">Sin citas registradas</p>
                      </div>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {p.telefono ? (
                    <button onClick={() => abrirWhatsApp(p.telefono, p.nombre)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold"
                            style={{background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.25)', color:'#6ee7b7'}}>
                      <MessageCircle size={13} />
                      WhatsApp
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold"
                         style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.25)'}}>
                      Sin teléfono
                    </div>
                  )}
                  <button onClick={() => navigate(`/citas/nueva?paciente=${p.id}`)}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold"
                          style={{background:'rgba(139,92,246,0.20)', border:'1px solid rgba(139,92,246,0.35)', color:'#c4b5fd'}}>
                    <CalendarPlus size={13} />
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
