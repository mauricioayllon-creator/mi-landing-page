/* Calculadora de Pauta: las preguntas, sus ayudas y las mini cuentas para quien no sabe un número. */
(function (raiz) {
  'use strict';
  const P = (raiz.CalcPauta = raiz.CalcPauta || {});

  // Redondea a un número fácil de leer para las pruebas «qué pasa si…».
  function bonito(n) {
    if (n >= 2000) return Math.round(n / 100) * 100;
    if (n >= 200) return Math.round(n / 10) * 10;
    if (n >= 20) return Math.round(n);
    if (n >= 2) return Math.round(n * 2) / 2;
    return Math.round(n * 20) / 20;
  }
  const unicos = (lista) => lista.filter((x, i) => lista.findIndex((y) => Math.abs(y - x) < 1e-9) === i).sort((a, b) => a - b);
  const porFactores = (factores, tope) => (v) => unicos(
    factores.map((k) => (k === 1 ? v : bonito(v * k))).filter((x) => x > 0 && (!tope || x <= tope))
  );
  const porSumas = (sumas, min, max) => (v) => unicos(sumas.map((s) => v + s).filter((x) => x >= min && x <= max));

  const campos = {};

  campos.negocio = {
    tipo: 'texto',
    pregunta: '¿Cómo se llama el negocio?',
    pista: 'Opcional. Sale en el resumen que copias.',
    ejemplo: 'Tienda de ejemplo',
  };

  campos.ticket = {
    tipo: 'bs', antes: 'Bs',
    pregunta: '¿Cuánto paga un cliente en una compra normal?',
    pista: 'Una venta típica, no la más grande.',
    escenario: (v, f) => `Si cada venta fuera de ${f.bs(v)}`,
    variantes: porFactores([0.8, 1, 1.2, 1.5]),
    ayuda: {
      queEs: 'La plata que deja un cliente cada vez que compra. Si se lleva varias cosas juntas, cuenta todo lo que paga esa vez.',
      deDonde: [
        'Si vende una sola cosa, es su precio.',
        'Si vende varias, divide lo que vendió en un mes entre el número de ventas de ese mes.',
      ],
      mini: {
        a: '¿Cuánto vendió en un mes? (Bs)', b: '¿Cuántas ventas fueron?',
        cuenta: (a, b) => (b > 0 ? a / b : NaN),
        resultado: (x, f) => `Cada venta es de ${f.bs(x)}.`,
      },
    },
  };

  campos.margen = {
    tipo: 'pct', despues: 'de cada 100',
    pregunta: 'De cada 100 Bs que cobra, ¿cuántos le quedan?',
    pista: 'Después de pagar el producto o el material. Sin contar alquiler ni sueldos.',
    escenario: (v, f) => `Si le quedaran ${f.corto(v, 1)} de cada 100`,
    variantes: porSumas([-20, -10, 0, 10, 20], 5, 95),
    ayuda: {
      queEs: 'Lo que queda de una venta después de pagar lo que costó el producto. Si compra a 60 y vende a 100, le quedan 40 de cada 100.',
      deDonde: [
        'No cuentes alquiler, luz ni sueldos fijos: eso se paga igual, haya anuncios o no.',
        'Si factura, descuenta también los impuestos de la venta (IVA e IT).',
        'En servicios, cuenta el material y lo que se paga a quien hace el trabajo.',
      ],
      mini: {
        a: '¿A cuánto lo vende? (Bs)', b: '¿Cuánto le cuesta a él? (Bs)',
        cuenta: (a, b) => (a > 0 ? ((a - b) / a) * 100 : NaN),
        resultado: (x, f) => (x > 0 ? `Le quedan ${f.corto(x, 1)} de cada 100.` : 'Así vende a pérdida: revisa los números.'),
      },
    },
  };

  campos.presupuesto = {
    tipo: 'bs', antes: 'Bs', despues: 'al mes',
    pregunta: '¿Cuánto pone en anuncios al mes?',
    pista: 'Solo lo que se le paga a la plataforma (Meta, TikTok). Sin el servicio.',
    escenario: (v, f) => `Si pusiera ${f.bs(v)} al mes`,
    variantes: porFactores([0.5, 1, 1.5, 2, 3]),
    ayuda: {
      queEs: 'La plata que se le paga a la plataforma de anuncios en un mes.',
      deDonde: [
        'Si lo piensa por día, multiplícalo por 30.',
        'No pongas aquí lo que cobra quien maneja los anuncios: eso va en «Servicio».',
      ],
      mini: {
        a: '¿Cuánto por día? (Bs)',
        cuenta: (a) => a * 30,
        resultado: (x, f) => `Son ${f.bs(x)} al mes.`,
      },
    },
  };

  campos.costoConv = {
    tipo: 'bs', antes: 'Bs',
    pregunta: '¿Cuánto le cuesta cada persona que le escribe?',
    pista: 'Si nunca pautó, deja 5 y corrígelo con el dato de su primera semana.',
    escenario: (v, f) => `Si cada conversación costara ${f.bs(v)}`,
    variantes: porFactores([0.5, 0.75, 1, 1.25, 1.5, 2]),
    suposicion: { valor: 5, boton: 'Nunca pautó: usar Bs 5 por ahora' },
    ayuda: {
      queEs: 'Lo que cobra la plataforma, en promedio, por cada persona que abre el chat de WhatsApp desde un anuncio.',
      deDonde: [
        'En el administrador de anuncios: columna «Costo por resultado» de una campaña de mensajes.',
        'O haz la cuenta: lo que gastó dividido entre las personas que le escribieron.',
        'No hay un promedio oficial para Bolivia: cambia con el rubro, la ciudad y el anuncio. El número real sale en la primera semana.',
      ],
      mini: {
        a: '¿Cuánto gastó en anuncios? (Bs)', b: '¿Cuántas personas le escribieron?',
        cuenta: (a, b) => (b > 0 ? a / b : NaN),
        resultado: (x, f) => `Cada conversación le costó ${f.bs(x)}.`,
      },
    },
  };

  campos.cierre = {
    tipo: 'pct', despues: 'de cada 100',
    pregunta: 'De cada 100 que le escriben, ¿cuántos compran?',
    pista: 'Solo los que llegan por anuncios.',
    escenario: (v, f) => `Si cerrara ${f.corto(v, 1)} de cada 100`,
    variantes: porFactores([0.5, 1, 1.5, 2, 3], 100),
    suposicion: { valor: 5, boton: 'No lo sabe: usar 5 por ahora' },
    ayuda: {
      queEs: 'De todas las personas que escriben por un anuncio, cuántas terminan comprando.',
      deDonde: [
        'Cuenta una semana: cuántos escribieron por anuncios y cuántos compraron.',
        'No mezcles a los clientes de siempre ni a los recomendados: esos compran mucho más fácil.',
        'Si no lo sabe, empieza con 5 y mídelo la primera semana.',
      ],
      mini: {
        a: '¿Cuántos le escribieron?', b: '¿Cuántos compraron?',
        cuenta: (a, b) => (a > 0 ? (b / a) * 100 : NaN),
        resultado: (x, f) => `Cierra ${f.corto(x, 1)} de cada 100.`,
      },
    },
  };

  campos.honorarios = {
    tipo: 'bs', antes: 'Bs', despues: 'al mes',
    pregunta: '¿Cuánto paga por el servicio?',
    pista: 'Lo que cobra quien le hace el contenido y le maneja los anuncios. Si lo hace él mismo, déjalo vacío.',
    ayuda: {
      queEs: 'Lo que el negocio paga cada mes a la persona o agencia que le hace el contenido y le maneja los anuncios.',
      deDonde: [
        'Ponlo para ver el negocio completo: el dueño paga las dos cosas, los anuncios y el servicio.',
        'Si es un pago único por una campaña, pon ese monto y lee el resultado como «la campaña», no como «el mes».',
      ],
    },
  };

  campos.capacidad = {
    tipo: 'num', despues: 'por día',
    pregunta: '¿Cuántas conversaciones nuevas puede atender bien por día?',
    pista: 'Respondiendo en minutos, no en horas.',
    ayuda: {
      queEs: 'Cuántas personas nuevas puede atender por WhatsApp en un día sin dejar a nadie esperando.',
      deDonde: [
        'Pregúntale: «si hoy te escriben 20 personas nuevas, ¿alcanzas a responderles a todas en minutos?». Sube o baja el número hasta que diga que sí.',
        'Piensa quién responde y en qué horario. De noche y los domingos también escriben.',
      ],
    },
  };

  campos.recompras = {
    tipo: 'num', despues: 'veces',
    pregunta: '¿Cuántas veces compra el mismo cliente en 6 meses?',
    pista: 'Si compra una sola vez, deja 1.',
    escenario: (v, f) => `Si cada cliente comprara ${f.corto(v, 1)} ${f.plural(v, 'vez', 'veces')}`,
    variantes: (v) => unicos([1, 2, 3, 4, 6, v].filter((x) => x >= 1)),
    ayuda: {
      queEs: 'Cuántas veces vuelve a comprar un cliente que llegó por anuncios. Una heladería tiene clientes que vuelven seguido; quien vende un colchón, casi nunca.',
      deDonde: [
        'Si no lo sabe, deja 1: es lo más seguro.',
        'Cuenta solo lo que ya pasa hoy, no lo que te gustaría que pase.',
      ],
    },
  };

  campos.comision = {
    tipo: 'pct', despues: 'de cada 100',
    pregunta: '¿Se le va algo más en cada venta?',
    pista: 'Comisión del vendedor, envío que regala, cobro con tarjeta o QR.',
    ayuda: {
      queEs: 'Plata que sale en cada venta además del costo del producto.',
      deDonde: [
        'Si le paga comisión a quien vende, ponla aquí.',
        'Si regala el envío, calcula cuánto es contra el precio: un envío de Bs 15 en una venta de Bs 300 son 5 de cada 100.',
      ],
      mini: {
        a: '¿Cuánto se le va en una venta? (Bs)', b: '¿De cuánto es esa venta? (Bs)',
        cuenta: (a, b) => (b > 0 ? (a / b) * 100 : NaN),
        resultado: (x, f) => `Se le van ${f.corto(x, 1)} de cada 100.`,
      },
    },
  };

  campos.recargo = {
    tipo: 'pct', despues: 'de cada 100',
    pregunta: '¿Cuánto más le cobra el banco por los anuncios?',
    pista: 'Comisión de la tarjeta e impuestos. Si no sabes, déjalo vacío.',
    ayuda: {
      queEs: 'Los anuncios se cobran en dólares. El banco puede sumar una comisión por comprar en el exterior y puede haber impuestos. Por eso a veces sale de la cuenta más plata de la que dice la plataforma.',
      deDonde: ['Mira el extracto de la tarjeta: lo que te debitaron contra lo que dice la plataforma que gastaste.'],
      mini: {
        a: '¿Cuánto debitó el banco? (Bs)', b: '¿Cuánto dice la plataforma? (Bs)',
        cuenta: (a, b) => (b > 0 ? (a / b - 1) * 100 : NaN),
        resultado: (x, f) => (x >= 0 ? `El recargo es de ${f.corto(x, 1)} de cada 100.` : 'El banco debitó menos de lo que dice la plataforma: revisa los números.'),
      },
    },
  };

  campos.meta = {
    tipo: 'bs', antes: 'Bs', despues: 'al mes',
    pregunta: '¿Cuánto quiere ganar con los anuncios?',
    pista: 'Limpio: después de pagar el producto, los anuncios y el servicio.',
    ayuda: {
      queEs: 'La ganancia que el dueño quiere sacar cada mes gracias a los anuncios.',
      deDonde: [
        'Pregúntale: «¿cuánto tendría que quedarte al mes para decir que valió la pena?».',
        'Con ese número te digo cuánto tendría que poner o cuánto mejor tendría que vender.',
      ],
    },
  };

  campos.tipoCambio = {
    tipo: 'bs', antes: 'Bs', despues: 'por dólar',
    pregunta: '¿A cuánto le cobra el dólar su tarjeta?',
    pista: 'Cambia seguido. Sirve para ver el presupuesto en dólares.',
    ayuda: {
      queEs: 'Los anuncios se pagan en dólares con tarjeta, y el banco usa el tipo de cambio del día.',
      deDonde: ['Míralo en el último cobro de la tarjeta o en la página del Banco Central de Bolivia.'],
    },
  };

  P.campos = campos;
  P.grupos = [
    { id: 'negocio', titulo: 'El negocio', campos: ['negocio', 'ticket', 'margen'] },
    { id: 'anuncios', titulo: 'Los anuncios', campos: ['presupuesto', 'costoConv', 'cierre'] },
    { id: 'ciegos', titulo: 'Lo que casi nadie cuenta', nota: 'Opcional, pero cambia el resultado.', plegable: true, campos: ['honorarios', 'capacidad', 'recompras', 'comision', 'recargo'] },
    { id: 'meta', titulo: 'Su meta', campos: ['meta'] },
    { id: 'ajustes', titulo: 'Ajustes', plegable: true, campos: ['tipoCambio'] },
  ];
  // Las 5 preguntas de la guía paso a paso: con esto ya hay veredicto.
  P.pasosGuia = ['ticket', 'margen', 'presupuesto', 'costoConv', 'cierre'];
})(typeof window !== 'undefined' ? window : globalThis);
