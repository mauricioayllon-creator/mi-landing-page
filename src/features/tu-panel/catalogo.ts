/**
 * Tu panel (mauricio-ayllon.com/panel): la lista de TODO lo que hay, en un solo lugar.
 * De aquí salen las pestañas (Calculadoras, Links) y el Mapa.
 *
 * ¿Agregaste una herramienta o una página nueva? Agrégala aquí, en su grupo: así aparece en su pestaña
 * y en el Mapa, y no se pierde. Los paneles de los clientes NO van aquí: salen solos de public/clientes/.
 *
 * «Mi negocio» es tu panel de trabajo (public/panel/admin.html). Lo publica el publicador de tu compu,
 * así que aquí no se toca: solo se guardan sus direcciones (#/ventas, #/caja…) para poder ir directo.
 */

import type { NombreIcono } from './Iconos'

/** El dominio de los links que se copian y se mandan. */
export const SITIO = 'https://mauricio-ayllon.com'

export type AreaId = 'negocio' | 'calculadoras' | 'links' | 'mapa'

export type Area = { id: AreaId; nombre: string; corto: string; icono: NombreIcono; para: string; adentro: string }

export const AREAS: Area[] = [
  {
    id: 'negocio',
    nombre: 'Mi negocio',
    corto: 'Negocio',
    icono: 'maletin',
    para: 'Tu trabajo de cada día.',
    adentro: 'Lo que toca hoy, ventas, marketing, contenido, guiones, clientes, la caja y tus documentos.',
  },
  {
    id: 'calculadoras',
    nombre: 'Calculadoras',
    corto: 'Calcular',
    icono: 'calculadora',
    para: 'Para sacar los números antes de decidir.',
    adentro: 'Oferta (cuánto cobrar), Pauta (si conviene poner anuncios) y Recuperación (en cuántas ventas recupera).',
  },
  {
    id: 'links',
    nombre: 'Links',
    corto: 'Links',
    icono: 'enlace',
    para: 'Lo que ven otras personas.',
    adentro: 'Tu página, tu propuesta y la demo del cupón; el panel de cada cliente; lo que ve tu equipo.',
  },
  {
    id: 'mapa',
    nombre: 'Mapa',
    corto: 'Mapa',
    icono: 'mapa',
    para: 'Dónde está cada cosa.',
    adentro: 'Un buscador con todo lo que tienes, para qué sirve y un botón para ir directo.',
  },
]

/** Las pantallas de Mi negocio (tu panel de trabajo). `ruta` es su dirección adentro: #negocio/<ruta>. */
export type Seccion = { ruta: string; nombre: string; icono: NombreIcono; para: string; dentroDe?: string; palabras?: string }

