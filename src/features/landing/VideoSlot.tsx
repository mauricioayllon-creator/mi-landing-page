import type { Video } from './config'

/** Tamaño del marco según el formato: vertical (grabado con el celular) u horizontal. */
export function claseMarco(video: Video) {
  return video.formato === 'horizontal'
    ? 'mx-auto aspect-video w-full max-w-3xl'
    : 'mx-auto aspect-[9/16] w-full max-w-[340px]'
}

/** Muestra un video de YouTube (no listado) o un .mp4 propio, vertical u horizontal. */
export default function VideoSlot({ video, titulo }: { video: Video; titulo: string }) {
  return (
    <div className={`${claseMarco(video)} overflow-hidden rounded-3xl bg-ink shadow-card ring-1 ring-white/10`}>
      {video.tipo === 'youtube' ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&playsinline=1`}
          title={titulo}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <video
          className="h-full w-full object-cover"
          src={video.src}
          poster={video.poster}
          controls
          playsInline
          preload="metadata"
        />
      )}
    </div>
  )
}
