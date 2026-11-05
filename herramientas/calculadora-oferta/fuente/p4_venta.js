
// =================== Llamada de venta ===================
// Pedido de Mauricio (2026-11-05): dos pestañas. «Llamada de venta» es corta: su situación, sus 3 productos estrella,
// qué lo frena y tu propuesta, con piso (recupera lo que invierte), meta (lo duplica) y techo (lo triplica).
// «Clientes» es todo lo de antes, sin tocarlo. Las dos usan la misma ficha del prospecto: lo que anotas en una se ve en la otra.
// Las cuentas están en motor4.js (evaluarVenta).
const AREAS = [['venta', 'Llamada de venta'], ['clientes', 'Clientes']];
let ultimoVenta = null;
function htmlAreas() { return AREAS.map(([v, t]) => `<button type="button" role="tab" aria-selected="${estado.area === v}" data-area="${v}">${t}</button>`).join(''); }
function aplicarArea() {
  estado.area = estado.area === 'clientes' ? 'clientes' : 'venta';
  document.documentElement.dataset.area = estado.area;
  const a = $('#areas'); if (a) a.innerHTML = htmlAreas();
  if (estado.area === 'venta') renderVenta(); else { renderForm(); recalcular(); }
}
function cambiarArea(v) {
  if (v === estado.area) return;
  if (estado.cliente) alternarCliente();
  estado.area = v; guardarLocal('co4.area', v);
  aplicarArea(); window.scrollTo({ top: 0 });
}
function evaluarVentaActual() { try { ultimoVenta = evaluarVenta(estado.prospecto, estado.reglas); } catch (e) { console.error(e); ultimoVenta = null; } return ultimoVenta; }

