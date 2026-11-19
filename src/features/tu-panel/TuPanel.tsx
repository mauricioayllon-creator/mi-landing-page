'use client'

/**
 * Tu panel (mauricio-ayllon.com/panel): la única puerta de todo tu sistema. Tiene dos modos:
 * - Simple (el de siempre): seis pestañas (Hoy, Ventas, Clientes, Contenido, Caja, Herramientas), «＋ Anotar» y «Más».
 * - Completo: Mi negocio con su menú largo, Calculadoras, Links y Mapa, como antes.
 * La dirección dice dónde estás: #negocio/ventas, #herramientas, #calculadoras/oferta, #links/propuesta, #mapa.
 * Lo que está en cada pestaña sale de catalogo.ts; las barras y el menú «Más», de Barras.tsx.
 */

import { useCallback, useEffect, useState } from 'react'
import s from './tu-panel.module.css'
import Icono from './Iconos'
import Entrar from './Entrar'
import MiNegocio, { type PedidoNegocio } from './MiNegocio'
import Herramientas from './Herramientas'
import Calculadoras from './Calculadoras'
import Links from './Links'
import Mapa from './Mapa'
import { BarraAbajo, BarraCompleta, BarraSimple, MenuMas, pestanaActiva } from './Barras'
import { AREAS, PESTANAS_SIMPLES, SECCIONES_NEGOCIO, type AreaId, type Modo, type PanelCliente } from './catalogo'
import { CLAVE_LS, MODO_LS, TEMA_LS, esNoche, guardarLocal, leerLocal, leerModo, leerRuta } from './utiles'

type Ruta = { area: AreaId; resto: string }

/** El nombre de lo que estás viendo (arriba, en el celular). */
function tituloDe(area: AreaId, rutaNegocio: string) {
  if (area !== 'negocio') return area === 'herramientas' ? 'Herramientas' : AREAS.find((a) => a.id === area)?.nombre ?? 'Tu panel'
  const pestana = PESTANAS_SIMPLES.find((p) => pestanaActiva(p, area, rutaNegocio))
  if (pestana) return pestana.nombre
  return SECCIONES_NEGOCIO.find((x) => rutaNegocio.startsWith(x.ruta.split('/')[0]))?.nombre ?? 'Mi negocio'
}

