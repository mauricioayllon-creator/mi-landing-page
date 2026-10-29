/**
 * Tu método dentro de tu panel. Arma cada cliente desde tu sistema (sistema.js), te dice paso a paso qué hacer
 * y qué decir con el WhatsApp ya escrito, lleva el camino de tus prospectos y tu semana, lee los números
 * de cada video y pone al día a los clientes que se armaron con un método viejo.
 * Solo lo carga tu panel (admin.html), después de logica.js y sistema.js. Las pruebas lo cargan con require.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear(require("./logica.js"), require("./sistema.js"));
  else crear(raiz.GB, raiz.SISTEMA);
})(this, function (GB, SIS) {
  "use strict";
  var sumarDias = GB.sumarDias, cuando = GB.cuando, minus = GB.minus, bs = GB.bs, nuevoId = GB.nuevoId, primerNombre = GB.primerNombre;

  // ---------- utilidades ----------
  function entero(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  /**
   * Llena las variables {nombre}, {N}… Lo que va entre [[ ]] se borra si le falta alguna variable.
   * Una variable vacía fuera de [[ ]] queda a la vista como [nombre], para que la completes.
   */
  function rellenar(texto, v) {
    v = v || {};
    var lleno = function (k) { var x = v[k]; return x !== undefined && x !== null && String(x) !== ""; };
    var t = String(texto || "").replace(/\[\[([\s\S]*?)\]\]/g, function (_, dentro) {
      var falta = (dentro.match(/\{(\w+)\}/g) || []).some(function (m) { return !lleno(m.slice(1, -1)); });
      return falta ? "" : dentro;
    });
    return t.replace(/\{(\w+)\}/g, function (m, k) { return lleno(k) ? String(v[k]) : "[" + k + "]"; });
  }
  /** Una fecha de tu sistema: "S+1" (desde el cobro), "K-14" (desde la fecha clave), "@aire+3" (desde otro paso). Una lista = la más tarde. */
  function evaluarFecha(expr, ctx) {
    var mejor = "";
    (Array.isArray(expr) ? expr : [expr]).forEach(function (t) {
      var m = String(t || "").match(/^(S|K|@([a-z0-9]+))([+-]\d+)?$/);
      if (!m) return;
      var base = m[1] === "S" ? ctx.S : m[1] === "K" ? ctx.K : ctx.claves[m[2]];
      if (!base) return;
      var f = m[3] ? sumarDias(base, parseInt(m[3], 10)) : base;
      if (!mejor || f > mejor) mejor = f;
    });
    return mejor;
  }
  /** Las casillas de una lista de pasos, guardadas como "1011". */
  function marcado(bits, i) { return String(bits || "").charAt(i) === "1"; }
  function alternarBit(bits, i) {
    var a = String(bits || "").split("");
    while (a.length <= i) a.push("0");
    a[i] = a[i] === "1" ? "0" : "1";
    return a.join("").replace(/0+$/, "");
  }

  // ---------- la garantía ----------
  /** Su número: lo que pone (tu servicio + su publicidad) ÷ lo que le deja una venta, hacia arriba. En tenis: 3.000 ÷ 200 = 15. */
  function numeroGarantia(inversion, ganancia) { inversion = entero(inversion); ganancia = entero(ganancia); return inversion > 0 && ganancia > 0 ? Math.ceil(inversion / ganancia) : 0; }
  function condicionGarantia(n) { return n > 0 ? rellenar(SIS.plantillas.lanzamiento.condicion, { N: n }) : "cuando te lleguen los clientes de tu número (lo vemos en la sesión de arranque)"; }
  /** Cambias lo que puso o lo que le deja una venta: se recalcula su número y la condición de la segunda mitad. */
  function ponerGarantia(p, cambios) {
    var g = p.garantia || (p.garantia = { n: 0, inversion: 0, ganancia: 0, llegaron: 0, al: "" });
    if (cambios.inversion != null) g.inversion = Math.max(0, entero(cambios.inversion));
    if (cambios.ganancia != null) g.ganancia = Math.max(0, entero(cambios.ganancia));
    if (cambios.llegaron != null) g.llegaron = Math.max(0, entero(cambios.llegaron));
    g.n = numeroGarantia(g.inversion, g.ganancia);
    (p.pagos || []).forEach(function (x) { if (x.garantia) x.condicion = condicionGarantia(g.n); });
    marcarLista(g, cambios.ahora);
    return g.n;
  }
  /** El día que llega a su número (una sola vez). */
  function marcarLista(g, ahora) { if (ahora && g.n > 0 && g.llegaron >= g.n && !g.listaEl) g.listaEl = ahora; }
  /** Si su número pasa el tope de tu garantía, el producto de la promo deja poco: se elige otro antes de ofrecerla. */
  function topeGarantia(n) { var T = SIS.garantia.topeN; return { tope: T, pasa: n > T, texto: n > T ? SIS.garantia.topeTexto : "" };
  }

  // ---------- armar un cliente desde tu sistema ----------
  var PLANTILLAS = SIS.plantillas;
  /**
   * Arma un proyecto completo desde una plantilla de tu sistema.
   * d = { negocio, contacto, celular, inicio, fechaClave, videos, total, pagado, condicion, venceSaldo, pauta, ganancia, objetivo }
   */
  function armarProyecto(tipo, d, ahora) {
    if (!PLANTILLAS[tipo]) tipo = "blanco";
    var pl = PLANTILLAS[tipo], S = d.inicio, K = d.fechaClave || "";
    if (tipo === "lanzamiento") K = K || sumarDias(S, 21);
    if (tipo === "alcance") K = GB.maxFecha(K || sumarDias(S, 7), sumarDias(S, 7));
    var n = d.videos == null || d.videos === "" ? pl.videos : Math.max(0, Math.min(30, entero(d.videos)));

    // Los pasos, con sus fechas. Las fechas nunca van para atrás: si la fecha clave está muy cerca, todo se corre.
    var ctx = { S: S, K: K, claves: {} };
    var pasos = pl.pasos.map(function (x) {
      var f = evaluarFecha(x.fecha, ctx);
      ctx.claves[x.clave] = f;
      return { id: nuevoId(), clave: x.clave, nombre: x.nombre, detalle: x.detalle || "", para: x.para || "", yo: x.yo || "", fecha: f, estado: "pendiente", hechoEl: "" };
    });
    for (var i = 1; i < pasos.length; i++) if (pasos[i].fecha && pasos[i - 1].fecha && pasos[i].fecha < pasos[i - 1].fecha) pasos[i].fecha = pasos[i - 1].fecha;
    pasos[0].estado = "listo"; pasos[0].hechoEl = ahora;
    var porClave = {};
    pasos.forEach(function (s) { porClave[s.clave] = s; ctx.claves[s.clave] = s.fecha; });
    if (tipo === "mensual") K = porClave.resultados ? porClave.resultados.fecha : K;

    var tareas = pl.tareas.map(function (t) {
      return { id: nuevoId(), clave: t.clave, nombre: t.nombre, porque: t.porque || "", como: t.como || "", fecha: evaluarFecha(t.fecha, ctx), estado: "pendiente", confirmadoEl: "", paso: porClave[t.paso] ? porClave[t.paso].id : "" };
    });

    // Los videos: con cuerpos y ganchos, cada pieza es "El dolor · gancho 1" y en el cupón es V1; si no, "Video 1"
    var videos = [], G = (pl.ganchos || []).length;
    for (var v = 0; v < n; v++) {
      var c = G ? Math.floor(v / G) : -1, g = G ? v % G : -1, cuerpo = c >= 0 && pl.cuerpos && pl.cuerpos[c];
      videos.push({
        id: nuevoId(), titulo: cuerpo ? cuerpo.nombre + " · " + pl.ganchos[g] : "Video " + (v + 1), estado: "guion", version: 1, previa: "", descarga: "", texto: "",
        fechaPub: "", publicado: "", cambiadoEl: "", cuerpo: cuerpo ? c + 1 : 0, gancho: cuerpo ? g + 1 : 0, origen: G ? "V" + (v + 1) : "", pasada: 0, n: {}
      });
    }

    // Los pagos y la garantía
    var total = Math.max(0, entero(d.total)), pagado = Math.min(total || Infinity, Math.max(0, entero(d.pagado)));
    // Sus 5 cosas van en su proyecto: así su link las muestra sin cargar tu sistema
    var pagos = [], garantia = { n: 0, inversion: 0, ganancia: 0, llegaron: 0, al: "", condiciones: pl.pago === "mitades" ? SIS.garantia.condiciones.slice() : [] };
    var pago = function (concepto, monto, vence, estado, paso, extra) {
      pagos.push(Object.assign({ id: nuevoId(), concepto: concepto, monto: monto, vence: vence || "", condicion: "", estado: estado, pagadoEl: estado === "pagado" ? ahora : "", paso: paso ? paso.id : "" }, extra || {}));
    };
    if (pl.pago === "mitades") {
      garantia.inversion = total + (entero(d.pauta) || SIS.precio.pautaMin);
      garantia.ganancia = Math.max(0, entero(d.ganancia));
      garantia.n = numeroGarantia(garantia.inversion, garantia.ganancia);
      if (total > 0 && pagado >= total) pago("Pago completo", total, S, "pagado", porClave.cobro);
      else if (total > 0) {
        var primera = pagado > 0 ? pagado : Math.round(total / 2);
        pago("Primera mitad", primera, S, pagado > 0 ? "pagado" : "pendiente", porClave.cobro);
        // La segunda mitad: cuando lleguen sus N clientes. Vence el último día de canje solo si no cumplió sus 5 cosas.
        pago("Segunda mitad", total - primera, K, "pendiente", porClave.resultados, { condicion: condicionGarantia(garantia.n), garantia: true });
      }
    } else if (pl.pago === "mes") {
      var mes = total || pagado || SIS.precio.mensual;
      pago("Este mes", mes, S, pagado > 0 ? "pagado" : "pendiente", porClave.mes);
      pago("Tu próximo mes", mes, sumarDias(S, 28), "pendiente", porClave.resultados, { condicion: pl.condicion });
    } else {
      var primerVideo = GB.fechaPrimerVideo({ pasos: pasos });
      if (pagado > 0) pago(pagado >= total ? "Pago completo" : "Primer pago", pagado, S, "pagado", null);
      if (total > pagado) pago("Saldo", total - pagado, d.venceSaldo || primerVideo || "", "pendiente", null, { condicion: d.condicion != null ? d.condicion : pl.condicion });
    }

    var objetivo = d.objetivo || "";
    if (!objetivo && tipo === "lanzamiento" && garantia.n) objetivo = "Que te lleguen tus " + garantia.n + " clientes con su cupón el " + GB.diaLargo(K) + ", sin bajar tu precio.";

    return GB.vincular({
      metodo: SIS.version,
      negocio: d.negocio || "", contacto: d.contacto || "", celular: d.celular || "", tipo: tipo,
      etiqueta: pl.etiqueta, inicio: S, fechaClave: K, fechaClaveNombre: pl.fechaClaveNombre,
      objetivo: objetivo, bienvenida: SIS.bienvenida, queEsperar: pl.queEsperar,
      incluye: pl.incluye.map(function (x) { return x.replace("{n}", n || "Los"); }),
      pasos: pasos, tareas: tareas, videos: videos, pagos: pagos,
      resultados: pl.resultados.map(function (x) { return { id: nuevoId(), nombre: x, valor: "", antes: "", nota: "" }; }),
      resultadosFecha: "", garantia: garantia, interno: { cupon: { n: "", t: "" }, check: {}, notas: "" }, historial: []
    });
  }

  // ---------- la guía de cada paso: qué haces, qué dices, el WhatsApp y cuándo está listo ----------
  /** La definición de un paso en tu sistema: por su clave en su plantilla; si no, por lo que es (un paso que agregaste a mano). */
  function pasoDelSistema(tipo, s) {
    var buscar = function (pl, fn) { return pl ? pl.pasos.find(fn) : null; };
    var pl = PLANTILLAS[tipo];
    var def = s.clave ? buscar(pl, function (x) { return x.clave === s.clave; }) : null;
    if (!def && s.clave) Object.keys(PLANTILLAS).some(function (k) { def = buscar(PLANTILLAS[k], function (x) { return x.clave === s.clave; }); return !!def; });
    if (!def) { var cl = GB.clasePaso(s); def = buscar(pl, function (x) { return GB.CLAVE_CLASE[x.clave] === cl; }) || buscar(PLANTILLAS.lanzamiento, function (x) { return GB.CLAVE_CLASE[x.clave] === cl; }); }
    return def || null;
  }
  /** Las variables de un cliente para los mensajes y las guías. */
  function varsCliente(c, link, aj, hoy) {
    var p = (c && c.proyecto) || {}, gar = GB.estadoGarantia(p), n = primerNombre(p.contacto);
    var segunda = (p.pagos || []).find(function (x) { return x.garantia; }), primera = (p.pagos || []).find(function (x) { return /primera mitad/i.test(x.concepto); });
    return {
      saludo: "Hola" + (n ? " " + n : "") + ",", nombre: n, negocio: p.negocio || "", link: link || "", etiqueta: minus(p.etiqueta || "tu proyecto"),
      hora: (aj && aj.horaParte) || "", fecha: p.fechaClave ? GB.diaLargo(p.fechaClave) : "",
      N: gar ? gar.n : "", llegaron: gar ? gar.llegaron : "", falta: gar ? gar.falta : "",
      visita15: gar && gar.visita15 ? GB.diaLargo(gar.visita15.slice(0, 10)) + " a las " + gar.visita15.slice(11, 16) : "",
      primera: bs(primera ? primera.monto : SIS.precio.primera), segunda: bs(segunda ? segunda.monto : SIS.precio.segunda),
      miNombre: aj && aj.nombre ? primerNombre(aj.nombre) : ""
    };
  }
  function llenarGuia(base, v, extra) {
    if (!base) return null;
    var f = function (t) { return rellenar(t, v); };
    var g = base.guia || base;
    return Object.assign({
      titulo: base.nombre || base.titulo || "", que: f(g.que), como: (g.como || []).map(f), dices: (g.dices || []).map(f), wa: g.wa || "",
      listo: f(g.listo || ""), numero: g.numero ? { que: f(g.numero.que), vara: f(g.numero.vara) } : null,
      fuente: g.fuente || "", ver: g.ver || "", nota: f(g.nota || "")
    }, extra || {});
  }
  /** La guía del paso de un cliente, con sus datos ya puestos. Las casillas se guardan en interno.check[clave]. */
  function guiaPaso(c, pasoId, link, aj, hoy) {
    var p = c.proyecto, s = (p.pasos || []).find(function (x) { return x.id === pasoId; });
    if (!s) return null;
    var def = pasoDelSistema(p.tipo, s);
    var v = varsCliente(c, link, aj, hoy);
    if (!def) return { titulo: s.nombre, que: s.detalle || "", como: [], dices: [], wa: "", listo: "", numero: null, fuente: "", ver: "", nota: "", paso: s, clave: "" };
    return llenarGuia(def, v, { titulo: s.nombre, paso: s, clave: s.clave || def.clave, checks: (p.interno && p.interno.check && p.interno.check[s.clave || def.clave]) || "" });
  }
  /** Lo que haces con un aviso que no es un paso (cobrar, el parte, su ok…). */
  function guiaAccion(accion, c, link, aj, hoy) {
    var a = SIS.acciones[accion];
    return a ? llenarGuia(a, varsCliente(c, link, aj, hoy), { titulo: a.titulo, accion: accion }) : null;
  }

  // ---------- los mensajes de WhatsApp a tus clientes (los textos están en tu sistema) ----------
  /** tipo: bienvenida | parte | tarea | aprobar | cobro | atraso | resultados | testimonio | mejorar | arranque | aire | vispera | dia15 | garantia. extra: { id, texto }. */
  function mensaje(tipo, c, link, aj, hoy, extra) {
    var p = c.proyecto, x = extra || {}, plantilla = SIS.mensajes.cliente[tipo];
    if (!plantilla) return "";
    var v = varsCliente(c, link, aj, hoy);
    var buscar = function (lista) { return (lista || []).find(function (o) { return o.id === x.id; }) || {}; };
    if (tipo === "parte") v.texto = x.texto || GB.borradorParte(p, c.respuestas, hoy, hoy + " 00:00");
    else if (tipo === "tarea") {
      var t = buscar(p.tareas), sp = t.id ? GB.pasoDeTarea(p, t) : null;
      v.tarea = minus(t.nombre || "algo de tu lado"); v.cuando = t.fecha ? cuando(t.fecha, hoy) : ""; v.porque = t.porque || ""; v.paso = sp && sp.estado !== "listo" ? sp.nombre : "";
    } else if (tipo === "aprobar" || tipo === "aprobar24") {
      var vid = buscar(p.videos); v.titulo = vid.titulo || ""; v.sale = vid.fechaPub ? cuando(vid.fechaPub, hoy) : "";
      var pid = GB.okDe(vid, c.respuestas || {}).pidio; v.desde = pid ? cuando(pid.slice(0, 10), hoy) + " a las " + pid.slice(11, 16) : "ayer";
    }
    else if (tipo === "cobro") { var g = buscar(p.pagos); v.concepto = minus(g.concepto || "el pago"); v.monto = bs(g.monto); v.vence = g.vence ? cuando(g.vence, hoy) : ""; v.condicion = g.condicion || ""; }
    else if (tipo === "atraso") { var s = buscar(p.pasos); v.paso = minus(s.nombre || "lo que sigue"); v.cuando = s.fecha ? cuando(s.fecha, hoy) : ""; }
    else if (tipo === "testimonio") v.nota = c.respuestas && c.respuestas.encuesta ? c.respuestas.encuesta.nota : 10;
    return rellenar(plantilla, v);
  }

  // ---------- tus prospectos: el camino de una tienda en frío ----------
  var ETAPAS = {};
  SIS.prospeccion.etapas.forEach(function (e) { ETAPAS[e.clave] = e; });
  // ---------- de dónde llegó cada prospecto ----------
  var CANALES = {};
  SIS.prospeccion.canales.forEach(function (c) { CANALES[c.clave] = c; });
  /** El canal de un prospecto (los de antes, sin canal, los conociste en persona). */
  function canalDe(pr) { var k = pr && pr.canal; return CANALES[k] ? k : "calle"; }
  /** inbound = te escribió él (por lo que hiciste en marketing) · referido · persona (lo visitaste en frío). */
  function origenDe(pr) { var k = canalDe(pr); return CANALES[k].inbound ? "inbound" : k === "referido" ? "referido" : "persona"; }
  /** Los minutos entre dos sellos "AAAA-MM-DD HH:mm" (-1 si falta alguno). */
  function minutosEntre(a, b) {
    if (!a || !b) return -1;
    var f = function (s) { var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/); return m ? Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) / 6e4 : NaN; };
    var d = f(b) - f(a);
    return isNaN(d) ? -1 : Math.max(0, Math.round(d));
  }
  /** "3 min", "1 h 20 min", "2 días". */
  function duracion(min) {
    if (min < 0) return "";
    if (min < 60) return min + " min";
    if (min < 1440) return Math.floor(min / 60) + " h" + (min % 60 ? " " + (min % 60) + " min" : "");
    var d = Math.floor(min / 1440); return d + (d === 1 ? " día" : " días");
  }
  function nuevoProspecto(d, hoy, ahora) {
    var visitado = d.visitado !== false, lead = !!d.lead;
    if (lead) visitado = false;
    return {
      negocio: d.negocio || "", contacto: d.contacto || "", celular: d.celular || "", rubro: d.rubro || "", zona: d.zona || "",
      canal: CANALES[d.canal] ? d.canal : lead ? "anuncio" : "calle", campana: d.campana || "", leadEl: lead ? (d.leadEl || ahora) : "", contactadoEl: "", intentos: 0, ultimoIntento: "",
      etapa: lead ? "lead" : "visita1", v1: visitado ? (d.v1 || hoy) : "", planeado: visitado || lead ? "" : (d.planeado || hoy), v2: "", v2conf: false, llamada: "", volver: "",
      fechaFuerte: d.fechaFuerte || "", fechaFuerteNombre: d.fechaFuerteNombre || "", mover: d.mover || "", decide: d.decide || "",
      precio: entero(d.precio), ganancia: entero(d.ganancia), unidades: entero(d.unidades), frases: [], apertura: d.apertura || "",
      promo: { regalo: "", vale: 0, cuesta: 0, porque: "", fecha: "", tope: 0, nombre: "", armada: false },
      seg: { d0: false, d1: false, vispera: false, propuesta: false, pagina: false, llvisp: false }, check: {}, motivo: "", notas: d.notas || "", cliente: "",
      decidePresente: "", objecion: "", metodo: SIS.version, caso: "",
      historial: lead ? [{ el: d.leadEl || ahora, tipo: "lead", que: "Te escribió: " + minus(CANALES[CANALES[d.canal] ? d.canal : "anuncio"].nombre) }]
        : visitado ? [{ el: ahora, tipo: "v1", que: "Visita 1" }] : [{ el: ahora, tipo: "lista", que: "Anotada para visitar" }]
    };
  }
  /**
   * Lo que marcaste con un prospecto al mandarle un mensaje: «contactado» (la primera respuesta a un lead),
   * «intento» (el segundo y el tercer mensaje) o cualquier casilla de su seguimiento (d0, d1, vispera, propuesta, pagina, llvisp).
   * Devuelve true si cambió algo.
   */
  function marcarProspecto(pr, marca, ahora) {
    if (!pr || !marca) return false;
    var h = pr.historial || (pr.historial = []);
    if (marca === "contactado") {
      if (pr.contactadoEl) return false;
      pr.contactadoEl = ahora; pr.intentos = Math.max(1, pr.intentos || 0); pr.ultimoIntento = ahora;
      var min = minutosEntre(pr.leadEl, ahora);
      h.push({ el: ahora, tipo: "contacto", que: "Le contestaste" + (min >= 0 ? " en " + duracion(min) : "") });
    } else if (marca === "intento") {
      pr.intentos = Math.min(9, (pr.intentos || 1) + 1); pr.ultimoIntento = ahora;
      h.push({ el: ahora, tipo: "intento", que: "Mensaje " + pr.intentos + " sin respuesta" });
    } else {
      pr.seg = pr.seg || {};
      if (pr.seg[marca]) return false;
      pr.seg[marca] = true;
    }
    pr.historial = h.slice(-30);
    return true;
  }
  /** La cuenta de su promo: lo que le queda por venta con el regalo, su número de la garantía y qué le come el regalo contra una rebaja. */
  function numerosPromo(pr) {
    var gan = entero(pr.ganancia), promo = pr.promo || {}, costo = entero(promo.cuesta), vale = entero(promo.vale);
    var porVenta = gan - costo, inversion = SIS.precio.servicio + SIS.precio.pautaMin;
    return {
      porVenta: porVenta, inversion: inversion, n: porVenta > 0 ? Math.ceil(inversion / porVenta) : 0,
      pctRegalo: gan > 0 && costo > 0 ? Math.round(costo / gan * 100) : 0, pctRebaja: gan > 0 && vale > 0 ? Math.round(vale / gan * 100) : 0
    };
  }
  function linkPropuesta(pr) {
    var f = (pr.promo && pr.promo.fecha) || pr.fechaFuerte;
    return SIS.enlaces.propuesta + "?t=" + encodeURIComponent(pr.negocio || "") + "&p=" + SIS.precio.servicio + (f ? "&f=" + encodeURIComponent(GB.diaLargo(f).replace(/^\S+ /, "")) : "");
  }
  function varsProspecto(pr, aj) {
    var v2d = (pr.v2 || "").slice(0, 10);
    return {
      nombre: primerNombre(pr.contacto), negocio: pr.negocio || "", v2dia: v2d ? GB.diaLargo(v2d) : "", v2hora: (pr.v2 || "").slice(11),
      pagina: SIS.enlaces.pagina, propuesta: linkPropuesta(pr), llamada: (pr.llamada || "").slice(11), lldia: pr.llamada ? GB.diaLargo(pr.llamada.slice(0, 10)) : "",
      fechaFuerte: pr.fechaFuerteNombre || (pr.fechaFuerte ? "fecha del " + GB.diaLargo(pr.fechaFuerte) : ""),
      miNombre: aj && aj.nombre ? primerNombre(aj.nombre) : "", N: numerosPromo(pr).n || "",
      decideOtro: pr.decide && primerNombre(pr.decide).toLowerCase() !== primerNombre(pr.contacto).toLowerCase() && !/^(él|el|ella|yo|solo|sola|nadie)$/i.test(String(pr.decide).trim()) ? pr.decide : ""
    };
  }
  function mensajeProspecto(tipo, pr, aj) { var t = SIS.mensajes.prospecto[tipo]; return t ? rellenar(t, varsProspecto(pr, aj)) : ""; }
  function guiaEtapa(clave, pr, aj) {
    var e = ETAPAS[clave];
    if (!e) return null;
    var extra = { titulo: e.nombre, etapa: clave, checks: (pr && pr.check && pr.check[clave]) || "" };
    if (clave === "visita2" || clave === "llamada" || clave === "promo" || clave === "lopienso") extra.caso = casoPara(pr && pr.rubro) || { sinCaso: SIS.casos.sinCaso };
    return llenarGuia(e, varsProspecto(pr || {}, aj), extra);
  }
  /** Tu caso más parecido a su rubro (por las palabras de cada caso); null si todavía no hay uno. */
  function casoPara(rubro) {
    var r = String(rubro || "").toLowerCase();
    if (!r) return null;
    return SIS.casos.lista.find(function (c) { return c.rubros.some(function (w) { return r.indexOf(w) >= 0 || w.indexOf(r) >= 0; }); }) || null;
  }
  /**
   * Mueve un prospecto de etapa y deja la huella en su historial (de ahí salen los números de tu semana).
   * d = { v2: "AAAA-MM-DD HH:mm", llamada, volver, motivo, cliente }
   */
  function pasarEtapa(pr, etapa, d, ahora) {
    d = d || {};
    var antes = pr.etapa, hoy = String(ahora).slice(0, 10), h = pr.historial || (pr.historial = []);
    var hizoV2 = (antes === "visita2" || antes === "promo") && pr.v2 && pr.v2.slice(0, 10) <= hoy && ["cliente", "lopienso", "despues", "perdido"].indexOf(etapa) >= 0;
    if (hizoV2) { h.push({ el: ahora, tipo: "v2-hecha", que: "Visita 2" }); if (!pr.caso) { var cs = casoPara(pr.rubro); pr.caso = cs ? cs.clave : "ninguno"; } }
    if (d.decidePresente === "si" || d.decidePresente === "no") pr.decidePresente = d.decidePresente;
    if (d.objecion) pr.objecion = String(d.objecion).slice(0, 300);
    // Una llamada de venta: la de un lead (cuenta como su primera reunión) o la del sí o no de «lo pienso»
    var hizoLlamada = (antes === "llamada" || antes === "lopienso") && pr.llamada && pr.llamada.slice(0, 10) <= hoy && etapa !== antes && !d.falto && ["promo", "visita2", "cliente", "lopienso", "despues", "perdido"].indexOf(etapa) >= 0;
    if (hizoLlamada) h.push({ el: ahora, tipo: "llamada-hecha", que: antes === "lopienso" ? "La llamada del sí o no" : "La llamada" });
    if (d.falto && antes === "llamada") h.push({ el: ahora, tipo: "llamada-falto", que: "No contestó la llamada" });
    // Una tienda que tenías anotada para visitar: al anotar cómo te fue, cuenta como tu visita 1 de hoy
    if (antes === "visita1" && !pr.v1 && etapa !== "visita1") { pr.v1 = hoy; pr.planeado = ""; h.push({ el: ahora, tipo: "v1", que: "Visita 1" }); }
    pr.etapa = etapa;
    if (d.v2) { pr.v2 = d.v2; pr.v2conf = false; pr.seg.vispera = false; }
    if (d.llamada) pr.llamada = d.llamada;
    if (d.volver) pr.volver = d.volver;
    if (d.motivo) pr.motivo = d.motivo;
    if (d.cliente) pr.cliente = d.cliente;
    if (etapa === "visita1" && antes !== "visita1") { pr.v1 = d.planeado ? "" : hoy; pr.planeado = d.planeado || ""; pr.v2 = ""; pr.llamada = ""; pr.seg = { d0: false, d1: false, vispera: false, propuesta: false, pagina: false, llvisp: false }; }
    if (etapa === "llamada") { pr.seg = pr.seg || {}; if (d.llamada || antes !== "llamada") { pr.seg.llvisp = false; } if (antes !== "llamada") pr.seg.pagina = false; }
    if (etapa === "visita2") pr.promo.armada = true;
    var huella = {
      visita1: d.planeado ? ["lista", "Anotada para visitar"] : ["v1", "Visita 1"], llamada: ["llamada-agendada", "Agendó la llamada"],
      promo: ["v2-agendada", "Agendó la visita 2"], visita2: ["promo-armada", "Su promo quedó armada"],
      lopienso: ["lopienso", "Dijo «lo pienso»"], cliente: ["cerro", "Cerró"], despues: ["despues", "Más adelante"], perdido: ["perdido", "No es para él" + (d.motivo ? ": " + d.motivo : "")]
    }[etapa];
    if (huella && !(etapa === "visita1" && antes === "visita1") && !(etapa === "llamada" && antes === "llamada" && !d.llamada)) h.push({ el: ahora, tipo: etapa === "llamada" && antes === "llamada" ? "nota" : huella[0], que: etapa === "llamada" && antes === "llamada" ? "Movimos la llamada" : huella[1] });
    pr.historial = h.slice(-30);
    return pr;
  }
  /** Lo que toca con un prospecto hoy. Cada cosa: { grupo, nivel, texto, sub, prospecto, guia, wa, marca, pide, hora }. */
  function accionesProspecto(pr, hoy, ahora) {
    var out = [], nom = pr.negocio || "Sin nombre", seg = pr.seg || {}, promo = pr.promo || {};
    var it = function (nivel, texto, etapa, wa, extra) { out.push(Object.assign({ grupo: "cerrar", nivel: nivel, texto: texto, sub: nom, prospecto: pr, guia: { etapa: etapa }, wa: wa || "" }, extra || {})); };
    var v2d = (pr.v2 || "").slice(0, 10), v2h = (pr.v2 || "").slice(11);
    // Si ya dijiste «no se puede: queda así» para esta fecha, no se vuelve a pedir
    var lejos = pr.v1 && v2d && v2d > hoy ? GB.diasEntre(pr.v1, v2d) : 0, quedaAsi = (pr.historial || []).some(function (h) { return h.tipo === "v2-lejos" && String(h.que).indexOf(pr.v2) >= 0; });
    if (lejos > SIS.prospeccion.maxDiasV2 && !quedaAsi && (pr.etapa === "promo" || pr.etapa === "visita2")) it(2, "La visita 2 con " + nom + " queda a " + lejos + " días de la 1: trata de acercarla", "promo", "", { pide: "mover2" });
    var laVisita2 = function () {
      if (v2d && v2d === sumarDias(hoy, 1) && !seg.vispera) it(2, "La noche antes: recuérdale a " + nom + " la visita 2 de mañana" + (v2h ? " a las " + v2h : ""), "visita2", "vispera", { marca: "vispera" });
      if (v2d === hoy) it(3, "Visita 2 hoy" + (v2h ? " a las " + v2h : "") + ": " + nom + (promo.armada ? "" : " (todavía sin su promo armada)"), "visita2", "", { pide: "resultado2", hora: v2h });
      else if (v2d && v2d < hoy) it(3, "¿Qué pasó en la visita 2 con " + nom + "?", "visita2", "", { pide: "resultado2" });
      else if (!v2d) it(2, "Agenda la visita 2 con " + nom, "visita1", "", { pide: "resultado1" });
    };
    var I = SIS.prospeccion.inbound;
    switch (pr.etapa) {
      case "lead": {
        var desde = minutosEntre(pr.leadEl, ahora), n = pr.intentos || 0;
        if (!pr.contactadoEl) {
          it(desde < 0 || desde >= I.contestarMin ? 3 : 2, "Contéstale a " + nom + (desde >= 0 ? ": te escribió hace " + duracion(desde) : ": te escribió"), "lead", "lead", { marca: "contactado" });
        } else if (n < I.intentos) {
          var prox = sumarDias(String(pr.ultimoIntento || pr.contactadoEl).slice(0, 10), I.entreIntentos[Math.min(n, I.entreIntentos.length) - 1] || 1);
          if (prox <= hoy) it(2, (n + 1 >= I.intentos ? "El último mensaje a " : "El segundo mensaje a ") + nom + ": todavía no agenda la llamada", "lead", n + 1 >= I.intentos ? "lead3" : "lead2", { marca: "intento" });
        } else if (sumarDias(String(pr.ultimoIntento).slice(0, 10), 2) <= hoy) {
          it(1, nom + " no contestó a tus " + n + " mensajes: pásalo a «Más adelante»", "lead", "", { pide: "resultadoLead" });
        }
        break;
      }
      case "llamada": {
        var lld = (pr.llamada || "").slice(0, 10), llh = (pr.llamada || "").slice(11);
        if (!lld) { it(2, "Agenda la llamada con " + nom, "lead", "", { pide: "resultadoLead" }); break; }
        if (!seg.pagina && lld >= hoy) it(lld === hoy ? 3 : 2, "Mándale a " + nom + " tu página y la hora de la llamada", "llamada", "llamada", { marca: "pagina" });
        if (lld === sumarDias(hoy, 1) && !seg.llvisp) it(2, "La noche antes: recuérdale a " + nom + " la llamada de mañana" + (llh ? " a las " + llh : ""), "llamada", "llamadaVispera", { marca: "llvisp" });
        if (lld === hoy) it(3, "Llamada con " + nom + (llh ? " a las " + llh : ""), "llamada", "", { pide: "resultadoLlamada", hora: llh });
        else if (lld < hoy) it(3, "¿Cómo te fue en la llamada con " + nom + "?", "llamada", "", { pide: "resultadoLlamada" });
        break;
      }
      case "visita1":
        if (!pr.v1) { if (pr.planeado && pr.planeado <= hoy) it(pr.planeado < hoy ? 2 : 1, "Visita 1 a " + nom, "visita1", "", { pide: "resultado1" }); }
        else it(2, "¿Cómo quedó la visita 1 con " + nom + "?", "visita1", "", { pide: "resultado1" });
        break;
      case "promo":
        if (!seg.d0) it(pr.v1 && pr.v1 < hoy ? 3 : 2, "Mándale a " + nom + " el mensaje de gracias, con tu página y la hora de la visita 2", "promo", origenDe(pr) === "inbound" && !pr.v1 ? "graciasLlamada" : "gracias", { marca: "d0" });
        if (!promo.armada) it(v2d && v2d <= sumarDias(hoy, 1) ? 3 : 2, "Arma la promo de " + nom + (v2d ? ": la visita 2 es " + cuando(v2d, hoy) + (v2h ? " a las " + v2h : "") : ""), "promo", "", { abrir: "promo" });
        if (!seg.d1 && pr.v1 && pr.v1 < hoy && (!v2d || v2d > hoy)) it(1, "Pregúntale a " + nom + " cuántas unidades separaría", "promo", "dia1", { marca: "d1" });
        laVisita2();
        break;
      case "visita2":
        laVisita2();
        break;
      case "lopienso": {
        var ld = (pr.llamada || "").slice(0, 10), lh = (pr.llamada || "").slice(11);
        if (!seg.propuesta) it(3, "Mándale a " + nom + " su propuesta y la hora de la llamada", "lopienso", "lopienso", { marca: "propuesta" });
        if (ld === hoy) it(3, "Llama a " + nom + (lh ? " a las " + lh : "") + ": sí o no", "lopienso", "", { pide: "resultado3", hora: lh });
        else if (ld && ld < hoy) it(3, "¿Qué te dijo " + nom + "?", "lopienso", "", { pide: "resultado3" });
        else if (!ld) it(2, "Agenda la llamada con " + nom + " para el sí o el no", "lopienso", "", { pide: "llamada" });
        break;
      }
      case "despues":
        if (pr.volver && pr.volver <= hoy) it(1, "Vuelve a " + nom + (pr.fechaFuerte ? ": se acerca su " + (pr.fechaFuerteNombre || "fecha fuerte") : ""), "despues", "volver", { pide: "volvi" });
        break;
    }
    return out;
  }

  // ---------- tu agencia: tu semana ----------
      // Lo que te quedó apura: naranja (desde la Parte 2 ya no sube a rojo: es tu contenido, no plata de hoy)
  function semanaISO(d) {
    var f = GB.fechaDe(d), dia = (f.getDay() + 6) % 7;
    f.setDate(f.getDate() - dia + 3);
    var anio = f.getFullYear(), jueves1 = new Date(anio, 0, 4);
    var n = 1 + Math.round(((f - jueves1) / 864e5 - 3 + ((jueves1.getDay() + 6) % 7)) / 7);
    return anio + "-W" + GB.pad(n);
  }
  function lunesDe(d) { var f = GB.fechaDe(d); return sumarDias(d, -((f.getDay() + 6) % 7)); }
  /** El día de la semana como en tu sistema: 1 = lunes … 7 = domingo. */
  function diaISO(d) { return GB.fechaDe(d).getDay() || 7; }
  function semanaDe(ag, hoy) { return (ag && ag.semanas && ag.semanas[semanaISO(hoy)]) || { hechos: {}, ganchos: [], cuerpo: "" }; }
  /** Las visitas 1 de un día, de todos tus prospectos. */
  function visitasDe(prospectos, fecha) {
    var n = 0;
    (prospectos || []).forEach(function (pr) { (pr.historial || []).forEach(function (h) { if (h.tipo === "v1" && String(h.el).slice(0, 10) === fecha) n++; }); });
    return n;
  }
  function metaVisitas(ag) { return (ag && ag.metas && ag.metas.visitasDia) || SIS.prospeccion.metaVisitasDia; }
  /** Lo de tu semana que toca hoy (y lo que te quedó de días anteriores), más tus visitas del día. */
  function itemsAgencia(ag, hoy, prospectos) {
    var sem = semanaDe(ag, hoy), hechos = sem.hechos || {}, d = diaISO(hoy), out = [];
    SIS.agencia.semana.forEach(function (x) {
      if (hechos[x.clave]) return;
      if (x.dia === d) out.push({ grupo: "contenido", nivel: 1, texto: x.nombre, sub: "Tu agencia", agencia: x.clave, guia: { agencia: x.clave } });
      // Lo que te quedó apura: naranja, y rojo a los 3 días (para que tu contenido no quede siempre para mañana)
      else if (x.dia < d) out.push({ grupo: "contenido", nivel: 2, texto: "Te quedó del " + GB.DIAS[x.dia % 7] + ": " + minus(x.nombre), sub: "Tu agencia", agencia: x.clave, guia: { agencia: x.clave } });
    });
    var V = SIS.agencia.visitas;
    if (V.dias.indexOf(d) >= 0) {
      var hechas = visitasDe(prospectos, hoy), meta = metaVisitas(ag);
      if (hechas < meta) out.push({ grupo: "cerrar", nivel: 1, texto: "Tus visitas de hoy: " + hechas + " de " + meta, sub: "Tu frente", agencia: "visitas", guia: { agencia: "visitas" }, cuenta: { hechas: hechas, meta: meta } });
    }
    return out;
  }
  function guiaAgencia(clave) {
    var x = clave === "visitas" ? SIS.agencia.visitas : SIS.agencia.semana.find(function (s) { return s.clave === clave; }) || (SIS.agencia.mensual || []).find(function (s) { return s.clave === clave; });
    return x ? llenarGuia(x, {}, { titulo: x.nombre, agencia: clave }) : null;
  }
  /** Marca (o desmarca) algo de tu semana. Guarda las últimas 16 semanas. */
  function marcarAgencia(ag, clave, hoy, ahora) {
    ag.semanas = ag.semanas || {};
    var wk = semanaISO(hoy), sem = ag.semanas[wk] || (ag.semanas[wk] = { hechos: {}, ganchos: [], cuerpo: "" });
    sem.hechos = sem.hechos || {};
    if (sem.hechos[clave]) delete sem.hechos[clave]; else sem.hechos[clave] = ahora;
    Object.keys(ag.semanas).sort().slice(0, -16).forEach(function (k) { delete ag.semanas[k]; });
    return !!sem.hechos[clave];
  }
  /**
   * Los números de ventas entre dos fechas (incluidas): lo que llega por anuncios, tus llamadas, tus visitas en persona,
   * los cierres de cada camino y lo cobrado. Salen del historial de cada prospecto y de los pagos de tus clientes.
   */
  function numerosVentas(datos, desde, hasta) {
    var dentro = function (s) { var d = String(s || "").slice(0, 10); return d && (!desde || d >= desde) && (!hasta || d <= hasta); };
    var T = ["lead", "contacto", "llamada-agendada", "llamada-hecha", "llamada-falto", "v1", "v2-agendada", "v2-hecha", "cerro"], ev = {}, cobrado = 0;
    T.forEach(function (t) { ev[t] = 0; });
    var cierresPor = { inbound: 0, persona: 0, referido: 0 }, rapidos = 0, tiempos = [], llamadasDeLead = 0, trasV2 = 0;
    (datos.prospectos || []).forEach(function (pr) {
      var o = origenDe(pr), vioV2 = false;
      (pr.historial || []).forEach(function (h) {
        if (h.tipo === "v2-hecha") vioV2 = true;
        if (!dentro(h.el) || ev[h.tipo] == null) return;
        ev[h.tipo]++;
        if (h.tipo === "cerro") { cierresPor[o]++; if (vioV2) trasV2++; }
        if (h.tipo === "llamada-hecha" && h.que !== "La llamada del sí o no") llamadasDeLead++;
      });
      if (pr.leadEl && dentro(pr.leadEl) && pr.contactadoEl) {
        var m = minutosEntre(pr.leadEl, pr.contactadoEl);
        if (m >= 0) { tiempos.push(m); if (m <= SIS.prospeccion.inbound.contestarMin) rapidos++; }
      }
    });
    (datos.clientes || []).forEach(function (c) { ((c.proyecto && c.proyecto.pagos) || []).forEach(function (x) { if (x.estado === "pagado" && dentro(x.pagadoEl)) cobrado += x.monto; }); });
    var pct = function (a, b) { return b ? Math.round(a / b * 100) : null; };
    tiempos.sort(function (a, b) { return a - b; });
    // Cada visita 2 hecha en el período: cuántos días tardó desde la 1, si estaba quien decide, qué caso viste y si cerró
    var v2s = [], diasV = [], grupo = function () { return { v2: 0, cierres: 0 }; }, decide = { si: grupo(), no: grupo() }, caso = { con: grupo(), sin: grupo() };
    (datos.prospectos || []).forEach(function (pr) {
      var hv = (pr.historial || []).filter(function (h) { return h.tipo === "v2-hecha" && dentro(h.el); })[0];
      if (!hv) return;
      var cerro = (pr.historial || []).some(function (h) { return h.tipo === "cerro" && h.el >= hv.el; });
      if (pr.v1) diasV.push(GB.diasEntre(pr.v1, String(hv.el).slice(0, 10)));
      if (decide[pr.decidePresente]) { decide[pr.decidePresente].v2++; if (cerro) decide[pr.decidePresente].cierres++; }
      if (pr.caso) { var k = pr.caso === "ninguno" ? "sin" : "con"; caso[k].v2++; if (cerro) caso[k].cierres++; }
      v2s.push(pr);
    });
    return {
      diasV1V2: diasV.length ? Math.round(diasV.reduce(function (a, b) { return a + b; }, 0) / diasV.length * 10) / 10 : null, decide: decide, caso: caso,
      desde: desde, hasta: hasta,
      leads: ev.lead, contactados: ev.contacto, rapidos: rapidos, minContestar: tiempos.length ? tiempos[Math.floor((tiempos.length - 1) / 2)] : null,
      llamadas: ev["llamada-agendada"], llamadasHechas: ev["llamada-hecha"], llamadasDeLead: llamadasDeLead, llamadasFalto: ev["llamada-falto"],
      v1: ev.v1, v2: ev["v2-agendada"], v2hechas: ev["v2-hecha"], cierres: ev.cerro, cierresPor: cierresPor, cobrado: cobrado,
      cierre: pct(trasV2, ev["v2-hecha"]), reuniones: ev["v2-hecha"] + llamadasDeLead, asistencia: pct(llamadasDeLead, llamadasDeLead + ev["llamada-falto"]),
      aLlamada: pct(ev["llamada-agendada"], ev.lead), contestados: pct(rapidos, tiempos.length)
    };
  }
  /** Los números de tu semana (de lunes a domingo). */
  function numerosSemana(datos, hoy) {
    var lunes = lunesDe(hoy), domingo = sumarDias(lunes, 6);
    return Object.assign(numerosVentas(datos, lunes, domingo), { lunes: lunes, domingo: domingo });
  }

  // ---------- tu día: todo lo que toca hoy, en orden ----------
  var ORDEN_GRUPO = { cobrar: 0, cerrar: 1, entregar: 2, cuidar: 3, contenido: 4 };
  var GRUPO_ACCION = { cobro: "cobrar", dijoPago: "cobrar", numero: "cobrar", tarea: "entregar", atraso: "entregar", aprobar: "entregar", cambios: "entregar", paso: "entregar",
    confirmar: "cuidar", parte: "cuidar", bienvenida: "cuidar", testimonio: "cuidar", mejorar: "cuidar", resultados: "cuidar" };
  var GRUPOS = [
    { clave: "cobrar", nombre: "Cobrar", ico: "billetera" }, { clave: "cerrar", nombre: "Cerrar", ico: "apreton" },
    { clave: "entregar", nombre: "Entregar", ico: "engranaje" }, { clave: "cuidar", nombre: "Cuidar", ico: "globo" }, { clave: "contenido", nombre: "Tu contenido", ico: "camara" }
  ];
  /**
   * Tu día, como un GPS: lo de tus clientes, tus prospectos y tu agencia, de lo más urgente a lo menos,
   * y en la misma urgencia, primero lo que trae plata (cobrar → cerrar → entregar → cuidar → tu contenido).
   * datos = { clientes, prospectos, agencia }.
   */
  function tuDia(datos, hoy, ahora) {
    var items = [], tasa = GB.tasaLlegada(datos.clientes, hoy);
    (datos.clientes || []).forEach(function (c) {
      if (c.estado !== "activo") return;
      var al = GB.alertas(c, hoy, ahora, { tasa: tasa });
      al.forEach(function (a) {
        var grupo = a.msg && (a.msg.tipo === "dia15" || a.msg.tipo === "garantia") ? "cobrar" : GRUPO_ACCION[a.accion] || "cuidar";
        items.push({ grupo: grupo, nivel: a.nivel, texto: a.texto, sub: c.proyecto.negocio, cliente: c, alerta: a, tab: a.tab, guia: { paso: a.paso, accion: a.accion }, wa: a.msg });
      });
      // El paso de ahora, para que siempre sepas qué sigue con cada cliente
      var m = GB.motor(c.proyecto, c.respuestas, hoy, { abierto: (c.veces || 0) > 0 }), cur = m.actual >= 0 ? m.pasos[m.actual].paso : null;
      if (cur && !al.some(function (a) { return a.paso === cur.id; })) items.push({ grupo: "entregar", nivel: 0, texto: "Sigue con «" + cur.nombre + "»" + (cur.fecha ? " (" + cuando(cur.fecha, hoy) + ")" : ""), sub: c.proyecto.negocio, cliente: c, tab: "proceso", guia: { paso: cur.id } });
    });
    (datos.prospectos || []).forEach(function (pr) { accionesProspecto(pr, hoy, ahora).forEach(function (x) { items.push(x); }); });
    itemsAgencia(datos.agencia, hoy, datos.prospectos).forEach(function (x) { items.push(x); });
    items.forEach(function (x) { x.peso = x.nivel * 10 - ORDEN_GRUPO[x.grupo] * 2; });
    return items.sort(function (a, b) { return b.peso - a.peso || (a.hora || "99").localeCompare(b.hora || "99"); });
  }

  // ---------- la fábrica: qué dicen los números de cada video ----------
  function caso(clave, extra) { var c = SIS.fabrica.casos.find(function (x) { return x.clave === clave; }) || {}; return Object.assign({ clave: clave }, c, extra || {}); }
  /**
   * Qué hacer con una versión, por sus números (los 4 casos de la curva, ficha 23 §3).
   * n = { vistas, r3 (% que sigue a los 3 s, -1 = sin dato), caida (segundo donde cae de golpe, 0 = no cae), guardados, seguidores, escriben, cupones, llegaron }.
   * op.alcance: en alcance lo que vendió son los mensajes; en un lanzamiento, los cupones.
   */
  function veredicto(n, op) {
    n = n || {}; op = op || {};
    var F = SIS.fabrica, vistas = entero(n.vistas);
    if (vistas < F.acumulado) return caso("faltan", { falta: F.acumulado - vistas });
    if (n.r3 != null && n.r3 !== "" && entero(n.r3) >= 0 && entero(n.r3) < F.varaR3) return caso("gancho");
    if (entero(n.caida) > 0) return caso("tramo", { seg: entero(n.caida) });
    var vende = op.alcance ? entero(n.escriben) : Math.max(entero(n.cupones), entero(n.llegaron));
    if (!vende) return caso("oferta");
    return caso("ganador");
  }
  /** Entre varias versiones (de un cuerpo o de tu semana), la que gana: la que más vendió, después la más guardada, después la que más retuvo. */
  function mejorVersion(lista, op) {
    op = op || {};
    var F = SIS.fabrica, nums = function (v) { return v.n || v.numeros || {}; };
    var vende = function (v) { var n = nums(v); return op.alcance ? entero(n.escriben) : Math.max(entero(n.cupones), entero(n.llegaron)); };
    var guarda = function (v) { var n = nums(v); return entero(n.guardados) + entero(n.seguidores); };
    var listas = (lista || []).filter(function (v) { return entero(nums(v).vistas) >= F.acumulado; });
    if (!listas.length) return null;
    listas.sort(function (a, b) { return vende(b) - vende(a) || guarda(b) - guarda(a) || entero(nums(b).r3) - entero(nums(a).r3); });
    return listas[0];
  }
  /** Los videos de un proyecto agrupados por cuerpo (los que no tienen cuerpo van solos). */
  function porCuerpo(p) {
    var grupos = [], porNum = {};
    (p.videos || []).forEach(function (v) {
      var k = v.cuerpo ? "c" + v.cuerpo : "v" + v.id;
      if (!porNum[k]) { porNum[k] = { cuerpo: v.cuerpo || 0, nombre: v.cuerpo ? String(v.titulo).split(" · ")[0] : v.titulo, videos: [] }; grupos.push(porNum[k]); }
      porNum[k].videos.push(v);
    });
    return grupos;
  }
  /** Una receta a partir de un video que ganó: lo que se sabe se pasa solo; tú completas el resto. */
  function recetaDesde(v, c) {
    var n = v.n || v.numeros || {}, p = (c && c.proyecto) || {};
    return { nombre: v.titulo || "", rubro: "", cliente: p.negocio || "Tu agencia", formato: "", gancho: "", orden: "", edicion: "", tomas: "", nota: "",
      numeros: { vistas: entero(n.vistas), r3: entero(n.r3), fin: entero(n.fin), guardados: entero(n.guardados), seguidores: entero(n.seguidores), vendio: Math.max(entero(n.cupones), entero(n.llegaron), entero(n.escriben)) } };
  }

  // ---------- lo que traen tus cupones ----------
  /**
   * Resume la respuesta de tu app de cupones (acción "canjes" con el link del panel de la tienda):
   * cuántos reservaron, llegaron y compraron, cuánto vendieron, y lo mismo por cada link (bio, V1…V9).
   * No guarda nombres ni celulares: solo cuentas.
   */
  function resumenCupon(res) {
    var out = { reservas: 0, llegaron: 0, compraron: 0, vendido: 0, porOrigen: {} };
    var de = function (o) { return out.porOrigen[o] || (out.porOrigen[o] = { visitas: 0, reservas: 0, llegaron: 0, compraron: 0, vendido: 0 }); };
    ((res && res.canjes) || []).forEach(function (k) {
      var o = de(k.origen || "bio");
      out.reservas++; o.reservas++;
      if (k.llego) { out.llegaron++; o.llegaron++; }
      if (k.compro) { out.compraron++; o.compraron++; }
      var m = Number(k.monto) || 0; out.vendido += m; o.vendido += m;
    });
    var vis = (res && res.visitas) || {};
    Object.keys(vis).forEach(function (dia) { Object.keys(vis[dia] || {}).forEach(function (o) { de(o).visitas += (vis[dia][o] && vis[dia][o].v) || 0; }); });
    return out;
  }
  /** Pasa lo del cupón a su ficha: su número de la garantía, cada video (por su link) y sus resultados. Devuelve el resumen. */
  function aplicarCupon(p, res, ahora) {
    var r = resumenCupon(res), hoy = String(ahora).slice(0, 10);
    var g = p.garantia || (p.garantia = { n: 0, inversion: 0, ganancia: 0, llegaron: 0, al: "" });
    g.llegaron = r.llegaron; g.reservas = r.reservas; g.compraron = r.compraron; g.vendido = Math.round(r.vendido); g.al = ahora;
    marcarLista(g, ahora);
    (p.videos || []).forEach(function (v) {
      var o = v.origen && r.porOrigen[v.origen];
      if (!o) return;
      v.n = v.n || {};
      v.n.cupones = o.reservas; v.n.llegaron = o.llegaron;
    });
    var poner = function (re, valor) { (p.resultados || []).forEach(function (x) { if (re.test(String(x.nombre).toLowerCase())) x.valor = valor; }); };
    poner(/reserv/, bs(r.reservas)); poner(/llegaron/, bs(r.llegaron)); poner(/compraron/, bs(r.compraron)); poner(/vendido/, bs(r.vendido));
    p.resultadosFecha = hoy;
    return r;
  }
  /** Del link del panel de la tienda (…/panel.html?n=tienda&tienda=clave) saca el negocio y su clave. */
  function leerLinkCupon(link) {
    var m = String(link || "").match(/[?&]n=([^&#]+)/), t = String(link || "").match(/[?&]tienda=([^&#]+)/);
    return m && t ? { n: decodeURIComponent(m[1]), t: decodeURIComponent(t[1]) } : null;
  }

  // ---------- poner al día a un cliente armado con un método viejo ----------
  /**
   * Compara su camino con el de tu sistema de hoy. No toca sus fechas, sus estados ni sus pagos:
   * cada paso que ya tenía encuentra su lugar (por su clave o por lo que es), y se suman los pasos y lo de su lado que falten.
   * Devuelve { proyecto, cambios } sin cambiar el original.
   */
  function actualizarMetodo(p, hoy, ahora) {
    var q = copia(p), pl = PLANTILLAS[q.tipo], cambios = [];
    if (!pl || q.tipo === "blanco") { q.metodo = SIS.version; return { proyecto: q, cambios: cambios }; }
    var usados = {}, filas = [], ctx = { S: q.inicio, K: q.fechaClave, claves: {} };
    // 1) Cada paso de tu sistema busca el suyo entre los que ya tenía
    pl.pasos.forEach(function (def, i) {
      var s = q.pasos.find(function (x) { return !usados[x.id] && x.clave === def.clave; }) ||
        q.pasos.find(function (x) { return !usados[x.id] && !x.clave && GB.clasePaso(x) === GB.CLAVE_CLASE[def.clave]; });
      if (s) {
        usados[s.id] = true;
        s.clave = def.clave; if (!s.para) s.para = def.para || ""; if (!s.yo) s.yo = def.yo || ""; if (!s.detalle) s.detalle = def.detalle || "";
        filas.push({ k: i, sub: 0, paso: s });
      } else filas.push({ k: i, sub: 0, nuevo: def });
    });
    // 2) Los pasos que agregaste a mano se quedan donde estaban
    var ultimo = -1;
    q.pasos.forEach(function (s, j) {
      var f = filas.find(function (x) { return x.paso === s; });
      if (f) { ultimo = f.k; return; }
      filas.push({ k: ultimo, sub: 1 + j, paso: s });
    });
    filas.sort(function (a, b) { return a.k - b.k || a.sub - b.sub; });
    // 3) Los pasos nuevos toman su fecha de tu sistema, entre el de antes y el de después; si el trabajo ya pasó por ahí, quedan listos
    filas.forEach(function (f, i) {
      if (f.paso) { if (f.paso.clave) ctx.claves[f.paso.clave] = f.paso.fecha; return; }
      var def = f.nuevo, fecha = evaluarFecha(def.fecha, ctx);
      var antes = filas.slice(0, i).reverse().find(function (x) { return x.paso && x.paso.fecha; });
      var despues = filas.slice(i + 1).find(function (x) { return x.paso && x.paso.fecha; });
      if (antes && fecha < antes.paso.fecha) fecha = antes.paso.fecha;
      if (despues && fecha > despues.paso.fecha) fecha = despues.paso.fecha;
      var yaPaso = filas.slice(i + 1).some(function (x) { return x.paso && x.paso.estado !== "pendiente"; });
      f.paso = { id: nuevoId(), clave: def.clave, nombre: def.nombre, detalle: def.detalle || "", para: def.para || "", yo: def.yo || "", fecha: fecha || "", estado: yaPaso ? "listo" : "pendiente", hechoEl: yaPaso ? ahora : "" };
      ctx.claves[def.clave] = f.paso.fecha;
      cambios.push("Se suma el paso «" + def.nombre + "»" + (yaPaso ? " (ya quedó atrás: lo marco listo)" : ""));
    });
    q.pasos = filas.map(function (f) { return f.paso; });
    // 4) Lo de su lado que falte (por su clave o por un nombre igual)
    var porClave = {};
    q.pasos.forEach(function (s) { if (s.clave) porClave[s.clave] = s; });
    pl.tareas.forEach(function (def) {
      var t = q.tareas.find(function (x) { return x.clave === def.clave; }) || q.tareas.find(function (x) { return !x.clave && String(x.nombre).toLowerCase() === def.nombre.toLowerCase(); });
      if (t) { t.clave = def.clave; return; }
      // Si su paso ya quedó atrás, entra como hecho: no le aparece de golpe algo que ya pasó
      var sp = porClave[def.paso], hecho = !!sp && sp.estado === "listo";
      var fecha = evaluarFecha(def.fecha, ctx);
      if (!hecho && fecha && fecha < hoy) fecha = sumarDias(hoy, 1);
      q.tareas.push({ id: nuevoId(), clave: def.clave, nombre: def.nombre, porque: def.porque || "", como: def.como || "", fecha: fecha, estado: hecho ? "confirmado" : "pendiente", confirmadoEl: hecho ? ahora : "", paso: sp ? sp.id : "" });
      cambios.push("Se suma de su lado: «" + def.nombre + "»" + (hecho ? " (ya quedó atrás: va como hecho)" : ""));
    });
    if (!q.interno) q.interno = { cupon: { n: "", t: "" }, check: {}, notas: "" };
    if (!q.garantia) q.garantia = { n: 0, inversion: 0, ganancia: 0, llegaron: 0, al: "" };
    if (pl.pago === "mitades" && q.pagos.some(function (x) { return x.garantia; }) && !(q.garantia.condiciones && q.garantia.condiciones.length)) {
      q.garantia.condiciones = SIS.garantia.condiciones.slice();
      cambios.push("Su link muestra su garantía con sus 5 cosas");
    }
    if (cambios.length) cambios.push("Los pasos que ya tenía se quedan con sus fechas y su estado. Sus pagos no se tocan.");
    q.metodo = SIS.version;
    return { proyecto: GB.vincular(q), cambios: cambios };
  }

  // ---------- el plan de cada mes: empezar el mes que sigue con el mismo link ----------
  /** Arma el mes siguiente: el mismo cliente y el mismo link; lo del mes que termina queda en su historial. */
  function siguienteCiclo(p, d, ahora) {
    d = d || {};
    var hoy = String(ahora).slice(0, 10), proximo = (p.pagos || []).find(function (x) { return /próximo mes/i.test(x.concepto); });
    var monto = entero(d.total) || (proximo ? proximo.monto : SIS.precio.mensual);
    var pagado = d.pagado != null ? entero(d.pagado) : proximo && proximo.estado === "pagado" ? monto : 0;
    var q = armarProyecto("mensual", { negocio: p.negocio, contacto: p.contacto, celular: p.celular, inicio: d.inicio || hoy, videos: d.videos, total: monto, pagado: pagado }, ahora);
    q.objetivo = p.objetivo || ""; q.bienvenida = p.bienvenida || q.bienvenida;
    q.interno = { cupon: (p.interno && p.interno.cupon) || { n: "", t: "" }, check: {}, notas: (p.interno && p.interno.notas) || "" };
    var fin = (p.pasos || []).reduce(function (m, s) { return s.fecha > m ? s.fecha : m; }, "");
    q.historial = (p.historial || []).concat([{ etiqueta: p.etiqueta, inicio: p.inicio, fin: fin,
      resultados: (p.resultados || []).filter(function (x) { return x.valor; }).map(function (x) { return { nombre: x.nombre, valor: x.valor, antes: x.antes || "" }; }) }]).slice(-12);
    q.resultados.forEach(function (x) {
      var viejo = (p.resultados || []).find(function (y) { return y.nombre === x.nombre && y.valor; });
      if (viejo) x.antes = viejo.valor;   // el "antes" del mes nuevo es el "ahora" del mes que termina
    });
    // Lo que te quedó por cobrar de lo de antes no se pierde: pasa al mes nuevo, con su fecha (el próximo mes ya está en este)
    (p.pagos || []).forEach(function (x) {
      if (x.estado !== "pendiente" || /próximo mes/i.test(x.concepto)) return;
      q.pagos.push({ id: nuevoId(), concepto: (x.concepto + " (" + minus(p.etiqueta || "lo de antes") + ")").slice(0, 70), monto: x.monto, vence: x.vence || hoy, condicion: x.garantia ? "lo que quedó de antes" : x.condicion || "",
        estado: "pendiente", pagadoEl: "", paso: q.pasos[0] ? q.pasos[0].id : "", garantia: false });
    });
    return q;
  }

  // ---------- tu registro (F0): el panel anota solo ----------
  var NOMBRES_PROSPECTO = { v1: "Visita 1", "v2-agendada": "Agendó la visita 2", "promo-armada": "Su promo quedó armada", "v2-hecha": "Hiciste la visita 2", lopienso: "Dijo «lo pienso»", cerro: "¡Cerró!", despues: "Quedó para más adelante", perdido: "No era para él" };
  var VENTANA_REG = 14;   // días hacia atrás que se miran: lo más viejo ya no se corrige
  function selloOk(x) { return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(x || "")); }
  /**
   * Todo lo que terminaste (de los últimos 14 días), sacado de lo que está marcado: una fila por cosa, con su id fijo.
   * Lo «puesto al día» (lo que se marcó solo al cargar un cliente a mitad de camino) no cuenta como trabajo.
   * Los partes no están aquí: los anota el servidor cuando los publicas.
   */
  function registroDe(datos, hoy) {
    var desde = sumarDias(hoy, -VENTANA_REG), out = [];
    var poner = function (id, sello, tipo, grupo, quien, detalle, padre) {
      if (!selloOk(sello) || sello.slice(0, 10) < desde) return;
      out.push({ id: id, sello: sello, tipo: tipo, grupo: grupo, quien: String(quien || "").slice(0, 60), detalle: String(detalle || "").slice(0, 200), padre: padre });
    };
    (datos.clientes || []).forEach(function (c) {
      var p = c.proyecto || {}, cl = c.id, pa = "c:" + cl, neg = p.negocio || "";
      (p.pasos || []).forEach(function (x) { if (x.estado === "listo" && !x.alDia) poner("paso|" + cl + "|" + x.id, x.hechoEl, "paso", "entregar", neg, "Listo: «" + x.nombre + "»", pa); });
      (p.tareas || []).forEach(function (x) { if (x.estado === "confirmado") poner("tarea|" + cl + "|" + x.id, x.confirmadoEl, "su-parte", "cuidar", neg, "Confirmaste de su lado: " + minus(x.nombre), pa); });
      (p.pagos || []).forEach(function (x) { if (x.estado === "pagado" && !x.alDia) poner("cobro|" + cl + "|" + x.id, x.pagadoEl, "cobro", "vender", neg, "Cobraste " + bs(x.monto) + " Bs: " + minus(x.concepto), pa); });
      (p.videos || []).forEach(function (v) {
        var el = v.pasadasEl || {};
        Object.keys(el).forEach(function (n) {
          if (+n > (v.pasada || 0)) return;
          var def = (SIS.fabrica.pasadas || []).find(function (y) { return String(y.n) === n; });
          poner("pasada|" + cl + "|" + v.id + "|" + n, el[n], "pasada", "entregar", neg, "«" + v.titulo + "» · pasada " + n + (def ? ": " + minus(def.nombre) : ""), pa);
        });
        if (v.prep) poner("pasada|" + cl + "|" + v.id + "|0", v.prep, "pasada", "entregar", neg, "«" + v.titulo + "» · pasada 0: preparar el material", pa);
        if (v.estado === "publicado") poner("video|" + cl + "|" + v.id, v.cambiadoEl, "video", "entregar", neg, "Publicado: «" + v.titulo + "»", pa);
      });
    });
    (datos.prospectos || []).forEach(function (pr) {
      (pr.historial || []).forEach(function (x) {
        if (!NOMBRES_PROSPECTO[x.tipo]) return;
        poner("pr|" + pr.id + "|" + x.tipo + "|" + String(x.el || "").replace(/[ :]/g, ""), x.el, "prospecto", "vender", pr.negocio || "Sin nombre", NOMBRES_PROSPECTO[x.tipo], "p:" + pr.id);
      });
    });
    var sem = (datos.agencia && datos.agencia.semanas) || {};
    Object.keys(sem).forEach(function (wk) {
      var h = sem[wk].hechos || {}, s = sem[wk], titulo = s.cuerpo || "El cuerpo de tu semana";
      // Las pasadas del video de tu cuenta (con la 0)
      if (s.prep) poner("pasada|agencia|" + wk + "|0", s.prep, "pasada", "contenido", "Tu cuenta", "«" + titulo + "» · pasada 0: preparar el material", "ag");
      Object.keys(s.pasadasEl || {}).forEach(function (n) {
        if (+n > (s.pasada || 0)) return;
        var def = (SIS.fabrica.pasadas || []).find(function (y) { return String(y.n) === n; });
        poner("pasada|agencia|" + wk + "|" + n, s.pasadasEl[n], "pasada", "contenido", "Tu cuenta", "«" + titulo + "» · pasada " + n + (def ? ": " + minus(def.nombre) : ""), "ag");
      });
      Object.keys(h).forEach(function (k) {
        var t = ((SIS.agencia && SIS.agencia.semana) || []).find(function (x) { return x.clave === k; });
        poner("ag|" + wk + "|" + k, h[k], "agencia", "contenido", "Tu agencia", t ? t.nombre : k, "ag");
      });
    });
    return out.sort(function (a, b) { return a.sello < b.sello ? -1 : a.sello > b.sello ? 1 : 0; });
  }
  function firmaReg(x) { return [x.sello, x.tipo, x.grupo, x.quien, x.detalle].join("~"); }
  /**
   * Lo que hay que mandar a tu hoja: lo nuevo o cambiado, y lo que desmarcaste (solo si ya lo habías mandado).
   * Si borraste el cliente o el prospecto entero, sus filas se quedan: lo que hiciste sigue siendo verdad.
   * `enviados` = {id: {f: firma, d: día, p: padre}} lo que este aparato ya mandó; `vivos` = los padres que existen.
   */
  function registroCambios(eventos, enviados, vivos, hoy) {
    enviados = enviados || {};
    var desde = sumarDias(hoy, -VENTANA_REG), ahora = {}, subir = [], borrar = [];
    eventos.forEach(function (x) { ahora[x.id] = true; var y = enviados[x.id]; if (!y || y.f !== firmaReg(x)) subir.push(x); });
    Object.keys(enviados).forEach(function (id) {
      var y = enviados[id];
      if (!ahora[id] && y.d >= desde && vivos[y.p]) borrar.push(id);
    });
    return { subir: subir, borrar: borrar };
  }
  /** Después de que tu hoja respondió bien: lo que este aparato recuerda haber mandado (sin lo de hace más de 14 días). */
  function registroEnviado(enviados, subidos, borrados, hoy) {
    var out = {}, desde = sumarDias(hoy, -VENTANA_REG), fuera = {};
    (borrados || []).forEach(function (id) { fuera[id] = true; });
    Object.keys(enviados || {}).forEach(function (id) { if (!fuera[id] && enviados[id].d >= desde) out[id] = enviados[id]; });
    (subidos || []).forEach(function (x) { out[x.id] = { f: firmaReg(x), d: x.sello.slice(0, 10), p: x.padre }; });
    return out;
  }
  /** Los padres que existen hoy: tus clientes, tus prospectos y tu agencia. */
  function registroVivos(datos) {
    var v = { ag: true };
    (datos.clientes || []).forEach(function (c) { v["c:" + c.id] = true; });
    (datos.prospectos || []).forEach(function (p) { v["p:" + p.id] = true; });
    return v;
  }

  Object.assign(GB, {
    registroDe: registroDe, registroCambios: registroCambios, registroEnviado: registroEnviado, registroVivos: registroVivos,
    SISTEMA: SIS, PLANTILLAS: PLANTILLAS, ETAPAS: ETAPAS, GRUPOS: GRUPOS,
    rellenar: rellenar, evaluarFecha: evaluarFecha, marcado: marcado, alternarBit: alternarBit,
    numeroGarantia: numeroGarantia, condicionGarantia: condicionGarantia, ponerGarantia: ponerGarantia, marcarLista: marcarLista, topeGarantia: topeGarantia, casoPara: casoPara,
    armarProyecto: armarProyecto, pasoDelSistema: pasoDelSistema, varsCliente: varsCliente, guiaPaso: guiaPaso, guiaAccion: guiaAccion, mensaje: mensaje,
    nuevoProspecto: nuevoProspecto, numerosPromo: numerosPromo, linkPropuesta: linkPropuesta, varsProspecto: varsProspecto, mensajeProspecto: mensajeProspecto,
    guiaEtapa: guiaEtapa, pasarEtapa: pasarEtapa, accionesProspecto: accionesProspecto, marcarProspecto: marcarProspecto, canalDe: canalDe, origenDe: origenDe, CANALES: CANALES, minutosEntre: minutosEntre, duracion: duracion, numerosVentas: numerosVentas,
    semanaISO: semanaISO, lunesDe: lunesDe, diaISO: diaISO, semanaDe: semanaDe, visitasDe: visitasDe, metaVisitas: metaVisitas,
    itemsAgencia: itemsAgencia, guiaAgencia: guiaAgencia, marcarAgencia: marcarAgencia, numerosSemana: numerosSemana,
    tuDia: tuDia, veredicto: veredicto, mejorVersion: mejorVersion, porCuerpo: porCuerpo, recetaDesde: recetaDesde,
    resumenCupon: resumenCupon, aplicarCupon: aplicarCupon, leerLinkCupon: leerLinkCupon,
    actualizarMetodo: actualizarMetodo, siguienteCiclo: siguienteCiclo
  });
  return GB;
});
