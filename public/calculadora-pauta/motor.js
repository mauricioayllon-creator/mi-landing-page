/* Calculadora de Pauta: las cuentas. Sin pantalla: recibe los datos y devuelve los resultados. */
(function (raiz) {
  'use strict';

  // Números de ejemplo. No son promedios del mercado: cada negocio pone los suyos.
  const EJEMPLO = Object.freeze({
    negocio: '', ticket: 350, margen: 50, recompras: 1, comision: 0,
    presupuesto: 1500, costoConv: 5, cierre: 5,
    honorarios: 0, capacidad: 20, recargo: 0,
    meta: 5000, tipoCambio: 12, mejoraCosto: 25, cierreNuevo: 10,
  });
  const VACIO = Object.freeze(Object.assign({}, EJEMPLO, {
    ticket: 0, margen: 0, presupuesto: 0, costoConv: 0, cierre: 0, meta: 0, cierreNuevo: 0,
  }));

  const REFERENCIA_SEMANAL = 50; // resultados por semana que Meta usa como referencia por conjunto de anuncios
  const DIAS_MES = 30;
  const Z_80 = 1.2816; // rango en el que cae 8 de cada 10 veces
  const COLCHON_SANO = 0.4; // el costo puede subir 40% antes de perder
  const VENTAS_CONFIABLES = 10;

  const noNeg = (n) => (Number.isFinite(n) && n > 0 ? n : 0);
  const div = (a, b) => (b > 0 ? a / b : Infinity);

  function embudo(d) {
    const presupuesto = noNeg(d.presupuesto);
    const pautaReal = presupuesto * (1 + noNeg(d.recargo) / 100);
    const honorarios = noNeg(d.honorarios);
    const costoTotal = pautaReal + honorarios;
    const cierre = Math.min(1, noNeg(d.cierre) / 100);
    const margenNeto = (noNeg(d.margen) - noNeg(d.comision)) / 100;
    const dejaVenta = noNeg(d.ticket) * margenNeto;
    const conversaciones = d.costoConv > 0 ? presupuesto / d.costoConv : 0;
    const ventas = conversaciones * cierre;
    const margenTotal = ventas * dejaVenta;
    return {
      presupuesto, pautaReal, honorarios, costoTotal, cierre, margenNeto, dejaVenta,
      conversaciones, ventas, ingresos: ventas * noNeg(d.ticket), margenTotal,
      ganaPauta: margenTotal - pautaReal, gana: margenTotal - costoTotal,
    };
  }

  function limites(d, e) {
    const maxConversacion = e.costoTotal > 0 ? (e.presupuesto * e.dejaVenta * e.cierre) / e.costoTotal : Infinity;
    return {
      maxConversacion,
      cierreMin: div(e.costoTotal, e.conversaciones * e.dejaVenta),
      ticketMin: div(e.costoTotal, e.ventas * e.margenNeto),
      costoCliente: div(e.costoTotal, e.ventas),
      vuelve: e.pautaReal > 0 ? e.ingresos / e.pautaReal : 0,
      vuelveMin: e.margenNeto > 0 && e.pautaReal > 0 ? e.costoTotal / e.pautaReal / e.margenNeto : Infinity,
      colchon: d.costoConv > 0 && Number.isFinite(maxConversacion) ? maxConversacion / d.costoConv - 1 : NaN,
    };
  }

  function aprendizaje(d, e) {
    const porSemana = (e.conversaciones * 7) / DIAS_MES;
    const diarioMin = (REFERENCIA_SEMANAL * noNeg(d.costoConv)) / 7;
    const diarioBs = e.presupuesto / DIAS_MES;
    return {
      porSemana, diarioMin, mensualMin: diarioMin * DIAS_MES, diarioBs,
      diarioUsd: d.tipoCambio > 0 ? diarioBs / d.tipoCambio : NaN,
      conjuntos: Math.floor(porSemana / REFERENCIA_SEMANAL + 1e-9),
      diasPara50: div(REFERENCIA_SEMANAL, e.conversaciones / DIAS_MES),
    };
  }

  // Con pocas ventas la suerte pesa mucho: rango en el que caen las ventas 8 de cada 10 meses.
  function lectura(e) {
    const desvio = Math.sqrt(e.conversaciones * e.cierre * (1 - e.cierre));
    const ventasBajo = Math.max(0, e.ventas - Z_80 * desvio);
    const ventasAlto = e.ventas + Z_80 * desvio;
    return {
      ventasBajo, ventasAlto,
      ganaBajo: ventasBajo * e.dejaVenta - e.costoTotal,
      ganaAlto: ventasAlto * e.dejaVenta - e.costoTotal,
      confianza: e.ventas >= 30 ? 'alta' : e.ventas >= VENTAS_CONFIABLES ? 'media' : 'baja',
    };
  }

  function atencion(d, e) {
    const convDia = e.conversaciones / DIAS_MES;
    const capacidad = noNeg(d.capacidad);
    return {
      convDia,
      usoCapacidad: capacidad > 0 ? convDia / capacidad : NaN,
      presupuestoTope: capacidad * noNeg(d.costoConv) * DIAS_MES,
    };
  }

  function recompra(d, e) {
    const compras = Math.max(1, noNeg(d.recompras));
    const valeCliente = e.dejaVenta * compras;
    return {
      compras, valeCliente,
      gana6m: e.ventas * valeCliente - e.costoTotal,
      maxConversacion6m: e.costoTotal > 0 ? (e.presupuesto * valeCliente * e.cierre) / e.costoTotal : Infinity,
    };
  }

  function metas(d, e) {
    const meta = noNeg(d.meta);
    const dejaPorBs = d.costoConv > 0 ? (e.cierre * e.dejaVenta) / d.costoConv : 0;
    const netoPorBs = dejaPorBs - (1 + noNeg(d.recargo) / 100);
    return {
      dejaPorBs, netoPorBs,
      metaPosible: netoPorBs > 0,
      metaPresupuesto: netoPorBs > 0 ? (meta + e.honorarios) / netoPorBs : Infinity,
      metaCierre: div(meta + e.costoTotal, e.conversaciones * e.dejaVenta),
    };
  }

  function veredicto(d, r) {
    const completo = d.ticket > 0 && d.margen > 0 && d.presupuesto > 0 && d.costoConv > 0;
    if (!completo) return 'faltan';
    if (r.dejaVenta <= 0) return 'ventaPierde';
    if (r.gana < 0) return 'pierde';
    if (r.colchon < COLCHON_SANO) return 'limite';
    return 'conviene';
  }

  function chequeos(r) {
    return [
      { id: 'dejaVenta', ok: r.dejaVenta > 0 },
      { id: 'gana', ok: r.gana >= 0 },
      { id: 'colchon', ok: r.colchon >= COLCHON_SANO },
      { id: 'aprende', ok: r.porSemana >= REFERENCIA_SEMANAL },
      { id: 'atiende', ok: !(r.usoCapacidad > 1) },
      { id: 'confiable', ok: r.ventas >= VENTAS_CONFIABLES },
    ];
  }

  // Qué arreglar, en orden: primero lo que hace perder plata, después lo que frena.
  function arreglos(r) {
    if (r.veredicto === 'faltan') return [];
    const lista = [];
    if (r.dejaVenta <= 0) lista.push('ventaPierde');
    if (r.usoCapacidad > 1) lista.push('capacidad');
    if (r.dejaVenta > 0 && r.gana < 0) lista.push('pierde');
    if (r.gana >= 0 && r.colchon < COLCHON_SANO) lista.push('limite');
    if (r.porSemana < REFERENCIA_SEMANAL) lista.push('aprende');
    if (r.ventas < VENTAS_CONFIABLES) lista.push('pocaData');
    if (r.diarioUsd < 1) lista.push('diarioChico');
    if (!lista.length) lista.push('escalar');
    return lista;
  }

  function calcular(d) {
    const e = embudo(d);
    const r = Object.assign({}, e, limites(d, e), aprendizaje(d, e), lectura(e), atencion(d, e), recompra(d, e), metas(d, e));
    r.veredicto = veredicto(d, r);
    r.chequeos = chequeos(r);
    r.arreglos = arreglos(r);
    return r;
  }

  // La brecha: mismos anuncios pagados, pero con mejor anuncio (cuesta menos) y mejor atención (cierra más).
  function simular(d) {
    const mejora = Math.min(90, noNeg(d.mejoraCosto));
    const mejorado = Object.assign({}, d, {
      costoConv: noNeg(d.costoConv) * (1 - mejora / 100),
      cierre: Math.max(noNeg(d.cierre), noNeg(d.cierreNuevo)),
    });
    const antes = calcular(d);
    const despues = calcular(mejorado);
    return { mejorado, antes, despues, veces: antes.gana > 0 ? despues.gana / antes.gana : NaN };
  }

  raiz.CalcPauta = raiz.CalcPauta || {};
  raiz.CalcPauta.motor = { EJEMPLO, VACIO, REFERENCIA_SEMANAL, COLCHON_SANO, calcular, simular };
})(typeof window !== 'undefined' ? window : globalThis);
