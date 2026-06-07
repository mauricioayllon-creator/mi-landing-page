/**
 * Acordeón de preguntas frecuentes.
 * Usa <details>/<summary> nativo → accesible y sin JS.
 *
 * ⚠️ Las RESPUESTAS están redactadas en base a tu posicionamiento.
 *    Revisalas y ajustá precios/tiempos a tu oferta real.
 */

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Esto funciona para mi tipo de negocio?',
    a: 'Sí. El sistema está pensado para negocios locales que dependen de que la gente de su zona los conozca y confíe en ellos: gimnasios, clínicas, estéticas, restaurantes, talleres, inmobiliarias y más. Adaptamos el contenido a tu rubro y a tu público. En la llamada lo confirmamos para tu caso puntual.',
  },
  {
    q: '¿Tengo que salir yo en cámara?',
    a: 'No es obligatorio. Hay formatos que funcionan sin que aparezcas (producto, lugar, proceso, clientes, equipo). Dicho esto, cuando el dueño aparece suele generar más confianza, así que te damos guiones y dirección para que sea simple y rápido si decidís hacerlo.',
  },
  {
    q: '¿En cuánto tiempo voy a ver resultados?',
    a: 'No vendemos magia de la noche a la mañana. Es un sistema constante: las primeras semanas montamos todo y empezás a ganar visibilidad, y el efecto compuesto de clientes que llegan mes a mes se siente con la constancia. En la llamada te damos expectativas realistas para tu negocio.',
  },
  {
    q: '¿Qué pasa si ningún video se hace viral?',
    a: 'No dependemos de hacernos virales. Ese es justamente el punto: la viralidad es suerte, y tu negocio no puede depender de la suerte. El sistema está diseñado para atraer clientes de forma constante con contenido que conecta con tu público local, se haga viral o no.',
  },
  {
    q: 'Ya intenté redes / publicidad antes y no funcionó. ¿Por qué esto sería distinto?',
    a: 'Porque la mayoría publica sin un sistema: postean cuando se acuerdan, sin estrategia y sin medir. Nosotros instalamos un sistema de contenido con un método claro, sin que tengas que volverte experto en redes ni quemar plata en publicidad que no convierte. Es estructura, no improvisación.',
  },
  {
    q: '¿Qué incluye exactamente y cuánto cuesta?',
    a: 'Incluye la instalación completa del sistema de contenido para tu negocio: estrategia, formatos, guiones y acompañamiento para que entren clientes mes a mes. La inversión depende de tu situación y objetivos, por eso lo vemos en la llamada: primero confirmamos que sea para vos y recién ahí hablamos de números.',
  },
]

export default function FAQ() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {FAQS.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-2xl bg-emerald px-6 py-5 text-titulo shadow-float transition-shadow open:shadow-card"
        >
          <summary className="flex items-center justify-between gap-4">
            <span className="text-lg font-semibold leading-snug">{q}</span>
            <svg
              className="faq-arrow h-5 w-5 shrink-0 text-lime"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="faq-answer mt-4 text-base leading-relaxed text-white/80">
            {a}
          </p>
        </details>
      ))}
    </div>
  )
}
