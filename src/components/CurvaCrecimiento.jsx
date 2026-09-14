import { referencia, calcularEdad } from '../lib/clinico'

// ── Curva de distancia para uso clínico · Talla ──
// La doctora la pidió específica, no una gráfica genérica de crecimiento:
// talla alcanzada frente a los percentiles P3, P50 y P97 de referencia,
// separadas por sexo. No incluye peso ni velocidad de crecimiento.
export default function CurvaCrecimiento({ sexo, fechaNacimiento, medidas }) {
  if (!sexo || !fechaNacimiento) return null

  const W = 320, H = 260, ML = 34, MR = 8, MT = 10, MB = 26
  const gw = W - ML - MR, gh = H - MT - MB

  const tabla = referencia(sexo)
  const datos = (medidas || [])
    .filter(m => m.talla)
    .map(m => {
      const e = calcularEdad(fechaNacimiento, m.fecha)
      return e ? { edad: e.decimal, valor: Number(m.talla) } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.edad - b.edad)

  const hayDatos = datos.length > 0

  // Rango de edad visible, ajustado a las tomas del paciente
  const edadMax = Math.min(18, Math.max(3, Math.ceil((datos.at(-1)?.edad ?? 5) + 1)))
  const edadMin = Math.max(0, Math.floor((datos[0]?.edad ?? 0) - 1))

  const vis = tabla.filter(([e]) => e >= edadMin && e <= edadMax)
  const valMin = Math.floor((Math.min(...vis.map(v => v[1])) - 5) / 10) * 10
  const valMax = Math.ceil((Math.max(...vis.map(v => v[3])) + 5) / 10) * 10
  const refSeries = [
    vis.map(([e, a]) => [e, a]),        // P3
    vis.map(([e, , b]) => [e, b]),      // P50
    vis.map(([e, , , c]) => [e, c]),    // P97
  ]

  const x = (edad) => ML + ((edad - edadMin) / (edadMax - edadMin)) * gw
  const y = (v) => MT + gh - ((v - valMin) / (valMax - valMin)) * gh
  const path = (serie) => serie.map(([e, v], i) => `${i ? 'L' : 'M'}${x(e).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  // Banda entre P3 y P97: el rango considerado normal
  const areaNormal = refSeries[0]?.length
    ? `${path(refSeries[0])} ${[...refSeries[2]].reverse().map(([e, v]) => `L${x(e).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} Z`
    : null

  const ticksEdad = []
  const paso = edadMax - edadMin > 10 ? 3 : (edadMax - edadMin > 5 ? 2 : 1)
  for (let e = edadMin; e <= edadMax; e += paso) ticksEdad.push(e)

  const ticksVal = []
  for (let v = valMin; v <= valMax; v += 10) ticksVal.push(v)

  return (
    <div className="glass-card space-y-2">
      <div>
        <p className="text-white font-semibold text-sm">Curva de distancia para uso clínico</p>
        <p className="text-white/40 text-xs mt-0.5">
          Talla · {sexo === 'M' ? 'Varones' : 'Hembras'}
        </p>
      </div>

      {!hayDatos ? (
        <p className="text-white/35 text-sm text-center py-8">
          Sin tomas de talla registradas.
        </p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
            {areaNormal && <path d={areaNormal} fill="rgba(139,92,246,0.10)" />}

            {ticksVal.map(t => (
              <g key={t}>
                <line x1={ML} y1={y(t)} x2={W - MR} y2={y(t)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <text x={ML - 5} y={y(t) + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.40)">{t}</text>
              </g>
            ))}
            {ticksEdad.map(e => (
              <g key={e}>
                <line x1={x(e)} y1={MT} x2={x(e)} y2={MT + gh} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <text x={x(e)} y={H - MB + 13} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.40)">{e}</text>
              </g>
            ))}

            {/* Percentiles de referencia */}
            <path d={path(refSeries[0])} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1" strokeDasharray="3 3" />
            <path d={path(refSeries[1])} fill="none" stroke="rgba(167,139,250,0.85)" strokeWidth="1.5" />
            <path d={path(refSeries[2])} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Tomas del paciente */}
            {datos.length > 1 && (
              <path d={datos.map((p, i) => `${i ? 'L' : 'M'}${x(p.edad).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ')}
                    fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
            )}
            {datos.map((p, i) => (
              <circle key={i} cx={x(p.edad)} cy={y(p.valor)} r="3.2" fill="#34d399" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
            ))}

            <text x={ML - 26} y={MT + gh / 2} fontSize="8" fill="rgba(255,255,255,0.35)"
                  transform={`rotate(-90 ${ML - 26} ${MT + gh / 2})`} textAnchor="middle">
              Talla (cm)
            </text>
            <text x={ML + gw / 2} y={H - 2} fontSize="8" fill="rgba(255,255,255,0.35)" textAnchor="middle">Edad (años)</text>
          </svg>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="flex items-center gap-1.5 text-white/45 text-xs">
              <span style={{ width: 12, height: 2, background: '#34d399', borderRadius: 2 }} />Paciente
            </span>
            <span className="flex items-center gap-1.5 text-white/45 text-xs">
              <span style={{ width: 12, height: 2, background: 'rgba(167,139,250,0.9)', borderRadius: 2 }} />P50
            </span>
            <span className="flex items-center gap-1.5 text-white/45 text-xs">
              <span style={{ width: 12, height: 2, background: 'rgba(255,255,255,0.45)', borderRadius: 2 }} />P3 / P97
            </span>
            <span className="text-white/25 text-xs ml-auto">cm</span>
          </div>
        </>
      )}
    </div>
  )
}
