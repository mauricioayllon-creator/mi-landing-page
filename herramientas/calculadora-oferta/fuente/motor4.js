/*MOTOR-INICIO*/
// ===== Motor de cálculo v2: funciones puras, sin DOM =====
const TIPOS_VENTA = {
  b2b: {
    nombre: 'A empresas, conversando',
    ayuda: 'Vende a otras empresas con visita, reunión o propuesta.',
    costoInteresado: 100, calificaPct: 35, cierrePct: 11, cicloDias: 35, publicidadPct: 2,
    organico: 8, reactivacionPct: 4.5, consultivo: true,
  },
  b2cAlto: {
    nombre: 'A personas, compras grandes',
    ayuda: 'Vende a personas que preguntan, comparan y deciden (clínicas, joyas, educación, inmuebles).',
    costoInteresado: 25, calificaPct: 40, cierrePct: 12, cicloDias: 14, publicidadPct: 4,
    organico: 12, reactivacionPct: 6, consultivo: true,
  },
  b2cBajo: {
    nombre: 'A personas, compras rápidas',
    ayuda: 'Local, delivery o tienda: la gente compra casi sin conversar.',
    costoInteresado: 5, calificaPct: 70, cierrePct: 15, cicloDias: 2, publicidadPct: 5,
    organico: 30, reactivacionPct: 8, consultivo: false,
  },
};

const SERVICIOS = [
  { id: 'estrategia', nombre: 'Estrategia y oferta', detalle: 'Cliente ideal, oferta, mensajes y plan. Reunión mensual de resultados.' },
  { id: 'contenido', nombre: 'Contenido (lo haces tú)', detalle: 'Guiones, grabación guiada, edición y publicación.' },
  { id: 'direccion', nombre: 'Ideas y guiones (ellos graban)', detalle: 'Tú dices qué grabar; su equipo graba y edita.' },
  { id: 'campanas', nombre: 'Anuncios', detalle: 'Armas los anuncios con el contenido que mejor funciona y los mides por ventas, no por me gusta.' },
  { id: 'guia', nombre: 'Guía para vender', detalle: 'Qué responder, cuándo volver a escribir y cómo cerrar. Les enseñas; ellos lo hacen.' },
  { id: 'automatizacion', nombre: 'Respuesta automática por WhatsApp', detalle: 'Contesta al instante cuando nadie puede, hace preguntas y agenda.' },
];

const REGLAS_BASE = {
  moneda: 'Bs',
  precioMinimo: 2200,
  anunciosMinimo: 500,
  marca: 'Mauricio Ayllón · Grow Business',
  garantiaTexto: '',
  casoReal: true,
  partePct: 20,
  bono: false,
  bonoPct: 20,
  horaObjetivo: 0,
  mejora: { piso: 15, meta: 25, techo: 40 },
  horas: { estrategia: 6, contenido: 30, direccion: 8, campanas: 12, guia: 6, automatizacion: 6 },
  // Lanzamiento (decidido por Mauricio el 24/10 y el 28/10/2026): un cobro por promo, en dos mitades
  precioLanzamiento: 2500,
  primeraMitadPct: 50,
  anunciosMinimoLanz: 500,
  topeGarantia: 25,
  diasExtraGarantia: 7,
  llegadaLanzPct: 50,
  horasLanzamiento: 35,
  planMes: 2500,
  planMesCompromiso: 2000,
  mesesCompromiso: 3,
  // Llamada de venta (pedido de Mauricio, 2026-11-05): lo que cobra en total, cuánto va a la pauta,
  // piso = recupera lo que invierte (1×), meta = lo duplica (2×), techo = lo triplica (3×),
  // y si no llega al piso le devuelve la mitad de su servicio (la pauta no se devuelve)
  ventaCobro: 2700,
  ventaPauta: 700,
  ventaPisoX: 1,
  ventaMetaX: 2,
  ventaTechoX: 3,
  ventaDevolverPct: 50,
};

const F_RESP = { '5min': 1, hora: 0.9, dia: 0.7, mas: 0.5, nose: 0.7 };
const F_SEG = { sistema: 1, aveces: 0.85, nunca: 0.7, nose: 0.8 };

function supuestosBase() {
  const s = {};
  for (const [k, t] of Object.entries(TIPOS_VENTA)) {
    s[k] = { costoInteresado: t.costoInteresado, calificaPct: t.calificaPct, cierrePct: t.cierrePct, organico: t.organico, reactivacionPct: t.reactivacionPct, publicidadPct: t.publicidadPct };
  }
  return s;
}

function n(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined) return 0;
  const x = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(x) ? x : 0;
}
function vacio(v) { return v === '' || v === null || v === undefined || (typeof v === 'string' && v.trim() === ''); }
function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
function r100(x) { return Math.round(x / 100) * 100; }
function c100(x) { return Math.ceil(x / 100) * 100; }
function r500(x) { return Math.round(x / 500) * 500; }

