
// =================== Panel ===================
const TXT_VER = { apto: 'Sí', condiciones: 'Sí, si acuerdan esto', no: 'Todavía no', incompleta: 'Faltan datos' };
const TXT_VER_CORTO = { apto: 'Sí se puede', condiciones: 'Sí, con condiciones', no: 'Todavía no', incompleta: 'Faltan datos' };
const COLOR_VER = { apto: 'var(--green)', condiciones: 'var(--orange)', no: 'var(--red)' };
const TXT_EST = { ok: 'Bien', ojo: 'Para cuidar', no: 'Mal', na: 'Sin dato' };
function etqVer(v) { const c = v === 'apto' ? 'ok' : v === 'condiciones' ? 'ojo' : v === 'no' ? 'no' : ''; return `<span class="etq ${c}">${esc(TXT_VER_CORTO[v] || v)}</span>`; }
function etqEst(est, txt) { return `<span class="etq ${est === 'na' ? '' : est}">${esc(txt || TXT_EST[est] || '')}</span>`; }
function anillo(pct, color, tam = 112, grosor = 11, cifra = true) {
  const r = (tam - grosor) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(pct, 0, 100) / 100);
  return `<svg viewBox="0 0 ${tam} ${tam}" aria-hidden="true"><circle class="pista" cx="${tam / 2}" cy="${tam / 2}" r="${r}" style="stroke-width:${grosor}"/><circle class="avance" cx="${tam / 2}" cy="${tam / 2}" r="${r}" style="stroke:${color};stroke-width:${grosor};stroke-dasharray:${c.toFixed(1)};stroke-dashoffset:${off.toFixed(1)}"/></svg>${cifra ? `<div class="cifra"><b>${Math.round(pct)}</b><span>de 100</span></div>` : ''}`;
}
function porDiaPartes(x) {
  if (!(x > 0)) return { num: '0', uni: 'por día' };
  if (x >= 0.95) return { num: f1(x), uni: 'por día' };
  const d = Math.round(1 / x);
  return d <= 1 ? { num: '1', uni: 'por día' } : { num: '1', uni: `cada ${d} días` };
}
const NOMBRES_PROMESA = {
  interesados: ['personas', 'interesadas que sí le pueden comprar', 'personas interesadas que sí le pueden comprar'],
  llegadas: ['personas', 'que llegan a su tienda con el cupón', 'personas que llegan a la tienda con el cupón'],
  visitas: ['visitas', 'de personas a su página web', 'personas que entran a su página web'],
  alcance: ['personas', 'de su zona que ven sus videos', 'personas de su zona que ven sus videos'],
};
function promesaDe(ev) {
  const P = ev.promesa, mon = ev.R.moneda;
  if (P.tipo !== 'ventas') { const [uni, cola, fr] = NOMBRES_PROMESA[P.tipo] || NOMBRES_PROMESA.interesados, v = P.valorPiso ?? P.interesadosPiso; return { grande: fmtN(v), unidad: uni, texto: `${cola}, entre el mes 2 y el ${ev.D}. Esto depende de ti.`, frase: `al menos ${fmtN(v)} ${fr}` }; }
  return { grande: f1(P.ventasPiso), unidad: 'ventas al mes', texto: `por anuncios (hoy tiene ${f1(P.ventasHoy)}), ${ev.presupuesto > ev.pautaHoy ? 'poniendo ' + fmtM(ev.presupuesto, mon) + ' al mes' : 'con la misma plata'}.`, frase: `pasar de ${f1(P.ventasHoy)} a al menos ${f1(P.ventasPiso)} ventas al mes por anuncios` };
}
let ultimoVer = null;
function recalcular() {
  let r;
  try { autoDerivados(); } catch (e) { }
  try { r = calcular(estado.prospecto, estado.reglas); }
  catch (err) { console.error(err); $('#panel').innerHTML = '<section class="tarjeta"><p>Algo en los datos no se pudo calcular. Revisa el último número que cambiaste.</p></section>'; return; }
  ultimo = r;
  renderProgreso();
  if (estado.paso === 9 && r.ev && estado.tipoAjustes !== r.ev.tipo && !$('#form').contains(document.activeElement)) renderForm();
  const pres = document.querySelector('[data-clave="servicio.presupuesto"]'); if (pres && r.ev) pres.placeholder = `Sugerido: ${fmtN(r.ev.presupuesto)}`;
  const dur = document.querySelector('[data-clave="plan.duracionManual"]'); if (dur && r.ev) dur.placeholder = `Yo calculo: ${r.ev.Dauto}`;
  const plz = document.querySelector('[data-clave="meta.plazo"]'); if (plz && r.ev) plz.placeholder = String(r.ev.D);
  actualizarVivos();
  renderPanel(r);
}
const TABS = [['resumen', 'Resumen'], ['meta', 'Meta'], ['estrategia', 'Estrategia'], ['plata', 'Plata'], ['revision', 'Revisión']];
function htmlTabs() { return `<div class="tabs-panel"><div class="segmento" role="tablist" aria-label="Partes del panel">${TABS.map(([v, t]) => `<button type="button" role="tab" aria-selected="${estado.tab === v}" data-tab="${v}">${t}</button>`).join('')}</div></div>`; }
function renderPanel(r) {
  const p = estado.prospecto;
  $('#sub-negocio').textContent = [p.negocio.nombre || 'Prospecto sin nombre', p.negocio.ciudad].filter(Boolean).join(' · ');
  const cont = $('#panel');
  if (!r) return;
  if (estado.cliente) { cont.innerHTML = htmlVistaCliente(r); return; }
  if (r.incompleto) {
    cont.innerHTML = `${htmlCabPanel(r)}<section class="tarjeta hero v-nada"><div class="hero-top"><div class="anillo">${anillo(0, 'var(--gray)')}</div>
      <div class="hero-txt"><p class="kicker">¿Le podemos cumplir?</p><h2 class="respuesta">Faltan respuestas</h2><p class="frase">Para empezar, pregúntale cuánto paga en promedio un cliente (paso 3, «Lo que vende»).</p></div></div></section>${htmlFaltan()}`;
    $('#mini-panel').innerHTML = `<span class="mini-anillo">${anillo(0, 'var(--gray)', 40, 6, false)}</span><span class="t"><b>Faltan respuestas</b>Sigue preguntando</span><span class="ir">Ver panel ›</span>`;
    ultimoVer = null; return;
  }
  const ev = r.ev, tab = estado.tab;
  let cuerpo;
  if (tab === 'meta') cuerpo = [htmlMeta(r), htmlCapacidad(r), htmlDia(r)];
  else if (tab === 'estrategia') cuerpo = [htmlEstrategia(r), htmlAnuncios(r), htmlOferta(r), htmlICP(r), htmlMesa(r)];
  else if (tab === 'plata') cuerpo = [htmlDeDonde(r), htmlPlata(r), htmlSens(r), htmlPrecio(r)];
  else if (tab === 'revision') cuerpo = [htmlRevision(r), htmlFaltan(), htmlMas(r)];
  else cuerpo = [htmlMosaico(r), htmlMinimo(r), htmlMetaMini(r), htmlClientes(r), htmlSalud(r), htmlTesoro(r), htmlFaltan()];
  const scrollPanel = $('#col-panel') ? $('#col-panel').scrollTop : 0;
  cont.innerHTML = htmlCabPanel(r) + htmlEscenario(r) + htmlGuiaPanel('hero') + htmlHero(r) + htmlGuiaPanel('cliente') + htmlTabs() + `<div class="tab-cuerpo" role="tabpanel">${htmlGuiaPanel('tab-' + tab)}${cuerpo.join('')}</div>`;
  if ($('#col-panel')) $('#col-panel').scrollTop = scrollPanel;
  if (tab === 'plata') dibujarGrafico();
  if (tab === 'revision') conectarIA();
  $('#mini-panel').innerHTML = `<span class="mini-anillo">${anillo(ev.puntaje, COLOR_VER[ev.veredicto], 40, 6, false)}</span><span class="t"><b>${esc(TXT_VER_CORTO[ev.veredicto])} · ${ev.puntaje}/100</b>${esc(fmtM(ev.precio, ev.R.moneda))} cada mes</span><span class="ir">Ver panel ›</span>`;
  ultimoVer = ev.veredicto;
  if (estado.detalle && $('#detalle') && $('#detalle').open) abrirDetalle(estado.detalle);
}
function htmlCabPanel(r) {
  const p = estado.prospecto;
  const ops = r.an ? [['auto', 'La que elija la calculadora'], ...r.an.lista.filter(x => x.completa).map(x => [x.id, x.nombre])] : [];
  const sel = p.foco || 'auto';
  return `<div class="panel-cab"><div><h2>Panel del negocio</h2><p>${esc(p.negocio.nombre || 'Prospecto sin nombre')}${p.negocio.rubro ? ' · ' + esc(p.negocio.rubro) : ''}</p></div>
    ${ops.length > 1 ? `<div class="campo-in"><select id="sel-foco" aria-label="Qué potenciar">${ops.map(([v, t]) => `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>Potenciar: ${esc(t)}</option>`).join('')}</select></div>` : ''}</div>`;
}
function htmlEscenario(r) {
  const hay = r.hayRangos, actual = hay ? (estado.prospecto.escenarioDatos || 'normal') : 'normal';
  const pr = r.ev && r.ev.prudente;
  const nota = !hay ? 'Escribe algún número como rango («20 a 30») y aquí ves lo peor y lo mejor.'
    : actual === 'prudente' ? 'Usando lo peor de cada rango que anotaste.' : actual === 'optimista' ? 'Usando lo mejor de cada rango que anotaste.'
      : pr ? `Usando el medio de cada rango. En el peor caso: ${TXT_VER_CORTO[pr.veredicto].toLowerCase()}.` : 'Usando el medio de cada rango que anotaste.';
  return `<div class="escenario"><div class="esc-txt"><b>Si sus números salen…</b><span>${esc(nota)}</span></div>
    <div class="segmento" role="radiogroup" aria-label="Cómo salen sus números">${[['prudente', 'Peor'], ['normal', 'Normal'], ['optimista', 'Mejor']].map(([v, t]) => `<button type="button" role="radio" aria-checked="${v === actual}" data-esc="${v}"${hay ? '' : ' disabled'}>${t}</button>`).join('')}</div></div>`;
}
function htmlHero(r) {
  const ev = r.ev;
  const conds = ev.chequeos.filter(c => (c.estado === 'ojo' || (c.estado === 'no' && !c.critico)) && c.arreglo);
  const frase = ev.veredicto === 'apto' ? 'Puedes prometerle esto y cumplirlo. Casi todo depende de tu trabajo, y él gana aunque salga lo mínimo.'
    : ev.veredicto === 'condiciones' ? (conds.length ? `Puedes ayudarlo, pero antes pónganse de acuerdo en ${conds.length === 1 ? 'una cosa' : conds.length + ' cosas'}:` : 'Puedes ayudarlo, con algunos cuidados.')
      : 'Si le prometes algo ahora, va a ser muy difícil cumplir. Mejor haz esto:';
  const lista = ev.veredicto === 'condiciones' ? conds.map(c => `<li>${ICO[c.estado]}<span><b>${esc(c.nombre)}.</b> ${esc(c.arreglo)}</span></li>`).join('')
    : ev.veredicto === 'no' ? r.alternativas.map(a => `<li>${ICO.no}<span>${esc(a)}</span></li>`).join('') : '';
  const nEst = ev.estimados.length;
  return `<section class="tarjeta hero v-${ev.veredicto}" id="r-veredicto">
    <div class="hero-top"><div class="anillo" role="img" aria-label="${ev.puntaje} de 100">${anillo(ev.puntaje, COLOR_VER[ev.veredicto])}</div>
      <div class="hero-txt"><p class="kicker">¿Le podemos cumplir?</p><h2 class="respuesta">${esc(TXT_VER[ev.veredicto])}</h2><p class="frase">${esc(frase)}</p>
      <div class="etiquetas"><span class="etq azul">Potenciar: ${esc(ev.foco.nombre)}</span><span class="etq">${ev.modo === 'optimizar' ? 'Mejorar sus anuncios' : 'Traer clientes nuevos'}</span>${nEst ? `<span class="etq ojo">${nEst} número${nEst > 1 ? 's' : ''} adivinado${nEst > 1 ? 's' : ''}</span>` : '<span class="etq ok">Números del dueño</span>'}</div></div></div>
    ${ev.avisoModo ? `<p class="texto">${esc(ev.avisoModo)}</p>` : ''}
    ${lista ? `<ul class="filas-lista">${lista}</ul>` : ''}
  </section>`;
}
function htmlMosaico(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda, pr = promesaDe(ev), rec = E.meta.recupero;
  const w = (id, ic, col, tit, grande, chico, txt) => `<button type="button" class="widget tocable" data-detalle="${id}"><div class="widget-cab">${icoSq(ic, col)}${esc(tit)}<span class="ver-mas">Ver más ›</span></div><div class="grande">${esc(grande)}${chico ? ` <small>${esc(chico)}</small>` : ''}</div><p>${esc(txt)}</p></button>`;
  return `<div class="mosaico">
    ${w('prometes', 'objetivo', 'blue', 'Le prometes', pr.grande, pr.unidad, pr.texto)}
    ${w('cobras', 'moneda', 'green', 'Le cobras', fmtM(ev.precio, mon), 'cada mes', ev.forzado ? `Tu precio mínimo, mes a mes. Para ver todo el resultado: ${ev.D} meses.` : ev.topePorBolsillo ? 'Mes a mes. Lo bajé para que, con los anuncios, no pase de 15 de cada 100 que vende.' : `Mes a mes. Es ${fraccion(n(ev.R.partePct), mon)} que le haces ganar.`)}
    ${w('gana', 'sube', 'indigo', 'Él gana', fmtN(E.piso.roi1, 1) + '×', 'lo que pone', `Por cada Bs 1 que pone, le vuelven Bs ${fmtN(E.piso.roi1, 1)}, aunque salga lo mínimo.`)}
    ${w('recupera', 'reloj', 'orange', 'Recupera su plata', rec === null ? 'No' : rec === 0 ? 'Desde ya' : 'Mes ' + rec, '', rec === null ? 'No la recupera en 3 años.' : 'El mes en que ya le volvió todo lo que puso.')}
  </div>`;
}
// ---------- Meta del dueño ----------
function tituloMeta(md, mon) {
  if (md.tipo === 'clientes') return `Quiere ${f1(md.valor)} clientes nuevos al mes`;
  if (md.tipo === 'ganancia') return `Quiere ganar ${fmtM(md.valor, mon)} más al mes, en ${md.plazo} meses`;
  if (md.tipo === 'total') return `Quiere llegar a vender ${fmtM(md.valor, mon)} al mes, en ${md.plazo} meses`;
  return `Quiere vender ${fmtM(md.valor, mon)} más al mes, en ${md.plazo} meses`;
}
function estCob(c) { return c >= 0.8 ? 'ok' : c >= 0.4 ? 'ojo' : 'no'; }
function textoCobertura(md, mon) {
  const c = md.cobertura, pct = c >= 9.99 ? 'mucho más de lo que quiere' : `${fmtN(c * 100)} de cada 100 de lo que quiere`;
  if (md.tipo === 'clientes') return `El plan da unos ${f1(md.planMes)} clientes nuevos en un mes normal (${fmtPorDia(md.planDia)}): ${pct}.`;
  return `Con el plan, en el mes ${md.plazo} vendería unos ${fmtM(md.planAumento, mon)} más al mes (${fmtM(md.planAumentoDia, mon)} por día): ${pct}.`;
}
function htmlMetaTabla(ev, compacto) {
  const md = ev.metaDueno, mon = ev.R.moneda, mt = ev.foco.mt; if (!md) return '';
  const fila = (t, mes, dia) => `<tr><td>${esc(t)}</td><td class="n">${esc(mes)}</td><td class="n">${esc(dia)}</td></tr>`;
  const filas = [];
  if (md.ventasMes !== null) filas.push(fila('Ventas de más', fmtM(md.ventasMes, mon), fmtM(md.ventasDia, mon)));
  filas.push(fila('Ganancia de más', fmtM(md.gananciaMes, mon), fmtM(md.gananciaMes / md.dias, mon)));
  filas.push(fila('Clientes nuevos', f1(md.clientesMes), fmtPorDia(md.clientesDia)));
  filas.push(fila('Personas nuevas que le escriban', fmtN(md.interesadosMes), fmtPorDia(md.interesadosDia)));
  filas.push(fila(ev.modo === 'optimizar' ? 'Anuncios de más' : 'Plata en anuncios', fmtM(md.anunciosMes, mon), fmtM(md.anunciosDia, mon)));
  const est = estCob(md.cobertura);
  const comoSuma = mt.tipo === 'recurrente' ? `Si cada mes entra 1 cliente nuevo, en el mes ${md.plazo} ya serían ${md.plazo} clientes pagando: ${fmtM(mt.ticket * md.plazo, mon)} más al mes.`
    : mt.tipo === 'repetida' ? `Si cada mes entra 1 cliente nuevo, en el mes ${md.plazo} sumarían unos ${fmtM(mt.ticket * md.factorAcum, mon)} más al mes, porque los de antes vuelven a comprar.`
      : 'Cada cliente compra una sola vez: cada mes hacen falta clientes nuevos.';
  return `<p class="meta-titulo">${esc(tituloMeta(md, mon))}</p>
    <div class="tabla-envoltura"><table class="meta-tabla"><thead><tr><th>Para lograrlo necesita</th><th class="n">Al mes</th><th class="n">Por día</th></tr></thead><tbody>${filas.join('')}</tbody></table></div>
    <div class="cobertura" role="img" aria-label="${esc(textoCobertura(md, mon))}"><i class="${est}" style="width:${clamp(md.cobertura, 0, 1) * 100}%"></i></div>
    <p class="texto">${ICO[est]} ${esc(textoCobertura(md, mon))}</p>
    ${compacto ? '' : `<p class="texto">Cómo lo calculo: «por día» es el mes ÷ ${md.dias} días que trabaja. ${md.tipo !== 'clientes' ? comoSuma : ''} Para tener un cliente, tienen que escribirle unas ${fmtN(md.clientesMes > 0 ? md.interesadosMes / md.clientesMes : 0, 0)} personas.</p>`}`;
}
function htmlMeta(r) {
  const ev = r.ev;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('objetivo', 'blue')}Lo que quiere el dueño</h3><p>al mes y por día</p></div>
    ${ev.metaDueno ? htmlMetaTabla(ev, false) : `<p class="texto">Todavía no anotaste qué quiere lograr. Pregúntaselo: así sabes si el plan le alcanza, y lo ves por día.</p><div><button class="btn-g btn-chico" type="button" data-ir-clave="meta.valor" data-ir-paso2="2">Preguntarle ahora ›</button></div>`}</section>`;
}
function htmlMetaMini(r) {
  const ev = r.ev, md = ev.metaDueno, mon = ev.R.moneda;
  if (!md) return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('objetivo', 'blue')}Su meta</h3></div><p class="texto">Pregúntale qué quiere lograr: así sabes si el plan le alcanza, y cuánto es por día.</p><div><button class="btn-g btn-chico" type="button" data-ir-clave="meta.valor" data-ir-paso2="2">Preguntarle ›</button></div></section>`;
  const est = estCob(md.cobertura);
  const q = md.tipo === 'clientes' ? porDiaPartes(md.clientesDia) : { num: fmtM(md.ventasDia, mon), uni: 'más en ventas por día' };
  const nec = porDiaPartes(md.interesadosDia);
  const da = md.tipo === 'clientes' ? porDiaPartes(md.planDia) : { num: fmtM(md.planAumentoDia, mon), uni: `por día en el mes ${md.plazo}` };
  const cel = (k, x, s) => `<div class="mm"><span class="kicker">${k}</span><b>${esc(x.num)}</b><small>${esc(x.uni)}${s ? ' ' + esc(s) : ''}</small></div>`;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('objetivo', 'blue')}Su meta, por día</h3>${etqEst(est, est === 'ok' ? 'El plan llega' : est === 'ojo' ? 'Llega a medias' : 'El plan no llega')}</div>
    <div class="meta-mini">${cel('Quiere', q, md.tipo === 'clientes' ? '(clientes nuevos)' : '')}${cel('Necesita', nec, '(personas que escriben)')}${cel('El plan da', da, '')}</div>
    <div class="cobertura"><i class="${est}" style="width:${clamp(md.cobertura, 0, 1) * 100}%"></i></div>
    <p class="texto">${esc(textoCobertura(md, mon))}</p></section>`;
}

// ---------- Capacidad ----------
function htmlMedidores(ev, compacto) {
  const p = estado.prospecto, cap = ev.cap, ci = ev.escenarios.meta.capInfo, dias = ev.dias, rec = cap.modo === 'aLaVez';
  const chk = id => (ev.chequeos.find(c => c.id === id) || {});
  let atender;
  if (!cap.sabe) atender = `<div class="medidor"><div class="med-cab"><b>${icoSq('casa', 'teal')}Atender</b>${etqEst('ojo', 'Falta saber')}</div><p class="texto">Falta saber cuánto atiende hoy y cuánto podría atender como máximo.</p></div>`;
  else if (cap.legado) atender = `<div class="medidor"><div class="med-cab"><b>${icoSq('casa', 'teal')}Atender</b>${etqEst(chk('capacidad').estado || 'ok')}</div><p class="texto">${esc(chk('capacidad').detalle || '')}</p></div>`;
  else {
    const hoy = cap.actuales, max = cap.maxHoy, extra = cap.extra, nec = ci.necesita;
    const tot = Math.max(max + extra, hoy + nec, 1) * 1.06, w = x => clamp(x / tot * 100, 0, 100);
    const est = chk('capacidad').estado || 'ok';
    const uni = rec ? 'clientes' : 'al mes';
    const pd = x => rec ? '' : ` (${fmtPorDia(x / dias)})`;
    let fin;
    if (ci.recorto) fin = `No le alcanza: se perderían unos ${f1(ci.perdidos)} clientes. Ya los quité de la cuenta.`;
    else if (ci.usaExtra) fin = `Le alcanza solo si contrata a ${fmtN(cap.extraPersonas)} persona${cap.extraPersonas > 1 ? 's' : ''} antes del mes ${cap.mesContrata + 1}.`;
    else fin = 'Le alcanza.';
    atender = `<div class="medidor"><div class="med-cab"><b>${icoSq('casa', 'teal')}Atender</b>${etqEst(est, est === 'ok' ? 'Le alcanza' : ci.recorto ? 'No le alcanza' : 'Con condición')}</div>
      <div class="med-barra" role="img" aria-label="Hoy ${fmtN(hoy)}, con el plan ${f1(hoy + nec)}, máximo ${fmtN(max)}${extra > 0 ? `, contratando ${fmtN(max + extra)}` : ''}">
        <i class="m-hoy" style="width:${w(hoy)}%"></i><i class="m-plan m-${est}" style="left:${w(hoy)}%;width:${w(nec)}%"></i>
        ${extra > 0 ? `<i class="m-extra" style="left:${w(max)}%;width:${w(extra)}%"></i>` : ''}<i class="m-tope" style="left:${w(max)}%"></i></div>
      <div class="med-ley"><span><i class="l-hoy"></i>Hoy ${fmtN(hoy)} ${uni}</span><span><i class="l-plan m-${est}"></i>El plan suma hasta ${f1(nec)}</span><span><i class="l-tope"></i>Su máximo: ${fmtN(max)}</span>${extra > 0 ? `<span><i class="l-extra"></i>Si contrata: +${fmtN(extra)}</span>` : ''}</div>
      <p class="texto">${rec ? `Hoy atiende ${fmtN(hoy)} clientes y puede hasta ${fmtN(max)}: le quedan ${fmtN(cap.libre)} lugares. Con el plan llegarían hasta ${f1(nec)} clientes más (mes ${ci.mesPico}).` : `Hoy hace ${fmtN(hoy)} al mes${pd(hoy)} y puede hasta ${fmtN(max)}${pd(max)}. Con el plan sumaría hasta ${f1(nec)} al mes${pd(nec)}, en el mes ${ci.mesPico}.`} <b>${esc(fin)}</b></p></div>`;
  }
  const capMsg = n(p.capacidad.mensajesDia), hoyMsg = n(p.hoy.interesadosMes) / dias, total = ev.mensajesDiaNec, nuevos = Math.max(0, total - hoyMsg);
  let contestar;
  if (!(capMsg > 0)) contestar = `<div class="medidor"><div class="med-cab"><b>${icoSq('chat', 'green')}Contestar</b>${etqEst(total >= 8 ? 'ojo' : 'na', 'Falta saber')}</div><p class="texto">Con el plan le escribirían unas ${f1(total)} personas por día. Falta saber cuántas puede contestar bien.</p></div>`;
  else {
    const est = capMsg >= total ? 'ok' : capMsg >= 0.7 * total ? 'ojo' : 'no';
    const tot = Math.max(capMsg, total, 1) * 1.06, w = x => clamp(x / tot * 100, 0, 100);
    contestar = `<div class="medidor"><div class="med-cab"><b>${icoSq('chat', 'green')}Contestar</b>${etqEst(est, est === 'ok' ? 'Le alcanza' : 'No le alcanza')}</div>
      <div class="med-barra" role="img" aria-label="Hoy ${f1(hoyMsg)} por día, con el plan ${f1(total)}, puede ${fmtN(capMsg)}">
        <i class="m-hoy" style="width:${w(hoyMsg)}%"></i><i class="m-plan m-${est}" style="left:${w(hoyMsg)}%;width:${w(nuevos)}%"></i><i class="m-tope" style="left:${w(capMsg)}%"></i></div>
      <div class="med-ley"><span><i class="l-hoy"></i>Hoy ${f1(hoyMsg)} por día</span><span><i class="l-plan m-${est}"></i>El plan suma ${f1(nuevos)}</span><span><i class="l-tope"></i>Puede contestar ${fmtN(capMsg)}</span></div>
      <p class="texto">Con el plan le escribirían unas ${f1(total)} personas por día. ${capMsg >= total ? '<b>Le alcanza.</b>' : `<b>Le faltan ${f1(total - capMsg)} por día:</b> que sume a alguien para contestar o use respuesta automática.`}</p></div>`;
  }
  return `<div class="medidores">${atender}${contestar}</div>`;
}
function htmlCapacidad(r) {
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('casa', 'teal')}¿Le alcanza para atender?</h3><p>en lo esperado</p></div>
    ${htmlMedidores(r.ev, false)}
    <p class="texto">Si le traes más clientes de los que puede atender o contestar, se pierden y hablan mal. Por eso lo reviso antes de prometer.</p></section>`;
}
function htmlDia(r) {
  const ev = r.ev, mon = ev.R.moneda, E = ev.escenarios, dias = ev.dias;
  const t = (ic, col, k, x, s) => `<div class="widget"><div class="widget-cab">${icoSq(ic, col)}${esc(k)}</div><div class="grande">${esc(x.num)} <small>${esc(x.uni)}</small></div><p>${esc(s)}</p></div>`;
  const nuevosDia = ev.leadsNuevosMes / dias;
  const tiles = [
    t('chat', 'green', 'Mensajes para contestar', porDiaPartes(ev.mensajesDiaNec), `De esos, ${f1(nuevosDia)} son nuevos por el plan.`),
    t('personas', 'teal', 'Clientes nuevos', porDiaPartes(E.meta.mesNormal / dias), 'En un mes normal del plan, lo esperado.'),
  ];
  if (ev.alc.campanas) {
    const tk = ev.ads && ev.ads.partes.find(x => x.plat === 'tiktok' && x.modo !== 'continuo');
    tiles.push(tk ? t('sube', 'orange', 'En anuncios', { num: fmtM(tk.bs / tk.dias, mon), uni: `por día, ${tk.dias} días al mes` }, `${fmtM(ev.presupuesto, mon)} al mes, juntados en días fuertes.`) : t('sube', 'orange', 'En anuncios', { num: fmtM(ev.presupuesto / 30, mon), uni: 'por día' }, `${fmtM(ev.presupuesto, mon)} al mes, pagados directo a la plataforma.`));
  }
  tiles.push(t('megafono', 'pink', 'Contenido', ev.alc.contenido ? { num: '3', uni: 'videos por semana' } : ev.alc.direccion ? { num: '3', uni: 'guiones por semana' } : { num: '—', uni: '' }, ev.alc.contenido ? 'Tú los haces; él los aprueba en 2 días.' : ev.alc.direccion ? 'Tú das las ideas; su equipo graba.' : 'Su equipo ya hace su contenido.'));
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('sol', 'orange')}Un día normal con el plan</h3><p>desde el mes ${ev.mesPrimeros}</p></div>
    <div class="mosaico">${tiles.join('')}</div>
    <p class="texto">Así se ve un día cuando el plan ya está andando. Úsalo para que el dueño se imagine su día y prepare a su gente.</p></section>`;
}

function htmlClientes(r) {
  const ev = r.ev, E = ev.escenarios, max = Math.max(1, E.techo.N);
  const fila = (t, s, val, col) => `<div class="barra-fila"><div class="eti">${t}<small>${s}</small></div><div class="pista"><i style="width:${val / max * 100}%;background:var(${col})"></i></div><div class="val">${f1(val)}</div></div>`;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('personas', 'teal')}Clientes nuevos que puede tener</h3><p>en ${ev.D} meses</p></div>
    <div class="barras">${fila('Lo mínimo', 'piso', E.piso.N, '--s2')}${fila('Lo esperado', 'meta', E.meta.N, '--s1')}${fila('Si sale muy bien', 'techo', E.techo.N, '--s3')}</div>
    <p class="texto">${ev.alc.guia ? 'Esto también depende de que atienda bien a los que lleguen.' : 'Esto sale de tus anuncios y tu contenido.'} Cuento también a los que compran justo después del plan${ev.limitadoPorCapacidad ? ', y quité a los que no le caben' : ''}.</p></section>`;
}
function htmlSalud(r) {
  const ev = r.ev, d = ev.diag;
  const ic = { atraer: ['personas', 'blue'], confianza: ['corazon', 'pink'], cerrar: ['bolsa', 'green'] };
  const est = s => s <= 0 ? ['ok', 'Bien'] : s <= 2 ? ['ojo', 'Más o menos'] : ['no', 'Mal'];
  const filas = d.etapas.map(e => {
    const [c, t] = est(e.sev), urg = d.restriccion && d.restriccion.id === e.id;
    return `<div class="salud-fila">${icoSq(ic[e.id][0], ic[e.id][1])}<div><h4>${esc(e.nombre)}${urg ? '<span class="urgente">Lo más urgente</span>' : ''}</h4>
      <p>${e.notas.length ? esc(e.notas[0]) : 'No veo problemas aquí.'}</p>
      ${e.notas.length > 1 ? `<details><summary>Ver ${e.notas.length - 1} más</summary><ul>${e.notas.slice(1).map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}</div><span class="etq ${c}">${t}</span></div>`;
  }).join('');
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('lista', 'red')}Así está su negocio hoy</h3></div>
    <div class="salud">${filas}</div><p class="texto">Atraer gente y dar confianza lo arreglas tú. Vender lo enseñas tú, pero lo hacen ellos.</p></section>`;
}
function htmlTesoro(r) {
  const ev = r.ev;
  const oro = r.hallazgos.find(h => h.tipo === 'oro'), otros = r.hallazgos.filter(h => h.tipo !== 'oro');
  const icH = { trampa: ['alerta', 'orange'], estructura: ['casa', 'teal'], recurrente: ['repetir', 'purple'], escalar: ['sube', 'green'], puerta: ['bolsa', 'indigo'] };
  const lineas = [...r.an.lista].filter(x => x.completa).sort((a, b) => b.puntaje - a.puntaje);
  const barras = lineas.length > 1 ? `<div class="barras">${lineas.map(x => `<div class="barra-fila"><div class="eti">${esc(x.nombre)}${x.id === r.focoId ? '<small>la que potenciamos</small>' : `<small>${x.facturacion > 0 ? fmtP(x.participacion) + ' de lo que vende' : '&nbsp;'}</small>`}</div><div class="pista"><i style="width:${x.puntaje}%;background:${x.id === r.focoId ? 'var(--blue)' : 'var(--gray)'}"></i></div><div class="val">${x.puntaje}</div></div>`).join('')}</div><p class="texto">Los puntos dicen cuánto vale cada cosa que vende: si el cliente vuelve, cuánto le queda, si tiene competencia y si puede crecer.</p>` : '';
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('gema', 'oro')}Dónde está la plata</h3></div>
    ${oro ? `<div class="tesoro">${icoSq('gema', 'oro')}<div><h4>${esc(oro.titulo)}</h4><p>${esc(oro.texto)}</p></div></div>` : ''}
    ${barras}
    ${otros.length ? `<div class="mini-hallazgos">${otros.map(h => { const [i, c] = icH[h.tipo] || ['chispa', 'gray']; return `<div class="mini-hallazgo">${icoSq(i, c)}<div><h4>${esc(h.titulo)}</h4><p>${esc(h.texto)}</p></div></div>`; }).join('')}</div>` : ''}
  </section>`;
}

// ---------- Estrategia ----------
function cplMaximo(r) {
  const ev = r.ev, O = r.oferta && !r.oferta.incompleta && r.oferta.lineaId === ev.foco.id ? r.oferta : null;
  const cacMax = (O ? O.gananciaVida : ev.gL) / 3;
  return { cacMax, cplMax: cacMax * ev.cierre.calif * ev.cierre.plan };
}
function sugerenciaOferta(ev) {
  const t = ev.foco.l.tipo, nom = ev.foco.nombre;
  if (t === 'recurrente') return `Un plan mensual de «${nom}» con algo que se note desde el primer mes, una garantía y un regalo al empezar.`;
  if (t === 'repetida') return `Un paquete o membresía de «${nom}» para que vuelva seguido, con un regalo en la primera compra.`;
  return `«${nom}» con una garantía fuerte y regalos que le quiten trabajo o miedo.`;
}
function fasesPlan(ev) {
  const D = ev.D, opt = ev.modo === 'optimizar', out = [];
  for (let m = 1; m <= D; m++) {
    let t, x;
    if (opt) {
      if (m === 1) { t = 'Revisar y probar'; x = 'Revisar sus anuncios de hoy y probar de 5 a 10 nuevos con su mejor contenido.'; }
      else if (m === 2 && D > 2) { t = 'Quedarse con lo mejor'; x = 'Apagar lo que no vende y pasar la plata a lo que sí.'; }
      else if (m < D) { t = 'Crecer'; x = 'Subir de a poco la plata en los anuncios que venden.'; }
      else { t = 'Medir y decidir'; x = 'Comparar con cómo estaba al empezar y decidir cómo seguir.'; }
    } else {
      if (m === 1) { t = 'Preparar'; x = 'Oferta, guiones, mensajes de venta y anuncios. Escribir a los que no compraron.'; }
      else if (m === 2 && D > 2) { t = 'Lanzar'; x = 'Publicar todas las semanas y probar de 3 a 5 anuncios.'; }
      else if (m === 3 && D > 3) { t = 'Ajustar'; x = 'Dejar lo que trae gente buena y apagar lo demás.'; }
      else if (m < D) { t = 'Crecer'; x = 'Más de lo que funciona. Mostrar casos de clientes nuevos.'; }
      else { t = 'Cosechar y medir'; x = 'Revisar la promesa con números y decidir cómo seguir.'; }
    }
    const ult = out[out.length - 1];
    if (ult && ult.t === t) ult.hasta = m; else out.push({ desde: m, hasta: m, t, x });
  }
  return out;
}
function htmlEstrategia(r) {
  const ev = r.ev, p = estado.prospecto, mon = ev.R.moneda, icp = r.icp, O = r.oferta && !r.oferta.incompleta ? r.oferta : null;
  const { cplMax } = cplMaximo(r);
  const peor = icp && icp.lista.length > 1 ? icp.lista[icp.lista.length - 1] : null;
  const tipoTxt = ev.tipo === 'b2b' ? 'empresas' : 'personas';
  const resp = { '5min': 'en minutos', hora: 'en menos de 1 hora', dia: 'en el día', mas: 'en más de un día', nose: '' }[p.hoy.respuesta] || '';
  const pasos = [
    ['personas', 'blue', 'A quién le hablamos', icp ? `A «${icp.mejor.nombre}». Cada uno le deja ${fmtM(icp.mejor.gananciaCliente, mon)} al año.` : `A ${tipoTxt} que ya compran «${ev.foco.nombre}» y pueden pagarlo.`,
      icp ? (peor ? `A quién no: «${peor.nombre}». Deja poco o da mucho trabajo.` : '') : 'Anota sus tipos de clientes (paso 6) y te digo cuál es el mejor.'],
    ['regalo', 'pink', 'Qué le ofrecemos', O ? `«${O.deseo || O.nombre}»${O.tiempo ? `, ${O.tiempo}` : ''}.` : sugerenciaOferta(ev),
      O ? `Oferta ${O.puntaje >= 75 ? 'irresistible' : O.puntaje >= 50 ? 'buena' : 'floja'} (${O.puntaje} de 100). Detalle abajo.` : 'Ármala en el paso 6: ahí ves cuánto cuesta y si deja ganancia.'],
    ['megafono', 'orange', 'Qué publicamos', ev.alc.contenido ? '3 videos por semana. Tú los haces; él los aprueba.' : ev.alc.direccion ? 'Tú das 3 guiones por semana; su equipo los graba.' : 'Su equipo sigue con su contenido; tú le das ideas cada mes.',
      'De cada 10 publicaciones: 6 enseñan (errores, precios, cómo elegir), 3 muestran casos y clientes reales, 1 invita a comprar.'],
    ['sube', 'green', 'Cómo lo promocionamos', ev.ads ? `${ev.ads.nombrePlataforma}, objetivo «${ev.ads.objetivoNombre}», con ${fmtM(ev.presupuesto, mon)} al mes. Usamos como anuncio los videos que más gustaron. Detalle abajo.` : ev.alc.campanas ? `${fmtM(ev.presupuesto, mon)} al mes en anuncios. Usamos como anuncio los videos que más gustaron.` : 'Sin anuncios por ahora: contenido y recomendaciones.',
      ev.alc.campanas && cplMax > 0 ? `Lo máximo que conviene pagar para que alguien escriba: ${fmtM(cplMax, mon)}. Si cuesta más, se cambia el anuncio.` : ''],
    ['chat', 'teal', 'Cómo cerramos la venta', 'Contestar en menos de 5 minutos, mandar el precio en menos de 2 días y volver a escribir a los 1, 3 y 7 días.',
      `Con el plan le escribirían unas ${f1(ev.mensajesDiaNec)} personas por día.${resp ? ` Hoy contesta ${resp}.` : ''}`],
    ['lista', 'indigo', 'Cómo medimos', 'Anotar de dónde viene cada cliente y revisar cada semana: personas que escribieron, ventas y cuánto costó cada venta.',
      p.hoy.mide === 'si' ? 'Ya lo anota: bien.' : 'Hoy no lo anota siempre: es lo primero que hay que arreglar.'],
  ];
  const fases = fasesPlan(ev);
  const ta = n(p.negocio.temporadaAlta);
  const cal = `<ol class="calendario">${fases.map(f => `<li><span class="cal-mes">${f.desde === f.hasta ? `Mes ${f.desde}` : `Meses ${f.desde}–${f.hasta}`}</span><b>${esc(f.t)}</b><p>${esc(f.x)}</p></li>`).join('')}</ol>`;
  const hitos = [`Primeros clientes del plan: mes ${ev.mesPrimeros}`, ev.escenarios.meta.recupero ? `Recupera su plata: mes ${ev.escenarios.meta.recupero}` : null, ta ? `Su mes fuerte es ${MESES[ta - 1]}: que el plan ya esté en «Crecer» un mes antes.` : null].filter(Boolean);
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('camino', 'indigo')}La estrategia</h3><p>de quién a cómo medimos</p></div>
    <ol class="estrategia">${pasos.map(([ic, col, t, x, s], i) => `<li>${icoSq(ic, col)}<div><h4><span class="nro-paso">${i + 1}</span>${esc(t)}</h4><p>${esc(x)}</p>${s ? `<p class="sub">${esc(s)}</p>` : ''}</div></li>`).join('')}</ol>
    <h4 class="sub-titulo">${icoSq('calendario', 'red')}Mes a mes</h4>${cal}
    <ul class="hitos">${hitos.map(h => `<li>${esc(h)}</li>`).join('')}</ul></section>`;
}

// ---------- Oferta irresistible ----------
const PARTES_OFERTA = [
  ['deseo', 20, 'Lo que quiere lograr', 'Escribe el resultado que busca, con sus palabras.'],
  ['prob', 25, 'Que crea que funciona', 'Agrega una garantía y muestra casos de clientes.'],
  ['tiempo', 20, 'Que sea rápido', 'Dile en cuánto tiempo lo logra.'],
  ['esfuerzo', 20, 'Que sea fácil', 'Agrega regalos que le quiten trabajo, o que pague en cuotas.'],
  ['valor', 15, 'Que valga más de lo que cuesta', 'Suma regalos que valgan mucho para él y te cuesten poco: que todo junto valga 3 veces el precio.'],
];
const TXT_GARANTIA = { devolucion: 'Si no queda conforme, le devolvemos su plata.', repetir: 'Si algo sale mal, lo hacemos de nuevo sin costo.', resultado: 'Si no logra el resultado, no paga.' };
const TXT_URGENCIA = { cupos: 'Cupos limitados cada mes.', fecha: 'Precio especial hasta una fecha.', temporada: 'Antes de que llegue la temporada.' };
const TXT_PAGO = { contado: 'todo junto', cuotas: 'en cuotas', mensual: 'cada mes' };
function ganchosOferta(O, r) {
  const p = estado.prospecto, ev = r.ev, mon = ev.R.moneda, prod = minus1(O.nombre), ciudad = p.negocio.ciudad || 'su ciudad';
  const quien = r.icp ? minus1(r.icp.mejor.nombre) : (ev.tipo === 'b2b' ? 'las empresas' : 'las personas');
  const g = [];
  if (O.deseo) g.push(['Para que lo conozcan', `Cómo lograr ${O.deseo}`]);
  g.push(['Para que lo conozcan', `3 errores que cometen ${quien} antes de comprar ${prod}`]);
  g.push(['Para que confíe', `Cuánto cuesta de verdad ${prod} en ${ciudad} (y por qué cambia tanto)`]);
  g.push(['Para que confíe', 'Le pasó a un cliente: así lo resolvimos']);
  g.push(['Para que compre', `Todo lo que recibe por ${fmtM(O.precio, mon)}${O.valorTotal > O.precio ? ` (y lo que vale: ${fmtM(O.valorTotal, mon)})` : ''}`]);
  return g;
}
function htmlOfertaResumen(r, compacto) {
  const O = r.oferta, ev = r.ev, mon = ev.R.moneda;
  const cal = O.puntaje >= 75 ? ['ok', 'Irresistible'] : O.puntaje >= 50 ? ['ojo', 'Buena'] : ['no', 'Floja'];
  const col = O.puntaje >= 75 ? 'var(--green)' : O.puntaje >= 50 ? 'var(--orange)' : 'var(--red)';
  const calif = ev.cierre.calif, cierre = ev.cierre.plan;
  const cplMax = O.cacMax * calif * cierre;
  const tile = (k, v, s) => `<div class="mesa-item"><span class="kicker">${esc(k)}</span><span class="grande">${esc(v)}</span><p>${esc(s)}</p></div>`;
  const cv = O.cambioVentas;
  const tiles = [
    tile('Todo junto vale', fmtVeces(O.ratio), `lo que paga (${fmtM(O.valorTotal, mon)} por ${fmtM(O.precio, mon)}).`),
    tile('Te queda por venta', fmtM(O.gananciaVenta, mon), `Antes: ${fmtM(O.gananciaVentaBase, mon)}. Ya resté regalos y garantía.`),
    tile('Para ganar lo mismo', cv === null ? '—' : Math.abs(cv) < 0.01 ? 'Igual' : cv > 0 ? `+${fmtN(cv * 100)}%` : `${fmtN(cv * 100)}%`, cv === null ? 'La oferta no deja ganancia.' : Math.abs(cv) < 0.01 ? 'Vende lo mismo y gana lo mismo.' : cv > 0 ? `Tiene que vender ${fmtN(cv * 100)}% más que hoy, porque regalos y garantía cuestan.` : `Puede vender ${fmtN(-cv * 100)}% menos y ganar lo mismo.`),
    tile('Lo máximo para conseguir un cliente', fmtM(O.cacMax, mon), `Por persona que escribe: hasta ${fmtM(cplMax, mon)}.`),
  ];
  const prueba = estado.prospecto.hoy.contenidoPrueba, faltaBonos = Math.max(0, 3 - O.bonos.length);
  const tips = {
    deseo: 'Escribe el resultado que busca, con sus palabras.',
    prob: O.garantia === 'ninguna' ? `Agrega una garantía.${prueba !== 'bastante' ? ' Y muestra casos de clientes.' : ''}` : 'Muestra más casos y opiniones de clientes en el contenido.',
    tiempo: 'Dile en cuánto tiempo lo logra.',
    esfuerzo: faltaBonos > 0 ? `Agrega ${faltaBonos === 1 ? 'un regalo' : faltaBonos + ' regalos'} que le quite${faltaBonos === 1 ? '' : 'n'} trabajo.${O.pago === 'contado' ? ' O deja que pague en cuotas.' : ''}` : 'Deja que pague en cuotas o cada mes.',
    valor: `Hoy todo junto vale ${fmtN(O.ratio, 1)} veces el precio. Suma regalos que valgan mucho y te cuesten poco, hasta llegar a 3 veces.`,
  };
  const partes = PARTES_OFERTA.map(([k, max, t]) => { const v = O.partes[k] || 0, pc = v / max, tip = tips[k]; return `<div class="barra-fila"><div class="eti">${esc(t)}<small>${pc >= 0.99 ? 'Completo' : esc(tip)}</small></div><div class="pista"><i style="width:${pc * 100}%;background:${pc >= 0.99 ? 'var(--green)' : pc >= 0.5 ? 'var(--orange)' : 'var(--red)'}"></i></div><div class="val">${v}<small style="font-size:12px;color:var(--text-2)">/${max}</small></div></div>`; }).join('');
  const head = `<div class="oferta-cab"><div class="anillo chico" role="img" aria-label="${O.puntaje} de 100">${anillo(O.puntaje, col, 72, 8)}</div><div><span class="etq ${cal[0]}">${cal[1]}</span><p class="texto">${O.puntaje >= 75 ? 'Cuesta decirle que no.' : O.puntaje >= 50 ? 'Va bien. Mira qué le falta para que sea irresistible.' : 'Todavía es solo un producto con precio. Súmale lo que le falta.'}</p></div></div>`;
  if (compacto) return head + `<div class="mesa">${tiles.join('')}</div>`;
  const filasValor = [[`«${O.nombre}»`, O.valorProducto, null], ...O.bonos.map(b => [b.nombre || 'Regalo sin nombre', n(b.valor), n(b.costo)])];
  const stack = `<div class="tabla-envoltura"><table class="stack"><thead><tr><th>Lo que recibe</th><th class="n">Vale para él</th><th class="n">Te cuesta</th></tr></thead><tbody>${filasValor.map(([t, v, c]) => `<tr><td>${esc(t)}</td><td class="n">${esc(fmtM(v, mon))}</td><td class="n">${c === null ? esc(fmtM(O.costoBase, mon)) : esc(fmtM(c, mon))}</td></tr>`).join('')}
    ${O.reserva > 0 ? `<tr><td>Reserva para la garantía <small>(${fmtN(O.uso * 100)} de cada 100 la usan)</small></td><td class="n">—</td><td class="n">${esc(fmtM(O.reserva, mon))}</td></tr>` : ''}
    <tr class="total"><td>Todo junto</td><td class="n">${esc(fmtM(O.valorTotal, mon))}</td><td class="n">${esc(fmtM(O.costoBase + O.costoBonos + O.reserva, mon))}</td></tr>
    <tr class="total"><td>Precio${O.pago !== 'contado' ? ` (${TXT_PAGO[O.pago]})` : ''}</td><td class="n" colspan="2">${esc(fmtM(O.precio, mon))}${O.subePct > 0.005 ? ` <small>(${fmtN(O.subePct * 100)}% más que hoy)</small>` : O.subePct < -0.005 ? ` <small>(${fmtN(-O.subePct * 100)}% menos que hoy)</small>` : ''}</td></tr></tbody></table></div>`;
  const lista = [
    O.deseo ? ['Lo que logra', O.deseo] : null, O.tiempo ? ['Qué tan rápido', O.tiempo] : null,
    O.bonos.length ? ['Incluye de regalo', O.bonos.map(b => b.nombre).filter(Boolean).join(' · ')] : null,
    O.garantia !== 'ninguna' ? ['Garantía', TXT_GARANTIA[O.garantia]] : null, O.urgencia !== 'ninguna' ? ['Por qué ahora', TXT_URGENCIA[O.urgencia]] : null,
  ].filter(Boolean);
  const ganchos = ganchosOferta(O, r);
  const margenBajo = O.margenEfectivo < 0.15;
  return head + `${lista.length ? `<div class="oferta-frase">${lista.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
    <div class="mesa">${tiles.join('')}</div>
    ${margenBajo ? `<p class="texto">${ICO.no} <b>Ojo:</b> con estos regalos y esta garantía le quedan solo ${fmtN(O.margenEfectivo * 100)} de cada 100. Quita regalos caros o sube el precio.</p>` : ''}
    <h4 class="sub-titulo">Qué tan irresistible es</h4><div class="barras ancho">${partes}</div>
    <h4 class="sub-titulo">Lo que recibe y lo que te cuesta</h4>${stack}
    <h4 class="sub-titulo">Ideas de videos para promocionarla</h4>
    <ul class="ganchos">${ganchos.map(([e, g]) => `<li><span class="etq azul">${esc(e)}</span>${esc(g)}</li>`).join('')}</ul>
    <p class="texto">Los videos que mejor funcionen se vuelven anuncios. Así el contenido y los anuncios venden la misma oferta.</p>`;
}
function htmlOferta(r) {
  const O = r.oferta;
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('regalo', 'pink')}Oferta irresistible</h3><p>${O && !O.incompleta ? esc(O.nombre) : ''}</p></div>`;
  if (!O) return `<section class="tarjeta">${cab}<p class="texto">Todavía no armaste una oferta. Una buena oferta hace que el contenido y los anuncios vendan más con la misma plata.</p><div><button class="btn-g btn-chico" type="button" data-ir-clave="oferta.activa" data-ir-paso2="6">Armar la oferta ›</button></div></section>`;
  if (O.incompleta) return `<section class="tarjeta">${cab}<p class="texto">Falta el precio de «${esc(O.nombre)}» (paso 3).</p></section>`;
  return `<section class="tarjeta">${cab}${htmlOfertaResumen(r, false)}</section>`;
}

// ---------- Cliente ideal ----------
const TXT_PAGA = { atiempo: 'paga a tiempo', tarde: 'paga tarde', muytarde: 'paga muy tarde' };
const TXT_LIO = { poco: 'da poco trabajo', normal: 'trabajo normal', mucho: 'da mucho trabajo' };
function htmlICPTabla(icp, compacto) {
  const mon = estado.reglas.moneda;
  const filas = icp.lista.map((s, i) => `<div class="barra-fila"><div class="eti">${esc(s.nombre)}<small>${fmtM(s.gananciaCliente, mon)} al año · ${esc(TXT_PAGA[s.paga] || '')} · ${esc(TXT_LIO[s.lio] || '')}</small></div><div class="pista"><i style="width:${Math.max(2, s.puntaje)}%;background:${i === 0 ? 'var(--green)' : 'var(--gray)'}"></i></div><div class="val">${s.puntaje}</div></div>`).join('');
  const m = icp.mejor, peor = icp.lista.length > 1 ? icp.lista[icp.lista.length - 1] : null;
  return `<div class="barras ancho">${filas}</div>
    <p class="texto"><b>Su cliente ideal: «${esc(m.nombre)}».</b> Cada uno le deja ${esc(fmtM(m.gananciaCliente, mon))} al año${icp.vecesPromedio && icp.vecesPromedio > 1.05 ? `: ${fmtN(icp.vecesPromedio, 1)} veces lo que deja un cliente promedio` : ''}.${compacto ? '' : ' Haz el contenido y los anuncios pensando en ellos: lo que les preocupa, cómo hablan, dónde están.'}${peor && !compacto ? ` A «${esc(peor.nombre)}» no le hables: deja poco o da mucho trabajo.` : ''}</p>`;
}
function htmlICP(r) {
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('personas', 'green')}Su cliente ideal</h3><p>el que más le conviene</p></div>`;
  if (!r.icp) return `<section class="tarjeta">${cab}<p class="texto">Anota sus tipos de clientes (por ejemplo: clínicas, oficinas, restaurantes) y te digo a cuál conviene hablarle.</p><div><button class="btn-g btn-chico" type="button" data-ir-clave="oferta.segmentos" data-ir-paso2="6">Anotarlos ›</button></div></section>`;
  return `<section class="tarjeta">${cab}${htmlICPTabla(r.icp, false)}<p class="texto">Los puntos miran cuánto le deja cada cliente al año, si paga a tiempo y si da trabajo.</p></section>`;
}
function htmlMesa(r) {
  const ev = r.ev, mon = ev.R.moneda, c = ev.cierre, items = [];
  const viejos = n(estado.prospecto.hoy.viejos);
  if (viejos > 0) { const cl = viejos * n(ev.sup.reactivacionPct) / 100; items.push(`<div class="mesa-item"><span class="kicker">Volver a escribir a los que no compraron</span><span class="grande">${esc(fmtM(cl * ev.g1, mon))}</span><p>De ${fmtN(viejos)} personas, unas ${f1(cl)} comprarían si les escriben bien. Le das el mensaje; ellos lo mandan.</p></div>`); }
  if (c.plan > c.hoy * 1.05) items.push(`<div class="mesa-item"><span class="kicker">Atender mejor</span><span class="grande">${fmtN(c.hoy * 100, 1)} → ${fmtN(c.plan * 100, 1)}</span><p>De cada 100 personas que sí pueden comprar, cuántas compran hoy y cuántas comprarían con tu guía.</p></div>`);
  if (!items.length) return '';
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('monedas', 'orange')}Plata que ya está ahí</h3><p>sin gastar más en anuncios</p></div><div class="mesa">${items.join('')}</div></section>`;
}

// ---------- Plata ----------
function htmlDeDonde(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda, vm = E.meta.valorFuente;
  const total = Math.max(1, vm.campanas + vm.contenido + vm.guia);
  const partes = [['Tus anuncios', vm.campanas, 'var(--s1)'], ['Tu contenido', vm.contenido, 'var(--s3)'], ['Si atienden mejor', vm.guia, 'var(--gray)']].filter(x => x[1] > 0.5);
  if (!partes.length) return '';
  const tuyos = Math.round((1 - E.meta.dependencia) * 10);
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('monedas', 'green')}¿De dónde sale lo que gana?</h3><p>en lo esperado, primer año</p></div>
    <div class="split" role="img" aria-label="${partes.map(p => `${p[0]}: ${fmtM(p[1], mon)}`).join(', ')}">${partes.map(p => `<i style="width:${p[1] / total * 100}%;background:${p[2]}"></i>`).join('')}</div>
    <div class="leyenda">${partes.map(p => `<span><i style="background:${p[2]}"></i>${esc(p[0])} <b>${esc(fmtM(p[1], mon))}</b></span>`).join('')}</div>
    <p class="texto"><b>${tuyos} de cada 10 bolivianos</b> que gana salen de tu trabajo.${E.meta.dependencia > 0.4 ? ' El resto depende de que atiendan mejor: por eso le prometes personas interesadas, no ventas.' : ''}</p></section>`;
}
function htmlPlata(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda, em = E.meta;
  const hasta = Math.min(em.H, Math.max(ev.D + 6, (em.recupero || 0) + 2, (E.piso.recupero || 0) + 2));
  let tabla = ''; for (let m = 1; m <= hasta; m++) tabla += `<tr><td class="n">${m}</td><td class="n">${fmtN(em.cierres[m] || 0, 1)}</td><td class="n">${esc(fmtM(em.cos[m], mon))}</td><td class="n">${esc(fmtM(em.gan[m], mon))}</td><td class="n">${esc(fmtM(em.acum[m], mon))}</td></tr>`;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('grafico', 'indigo')}Su plata, mes a mes</h3></div>
    <p class="texto">Piensa en una alcancía. Cada mes sale plata para pagarte a ti y a los anuncios, y los clientes nuevos van metiendo plata de vuelta. Al principio sale más de lo que entra${ev.retrasoCobro > 0 ? ' (además le pagan tarde)' : ''}, por eso la línea baja. Cuando vuelve a pasar el 0, ya recuperó todo. <button type="button" class="btn-borde" data-detalle="recupera">Ver explicación ›</button></p>
    <div class="leyenda"><span><i style="background:var(--s2)"></i>Lo mínimo</span><span><i style="background:var(--s1)"></i>Lo esperado</span><span><i style="background:var(--s3)"></i>Si sale muy bien</span></div>
    <div class="grafico" id="grafico"></div>
    <details><summary class="btn-borde" style="display:inline-flex;cursor:pointer">Ver la tabla mes a mes</summary><div class="tabla-envoltura"><table><thead><tr><th class="n">Mes</th><th class="n">Clientes nuevos</th><th class="n">Pone</th><th class="n">Gana</th><th class="n">Acumulado</th></tr></thead><tbody>${tabla}</tbody></table></div></details></section>`;
}
function htmlSens(r) {
  const ev = r.ev, mon = ev.R.moneda;
  const items = (r.sens || []).filter(s => s.delta < -1 || s.deltaLargo < -1);
  if (!items.length) return '';
  const max = Math.max(1, ...items.map(s => -s.delta));
  const filas = items.map(s => {
    const anio = -s.delta > 1, cambia = ev.veredicto !== 'no' && s.veredicto === 'no';
    return `<div class="sens-fila"><div class="eti">${esc(s.nombre)}${cambia ? ' <span class="etq no">ya no se cumple</span>' : ''}<small>${anio ? `gana ${esc(fmtM(-s.delta, mon))} menos el primer año` : `el primer año no cambia; en total, ${esc(fmtM(-s.deltaLargo, mon))} menos`}</small></div><div class="pista"><i style="width:${anio ? clamp(-s.delta / max * 100, 3, 100) : 3}%"></i></div></div>`;
  }).join('');
  const top = items.find(s => -s.delta > 1) || items[0];
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('balanza', 'orange')}Los números que más pesan</h3><p>si cada uno sale 20% peor</p></div>
    <div class="sens">${filas}</div>
    <p class="texto">El que más importa es <b>${esc(minus1(top.nombre))}</b>. Confírmalo bien antes de firmar: si ese número está mal, todo lo demás cambia.</p></section>`;
}
function porqueServicio(ev, id) {
  const h = estado.prospecto.hoy, a = ev.alc;
  switch (id) {
    case 'estrategia': return [true, 'Sin saber a quién venderle y qué ofrecerle, lo demás no funciona.'];
    case 'contenido': return a.contenido ? [true, 'Nadie le hace contenido todas las semanas.'] : [false, h.equipoContenido ? 'Ya tiene su equipo de video.' : ev.modo === 'optimizar' ? 'El trabajo es mejorar sus anuncios.' : 'No lo elegiste.'];
    case 'direccion': return a.direccion ? [true, 'Tiene quien grabe; tú le dices qué grabar.'] : [false, a.contenido ? 'Ya va dentro del contenido.' : h.equipoContenido && h.contenidoPrueba === 'bastante' ? 'Su contenido ya muestra casos y precios.' : 'No lo elegiste.'];
    case 'campanas': return a.campanas ? [true, ev.modo === 'optimizar' ? `Hoy cada venta por anuncios le cuesta ${fmtM(ev.opt.cpaHoy, ev.R.moneda)}: hay que bajarlo.` : 'Para no depender de la suerte.'] : [false, 'No lo elegiste.'];
    case 'guia': return a.guia ? [true, ev.guiaActiva ? 'Acepta seguirla: contestar rápido y volver a escribir.' : 'Va incluida, pero si no la sigue no cuenta en la promesa.'] : [false, 'Ya atiende bien.'];
    case 'automatizacion': return a.automatizacion ? [true, 'Contesta al instante cuando nadie puede.'] : [false, ['dia', 'mas'].includes(h.respuesta) ? 'Ayudaría porque contesta tarde, pero cuesta cada mes.' : 'Por ahora no hace falta.'];
  }
  return [false, ''];
}
function htmlPrecio(r) {
  const ev = r.ev, mon = ev.R.moneda, R = ev.R, pr = promesaDe(ev);
  const serv = SERVICIOS.map(s => { const [inc, pq] = porqueServicio(ev, s.id); return `<div class="servicio-fila">${inc ? ICO.ok : ICO.na}<h4>${esc(s.nombre)}</h4><p>${esc(pq)}${inc ? ' ' + esc(s.detalle) : ''}</p></div>`; }).join('');
  const hora = ev.horas > 0 ? ev.precio / ev.horas : NaN;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('herramienta', 'gray')}El servicio y el precio</h3><p>${esc(fmtM(ev.precio, mon))} cada mes</p></div>
    <div>${serv}</div>
    <p class="texto"><b>Tu precio es mensual:</b> ${esc(fmtM(ev.precio, mon))} por cada mes de trabajo, mes a mes. El plan sugerido es de ${ev.D} meses porque es lo que tarda en verse todo el resultado.</p>
    <p class="texto"><b>Por qué cobras ${esc(fmtM(ev.precio, mon))}:</b> en un mes normal, contando lo mínimo, llegan unos ${f1(ev.mesNormalPiso)} clientes nuevos. Cada uno le deja ${esc(fmtM(ev.g1, mon))} en un año. Te quedas con ${fraccion(n(R.partePct), mon)}${ev.forzado ? `, pero eso es menos que tu mínimo, así que cobras ${esc(fmtM(n(R.precioMinimo), mon))}` : ev.topePorBolsillo ? `: saldrían ${esc(fmtM(ev.precioSinTope, mon))}, pero lo bajé a ${esc(fmtM(ev.precio, mon))} para que tu precio más los anuncios no pasen de 15 de cada 100 bolivianos que vende` : ''}. Son unas ${fmtN(ev.horas)} horas tuyas al mes${Number.isFinite(hora) ? ` (${esc(fmtM(hora, mon))} por hora)` : ''}.</p>
    <p class="texto"><b>Garantía:</b> ${esc(textoGarantia(ev))} Vale si él cumple su parte: aprobar rápido, pagar los anuncios${ev.guiaActiva ? ', seguir tu guía' : ''} y anotar de dónde viene cada cliente.</p></section>`;
}