export default function TuPanel({ clientes }: { clientes: PanelCliente[] }) {
  // undefined = todavía no se leyó este aparato (evita que la entrada parpadee)
  const [clave, setClave] = useState<string | null | undefined>(undefined)
  const [modo, setModo] = useState<Modo>('simple')
  const [ruta, setRuta] = useState<Ruta>({ area: 'negocio', resto: '' })
  const [pedido, setPedido] = useState(0)
  const [rutaNegocio, setRutaNegocio] = useState('inicio')
  const [abiertas, setAbiertas] = useState<AreaId[]>([])
  const [accion, setAccion] = useState<PedidoNegocio>(null)
  const [mas, setMas] = useState(false)
  const [aviso, setAviso] = useState<{ texto: string; error: boolean; n: number } | null>(null)
  // Claro o noche: lo mismo que eligió en Mi negocio (si lo cambia allá, aquí cambia al instante)
  const [noche, setNoche] = useState(false)

  useEffect(() => {
    setClave(leerLocal(CLAVE_LS))
    setNoche(esNoche())
    setModo(leerModo())
    const leer = () => {
      const r = leerRuta(location.hash, 'negocio')
      setRuta(r)
      setPedido((p) => p + 1)
      // La pestaña se marca al tiro; después Mi negocio dice dónde quedó de verdad
      if (r.area === 'negocio' && r.resto) setRutaNegocio(r.resto)
    }
    leer()
    // Si sales desde Mi negocio (o desde otra pestaña del navegador), aquí también se cierra.
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE_LS || e.key === null) setClave(leerLocal(CLAVE_LS))
      if (e.key === TEMA_LS || e.key === null) setNoche(esNoche())
    }
    const aparato = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null
    const alCambiarAparato = () => setNoche(esNoche())
    aparato?.addEventListener('change', alCambiarAparato)
    window.addEventListener('hashchange', leer)
    window.addEventListener('storage', alCambiar)
    return () => {
      window.removeEventListener('hashchange', leer)
      window.removeEventListener('storage', alCambiar)
      aparato?.removeEventListener('change', alCambiarAparato)
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
    setMas(false)
  }, [])
  const cerrarMas = useCallback(() => setMas(false), [])

  const cambiarModo = useCallback(() => {
    setModo((m) => {
      const nuevo: Modo = m === 'simple' ? 'completo' : 'simple'
      guardarLocal(MODO_LS, nuevo)
      return nuevo
    })
    setMas(false)
  }, [])

  /** «＋ Anotar»: muestra Mi negocio donde estaba y abre su «¿Qué anotas?». */
  const anotar = useCallback(() => {
    if (!location.hash.startsWith('#negocio')) location.hash = '#negocio'
    setAccion({ que: 'anotar', n: Date.now() })
  }, [])

  /** Si Mi negocio no está abierto (o no encontró su botón), el modo se cambia desde aquí. */
  const temaDesdeAqui = useCallback(() => {
    const nueva = !esNoche()
    guardarLocal(TEMA_LS, nueva ? 'noche' : 'claro')
    setNoche(nueva)
    const f = document.querySelector<HTMLIFrameElement>('iframe[title="Mi negocio"]')
    try {
      f?.contentDocument?.documentElement.setAttribute('data-theme', nueva ? 'dark' : 'light')
    } catch {
      /* sin acceso: se verá al recargar */
    }
  }, [])

  const cambiarTema = useCallback(() => {
    // Con Mi negocio abierto se usa su propio botón (guarda «gb-tema» y avisa a todo lo demás)
    if (abiertas.includes('negocio')) setAccion({ que: 'tema', n: Date.now() })
    else temaDesdeAqui()
  }, [abiertas, temaDesdeAqui])

  const alFallar = useCallback(
    (que: 'anotar' | 'tema') => {
      if (que === 'tema') temaDesdeAqui()
      else avisar('No pude abrir «Anotar». Está en Hoy: «Anotar una visita».', true)
    },
    [avisar, temaDesdeAqui],
  )

  const tema = noche ? 'noche' : 'claro'
  if (clave === undefined) return <div className={`${s.raiz} ${s.login}`} data-tema={tema} />
  if (!clave)
    return (
      <div className={s.raiz} data-tema={tema}>
        <Entrar alEntrar={setClave} />
      </div>
    )

  const simple = modo === 'simple'
  const abierta = (a: AreaId) => abiertas.includes(a) || ruta.area === a
  const en = (a: AreaId) => ruta.area === a
  const navegacion = { area: ruta.area, rutaNegocio }
  return (
    <div className={s.raiz} data-tema={tema} data-modo={modo}>
      <div className={s.app}>
        {simple ? (
          <BarraSimple {...navegacion} titulo={tituloDe(navegacion.area, navegacion.rutaNegocio)} anotar={anotar} abrirMas={() => setMas(true)} />
        ) : (
          <BarraCompleta area={ruta.area} alModo={cambiarModo} salir={salir} />
        )}

        <main className={s.zona}>
          {abierta('negocio') && (
            <MiNegocio
              ruta={en('negocio') ? ruta.resto : ''}
              pedido={pedido}
              visible={en('negocio')}
              simple={simple}
              accion={accion}
              alCambiarRuta={setRutaNegocio}
              alFallar={alFallar}
            />
          )}
          {en('herramientas') && <Herramientas />}
          {abierta('calculadoras') && (
            <Calculadoras
              abierta={en('calculadoras') ? ruta.resto : ''}
              visible={en('calculadoras')}
              volver={simple ? '#herramientas' : '#calculadoras'}
              volverTexto={simple ? 'Herramientas' : 'Calculadoras'}
            />
          )}
          {abierta('links') && (
            <Links clientes={clientes} abierto={en('links') ? ruta.resto : ''} visible={en('links')} clave={clave} avisar={avisar} alFallarClave={salir} />
          )}
          {en('mapa') && <Mapa clientes={clientes} salir={salir} modo={modo} alModo={cambiarModo} />}
        </main>

        {simple && <BarraAbajo {...navegacion} anotar={anotar} abrirMas={() => setMas(true)} />}
      </div>

      {mas && <MenuMas cerrar={cerrarMas} noche={noche} cambiarTema={cambiarTema} alModo={cambiarModo} salir={salir} />}

      <div className={`${s.toast} ${aviso ? s.toastVer : ''} ${aviso?.error ? s.toastError : ''}`} role="status" aria-live="polite">
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
