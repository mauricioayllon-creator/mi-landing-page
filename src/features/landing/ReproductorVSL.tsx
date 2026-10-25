'use client'

import { useEffect, useRef, useState } from 'react'
import { claseMarco } from './VideoSlot'
import type { Video } from './config'

/**
 * Reproductor del VSL, como los de VTurb o Vidalytics (pedido del usuario, 2026-10-25):
 * - Arranca solo y sin sonido (los navegadores no dejan arrancar con sonido), con un cartel
 *   "Haz clic para escucharlo". Al tocarlo vuelve al inicio con sonido, para no perderse el comienzo.
 * - No se puede adelantar ni retroceder: tocar el video solo pausa. La barra muestra el avance REAL
 *   (nada de barras que "aceleran": sería engañar sobre cuánto dura).
 * - Si la persona vuelve otro día, elige seguir donde lo dejó (se guarda solo en su navegador).
 * - Avisa al Pixel de Meta cuánto se vio: VSL_Play, VSL_25, VSL_50, VSL_75 y VSL_100.
 * - El botón aparece en el último minuto, y al terminar queda en pantalla.
 * - Mientras está sin sonido, se pausa si sale de la pantalla (ahorra datos del visitante).
 * Si el iPhone está en ahorro de batería no arranca solo: queda el botón de play y funciona igual.
 */

type Mp4 = Extract<Video, { tipo: 'mp4' }>
type Estado = 'detenido' | 'muda' | 'retomar' | 'sonando' | 'pausa' | 'fin'
type Fbq = (accion: string, evento: string) => void

const SEGUNDOS_BOTON = 60
const MARCAS = [25, 50, 75]

function leerPosicion(clave: string) {
  try {
    return Number(localStorage.getItem(clave)) || 0
  } catch {
    return 0 // sin acceso al navegador: empieza desde cero
  }
}

function guardarPosicion(clave: string, segundos: number | null) {
  try {
    if (segundos === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, String(Math.floor(segundos)))
  } catch {
    // sin acceso al navegador: no se recuerda la posición
  }
}

