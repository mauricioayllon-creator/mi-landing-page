/**
 * Ventana para agendar o mover una sesión desde el panel del cliente.
 * Manda la sesión al programa de tu hoja (herramientas/paneles-agenda/Codigo.gs), que crea el evento
 * en tu Google Calendar con Google Meet e invita los correos. Lo usan los dos: tú y el cliente.
 */
(function () {
  "use strict";
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function largo(s) { var p = s.split("-").map(Number), f = new Date(p[0], p[1] - 1, p[2]); return DIAS[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()]; }

  function abrir(AG, s, hoy) {
    cerrar();
    var nueva = !!s.nueva;
    var m = document.createElement("div");
    m.className = "modal";
    m.id = "modalAgenda";
    m.innerHTML = "<div class='modal-caja card' role='dialog' aria-modal='true' aria-labelledby='agTitulo'>" +
      "<h2 id='agTitulo'>" + (nueva ? "Agendar una nueva sesión" : (s.fecha ? "Cambiar fecha · " : "Agendar · ") + esc(s.titulo)) + "</h2>" +
      "<p class='mudo'>Al guardar, les llega la invitación por correo y la sesión aparece en su Google Calendar.</p>" +
      "<form id='agForm'>" +
      (nueva ? "<label>Nombre de la sesión<input id='agTit' maxlength='80' placeholder='Ej: Sesión 3 · Revisión de resultados' required></label>" : "") +
      "<div class='fila2'><label>Día<input id='agFecha' type='date' min='" + hoy + "' value='" + esc(s.fecha && s.fecha >= hoy ? s.fecha : "") + "' required></label>" +
      "<label>Hora (Bolivia)<input id='agHora' type='time' step='900' value='" + esc(s.hora || "19:00") + "' required></label></div>" +
      "<label>Duración<select id='agDur'>" + [30, 45, 60, 90, 120].map(function (d) { return "<option value='" + d + "'" + (d === (s.duracion || 60) ? " selected" : "") + ">" + (d < 60 ? d + " minutos" : d === 60 ? "1 hora" : d === 90 ? "1 hora y media" : "2 horas") + "</option>"; }).join("") + "</select></label>" +
      "<label>Correos que reciben la invitación<input id='agCorreos' type='text' inputmode='email' autocomplete='email' autocapitalize='off' spellcheck='false' value='" + esc(AG.correos) + "' placeholder='nombre@gmail.com' required>" +
      "<small>Si son varios, sepáralos con comas. Mauricio ya va incluido.</small></label>" +
      "<label class='check'><input id='agMeet' type='checkbox'" + (s.meet === false ? "" : " checked") + "> Crear link de Google Meet</label>" +
      "<p class='err' id='agErr'></p>" +
      "<div class='botones'><button type='button' class='btn' id='agCancelar'>Cancelar</button><button type='submit' class='btn azul' id='agOk'>Agendar y enviar invitación</button></div>" +
      "</form></div>";
    document.body.appendChild(m);
    document.body.classList.add("con-modal");
    m.addEventListener("click", function (ev) { if (ev.target === m) cerrar(); });
    document.getElementById("agCancelar").onclick = cerrar;
    document.addEventListener("keydown", alEscape);
    setTimeout(function () { var x = document.getElementById(nueva ? "agTit" : "agFecha"); if (x) x.focus(); }, 30);

    document.getElementById("agForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var err = document.getElementById("agErr"), ok = document.getElementById("agOk");
      var correos = document.getElementById("agCorreos").value.split(/[\s,;]+/).filter(Boolean);
      var malo = correos.filter(function (c) { return !CORREO.test(c); })[0];
      if (!correos.length) { err.textContent = "Escribe al menos un correo."; return; }
      if (malo) { err.textContent = "Este correo no está bien escrito: " + malo; return; }
      var fecha = document.getElementById("agFecha").value, hora = document.getElementById("agHora").value;
      var cuerpo = {
        accion: "agendar", cliente: AG.cliente, k: AG.clave,
        id: nueva ? "sesion-" + Date.now().toString(36) : s.id,
        titulo: nueva ? document.getElementById("agTit").value.trim() : s.titulo,
        fecha: fecha, hora: hora, duracion: Number(document.getElementById("agDur").value),
        correos: correos.join(", "), meet: document.getElementById("agMeet").checked
      };
      err.textContent = ""; ok.disabled = true; ok.textContent = "Agendando…";
      // text/plain: así el navegador no hace la consulta previa que Google no responde
      fetch(AG.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(cuerpo) })
        .then(function (r) { return r.json(); })
        .then(function (R) {
          if (!R.ok) throw new Error(R.mensaje || "No se pudo agendar.");
          listo(R.sesion);
        })
        .catch(function (e) {
          ok.disabled = false; ok.textContent = "Agendar y enviar invitación";
          err.textContent = (e && e.message && e.message !== "Failed to fetch") ? e.message : "No pudimos conectar. Revisa tu internet e intenta de nuevo.";
        });
    });
  }

  function listo(s) {
    var caja = document.querySelector("#modalAgenda .modal-caja");
    caja.innerHTML = "<div class='hecho'><div class='burbuja'>✅</div><h2>¡Sesión agendada!</h2>" +
      "<p><b>" + esc(s.titulo) + "</b><br>" + esc(largo(s.fecha).replace(/^./, function (c) { return c.toUpperCase(); })) + " a las " + esc(s.hora) + " (hora de Bolivia)</p>" +
      (s.meet ? "<p><a class='btn mini verde' href='" + esc(s.meet) + "' target='_blank' rel='noopener'>🎥 Link de Google Meet</a></p>" : "") +
      "<p class='mudo'>La invitación ya va en camino a su correo. Si usan Gmail, aparece sola en su Google Calendar.</p>" +
      "<button class='btn azul ancho' id='agFin'>Listo</button></div>";
    document.getElementById("agFin").onclick = function () { location.reload(); };
  }

  function alEscape(ev) { if (ev.key === "Escape") cerrar(); }
  function cerrar() {
    var m = document.getElementById("modalAgenda");
    if (m) m.remove();
    document.body.classList.remove("con-modal");
    document.removeEventListener("keydown", alEscape);
  }

  window.Agenda = { abrir: abrir };
})();
