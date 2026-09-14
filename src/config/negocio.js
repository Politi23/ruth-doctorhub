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
  nombreCompleto: 'Dra. Ruth',              // FALTA su nombre completo (reportes y WhatsApp)
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

  // ── Catálogos: servicios de la Dra. Ruth ──
  // PENDIENTE de confirmar con ella.
  motivosCita: ['Primera consulta', 'Control', 'Evaluación de crecimiento', 'Revisión de exámenes', 'Interconsulta'],
  motivosRapidos: ['Primera consulta', 'Control', 'Evaluación de crecimiento', 'Revisión de exámenes'],
  motivoDefault: 'Control',
  conceptosIngreso: ['Primera consulta', 'Control', 'Evaluación de crecimiento', 'Revisión de exámenes', 'Interconsulta'],
  // La primera categoría es la seleccionada por defecto al registrar un egreso
  categoriasEgreso: ['Alquiler consultorio','Electricidad / Agua / Internet','Suministros médicos','Equipos médicos','Personal / Honorarios','Publicidad','Impuestos','Mantenimiento','Transporte','Otro'],

  // ── Mensaje de WhatsApp para reactivar pacientes sin cita reciente ──
  msgSeguimiento: (nombre) =>
    `Hola, le saludamos del consultorio de la Dra. Ruth. Le recordamos que es importante continuar con los controles de ${nombre}. ¿Le gustaría agendar una cita? 😊`,

  // ── Módulos activos ──
  modulos: {
    historial: true,        // historial médico del paciente
    informes: true,         // informe médico imprimible con membrete
    curvaCrecimiento: true, // curva de distancia para uso clínico · talla
  },

  // ── Datos que encabezan el informe médico ──
  // FALTAN: confirmar con ella antes de imprimir nada para pacientes reales.
  medico: {
    nombre: 'Dra. Ruth',
    especialidad: 'Endocrinología Pediátrica',
    cedula: '',
    mpps: '',
    cm: '',
    correo: '',
    // Firma y sello escaneados. Vacío = deja el espacio para firmar a mano.
    sello: '',
  },

  // ── Sedes donde atiende (aparecen al pie del informe) ──
  // PENDIENTE de confirmar con ella.
  sedes: [
    { nombre: 'Consultorio', direccion: 'Puerto Cabello' },
  ],
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
