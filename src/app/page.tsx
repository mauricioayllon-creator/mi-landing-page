/**
 * Página que el dueño de una tienda abre DESPUÉS de la primera visita en persona.
 * Cada sección responde una de las 4 preguntas de cualquier comprador ($100M Offers, cap. 6):
 * ¿qué logro? · ¿cómo sé que va a pasar? · ¿cuánto tarda? · ¿qué tengo que hacer? (+ el riesgo).
 * El centro es el SISTEMA y la OFERTA, no un caso: los casos van como prueba social.
 * La explicación larga y las historias (5 tiendas, 50 personas) van en el video (VSL).
 *
 * Lo que cambia seguido (WhatsApp, videos, precio, garantía) está en src/features/landing/config.ts.
 * Los componentes viejos (AgentDemo, Platform, BestVideos, Testimonials, CalendlyTracker) se
 * conservan intactos, pero ya no están en la página.
 */

import Image from 'next/image'
import FAQ from '@/features/landing/FAQ'
import VideoSlot from '@/features/landing/VideoSlot'
import ComoFunciona from '@/features/landing/ComoFunciona'
import TuTienda from '@/features/landing/TuTienda'
import Oferta from '@/features/landing/Oferta'
import PruebaSocial from '@/features/landing/PruebaSocial'
import WhatsAppButton from '@/features/landing/WhatsAppButton'
import { BarraWhatsApp, Footer, Nav, TituloSeccion } from '@/features/landing/Marco'
import {
  GARANTIA_PARTE,
  INVERSION_REFERENCIA,
  LANZAMIENTOS_POR_MES,
  PERSONA,
  VSL_PRINCIPAL,
} from '@/features/landing/config'

const MENSAJE = 'Hola Mauricio, vi tu página. Mi tienda es ____ y mi próxima fecha fuerte es ____.'

function Hero() {
  return (
    <section
      className="relative overflow-hidden text-titulo"
      style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 0%, #1559c9 0%, #0b3b8c 32%, #071a40 75%, #0d0d0d 100%)' }}
    >
      <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-32 text-center md:pt-36">
        <span className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-acento ring-1 ring-acento/40 md:text-sm">
          <span className="h-2 w-2 rounded-full bg-acento" />
          Para dueños de tiendas en La Paz
        </span>

        <h1
          className="mx-auto mt-7 max-w-3xl font-semibold text-titulo"
          style={{ fontSize: 'clamp(2.2rem, 6.2vw, 3.75rem)', lineHeight: 1.06, letterSpacing: '-1.5px' }}
        >
          Que tu próxima promo llene tu tienda,{' '}
          <span className="text-acento">no tu WhatsApp</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
          Armamos tu promo con fecha, grabo los videos y lanzamos la publicidad. Tu cliente guarda un
          cupón de tu tienda, elige su día y su hora, y llega a comprar.
        </p>

        {VSL_PRINCIPAL && (
          <div className="mt-10">
            <VideoSlot video={VSL_PRINCIPAL} titulo="Cómo funciona el Lanzamiento Tienda Llena" />
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <WhatsAppButton mensaje={MENSAJE}>Escríbeme tu próxima fecha fuerte</WhatsAppButton>
          {GARANTIA_PARTE && (
            <p className="max-w-md text-sm leading-relaxed text-white/65">
              Con garantía: si tu promo no llega al mínimo de ventas que sacamos con tus números, el
              siguiente lanzamiento te lo hago sin cobrar.{' '}
              <a href="#cuenta" className="font-semibold text-acento underline underline-offset-4">
                Calcula la tuya
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function Cierre() {
  return (
    <section className="bg-ink px-6 py-20 text-titulo">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Image
          src="/mauricio-ayllon.jpg"
          alt={PERSONA}
          width={128}
          height={128}
          className="h-32 w-32 rounded-full object-cover ring-4 ring-acento/40"
        />
        <h2
          className="mt-6 font-bold"
          style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-1px' }}
        >
          Soy Mauricio. Se viene <span className="text-acento">fin de año</span>
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">
          Es la temporada más fuerte para una tienda. Una promo se arma con unas 2 semanas de
          anticipación, y tomo {LANZAMIENTOS_POR_MES} tiendas por mes. Escríbeme tu fecha y la armamos.
        </p>
        <div className="mt-8">
          <WhatsAppButton mensaje={MENSAJE}>Escríbeme por WhatsApp</WhatsAppButton>
        </div>
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-white/50">
          P.D. Si cada venta te deja muy poca ganancia, un cupón no te conviene y te lo voy a decir
          antes de que gastes un peso.
        </p>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Nav mensaje={MENSAJE} />

      <main id="top">
        <Hero />

        <section className="bg-hielo px-6 py-20">
          <TituloSeccion etiqueta="El sistema">
            Cómo funciona, y <span className="text-marca">por qué funciona</span>
          </TituloSeccion>
          <ComoFunciona />
        </section>

        <section id="cuenta" className="bg-white px-6 py-20">
          <TituloSeccion etiqueta="En tu tienda" bajada="Elige qué vendes. Los números son de ejemplo; en la visita los hacemos con los tuyos.">
            ¿Qué vendes? <span className="text-marca">Así se vería tu promo</span>
          </TituloSeccion>
          <TuTienda inversion={INVERSION_REFERENCIA} />
        </section>

        <section className="bg-hielo px-6 py-20">
          <TituloSeccion etiqueta="En una hoja">
            Lo que te ofrezco, <span className="text-marca">sin letra chica</span>
          </TituloSeccion>
          <Oferta />
        </section>

        <section className="bg-hielo px-6 pb-20">
          <TituloSeccion>
            Negocios con los que <span className="text-marca">ya trabajé</span>
          </TituloSeccion>
          <PruebaSocial />
        </section>

        <section className="bg-hielo px-6 pb-20">
          <TituloSeccion>
            Lo que más me <span className="text-marca">preguntan</span>
          </TituloSeccion>
          <FAQ />
        </section>

        <Cierre />
        <Footer />
      </main>

      <BarraWhatsApp
        mensaje={MENSAJE}
        texto={
          <>
            Que tu promo llene <span className="font-semibold text-acento">tu tienda</span>
          </>
        }
      />
    </>
  )
}
