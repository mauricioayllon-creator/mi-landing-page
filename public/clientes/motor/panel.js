/**
 * Motor de los paneles por cliente · Grow Business.
 * Cada cliente tiene su carpeta /clientes/<cliente>/ con un index.html (cáscara) y un datos.json.
 *
 * Desde el 09/11 el panel es corto a propósito: dónde estamos, lo próximo, lo que les toca y el camino.
 * Lo que aún no llega no pide nada: se ve apagado, con su «cuándo» («Se ve en la Sesión 2», «Cuando grabemos»).
 * El camino sale de D.avances. Calendario, etapas, pedidos y novedades existen, pero van apagados:
 * Mauricio los enciende, y cambia o apaga cada paso, desde su panel (Clientes › Sus paneles).
 *
 * El plan se cuenta en DÍAS. El día 1 puede no existir todavía (plan.dia1 = null): cuando se agenda la sesión
 * "ancla", las fechas se llenan solas. Cosas con fecha fija usan "fecha": "AAAA-MM-DD"; atadas al plan, "dia": n.
 *
 * Agenda: si config.js trae AGENDA_ENDPOINT, pide la clave del cliente (?k= en el link, después queda guardada).
 * Para probar otro día: ?hoy=AAAA-MM-DD
 */
(function () {
  "use strict";
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var TXT = { listo: "Listo", curso: "En curso", prox: "Próximo", hoy: "Hoy", agendar: "Por agendar", confirmar: "Por confirmar" };
  var SEC_BASE = { toca: true, sesiones: true, calendario: false, etapas: false, pedidos: false, novedades: false, publicos: false };

  function svg(d, s) { return "<svg width='" + (s || 18) + "' height='" + (s || 18) + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>" + d + "</svg>"; }
  var I = {
    gear: "<path d='M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'/><path d='M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z'/>",
    check: "<path d='M20 6 9 17l-5-5'/>",
    cal: "<path d='M8 2v4M16 2v4M3 10h18'/><rect x='3' y='4' width='18' height='18' rx='2'/>",
    video: "<path d='m16 13 5.2 3.1a.5.5 0 0 0 .8-.4V8.3a.5.5 0 0 0-.8-.4L16 11'/><rect x='2' y='6' width='14' height='12' rx='2'/>",
    lista: "<path d='M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01'/>",
    mapa: "<path d='M14.1 5.6 9.9 3.5a2 2 0 0 0-1.8 0L3.6 5.8A1 1 0 0 0 3 6.7v12.7a.6.6 0 0 0 .9.5l4.2-2.1a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.5-2.3a1 1 0 0 0 .6-.9V4.6a.6.6 0 0 0-.9-.5l-4.2 2.1a2 2 0 0 1-1.8 0Z'/><path d='M15 6v15M9 3v15'/>",
    charla: "<path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z'/>",
    gente: "<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'/>",
    enlace: "<path d='M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/>",
    candado: "<rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>"
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fd(s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function iso(f) { return f.getFullYear() + "-" + pad(f.getMonth() + 1) + "-" + pad(f.getDate()); }
  function sumar(s, n) { var f = fd(s); f.setDate(f.getDate() + n); return iso(f); }
  function entre(a, b) { return Math.round((fd(b) - fd(a)) / 864e5); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function largo(s) { var f = fd(s); return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; }
  function corto(s) { var f = fd(s); return DIAS[f.getDay()].slice(0, 3) + " " + f.getDate() + " " + MESES[f.getMonth()].slice(0, 3); }
  function sinEmoji(s) { return String(s == null ? "" : s).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{FE0F}\u{200D}]/gu, "").replace(/^\s+/, ""); }
  function esc(s) { return sinEmoji(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cv(c) { return getComputedStyle(document.documentElement).getPropertyValue("--" + c).trim(); }
  function $(id) { return document.getElementById(id); }
  function ul(a) { return "<ul>" + (a || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
  function slug(t) { return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

  var HOY = (function () {
    var q = new URLSearchParams(location.search).get("hoy");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q;
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { return iso(new Date()); }
  })();

  // datos.json vive junto al index.html del cliente (sirve con o sin "/" al final del link)
  var BASE = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  var CLIENTE = BASE.split("/").pop();
  var ENDPOINT = window.AGENDA_ENDPOINT || "";
  var LS = "panel-clave-" + CLIENTE;

  // ---------- clave del cliente ----------
  function leerClave() {
    var q = new URLSearchParams(location.search).get("k");
    if (q) { guardarClave(q); return q; }
    try { return localStorage.getItem(LS) || ""; } catch (e) { return ""; }
  }
  function guardarClave(k) { try { localStorage.setItem(LS, k); } catch (e) { /* sin memoria: igual sirve con ?k= */ } }
  function pedirRemoto(k) {
    if (!ENDPOINT) return Promise.resolve(null);
    if (!k) return Promise.resolve({ ok: false, error: "clave" });
    return fetch(ENDPOINT + "?accion=ver&cliente=" + encodeURIComponent(CLIENTE) + "&k=" + encodeURIComponent(k))
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });   // si la agenda no responde, el panel igual se ve (sin botones)
  }
  /** Lo que Mauricio apagó o cambió desde su panel. Si tarda o falla, el panel sale con lo de siempre. */
  function pedirAjustes() {
    if (!window.PANEL_ENDPOINT) return Promise.resolve(null);
    return Promise.race([
      fetch(window.PANEL_ENDPOINT, { method: "POST", body: JSON.stringify({ accion: "panel-ajustes-ver", carpeta: CLIENTE }) })
        .then(function (r) { return r.json(); }).then(function (r) { return r && r.ok ? r.ajustes : null; }).catch(function () { return null; }),
      new Promise(function (ok) { setTimeout(function () { ok(null); }, 6000); })
    ]);
  }

  var CLAVE = leerClave();
  Promise.all([
    fetch(BASE + "/datos.json", { cache: "no-store" }).then(function (r) { return r.json(); }),
    pedirRemoto(CLAVE),
    pedirAjustes()
  ]).then(function (res) {
    var D = res[0], R = res[1];
    if (R && R.error === "clave") return candado(!!CLAVE);
    if (R && R.ok) { mezclar(D, R); D._agenda = { endpoint: ENDPOINT, cliente: CLIENTE, clave: CLAVE, correos: R.correos || "" }; }
    armar(D, res[2] || {});
  }).catch(function () { $("ahoraTitulo").textContent = "No pudimos cargar el plan. Recarga la página."; });

  /** Pantalla de clave: el panel no se muestra hasta que la clave sea correcta. */
  function candado(fallo) {
    document.body.classList.add("bloqueado");
    var c = document.createElement("div");
    c.className = "candado";
    c.innerHTML = "<div class='card'><div class='burbuja'>" + svg(I.candado, 22) + "</div><h2>Tu panel de Grow Business</h2>" +
      "<p class='mudo'>Escribe la clave que te pasamos para entrar.</p>" +
      "<form><input id='claveIn' autocomplete='off' autocapitalize='off' spellcheck='false' placeholder='Clave' required>" +
      "<button class='btn azul' type='submit'>Entrar</button></form><p class='err' id='claveErr'>" + (fallo ? "Esa clave no es correcta. Revisa el link o la clave." : "") + "</p></div>";
    document.body.appendChild(c);
    c.querySelector("form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var k = $("claveIn").value.trim(), b = c.querySelector("button");
      b.disabled = true; b.textContent = "Entrando…";
      pedirRemoto(k).then(function (R) {
        if (R && R.ok) { guardarClave(k); location.replace(BASE + location.search.replace(/([?&])k=[^&]*&?/, "$1").replace(/[?&]$/, "")); }
        else { b.disabled = false; b.textContent = "Entrar"; $("claveErr").textContent = R ? "Esa clave no es correcta." : "No pudimos comprobar la clave. Intenta de nuevo."; }
      });
    });
  }

  /** Junta lo que dice datos.json con las sesiones agendadas en la hoja. */
  function mezclar(D, R) {
    (R.sesiones || []).forEach(function (s) {
      var loc = D.sesiones.filter(function (x) { return x.id === s.id; })[0];
      if (!loc) {
        loc = { id: s.id, t: s.titulo, agendable: true };
        var ult = D.sesiones[D.sesiones.length - 1];
        D.sesiones.splice(ult && !ult.id ? D.sesiones.length - 1 : D.sesiones.length, 0, loc);
      }
      loc.fecha = s.fecha; loc.hora = s.hora; loc.meet = s.meet; loc.duracion = s.duracion; loc.tentativa = false; delete loc.dia;
      if (loc.ancla) { D.plan.dia1 = s.fecha; }
      var h = D.hitos.filter(function (x) { return x.sesion === s.id; })[0];
      if (loc.ancla) { if (h) h.hora = s.hora; return; }
      if (!h) { h = { sesion: s.id, titulo: loc.t }; D.hitos.push(h); }
      h.fecha = s.fecha; h.hora = s.hora; delete h.dia;
      h.texto = (h.textoAgendada || "Sesión agendada.") + (s.meet ? " Con Google Meet." : "");
    });
  }

  function sec(icono, titulo, sub, cuerpo, clase) {
    return "<section class='card sec" + (clase ? " " + clase : "") + "'><div class='sec-cab'><div class='burbuja'>" + svg(icono, 20) + "</div><div><h2>" + esc(titulo) + "</h2>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div></div>" + cuerpo + "</section>";
  }

  function armar(D, A) {
    var P = D.plan, N = P.duracionDias, DIA1 = P.dia1 || null, AG = D._agenda;
    var SEC = Object.assign({}, SEC_BASE, A.secciones || {});
    function fechaDia(n) { return DIA1 ? sumar(DIA1, n - 1) : null; }
    function fechaDe(x) { return x.fecha || (x.dia != null ? fechaDia(x.dia) : null); }
    function diaDe(f) { return DIA1 ? entre(DIA1, f) + 1 : null; }
    var LANZ = fechaDia(N);
    var ancla = D.sesiones.filter(function (s) { return s.ancla; })[0];

    // ---------- portada ----------
    document.body.classList.add("corto");
    document.title = D.cliente.nombre + " · " + (P.titulo || "Plan de " + N + " días");
    $("cliNombre").textContent = sinEmoji(D.cliente.nombre);
    $("cliInicial").textContent = D.cliente.inicial || D.cliente.nombre.charAt(0);
    $("cliEtiqueta").textContent = P.etiqueta || "PLAN DE " + N + " DÍAS";

    // ---------- el camino: los pasos (engranajes), con lo que Mauricio cambió o apagó ----------
    var pasos = (D.avances || []).map(function (x) {
      var o = (A.pasos || {})[slug(x.t)] || {};
      return { t: o.t || x.t, d: o.d || x.d || "", estado: o.estado || (x.ok ? "listo" : x.estado) || "prox", link: o.link || x.link || "", oculto: !!o.oculto };
    }).filter(function (x) { return !x.oculto; });
    var iAhora = -1;
    pasos.some(function (x, i) { if (x.estado === "curso") { iAhora = i; return true; } return false; });
    if (iAhora < 0) pasos.some(function (x, i) { if (x.estado !== "listo") { iAhora = i; return true; } return false; });
    var actual = pasos[iAhora], listos = pasos.filter(function (x) { return x.estado === "listo"; }).length;

    // lo próximo con fecha: una sesión o un hito
    var proximas = D.sesiones.map(function (s) { return { s: s, f: fechaDe(s) }; }).filter(function (x) { return x.f && x.f >= HOY && !x.s.tentativa; }).sort(function (a, b) { return a.f < b.f ? -1 : 1; });
    var prox = proximas[0];
    var proxH = D.hitos.map(function (h) { return { h: h, f: fechaDe(h) }; }).filter(function (x) { return x.f && x.f >= HOY; }).sort(function (a, b) { return a.f < b.f ? -1 : 1; })[0];
    var porAgendar = !prox && AG ? D.sesiones.filter(function (s) { return s.agendable && !fechaDe(s); })[0] : null;

    var h = "";
    var riel = pasos.map(function (x, i) { return "<i class='" + (x.estado === "listo" ? "ok" : i === iAhora ? "ya" : "") + "'></i>"; }).join("");
    var lineaProx = "";
    if (prox) {
      lineaProx = "<div class='proximo'>" + svg(I.cal) + "<div><small>Lo próximo</small><b>" + esc(prox.s.t) + "</b><span>" + cap(largo(prox.f)) + (prox.s.hora ? " · " + esc(prox.s.hora) : "") + "</span></div>" +
        (prox.s.meet ? "<a class='btn mini verde' href='" + esc(prox.s.meet) + "' target='_blank' rel='noopener'>Entrar</a>" : "") + "</div>";
    } else if (porAgendar) {
      lineaProx = "<div class='proximo'>" + svg(I.cal) + "<div><small>Lo próximo</small><b>" + esc(porAgendar.t) + "</b><span>Por agendar</span></div><button class='btn mini azul' data-agendar='" + esc(porAgendar.id) + "'>Agendar</button></div>";
    } else if (proxH) {
      lineaProx = "<div class='proximo'>" + svg(I.cal) + "<div><small>Lo próximo</small><b>" + esc(proxH.h.titulo) + "</b><span>" + cap(largo(proxH.f)) + (proxH.h.hora ? " · " + esc(proxH.h.hora) : "") + "</span></div></div>";
    }
    h += "<div class='ahora'><div class='card'><div class='ahora-sup'><span class='etiq'>Dónde estamos</span>" + (pasos.length ? "<span class='cuenta-pasos'>" + listos + " de " + pasos.length + "</span>" : "") + "</div>" +
      "<div class='ahora-fila'><span class='rueda" + (actual ? " gira" : "") + "'>" + svg(actual ? I.gear : I.check, 26) + "</span><h2>" + esc(actual ? actual.t : "Todo listo") + "</h2></div>" +
      ((A.mensaje || (actual && actual.d)) ? "<p class='ahora-msg'>" + esc(A.mensaje || actual.d) + "</p>" : "") +
      (pasos.length ? "<div class='riel'>" + riel + "</div>" : "") + lineaProx + "</div></div>";

    // ---------- lo que les toca (solo si hay algo) ----------
    if (SEC.toca) {
      var toca = [];
      D.sesiones.slice().reverse().forEach(function (s) { (s.tareas || []).forEach(function (t) { if (t.quien !== "nosotros" && !t.hecho) toca.push(t); }); });
      if (toca.length) {
        var fila = function (t) { return "<div class='tarea-c'><i></i><span>" + esc(t.que) + (t.cuando ? "<small>" + esc(/^\d{4}-\d{2}-\d{2}$/.test(t.cuando) ? corto(t.cuando) : t.cuando) + "</small>" : "") + "</span></div>"; };
        h += sec(I.lista, "Les toca", "", toca.slice(0, 3).map(fila).join("") + (toca.length > 3 ? "<details class='mas'><summary>Ver " + (toca.length - 3) + " más</summary>" + toca.slice(3).map(fila).join("") + "</details>" : ""));
      }
    }

    // ---------- el camino ----------
    if (pasos.length) {
      h += sec(I.gear, "El camino", "", "<ol class='camino'>" + pasos.map(function (x, i) {
        var ya = x.estado === "listo", ahora = i === iAhora;
        return "<li class='" + (ya ? "ok" : ahora ? "vamos" : "viene") + "'><span class='pt'>" + (ya ? svg(I.check, 14) : ahora ? svg(I.gear, 16) : "") + "</span><div><b>" + esc(x.t) + "</b>" +
          (x.d && !ya && !ahora ? "<small>" + esc(x.d) + "</small>" : "") + "</div>" +
          (x.link && (ya || ahora) ? "<a class='btn mini' href='" + esc(x.link) + "' target='_blank' rel='noopener'>" + svg(I.enlace, 13) + "Ver</a>" : "") + "</li>";
      }).join("") + "</ol>");
    }

    // ---------- sesiones: lo último que acordamos; lo demás, adentro ----------
    function item(x, est, sub, extra) {
      var ok = x.ok || est === "listo";
      return "<div class='item" + (ok ? " ok" : "") + "'><span class='ck'>" + (ok ? svg(I.check, 13) : "") + "</span><span class='txt'><b>" + esc(x.t) + "</b><small>" + esc(sub) + "</small>" + (extra || "") + "</span>" +
        (est ? "<span class='est estado " + est + "'>" + TXT[est] + "</span>" : "") + "</div>";
    }
    if (SEC.sesiones) {
      var ultima = D.sesiones.filter(function (x) { var f = fechaDe(x); return f && f < HOY && !x.tentativa && ((x.acuerdos && x.acuerdos.length) || (x.tareas && x.tareas.length)); }).pop();
      var cuerpo = "";
      if (ultima) {
        cuerpo += "<div class='acordamos'><small>" + esc(ultima.t) + " · " + corto(fechaDe(ultima)) + "</small>" + (ultima.acuerdos && ultima.acuerdos.length ? ul(ultima.acuerdos) : "") + "</div>";
      }
      var todas = D.sesiones.map(function (x) {
        var f = fechaDe(x), est = !f ? (x.id ? "agendar" : "") : x.tentativa ? "confirmar" : f < HOY ? "listo" : f === HOY ? "hoy" : "prox";
        var sub = f ? cap(largo(f)) + (x.hora ? " · " + x.hora : "") : x.d;
        var botones = "";
        if (x.meet && f && f >= HOY) botones += "<a class='btn mini verde' href='" + esc(x.meet) + "' target='_blank' rel='noopener'>Entrar al Meet</a>";
        if (AG && x.agendable && (!f || f >= HOY || x.tentativa)) botones += "<button class='btn mini' data-agendar='" + esc(x.id) + "'>" + (f && !x.tentativa ? "Cambiar fecha" : "Agendar") + "</button>";
        var acuerdos = "";
        if (x !== ultima && ((x.acuerdos && x.acuerdos.length) || (x.tareas && x.tareas.length))) {
          acuerdos = "<details class='acuerdos'><summary>Lo que acordamos</summary>" + (x.acuerdos && x.acuerdos.length ? ul(x.acuerdos) : "") + "</details>";
        }
        return item(x, est, sub, (botones ? "<span class='acciones'>" + botones + "</span>" : "") + acuerdos);
      }).join("");
      cuerpo += "<details class='mas'><summary>Ver todas las sesiones</summary><div class='lista'>" + todas + "</div>" + (AG ? "<button class='btn ancho' data-agendar='nueva'>Agendar una nueva sesión</button>" : "") + "</details>";
      h += sec(I.charla, ultima ? "Lo que acordamos" : "Sesiones", "", cuerpo, "sesiones");
    }

    // ---------- lo que Mauricio puede encender ----------
    if (SEC.calendario) h += sec(I.cal, "Calendario", "Toca un día para ver qué pasa.", "<div class='aviso' id='avisoCal'></div><div class='leyenda' id='leyenda'></div><h3 class='subt'>Los " + N + " días</h3><div class='tira' id='tira'></div><h3 class='subt'>El mes</h3><div class='meses' id='meses'></div><div class='detalle' id='detalle'></div>");
    if (SEC.etapas) h += sec(I.mapa, "Cómo trabajamos", "Toca una etapa para abrirla.", "<div class='etapas' id='listaEtapas'></div>");
    if (SEC.publicos && D.publicos) h += sec(I.gente, "A quién le hablamos", "", "<div class='publicos' id='listaPublicos'>" + D.publicos.map(function (p) { return "<div class='publico'><h3>" + esc(p.t) + "</h3><p>" + esc(p.d) + "</p></div>"; }).join("") + "</div>");
    if (SEC.pedidos && D.pedidos) h += sec(I.lista, "Lo que nos pueden mandar", "Lo que tengan. Lo que falte lo vemos juntos.", "<div class='lista'>" + D.pedidos.map(function (x) { return item(x, x.estado, x.d); }).join("") + "</div>");
    if (SEC.novedades && D.novedades) h += sec(I.lista, "Novedades", "", "<div class='novedades'>" + D.novedades.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; }).map(function (x) { return "<div class='nov'><small>" + esc(corto(x.fecha)) + "</small><p>" + esc(x.texto) + "</p></div>"; }).join("") + "</div>");

    if (D.contacto) h += "<div class='contacto-c'><span class='avatar'>" + esc(D.contacto.nombre.charAt(0)) + "</span><div><b>" + esc(D.contacto.nombre) + "</b><small>Su contacto en Grow Business</small></div></div>";

    document.querySelector("main").innerHTML = h;
    $("actualizado").textContent = D.actualizado ? "Actualizado el " + largo(D.actualizado) : "";

    if (SEC.calendario) pintarCalendario();
    if (SEC.etapas) pintarEtapas();

    function etapasConFecha() {
      D.etapas.forEach(function (e) {
        e.desdeF = e.desde || (e.desdeDia != null ? fechaDia(e.desdeDia) : null);
        e.hastaF = e.hasta || (e.hastaDia != null ? fechaDia(e.hastaDia) : null);
      });
    }
    function estadoEtapa(e) {
      if (e.hastaF && HOY > e.hastaF) return "listo";
      if (e.desdeF && HOY >= e.desdeF && (!e.hastaF || HOY <= e.hastaF)) return "curso";
      return "prox";
    }
    function pintarEtapas() {
      etapasConFecha();
      var le = $("listaEtapas");
      D.etapas.forEach(function (e) {
        var est = estadoEtapa(e);
        var rango = e.desdeF && e.hastaF ? (e.desdeF === e.hastaF ? cap(largo(e.desdeF)) : corto(e.desdeF) + " → " + corto(e.hastaF)) : e.desdeDia != null ? "Día " + e.desdeDia + (e.hastaDia !== e.desdeDia ? " al " + e.hastaDia : "") : "Hasta la " + P.anclaNombre;
        le.insertAdjacentHTML("beforeend", "<div class='etapa" + (est === "curso" ? " actual abierta" : "") + "'><button class='etapa-cab'><span class='num' style='background:" + cv(e.color) + "'>" + e.n + "</span>" +
          "<span><h3>" + esc(e.nombre) + "</h3><div class='fechas'>" + esc(rango) + "</div></span><span class='estado " + est + "'>" + TXT[est] + "</span></button>" +
          "<div class='etapa-cuerpo'><div class='bloque'><h4>De qué se trata</h4><p>" + esc(e.que) + "</p></div>" +
          "<div class='bloque'><h4>Lo que hacemos nosotros</h4>" + ul(e.hacemos) + "</div>" +
          "<div class='bloque'><h4>Lo que necesitamos de ustedes</h4>" + ul(e.ustedes) + "</div>" +
          "<div class='bloque'><h4>Lo que sale de esta etapa</h4><p>" + esc(e.sale) + "</p></div></div></div>");
      });
      le.addEventListener("click", function (ev) { var x = ev.target.closest(".etapa-cab"); if (x) x.parentNode.classList.toggle("abierta"); });
      if (!le.querySelector(".abierta")) le.firstElementChild.classList.add("abierta");
    }
    function pintarCalendario() {
      etapasConFecha();
      var TOPE = [HOY].concat(D.hitos.map(fechaDe)).filter(Boolean).sort().pop();
      function etapaDeFecha(f) {
        for (var i = 0; i < D.etapas.length; i++) { var e = D.etapas[i]; if (e.desdeF && f >= e.desdeF && f <= (e.hastaF || (e.hastaDia != null ? TOPE : ""))) return e; }
        return null;
      }
      function etapaDeDia(n) { for (var i = 0; i < D.etapas.length; i++) { var e = D.etapas[i]; if (e.desdeDia != null && n >= e.desdeDia && n <= e.hastaDia) return e; } return null; }
      function hitosDeFecha(f) { return D.hitos.filter(function (h) { return fechaDe(h) === f; }); }
      function hitoDeDia(n) { return D.hitos.filter(function (h) { return h.dia === n || (DIA1 && h.fecha === fechaDia(n)); })[0]; }
      var ley = $("leyenda");
      D.etapas.forEach(function (e) { ley.insertAdjacentHTML("beforeend", "<span><i style='background:" + cv(e.color) + "'></i>" + esc(e.nombre) + "</span>"); });
      if (!DIA1) $("avisoCal").textContent = "Las fechas aparecen cuando agendemos la " + sinEmoji(P.anclaNombre) + ".";
      else $("avisoCal").hidden = true;
      var tira = $("tira");
      for (var n = 1; n <= N; n++) {
        var e = etapaDeDia(n), hi = hitoDeDia(n), f = fechaDia(n);
        var st = e ? "background:" + cv(e.color + "s") + ";color:" + cv(e.color) + ";" : "";
        if (n === N) st = "background:linear-gradient(135deg,#e5484d,#7c3aed);color:#fff;";
        else if (hi && e) st = "background:" + cv(e.color) + ";color:#fff;";
        tira.insertAdjacentHTML("beforeend", "<button class='td" + (f === HOY ? " hoy" : "") + "' style='" + st + "' data-dia='" + n + "'><small>Día</small><b>" + n + "</b><small>" + (f ? corto(f).slice(4) : "—") + "</small></button>");
      }
      var conocidas = [HOY].concat(D.hitos.map(fechaDe), D.etapas.map(function (e) { return e.desdeF; }), D.etapas.map(function (e) { return e.hastaF; })).filter(Boolean).sort();
      var ini = fd(conocidas[0]), fin = fd(conocidas[conocidas.length - 1]), meses = $("meses");
      for (var y = ini.getFullYear(), mo = ini.getMonth(); y < fin.getFullYear() || (y === fin.getFullYear() && mo <= fin.getMonth()); mo === 11 ? (mo = 0, y++) : mo++) {
        var off = (new Date(y, mo, 1).getDay() + 6) % 7, total = new Date(y, mo + 1, 0).getDate();
        var html = "<div class='mes'><h3>" + MESES[mo] + " " + y + "</h3><div class='grilla'>";
        ["lu", "ma", "mi", "ju", "vi", "sá", "do"].forEach(function (d) { html += "<div class='ds'>" + d + "</div>"; });
        for (var i = 0; i < off; i++) html += "<div class='d vacio'></div>";
        for (var d = 1; d <= total; d++) {
          var s = iso(new Date(y, mo, d)), et = etapaDeFecha(s), hs = hitosDeFecha(s), cls = "d", sty = "";
          if (et) { cls += " en"; sty = "background:" + cv(et.color + "s") + ";color:" + cv(et.color) + ";"; if (hs.length) { cls += " hito"; sty = "background:" + cv(et.color) + ";"; } }
          else if (hs.length) { cls += " en hito"; sty = "background:var(--blue);"; }
          if (s === LANZ) cls += " lanz";
          if (s < HOY && (et || hs.length)) cls += " pasado";
          if (s === HOY) cls += " hoy";
          html += "<button class='" + cls + "' style='" + sty + "' data-d='" + s + "'" + (et || hs.length ? "" : " disabled") + ">" + d + "</button>";
        }
        meses.insertAdjacentHTML("beforeend", html + "</div></div>");
      }
      function detalle(f, n) {
        document.querySelectorAll(".sel").forEach(function (x) { x.classList.remove("sel"); });
        if (f) { var b1 = document.querySelector(".d[data-d='" + f + "']"); if (b1) b1.classList.add("sel"); }
        if (n == null && f) n = diaDe(f);
        if (n) { var b2 = document.querySelector(".td[data-dia='" + n + "']"); if (b2) b2.classList.add("sel"); }
        var e = f ? etapaDeFecha(f) : etapaDeDia(n), hs = f ? hitosDeFecha(f) : [hitoDeDia(n)].filter(Boolean);
        var cab = (f ? (f === HOY ? "Hoy · " : "") + cap(largo(f)) : "") + (n >= 1 && n <= N ? (f ? " · " : "") + "Día " + n + " de " + N : "");
        $("detalle").innerHTML = "<div class='t'>" + (e ? "<i style='background:" + cv(e.color) + "'></i>" : "") + esc(cab) + "</div>" +
          hs.map(function (h) { return "<p><b style='color:var(--ink)'>" + esc(h.titulo) + (h.hora ? " · " + esc(h.hora) : "") + ".</b> " + esc(h.texto) + "</p>"; }).join("") +
          (e ? "<p>" + esc(e.nombre) + ": " + esc(e.corto) + ".</p>" : "");
      }
      meses.addEventListener("click", function (ev) { var x = ev.target.closest(".d.en"); if (x) detalle(x.dataset.d); });
      tira.addEventListener("click", function (ev) { var x = ev.target.closest(".td"); if (x) { var n = +x.dataset.dia; detalle(fechaDia(n), n); } });
      var primero = D.hitos.map(fechaDe).filter(function (f) { return f && f >= HOY; }).sort()[0];
      detalle(etapaDeFecha(HOY) || hitosDeFecha(HOY).length ? HOY : primero || HOY);
    }

    // ---------- agenda ----------
    if (AG && window.Agenda) {
      document.addEventListener("click", function (ev) {
        var x = ev.target.closest("[data-agendar]");
        if (!x) return;
        var id = x.dataset.agendar, s = D.sesiones.filter(function (z) { return z.id === id; })[0];
        window.Agenda.abrir(AG, s ? { id: s.id, titulo: s.t, fecha: s.tentativa ? "" : fechaDe(s), hora: s.hora, duracion: s.duracion, meet: s.conMeet !== false } : { nueva: true }, HOY);
      });
    }
  }
})();
