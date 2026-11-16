/* Calculadora de Pauta: la hoja que se abre al tocar algo. Explica un número, ayuda con una pregunta o guía paso a paso. */
(function (raiz) {
  'use strict';
  const P = (raiz.CalcPauta = raiz.CalcPauta || {});
  const doc = raiz.document;
  let dialogo;
  let cuerpo;
  let actual = null; // { tipo: 'ficha' | 'ayuda' | 'guia' | 'veredicto' | 'bienvenida', id, paso }

  const valorDe = (x, c) => (typeof x === 'function' ? x(c) : x);
  const lista = (items, tipo) => `<${tipo}>${items.map((item) => `<li>${item}</li>`).join('')}</${tipo}>`;
  const bloque = (titulo, html) => `<section class="hoja-bloque"><h3>${titulo}</h3>${html}</section>`;

  function cabecera(titulo, valor, antetitulo) {
    return `<header class="hoja-cab"><div>
        ${antetitulo ? `<p class="guia-paso">${antetitulo}</p>` : ''}
        <h2 id="hojaTitulo">${titulo}</h2>
        ${valor ? `<p class="hoja-valor num">${valor}</p>` : ''}
      </div><button type="button" class="hoja-x" data-cerrar aria-label="Cerrar">×</button></header>`;
  }

  /* ---------- Un número: qué es, cómo sale, para qué sirve, cómo mejorarlo y qué pasa si… ---------- */
  function filaPrueba(ficha, campo, valor, c) {
    const d2 = Object.assign({}, c.d, { [ficha.prueba]: valor });
    const c2 = { d: d2, r: P.motor.calcular(d2), f: c.f };
    const esHoy = Math.abs(valor - c.d[ficha.prueba]) < 1e-9;
    const muestra = P.fichas[ficha.pruebaMuestra || ficha.id];
    const boton = esHoy ? '' : `<button type="button" class="btn-g btn-chico" data-usar-campo="${ficha.prueba}" data-usar-valor="${valor}">Usar</button>`;
    return `<tr class="${esHoy ? 'hoy' : ''}">
      <th scope="row">${campo.escenario(valor, c.f)}${esHoy ? '<em>hoy</em>' : ''}</th>
      <td>${P.bloqueo(muestra, c2) ? '—' : muestra.valor(c2)}</td><td>${P.fichas.gana.valor(c2)}</td><td>${boton}</td></tr>`;
  }

  function tablaPrueba(ficha, c) {
    const campo = P.campos[ficha.prueba];
    const muestra = P.fichas[ficha.pruebaMuestra || ficha.id];
    const filas = campo.variantes(c.d[ficha.prueba]).map((valor) => filaPrueba(ficha, campo, valor, c)).join('');
    return `<table class="prueba"><thead><tr><th>Qué pasa si…</th><th>${muestra.titulo}</th><th>Gana</th><th></th></tr></thead><tbody>${filas}</tbody></table>
      <p class="hoja-nota">${ficha.notaPrueba || 'Toca «Usar» y la calculadora cambia sola. Lo puedes deshacer.'}</p>`;
  }

  function htmlFicha(id, c) {
    const ficha = P.fichas[id];
    const faltan = c.r.veredicto === 'faltan';
    const bloqueo = faltan ? null : P.bloqueo(ficha, c);
    const sinCuenta = faltan || bloqueo;
    let html = cabecera(ficha.tituloLargo || ficha.titulo, sinCuenta ? '' : ficha.valor(c));
    html += `<p class="hoja-tec">En publicidad se llama: <b>${ficha.tecnico}</b></p>`;
    html += bloque('Qué es', `<p>${valorDe(ficha.queEs, c)}</p>`);
    if (faltan) html += bloque('Cómo sale', '<p class="hoja-aviso">Responde primero las 5 preguntas y aquí vas a ver la cuenta con tus números.</p>');
    else if (bloqueo) html += bloque('Cómo sale', `<p class="hoja-aviso">${bloqueo.largo}</p>`);
    else html += bloque('Cómo sale con tus números', lista(ficha.pasos(c), 'ol'));
    html += bloque('Para qué te sirve', `<p>${valorDe(ficha.sirve, c)}</p>`);
    if (ficha.mejorar) html += bloque('Cómo mejorarlo', lista(valorDe(ficha.mejorar, c), 'ul'));
    if (ficha.prueba && !sinCuenta) html += bloque('Prueba qué pasa si…', tablaPrueba(ficha, c));
    if (ficha.fuente) html += `<p class="hoja-fuente">${ficha.fuente}</p>`;
    return html;
  }

  /* ---------- Una pregunta: qué es, de dónde sale y una mini cuenta para sacarla ---------- */
  function htmlMini(id, mini) {
    const casilla = (rotulo, clave) => `<label>${rotulo}<input type="text" inputmode="decimal" autocomplete="off" data-mini="${clave}"></label>`;
    return `<div class="mini" data-mini-campo="${id}">
      ${casilla(mini.a, 'a')}${mini.b ? casilla(mini.b, 'b') : ''}
      <p class="mini-res" data-mini-res>Escribe los números y te doy el resultado.</p>
      <button type="button" class="btn-azul" data-mini-usar disabled>Usar este número</button>
    </div>`;
  }

  function htmlAyuda(id) {
    const campo = P.campos[id];
    let html = cabecera(campo.pregunta, '');
    html += bloque('Qué es', `<p>${campo.ayuda.queEs}</p>`);
    html += bloque('De dónde saco este número', lista(campo.ayuda.deDonde, 'ul'));
    if (campo.ayuda.mini) html += bloque('Te ayudo a sacarlo', htmlMini(id, campo.ayuda.mini));
    return html;
  }

  /* ---------- Guía paso a paso: una pregunta por vez ---------- */
  function htmlGuia(paso, c) {
    const pasos = P.pasosGuia;
    const id = pasos[paso];
    const campo = P.campos[id];
    const ultimo = paso === pasos.length - 1;
    const suposicion = campo.suposicion
      ? `<button type="button" class="btn-g" data-usar-campo="${id}" data-usar-valor="${campo.suposicion.valor}" data-silencio>${campo.suposicion.boton}</button>` : '';
    return `${cabecera(campo.pregunta, '', `Paso ${paso + 1} de ${pasos.length}`)}
      <div class="guia-barra"><i style="width:${Math.round(((paso + 1) / pasos.length) * 100)}%"></i></div>
      <div class="guia-cuerpo">
        <div class="campo-in grande">${campo.antes ? `<span>${campo.antes}</span>` : ''}
          <input id="guiaCasilla" data-campo="${id}" type="text" inputmode="decimal" autocomplete="off" value="${c.f.paraCasilla(c.d[id])}" placeholder="Ej.: ${c.f.paraCasilla(P.motor.EJEMPLO[id])}" aria-labelledby="hojaTitulo">
          ${campo.despues ? `<span>${campo.despues}</span>` : ''}</div>
        <p class="campo-pista">${campo.pista}</p>
        ${suposicion}
        <details class="guia-ayuda"><summary>¿No sabes este número? Te ayudo a sacarlo</summary>
          <p>${campo.ayuda.queEs}</p>${lista(campo.ayuda.deDonde, 'ul')}${campo.ayuda.mini ? htmlMini(id, campo.ayuda.mini) : ''}</details>
      </div>
      <footer class="guia-pie">
        <button type="button" class="btn-g btn-grande" data-guia="${paso - 1}" ${paso === 0 ? 'disabled' : ''}>Atrás</button>
        <button type="button" class="btn-azul btn-grande" data-guia="${paso + 1}">${ultimo ? 'Ver mi resultado' : 'Siguiente'}</button>
      </footer>`;
  }

  function htmlBienvenida() {
    return `${cabecera('Calculadora de Pauta', '')}
      <p class="hoja-intro">Te dice si a un negocio le conviene poner plata en anuncios, cuánto poner y qué arreglar primero. No necesitas saber de publicidad.</p>
      <ol class="hoja-pasos">
        <li><b>Respondes 5 preguntas</b> sobre el negocio. Si no sabes un número, te ayudo a sacarlo.</li>
        <li><b>Te doy un veredicto</b> claro: le conviene, está al límite o pierde plata.</li>
        <li><b>Tocas cualquier número</b> y te explico qué es, de dónde sale y cómo mejorarlo.</li>
      </ol>
      <div class="hoja-botones">
        <button type="button" class="btn-azul btn-grande" data-accion="nuevo">Empezar paso a paso</button>
        <button type="button" class="btn-g btn-grande" data-accion="ejemplo">Ver primero un ejemplo</button>
      </div>`;
  }

  function htmlVeredicto(c) {
    const v = P.veredictos[c.r.veredicto];
    const filas = c.r.chequeos.map((chequeo) => {
      const info = P.chequeos[chequeo.id];
      return P.pintar.htmlFila(chequeo.ok ? '✓' : '✗', chequeo.ok ? 'ok' : 'no', '', info.texto, info.ficha);
    }).join('');
    return `${cabecera(v.titulo, '', 'Veredicto')}
      <p class="hoja-intro">${v.texto(c)}</p>
      ${bloque('Lo que revisé', `<ul class="lista-botones">${filas}</ul>`)}
      ${bloque('Cómo leer el veredicto', lista([
        '<b>Le conviene:</b> gana plata y aguanta una mala semana.',
        '<b>Al límite:</b> gana, pero si el costo sube un poco ya pierde.',
        '<b>Pierde:</b> hoy cada boliviano que pone en anuncios vuelve en menos de un boliviano.',
      ], 'ul'))}`;
  }

  /* ---------- Abrir, pintar y cerrar ---------- */
  function html(c) {
    if (actual.tipo === 'ficha') return htmlFicha(actual.id, c);
    if (actual.tipo === 'ayuda') return htmlAyuda(actual.id);
    if (actual.tipo === 'guia') return htmlGuia(actual.paso, c);
    if (actual.tipo === 'veredicto') return htmlVeredicto(c);
    return htmlBienvenida();
  }

  function repintar(conservarPosicion) {
    if (!actual) return;
    const posicion = cuerpo.scrollTop;
    cuerpo.innerHTML = html(P.app.contexto());
    cuerpo.scrollTop = conservarPosicion ? posicion : 0;
  }

  function abrir(tipo, extra) {
    actual = Object.assign({ tipo }, extra);
    repintar(false);
    if (!dialogo.open) dialogo.showModal();
    const casilla = doc.getElementById('guiaCasilla');
    if (casilla) { casilla.focus(); casilla.select(); }
  }

  function cerrar() {
    actual = null;
    if (dialogo.open) dialogo.close();
  }

  function irGuia(paso) {
    const avanza = actual && actual.tipo === 'guia' && paso > actual.paso;
    if (avanza && !(P.app.contexto().d[P.pasosGuia[actual.paso]] > 0)) {
      P.app.aviso('Escribe un número, o toca «¿No sabes este número?».', false);
      return;
    }
    if (paso >= P.pasosGuia.length) {
      cerrar();
      P.app.terminarGuia();
    } else if (paso >= 0) {
      abrir('guia', { paso });
    }
  }

  /* ---------- Mini cuentas ---------- */
  function actualizarMini(caja) {
    const campo = P.campos[caja.dataset.miniCampo];
    const leer = (clave) => {
      const casilla = caja.querySelector(`[data-mini="${clave}"]`);
      return casilla ? P.formato.leerNumero(casilla.value) : 0;
    };
    const listo = Array.from(caja.querySelectorAll('[data-mini]')).every((casilla) => casilla.value.trim() !== '');
    const resultado = listo ? campo.ayuda.mini.cuenta(leer('a'), leer('b')) : NaN;
    const sirve = Number.isFinite(resultado) && resultado > 0;
    const boton = caja.querySelector('[data-mini-usar]');
    caja.querySelector('[data-mini-res]').textContent = !listo ? 'Escribe los números y te doy el resultado.'
      : Number.isFinite(resultado) ? campo.ayuda.mini.resultado(resultado, P.formato) : 'Revisa los números: así no se puede hacer la cuenta.';
    boton.disabled = !sirve;
    boton.dataset.valor = sirve ? String(Math.round(resultado * 100) / 100) : '';
  }

  /* ---------- Toques dentro de la hoja ---------- */
  function alTocar(evento) {
    if (evento.target === dialogo) return cerrar(); // toque fuera de la hoja
    const boton = evento.target.closest('button');
    if (!boton) return undefined;
    const datos = boton.dataset;
    if ('cerrar' in datos) return cerrar();
    if (datos.guia != null) return irGuia(Number(datos.guia));
    if (datos.ficha) return abrir('ficha', { id: datos.ficha });
    if (datos.accion === 'ejemplo') { cerrar(); return P.app.cargarEjemplo(); }
    if (datos.accion === 'nuevo') return P.app.nuevo();
    if (datos.usarCampo) return P.app.usar(datos.usarCampo, Number(datos.usarValor), 'silencio' in datos);
    if ('miniUsar' in datos) return P.app.usar(boton.closest('.mini').dataset.miniCampo, Number(datos.valor), actual.tipo === 'guia');
    return undefined;
  }

  function alEscribir(evento) {
    const casilla = evento.target;
    if (casilla.dataset.mini) actualizarMini(casilla.closest('.mini'));
    else if (casilla.dataset.campo) P.app.cambiar(casilla.dataset.campo, P.formato.leerNumero(casilla.value));
  }

  function alTeclear(evento) {
    if (evento.key === 'Enter' && evento.target.id === 'guiaCasilla') irGuia(actual.paso + 1);
  }

  function iniciar() {
    dialogo = doc.getElementById('hoja');
    cuerpo = doc.getElementById('hojaCuerpo');
    dialogo.addEventListener('click', alTocar);
    dialogo.addEventListener('input', alEscribir);
    dialogo.addEventListener('keydown', alTeclear);
    dialogo.addEventListener('close', () => { actual = null; });
  }

  P.hoja = {
    iniciar, cerrar, repintar,
    abrirFicha: (id) => abrir('ficha', { id }),
    abrirAyuda: (id) => abrir('ayuda', { id }),
    abrirGuia: (paso) => abrir('guia', { paso: paso || 0 }),
    abrirVeredicto: () => abrir('veredicto'),
    abrirBienvenida: () => abrir('bienvenida'),
    estaAbierta: () => Boolean(dialogo && dialogo.open),
  };
})(window);
