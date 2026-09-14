import { NEGOCIO } from '../config/negocio'

export default function LoadingScreen({ error }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-8">
      {/* Fondo reutiliza el mismo mesh del Layout */}
      <div className="fixed inset-0 -z-20 bg-mesh" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {error ? (
        <div className="glass-card text-center max-w-xs w-full py-8 space-y-3">
          <p className="text-2xl">⚠️</p>
          <p className="text-white font-bold">Error de conexión</p>
          <p className="text-white/50 text-sm">{error}</p>
          <p className="text-white/35 text-xs">
            Verifica que el archivo <span className="text-white/60 font-mono">.env</span> tenga las credenciales de Supabase.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="glass-btn-primary mt-2"
            style={{padding:'10px 24px', width:'auto'}}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center"
               style={{border:'1px solid rgba(255,255,255,0.25)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.4)'}}>
            <span className="text-white text-2xl font-bold">{NEGOCIO.nombreApp.charAt(0)}</span>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-white font-bold text-lg">{NEGOCIO.nombreApp}</p>
            <p className="text-white/40 text-sm">Cargando datos…</p>
          </div>
          {/* Spinner */}
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </>
      )}
    </div>
  )
}
