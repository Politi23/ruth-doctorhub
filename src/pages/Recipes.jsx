import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, Printer, Trash2, Plus, X, Pill } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { NEGOCIO, TERM } from '../config/negocio'
import { hoyVE } from '../lib/fecha'
import QRCode from 'qrcode'
import { membrete, estilosHoja, pieHoja } from '../lib/membrete'


const MEDICAMENTO_VACIO = { nombre: '', indicaciones: '' }

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Récipe en PDF, con el mismo formato que usa la doctora ──
async function imprimirRecipe(recipe, paciente) {
  // La ventana se abre YA, antes de cualquier await, o el navegador la
  // bloquea por no venir directo del clic.
  const w = window.open('', '_blank')
  const med = NEGOCIO.medico
  const meds = Array.isArray(recipe.medicamentos) ? recipe.medicamentos : []
  const generales = (recipe.indicaciones_generales || '').split('\n').filter(l => l.trim())


  const datosPaciente = [
    `<b>Fecha:</b> ${formatFecha(recipe.fecha)}`,
    `<b>Paciente:</b> ${recipe.paciente_nombre}`,
    recipe.paciente_cedula ? `<b>Cédula:</b> ${recipe.paciente_cedula}` : '',
    recipe.paciente_nacimiento ? `<b>F. Nac:</b> ${formatFecha(recipe.paciente_nacimiento)}` : '',
  ].filter(Boolean).join(' &nbsp;•&nbsp; ')

  const encabezado = `
    ${membrete(med)}
    <p class="datos">${datosPaciente}</p>`

  // El sello escaneado ya trae su firma, nombre, especialidad y credenciales.
  // Si no hay sello configurado, se imprime el nombre y queda el espacio para firmar a mano.
  const sello = med.sello ? `${window.location.origin}${med.sello}` : ''

  // ── Sello antifalsificación: código único + QR a la página de verificación ──
  // El QR debe apuntar al dominio definitivo, no al que se esté usando al
  // imprimir, porque el papel sobrevive a cualquier cambio de URL de la app.
  const base = (NEGOCIO.urlPublica || window.location.origin).replace(/\/+$/, '')
  const urlVerificar = recipe.codigo ? `${base}/verificar/${recipe.codigo}` : ''
  let qrSvg = ''
  if (urlVerificar) {
    try {
      // margin 3 = zona de silencio del QR. Sin ella los lectores fallan.
      qrSvg = await QRCode.toString(urlVerificar, {
        type: 'svg', margin: 3, errorCorrectionLevel: 'M',
      })
    } catch { qrSvg = '' }
  }

  const pie = pieHoja({ med, consultorio: NEGOCIO.consultorio, qrSvg, codigo: recipe.codigo, base })

  // Una sola hoja horizontal partida en dos mitades:
  // izquierda RP. (para la farmacia) y derecha Ind. (para el paciente).
  const mitadRp = `
    <div class="mitad">
      ${encabezado}
      <p class="titulo">RP.</p>
      <ol class="meds">
        ${meds.map(m => `<li><b>${m.nombre}</b></li>`).join('')}
      </ol>
      ${pie}
    </div>`

  const mitadInd = `
    <div class="mitad">
      ${encabezado}
      <p class="titulo">Ind.</p>
      <ol class="meds">
        ${meds.map(m => `
          <li>
            <b>${m.nombre}</b>
            ${m.indicaciones ? `<p class="ind">Indicaciones: ${m.indicaciones}</p>` : ''}
          </li>`).join('')}
      </ol>
      ${generales.length ? `
        <p class="generales-tit">INDICACIONES GENERALES:</p>
        <div class="generales">${generales.map(l => `<p>${l}</p>`).join('')}</div>` : ''}
      ${pie}
    </div>`

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Récipe — ${recipe.paciente_nombre}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
    ${estilosHoja}
    .hoja { display: flex; gap: 14mm; height: 178mm; }
    .mitad {
      flex: 1; min-width: 0; display: flex; flex-direction: column;
      padding-right: 7mm;
    }
    .mitad:first-child { border-right: 1px dashed #ddd6fe; }
    .datos { font-size: 7.5pt; margin: 0 0 10px; }
    .titulo {
      font-size: 9.5pt; font-weight: bold; color: #7c3aed; margin: 0 0 8px;
      background: #f5f3ff; border-left: 3px solid #7c3aed; padding: 4px 9px;
    }
    ol.meds { margin: 0; padding-left: 18px; }
    ol.meds li { margin-bottom: 7px; font-size: 9pt; }
    .ind { margin: 1px 0 0; font-size: 7.5pt; font-style: italic; color: #333; }
    .generales-tit { font-size: 8.5pt; font-weight: bold; margin: 12px 0 4px; }
    .generales p { margin: 0 0 2px; font-size: 8pt; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <div class="hoja">
    ${mitadRp}
    ${mitadInd}
  </div>
  <script>window.onload=()=>window.print()<\/script></body></html>`

  w.document.write(html)
  w.document.close()
}

export default function Recipes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { pacientes, recipes, agregarRecipe, eliminarRecipe } = useApp()

  const paciente = pacientes.find(p => p.id === id)
  const mios = recipes.filter(r => r.paciente_id === id).sort((a, b) => b.fecha.localeCompare(a.fecha))

  const [creando, setCreando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [form, setForm] = useState({
    fecha: hoyVE(),
    medicamentos: [{ ...MEDICAMENTO_VACIO }],
    indicaciones_generales: '',
  })

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card text-center py-10">
          <p className="text-white/60 mb-4">{TERM.S} no encontrad{TERM.o}</p>
          <button onClick={() => navigate('/pacientes')} className="glass-btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Volver</button>
        </div>
      </div>
    )
  }

  const set = (c, v) => setForm(prev => ({ ...prev, [c]: v }))

  const setMed = (i, campo, valor) => {
    setForm(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map((m, k) => k === i ? { ...m, [campo]: valor } : m),
    }))
  }
  const agregarMed = () => setForm(prev => ({ ...prev, medicamentos: [...prev.medicamentos, { ...MEDICAMENTO_VACIO }] }))
  const quitarMed = (i) => setForm(prev => ({
    ...prev,
    medicamentos: prev.medicamentos.length > 1 ? prev.medicamentos.filter((_, k) => k !== i) : prev.medicamentos,
  }))


  const abrirNuevo = () => {
    setForm({
      fecha: hoyVE(),
        medicamentos: [{ ...MEDICAMENTO_VACIO }],
      indicaciones_generales: '',
    })
    setCreando(true)
  }

  const guardar = async () => {
    const meds = form.medicamentos.filter(m => m.nombre.trim())
    if (meds.length === 0) { toast('Agrega al menos un medicamento', 'error'); return }
    setGuardando(true)
    try {
      await agregarRecipe({
        paciente_id: id,
        paciente_nombre: `${paciente.nombre} ${paciente.apellido}`,
        paciente_cedula: paciente.cedula || null,
        paciente_nacimiento: paciente.fecha_nacimiento || null,
        fecha: form.fecha,
        medicamentos: meds,
        indicaciones_generales: form.indicaciones_generales.trim(),
      })
      toast('Récipe guardado', 'success')
      setCreando(false)
    } catch (e) {
      toast(e.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Récipes" back
        action={
          !creando ? (
            <button onClick={abrirNuevo} className="glass-btn-icon w-10 h-10 flex items-center justify-center">
              <Plus size={19} className="text-white" />
            </button>
          ) : (
            <button onClick={() => setCreando(false)} className="glass-btn-icon w-10 h-10 flex items-center justify-center">
              <X size={18} className="text-white/70" />
            </button>
          )
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Paciente */}
        <div className="glass-card text-center py-4 space-y-0.5">
          <h2 className="text-white text-lg font-bold">{paciente.nombre} {paciente.apellido}</h2>
          <p className="text-white/50 text-sm">
            {paciente.cedula || 'Sin cédula'}
            {paciente.fecha_nacimiento && ` · Nac. ${formatFecha(paciente.fecha_nacimiento)}`}
          </p>
          {!paciente.fecha_nacimiento && (
            <button onClick={() => navigate(`/pacientes/${id}/editar`)} className="text-amber-300/80 text-xs underline">
              Falta la fecha de nacimiento para el récipe
            </button>
          )}
        </div>

        {/* Nuevo récipe */}
        {creando && (
          <div className="glass-card space-y-4">
            <p className="text-white font-semibold text-sm">Nuevo récipe</p>

            <div>
              <label className="glass-label">Fecha</label>
              <input type="date" className="glass-input" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>

            {/* Medicamentos */}
            <div className="space-y-3">
              <label className="glass-label mb-0">Medicamentos</label>
              {form.medicamentos.map((m, i) => (
                <div key={i} className="rounded-2xl px-3 py-3 space-y-2"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-violet-300 text-xs font-bold w-4">{i + 1}.</span>
                    <input className="glass-input flex-1" placeholder="Nombre, dosis y presentación"
                           value={m.nombre} maxLength={160}
                           onChange={e => setMed(i, 'nombre', e.target.value)} />
                    {form.medicamentos.length > 1 && (
                      <button onClick={() => quitarMed(i)} className="text-red-400/60 active:text-red-400 flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <input className="glass-input" placeholder="Indicaciones: dosis, frecuencia y duración"
                         value={m.indicaciones} maxLength={240}
                         onChange={e => setMed(i, 'indicaciones', e.target.value)} />
                </div>
              ))}
              <button onClick={agregarMed}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-white/60 active:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.20)' }}>
                <Plus size={15} /> Agregar medicamento
              </button>
            </div>

            {/* Indicaciones generales */}
            <div>
              <label className="glass-label">Indicaciones generales</label>
              <textarea className="glass-input" rows={5}
                        placeholder="Una indicación por línea..."
                        value={form.indicaciones_generales}
                        onChange={e => set('indicaciones_generales', e.target.value)} />
            </div>

            <button onClick={guardar} disabled={guardando} className="glass-btn-primary" style={guardando ? { opacity: 0.6 } : {}}>
              <Save size={18} />
              {guardando ? 'Guardando…' : 'Guardar récipe'}
            </button>
          </div>
        )}

        {/* Listado */}
        {mios.length === 0 && !creando && (
          <div className="glass-card text-center py-12">
            <Pill size={32} className="text-white/25 mx-auto mb-3" />
            <p className="text-white/45 text-sm mb-4">Sin récipes emitidos</p>
            <div className="flex justify-center">
              <button onClick={abrirNuevo} className="glass-btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Crear primer récipe
              </button>
            </div>
          </div>
        )}

        {mios.map(r => {
          const meds = Array.isArray(r.medicamentos) ? r.medicamentos : []
          return (
            <div key={r.id} className="glass-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold text-sm">{formatFecha(r.fecha)}</span>
                  {r.codigo && (
                    <p className="text-white/30 text-[11px] font-mono tracking-wider mt-0.5">
                      Cód. {r.codigo}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => imprimirRecipe(r, paciente)}
                          className="flex items-center gap-1.5 text-violet-300 text-xs font-semibold">
                    <Printer size={13} /> PDF
                  </button>
                  <button onClick={() => setConfirmar(r)} className="text-red-400/55 active:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <ol className="space-y-1.5">
                {meds.map((m, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-white/90">{i + 1}. {m.nombre}</span>
                    {m.indicaciones && <p className="text-white/40 text-xs pl-4">{m.indicaciones}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>

      {/* Confirmar eliminación */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-white font-bold text-lg text-center">¿Eliminar récipe?</h3>
            <p className="text-white/60 text-sm text-center">
              Récipe del {formatFecha(confirmar.fecha)}. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmar(null)} className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                Cancelar
              </button>
              <button onClick={async () => { await eliminarRecipe(confirmar.id); setConfirmar(null) }}
                      className="py-3 rounded-2xl text-white font-semibold text-sm"
                      style={{ background: 'rgba(239,68,68,0.55)', border: '1px solid rgba(239,68,68,0.50)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
