'use client'

import { useEffect, useRef, useState } from 'react'
import s from './tu-panel.module.css'

/**
 * Mi negocio: tu panel de trabajo (public/panel/admin.html) dentro de Tu panel.
 *
 * Ese archivo lo publica el publicador de tu compu, así que aquí NO se cambia. Solo se le ponen retoques de vista
 * al abrirlo y se usan sus propios botones:
 * - No repetir tu logo (ya está en la barra de arriba).
 * - Modo simple: se esconde su menú largo (.lado) y sus barras del celular (.movil-top, .movil-nav): el menú corto
 *   de Tu panel las reemplaza. Lo de adentro de cada pantalla queda igual.
 * - «＋ Anotar» toca su botón «Anotar» (data-accion="mas-rapido") y «Modo noche» toca el suyo (data-accion="tema").
 * - Se recuerda en qué pantalla estás (#negocio/ventas), para que al recargar vuelvas al mismo lugar.
 * Si algún día admin.html cambia esos nombres, lo peor que pasa es que vuelve a verse su menú (nada se rompe).
 */
const RETOQUES = `
/* Lo pone Tu panel (src/features/tu-panel/MiNegocio.tsx): la marca ya está en la barra de arriba. */
.lado-marca { display: none !important; }
.movil-top .logo-gb { display: none !important; }
/* Modo simple de Tu panel: su menú corto reemplaza al de aquí. */
html.tp-simple .app { grid-template-columns: minmax(0, 1fr) !important; }
html.tp-simple .lado, html.tp-simple .movil-top, html.tp-simple .movil-nav { display: none !important; }
/* Lo que flota se acomoda: ya no hay menú a la izquierda ni barras propias en el celular. */
html.tp-simple .capas { left: 20px; }
@media (max-width: 900px) {
  html.tp-simple .capas { left: 10px; bottom: 10px; }
  html.tp-simple .idea-flota { bottom: 16px; }
  html.tp-simple .con-capas .idea-flota { bottom: 66px; }
  html.tp-simple .reloj { top: 8px; }
}
`

/** Lo que Tu panel le pide a Mi negocio: abrir «¿Qué anotas?» o cambiar entre claro y noche. `n` cambia en cada pedido. */
export type PedidoNegocio = { que: 'anotar' | 'tema'; n: number } | null

type Props = {
  ruta: string
  pedido: number
  visible: boolean
  simple: boolean
  accion: PedidoNegocio
  alCambiarRuta: (ruta: string) => void
  alFallar: (que: 'anotar' | 'tema') => void
}

export default function MiNegocio({ ruta, pedido, visible, simple, accion, alCambiarRuta, alFallar }: Props) {
  const marco = useRef<HTMLIFrameElement>(null)
  const visibleRef = useRef(visible)
  const listoRef = useRef(false)
  const pendiente = useRef('')
  const accionPendiente = useRef<PedidoNegocio>(null)
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
  function documento(): Document | null {
    try {
      return marco.current?.contentDocument ?? null
    } catch {
      return null
    }
  }

  /** Lo que muestra Mi negocio queda en la dirección de arriba (#negocio/<pantalla>) y Tu panel sabe qué pestaña marcar. */
  function reflejar() {
    const w = ventana()
    if (!w || !listoRef.current) return
    let h = ''
    try {
      h = w.location.hash.replace(/^#\/?/, '')
    } catch {
      return
    }
    alCambiarRuta(h)
    if (!visibleRef.current) return
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

  /**
   * Toca el botón de Mi negocio que hace eso mismo (el suyo, con su lógica). Sus botones aparecen cuando terminan
   * de llegar tus datos de la hoja: si todavía no están, se reintenta unos segundos antes de avisar.
   */
  function hacer(a: NonNullable<PedidoNegocio>, intento = 0) {
    if (!listoRef.current) {
      accionPendiente.current = a
      return
    }
    const sel = a.que === 'anotar' ? '[data-accion="mas-rapido"]' : '[data-accion="tema"]'
    const boton = documento()?.querySelector<HTMLElement>(sel)
    if (boton) boton.click()
    else if (intento < 20) setTimeout(() => hacer(a, intento + 1), 400)
    else alFallar(a.que)
  }

  function ponerModo(doc: Document | null) {
    doc?.documentElement.classList.toggle('tp-simple', simple)
  }

  useEffect(() => {
    visibleRef.current = visible
    if (visible) reflejar()
  }, [visible])

  useEffect(() => {
    ponerModo(documento())
  }, [simple])

  // Te traen desde una pestaña, el Mapa o Links: #negocio/caja → la Caja
  useEffect(() => {
    if (ruta) irA(ruta)
  }, [ruta, pedido])

  useEffect(() => {
    if (accion) hacer(accion)
  }, [accion?.n])

  function alCargar() {
    listoRef.current = true
    setListo(true)
    const f = marco.current
    const doc = documento()
    if (doc?.head && !doc.getElementById('tu-panel-retoques')) {
      const st = doc.createElement('style')
      st.id = 'tu-panel-retoques'
      st.textContent = RETOQUES
      doc.head.appendChild(st)
      doc.documentElement.classList.add('en-tu-panel')
    }
    ponerModo(doc)
    f?.contentWindow?.addEventListener('hashchange', reflejar)
    if (pendiente.current) {
      const d = pendiente.current
      pendiente.current = ''
      irA(d)
    }
    reflejar()
    if (accionPendiente.current) {
      const a = accionPendiente.current
      accionPendiente.current = null
      hacer(a)
    }
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
