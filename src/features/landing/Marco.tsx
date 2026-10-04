import Image from 'next/image'
import WhatsAppButton from './WhatsAppButton'
import { LOGO, MARCA, PERSONA } from './config'

/** Navbar flotante, igual en todas las páginas. */
export function Nav({ mensaje }: { mensaje: string }) {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-pill bg-ink/95 px-4 py-3 shadow-float backdrop-blur md:px-5">
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1">
            <Image src={LOGO} alt={MARCA} width={32} height={38} className="h-full w-auto object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-sm font-semibold text-titulo md:text-base">{MARCA}</span>
            <span className="block whitespace-nowrap text-[11px] text-white/55">{PERSONA}</span>
          </span>
        </a>
        <WhatsAppButton mensaje={mensaje} className="px-3.5 py-2.5 text-sm md:px-4">
          <span className="sm:hidden">WhatsApp</span>
          <span className="hidden sm:inline">Escríbeme por WhatsApp</span>
        </WhatsAppButton>
      </nav>
    </header>
  )
}

/** Título de sección: etiqueta pequeña + H2 con una parte resaltada. */
export function TituloSeccion({
  etiqueta,
  children,
  bajada,
  claro = false,
}: {
  etiqueta?: string
  children: React.ReactNode
  bajada?: React.ReactNode
  claro?: boolean
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {etiqueta && (
        <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${claro ? 'text-acento' : 'text-marca'}`}>
          {etiqueta}
        </p>
      )}
      <h2
        className={`font-bold ${claro ? 'text-titulo' : 'text-ink'}`}
        style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-1px' }}
      >
        {children}
      </h2>
      {bajada && (
        <p className={`mt-4 text-lg leading-relaxed ${claro ? 'text-white/75' : 'text-ink/65'}`}>{bajada}</p>
      )}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-hielo px-6 py-10 pb-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-black/5">
            <Image src={LOGO} alt={MARCA} width={28} height={34} className="h-full w-auto object-contain" />
          </span>
          <span className="text-sm font-semibold text-ink">
            {MARCA} · {PERSONA}
          </span>
        </div>
        <p className="text-center text-sm text-ink/50">
          La Paz, Bolivia · antes Unreal Marketing · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}

/** Barra fija abajo con el botón de WhatsApp (pensada para el celular). */
export function BarraWhatsApp({ texto, mensaje }: { texto: React.ReactNode; mensaje: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-pill bg-ink px-5 py-3 shadow-float md:px-6">
        <p className="text-sm font-medium text-titulo sm:text-base">{texto}</p>
        <WhatsAppButton mensaje={mensaje} className="shrink-0 px-4 py-2.5 text-sm">
          Escríbeme
        </WhatsAppButton>
      </div>
    </div>
  )
}