function fmtN(x, dec = 0) {
  if (!Number.isFinite(x)) return '—';
  return new Intl.NumberFormat('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(x);
}
function fmtM(x, mon = 'Bs') {
  if (!Number.isFinite(x)) return '—';
  const s = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(Math.round(Math.abs(x)));
  return (x < 0 ? '−' : '') + (mon ? mon + ' ' : '') + s;
}
function fmtP(x, dec = 0) { return Number.isFinite(x) ? fmtN(x * 100, dec) + '%' : '—'; }
function fmtPorDia(x, dec = 1) {
  if (!(x > 0)) return '0 por día';
  if (x >= 0.95) return fmtN(x, x < 10 && Math.abs(x - Math.round(x)) >= 0.05 ? dec : 0) + ' por día';
  const d = Math.round(1 / x);
  return d <= 1 ? '1 por día' : `1 cada ${d} días`;
}
function fmtVeces(x) { return Number.isFinite(x) ? fmtN(x, 1) + ' veces' : '—'; }

// ---------- Líneas de negocio ----------
function metricasLinea(l) {
  const m = clamp(n(l.margen), 0, 100) / 100;
  const ticket = Math.max(0, n(l.ticket));
  const out = { m, ticket, tipo: l.tipo };
  if (l.tipo === 'recurrente') {
    const vida = Math.max(1, vacio(l.vidaMeses) ? 12 : n(l.vidaMeses));
    out.vida = vida; out.gMes = ticket * m; out.g1 = out.gMes * Math.min(12, vida); out.gL = out.gMes * vida;
  } else if (l.tipo === 'repetida') {
    const ppy = Math.max(0.1, vacio(l.comprasAnio) ? 2 : n(l.comprasAnio));
    const anios = Math.max(0.1, vacio(l.aniosCliente) ? 1.5 : n(l.aniosCliente));
    const total = ppy * anios;
    out.ppy = ppy; out.anios = anios; out.totalCompras = total;
    out.gMes = ticket * m * ppy / 12; out.g1 = ticket * m * Math.min(total, ppy); out.gL = ticket * m * total;
  } else {
    out.gMes = 0; out.g1 = ticket * m; out.gL = ticket * m;
  }
  return out;
}

const PUNTAJE_COMPETENCIA = { baja: 100, media: 65, alta: 30 };
const PUNTAJE_CAPACIDAD = { mucha: 100, media: 60, poca: 20 };
const PUNTAJE_ENCAJE = { b2b: 100, b2cAlto: 90, b2cBajo: 45 };
function puntajeVelocidad(d) { return d <= 7 ? 100 : d <= 30 ? 80 : d <= 60 ? 60 : d <= 120 ? 35 : 15; }
function puntajePrevisible(l, mt) { return l.tipo === 'recurrente' ? 100 : l.tipo === 'repetida' ? 40 + Math.min(40, mt.ppy * 4) : 15; }

function lineaConPrudentes(l) {
  const x = { ...l };
  if (vacio(x.margen) || n(x.margen) <= 0) x.margen = 30;
  if (vacio(x.cicloDias)) x.cicloDias = (TIPOS_VENTA[x.tipoVenta] || TIPOS_VENTA.b2b).cicloDias;
  return x;
}

function analizarLineas(lineas, factNegocio = 0) {
  const base = lineas.map(l0 => {
    const l = lineaConPrudentes(l0);
    if (lineas.length === 1 && vacio(l.facturacion) && factNegocio > 0) l.facturacion = factNegocio;
    return { l0, l, mt: metricasLinea(l) };
  });
  const factTotal = base.reduce((s, x) => s + Math.max(0, n(x.l.facturacion)), 0);
  const gananciaTotal = base.reduce((s, x) => s + Math.max(0, n(x.l.facturacion)) * x.mt.m, 0);
  const vmax = Math.max(1, ...base.map(x => x.mt.gL));
  const lista = base.map(({ l0, l, mt }) => {
    const rel = 100 * Math.log(1 + mt.gL) / Math.log(1 + vmax);
    const abs = clamp(100 * Math.log(Math.max(mt.gL, 1) / 100) / Math.log(500), 0, 100);
    const partes = {
      valor: 0.6 * rel + 0.4 * abs, prev: puntajePrevisible(l, mt), margen: clamp(mt.m / 0.5 * 100, 0, 100),
      vel: puntajeVelocidad(Math.max(0, n(l.cicloDias))), enc: PUNTAJE_ENCAJE[l.tipoVenta] ?? 60,
      dif: PUNTAJE_COMPETENCIA[l.competencia] ?? 65, cap: PUNTAJE_CAPACIDAD[l.capacidad] ?? 60, puerta: l.abrePuertas ? 5 : 0,
    };
    let p = 0.25 * partes.valor + 0.20 * partes.prev + 0.15 * partes.margen + 0.10 * partes.vel + 0.10 * partes.enc + 0.10 * partes.dif + 0.10 * partes.cap + partes.puerta;
    p = clamp(Math.round(p), 0, 100);
    const fact = Math.max(0, n(l.facturacion));
    return {
      id: l.id, nombre: (l.nombre || '').trim() || 'Línea sin nombre', l, l0, mt, puntaje: p, partes,
      facturacion: fact, ganancia: fact * mt.m, participacion: factTotal > 0 ? fact / factTotal : 0,
      completa: mt.ticket > 0,
    };
  });
  return { lista, factTotal, gananciaTotal, factNegocio: Math.max(factNegocio, factTotal) };
}

function razonesLinea(x) {
  const r = [];
  const t = x.l.tipo;
  if (t === 'recurrente') r.push('le pagan todos los meses');
  else if (t === 'repetida' && x.mt.ppy >= 6) r.push('vuelven a comprar seguido');
  else if (t === 'unica') r.push('cada cliente compra una sola vez');
  if (x.mt.m >= 0.4) r.push(`deja ${fmtN(x.mt.m * 100)} de cada 100`);
  else if (x.mt.m < 0.25) r.push(`deja solo ${fmtN(x.mt.m * 100)} de cada 100`);
  if (x.partes.valor >= 80) r.push('cada cliente vale mucho');
  if (x.l.competencia === 'alta') r.push('tiene mucha competencia');
  if (x.l.competencia === 'baja') r.push('tiene poca competencia');
  if (x.l.abrePuertas) r.push('después le compran más');
  if (x.l.capacidad === 'poca') r.push('casi no puede crecer');
  return r;
}

const IDEAS_RECURRENTES = {
  b2b: ['un contrato mensual de mantenimiento, soporte o abastecimiento', 'entregas o visitas calendarizadas con precio por mes', 'un servicio con tiempo de respuesta garantizado'],
  b2cAlto: ['un plan de seguimiento o tratamiento con pago mensual', 'una membresía con controles o servicios incluidos', 'un programa por etapas con cuota mensual'],
  b2cBajo: ['un plan para empresas cercanas con pedidos fijos cada semana', 'una suscripción o club con beneficio mensual', 'paquetes prepagados (por ejemplo, 10 compras con descuento)'],
};

function construirHallazgos(an, p, ev) {
  const L = an.lista.filter(x => x.completa);
  const h = [];
  if (!L.length) return h;
  const mon = ev.R.moneda;
  const porPuntaje = [...L].sort((a, b) => b.puntaje - a.puntaje);
  const mejor = porPuntaje[0];
  const mayorFact = [...L].sort((a, b) => b.facturacion - a.facturacion)[0];
  if (L.length >= 2 && mejor.participacion < 0.35) {
    h.push({ tipo: 'oro', titulo: 'Su tesoro escondido', texto: `«${mejor.nombre}» es lo que más vale (${mejor.puntaje} de 100 puntos), pero hoy es solo el ${fmtP(mejor.participacion)} de lo que vende. Vale tanto porque ${razonesLinea(mejor).join(', ')}.` });
  } else if (L.length >= 2) {
    h.push({ tipo: 'oro', titulo: 'Lo mejor ya es lo principal', texto: `«${mejor.nombre}» es lo que más vale (${mejor.puntaje} de 100 puntos) y ya es el ${fmtP(mejor.participacion)} de lo que vende. El trabajo es hacerlo crecer.` });
  }
  if (L.length >= 2 && mayorFact.id !== mejor.id) {
    if (mayorFact.mt.m < 0.25 || mayorFact.l.tipo === 'unica') {
      h.push({ tipo: 'trampa', titulo: 'Mucha plata, poca calma', texto: `«${mayorFact.nombre}» trae la mayor parte de la plata (${fmtP(mayorFact.participacion)}), pero ${mayorFact.l.tipo === 'unica' ? 'cada cliente compra una sola vez' : 'los clientes vuelven poco'}${mayorFact.mt.m < 0.25 ? ` y le quedan solo ${fmtN(mayorFact.mt.m * 100)} de cada 100` : ''}. Da plata, pero no tranquilidad.` });
    } else if (mayorFact.l.competencia === 'alta') {
      h.push({ tipo: 'trampa', titulo: 'Donde hay más pelea', texto: `«${mayorFact.nombre}» es lo que más vende (${fmtP(mayorFact.participacion)}), pero ahí hay mucha competencia. Ahí los anuncios pelean por precio.` });
    }
  }
  const fijos = n(p.negocio.gastosFijos);
  const recurrentes = L.filter(x => x.l.tipo === 'recurrente');
  const gRec = recurrentes.reduce((s, x) => s + x.ganancia, 0);
  const foco = ev.foco;
  if (fijos > 0 && foco.mt.gMes > 0) {
    const cobertura = gRec / fijos;
    const faltan = Math.ceil(Math.max(0, 0.8 * fijos - gRec) / foco.mt.gMes);
    if (foco.l.tipo === 'recurrente' && faltan > 0) {
      h.push({ tipo: 'estructura', titulo: 'Que lo de cada mes pague las cuentas', texto: `Lo que hoy cobra cada mes le deja ${fmtM(gRec, mon)} y paga el ${fmtP(cobertura)} de sus gastos fijos. Con unos ${faltan} clientes más de «${foco.nombre}», pagaría el 80%. Así los meses malos ya no asustan.` });
    } else if (foco.l.tipo === 'repetida' && faltan > 0 && faltan <= 150) {
      h.push({ tipo: 'estructura', titulo: 'Si lo cobrara cada mes', texto: `Un cliente de «${foco.nombre}» le deja unos ${fmtM(foco.mt.gMes, mon)} al mes. Si lo vendiera como plan mensual, con unos ${faltan} clientes pagaría el 80% de sus gastos fijos.` });
    }
  }
  if (!recurrentes.length) {
    const ideas = IDEAS_RECURRENTES[mejor.l.tipoVenta] || IDEAS_RECURRENTES.b2b;
    h.push({ tipo: 'recurrente', titulo: 'Le falta algo que se cobre cada mes', texto: `Nada de lo que vende se cobra todos los meses. La idea más fácil: vender «${mejor.nombre}» como plan mensual, con entregas o visitas fijas. Otras ideas: ${ideas.join('; ')}.` });
  }
  if (ev.modo === 'optimizar' && ev.opt) {
    const o = ev.opt;
    if (foco.mt.g1 > o.cpaPlanMeta * 1.3) {
      const porMil = 1000 / o.cpaPlanMeta * foco.mt.g1 - 1000;
      h.push({ tipo: 'escalar', titulo: 'Le conviene poner más en anuncios', texto: `Con anuncios mejores, cada venta le costaría ${fmtM(o.cpaPlanMeta, mon)} y cada cliente le deja ${fmtM(foco.mt.g1, mon)} en un año. Por cada ${fmtM(1000, mon)} más en anuncios, ganaría unos ${fmtM(porMil, mon)}. Lo grande no es ahorrar: es poner más en lo que ya funciona.` });
    } else if (foco.mt.g1 < o.cpaHoy) {
      h.push({ tipo: 'trampa', titulo: 'Hoy sus anuncios pierden plata', texto: `Cada venta por anuncios le cuesta ${fmtM(o.cpaHoy, mon)} y el cliente le deja ${fmtM(foco.mt.g1, mon)} en un año. Primero hay que bajar ese costo.` });
    }
  }
  if (foco.l.abrePuertas && n(foco.l.ventaCruzadaPct) > 0 && n(foco.l.ventaCruzadaGanancia) > 0) {
    const extra = n(foco.l.ventaCruzadaPct) / 100 * n(foco.l.ventaCruzadaGanancia);
    h.push({ tipo: 'puerta', titulo: 'Después le compran más', texto: `De cada 100 clientes de «${foco.nombre}», unos ${fmtN(n(foco.l.ventaCruzadaPct))} le compran otra cosa después. Eso suma ${fmtM(extra, mon)} más por cliente. No lo cuento en la promesa: es ganancia extra.` });
  }
  return h;
}

// ---------- Cómo vende hoy ----------
function diagnosticar(p, T, cierre) {
  const h = p.hoy;
  const cerrar = { id: 'cerrar', nombre: 'Vender', sev: 0, notas: [] };
  const atraer = { id: 'atraer', nombre: 'Atraer gente', sev: 0, notas: [] };
  const confianza = { id: 'confianza', nombre: 'Dar confianza', sev: 0, notas: [] };
  if (h.respuesta === 'dia') { cerrar.sev += 1; cerrar.notas.push('Contesta tarde (en el día). Mientras espera, la persona se enfría.'); }
  if (h.respuesta === 'mas') { cerrar.sev += 2; cerrar.notas.push('Tarda más de un día en contestar. Muchos ya se fueron.'); }
  if (h.seguimiento === 'nunca') { cerrar.sev += 2; cerrar.notas.push('Si alguien no compra, no le vuelve a escribir.'); }
  if (h.seguimiento === 'aveces') { cerrar.sev += 1; cerrar.notas.push('A veces vuelve a escribir, a veces se olvida.'); }
  if (T.consultivo && !vacio(h.diasPropuesta) && n(h.diasPropuesta) > 3) { cerrar.sev += n(h.diasPropuesta) > 6 ? 2 : 1; cerrar.notas.push(`Tarda ${fmtN(n(h.diasPropuesta))} días en mandar el precio.`); }
  if (h.quienVende === 'dueno') { cerrar.sev += 1; cerrar.notas.push('Todo lo atiende el dueño, y no da abasto.'); }
  if (cierre.medido && cierre.factorHoy < 0.6) { cerrar.sev += 1; cerrar.notas.push(`De cada 100 personas que sí le pueden comprar, hoy compran ${fmtN(cierre.hoy * 100, 1)}. Un negocio ordenado logra ${fmtN(cierre.bench * 100, 1)}.`); }
  if (h.quienPauta === 'nadie' || n(h.pautaMes) <= 0) { atraer.sev += 2; atraer.notas.push('No pone anuncios: depende de la suerte y de que lo recomienden.'); }
  else if (n(h.ventasPautaMes) <= 0) { atraer.sev += 2; atraer.notas.push('Paga anuncios, pero no sabe qué ventas le traen.'); }
  if (!h.equipoContenido && h.contenidoPrueba !== 'bastante') { atraer.sev += 1; atraer.notas.push('Nadie le hace contenido todas las semanas.'); }
  if (h.contenidoPrueba === 'nada') { confianza.sev += 2; confianza.notas.push('No muestra casos, opiniones de clientes ni precios. La gente tiene que confiar a ciegas.'); }
  if (h.contenidoPrueba === 'poco') { confianza.sev += 1; confianza.notas.push('Muestra pocos casos y opiniones de clientes.'); }
  const etapas = [atraer, confianza, cerrar];
  const orden = [...etapas].sort((a, b) => b.sev - a.sev || (a.id === 'cerrar' ? -1 : 1));
  return { etapas, restriccion: orden[0].sev > 0 ? orden[0] : null };
}

// ---------- Anuncios: plataforma, objetivo de campaña y embudo ----------
// Promedios de mercado APROXIMADOS y conservadores para Bolivia (nov. 2026). Si el cliente ya pautó, se usan sus datos reales.
// Calibrado con un caso real (tienda de tenis en La Paz, sept. 2026): Bs 512 de publicidad, 236 mil vistas, unas 26 ventas.
// Con estos promedios ese caso queda cerca del escenario «si sale muy bien», no del esperado.
const TC_DEF = 12.09; // Bs por dólar: tipo de cambio del BCB (nov. 2026). Desde abril de 2026 las tarjetas pagan a este cambio, no a 6,96.
const ADS_PLATAFORMAS = {
  tiktok: { nombre: 'TikTok Ads', organico: 1.5, minDia: 20, minDiaPromo: 3, aprendizaje: 50 },
  meta: { nombre: 'Facebook e Instagram', organico: 1.05, minDia: 1, minDiaPromo: 1, aprendizaje: 50 },
};
const ADS_OBJETIVOS = {
  local: { nombre: 'Que vengan a la tienda (con cupón)', resultado: 'personas que piden el cupón', campana: { tiktok: 'Alcance o Vistas de video, solo en la zona cercana a la tienda', meta: 'Reconocimiento o Alcance, solo en la zona cercana' }, cpm: { tiktok: 0.9, meta: 1.2 } },
  mensajes: { nombre: 'Que le escriban por WhatsApp', resultado: 'conversaciones', campana: { tiktok: 'Clientes potenciales → Mensajes (o Tráfico a su WhatsApp)', meta: 'Interacción → Mensajes de WhatsApp' }, cpm: { tiktok: 2.0, meta: 2.5 }, clic: { tiktok: 0.007, meta: 0.010 }, inicio: { tiktok: 0.30, meta: 0.45 } },
  formulario: { nombre: 'Que deje sus datos en un formulario', resultado: 'formularios', campana: { tiktok: 'Clientes potenciales → Formulario instantáneo', meta: 'Clientes potenciales → Formulario instantáneo' }, cpm: { tiktok: 2.0, meta: 2.5 }, clic: { tiktok: 0.008, meta: 0.009 }, completa: { tiktok: 0.12, meta: 0.15 } },
  web: { nombre: 'Que compre en su página web', resultado: 'visitas a la web', campana: { tiktok: 'Tráfico (o Ventas, cuando ya tenga muchas compras)', meta: 'Tráfico o Ventas' }, cpm: { tiktok: 1.5, meta: 2.0 }, clic: { tiktok: 0.009, meta: 0.011 } },
  conocer: { nombre: 'Que lo conozcan', resultado: 'personas que escriben solas', campana: { tiktok: 'Alcance o Vistas de video', meta: 'Reconocimiento' }, cpm: { tiktok: 0.6, meta: 0.8 } },
};
// Por tipo de venta: precio de referencia y tasas del embudo (proporciones)
const ADS_TIPO = {
  b2cBajo: { ref: 60, interes: 0.007, llegada: 0.30, compraLocal: 0.70, web: 0.020, espontaneo: 0.0010 },
  b2cAlto: { ref: 800, interes: 0.005, llegada: 0.22, compraLocal: 0.50, web: 0.010, espontaneo: 0.0006 },
  b2b: { ref: 5000, interes: 0.002, llegada: 0.15, compraLocal: 0.40, web: 0.005, espontaneo: 0.0003 },
};
const ADS_ALCANCE = {
  barrio: { nombre: 'Gente de su zona (tienda o local)', audiencia: 80000 },
  ciudad: { nombre: 'Toda su ciudad (entregas o atención)', audiencia: 600000 },
  pais: { nombre: 'Todo el país (envíos)', audiencia: 3000000 },
  empresas: { nombre: 'Empresas (le vende a negocios)', audiencia: 40000 },
};
function alcanceNegocioDe(p, tipo) {
  const a = (p.anuncios || {}).alcance;
  if (a && a !== 'auto' && ADS_ALCANCE[a]) return { alcance: a, auto: false };
  return { alcance: tipo === 'b2b' ? 'empresas' : tipo === 'b2cBajo' ? 'barrio' : 'ciudad', auto: true };
}
function objetivoAdsDe(p, tipo, alcanceNeg, lanz) {
  const o = (p.anuncios || {}).objetivo;
  if (o && o !== 'auto' && ADS_OBJETIVOS[o]) return { objetivo: o, auto: false };
  if (alcanceNeg === 'empresas' || tipo === 'b2b') return { objetivo: 'formulario', auto: true };
  if (alcanceNeg === 'barrio' || lanz) return { objetivo: 'local', auto: true }; // un lanzamiento es con cupón y fecha
  return { objetivo: 'mensajes', auto: true };
}
// Un solo embudo, para una plataforma
function embudoPlataforma(plat, obj, bs, c) {
  const P = ADS_PLATAFORMAS[plat], O = ADS_OBJETIVOS[obj], T = ADS_TIPO[c.tipo] || ADS_TIPO.b2cAlto;
  const usd = bs / c.tc;
  const cpmBase = c.cpmRealUsd > 0 ? c.cpmRealUsd : O.cpm[plat];
  const cpm = cpmBase * c.factorCosto;
  const vistasPagadas = cpm > 0 ? usd / cpm * 1000 : 0;
  const orgFactor = (obj === 'local' || obj === 'conocer') ? P.organico : 1 + (P.organico - 1) * 0.2;
  const vistas = vistasPagadas * orgFactor;
  const frecuencia0 = c.pulsos ? 2.5 : 3;
  let alcance = vistas / frecuencia0, saturado = false;
  const tope = c.audiencia * 0.6;
  if (alcance > tope) { alcance = tope; saturado = true; }
  const fPrecio = clamp(Math.pow(T.ref / Math.max(1, c.ticket), 0.25), 0.6, 1.4);
  const califPlat = plat === 'tiktok' ? (c.tipo === 'b2b' ? 0.7 : 0.9) : 1;
  const r = { plat, usd, cpm, vistasPagadas, vistas, alcance, saturado, clics: 0, resultados: 0, contactados: 0, calificados: 0, llegadas: 0, clientes: 0, prospectar: 0, mensajes: 0, promesa: 0 };
  if (obj === 'local') {
    const fOferta = (c.cupon ? 1.3 : 0.6) * (c.ofertaBuena ? 1.15 : 1);
    r.resultados = alcance * T.interes * fPrecio * fOferta;
    // En un lanzamiento el cupón tiene día y hora y se recuerda a mano: llegan más (tu supuesto: 1 de cada 2)
    r.llegadas = r.resultados * (c.llegadaPct > 0 ? c.llegadaPct : T.llegada);
    r.clientes = r.llegadas * (c.compraPct > 0 ? c.compraPct : T.compraLocal * fPrecio * (0.75 + 0.25 * c.factorAtencion));
    r.prospectar = r.resultados; r.mensajes = r.resultados * 0.5; r.promesa = r.llegadas;
  } else if (obj === 'mensajes') {
    r.clics = vistasPagadas * O.clic[plat];
    r.resultados = r.clics * O.inicio[plat];
    r.calificados = r.resultados * c.calif * califPlat;
    r.clientes = r.calificados * c.cierrePlan;
    r.prospectar = r.resultados; r.mensajes = r.resultados; r.promesa = r.calificados;
  } else if (obj === 'formulario') {
    r.clics = vistasPagadas * O.clic[plat];
    r.resultados = r.clics * O.completa[plat];
    r.contactados = r.resultados * 0.6;
    r.calificados = r.contactados * c.calif * califPlat * 0.8;
    r.clientes = r.calificados * c.cierrePlan;
    r.prospectar = r.resultados; r.mensajes = r.contactados; r.promesa = r.calificados;
  } else if (obj === 'web') {
    r.clics = vistasPagadas * O.clic[plat];
    r.resultados = r.clics;
    r.clientes = r.clics * T.web;
    r.mensajes = r.clics * 0.02; r.promesa = r.clics;
  } else {
    r.resultados = alcance * T.espontaneo;
    r.calificados = r.resultados * c.calif * califPlat;
    r.clientes = r.calificados * c.cierrePlan;
    r.mensajes = r.resultados; r.promesa = alcance;
  }
  // Si ya pautó: su costo real por resultado manda (los pasos de abajo siguen igual)
  if (c.costoRealBs > 0 && obj !== 'conocer' && r.resultados > 0) {
    const f = (bs / (c.costoRealBs * c.factorCosto)) / r.resultados;
    for (const k of ['clics', 'resultados', 'contactados', 'calificados', 'llegadas', 'clientes', 'prospectar', 'mensajes']) r[k] *= f;
    if (obj !== 'conocer') r.promesa *= f;
  }
  r.frecuencia = alcance > 0 ? vistas / alcance : 0;
  return r;
}
function modeloAds(p, c) {
  const A = p.anuncios || {};
  const platSel = ['tiktok', 'meta', 'ambas'].includes(A.plataforma) ? A.plataforma : 'tiktok';
  const { alcance: alcanceNeg, auto: alcanceAuto } = alcanceNegocioDe(p, c.tipo);
  const { objetivo, auto: objetivoAuto } = objetivoAdsDe(p, c.tipo, alcanceNeg, c.lanz);
  const tc = n(A.tc) > 0 ? n(A.tc) : TC_DEF;
  const reparto = platSel === 'ambas' ? [['tiktok', 0.7], ['meta', 0.3]] : [[platSel, 1]];
  const O = ADS_OBJETIVOS[objetivo];
  const partes = [], avisos = [];
  const conversion = ['mensajes', 'formulario', 'web'].includes(objetivo);
  for (const [plat, sh] of reparto) {
    const P = ADS_PLATAFORMAS[plat];
    const bs = c.presupuesto * sh, usd = bs / tc;
    let modo = 'continuo', dias = 30, factorModo = 1;
    if (plat === 'tiktok') {
      if (usd / 30 >= P.minDia) modo = 'continuo';
      else if (usd >= P.minDia * 3) { modo = 'pulsos'; dias = Math.min(30, Math.floor(usd / P.minDia)); }
      else { modo = 'promocionar'; dias = clamp(Math.floor(usd / P.minDiaPromo), 1, 30); factorModo = 0.85; }
    }
    const e = embudoPlataforma(plat, objetivo, bs, { ...c, tc, pulsos: modo !== 'continuo', audiencia: ADS_ALCANCE[alcanceNeg].audiencia, cpmRealUsd: n(A.cpmReal) > 0 ? n(A.cpmReal) / tc : 0, costoRealBs: n(A.costoResultadoReal) });
    let aprendizaje = false;
    if (conversion && e.resultados / 4.3 < P.aprendizaje && !(n(A.costoResultadoReal) > 0)) { aprendizaje = true; factorModo *= 0.85; }
    if (n(A.costoResultadoReal) > 0) factorModo = 1; // su costo real ya incluye cómo pautó
    if (factorModo !== 1) for (const k of ['clics', 'resultados', 'contactados', 'calificados', 'llegadas', 'clientes', 'prospectar', 'mensajes', 'promesa']) e[k] *= factorModo;
    partes.push({ ...e, sh, bs, modo, dias, aprendizaje, nombre: P.nombre, campana: O.campana[plat] });
  }
  const suma = k => partes.reduce((s, x) => s + (x[k] || 0), 0);
  const out = {
    plataforma: platSel, nombrePlataforma: platSel === 'ambas' ? 'TikTok y Meta' : ADS_PLATAFORMAS[platSel].nombre,
    objetivo, objetivoAuto, objetivoNombre: O.nombre, resultadoNombre: O.resultado, alcanceNegocio: alcanceNeg, alcanceAuto, alcanceNombre: ADS_ALCANCE[alcanceNeg].nombre,
    presupuesto: c.presupuesto, tc, usd: c.presupuesto / tc, partes,
    vistasPagadas: suma('vistasPagadas'), vistas: suma('vistas'), alcance: suma('alcance'), clics: suma('clics'), resultados: suma('resultados'),
    contactados: suma('contactados'), calificados: suma('calificados'), llegadas: suma('llegadas'), clientes: suma('clientes'), prospectar: suma('prospectar'), mensajes: suma('mensajes'), promesa: suma('promesa'),
    saturado: partes.some(x => x.saturado), aprendizaje: partes.some(x => x.aprendizaje), fuente: n(A.costoResultadoReal) > 0 || n(A.cpmReal) > 0 ? 'real' : 'mercado',
    cupon: c.cupon, avisos, lanz: !!c.lanz,
  };
  out.frecuencia = out.alcance > 0 ? out.vistas / out.alcance : 0;
  out.cpmBs = out.vistasPagadas > 0 ? c.presupuesto / out.vistasPagadas * 1000 : 0;
  out.costoResultadoBs = out.resultados > 0 ? c.presupuesto / out.resultados : 0;
  out.costoLlegadaBs = out.llegadas > 0 ? c.presupuesto / out.llegadas : 0;
  out.costoClienteBs = out.clientes > 0 ? c.presupuesto / out.clientes : 0;
  // Videos que hacen falta (en TikTok los videos se gastan rápido)
  const tk = partes.find(x => x.plat === 'tiktok');
  out.videosMes = tk && tk.modo !== 'continuo' ? Math.max(4, 4 * Math.ceil(tk.dias / 4)) : clamp(Math.ceil(out.usd / 50), 4, 20);
  if (tk && tk.modo !== 'continuo') out.videosMes = clamp(out.videosMes, 4, 12);
  if (c.lanz) out.videosMes = 9; // 3 cuerpos con 3 ganchos cada uno
  // Avisos de experto
  for (const x of partes) {
    if (x.plat !== 'tiktok') continue;
    if (c.lanz) {
      if (x.modo !== 'continuo') avisos.push(`Con ${fmtM(x.bs)} (unos USD ${fmtN(x.usd)}) no alcanza para tener TikTok Ads prendido los 14 días (el mínimo es USD 20 por día). Se arma así: un poco con «Promocionar» desde el primer video, y la mitad de la plata en los 3 últimos días antes del canje, sobre el video que más gustó.`);
      continue;
    }
    if (x.modo === 'pulsos') avisos.push(`En TikTok Ads el mínimo es USD 20 por día. Con ${fmtM(x.bs)} (unos USD ${fmtN(x.usd)}) no alcanza para tenerlo prendido todo el mes: mejor en ${x.dias} días fuertes, como un lanzamiento de fin de semana o cerca de fin de mes, cuando la gente cobra.`);
    if (x.modo === 'promocionar') avisos.push(`Con ${fmtM(x.bs)} (unos USD ${fmtN(x.usd)}), TikTok Ads solo da para ${Math.max(0, Math.floor(x.usd / 20))} días. Mejor usar «Promocionar» desde la app (desde unos USD 3 por día) para empujar los videos que ya gustaron.`);
  }
  if (out.aprendizaje) avisos.push(`Con unas ${fmtN(out.resultados / 4.3)} ${O.resultado} por semana, la campaña no termina de aprender (las plataformas piden unas 50 por semana). Funciona, pero sale un poco más caro: conviene juntar la plata en menos días.`);
  if (out.saturado) avisos.push('La zona es chica para esta plata: la misma gente vería el anuncio demasiadas veces. Amplía la zona o baja la plata.');
  if (tc < 9) avisos.push(`Ojo con el dólar: desde abril de 2026 las tarjetas pagan al tipo de cambio del Banco Central (en noviembre de 2026, unos Bs ${fmtN(TC_DEF, 2)}). Con ${fmtN(tc, 2)} los números salen inflados.`);
  if ((c.tipo === 'b2b' || alcanceNeg === 'empresas') && platSel !== 'meta') avisos.push('En TikTok hay pocos dueños y gerentes buscando proveedores. Si le vende a empresas, prueba también Facebook, Instagram o LinkedIn, y usa un formulario con preguntas que filtren.');
  if (objetivo === 'local' && !c.cupon) avisos.push('Sin cupón o regalo, menos gente se anima a ir. Con un regalo para la primera visita llegan más.');
  if (objetivo === 'conocer') avisos.push('Con «que lo conozcan» casi nadie escribe al tiro: sirve para calentar a la gente antes de un lanzamiento. Para clientes este mes, usa mensajes o cupón.');
  if (objetivo === 'local' && c.tipo === 'b2b') avisos.push('A las empresas no se les trae a una tienda con cupón: para ellas usa formulario o mensajes.');
  return out;
}

// ---------- Evaluación completa ----------
// Los números que no dio el dueño (se usan igual en el plan mensual y en el lanzamiento)
function estimadosDe(p, foco, T) {
  const estimados = [];
  if (vacio(foco.l0.margen) || n(foco.l0.margen) <= 0) estimados.push('cuánto le queda de cada 100 (usé 30)');
  if (foco.l.tipo === 'recurrente' && vacio(foco.l0.vidaMeses)) estimados.push('cuántos meses se queda un cliente (usé 12)');
  if (foco.l.tipo === 'repetida' && vacio(foco.l0.comprasAnio)) estimados.push('cuántas veces al año compra (usé 2)');
  if (foco.l.tipo === 'repetida' && vacio(foco.l0.aniosCliente)) estimados.push('cuántos años sigue comprando (usé 1,5)');
  if (vacio(foco.l0.cicloDias)) estimados.push(`cuántos días tarda una venta (usé ${T.cicloDias})`);
  const F = p.fuentes || {};
  const marcas = [[`linea:${foco.id}:ticket`, 'el precio promedio'], [`linea:${foco.id}:margen`, 'cuánto le queda de cada 100'], [`linea:${foco.id}:vidaMeses`, 'cuántos meses se queda un cliente'], [`linea:${foco.id}:comprasAnio`, 'cuántas veces al año compra'], [`linea:${foco.id}:aniosCliente`, 'cuántos años sigue comprando'], [`linea:${foco.id}:cicloDias`, 'cuántos días tarda una venta'], ['hoy.interesadosMes', 'cuántos preguntan al mes'], ['hoy.clientesMes', 'cuántos clientes nuevos consigue']];
  for (const [k, t] of marcas) if (F[k] === 'estimado' && !estimados.some(e => e.startsWith(t))) estimados.push(t + ' (valor por las dudas)');
  return estimados;
}
// Cuántos compran hoy, de los que sí pueden comprar (medido si dio sus números; si no, adivinado por cómo atiende)
function cierreHoyDe(p, an, foco, T, sup, estimados) {
  const h = p.hoy;
  const calif = clamp(n(sup.calificaPct), 1, 100) / 100;
  const bench = clamp(n(sup.cierrePct), 0.1, 100) / 100;
  const principal = [...an.lista].filter(x => x.completa).sort((a, b) => b.facturacion - a.facturacion)[0];
  const focoEsPrincipal = h.numerosDe !== 'negocio' || !principal || principal.id === foco.id || an.lista.length === 1;
  const interesados = focoEsPrincipal ? n(h.interesadosMes) : 0, clientes = focoEsPrincipal ? n(h.clientesMes) : 0;
  let factorHoy, medido = false;
  if (interesados > 0 && clientes > 0) {
    factorHoy = clamp(clientes / (interesados * calif) / bench, 0.05, 1.3);
    medido = true;
  } else {
    factorHoy = (F_RESP[h.respuesta] ?? 0.7) * (F_SEG[h.seguimiento] ?? 0.8) * (T.consultivo ? (vacio(h.diasPropuesta) ? 0.9 : n(h.diasPropuesta) <= 2 ? 1 : n(h.diasPropuesta) <= 5 ? 0.9 : 0.75) : 1);
    estimados.push(focoEsPrincipal ? 'cuántos de los que preguntan terminan comprando (lo adiviné por cómo atiende)' : `cuántos compran «${foco.nombre}» (lo adiviné: sus números son de todo el negocio)`);
  }
  return { calif, bench, focoEsPrincipal, interesados, clientes, factorHoy, medido };
}
function evaluar(p, reglas, an, focoId) {
  const R = normalizarReglasMotor(reglas);
  const foco = an.lista.find(x => x.id === focoId) || an.lista.find(x => x.completa) || an.lista[0];
  const tipo = TIPOS_VENTA[foco.l.tipoVenta] ? foco.l.tipoVenta : 'b2b';
  const T = TIPOS_VENTA[tipo];
  const sup = { ...supuestosBase()[tipo], ...((p.supuestos || {})[tipo] || {}) };
  const h = p.hoy;
  const estimados = estimadosDe(p, foco, T);
  const mt = foco.mt;

  // Cierre: hoy y con el plan
  const { calif, bench, focoEsPrincipal, interesados, factorHoy, medido } = cierreHoyDe(p, an, foco, T, sup, estimados);
  // Modo y alcance
  const pautaHoy = Math.max(0, n(h.pautaMes));
  const ventasPautaHoy = Math.max(0, n(h.ventasPautaMes));
  const hayDatosPauta = pautaHoy > 0 && ventasPautaHoy > 0;
  const sv = p.servicio || {};
  let modo = sv.modo || 'auto';
  let avisoModo = '';
  if (modo === 'auto') modo = hayDatosPauta && h.equipoContenido ? 'optimizar' : 'crecer';
  if (modo === 'optimizar' && !hayDatosPauta) { modo = 'crecer'; avisoModo = 'Para mejorar sus anuncios necesito saber cuánto paga hoy y cuántas ventas le traen. Mientras tanto, lo calculé como «crecer».'; }
  const alc = { estrategia: true };
  let cont = sv.contenido || 'auto';
  if (cont === 'auto') cont = h.equipoContenido ? (h.contenidoPrueba === 'bastante' ? 'no' : 'direccion') : (modo === 'optimizar' ? 'no' : 'completo');
  alc.contenido = cont === 'completo'; alc.direccion = cont === 'direccion';
  alc.campanas = (sv.campanas || 'auto') !== 'no';
  let guia = sv.guia || 'auto';
  if (guia === 'auto') guia = (modo === 'crecer' || factorHoy < 0.85) ? 'si' : 'no';
  alc.guia = guia === 'si';
  alc.automatizacion = (sv.automatizacion || 'auto') === 'si';
  const compromiso = p.compromiso || {};
  const guiaActiva = alc.guia && !!compromiso.aplicaGuia;

  let factorPlan = factorHoy;
  if (alc.automatizacion && ['dia', 'mas', 'nose'].includes(h.respuesta)) factorPlan = Math.max(factorPlan, factorPlan / (F_RESP[h.respuesta] ?? 0.7) * 0.9);
  if (guiaActiva && factorPlan < 1) factorPlan = factorPlan + 0.5 * (1 - factorPlan);
  factorPlan = Math.min(factorPlan, Math.max(1, factorHoy));
  const cierreHoy = bench * factorHoy, cierrePlan = bench * factorPlan;
  const ratioCierre = cierreHoy > 0 ? cierrePlan / cierreHoy : 1;
  const cierre = { hoy: cierreHoy, plan: cierrePlan, bench, factorHoy, factorPlan, medido, calif, guiaActiva };

  // Presupuesto y duración
  // ¿La publicidad del plan reemplaza la que ya paga? Por defecto sí, salvo que la de hoy ya traiga ventas de otra línea
  const reemplaza = modo === 'optimizar' ? true : (sv.reemplazaPauta === 'si' ? true : sv.reemplazaPauta === 'no' ? false : (ventasPautaHoy <= 0 || focoEsPrincipal));
  let presupuesto;
  if (!alc.campanas) presupuesto = modo === 'optimizar' ? pautaHoy : 0;
  else if (!vacio(sv.presupuesto)) presupuesto = Math.max(0, n(sv.presupuesto));
  else if (modo === 'optimizar') presupuesto = pautaHoy;
  else { const sugerido = r500(an.factNegocio * n(sup.publicidadPct) / 100); presupuesto = reemplaza ? Math.max(pautaHoy, sugerido) : sugerido; }
  const adsMin = Math.max(0, n(R.anunciosMinimo));
  if (alc.campanas && modo === 'crecer' && vacio(sv.presupuesto) && presupuesto < adsMin) presupuesto = adsMin;
  const extraPauta = reemplaza ? Math.max(0, presupuesto - pautaHoy) : presupuesto;
  const ciclo = Math.max(0, n(foco.l.cicloDias));
  const dias = clamp(n(p.meta?.diasMes) || 26, 1, 31);
  const Dauto = clamp(Math.ceil(1 + 4 * ciclo / 30), 3, 12);
  const D = n(p.plan?.duracionManual) > 0 ? clamp(Math.round(n(p.plan.duracionManual)), 2, 24) : Dauto;
  const L = Math.max(0, Math.round(ciclo / 30));

  // Anuncios del plan (traer clientes nuevos): embudo por plataforma y objetivo
  let ads = null;
  if (alc.campanas && modo === 'crecer' && presupuesto > 0) {
    let ofertaBuena = false;
    try { const ofr = p.oferta && p.oferta.activa ? evaluarOferta(p) : null; ofertaBuena = !!(ofr && !ofr.incompleta && ofr.puntaje >= 75 && ofr.lineaId === foco.id); } catch (e) { }
    ads = modeloAds(p, { presupuesto, tipo, ticket: mt.ticket, calif, cierrePlan, factorAtencion: clamp(factorPlan, 0.4, 1), cupon: (p.anuncios || {}).cupon !== false, ofertaBuena, factorCosto: n((p.anuncios || {})._factorCosto) || 1 });
  }

  // Resultado en un mes normal (ya en marcha), escenario meta, por fuente
  const cpl = ads && ads.resultados > 0 ? presupuesto / ads.resultados : Math.max(0.01, n(sup.costoInteresado));
  const leadsCont = alc.contenido ? n(sup.organico) : alc.direccion ? n(sup.organico) * 0.6 : 0;
  const fuentes = { campanas: 0, contenido: 0, guia: 0 };
  let opt = null;
  let leadsPagaMes = 0;
  const leadsViejaPauta = ventasPautaHoy > 0 && cierreHoy > 0 ? ventasPautaHoy / (calif * cierreHoy) : 0;
  if (modo === 'crecer') {
    leadsPagaMes = ads ? ads.resultados : 0;
    fuentes.campanas = Math.max(0, (ads ? ads.clientes : 0) - (alc.campanas && reemplaza ? ventasPautaHoy : 0));
    fuentes.contenido = leadsCont * calif * cierrePlan;
    const baseGuia = Math.max(0, interesados - (alc.campanas && reemplaza ? leadsViejaPauta : 0));
    fuentes.guia = guiaActiva ? baseGuia * calif * Math.max(0, cierrePlan - cierreHoy) : 0;
  } else {
    const cpaHoy = pautaHoy / ventasPautaHoy;
    const esc = {};
    for (const k of ['piso', 'meta', 'techo']) {
      const m = clamp(n(R.mejora[k]), 0, 90) / 100;
      // Lo que se invierte por encima de lo actual rinde un 20% menos (cada peso extra cuesta más)
      const ventasPorCampana = alc.campanas ? Math.min(presupuesto, pautaHoy) / (cpaHoy * (1 - m)) + Math.max(0, presupuesto - pautaHoy) / (cpaHoy * (1 - m) * 1.25) : ventasPautaHoy;
      const conCierre = ventasPorCampana * ((guiaActiva || alc.automatizacion) ? ratioCierre : 1);
      esc[k] = { m, ventasPlan: conCierre, campanas: Math.max(0, ventasPorCampana - ventasPautaHoy), guia: Math.max(0, conCierre - ventasPorCampana), cpaPlan: presupuesto / conCierre };
    }
    opt = { cpaHoy, ventasHoy: ventasPautaHoy, esc, cpaPlanMeta: esc.meta.cpaPlan };
    fuentes.campanas = esc.meta.campanas;
    fuentes.guia = esc.meta.guia;
    fuentes.contenido = leadsCont * calif * cierrePlan;
  }
  const reactivados = guiaActiva ? n(h.viejos) * n(sup.reactivacionPct) / 100 : 0;

  // Escenarios: piso, meta, techo
  const factores = { piso: 2 / 3, meta: 1, techo: 4 / 3 };
  function fuentesDe(k) {
    if (modo === 'optimizar') {
      const e = opt.esc[k];
      return { campanas: e.campanas, guia: e.guia, contenido: fuentes.contenido * factores[k] };
    }
    const f = factores[k];
    return { campanas: fuentes.campanas * f, contenido: fuentes.contenido * f, guia: fuentes.guia * f };
  }
  // Rampa por mes y retraso por ciclo
  const RAMPA = { campanas: modo === 'optimizar' ? [0.3, 0.7, 1] : [0.6, 0.85, 1], contenido: [0.3, 0.6, 1], guia: [0.5, 1] };
  const inicio = modo === 'optimizar' ? 1 : 2;
  function curvaMes(fu, factorReact) {
    const out = new Array(D + L + 3).fill(0);
    for (let m = inicio; m <= D; m++) {
      const i = m - inicio;
      const v = fu.campanas * RAMPA.campanas[Math.min(i, RAMPA.campanas.length - 1)]
        + fu.contenido * RAMPA.contenido[Math.min(i, RAMPA.contenido.length - 1)]
        + fu.guia * RAMPA.guia[Math.min(i, RAMPA.guia.length - 1)];
      out[m + L] += v;
    }
    const r = reactivados * factorReact;
    if (L >= 1 && D >= 2) { out[1] += r / 2; out[2] += r / 2; } else out[1] += r;
    const porMes = []; let dentro = 0, cola = 0;
    for (let m = 1; m < out.length; m++) { porMes[m] = out[m]; if (m <= D) dentro += out[m]; else cola += out[m]; }
    return { porMes, dentro, cola, total: dentro + cola };
  }

  // Precio: una parte de lo que le haces ganar en un mes normal (contando lo mínimo y solo los clientes que le caben),
  // sin que tu precio + los anuncios pasen de 15 de cada 100 bolivianos que vende, y nunca menos de tu mínimo.
  const g1 = mt.g1, gL = mt.gL;
  const cap = capacidadDe(p, mt, D);
  const fuPiso = fuentesDe('piso');
  let ratioCapPiso = 1;
  {
    const cvP = curvaMes(fuPiso, factores.piso);
    if (cap.sabe && !cap.legado) { let rc = cargaYRecorte(cvP.porMes, cap, D, false, true); if (rc.recorto && cap.extra > 0) rc = cargaYRecorte(cvP.porMes, cap, D, true, true); ratioCapPiso = cvP.total > 0 ? rc.total / cvP.total : 1; }
    else if (cap.legado && cvP.total > cap.libre) ratioCapPiso = cap.libre / cvP.total;
  }
  const mesNormalPiso = (fuPiso.campanas + fuPiso.contenido + fuPiso.guia) * ratioCapPiso;
  const valorMesPiso = mesNormalPiso * g1;
  const precioValor = n(R.partePct) / 100 * valorMesPiso;
  const techoPeso = an.factNegocio > 0 ? Math.floor((0.15 * an.factNegocio - extraPauta) / 100) * 100 : Infinity;
  const precioSinTope = r100(precioValor);
  const topePorBolsillo = precioSinTope > techoPeso && precioSinTope > n(R.precioMinimo);
  const precio = Math.max(n(R.precioMinimo), Math.min(precioSinTope, techoPeso));
  const forzado = precioValor < n(R.precioMinimo);
  const horas = Object.entries(alc).filter(([k, v]) => v && R.horas[k] !== undefined).reduce((s, [k]) => s + n(R.horas[k]), 0);

  const costosCliente = {
    herramientas: Math.max(0, n(p.plan?.herramientas)) + (alc.automatizacion ? 0 : 0),
    inicial: Math.max(0, n(p.plan?.inicial)),
    ahorro: Math.max(0, n(p.plan?.ahorro)),
  };
  const retrasoCobro = Math.max(0, Math.round(n(p.negocio?.cobroDias) / 30));
  const escenarios = {};
  let limitadoPorCapacidad = false;
  for (const k of ['piso', 'meta', 'techo']) {
    const fu = fuentesDe(k);
    let cv = curvaMes(fu, factores[k]);
    const sinLimite = cargaYRecorte(cv.porMes, cap, D, false, false);
    const capInfo = { necesita: sinLimite.pico, mesPico: sinLimite.mesPico, carga: sinLimite.carga, recorto: false, usaExtra: false, perdidos: 0, totalSinLimite: sinLimite.total };
    if (cap.sabe && !cap.legado) {
      let rc = cargaYRecorte(cv.porMes, cap, D, false, true);
      if (rc.recorto && cap.extra > 0) { rc = cargaYRecorte(cv.porMes, cap, D, true, true); capInfo.usaExtra = true; }
      if (rc.recorto) { limitadoPorCapacidad = true; capInfo.recorto = true; }
      capInfo.perdidos = Math.max(0, sinLimite.total - rc.total);
      capInfo.cargaFinal = rc.carga;
      cv = { porMes: rc.porMes, dentro: rc.dentro, cola: rc.cola, total: rc.total };
    } else if (cap.legado && cv.total > cap.libre) {
      const f = cap.libre / cv.total;
      capInfo.perdidos = cv.total - cap.libre; capInfo.recorto = true;
      cv = { porMes: cv.porMes.map(x => (x || 0) * f), dentro: cv.dentro * f, cola: cv.cola * f, total: cap.libre };
      limitadoPorCapacidad = true;
    }
    const N = cv.total;
    const valorFuente = { campanas: 0, contenido: 0, guia: 0 };
    const tot = fu.campanas + fu.contenido + fu.guia;
    const parteGuiaMes = tot > 0 ? fu.guia / tot : 0;
    const bonoTotal = 0;
    const fl = flujoCliente(mt, cv.porMes, D + L, D, {
      fijo: precio, bonoPorCliente: 0, extraPauta, inicioPauta: inicio,
      herramientas: costosCliente.herramientas, inicial: costosCliente.inicial, ahorro: costosCliente.ahorro, retraso: retrasoCobro,
    });
    const V1 = N * g1;
    const valorGuia = (reactivados * factores[k]) * g1 + (N - reactivados * factores[k]) * g1 * parteGuiaMes;
    valorFuente.guia = valorGuia;
    valorFuente.campanas = (N - reactivados * factores[k]) * g1 * (tot > 0 ? fu.campanas / tot : 0);
    valorFuente.contenido = (N - reactivados * factores[k]) * g1 * (tot > 0 ? fu.contenido / tot : 0);
    escenarios[k] = {
      N, dentro: cv.dentro, mesNormal: tot, cierres: cv.porMes, cola: cv.cola, ...fl, V1, VL: N * gL, valorFuente,
      dependencia: V1 > 0 ? valorGuia / V1 : 0,
      roi1: fl.invNeta > 0 ? V1 / fl.invNeta : Infinity, ventas1: mt.m > 0 ? V1 / mt.m : 0,
      honorarios: precio * D, capInfo,
    };
  }
  if (R.bono) {
    for (const k of ['meta', 'techo']) {
      const extra = Math.max(0, escenarios[k].V1 - escenarios.piso.V1);
      escenarios[k].bono = n(R.bonoPct) / 100 * extra;
      escenarios[k].honorarios += escenarios[k].bono;
    }
    escenarios.piso.bono = 0;
  }

  // Promesa
  const promesa = {};
  if (modo === 'crecer') {
    const obj = ads ? ads.objetivo : null;
    const suma = obj === 'local' || obj === 'web' || obj === 'conocer';
    let piso = 0;
    for (let m = 2; m <= D; m++) {
      const i = m - 2, rc = RAMPA.campanas[Math.min(i, 2)], rco = RAMPA.contenido[Math.min(i, 2)];
      piso += ((ads ? ads.promesa : 0) * rc + (suma ? 0 : leadsCont * calif * rco)) * (2 / 3);
    }
    promesa.tipo = obj === 'local' ? 'llegadas' : obj === 'web' ? 'visitas' : obj === 'conocer' ? 'alcance' : 'interesados';
    promesa.valorPiso = Math.floor(piso);
    promesa.interesadosPiso = promesa.valorPiso;
    promesa.costoResultado = ads ? (obj === 'local' ? ads.costoLlegadaBs : obj === 'web' || obj === 'conocer' ? (ads.promesa > 0 ? presupuesto / ads.promesa : 0) : (ads.calificados > 0 ? presupuesto / ads.calificados : 0)) : 0;
    promesa.costoInteresadoBueno = promesa.costoResultado || cpl / Math.max(0.0001, calif);
    promesa.leadsMesMeta = ads ? ads.promesa : leadsCont * calif;
  } else {
    promesa.tipo = 'ventas';
    promesa.ventasHoy = ventasPautaHoy;
    promesa.ventasPiso = opt.esc.piso.ventasPlan;
    promesa.ventasMeta = opt.esc.meta.ventasPlan;
    promesa.ventasTecho = opt.esc.techo.ventasPlan;
    promesa.cpaHoy = opt.cpaHoy;
    promesa.cpaPiso = opt.esc.piso.cpaPlan;
  }

  // ---------- Chequeos: ¿se puede cumplir la promesa? ----------
  const ch = [];
  const add = (id, nombre, estado, critico, detalle, arreglo) => ch.push({ id, nombre, estado, critico, detalle, arreglo });
  const E = escenarios, mon = R.moneda;
  if (alc.campanas && adsMin > 0 && presupuesto < adsMin) add('anunciosMin', 'Pone lo mínimo en anuncios', 'no', true, `Pondría ${fmtM(presupuesto, R.moneda)} al mes en anuncios. Tu mínimo es ${fmtM(adsMin, R.moneda)}.`, `Con menos de ${fmtM(adsMin, R.moneda)} al mes en anuncios no aceptas: no alcanza para probar y aprender.`);
  const r1p = E.piso.roi1;
  add('gana', 'Aunque salga lo mínimo, él gana', r1p >= 1.2 ? 'ok' : r1p >= 1 ? 'ojo' : 'no', true,
    `Si sale lo mínimo (${fmtN(E.piso.N, 1)} clientes nuevos), en un año esos clientes le dejan ${fmtM(E.piso.V1, mon)}. Eso es ${fmtN(r1p, 1)} veces lo que pone.`,
    r1p >= 1.2 ? '' : forzado ? `Lo que le puedes hacer ganar no alcanza para pagar tu precio mínimo (${fmtM(n(R.precioMinimo), mon)}). Cambia el producto a potenciar, que ponga más en anuncios, o espera a que crezca.` : 'Ofrécele menos servicios o elige un producto que deje más por cliente.');
  const dep = E.piso.dependencia;
  const depCrit = modo === 'optimizar';
  add('depende', 'Depende más de ti que de ellos', dep <= 0.4 ? 'ok' : dep <= 0.6 || !depCrit ? 'ojo' : 'no', depCrit,
    `El ${fmtP(dep)} del resultado mínimo depende de que ellos atiendan mejor. Lo demás sale de tus anuncios y tu contenido.`,
    dep <= 0.4 ? '' : depCrit ? 'Promete solo las ventas que salen de los anuncios, sin contar lo que mejora la atención.' : 'Por eso le prometes personas interesadas, no ventas. Si no atiende mejor, gana menos de lo calculado: díselo claro.');
  const factorFinal = cierre.factorPlan;
  add('cierre', 'Atienden bien a los que llegan', factorFinal >= 0.5 ? 'ok' : factorFinal >= 0.35 ? 'ojo' : 'no', true,
    `De cada 100 personas que sí le pueden comprar, compran unas ${fmtN(cierrePlan * 100, 1)}${guiaActiva ? ' con tu guía' : ''}. Un negocio ordenado logra ${fmtN(bench * 100, 1)}.`,
    factorFinal >= 0.5 ? '' : guiaActiva ? 'Acuerden por escrito: contestar rápido y volver a escribir a quien no compró.' : 'Si no se compromete a atender mejor, no prometas ventas: la gente que llegue se va a perder.');
  if (mt.tipo === 'recurrente') {
    add('salud', 'Sus clientes se quedan', mt.vida >= 12 ? 'ok' : mt.vida >= 6 ? 'ojo' : 'no', true, `Un cliente se queda pagando unos ${fmtN(mt.vida)} meses.`, mt.vida >= 12 ? '' : 'Si se van rápido, traer más clientes no sirve: primero hay que ver por qué se van.');
  } else if (mt.tipo === 'repetida') {
    add('salud', 'Sus clientes vuelven', mt.totalCompras >= 3 ? 'ok' : mt.totalCompras >= 1.8 ? 'ojo' : 'no', true, `Un cliente le compra unas ${fmtN(mt.totalCompras, 1)} veces.`, mt.totalCompras >= 3 ? '' : 'Si casi no vuelven, primero hay que mejorar el producto o la atención.');
  } else {
    add('salud', 'Sus clientes vuelven', foco.l.abrePuertas ? 'ok' : 'ojo', true, 'Cada cliente compra una sola vez: cada mes hay que buscar nuevos.' + (foco.l.abrePuertas ? ' Pero después le compran otras cosas, y eso ayuda.' : ''), foco.l.abrePuertas ? '' : 'Piensa en algo que le pueda cobrar cada mes.');
  }
  const cac = E.meta.N > 0 ? E.meta.invNeta / E.meta.N : Infinity;
  const ltvcac = cac > 0 && Number.isFinite(cac) ? gL / cac : 0;
  add('unidad', 'Cada cliente deja más de lo que cuesta traerlo', ltvcac >= 3 ? 'ok' : ltvcac >= 1.5 ? 'ojo' : 'no', true,
    `Traer a cada cliente nuevo cuesta unos ${fmtM(cac, mon)}. Cada uno le deja ${fmtM(gL, mon)} en total: ${fmtN(ltvcac, 1)} veces lo que cuesta.`,
    ltvcac >= 3 ? '' : 'Elige un producto que deje más por cliente, o crea algo que se cobre cada mes.');
  const mesPiso = E.piso.mesNormal;
  add('presupuesto', 'Se va a notar el cambio', mesPiso >= 1 ? 'ok' : mesPiso >= 0.5 ? 'ojo' : 'no', false,
    `En un mes normal llegan unos ${fmtN(mesPiso, 1)} clientes nuevos, contando lo mínimo.`, mesPiso >= 1 ? '' : 'Con tan poco no se ve el cambio: que ponga más en anuncios o elige un producto que valga más.');
  const rec = E.meta.recupero;
  add('recupero', 'Recupera su plata rápido', rec !== null && rec <= 12 ? 'ok' : rec !== null && rec <= 18 ? 'ojo' : 'no', false,
    rec === null ? `En ${E.meta.H} meses no recupera lo que puso.` : `Recupera todo lo que puso en el mes ${rec}.`,
    rec !== null && rec <= 12 ? '' : 'Haz el plan más largo o elige un producto que deje más.');
  const hondo = -E.meta.valle;
  const gananciaNeta = an.gananciaTotal - n(p.negocio.gastosFijos);
  const caja = n(p.negocio.caja);
  const nomV = 'Aguanta los primeros meses';
  if (hondo <= 0) add('valle', nomV, 'ok', false, 'Nunca queda con menos plata de la que tenía.', '');
  else if (caja > 0) add('valle', nomV, hondo <= 0.5 * caja ? 'ok' : hondo <= caja ? 'ojo' : 'no', false, `En el peor momento (mes ${E.meta.valleMes}) va ${fmtM(hondo, mon)} abajo. Tiene ${fmtM(caja, mon)} guardados.`, hondo <= 0.5 * caja ? '' : 'Empiecen por lo que trae plata rápido y suban los anuncios de a poco.');
  else if (vacio(p.negocio.gastosFijos)) add('valle', nomV, 'ojo', false, `En el peor momento (mes ${E.meta.valleMes}) va ${fmtM(hondo, mon)} abajo. Falta saber cuánto gasta o cuánto tiene guardado.`, 'Pregúntale cuánto puede poner los primeros meses sin que le duela.');
  else if (gananciaNeta > 0) { const ms = hondo / gananciaNeta; add('valle', nomV, ms <= 3 ? 'ok' : ms <= 6 ? 'ojo' : 'no', false, `En el peor momento (mes ${E.meta.valleMes}) va ${fmtM(hondo, mon)} abajo. Es lo que hoy gana en ${fmtN(ms, 1)} meses.`, ms <= 3 ? '' : 'Necesita plata guardada o ventas rápidas al principio.'); }
  else add('valle', nomV, 'no', false, `Hoy el negocio no gana plata y el plan baja hasta ${fmtM(hondo, mon)}.`, 'Pregúntale cuánto tiene guardado: si no tiene, los primeros meses lo pueden ahogar.');
  const pesoMes = an.factNegocio > 0 ? (precio + extraPauta) / an.factNegocio : NaN;
  if (Number.isFinite(pesoMes)) add('peso', 'No le cuesta demasiado', pesoMes <= 0.10 ? 'ok' : pesoMes <= 0.15 ? 'ojo' : 'no', false, `Tu precio más los anuncios extra son ${fmtM(precio + extraPauta, mon)} al mes: ${fmtN(pesoMes * 100, 0)} de cada 100 bolivianos que vende.`, pesoMes <= 0.10 ? '' : 'Empiecen con menos anuncios o menos servicios.');
  else add('peso', 'No le cuesta demasiado', 'na', false, 'Falta saber cuánto vende al mes.', '');
  add('margen', 'Le queda buena ganancia', mt.m >= 0.4 ? 'ok' : mt.m >= 0.25 ? 'ojo' : 'no', false, `De cada 100 que cobra por «${foco.nombre}», le quedan ${fmtN(mt.m * 100)}.`, mt.m >= 0.4 ? '' : 'Antes de traer más clientes, conviene revisar sus precios.');
  {
    const ci = E.meta.capInfo, nomC = 'Le caben los clientes nuevos';
    const uni = cap.modo === 'aLaVez' ? 'clientes a la vez' : 'ventas al mes';
    if (!cap.sabe) add('capacidad', nomC, 'ojo', false, 'Falta saber cuántos clientes más puede atender.', 'Pregúntaselo en el paso «¿Le alcanza?».');
    else if (cap.legado) add('capacidad', nomC, ci.recorto ? 'ojo' : 'ok', false, `Dijo que puede atender ${fmtN(cap.libre)} clientes nuevos en el plan. Lo esperado son ${fmtN(ci.totalSinLimite, 1)}.`, ci.recorto ? 'Bajé lo esperado a lo que le cabe.' : '');
    else {
      const parte = ci.totalSinLimite > 0 ? ci.perdidos / ci.totalSinLimite : 0;
      const est = ci.recorto ? (parte <= 0.2 ? 'ojo' : 'no') : ci.usaExtra ? 'ojo' : 'ok';
      const contr = cap.extraPersonas > 0 ? `${fmtN(cap.extraPersonas)} persona${cap.extraPersonas > 1 ? 's' : ''}` : 'alguien';
      add('capacidad', nomC, est, false,
        `Hoy atiende ${fmtN(cap.actuales)} ${uni} y puede hasta ${fmtN(cap.maxHoy)}: le quedan ${fmtN(cap.libre)} lugares. Con el plan necesitaría hasta ${fmtN(ci.necesita, 1)} lugares (mes ${ci.mesPico}).`,
        est === 'ok' ? '' : ci.recorto ? `No le alcanza: se perderían unos ${fmtN(ci.perdidos, 1)} clientes. Ya los quité de la cuenta. Que contrate antes o prometan menos.` : `Le alcanza solo si contrata a ${contr} antes del mes ${cap.mesContrata + 1}. Acuérdenlo antes de empezar.`);
    }
  }
  // Mensajes que tendrá que contestar
  const leadsNuevosMes = modo === 'crecer'
    ? Math.max(0, (ads ? ads.mensajes : 0) + leadsCont - (alc.campanas && reemplaza ? leadsViejaPauta : 0))
    : Math.max(0, opt.esc.meta.ventasPlan - ventasPautaHoy) / Math.max(0.0001, calif * cierrePlan) + leadsCont;
  const mensajesMes = Math.max(0, n(h.interesadosMes)) + leadsNuevosMes;
  const mensajesDiaNec = mensajesMes / dias;
  const capMsg = n(p.capacidad?.mensajesDia);
  if (capMsg > 0) add('mensajes', 'Puede contestar a todos', capMsg >= mensajesDiaNec ? 'ok' : capMsg >= 0.7 * mensajesDiaNec ? 'ojo' : 'no', false, `Le escribirían unas ${fmtN(mensajesDiaNec, 1)} personas por día y puede contestar bien a ${fmtN(capMsg)}.`, capMsg >= mensajesDiaNec ? '' : 'Si no contesta a todos, se pierden. Que sume a alguien para contestar o use respuesta automática.');
  else if (mensajesDiaNec >= 8) add('mensajes', 'Puede contestar a todos', 'ojo', false, `Le escribirían unas ${fmtN(mensajesDiaNec, 1)} personas por día. Falta saber cuántas puede contestar bien.`, 'Pregúntale cuántos mensajes puede contestar bien por día.');
  // Lo que quiere el dueño
  const M = p.meta || {};
  let metaDueno = null;
  if (!vacio(M.valor) && n(M.valor) > 0) {
    const tipoM = M.tipo || 'aumento';
    const plazo = clamp(Math.round(n(M.plazo) || D), 1, 36);
    // Por cada cliente nuevo al mes, cuántas ventas al mes suma al llegar al plazo
    const ppm = mt.tipo === 'recurrente' ? 1 : mt.tipo === 'repetida' ? mt.ppy / 12 : 0;
    const primera = mt.tipo === 'repetida' ? Math.max(1, ppm) : 1;
    const factorAcum = mt.tipo === 'unica' ? 1 : primera + (plazo - 1) * ppm;
    let clientesMes, aumento = null;
    if (tipoM === 'clientes') clientesMes = n(M.valor);
    else {
      aumento = tipoM === 'total' ? Math.max(0, n(M.valor) - an.factNegocio) : tipoM === 'ganancia' ? (mt.m > 0 ? n(M.valor) / mt.m : 0) : n(M.valor);
      clientesMes = mt.ticket > 0 ? aumento / (mt.ticket * factorAcum) : 0;
    }
    const conv = calif * cierrePlan;
    const resPorCliente = ads && ads.clientes > 0 ? ads.resultados / ads.clientes : (conv > 0 ? 1 / conv : 0);
    const interesadosMesNec = clientesMes * resPorCliente;
    const cacAds = ads && ads.clientes > 0 ? presupuesto / ads.clientes : cpl / Math.max(0.0001, conv);
    const anunciosMesNec = modo === 'optimizar' && opt ? clientesMes * opt.cpaPlanMeta * 1.25 : Math.max(0, clientesMes - fuentes.contenido) * cacAds;
    const planMes = escenarios.meta.mesNormal;
    const cz = escenarios.meta.cierres || [];
    const mEval = mt.tipo === 'unica' ? Math.min(plazo, D + L) : plazo;
    let planAumento = 0;
    for (let k = 1; k < cz.length && k <= mEval; k++) {
      const x = cz[k] || 0; if (!x) continue;
      if (mt.tipo === 'recurrente') { if (mEval - k < mt.vida) planAumento += x * mt.ticket; }
      else if (mt.tipo === 'repetida') { if (k === mEval) planAumento += x * mt.ticket * primera; else if (mEval - k < mt.anios * 12) planAumento += x * mt.ticket * ppm; }
      else if (k === mEval) planAumento += x * mt.ticket;
    }
    metaDueno = {
      tipo: tipoM, valor: n(M.valor), aumento, plazo, dias, factorAcum, clientesMes, clientesDia: clientesMes / dias, resultadoNombre: ads ? ads.resultadoNombre : 'personas que le escriben',
      interesadosMes: interesadosMesNec, interesadosDia: interesadosMesNec / dias, anunciosMes: anunciosMesNec, anunciosDia: anunciosMesNec / 30,
      ventasMes: aumento, ventasDia: aumento !== null ? aumento / dias : null,
      planMes, planDia: planMes / dias, planAumento, planAumentoDia: planAumento / dias, planGanancia: planAumento * mt.m, mEval,
      cobertura: tipoM === 'clientes' ? (clientesMes > 0 ? planMes / clientesMes : 99) : (aumento > 0 ? planAumento / aumento : 99),
      gananciaMes: aumento !== null ? aumento * mt.m : clientesMes * mt.ticket * factorAcum * mt.m,
    };
    const cob = metaDueno.cobertura;
    const cobTxt = cob >= 9.99 ? 'mucho más de lo que quiere' : `${fmtN(cob * 100)} de cada 100 de lo que quiere`;
    add('expectativa', 'Lo que quiere y lo que da el plan', cob >= 0.8 ? 'ok' : cob >= 0.4 ? 'ojo' : 'no', false,
      tipoM === 'clientes'
        ? `Quiere ${fmtN(clientesMes, 1)} clientes nuevos al mes (${fmtPorDia(clientesMes / dias)}). El plan da unos ${fmtN(planMes, 1)} en un mes normal: ${cobTxt}.`
        : `Quiere vender ${fmtM(aumento, R.moneda)} más al mes para el mes ${plazo} (${fmtM(aumento / dias, R.moneda)} por día). Con el plan llegaría a unos ${fmtM(planAumento, R.moneda)} más al mes: ${cobTxt}.`,
      cob >= 0.8 ? '' : `Antes de firmar, acuerden una meta que se pueda cumplir. Para llegar a lo que quiere haría falta poner ${modo === 'optimizar' ? `unos ${fmtM(anunciosMesNec, R.moneda)} más al mes en anuncios (hoy pone ${fmtM(pautaHoy, R.moneda)})` : `unos ${fmtM(anunciosMesNec, R.moneda)} al mes en anuncios (el plan pone ${fmtM(presupuesto, R.moneda)})`}, o darle más tiempo.`);
  }
  const presTot = n(M.presupuestoTotal);
  if (presTot > 0) {
    const costoMes = precio + presupuesto;
    add('bolsillo', 'Le alcanza el bolsillo', costoMes <= presTot ? 'ok' : costoMes <= 1.3 * presTot ? 'ojo' : 'no', false,
      `Tu precio más los anuncios son ${fmtM(costoMes, R.moneda)} al mes. Él pensaba poner ${fmtM(presTot, R.moneda)}.`,
      costoMes <= presTot ? '' : 'Muéstrale cuánto gana, o empiecen con menos anuncios o menos servicios.');
  }
  const mesPrimeros = inicio + L;
  const pac = n(M.paciencia);
  if (pac > 0) {
    const rec0 = escenarios.meta.recupero;
    const estP = pac < mesPrimeros ? 'no' : (rec0 !== null && pac >= rec0) ? 'ok' : 'ojo';
    add('paciencia', 'Le alcanza la paciencia', estP, false,
      `Quiere ver resultados en ${fmtN(pac)} meses. Los primeros clientes del plan llegan en el mes ${mesPrimeros}${rec0 ? ` y recupera su plata en el mes ${rec0}.` : rec0 === 0 ? '.' : ', pero no recupera su plata en 3 años.'}`,
      estP === 'ok' ? '' : estP === 'no' ? 'Dile desde el inicio cuándo llegan los primeros clientes, y empiecen por lo que da plata rápido (volver a escribir a los que no compraron).' : rec0 ? `Dile desde el primer día: verá clientes en el mes ${mesPrimeros}, pero recupera su plata recién en el mes ${rec0}.` : `Dile desde el primer día: verá clientes en el mes ${mesPrimeros}, pero con este plan no recupera su plata pronto.`);
  }
  const mercado = n(p.capacidad?.mercado);
  if (mercado > 0) { const q = E.meta.N / mercado; add('mercado', 'Hay suficientes clientes posibles', q <= 0.1 ? 'ok' : q <= 0.2 ? 'ojo' : 'no', false, `Lo esperado es ${fmtN(q * 100, 1)} de cada 100 clientes posibles (${fmtN(mercado)}).`, q <= 0.1 ? '' : 'Hay pocos clientes posibles: baja lo esperado o busquen en más zonas.'); }
  else add('mercado', 'Hay suficientes clientes posibles', 'na', false, 'No se sabe cuántos clientes posibles hay.', '');
  if (ads) {
    const prob = [];
    if (ads.saturado) prob.push('la zona es chica para esa plata');
    if (ads.aprendizaje) prob.push('pocos resultados por semana para que la campaña aprenda');
    if (ads.tc < 9) prob.push('el dólar está puesto muy barato');
    if (ads.objetivo === 'conocer') prob.push('el objetivo «que lo conozcan» casi no trae clientes al tiro');
    add('anuncios', 'Los anuncios están bien armados', prob.length ? 'ojo' : 'ok', false,
      `${ads.nombrePlataforma}, objetivo «${ads.objetivoNombre}». Con ${fmtM(presupuesto, R.moneda)} al mes (unos USD ${fmtN(ads.usd)}) salen unas ${fmtN(ads.vistas)} vistas y ${fmtN(ads.resultados)} ${ads.resultadoNombre}.`,
      prob.length ? `Revisa: ${prob.join('; ')}.` : '');
  }
  const faltanComp = [];
  if (alc.guia && !compromiso.aplicaGuia) faltanComp.push('seguir tu guía para vender');
  if (!compromiso.aprueba) faltanComp.push('aprobar el contenido en 2 días');
  if (alc.campanas && !compromiso.pagaPublicidad) faltanComp.push('pagar los anuncios');
  if (h.mide && h.mide !== 'si') faltanComp.push('anotar de dónde viene cada cliente (sin eso no se puede probar la promesa)');
  if (alc.campanas && compromiso.pagoTarjeta === 'no') faltanComp.push('tener cómo pagar los anuncios (tarjeta habilitada para pagos al exterior)');
  if (alc.campanas && compromiso.pagoTarjeta === 'nose') faltanComp.push('confirmar que tiene cómo pagar los anuncios');
  if (!compromiso.tiempo) add('compromiso', 'El dueño se compromete', 'no', true, 'El dueño no puede dar ni una hora por semana.', 'Sin el dueño, no hay promesa que se pueda cumplir.');
  else add('compromiso', 'El dueño se compromete', faltanComp.length ? 'ojo' : 'ok', false, faltanComp.length ? 'Falta que acepte: ' + faltanComp.join('; ') + '.' : 'Acepta dar tiempo, aprobar rápido, pagar los anuncios y seguir tu guía.', faltanComp.length ? `Que acepte ${faltanComp.join('; ')}. Si no, la garantía no vale.` : '');
  const nEst = estimados.length;
  add('datos', 'Los números son reales', nEst === 0 ? 'ok' : nEst <= 2 ? 'ojo' : 'no', false,
    nEst === 0 ? 'Todos los números los dio el dueño.' : `Hay ${nEst} número${nEst > 1 ? 's' : ''} adivinado${nEst > 1 ? 's' : ''}: ${estimados.join('; ')}.`,
    nEst === 0 ? '' : 'Confírmalos antes de firmar: la promesa se apoya en ellos.');
  if (forzado) add('precio', 'Tu precio sale de lo que le haces ganar', 'ojo', false, `Lo que le haces ganar daría un precio de ${fmtM(precioValor, mon)}. Es menos que tu mínimo (${fmtM(n(R.precioMinimo), mon)}).`, 'Cobras tu mínimo, y a él le queda menos ganancia.');
  if (n(R.horaObjetivo) > 0 && horas > 0 && precio / horas < n(R.horaObjetivo)) add('hora', 'Tu hora vale lo que quieres', 'ojo', false, `Tu precio entre ${fmtN(horas)} horas al mes da ${fmtM(precio / horas, mon)} por hora.`, 'Ofrece menos servicios o que ponga más en anuncios.');

  const { veredicto, puntaje } = veredictoDe(ch);
  const diag = diagnosticar(p, T, cierre);

  return {
    R, foco, tipo, T, sup, modo, avisoModo, alc, cont, guiaActiva, cierre, presupuesto, pautaHoy, extraPauta, reemplaza, focoEsPrincipal, D, Dauto, L, ciclo,
    cpl, leadsPagaMes, leadsCont, fuentes, opt, reactivados, precio, precioValor, forzado, valorMesPiso, mesNormalPiso, horas,
    escenarios, promesa, chequeos: ch, veredicto, puntaje, estimados, diag, g1, gL, cac, ltvcac, limitadoPorCapacidad, pesoMes, costosCliente,
    cap, dias, metaDueno, mensajesDiaNec, leadsNuevosMes, mesPrimeros, retrasoCobro, inicio, ads, topePorBolsillo, techoPeso, precioSinTope,
    equilibrio: (() => { const gv = mt.tipo === 'recurrente' ? mt.gMes : mt.ticket * mt.m, cm = precio + presupuesto + costosCliente.herramientas; return { ganVenta: gv, costoMes: cm, ventas: gv > 0 ? cm / gv : null }; })(),
  };
}

function flujoCliente(mt, cierresMes, hastaCierres, D, c) {
  const H = Math.max(36, D + 24);
  const gan = new Array(H + 1).fill(0), cos = new Array(H + 1).fill(0);
  const r = Math.max(0, c.retraso || 0);
  for (let k0 = 1; k0 <= hastaCierres; k0++) {
    const x = cierresMes[k0] || 0;
    const k = k0 + r;
    if (x <= 0) continue;
    if (mt.tipo === 'recurrente') { const fin = Math.min(H, k + Math.round(mt.vida)); for (let t = k + 1; t <= fin; t++) gan[t] += x * mt.gMes; }
    else if (mt.tipo === 'repetida') { const fin = Math.min(H, k + Math.max(1, Math.round(mt.anios * 12)) - 1); for (let t = k; t <= fin; t++) gan[t] += x * mt.gMes; }
    else gan[k] += x * mt.g1;
  }
  for (let m = 1; m <= D; m++) cos[m] = c.fijo + (m >= c.inicioPauta ? c.extraPauta : 0) + c.herramientas + (m === 1 ? c.inicial : 0) - c.ahorro;
  const acum = new Array(H + 1).fill(0);
  let s = 0, valle = 0, valleMes = 0;
  for (let m = 1; m <= H; m++) { s += gan[m] - cos[m]; acum[m] = s; if (s < valle) { valle = s; valleMes = m; } }
  let recupero = null;
  if (valle < 0) { for (let m = valleMes; m <= H; m++) if (acum[m] >= 0) { recupero = m; break; } } else recupero = 0;
  let invNeta = 0; for (let m = 1; m <= D; m++) invNeta += cos[m];
  return { H, gan, cos, acum, valle, valleMes, recupero, invNeta };
}

function normalizarReglasMotor(r) {
  r = r || {};
  return { ...REGLAS_BASE, ...r, mejora: { ...REGLAS_BASE.mejora, ...(r.mejora || {}) }, horas: { ...REGLAS_BASE.horas, ...(r.horas || {}) } };
}

function veredictoDe(ch) {
  const criticosRojos = ch.filter(c => c.critico && c.estado === 'no');
  const algoMal = ch.some(c => c.estado === 'no' || c.estado === 'ojo');
  const veredicto = criticosRojos.length ? 'no' : algoMal ? 'condiciones' : 'apto';
  let sum = 0, peso = 0;
  for (const c of ch) { if (c.estado === 'na') continue; const w = c.critico ? 2 : 1; sum += w * (c.estado === 'ok' ? 100 : c.estado === 'ojo' ? 55 : 0); peso += w; }
  return { veredicto, puntaje: peso ? Math.round(sum / peso) : 0 };
}

// ---------- Capacidad: cuántos clientes nuevos le caben ----------
// recurrente: se cuentan "clientes a la vez" (cada cliente ocupa un lugar mientras sigue pagando)
// repetida / única: se cuentan "ventas o atenciones por mes" (un cliente que vuelve sigue ocupando lugar los meses siguientes)
function capacidadDe(p, mt, D) {
  const C = p.capacidad || {};
  const modo = mt.tipo === 'recurrente' ? 'aLaVez' : 'mes';
  const extraPersonas = Math.max(0, n(C.contrataria)), porPersona = Math.max(0, n(C.porPersona));
  const extra = extraPersonas * porPersona;
  const mesContrata = vacio(C.mesesContratar) ? 2 : clamp(Math.round(n(C.mesesContratar)), 0, 24);
  const actuales = Math.max(0, n(C.actuales)), maxHoy = Math.max(0, n(C.maxHoy));
  let libre = null, legado = false;
  if (!vacio(C.maxHoy) && maxHoy > 0) libre = Math.max(0, maxHoy - actuales);
  else if (n(C.maxClientes) > 0) { libre = n(C.maxClientes); legado = true; }
  const rep = mt.tipo === 'recurrente' ? 1 : mt.tipo === 'repetida' ? mt.ppy / 12 : 0;
  const dur = mt.tipo === 'recurrente' ? Math.max(1, Math.round(mt.vida)) : mt.tipo === 'repetida' ? Math.max(1, Math.round(mt.anios * 12)) : 0;
  const primera = mt.tipo === 'repetida' ? Math.max(1, rep) : 1;
  return { modo, actuales, maxHoy, libre, extra, extraPersonas, porPersona, mesContrata, legado, rep, dur, primera, sabe: libre !== null };
}
function cargaYRecorte(porMes, cap, D, conExtra, limitar) {
  const out = [], carga = [];
  let recorto = false, dentro = 0, cola = 0, pico = 0, mesPico = 0;
  for (let m = 1; m < porMes.length; m++) {
    let base = 0;
    if (cap.rep > 0) for (let k = Math.max(1, m - cap.dur + 1); k < m; k++) base += (out[k] || 0) * cap.rep;
    let x = porMes[m] || 0;
    if (limitar) {
      const lim = cap.libre + (conExtra && m > cap.mesContrata ? cap.extra : 0);
      const lugar = Math.max(0, (lim - base) / cap.primera);
      if (x > lugar + 1e-9) { x = lugar; recorto = true; }
    }
    out[m] = x;
    carga[m] = base + x * cap.primera;
    if (carga[m] > pico + 1e-9) { pico = carga[m]; mesPico = m; }
    if (m <= D) dentro += x; else cola += x;
  }
  return { porMes: out, carga, dentro, cola, total: dentro + cola, recorto, pico, mesPico };
}

// ---------- Escenario de los datos (rangos) ----------
const DIR_PRUDENTE = {
  'negocio.facturacion': 'min', 'negocio.gastosFijos': 'max', 'negocio.caja': 'min', 'negocio.cobroDias': 'max',
  ticket: 'min', margen: 'min', vidaMeses: 'min', comprasAnio: 'min', aniosCliente: 'min', cicloDias: 'max', facturacion: 'min', ventaCruzadaPct: 'min', ventaCruzadaGanancia: 'min',
  'hoy.interesadosMes': 'min', 'hoy.clientesMes': 'min', 'hoy.diasPropuesta': 'max', 'hoy.viejos': 'min', 'hoy.pautaMes': 'max', 'hoy.ventasPautaMes': 'min',
  'capacidad.actuales': 'max', 'capacidad.maxHoy': 'min', 'capacidad.contrataria': 'min', 'capacidad.porPersona': 'min', 'capacidad.mesesContratar': 'max', 'capacidad.mensajesDia': 'min', 'capacidad.mercado': 'min',
  costoInteresado: 'max', calificaPct: 'min', cierrePct: 'min', organico: 'min', reactivacionPct: 'min',
  'meta.presupuestoTotal': 'min', 'meta.paciencia': 'min', 'meta.valor': 'max', 'meta.diasMes': 'min',
  'oferta.precio': 'min', 'oferta.usoGarantia': 'max', 'servicio.presupuesto': 'min',
  'anuncios.costoResultadoReal': 'max', 'anuncios.cpmReal': 'max', 'anuncios.tc': 'max',
  'lanzamiento.publicidad': 'min', 'lanzamiento.stock': 'min', 'lanzamiento.atiendeDia': 'min', 'lanzamiento.llegadaPct': 'min', 'lanzamiento.compraPct': 'min', 'lanzamiento.pautaPlan': 'min',
};
function dirDe(clave) { if (DIR_PRUDENTE[clave]) return DIR_PRUDENTE[clave]; const last = clave.split(/[.:]/).pop(); return DIR_PRUDENTE[last] || 'min'; }
function setEn(p, clave, v) {
  if (clave.startsWith('linea:')) { const [, id, campo] = clave.split(':'); const l = (p.lineas || []).find(x => x.id === id); if (l) l[campo] = v; return; }
  const ks = clave.split('.'); let a = p;
  for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null) a[ks[i]] = {}; a = a[ks[i]]; }
  a[ks[ks.length - 1]] = v;
}
function valorEscenario(r, clave, esc) {
  const lo = Math.min(r.min, r.max), hi = Math.max(r.min, r.max), d = dirDe(clave);
  if (esc === 'prudente') return d === 'min' ? lo : hi;
  if (esc === 'optimista') return d === 'min' ? hi : lo;
  return (lo + hi) / 2;
}
function aplicarEscenario(p, esc) {
  const rangos = p.rangos || {};
  const claves = Object.keys(rangos).filter(c => rangos[c] && Number.isFinite(rangos[c].min) && Number.isFinite(rangos[c].max));
  if (!claves.length) return p;
  const q = JSON.parse(JSON.stringify(p));
  for (const c of claves) setEn(q, c, valorEscenario(rangos[c], c, esc));
  return q;
}

