import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { TERM } from '../config/negocio'

const PREFIJOS = [
  { valor: '0412', label: '0412 · Digitel' },
  { valor: '0422', label: '0422 · Digitel' },
  { valor: '0414', label: '0414 · Movilnet' },
  { valor: '0416', label: '0416 · Movilnet' },
  { valor: '0424', label: '0424 · Movistar' },
  { valor: '0426', label: '0426 · Movistar' },
]
const FORM_INICIAL = { nombre: '', apellido: '', cedula_tipo: 'V', cedula_num: '', tel_prefijo: '0414', tel_num: '' }
const DRAFT_KEY = 'draft_nueva_paciente'

function validarNombre(v) {
  if (!v.trim()) return 'Requerido'
  if (v.trim().length < 2) return 'Mínimo 2 caracteres'
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(v.trim())) return 'Solo letras'
  return ''
}
function validarCedulaNum(v) {
  if (!v.trim()) return '' // opcional
  if (!/^\d+$/.test(v.trim())) return 'Solo números'
  const n = v.trim()
  if (n.length < 7 || n.length > 8) return '7 a 8 dígitos'
  return ''
}
function validarTelNum(v) {
  if (!v.trim()) return '' // opcional
  const solo = v.replace(/\D/g, '')
  if (solo.length !== 7) return '7 dígitos restantes'
  return ''
}

