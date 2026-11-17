'use client'

import { useEffect, useState, type ReactNode } from 'react'
import s from './tu-panel.module.css'
import Icono, { type NombreIcono } from './Iconos'
import Visor, { AbrirAparte, Marco } from './Visor'
import CampoBs from './CampoBs'
import { PRECIO_SERVICIO } from '@/features/landing/config'
import {
  LINK_CAMPANA,
  LINKS_EQUIPO,
  LINKS_PROSPECTOS,
  SITIO,
  linkCompleto,
  linkPropuesta,
  type Enlace,
  type PanelCliente,
} from './catalogo'
import { copiar, guardarLocal, mensajeConClave, pedirHoja } from './utiles'

type Claves = { clientes: Record<string, string>; equipo: Record<string, string> }

/** Un link del catálogo por su id (si cambias el orden del catálogo, nada se rompe). */
function porId(lista: Enlace[], id: string): Enlace {
  const e = lista.find((x) => x.id === id)
  if (!e) throw new Error('Falta el link «' + id + '» en catalogo.ts')
  return e
}
const PRINCIPAL = porId(LINKS_PROSPECTOS, 'principal')
const PROPUESTA = porId(LINKS_PROSPECTOS, 'propuesta')
const CUPON = porId(LINKS_PROSPECTOS, 'cupon')
type Props = {
  clientes: PanelCliente[]
  abierto: string
  visible: boolean
  clave: string
  avisar: (t: string, error?: boolean) => void
  alFallarClave: () => void
}

/**
 * La pestaña Links: las páginas que ven otras personas, según quién las ve.
 * Las claves de tus clientes y de tu equipo se piden a tu hoja (las mismas de Mi negocio), para que
 * «Copiar link y clave» mande todo junto y «Ver» entre directo.
 */
export default function Links({ clientes, abierto, visible, clave, avisar, alFallarClave }: Props) {
  const [prop, setProp] = useState({ tienda: '', precio: String(PRECIO_SERVICIO), fecha: '' })
  const [claves, setClaves] = useState<Claves | null>(null)
  const [pidio, setPidio] = useState(false)

  useEffect(() => {
    if (!visible || pidio) return
    setPidio(true)
    Promise.all([
      pedirHoja({ accion: 'panel-claves', clave, carpetas: clientes.map((c) => c.carpeta) }),
      pedirHoja({ accion: 'equipo-claves', clave }),
    ])
      .then(([a, b]) => {
        if (a.error === 'clave' || b.error === 'clave') return alFallarClave()
        setClaves({ clientes: (a.ok && a.claves) || {}, equipo: (b.ok && b.claves) || {} })
      })
      .catch(() => setClaves({ clientes: {}, equipo: {} })) // sin señal: los links igual sirven, sin la clave
  }, [visible, pidio, clave, clientes, alFallarClave])

  async function copiarTexto(texto: string, aviso: string) {
    const ok = await copiar(texto)
    avisar(ok ? aviso : 'No se pudo copiar', !ok)
  }
  function copiarConClave(link: string, k: string | undefined) {
    if (k) copiarTexto(mensajeConClave(link, k), 'Copiado: su link y su clave')
    else copiarTexto(link, 'Copiado el link (la clave está en Mi negocio)')
  }

  const vista = abierto ? abrir(abierto, { clientes, claves, prop }) : null
  const claveEquipo = vista?.claveEquipo
  // equipo.html recuerda una sola clave por aparato: se deja la de esta persona para que «Ver» entre directo como ella.
  useEffect(() => {
    if (claveEquipo) guardarLocal('equipo-clave', claveEquipo)
  }, [claveEquipo])

  return (
    <div className={visible ? s.capa : s.capaOculta}>
      <div className={vista ? s.capaOculta : s.pagina}>
        <div className={s.ancho}>
          <header className={`${s.cab} ${s.aparece}`}>
            <h1>Links</h1>
            <p>Las páginas que ven otras personas, según quién las ve. Ábrelas para ver lo que ven, o copia el link para mandarlo.</p>
          </header>

          <Titulo icono="megafono" texto="Para tus prospectos" sub="Antes de que te compren" />
          <div className={s.grupo}>
            <TarjetaLink e={PRINCIPAL}>
              <Ver id="principal" />
              <Copiar onClick={() => copiarTexto(linkCompleto('/'), 'Link copiado')} />
            </TarjetaLink>
            <TarjetaLink e={CUPON}>
              <a className={`${s.btn} ${s.chico} ${s.suave}`} href={CUPON.url} target="_blank" rel="noopener">
                <Icono n="afuera" t={15} />
                Abrir
              </a>
              <Copiar onClick={() => copiarTexto(CUPON.url ?? '', 'Link copiado')} />
            </TarjetaLink>
            <Propuesta prop={prop} setProp={setProp} copiarTexto={copiarTexto} />
          </div>

          <Titulo icono="gente" texto="Para tus clientes" sub="Cuando ya trabajan contigo" />
          <div className={s.grupo}>
            <PanelesClientes clientes={clientes} claves={claves} copiarConClave={copiarConClave} />
            <TarjetaLink e={LINK_CAMPANA} ancho />
          </div>

          <Titulo icono="maletin" texto="Para tu equipo" sub="Cada uno entra con su clave" />
          <div className={`${s.grupo} ${s.grupo3}`}>
            {LINKS_EQUIPO.map((e) => (
              <TarjetaLink key={e.id} e={e}>
                {e.url && <Ver id={e.id} />}
                {e.url && <CopiarClave cargando={!claves} onClick={() => copiarConClave(linkCompleto(e.url ?? ''), claves?.equipo[e.id])} />}
              </TarjetaLink>
            ))}
          </div>
        </div>
      </div>

      {vista && (
        <div className={s.capa}>
          <Visor
            volver="#links"
            volverTexto="Links"
            icono={vista.icono}
            titulo={vista.titulo}
            sub={vista.sub}
            acciones={
              <>
                <Copiar onClick={() => copiarTexto(vista.copia, 'Link copiado')} />
                <AbrirAparte href={vista.src} />
              </>
            }
          >
            <Marco key={vista.src + '|' + (claveEquipo ?? '')} src={vista.src} titulo={vista.titulo} />
          </Visor>
        </div>
      )}
    </div>
  )
}

