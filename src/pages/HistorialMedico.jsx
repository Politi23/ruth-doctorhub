import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, Plus, Trash2, Ruler } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CurvaCrecimiento from '../components/CurvaCrecimiento'
import { NEGOCIO } from '../config/negocio'
import { hoyVE } from '../lib/fecha'
import { edadTexto, calcularEdad, potencialGenetico, clasificarTalla } from '../lib/clinico'

const VACIO = {
  fecha_nacimiento: '', sexo: '',
  representante_nombre: '', representante_cedula: '', representante_telefono: '',
  motivo_consulta: '', antecedentes_personales: '', antecedentes_familiares: '',
  talla_padre: '', talla_madre: '', examen_fisico: '',
  examenes_laboratorio: '', tratamiento: '',
}

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function HistorialMedico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { pacientes, historiales, medidas, guardarHistorial, agregarMedida, eliminarMedida } = useApp()

  const paciente = pacientes.find(p => p.id === id)
  const historial = (historiales || []).find(h => h.paciente_id === id)
  const misMedidas = (medidas || [])
    .filter(m => m.paciente_id === id)
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))

  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [nueva, setNueva] = useState({ fecha: hoyVE(), peso: '', talla: '' })
  const [borrar, setBorrar] = useState(null)

  useEffect(() => {
    if (historial) setForm({ ...VACIO, ...historial })
  }, [historial])

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card text-center py-10">
          <p className="text-white/60 mb-4">Paciente no encontrado</p>
          <button onClick={() => navigate('/pacientes')} className="glass-btn-primary"
                  style={{ width: 'auto', padding: '10px 24px' }}>Volver</button>
        </div>
      </div>
    )
  }

  const set = (c, v) => setForm(prev => ({ ...prev, [c]: v }))

  // Potencial genético (talla diana): promedio de la talla de los padres ± 6,5 cm
  const pg = potencialGenetico(form.talla_padre, form.talla_madre, form.sexo)

  const ultima = misMedidas[0]
  const edadUltima = ultima && form.fecha_nacimiento
    ? calcularEdad(form.fecha_nacimiento, ultima.fecha)?.decimal
    : null
  const clasif = ultima && edadUltima != null && form.sexo
    ? clasificarTalla(ultima.talla, edadUltima, form.sexo)
    : null

  const guardar = async () => {
    setGuardando(true)
    try {
      await guardarHistorial(paciente.id, {
        paciente_id: paciente.id,
        fecha_nacimiento: form.fecha_nacimiento || null,
        sexo: form.sexo || null,
        representante_nombre: form.representante_nombre || null,
        representante_cedula: form.representante_cedula || null,
        representante_telefono: form.representante_telefono || null,
        motivo_consulta: form.motivo_consulta || null,
        antecedentes_personales: form.antecedentes_personales || null,
        antecedentes_familiares: form.antecedentes_familiares || null,
        talla_padre: form.talla_padre ? Number(form.talla_padre) : null,
        talla_madre: form.talla_madre ? Number(form.talla_madre) : null,
        examen_fisico: form.examen_fisico || null,
        examenes_laboratorio: form.examenes_laboratorio || null,
        tratamiento: form.tratamiento || null,
      })
      toast('Historial guardado', 'success')
    } catch {
      toast('No se pudo guardar el historial', 'error')
    }
    setGuardando(false)
  }

  const agregarToma = async () => {
    if (!nueva.peso && !nueva.talla) {
      toast('Escribe al menos el peso o la talla', 'error')
      return
    }
    try {
      await agregarMedida({
        paciente_id: paciente.id,
        fecha: nueva.fecha,
        peso: nueva.peso ? Number(nueva.peso) : null,
        talla: nueva.talla ? Number(nueva.talla) : null,
      })
      setNueva({ fecha: hoyVE(), peso: '', talla: '' })
      toast('Toma registrada', 'success')
    } catch {
      toast('No se pudo registrar la toma', 'error')
    }
  }

  const textos = [
    { c: 'motivo_consulta',         l: 'Motivo de consulta',      ph: 'Motivo por el que acude', filas: 3 },
    { c: 'antecedentes_personales', l: 'Antecedentes personales', ph: 'Embarazo, parto, enfermedades previas…', filas: 3 },
    { c: 'antecedentes_familiares', l: 'Antecedentes familiares', ph: 'Talla de los padres, enfermedades familiares…', filas: 3 },
    { c: 'examen_fisico',           l: 'Examen físico',           ph: 'Hallazgos al examen', filas: 4 },
    { c: 'examenes_laboratorio',    l: 'Exámenes de laboratorio', ph: 'Resultados de laboratorio', filas: 4 },
    { c: 'tratamiento',             l: 'Tratamiento',             ph: 'Tratamiento indicado', filas: 4 },
  ]

  return (
    <>
      <PageHeader title="Historial médico" back={`/pacientes/${id}`} />

      <div className="px-4 pb-28 space-y-4">

        <div className="glass-card">
          <p className="text-white font-semibold text-sm">
            {paciente.nombre} {paciente.apellido}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {[paciente.cedula, form.fecha_nacimiento && edadTexto(form.fecha_nacimiento)]
              .filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Datos del paciente */}
        <div className="glass-card space-y-4">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide">Datos del paciente</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="glass-label">Fecha de nacimiento</label>
              <input type="date" className="glass-input" value={form.fecha_nacimiento || ''}
                     onChange={e => set('fecha_nacimiento', e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Sexo</label>
              <select className="glass-input" value={form.sexo || ''} onChange={e => set('sexo', e.target.value)}>
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        {/* Representante */}
        <div className="glass-card space-y-4">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide">Representante</p>
          <div>
            <label className="glass-label">Nombre</label>
            <input className="glass-input" value={form.representante_nombre || ''}
                   onChange={e => set('representante_nombre', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="glass-label">Cédula</label>
              <input className="glass-input" placeholder="V-12345678" value={form.representante_cedula || ''}
                     onChange={e => set('representante_cedula', e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Teléfono</label>
              <input className="glass-input" placeholder="0414-1234567" inputMode="tel"
                     value={form.representante_telefono || ''}
                     onChange={e => set('representante_telefono', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Potencial genético */}
        <div className="glass-card space-y-4">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide">Potencial genético</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="glass-label">Talla del padre (cm)</label>
              <input className="glass-input" inputMode="decimal" placeholder="175"
                     value={form.talla_padre || ''} onChange={e => set('talla_padre', e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Talla de la madre (cm)</label>
              <input className="glass-input" inputMode="decimal" placeholder="162"
                     value={form.talla_madre || ''} onChange={e => set('talla_madre', e.target.value)} />
            </div>
          </div>
          {pg ? (
            <div className="rounded-2xl px-3 py-2.5"
                 style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.28)' }}>
              <p className="text-white/40 text-xs">Talla diana</p>
              <p className="text-violet-200 text-2xl font-bold">{pg.valor} cm</p>
              <p className="text-white/45 text-xs mt-0.5">Rango esperado: {pg.min} – {pg.max} cm</p>
            </div>
          ) : (
            <p className="text-white/30 text-xs">Se calcula con la talla de ambos padres y el sexo del paciente.</p>
          )}
        </div>

        {/* Peso y talla */}
        <div className="glass-card space-y-4">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide">Peso y talla</p>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="glass-label">Fecha</label>
              <input type="date" className="glass-input" value={nueva.fecha}
                     onChange={e => setNueva({ ...nueva, fecha: e.target.value })} />
            </div>
            <div>
              <label className="glass-label">Peso (kg)</label>
              <input className="glass-input" inputMode="decimal" placeholder="28.5" value={nueva.peso}
                     onChange={e => setNueva({ ...nueva, peso: e.target.value })} />
            </div>
            <div>
              <label className="glass-label">Talla (cm)</label>
              <input className="glass-input" inputMode="decimal" placeholder="132" value={nueva.talla}
                     onChange={e => setNueva({ ...nueva, talla: e.target.value })} />
            </div>
          </div>
          <button onClick={agregarToma}
                  className="glass-btn-primary w-full flex items-center justify-center gap-2">
            <Plus size={16} /> Registrar toma
          </button>

          {clasif && (
            <div className="rounded-2xl px-3 py-2.5"
                 style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${clasif.color}40` }}>
              <p className="text-white/45 text-xs">Última talla frente a la referencia</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: clasif.color }}>
                Talla para la edad: {clasif.texto}
              </p>
            </div>
          )}

          {misMedidas.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-3">Sin tomas registradas.</p>
          ) : (
            <div className="space-y-2">
              {misMedidas.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2"
                     style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Ruler size={13} className="text-violet-300 shrink-0" />
                    <span className="text-white text-sm">{formatFecha(m.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {m.peso != null && <span className="text-white/60 text-xs">{m.peso} kg</span>}
                    {m.talla != null && <span className="text-white/60 text-xs">{m.talla} cm</span>}
                    <button onClick={() => setBorrar(m)} className="text-red-400/55 active:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Curva de distancia para uso clínico · Talla */}
        {NEGOCIO.modulos?.curvaCrecimiento && form.sexo && form.fecha_nacimiento && (
          <CurvaCrecimiento sexo={form.sexo} fechaNacimiento={form.fecha_nacimiento} medidas={misMedidas} />
        )}

        {/* Texto clínico */}
        {textos.map(({ c, l, ph, filas }) => (
          <div key={c} className="glass-card">
            <label className="glass-label">{l}</label>
            <textarea className="glass-input" rows={filas} placeholder={ph}
                      value={form[c] || ''} onChange={e => set(c, e.target.value)}
                      style={{ resize: 'vertical', lineHeight: 1.5 }} />
          </div>
        ))}

        <button onClick={guardar} disabled={guardando}
                className="glass-btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar historial'}
        </button>
      </div>

      {/* Confirmar borrado de una toma */}
      {borrar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
             style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setBorrar(null)}>
          <div className="glass-card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold">¿Eliminar esta toma?</p>
            <p className="text-white/45 text-sm">
              Toma del {formatFecha(borrar.fecha)}. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setBorrar(null)}
                      className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>Cancelar</button>
              <button onClick={async () => { await eliminarMedida(borrar.id); setBorrar(null) }}
                      className="py-3 rounded-2xl text-white font-semibold text-sm"
                      style={{ background: 'rgba(239,68,68,0.8)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