// ---------- Oferta irresistible ----------
function evaluarOferta(p) {
  const O = p.oferta;
  if (!O || !O.activa) return null;
  const lineas = p.lineas || [];
  const l0 = lineas.find(x => x.id === O.lineaId) || lineas[0];
  if (!l0) return null;
  const l = lineaConPrudentes(l0), mt = metricasLinea(l);
  if (!(mt.ticket > 0)) return { incompleta: true, lineaId: l0.id, nombre: (l0.nombre || '').trim() || 'lo que vende' };
  const precioBase = mt.ticket, costoBase = precioBase * (1 - mt.m);
  const precio = n(O.precio) > 0 ? n(O.precio) : precioBase;
  const bonos = (O.bonos || []).filter(b => (b.nombre || '').trim() || n(b.costo) > 0 || n(b.valor) > 0);
  const costoBonos = bonos.reduce((s, b) => s + Math.max(0, n(b.costo)), 0);
  const valorBonos = bonos.reduce((s, b) => s + Math.max(0, n(b.valor)), 0);
  const garantia = O.garantia || 'ninguna';
  const uso = clamp(n(O.usoGarantia), 0, 100) / 100;
  const costoGar = garantia === 'devolucion' || garantia === 'resultado' ? precio : garantia === 'repetir' ? costoBase : 0;
  const reserva = garantia !== 'ninguna' ? uso * costoGar : 0;
  const compras1 = mt.tipo === 'recurrente' ? Math.min(12, mt.vida) : mt.tipo === 'repetida' ? Math.min(mt.totalCompras, mt.ppy) : 1;
  const comprasVida = mt.tipo === 'recurrente' ? mt.vida : mt.tipo === 'repetida' ? mt.totalCompras : 1;
  const ingreso1 = precio * compras1;
  const ganancia1 = ingreso1 - costoBase * compras1 - costoBonos - reserva;
  const gananciaVida = precio * comprasVida - costoBase * comprasVida - costoBonos - reserva;
  const margenEfectivo = ingreso1 > 0 ? clamp(ganancia1 / ingreso1, 0, 1) : 0;
  const gananciaVenta = precio - costoBase - (costoBonos + reserva) / Math.max(1, compras1);
  const gananciaVentaBase = precioBase - costoBase;
  const valorProducto = n(O.valorProducto) > 0 ? n(O.valorProducto) : precio;
  const valorTotal = valorProducto + valorBonos;
  const ratio = precio > 0 ? valorTotal / precio : 0;
  const cacMax = Math.max(0, gananciaVida / 3);
  const prueba = p.hoy?.contenidoPrueba;
  const partes = {
    deseo: (O.deseo || '').trim() ? 20 : 0,
    prob: (garantia !== 'ninguna' ? 15 : 0) + (prueba === 'bastante' ? 10 : prueba === 'poco' ? 5 : 0),
    tiempo: (O.tiempo || '').trim() ? 20 : 0,
    esfuerzo: Math.min(15, bonos.length * 5) + (O.pago && O.pago !== 'contado' ? 5 : 0),
    valor: ratio >= 5 ? 15 : ratio >= 3 ? 11 : ratio >= 2 ? 6 : 0,
  };
  const puntaje = clamp(Object.values(partes).reduce((a, b) => a + b, 0), 0, 100);
  const menosVentas = gananciaVenta > 0 && gananciaVentaBase > 0 && gananciaVenta > gananciaVentaBase ? 1 - gananciaVentaBase / gananciaVenta : 0;
  return {
    lineaId: l0.id, nombre: (l0.nombre || '').trim() || 'lo que vende', deseo: (O.deseo || '').trim(), tiempo: (O.tiempo || '').trim(), tipo: mt.tipo, precioBase, precio, costoBase, bonos, costoBonos, valorBonos,
    garantia, uso, costoGar, reserva, compras1, ingreso1, ganancia1, gananciaVida, margenEfectivo, margenBase: mt.m, gananciaVenta, gananciaVentaBase,
    valorProducto, valorTotal, ratio, cacMax, partes, puntaje, subePct: precioBase > 0 ? precio / precioBase - 1 : 0, menosVentas, cambioVentas: gananciaVenta > 0 ? gananciaVentaBase / gananciaVenta - 1 : null, urgencia: O.urgencia || 'ninguna', pago: O.pago || 'contado',
  };
}
function aplicarOferta(p) {
  const O = p.oferta;
  if (!O || !O.activa || !O.usarEnCuenta || !O.lineaId) return p;
  const res = evaluarOferta(p);
  if (!res || res.incompleta) return p;
  const q = JSON.parse(JSON.stringify(p));
  const l = q.lineas.find(x => x.id === res.lineaId);
  if (!l) return p;
  l.ticket = res.precio; l.margen = Math.round(res.margenEfectivo * 1000) / 10;
  return q;
}

