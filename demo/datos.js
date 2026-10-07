// Datos de ejemplo del modo demo. Solo se usan con `npm run demo`:
// nada de esto entra en la app de producción.

const hoy = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const diasAtras = (n) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return iso(d) }
const diasAdelante = (n) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return iso(d) }
const L = String.fromCharCode(10)

export const PACIENTES = [
  { id: 'p1', nombre: 'Santiago', apellido: 'Herrera Méndez', cedula: 'V-32145678', telefono: '0414-1234567', created_at: '2025-03-04T10:00:00Z' },
  { id: 'p2', nombre: 'Valentina', apellido: 'Rojas Pérez',   cedula: 'V-33987654', telefono: '0412-7654321', created_at: '2025-06-18T10:00:00Z' },
  { id: 'p3', nombre: 'Mateo',     apellido: 'Guevara Silva', cedula: 'V-34561234', telefono: '0424-9871234', created_at: '2026-01-22T10:00:00Z' },
]

export const HISTORIALES = [
  {
    id: 'h1', paciente_id: 'p1', fecha_nacimiento: '2014-05-22', sexo: 'M',
    representante_nombre: 'Carolina Méndez', representante_cedula: 'V-16789012', representante_telefono: '0412-9876543',
    motivo_consulta: 'Talla por debajo de sus compañeros de clase. La madre refiere que dejó de crecer al ritmo habitual en el último año.',
    antecedentes_personales: 'Embarazo y parto sin complicaciones. Peso al nacer 3.1 Kg, talla 49 cm. Sin hospitalizaciones previas.',
    antecedentes_familiares: 'Padre 168 cm, madre 155 cm. Abuelo materno con pubertad tardía.',
    talla_padre: 168, talla_madre: 155,
    examen_fisico: 'Buen estado general, hidratado, afebril. Cuello sin bocio palpable. No acantosis nigricans. Tanner I.',
    examenes_laboratorio: ['TSH 2.1 uUI/mL (normal)', 'T4 libre 1.1 ng/dL (normal)', 'IGF-1 pendiente'].join(L),
    tratamiento: 'Vitamina D3 1000 UI diarias. Refuerzo de aporte proteico.',
    created_at: '2025-03-04T10:00:00Z',
  },
  {
    id: 'h2', paciente_id: 'p2', fecha_nacimiento: '2016-11-08', sexo: 'F',
    representante_nombre: 'Andreína Pérez', representante_cedula: 'V-18234567', representante_telefono: '0416-3334455',
    motivo_consulta: 'Control de crecimiento por antecedente familiar de talla baja.',
    antecedentes_personales: 'Sin antecedentes de importancia.',
    antecedentes_familiares: 'Padre 175 cm, madre 162 cm.',
    talla_padre: 175, talla_madre: 162,
    examen_fisico: 'Buen estado general. Desarrollo acorde a la edad. Tanner I.',
    examenes_laboratorio: '', tratamiento: '',
    created_at: '2025-06-18T10:00:00Z',
  },
]

export const MEDIDAS = [
  { id: 'm1', paciente_id: 'p1', fecha: '2023-09-10', peso: 21.0, talla: 113 },
  { id: 'm2', paciente_id: 'p1', fecha: '2024-03-14', peso: 23.4, talla: 117 },
  { id: 'm3', paciente_id: 'p1', fecha: '2024-11-02', peso: 26.1, talla: 121 },
  { id: 'm4', paciente_id: 'p1', fecha: '2025-06-18', peso: 29.0, talla: 126 },
  { id: 'm5', paciente_id: 'p1', fecha: diasAtras(20), peso: 32.4, talla: 131 },
  { id: 'm6', paciente_id: 'p2', fecha: '2025-06-18', peso: 24.5, talla: 122 },
  { id: 'm7', paciente_id: 'p2', fecha: diasAtras(35), peso: 27.2, talla: 128 },
]

