
// =================== Utilidades ===================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clonar = o => JSON.parse(JSON.stringify(o));
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function nuevoId() { return 'n' + Math.random().toString(36).slice(2, 9); }
function leerLocal(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } }
function guardarLocal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
function usar(nombre) { try { if (window.claude && typeof window.claude.use === 'function') return window.claude.use(nombre); } catch { } return Promise.resolve(null); }
function idSeguro(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return 'a' + (h >>> 0).toString(36); }
function parseNumero(s) {
  if (typeof s === 'number') return Number.isFinite(s) ? s : '';
  s = String(s ?? '').trim().replace(/\s/g, '').replace(/^bs\.?/i, '').replace(/%$/, '');
  if (!s) return '';
  const uc = s.lastIndexOf(','), up = s.lastIndexOf('.');
  if (uc > -1 && up > -1) s = uc > up ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (uc > -1) { const ps = s.split(','); s = ps.length > 2 ? s.replace(/,/g, '') : s.replace(',', '.'); }
  else if (up > -1) { const ps = s.split('.'); if (ps.length > 2 || ps[ps.length - 1].length === 3) s = s.replace(/\./g, ''); }
  const x = parseFloat(s);
  return Number.isFinite(x) ? x : '';
}
// Acepta un número o un rango: "20 a 30", "20-30", "entre 20 y 30"
function parseEntrada(s) {
  if (typeof s === 'number') return Number.isFinite(s) ? s : '';
  const t = String(s ?? '').trim().toLowerCase().replace(/^entre\s+/, '');
  const m = t.match(/^(.+?)\s*(?:\s+a\s+|\s+y\s+|\s+al\s+|–|—|~|-)\s*(.+)$/);
  if (m) {
    const a = parseNumero(m[1]), b = parseNumero(m[2]);
    if (a !== '' && b !== '') return a === b ? a : { min: Math.min(a, b), max: Math.max(a, b) };
  }
  return parseNumero(s);
}
const esRango = x => !!x && typeof x === 'object' && Number.isFinite(x.min) && Number.isFinite(x.max);
function redondear(v, dec) { const f = Math.pow(10, dec); return Math.round(v * f) / f; }
function fmtCorto(x) { if (!Number.isFinite(x)) return '—'; const d = Math.abs(x - Math.round(x)) < 0.005 ? 0 : Math.abs(x * 10 - Math.round(x * 10)) < 0.05 ? 1 : 2; return fmtN(x, d); }
function fmtEntrada(x) { return esRango(x) ? `${fmtCorto(x.min)} a ${fmtCorto(x.max)}` : (x === '' || x === undefined || x === null ? '' : fmtCorto(x)); }
function f1(x) { return fmtN(x, x < 10 && Math.abs(x - Math.round(x)) > 0.05 ? 1 : 0); }
function palabraMoneda(m) { return m === 'Bs' ? 'bolivianos' : m; }
function fraccion(pct, mon) { const w = palabraMoneda(mon); const t = { 10: `1 de cada 10 ${w}`, 20: `1 de cada 5 ${w}`, 25: `1 de cada 4 ${w}`, 50: `la mitad` }; return t[Math.round(pct)] || `${fmtN(pct)} de cada 100 ${w}`; }
function minus1(s) { s = String(s || '').trim(); return s ? s[0].toLowerCase() + s.slice(1) : s; }

