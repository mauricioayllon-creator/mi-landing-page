/* Calculadora de Pauta: arma la pantalla (preguntas y resultado) y la actualiza con cada cambio. */
(function (raiz) {
  'use strict';
  const P = (raiz.CalcPauta = raiz.CalcPauta || {});
  const doc = raiz.document;
  const $ = (selector, base) => (base || doc).querySelector(selector);
  const $$ = (selector, base) => Array.from((base || doc).querySelectorAll(selector));

  /* ---------- Columna de preguntas ---------- */
  function htmlCampo(id) {
    const campo = P.campos[id];
    const esTexto = campo.tipo === 'texto';
    const ejemplo = esTexto ? campo.ejemplo : P.formato.paraCasilla(P.motor.EJEMPLO[id]);
    const ayuda = campo.ayuda ? `<button type="button" class="ayuda-btn" data-ayuda="${id}" aria-label="Ayuda: ${campo.pregunta}">?</button>` : '';
    return `<div class="campo">
      <div class="campo-cab"><label for="c-${id}">${campo.pregunta}</label>${ayuda}</div>
      <div class="campo-in">${campo.antes ? `<span>${campo.antes}</span>` : ''}
        <input id="c-${id}" data-campo="${id}" type="text" ${esTexto ? 'maxlength="60"' : 'inputmode="decimal"'} autocomplete="off" placeholder="${ejemplo ? 'Ej.: ' + ejemplo : ''}">
        ${campo.despues ? `<span>${campo.despues}</span>` : ''}</div>
      <p class="campo-pista">${campo.pista || ''}</p>
    </div>`;
  }

  function htmlGrupo(grupo) {
    const cuerpo = `<div class="grupo-cuerpo">${grupo.nota ? `<p class="grupo-nota">${grupo.nota}</p>` : ''}${grupo.campos.map(htmlCampo).join('')}</div>`;
    if (!grupo.plegable) return `<section class="tarjeta"><h2>${grupo.titulo}</h2>${cuerpo}</section>`;
    return `<details class="tarjeta grupo" data-grupo="${grupo.id}"><summary><h2>${grupo.titulo}</h2></summary>${cuerpo}</details>`;
  }

  function armarDatos(contenedor) {
    contenedor.innerHTML = P.grupos.map(htmlGrupo).join('');
    // En pantalla grande, lo que casi nadie cuenta queda a la vista; en el celular, plegado para no abrumar.
    const ciegos = $('[data-grupo="ciegos"]', contenedor);
    if (ciegos && raiz.matchMedia('(min-width: 900px)').matches) ciegos.open = true;
  }

  /* ---------- Columna de resultado ---------- */
  function htmlTile(id) {
    return `<button type="button" class="tile" data-ficha="${id}">
      <span class="t-nombre">${P.fichas[id].titulo}</span>
      <span class="t-valor num" data-valor></span>
      <span class="t-sub" data-sub></span>
      <span class="t-barra" data-barra hidden><i></i></span>
    </button>`;
  }

  const htmlSeccion = (s) => `<section class="tarjeta" id="sec-${s.id}">
      <h2>${s.titulo}</h2><p class="tarjeta-pista">${s.pista}</p>
      <div class="tiles">${s.fichas.map(htmlTile).join('')}</div>
    </section>`;

  const htmlVeredicto = () => `<button type="button" class="veredicto" id="veredicto" data-abrir="veredicto" data-nivel="gris">
      <span class="v-etiqueta">Veredicto</span>
      <span class="v-titulo" data-v="titulo"></span>
      <span class="v-texto" data-v="texto"></span>
      <span class="v-mas" data-v="mas"></span>
    </button>`;

  const htmlColumnaBrecha = (clase, titulo, clave) => `<div class="brecha-col ${clase}"><h3>${titulo}</h3><dl>
      <div><dt>Le escriben</dt><dd data-b="${clave}-conv"></dd></div>
      <div><dt>Compran</dt><dd data-b="${clave}-ventas"></dd></div>
      <div><dt>Gana</dt><dd data-b="${clave}-gana"></dd></div>
    </dl></div>`;

  const htmlBrecha = () => `<section class="tarjeta" id="sec-brecha">
      <div class="tarjeta-cab"><h2>La brecha: como siempre o bien hecho</h2><button type="button" class="btn-borde" data-ficha="brecha">¿Por qué?</button></div>
      <p class="tarjeta-pista">La misma plata en anuncios. Mueve las dos barras y mira cómo cambia.</p>
      <label class="rango"><span>Con mejores anuncios, cada conversación cuesta <b data-b="costo"></b></span>
        <input type="range" min="0" max="60" step="5" data-rango="mejoraCosto" aria-label="Bajar el costo por conversación"></label>
      <label class="rango"><span>Con mejor atención, cierra <b data-b="cierre"></b></span>
        <input type="range" min="0" max="40" step="0.5" data-rango="cierreNuevo" aria-label="Subir el cierre"></label>
      <div class="brecha-tabla">${htmlColumnaBrecha('', 'Hoy', 'antes')}${htmlColumnaBrecha('mejor', 'Mejorado', 'despues')}</div>
      <p class="brecha-frase" data-b="frase"></p>
      <div class="brecha-pie"><button type="button" class="btn-g" data-accion="usarBrecha">Usar estos números</button></div>
    </section>`;

  const htmlLista = (id, titulo, pista) => `<section class="tarjeta" id="sec-${id}">
      <h2>${titulo}</h2><p class="tarjeta-pista">${pista}</p><ol class="lista-botones" data-lista="${id}"></ol>
    </section>`;

  function armarPanel(contenedor) {
    const porId = {};
    P.secciones.forEach((s) => { porId[s.id] = htmlSeccion(s); });
    contenedor.innerHTML = [
      htmlVeredicto(),
      htmlLista('arreglos', 'Qué arreglar primero', 'En orden. Toca cada punto para ver cómo.'),
      porId.mes, porId.limites, htmlBrecha(), porId.sistema, porId.ciegos, porId.meta,
      htmlLista('plan', 'Plan de 30 días', 'Con los números de este negocio.'),
      '<p class="nota-final">Los números que trae de ejemplo no son promedios del mercado. Cada negocio tiene los suyos, y los reales salen en la primera semana de anuncios.</p>',
    ].join('');
  }

  /* ---------- Pintar ---------- */
  function pintarVeredicto(c) {
    const v = P.veredictos[c.r.veredicto];
    const tarjeta = $('#veredicto');
    tarjeta.dataset.nivel = v.nivel;
    $('[data-v="titulo"]', tarjeta).textContent = v.titulo;
    $('[data-v="texto"]', tarjeta).textContent = v.texto(c);
    $('[data-v="mas"]', tarjeta).textContent = c.r.veredicto === 'faltan' ? 'Toca aquí y te guío paso a paso' : 'Toca para ver por qué';
    tarjeta.dataset.abrir = c.r.veredicto === 'faltan' ? 'guia' : 'veredicto';
  }

  function pintarTile(tile, c) {
    const ficha = P.fichas[tile.dataset.ficha];
    const faltan = c.r.veredicto === 'faltan';
    const bloqueo = faltan ? null : P.bloqueo(ficha, c);
    const sinValor = faltan || bloqueo;
    $('[data-valor]', tile).textContent = sinValor ? '—' : ficha.valor(c);
    $('[data-sub]', tile).textContent = faltan ? 'faltan datos' : bloqueo ? bloqueo.corto : ficha.sub(c);
    tile.dataset.estado = faltan ? '' : bloqueo ? bloqueo.estado : ficha.estado(c);
    const barra = $('[data-barra]', tile);
    barra.hidden = !(ficha.barra && !sinValor);
    if (!barra.hidden) barra.firstElementChild.style.width = Math.round(ficha.barra(c) * 100) + '%';
  }

  function htmlFila(numero, clase, cuando, texto, ficha) {
    return `<li><button type="button" class="fila-boton" data-ficha="${ficha}">
      <span class="fila-num ${clase}">${numero}</span>
      <span>${cuando ? `<span class="fila-cuando">${cuando}</span>` : ''}${texto}</span>
    </button></li>`;
  }

  function pintarListas(c) {
    const faltan = c.r.veredicto === 'faltan';
    $('#sec-arreglos').hidden = faltan;
    $('#sec-plan').hidden = faltan || c.r.veredicto === 'ventaPierde';
    if (faltan) return;
    $('[data-lista="arreglos"]').innerHTML = c.r.arreglos
      .map((id, i) => htmlFila(i + 1, '', '', P.arreglos[id].texto(c), P.arreglos[id].ficha)).join('');
    if (!$('#sec-plan').hidden) {
      $('[data-lista="plan"]').innerHTML = P.plan(c)
        .map((paso, i) => htmlFila(i + 1, '', paso.cuando, paso.texto, paso.ficha)).join('');
    }
  }

  function fraseBrecha(s, f) {
    const antes = s.antes.gana;
    const despues = s.despues.gana;
    if (Math.abs(despues - antes) < 0.5) return 'Mueve las barras para ver la diferencia.';
    if (despues <= 0) return `Todavía pierde ${f.bs(-despues)}. Sigue moviendo las barras para ver cuánto hace falta.`;
    if (antes <= 0) return `Pasa de perder ${f.bs(-antes)} a ganar ${f.bs(despues)} con la misma plata en anuncios.`;
    return `${f.corto(s.veces, 1)} veces la ganancia con la misma plata en anuncios: de ${f.bs(antes)} a ${f.bs(despues)}.`;
  }

  function pintarBrecha(c) {
    const seccion = $('#sec-brecha');
    seccion.hidden = c.r.veredicto === 'faltan';
    if (seccion.hidden) return;
    const s = P.motor.simular(c.d);
    const poner = (clave, texto) => { $(`[data-b="${clave}"]`, seccion).textContent = texto; };
    const rangoCierre = $('[data-rango="cierreNuevo"]', seccion);
    rangoCierre.min = Math.min(c.d.cierre, 40);
    rangoCierre.max = Math.min(100, Math.max(40, Math.ceil(c.d.cierre * 3)));
    rangoCierre.value = s.mejorado.cierre;
    $('[data-rango="mejoraCosto"]', seccion).value = c.d.mejoraCosto;
    poner('costo', `${c.f.bs(s.mejorado.costoConv)} (hoy ${c.f.bs(c.d.costoConv)})`);
    poner('cierre', `${c.f.de100(s.despues.cierre)} (hoy ${c.f.corto(c.d.cierre, 1)})`);
    [['antes', s.antes], ['despues', s.despues]].forEach(([clave, r]) => {
      poner(`${clave}-conv`, c.f.entero(r.conversaciones));
      poner(`${clave}-ventas`, c.f.corto(r.ventas, 1));
      poner(`${clave}-gana`, c.f.bs(r.gana));
    });
    poner('frase', fraseBrecha(s, c.f));
  }

  // Barra fija del celular: siempre muestra el veredicto y lleva al resultado o de vuelta a los números.
  function pintarBarraMovil(c, enResultado) {
    const barra = $('#barraMovil');
    const v = P.veredictos[c.r.veredicto];
    const faltan = c.r.veredicto === 'faltan';
    barra.dataset.nivel = v.nivel;
    barra.dataset.abrir = faltan ? 'guia' : enResultado ? 'datos' : 'resultado';
    const detalle = faltan ? '5 preguntas y listo' : `${c.r.gana >= 0 ? 'Gana' : 'Pierde'} ${c.f.bs(Math.abs(c.r.gana))} al mes`;
    barra.innerHTML = `<span><b>${v.titulo}</b><span>${detalle}</span></span><i>${faltan ? 'Empezar' : enResultado ? 'Cambiar números' : 'Ver resultado'}</i>`;
  }

  // Pone en cada casilla el valor guardado, salvo en la que se está escribiendo.
  function sincronizarCasillas(d) {
    $$('#datos [data-campo]').forEach((casilla) => {
      if (casilla === doc.activeElement) return;
      const id = casilla.dataset.campo;
      casilla.value = P.campos[id].tipo === 'texto' ? d[id] || '' : P.formato.paraCasilla(d[id]);
    });
  }

  function pintar(c, enResultado) {
    pintarVeredicto(c);
    $$('#panel .tile').forEach((tile) => pintarTile(tile, c));
    pintarListas(c);
    pintarBrecha(c);
    pintarBarraMovil(c, enResultado);
    sincronizarCasillas(c.d);
    $('#subtitulo').textContent = c.d.negocio ? c.d.negocio : '¿Le conviene pautar, cuánto y qué arreglar primero?';
  }

  P.pintar = { armarDatos, armarPanel, pintar, pintarBarraMovil, htmlFila };
})(window);
