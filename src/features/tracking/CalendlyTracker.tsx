'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

export default function CalendlyTracker() {
  useEffect(() => {
    function handleCalendlyEvent(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'object') return
      if (e.data.event === 'calendly.event_scheduled') {
        if (typeof window.fbq === 'function') {
          // Disparar evento de conversión cuando alguien agenda
          window.fbq('track', 'Schedule')
          window.fbq('track', 'CompleteRegistration')
        }
      }
    }

    window.addEventListener('message', handleCalendlyEvent)
    return () => window.removeEventListener('message', handleCalendlyEvent)
  }, [])

  return null
}
