/**
 * Las áreas de tu negocio, sin pantalla: Marketing (tu pauta y de dónde llega cada uno) y Contenido (cada video, del guion a publicado).
 * Ventas (los leads, las llamadas y las visitas) vive en guia.js, junto a tus prospectos.
 * Los textos y las varas salen de tu sistema (sistema.js → marketing y contenido): se cambian ahí.
 * Solo lo carga tu panel (admin.html), después de trabajo.js. Las pruebas lo cargan con require.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear(require("./trabajo.js"), require("./sistema.js"));
  else crear(raiz.GB, raiz.SISTEMA);
})(this, function (GB, SIS) {
  "use strict";
  var M = SIS.marketing, CO = SIS.contenido, sumarDias = GB.sumarDias;
  function entero(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function dia(s) { return String(s || "").slice(0, 10); }
  function dentro(s, desde, hasta) { var d = dia(s); return !!d && (!desde || d >= desde) && (!hasta || d <= hasta); }
  function pct(a, b) { return b ? Math.round(a / b * 100) : null; }

  // ---------- los períodos ----------
  /** semana · mes · mesPasado · todo → { clave, desde, hasta, nombre }. */
  function periodo(clave, hoy) {
    var mes = hoy.slice(0, 7), ultimo = function (m) { var f = new Date(+m.slice(0, 4), +m.slice(5, 7), 0); return m + "-" + GB.pad(f.getDate()); };
    if (clave === "semana") { var l = GB.lunesDe(hoy); return { clave: clave, desde: l, hasta: sumarDias(l, 6), nombre: "Esta semana" }; }
    if (clave === "mesPasado") { var p = dia(sumarDias(mes + "-01", -1)).slice(0, 7); return { clave: clave, desde: p + "-01", hasta: ultimo(p), nombre: "El mes pasado" }; }
    if (clave === "todo") return { clave: clave, desde: "", hasta: "", nombre: "Desde el principio" };
    return { clave: "mes", desde: mes + "-01", hasta: ultimo(mes), nombre: "Este mes" };
  }

  // ---------- Marketing: lo gastado en cada campaña ----------
  /** Lo gastado hasta un día (incluido): el último total que anotaste hasta esa fecha. */
  function gastoHasta(c, fecha) {
    var t = 0;
    (c.gastos || []).forEach(function (g) { if (!fecha || g.f <= fecha) t = entero(g.t); });
    return t;
  }
  /** Lo gastado entre dos fechas: el total al final menos el total del día antes de empezar. */
  function gastoEntre(c, desde, hasta) {
    var fin = gastoHasta(c, hasta || ""), ini = desde ? gastoHasta(c, sumarDias(desde, -1)) : 0;
    return Math.max(0, fin - ini);
  }
  function gastado(c) { return gastoHasta(c, ""); }
  /** Anotas lo gastado hasta hoy (el total que te dice TikTok o Meta): queda una fila por día, así se sabe lo de cada mes. */
  function ponerGasto(c, total, hoy) {
    total = Math.max(0, entero(total));
    c.gastos = (c.gastos || []).filter(function (g) { return g.f !== hoy; }).concat([{ f: hoy, t: total }])
      .sort(function (a, b) { return a.f < b.f ? -1 : a.f > b.f ? 1 : 0; }).slice(-120);
    return total;
  }
  /** Lo que cobraste de los clientes que salieron de estos prospectos (en el período, si lo das). */
  function cobradoDe(prospectos, clientes, desde, hasta) {
    var ids = {}, t = 0;
    prospectos.forEach(function (pr) { if (pr.cliente) ids[pr.cliente] = true; });
    (clientes || []).forEach(function (c) {
      if (!ids[c.id]) return;
      ((c.proyecto && c.proyecto.pagos) || []).forEach(function (x) { if (x.estado === "pagado" && dentro(x.pagadoEl, desde, hasta)) t += entero(x.monto); });
    });
    return t;
  }
  /** Lo que pasó con un grupo de prospectos en un período: leads, contactados, llamadas hechas, cierres. */
  function embudoDe(prospectos, desde, hasta) {
    var n = { leads: 0, contactados: 0, llamadas: 0, llamadasHechas: 0, visitas2: 0, cierres: 0 };
    prospectos.forEach(function (pr) {
      // Llegó una vez: cuando te escribió o cuando lo anotaste por primera vez
      var llego = pr.leadEl || (pr.historial && pr.historial[0] && pr.historial[0].el) || pr.creado;
      if (dentro(llego, desde, hasta)) n.leads++;
      (pr.historial || []).forEach(function (h) {
        if (!dentro(h.el, desde, hasta)) return;
        if (h.tipo === "contacto") n.contactados++;
        else if (h.tipo === "llamada-agendada") n.llamadas++;
        else if (h.tipo === "llamada-hecha") n.llamadasHechas++;
        else if (h.tipo === "v2-hecha") n.visitas2++;
        else if (h.tipo === "cerro") n.cierres++;
      });
    });
    return n;
  }
  /**
   * Los números de una campaña. De tu agencia: lo que escribieron, las llamadas, los cierres y lo cobrado salen solos de los prospectos
   * que tienen esa campaña. De un cliente: sus cupones, los que llegaron y lo que vendió los anotas tú.
   * datos = { prospectos, clientes }.
   */
  function numerosCampana(c, datos, desde, hasta) {
    var gasto = gastoEntre(c, desde, hasta), n = c.n || {};
    if (c.para) {
      var cup = entero(n.cupones), lleg = entero(n.llegaron), vend = entero(n.vendido);
      return { cliente: true, gasto: gasto, vistas: entero(n.vistas), cupones: cup, llegaron: lleg, vendido: vend,
        costoCupon: cup ? Math.round(gasto / cup) : null, costoLlegada: lleg ? Math.round(gasto / lleg) : null, retorno: gasto ? Math.round(vend / gasto * 10) / 10 : null,
        veredicto: { clave: vend ? "cierra" : gasto < M.minGasto ? "faltan" : "cliente", texto: vend ? "Por cada boliviano de publicidad vendió " + (Math.round(vend / Math.max(1, gasto) * 10) / 10) + " Bs con el cupón." : gasto < M.minGasto ? GB.rellenar(M.veredictos.faltan, { min: M.minGasto }) : M.veredictos.cliente } };
    }
    var ps = (datos.prospectos || []).filter(function (pr) { return pr.campana === c.id; });
    var e = embudoDe(ps, desde, hasta), cobrado = cobradoDe(ps, datos.clientes, desde, hasta);
    var r = {
      cliente: false, gasto: gasto, vistas: entero(n.vistas), leads: e.leads, contactados: e.contactados, llamadas: e.llamadas, llamadasHechas: e.llamadasHechas, cierres: e.cierres, cobrado: cobrado,
      cpl: e.leads ? Math.round(gasto / e.leads) : null, porLlamada: e.llamadasHechas ? Math.round(gasto / e.llamadasHechas) : null, cac: e.cierres ? Math.round(gasto / e.cierres) : null,
      retorno: gasto ? Math.round(cobrado / gasto * 10) / 10 : null
    };
    r.veredicto = veredictoCampana(r);
    return r;
  }
  /** Qué hacer con una campaña de tu agencia, por sus números (lo que falla primero, de adelante hacia atrás). */
  function veredictoCampana(r) {
    var V = M.veredictos;
    if (r.cierres) return { clave: "cierra", texto: V.cierra };
    if (r.gasto < M.minGasto && r.leads < M.minLeads) return { clave: "faltan", texto: GB.rellenar(V.faltan, { min: M.minGasto }) };
    if (!r.leads) return { clave: "sinLeads", texto: V.sinLeads };
    if (!r.llamadas && !r.llamadasHechas) return { clave: "sinLlamadas", texto: V.sinLlamadas };
    return { clave: "sinCierres", texto: V.sinCierres };
  }
  /** Una campaña cuenta en un período si estuvo viva en algún día de él. */
  function campanaEn(c, desde, hasta) {
    var d = c.desde || dia(c.creado), h = c.hasta || "";
    return (!hasta || !d || d <= hasta) && (!desde || !h || h >= desde);
  }
  /**
   * El resumen de tu marketing en un período: lo gastado en tus campañas, lo que trajeron (leads → llamadas → cierres → cobrado),
   * lo que llegó sin campaña (comentarios, tu página, referidos) y lo de cada canal.
   * datos = { prospectos, clientes, campanas }.
   */
  function resumenMarketing(datos, desde, hasta) {
    var camps = (datos.campanas || []).filter(function (c) { return !c.para && campanaEn(c, desde, hasta); });
    var gasto = 0, ids = {};
    camps.forEach(function (c) { gasto += gastoEntre(c, desde, hasta); ids[c.id] = true; });
    var conCamp = (datos.prospectos || []).filter(function (pr) { return pr.campana && ids[pr.campana]; });
    var inbound = (datos.prospectos || []).filter(function (pr) { return GB.origenDe(pr) === "inbound"; });
    var ePauta = embudoDe(conCamp, desde, hasta), eTodo = embudoDe(inbound, desde, hasta);
    var cobPauta = cobradoDe(conCamp, datos.clientes, desde, hasta), cobTodo = cobradoDe(inbound, datos.clientes, desde, hasta);
    return {
      gasto: gasto, campanas: camps.length, activas: camps.filter(function (c) { return c.estado === "activa"; }).length,
      pauta: Object.assign({ cobrado: cobPauta }, ePauta), inbound: Object.assign({ cobrado: cobTodo }, eTodo),
      cpl: ePauta.leads ? Math.round(gasto / ePauta.leads) : null, porLlamada: ePauta.llamadasHechas ? Math.round(gasto / ePauta.llamadasHechas) : null,
      cac: ePauta.cierres ? Math.round(gasto / ePauta.cierres) : null, retorno: gasto ? Math.round(cobPauta / gasto * 10) / 10 : null,
      aLlamada: pct(eTodo.llamadas, eTodo.leads), aCierre: pct(eTodo.cierres, eTodo.leads)
    };
  }
  /** De dónde llega cada uno: por canal, los que llegaron, las llamadas, los cierres y lo cobrado en el período. */
  function porCanal(datos, desde, hasta) {
    var filas = {};
    SIS.prospeccion.canales.forEach(function (c) { filas[c.clave] = Object.assign({ clave: c.clave, nombre: c.nombre, ico: c.ico, inbound: !!c.inbound, prospectos: [] }); });
    (datos.prospectos || []).forEach(function (pr) { filas[GB.canalDe(pr)].prospectos.push(pr); });
    return SIS.prospeccion.canales.map(function (c) {
      var f = filas[c.clave], e = embudoDe(f.prospectos, desde, hasta);
      return { clave: f.clave, nombre: f.nombre, ico: f.ico, inbound: f.inbound, llegaron: e.leads, llamadas: e.llamadasHechas, visitas2: e.visitas2, cierres: e.cierres, cobrado: cobradoDe(f.prospectos, datos.clientes, desde, hasta) };
    }).filter(function (f) { return f.llegaron || f.llamadas || f.cierres || f.cobrado; });
  }
  /** Las semanas de tu cuenta: el cuerpo, cuántas versiones salieron y la mejor, con sus números (lo más nuevo arriba). */
  function semanasCuenta(ag, cuantas) {
    var sem = (ag && ag.semanas) || {};
    return Object.keys(sem).sort().reverse().slice(0, cuantas || 8).map(function (k) {
      var s = sem[k], gs = s.ganchos || [], mejor = GB.mejorVersion(gs, { alcance: true }) || gs.find(function (g) { return g.ganador; }) || null;
      var suma = function (c) { return gs.reduce(function (t, g) { return t + entero((g.numeros || {})[c]); }, 0); };
      return { semana: k, lunes: lunesDeSemana(k), cuerpo: s.cuerpo || "", versiones: gs.length, publicadas: gs.filter(function (g) { return g.link || g.fecha; }).length,
        vistas: suma("vistas"), escriben: suma("escriben"), guardados: suma("guardados"), seguidores: suma("seguidores"), mejor: mejor };
    }).filter(function (x) { return x.versiones || x.cuerpo; });
  }
  /** "2026-W44" → el lunes de esa semana. */
  function lunesDeSemana(k) {
    var m = String(k).match(/^(\d{4})-W(\d{2})$/); if (!m) return "";
    var ene4 = new Date(+m[1], 0, 4), d = (ene4.getDay() + 6) % 7;
    var f = new Date(+m[1], 0, 4 - d + (+m[2] - 1) * 7);
    return f.getFullYear() + "-" + GB.pad(f.getMonth() + 1) + "-" + GB.pad(f.getDate());
  }

  // ---------- Contenido: cada video en su etapa ----------
  var ORDEN = CO.etapas.map(function (e) { return e.clave; });
  function tieneGuion(g) { return !!g && (!!String(g.cuerpo || "").trim() || (g.filas || []).some(function (f) { return String(f.dice || "").trim(); })); }
  function nivelFecha(f, hoy, base) {
    if (!f) return base;
    if (f < hoy) return 3;
    if (f <= sumarDias(hoy, 1)) return Math.max(base, 3);
    if (f <= sumarDias(hoy, 3)) return Math.max(base, 2);
    return base;
  }
  /** La etapa de un video de un cliente: guion → grabar → editar → descripción → subir → publicado. */
  function etapaVideoCliente(v, r, g) {
    var est = GB.estadoVideo(v, r);
    if (v.estado === "publicado") return "publicado";
    if (v.estado === "guion") return tieneGuion(g) ? "grabar" : "guion";
    if (est === "cambios") return "editar";
    if ((v.estado === "grabado" || v.estado === "edicion") && entero(v.pasada) < 4) return "editar";
    if (!String(v.texto || "").trim()) return "descripcion";
    return "subir";
  }
  /** La etapa del video de tu cuenta de una semana (sus 3 versiones salen lunes, miércoles y viernes). */
  function etapaVideoCuenta(sem, g) {
    var gs = sem.ganchos || [], subidas = gs.filter(function (x) { return x.link || (x.redes && Object.keys(x.redes).length); }).length;
    if (subidas >= 3) return "publicado";
    if (!tieneGuion(g) && !subidas) return "guion";
    if (!sem.grabado && !subidas && entero(sem.pasada) < 1) return "grabar";
    if (entero(sem.pasada) < 4 && !subidas) return "editar";
    if (!String(sem.texto || "").trim()) return "descripcion";
    return "subir";
  }
  /**
   * Todos tus videos, cada uno en su etapa, con lo que apura (el nivel de color) y una línea de qué falta.
   * datos = { clientes, guiones, agencia }. Los de tu cuenta: la semana de hoy y la pasada si quedó sin terminar.
   * Cada uno: { ref: { c, v }, para, quien, titulo, etapa, nivel, nota, fecha, video, cuenta }.
   */
  function videosContenido(datos, hoy) {
    var out = [], guiones = datos.guiones || [], limite = sumarDias(hoy, -CO.diasPublicados);
    var guionDe = function (c, v) { return guiones.find(function (g) { return g.cliente === c && g.video === v; }) || null; };
    (datos.clientes || []).forEach(function (c) {
      if (c.estado !== "activo") return;
      ((c.proyecto && c.proyecto.videos) || []).forEach(function (v) {
        var g = guionDe(c.id, v.id), et = etapaVideoCliente(v, c.respuestas, g), est = GB.estadoVideo(v, c.respuestas);
        if (et === "publicado" && dia(v.fechaPub || v.cambiadoEl) < limite) return;
        var nivel = 1, nota = "";
        if (et === "guion") nota = "Falta su guion";
        else if (et === "grabar") nota = (g.tomas || []).length ? "Falta grabar: " + (g.tomas || []).filter(function (t) { return !t.hecha; }).length + " tomas" : "Falta grabar";
        else if (et === "editar") {
          if (est === "cambios") { nivel = 3; var resp = GB.respuestaVideo(v, c.respuestas); nota = "Pidió un cambio" + (resp && resp.nota ? ": «" + String(resp.nota).slice(0, 80) + "»" : ""); }
          else { var sig = GB.siguientePasada(v); nota = sig ? "Sigue la pasada " + sig.etiqueta + " · " + sig.nombre : "En edición"; nivel = GB.abiertoVideo(v) ? 2 : 1; }
        } else if (et === "descripcion") { nota = est === "aprobar" ? "Ya espera su ok y no tiene su texto" : "Falta su descripción"; nivel = est === "aprobar" ? 3 : 2; }
        else if (et === "subir") {
          if (est === "aprobar") { var dias = v.cambiadoEl ? Math.round((GB.fechaDe(hoy) - GB.fechaDe(dia(v.cambiadoEl))) / 864e5) : 0; nivel = dias >= 2 ? 2 : 0; nota = dias >= 2 ? "Hace " + dias + " días que espera su ok: recuérdaselo" : "Esperando su ok"; }
          else if (est === "aprobado" || v.estado === "aprobado") { nivel = 2; nota = "Aprobado: súbelo"; }
          else { nivel = 2; nota = v.previa ? "Pídele su ok" : "Pon su link para verlo y pídele su ok"; }
        } else nota = v.publicado ? "Publicado" : "Publicado, sin su link";
        if (et !== "publicado" && !(et === "subir" && est === "aprobar")) nivel = nivelFecha(v.fechaPub, hoy, nivel);
        out.push({ ref: { c: c.id, v: v.id }, para: c.id, quien: c.proyecto.negocio, titulo: v.titulo, etapa: et, nivel: et === "publicado" ? -1 : nivel, nota: nota,
          fecha: v.fechaPub || "", estado: est, video: v, guion: g, cliente: c, cuenta: false });
      });
    });
    var ag = datos.agencia || {}, sems = ag.semanas || {}, wk = GB.semanaISO(hoy), antes = GB.semanaISO(sumarDias(hoy, -7)), lunes = GB.lunesDe(hoy);
    // Esta semana, la pasada si quedó algo, y las que vienen que ya tienen su idea o su guion (de «Nuevo guion» o de tu calendario)
    var futuras = Object.keys(sems).filter(function (k) { return k > wk && (sems[k].cuerpo || sems[k].guion); }).sort().slice(0, 4);
    [antes, wk].concat(futuras).forEach(function (k) {
      var s = sems[k];
      if (k === antes && !s) return;
      s = s || { hechos: {}, ganchos: [], cuerpo: "" };
      var g = guiones.find(function (x) { return x.cliente === "agencia" && x.video === k; }) || (s.guion ? guiones.find(function (x) { return x.id === s.guion; }) : null) || null;
      var et = etapaVideoCuenta(s, g);
      if (k === antes && et === "publicado") return;
      var lun = k === wk ? lunes : GB.lunesDeSemana(k), gs = s.ganchos || [], futura = k > wk;
      // La próxima versión que sale: lunes, miércoles y viernes
      var dias = [0, 2, 4].map(function (d) { return sumarDias(lun, d); }), sub = gs.filter(function (x) { return x.link || (x.redes && Object.keys(x.redes).length); }).length, prox = dias[Math.min(2, sub)];
      var nivel = k === antes ? 3 : futura ? 0 : nivelFecha(prox, hoy, et === "subir" ? 2 : 1), nota = "";
      if (et === "guion") nota = "Falta el guion del cuerpo de la semana";
      else if (et === "grabar") nota = "Falta grabarlo";
      else if (et === "editar") { var sg = GB.siguientePasada(s); nota = sg ? "Sigue la pasada " + sg.etiqueta + " · " + sg.nombre : "En edición"; }
      else if (et === "descripcion") nota = "Falta su descripción";
      else if (et === "subir") nota = "Van " + sub + " de 3 versiones: la que sigue sale el " + GB.diaCorto(prox);
      else nota = "Las 3 versiones están arriba";
      if (k === antes && et !== "publicado") nota = "De la semana pasada: " + GB.minus(nota);
      if (futura) nota = "Para la semana del " + GB.diaCorto(lun) + ": " + GB.minus(nota);
      out.push({ ref: { c: "agencia", v: k }, para: "agencia", quien: "Tu cuenta", titulo: s.cuerpo || (k === wk ? "El cuerpo de esta semana" : futura ? "El cuerpo de la semana del " + GB.diaCorto(lun) : "El cuerpo de la semana pasada"),
        etapa: et, nivel: et === "publicado" ? -1 : nivel, nota: nota, fecha: et === "publicado" ? dias[2] : prox, semana: s, guion: g, cuenta: true });
    });
    return out.sort(function (a, b) { return b.nivel - a.nivel || String(a.fecha || "9").localeCompare(String(b.fecha || "9")) || ORDEN.indexOf(a.etapa) - ORDEN.indexOf(b.etapa); });
  }
  /** Para quién es cada video: tu cuenta y cada cliente, con cuántos tiene en camino (sin los publicados). */
  function paraContenido(items) {
    var orden = [], por = {};
    items.forEach(function (x) {
      if (!por[x.para]) { por[x.para] = { clave: x.para, nombre: x.quien, cuenta: x.cuenta, n: 0 }; orden.push(por[x.para]); }
      if (x.etapa !== "publicado") por[x.para].n++;
    });
    return orden.sort(function (a, b) { return (b.cuenta ? 1 : 0) - (a.cuenta ? 1 : 0) || a.nombre.localeCompare(b.nombre); });
  }
  /** El calendario de publicación: lo que sale cada día de los próximos N, lo atrasado y lo que no tiene fecha. */
  function calendarioContenido(items, hoy, dias) {
    var vivos = items.filter(function (x) { return x.etapa !== "publicado"; }), out = [];
    for (var i = 0; i < (dias || 14); i++) {
      var f = sumarDias(hoy, i);
      out.push({ fecha: f, items: vivos.filter(function (x) { return x.fecha === f; }) });
    }
    return {
      dias: out,
      atrasados: vivos.filter(function (x) { return x.fecha && x.fecha < hoy; }),
      sinFecha: vivos.filter(function (x) { return !x.fecha && !x.cuenta; }),
      despues: vivos.filter(function (x) { return x.fecha && x.fecha >= sumarDias(hoy, dias || 14); })
    };
  }
  /**
   * El pedido para que Claude te escriba la descripción de un video (copiar y pegar, sin API).
   * o = { negocio, rubro, producto, titulo, guion, tipo ("lanzamiento" | "alcance" | "mensual" | "cuenta"), fecha, porque, promo }
   */
  function pedidoDescripcion(o) {
    o = o || {};
    var g = o.guion || {}, l = [];
    l.push("Escríbeme la descripción (el texto que va abajo) de un video de TikTok" + (o.cuenta || o.tipo === "cuenta" ? " de mi cuenta, Grow Business: le hablo a dueños de tiendas de La Paz." : " de " + (o.negocio || "una tienda") + (o.rubro ? " (" + o.rubro + ")" : "") + ", una tienda de La Paz."));
    l.push("");
    l.push("El video: «" + (o.titulo || "") + "»." + (o.producto ? " El producto: " + o.producto + "." : ""));
    var gan = g.gancho && (g.gancho.texto || g.gancho.familia);
    if (gan) l.push("El gancho: «" + gan + "».");
    var dice = (g.filas || []).map(function (f) { return String(f.dice || "").trim(); }).filter(Boolean);
    if (dice.length) { l.push("Lo que se dice:"); dice.slice(0, 12).forEach(function (t) { l.push("- " + t); }); }
    else if (g.cuerpo) { l.push("Lo que se dice:"); l.push(String(g.cuerpo).slice(0, 900)); }
    l.push("");
    if (o.tipo === "lanzamiento") l.push("Es de un lanzamiento con fecha" + (o.promo ? ": la promo es «" + o.promo + "»" : "") + (o.fecha ? ", el " + o.fecha : "") + (o.porque ? ", porque " + o.porque : "") + ". El paso: guardar el cupón en el link del perfil, con su día y su hora.");
    else if (o.tipo === "alcance" || o.tipo === "mensual") l.push("Es para que conozcan el producto y la tienda. El paso: escribir a la tienda o ir a verlo.");
    else if (o.tipo === "cuenta") l.push("Cierra con el regalo que va con el dolor del video: comentar FECHA (su promo armada), MARKETING (el video de mi método) o REVISA (reviso el comienzo de su último video). Elige el que va.");
    l.push("");
    l.push("Reglas:");
    CO.descripcion.reglas.forEach(function (r) { l.push("- " + r); });
    l.push("");
    l.push("Dame 3 versiones distintas, cada una de 2 a 4 renglones, sin comillas. Debajo de cada una, sus etiquetas.");
    return l.join("\n");
  }

  Object.assign(GB, {
    periodo: periodo, gastoHasta: gastoHasta, gastoEntre: gastoEntre, gastado: gastado, ponerGasto: ponerGasto,
    numerosCampana: numerosCampana, veredictoCampana: veredictoCampana, campanaEn: campanaEn, resumenMarketing: resumenMarketing, porCanal: porCanal,
    semanasCuenta: semanasCuenta, lunesDeSemana: lunesDeSemana,
    etapaVideoCliente: etapaVideoCliente, etapaVideoCuenta: etapaVideoCuenta, videosContenido: videosContenido, paraContenido: paraContenido,
    calendarioContenido: calendarioContenido, pedidoDescripcion: pedidoDescripcion, tieneGuion: tieneGuion
  });
  return GB;
});
