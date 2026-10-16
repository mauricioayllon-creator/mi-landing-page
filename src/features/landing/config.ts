/**
 * Todo lo que cambia seguido en la página está aquí.
 * Cambiar un dato de este archivo cambia todas las secciones que lo usan.
 */

export const MARCA = 'Grow Business'
export const PERSONA = 'Mauricio Ayllón'
export const LOGO = '/grow-business-logo.png'

/** Número de WhatsApp con código de país y sin "+" ni espacios. Ej.: '59171234567'.
 *  Si queda vacío, el botón abre WhatsApp para que la persona elija el chat. */
export const WHATSAPP = '59172030850'

/** Demo pública del cupón (no guarda datos). */
export const DEMO_CUPON = 'https://descuentos-com.netlify.app/?demo=1'

/** Lanzamientos por mes que se pueden tomar (escasez real: cámbialo si cambia). */
export const LANZAMIENTOS_POR_MES = 3

/** Nombre de la oferta (fórmula MAGIC de $100M Offers). */
export const NOMBRE_OFERTA = 'Lanzamiento Tienda Llena'

/**
 * Garantía (decidida por el usuario el 2026-10-04): si no se venden con cupón las unidades
 * necesarias para recuperar esta parte de la inversión (servicio + publicidad), el siguiente
 * lanzamiento va sin cobrar el servicio. En /propuesta la calculadora saca el número de cupones;
 * la página principal solo nombra la garantía (desde el 2026-10-13 ya no tiene calculadora).
 * No se dice el porcentaje: se muestra el número de cupones.
 * Por qué no el 100%: lo que pasa dentro de la tienda (precio, vendedores, producto) no lo controlamos.
 * Con null, la garantía no aparece.
 */
export const GARANTIA_PARTE: number | null = 0.5

/** Precio del servicio por lanzamiento, en Bs. Solo se usa en /propuesta (se cambia con ?p=1800).
 *  No va en la página principal: el precio se habla en la reunión (pedido del usuario, 2026-10-13). */
export const PRECIO_SERVICIO = 1500
/** La pauta la pone la tienda desde su propia cuenta. */
export const PAUTA_MIN = 500
export const PAUTA_MAX = 700

/**
 * Videos. Cada uno puede ser de YouTube (no listado) o un .mp4 dentro de /public.
 *   { tipo: 'youtube', id: 'dQw4w9WgXcQ' }
 *   { tipo: 'mp4', src: '/videos/vsl-1.mp4', poster: '/videos/vsl-1.jpg' }
 * Por defecto se muestran verticales (grabados con el celular). Si lo grabaste
 * horizontal, agrega formato: 'horizontal'.
 * Mientras un video sea null, su sección se arma sin él.
 */
export type Video = (
  | { tipo: 'youtube'; id: string }
  | { tipo: 'mp4'; src: string; poster?: string }
) & { formato?: 'vertical' | 'horizontal' }

/** VSL 1 (antes de la reunión): qué es, para quién, el caso de la tienda de tenis y las dudas. */
export const VSL_PRINCIPAL: Video | null = {
  tipo: 'mp4',
  src: '/videos/vsl-grow-business.mp4',
  poster: '/videos/vsl-grow-business.jpg',
  formato: 'horizontal',
}
/** Caso de estudio grabado en pantalla: el anuncio, los números y lo que se aprendió. */
export const VIDEO_CASO: Video | null = null
/** VSL 2 (después de la reunión, para el socio o la pareja): plan, inversión y riesgos. */
export const VSL_PROPUESTA: Video | null = null

/** Un video propio (que se vea la edición), junto a la demo del cupón ("lo ve" → "lo guarda").
 *  Comprímelo a ~4 MB (540 px de ancho) para que cargue con datos móviles. Con null, se muestra solo la demo.
 *  Ej.: { src: '/videos/nuestro.mp4', poster: '/videos/nuestro.jpg', pie: 'Un video de nuestras promos' } */
export const VIDEO_EJEMPLO: { src: string; poster: string; pie: string } | null = null

/** Cupones (ventas con cupón) que el dueño necesita para recuperar una parte de lo que invierte. */
export function cuponesPara(parte: number, inversion: number, gananciaPorVenta: number) {
  return Math.ceil((parte * inversion) / gananciaPorVenta)
}

/** Arma el link de WhatsApp con un mensaje ya escrito. */
export function linkWhatsApp(mensaje: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`
}
