'use client'

import { useMemo, useState } from 'react'
import s from './tu-panel.module.css'
import Icono, { type NombreIcono } from './Iconos'
import {
  AREAS,
  CALCULADORAS,
  DIRECCIONES,
  LINK_CAMPANA,
  LINKS_EQUIPO,
  LINKS_PROSPECTOS,
  SECCIONES_NEGOCIO,
  normalizar,
  type PanelCliente,
} from './catalogo'

type Item = {
  grupo: 'negocio' | 'calculadoras' | 'links'
  clave: string
  nombre: string
  donde: string
  para: string
  icono: NombreIcono
  href: string
  palabras: string
  /** Solo aparece cuando buscas (los paneles de cada cliente, uno por uno). */
  soloBuscando?: boolean
}

const GRUPOS: { id: Item['grupo']; nombre: string; sub: string; icono: NombreIcono }[] = [
  { id: 'negocio', nombre: 'Mi negocio', sub: 'Tu trabajo de cada día', icono: 'maletin' },
  { id: 'calculadoras', nombre: 'Calculadoras', sub: 'Para sacar los números', icono: 'calculadora' },
  { id: 'links', nombre: 'Links', sub: 'Lo que ven otras personas', icono: 'enlace' },
]

/** Todo lo que hay, en una sola lista: de aquí sale el Mapa y su buscador. */
function todo(clientes: PanelCliente[]): Item[] {
  const negocio: Item[] = SECCIONES_NEGOCIO.map((x) => ({
    grupo: 'negocio',
    clave: 'n-' + x.ruta,
    nombre: x.nombre,
    donde: 'Mi negocio' + (x.dentroDe ? ' › ' + x.dentroDe : ''),
    para: x.para,
    icono: x.icono,
    href: '#negocio/' + x.ruta,
    palabras: x.palabras ?? '',
  }))
  const calcs: Item[] = CALCULADORAS.map((c) => ({
    grupo: 'calculadoras',
    clave: 'c-' + c.id,
    nombre: c.nombre,
    donde: 'Calculadoras',
    para: c.pregunta + ' ' + c.cuando,
    icono: c.icono,
    href: '#calculadoras/' + c.id,
    palabras: c.palabras,
  }))
  const enlaces: Item[] = [...LINKS_PROSPECTOS, ...LINKS_EQUIPO, LINK_CAMPANA].map((e) => ({
    grupo: 'links',
    clave: 'l-' + e.id,
    nombre: e.nombre,
    donde: e.url ? 'Links' : 'Mi negocio',
    para: e.para,
    icono: e.icono,
    // Lo que se manda desde Mi negocio (el link del editor, el de la campaña) lleva allá; lo demás, a Links.
    href: e.url ? (e.id === 'principal' ? '#links/principal' : '#links') : '#negocio/' + (e.donde?.ruta ?? 'inicio'),
    palabras: e.palabras,
  }))
  const paneles: Item = {
    grupo: 'links',
    clave: 'l-paneles',
    nombre: 'El panel de cada cliente',
    donde: 'Links',
    para: 'Dónde van, lo próximo, lo que les toca y sus sesiones. Cada uno entra con su clave.',
    icono: 'ojo',
    href: '#links',
    palabras: 'panel cliente clave ' + clientes.map((c) => c.nombre).join(' '),
  }
  const porCliente: Item[] = clientes.map((c) => ({
    grupo: 'links',
    clave: 'cli-' + c.carpeta,
    nombre: 'Panel de ' + c.nombre,
    donde: 'Links › El panel de cada cliente',
    para: 'Lo que ve ' + c.nombre + ' en su panel.',
    icono: 'ojo',
    href: '#links/cliente/' + c.carpeta,
    palabras: c.carpeta,
    soloBuscando: true,
  }))
  return [...negocio, ...calcs, ...enlaces, paneles, ...porCliente]
}

export default function Mapa({ clientes, salir }: { clientes: PanelCliente[]; salir: () => void }) {
  const [q, setQ] = useState('')
  const items = useMemo(() => todo(clientes), [clientes])
  const nq = normalizar(q.trim())
  const vistos = nq
    ? items.filter((i) => normalizar([i.nombre, i.para, i.donde, i.palabras].join(' ')).includes(nq))
    : items.filter((i) => !i.soloBuscando)

  return (
    <div className={s.pagina}>
      <div className={s.ancho}>
        <header className={`${s.cab} ${s.aparece}`}>
          <h1>Mapa de tu panel</h1>
          <p>Así quedó ordenado todo: cuatro pestañas arriba. Aquí abajo está cada cosa, para qué sirve y un botón para ir directo.</p>
        </header>

        <div className={s.areas}>
          {AREAS.map((a) => (
            <a key={a.id} className={`${s.card} ${s.area}`} href={'#' + a.id}>
              <span className={`${s.burbuja} ${s.burbujaAzul}`}>
                <Icono n={a.icono} t={20} />
              </span>
              <b>{a.nombre}</b>
              <p>
                <strong>{a.para}</strong> {a.adentro}
              </p>
            </a>
          ))}
        </div>

        <div className={s.buscador}>
          <Icono n="buscar" t={20} />
          <input
            className={s.inp}
            type="search"
            placeholder="¿Qué buscas? Ej.: caja, propuesta, clave de Belén"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar en tu panel"
          />
        </div>

        {GRUPOS.map((g) => {
          const lista = vistos.filter((i) => i.grupo === g.id)
          if (!lista.length) return null
          return (
            <section key={g.id} aria-label={g.nombre}>
              <div className={s.secTit}>
                <Icono n={g.icono} t={15} />
                {g.nombre} <small>· {g.sub}</small>
              </div>
              <div className={`${s.card} ${s.indice}`}>
                {lista.map((i) => (
                  <a key={i.clave} className={s.fila} href={i.href}>
                    <span className={s.burbuja}>
                      <Icono n={i.icono} />
                    </span>
                    <div>
                      <b>{i.nombre}</b>
                      {/* Dónde está, solo si no es obvio por el grupo (p. ej. «Mi negocio › Clientes») */}
                      {i.donde !== g.nombre && <span className={s.chip}>{i.donde}</span>}
                      <p>{i.para}</p>
                    </div>
                    <Icono n="derecha" className={s.flecha} />
                  </a>
                ))}
              </div>
            </section>
          )
        })}
        {nq && !vistos.length && <div className={`${s.card} ${s.vacio}`}>No encontré «{q}». Prueba con otra palabra.</div>}

        <div className={s.secTit}>
          <Icono n="enlace" t={15} />
          Las direcciones directas <small>· Por si las quieres en favoritos</small>
        </div>
        <div className={`${s.card} ${s.direcciones}`}>
          {DIRECCIONES.map((d) => (
            <div key={d.url}>
              <span className={s.url}>mauricio-ayllon.com{d.url}</span>
              <span>{d.que}</span>
            </div>
          ))}
        </div>

        <button className={`${s.btn} ${s.salirMovil}`} type="button" onClick={salir}>
          <Icono n="salir" t={16} />
          Salir de tu panel
        </button>
      </div>
    </div>
  )
}
