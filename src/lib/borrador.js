// ═══════════════════════════════════════════════════════════════
//  Borradores de formularios largos
//
//  En el teléfono, al cambiar a WhatsApp y volver, el sistema puede
//  descartar la app de memoria: al regresar la página arranca de cero
//  y se pierde lo que se estaba escribiendo.
//
//  Se guarda en localStorage y no en sessionStorage porque este último
//  no sobrevive a que el sistema cierre la app del todo.
//
//  El borrador caduca a las 24 horas: así no reaparece días después
//  algo que la doctora ya había abandonado.
// ═══════════════════════════════════════════════════════════════

const PREFIJO = 'doctorhub:borrador:'
const VIGENCIA_MS = 24 * 60 * 60 * 1000

export function leerBorrador(clave) {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave)
    if (!crudo) return null
    const { guardadoEn, datos } = JSON.parse(crudo)
    if (!guardadoEn || Date.now() - guardadoEn > VIGENCIA_MS) {
      borrarBorrador(clave)
      return null
    }
    return datos ?? null
  } catch {
    return null
  }
}

export function guardarBorrador(clave, datos) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify({ guardadoEn: Date.now(), datos }))
  } catch {
    // Sin espacio o almacenamiento bloqueado: no vale la pena interrumpir
    // a la doctora por esto, simplemente no se guarda el borrador.
  }
}

export function borrarBorrador(clave) {
  try { localStorage.removeItem(PREFIJO + clave) } catch {}
}
