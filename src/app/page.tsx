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
 *
 * 2026-10-13 (pedido del usuario): fuera la calculadora, la oferta "en una hoja" (mucho texto) y el
 * precio. El precio se habla en la reunión. La calculadora y la garantía en cupones siguen en /propuesta.
 * El botón regala algo en vez de pedir una reunión: la promo de su próxima fecha, armada gratis
 * (el regalo de la visita 1, ficha 14 §3.2; regalar servicio triplicó la respuesta en [L1.7]).
 *
 * 2026-10-25 (pedido del usuario): el botón pide agendar una llamada. "Cómo funciona" y "¿Qué vendes?"
 * quedan ocultas, no borradas: se vuelven a mostrar con SECCIONES en config.ts.
 * La promo gratis sigue en la oferta pero no se nombra (PROMO_GRATIS en config.ts). Cada sección
 * termina con el mismo botón y una guía de qué pasa al tocarlo; en el celular, si no entra, "Escríbeme".
 */

import Image from 'next/image'
import FAQ from '@/features/landing/FAQ'
import VideoSlot from '@/features/landing/VideoSlot'
import ComoFunciona from '@/features/landing/ComoFunciona'
import TuTienda from '@/features/landing/TuTienda'
import PruebaSocial from '@/features/landing/PruebaSocial'
import WhatsAppButton from '@/features/landing/WhatsAppButton'
import { BarraWhatsApp, Footer, Nav, TituloSeccion } from '@/features/landing/Marco'
import {
  GARANTIA_PARTE,
  LANZAMIENTOS_POR_MES,
  PERSONA,
  PROMO_GRATIS,
  SECCIONES,
  VSL_PRINCIPAL,
} from '@/features/landing/config'

const MENSAJE = 'Hola, vi el video y quiero agendar una llamada.'
const BOTON = 'Quiero agendar una llamada'
const BOTON_CORTO = 'Escríbeme'

/**
 * El botón principal con una guía antes ("Dale clic aquí") y después (qué pasa al tocarlo),
 * para que nadie se quede sin saber qué hacer. `claro` = texto claro, para fondos oscuros.
 */
function LlamadaALaAccion({ claro = false, antes }: { claro?: boolean; antes?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {antes && <p className={`mb-3 text-xl font-bold ${claro ? 'text-titulo' : 'text-ink'}`}>{antes}</p>}
      <p className={`flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest ${claro ? 'text-acento' : 'text-marca'}`}>
        Dale clic aquí
        <svg
          className="h-4 w-4 motion-safe:animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </p>
      <WhatsAppButton mensaje={MENSAJE} className="px-5 py-3.5 text-[15px] sm:px-6 sm:text-base">
        {BOTON}
      </WhatsAppButton>
      <p className={`max-w-sm text-sm leading-relaxed ${claro ? 'text-white/70' : 'text-ink/60'}`}>
        Se abre tu WhatsApp con el mensaje listo. Solo tocas enviar y elegimos juntos el día y la hora.
      </p>
    </div>
  )
}

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
          Vende más que tu competencia,{' '}
          <span className="text-acento">sin bajar tu precio</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
          El camino de un extraño: que te vea, te elija, llegue y compre. Te hago videos que no pasa de
          largo, armamos una oferta mejor que una rebaja y llega a tu tienda con su día y su hora.
        </p>

        {VSL_PRINCIPAL && (
          <div className="mt-10">
            <VideoSlot video={VSL_PRINCIPAL} titulo="Cómo funciona el Lanzamiento Tienda Llena" />
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <LlamadaALaAccion claro />
          {PROMO_GRATIS && (
            <p className="max-w-md leading-relaxed text-white/80">
              En la llamada vemos tu próxima fecha y te llevo la promo armada a tu tienda, gratis. Si te
              sirve, la lanzamos juntos; si no, te la quedas igual.
            </p>
          )}
          {GARANTIA_PARTE && (
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              Con garantía: me pagas la mitad para empezar, y la otra mitad cuando ya te estén llegando
              clientes.
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
          anticipación, y tomo {LANZAMIENTOS_POR_MES} tiendas por mes.{' '}
          {PROMO_GRATIS
            ? 'Agenda una llamada y te llevo la tuya armada, gratis.'
            : 'Agenda una llamada y vemos la fecha de tu tienda.'}
        </p>
        <div className="mt-8">
          <LlamadaALaAccion claro />
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
      <Nav mensaje={MENSAJE} boton={BOTON} botonCorto={BOTON_CORTO} />

      <main id="top">
        <Hero />

        {SECCIONES.comoFunciona && (
          <section className="bg-hielo px-6 py-20">
            <TituloSeccion etiqueta="El sistema">
              Cómo funciona, y <span className="text-marca">por qué funciona</span>
            </TituloSeccion>
            <ComoFunciona />
          </section>
        )}

        {SECCIONES.tuTienda && (
          <section className="bg-white px-6 py-20">
            <TituloSeccion etiqueta="En tu tienda" bajada="Elige qué vendes. Es un ejemplo: la tuya la armamos con lo que vendes de verdad.">
              ¿Qué vendes? <span className="text-marca">Así se vería tu promo</span>
            </TituloSeccion>
            <TuTienda />
          </section>
        )}

        <section className="bg-hielo px-6 py-20">
          <TituloSeccion>
            Negocios con los que <span className="text-marca">ya trabajé</span>
          </TituloSeccion>
          <PruebaSocial />
          <div className="mt-14">
            <LlamadaALaAccion antes="¿Quieres algo así para tu tienda?" />
          </div>
        </section>

        <section className="bg-hielo px-6 pb-20">
          <TituloSeccion>
            Lo que más me <span className="text-marca">preguntan</span>
          </TituloSeccion>
          <FAQ />
          <div className="mt-14">
            <LlamadaALaAccion antes="¿Te quedó otra duda? Te la respondo en la llamada." />
          </div>
        </section>

        <Cierre />
        <Footer />
      </main>

      <BarraWhatsApp
        mensaje={MENSAJE}
        boton={BOTON}
        botonCorto={BOTON_CORTO}
        texto={
          <>
            Agenda tu llamada <span className="font-semibold text-acento">aquí →</span>
          </>
        }
      />
    </>
  )
}
