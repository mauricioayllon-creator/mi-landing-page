
// =================== Lanzamiento ===================
// Pedido de Mauricio (2026-11-02): «Si tengo una reunión de venta que va a ser para un lanzamiento, tengo que estar en esa configuración.»
// Las cuentas están en motor4.js (evaluarLanzamiento). Aquí: el selector de modo, las preguntas propias, el panel y la vista del cliente.
const esLanz = () => estado.prospecto.modelo === 'lanzamiento';
const TABS_LANZ = [['resumen', 'Resumen'], ['lanzamiento', 'Lanzamiento'], ['estrategia', 'Estrategia'], ['plata', 'Plata'], ['revision', 'Revisión']];
// Lo que incluye un lanzamiento (su método, ficha 14 y decisión del 24/10)
const LANZ_INCLUYE = [
  ['Tu promo armada', 'Una oferta mejor que una rebaja: el producto, el regalo y el porqué de la fecha.'],
  ['9 videos', '3 cuerpos con 3 ganchos cada uno, con una sesión de grabación.'],
  ['El cupón con día y hora', 'En el link de tu perfil: la gente lo reserva sin salir de TikTok.'],
  ['Los recordatorios', 'A cada reserva, un día antes y unas horas antes.'],
  ['La publicidad armada', 'Sobre el video que gana, con la mitad en los 3 últimos días.'],
  ['Cada llegada contada', 'Se valida cada cupón en tu tienda: sabes qué video vendió.'],
  ['La reunión de resultados', 'Qué funcionó, cuánto vendiste y qué sigue.'],
];
function fmtDiaCorto(d) { return d ? new Intl.DateTimeFormat('es-BO', { weekday: 'short', day: 'numeric', month: 'short' }).format(d) : ''; }
function rangoFechas(a, b) {
  if (!a) return '';
  if (!b || diasEntre(a, b) === 0) return fmtDiaCorto(a);
  const f = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short' });
  return `${f.format(a)} – ${f.format(b)}`;
}
function cincoCosas() {
  const C = estado.prospecto.compromiso, mon = estado.reglas.moneda;
  return [
    [!!C.accesos, 'Sus accesos en la sesión de arranque (sin contraseñas por chat)'],
    [!!C.aprueba, 'Aprobar cada video en 24 horas'],
    [!!C.pagaPublicidad, `Su publicidad, desde ${fmtM(n(estado.reglas.anunciosMinimoLanz), mon)}, directo desde su cuenta`],
    [!!C.stockSeparado, 'Su stock separado para la promo'],
    [!!C.validaCupon, 'Validar cada cupón en la tienda'],
  ];
}

// ---------- Selector: lanzamiento o plan mensual ----------
function htmlModelo(compacto) {
  const m = estado.prospecto.modelo, R = estado.reglas, mon = R.moneda;
  const sub = m === 'lanzamiento'
    ? `Una promo con fecha y cupón: ${fmtM(n(R.precioLanzamiento), mon)} en dos mitades, con la garantía de tu número.`
    : `Un servicio cada mes: desde ${fmtM(n(R.precioMinimo), mon)} al mes, según lo que le haces ganar.`;
  return `<div class="modelo${compacto ? ' modelo-chico' : ''}"><div class="modelo-txt"><b>¿Qué le vas a vender?</b>${compacto ? '' : `<span>${esc(sub)}</span>`}</div>
    <div class="segmento" role="radiogroup" aria-label="Qué le vas a vender">${[['lanzamiento', 'Un lanzamiento'], ['mensual', 'Plan mensual']].map(([v, t]) => `<button type="button" role="radio" aria-checked="${m === v}" data-modelo="${v}">${t}</button>`).join('')}</div></div>`;
}
function renderModelo() { const c = $('#modelo'); if (c) c.innerHTML = htmlModelo(false); }
function cambiarModelo(v) {
  if (!['lanzamiento', 'mensual'].includes(v) || estado.prospecto.modelo === v) return;
  estado.prospecto.modelo = v; guardarLocal('co4.modelo', v);
  if (v === 'lanzamiento' && estado.tab === 'meta') estado.tab = 'lanzamiento';
  if (v === 'mensual' && estado.tab === 'lanzamiento') estado.tab = 'meta';
  guardarLocal('co4.tab', estado.tab);
  cerrarDetalle();
  $('#ruta').innerHTML = htmlRutaLlamada();
  renderForm(); recalcular(); programarBorrador();
  aviso(v === 'lanzamiento' ? 'Modo lanzamiento: un cobro por promo, en dos mitades.' : 'Modo plan mensual: cobras cada mes.');
}

// ---------- Preguntas propias del lanzamiento ----------
function campoFecha({ clave, q, importante = false, nota = '' }) {
  const id = 'f-' + idSeguro(clave), v = getValor(clave) || '';
  return `<div class="fila" data-pregunta="${esc(clave)}">${htmlGuia(clave)}<div class="fila-cab"><label for="${id}">${esc(q)}</label>${htmlBadge(clave, importante)}</div>
    <div class="campo-in"><input type="date" id="${id}" data-clave="${esc(clave)}" data-tipo="txt" value="${esc(v)}"></div>${nota ? `<p class="nota">${esc(nota)}</p>` : ''}</div>`;
}
function htmlPaso5Lanz() {
  return `<div class="explica"><b>El día del canje.</b> En un lanzamiento la gente llega junta, en 1 o 2 días. Si no hay stock o no da abasto, los que llegan se van molestos y la garantía no se cumple.<span>Piensa solo en el producto de la promo.</span></div>
    <p class="grupo-titulo">1. El stock</p><div class="grupo">
    ${pregunta({ clave: 'lanzamiento.stock', q: '¿Cuántas unidades separa para la promo?', suf: 'unidades', importante: true, nota: 'Es el tope de cupones. Cuando se acaban, se anuncia que se agotó: escasez de verdad.' })}
    ${pregunta({ clave: 'lanzamiento.topeCupones', q: '¿Cuántos cupones como máximo? (vacío = igual al stock)', suf: 'cupones', rango: false, nota: 'Como no llegan todos los que reservan, se pueden dar más cupones que unidades sin dejar a nadie sin su producto. En el panel te digo cuántos.' })}</div>
    <p class="grupo-titulo">2. Atender</p><div class="grupo">
    ${chips({ clave: 'lanzamiento.diasCanje', q: '¿Cuántos días dura el canje en la tienda?', opciones: [['1', '1 día'], ['2', '2 días'], ['3', '3 días']] })}
    ${pregunta({ clave: 'lanzamiento.atiendeDia', q: '¿Cuántas personas puede atender bien en un día de canje?', suf: 'por día', importante: true, nota: 'Atender bien = sin filas largas, con el producto a la vista y alguien que cierre la venta.' })}
    ${pregunta({ clave: 'capacidad.mensajesDia', q: '¿Cuántos mensajes pueden mandar o contestar bien por día?', ayuda: 'mensajesDia', suf: 'por día', importante: true, nota: 'Cada reserva lleva 2 recordatorios a mano: un día antes y unas horas antes.' })}</div>
    <div id="vivo-canje">${htmlVivoCanje()}</div>`;
}
function htmlPaso7Lanz() {
  const p = estado.prospecto, A = p.anuncios, mon = estado.reglas.moneda;
  const ev = ultimo && ultimo.lanz && ultimo.ev ? ultimo.ev : null;
  const objEf = A.objetivo && A.objetivo !== 'auto' ? A.objetivo : (ev ? ev.ads.objetivo : 'local');
  const fechas = proximasFechas(new Date(), 6);
  return `<div class="explica"><b>La promo, con fecha.</b> El primer video sale unos 14 días antes del canje y la mitad de la publicidad va en los 3 últimos días. Con la fecha te digo hasta cuándo tienes que cerrar.<span>El número de la garantía sale de aquí: lo que pone (tu servicio + la publicidad) ÷ lo que le deja cada venta.</span></div>
    <p class="grupo-titulo">La fecha</p><div class="grupo">
    ${campoFecha({ clave: 'lanzamiento.fecha', q: '¿Qué día es el canje en la tienda?', importante: true })}
    <div class="fila"><p class="nota">Fechas fuertes que vienen (toca una):</p><div class="chips chips-chicos">${fechas.map(f => `<button type="button" data-fecha="${esc(f.iso)}" data-porque="${esc(f.nombre)}">${esc(f.nombre)} · <b>${esc(fmtFecha(f.canje, false))}</b></button>`).join('')}</div></div>
    ${texto({ clave: 'lanzamiento.porque', q: '¿Por qué ese día? (el porqué de la promo)', ph: 'Ej. Black Friday, aniversario de la tienda, Día de la Madre', nota: 'Sin un porqué real, la promo suena a desesperación.' })}</div>
    <p class="grupo-titulo">La campaña</p><div class="grupo">
    ${chips({ clave: 'anuncios.plataforma', q: '¿Dónde se pauta?', opciones: [['tiktok', 'TikTok'], ['meta', 'Facebook e Instagram'], ['ambas', 'Las dos']] })}
    ${chips({ clave: 'anuncios.alcance', q: '¿De dónde vienen sus clientes?', opciones: [['auto', 'Que lo decida la calculadora'], ['barrio', 'De su zona'], ['ciudad', 'De toda la ciudad'], ['pais', 'De todo el país'], ['empresas', 'Son empresas']], nota: ev && ev.ads.alcanceAuto ? `Ahora uso: ${ev.ads.alcanceNombre.toLowerCase()}.` : '' })}
    ${chips({ clave: 'anuncios.objetivo', q: 'Cuando alguien ve el video, ¿qué queremos que haga?', opciones: [['auto', 'Que lo decida la calculadora'], ['local', 'Que reserve su cupón y venga'], ['mensajes', 'Que escriba por WhatsApp'], ['formulario', 'Que deje sus datos'], ['web', 'Que compre en la web']], estructura: true, nota: ev && ev.ads.objetivoAuto ? `Ahora uso: «${ev.ads.objetivoNombre}».` : '' })}
    ${objEf === 'local' ? interruptor({ clave: 'anuncios.cupon', q: 'El cupón lleva un regalo (la promo)', nota: 'Con un regalo que a él le cueste poco y al cliente le valga harto, reserva mucha más gente. Ármalo en el paso 6.' }) : ''}</div>
    <p class="grupo-titulo">La plata</p><div class="grupo">
    ${pregunta({ clave: 'lanzamiento.publicidad', q: '¿Cuánto pone en publicidad para este lanzamiento? (lo paga directo, desde su cuenta)', pre: mon, fmt: 'dinero', rango: false, nota: `Tu mínimo: ${fmtM(n(estado.reglas.anunciosMinimoLanz), mon)}. Si lo dejas vacío, uso lo menos con lo que llegan los de la garantía aunque salga lo mínimo.` })}
    ${pregunta({ clave: 'anuncios.tc', q: '¿A cuánto le cobra el banco cada dólar?', suf: 'Bs por dólar', ph: fmtN(TC_DEF, 2), nota: 'Desde abril de 2026 las tarjetas pagan al tipo de cambio del Banco Central (en noviembre de 2026, Bs 12,09). Confírmalo el día de la llamada en bcb.gob.bo.' })}
    ${chips({ clave: 'compromiso.pagoTarjeta', q: '¿Tiene tarjeta que acepte pagos en dólares?', opciones: [['si', 'Sí'], ['no', 'No'], ['nose', 'No sabe']], nota: 'Sin una tarjeta que funcione, la publicidad no sale.' })}</div>
    <div id="vivo-lanz">${htmlVivoLanz()}</div>
    <p class="grupo-titulo">Lo que sabe de su tienda (opcional)</p><div class="grupo">
    ${pregunta({ clave: 'lanzamiento.compraPct', q: 'De cada 100 que entran a su tienda preguntando por esto, ¿cuántos compran?', suf: 'de 100', nota: 'Si lo sabe, uso su dato. Si no, un promedio prudente.' })}
    ${pregunta({ clave: 'lanzamiento.llegadaPct', q: 'De cada 100 que reservan el cupón, ¿cuántos llegan?', suf: 'de 100', ph: fmtN(n(estado.reglas.llegadaLanzPct)), nota: 'Tu supuesto: 1 de cada 2, hasta tener 10 reservas contadas de lanzamientos terminados. Cámbialo cuando tengas tus datos.' })}</div>
    <p class="grupo-titulo">Si ya pautó antes (opcional)</p><div class="grupo">
    ${pregunta({ clave: 'anuncios.costoResultadoReal', q: `¿Cuánto le costaba cada ${objEf === 'local' ? 'persona que pedía el cupón o escribía' : objEf === 'formulario' ? 'formulario' : objEf === 'web' ? 'visita a la web' : 'conversación (mensaje)'}?`, pre: mon, nota: 'Si lo sabe, uso su dato real en vez del promedio.' })}
    ${pregunta({ clave: 'anuncios.cpmReal', q: '¿Cuánto le costaban mil vistas?', pre: mon, nota: 'Está en el administrador de anuncios como «CPM».' })}</div>`;
}
function htmlPaso8Lanz() {
  const mon = estado.reglas.moneda;
  return `<div class="explica"><b>Sus 5 cosas.</b> La garantía vale si él las cumple. Si no cumple una, la segunda mitad se paga en la fecha del acuerdo. Díselo antes de cobrar la primera mitad.</div>
    <p class="grupo-titulo">Sus 5 cosas</p><div class="grupo">
    ${interruptor({ clave: 'compromiso.accesos', q: 'Dar sus accesos en la sesión de arranque (sin contraseñas por chat)' })}
    ${interruptor({ clave: 'compromiso.aprueba', q: 'Aprobar cada video en 24 horas' })}
    ${interruptor({ clave: 'compromiso.pagaPublicidad', q: `Poner su publicidad, desde ${fmtM(n(estado.reglas.anunciosMinimoLanz), mon)}, directo desde su cuenta` })}
    ${interruptor({ clave: 'compromiso.stockSeparado', q: 'Separar el stock de la promo' })}
    ${interruptor({ clave: 'compromiso.validaCupon', q: 'Validar cada cupón en la tienda' })}</div>
    <p class="grupo-titulo">Además</p><div class="grupo">
    ${interruptor({ clave: 'compromiso.tiempo', q: 'Una hora para la sesión de arranque' })}
    ${interruptor({ clave: 'compromiso.aplicaGuia', q: 'Atender con tu guía a los que llegan con el cupón' })}</div>
    <p class="grupo-titulo">Después del lanzamiento</p><div class="grupo">
    ${interruptor({ clave: 'lanzamiento.ofrecerPlan', q: 'Ofrecerle el plan de cada mes el día que se completa la garantía' })}
    ${pregunta({ clave: 'lanzamiento.pautaPlan', q: 'Publicidad al mes en el plan (vacío = la misma del lanzamiento)', pre: mon, fmt: 'dinero', rango: false })}</div>`;
}
function htmlVivoLanz() {
  const r = ultimo;
  if (!r || !r.lanz || !r.ev) return `<div class="vivo"><p class="texto">Cuando anotes lo que vende (paso 3), aquí ves el número de la garantía y cuántos llegan.</p></div>`;
  return `<div class="vivo">${htmlNumeroGarantia(r.ev, true)}${htmlEmbudoLanz(r, true)}</div>`;
}
function htmlVivoCanje() {
  const r = ultimo;
  if (!r || !r.lanz || !r.ev) return '';
  return `<div class="vivo">${htmlMedidoresCanje(r.ev)}</div>`;
}

