/**
 * Agenda de los paneles por cliente · Grow Business
 *
 * Vive dentro de una hoja de Google tuya ("Agenda de paneles"). Los paneles de mauricio-ayllon.com/clientes/...
 * le hablan a este programa para:
 *   - ver las sesiones agendadas de un cliente (y comprobar su clave), y
 *   - agendar o mover una sesión: crea el evento en TU Google Calendar, con Google Meet,
 *     e invita los correos del cliente. Google les manda la invitación y aparece en su calendario.
 * Cada vez que alguien agenda o mueve algo desde un panel, te llega un correo de aviso.
 *
 * Cómo instalarlo: LEEME.md (en esta misma carpeta).
 */

var TZ = "America/La_Paz";                                // la hora de todas las sesiones
var SITIO = "https://mauricio-ayllon.com/clientes/";
var EQUIPO = [];                                           // correos de tu equipo que siempre van invitados, ej. ["belen@gmail.com"]
var DURACIONES = [30, 45, 60, 90, 120];
var CLIENTES_INICIALES = [["gada-accesorios", "GADA Accesorios"], ["domix", "Domix"]];

/* =====================================================================
   1) Ejecuta esto una vez (y cada vez que agregues un cliente nuevo en la pestaña Clientes).
   ===================================================================== */
function configurar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cli = hoja_(ss, "Clientes", ["cliente", "nombre", "clave", "correos", "link"]);
  hoja_(ss, "Sesiones", ["cliente", "id", "titulo", "fecha", "hora", "duracion", "correos", "meet", "eventoId", "actualizado"]);
  CLIENTES_INICIALES.forEach(function (c) {
    if (!filaDe_(cli, c[0])) cli.appendRow([c[0], c[1], "", "", ""]);
  });
  // a cada cliente sin clave le inventa una, y le arma su link
  var v = cli.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (!v[i][0]) continue;
    var clave = String(v[i][2] || "") || Utilities.getUuid().replace(/-/g, "").slice(0, 10);
    cli.getRange(i + 1, 3).setValue(clave);
    cli.getRange(i + 1, 5).setValue(SITIO + v[i][0] + "?k=" + clave);
  }
  // para que Google te pida los permisos de una vez
  Calendar.Calendars.get("primary");
  MailApp.getRemainingDailyQuota();
}

/* =====================================================================
   2) Lo que llama el panel.
   ===================================================================== */
function doGet(e) {
  var p = (e && e.parameter) || {};
  return responder_(function () {
    if (p.accion === "citas") return { ok: true, citas: citas_(p.cliente) };
    var c = cliente_(p.cliente, p.k);
    return { ok: true, nombre: c.nombre, correos: c.correos, sesiones: sesiones_(c.cliente) };
  });
}

function doPost(e) {
  return responder_(function () {
    var b = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var c = cliente_(b.cliente, b.k);
    if (b.accion !== "agendar") throw fallo_("datos", "Acción desconocida.");
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try { return { ok: true, sesion: agendar_(c, b) }; }
    finally { lock.releaseLock(); }
  });
}

/* =====================================================================
   Por dentro
   ===================================================================== */
function agendar_(c, b) {
  var id = String(b.id || "");
  if (!/^[a-z0-9-]{1,40}$/.test(id)) throw fallo_("datos", "Sesión no válida.");
  var titulo = String(b.titulo || "").trim().slice(0, 80) || "Sesión";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "") || !/^\d{2}:\d{2}$/.test(b.hora || "")) throw fallo_("datos", "Revisa la fecha y la hora.");
  var dur = Number(b.duracion);
  if (DURACIONES.indexOf(dur) < 0) dur = 60;
  var correos = String(b.correos || "").toLowerCase().split(/[\s,;]+/).filter(Boolean);
  if (!correos.length) throw fallo_("datos", "Escribe al menos un correo.");
  if (correos.length > 6) throw fallo_("datos", "Máximo 6 correos.");
  correos.forEach(function (m) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) throw fallo_("datos", "Este correo no está bien escrito: " + m); });

  var ini = Utilities.parseDate(b.fecha + " " + b.hora, TZ, "yyyy-MM-dd HH:mm");
  if (ini.getTime() < Date.now() - 5 * 60000) throw fallo_("datos", "Esa fecha y hora ya pasaron.");
  var fin = new Date(ini.getTime() + dur * 60000);

  var hs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sesiones");
  var fila = filaDe_(hs, c.cliente, id);
  var previo = fila ? hs.getRange(fila, 1, 1, 10).getValues()[0] : null;
  var conMeet = b.meet !== false;

  var invitados = unicos_(correos.concat(EQUIPO)).map(function (m) { return { email: m }; });
  var recurso = {
    summary: titulo + " · " + c.nombre + " × Grow Business",
    description: "Sesión agendada desde el panel de " + c.nombre + ".\nPanel: " + SITIO + c.cliente,
    start: { dateTime: ini.toISOString(), timeZone: TZ },
    end: { dateTime: fin.toISOString(), timeZone: TZ },
    attendees: invitados,
    status: "confirmed"
  };
  var opciones = { conferenceDataVersion: 1, sendUpdates: "all" };
  var ev = null;
  if (previo && previo[8]) {
    try {
      if (conMeet && !previo[7]) recurso.conferenceData = pedirMeet_();
      ev = Calendar.Events.patch(recurso, "primary", String(previo[8]), opciones);
    } catch (err) { ev = null; }          // la borraron del calendario: creamos una nueva
  }
  if (!ev) {
    if (conMeet) recurso.conferenceData = pedirMeet_();
    ev = Calendar.Events.insert(recurso, "primary", opciones);
  }
  var meet = ev.hangoutLink || "";

  var ahora = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm");
  var datos = [c.cliente, id, titulo, b.fecha, b.hora, String(dur), correos.join(", "), meet, ev.id, ahora];
  if (fila) hs.getRange(fila, 1, 1, 10).setValues([datos]); else hs.appendRow(datos);
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Clientes").getRange(c.fila, 4).setValue(correos.join(", "));

  try {
    var cuando = Utilities.formatDate(ini, TZ, "EEEE d 'de' MMMM, HH:mm");
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
      "📅 " + c.nombre + ": " + (previo ? "se movió" : "se agendó") + " " + titulo,
      titulo + "\n" + cuando + " (hora de Bolivia) · " + dur + " min\n" +
      (meet ? "Meet: " + meet + "\n" : "") + "Invitados: " + correos.join(", ") + "\n\nHecho desde el panel: " + SITIO + c.cliente);
  } catch (err) { /* el aviso no es crítico */ }

  return { id: id, titulo: titulo, fecha: b.fecha, hora: b.hora, duracion: dur, meet: meet };
}

