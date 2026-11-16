/* Calculadora de Pauta: guarda los datos, escucha los toques y une las cuentas con la pantalla. */
(function (raiz) {
  'use strict';
  const P = raiz.CalcPauta;
  const doc = raiz.document;
  const CLAVE = 'calculadora-pauta-v1';
  const estado = { datos: Object.assign({}, P.motor.EJEMPLO), anterior: null, relojAviso: null, enResultado: false };

  /* ---------- Guardar y leer (queda en este navegador) ---------- */
  function limpiar(guardado) {
    const limpio = {};
    Object.keys(P.motor.EJEMPLO).forEach((clave) => {
      if (!(clave in guardado)) return;
      limpio[clave] = clave === 'negocio' ? String(guardado[clave] || '').slice(0, 60) : P.formato.leerNumero(guardado[clave]);
    });
    return limpio;
  }

  function leerGuardado() {
    try {
      const guardado = JSON.parse(raiz.localStorage.getItem(CLAVE) || 'null');
      if (!guardado || typeof guardado !== 'object') return false;
      Object.assign(estado.datos, limpiar(guardado));
      return true;
    } catch (error) {
      return false;
    }
  }

  function guardar() {
    try { raiz.localStorage.setItem(CLAVE, JSON.stringify(estado.datos)); } catch (error) { /* sin guardado: sigue funcionando */ }
  }

  const contexto = () => ({ d: estado.datos, r: P.motor.calcular(estado.datos), f: P.formato });

  function refrescar() {
    guardar();
    P.pintar.pintar(contexto(), estado.enResultado);
  }

  /* ---------- Cambios ---------- */
  function valorValido(campo, valor) {
    if (campo === 'negocio') return String(valor || '').slice(0, 60);
    const numero = Number.isFinite(valor) && valor > 0 ? valor : 0;
    const porcentajes = ['margen', 'cierre', 'comision', 'cierreNuevo'];
    return porcentajes.includes(campo) ? Math.min(100, numero) : numero;
  }

  // Cambio mientras se escribe: no redibuja la hoja para no sacar el cursor de la casilla.
  function cambiar(campo, valor) {
    estado.datos[campo] = valorValido(campo, valor);
    // Al cambiar el cierre, «La brecha» vuelve a proponer el doble como mejora.
    if (campo === 'cierre') estado.datos.cierreNuevo = Math.min(100, estado.datos.cierre * 2);
    refrescar();
  }

  function aviso(texto, conDeshacer) {
    const caja = doc.getElementById(P.hoja.estaAbierta() ? 'avisoHoja' : 'aviso');
    caja.innerHTML = '';
    caja.appendChild(doc.createTextNode(texto));
    if (conDeshacer) {
      const boton = doc.createElement('button');
      boton.type = 'button';
      boton.textContent = 'Deshacer';
      boton.dataset.accion = 'deshacer';
      caja.appendChild(boton);
    }
    doc.querySelectorAll('.aviso').forEach((otra) => otra.classList.toggle('visible', otra === caja));
    raiz.clearTimeout(estado.relojAviso);
    estado.relojAviso = raiz.setTimeout(() => caja.classList.remove('visible'), 6000);
  }

  // Cambio hecho con un botón («Usar»): se puede deshacer y redibuja la hoja abierta.
  function usar(campo, valor, enSilencio) {
    estado.anterior = Object.assign({}, estado.datos);
    cambiar(campo, valor);
    P.hoja.repintar(true);
    if (!enSilencio) aviso('Listo, ya cambié ese número.', true);
  }

  function reemplazar(datos, texto) {
    estado.anterior = Object.assign({}, estado.datos);
    estado.datos = Object.assign({}, P.motor.EJEMPLO, datos);
    refrescar();
    P.hoja.repintar(true);
    if (texto) aviso(texto, true);
  }

  function deshacer() {
    if (!estado.anterior) return;
    estado.datos = estado.anterior;
    estado.anterior = null;
    refrescar();
    P.hoja.repintar(true);
    aviso('Deshecho.', false);
  }

  const cargarEjemplo = () => reemplazar(P.motor.EJEMPLO, 'Cargué un ejemplo. Cambia los números por los del negocio.');

  function nuevo() {
    reemplazar(P.motor.VACIO, '');
    P.hoja.abrirGuia(0);
  }

  function usarBrecha() {
    const s = P.motor.simular(estado.datos);
    reemplazar(Object.assign({}, estado.datos, {
      costoConv: Math.round(s.mejorado.costoConv * 100) / 100, cierre: s.mejorado.cierre, mejoraCosto: 0, cierreNuevo: s.mejorado.cierre,
    }), 'Listo: ahora «hoy» son los números mejorados.');
  }

  function irAlResultado() {
    doc.getElementById('veredicto').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function irALosDatos() {
    raiz.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function terminarGuia() {
    irAlResultado();
    aviso('Listo. Toca cualquier número para entenderlo.', false);
  }

  /* ---------- Copiar resumen ---------- */
  function copiarConRespaldo(texto) {
    const area = doc.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    doc.body.appendChild(area);
    area.select();
    const copiado = doc.execCommand('copy');
    area.remove();
    return copiado;
  }

  function copiarResumen() {
    const texto = P.resumen(contexto());
    if (!texto) return aviso('Primero responde las 5 preguntas.', false);
    const listo = () => aviso('Resumen copiado. Pégalo en WhatsApp.', false);
    const respaldo = () => (copiarConRespaldo(texto) ? listo() : aviso('No pude copiar. Inténtalo otra vez.', false));
    if (raiz.navigator.clipboard && raiz.isSecureContext) return raiz.navigator.clipboard.writeText(texto).then(listo, respaldo);
    return respaldo();
  }

  /* ---------- Toques y escritura en la página ---------- */
  const ACCIONES = {
    guia: () => P.hoja.abrirGuia(0), ejemplo: cargarEjemplo, nuevo, copiar: copiarResumen,
    usarBrecha, deshacer, resultado: irAlResultado, datos: irALosDatos, veredicto: () => P.hoja.abrirVeredicto(),
  };

  function alTocar(evento) {
    const boton = evento.target.closest('button');
    if (!boton || boton.closest('dialog')) {
      if (boton && boton.dataset.accion === 'deshacer') deshacer();
      return;
    }
    const datos = boton.dataset;
    if (datos.ficha) P.hoja.abrirFicha(datos.ficha);
    else if (datos.ayuda) P.hoja.abrirAyuda(datos.ayuda);
    else if (ACCIONES[datos.accion || datos.abrir]) ACCIONES[datos.accion || datos.abrir]();
  }

  function alEscribir(evento) {
    const casilla = evento.target;
    if (casilla.closest('dialog')) return;
    if (casilla.dataset.rango) cambiar(casilla.dataset.rango, Number(casilla.value));
    else if (casilla.dataset.campo === 'negocio') cambiar('negocio', casilla.value);
    else if (casilla.dataset.campo) cambiar(casilla.dataset.campo, P.formato.leerNumero(casilla.value));
  }

  // Al salir de una casilla, deja el número bien escrito (1.500 en vez de 1500).
  function alSalir(evento) {
    const casilla = evento.target;
    if (!casilla.dataset || !casilla.dataset.campo || casilla.dataset.campo === 'negocio' || casilla.closest('dialog')) return;
    casilla.value = P.formato.paraCasilla(estado.datos[casilla.dataset.campo]);
  }

  // La barra de arriba cambia de alto en el celular: lo demás se acomoda a ese alto.
  function medirBarraSuperior() {
    doc.documentElement.style.setProperty('--top-h', doc.querySelector('.top').offsetHeight + 'px');
  }

  // En el celular, la barra de abajo lleva al resultado o de vuelta a los números, según dónde esté la persona.
  function alDesplazar() {
    const enResultado = doc.getElementById('panel').getBoundingClientRect().top < raiz.innerHeight * 0.55;
    if (enResultado === estado.enResultado) return;
    estado.enResultado = enResultado;
    P.pintar.pintarBarraMovil(contexto(), enResultado);
  }

  function iniciar() {
    Object.keys(P.fichas).forEach((id) => { P.fichas[id].id = id; });
    const yaTeniaDatos = leerGuardado();
    P.pintar.armarDatos(doc.getElementById('datos'));
    P.pintar.armarPanel(doc.getElementById('panel'));
    P.hoja.iniciar();
    doc.addEventListener('click', alTocar);
    doc.addEventListener('input', alEscribir);
    doc.addEventListener('focusout', alSalir);
    raiz.addEventListener('scroll', alDesplazar, { passive: true });
    raiz.addEventListener('resize', medirBarraSuperior);
    medirBarraSuperior();
    refrescar();
    alDesplazar();
    if (!yaTeniaDatos) P.hoja.abrirBienvenida();
  }

  P.app = { contexto, cambiar, usar, cargarEjemplo, nuevo, terminarGuia, aviso };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window);
