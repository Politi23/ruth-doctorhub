import { NEGOCIO } from '../config/negocio'

// Pantalla que sale cuando la app corre sin credenciales de Supabase.
// Antes esto era una pantalla en blanco sin ninguna explicación.
export default function FaltaConfig() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 -z-20 bg-mesh" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      <div className="w-full max-w-sm space-y-5 text-center">
        <img src="/logo-login.png" alt={NEGOCIO.nombreApp}
             className="w-24 h-24 mx-auto object-contain opacity-70" />
        <h1 className="text-white text-xl font-bold">Falta conectar la base de datos</h1>

        <div className="glass-card space-y-3 text-left">
          <p className="text-white/60 text-sm leading-relaxed">
            La app no tiene las credenciales de Supabase, así que no puede cargar ni guardar nada.
          </p>
          <div className="rounded-2xl px-3 py-3 space-y-1"
               style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <p className="text-white/40 text-xs">Crea un archivo <span className="font-mono text-white/70">.env</span> con:</p>
            <p className="text-violet-200 text-xs font-mono break-all">VITE_SUPABASE_URL=...</p>
            <p className="text-violet-200 text-xs font-mono break-all">VITE_SUPABASE_ANON_KEY=...</p>
          </div>
          <p className="text-white/45 text-sm leading-relaxed">
            Para ver la app funcionando sin base de datos, con pacientes de ejemplo:
          </p>
          <p className="text-violet-200 text-sm font-mono">npm run demo</p>
        </div>
      </div>
    </div>
  )
}