// ---------- Cliente ideal: comparar tipos de clientes ----------
function analizarSegmentos(segs) {
  const S = (segs || []).filter(s => (s.nombre || '').trim() && n(s.compraAnio) > 0);
  if (!S.length) return null;
  const F_LIO = { poco: 1, normal: 0.85, mucho: 0.6 };
  const lista = S.map(s => {
    const m = clamp(vacio(s.margen) ? 30 : n(s.margen), 0, 100) / 100;
    const gan = n(s.compraAnio) * m;
    const f = (s.paga === 'tarde' ? 0.8 : s.paga === 'muytarde' ? 0.6 : 1) * (F_LIO[s.lio] ?? 0.85);
    return { ...s, gananciaCliente: gan, bruto: gan * f, total: gan * Math.max(0, n(s.cuantos)) };
  });
  const max = Math.max(...lista.map(x => x.bruto)) || 1;
  lista.forEach(x => { x.puntaje = Math.round(x.bruto / max * 100); });
  lista.sort((a, b) => b.puntaje - a.puntaje);
  const totalGan = lista.reduce((s, x) => s + x.total, 0), totalCli = lista.reduce((s, x) => s + Math.max(0, n(x.cuantos)), 0);
  const mejor = lista[0], promedio = totalCli > 0 ? totalGan / totalCli : 0;
  return { lista, mejor, vecesPromedio: promedio > 0 ? mejor.gananciaCliente / promedio : null, parteGanancia: totalGan > 0 ? mejor.total / totalGan : null, parteClientes: totalCli > 0 ? n(mejor.cuantos) / totalCli : null };
}

