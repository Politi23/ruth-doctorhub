import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, Printer, Trash2, X, FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { NEGOCIO } from '../config/negocio'
import { hoyVE } from '../lib/fecha'
import { edadTexto } from '../lib/clinico'
import { LOGO_MEMBRETE, membrete, estilosHoja, pieHoja } from '../lib/membrete'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fechaLarga(iso, lugar) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${lugar}, ${Number(d)} de ${MESES[Number(m) - 1]} del ${y}`
}

const escapar = (t) => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const parrafos = (texto) => String(texto || '')
  .split('\n').filter(l => l.trim())
  .map(l => `<p>${escapar(l)}</p>`).join('')

// ── Ficha patronímica ──
// Datos identificatorios del paciente, armados con lo que ya está cargado
// en su ficha y en su historial: no se vuelven a pedir.
function fichaPatronimica(paciente, historial) {
  const filas = [
    ['Nombre y apellido', `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim()],
  ]
  if (paciente.cedula) filas.push(['Cédula', paciente.cedula])
  if (historial?.fecha_nacimiento) {
    filas.push(['Fecha de nacimiento', formatFecha(historial.fecha_nacimiento)])
    filas.push(['Edad', edadTexto(historial.fecha_nacimiento)])
  }
  if (historial?.sexo) filas.push(['Sexo', historial.sexo === 'M' ? 'Masculino' : 'Femenino'])
  if (paciente.telefono) filas.push(['Teléfono', paciente.telefono])
  if (historial?.representante_nombre) {
    filas.push(['Representante', historial.representante_nombre])
    if (historial.representante_cedula) filas.push(['C.I. representante', historial.representante_cedula])
    if (historial.representante_telefono) filas.push(['Contacto representante', historial.representante_telefono])
  }
  return filas
}

const BLOQUES = [
  { campo: 'examen_fisico', titulo: 'EXAMEN FÍSICO:' },
  { campo: 'diagnostico',   titulo: 'DIAGNÓSTICO:', listado: true },
  { campo: 'tratamiento',   titulo: 'TRATAMIENTO:' },
  { campo: 'plan_trabajo',  titulo: 'PLAN DE TRABAJO:' },
]

