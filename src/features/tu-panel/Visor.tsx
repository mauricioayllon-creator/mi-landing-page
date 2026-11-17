'use client'

import { useState, type ReactNode } from 'react'
import s from './tu-panel.module.css'
import Icono, { type NombreIcono } from './Iconos'

/**
 * Una herramienta o una página abierta DENTRO de Tu panel: arriba, «volver» y su nombre; abajo, la página.
 * Así nunca sales de tu panel para usar algo.
 */
export default function Visor({
  volver,
  volverTexto,
  icono,
  titulo,
  sub,
  acciones,
  children,
}: {
  volver: string
  volverTexto: string
  icono: NombreIcono
  titulo: string
  sub?: string
  acciones?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={s.visor}>
      <div className={s.visorCab}>
        <a className={`${s.btn} ${s.chico} ${s.suave}`} href={volver} aria-label={'Volver a ' + volverTexto}>
          <Icono n="atras" t={16} />
          <span className={s.ocultarMovil}>{volverTexto}</span>
        </a>
        <div className={s.visorTit}>
          <span className={s.burbuja}>
            <Icono n={icono} />
          </span>
          <div>
            <b>{titulo}</b>
            {sub && <small>{sub}</small>}
          </div>
        </div>
        {acciones && <div className={s.acciones}>{acciones}</div>}
      </div>
      <div className={s.visorCuerpo}>{children}</div>
    </div>
  )
}

/** Una página de tu web dentro de un marco, con «Abriendo…» mientras carga. */
export function Marco({ src, titulo, alCargar }: { src: string; titulo: string; alCargar?: (f: HTMLIFrameElement) => void }) {
  const [listo, setListo] = useState(false)
  return (
    <>
      {!listo && <div className={s.cargando}>Abriendo…</div>}
      <iframe
        className={s.marco}
        src={src}
        title={titulo}
        allow="clipboard-read; clipboard-write"
        onLoad={(e) => {
          setListo(true)
          alCargar?.(e.currentTarget)
        }}
      />
    </>
  )
}

/** El botón de «abrir aparte» (en una pestaña nueva). */
export function AbrirAparte({ href }: { href: string }) {
  return (
    <a className={s.btnIco} href={href} target="_blank" rel="noopener" title="Abrir en una pestaña nueva" aria-label="Abrir en una pestaña nueva">
      <Icono n="afuera" />
    </a>
  )
}