type Vista = { titulo: string; sub: string; icono: NombreIcono; src: string; copia: string; claveEquipo?: string }

/** #links/principal, #links/propuesta, #links/cliente/domix, #links/belen → qué se abre adentro. */
function abrir(id: string, d: { clientes: PanelCliente[]; claves: Claves | null; prop: { tienda: string; precio: string; fecha: string } }): Vista | null {
  if (id === 'principal') return { titulo: 'Tu página principal', sub: 'Así la ve un prospecto', icono: 'web', src: '/', copia: linkCompleto('/') }
  if (id === 'propuesta') {
    const url = linkPropuesta(d.prop)
    return { titulo: 'Tu propuesta' + (d.prop.tienda ? ' · ' + d.prop.tienda : ''), sub: 'Así la ve el dueño', icono: 'archivo', src: url, copia: linkCompleto(url) }
  }
  const cli = id.startsWith('cliente/') ? d.clientes.find((c) => c.carpeta === id.slice(8)) : null
  if (cli) {
    const url = '/clientes/' + cli.carpeta
    const k = d.claves?.clientes[cli.carpeta]
    return { titulo: 'Panel de ' + cli.nombre, sub: 'Así lo ve tu cliente', icono: 'ojo', src: url + (k ? '?k=' + encodeURIComponent(k) : ''), copia: SITIO + url }
  }
  const eq = LINKS_EQUIPO.find((e) => e.id === id && e.url)
  if (eq?.url) {
    const claveEquipo = d.claves?.equipo[eq.id]
    return { titulo: 'Lo que ve ' + eq.nombre, sub: 'Su panel del equipo', icono: 'persona', src: eq.url, copia: linkCompleto(eq.url), claveEquipo }
  }
  return null
}

function Titulo({ icono, texto, sub }: { icono: NombreIcono; texto: string; sub: string }) {
  return (
    <div className={s.secTit}>
      <Icono n={icono} t={15} />
      {texto} <small>· {sub}</small>
    </div>
  )
}

