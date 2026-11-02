# Arma public/calculadora/index.html juntando las piezas. Uso: python3 construir.py
import os
d = os.path.dirname(os.path.abspath(__file__)) + '/'
r = lambda f: open(d + f, encoding='utf-8').read()
head = r('p4_markup.html').replace('/*@@CSS4@@*/', r('estilos_v4.css'))
js = '\n'.join(r(f) for f in ['motor4.js', 'ayudas4.js', 'guia.js', 'ejemplos4.js', 'p4_base.js', 'p4_form.js', 'p4_panel.js', 'p4_lanz.js', 'p4_resto.js'])
pagina = head + '<script>\n' + js + '\n</script>\n'
i = pagina.index('</style>') + len('</style>')
html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="description" content="Calculadora de diagnóstico: cuánto cobrar, qué prometer y si conviene aceptar a un cliente.">\n'
        '<meta name="robots" content="noindex">\n'
        + pagina[:i] + '\n</head>\n<body>\n' + pagina[i:] + '\n</body>\n</html>\n')
destino = os.path.normpath(d + '../../../public/calculadora/index.html')
open(destino, 'w', encoding='utf-8').write(html)
print('Listo:', destino, len(html), 'caracteres')