export const INFORMES = [
  {
    id: 'i1', paciente_id: 'p1', fecha: diasAtras(20), codigo: 'c4d7e91a',
    examen_fisico: 'Peso: 32.4 Kg. Talla: 131 cm. IMC: 18.9. Tanner I.',
    examenes_laboratorio: ['TSH 2.1 uUI/mL (normal)', 'T4 libre 1.1 ng/dL (normal)', 'IGF-1 pendiente'].join(L),
    diagnostico: ['Talla baja familiar', 'Retraso constitucional del crecimiento'].join(L),
    tratamiento: 'Vitamina D3 1000 UI diarias.',
    plan_trabajo: ['Edad ósea.', 'IGF-1 e IGFBP-3.', 'Control en 4 meses con nueva talla.'].join(L),
    created_at: new Date().toISOString(),
  },
]

export const RECIPES = [
  {
    id: 'r1', paciente_id: 'p1', fecha: diasAtras(20), codigo: 'a7b2f30d',
    paciente_nombre: 'Santiago Herrera Méndez', paciente_cedula: 'V-32145678', paciente_nacimiento: '2014-05-22',
    medicamentos: [
      { nombre: 'Vitamina D3 1000 UI — gotas', indicaciones: '10 gotas diarias con el desayuno.' },
      { nombre: 'Carbonato de calcio 500 mg — 30 tabletas', indicaciones: '1 tableta después de la cena.' },
    ],
    indicaciones_generales: ['Dieta rica en proteínas y lácteos.', 'Actividad física 1 hora diaria.'].join(L),
    created_at: new Date().toISOString(),
  },
]

export const CITAS = [
  { id: 'c1', paciente_id: 'p1', paciente_nombre: 'Santiago Herrera Méndez', fecha: iso(hoy),          hora: '09:00', motivo: 'Control', estado: 'pendiente', notas: '' },
  { id: 'c2', paciente_id: 'p2', paciente_nombre: 'Valentina Rojas Pérez',   fecha: iso(hoy),          hora: '10:30', motivo: 'Evaluación de crecimiento', estado: 'atendida', notas: '' },
  { id: 'c3', paciente_id: 'p3', paciente_nombre: 'Mateo Guevara Silva',     fecha: diasAdelante(2),   hora: '11:00', motivo: 'Primera consulta', estado: 'pendiente', notas: '' },
  { id: 'c4', paciente_id: 'p1', paciente_nombre: 'Santiago Herrera Méndez', fecha: diasAdelante(9),   hora: '08:30', motivo: 'Revisión de exámenes', estado: 'pendiente', notas: '' },
]

export const INGRESOS = [
  { id: 'g1', paciente_id: 'p2', paciente_nombre: 'Valentina Rojas Pérez',   fecha: iso(hoy),        concepto: 'Evaluación de crecimiento', monto: 35,   moneda: 'USD', metodo_pago: 'Efectivo USD', tasa_bcv: null, created_at: new Date().toISOString() },
  { id: 'g2', paciente_id: 'p1', paciente_nombre: 'Santiago Herrera Méndez', fecha: diasAtras(20),   concepto: 'Control',                   monto: 1400, moneda: 'Bs',  metodo_pago: 'Pago Móvil',  tasa_bcv: 40, created_at: new Date().toISOString() },
  { id: 'g3', paciente_id: 'p3', paciente_nombre: 'Mateo Guevara Silva',     fecha: diasAtras(40),   concepto: 'Primera consulta',          monto: 45,   moneda: 'USD', metodo_pago: 'Zelle',       tasa_bcv: null, created_at: new Date().toISOString() },
  { id: 'g4', paciente_id: 'p2', paciente_nombre: 'Valentina Rojas Pérez',   fecha: diasAtras(70),   concepto: 'Control',                   monto: 1200, moneda: 'Bs',  metodo_pago: 'Transferencia', tasa_bcv: 38, created_at: new Date().toISOString() },
]

export const EGRESOS = [
  { id: 'e1', fecha: diasAtras(5),  categoria: 'Alquiler consultorio', descripcion: 'Mensualidad', monto: 150, moneda: 'USD', notas: '', created_at: new Date().toISOString() },
  { id: 'e2', fecha: diasAtras(12), categoria: 'Suministros médicos',  descripcion: 'Tallímetro',  monto: 60,  moneda: 'USD', notas: '', created_at: new Date().toISOString() },
]
