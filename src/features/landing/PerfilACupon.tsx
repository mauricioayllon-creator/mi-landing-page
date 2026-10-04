'use client'

import { useState } from 'react'
import { DEMO_CUPON } from './config'

/**
 * El camino completo dentro de un celular, para que el dueño entienda de dónde sale el cupón:
 * perfil de TikTok de su tienda → toca el link de la bio → se abre su cupón dentro de TikTok.
 * Es una maqueta: "Tu Tienda" no es una cuenta real. La demo del cupón no guarda datos.
 */

const PASOS = ['Ve tu video y entra a tu perfil', 'Toca el link', 'Reserva su cupón']

const VIDEOS = [
  { texto: 'Cupón de 250 Bs', vistas: '48,2 mil', fondo: 'from-[#1A6FE0] to-[#072866]', fijado: true },
  { texto: '¿Precio? 👀', vistas: '12,4 mil', fondo: 'from-[#1F2937] to-[#0D0D0D]' },
  { texto: 'Llegó lo nuevo', vistas: '9.870', fondo: 'from-[#f7c948] to-[#d97706]' },
  { texto: 'Solo este finde', vistas: '21,1 mil', fondo: 'from-[#7AE3FF] to-[#1A6FE0]' },
  { texto: 'Así se canjea', vistas: '6.302', fondo: 'from-[#0B3B8C] to-[#1EC8FF]' },
  { texto: 'Fila en la tienda', vistas: '15,7 mil', fondo: 'from-[#374151] to-[#111827]' },
]

function Perfil({ onLink }: { onLink: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white text-ink">
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold">
        <span>9:41</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="h-2 w-3 rounded-sm bg-ink/80" />
          <span className="h-2 w-4 rounded-sm border border-ink/70" />
        </span>
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-ink/80">
        <span className="text-xl leading-none">‹</span>
        <span className="text-sm font-bold text-ink">Tu Tienda</span>
        <span className="text-lg leading-none">⋯</span>
      </div>

      <div className="flex flex-col items-center px-4">
        <div className="h-[72px] w-[72px] rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #7AE3FF, #1A6FE0, #0B3B8C)' }}>
          <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white text-2xl font-bold text-[#f7c948]" style={{ background: 'linear-gradient(135deg, #1D5BC4, #072866)' }}>
            T
          </div>
        </div>
        <p className="mt-1.5 text-[13px] font-semibold">@tutienda.lapaz</p>

        <div className="mt-2 flex gap-5 text-center">
          {[
            ['128', 'Siguiendo'],
            ['8.420', 'Seguidores'],
            ['96,3 mil', 'Me gusta'],
          ].map(([n, t]) => (
            <div key={t}>
              <p className="text-[13px] font-bold">{n}</p>
              <p className="text-[10px] text-ink/50">{t}</p>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex gap-1.5">
          <span className="rounded-md bg-[#FE2C55] px-7 py-1.5 text-[12px] font-semibold text-white">Seguir</span>
          <span className="rounded-md bg-black/[0.06] px-4 py-1.5 text-[12px] font-semibold">Mensaje</span>
        </div>

        <p className="mt-2.5 text-center text-[11.5px] leading-snug text-ink/80">
          Tu tienda en La Paz 🛍️
          <br />
          🎁 Promo de fin de año: tu cupón de 250 Bs 👇
        </p>

        <div className="relative mt-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-acento/40" aria-hidden="true" />
          <button
            type="button"
            onClick={onLink}
            className="relative flex items-center gap-1 rounded-full bg-[#E9F8FF] px-3 py-1 text-[11.5px] font-bold text-[#0B3B8C] ring-2 ring-acento"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
            </svg>
            descuentos-com.netlify.app
          </button>
          <span className="pointer-events-none absolute -right-7 top-3 animate-bounce text-xl" aria-hidden="true">
            👆
          </span>
        </div>
      </div>

      <div className="mt-3 flex border-b border-black/10 text-center text-[11px] font-semibold">
        <span className="flex-1 border-b-2 border-ink pb-1.5">Videos</span>
        <span className="flex-1 pb-1.5 text-ink/40">Gustados</span>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-[2px] overflow-hidden">
        {VIDEOS.map(({ texto, vistas, fondo, fijado }) => (
          <div key={texto} className={`relative bg-gradient-to-br ${fondo} p-1.5 text-white`}>
            {fijado && <span className="rounded bg-[#FE2C55] px-1 py-px text-[8px] font-bold">Fijado</span>}
            <p className="mt-1 text-[11px] font-extrabold leading-tight drop-shadow">{texto}</p>
            <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold drop-shadow">▷ {vistas}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Navegador({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-[#121212] px-3 pb-2 pt-3 text-white">
      <button type="button" onClick={onCerrar} aria-label="Volver al perfil" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm">
        ✕
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-[11px] font-semibold">Tu cupón de 250 Bs · Tu Tienda</p>
        <p className="truncate text-[9.5px] text-white/50">descuentos-com.netlify.app</p>
      </div>
      <span className="w-7 text-center text-sm text-white/60">⋯</span>
    </div>
  )
}

export default function PerfilACupon() {
  const [enCupon, setEnCupon] = useState(false)
  const activo = enCupon ? 2 : 1

  return (
    <div className="flex w-full flex-col items-center">
      <ol className="mb-6 flex w-full max-w-md items-start justify-between gap-2">
        {PASOS.map((paso, i) => {
          const hecho = i < activo
          const actual = i === activo
          return (
            <li key={paso} className="flex flex-1 flex-col items-center text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  actual ? 'degradado-acento text-ink shadow-float' : hecho ? 'degradado-marca text-titulo' : 'bg-black/10 text-ink/50'
                }`}
              >
                {hecho ? '✓' : i + 1}
              </span>
              <span className={`mt-1.5 text-xs leading-snug ${actual ? 'font-bold text-ink' : 'text-ink/55'}`}>{paso}</span>
            </li>
          )
        })}
      </ol>

      <div className="marco-celular w-full max-w-[320px]">
        <div className="relative h-[600px] overflow-hidden rounded-[2.2rem] bg-white">
          <div
            className={`flex h-full w-[200%] transition-transform duration-500 ease-out ${enCupon ? '-translate-x-1/2' : ''}`}
          >
            <div className="h-full w-1/2">
              <Perfil onLink={() => setEnCupon(true)} />
            </div>
            <div className="flex h-full w-1/2 flex-col bg-ink">
              <Navegador onCerrar={() => setEnCupon(false)} />
              <iframe src={DEMO_CUPON} title="Demo del cupón: así lo ve tu cliente" className="block w-full flex-1 bg-white" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-ink/60">
        {enCupon
          ? 'Así se abre su cupón, sin salir de TikTok. Tócalo y reserva uno de prueba (no se guarda nada). Con la ✕ vuelves al perfil.'
          : 'Tus videos llevan a tu perfil. Toca el link, como lo haría tu cliente.'}
      </p>
      <a
        href={DEMO_CUPON}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-sm font-semibold text-marca underline underline-offset-4"
      >
        Abrir el cupón en pantalla completa
      </a>
    </div>
  )
}
