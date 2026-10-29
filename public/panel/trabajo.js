/**
 * Tu flujo de trabajo (cambios-propuestos.md, Parte 1), sin pantalla: lo usa tu panel y lo prueban las pruebas.
 *   · La edición en pedazos: la pasada que sigue de cada video, los videos abiertos y el reloj (F3, F7).
 *   · Tu día en una sola cosa: el tamaño y el lugar de cada tarea, tu bloque y «Mañana empiezas con…» (F1, F2).
 *   · Tu constancia sin rachas y los huecos del día (F10, F17), y lo que el panel aprende de ti (F13).
 *   · La bandeja de ideas (F6), lo que se ve en cada video, tus referencias, tus ganchos y el pedido para Claude (F4, F5, F11, F12, F14, F15).
 *   · «Me trabé» y los descansos con final (F8, F9).
 * Los valores (minutos, lugares, textos) salen de tu sistema (sistema.js → trabajo y fabrica): se cambian ahí.
 * Solo lo carga tu panel (admin.html), después de logica.js, sistema.js y guia.js. Las pruebas lo cargan con require.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear(require("./guia.js"), require("./sistema.js"));
  else crear(raiz.GB, raiz.SISTEMA);
})(this, function (GB, SIS) {
  "use strict";
  var T = SIS.trabajo, F = SIS.fabrica, sumarDias = GB.sumarDias, minus = GB.minus;
  function entero(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function hhmm(s) { var m = String(s || "").match(/(\d{2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : -1; }
  function aHora(min) { min = Math.max(0, Math.round(min)); return GB.pad(Math.floor(min / 60) % 24) + ":" + GB.pad(min % 60); }
  function promedio(l) { return l.length ? Math.round(l.reduce(function (a, b) { return a + b; }, 0) / l.length) : 0; }
  function mediana(l) { if (!l.length) return 0; var s = l.slice().sort(function (a, b) { return a - b; }), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }

  // ---------- la edición en pedazos (F3) ----------
  /** Las 5 pasadas: la 0 (preparar el material) y las 4 de siempre, con su tiempo. */
  function pasadas() {
    return [F.pasada0].concat(F.pasadas).map(function (p) { return Object.assign({}, p, { min: (F.minPasada && F.minPasada[p.n]) || p.min || 45 }); });
  }
  function defPasada(n) { return pasadas().find(function (p) { return p.n === n; }) || pasadas()[0]; }
  /** Cuántas de las 5 pasadas lleva un video (la 0 cuenta si preparaste el material). */
  function pasadasHechas(v) { return (v.prep ? 1 : 0) + Math.min(4, entero(v.pasada)); }
  /** La pasada que sigue de un video: la 0 si falta el material; si partiste una en dos, «2b» con lo que falta. null si ya pasó la revisión. */
  function siguientePasada(v, aprende) {
    var p = entero(v.pasada);
    if (p >= 4) return null;
    var n = v.prep || p > 0 ? p + 1 : 0, d = defPasada(n), part = v.partida && v.partida.n === n ? v.partida : null;
    return { n: n, nombre: d.nombre, quien: d.quien, sale: d.sale, min: estimadoPasada(n, aprende), etiqueta: n + (part ? "b" : ""), falta: part ? part.nota : "", tope: d.tope || "" };
  }
  /** Si tu video está abierto: empezaste alguna pasada y todavía no pasó la revisión. */
  function abierto(v) { return !!(v && (v.prep || entero(v.pasada) > 0 || v.abiertoEl) && entero(v.pasada) < 4); }
  /** Los videos que tienes a medias (de tus clientes y el de tu cuenta), con cuántos días llevan abiertos. Como mucho deberían ser 2. */
  function videosAbiertos(datos, hoy) {
    var out = [];
    (datos.clientes || []).forEach(function (c) {
      if (c.estado === "terminado") return;
      ((c.proyecto && c.proyecto.videos) || []).forEach(function (v) {
        if (!abierto(v) || ["guion", "grabado", "edicion"].indexOf(v.estado) < 0) return;
        out.push({ c: c.id, v: v.id, titulo: v.titulo, quien: c.proyecto.negocio, hechas: pasadasHechas(v), dias: v.abiertoEl ? GB.diasEntre(v.abiertoEl.slice(0, 10), hoy) : 0, sig: siguientePasada(v, (datos.agencia || {}).aprende) });
      });
    });
    var wk = GB.semanaISO(hoy), sem = datos.agencia && datos.agencia.semanas && datos.agencia.semanas[wk];
    if (sem && abierto(sem)) out.push({ c: "agencia", v: wk, titulo: sem.cuerpo || "El cuerpo de tu semana", quien: "Tu cuenta", hechas: pasadasHechas(sem), dias: sem.abiertoEl ? GB.diasEntre(sem.abiertoEl.slice(0, 10), hoy) : 0, sig: siguientePasada(sem, datos.agencia.aprende) });
    return out.sort(function (a, b) { return b.dias - a.dias; });
  }
  /**
   * Las pasadas de tu día: «Video 3 de Peque's · pasada 2: el gancho · 45 min», en vez de «Editar video 3».
   * Los videos abiertos primero; si tienes menos de 2 abiertos, también el próximo video que espera.
   */
  function itemsPasadas(datos, hoy, ahora) {
    var abiertos = videosAbiertos(datos, hoy), out = [], ap = (datos.agencia || {}).aprende;
    var item = function (c, v, quien, nivel, esAg) {
      var s = siguientePasada(v, ap); if (!s) return null;
      var titulo = esAg ? (v.cuerpo || "El cuerpo de tu semana") : v.titulo;
      return {
        grupo: esAg ? "contenido" : "entregar", nivel: nivel, texto: "«" + titulo + "» · pasada " + s.etiqueta + ": " + minus(s.nombre) + " · " + s.min + " min",
        sub: quien + (s.falta ? " · falta: " + s.falta : ""), cliente: esAg ? null : c, pasada: { c: esAg ? "agencia" : c.id, v: esAg ? v.id : v.id, n: s.n }, min: s.min, lugar: "compu", tipoT: "pasada"
      };
    };
    (datos.clientes || []).forEach(function (c) {
      if (c.estado !== "activo") return;
      var p = c.proyecto, ed = (p.pasos || []).find(function (s) { return s.clave === "edicion" || /edici/i.test(s.nombre || ""); });
      var al = GB.alertas(c, hoy, ahora), aEd = ed ? al.filter(function (a) { return a.paso === ed.id; }) : [];
      var nivelEd = aEd.length ? Math.max.apply(null, aEd.map(function (a) { return a.nivel; })) : ed && ed.estado === "curso" ? 1 : 0;
      (p.videos || []).forEach(function (v) {
        if (["grabado", "edicion"].indexOf(v.estado) < 0 && !(v.estado === "guion" && abierto(v))) return;
        var esAbierto = abiertos.some(function (x) { return x.c === c.id && x.v === v.id; });
        if (!esAbierto && abiertos.length >= F.maxAbiertos) return;
        var it = item(c, v, p.negocio, Math.max(nivelEd, esAbierto ? 1 : 0), false);
        if (it) { it.abierto = esAbierto; out.push(it); }
      });
    });
    // El video de tu cuenta: cuando ya lo empezaste (lo grabado entra con su día «Grabar»)
    var wk = GB.semanaISO(hoy), sem = datos.agencia && datos.agencia.semanas && datos.agencia.semanas[wk];
    if (sem && abierto(sem)) { var ia = item(null, Object.assign({ id: wk }, sem), "Tu cuenta", 1, true); if (ia) { ia.abierto = true; out.push(ia); } }
    // Solo un video nuevo por vez, y nunca más de 2 abiertos
    var nuevos = out.filter(function (x) { return !x.abierto; }), lugar = Math.max(0, F.maxAbiertos - abiertos.length);
    return out.filter(function (x) { return x.abierto; }).concat(nuevos.slice(0, Math.min(1, lugar)));
  }
  /** Lo de cada mes de tu agencia (rellenar tu banco de ganchos): la primera semana del mes es amarillo; después, naranja. */
  function itemsMes(ag, hoy) {
    var mes = hoy.slice(0, 7), hechos = (ag && ag.meses && ag.meses[mes] && ag.meses[mes].hechos) || {}, dia = +hoy.slice(8, 10);
    return ((SIS.agencia && SIS.agencia.mensual) || []).filter(function (x) { return !hechos[x.clave]; }).map(function (x) {
      return { grupo: "contenido", nivel: dia <= 7 ? 1 : 2, texto: x.nombre, sub: "Tu agencia · una vez al mes", agencia: x.clave, mensual: true, guia: { agencia: x.clave } };
    });
  }
  function marcarMes(ag, clave, hoy, ahora) {
    var mes = hoy.slice(0, 7);
    ag.meses = ag.meses || {};
    var m = ag.meses[mes] || (ag.meses[mes] = { hechos: {} });
    m.hechos = m.hechos || {};
    if (m.hechos[clave]) delete m.hechos[clave]; else m.hechos[clave] = ahora;
    Object.keys(ag.meses).sort().slice(0, -6).forEach(function (k) { delete ag.meses[k]; });
    return !!m.hechos[clave];
  }
  // ---------- tus objetivos: el objetivo, su plan y sus tareas con fecha (v10) ----------
  /** Carga una sola vez los objetivos de tu sistema (después son tuyos: los cambias en el panel). Devuelve true si cargó. */
  function cargarObjetivos(ag) {
    if (!ag || ag.objCarga || (ag.objetivos && ag.objetivos.length)) return false;
    ag.objetivos = JSON.parse(JSON.stringify(SIS.objetivosIniciales || [])).map(function (o) {
      o.estado = o.estado || "activo";
      o.plan.forEach(function (p) { p.tareas.forEach(function (t) { t.fecha = t.fecha || ""; t.hecha = !!t.hecha; t.nota = t.nota || ""; t.desc = t.desc || ""; }); });
      return o;
    });
    ag.objCarga = SIS.version;
    return true;
  }
  /** Cuánto llevas de un objetivo: tareas hechas, el total, el % y las que se pasaron de su fecha. */
  function progresoObjetivo(o, hoy) {
    var ts = [];
    (o.plan || []).forEach(function (p) { (p.tareas || []).forEach(function (t) { ts.push(t); }); });
    var hechas = ts.filter(function (t) { return t.hecha; }).length;
    return { hechas: hechas, total: ts.length, pct: ts.length ? Math.round(hechas / ts.length * 100) : 0,
      vencidas: ts.filter(function (t) { return !t.hecha && t.fecha && t.fecha < hoy; }).length, dias: o.fecha ? GB.diasEntre(hoy, o.fecha) : null };
  }
  /**
   * Lo de tus objetivos que va a tu día: las tareas con fecha de hoy o de antes (o de mañana, en amarillo).
   * Las que no tienen fecha no salen en Hoy: las ves en Objetivos, con su plan.
   */
  function itemsObjetivos(ag, hoy) {
    var out = [], man = sumarDias(hoy, 1);
    ((ag && ag.objetivos) || []).forEach(function (o) {
      if (o.estado && o.estado !== "activo") return;
      (o.plan || []).forEach(function (p) {
        (p.tareas || []).forEach(function (t) {
          if (t.hecha || !t.fecha || t.fecha > man) return;
          out.push({ grupo: "contenido", nivel: t.fecha < hoy ? 3 : t.fecha === hoy ? 2 : 1, texto: t.texto, sub: "Objetivo · " + o.titulo + (t.fecha < hoy ? " · era para el " + GB.diaCorto(t.fecha) : ""),
            objetivo: { o: o.id, p: p.id, t: t.id }, guia: { objetivo: true } });
        });
      });
    });
    return out;
  }
  /** Busca una tarea de tus objetivos: { o, p, t } (los objetos de verdad, para cambiarlos). */
  function tareaObjetivo(ag, ref) {
    var o = ((ag && ag.objetivos) || []).find(function (x) { return x.id === ref.o; }), p = o && (o.plan || []).find(function (x) { return x.id === ref.p; }), t = p && (p.tareas || []).find(function (x) { return x.id === ref.t; });
    return t ? { o: o, p: p, t: t } : null;
  }
  /**
   * Tu día completo: el de siempre (guia.js), más tus pasadas y lo del mes, sin lo que soltaste esta semana.
   * Cuando hay pasadas de un cliente, el «Sigue con «Edición…»» se reemplaza por ellas.
   */
  function tuDiaCompleto(datos, hoy, ahora) {
    var dia = GB.tuDia(datos, hoy, ahora), pas = itemsPasadas(datos, hoy, ahora), sem = GB.semanaDe(datos.agencia, hoy), solt = (sem && sem.soltados) || {};
    var conPasadas = {};
    pas.forEach(function (x) { if (x.cliente) conPasadas[x.cliente.id] = true; });
    dia = dia.filter(function (x) {
      if (x.agencia && solt[x.agencia]) return false;
      if (x.cliente && conPasadas[x.cliente.id] && x.nivel === 0 && /edici/i.test(x.texto || "")) return false;
      return true;
    });
    var ORDEN = { cobrar: 0, cerrar: 1, entregar: 2, cuidar: 3, contenido: 4 };
    var todo = dia.concat(pas, itemsMes(datos.agencia, hoy), itemsObjetivos(datos.agencia, hoy), GB.itemsPiezas ? GB.itemsPiezas(datos.piezas, datos.guiones, hoy) : []);
    todo.forEach(function (x) { if (x.peso == null) x.peso = x.nivel * 10 - ORDEN[x.grupo] * 2; });
    return todo.sort(function (a, b) { return b.peso - a.peso || (a.hora || "99").localeCompare(b.hora || "99"); });
  }

  // ---------- el reloj (F3, F7, F13) ----------
  /** Los minutos que lleva lo que tienes entre manos: lo de antes (si lo pausaste) más lo de ahora, si está corriendo. */
  function minutosFoco(f, ahoraMs) {
    if (!f || !f.tipo) return 0;
    return entero(f.acumMin) + (f.inicioMs ? Math.max(0, Math.floor((ahoraMs - f.inicioMs) / 60000)) : 0);
  }
  /** Lo que el reloj te pregunta (una sola cosa por vez): ¿te fuiste?, ¿sigues 20 más? o ¿la partimos en dos? */
  function avisoReloj(f, ahoraMs, aprende) {
    if (!f || f.tipo !== "pasada" || !f.inicioMs) return null;
    var m = minutosFoco(f, ahoraMs), est = f.estimado || 45, normal = estimadoPasada(f.n, aprende);
    if (m >= 2 * Math.max(est, normal) && !f.marcadas) return { clave: "divagas", texto: T.textos.divagas };
    if (m >= est && f.marcadas > 0 && f.total && f.marcadas < f.total) return { clave: "sigues", texto: T.textos.sigues };
    if (m >= est) return { clave: "partir", texto: T.textos.partir };
    return null;
  }

  // ---------- lo que el panel aprende de ti (F13) ----------
  /** Tu tiempo real de una pasada (el promedio, con 5 o más), o el de tu sistema. */
  function estimadoPasada(n, aprende) {
    var l = (aprende && aprende.pasadas && aprende.pasadas[String(n)]) || [];
    if (l.length >= SIS.trabajo.aprende.minPasadas) return mediana(l);
    var corto = tamanoPedazo(aprende), base = (F.minPasada && F.minPasada[n]) || 45;
    return corto && corto < base ? corto : base;
  }
  /** Si muchas veces paras antes de los 22 minutos, tu pedazo es de 25. */
  function tamanoPedazo(aprende) {
    var l = (aprende && aprende.paradas) || [], A = SIS.trabajo.aprende;
    if (l.length < 5) return 0;
    return mediana(l) <= A.paraCorto ? A.pedazoCorto : 0;
  }
  /** Al terminar o pausar una pasada: suma tus minutos reales y, si era creativa, la hora. */
  function aprender(aprende, ev) {
    var a = aprende || {};
    a.pasadas = a.pasadas || {}; a.horas = a.horas || {}; a.paradas = a.paradas || []; a.trabe = a.trabe || [];
    if (ev.tipo === "pasada" && ev.min > 0) {
      var k = String(ev.n), l = a.pasadas[k] || (a.pasadas[k] = []);
      l.push(ev.min); if (l.length > 30) l.splice(0, l.length - 30);
      if ([0, 2].indexOf(ev.n) >= 0 && ev.hora >= 0) a.horas[String(ev.hora)] = (a.horas[String(ev.hora)] || 0) + 1;
    }
    if (ev.tipo === "gancho" && ev.hora >= 0) a.horas[String(ev.hora)] = (a.horas[String(ev.hora)] || 0) + 1;
    if (ev.tipo === "parada" && ev.min > 0) { a.paradas.push(ev.min); if (a.paradas.length > 30) a.paradas.splice(0, a.paradas.length - 30); }
    if (ev.tipo === "divago") a.divago = (a.divago || 0) + 1;
    if (ev.tipo === "trabe") { a.trabe.push(ev.termino ? 1 : 0); if (a.trabe.length > 30) a.trabe.splice(0, a.trabe.length - 30); }
    return a;
  }
  /** «Lo que sé de ti»: cada cosa con cuántos datos se calculó. Sin datos suficientes, lo dice. */
  function loQueSe(aprende) {
    var a = aprende || {}, out = [], A = SIS.trabajo.aprende;
    pasadas().forEach(function (p) {
      var l = (a.pasadas && a.pasadas[String(p.n)]) || [];
      out.push(l.length >= A.minPasadas
        ? { clave: "p" + p.n, texto: "Tu pasada " + p.n + " (" + minus(p.nombre) + ") tarda " + mediana(l) + " minutos", datos: "con " + l.length + " pasadas", listo: true }
        : { clave: "p" + p.n, texto: "La pasada " + p.n + " (" + minus(p.nombre) + "): todavía uso " + p.min + " minutos", datos: l.length + " de " + A.minPasadas + " pasadas para saber la tuya", listo: false });
    });
    var hb = horaBuena(a);
    out.push(hb ? { clave: "horas", texto: "Lo creativo te sale mejor de " + hb.desde + " a " + hb.hasta, datos: "con " + hb.n + " cosas creativas terminadas", listo: true }
      : { clave: "horas", texto: "Tus horas buenas: todavía no las sé", datos: totalHoras(a) + " de " + A.minHoras + " cosas creativas terminadas", listo: false });
    var ped = tamanoPedazo(a), pl = a.paradas || [];
    out.push(ped ? { clave: "pedazo", texto: "Muchas veces paras antes de los " + A.paraCorto + " minutos: tus pedazos son de " + ped, datos: "con " + pl.length + " pausas", listo: true }
      : { clave: "pedazo", texto: pl.length >= 5 ? "Tus pedazos de 45 minutos te calzan" : "El tamaño de tu pedazo: todavía no lo sé", datos: pl.length >= 5 ? "con " + pl.length + " pausas" : pl.length + " de 5 pausas", listo: pl.length >= 5 });
    var tb = a.trabe || [];
    if (tb.length) out.push({ clave: "trabe", texto: "Después de «Me trabé», terminaste algo en esa hora " + tb.filter(Boolean).length + " de " + tb.length + " veces", datos: "con " + tb.length + " veces", listo: true });
    return out;
  }
  function totalHoras(a) { return Object.keys((a && a.horas) || {}).reduce(function (s, k) { return s + a.horas[k]; }, 0); }
  /** La ventana de 2 horas en que más terminas lo creativo (con 8 datos o más). */
  function horaBuena(a) {
    var H = (a && a.horas) || {}, mejor = -1, n = 0;
    if (totalHoras(a) < SIS.trabajo.aprende.minHoras) return null;
    for (var h = 0; h < 23; h++) { var s = (H[h] || 0) + (H[h + 1] || 0); if (s > n) { n = s; mejor = h; } }
    return mejor < 0 ? null : { desde: mejor, hasta: mejor + 2, n: n };
  }

  // ---------- tu día en una sola cosa (F1, F2) ----------
  /** Una clave fija para cada cosa de tu día: así «la elegida de anoche» se encuentra hoy aunque cambie el orden. */
  function claveItem(x) {
    if (!x) return "";
    if (x.pasada) return "v:" + x.pasada.c + ":" + x.pasada.v + ":" + x.pasada.n;
    if (x.objetivo) return "obj:" + x.objetivo.o + ":" + x.objetivo.t;
    if (x.piezaRef) return "pz:" + x.piezaRef + ":" + (x.prueba ? "p" : "l");
    if (x.publicar) return "pub:" + x.publicar.c + ":" + x.publicar.v + ":" + (x.publicar.g || x.publicar.i || 0) + ":" + x.publicar.red;
    if (x.agencia) return "ag:" + x.agencia;
    if (x.prospecto) return "p:" + x.prospecto.id + ":" + ((x.guia && x.guia.etapa) || "") + ":" + (x.pide || x.wa || "");
    if (x.cliente) return "c:" + x.cliente.id + ":" + ((x.guia && x.guia.accion) || "paso") + ":" + ((x.guia && x.guia.paso) || (x.wa && x.wa.id) || "");
    return "";
  }
  /** Qué tipo de tarea es (para su tamaño, su lugar y su primer paso). */
  function tipoTarea(x) {
    if (!x) return "otro";
    if (x.pasada) return "pasada";
    if (x.agencia) return T.tamanos[x.agencia] ? x.agencia : "otro";
    if (x.prospecto) {
      if (x.wa) return "whatsapp";
      if (/visita/i.test(x.texto || "") && x.hora) return "visita";
      return "prospecto";
    }
    var acc = x.guia && x.guia.accion;
    if (acc === "cobro" || acc === "dijoPago" || (x.wa && (x.wa.tipo === "cobro" || x.wa.tipo === "dia15"))) return "cobro";
    if (acc === "parte") return "parte";
    if (x.wa) return "whatsapp";
    return "paso";
  }
  /** Lo que tarda más o menos y dónde se hace. Las pasadas, con tu tiempo real. */
  function tamanoDe(x, aprende) {
    var t = tipoTarea(x), base = T.tamanos[t] || T.tamanos.otro;
    return { tipo: t, min: x && x.pasada ? (x.min || estimadoPasada(x.pasada.n, aprende)) : base.min, lugar: base.lugar };
  }
  /** Dónde estás → qué puedes hacer ahí (el celular va contigo a todos lados). */
  var CALZA = { calle: ["calle", "celular"], compu: ["compu", "celular"], celular: ["celular"] };
  /** Tu bloque: lo que entra en tu tiempo y en tu lugar, por urgencia. Devuelve los lugares de tu día (índices). */
  function armarBloque(dia, minutos, lugar, aprende) {
    var util = Math.floor(minutos * (1 - (T.margenBloque || 0))), queda = util, out = [], calza = CALZA[lugar] || CALZA.celular;
    dia.forEach(function (x, i) {
      var t = tamanoDe(x, aprende);
      if (calza.indexOf(t.lugar) < 0 || t.min > queda) return;
      out.push(i); queda -= t.min;
    });
    return { indices: out, usados: util - queda, libres: minutos - (util - queda), margen: minutos - util };
  }
  /** «Mañana empiezas con…»: lo más urgente que entra en un pedazo de 45 minutos o menos, y otras opciones para elegir. */
  function propuestaManana(dia, aprende) {
    var cands = dia.map(function (x, i) { return { x: x, i: i, t: tamanoDe(x, aprende) }; });
    var cabe = cands.filter(function (c) { return c.t.min <= T.pedazo; });
    var una = cabe[0] || cands[0] || null;
    return { una: una, opciones: cabe.filter(function (c) { return c !== una; }).slice(0, 6) };
  }
  function cosaPlan(x, aprende) { var t = tamanoDe(x, aprende); return { clave: claveItem(x), texto: String(x.texto || "").slice(0, 160), sub: String(x.sub || "").slice(0, 60), min: t.min, lugar: t.lugar }; }
  /** La elegida de anoche, si sigue en tu día (si ya no está, la hiciste o se movió). */
  function buscarEnDia(dia, clave) { for (var i = 0; i < dia.length; i++) if (claveItem(dia[i]) === clave) return i; return -1; }
  /** Algo de 10 minutos para un día malo o para volver: lo más urgente que entra en 10 minutos (si no hay, lo más corto). */
  function diezMinutos(dia, aprende) {
    var c = dia.map(function (x, i) { return { i: i, t: tamanoDe(x, aprende) }; });
    var cabe = c.filter(function (y) { return y.t.min <= T.diaMinimo; });
    if (cabe.length) return cabe[0].i;
    c.sort(function (a, b) { return a.t.min - b.t.min; });
    return c.length ? c[0].i : -1;
  }
  /** «Me trabé»: un solo paso de 2 minutos de lo que tienes delante. */
  function primerPaso(x) {
    var t = tipoTarea(x), molde = T.primerPaso[t] || T.primerPaso.otro;
    var quien = x ? (x.cliente ? x.cliente.proyecto.contacto || x.cliente.proyecto.negocio : x.prospecto ? x.prospecto.contacto || x.prospecto.negocio || "la tienda" : x.sub || "") : "";
    var que = x && x.pasada ? String(x.texto || "").split(" · ")[0] : "";
    return GB.rellenar(molde, { quien: quien, que: que });
  }

  // ---------- tu constancia, contada sola y sin culpa (F10) ----------
  var TRABAJO = ["paso", "su-parte", "cobro", "pasada", "video", "parte", "prospecto", "agencia", "sesion"];
  var TERMINADO = ["paso", "su-parte", "cobro", "pasada", "video", "parte", "prospecto", "agencia"];
  /** Junta lo de tu hoja (días anteriores) con lo de hoy en este aparato, sin repetir. Cada fila: [fecha, inicio, fin, tipo, grupo]. */
  function juntarFilas(servidor, locales) {
    var vistos = {}, out = [];
    (servidor || []).concat(locales || []).forEach(function (f) {
      var k = f.slice(0, 5).join("|");
      if (vistos[k]) return; vistos[k] = true; out.push(f);
    });
    return out;
  }
  function filaDe(ev) { return [ev.sello.slice(0, 10), ev.sello.slice(11, 16), ev.fin ? String(ev.fin).slice(11, 16) : "", ev.tipo, ev.grupo]; }
  /** Tu constancia: lo que vas sumando en el mes (sin rachas), tu semana día por día y el promedio de 4 semanas, que casi no se mueve por un día malo. */
  function constancia(filas, hoy) {
    var mes = hoy.slice(0, 7), porDia = {}, m = { dias: 0, pasadas: 0, videos: 0, visitas: 0, cobros: 0, partes: 0, clientes: 0 };
    filas.forEach(function (f) {
      var d = f[0], tipo = f[3];
      if (TERMINADO.indexOf(tipo) < 0) return;
      porDia[d] = (porDia[d] || 0) + 1;
    });
    Object.keys(porDia).forEach(function (d) { if (d.slice(0, 7) === mes && porDia[d]) m.dias++; });
    filas.forEach(function (f) {
      if (f[0].slice(0, 7) !== mes) return;
      if (f[3] === "pasada") m.pasadas++;
      if (f[3] === "video") m.videos++;
      if (f[3] === "prospecto") m.visitas++;
      if (f[3] === "cobro") m.cobros++;
      if (f[3] === "parte") m.partes++;
    });
    var semana = [];
    for (var i = 6; i >= 0; i--) { var d = sumarDias(hoy, -i); semana.push({ fecha: d, n: porDia[d] || 0 }); }
    var suma = 0; for (var j = 1; j <= 28; j++) suma += porDia[sumarDias(hoy, -j)] || 0;
    return { mes: m, semana: semana, promedio4: Math.round(suma / 28 * 10) / 10, hoy: porDia[hoy] || 0, ayer: porDia[sumarDias(hoy, -1)] || 0, porDia: porDia };
  }
  /** «Esta semana terminaste: 9 pasadas, 2 videos, 14 visitas, 1 cliente» (de lunes a domingo de la semana que pides). */
  function resumenSemana(filas, lunes) {
    var dom = sumarDias(lunes, 6), r = { pasadas: 0, videos: 0, visitas: 0, cobros: 0, partes: 0, dias: 0 }, dias = {};
    filas.forEach(function (f) {
      if (f[0] < lunes || f[0] > dom || TERMINADO.indexOf(f[3]) < 0) return;
      dias[f[0]] = true;
      if (f[3] === "pasada") r.pasadas++; if (f[3] === "video") r.videos++; if (f[3] === "prospecto") r.visitas++; if (f[3] === "cobro") r.cobros++; if (f[3] === "parte") r.partes++;
    });
    r.dias = Object.keys(dias).length;
    return r;
  }
  function fraseSemana(r, cierres) {
    var p = [];
    if (r.pasadas) p.push(r.pasadas + (r.pasadas === 1 ? " pasada" : " pasadas"));
    if (r.videos) p.push(r.videos + (r.videos === 1 ? " video" : " videos"));
    if (r.visitas) p.push(r.visitas + (r.visitas === 1 ? " cosa con tus prospectos" : " cosas con tus prospectos"));
    if (cierres) p.push(cierres + (cierres === 1 ? " cliente" : " clientes"));
    if (r.cobros) p.push(r.cobros + (r.cobros === 1 ? " cobro" : " cobros"));
    return p.length ? "Esta semana terminaste: " + GB.unir(p) + "." : "Esta semana no quedó nada anotado. La que viene empieza de cero, sin deuda.";
  }
  /** Tu día en colores (tu Mis Acciones, adentro del panel): los tramos con su categoría, dentro de tu horario. Lo que no está anotado queda gris. */
  function barraDia(filas, fecha, horario, ahoraMin) {
    var d0 = hhmm(horario.desde), d1 = hhmm(horario.hasta);
    if (ahoraMin != null) d1 = Math.min(d1, Math.max(d0, ahoraMin));
    var tramos = [];
    filas.forEach(function (f) {
      if (f[0] !== fecha) return;
      var a = hhmm(f[1]), b = f[2] ? hhmm(f[2]) : a, tipo = f[3];
      if (a < 0) return;
      if (b <= a) { if (TRABAJO.indexOf(tipo) < 0) return; a = Math.max(0, a - 10); b = a + 10; }   // lo que pasó en un toque: 10 minutos
      var cat = tipo === "hueco" || tipo === "descanso" ? (tipo === "descanso" ? "descanso" : f[4]) : tipo === "sesion" || tipo === "bloque" ? f[4] || "entregar" : f[4];
      tramos.push({ a: Math.max(a, d0), b: Math.min(b, d1), cat: cat });
    });
    return tramos.filter(function (t) { return t.b > t.a; }).sort(function (x, y) { return x.a - y.a; }).map(function (t) { return { desde: aHora(t.a), hasta: aHora(t.b), min: t.b - t.a, cat: t.cat, ini: (t.a - d0) / Math.max(1, hhmm(horario.hasta) - d0), largo: (t.b - t.a) / Math.max(1, hhmm(horario.hasta) - d0) }; });
  }

  // ---------- «¿Qué pasó en esa hora?» (F17) ----------
  /**
   * El hueco de hoy por el que conviene preguntar (uno solo, el último): más de 30 minutos sin nada anotado, dentro de tu horario,
   * entre lo primero que hiciste y ahora. Nunca de días anteriores. `preguntados` = los que ya preguntó (no vuelve a preguntar).
   */
  function huecoPendiente(filas, hoy, ahoraMin, horario, preguntados, enCurso, minHueco) {
    var d0 = hhmm(horario.desde), d1 = Math.min(hhmm(horario.hasta), ahoraMin), lim = minHueco || T.huecoMin, iv = [];
    filas.forEach(function (f) {
      if (f[0] !== hoy) return;
      var a = hhmm(f[1]), b = f[2] ? hhmm(f[2]) : a;
      if (a < 0) return;
      if (b <= a) { a -= 5; b = a + 5; }
      iv.push([a, b]);
    });
    if (enCurso) iv.push([enCurso, ahoraMin]);
    if (!iv.length) return null;
    iv.sort(function (x, y) { return x[0] - y[0]; });
    var unidos = [iv[0].slice()];
    iv.slice(1).forEach(function (x) { var u = unidos[unidos.length - 1]; if (x[0] <= u[1]) u[1] = Math.max(u[1], x[1]); else unidos.push(x.slice()); });
    var huecos = [];
    for (var i = 0; i < unidos.length; i++) {
      var desde = unidos[i][1], hasta = i + 1 < unidos.length ? unidos[i + 1][0] : d1;
      desde = Math.max(desde, d0); hasta = Math.min(hasta, d1);
      if (hasta - desde > lim) huecos.push({ desde: aHora(desde), hasta: aHora(hasta), min: hasta - desde, id: hoy + "|" + aHora(desde) });
    }
    var no = preguntados || {};
    huecos = huecos.filter(function (h) { return !no[h.id]; });
    return huecos.length ? huecos[huecos.length - 1] : null;
  }

  /**
   * Desde cuántos minutos pregunta por un hueco. stats = { "2026-10-29": { vistos, contestados } } (lo guarda tu aparato).
   * Si en los últimos 7 días viste 4 preguntas o más y contestaste menos de la mitad, pregunta solo por huecos de más de 1 hora.
   */
  function minHuecoDe(stats, hoy) {
    var v = 0, c = 0;
    for (var i = 0; i < 7; i++) { var d = (stats || {})[sumarDias(hoy, -i)]; if (d) { v += entero(d.vistos); c += entero(d.contestados); } }
    return v >= 4 && c * 2 < v ? T.huecoMinMenos : T.huecoMin;
  }

  // ---------- la revisión del domingo: tus señales de la semana, para pegarle a Claude (diagnóstico §12) ----------
  /**
   * o = { filas, hoy, videos: [{ abiertoEl, pasadasEl }], abiertos (cuántos a medias), arranques: { fecha: segundos }, horario, bandeja (cuántas sin ordenar), aprende }.
   * Devuelve { lineas: [{ que, hoy, meta }], texto } con lo que se pudo medir; lo que todavía no tiene datos lo dice.
   */
  function senalesSemana(o) {
    var hoy = o.hoy, filas = o.filas || [], L = [], k = constancia(filas, hoy);
    var desde28 = sumarDias(hoy, -28), dias = [];
    (o.videos || []).forEach(function (v) {
      var fin = v && v.pasadasEl && v.pasadasEl[4], ini = v && v.abiertoEl;
      if (fin && ini && fin.slice(0, 10) >= desde28) dias.push(Math.max(0, GB.diasEntre(ini.slice(0, 10), fin.slice(0, 10))));
    });
    L.push({ que: "Días entre empezar un video y terminarlo", hoy: dias.length ? mediana(dias) + " (la mediana de " + dias.length + (dias.length === 1 ? " video" : " videos") + " en 4 semanas)" : "sin videos terminados en 4 semanas", meta: "3" });
    L.push({ que: "Videos a medias", hoy: String(o.abiertos || 0), meta: "2 como máximo" });
    var esta = resumenSemana(filas, GB.lunesDe(hoy)), pasada = resumenSemana(filas, sumarDias(GB.lunesDe(hoy), -7));
    L.push({ que: "Pasadas terminadas", hoy: esta.pasadas + " esta semana (la anterior: " + pasada.pasadas + ")", meta: "que suba" });
    L.push({ que: "Días con algo terminado", hoy: k.mes.dias + " este mes", meta: "que suba" });
    // Días hasta volver: el tramo más largo de días seguidos sin nada, entre dos días con algo, en 4 semanas
    var largo = 0, corre = 0, vio = false;
    for (var i = 28; i >= 1; i--) { var n = k.porDia[sumarDias(hoy, -i)] || 0; if (n) { if (vio && corre > largo) largo = corre; vio = true; corre = 0; } else if (vio) corre++; }
    L.push({ que: "Días hasta volver después de un día sin nada", hoy: vio ? (largo ? "el más largo: " + largo + (largo === 1 ? " día" : " días") : "no hubo días sin nada entre medio") : "sin datos todavía", meta: "1" });
    var seg = []; Object.keys(o.arranques || {}).forEach(function (d) { if (d > sumarDias(hoy, -7)) seg.push(entero(o.arranques[d])); });
    L.push({ que: "De abrir el panel a empezar algo", hoy: seg.length ? (mediana(seg) < 120 ? mediana(seg) + " segundos" : Math.round(mediana(seg) / 60) + " minutos") + " (mediana de " + seg.length + (seg.length === 1 ? " día)" : " días)") : "sin datos todavía", meta: "menos de 2 minutos" });
    var cerrados = {}; filas.forEach(function (f) { if (f[3] === "dia" && f[4] === "cierre" && f[0] > sumarDias(hoy, -8) && f[0] < hoy) cerrados[f[0]] = true; });
    L.push({ que: "Días que cerraste el día", hoy: Object.keys(cerrados).length + " de 7", meta: "5 de 7" });
    if (o.horario) {
      var tot = 0, lleno = 0, H = o.horario;
      for (var j = 1; j <= 7; j++) { tot += Math.max(0, hhmm(H.hasta) - hhmm(H.desde)); barraDia(filas, sumarDias(hoy, -j), H, null).forEach(function (t) { lleno += t.min; }); }
      L.push({ que: "Tu horario en gris («sin anotar»)", hoy: tot ? Math.max(0, Math.round((1 - lleno / tot) * 100)) + "% de los últimos 7 días" : "—", meta: "que baje" });
    }
    L.push({ que: "Ideas en la bandeja sin ordenar", hoy: String(o.bandeja || 0), meta: "que se vacíe cada noche" });
    var p0 = (o.aprende && o.aprende.pasadas && o.aprende.pasadas["0"]) || [];
    L.push({ que: "La pasada 0 (decidir lo que se ve)", hoy: p0.length ? mediana(p0) + " minutos (mediana de " + p0.length + ")" : "sin datos todavía", meta: "menos de 30 minutos" });
    var texto = "Mi semana en el panel (hasta el " + hoy.split("-").reverse().join("/") + "). Mira estas señales conmigo y decidamos UN solo ajuste para la semana que viene:\n" +
      L.map(function (x) { return "- " + x.que + ": " + x.hoy + " · meta: " + x.meta; }).join("\n");
    return { lineas: L, texto: texto };
  }

  // ---------- la bandeja de ideas (F6) ----------
  /** Las ideas que soltaste y todavía no ordenaste (las de más de 14 días se van solas a «algún día»). */
  function bandeja(libreta, hoy) {
    var lim = sumarDias(hoy, -T.bandejaDias);
    return (libreta || []).filter(function (n) { return n.estado === "bandeja" && !n.hecha && String(n.creado || hoy).slice(0, 10) >= lim; });
  }
  function bandejaVencida(libreta, hoy) {
    var lim = sumarDias(hoy, -T.bandejaDias);
    return (libreta || []).filter(function (n) { return n.estado === "bandeja" && !n.hecha && String(n.creado || hoy).slice(0, 10) < lim; });
  }
  /** Para la gran barrida: una idea por línea, sin viñetas ni vacías. */
  function ideasDeTexto(texto) {
    return String(texto || "").split(/\r?\n/).map(function (l) { return l.replace(/^\s*[-•*·\d.)]+\s*/, "").trim(); }).filter(function (l) { return l.length > 1; }).slice(0, 100);
  }

  // ---------- lo que se ve, decidido antes de editar (F4) ----------
  /** De qué tipo es una frase (un problema, un número, el producto, la tienda, la oferta o reservar), para proponerte lo que se ve. */
  function queEs(dice) {
    var t = " " + String(dice || "").toLowerCase() + " ";
    var hit = function (m) { return m.palabras.some(function (p) { return t.indexOf(p) >= 0; }); };
    var orden = ["reservar", "oferta", "numero", "problema", "tienda", "producto"];
    for (var i = 0; i < orden.length; i++) {
      var m = F.menuVe.find(function (x) { return x.clave === orden[i]; });
      if (!m) continue;
      if (m.numero && /\d/.test(t) && hit(m)) return m;
      if (!m.numero && hit(m)) return m;
    }
    if (/\d/.test(t)) return F.menuVe.find(function (x) { return x.clave === "numero"; });
    return null;
  }
  /** Las opciones de lo que se ve para una frase: las de tu sistema y, primero, cómo lo resolviste tú la última vez (tus ediciones). */
  function opcionesVe(dice, momento, ediciones) {
    var m = queEs(dice), out = [];
    if (momento) (ediciones || []).forEach(function (e) {
      var r = e.momentos && e.momentos[momento];
      if (r && r.que && out.length < 2) out.push({ tipo: tipoDeTecnica(r.tecnica), ve: r.que, molde: e.prompt || "", tuya: true, de: e.titulo });
    });
    return { que: m, opciones: out.concat(m ? m.opciones : []) };
  }
  function tipoDeTecnica(t) {
    t = String(t || "").toLowerCase();
    if (/anim/.test(t)) return "animar"; if (/ia/.test(t)) return "ia"; if (/motion/.test(t)) return "motion"; if (/texto/.test(t)) return "texto"; if (/comod/.test(t)) return "comodin";
    return "toma";
  }
  /** La lista de la pasada 0, armada sola desde la columna «lo que se ve»: genera, anima, haz el motion, pasa la toma. */
  function prepDeGuion(guion) {
    var out = [];
    ((guion && guion.filas) || []).forEach(function (f, i) {
      var t = (F.tiposVe || []).find(function (x) { return x.clave === f.tipo; });
      if (!t || !t.prep || !f.ve) return;
      out.push({ i: i, texto: t.prep + ": " + f.ve, prompt: f.tipo === "ia" || f.tipo === "animar" ? f.prompt || "" : "", hecho: !!f.hecho });
    });
    return out;
  }
  /** Si el guion todavía no tiene «lo que se ve», la pasada 0 empieza por llenarlo (unos 10 minutos). */
  function faltaLoQueSeVe(guion) { var f = (guion && guion.filas) || []; return !f.length || f.some(function (x) { return x.dice && !x.ve; }); }

  // ---------- tus ediciones como referencia (F5) ----------
  /** 3 referencias para un video nuevo: primero las del mismo rubro; si no hay, las que resolvieron el mismo momento en otro rubro. */
  function referencias(ediciones, rubro, momento) {
    var r = String(rubro || "").toLowerCase(), lista = (ediciones || []).slice().sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
    var mismo = lista.filter(function (e) { return r && String(e.rubro || "").toLowerCase() === r; });
    var otro = lista.filter(function (e) { return mismo.indexOf(e) < 0 && (!momento || (e.momentos && e.momentos[momento] && e.momentos[momento].que)); });
    return mismo.concat(otro).slice(0, 3).map(function (e) { return { ed: e, mismoRubro: mismo.indexOf(e) >= 0 }; });
  }
  /** «La última vez»: cómo resolviste ese momento en tu última edición (del mismo rubro si hay). */
  function ultimaVez(ediciones, rubro, momento) {
    var ref = referencias(ediciones, rubro, momento)[0];
    if (!ref) return null;
    var m = ref.ed.momentos && ref.ed.momentos[momento];
    return { ed: ref.ed, momento: momento, que: m && m.que, tecnica: m && m.tecnica, mismoRubro: ref.mismoRubro };
  }

  // ---------- tu banco de ganchos (F11) ----------
  /**
   * Lee lo que pegas de tu Excel (las celdas copiadas: la primera fila son las familias, debajo los videos) o un CSV.
   * También acepta una línea por variación: «familia | link | nota».
   */
  function importarGanchos(texto) {
    var lineas = String(texto || "").replace(/\r/g, "").split("\n").filter(function (l) { return l.trim(); });
    if (!lineas.length) return [];
    var fams = {}, orden = [];
    var poner = function (fam, link, nota) {
      fam = String(fam || "").trim(); if (!fam) return;
      if (!fams[fam]) { fams[fam] = { familia: fam.slice(0, 120), molde: "", para: "", rubros: "", origen: "Pegado de tu Excel", variaciones: [] }; orden.push(fam); }
      link = String(link || "").trim();
      if (/^https?:\/\//.test(link) || nota) fams[fam].variaciones.push({ link: /^https:\/\//.test(link) ? link : "", formato: /photo/.test(link) ? "Fotos" : "Video", nota: String(nota || "").slice(0, 120) });
    };
    if (lineas.some(function (l) { return / \| /.test(l); })) {
      lineas.forEach(function (l) { var p = l.split("|").map(function (s) { return s.trim(); }); poner(p[0], p[1], p[2]); });
    } else {
      var sep = lineas[0].indexOf("\t") >= 0 ? "\t" : lineas[0].indexOf(";") >= 0 ? ";" : ",";
      var celdas = lineas.map(function (l) { return l.split(sep).map(function (s) { return s.replace(/^"|"$/g, "").trim(); }); });
      var titulos = celdas[0];
      titulos.forEach(function (t, c) { if (t) { poner(t); celdas.slice(1).forEach(function (fila) { if (fila[c]) poner(t, fila[c]); }); } });
    }
    return orden.map(function (k) { return fams[k]; });
  }
  /** Junta lo importado con tu banco: si la familia ya existe, le suma las variaciones nuevas (sin repetir links). */
  function unirGanchos(banco, nuevos) {
    var out = { nuevas: [], cambiadas: [] };
    nuevos.forEach(function (n) {
      var ya = (banco || []).find(function (b) { return String(b.familia).toLowerCase() === String(n.familia).toLowerCase(); });
      if (!ya) { out.nuevas.push(n); return; }
      var links = {}; (ya.variaciones || []).forEach(function (v) { links[v.link] = true; });
      var sum = n.variaciones.filter(function (v) { return !v.link || !links[v.link]; });
      if (sum.length) out.cambiadas.push({ id: ya.id, variaciones: (ya.variaciones || []).concat(sum).slice(0, 40) });
    });
    return out;
  }
  /** 3 ganchos para un video: los que calzan con su rubro (o con cualquiera), primero los que mejor te funcionaron. */
  function ganchosPara(banco, rubro, para) {
    var r = String(rubro || "").toLowerCase();
    var puntaje = function (g) {
      var n = g.numeros || {}, calza = !g.rubros || !r || String(g.rubros).toLowerCase().indexOf(r) >= 0;
      return (calza ? 1000 : 0) + (para && g.para === para ? 300 : 0) + (n.reservas || 0) * 20 + (n.r3 || 0) * 3 + Math.min(200, Math.round((n.vistas || 0) / 1000)) + (g.variaciones || []).length;
    };
    return (banco || []).slice().sort(function (a, b) { return puntaje(b) - puntaje(a); }).slice(0, 3);
  }
  /** Llena el molde: «Nadie te dice que ___ cuando compras ___» con lo que escribes. */
  function llenarMolde(molde, partes) {
    var i = 0;
    return String(molde || "").replace(/_{2,}/g, function () { var v = (partes || [])[i++]; return v ? v : "___"; });
  }

  // ---------- el guion exprés y la lista de tomas (F12) ----------
  /** Las tomas de un formato, más las 10 comodines de tu fábrica (sin repetir). */
  function tomasDe(formato) {
    var f = (F.formatos || []).find(function (x) { return x.clave === formato || x.nombre === formato; }) || (F.formatos || [])[0];
    var base = (f ? f.tomas : []).map(function (t) { return { nombre: t, hecha: false, base: true }; });
    var vistos = {}; base.forEach(function (t) { vistos[t.nombre.toLowerCase()] = true; });
    return base.concat(F.comodines.filter(function (c) { return !vistos[c.toLowerCase()]; }).map(function (c) { return { nombre: c, hecha: false, base: false }; }));
  }
  /** Lo que faltó grabar, en una línea. */
  function falto(tomas) {
    var f = (tomas || []).filter(function (t) { return t.base && !t.hecha; }).map(function (t) { return minus(t.nombre); });
    return f.length ? "Faltó: " + f.join(", ") + "." : "";
  }

  // ---------- el pedido para Claude: copiar y pegar, sin API (F14) ----------
  /** El texto para pegar en Claude, con todo lo que tu panel sabe del video. */
  function pedidoClaude(ctx) {
    var g = ctx.guion || {}, refs = ctx.refs || [], ganchos = ctx.ganchos || [];
    var l = [];
    l.push("Te paso un video para que me ayudes con «lo que se ve». Sigue la narrativa del guion, momento a momento: no vayas imagen por imagen.");
    l.push("");
    l.push("EL NEGOCIO: " + (ctx.negocio || "") + (g.rubro ? " · rubro: " + g.rubro : "") + (g.producto ? " · producto: " + g.producto : ""));
    if (g.formato) l.push("EL FORMATO: " + g.formato);
    if (g.gancho && (g.gancho.texto || g.gancho.familia)) {
      l.push("EL GANCHO ELEGIDO: " + (g.gancho.texto || g.gancho.familia));
      var fam = ganchos.find(function (x) { return x.id === g.gancho.id || x.familia === g.gancho.familia; });
      if (fam && fam.variaciones && fam.variaciones.length) l.push("Sus variaciones (videos que ya funcionaron): " + fam.variaciones.slice(0, 5).map(function (v) { return v.link || v.nota; }).join(" · "));
    }
    l.push("");
    l.push("EL CUERPO (lo que se dice):");
    var filas = (g.filas || []).filter(function (f) { return f.dice; });
    if (filas.length) filas.forEach(function (f, i) { l.push((i + 1) + ". " + (f.momento ? "[" + f.momento + "] " : "") + f.dice); });
    else l.push(g.cuerpo || "(todavía no lo escribí: propónmelo tú, corto, con mi voz)");
    if (refs.length) {
      l.push("");
      l.push("MIS REFERENCIAS (cómo resolví esos momentos en otros videos; de un rubro a otro se copia la forma, no la imagen):");
      refs.forEach(function (r) {
        var e = r.ed || r, m = e.momentos || {};
        l.push("- " + e.titulo + (e.rubro ? " (" + e.rubro + ")" : "") + ": " + F.momentos.map(function (x) { var y = m[x.clave]; return y && y.que ? x.nombre.toLowerCase() + " → " + y.que + (y.tecnica ? " [" + y.tecnica + "]" : "") : ""; }).filter(Boolean).join("; "));
      });
    }
    l.push("");
    l.push("MI MENÚ DE LO QUE SE VE (elige de aquí cuando calce):");
    F.menuVe.forEach(function (m) { l.push("- " + m.cuando + ": " + m.opciones.map(function (o) { return o.ve; }).join(" / ")); });
    l.push("");
    l.push("LO QUE TE PIDO:");
    l.push("1. La tabla, una línea por momento, en este formato exacto (sin nada más en la línea):");
    l.push("lo que se dice | lo que se ve | tipo | prompt");
    l.push("   tipo es uno de: toma, ia, animar, motion, texto, comodin. El prompt solo para ia o animar (vertical 9:16, realista, sin texto).");
    l.push("2. Debajo, la lista de tomas que tengo que grabar, una por línea, empezando con «TOMA:».");
    l.push("El criterio: que el mensaje se entienda, no que sea «wow».");
    return l.join("\n");
  }
  /** Lee lo que respondió Claude: las líneas «dice | ve | tipo | prompt» y las «TOMA: …». */
  function leerRespuesta(texto) {
    var filas = [], tomas = [], tipos = (F.tiposVe || []).map(function (t) { return t.clave; });
    String(texto || "").replace(/\r/g, "").split("\n").forEach(function (l) {
      var s = l.trim().replace(/^\d+[.)]\s*/, "");
      if (!s) return;
      var tm = s.match(/^(?:toma|tomas)\s*:\s*(.+)$/i);
      if (tm) { tomas.push({ nombre: tm[1].trim().slice(0, 120), hecha: false, base: true }); return; }
      if (s.indexOf("|") < 0) return;
      var p = s.replace(/^\||\|$/g, "").split("|").map(function (x) { return x.trim(); });
      if (p.length < 2 || /^lo que se dice$/i.test(p[0]) || /^-+$/.test(p[0].replace(/[\s:]/g, ""))) return;
      var tipo = String(p[2] || "").toLowerCase().replace(/[^a-zó]/g, "");
      if (tipo === "imagen" || tipo === "imagenia") tipo = "ia";
      if (tipos.indexOf(tipo) < 0) tipo = tipoDeTecnica(p[2]);
      filas.push({ momento: "", dice: p[0].slice(0, 300), ve: (p[1] || "").slice(0, 240), tipo: tipo, prompt: (p[3] || "").slice(0, 600), hecho: false });
    });
    return { filas: filas.slice(0, 24), tomas: tomas.slice(0, 30) };
  }

  // ---------- un tope de versiones para tus videos (F15) ----------
  function puedeOtraVersion(sem) { return entero(sem && sem.version) < F.topeVersiones; }

  // ---------- desde cuándo está cada cosa en su color (Cambio 13) ----------
  var COLORES = ["verde", "amarillo", "naranja", "rojo"];
  /**
   * Anota el día en que cada cosa de tu día apareció en su color (por su clave fija). Si cambia de color, vuelve a contar.
   * Lo verde no se anota. Lo que se va: si estuvo 3 días o más en rojo, queda 30 días para «Lo que sé de ti»; lo demás se borra.
   * Devuelve true si cambió algo (para guardarlo en tu agencia).
   */
  function actualizarVistos(vistos, items, hoy) {
    var cambio = false, ahora = {};
    (items || []).forEach(function (x) {
      var k = claveItem(x), n = Math.max(0, Math.min(3, entero(x && x.nivel)));
      if (!k || !n || ahora[k] != null) return;
      ahora[k] = n;
      var v = vistos[k];
      if (!v || v.n !== n || v.f) { vistos[k] = { d: hoy, n: n, t: String(x.texto || "").slice(0, 80) }; cambio = true; }
    });
    Object.keys(vistos).forEach(function (k) {
      var v = vistos[k];
      if (ahora[k] != null) return;
      if (v.f) { if (GB.diasEntre(v.f, hoy) > 30) { delete vistos[k]; cambio = true; } return; }
      if (v.n === 3 && GB.diasEntre(v.d, hoy) >= 3) v.f = hoy; else delete vistos[k];
      cambio = true;
    });
    // Como mucho 150: se van primero los que ya terminaron y los más viejos
    var ks = Object.keys(vistos);
    if (ks.length > 150) {
      ks.sort(function (a, b) { var x = vistos[a], y = vistos[b]; return (x.f ? 0 : 1) - (y.f ? 0 : 1) || String(x.d).localeCompare(String(y.d)); });
      ks.slice(0, ks.length - 150).forEach(function (k) { delete vistos[k]; });
      cambio = true;
    }
    return cambio;
  }
  /** «rojo hace 3 días»: desde 1 día (lo de hoy no se dice). */
  function haceColor(vistos, x, hoy) {
    var v = vistos && vistos[claveItem(x)];
    if (!v || v.f || v.n !== x.nivel) return "";
    var d = GB.diasEntre(v.d, hoy);
    return d >= 1 ? COLORES[v.n] + " hace " + d + (d === 1 ? " día" : " días") : "";
  }
  /** Lo que estuvo 3 días o más en rojo (lo de ahora y lo de los últimos 30 días): a eso se le baja el nivel o se arregla lo que lo frena. */
  function rojosLargos(vistos, hoy) {
    return Object.keys(vistos || {}).map(function (k) { var v = vistos[k]; return { clave: k, n: v.n, texto: v.t || k, desde: v.d, hasta: v.f || "", sigue: !v.f, dias: GB.diasEntre(v.d, v.f || hoy) }; })
      .filter(function (x) { return x.n === 3 && x.dias >= 3; })
      .sort(function (a, b) { return b.dias - a.dias || (a.sigue === b.sigue ? 0 : a.sigue ? -1 : 1); });
  }

  // ---------- lo que usas (Cambio 15): cada botón suma 1, guardado solo en tu aparato ----------
  /** Suma un toque a una acción (con el día y el nombre que se ve en el botón). Devuelve el contador nuevo. */
  function sumarUso(uso, accion, texto, hoy) {
    uso = uso && typeof uso === "object" ? uso : {};
    uso.desde = uso.desde || hoy; uso.a = uso.a || {};
    var k = String(accion || "").slice(0, 40); if (!k) return uso;
    var r = uso.a[k] || (uso.a[k] = { n: 0, ult: "", vio: hoy, txt: "" });
    r.n++; r.ult = hoy; if (texto) r.txt = String(texto).slice(0, 60);
    return uso;
  }
  /** Las acciones que hay en pantalla quedan anotadas como vistas (con su nombre), aunque nunca las toques. Devuelve true si apareció alguna nueva. */
  function verUso(uso, lista, hoy) {
    var nuevo = false;
    uso.desde = uso.desde || hoy; uso.a = uso.a || {};
    (lista || []).forEach(function (x) {
      var k = String(x.accion || "").slice(0, 40); if (!k) return;
      var r = uso.a[k];
      if (!r) { uso.a[k] = { n: 0, ult: "", vio: hoy, txt: String(x.texto || "").slice(0, 60) }; nuevo = true; }
      else if (!r.txt && x.texto) { r.txt = String(x.texto).slice(0, 60); nuevo = true; }
    });
    return nuevo;
  }
  /** Lo que no tocaste en 30 días (o nunca, desde que lo viste hace 30 días). Con menos de 30 días de uso, todavía no se sabe. */
  function sinUso(uso, hoy, dias) {
    dias = dias || 30;
    var a = (uso && uso.a) || {}, listo = !!(uso && uso.desde) && GB.diasEntre(uso.desde, hoy) >= dias;
    var lista = Object.keys(a).map(function (k) { var r = a[k]; return { accion: k, texto: r.txt || k, n: r.n, ult: r.ult, vio: r.vio, dias: GB.diasEntre(r.ult || r.vio || hoy, hoy) }; })
      .filter(function (x) { return x.dias >= dias; })
      .sort(function (x, y) { return y.dias - x.dias || x.n - y.n; });
    return { listo: listo, faltan: uso && uso.desde ? Math.max(0, dias - GB.diasEntre(uso.desde, hoy)) : dias, lista: lista,
      mas: Object.keys(a).map(function (k) { return { accion: k, texto: a[k].txt || k, n: a[k].n }; }).filter(function (x) { return x.n > 0; }).sort(function (x, y) { return y.n - x.n; }).slice(0, 8) };
  }

  // ---------- sin señal (Cambio 4): lo que no se pudo guardar espera en tu celular y se sube cuando vuelve ----------
  var LOCAL = "local-";
  function esLocal(id) { return String(id || "").indexOf(LOCAL) === 0; }
  /** Algo nuevo que todavía no llegó a tu hoja: con un id provisional que se cambia por el de verdad al subir. */
  function itemLocal(datos, ahora) { return Object.assign({}, datos, { id: LOCAL + GB.nuevoId(), rev: 0, creado: ahora, actualizado: ahora }); }
  function claveCola(x) { return x.tipo === "agencia" ? "agencia" : x.tipo === "cliente" ? "c|" + x.cliente.id : x.col + "|" + x.item.id; }
  /**
   * Agrega algo a la cola sin señal. Lo mismo dos veces (el mismo item, tu semana, el mismo cliente) queda con lo último.
   * Un cambio a algo que todavía no se creó en tu hoja se junta con su creación. Cada entrada lleva su sello (s) para no borrar una más nueva.
   */
  function encolarPendiente(cola, x, sello) {
    cola = (cola || []).slice();
    x = Object.assign({}, x, { s: sello || String(Date.now()) + Math.random().toString(36).slice(2, 6) });
    if (x.tipo === "item" && esLocal(x.item && x.item.id)) x.tipo = "crear";
    var k = claveCola(x), i = cola.findIndex(function (c) { return claveCola(c) === k; });
    if (i >= 0) cola[i] = x; else cola.push(x);
    return cola.slice(-60);
  }
  /** Al subir algo que se creó sin señal: lo que queda en la cola con su id provisional pasa a su id de verdad (y su rev). */
  function cambiarIdCola(cola, col, viejo, item) {
    return (cola || []).map(function (c) {
      if (c.tipo !== "crear" && c.tipo !== "item") return c;
      if (c.col !== col || c.item.id !== viejo) return c;
      return Object.assign({}, c, { tipo: "item", item: Object.assign({}, c.item, { id: item.id, rev: item.rev }) });
    });
  }
  /** Pone lo que espera en tu celular encima de lo que trajo tu hoja, para que no veas lo de antes mientras se sube. */
  function aplicarPendientes(datos, cola) {
    (cola || []).forEach(function (x) {
      if (x.tipo === "agencia") { datos.agencia = x.agencia; datos.agenciaRev = x.rev; return; }
      if (x.tipo === "cliente") {
        var c = (datos.clientes || []).find(function (y) { return y.id === x.cliente.id; });
        if (c) { c.proyecto = x.cliente.proyecto; c.estado = x.cliente.estado; c.rev = x.cliente.rev; }
        return;
      }
      var l = datos[x.col] = datos[x.col] || [], i = l.findIndex(function (y) { return y.id === x.item.id; });
      if (i >= 0) l[i] = x.item; else if (x.tipo === "crear") l.push(x.item);
    });
    return datos;
  }
  /** Lo que se manda a tu hoja para crearlo: sin el id provisional. */
  function sinIdLocal(it) { var o = Object.assign({}, it); delete o.id; delete o.rev; delete o.creado; delete o.actualizado; return o; }

  Object.assign(GB, {
    pasadas: pasadas, defPasada: defPasada, pasadasHechas: pasadasHechas, siguientePasada: siguientePasada, abiertoVideo: abierto, videosAbiertos: videosAbiertos,
    itemsPasadas: itemsPasadas, itemsMes: itemsMes, marcarMes: marcarMes, tuDiaCompleto: tuDiaCompleto,
    cargarObjetivos: cargarObjetivos, progresoObjetivo: progresoObjetivo, itemsObjetivos: itemsObjetivos, tareaObjetivo: tareaObjetivo,
    minutosFoco: minutosFoco, avisoReloj: avisoReloj, estimadoPasada: estimadoPasada, tamanoPedazo: tamanoPedazo, aprender: aprender, loQueSe: loQueSe, horaBuena: horaBuena,
    claveItem: claveItem, tipoTarea: tipoTarea, tamanoDe: tamanoDe, armarBloque: armarBloque, propuestaManana: propuestaManana, cosaPlan: cosaPlan, buscarEnDia: buscarEnDia,
    diezMinutos: diezMinutos, primerPaso: primerPaso,
    juntarFilas: juntarFilas, filaDe: filaDe, constancia: constancia, minHuecoDe: minHuecoDe, senalesSemana: senalesSemana, resumenSemana: resumenSemana, fraseSemana: fraseSemana, barraDia: barraDia, huecoPendiente: huecoPendiente,
    bandeja: bandeja, bandejaVencida: bandejaVencida, ideasDeTexto: ideasDeTexto,
    queEs: queEs, opcionesVe: opcionesVe, prepDeGuion: prepDeGuion, faltaLoQueSeVe: faltaLoQueSeVe, tipoDeTecnica: tipoDeTecnica,
    referencias: referencias, ultimaVez: ultimaVez,
    importarGanchos: importarGanchos, unirGanchos: unirGanchos, ganchosPara: ganchosPara, llenarMolde: llenarMolde,
    tomasDe: tomasDe, falto: falto, pedidoClaude: pedidoClaude, leerRespuesta: leerRespuesta, puedeOtraVersion: puedeOtraVersion,
    hhmm: hhmm, aHora: aHora,
    actualizarVistos: actualizarVistos, haceColor: haceColor, rojosLargos: rojosLargos, sumarUso: sumarUso, verUso: verUso, sinUso: sinUso,
    esLocal: esLocal, itemLocal: itemLocal, claveCola: claveCola, encolarPendiente: encolarPendiente, cambiarIdCola: cambiarIdCola, aplicarPendientes: aplicarPendientes, sinIdLocal: sinIdLocal
  });
  return GB;
});