// ── Informe en PDF, hoja A4 vertical con el membrete ──
async function imprimirInforme(informe, paciente, historial, opciones = {}) {
  const enBlanco = !!opciones.enBlanco
  // La ventana se abre YA, antes de cualquier await, o el navegador la bloquea.
  const w = window.open('', '_blank')
  const med = NEGOCIO.medico

  const ficha = enBlanco ? [] : fichaPatronimica(paciente, historial)

  const cabecera = enBlanco ? '' : `
    <p class="bloque-tit">FICHA PATRONÍMICA:</p>
    <table class="ficha">
      ${ficha.map(([k, v]) => `<tr><th>${escapar(k)}</th><td>: ${escapar(v)}</td></tr>`).join('')}
      <tr><th>Fecha de atención</th><td>: ${escapar(fechaLarga(informe.fecha, NEGOCIO.ciudad || 'Puerto Cabello'))}</td></tr>
    </table>
    <div class="regla-fina"></div>`

  const cuerpo = enBlanco ? '<div class="espacio-escritura"></div>' : BLOQUES.map(b => {
    const v = informe[b.campo]
    if (!v || !String(v).trim()) return ''
    const contenido = b.listado
      ? `<ul class="dx">${String(v).split('\n').filter(l => l.trim())
          .map(l => `<li>${escapar(l)}</li>`).join('')}</ul>`
      : `<div class="bloque-texto">${parrafos(v)}</div>`
    return `<p class="bloque-tit">${b.titulo}</p>${contenido}`
  }).join('')

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Informe médico${enBlanco ? '' : ' — ' + escapar(`${paciente.nombre || ''} ${paciente.apellido || ''}`.trim())}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
    .hoja { display: flex; flex-direction: column; min-height: 258mm; }
    ${estilosHoja}
    .titulo-hoja {
      text-align: center; font-size: 13pt; font-weight: bold; letter-spacing: .5px;
      text-decoration: underline; margin: 6mm 0 5mm;
    }
    table.ficha { border-collapse: collapse; width: 100%; font-size: 10pt; }
    table.ficha th { text-align: left; font-weight: bold; width: 52mm; padding: 0.6mm 0; vertical-align: top; }
    table.ficha td { padding: 0.6mm 0; }
    .regla-fina { border-top: 1px solid #333; margin: 3mm 0 4mm; }
    .bloque-tit { font-size: 10pt; font-weight: bold; margin: 4mm 0 1.5mm; }
    .bloque-texto p { margin: 0 0 1.5mm; font-size: 10pt; text-align: justify; line-height: 1.45; }
    ul.dx { margin: 0; padding: 0; list-style: none; }
    ul.dx li { font-size: 10pt; margin-bottom: 0.8mm; text-transform: uppercase; }
    .espacio-escritura { flex: 1; min-height: 150mm; }
    .cuerpo { flex: 1; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <div class="hoja">
    ${membrete(med, LOGO_MEMBRETE)}
    <p class="titulo-hoja">INFORME MÉDICO</p>
    <div class="cuerpo">
      ${cabecera}
      ${cuerpo}
    </div>
    ${pieHoja({ med, consultorio: NEGOCIO.consultorio, conSello: !enBlanco })}
  </div>
  <script>window.onload=()=>window.print()<\/script></body></html>`

  w.document.write(html)
  w.document.close()
}

export default function InformeMedico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { pacientes, historiales, informes, agregarInforme, eliminarInforme } = useApp()

  const paciente = pacientes.find(p => p.id === id)
  const historial = (historiales || []).find(h => h.paciente_id === id)
  const mios = (informes || [])
    .filter(r => r.paciente_id === id)
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))

  const [creando, setCreando]     = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [form, setForm] = useState(null)

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

  // Al abrir uno nuevo se traen el examen físico y el tratamiento que ya
  // estén en el historial, para no reescribirlos. Quedan editables.
  const abrirNuevo = () => {
    setForm({
      fecha: hoyVE(),
      examen_fisico: historial?.examen_fisico || '',
      diagnostico: '',
      tratamiento: historial?.tratamiento || '',
      plan_trabajo: '',
    })
    setCreando(true)
  }

  const set = (c, v) => setForm(prev => ({ ...prev, [c]: v }))

  const guardar = async () => {
    if (!form.diagnostico.trim()) {
      toast('Escribe al menos el diagnóstico', 'error')
      return
    }
    setGuardando(true)
    try {
      await agregarInforme({
        paciente_id: paciente.id,
        fecha: form.fecha,
        examen_fisico: form.examen_fisico || null,
        diagnostico: form.diagnostico || null,
        tratamiento: form.tratamiento || null,
        plan_trabajo: form.plan_trabajo || null,
      })
      toast('Informe guardado', 'success')
      setCreando(false)
      setForm(null)
    } catch {
      toast('No se pudo guardar el informe', 'error')
    }
    setGuardando(false)
  }

  const campos = [
    { c: 'examen_fisico', l: 'Examen físico',   ph: 'Hallazgos al examen',  filas: 4 },
    { c: 'diagnostico',   l: 'Diagnóstico',     ph: 'Uno por línea',        filas: 4 },
    { c: 'tratamiento',   l: 'Tratamiento',     ph: 'Tratamiento indicado', filas: 4 },
    { c: 'plan_trabajo',  l: 'Plan de trabajo', ph: 'Conducta y controles', filas: 3 },
  ]

  const ficha = fichaPatronimica(paciente, historial)

  return (
    <>
      <PageHeader title="Informes médicos" back={`/pacientes/${id}`} />

      <div className="px-4 pb-28 space-y-4">

        {/* Ficha patronímica: se arma sola, no se escribe */}
        <div className="glass-card space-y-2">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide">Ficha patronímica</p>
          {ficha.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3">
              <span className="text-white/35 text-xs shrink-0">{k}</span>
              <span className="text-white text-sm text-right min-w-0 break-words">{v}</span>
            </div>
          ))}
          {!historial && (
            <p className="text-white/30 text-xs pt-1">
              Complete el historial médico para que la ficha salga completa en el informe.
            </p>
          )}
        </div>

        {/* Acciones */}
        {!creando && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={abrirNuevo} className="glass-btn-primary flex items-center justify-center gap-2">
              <FileText size={15} /> Nuevo informe
            </button>
            <button onClick={() => imprimirInforme({}, paciente, historial, { enBlanco: true })}
                    className="glass-card flex items-center justify-center gap-2 text-white/70 text-sm font-semibold py-3">
              <Printer size={15} /> Hoja en blanco
            </button>
          </div>
        )}

        {/* Formulario */}
        {creando && form && (
          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Nuevo informe</p>
              <button onClick={() => { setCreando(false); setForm(null) }} className="text-white/40">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="glass-label">Fecha</label>
              <input type="date" className="glass-input" value={form.fecha}
                     onChange={e => set('fecha', e.target.value)} />
            </div>

            {campos.map(({ c, l, ph, filas }) => (
              <div key={c}>
                <label className="glass-label">{l}</label>
                <textarea className="glass-input" rows={filas} placeholder={ph}
                          value={form[c]} onChange={e => set(c, e.target.value)}
                          style={{ resize: 'vertical', lineHeight: 1.5 }} />
              </div>
            ))}

            <button onClick={guardar} disabled={guardando}
                    className="glass-btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar informe'}
            </button>
          </div>
        )}

        {/* Listado */}
        {mios.length === 0 && !creando && (
          <div className="glass-card text-center py-12">
            <FileText size={32} className="text-white/25 mx-auto mb-3" />
            <p className="text-white/45 text-sm">Sin informes emitidos</p>
          </div>
        )}

        {mios.map(r => (
          <div key={r.id} className="glass-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-white font-semibold text-sm">{formatFecha(r.fecha)}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => imprimirInforme(r, paciente, historial)}
                        className="flex items-center gap-1.5 text-violet-300 text-xs font-semibold">
                  <Printer size={13} /> PDF
                </button>
                <button onClick={() => setConfirmar(r)} className="text-red-400/55 active:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {r.diagnostico && (
              <p className="text-white/55 text-xs leading-relaxed">
                {String(r.diagnostico).split('\n').filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Confirmar eliminación */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
             style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setConfirmar(null)}>
          <div className="glass-card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold">¿Eliminar informe?</p>
            <p className="text-white/45 text-sm">
              Informe del {formatFecha(confirmar.fecha)}. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmar(null)}
                      className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>Cancelar</button>
              <button onClick={async () => { await eliminarInforme(confirmar.id); setConfirmar(null) }}
                      className="py-3 rounded-2xl text-white font-semibold text-sm"
                      style={{ background: 'rgba(239,68,68,0.8)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
