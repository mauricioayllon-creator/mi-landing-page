/**
 * /propuesta — se manda DESPUÉS de la segunda visita, sobre todo si dicen "lo pienso" o
 * "lo hablo con mi socio/esposa". Corta: el proceso en 4 pasos, la inversión con la cuenta
 * de recuperación, los riesgos dichos de frente y el botón.
 *
 * Se personaliza con el link:
 *   /propuesta?t=Sneaker%20Fashion&p=1800&f=21%20de%20octubre
 *   t = nombre de la tienda · p = precio del servicio en Bs · f = fecha del lanzamiento
 * Sin parámetros usa el precio de config.ts.
 */

import type { Metadata } from 'next'
import VideoSlot from '@/features/landing/VideoSlot'
import WhatsAppButton from '@/features/landing/WhatsAppButton'
import Simulador from '@/features/landing/Simulador'
import { BarraWhatsApp, Footer, Nav, TituloSeccion } from '@/features/landing/Marco'
import { CondicionesGarantia, TextoGarantia } from '@/features/landing/Oferta'
import {
  GARANTIA_PARTE,
  NOMBRE_OFERTA,
  PAUTA_MAX,
  PAUTA_MIN,
  PRECIO_SERVICIO,
  VSL_PROPUESTA,
} from '@/features/landing/config'

export const metadata: Metadata = {
  title: 'Tu propuesta de lanzamiento',
  robots: { index: false, follow: false },
}

type Params = Promise<Record<string, string | string[] | undefined>>

function texto(valor: string | string[] | undefined, max: number) {
  const v = Array.isArray(valor) ? valor[0] : valor
  return (v ?? '').replace(/[<>]/g, '').trim().slice(0, max)
}

const PASOS = [
  { titulo: 'Armamos tu oferta juntos', texto: 'El porqué, la fecha, el valor del cupón y cuántas unidades separas.' },
  { titulo: 'La ponemos en tu cupón', texto: 'Con tu nombre. Tu cliente elige su día y su hora.' },
  { titulo: 'Videos y publicidad', texto: 'Grabo en tu tienda (unas 3 horas), edito y lanzamos la publicidad con fecha.' },
  { titulo: 'El día de la promo', texto: 'Llegan con su cupón. Al final ves cuántos reservaron, cuántos vinieron y cuánto vendiste.' },
]

const RIESGOS = [
  {
    q: '¿Y si reservan y no vienen?',
    a: 'Les llega un recordatorio el día antes y el mismo día, y el cupón solo vale esa fecha.',
  },
  {
    q: '¿Y si un video no funciona?',
    a: 'La publicidad va a varios videos. El que no trae reservas se cambia ese mismo día.',
  },
  {
    q: '¿Y si se acaba el stock antes?',
    a: 'Los cupones son exactamente las unidades que separaste. Cuando se acaban, se cierra solo.',
  },
]

export default async function Propuesta({ searchParams }: { searchParams: Params }) {
  const p = await searchParams
  const tienda = texto(p.t, 60)
  const fecha = texto(p.f, 40)
  const precioLink = Number(texto(p.p, 6))
  const precio = precioLink >= 100 && precioLink <= 50000 ? precioLink : PRECIO_SERVICIO

  const mensajeSi = `Hola Mauricio, revisé la propuesta. Quiero confirmar el lanzamiento${tienda ? ` de ${tienda}` : ''}${fecha ? ` para el ${fecha}` : ''}.`
  const mensajeDuda = `Hola Mauricio, revisé la propuesta${tienda ? ` de ${tienda}` : ''}. Tengo una duda: `

  return (
    <>
      <Nav mensaje={mensajeDuda} />

      <main>
        <section
          className="relative overflow-hidden text-titulo"
          style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 0%, #1559c9 0%, #0b3b8c 32%, #071a40 75%, #0d0d0d 100%)' }}
        >
          <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-32 text-center md:pt-36">
            <span className="inline-flex rounded-pill bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-acento ring-1 ring-white/15 md:text-sm">
              {NOMBRE_OFERTA}{tienda ? ` · ${tienda}` : ''}
            </span>
            <h1
              className="mx-auto mt-7 font-semibold"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 3.1rem)', lineHeight: 1.1, letterSpacing: '-1.2px' }}
            >
              Lo que hablamos, para que lo <span className="text-acento">revises tranquilo</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              Si lo decides con alguien más, pásale esta página.
            </p>
            {fecha && (
              <p className="mx-auto mt-5 inline-block rounded-2xl bg-white/10 px-5 py-3 text-base text-white/85 ring-1 ring-white/15">
                Fecha de la promo: <span className="font-semibold text-acento">{fecha}</span>
              </p>
            )}
            {VSL_PROPUESTA && (
              <div className="mt-10">
                <VideoSlot video={VSL_PROPUESTA} titulo="Tu propuesta, en video" />
              </div>
            )}
          </div>
        </section>

        <section className="bg-hielo px-6 py-20">
          <TituloSeccion>
            Cómo lo <span className="text-marca">hacemos</span>
          </TituloSeccion>
          <ol className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {PASOS.map(({ titulo, texto: detalle }, i) => (
              <li key={titulo} className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-float ring-1 ring-black/5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl degradado-marca font-bold text-titulo">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-bold text-ink">{titulo}</span>
                  <span className="mt-1 block leading-relaxed text-ink/70">{detalle}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-hielo px-6 pb-20">
          <TituloSeccion
            bajada={`El servicio es ${precio.toLocaleString('es-BO')} Bs. La publicidad (${PAUTA_MIN} a ${PAUTA_MAX} Bs) la pagas tú desde tu cuenta y nunca pasa por mí.`}
          >
            ¿En cuántas ventas lo <span className="text-marca">recuperas</span>?
          </TituloSeccion>
          <Simulador inversion={precio + PAUTA_MAX} />
        </section>

        {GARANTIA_PARTE && (
          <section className="bg-hielo px-6 pb-12">
            <div className="mx-auto max-w-3xl rounded-3xl degradado-marca p-7 text-center text-titulo shadow-card">
              <p className="text-sm font-semibold uppercase tracking-widest text-acento">Si no funciona</p>
              <p className="mt-3 text-xl leading-relaxed">
                <TextoGarantia />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                <CondicionesGarantia />
              </p>
            </div>
          </section>
        )}

        <section className="bg-hielo px-6 pb-20">
          <TituloSeccion>
            Lo que te puede <span className="text-marca">preocupar</span>
          </TituloSeccion>
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {RIESGOS.map(({ q, a }) => (
              <div key={q} className="rounded-3xl bg-white p-6 shadow-float ring-1 ring-black/5">
                <h3 className="text-lg font-bold text-ink">{q}</h3>
                <p className="mt-2 leading-relaxed text-ink/70">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink px-6 py-20">
          <TituloSeccion claro bajada="Si quieres, hacemos 15 minutos con tu socio o tu pareja, en tu tienda o por llamada.">
            Confirmemos <span className="text-acento">tu fecha</span>
          </TituloSeccion>
          <div className="flex flex-col items-center gap-4">
            <WhatsAppButton mensaje={mensajeSi}>Quiero confirmar la fecha</WhatsAppButton>
            <WhatsAppButton mensaje={mensajeDuda} secundario>
              Tengo una duda
            </WhatsAppButton>
          </div>
        </section>

        <Footer />
      </main>

      <BarraWhatsApp
        mensaje={mensajeSi}
        texto={<>¿Lo decidiste? <span className="font-semibold text-acento">Confirmemos la fecha</span></>}
      />
    </>
  )
}
