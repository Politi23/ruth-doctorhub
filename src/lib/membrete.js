// ═══════════════════════════════════════════════════════════════════
//  Membrete común de los documentos impresos.
//  Vive aparte para que las dos hojas salgan idénticas: si cambia el
//  encabezado o el pie, cambia en las dos a la vez.
// ═══════════════════════════════════════════════════════════════════

// Logo de la app en azul, incrustado para que aparezca en la ventana de impresión
export const LOGO_MEMBRETE = 'data:image/png;base64,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'

// Se escriben igual que en su sello: CI: V-24.304.725 · MPPS: 134.225 · CM: 13926
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export function credenciales(med) {
  return [
    med.cedula ? `C.I. V-${miles(med.cedula)}` : '',
    med.mpps ? `MPPS ${miles(med.mpps)}` : '',
    med.cm ? `C.M. ${miles(med.cm)}` : '',
  ].filter(Boolean).join(' &nbsp; ')
}

// Encabezado: logo a la izquierda, datos de la doctora centrados, regla debajo.
export function membrete(med, logo = LOGO_MEMBRETE) {
  return `
    <div class="cab">
      <img class="logo" src="${logo}" alt="">
      <div class="doc">
        <h1>${med.nombre}</h1>
        <p class="esp">${med.especialidad}</p>
        <p class="cred">${credenciales(med)}</p>
        ${med.correo ? `<p class="cred">Correo: ${med.correo}</p>` : ''}
      </div>
      <span class="equilibrio"></span>
    </div>
    <div class="regla"></div>`
}

// Pie: sello escaneado a la izquierda, código validador y QR a la derecha.
// Sin sello configurado deja el espacio para firmar a mano.
export function pieHoja({ med, consultorio = '', qrSvg = '', codigo = '', base = '', conSello = true }) {
  const sello = conSello && med.sello ? `${window.location.origin}${med.sello}` : ''
  const dominio = String(base).replace(/^https?:\/\//, '')

  const validador = codigo ? `
    <div class="validador">
      ${qrSvg ? `<div class="qr">${qrSvg}</div>` : ''}
      <p class="val-cod">Código Validador: <b>${codigo}</b></p>
      <p class="val-url">Verifícalo en ${dominio}/verificar</p>
    </div>` : ''

  return `
    <div class="pie">
      <div class="pie-fila">
        <div class="pie-firma">
          ${sello
            ? `${med.espacioFirma ? '<div class="espacio-firma"></div>' : ''}<img class="sello" src="${sello}" alt="">`
            : `<div class="espacio-firma"></div><p class="firma">${med.nombre}</p>`}
        </div>
        ${validador}
      </div>
      <div class="regla"></div>
      <p class="sede">${consultorio || ''}</p>
    </div>`
}

// Estilos compartidos por las dos hojas.
export const estilosHoja = `
    .cab { display: flex; align-items: center; gap: 8px; }
    .cab .logo { width: 34px; height: 34px; flex-shrink: 0; }
    .cab .equilibrio { width: 34px; flex-shrink: 0; }
    .doc { flex: 1; text-align: center; }
    h1 { font-size: 11pt; margin: 0; color: #5b21b6; }
    .esp { margin: 1px 0 0; font-size: 8.5pt; color: #7c3aed; font-weight: bold; }
    .cred { margin: 1px 0 0; font-size: 7pt; color: #444; }
    .regla { border-top: 2px solid #7c3aed; margin: 7px 0; }
    .pie { margin-top: auto; padding-top: 10px; }
    .pie-fila { display: flex; align-items: flex-end; justify-content: space-between; gap: 4mm; }
    .pie-firma { min-width: 0; flex: 1; }
    .validador { flex-shrink: 0; width: 34mm; text-align: center; }
    .validador .qr { width: 26mm; height: 26mm; margin: 0 auto; }
    .validador .qr svg { width: 100%; height: 100%; display: block; shape-rendering: crispEdges; }
    .val-cod { margin: 1mm 0 0; font-size: 6pt; color: #111; white-space: nowrap; }
    .val-url { margin: 0.5mm 0 0; font-size: 5pt; color: #666; line-height: 1.25; word-break: break-word; }
    .sello { display: block; width: 52mm; height: auto; margin: 0 0 2px; }
    .espacio-firma { height: 16mm; }
    .firma { margin: 0 0 2px; font-size: 8.5pt; font-weight: bold; color: #5b21b6; }
    .sede { margin: 3px 0 0; font-size: 7.5pt; color: #444; }`