// ---------- Panel ----------
function cuerpoLanz(r, tab) {
  if (tab === 'lanzamiento') return [htmlCalendarioLanz(r), htmlCanjeLanz(r), htmlMetaLanz(r)];
  if (tab === 'estrategia') return [htmlAnunciosLanz(r), htmlOferta(r), htmlICP(r), htmlQuedaLanz(r)];
  if (tab === 'plata') return [htmlPlataLanz(r), htmlPlanMesLanz(r), htmlSens(r), htmlPrecioLanz(r)];
  if (tab === 'revision') return [htmlRevision(r), htmlFaltan(), htmlMasLanz(r)];
  return [htmlMosaicoLanz(r), htmlGarantiaLanz(r), htmlMinimoLanz(r), htmlSalud(r), htmlTesoro(r), htmlFaltan()];
}
function estadoGarantia(ev) {
  const E = ev.escenarios;
  if (!Number.isFinite(ev.N)) return ['no', 'Sin número', 'Falta saber cuánto le deja cada venta.'];
  if (E.piso.llega) return ['ok', 'Segura', `Aunque salga lo mínimo llegan ${f1(E.piso.unidades)} de ${fmtN(ev.N)}.`];
  if (E.meta.llega) return ['ojo', 'Ajustada', `Lo esperado da ${f1(E.meta.unidades)} de ${fmtN(ev.N)}; lo mínimo, ${f1(E.piso.unidades)}.`];
  return ['no', 'En riesgo', `Lo esperado da solo ${f1(E.meta.unidades)} de ${fmtN(ev.N)}.`];
}
function htmlMosaicoLanz(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda, g = estadoGarantia(ev);
  const w = (id, ic, col, tit, grande, chico, txt) => `<button type="button" class="widget tocable" data-detalle="${id}"><div class="widget-cab">${icoSq(ic, col)}${esc(tit)}<span class="ver-mas">Ver más ›</span></div><div class="grande">${esc(grande)}${chico ? ` <small>${esc(chico)}</small>` : ''}</div><p>${esc(txt)}</p></button>`;
  return `<div class="mosaico">
    ${w('prometes', 'objetivo', 'blue', 'Le prometes', Number.isFinite(ev.N) ? fmtN(ev.N) : '—', ev.unidadGar[0], `${ev.unidadGar[1]}: lo que necesita para recuperar lo que pone.`)}
    ${w('cobras', 'moneda', 'green', 'Le cobras', fmtM(ev.precio, mon), 'por lanzamiento', `${fmtM(ev.mitad1, mon)} para empezar y ${fmtM(ev.mitad2, mon)} cuando lleguen los ${Number.isFinite(ev.N) ? fmtN(ev.N) : '—'}.`)}
    ${w('gana', 'sube', 'indigo', 'Él gana', fmtN(E.piso.roiLanz, 1) + '×', 'lo que pone', `En el lanzamiento, aunque salga lo mínimo.${ev.venta.g1 > ev.ganVenta + 0.5 ? ` Con los que vuelven en el año: ${fmtN(E.piso.roi1, 1)}×.` : ''}`)}
    ${w('garantia', 'escudo', g[0] === 'ok' ? 'green' : g[0] === 'ojo' ? 'orange' : 'red', 'Tu segunda mitad', g[1], '', g[2])}
  </div>`;
}
// El número de la garantía, con la cuenta y las barras de cada escenario
function htmlNumeroGarantia(ev, compacto) {
  const mon = ev.R.moneda, E = ev.escenarios;
  if (!Number.isFinite(ev.N)) return `<p class="texto">${ICO.no} Falta saber cuánto le deja cada venta (paso 3): sin eso no hay número de garantía.</p>`;
  const max = Math.max(ev.N, E.techo.unidades, 1) * 1.1, w = x => clamp(x / max * 100, 0, 100);
  const fila = (k, t, col) => { const e = E[k]; return `<div class="barra-fila"><div class="eti">${t}<small>${e.llega ? 'llega' : `faltan ${f1(e.faltan)}`}</small></div><div class="pista"><i style="width:${w(e.unidades)}%;background:${e.llega ? col : 'var(--red)'}"></i><b class="marca-n" style="left:${w(ev.N)}%"></b></div><div class="val">${f1(e.unidades)}</div></div>`; };
  return `<div class="garantia-n"><div class="gn-cifra"><b>${fmtN(ev.N)}</b><span>${esc(ev.unidadGar[1])}</span></div>
      <div class="formula">${esc(`Lo que pone: ${fmtM(ev.precio, mon)} (tu servicio) + ${fmtM(ev.publicidad, mon)} (publicidad) = ${fmtM(ev.precio + ev.publicidad, mon)}\n÷ ${fmtM(ev.ganVenta, mon)} que le deja cada venta${ev.venta.regalo > 0 ? ` (ya resté el regalo de ${fmtM(ev.venta.regalo, mon)})` : ''}\n= ${fmtN(ev.N)}${ev.N > ev.tope ? ` · pasa tu tope de ${fmtN(ev.tope)}` : ''}`)}</div></div>
    <div class="barras barras-n">${fila('piso', 'Lo mínimo', 'var(--s2)')}${fila('meta', 'Lo esperado', 'var(--s1)')}${fila('techo', 'Si sale muy bien', 'var(--s3)')}</div>
    ${compacto ? '' : `<p class="nota-eje">La rayita negra es el número de la garantía. Las barras: cuántas llegan en cada escenario.</p>`}`;
}
function htmlGarantiaLanz(r) {
  const ev = r.ev, mon = ev.R.moneda, E = ev.escenarios, g = estadoGarantia(ev);
  const cosas = cincoCosas();
  const sube = ev.pubSegura !== null && ev.pubSegura > ev.publicidad ? `<p class="texto">${ICO.ojo} Con <b>${esc(fmtM(ev.pubSegura, mon))}</b> de publicidad llegan los ${fmtN(ev.N)} aunque salga lo mínimo.</p>` : '';
  const adentro = ev.ads.objetivo === 'local' && Number.isFinite(ev.N) ? `<p class="texto"><b>Lo que pasa adentro:</b> la garantía cuenta llegadas, compren o no. En lo esperado compran ${f1(E.meta.compras)} de los ${f1(E.meta.llegadas)} que llegan${E.meta.compras >= ev.N ? `: más de las ${fmtN(ev.N)} ventas que necesita para recuperar.` : `, y para recuperar lo que pone necesita ${fmtN(ev.N)} ventas. Enséñale a atender a los que llegan.`}</p>` : '';
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('escudo', 'orange')}Tu garantía y su número</h3>${etqEst(g[0], g[1])}</div>
    ${htmlNumeroGarantia(ev, false)}
    <p class="texto"><b>Lo que le dices:</b> «${esc(fraseGarantiaLanz(ev))}»</p>
    ${sube}${adentro}
    <h4 class="sub-titulo">${icoSq('lista', 'green')}Vale si cumple sus 5 cosas</h4>
    <ul class="filas-lista">${cosas.map(([ok, t]) => `<li>${ok ? ICO.ok : ICO.ojo}<span>${esc(t)}${ok ? '' : ' <b>(falta que lo acepte)</b>'}</span></li>`).join('')}</ul>
    <p class="texto">Si no cumple una, la segunda mitad se paga en la fecha del acuerdo. Si cumple y en su fecha no llegan, ${ev.diasExtra} días más con el video ganador, sin costo; si igual no llegan, no te paga la segunda mitad.</p></section>`;
}
function fraseGarantiaLanz(ev) {
  const t = String(ev.R.garantiaTexto || '').trim(), mon = ev.R.moneda;
  const cuantos = Number.isFinite(ev.N) ? `los ${fmtN(ev.N)} clientes que necesitas para recuperar lo que pusiste` : 'los clientes que necesitas para recuperar lo que pusiste';
  if (t) { const x = t.replace(/\{meses\}/g, 'tu fecha').replace(/\{promesa\}/g, cuantos); return x[0].toUpperCase() + x.slice(1); }
  return `Me pagas la mitad para empezar (${fmtM(ev.mitad1, mon)}), y la otra mitad (${fmtM(ev.mitad2, mon)}) cuando te lleguen ${cuantos}. Si no llegan, no me la pagas.`;
}
function htmlMinimoLanz(r) {
  const ev = r.ev, m = r.minimo, mon = ev.R.moneda, p = estado.prospecto;
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('balanza', 'indigo')}Lo mínimo para aceptarlo</h3><p>tu tope ${fmtN(ev.tope)} · publicidad desde ${esc(fmtM(ev.adsMin, mon))}</p></div>`;
  if (!m) return '';
  const caja = n(p.negocio.caja);
  const fila = (t, min, hoy, ok, nota) => `<tr><td>${esc(t)}${nota ? `<small>${esc(nota)}</small>` : ''}</td><td class="n">${esc(min)}</td><td class="n">${esc(hoy)}</td><td>${ok === null ? ICO.na : ok ? ICO.ok : ICO.no}</td></tr>`;
  const filas = [
    fila('Lo que le deja cada venta', fmtM(m.ganMin, mon), fmtM(ev.ganVenta, mon), ev.ganVenta >= m.ganMin, `para que el número no pase de ${fmtN(ev.tope)}`),
    fila('Publicidad del lanzamiento', m.pubMin !== null ? fmtM(m.pubMin, mon) : 'no alcanza', fmtM(ev.publicidad, mon), m.pubMin !== null ? ev.publicidad >= m.pubMin : false, 'para que lleguen aunque salga lo mínimo'),
  ];
  if (m.stockMin !== null) filas.push(fila('Unidades separadas (tope de cupones)', fmtN(m.stockMin), ev.stock !== null ? fmtN(ev.topeCup) : '—', ev.stock !== null ? ev.topeCup >= m.stockMin : null, `llegan ${fmtN(ev.llegadaPct * 100)} de cada 100 que reservan`));
  if (m.atiendeMin !== null) filas.push(fila('Personas que atiende por día de canje', fmtN(m.atiendeMin), ev.atiendeDia !== null ? fmtN(ev.atiendeDia) : '—', ev.atiendeDia !== null ? ev.atiendeDia >= m.atiendeMin : null, `en lo esperado, con ${ev.diasCanje} día${ev.diasCanje > 1 ? 's' : ''} de canje`));
  filas.push(fila('Plata para empezar', fmtM(m.inicio, mon), caja > 0 ? fmtM(caja, mon) : '—', caja > 0 ? caja >= m.inicio : null, 'la primera mitad más la publicidad'));
  return `<section class="tarjeta">${cab}
    <div class="tabla-envoltura"><table class="tabla-minimo"><thead><tr><th>Para aceptarlo necesita</th><th class="n">Lo mínimo</th><th class="n">Este cliente</th><th></th></tr></thead><tbody>${filas.join('')}</tbody></table></div>
    <p class="texto">«Lo mínimo» es el punto donde el número de tu garantía no pasa de ${fmtN(ev.tope)}, los clientes llegan aunque salga lo mínimo y la tienda puede atender a todos. Si con la publicidad mínima cada venta le deja menos de ${esc(fmtM(m.ganMinConMinimo, mon))}, elige con él otro producto.</p></section>`;
}
// Medidores del día del canje
function medidorLanz(ic, col, tit, val, tope, uni, txt, excederEsBueno) {
  if (!(tope > 0)) return `<div class="medidor"><div class="med-cab"><b>${icoSq(ic, col)}${esc(tit)}</b>${etqEst('ojo', 'Falta saber')}</div><p class="texto">${txt}</p></div>`;
  const pasa = val > tope + 1e-9, est = !pasa ? 'ok' : excederEsBueno ? 'ok' : val <= tope * 1.15 ? 'ojo' : 'no';
  const etq = !pasa ? 'Le alcanza' : excederEsBueno ? 'Se agota' : 'No le alcanza';
  const tot = Math.max(val, tope, 1) * 1.08, w = x => clamp(x / tot * 100, 0, 100);
  return `<div class="medidor"><div class="med-cab"><b>${icoSq(ic, col)}${esc(tit)}</b>${etqEst(est, etq)}</div>
    <div class="med-barra" role="img" aria-label="${esc(`Lo esperado ${f1(val)} ${uni}; el tope es ${fmtN(tope)}`)}"><i class="m-plan m-${est}" style="left:0;width:${w(val)}%;border-radius:999px 0 0 999px"></i><i class="m-tope" style="left:${w(tope)}%"></i></div>
    <div class="med-ley"><span><i class="l-plan m-${est}"></i>Lo esperado: ${esc(f1(val))} ${esc(uni)}</span><span><i class="l-tope"></i>El tope: ${esc(fmtN(tope))}</span></div>
    <p class="texto">${txt}</p></div>`;
}
function htmlMedidoresCanje(ev) {
  const E = ev.escenarios, m = E.meta, local = ev.ads.objetivo === 'local', out = [];
  const reservasSin = ev.ads.resultados, llegDia = (m.llegadas + m.sinAtender) / ev.diasCanje;
  if (local) {
    out.push(medidorLanz('regalo', 'pink', 'Cupones', reservasSin, ev.topeCup, 'reservas', ev.topeCup ? (reservasSin > ev.topeCup ? `Pedirían unos ${esc(f1(reservasSin))} cupones y el tope es ${esc(fmtN(ev.topeCup))}: se acaban. Anúncialo, es escasez de verdad.` : `Se pedirían unos ${esc(f1(reservasSin))} de ${esc(fmtN(ev.topeCup))} cupones.`) : 'Falta saber cuántas unidades separa: es el tope de cupones.', true));
    out.push(medidorLanz('casa', 'teal', 'Atender en el canje', llegDia, ev.atiendeDia, 'por día', ev.atiendeDia ? `Llegarían unas ${esc(f1(llegDia))} personas por día, en ${ev.diasCanje} día${ev.diasCanje > 1 ? 's' : ''} de canje. Puede atender bien ${esc(fmtN(ev.atiendeDia))}.${m.sinAtender > 0 ? ` <b>Unas ${esc(f1(m.sinAtender))} se irían sin atender:</b> ya las quité de la cuenta.` : ''}` : `Llegarían unas ${esc(f1(llegDia))} personas por día. Pregúntale cuántas puede atender bien.`, false));
  }
  if (ev.stock !== null) out.push(medidorLanz('bolsa', 'green', 'Stock', m.compras, ev.stock, 'compras', `Comprarían unas ${esc(f1(m.compras))} de las ${esc(fmtN(ev.stock))} unidades separadas${m.compras < ev.stock - 0.5 ? `: le quedan ${esc(fmtN(ev.stock - m.compras))} para vender después` : ''}.`, false));
  const msj = m.reservas * 2 / (ev.diasCanje + 1), capMsg = n(estado.prospecto.capacidad.mensajesDia);
  if (local) out.push(medidorLanz('chat', 'blue', 'Recordatorios', msj, capMsg, 'por día', capMsg > 0 ? `2 recordatorios a mano por reserva: unos ${esc(f1(msj))} mensajes por día cerca del canje. Pueden mandar bien ${esc(fmtN(capMsg))}.` : `Serían unos ${esc(f1(msj))} mensajes por día cerca del canje. Pregúntale cuántos pueden mandar bien.`, false));
  return `<div class="medidores">${out.join('')}</div>`;
}
function htmlCanjeLanz(r) {
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('casa', 'teal')}¿Le alcanza el día del canje?</h3><p>en lo esperado</p></div>
    ${htmlMedidoresCanje(r.ev)}
    <p class="texto">En un lanzamiento la gente llega junta. Si se acaba el stock o hay filas, se van molestos: por eso lo reviso antes de prometer.</p></section>`;
}
function htmlCalendarioLanz(r) {
  const ev = r.ev, L = estado.prospecto.lanzamiento, mon = ev.R.moneda, f = ev.fecha;
  const usd = ev.publicidad / (ev.ads.tc || TC_DEF), grito = ev.publicidad / 2;
  let cab;
  if (!f) cab = `<p class="texto">${ICO.ojo} Todavía no hay fecha. Elige con él una fecha fuerte: sin fecha no hay urgencia de verdad.</p><div><button class="btn-g btn-chico" type="button" data-ir-clave="lanzamiento.fecha" data-ir-paso2="7">Elegir la fecha ›</button></div>`;
  else {
    const d = ev.diasHasta, limite = ev.cierraHasta, dl = diasEntre(ev.hoy, limite);
    cab = `<div class="mesa">
      <div class="mesa-item"><span class="kicker">Canje en la tienda</span><span class="grande">${esc(fmtDiaCorto(f))}</span><p>${!vacio(L.porque) ? `Por «${esc(String(L.porque).trim())}». ` : ''}Faltan ${fmtN(Math.max(0, d))} días.</p></div>
      <div class="mesa-item"><span class="kicker">Cierra a más tardar</span><span class="grande">${esc(fmtDiaCorto(limite))}</span><p>${dl > 0 ? `Te quedan ${fmtN(dl)} días para cobrar la primera mitad.` : dl === 0 ? 'Es hoy: cierra en esta llamada.' : 'Ya pasó: hay que mover la fecha o apretar el calendario.'}</p></div>
      <div class="mesa-item"><span class="kicker">El grito</span><span class="grande">${esc(fmtM(grito, mon))}</span><p>la mitad de la publicidad, en los 3 días antes del canje (unos USD ${fmtN(usd / 2 / 3, 1)} por día).</p></div></div>`;
  }
  const etapas = `<ol class="calendario">${ev.calendario.map(e => `<li><span class="cal-mes">${esc(e.desde ? rangoFechas(e.desde, e.al) : e.d === e.hasta ? `Día ${e.d}` : `Días ${e.d} a ${e.hasta}`)}</span><b>${esc(e.t)}</b><p>${esc(e.x)}</p></li>`).join('')}</ol>`;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('calendario', 'red')}El calendario</h3><p>14 días de videos y el canje</p></div>${cab}${etapas}
    ${!f ? '<p class="nota-eje">Los días se cuentan desde el canje (día 0).</p>' : ''}</section>`;
}
function htmlMetaLanz(r) {
  const ev = r.ev, md = ev.metaDueno, mon = ev.R.moneda;
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('objetivo', 'blue')}Su meta y el lanzamiento</h3></div>`;
  if (!md) return `<section class="tarjeta">${cab}<p class="texto">Pregúntale qué quiere lograr: así le muestras cuánto lo acerca un lanzamiento y cuánto el plan de cada mes.</p><div><button class="btn-g btn-chico" type="button" data-ir-clave="meta.valor" data-ir-paso2="2">Preguntarle ›</button></div></section>`;
  const v = x => md.tipo === 'clientes' ? `${f1(x)} clientes` : fmtM(x, mon);
  const quiere = md.tipo === 'clientes' ? `${f1(md.quiere)} clientes nuevos al mes` : md.tipo === 'ganancia' ? `ganar ${fmtM(md.quiere, mon)} más al mes` : `vender ${fmtM(md.quiere, mon)} más al mes`;
  const barra = (t, x, c) => { const est = estCob(c); return `<div class="barra-fila"><div class="eti">${t}<small>${c >= 9.99 ? 'mucho más' : `${fmtN(c * 100)} de cada 100`}</small></div><div class="pista"><i style="width:${clamp(c, 0, 1) * 100}%;background:var(--${est === 'ok' ? 'green' : est === 'ojo' ? 'orange' : 'red'})"></i></div><div class="val" style="font-size:14px">${esc(v(x))}</div></div>`; };
  return `<section class="tarjeta">${cab}<p class="meta-titulo">Quiere ${esc(quiere)}</p>
    <div class="barras ancho">${barra('El lanzamiento', md.daLanz, md.cobLanz)}${ev.plan.ofrecer ? barra('El plan de cada mes', md.daPlan, md.cobPlan) : ''}</div>
    <p class="texto">El lanzamiento da ${esc(v(md.daLanz))} en unas 2 semanas, en lo esperado.${ev.plan.ofrecer ? ` Con el plan de cada mes, un lanzamiento chico al mes, serían unos ${esc(v(md.daPlan))} al mes.` : ''} ${md.cobPlan >= 0.8 || md.cobLanz >= 0.8 ? 'Le alcanza para su meta.' : 'Para su meta haría falta más publicidad o un producto que deje más: díselo antes de cobrar.'}</p></section>`;
}
// Lo que se ve del embudo: con los topes del escenario esperado
function adsMostrado(ev) { const m = ev.escenarios.meta; return { ...ev.ads, resultados: m.reservas, llegadas: m.llegadas, clientes: m.compras, calificados: m.interesados }; }
function htmlEmbudoLanz(r, compacto) {
  const ev = r.ev, a = adsMostrado(ev), mon = ev.R.moneda, E = ev.escenarios, m = E.meta;
  const tile = (k, v, s) => `<div class="mesa-item"><span class="kicker">${esc(k)}</span><span class="grande">${esc(v)}</span><p>${esc(s)}</p></div>`;
  const local = a.objetivo === 'local';
  const tiles = [];
  if (local) tiles.push(tile('Cada persona que llega', m.llegadas > 0 ? fmtM(ev.publicidad / m.llegadas, mon) : '—', m.reservas > 0 ? `Y cada reserva: ${fmtM(ev.publicidad / m.reservas, mon)}.` : ''));
  tiles.push(tile('Cada cliente', m.compras > 0 ? fmtM(ev.publicidad / m.compras, mon) : '—', 'Lo que cuesta en publicidad que alguien compre.'));
  if (ev.ganVenta > 0) tiles.push(tile('La publicidad se paga con', `${f1(ev.publicidad / ev.ganVenta)} ventas`, `Cada venta de la promo le deja ${fmtM(ev.ganVenta, mon)}.`));
  const cab = `<div class="ads-cab"><span class="etq azul">${esc(a.nombrePlataforma)}</span><span class="etq">${esc(a.objetivoNombre)}</span>${a.fuente === 'real' ? '<span class="etq ok">con sus datos reales</span>' : '<span class="etq">promedios de mercado</span>'}</div>
    <p class="texto">Con <b>${esc(fmtM(ev.publicidad, mon))}</b> (unos USD ${fmtN(a.usd)}, al cambio de Bs ${fmtN(a.tc, 2)}), en todo el lanzamiento, en lo esperado:</p>`;
  const rango = `<p class="texto">Compran: lo mínimo <b>${f1(E.piso.compras)}</b> · lo esperado <b>${f1(m.compras)}</b> · si sale muy bien <b>${f1(E.techo.compras)}</b>.${m.agotado ? ` Se acaban los cupones (el tope es ${fmtN(ev.topeCup)}).` : ''}</p>`;
  if (compacto) return cab + htmlFunnel(a) + rango + `<div class="mesa">${tiles.join('')}</div>`;
  return cab + htmlFunnel(a) + rango + `<div class="mesa">${tiles.join('')}</div>`
    + (local ? `<p class="texto"><b>Trabajo que esto le da:</b> confirmar cada reserva y mandar 2 recordatorios a mano (unos ${fmtN(m.reservas * 2)} mensajes), y atender a unas ${f1(m.llegadas)} personas en ${ev.diasCanje} día${ev.diasCanje > 1 ? 's' : ''}.</p>` : `<p class="texto"><b>Trabajo que esto le da:</b> ${esc(textoTrabajoAds(a))}</p>`);
}
function htmlArmadoLanz(r) {
  const ev = r.ev, a = ev.ads, mon = ev.R.moneda, p = estado.prospecto, ciudad = p.negocio.ciudad || 'su ciudad';
  const usd = ev.publicidad / (a.tc || TC_DEF), usdDiaGrito = usd / 2 / 3;
  const filas = [];
  for (const x of a.partes) filas.push([`${x.nombre}${a.partes.length > 1 ? ` (${fmtN(x.sh * 100)} de cada 100 Bs)` : ''}`, `Campaña: «${x.campana}».`]);
  filas.push(['Cómo gastar la plata', `La mitad (${fmtM(ev.publicidad / 2, mon)}) en los 3 días del grito: unos USD ${fmtN(usdDiaGrito, 1)} por día${usdDiaGrito >= 20 ? ' con TikTok Ads' : ', con «Promocionar» desde la app (el mínimo de TikTok Ads es USD 20 por día)'}. La otra mitad, de a poco desde el primer video, sobre lo que más gusta.`]);
  filas.push(['A quién mostrarlo', a.alcanceNegocio === 'barrio' ? 'Solo a gente que vive o trabaja a 3–5 km de la tienda, en la edad de su cliente.' : a.alcanceNegocio === 'ciudad' ? `A toda ${ciudad}, a mano por ubicación, sin intereses.` : a.alcanceNegocio === 'pais' ? 'A todo Bolivia, solo donde llegan sus envíos.' : 'A dueños y encargados de negocios, con un formulario que filtre.']);
  filas.push(['Videos', '9 piezas: 3 cuerpos con 3 ganchos cada uno. El gancho que gane en los primeros días se queda con la plata del grito.']);
  filas.push(['Cómo medir', 'El gancho, con unas 3.000 vistas por pieza (cuántos siguen a los 3 segundos). El costo por cupón, con unos 10 cupones. Cada video se juzga por lo que vendió, no por los «me gusta». El ganador no se toca en el grito.']);
  if (ev.fecha) filas.push(['Cuándo', `Primer video el ${fmtFecha(masDias(ev.fecha, -14))}; el grito del ${fmtFecha(masDias(ev.fecha, -3), false)} al ${fmtFecha(masDias(ev.fecha, -1), false)}; canje el ${fmtFecha(ev.fecha)}.`]);
  const sup = [
    ['Dólar', `Bs ${fmtN(a.tc, 2)} por dólar`, n(p.anuncios.tc) > 0 ? 'dato del cliente' : 'Banco Central, nov. 2026'],
    ['Mil vistas pagadas cuestan', fmtM(a.cpmBs, mon), n(p.anuncios.cpmReal) > 0 ? 'dato del cliente' : 'promedio aproximado'],
  ];
  if (a.objetivo === 'local') {
    sup.push(['De cada 100 personas que lo ven, reservan', fmtN(a.alcance > 0 ? a.resultados / a.alcance * 100 : 0, 2), n(p.anuncios.costoResultadoReal) > 0 ? 'calculado con su costo real' : 'promedio aproximado']);
    sup.push(['De cada 100 que reservan, llegan', fmtN(ev.llegadaPct * 100), n(p.lanzamiento.llegadaPct) > 0 ? 'dato del cliente' : 'tu supuesto (sin medir)']);
    sup.push(['De cada 100 que llegan, compran', fmtN(a.llegadas > 0 ? a.clientes / a.llegadas * 100 : 0), ev.compraPct > 0 ? 'dato del cliente' : 'promedio aproximado']);
  }
  return `<div class="tabla-envoltura"><table class="tabla-armado"><tbody>${filas.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>
    ${a.avisos.length ? `<ul class="avisos">${a.avisos.map(x => `<li>${ICO.ojo}<span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
    <details><summary class="btn-borde" style="display:inline-flex;cursor:pointer">De dónde salen estos números</summary>
      <div class="tabla-envoltura"><table><thead><tr><th>Supuesto</th><th class="n">Valor</th><th>Fuente</th></tr></thead><tbody>${sup.map(([k, v, f]) => `<tr><td>${esc(k)}</td><td class="n">${esc(v)}</td><td><span class="etq ${f.startsWith('dato') || f.startsWith('calculado') ? 'ok' : f.startsWith('tu') ? 'ojo' : ''}">${esc(f)}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="texto">Son promedios aproximados y prudentes para Bolivia. «Llegan 1 de cada 2» es tu supuesto hasta tener 10 reservas contadas: cuando tengas tus números, cámbialo en Ajustes.</p></details>`;
}
function htmlAnunciosLanz(r) {
  return `<section class="tarjeta" id="sec-anuncios"><div class="tarjeta-cab"><h3>${icoSq('megafono', 'orange')}La publicidad del lanzamiento</h3><p>de las vistas a la compra</p></div>${htmlEmbudoLanz(r, false)}<h4 class="sub-titulo">${icoSq('herramienta', 'gray')}Cómo armarla</h4>${htmlArmadoLanz(r)}</section>`;
}
function htmlQuedaLanz(r) {
  const ev = r.ev, m = ev.escenarios.meta, lista = Math.round(m.reservas), noCompraron = Math.max(0, Math.round(m.reservas - m.compras));
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('gema', 'oro')}Lo que le queda después</h3><p>aunque no lo cobres aparte</p></div>
    <div class="mesa">
      <div class="mesa-item"><span class="kicker">Los videos que venden</span><span class="grande">9</span><p>El que ganó se vuelve a usar en la próxima promo.</p></div>
      <div class="mesa-item"><span class="kicker">Su lista</span><span class="grande">${fmtN(lista)}</span><p>personas con su celular que reservaron. ${fmtN(noCompraron)} todavía no compraron: la próxima promo arranca con ellas.</p></div>
      <div class="mesa-item"><span class="kicker">Su perfil armado</span><span class="grande">✓</span><p>Con el link del cupón y los videos fijados.</p></div>
    </div>
    <p class="texto">Úsalo en la llamada: «aunque no vendieras nada, te quedas con los videos, el perfil y la lista».</p></section>`;
}
function htmlPlataLanz(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda, ks = ['piso', 'meta', 'techo'];
  const fila = (t, fn) => `<tr><td>${esc(t)}</td>${ks.map(k => `<td class="n">${fn(E[k])}</td>`).join('')}</tr>`;
  const tabla = `<div class="tabla-envoltura"><table><thead><tr><th></th><th class="n">Lo mínimo</th><th class="n">Lo esperado</th><th class="n">Muy bien</th></tr></thead><tbody>
    ${fila('Reservan el cupón', e => f1(e.reservas))}
    ${ev.ads.objetivo === 'local' ? fila('Llegan con su cupón', e => f1(e.llegadas)) : fila(ev.unidadGar[1][0].toUpperCase() + ev.unidadGar[1].slice(1), e => f1(e.unidades))}
    ${fila('Compran', e => f1(e.compras))}
    ${fila('Vende', e => esc(fmtM(e.ventasBs, mon)))}
    ${fila('Le deja', e => esc(fmtM(e.ganLanz, mon)))}
    ${fila('Pone (servicio + publicidad)', e => esc(fmtM(e.inv, mon)))}
    ${fila('Por cada Bs 1 que pone, le vuelven', e => `Bs ${fmtN(e.roiLanz, 1)}`)}
    ${fila('¿Llegan los de la garantía?', e => e.llega ? 'Sí' : 'No')}
    ${fila('Te paga', e => esc(fmtM(e.cobro, mon)))}
  </tbody></table></div>`;
  const m = E.meta, despues = Math.max(0, m.gan1 - m.ganLanz);
  const pasos = [
    ['Al cerrar', `Te paga la primera mitad: ${fmtM(ev.mitad1, mon)}.`],
    ['Del primer video al grito', `Paga la publicidad, ${fmtM(ev.publicidad, mon)}, directo desde su cuenta.`],
    ['En el canje', `Vende unos ${fmtM(m.ventasBs, mon)}; le deja ${fmtM(m.ganLanz, mon)}.`],
    ['Cuando llegan los ' + (Number.isFinite(ev.N) ? fmtN(ev.N) : '—'), `Te paga la segunda mitad (${fmtM(ev.mitad2, mon)}) con lo que ya vendió.`],
  ];
  if (despues > 0.5) pasos.push(['Después', `Los que vuelven a comprar en el año le dejan ${fmtM(despues, mon)} más.`]);
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('monedas', 'green')}Su plata, en el lanzamiento</h3><p>tres escenarios</p></div>${tabla}
    <h4 class="sub-titulo">${icoSq('reloj', 'orange')}Cómo se mueve su plata</h4>
    <ol class="estrategia">${pasos.map(([t, x], i) => `<li><span class="nro-paso">${i + 1}</span><div><h4>${esc(t)}</h4><p>${esc(x)}</p></div></li>`).join('')}</ol>
    <p class="texto">Lo más que pone de su bolsillo antes de vender: <b>${esc(fmtM(ev.inicio, mon))}</b> (la primera mitad y la publicidad). La segunda mitad la paga cuando ya llegaron sus clientes.</p></section>`;
}
function htmlPlanMesLanz(r) {
  const ev = r.ev, P = ev.plan, mon = ev.R.moneda;
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('repetir', 'purple')}Después: el plan de cada mes</h3><p>un lanzamiento chico al mes</p></div>`;
  if (!P.ofrecer) return `<section class="tarjeta">${cab}<p class="texto">No lo vas a ofrecer (paso 8). Lo recurrente es lo que te da tranquilidad: piénsalo antes de la reunión de resultados.</p></section>`;
  const pi = P.esc.piso, me = P.esc.meta;
  return `<section class="tarjeta">${cab}
    <div class="mesa">
      <div class="mesa-item"><span class="kicker">Cada 4 semanas</span><span class="grande">${esc(fmtM(P.precio, mon))}</span><p>o ${esc(fmtM(P.precioComp, mon))} con ${P.meses} meses de compromiso. Más su publicidad: ${esc(fmtM(P.pub, mon))}.</p></div>
      <div class="mesa-item"><span class="kicker">Compran al mes</span><span class="grande">${f1(me.compras)}</span><p>en lo esperado (lo mínimo: ${f1(pi.compras)}).</p></div>
      <div class="mesa-item"><span class="kicker">Le deja al mes</span><span class="grande">${esc(fmtM(me.gan, mon))}</span><p>${fmtN(me.roiC, 1)} veces lo que pone con compromiso (lo mínimo: ${fmtN(pi.roiC, 1)}).</p></div>
    </div>
    <p class="texto">Incluye 9 piezas (3 cuerpos con 3 ganchos), una sesión de grabación, la pauta chica a cada versión desde su publicidad y la reunión de resultados. Se ofrece el día que llega el cliente que completa la garantía, en la misma reunión del cobro y el testimonio.</p>
    <p class="texto"><b>Para ti:</b> 13 cobros al año (cada 4 semanas): ${esc(fmtM(P.precio * 13, mon))}, o ${esc(fmtM(P.precioComp * 13, mon))} al precio con compromiso.</p></section>`;
}
function htmlPrecioLanz(r) {
  const ev = r.ev, mon = ev.R.moneda, E = ev.escenarios;
  const hora = ev.horas > 0 ? ev.precio / ev.horas : NaN;
  const parte = E.meta.ganLanz > 0 ? ev.precio / E.meta.ganLanz : NaN;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('herramienta', 'gray')}El servicio y el precio</h3><p>${esc(fmtM(ev.precio, mon))} por lanzamiento</p></div>
    <div>${LANZ_INCLUYE.map(([t, x]) => `<div class="servicio-fila">${ICO.ok}<h4>${esc(t)}</h4><p>${esc(x)}</p></div>`).join('')}</div>
    <p class="texto"><b>Cómo se cobra:</b> ${esc(fmtM(ev.mitad1, mon))} para empezar y ${esc(fmtM(ev.mitad2, mon))} cuando lleguen los ${Number.isFinite(ev.N) ? fmtN(ev.N) : '—'} de la garantía. Son unas ${fmtN(ev.horas)} horas tuyas${Number.isFinite(hora) ? ` (${esc(fmtM(hora, mon))} por hora)` : ''}.</p>
    ${Number.isFinite(parte) ? `<p class="texto"><b>Lo que vale para él:</b> en lo esperado el lanzamiento le deja ${esc(fmtM(E.meta.ganLanz, mon))}; tu precio es ${fmtN(parte * 100)} de cada 100 de eso.${parte < 0.2 ? ' Si cierras casi siempre, es señal de que estás barato: sube 20% cada 5 lanzamientos cobrados.' : ''}</p>` : ''}</section>`;
}
function htmlMasLanz(r) {
  const ev = r.ev, mon = ev.R.moneda, E = ev.escenarios, a = ev.ads, mt = ev.foco.mt, v = ev.venta;
  const tabla = [...r.an.lista].sort((x, y) => y.puntaje - x.puntaje).map(x => { const pl = r.porLinea.find(y => y.id === x.id); return `<tr class="${x.id === r.focoId ? 'destacada' : ''}"><td><b>${esc(x.nombre)}</b><br><span style="color:var(--text-2);font-size:13px">${esc(razonesLinea(x).join(' · '))}</span></td><td class="n">${x.completa ? esc(fmtM(x.mt.ticket * x.mt.m, mon)) : '—'}</td><td>${etqVer(pl ? pl.veredicto : 'incompleta')}</td></tr>`; }).join('');
  const pasos = [
    ['Lo que le deja cada venta', 'El precio de la promo, menos lo que le cuesta el producto y el regalo.', `${fmtM(v.precio, mon)} − ${fmtM(v.costo, mon)} (producto)${v.regalo > 0 ? ` − ${fmtM(v.regalo, mon)} (regalo)` : ''} = ${fmtM(v.gan, mon)}`],
    ['El número de la garantía', 'Lo que pone (tu servicio + la publicidad) entre lo que le deja cada venta, hacia arriba.', `(${fmtM(ev.precio, mon)} + ${fmtM(ev.publicidad, mon)}) ÷ ${fmtM(v.gan, mon)} = ${Number.isFinite(ev.N) ? fmtN(ev.N) : '—'} · tope ${fmtN(ev.tope)}`],
    ['Cuántos reservan', `La publicidad en ${a.nombrePlataforma}, con el objetivo «${a.objetivoNombre}».`, `${fmtM(ev.publicidad, mon)} = USD ${fmtN(a.usd)} → ${fmtN(a.vistas)} vistas → ${fmtN(a.alcance)} personas → ${f1(a.resultados)} ${a.resultadoNombre}`],
    ['Cuántos llegan y compran', 'El cupón tiene día y hora y se recuerda a mano.', `Llegan ${fmtN(ev.llegadaPct * 100)} de cada 100 que reservan → ${f1(a.llegadas)}\nCompran ${fmtN(a.llegadas > 0 ? a.clientes / a.llegadas * 100 : 0)} de cada 100 que llegan → ${f1(a.clientes)}`],
    ['Los topes', 'Las reservas, hasta el tope de cupones; los que llegan, hasta lo que puede atender; las compras, hasta su stock.', `Tope de cupones: ${ev.topeCup !== null ? fmtN(ev.topeCup) : 'sin dato'} · atiende ${ev.capCanje !== null ? fmtN(ev.capCanje) + ' en el canje' : 'sin dato'} · stock ${ev.stock !== null ? fmtN(ev.stock) : 'sin dato'}\nLo esperado queda en: ${f1(E.meta.reservas)} reservan → ${f1(E.meta.llegadas)} llegan → ${f1(E.meta.compras)} compran`],
    ['Los tres escenarios', 'Lo mínimo es 2/3 de lo esperado y lo mejor, 4/3, antes de los topes.', `Llegan: ${f1(E.piso.unidades)} · ${f1(E.meta.unidades)} · ${f1(E.techo.unidades)}`],
    ['Cuánto gana él', `Lo que le dejan las compras del lanzamiento contra lo que pone. Si no llegan los de la garantía, pone solo la primera mitad.${v.g1 > v.gan + 0.5 ? ' Aparte, lo que dejan los que vuelven a comprar.' : ''}`, `Lo mínimo: ${fmtM(E.piso.ganLanz, mon)} ÷ ${fmtM(E.piso.inv, mon)} = ${fmtN(E.piso.roiLanz, 1)}× · lo esperado: ${fmtN(E.meta.roiLanz, 1)}×`],
  ];
  return `<div class="mas">
    <details><summary>${icoSq('gema', 'oro')}Todo lo que vende</summary><div class="cuerpo"><div class="tabla-envoltura"><table><thead><tr><th>Producto</th><th class="n">Le deja por venta</th><th>Si el lanzamiento es de esto</th></tr></thead><tbody>${tabla}</tbody></table></div></div></details>
    <details><summary>${icoSq('lista', 'indigo')}Cómo saqué estos números</summary><div class="cuerpo"><ol class="pasos-calc">${pasos.map(([t, x, f]) => `<li><div><h4>${esc(t)}</h4><p>${esc(x)}</p>${f ? `<div class="formula">${esc(f)}</div>` : ''}</div></li>`).join('')}</ol></div></details>
    <details id="det-ia"><summary>${icoSq('chispa', 'purple')}Segunda opinión de Claude</summary><div class="cuerpo" id="r-ia">${htmlIA(r)}</div></details>
  </div>`;
}

// ---------- Hojas de detalle ----------
const TIT_DETALLE_LANZ = { prometes: 'El número de la garantía', cobras: 'Lo que cobras por el lanzamiento', gana: '¿Cuánto gana él?', garantia: 'Tu segunda mitad' };
function detallePrometesLanz(r) {
  const ev = r.ev, mon = ev.R.moneda;
  return `<div class="grande-frase"><span>Le prometes</span><b class="enorme">${Number.isFinite(ev.N) ? fmtN(ev.N) : '—'}</b><span>${esc(ev.unidadGar[1])}</span></div>
    ${htmlNumeroGarantia(ev, false)}
    <p class="texto">Es lo que necesita para recuperar lo que pone. ${ev.ads.objetivo === 'local' ? '<b>Se cuenta cada cupón validado en su tienda, compre o no:</b> traerlos depende de ti (videos, publicidad y cupón); lo que pasa adentro (precio, atención, stock) depende de él.' : `Con «${esc(ev.ads.objetivoNombre)}» se cuentan ${esc(ev.unidadGar[1])}.`}</p>
    <p class="texto"><b>La garantía:</b> «${esc(fraseGarantiaLanz(ev))}» Si en su fecha no llegan, ${ev.diasExtra} días más con el video ganador, sin costo.</p>
    <p class="texto">Tu tope es ${fmtN(ev.tope)}: si sale más, elige con él otro producto antes de ofrecer la garantía. Cada venta tiene que dejarle al menos ${esc(fmtM(Math.ceil((ev.precio + ev.publicidad) / ev.tope), mon))}.</p>`;
}
function detalleCobrasLanz(r) {
  const ev = r.ev, mon = ev.R.moneda;
  return `<div class="grande-frase"><span>Le cobras</span><b class="enorme">${esc(fmtM(ev.precio, mon))}</b><span>por lanzamiento, en dos mitades</span></div>
    <div class="mesa"><div class="mesa-item"><span class="kicker">Para empezar</span><span class="grande">${esc(fmtM(ev.mitad1, mon))}</span><p>al cerrar, antes de la sesión de arranque.</p></div>
      <div class="mesa-item"><span class="kicker">Cuando lleguen los ${Number.isFinite(ev.N) ? fmtN(ev.N) : '—'}</span><span class="grande">${esc(fmtM(ev.mitad2, mon))}</span><p>la paga con lo que ya vendió. Si no llegan (y cumplió sus 5 cosas), no la paga.</p></div></div>
    <h3 class="h-det">Lo que incluye</h3><ul class="lista-simple">${LANZ_INCLUYE.map(([t, x]) => `<li><b>${esc(t)}.</b> ${esc(x)}</li>`).join('')}</ul>
    <p class="texto">La publicidad no va en tu precio: la paga él directo, desde su cuenta (${esc(fmtM(ev.publicidad, mon))} en este lanzamiento).</p>
    ${ev.plan.ofrecer ? `<h3 class="h-det">Y después</h3><p class="texto">El día que se completa la garantía le ofreces el plan de cada mes: ${esc(fmtM(ev.plan.precio, mon))} cada 4 semanas, o ${esc(fmtM(ev.plan.precioComp, mon))} con ${ev.plan.meses} meses de compromiso.</p>` : ''}`;
}
function detalleGanaLanz(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda;
  const esc3 = [['piso', 'Lo mínimo', 'var(--s2)'], ['meta', 'Lo esperado', 'var(--s1)'], ['techo', 'Si sale muy bien', 'var(--s3)']];
  const max = Math.max(...esc3.map(([k]) => Math.max(E[k].ganLanz, E[k].inv)), 1);
  const grupos = esc3.map(([k, t, col]) => `<div class="grupo-barras"><h4>${t} <span class="etq ${E[k].roiLanz >= 1.2 ? 'ok' : E[k].roiLanz >= 1 ? 'ojo' : 'no'}">${fmtN(E[k].roiLanz, 1)}×</span></h4>${barraH('Pone', E[k].inv, max, 'var(--gray)', fmtM(E[k].inv, mon))}${barraH('Le deja', E[k].ganLanz, max, col, fmtM(E[k].ganLanz, mon))}</div>`).join('');
  const vuelve = ev.venta.g1 > ev.ganVenta + 0.5;
  return `<div class="grande-frase"><span>Por cada <b>Bs 1</b> que pone, le vuelven</span><b class="enorme">Bs ${fmtN(E.piso.roiLanz, 1)}</b><span>en el lanzamiento, si sale lo mínimo · Bs ${fmtN(E.meta.roiLanz, 1)} en lo esperado</span></div>
    <h3 class="h-det">Lo que pone y lo que le deja</h3><div class="grupos-barras">${grupos}</div>
    <p class="texto"><b>«Le deja»</b> es su ganancia: lo que le queda de cada venta después de pagar el producto y el regalo. Si no llegan los de la garantía, pone solo la primera mitad.${vuelve ? ` Aparte, los que vuelven a comprar en el año le dejan más: en lo esperado, ${esc(fmtM(E.meta.gan1, mon))} en total (${fmtN(E.meta.roi1, 1)}×).` : ''}</p>`;
}
function detalleGarantiaLanz(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda, g = estadoGarantia(ev);
  const qhacer = g[0] === 'ok' ? 'Puedes ofrecer la garantía tranquilo.' : g[0] === 'ojo' ? `Lo esperado alcanza, pero lo mínimo no. Te cubren los ${ev.diasExtra} días más con el video ganador.${ev.pubSegura !== null && ev.pubSegura > ev.publicidad ? ` Con ${fmtM(ev.pubSegura, mon)} de publicidad, llega aunque salga lo mínimo.` : ''}` : (ev.pubSegura !== null ? `Pídele ${fmtM(ev.pubSegura, mon)} de publicidad, o elige un producto que deje más por venta.` : 'Ni subiendo la publicidad llega: elige otro producto o arma un regalo más fuerte.');
  return `<div class="grande-frase"><span>Tu segunda mitad está</span><b class="enorme">${esc(g[1])}</b><span>${esc(g[2])}</span></div>
    ${htmlNumeroGarantia(ev, false)}
    <p class="texto"><b>Qué hacer:</b> ${esc(qhacer)}</p>
    <p class="texto">Lo que arriesgas: la segunda mitad, ${esc(fmtM(ev.mitad2, mon))}. La primera (${esc(fmtM(ev.mitad1, mon))}) la cobras igual.</p>`;
}
function abrirDetalleLanz(tipo) {
  const f = { prometes: detallePrometesLanz, cobras: detalleCobrasLanz, gana: detalleGanaLanz, garantia: detalleGarantiaLanz }[tipo];
  return [TIT_DETALLE_LANZ[tipo] || 'Detalle', f ? f(ultimo) : ''];
}

// ---------- Vista del cliente (le habla de tú) ----------
function htmlVistaClienteLanz(r) {
  const p = estado.prospecto, R = estado.reglas, mon = R.moneda, L = p.lanzamiento;
  const fecha = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
  const nom = p.negocio.nombre || 'tu negocio';
  const portada = `<header class="vc-portada"><p class="vc-marca">${esc(R.marca || '')}</p><h1>Tu lanzamiento</h1><p class="vc-para">para <b>${esc(nom)}</b> · ${esc(fecha)}</p>
    <p class="vc-sub">Una promo con fecha, calculada con los números de tu tienda y con promedios prudentes. Te muestro tres escenarios: el conservador, el esperado y el optimista.</p></header>`;
  if (!r || r.incompleto || !r.ev) return `<div class="vc">${portada}<section class="vc-sec"><p class="texto">Todavía faltan datos para armar la proyección: anota al menos cuánto paga un cliente (paso 3).</p></section></div>`;
  const ev = r.ev, E = ev.escenarios, a = adsMostrado(ev), md = ev.metaDueno, local = ev.ads.objetivo === 'local';
  // Hoy
  const hoyT = [];
  if (n(p.negocio.facturacion) > 0) hoyT.push(['Vendes al mes', fmtM(n(p.negocio.facturacion), mon)]);
  if (n(p.hoy.clientesMes) > 0) hoyT.push(['Clientes nuevos al mes', f1(n(p.hoy.clientesMes))]);
  if (n(p.hoy.interesadosMes) > 0) hoyT.push(['Te escriben o preguntan', fmtPorDia(n(p.hoy.interesadosMes) / ev.dias)]);
  const hoy = hoyT.length ? `<section class="vc-sec"><h2>Dónde estás hoy</h2><div class="vc-tiles">${hoyT.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div></section>` : '';
  // La promo
  const O = ev.venta.O, promoT = [['Producto', ev.foco.nombre], ['Precio de la promo', fmtM(ev.venta.precio, mon)]];
  if (O && O.bonos.length) promoT.push(['De regalo', O.bonos.map(b => b.nombre).filter(Boolean).join(' · ')]);
  if (ev.fecha) promoT.push(['Canje en tu tienda', `${fmtFecha(ev.fecha)}${ev.diasCanje > 1 ? ` y ${ev.diasCanje - 1 === 1 ? 'el día siguiente' : `${ev.diasCanje - 1} días más`}` : ''}`]);
  if (!vacio(L.porque)) promoT.push(['Por qué ese día', String(L.porque).trim()]);
  if (local && ev.topeCup !== null) promoT.push(['Cupones', `solo ${fmtN(ev.topeCup)}`]);
  const promo = `<section class="vc-sec"><h2>Tu promo</h2><div class="oferta-frase">${promoT.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
    ${O && O.deseo ? `<p class="texto">Lo que tu cliente se lleva: ${esc(O.deseo)}${O.tiempo ? `, ${esc(O.tiempo)}` : ''}.</p>` : ''}</section>`;
  // Meta
  const meta = md ? `<section class="vc-sec"><h2>Lo que quieres lograr</h2><p class="vc-grande-txt">${esc(md.tipo === 'clientes' ? `${f1(md.quiere)} clientes nuevos al mes` : md.tipo === 'ganancia' ? `Ganar ${fmtM(md.quiere, mon)} más al mes` : `Vender ${fmtM(md.quiere, mon)} más al mes`)}.</p>
    <p class="texto">Este lanzamiento te da ${esc(md.tipo === 'clientes' ? `${f1(md.daLanz)} clientes` : fmtM(md.daLanz, mon))} en unas 2 semanas, en lo esperado.${ev.plan.ofrecer ? ` Con un lanzamiento chico cada mes, serían unos ${esc(md.tipo === 'clientes' ? `${f1(md.daPlan)} clientes` : fmtM(md.daPlan, mon))} al mes.` : ''}</p></section>` : '';
  // Tres escenarios
  const tarjeta = k => {
    const e = E[k];
    return `<article class="vc-esc vc-${k}"><p class="vc-esc-tit">${NOMBRE_ESC[k][0]}</p><p class="vc-esc-sub">${NOMBRE_ESC[k][1]}</p>
      <div class="vc-roi"><b>${fmtN(e.roiLanz, 1)}×</b><span>por cada Bs 1 que inviertes, te vuelven Bs ${fmtN(e.roiLanz, 1)}</span></div>
      <dl>
        <div><dt>${local ? 'Llegan con su cupón' : 'Personas interesadas'}</dt><dd>${f1(e.unidades)}</dd></div>
        <div><dt>Compran</dt><dd>${f1(e.compras)}</dd></div>
        <div><dt>Ventas del lanzamiento</dt><dd>${esc(fmtM(e.ventasBs, mon))}</dd></div>
        <div><dt>Ganancia del lanzamiento</dt><dd>${esc(fmtM(e.ganLanz, mon))}</dd></div>
        <div><dt>Inversión (servicio + publicidad)</dt><dd>${esc(fmtM(e.inv, mon))}</dd></div>
        ${ev.venta.g1 > ev.ganVenta + 0.5 ? `<div><dt>Ganancia en el año, con los que vuelven</dt><dd>${esc(fmtM(e.gan1, mon))}</dd></div>` : ''}
      </dl></article>`;
  };
  const escenarios = `<section class="vc-sec"><h2>Tres escenarios</h2><p class="texto">«Ganancia» es lo que te queda después de pagar tu producto${ev.venta.regalo > 0 ? ' y el regalo' : ''}, no lo que te pagan.${ev.escenarios.meta.agotado ? ' Se acaban los cupones: por eso los escenarios se parecen. Es escasez de verdad.' : ''}</p>
    <div class="vc-escenarios">${tarjeta('piso')}${tarjeta('meta')}${tarjeta('techo')}</div></section>`;
  // Embudo
  const embudo = `<section class="vc-sec"><h2>Cómo llegamos a esos números</h2>
    <p class="texto">Con <b>${esc(fmtM(ev.publicidad, mon))}</b> en ${esc(a.nombrePlataforma)} (los pagas directo, desde tu cuenta), en todo el lanzamiento, en el escenario esperado:</p>
    ${htmlFunnel(a)}
    <p class="texto">${local && E.meta.llegadas > 0 ? `Cada persona que llega a tu tienda te cuesta unos <b>${esc(fmtM(ev.publicidad / E.meta.llegadas, mon))}</b> en publicidad` : ''}${E.meta.compras > 0 ? `${local && E.meta.llegadas > 0 ? ', y cada cliente, unos ' : 'Cada cliente te cuesta unos '}<b>${esc(fmtM(ev.publicidad / E.meta.compras, mon))}</b>.` : ''}</p></section>`;
  // Garantía
  const garantia = `<section class="vc-sec vc-destacado"><h2>Mi garantía</h2><p class="vc-grande-txt">${esc(fraseGarantiaLanz(ev))}</p>
    ${Number.isFinite(ev.N) ? `<div class="formula">${esc(`Lo que pones: ${fmtM(ev.precio, mon)} + ${fmtM(ev.publicidad, mon)} de publicidad = ${fmtM(ev.precio + ev.publicidad, mon)}\nCada venta de la promo te deja ${fmtM(ev.ganVenta, mon)}\n${fmtM(ev.precio + ev.publicidad, mon)} ÷ ${fmtM(ev.ganVenta, mon)} = ${fmtN(ev.N)} clientes`)}</div>` : ''}
    <p class="texto">${local ? 'Cuenta cada cupón validado en tu tienda, compres o no. ' : ''}Si en tu fecha no llegan, seguimos ${ev.diasExtra} días más con tu video ganador, sin costo. Vale si cumples tus 5 cosas.</p></section>`;
  // Calendario
  const cal = `<section class="vc-sec"><h2>El calendario</h2><ol class="calendario">${ev.calendario.filter(e => e.d >= -20).map(e => `<li><span class="cal-mes">${esc(e.desde ? rangoFechas(e.desde, e.al) : e.d === e.hasta ? `Día ${e.d}` : `Días ${e.d} a ${e.hasta}`)}</span><b>${esc(e.t)}</b><p>${esc(e.x.replace('Cobras la primera mitad.', 'Pagas la primera mitad.').replace('Sesión de arranque: sus accesos', 'Sesión de arranque: tus accesos'))}</p></li>`).join('')}</ol>
    ${ev.fecha && ev.cierraHasta ? `<p class="texto">Para llegar a tu fecha, empezamos a más tardar el <b>${esc(fmtFecha(ev.cierraHasta))}</b>.</p>` : ''}</section>`;
  // Incluye y necesito
  const incluye = `<section class="vc-sec"><h2>Lo que incluye</h2><ul class="vc-lista">${LANZ_INCLUYE.map(([t, x]) => `<li>${ICO.ok}<span><b>${esc(t)}.</b> ${esc(x)}</span></li>`).join('')}</ul>
    <div class="vc-tiles"><div><span>Mi servicio</span><b>${esc(fmtM(ev.precio, mon))}</b></div><div><span>Para empezar</span><b>${esc(fmtM(ev.mitad1, mon))}</b></div><div><span>Cuando lleguen tus clientes</span><b>${esc(fmtM(ev.mitad2, mon))}</b></div><div><span>Publicidad (la pagas tú, directo)</span><b>${esc(fmtM(ev.publicidad, mon))}</b></div></div></section>`;
  const nec = cincoCosas().map(([, t]) => t.replace('Sus accesos', 'Tus accesos').replace('Su publicidad', 'Tu publicidad').replace('desde su cuenta', 'desde tu cuenta').replace('Su stock', 'Tu stock'));
  const necesito = `<section class="vc-sec"><h2>Tus 5 cosas</h2><ul class="vc-lista">${nec.map(x => `<li>${ICO.ok}<span>${esc(x)}</span></li>`).join('')}</ul><p class="texto">Si cumples tus 5 cosas, la garantía vale.</p></section>`;
  // Lo que te queda y lo que sigue
  const m = E.meta;
  const queda = `<section class="vc-sec"><h2>Lo que te queda</h2><ul class="vc-lista">
    <li>${ICO.ok}<span><b>Los videos que venden.</b> El que gane lo vuelves a usar.</span></li>
    <li>${ICO.ok}<span><b>Tu lista.</b> Unas ${fmtN(Math.round(m.reservas))} personas con su celular que reservaron tu cupón: tu próxima promo arranca con ellas.</span></li>
    <li>${ICO.ok}<span><b>Tu perfil armado.</b> Con el link del cupón y tus mejores videos fijados.</span></li></ul></section>`;
  const sigue = ev.plan.ofrecer ? `<section class="vc-sec"><h2>Después: un lanzamiento chico cada mes</h2>
    <div class="vc-tiles"><div><span>Cada 4 semanas</span><b>${esc(fmtM(ev.plan.precio, mon))}</b></div><div><span>Con ${ev.plan.meses} meses de compromiso</span><b>${esc(fmtM(ev.plan.precioComp, mon))}</b></div><div><span>Te dejaría al mes (esperado)</span><b>${esc(fmtM(ev.plan.esc.meta.gan, mon))}</b></div></div>
    <p class="texto">9 videos nuevos, una sesión de grabación, la publicidad a cada versión y una reunión de resultados cada mes. Lo vemos el día que llegan tus clientes.</p></section>` : '';
  // Cómo lo calculamos
  const k = c => `linea:${ev.foco.id}:${c}`, mt = ev.foco.mt;
  const filas = [['Precio de la promo', fmtM(ev.venta.precio, mon), O && n(p.oferta.precio) > 0 ? ['Dato tuyo', 'ok'] : fuenteDato(k('ticket'))], ['De cada 100 Bs que cobras, te quedan', fmtN(mt.m * 100), fuenteDato(k('margen'), true)]];
  if (ev.venta.regalo > 0) filas.push(['Lo que te cuesta el regalo', fmtM(ev.venta.regalo, mon), ['Dato tuyo', 'ok']]);
  if (local) {
    filas.push(['De cada 100 que reservan, llegan', fmtN(ev.llegadaPct * 100), n(L.llegadaPct) > 0 ? ['Dato tuyo', 'ok'] : ['Supuesto prudente', '']]);
    filas.push(['De cada 100 que llegan, compran', fmtN(ev.ads.llegadas > 0 ? ev.ads.clientes / ev.ads.llegadas * 100 : 0), ev.compraPct > 0 ? ['Dato tuyo', 'ok'] : ['Promedio prudente', '']]);
    if (ev.stock !== null) filas.push(['Unidades separadas', fmtN(ev.stock), ['Dato tuyo', 'ok']]);
  }
  filas.push(['Dólar para pagar la publicidad', `Bs ${fmtN(ev.ads.tc, 2)}`, n(p.anuncios.tc) > 0 ? ['Dato tuyo', 'ok'] : ['Banco Central (nov. 2026)', '']]);
  filas.push(['Mil vistas pagadas cuestan', fmtM(ev.ads.cpmBs, mon), n(p.anuncios.cpmReal) > 0 ? ['Dato tuyo', 'ok'] : ['Promedio de mercado', '']]);
  const calculo = `<section class="vc-sec"><h2>Cómo lo calculamos</h2><p class="texto">Cada número tiene su origen. Donde no hay un dato tuyo, uso un promedio prudente: prefiero quedarme corto que prometerte de más.</p>
    <div class="tabla-envoltura"><table class="vc-tabla"><thead><tr><th>Dato</th><th class="n">Valor</th><th>De dónde sale</th></tr></thead><tbody>${filas.map(([t, v, [f, c]]) => `<tr><td>${esc(t)}</td><td class="n">${esc(v)}</td><td><span class="etq ${c}">${esc(f)}</span></td></tr>`).join('')}</tbody></table></div></section>`;
  const caso = R.casoReal !== false ? `<section class="vc-sec"><h2>Un caso real</h2><div class="vc-caso"><b>Sneaker Fashion</b><span>Tienda de tenis · La Paz</span><p>Invirtió <b>1.512 Bs</b> (servicio + publicidad) y vendió <b>21.100 Bs</b>: casi 14 Bs en ventas por cada 1 invertido. Más de 236 mil vistas en 5 videos.</p></div></section>` : '';
  const pie = `<footer class="vc-pie"><p>Estas son proyecciones hechas con tus números y promedios prudentes, no una promesa de ventas. Lo que te garantizo: ${Number.isFinite(ev.N) ? `que lleguen los ${fmtN(ev.N)} clientes que necesitas para recuperar lo que pusiste, o no me pagas la segunda mitad` : 'que lleguen los clientes que necesitas para recuperar lo que pusiste'}.</p><p>${esc(R.marca || '')} · ${esc(fecha)}</p></footer>`;
  return `<div class="vc">${portada}${hoy}${promo}${meta}${escenarios}${embudo}${garantia}${cal}${incluye}${necesito}${queda}${sigue}${calculo}${caso}${pie}</div>`;
}

// ---------- Resumen para copiar ----------
function textoResumenLanz() {
  const r = ultimo; if (!r || !r.ev) return 'Faltan datos para armar el resumen.';
  const ev = r.ev, mon = ev.R.moneda, E = ev.escenarios, p = estado.prospecto, L = p.lanzamiento, l = [];
  l.push(`${p.negocio.nombre || 'Prospecto'}${p.negocio.rubro ? ' (' + p.negocio.rubro + ')' : ''} · LANZAMIENTO`);
  l.push(`¿Le podemos cumplir? ${TXT_VER_CORTO[ev.veredicto]} (${ev.puntaje}/100)${r.hayRangos ? ` · números: ${({ prudente: 'lo peor', normal: 'lo normal', optimista: 'lo mejor' })[r.esc]} de cada rango` : ''}`);
  if (ev.prudente) l.push(`En el peor caso: ${TXT_VER_CORTO[ev.prudente.veredicto]}`);
  l.push(`Producto de la promo: ${ev.foco.nombre} a ${fmtM(ev.venta.precio, mon)}${ev.venta.regalo > 0 ? ` con regalo (le cuesta ${fmtM(ev.venta.regalo, mon)})` : ''}. Le deja ${fmtM(ev.ganVenta, mon)} por venta.`);
  if (ev.fecha) l.push(`Canje: ${fmtFecha(ev.fecha)}${!vacio(L.porque) ? ` (${String(L.porque).trim()})` : ''}. Cerrar a más tardar: ${fmtFecha(ev.cierraHasta)}.`);
  l.push('');
  l.push(`Precio: ${fmtM(ev.precio, mon)} (${fmtM(ev.mitad1, mon)} para empezar + ${fmtM(ev.mitad2, mon)} cuando lleguen los de la garantía). Publicidad: ${fmtM(ev.publicidad, mon)}, directo desde su cuenta.`);
  l.push(`Número de la garantía: ${Number.isFinite(ev.N) ? fmtN(ev.N) : '—'} ${ev.unidadGar[1]} (${fmtM(ev.precio + ev.publicidad, mon)} ÷ ${fmtM(ev.ganVenta, mon)}). Tope ${fmtN(ev.tope)}.`);
  l.push(`Llegan: lo mínimo ${f1(E.piso.unidades)} · lo esperado ${f1(E.meta.unidades)} · si sale muy bien ${f1(E.techo.unidades)}. Tu segunda mitad: ${estadoGarantia(ev)[1].toLowerCase()}.`);
  l.push(`Compran: ${f1(E.piso.compras)} · ${f1(E.meta.compras)} · ${f1(E.techo.compras)}. Él gana en el lanzamiento: ${fmtN(E.piso.roiLanz, 1)}× · ${fmtN(E.meta.roiLanz, 1)}× · ${fmtN(E.techo.roiLanz, 1)}×.`);
  const a = ev.ads; l.push(`Anuncios: ${a.nombrePlataforma}, «${a.objetivoNombre}». Unas ${fmtN(a.vistas)} vistas → ${f1(E.meta.reservas)} reservas → ${f1(E.meta.llegadas)} llegan → ${f1(E.meta.compras)} compran (lo esperado).`);
  if (ev.stock !== null || ev.atiendeDia !== null) l.push(`Canje: ${ev.diasCanje} día(s)${ev.stock !== null ? `, ${fmtN(ev.stock)} unidades separadas (tope de cupones ${fmtN(ev.topeCup)})` : ''}${ev.atiendeDia !== null ? `, atiende ${fmtN(ev.atiendeDia)} por día` : ''}.`);
  if (ev.plan.ofrecer) l.push(`Después: plan de cada mes a ${fmtM(ev.plan.precio, mon)} cada 4 semanas (o ${fmtM(ev.plan.precioComp, mon)} con ${ev.plan.meses} meses). Le dejaría ${fmtM(ev.plan.esc.meta.gan, mon)} al mes.`);
  const faltan = cincoCosas().filter(([ok]) => !ok).map(([, t]) => t);
  l.push(`Sus 5 cosas: ${faltan.length ? 'falta que acepte: ' + faltan.join('; ') : 'aceptadas'}.`);
  const conds = ev.chequeos.filter(c => (c.estado === 'ojo' || c.estado === 'no') && c.arreglo);
  if (conds.length) { l.push(''); l.push('A cuidar:'); for (const c of conds) l.push(`- ${c.nombre}: ${c.arreglo}`); }
  if (ev.veredicto === 'no' && r.alternativas.length) { l.push(''); l.push('Mejor ofrecerle:'); for (const x of r.alternativas) l.push(`- ${x}`); }
  if (ev.estimados.length) { l.push(''); l.push('Números a confirmar: ' + ev.estimados.join('; ')); }
  return l.join('\n');
}
