/**
 * Tu mesa de contenido, sin pantalla: los formatos y los ángulos (con lo que dicen tus números), tu calendario
 * (qué formato y qué ángulo toca cada día), en qué redes falta publicar, la descripción al toque, el pedido del cuerpo
 * para Claude y tus pasos («cómo lo resolví»).
 * Los textos y las varas salen de tu sistema (sistema.js → contenido y fabrica): se cambian ahí.
 * Solo lo carga tu panel (admin.html), después de areas.js. Las pruebas lo cargan con require.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear(require("./areas.js"), require("./sistema.js"));
  else crear(raiz.GB, raiz.SISTEMA);
})(this, function (GB, SIS) {
  "use strict";
  var CO = SIS.contenido, F = SIS.fabrica, sumarDias = GB.sumarDias;
  function entero(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function dia(s) { return String(s || "").slice(0, 10); }

  // ---------- lo que hay: formatos, ángulos, llamados y redes ----------
  /** Los formatos de tu sistema. para: "cuenta" o "cliente" (sin para, todos). */
  function formatos(para) { return F.formatos.filter(function (f) { return !para || !f.para || f.para === para; }); }
  function formatoDe(clave) { return F.formatos.find(function (f) { return f.clave === clave; }) || null; }
  /** Los ángulos: los de tu sistema (los 8 dolores para tu cuenta, los de producto para tus clientes) y los que agregaste tú. */
  function angulos(ag, para) {
    var propios = ((ag && ag.angulosPropios) || []).map(function (a) { return Object.assign({ propio: true }, a); });
    return CO.angulos.concat(propios).filter(function (a) { return !para || !a.para || a.para === para; });
  }
  function anguloDe(ag, clave) { return angulos(ag).find(function (a) { return a.clave === clave; }) || null; }
  /** Los llamados (CTA) que van con tu cuenta o con un cliente. */
  function ctas(para) { return CO.ctas.filter(function (c) { return !para || !c.para || c.para === para; }); }
  function ctaDe(clave) { return CO.ctas.find(function (c) { return c.clave === clave; }) || null; }
  /** El llamado que va con un ángulo (el regalo de su dolor); si no tiene, el primero de los suyos. */
  function ctaSugerido(ag, anguloClave, para) {
    var a = anguloDe(ag, anguloClave), c = a && a.regalo ? ctaDe(a.regalo) : null;
    return c || ctas(para)[0] || null;
  }
  function redValida(k) { return CO.redes.some(function (r) { return r.clave === k; }); }
  /** En qué redes va: lo de tu cuenta, en las tuyas; lo de un cliente, en las de su proyecto (TikTok si no dijiste otra). */
  function redesDe(cuenta, ag, proyecto) {
    var l = cuenta ? (ag && ag.redes && ag.redes.length ? ag.redes : CO.redesCuenta) : (proyecto && proyecto.redes && proyecto.redes.length ? proyecto.redes : CO.redesCliente);
    return l.filter(redValida);
  }
  function nombreRed(k) { var r = CO.redes.find(function (x) { return x.clave === k; }); return r ? r.nombre : k; }

  // ---------- las piezas: cada cosa que se publica ----------
  /**
   * Cada pieza que se publica, con su formato, su ángulo, su cuerpo, sus redes y sus números:
   * los videos de tus clientes (con su guion) y las 3 versiones de cada semana de tu cuenta (lunes, miércoles y viernes).
   * datos = { clientes, guiones, agencia }. Cada pieza: { ref, cuenta, para, quien, titulo, fecha, formato, angulo, cuerpo, redes, hechas, faltan, lista, publicada, n }.
   */
  function piezas(datos) {
    var out = [], guiones = datos.guiones || [], ag = datos.agencia || {};
    var guionDe = function (c, v) { return guiones.find(function (g) { return g.cliente === c && g.video === v; }) || null; };
    (datos.clientes || []).forEach(function (c) {
      if (c.estado === "terminado") return;
      var p = c.proyecto || {}, redes = redesDe(false, ag, p);
      (p.videos || []).forEach(function (v) {
        var g = guionDe(c.id, v.id), hechas = {}, vr = v.redes || {};
        redes.forEach(function (k) { if ((vr[k] && (vr[k].el || vr[k].link)) || (k === redes[0] && v.publicado)) hechas[k] = true; });
        var est = GB.estadoVideo(v, c.respuestas), publicada = v.estado === "publicado" || redes.some(function (k) { return hechas[k]; });
        out.push({ ref: { c: c.id, v: v.id }, cuenta: false, para: c.id, quien: p.negocio, titulo: v.titulo, fecha: v.fechaPub || "",
          formato: v.formato || (g && g.formato) || "", angulo: v.angulo || (g && g.angulo) || "", cuerpo: c.id + "|" + (v.cuerpo || v.id),
          redes: redes, hechas: hechas, faltan: redes.filter(function (k) { return !hechas[k]; }),
          lista: est === "aprobado" || v.estado === "aprobado" || v.estado === "publicado", publicada: publicada, n: v.n || {}, video: v, guion: g, cliente: c });
      });
    });
    var sems = ag.semanas || {}, redesC = redesDe(true, ag);
    Object.keys(sems).sort().forEach(function (wk) {
      var s = sems[wk], lun = GB.lunesDeSemana(wk), g = guiones.find(function (x) { return x.cliente === "agencia" && x.video === wk; }) || (s.guion ? guiones.find(function (x) { return x.id === s.guion; }) : null) || null;
      var plan = s.plan || {}, listo = entero(s.pasada) >= 4 && !!String(s.texto || "").trim();
      CO.diasCuenta.forEach(function (d, i) {
        var gv = (s.ganchos || [])[i] || null, hechas = {}, gr = (gv && gv.redes) || {};
        redesC.forEach(function (k) { if ((gr[k] && (gr[k].el || gr[k].link)) || (k === "tiktok" && gv && gv.link)) hechas[k] = true; });
        out.push({ ref: { c: "agencia", v: wk, g: gv ? gv.id : "", i: i }, cuenta: true, para: "agencia", quien: "Tu cuenta", titulo: (s.cuerpo || "El cuerpo de la semana") + " · versión " + (i + 1),
          fecha: sumarDias(lun, d), formato: (gv && gv.formato) || (g && g.formato) || plan.formato || "", angulo: (g && g.angulo) || plan.angulo || "", cuerpo: "agencia|" + wk,
          redes: redesC, hechas: hechas, faltan: redesC.filter(function (k) { return !hechas[k]; }), lista: listo || !!(gv && gv.link), publicada: redesC.some(function (k) { return hechas[k]; }),
          n: (gv && gv.numeros) || {}, semana: s, gancho: gv, guion: g });
      });
    });
    return out;
  }

  // ---------- publicar: cada red es una tarea ----------
  /**
   * Lo que falta publicar hoy o antes: cada pieza lista (aprobada, o tu semana terminada) cuya fecha llegó, y cada red que le falta.
   * De un cliente atrasado, naranja (tu promesa); de tu cuenta, amarillo el día y naranja después (tu contenido, nunca rojo).
   */
  function porPublicar(ps, hoy) {
    var out = [];
    ps.forEach(function (x) {
      if (!x.faltan.length || !x.lista) return;
      if (x.cuenta && x.ref.i > 0 && !x.gancho && x.fecha > hoy) return;
      if (x.fecha && x.fecha > hoy && !x.publicada) return;
      x.faltan.forEach(function (k) {
        var tarde = x.fecha && x.fecha < hoy, nivel = x.publicada ? 1 : tarde ? 2 : x.fecha === hoy ? (x.cuenta ? 1 : 2) : 1;
        out.push({ pieza: x, red: k, nivel: nivel, texto: "Publica «" + String(x.titulo).slice(0, 60) + "» en " + nombreRed(k), sub: x.quien + (x.fecha ? " · " + (x.fecha === hoy ? "hoy" : GB.cuando(x.fecha, hoy)) : "") });
      });
    });
    return out.sort(function (a, b) { return b.nivel - a.nivel; });
  }
  /** Lo que va en tu día (Hoy): una cosa por pieza (la red que falta primero), para no llenarte de filas. */
  function itemsPublicar(ps, hoy) {
    var vistos = {}, out = [];
    porPublicar(ps, hoy).forEach(function (t) {
      var k = t.pieza.ref.c + ":" + t.pieza.ref.v + ":" + (t.pieza.ref.g || t.pieza.ref.i || "");
      if (vistos[k]) return; vistos[k] = true;
      out.push({ grupo: "contenido", nivel: t.nivel, texto: t.texto + (t.pieza.faltan.length > 1 ? " (y " + (t.pieza.faltan.length - 1) + " más)" : ""), sub: t.sub,
        publicar: { c: t.pieza.ref.c, v: t.pieza.ref.v, g: t.pieza.ref.g || "", i: t.pieza.ref.i, red: t.red } });
    });
    return out;
  }

  // ---------- qué funciona: ángulos, formatos y cuerpos con tus números ----------
  /** Lo que trae una pieza por cada 1.000 vistas: guardados y seguidores cuentan poco, los que te escriben más, una venta (cupón o llegada) lo que más. */
  function traePor1000(n) {
    var v = entero(n.vistas); if (!v) return 0;
    var valor = entero(n.guardados) + entero(n.seguidores) + 3 * entero(n.escriben) + 5 * Math.max(entero(n.cupones), entero(n.llegaron));
    return Math.round(valor / v * 1000 * 10) / 10;
  }
  function conNumeros(x) { return entero(x.n && x.n.vistas) > 0; }
  /** Junta por ángulo, por formato y por cuerpo: cuántas veces se usó, cuántas tienen números, sus vistas, su % a los 3 segundos y lo que trae. */
  function statsContenido(ps) {
    var vacio = function (clave) { return { clave: clave, usos: 0, conNumeros: 0, vistas: 0, r3s: [], trae: [], escriben: 0, ventas: 0 }; };
    var por = function (mapa, clave, x) {
      if (!clave) return;
      var s = mapa[clave] || (mapa[clave] = vacio(clave));
      s.usos++;
      if (!conNumeros(x)) return;
      s.conNumeros++; s.vistas += entero(x.n.vistas); s.escriben += entero(x.n.escriben); s.ventas += Math.max(entero(x.n.cupones), entero(x.n.llegaron));
      if (x.n.r3 != null && x.n.r3 !== "") s.r3s.push(entero(x.n.r3));
      s.trae.push(traePor1000(x.n));
    };
    var A = {}, Fm = {}, C = {};
    ps.forEach(function (x) {
      if (!x.publicada && !conNumeros(x)) return;
      por(A, x.angulo, x); por(Fm, x.formato, x); por(C, x.cuerpo, x);
      if (C[x.cuerpo]) (C[x.cuerpo].piezas = C[x.cuerpo].piezas || []).push(x);
    });
    var cerrar = function (s) {
      var prom = function (l) { return l.length ? Math.round(l.reduce(function (a, b) { return a + b; }, 0) / l.length * 10) / 10 : null; };
      s.r3 = prom(s.r3s); s.puntaje = prom(s.trae); delete s.r3s; delete s.trae; return s;
    };
    var lista = function (m) { return Object.keys(m).map(function (k) { return cerrar(m[k]); }); };
    return { angulos: lista(A), formatos: lista(Fm), cuerpos: lista(C).filter(function (c) { return (c.piezas || []).length > 1; }) };
  }
  /**
   * El veredicto de un ángulo o un formato: «usar» si trae más que la mitad de los demás que ya se pueden juzgar, «descartar» si trae menos
   * de la mitad de eso, «probando» con menos de 3 videos con números. Lo que marcaste tú manda.
   */
  function veredictos(stats, manual) {
    manual = manual || {};
    var juzgables = stats.filter(function (s) { return s.conNumeros >= CO.minVideos && s.puntaje != null; }).map(function (s) { return s.puntaje; }).sort(function (a, b) { return a - b; });
    var med = juzgables.length ? juzgables[Math.floor(juzgables.length / 2)] : null, out = {};
    stats.forEach(function (s) {
      var v = s.conNumeros < CO.minVideos || med == null ? "probando" : s.puntaje >= med ? "usar" : s.puntaje < med / 2 ? "descartar" : "regular";
      out[s.clave] = { calc: v, estado: manual[s.clave] || v, manual: !!manual[s.clave], faltan: Math.max(0, CO.minVideos - s.conNumeros) };
    });
    return out;
  }
  var TEXTO_V = { usar: "Úsalo más", regular: "Sirve", descartar: "Descártalo", probando: "Sigue probando" };
  /** La tabla de «qué funciona» para ángulos o formatos, con todos los de tu sistema (también los que nunca usaste). */
  function tablaFunciona(tipo, ps, ag, para) {
    var st = statsContenido(ps), base = tipo === "angulos" ? angulos(ag, para) : formatos(para), mapa = {}, manual = (ag && ag[tipo === "angulos" ? "angulosEstado" : "formatosEstado"]) || {};
    st[tipo].forEach(function (s) { mapa[s.clave] = s; });
    var filas = base.map(function (b) { return Object.assign({ usos: 0, conNumeros: 0, vistas: 0, escriben: 0, ventas: 0, r3: null, puntaje: null }, mapa[b.clave] || {}, { clave: b.clave, nombre: b.nombre }); });
    var ver = veredictos(filas, manual);
    filas.forEach(function (f) { f.veredicto = ver[f.clave]; f.textoVeredicto = TEXTO_V[ver[f.clave].estado] || ""; });
    return filas.sort(function (a, b) { return (b.puntaje || -1) - (a.puntaje || -1) || b.usos - a.usos; });
  }

  // ---------- tu calendario: qué formato y qué ángulo toca cada semana ----------
  /**
   * Elige el siguiente de una lista (ángulos o formatos): lo que se puede usar (sin los que descartaste), primero lo que más trae;
   * una de cada 3 semanas, lo que todavía se está probando (el de menos usos). No repite el de la semana anterior si hay otro.
   */
  function elegir(lista, ver, usos, ultimo, explorar) {
    var vivos = lista.filter(function (x) { var v = ver[x.clave]; return !(v && v.estado === "descartar"); });
    if (!vivos.length) vivos = lista.slice();
    var sinRepetir = vivos.filter(function (x) { return x.clave !== ultimo; });
    if (sinRepetir.length) vivos = sinRepetir;
    var probando = vivos.filter(function (x) { return !ver[x.clave] || ver[x.clave].estado === "probando"; });
    var buenos = vivos.filter(function (x) { return ver[x.clave] && ver[x.clave].estado === "usar"; });
    var pool = (explorar || !buenos.length) && probando.length ? probando : buenos.length ? buenos : vivos;
    return pool.slice().sort(function (a, b) { return (usos[a.clave] || 0) - (usos[b.clave] || 0) || (b.puntaje || 0) - (a.puntaje || 0); })[0] || null;
  }
  /**
   * Tus próximas semanas (desde la de hoy): lo que planeaste o, si no planeaste, lo sugerido con tus números.
   * Cada una: { wk, lunes, dias: [3 fechas], formato, angulo, sugerido (true si no lo aceptaste), cuerpo, guion }.
   */
  function planSemanas(datos, hoy, cuantas) {
    var ag = datos.agencia || {}, sems = ag.semanas || {}, ps = piezas(datos);
    // Lo suelto (un formato improvisado, o lo que va fuera de tus ángulos) no se sugiere: no tiene pasos que repetir
    var fa = tablaFunciona("formatos", ps, ag, "cuenta").filter(function (x) { var fo = formatoDe(x.clave); return !(fo && fo.suelto); }), an = tablaFunciona("angulos", ps, ag, "cuenta").filter(function (x) { return x.clave !== "suelta"; });
    var verA = {}, verF = {}, usosA = {}, usosF = {};
    an.forEach(function (x) { verA[x.clave] = x.veredicto; usosA[x.clave] = x.usos; });
    fa.forEach(function (x) { verF[x.clave] = x.veredicto; usosF[x.clave] = x.usos; });
    var wk0 = GB.semanaISO(hoy), antes = sems[GB.semanaISO(sumarDias(hoy, -7))] || {}, ultA = (antes.plan || {}).angulo || "", ultF = (antes.plan || {}).formato || "", out = [];
    var gDe = function (wk) { return (datos.guiones || []).find(function (x) { return x.cliente === "agencia" && x.video === wk; }) || null; };
    for (var i = 0; i < (cuantas || CO.semanasPlan); i++) {
      var lun = sumarDias(GB.lunesDe(hoy), i * 7), wk = GB.semanaISO(lun), s = sems[wk] || {}, plan = s.plan || {}, g = gDe(wk);
      var aG = (g && g.angulo) || plan.angulo, fG = (g && g.formato) || plan.formato;
      var a = aG ? anguloDe(ag, aG) : elegir(an, verA, usosA, ultA, i % 3 === 2);
      var f = fG ? formatoDe(fG) : elegir(fa, verF, usosF, ultF, i % 3 === 1);
      if (a) usosA[a.clave] = (usosA[a.clave] || 0) + 1;
      if (f) usosF[f.clave] = (usosF[f.clave] || 0) + 1;
      out.push({ wk: wk, lunes: lun, dias: CO.diasCuenta.map(function (d) { return sumarDias(lun, d); }), angulo: a ? a.clave : "", formato: f ? f.clave : "",
        sugerido: !(aG && fG), cuerpo: s.cuerpo || "", hoy: wk === wk0, semana: s, guion: g });
      ultA = a ? a.clave : ultA; ultF = f ? f.clave : ultF;
    }
    return out;
  }
  /** El calendario de las próximas semanas, día por día: tus 3 versiones de cada semana y los videos de tus clientes con su fecha. */
  function calendarioMesa(datos, hoy, cuantas) {
    var plan = planSemanas(datos, hoy, cuantas), ps = piezas(datos), dias = [], fin = sumarDias(GB.lunesDe(hoy), 7 * (cuantas || CO.semanasPlan));
    var porFecha = {};
    ps.forEach(function (x) { if (!x.cuenta && x.fecha) (porFecha[x.fecha] = porFecha[x.fecha] || []).push(x); });
    plan.forEach(function (w) {
      w.dias.forEach(function (f, i) {
        var pz = ps.find(function (x) { return x.cuenta && x.ref.v === w.wk && x.ref.i === i; });
        (porFecha[f] = porFecha[f] || []).push(pz || { ref: { c: "agencia", v: w.wk, i: i }, cuenta: true, para: "agencia", quien: "Tu cuenta", titulo: (w.cuerpo || "El cuerpo de la semana") + " · versión " + (i + 1),
          fecha: f, formato: w.formato, angulo: w.angulo, redes: redesDe(true, datos.agencia), hechas: {}, faltan: redesDe(true, datos.agencia), lista: false, publicada: false, n: {}, plan: true });
      });
    });
    for (var f = GB.lunesDe(hoy); f < fin; f = sumarDias(f, 1)) dias.push({ fecha: f, piezas: porFecha[f] || [] });
    return { semanas: plan, dias: dias };
  }
  /** El estado de una pieza en una palabra, para el calendario. */
  function estadoPieza(x, hoy) {
    if (x.publicada && !x.faltan.length) return { clave: "publicada", texto: "Publicada" };
    if (x.publicada) return { clave: "faltan", texto: "Falta en " + x.faltan.map(nombreRed).join(" y ") };
    if (x.lista) return { clave: "lista", texto: x.fecha && x.fecha < hoy ? "Lista y atrasada: publícala" : "Lista para publicar" };
    if (x.cuenta) {
      var s = x.semana || {}, g = x.guion;
      if (!GB.tieneGuion(g)) return { clave: "guion", texto: "Falta el guion" };
      if (!s.grabado && entero(s.pasada) < 1) return { clave: "grabar", texto: "Falta grabar" };
      if (entero(s.pasada) < 4) return { clave: "editar", texto: "En edición" };
      return { clave: "texto", texto: "Falta su descripción" };
    }
    var v = x.video || {};
    if (v.estado === "guion") return { clave: GB.tieneGuion(x.guion) ? "grabar" : "guion", texto: GB.tieneGuion(x.guion) ? "Falta grabar" : "Falta el guion" };
    if (v.estado === "grabado" || v.estado === "edicion") return { clave: "editar", texto: "En edición" };
    return { clave: "ok", texto: "Esperando su ok" };
  }

  // ---------- la descripción al toque y el pedido del cuerpo ----------
  function limpiar(s) { return String(s || "").replace(/[«»"]/g, "").replace(/\s+/g, " ").trim(); }
  function primeraFrase(s) { var t = limpiar(s), m = t.match(/^(.{20,160}?[.!?])(\s|$)/); return m ? m[1] : t.slice(0, 140); }
  function etiquetas(o) {
    var base = (o.cuenta ? CO.etiquetas.cuenta : CO.etiquetas.cliente).slice(), extra = [o.rubro, o.producto].map(function (w) {
      var s = String(w || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "").trim().split(/\s+/).slice(0, 2).join("");
      return s ? "#" + s : "";
    }).filter(Boolean);
    return base.concat(extra).filter(function (x, i, l) { return l.indexOf(x) === i; }).slice(0, 6).join(" ");
  }
  /**
   * La descripción al toque: 3 versiones con tu gancho, la primera frase de tu cuerpo y tu llamado, con sus etiquetas. Sin emojis.
   * o = { gancho, cuerpo (texto o filas), cta, angulo (su frase), rubro, producto, cuenta }.
   */
  function descripcionRapida(o) {
    o = o || {};
    var cuerpo = Array.isArray(o.cuerpo) ? o.cuerpo.map(function (f) { return f.dice; }).filter(Boolean).join(" ") : o.cuerpo;
    var gan = limpiar(o.gancho), frase = primeraFrase(cuerpo), cta = limpiar(o.cta), dolor = limpiar(o.angulo), tags = etiquetas(o);
    var v = [];
    if (gan || frase) v.push([gan, frase && frase !== gan ? frase : "", cta].filter(Boolean).join("\n") + "\n\n" + tags);
    if (dolor) v.push([dolor + (/[.?!]$/.test(dolor) ? "" : "."), o.cuenta ? "Esto es lo que hago con las tiendas que trabajo." : frase, cta].filter(Boolean).join("\n") + "\n\n" + tags);
    v.push([gan || frase || dolor, cta].filter(Boolean).join("\n") + "\n\n" + tags);
    return v.filter(function (x, i, l) { return limpiar(x) && l.indexOf(x) === i; }).slice(0, 3);
  }
  /**
   * El pedido para que Claude te escriba el cuerpo con tu estrategia: una característica con su momento, lo que gana y su sueño.
   * o = { cuenta, negocio, rubro, producto, formato, angulo, gancho, cta }.
   */
  function pedidoCuerpo(o) {
    o = o || {};
    var l = [];
    l.push("Escríbeme el cuerpo de un video" + (o.cuenta ? " de mi cuenta, Grow Business (le hablo a dueños de tiendas de La Paz)." : " para " + (o.negocio || "una tienda de La Paz") + (o.rubro ? " (" + o.rubro + ")" : "") + "."));
    if (o.producto) l.push("El producto: " + o.producto + ".");
    if (o.formato) l.push("El formato: " + o.formato + ".");
    if (o.angulo) l.push("El ángulo (el dolor que toca): " + o.angulo + ".");
    if (o.gancho) l.push("El gancho ya está: «" + limpiar(o.gancho) + "». No lo repitas.");
    l.push("");
    l.push("Mi estrategia: la característica es la prueba de que llega a su sueño. Elige UNA característica y escríbela como una escalera:");
    l.push("- el momento (cuándo le pasa, con sus palabras);");
    l.push("- la característica (qué tiene o qué hago);");
    l.push("- lo que gana (qué cambia para él ese día);");
    l.push("- quién lo nota (su cliente, su familia, su competencia).");
    l.push("Después, la prueba (algo real que se pueda mostrar) y lo malo con su «pero».");
    if (o.cta) l.push("Termina antes del llamado; el llamado ya está: «" + limpiar(o.cta) + "».");
    l.push("");
    l.push("Reglas: frases cortas, palabras de La Paz, de tú, nada de palabras de agencia, sin emojis. Que se pueda decir a cámara en 30 a 45 segundos.");
    l.push("Dámelo en filas: lo que se dice | lo que se ve (una toma por fila).");
    return l.join("\n");
  }

  // ---------- tus pasos: cómo resolviste algo, para la próxima vez ----------
  /** La clave de «cómo lo hago» de algo de tu día (una por tipo de tarea, no por cliente: los pasos sirven para todos). */
  function claveProceso(x, g) {
    if (!x) return "";
    if (x.contenido) return "contenido-" + x.contenido;
    if (x.publicar) return "publicar-" + x.publicar.red;
    if (x.pasada) return "pasada-" + x.pasada.n;
    if (x.agencia) return "agencia-" + x.agencia;
    if (x.prospecto) return "etapa-" + ((x.guia && x.guia.etapa) || (g && g.etapa) || "prospecto");
    if (x.cliente) return "cliente-" + ((g && g.clave) || (x.guia && x.guia.accion) || "paso");
    return "";
  }
  function procesoDe(lista, clave) { return (lista || []).find(function (p) { return p.clave === clave; }) || null; }
  /** Tus pasos escritos uno por línea (sin vacíos), como mucho 25. */
  function pasosDeTexto(t) { return String(t || "").split(/\r?\n/).map(function (s) { return s.replace(/^\s*(\d+[.)-]|[-•·])\s*/, "").trim(); }).filter(Boolean).slice(0, 25); }

  // ---------- tu estudio de contenido (v9): el guion por pasos, el calendario del mes y el plan que te arma Claude ----------
  /** Lo que ya tiene un guion, paso por paso: el gancho, el cuerpo, el llamado, lo creativo (la pasada 0) y la grabación. */
  function progresoGuion(g, v) {
    g = g || {}; v = v || {};
    var filas = g.filas || [], ve = filas.filter(function (x) { return x.ve; }).length;
    var p = {
      gancho: !!String((g.gancho && (g.gancho.texto || g.gancho.familia)) || "").trim(),
      cuerpo: filas.length > 0 || !!String(g.cuerpo || "").trim(),
      llamado: !!((g.cta && (g.cta.texto || g.cta.tipo))),
      creativo: !!v.prep,
      grabado: !!v.grabado || ["grabado", "edicion", "aprobar", "aprobado", "publicado"].indexOf(v.estado) >= 0 || entero(v.pasada) > 0,
      grabadas: filas.filter(function (x) { return x.grabada; }).length, frases: filas.length, conVe: ve
    };
    p.hechos = ["gancho", "cuerpo", "llamado", "creativo", "grabado"].filter(function (k) { return p[k]; }).length;
    return p;
  }
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  /** El mes «2026-11» que viene antes o después. */
  function mesMas(mes, n) { var a = +mes.slice(0, 4), m = +mes.slice(5, 7) - 1 + n; a += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return a + "-" + GB.pad(m + 1); }
  /**
   * El calendario de un mes («2026-11»), de lunes a domingo: lo de tu cuenta (tus 3 versiones de cada semana, o lo planeado o sugerido) y lo de tus clientes en su día.
   * Cada día: { fecha, delMes, hoy, items: [{ cuenta, quien, titulo, angulo, estado, ref, plan, sugerido }] }.
   */
  function mesCalendario(datos, mes, hoy) {
    var ini = mes + "-01", fin = mesMas(mes, 1) + "-01", desde = GB.lunesDe(ini), ps = piezas(datos), porFecha = {}, ag = datos.agencia || {};
    var w0 = GB.lunesDe(hoy), semanas = Math.max(1, Math.ceil(GB.diasEntre(w0, fin) / 7) + 1);
    var plan = GB.diasEntre(w0, fin) > 0 ? planSemanas(datos, hoy, Math.min(12, semanas)) : [];
    var push = function (x) { if (x.fecha) (porFecha[x.fecha] = porFecha[x.fecha] || []).push(x); };
    ps.forEach(function (x) {
      push({ cuenta: x.cuenta, quien: x.quien, titulo: x.cuenta ? "Versión " + (x.ref.i + 1) + (x.semana && x.semana.cuerpo ? " · " + x.semana.cuerpo : "") : x.titulo, fecha: x.fecha, angulo: x.angulo, estado: estadoPieza(x, hoy), ref: x.ref, plan: false, sugerido: false });
    });
    plan.forEach(function (w) {
      var tiene = ps.some(function (x) { return x.cuenta && x.ref.v === w.wk; });
      if (tiene) return;
      w.dias.forEach(function (fch, i) { push({ cuenta: true, quien: "Tu cuenta", titulo: "Versión " + (i + 1) + (w.cuerpo ? " · " + w.cuerpo : ""), fecha: fch, angulo: w.angulo, estado: { clave: "plan", texto: w.sugerido ? "Sugerido" : "Planeado" }, ref: { c: "agencia", v: w.wk, i: i }, plan: true, sugerido: w.sugerido }); });
    });
    var filas = [];
    for (var d = desde; d < fin || filas.length && filas[filas.length - 1].length < 7; d = sumarDias(d, 1)) {
      if (!filas.length || filas[filas.length - 1].length === 7) filas.push([]);
      filas[filas.length - 1].push({ fecha: d, delMes: d >= ini && d < fin, hoy: d === hoy, items: (porFecha[d] || []).sort(function (a, b) { return (a.cuenta ? 0 : 1) - (b.cuenta ? 0 : 1); }) });
    }
    return { mes: mes, titulo: MESES[+mes.slice(5, 7) - 1] + " " + mes.slice(0, 4), semanas: filas };
  }
  /** El pedido para que Claude te arme el calendario de tu cuenta: un cuerpo por semana, con su ángulo, sin repetir dos seguidas. */
  function pedidoCalendario(ag, hoy, semanas) {
    var n = semanas || 4, lunes = [], ps = piezas({ agencia: ag || {}, clientes: [], guiones: [] }), an = tablaFunciona("angulos", ps, ag || {}, "cuenta").filter(function (x) { return x.clave !== "suelta"; });
    for (var i = 0; i < n; i++) lunes.push(sumarDias(GB.lunesDe(hoy), 7 * i));
    return ["Arma el calendario de contenido de mi cuenta (Grow Business: le hablo a dueños de tienda de La Paz que invierten) para las próximas " + n + " semanas.",
      "Cada semana es UN cuerpo (una idea) que publico en 3 versiones, con 3 ganchos distintos: lunes, miércoles y viernes.",
      "Elige el ángulo de cada semana de esta lista (usa su clave). No repitas el mismo dos semanas seguidas, y cada 3 semanas prueba uno que todavía no usé.",
      "Usa mis documentos: la ficha 24 (el mapa de dolores y regalos) y el estudio de dolores y ángulos del dueño.", "",
      "Mis ángulos (clave · el dolor · cómo me va):"].concat(an.map(function (x) { return "- " + x.clave + " · " + x.nombre + " · " + (x.textoVeredicto || "sin probar"); }))
      .concat(["", "Los lunes son: " + lunes.join(", ") + ".", "", "Respóndeme SOLO con una línea por semana, así, sin nada más:", "AAAA-MM-DD | clave del ángulo | la idea del cuerpo en una frase corta"]).join("\n");
  }
  /** Lee lo que te respondió Claude: una línea por semana «fecha | ángulo | idea». Acepta 2026-11-02 o 02/11/2026, la clave o el nombre del ángulo, y tablas. */
  function leerCalendario(texto, ag) {
    var lista = angulos(ag, "cuenta"), out = [];
    String(texto || "").split(/\r?\n/).forEach(function (l) {
      var p = l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (x) { return x.replace(/\*\*/g, "").trim(); });
      if (p.length < 3) return;
      var f = "", m1 = p[0].match(/(\d{4})-(\d{2})-(\d{2})/), m2 = p[0].match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
      if (m1) f = m1[1] + "-" + m1[2] + "-" + m1[3];
      else if (m2) { var an = m2[3] ? (m2[3].length === 2 ? "20" + m2[3] : m2[3]) : String(new Date().getFullYear()); f = an + "-" + GB.pad(+m2[2]) + "-" + GB.pad(+m2[1]); }
      if (!f || isNaN(GB.fechaDe(f).getTime())) return;
      var t = p[1].toLowerCase(), a = lista.find(function (x) { return x.clave.toLowerCase() === t; }) || lista.find(function (x) { return t.length > 3 && (x.nombre.toLowerCase().indexOf(t) >= 0 || t.indexOf(x.nombre.toLowerCase()) >= 0); });
      var lun = GB.lunesDe(f);
      out.push({ wk: GB.semanaISO(lun), lunes: lun, angulo: a ? a.clave : "", anguloNombre: a ? a.nombre : p[1], idea: p.slice(2).join(" · ").slice(0, 80), ok: !!a });
    });
    var visto = {};
    return out.filter(function (x) { if (visto[x.wk]) return false; visto[x.wk] = true; return true; });
  }

  // ---------- las piezas de tu cuenta y su prueba de pauta (v11) ----------
  /** En qué va una pieza: guion → grabar → editar → descripción → subir → publicada. Un carrusel no se graba: su edición es lo creativo. */
  function etapaPieza(pz, g) {
    var f = formatoDe(pz.formato), carrusel = !!(f && f.tipo === "carrusel"), pg = progresoGuion(g, pz);
    if (pz.publicadaEl || pz.link) return "publicada";
    if (carrusel ? !!pz.prep : entero(pz.pasada) >= 4) return String(pz.texto || "").trim() ? "subir" : "descripcion";
    if (carrusel ? pg.gancho && pg.cuerpo : pg.grabado) return "editar";
    if (pg.gancho && pg.cuerpo) return "grabar";
    return "guion";
  }
  var ETAPAS_PZ = { guion: "Su guion", grabar: "Por grabar", editar: "En edición", descripcion: "Falta su descripción", subir: "Lista para subir", publicada: "Publicada" };
  function nombreEtapaPieza(et) { return ETAPAS_PZ[et] || et; }
  /** Ya está terminada (editada): su tarea de tu objetivo se marca sola. */
  function piezaTerminada(et) { return ["descripcion", "subir", "publicada"].indexOf(et) >= 0; }
  function finPrueba(pz) { var P = CO.pautaPrueba || {}; return pz.lanzadaEl ? sumarDias(pz.lanzadaEl, P.dias || 3) : ""; }
  /**
   * Lo que te pide tu día de cada pieza: «pasaron sus 3 días: anota y decide», «terminó su pauta» y «está lista: lánzala».
   * guiones: para saber si la pieza ya está editada.
   */
  function itemsPiezas(piezas, guiones, hoy) {
    var out = [];
    (piezas || []).forEach(function (pz) {
      var g = (guiones || []).find(function (x) { return x.cliente === "pieza" && x.video === pz.id; }) || null, et = etapaPieza(pz, g), pr = pz.prueba || {}, base = { grupo: "contenido", piezaRef: pz.id, guia: { pieza: true } };
      if (pr.estado === "corriendo" && pz.lanzadaEl) {
        var fin = finPrueba(pz);
        if (hoy >= fin) out.push(Object.assign({ nivel: hoy > fin ? 3 : 2, prueba: true, texto: "«" + pz.titulo + "»: pasaron sus " + (CO.pautaPrueba.dias || 3) + " días de prueba. Anota sus números y decide", sub: "Tu pieza · su pauta en " + CO.pautaPrueba.plataforma }, base));
      } else if (pr.estado === "sigue" && pr.hasta && hoy >= pr.hasta) {
        out.push(Object.assign({ nivel: hoy > pr.hasta ? 3 : 2, prueba: true, texto: "«" + pz.titulo + "»: terminó su pauta. Anota cómo le fue", sub: "Tu pieza · la seguiste hasta el " + GB.diaCorto(pr.hasta) }, base));
      } else if (et === "subir" && !pz.lanzadaEl) {
        out.push(Object.assign({ nivel: 1, prueba: true, texto: "«" + pz.titulo + "» está lista: publícala y lanza su prueba de " + (CO.pautaPrueba.dias || 3) + " días", sub: "Tu pieza · lista para subir" }, base));
      }
    });
    return out;
  }
  /**
   * Una sugerencia (no una orden) para decidir a los 3 días, con lo que se puede medir con tan poca plata:
   * si alguien llegó a tu página, vio tu VSL o te escribió, se movió; si retiene (60% a los 3 s) pero nadie toca, falla el llamado; si no retiene, el gancho.
   */
  function sugerenciaPrueba(n) {
    n = n || {}; var vara = (F.varaR3 || 60);
    if (!n.vistas && !n.r3 && !n.clics) return { clave: "faltan", texto: "Anota sus números y te digo qué veo." };
    if ((n.vsl || 0) > 0 || (n.escriben || 0) > 0 || (n.seguidores || 0) >= 5) return { clave: "sigue", texto: "Se movió: hay gente que llegó a tu página, vio tu VSL o te escribió. Dale más y hasta 7 días." };
    if ((n.clics || 0) > 0) return { clave: "mira", texto: "Hubo clics pero nadie vio tu VSL: revisa que la página cargue rápido y que lo primero que vean sea el video." };
    if ((n.r3 || 0) >= vara) return { clave: "llamado", texto: "Retiene (" + n.r3 + "% a los 3 s) pero nadie toca: el video sirve, falla el llamado o la oferta. Prueba otro llamado antes de apagarla." };
    if ((n.vistas || 0) >= 1000) return { clave: "apaga", texto: "No retiene (" + (n.r3 || 0) + "% a los 3 s, la vara es " + vara + "%): apágala y prueba otro gancho con el mismo cuerpo." };
    return { clave: "poco", texto: "Todavía tiene pocas vistas para decir algo: mira si la pauta de verdad corrió." };
  }

  // ---------- tu estudio inteligente (v12): una sola ida y vuelta con Claude, tu guion pegado, el tablero y tu ritmo ----------
  /** Lo que pide cada formato en el pedido a Claude: qué tiene que devolver. */
  var PIDE_FORMATO = {
    base: "Es un REEL BASE: yo leo el guion a cámara en mi cuarto, y los motion graphics van en el 35% de la pantalla. En cada FRASE, «lo que se ve» es el motion graphic que acompaña esa frase (qué se anima, en pocas palabras), y el tipo es motion.",
    ia: "Es un REEL CON GANCHO DE IA: el gancho lo grabo en la calle y en Higgsfield le sumo lo que lo hace llamativo. Agrega una línea GANCHO_IA con el prompt para Higgsfield (qué se transforma o aparece en los primeros 2 o 3 segundos). Las FRASES van a cámara, con su motion o su toma.",
    carrusel: "Es un CARRUSEL BASE (fondo blanco, el que hace la IA). En vez de FRASE, una línea LAMINA por lámina: el texto de la lámina | el prompt de su imagen (si lleva). Máximo 8 láminas, la primera es el gancho y la última el llamado.",
    contraste: "Es un CARRUSEL DE CONTRASTE: en cada lámina, arriba lo correcto (lo que hago yo como experto) y abajo lo que hace todo el mundo. Cuenta una historia: cada lámina en un escenario distinto de la situación, y yo soy el avatar en las dos mitades. Una línea LAMINA por lámina: arriba (lo correcto) | abajo (lo que hace todo el mundo) | el prompt para Nano Banana del escenario (vertical, yo de avatar arriba y abajo). Máximo 8 láminas.",
    improvisado: "Es un video IMPROVISADO, con mucha edición. Dame las FRASES con lo que se ve en cada una (motion o clip)."
  };
  /**
   * El pedido único para Claude: con el ángulo (su dolor y su regalo), el formato, la campaña y lo que ya escribiste.
   * Pide una respuesta con etiquetas fijas (TITULO, GANCHO, FRASE, LAMINA, LLAMADO, DESCRIPCION, GANCHO_IA) para que el panel la lea entera de una vez.
   */
  function pedidoTodo(o) {
    var f = o.formato ? formatoDe(o.formato) : null, a = o.angulo, camp = (CO.descCampana || []).find(function (x) { return x.clave === o.campana; });
    var carr = f && f.tipo === "carrusel";
    var l = ["Arma esta pieza de mi cuenta de TikTok (Grow Business: le hablo a dueños de tienda de La Paz que invierten). Usa mis documentos: mi forma de hacer guiones, mi promesa y mis características, y el mapa de dolores y regalos.", ""];
    l.push("La pieza: " + (o.titulo || "sin nombre"));
    if (a) l.push("El dolor que toca: " + a.nombre + (a.regalo ? " · el regalo con que cierra: " + a.regalo : ""));
    l.push("El formato: " + (f ? f.nombre + ". " + (PIDE_FORMATO[f.clave] || f.que) : "elige tú entre reel base y carrusel base, el que mejor cuente esta idea, y dime cuál en la línea FORMATO."));
    if (camp) l.push("La campaña: " + camp.nombre + ". La descripción va para eso.");
    if (o.gancho) l.push("El gancho que ya tengo (mejóralo solo si hace falta): " + o.gancho);
    if (o.cuerpo) l.push("Lo que ya tengo escrito:\n" + o.cuerpo);
    if (o.transcripcion) l.push("La transcripción del video ya grabado (respeta lo que digo):\n" + o.transcripcion);
    l.push("", "Respóndeme SOLO así, una cosa por línea, sin nada más:");
    l.push("TITULO: el nombre corto de la pieza");
    if (!f) l.push("FORMATO: base o carrusel");
    l.push("GANCHO: lo que se dice o se lee en los primeros 3 segundos");
    if (f && f.clave === "ia") l.push("GANCHO_IA: el prompt para Higgsfield");
    if (carr) l.push(f.clave === "contraste" ? "LAMINA: arriba | abajo | prompt (una línea por lámina)" : "LAMINA: texto | prompt (una línea por lámina)");
    else l.push("FRASE: lo que digo | lo que se ve | tipo (motion, toma, ia, texto) | prompt si es imagen (una línea por frase, en el orden del video)");
    l.push("LLAMADO: lo que pido al final" + (a && a.regalo ? " (el regalo " + a.regalo + ")" : ""));
    l.push("DESCRIPCION: la descripción para " + (camp ? camp.nombre.toLowerCase() : "publicar") + ", en un solo párrafo, sin emojis, con 3 a 5 etiquetas al final");
    return l.join("\n");
  }
  var TIPOS_OK = ["toma", "ia", "animar", "motion", "texto", "comodin"];
  function tipoDe(t) { t = String(t || "").toLowerCase().replace(/[^a-zóá ]/g, "").trim(); if (TIPOS_OK.indexOf(t) >= 0) return t; if (/anim/.test(t)) return "animar"; if (/imag|ia|nano|higgs/.test(t)) return "ia"; if (/motion|graf/.test(t)) return "motion"; if (/texto/.test(t)) return "texto"; return "toma"; }
  /**
   * Lee la respuesta de Claude entera: las etiquetas pueden venir en negrita, con viñetas o en tabla, y la DESCRIPCION puede ocupar varias líneas.
   * Devuelve { titulo, formato, gancho, ganchoIA, filas, llamado, descripcion } con lo que encontró.
   */
  function leerTodo(texto) {
    var r = { titulo: "", formato: "", gancho: "", ganchoIA: "", filas: [], llamado: "", descripcion: "" }, ultima = "";
    String(texto || "").replace(/\r/g, "").split("\n").forEach(function (lin) {
      var s = lin.replace(/\*\*/g, "").replace(/^\s*[-•*>]\s*/, "").replace(/^\s*\d+[.)]\s*/, "").trim();
      var m = s.match(/^(TITULO|TÍTULO|FORMATO|GANCHO_IA|GANCHO IA|GANCHO|FRASE|LAMINA|LÁMINA|LLAMADO|CTA|DESCRIPCION|DESCRIPCIÓN)\s*\d*\s*[:：-]\s*(.*)$/i);
      if (!m) { if (ultima === "descripcion" && s) r.descripcion += (r.descripcion ? "\n" : "") + s; else if (ultima === "llamado" && s && !/\|/.test(s)) r.llamado += " " + s; return; }
      var et = m[1].toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(" ", "_"), v = m[2].trim(), p = v.split("|").map(function (x) { return x.trim(); });
      ultima = "";
      if (et === "TITULO") r.titulo = v.slice(0, 120);
      else if (et === "FORMATO") { var fv = v.toLowerCase(); r.formato = /contraste/.test(fv) ? "contraste" : /carrusel/.test(fv) ? "carrusel" : /ia|higgs/.test(fv) ? "ia" : /base|reel/.test(fv) ? "base" : ""; }
      else if (et === "GANCHO_IA") r.ganchoIA = v.slice(0, 600);
      else if (et === "GANCHO") r.gancho = v.slice(0, 300);
      else if (et === "FRASE") { if (p[0]) r.filas.push({ momento: "", dice: p[0].slice(0, 300), ve: (p[1] || "").slice(0, 240), tipo: tipoDe(p[2] || (p[1] ? "motion" : "toma")), prompt: (p[3] || "").slice(0, 600), hecho: false }); }
      else if (et === "LAMINA") {
        if (!p[0]) return;
        var tres = p.length >= 3;
        r.filas.push({ momento: "", dice: (tres ? "Arriba: " + p[0] + " / Abajo: " + p[1] : p[0]).slice(0, 300), ve: tres ? "Lámina de contraste: arriba lo correcto, abajo lo de todos, contigo de avatar" : (p[1] ? "La imagen de la lámina" : "Lámina con fondo blanco"), tipo: tres || p[1] ? "ia" : "texto", prompt: (tres ? p[2] : p[1] || "").slice(0, 600), hecho: false });
      }
      else if (et === "LLAMADO" || et === "CTA") { r.llamado = v.slice(0, 400); ultima = "llamado"; }
      else if (et === "DESCRIPCION") { r.descripcion = v; ultima = "descripcion"; }
    });
    r.descripcion = r.descripcion.slice(0, 2200); r.llamado = r.llamado.trim().slice(0, 400);
    return r;
  }
  var RE_LLAMADO = /(comenta|escribe|escr[ií]beme|link|perfil|s[ií]gueme|toca|fecha|marketing|revisa|reserva|cup[oó]n)/i;
  /**
   * Tu guion pegado tal cual (de corrido o por líneas): la primera frase es el gancho, la última es el llamado si pide algo,
   * y lo del medio son las frases, cada una con «lo que se ve» propuesto (la primera opción de tu menú).
   */
  function guionDeTexto(texto) {
    var t = String(texto || "").replace(/\r/g, "").trim(); if (!t) return { gancho: "", filas: [], llamado: "" };
    var partes = t.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (partes.length < 3) partes = t.replace(/([.!?…])\s+/g, "$1\n").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    var gancho = partes.shift() || "", llamado = partes.length && RE_LLAMADO.test(partes[partes.length - 1]) ? partes.pop() : "";
    var filas = partes.slice(0, 24).map(function (d) {
      var op = GB.opcionesVe ? GB.opcionesVe(d, null, []) : { opciones: [] }, o = op.opciones[0];
      return { momento: "", dice: d.slice(0, 300), ve: o ? o.ve : "", tipo: o ? o.tipo : "toma", prompt: "", hecho: false };
    });
    return { gancho: gancho.slice(0, 300), filas: filas, llamado: llamado.slice(0, 400) };
  }
  /** Lo que toca hacer con una pieza, en un botón: el siguiente paso de verdad y, si se puede, el atajo de un toque. */
  function siguientePieza(pz, g, hoy) {
    var et = etapaPieza(pz, g), f = formatoDe(pz.formato), carr = !!(f && f.tipo === "carrusel"), pr = pz.prueba || {};
    if (et === "guion") return { et: et, txt: "Armar su guion", ico: "brillo", accion: "claude", rapido: null };
    if (et === "grabar") return { et: et, txt: "Grabarla con el teleprompter", ico: "camara", accion: "tele", rapido: { accion: "pz-grabado", txt: "Ya la grabé" } };
    if (et === "editar") return carr ? { et: et, txt: "Hacer sus láminas", ico: "capas", accion: "material", rapido: { accion: "pz-editado", txt: "Ya están" } }
      : { et: et, txt: "Editarla", ico: "tijera", accion: "editar", rapido: { accion: "pz-editado", txt: "Ya está editada" } };
    if (et === "descripcion") return { et: et, txt: "Su descripción", ico: "cuaderno", accion: "desc", rapido: null };
    if (et === "subir") return { et: et, txt: "Subirla y lanzar su prueba", ico: "megafono", accion: "lanzar", rapido: null };
    if (pr.estado === "corriendo") { var fin = finPrueba(pz); return hoy >= fin ? { et: "prueba", txt: "Anotar sus números y decidir", ico: "grafica", accion: "prueba", rapido: null, apura: true } : { et: "prueba", txt: "En prueba hasta el " + GB.diaCorto(fin), ico: "reloj", accion: "prueba", rapido: null }; }
    if (pr.estado === "sigue") return { et: "prueba", txt: hoy >= pr.hasta ? "Terminó su pauta: anota" : "Sigue hasta el " + GB.diaCorto(pr.hasta), ico: "play", accion: "prueba", rapido: null, apura: hoy >= pr.hasta };
    return { et: "listas", txt: pr.estado === "apagada" ? "Apagada" : pr.estado === "terminada" ? "Terminó su pauta" : "Publicada", ico: "check", accion: "abrir", rapido: pz.lanzadaEl ? null : { accion: "pz-prueba", txt: "Lanzar su prueba" } };
  }
  /**
   * Tu ritmo hacia un objetivo: cuántas tareas faltan, cuántos días quedan (hoy incluido) y cuántas te tocan hoy para llegar.
   */
  function ritmoObjetivo(o, hoy) {
    var p = progresoObjetivo2(o), dias = o.fecha ? Math.max(0, GB.diasEntre(hoy, o.fecha)) + 1 : 0, faltan = p.total - p.hechas;
    return { hechas: p.hechas, total: p.total, faltan: faltan, dias: o.fecha ? dias : null, hoy: dias ? Math.ceil(faltan / dias) : faltan, paso: o.fecha && hoy > o.fecha ? "tarde" : faltan === 0 ? "listo" : "va" };
  }
  function progresoObjetivo2(o) { var h = 0, t = 0; (o.plan || []).forEach(function (p) { (p.tareas || []).forEach(function (x) { t++; if (x.hecha) h++; }); }); return { hechas: h, total: t }; }

  // ---------- el espacio de un cliente (Cambio 18) ----------
  /** Cuánto ocupa un cliente de su celda (45.000 letras): el % y si ya pasa del 80%. */
  function espacioCliente(p) { var n = JSON.stringify(p || {}).length, pct = Math.round(n / 45000 * 100); return { pct: pct, aviso: pct >= 80 }; }

  Object.assign(GB, {
    formatos: formatos, formatoDe: formatoDe, angulos: angulos, anguloDe: anguloDe, ctas: ctas, ctaDe: ctaDe, ctaSugerido: ctaSugerido, redesDe: redesDe, nombreRed: nombreRed,
    piezas: piezas, porPublicar: porPublicar, itemsPublicar: itemsPublicar, traePor1000: traePor1000, statsContenido: statsContenido, veredictos: veredictos, tablaFunciona: tablaFunciona,
    planSemanas: planSemanas, calendarioMesa: calendarioMesa, estadoPieza: estadoPieza, descripcionRapida: descripcionRapida, pedidoCuerpo: pedidoCuerpo,
    claveProceso: claveProceso, procesoDe: procesoDe, pasosDeTexto: pasosDeTexto, espacioCliente: espacioCliente,
    pedidoTodo: pedidoTodo, leerTodo: leerTodo, guionDeTexto: guionDeTexto, siguientePieza: siguientePieza, ritmoObjetivo: ritmoObjetivo,
    etapaPieza: etapaPieza, nombreEtapaPieza: nombreEtapaPieza, piezaTerminada: piezaTerminada, finPrueba: finPrueba, itemsPiezas: itemsPiezas, sugerenciaPrueba: sugerenciaPrueba,
    progresoGuion: progresoGuion, mesMas: mesMas, mesCalendario: mesCalendario, pedidoCalendario: pedidoCalendario, leerCalendario: leerCalendario
  });
  return GB;
});
