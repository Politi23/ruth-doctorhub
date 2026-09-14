import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

const Dashboard       = lazy(() => import('./pages/Dashboard'))
const Pacientes       = lazy(() => import('./pages/Pacientes'))
const NuevaPaciente   = lazy(() => import('./pages/NuevaPaciente'))
const DetallePaciente = lazy(() => import('./pages/DetallePaciente'))
const HistorialMedico = lazy(() => import('./pages/HistorialMedico'))
const InformeMedico   = lazy(() => import('./pages/InformeMedico'))
const Ingresos        = lazy(() => import('./pages/Ingresos'))
const NuevoIngreso    = lazy(() => import('./pages/NuevoIngreso'))
const Citas           = lazy(() => import('./pages/Citas'))
const NuevaCita       = lazy(() => import('./pages/NuevaCita'))
const Tasa            = lazy(() => import('./pages/Tasa'))
const Egresos         = lazy(() => import('./pages/Egresos'))
const NuevoEgreso     = lazy(() => import('./pages/NuevoEgreso'))
const Estadisticas    = lazy(() => import('./pages/Estadisticas'))
const Seguimiento     = lazy(() => import('./pages/Seguimiento'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="pacientes/nueva" element={<NuevaPaciente />} />
            <Route path="pacientes/:id" element={<DetallePaciente />} />
            <Route path="pacientes/:id/editar" element={<NuevaPaciente />} />
            <Route path="pacientes/:id/historial" element={<HistorialMedico />} />
            <Route path="pacientes/:id/informes" element={<InformeMedico />} />
            <Route path="ingresos" element={<Ingresos />} />
            <Route path="ingresos/nuevo" element={<NuevoIngreso />} />
            <Route path="ingresos/:id/editar" element={<NuevoIngreso />} />
            <Route path="citas" element={<Citas />} />
            <Route path="citas/nueva" element={<NuevaCita />} />
            <Route path="citas/:id/editar" element={<NuevaCita />} />
            <Route path="egresos" element={<Egresos />} />
            <Route path="egresos/nuevo" element={<NuevoEgreso />} />
            <Route path="egresos/:id/editar" element={<NuevoEgreso />} />
            <Route path="tasa" element={<Tasa />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="seguimiento" element={<Seguimiento />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
