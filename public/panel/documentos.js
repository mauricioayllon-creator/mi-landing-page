/**
 * Tus documentos, sin pantalla: las carpetas (Nosotros y una por cliente), las rutas, las plantillas
 * de cada cliente y el lector de Markdown (seguro: escapa todo antes de dar formato).
 * Los guarda tu hoja (pestaña Documentos) y los junta con tu compu `node docs.js`
 * (_cerebro/nosotros/ y _cerebro/clientes/<carpeta>/).
 * Solo lo carga tu panel (admin.html). Las pruebas y docs.js lo cargan con require.
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear();
  else raiz.DOCS = crear();
})(this, function () {
  "use strict";

  // ---------- rutas ----------
  // nosotros/<archivo>.md · nosotros/llamadas/<archivo>.md · clientes/<carpeta>/<archivo>.md · clientes/<carpeta>/sesiones/<archivo>.md
  var TROZO = "[a-z0-9][a-z0-9-]{0,39}";
  var RUTA = new RegExp("^(nosotros|clientes\\/" + TROZO + ")(\\/" + TROZO + ")?\\/[a-z0-9][a-z0-9-]{0,79}\\.md$");
  var MAX_TEXTO = 270000;   // 6 celdas de 45.000 en tu hoja: una llamada de 2 horas entra

  function rutaValida(r) { return RUTA.test(String(r || "")); }
  /** "Llamada con Eaton 03/11" → "llamada-con-eaton-03-11". */
  function slug(t, max) {
    return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/ñ/g, "n").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max || 70).replace(/-+$/, "");
  }
  /** Las partes de una ruta: raíz (nosotros | clientes), carpeta (la del cliente), sub (sesiones, guiones…) y archivo. */
  function partes(r) {
    var p = String(r || "").split("/"), archivo = p.pop();
    if (p[0] === "nosotros") return { raiz: "nosotros", carpeta: "nosotros", sub: p[1] || "", archivo: archivo };
    return { raiz: "clientes", carpeta: p[1] || "", sub: p[2] || "", archivo: archivo };
  }
  /** La carpeta donde vive un documento: "nosotros", "nosotros/llamadas", "clientes/peques", "clientes/peques/sesiones". */
  function dondeVive(r) { return String(r || "").split("/").slice(0, -1).join("/"); }
  /** Una ruta nueva que no pise a otra: le suma -2, -3… */
  function rutaLibre(carpeta, nombre, existentes) {
    var base = slug(nombre) || "documento", lista = existentes || [], r = carpeta + "/" + base + ".md", i = 2;
    while (lista.indexOf(r) >= 0) r = carpeta + "/" + base + "-" + i++ + ".md";
    return r;
  }

  // ---------- el texto ----------
  /** Lo mismo en tu hoja y en tu compu: saltos de línea iguales, sin caracteres raros y con un salto al final. */
  function normalizar(t) {
    var s = String(t == null ? "" : t).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f﻿]/g, "").replace(/\s+$/, "");
    return s ? s + "\n" : "";
  }
  /** El título: el primer «# …» o, si no hay, el nombre del archivo. */
  function titulo(texto, ruta) {
    var m = String(texto || "").match(/^#\s+(.+)$/m);
    if (m) return limpiarInline(m[1]).slice(0, 120);
    var a = partes(ruta).archivo.replace(/\.md$/, "").replace(/^\d+-/, "").replace(/-/g, " ");
    return a ? a.charAt(0).toUpperCase() + a.slice(1) : "Documento";
  }
  /** La primera línea con contenido (sin títulos ni citas): se ve en la lista. */
  function vista(texto) {
    var l = String(texto || "").split("\n").map(function (x) { return x.trim(); })
      .filter(function (x) { return x && !/^(#|>|\||---|```)/.test(x); })[0] || "";
    return limpiarInline(l.replace(/^([-*+]|\d+\.)\s+/, "")).slice(0, 160);
  }
  function limpiarInline(s) { return String(s || "").replace(/\*\*|__|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/(^|\s)[*_]([^*_]+)[*_]/g, "$1$2").trim(); }
  /** Cuántas cosas dicen «Falta:» (lo que queda por saber de ese cliente). */
  function faltas(texto) { return (String(texto || "").match(/(^|\n)(\s*(?:[-*]\s+)?(?:\*\*)?Falta(?:\*\*)?:|#{2,4}\s+Falta\b)/g) || []).length; }

  // ---------- el lector de Markdown ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  /** Negritas, cursivas, código, links (solo http y https) y [CÓDIGOS] de tu cerebro. Recibe texto sin escapar. */
  function inline(s) {
    var guardados = [];
    var guardar = function (html) { guardados.push(html); return "\u0000" + (guardados.length - 1) + "\u0000"; };
    var t = String(s == null ? "" : s);
    t = t.replace(/`([^`]+)`/g, function (_, c) { return guardar("<code>" + esc(c) + "</code>"); });
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (_, txt, url) { return guardar('<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(txt) + "</a>"); });
    t = t.replace(/(^|[\s(])(https?:\/\/[^\s<>()]+[^\s<>().,;:!?])/g, function (_, a, url) { return a + guardar('<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + "</a>"); });
    t = esc(t);
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^\w*])\*([^*\s][^*]*)\*(?!\w)/g, "$1<em>$2</em>").replace(/(^|[^\w])_([^_\s][^_]*)_(?!\w)/g, "$1<em>$2</em>");
    t = t.replace(/«([^»]{1,240})»/g, '<q class="md-q">«$1»</q>');
    t = t.replace(/\[([A-Z][A-Z0-9.]{1,10}(?:[ §][^\]\[]{0,24})?)\]/g, '<span class="md-cod">$1</span>');
    return t.replace(/\u0000(\d+)\u0000/g, function (_, i) { return guardados[+i]; });
  }
  function celdas(linea) { return linea.trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); }); }
  /** Markdown → HTML. Títulos (# a ####), párrafos, listas (con sangría y casillas), citas, tablas, código, líneas. */
  function html(md) {
    var lineas = String(md || "").replace(/\r\n?/g, "\n").split("\n"), out = [], i = 0, ids = {};
    var idDe = function (t) { var b = slug(limpiarInline(t), 50) || "s", s = b, n = 2; while (ids[s]) s = b + "-" + n++; ids[s] = true; return s; };
    while (i < lineas.length) {
      var l = lineas[i];
      if (!l.trim()) { i++; continue; }
      var cerca = l.match(/^\s*(```|~~~)/);
      if (cerca) {
        var cod = []; i++;
        while (i < lineas.length && !/^\s*(```|~~~)/.test(lineas[i])) cod.push(lineas[i++]);
        i++;
        out.push('<pre class="md-pre"><code>' + esc(cod.join("\n")) + "</code></pre>");
        continue;
      }
      var h = l.match(/^(#{1,4})\s+(.+?)\s*#*$/);
      if (h) { var nv = h[1].length; out.push("<h" + nv + ' id="' + idDe(h[2]) + '">' + inline(h[2]) + "</h" + nv + ">"); i++; continue; }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
      if (/^\s*>/.test(l)) {
        var cita = [];
        while (i < lineas.length && /^\s*>/.test(lineas[i])) cita.push(lineas[i++].replace(/^\s*>\s?/, ""));
        out.push('<blockquote class="md-cita">' + html(cita.join("\n")) + "</blockquote>");
        continue;
      }
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lineas.length && /^\s*\|?\s*:?-{2,}/.test(lineas[i + 1])) {
        var cab = celdas(l), filas = []; i += 2;
        while (i < lineas.length && /^\s*\|.*\|\s*$/.test(lineas[i])) filas.push(celdas(lineas[i++]));
        out.push('<div class="md-tabla"><table><thead><tr>' + cab.map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          filas.map(function (f) { return "<tr>" + cab.map(function (_, k) { return "<td>" + inline(f[k] || "") + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>");
        continue;
      }
      if (/^\s*([-*+]|\d+[.)])\s+/.test(l)) {
        var items = [];
        while (i < lineas.length) {
          var m = lineas[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
          if (m) { items.push({ n: Math.min(3, Math.floor(m[1].replace(/\t/g, "  ").length / 2)), ord: /\d/.test(m[2]), t: m[3] }); i++; continue; }
          if (lineas[i].trim() && /^\s{2,}\S/.test(lineas[i]) && items.length) { items[items.length - 1].t += " " + lineas[i].trim(); i++; continue; }
          break;
        }
        out.push(lista(items));
        continue;
      }
      var par = [];
      while (i < lineas.length && lineas[i].trim() && !/^(#{1,4}\s|\s*>|\s*([-*+]|\d+[.)])\s+|\s*(```|~~~)|\s*(-{3,}|\*{3,})\s*$)/.test(lineas[i]) && !(/^\s*\|.*\|\s*$/.test(lineas[i]) && /^\s*\|?\s*:?-{2,}/.test(lineas[i + 1] || ""))) par.push(lineas[i++]);
      out.push("<p>" + par.map(function (x) { return inline(x.trim()); }).join("<br>") + "</p>");
    }
    return out.join("\n");
  }
  function lista(items) {
    var out = "", pila = [];
    var abrir = function (ord) { out += ord ? "<ol>" : "<ul>"; pila.push(ord); };
    var cerrar = function () { out += pila.pop() ? "</ol>" : "</ul>"; };
    items.forEach(function (it, k) {
      var nivel = Math.min(it.n, pila.length);   // no se salta niveles
      if (!pila.length) abrir(it.ord);
      else if (nivel + 1 > pila.length) { out = out.replace(/<\/li>$/, ""); abrir(it.ord); }
      else {
        while (pila.length > nivel + 1) { cerrar(); out += "</li>"; }
        if (pila[pila.length - 1] !== it.ord) { cerrar(); abrir(it.ord); }   // cambia de viñetas a números (o al revés): otra lista
      }
      var caja = it.t.match(/^\[( |x|X)\]\s+(.*)$/);
      out += caja ? '<li class="md-caja' + (caja[1] !== " " ? " hecha" : "") + '"><span class="md-check" aria-hidden="true"></span>' + inline(caja[2]) + "</li>" : "<li>" + inline(it.t) + "</li>";
      if (k === items.length - 1) while (pila.length) { cerrar(); if (pila.length) out += "</li>"; }
    });
    return out;
  }
  /** El índice del documento: sus «## …». */
  function indice(md) {
    var ids = {}, out = [];
    String(md || "").split("\n").forEach(function (l) {
      var h = l.match(/^(#{1,4})\s+(.+?)\s*#*$/);
      if (!h) return;
      var b = slug(limpiarInline(h[2]), 50) || "s", s = b, n = 2; while (ids[s]) s = b + "-" + n++; ids[s] = true;
      if (h[1].length === 2) out.push({ id: s, texto: limpiarInline(h[2]) });
    });
    return out;
  }

  // ---------- las carpetas ----------
  /** Las subcarpetas de cada lado, en orden. "" = los documentos base. */
  var SUBS = {
    nosotros: [
      { clave: "", nombre: "Estrategia", ico: "brujula", ayuda: "Lo nuestro, antes de subir un video: el negocio, a quién le hablamos, la oferta, los ángulos, cómo vendemos y la prueba." },
      { clave: "llamadas", nombre: "Llamadas de venta", ico: "telefono", ayuda: "Cada llamada con un prospecto: arriba el resumen, abajo la transcripción. Si cierra, la llamada se mueve a su carpeta." }
    ],
    clientes: [
      { clave: "", nombre: "Estrategia", ico: "brujula", ayuda: "Lo que hay que saber antes de hacer su video: su ficha, su comprador, su oferta, sus ángulos, cómo vende y su bitácora." },
      { clave: "sesiones", nombre: "Sesiones", ico: "telefono", ayuda: "Cada llamada o reunión con él: arriba el resumen (lo escribe Claude), abajo la transcripción entera." },
      { clave: "guiones", nombre: "Guiones", ico: "lapiz", ayuda: "Los guiones de sus productos." }
    ]
  };
  /** Los documentos base de cada cliente: siempre los mismos, en este orden. */
  var BASE = [
    { archivo: "00-ficha.md", nombre: "Ficha del negocio", ico: "tienda", pregunta: "¿Qué vende, cuánto le deja una venta y qué nos contrató?" },
    { archivo: "01-comprador.md", nombre: "Su comprador", ico: "persona", pregunta: "¿Quién le compra, cuándo le duele y qué teme?" },
    { archivo: "02-oferta.md", nombre: "Su oferta", ico: "regalo", pregunta: "¿Qué le ofrece al comprador, con qué fecha y por qué?" },
    { archivo: "03-angulos-y-marca.md", nombre: "Ángulos y marca", ico: "megafono", pregunta: "¿Qué dolores agitamos y cómo habla su marca?" },
    { archivo: "04-como-vende.md", nombre: "Cómo vende", ico: "embudo", pregunta: "¿Qué pasa desde que lo ven hasta que compran, y dónde se pierden?" },
    { archivo: "05-bitacora.md", nombre: "Bitácora", ico: "cuaderno", pregunta: "¿Qué decidimos, qué hicimos y qué salió?" }
  ];
  function fechaCorta(f) { var m = String(f || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : ""; }
  /** Los documentos base de un cliente nuevo, con lo que ya sabe tu panel de él. */
  function plantillaCliente(carpeta, d, hoy) {
    d = d || {};
    var n = d.negocio || "El cliente", f = fechaCorta(hoy), cab = function (t, extra) { return "# " + n + " · " + t + "\n\n> Actualizado: " + f + (extra ? " · " + extra : "") + "\n"; };
    var dato = function (v, falta) { return v ? v : "Falta: " + falta; };
    var textos = {
      "00-ficha.md": cab("Ficha del negocio") + "\n## Qué vende y dónde\n- " + dato(d.rubro, "qué vende, su rubro y dónde está") + "\n\n## Sus números\n- Falta: cuánto vende al mes, su ticket promedio y lo que le deja una venta.\n\n## Qué quiere lograr\n- Falta: su meta, con sus palabras.\n\n## Qué nos contrató\n- " +
        (d.contrato || "Falta: la oferta (lanzamiento o plan mensual), el precio y la garantía con su número.") + "\n\n## Con quién hablamos\n- " + dato(d.contacto, "quién decide y su nombre") + "\n\n## Accesos (sin contraseñas)\n- Falta: qué cuentas nos dio y cuáles faltan.\n",
      "01-comprador.md": cab("Su comprador") + "\n## Quién compra\n- Falta.\n\n## Su momento (cuándo le duele)\n- Falta.\n\n## Su miedo número 1\n- Falta.\n\n## Lo que pregunta antes de comprar\n- Falta.\n\n## Sus palabras\n- Falta: cómo lo dice el comprador (comentarios, mensajes, el mostrador).\n",
      "02-oferta.md": cab("Su oferta") + "\n## La oferta de ahora\n- Falta: el producto, el regalo (no la rebaja), la fecha y su porqué.\n\n## La cuenta\n- Falta: lo que le deja una venta con el regalo, contra lo que le dejaría con un descuento.\n\n## Sus papas y Coca\n- Falta: lo que se lleva junto con lo principal.\n",
      "03-angulos-y-marca.md": cab("Ángulos y marca") + "\n## Ángulos que usamos\n- Falta.\n\n## Cómo habla su marca\n- Falta: colores, logo, tono y palabras que usa o no quiere.\n\n## Lo que no se dice\n- Falta.\n\n## Su prueba\n- Falta: reseñas, antes y después, clientes que se puedan mostrar.\n",
      "04-como-vende.md": cab("Cómo vende") + "\n## El camino de su comprador\n1. Lo ve en…\n2. Le escribe o va directo…\n3. Compra en…\n\n## Dónde se pierde la gente\n- Falta.\n\n## Quién atiende\n- Falta.\n",
      "05-bitacora.md": "# " + n + " · Bitácora\n\n> Lo que decidimos, hicimos y salió, con fecha. Lo más nuevo arriba.\n\n- **" + f + "** · Se abrió su carpeta.\n"
    };
    return BASE.map(function (b) { return { ruta: "clientes/" + carpeta + "/" + b.archivo, texto: textos[b.archivo] }; });
  }
  /** Una llamada nueva: el resumen arriba (lo escribe Claude) y la transcripción abajo. */
  var TIPOS_SESION = [
    { clave: "venta", nombre: "Llamada de venta" },
    { clave: "diagnostico", nombre: "Diagnóstico" },
    { clave: "consultoria", nombre: "Consultoría" },
    { clave: "seguimiento", nombre: "Seguimiento" },
    { clave: "grabacion", nombre: "Sesión de grabación" }
  ];
  function plantillaSesion(o) {
    o = o || {};
    var tipo = (TIPOS_SESION.find(function (t) { return t.clave === o.tipo; }) || TIPOS_SESION[0]).nombre;
    var tr = normalizar(o.transcripcion || "");
    return "# " + tipo + " · " + (o.con || "Sin nombre") + " · " + fechaCorta(o.fecha) + "\n\n> Tipo: " + tipo + (o.con ? " · Con: " + o.con : "") + " · Fecha: " + fechaCorta(o.fecha) + "\n\n" +
      "## Resumen\n- **Lo que quiere:** Falta.\n- **Números que dio:** Falta.\n- **Lo que decidimos:** Falta.\n- **Objeciones y cómo las respondí:** Falta.\n- **Lo que quedó:** Falta.\n\n" +
      (o.notas ? "## Mis notas\n" + normalizar(o.notas) + "\n" : "") +
      "## Transcripción\n" + (tr || "Pega aquí la transcripción.\n");
  }
  /** Una transcripción de subtítulos (.srt, .vtt) sin números ni horas, y sin líneas repetidas seguidas. El texto normal no cambia. */
  function limpiarTranscripcion(t) {
    var s = String(t || "").replace(/\r\n?/g, "\n");
    if (!/-->/.test(s)) return s;
    var out = [];
    s.split("\n").forEach(function (l) {
      var x = l.trim();
      if (!x || /^WEBVTT/.test(x) || /^NOTE\b/.test(x) || /^\d+$/.test(x) || /-->/.test(x)) return;
      x = x.replace(/<[^>]+>/g, "").trim();
      if (x && out[out.length - 1] !== x) out.push(x);
    });
    return out.join("\n");
  }
  function rutaSesion(carpeta, o, existentes) {
    return rutaLibre(carpeta, String(o.fecha || "").slice(0, 10) + "-" + (o.tipo || "venta") + "-" + (o.con || ""), existentes);
  }

  /**
   * El árbol de tus documentos: Nosotros y una carpeta por cliente (las de tus clientes del panel, aunque estén vacías,
   * y cualquier otra que ya tenga documentos). docs: [{ ruta, titulo, vista, actualizado, rev, largo, faltas }].
   */
  function arbol(docs, clientes) {
    var porCarpeta = {}, out = { nosotros: null, clientes: [] };
    (docs || []).forEach(function (d) { if (!rutaValida(d.ruta)) return; var p = partes(d.ruta); (porCarpeta[p.carpeta] = porCarpeta[p.carpeta] || []).push(Object.assign({ sub: p.sub, archivo: p.archivo }, d)); });
    var armar = function (clave, lado, lista) {
      lista = (lista || []).slice().sort(function (a, b) { return a.archivo.localeCompare(b.archivo); });
      var subs = SUBS[lado].map(function (s) {
        var ds = lista.filter(function (d) { return d.sub === s.clave; });
        if (s.clave) ds.sort(function (a, b) { return b.archivo.localeCompare(a.archivo); });   // sesiones y llamadas: lo más nuevo arriba
        return Object.assign({ docs: ds }, s);
      });
      // Subcarpetas que no conoce el panel (las creaste en tu compu): van al final, con su nombre
      lista.forEach(function (d) {
        if (!subs.some(function (s) { return s.clave === d.sub; })) subs.push({ clave: d.sub, nombre: d.sub.charAt(0).toUpperCase() + d.sub.slice(1).replace(/-/g, " "), ico: "carpeta", ayuda: "", docs: [] });
        if (subs.find(function (s) { return s.clave === d.sub; }).docs.indexOf(d) < 0) subs.find(function (s) { return s.clave === d.sub; }).docs.push(d);
      });
      var ult = lista.reduce(function (m, d) { return String(d.actualizado || "") > m ? String(d.actualizado) : m; }, "");
      return { clave: clave, lado: lado, subs: subs, total: lista.length, actualizado: ult, docs: lista };
    };
    out.nosotros = armar("nosotros", "nosotros", porCarpeta.nosotros);
    var vistas = {};
    (clientes || []).forEach(function (c) {
      var k = c.carpeta || c.id;
      if (!k || vistas[k]) return; vistas[k] = true;
      out.clientes.push(Object.assign(armar(k, "clientes", porCarpeta[k]), { cliente: c, nombre: c.negocio || k }));
    });
    Object.keys(porCarpeta).forEach(function (k) {
      if (k === "nosotros" || vistas[k]) return;
      out.clientes.push(Object.assign(armar(k, "clientes", porCarpeta[k]), { cliente: null, nombre: k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, " ") }));
    });
    // Primero los activos; dentro, lo último que tocaste
    var peso = function (f) { return f.cliente ? { activo: 0, pausado: 1, terminado: 2 }[f.cliente.estado] || 0 : 1; };
    out.clientes.sort(function (a, b) { return peso(a) - peso(b) || String(b.actualizado).localeCompare(String(a.actualizado)) || a.nombre.localeCompare(b.nombre); });
    return out;
  }
  /** De los 6 documentos base, cuántos están y cuántos dicen todavía «Falta». */
  function avanceBase(carpeta) {
    var base = carpeta.subs.find(function (s) { return s.clave === ""; }), docs = base ? base.docs : [];
    var estan = BASE.filter(function (b) { return docs.some(function (d) { return d.archivo === b.archivo; }); });
    var llenos = estan.filter(function (b) { var d = docs.find(function (x) { return x.archivo === b.archivo; }); return d && !d.faltas; });
    return { estan: estan.length, llenos: llenos.length, total: BASE.length, faltan: BASE.length - estan.length };
  }
  /** Busca en títulos y en la primera línea. */
  function buscar(docs, q) {
    var t = slug(q).replace(/-/g, " ").trim();
    if (!t) return [];
    var palabras = t.split(" ");
    return (docs || []).filter(function (d) { var h = slug(d.titulo + " " + (d.vista || "") + " " + d.ruta).replace(/-/g, " "); return palabras.every(function (p) { return h.indexOf(p) >= 0; }); });
  }
  /** Para pegar en una conversación con Claude: de dónde sale y el documento entero. */
  function paraClaude(ruta, texto) { return "Documento de mi panel (" + ruta + "):\n\n" + normalizar(texto); }

  return {
    RUTA: RUTA, MAX_TEXTO: MAX_TEXTO, SUBS: SUBS, BASE: BASE, TIPOS_SESION: TIPOS_SESION,
    rutaValida: rutaValida, slug: slug, partes: partes, dondeVive: dondeVive, rutaLibre: rutaLibre,
    normalizar: normalizar, titulo: titulo, vista: vista, faltas: faltas,
    html: html, inline: inline, indice: indice,
    plantillaCliente: plantillaCliente, plantillaSesion: plantillaSesion, rutaSesion: rutaSesion, limpiarTranscripcion: limpiarTranscripcion,
    arbol: arbol, avanceBase: avanceBase, buscar: buscar, paraClaude: paraClaude, fechaCorta: fechaCorta
  };
});
