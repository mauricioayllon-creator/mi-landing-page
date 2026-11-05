# Agenda de los paneles por cliente

Con esto, desde el panel de cada cliente (mauricio-ayllon.com/clientes/...) tú o el cliente pueden
agendar o mover una sesión. Al guardar:

- se crea la reunión en **tu** Google Calendar, con link de **Google Meet**;
- Google le manda la **invitación** al correo del cliente (si usa Gmail, aparece sola en su calendario);
- el panel muestra la sesión a los dos (y si es la sesión que arranca el plan, se llena todo el calendario);
- a ti te llega un **correo de aviso**.

El programa (`Codigo.gs`) vive en una hoja de Google tuya. Se instala una sola vez:

1. Con la cuenta de Google de tu calendario, crea una hoja nueva: **Agenda de paneles**.
2. En la hoja: **Extensiones → Apps Script**. Borra lo que aparece, pega todo `Codigo.gs` y guarda (💾).
3. A la izquierda, en **Servicios**, toca **+**, elige **Google Calendar API** y **Agregar**.
4. Arriba, elige la función **configurar** y toca **Ejecutar**. Google te pide permisos:
   **Revisar permisos → tu cuenta → Configuración avanzada → Ir a … (no seguro) → Permitir**.
   (Sale ese aviso porque es un programa tuyo que Google no revisó; es normal.)
   Esto crea las pestañas **Clientes** y **Sesiones**, con una clave y un link para cada cliente.
5. **Implementar → Nueva implementación**. En el engranaje elige **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   Toca **Implementar** y copia la URL que termina en **/exec**.
6. Pásale esa URL a Claude: la pone en `public/clientes/motor/config.js` y publica.

Desde ese momento cada panel pide su clave. El link para mandar a cada cliente está en la pestaña
**Clientes** (columna *link*): ya trae la clave, así que el cliente entra directo.

## Después

- **Cliente nuevo:** agrega una fila en **Clientes** (cliente = el nombre de su carpeta, ej. `gada-accesorios`,
  y su nombre) y vuelve a ejecutar **configurar**: le crea clave y link.
- **Cambiar una clave:** escribe la nueva en la columna *clave* y ejecuta **configurar** (actualiza el link).
- **Que tu equipo vaya siempre invitado** (ej. Belén): pon su correo en `EQUIPO`, arriba en el código.
- **Si cambias el código:** Implementar → Gestionar implementaciones → ✏️ → Versión: **Nueva versión** → Implementar.
  (La URL /exec no cambia.)
- **Cancelar una sesión:** bórrala de tu Google Calendar y borra su fila en **Sesiones**.
