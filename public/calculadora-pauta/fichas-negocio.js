/* Calculadora de Pauta: la explicación de cada número (el mes y los límites del negocio).
   Cada ficha es un botón en pantalla: valor y sub van en el botón; lo demás, en la hoja que se abre. */
(function (raiz) {
  'use strict';
  const P = (raiz.CalcPauta = raiz.CalcPauta || {});
  const fichas = (P.fichas = P.fichas || {});
  const colchonSano = () => P.motor.COLCHON_SANO;

  P.consejos = {
    atender: [
      'Responde en menos de 5 minutos: el que escribe está comparando con otros en ese momento.',
      'Usa un guion corto: saludo, una pregunta para entender qué busca, la oferta y cómo paga.',
      'Haz seguimiento al día siguiente, al tercer día y a la semana a los que no compraron.',
      'Pon el precio en el anuncio: escriben menos curiosos y más gente que sí puede pagar.',
    ],
    palancas: [
      'Baja el costo por conversación con mejores anuncios.',
      'Sube el cierre atendiendo más rápido y haciendo seguimiento.',
      'Sube lo que deja cada cliente: precio, combos o que vuelva a comprar.',
    ],
  };

  fichas.conversaciones = {
    titulo: 'Le escriben', tecnico: 'Conversaciones iniciadas',
    valor: (c) => c.f.entero(c.r.conversaciones),
    sub: (c) => `unas ${c.f.corto(c.r.convDia, 1)} por día`,
    estado: () => '',
    queEs: 'Cuántas personas abren el chat de WhatsApp en un mes gracias a los anuncios.',
    pasos: (c) => [
      'Presupuesto del mes ÷ lo que cuesta cada conversación',
      `${c.f.bs(c.r.presupuesto)} ÷ ${c.f.bs(c.d.costoConv)} = ${c.f.entero(c.r.conversaciones)} personas`,
      `${c.f.entero(c.r.conversaciones)} ÷ 30 días = ${c.f.corto(c.r.convDia, 1)} por día`,
    ],
    sirve: 'Son las oportunidades de venta del mes. Si son pocas, no hay a quién venderle. Si son más de las que se pueden atender, se pierden.',
    mejorar: [
      'Cambia los primeros 3 segundos del video: ahí se decide si lo ven o lo pasan.',
      'Prueba de 3 a 5 anuncios con ideas distintas, no el mismo con otro color.',
      'Di una oferta concreta: qué es, para quién y por qué ahora.',
      'Cuidado: más barato no siempre es mejor. Si llegan curiosos, baja el cierre.',
    ],
    prueba: 'costoConv',
  };

  fichas.ventas = {
    titulo: 'Compran', tecnico: 'Ventas o conversiones',
    valor: (c) => c.f.corto(c.r.ventas, 1),
    sub: (c) => `cierra ${c.f.de100(c.r.cierre)}`,
    estado: () => '',
    queEs: 'Cuántas de las personas que escriben terminan comprando en el mes.',
    pasos: (c) => [
      'Personas que escriben × cuántas compran de cada 100',
      `${c.f.entero(c.r.conversaciones)} × ${c.f.de100(c.r.cierre)} = ${c.f.corto(c.r.ventas, 1)} ventas`,
    ],
    sirve: 'El anuncio solo trae a la persona. La venta se hace en el chat. Por eso este número depende más de cómo se atiende que de cuánto se paga.',
    mejorar: () => P.consejos.atender,
    prueba: 'cierre',
  };

  fichas.ingresos = {
    titulo: 'Vende', tecnico: 'Ingresos por anuncios',
    valor: (c) => c.f.bs(c.r.ingresos),
    sub: (c) => `${c.f.corto(c.r.ventas, 1)} ventas de ${c.f.bs(c.d.ticket)}`,
    estado: () => '',
    queEs: 'La plata que entra por esas ventas, antes de pagar nada.',
    pasos: (c) => [
      'Ventas × lo que paga cada cliente',
      `${c.f.corto(c.r.ventas, 1)} × ${c.f.bs(c.d.ticket)} = ${c.f.bs(c.r.ingresos)}`,
    ],
    sirve: 'Muestra el tamaño, pero todavía no es ganancia. De aquí hay que pagar el producto, los anuncios y el servicio.',
    mejorar: [
      'Arma combos: que el cliente se lleve dos cosas en la misma compra.',
      'Ofrece un adicional al cerrar la venta: «¿le sumo…?».',
      'Pon en los anuncios el producto de precio más alto que sí se vende.',
    ],
    prueba: 'ticket',
  };

  fichas.margenTotal = {
    titulo: 'Le queda', tecnico: 'Margen bruto',
    valor: (c) => c.f.bs(c.r.margenTotal),
    sub: (c) => `cada venta deja ${c.f.bs(c.r.dejaVenta)}`,
    estado: (c) => (c.r.dejaVenta > 0 ? '' : 'mal'),
    queEs: 'Lo que queda de esas ventas después de pagar el producto. Todavía falta pagar los anuncios.',
    pasos: (c) => [
      c.d.comision > 0
        ? `De cada 100 Bs le quedan ${c.f.corto(c.d.margen, 1)}, menos ${c.f.corto(c.d.comision, 1)} que se van en cada venta: ${c.f.corto(c.r.margenNeto * 100, 1)}`
        : `De cada 100 Bs que cobra le quedan ${c.f.corto(c.d.margen, 1)}`,
      `Una venta de ${c.f.bs(c.d.ticket)} deja ${c.f.bs(c.r.dejaVenta)}`,
      `${c.f.corto(c.r.ventas, 1)} ventas × ${c.f.bs(c.r.dejaVenta)} = ${c.f.bs(c.r.margenTotal)}`,
    ],
    sirve: 'Con esta plata se pagan los anuncios. Si cada venta deja poco, ningún anuncio lo arregla: solo se pierde más rápido.',
    mejorar: [
      'Sube un poco el precio y mira si se sigue vendiendo.',
      'Negocia el costo con el proveedor o compra en más cantidad.',
      'Pon en los anuncios el producto que más deja, no el que más se vende.',
    ],
    prueba: 'margen',
  };

  fichas.gana = {
    titulo: 'Gana', tecnico: 'Ganancia de la campaña',
    valor: (c) => c.f.bs(c.r.gana),
    sub: (c) => (c.r.honorarios > 0 ? 'después de anuncios y servicio' : 'después de pagar los anuncios'),
    estado: (c) => (c.r.gana >= 0 ? 'bien' : 'mal'),
    queEs: 'Lo que le queda limpio en el mes, después de pagar el producto, los anuncios y el servicio.',
    pasos: (c) => [
      `Le queda de las ventas: ${c.f.bs(c.r.margenTotal)}`,
      `Menos los anuncios: ${c.f.bs(c.r.pautaReal)}`,
      c.r.honorarios > 0 ? `Menos el servicio: ${c.f.bs(c.r.honorarios)}` : null,
      `${c.r.gana >= 0 ? 'Gana' : 'Pierde'}: ${c.f.bs(Math.abs(c.r.gana))}`,
    ].filter(Boolean),
    sirve: 'Es el número que decide si seguir, poner más o parar. Si es negativo, poner más presupuesto solo hace perder más.',
    mejorar: [
      'Mira «Qué arreglar primero»: ahí está el orden.',
      'Mueve «La brecha» para ver cuánto cambia con mejores anuncios y mejor atención.',
    ],
    prueba: 'presupuesto', pruebaMuestra: 'ventas',
    notaPrueba: 'Esto supone que todo lo demás sigue igual. En la vida real, al subir el presupuesto cada conversación suele costar un poco más.',
  };

  fichas.maxConversacion = {
    titulo: 'Máximo por conversación', tecnico: 'CPL máximo o de equilibrio', pide: ['venta', 'cierre'],
    tituloLargo: 'Lo máximo que puede pagar por cada persona que escribe',
    valor: (c) => (c.r.maxConversacion > 0 ? c.f.bs(c.r.maxConversacion) : 'Nada'),
    sub: (c) => `hoy paga ${c.f.bs(c.d.costoConv)}`,
    estado: (c) => (c.d.costoConv > c.r.maxConversacion ? 'mal' : c.r.colchon >= colchonSano() ? 'bien' : 'ojo'),
    queEs: 'Lo más que puede pagar por cada persona que escribe sin perder plata. Es tu semáforo.',
    pasos: (c) => {
      const ventasNecesarias = c.r.costoTotal / c.r.dejaVenta;
      const personas = ventasNecesarias / c.r.cierre;
      return [
        `Para no perder, las ventas tienen que dejar lo que paga: ${c.f.bs(c.r.costoTotal)}`,
        `Cada venta deja ${c.f.bs(c.r.dejaVenta)}: necesita ${c.f.corto(ventasNecesarias, 1)} ventas`,
        `Cerrando ${c.f.de100(c.r.cierre)}, le tienen que escribir ${c.f.entero(personas)} personas`,
        `${c.f.bs(c.r.presupuesto)} de presupuesto ÷ ${c.f.entero(personas)} personas = ${c.f.bs(c.r.maxConversacion)} por persona`,
      ];
    },
    sirve: 'Úsalo la primera semana: si cada conversación cuesta menos que esto, va bien. Si cuesta más, hay que arreglar antes de poner más plata.',
    mejorar: [
      'Sube el cierre: es lo que más mueve este número y no cuesta pauta.',
      'Sube lo que deja cada venta, con mejor precio o menor costo.',
      'Si el cliente vuelve a comprar, puede pagar más por la primera venta. Mira «Con los que vuelven».',
    ],
    prueba: 'cierre',
  };

  fichas.cierreMin = {
    titulo: 'Tiene que cerrar', tecnico: 'Tasa de cierre de equilibrio', pide: ['venta'],
    tituloLargo: 'Lo mínimo que tiene que cerrar para no perder',
    valor: (c) => (c.r.cierreMin <= 1 ? c.f.de100(c.r.cierreMin) : 'No alcanza'),
    sub: (c) => (c.r.cierreMin <= 1 ? `hoy cierra ${c.f.de100(c.r.cierre)}` : 'ni vendiéndole a todos'),
    estado: (c) => (c.r.cierre >= c.r.cierreMin ? 'bien' : 'mal'),
    queEs: 'De cada 100 personas que escriben, cuántas tienen que comprar como mínimo para no perder plata.',
    pasos: (c) => {
      const ventasNecesarias = c.r.costoTotal / c.r.dejaVenta;
      return [
        `Tiene que cubrir ${c.f.bs(c.r.costoTotal)} de ${c.r.honorarios > 0 ? 'anuncios y servicio' : 'anuncios'}`,
        `Cada venta deja ${c.f.bs(c.r.dejaVenta)}: necesita ${c.f.corto(ventasNecesarias, 1)} ventas`,
        `Le escriben ${c.f.entero(c.r.conversaciones)}: ${c.f.corto(ventasNecesarias, 1)} ÷ ${c.f.entero(c.r.conversaciones)} = ${c.f.de100(c.r.cierreMin)}`,
      ];
    },
    sirve: 'Si hoy cierra menos que esto, el problema no está en el anuncio: está en la conversación de WhatsApp.',
    mejorar: () => P.consejos.atender,
    prueba: 'costoConv',
  };

  fichas.costoCliente = {
    titulo: 'Cada cliente le cuesta', tecnico: 'CAC, costo de adquisición de cliente', pide: ['cierre'],
    valor: (c) => c.f.bs(c.r.costoCliente),
    sub: (c) => `y cada cliente deja ${c.f.bs(c.r.dejaVenta)}`,
    estado: (c) => (c.r.costoCliente <= c.r.dejaVenta ? 'bien' : 'mal'),
    queEs: 'Cuánto paga en total para conseguir un cliente nuevo con anuncios.',
    pasos: (c) => [
      'Todo lo que paga ÷ ventas',
      `${c.f.bs(c.r.costoTotal)} ÷ ${c.f.corto(c.r.ventas, 1)} = ${c.f.bs(c.r.costoCliente)}`,
      `Cada cliente deja ${c.f.bs(c.r.dejaVenta)}: ${c.r.costoCliente <= c.r.dejaVenta ? 'gana' : 'pierde'} ${c.f.bs(Math.abs(c.r.dejaVenta - c.r.costoCliente))} por cliente`,
    ],
    sirve: 'Compáralo con lo que deja un cliente. Si conseguirlo cuesta más de lo que deja, cada venta nueva es pérdida.',
    mejorar: () => P.consejos.palancas,
    prueba: 'cierre',
  };

  fichas.vuelve = {
    titulo: 'Por cada Bs 1 vuelven', tecnico: 'ROAS, retorno de la inversión en anuncios', pide: ['venta'],
    valor: (c) => c.f.bs(c.r.vuelve),
    sub: (c) => `necesita ${c.f.bs(c.r.vuelveMin)} para no perder`,
    estado: (c) => (c.r.vuelve >= c.r.vuelveMin ? 'bien' : 'mal'),
    queEs: 'Cuántos bolivianos vende por cada boliviano que pone en anuncios.',
    pasos: (c) => [
      'Lo que vende ÷ lo que paga de anuncios',
      `${c.f.bs(c.r.ingresos)} ÷ ${c.f.bs(c.r.pautaReal)} = ${c.f.corto(c.r.vuelve)}`,
      `De cada 100 Bs que vende le quedan ${c.f.corto(c.r.margenNeto * 100, 1)}. Por eso necesita que vuelvan al menos ${c.f.corto(c.r.vuelveMin)} para no perder`,
    ],
    sirve: 'Es el número que más se presume y el que más engaña. Un negocio al que le quedan 20 de cada 100 necesita que vuelvan 5 solo para empatar. Míralo siempre junto con lo que le queda.',
    mejorar: () => P.consejos.palancas,
    prueba: 'margen',
  };

  fichas.colchon = {
    titulo: 'Colchón', tecnico: 'Margen de seguridad', pide: ['venta', 'cierre'],
    valor: (c) => (c.r.colchon >= 0 ? c.f.pct(c.r.colchon) : 'Ninguno'),
    sub: (c) => (c.r.colchon >= 0 ? 'puede subir el costo sin perder' : `el costo tiene que bajar ${c.f.pct(-c.r.colchon)}`),
    estado: (c) => (c.r.colchon >= colchonSano() ? 'bien' : c.r.colchon >= 0 ? 'ojo' : 'mal'),
    queEs: 'Cuánto puede subir el costo por conversación antes de que empiece a perder plata.',
    pasos: (c) => [
      `Lo máximo que puede pagar por conversación: ${c.f.bs(c.r.maxConversacion)}`,
      `Lo que paga hoy: ${c.f.bs(c.d.costoConv)}`,
      c.r.colchon >= 0
        ? `${c.f.bs(c.r.maxConversacion)} ÷ ${c.f.bs(c.d.costoConv)} = ${c.f.corto(c.r.colchon + 1)}: aguanta una subida de ${c.f.pct(c.r.colchon)}`
        : `Hoy paga de más: el costo tiene que bajar ${c.f.pct(-c.r.colchon)} para empatar`,
    ],
    sirve: 'El costo de los anuncios sube y baja cada semana. Con poco colchón, una semana mala alcanza para perder. Esta calculadora pide 40% o más para decir que conviene.',
    mejorar: () => P.consejos.palancas,
    prueba: 'costoConv',
  };
})(typeof window !== 'undefined' ? window : globalThis);
