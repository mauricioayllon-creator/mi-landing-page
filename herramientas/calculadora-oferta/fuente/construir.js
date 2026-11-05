// Arma public/calculadora/index.html juntando las piezas. Uso: node construir.js
// Hace lo mismo que construir.py, para cuando no hay Python en la compu.
const fs = require('fs'), path = require('path');
const d = __dirname;
const r = f => fs.readFileSync(path.join(d, f), 'utf8');
const head = r('p4_markup.html').replace('/*@@CSS4@@*/', () => r('estilos_v4.css'));
const js = ['motor4.js', 'ayudas4.js', 'guia.js', 'ejemplos4.js', 'p4_base.js', 'p4_form.js', 'p4_panel.js', 'p4_lanz.js', 'p4_venta.js', 'p4_resto.js'].map(r).join('\n');
const pagina = head + '<script>\n' + js + '\n</script>\n';
const i = pagina.indexOf('</style>') + '</style>'.length;
const html = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
  + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  + '<meta name="description" content="Calculadora de diagnóstico: cuánto cobrar, qué prometer y si conviene aceptar a un cliente.">\n'
  + '<meta name="robots" content="noindex">\n'
  + pagina.slice(0, i) + '\n</head>\n<body>\n' + pagina.slice(i) + '\n</body>\n</html>\n';
const destino = path.normalize(path.join(d, '../../../public/calculadora/index.html'));
fs.writeFileSync(destino, html, 'utf8');
console.log('Listo:', destino, html.length, 'caracteres');
