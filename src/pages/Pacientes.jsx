import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Search, Plus, ChevronRight, Users, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { TERM } from '../config/negocio'

export default function Pacientes() {
  const { pacientes } = useApp()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')

  const filtradas = pacientes.filter(p => {
    const q = busqueda.toLowerCase()
    return (
      (p.nombre||'').toLowerCase().includes(q) ||
      (p.apellido||'').toLowerCase().includes(q) ||
      (p.cedula||'').toLowerCase().includes(q) ||
      (p.telefono && p.telefono.includes(q))
    )
  })

  return (
    <div className="min-h-screen">
      <PageHeader
        title={TERM.P}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate('/seguimiento')} className="glass-btn-icon w-10 h-10 flex items-center justify-center" title="Seguimiento">
              <UserCheck size={17} className="text-white/70" />
            </button>
            <button onClick={() => navigate('/pacientes/nueva')} className="glass-btn-icon w-10 h-10 flex items-center justify-center">
              <Plus size={19} className="text-white" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Buscador */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder={`Buscar ${TERM.s}...`}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="glass-input" style={{paddingLeft:'40px'}}
          />
        </div>

        {/* Lista */}
        {filtradas.length === 0 && busqueda === '' && (
          <div className="glass-card text-center py-14 mt-4">
            <Users size={36} className="text-white/25 mx-auto mb-3" />
            <p className="text-white/45 text-sm mb-4">No hay {TERM.p} registrad{TERM.o}s</p>
            <div className="flex justify-center">
              <button onClick={() => navigate('/pacientes/nueva')} className="glass-btn-primary" style={{width:'auto', padding:'10px 24px'}}>
                Registrar primer{TERM.o === 'a' ? 'a' : ''} {TERM.s}
              </button>
            </div>
          </div>
        )}

        {filtradas.length === 0 && busqueda !== '' && (
          <div className="text-center py-12">
            <p className="text-white/35 text-sm">Sin resultados para "{busqueda}"</p>
          </div>
        )}

        {filtradas.map(p => (
          <button
            key={p.id}
            onClick={() => navigate(`/pacientes/${p.id}`)}
            className="w-full glass-card flex items-center gap-3 active:bg-white/15 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0"
                 style={{boxShadow:'inset 0 1px 0 rgba(255,255,255,0.30)'}}>
              <span className="text-white font-bold text-sm">{(p.nombre||' ')[0]}{(p.apellido||' ')[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{p.nombre} {p.apellido}</p>
              <p className="text-white/50 text-sm">{p.cedula}</p>
              {p.telefono && <p className="text-white/35 text-xs">{p.telefono}</p>}
            </div>
            <ChevronRight size={17} className="text-white/25 flex-shrink-0" />
          </button>
        ))}

        {filtradas.length > 0 && (
          <p className="text-center text-white/25 text-xs py-1">
            {filtradas.length} {filtradas.length === 1 ? TERM.s : TERM.p}
          </p>
        )}
      </div>
    </div>
  )
}