// ---------- Las preguntas de la llamada ----------
function campoV(clave, q, { pre = '', suf = '', ph = '', tipo = 'num', nota = '' } = {}) {
  const v = getValor(clave), id = 'v-' + idSeguro(clave);
  const val = vacio(v) ? '' : tipo === 'num' && typeof v === 'number' ? fmtCorto(v) : String(v);
  return `<div class="fila">${htmlGuia(clave)}<div class="fila-cab"><label for="${id}">${esc(q)}</label></div>
    <div class="campo-in">${pre ? `<span class="pre">${esc(pre)}</span>` : ''}<input id="${id}" ${tipo === 'num' ? 'class="num" inputmode="decimal"' : ''} autocomplete="off" data-v="${esc(clave)}" data-vt="${tipo}" value="${esc(val)}" placeholder="${esc(ph)}">${suf ? `<span class="suf">${esc(suf)}</span>` : ''}</div>
    ${nota ? `<p class="nota">${nota}</p>` : ''}</div>`;
}
function chipsV(clave, q, opciones, nota = '') {
  const v = String(getValor(clave) ?? '');
  return `<div class="fila">${htmlGuia(clave)}<div class="fila-cab"><span class="q">${esc(q)}</span></div>
    <div class="chips" role="radiogroup" aria-label="${esc(q)}">${opciones.map(([val, t]) => `<button type="button" role="radio" aria-checked="${String(val) === v}" data-vchip="${esc(clave)}" data-valor="${esc(val)}">${esc(t)}</button>`).join('')}</div>
    ${nota ? `<p class="nota">${esc(nota)}</p>` : ''}</div>`;
}
// Un producto estrella: nombre, a cuánto lo vende, cuánto le cuesta y cuántos vende al mes (son las líneas de la pestaña Clientes)
function filaProducto(i) {
  const l = estado.prospecto.lineas[i];
  const val = c => { if (!l) return ''; const v = l[c]; return vacio(v) ? '' : typeof v === 'number' ? fmtCorto(v) : String(v); };
  const costoPh = l && n(l.ticket) > 0 && !vacio(l.margen) ? fmtCorto(Math.round(n(l.ticket) * (1 - n(l.margen) / 100))) : '0';
  const unidPh = l && n(l.ticket) > 0 && n(l.facturacion) > 0 ? fmtCorto(Math.round(n(l.facturacion) / n(l.ticket))) : '0';
  const inp = (c, ph, aria, tipo = 'num', pre = '') => `<div class="campo-in campo-chico">${pre ? `<span class="pre">${esc(pre)}</span>` : ''}<input aria-label="${esc(aria)}" autocomplete="off" ${tipo === 'num' ? 'class="num" inputmode="decimal"' : ''} ${l ? `data-v="${esc(`linea:${l.id}:${c}`)}"` : `data-nueva="${i}" data-campo="${c}"`} data-vt="${tipo}" data-fila="${i}" value="${esc(val(c))}" placeholder="${esc(ph)}"></div>`;
  return `<div class="fila-lista prod" data-prod="${i}">
    <div class="fl-nombre">${inp('nombre', i === 0 ? 'Lo que más vende. Ej. tenis' : 'Otro producto estrella', `Producto ${i + 1}`, 'txt')}</div>
    <div class="fl-num"><span class="fl-eti">Lo vende a</span>${inp('ticket', '0', `Precio de venta del producto ${i + 1}`, 'num', estado.reglas.moneda)}</div>
    <div class="fl-num"><span class="fl-eti">Le cuesta</span>${inp('costo', costoPh, `Lo que le cuesta el producto ${i + 1}`, 'num', estado.reglas.moneda)}</div>
    <div class="fl-num"><span class="fl-eti">Vende al mes</span>${inp('unidadesMes', unidPh, `Unidades al mes del producto ${i + 1}`)}</div>
    <p class="nota fl-deja" data-deja="${i}"></p></div>`;
}
function htmlFormVenta() {
  const p = estado.prospecto, R = estado.reglas, mon = R.moneda, tm = TXT_META[p.meta.tipo] || TXT_META.aumento;
  const ops = p.lineas.slice(0, 3).filter(l => n(l.ticket) > 0).map(l => [l.id, (l.nombre || '').trim() || 'Sin nombre']);
  const reg = (c, q, suf) => `<div class="fila"><div class="fila-cab"><label for="vr-${c}">${esc(q)}</label></div><div class="campo-in"><input id="vr-${c}" class="num" inputmode="decimal" data-regla="${c}" value="${esc(String(getPath(R, c) ?? ''))}">${suf ? `<span class="suf">${esc(suf)}</span>` : ''}</div></div>`;
  return `<div class="titulo-col"><h2>Llamada de venta</h2><p>Corta: su situación, sus productos estrella, qué lo frena y tu propuesta. Lo demás se pregunta cuando ya es cliente, en la pestaña <b>Clientes</b> (lo que anotes aquí ya aparece allá).</p></div>
    ${htmlGuiaVenta()}
    <p class="grupo-titulo">1. Su situación</p><div class="grupo">
      ${campoV('negocio.nombre', '¿Cómo se llama su negocio?', { tipo: 'txt', ph: 'Ej. Joyería Aurora' })}
      ${campoV('negocio.facturacion', '¿Cuánto vende al mes?', { pre: mon })}
      ${campoV('venta.costosMes', '¿Cuánto se le va al mes en total? (mercadería, alquiler, sueldos)', { pre: mon })}
      <div class="fila"><p class="calc-v" data-calc="queda"></p></div>
      ${chipsV('meta.tipo', '¿Qué quiere lograr?', [['aumento', 'Vender más'], ['total', 'Llegar a vender X'], ['ganancia', 'Ganar más'], ['clientes', 'Más clientes']])}
      ${campoV('meta.valor', tm.q, { pre: tm.pre ? mon : '', suf: 'al mes' })}</div>
    <p class="grupo-titulo">2. Sus productos estrella</p><div class="grupo"><div class="fila">${htmlGuia('venta.productos')}
      <p class="nota">Hasta 3: lo que más vende o lo que más le gustaría vender. Con el precio y lo que le cuesta sé cuánto le deja cada venta y cuál conviene explotar.</p>
      <div class="lista-filas">${[0, 1, 2].map(filaProducto).join('')}</div></div></div>
    <p class="grupo-titulo">3. Qué lo frena</p><div class="grupo">
      ${campoV('venta.limita', '¿Qué crees que te está limitando para vender más?', { tipo: 'txt', ph: 'Con sus palabras' })}
      ${campoV('venta.intento', '¿Qué has intentado y cómo te fue?', { tipo: 'txt', ph: 'Ej. pagué publicidad y solo me preguntaban precio' })}
      ${campoV('oferta.deseo', 'Cuando alguien le compra, ¿qué quiere lograr de verdad? (para armar la oferta)', { tipo: 'txt', ph: 'No el producto: el resultado' })}</div>
    <p class="grupo-titulo">4. Tu propuesta</p><div class="grupo">
      ${campoV('venta.cobro', '¿Cuánto le vas a cobrar en total?', { pre: mon, ph: fmtN(n(R.ventaCobro)), nota: 'Lo que él pone: tu servicio más la pauta.' })}
      ${campoV('venta.pauta', '¿Cuánto de eso va a la pauta de TikTok?', { pre: mon, ph: fmtN(n(R.ventaPauta)) })}
      <div class="fila"><p class="calc-v" data-calc="parati"></p></div>
      ${chipsV('venta.objetivo', '¿Qué campaña?', [['perfil', 'Visitas al perfil'], ['mensajes', 'Que le escriban']], 'Visitas al perfil: el video lleva a su perfil y desde el link reserva su cupón. Así cada venta queda medida.')}
      ${ops.length > 1 ? chipsV('venta.producto', '¿Qué producto explotamos?', [['', 'El que más conviene'], ...ops]) : ''}
      ${campoV('anuncios.costoResultadoReal', `Si ya pautó: ¿cuánto le costaba cada ${p.venta.objetivo === 'mensajes' ? 'mensaje' : 'persona que pedía el cupón o escribía'}? (opcional)`, { pre: mon, nota: 'Si lo sabe, uso su dato real en vez del promedio de mercado.' })}
      <details class="reglas-v"><summary class="btn-borde">Tus reglas: piso, meta, techo y garantía</summary>
        ${reg('ventaPisoX', 'Piso: veces lo que invierte que le tiene que dejar', 'veces')}
        ${reg('ventaMetaX', 'Meta', 'veces')}
        ${reg('ventaTechoX', 'Techo', 'veces')}
        ${reg('ventaDevolverPct', 'Si no llega al piso, le devuelves de tu servicio', 'de 100')}
        <p class="nota">1, 2 y 3 = recupera lo que invierte, lo duplica y lo triplica. «Le deja» es su ganancia (lo que vende menos lo que le cuesta), no lo que vende.</p></details></div>`;
}
function htmlGuiaVenta() {
  return htmlBurbuja({ s: 'T', q: 'Unos 15 minutos: situación (3), productos (4), qué lo frena (3) y tu propuesta (5). No preguntes más: lo demás es para cuando ya es cliente.', para: 'Que la llamada no se alargue y termine en una propuesta con números.', mas: ['Cuando tengas su producto estrella, toca «Vista del cliente» y muéstrale el piso, la meta y el techo.', 'Termina en la garantía: «si no llegamos al piso, te devuelvo la mitad de mi servicio».'] });
}
// Lo que se calcula al toque, al lado de las preguntas
function actualizarCalcVenta(v) {
  const mon = estado.reglas.moneda, set = (k, h) => { const e = document.querySelector(`[data-calc="${k}"]`); if (e) e.innerHTML = h; };
  if (!v) return;
  set('queda', v.queda !== null ? `Le quedan <b>${esc(fmtM(v.queda, mon))}</b> al mes.${v.queda > 0 && v.pesoQueda !== null ? ` Tu propuesta es ${fmtN(v.pesoQueda * 100)} de cada 100 de eso.` : v.queda <= 0 ? ' Hoy no le queda nada: pregunta de dónde saldría la plata.' : ''}` : 'Con lo que vende y lo que gasta, te digo cuánto le queda.');
  set('parati', `Para ti: <b>${esc(fmtM(v.servicio, mon))}</b> · a TikTok: <b>${esc(fmtM(v.pauta, mon))}</b>. Si no llega al piso, le devuelves ${esc(fmtM(v.devolver, mon))} (la pauta no se devuelve).`);
  for (let i = 0; i < 3; i++) {
    const l = estado.prospecto.lineas[i], x = l && v.lista.find(y => y.id === l.id);
    const e = document.querySelector(`[data-deja="${i}"]`); if (!e) continue;
    e.innerHTML = x ? `Le deja <b>${esc(fmtM(x.gan, mon))}</b> por venta (${fmtN(x.m * 100)} de cada 100)${x.margenAdivinado ? ' · <span class="etq ojo">falta lo que le cuesta: usé 30 de cada 100</span>' : ''}${v.el && v.el.id === x.id ? ' · <span class="etq azul">el que explotamos</span>' : ''}` : '';
  }
}

