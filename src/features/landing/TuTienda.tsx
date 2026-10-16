'use client'

import { useState } from 'react'
import WhatsAppButton from './WhatsAppButton'

/**
 * "¿Qué vendes?": el dueño elige su rubro y ve una promo de ejemplo.
 * Responde "no es mi rubro": el sistema es el mismo, cambia la oferta.
 * La calculadora se sacó de aquí el 2026-10-13 (pedido del usuario: la gente no la iba a entender);
 * sigue en /propuesta. El botón pide la promo de su tienda, con el rubro ya escrito en el mensaje.
 */

type Rubro = { nombre: string; porque: string; regalo: string; cupon: number; unidades: number }

const RUBROS: Rubro[] = [
  { nombre: 'Tenis', porque: 'Llegó la colección nueva', regalo: 'unas medias', cupon: 100, unidades: 40 },
  { nombre: 'Celulares', porque: 'Aniversario de la tienda', regalo: 'funda y vidrio templado', cupon: 150, unidades: 30 },
  { nombre: 'Colchones', porque: 'Fin de año', regalo: '2 almohadas', cupon: 300, unidades: 20 },
  { nombre: 'Relojes', porque: 'Regalos de Navidad', regalo: 'caja de regalo', cupon: 80, unidades: 40 },
  { nombre: 'Mochilas y maletas', porque: 'Vacaciones de fin de año', regalo: 'un candado', cupon: 70, unidades: 50 },
  { nombre: 'Cosas para bebé', porque: 'Feria del bebé', regalo: 'un kit de regalo', cupon: 200, unidades: 20 },
]

export default function TuTienda() {
  const [i, setI] = useState(0)
  const r = RUBROS[i]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap justify-center gap-2">
        {RUBROS.map((rubro, n) => (
          <button
            key={rubro.nombre}
            type="button"
            onClick={() => setI(n)}
            className={`rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
              n === i ? 'degradado-marca text-titulo shadow-float' : 'bg-white text-ink/70 ring-1 ring-black/10 hover:ring-marca'
            }`}
          >
            {rubro.nombre}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-xl rounded-3xl border-2 border-dashed border-marca/40 bg-white p-6 text-center shadow-float">
        <p className="text-sm font-semibold uppercase tracking-widest text-marca">Tu promo, por ejemplo</p>
        <p className="mt-3 text-xl font-bold leading-snug text-ink">
          {r.porque}: cupón de {r.cupon} Bs + {r.regalo} de regalo.
        </p>
        <p className="mt-2 text-ink/65">
          Solo el fin de semana de tu promo, con día y hora reservados, hasta agotar {r.unidades} unidades.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <WhatsAppButton
          mensaje={`Hola Mauricio, vi tu página. Tengo una tienda de ${r.nombre.toLowerCase()} y quiero que me armes la promo para mi próxima fecha.`}
        >
          Quiero la de mi tienda
        </WhatsAppButton>
        <p className="text-sm text-ink/60">Es gratis, y es tuya aunque no trabajemos juntos.</p>
      </div>
    </div>
  )
}
