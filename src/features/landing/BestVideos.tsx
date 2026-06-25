/**
 * "Videos que MÁS vendieron" — vitrina de un reel ganador + prueba social.
 *
 * Estructura de cada video destacado:
 *   - videoSrc:  reel vertical 9:16 self-hosteado en /public
 *   - posterSrc: portada del reel (frame 9:16) para evitar el rectángulo negro
 *   - views:     etiqueta de reproducciones que se muestra en el badge (ej. "1.2M")
 *   - comments:  rutas de las capturas de comentarios recortadas (3 recomendadas)
 *
 * Para agregar otro video, copiá un objeto de VIDEOS.
 */

import Image from 'next/image'

type BestVideo = {
  videoSrc: string
  posterSrc: string
  views: string
  comments: string[]
}

const VIDEOS: BestVideo[] = [
  {
    videoSrc: '/video-firstclass.mp4',
    posterSrc: '/video-firstclass-poster.jpg',
    views: '46.1K reproducciones',
    comments: [
      '/comentario-fc-2.jpg', // Coquito (37 ❤️) — elogio fuerte primero
      '/comentario-fc-4.jpg', // Esther — "cómo puedo inscribirme"
      '/comentario-fc-1.jpg', // roxy — pide dirección/teléfono
      '/comentario-fc-9.jpg', // Lu — "desde qué edad hay inscripciones?"
      '/comentario-fc-12.jpg', // Lia — "dónde se ubica la sucursal de El Alto"
      '/comentario-fc-6.jpg',
      '/comentario-fc-7.jpg', // re-inscripción
      '/comentario-fc-3.jpg', // Mari — "dónde queda en El Alto"
      '/comentario-fc-8.jpg',
      '/comentario-fc-5.jpg',
      '/comentario-fc-11.jpg',
      '/comentario-fc-10.jpg',
    ],
  },
  {
    videoSrc: '/video-milkyway-reel.mp4',
    posterSrc: '/video-milkyway-reel-poster.jpg',
    views: '246.3K reproducciones',
    comments: [
      '/comentario-mw-1.jpg', // Flor de Liz — antojo + pide promoción
      '/comentario-mw-2.jpg',
      '/comentario-mw-3.jpg',
      '/comentario-mw-4.jpg',
      '/comentario-mw-5.jpg',
      '/comentario-mw-6.jpg',
      '/comentario-mw-7.jpg',
    ],
  },
  {
    videoSrc: '/video-unreal-reel.mp4',
    posterSrc: '/video-unreal-reel-poster.jpg',
    views: '35.8K reproducciones',
    comments: [
      '/comentario-un-3.jpg', // UZEDA — "Me interesa!!!!"
      '/comentario-un-1.jpg',
      '/comentario-un-2.jpg',
      '/comentario-un-4.jpg',
      '/comentario-un-5.jpg',
      '/comentario-un-6.jpg',
      '/comentario-un-7.jpg',
      '/comentario-un-8.jpg',
      '/comentario-un-9.jpg',
      '/comentario-un-10.jpg',
      '/comentario-un-11.jpg',
      '/comentario-un-12.jpg',
      '/comentario-un-13.jpg',
    ],
  },
]

function VideoCard({ video }: { video: BestVideo }) {
  return (
    <article className="testimonial-gradient flex flex-col items-center gap-8 rounded-3xl p-7 text-titulo shadow-card md:flex-row md:items-stretch md:p-9">
      {/* Reel vertical */}
      <div className="mx-auto w-full max-w-[260px] shrink-0 md:mx-0">
        <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-ink shadow-card ring-1 ring-black/10">
          <video
            className="h-full w-full object-cover"
            src={video.videoSrc}
            poster={video.posterSrc}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>

      {/* Métrica + comentarios */}
      <div className="flex w-full min-w-0 flex-1 flex-col">
        {/* Badge de reproducciones */}
        <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-lime px-4 py-1.5 text-sm font-semibold text-ink">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {video.views}
        </span>

        {/* Bloque de comentarios: carrusel infinito centrado junto al reel */}
        <div className="mt-6 flex min-w-0 flex-1 flex-col justify-center md:mt-0">
          <p className="mb-4 text-base font-medium text-white/85 md:text-lg">
            Y esto fue lo que la gente respondió:
          </p>
          <div className="marquee marquee-mask w-full min-w-0 overflow-hidden">
            <div
              className="marquee-track"
              style={{ animationDuration: `${video.comments.length * 3.75}s` }}
            >
              {[...video.comments, ...video.comments].map((src, i) => (
                <div
                  key={i}
                  className="mr-4 flex h-[140px] w-[300px] shrink-0 items-center rounded-2xl bg-white p-3 shadow-float ring-1 ring-black/5"
                >
                  <Image
                    src={src}
                    alt="Comentario de un cliente potencial"
                    width={1080}
                    height={360}
                    loading="eager"
                    unoptimized
                    className="h-auto w-full rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function BestVideos() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {VIDEOS.map((video, i) => (
        <VideoCard key={i} video={video} />
      ))}
    </div>
  )
}