// ---------- Qué número mueve más el resultado ----------
// Cada número sale 20% peor (o cuesta 25% más) y miro cuánto menos gana él en el primer año y si la promesa se sigue cumpliendo.
function sensibilidad(p, reglas, focoId, base) {
  const linea = (p.lineas || []).find(x => x.id === focoId);
  if (!linea || !base) return [];
  const tipo = TIPOS_VENTA[linea.tipoVenta] ? linea.tipoVenta : 'b2b';
  const sup = { ...supuestosBase()[tipo], ...((p.supuestos || {})[tipo] || {}) };
  const met = ev => ev.escenarios.meta.V1 - ev.escenarios.meta.invNeta;
  const metL = ev => ev.escenarios.meta.VL - ev.escenarios.meta.invNeta;
  const b0 = met(base), bL = metL(base);
  const L = q => q.lineas.find(x => x.id === focoId);
  const S = q => { q.supuestos = q.supuestos || {}; q.supuestos[tipo] = { ...sup, ...(q.supuestos[tipo] || {}) }; return q.supuestos[tipo]; };
  const vars = [['Lo que gana en cada venta', 'precio y ganancia', q => { L(q).ticket = n(L(q).ticket) * 0.8; }]];
  vars.push(['Cuántos compran de los que escriben', 'cómo atienden', q => { S(q).cierrePct = n(sup.cierrePct) * 0.8; }]);
  if (base.modo === 'optimizar') vars.push(['Las ventas que hoy le traen sus anuncios', 'punto de partida', q => { q.hoy.ventasPautaMes = n(q.hoy.ventasPautaMes) * 0.8; }]);
  else if (base.alc.campanas) vars.push(['Cuánto cuestan los anuncios', 'anuncios', q => { q.anuncios = { ...(q.anuncios || {}), _factorCosto: 1.25 }; }]);
  if (linea.tipo === 'recurrente') vars.push(['Cuántos meses se queda un cliente', 'clientes fieles', q => { const l = L(q); l.vidaMeses = (vacio(l.vidaMeses) ? 12 : n(l.vidaMeses)) * 0.8; }]);
  if (linea.tipo === 'repetida') vars.push(['Cuántas veces vuelve a comprar', 'clientes fieles', q => { const l = L(q); l.comprasAnio = (vacio(l.comprasAnio) ? 2 : n(l.comprasAnio)) * 0.8; }]);
  if (base.leadsCont > 0) vars.push(['Lo que trae el contenido', 'contenido', q => { S(q).organico = n(sup.organico) * 0.8; }]);
  if (base.guiaActiva && n(p.hoy?.interesadosMes) > 0 && base.modo === 'crecer') vars.push(['Cuántos le escriben hoy', 'punto de partida', q => { q.hoy.interesadosMes = n(q.hoy.interesadosMes) * 0.8; }]);
  const out = [];
  for (const [nombre, grupo, fn] of vars) {
    try {
      const q = JSON.parse(JSON.stringify(p));
      fn(q);
      const an = analizarLineas(q.lineas || [], n(q.negocio?.facturacion));
      const ev = evaluar(q, reglas, an, focoId);
      out.push({ nombre, grupo, delta: met(ev) - b0, deltaLargo: metL(ev) - bL, veredicto: ev.veredicto });
    } catch (e) { }
  }
  return out.sort((a, b) => a.delta - b.delta || a.deltaLargo - b.deltaLargo);
}

