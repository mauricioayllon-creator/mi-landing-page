/**
 * Casos de éxito — tarjetas alternadas (media a un lado, texto al otro).
 *
 * Por ahora la media muestra el LOGO del cliente. Cuando tengas el reel
 * vertical, pasá su URL de embed en `reelSrc` y reemplazará al logo.
 *
 * Para agregar un caso nuevo, copiá un objeto de CASOS:
 *   - result:  cifra/frase del badge (ej. "+13.398 Bs/mes")
 *   - niche:   título del nicho (H3)
 *   - name:    nombre del negocio
 *   - logoSrc:  ruta del logo en /public
 *   - reelSrc:  (opcional) URL del embed del reel 9:16; tiene prioridad sobre el logo
 *   - videoSrc:  (opcional) ruta de un video vertical 9:16 self-hosteado en /public;
 *               máxima prioridad. Se muestra con controles, sin autoplay.
 *   - posterSrc: (opcional) imagen de portada del video (frame 9:16). Evita el
 *               rectángulo negro antes del play.
 *   - story:    situación → acción → resultado. Envolvé las cifras en {cifra('...')}
 */

import Image from 'next/image'
import type { ReactNode } from 'react'

/** Pinta una cifra/dato en verde lima dentro de un párrafo. */
function cifra(text: string): ReactNode {
  return <span className="font-semibold text-acento">{text}</span>
}

type Caso = {
  result: string
  niche: string
  name: string
  logoSrc: string
  reelSrc?: string
  videoSrc?: string
  posterSrc?: string
  story: ReactNode
}

const CASOS: Caso[] = [
  {
    result: '+13.398 Bs/mes',
    niche: 'Heladería',
    name: 'Milky Way',
    logoSrc: '/testimonio-milkyway.jpeg',
    videoSrc: '/testimonio-milkyway.mp4',
    posterSrc: '/testimonio-milkyway-poster.jpg',
    story: (
      <>
        Estaba perdiendo dinero y a punto de cerrar completamente. Implementamos
        el sistema de contenido y en {cifra('el primer mes')} pasó de facturar{' '}
        {cifra('4.156 Bs')} a facturar {cifra('17.554 Bs')}.
      </>
    ),
  },
  {
    result: 'Clientes nuevos cada mes',
    niche: 'Instituto de inglés',
    name: 'First Class Institute',
    logoSrc: '/testimonio-firstclass.jpg',
    story: (
      <>
        Dependía del boca a boca. Tras instalar el sistema, hoy recibe{' '}
        {cifra('clientes potenciales nuevos mes tras mes')} de forma constante,
        sin gastar en publicidad y sin depender de hacerse viral.
      </>
    ),
  },
  {
    result: '+500 leads en 1 mes',
    niche: 'Instituto',
    name: 'Grupo Alfa',
    logoSrc: '/testimonio-grupoalfa.jpeg',
    story: (
      <>
        Necesitaban dar a conocer su método de estudio único. Creamos el sistema
        de contenido y lograron {cifra('más de 10 videos, todos virales')}, que
        les trajeron {cifra('+500 leads nuevos en 1 mes')}.
      </>
    ),
  },
]

function Media({ caso }: { caso: Caso }) {
  return (
    <div className="mx-auto w-full max-w-[260px] shrink-0">
      {caso.videoSrc ? (
        <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-ink shadow-card ring-1 ring-black/10">
          <video
            className="h-full w-full object-cover"
            src={caso.videoSrc}
            poster={caso.posterSrc}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      ) : caso.reelSrc ? (
        <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-ink shadow-card ring-1 ring-black/10">
          <iframe
            className="h-full w-full"
            src={caso.reelSrc}
            title={`Testimonio ${caso.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/10">
          <Image
            src={caso.logoSrc}
            alt={caso.name}
            width={320}
            height={320}
            className="h-full w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  )
}

export default function Testimonials() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {CASOS.map((caso, i) => {
        const mediaFirst = i % 2 === 0
        return (
          <article
            key={i}
            className="testimonial-gradient flex flex-col items-center gap-8 rounded-3xl p-7 text-titulo shadow-card md:flex-row md:p-9"
          >
            <div className={mediaFirst ? 'md:order-1' : 'md:order-2'}>
              <Media caso={caso} />
            </div>

            <div className={`flex-1 ${mediaFirst ? 'md:order-2' : 'md:order-1'}`}>
              {/* Badge resultado */}
              <span className="inline-flex items-center gap-2 rounded-pill bg-acento px-4 py-1.5 text-sm font-semibold text-ink">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2c3 1 6 5 6 10l-2 4-2-1-2 2-2-2-2 1-2-4c0-5 3-9 6-10Zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg>
                {caso.result}
              </span>

              <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
                {caso.niche}
              </h3>

              <p className="mt-3 text-base leading-relaxed text-white/85 md:text-lg">
                {caso.story}
              </p>

              {/* Negocio */}
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/30">
                  <Image
                    src={caso.logoSrc}
                    alt={caso.name}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="font-medium text-white/90">{caso.name}</span>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
