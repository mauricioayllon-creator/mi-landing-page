/**
 * Sección "Tecnología propia" — diferenciador: Plataforma + Agente de IA.
 * Texto a la izquierda, captura del dashboard a la derecha. Misma tarjeta
 * con degradado esmeralda que el resto del sitio.
 */

import Image from 'next/image'

type Feature = { label: string; desc: string }

const FEATURES: Feature[] = [
  {
    label: 'Plataforma',
    desc: 'Medí y tené el control financiero de todo tu negocio en un solo lugar: cuántos clientes entran, cuánto facturás y qué está funcionando — en tiempo real, sin planillas ni suposiciones.',
  },
  {
    label: 'Agente de IA para WhatsApp',
    desc: 'Convertimos la IA en tu mejor empleado: trabaja 24/7, sin sueldo, sin vacaciones y sin días libres. Le responde al instante a cada persona que te escribe, para que dejes de perder clientes en WhatsApp y te olvides de contestar mensajes cuando te toca descansar.',
  },
]

export default function Platform() {
  return (
    <div className="mx-auto max-w-5xl">
      <article className="testimonial-gradient flex flex-col gap-8 rounded-3xl p-7 text-titulo shadow-card md:flex-row md:items-center md:gap-10 md:p-9">
        {/* Texto */}
        <div className="flex w-full flex-col gap-6 md:w-[42%]">
          {FEATURES.map((f) => (
            <div key={f.label}>
              <h3 className="text-lg font-bold text-lime md:text-xl">
                {f.label}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-white/85">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Captura del dashboard */}
        <div className="w-full md:flex-1">
          <div className="overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10">
            <Image
              src="/plataforma-screenshot.jpg"
              alt="Plataforma de Unreal Marketing: tablero con métricas, leads y resultados en tiempo real"
              width={1548}
              height={754}
              className="h-auto w-full"
            />
          </div>
        </div>
      </article>
    </div>
  )
}