// ---------- Lo mínimo para aceptar al cliente ----------
// Busca el monto de anuncios más bajo con el que él gana al menos 1,2 veces lo que pone, aunque salga lo mínimo.
function minimoAceptable(p, reglas, focoId, base) {
  if (!base || base.modo !== 'crecer' || !base.alc.campanas) return null;
  const R = normalizarReglasMotor(reglas), adsMin = Math.max(0, n(R.anunciosMinimo)), tope = 1.2;
  const pasos = [];
  for (let x = Math.max(250, adsMin); x <= 30000; x += x < 3000 ? 250 : x < 10000 ? 500 : 1000) pasos.push(x);
  const sirve = ev => ev.escenarios.piso.roi1 >= tope && !ev.chequeos.some(c => c.id === 'unidad' && c.estado === 'no');
  let hallado = null, mejor = null;
  for (const pres of pasos) {
    const q = JSON.parse(JSON.stringify(p));
    q.servicio = { ...(q.servicio || {}), presupuesto: pres };
    let ev; try { ev = evaluar(q, reglas, analizarLineas(q.lineas || [], n(q.negocio?.facturacion)), focoId); } catch (e) { continue; }
    if (!mejor || ev.escenarios.piso.roi1 > mejor.ev.escenarios.piso.roi1) mejor = { pres, ev };
    if (sirve(ev)) { hallado = { pres, ev }; break; }
  }
  const costoCliente = base.ads && base.ads.clientes > 0 ? base.presupuesto / base.ads.clientes : base.cpl / Math.max(0.0001, base.cierre.calif * base.cierre.plan);
  const out = { adsMin, tope, g1: base.g1, costoCliente, presHoy: base.presupuesto };
  if (!hallado) return { ...out, imposible: true, mejorRoi: mejor ? mejor.ev.escenarios.piso.roi1 : 0, mejorPres: mejor ? mejor.pres : null };
  const ev = hallado.ev, E = ev.escenarios;
  return {
    ...out, imposible: false, pres: hallado.pres, precio: ev.precio, extra: ev.extraPauta,
    ventasMin: (ev.precio + ev.extraPauta) / 0.15, ventasComodo: (ev.precio + ev.extraPauta) / 0.10,
    clientesMes: ev.mesNormalPiso, valorMes: ev.valorMesPiso, gananciaAnio: E.piso.V1, inversion: E.piso.invNeta, roi: E.piso.roi1,
    cajaMin: Math.max(0, -E.meta.valle), D: ev.D,
  };
}

