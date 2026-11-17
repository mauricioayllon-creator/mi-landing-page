'use client'

import { useEffect, useRef, useState } from 'react'
import s from './tu-panel.module.css'

/**
 * Mi negocio: tu panel de trabajo (public/panel/admin.html) dentro de Tu panel.
 *
 * Ese archivo lo publica el publicador de tu compu, así que aquí NO se cambia. Solo se le ponen dos retoques
 * de vista al abrirlo (no repetir tu logo, que ya está en la barra de arriba) y se recuerda en qué pantalla
 * estás (#negocio/ventas), para que al recargar vuelvas al mismo lugar.
 * Si algún día admin.html cambia los nombres .lado-marca o .movil-top, lo peor que pasa es que el logo se ve dos veces.
 */
const RETOQUES = `
/* Lo pone Tu panel (src/features/tu-panel/MiNegocio.tsx): la marca ya está en la barra de arriba. */
.lado-marca { display: none !important; }
.movil-top .logo-gb { display: none !important; }
`

export default function MiNegocio({ ruta, pedido, visible }: { ruta: string; pedido: number; visible: boolean }) {
  const marco = useRef<HTMLIFrameElement>(null)
  const visibleRef = useRef(visible)
  const listoRef = useRef(false)
  const pendiente = useRef('')
  const [src] = useState(() => '/panel/admin.html' + (ruta ? '#/' + ruta : ''))
  const [listo, setListo] = useState(false)

  /** La ventana de adentro (la misma página web, así que se puede leer). */
  function ventana(): Window | null {
    try {
      return marco.current?.contentWindow ?? null
    } catch {
      return null
    }
  }

  /** Lo que muestra Mi negocio queda en la dirección de arriba (#negocio/<pantalla>). */
  function reflejar() {
    const w = ventana()
    if (!w || !visibleRef.current || !listoRef.current) return
    let h = ''
    try {
      h = w.location.hash.replace(/^#\/?/, '')
    } catch {
      return
    }
    const nuevo = '#negocio' + (h ? '/' + h : '')
    if (location.hash !== nuevo) history.replaceState(null, '', nuevo)
  }

  function irA(destino: string) {
    const w = ventana()
    if (!w || !listoRef.current) {
      pendiente.current = destino
      return
    }
    if (w.location.hash !== '#/' + destino) w.location.hash = '#/' + destino
  }

  useEffect(() => {
    visibleRef.current = visible
    if (visible) reflejar()
  }, [visible])

  // Te traen desde el Mapa o desde Links: #negocio/caja → la Caja
  useEffect(() => {
    if (ruta) irA(ruta)
  }, [ruta, pedido])

  function alCargar() {
    listoRef.current = true
    setListo(true)
    const f = marco.current
    let doc: Document | null = null
    try {
      doc = f?.contentDocument ?? null
    } catch {
      doc = null
    }
    if (doc?.head && !doc.getElementById('tu-panel-retoques')) {
      const st = doc.createElement('style')
      st.id = 'tu-panel-retoques'
      st.textContent = RETOQUES
      doc.head.appendChild(st)
      doc.documentElement.classList.add('en-tu-panel')
    }
    f?.contentWindow?.addEventListener('hashchange', reflejar)
    if (pendiente.current) {
      const d = pendiente.current
      pendiente.current = ''
      irA(d)
    }
    reflejar()
  }

  return (
    <div className={visible ? s.capa : s.capaOculta}>
      {!listo && <div className={s.cargando}>Abriendo tu negocio…</div>}
      <iframe
        ref={marco}
        className={s.marco}
        src={src}
        title="Mi negocio"
        allow="clipboard-read; clipboard-write"
        onLoad={alCargar}
      />
    </div>
  )
}
