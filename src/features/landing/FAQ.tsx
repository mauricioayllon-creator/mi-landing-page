/**
 * Las dudas que más salen en las visitas, respondidas cortito.
 * Usa <details>/<summary> nativo → accesible y sin JS.
 * ⚠️ Solo promesas que dependen de nosotros. Si algo cambia en la oferta, cámbialo aquí.
 * Sin "¿Cuánto cuesta?": el precio se habla en la reunión, no en la página (pedido del usuario, 2026-10-13).
 */

import { SECCIONES } from './config'

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Funciona en mi rubro?',
    // La última frase remite a la sección "¿Qué vendes?": solo va si esa sección se ve.
    a: `Funciona en tiendas que venden algo que cualquiera compra y que deja buena ganancia por venta: tenis, celulares, colchones, relojes, ropa, cosas para bebé. De un rubro a otro cambia la oferta, no el sistema.${SECCIONES.tuTienda ? ' Más arriba puedes ver cómo se vería en el tuyo.' : ''}`,
  },
  {
    q: 'Ya pagué publicidad y no vendí nada',
    a: 'Pasa casi siempre. La publicidad sí trae gente, pero en el camino se pierden: uno se olvida, otro no te cree, otro pregunta precio y no vuelve. Mi trabajo es que lleguen hasta tu puerta con su cupón. Lo de adentro (tu precio, tu atención, tu producto) depende de ti, y te lo digo antes de empezar.',
  },
  {
    q: '¿Y si reservan y no vienen?',
    a: 'Cada uno elige su día y su hora, y le llega un recordatorio el día antes y el mismo día. El cupón solo vale esa fecha. Y si a mitad del lanzamiento un video no trae reservas, lo cambiamos ese día, no al final.',
  },
]

export default function FAQ() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {FAQS.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-2xl degradado-marca px-6 py-5 text-titulo shadow-float transition-shadow open:shadow-card"
        >
          <summary className="flex items-center justify-between gap-4">
            <span className="text-lg font-semibold leading-snug">{q}</span>
            <svg
              className="faq-arrow h-5 w-5 shrink-0 text-acento"
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