export const SECCIONES_NEGOCIO: Seccion[] = [
  { ruta: 'inicio', nombre: 'Hoy', icono: 'brujula', para: 'Tu día: lo que toca con tus clientes, tus prospectos y tu semana, en el orden que trae plata.', palabras: 'dia pendientes tareas urgente' },
  { ruta: 'ventas', nombre: 'Ventas', icono: 'apreton', para: 'Lo que te llega por anuncios, tus llamadas, tus visitas en persona y el camino de cada prospecto hasta el cobro.', palabras: 'prospectos leads llamadas visitas cierre' },
  { ruta: 'marketing', nombre: 'Marketing', icono: 'megafono', para: 'Lo que gastas en cada campaña y cuántos te escribieron, llamaron y compraron.', palabras: 'pauta anuncios campañas tiktok meta gasto' },
  { ruta: 'contenido', nombre: 'Contenido', icono: 'camara', para: 'Cada video, del guion a publicado: el calendario, los formatos, los ángulos y en qué redes falta subirlo.', palabras: 'videos publicar calendario redes edicion' },
  { ruta: 'guiones', nombre: 'Guiones', icono: 'lapiz', para: 'Tu árbol de ángulos, tus formatos y tus guiones finales.', palabras: 'angulos formatos ganchos' },
  { ruta: 'clientes', nombre: 'Clientes', icono: 'gente', para: 'Cada cliente es un motor: su barra, lo que lo frena y lo que sigue.', palabras: 'proyectos pagos cobros link campaña' },
  { ruta: 'clientes/paneles', nombre: 'Sus paneles', dentroDe: 'Clientes', icono: 'ojo', para: 'Lo que ve cada cliente en su panel: su clave, qué ve y qué no, y la guía de cada sesión.', palabras: 'clave cliente panel mandar link' },
  { ruta: 'clientes/equipo', nombre: 'Claves del equipo', dentroDe: 'Clientes', icono: 'llave', para: 'El link y la clave de Belén y de Julio, para entrar a su panel.', palabras: 'belen julio clave equipo' },
  { ruta: 'caja', nombre: 'Caja', icono: 'billetera', para: 'La plata: los movimientos del banco y del efectivo, los clientes, los costos y la pauta.', palabras: 'plata dinero banco efectivo gastos costos saldos' },
  { ruta: 'documentos', nombre: 'Documentos', icono: 'carpeta', para: 'Lo nuestro y lo de cada cliente, en una carpeta cada uno: sesiones, acuerdos y transcripciones.', palabras: 'archivos notas transcripciones carpetas' },
  { ruta: 'objetivos', nombre: 'Objetivos', icono: 'diana', para: 'Primero el objetivo, después su plan, y del plan las tareas con su fecha.', palabras: 'metas plan' },
  { ruta: 'agencia', nombre: 'Mi semana', icono: 'calendario', para: 'Lo que toca cada día de tu semana, tu editor y lo que el panel aprendió de ti.', palabras: 'semana rutina agencia' },
  { ruta: 'agencia/editor', nombre: 'Tu editor', dentroDe: 'Mi semana', icono: 'tijera', para: 'El link de tu editor (con su llave) y lo que le toca hacer.', palabras: 'editor edicion link llave' },
  { ruta: 'constancia', nombre: 'Constancia', icono: 'grafica', para: 'Se cuenta sola con lo que terminas en el panel. Sin rachas que se rompan.', palabras: 'habitos avance' },
  { ruta: 'libreta', nombre: 'Ideas', icono: 'cuaderno', para: 'Si la idea te toma menos de 2 minutos, hazla. Si no, anótala aquí.', palabras: 'libreta notas ideas' },
  { ruta: 'cocina', nombre: 'La Cocina', icono: 'candado', para: 'El mapa de cómo se trabaja. Va protegido con tu contraseña.', palabras: 'privado metodo cocina' },
  { ruta: 'sistema', nombre: 'Mi sistema', icono: 'capas', para: 'Tu método escrito: los pasos de cada cliente, lo que dices en cada visita, los mensajes y qué cambió en cada versión.', palabras: 'metodo version cambios' },
  { ruta: 'guia', nombre: 'Cómo funciona', icono: 'libro', para: 'Tu método, paso a paso: cómo se arma tu día y qué hace cada pantalla.', palabras: 'ayuda guia manual' },
  { ruta: 'ajustes', nombre: 'Ajustes', icono: 'ajustes', para: 'Lo que tus clientes ven de ti en su link (tu marca, tu QR de pago) y tu tiempo.', palabras: 'configuracion qr marca' },
]

/** Las calculadoras. `src` = la página que se abre adentro; sin `src`, se dibuja aquí mismo. */
export type Calculadora = {
  id: 'oferta' | 'pauta' | 'recuperacion'
  nombre: string
  corto: string
  icono: NombreIcono
  pregunta: string
  cuando: string
  teDice: string[]
  extra: string
  src?: string
  palabras: string
}

