'use client'

import { useState } from 'react'
import Simulador, { type Numeros } from './Simulador'

/**
 * "¿Qué vendes?": el dueño elige su rubro y ve una promo de ejemplo con su cuenta.
 * Responde "no es mi rubro": el sistema es el mismo, cambia la oferta.
 * Los números son ejemplos; en la visita se hacen con los del dueño.
 */

type Rubro = Numeros & { nombre: string; porque: string; regalo: string }

const RUBROS: Rubro[] = [
  { nombre: 'Tenis', porque: 'Llegó la colección nueva', regalo: 'unas medias', precio: 800, costo: 500, cupon: 100, unidades: 40 },
  { nombre: 'Celulares', porque: 'Aniversario de la tienda', regalo: 'funda y vidrio templado', precio: 2500, costo: 2100, cupon: 150, unidades: 30 },
  { nombre: 'Colchones', porque: 'Fin de año', regalo: '2 almohadas', precio: 2200, costo: 1400, cupon: 300, unidades: 20 },
  { nombre: 'Relojes', porque: 'Regalos de Navidad', regalo: 'caja de regalo', precio: 600, costo: 300, cupon: 80, unidades: 40 },
  { nombre: 'Mochilas y maletas', porque: 'Vacaciones de fin de año', regalo: 'un candado', precio: 450, costo: 250, cupon: 70, unidades: 50 },
  { nombre: 'Cosas para bebé', porque: 'Feria del bebé', regalo: 'un kit de regalo', precio: 1800, costo: 1200, cupon: 200, unidades: 20 },
]

export default function TuTienda({ inversion }: { inversion: number }) {
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

      <p className="mt-8 mb-4 text-center text-ink/65">
        ¿Y la ganancia? Cambia estos números por los tuyos:
      </p>
      <Simulador key={r.nombre} inicial={r} inversion={inversion} desde />
    </div>
  )
}