export default function NuevaPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pacientes, agregarPaciente, actualizarPaciente } = useApp()
  const toast = useToast()
  const [form, setForm] = useState(() => {
    if (!id) {
      try {
        const saved = sessionStorage.getItem(DRAFT_KEY)
        if (saved) return { ...FORM_INICIAL, ...JSON.parse(saved) }
      } catch {}
    }
    return FORM_INICIAL
  })
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [errorGuardar, setErrorGuardar] = useState('')
  const [guardando, setGuardando] = useState(false)
  const esEdicion = Boolean(id)

  useEffect(() => {
    if (!esEdicion) {
      try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)) } catch {}
    }
  }, [form, esEdicion])

  useEffect(() => {
    if (esEdicion) {
      const p = pacientes.find(p => p.id === id)
      if (p) {
        const [tipo, num] = p.cedula?.split('-') || ['V', '']
        const tel = p.telefono || ''
        const prefijo = PREFIJOS.find(pr => tel.startsWith(pr.valor))?.valor || '0414'
        const telNum = tel.replace(/\D/g, '').slice(4)
        setForm({ nombre: p.nombre||'', apellido: p.apellido||'', cedula_tipo: tipo||'V', cedula_num: num||'', tel_prefijo: prefijo, tel_num: telNum })
      }
    }
  }, [id, esEdicion, pacientes])

  const validarCampo = (c, v, tipo) => {
    if (c === 'nombre' || c === 'apellido') return validarNombre(v)
    if (c === 'cedula_num') return validarCedulaNum(v)
    if (c === 'tel_num') return validarTelNum(v)
    return ''
  }
  const set = (c, v) => {
    setForm(prev => ({ ...prev, [c]: v }))
    if (tocados[c]) setErrores(prev => ({ ...prev, [c]: validarCampo(c, v) }))
  }
  const tocar = (c) => {
    setTocados(prev => ({ ...prev, [c]: true }))
    setErrores(prev => ({ ...prev, [c]: validarCampo(c, form[c]) }))
  }
  const onPasteTel = (e) => {
    const texto = e.clipboardData.getData('text')
    const soloDigitos = texto.replace(/\D/g, '')
    let prefijo = null, numero = null
    if (soloDigitos.startsWith('58') && soloDigitos.length === 12) {
      prefijo = '0' + soloDigitos.slice(2, 5)
      numero = soloDigitos.slice(5)
    } else if (soloDigitos.startsWith('0') && soloDigitos.length === 11) {
      prefijo = soloDigitos.slice(0, 4)
      numero = soloDigitos.slice(4)
    }
    const prefijoValido = PREFIJOS.find(p => p.valor === prefijo)
    if (prefijoValido && numero && numero.length === 7) {
      e.preventDefault()
      setForm(prev => ({ ...prev, tel_prefijo: prefijo, tel_num: numero }))
      if (tocados.tel_num) setErrores(prev => ({ ...prev, tel_num: validarTelNum(numero) }))
    }
  }

  const setCedulaTipo = (tipo) => {
    setForm(prev => ({ ...prev, cedula_tipo: tipo }))
    if (tocados.cedula_num) setErrores(prev => ({ ...prev, cedula_num: validarCedulaNum(form.cedula_num) }))
  }
  const guardar = async () => {
    const campos = ['nombre', 'apellido', 'tel_num']
    const e = Object.fromEntries(campos.map(c => [c, validarCampo(c, form[c])]))
    if (form.cedula_num.trim()) e.cedula_num = validarCedulaNum(form.cedula_num)
    const camposTocados = [...campos, ...(form.cedula_num.trim() ? ['cedula_num'] : [])]
    setErrores(e); setTocados(Object.fromEntries(camposTocados.map(c => [c, true])))
    if (Object.values(e).some(v => v)) return
    const telefono = form.tel_num.trim() ? `${form.tel_prefijo}-${form.tel_num.replace(/\D/g, '')}` : null
    const cedula = form.cedula_num.trim() ? `${form.cedula_tipo}-${form.cedula_num.trim()}` : null
    const datos = { nombre: form.nombre.trim(), apellido: form.apellido.trim(), cedula, telefono }
    setGuardando(true)
    try {
      if (esEdicion) {
        await actualizarPaciente(id, datos)
        toast('Cambios guardados', 'success')
        navigate(`/pacientes/${id}`)
      } else {
        await agregarPaciente(datos)
        try { sessionStorage.removeItem(DRAFT_KEY) } catch {}
        toast(`${TERM.S} registrad${TERM.o}`, 'success')
        navigate('/pacientes')
      }
    } catch (err) {
      setErrorGuardar(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const err = (c) => errores[c] && tocados[c]
  const cls = (c) => `glass-input${err(c) ? ' error' : ''}`

  return (
    <div className="min-h-screen">
      <PageHeader title={esEdicion ? `Editar ${TERM.S}` : `${TERM.Nueva} ${TERM.S}`} back />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="glass-card space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="glass-label">Nombre *</label>
              <input className={cls('nombre')} value={form.nombre} onChange={e => set('nombre', e.target.value.replace(/[0-9]/g, ''))} onBlur={() => tocar('nombre')} placeholder="Carmen" maxLength={50} />
              {err('nombre') && <p className="text-red-400 text-xs mt-1">{errores.nombre}</p>}
            </div>
            <div>
              <label className="glass-label">Apellido *</label>
              <input className={cls('apellido')} value={form.apellido} onChange={e => set('apellido', e.target.value.replace(/[0-9]/g, ''))} onBlur={() => tocar('apellido')} placeholder="González" maxLength={50} />
              {err('apellido') && <p className="text-red-400 text-xs mt-1">{errores.apellido}</p>}
            </div>
          </div>

          <div>
            <label className="glass-label">Cédula <span className="text-white/35 font-normal">(opcional)</span></label>
            <div className="flex gap-2">
              <select className="glass-input" style={{width:'76px', flexShrink:0}} value={form.cedula_tipo} onChange={e => setCedulaTipo(e.target.value)}>
                <option value="V">V-</option>
                <option value="E">E-</option>
              </select>
              <input inputMode="numeric" className={`glass-input flex-1${err('cedula_num') ? ' error' : ''}`} value={form.cedula_num} onChange={e => set('cedula_num', e.target.value.replace(/\D/g,'').slice(0,8))} onBlur={() => tocar('cedula_num')} placeholder="12345678" maxLength={8} />
            </div>
            {err('cedula_num') && <p className="text-red-400 text-xs mt-1">{errores.cedula_num}</p>}
          </div>

          <div>
            <label className="glass-label">Teléfono / WhatsApp <span className="text-white/35 font-normal">(opcional)</span></label>
            <div className="flex gap-2">
              <select
                className="glass-input"
                style={{width:'150px', flexShrink:0}}
                value={form.tel_prefijo}
                onChange={e => set('tel_prefijo', e.target.value)}
              >
                {PREFIJOS.map(p => (
                  <option key={p.valor} value={p.valor}>{p.label}</option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                className={`glass-input flex-1${err('tel_num') ? ' error' : ''}`}
                value={form.tel_num}
                onChange={e => set('tel_num', e.target.value.replace(/\D/g,'').slice(0,7))}
                onBlur={() => tocar('tel_num')}
                onPaste={onPasteTel}
                placeholder="1234567"
                maxLength={7}
              />
            </div>
            {err('tel_num') && <p className="text-red-400 text-xs mt-1">{errores.tel_num}</p>}
            {!err('tel_num') && form.tel_num.replace(/\D/g,'').length === 7 && (
              <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Válido</p>
            )}
          </div>

        </div>

        {errorGuardar && <p className="text-red-400 text-sm text-center">{errorGuardar}</p>}
        <button onClick={guardar} disabled={guardando} className="glass-btn-primary" style={guardando ? {opacity:0.6} : {}}>
          <Save size={18} />
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : `Registrar ${TERM.s}`}
        </button>
      </div>
    </div>
  )
}