export const CALCULADORAS: Calculadora[] = [
  {
    id: 'oferta',
    nombre: 'Calculadora de Oferta',
    corto: 'Oferta',
    icono: 'tendencia',
    pregunta: '¿Le puedo cumplir, cuánto le cobro y lo acepto?',
    cuando: 'En la llamada de diagnóstico con alguien que quiere tu servicio.',
    teDice: [
      'Si le puedes cumplir lo que quiere lograr',
      'Cuánto cobrarle: plan mensual o un lanzamiento',
      'Qué prometerle y qué producto suyo potenciar',
      'Si conviene aceptarlo o todavía no',
    ],
    extra: 'Trae la guía de la llamada y una vista limpia para mostrársela al cliente.',
    src: '/calculadora',
    palabras: 'precio cobrar diagnostico llamada venta aceptar prospecto lanzamiento mensual',
  },
  {
    id: 'pauta',
    nombre: 'Calculadora de Pauta',
    corto: 'Pauta',
    icono: 'megafono',
    pregunta: '¿Le conviene poner plata en anuncios?',
    cuando: 'Cuando un negocio quiere pautar, o ya pauta y no sabe si le está yendo bien.',
    teDice: [
      'Si le conviene, está al límite o pierde plata',
      'Cuánto poner en anuncios',
      'Qué arreglar primero',
      'Un plan para los próximos 30 días',
    ],
    extra: 'Te guía con 5 preguntas. Cada número se toca y te explica de dónde sale.',
    src: '/calculadora-pauta',
    palabras: 'anuncios publicidad meta tiktok presupuesto conviene',
  },
  {
    id: 'recuperacion',
    nombre: 'Calculadora de recuperación',
    corto: 'Recuperación',
    icono: 'billetera',
    pregunta: '¿En cuántas ventas recupera lo que invierte?',
    cuando: 'En la visita a una tienda, o cuando el dueño dice «está caro» o «¿y si no funciona?».',
    teDice: [
      'Cuánto le queda por venta con su regalo',
      'En cuántas ventas recupera lo que pone (tu servicio y su publicidad)',
      'Cuántos clientes tienen que llegar para su garantía',
    ],
    extra: 'Es la misma cuenta que ve el dueño en su propuesta.',
    palabras: 'garantia cupones recuperar inversion tienda promo caro',
  },
]

/** Para elegir rápido: lo que pasa → la calculadora. */
export const CUAL_USO: { si: string; usa: Calculadora['id'] }[] = [
  { si: 'Vas a hablar con alguien que quiere tu servicio', usa: 'oferta' },
  { si: 'Un negocio te pregunta si le conviene poner anuncios', usa: 'pauta' },
  { si: 'Un dueño de tienda duda si la promo le conviene', usa: 'recuperacion' },
]

/** Lo que ven otras personas. `url` relativa = de tu página; `donde` = en qué parte de Mi negocio se maneja. */
export type Enlace = {
  id: string
  nombre: string
  icono: NombreIcono
  quien: string
  para: string
  url?: string
  donde?: { ruta: string; texto: string }
  palabras: string
}

export const LINKS_PROSPECTOS: Enlace[] = [
  {
    id: 'principal',
    nombre: 'Tu página principal',
    icono: 'web',
    quien: 'Cualquiera',
    url: '/',
    para: 'La que va en tus anuncios y en tu perfil: el video y el botón para agendar una llamada por WhatsApp.',
    palabras: 'landing pagina web inicio vsl video anuncios bio',
  },
  {
    id: 'propuesta',
    nombre: 'Tu propuesta',
    icono: 'archivo',
    quien: 'El dueño de la tienda',
    url: '/propuesta',
    para: 'Se manda después de la segunda visita, sobre todo si dicen «lo pienso» o «lo hablo con mi socio». Lleva cómo lo hacemos, la cuenta de recuperación, la garantía y el botón para confirmar la fecha.',
    palabras: 'propuesta precio fecha socio pareja lo pienso garantia',
  },
  {
    id: 'cupon',
    nombre: 'Demo del cupón',
    icono: 'qr',
    quien: 'El dueño de la tienda',
    url: 'https://descuentos-com.netlify.app/?demo=1',
    para: 'Para mostrar cómo el cliente de la tienda reserva su cupón y su hora. Es una demo: no guarda nada.',
    palabras: 'cupon demo reserva tienda',
  },
]

