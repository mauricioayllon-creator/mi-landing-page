import Image from 'next/image'
import CalendlyTracker from '@/features/tracking/CalendlyTracker'
import VideoPlayer from '@/features/video/VideoPlayer'
import FAQ from '@/features/landing/FAQ'
import Testimonials from '@/features/landing/Testimonials'

const CALENDLY_URL = 'https://calendly.com/mauricio-ayllon-7/mauricio1-1'

/* ── Botón CTA píldora ──────────────────────────────────────── */
function CtaButton({
  children = 'Agendar una llamada',
  className = '',
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <a
      href="#agendar"
      className={`inline-flex items-center justify-center gap-2 rounded-pill bg-lime px-6 py-3.5 font-semibold text-ink shadow-float transition-transform hover:scale-[1.03] active:scale-95 ${className}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="14" height="12" rx="3" />
        <path d="m16 10 6-3v10l-6-3" />
      </svg>
      {children}
    </a>
  )
}

/* ── Bloque de agendamiento (Calendly) — reutilizable ───────── */
function CalendarBlock() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-card">
        <iframe
          src={CALENDLY_URL}
          className="h-[700px] w-full"
          title="Agendar una llamada"
          frameBorder="0"
        />
      </div>
      <p className="mx-auto mt-5 max-w-xl text-center text-sm italic text-ink/60">
        Valoramos tu tiempo tanto como el nuestro. Por favor, no agendes si no
        vas a asistir.
      </p>
    </div>
  )
}

/* ── Avatares apilados (prueba social) ──────────────────────── */
function StackedAvatars() {
  const gradients = [
    'from-lime to-emerald',
    'from-emerald to-ink',
    'from-naranja to-rojo',
    'from-lime to-emerald',
    'from-emerald to-lime',
  ]
  return (
    <div className="flex -space-x-3">
      {gradients.map((g, i) => (
        <span
          key={i}
          className={`h-10 w-10 rounded-full bg-gradient-to-br ${g} ring-2 ring-white`}
        />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <CalendlyTracker />

      {/* ─── 1. NAVBAR FLOTANTE FIJO ─────────────────────────── */}
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-pill bg-ink/95 px-4 py-3 shadow-float backdrop-blur md:px-5">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1">
              <Image src="/unreal-logo.png" alt="Unreal Marketing" width={32} height={32} className="h-full w-auto object-contain" />
            </span>
            <span className="text-sm font-semibold text-titulo md:text-base">
              Unreal Marketing
            </span>
          </a>
          <div className="flex items-center gap-2 md:gap-4">
            <a href="#testimonios" className="hidden px-3 text-sm font-medium text-white/70 transition-colors hover:text-titulo sm:block">
              Testimonios
            </a>
            <a
              href="#agendar"
              className="inline-flex items-center gap-2 rounded-pill bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="6" width="14" height="12" rx="3" />
                <path d="m16 10 6-3v10l-6-3" />
              </svg>
              Agendar una llamada
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* ─── 2. HERO ──────────────────────────────────────── */}
        <section
          className="relative overflow-hidden text-titulo"
          style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 0%, #00735f 0%, #005f51 30%, #06231e 75%, #0d0d0d 100%)' }}
        >
          <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-32 text-center md:pt-36">
            {/* Badge segmentación */}
            <span className="inline-flex items-center gap-2 rounded-pill bg-rojo px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white md:text-sm">
              <span className="h-2 w-2 rounded-full bg-white/90" />
              Para dueños de negocios locales
            </span>

            {/* H1 bicolor */}
            <h1
              className="mx-auto mt-7 max-w-3xl font-semibold text-titulo"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)', lineHeight: 1.08, letterSpacing: '-1.5px' }}
            >
              Conseguí clientes para tu negocio de forma{' '}
              <span className="text-lime">constante</span>, sin depender de la{' '}
              <span className="text-lime">suerte</span>.
            </h1>

            {/* Subtítulo / objeciones */}
            <p className="mx-auto mt-6 max-w-2xl text-lg font-normal leading-relaxed text-white/75">
              Sin depender de hacerte viral, sin gastar en publicidad que no
              funciona y sin que tengas que volverte experto en redes.
              Instalamos un sistema de contenido que te trae clientes mes a mes.
            </p>

            {/* Prueba social compacta */}
            <div className="mx-auto mt-9 inline-flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-4 text-ink shadow-float sm:flex-row sm:gap-5">
              <div className="flex items-center gap-3">
                <StackedAvatars />
                {/* ⚠️ Ajustá la cantidad de negocios a tu número real */}
                <span className="text-sm font-semibold">+20 negocios</span>
              </div>
              <span className="hidden h-8 w-px bg-ink/10 sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-naranja">4.9</span>
                <span className="text-naranja">★★★★★</span>
                <span className="text-sm text-ink/60">valoración de clientes</span>
              </div>
            </div>

            {/* Indicador de paso */}
            <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-lime">
              Paso 1 · Mirá el video
            </p>

            {/* VSL */}
            <div className="mx-auto mt-4 max-w-3xl">
              <VideoPlayer />
            </div>

            <div className="mt-9">
              <CtaButton>Agendar una llamada</CtaButton>
            </div>
          </div>
        </section>

        {/* ─── 3. BLOQUE DE AGENDAMIENTO ────────────────────── */}
        <section id="agendar" className="bg-cream px-6 py-20">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald">
              Paso 2 · Agendá tu llamada
            </p>
            <h2
              className="mt-3 font-bold text-ink"
              style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-1.2px' }}
            >
              Reservá una llamada{' '}
              <span className="text-emerald">sin compromiso</span>
            </h2>
          </div>
          <CalendarBlock />
        </section>

        {/* ─── 4. CASOS DE ÉXITO / TESTIMONIOS ──────────────── */}
        <section id="testimonios" className="bg-cream px-6 pb-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2
              className="font-bold text-ink"
              style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-1.2px' }}
            >
              Negocios que dejaron de depender de la{' '}
              <span className="text-emerald">suerte</span>
            </h2>
            <p className="mt-4 text-lg text-ink/60">
              Resultados reales de dueños como vos.
            </p>
          </div>
          <Testimonials />
        </section>

        {/* ─── 5. FAQ ───────────────────────────────────────── */}
        <section className="bg-cream px-6 pb-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2
              className="font-bold text-ink"
              style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-1.2px' }}
            >
              Preguntas <span className="text-emerald">frecuentes</span>
            </h2>
          </div>
          <FAQ />
        </section>

        {/* ─── 6. SECCIÓN FINAL DE AGENDAMIENTO ─────────────── */}
        <section className="bg-emerald px-6 py-20">
          <div className="mx-auto mb-8 max-w-3xl text-center text-titulo">
            <h2
              className="font-bold"
              style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-1.2px' }}
            >
              Tu próximo cliente puede llegar{' '}
              <span className="text-lime">este mes</span>
            </h2>
            <p className="mt-4 text-lg text-white/75">
              Agendá tu llamada y dejá de depender de la suerte para crecer.
            </p>
          </div>
          <CalendarBlock />
        </section>

        {/* ─── 7. FOOTER ────────────────────────────────────── */}
        <footer className="bg-cream px-6 py-10 pb-28">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-black/5">
                <Image src="/unreal-logo.png" alt="Unreal Marketing" width={28} height={28} className="h-full w-auto object-contain" />
              </span>
              <span className="text-sm font-semibold text-ink">Unreal Marketing</span>
            </div>
            <p className="text-sm text-ink/50">
              © {new Date().getFullYear()} Unreal Marketing. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </main>

      {/* ─── 8. BARRA CTA FLOTANTE FIJA ─────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-pill bg-ink px-5 py-3 shadow-float md:px-6">
          <p className="text-sm font-medium text-titulo sm:text-base">
            Escalá tu negocio local con clientes{' '}
            <span className="font-semibold text-lime">constantes</span>
            <span className="hidden sm:inline">
              {' '}— sin depender de la{' '}
              <span className="font-semibold text-naranja">suerte</span>
            </span>
          </p>
          <a
            href="#agendar"
            className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="6" width="14" height="12" rx="3" />
              <path d="m16 10 6-3v10l-6-3" />
            </svg>
            Agendar una llamada
          </a>
        </div>
      </div>
    </>
  )
}
