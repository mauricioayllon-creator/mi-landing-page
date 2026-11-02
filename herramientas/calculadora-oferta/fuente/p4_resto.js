// ---------- Gráfico ----------
function ticksLindos(min, max, cuantos = 5) { if (min === max) max = min + 1; const p0 = (max - min) / cuantos, mag = Math.pow(10, Math.floor(Math.log10(p0))), nn = p0 / mag, paso = (nn < 1.5 ? 1 : nn < 3 ? 2 : nn < 7 ? 5 : 10) * mag; const t = []; for (let v = Math.floor(min / paso) * paso; v <= Math.ceil(max / paso) * paso + paso / 2; v += paso) t.push(Math.round(v)); return t; }
function fmtCompacto(v) { if (v === 0) return '0'; const a = Math.abs(v), sg = v < 0 ? '−' : ''; if (a >= 1e6) return sg + fmtN(a / 1e6, a % 1e6 === 0 ? 0 : 1) + ' M'; if (a >= 1000) return sg + fmtN(a / 1000, a % 1000 === 0 ? 0 : 1) + ' mil'; return sg + fmtN(a); }
function dibujarGrafico() {
  const cont = $('#grafico'); if (!cont || !ultimo || !ultimo.ev) return;
  const ev = ultimo.ev, E = ev.escenarios, mon = ev.R.moneda;
  const series = [['piso', 'Mínimo', '--s2'], ['meta', 'Esperado', '--s1'], ['techo', 'Muy bien', '--s3']];
  let hasta = ev.D + 6; for (const [k] of series) if (E[k].recupero) hasta = Math.max(hasta, E[k].recupero + 2); hasta = Math.min(hasta, E.meta.H);
  const W = Math.max(300, cont.clientWidth || 600), H = Math.round(Math.min(300, Math.max(210, W * 0.42))), ml = 56, mr = 70, mt = 12, mb = 28;
  let min = 0, max = 0; for (const [k] of series) for (let m = 1; m <= hasta; m++) { const v = E[k].acum[m]; if (v < min) min = v; if (v > max) max = v; }
  const t = ticksLindos(min, max, W < 420 ? 4 : 5), y0 = t[0], y1 = t[t.length - 1];
  const x = m => ml + (W - ml - mr) * m / hasta, y = v => mt + (H - mt - mb) * (1 - (v - y0) / (y1 - y0));
  const pasoX = hasta <= 12 ? 1 : hasta <= 24 ? 3 : 6;
  let g = `<rect x="${x(0)}" y="${mt}" width="${x(ev.D) - x(0)}" height="${H - mt - mb}" rx="8" style="fill:var(--fill-2)"/><text x="${x(0) + 8}" y="${mt + 16}" font-size="12" style="fill:var(--text-2)">el plan (${ev.D} meses)</text>`;
  for (const v of t) g += `<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" style="stroke:${v === 0 ? 'var(--text-3)' : 'var(--sep)'}" stroke-width="1"/><text x="${ml - 8}" y="${y(v) + 4}" text-anchor="end" font-size="12" style="fill:var(--text-2)">${esc(fmtCompacto(v))}</text>`;
  for (let m = 0; m <= hasta; m += pasoX) g += `<text x="${x(m)}" y="${H - 6}" text-anchor="middle" font-size="12" style="fill:var(--text-2)">${m}</text>`;
  g += `<text x="${W - mr + 6}" y="${H - 6}" font-size="12" style="fill:var(--text-2)">mes</text>`;
  const fin = [];
  for (const [k, nom, col] of series) { let d = `M${x(0)},${y(0)}`; for (let m = 1; m <= hasta; m++) d += ` L${x(m).toFixed(1)},${y(E[k].acum[m]).toFixed(1)}`; g += `<path d="${d}" fill="none" style="stroke:var(${col})" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`; fin.push({ k, nom, col, yv: y(E[k].acum[hasta]) }); }
  fin.sort((a, b) => a.yv - b.yv); for (let i = 1; i < fin.length; i++) if (fin[i].yv - fin[i - 1].yv < 15) fin[i].yv = fin[i - 1].yv + 15;
  for (const f of fin) g += `<circle cx="${x(hasta)}" cy="${y(E[f.k].acum[hasta])}" r="4.5" style="fill:var(${f.col});stroke:var(--card)" stroke-width="2"/><text x="${x(hasta) + 9}" y="${f.yv + 4}" font-size="12" style="fill:var(--text-2)">${f.nom}</text>`;
  const vm = E.meta.valleMes, rm = E.meta.recupero;
  if (vm > 0) g += `<circle cx="${x(vm)}" cy="${y(E.meta.valle)}" r="6" style="fill:var(--card);stroke:var(--text)" stroke-width="2"/><text x="${x(vm)}" y="${y(E.meta.valle) + 4}" text-anchor="middle" font-size="9" font-weight="700" style="fill:var(--text)">1</text>`;
  if (rm && rm <= hasta) g += `<circle cx="${x(rm)}" cy="${y(E.meta.acum[rm])}" r="6" style="fill:var(--card);stroke:var(--text)" stroke-width="2"/><text x="${x(rm)}" y="${y(E.meta.acum[rm]) + 4}" text-anchor="middle" font-size="9" font-weight="700" style="fill:var(--text)">2</text>`;
  g += `<line id="cruz" x1="0" x2="0" y1="${mt}" y2="${H - mb}" style="stroke:var(--text-3)" stroke-width="1" visibility="hidden"/><rect id="zona" x="${ml}" y="${mt}" width="${W - ml - mr}" height="${H - mt - mb}" fill="transparent"/>`;
  const notas = `<p class="notas-grafico">${vm > 0 ? `<span><b class="marca-num">1</b> Lo más abajo que va: <b>${esc(fmtM(E.meta.valle, mon))}</b> (mes ${vm})</span>` : '<span>Nunca queda en negativo</span>'}${rm ? `<span><b class="marca-num">2</b> Ya recuperó todo: <b>mes ${rm}</b></span>` : rm === null ? '<span>No recupera en este tiempo</span>' : ''}</p>`;
  cont.innerHTML = notas + `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Plata acumulada del cliente mes a mes: lo mínimo, lo esperado y si sale muy bien.">${g}</svg><div class="tip oculto" id="tip"></div>`;
  const zona = $('#zona', cont), cruz = $('#cruz', cont), tip = $('#tip', cont), svg = $('svg', cont);
  const mover = evt => {
    const rect = svg.getBoundingClientRect(), px = (evt.clientX - rect.left) * (W / rect.width), m = clamp(Math.round((px - ml) / (W - ml - mr) * hasta), 0, hasta);
    cruz.setAttribute('x1', x(m)); cruz.setAttribute('x2', x(m)); cruz.setAttribute('visibility', 'visible');
    tip.innerHTML = `<b>Mes ${m}</b>${series.slice().reverse().map(([k, nom, col]) => `<div class="fila-tip"><span><i style="background:var(${col})"></i>${nom}</span><span class="num">${esc(fmtM(m === 0 ? 0 : E[k].acum[m], mon))}</span></div>`).join('')}`;
    tip.classList.remove('oculto');
    const left = (x(m) / W) * rect.width, tw = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(rect.width - tw, left + 12 > rect.width - tw ? left - tw - 12 : left + 12)) + 'px'; tip.style.top = '34px';
  };
  zona.addEventListener('pointermove', mover); zona.addEventListener('pointerdown', mover);
  zona.addEventListener('pointerleave', () => { cruz.setAttribute('visibility', 'hidden'); tip.classList.add('oculto'); });
}
let tRes = null; window.addEventListener('resize', () => { clearTimeout(tRes); tRes = setTimeout(dibujarGrafico, 150); });

