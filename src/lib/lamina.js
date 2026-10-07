// ═══════════════════════════════════════════════════════════════
//  Lámina oficial de la curva de distancia · Talla
//
//  Única fuente de la calibración: la usan tanto la pantalla como la
//  impresión, para que un punto caiga en el mismo sitio en las dos.
//
//  Medida sobre la imagen recortada (585 x 564 px) y verificada contra
//  los números impresos de los dos ejes de la lámina.
// ═══════════════════════════════════════════════════════════════

import { NEGOCIO } from '../config/negocio'
import { calcularEdad, edadTexto } from './clinico'
import { membrete, estilosHoja, pieHoja } from './membrete'

export const IMG_W = 585, IMG_H = 564
const X_EDAD_0 = 45.0        // píxel del año 0
const PX_POR_ANIO = 24.575
const Y_TALLA_200 = 38.5     // píxel de los 200 cm
const PX_POR_CM = 2.7588

export const EDAD_MAX = 20, TALLA_MIN = 30, TALLA_MAX = 200

// Bordes del área graficada, para que las guías lleguen justo a los ejes
export const X_EJE = X_EDAD_0
export const Y_EJE = Y_TALLA_200 + (TALLA_MAX - TALLA_MIN) * PX_POR_CM

export const ejeX = (edad) => X_EDAD_0 + edad * PX_POR_ANIO
export const ejeY = (cm) => Y_TALLA_200 + (TALLA_MAX - cm) * PX_POR_CM

export const laminaDe = (sexo) =>
  sexo === 'M' ? '/curva-talla-varones.png' : '/curva-talla-hembras.png'

// Tomas convertidas a coordenadas de la lámina. Las que caen fuera no se
// dibujan: es preferible no mostrarlas a ponerlas donde no corresponde.
export function puntosDeLamina(medidas, fechaNacimiento) {
  return (medidas || [])
    .filter(m => m.talla)
    .map(m => {
      const e = calcularEdad(fechaNacimiento, m.fecha)
      if (!e) return null
      const talla = Number(m.talla)
      if (e.decimal < 0 || e.decimal > EDAD_MAX) return null
      if (talla < TALLA_MIN || talla > TALLA_MAX) return null
      return {
        x: ejeX(e.decimal), y: ejeY(talla),
        edad: e.decimal, talla, fecha: m.fecha, peso: m.peso,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.edad - b.edad)
}

const escapar = (t) => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  return `${d}/${m}/${y}`
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function fechaLarga(iso, lugar) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  return `${lugar}, ${Number(d)} de ${MESES[Number(m) - 1]} del ${y}`
}

// ── Hoja de la curva, A4 vertical con el membrete ──
// Lleva la lámina con las tomas marcadas y, debajo, la tabla de tomas.
export function imprimirCurva({ paciente, historial, medidas, fecha }) {
  const w = window.open('', '_blank')
  const med = NEGOCIO.medico
  const sexo = historial?.sexo
  const nac = historial?.fecha_nacimiento
  const puntos = puntosDeLamina(medidas, nac)
  const lamina = `${window.location.origin}${laminaDe(sexo)}`
  const nombre = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim()

  const trazo = puntos
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  const marcas = puntos.map(p => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.4" fill="#ffffff"/>
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="#4c1d95"/>`).join('')

  const ficha = [
    ['Paciente', nombre],
    paciente?.cedula ? ['Cédula', paciente.cedula] : null,
    nac ? ['Fecha de nacimiento', formatFecha(nac)] : null,
    sexo ? ['Sexo', sexo === 'M' ? 'Masculino' : 'Femenino'] : null,
    ['Fecha', fechaLarga(fecha, NEGOCIO.ciudad || 'Puerto Cabello')],
  ].filter(Boolean)

  const filas = [...puntos].reverse().map(p => `
    <tr>
      <td>${formatFecha(p.fecha)}</td>
      <td>${escapar(edadTexto(nac, p.fecha))}</td>
      <td class="num">${p.peso != null ? p.peso + ' kg' : '—'}</td>
      <td class="num">${p.talla} cm</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Curva de talla — ${escapar(nombre)}</title>
  <style>
    @page { size: A4 portrait; margin: 13mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
    .hoja { display: flex; flex-direction: column; min-height: 210mm; }
    ${estilosHoja}
    .titulo-hoja {
      text-align: center; font-size: 11.5pt; font-weight: bold; letter-spacing: .3px;
      text-decoration: underline; margin: 3mm 0 2.5mm;
    }
    table.ficha { border-collapse: collapse; width: 100%; font-size: 9pt; }
    table.ficha th { text-align: left; font-weight: bold; width: 42mm; padding: 0.4mm 0; }
    .regla-fina { border-top: 1px solid #333; margin: 2.5mm 0 3mm; }
    .grafica { position: relative; width: 126mm; margin: 0 auto; line-height: 0; }
    .grafica img { width: 100%; display: block; }
    .grafica svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    table.tomas { border-collapse: collapse; width: 100%; font-size: 8.5pt; margin-top: 3mm; }
    table.tomas caption { text-align: left; font-weight: bold; font-size: 9.5pt; margin-bottom: 1.5mm; }
    table.tomas th { text-align: left; font-size: 8pt; color: #444; border-bottom: 1px solid #999; padding: 1mm 2mm 1mm 0; }
    table.tomas td { padding: 1mm 2mm 1mm 0; border-bottom: 1px solid #e3e3e3; }
    table.tomas .num { text-align: right; }
    .fuente { font-size: 6.5pt; color: #666; margin: 2mm 0 0; line-height: 1.3; }
    .cuerpo { flex: 1; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <div class="hoja">
    ${membrete(med)}
    <p class="titulo-hoja">CURVA DE DISTANCIA PARA USO CLÍNICO · TALLA</p>
    <div class="cuerpo">
      <table class="ficha">
        ${ficha.map(([k, v]) => `<tr><th>${escapar(k)}</th><td>: ${escapar(v)}</td></tr>`).join('')}
      </table>
      <div class="regla-fina"></div>

      <div class="grafica">
        <img src="${lamina}" alt="">
        <svg viewBox="0 0 ${IMG_W} ${IMG_H}" preserveAspectRatio="none">
          ${puntos.length > 1
            ? `<path d="${trazo}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
               <path d="${trazo}" fill="none" stroke="#4c1d95" stroke-width="1.8" stroke-linejoin="round"/>`
            : ''}
          ${marcas}
        </svg>
      </div>

      ${puntos.length ? `
      <table class="tomas">
        <caption>Tomas registradas</caption>
        <tr><th>Fecha</th><th>Edad</th><th class="num">Peso</th><th class="num">Talla</th></tr>
        ${filas}
      </table>` : ''}

      <p class="fuente">
        Percentiles de Fundacredesa. Lámina de la Sociedad Venezolana de Puericultura y Pediatría.
        I Estudio Nacional de Crecimiento y Desarrollo Humanos 1981-1987 y Estudio Longitudinal
        del Área Metropolitana de Caracas 1976-1982.
      </p>
    </div>
    ${pieHoja({ med, consultorio: NEGOCIO.consultorio })}
  </div>
  <script>window.onload=()=>window.print()<\/script></body></html>`

  w.document.write(html)
  w.document.close()
}
