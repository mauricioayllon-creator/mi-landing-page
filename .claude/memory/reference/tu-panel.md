# Tu panel (mauricio-ayllon.com/panel): la única puerta de todo

Pedido de Mauricio (17/11/2026): «Todo está desordenado, tengo que guardar el link de cada cosa y al final no uso nada.
Ordénalo todo dentro del panel, con los mismos colores y la misma marca, y las calculadoras juntas diciendo para qué sirve cada una.»

## Qué es
- `/panel` (sin `?c=`) abre **Tu panel**: entra con la misma contraseña de su panel de trabajo (`gb_clave` en el navegador:
  entrar en uno es entrar en el otro, y «Salir» en cualquiera cierra los dos).
- Cuatro pestañas arriba:
  - **Mi negocio** = su panel de trabajo (`public/panel/admin.html`) adentro de un marco. Hoy, Ventas, Contenido, Clientes, Caja…
  - **Calculadoras** = Oferta (`/calculadora`), Pauta (`/calculadora-pauta`) y Recuperación (el `Simulador` de la propuesta),
    cada una con su pregunta, cuándo se usa y qué te dice. Se abren adentro.
  - **Links** = lo que ven otras personas: su página, la propuesta (con armador del link: tienda, precio, fecha), la demo del
    cupón, el panel de cada cliente («Ver» entra con su clave; «Link y clave» copia el mensaje listo), Belén, Julio y el editor.
  - **Mapa** = el buscador de todo: qué es cada cosa, dónde está y un botón para ir directo.
- La primera vez abre el Mapa; después, Mi negocio. La dirección dice dónde estás: `#negocio/caja`, `#calculadoras/oferta`,
  `#links/cliente/domix`, `#mapa`. Se puede mandar o guardar cualquiera de esas direcciones.

## Dónde está
- Código: `src/features/tu-panel/` (TuPanel.tsx arma todo; MiNegocio, Calculadoras, Links, Mapa, Entrar, Visor).
- **Lo que aparece en cada pestaña sale de `src/features/tu-panel/catalogo.ts`.** Herramienta o página nueva → agrégala ahí,
  en su grupo, con su «para qué». Así aparece en su pestaña y en el Mapa.
- Los paneles de clientes NO se agregan a mano: la página (`src/app/tu-panel/page.tsx`) lee `public/clientes/*/datos.json`
  al publicar. Cliente nuevo → aparece solo en la próxima publicación.
- Las direcciones: `next.config.ts` (`/panel` → `/tu-panel`; con `?c=` sigue abriendo `public/panel/index.html`, el link de la
  campaña de cada cliente; `/admin` lleva a `/panel`). `/dashboard`, `/login` y `/signup` eran plantillas vacías: llevan a `/panel`.

## No romper
- `public/panel/*` lo publica el publicador de la compu (`herramientas/panel-clientes/subir.js`, que NO está en GitHub):
  no se edita a mano desde otra sesión. Tu panel no lo cambia: al abrir Mi negocio solo le esconde el logo repetido
  (`.lado-marca` y `.movil-top .logo-gb`, en MiNegocio.tsx). Si admin.html cambia esas clases, lo peor es ver el logo dos veces.
- Las claves de Links se piden a la hoja con las mismas acciones que usa admin.html (`panel-claves`, `equipo-claves`).
  Si cambian de nombre en Code.gs, «Link y clave» copia solo el link (avisa que la clave está en Mi negocio).
- El Pixel de Meta (`src/app/layout.tsx`) no corre en `/panel` ni cuando una página se ve dentro de un marco (las vistas
  previas de Links): esas visitas son de Mauricio, no de prospectos.
- Las calculadoras detectan que están dentro del panel (`window.self !== window.top`): esconden su título (`.en-panel .marca`)
  y siguen el modo del panel. Fuera del panel siguen el modo del aparato.
- Claro o noche: Tu panel y las calculadoras leen «gb-tema», el mismo ajuste que Mi negocio (sin elegir = noche; «auto» = el
  aparato; «claro»). Si se cambia en Mi negocio, todo cambia al instante. Colores: marca «Noche con luz» (17/11/2026),
  los mismos de public/panel/estilo.css (claros en :root, de noche en [data-theme="dark"]).
- Vercel sirve solo la carpeta public/panel/ cuando alguien abre /panel, ANTES de los rewrites normales. Por eso la regla
  /panel → /tu-panel va en `beforeFiles` de next.config.ts (si va en la lista normal, en Vercel no funciona aunque en la
  compu sí). Cualquier carpeta de public/ con index.html hace lo mismo con su dirección.

## Lo que quedó igual a propósito
- Los paneles de los clientes (`/clientes/<carpeta>`, `body.corto` en `public/clientes/motor/panel.css`) mantienen su
  versión simple del 09/11 (letra del aparato), con los colores «Noche con luz» desde el 17/11. Los ven los clientes.
- La Caja (`caja.html`) y el panel del equipo (`equipo.html`) tienen su propio estilo: los publica el publicador de la compu.