// ---------- Claude ----------
let SAMPLE = null, ctlIA = null, iaEstado = { resp: null, clave: '', error: '', cargando: false };
function datosIA(r) {
  const ev = r.ev, p = estado.prospecto, md = ev.metaDueno, O = r.oferta && !r.oferta.incompleta ? r.oferta : null;
  return { moneda: ev.R.moneda, negocio: { nombre: p.negocio.nombre, rubro: p.negocio.rubro, ciudad: p.negocio.ciudad, ventasMes: n(p.negocio.facturacion) },
    productos: r.an.lista.map(x => ({ nombre: x.nombre, ventasMes: x.facturacion, deCada100LeQueda: Math.round(x.mt.m * 100), comoPaga: x.l.tipo, precio: x.mt.ticket, aQuien: TIPOS_VENTA[x.l.tipoVenta]?.nombre, competencia: x.l.competencia, puntos: x.puntaje })),
    potenciar: ev.foco.nombre, trabajo: ev.modo, servicios: Object.entries(ev.alc).filter(([, v]) => v).map(([k]) => k), respuesta: TXT_VER_CORTO[ev.veredicto],
    metaDelDueno: !md ? null : r.lanz ? { tipo: md.tipo, quiere: Math.round(md.quiere), daElLanzamiento: Math.round(md.daLanz), daElPlanDeCadaMes: Math.round(md.daPlan) }
      : { quiere: tituloMeta(md, ev.R.moneda), clientesPorDia: +md.clientesDia.toFixed(2), coberturaDelPlan: Math.round(md.cobertura * 100) + '%' },
    capacidad: r.lanz ? { diaDelCanje: (ev.chequeos.find(c => c.id === 'atiende') || {}).detalle || null, stock: (ev.chequeos.find(c => c.id === 'stock') || {}).detalle || null, puedeContestar: n(p.capacidad.mensajesDia) || null }
      : { leAlcanzaAtender: (ev.chequeos.find(c => c.id === 'capacidad') || {}).detalle, mensajesPorDiaConElPlan: +ev.mensajesDiaNec.toFixed(1), puedeContestar: n(p.capacidad.mensajesDia) || null },
    clienteIdeal: r.icp ? r.icp.lista.map(s => ({ tipo: s.nombre, gananciaAlAnio: Math.round(s.gananciaCliente), puntos: s.puntaje })) : null,
    anuncios: ev.ads ? { plataforma: ev.ads.nombrePlataforma, objetivo: ev.ads.objetivoNombre, presupuestoBs: ev.presupuesto, usd: Math.round(ev.ads.usd), vistasMes: Math.round(ev.ads.vistas), resultadosMes: Math.round(ev.ads.resultados), queSonResultados: ev.ads.resultadoNombre, llegadasMes: +ev.ads.llegadas.toFixed(1), comprasMes: +ev.ads.clientes.toFixed(1), avisos: ev.ads.avisos } : null,
    oferta: O ? { producto: O.nombre, loQueLogra: O.deseo, rapidez: O.tiempo, precio: O.precio, regalos: O.bonos.map(b => b.nombre), garantia: O.garantia, urgencia: O.urgencia, puntos: O.puntaje, valeVecesElPrecio: +O.ratio.toFixed(1) } : null,
    hallazgos: r.hallazgos.map(h => h.titulo + ': ' + h.texto), comoEstaHoy: ev.diag.etapas.map(e => ({ parte: e.nombre, problemas: e.notas })), numerosAdivinados: ev.estimados,
    plan: r.lanz ? { tipo: 'lanzamiento con fecha y cupón', precio: ev.precio, dosMitades: [ev.mitad1, ev.mitad2], numeroDeLaGarantia: ev.N, cuentaLaGarantia: ev.unidadGar[1], fechaDelCanje: p.lanzamiento.fecha || null, porque: p.lanzamiento.porque || null, publicidad: ev.publicidad, llegan: { minimo: +ev.escenarios.piso.unidades.toFixed(1), esperado: +ev.escenarios.meta.unidades.toFixed(1) }, compran: +ev.escenarios.meta.compras.toFixed(1), planDeCadaMes: ev.plan.ofrecer ? { precio: ev.plan.precio, conCompromiso: ev.plan.precioComp } : null }
      : { meses: ev.D, precioMes: ev.precio, promesa: promesaDe(ev).frase },
    revision: ev.chequeos.map(c => ({ punto: c.nombre, estado: c.estado, detalle: c.detalle })), alternativas: r.alternativas };
}
function claveIA(r) { try { return JSON.stringify(datosIA(r)); } catch { return ''; } }
function promptIA(r) {
  return `Eres un estratega de ventas y marketing que trabaja como socio de pequeños negocios en Latinoamérica, sobre todo en Bolivia. Su trabajo principal es hacer contenido y anuncios; además enseña a vender (no vende por ellos). Te paso el análisis de un prospecto hecho con una calculadora. No cambies sus números. Si supones algo, dilo. Escribe tan simple que lo entienda un niño de 10 años: frases cortas, palabras de todos los días, nada de jerga. Sé concreto para ESTE negocio y esta ciudad.

DATOS (JSON):
${JSON.stringify(datosIA(r))}

Responde SOLO con un objeto JSON así:
{"resumen": "2 o 3 frases: qué ves y qué harías primero",
 "productoMensual": [{"idea": "algo que se pueda cobrar cada mes", "porQue": "por qué sirve aquí", "comoCobrarlo": "cómo cobrarlo, como idea"}],
 "ideasContenido": ["3 ideas de videos o publicaciones para atraer a su cliente ideal"],
 "noPelearPorPrecio": ["2 o 3 formas de no competir por precio"],
 "preguntas": ["5 preguntas para hacerle en la llamada, sobre todo de los números adivinados"],
 "mejorarOferta": ["3 ideas para que la oferta sea más irresistible: regalos que cuesten poco y valgan mucho, garantía, urgencia real"],
 "ganchos": ["5 títulos de videos cortos pensados para su cliente ideal"],
 "riesgos": ["2 a 4 cosas que pueden hacer fallar la promesa"],
 "siNoSePuede": "si la respuesta es 'Todavía no': qué le ofrecerías; si no, cadena vacía"}`;
}
function htmlRespIA(d) {
  if (!d || typeof d !== 'object') return '';
  const L = a => Array.isArray(a) && a.length ? `<ul>${a.map(x => `<li>${esc(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('')}</ul>` : '';
  const ideas = Array.isArray(d.productoMensual) ? d.productoMensual.map(i => `<li><b>${esc(i.idea || '')}</b>${i.porQue ? ' ' + esc(i.porQue) : ''}${i.comoCobrarlo ? ' <i>Cómo cobrarlo:</i> ' + esc(i.comoCobrarlo) : ''}</li>`).join('') : '';
  return `${d.resumen ? `<div class="ia-bloque"><h4>Lo que ve</h4><p>${esc(d.resumen)}</p></div>` : ''}${ideas ? `<div class="ia-bloque"><h4>Algo que se cobre cada mes</h4><ul>${ideas}</ul></div>` : ''}${L(d.ideasContenido) ? `<div class="ia-bloque"><h4>Ideas de contenido</h4>${L(d.ideasContenido)}</div>` : ''}${L(d.noPelearPorPrecio) ? `<div class="ia-bloque"><h4>Cómo no pelear por precio</h4>${L(d.noPelearPorPrecio)}</div>` : ''}${L(d.mejorarOferta) ? `<div class="ia-bloque"><h4>Para que la oferta sea irresistible</h4>${L(d.mejorarOferta)}</div>` : ''}${L(d.ganchos) ? `<div class="ia-bloque"><h4>Títulos de videos</h4>${L(d.ganchos)}</div>` : ''}${L(d.preguntas) ? `<div class="ia-bloque"><h4>Preguntas para la llamada</h4>${L(d.preguntas)}</div>` : ''}${L(d.riesgos) ? `<div class="ia-bloque"><h4>Lo que puede fallar</h4>${L(d.riesgos)}</div>` : ''}${d.siNoSePuede ? `<div class="ia-bloque"><h4>Qué ofrecerle</h4><p>${esc(d.siNoSePuede)}</p></div>` : ''}`;
}
function htmlIA(r) {
  const disp = !!SAMPLE, vig = iaEstado.resp && iaEstado.clave === claveIA(r);
  let c = '';
  if (!disp) c = '<p class="texto">Esto funciona cuando abres la calculadora dentro de Claude. Todo lo demás funciona igual.</p>';
  else if (iaEstado.cargando) c = '<p class="pensando">Pensando… puede tardar un minuto.</p><div><button class="btn-g btn-chico" type="button" id="btn-ia-parar">Detener</button></div>';
  else if (vig) c = htmlRespIA(iaEstado.resp);
  else if (iaEstado.resp) c = '<p class="texto">Cambiaste datos desde la última vez. Pide otra para que coincida.</p>' + htmlRespIA(iaEstado.resp);
  if (iaEstado.error) c = `<p class="texto">${esc(iaEstado.error)}</p>` + c;
  return `<p class="texto">Lo que una fórmula no ve: qué cobrar cada mes, cómo mejorar la oferta, títulos de videos y qué preguntarle.</p>${disp && !iaEstado.cargando ? `<div><button class="btn-azul btn-chico" type="button" id="btn-ia">${vig ? 'Pedir otra' : 'Pedir opinión a Claude'}</button></div>` : ''}<div style="display:grid;gap:12px">${c}</div>`;
}
async function pedirIA() {
  if (!SAMPLE || !ultimo || !ultimo.ev) return;
  const r = ultimo; ctlIA = new AbortController(); iaEstado = { ...iaEstado, cargando: true, error: '' }; refrescarIA();
  try { const data = await SAMPLE.json(promptIA(r), { signal: ctlIA.signal, modelTier: 'default' }); iaEstado = { resp: data, clave: claveIA(r), error: '', cargando: false }; }
  catch (e) {
    const c = e && e.code; let msg = '';
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) SAMPLE = null;
    else if (c === 'rate_limited') msg = 'Muchas consultas seguidas o llegaste a tu límite. Prueba en un rato.';
    else if (c === 'session_expired') msg = 'Tu sesión venció. Vuelve a entrar a Claude.';
    else if (c === 'refused') msg = 'Claude no respondió esta vez. Cambia algún dato y prueba de nuevo.';
    else if (c === 'invalid_json') msg = 'La respuesta llegó en un formato raro. Prueba de nuevo.';
    else if (c !== 'cancelled') msg = 'Se cortó la conexión. Prueba de nuevo.';
    iaEstado = { ...iaEstado, cargando: false, error: msg };
  }
  refrescarIA();
}
function refrescarIA() { const s = $('#r-ia'); if (!s || !ultimo || !ultimo.ev) return; s.innerHTML = htmlIA(ultimo); conectarIA(); }
function conectarIA() { const b = $('#btn-ia'); if (b) b.addEventListener('click', pedirIA); const pa = $('#btn-ia-parar'); if (pa) pa.addEventListener('click', () => ctlIA && ctlIA.abort()); if (iaEstado.cargando || iaEstado.resp) { const d = $('#det-ia'); if (d) d.open = true; } }

// ---------- Resumen ----------
function textoResumen() {
  const r = ultimo; if (!r || !r.ev) return 'Faltan datos para armar el resumen.';
  if (r.lanz) return textoResumenLanz();
  const ev = r.ev, mon = ev.R.moneda, E = ev.escenarios, p = estado.prospecto, pr = promesaDe(ev), l = [], md = ev.metaDueno;
  l.push(`${p.negocio.nombre || 'Prospecto'}${p.negocio.rubro ? ' (' + p.negocio.rubro + ')' : ''}`);
  l.push(`¿Le podemos cumplir? ${TXT_VER_CORTO[ev.veredicto]} (${ev.puntaje}/100)${r.hayRangos ? ` · números: ${({ prudente: 'lo peor', normal: 'lo normal', optimista: 'lo mejor' })[r.esc]} de cada rango` : ''}`);
  if (ev.prudente) l.push(`En el peor caso: ${TXT_VER_CORTO[ev.prudente.veredicto]}`);
  l.push(`Qué potenciar: ${ev.foco.nombre}`);
  for (const h of r.hallazgos.slice(0, 2)) l.push(`- ${h.titulo}: ${h.texto}`);
  if (md) { l.push(''); l.push(`Su meta: ${tituloMeta(md, mon)}.`); l.push(`Por día: ${md.tipo === 'clientes' ? 'clientes nuevos ' + fmtPorDia(md.clientesDia) : fmtM(md.ventasDia, mon) + ' más en ventas'} · personas nuevas que le escriban: ${fmtPorDia(md.interesadosDia)}.`); l.push(textoCobertura(md, mon)); }
  l.push('');
  l.push(`Le prometo: ${pr.frase}.`);
  l.push(`Servicios: ${Object.entries(ev.alc).filter(([, v]) => v).map(([k]) => SERVICIOS.find(s => s.id === k).nombre.toLowerCase()).join(', ')}`);
  l.push(`Precio: ${fmtM(ev.precio, mon)} cada mes (se paga mes a mes). Para ver el resultado completo: ${ev.D} meses`);
  if (ev.ads) { const a = ev.ads; l.push(`Anuncios: ${a.nombrePlataforma}, objetivo «${a.objetivoNombre}», ${fmtM(ev.presupuesto, mon)} al mes (unos USD ${fmtN(a.usd)} a Bs ${fmtN(a.tc, 2)}), pagados directo a la plataforma`); l.push(`En un mes normal: unas ${fmtN(a.vistas)} vistas → ${fmtN(a.resultados)} ${a.resultadoNombre}${a.llegadas > 0 ? ` → ${f1(a.llegadas)} llegan a la tienda` : ''} → ${f1(a.clientes)} compran (lo esperado). Cada cliente cuesta ${fmtM(a.costoClienteBs, mon)} en anuncios.`); }
  else if (ev.alc.campanas) l.push(`Anuncios: ${fmtM(ev.presupuesto, mon)} al mes, pagados directo a las plataformas`);
  l.push(`Clientes nuevos: lo mínimo ${f1(E.piso.N)} · lo esperado ${f1(E.meta.N)} · si sale muy bien ${f1(E.techo.N)}${ev.limitadoPorCapacidad ? ' (ya quité los que no le caben)' : ''}`);
  l.push(`Él pone ${fmtM(E.meta.invNeta, mon)} y gana en un año: lo mínimo ${fmtM(E.piso.V1, mon)} (${fmtN(E.piso.roi1, 1)} veces), lo esperado ${fmtM(E.meta.V1, mon)}`);
  l.push(`Recupera su plata: ${E.meta.recupero === null ? 'no en 3 años' : 'en el mes ' + E.meta.recupero}`);
  const cc = ev.chequeos.find(c => c.id === 'capacidad'); if (cc) l.push(`Capacidad: ${cc.detalle}`);
  l.push(`Mensajes por día con el plan: ${f1(ev.mensajesDiaNec)}${n(p.capacidad.mensajesDia) > 0 ? ` (puede contestar ${fmtN(n(p.capacidad.mensajesDia))})` : ''}`);
  if (r.icp) l.push(`Cliente ideal: ${r.icp.mejor.nombre} (${fmtM(r.icp.mejor.gananciaCliente, mon)} al año cada uno)`);
  const O = r.oferta && !r.oferta.incompleta ? r.oferta : null;
  if (O) { l.push(''); l.push(`Oferta (${O.puntaje}/100): ${O.deseo || O.nombre}${O.tiempo ? ', ' + O.tiempo : ''}. Precio ${fmtM(O.precio, mon)}${O.bonos.length ? '. Regalos: ' + O.bonos.map(b => b.nombre).filter(Boolean).join(', ') : ''}${O.garantia !== 'ninguna' ? '. ' + TXT_GARANTIA[O.garantia] : ''}`); l.push(`Todo junto vale ${fmtN(O.ratio, 1)} veces el precio. Le queda por venta ${fmtM(O.gananciaVenta, mon)}.`); }
  const conds = ev.chequeos.filter(c => (c.estado === 'ojo' || c.estado === 'no') && c.arreglo);
  if (conds.length) { l.push(''); l.push('A cuidar:'); for (const c of conds) l.push(`- ${c.nombre}: ${c.arreglo}`); }
  if (ev.veredicto === 'no' && r.alternativas.length) { l.push(''); l.push('Mejor ofrecerle:'); for (const a of r.alternativas) l.push(`- ${a}`); }
  if (ev.estimados.length) { l.push(''); l.push('Números a confirmar: ' + ev.estimados.join('; ')); }
  return l.join('\n');
}
async function copiarResumen() {
  const t = textoResumen();
  try { await navigator.clipboard.writeText(t); aviso('Resumen copiado.'); }
  catch {
    cambiarVista('panel');
    const p = $('#panel'); const caja = document.createElement('section'); caja.className = 'tarjeta';
    caja.innerHTML = `<p class="texto">No se pudo copiar solo. Selecciona el texto y cópialo:</p><textarea class="copia-manual" readonly>${esc(t)}</textarea>`;
    p.prepend(caja); const ta = caja.querySelector('textarea'); ta.focus(); ta.select();
  }
}
let tAviso = null;
function aviso(t) { const a = $('#aviso'); a.textContent = t; a.classList.add('ver'); clearTimeout(tAviso); tAviso = setTimeout(() => a.classList.remove('ver'), 2600); }

// ---------- Guardar ----------
let DB = null, USER = null, esDueno = null, listaItems = [], listaCargada = false, listaNota = '', confirmarBorrar = null, unsubLista = null;
function slug(s) { return (String(s || 'prospecto').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'prospecto') + '-' + Math.random().toString(36).slice(2, 7); }
function resumenDoc() { const ev = ultimo && ultimo.ev; return { nombre: estado.prospecto.negocio.nombre || 'Sin nombre', rubro: estado.prospecto.negocio.rubro || '', fecha: new Date().toISOString(), veredicto: ev ? ev.veredicto : 'incompleta', puntaje: ev ? ev.puntaje : null, foco: ev ? ev.foco.nombre : '', precio: ev ? ev.precio : null, meses: ev && ev.D ? ev.D : null, modelo: estado.prospecto.modelo, datos: clonar(estado.prospecto) }; }
function mensajeDb(e) { const c = e && e.code; if (c === 'invalid_argument') return 'Solo la dueña o el dueño de la calculadora puede guardar aquí.'; if (c === 'quota_exceeded') return 'Se llenó el espacio. Borra prospectos viejos.'; if (c === 'resource_exhausted') return 'Muchos guardados seguidos. Espera unos segundos.'; if (c === 'revoked') return 'Ya no tienes acceso para guardar.'; return 'No se pudo guardar. Revisa tu conexión.'; }
async function guardarProspecto() {
  const doc = resumenDoc(), btn = $('#btn-guardar'); btn.disabled = true;
  try {
    if (DB) {
      const id = estado.actualId || slug(doc.nombre);
      try { await DB.collection('prospectos').doc(id).set(doc); } catch (e) { if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 700)); await DB.collection('prospectos').doc(id).set(doc); } else throw e; }
      estado.actualId = id; guardarLocal('co4.actual', id); aviso(`Guardado: ${doc.nombre}`);
    } else {
      const lista = (leerLocal('co4.prospectos') || leerLocal('co3.prospectos') || []), id = estado.actualId && lista.some(x => x.id === estado.actualId) ? estado.actualId : slug(doc.nombre), i = lista.findIndex(x => x.id === id);
      if (i >= 0) lista[i] = { id, ...doc }; else lista.unshift({ id, ...doc });
      guardarLocal('co4.prospectos', lista.slice(0, 100)); estado.actualId = id; guardarLocal('co4.actual', id); listaItems = lista; listaCargada = true; renderLista(); aviso(`Guardado en este navegador: ${doc.nombre}`);
    }
  } catch (e) { aviso(mensajeDb(e)); } finally { btn.disabled = false; }
}
function renderLista() {
  const cont = $('#lista-prospectos'); if (!cont) return;
  $('#lista-nota').textContent = listaNota || (DB ? 'Solo tú los ves.' : 'Guardados solo en este navegador.');
  if (!listaCargada) { cont.innerHTML = '<p class="texto">Cargando…</p>'; return; }
  if (!listaItems.length) { cont.innerHTML = '<p class="texto">Todavía no guardaste ninguno. Llena los datos y toca «Guardar».</p>'; return; }
  const mon = estado.reglas.moneda;
  cont.innerHTML = listaItems.map(it => {
    const fecha = it.fecha ? new Date(it.fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) : '', conf = confirmarBorrar === it.id;
    return `<div class="prospecto"><div><h4>${esc(it.nombre)} ${etqVer(it.veredicto)}</h4><p>${esc(fecha)}${it.foco ? ' · ' + esc(it.foco) : ''}${it.precio != null ? ' · ' + esc(fmtM(it.precio, mon)) + (it.modelo === 'lanzamiento' ? ' por lanzamiento' : '/mes') : ''}</p></div>
      <div class="btns">${conf ? `<span class="texto">¿Borrar para siempre?</span><button class="btn-g btn-chico" type="button" data-borrar-si="${esc(it.id)}">Sí, borrar</button><button class="btn-g btn-chico" type="button" data-borrar-no="1">No</button>` : `<button class="btn-g btn-chico" type="button" data-abrir="${esc(it.id)}">Abrir</button><button class="btn-borde btn-chico" type="button" data-borrar="${esc(it.id)}">Borrar</button>`}</div></div>`;
  }).join('');
}
async function onClicLista(e) {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.abrir) { const it = listaItems.find(x => x.id === t.dataset.abrir); if (!it || !it.datos) return; cargarProspecto(it.datos, it.id); aviso(`Abierto: ${it.nombre}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (t.dataset.borrar) { confirmarBorrar = t.dataset.borrar; renderLista(); }
  else if (t.dataset.borrarNo) { confirmarBorrar = null; renderLista(); }
  else if (t.dataset.borrarSi) {
    const id = t.dataset.borrarSi; confirmarBorrar = null;
    try { if (DB) await DB.collection('prospectos').doc(id).delete(); else { listaItems = listaItems.filter(x => x.id !== id); guardarLocal('co4.prospectos', listaItems); renderLista(); } if (estado.actualId === id) { estado.actualId = null; guardarLocal('co4.actual', null); } aviso('Borrado.'); }
    catch (err) { aviso(mensajeDb(err)); renderLista(); }
  }
}
function cargarProspecto(datos, id) {
  estado.prospecto = normalizarProspecto(clonar(datos)); estado.actualId = id || null; estado.abiertas = new Set(); estado.paso = 1;
  guardarLocal('co4.actual', estado.actualId); guardarLocal('co4.borrador', estado.prospecto); guardarLocal('co4.paso', 1);
  iaEstado = { resp: null, clave: '', error: '', cargando: false };
  $('#ruta').innerHTML = htmlRutaLlamada();
  recalcular(); renderForm();
}
function suscribirLista() {
  if (!DB || unsubLista) return;
  listaCargada = false; renderLista();
  const timer = setTimeout(() => { listaNota = 'No se pudo leer la lista todavía.'; listaCargada = true; renderLista(); }, 10000);
  try {
    unsubLista = DB.collection('prospectos').orderBy('fecha', 'desc').limit(200).onSnapshot(snap => { if (!snap.metadata.fromCache) { clearTimeout(timer); listaNota = ''; } listaItems = snap.docs.map(d => ({ id: d.id, ...d.data() })); listaCargada = true; renderLista(); },
      err => { clearTimeout(timer); listaNota = err && err.code === 'revoked' ? 'Ya no tienes acceso a la lista.' : 'No se pudo leer la lista.'; listaCargada = true; renderLista(); });
  } catch { clearTimeout(timer); listaNota = 'No se pudo leer la lista.'; listaCargada = true; renderLista(); }
}
let tReglas = null, guardandoReglas = false, reglasPend = false;
function programarGuardarReglas() { guardarLocal('co4.reglas', estado.reglas); clearTimeout(tReglas); tReglas = setTimeout(subirReglas, 1200); }
async function subirReglas() { if (!DB || esDueno === false) return; if (guardandoReglas) { reglasPend = true; return; } guardandoReglas = true; try { await DB.doc('ajustes/principal').set({ reglas: clonar(estado.reglas), fecha: new Date().toISOString() }); } catch { } guardandoReglas = false; if (reglasPend) { reglasPend = false; subirReglas(); } }

// ---------- Guía de llamada y vista del cliente ----------
function aplicarGuia() {
  document.documentElement.dataset.guia = estado.guia ? 'on' : 'off';
  const b = $('#btn-guia'); if (b) { b.setAttribute('aria-pressed', String(estado.guia)); b.querySelector('.txt').textContent = estado.guia ? 'Guía: activada' : 'Guía de llamada'; }
}
function alternarGuia() { estado.guia = !estado.guia; guardarLocal('co4.guia', estado.guia); aplicarGuia(); aviso(estado.guia ? 'Guía de llamada activada (tecla G para quitarla)' : 'Guía de llamada oculta'); }
function alternarCliente() {
  estado.cliente = !estado.cliente;
  document.documentElement.dataset.cliente = estado.cliente ? 'on' : 'off';
  $('#app').dataset.cliente = estado.cliente ? 'on' : 'off';
  const b = $('#btn-cliente'); b.setAttribute('aria-pressed', String(estado.cliente)); b.querySelector('.txt').textContent = estado.cliente ? 'Salir de la vista del cliente' : 'Vista del cliente';
  cerrarDetalle();
  renderPanel(ultimo);
  if (!estado.cliente && estado.tab === 'plata') dibujarGrafico();
  window.scrollTo({ top: 0 }); const cp = $('#col-panel'); if (cp) cp.scrollTop = 0;
}

// ---------- Vista (teléfono) ----------
function cambiarVista(v) {
  estado.vista = v; $('#app').dataset.vista = v;
  $('#tab-preguntas').setAttribute('aria-selected', String(v === 'preguntas')); $('#tab-panel').setAttribute('aria-selected', String(v === 'panel'));
  if (v === 'panel') { dibujarGrafico(); window.scrollTo({ top: 0 }); }
}

// ---------- Arranque ----------
function iniciar() {
  const top = $('#top');
  const medir = () => document.documentElement.style.setProperty('--top-h', top.offsetHeight + 'px');
  medir(); try { new ResizeObserver(medir).observe(top); } catch { window.addEventListener('resize', medir); }
  const form = $('#form');
  form.addEventListener('input', onEntrada); form.addEventListener('change', onEntrada); form.addEventListener('focusout', onSalida); form.addEventListener('click', onClic);
  $('#pasos').addEventListener('click', e => { const b = e.target.closest('[data-paso]'); if (b) irPaso(+b.dataset.paso); });
  $('#panel').addEventListener('change', e => { if (e.target.id === 'sel-foco') { estado.prospecto.foco = e.target.value; programarCalculo(); } });
  $('#panel').addEventListener('click', e => {
    const b = e.target.closest('[data-ir-clave]'); if (b) { irPaso(+b.dataset.irPaso2, b.dataset.irClave); return; }
    const dt = e.target.closest('[data-detalle]'); if (dt) { abrirDetalle(dt.dataset.detalle); return; }
    const tb = e.target.closest('[data-tab]'); if (tb) { estado.tab = tb.dataset.tab; guardarLocal('co4.tab', estado.tab); renderPanel(ultimo); const nb = document.querySelector(`[data-tab="${CSS.escape(estado.tab)}"]`); if (nb) nb.focus(); return; }
    const es = e.target.closest('[data-esc]'); if (es && !es.disabled) { estado.prospecto.escenarioDatos = es.dataset.esc; recalcular(); programarBorrador(); const nb = document.querySelector(`[data-esc="${CSS.escape(es.dataset.esc)}"]`); if (nb) nb.focus(); }
  });
  $$('[data-ejemplo]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.ejemplo, f = { brisa: ejemploBrisa, joyeria: ejemploJoyeria, cafe: ejemploCafe, minPlata: ejemploMinPlata, minAnillos: ejemploMinAnillos, minEmpresas: ejemploMinEmpresas, lanzTenis: ejemploLanzTenis, lanzBebe: ejemploLanzBebe, lanzHeladeria: ejemploLanzHeladeria }[k];
    cargarProspecto({ ...f(), _ejemplo: k }, null); $('#menu-ejemplos').open = false; aviso('Ejemplo cargado.');
  }));
  document.addEventListener('click', e => { const m = $('#menu-ejemplos'); if (m.open && !m.contains(e.target)) m.open = false; });
  // Lanzamiento o plan mensual: el selector está arriba de las preguntas y en el panel
  document.addEventListener('click', e => { const b = e.target.closest('[data-modelo]'); if (b) { cambiarModelo(b.dataset.modelo); const nb = document.querySelector(`#modelo [data-modelo="${CSS.escape(b.dataset.modelo)}"]`); if (nb && b.closest('#modelo')) nb.focus(); } });
  // «Nuevo» sigue en el modo en que estabas
  $('#btn-nuevo').addEventListener('click', () => { cargarProspecto({ ...prospectoVacio(), modelo: estado.prospecto.modelo || leerLocal('co4.modelo') || 'mensual' }, null); aviso('Prospecto nuevo.'); const el = document.querySelector('[data-clave="negocio.nombre"]'); if (el) el.focus(); });
  $('#btn-guardar').addEventListener('click', guardarProspecto);
  $('#btn-copiar').addEventListener('click', copiarResumen);
  $('#btn-lista').addEventListener('click', () => {
    const p = $('#panel-lista'), abrir = p.classList.contains('oculto');
    p.classList.toggle('oculto', !abrir); $('#btn-lista').setAttribute('aria-expanded', String(abrir));
    if (abrir) { if (DB) suscribirLista(); else { listaItems = (leerLocal('co4.prospectos') || leerLocal('co3.prospectos') || []); listaCargada = true; renderLista(); } }
  });
  $('#lista-prospectos').addEventListener('click', onClicLista);
  $('#detalle-cerrar').addEventListener('click', cerrarDetalle);
  $('#ruta').innerHTML = htmlRutaLlamada();
  aplicarGuia();
  $('#btn-guia').addEventListener('click', alternarGuia);
  $('#btn-cliente').addEventListener('click', alternarCliente);
  $('#btn-imprimir').addEventListener('click', () => { try { window.print(); } catch (e) { aviso('No se pudo abrir la impresión en esta página.'); } });
  document.addEventListener('keydown', e => {
    if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = e.target; if (t && (t.matches('input, textarea, select') || t.isContentEditable)) return;
      e.preventDefault(); alternarGuia();
    }
  });
  $('#detalle').addEventListener('click', e => { if (e.target === $('#detalle')) cerrarDetalle(); });
  $('#detalle').addEventListener('close', () => { estado.detalle = null; });
  $$('.vista-switch [data-vista]').forEach(b => b.addEventListener('click', () => cambiarVista(b.dataset.vista)));
  $('#mini-panel').addEventListener('click', () => cambiarVista('panel'));
  recalcular(); renderForm();
  conectarCapacidades();
}
async function conectarCapacidades() {
  const [user, db, sample] = await Promise.all([usar('user'), usar('db'), usar('sample')]);
  USER = user; SAMPLE = sample || null;
  if (USER) { try { esDueno = await USER.isOwner(); } catch { esDueno = null; } }
  if (db && esDueno !== false) {
    DB = db;
    try { const snap = await DB.doc('ajustes/principal').get(); if (snap.exists) { const d = snap.data(); if (d && d.reglas) { estado.reglas = normalizarReglas(d.reglas); guardarLocal('co4.reglas', estado.reglas); if (estado.paso === 9) renderForm(); } } } catch { }
    if (!$('#panel-lista').classList.contains('oculto')) suscribirLista();
  }
  recalcular();
}
iniciar();