export const LINKS_EQUIPO: Enlace[] = [
  {
    id: 'belen',
    nombre: 'Belén',
    icono: 'persona',
    quien: 'Belén',
    url: '/panel/equipo.html?p=belen',
    para: 'Ve sus tareas, la agenda con Meet, los clientes y sus claves, lo prometido y los saldos, las tareas de Julio, los documentos y la caja.',
    donde: { ruta: 'clientes/equipo', texto: 'Su clave está en Mi negocio › Clientes › Equipo' },
    palabras: 'belen equipo tareas agenda caja',
  },
  {
    id: 'julio',
    nombre: 'Julio',
    icono: 'persona',
    quien: 'Julio',
    url: '/panel/equipo.html?p=julio',
    para: 'Ve sus tareas, las grabaciones, el comprador, los ángulos y los guiones. Sin plata, sin claves y sin llamadas de venta.',
    donde: { ruta: 'clientes/equipo', texto: 'Su clave está en Mi negocio › Clientes › Equipo' },
    palabras: 'julio equipo grabaciones guiones',
  },
  {
    id: 'editor',
    nombre: 'Tu editor',
    icono: 'tijera',
    quien: 'Tu editor de video',
    para: 'Ve solo su cola de edición: los videos grabados, con su guion, y marca sus pasadas 1 y 3. No ve precios ni clientes.',
    donde: { ruta: 'agencia/editor', texto: 'Su link, con su llave, está en Mi negocio › Mi semana › Tu editor' },
    palabras: 'editor edicion videos pasadas cola',
  },
]

/** Lo que tu cliente ve además de su panel: el link de su campaña (videos para aprobar y pagos). */
export const LINK_CAMPANA: Enlace = {
  id: 'campana',
  nombre: 'El link de su campaña',
  icono: 'play',
  quien: 'Cada cliente',
  para: 'Ahí aprueba sus videos, ve lo que le toca y avisa cuando paga. Cada cliente tiene el suyo.',
  donde: { ruta: 'clientes', texto: 'Se copia en Mi negocio › Clientes › (el cliente)' },
  palabras: 'campaña aprobar videos pagos link cliente',
}

/** Un cliente con panel propio (sale solo de public/clientes/<carpeta>/datos.json). */
export type PanelCliente = { carpeta: string; nombre: string; inicial: string }

/** Las direcciones directas, por si alguna vez las necesitas (accesos directos, favoritos). */
export const DIRECCIONES: { url: string; que: string }[] = [
  { url: '/panel', que: 'Tu panel: esta página. Es la única que necesitas guardar.' },
  { url: '/panel/admin.html', que: 'Mi negocio solo, sin las pestañas de arriba (para el acceso directo del celular).' },
  { url: '/calculadora', que: 'Calculadora de Oferta.' },
  { url: '/calculadora-pauta', que: 'Calculadora de Pauta.' },
  { url: '/propuesta', que: 'Tu propuesta (se arma en Links).' },
  { url: '/clientes/…', que: 'El panel de cada cliente (están en Links).' },
]

/** Arma el link de la propuesta con la tienda, el precio y la fecha (lo que lee /propuesta). */
export function linkPropuesta(d: { tienda: string; precio: string; fecha: string }) {
  const q = new URLSearchParams()
  const limpio = (s: string, max: number) => s.replace(/[<>]/g, '').trim().slice(0, max)
  const tienda = limpio(d.tienda, 60)
  const fecha = limpio(d.fecha, 40)
  const precio = Number(d.precio.replace(/[^\d]/g, ''))
  if (tienda) q.set('t', tienda)
  if (precio >= 100 && precio <= 50000) q.set('p', String(precio))
  if (fecha) q.set('f', fecha)
  const s = q.toString()
  return '/propuesta' + (s ? '?' + s : '')
}

/** El link completo, para copiar o mandar. */
export function linkCompleto(url: string) {
  return /^https?:\/\//.test(url) ? url : SITIO + url
}

/** Para buscar sin tildes ni mayúsculas. */
export function normalizar(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
