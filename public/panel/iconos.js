/**
 * Íconos (trazos al estilo Lucide), el anillo de progreso y las piezas del motor (engranajes y barra). Los usan las dos páginas.
 *   ICO("camara", 20)  ·  icoPaso("Grabación")  ·  icoVideo("edicion")  ·  anillo(44, 132, 11)
 *   rueda("girando", "camara", 48)  ·  engIco(engranaje)  ·  motorBarra(GB.motor(...))  ·  trio("girando", "camara")
 */
(function (raiz) {
  "use strict";
  var T = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    derecha: '<path d="m9 18 6-6-6-6"/>',
    atras: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    arriba: '<path d="m5 12 7-7 7 7M12 19V5"/>',
    abajo: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    afuera: '<path d="M7 17 17 7M7 7h10v10"/>',
    cohete: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    lapiz: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    camara: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    tijera: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    megafono: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    grafica: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    gente: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    bandera: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    trofeo: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    brillo: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    llave: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    luna: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    alerta: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    tareas: '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
    bajar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    copiar: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    ojo: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    globo: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    calendario: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    billetera: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    diana: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    recargar: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    enlace: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    ajustes: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    casa: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    basura: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    persona: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    rayo: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"/>',
    enviar: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    pelicula: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M17 7.5h4M17 16.5h4"/>',
    foco: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
    candado: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    puntos: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    libro: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    ayuda: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    pausa: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    mano: '<path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    tienda: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.6-.6.7.7 0 0 0-.8 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.6-.6.7.7 0 0 0-.8 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.6-.6.7.7 0 0 0-.8 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.6-.6.7.7 0 0 0-.8 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
    regalo: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    apreton: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
    capas: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    cuaderno: '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><path d="M21.38 5.38a2.12 2.12 0 0 0-3-3L12 8.77V11h2.23Z"/>',
    estrella: '<path d="M11.52 2.3a.53.53 0 0 1 .96 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.02a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z"/>',
    telefono: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    buscar: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    embudo: '<path d="M10 20a1 1 0 0 0 .55.89l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .52-1.34L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.74 1.67l7.22 7.99A2 2 0 0 1 10 14z"/>',
    brujula: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.8 5.4a2 2 0 0 1-1.28 1.28l-5.4 1.8 1.8-5.4a2 2 0 0 1 1.28-1.28z"/>',
    ruta: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'
  };
  var LLENOS = {
    whatsapp: '<path d="M17.47 14.38c-.29-.15-1.71-.84-1.98-.94-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5h-.55c-.19 0-.51.07-.77.36-.27.29-1.01.99-1.01 2.41s1.04 2.8 1.18 2.99c.15.19 2.04 3.12 4.95 4.37.69.3 1.23.48 1.65.61.69.22 1.33.19 1.83.12.56-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.7L.55 23.62l6.04-1.58a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.07z"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z"/>'
  };
  /** El contorno de un engranaje (dientes trapezoidales), centrado en cx, cy. Con rHueco deja un agujero al medio. */
  function cogPath(cx, cy, rExt, rInt, n, rHueco) {
    var d = "", paso = 2 * Math.PI / n;
    function pt(r, a) { return (cx + r * Math.cos(a)).toFixed(2) + " " + (cy + r * Math.sin(a)).toFixed(2); }
    for (var i = 0; i < n; i++) {
      var a = i * paso - Math.PI / 2;
      d += (i ? " L" : "M") + pt(rInt, a - paso * 0.27) + " L" + pt(rExt, a - paso * 0.15) + " L" + pt(rExt, a + paso * 0.15) + " L" + pt(rInt, a + paso * 0.27) +
        " A" + rInt + " " + rInt + " 0 0 1 " + pt(rInt, a + paso - paso * 0.27);
    }
    d += " Z";
    if (rHueco) d += " M" + (cx + rHueco) + " " + cy + " A" + rHueco + " " + rHueco + " 0 1 0 " + (cx - rHueco) + " " + cy + " A" + rHueco + " " + rHueco + " 0 1 0 " + (cx + rHueco) + " " + cy + " Z";
    return d;
  }
  LLENOS.engranaje = '<path fill-rule="evenodd" d="' + cogPath(12, 12, 11, 8.4, 8, 3.6) + '"/>';
  function ico(nombre, tam) {
    tam = tam || 20;
    var a = ' class="i" viewBox="0 0 24 24" width="' + tam + '" height="' + tam + '" aria-hidden="true"';
    if (LLENOS[nombre]) return "<svg" + a + ' fill="currentColor">' + LLENOS[nombre] + "</svg>";
    return "<svg" + a + ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (T[nombre] || T.diana) + "</svg>";
  }
  /** El ícono de un paso según su nombre (las plantillas usan estas palabras). */
  function icoPaso(nombre) {
    var n = String(nombre || "").toLowerCase();
    var reglas = [[/pago|bienvenid/, "brillo"], [/arranque|acceso/, "llave"], [/guion/, "lapiz"], [/grab/, "camara"], [/edici/, "tijera"],
      [/al aire|primer video/, "cohete"], [/ganador/, "estrella"], [/oferta|reservas/, "regalo"], [/últimos|ultimos/, "megafono"], [/mes arranca/, "calendario"],
      [/publicidad|semana de videos|videos y/, "megafono"], [/reporte/, "grafica"], [/práctica|practica|equipo/, "gente"],
      [/promo|día de|dia de|lanzamiento/, "bandera"], [/resultado/, "trofeo"]];
    for (var i = 0; i < reglas.length; i++) if (reglas[i][0].test(n)) return reglas[i][1];
    return "diana";
  }
  var VIDEO = { guion: "lapiz", grabado: "camara", edicion: "tijera", aprobar: "ojo", cambios: "globo", aprobado: "check", publicado: "play" };
  function icoVideo(estado) { return VIDEO[estado] || "pelicula"; }
  /** Anillo de progreso: se llena con una animación al aparecer (clase .anillo-v). */
  function anillo(pct, tam, grosor, clase) {
    tam = tam || 120; grosor = grosor || 10;
    var r = (tam - grosor) / 2, c = 2 * Math.PI * r, lleno = Math.max(0, Math.min(100, pct)) / 100 * c;
    return '<svg class="anillo ' + (clase || "") + '" width="' + tam + '" height="' + tam + '" viewBox="0 0 ' + tam + " " + tam + '" aria-hidden="true">' +
      '<circle class="pista" cx="' + tam / 2 + '" cy="' + tam / 2 + '" r="' + r + '" stroke-width="' + grosor + '" fill="none"/>' +
      '<circle class="avance" cx="' + tam / 2 + '" cy="' + tam / 2 + '" r="' + r + '" stroke-width="' + grosor + '" fill="none" stroke-linecap="round" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + c.toFixed(1) + '" data-fin="' + (c - lleno).toFixed(1) + '" transform="rotate(-90 ' + tam / 2 + " " + tam / 2 + ')"/></svg>';
  }
  // ---------- el motor: engranajes que giran y la barra ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var COG10 = cogPath(50, 50, 49, 40, 10, 0), COG8 = cogPath(50, 50, 49, 38, 8, 0);
  /**
   * Un paso como engranaje grande. estado: listo | falta | girando | trabado | riesgo | espera.
   * extra: clases más (por ejemplo "quieto" para que no gire).
   */
  function rueda(estado, icono, tam, extra) {
    tam = tam || 48;
    return '<span class="rueda e-' + estado + (extra ? " " + extra : "") + '" style="width:' + tam + "px;height:" + tam + 'px"><svg class="cog" viewBox="0 0 100 100" aria-hidden="true"><path d="' + COG10 + '"/></svg>' +
      '<span class="nucleo">' + ico(estado === "listo" ? "check" : icono, Math.round(tam * 0.36)) + "</span></span>";
  }
  /** El ícono de un engranaje chico (lo que mueve un paso). */
  function icoEngranaje(g) {
    if (g.hecho) return "check";
    if (g.tipo === "paso") return icoPaso(g.en ? g.en.paso.nombre : "");
    if (g.tipo === "tarea") {
      var n = String(g.nombre || "").toLowerCase();
      var reglas = [[/tiktok|acceso/, "llave"], [/publicidad|tarjeta/, "megafono"], [/logo|foto/, "camara"], [/guion/, "lapiz"], [/producto|separas/, "diana"],
        [/equipo|práctica|practica/, "gente"], [/conociste|caja/, "globo"], [/valida|cupón|cupon/, "qr"]];
      for (var i = 0; i < reglas.length; i++) if (reglas[i][0].test(n)) return reglas[i][1];
      return "tareas";
    }
    return { ok: "ojo", pago: "billetera", link: "enlace", opinion: "brillo" }[g.tipo] || "diana";
  }
  function engIco(g, tam) {
    tam = tam || 30;
    return '<span class="engr e-' + g.estado + " q-" + g.quien + '" style="width:' + tam + "px;height:" + tam + 'px"><svg class="cog" viewBox="0 0 100 100" aria-hidden="true"><path d="' + COG8 + '"/></svg>' +
      '<span class="nucleo">' + ico(icoEngranaje(g), Math.round(tam * 0.4)) + "</span></span>";
  }
  /**
   * La barra del motor: un tramo por paso, del ancho de lo que pesa, lleno según su avance. Termina en el objetivo.
   * op = { oscuro, chica (sin botones, para dentro de un link) }.
   */
  function motorBarra(m, op) {
    op = op || {};
    var segs = m.pasos.map(function (x, i) {
      var pct = Math.round(x.avance * 100), aqui = i === m.actual, tit = esc((i + 1) + ". " + x.paso.nombre + " · " + pct + "%");
      var dentro = '<i data-ancho="' + pct + '"></i>' + (aqui ? '<span class="mb-aqui" style="left:' + Math.max(3, Math.min(97, pct)) + '%"></span>' : "");
      return op.chica ? '<span class="mb-seg e-' + x.estado + (aqui ? " actual" : "") + '" style="flex-grow:' + x.peso + '">' + dentro + "</span>"
        : '<button type="button" class="mb-seg e-' + x.estado + (aqui ? " actual" : "") + '" style="flex-grow:' + x.peso + '" data-accion="ir-paso" data-i="' + i + '" title="' + tit + '" aria-label="' + tit + '">' + dentro + "</button>";
    }).join("");
    return '<div class="motor-barra' + (op.oscuro ? " oscuro" : "") + (op.chica ? " chica" : "") + '"><div class="mb-pista">' + segs + "</div>" +
      '<span class="mb-meta' + (m.terminado ? " si" : "") + '" title="El objetivo">' + ico(m.terminado ? "trofeo" : "bandera", op.chica ? 11 : 15) + "</span></div>";
  }
  /** Tres engranajes que engranan (el grande es el paso de ahora). Giran mientras el motor avanza; se traban si algo lo frena. */
  function trio(estado, icono) {
    function g(cx, cy, R, h, n, fase, clase, hueco) {
      return '<g transform="translate(' + cx + " " + cy + ") rotate(" + fase + ')"><g class="' + clase + '"><path fill-rule="evenodd" d="' + cogPath(0, 0, R, R - h, n, hueco ? R * 0.36 : 0) + '"/></g></g>';
    }
    return '<div class="trio e-' + estado + '" aria-hidden="true"><svg viewBox="0 0 190 150">' +
      g(141.4, 50.7, 36, 8, 8, 13, "t2", true) + g(156, 103, 24, 7, 6, 20, "t3", true) + g(64, 82, 56, 9, 12, 0, "t1", false) +
      '</svg><span class="trio-n">' + ico(estado === "listo" ? "trofeo" : icono, 26) + "</span></div>";
  }

  /** Llena los anillos y las barras, y cuenta los números hacia arriba (una vez por elemento). */
  function animar(raizDom, instantaneo) {
    var quieto = instantaneo || window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Array.prototype.forEach.call((raizDom || document).querySelectorAll("[data-ancho]"), function (el) {
      var w = el.getAttribute("data-ancho") + "%"; el.removeAttribute("data-ancho");
      if (quieto) { el.style.width = w; return; }
      el.style.width = "0%";
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.width = w; }); });
    });
    Array.prototype.forEach.call((raizDom || document).querySelectorAll(".anillo .avance[data-fin]"), function (c) {
      var fin = c.getAttribute("data-fin"); c.removeAttribute("data-fin");
      if (quieto) { c.style.strokeDashoffset = fin; return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.style.strokeDashoffset = fin; }); });
    });
    Array.prototype.forEach.call((raizDom || document).querySelectorAll("[data-contar]"), function (el) {
      var txt = el.getAttribute("data-contar"); el.removeAttribute("data-contar");
      var limpio = txt.replace(/[.\s]/g, "").replace(",", ".");
      if (quieto || !/^\d+(\.\d+)?$/.test(limpio)) { el.textContent = txt; return; }
      var meta = parseFloat(limpio), t0 = null, dur = 900;
      function paso(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), v = meta * (1 - Math.pow(1 - k, 3));
        el.textContent = k < 1 ? Math.round(v).toLocaleString("es-BO") : txt;
        if (k < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    });
  }
  raiz.ICO = ico; raiz.icoPaso = icoPaso; raiz.icoVideo = icoVideo; raiz.anillo = anillo; raiz.animarGB = animar;
  raiz.rueda = rueda; raiz.engIco = engIco; raiz.icoEngranaje = icoEngranaje; raiz.motorBarra = motorBarra; raiz.trio = trio;
})(this);
