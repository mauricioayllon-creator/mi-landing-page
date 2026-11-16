# Calculadora de Pauta (/calculadora-pauta)

- Link público: mauricio-ayllon.com/calculadora-pauta (rewrite en next.config.ts). Es otra herramienta, distinta de la
  Calculadora de Oferta (/calculadora): esta responde si a un negocio le conviene pautar, cuánto poner y qué arreglar primero.
- Vive en public/calculadora-pauta y no tiene paso de construcción: los archivos se sirven tal cual. Si cambias uno,
  sube el `?v=` de index.html para que no quede la versión vieja en el navegador.
- Archivos: motor.js (las cuentas, sin pantalla) · formato.js (números al estilo 1.500,50) · campos.js (preguntas, ayudas
  y mini cuentas) · fichas-negocio.js y fichas-sistema.js (la explicación de cada número) · textos.js (veredicto, qué
  arreglar, plan de 30 días, resumen) · pintar.js (arma y actualiza la pantalla) · hoja.js (la hoja que se abre al tocar
  algo y la guía paso a paso) · app.js (guardado en el navegador, toques, deshacer).
- Regla del dueño (Mauricio, noviembre de 2026): cada número es un botón que abre qué es, cómo sale con sus números, para
  qué sirve, cómo mejorarlo y «prueba qué pasa si…». Tiene que poder usarla alguien que no sabe de publicidad: guía de 5
  preguntas, ayuda en cada pregunta y mini cuentas para quien no sabe un número. Lenguaje simple, como en la Calculadora
  de Oferta: sin siglas en la pantalla principal (el nombre técnico solo aparece dentro de la hoja de cada número).
- Los números de ejemplo (ticket 350, quedan 50 de cada 100, Bs 1.500 de pauta, conversación a Bs 5, cierre 5) son un
  ejemplo, no promedios de Bolivia. No presentarlos como datos del mercado.
- Supuestos que se pueden cambiar en motor.js: 50 resultados por semana por conjunto de anuncios (referencia de Meta,
  publicación del 21/10/2026), colchón sano de 40%, 10 ventas para confiar en el número, mes de 30 días.
- Para probar las cuentas sin navegador: cargar formato.js y motor.js con Node y llamar a CalcPauta.motor.calcular(datos).
