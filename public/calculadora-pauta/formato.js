/* Calculadora de Pauta: leer y escribir números al estilo de Bolivia (1.500,50). */
(function (raiz) {
  'use strict';

  // Acepta "1.500", "1500", "3,75" y "3.75". Un solo punto con 3 cifras detrás es separador de miles.
  function leerNumero(texto) {
    if (typeof texto === 'number') return Number.isFinite(texto) ? texto : 0;
    let limpio = String(texto == null ? '' : texto).replace(/[^\d.,]/g, '');
    if (!limpio) return 0;
    if (limpio.includes(',')) {
      limpio = limpio.replace(/\./g, '').replace(',', '.');
    } else {
      const partes = limpio.split('.');
      const esMiles = partes.length > 2 || (partes.length === 2 && partes[1].length === 3 && Number(partes[0]) > 0);
      if (esMiles) limpio = partes.join('');
    }
    const numero = parseFloat(limpio);
    return Number.isFinite(numero) ? numero : 0;
  }

  function num(n, decimales) {
    if (!Number.isFinite(n)) return '—';
    const fijo = Math.abs(n).toFixed(decimales || 0);
    const partes = fijo.split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const signo = n < 0 && Number(fijo) !== 0 ? '−' : '';
    return signo + entero + (partes[1] ? ',' + partes[1] : '');
  }

  // Decimales solo cuando aportan: 8,75 · 12,5 · 350 · 1.500
  function corto(n, maxDecimales) {
    if (!Number.isFinite(n)) return '—';
    const tamano = Math.abs(n);
    let decimales = tamano >= 100 ? 0 : tamano >= 10 ? 1 : 2;
    if (maxDecimales != null) decimales = Math.min(decimales, maxDecimales);
    return num(n, decimales).replace(/,(\d*?)0+$/, (todo, resto) => (resto ? ',' + resto : ''));
  }

  function bs(n) {
    if (!Number.isFinite(n)) return '—';
    return (n < 0 ? '−' : '') + 'Bs ' + corto(Math.abs(n));
  }

  function entero(n) {
    return Number.isFinite(n) ? num(Math.round(n), 0) : '—';
  }

  // 0,05 → "5 de cada 100"
  function de100(fraccion) {
    return Number.isFinite(fraccion) ? corto(fraccion * 100, 1) + ' de cada 100' : '—';
  }

  // 0,75 → "75%"
  function pct(fraccion) {
    return Number.isFinite(fraccion) ? corto(fraccion * 100, 0) + '%' : '—';
  }

  // Para mostrar un valor dentro de una casilla de escritura.
  function paraCasilla(n) {
    if (!Number.isFinite(n) || n === 0) return '';
    return corto(n);
  }

  function plural(n, uno, varios) {
    return Math.round(n) === 1 ? uno : varios;
  }

  raiz.CalcPauta = raiz.CalcPauta || {};
  raiz.CalcPauta.formato = { leerNumero, corto, bs, entero, de100, pct, paraCasilla, plural };
})(typeof window !== 'undefined' ? window : globalThis);
