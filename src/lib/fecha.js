const TZ = 'America/Caracas'

/** Retorna la fecha de hoy en Venezuela como string YYYY-MM-DD */
export function hoyVE() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Convierte cualquier Date a YYYY-MM-DD en hora Venezuela */
export function toFechaVE(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Retorna la hora actual en Venezuela como HH:MM */
export function ahoraVE() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
}
