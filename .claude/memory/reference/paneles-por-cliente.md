# Paneles por cliente (/clientes/<cliente>)

- Link público: mauricio-ayllon.com/clientes/<cliente> (rewrite en next.config.ts).
- Motor compartido: public/clientes/motor/panel.js + panel.css.
- Cada cliente: public/clientes/<cliente>/index.html (cáscara) + datos.json (TODO el contenido).
- Para actualizar un panel (ej. después de una sesión, desde las transcripciones / carpetas .md
  del panel de documentos: clientes/<carpeta>/...), se edita SOLO datos.json:
  - plan.dia1 = fecha del día 1 (null = por agendar → el calendario dice "por agendar").
  - hitos/sesiones usan "fecha" (fija) o "dia" (relativo al día 1).
  - novedades: agregar una entrada por sesión, con fecha.
- La carpeta del cliente usa el mismo slug que la carpeta de documentos (ej. gada-accesorios).
- Domix y GADA usan el motor. Para un cliente nuevo: copiar la cáscara index.html de otro y escribir su datos.json.
- Agenda: herramientas/paneles-agenda/Codigo.gs (Apps Script en la hoja "Agenda de paneles" de Mauricio, con
  Google Calendar API). public/clientes/motor/config.js → AGENDA_ENDPOINT (vacío = sin agenda y sin clave).
  Con endpoint: el panel pide clave (?k= o guardada), lee sesiones de la hoja y agenda (crea evento con Meet
  en su calendario e invita al cliente). Sesiones de datos.json con "id" + "agendable"; "ancla": true = al
  agendarla se vuelve plan.dia1. Las agendadas viven en la hoja (pestaña Sesiones), no en datos.json.
