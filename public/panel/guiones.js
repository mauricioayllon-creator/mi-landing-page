/**
 * Tus guiones, sin pantalla: el árbol de ángulos (la madre, sus públicos y sus ramas), tus formatos y tus guiones finales.
 * Lee tres cosas de tus documentos (las guarda tu hoja, con tu clave; tu compu las junta con `node docs.js`):
 *   nosotros/23-arbol-de-angulos.md   → los niveles, los ángulos y la tabla de llamadas
 *   nosotros/24-formatos-de-guion.md  → los formatos y los bloques (tu voz, cómo trabajamos, las estructuras)
 *   nosotros/guiones/<fecha>-<nombre>.md → cada guion final, con su ángulo, su formato y si ya se publicó
 * Aquí no hay nombres ni números: esta carpeta es pública. Los datos viven en tus documentos.
 * Lo cargan tu panel (admin.html), las pruebas y `node angulos.js`.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear();
  else raiz.GUI = crear();
})(this, function () {
  "use strict";

  var RUTAS = { metodo: "nosotros/22-como-se-arma-un-angulo.md", arbol: "nosotros/23-arbol-de-angulos.md", formatos: "nosotros/24-formatos-de-guion.md", finales: "nosotros/guiones" };
  var TIPOS = ["madre", "publico", "angulo"];
  var ESTADOS = [
    { clave: "ganador", nombre: "Ganador", corto: "Ganador" },
    { clave: "en-prueba", nombre: "En prueba", corto: "En prueba" },
    { clave: "por-probar", nombre: "Por probar", corto: "Por probar" },
    { clave: "no-usar", nombre: "No usar", corto: "No usar" }
  ];
  var PAUTAS = ["nunca", "poca", "fuerte", "falta"];
  // Las partes de cada ficha, en su orden. pedido: va en lo que copias para Claude.
  var PARTES = {
    angulo: [
      { n: "A quién le hablo y a quién no", corto: "A quién", ico: "persona", pedido: true },
      { n: "El problema, con sus palabras", corto: "El problema", ico: "whatsapp", pedido: true },
      { n: "Lo que cree y lo que le dicen todos", corto: "Lo que cree", ico: "gente", pedido: true },
      { n: "El motivo nuevo", corto: "El motivo nuevo", ico: "foco", pedido: true },
      { n: "Mi prueba", corto: "Mi prueba", ico: "trofeo", pedido: true },
      { n: "Qué digo", corto: "Qué digo", ico: "megafono", pedido: true },
      { n: "Qué no digo", corto: "Qué no digo", ico: "candado", pedido: true },
      { n: "Por qué le puedo dar resultado", corto: "Por qué resulta", ico: "cohete", pedido: true },
      { n: "El regalo", corto: "El regalo", ico: "regalo", pedido: true },
      { n: "De dónde sale", corto: "De dónde sale", ico: "telefono", pedido: false },
      { n: "Guiones míos de este ángulo", corto: "Mis guiones", ico: "lapiz", pedido: false },
      { n: "Lectura de Claude", corto: "Lectura de Claude", ico: "brillo", pedido: false }
    ],
    publico: [
      { n: "Quién es", corto: "Quién es", ico: "persona", pedido: true },
      { n: "Lo que dice", corto: "Lo que dice", ico: "whatsapp", pedido: false },
      { n: "Quién pagó", corto: "Quién pagó", ico: "billetera", pedido: false },
      { n: "Por qué le puedo dar resultado", corto: "Por qué resulta", ico: "cohete", pedido: false },
      { n: "Cómo le hablo", corto: "Cómo le hablo", ico: "megafono", pedido: true },
      { n: "Lectura de Claude", corto: "Lectura de Claude", ico: "brillo", pedido: false }
    ],
    "no-usar": [
      { n: "Qué es", corto: "Qué es", ico: "alerta", pedido: false },
      { n: "A quién trajo", corto: "A quién trajo", ico: "gente", pedido: false },
      { n: "Por qué pasa", corto: "Por qué pasa", ico: "foco", pedido: false },
      { n: "Qué digo en su lugar", corto: "En su lugar", ico: "megafono", pedido: false }
    ],
    nivel: [
      { n: "Quién es", corto: "Quién es", ico: "persona", pedido: true },
      { n: "Cómo lo reconozco", corto: "Cómo lo reconozco", ico: "ojo", pedido: false },
      { n: "Cómo paga", corto: "Cómo paga", ico: "billetera", pedido: false },
      { n: "Los míos", corto: "Los míos", ico: "gente", pedido: false },
      { n: "En el guion", corto: "En el guion", ico: "megafono", pedido: true }
    ],
    formato: [
      { n: "Qué es", corto: "Qué es", ico: "pelicula", pedido: true },
      { n: "Cuándo lo uso", corto: "Cuándo", ico: "calendario", pedido: true },
      { n: "Cómo arranca", corto: "Cómo arranca", ico: "rayo", pedido: true },
      { n: "La estructura", corto: "La estructura", ico: "tareas", pedido: true },
      { n: "Cómo lo grabo", corto: "Cómo lo grabo", ico: "camara", pedido: true },
      { n: "Lo que te pido", corto: "Lo que pido", ico: "enviar", pedido: true },
      { n: "Cuidado", corto: "Cuidado", ico: "alerta", pedido: true }
    ]
  };

  // ---------- leer el Markdown ----------
  function sinAcentos(s) { return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function llave(s) { return sinAcentos(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function igual(a, b) { return llave(a) === llave(b); }
  /** Parte el documento en sus «## …». Lo de antes del primero se ignora. */
  function partes2(md) {
    var out = [], act = null;
    String(md || "").replace(/\r\n?/g, "\n").split("\n").forEach(function (l) {
      var m = l.match(/^##\s+(.+?)\s*$/);
      if (m && !/^###/.test(l)) { act = { titulo: m[1], lineas: [] }; out.push(act); return; }
      if (act) act.lineas.push(l);
    });
    return out;
  }
  function limpio(lineas) {
    var l = lineas.slice();
    while (l.length && (!l[l.length - 1].trim() || /^\s*-{3,}\s*$/.test(l[l.length - 1]))) l.pop();
    while (l.length && !l[0].trim()) l.shift();
    return l.join("\n");
  }
  /** Un bloque: sus campos «- **Campo:** valor» (antes del primer «### ») y sus partes «### Nombre». */
  function leerBloque(lineas) {
    var meta = {}, secciones = [], act = null;
    lineas.forEach(function (l) {
      var h = l.match(/^###\s+(.+?)\s*$/);
      if (h) { act = { nombre: h[1], lineas: [] }; secciones.push(act); return; }
      if (act) { act.lineas.push(l); return; }
      var m = l.match(/^\s*-\s*\*\*(.+?):\*\*\s*(.*)$/);
      if (m) meta[llave(m[1])] = m[2].trim();
    });
    return { meta: meta, secciones: secciones.map(function (s) { return { nombre: s.nombre, texto: limpio(s.lineas) }; }) };
  }
  function tipoDe(titulo) {
    var m = String(titulo).match(/^(Nivel|Ángulo|Angulo|Formato|Bloque)\s*[·:]\s*([a-z0-9-]+)\s*$/i);
    return m ? { tipo: llave(m[1]), id: m[2].toLowerCase() } : null;
  }
  function celdas(l) { return l.trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); }); }
  function numero(s) { var n = parseInt(String(s == null ? "" : s).replace(/[^\d-]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function lista(s) { return String(s || "").split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(function (x) { return x && x !== "—" && x !== "-"; }); }
  function seccion(o, nombre) { var s = (o.secciones || []).find(function (x) { return igual(x.nombre, nombre); }); return s ? s.texto : ""; }

  /** El árbol: { niveles, angulos, llamadas, porId, raiz }. */
  function leerArbol(md) {
    var out = { niveles: [], angulos: [], llamadas: [], porId: {}, raiz: null };
    partes2(md).forEach(function (p) {
      var t = tipoDe(p.titulo);
      if (t && t.tipo === "nivel") {
        var bn = leerBloque(p.lineas);
        out.niveles.push({ id: t.id, titulo: bn.meta.titulo || t.id, frase: bn.meta.frase || "", secciones: bn.secciones });
        return;
      }
      if (t && t.tipo === "angulo") {
        var b = leerBloque(p.lineas), m = b.meta, padre = (m.padre || "").toLowerCase();
        var a = {
          id: t.id, titulo: m.titulo || t.id, tipo: (m.tipo || "angulo").toLowerCase(), padre: /^[a-z0-9-]+$/.test(padre) ? padre : "",
          estado: (m.estado || "por-probar").toLowerCase(), familia: m.familia || "", nivel: m.nivel || "", nota: numero(m.nota),
          prioridad: numero(m.prioridad), frase: m.frase || "", secciones: b.secciones
        };
        out.angulos.push(a); out.porId[a.id] = a;
        return;
      }
      if (igual(p.titulo, "Llamadas")) {
        var filas = p.lineas.filter(function (l) { return /^\s*\|.*\|\s*$/.test(l); });
        if (filas.length < 3) return;
        var cab = celdas(filas[0]).map(llave);
        var col = function (f, nombre) { var i = cab.indexOf(nombre); return i < 0 ? "" : f[i] || ""; };
        filas.slice(2).forEach(function (l) {
          var f = celdas(l);
          out.llamadas.push({
            fecha: col(f, "fecha"), quien: col(f, "quien"), negocio: col(f, "negocio"), nivel: numero(col(f, "nivel")),
            pautaba: col(f, "pautaba").toLowerCase(), llegoPor: col(f, "llego por").toLowerCase(), certeza: col(f, "certeza").toLowerCase(),
            dijo: col(f, "lo que dijo"), pago: numero(col(f, "pago")), quedo: col(f, "como quedo"), nombro: lista(col(f, "nombro"))
          });
        });
      }
    });
    out.raiz = out.angulos.find(function (a) { return a.tipo === "madre"; }) || null;
    return out;
  }
  /** Tus formatos y los bloques que van en cada pedido: { formatos, bloques: { voz, proceso, estructuras } }. */
  function leerFormatos(md) {
    var out = { formatos: [], bloques: {}, porId: {} };
    partes2(md).forEach(function (p) {
      var t = tipoDe(p.titulo); if (!t) return;
      var b = leerBloque(p.lineas);
      if (t.tipo === "formato") {
        var f = { id: t.id, titulo: b.meta.titulo || t.id, estado: (b.meta.estado || "listo").toLowerCase(), duracion: b.meta.duracion || "", sirve: b.meta["sirve para"] || "", frase: b.meta.frase || "", estructura: llave(b.meta.estructura || ""), secciones: b.secciones };
        out.formatos.push(f); out.porId[f.id] = f;
      } else if (t.tipo === "bloque") out.bloques[t.id] = { id: t.id, titulo: b.meta.titulo || t.id, secciones: b.secciones };
    });
    return out;
  }

  // ---------- el árbol ----------
  function hijosDe(arbol, id) {
    return arbol.angulos.filter(function (a) { return a.padre === id; }).sort(function (a, b) {
      return (a.estado === "no-usar") - (b.estado === "no-usar") || a.prioridad - b.prioridad || a.titulo.localeCompare(b.titulo);
    });
  }
  function descendientes(arbol, id) {
    var out = [];
    (function baja(k) { hijosDe(arbol, k).forEach(function (h) { out.push(h.id); baja(h.id); }); })(id);
    return out;
  }
  function publicoDe(arbol, id) {
    var a = arbol.porId[id], n = 0;
    while (a && n++ < 20) { if (a.tipo === "publico") return a; a = arbol.porId[a.padre]; }
    return null;
  }
  /** La clase de ficha de un nodo: «no-usar», «publico» o «angulo» (la madre usa la de ángulo). */
  function fichaDe(a) { return a.estado === "no-usar" ? "no-usar" : a.tipo === "publico" ? "publico" : "angulo"; }
  /** Los ángulos que se pueden grabar: la madre y las ramas que no son «no usar», por su orden. */
  function grabables(arbol) {
    return arbol.angulos.filter(function (a) { return a.tipo !== "publico" && a.estado !== "no-usar"; })
      .sort(function (a, b) { return (b.tipo === "madre") - (a.tipo === "madre") || a.prioridad - b.prioridad; });
  }

  // ---------- los números ----------
  function resumen(filas) {
    var pag = filas.filter(function (r) { return r.pago > 0; });
    return {
      n: filas.length, pagaron: pag.length, seguros: pag.filter(function (r) { return r.certeza !== "probable"; }).length,
      probables: pag.filter(function (r) { return r.certeza === "probable"; }).length,
      n1: filas.filter(function (r) { return r.nivel === 1; }).length, n2: filas.filter(function (r) { return r.nivel === 2; }).length, n3: filas.filter(function (r) { return r.nivel === 3; }).length,
      filas: filas
    };
  }
  /**
   * Lo que trajo cada ángulo. llegaron: los que llegaron por un video suyo. nombraron: los que dijeron su problema en la llamada.
   * En un público se suman sus ramas. En un «no usar», llegaron y nombraron van juntos (trajo).
   * finales: tus guiones finales [{ angulo, formato, publicado }].
   */
  function estadisticas(arbol, finales) {
    var out = { porId: {}, total: resumen(arbol.llamadas), niveles: {}, pauta: {} };
    [1, 2, 3].forEach(function (n) { out.niveles[n] = resumen(arbol.llamadas.filter(function (r) { return r.nivel === n; })); });
    PAUTAS.forEach(function (p) { out.pauta[p] = resumen(arbol.llamadas.filter(function (r) { return r.pautaba === p; })); });
    arbol.angulos.forEach(function (a) {
      var ids = [a.id].concat(a.tipo === "publico" ? descendientes(arbol, a.id) : []);
      var llego = arbol.llamadas.filter(function (r) { return ids.indexOf(r.llegoPor) >= 0; });
      var nombro = arbol.llamadas.filter(function (r) { return r.nombro.some(function (x) { return ids.indexOf(x) >= 0; }); });
      var junto = arbol.llamadas.filter(function (r) { return llego.indexOf(r) >= 0 || nombro.indexOf(r) >= 0; });
      var gs = (finales || []).filter(function (g) { return ids.indexOf(g.angulo) >= 0; }), pub = gs.filter(function (g) { return g.publicado; });
      var porFormato = {};
      pub.forEach(function (g) { if (g.formato) porFormato[g.formato] = (porFormato[g.formato] || 0) + 1; });
      out.porId[a.id] = { llegaron: resumen(llego), nombraron: resumen(nombro), trajo: resumen(junto), guiones: gs.length, publicados: pub.length, porFormato: porFormato };
    });
    return out;
  }

  // ---------- el mapa: dónde va cada nodo ----------
  var TAM = { madre: { w: 340, h: 150 }, publico: { w: 282, h: 118 }, angulo: { w: 264, h: 102 } };
  /**
   * El mapa, de arriba hacia abajo: la madre arriba, debajo sus públicos en columnas (primero los que traen al que paga,
   * al final lo que no se usa) y, bajo cada público, sus ángulos por orden. Si un ángulo saca otros, cuelgan de él, un paso adentro.
   * → { nodos: [{ id, x, y, w, h, nivel, col }], lineas: [{ de, a, d }], ancho, alto, centro: { x, y } }
   */
  function disponer(arbol) {
    var raiz = arbol.raiz; if (!raiz) return { nodos: [], lineas: [], ancho: 0, alto: 0, centro: { x: 0, y: 0 } };
    var M = 36, SANGRIA = 18, GX = 30, GX_ROJO = 52, GY = 12, BAJA_PUB = 62, BAJA_HOJA = 22, pos = {}, lineas = [];
    var tam = function (a) { return TAM[a.tipo] || TAM.angulo; };
    var hondo = function (id) { var hs = hijosDe(arbol, id); return hs.length ? 1 + Math.max.apply(null, hs.map(function (h) { return hondo(h.id); })) : 0; };
    var tr = tam(raiz), pubs = hijosDe(arbol, raiz.id), x = M, yPub = M + tr.h + BAJA_PUB;
    pubs.forEach(function (p, i) {
      var tp = tam(p), anchoCol = Math.max(tp.w, SANGRIA * Math.max(1, hondo(p.id)) + TAM.angulo.w);
      if (i && p.estado === "no-usar" && pubs[i - 1].estado !== "no-usar") x += GX_ROJO - GX;
      pos[p.id] = { id: p.id, x: x, y: yPub, w: Math.max(tp.w, anchoCol), h: tp.h, nivel: 1, col: i };
      var y = yPub + tp.h + BAJA_HOJA;
      var baja = function (padre, prof) {
        hijosDe(arbol, padre.id).forEach(function (h) {
          var t = tam(h), pp = pos[padre.id];
          pos[h.id] = { id: h.id, x: x + SANGRIA * prof, y: y, w: t.w, h: t.h, nivel: prof + 1, col: i };
          // El hilo: baja por la izquierda del padre y entra al hijo por su costado
          var sx = pp.x + 9, my = y + Math.round(t.h / 2);
          lineas.push({ de: padre.id, a: h.id, d: "M" + sx + " " + (pp.y + pp.h) + " V" + (my - 8) + " Q" + sx + " " + my + " " + (sx + 8) + " " + my + " H" + pos[h.id].x });
          y += t.h + GY;
          baja(h, prof + 1);
        });
      };
      baja(p, 1);
      x += pos[p.id].w + GX;
    });
    var anchoCols = Math.max(tr.w, x - GX - M);
    pos[raiz.id] = { id: raiz.id, x: Math.round(M + (anchoCols - tr.w) / 2), y: M, w: tr.w, h: tr.h, nivel: 0, col: -1 };
    var r = pos[raiz.id], rx = r.x + r.w / 2, ry = r.y + r.h, medio = Math.round(ry + BAJA_PUB / 2);
    pubs.forEach(function (p) {
      var q = pos[p.id], px = Math.round(q.x + q.w / 2);
      lineas.push({ de: raiz.id, a: p.id, d: "M" + Math.round(rx) + " " + ry + " C" + Math.round(rx) + " " + medio + " " + px + " " + medio + " " + px + " " + q.y });
    });
    var nodos = Object.keys(pos).map(function (k) { return pos[k]; });
    var ancho = Math.max.apply(null, nodos.map(function (n) { return n.x + n.w; })) + M, altoT = Math.max.apply(null, nodos.map(function (n) { return n.y + n.h; })) + M;
    return { nodos: nodos, lineas: lineas, ancho: ancho, alto: altoT, centro: { x: Math.round(rx), y: r.y + r.h / 2 } };
  }

  // ---------- lo que copias para Claude ----------
  function parteTexto(o, nombre) { var t = seccion(o, nombre); return t ? "## " + nombre + "\n" + t : ""; }
  /** Todo un ángulo, listo para pegar: su frase, sus partes de pedido y el público del que cuelga. */
  function textoAngulo(arbol, id) {
    var a = arbol.porId[id]; if (!a) return "";
    var pub = a.tipo === "publico" ? null : publicoDe(arbol, id), ficha = fichaDe(a);
    var out = ["ÁNGULO: " + a.titulo, a.frase ? "En una frase: " + a.frase : "", [a.familia ? "Familia: " + a.familia : "", pub ? "Público: " + pub.titulo : ""].filter(Boolean).join(" · "), ""];
    PARTES[ficha].forEach(function (p) { if (p.pedido || ficha === "no-usar") { var t = parteTexto(a, p.n); if (t) out.push(t, ""); } });
    if (pub) {
      out.push("## El público de este ángulo: " + pub.titulo, pub.frase);
      PARTES.publico.forEach(function (p) { if (p.pedido) { var t = seccion(pub, p.n); if (t) out.push("**" + p.n + "**", t); } });
      out.push("");
    }
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  /** Tus 3 niveles, cortos: quién es cada uno y cómo se le habla (o no) en el guion. */
  function textoNiveles(arbol) {
    if (!arbol.niveles.length) return "";
    return arbol.niveles.map(function (n, i) {
      return (i + 1) + ". " + n.titulo.toUpperCase() + (n.frase ? " · " + n.frase : "") + "\n" +
        PARTES.nivel.filter(function (p) { return p.pedido; }).map(function (p) { var t = seccion(n, p.n); return t ? "**" + p.n + "**\n" + t : ""; }).filter(Boolean).join("\n");
    }).join("\n\n");
  }
  function textoBloque(fm, id) {
    var b = fm.bloques[id]; if (!b) return "";
    return b.secciones.map(function (s) { return "## " + s.nombre + "\n" + s.texto; }).join("\n\n");
  }
  /** Las estructuras que tocan a la familia del ángulo («caso y concepto» → Caso y Concepto). */
  function textoEstructuras(fm, familia) {
    var b = fm.bloques.estructuras; if (!b) return "";
    var f = llave(familia), usa = b.secciones.filter(function (s) { return f.indexOf(llave(s.nombre)) >= 0; });
    return usa.map(function (s) { return "## Si lo cuento como " + s.nombre.toLowerCase() + "\n" + s.texto; }).join("\n\n");
  }
  function textoFormato(fm, id) {
    var f = fm.porId[id]; if (!f) return "";
    var out = ["FORMATO: " + f.titulo, f.frase, [f.duracion ? "Duración: " + f.duracion : "", f.sirve ? "Sirve para: " + f.sirve : ""].filter(Boolean).join(" · "), ""];
    PARTES.formato.forEach(function (p) { var t = parteTexto(f, p.n); if (t) out.push(t, ""); });
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  var RAYA = "════════════════════════════════════";
  function titulo(n, t) { return RAYA + "\n" + n + ". " + t + "\n" + RAYA; }
  /**
   * El pedido para Claude. Con formato y ángulo: todo junto. Con uno solo: esa parte, lista para mandarla primero.
   * que: "todo" | "formato" | "angulo".
   */
  function pedido(arbol, fm, angId, fmtId, que) {
    var a = arbol.porId[angId], f = fm.porId[fmtId];
    que = que || (a && f ? "todo" : a ? "angulo" : "formato");
    if (que === "formato" && f) {
      return ["Te paso el formato en que voy a grabar mi próximo guion, mi voz y cómo trabajamos. Léelo y espera: en el siguiente mensaje te mando el ángulo.", "",
        titulo(1, "EL FORMATO"), textoFormato(fm, fmtId), "", titulo(2, "MI VOZ"), textoBloque(fm, "voz"), "", titulo(3, "CÓMO TRABAJAMOS"), textoBloque(fm, "proceso")].join("\n").trim();
    }
    if (que === "angulo" && a) {
      return ["Este es el ángulo del guion. Escríbelo en el formato que te pasé (si no te pasé ninguno, a cámara).", "",
        titulo(1, "EL ÁNGULO"), textoAngulo(arbol, angId), "", titulo(2, "A QUIÉN LE HABLO: MIS 3 NIVELES"), textoNiveles(arbol), "",
        textoEstructuras(fm, a.familia) ? titulo(3, "LA ESTRUCTURA") + "\n" + textoEstructuras(fm, a.familia) + "\n" : "", "Empieza por el cuerpo."].join("\n").replace(/\n{3,}/g, "\n\n").trim();
    }
    if (!a || !f) return "";
    var porFamilia = f.estructura.indexOf("familia") >= 0 ? textoEstructuras(fm, a.familia) : "";
    return ["Vamos a escribir un guion mío. Te paso el formato, el ángulo, a quién le hablo, mi voz y cómo trabajamos.", "",
      titulo(1, "EL FORMATO"), textoFormato(fm, fmtId) + (porFamilia ? "\n\n" + porFamilia : ""), "",
      titulo(2, "EL ÁNGULO"), textoAngulo(arbol, angId), "",
      titulo(3, "A QUIÉN LE HABLO: MIS 3 NIVELES"), textoNiveles(arbol), "",
      titulo(4, "MI VOZ"), textoBloque(fm, "voz"), "",
      titulo(5, "CÓMO TRABAJAMOS"), textoBloque(fm, "proceso"), "",
      "Empieza por el cuerpo."].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  // ---------- tus guiones finales ----------
  var DATO = /(?:^|·)\s*(Ángulo|Angulo|Formato|Publicado|Fecha|Link)\s*:\s*/gi;
  /** La línea de datos de un guion final: «Ángulo: madre · Formato: selfie-casero · Publicado: sí · Fecha: 2026-11-14 · Link: …». */
  function leerDatos(linea) {
    var o = { angulo: "", formato: "", publicado: false, fecha: "", link: "" }, s = String(linea || ""), ms = [], m;
    DATO.lastIndex = 0;
    while ((m = DATO.exec(s))) ms.push({ k: llave(m[1]), ini: m.index, fin: DATO.lastIndex });
    ms.forEach(function (x, i) {
      var v = s.slice(x.fin, i + 1 < ms.length ? ms[i + 1].ini : s.length).trim();
      if (x.k === "publicado") o.publicado = /^s[ií]/i.test(v);
      else if (x.k === "angulo" || x.k === "formato") o[x.k] = v.toLowerCase().replace(/[^a-z0-9-]/g, "");
      else if (x.k === "fecha") o.fecha = (v.match(/\d{4}-\d{2}-\d{2}/) || [""])[0];
      else o.link = /^https?:\/\//.test(v) ? v.split(/\s/)[0] : "";
    });
    return o;
  }
  function esDatos(linea) { return /^\s*(Ángulo|Angulo)\s*:/i.test(String(linea || "")); }
  /** Un guion final desde la lista de tus documentos (sin su texto): la primera línea trae sus datos. */
  function finalDeLista(d) {
    var o = esDatos(d.vista) ? leerDatos(d.vista) : { angulo: "", formato: "", publicado: false, fecha: "", link: "" };
    return Object.assign({ ruta: d.ruta, titulo: d.titulo, rev: d.rev, actualizado: d.actualizado, largo: d.largo, conDatos: esDatos(d.vista) }, o,
      { fecha: o.fecha || (String(d.ruta).match(/(\d{4}-\d{2}-\d{2})/) || [""])[0] });
  }
  /** Un guion final entero: su título, sus datos, el guion y sus notas. */
  function leerFinal(md, ruta) {
    var t = String(md || "").replace(/\r\n?/g, "\n"), ls = t.split("\n");
    var tit = (t.match(/^#\s+(.+)$/m) || ["", ""])[1].trim(), dl = ls.find(esDatos) || "";
    var parte = function (nombre) {
      var i = ls.findIndex(function (l) { return /^##\s+/.test(l) && igual(l.replace(/^##\s+/, ""), nombre); }); if (i < 0) return "";
      var j = i + 1, out = [];
      while (j < ls.length && !/^##\s+/.test(ls[j])) out.push(ls[j++]);
      return limpio(out);
    };
    var guion = parte("Guion");
    if (!guion) guion = limpio(ls.filter(function (l) { return !/^#\s+/.test(l) && !esDatos(l); }));
    return Object.assign({ ruta: ruta || "", titulo: tit, guion: guion, notas: parte("Notas") }, leerDatos(dl));
  }
  function armarFinal(o) {
    var datos = ["Ángulo: " + (o.angulo || ""), "Formato: " + (o.formato || ""), "Publicado: " + (o.publicado ? "sí" : "no"), "Fecha: " + (o.fecha || "")];
    if (o.link) datos.push("Link: " + o.link);
    return "# " + String(o.titulo || "Guion sin título").replace(/\s+/g, " ").trim() + "\n\n" + datos.join(" · ") + "\n\n## Guion\n\n" + String(o.guion || "").trim() + "\n" +
      (String(o.notas || "").trim() ? "\n## Notas\n\n" + String(o.notas).trim() + "\n" : "");
  }
  /** Cambia solo la línea de datos de un guion ya guardado (por ejemplo, «Publicado: sí»), sin tocar el resto. */
  function ponerDatos(md, cambios) {
    var ls = String(md || "").replace(/\r\n?/g, "\n").split("\n"), i = ls.findIndex(esDatos);
    var o = Object.assign(i >= 0 ? leerDatos(ls[i]) : { angulo: "", formato: "", publicado: false, fecha: "", link: "" }, cambios || {});
    var linea = ["Ángulo: " + (o.angulo || ""), "Formato: " + (o.formato || ""), "Publicado: " + (o.publicado ? "sí" : "no"), "Fecha: " + (o.fecha || "")].concat(o.link ? ["Link: " + o.link] : []).join(" · ");
    if (i >= 0) ls[i] = linea;
    else { var t = ls.findIndex(function (l) { return /^#\s+/.test(l); }); ls.splice(t >= 0 ? t + 1 : 0, 0, "", linea); }
    return ls.join("\n");
  }
  function slug(t, max) {
    return sinAcentos(t).toLowerCase().replace(/ñ/g, "n").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max || 50).replace(/-+$/, "");
  }
  function rutaFinal(o, existentes) {
    var base = RUTAS.finales + "/" + ((o.fecha || "").slice(0, 10) || "sin-fecha") + "-" + (slug(o.titulo, 50) || "guion"), r = base + ".md", i = 2;
    while ((existentes || []).indexOf(r) >= 0) r = base + "-" + i++ + ".md";
    return r;
  }
  function esFinal(ruta) { return String(ruta || "").indexOf(RUTAS.finales + "/") === 0; }

  // ---------- la revisión: que no falte nada antes de que lo veas ----------
  /** → { errores: [...], avisos: [...] }. Con un error, el panel no dibuja bien; un aviso es algo que falta saber. */
  function revisar(arbol, fm) {
    var err = [], av = [];
    var madres = arbol.angulos.filter(function (a) { return a.tipo === "madre"; });
    if (madres.length !== 1) err.push("Tiene que haber un solo ángulo madre (hay " + madres.length + ").");
    var vistos = {};
    arbol.angulos.forEach(function (a) {
      var q = "«" + a.id + "»: ";
      if (vistos[a.id]) err.push(q + "está dos veces."); vistos[a.id] = true;
      if (TIPOS.indexOf(a.tipo) < 0) err.push(q + "tipo «" + a.tipo + "» no existe.");
      if (!ESTADOS.some(function (e) { return e.clave === a.estado; })) err.push(q + "estado «" + a.estado + "» no existe.");
      if (a.tipo !== "madre" && !arbol.porId[a.padre]) err.push(q + "su padre «" + a.padre + "» no existe.");
      if (!a.titulo || a.titulo === a.id) err.push(q + "le falta el título.");
      if (!a.frase) err.push(q + "le falta su frase.");
      if (a.estado !== "no-usar" && (a.nota < 1 || a.nota > 10)) err.push(q + "su nota tiene que ir de 1 a 10.");
      PARTES[fichaDe(a)].forEach(function (p) {
        var t = seccion(a, p.n);
        if (!t) err.push(q + "le falta la parte «" + p.n + "».");
        else if (/(^|\n)\s*(?:[-*]\s+)?(?:\*\*)?Falta(?:\*\*)?:/.test(t)) av.push(q + "«" + p.n + "» dice «Falta».");
      });
    });
    ["perfecto", "calificado", "no"].forEach(function (k) {
      var n = arbol.niveles.find(function (x) { return x.id === k; });
      if (!n) return err.push("Falta el nivel «" + k + "».");
      PARTES.nivel.forEach(function (p) { if (!seccion(n, p.n)) err.push("Nivel «" + k + "»: le falta «" + p.n + "»."); });
    });
    arbol.llamadas.forEach(function (r, i) {
      var q = "Llamada " + (i + 1) + " (" + r.quien + "): ";
      if ([1, 2, 3].indexOf(r.nivel) < 0) err.push(q + "el nivel tiene que ser 1, 2 o 3.");
      if (PAUTAS.indexOf(r.pautaba) < 0) err.push(q + "«Pautaba» tiene que ser nunca, poca, fuerte o falta.");
      if (r.llegoPor !== "falta" && r.llegoPor !== "otro" && !arbol.porId[r.llegoPor]) err.push(q + "llegó por «" + r.llegoPor + "», que no está en el árbol.");
      r.nombro.forEach(function (x) { if (!arbol.porId[x]) err.push(q + "nombró «" + x + "», que no está en el árbol."); });
      if (!r.quien || !r.fecha) err.push(q + "le falta la fecha o el nombre.");
    });
    if (!arbol.llamadas.length) err.push("La tabla de Llamadas está vacía o no se pudo leer.");
    if (fm) {
      if (!fm.formatos.length) err.push("No hay formatos.");
      fm.formatos.forEach(function (f) {
        if (["listo", "despues"].indexOf(f.estado) < 0) err.push("Formato «" + f.id + "»: estado «" + f.estado + "» no existe.");
        PARTES.formato.forEach(function (p) { if (!seccion(f, p.n)) err.push("Formato «" + f.id + "»: le falta «" + p.n + "»."); });
      });
      ["voz", "proceso", "estructuras"].forEach(function (b) { if (!fm.bloques[b] || !fm.bloques[b].secciones.length) err.push("Falta el bloque «" + b + "»."); });
    }
    return { errores: err, avisos: av };
  }

  return {
    RUTAS: RUTAS, ESTADOS: ESTADOS, PARTES: PARTES, PAUTAS: PAUTAS, TAM: TAM,
    leerArbol: leerArbol, leerFormatos: leerFormatos, seccion: seccion, hijosDe: hijosDe, descendientes: descendientes, publicoDe: publicoDe, fichaDe: fichaDe, grabables: grabables,
    estadisticas: estadisticas, disponer: disponer,
    textoAngulo: textoAngulo, textoNiveles: textoNiveles, textoFormato: textoFormato, textoBloque: textoBloque, textoEstructuras: textoEstructuras, pedido: pedido,
    leerDatos: leerDatos, ponerDatos: ponerDatos, finalDeLista: finalDeLista, leerFinal: leerFinal, armarFinal: armarFinal, rutaFinal: rutaFinal, esFinal: esFinal, slug: slug,
    revisar: revisar
  };
});