// =================== Íconos ===================
const SV = (inner, fill = false) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="#fff" stroke="none"' : 'fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${inner}</svg>`;
const IC = {
  objetivo: SV('<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1.2" fill="#fff"/>'),
  moneda: SV('<circle cx="12" cy="12" r="8.6"/><path d="M14.9 9.3c-.5-.9-1.6-1.4-2.9-1.4-1.6 0-2.8.8-2.8 2.1 0 2.9 5.9 1.5 5.9 4.3 0 1.3-1.3 2.1-3.1 2.1-1.4 0-2.5-.6-3-1.6M12 6.3v1.5M12 16.4v1.5"/>'),
  sube: SV('<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>'),
  reloj: SV('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.1 2"/>'),
  personas: SV('<circle cx="9" cy="8.6" r="3"/><path d="M3.6 19c.6-3 2.8-4.6 5.4-4.6s4.8 1.6 5.4 4.6"/><circle cx="17" cy="9.6" r="2.3"/><path d="M15.9 14.6c2.2.3 3.8 1.7 4.4 4.4"/>'),
  corazon: SV('<path d="M12 20.2s-7.2-4.5-7.2-10.1A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.2 2.8c0 5.6-7.2 10.1-7.2 10.1z"/>', true),
  bolsa: SV('<path d="M5.2 8.2h13.6l-1.1 11.6H6.3L5.2 8.2z"/><path d="M9 8.2V6.8a3 3 0 0 1 6 0v1.4"/>'),
  gema: SV('<path d="M7 4.5h10l3.4 4.8L12 19.8 3.6 9.3 7 4.5z"/><path d="M3.6 9.3h16.8M9.4 4.5 12 9.3l2.6-4.8M12 9.3v10.5"/>'),
  monedas: SV('<ellipse cx="12" cy="7" rx="6.4" ry="2.5"/><path d="M5.6 7v4.9c0 1.4 2.9 2.5 6.4 2.5s6.4-1.1 6.4-2.5V7"/><path d="M5.6 11.9v4.9c0 1.4 2.9 2.5 6.4 2.5s6.4-1.1 6.4-2.5v-4.9"/>'),
  grafico: SV('<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4 3 3 4.5-6"/>'),
  lista: SV('<path d="M9.5 7h10M9.5 12h10M9.5 17h10"/><path d="M4 7l1.2 1.2L7 6.2M4 12l1.2 1.2L7 11.2M4 17l1.2 1.2L7 16.2"/>'),
  pregunta: SV('<circle cx="12" cy="12" r="8.6"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><circle cx="12" cy="17" r=".9" fill="#fff"/>'),
  alerta: SV('<path d="M12 4.2 20.5 19H3.5L12 4.2z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r=".9" fill="#fff"/>'),
  repetir: SV('<path d="M17 4.5l2.5 2.5L17 9.5"/><path d="M4.5 12V10a3 3 0 0 1 3-3h12"/><path d="M7 19.5 4.5 17 7 14.5"/><path d="M19.5 12v2a3 3 0 0 1-3 3h-12"/>'),
  casa: SV('<path d="M4 11 12 4.5 20 11"/><path d="M6.2 9.4V19.5h11.6V9.4"/><path d="M10 19.5v-5h4v5"/>'),
  chispa: SV('<path d="M12 3.5c.6 4.6 2.6 7.3 8.5 8.5-5.9 1.2-7.9 3.9-8.5 8.5-.6-4.6-2.6-7.3-8.5-8.5 5.9-1.2 7.9-3.9 8.5-8.5z"/>', true),
  herramienta: SV('<path d="M14.7 6.3a4 4 0 0 0-5.3 5.2L4.6 16.3a1.6 1.6 0 0 0 2.3 2.3l4.8-4.8a4 4 0 0 0 5.2-5.3l-2.4 2.4-2.1-.4-.4-2.1 2.7-2.1z"/>'),
  calendario: SV('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  sol: SV('<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>'),
  regalo: SV('<rect x="4" y="9" width="16" height="11" rx="1.6"/><path d="M3.5 9h17M12 9v11"/><path d="M12 9c-1.6-3.6-5.4-3.4-5.4-1.4S9.6 9 12 9zM12 9c1.6-3.6 5.4-3.4 5.4-1.4S14.4 9 12 9z"/>'),
  megafono: SV('<path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H7l9 4.5V4L7 8.5H5.5A1.5 1.5 0 0 0 4 10z"/><path d="M8.5 15.8l1 3.7"/><path d="M19 9.5a3.5 3.5 0 0 1 0 5"/>'),
  chat: SV('<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M8 10h8M8 13h5"/>'),
  escudo: SV('<path d="M12 3.6 19 6.3v5.4c0 4.3-3 7.6-7 8.7-4-1.1-7-4.4-7-8.7V6.3l7-2.7z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.6"/>'),
  balanza: SV('<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-2.5 6a2.8 2.8 0 0 0 5 0L5 7zM19 7l-2.5 6a2.8 2.8 0 0 0 5 0L19 7z"/>'),
  camino: SV('<circle cx="6" cy="6.5" r="2.2"/><circle cx="18" cy="17.5" r="2.2"/><path d="M8.2 6.5h6.3a3 3 0 0 1 0 6h-5a3 3 0 0 0 0 6h6.3"/>'),
};
function icoSq(nombre, color) { return `<span class="ico-sq c-${color}" aria-hidden="true">${IC[nombre]}</span>`; }
const ICO = {
  ok: '<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" style="fill:var(--green)"/><path d="M5.8 10.4l2.7 2.7 5.7-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ojo: '<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" style="fill:var(--orange)"/><path d="M10 5.6v5.2" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="1.25" fill="#fff"/></svg>',
  no: '<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" style="fill:var(--red)"/><path d="M6.8 6.8l6.4 6.4M13.2 6.8l-6.4 6.4" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/></svg>',
  na: '<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" style="fill:var(--gray)"/><path d="M6.5 10h7" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/></svg>',
};

// =================== Estado ===================
function normalizarProspecto(p) {
  p = p || {};
  const base = prospectoVacio();
  const out = { ...base, ...p };
  for (const k of ['negocio', 'meta', 'hoy', 'servicio', 'compromiso', 'capacidad', 'plan', 'anuncios']) out[k] = { ...base[k], ...(p[k] || {}) };
  const sb = supuestosBase();
  out.supuestos = {};
  for (const k of Object.keys(sb)) out.supuestos[k] = { ...sb[k], ...(((p.supuestos || {})[k]) || {}) };
  out.lineas = (Array.isArray(p.lineas) && p.lineas.length ? p.lineas : base.lineas).map(l => ({ ...lineaBase(), ...l, id: l.id || nuevoId() }));
  const of = { ...ofertaVacia(), ...(p.oferta || {}) };
  of.bonos = Array.isArray(of.bonos) ? of.bonos.map(b => bonoBase(b)) : [];
  of.segmentos = Array.isArray(of.segmentos) ? of.segmentos.map(s => segmentoBase(s)) : [];
  out.oferta = of;
  out.rangos = {};
  for (const [k, v] of Object.entries(p.rangos || {})) if (esRango(v)) out.rangos[k] = { min: v.min, max: v.max };
  out.escenarioDatos = ['prudente', 'normal', 'optimista'].includes(p.escenarioDatos) ? p.escenarioDatos : 'normal';
  out.foco = p.foco || 'auto';
  out.fuentes = { ...(p.fuentes || {}) };
  out.respuestas = { ...(p.respuestas || {}) };
  out.autollenado = { ...(p.autollenado || {}) };
  return out;
}
const normalizarReglas = r => normalizarReglasMotor(r);
const estado = {
  prospecto: normalizarProspecto(leerLocal('co4.borrador') || { ...ejemploBrisa(), _ejemplo: 'brisa' }),
  reglas: normalizarReglas(leerLocal('co4.reglas') || leerLocal('co3.reglas') || leerLocal('co2.reglas')),
  actualId: leerLocal('co4.actual'),
  abiertas: new Set(),
  paso: leerLocal('co4.paso') || 1,
  guia: leerLocal('co4.guia') === true,
  cliente: false,
  vista: 'preguntas',
  tab: leerLocal('co4.tab') || 'resumen',
  tipoAjustes: null,
};
let ultimo = null;

function getPath(o, path) { return path.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
function setPath(o, path, v) { const ks = path.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null) a[ks[i]] = {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = v; }
function getValor(clave) {
  if (clave.startsWith('linea:')) { const [, id, campo] = clave.split(':'); const l = estado.prospecto.lineas.find(x => x.id === id); return l ? l[campo] : ''; }
  return getPath(estado.prospecto, clave);
}
function setValor(clave, v) {
  if (clave.startsWith('linea:')) { const [, id, campo] = clave.split(':'); const l = estado.prospecto.lineas.find(x => x.id === id); if (l) l[campo] = v; return; }
  setPath(estado.prospecto, clave, v);
}
const rangoDe = clave => (estado.prospecto.rangos || {})[clave];
function contextoAyuda(clave) {
  const p = estado.prospecto;
  const ctx = { facturacion: n(p.negocio.facturacion) || (p.lineas || []).reduce((s, l) => s + n(l.facturacion), 0), gastosFijos: n(p.negocio.gastosFijos), clientesMes: n(p.hoy.clientesMes), ticket: 0, dias: n(p.meta.diasMes), pauta: n(p.hoy.pautaMes) };
  let l = null;
  if (clave.startsWith('linea:')) l = p.lineas.find(x => x.id === clave.split(':')[1]);
  else if (ultimo && ultimo.ev) l = p.lineas.find(x => x.id === ultimo.ev.foco.id);
  if (l) { ctx.ticket = n(l.ticket); ctx.lineaFact = n(l.facturacion); if (n(l.ticket) > 0 && n(l.facturacion) > 0) ctx.actualesSug = Math.round(n(l.facturacion) / n(l.ticket)); }
  ctx.actuales = n(p.capacidad.actuales);
  return ctx;
}

// =================== Preguntas ===================
const TXT_FUENTE = { dato: 'del dueño', calculado: 'calculado', estimado: 'adivinado', falta: 'falta' };
function fuenteDe(clave, importante) { const v = getValor(clave); if (vacio(v)) return importante ? 'falta' : ''; return estado.prospecto.fuentes[clave] || 'dato'; }
function htmlBadge(clave, importante) {
  const f = fuenteDe(clave, importante), rg = rangoDe(clave);
  return `<span class="badges"><span class="fuente f-rango" data-rango-badge="${esc(clave)}"${rg ? '' : ' hidden'}>rango</span><span class="fuente ${f ? 'f-' + f : ''}" data-badge="${esc(clave)}" data-importante="${importante ? 1 : 0}"${f ? '' : ' hidden'}>${f ? TXT_FUENTE[f] : ''}</span></span>`;
}
function btnNoSabe(inst, tipo) { const ab = estado.abiertas.has(inst); return `<button type="button" class="btn-nosabe" data-ayuda-toggle="${esc(inst)}" data-ayuda-tipo="${esc(tipo)}" aria-expanded="${ab}"><span class="qm" aria-hidden="true">?</span>${ab ? 'Cerrar' : '¿No sabe?'}</button>`; }
function valorMostrado(clave, fmt) {
  const rg = rangoDe(clave);
  if (rg) return fmtEntrada(rg);
  const v = getValor(clave);
  return vacio(v) ? '' : (typeof v === 'number' && fmt === 'dinero' ? fmtN(v) : String(v));
}
function pregunta({ clave, q, ayuda = '', pre = '', suf = '', fmt = '', nota = '', importante = false, ph = '', rango = true }) {
  const id = 'f-' + idSeguro(clave);
  return `<div class="fila" data-pregunta="${esc(clave)}">${htmlGuia(clave)}
    <div class="fila-cab"><label for="${id}">${esc(q)}</label>${htmlBadge(clave, importante)}</div>
    <div class="fila-in"><div class="campo-in">${pre ? `<span class="pre">${esc(pre)}</span>` : ''}<input id="${id}" class="num" inputmode="${rango ? 'text' : 'decimal'}" autocomplete="off" data-clave="${esc(clave)}" data-fmt="${fmt}"${rango ? ' data-rango="1"' : ''} value="${esc(valorMostrado(clave, fmt))}" placeholder="${esc(ph)}">${suf ? `<span class="suf">${esc(suf)}</span>` : ''}</div>${ayuda ? btnNoSabe(clave, ayuda) : ''}</div>
    ${nota ? `<p class="nota">${esc(nota)}</p>` : ''}
    <div data-slot="${esc(clave)}">${ayuda && estado.abiertas.has(clave) ? htmlAyuda(clave, ayuda, 0) : ''}</div>
  </div>`;
}
function chips({ clave, q, opciones, estructura = false, nota = '' }) {
  const id = 'q-' + idSeguro(clave), v = String(getValor(clave) ?? '');
  return `<div class="fila">${htmlGuia(clave)}<div class="fila-cab"><span class="q" id="${id}">${esc(q)}</span></div>
    <div class="chips" role="radiogroup" aria-labelledby="${id}">${opciones.map(([val, t]) => `<button type="button" role="radio" aria-checked="${String(val) === v}" data-chip="${esc(clave)}" data-valor="${esc(val)}"${estructura ? ' data-estructura="1"' : ''}>${esc(t)}</button>`).join('')}</div>
    ${nota ? `<p class="nota">${esc(nota)}</p>` : ''}</div>`;
}
function texto({ clave, q, ph = '', nota = '' }) {
  const id = 'f-' + idSeguro(clave);
  return `<div class="fila">${htmlGuia(clave)}<div class="fila-cab"><label for="${id}">${esc(q)}</label></div><div class="campo-in"><input id="${id}" autocomplete="off" data-clave="${esc(clave)}" data-tipo="txt" value="${esc(getValor(clave) ?? '')}" placeholder="${esc(ph)}"></div>${nota ? `<p class="nota">${esc(nota)}</p>` : ''}</div>`;
}
function interruptor({ clave, q, estructura = false, nota = '' }) {
  const id = 'f-' + idSeguro(clave);
  return `<div class="fila">${htmlGuia(clave)}<label class="switch-fila" for="${id}"><span>${esc(q)}</span><input type="checkbox" role="switch" class="switch" id="${id}" data-clave="${esc(clave)}" data-tipo="chk"${estructura ? ' data-estructura="1"' : ''}${getValor(clave) ? ' checked' : ''}></label>${nota ? `<p class="nota">${esc(nota)}</p>` : ''}</div>`;
}
function seleccion({ clave, q, opciones }) {
  const id = 'f-' + idSeguro(clave), v = String(getValor(clave) ?? '');
  return `<div class="fila">${htmlGuia(clave)}<div class="fila-cab"><label for="${id}">${esc(q)}</label></div><div class="campo-in"><select id="${id}" data-clave="${esc(clave)}" data-tipo="sel">${opciones.map(([val, t]) => `<option value="${esc(val)}"${String(val) === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></div></div>`;
}
// Casilla chica para listas (regalos, tipos de cliente)
function celda({ clave, ph = '', pre = '', tipo = 'num', aria = '' }) {
  const v = getValor(clave);
  const mostrado = vacio(v) ? '' : tipo === 'num' && typeof v === 'number' ? fmtCorto(v) : String(v);
  return `<div class="campo-in campo-chico">${pre ? `<span class="pre">${esc(pre)}</span>` : ''}<input aria-label="${esc(aria || ph)}" autocomplete="off" ${tipo === 'num' ? 'class="num" inputmode="decimal"' : 'data-tipo="txt"'} data-clave="${esc(clave)}" data-lista="1" value="${esc(mostrado)}" placeholder="${esc(ph)}"></div>`;
}
function selChico({ clave, opciones, aria }) {
  const v = String(getValor(clave) ?? '');
  return `<div class="campo-in campo-chico"><select aria-label="${esc(aria)}" data-clave="${esc(clave)}" data-tipo="sel" data-lista="1">${opciones.map(([val, t]) => `<option value="${esc(val)}"${String(val) === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
}

// ----- Ayudas (subcalculadoras) -----
function respuestaDe(inst, A) {
  const R = estado.prospecto.respuestas;
  if (!R[inst]) R[inst] = { metodo: A.metodos[0].id, v: {} };
  if (!A.metodos.some(m => m.id === R[inst].metodo)) R[inst].metodo = A.metodos[0].id;
  return R[inst];
}
const claveRaiz = inst => inst.split('>')[0];
// Devuelve { val } o { val, min, max } si alguna respuesta es un rango (se prueba en todas las esquinas)
function calcularAyuda(inst, tipo) {
  const A = AYUDAS[tipo], r = respuestaDe(inst, A), met = A.metodos.find(m => m.id === r.metodo), ctx = contextoAyuda(claveRaiz(inst));
  const base = {}, rgs = [];
  for (const c of met.campos) {
    let x = r.v[c.k];
    if ((x === undefined || x === '') && c.def && ctx[c.def] > 0) x = ctx[c.def];
    if (esRango(x)) { base[c.k] = (x.min + x.max) / 2; rgs.push([c.k, x]); }
    else base[c.k] = x === '' ? undefined : x;
  }
  const f = vals => { try { const y = met.calc(vals, ctx); return Number.isFinite(y) ? y : null; } catch { return null; } };
  const val = f(base);
  if (val === null) return null;
  if (!rgs.length) return { val };
  let lo = Infinity, hi = -Infinity;
  const k = Math.min(rgs.length, 6);
  for (let mask = 0; mask < (1 << k); mask++) {
    const v2 = { ...base };
    for (let i = 0; i < k; i++) v2[rgs[i][0]] = (mask >> i) & 1 ? rgs[i][1].max : rgs[i][1].min;
    const y = f(v2); if (y === null) continue;
    lo = Math.min(lo, y); hi = Math.max(hi, y);
  }
  if (!Number.isFinite(lo) || hi - lo < 1e-9) return { val };
  return { val, min: lo, max: hi };
}
function fmtAyuda(tipo, val) {
  const A = AYUDAS[tipo], d = A.dec ?? 1, x = redondear(val, d);
  switch (A.fmt) {
    case 'dinero': return fmtM(x, estado.reglas.moneda);
    case 'pct100': return fmtN(x, 0) + ' de cada 100';
    case 'meses': return fmtN(x, 0) + ' meses';
    case 'dias': return fmtN(x, 0) + ' días';
    case 'veces': return fmtN(x, d) + ' veces';
    case 'anios': return fmtN(x, d) + ' años';
    default: return fmtN(x, d);
  }
}
function htmlResultadoAyuda(inst, tipo, res) {
  if (!res) return '<span class="ayuda-res vacio">Anota las respuestas y aquí sale el número.</span>';
  if (res.min === undefined) return `<span class="ayuda-res">${esc(fmtAyuda(tipo, res.val))}</span>`;
  return `<div class="ayuda-esc"><div><span>Lo más bajo</span><b>${esc(fmtAyuda(tipo, res.min))}</b></div><div class="medio"><span>Lo normal</span><b>${esc(fmtAyuda(tipo, res.val))}</b></div><div><span>Lo más alto</span><b>${esc(fmtAyuda(tipo, res.max))}</b></div></div>`;
}
function htmlBotonesAyuda(inst, tipo, res, nivel) {
  if (!res) return `<button type="button" class="btn-azul btn-chico" disabled>Usar este número</button>`;
  if (res.min === undefined) return `<button type="button" class="btn-azul btn-chico" data-usar="${esc(inst)}" data-modo="normal" data-ayuda-tipo="${esc(tipo)}">Usar este número</button>`;
  return `<button type="button" class="btn-azul btn-chico" data-usar="${esc(inst)}" data-modo="rango" data-ayuda-tipo="${esc(tipo)}">Usar el rango</button><button type="button" class="btn-g btn-chico" data-usar="${esc(inst)}" data-modo="normal" data-ayuda-tipo="${esc(tipo)}">Solo lo normal</button>`;
}
function htmlAyuda(inst, tipo, nivel) {
  const A = AYUDAS[tipo]; if (!A) return '';
  const r = respuestaDe(inst, A), met = A.metodos.find(m => m.id === r.metodo), ctx = contextoAyuda(claveRaiz(inst)), res = calcularAyuda(inst, tipo);
  const tv = (() => { const k = claveRaiz(inst); if (!k.startsWith('linea:')) return null; const l = estado.prospecto.lineas.find(x => x.id === k.split(':')[1]); return l ? l.tipoVenta : null; })();
  const prud = nivel === 0 ? (A.prudente || (A.prudenteTipo && tv ? { valor: TIPOS_VENTA[tv].cicloDias, texto: `Usar ${TIPOS_VENTA[tv].cicloDias} días por las dudas` } : null)) : null;
  const campos = met.campos.map(c => {
    const sub = inst + '>' + c.k, id = 'a-' + idSeguro(sub), x = r.v[c.k];
    const ph = c.def && ctx[c.def] > 0 ? fmtN(ctx[c.def]) : (c.ph || '');
    return `<div class="ayuda-campo"><label for="${id}">${esc(c.q)}</label>
      <div class="fila-in"><div class="campo-in">${c.pre ? `<span class="pre">${esc(c.pre === 'Bs' ? estado.reglas.moneda : c.pre)}</span>` : ''}<input id="${id}" class="num" inputmode="text" autocomplete="off" data-ayuda-inst="${esc(inst)}" data-ayuda-tipo="${esc(tipo)}" data-k="${esc(c.k)}" value="${esc(fmtEntrada(x))}" placeholder="${esc(ph)}"></div>${c.sub && nivel < 3 ? btnNoSabe(sub, c.sub) : ''}</div>
      ${c.ayudaTxt ? `<p class="nota">${esc(c.ayudaTxt)}</p>` : ''}
      ${c.sub && nivel < 3 && estado.abiertas.has(sub) ? htmlAyuda(sub, c.sub, nivel + 1) : ''}</div>`;
  }).join('');
  const tip = nivel === 0 && A.tipicos ? `<div class="tipicos"><p>¿No tiene ninguna idea? Negocios parecidos <small>(se anota como adivinado)</small>:</p><div class="chips chips-chicos">${A.tipicos.map((t, i) => `<button type="button" data-tipico="${esc(inst)}" data-i="${i}" data-ayuda-tipo="${esc(tipo)}">${esc(t.t)} · <b>${esc(fmtCorto(t.min))}–${esc(fmtCorto(t.max))}</b></button>`).join('')}</div></div>` : '';
  return `<div class="ayuda" data-panel="${esc(inst)}" data-tipo="${esc(tipo)}">
    <p class="ayuda-tit"><b>${esc(A.titulo)}.</b> ${nivel === 0 ? 'Elige cómo preguntarlo y anota lo que te diga. Si duda, escribe un rango: «20 a 30».' : 'Sácalo con estas preguntas.'}</p>
    ${tip}
    ${A.metodos.length > 1 ? `<div class="segmento" role="tablist" aria-label="Formas de sacarlo">${A.metodos.map(m => `<button type="button" role="tab" aria-selected="${m.id === met.id}" data-metodo="${esc(m.id)}" data-inst="${esc(inst)}" data-ayuda-tipo="${esc(tipo)}">${esc(m.nombre)}</button>`).join('')}</div>` : ''}
    ${campos}
    <p class="ayuda-cuenta">La cuenta: ${esc(met.explica)}</p>
    <div class="ayuda-pie"><div class="ayuda-salida" data-resultado="${esc(inst)}">${htmlResultadoAyuda(inst, tipo, res)}</div>
      <div class="ayuda-btns" data-botones="${esc(inst)}" data-firma="${!res ? 'x' : res.min === undefined ? 'n' : 'r'}">${htmlBotonesAyuda(inst, tipo, res, nivel)}
      ${prud ? `<button type="button" class="btn-g btn-chico" data-prudente="${esc(inst)}" data-valor="${prud.valor}">${esc(prud.texto)}</button>` : ''}</div></div>
    ${A.nota && nivel === 0 ? `<p class="nota">${esc(A.nota)}</p>` : ''}
  </div>`;
}
function rehacerAyuda(inst) {
  const raiz = claveRaiz(inst), slot = document.querySelector(`[data-slot="${CSS.escape(raiz)}"]`); if (!slot) return;
  const btn = slot.closest('[data-pregunta]')?.querySelector(`[data-ayuda-toggle="${CSS.escape(raiz)}"]`), tipo = btn ? btn.dataset.ayudaTipo : null;
  slot.innerHTML = tipo && estado.abiertas.has(raiz) ? htmlAyuda(raiz, tipo, 0) : '';
  if (btn) btn.outerHTML = btnNoSabe(raiz, tipo);
}
function actualizarBadge(clave) {
  const b = document.querySelector(`[data-badge="${CSS.escape(clave)}"]`);
  if (b) { const f = fuenteDe(clave, b.dataset.importante === '1'); b.className = 'fuente' + (f ? ' f-' + f : ''); b.textContent = f ? TXT_FUENTE[f] : ''; b.hidden = !f; }
  const rb = document.querySelector(`[data-rango-badge="${CSS.escape(clave)}"]`); if (rb) rb.hidden = !rangoDe(clave);
}
// Anota un número (o un rango) en una pregunta principal
function aplicarValor(clave, valor, fuente) {
  const P = estado.prospecto;
  if (esRango(valor)) { P.rangos[clave] = { min: valor.min, max: valor.max }; setValor(clave, redondear((valor.min + valor.max) / 2, 2)); }
  else { delete P.rangos[clave]; setValor(clave, valor); }
  if (fuente) P.fuentes[clave] = fuente; else delete P.fuentes[clave];
  const inp = document.querySelector(`[data-clave="${CSS.escape(clave)}"]`);
  if (inp) inp.value = valorMostrado(clave, inp.dataset.fmt);
  actualizarBadge(clave);
}
