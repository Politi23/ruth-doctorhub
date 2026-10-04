import { useState } from 'react'
import { X, Maximize2 } from 'lucide-react'
import { calcularEdad } from '../lib/clinico'

// ── Curva de Distancia para uso clínico · Talla ──
// Se usa la lámina oficial de la SVPP (percentiles de Fundacredesa) como
// fondo y encima se marcan las tomas del paciente. No reconstruimos los
// percentiles: son los impresos en la propia lámina, los mismos que la
// doctora usa en papel.
//
// Calibración de la lámina, medida sobre la imagen recortada (585 x 564 px)
// y verificada contra los números impresos de los dos ejes:
const IMG_W = 585, IMG_H = 564
const X_EDAD_0 = 45.0        // píxel del año 0
const PX_POR_ANIO = 24.575
const Y_TALLA_200 = 38.5     // píxel de los 200 cm
const PX_POR_CM = 2.7588
const EDAD_MAX = 20, TALLA_MIN = 30, TALLA_MAX = 200

const ejeX = (edad) => X_EDAD_0 + edad * PX_POR_ANIO
const ejeY = (cm) => Y_TALLA_200 + (TALLA_MAX - cm) * PX_POR_CM

export default function CurvaCrecimiento({ sexo, fechaNacimiento, medidas }) {
  const [ampliada, setAmpliada] = useState(false)
  if (!sexo || !fechaNacimiento) return null

  const lamina = sexo === 'M' ? '/curva-talla-varones.png' : '/curva-talla-hembras.png'

  const puntos = (medidas || [])
    .filter(m => m.talla)
    .map(m => {
      const e = calcularEdad(fechaNacimiento, m.fecha)
      if (!e) return null
      const talla = Number(m.talla)
      // Fuera de la lámina no se dibuja nada: es preferible no mostrar el
      // punto a mostrarlo en un lugar que no le corresponde.
      if (e.decimal < 0 || e.decimal > EDAD_MAX) return null
      if (talla < TALLA_MIN || talla > TALLA_MAX) return null
      return { x: ejeX(e.decimal), y: ejeY(talla), edad: e.decimal, talla }
    })
    .filter(Boolean)
    .sort((a, b) => a.edad - b.edad)

  const trazo = puntos.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const Grafica = ({ ancho }) => (
    <div style={{ position: 'relative', width: ancho, lineHeight: 0 }}>
      <img src={lamina} alt="Curva de distancia para uso clínico, talla"
           style={{ width: '100%', display: 'block', borderRadius: 10 }} />
      <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`}
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {puntos.length > 1 && (
          <>
            <path d={trazo} fill="none" stroke="#ffffff" strokeWidth="4.5"
                  strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
            <path d={trazo} fill="none" stroke="#7c3aed" strokeWidth="2.2"
                  strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {puntos.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.6" fill="#ffffff" opacity="0.95" />
            <circle cx={p.x} cy={p.y} r="3" fill="#7c3aed" />
          </g>
        ))}
      </svg>
    </div>
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
          <button onClick={() => setAmpliada(true)}
                  className="glass-btn-icon w-9 h-9 flex items-center justify-center flex-shrink-0"
                  aria-label="Ver la curva en grande">
            <Maximize2 size={15} className="text-white/70" />
          </button>
        </div>

        {puntos.length === 0 ? (
          <p className="text-white/35 text-sm text-center py-8">
            Sin tomas de talla dentro del rango de la curva.
          </p>
        ) : (
          <>
            <Grafica ancho="100%" />
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-block" style={{ width: 14, height: 3, borderRadius: 2, background: '#7c3aed' }} />
              <span className="text-white/45 text-xs">Tomas del paciente</span>
              <span className="text-white/25 text-xs ml-auto">{puntos.length} {puntos.length === 1 ? 'toma' : 'tomas'}</span>
            </div>
          </>
        )}

        <p className="text-white/25 text-[11px] leading-relaxed">
          Percentiles de Fundacredesa, lámina de la Sociedad Venezolana de Puericultura y Pediatría.
          I Estudio Nacional de Crecimiento y Desarrollo Humanos 1981-1987 y Estudio Longitudinal
          del Área Metropolitana de Caracas 1976-1982.
        </p>
      </div>

      {/* Vista ampliada: la lámina es densa y en pantalla de teléfono se lee mal */}
      {ampliada && (
        <div className="fixed inset-0 z-50 flex flex-col"
             style={{ background: 'rgba(8,4,20,0.96)' }}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <p className="text-white text-sm font-semibold">
              Curva de distancia · Talla · {sexo === 'M' ? 'Varones' : 'Hembras'}
            </p>
            <button onClick={() => setAmpliada(false)}
                    className="glass-btn-icon w-10 h-10 flex items-center justify-center"
                    aria-label="Cerrar">
              <X size={18} className="text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-3 pb-6">
            <Grafica ancho="min(1100px, 240vw)" />
          </div>
        </div>
      )}
    </>
  )
}
