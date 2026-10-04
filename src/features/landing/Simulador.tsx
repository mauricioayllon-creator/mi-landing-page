'use client'

import { useState } from 'react'
import { GARANTIA_PARTE, cuponesPara } from './config'

/**
 * La cuenta del dueño: cuánto le queda por venta con el cupón, cuánto gana si se acaba el stock,
 * con cuántas ventas recupera lo que invierte y cuál es SU garantía (en cupones).
 * Responde "el cupón me baja la ganancia" y "¿y si no funciona?" con sus propios números.
 */

export type Numeros = { precio: number; costo: number; cupon: number; unidades: number }

const EJEMPLO: Numeros = { precio: 800, costo: 500, cupon: 100, unidades: 40 }

const bs = (n: number) => `${Math.round(n).toLocaleString('es-BO')} Bs`
const pct = (parte: number, total: number) => `${Math.min(100, (parte / total) * 100)}%`

function CampoBs({ id, label, valor, onChange }: { id: string; label: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/60">{label}</span>
      <span className="flex items-center gap-2 rounded-2xl bg-hielo px-4 py-3 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-azul">
        <input
          id={id}
          inputMode="numeric"
          value={valor}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
          className="w-full bg-transparent text-2xl font-bold text-ink outline-none"
        />
        <span className="text-sm font-semibold text-ink/45">Bs</span>
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
        <span className="text-sm font-medium text-ink/60">{label}</span>
        <span className="text-xl font-bold text-marca">
          {valor.toLocaleString('es-BO')} <span className="text-sm font-semibold text-ink/45">{unidad}</span>
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
        className="h-2 w-full cursor-pointer accent-azul"
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
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
      <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <CampoBs id="precio" label="Lo vendes a" valor={precio} onChange={setPrecio} />
            <CampoBs id="costo" label="Te cuesta" valor={costo} onChange={setCosto} />
          </div>
          <Deslizador id="cupon" label="Cupón de" valor={cupon} unidad="Bs" min={0} max={maxCupon} paso={10} onChange={setCupon} />
          <Deslizador id="unidades" label="Unidades que separas" valor={unidades} unidad="u." min={5} max={200} paso={5} onChange={setUnidades} />
          <p className="rounded-2xl bg-hielo px-4 py-3 text-sm text-ink/70">
            Lo que inviertes: <span className="font-bold text-ink">{desde ? 'desde ' : ''}{bs(inversion)}</span> (mi servicio + la
            publicidad).
          </p>
        </div>

        <div
          className="flex flex-col justify-center gap-5 rounded-2xl p-6 text-titulo"
          style={{ background: 'linear-gradient(145deg, #1A6FE0 0%, #0B3B8C 60%, #081f4d 100%)' }}
        >
          {!listo ? (
            <p className="text-lg leading-relaxed">
              {p > 0 && c > 0
                ? 'Con ese cupón pierdes en cada venta. Bájalo, o regala algo que a ti te cueste poco en vez de descontar.'
                : 'Pon a cuánto lo vendes y cuánto te cuesta.'}
            </p>
          ) : (
            <>
              <div>
                <p className="text-sm text-white/70">Con el cupón te quedan</p>
                <p className="text-4xl font-bold tracking-tight text-acento">{bs(porVenta)}</p>
                <p className="text-sm text-white/70">por cada venta</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/65">Si se acaban, vendes</p>
                  <p className="text-xl font-bold">{bs(unidades * (p - cupon))}</p>
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
        <div className="border-t border-black/5 bg-hielo/60 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-marca">Tu promo, venta por venta</p>

          <div className="relative mt-10 mb-12">
            <div className="flex h-4 overflow-hidden rounded-full bg-black/5">
              {garantia > 0 && <div className="degradado-marca" style={{ width: pct(Math.min(garantia, tope), tope) }} />}
              <div className="bg-azul" style={{ width: pct(Math.max(0, Math.min(recupera, tope) - garantia), tope) }} />
              <div className="degradado-acento" style={{ width: pct(Math.max(0, unidades - recupera), tope) }} />
            </div>
            {garantia > 0 && (
              <span className="absolute -top-8 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-marca" style={{ left: pct(garantia, tope) }}>
                Garantía: {garantia}
              </span>
            )}
            <span className="absolute top-6 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-azul" style={{ left: pct(recupera, tope) }}>
              Recuperas: {recupera}
            </span>
            {recupera <= unidades && (
              <span className="absolute -top-8 right-0 whitespace-nowrap text-xs font-semibold text-ink/50">{unidades} u.</span>
            )}
          </div>

          <p className="leading-relaxed text-ink/75">
            Con <span className="font-bold text-azul">{recupera} ventas</span> recuperas todo lo que inviertes.
            {recupera <= unidades ? (
              <> Lo que vendas después es ganancia.</>
            ) : (
              <span className="font-semibold text-ink"> Con {unidades} unidades no alcanza: separa más o baja el cupón.</span>
            )}
          </p>

          {garantia > 0 && garantia <= unidades && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-marca/15">
              <svg className="mt-0.5 h-6 w-6 shrink-0 text-marca" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="leading-relaxed text-ink/80">
                <span className="font-bold text-ink">Tu garantía:</span> si no se venden al menos{' '}
                <span className="font-bold text-marca">{garantia} cupones</span>, el siguiente lanzamiento te lo
                hago sin cobrar mi servicio.
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-ink/50">
            Es una cuenta, no una promesa: depende de cuántos lleguen y compren. En la visita la hacemos con tus números reales.
          </p>
        </div>
      )}
    </div>
  )
}
