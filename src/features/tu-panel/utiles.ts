/**
 * Lo que Tu panel necesita del navegador y de tu hoja de Google, sin pantalla.
 * Usa la misma hoja y la misma contraseña que tu panel de trabajo (public/panel/admin.html):
 * entrar aquí es entrar allá, y «Salir» en cualquiera de los dos cierra los dos.
 */

import type { AreaId, Modo } from './catalogo'

/** La misma llave que usa tu panel de trabajo para recordar tu contraseña en este aparato. */
export const CLAVE_LS = 'gb_clave'

export function leerLocal(k: string): string | null {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}

export function guardarLocal(k: string, v: string | null) {
  try {
    if (v == null) localStorage.removeItem(k)
    else localStorage.setItem(k, v)
  } catch {
    /* sin memoria en este aparato: se pedirá la contraseña otra vez */
  }
}

type ConEndpoint = { PANEL_ENDPOINT?: string }

/** La URL de tu hoja. Sale de public/panel/config.js, el mismo archivo que usa tu panel de trabajo. */
function endpoint(): Promise<string> {
  const w = window as unknown as ConEndpoint
  if (w.PANEL_ENDPOINT) return Promise.resolve(String(w.PANEL_ENDPOINT).trim())
  return new Promise((ok, mal) => {
    const s = document.createElement('script')
    s.src = '/panel/config.js'
    s.onload = () => (w.PANEL_ENDPOINT ? ok(String(w.PANEL_ENDPOINT).trim()) : mal(new Error('sin-endpoint')))
    s.onerror = () => mal(new Error('sin-endpoint'))
    document.head.appendChild(s)
  })
}

export type Respuesta = { ok: boolean; error?: string; claves?: Record<string, string> }

/** Le pregunta algo a tu hoja (igual que tu panel de trabajo: un POST con el pedido en JSON). */
export async function pedirHoja(datos: Record<string, unknown>): Promise<Respuesta> {
  const url = await endpoint()
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 30000)
  try {
    const r = await fetch(url, { method: 'POST', body: JSON.stringify(datos), signal: ctrl.signal })
    return (await r.json()) as Respuesta
  } finally {
    clearTimeout(t)
  }
}

/** Copia un texto. Si el navegador no deja, prueba a la antigua. */
export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    const a = document.createElement('textarea')
    a.value = texto
    a.style.position = 'fixed'
    a.style.opacity = '0'
    document.body.appendChild(a)
    a.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(a)
    return ok
  }
}

/**
 * ¿Modo noche? La misma regla que tu panel de trabajo (admin.html): se guarda en «gb-tema»;
 * sin elegir = noche; «auto» = lo que diga el aparato; «claro» = de día.
 */
export const TEMA_LS = 'gb-tema'
export function esNoche(): boolean {
  const t = leerLocal(TEMA_LS) || 'claro'
  if (t === 'auto') return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  return t === 'noche'
}

/** El mensaje que se manda con un link y su clave (el mismo que copia tu panel de trabajo). */
export function mensajeConClave(link: string, clave: string) {
  return 'Tu panel de Grow Business:\n' + link + '\nTu clave: ' + clave
}

const AREAS_VALIDAS: AreaId[] = ['negocio', 'herramientas', 'calculadoras', 'links', 'mapa']

/** Simple o completo: se recuerda en este aparato. Sin elegir = simple. */
export const MODO_LS = 'tu-panel-modo'
export function leerModo(): Modo {
  return leerLocal(MODO_LS) === 'completo' ? 'completo' : 'simple'
}

/** #calculadoras/oferta → { area: 'calculadoras', resto: 'oferta' }. Sin área conocida, la de por defecto. */
export function leerRuta(hash: string, porDefecto: AreaId): { area: AreaId; resto: string } {
  const partes = hash.replace(/^#\/?/, '').split('/')
  const a = partes[0] as AreaId
  if (!AREAS_VALIDAS.includes(a)) return { area: porDefecto, resto: '' }
  return { area: a, resto: partes.slice(1).join('/') }
}
