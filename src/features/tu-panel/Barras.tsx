'use client'

/**
 * Las barras de Tu panel y el menú «Más».
 * - Modo simple: arriba, seis pestañas + «＋ Anotar» + «Más». En el celular, abajo: Hoy, Ventas, ＋, Clientes y Más.
 * - Modo completo: arriba, Mi negocio, Calculadoras, Links y Mapa (como antes), «Modo simple» y «Salir».
 */

import { useEffect } from 'react'
import s from './tu-panel.module.css'
import Icono from './Iconos'
import { AREAS, PESTANAS_SIMPLES, seccionesDeMas, type AreaId, type PestanaSimple } from './catalogo'

/** ¿Esta pestaña del modo simple es la de la pantalla que estás viendo? */
export function pestanaActiva(p: PestanaSimple, area: AreaId, rutaNegocio: string) {
  if (Array.isArray(p.activa)) return p.activa.includes(area)
  return area === 'negocio' && p.activa.test(rutaNegocio)
}

function Marca({ compacta }: { compacta?: boolean }) {
  return (
    <a className={`${s.marca} ${compacta ? s.marcaCompacta : ''}`} href="#negocio/inicio" title="Ir a Hoy">
      <span className={s.logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/grow-business-logo.png" alt="Grow Business" />
      </span>
      <div>
        <b>Grow Business</b>
        <small>Tu panel</small>
      </div>
    </a>
  )
}

type Navegacion = { area: AreaId; rutaNegocio: string }

export function BarraSimple({ area, rutaNegocio, titulo, anotar, abrirMas }: Navegacion & { titulo: string; anotar: () => void; abrirMas: () => void }) {
  return (
    <header className={s.barra}>
      <Marca compacta />
      <b className={s.tituloMovil}>{titulo}</b>
      <nav className={`${s.pestanas} ${s.soloCompu}`} aria-label="Tu panel">
        {PESTANAS_SIMPLES.map((p) => (
          <a key={p.id} className={s.pestana} href={p.href} aria-current={pestanaActiva(p, area, rutaNegocio) ? 'page' : undefined} title={p.para}>
            <Icono n={p.icono} />
            {p.nombre}
          </a>
        ))}
      </nav>
      <button className={`${s.anotar} ${s.soloCompu}`} type="button" onClick={anotar} title="Un lead, una visita, un cliente nuevo o una idea">
        <Icono n="mas" t={17} />
        Anotar
      </button>
      <button className={`${s.salir} ${s.soloCompu}`} type="button" onClick={abrirMas} aria-haspopup="dialog">
        <Icono n="puntos" t={17} />
        Más
      </button>
    </header>
  )
}

/** En el celular, abajo (como en tu panel de trabajo): Hoy, Ventas, ＋ Anotar, Clientes y Más. */
export function BarraAbajo({ area, rutaNegocio, anotar, abrirMas }: Navegacion & { anotar: () => void; abrirMas: () => void }) {
  const [hoy, ventas, clientes] = PESTANAS_SIMPLES
  const item = (p: PestanaSimple) => (
    <a className={s.abajoItem} href={p.href} aria-current={pestanaActiva(p, area, rutaNegocio) ? 'page' : undefined}>
      <Icono n={p.icono} t={22} />
      {p.nombre}
    </a>
  )
  return (
    <nav className={s.abajo} aria-label="Tu panel">
      {item(hoy)}
      {item(ventas)}
      <button className={`${s.abajoItem} ${s.abajoMas}`} type="button" onClick={anotar}>
        <Icono n="mas" t={22} />
        Anotar
      </button>
      {item(clientes)}
      <button className={s.abajoItem} type="button" onClick={abrirMas} aria-haspopup="dialog">
        <Icono n="puntos" t={22} />
        Más
      </button>
    </nav>
  )
}

export function BarraCompleta({ area, alModo, salir }: { area: AreaId; alModo: () => void; salir: () => void }) {
  return (
    <header className={s.barra}>
      <Marca />
      <nav className={s.pestanas} aria-label="Tu panel">
        {AREAS.map((a) => (
          <a key={a.id} className={s.pestana} href={'#' + a.id} aria-current={area === a.id ? 'page' : undefined} title={a.para}>
            <Icono n={a.icono} />
            <span className={s.largo}>{a.nombre}</span>
            <span className={s.corto}>{a.corto}</span>
          </a>
        ))}
      </nav>
      <button className={`${s.salir} ${s.soloCompu}`} type="button" onClick={alModo} title="Solo lo de todos los días">
        <Icono n="brillo" t={16} />
        Modo simple
      </button>
      <button className={`${s.salir} ${s.soloCompu}`} type="button" onClick={salir}>
        <Icono n="salir" t={16} />
        Salir
      </button>
    </header>
  )
}

type MenuProps = { cerrar: () => void; noche: boolean; cambiarTema: () => void; alModo: () => void; salir: () => void }

/** «Más» del modo simple: lo que no tiene pestaña, el buscador, claro/noche, el modo completo y salir. */
export function MenuMas({ cerrar, noche, cambiarTema, alModo, salir }: MenuProps) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [cerrar])
  const enCelular = PESTANAS_SIMPLES.slice(3) // las que no caben abajo: Contenido, Caja y Herramientas
  const fila = (href: string, icono: Parameters<typeof Icono>[0]['n'], nombre: string, para: string) => (
    <a key={href} className={s.menuItem} href={href} onClick={cerrar}>
      <span className={s.burbuja}>
        <Icono n={icono} t={17} />
      </span>
      <span>
        <b>{nombre}</b>
        <small>{para}</small>
      </span>
    </a>
  )
  return (
    <div className={s.velo} onClick={cerrar}>
      <div className={s.menuMas} role="dialog" aria-label="Más" onClick={(e) => e.stopPropagation()}>
        <div className={s.menuCab}>
          <b>Más</b>
          <button className={s.btnIco} type="button" onClick={cerrar} aria-label="Cerrar">
            <Icono n="x" />
          </button>
        </div>
        <div className={s.soloCelular}>{enCelular.map((p) => fila(p.href, p.icono, p.nombre, p.para))}</div>
        <div className={s.menuTit}>Más de tu negocio</div>
        <div className={s.menuLista}>{seccionesDeMas().map((x) => fila('#negocio/' + x.ruta, x.icono, x.nombre, x.para))}</div>
        <div className={s.menuTit}>Tu panel</div>
        {fila('#mapa', 'buscar', 'Buscar algo', 'Todo lo que tienes, para qué sirve y dónde está.')}
        <button className={s.menuItem} type="button" onClick={cambiarTema}>
          <span className={s.burbuja}>
            <Icono n={noche ? 'brillo' : 'luna'} t={17} />
          </span>
          <span>
            <b>{noche ? 'Modo claro' : 'Modo noche'}</b>
            <small>{noche ? 'Fondo claro, para el día.' : 'Fondo oscuro, para la noche.'}</small>
          </span>
        </button>
        <button className={s.menuItem} type="button" onClick={alModo}>
          <span className={s.burbuja}>
            <Icono n="capas" t={17} />
          </span>
          <span>
            <b>Modo completo</b>
            <small>Todo tu panel, como antes: el menú largo, las calculadoras, los links y el mapa.</small>
          </span>
        </button>
        <button className={s.menuItem} type="button" onClick={salir}>
          <span className={s.burbuja}>
            <Icono n="salir" t={17} />
          </span>
          <span>
            <b>Salir</b>
            <small>Cierra tu panel en este aparato.</small>
          </span>
        </button>
      </div>
    </div>
  )
}