// ---------- Revisión ----------
function htmlRevision(r) {
  const ev = r.ev, ch = ev.chequeos.filter(c => c.estado !== 'na');
  const malos = ch.filter(c => c.estado !== 'ok').sort((a, b) => (a.estado === 'no' ? -1 : 1) - (b.estado === 'no' ? -1 : 1));
  const buenos = ch.filter(c => c.estado === 'ok');
  const fila = c => `<li>${ICO[c.estado]}<div><h4>${esc(c.nombre)}${c.critico ? '<span class="crit">importante</span>' : ''}</h4></div><p>${esc(c.detalle)}${c.arreglo ? ` <span class="arreglo">${esc(c.arreglo)}</span>` : ''}</p></li>`;
  const cnt = s => ch.filter(c => c.estado === s).length;
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('lista', 'green')}Revisión de la promesa</h3><div class="revision-resumen"><span class="etq ok">${cnt('ok')} bien</span><span class="etq ojo">${cnt('ojo')} para cuidar</span><span class="etq no">${cnt('no')} mal</span></div></div>
    ${malos.length ? `<ul class="revision">${malos.map(fila).join('')}</ul>` : '<p class="texto">Todo está bien.</p>'}
    ${buenos.length ? `<details><summary class="btn-borde" style="display:inline-flex;cursor:pointer">Ver los ${buenos.length} que están bien</summary><ul class="revision" style="margin-top:8px">${buenos.map(fila).join('')}</ul></details>` : ''}
    <p class="texto">Si algo «importante» sale mal, no prometas. Si solo hay cosas para cuidar, se puede, con condiciones.</p></section>`;
}
function htmlFaltan() {
  const items = clavesImportantes().filter(x => x.estado !== 'ok');
  return `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('pregunta', 'blue')}Lo que falta preguntar</h3><p>${items.length ? `${items.length} pendiente${items.length > 1 ? 's' : ''}` : ''}</p></div>
    ${items.length ? `<ul class="faltan">${items.map(x => `<li><button type="button" data-ir-clave="${esc(x.clave)}" data-ir-paso2="${x.paso}"><span class="punto" style="background:${x.estado === 'falta' ? 'var(--red)' : 'var(--orange)'}"></span><span class="q">${esc(x.txt)}<small>${x.estado === 'falta' ? 'Falta' : 'Lo adiviné: confírmalo'} · paso ${x.paso}</small></span><span class="flecha">›</span></button></li>`).join('')}</ul>` : '<p class="texto">Ya tienes todas las respuestas importantes.</p>'}</section>`;
}
function htmlMas(r) {
  const ev = r.ev, mon = ev.R.moneda, R = ev.R, E = ev.escenarios, mt = ev.foco.mt, c = ev.cierre;
  const tabla = [...r.an.lista].sort((a, b) => b.puntaje - a.puntaje).map(x => { const pl = r.porLinea.find(y => y.id === x.id); return `<tr class="${x.id === r.focoId ? 'destacada' : ''}"><td><b>${esc(x.nombre)}</b><br><span style="color:var(--text-2);font-size:13px">${esc(razonesLinea(x).join(' · '))}</span></td><td class="n">${x.puntaje}</td><td class="n">${x.completa ? esc(fmtM(x.mt.gL, mon)) : '—'}</td><td>${etqVer(pl ? pl.veredicto : 'incompleta')}</td></tr>`; }).join('');
  let valorTxt;
  if (mt.tipo === 'recurrente') valorTxt = `${fmtM(mt.ticket, mon)} al mes × ${fmtN(mt.m * 100)} de cada 100 = le quedan ${fmtM(mt.gMes, mon)} al mes\nEn un año: ${fmtM(mt.g1, mon)} · En total: ${fmtM(mt.gL, mon)}`;
  else if (mt.tipo === 'repetida') valorTxt = `${fmtM(mt.ticket, mon)} por compra × ${fmtN(mt.m * 100)} de cada 100 = le quedan ${fmtM(mt.ticket * mt.m, mon)}\nEn un año (${fmtN(Math.min(mt.totalCompras, mt.ppy), 1)} compras): ${fmtM(mt.g1, mon)} · En total: ${fmtM(mt.gL, mon)}`;
  else valorTxt = `${fmtM(mt.ticket, mon)} × ${fmtN(mt.m * 100)} de cada 100 = le quedan ${fmtM(mt.g1, mon)}`;
  const pasos = [
    ['Cuánto vale un cliente nuevo', 'Cuento lo que le queda, no lo que paga.', valorTxt],
    ['Cuántos compran', `Un negocio ordenado de su tipo vende a ${fmtN(c.bench * 100, 1)} de cada 100 personas que sí pueden comprar.${ev.guiaActiva ? ' Con tu guía, si la sigue, recorre la mitad del camino que le falta.' : ''}`, `Hoy: ${fmtN(c.hoy * 100, 1)} de cada 100${c.medido ? '' : ' (lo adiviné por cómo atiende)'}\nCon el plan: ${fmtN(c.plan * 100, 1)} de cada 100`],
    ['Qué trae el plan en un mes normal', ev.modo === 'optimizar' ? 'La misma plata en anuncios, pero cada venta cuesta menos.' : 'Personas nuevas de tus anuncios y tu contenido, más las que compran porque atiende mejor.',
      ev.modo === 'optimizar' ? `Hoy cada venta cuesta ${fmtM(ev.opt.cpaHoy, mon)}\nVentas al mes: ${f1(ev.promesa.ventasHoy)} → mínimo ${f1(ev.promesa.ventasPiso)}, esperado ${f1(ev.promesa.ventasMeta)}`
        : `${ev.ads ? `Anuncios (${ev.ads.nombrePlataforma}, «${ev.ads.objetivoNombre}»): ${fmtM(ev.presupuesto, mon)} = USD ${fmtN(ev.ads.usd)} → ${fmtN(ev.ads.vistas)} vistas → ${fmtN(ev.ads.resultados)} ${ev.ads.resultadoNombre}${ev.ads.llegadas > 0 ? ` → ${f1(ev.ads.llegadas)} llegan` : ''} → ${f1(ev.ads.clientes)} compran` : 'Sin anuncios'}\nContenido: ${f1(ev.leadsCont)} personas\nClientes nuevos al mes: anuncios ${f1(ev.fuentes.campanas)} · contenido ${f1(ev.fuentes.contenido)} · atender mejor ${f1(ev.fuentes.guia)}`],
    ['Si le caben', 'Cada cliente nuevo ocupa un lugar: si le pagan cada mes, mientras siga pagando; si vuelve a comprar, cada vez que vuelve. Si no hay lugar, ese cliente no lo cuento.', ev.cap.sabe && !ev.cap.legado ? `Lugares libres: ${fmtN(ev.cap.libre)}${ev.cap.extra > 0 ? ` (+${fmtN(ev.cap.extra)} si contrata, desde el mes ${ev.cap.mesContrata + 1})` : ''}\nEl plan necesita hasta ${f1(E.meta.capInfo.necesita)} en el mes ${E.meta.capInfo.mesPico}` : 'Falta saber cuánto puede atender.'],
    ['Cuántos meses dura', 'Un mes para preparar y 4 vueltas de venta: 2 para aprender y 2 para cosechar. Al principio rinde menos.', `1 + 4 × ${fmtN(ev.ciclo)} días ÷ 30 → ${ev.Dauto} meses${ev.D !== ev.Dauto ? ` (lo cambiaste a ${ev.D})` : ''}\nLo mínimo es 2/3 de lo esperado; lo mejor, 4/3.`],
    ['Cuánto cobras', `Te quedas con ${fraccion(n(R.partePct), mon)} que le haces ganar en un mes normal, contando lo mínimo. Nunca menos de ${fmtM(n(R.precioMinimo), mon)}.`, `${f1(ev.mesNormalPiso)} clientes × ${fmtM(ev.g1, mon)} = ${fmtM(ev.valorMesPiso, mon)} al mes\n× ${fmtN(n(R.partePct))} de cada 100 = ${fmtM(ev.precioValor, mon)} → cobras ${fmtM(ev.precio, mon)}`],
    ['Cuánto gana él', `Todo lo que pone, contra lo que le dejan sus clientes nuevos en un año.${ev.retrasoCobro > 0 ? ` Como le pagan a ${fmtN(n(estado.prospecto.negocio.cobroDias))} días, la plata entra ${ev.retrasoCobro} mes${ev.retrasoCobro > 1 ? 'es' : ''} después.` : ''}`, `Pone: ${fmtM(E.meta.invNeta, mon)}\nGana: lo mínimo ${fmtM(E.piso.V1, mon)} (${fmtN(E.piso.roi1, 1)}×) · lo esperado ${fmtM(E.meta.V1, mon)} (${fmtN(E.meta.roi1, 1)}×)`],
  ];
  return `<div class="mas">
    <details><summary>${icoSq('gema', 'oro')}Todo lo que vende</summary><div class="cuerpo"><div class="tabla-envoltura"><table><thead><tr><th>Producto</th><th class="n">Puntos</th><th class="n">Un cliente deja</th><th>Si lo potenciamos</th></tr></thead><tbody>${tabla}</tbody></table></div></div></details>
    <details><summary>${icoSq('lista', 'indigo')}Cómo saqué estos números</summary><div class="cuerpo"><ol class="pasos-calc">${pasos.map(([t, x, f]) => `<li><div><h4>${esc(t)}</h4><p>${esc(x)}</p>${f ? `<div class="formula">${esc(f)}</div>` : ''}</div></li>`).join('')}</ol></div></details>
    <details id="det-ia"><summary>${icoSq('chispa', 'purple')}Segunda opinión de Claude</summary><div class="cuerpo" id="r-ia">${htmlIA(r)}</div></details>
  </div>`;
}

// ---------- Lo mínimo para aceptarlo ----------
function htmlMinimo(r) {
  const ev = r.ev, m = r.minimo, mon = ev.R.moneda, p = estado.prospecto;
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('balanza', 'indigo')}Lo mínimo para aceptarlo</h3><p>tu precio ${esc(fmtM(n(ev.R.precioMinimo), mon))} · anuncios desde ${esc(fmtM(n(ev.R.anunciosMinimo), mon))}</p></div>`;
  const regla = `<p class="texto">«Lo mínimo» es el punto donde <b>él gana al menos 1,2 veces lo que pone, aunque salga lo mínimo</b>, y tu precio más los anuncios no pasan de 15 de cada 100 bolivianos que vende. Por debajo de eso, no conviene ni a él ni a ti.</p>`;
  if (!m) return `<section class="tarjeta">${cab}<p class="texto">Este cálculo es para cuando traes clientes nuevos con anuncios. En «mejorar sus anuncios» lo que manda es si baja el costo de cada venta.</p></section>`;
  if (m.imposible) return `<section class="tarjeta">${cab}
    <p class="texto">${ICO.no} <b>Con estos números no llega al mínimo, ponga lo que ponga en anuncios.</b> Cada cliente nuevo le deja ${esc(fmtM(m.g1, mon))} en su primer año, y conseguirlo cuesta unos ${esc(fmtM(m.costoCliente, mon))} en anuncios, más tu precio. Aunque suba los anuncios, lo mejor que logra es ganar ${fmtN(m.mejorRoi, 1)} veces lo que pone, y el mínimo es 1,2.</p>
    <p class="texto">Para que sí llegue necesita: algo que deje más por cliente, que sus clientes vuelvan más seguido, o atender mejor a los que escriben.</p>${regla}</section>`;
  const fact = ev.R && r.an ? r.an.factNegocio : 0, caja = n(p.negocio.caja);
  const fila = (t, min, hoy, ok, nota) => `<tr><td>${esc(t)}${nota ? `<small>${esc(nota)}</small>` : ''}</td><td class="n">${esc(min)}</td><td class="n">${esc(hoy)}</td><td>${ok === null ? ICO.na : ok ? ICO.ok : ICO.no}</td></tr>`;
  const filas = [
    fila('Anuncios al mes', fmtM(m.pres, mon), fmtM(ev.presupuesto, mon), ev.presupuesto >= m.pres, m.pres > m.adsMin ? `tu mínimo es ${fmtM(m.adsMin, mon)}, pero a este negocio le hace falta más` : ''),
    fila('Lo que vende al mes', fmtM(m.ventasMin, mon), fact > 0 ? fmtM(fact, mon) : '—', fact > 0 ? fact >= m.ventasMin * 0.995 : null, `cómodo desde ${fmtM(m.ventasComodo, mon)}`),
    fila('Plata guardada para los primeros meses', fmtM(m.cajaMin, mon), caja > 0 ? fmtM(caja, mon) : '—', caja > 0 ? caja >= m.cajaMin * 0.95 : null, 'lo más abajo que va antes de recuperar'),
    fila('Lo que le deja cada cliente nuevo en un año', `más de ${fmtM(m.costoCliente, mon)}`, fmtM(m.g1, mon), m.g1 > m.costoCliente, 'tiene que dejar más de lo que cuesta conseguirlo'),
  ].join('');
  const cm = porDiaPartes(m.clientesMes / ev.dias);
  return `<section class="tarjeta">${cab}
    <div class="tabla-envoltura"><table class="tabla-minimo"><thead><tr><th>Para aceptarlo necesita</th><th class="n">Lo mínimo</th><th class="n">Este cliente</th><th></th></tr></thead><tbody>${filas}</tbody></table></div>
    <div class="mesa">
      <div class="mesa-item"><span class="kicker">Clientes nuevos al mes</span><span class="grande">${f1(m.clientesMes)}</span><p>contando lo mínimo (${esc(cm.num)} ${esc(cm.uni)}).</p></div>
      <div class="mesa-item"><span class="kicker">En un mes normal le dejan</span><span class="grande">${esc(fmtM(m.valorMes, mon))}</span><p>de ganancia en su primer año, contando lo mínimo.</p></div>
      <div class="mesa-item"><span class="kicker">Pone y gana</span><span class="grande">${fmtN(m.roi, 1)}×</span><p>Pone ${esc(fmtM(m.inversion, mon))} en ${m.D} meses y gana ${esc(fmtM(m.gananciaAnio, mon))} en un año, contando lo mínimo.</p></div>
    </div>${regla}</section>`;
}

