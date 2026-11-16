/* Calculadora de Pauta: el veredicto, qué arreglar primero, el plan de 30 días y el resumen para copiar. */
(function (raiz) {
  'use strict';
  const P = (raiz.CalcPauta = raiz.CalcPauta || {});

  // Qué números se ven en cada bloque de la pantalla. Cada uno es un botón que abre su explicación.
  P.secciones = [
    { id: 'mes', titulo: 'El mes en números', pista: 'Toca cualquier número: te explico qué es, de dónde sale y cómo mejorarlo.', fichas: ['conversaciones', 'ventas', 'ingresos', 'margenTotal', 'gana'] },
    { id: 'limites', titulo: 'Hasta dónde aguanta el negocio', pista: 'Los números para saber si va bien desde la primera semana.', fichas: ['maxConversacion', 'cierreMin', 'costoCliente', 'vuelve', 'colchon'] },
    { id: 'sistema', titulo: '¿Le alcanza al sistema de anuncios?', pista: 'El sistema necesita datos para aprender. Con poca plata repartida, no aprende.', fichas: ['porSemana', 'diarioMin', 'conjuntos', 'diasPara50'] },
    { id: 'ciegos', titulo: 'Lo que casi nadie cuenta', pista: 'Cuatro cosas que cambian el resultado y casi nunca se miran.', fichas: ['confianza', 'capacidad', 'gana6m', 'pautaReal'] },
    { id: 'meta', titulo: 'Para llegar a su meta', pista: 'Dos caminos para ganar lo que quiere: poner más o vender mejor.', fichas: ['metaPresupuesto', 'metaCierre'] },
  ];

  // Hay cuentas que no tienen sentido si la venta deja pérdida o si todavía no se cierra ninguna venta.
  P.bloqueo = function bloqueo(ficha, c) {
    const pide = ficha.pide || [];
    if (pide.includes('meta') && !(c.d.meta > 0)) {
      return {
        estado: '', corto: 'falta anotar su meta',
        largo: 'Anota cuánto quiere ganar al mes en la pregunta «Su meta» y aquí vas a ver la cuenta.',
      };
    }
    if (pide.includes('venta') && c.r.dejaVenta <= 0) {
      return {
        estado: 'mal', corto: 'la venta deja pérdida',
        largo: `Hoy cada venta deja ${c.f.bs(c.r.dejaVenta)}, o sea, pérdida. Mientras eso no cambie, esta cuenta no tiene sentido: primero hay que subir el precio o bajar el costo.`,
      };
    }
    if (pide.includes('cierre') && !(c.r.ventas > 0)) {
      return {
        estado: 'mal', corto: 'todavía no cierra ventas',
        largo: 'Con un cierre de 0 no hay ventas, así que esta cuenta no se puede hacer. Pon cuántos compran de cada 100, aunque sea un estimado.',
      };
    }
    return null;
  };

  P.veredictos = {
    faltan: {
      nivel: 'gris', titulo: 'Faltan datos',
      texto: () => 'Responde las 5 preguntas y te digo si le conviene pautar.',
    },
    ventaPierde: {
      nivel: 'mal', titulo: 'Cada venta deja pérdida',
      texto: () => 'Antes de pautar hay que subir el precio o bajar el costo. Los anuncios solo traerían más ventas que pierden.',
    },
    pierde: {
      nivel: 'mal', titulo: 'Así pierde plata',
      texto: (c) => `Pierde ${c.f.bs(-c.r.gana)} al mes. No pongas más presupuesto: primero arregla lo de abajo.`,
    },
    limite: {
      nivel: 'ojo', titulo: 'Gana, pero al límite',
      texto: (c) => `Gana ${c.f.bs(c.r.gana)} al mes, pero si el costo por conversación sube ${c.f.pct(c.r.colchon)} empieza a perder.`,
    },
    conviene: {
      nivel: 'bien', titulo: 'Le conviene pautar',
      texto: (c) => `Gana ${c.f.bs(c.r.gana)} al mes y el costo puede subir ${c.f.pct(c.r.colchon)} antes de que pierda.`,
    },
  };

  P.chequeos = {
    dejaVenta: { texto: 'Cada venta deja ganancia', ficha: 'margenTotal' },
    gana: { texto: 'Gana después de pagar todo', ficha: 'gana' },
    colchon: { texto: 'Tiene colchón de 40% o más', ficha: 'colchon' },
    aprende: { texto: 'El sistema recibe 50 resultados por semana', ficha: 'porSemana' },
    atiende: { texto: 'Puede atender a todos los que escriben', ficha: 'capacidad' },
    confiable: { texto: 'Hay 10 ventas o más para confiar en el número', ficha: 'confianza' },
  };

  P.arreglos = {
    ventaPierde: {
      ficha: 'margenTotal',
      texto: (c) => `Cada venta deja ${c.f.bs(c.r.dejaVenta)}. Sube el precio o baja el costo antes de pautar.`,
    },
    capacidad: {
      ficha: 'capacidad',
      texto: (c) => `Le escribirán ${c.f.corto(c.r.convDia, 1)} personas por día y puede atender ${c.f.entero(c.d.capacidad)}. Baja a ${c.f.bs(c.r.presupuestoTope)} al mes o suma a alguien que responda.`,
    },
    pierde: {
      ficha: 'cierreMin',
      texto: (c) => (c.r.cierreMin <= 1
        ? `Para no perder necesita una de estas tres: cerrar ${c.f.de100(c.r.cierreMin)}, pagar menos de ${c.f.bs(c.r.maxConversacion)} por conversación o subir el precio a ${c.f.bs(c.r.ticketMin)}.`
        : `Ni vendiéndole a todos cubre lo que paga. Tiene que pagar menos de ${c.f.bs(c.r.maxConversacion)} por conversación o subir el precio.`),
    },
    limite: {
      ficha: 'colchon',
      texto: (c) => `El colchón es de ${c.f.pct(c.r.colchon)}. Sube el cierre o mejora los anuncios antes de poner más plata.`,
    },
    aprende: {
      ficha: 'porSemana',
      texto: (c) => `El sistema recibe ${c.f.entero(c.r.porSemana)} resultados por semana y necesita unos 50. Pon ${c.f.bs(c.r.diarioMin)} por día o junta todo en un solo conjunto de anuncios.`,
    },
    pocaData: {
      ficha: 'confianza',
      texto: (c) => `Con ${c.f.corto(c.r.ventas, 1)} ventas al mes, un mes bueno o malo puede ser pura suerte. No decidas con un solo mes.`,
    },
    diarioChico: {
      ficha: 'pautaReal',
      texto: (c) => `Pone ${c.f.corto(c.r.diarioUsd)} dólares por día. Con menos de 1 dólar la plataforma casi no puede trabajar.`,
    },
    escalar: {
      ficha: 'gana',
      texto: () => 'Todo en orden. Sube el presupuesto de a poco (20% por vez) y vuelve a medir: al crecer, cada conversación suele costar un poco más.',
    },
  };

  // Plan con los números del negocio. Espera entre 7 y 14 días antes de sacar conclusiones.
  P.plan = function plan(c) {
    const espera = Math.min(14, Math.max(7, Math.ceil(c.r.diasPara50) || 7));
    const semaforo = `no pagar más de ${c.f.bs(c.r.maxConversacion)} por conversación`;
    return [
      { cuando: 'Antes de empezar', ficha: 'maxConversacion', texto: `Anota el semáforo: ${semaforo} y cerrar al menos ${c.f.de100(c.r.cierreMin)}.` },
      {
        cuando: 'Día 1', ficha: 'conjuntos',
        texto: c.r.conjuntos >= 1
          ? `Lanza 1 campaña con 1 conjunto y de 3 a 5 anuncios distintos, con ${c.f.bs(c.r.diarioBs)} por día.`
          : `Con ${c.f.bs(c.r.diarioBs)} por día no le alcanza al sistema. Sube a ${c.f.bs(c.r.diarioMin)} por día o pauta menos días con más plata.`,
      },
      { cuando: `Días 1 a ${espera}`, ficha: 'diasPara50', texto: 'No toques la campaña. Anota cada día el gasto, las personas que escribieron y las ventas.' },
      { cuando: `Día ${espera}`, ficha: 'colchon', texto: `Mira el costo real por conversación. Si es menos de ${c.f.bs(c.r.maxConversacion)}, sigue. Si es más, cambia los anuncios, no el presupuesto.` },
      { cuando: 'Todo el mes', ficha: 'ventas', texto: 'Responde en minutos y haz seguimiento a los que no compraron.' },
      { cuando: 'Día 30', ficha: 'gana', texto: 'Vuelve aquí con los números reales. Si gana y tiene colchón, sube 20% y repite.' },
    ];
  };

  P.resumen = function resumen(c) {
    if (c.r.veredicto === 'faltan') return '';
    const paga = c.r.honorarios > 0 ? 'los anuncios y el servicio' : 'los anuncios';
    const lineas = [
      `Calculadora de Pauta${c.d.negocio ? ' · ' + c.d.negocio : ''}`,
      `Veredicto: ${P.veredictos[c.r.veredicto].titulo}.`,
      `Pone ${c.f.bs(c.r.presupuesto)} al mes en anuncios (${c.f.bs(c.r.diarioBs)} por día).`,
      `Le escriben unas ${c.f.entero(c.r.conversaciones)} personas y compran ${c.f.corto(c.r.ventas, 1)}.`,
      `Vende ${c.f.bs(c.r.ingresos)}, le quedan ${c.f.bs(c.r.margenTotal)} y ${c.r.gana >= 0 ? 'gana' : 'pierde'} ${c.f.bs(Math.abs(c.r.gana))} después de pagar ${paga}.`,
      `Cada cliente nuevo le cuesta ${c.f.bs(c.r.costoCliente)} y le deja ${c.f.bs(c.r.dejaVenta)}.`,
      `Semáforo: no pagar más de ${c.f.bs(c.r.maxConversacion)} por conversación y cerrar al menos ${c.f.de100(c.r.cierreMin)}.`,
      '',
      'Qué arreglar primero:',
    ];
    c.r.arreglos.forEach((id, i) => lineas.push(`${i + 1}. ${P.arreglos[id].texto(c)}`));
    return lineas.join('\n');
  };
})(typeof window !== 'undefined' ? window : globalThis);
