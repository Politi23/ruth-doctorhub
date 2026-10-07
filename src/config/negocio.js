// ═══════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DEL NEGOCIO — único archivo de código a editar
//  Cliente: Dra. Ruth · Endocrinología pediátrica
// ═══════════════════════════════════════════════════════════════════

export const NEGOCIO = {
  // ── Identidad de la app ──
  nombreApp: 'DoctorHub',
  descripcionApp: 'Sistema de gestión — Dra. Ruth',

  // ── Dueña del negocio ──
  nombreCorto: 'Dra. Ruth',                 // saludo del dashboard
  nombreCompleto: 'Dra. Ruth Salas',        // reportes PDF y mensajes de WhatsApp
  saludo: 'Bienvenida',
  descripcionProfesional: 'endocrinóloga pediatra',

  // ── Lugar de trabajo (egresos, mensajes) ──
  ciudad: 'Puerto Cabello',                 // encabeza la fecha del informe médico
  lugar: 'consultorio',
  Lugar: 'Consultorio',
  emojiLugar: '🏥',

  // ── Colores PWA ──
  colorTema: '#7C3AED',
  colorFondo: '#F5F3FF',

  // ── Catálogos: motivos de consulta de la Dra. Ruth ──
  motivosCita: ['Inadecuado crecimiento', 'Talla baja', 'Talla alta', 'Hallazgo de laboratorio', 'Control de peso', 'Sobrepeso', 'Aumento de mamas', 'Presencia de vello púbico', 'Evaluación del crecimiento y desarrollo'],
  motivosRapidos: ['Inadecuado crecimiento', 'Talla baja', 'Control de peso', 'Evaluación del crecimiento y desarrollo'],
  motivoDefault: 'Evaluación del crecimiento y desarrollo',
  conceptosIngreso: ['Inadecuado crecimiento', 'Talla baja', 'Talla alta', 'Hallazgo de laboratorio', 'Control de peso', 'Sobrepeso', 'Aumento de mamas', 'Presencia de vello púbico', 'Evaluación del crecimiento y desarrollo'],
  // La primera categoría es la seleccionada por defecto al registrar un egreso
  categoriasEgreso: ['Alquiler consultorio','Electricidad / Agua / Internet','Suministros médicos','Equipos médicos','Personal / Honorarios','Publicidad','Impuestos','Mantenimiento','Transporte','Otro'],

  // ── Mensaje de WhatsApp para reactivar pacientes sin cita reciente ──
  msgSeguimiento: (nombre) =>
    `Hola, le saludamos del consultorio de la Dra. Ruth. Le recordamos que es importante continuar con los controles de ${nombre}. ¿Le gustaría agendar una cita? 😊`,

  // ── Módulos activos ──
  modulos: {
    historial: true,        // historial médico del paciente
    informes: true,         // informe médico imprimible con membrete
    recipes: true,          // récipes digitales con indicaciones, exportables en PDF
    curvaCrecimiento: true, // curva de distancia para uso clínico · talla
  },

  // ── Datos que encabezan los documentos impresos ──
  // Tomados de su sello.
  medico: {
    nombre: 'Dra. Ruth Salas',
    especialidad: 'Endocrinólogo Pediatra',   // como aparece en su sello
    cedula: '11809510',
    mpps: '55312',
    cm: '6774',
    correo: '',
    sello: '/sello.png',
    // Su sello es solo texto, sin firma manuscrita: se deja espacio arriba
    // para que ella firme sobre el papel.
    espacioFirma: true,
  },

  // ── Dominio que se imprime en el QR de verificación ──
  // El papel dura años: el QR debe apuntar SIEMPRE al mismo dominio, aunque
  // se imprima desde otra URL. Vacío = usa el dominio actual.
  // Poner el dominio final ANTES de que empiece a entregar récipes.
  urlPublica: 'https://ruth-doctorhub.vercel.app',

  // ── Dónde atiende (aparece al pie de los documentos impresos) ──
  // PENDIENTE de confirmar la dirección con ella.
  consultorio: 'Puerto Cabello',
}

// ── Terminología: cómo se llama a las personas atendidas ──
// Atiende niños y adolescentes de ambos sexos, por eso el género genérico.
const persona = 'paciente'
const genero = 'm' // 'f' → "paciente registrada" · 'm' → "paciente registrado"

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export const TERM = {
  s: persona,             // paciente
  p: persona + 's',       // pacientes
  S: cap(persona),        // Paciente
  P: cap(persona) + 's',  // Pacientes
  o: genero === 'f' ? 'a' : 'o',        // sufijo: registrad{o}s, tod{o}s
  un: genero === 'f' ? 'una' : 'un',    // "Selecciona {un} {s}"
  Nueva: genero === 'f' ? 'Nueva' : 'Nuevo', // título "Nuevo Paciente"
}