// =================== Detalle (al tocar un número) ===================
const TIT_DETALLE = { gana: '¿Cuánto gana él?', recupera: '¿Cuándo recupera su plata?', cobras: 'Lo que cobras cada mes', prometes: 'Lo que le prometes' };
function barraH(etq, val, max, col, txt) { return `<div class="bh"><span class="bh-eti">${esc(etq)}</span><div class="bh-pista"><i style="width:${max > 0 ? clamp(val / max * 100, 0, 100) : 0}%;background:${col}"></i></div><b class="bh-val">${esc(txt)}</b></div>`; }
function partesPone(ev) {
  const E = ev.escenarios, c = ev.costosCliente, D = ev.D, mesesAds = Math.max(0, D - ev.inicio + 1);
  return [['Tu trabajo', ev.precio * D, `${fmtM(ev.precio, ev.R.moneda)} × ${D} meses`], ['Anuncios', ev.extraPauta * mesesAds, `${fmtM(ev.extraPauta, ev.R.moneda)} × ${mesesAds} meses`], ['Herramientas', c.herramientas * D, ''], ['Gasto de una vez', c.inicial, ''], ['Lo que deja de pagar', -c.ahorro * D, '']].filter(x => Math.abs(x[1]) > 0.5);
}
function detalleGana(r) {
  const ev = r.ev, E = ev.escenarios, mon = ev.R.moneda;
  const esc3 = [['piso', 'Lo mínimo', 'var(--s2)'], ['meta', 'Lo esperado', 'var(--s1)'], ['techo', 'Si sale muy bien', 'var(--s3)']];
  const max = Math.max(...esc3.map(([k]) => Math.max(E[k].V1, E[k].invNeta)), 1);
  const grupos = esc3.map(([k, t, col]) => `<div class="grupo-barras"><h4>${t} <span class="etq ${E[k].roi1 >= 1.2 ? 'ok' : E[k].roi1 >= 1 ? 'ojo' : 'no'}">${fmtN(E[k].roi1, 1)}×</span></h4>${barraH('Pone', E[k].invNeta, max, 'var(--gray)', fmtM(E[k].invNeta, mon))}${barraH('Le dejan', E[k].V1, max, col, fmtM(E[k].V1, mon))}</div>`).join('');
  const pone = partesPone(ev), tot = pone.reduce((s, x) => s + x[1], 0);
  const vm = E.meta.valorFuente, fuentes = [['Tus anuncios', vm.campanas, 'var(--s1)'], ['Tu contenido', vm.contenido, 'var(--s3)'], ['Si atienden mejor', vm.guia, 'var(--gray)']].filter(x => x[1] > 0.5), totF = Math.max(1, fuentes.reduce((s, x) => s + x[1], 0));
  const mesPone = ev.precio + ev.presupuesto + ev.costosCliente.herramientas - ev.costosCliente.ahorro;
  const mesDejaP = E.piso.mesNormal * ev.g1, mesDejaM = E.meta.mesNormal * ev.g1;
  return `<div class="grande-frase"><span>Por cada <b>Bs 1</b> que pone, le vuelven</span><b class="enorme">Bs ${fmtN(E.piso.roi1, 1)}</b><span>si sale lo mínimo · Bs ${fmtN(E.meta.roi1, 1)} en lo esperado</span></div>
    <h3 class="h-det">Lo que pone y lo que le dejan, en su primer año</h3><div class="grupos-barras">${grupos}</div>
    <p class="texto"><b>«Le dejan»</b> es su ganancia: lo que le queda después de pagar lo que le cuesta su producto, no lo que le pagan. Cuento el primer año de cada cliente nuevo. Si esos clientes siguen comprando después, gana más: en total, unos ${esc(fmtM(E.meta.VL, mon))}.</p>
    <h3 class="h-det">Un mes de trabajo</h3>
    <div class="mesa">
      <div class="mesa-item"><span class="kicker">Cada mes pone</span><span class="grande">${esc(fmtM(mesPone, mon))}</span><p>Tu trabajo ${esc(fmtM(ev.precio, mon))} + anuncios ${esc(fmtM(ev.presupuesto, mon))}${ev.costosCliente.herramientas ? ' + herramientas' : ''}.</p></div>
      <div class="mesa-item"><span class="kicker">Los clientes de un mes normal le dejan</span><span class="grande">${esc(fmtM(mesDejaP, mon))}</span><p>contando lo mínimo (${f1(E.piso.mesNormal)} clientes). En lo esperado: ${esc(fmtM(mesDejaM, mon))}.</p></div>
    </div>
    <p class="texto">Ojo: los primeros meses rinden menos (hay que preparar y aprender), por eso el resultado completo se ve en ${ev.D} meses.</p>
    <h3 class="h-det">De dónde sale lo que pone</h3>
    <div class="tabla-envoltura"><table><tbody>${pone.map(([t, v, x]) => `<tr><td>${esc(t)}${x ? `<small class="sub-td">${esc(x)}</small>` : ''}</td><td class="n">${esc(fmtM(v, mon))}</td></tr>`).join('')}<tr class="total"><td><b>Total en ${ev.D} meses</b></td><td class="n"><b>${esc(fmtM(tot, mon))}</b></td></tr></tbody></table></div>
    ${fuentes.length ? `<h3 class="h-det">De dónde sale lo que le dejan</h3><div class="split">${fuentes.map(x => `<i style="width:${x[1] / totF * 100}%;background:${x[2]}"></i>`).join('')}</div><div class="leyenda">${fuentes.map(x => `<span><i style="background:${x[2]}"></i>${esc(x[0])} <b>${esc(fmtM(x[1], mon))}</b></span>`).join('')}</div>` : ''}`;
}
function graficoMeses(ev, hasta) {
  const E = ev.escenarios.meta, mon = ev.R.moneda;
  const W = 640, H = 300, ml = 58, mr = 12, mt = 14, mb = 30;
  let min = 0, max = 0;
  for (let m = 1; m <= hasta; m++) { min = Math.min(min, -E.cos[m], E.acum[m]); max = Math.max(max, E.gan[m], E.acum[m]); }
  const t = ticksLindos(min, max, 5), y0 = t[0], y1 = t[t.length - 1];
  const bw = (W - ml - mr) / hasta, x = m => ml + bw * (m - 0.5), y = v => mt + (H - mt - mb) * (1 - (v - y0) / (y1 - y0));
  let g = '';
  for (const v of t) g += `<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" style="stroke:${v === 0 ? 'var(--text-3)' : 'var(--sep)'}"/><text x="${ml - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" style="fill:var(--text-2)">${esc(fmtCompacto(v))}</text>`;
  const ancho = Math.max(3, bw * 0.34);
  for (let m = 1; m <= hasta; m++) {
    if (E.cos[m] > 0) g += `<rect x="${x(m) - ancho - 1}" y="${y(0)}" width="${ancho}" height="${Math.max(0, y(-E.cos[m]) - y(0))}" rx="2" style="fill:var(--orange)"><title>Mes ${m}: sale ${fmtM(E.cos[m], mon)}</title></rect>`;
    if (E.gan[m] > 0) g += `<rect x="${x(m) + 1}" y="${y(E.gan[m])}" width="${ancho}" height="${Math.max(0, y(0) - y(E.gan[m]))}" rx="2" style="fill:var(--green)"><title>Mes ${m}: entra ${fmtM(E.gan[m], mon)}</title></rect>`;
    if (hasta <= 14 || m % 2 === 0) g += `<text x="${x(m)}" y="${H - 10}" text-anchor="middle" font-size="11" style="fill:var(--text-2)">${m}</text>`;
  }
  let dl = ''; for (let m = 1; m <= hasta; m++) dl += `${m === 1 ? 'M' : 'L'}${x(m).toFixed(1)},${y(E.acum[m]).toFixed(1)} `;
  g += `<path d="${dl}" fill="none" style="stroke:var(--blue)" stroke-width="2.5" stroke-linejoin="round"/>`;
  for (let m = 1; m <= hasta; m++) g += `<circle cx="${x(m)}" cy="${y(E.acum[m])}" r="3" style="fill:var(--blue)"><title>Mes ${m}: la alcancía está en ${fmtM(E.acum[m], mon)}</title></circle>`;
  if (E.valleMes > 0 && E.valleMes <= hasta) g += `<circle cx="${x(E.valleMes)}" cy="${y(E.valle)}" r="7" style="fill:none;stroke:var(--text)" stroke-width="2"/>`;
  if (E.recupero && E.recupero <= hasta) g += `<circle cx="${x(E.recupero)}" cy="${y(E.acum[E.recupero])}" r="7" style="fill:none;stroke:var(--green)" stroke-width="2.5"/>`;
  return `<div class="leyenda"><span><i style="background:var(--orange)"></i>Sale ese mes</span><span><i style="background:var(--green)"></i>Entra ese mes</span><span><i style="background:var(--blue)"></i>La alcancía (todo junto)</span></div>
    <div class="grafico-det"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Plata que sale y entra cada mes, y cómo va la alcancía">${g}</svg></div><p class="nota-eje">Abajo: el número de mes. Toca o pasa el dedo por una barra para ver el monto.</p>`;
}
function detalleRecupera(r) {
  const ev = r.ev, E = ev.escenarios.meta, mon = ev.R.moneda, mt = ev.foco.mt;
  const hasta = Math.min(E.H, Math.max(ev.D + 4, (E.recupero || 0) + 2));
  const porque = [`El mes 1 es para preparar: oferta, guiones y anuncios. ${ev.inicio > 1 ? 'Los anuncios arrancan en el mes 2.' : ''}`];
  if (ev.L > 0) porque.push(`Desde que alguien pregunta hasta que paga pasan unos ${fmtN(ev.ciclo)} días: los clientes llegan ${ev.L === 1 ? 'un mes' : ev.L + ' meses'} después.`);
  if (mt.tipo === 'recurrente') porque.push(`Cada cliente no paga todo de golpe: paga ${fmtM(mt.ticket, mon)} cada mes. La plata entra de a poco, mes a mes.`);
  else if (mt.tipo === 'repetida') porque.push(`Cada cliente deja su ganancia de a poco, cada vez que vuelve a comprar (unas ${fmtN(mt.ppy, 1)} veces al año).`);
  if (ev.retrasoCobro > 0) porque.push(`Le pagan a ${fmtN(n(estado.prospecto.negocio.cobroDias))} días: cada venta entra ${ev.retrasoCobro} mes${ev.retrasoCobro > 1 ? 'es' : ''} después.`);
  porque.push('Los primeros meses rinden menos: los anuncios y el contenido mejoran mientras se aprende qué funciona.');
  let filas = ''; for (let m = 1; m <= hasta; m++) filas += `<tr class="${m === E.recupero ? 'destacada' : ''}"><td class="n">${m}</td><td class="n">${esc(fmtM(E.cos[m], mon))}</td><td class="n">${esc(fmtM(E.gan[m], mon))}</td><td class="n">${esc(fmtM(E.acum[m], mon))}</td></tr>`;
  const hondo = -E.valle;
  return `<div class="grande-frase"><span>Recupera todo lo que puso en el</span><b class="enorme">${E.recupero === null ? 'No (en 3 años)' : E.recupero === 0 ? 'Desde el inicio' : 'Mes ' + E.recupero}</b><span>en lo esperado</span></div>
    <p class="texto"><b>Piensa en una alcancía.</b> Cada mes saca plata para pagarte a ti y a los anuncios (naranja). Los clientes nuevos van metiendo plata de vuelta (verde). La línea azul es cuánto hay en la alcancía, todo junto. ${hondo > 0 ? `Lo más abajo que llega es ${esc(fmtM(E.valle, mon))}, en el mes ${E.valleMes}: esa es la plata que tiene que poder aguantar.` : ''} ${E.recupero ? `En el mes ${E.recupero} vuelve a 0: ya le volvió todo lo que puso. Desde ahí, lo que entra es ganancia.` : ''}</p>
    ${graficoMeses(ev, hasta)}
    <h3 class="h-det">¿Por qué tarda?</h3><ul class="lista-simple">${porque.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="texto">Que tarde no quiere decir que pierde: quiere decir que la ganancia llega después del gasto. Por eso conviene acordar el plan completo de ${ev.D} meses, aunque pague mes a mes.</p>
    <details><summary class="btn-borde" style="display:inline-flex;cursor:pointer">Ver la tabla mes a mes</summary><div class="tabla-envoltura"><table><thead><tr><th class="n">Mes</th><th class="n">Sale</th><th class="n">Entra</th><th class="n">Alcancía</th></tr></thead><tbody>${filas}</tbody></table></div></details>`;
}
function detalleCobras(r) {
  const ev = r.ev, mon = ev.R.moneda, R = ev.R, E = ev.escenarios;
  const serv = SERVICIOS.filter(s => ev.alc[s.id]);
  const hora = ev.horas > 0 ? ev.precio / ev.horas : NaN;
  const maxH = Math.max(1, ...serv.map(s => n(R.horas[s.id])));
  return `<div class="grande-frase"><span>Le cobras</span><b class="enorme">${esc(fmtM(ev.precio, mon))}</b><span>cada mes · se paga mes a mes</span></div>
    <p class="texto">Tu precio es <b>por mes de trabajo</b>, no por todo el plan. Cada mes haces todo esto:</p>
    <div class="barras-horas">${serv.map(s => barraH(s.nombre, n(R.horas[s.id]), maxH, 'var(--blue)', `${fmtN(n(R.horas[s.id]))} h`)).join('')}</div>
    <p class="texto">Son unas ${fmtN(ev.horas)} horas al mes${Number.isFinite(hora) ? `: tu hora sale a ${esc(fmtM(hora, mon))}` : ''}.</p>
    <h3 class="h-det">Por qué ese precio</h3>
    <div class="formula">${esc(`En un mes normal (contando lo mínimo) llegan ${f1(ev.mesNormalPiso)} clientes nuevos\n× cada uno le deja ${fmtM(ev.g1, mon)} en su primer año\n= ${fmtM(ev.valorMesPiso, mon)} que le haces ganar en un mes\n× ${fmtN(n(R.partePct))} de cada 100 = ${fmtM(ev.precioValor, mon)}${ev.forzado ? `\nEs menos que tu mínimo: cobras ${fmtM(n(R.precioMinimo), mon)}` : `\n→ cobras ${fmtM(ev.precio, mon)}`}`)}</div>
    <h3 class="h-det">¿Y los ${ev.D} meses?</h3>
    <p class="texto">No es un pago de ${ev.D} meses juntos. Es cuánto tarda en verse el resultado completo: un mes para preparar y varias vueltas de venta para aprender y cosechar. Si él para antes, paga solo los meses trabajados, pero se pierde la parte en que más gana. En ${ev.D} meses te paga ${esc(fmtM(ev.precio * ev.D, mon))} en total.</p>`;
}
function detallePrometes(r) {
  const ev = r.ev, pr = promesaDe(ev), mon = ev.R.moneda, P = ev.promesa;
  const que = {
    interesados: `Prometes <b>personas interesadas que sí pueden comprar</b>, no ventas: traerlas depende de ti (anuncios y contenido). Que compren depende también de cómo atienden ellos.`,
    llegadas: `Prometes <b>personas que llegan a la tienda con el cupón</b>, no ventas: traerlas depende de ti (videos, anuncios y cupón). Lo que pasa adentro de la tienda (precio, atención, producto) depende de ellos. Se cuentan los cupones validados en la tienda.`,
    visitas: `Prometes <b>personas que entran a su página web</b>: eso depende de tus anuncios. Que compren depende de su web, sus precios y su atención.`,
    alcance: `Prometes <b>personas de su zona que ven sus videos</b>. Ojo: eso solo calienta a la gente; para clientes este mes conviene otro objetivo.`,
  }[P.tipo];
  return `<div class="grande-frase"><span>Le prometes</span><b class="enorme">${esc(pr.grande)}</b><span>${esc(pr.unidad)}</span></div>
    <p class="texto">${esc(pr.frase[0].toUpperCase() + pr.frase.slice(1))}, ${P.tipo !== 'ventas' ? `entre el mes 2 y el ${ev.D}.` : 'en lo que dura el plan.'}</p>
    <p class="texto">${P.tipo !== 'ventas' ? `${que} ${P.costoResultado > 0 ? `Cada una cuesta unos ${esc(fmtM(P.costoResultado, mon))} en anuncios.` : ''} Es el número más bajo esperado: lo normal es llegar a más.` : `Prometes <b>ventas por anuncios</b> porque ya tiene anuncios que venden y sabemos cuánto le cuesta cada venta hoy (${esc(fmtM(P.cpaHoy, mon))}). Con lo mínimo, cada venta costaría unos ${esc(fmtM(P.cpaPiso, mon))}.`}</p>
    <p class="texto"><b>Garantía:</b> ${esc(textoGarantia(ev))}</p>`;
}
function textoGarantia(ev) {
  const t = String(ev.R.garantiaTexto || '').trim(), fr = promesaDe(ev).frase;
  if (t) return t.replace(/\{meses\}/g, String(ev.D)).replace(/\{promesa\}/g, fr);
  return `si al mes ${ev.D} no llegamos a ${fr}, sigo trabajando sin cobrar hasta llegar, siempre que el dueño cumpla su parte.`;
}
function abrirDetalle(tipo) {
  const dlg = $('#detalle'); if (!dlg || !ultimo || !ultimo.ev) return;
  estado.detalle = tipo;
  $('#detalle-tit').textContent = TIT_DETALLE[tipo] || 'Detalle';
  const f = { gana: detalleGana, recupera: detalleRecupera, cobras: detalleCobras, prometes: detallePrometes }[tipo];
  $('#detalle-cuerpo').innerHTML = f ? f(ultimo) : '';
  if (!dlg.open) { try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); } }
}
function cerrarDetalle() { const dlg = $('#detalle'); estado.detalle = null; if (dlg && dlg.open) { try { dlg.close(); } catch { dlg.removeAttribute('open'); } } }

