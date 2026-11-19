import Image from 'next/image'

/**
 * Prueba social: negocios de rubros distintos, con números que el usuario confirmó.
 * Sneaker Fashion: 1.000 Bs de servicio + 512 Bs de publicidad, 5 videos, más de 236 mil vistas
 * (dato del usuario, 2026-10-04). Ventas de la promo: 21.100 Bs (dato del usuario, 2026-10-13)
 * → 21.100 / 1.512 = 13,95: "casi 14 Bs por cada 1". Por pedido del usuario (2026-10-13) no se
 * muestran los pares vendidos ni cuántas personas escribieron.
 */

const SNEAKER = [
  { cifra: 'Casi 14 Bs', texto: 'en ventas por cada 1 Bs invertido' },
  { cifra: '+236 mil', texto: 'vistas en 5 videos' },
]

const OTROS = [
  { negocio: 'Grupo Alfa · instituto', resultado: 'Más de 500 interesados en un mes', logo: '/testimonio-grupoalfa.jpeg' },
  { negocio: 'First Class Institute', resultado: 'Clientes nuevos todos los meses', logo: '/testimonio-firstclass.jpg' },
]

export default function PruebaSocial() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 md:p-7">
          <div className="flex items-center gap-3">
            <Image
              src="/sneaker-fashion-logo.jpg"
              alt="Sneaker Fashion"
              width={56}
              height={56}
              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/5"
            />
            <div>
              <p className="font-bold text-ink">Sneaker Fashion</p>
              <p className="text-sm text-ink/55">Tienda de tenis · promo del 21 de septiembre</p>
            </div>
          </div>
          <p className="mt-5 text-2xl font-bold leading-snug tracking-tight text-ink">
            Invirtió 1.512 Bs y vendió <span className="text-azul">21.100 Bs</span>.
          </p>
          <p className="mt-1 text-ink/60">Esos 1.512 Bs son todo: mi servicio y la publicidad.</p>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            {SNEAKER.map(({ cifra, texto }) => (
              <div key={texto} className="rounded-2xl bg-hielo p-3">
                <dt className="text-xl font-bold text-marca">{cifra}</dt>
                <dd className="text-sm text-ink/60">{texto}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="flex gap-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 md:p-7">
          <div className="aspect-[9/16] w-36 shrink-0 overflow-hidden rounded-2xl bg-ink sm:w-44">
            <video
              className="h-full w-full object-cover"
              src="/testimonio-milkyway.mp4"
              poster="/testimonio-milkyway-poster.jpg"
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <Image
                src="/testimonio-milkyway.jpeg"
                alt="Milky Way"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-black/5"
              />
              <p className="font-bold text-ink">Milky Way</p>
            </div>
            <p className="mt-4 text-2xl font-bold leading-snug tracking-tight text-ink">
              De 4.156 a <span className="text-azul">17.554 Bs</span> en el primer mes
            </p>
            <p className="mt-2 text-sm text-ink/60">Heladería. El dueño lo cuenta en el video.</p>
          </div>
        </article>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2">
        {OTROS.map(({ negocio, resultado, logo }) => (
          <li key={negocio} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-float ring-1 ring-black/5">
            <Image src={logo} alt={negocio} width={48} height={48} className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-black/5" />
            <span>
              <span className="block text-lg font-bold leading-snug text-ink">{resultado}</span>
              <span className="mt-0.5 block text-sm text-ink/55">{negocio}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
