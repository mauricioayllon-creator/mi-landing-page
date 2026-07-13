'use client'

/**
 * Demo interactiva del Agente de IA — bandeja de WhatsApp simulada.
 *
 * - Lista de conversaciones a la izquierda, chat abierto a la derecha.
 * - Al abrir un chat, los mensajes se reproducen "en vivo" con indicador
 *   de escribiendo… (se puede saltar con "Ver todo").
 * - Tour guiado con tooltips (spotlight + paso X/Y + Siguiente).
 *
 * El contenido (conversaciones y pasos) vive en ./agent-demo-data.ts.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  CONVERSATIONS,
  TOUR_STEPS,
  DEMO_BUSINESS,
  type DemoConversation,
} from './agent-demo-data'

/* ── Iconitos ────────────────────────────────────────────────── */
function DoubleCheck() {
  return (
    <svg viewBox="0 0 18 12" fill="none" className="h-3 w-[18px]" aria-hidden="true">
      <path d="M1 6.5 4 9.5 10 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6.5 10 9.5 16 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v3" />
    </svg>
  )
}

function Avatar({ c, size = 'h-11 w-11 text-sm' }: { c: DemoConversation; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.avatar} font-bold text-white`}>
      {c.initials}
    </span>
  )
}

type Spot = { x: number; y: number; w: number; h: number; cw: number; ch: number }

export default function AgentDemo() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id)
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(false)
  const [mobileChat, setMobileChat] = useState(false)
  const [tour, setTour] = useState<number | null>(null)
  const [spot, setSpot] = useState<Spot | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const playToken = useRef(0)
  const startedRef = useRef(false)

  const convo = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0]
  const allShown = shown >= convo.messages.length

  /* ── Motor de reproducción de mensajes ─────────────────────── */
  const play = useCallback((c: DemoConversation, instant = false) => {
    const token = ++playToken.current
    setTyping(false)
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (instant || reduced) {
      setShown(c.messages.length)
      return
    }
    setShown(0)
    let i = 0
    const next = () => {
      if (token !== playToken.current || i >= c.messages.length) return
      const m = c.messages[i]
      if (m.from === 'agent') {
        setTyping(true)
        window.setTimeout(() => {
          if (token !== playToken.current) return
          setTyping(false)
          i += 1
          setShown(i)
          window.setTimeout(next, 650)
        }, 900 + Math.min(m.text.length * 5, 1100))
      } else {
        i += 1
        setShown(i)
        window.setTimeout(next, 850)
      }
    }
    window.setTimeout(next, 350)
  }, [])

  const openConvo = useCallback(
    (id: string, instant = false) => {
      startedRef.current = true
      setActiveId(id)
      setMobileChat(true)
      const c = CONVERSATIONS.find((x) => x.id === id)
      if (c) play(c, instant)
    },
    [play],
  )

  /* ── Autoplay al entrar en pantalla ─────────────────────────── */
  useEffect(() => {
    const check = () => {
      if (startedRef.current) return
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.75 && r.bottom > 0) {
        startedRef.current = true
        play(CONVERSATIONS[0])
        window.removeEventListener('scroll', check)
      }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [play])

  /* ── Autoscroll del chat mientras se reproduce ──────────────── */
  useEffect(() => {
    if (tour !== null) return
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown, typing, activeId, tour])

  /* ── Tour guiado ────────────────────────────────────────────── */
  const goStep = useCallback(
    (n: number) => {
      startedRef.current = true
      if (n < 0 || n >= TOUR_STEPS.length) {
        setTour(null)
        setSpot(null)
        return
      }
      const s = TOUR_STEPS[n]
      if (s.convo) {
        setActiveId(s.convo)
        setMobileChat(true)
        const c = CONVERSATIONS.find((x) => x.id === s.convo)
        if (c) play(c, true)
      }
      if (s.target === 'list') setMobileChat(false)
      setTour(n)
    },
    [play],
  )

  const endTour = useCallback(() => {
    setTour(null)
    setSpot(null)
  }, [])

  /* Medir el elemento resaltado (spotlight + tooltip) */
  useEffect(() => {
    if (tour === null) {
      setSpot(null)
      return
    }
    const s = TOUR_STEPS[tour]
    const measure = () => {
      const root = containerRef.current
      if (!root) return
      let el: HTMLElement | null = null
      if (s.target === 'msg' && s.msgKey) {
        el = root.querySelector<HTMLElement>(`[data-msg="${s.msgKey}"]`)
        const chat = chatRef.current
        if (el && chat) {
          const cr0 = chat.getBoundingClientRect()
          const r0 = el.getBoundingClientRect()
          chat.scrollTop += r0.top - cr0.top - 64
        }
      } else {
        el = root.querySelector<HTMLElement>(`[data-tour="${s.target}"]`)
      }
      if (!el) return
      const cr = root.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      setSpot({
        x: r.left - cr.left,
        y: r.top - cr.top,
        w: r.width,
        h: r.height,
        cw: cr.width,
        ch: cr.height,
      })
    }
    const raf = requestAnimationFrame(measure)
    const t = window.setTimeout(measure, 220)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [tour, mobileChat, activeId])

  /* Salir del tour con Escape */
  useEffect(() => {
    if (tour === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tour, endTour])

  /* Posición del tooltip según el paso */
  const tooltipStyle = (): CSSProperties => {
    if (!spot) return { opacity: 0 }
    const step = TOUR_STEPS[tour ?? 0]
    const W = 300
    const gap = 14
    // Móvil / contenedor angosto → tarjeta pegada abajo (o arriba si tapa)
    if (spot.cw < 700) {
      return spot.y + spot.h / 2 > spot.ch / 2
        ? { left: 10, right: 10, top: 10 }
        : { left: 10, right: 10, bottom: 10 }
    }
    let left = 0
    let top = spot.y
    let transform: string | undefined
    if (step.place === 'right') left = spot.x + spot.w + gap
    if (step.place === 'left') left = spot.x - W - gap
    if (step.place === 'bottom') {
      left = spot.x + spot.w / 2 - W / 2
      top = spot.y + spot.h + gap
    }
    if (step.place === 'top') {
      left = spot.x + spot.w / 2 - W / 2
      top = spot.y - gap
      transform = 'translateY(-100%)'
    }
    left = Math.min(Math.max(left, 10), spot.cw - W - 10)
    if (step.place !== 'top') top = Math.min(Math.max(top, 10), spot.ch - 190)
    return { left, top, width: W, transform }
  }

  const step = tour !== null ? TOUR_STEPS[tour] : null

  return (
    <div className="mx-auto max-w-5xl">
      {/* Botón que arranca el tour */}
      <div className="mb-6 text-center">
        <button
          onClick={() => goStep(0)}
          className="inline-flex items-center gap-2 rounded-pill bg-ink px-6 py-3 text-sm font-semibold text-titulo shadow-float transition-transform hover:scale-[1.03] active:scale-95"
        >
          ✨ Ver demo guiada
          <span className="rounded-pill bg-lime px-2 py-0.5 text-[11px] font-bold text-ink">
            {TOUR_STEPS.length} pasos
          </span>
        </button>
      </div>

      <div ref={containerRef} className="relative">
        {/* Marco esmeralda */}
        <div className="testimonial-gradient rounded-3xl p-2.5 shadow-card md:p-4">
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
            {/* Barra tipo ventana */}
            <div className="flex items-center justify-between gap-3 bg-ink px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="hidden truncate text-xs font-medium text-white/60 sm:block">
                Plataforma Unreal — Bandeja de WhatsApp · {DEMO_BUSINESS.name}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-white/10 px-3 py-1 text-[11px] font-semibold text-lime">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                </span>
                Agente de IA activo · 24/7
              </span>
            </div>

            {/* Paneles */}
            <div className="flex h-[540px] md:h-[600px]">
              {/* ── Bandeja (lista de chats) ── */}
              <aside
                data-tour="list"
                className={`${mobileChat ? 'hidden' : 'flex'} w-full flex-col border-r border-black/5 bg-white md:flex md:w-[320px] md:shrink-0`}
              >
                <div className="border-b border-black/5 px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-ink">Bandeja de entrada</h3>
                    <span className="text-[11px] font-semibold text-emerald">
                      0 sin responder
                    </span>
                  </div>
                  <div className="mt-2.5 rounded-pill bg-cream px-3.5 py-1.5 text-xs text-ink/40">
                    Buscar chat…
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {CONVERSATIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openConvo(c.id)}
                      className={`flex w-full items-start gap-3 border-b border-black/5 px-4 py-3.5 text-left transition-colors hover:bg-cream ${
                        c.id === activeId ? 'bg-cream' : 'bg-white'
                      }`}
                    >
                      <Avatar c={c} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-ink">
                            {c.client}
                          </span>
                          <span className="shrink-0 text-[11px] text-ink/45">{c.time}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-ink/55">
                          {c.messages[c.messages.length - 1].text}
                        </p>
                        <span className="mt-1.5 inline-flex max-w-full items-center truncate rounded-pill bg-emerald/10 px-2 py-0.5 text-[11px] font-semibold text-emerald">
                          {c.badge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              {/* ── Chat abierto ── */}
              <div
                data-tour="chat"
                className={`${mobileChat ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}
              >
                {/* Header del chat */}
                <div className="flex items-center gap-3 border-b border-black/5 bg-[#f0f2f5] px-3 py-2.5 md:px-4">
                  <button
                    onClick={() => setMobileChat(false)}
                    className="-ml-1 rounded-full p-1 text-ink/60 hover:bg-black/5 md:hidden"
                    aria-label="Volver a la lista"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <Avatar c={convo} size="h-9 w-9 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{convo.client}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-ink/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                      en línea
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-pill bg-emerald/10 px-2.5 py-1 text-[11px] font-semibold text-emerald lg:inline">
                    {convo.badge}
                  </span>
                  {tour === null && (
                    <button
                      onClick={() => (allShown ? play(convo) : play(convo, true))}
                      className="shrink-0 rounded-pill bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-ink/60 transition-colors hover:bg-black/10"
                    >
                      {allShown ? '↻ Repetir' : 'Ver todo ⏩'}
                    </button>
                  )}
                </div>

                {/* Mensajes */}
                <div ref={chatRef} className="wa-bg relative flex-1 overflow-y-auto px-3 py-4 md:px-5">
                  <div className="mb-3 flex justify-center">
                    <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] text-ink/50 shadow-sm">
                      Hoy
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {convo.messages.slice(0, shown).map((m, i) => (
                      <div
                        key={i}
                        data-msg={m.key}
                        className={`msg-in flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug text-[#111b21] shadow-sm md:max-w-[72%] ${
                            m.from === 'agent'
                              ? 'rounded-br-md bg-[#d9fdd3]'
                              : 'rounded-bl-md bg-white'
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-black/40">
                            {m.from === 'agent' && (
                              <span className="rounded bg-emerald/10 px-1 text-[9px] font-bold text-emerald">
                                IA
                              </span>
                            )}
                            {m.time}
                            {m.from === 'agent' && (
                              <span className="text-[#53bdeb]">
                                <DoubleCheck />
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="msg-in flex justify-end">
                        <div className="flex items-center gap-1 rounded-2xl rounded-br-md bg-[#d9fdd3] px-4 py-3 shadow-sm">
                          <span className="typing-dot h-2 w-2 rounded-full bg-emerald/50" />
                          <span className="typing-dot h-2 w-2 rounded-full bg-emerald/50" />
                          <span className="typing-dot h-2 w-2 rounded-full bg-emerald/50" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de entrada falsa */}
                <div className="flex items-center gap-2 border-t border-black/5 bg-[#f0f2f5] px-3 py-2.5">
                  <span className="flex h-9 flex-1 items-center rounded-pill bg-white px-4 text-[12px] italic text-ink/40">
                    Acá no escribís vos — el agente responde solo 😉
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-white">
                    <MicIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA bajo la ventana */}
        <div className="mt-7 text-center">
          <a
            data-tour="cta"
            href="#agendar"
            onClick={endTour}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-lime px-6 py-3.5 font-semibold text-ink shadow-float transition-transform hover:scale-[1.03] active:scale-95"
          >
            Quiero este agente en mi negocio
          </a>
          <p className="mx-auto mt-4 max-w-md text-xs text-ink/45">{DEMO_BUSINESS.note}</p>
        </div>

        {/* ── Overlay del tour ── */}
        {step && (
          <>
            {/* Bloquea interacción con la demo mientras dura el tour */}
            <div className="absolute inset-0 z-20" aria-hidden="true" />
            {/* Spotlight */}
            {spot && (
              <div
                className="tour-ring pointer-events-none absolute z-30 rounded-xl border-2 border-lime transition-all duration-300"
                style={{
                  left: spot.x - 5,
                  top: spot.y - 5,
                  width: spot.w + 10,
                  height: spot.h + 10,
                  boxShadow: '0 0 0 9999px rgba(13,13,13,0.55)',
                }}
              />
            )}
            {/* Tooltip */}
            <div
              className="absolute z-40 rounded-2xl bg-white p-4 shadow-float ring-1 ring-black/10"
              style={tooltipStyle()}
              role="dialog"
              aria-label={step.title}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald">
                Paso {(tour ?? 0) + 1} de {TOUR_STEPS.length}
              </p>
              <h4 className="mt-1.5 text-base font-bold leading-snug text-ink">{step.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{step.body}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={endTour}
                  className="text-xs font-semibold text-ink/45 transition-colors hover:text-ink"
                >
                  Salir
                </button>
                {step.cta ? (
                  <a
                    href="#agendar"
                    onClick={endTour}
                    className="inline-flex items-center rounded-pill bg-lime px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    Agendar una llamada
                  </a>
                ) : (
                  <button
                    onClick={() => goStep((tour ?? 0) + 1)}
                    className="inline-flex items-center rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-titulo transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
