import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import App from './App'
import Login from './pages/Login'
import VerificarDocumento from './pages/VerificarDocumento'
import LoadingScreen from './components/LoadingScreen'
import FaltaConfig from './components/FaltaConfig'
import { supabaseListo } from './lib/supabase'
import './index.css'

// La verificacion de documentos es publica: se atiende antes del login y sin
// montar AppProvider, para que nadie tenga que iniciar sesion ni se carguen
// los datos del consultorio en una pagina que puede ver cualquiera.
const esVerificacion = window.location.pathname.startsWith('/verificar')

function Root() {
  if (!supabaseListo) return <FaltaConfig />
  const { autenticado, cargando } = useAuth()
  const { loading, error } = useApp()
  if (cargando) return <LoadingScreen />
  if (!autenticado) return <Login />
  if (loading || error) return <LoadingScreen error={error} />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {esVerificacion ? (
      <VerificarDocumento />
    ) : (
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Root />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    )}
  </React.StrictMode>
)
