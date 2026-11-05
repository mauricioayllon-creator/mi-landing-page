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
- Domix (public/clientes/domix) es anterior al motor: todo está dentro de su index.html.
