import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Maximize2, Printer } from 'lucide-react'
import { edadTexto } from '../lib/clinico'
import { IMG_W, IMG_H, X_EJE, Y_EJE, laminaDe, puntosDeLamina, imprimirCurva } from '../lib/lamina'

// ── Curva de Distancia para uso clínico · Talla ──
// Se usa la lámina oficial de la SVPP (percentiles de Fundacredesa) como
// fondo y encima se marcan las tomas del paciente. No reconstruimos los
// percentiles: son los impresos en la propia lámina, los mismos que la
// doctora usa en papel.
//
// Al tocar una toma se dibujan guías hacia los dos ejes, para poder leer
// el percentil sobre la lámina sin estimar la posición a ojo.
//
// La calibración y el cálculo de los puntos viven en lib/lamina.js, para
// que la pantalla y la impresión usen exactamente los mismos números.

const ZOOMS = [1, 2, 3]

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  return `${d}/${m}/${y}`
}

export default function CurvaCrecimiento({ sexo, fechaNacimiento, medidas, paciente, historial, hoy }) {
  const [ampliada, setAmpliada] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [sel, setSel] = useState(null)
  // Ancho que hace entrar la lámina completa, calculado del espacio real.
  // Se fija en píxeles en vez de dejarlo a max-height en porcentaje, que no
  // resuelve contra un contenedor de alto automático y desfasaba los puntos.
  const [anchoAjuste, setAnchoAjuste] = useState(null)
  const marco = useRef(null)

  const lamina = laminaDe(sexo)

  const puntos = puntosDeLamina(medidas, fechaNacimiento)

  // Al acercar, la lámina no cabe en pantalla. Se centra en las tomas del
  // paciente, que es lo que interesa ver, y no en el extremo izquierdo vacío.
  const centrarEnLasTomas = useCallback(() => {
    const el = marco.current
    if (!el || puntos.length === 0) return
    const fx = puntos.reduce((a, p) => a + p.x, 0) / puntos.length / IMG_W
    const fy = puntos.reduce((a, p) => a + p.y, 0) / puntos.length / IMG_H
    el.scrollLeft = fx * el.scrollWidth - el.clientWidth / 2
    el.scrollTop = fy * el.scrollHeight - el.clientHeight / 2
  }, [puntos])

  const medirAjuste = useCallback(() => {
    const el = marco.current
    if (!el) return
    const cs = getComputedStyle(el)
    const ancho = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const alto = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    setAnchoAjuste(Math.max(0, Math.min(ancho, alto * (IMG_W / IMG_H))))
  }, [])

  useEffect(() => {
    if (!ampliada) return
    medirAjuste()
    window.addEventListener('resize', medirAjuste)
    return () => window.removeEventListener('resize', medirAjuste)
  }, [ampliada, zoom, medirAjuste])

  useEffect(() => {
    if (!ampliada) return
    // Si la lámina aún no terminó de medirse, el primer intento se queda
    // corto: se repite una vez más.
    requestAnimationFrame(centrarEnLasTomas)
    const t = setTimeout(centrarEnLasTomas, 160)
    return () => clearTimeout(t)
  }, [ampliada, zoom, centrarEnLasTomas])

  if (!sexo || !fechaNacimiento) return null

  const trazo = puntos.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const elegido = sel != null ? puntos[sel] : null

  // `ajustar` = la lámina entra completa en el espacio disponible. En ese modo
  // manda la imagen: se escala conservando su proporción y el contenedor se
  // ajusta a ella. Si se estirara, la capa de puntos (que sí conserva la
  // proporción) quedaría desplazada respecto al dibujo.
  const Grafica = ({ ancho = '100%' }) => (
    <div style={{ position: 'relative', lineHeight: 0, width: ancho, flexShrink: 0 }}>
      <img src={lamina} alt="Curva de distancia para uso clínico, talla"
           style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }} />
      {/* preserveAspectRatio="none" hace que la capa se deforme exactamente
          igual que la imagen: así los puntos no pueden quedar corridos
          respecto al dibujo, pase lo que pase con el tamaño de la caja. */}
      <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`} preserveAspectRatio="none"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
           onClick={() => setSel(null)}>

        {/* Guías de la toma elegida hacia los dos ejes */}
        {elegido && (
          <g>
            <line x1={X_EJE} y1={elegido.y} x2={elegido.x} y2={elegido.y}
                  stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.85" />
            <line x1={elegido.x} y1={elegido.y} x2={elegido.x} y2={Y_EJE}
                  stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.85" />
          </g>
        )}

        {puntos.length > 1 && (
          <>
            <path d={trazo} fill="none" stroke="#ffffff" strokeWidth="4.5"
                  strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
            <path d={trazo} fill="none" stroke="#7c3aed" strokeWidth="2.2"
                  strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {puntos.map((p, i) => (
          <g key={i} onClick={(e) => { e.stopPropagation(); setSel(sel === i ? null : i) }}
             style={{ cursor: 'pointer' }}>
            {/* Área de toque holgada: los puntos impresos son muy pequeños */}
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={sel === i ? 6.4 : 4.6} fill="#ffffff" opacity="0.95" />
            <circle cx={p.x} cy={p.y} r={sel === i ? 4.2 : 3} fill="#7c3aed" />
            {sel === i && (
              <circle cx={p.x} cy={p.y} r="8.5" fill="none" stroke="#7c3aed"
                      strokeWidth="1.3" opacity="0.7" />
            )}
          </g>
        ))}
      </svg>
    </div>
  )

  // Lectura exacta de la toma elegida, en texto grande y no dentro del dibujo
  const Lectura = () => (
    elegido ? (
      <div className="rounded-2xl px-3 py-2.5"
           style={{ background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(124,58,237,0.32)' }}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-violet-200 text-base font-bold">{elegido.talla} cm</span>
          <span className="text-white/50 text-xs">{formatFecha(elegido.fecha)}</span>
        </div>
        <p className="text-white/55 text-xs mt-0.5">
          {edadTexto(fechaNacimiento, elegido.fecha)}
          {elegido.peso != null && ` · ${elegido.peso} kg`}
        </p>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span className="inline-block" style={{ width: 14, height: 3, borderRadius: 2, background: '#7c3aed' }} />
        <span className="text-white/45 text-xs">Tomas del paciente</span>
        <span className="text-white/25 text-xs ml-auto">
          {puntos.length} {puntos.length === 1 ? 'toma' : 'tomas'} · toca una para leerla
        </span>
      </div>
    )
  )

  return (
    <>
      <div className="glass-card space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white font-semibold text-sm">Curva de distancia para uso clínico</p>
            <p className="text-white/40 text-xs mt-0.5">
              Talla · {sexo === 'M' ? 'Varones' : 'Hembras'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => imprimirCurva({ paciente, historial, medidas, fecha: hoy })}
                    className="glass-btn-icon w-9 h-9 flex items-center justify-center"
                    aria-label="Imprimir la curva">
              <Printer size={15} className="text-white/70" />
            </button>
            <button onClick={() => { setZoom(1); setAmpliada(true) }}
                    className="glass-btn-icon w-9 h-9 flex items-center justify-center"
                    aria-label="Ver la curva en grande">
              <Maximize2 size={15} className="text-white/70" />
            </button>
          </div>
        </div>

        {puntos.length === 0 ? (
          <p className="text-white/35 text-sm text-center py-8">
            Sin tomas de talla dentro del rango de la curva.
          </p>
        ) : (
          <>
            <Grafica />
            <Lectura />
          </>
        )}

        <p className="text-white/25 text-[11px] leading-relaxed">
          Percentiles de Fundacredesa, lámina de la Sociedad Venezolana de Puericultura y Pediatría.
          I Estudio Nacional de Crecimiento y Desarrollo Humanos 1981-1987 y Estudio Longitudinal
          del Área Metropolitana de Caracas 1976-1982.
        </p>
      </div>

      {/* Vista ampliada: va por portal al body para que el fixed se mida
          contra la ventana y no contra la columna de la página. */}
      {ampliada && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(8,4,20,0.97)' }}>
          <div className="flex-shrink-0 px-4 pt-3 pb-2 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-white text-sm font-semibold min-w-0 truncate">
                Curva de distancia · Talla · {sexo === 'M' ? 'Varones' : 'Hembras'}
              </p>
              <button onClick={() => setAmpliada(false)}
                      className="glass-btn-icon w-10 h-10 flex items-center justify-center flex-shrink-0"
                      aria-label="Cerrar">
                <X size={18} className="text-white" />
              </button>
            </div>
            <div className="flex justify-center">
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
                {ZOOMS.map(z => (
                  <button key={z} onClick={() => setZoom(z)}
                          className="px-5 py-1.5 text-xs font-semibold transition-colors"
                          style={{
                            background: zoom === z ? 'rgba(124,58,237,0.55)' : 'transparent',
                            color: zoom === z ? '#fff' : 'rgba(255,255,255,0.45)',
                          }}>
                    {z}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* A 1x la lámina entra completa y va centrada; de ahí en adelante
              se desplaza y el efecto la deja sobre las tomas del paciente. */}
          <div ref={marco} className="flex-1 overflow-auto px-3"
               style={zoom === 1
                 ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }
                 : { minHeight: 0 }}>
            {zoom === 1
              ? <Grafica ancho={anchoAjuste ? `${anchoAjuste}px` : '100%'} />
              : <Grafica ancho={`${zoom * 100}%`} />}
          </div>

          {/* El padding de abajo respeta la barra de gestos del teléfono:
              sin él la lectura queda pegada al borde y el sistema la tapa. */}
          <div className="px-4 pt-3 flex-shrink-0"
               style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
            <Lectura />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