// =================== Anuncios: embudo y recomendación ===================
function pasosEmbudo(a) {
  const P = [], add = (etq, v, nota, tasa = true) => P.push({ etq, v, nota, tasa });
  add('Vistas del anuncio', a.vistas, a.plataforma !== 'meta' && a.vistas - a.vistasPagadas > 1 ? `${fmtN(a.vistasPagadas)} pagadas + unas ${fmtN(a.vistas - a.vistasPagadas)} que la plataforma da gratis cuando el video gusta` : '', false);
  if (a.objetivo === 'local' || a.objetivo === 'conocer') add('Personas distintas que lo ven', a.alcance, `cada una lo ve unas ${fmtN(a.frecuencia, 1)} veces`, false);
  if (a.objetivo === 'mensajes' || a.objetivo === 'formulario') add('Tocan el anuncio', a.clics, '', false);
  if (a.objetivo === 'web') add('Entran a la web', a.clics, '', false);
  if (a.objetivo === 'local') { add('Piden el cupón o escriben', a.resultados); add('Llegan a la tienda', a.llegadas); }
  if (a.objetivo === 'mensajes') { add('Le escriben por WhatsApp', a.resultados); add('Sí pueden comprar', a.calificados); }
  if (a.objetivo === 'formulario') { add('Dejan sus datos', a.resultados); add('Contestan cuando les escribes', a.contactados); add('Sí pueden comprar', a.calificados); }
  if (a.objetivo === 'conocer') { add('Le escriben solas', a.resultados); add('Sí pueden comprar', a.calificados); }
  add('Compran', a.clientes);
  return P;
}
function htmlFunnel(a) {
  const P = pasosEmbudo(a), max = Math.max(1, ...P.map(x => x.v));
  return `<ol class="embudo">${P.map((x, i) => {
    const w = 18 + 82 * (x.v > 1 ? Math.log(x.v) / Math.log(max) : 0);
    const prev = i > 0 ? P[i - 1].v : 0, tasa = x.tasa && prev > 0 ? x.v / prev * 100 : null;
    return `<li><div class="emb-barra" style="width:${clamp(w, 18, 100)}%"><b>${esc(x.v >= 100 ? fmtN(x.v) : f1(x.v))}</b><span>${esc(x.etq)}</span></div>${tasa !== null ? `<small class="emb-tasa">${tasa >= 1 ? fmtN(tasa) : fmtN(tasa, 1)} de cada 100</small>` : ''}${x.nota ? `<small class="emb-nota">${esc(x.nota)}</small>` : ''}</li>`;
  }).join('')}</ol>`;
}
function textoTrabajoAds(a) {
  if (a.objetivo === 'local') return `Mandar el cupón y un recordatorio a unas ${fmtN(a.prospectar)} personas al mes (${fmtPorDia(a.prospectar / 30)}).`;
  if (a.objetivo === 'mensajes') return `Contestar unas ${fmtN(a.resultados)} conversaciones al mes (${fmtPorDia(a.resultados / 30)}) y volver a escribir a unas ${fmtN(Math.max(0, a.calificados - a.clientes))} que podían comprar y no compraron.`;
  if (a.objetivo === 'formulario') return `Llamar o escribir a unos ${fmtN(a.resultados)} formularios al mes (${fmtPorDia(a.resultados / 30)}); contestan unos ${fmtN(a.contactados)}.`;
  if (a.objetivo === 'web') return `Contestar dudas de unas ${fmtN(a.mensajes)} personas al mes.`;
  return `Contestar a unas ${fmtN(a.resultados)} personas que escriben solas.`;
}
function htmlEmbudoAds(r, compacto) {
  const ev = r.ev, a = ev.ads, mon = ev.R.moneda; if (!a) return '';
  const gv = ev.equilibrio ? ev.equilibrio.ganVenta : 0;
  const ventasPaga = gv > 0 ? ev.presupuesto / gv : null;
  const tile = (k, v, s) => `<div class="mesa-item"><span class="kicker">${esc(k)}</span><span class="grande">${esc(v)}</span><p>${esc(s)}</p></div>`;
  const tiles = [
    tile(a.objetivo === 'local' ? 'Cada persona que llega' : `Cada ${a.objetivo === 'formulario' ? 'formulario' : a.objetivo === 'web' ? 'visita' : a.objetivo === 'mensajes' ? 'conversación' : 'persona'}`, fmtM(a.objetivo === 'local' ? a.costoLlegadaBs : a.costoResultadoBs, mon), a.objetivo === 'local' ? `Y cada persona que pide el cupón: ${fmtM(a.costoResultadoBs, mon)}.` : 'Lo que cuesta en anuncios.'),
    tile('Cada cliente', fmtM(a.costoClienteBs, mon), 'Lo que cuesta en anuncios que alguien compre.'),
  ];
  if (ventasPaga !== null) tiles.push(tile('Los anuncios se pagan con', `${f1(ventasPaga)} ventas`, `Cada venta le deja ${fmtM(gv, mon)}.`));
  const cab = `<div class="ads-cab"><span class="etq azul">${esc(a.nombrePlataforma)}</span><span class="etq">${esc(a.objetivoNombre)}</span>${a.fuente === 'real' ? '<span class="etq ok">con sus datos reales</span>' : '<span class="etq">promedios de mercado</span>'}</div>
    <p class="texto">Con <b>${esc(fmtM(ev.presupuesto, mon))}</b> al mes (unos USD ${fmtN(a.usd)}, al cambio de Bs ${fmtN(a.tc, 2)}), en un mes normal, cuando la campaña ya aprendió:</p>`;
  const rango = `<p class="texto">Compras por anuncios al mes: lo mínimo <b>${f1(a.clientes * 2 / 3)}</b> · lo esperado <b>${f1(a.clientes)}</b> · si sale muy bien <b>${f1(a.clientes * 4 / 3)}</b>.</p>`;
  if (compacto) return cab + htmlFunnel(a) + rango + `<div class="mesa">${tiles.join('')}</div>` + (a.avisos.length ? `<p class="texto">${ICO.ojo} ${esc(a.avisos[0])}</p>` : '');
  return cab + htmlFunnel(a) + rango + `<div class="mesa">${tiles.join('')}</div>` + `<p class="texto"><b>Trabajo que esto le da:</b> ${esc(textoTrabajoAds(a))}</p>`;
}
function htmlArmadoAds(r) {
  const ev = r.ev, a = ev.ads, mon = ev.R.moneda, p = estado.prospecto;
  const ciudad = p.negocio.ciudad || 'su ciudad', ta = n(p.negocio.temporadaAlta);
  const filas = [];
  for (const x of a.partes) {
    filas.push([`${x.nombre}${a.partes.length > 1 ? ` (${fmtN(x.sh * 100)} de cada 100 Bs)` : ''}`, `Campaña: «${x.campana}».`]);
    filas.push(['Cómo gastar la plata', x.modo === 'continuo' ? `Todo el mes: unos ${fmtM(x.bs / 30, mon)} (USD ${fmtN(x.usd / 30, 1)}) por día.` : x.modo === 'pulsos' ? `En ${x.dias} días fuertes, unos USD ${fmtN(x.usd / x.dias, 1)} por día (el mínimo de TikTok Ads es USD 20 por día). Ideal: de jueves a domingo, cerca de fin de mes o de la quincena.` : `Con «Promocionar» desde la app: unos USD ${fmtN(x.usd / x.dias, 1)} por día durante ${x.dias} días, sobre los videos que mejor van.`]);
  }
  filas.push(['A quién mostrarlo', a.alcanceNegocio === 'barrio' ? 'Solo a gente que vive o trabaja a 3–5 km de la tienda, en la edad de su cliente.' : a.alcanceNegocio === 'ciudad' ? `A toda ${ciudad}, por intereses de su rubro.` : a.alcanceNegocio === 'pais' ? 'A todo Bolivia, solo donde llegan sus envíos.' : 'A dueños y encargados de negocios, con un formulario que pregunte rubro y tamaño para filtrar.']);
  filas.push(['Videos que hacen falta', `${a.videosMes} videos nuevos al mes. En TikTok un anuncio se cansa en 1 o 2 semanas: hay que cambiarlo seguido.`]);
  filas.push(['Cuándo', `Cerca de fin de mes o de la quincena, cuando la gente cobra${ta ? `, y fuerte antes de ${MESES[ta - 1]}, su mes más fuerte` : ''}.`]);
  const sup = [];
  sup.push(['Dólar', `Bs ${fmtN(a.tc, 2)} por dólar`, n(p.anuncios.tc) > 0 ? 'dato del cliente' : 'Banco Central, nov. 2026']);
  sup.push(['Mil vistas pagadas cuestan', fmtM(a.cpmBs, mon), n(p.anuncios.cpmReal) > 0 ? 'dato del cliente' : 'promedio aproximado']);
  const pe = pasosEmbudo(a);
  for (let i = 1; i < pe.length; i++) if (pe[i].tasa && pe[i - 1].v > 0) sup.push([`De cada 100 «${minus1(pe[i - 1].etq)}», ${minus1(pe[i].etq)}`, fmtN(pe[i].v / pe[i - 1].v * 100, 1), n(p.anuncios.costoResultadoReal) > 0 && i <= 2 ? 'calculado con su costo real' : 'promedio aproximado']);
  return `<div class="tabla-envoltura"><table class="tabla-armado"><tbody>${filas.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>
    ${a.avisos.length ? `<ul class="avisos">${a.avisos.map(x => `<li>${ICO.ojo}<span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
    <details><summary class="btn-borde" style="display:inline-flex;cursor:pointer">De dónde salen estos números</summary>
      <div class="tabla-envoltura"><table><thead><tr><th>Supuesto</th><th class="n">Valor</th><th>Fuente</th></tr></thead><tbody>${sup.map(([k, v, f]) => `<tr><td>${esc(k)}</td><td class="n">${esc(v)}</td><td><span class="etq ${f.startsWith('dato') || f.startsWith('calculado') ? 'ok' : ''}">${esc(f)}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="texto">Son promedios aproximados y prudentes para Bolivia. Los calibré con un caso real en La Paz: con estos promedios, ese caso queda cerca de «si sale muy bien», no de lo esperado. Cuando el cliente ya pautó, anota sus datos reales en el paso 7 y se usan esos.</p></details>`;
}
function htmlAnuncios(r) {
  const ev = r.ev;
  const cab = `<div class="tarjeta-cab"><h3>${icoSq('megafono', 'orange')}Los anuncios, paso a paso</h3><p>${ev.ads ? 'un mes normal' : ''}</p></div>`;
  if (!ev.ads) return `<section class="tarjeta">${cab}<p class="texto">${ev.modo === 'optimizar' ? 'El trabajo es mejorar sus anuncios de hoy: los números salen de lo que hoy le cuesta cada venta.' : 'Este plan no tiene anuncios.'}</p></section>`;
  return `<section class="tarjeta" id="sec-anuncios">${cab}${htmlEmbudoAds(r, false)}<h4 class="sub-titulo">${icoSq('herramienta', 'gray')}Cómo armar la campaña</h4>${htmlArmadoAds(r)}</section>`;
}

// =================== Vista del cliente (para mostrar en la llamada) ===================
const NOMBRE_ESC = { piso: ['Escenario conservador', 'Piso: si las cosas salen por debajo de lo normal'], meta: ['Escenario esperado', 'Meta: lo que esperamos con estos números'], techo: ['Escenario optimista', 'Techo: si los videos y la oferta pegan fuerte'] };
function fuenteDato(clave, valorDefecto) {
  const P = estado.prospecto, v = getValor(clave);
  if (vacio(v)) return valorDefecto ? ['Promedio prudente', ''] : ['—', ''];
  const f = P.fuentes[clave];
  if (f === 'estimado') return ['Estimado', 'ojo'];
  if (f === 'calculado') return ['Calculado con tus datos', 'azul'];
  return ['Dato tuyo', 'ok'];
}
function htmlVistaCliente(r) {
  const p = estado.prospecto, R = estado.reglas, mon = R.moneda;
  const fecha = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
  const nom = p.negocio.nombre || 'tu negocio';
  const portada = `<header class="vc-portada"><p class="vc-marca">${esc(R.marca || '')}</p><h1>Proyección de resultados</h1><p class="vc-para">para <b>${esc(nom)}</b> · ${esc(fecha)}</p>
    <p class="vc-sub">Calculada con los números de tu negocio y con promedios de mercado prudentes. Te muestro tres escenarios: el conservador, el esperado y el optimista.</p></header>`;
  if (!r || r.incompleto || !r.ev) return `<div class="vc">${portada}<section class="vc-sec"><p class="texto">Todavía faltan datos para armar la proyección: anota al menos cuánto paga un cliente (paso 3).</p></section></div>`;
  const ev = r.ev, E = ev.escenarios, mt = ev.foco.mt, a = ev.ads, md = ev.metaDueno, pr = promesaDe(ev), D = ev.D;
  // Hoy
  const hoyT = [];
  if (n(p.negocio.facturacion) > 0) hoyT.push(['Vendes al mes', fmtM(n(p.negocio.facturacion), mon)]);
  if (n(p.hoy.clientesMes) > 0) hoyT.push(['Clientes nuevos al mes', f1(n(p.hoy.clientesMes))]);
  if (n(p.hoy.interesadosMes) > 0) hoyT.push(['Te escriben o preguntan', `${fmtPorDia(n(p.hoy.interesadosMes) / ev.dias)}`]);
  if (n(p.hoy.interesadosMes) > 0 && n(p.hoy.clientesMes) > 0) hoyT.push(['De cada 100 que preguntan, compran', fmtN(Math.min(100, n(p.hoy.clientesMes) / n(p.hoy.interesadosMes) * 100), 1)]);
  const hoy = hoyT.length ? `<section class="vc-sec"><h2>Dónde estás hoy</h2><div class="vc-tiles">${hoyT.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div></section>` : '';
  // Meta
  const meta = md ? `<section class="vc-sec"><h2>Lo que quieres lograr</h2><p class="vc-grande-txt">${esc(tituloMeta(md, mon).replace(/^Quiere/, 'Quieres'))}.</p>
    <p class="texto">${md.tipo === 'clientes' ? `Eso es ${esc(fmtPorDia(md.clientesDia))} clientes nuevos.` : `Eso es ${esc(fmtM(md.ventasDia, mon))} más en ventas por día.`} ${esc(coberturaCliente(md, mon))}</p>
    <div class="cobertura"><i class="${estCob(md.cobertura)}" style="width:${clamp(md.cobertura, 0, 1) * 100}%"></i></div></section>` : '';
  // Tres escenarios
  const tarjeta = k => {
    const e = E[k], roi = e.roi1, rec = e.recupero;
    return `<article class="vc-esc vc-${k}"><p class="vc-esc-tit">${NOMBRE_ESC[k][0]}</p><p class="vc-esc-sub">${NOMBRE_ESC[k][1]}</p>
      <div class="vc-roi"><b>${fmtN(roi, 1)}×</b><span>por cada Bs 1 que inviertes, te vuelven Bs ${fmtN(roi, 1)}</span></div>
      <dl>
        <div><dt>Clientes nuevos</dt><dd>${f1(e.N)}</dd></div>
        <div><dt>Ventas nuevas en su primer año</dt><dd>${esc(fmtM(e.ventas1, mon))}</dd></div>
        <div><dt>Ganancia en su primer año</dt><dd>${esc(fmtM(e.V1, mon))}</dd></div>
        <div><dt>Inversión total (${D} meses)</dt><dd>${esc(fmtM(e.invNeta, mon))}</dd></div>
        <div><dt>Retorno</dt><dd>${roi >= 1 ? '+' : ''}${fmtN((roi - 1) * 100)}%</dd></div>
        <div><dt>Recuperas tu inversión</dt><dd>${rec === null ? 'después de 3 años' : rec === 0 ? 'desde el inicio' : 'en el mes ' + rec}</dd></div>
      </dl></article>`;
  };
  const maxB = Math.max(...['piso', 'meta', 'techo'].map(k => Math.max(E[k].V1, E[k].invNeta)), 1);
  const barras = ['piso', 'meta', 'techo'].map(k => `<div class="grupo-barras"><h4>${NOMBRE_ESC[k][0]}</h4>${barraH('Inviertes', E[k].invNeta, maxB, 'var(--gray)', fmtM(E[k].invNeta, mon))}${barraH('Ganas', E[k].V1, maxB, k === 'piso' ? 'var(--s2)' : k === 'meta' ? 'var(--s1)' : 'var(--s3)', fmtM(E[k].V1, mon))}</div>`).join('');
  const escenarios = `<section class="vc-sec"><h2>Tres escenarios</h2><p class="texto">«Ganancia» es lo que te queda después de pagar tu producto, no lo que te pagan. Cuento el primer año de cada cliente nuevo; si siguen comprando, ganas más.</p>
    <div class="vc-escenarios">${tarjeta('piso')}${tarjeta('meta')}${tarjeta('techo')}</div>
    <div class="grupos-barras vc-barras">${barras}</div>
    ${ev.limitadoPorCapacidad ? `<p class="texto">${ICO.ojo} Con lo que hoy puedes atender, no te caben más clientes${ev.cap.extra > 0 ? ', aunque contrates a quien dijiste' : ''}: por eso el escenario optimista no sube más. Si sumas gente, sube.</p>` : ''}</section>`;
  // Embudo
  const embudo = a ? `<section class="vc-sec"><h2>Cómo llegamos a esos números</h2>
    <p class="texto">Con <b>${esc(fmtM(ev.presupuesto, mon))}</b> al mes en ${esc(a.nombrePlataforma)} (los pagas directo a la plataforma, desde tu cuenta), en un mes normal del escenario esperado:</p>
    ${htmlFunnel(a)}
    <p class="texto">Cada cliente te cuesta unos <b>${esc(fmtM(a.costoClienteBs, mon))}</b> en publicidad${a.objetivo === 'local' ? `, y cada persona que llega a tu tienda, unos <b>${esc(fmtM(a.costoLlegadaBs, mon))}</b>` : ''}.</p></section>` : '';
  // Alcancía
  const hasta = Math.min(E.meta.H, Math.max(D + 4, (E.meta.recupero || 0) + 2));
  const alcancia = `<section class="vc-sec"><h2>Tu inversión, mes a mes</h2>
    <p class="texto">Piensa en una alcancía. Cada mes sale plata para el servicio y la publicidad (naranja) y tus clientes nuevos van metiendo plata de vuelta (verde). La línea azul es cómo va la alcancía. ${E.meta.recupero ? `En el mes ${E.meta.recupero} vuelve a cero: ya recuperaste todo, y desde ahí todo es ganancia.` : ''}</p>
    ${graficoMeses(ev, hasta)}</section>`;
  // Punto de equilibrio
  const eq = ev.equilibrio;
  let equilibrio = '';
  if (eq && eq.ventas) {
    if (mt.tipo === 'recurrente') {
      let acum = 0, mesCubre = null; const cz = E.meta.cierres || [];
      for (let m = 1; m < cz.length; m++) { acum += cz[m] || 0; if (acum >= eq.ventas) { mesCubre = m; break; } }
      equilibrio = `<section class="vc-sec vc-destacado"><h2>Tu punto de equilibrio</h2><p class="vc-grande-txt">Con <b>${f1(eq.ventas)} clientes nuevos</b> pagándote cada mes, cubres toda la inversión del mes.</p>
        <p class="texto">La inversión del mes es ${esc(fmtM(eq.costoMes, mon))} (servicio + publicidad) y cada cliente te deja ${esc(fmtM(eq.ganVenta, mon))} cada mes. Como los clientes se van sumando mes a mes, ${mesCubre ? `en el escenario esperado ya los tienes en el mes ${mesCubre}` : 'en el escenario esperado todavía no se llega en este plan'}.</p></section>`;
    } else {
      const cubre = E.meta.mesNormal >= eq.ventas;
      equilibrio = `<section class="vc-sec vc-destacado"><h2>Tu punto de equilibrio</h2><p class="vc-grande-txt">Con <b>${f1(eq.ventas)} ventas nuevas</b> al mes cubres toda la inversión del mes.</p>
        <p class="texto">La inversión del mes es ${esc(fmtM(eq.costoMes, mon))} (servicio + publicidad) y cada venta te deja ${esc(fmtM(eq.ganVenta, mon))}. En un mes normal del escenario esperado llegan unos ${f1(E.meta.mesNormal)} clientes nuevos: ${cubre ? 'más de lo que necesitas para cubrirla' : 'todavía no alcanza para cubrirla en un solo mes, pero cada cliente vuelve a comprar después'}.</p></section>`;
    }
  }
  // Cómo lo calculamos
  const k = c => `linea:${ev.foco.id}:${c}`;
  const filas = [['Precio promedio de una venta', fmtM(mt.ticket, mon), fuenteDato(k('ticket'))], ['De cada 100 Bs que cobras, te quedan', fmtN(mt.m * 100), fuenteDato(k('margen'), true)]];
  if (mt.tipo === 'recurrente') filas.push(['Meses que se queda un cliente', fmtN(mt.vida), fuenteDato(k('vidaMeses'), true)]);
  if (mt.tipo === 'repetida') { filas.push(['Veces que te compra al año', fmtN(mt.ppy, 1), fuenteDato(k('comprasAnio'), true)]); filas.push(['Años que te sigue comprando', fmtN(mt.anios, 1), fuenteDato(k('aniosCliente'), true)]); }
  filas.push(['Días entre la primera pregunta y el pago', fmtN(ev.ciclo), fuenteDato(k('cicloDias'), true)]);
  filas.push(['De cada 100 que pueden comprar, compran', `hoy ${fmtN(ev.cierre.hoy * 100, 1)} → con el plan ${fmtN(ev.cierre.plan * 100, 1)}`, ev.cierre.medido ? ['Calculado con tus datos', 'azul'] : ['Promedio prudente', '']]);
  if (a) {
    filas.push(['Dólar para pagar la publicidad', `Bs ${fmtN(a.tc, 2)}`, n(p.anuncios.tc) > 0 ? ['Dato tuyo', 'ok'] : ['Banco Central (nov. 2026)', '']]);
    filas.push(['Mil vistas pagadas cuestan', fmtM(a.cpmBs, mon), n(p.anuncios.cpmReal) > 0 ? ['Dato tuyo', 'ok'] : ['Promedio de mercado', '']]);
    if (n(p.anuncios.costoResultadoReal) > 0) filas.push([`Cada ${a.resultadoNombre.replace(/s$/, '')} cuesta`, fmtM(n(p.anuncios.costoResultadoReal), mon), ['Dato tuyo', 'ok']]);
  }
  const calculo = `<section class="vc-sec"><h2>Cómo lo calculamos</h2><p class="texto">Cada número tiene su origen. Donde no hay un dato tuyo, uso un promedio prudente: prefiero quedarme corto que prometerte de más.</p>
    <div class="tabla-envoltura"><table class="vc-tabla"><thead><tr><th>Dato</th><th class="n">Valor</th><th>De dónde sale</th></tr></thead><tbody>${filas.map(([t, v, [f, c]]) => `<tr><td>${esc(t)}</td><td class="n">${esc(v)}</td><td><span class="etq ${c}">${esc(f)}</span></td></tr>`).join('')}</tbody></table></div></section>`;
  // Plan
  const fases = fasesPlan(ev);
  const plan = `<section class="vc-sec"><h2>El plan, mes a mes</h2><ol class="calendario">${fases.map(f => `<li><span class="cal-mes">${f.desde === f.hasta ? `Mes ${f.desde}` : `Meses ${f.desde}–${f.hasta}`}</span><b>${esc(f.t)}</b><p>${esc(f.x)}</p></li>`).join('')}</ol></section>`;
  // Inversión e incluye
  const serv = SERVICIOS.filter(s => ev.alc[s.id]).map(s => ({ nombre: s.nombre.replace(' (lo haces tú)', '').replace(' (ellos graban)', ' (tu equipo graba)'), detalle: SERV_CLIENTE[s.id] || s.detalle }));
  const inversion = `<section class="vc-sec"><h2>Tu inversión</h2><div class="vc-tiles"><div><span>Mi servicio</span><b>${esc(fmtM(ev.precio, mon))} al mes</b></div>${ev.alc.campanas ? `<div><span>Publicidad (la pagas tú, directo)</span><b>${esc(fmtM(ev.presupuesto, mon))} al mes</b></div>` : ''}<div><span>Plan sugerido</span><b>${D} meses</b></div></div>
    <ul class="vc-lista">${serv.map(s => `<li>${ICO.ok}<span><b>${esc(s.nombre)}.</b> ${esc(s.detalle)}</span></li>`).join('')}</ul>
    <p class="texto">Pagas mes a mes. El plan sugerido es de ${D} meses porque es lo que tarda en verse todo el resultado.</p></section>`;
  // Lo que necesito de ti
  const C = p.compromiso, nec = ['Una hora por semana para revisar los resultados juntos.', 'Aprobar los videos en 2 días como máximo.'];
  if (ev.alc.campanas) nec.push('Pagar la publicidad directo a la plataforma, desde tu cuenta: ves cada boliviano que se gasta.');
  if (ev.alc.guia) nec.push('Contestar rápido y volver a escribir a quien no compró (te enseño cómo).');
  nec.push('Anotar de dónde viene cada cliente, para medir lo que funciona.');
  const necesito = `<section class="vc-sec"><h2>Lo que necesito de ti</h2><ul class="vc-lista">${nec.map(x => `<li>${ICO.ok}<span>${esc(x)}</span></li>`).join('')}</ul></section>`;
  // Garantía
  const frC = fraseCliente(ev);
  const garantia = `<section class="vc-sec vc-destacado"><h2>Mi garantía</h2><p class="vc-grande-txt">${esc(garantiaCliente(ev))}</p><p class="texto">Lo que te garantizo: ${esc(frC)}. Eso depende de mi trabajo.</p></section>`;
  // Caso real
  const caso = R.casoReal !== false ? `<section class="vc-sec"><h2>Un caso real</h2><div class="vc-caso"><b>Sneaker Fashion</b><span>Tienda de tenis · La Paz</span><p>Invirtió <b>1.512 Bs</b> (servicio + publicidad) y vendió <b>21.100 Bs</b>: casi 14 Bs en ventas por cada 1 invertido. Más de 236 mil vistas en 5 videos.</p></div></section>` : '';
  const pie = `<footer class="vc-pie"><p>Estas son proyecciones hechas con tus números y promedios prudentes, no una promesa de ventas. Lo que te garantizo: ${esc(frC)}.</p><p>${esc(R.marca || '')} · ${esc(fecha)}</p></footer>`;
  return `<div class="vc">${portada}${hoy}${meta}${escenarios}${embudo}${equilibrio}${alcancia}${calculo}${plan}${inversion}${necesito}${garantia}${caso}${pie}</div>`;
}

function coberturaCliente(md, mon) {
  const c = md.cobertura, llega = c >= 1 ? 'llegas a tu meta y la pasas' : `llegas a ${fmtN(c * 100)} de cada 100 de tu meta`;
  if (md.tipo === 'clientes') return `Con este plan tendrías unos ${f1(md.planMes)} clientes nuevos en un mes normal: ${llega}.`;
  return `Con este plan, en el mes ${md.plazo} venderías unos ${fmtM(md.planAumento, mon)} más al mes: ${llega}.`;
}

// Textos para el cliente (le hablan de tú)
const SERV_CLIENTE = {
  estrategia: 'Tu cliente ideal, tu oferta, tus mensajes y el plan. Una reunión al mes para ver resultados.',
  contenido: 'Guiones, grabación guiada, edición y publicación de tus videos.',
  direccion: 'Ideas y guiones cada semana; tu equipo graba.',
  campanas: 'Armo tu publicidad con los videos que mejor funcionan y la mido por ventas, no por «me gusta».',
  guia: 'Te enseño qué responder, cuándo volver a escribir y cómo cerrar la venta.',
  automatizacion: 'Respuesta automática por WhatsApp: contesta al instante, hace preguntas y agenda.',
};
function fraseCliente(ev) {
  const P = ev.promesa;
  if (P.tipo === 'ventas') return `pasar de ${f1(P.ventasHoy)} a al menos ${f1(P.ventasPiso)} ventas al mes por publicidad`;
  const v = fmtN(P.valorPiso ?? P.interesadosPiso);
  return { interesados: `al menos ${v} personas interesadas que sí te pueden comprar`, llegadas: `al menos ${v} personas que llegan a tu tienda con el cupón`, visitas: `al menos ${v} personas que entran a tu página web`, alcance: `al menos ${v} personas de tu zona que ven tus videos` }[P.tipo] || `al menos ${v} personas interesadas`;
}
function garantiaCliente(ev) {
  const t = String(ev.R.garantiaTexto || '').trim(), fr = fraseCliente(ev);
  if (t) { const x = t.replace(/\{meses\}/g, String(ev.D)).replace(/\{promesa\}/g, fr); return x[0].toUpperCase() + x.slice(1); }
  return `Si al mes ${ev.D} no llegamos a ${fr}, sigo trabajando sin cobrarte hasta llegar, siempre que cumplas tu parte.`;
}
