/* Calculadora de Pauta: la explicación de cada número (el sistema de anuncios, los puntos ciegos y la meta). */
(function (raiz) {
  'use strict';
  const P = (raiz.CalcPauta = raiz.CalcPauta || {});
  const fichas = (P.fichas = P.fichas || {});
  const referencia = () => P.motor.REFERENCIA_SEMANAL;
  const dias = (n) => (Number.isFinite(n) ? Math.ceil(n - 1e-9) : NaN);

  fichas.porSemana = {
    titulo: 'Resultados por semana', tecnico: 'Fase de aprendizaje',
    valor: (c) => c.f.entero(c.r.porSemana),
    sub: () => `el sistema necesita unos ${referencia()}`,
    estado: (c) => (c.r.porSemana >= referencia() ? 'bien' : c.r.porSemana >= referencia() / 2 ? 'ojo' : 'mal'),
    barra: (c) => Math.min(1, c.r.porSemana / referencia()),
    queEs: 'Cuántas conversaciones recibe por semana el sistema de anuncios. Con eso aprende a quién mostrarle los anuncios.',
    pasos: (c) => [
      `${c.f.entero(c.r.conversaciones)} conversaciones al mes ÷ 30 días × 7 = ${c.f.entero(c.r.porSemana)} por semana`,
      `Meta usa como referencia unas ${referencia()} por semana en cada conjunto de anuncios`,
    ],
    sirve: 'Con menos de 50 el sistema trabaja casi a ciegas y cada resultado sale más caro. En un análisis de la propia Meta, los conjuntos por debajo de esa cifra pagaron cerca de 28% más por compra.',
    mejorar: [
      'Junta todo en un solo conjunto de anuncios: no dividas la plata.',
      'Sube el presupuesto diario hasta el mínimo. Mira «Mínimo por día».',
      'Pide un resultado que pase seguido: conversaciones, no compras.',
    ],
    prueba: 'presupuesto',
    fuente: 'Referencia: publicación de Meta para anunciantes del 21 de octubre de 2026. La cifra de 28% es de Meta, que no publica cómo la midió.',
  };

  fichas.diarioMin = {
    titulo: 'Mínimo por día', tecnico: 'Presupuesto mínimo para aprender',
    valor: (c) => c.f.bs(c.r.diarioMin),
    sub: (c) => `hoy pone ${c.f.bs(c.r.diarioBs)} por día`,
    estado: (c) => (c.r.diarioBs >= c.r.diarioMin ? 'bien' : 'ojo'),
    queEs: 'Lo mínimo que hay que poner por día para que un conjunto de anuncios junte 50 conversaciones en una semana.',
    pasos: (c) => [
      `50 conversaciones × ${c.f.bs(c.d.costoConv)} = ${c.f.bs(50 * c.d.costoConv)} por semana`,
      `${c.f.bs(50 * c.d.costoConv)} ÷ 7 días = ${c.f.bs(c.r.diarioMin)} por día`,
      `Al mes son ${c.f.bs(c.r.mensualMin)}. Hoy pone ${c.f.bs(c.r.presupuesto)}`,
    ],
    sirve: 'Si el presupuesto no llega a este mínimo, conviene más juntar la plata y pautar menos días que pautar a medias todo el mes.',
    mejorar: [
      'Si no alcanza, pauta solo 2 semanas con el doble por día.',
      'Baja el costo por conversación con mejores anuncios: el mínimo baja solo.',
      'No abras un segundo conjunto de anuncios hasta doblar este mínimo.',
    ],
    prueba: 'costoConv',
  };

  fichas.conjuntos = {
    titulo: 'Conjuntos de anuncios', tecnico: 'Consolidación de conjuntos (ad sets)',
    tituloLargo: 'En cuántos conjuntos de anuncios puede dividir la plata',
    valor: (c) => c.f.entero(c.r.conjuntos),
    sub: (c) => (c.r.conjuntos === 0 ? 'no le alcanza ni para uno' : c.r.conjuntos === 1 ? 'uno solo: no lo dividas' : 'puede probar cosas a la vez'),
    estado: (c) => (c.r.conjuntos >= 1 ? 'bien' : 'ojo'),
    queEs: 'Un conjunto es un grupo de anuncios que comparten la misma plata. Este número dice en cuántos grupos puede repartir el presupuesto sin dejar a ninguno sin datos.',
    pasos: (c) => [
      `Presupuesto de una semana: ${c.f.bs((c.r.presupuesto * 7) / 30)}`,
      `Cada conjunto necesita 50 × ${c.f.bs(c.d.costoConv)} = ${c.f.bs(50 * c.d.costoConv)} por semana`,
      `${c.f.bs((c.r.presupuesto * 7) / 30)} ÷ ${c.f.bs(50 * c.d.costoConv)} = ${c.f.corto(c.r.porSemana / 50, 1)}: le alcanza para ${c.f.entero(c.r.conjuntos)}`,
    ],
    sirve: 'El error más común es abrir 4 o 5 conjuntos con poca plata. Cada uno recibe migajas y ninguno aprende.',
    mejorar: [
      'Arma 1 campaña con 1 conjunto y de 3 a 5 anuncios distintos adentro.',
      'Deja el público abierto: hoy el anuncio es el que filtra a quién le llega.',
      'Para probar una idea nueva, suma un anuncio al mismo conjunto en vez de abrir otro.',
    ],
    prueba: 'presupuesto',
    fuente: 'La cuenta es la que da Meta: presupuesto de la semana ÷ (costo por resultado × 50).',
  };

  fichas.diasPara50 = {
    titulo: 'Días para tener datos', tecnico: 'Duración del aprendizaje',
    valor: (c) => (Number.isFinite(c.r.diasPara50) ? `${dias(c.r.diasPara50)} ${c.f.plural(dias(c.r.diasPara50), 'día', 'días')}` : '—'),
    sub: () => 'para juntar 50 conversaciones',
    estado: (c) => (c.r.diasPara50 <= 7 ? 'bien' : c.r.diasPara50 <= 14 ? 'ojo' : 'mal'),
    queEs: 'Cuántos días tarda en juntar las primeras 50 conversaciones.',
    pasos: (c) => [
      `Le escriben ${c.f.corto(c.r.convDia, 1)} personas por día`,
      `50 ÷ ${c.f.corto(c.r.convDia, 1)} = ${dias(c.r.diasPara50)} días`,
    ],
    sirve: 'Antes de ese día no saques conclusiones ni cambies nada. Cada cambio grande hace que el sistema empiece a aprender de nuevo.',
    mejorar: [
      'Haz todos los cambios juntos, en un solo momento.',
      'Después no toques la campaña por 7 días.',
      'Si tarda más de 2 semanas, el presupuesto es muy chico para este costo.',
    ],
    prueba: 'presupuesto',
  };

  fichas.confianza = {
    titulo: 'Qué tan seguro es', tecnico: 'Margen de error por pocas ventas', pide: ['venta', 'cierre'],
    valor: (c) => `${c.f.entero(c.r.ventasBajo)} a ${c.f.entero(c.r.ventasAlto)}`,
    sub: () => 'ventas, en 8 de cada 10 meses',
    estado: (c) => (c.r.confianza === 'alta' ? 'bien' : c.r.confianza === 'baja' ? 'ojo' : ''),
    queEs: 'Con pocas ventas la suerte pesa mucho. Este es el rango en el que pueden caer las ventas del mes solo por azar, aunque todo lo demás siga igual.',
    pasos: (c) => [
      `La cuenta dice ${c.f.corto(c.r.ventas, 1)} ventas`,
      `Por pura suerte, en 8 de cada 10 meses caerían entre ${c.f.entero(c.r.ventasBajo)} y ${c.f.entero(c.r.ventasAlto)}`,
      `En plata, el resultado del mes iría de ${c.f.bs(c.r.ganaBajo)} a ${c.f.bs(c.r.ganaAlto)}`,
    ],
    sirve: (c) => (c.r.confianza === 'baja'
      ? 'Con menos de 10 ventas, un solo mes no alcanza para decidir. No te asustes por un mes malo ni celebres de más uno bueno.'
      : 'Sirve para no asustarte por un mes malo ni celebrar de más uno bueno.'),
    mejorar: [
      'Junta más datos antes de decidir: dos meses, o más presupuesto.',
      'Cuenta también a los interesados de verdad (preguntan precio y disponibilidad): llegan antes que las ventas y avisan cómo va.',
      'Anota cada día el gasto, las personas que escribieron y las ventas.',
    ],
    fuente: 'Es una aproximación estadística: supone que el cierre real es exactamente el que pusiste.',
  };

  fichas.capacidad = {
    titulo: 'Puede atender', tecnico: 'Capacidad de atención',
    valor: (c) => `${c.f.corto(c.r.convDia, 1)} de ${c.f.entero(c.d.capacidad)}`,
    sub: () => 'conversaciones nuevas por día',
    estado: (c) => (c.r.usoCapacidad > 1 ? 'mal' : c.r.usoCapacidad > 0.8 ? 'ojo' : 'bien'),
    barra: (c) => Math.min(1, c.r.usoCapacidad || 0),
    queEs: 'Cuántas personas le van a escribir por día contra cuántas puede atender bien.',
    pasos: (c) => [
      `${c.f.entero(c.r.conversaciones)} al mes ÷ 30 = ${c.f.corto(c.r.convDia, 1)} por día`,
      `Puede atender bien ${c.f.entero(c.d.capacidad)} por día`,
      c.r.usoCapacidad > 1
        ? `Le sobran ${c.f.corto(c.r.convDia - c.d.capacidad, 1)} personas por día que no va a atender a tiempo`
        : `Usa ${c.f.pct(c.r.usoCapacidad)} de lo que puede atender`,
    ],
    sirve: 'Si llegan más personas de las que puede atender, responde tarde y vende menos. Un estudio publicado en Harvard Business Review encontró que las empresas que contactaban en la primera hora tenían casi 7 veces más probabilidad de avanzar con el cliente que las que tardaban una hora más.',
    mejorar: (c) => [
      'Guarda respuestas rápidas para las preguntas de siempre.',
      'Pon un mensaje de bienvenida que pregunte qué busca.',
      'Define quién responde en cada horario, también de noche y los domingos.',
      `Si no puede sumar a nadie, su tope es ${c.f.bs(c.r.presupuestoTope)} de anuncios al mes.`,
    ],
    prueba: 'presupuesto',
  };

  fichas.gana6m = {
    titulo: 'Con los que vuelven', tecnico: 'LTV, valor del cliente en el tiempo', pide: ['venta', 'cierre'],
    valor: (c) => c.f.bs(c.r.gana6m),
    sub: (c) => (c.r.compras > 1 ? `si cada cliente compra ${c.f.corto(c.r.compras, 1)} veces` : 'hoy cuenta una sola compra'),
    estado: (c) => (c.r.gana6m >= 0 ? 'bien' : 'mal'),
    queEs: 'La ganancia de este mes de anuncios si cuentas que el mismo cliente vuelve a comprar en los próximos 6 meses.',
    pasos: (c) => [
      `Cada cliente compra ${c.f.corto(c.r.compras, 1)} ${c.f.plural(c.r.compras, 'vez', 'veces')}: deja ${c.f.bs(c.r.dejaVenta)} × ${c.f.corto(c.r.compras, 1)} = ${c.f.bs(c.r.valeCliente)}`,
      `${c.f.corto(c.r.ventas, 1)} clientes × ${c.f.bs(c.r.valeCliente)} = ${c.f.bs(c.r.ventas * c.r.valeCliente)}`,
      `Menos lo que paga (${c.f.bs(c.r.costoTotal)}): ${c.f.bs(c.r.gana6m)}`,
      `Así podría pagar hasta ${c.f.bs(c.r.maxConversacion6m)} por conversación`,
    ],
    sirve: 'Un negocio con clientes que vuelven puede pagar más por cada cliente nuevo. Pero esa plata llega después: el primer mes igual hay que aguantarlo.',
    mejorar: [
      'Guarda el contacto de cada comprador desde el primer día.',
      'Escríbele a los 15 o 30 días con algo útil, no solo con una oferta.',
      'Dale un motivo para volver: un cupón de segunda compra o una novedad.',
    ],
    prueba: 'recompras',
  };

  fichas.pautaReal = {
    titulo: 'Sale de su cuenta', tecnico: 'Costo real de la pauta',
    valor: (c) => c.f.bs(c.r.pautaReal),
    sub: (c) => `${c.f.bs(c.r.diarioBs)} por día · ${c.f.corto(c.r.diarioUsd)} dólares`,
    estado: (c) => (c.r.diarioUsd < 1 ? 'ojo' : ''),
    queEs: 'Lo que de verdad se debita por los anuncios en el mes, con el recargo del banco si lo hay.',
    pasos: (c) => [
      `Presupuesto del mes: ${c.f.bs(c.r.presupuesto)}`,
      c.d.recargo > 0 ? `Más ${c.f.corto(c.d.recargo, 1)} de cada 100 de recargo: ${c.f.bs(c.r.pautaReal)}` : 'No anotaste recargo del banco',
      `Por día: ${c.f.bs(c.r.diarioBs)}, unos ${c.f.corto(c.r.diarioUsd)} dólares al cambio de ${c.f.bs(c.d.tipoCambio)}`,
    ],
    sirve: 'Los anuncios se cobran en dólares con tarjeta. Si el dólar sube o el banco cobra comisión, los anuncios cuestan más aunque no toques nada.',
    mejorar: [
      'Revisa el tipo de cambio cada mes y vuelve a hacer la cuenta.',
      'Pregunta en el banco el tope mensual de la tarjeta para compras en el exterior.',
      'Con menos de 1 dólar por día la plataforma casi no puede trabajar.',
    ],
  };

  fichas.metaPresupuesto = {
    titulo: 'Tendría que poner', tecnico: 'Proyección de presupuesto', pide: ['meta'],
    tituloLargo: 'Cuánto tendría que poner en anuncios para llegar a su meta',
    valor: (c) => (c.r.metaPosible ? c.f.bs(c.r.metaPresupuesto) : 'No alcanza'),
    sub: (c) => (c.r.metaPosible ? 'en anuncios al mes' : 'así, más plata es más pérdida'),
    estado: (c) => (c.r.metaPosible ? '' : 'mal'),
    queEs: 'Cuánto tendría que poner en anuncios al mes para ganar lo que quiere, si todo lo demás sigue igual.',
    pasos: (c) => (c.r.metaPosible ? [
      `Por cada Bs 1 en anuncios, las ventas le dejan ${c.f.bs(c.r.dejaPorBs)}`,
      `Quitando lo que pagó, gana ${c.f.bs(c.r.netoPorBs)} por cada Bs 1`,
      `Meta de ${c.f.bs(c.d.meta)}${c.r.honorarios > 0 ? ` más el servicio de ${c.f.bs(c.r.honorarios)}` : ''} ÷ ${c.f.corto(c.r.netoPorBs)} = ${c.f.bs(c.r.metaPresupuesto)} al mes`,
      `Con eso le escribirían ${c.f.corto(c.r.metaPresupuesto / c.d.costoConv / 30, 1)} personas por día`,
    ] : [
      `Por cada Bs 1 en anuncios, las ventas le dejan ${c.f.bs(c.r.dejaPorBs)}: menos de lo que pagó`,
      'Con estos números, poner más plata es perder más. Primero hay que mejorar el cierre o el costo',
    ]),
    sirve: 'Te dice si la meta es realista. Ojo: no crece en línea recta. Cuando subes el presupuesto, cada conversación suele costar un poco más.',
    mejorar: [
      'Sube de a poco: 20% cada vez, y vuelve a medir.',
      'Antes de poner más, mira si puede atender a todos los que le escribirían.',
      'Casi siempre es más barato subir el cierre que subir el presupuesto.',
    ],
    prueba: 'cierre',
  };

  fichas.metaCierre = {
    titulo: 'O tendría que cerrar', tecnico: 'Cierre necesario para la meta', pide: ['meta', 'venta'],
    tituloLargo: 'Cuánto tendría que cerrar para llegar a su meta sin poner más',
    valor: (c) => (c.r.metaCierre <= 1 ? c.f.de100(c.r.metaCierre) : 'No alcanza'),
    sub: (c) => (c.r.metaCierre <= 1 ? 'sin poner un boliviano más' : 'ni vendiéndole a todos'),
    estado: (c) => (c.r.metaCierre <= 1 ? '' : 'mal'),
    queEs: 'Cuántos de cada 100 tendría que cerrar para llegar a su meta con el mismo presupuesto de hoy.',
    pasos: (c) => [
      `Las ventas tienen que dejarle ${c.f.bs(c.d.meta)} + ${c.f.bs(c.r.costoTotal)} = ${c.f.bs(c.d.meta + c.r.costoTotal)}`,
      `Cada venta deja ${c.f.bs(c.r.dejaVenta)}: son ${c.f.corto((c.d.meta + c.r.costoTotal) / c.r.dejaVenta, 1)} ventas`,
      `Le escriben ${c.f.entero(c.r.conversaciones)}: tendría que cerrar ${c.f.de100(c.r.metaCierre)}`,
    ],
    sirve: 'Compara este número con el de al lado. Casi siempre conviene trabajar primero la atención: no cuesta pauta.',
    mejorar: () => P.consejos.atender,
    prueba: 'presupuesto',
  };

  fichas.brecha = {
    titulo: 'La brecha', tecnico: 'Efecto multiplicador',
    tituloLargo: 'Por qué mejorar dos cosas rinde tanto',
    valor: () => '',
    queEs: 'La diferencia entre pautar como se hace casi siempre y pautar bien, con la misma plata en anuncios.',
    pasos: (c) => {
      const s = P.motor.simular(c.d);
      const linea = (r) => `${c.f.entero(r.conversaciones)} personas × ${c.f.de100(r.cierre)} × ${c.f.bs(r.dejaVenta)} − ${c.f.bs(r.costoTotal)} = ${c.f.bs(r.gana)}`;
      return [
        'La ganancia es una multiplicación: personas que escriben × cuántas compran × lo que deja cada venta, menos lo que paga',
        `Hoy: ${linea(s.antes)}`,
        `Mejorado: ${linea(s.despues)}`,
      ];
    },
    sirve: 'Como es una multiplicación, mejorar un poco dos cosas rinde más que mejorar mucho una sola. Y si una vale cero, todo vale cero.',
    mejorar: [
      'El anuncio baja el costo de cada conversación.',
      'La atención en WhatsApp sube el cierre.',
      'La oferta sube lo que deja cada venta.',
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
