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
function objetivoAdsDe(p, tipo, alcanceNeg) {
  const o = (p.anuncios || {}).objetivo;
  if (o && o !== 'auto' && ADS_OBJETIVOS[o]) return { objetivo: o, auto: false };
  if (alcanceNeg === 'empresas' || tipo === 'b2b') return { objetivo: 'formulario', auto: true };
  if (alcanceNeg === 'barrio') return { objetivo: 'local', auto: true };
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
    r.llegadas = r.resultados * T.llegada;
    r.clientes = r.llegadas * T.compraLocal * fPrecio * (0.75 + 0.25 * c.factorAtencion);
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
  const { objetivo, auto: objetivoAuto } = objetivoAdsDe(p, c.tipo, alcanceNeg);
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
    cupon: c.cupon, avisos,
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
  // Avisos de experto
  for (const x of partes) {
    if (x.plat !== 'tiktok') continue;
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
function evaluar(p, reglas, an, focoId) {
  const R = normalizarReglasMotor(reglas);
  const foco = an.lista.find(x => x.id === focoId) || an.lista.find(x => x.completa) || an.lista[0];
  const tipo = TIPOS_VENTA[foco.l.tipoVenta] ? foco.l.tipoVenta : 'b2b';
  const T = TIPOS_VENTA[tipo];
  const sup = { ...supuestosBase()[tipo], ...((p.supuestos || {})[tipo] || {}) };
  const h = p.hoy;
  const estimados = [];
  if (vacio(foco.l0.margen) || n(foco.l0.margen) <= 0) estimados.push('cuánto le queda de cada 100 (usé 30)');
  if (foco.l.tipo === 'recurrente' && vacio(foco.l0.vidaMeses)) estimados.push('cuántos meses se queda un cliente (usé 12)');
  if (foco.l.tipo === 'repetida' && vacio(foco.l0.comprasAnio)) estimados.push('cuántas veces al año compra (usé 2)');
  if (foco.l.tipo === 'repetida' && vacio(foco.l0.aniosCliente)) estimados.push('cuántos años sigue comprando (usé 1,5)');
  if (vacio(foco.l0.cicloDias)) estimados.push(`cuántos días tarda una venta (usé ${T.cicloDias})`);
  const mt = foco.mt;
  const F = p.fuentes || {};
  const marcas = [[`linea:${foco.id}:ticket`, 'el precio promedio'], [`linea:${foco.id}:margen`, 'cuánto le queda de cada 100'], [`linea:${foco.id}:vidaMeses`, 'cuántos meses se queda un cliente'], [`linea:${foco.id}:comprasAnio`, 'cuántas veces al año compra'], [`linea:${foco.id}:aniosCliente`, 'cuántos años sigue comprando'], [`linea:${foco.id}:cicloDias`, 'cuántos días tarda una venta'], ['hoy.interesadosMes', 'cuántos preguntan al mes'], ['hoy.clientesMes', 'cuántos clientes nuevos consigue']];
  for (const [k, t] of marcas) if (F[k] === 'estimado' && !estimados.some(e => e.startsWith(t))) estimados.push(t + ' (valor por las dudas)');

  // Cierre: hoy y con el plan
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

const RANGO_VEREDICTO = { apto: 2, condiciones: 1, no: 0 };
function calcular(p0, reglas) {
  const esc = p0.escenarioDatos || 'normal';
  const pEsc = aplicarEscenario(p0, esc);
  const p = aplicarOferta(pEsc);
  const an = analizarLineas(p.lineas || [], n(p.negocio?.facturacion));
  if (!an.lista.length || !an.lista.some(x => x.completa)) return { incompleto: true, an, faltan: ['el precio promedio de al menos una línea'] };
  const porLinea = an.lista.map(x => {
    if (!x.completa) return { id: x.id, nombre: x.nombre, puntaje: x.puntaje, veredicto: 'incompleta' };
    const e = evaluar(p, reglas, an, x.id);
    return { id: x.id, nombre: x.nombre, puntaje: x.puntaje, veredicto: e.veredicto, encaje: e.puntaje, precio: e.precio };
  });
  let focoId = p.foco, focoAuto = false;
  const completas = an.lista.filter(x => x.completa);
  if (!focoId || focoId === 'auto' || !completas.some(x => x.id === focoId)) {
    focoAuto = true;
    const modoPedido = (p.servicio || {}).modo;
    const optPosible = n(p.hoy?.pautaMes) > 0 && n(p.hoy?.ventasPautaMes) > 0 && (modoPedido === 'optimizar' || (modoPedido !== 'crecer' && p.hoy?.equipoContenido));
    if (optPosible) focoId = [...completas].sort((a, b) => b.facturacion - a.facturacion)[0].id;
    else focoId = porLinea.filter(x => x.veredicto !== 'incompleta').sort((a, b) => (RANGO_VEREDICTO[b.veredicto] - RANGO_VEREDICTO[a.veredicto]) || (b.puntaje - a.puntaje))[0].id;
  }
  const ev = evaluar(p, reglas, an, focoId);
  // ¿Aguanta si los números salen más bajos?
  const hayRangos = Object.keys(p0.rangos || {}).length > 0;
  if (hayRangos && esc !== 'prudente') {
    try {
      const pp = aplicarOferta(aplicarEscenario(p0, 'prudente'));
      const evP = evaluar(pp, reglas, analizarLineas(pp.lineas || [], n(pp.negocio?.facturacion)), focoId);
      const malo = evP.veredicto === 'no';
      ev.chequeos.push({ id: 'robusto', nombre: 'Aguanta si los números salen más bajos', estado: malo ? 'ojo' : 'ok', critico: false,
        detalle: malo ? 'Si sus números salen como lo más bajo que dijo, la promesa ya no se cumple.' : 'Aunque sus números salgan como lo más bajo que dijo, se sigue cumpliendo.',
        arreglo: malo ? 'Confirma los números que dio como rango antes de firmar, o promete un poco menos.' : '' });
      Object.assign(ev, veredictoDe(ev.chequeos));
      ev.prudente = { veredicto: evP.veredicto, puntaje: evP.puntaje };
    } catch (e) { }
  }
  const oferta = evaluarOferta(pEsc);
  if (oferta && !oferta.incompleta && p0.oferta?.usarEnCuenta && oferta.margenEfectivo < 0.15) {
    ev.chequeos.push({ id: 'oferta', nombre: 'La oferta deja ganancia', estado: 'no', critico: false, detalle: `Con esos regalos y esa garantía, le quedan solo ${fmtN(oferta.margenEfectivo * 100)} de cada 100.`, arreglo: 'Quita regalos caros, sube el precio o busca regalos que cuesten poco y valgan mucho.' });
    Object.assign(ev, veredictoDe(ev.chequeos));
  }
  const hallazgos = construirHallazgos(an, p, ev);
  const alternativas = [];
  if (ev.veredicto === 'no') {
    const R = ev.R;
    if (ev.forzado) alternativas.push(`Con lo que le puedes dar, gana unos ${fmtM(ev.valorMesPiso, R.moneda)} al mes si sale lo mínimo. Tu precio mínimo es ${fmtM(n(R.precioMinimo), R.moneda)}: casi no le quedaría nada. Ofrécele una sesión pagada de diagnóstico o un taller, y vuelve cuando crezca.`);
    const otra = porLinea.filter(x => x.id !== focoId && x.veredicto && x.veredicto !== 'no' && x.veredicto !== 'incompleta').sort((a, b) => b.puntaje - a.puntaje)[0];
    if (otra) alternativas.push(`Si te enfocas en «${otra.nombre}», sí se puede cumplir${otra.veredicto === 'condiciones' ? ', con condiciones' : ''}.`);
    for (const c of ev.chequeos) if (c.critico && c.estado === 'no' && c.arreglo && !(c.id === 'gana' && ev.forzado)) alternativas.push(c.arreglo);
  }
  const icp = analizarSegmentos(p0.oferta?.segmentos);
  let sens = [];
  try { sens = sensibilidad(p, reglas, focoId, ev); } catch (e) { sens = []; }
  let minimo = null;
  try { minimo = minimoAceptable(p, reglas, focoId, ev); } catch (e) { minimo = null; }
  return { an, ev, porLinea, focoId, focoAuto, hallazgos, alternativas, oferta, icp, sens, esc, hayRangos, minimo };
}
/*MOTOR-FIN*/