/** mauricio-ayllon.com/propuesta, para mostrar (sin https://). */
function mostrar(url: string) {
  return linkCompleto(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function TarjetaLink({ e, ancho, extra, children }: { e: Enlace; ancho?: boolean; extra?: ReactNode; children?: ReactNode }) {
  return (
    <article className={`${s.card} ${s.enlace} ${ancho ? s.enlaceAncho : ''}`}>
      <div className={s.enlaceCab}>
        <span className={s.burbuja}>
          <Icono n={e.icono} />
        </span>
        <div>
          <b>{e.nombre}</b>
          <span className={s.url}>{e.url ? mostrar(e.url) : 'Su link tiene su llave'}</span>
        </div>
      </div>
      <p className={s.para}>
        <span className={`${s.chip} ${s.chipAzul}`}>
          <Icono n="ojo" t={13} />
          Lo ve: {e.quien}
        </span>{' '}
        {e.para}
      </p>
      {extra}
      {children && <div className={s.acciones}>{children}</div>}
      {e.donde && (
        <div className={s.donde}>
          <span>{e.donde.texto}</span>
          <a className={s.ir} href={'#negocio/' + e.donde.ruta}>
            Ir ahí <Icono n="derecha" t={14} />
          </a>
        </div>
      )}
    </article>
  )
}

function Ver({ id, texto = 'Ver' }: { id: string; texto?: string }) {
  return (
    <a className={`${s.btn} ${s.chico} ${s.suave}`} href={'#links/' + id}>
      <Icono n="ojo" t={15} />
      {texto}
    </a>
  )
}

function Copiar({ onClick, texto = 'Copiar link' }: { onClick: () => void; texto?: string }) {
  return (
    <button className={`${s.btn} ${s.chico}`} type="button" onClick={onClick}>
      <Icono n="copiar" t={15} />
      {texto}
    </button>
  )
}

function CopiarClave({ cargando, onClick }: { cargando: boolean; onClick: () => void }) {
  return (
    <button className={`${s.btn} ${s.chico}`} type="button" onClick={onClick} disabled={cargando} title="Copia el link con su clave, listo para mandar">
      <Icono n={cargando ? 'reloj' : 'copiar'} t={15} />
      {cargando ? 'Trayendo su clave…' : 'Copiar link y clave'}
    </button>
  )
}

type Prop = { tienda: string; precio: string; fecha: string }

/** El armador de la propuesta: la tienda, el precio y la fecha van en el link (lo lee /propuesta). */
function Propuesta({ prop, setProp, copiarTexto }: { prop: Prop; setProp: (p: Prop) => void; copiarTexto: (t: string, a: string) => void }) {
  const url = linkPropuesta(prop)
  const completo = linkCompleto(url)
  const wa = 'https://wa.me/?text=' + encodeURIComponent('Te paso lo que hablamos, para que lo revises tranquilo: ' + completo)
  const armador = (
    <>
      <div className={s.armador}>
        <div>
          <label className={s.etq} htmlFor="pr-tienda">
            Nombre de la tienda
          </label>
          <input className={s.inp} id="pr-tienda" maxLength={60} placeholder="Ej.: Sneaker Fashion" value={prop.tienda} onChange={(e) => setProp({ ...prop, tienda: e.target.value })} />
        </div>
        <CampoBs id="pr-precio" etq="Precio del servicio" valor={prop.precio} cambiar={(v) => setProp({ ...prop, precio: v })} />
        <div>
          <label className={s.etq} htmlFor="pr-fecha">
            Fecha de la promo
          </label>
          <input className={s.inp} id="pr-fecha" maxLength={40} placeholder="Ej.: 21 de octubre" value={prop.fecha} onChange={(e) => setProp({ ...prop, fecha: e.target.value })} />
        </div>
      </div>
      <div className={s.resultado}>
        <Icono n="enlace" t={16} />
        <span className={s.url}>{completo}</span>
      </div>
    </>
  )
  return (
    <TarjetaLink e={PROPUESTA} ancho extra={armador}>
      <button className={`${s.btn} ${s.chico} ${s.primario}`} type="button" onClick={() => copiarTexto(completo, 'Link de la propuesta copiado')}>
        <Icono n="copiar" t={15} />
        Copiar link
      </button>
      <a className={`${s.btn} ${s.chico} ${s.wa}`} href={wa} target="_blank" rel="noopener">
        <Icono n="charla" t={15} />
        Mandar por WhatsApp
      </a>
      <Ver id="propuesta" texto="Ver cómo queda" />
    </TarjetaLink>
  )
}

function PanelesClientes({ clientes, claves, copiarConClave }: { clientes: PanelCliente[]; claves: Claves | null; copiarConClave: (l: string, k?: string) => void }) {
  const e: Enlace = {
    id: 'paneles',
    nombre: 'El panel de cada cliente',
    icono: 'ojo',
    quien: 'Cada cliente, con su clave',
    url: '/clientes/…',
    para: 'Dónde van, lo próximo, lo que les toca y sus sesiones. «Ver» entra directo con su clave.',
    donde: { ruta: 'clientes/paneles', texto: 'Para cambiar su clave o lo que ve: Mi negocio › Clientes › Sus paneles' },
    palabras: '',
  }
  const lista = (
    <div className={s.clientes}>
      {clientes.map((c) => (
        <div key={c.carpeta} className={s.cliente}>
          <span className={s.avatar}>{c.inicial}</span>
          <b title={c.nombre}>{c.nombre}</b>
          <a className={`${s.btn} ${s.chico} ${s.suave}`} href={'#links/cliente/' + c.carpeta} aria-label={'Ver el panel de ' + c.nombre}>
            <Icono n="ojo" t={15} />
            Ver
          </a>
          <button
            className={`${s.btn} ${s.chico}`}
            type="button"
            disabled={!claves}
            onClick={() => copiarConClave(SITIO + '/clientes/' + c.carpeta, claves?.clientes[c.carpeta])}
            aria-label={'Copiar el link y la clave de ' + c.nombre}
            title="Copia su link con su clave, listo para mandar"
          >
            <Icono n={claves ? 'copiar' : 'reloj'} t={15} />
            <span className={s.ocultarMovil}>Link y clave</span>
          </button>
        </div>
      ))}
    </div>
  )
  return <TarjetaLink e={e} ancho extra={clientes.length ? lista : <p className={s.vacio}>Todavía no hay paneles de clientes.</p>} />
}
