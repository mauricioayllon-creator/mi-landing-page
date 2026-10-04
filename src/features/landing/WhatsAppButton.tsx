'use client'

import { linkWhatsApp } from './config'

type Fbq = (accion: string, evento: string) => void

/** Botón a WhatsApp con el mensaje ya escrito. Cuenta el clic en el Pixel de Meta como "Contact". */
export default function WhatsAppButton({
  mensaje,
  children,
  className = 'px-6 py-3.5',
  secundario = false,
}: {
  mensaje: string
  children: React.ReactNode
  className?: string
  secundario?: boolean
}) {
  const colores = secundario
    ? 'bg-white/10 text-titulo ring-1 ring-white/20'
    : 'degradado-acento text-ink shadow-[0_10px_30px_-8px_rgba(30,200,255,0.55)]'
  return (
    <a
      href={linkWhatsApp(mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => (window as unknown as { fbq?: Fbq }).fbq?.('track', 'Contact')}
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold shadow-float transition-transform hover:scale-[1.03] active:scale-95 ${colores} ${className}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.69-1.42 1.32-1.97 1.37-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.18-4.94-4.37-.15-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.69-.17 1.38Z" />
      </svg>
      {children}
    </a>
  )
}
