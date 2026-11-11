/**
 * Los pasos ya pensados del servicio de Grow Business (09/11). Mauricio los prende o apaga por cliente en su panel
 * (Clientes › Sus paneles) y marca «Vamos aquí». Todo lo demás se calcula: números de sesión, «cuándo», hecho o por venir y lo que le toca al cliente.
 *
 * El orden sale del corpus:
 * - Primero lo que vendes, después cómo lo vendes y al final cómo se enteran [07]: oferta y ángulos antes del contenido, y la venta antes de publicar.
 * - El dolor de Sneaker Fashion: la fuga estuvo en responder. Por eso «Estrategia de venta» va antes de publicar [LEADS][K10].
 * - Una sola grabación por cliente, salvo que haga falta otra (unreal/23).
 * - Revisar a mitad con números [CONSULTAS] y cerrar con resultados, que es donde nace la siguiente venta [MM3.04][L1.11].
 * - El cliente ve un solo pendiente a la vez: no agobiar [SC2.05][SC2.08].
 *
 * cuando: lista de [paso que debe estar prendido, texto]; gana la primera que aplique. {id} se reemplaza por el nombre real de ese paso.
 */
(function (raiz) {
  "use strict";
  var GRUPOS = [
    { id: "arranque", nombre: "Arranque" },
    { id: "estrategia", nombre: "Estrategia" },
    { id: "contenido", nombre: "Contenido" },
    { id: "venta", nombre: "Venta" },
    { id: "lanzar", nombre: "Salir a vender" }
  ];
  var S = "sesion", G = "grabacion";
  var CATALOGO = [
    { id: "bienvenida", g: "arranque", t: "Bienvenida", on: true, msg: "Te contamos cómo vamos a trabajar." },
    { id: "info", g: "arranque", t: "Información de tu negocio", on: true, msg: "Juntamos lo que necesitamos para preparar tu estrategia.", toca: "Mandarnos lo que tengas: productos, precios y lo que más se vende.", cuando: [["s1", "Antes de {s1}."]] },

    { id: "s1", g: "estrategia", tipo: S, t: "Tu negocio y tu oferta", on: true, msg: "Conocemos tus números y armamos lo que vas a ofrecer.", toca: "Tener a mano tus ventas de los últimos 3 meses y lo que te cuesta cada producto." },
    { id: "accesos", g: "arranque", t: "Accesos a tus redes", on: true, msg: "Dejamos listas tus cuentas para poder publicar.", toca: "Tener a mano tu celular para darnos acceso a tus redes.", cuando: [["s1", "Después de {s1}."]] },
    { id: "s2", g: "estrategia", tipo: S, t: "Ángulos y plan", on: true, msg: "Definimos a quién le hablamos, qué le decimos y qué pasa cuando responde.", toca: "Pensar quién va a responder a los que te escriban." },
    { id: "s3", g: "estrategia", tipo: S, t: "Estrategia", on: false, msg: "Una sesión más para dejar lista la estrategia." },

    { id: "guiones", g: "contenido", t: "Entrega de guiones", on: true, msg: "Escribimos los guiones de tus videos.", cuando: [["s3", "Después de {s3}."], ["s2", "Después de {s2}."], ["s1", "Después de {s1}."]] },
    { id: "confguion", g: "contenido", t: "Confirmación de guiones", on: true, msg: "Revisas los guiones antes de grabar.", toca: "Revisar y aprobar los guiones.", cuando: [["guiones", "Cuando te los entreguemos."]] },
    { id: "sguion", g: "contenido", tipo: S, t: "Ajuste de guiones", on: false, msg: "Revisamos juntos los guiones." },
    { id: "g1", g: "contenido", tipo: G, t: "Grabación", on: true, msg: "Grabamos tus videos.", toca: "Tener listos tus productos y el lugar.", cuando: [["confguion", "Cuando aprobemos los guiones."], ["guiones", "Cuando estén los guiones."]] },
    { id: "g2", g: "contenido", tipo: G, t: "Grabación", on: false, msg: "Seguimos grabando tus videos.", toca: "Tener listos tus productos y el lugar.", cuando: [["g1", "Después de {g1}."]] },
    { id: "g3", g: "contenido", tipo: G, t: "Grabación", on: false, msg: "Terminamos de grabar tus videos.", toca: "Tener listos tus productos y el lugar.", cuando: [["g2", "Después de {g2}."], ["g1", "Después de {g1}."]] },
    { id: "equipo", g: "contenido", t: "Videos con tu equipo", on: false, msg: "Tu equipo graba con nuestros guiones.", toca: "Que tu equipo grabe los videos con los guiones.", cuando: [["confguion", "Cuando aprobemos los guiones."], ["guiones", "Cuando estén los guiones."]] },
    { id: "edicion", g: "contenido", t: "Edición", on: true, msg: "Editamos tus videos.", cuando: [["g3", "Después de grabar."], ["g2", "Después de grabar."], ["g1", "Después de grabar."], ["equipo", "Cuando tu equipo los termine."]] },
    { id: "confvideos", g: "contenido", t: "Confirmación de videos", on: true, msg: "Revisas los videos antes de publicarlos.", toca: "Aprobar cada video en 24 horas.", cuando: [["edicion", "Cuando estén editados."]] },

    { id: "sventa", g: "venta", tipo: S, t: "Estrategia de venta", on: true, msg: "Definimos cómo atender y cerrar a los que lleguen.", toca: "Traer a quien responde a tus clientes.", cuando: [["publicar", "Antes de publicar."]] },

    { id: "publicar", g: "lanzar", t: "Publicación de videos", on: true, msg: "Tus videos salen y vemos cuáles funcionan.", cuando: [["confvideos", "Cuando apruebes los videos."], ["edicion", "Cuando estén editados."]] },
    { id: "pauta", g: "lanzar", t: "Publicidad", on: true, msg: "Le ponemos publicidad a lo que funciona.", cuando: [["publicar", "Cuando veamos qué video funciona."]] },
    { id: "victoria", g: "lanzar", t: "Primera venta", on: true, msg: "Tu primer cliente que llegó por esto.", cuando: [["pauta", "Cuando empiece a moverse la publicidad."], ["publicar", "Cuando salgan los videos."]] },
    { id: "srev", g: "lanzar", tipo: S, t: "Revisión de números", on: true, msg: "Vemos qué trajo cada video y ajustamos.", toca: "Traer cuántos te escribieron y cuántos compraron." },
    { id: "sextra", g: "lanzar", tipo: S, t: "Sesión extra", on: false, msg: "Una sesión más para lo que haga falta." },
    { id: "lanz", g: "lanzar", t: "Lanzamiento", on: false, msg: "Tu día fuerte." },
    { id: "sres", g: "lanzar", tipo: S, t: "Resultados y lo que sigue", on: true, msg: "Vemos lo que logramos y lo que viene.", toca: "Tener a mano tus ventas del mes." }
  ];
  var POR_ID = {};
  CATALOGO.forEach(function (p) { POR_ID[p.id] = p; });

  /** Atajos: prenden y apagan varios botones de una vez. */
  var PRESETS = [
    { id: "completo", nombre: "Grabamos nosotros", on: {} },
    { id: "equipo", nombre: "Graba su equipo", on: { g1: false, equipo: true, edicion: false, confvideos: false } },
    { id: "guiones", nombre: "Hasta los guiones", on: { g1: false, edicion: false, confvideos: false, publicar: false, pauta: false } },
    { id: "consultoria", nombre: "Solo consultoría", on: { guiones: false, confguion: false, g1: false, edicion: false, confvideos: false, publicar: false, pauta: false, accesos: false } }
  ];
  function preset(id) {
    var p = PRESETS.filter(function (x) { return x.id === id; })[0], on = {};
    CATALOGO.forEach(function (c) { on[c.id] = c.on; });
    Object.keys((p && p.on) || {}).forEach(function (k) { on[k] = p.on[k]; });
    return on;
  }

  function prendido(cfg, c) { var v = cfg.on && cfg.on[c.id]; return typeof v === "boolean" ? v : c.on; }

  /** Lo que ve el cliente: solo lo prendido, con sus números, su estado y su «cuándo». */
  function armar(cfg) {
    cfg = cfg || {};
    var lista = CATALOGO.filter(function (c) { return prendido(cfg, c); });
    var nS = 0, nG = 0, grabs = lista.filter(function (c) { return c.tipo === G; }).length, ref = {}, nombre = {};
    lista.forEach(function (c) {
      if (c.tipo === S) { nS++; nombre[c.id] = "Sesión " + nS + " · " + c.t; ref[c.id] = "la Sesión " + nS; }
      else if (c.tipo === G) { nG++; nombre[c.id] = grabs > 1 ? "Grabación " + nG : "Grabación"; ref[c.id] = grabs > 1 ? "la grabación " + nG : "la grabación"; }
      else { nombre[c.id] = c.t; ref[c.id] = c.t.toLowerCase(); }
    });
    var iAqui = cfg.aqui === "fin" ? lista.length : -1;
    if (iAqui < 0) lista.some(function (c, i) { if (c.id === cfg.aqui) { iAqui = i; return true; } return false; });
    if (iAqui < 0) iAqui = 0;
    return lista.map(function (c, i) {
      var f = (cfg.fechas && cfg.fechas[c.id]) || {}, tx = (cfg.txt && cfg.txt[c.id]) || {}, d = tx.d || "";
      if (!d) (c.cuando || []).some(function (w) {
        if (!ref[w[0]]) return false;
        d = w[1].replace(/\{(\w+)\}/g, function (_, id) { return ref[id] || ""; });
        return true;
      });
      if (!d && c.tipo === S) d = "Por agendar.";
      if (!d && c.tipo === G) d = "Por agendar.";
      return {
        id: c.id, tipo: c.tipo || "", t: tx.t || nombre[c.id], d: d, msg: tx.msg || c.msg, toca: tx.toca || c.toca || "",
        estado: i < iAqui ? "listo" : i === iAqui ? "curso" : "prox",
        fecha: f.f || "", hora: f.h || "", meet: f.meet || "", link: tx.link || "", entregado: tx.el || ""
      };
    });
  }
  /** Qué número de sesión dice el título: «1 CONSULTORÍA», «2da Consultoría», «CONSULTORÍA 1», «Primera consultoría». */
  function numeroDe(t) {
    var m = t.match(/(\d+)\s*(?:ra|da|er|ro|ta|°|º|\.)?\s*(?:consult|sesi)/i) || t.match(/(?:consult[\wÀ-ÿ]*|sesi[oó]n)\s*(?:n[°º.]?\s*)?(\d+)/i);
    if (m) return Number(m[1]);
    var w = t.toLowerCase().match(/primera|segunda|tercera|cuarta|quinta/);
    return w ? { primera: 1, segunda: 2, tercera: 3, cuarta: 4, quinta: 5 }[w[0]] : 0;
  }
  function pasoPorTitulo(t, vista, usados) {
    var ses = vista.filter(function (p) { return p.tipo === S; }), gr = vista.filter(function (p) { return p.tipo === G; });
    var libre = function (l) { return l.filter(function (p) { return !p.fecha && p.estado !== "listo" && !usados[p.id]; })[0]; };
    var de = function (id) { return vista.filter(function (p) { return p.id === id; })[0] || null; };
    if (/grab/i.test(t)) { var n = (t.match(/grab\S*\s*(\d)/i) || [])[1]; return (n && gr[Number(n) - 1]) || libre(gr) || gr[0] || null; }
    if (/venta/i.test(t)) return de("sventa");
    if (/revisi/i.test(t)) return de("srev");
    if (/resultado/i.test(t)) return de("sres");
    if (/consult|sesi/i.test(t)) { var k = numeroDe(t); return (k && ses[k - 1]) || libre(ses) || null; }
    return null;
  }
  /** Tu Google Calendar manda: pone a cada sesión su fecha, su hora y su Meet, y le quita la fecha a la que ya no está. */
  function aplicarCalendario(cfg, citas, hoy) {
    var out = Object.assign({}, cfg, { fechas: Object.assign({}, cfg && cfg.fechas) }), usados = {};
    (citas || []).slice().sort(function (a, b) { return (a.f + a.h).localeCompare(b.f + b.h); }).forEach(function (c) {
      if (c.f < hoy) return;
      var vista = armar(out), por = function (fn) { return vista.filter(fn)[0]; };
      var paso = c.paso ? por(function (p) { return p.id === c.paso; }) : (c.meet && por(function (p) { return p.meet === c.meet; })) || pasoPorTitulo(c.titulo || "", vista, usados);
      if (!paso || usados[paso.id]) return;
      usados[paso.id] = true;
      out.fechas[paso.id] = { f: c.f, h: c.h };
      if (c.meet) out.fechas[paso.id].meet = c.meet;
    });
    armar(out).forEach(function (p) { if ((p.tipo === S || p.tipo === G) && !usados[p.id] && p.fecha >= hoy) delete out.fechas[p.id]; });
    return out;
  }
  var API = { GRUPOS: GRUPOS, CATALOGO: CATALOGO, PRESETS: PRESETS, POR_ID: POR_ID, preset: preset, prendido: prendido, armar: armar, aplicarCalendario: aplicarCalendario };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  raiz.PasosGB = API;
})(typeof window !== "undefined" ? window : globalThis);
