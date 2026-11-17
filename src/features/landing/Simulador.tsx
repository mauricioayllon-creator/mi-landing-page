'use client'

import { useState } from 'react'
import { GARANTIA_DIAS_EXTRA, GARANTIA_PARTE, GARANTIA_TOPE, cuponesPara } from './config'

/**
 * La cuenta del dueño: cuánto le queda por venta con su regalo, cuánto gana si se acaba el stock,
 * con cuántas ventas recupera lo que invierte y cuál es SU garantía (los clientes que tienen que llegar).
 * Responde "la promo me baja la ganancia" y "¿y si no funciona?" con sus propios números.
 * `cupon` es lo que a la tienda le cuesta el regalo (desde el 2026-10-24: una oferta mejor que una rebaja).
 */

export type Numeros = { precio: number; costo: number; cupon: number; unidades: number }

const EJEMPLO: Numeros = { precio: 800, costo: 500, cupon: 45, unidades: 40 }

const bs = (n: number) => `${Math.round(n).toLocaleString('es-BO')} Bs`
const pct = (parte: number, total: number) => `${Math.min(100, (parte / total) * 100)}%`

function CampoBs({ id, label, valor, onChange }: { id: string; label: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-texto2">{label}</span>
      <span className="flex items-center gap-2 rounded-2xl bg-noche px-4 py-3 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-acento">
        <input
          id={id}
          inputMode="numeric"
          value={valor}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
          className="w-full bg-transparent text-2xl font-bold text-titulo outline-none"
        />
        <span className="text-sm font-semibold text-texto2">Bs</span>
      </span>
    </label>
  )
}

function Deslizador({
  id,
  label,
  valor,
  unidad,
  min,
  max,
  paso,
  onChange,
}: {
  id: string
  label: string
  valor: number
  unidad: string
  min: number
  max: number
  paso: number
  onChange: (v: number) => void
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-texto2">{label}</span>
        <span className="text-xl font-bold text-acento">
          {valor.toLocaleString('es-BO')} <span className="text-sm font-semibold text-texto2">{unidad}</span>
        </span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={paso}
        value={Math.min(valor, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#C8DCFF]"
      />
    </label>
  )
}

/** `desde`: en la página principal la inversión es la mínima de referencia, no la de una tienda. */
export default function Simulador({
  inversion,
  inicial = EJEMPLO,
  desde = false,
}: {
  inversion: number
  inicial?: Numeros
  desde?: boolean
}) {
  const [precio, setPrecio] = useState(String(inicial.precio))
  const [costo, setCosto] = useState(String(inicial.costo))
  const [cupon, setCupon] = useState(inicial.cupon)
  const [unidades, setUnidades] = useState(inicial.unidades)

  const p = Number(precio) || 0
  const c = Number(costo) || 0
  const porVenta = p - c - cupon
  const maxCupon = Math.max(50, Math.round((p * 0.5) / 10) * 10)
  const listo = p > 0 && c > 0 && porVenta > 0
  const recupera = listo ? cuponesPara(1, inversion, porVenta) : 0
  const garantia = listo && GARANTIA_PARTE ? cuponesPara(GARANTIA_PARTE, inversion, porVenta) : 0
  const tope = Math.max(unidades, recupera)

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-tarjeta shadow-card ring-1 ring-white/10">
      <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <CampoBs id="precio" label="Lo vendes a" valor={precio} onChange={setPrecio} />
            <CampoBs id="costo" label="Te cuesta" valor={costo} onChange={setCosto} />
          </div>
          <Deslizador id="cupon" label="Lo que te cuesta el regalo" valor={cupon} unidad="Bs" min={0} max={maxCupon} paso={5} onChange={setCupon} />
          <Deslizador id="unidades" label="Unidades que separas" valor={unidades} unidad="u." min={5} max={200} paso={5} onChange={setUnidades} />
          <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-texto2 ring-1 ring-white/10">
            Lo que inviertes: <span className="font-bold text-titulo">{desde ? 'desde ' : ''}{bs(inversion)}</span> (mi servicio + la
            publicidad).
          </p>
        </div>

        <div
          className="flex flex-col justify-center gap-5 rounded-2xl p-6 text-titulo"
          style={{ background: 'linear-gradient(145deg, #5000D0 0%, #3000A0 60%, #200090 100%)' }}
        >
          {!listo ? (
            <p className="text-lg leading-relaxed">
              {p > 0 && c > 0
                ? 'Con ese regalo pierdes en cada venta. Elige uno que para tu cliente valga harto y a ti te cueste poco.'
                : 'Pon a cuánto lo vendes y cuánto te cuesta.'}
            </p>
          ) : (
            <>
              <div>
                <p className="text-sm text-white/70">Con el regalo te quedan</p>
                <p className="text-4xl font-bold tracking-tight text-acento">{bs(porVenta)}</p>
                <p className="text-sm text-white/70">por cada venta</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/65">Si se acaban, vendes</p>
                  <p className="text-xl font-bold">{bs(unidades * p)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/65">y ganas</p>
                  <p className="text-xl font-bold text-acento">{bs(unidades * porVenta)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {listo && (
        <div className="border-t border-white/10 bg-noche/60 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-acento">Tu promo, venta por venta</p>

          <div className="relative mt-10 mb-12">
            <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
              <div className="bg-[#2F7BF0]" style={{ width: pct(Math.min(recupera, tope), tope) }} />
              <div className="degradado-acento" style={{ width: pct(Math.max(0, unidades - recupera), tope) }} />
            </div>
            <span className="absolute top-6 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-acento" style={{ left: pct(recupera, tope) }}>
              Recuperas: {recupera}
            </span>
            {recupera <= unidades && (
              <span className="absolute -top-8 right-0 whitespace-nowrap text-xs font-semibold text-texto2">{unidades} u.</span>
            )}
          </div>

          <p className="leading-relaxed text-texto2">
            Con <span className="font-bold text-acento">{recupera} ventas</span> recuperas todo lo que inviertes.
            {recupera <= unidades ? (
              <> Lo que vendas después es ganancia.</>
            ) : (
              <span className="font-semibold text-titulo"> Con {unidades} unidades no alcanza: separa más o baja el cupón.</span>
            )}
          </p>

          {garantia > GARANTIA_TOPE && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-amber-300/60">
              <svg className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
              <p className="leading-relaxed text-texto2">
                <span className="font-bold text-titulo">Con este producto necesitas {garantia} clientes:</span> es mucho
                para una promo, porque te deja poco por venta. Elijamos otro producto, uno que te deje más, y ahí sale
                tu garantía.
              </p>
            </div>
          )}

          {garantia > 0 && garantia <= GARANTIA_TOPE && garantia <= unidades && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/15">
              <svg className="mt-0.5 h-6 w-6 shrink-0 text-acento" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="leading-relaxed text-texto2">
                <span className="font-bold text-titulo">Tu garantía:</span> me pagas la mitad para empezar, y la otra
                mitad recién cuando te lleguen <span className="font-bold text-acento">{garantia} clientes</span> con su
                cupón, los que necesitas para recuperar lo que pusiste. Cuenta cada cliente que llega con su cupón y
                tú lo validas, compre o no. Si en tu fecha no llegan, sigo {GARANTIA_DIAS_EXTRA} días más con tu video
                ganador, sin costo; y si igual no llegan, no me la pagas.
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-texto2">
            Es una cuenta, no una promesa: depende de cuántos lleguen y compren. En la visita la hacemos con tus números reales.
          </p>
        </div>
      )}
    </div>
  )
}
