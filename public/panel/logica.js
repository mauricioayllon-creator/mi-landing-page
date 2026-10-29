/**
 * La lógica del panel de clientes, sin pantalla: fechas, estados, el motor, las alertas y el borrador del parte del día.
 * La usan el panel del cliente, tu panel y las pruebas (node prueba-local/probar.js).
 * Aquí no está tu método: los pasos, lo que dices y los mensajes están en sistema.js, y los arma guia.js
 * (que solo carga tu panel). Así el link de tus clientes no trae tus guiones ni tus precios.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear();
  else raiz.GB = crear();
})(this, function () {
  "use strict";

  // ---------- fechas (AAAA-MM-DD y "AAAA-MM-DD HH:mm", hora de La Paz que manda el servidor) ----------
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function cap(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  function minus(s) { s = String(s || ""); return s.charAt(0).toLowerCase() + s.slice(1); }
  function fechaDe(d) { var p = String(d).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function iso(f) { return f.getFullYear() + "-" + pad(f.getMonth() + 1) + "-" + pad(f.getDate()); }
  function sumarDias(d, n) { var f = fechaDe(d); f.setDate(f.getDate() + n); return iso(f); }
  function diasEntre(a, b) { return Math.round((fechaDe(b) - fechaDe(a)) / 864e5); }
  function diaLargo(d) { if (!d) return ""; var f = fechaDe(d); return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; }
  function diaCorto(d) { if (!d) return ""; var f = fechaDe(d); return DIAS[f.getDay()].slice(0, 3) + " " + f.getDate() + " " + MESES[f.getMonth()].slice(0, 3); }
  function maxFecha(a, b) { return !a ? b : !b ? a : a > b ? a : b; }
  function selloDe(s) { var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/); return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) : null; }
  /** "hace 5 min", "hace 3 h", "ayer a las 18:20", "el lun 13 oct". */
  function hace(sello, ahora) {
    var a = selloDe(sello), b = selloDe(ahora);
    if (!a || !b) return "";
    var min = Math.round((b - a) / 6e4), dia = String(sello).slice(0, 10), hoy = String(ahora).slice(0, 10);
    if (min < 1) return "recién";
    if (min < 60) return "hace " + min + " min";
    if (dia === hoy) return "hace " + Math.round(min / 60) + " h";
    if (dia === sumarDias(hoy, -1)) return "ayer a las " + String(sello).slice(11);
    return "el " + diaCorto(dia);
  }
  /** "hoy", "mañana", "ayer" o el día corto. */
  function cuando(d, hoy) {
    if (!d) return "";
    if (d === hoy) return "hoy";
    if (d === sumarDias(hoy, 1)) return "mañana";
    if (d === sumarDias(hoy, -1)) return "ayer";
    return "el " + diaCorto(d);
  }
  function bs(n) { return Math.round(Number(n) || 0).toLocaleString("es-BO"); }
  function unir(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " y " + a[a.length - 1]; }
  function nuevoId() { return Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 36).toString(36); }
  function primerNombre(s) { return String(s || "").trim().split(/\s+/)[0] || ""; }
  /** Lo que el cliente lee como "tu acceso", tú lo lees como "su acceso". */
  function suyo(s) {
    return String(s || "").replace(/\b([Tt])(us?)\b/g, function (_, t, resto) { return (t === "T" ? "S" : "s") + resto; });
  }

  // ---------- estados ----------
  var VIDEO = {
    guion: { cliente: "Guion listo", tu: "Guion" },
    grabado: { cliente: "Grabado", tu: "Grabado" },
    edicion: { cliente: "En edición", tu: "En edición" },
    aprobar: { cliente: "Para que lo veas", tu: "Esperando su ok" },
    cambios: { cliente: "Pediste un cambio", tu: "Pidió un cambio" },
    aprobado: { cliente: "Aprobado", tu: "Aprobado" },
    publicado: { cliente: "Publicado", tu: "Publicado" }
  };
  var ORDEN_VIDEO = ["guion", "grabado", "edicion", "aprobar", "aprobado", "publicado"];

  /** El estado que se ve: si el video espera el ok y el cliente ya respondió esa versión, manda su respuesta. */
  function estadoVideo(v, r) {
    var x = r && r.videos && r.videos[v.id];
    if (v.estado === "aprobar" && x && x.v === v.version) return x.estado === "aprobado" ? "aprobado" : "cambios";
    return v.estado;
  }
  function respuestaVideo(v, r) { var x = r && r.videos && r.videos[v.id]; return x && x.v === v.version ? x : null; }
  function pasoActual(p) { return (p.pasos || []).find(function (x) { return x.estado !== "listo"; }) || null; }
  function pasoSiguiente(p) {
    var i = (p.pasos || []).findIndex(function (x) { return x.estado !== "listo"; });
    return i < 0 ? null : (p.pasos.slice(i + 1).find(function (x) { return x.estado !== "listo"; }) || null);
  }
  function progreso(p) {
    var t = (p.pasos || []).length, h = (p.pasos || []).filter(function (x) { return x.estado === "listo"; }).length;
    return { hechos: h, total: t, pct: t ? Math.round(h / t * 100) : 0 };
  }
  /** Lo que le falta al cliente: sus tareas sin hacer (las que marcó "ya lo hice" esperan tu confirmación). */
  function tareasAbiertas(p, r) {
    return (p.tareas || []).filter(function (t) { return t.estado !== "confirmado" && !(r && r.tareas && r.tareas[t.id]); })
      .sort(function (a, b) { return (a.fecha || "9999").localeCompare(b.fecha || "9999"); });
  }
  function tareasPorConfirmar(p, r) {
    return (p.tareas || []).filter(function (t) { return t.estado !== "confirmado" && r && r.tareas && r.tareas[t.id]; });
  }
  function videosPorAprobar(p, r) { return (p.videos || []).filter(function (v) { return estadoVideo(v, r) === "aprobar"; }); }
  /** Lo pagado y lo que falta. Lo que no se cobra por la garantía ("anulado") no cuenta como deuda. */
  function saldo(p, r) {
    var s = { total: 0, pagado: 0, pendiente: 0, anulado: 0, avisados: [] };
    (p.pagos || []).forEach(function (x) {
      if (x.estado === "anulado") { s.anulado += x.monto; return; }
      s.total += x.monto;
      if (x.estado === "pagado") s.pagado += x.monto;
      else if (r && r.pagos && r.pagos[x.id]) s.avisados.push(x);
    });
    s.pendiente = s.total - s.pagado;
    return s;
  }
  /**
   * La garantía de un lanzamiento: sus N clientes y cuántos llegaron (los trae su panel de cupones).
   * Devuelve null si el proyecto no tiene número. { n, llegaron, falta, lista, pct, inversion, ganancia, al }
   */
  function estadoGarantia(p) {
    var g = p && p.garantia;
    if (!g || !(g.n > 0)) return null;
    var llegaron = Math.max(0, g.llegaron || 0);
    return { n: g.n, llegaron: llegaron, falta: Math.max(0, g.n - llegaron), lista: llegaron >= g.n, pct: Math.min(100, Math.round(llegaron / g.n * 100)),
      inversion: g.inversion || 0, ganancia: g.ganancia || 0, al: g.al || "", reservas: g.reservas || 0, compraron: g.compraron || 0, vendido: g.vendido || 0,
      listaEl: g.listaEl || "", visita15: g.visita15 || "", sembrado: g.sembrado || "", avisado70: g.avisado70 || "", validar: g.validar || "", extendidaEl: g.extendidaEl || "" };
  }

  // ---------- la garantía en marcha: sus 5 cosas, el ritmo hacia su número y los 7 días más ----------
  // Supuestos para ajustar con datos (cambios-propuestos, Parte 2): se cambian aquí y en tu sistema.
  var GAR = { horasOk: 24, horasRiesgo: 18, diasExtra: 7, tasaSupuesta: 0.5, k7: 0.4, k3: 0.7, senales: 3, sinParte: 2, diaPromoHora: 14, diaPromoParte: 0.3 };
  function horasEntre(a, b) { var x = selloDe(a), y = selloDe(b); return x && y ? (y - x) / 36e5 : -1; }
  function desdeSello(s, hoy) { return s ? cuando(String(s).slice(0, 10), hoy) + " a las " + String(s).slice(11, 16) : ""; }
  /**
   * Cuándo le pediste su ok a un video y cuándo respondió (en su link o por WhatsApp). Pedir un cambio también es responder.
   * Sus 24 horas empiezan cuando el video está para su ok y tiene el link para verlo (pidioOkEl). Un video de antes, sin ese dato, cuenta desde que cambió.
   */
  function okDe(v, r) {
    var x = respuestaVideo(v, r);
    return { pidio: v.pidioOkEl || (v.pidioOkEl == null && v.estado === "aprobar" ? v.cambiadoEl || "" : ""), dio: x ? x.el : v.okEl || "", por: x ? "link" : v.okPor || "" };
  }
  var COSAS = [
    { clave: "accesos", re: /acceso/i, tareas: /tiktok|acceso/i, def: "Tus accesos, en la sesión de arranque" },
    { clave: "ok24", re: /aprobar|24/i, def: "Aprobar cada video en 24 horas" },
    { clave: "publicidad", re: /publicidad|pauta/i, tareas: /publicidad|pauta/i, def: "Tu publicidad, desde 500 Bs" },
    { clave: "stock", re: /stock|separ/i, tareas: /stock|separ/i, def: "Tu stock separado" },
    { clave: "validar", re: /valid/i, def: "Validar cada cupón que llega" }
  ];
  /**
   * Sus 5 cosas de la garantía con su estado: ok · espera (todavía no toca) · riesgo (por romperse) · rota.
   * Accesos, publicidad y stock salen de sus tareas; el ok en 24 horas, de sus videos; validar los cupones lo marcas tú.
   * Los textos van en su voz («tu ok al video…»): en tu panel se leen con suyo().
   * Devuelve { cosas: [{ clave, texto, estado, detalle }], enPie, riesgo, linea } o null si no tiene garantía.
   */
  function cosasGarantia(p, r, ahora) {
    r = r || {};
    var g = p && p.garantia;
    if (!g || !(g.n > 0) || !(p.pagos || []).some(function (x) { return x.garantia || x.estado === "anulado"; })) return null;
    var hoy = String(ahora).slice(0, 10), ord = { ok: 0, espera: 1, riesgo: 2, rota: 3 };
    var conds = (g.condiciones && g.condiciones.length ? g.condiciones : COSAS.map(function (x) { return x.def; }));
    var deTareas = function (re) {
      var abiertas = (p.tareas || []).filter(function (t) { return re.test(String(t.clave || "") + " " + String(t.nombre || "")) && t.estado !== "confirmado" && !(r.tareas && r.tareas[t.id]); });
      if (!abiertas.length) return { estado: "ok", detalle: "" };
      var t = abiertas.slice().sort(function (a, b) { return String(a.fecha || "9").localeCompare(String(b.fecha || "9")); })[0], nom = minus(t.nombre);
      if (t.fecha && t.fecha < hoy) return { estado: "rota", detalle: "falta " + nom + " (era para " + cuando(t.fecha, hoy) + ")" };
      if (t.fecha === hoy) return { estado: "riesgo", detalle: "falta " + nom + ", para hoy" };
      return { estado: "espera", detalle: nom + (t.fecha ? ", para " + cuando(t.fecha, hoy) : "") };
    };
    var deVideos = function () {
      var peor = { estado: "ok", detalle: "" };
      (p.videos || []).forEach(function (v) {
        var o = okDe(v, r), est = null;
        if (!o.pidio) return;
        if (o.dio) { if (horasEntre(o.pidio, o.dio) > GAR.horasOk) est = { estado: "rota", detalle: "tu ok a «" + v.titulo + "» llegó después de 24 horas" }; }
        else if (estadoVideo(v, r) === "aprobar") {
          var h = horasEntre(o.pidio, ahora), desde = " (desde " + desdeSello(o.pidio, hoy) + ")";
          est = h > GAR.horasOk ? { estado: "rota", detalle: "falta tu ok al video «" + v.titulo + "»" + desde }
            : h >= GAR.horasRiesgo ? { estado: "riesgo", detalle: "falta tu ok al video «" + v.titulo + "»" + desde }
            : { estado: "espera", detalle: "tu ok al video «" + v.titulo + "»" + desde };
        }
        if (est && ord[est.estado] > ord[peor.estado]) peor = est;
      });
      return peor;
    };
    var cosas = conds.map(function (texto) {
      var def = COSAS.find(function (x) { return x.re.test(texto); }) || { clave: "otra" }, s;
      if (def.tareas) s = deTareas(def.tareas);
      else if (def.clave === "ok24") s = deVideos();
      else if (def.clave === "validar") s = g.validar === "no" ? { estado: "rota", detalle: "no están quedando validados todos los cupones que llegan" } : g.validar === "si" ? { estado: "ok", detalle: "" } : { estado: "espera", detalle: "lo vemos el día de tu promo" };
      else s = { estado: "ok", detalle: "" };
      return { clave: def.clave, texto: texto, estado: s.estado, detalle: s.detalle };
    });
    var rota = cosas.filter(function (x) { return x.estado === "rota"; }), riesgo = cosas.filter(function (x) { return x.estado === "riesgo"; });
    var mal = rota.concat(riesgo)[0];
    return { cosas: cosas, enPie: !rota.length, riesgo: !!riesgo.length, linea: mal ? "Para que tu garantía siga en pie: " + mal.detalle + "." : "Tu garantía sigue en pie ✓" };
  }
  /** De cada 10 que reservan, cuántos llegan: el promedio de tus lanzamientos que ya terminaron (0 mientras no haya 10 reservas contadas). */
  function tasaLlegada(clientes, hoy) {
    var res = 0, lleg = 0;
    (clientes || []).forEach(function (c) {
      var p = c && c.proyecto, g = p && p.garantia;
      if (!g || !(g.reservas > 0) || !p.fechaClave || p.fechaClave >= hoy) return;
      res += g.reservas; lleg += Math.min(g.reservas, g.llegaron || 0);
    });
    return res >= 10 ? lleg / res : 0;
  }
  /** Cuántas reservas le hacen falta para llegar a su número: N ÷ (la parte de los que reservan que llega). Sin datos tuyos, llega 1 de cada 2 (supuesto). */
  function ritmoGarantia(p, tasa) {
    var g = estadoGarantia(p);
    if (!g) return null;
    var supuesto = !(tasa > 0), t = supuesto ? GAR.tasaSupuesta : tasa, necesarias = Math.ceil(g.n / t);
    return { reservas: g.reservas, necesarias: necesarias, faltan: Math.max(0, necesarias - g.reservas), pct: necesarias ? Math.round(g.reservas / necesarias * 100) : 0, tasa: t, supuesto: supuesto };
  }
  /** Los 7 días más con su ganador: si empezaron, cuál es el último y en qué día van. */
  function extensionGarantia(p, hoy) {
    var g = estadoGarantia(p);
    if (!g || !g.extendidaEl) return null;
    var desde = g.extendidaEl.slice(0, 10), hasta = sumarDias(desde, GAR.diasExtra);
    return { desde: desde, hasta: hasta, dia: Math.min(GAR.diasExtra, diasEntre(desde, hoy) + 1), termino: hoy > hasta };
  }
  /** La última señal suya: abrió su link, respondió algo o anotaste que hablaron. */
  function ultimaSenal(c) {
    var p = c.proyecto || {}, r = c.respuestas || {}, mejor = String(c.visto || "");
    var ver = function (s) { s = String(s || ""); if (s > mejor) mejor = s; };
    ["videos", "tareas", "pagos"].forEach(function (k) { Object.keys(r[k] || {}).forEach(function (id) { ver(r[k][id].el); }); });
    if (r.encuesta) ver(r.encuesta.el);
    ver(p.interno && p.interno.hablamosEl);
    return mejor || String(c.creado || "");
  }

  // ---------- el motor: cada paso es un engranaje grande; lo que lo hace girar son engranajes chicos ----------
  // De qué se trata un paso: por su clave (los pasos que salen de tu sistema la traen) o, si no la tiene, por su nombre.
  var CLAVE_CLASE = {
    cobro: "pago", mes: "pago", arranque: "arranque", guiones: "guion", grabacion: "grabacion", edicion: "edicion", aire: "aire",
    ganador: "reporte", provocacion: "publicidad", grito: "publicidad", exprimir: "publicidad", semana2: "publicidad",
    practica: "practica", promo: "promo", resultados: "resultados"
  };
  // El orden importa: la primera palabra que calza decide.
  var CLASES = [["pago", /pago|bienvenid/], ["arranque", /arranque|acceso/], ["guion", /guion/], ["grabacion", /grab/], ["edicion", /edici/],
    ["aire", /al aire|primer video/], ["reporte", /reporte|ganador/], ["publicidad", /publicidad|semana de videos|videos y/], ["practica", /práctica|practica|equipo/],
    ["promo", /promo|día de|dia de|lanzamiento/], ["resultados", /resultado/]];
  // Para qué sirve cada paso (lo lee el cliente) y lo que haces tú en él (tu engranaje), si el paso no lo trae escrito
  var CLASE_INFO = {
    pago: { para: "Para que arranquemos con todo claro.", yo: "Armo tu panel y tu camino" },
    arranque: { para: "Para que tus cuentas estén listas y nada frene tus videos.", yo: "La sesión de arranque contigo" },
    guion: { para: "Para que cada video diga lo que vende.", yo: "Escribo tus guiones" },
    grabacion: { para: "Para tener tus productos en video.", yo: "Grabo tus videos" },
    edicion: { para: "Para que tus videos queden listos para tu ok.", yo: "Edito tus videos" },
    aire: { para: "Para que la gente empiece a verte.", yo: "Publico tu primer video" },
    publicidad: { para: "Para que cada día te vea más gente.", yo: "Publico tus videos y cuido la publicidad" },
    reporte: { para: "Para saber qué video funciona y apostar ahí.", yo: "Armo tu reporte" },
    practica: { para: "Para que tu equipo atienda bien a quien llegue.", yo: "Practico con tu equipo" },
    promo: { para: "Para que la gente llegue a tu tienda.", yo: "Te acompaño en tu día de promo" },
    resultados: { para: "Para ver lo que logramos y lo que sigue.", yo: "Te muestro tus números y lo que sigue" },
    otro: { para: "", yo: "" }
  };
  /** La clase de un paso. Recibe el paso entero (usa su clave) o solo su nombre. */
  function clasePaso(s) {
    if (s && typeof s === "object") {
      if (s.clave && CLAVE_CLASE[s.clave]) return CLAVE_CLASE[s.clave];
      s = s.nombre;
    }
    var n = String(s || "").toLowerCase();
    for (var i = 0; i < CLASES.length; i++) if (CLASES[i][1].test(n)) return CLASES[i][0];
    return "otro";
  }
  function pasoPorClases(p, clases) {
    var pasos = p.pasos || [];
    for (var i = 0; i < clases.length; i++) {
      var c = clases[i], x = pasos.find(function (s) { return clasePaso(s) === c; });
      if (x) return x;
    }
    return null;
  }
  function pasoPorFecha(p, fecha) {
    var pasos = p.pasos || [];
    if (!pasos.length) return null;
    var x = fecha ? pasos.find(function (s) { return s.fecha && s.fecha >= fecha; }) : null;
    return x || pasoActual(p) || pasos[pasos.length - 1];
  }
  /** La fecha del paso "primer video" (para que un saldo atado a él venza ahí). */
  function fechaPrimerVideo(p) { var x = (p.pasos || []).find(function (s) { return clasePaso(s) === "aire"; }); return x ? x.fecha : ""; }
  // Qué paso mueve cada cosa del cliente, por su nombre (para lo que agregaste a mano): el acceso a TikTok es lo que deja salir el primer video
  var REGLAS_TAREA = [[/tiktok|publicidad|tarjeta/, ["aire", "publicidad", "arranque"]], [/logo|foto/, ["edicion", "grabacion"]], [/guion/, ["guion"]],
    [/separas|productos que|qué productos/, ["guion", "grabacion"]], [/equipo|práctica|practica/, ["practica", "promo"]], [/valida|cupón|cupon/, ["promo"]], [/conociste/, ["reporte", "resultados"]]];
  /** El paso que mueve algo que le toca al cliente: el que está anotado o, si no, el que corresponde por su nombre y su fecha. */
  function pasoDeTarea(p, t) {
    var pasos = p.pasos || [], n = String(t.nombre || "").toLowerCase();
    var x = t.paso ? pasos.find(function (s) { return s.id === t.paso; }) : null;
    if (x) return x;
    for (var i = 0; i < REGLAS_TAREA.length; i++) if (REGLAS_TAREA[i][0].test(n)) { x = pasoPorClases(p, REGLAS_TAREA[i][1]); if (x) return x; }
    return pasoPorFecha(p, t.fecha);
  }
  /** El paso que mueve un pago: lo pagado al empezar va con la bienvenida; la segunda mitad, con los resultados; el saldo, con el primer video. */
  function pasoDePago(p, g) {
    var pasos = p.pasos || [], x = g.paso ? pasos.find(function (s) { return s.id === g.paso; }) : null;
    if (x) return x;
    if (g.estado === "pagado" && (!g.vence || g.vence <= p.inicio)) return pasoPorClases(p, ["pago"]) || pasos[0] || null;
    if (g.garantia) { x = pasoPorClases(p, ["resultados"]); if (x) return x; }
    if (/primer video|al aire/i.test(g.condicion || "") || (g.vence && g.vence === fechaPrimerVideo(p))) { x = pasoPorClases(p, ["aire"]); if (x) return x; }
    return pasoPorFecha(p, g.vence);
  }
  /** Anota qué paso mueve cada cosa del cliente y cada pago (así, si cambias un nombre o una fecha, no se mueve solo). */
  function vincular(p) {
    var ids = (p.pasos || []).map(function (s) { return s.id; });
    (p.tareas || []).forEach(function (t) { if (ids.indexOf(t.paso) < 0) { var s = pasoDeTarea(p, t); t.paso = s ? s.id : ""; } });
    (p.pagos || []).forEach(function (g) { if (ids.indexOf(g.paso) < 0) { var s = pasoDePago(p, g); g.paso = s ? s.id : ""; } });
    return p;
  }

  /**
   * El motor de un proyecto: cada paso con lo que lo hace girar (lo tuyo y lo del cliente), la barra de 0 a 100 y lo que lo frena.
   * ctx = { abierto: false si el cliente nunca abrió su link }.
   * Cada engranaje: { tipo: paso|tarea|ok|pago|link|opinion, quien: yo|cliente, nombre, detalle, peso, hecho, espera (lo marcó y falta tu ok),
   *   avance (0 a 1), fecha, estado: hecho|espera|atrasado|hoy|pendiente, puede (lo puede mover ahora), ref, en (su paso) }.
   * Cada paso: { paso, indice, clase, para, engranajes, mio (tu engranaje), peso, avance, completo, estado: listo|falta|girando|trabado|riesgo|espera }.
   */
  function motor(p, r, hoy, ctx) {
    r = r || {}; ctx = ctx || {};
    var pasos = p.pasos || [], videos = p.videos || [], nV = videos.length;
    var res = { pasos: [], actual: -1, engranajes: [], ubicar: {}, pct: 0, listos: 0, cuantos: 0, frenos: [], freno: null, terminado: false };
    var M = res.pasos = pasos.map(function (s, i) { var cl = clasePaso(s); return { paso: s, indice: i, clase: cl, para: s.para || CLASE_INFO[cl].para, engranajes: [] }; });
    if (!M.length) return res;
    var porId = {};
    M.forEach(function (x) { porId[x.paso.id] = x; });
    var en = function (s) { return (s && porId[s.id]) || M[M.length - 1]; };
    var donde = function (clases) { return en(pasoPorClases(p, clases)); };
    var poner = function (x, g) { g.en = x; x.engranajes.push(g); res.engranajes.push(g); if (g.ref) res.ubicar[g.ref] = x; };

    var etapa = function (v) { return ORDEN_VIDEO.indexOf(v.estado); };
    var contar = function (fn) { return videos.filter(fn).length; };
    var grabados = contar(function (v) { return etapa(v) >= 1; }), editados = contar(function (v) { return etapa(v) >= 3; });
    var aprobados = contar(function (v) { var x = estadoVideo(v, r); return x === "aprobado" || x === "publicado"; });
    var publicados = contar(function (v) { return v.estado === "publicado"; });
    var esperanOk = videos.filter(function (v) { return estadoVideo(v, r) === "aprobar"; });
    var fechaOk = esperanOk.map(function (v) { return v.fechaPub; }).filter(Boolean).sort()[0] || "";
    var primeraPublicidad = pasoPorClases(p, ["publicidad"]);

    // 1) Lo que haces tú en cada paso. Los videos lo mueven solos: grabados, editados, el primero publicado.
    M.forEach(function (x) {
      var s = x.paso, frac = 0, detalle = "", completa = false;
      if (nV && x.clase === "grabacion") { frac = grabados / nV; detalle = grabados + " de " + nV + " videos"; completa = grabados === nV; }
      else if (nV && x.clase === "edicion") { frac = editados / nV; detalle = editados + " de " + nV + " videos"; completa = editados === nV; }
      else if (nV && x.clase === "aire") { completa = publicados > 0; }
      else if (nV && s === primeraPublicidad) { frac = publicados / nV * 0.9; detalle = publicados + " de " + nV + " publicados"; }
      var hecho = s.estado === "listo" || completa;
      poner(x, { id: "p-" + s.id, tipo: "paso", quien: "yo", nombre: s.yo || CLASE_INFO[x.clase].yo || s.nombre, detalle: detalle, peso: 2, hecho: hecho, espera: false,
        avance: hecho ? 1 : Math.max(s.estado === "curso" ? 0.3 : 0, frac), fecha: s.fecha, porque: "", ref: s.id, puede: true });
      x.mio = x.engranajes[0];
    });
    // 2) Lo que le toca al cliente
    (p.tareas || []).forEach(function (t) {
      var ok = t.estado === "confirmado", dijo = !ok && !!(r.tareas && r.tareas[t.id]);
      poner(en(pasoDeTarea(p, t)), { id: "t-" + t.id, tipo: "tarea", quien: "cliente", nombre: t.nombre, detalle: "", peso: 1, hecho: ok, espera: dijo,
        avance: ok || dijo ? 1 : 0, fecha: t.fecha, porque: t.porque, ref: t.id, puede: true });
    });
    // 3) Su ok a los videos: sin su ok no se publica
    if (nV) {
      var video1 = esperanOk.length ? esperanOk[0].id : "";
      poner(donde(["aire", "publicidad", "edicion"]), { id: "v-ok1", tipo: "ok", quien: "cliente", nombre: "Tu ok al primer video", detalle: "", peso: 1,
        hecho: aprobados > 0, espera: false, avance: aprobados > 0 ? 1 : 0, fecha: fechaOk, porque: "Sin tu ok no se publica.", ref: "", video: video1, puede: esperanOk.length > 0 });
      if (nV > 1) {
        var resto = Math.max(0, aprobados - 1);
        poner(donde(["publicidad", "aire", "edicion"]), { id: "v-ok", tipo: "ok", quien: "cliente", nombre: "Tu ok a los demás videos", detalle: resto + " de " + (nV - 1), peso: 1,
          hecho: aprobados >= nV, espera: false, avance: resto / (nV - 1), fecha: aprobados > 0 ? fechaOk : "", porque: "Cada video sale cuando lo apruebas.", ref: "", video: video1, puede: aprobados > 0 && esperanOk.length > 0 });
      }
    }
    // 4) Los pagos. La segunda mitad de la garantía se mueve recién cuando llegan sus N clientes; lo que no se cobra cuenta como listo.
    var gar = estadoGarantia(p);
    (p.pagos || []).forEach(function (g) {
      var anulado = g.estado === "anulado", ok = g.estado === "pagado" || anulado, dijo = !ok && !!(r.pagos && r.pagos[g.id]);
      var aguarda = !ok && !dijo && !!g.garantia && !!gar && !gar.lista;
      poner(en(pasoDePago(p, g)), { id: "g-" + g.id, tipo: "pago", quien: "cliente", nombre: g.concepto + ": " + bs(g.monto) + " Bs" + (anulado ? " · no se cobra (garantía)" : ""),
        detalle: aguarda ? "Cuando lleguen tus " + gar.n + " (van " + gar.llegaron + ")" : "", peso: 1,
        hecho: ok, espera: dijo, avance: ok || dijo ? 1 : 0, fecha: ok || aguarda ? "" : g.vence, porque: g.condicion ? cap(g.condicion) + "." : "", ref: g.id, puede: !aguarda });
    });
    // 5) Que abra su panel (va en el primer paso) y, al final, su opinión
    var abierto = ctx.abierto !== false;
    poner(M[0], { id: "x-link", tipo: "link", quien: "cliente", nombre: "Abres tu panel", detalle: "", peso: 1, hecho: abierto, espera: false, avance: abierto ? 1 : 0, fecha: "", porque: "", ref: "", puede: true });
    poner(donde(["resultados"]), { id: "x-opinion", tipo: "opinion", quien: "cliente", nombre: "Tu opinión, del 0 al 10", detalle: r.encuesta ? r.encuesta.nota + "/10" : "", peso: 1,
      hecho: !!r.encuesta, espera: false, avance: r.encuesta ? 1 : 0, fecha: "", porque: "Me dice qué mejorar.", ref: "", puede: false });

    // El avance de cada paso y el de todo. El paso de ahora es el primero en el que tu parte no está.
    var total = 0, suma = 0;
    M.forEach(function (x, i) {
      var t = 0, h = 0;
      x.engranajes.forEach(function (g) { t += g.peso; h += g.peso * g.avance; });
      x.peso = t; x.avance = t ? h / t : 1; total += t; suma += h;
      x.completo = x.engranajes.every(function (g) { return g.hecho; });
      if (res.actual < 0 && !x.mio.hecho) res.actual = i;
    });
    var alFinal = res.actual < 0 || res.actual === M.length - 1;
    res.engranajes.forEach(function (g) {
      if (g.tipo === "opinion") g.puede = alFinal;
      g.estado = g.hecho ? "hecho" : g.espera ? "espera" : !g.puede && g.quien === "cliente" ? "pendiente"
        : g.fecha && g.fecha < hoy ? "atrasado" : g.fecha && g.fecha === hoy ? "hoy" : "pendiente";
      res.cuantos++;
      if (g.hecho || g.espera) res.listos++;
    });
    M.forEach(function (x, i) {
      x.faltaCliente = x.engranajes.filter(function (g) { return g.quien === "cliente" && !g.hecho; });
      x.tarde = x.faltaCliente.filter(function (g) { return g.estado === "atrasado"; });
      x.porConfirmar = x.faltaCliente.length > 0 && x.faltaCliente.every(function (g) { return g.espera; });
      x.atrasoMio = x.mio.estado === "atrasado";
      if (x.completo) x.estado = "listo";
      else if (i === res.actual) x.estado = x.tarde.length ? "trabado" : "girando";
      else if (res.actual < 0 || i < res.actual) x.estado = "falta";
      else x.estado = x.tarde.length ? "riesgo" : "espera";
    });

    // Lo que frena el motor: lo del cliente atrasado, tu paso atrasado, y lo que el paso de ahora necesita del cliente
    res.engranajes.forEach(function (g) {
      if (g.quien !== "cliente" || g.hecho || g.espera || !g.puede || g.tipo === "link" || g.tipo === "opinion") return;
      var ahora = g.en.indice === res.actual;
      if (g.estado === "atrasado") res.frenos.push({ engranaje: g, paso: g.en, quien: "cliente", dias: diasEntre(g.fecha, hoy), nivel: 3 });
      else if (g.estado === "hoy" || ahora) res.frenos.push({ engranaje: g, paso: g.en, quien: "cliente", dias: 0, nivel: 1 });
    });
    if (res.actual >= 0 && M[res.actual].atrasoMio) {
      var yoTarde = M[res.actual].mio;
      res.frenos.push({ engranaje: yoTarde, paso: M[res.actual], quien: "yo", dias: diasEntre(yoTarde.fecha, hoy), nivel: 2 });
    }
    res.frenos.sort(function (a, b) { return b.nivel - a.nivel || a.paso.indice - b.paso.indice || b.dias - a.dias; });
    res.freno = res.frenos[0] || null;

    res.terminado = res.engranajes.every(function (g) { return g.hecho; });
    res.pct = res.terminado ? 100 : Math.min(99, Math.round(suma / total * 100));
    return res;
  }

  /** El paso que sigue empieza a girar: el primero que no está listo pasa a "en curso". Lo devuelve. */
  function arrancarSiguiente(p) {
    var s = (p.pasos || []).find(function (x) { return x.estado !== "listo"; });
    if (s && s.estado === "pendiente") s.estado = "curso";
    return s || null;
  }
  /**
   * Lo que el panel mueve solo: si ya están las pruebas (todos los videos grabados, todos editados, el primero publicado),
   * ese paso queda listo y arranca el siguiente. Se llama cuando mueves un video.
   */
  function girar(p, r, ahora) {
    var m = motor(p, r, String(ahora || "").slice(0, 10)), listos = [];
    m.pasos.forEach(function (x) { if (x.mio.hecho && x.paso.estado !== "listo") { x.paso.estado = "listo"; x.paso.hechoEl = ahora; listos.push(x.paso); } });
    return { listos: listos, siguiente: listos.length ? arrancarSiguiente(p) : null };
  }

  /**
   * Para un cliente que ya tenías (empezaste antes de usar el panel): marca hechos los pasos anteriores,
   * el elegido queda "en curso", y lo atrasado se corre a hoy sin perder el espacio entre pasos.
   * Lo que le toca al cliente con fecha pasada queda para mañana (no aparece como atrasado: recién empiezas a medir).
   */
  function avanzarHasta(p, indice, hoy, ahora) {
    if (!indice || indice < 1 || indice >= (p.pasos || []).length) return p;
    var actual = p.pasos[indice], viejoPrimer = fechaPrimerVideo(p);
    (p.pagos || []).forEach(function (x) { if (x.estado === "pagado") x.alDia = true; });
    var corre = actual.fecha && actual.fecha < hoy ? diasEntre(actual.fecha, hoy) : 0;
    // En un lanzamiento el día de la promo es fijo: solo se corre lo atrasado. En lo demás se corre todo igual.
    var todo = p.tipo !== "lanzamiento";
    p.pasos.forEach(function (s, i) {
      // Lo de antes queda hecho pero «puesto al día»: no es trabajo de hoy (ni para tu registro ni para el parte)
      if (i < indice) { s.estado = "listo"; s.hechoEl = s.hechoEl || ahora; s.alDia = true; return; }
      if (s.fecha && corre && (todo || s.fecha < hoy)) s.fecha = sumarDias(s.fecha, corre);
      if (i === indice) s.estado = "curso";
    });
    for (var i = indice + 1; i < p.pasos.length; i++) if (p.pasos[i].fecha && p.pasos[i].fecha < p.pasos[i - 1].fecha) p.pasos[i].fecha = p.pasos[i - 1].fecha;
    var nuevoPrimer = fechaPrimerVideo(p);
    if (viejoPrimer && nuevoPrimer !== viejoPrimer) {
      (p.pagos || []).forEach(function (x) { if (x.estado === "pendiente" && !x.garantia && x.vence === viejoPrimer) x.vence = nuevoPrimer; });
      if (p.tipo === "alcance" && p.fechaClave === viejoPrimer) p.fechaClave = nuevoPrimer;
    }
    (p.tareas || []).forEach(function (t) {
      if (!t.fecha || t.fecha >= hoy) return;
      // Mañana, no hoy: te da un día para confirmar lo que ya estaba hecho antes de usar el panel
      var corrida = todo && corre ? sumarDias(t.fecha, corre) : "", manana = sumarDias(hoy, 1);
      t.fecha = corrida && corrida > manana ? corrida : manana;
    });
    // Los videos siguen al camino: grabados, en edición o listos para su ok
    var hecho = function (cl) { return p.pasos.some(function (s, j) { return j < indice && clasePaso(s) === cl; }); };
    var estado = hecho("edicion") ? "aprobar" : clasePaso(actual) === "edicion" ? "edicion" : hecho("grabacion") ? "grabado" : "";
    if (estado) (p.videos || []).forEach(function (v) { if (v.estado === "guion") { v.estado = estado; v.cambiadoEl = ahora; } });
    return p;
  }

  /** Lo que viene en los próximos días, de todos tus clientes activos: pasos, publicaciones, cobros y lo que vence de su lado. */
  function semana(clientes, hoy, dias) {
    var fin = sumarDias(hoy, (dias || 7) - 1), ev = [];
    var dentro = function (f) { return !!f && f >= hoy && f <= fin; };
    (clientes || []).forEach(function (c) {
      if (c.estado !== "activo") return;
      var p = c.proyecto, r = c.respuestas || {}, gar = estadoGarantia(p);
      (p.pasos || []).forEach(function (s) { if (s.estado !== "listo" && dentro(s.fecha)) ev.push({ fecha: s.fecha, tipo: "paso", texto: s.nombre, cliente: c, tab: "proceso" }); });
      (p.videos || []).forEach(function (v) { if (v.estado !== "publicado" && dentro(v.fechaPub)) ev.push({ fecha: v.fechaPub, tipo: "video", texto: "Publicar «" + v.titulo + "»", cliente: c, tab: "videos" }); });
      (p.pagos || []).forEach(function (x) {
        if (x.estado !== "pendiente") return;
        if (x.garantia && gar && !gar.lista) return;   // la segunda mitad no tiene día: se cobra cuando llegan sus N
        var f = x.garantia && gar && gar.lista ? hoy : x.vence;
        if (dentro(f)) ev.push({ fecha: f, tipo: "cobro", texto: "Cobrar " + bs(x.monto) + " Bs", cliente: c, tab: "pagos" });
      });
      tareasAbiertas(p, r).forEach(function (t) { if (dentro(t.fecha)) ev.push({ fecha: t.fecha, tipo: "tarea", texto: "De su lado: " + minus(suyo(t.nombre)), cliente: c, tab: "proceso" }); });
    });
    var orden = { cobro: 0, video: 1, paso: 2, tarea: 3 };
    return ev.sort(function (a, b) { return a.fecha.localeCompare(b.fecha) || orden[a.tipo] - orden[b.tipo]; });
  }

  // ---------- alertas (tu inicio) ----------
  /**
   * Lo urgente de un cliente. c = { proyecto, respuestas, estado, veces, creado, ultimaNovedad }.
   * nivel 3 = rojo (atrasado), 2 = ámbar (hoy), 1 = azul (aviso).
   * Cada alerta: { nivel, texto, tab, msg (el WhatsApp que la mueve), accion (qué hacer, en tu sistema), paso (el paso que toca) }.
   */
  function alertas(c, hoy, ahora, op) {
    var p = c.proyecto, r = c.respuestas || {}, out = [];
    if (c.estado !== "activo") return out;
    function a(nivel, texto, tab, msg, accion, paso) { out.push({ nivel: nivel, texto: texto, tab: tab, msg: msg || null, accion: accion || "", paso: paso || "" }); }
    // A qué paso frena cada cosa de su lado (si ese paso ya lo hiciste tú, solo dice de cuál es)
    var m = motor(p, r, hoy, { abierto: c.veces == null || c.veces > 0 });
    function frena(id) {
      var x = m.ubicar[id];
      if (!x) return "";
      return (x.mio.hecho ? " · es de «" : " · frena «") + x.paso.nombre + "»";
    }
    var pasoDe = function (id) { var x = m.ubicar[id]; return x ? x.paso.id : ""; };

    tareasAbiertas(p, r).forEach(function (t) {
      if (t.fecha && t.fecha < hoy) a(3, "Atrasado de su lado: " + minus(suyo(t.nombre)) + " (era para " + cuando(t.fecha, hoy) + ")" + frena(t.id), "proceso", { tipo: "tarea", id: t.id }, "tarea", pasoDe(t.id));
      else if (t.fecha === hoy) a(2, "Vence hoy de su lado: " + minus(suyo(t.nombre)) + frena(t.id), "proceso", { tipo: "tarea", id: t.id }, "tarea", pasoDe(t.id));
    });
    tareasPorConfirmar(p, r).forEach(function (t) { a(2, "Dice que ya hizo: " + minus(suyo(t.nombre)) + ". Confírmalo", "proceso", null, "confirmar", pasoDe(t.id)); });
    var conGarantia = !!estadoGarantia(p) && (p.pagos || []).some(function (x) { return x.garantia; });
    (p.videos || []).forEach(function (v) {
      var ev = estadoVideo(v, r), x = respuestaVideo(v, r);
      if (ev === "cambios") a(v.fechaPub && v.fechaPub <= sumarDias(hoy, 2) ? 3 : 2, "Pidió un cambio en «" + v.titulo + "»" + (x && x.nota ? ": " + x.nota : "") + (v.fechaPub ? " (sale " + cuando(v.fechaPub, hoy) + ")" : ""), "videos", null, "cambios");
      else if (ev === "aprobar") {
        var o = okDe(v, r), h = horasEntre(o.pidio, ahora);
        // Con garantía, su ok en 24 horas es una de sus 5 cosas: se avisa por horas, desde que lo puede ver
        if (conGarantia && !o.pidio) a(2, v.previa ? "Pídele su ok a «" + v.titulo + "»: desde ahí corren sus 24 horas" : "«" + v.titulo + "» está para su ok, pero sin el link para verlo: pégalo y pídeselo", "videos", { tipo: "aprobar", id: v.id }, "aprobar");
        else if (conGarantia && h >= GAR.horasRiesgo) a(h > GAR.horasOk ? 3 : 2, (h > GAR.horasOk ? "Pasaron más de 24 h sin su ok a «" : "Lleva " + Math.floor(h) + " h esperando su ok a «") + v.titulo + "»" + (h > GAR.horasOk ? ": es una de sus 5 cosas" : ": a las 24 se rompe una de sus 5 cosas"), "videos", { tipo: "aprobar24", id: v.id }, "aprobar24");
        else if (!conGarantia) {
          var dias = v.cambiadoEl ? diasEntre(v.cambiadoEl.slice(0, 10), hoy) : 0;
          if (dias >= 1) a(2, "Esperando su ok a «" + v.titulo + "» hace " + dias + (dias === 1 ? " día" : " días"), "videos", { tipo: "aprobar", id: v.id }, "aprobar");
        }
      }
    });
    (p.pasos || []).forEach(function (s) {
      if (s.estado === "listo" || !s.fecha) return;
      if (s.fecha < hoy) a(3, "Te atrasaste: " + minus(s.nombre) + " (prometido para " + cuando(s.fecha, hoy) + "). Avísale tú primero", "proceso", { tipo: "atraso", id: s.id }, "atraso", s.id);
      else if (s.fecha === hoy) a(1, "Vence hoy: " + minus(s.nombre), "proceso", null, "paso", s.id);
    });
    var gar = estadoGarantia(p), resultados = pasoPorClases(p, ["resultados"]), arranque = pasoPorClases(p, ["arranque"]);
    // Sin su número no se puede medir la garantía: se anota en la sesión de arranque
    if (!gar && arranque && arranque.estado === "listo" && (p.pagos || []).some(function (x) { return x.garantia && x.estado === "pendiente"; }))
      a(2, "Falta su número de la garantía: anota lo que le deja una venta", "pagos", null, "numero", arranque.id);
    (p.pagos || []).forEach(function (x) {
      if (x.estado === "pagado" || x.estado === "anulado") return;
      if (r.pagos && r.pagos[x.id]) return a(3, "Dice que ya pagó " + bs(x.monto) + " Bs (" + minus(x.concepto) + "). Revisa y confírmalo", "pagos", null, "dijoPago");
      // La segunda mitad de la garantía: se cobra el día que llegan sus N clientes; si el canje terminó sin llegar, se decide con sus 5 cosas
      if (x.garantia && gar) {
        if (gar.lista) return a(3, "Llegaron sus " + gar.n + ": cobra la segunda mitad (" + bs(x.monto) + " Bs), graba su testimonio y ofrécele el plan de cada mes", "pagos", { tipo: "dia15", id: x.id }, "paso", resultados ? resultados.id : "");
        if (p.fechaClave && hoy > p.fechaClave) {
          // Si en su fecha no llegaron: 7 días más con su ganador, sin costo; si igual no llegan, se decide con sus 5 cosas
          var ext = extensionGarantia(p, hoy);
          if (!ext) return a(3, "Terminó su fecha y llegaron " + gar.llegaron + " de " + gar.n + ": avísale y empieza los " + GAR.diasExtra + " días más con su video ganador", "pagos", { tipo: "extension", id: x.id }, "extension");
          if (!ext.termino) return a(1, "Día " + ext.dia + " de " + GAR.diasExtra + " más con su ganador: llegaron " + gar.llegaron + " de " + gar.n, "pagos", null, "ritmo");
          return a(2, "Terminaron los " + GAR.diasExtra + " días más y llegaron " + gar.llegaron + " de " + gar.n + ". Si cumplió sus 5 cosas, la segunda mitad no se cobra (márcala); si no, se cobra igual", "pagos", { tipo: "garantia", id: x.id }, "paso", resultados ? resultados.id : "");
        }
        // El ritmo solo con números traídos del cupón (sin ellos, el aviso es «trae los números»)
        var k = p.fechaClave ? diasEntre(hoy, p.fechaClave) : 99, rg = ritmoGarantia(p, op && op.tasa);
        if (gar.llegaron >= Math.ceil(gar.n * 0.7) && !gar.avisado70) a(1, "Van " + gar.llegaron + " de " + gar.n + ": cuéntale cómo cierran la segunda mitad y agenda la visita del día 15", "pagos", { tipo: "vamos", id: x.id }, "setenta");
        else if (p.tipo === "lanzamiento" && gar.llegaron >= Math.ceil(gar.n / 2) && !gar.sembrado) a(1, "Van la mitad (" + gar.llegaron + " de " + gar.n + "): siembra el plan de cada mes", "pagos", { tipo: "mitad", id: x.id }, "mitad");
        if (rg && gar.al && gar.llegaron < gar.n && k >= 0 && k <= 3 && rg.pct < GAR.k3 * 100) a(3, (k === 1 ? "Falta 1 día" : k === 0 ? "Es hoy" : "Faltan " + k + " días") + " y tiene " + rg.reservas + " reservas de unas " + rg.necesarias + ": no llega a sus " + gar.n, "pagos", null, "ritmo");
        else if (rg && gar.al && gar.llegaron < gar.n && k > 3 && k <= 7 && rg.pct < GAR.k7 * 100) a(2, "A " + k + " días de su fecha tiene " + rg.reservas + " reservas de unas " + rg.necesarias + " que le hacen falta", "pagos", null, "ritmo");
        return;
      }
      if (x.vence && x.vence <= hoy) a(3, "Cobrar " + bs(x.monto) + " Bs: " + minus(x.concepto) + (x.vence < hoy ? " (venció " + cuando(x.vence, hoy) + ")" : " (vence hoy)"), "pagos", { tipo: "cobro", id: x.id }, "cobro");
      else if (x.vence === sumarDias(hoy, 1)) a(1, "Mañana vence " + minus(x.concepto) + ": " + bs(x.monto) + " Bs", "pagos", { tipo: "cobro", id: x.id }, "cobro");
    });
    var enc = r.encuesta;
    if (enc && enc.el && diasEntre(String(enc.el).slice(0, 10), hoy) <= 7) {
      if (enc.nota >= 9) a(2, "Te calificó " + enc.nota + "/10: pídele su testimonio y a quién más le serviría", "resultados", { tipo: "testimonio" }, "testimonio");
      else if (enc.nota >= 7) a(2, "Te calificó " + enc.nota + "/10: pregúntale qué le faltó para un 10", "resultados", { tipo: "mejorar" }, "mejorar");
      else a(3, "Te calificó " + enc.nota + "/10: llámalo hoy y pregúntale qué falló", "resultados", { tipo: "mejorar" }, "mejorar");
    }
    if ((p.pasos || []).length && !pasoActual(p) && !enc) a(1, "Terminaste: invítalo a ver sus resultados y a calificar", "resultados", { tipo: "resultados" }, "resultados");
    var enMarcha = p.inicio && p.inicio <= hoy && pasoActual(p), ultimoParte = String(c.ultimaNovedad || "").slice(0, 10);
    if (enMarcha && ultimoParte !== hoy) {
      var sinParte = ultimoParte ? diasEntre(ultimoParte, hoy) : 0;
      if (sinParte >= GAR.sinParte) a(2, sinParte + " días sin parte: mándale cómo va", "novedades", { tipo: "parte" }, "parte");
      else a(1, "Falta el parte de hoy", "novedades", { tipo: "parte" }, "parte");
    }
    // 3 días sin señales suyas (no abrió su link, no marcó nada y no anotaste que hablaron), solo con la campaña andando
    var senal = ultimaSenal(c);
    if (enMarcha && c.veces && senal && diasEntre(senal.slice(0, 10), hoy) >= GAR.senales) a(2, diasEntre(senal.slice(0, 10), hoy) + " días sin señales suyas: escríbele o llámalo", "datos", { tipo: "senales" }, "senales");
    // Lo que el panel sabe de sus 5 cosas y de su cupón
    if (gar) {
      var cg = cosasGarantia(p, r, ahora), val = cg && cg.cosas.find(function (y) { return y.clave === "validar" && y.estado === "rota"; });
      if (val) a(3, "No está validando todos sus cupones: es una de sus 5 cosas", "pagos", null, "validar");
      var aire = pasoPorClases(p, ["aire"]), abiertas = aire && aire.estado === "listo" && p.fechaClave && hoy <= p.fechaClave;
      var diasNum = gar.al ? diasEntre(gar.al.slice(0, 10), hoy) : 99;
      if (abiertas && diasNum >= 2) a(1, gar.al ? "Trae los números de su cupón: hace " + diasNum + " días que no los ves" : "Trae los números de su cupón", "pagos", null, "numeros");
      if (p.fechaClave === hoy && String(gar.al).slice(0, 10) === hoy && gar.reservas > 0 && +String(ahora).slice(11, 13) >= GAR.diaPromoHora && gar.llegaron < gar.reservas * GAR.diaPromoParte)
        a(3, "Reservaron " + gar.reservas + " y van " + gar.llegaron + " validados: anda a la tienda", "pagos", null, "validar");
    }
    if (!c.veces && c.creado && String(c.creado) < restarHoras(ahora, 2)) a(2, "Nunca abrió su link: mándale la bienvenida", "datos", { tipo: "bienvenida" }, "bienvenida");
    return out.sort(function (x, y) { return y.nivel - x.nivel; });
  }
  function restarHoras(sello, h) {
    var f = selloDe(sello); if (!f) return "";
    f.setHours(f.getHours() - h);
    return iso(f) + " " + pad(f.getHours()) + ":" + pad(f.getMinutes());
  }

  // ---------- el borrador del parte del día ----------
  function fraseVideo(v) {
    return "«" + v.titulo + "»: " + ({ guion: "guion listo", grabado: "grabado", edicion: "en edición", aprobar: "listo para que lo veas", aprobado: "aprobado", publicado: "publicado" }[v.estado] || v.estado);
  }
  /** Escribe el mensaje del día con lo que cambió desde el último parte. Tú lo lees, lo corriges y lo mandas. */
  function borradorParte(p, r, hoy, ahora, desde) {
    desde = desde || hoy + " 00:00";
    function nuevo(s) { return s && s > desde; }
    var lineas = [], fin = "", pct = motor(p, r, hoy).pct;
    (p.pasos || []).forEach(function (s) { if (s.fecha > fin) fin = s.fecha; });
    if (p.inicio && fin && hoy >= p.inicio && hoy <= fin) lineas.push(p.etiqueta + ", día " + (diasEntre(p.inicio, hoy) + 1) + " de " + (diasEntre(p.inicio, fin) + 1) + " · vamos en " + pct + "%");
    else lineas.push(p.etiqueta + " · " + diaLargo(hoy) + " · vamos en " + pct + "%");

    var hechos = [];
    (p.pasos || []).forEach(function (s) { if (s.estado === "listo" && !s.alDia && nuevo(s.hechoEl)) hechos.push("Listo: " + minus(s.nombre)); });
    (p.videos || []).forEach(function (v) { if (nuevo(v.cambiadoEl)) hechos.push(fraseVideo(v)); });
    (p.tareas || []).forEach(function (t) { if (t.estado === "confirmado" && nuevo(t.confirmadoEl)) hechos.push("Quedó listo: " + minus(t.nombre)); });
    (p.pagos || []).forEach(function (x) { if (x.estado === "pagado" && !x.alDia && nuevo(x.pagadoEl) && x.vence !== p.inicio) hechos.push("Recibí tu pago de " + bs(x.monto) + " Bs. ¡Gracias!"); });
    var cur = pasoActual(p);
    if (hechos.length) lineas.push("Hoy:\n" + hechos.map(function (h) { return "• " + h; }).join("\n"));
    else if (cur) lineas.push("Hoy seguí con " + minus(cur.nombre) + ".");

    var gar = estadoGarantia(p);
    if (!gar) {
      if (cur) lineas.push("Lo que sigue: " + minus(cur.nombre) + (cur.fecha ? " (" + cuando(cur.fecha, hoy) + ")" : "") + ".");
      else lineas.push("Terminamos todos los pasos. Ahora vemos juntos tus resultados.");
    }

    // Lo que te toca: lo atrasado y lo que vence en los próximos 2 días, con su fecha (lo de más adelante lo ve en su link)
    var pronto = sumarDias(hoy, 2);
    var tuyo = tareasAbiertas(p, r).filter(function (t) { return !t.fecha || t.fecha <= pronto; }).map(function (t) { return minus(t.nombre) + (t.fecha ? " (" + (t.fecha < hoy ? "era para " : "para ") + cuando(t.fecha, hoy) + ")" : ""); })
      .concat(videosPorAprobar(p, r).map(function (v) { return "tu ok al video «" + v.titulo + "»"; }));
    lineas.push(tuyo.length ? "Te toca: " + unir(tuyo) + "." : "Hoy no te toca nada.");

    // Cómo vamos con tu número, siempre que tenga uno
    if (gar) lineas.push(gar.lista ? "¡Llegaron tus " + gar.n + " clientes con su cupón!" : "Tu número: llegaron " + gar.llegaron + " de " + gar.n + ".");

    var nums = (p.resultados || []).filter(function (x) { return x.valor; });
    if (nums.length && p.resultadosFecha === hoy) lineas.push("Tus números de hoy: " + nums.map(function (x) { return x.nombre + " " + x.valor; }).join(" · ") + ".");
    return lineas.join("\n");
  }

  // ---------- WhatsApp ----------
  function waLink(celular, texto) {
    return "https://wa.me/" + (celular ? "591" + celular : "") + "?text=" + encodeURIComponent(texto);
  }

  return {
    pad: pad, cap: cap, minus: minus, iso: iso, fechaDe: fechaDe, sumarDias: sumarDias, diasEntre: diasEntre, diaLargo: diaLargo, diaCorto: diaCorto,
    maxFecha: maxFecha, hace: hace, cuando: cuando, bs: bs, unir: unir, nuevoId: nuevoId, primerNombre: primerNombre, suyo: suyo, DIAS: DIAS,
    VIDEO: VIDEO, ORDEN_VIDEO: ORDEN_VIDEO, estadoVideo: estadoVideo, respuestaVideo: respuestaVideo,
    pasoActual: pasoActual, pasoSiguiente: pasoSiguiente, progreso: progreso,
    tareasAbiertas: tareasAbiertas, tareasPorConfirmar: tareasPorConfirmar, videosPorAprobar: videosPorAprobar, saldo: saldo, estadoGarantia: estadoGarantia,
    GAR: GAR, horasEntre: horasEntre, okDe: okDe, cosasGarantia: cosasGarantia, tasaLlegada: tasaLlegada, ritmoGarantia: ritmoGarantia, extensionGarantia: extensionGarantia, ultimaSenal: ultimaSenal,
    fechaPrimerVideo: fechaPrimerVideo, avanzarHasta: avanzarHasta, semana: semana,
    clasePaso: clasePaso, CLASE_INFO: CLASE_INFO, CLAVE_CLASE: CLAVE_CLASE, pasoPorClases: pasoPorClases, pasoDeTarea: pasoDeTarea, pasoDePago: pasoDePago, vincular: vincular,
    motor: motor, girar: girar, arrancarSiguiente: arrancarSiguiente,
    alertas: alertas, borradorParte: borradorParte, waLink: waLink
  };
});