/* Cómo aparece cada cliente en tu calendario. Cliente nuevo: una línea aquí, o usa el botón «Agendar» de tu panel. */
var BUSCA = { "domix": "domix|marvin", "gada-accesorios": "gada|deborah|d[eé]bora", "paola-silva": "paola", "ariel-uyuni": "ariel", "rodrigo-aduanas": "rodrigo", "peques": "peque" };

/* Las sesiones de un cliente, leídas en vivo de tu calendario. Solo las suyas: nunca las de otro ni tus llamadas de venta. */
function citas_(slug) {
  slug = String(slug || "");
  if (!/^[a-z0-9-]{1,50}$/.test(slug)) throw fallo_("datos", "Cliente no válido.");
  var re = BUSCA[slug] ? new RegExp(BUSCA[slug], "i") : null, marca = "[gb:" + slug + ":";
  var ini = Utilities.parseDate(Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd") + " 00:00", TZ, "yyyy-MM-dd HH:mm");
  var r = Calendar.Events.list("primary", { timeMin: ini.toISOString(), timeMax: new Date(ini.getTime() + 75 * 864e5).toISOString(), singleEvents: true, orderBy: "startTime", maxResults: 250 });
  return (r.items || []).filter(function (ev) {
    if (ev.status === "cancelled" || !ev.start || !ev.start.dateTime) return false;
    if (String(ev.description || "").indexOf(marca) >= 0) return true;
    return !!re && re.test(ev.summary || "") && !/\blead\b/i.test(ev.summary || "");
  }).map(function (ev) {
    var d = new Date(ev.start.dateTime), m = String(ev.description || "").match(/\[gb:[a-z0-9-]+:([a-z0-9]+)\]/);
    return { titulo: String(ev.summary || ""), f: Utilities.formatDate(d, TZ, "yyyy-MM-dd"), h: Utilities.formatDate(d, TZ, "HH:mm"), meet: ev.hangoutLink || "", paso: m ? m[1] : "" };
  });
}

function sesiones_(slug) {
  var v = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sesiones").getDataRange().getValues().slice(1);
  return v.filter(function (r) { return String(r[0]) === String(slug) && r[3]; }).map(function (r) {
    return { id: String(r[1]), titulo: String(r[2]), fecha: String(r[3]), hora: String(r[4]), duracion: Number(r[5]) || 60, meet: String(r[7] || "") };
  });
}

function cliente_(slug, clave) {
  var h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Clientes");
  var v = h.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]) !== String(slug || "")) continue;
    if (clave && String(v[i][2]) === String(clave)) return { fila: i + 1, cliente: String(v[i][0]), nombre: String(v[i][1]), correos: String(v[i][3] || "") };
    break;
  }
  throw fallo_("clave", "La clave no es correcta.");
}

function hoja_(ss, nombre, cabecera) {
  var h = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  h.getRange("A:Z").setNumberFormat("@");   // todo como texto: que la hoja no convierta fechas ni claves
  if (!h.getLastRow()) h.appendRow(cabecera);
  h.setFrozenRows(1);
  return h;
}
function filaDe_(h, cliente, id) {
  var v = h.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === cliente && (id == null || String(v[i][1]) === id)) return i + 1;
  return 0;
}
function pedirMeet_() { return { createRequest: { requestId: Utilities.getUuid(), conferenceSolutionKey: { type: "hangoutsMeet" } } }; }
function unicos_(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }
function fallo_(codigo, mensaje) { var e = new Error(mensaje); e.codigo = codigo; return e; }
function responder_(fn) {
  var r;
  try { r = fn(); } catch (err) { r = { ok: false, error: err.codigo || "error", mensaje: String((err && err.message) || err) }; }
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}
