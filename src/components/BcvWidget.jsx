import { RefreshCw } from 'lucide-react'
import { useBcv } from '../hooks/useBcv'

function formatBs(valor) {
  if (valor == null || valor === false || valor === '') return '—'
  return valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function formatHora(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' })
}

export default function BcvWidget() {
  const { data, loading, error, refetch } = useBcv()

  return (
    <div className="glass-card space-y-3">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-white font-semibold text-sm">Tasa BCV</span>
          {data?.fecha && (
            <p className="text-white/40 text-xs mt-0.5">{data.fecha}</p>
          )}
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="glass-btn-icon w-9 h-9 flex items-center justify-center"
        >
          <RefreshCw
            size={15}
            className={`text-white ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Error */}
      {error && !data && (
        <p className="text-red-400/80 text-xs text-center py-2">
          No se pudo obtener la tasa · {error}
        </p>
      )}

      {/* Skeleton mientras carga por primera vez */}
      {loading && !data && (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map(i => (
            <div key={i} className="rounded-2xl p-4 text-center animate-pulse"
                 style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)'}}>
              <div className="h-3 w-10 rounded mx-auto mb-2" style={{background:'rgba(255,255,255,0.15)'}} />
              <div className="h-6 w-20 rounded mx-auto" style={{background:'rgba(255,255,255,0.12)'}} />
            </div>
          ))}
        </div>
      )}

      {/* Tasas */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center"
               style={{background:'rgba(52,211,153,0.10)', border:'1px solid rgba(52,211,153,0.20)'}}>
            <p className="text-xs text-emerald-300/70 font-semibold mb-1">USD</p>
            <p className="text-xl font-bold text-emerald-300">
              {formatBs(data.usd)}
            </p>
            <p className="text-emerald-300/50 text-[10px] mt-0.5">Bs. por $</p>
          </div>
          <div className="rounded-2xl p-4 text-center"
               style={{background:'rgba(251,191,36,0.10)', border:'1px solid rgba(251,191,36,0.20)'}}>
            <p className="text-xs text-amber-300/70 font-semibold mb-1">EUR</p>
            <p className="text-xl font-bold text-amber-300">
              {formatBs(data.eur)}
            </p>
            <p className="text-amber-300/50 text-[10px] mt-0.5">Bs. por €</p>
          </div>
        </div>
      )}

      {/* Pie: última actualización */}
      {data && (
        <p className="text-white/25 text-[10px] text-center">
          {data.stale ? '⚠ Datos desactualizados · ' : data.cached ? 'En caché · ' : 'Actualizado · '}
          {formatHora(data.fetchedAt)}
        </p>
      )}
    </div>
  )
}
