// ═══════════════════════════════════════════════════════════════
//  MÓDULO MÉDICO — utilidades clínicas
//
//  Las referencias son las que usa la Dra. Ruth: FUNDACREDESA, tal
//  como aparecen en la Guía de Manejo Clínico de la Sociedad
//  Venezolana de Puericultura y Pediatría (SVPP).
//    · I Estudio Nacional de Crecimiento y Desarrollo Humanos,
//      1981-1987, Fundacredesa, Caracas 2006
//    · Estudio Longitudinal del Área Metropolitana de Caracas,
//      1976-1982, Fundacredesa / CESMa, Universidad Simón Bolívar
//
//  La curva de distancia de talla NO se dibuja a partir de tablas:
//  se usa la lámina oficial de la SVPP como fondo y encima se marcan
//  las tomas del paciente. Así no hay valores de referencia
//  reconstruidos por nosotros. Ver components/CurvaCrecimiento.jsx
// ═══════════════════════════════════════════════════════════════

// ── Edad a partir de la fecha de nacimiento ──
export function calcularEdad(fechaNac, hasta = null) {
  if (!fechaNac) return null
  const nac = new Date(fechaNac + 'T00:00:00')
  const ref = hasta ? new Date(hasta + 'T00:00:00') : new Date()
  if (isNaN(nac) || isNaN(ref) || ref < nac) return null
  let años = ref.getFullYear() - nac.getFullYear()
  let meses = ref.getMonth() - nac.getMonth()
  let dias = ref.getDate() - nac.getDate()
  if (dias < 0) { meses -= 1; dias += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate() }
  if (meses < 0) { años -= 1; meses += 12 }
  const decimal = (ref - nac) / (365.25 * 24 * 3600 * 1000)
  return { años, meses, dias, decimal }
}

export function edadTexto(fechaNac, hasta = null) {
  const e = calcularEdad(fechaNac, hasta)
  if (!e) return ''
  if (e.años === 0) return `${e.meses} ${e.meses === 1 ? 'mes' : 'meses'}`
  if (e.meses === 0) return `${e.años} ${e.años === 1 ? 'año' : 'años'}`
  return `${e.años} ${e.años === 1 ? 'año' : 'años'} y ${e.meses} ${e.meses === 1 ? 'mes' : 'meses'}`
}

// ── Potencial genético (talla diana) ──
// Fórmulas de la Guía de Manejo Clínico de la SVPP, página "Potencial
// genético en talla de los padres":
//   varones = [TP + (TM + 12,7 cm)] / 2  ± 10 cm
//   hembras = [TM + (TP − 12,7 cm)] / 2  ±  9 cm
// El rango no es el mismo en ambos sexos: ±10 en varones y ±9 en hembras.
export function potencialGenetico(tallaPadre, tallaMadre, sexo) {
  const tp = Number(tallaPadre), tm = Number(tallaMadre)
  if (!tp || !tm || !sexo) return null
  const esVaron = sexo === 'M'
  const valor = esVaron ? (tp + (tm + 12.7)) / 2 : (tm + (tp - 12.7)) / 2
  const margen = esVaron ? 10 : 9
  return {
    valor: +valor.toFixed(1),
    min: +(valor - margen).toFixed(1),
    max: +(valor + margen).toFixed(1),
    margen,
  }
}