// ---------- Lanzamiento: un cobro por promo, con fecha y cupón ----------
// El modelo de Grow Business (decidido por Mauricio el 24/10 y el 28/10/2026):
// - Un precio por lanzamiento (Bs 2.500), en dos mitades: la mitad para empezar y la otra cuando lleguen los clientes de la garantía.
// - Garantía: N = lo que puso (servicio + publicidad) ÷ lo que le deja una venta. Se cuentan los cupones validados en la tienda,
//   compre o no. Si en su fecha no llegan: 7 días más con el video ganador, sin costo. Si igual no llegan, la segunda mitad no se paga.
//   Tope de N: 25 (si sale más, se elige con el dueño otro producto antes de ofrecer la garantía).
// - Vale si el dueño cumple sus 5 cosas: accesos, aprobar cada video en 24 h, su publicidad desde Bs 500, su stock separado y validar cada cupón.
// - Calendario de 14 días, con la mitad de la publicidad en los 3 últimos. El tope de cupones es el stock separado.
// - Llegan 1 de cada 2 que reservan: es su supuesto hasta tener 10 reservas contadas de lanzamientos terminados.
// - Después, el plan de cada mes: Bs 2.500 cada 4 semanas, o Bs 2.000 con 3 meses de compromiso.
const FACT_ESC = { piso: 2 / 3, meta: 1, techo: 4 / 3 };
const UNIDAD_GARANTIA = {
  local: ['llegadas', 'personas que llegan a la tienda con su cupón'],
  mensajes: ['interesados', 'personas interesadas que sí pueden comprar'],
  formulario: ['interesados', 'personas interesadas que sí pueden comprar'],
  conocer: ['interesados', 'personas interesadas que sí pueden comprar'],
  web: ['compras', 'compras en su página web'],
};
function fmtUno(x) { return fmtN(x, x < 10 && Math.abs(x - Math.round(x)) > 0.05 ? 1 : 0); }
// Fechas (sin hora; el canje es un día de la tienda)
const DIA_MS = 86400000;
function fechaDe(s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!m) return null; const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d.getTime()) ? null : d; }
function masDias(d, k) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + k); }
function isoDe(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function diasEntre(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DIA_MS); }
function fmtFecha(d, conDia = true) { if (!d) return '—'; return new Intl.DateTimeFormat('es-BO', conDia ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long' }).format(d); }
// Fechas fuertes de Bolivia para una promo. «antes» = cuántos días antes es el canje (en fechas de regalo, la gente compra antes)
const FECHAS_FUERTES = [
  { md: '02-01', nombre: 'Vuelta a clases', antes: 5 },
  { md: '02-14', nombre: 'Día del Amor y la Amistad', antes: 2 },
  { md: '03-19', nombre: 'Día del Padre', antes: 2 },
  { md: '04-12', nombre: 'Día del Niño', antes: 2 },
  { md: '05-27', nombre: 'Día de la Madre', antes: 2 },
  { md: '09-21', nombre: 'Día del Estudiante y la Primavera', antes: 1 },
  { md: '10-11', nombre: 'Día de la Mujer Boliviana', antes: 1 },
  { bf: true, nombre: 'Black Friday', antes: 0 },
  { md: '12-25', nombre: 'Navidad, con el aguinaldo', antes: 5 },
];
function proximasFechas(hoy, cuantas = 6) {
  const out = [];
  for (const y of [hoy.getFullYear(), hoy.getFullYear() + 1]) {
    for (const f of FECHAS_FUERTES) {
      let dia;
      if (f.bf) { const d1 = new Date(y, 10, 1); dia = new Date(y, 10, 1 + ((5 - d1.getDay() + 7) % 7) + 21); }
      else { const [mm, dd] = f.md.split('-').map(Number); dia = new Date(y, mm - 1, dd); }
      const canje = masDias(dia, -f.antes);
      if (diasEntre(hoy, canje) >= 10) out.push({ nombre: f.nombre, dia, canje, iso: isoDe(canje) });
    }
    // Fin de mes: la gente cobra
    for (let m = 0; m < 12; m++) { const d = new Date(y, m + 1, 0); if (diasEntre(hoy, d) >= 17 && diasEntre(hoy, d) <= 75) out.push({ nombre: 'Fin de mes, cuando la gente cobra', dia: d, canje: d, iso: isoDe(d) }); }
  }
  out.sort((a, b) => a.canje - b.canje);
  const vistos = new Set(), fin = [];
  for (const x of out) { if (vistos.has(x.iso) || (x.nombre.startsWith('Fin de mes') && fin.some(f => f.nombre.startsWith('Fin de mes')))) continue; vistos.add(x.iso); fin.push(x); if (fin.length >= cuantas) break; }
  return fin;
}
// Las etapas del lanzamiento. d = días respecto del canje (0 = primer día de canje)
function calendarioLanzamiento(fecha, diasCanje, diasExtra) {
  const etapas = [
    { d: -20, hasta: -15, t: 'Cerrar y arrancar', x: 'Cobras la primera mitad. Sesión de arranque: sus accesos, la promo armada, el stock separado y la grabación.' },
    { d: -14, hasta: -10, t: 'Susurro', x: 'Sale el primer video y se abren las reservas del cupón. Un poco de publicidad con «Promocionar» sobre lo que más gusta.' },
    { d: -9, hasta: -4, t: 'Provocación', x: 'La promo con su fecha y su porqué. Se ve qué video va ganando y se le cambian los ganchos.' },
    { d: -3, hasta: -1, t: 'Grito', x: 'La mitad de la publicidad, sobre el video ganador. Recordatorio a mano a cada reserva el día antes.' },
    { d: 0, hasta: diasCanje - 1, t: 'Canje en la tienda', x: 'Llegan con su cupón, con día y hora. Se valida y se cuenta cada cupón. Recordatorio a mano unas horas antes.' },
    { d: diasCanje, hasta: diasCanje, t: 'Agotado y resultados', x: 'Se anuncia que se agotó. Si ya llegaron los de la garantía: segunda mitad, testimonio y el plan de cada mes.' },
  ];
  if (diasExtra > 0) etapas.push({ d: diasCanje + 1, hasta: diasCanje + diasExtra, t: `Si faltan: ${diasExtra} días más`, x: `Si no llegaron los de la garantía, ${diasExtra} días más con el video ganador, sin costo. Si igual no llegan, la segunda mitad no se paga.` });
  return etapas.map(e => ({ ...e, desde: fecha ? masDias(fecha, e.d) : null, al: fecha ? masDias(fecha, e.hasta) : null }));
}
// Lo que le deja una venta de la promo: si armaste la oferta de ese producto (paso 6), con su precio y su regalo
function ventaLanzamiento(p, foco) {
  const mt = foco.mt;
  let O = null;
  try { const o = p.oferta && p.oferta.activa ? evaluarOferta(p) : null; if (o && !o.incompleta && o.lineaId === foco.id) O = o; } catch (e) { }
  const precio = O ? O.precio : mt.ticket;
  const costo = O ? O.costoBase : mt.ticket * (1 - mt.m);
  const regalo = O ? O.costoBonos : 0;
  const gan = precio - costo - regalo;
  // Lo que deja después, cuando vuelve a comprar a precio normal (en su primer año y en total)
  const normal = mt.ticket * mt.m;
  const despues1 = mt.tipo === 'recurrente' ? Math.max(0, Math.min(12, mt.vida) - 1) * mt.gMes : mt.tipo === 'repetida' ? Math.max(0, Math.min(mt.totalCompras, mt.ppy) - 1) * normal : 0;
  const despuesL = mt.tipo === 'recurrente' ? Math.max(0, mt.vida - 1) * mt.gMes : mt.tipo === 'repetida' ? Math.max(0, mt.totalCompras - 1) * normal : 0;
  return { precio, costo, regalo, gan, g1: gan + despues1, gL: gan + despuesL, O };
}
function evaluarLanzamiento(p, reglas, an, focoId, op = {}) {
  const R = normalizarReglasMotor(reglas), mon = R.moneda;
  const foco = an.lista.find(x => x.id === focoId) || an.lista.find(x => x.completa) || an.lista[0];
  const tipo = TIPOS_VENTA[foco.l.tipoVenta] ? foco.l.tipoVenta : 'b2b';
  const T = TIPOS_VENTA[tipo];
  const sup = { ...supuestosBase()[tipo], ...((p.supuestos || {})[tipo] || {}) };
  const h = p.hoy, mt = foco.mt, L = p.lanzamiento || {}, C = p.compromiso || {}, M = p.meta || {};
  const estimados = estimadosDe(p, foco, T);
  const { calif, bench, factorHoy, medido } = cierreHoyDe(p, an, foco, T, sup, estimados);
  const guiaActiva = !!C.aplicaGuia;
  let factorPlan = factorHoy;
  if (guiaActiva && factorPlan < 1) factorPlan = factorPlan + 0.5 * (1 - factorPlan);
  factorPlan = Math.min(factorPlan, Math.max(1, factorHoy));
  const cierre = { hoy: bench * factorHoy, plan: bench * factorPlan, bench, factorHoy, factorPlan, medido, calif, guiaActiva };

  // Tu precio y lo que deja cada venta
  const precio = Math.max(0, n(R.precioLanzamiento));
  const mitad1 = Math.round(precio * clamp(n(R.primeraMitadPct), 0, 100) / 100), mitad2 = precio - mitad1;
  const adsMin = Math.max(0, n(R.anunciosMinimoLanz));
  const tope = Math.max(1, n(R.topeGarantia) || 25), diasExtra = Math.max(0, Math.round(n(R.diasExtraGarantia)));
  const venta = ventaLanzamiento(p, foco), ganVenta = venta.gan;

  // Lo que sabe de su tienda (si no lo sabe: tu supuesto y los promedios)
  const llegadaPct = clamp(n(L.llegadaPct) > 0 ? n(L.llegadaPct) : n(R.llegadaLanzPct) || 50, 1, 100) / 100;
  const compraPct = n(L.compraPct) > 0 ? clamp(n(L.compraPct), 1, 100) / 100 : 0;
  const stock = n(L.stock) > 0 ? n(L.stock) : null;
  const topeCup = n(L.topeCupones) > 0 ? n(L.topeCupones) : stock; // tu regla: el tope de cupones es el stock separado
  const diasCanje = clamp(Math.round(n(L.diasCanje) || 2), 1, 7);
  const atiendeDia = n(L.atiendeDia) > 0 ? n(L.atiendeDia) : null;
  const capCanje = atiendeDia !== null ? atiendeDia * diasCanje : null;

  // Anuncios del lanzamiento: el mismo embudo, con el cupón que tiene día y hora
  const A = p.anuncios || {};
  const base = { tipo, ticket: venta.precio, calif, cierrePlan: cierre.plan, factorAtencion: clamp(factorPlan, 0.4, 1), cupon: A.cupon !== false, ofertaBuena: !!(venta.O && venta.O.puntaje >= 75), factorCosto: n(A._factorCosto) || 1, lanz: true, llegadaPct, compraPct };
  const adsCon = pres => modeloAds(p, { ...base, presupuesto: Math.max(0, pres) });
  const Nde = pres => ganVenta > 0 ? Math.max(1, Math.ceil((precio + pres) / ganVenta - 1e-9)) : Infinity;
  // Un escenario: las reservas, hasta el tope de cupones; los que llegan, hasta lo que puede atender en los días del canje;
  // y nunca se vende más de lo que separó
  function escenarioDe(a, k) {
    const f = FACT_ESC[k];
    const x = { reservas: a.resultados * f, llegadas: a.llegadas * f, interesados: a.calificados * f, compras: a.clientes * f, agotado: false, sinAtender: 0, sinStock: false };
    if (a.objetivo === 'local') {
      if (topeCup !== null && x.reservas > topeCup) { const g = topeCup / x.reservas; x.reservas = topeCup; x.llegadas *= g; x.compras *= g; x.agotado = true; }
      if (capCanje !== null && x.llegadas > capCanje) { const g = capCanje / x.llegadas; x.sinAtender = x.llegadas - capCanje; x.llegadas = capCanje; x.compras *= g; }
    }
    if (stock !== null && x.compras > stock) { x.compras = stock; x.sinStock = true; }
    x.unidades = a.objetivo === 'local' ? x.llegadas : a.objetivo === 'web' ? x.compras : x.interesados;
    return x;
  }
  // Publicidad: la que dijo, o lo menos con lo que llegan los de la garantía aunque salga lo mínimo
  const pubDada = !vacio(L.publicidad) ? Math.max(0, n(L.publicidad)) : null;
  let pubSegura = null;
  if (ganVenta > 0) for (let x = Math.max(100, adsMin); x <= 10000; x += x < 1000 ? 50 : x < 3000 ? 100 : 250) { if (escenarioDe(adsCon(x), 'piso').unidades >= Nde(x)) { pubSegura = x; break; } }
  const publicidad = pubDada !== null ? pubDada : Math.max(adsMin, pubSegura ?? adsMin);
  const ads = adsCon(publicidad);
  const N = Nde(publicidad);
  const unidadGar = UNIDAD_GARANTIA[ads.objetivo] || UNIDAD_GARANTIA.local;

  // Tres escenarios del lanzamiento
  const escenarios = {};
  for (const k of ['piso', 'meta', 'techo']) {
    const x = escenarioDe(ads, k);
    const llega = x.unidades >= N - 1e-9;
    const cobro = llega ? precio : mitad1; // si cumple sus 5 cosas
    const inv = cobro + publicidad, ganLanz = x.compras * ganVenta;
    escenarios[k] = { ...x, llega, cobro, inv, faltan: Math.max(0, N - x.unidades), ventasBs: x.compras * venta.precio, ganLanz, gan1: x.compras * venta.g1, ganL: x.compras * venta.gL, neto: ganLanz - inv, roiLanz: inv > 0 ? ganLanz / inv : Infinity, roi1: inv > 0 ? x.compras * venta.g1 / inv : Infinity };
  }
  const E = escenarios;

  // Después: el plan de cada mes (un lanzamiento chico al mes, con su propia promo)
  const pubPlan = n(L.pautaPlan) > 0 ? n(L.pautaPlan) : publicidad;
  const aPlan = pubPlan > 0 ? adsCon(pubPlan) : null;
  const plan = { ofrecer: L.ofrecerPlan !== false, precio: n(R.planMes), precioComp: n(R.planMesCompromiso), meses: Math.max(1, Math.round(n(R.mesesCompromiso) || 3)), pub: pubPlan, esc: {} };
  for (const k of ['piso', 'meta', 'techo']) {
    const xp = aPlan ? escenarioDe(aPlan, k) : { compras: 0, llegadas: 0 }, compras = xp.compras, lleg = xp.llegadas;
    const gan = compras * ganVenta, inv = plan.precio + pubPlan, invC = plan.precioComp + pubPlan;
    plan.esc[k] = { compras, llegadas: lleg, gan, inv, invC, ventasBs: compras * venta.precio, roi: inv > 0 ? gan / inv : Infinity, roiC: invC > 0 ? gan / invC : Infinity };
  }

  // La fecha
  const hoyD = op.hoy instanceof Date ? op.hoy : new Date();
  const fecha = fechaDe(L.fecha);
  const diasHasta = fecha ? diasEntre(hoyD, fecha) : null;
  const calendario = calendarioLanzamiento(fecha, diasCanje, diasExtra);
  const cierraHasta = fecha ? masDias(fecha, -17) : null;
  const dias = clamp(n(M.diasMes) || 26, 1, 31);

  // Lo que quiere el dueño, comparado con el lanzamiento y con el plan de cada mes
  let metaDueno = null;
  if (!vacio(M.valor) && n(M.valor) > 0) {
    const tipoM = M.tipo || 'aumento', em = E.meta, pm = plan.esc.meta;
    let quiere, daLanz, daPlan;
    if (tipoM === 'clientes') { quiere = n(M.valor); daLanz = em.compras; daPlan = pm.compras; }
    else if (tipoM === 'ganancia') { quiere = n(M.valor); daLanz = em.ganLanz - em.inv; daPlan = pm.gan - pm.inv; }
    else { quiere = tipoM === 'total' ? Math.max(0, n(M.valor) - an.factNegocio) : n(M.valor); daLanz = em.ventasBs; daPlan = pm.ventasBs; }
    metaDueno = { tipo: tipoM, valor: n(M.valor), quiere, daLanz, daPlan, cobLanz: quiere > 0 ? daLanz / quiere : 99, cobPlan: quiere > 0 ? daPlan / quiere : 99, plazo: Math.round(n(M.plazo)) || null, dias };
  }

  // ---------- Chequeos: ¿se puede cumplir la promesa? ----------
  const ch = [];
  const add = (id, nombre, estado, critico, detalle, arreglo) => ch.push({ id, nombre, estado, critico, detalle, arreglo });
  if (publicidad < adsMin) add('anunciosMin', 'Pone lo mínimo en publicidad', 'no', true, `Pondría ${fmtM(publicidad, mon)} en publicidad. Tu mínimo por lanzamiento es ${fmtM(adsMin, mon)}.`, `Con menos de ${fmtM(adsMin, mon)} no aceptas: es una de sus 5 cosas de la garantía.`);
  if (!(ganVenta > 0)) add('ganVenta', 'Cada venta le deja ganancia', 'no', true, venta.O ? `Con el regalo, cada venta de la promo le deja ${fmtM(ganVenta, mon)}.` : 'Falta saber cuánto le queda de cada venta.', 'Sin ganancia por venta no hay número de garantía: revisa el precio, lo que le queda o el regalo.');
  else {
    const minGan = Math.ceil((precio + publicidad) / tope);
    add('tope', 'El número de la garantía se puede prometer', N <= tope ? 'ok' : 'no', true,
      `${fmtM(precio + publicidad, mon)} (servicio + publicidad) ÷ ${fmtM(ganVenta, mon)} que le deja cada venta = ${fmtN(N)} ${unidadGar[1]}. Tu tope es ${fmtN(tope)}.`,
      N <= tope ? '' : `Antes de ofrecer la garantía, elige con él otro producto: cada venta tiene que dejarle al menos ${fmtM(minGan, mon)}.`);
    const est = E.piso.llega ? 'ok' : E.meta.llega ? 'ojo' : 'no';
    const subir = pubSegura !== null && pubSegura > publicidad ? `Con ${fmtM(pubSegura, mon)} de publicidad llegan aunque salga lo mínimo.` : '';
    add('llega', 'Llegan los clientes de la garantía', est, true,
      `Necesita ${fmtN(N)} ${unidadGar[1]}. Aunque salga lo mínimo llegan ${fmtUno(E.piso.unidades)}; lo esperado son ${fmtUno(E.meta.unidades)}.`,
      est === 'ok' ? '' : est === 'ojo' ? `Lo esperado alcanza, pero lo mínimo no: te cubren los ${diasExtra} días más con el video ganador. ${subir}`.trim() : (pubSegura !== null ? `Que ponga ${fmtM(pubSegura, mon)} en publicidad, o elige un producto que deje más por venta.` : 'Ni subiendo la publicidad llega: elige un producto que deje más por venta o arma un regalo más fuerte.'));
  }
  {
    const e = E.piso, est = e.roiLanz >= 1 ? 'ok' : e.roi1 >= 1.2 ? 'ojo' : 'no';
    add('recupera', 'Aunque salga lo mínimo, recupera lo que pone', est, true,
      `Si sale lo mínimo compran ${fmtUno(e.compras)} y le dejan ${fmtM(e.ganLanz, mon)} en el lanzamiento: ${fmtN(e.roiLanz, 1)} veces lo que pone (${fmtM(e.inv, mon)}).${venta.g1 > ganVenta + 0.5 ? ` Con los que vuelven a comprar en el año: ${fmtN(e.roi1, 1)} veces.` : ''}`,
      est === 'ok' ? '' : est === 'ojo' ? 'En el lanzamiento no recupera todo: lo recupera con los que vuelven a comprar. Díselo claro desde el inicio.' : 'Así no le conviene: elige un producto que deje más por venta, mejora el regalo o espera a que su tienda venda más.');
  }
  if (ads.objetivo === 'local' && ganVenta > 0) {
    const c = E.meta.compras, est = c >= N ? 'ok' : c >= 0.7 * N ? 'ojo' : 'no';
    add('adentro', 'Los que llegan, compran', est, false,
      `La garantía cuenta llegadas, compren o no. En lo esperado compran ${fmtUno(c)} de los ${fmtUno(E.meta.llegadas)} que llegan, y para recuperar lo que pone necesita ${fmtN(N)} ventas.`,
      est === 'ok' ? '' : 'Lo que pasa adentro (precio, atención, que el producto esté a la vista) es de él: enséñale a atender a los que llegan con el cupón.');
  }
  if (ads.objetivo === 'local') {
    if (stock === null) add('stock', 'Separa stock para la promo', 'ojo', false, 'Falta saber cuántas unidades separa. Es el tope de cupones.', 'Pregúntaselo en el paso 5: sin stock separado, la garantía no vale.');
    else {
      const maxLleg = topeCup * llegadaPct, okS = ganVenta > 0 && maxLleg >= N - 1e-9;
      const sobra = Math.max(0, stock - E.meta.compras), topeSug = Math.floor(stock / llegadaPct);
      const corto = okS && E.meta.agotado && topeCup < topeSug && sobra >= 0.3 * stock;
      add('stock', 'Le alcanza el stock', okS ? (corto ? 'ojo' : 'ok') : 'no', !okS && ganVenta > 0,
        `Separa ${fmtN(stock)} unidades${topeCup !== stock ? ` y da hasta ${fmtN(topeCup)} cupones` : ': es el tope de cupones'}. Llegando ${fmtN(llegadaPct * 100)} de cada 100 que reservan, llegan hasta ${fmtUno(maxLleg)}.${E.meta.agotado ? ` En lo esperado se acaban los cupones${sobra >= 1 ? ` y le quedan unas ${fmtN(sobra)} unidades sin vender` : ''}: anúncialo, es escasez de verdad.` : ''}`,
        !okS ? `Para llegar a los ${fmtN(N)}, que separe al menos ${fmtN(Math.ceil(N / llegadaPct))} unidades${topeCup !== stock ? ' o dé más cupones' : ''}.`
          : corto ? `Como no llegan todos los que reservan, puede dar hasta ${fmtN(topeSug)} cupones (el stock ÷ los que llegan): llegarían unas ${fmtN(topeSug * llegadaPct)} personas y nadie se queda sin su producto. Anótalo en «Tope de cupones» (paso 5).` : '');
    }
    const porDia = (E.meta.llegadas + E.meta.sinAtender) / diasCanje;
    if (capCanje === null) add('atiende', 'Puede atender a los que llegan', porDia >= 15 ? 'ojo' : 'na', false, `El día del canje llegarían unas ${fmtUno(porDia)} personas por día. Falta saber cuántas puede atender bien.`, porDia >= 15 ? 'Pregúntale cuántas personas puede atender bien en un día.' : '');
    else {
      const est = E.techo.sinAtender <= 0 ? 'ok' : E.meta.sinAtender <= 0 ? 'ojo' : 'no';
      add('atiende', 'Puede atender a los que llegan', est, false,
        `Puede atender bien ${fmtN(atiendeDia)} personas por día (${fmtN(capCanje)} en ${diasCanje} día${diasCanje > 1 ? 's' : ''} de canje). En lo esperado llegan unas ${fmtUno(porDia)} por día.`,
        est === 'ok' ? '' : E.meta.sinAtender > 0 ? `No le alcanza: unas ${fmtUno(E.meta.sinAtender)} personas se irían sin atender. Ya las quité de la cuenta. Que sume a alguien esos días o haga el canje en más días.` : 'Si sale muy bien, no le alcanza: que tenga a alguien de apoyo esos días.');
    }
    const msj = E.meta.reservas * 2 / (diasCanje + 1), capMsg = n(p.capacidad?.mensajesDia);
    if (capMsg > 0) add('mensajes', 'Puede mandar los recordatorios', capMsg >= msj ? 'ok' : capMsg >= 0.7 * msj ? 'ojo' : 'no', false, `Son 2 recordatorios a mano por reserva: unos ${fmtUno(msj)} mensajes por día cerca del canje. Puede contestar bien ${fmtN(capMsg)} por día.`, capMsg >= msj ? '' : 'Repartan los recordatorios entre dos personas, o mándalos tú desde el link.');
  }
  if (!fecha) add('fecha', 'Tiene fecha y porqué', 'ojo', false, 'Falta la fecha del canje.', 'Elige con él una fecha fuerte (paso 7): sin fecha no hay urgencia de verdad.');
  else if (diasHasta < 0) add('fecha', 'Tiene fecha y porqué', 'no', false, `La fecha del canje (${fmtFecha(fecha)}) ya pasó.`, 'Elige otra fecha.');
  else if (diasHasta < 17) add('fecha', 'Da el tiempo hasta la fecha', diasHasta >= 10 ? 'ojo' : 'no', false, `Faltan ${diasHasta} días para el canje. El calendario pide unos 14 días de videos y 3 de preparación.`, diasHasta >= 10 ? 'Cierra hoy y graba esta semana: el primer video tiene que salir ya.' : 'No da el tiempo: mueve la fecha a la próxima fecha fuerte.');
  else add('fecha', 'Tiene fecha y porqué', vacio(L.porque) ? 'ojo' : 'ok', false, `Canje el ${fmtFecha(fecha)}${!vacio(L.porque) ? `, por «${String(L.porque).trim()}»` : ''}. Para llegar, cierra a más tardar el ${fmtFecha(cierraHasta)}.`, vacio(L.porque) ? 'Ponle un porqué real (una fecha, un aniversario, una temporada): sin porqué, la promo suena a desesperación.' : '');
  if (tipo === 'b2b' || ads.alcanceNegocio === 'empresas') add('encaje', 'Le sirve un lanzamiento con cupón', 'no', false, 'Le vende a empresas: a ellas no se las trae a una tienda con cupón.', 'Para este cliente conviene el plan mensual (cámbialo arriba).');
  else if (ads.objetivo === 'web') add('encaje', 'La garantía asegura que recupere', 'ok', false, `Con «${ads.objetivoNombre}», la garantía cuenta compras en su web: ${fmtN(N)} compras son justo lo que necesita para recuperar.`, '');
  else if (ads.objetivo !== 'local') add('encaje', 'La garantía asegura que recupere', 'ojo', false, `Con «${ads.objetivoNombre}», la garantía cuenta ${unidadGar[1]}, no llegadas a la tienda. ${fmtN(N)} interesados son unas ${fmtUno(N * cierre.plan)} ventas: no alcanza para recuperar lo que puso.`, 'El lanzamiento con garantía es para tiendas con cupón. Si no tiene tienda, considera el plan mensual.');
  const pesoL = an.factNegocio > 0 ? (precio + publicidad) / an.factNegocio : NaN;
  if (Number.isFinite(pesoL)) add('peso', 'No le cuesta demasiado', pesoL <= 0.15 ? 'ok' : pesoL <= 0.3 ? 'ojo' : 'no', false, `El lanzamiento (servicio + publicidad) cuesta ${fmtM(precio + publicidad, mon)}: ${fmtN(pesoL * 100)} de cada 100 bolivianos que vende en un mes.`, pesoL <= 0.15 ? '' : 'Es mucho para su tamaño: muéstrale cuánto le vuelve y que la segunda mitad sale de lo que vende.');
  else add('peso', 'No le cuesta demasiado', 'na', false, 'Falta saber cuánto vende al mes.', '');
  const inicio = mitad1 + publicidad, caja = n(p.negocio?.caja), presTot = n(M.presupuestoTotal);
  if (caja > 0) add('caja', 'Tiene la plata para empezar', caja >= inicio ? 'ok' : 'no', false, `Para empezar pone ${fmtM(inicio, mon)}: la primera mitad (${fmtM(mitad1, mon)}) y la publicidad. Tiene ${fmtM(caja, mon)} para invertir.`, caja >= inicio ? '' : 'Que junte primero, o empiece con la publicidad mínima.');
  if (presTot > 0) add('bolsillo', 'Le alcanza el bolsillo', precio + publicidad <= presTot ? 'ok' : precio + publicidad <= 1.3 * presTot ? 'ojo' : 'no', false, `Tu servicio más la publicidad son ${fmtM(precio + publicidad, mon)}. Él pensaba poner ${fmtM(presTot, mon)}.`, precio + publicidad <= presTot ? '' : 'Muéstrale que la segunda mitad la paga con lo que vende, cuando ya llegaron sus clientes.');
  const faltanC = [];
  if (!C.accesos) faltanC.push('dar sus accesos en la sesión de arranque');
  if (!C.aprueba) faltanC.push('aprobar cada video en 24 horas');
  if (!C.pagaPublicidad) faltanC.push(`poner su publicidad, desde ${fmtM(adsMin, mon)}, desde su cuenta`);
  if (!C.stockSeparado) faltanC.push('separar el stock de la promo');
  if (!C.validaCupon) faltanC.push('validar cada cupón en la tienda');
  if (C.pagoTarjeta === 'no') faltanC.push('tener una tarjeta que pague en dólares');
  if (C.pagoTarjeta === 'nose') faltanC.push('confirmar que su tarjeta paga en dólares');
  if (!C.tiempo) add('compromiso', 'El dueño se compromete', 'no', true, 'No puede dar una hora para la sesión de arranque.', 'Sin el dueño no hay lanzamiento.');
  else add('compromiso', 'Cumple sus 5 cosas', faltanC.length ? 'ojo' : 'ok', false, faltanC.length ? 'Falta que acepte: ' + faltanC.join('; ') + '.' : 'Acepta sus 5 cosas: accesos, aprobar en 24 horas, su publicidad, su stock separado y validar cada cupón.', faltanC.length ? 'Si no las acepta, la garantía no vale: la segunda mitad se paga en la fecha del acuerdo. Díselo antes de cobrar.' : '');
  if (mt.tipo === 'unica' && !foco.l.abrePuertas) add('salud', 'Sus clientes vuelven', 'ojo', false, 'Cada cliente compra una sola vez: el lanzamiento vale por lo que vende esos días.', 'Por eso conviene el plan de cada mes: cada mes, una promo nueva.');
  if (plan.ofrecer && plan.pub > 0) {
    const est = plan.esc.piso.roiC >= 1.2 ? 'ok' : plan.esc.meta.roiC >= 1 ? 'ojo' : 'no';
    add('plan', 'El plan de cada mes le conviene', est, false, `Cada mes, con ${fmtM(plan.pub, mon)} de publicidad, compran unos ${fmtUno(plan.esc.meta.compras)} y le dejan ${fmtM(plan.esc.meta.gan, mon)}. Paga ${fmtM(plan.precio, mon)} cada 4 semanas, o ${fmtM(plan.precioComp, mon)} con ${plan.meses} meses.`, est === 'ok' ? '' : 'Ofrécelo solo si el lanzamiento sale bien, o con más publicidad al mes.');
  }
  const horas = Math.max(0, n(R.horasLanzamiento));
  if (n(R.horaObjetivo) > 0 && horas > 0 && precio / horas < n(R.horaObjetivo)) add('hora', 'Tu hora vale lo que quieres', 'ojo', false, `Tu precio entre ${fmtN(horas)} horas da ${fmtM(precio / horas, mon)} por hora.`, 'Sube tu precio de lanzamiento: +20% cada 5 lanzamientos cobrados.');
  const nEst = estimados.length;
  add('datos', 'Los números son reales', nEst === 0 ? 'ok' : nEst <= 2 ? 'ojo' : 'no', false,
    nEst === 0 ? 'Todos los números los dio el dueño.' : `Hay ${nEst} número${nEst > 1 ? 's' : ''} adivinado${nEst > 1 ? 's' : ''}: ${estimados.join('; ')}.`,
    nEst === 0 ? '' : 'Confírmalos antes de cobrar: el número de la garantía se apoya en ellos.');

  const { veredicto, puntaje } = veredictoDe(ch);
  const diag = diagnosticar(p, T, cierre);
  return {
    R, foco, tipo, T, sup, modo: 'lanzamiento', alc: { estrategia: true, contenido: true, campanas: true, guia: guiaActiva }, guiaActiva, cierre,
    precio, mitad1, mitad2, adsMin, tope, diasExtra, publicidad, presupuesto: publicidad, pubDada, pubSegura, venta, ganVenta, N, unidadGar,
    llegadaPct, compraPct, stock, topeCup, diasCanje, atiendeDia, capCanje, ads, escenarios, plan, fecha, diasHasta, calendario, cierraHasta, hoy: hoyD,
    metaDueno, dias, horas, inicio, chequeos: ch, veredicto, puntaje, estimados, diag, g1: mt.g1, gL: mt.gL,
    equilibrio: { ganVenta, costoMes: precio + publicidad, ventas: ganVenta > 0 ? (precio + publicidad) / ganVenta : null },
  };
}
// Lo mínimo para aceptar un lanzamiento
function minimoLanzamiento(ev) {
  if (!ev || ev.modo !== 'lanzamiento') return null;
  const local = ev.ads.objetivo === 'local', E = ev.escenarios;
  return {
    tope: ev.tope, ganMin: Math.ceil((ev.precio + ev.publicidad) / ev.tope), ganMinConMinimo: Math.ceil((ev.precio + ev.adsMin) / ev.tope),
    pubMin: ev.pubSegura !== null ? Math.max(ev.adsMin, ev.pubSegura) : null, adsMin: ev.adsMin,
    stockMin: local && Number.isFinite(ev.N) ? Math.ceil(ev.N / ev.llegadaPct) : null,
    atiendeMin: local ? Math.ceil((E.meta.llegadas + E.meta.sinAtender) / ev.diasCanje) : null,
    inicio: ev.inicio,
  };
}
// Qué número mueve más el lanzamiento: cada uno sale 20% peor (o la publicidad cuesta 25% más), con la misma publicidad
function sensibilidadLanz(p, reglas, focoId, base) {
  const linea = (p.lineas || []).find(x => x.id === focoId);
  if (!linea || !base) return [];
  const met = ev => ev.escenarios.meta.ganLanz - ev.escenarios.meta.inv;
  const metL = ev => ev.escenarios.meta.gan1 - ev.escenarios.meta.inv;
  const b0 = met(base), bL = metL(base);
  const L = q => q.lineas.find(x => x.id === focoId);
  const LZ = q => { q.lanzamiento = { ...(q.lanzamiento || {}), publicidad: base.publicidad }; return q.lanzamiento; };
  const vars = [['Lo que deja cada venta', 'precio y ganancia', q => { L(q).ticket = n(L(q).ticket) * 0.8; if (q.oferta && q.oferta.activa && q.oferta.lineaId === focoId && n(q.oferta.precio) > 0) q.oferta.precio = n(q.oferta.precio) * 0.8; }]];
  if (base.ads.objetivo === 'local') {
    vars.push(['Cuántos llegan de los que reservan', 'el día del canje', q => { LZ(q).llegadaPct = base.llegadaPct * 80; }]);
    const compraBase = base.compraPct > 0 ? base.compraPct : (base.ads.llegadas > 0 ? base.ads.clientes / base.ads.llegadas : 0.5);
    vars.push(['Cuántos compran de los que llegan', 'la atención en la tienda', q => { LZ(q).compraPct = compraBase * 80; }]);
  } else vars.push(['Cuántos compran de los que escriben', 'cómo atienden', q => { const tv = linea.tipoVenta in TIPOS_VENTA ? linea.tipoVenta : 'b2b'; q.supuestos = q.supuestos || {}; const s = { ...supuestosBase()[tv], ...(q.supuestos[tv] || {}) }; s.cierrePct = n(s.cierrePct) * 0.8; q.supuestos[tv] = s; }]);
  vars.push(['Cuánto cuesta la publicidad', 'anuncios', q => { q.anuncios = { ...(q.anuncios || {}), _factorCosto: 1.25 }; }]);
  const out = [];
  for (const [nombre, grupo, fn] of vars) {
    try {
      const q = JSON.parse(JSON.stringify(p));
      LZ(q); fn(q);
      const ev = evaluarLanzamiento(q, reglas, analizarLineas(q.lineas || [], n(q.negocio?.facturacion)), focoId);
      out.push({ nombre, grupo, delta: met(ev) - b0, deltaLargo: metL(ev) - bL, veredicto: ev.veredicto, llega: ev.escenarios.piso.llega });
    } catch (e) { }
  }
  return out.sort((a, b) => a.delta - b.delta || a.deltaLargo - b.deltaLargo);
}

// ---------- Llamada de venta: una propuesta corta con piso, meta y techo ----------
// Pedido de Mauricio (2026-11-05): «la sesión de diagnóstico está durando mucho si completamos todo».
// En la llamada solo: su situación, sus 3 productos estrella, qué lo frena y tu propuesta (lo que cobras y cuánto va a TikTok).
// Piso = que recupere lo que invierte; meta = que lo duplique; techo = que lo triplique. Todo en facturación extra, medida con los cupones.
// Garantía: si no llega al piso, le devuelves la mitad de tu servicio. La pauta no se devuelve: ya se gastó en TikTok.
const VENTA_OBJETIVOS = {
  perfil: { nombre: 'Visitas al perfil (el link de su cupón)', campana: 'Interacción con la comunidad → Visitas al perfil, con el link del cupón en el perfil', motor: 'local' },
  mensajes: { nombre: 'Que le escriban', campana: 'Clientes potenciales → Mensajes (o Tráfico a su WhatsApp)', motor: 'mensajes' },
};
function evaluarVenta(p, reglas) {
  const R = normalizarReglasMotor(reglas), V = p.venta || {};
  const fact = Math.max(0, n(p.negocio?.facturacion)), costos = Math.max(0, n(V.costosMes));
  const queda = fact > 0 && !vacio(V.costosMes) ? fact - costos : null;
  const cobro = n(V.cobro) > 0 ? n(V.cobro) : n(R.ventaCobro);
  const pauta = clamp(!vacio(V.pauta) ? n(V.pauta) : n(R.ventaPauta), 0, cobro);
  const servicio = cobro - pauta;
  const devolver = Math.round(servicio * clamp(n(R.ventaDevolverPct), 0, 100) / 100);
  const mult = { piso: n(R.ventaPisoX) || 1, meta: n(R.ventaMetaX) || 2, techo: n(R.ventaTechoX) || 3 };
  const obj = VENTA_OBJETIVOS[V.objetivo] ? V.objetivo : 'perfil';
  const an = analizarLineas(p.lineas || [], fact);
  const prods = an.lista.slice(0, 3).filter(x => x.completa);
  const q = { ...p, anuncios: { ...(p.anuncios || {}), objetivo: VENTA_OBJETIVOS[obj].motor } };
  const llegadaPct = clamp(n(R.llegadaLanzPct) || 50, 1, 100) / 100;
  const compraPct = n(p.lanzamiento?.compraPct) > 0 ? clamp(n(p.lanzamiento.compraPct), 1, 100) / 100 : 0;
  // El mismo embudo de TikTok de la pestaña Clientes, con el cupón de día y hora (llega 1 de cada 2) y cómo atiende hoy
  function proyectar(x, pres) {
    const tipo = TIPOS_VENTA[x.l.tipoVenta] ? x.l.tipoVenta : 'b2cAlto', T = TIPOS_VENTA[tipo];
    const sup = { ...supuestosBase()[tipo], ...((p.supuestos || {})[tipo] || {}) };
    const c = cierreHoyDe(p, an, x, T, sup, []);
    return modeloAds(q, { presupuesto: Math.max(0, pres), tipo, ticket: x.mt.ticket, calif: c.calif, cierrePlan: c.bench * c.factorHoy, factorAtencion: clamp(c.factorHoy, 0.4, 1), cupon: true, ofertaBuena: false, factorCosto: 1, lanz: true, llegadaPct, compraPct });
  }
  const inv = cobro;
  const lista = prods.map(x => {
    const m = x.mt.m, ticket = x.mt.ticket, gan = ticket * m, a = proyectar(x, pauta);
    const metas = {}, proy = {};
    for (const k of ['piso', 'meta', 'techo']) {
      const g = mult[k] * inv;
      metas[k] = { ganancia: g, facturacion: m > 0 ? g / m : Infinity, unidades: gan > 0 ? Math.ceil(g / gan - 1e-9) : Infinity };
      const c = a.clientes * FACT_ESC[k];
      proy[k] = { compras: c, facturacion: c * ticket, ganancia: c * gan };
    }
    const estado = proy.piso.ganancia >= metas.piso.ganancia ? 'seguro' : proy.meta.ganancia >= metas.piso.ganancia ? 'ajustado' : 'riesgo';
    const alcanza = ['techo', 'meta', 'piso'].find(k => proy.meta.ganancia >= metas[k].ganancia) || null;
    return { x, id: x.id, nombre: x.nombre, ticket, costo: ticket * (1 - m), m, gan, a, metas, proy, estado, alcanza, ratio: metas.piso.ganancia > 0 ? proy.meta.ganancia / metas.piso.ganancia : 0, margenAdivinado: vacio(x.l0.margen) || n(x.l0.margen) <= 0 };
  });
  const el = lista.find(y => y.id === V.producto) || [...lista].sort((a, b) => b.ratio - a.ratio)[0] || null;
  // La pauta con la que llega al piso aunque salga lo mínimo (tu servicio queda igual)
  let pautaMin = null;
  if (el && el.gan > 0) for (let x = 200; x <= 10000; x += x < 1000 ? 50 : x < 3000 ? 100 : 250) { if (proyectar(el.x, x).clientes * FACT_ESC.piso * el.gan >= mult.piso * (servicio + x)) { pautaMin = x; break; } }
  // Lo peor para él, según cuánto del piso logra (con tu devolución)
  const peor = [0, 0.5, 0.9].map(f => { const g = f * mult.piso * inv; return { f, ganancia: g, neto: g + devolver - inv }; });
  // Su objetivo, contra la meta y el techo de tu propuesta
  const M = p.meta || {};
  let objetivo = null;
  if (el && n(M.valor) > 0) {
    const tipoM = M.tipo || 'aumento';
    const quiere = tipoM === 'total' ? Math.max(0, n(M.valor) - fact) : n(M.valor);
    const da = k => tipoM === 'clientes' ? el.metas[k].unidades : tipoM === 'ganancia' ? el.metas[k].ganancia : el.metas[k].facturacion;
    objetivo = { tipo: tipoM, valor: n(M.valor), quiere, meta: da('meta'), techo: da('techo'), esperado: tipoM === 'clientes' ? el.proy.meta.compras : tipoM === 'ganancia' ? el.proy.meta.ganancia : el.proy.meta.facturacion };
  }
  return { R, mon: R.moneda, fact, costos, queda, cobro, pauta, servicio, devolver, devolverPct: n(R.ventaDevolverPct), mult, inv, obj, objNombre: VENTA_OBJETIVOS[obj].nombre, campana: VENTA_OBJETIVOS[obj].campana, lista, el, pautaMin, peor, objetivo, pesoQueda: queda > 0 ? inv / queda : null };
}

const RANGO_VEREDICTO = { apto: 2, condiciones: 1, no: 0 };
function calcular(p0, reglas) {
  const esc = p0.escenarioDatos || 'normal';
  const lanz = p0.modelo === 'lanzamiento';
  // En un lanzamiento la oferta del paso 6 ES la promo: entra sola en la cuenta (ventaLanzamiento), sin tocar el producto
  const conOferta = q => lanz ? q : aplicarOferta(q);
  const EV = lanz ? evaluarLanzamiento : evaluar;
  const pEsc = aplicarEscenario(p0, esc);
  const p = conOferta(pEsc);
  const an = analizarLineas(p.lineas || [], n(p.negocio?.facturacion));
  if (!an.lista.length || !an.lista.some(x => x.completa)) return { incompleto: true, an, lanz, faltan: ['el precio promedio de al menos una línea'] };
  const porLinea = an.lista.map(x => {
    if (!x.completa) return { id: x.id, nombre: x.nombre, puntaje: x.puntaje, veredicto: 'incompleta' };
    const e = EV(p, reglas, an, x.id);
    return { id: x.id, nombre: x.nombre, puntaje: x.puntaje, veredicto: e.veredicto, encaje: e.puntaje, precio: e.precio };
  });
  let focoId = p.foco, focoAuto = false;
  const completas = an.lista.filter(x => x.completa);
  if (!focoId || focoId === 'auto' || !completas.some(x => x.id === focoId)) {
    focoAuto = true;
    const modoPedido = (p.servicio || {}).modo;
    const optPosible = !lanz && n(p.hoy?.pautaMes) > 0 && n(p.hoy?.ventasPautaMes) > 0 && (modoPedido === 'optimizar' || (modoPedido !== 'crecer' && p.hoy?.equipoContenido));
    if (optPosible) focoId = [...completas].sort((a, b) => b.facturacion - a.facturacion)[0].id;
    else focoId = porLinea.filter(x => x.veredicto !== 'incompleta').sort((a, b) => (RANGO_VEREDICTO[b.veredicto] - RANGO_VEREDICTO[a.veredicto]) || (b.puntaje - a.puntaje))[0].id;
  }
  const ev = EV(p, reglas, an, focoId);
  // ¿Aguanta si los números salen más bajos?
  const hayRangos = Object.keys(p0.rangos || {}).length > 0;
  if (hayRangos && esc !== 'prudente') {
    try {
      const pp = conOferta(aplicarEscenario(p0, 'prudente'));
      const evP = EV(pp, reglas, analizarLineas(pp.lineas || [], n(pp.negocio?.facturacion)), focoId);
      const malo = evP.veredicto === 'no';
      ev.chequeos.push({ id: 'robusto', nombre: 'Aguanta si los números salen más bajos', estado: malo ? 'ojo' : 'ok', critico: false,
        detalle: malo ? 'Si sus números salen como lo más bajo que dijo, la promesa ya no se cumple.' : 'Aunque sus números salgan como lo más bajo que dijo, se sigue cumpliendo.',
        arreglo: malo ? 'Confirma los números que dio como rango antes de firmar, o promete un poco menos.' : '' });
      Object.assign(ev, veredictoDe(ev.chequeos));
      ev.prudente = { veredicto: evP.veredicto, puntaje: evP.puntaje };
    } catch (e) { }
  }
  const oferta = evaluarOferta(pEsc);
  if (oferta && !oferta.incompleta && (p0.oferta?.usarEnCuenta || (lanz && oferta.lineaId === focoId)) && oferta.margenEfectivo < 0.15) {
    ev.chequeos.push({ id: 'oferta', nombre: 'La oferta deja ganancia', estado: 'no', critico: false, detalle: `Con esos regalos y esa garantía, le quedan solo ${fmtN(oferta.margenEfectivo * 100)} de cada 100.`, arreglo: 'Quita regalos caros, sube el precio o busca regalos que cuesten poco y valgan mucho.' });
    Object.assign(ev, veredictoDe(ev.chequeos));
  }
  const hallazgos = construirHallazgos(an, p, ev);
  const alternativas = [];
  if (ev.veredicto === 'no') {
    const R = ev.R;
    if (ev.forzado) alternativas.push(`Con lo que le puedes dar, gana unos ${fmtM(ev.valorMesPiso, R.moneda)} al mes si sale lo mínimo. Tu precio mínimo es ${fmtM(n(R.precioMinimo), R.moneda)}: casi no le quedaría nada. Ofrécele una sesión pagada de diagnóstico o un taller, y vuelve cuando crezca.`);
    const otra = porLinea.filter(x => x.id !== focoId && x.veredicto && x.veredicto !== 'no' && x.veredicto !== 'incompleta').sort((a, b) => b.puntaje - a.puntaje)[0];
    if (otra) alternativas.push(`Si ${lanz ? 'el lanzamiento es de' : 'te enfocas en'} «${otra.nombre}», sí se puede cumplir${otra.veredicto === 'condiciones' ? ', con condiciones' : ''}.`);
    for (const c of ev.chequeos) if (c.critico && c.estado === 'no' && c.arreglo && !(c.id === 'gana' && ev.forzado)) alternativas.push(c.arreglo);
  }
  const icp = analizarSegmentos(p0.oferta?.segmentos);
  let sens = [];
  try { sens = lanz ? sensibilidadLanz(p, reglas, focoId, ev) : sensibilidad(p, reglas, focoId, ev); } catch (e) { sens = []; }
  let minimo = null;
  try { minimo = lanz ? minimoLanzamiento(ev) : minimoAceptable(p, reglas, focoId, ev); } catch (e) { minimo = null; }
  return { an, ev, porLinea, focoId, focoAuto, hallazgos, alternativas, oferta, icp, sens, esc, hayRangos, minimo, lanz };
}
/*MOTOR-FIN*/