/** Toda la lógica del reproductor: estado, avance, posición guardada y avisos al Pixel. */
function useReproductor(clave: string) {
  const ref = useRef<HTMLVideoElement>(null)
  const marco = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<Estado>('detenido')
  const estadoRef = useRef<Estado>('detenido')
  const [tiempo, setTiempo] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const guardado = useRef(0)
  const avisados = useRef(new Set<string>())

  useEffect(() => {
    estadoRef.current = estado
  }, [estado])

  // Al abrir: si ya lo había empezado, pregunta; si no, arranca sin sonido.
  useEffect(() => {
    const v = ref.current
    if (!v) return
    guardado.current = leerPosicion(clave)
    if (guardado.current > 15) {
      setEstado('retomar')
      return
    }
    v.muted = true
    v.play()
      .then(() => estadoRef.current === 'detenido' && setEstado('muda'))
      .catch(() => {}) // bloqueado (ej.: ahorro de batería): queda el botón de play
  }, [clave])

  // Sin sonido y fuera de la pantalla, no tiene sentido seguir descargando.
  useEffect(() => {
    const v = ref.current
    const caja = marco.current
    if (!v || !caja || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(([e]) => {
      if (estadoRef.current !== 'muda') return
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
    obs.observe(caja)
    return () => obs.disconnect()
  }, [])

  function avisar(evento: string) {
    if (avisados.current.has(evento)) return
    avisados.current.add(evento)
    ;(window as unknown as { fbq?: Fbq }).fbq?.('trackCustom', evento)
  }

  function reproducir(desde: number) {
    const v = ref.current
    if (!v) return
    v.currentTime = desde
    v.muted = false
    v.play().catch(() => setEstado('pausa'))
    setEstado('sonando')
    avisar('VSL_Play')
  }

  function alternar() {
    const v = ref.current
    if (!v) return
    if (estado === 'sonando') v.pause()
    if (estado === 'pausa') v.play().then(() => setEstado('sonando')).catch(() => {})
  }

  const eventos = {
    onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const v = e.currentTarget
      setTiempo(v.currentTime)
      // La duración se lee aquí: "loadedmetadata" puede pasar antes de que React escuche.
      setDuracion(v.duration || 0)
      if (estadoRef.current !== 'sonando' || !v.duration) return
      guardarPosicion(clave, v.currentTime)
      const avance = (v.currentTime / v.duration) * 100
      MARCAS.filter((m) => avance >= m).forEach((m) => avisar(`VSL_${m}`))
    },
    onPause: (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (estadoRef.current === 'sonando' && !e.currentTarget.ended) setEstado('pausa')
    },
    onEnded: () => {
      if (estadoRef.current === 'sonando') avisar('VSL_100')
      guardarPosicion(clave, null)
      setEstado('fin')
    },
  }

  return { ref, marco, estado, tiempo, duracion, guardado: guardado.current, reproducir, alternar, eventos }
}

const ICONO_PLAY = (
  <svg className="ml-1 h-7 w-7 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
)

const ICONO_SIN_SONIDO = (
  <svg className="h-7 w-7 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
    <path d="m22 9-6 6M16 9l6 6" />
  </svg>
)

/** Botón redondo grande con un texto debajo: el centro de cada cartel. */
function BotonGrande({ icono, children, onClick }: { icono: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/40 text-titulo">
      <span className="flex h-14 w-14 items-center justify-center rounded-full degradado-acento text-ink shadow-[0_0_0_8px_rgba(30,200,255,0.25)] motion-safe:animate-pulse sm:h-20 sm:w-20">
        {icono}
      </span>
      <span className="rounded-2xl bg-ink/80 px-4 py-2 text-sm font-bold leading-snug sm:text-lg">{children}</span>
    </button>
  )
}

const BOTON_CHICO = 'rounded-pill px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95'

/** Lo que se ve encima del video según el estado. Mientras suena, nada: tocar el video lo pausa. */
function Cartel({ r, boton }: { r: ReturnType<typeof useReproductor>; boton: React.ReactNode }) {
  if (r.estado === 'detenido') return <BotonGrande icono={ICONO_PLAY} onClick={() => r.reproducir(0)}>Haz clic para ver el video</BotonGrande>
  if (r.estado === 'muda') {
    return (
      <BotonGrande icono={ICONO_SIN_SONIDO} onClick={() => r.reproducir(0)}>
        Tu video ya empezó
        <span className="block text-acento">Haz clic para escucharlo</span>
      </BotonGrande>
    )
  }
  if (r.estado === 'pausa') return <BotonGrande icono={ICONO_PLAY} onClick={r.alternar}>Continuar</BotonGrande>
  if (r.estado === 'retomar') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/75 px-4 text-titulo">
        <p className="text-base font-bold sm:text-xl">Ya habías empezado este video</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => r.reproducir(r.guardado)} className={`${BOTON_CHICO} degradado-acento text-ink`}>
            Seguir donde lo dejé
          </button>
          <button type="button" onClick={() => r.reproducir(0)} className={`${BOTON_CHICO} bg-white/10 ring-1 ring-white/25`}>
            Empezar de nuevo
          </button>
        </div>
      </div>
    )
  }
  if (r.estado === 'fin') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/85 px-4 text-titulo">
        <p className="text-sm font-semibold uppercase tracking-widest text-acento">Dale clic aquí</p>
        {boton}
        <button type="button" onClick={() => r.reproducir(0)} className="text-sm text-white/70 underline underline-offset-4">
          Ver el video de nuevo
        </button>
      </div>
    )
  }
  return null
}

export default function ReproductorVSL({ video, titulo, boton }: { video: Mp4; titulo: string; boton: React.ReactNode }) {
  const r = useReproductor(`vsl:${video.src}`)
  const viendo = r.estado === 'sonando' || r.estado === 'pausa'
  const ultimoMinuto = viendo && r.duracion > 0 && r.tiempo >= r.duracion - SEGUNDOS_BOTON

  return (
    <div ref={r.marco} className={`relative ${claseMarco(video)} overflow-hidden rounded-3xl bg-ink shadow-card ring-1 ring-white/10`}>
      <video
        ref={r.ref}
        className="h-full w-full cursor-pointer object-cover"
        src={video.src}
        poster={video.poster}
        aria-label={titulo}
        playsInline
        preload="metadata"
        disablePictureInPicture
        onClick={r.alternar}
        onContextMenu={(e) => e.preventDefault()}
        {...r.eventos}
      />
      <Cartel r={r} boton={boton} />
      {ultimoMinuto && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-3 motion-safe:animate-[msg-in_0.5s_ease-out_both]">{boton}</div>
      )}
      {viendo && r.duracion > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/15" aria-hidden="true">
          <div className="h-full bg-acento transition-[width] duration-300 ease-linear" style={{ width: `${(r.tiempo / r.duracion) * 100}%` }} />
        </div>
      )}
    </div>
  )
}
