import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { NEGOCIO } from '../config/negocio'
import { ShieldCheck, ShieldAlert, Search, Loader2, Pill, FileText, Stethoscope } from 'lucide-react'

// ── Página pública: comprueba que un récipe o un informe es real ──
// Vive fuera del login. Solo responde al código exacto impreso en el papel;
// no permite listar ni buscar documentos de ninguna otra forma.

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function codigoDeLaUrl() {
  const partes = window.location.pathname.split('/').filter(Boolean)
  const i = partes.indexOf('verificar')
  return i >= 0 && partes[i + 1] ? partes[i + 1].toLowerCase() : ''
}

// Consulta la función que cubre los dos tipos de documento.
async function consultar(codigo) {
  const { data, error } = await supabase.rpc('verificar_documento', { p_codigo: codigo })
  if (!error) return { fila: data && data[0] ? data[0] : null }
  return { error: true }
}

export default function VerificarDocumento() {
  const med = NEGOCIO.medico || {}
  const [codigo, setCodigo] = useState(codigoDeLaUrl())
  const [estado, setEstado] = useState(codigoDeLaUrl() ? 'buscando' : 'vacio')
  const [doc, setDoc] = useState(null)

  const buscar = async (cod) => {
    const limpio = (cod || '').trim().toLowerCase()
    if (!limpio) { setEstado('vacio'); setDoc(null); return }
    setEstado('buscando')
    const { fila, error } = await consultar(limpio)
    if (error) { setEstado('error'); setDoc(null); return }
    if (!fila) { setEstado('no-existe'); setDoc(null); return }
    setDoc(fila)
    setEstado('valido')
  }

  useEffect(() => { if (codigoDeLaUrl()) buscar(codigoDeLaUrl()) }, [])

  const esInforme = doc?.tipo === 'informe'
  const d = doc?.datos || {}
  const meds = Array.isArray(d.medicamentos) ? d.medicamentos : []
  const generales = (d.indicaciones_generales || '').split('\n').filter(l => l.trim())
  // Se publica el informe completo: es lo que permite comparar contra el
  // papel y detectar una alteración. Solo la cédula va enmascarada.
  const secciones = [
    { titulo: 'Examen físico',          texto: d.examen_fisico },
    { titulo: 'Exámenes de laboratorio', texto: d.examenes_laboratorio },
    { titulo: 'Diagnóstico',     texto: d.diagnostico, listado: true },
    { titulo: 'Tratamiento',     texto: d.tratamiento },
    { titulo: 'Plan de trabajo', texto: d.plan_trabajo },
  ].filter(x => x.texto && String(x.texto).trim())

  return (
    <div className="min-h-screen px-5 py-8 flex flex-col items-center">
      <div className="fixed inset-0 -z-20 bg-mesh" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      <div className="w-full max-w-md space-y-5">

        {/* Encabezado */}
        <div className="text-center space-y-1">
          <img src="/logo-login.png" alt="" className="w-16 h-16 mx-auto object-contain" />
          <h1 className="text-white text-lg font-bold">Verificación de documentos</h1>
          <p className="text-white/40 text-xs">
            Confirma que un récipe o informe fue emitido por {med.nombre || NEGOCIO.nombreCompleto}
          </p>
        </div>

        {/* Buscador por código */}
        <form onSubmit={e => { e.preventDefault(); buscar(codigo) }} className="glass-card space-y-3">
          <div>
            <label className="glass-label">Código validador</label>
            <input
              className="glass-input font-mono tracking-widest"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="b87b31bf"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              maxLength={12}
            />
          </div>
          <button type="submit" className="glass-btn-primary w-full flex items-center justify-center gap-2">
            <Search size={16} /> Verificar
          </button>
        </form>

        {/* Resultado */}
        {estado === 'buscando' && (
          <div className="glass-card flex items-center justify-center gap-2 py-8 text-white/50 text-sm">
            <Loader2 size={16} className="animate-spin" /> Consultando...
          </div>
        )}

        {estado === 'no-existe' && (
          <div className="glass-card space-y-2 border border-red-400/25">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <ShieldAlert size={20} /> No se encontró este documento
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Ningún récipe ni informe emitido por este consultorio tiene el código
              <span className="font-mono text-white/70"> {codigo}</span>. Revisa que lo hayas
              escrito igual que en el papel. Si el código está bien y aun así no aparece,
              el documento no fue emitido aquí.
            </p>
          </div>
        )}

        {estado === 'error' && (
          <div className="glass-card text-white/60 text-sm">
            No se pudo consultar en este momento. Revisa tu conexión e intenta de nuevo.
          </div>
        )}

        {estado === 'valido' && doc && (
          <div className="space-y-4">

            <div className="glass-card space-y-1 border border-emerald-400/30">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <ShieldCheck size={20} />
                {esInforme ? 'Informe auténtico' : 'Récipe auténtico'}
              </div>
              <p className="text-white/50 text-sm">
                Emitido por este consultorio. Compara los datos de abajo con el papel que tienes
                en la mano: si algo no coincide, el papel fue alterado.
              </p>
            </div>

            {/* Quién lo emitió */}
            <div className="glass-card space-y-2">
              <div className="flex items-center gap-2 text-white/35 text-xs uppercase tracking-wide">
                <Stethoscope size={13} /> Emitido por
              </div>
              <p className="text-white font-bold">{med.nombre || NEGOCIO.nombreCompleto}</p>
              {med.especialidad && <p className="text-white/50 text-sm">{med.especialidad}</p>}
              <p className="text-white/35 text-xs font-mono">
                {[med.cedula && `CI: V-${med.cedula}`, med.mpps && `MPPS: ${med.mpps}`,
                  med.cm && `CM: ${med.cm}`].filter(Boolean).join('  ·  ')}
              </p>
            </div>

            {/* Datos del documento */}
            <div className="glass-card space-y-3">
              <Dato etiqueta="Tipo de documento" valor={esInforme ? 'Informe médico' : 'Récipe médico'} />
              <Dato etiqueta="Código validador"
                    valor={<span className="font-mono tracking-widest">{d.codigo}</span>} />
              <Dato etiqueta="Fecha" valor={formatFecha(d.fecha)} />
              <Dato etiqueta="Paciente" valor={d.paciente_nombre} />
              {d.paciente_cedula && (
                <Dato etiqueta="Cédula" valor={<span className="font-mono">{d.paciente_cedula}</span>} />
              )}
            </div>

            {/* Contenido verificable */}
            {esInforme ? (
              <div className="glass-card space-y-4">
                <div className="flex items-center gap-2 text-white/35 text-xs uppercase tracking-wide">
                  <FileText size={13} /> Contenido del informe
                </div>
                {secciones.map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-violet-300/80 text-xs font-semibold uppercase tracking-wide">{sec.titulo}</p>
                    {sec.listado ? (
                      <ul className="space-y-1">
                        {String(sec.texto).split('\n').filter(l => l.trim()).map((l, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-white/30 text-sm shrink-0">{j + 1}.</span>
                            <span className="text-white text-sm uppercase">{l}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      String(sec.texto).split('\n').filter(l => l.trim()).map((l, j) => (
                        <p key={j} className="text-white/75 text-sm leading-relaxed">{l}</p>
                      ))
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card space-y-3">
                <div className="flex items-center gap-2 text-white/35 text-xs uppercase tracking-wide">
                  <Pill size={13} /> Medicamentos indicados
                </div>
                <ol className="space-y-2.5">
                  {meds.map((m, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="text-violet-300/80 font-bold text-sm shrink-0">{i + 1}.</span>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold">{m.nombre}</p>
                        {m.indicaciones && (
                          <p className="text-white/45 text-xs mt-0.5">{m.indicaciones}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {generales.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <p className="text-white/35 text-xs uppercase tracking-wide">Indicaciones generales</p>
                    {generales.map((l, i) => <p key={i} className="text-white/55 text-xs">{l}</p>)}
                  </div>
                )}
              </div>
            )}

            <p className="text-white/25 text-[11px] text-center leading-relaxed px-4">
              La cédula se muestra parcialmente por privacidad del paciente.
              El resto del documento se muestra completo para que puedas compararlo
              con el papel: así se detecta si fue alterado.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-white/35 text-xs shrink-0">{etiqueta}</span>
      <span className="text-white text-sm font-medium text-right min-w-0 break-words">{valor}</span>
    </div>
  )
}