// ---------- El resultado de la llamada ----------
const NOM_NIVEL = { piso: ['Piso', 'recupera lo que invierte'], meta: ['Meta', 'lo duplica'], techo: ['Techo', 'lo triplica'] };
const TXT_ESTADO_V = { seguro: ['ok', 'Llegas al piso'], ajustado: ['ojo', 'Ajustado'], riesgo: ['no', 'En riesgo'] };
function htmlResultadoVenta(v) {
  const mon = estado.reglas.moneda;
  if (!v) return `<section class="tarjeta"><p class="texto">Algo en los datos no se pudo calcular. Revisa el último número que cambiaste.</p></section>`;
  const el = v.el;
  const prop = `<section class="tarjeta hero-v"><div class="tarjeta-cab"><h3>${icoSq('moneda', 'green')}Tu propuesta</h3>${el ? etqEst(...TXT_ESTADO_V[el.estado]) : ''}</div>
    <div class="mesa">
      <div class="mesa-item"><span class="kicker">Él invierte</span><span class="grande">${esc(fmtM(v.inv, mon))}</span><p>todo junto, para esta campaña.</p></div>
      <div class="mesa-item"><span class="kicker">Va a TikTok</span><span class="grande">${esc(fmtM(v.pauta, mon))}</span><p>${esc(v.objNombre)}.</p></div>
      <div class="mesa-item"><span class="kicker">Para ti</span><span class="grande">${esc(fmtM(v.servicio, mon))}</span><p>Si no llega al piso, le devuelves ${esc(fmtM(v.devolver, mon))}.</p></div>
    </div></section>`;
  if (!el) return prop + `<section class="tarjeta"><p class="texto">${ICO.ojo} Anota su producto estrella: a cuánto lo vende y cuánto le cuesta (paso 2). Con eso salen el piso, la meta y el techo.</p></section>`;
  // Piso, meta y techo
  const ks = ['piso', 'meta', 'techo'];
  const celda = k => { const m = el.metas[k], ok = el.proy.meta.ganancia >= m.ganancia; return `<td class="n">${esc(fmtM(m.facturacion, mon))}<small>${fmtN(m.unidades)} ${esc(minus1(el.nombre))}</small><small>${ok ? '✓ la pauta da para esto' : '✗ con esta pauta no se espera'}</small></td>`; };
  const niveles = `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('objetivo', 'blue')}Piso, meta y techo</h3><p>«${esc(el.nombre)}», facturación extra</p></div>
    <div class="tabla-envoltura"><table class="tabla-niveles"><thead><tr><th></th>${ks.map(k => `<th class="n">${NOM_NIVEL[k][0]}<small>${NOM_NIVEL[k][1]}</small></th>`).join('')}</tr></thead><tbody>
      <tr><td>Tiene que vender</td>${ks.map(celda).join('')}</tr>
      <tr><td>Le deja</td>${ks.map(k => `<td class="n">${esc(fmtM(el.metas[k].ganancia, mon))}</td>`).join('')}</tr>
    </tbody></table></div>
    <p class="texto">Cada venta de «${esc(el.nombre)}» le deja ${esc(fmtM(el.gan, mon))}. Para recuperar los ${esc(fmtM(v.inv, mon))} que invierte necesita ${fmtN(el.metas.piso.unidades)} ventas extra: ${esc(fmtM(el.metas.piso.facturacion, mon))} de facturación extra. Se mide con los cupones: cada venta con su cupón es una venta que no tendría sin la campaña.</p></section>`;
  // ¿Lo da la pauta?
  const a = { ...el.a };
  const est = el.estado, ex = TXT_ESTADO_V[est];
  const txtEst = est === 'seguro' ? `Aunque salga lo mínimo, la pauta da para el piso.${el.alcanza === 'techo' ? ' En lo esperado llega al techo.' : el.alcanza === 'meta' ? ' En lo esperado llega a la meta.' : ''}` : est === 'ajustado' ? 'En lo esperado llega al piso, pero si sale lo mínimo, no.' : 'Con esta pauta no se espera llegar al piso.';
  const sube = v.pautaMin !== null && v.pautaMin > v.pauta ? ` Con <b>${esc(fmtM(v.pautaMin, mon))}</b> de pauta llega al piso aunque salga lo mínimo.` : v.pautaMin === null && est !== 'seguro' ? ' Ni subiendo la pauta: elige un producto que deje más por venta.' : '';
  const pauta = `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('megafono', 'orange')}¿Lo da la pauta?</h3>${etqEst(ex[0], ex[1])}</div>
    <p class="texto">${esc(txtEst)}${sube}</p>
    <p class="texto">Con ${esc(fmtM(v.pauta, mon))} en TikTok (unos USD ${fmtN(a.usd)}), campaña «${esc(v.campana)}», esperamos que compren: lo mínimo <b>${f1(el.proy.piso.compras)}</b> · lo esperado <b>${f1(el.proy.meta.compras)}</b> · si sale muy bien <b>${f1(el.proy.techo.compras)}</b>. Son ${esc(fmtM(el.proy.meta.facturacion, mon))} de facturación extra en lo esperado.</p>
    ${htmlFunnel(a)}
    <p class="nota-eje">${a.fuente === 'real' ? 'Con su costo real por resultado.' : 'Promedios de mercado prudentes para Bolivia. Si ya pautó, anota su costo real.'} Llega 1 de cada 2 que reservan el cupón (tu supuesto).</p></section>`;
  // La garantía
  const gar = `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('escudo', 'orange')}Tu garantía</h3></div>
    <p class="texto"><b>Lo que le dices:</b> «${esc(fraseGarantiaVenta(v))}»</p>
    <div class="tabla-envoltura"><table><thead><tr><th>Si llega a</th><th class="n">Le deja</th><th class="n">Le devuelves</th><th class="n">Al final</th></tr></thead><tbody>
      ${v.peor.map(x => `<tr><td>${x.f === 0 ? 'Nada' : `${fmtN(x.f * 100)} de cada 100 del piso`}</td><td class="n">${esc(fmtM(x.ganancia, mon))}</td><td class="n">${esc(fmtM(v.devolver, mon))}</td><td class="n">${esc(fmtM(x.neto, mon))}</td></tr>`).join('')}
      <tr><td>El piso</td><td class="n">${esc(fmtM(el.metas.piso.ganancia, mon))}</td><td class="n">${esc(fmtM(0, mon))}</td><td class="n">${esc(fmtM(el.metas.piso.ganancia - v.inv, mon))}</td></tr>
    </tbody></table></div>
    <p class="texto"><b>Tu riesgo:</b> si no llega al piso, devuelves ${esc(fmtM(v.devolver, mon))} y te quedan ${esc(fmtM(v.servicio - v.devolver, mon))} por tu trabajo.${est === 'riesgo' ? ' Hoy la pauta no da para el piso: antes de ofrecer la garantía, sube la pauta o cambia de producto.' : ''}</p></section>`;
  // Qué producto explotar
  const prods = v.lista.length > 1 ? `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('gema', 'oro')}¿Qué producto explotar?</h3></div>
    <div class="tabla-envoltura"><table><thead><tr><th>Producto</th><th class="n">Le deja por venta</th><th class="n">Ventas para el piso</th><th class="n">Esperamos</th><th></th></tr></thead><tbody>
      ${v.lista.map(x => `<tr class="${x.id === el.id ? 'destacada' : ''}"><td><b>${esc(x.nombre)}</b>${x.id === el.id ? '<small>el que explotamos</small>' : ''}</td><td class="n">${esc(fmtM(x.gan, mon))}<small>${fmtN(x.m * 100)} de cada 100</small></td><td class="n">${fmtN(x.metas.piso.unidades)}</td><td class="n">${f1(x.proy.meta.compras)}</td><td>${etqEst(...TXT_ESTADO_V[x.estado])}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="texto">Conviene el que más se acerca al piso con la misma pauta: el que deja más por venta y que la gente busca.</p></section>` : '';
  // Su situación y su objetivo
  const o = v.objetivo;
  const fmtObj = x => o.tipo === 'clientes' ? `${f1(x)} clientes` : fmtM(x, mon);
  const sit = `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('casa', 'teal')}Su situación</h3></div>
    <div class="mesa">
      <div class="mesa-item"><span class="kicker">Vende al mes</span><span class="grande">${v.fact > 0 ? esc(fmtM(v.fact, mon)) : '—'}</span><p>${v.costos > 0 ? `Gasta ${esc(fmtM(v.costos, mon))}.` : 'Falta lo que gasta.'}</p></div>
      <div class="mesa-item"><span class="kicker">Le queda al mes</span><span class="grande">${v.queda !== null ? esc(fmtM(v.queda, mon)) : '—'}</span><p>${v.pesoQueda !== null ? `Tu propuesta es ${fmtN(v.pesoQueda * 100)} de cada 100 de eso.` : ''}</p></div>
      ${o ? `<div class="mesa-item"><span class="kicker">Quiere</span><span class="grande">${esc(fmtObj(o.quiere))}</span><p>${o.tipo === 'clientes' ? 'clientes nuevos' : o.tipo === 'ganancia' ? 'más de ganancia' : 'más de ventas'} al mes. La meta da ${esc(fmtObj(o.meta))}; el techo, ${esc(fmtObj(o.techo))}.</p></div>` : ''}
    </div>
    ${!vacio(estado.prospecto.venta.limita) || !vacio(estado.prospecto.venta.intento) ? `<p class="texto">${!vacio(estado.prospecto.venta.limita) ? `<b>Lo que lo frena:</b> «${esc(estado.prospecto.venta.limita)}». ` : ''}${!vacio(estado.prospecto.venta.intento) ? `<b>Lo que intentó:</b> «${esc(estado.prospecto.venta.intento)}».` : ''}</p>` : ''}</section>`;
  // Qué decirle
  const decir = [
    `«Vamos a invertir ${fmtM(v.inv, mon)}: ${fmtM(v.pauta, mon)} van directo a TikTok, desde tu cuenta, y ${fmtM(v.servicio, mon)} son mi trabajo.»`,
    `«Cada venta de ${minus1(el.nombre)} te deja ${fmtM(el.gan, mon)}. Con ${fmtN(el.metas.piso.unidades)} ventas extra recuperas lo que pusiste: ese es el piso, ${fmtM(el.metas.piso.facturacion, mon)} de facturación extra.»`,
    `«La meta es que lo dupliques: ${fmtM(el.metas.meta.facturacion, mon)}. Y si sale muy bien, lo triplicas: ${fmtM(el.metas.techo.facturacion, mon)}.»`,
    `«Cada venta llega con su cupón: así sabemos que es facturación extra, que sin la campaña no tendrías.»`,
    `«${fraseGarantiaVenta(v)}»`,
  ];
  const guion = `<section class="tarjeta"><div class="tarjeta-cab"><h3>${icoSq('chat', 'blue')}Qué decirle</h3><p>en este orden</p></div><ol class="lista-simple">${decir.map(x => `<li>${esc(x)}</li>`).join('')}</ol></section>`;
  return prop + niveles + pauta + gar + prods + sit + guion;
}
function fraseGarantiaVenta(v) {
  const mon = estado.reglas.moneda, el = v.el;
  return `Si no llegamos al piso${el ? ` (${fmtM(el.metas.piso.facturacion, mon)} de facturación extra: lo que necesitas para recuperar lo que invertiste)` : ''}, te devuelvo ${fmtM(v.devolver, mon)}, ${v.devolverPct === 50 ? 'la mitad' : `${fmtN(v.devolverPct)} de cada 100`} de mi servicio. La pauta no se devuelve: ya se gastó en TikTok.`;
}

// ---------- Vista del cliente (le habla de tú) ----------
function htmlVistaClienteVenta(v) {
  const p = estado.prospecto, R = estado.reglas, mon = R.moneda;
  const fecha = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
  const portada = `<header class="vc-portada"><p class="vc-marca">${esc(R.marca || '')}</p><h1>Tu propuesta</h1><p class="vc-para">para <b>${esc(p.negocio.nombre || 'tu negocio')}</b> · ${esc(fecha)}</p>
    <p class="vc-sub">Calculada con los números de tu negocio. Te muestro tres niveles: el piso, la meta y el techo.</p></header>`;
  if (!v || !v.el) return `<div class="vc">${portada}<section class="vc-sec"><p class="texto">Falta tu producto estrella: a cuánto lo vendes y cuánto te cuesta.</p></section></div>`;
  const el = v.el, ks = ['piso', 'meta', 'techo'];
  const sub = { piso: 'Recuperas lo que invertiste', meta: 'Duplicas lo que invertiste', techo: 'Triplicas lo que invertiste' };
  const tarjeta = k => `<article class="vc-esc vc-${k}"><p class="vc-esc-tit">${NOM_NIVEL[k][0]}</p><p class="vc-esc-sub">${sub[k]}</p>
    <div class="vc-roi"><b>${esc(fmtM(el.metas[k].facturacion, mon))}</b><span>de facturación extra</span></div>
    <dl><div><dt>Ventas extra de «${esc(el.nombre)}»</dt><dd>${fmtN(el.metas[k].unidades)}</dd></div><div><dt>Te deja</dt><dd>${esc(fmtM(el.metas[k].ganancia, mon))}</dd></div><div><dt>Inviertes</dt><dd>${esc(fmtM(v.inv, mon))}</dd></div></dl></article>`;
  return `<div class="vc">${portada}
    <section class="vc-sec"><h2>Lo que inviertes</h2><div class="vc-tiles"><div><span>Todo junto</span><b>${esc(fmtM(v.inv, mon))}</b></div><div><span>Publicidad en TikTok (desde tu cuenta)</span><b>${esc(fmtM(v.pauta, mon))}</b></div><div><span>Mi trabajo</span><b>${esc(fmtM(v.servicio, mon))}</b></div></div></section>
    <section class="vc-sec"><h2>Lo que vamos a lograr</h2><p class="texto">Cada venta de «${esc(el.nombre)}» te deja ${esc(fmtM(el.gan, mon))}. «Te deja» es tu ganancia: lo que vendes menos lo que te cuesta.</p>
      <div class="vc-escenarios">${ks.map(tarjeta).join('')}</div>
      <p class="texto">Todo es facturación <b>extra</b>: cada venta llega con su cupón, así sabemos que sin la campaña no la tendrías.</p></section>
    <section class="vc-sec vc-destacado"><h2>Mi garantía</h2><p class="vc-grande-txt">${esc(fraseGarantiaVenta(v))}</p></section>
    <section class="vc-sec"><h2>Cómo llegamos</h2><p class="texto">Con ${esc(fmtM(v.pauta, mon))} en TikTok, en el escenario esperado:</p>${htmlFunnel(el.a)}</section>
    ${R.casoReal !== false ? `<section class="vc-sec"><h2>Un caso real</h2><div class="vc-caso"><b>Sneaker Fashion</b><span>Tienda de tenis · La Paz</span><p>Invirtió <b>1.512 Bs</b> (servicio + publicidad) y vendió <b>21.100 Bs</b>: casi 14 Bs en ventas por cada 1 invertido.</p></div></section>` : ''}
    <footer class="vc-pie"><p>Son metas calculadas con tus números, no una promesa de ventas. Lo que te garantizo está arriba.</p><p>${esc(R.marca || '')} · ${esc(fecha)}</p></footer></div>`;
}

// ---------- Resumen para copiar ----------
function textoResumenVenta() {
  const v = evaluarVentaActual(), p = estado.prospecto, mon = estado.reglas.moneda;
  if (!v) return 'Faltan datos para armar el resumen.';
  const l = [`${p.negocio.nombre || 'Prospecto'} · LLAMADA DE VENTA`];
  if (v.fact > 0) l.push(`Vende ${fmtM(v.fact, mon)} al mes${v.queda !== null ? `, le quedan ${fmtM(v.queda, mon)}` : ''}.`);
  if (v.objetivo) l.push(`Quiere: ${v.objetivo.tipo === 'clientes' ? `${f1(v.objetivo.quiere)} clientes nuevos` : fmtM(v.objetivo.quiere, mon)} al mes.`);
  if (!vacio(p.venta.limita)) l.push(`Lo que lo frena: ${p.venta.limita}`);
  if (!vacio(p.venta.intento)) l.push(`Lo que intentó: ${p.venta.intento}`);
  l.push('');
  l.push(`Propuesta: ${fmtM(v.inv, mon)} (${fmtM(v.pauta, mon)} a TikTok, ${v.objNombre.toLowerCase()}; ${fmtM(v.servicio, mon)} para mí).`);
  if (v.el) {
    const el = v.el;
    l.push(`Producto: ${el.nombre}, le deja ${fmtM(el.gan, mon)} por venta.`);
    for (const k of ['piso', 'meta', 'techo']) l.push(`${NOM_NIVEL[k][0]} (${NOM_NIVEL[k][1]}): ${fmtM(el.metas[k].facturacion, mon)} de facturación extra, ${fmtN(el.metas[k].unidades)} ventas.`);
    l.push(`Con la pauta esperamos ${f1(el.proy.meta.compras)} ventas (${fmtM(el.proy.meta.facturacion, mon)}). ${TXT_ESTADO_V[el.estado][1]}.${v.pautaMin !== null && v.pautaMin > v.pauta ? ` Pauta para el piso seguro: ${fmtM(v.pautaMin, mon)}.` : ''}`);
  }
  l.push(`Garantía: ${fraseGarantiaVenta(v)}`);
  return l.join('\n');
}

// ---------- Pintar y escuchar ----------
function renderVenta() {
  const c = $('#venta'); if (!c) return;
  if (estado.cliente) { c.innerHTML = htmlVistaClienteVenta(evaluarVentaActual()); return; }
  c.innerHTML = `<div class="venta-in"><section class="venta-form">${htmlFormVenta()}</section><aside class="venta-res" id="venta-res" aria-label="Tu propuesta"></aside></div>`;
  renderVentaResultado();
}
function renderVentaResultado() {
  if (estado.area !== 'venta') return;
  if (estado.cliente) { renderVenta(); return; }
  const c = $('#venta-res'); if (!c) return;
  const v = evaluarVentaActual();
  c.innerHTML = htmlResultadoVenta(v);
  actualizarCalcVenta(v);
}
// Cuando cambia el precio, lo que cuesta o cuántas vende, se pasa a lo que usa la pestaña Clientes
function sincronizarProducto(l, campo) {
  const P = estado.prospecto, t = n(l.ticket);
  if ((campo === 'costo' || campo === 'ticket') && !vacio(l.costo) && t > 0) { l.margen = Math.round((t - n(l.costo)) / t * 1000) / 10; P.fuentes[`linea:${l.id}:margen`] = 'calculado'; delete P.rangos[`linea:${l.id}:margen`]; }
  if ((campo === 'unidadesMes' || campo === 'ticket') && !vacio(l.unidadesMes) && t > 0) { l.facturacion = Math.round(n(l.unidadesMes) * t); P.fuentes[`linea:${l.id}:facturacion`] = 'calculado'; delete P.rangos[`linea:${l.id}:facturacion`]; }
}
function onEntradaVenta(e) {
  const el = e.target; if (!el.matches('input')) return;
  const P = estado.prospecto;
  if (el.dataset.regla) { setPath(estado.reglas, el.dataset.regla, parseNumero(el.value)); programarGuardarReglas(); renderVentaResultado(); return; }
  const tipo = el.dataset.vt, v = tipo === 'txt' ? el.value : parseNumero(el.value);
  let clave = el.dataset.v;
  if (!clave && el.dataset.nueva !== undefined) {
    if (vacio(v)) return;
    const nl = lineaBase({ tipoVenta: P.lineas[0]?.tipoVenta || 'b2cAlto' });
    P.lineas.push(nl);
    document.querySelectorAll(`[data-fila="${el.dataset.fila}"][data-nueva]`).forEach(x => { x.dataset.v = `linea:${nl.id}:${x.dataset.campo}`; delete x.dataset.nueva; });
    clave = el.dataset.v;
  }
  if (!clave) return;
  setValor(clave, v);
  delete P.rangos[clave];
  if (tipo !== 'txt') { if (vacio(v)) delete P.fuentes[clave]; else P.fuentes[clave] = 'dato'; }
  if (clave.startsWith('linea:')) { const [, id, campo] = clave.split(':'), l = P.lineas.find(x => x.id === id); if (l) sincronizarProducto(l, campo); }
  if (clave === 'negocio.nombre' && P._ejemplo) delete P._ejemplo;
  programarCalculo();
}
function onClicVenta(e) {
  const b = e.target.closest('[data-vchip]'); if (!b) return;
  setValor(b.dataset.vchip, b.dataset.valor);
  renderVenta(); programarCalculo();
  const nb = document.querySelector(`[data-vchip="${CSS.escape(b.dataset.vchip)}"][data-valor="${CSS.escape(b.dataset.valor)}"]`); if (nb) nb.focus();
}
function onSalidaVenta(e) { const el = e.target; if (el.dataset && el.dataset.vt === 'num' && el.dataset.v) { const x = parseNumero(el.value); if (x !== '') el.value = fmtCorto(x); } }
