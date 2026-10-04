import PerfilACupon from './PerfilACupon'
import { VIDEO_EJEMPLO } from './config'

/**
 * El sistema dibujado como un embudo: arriba entra mucha gente, abajo salen ventas.
 * Cada capa tiene su "por qué funciona" (pitch de 3 pilares de Hormozi).
 * Debajo, el camino del cliente en un celular: perfil de TikTok → link de la bio → su cupón
 * (y, si hay VIDEO_EJEMPLO, el video antes).
 * Sirve para cualquier rubro: de una tienda a otra cambia la oferta, no el sistema.
 */

const CAPAS = [
  {
    titulo: 'Te ven',
    color: 'bg-gradient-to-b from-[#7AE3FF] to-acento',
    que: 'Grabo videos pensados para tu cliente y los movemos con publicidad en tu zona, con una fecha.',
    porque: 'Una fecha hace que la gente decida ahora y no "algún día". Casi la mitad de las ventas de una promo llegan en los últimos días.',
  },
  {
    titulo: 'Te eligen',
    color: 'bg-gradient-to-b from-[#4C9BFF] to-azul',
    que: 'Tu cliente guarda en su celular un cupón de tu tienda.',
    porque: 'Si cinco tiendas venden lo mismo, la gente va a la que ya le dio algo. Con el cupón en el celular, decide antes de salir de su casa.',
  },
  {
    titulo: 'Llegan',
    color: 'bg-gradient-to-b from-[#1D5BC4] to-marca',
    que: 'Elige su día y su hora, y le recordamos un día antes y el mismo día.',
    porque: 'El que reserva una hora se compromete. El que solo pregunta "¿precio?" se enfría y no vuelve.',
  },
]

function Embudo() {
  return (
    <svg viewBox="0 0 360 372" className="mx-auto h-auto w-full max-w-[380px]" role="img" aria-label="Embudo: te ven, te eligen, llegan, compran">
      <defs>
        <filter id="sombra" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0B3B8C" floodOpacity="0.25" />
        </filter>
        {/* Cada capa va del tono más claro (arriba a la izquierda) al más oscuro, como el caballo del logo */}
        <linearGradient id="capa1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7AE3FF" />
          <stop offset="55%" stopColor="#1EC8FF" />
          <stop offset="100%" stopColor="#0EA2E0" />
        </linearGradient>
        <linearGradient id="capa2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4C9BFF" />
          <stop offset="55%" stopColor="#1A6FE0" />
          <stop offset="100%" stopColor="#1152B8" />
        </linearGradient>
        <linearGradient id="capa3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1D5BC4" />
          <stop offset="55%" stopColor="#0B3B8C" />
          <stop offset="100%" stopColor="#072866" />
        </linearGradient>
        <linearGradient id="pico" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#0D0D0D" />
        </linearGradient>
        <linearGradient id="moneda" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7AE3FF" />
          <stop offset="100%" stopColor="#1A6FE0" />
        </linearGradient>
        {/* Brillo suave arriba de cada capa */}
        <linearGradient id="brillo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".35" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter="url(#sombra)" fontFamily="var(--font-geist), system-ui, sans-serif" textAnchor="middle">
        <polygon points="0,0 360,0 318,88 42,88" fill="url(#capa1)" />
        <polygon points="0,0 360,0 318,88 42,88" fill="url(#brillo)" />
        <text x="180" y="40" fontSize="24" fontWeight="700" fill="#0D0D0D">1 · Te ven</text>
        <text x="180" y="64" fontSize="14" fill="#0D0D0D" fillOpacity=".7">videos + publicidad, con fecha</text>

        <polygon points="46,96 314,96 272,184 88,184" fill="url(#capa2)" />
        <polygon points="46,96 314,96 272,184 88,184" fill="url(#brillo)" />
        <text x="180" y="136" fontSize="24" fontWeight="700" fill="#FCFCFC">2 · Te eligen</text>
        <text x="180" y="160" fontSize="14" fill="#FCFCFC" fillOpacity=".85">un cupón de tu tienda</text>

        <polygon points="92,192 268,192 226,280 134,280" fill="url(#capa3)" />
        <polygon points="92,192 268,192 226,280 134,280" fill="url(#brillo)" />
        <text x="180" y="232" fontSize="24" fontWeight="700" fill="#FCFCFC">3 · Llegan</text>
        <text x="180" y="256" fontSize="14" fill="#FCFCFC" fillOpacity=".85">con día y hora</text>

        <path d="M138,288 H222 V330 Q222,338 214,338 H146 Q138,338 138,330 Z" fill="url(#pico)" />
        <text x="180" y="319" fontSize="17" fontWeight="700" fill="#1EC8FF">Compran</text>
      </g>
      <circle cx="180" cy="358" r="12" fill="url(#moneda)" />
      <text x="180" y="363" fontSize="11" fontWeight="700" fill="#0D0D0D" textAnchor="middle" fontFamily="system-ui, sans-serif">Bs</text>
    </svg>
  )
}

export default function ComoFunciona() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-center gap-10 md:grid-cols-[380px_1fr]">
        <Embudo />

        <ol className="flex flex-col gap-5">
          {CAPAS.map(({ titulo, color, que, porque }, i) => (
            <li key={titulo} className="flex gap-4">
              <span className={`mt-1 h-10 w-2 shrink-0 rounded-full ${color}`} aria-hidden="true" />
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {i + 1}. {titulo}
                </h3>
                <p className="mt-1 leading-relaxed text-ink/80">{que}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">
                  <span className="font-semibold text-marca">Por qué funciona:</span> {porque}
                </p>
              </div>
            </li>
          ))}
          <li className="flex gap-4">
            <span className="mt-1 h-10 w-2 shrink-0 rounded-full bg-gradient-to-b from-[#1F2937] to-ink" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-bold text-ink">Y todo se cuenta</h3>
              <p className="mt-1 leading-relaxed text-ink/80">
                Cada cupón canjeado es una venta registrada. Al final sabes cuánto vendió tu promo y qué
                video te trajo a cada cliente.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="mt-16">
        <p className="mb-2 text-center text-2xl font-bold tracking-tight text-ink">
          Así llega tu cliente <span className="text-marca">a su cupón</span>
        </p>
        <p className="mb-8 text-center text-ink/60">Pruébalo en este celular, como si fueras él.</p>
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-start md:gap-10">
          {VIDEO_EJEMPLO && (
            <>
              <div className="flex w-full max-w-[320px] flex-col items-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca">El video</p>
                <div className="marco-celular w-full">
                  <video
                    className="block aspect-[9/16] w-full rounded-[2.2rem] bg-ink object-cover"
                    src={VIDEO_EJEMPLO.src}
                    poster={VIDEO_EJEMPLO.poster}
                    controls
                    playsInline
                    preload="none"
                  />
                </div>
                <p className="mt-3 text-center text-sm text-ink/55">{VIDEO_EJEMPLO.pie}</p>
              </div>
              <span className="text-3xl font-bold text-azul md:mt-64" aria-hidden="true">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </span>
            </>
          )}
          <div className="flex w-full max-w-md flex-col items-center">
            <PerfilACupon />
          </div>
        </div>
      </div>
    </div>
  )
}
