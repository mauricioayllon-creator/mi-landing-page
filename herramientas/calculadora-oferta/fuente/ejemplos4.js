/*EJEMPLOS-INICIO*/
function lineaBase(extra) {
  return { id: 'n' + Math.random().toString(36).slice(2, 8), nombre: '', facturacion: '', margen: '', tipo: 'repetida', ticket: '', vidaMeses: '', comprasAnio: '', aniosCliente: '', cicloDias: '', tipoVenta: 'b2cAlto', competencia: 'media', capacidad: 'media', abrePuertas: false, ventaCruzadaPct: '', ventaCruzadaGanancia: '', ...(extra || {}) };
}
function bonoBase(extra) { return { nombre: '', costo: '', valor: '', ...(extra || {}) }; }
function segmentoBase(extra) { return { nombre: '', cuantos: '', compraAnio: '', margen: '', paga: 'atiempo', lio: 'normal', ...(extra || {}) }; }
function ofertaVacia() {
  return { activa: false, lineaId: '', usarEnCuenta: false, deseo: '', tiempo: '', precio: '', valorProducto: '', bonos: [], garantia: 'ninguna', usoGarantia: 5, urgencia: 'ninguna', pago: 'contado', segmentos: [] };
}
function anunciosVacios() {
  return { plataforma: 'tiktok', objetivo: 'auto', alcance: 'auto', tc: '', cupon: true, costoResultadoReal: '', cpmReal: '' };
}
function prospectoVacio() {
  return {
    negocio: { nombre: '', rubro: '', ciudad: '', facturacion: '', gastosFijos: '', caja: '', temporadaAlta: '', cobroDias: '' },
    meta: { tipo: 'aumento', valor: '', plazo: '', diasMes: '', presupuestoTotal: '', paciencia: '' },
    lineas: [lineaBase()],
    foco: 'auto',
    hoy: { numerosDe: 'linea', interesadosMes: '', clientesMes: '', respuesta: 'nose', seguimiento: 'nose', diasPropuesta: '', quienVende: 'dueno', viejos: '', pautaMes: '', ventasPautaMes: '', quienPauta: 'nadie', equipoContenido: false, contenidoPrueba: 'poco', mide: '' },
    servicio: { modo: 'auto', contenido: 'auto', campanas: 'auto', guia: 'auto', automatizacion: 'auto', presupuesto: '' },
    compromiso: { tiempo: true, aplicaGuia: true, aprueba: true, pagaPublicidad: true, pagoTarjeta: '' },
    capacidad: { actuales: '', maxHoy: '', contrataria: '', porPersona: '', mesesContratar: '', mensajesDia: '', mercado: '' },
    oferta: ofertaVacia(),
    anuncios: anunciosVacios(),
    supuestos: supuestosBase(),
    plan: { duracionManual: '', herramientas: '', inicial: '', ahorro: '' },
    rangos: {},
    escenarioDatos: 'normal',
    fuentes: {},
    respuestas: {},
  };
}
function ejemploBrisa() {
  const p = prospectoVacio();
  p.negocio = { nombre: 'Brisa Técnica SRL', rubro: 'Instalación y mantenimiento de aire acondicionado para empresas', ciudad: 'Santa Cruz de la Sierra', facturacion: 380000, gastosFijos: 80000, caja: '', temporadaAlta: '9', cobroDias: 30 };
  p.meta = { tipo: 'aumento', valor: 40000, plazo: 8, diasMes: 24, presupuestoTotal: 18000, paciencia: 4 };
  p.lineas = [
    lineaBase({ id: 'l1', nombre: 'Proyectos de instalación', facturacion: 228000, margen: 22, tipo: 'unica', ticket: 120000, cicloDias: 75, tipoVenta: 'b2b', competencia: 'media', capacidad: 'media' }),
    lineaBase({ id: 'l2', nombre: 'Contratos de mantenimiento', facturacion: 75600, margen: 45, tipo: 'recurrente', ticket: 4300, vidaMeses: 36, cicloDias: 35, tipoVenta: 'b2b', competencia: 'media', capacidad: 'mucha', abrePuertas: true, ventaCruzadaPct: 30, ventaCruzadaGanancia: 26400 }),
    lineaBase({ id: 'l3', nombre: 'Reparaciones de emergencia', facturacion: 76000, margen: 35, tipo: 'repetida', ticket: 1500, comprasAnio: 2, aniosCliente: 2, cicloDias: 2, tipoVenta: 'b2b', competencia: 'alta', capacidad: 'media', abrePuertas: true }),
  ];
  p.hoy = { numerosDe: 'linea', interesadosMes: 120, clientesMes: 1, respuesta: 'dia', seguimiento: 'nunca', diasPropuesta: 7, quienVende: 'dueno', viejos: 47, pautaMes: 1500, ventasPautaMes: 0, quienPauta: 'agencia', equipoContenido: false, contenidoPrueba: 'poco', mide: 'no' };
  p.servicio.presupuesto = 6500;
  p.compromiso.pagoTarjeta = 'si';
  p.anuncios = { ...anunciosVacios(), plataforma: 'meta' };
  p.capacidad = { actuales: 18, maxHoy: 26, contrataria: 1, porPersona: 10, mesesContratar: 2, mensajesDia: 10, mercado: 220 };
  p.plan = { duracionManual: '', herramientas: 1000, inicial: 4000, ahorro: 3500 };
  p.rangos = { 'linea:l2:vidaMeses': { min: 24, max: 48 }, 'hoy.interesadosMes': { min: 90, max: 150 } };
  p.oferta = {
    ...ofertaVacia(), activa: true, lineaId: 'l2', usarEnCuenta: false,
    deseo: 'que el aire de su empresa no falle en pleno calor', tiempo: 'técnico en su empresa en menos de 4 horas',
    bonos: [bonoBase({ nombre: 'Revisión completa de todos sus equipos al empezar', costo: 600, valor: 2500 }), bonoBase({ nombre: 'Informe mensual del estado de cada equipo', costo: 100, valor: 800 }), bonoBase({ nombre: 'Prioridad en emergencias, también fines de semana', costo: 200, valor: 1500 })],
    garantia: 'repetir', usoGarantia: 5, urgencia: 'temporada', pago: 'mensual',
    segmentos: [
      segmentoBase({ nombre: 'Clínicas y laboratorios', cuantos: 6, compraAnio: 60000, margen: 45, paga: 'atiempo', lio: 'poco' }),
      segmentoBase({ nombre: 'Oficinas de empresas grandes', cuantos: 8, compraAnio: 45000, margen: 45, paga: 'tarde', lio: 'normal' }),
      segmentoBase({ nombre: 'Restaurantes', cuantos: 4, compraAnio: 25000, margen: 35, paga: 'tarde', lio: 'mucho' }),
      segmentoBase({ nombre: 'Hoteles', cuantos: 3, compraAnio: 70000, margen: 40, paga: 'atiempo', lio: 'normal' }),
    ],
  };
  return p;
}
function ejemploCafe() {
  const p = prospectoVacio();
  p.negocio = { nombre: 'Café La Esquina', rubro: 'Cafetería de barrio con pastelería', ciudad: 'Cochabamba', facturacion: 48000, gastosFijos: 25000, caja: 15000, temporadaAlta: '', cobroDias: 0 };
  p.meta = { tipo: 'ganancia', valor: 8000, plazo: 6, diasMes: 30, presupuestoTotal: 3000, paciencia: 2 };
  p.lineas = [
    lineaBase({ id: 'c1', nombre: 'Café y pastelería en el local', facturacion: 36000, margen: 65, tipo: 'repetida', ticket: 32, comprasAnio: 10, aniosCliente: 1.5, cicloDias: 0, tipoVenta: 'b2cBajo', competencia: 'alta', capacidad: 'media', abrePuertas: true }),
    lineaBase({ id: 'c2', nombre: 'Tortas por encargo', facturacion: 8000, margen: 55, tipo: 'repetida', ticket: 280, comprasAnio: 3, aniosCliente: 2, cicloDias: 7, tipoVenta: 'b2cAlto', competencia: 'media', capacidad: 'mucha' }),
    lineaBase({ id: 'c3', nombre: 'Desayunos y coffee break para oficinas', facturacion: 4000, margen: 50, tipo: 'repetida', ticket: 1800, comprasAnio: 6, aniosCliente: 2, cicloDias: 14, tipoVenta: 'b2b', competencia: 'baja', capacidad: 'mucha', abrePuertas: true }),
  ];
  p.hoy = { numerosDe: 'linea', interesadosMes: '', clientesMes: '', respuesta: 'hora', seguimiento: 'nunca', diasPropuesta: 2, quienVende: 'dueno', viejos: '', pautaMes: '', ventasPautaMes: '', quienPauta: 'nadie', equipoContenido: false, contenidoPrueba: 'poco', mide: 'no' };
  p.compromiso.pagoTarjeta = 'nose';
  p.capacidad = { actuales: 3, maxHoy: 12, contrataria: '', porPersona: '', mesesContratar: '', mensajesDia: 20, mercado: 400 };
  p.plan = { duracionManual: '', herramientas: 300, inicial: 1000, ahorro: '' };
  p.oferta = {
    ...ofertaVacia(), activa: true, lineaId: 'c3', usarEnCuenta: false,
    deseo: 'que su equipo tenga desayuno rico sin que nadie se ocupe', tiempo: 'listo cada lunes a las 8',
    bonos: [bonoBase({ nombre: 'Un desayuno de prueba para 10 personas', costo: 150, valor: 450 }), bonoBase({ nombre: 'Torta gratis en el cumpleaños de cada empleado', costo: 60, valor: 280 })],
    garantia: 'devolucion', usoGarantia: 3, urgencia: 'cupos', pago: 'mensual',
    segmentos: [
      segmentoBase({ nombre: 'Oficinas de 10 a 40 personas', cuantos: 2, compraAnio: 10800, margen: 50, paga: 'tarde', lio: 'poco' }),
      segmentoBase({ nombre: 'Vecinos que vienen cada semana', cuantos: 120, compraAnio: 320, margen: 65, paga: 'atiempo', lio: 'poco' }),
      segmentoBase({ nombre: 'Estudiantes de paso', cuantos: 200, compraAnio: 90, margen: 60, paga: 'atiempo', lio: 'normal' }),
    ],
  };
  return p;
}
function ejemploJoyeria() {
  const p = prospectoVacio();
  p.negocio = { nombre: 'Joyería Aurora', rubro: 'Joyería de plata y oro, tienda física e Instagram', ciudad: 'La Paz', facturacion: 120000, gastosFijos: 45000, caja: 40000, temporadaAlta: '12', cobroDias: 0 };
  p.meta = { tipo: 'aumento', valor: 30000, plazo: 6, diasMes: 26, presupuestoTotal: 12000, paciencia: 3 };
  p.lineas = [
    lineaBase({ id: 'j1', nombre: 'Joyas de plata y oro', facturacion: 84000, margen: 55, tipo: 'repetida', ticket: 650, comprasAnio: 1.5, aniosCliente: 3, cicloDias: 4, tipoVenta: 'b2cAlto', competencia: 'alta', capacidad: 'mucha', abrePuertas: true }),
    lineaBase({ id: 'j2', nombre: 'Anillos de compromiso y aros de matrimonio', facturacion: 27000, margen: 45, tipo: 'unica', ticket: 4500, cicloDias: 21, tipoVenta: 'b2cAlto', competencia: 'media', capacidad: 'mucha', abrePuertas: true, ventaCruzadaPct: 40, ventaCruzadaGanancia: 700 }),
    lineaBase({ id: 'j3', nombre: 'Regalos corporativos', facturacion: 9000, margen: 40, tipo: 'repetida', ticket: 9000, comprasAnio: 1, aniosCliente: 3, cicloDias: 30, tipoVenta: 'b2b', competencia: 'baja', capacidad: 'media' }),
  ];
  p.hoy = { numerosDe: 'negocio', interesadosMes: 300, clientesMes: 70, respuesta: 'hora', seguimiento: 'aveces', diasPropuesta: '', quienVende: 'equipo', viejos: 60, pautaMes: 6000, ventasPautaMes: 25, quienPauta: 'dueno', equipoContenido: true, contenidoPrueba: 'bastante', mide: 'aveces' };
  p.compromiso.pagoTarjeta = 'si';
  p.anuncios = { ...anunciosVacios(), plataforma: 'meta' };
  p.capacidad = { actuales: 130, maxHoy: 200, contrataria: 1, porPersona: 60, mesesContratar: 1, mensajesDia: 25, mercado: '' };
  p.plan = { duracionManual: '', herramientas: 300, inicial: '', ahorro: '' };
  p.oferta = {
    ...ofertaVacia(), activa: true, lineaId: 'j2', usarEnCuenta: false,
    deseo: 'pedir la mano con el anillo perfecto, sin miedo a equivocarse de talla ni de gusto', tiempo: 'listo en 7 días',
    bonos: [bonoBase({ nombre: 'Grabado con su fecha o sus nombres', costo: 40, valor: 250 }), bonoBase({ nombre: 'Cambio de talla gratis para siempre', costo: 60, valor: 300 }), bonoBase({ nombre: 'Asesoría para la pedida (lugar, momento, fotos)', costo: 100, valor: 600 })],
    garantia: 'repetir', usoGarantia: 4, urgencia: 'cupos', pago: 'cuotas',
    segmentos: [
      segmentoBase({ nombre: 'Parejas que se van a casar', cuantos: 6, compraAnio: 5200, margen: 45, paga: 'atiempo', lio: 'normal' }),
      segmentoBase({ nombre: 'Mujeres que se regalan joyas', cuantos: 50, compraAnio: 975, margen: 55, paga: 'atiempo', lio: 'poco' }),
      segmentoBase({ nombre: 'Empresas que regalan a su equipo', cuantos: 1, compraAnio: 9000, margen: 40, paga: 'tarde', lio: 'normal' }),
    ],
  };
  return p;
}
// ----- Joyerías en el mínimo que puedes aceptar (precio Bs 2.200, anuncios desde Bs 500) -----
function ejemploMinimoBase(o) {
  const p = prospectoVacio();
  p.negocio = { nombre: o.nombre, rubro: o.rubro, ciudad: 'La Paz', facturacion: o.fact, gastosFijos: o.gastos, caja: o.caja, temporadaAlta: '', cobroDias: o.cobro || 0 };
  p.lineas = [lineaBase({ id: 'm1', nombre: o.linea, facturacion: o.fact, margen: o.margen, tipo: o.tipo, ticket: o.ticket, comprasAnio: o.ppy || '', aniosCliente: o.anios || '', cicloDias: o.ciclo, tipoVenta: o.tv, competencia: 'media', capacidad: 'mucha' })];
  p.hoy = { numerosDe: 'linea', interesadosMes: o.inter, clientesMes: o.cli, respuesta: 'hora', seguimiento: 'aveces', diasPropuesta: 1, quienVende: 'dueno', viejos: '', pautaMes: '', ventasPautaMes: '', quienPauta: 'nadie', equipoContenido: false, contenidoPrueba: 'poco', mide: 'si' };
  p.servicio.presupuesto = o.ads;
  p.compromiso.pagoTarjeta = 'si';
  p.capacidad = { actuales: o.cap[0], maxHoy: o.cap[1], contrataria: '', porPersona: '', mesesContratar: '', mensajesDia: 30, mercado: '' };
  return p;
}
function ejemploMinPlata() {
  return ejemploMinimoBase({ nombre: 'Joyería mínima 1: plata del día a día', rubro: 'Aretes, cadenas y anillos de plata; tienda chica e Instagram', linea: 'Joyas de plata', fact: 18000, gastos: 8100, caja: 6000, margen: 60, tipo: 'repetida', ticket: 220, ppy: 4, anios: 2, ciclo: 2, tv: 'b2cBajo', inter: 345, cli: 29, ads: 500, cap: [82, 164] });
}
function ejemploMinAnillos() {
  return ejemploMinimoBase({ nombre: 'Joyería mínima 2: anillos de compromiso', rubro: 'Anillos de compromiso y aros de matrimonio a pedido', linea: 'Anillos de compromiso', fact: 23000, gastos: 7800, caja: 6000, margen: 45, tipo: 'unica', ticket: 4500, ciclo: 21, tv: 'b2cAlto', inter: 130, cli: 5, ads: 1250, cap: [5, 10] });
}
function ejemploMinEmpresas() {
  return ejemploMinimoBase({ nombre: 'Joyería mínima 3: regalos para empresas', rubro: 'Joyas y detalles grabados para regalos de empresas', linea: 'Regalos para empresas', fact: 38000, gastos: 11400, caja: 23000, margen: 40, tipo: 'repetida', ticket: 6000, ppy: 3, anios: 3, ciclo: 30, tv: 'b2b', cobro: 30, inter: 65, cli: 2, ads: 3500, cap: [6, 13] });
}
/*EJEMPLOS-FIN*/
