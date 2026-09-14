// ═══════════════════════════════════════════════════════════════
//  MÓDULO MÉDICO — utilidades clínicas
//  Cálculo de edad, potencial genético (talla diana) y tablas de
//  referencia talla/edad para la curva de distancia.
// ═══════════════════════════════════════════════════════════════

// ── Edad a partir de la fecha de nacimiento ──
export function calcularEdad(fechaNac, hasta = null) {
  if (!fechaNac) return null
  const [ay, am, ad] = fechaNac.split('-').map(Number)
  const ref = hasta ? hasta.split('-').map(Number) : (() => {
    const h = new Date()
    return [h.getFullYear(), h.getMonth() + 1, h.getDate()]
  })()
  const [by, bm, bd] = ref
  let anios = by - ay
  let meses = bm - am
  if (bd < ad) meses--
  if (meses < 0) { anios--; meses += 12 }
  return { anios, meses, decimal: anios + meses / 12 }
}

export function edadTexto(fechaNac, hasta = null) {
  const e = calcularEdad(fechaNac, hasta)
  if (!e) return ''
  if (e.anios < 1) return `${e.meses} ${e.meses === 1 ? 'mes' : 'meses'}`
  if (e.anios < 5 && e.meses > 0) return `${e.anios} ${e.anios === 1 ? 'año' : 'años'} y ${e.meses} ${e.meses === 1 ? 'mes' : 'meses'}`
  return `${e.anios} ${e.anios === 1 ? 'año' : 'años'}`
}

// ── Potencial genético (talla diana) ──
// Fórmula estándar: promedio de la talla de ambos padres ± 6,5 cm según el sexo.
export function potencialGenetico(tallaPadre, tallaMadre, sexo) {
  const p = Number(tallaPadre), m = Number(tallaMadre)
  if (!p || !m || !sexo) return null
  const base = (p + m) / 2
  const valor = sexo === 'M' ? base + 6.5 : base - 6.5
  return { valor: +valor.toFixed(1), min: +(valor - 8.5).toFixed(1), max: +(valor + 8.5).toFixed(1) }
}

// ── Tablas de referencia talla/edad (percentiles 3, 50 y 97) ──
// Valores referenciales OMS en cm, de 0 a 18 años.
// IMPORTANTE: estas tablas y la fórmula del potencial genético las debe
// revisar y validar la Dra. Ruth antes de usarlas con pacientes reales.
const REF_M = [ // varones: [edad, P3, P50, P97]
  [0,46.3,49.9,53.4],[1,71.0,75.7,80.5],[2,81.7,87.8,93.9],[3,89.6,96.1,102.7],
  [4,96.0,103.3,110.6],[5,102.0,110.0,118.0],[6,107.7,116.0,124.4],[7,113.0,121.7,130.5],
  [8,118.1,127.3,136.5],[9,122.9,132.6,142.3],[10,127.7,137.8,147.9],[11,132.6,143.1,153.6],
  [12,137.6,149.1,160.5],[13,143.0,156.0,168.9],[14,148.8,163.2,176.7],[15,154.6,169.0,181.7],
  [16,159.0,172.9,184.9],[17,161.6,175.2,186.7],[18,162.9,176.5,187.7],
]
const REF_F = [ // hembras: [edad, P3, P50, P97]
  [0,45.6,49.1,52.7],[1,68.9,74.0,79.2],[2,80.0,85.7,92.9],[3,87.4,95.1,102.7],
  [4,94.1,102.7,111.3],[5,99.9,109.4,118.9],[6,105.6,115.1,124.6],[7,111.2,121.7,132.2],
  [8,116.6,127.3,138.0],[9,121.7,132.6,143.5],[10,127.0,138.6,150.2],[11,133.0,145.0,157.0],
  [12,139.0,151.2,163.4],[13,143.9,156.4,168.9],[14,147.0,159.8,172.6],[15,148.8,161.7,174.6],
  [16,149.6,162.5,175.4],[17,150.0,162.9,175.8],[18,150.1,163.1,176.1],
]

export const referencia = (sexo) => (sexo === 'M' ? REF_M : REF_F)

// Interpola los percentiles para una edad decimal dada
export function percentilesEnEdad(edadDecimal, sexo) {
  const tabla = referencia(sexo)
  const e = Math.max(0, Math.min(18, edadDecimal))
  const i = Math.min(Math.floor(e), 17)
  const [e1, a1, b1, c1] = tabla[i]
  const [e2, a2, b2, c2] = tabla[i + 1] || tabla[i]
  const t = e2 === e1 ? 0 : (e - e1) / (e2 - e1)
  const lerp = (x, y) => x + (y - x) * t
  return { p3: lerp(a1, a2), p50: lerp(b1, b2), p97: lerp(c1, c2) }
}

// Clasifica una talla contra la referencia
export function clasificarTalla(talla, edadDecimal, sexo) {
  if (!talla || edadDecimal == null || !sexo) return null
  const { p3, p50, p97 } = percentilesEnEdad(edadDecimal, sexo)
  const t = Number(talla)
  if (t < p3)  return { texto: 'Por debajo del P3',  color: '#fca5a5', nivel: 'bajo' }
  if (t > p97) return { texto: 'Por encima del P97', color: '#fcd34d', nivel: 'alto' }
  const pos = t < p50
    ? 3 + ((t - p3) / (p50 - p3)) * 47
    : 50 + ((t - p50) / (p97 - p50)) * 47
  return { texto: `Percentil ~${Math.round(pos)}`, color: '#6ee7b7', nivel: 'normal' }
}
