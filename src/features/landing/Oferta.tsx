import { GARANTIA_DIAS_EXTRA, GARANTIA_PARTE, LANZAMIENTOS_POR_MES, NOMBRE_OFERTA, PAUTA_MAX, PAUTA_MIN, PRECIO_SERVICIO } from './config'

/**
 * La oferta en una hoja: responde las 4 preguntas que le hizo a Hormozi su papá
 * (¿qué logro?, ¿cómo sé que va a pasar?, ¿cuánto tarda?, ¿qué tengo que hacer?) más el riesgo.
 * El número de cupones de la garantía lo saca la calculadora con los números de cada tienda.
 * Desde el 2026-10-13 la hoja ya no está en la página principal (pedido del usuario: mucho texto, y el
 * precio se habla en la reunión). TextoGarantia y CondicionesGarantia los sigue usando /propuesta.
 */

export function TextoGarantia() {
  if (!GARANTIA_PARTE) return null
  return (
    <>
      Me pagas la mitad para empezar. La otra mitad, recién cuando te lleguen los clientes que necesitas para
      recuperar lo que pusiste (los que te marca la calculadora). Cuenta cada cliente que llega con su cupón y tú lo
      validas, compre o no. Si en tu fecha no llegan, sigo {GARANTIA_DIAS_EXTRA} días más con tu video ganador, sin
      costo; y si igual no llegan, no me la pagas.
    </>
  )
}

/** Las condiciones y por qué se cuentan llegadas (admisión: lo de adentro de la tienda no depende de mí). */
export function CondicionesGarantia() {
  return (
    <>
      Solo te pido tu parte: tus accesos, aprobar los videos en 24 horas, al menos {PAUTA_MIN} Bs de publicidad,
      tu stock separado y validar cada cupón en tu panel. Si no la cumples, la otra mitad se paga igual en la fecha
      del acuerdo. ¿Por qué cuento llegadas y no ventas? Porque lo que pasa dentro de tu tienda (tu precio, tus
      vendedores, tu producto) depende de ti. Lo que depende de mí, lo garantizo.
    </>
  )
}

export default function Oferta() {
  const filas = [
    {
      q: 'Lo que logras',
      a: 'Una fecha con clientes que llegan a tu tienda con su cupón reservado, y la cuenta exacta de cuánto vendiste.',
    },
    {
      q: 'Lo que hago yo',
      a: 'Armamos la oferta juntos. Escribo, grabo y edito los videos. Configuro la publicidad y la vigilo todos los días. Armo tu cupón con día y hora, los recordatorios y el conteo de cada venta.',
    },
    {
      q: 'Lo que haces tú',
      a: `Unas 3 horas para grabar, separar el stock de la promo y poner la publicidad desde tu cuenta (${PAUTA_MIN} a ${PAUTA_MAX} Bs).`,
    },
    { q: 'Cuánto tarda', a: 'Unas 2 semanas desde que armamos la oferta hasta el día de tu promo.' },
  ]

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
      <div className="degradado-marca px-7 py-6 text-titulo">
        <p className="text-sm font-semibold uppercase tracking-widest text-acento">La oferta</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{NOMBRE_OFERTA}</h3>
      </div>

      <dl className="divide-y divide-black/5 px-7">
        {filas.map(({ q, a }) => (
          <div key={q} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="font-bold text-ink">{q}</dt>
            <dd className="leading-relaxed text-ink/75">{a}</dd>
          </div>
        ))}
        {GARANTIA_PARTE && (
          <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="font-bold text-ink">Si no funciona</dt>
            <dd className="leading-relaxed text-ink/75">
              <span className="font-semibold text-ink">
                <TextoGarantia />
              </span>{' '}
              <CondicionesGarantia />
            </dd>
          </div>
        )}
      </dl>

      <p className="bg-hielo px-7 py-4 text-center text-sm text-ink/65">
        Tomo {LANZAMIENTOS_POR_MES} tiendas por mes, porque grabo y edito yo. Mi servicio parte en{' '}
        {PRECIO_SERVICIO.toLocaleString('es-BO')} Bs.
      </p>
    </div>
  )
}
