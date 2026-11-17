'use client'

/**
 * Tu panel (mauricio-ayllon.com/panel): la única puerta de todo tu sistema.
 * Arriba, cuatro pestañas: Mi negocio (tu panel de trabajo), Calculadoras, Links y Mapa.
 * La dirección dice dónde estás: #negocio/ventas, #calculadoras/oferta, #links/propuesta, #mapa.
 * Lo que está en cada pestaña sale de catalogo.ts.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import s from './tu-panel.module.css'
import Icono from './Iconos'
import Entrar from './Entrar'
import MiNegocio from './MiNegocio'
import Calculadoras from './Calculadoras'
import Links from './Links'
import Mapa from './Mapa'
import { AREAS, type AreaId, type PanelCliente } from './catalogo'
import { CLAVE_LS, guardarLocal, leerLocal, leerRuta } from './utiles'

/** La primera vez se abre el Mapa, para que veas cómo quedó ordenado todo. Después, Mi negocio. */
const VISTO = 'tu-panel-visto'

type Ruta = { area: AreaId; resto: string }

export default function TuPanel({ clientes }: { clientes: PanelCliente[] }) {
  // undefined = todavía no se leyó este aparato (evita que la entrada parpadee)
  const [clave, setClave] = useState<string | null | undefined>(undefined)
  const [ruta, setRuta] = useState<Ruta>({ area: 'negocio', resto: '' })
  const [pedido, setPedido] = useState(0)
  const [abiertas, setAbiertas] = useState<AreaId[]>([])
  const [aviso, setAviso] = useState<{ texto: string; error: boolean; n: number } | null>(null)
  const porDefecto = useRef<AreaId | null>(null)

  useEffect(() => {
    setClave(leerLocal(CLAVE_LS))
    if (!porDefecto.current) {
      porDefecto.current = leerLocal(VISTO) ? 'negocio' : 'mapa'
      guardarLocal(VISTO, '1')
    }
    const leer = () => {
      setRuta(leerRuta(location.hash, porDefecto.current ?? 'negocio'))
      setPedido((p) => p + 1)
    }
    leer()
    // Si sales desde Mi negocio (o desde otra pestaña del navegador), aquí también se cierra.
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE_LS || e.key === null) setClave(leerLocal(CLAVE_LS))
    }
    window.addEventListener('hashchange', leer)
    window.addEventListener('storage', alCambiar)
    return () => {
      window.removeEventListener('hashchange', leer)
      window.removeEventListener('storage', alCambiar)
    }
  }, [])

  // Cada pestaña se arma la primera vez que la abres y después queda viva por detrás (no pierdes lo que hacías).
  useEffect(() => {
    if (!clave) setAbiertas([])
    else setAbiertas((l) => (l.includes(ruta.area) ? l : [...l, ruta.area]))
  }, [ruta.area, clave])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3200)
    return () => clearTimeout(t)
  }, [aviso])

  const avisar = useCallback((texto: string, error = false) => setAviso({ texto, error, n: Date.now() }), [])
  const salir = useCallback(() => {
    guardarLocal(CLAVE_LS, null)
    setClave(null)
  }, [])

  if (clave === undefined) return <div className={`${s.raiz} ${s.login}`} />
  if (!clave)
    return (
      <div className={s.raiz}>
        <Entrar alEntrar={setClave} />
      </div>
    )

  const abierta = (a: AreaId) => abiertas.includes(a) || ruta.area === a
  const en = (a: AreaId) => ruta.area === a
  return (
    <div className={s.raiz}>
      <div className={s.app}>
        <header className={s.barra}>
          <a className={s.marca} href="#negocio/inicio" title="Ir a Hoy">
            <span className={s.logo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/grow-business-logo.png" alt="Grow Business" />
            </span>
            <div>
              <b>Grow Business</b>
              <small>Tu panel</small>
            </div>
          </a>
          <nav className={s.pestanas} aria-label="Tu panel">
            {AREAS.map((a) => (
              <a key={a.id} className={s.pestana} href={'#' + a.id} aria-current={en(a.id) ? 'page' : undefined} title={a.para}>
                <Icono n={a.icono} />
                <span className={s.largo}>{a.nombre}</span>
                <span className={s.corto}>{a.corto}</span>
              </a>
            ))}
          </nav>
          <button className={s.salir} type="button" onClick={salir}>
            <Icono n="salir" t={16} />
            Salir
          </button>
        </header>

        <main className={s.zona}>
          {abierta('negocio') && <MiNegocio ruta={en('negocio') ? ruta.resto : ''} pedido={pedido} visible={en('negocio')} />}
          {abierta('calculadoras') && <Calculadoras abierta={en('calculadoras') ? ruta.resto : ''} visible={en('calculadoras')} />}
          {abierta('links') && (
            <Links clientes={clientes} abierto={en('links') ? ruta.resto : ''} visible={en('links')} clave={clave} avisar={avisar} alFallarClave={salir} />
          )}
          {en('mapa') && <Mapa clientes={clientes} salir={salir} />}
        </main>
      </div>

      <div className={`${s.toast} ${aviso ? s.toastVer : ''}`} role="status" aria-live="polite" style={aviso?.error ? { background: 'var(--coral-ink)' } : undefined}>
        {aviso && (
          <>
            <Icono n={aviso.error ? 'x' : 'check'} />
            {aviso.texto}
          </>
        )}
      </div>
    </div>
  )
}
