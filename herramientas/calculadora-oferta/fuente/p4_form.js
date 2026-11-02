
// =================== Pasos del formulario ===================
const PASOS = [
  { id: 1, nombre: 'El negocio' }, { id: 2, nombre: 'Lo que quiere' }, { id: 3, nombre: 'Lo que vende' }, { id: 4, nombre: 'Sus clientes' },
  { id: 5, nombre: '¿Le alcanza?' }, { id: 6, nombre: 'Su oferta' }, { id: 7, nombre: 'Anuncios' }, { id: 8, nombre: 'Tu servicio' }, { id: 9, nombre: 'Ajustes' },
];
// En un lanzamiento cambian tres pasos: el día del canje, la fecha con su publicidad y las 5 cosas del dueño
const PASOS_LANZ = PASOS.map(x => x.id === 5 ? { id: 5, nombre: 'El canje' } : x.id === 6 ? { id: 6, nombre: 'Su promo' } : x.id === 7 ? { id: 7, nombre: 'La fecha' } : x.id === 8 ? { id: 8, nombre: 'Sus 5 cosas' } : x);
const pasosActuales = () => esLanz() ? PASOS_LANZ : PASOS;
function lineaFoco() {
  const p = estado.prospecto;
  if (ultimo && ultimo.ev) return p.lineas.find(x => x.id === ultimo.ev.foco.id) || p.lineas[0];
  return p.lineas.find(x => x.id === p.foco) || p.lineas[0];
}
function clavesImportantes() {
  const p = estado.prospecto, out = [];
  out.push({ clave: 'negocio.facturacion', paso: 1, txt: '¿Cuánto vende en un mes normal?' });
  out.push({ clave: 'negocio.gastosFijos', paso: 1, txt: '¿Cuánto gasta al mes aunque no venda?' });
  out.push({ clave: 'meta.valor', paso: 2, txt: '¿Qué quiere lograr?' });
  for (const l of p.lineas) {
    const nom = (l.nombre || '').trim() || 'lo que vende';
    out.push({ clave: `linea:${l.id}:ticket`, paso: 3, txt: `¿Cuánto paga un cliente por «${nom}»?` });
    out.push({ clave: `linea:${l.id}:margen`, paso: 3, txt: `¿Cuánto le queda de cada 100 en «${nom}»?` });
    if (l.tipo === 'recurrente') out.push({ clave: `linea:${l.id}:vidaMeses`, paso: 3, txt: `¿Cuántos meses se queda un cliente de «${nom}»?` });
    if (l.tipo === 'repetida') { out.push({ clave: `linea:${l.id}:comprasAnio`, paso: 3, txt: `¿Cuántas veces al año compran «${nom}»?` }); out.push({ clave: `linea:${l.id}:aniosCliente`, paso: 3, txt: `¿Cuántos años siguen comprando «${nom}»?` }); }
    out.push({ clave: `linea:${l.id}:cicloDias`, paso: 3, txt: `¿Cuántos días tarda una venta de «${nom}»?` });
  }
  out.push({ clave: 'hoy.interesadosMes', paso: 4, txt: '¿Cuántas personas le escriben al mes?' });
  out.push({ clave: 'hoy.clientesMes', paso: 4, txt: '¿Cuántos clientes nuevos consigue al mes?' });
  if (esLanz()) {
    out.push({ clave: 'lanzamiento.stock', paso: 5, txt: '¿Cuántas unidades separa para la promo?' });
    out.push({ clave: 'lanzamiento.atiendeDia', paso: 5, txt: '¿Cuántas personas atiende bien en un día de canje?' });
    out.push({ clave: 'capacidad.mensajesDia', paso: 5, txt: '¿Cuántos mensajes pueden mandar bien por día?' });
    out.push({ clave: 'lanzamiento.fecha', paso: 7, txt: '¿Qué día es el canje?' });
    out.push({ clave: 'lanzamiento.porque', paso: 7, txt: '¿Por qué ese día?' });
    return out.map(x => ({ ...x, estado: vacio(getValor(x.clave)) ? 'falta' : estado.prospecto.fuentes[x.clave] === 'estimado' ? 'estimado' : 'ok' }));
  }
  if (p.hoy.quienPauta !== 'nadie') { out.push({ clave: 'hoy.pautaMes', paso: 4, txt: '¿Cuánto paga en anuncios al mes?' }); out.push({ clave: 'hoy.ventasPautaMes', paso: 4, txt: '¿Cuántas ventas le traen los anuncios?' }); }
  out.push({ clave: 'capacidad.actuales', paso: 5, txt: '¿Cuánto atiende hoy?' });
  out.push({ clave: 'capacidad.maxHoy', paso: 5, txt: '¿Cuánto podría atender como máximo?' });
  out.push({ clave: 'capacidad.mensajesDia', paso: 5, txt: '¿Cuántos mensajes puede contestar bien por día?' });
  return out.map(x => ({ ...x, estado: vacio(getValor(x.clave)) ? 'falta' : estado.prospecto.fuentes[x.clave] === 'estimado' ? 'estimado' : 'ok' }));
}
function renderProgreso() {
  const items = clavesImportantes(), ok = items.filter(x => x.estado === 'ok').length;
  $('#progreso').innerHTML = `<div class="progreso-fila"><span>Respuestas importantes</span><b>${ok} de ${items.length}</b></div><div class="barrita"><i style="width:${items.length ? ok / items.length * 100 : 0}%"></i></div>`;
  $('#pasos').innerHTML = pasosActuales().map(ps => {
    const its = items.filter(x => x.paso === ps.id), listo = its.length > 0 && its.every(x => x.estado === 'ok');
    return `<button type="button" role="tab" class="paso-btn${listo ? ' listo' : ''}" aria-selected="${estado.paso === ps.id}" data-paso="${ps.id}"><span class="nro">${listo ? '✓' : ps.id}</span>${esc(ps.nombre)}</button>`;
  }).join('');
}
const OP_TIPO = [['recurrente', 'Le paga cada mes'], ['repetida', 'Vuelve a comprar'], ['unica', 'Compra una vez']];
const OP_VENTA = [['b2b', 'A empresas'], ['b2cAlto', 'A personas: compras grandes'], ['b2cBajo', 'A personas: compras rápidas']];
function htmlLinea(l, i, total) {
  const mon = estado.reglas.moneda, k = c => `linea:${l.id}:${c}`;
  const etq = l.tipo === 'recurrente' ? '¿Cuánto le paga cada mes un cliente?' : l.tipo === 'repetida' ? '¿Cuánto paga cada vez que compra?' : '¿Cuánto paga un cliente?';
  return `<div class="grupo linea-tarjeta" data-id="${esc(l.id)}">
    <div class="linea-cab"><div class="campo-in"><input aria-label="Nombre de lo que vende ${i + 1}" data-clave="${esc(k('nombre'))}" data-tipo="txt" value="${esc(l.nombre)}" placeholder="¿Qué vende? Ej. contratos de mantenimiento"></div>${total > 1 ? `<button class="btn-g btn-chico" type="button" data-quitar="${esc(l.id)}">Quitar</button>` : ''}</div>
    ${chips({ clave: k('tipo'), q: '¿Cómo le paga el cliente?', opciones: OP_TIPO, estructura: true })}
    ${pregunta({ clave: k('ticket'), q: etq, ayuda: 'ticket', pre: mon, fmt: 'dinero', importante: true })}
    ${pregunta({ clave: k('margen'), q: 'De cada 100 que cobra, ¿cuánto le queda después de pagar lo que cuesta?', ayuda: 'margen', suf: 'de 100', importante: true })}
    ${l.tipo === 'recurrente' ? pregunta({ clave: k('vidaMeses'), q: '¿Cuántos meses se queda pagando un cliente?', ayuda: 'vida', suf: 'meses', importante: true }) : ''}
    ${l.tipo === 'repetida' ? pregunta({ clave: k('comprasAnio'), q: '¿Cuántas veces al año le compra un cliente?', ayuda: 'frecuencia', suf: 'veces', importante: true }) + pregunta({ clave: k('aniosCliente'), q: '¿Cuántos años le sigue comprando?', ayuda: 'anios', suf: 'años', importante: true }) : ''}
    ${pregunta({ clave: k('cicloDias'), q: '¿Cuántos días pasan desde que alguien pregunta hasta que paga?', ayuda: 'ciclo', suf: 'días', importante: true })}
    ${pregunta({ clave: k('facturacion'), q: '¿Cuánto vende de esto al mes?', ayuda: 'lineaFacturacion', pre: mon, fmt: 'dinero', nota: 'Si no lo sabe, no pasa nada.' })}
    ${chips({ clave: k('tipoVenta'), q: '¿A quién le vende?', opciones: OP_VENTA, estructura: true })}
    ${chips({ clave: k('competencia'), q: '¿Cuánta competencia tiene?', opciones: [['baja', 'Poca'], ['media', 'Normal'], ['alta', 'Mucha']] })}
    ${chips({ clave: k('capacidad'), q: '¿Cuánto más puede vender sin que se le complique?', opciones: [['mucha', 'Mucho'], ['media', 'Algo'], ['poca', 'Casi nada']] })}
    ${interruptor({ clave: k('abrePuertas'), q: 'Quien compra esto, después le compra otras cosas', estructura: true })}
    ${l.abrePuertas ? pregunta({ clave: k('ventaCruzadaPct'), q: 'De cada 100, ¿cuántos le compran otra cosa?', suf: 'de 100' }) + pregunta({ clave: k('ventaCruzadaGanancia'), q: '¿Cuánto le queda de esa otra venta?', pre: mon, fmt: 'dinero' }) : ''}
  </div>`;
}
function htmlAjustes(tipo) {
  const t = TIPOS_VENTA[tipo], b = `supuestos.${tipo}`, mon = estado.reglas.moneda;
  const reg = (c, q, extra = {}) => { const v = getPath(estado.reglas, c), id = 'r-' + idSeguro(c); return `<div class="fila"><div class="fila-cab"><label for="${id}">${esc(q)}</label></div><div class="campo-in">${extra.pre ? `<span class="pre">${esc(extra.pre)}</span>` : ''}<input id="${id}" class="num" inputmode="decimal" data-regla="${esc(c)}" value="${esc(vacio(v) ? '' : extra.pre ? fmtN(v) : String(v))}">${extra.suf ? `<span class="suf">${esc(extra.suf)}</span>` : ''}</div>${extra.nota ? `<p class="nota">${esc(extra.nota)}</p>` : ''}</div>`; };
  const lanz = `<p class="grupo-titulo">Tu lanzamiento</p>
    <div class="grupo">
      ${reg('precioLanzamiento', 'Precio de un lanzamiento', { pre: mon, nota: 'Se cobra en dos mitades.' })}
      ${reg('primeraMitadPct', 'Lo que se paga para empezar', { suf: 'de 100', nota: '50 = la mitad al empezar y la otra cuando lleguen los clientes de la garantía.' })}
      ${reg('anunciosMinimoLanz', 'Lo mínimo en publicidad por lanzamiento', { pre: mon, nota: 'Es una de sus 5 cosas: con menos, no aceptas.' })}
      ${reg('topeGarantia', 'Tope del número de la garantía', { suf: 'clientes', nota: 'Si sale más, eliges con él otro producto antes de ofrecer la garantía.' })}
      ${reg('diasExtraGarantia', 'Días más con el video ganador si no llegan', { suf: 'días' })}
      ${reg('llegadaLanzPct', 'De cada 100 que reservan, llegan', { suf: 'de 100', nota: 'Tu supuesto hasta tener 10 reservas contadas de lanzamientos terminados. Cámbialo con tus datos.' })}
      ${reg('horasLanzamiento', 'Tus horas por lanzamiento', { suf: 'horas' })}
    </div>
    <p class="grupo-titulo">El plan de cada mes (después del lanzamiento)</p>
    <div class="grupo">
      ${reg('planMes', 'Precio cada 4 semanas', { pre: mon })}
      ${reg('planMesCompromiso', 'Precio con compromiso', { pre: mon })}
      ${reg('mesesCompromiso', 'Meses de compromiso', { suf: 'meses' })}
    </div>`;
  return `${esLanz() ? lanz : ''}<p class="grupo-titulo">Tu precio (plan mensual)</p>
    <div class="grupo">
      ${reg('precioMinimo', 'Tu precio mínimo al mes', { pre: mon, nota: 'Nunca cobras menos que esto.' })}
      ${reg('anunciosMinimo', 'Lo mínimo en anuncios al mes', { pre: mon, nota: 'Si el cliente no puede poner esto, no lo aceptas.' })}
      ${reg('partePct', '¿Qué parte de lo que le haces ganar cobras?', { suf: 'de 100', nota: '20 = te quedas con 1 de cada 5 bolivianos que le haces ganar. Él se queda con 4.' })}
      <div class="fila"><label class="switch-fila" for="r-bono"><span>Cobrar un premio si pasamos lo mínimo</span><input type="checkbox" role="switch" class="switch" id="r-bono" data-regla="bono" data-tipo="chk"${estado.reglas.bono ? ' checked' : ''}></label></div>
      ${estado.reglas.bono ? reg('bonoPct', 'Premio: parte de lo que pase de lo mínimo', { suf: 'de 100' }) : ''}
      <div class="fila"><div class="fila-cab"><label for="r-moneda">Moneda</label></div><div class="campo-in"><input id="r-moneda" data-regla="moneda" data-tipo="txt" value="${esc(estado.reglas.moneda)}"></div></div>
    </div>
    <p class="grupo-titulo">Lo que ve el cliente</p>
    <div class="grupo">
      <div class="fila"><div class="fila-cab"><label for="r-marca">Tu nombre o marca (arriba de la vista del cliente)</label></div><div class="campo-in"><input id="r-marca" data-regla="marca" data-tipo="txt" value="${esc(estado.reglas.marca || '')}"></div></div>
      <div class="fila"><div class="fila-cab"><label for="r-garantia">Tu garantía, con tus palabras (vacío = la de siempre)</label></div><div class="campo-in"><input id="r-garantia" data-regla="garantiaTexto" data-tipo="txt" value="${esc(estado.reglas.garantiaTexto || '')}" placeholder="Usa {meses} y {promesa} para que se llenen solos"></div><p class="nota">Ejemplo: «Pagas la mitad al empezar y la otra mitad cuando lleguen ${'{promesa}'}. Si no llegan, no la pagas.»</p></div>
      <div class="fila"><label class="switch-fila" for="r-caso"><span>Mostrar el caso real de Sneaker Fashion en la vista del cliente</span><input type="checkbox" role="switch" class="switch" id="r-caso" data-regla="casoReal" data-tipo="chk"${estado.reglas.casoReal !== false ? ' checked' : ''}></label></div>
    </div>
    <p class="grupo-titulo">Cuánto sueles mejorar anuncios que ya existen</p>
    <div class="grupo">
      ${reg('mejora.piso', 'Lo mínimo', { suf: '% más barato' })}
      ${reg('mejora.meta', 'Lo esperado', { suf: '% más barato' })}
      ${reg('mejora.techo', 'Si sale muy bien', { suf: '% más barato' })}
    </div>
    <p class="grupo-titulo">Valores típicos de «${esc(t.nombre)}»</p>
    <div class="grupo">
      <div class="fila"><p class="nota">Los uso cuando no hay datos. No son medidos: cámbialos por tus números reales. También aceptan rangos («20 a 40»).</p></div>
      <div class="fila"><p class="nota">Lo que cuestan los anuncios (vistas, mensajes, cupones) ya no va aquí: sale del paso 7, «Anuncios», según la plataforma y el objetivo.</p></div>
      ${pregunta({ clave: `${b}.calificaPct`, q: 'De cada 100 que escriben, ¿cuántos sí le pueden comprar?', suf: 'de 100', ayuda: 'califica' })}
      ${pregunta({ clave: `${b}.cierrePct`, q: 'De esos, ¿cuántos compran si los atienden bien?', suf: 'de 100', ayuda: 'cierre' })}
      ${pregunta({ clave: `${b}.organico`, q: '¿Cuántas personas al mes trae el contenido?', suf: 'al mes', ayuda: 'organico' })}
      ${pregunta({ clave: `${b}.reactivacionPct`, q: 'De cada 100 que no compraron, ¿cuántos compran si les vuelven a escribir?', suf: 'de 100' })}
      ${pregunta({ clave: `${b}.publicidadPct`, q: 'Si no hay plata para anuncios definida, ¿qué parte de lo que vende sugerir?', suf: '%', rango: false })}
      <div class="fila"><button class="btn-g btn-chico" type="button" id="btn-sup-reset" data-tipo-venta="${esc(tipo)}">Volver a los valores típicos</button></div>
    </div>
    <p class="grupo-titulo">Otros gastos del cliente</p>
    <div class="grupo">
      ${pregunta({ clave: 'plan.herramientas', q: 'Herramientas al mes (WhatsApp, agenda)', pre: mon, fmt: 'dinero', rango: false })}
      ${pregunta({ clave: 'plan.inicial', q: 'Gasto de una sola vez (equipo, página web)', pre: mon, fmt: 'dinero', rango: false })}
      ${pregunta({ clave: 'plan.ahorro', q: 'Lo que deja de pagar al mes (ej. su agencia)', pre: mon, fmt: 'dinero', rango: false })}
      ${pregunta({ clave: 'plan.duracionManual', q: '¿Cuántos meses dura el plan? (vacío = lo calculo yo)', suf: 'meses', rango: false })}
    </div>
    <p class="grupo-titulo">Tus horas al mes</p>
    <div class="grupo">
      ${SERVICIOS.map(s => reg('horas.' + s.id, s.nombre, { suf: 'horas' })).join('')}
      ${reg('horaObjetivo', 'Lo mínimo que quieres ganar por hora (0 = no revisar)', { pre: mon })}
      <div class="fila"><button class="btn-g btn-chico" type="button" id="btn-reglas-reset">Volver a mis valores de inicio</button></div>
    </div>${esLanz() ? '' : lanz}`;
}
const TXT_META = {
  aumento: { q: '¿Cuánto más quiere vender al mes?', pre: true, corto: 'vender más' },
  ganancia: { q: '¿Cuánto más quiere ganar al mes (lo que le queda, no lo que vende)?', pre: true, corto: 'ganar más' },
  total: { q: '¿Cuánto quiere llegar a vender al mes?', pre: true, corto: 'llegar a vender' },
  clientes: { q: '¿Cuántos clientes nuevos quiere al mes?', pre: false, corto: 'más clientes' },
};
const IDEAS_BONOS = ['Diagnóstico o revisión gratis', 'Instalación o entrega incluida', 'Garantía más larga', 'Capacitación o guía de uso', 'Soporte por WhatsApp', 'Primera revisión sin costo', 'Envío gratis', 'Una muestra o prueba'];
function renderForm() {
  const p = estado.prospecto, mon = estado.reglas.moneda, paso = estado.paso;
  const ej = p._ejemplo;
  const nomEj = { brisa: ' (Brisa Técnica)', joyeria: ' (una joyería)', cafe: ' (un café de barrio)', lanzTenis: ' de lanzamiento (una tienda de tenis)', lanzBebe: ' de lanzamiento (una tienda de bebé)', lanzHeladeria: ' de lanzamiento (una heladería)' }[ej];
  renderModelo();
  $('#banner').innerHTML = !ej ? '' : String(ej).startsWith('min')
    ? `<div class="aviso-ejemplo"><b>Ejemplo en el mínimo que puedes aceptar.</b> Datos inventados, puestos justo en el límite: si cualquiera de sus números baja, ya no conviene. Mira la tarjeta «Lo mínimo para aceptarlo» en el panel.</div>`
    : `<div class="aviso-ejemplo"><b>Es un ejemplo${nomEj || ''}.</b> Los datos son inventados. Toca «Nuevo» para un cliente real.</div>`;
  let html = '';
  if (paso === 1) {
    html = `<p class="grupo-titulo">Quién es</p><div class="grupo">${texto({ clave: 'negocio.nombre', q: '¿Cómo se llama el negocio?', ph: 'Ej. Joyería Aurora' })}${texto({ clave: 'negocio.ciudad', q: '¿En qué ciudad está?', ph: 'Ej. La Paz' })}${texto({ clave: 'negocio.rubro', q: '¿Qué hace, en pocas palabras?', ph: 'Ej. vende joyas de plata y oro' })}</div>
      <p class="grupo-titulo">Su plata</p><div class="grupo">
      ${pregunta({ clave: 'negocio.facturacion', q: '¿Cuánto vende en un mes normal?', ayuda: 'facturacion', pre: mon, fmt: 'dinero', importante: true })}
      ${pregunta({ clave: 'negocio.gastosFijos', q: '¿Cuánto gasta al mes aunque no venda nada?', ayuda: 'gastosFijos', pre: mon, fmt: 'dinero', importante: true, nota: 'Alquiler, sueldos fijos, luz, agua, lo que saca el dueño.' })}
      ${pregunta({ clave: 'negocio.caja', q: '¿Cuánto podría poner los primeros meses sin que le duela?', ayuda: 'caja', pre: mon, fmt: 'dinero' })}
      ${chips({ clave: 'negocio.cobroDias', q: 'Cuando vende, ¿cuándo le pagan?', opciones: [['0', 'Al momento'], ['15', 'A 15 días'], ['30', 'A 30 días'], ['60', 'A 60 días'], ['90', 'A 90 o más']], nota: 'Si le pagan tarde, la plata del plan también llega tarde. Lo cuento en «Su plata, mes a mes».' })}
      ${seleccion({ clave: 'negocio.temporadaAlta', q: '¿En qué mes vende más?', opciones: [['', 'No tiene un mes fuerte'], ...MESES.map((m, i) => [String(i + 1), m[0].toUpperCase() + m.slice(1)])] })}</div>`;
  } else if (paso === 2) {
    const tm = TXT_META[p.meta.tipo] || TXT_META.aumento;
    html = `<p class="nota" style="padding:0 4px">Pregúntale qué quiere lograr <b>con sus palabras</b>. Después la calculadora lo traduce a clientes y mensajes <b>por día</b>, y te dice si el plan llega.</p>
      <p class="grupo-titulo">Su meta</p><div class="grupo">
      ${chips({ clave: 'meta.tipo', q: '¿Qué quiere?', opciones: [['aumento', 'Vender más'], ['ganancia', 'Ganar más'], ['total', 'Llegar a vender X'], ['clientes', 'Más clientes']], estructura: true })}
      ${pregunta({ clave: 'meta.valor', q: tm.q, ayuda: 'metaValor', pre: tm.pre ? mon : '', fmt: tm.pre ? 'dinero' : '', suf: tm.pre ? 'al mes' : 'al mes', importante: true })}
      ${pregunta({ clave: 'meta.plazo', q: '¿En cuántos meses quiere lograrlo?', suf: 'meses', ph: ultimo && ultimo.ev && ultimo.ev.D ? String(ultimo.ev.D) : '6' })}
      ${pregunta({ clave: 'meta.diasMes', q: '¿Cuántos días trabaja al mes?', suf: 'días', ph: '26', rango: false })}
      </div>
      <div id="vivo-meta">${htmlVivoMeta()}</div>
      <p class="grupo-titulo">Lo que puede poner</p><div class="grupo">
      ${esLanz() ? pregunta({ clave: 'meta.presupuestoTotal', q: '¿Cuánto pensaba invertir en esta promo (tu servicio + la publicidad)?', ayuda: 'presupuestoTotal', pre: mon, fmt: 'dinero' })
        : pregunta({ clave: 'meta.presupuestoTotal', q: '¿Cuánto pensaba invertir al mes en total (tu servicio + anuncios)?', ayuda: 'presupuestoTotal', pre: mon, fmt: 'dinero' }) + pregunta({ clave: 'meta.paciencia', q: '¿En cuántos meses quiere ver los primeros resultados?', suf: 'meses' })}</div>`;
  } else if (paso === 3) {
    html = `<p class="nota" style="padding:0 4px">Anota cada cosa que vende por separado. Si no puede separarlo, deja una sola con lo que más vende.</p>
      ${p.lineas.map((l, i) => htmlLinea(l, i, p.lineas.length)).join('')}
      <div><button class="btn-g" type="button" id="btn-agregar-linea">+ Agregar otra cosa que vende</button></div>`;
  } else if (paso === 4) {
    html = `<div class="grupo">${chips({ clave: 'hoy.numerosDe', q: 'Los números que te dé, ¿de qué son?', opciones: [['linea', 'De lo que vamos a potenciar'], ['negocio', 'De todo el negocio']] })}</div>
      <p class="grupo-titulo">Cuántos llegan y cuántos compran</p><div class="grupo">
      ${pregunta({ clave: 'hoy.interesadosMes', q: '¿Cuántas personas le escriben o preguntan al mes?', ayuda: 'interesados', importante: true })}
      ${pregunta({ clave: 'hoy.clientesMes', q: '¿Cuántos clientes nuevos consigue al mes?', ayuda: 'clientes', importante: true })}
      ${pregunta({ clave: 'hoy.viejos', q: '¿Cuántos preguntaron en los últimos 3 meses y no compraron?', ayuda: 'viejos' })}
      ${chips({ clave: 'hoy.mide', q: '¿Anota de dónde viene cada cliente (anuncio, recomendación, pasó por ahí)?', opciones: [['si', 'Sí, siempre'], ['aveces', 'A veces'], ['no', 'No']], nota: 'Sin eso no se puede probar si el plan funcionó.' })}</div>
      <p class="grupo-titulo">Cómo atiende</p><div class="grupo">
      ${chips({ clave: 'hoy.respuesta', q: '¿Cuánto tarda en contestar un mensaje?', opciones: [['5min', 'Minutos'], ['hora', 'Menos de 1 hora'], ['dia', 'En el día'], ['mas', 'Más de 1 día'], ['nose', 'No sabe']] })}
      ${chips({ clave: 'hoy.seguimiento', q: 'Si alguien no compra, ¿le vuelve a escribir?', opciones: [['sistema', 'Siempre'], ['aveces', 'A veces'], ['nunca', 'Nunca'], ['nose', 'No sabe']] })}
      ${pregunta({ clave: 'hoy.diasPropuesta', q: '¿Cuántos días tarda en mandar el precio?', suf: 'días' })}
      ${chips({ clave: 'hoy.quienVende', q: '¿Quién atiende a los que preguntan?', opciones: [['equipo', 'Una persona o equipo'], ['dueno', 'El dueño'], ['nadie', 'Nadie en especial']] })}</div>
      <p class="grupo-titulo">Anuncios y contenido</p><div class="grupo">
      ${chips({ clave: 'hoy.quienPauta', q: '¿Quién maneja sus anuncios?', opciones: [['nadie', 'No pone anuncios'], ['dueno', 'Él o su equipo'], ['agencia', 'Una agencia']], estructura: true })}
      ${p.hoy.quienPauta !== 'nadie' ? pregunta({ clave: 'hoy.pautaMes', q: '¿Cuánto paga al mes en anuncios?', ayuda: 'pauta', pre: mon, fmt: 'dinero', importante: true, nota: 'Solo lo que paga a Facebook, Instagram, TikTok o Google.' }) + pregunta({ clave: 'hoy.ventasPautaMes', q: '¿Cuántas ventas al mes le traen esos anuncios?', ayuda: 'ventasPauta', importante: true }) : ''}
      ${interruptor({ clave: 'hoy.equipoContenido', q: 'Tiene su propio equipo que graba y edita videos' })}
      ${chips({ clave: 'hoy.contenidoPrueba', q: '¿Muestra casos, opiniones de clientes y precios?', opciones: [['bastante', 'Bastante'], ['poco', 'Poco'], ['nada', 'Nada']] })}</div>`;
  } else if (paso === 5 && esLanz()) {
    html = htmlPaso5Lanz();
  } else if (paso === 7 && esLanz()) {
    html = htmlPaso7Lanz();
  } else if (paso === 8 && esLanz()) {
    html = htmlPaso8Lanz();
  } else if (paso === 5) {
    const l = lineaFoco(), rec = l && l.tipo === 'recurrente', nom = l ? ((l.nombre || '').trim() || 'lo que vende') : 'lo que vende';
    const C = p.capacidad;
    html = `<div class="explica"><b>Dos preguntas simples:</b> ¿puede <b>atender</b> a más clientes? y ¿puede <b>contestar</b> a más mensajes? Si no puede, los clientes que le traigas se pierden y la promesa no se cumple.<br><span>Piensa solo en «${esc(nom)}». ${rec ? 'Como le pagan cada mes, cuenta <b>clientes a la vez</b> (cada cliente ocupa un lugar mientras sigue pagando).' : 'Cuenta <b>ventas o trabajos por mes</b>. Ojo: un cliente que vuelve a comprar sigue ocupando lugar los meses siguientes.'}</span></div>
      <p class="grupo-titulo">1. Atender</p><div class="grupo">
      ${pregunta({ clave: 'capacidad.actuales', q: rec ? '¿Cuántos clientes atiende hoy (de los que le pagan cada mes)?' : '¿Cuántas ventas o trabajos hace en un mes normal?', ayuda: 'capActuales', suf: rec ? 'clientes' : 'al mes', importante: true })}
      ${pregunta({ clave: 'capacidad.maxHoy', q: rec ? 'Con la gente que tiene hoy, ¿cuántos clientes podría atender como máximo sin que baje la calidad?' : 'Con la gente y el lugar que tiene hoy, ¿cuántas podría hacer como máximo en un mes sin que baje la calidad?', ayuda: 'capMax', suf: rec ? 'clientes' : 'al mes', importante: true })}
      ${pregunta({ clave: 'capacidad.contrataria', q: 'Si llegan más clientes, ¿a cuántas personas más contrataría?', suf: 'personas', ph: '0' })}
      ${n(C.contrataria) > 0 || !vacio(C.porPersona) ? pregunta({ clave: 'capacidad.porPersona', q: rec ? '¿Cuántos clientes más podría atender cada persona nueva?' : '¿Cuántas ventas o trabajos más al mes haría cada persona nueva?', suf: rec ? 'clientes' : 'al mes' }) + pregunta({ clave: 'capacidad.mesesContratar', q: '¿En cuántos meses tendría a esa persona trabajando bien?', suf: 'meses', ph: '2' }) : ''}
      </div>
      <p class="grupo-titulo">2. Contestar</p><div class="grupo">
      ${pregunta({ clave: 'capacidad.mensajesDia', q: '¿Cuántas conversaciones puede contestar bien por día?', ayuda: 'mensajesDia', suf: 'por día', importante: true, nota: 'Contestar bien = en menos de 1 hora, y volver a escribir a quien no compró.' })}</div>
      <div id="vivo-cap">${htmlVivoCap()}</div>
      <p class="grupo-titulo">Opcional</p><div class="grupo">
      ${pregunta({ clave: 'capacidad.mercado', q: '¿Cuántos clientes posibles hay en su zona?', ayuda: 'mercado' })}</div>`;
  } else if (paso === 6) {
    const O = p.oferta;
    const opsL = p.lineas.filter(l => n(l.ticket) > 0 || (l.nombre || '').trim()).map(l => [l.id, (l.nombre || '').trim() || 'Sin nombre']);
    if (O.activa && !O.lineaId && opsL.length) O.lineaId = (ultimo && ultimo.ev) ? ultimo.ev.foco.id : opsL[0][0];
    const lineaO = p.lineas.find(l => l.id === O.lineaId);
    const bonos = O.bonos.map((b, i) => `<div class="fila-lista" data-bono="${i}">
        <div class="fl-nombre">${celda({ clave: `oferta.bonos.${i}.nombre`, ph: 'Regalo. Ej. revisión gratis', tipo: 'txt', aria: `Regalo ${i + 1}` })}</div>
        <div class="fl-num"><span class="fl-eti">Te cuesta</span>${celda({ clave: `oferta.bonos.${i}.costo`, pre: mon, ph: '0', aria: `Lo que te cuesta el regalo ${i + 1}` })}</div>
        <div class="fl-num"><span class="fl-eti">Vale para él</span>${celda({ clave: `oferta.bonos.${i}.valor`, pre: mon, ph: '0', aria: `Lo que vale el regalo ${i + 1} para el cliente` })}</div>
        <button type="button" class="btn-borde btn-chico" data-quitar-bono="${i}" aria-label="Quitar regalo ${i + 1}">Quitar</button></div>`).join('');
    const segs = O.segmentos.map((s, i) => `<div class="fila-lista seg" data-seg="${i}">
        <div class="fl-nombre">${celda({ clave: `oferta.segmentos.${i}.nombre`, ph: 'Tipo de cliente. Ej. clínicas', tipo: 'txt', aria: `Tipo de cliente ${i + 1}` })}</div>
        <div class="fl-num"><span class="fl-eti">Cuántos tiene</span>${celda({ clave: `oferta.segmentos.${i}.cuantos`, ph: '0', aria: 'Cuántos clientes así tiene' })}</div>
        <div class="fl-num"><span class="fl-eti">Le compra al año</span>${celda({ clave: `oferta.segmentos.${i}.compraAnio`, pre: mon, ph: '0', aria: 'Cuánto le compra al año cada uno' })}</div>
        <div class="fl-num"><span class="fl-eti">Le queda de 100</span>${celda({ clave: `oferta.segmentos.${i}.margen`, ph: '30', aria: 'De cada 100, cuánto le queda' })}</div>
        <div class="fl-num"><span class="fl-eti">Paga</span>${selChico({ clave: `oferta.segmentos.${i}.paga`, opciones: [['atiempo', 'A tiempo'], ['tarde', 'Tarde'], ['muytarde', 'Muy tarde']], aria: 'Cómo paga' })}</div>
        <div class="fl-num"><span class="fl-eti">Da trabajo</span>${selChico({ clave: `oferta.segmentos.${i}.lio`, opciones: [['poco', 'Poco'], ['normal', 'Normal'], ['mucho', 'Mucho']], aria: 'Cuánto trabajo o problemas da' })}</div>
        <button type="button" class="btn-borde btn-chico" data-quitar-seg="${i}" aria-label="Quitar tipo de cliente ${i + 1}">Quitar</button></div>`).join('');
    html = `${esLanz() ? `<div class="explica"><b>La promo del lanzamiento.</b> Aquí armas lo que va en el cupón: el producto, el precio de la promo, el regalo y por qué ahora. Una oferta mejor que una rebaja.<span>Si armas la oferta del producto del lanzamiento, entra sola en la cuenta: lo que cuesta el regalo se resta de lo que le deja cada venta, y eso cambia el número de la garantía.</span></div>` : ''}<div class="explica"><b>Primero, a quién.</b> No todos los clientes valen lo mismo. Anota sus tipos de clientes y la calculadora te dice cuál es el <b>cliente ideal</b>: al que conviene hablarle en el contenido y los anuncios.</div>
      <p class="grupo-titulo">Cliente ideal</p><div class="grupo">
      <div class="fila">${htmlGuia('oferta.segmentos')}<div class="lista-filas">${segs || '<p class="nota">Todavía no hay tipos de clientes. Ejemplo: «clínicas», «oficinas», «restaurantes».</p>'}</div>
      <div><button class="btn-g btn-chico" type="button" id="btn-agregar-seg">+ Agregar tipo de cliente</button></div></div></div>
      <div id="vivo-icp">${htmlVivoICP()}</div>
      <div class="explica"><b>Después, qué le ofrecemos.</b> Una oferta irresistible hace que el cliente sienta que sería tonto decir que no: lo que quiere, rápido, fácil y sin riesgo. Aquí ves cuánto cuesta armarla y si sigue dejando ganancia.</div>
      <div class="grupo">${interruptor({ clave: 'oferta.activa', q: 'Armar una oferta irresistible para promocionar', estructura: true })}</div>
      ${O.activa ? `
      <p class="grupo-titulo">1. Qué vendemos</p><div class="grupo">
      ${opsL.length > 1 ? chips({ clave: 'oferta.lineaId', q: '¿Qué producto convertimos en oferta?', opciones: opsL, estructura: true }) : ''}
      ${texto({ clave: 'oferta.deseo', q: '¿Qué quiere lograr su cliente? (con sus palabras)', ph: 'Ej. que el aire de su empresa no falle en pleno calor', nota: 'No el producto: el resultado. Nadie quiere un taladro; quiere el agujero.' })}
      ${texto({ clave: 'oferta.tiempo', q: '¿Qué tan rápido lo logra?', ph: 'Ej. técnico en su empresa en menos de 4 horas' })}</div>
      <p class="grupo-titulo">2. El precio</p><div class="grupo">
      ${pregunta({ clave: 'oferta.precio', q: '¿A cuánto lo vendemos?', pre: mon, fmt: 'dinero', ph: lineaO && n(lineaO.ticket) > 0 ? fmtN(n(lineaO.ticket)) : '', nota: 'Vacío = el precio de hoy.', rango: false })}
      ${pregunta({ clave: 'oferta.valorProducto', q: '¿Cuánto vale para el cliente? (lo que le costaría resolverlo de otra forma)', pre: mon, fmt: 'dinero', ph: 'igual al precio', rango: false })}</div>
      <p class="grupo-titulo">3. Regalos que le quitan trabajo o miedo</p><div class="grupo">
      <div class="fila">${htmlGuia('oferta.bonos')}<div class="lista-filas">${bonos || '<p class="nota">Sin regalos todavía. Lo ideal: que te cuesten poco y valgan mucho para él.</p>'}</div>
      <div class="chips chips-chicos" aria-label="Ideas de regalos">${IDEAS_BONOS.map(t => `<button type="button" data-idea-bono="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div>
      <div><button class="btn-g btn-chico" type="button" id="btn-agregar-bono">+ Agregar regalo</button></div></div></div>
      <p class="grupo-titulo">4. Quitarle el miedo</p><div class="grupo">
      ${chips({ clave: 'oferta.garantia', q: '¿Qué garantía le das?', opciones: [['ninguna', 'Ninguna'], ['devolucion', 'Le devuelvo su plata'], ['repetir', 'Lo hago de nuevo gratis'], ['resultado', 'Si no logra el resultado, no paga']], estructura: true })}
      ${O.garantia !== 'ninguna' ? pregunta({ clave: 'oferta.usoGarantia', q: 'De cada 100 clientes, ¿cuántos crees que la usarían?', suf: 'de 100', ayuda: 'usoGarantia', rango: false }) : ''}</div>
      <p class="grupo-titulo">5. Que decida ahora</p><div class="grupo">
      ${chips({ clave: 'oferta.urgencia', q: '¿Por qué comprar ahora y no después?', opciones: [['ninguna', 'Nada'], ['cupos', 'Cupos limitados'], ['fecha', 'Hasta una fecha'], ['temporada', 'Antes de la temporada']] })}
      ${chips({ clave: 'oferta.pago', q: '¿Cómo paga?', opciones: [['contado', 'Todo junto'], ['cuotas', 'En cuotas'], ['mensual', 'Cada mes']] })}
      ${esLanz() ? '' : interruptor({ clave: 'oferta.usarEnCuenta', q: 'Usar esta oferta en las cuentas', nota: 'Cambia el precio y lo que le queda por venta. No cambia cuántos compran: eso se mide cuando salga.' })}</div>
      <div id="vivo-oferta">${htmlVivoOferta()}</div>` : ''}`;
  } else if (paso === 7) {
    const ad = ultimo && ultimo.ev ? ultimo.ev.ads : null, A = p.anuncios;
    const objEf = A.objetivo && A.objetivo !== 'auto' ? A.objetivo : (ad ? ad.objetivo : 'mensajes');
    const resNom = ad ? ad.resultadoNombre : 'resultado';
    html = `<div class="explica"><b>Dónde y cómo se pauta.</b> Elige la plataforma y qué quieres que haga la gente al ver el anuncio. Con eso calculo cuántas personas lo ven, cuántas escriben o piden el cupón, cuántas llegan y cuántas compran.<span>Los números son promedios de mercado aproximados y prudentes para Bolivia. Si ya pautó, anota sus datos reales abajo y uso esos.</span></div>
      <p class="grupo-titulo">La campaña</p><div class="grupo">
      ${chips({ clave: 'anuncios.plataforma', q: '¿Dónde se pauta?', opciones: [['tiktok', 'TikTok'], ['meta', 'Facebook e Instagram'], ['ambas', 'Las dos']] })}
      ${chips({ clave: 'anuncios.alcance', q: '¿De dónde vienen sus clientes?', opciones: [['auto', 'Que lo decida la calculadora'], ['barrio', 'De su zona'], ['ciudad', 'De toda la ciudad'], ['pais', 'De todo el país'], ['empresas', 'Son empresas']], nota: ad && ad.alcanceAuto ? `Ahora uso: ${ad.alcanceNombre.toLowerCase()}.` : '' })}
      ${chips({ clave: 'anuncios.objetivo', q: 'Cuando alguien ve el anuncio, ¿qué queremos que haga?', opciones: [['auto', 'Que lo decida la calculadora'], ['local', 'Que venga a la tienda'], ['mensajes', 'Que escriba por WhatsApp'], ['formulario', 'Que deje sus datos'], ['web', 'Que compre en la web'], ['conocer', 'Que lo conozca']], estructura: true, nota: ad && ad.objetivoAuto ? `Ahora uso: «${ad.objetivoNombre}».` : '' })}
      ${objEf === 'local' ? interruptor({ clave: 'anuncios.cupon', q: 'Habrá cupón o regalo para la primera visita', nota: 'Con un regalo que a él le cueste poco y al cliente le valga harto, llega mucha más gente.' }) : ''}
      </div>
      <p class="grupo-titulo">La plata</p><div class="grupo">
      ${pregunta({ clave: 'servicio.presupuesto', q: '¿Cuánto pondría en anuncios al mes? (lo paga directo a la plataforma)', pre: mon, fmt: 'dinero', nota: `Tu mínimo: ${fmtM(n(estado.reglas.anunciosMinimo), mon)}. Si lo dejas vacío, lo sugiero yo.`, rango: false })}
      ${pregunta({ clave: 'anuncios.tc', q: '¿A cuánto le cobra el banco cada dólar?', suf: 'Bs por dólar', ph: fmtN(TC_DEF, 2), nota: 'Desde abril de 2026 las tarjetas pagan al tipo de cambio del Banco Central (en noviembre de 2026, Bs 12,09). Confírmalo el día de la llamada en bcb.gob.bo.' })}
      ${chips({ clave: 'compromiso.pagoTarjeta', q: '¿Tiene tarjeta que acepte pagos en dólares?', opciones: [['si', 'Sí'], ['no', 'No'], ['nose', 'No sabe']], nota: 'Las tarjetas de débito tienen límite para pagos en el exterior. Sin una tarjeta que funcione, los anuncios no salen.' })}
      ${chips({ clave: 'servicio.reemplazaPauta', q: 'Si ya pone anuncios, ¿estos los reemplazan?', opciones: [['auto', 'Automático'], ['si', 'Sí'], ['no', 'No, son aparte']] })}</div>
      <div id="vivo-ads">${htmlVivoAds()}</div>
      <p class="grupo-titulo">Si ya pautó antes (opcional)</p><div class="grupo">
      ${pregunta({ clave: 'anuncios.costoResultadoReal', q: `¿Cuánto le costaba cada ${objEf === 'local' ? 'persona que pedía el cupón o escribía' : objEf === 'formulario' ? 'formulario' : objEf === 'web' ? 'visita a la web' : 'conversación (mensaje)'}?`, pre: mon, nota: 'Si lo sabe, uso su dato real en vez del promedio de mercado.' })}
      ${pregunta({ clave: 'anuncios.cpmReal', q: '¿Cuánto le costaban mil vistas?', pre: mon, nota: 'Está en el administrador de anuncios como «CPM».' })}</div>`;
  } else if (paso === 8) {
    html = `<p class="grupo-titulo">Qué trabajo es</p><div class="grupo">
      ${chips({ clave: 'servicio.modo', q: '¿Qué vas a hacer?', opciones: [['auto', 'Que lo decida la calculadora'], ['crecer', 'Traer clientes nuevos'], ['optimizar', 'Mejorar sus anuncios']] })}
      ${chips({ clave: 'servicio.contenido', q: 'Contenido', opciones: [['auto', 'Automático'], ['completo', 'Lo hago yo'], ['direccion', 'Solo ideas y guiones'], ['no', 'No']] })}
      ${chips({ clave: 'servicio.campanas', q: 'Anuncios', opciones: [['auto', 'Automático'], ['si', 'Sí'], ['no', 'No']] })}
      ${chips({ clave: 'servicio.guia', q: 'Guía para vender', opciones: [['auto', 'Automático'], ['si', 'Sí'], ['no', 'No']] })}
      ${chips({ clave: 'servicio.automatizacion', q: 'Respuesta automática por WhatsApp', opciones: [['auto', 'No'], ['si', 'Sí']] })}</div>
      <p class="grupo-titulo">Lo que el dueño acepta</p><div class="grupo">
      ${interruptor({ clave: 'compromiso.tiempo', q: 'Dar una hora por semana para revisar resultados' })}
      ${interruptor({ clave: 'compromiso.aplicaGuia', q: 'Seguir tu guía: contestar rápido y volver a escribir' })}
      ${interruptor({ clave: 'compromiso.aprueba', q: 'Aprobar el contenido en 2 días' })}
      ${interruptor({ clave: 'compromiso.pagaPublicidad', q: 'Pagar los anuncios directo a la plataforma, desde su cuenta' })}</div>`;
  } else {
    const tipo = (ultimo && ultimo.ev) ? ultimo.ev.tipo : (p.lineas[0]?.tipoVenta || 'b2b');
    estado.tipoAjustes = tipo;
    html = htmlAjustes(tipo);
  }
  html = htmlGuiaPaso(paso) + html;
  const ant = pasosActuales().find(x => x.id === paso - 1), sig = pasosActuales().find(x => x.id === paso + 1);
  html += `<div class="siguiente">${ant ? `<button class="btn-g btn-grande" type="button" data-ir-paso="${ant.id}">‹ ${esc(ant.nombre)}</button>` : '<span></span>'}${sig ? `<button class="btn-azul btn-grande" type="button" data-ir-paso="${sig.id}">Siguiente: ${esc(sig.nombre)} ›</button>` : ''}</div>`;
  $('#form').innerHTML = html;
  renderProgreso();
}
function irPaso(nro, clave) {
  estado.paso = nro; guardarLocal('co4.paso', nro);
  renderForm();
  if (estado.vista !== 'preguntas') cambiarVista('preguntas');
  if (clave) {
    const el = document.querySelector(`[data-clave="${CSS.escape(clave)}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.focus({ preventScroll: true }), 300); }
  } else {
    const c = $('#col-preguntas'); if (c && c.getBoundingClientRect().top < 0) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------- Vistas en vivo dentro de las preguntas ----------
function htmlVivoMeta() {
  const r = ultimo, p = estado.prospecto, mon = estado.reglas.moneda;
  if (!r || !r.ev) return `<div class="vivo"><p class="texto">Cuando anotes lo que vende (paso 3), aquí ves su meta traducida a clientes y mensajes por día.</p></div>`;
  if (r.lanz) return r.ev.metaDueno ? `<div class="vivo">${htmlMetaLanz(r).replace(/^<section class="tarjeta">|<\/section>$/g, '')}</div>` : `<div class="vivo"><p class="texto">Anota su meta y aquí ves cuánto lo acerca el lanzamiento y cuánto el plan de cada mes.</p></div>`;
  const md = r.ev.metaDueno;
  if (!md) return `<div class="vivo"><p class="texto">Anota su meta y aquí ves cuántos clientes, mensajes y anuncios necesita <b>por día</b>.</p></div>`;
  return `<div class="vivo">${htmlMetaTabla(r.ev, true)}</div>`;
}
function htmlVivoCap() {
  const r = ultimo;
  if (!r || !r.ev) return '';
  return `<div class="vivo">${htmlMedidores(r.ev, true)}</div>`;
}
function htmlVivoOferta() {
  const r = ultimo;
  if (!r || !r.oferta) return '';
  if (r.oferta.incompleta) return `<div class="vivo"><p class="texto">Anota el precio de «${esc(r.oferta.nombre)}» en el paso 3 para ver los números de la oferta.</p></div>`;
  return `<div class="vivo">${htmlOfertaResumen(r, true)}</div>`;
}
function htmlVivoICP() {
  const r = ultimo;
  if (!r || !r.icp) return '';
  return `<div class="vivo">${htmlICPTabla(r.icp, true)}</div>`;
}
function htmlVivoAds() {
  const r = ultimo;
  if (!r || !r.ev) return `<div class="vivo"><p class="texto">Cuando anotes lo que vende (paso 3), aquí ves el embudo de los anuncios.</p></div>`;
  if (!r.ev.ads) return `<div class="vivo"><p class="texto">${r.ev.modo === 'optimizar' ? 'El trabajo es mejorar sus anuncios de hoy: los números salen de lo que hoy le cuesta cada venta (paso 4).' : 'Sin anuncios en el plan (paso 8, «Anuncios: No»).'}</p></div>`;
  return `<div class="vivo">${htmlEmbudoAds(r, true)}</div>`;
}
function actualizarVivos() {
  const lz = $('#vivo-lanz'); if (lz) lz.innerHTML = htmlVivoLanz();
  const cj = $('#vivo-canje'); if (cj) cj.innerHTML = htmlVivoCanje();
  const ad = $('#vivo-ads'); if (ad) ad.innerHTML = htmlVivoAds();
  const m = $('#vivo-meta'); if (m) m.innerHTML = htmlVivoMeta();
  const c = $('#vivo-cap'); if (c) c.innerHTML = htmlVivoCap();
  const o = $('#vivo-oferta'); if (o) o.innerHTML = htmlVivoOferta();
  const i = $('#vivo-icp'); if (i) i.innerHTML = htmlVivoICP();
}

// ---------- Llenado automático ----------
// Un dato anotado en una subcalculadora que responde otra pregunta se copia allá.
// Solo si esa pregunta está vacía, o si la llenamos nosotros antes desde el mismo lugar. Nunca pisa lo que dijo el dueño.
const AUTOLLENAR = {
  'facturacion.dia.dias': 'meta.diasMes', 'capActuales.dia.dias': 'meta.diasMes', 'capMax.dia.dias': 'meta.diasMes', 'interesados.dia.dias': 'meta.diasMes', 'metaValor.dia.dias': 'meta.diasMes',
  'facturacion.semana.ticket': '@ticket', 'facturacion.dia.ticket': '@ticket', 'margen.costos.precio': '@ticket', 'lineaFacturacion.clientes.ticket': '@ticket', 'comisiones.partes.precio': '@ticket', 'impuestos.iva.precio': '@ticket',
  'ticket.division.ventasBs': '@facturacionLinea',
  'caja.meses.fijos': 'negocio.gastosFijos', 'lineaFacturacion.parte.total': 'negocio.facturacion', 'presupuestoTotal.parte.ventas': 'negocio.facturacion',
  'presupuestoTotal.hoy.anuncios': 'hoy.pautaMes', 'costoInteresado.medido.pago': 'hoy.pautaMes',
  'ventasPauta.diez.clientes': 'hoy.clientesMes', 'vida.seis.hoy': '@actualesRec',
};
const NOMBRE_CLAVE = { 'meta.diasMes': 'días que trabaja al mes', 'negocio.gastosFijos': 'gastos fijos', 'negocio.facturacion': 'cuánto vende al mes', 'hoy.pautaMes': 'cuánto paga en anuncios', 'hoy.clientesMes': 'clientes nuevos al mes', 'capacidad.actuales': 'cuántos atiende hoy' };
function lineaDeInst(inst) {
  const P = estado.prospecto, raiz = claveRaiz(inst);
  if (raiz.startsWith('linea:')) return P.lineas.find(l => l.id === raiz.split(':')[1]) || null;
  return P.lineas.length === 1 ? P.lineas[0] : null;
}
function destinoAuto(inst, tipo, k) {
  const A = AYUDAS[tipo]; if (!A) return null;
  const r = respuestaDe(inst, A), dst = AUTOLLENAR[`${tipo}.${r.metodo}.${k}`]; if (!dst) return null;
  const l = lineaDeInst(inst);
  if (dst === '@ticket') return l ? { clave: `linea:${l.id}:ticket`, nombre: `precio de «${(l.nombre || '').trim() || 'lo que vende'}»` } : null;
  if (dst === '@facturacionLinea') return l ? { clave: `linea:${l.id}:facturacion`, nombre: `cuánto vende de «${(l.nombre || '').trim() || 'esto'}»` } : null;
  if (dst === '@actualesRec') { const f = lineaFoco(); return l && f && l.id === f.id && l.tipo === 'recurrente' ? { clave: 'capacidad.actuales', nombre: NOMBRE_CLAVE['capacidad.actuales'] } : null; }
  return { clave: dst, nombre: NOMBRE_CLAVE[dst] || dst };
}
function autollenarDesdeAyuda(el) {
  try {
    const inst = el.dataset.ayudaInst, tipo = el.dataset.ayudaTipo, k = el.dataset.k;
    const v = parseEntrada(el.value);
    if (v === '' || (!esRango(v) && !(v > 0))) return;
    const dst = destinoAuto(inst, tipo, k); if (!dst || claveRaiz(inst) === dst.clave) return;
    const P = estado.prospecto, origen = `${inst}>${k}`, actual = getValor(dst.clave);
    const libre = vacio(actual) || P.autollenado[dst.clave] === origen;
    if (!libre) return;
    const ya = !vacio(actual) && !rangoDe(dst.clave) && !esRango(v) && Number(actual) === v;
    if (ya) return;
    aplicarValor(dst.clave, v, 'calculado');
    P.autollenado[dst.clave] = origen;
    aviso(`También lo anoté en: ${dst.nombre}. No te lo vuelvo a preguntar.`);
    programarCalculo();
  } catch (e) { }
}
// Datos que salen solos de otros ya anotados (se marcan «calculado» y se pueden cambiar)
function autoDerivados() {
  const P = estado.prospecto, l = lineaFoco();
  if (!l) return;
  const t = n(l.ticket), f = n(l.facturacion) || (P.lineas.length === 1 ? n(P.negocio.facturacion) : 0);
  const clave = 'capacidad.actuales';
  if (t > 0 && f > 0) {
    const sug = Math.round(f / t);
    const marca = P.autollenado[clave];
    const enUso = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.clave === clave;
    if (!enUso && sug > 0 && ((vacio(getValor(clave)) && marca !== 'manual') || marca === 'derivado') && Number(getValor(clave)) !== sug) {
      aplicarValor(clave, sug, 'calculado'); P.autollenado[clave] = 'derivado';
    }
  }
}

// ---------- Eventos ----------
function onEntrada(e) {
  const el = e.target;
  if (!el.matches('input, select')) return;
  if (el.dataset.ayudaInst) {
    if (e.type === 'change') { autollenarDesdeAyuda(el); return; } // ya se procesó con 'input'; redibujar aquí haría perder el clic en «Usar»
    const inst = el.dataset.ayudaInst, tipo = el.dataset.ayudaTipo;
    respuestaDe(inst, AYUDAS[tipo]).v[el.dataset.k] = parseEntrada(el.value);
    const res = calcularAyuda(inst, tipo);
    const out = document.querySelector(`[data-resultado="${CSS.escape(inst)}"]`); if (out) out.innerHTML = htmlResultadoAyuda(inst, tipo, res);
    const bx = document.querySelector(`[data-botones="${CSS.escape(inst)}"]`);
    const firma = !res ? 'x' : res.min === undefined ? 'n' : 'r';
    if (bx && bx.dataset.firma !== firma) { const pr = bx.querySelector('[data-prudente]'); bx.innerHTML = htmlBotonesAyuda(inst, tipo, res) + (pr ? pr.outerHTML : ''); bx.dataset.firma = firma; }
    programarBorrador(); return;
  }
  if (el.dataset.regla) {
    const c = el.dataset.regla, v = el.dataset.tipo === 'chk' ? el.checked : el.dataset.tipo === 'txt' ? el.value : parseNumero(el.value);
    setPath(estado.reglas, c, v);
    if (c === 'bono' && e.type === 'change') renderForm();
    programarGuardarReglas(); programarCalculo(); return;
  }
  const clave = el.dataset.clave; if (!clave) return;
  const tipo = el.dataset.tipo;
  if (!tipo && el.dataset.rango) {
    const v = parseEntrada(el.value), P = estado.prospecto;
    if (esRango(v)) { P.rangos[clave] = v; setValor(clave, redondear((v.min + v.max) / 2, 2)); }
    else { delete P.rangos[clave]; setValor(clave, v); }
    if (vacio(getValor(clave))) delete P.fuentes[clave]; else if (P.fuentes[clave] !== 'dato') P.fuentes[clave] = 'dato';
    P.autollenado[clave] = 'manual';
    actualizarBadge(clave);
  } else {
    const v = tipo === 'chk' ? el.checked : (tipo === 'sel' || tipo === 'txt') ? el.value : parseNumero(el.value);
    setValor(clave, v);
    if (!tipo && !el.dataset.lista) { if (vacio(v)) delete estado.prospecto.fuentes[clave]; else estado.prospecto.fuentes[clave] = 'dato'; estado.prospecto.autollenado[clave] = 'manual'; actualizarBadge(clave); }
  }
  if (clave === 'negocio.nombre' && estado.prospecto._ejemplo) { delete estado.prospecto._ejemplo; $('#banner').innerHTML = ''; }
  if (el.dataset.estructura && e.type === 'change') rehacerEstructura(clave, el.id);
  else if (clave === 'capacidad.contrataria' && e.type === 'change') {
    const C = estado.prospecto.capacidad, visible = !!document.querySelector('[data-clave="capacidad.porPersona"]'), debe = n(C.contrataria) > 0 || !vacio(C.porPersona);
    if (visible !== debe) rehacerEstructura(clave, el.id);
  }
  programarCalculo();
}
function rehacerEstructura(clave, focoId) {
  if (clave.startsWith('linea:')) {
    const id = clave.split(':')[1], l = estado.prospecto.lineas.find(x => x.id === id), card = document.querySelector(`.linea-tarjeta[data-id="${CSS.escape(id)}"]`);
    if (l && card) card.outerHTML = htmlLinea(l, estado.prospecto.lineas.indexOf(l), estado.prospecto.lineas.length);
  } else renderForm();
  if (focoId) { const nv = document.getElementById(focoId); if (nv) nv.focus(); }
}
function onSalida(e) {
  const el = e.target; if (!el.dataset || el.dataset.tipo) return;
  if (el.dataset.ayudaInst) { const x = parseEntrada(el.value); if (x !== '') el.value = fmtEntrada(x); return; }
  if (el.dataset.clave && el.dataset.rango) { el.value = valorMostrado(el.dataset.clave, el.dataset.fmt); return; }
  if (el.dataset.fmt === 'dinero') { const v = parseNumero(el.value); if (v !== '') el.value = fmtN(v); }
}
function onClic(e) {
  const t = e.target.closest('button'); if (!t) return;
  const P = estado.prospecto;
  if (t.dataset.chip) {
    const clave = t.dataset.chip, val = t.dataset.valor;
    setValor(clave, val);
    $$(`[data-chip="${CSS.escape(clave)}"]`).forEach(b => b.setAttribute('aria-checked', String(b.dataset.valor === val)));
    if (t.dataset.estructura) { rehacerEstructura(clave); const nb = document.querySelector(`[data-chip="${CSS.escape(clave)}"][data-valor="${CSS.escape(val)}"]`); if (nb) nb.focus(); }
    programarCalculo(); return;
  }
  if (t.dataset.irPaso) { irPaso(+t.dataset.irPaso); return; }
  if (t.dataset.fecha) {
    // Una fecha fuerte: anota el día del canje y su porqué (sin pisar un porqué que escribió el usuario)
    const L = P.lanzamiento; L.fecha = t.dataset.fecha;
    if (vacio(L.porque) || L._porqueAuto === L.porque) { L.porque = t.dataset.porque; L._porqueAuto = t.dataset.porque; }
    renderForm(); programarCalculo(); aviso(`Canje el ${fmtFecha(fechaDe(L.fecha))}.`); return;
  }
  if (t.dataset.ayudaToggle) {
    const inst = t.dataset.ayudaToggle;
    if (estado.abiertas.has(inst)) estado.abiertas.delete(inst); else estado.abiertas.add(inst);
    rehacerAyuda(inst);
    const nb = document.querySelector(`[data-ayuda-toggle="${CSS.escape(inst)}"]`); if (nb) nb.focus();
    return;
  }
  if (t.dataset.metodo) {
    const inst = t.dataset.inst; respuestaDe(inst, AYUDAS[t.dataset.ayudaTipo]).metodo = t.dataset.metodo;
    rehacerAyuda(inst);
    const b = document.querySelector(`[data-inst="${CSS.escape(inst)}"][data-metodo="${CSS.escape(t.dataset.metodo)}"]`); if (b) b.focus();
    programarBorrador(); return;
  }
  if (t.dataset.usar) {
    const inst = t.dataset.usar, tipo = t.dataset.ayudaTipo, res = calcularAyuda(inst, tipo); if (!res) return;
    const d = AYUDAS[tipo].dec ?? 1, rango = t.dataset.modo === 'rango' && res.min !== undefined;
    const v = rango ? { min: redondear(res.min, d), max: redondear(res.max, d) } : redondear(res.val, d);
    if (inst.includes('>')) {
      const i = inst.lastIndexOf('>'), padre = inst.slice(0, i), k = inst.slice(i + 1);
      const pp = document.querySelector(`[data-panel="${CSS.escape(padre)}"]`);
      if (pp) respuestaDe(padre, AYUDAS[pp.dataset.tipo]).v[k] = v;
      estado.abiertas.delete(inst); rehacerAyuda(padre);
    } else {
      aplicarValor(inst, esRango(v) && v.min === v.max ? v.min : v, 'calculado'); estado.abiertas.delete(inst); rehacerAyuda(inst);
      aviso(rango ? 'Listo, rango anotado.' : 'Listo, número anotado.'); programarCalculo();
    }
    programarBorrador(); return;
  }
  if (t.dataset.tipico) {
    const inst = t.dataset.tipico, A = AYUDAS[t.dataset.ayudaTipo], tp = A && A.tipicos && A.tipicos[+t.dataset.i]; if (!tp) return;
    aplicarValor(inst, { min: tp.min, max: tp.max }, 'estimado'); estado.abiertas.delete(inst); rehacerAyuda(inst);
    aviso('Anoté un rango típico. Confírmalo después.'); programarCalculo(); return;
  }
  if (t.dataset.prudente) {
    const inst = t.dataset.prudente; aplicarValor(inst, n(t.dataset.valor), 'estimado'); estado.abiertas.delete(inst); rehacerAyuda(inst);
    aviso('Anoté un número por las dudas. Confírmalo después.'); programarCalculo(); return;
  }
  if (t.dataset.quitar) {
    P.lineas = P.lineas.filter(l => l.id !== t.dataset.quitar);
    if (P.foco === t.dataset.quitar) P.foco = 'auto';
    if (P.oferta.lineaId === t.dataset.quitar) P.oferta.lineaId = '';
    renderForm(); programarCalculo(); return;
  }
  if (t.id === 'btn-agregar-linea') {
    P.lineas.push(lineaBase({ tipoVenta: P.lineas[0]?.tipoVenta || 'b2cAlto' }));
    renderForm(); programarCalculo();
    const ul = P.lineas[P.lineas.length - 1];
    const el = document.querySelector(`[data-clave="${CSS.escape('linea:' + ul.id + ':nombre')}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
    return;
  }
  if (t.id === 'btn-agregar-bono' || t.dataset.ideaBono) {
    P.oferta.bonos.push(bonoBase({ nombre: t.dataset.ideaBono || '' }));
    renderForm(); programarCalculo();
    const i = P.oferta.bonos.length - 1, el = document.querySelector(`[data-clave="${CSS.escape(`oferta.bonos.${i}.${t.dataset.ideaBono ? 'costo' : 'nombre'}`)}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
    return;
  }
  if (t.dataset.quitarBono !== undefined) { P.oferta.bonos.splice(+t.dataset.quitarBono, 1); renderForm(); programarCalculo(); return; }
  if (t.id === 'btn-agregar-seg') {
    P.oferta.segmentos.push(segmentoBase());
    renderForm(); programarCalculo();
    const i = P.oferta.segmentos.length - 1, el = document.querySelector(`[data-clave="${CSS.escape(`oferta.segmentos.${i}.nombre`)}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
    return;
  }
  if (t.dataset.quitarSeg !== undefined) { P.oferta.segmentos.splice(+t.dataset.quitarSeg, 1); renderForm(); programarCalculo(); return; }
  if (t.id === 'btn-sup-reset') { const tv = t.dataset.tipoVenta; P.supuestos[tv] = supuestosBase()[tv]; for (const k of Object.keys(P.rangos)) if (k.startsWith(`supuestos.${tv}.`)) delete P.rangos[k]; renderForm(); programarCalculo(); return; }
  if (t.id === 'btn-reglas-reset') { estado.reglas = normalizarReglas(null); renderForm(); programarGuardarReglas(); programarCalculo(); }
}
let tCalc = null, tBorr = null;
function programarCalculo() { clearTimeout(tCalc); tCalc = setTimeout(recalcular, 120); programarBorrador(); }
function programarBorrador() { clearTimeout(tBorr); tBorr = setTimeout(() => guardarLocal('co4.borrador', estado.prospecto), 500); }
