/**
 * Motor de los paneles por cliente · Grow Business.
 * Cada cliente tiene su carpeta /clientes/<cliente>/ con un index.html (cáscara) y un datos.json.
 * Este archivo lee datos.json y arma todo: dónde estamos, calendario, etapas, listas y novedades.
 *
 * El plan se cuenta en DÍAS (día 1, día 2…). El día 1 es una fecha que puede no existir todavía
 * (plan.dia1 = null): entonces el calendario muestra "por agendar" y, en cuanto alguien pone
 * la fecha en datos.json, todo el calendario se llena solo.
 *
 * Cosas con fecha fija usan "fecha": "AAAA-MM-DD". Cosas atadas al plan usan "dia": n.
 * Para probar otro día: ?hoy=AAAA-MM-DD
 */
(function () {
  "use strict";
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var TXT = { listo: "Listo", curso: "En curso", prox: "Próximo", hoy: "Hoy", agendar: "Por agendar" };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fd(s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function iso(f) { return f.getFullYear() + "-" + pad(f.getMonth() + 1) + "-" + pad(f.getDate()); }
  function sumar(s, n) { var f = fd(s); f.setDate(f.getDate() + n); return iso(f); }
  function entre(a, b) { return Math.round((fd(b) - fd(a)) / 864e5); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function largo(s) { var f = fd(s); return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; }
  function corto(s) { var f = fd(s); return DIAS[f.getDay()].slice(0, 3) + " " + f.getDate() + " " + MESES[f.getMonth()].slice(0, 3); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function cv(c) { return getComputedStyle(document.documentElement).getPropertyValue("--" + c).trim(); }
  function $(id) { return document.getElementById(id); }
  function ul(a) { return "<ul>" + (a || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }

  var HOY = (function () {
    var q = new URLSearchParams(location.search).get("hoy");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q;
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { return iso(new Date()); }
  })();

  // datos.json vive junto al index.html del cliente (sirve con o sin "/" al final del link)
  var BASE = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  fetch(BASE + "/datos.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(armar).catch(function () {
    $("ahoraTitulo").textContent = "No pudimos cargar el plan. Recarga la página.";
  });

  function armar(D) {
    var P = D.plan, N = P.duracionDias, DIA1 = P.dia1 || null;
    /** La fecha del día n del plan (null si el día 1 aún no está agendado). */
    function fechaDia(n) { return DIA1 ? sumar(DIA1, n - 1) : null; }
    function fechaDe(x) { return x.fecha || (x.dia != null ? fechaDia(x.dia) : null); }
    function diaDe(f) { return DIA1 ? entre(DIA1, f) + 1 : null; }
    var LANZ = fechaDia(N);

    // etapas con sus fechas reales (pueden quedar abiertas si falta el día 1)
    D.etapas.forEach(function (e) {
      e.desdeF = e.desde || (e.desdeDia != null ? fechaDia(e.desdeDia) : null);
      e.hastaF = e.hasta || (e.hastaDia != null ? fechaDia(e.hastaDia) : null);
    });
    // una etapa que termina "cuando llegue el día 1" y aún no tiene fecha: la pintamos hasta lo último que sabemos
    var TOPE = [HOY].concat(D.hitos.map(fechaDe)).filter(Boolean).sort().pop();
    function etapaDeFecha(f) {
      for (var i = 0; i < D.etapas.length; i++) {
        var e = D.etapas[i];
        if (e.desdeF && f >= e.desdeF && f <= (e.hastaF || (e.hastaDia != null ? TOPE : ""))) return e;
      }
      return null;
    }
    function etapaDeDia(n) { for (var i = 0; i < D.etapas.length; i++) { var e = D.etapas[i]; if (e.desdeDia != null && n >= e.desdeDia && n <= e.hastaDia) return e; } return null; }
    function estadoEtapa(e) {
      if (e.hastaF && HOY > e.hastaF) return "listo";
      if (e.desdeF && HOY >= e.desdeF && (!e.hastaF || HOY <= e.hastaF)) return "curso";
      return "prox";
    }
    function hitosDeFecha(f) { return D.hitos.filter(function (h) { return fechaDe(h) === f; }); }
    function hitoDeDia(n) { return D.hitos.filter(function (h) { return h.dia === n; })[0]; }
    function rango(e) {
      if (e.desdeF && e.hastaF) return e.desdeF === e.hastaF ? cap(largo(e.desdeF)) : corto(e.desdeF) + " → " + corto(e.hastaF);
      if (e.desdeDia != null) return "Día " + e.desdeDia + (e.hastaDia !== e.desdeDia ? " al " + e.hastaDia : "") + " · fechas al agendar la " + P.anclaNombre;
      return "Desde el " + corto(e.desdeF) + " hasta la " + P.anclaNombre;
    }

    // ---------- portada ----------
    document.title = D.cliente.nombre + " · Plan de " + N + " días";
    $("cliNombre").textContent = D.cliente.nombre;
    $("cliInicial").textContent = D.cliente.inicial || D.cliente.nombre.charAt(0);
    $("cliEtiqueta").textContent = "PLAN DE LANZAMIENTO · " + N + " DÍAS";
    $("cliLead").innerHTML = D.cliente.lead + (D.cliente.canales ? "<span class='canales'>" + D.cliente.canales.map(function (c) { return "<span class='chip'>" + esc(c) + "</span>"; }).join("") + "</span>" : "");

    // ---------- dónde estamos ----------
    var eHoy = etapaDeFecha(HOY), dHoy = diaDe(HOY);
    var proximo = D.hitos.map(function (h) { return { h: h, f: fechaDe(h) }; }).filter(function (x) { return x.f && x.f >= HOY; }).sort(function (a, b) { return a.f < b.f ? -1 : 1; })[0];
    var hoyH = hitosDeFecha(HOY);
    if (dHoy && dHoy >= 1 && dHoy <= N) {
      $("ahoraTitulo").textContent = eHoy ? eHoy.nombre : "Día " + dHoy;
      $("ahoraDia").innerHTML = "Día <b>" + dHoy + "</b> de " + N;
    } else if (dHoy && dHoy > N) {
      $("ahoraTitulo").textContent = "¡Lanzamos! 🚀"; $("ahoraDia").textContent = "Plan completado";
    } else {
      $("ahoraTitulo").textContent = eHoy ? eHoy.nombre : "Por empezar";
      $("ahoraDia").innerHTML = DIA1 ? "Faltan <b>" + entre(HOY, DIA1) + "</b> días para el día 1" : "Antes del <b>día 1</b>";
    }
    var t = "<b>Hoy, " + largo(HOY) + ":</b> ";
    if (hoyH.length) t += hoyH.map(function (h) { return esc(h.titulo) + (h.hora ? " a las " + esc(h.hora) : "") + ". " + esc(h.texto); }).join(" ");
    else t += eHoy ? esc(eHoy.corto) + "." : "Seguimos avanzando.";
    if (proximo && proximo.f !== HOY) t += " <span class='mudo'>Lo próximo: <b>" + esc(proximo.h.titulo) + "</b>, " + largo(proximo.f) + (proximo.h.hora ? " a las " + esc(proximo.h.hora) : "") + ".</span>";
    if (!DIA1) t += " <span class='mudo'>El día 1 arranca con la " + esc(P.anclaNombre) + "; cuando la agendemos, el calendario se llena solo.</span>";
    $("ahoraTxt").innerHTML = t;
    $("cDias").textContent = LANZ ? Math.max(0, entre(HOY, LANZ)) : "—";
    $("cDiasTxt").textContent = LANZ ? "días para lanzar" : "lanzamiento por agendar";
    $("cEtapa").textContent = eHoy ? eHoy.n : "–";
    $("cEtapaTxt").textContent = "etapa de " + D.etapas.length;
    var agendadas = D.sesiones.filter(function (s) { return s.fecha; }).length;
    $("cSes").textContent = agendadas; $("cSesTxt").textContent = agendadas === 1 ? "sesión agendada" : "sesiones agendadas";

    // barra de los N días
    var b = $("barra");
    D.etapas.filter(function (e) { return e.desdeDia != null; }).forEach(function (e) {
      var s = document.createElement("span"), est = estadoEtapa(e);
      s.style.width = ((e.hastaDia - e.desdeDia + 1) / N * 100) + "%"; s.style.background = cv(e.color);
      s.style.opacity = est === "curso" ? "1" : est === "listo" ? ".9" : ".28"; b.appendChild(s);
    });
    if (dHoy && dHoy >= 1 && dHoy <= N) { var m = document.createElement("i"); m.className = "marca-hoy"; m.style.left = "calc(" + ((dHoy - .5) / N * 100) + "% - 2px)"; b.appendChild(m); }
    $("ejeIni").textContent = "Día 1" + (DIA1 ? " · " + corto(DIA1) : " · " + P.anclaNombre);
    $("ejeFin").textContent = "Día " + N + (LANZ ? " · " + corto(LANZ) : "") + " · Lanzamiento";

    // ---------- calendario ----------
    var ley = $("leyenda");
    D.etapas.forEach(function (e) { ley.insertAdjacentHTML("beforeend", "<span><i style='background:" + cv(e.color) + "'></i>" + e.n + ". " + esc(e.nombre) + "</span>"); });
    ley.insertAdjacentHTML("beforeend", "<span><i style='background:linear-gradient(135deg,#e5484d,#7c3aed)'></i>Lanzamiento</span>");
    if (!DIA1) $("avisoCal").innerHTML = "<span>⏳</span><span>Las fechas de los " + N + " días aparecen cuando agendemos la " + esc(P.anclaNombre) + ". Mientras tanto, abajo ves el plan por días.</span>";
    else $("avisoCal").hidden = true;

    // tira de los N días
    var tira = $("tira");
    for (var n = 1; n <= N; n++) {
      var e = etapaDeDia(n), h = hitoDeDia(n), f = fechaDia(n);
      var st = e ? "background:" + cv(e.color + "s") + ";color:" + cv(e.color) + ";" : "";
      if (n === N) st = "background:linear-gradient(135deg,#e5484d,#7c3aed);color:#fff;";
      else if (h) st = "background:" + cv(e.color) + ";color:#fff;";
      tira.insertAdjacentHTML("beforeend", "<button class='td" + (f === HOY ? " hoy" : "") + "' style='" + st + "' data-dia='" + n + "'><small>Día</small><b>" + n + "</b><small>" + (f ? corto(f).slice(4) : "—") + "</small><span class='ic'>" + (h ? h.icono : "") + "</span></button>");
    }

    // meses: desde la primera fecha conocida hasta la última
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
        html += "<button class='" + cls + "' style='" + sty + "' data-d='" + s + "'" + (et || hs.length ? "" : " disabled") + ">" + d + (hs.length ? "<span class='ic'>" + hs[0].icono + "</span>" : "") + "</button>";
      }
      meses.insertAdjacentHTML("beforeend", html + "</div></div>");
    }

    function detalle(f, n) {
      document.querySelectorAll(".sel").forEach(function (x) { x.classList.remove("sel"); });
      if (f) { var b1 = document.querySelector(".d[data-d='" + f + "']"); if (b1) b1.classList.add("sel"); }
      if (n == null && f) n = diaDe(f);
      if (n) { var b2 = document.querySelector(".td[data-dia='" + n + "']"); if (b2) b2.classList.add("sel"); }
      var e = f ? etapaDeFecha(f) : etapaDeDia(n), hs = f ? hitosDeFecha(f) : [hitoDeDia(n)].filter(Boolean);
      var cab = (f ? (f === HOY ? "Hoy · " : "") + cap(largo(f)) : "") + (n >= 1 && n <= N ? (f ? " · " : "") + "Día " + n + " de " + N : "") + (!f ? " · fecha por agendar" : "");
      $("detalle").innerHTML = "<div class='t'>" + (e ? "<i style='background:" + cv(e.color) + "'></i>" : "") + esc(cab) + "</div>" +
        hs.map(function (h) { return "<p><b style='color:var(--ink)'>" + h.icono + " " + esc(h.titulo) + (h.hora ? " · " + esc(h.hora) : "") + ".</b> " + esc(h.texto) + "</p>"; }).join("") +
        (e ? "<p>Etapa " + e.n + ": <b style='color:var(--ink)'>" + esc(e.nombre) + "</b> — " + esc(e.corto) + ".</p>" : "");
    }
    meses.addEventListener("click", function (ev) { var x = ev.target.closest(".d.en"); if (x) detalle(x.dataset.d); });
    tira.addEventListener("click", function (ev) { var x = ev.target.closest(".td"); if (x) { var n = +x.dataset.dia; detalle(fechaDia(n), n); } });
    var primero = D.hitos.map(fechaDe).filter(function (f) { return f && f >= HOY; }).sort()[0];
    detalle(etapaDeFecha(HOY) || hitosDeFecha(HOY).length ? HOY : primero || HOY);

    // ---------- etapas explicadas ----------
    var le = $("listaEtapas");
    D.etapas.forEach(function (e) {
      var est = estadoEtapa(e);
      le.insertAdjacentHTML("beforeend", "<div class='etapa" + (est === "curso" ? " actual abierta" : "") + "'><button class='etapa-cab'><span class='num' style='background:" + cv(e.color) + "'>" + e.n + "</span>" +
        "<span><h3>" + esc(e.nombre) + "</h3><div class='fechas'>" + esc(rango(e)) + " · " + esc(e.corto) + "</div></span><span class='estado " + est + "'>" + TXT[est] + "</span></button>" +
        "<div class='etapa-cuerpo'><div class='bloque'><h4>De qué se trata</h4><p>" + esc(e.que) + "</p></div>" +
        "<div class='bloque'><h4>Lo que hacemos nosotros</h4>" + ul(e.hacemos) + "</div>" +
        "<div class='bloque'><h4>Lo que necesitamos de ustedes</h4>" + ul(e.ustedes) + "</div>" +
        "<div class='bloque'><h4>Lo que sale de esta etapa</h4><p>" + esc(e.sale) + "</p></div></div></div>");
    });
    le.addEventListener("click", function (ev) { var x = ev.target.closest(".etapa-cab"); if (x) x.parentNode.classList.toggle("abierta"); });
    if (!le.querySelector(".abierta")) le.firstElementChild.classList.add("abierta");

    // ---------- listas ----------
    function pintar(id, arr, auto) {
      var l = $(id); if (!l) return;
      arr.forEach(function (x) {
        var f = fechaDe(x), est = x.estado;
        if (auto) est = !f ? "agendar" : f < HOY ? "listo" : f === HOY ? "hoy" : "prox";
        var ok = x.ok || est === "listo";
        var sub = auto ? (f ? cap(largo(f)) + (x.hora ? " · " + x.hora : "") + (x.d ? " — " + x.d : "") : x.d) : x.d;
        l.insertAdjacentHTML("beforeend", "<div class='item" + (ok ? " ok" : "") + "'><span class='ck'>" + (ok ? "✓" : "") + "</span><span><b>" + esc(x.t) + "</b><small>" + esc(sub) + "</small></span>" +
          (est ? "<span class='est estado " + est + "'>" + TXT[est] + "</span>" : "") + "</div>");
      });
    }
    pintar("listaPedidos", D.pedidos || []);
    pintar("listaAvances", D.avances || []);
    pintar("listaSesiones", D.sesiones || [], true);

    // ---------- novedades (lo que va pasando, de la más nueva a la más vieja) ----------
    var nv = $("listaNovedades");
    (D.novedades || []).slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; }).forEach(function (x) {
      nv.insertAdjacentHTML("beforeend", "<div class='nov'><small>" + esc(corto(x.fecha)) + "</small><p>" + esc(x.texto) + "</p></div>");
    });
    if (D.contacto) $("contacto").innerHTML = "<div class='avatar'>" + esc(D.contacto.nombre.charAt(0)) + "</div><div><b>" + esc(D.contacto.nombre) + "</b><small class='mudo' style='display:block;font-size:13px'>" + esc(D.contacto.rol) + "</small></div>";
    $("actualizado").textContent = D.actualizado ? "Actualizado el " + largo(D.actualizado) : "";
  }
})();
