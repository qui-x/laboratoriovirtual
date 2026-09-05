/* ================================================================
   SICIN — scrpitcinetica.js | mecânicas do simulador
   ================================================================
   Somente lógica: acessibilidade, utilitários de desenho, a classe
   Mech (física e química do módulo) e o casco App, comum a toda a
   família de simuladores do 2º ano. Os dados fixos ficam em
   dadoscinetica.js e as cores em stylecinetica.css.
   ================================================================ */
'use strict';

// ══════════════════════════════════════════════════════════════════
// RECEPTOR DE ACESSIBILIDADE — Central de Simuladores
// (injeta os filtros SVG de daltonismo e o widget VLibras via JS —
//  o HTML não contém nenhum desses dois blocos, só o overlay/placeholder
//  vazios que servem de âncora)
// ══════════════════════════════════════════════════════════════════
(function injectColorblindFilters() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.setAttribute('aria-hidden', 'true');
  const defs = document.createElementNS(svgNS, 'defs');
  // Matrizes calibradas para cada tipo de CVD (Wong 2011 / Machado et al. 2009).
  const filtros = {
    'f-protanopia':   '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
    'f-deuteranopia': '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
    'f-tritanopia':   '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
    'f-acromatopsia': '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0',
  };
  Object.entries(filtros).forEach(([id, values]) => {
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', id);
    const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
    feColorMatrix.setAttribute('type', 'matrix');
    feColorMatrix.setAttribute('values', values);
    filter.appendChild(feColorMatrix);
    defs.appendChild(filter);
  });
  svg.appendChild(defs);
  document.body.insertBefore(svg, document.body.firstChild);
})();

(function initVLibras() {
  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = function () {
    try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch (e) {}
  };
  document.body.appendChild(script);
})();

(function () {
  const root = document.documentElement;
  const CVD_CYCLE = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'acromatopsia'];

  function applyFontScale(scale) {
    const fs = Math.min(1.5, Math.max(0.75, scale));
    root.style.setProperty('--font-scale', fs);
  }

  function applyPayload(payload) {
    if (!payload) return;
    if (payload.theme) document.body.classList.toggle('light-mode', payload.theme === 'light');
    if (typeof payload.contrast !== 'undefined') document.body.classList.toggle('high-contrast', !!payload.contrast);
    if (typeof payload.colorblind !== 'undefined' && payload.colorblind !== null && CVD_CYCLE.includes(payload.colorblind)) {
      // Técnica do hub: filtro SVG via backdrop-filter num overlay
      // fixo (pointer-events:none), nunca diretamente no body/html —
      // senão elementos position:fixed do simulador quebram.
      applyColorblindOverlay(payload.colorblind);
    }
    if (payload.reading) {
      const simples = payload.reading === 'on';
      document.body.classList.toggle('simple-read', simples);
      root.classList.toggle('simple-read', simples); // espelha no <html> p/ escala rem da leitura simples
    }
    if (typeof payload.motion !== 'undefined') document.body.classList.toggle('reduce-motion', !!payload.motion);
    if (typeof payload.spacing !== 'undefined') document.body.classList.toggle('wide-spacing', !!payload.spacing);
    if (payload.fontScale) applyFontScale(payload.fontScale);
  }

  function applyColorblindOverlay(type) {
    const overlay = document.getElementById('colorblindOverlay');
    if (!overlay) return;
    const value = (!type || type === 'none') ? 'none' : `url(#f-${type})`;
    overlay.style.backdropFilter = value;
    overlay.style.webkitBackdropFilter = value;
  }

  (function applyFromUrl() {
    const p = new URLSearchParams(window.location.search);
    if (![...p.keys()].length) return;
    applyPayload({
      theme: p.get('theme'),
      contrast: p.get('contrast') === 'true',
      colorblind: p.get('colorblind'),
      reading: p.get('reading'),
      motion: p.get('motion') === 'true',
      spacing: p.get('spacing') === 'true',
      fontScale: parseFloat(p.get('fontscale')) || 1.0,
    });
  })();

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.source !== 'central-simuladores' || e.data.type !== 'a11y-update') return;
    applyPayload(e.data.payload);
  });
})();

// ══════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ══════════════════════════════════════════════════════════════════
function announce(msg, priority = 'polite') {
  const el = document.getElementById(priority === 'assertive' ? 'sr-live-assertive' : 'sr-live');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}

let _audioCtx = null;
function playTone(freq = 880, dur = 0.08, vol = 0.07) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!_audioCtx) _audioCtx = new Ctx();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain); gain.connect(_audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + dur);
    osc.start(); osc.stop(_audioCtx.currentTime + dur);
  } catch (e) {}
}

/** Formata número no padrão pt-BR com sinal − tipográfico. */
function fmt(v, casas = 1) {
  const s = Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 0, maximumFractionDigits: casas,
  });
  return s.replace('-', '−');
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ══════════════════════════════════════════════════════════════════
// ESCALA DO CANVAS — tipografia e layout responsivos
// ══════════════════════════════════════════════════════════════════
// PROBLEMA QUE ISTO RESOLVE
// Todo o desenho do canvas usava medidas de fonte literais (size: 10,
// '11px Consolas'...). Como o canvas escala com devicePixelRatio e com
// o tamanho da .canvas-wrap, o texto ficava proporcionalmente minusculo
// num monitor de 1600 px e desproporcional num celular de 380 px.
//
// COMO RESOLVE
// CANVAS_FS e um fator global recalculado a cada _resize(). patchCtxFont()
// intercepta a propriedade `font` do contexto 2D uma unica vez, de modo que
// QUALQUER atribuicao de fonte — inclusive as de dentro de kLabel/kChip e as
// strings literais cruas — passe por kFont() e seja reescalada. Nenhuma das
// centenas de chamadas de desenho precisou ser alterada.
let CANVAS_FS = 1;

/** Fator tipografico: 1,0 na largura de referencia (900 px), sobe em telas
 *  largas e desce um pouco em telas estreitas. Multiplica pela variavel
 *  --font-scale da Central de Simuladores, para que aumentar a fonte no menu
 *  de acessibilidade aumente TAMBEM o texto do canvas (antes nao aumentava). */
function canvasFS(W) {
  let a11y = 1;
  try {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale'));
    if (isFinite(v) && v > 0) a11y = v;
  } catch (e) { /* getComputedStyle indisponivel: mantem 1 */ }
  const base = Math.min(1.45, Math.max(0.92, W / 900));
  return base * a11y;
}

/** Reescala a primeira medida em px de uma string de fonte CSS.
 *  '700 11px Consolas' → '700 15.9px Consolas' quando CANVAS_FS = 1,45. */
function kFont(spec) {
  if (typeof spec !== 'string' || CANVAS_FS === 1) return spec;
  return spec.replace(/(\d+(?:\.\d+)?)px/, (m, n) => (Math.round(parseFloat(n) * CANVAS_FS * 10) / 10) + 'px');
}

/** Intercepta ctx.font uma unica vez por contexto. Se o navegador nao
 *  expuser o acessor no prototipo (caso improvavel), nao faz nada — o
 *  desenho continua funcionando, so sem a escala tipografica. */
function patchCtxFont(ctx) {
  if (!ctx || ctx._fontPatched) return;
  try {
    const proto = Object.getPrototypeOf(ctx);
    const desc = Object.getOwnPropertyDescriptor(proto, 'font');
    if (!desc || !desc.get || !desc.set) return;
    Object.defineProperty(ctx, 'font', {
      get() { return desc.get.call(ctx); },
      set(v) { desc.set.call(ctx, kFont(v)); },
      configurable: true,
    });
    ctx._fontPatched = true;
  } catch (e) { /* ambiente sem acessor de fonte: segue sem escala */ }
}

/** Faixa de layout do canvas. Convencao unica da familia — nasceu no SISOL
 *  (que ja usava `estreito = W < 620`) e agora vale para os sete:
 *    estreito → celular em retrato / gaveta aberta: empilhar na vertical
 *    normal   → tablet / metade de monitor: layout padrao
 *    largo    → monitor: pode espalhar e crescer */
function layoutMode(W) { return W < 620 ? 'estreito' : (W < 1000 ? 'normal' : 'largo'); }
const isEstreito = W => W < 620;

/** Medida proporcional com PISO obrigatorio e teto OPCIONAL.
 *  Substitui o padrao `Math.min(W * f, TETO)`, que travava o desenho num
 *  numero fixo de pixels e deixava o canvas grande com sobra vazia.
 *  propW(W, .3, 120)      → cresce sem teto, nunca abaixo de 120
 *  propW(W, .3, 120, 400) → cresce ate 400 (use so quando houver motivo) */
function propW(W, frac, min_, max_) {
  const v = W * frac;
  return max_ == null ? Math.max(min_, v) : Math.min(max_, Math.max(min_, v));
}


const lerp  = (a, b, t) => a + (b - a) * t;
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const isReduced = () => document.body.classList.contains('reduce-motion');

/** Formata em notação científica no padrão da literatura: "9,3 × 10⁻⁵"
 *  em vez do "9.3e-5" cru do JavaScript. */
const _SOBRESCRITO = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function fmtCientifico(v, casas = 2) {
  if (!isFinite(v) || v === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  const mant = v / Math.pow(10, exp);
  const expStr = String(exp).split('').map(c => _SOBRESCRITO[c] || c).join('');
  return `${fmt(mant, casas)} × 10${expStr}`;
}

/** Lê uma variável de cor do CSS (fonte única de cores do simulador). */
function cssVar(name, fallback = '#fb923c') {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

/** Contraste preto/branco por luminância YIQ — réplica do SIMA/SILQ. */
function getContrastColor(hex) {
  const c = hex.replace('#', '');
  if (c.length < 6) return '#111827';
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  /* Escolhe entre texto escuro e claro pelo CONTRASTE REAL (WCAG 2.1).
     Antes: (r*299 + g*587 + b*114)/1000 >= 145 ? escuro : claro
     O limiar 145 do YIQ nao corresponde ao contraste percebido. Medido no
     Chromium, escolhia BRANCO para cores de meio-tom e o resultado ficava
     abaixo do minimo — ex.: teal #14b8a6 + branco = 2.49:1, quando com
     texto escuro daria 7.13:1.
     Agora calcula as duas razoes e devolve a melhor. Nao garante 4.5:1
     para toda cor (algumas nao alcancam com preto nem com branco), mas
     eleva todos os casos e nunca piora nenhum. */
  var _canal = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  var _lum = function (c) { return 0.2126 * _canal(c[0]) + 0.7152 * _canal(c[1]) + 0.0722 * _canal(c[2]); };
  var _razao = function (a, b) { var L1 = _lum(a), L2 = _lum(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
  return _razao([r, g, b], [17, 24, 39]) >= _razao([r, g, b], [255, 255, 255]) ? '#111827' : '#ffffff';
}

// ══════════════════════════════════════════════════════════════════
// KIT DE DESENHO — helpers de canvas compartilhados pela família de
// simuladores do 2º ano (mesma linguagem visual do SIMA/SITQ).
// Todas as cores vêm de cssVar() → variáveis do CSS (fonte única).
// ══════════════════════════════════════════════════════════════════
function kRound(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function kLabel(ctx, text, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.bold ? '700 ' : ''}${o.size || 12}px ${o.mono ? "'Consolas','Monaco',monospace" : "'Segoe UI',system-ui,sans-serif"}`;
  ctx.fillStyle = o.color || cssVar('--text-secondary', '#7a9ab8');
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.baseline || 'middle';
  if (o.maxW) ctx.fillText(text, x, y, o.maxW); else ctx.fillText(text, x, y);
  ctx.restore();
}

/** Pílula de texto (legenda flutuante). */
function kChip(ctx, text, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.size || 11}px 'Segoe UI',system-ui,sans-serif`;
  const w = ctx.measureText(text).width + 14, h = (o.size || 11) + 10;
  kRound(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = o.bg || 'rgba(0,0,0,.45)';
  ctx.fill();
  if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 1; ctx.stroke(); }
  kLabel(ctx, text, x, y + .5, { size: o.size || 11, color: o.fg || '#fff', bold: o.bold });
  ctx.restore();
}

function kArrow(ctx, x1, y1, x2, y2, o = {}) {
  const head = o.head || 7, ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = o.color || cssVar('--text-secondary');
  ctx.lineWidth = o.w || 1.6;
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - .45), y2 - head * Math.sin(ang - .45));
  ctx.lineTo(x2 - head * Math.cos(ang + .45), y2 - head * Math.sin(ang + .45));
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/**
 * Eixos cartesianos com grade e ticks. Retorna {px, py, area} onde
 * px(v)/py(v) mapeiam valores de dados → pixels.
 */
function kAxes(ctx, cfg) {
  const { x, y, w, h, xmin, xmax, ymin, ymax } = cfg;
  const px = v => x + (v - xmin) / (xmax - xmin) * w;
  const py = v => y + h - (v - ymin) / (ymax - ymin) * h;
  const grid = cssVar('--border', '#1c2e44'), txt = cssVar('--text-muted', '#3d566e');
  ctx.save();
  ctx.lineWidth = 1;
  (cfg.xticks || []).forEach(t => {
    ctx.strokeStyle = grid; ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.moveTo(px(t), y); ctx.lineTo(px(t), y + h); ctx.stroke();
    ctx.globalAlpha = 1;
    kLabel(ctx, cfg.fmtx ? cfg.fmtx(t) : fmt(t, 0), px(t), y + h + 11, { size: 10, color: txt, mono: true });
  });
  (cfg.yticks || []).forEach(t => {
    ctx.strokeStyle = grid; ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.moveTo(x, py(t)); ctx.lineTo(x + w, py(t)); ctx.stroke();
    ctx.globalAlpha = 1;
    kLabel(ctx, cfg.fmty ? cfg.fmty(t) : fmt(t, 0), x - 6, py(t), { size: 10, color: txt, align: 'right', mono: true });
  });
  ctx.strokeStyle = cssVar('--text-muted');
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke();
  if (cfg.xlab) kLabel(ctx, cfg.xlab, x + w / 2, y + h + 26, { size: 11, color: cssVar('--text-secondary'), bold: true });
  if (cfg.ylab) {
    ctx.save(); ctx.translate(x - 40, y + h / 2); ctx.rotate(-Math.PI / 2);
    kLabel(ctx, cfg.ylab, 0, 0, { size: 11, color: cssVar('--text-secondary'), bold: true });
    ctx.restore();
  }
  ctx.restore();
  return { px, py };
}

/** Polilinha suave sobre eixos já mapeados. */
function kLine(ctx, pts, px, py, o = {}) {
  if (!pts.length) return;
  ctx.save();
  ctx.strokeStyle = o.color || cssVar('--accent-main');
  ctx.lineWidth = o.w || 2.2;
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.globalAlpha = o.alpha != null ? o.alpha : 1;
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(px(p[0]), py(p[1])) : ctx.moveTo(px(p[0]), py(p[1])));
  ctx.stroke();
  ctx.restore();
}

/**
 * Béquer de vidro com líquido. level 0..1. Retorna o retângulo interno
 * do líquido (para posicionar partículas).
 */
function kBeaker(ctx, cx, topY, w, h, level, liquidColor, o = {}) {
  const x = cx - w / 2, glass = cssVar('--glass', 'rgba(148,163,184,.38)');
  const lh = Math.max(0, Math.min(1, level)) * (h - 10);
  const ly = topY + h - lh;
  if (lh > 1) {
    ctx.save();
    const g = ctx.createLinearGradient(0, ly, 0, topY + h);
    g.addColorStop(0, liquidColor);
    g.addColorStop(1, liquidColor);
    ctx.fillStyle = g;
    ctx.globalAlpha = o.alpha != null ? o.alpha : .85;
    kRound(ctx, x + 3, ly, w - 6, lh, 4);
    ctx.fill();
    // menisco
    ctx.globalAlpha = .5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x + 4, ly + 1.5); ctx.lineTo(x + w - 4, ly + 1.5); ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle = glass;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x - 4, topY - 4);
  ctx.lineTo(x, topY);
  ctx.lineTo(x, topY + h - 6);
  ctx.quadraticCurveTo(x, topY + h, x + 6, topY + h);
  ctx.lineTo(x + w - 6, topY + h);
  ctx.quadraticCurveTo(x + w, topY + h, x + w, topY + h - 6);
  ctx.lineTo(x + w, topY);
  ctx.lineTo(x + w + 4, topY - 4);
  ctx.stroke();
  if (o.rotulo) kLabel(ctx, o.rotulo, cx, topY + h + 14, { size: 11, color: cssVar('--text-secondary') });
  ctx.restore();
  return { x: x + 4, y: ly, w: w - 8, h: lh, surfaceY: ly };
}

/** Termômetro vertical com escala. */
function kThermo(ctx, x, topY, h, t, tmin, tmax, o = {}) {
  const frac = Math.max(0, Math.min(1, (t - tmin) / (tmax - tmin)));
  const bulbR = 8, tubeW = 7;
  const tubeTop = topY, tubeBot = topY + h - bulbR * 2;
  const merc = o.color || cssVar('--accent-exo', '#f87171');
  ctx.save();
  ctx.fillStyle = cssVar('--bg-void', '#080c14');
  ctx.strokeStyle = cssVar('--glass');
  ctx.lineWidth = 2;
  kRound(ctx, x - tubeW / 2, tubeTop, tubeW, h - bulbR, tubeW / 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, tubeBot + bulbR, bulbR, 0, Math.PI * 2);
  ctx.fillStyle = merc; ctx.fill(); ctx.stroke();
  const mh = frac * (tubeBot - tubeTop - 4);
  ctx.fillStyle = merc;
  kRound(ctx, x - 2.2, tubeBot - mh, 4.4, mh + bulbR, 2.2);
  ctx.fill();
  for (let i = 0; i <= 4; i++) {
    const yy = tubeBot - i / 4 * (tubeBot - tubeTop - 4);
    ctx.strokeStyle = cssVar('--text-muted');
    ctx.beginPath(); ctx.moveTo(x + tubeW / 2 + 2, yy); ctx.lineTo(x + tubeW / 2 + 6, yy); ctx.stroke();
    if (o.escala !== false) kLabel(ctx, fmt(tmin + i / 4 * (tmax - tmin), 0), x + tubeW / 2 + 9, yy, { size: 9, color: cssVar('--text-muted'), align: 'left', mono: true });
  }
  if (o.rotulo !== false) kChip(ctx, `${fmt(t, o.casas != null ? o.casas : 0)} °C`, x, tubeTop - 14, { bg: 'rgba(0,0,0,.45)', fg: merc, size: 11, bold: true });
  ctx.restore();
}

/** Chama de bico de Bunsen (t = relógio da animação). */
function kFlame(ctx, x, y, s, time) {
  const flu = isReduced() ? 0 : Math.sin(time * 9) * s * .06;
  ctx.save();
  const g = ctx.createRadialGradient(x, y - s * .5, s * .1, x, y - s * .5, s);
  g.addColorStop(0, cssVar('--flame-b', '#fde047'));
  g.addColorStop(1, cssVar('--flame-a', '#f97316'));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - s * .45, y);
  ctx.quadraticCurveTo(x - s * .5, y - s * .8, x + flu, y - s * 1.5);
  ctx.quadraticCurveTo(x + s * .5, y - s * .8, x + s * .45, y);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** Mantém n partículas quicando dentro de box; vel escala com speed. */
function kParticles(arr, n, box, speed, dt) {
  while (arr.length < n) arr.push({ x: box.x + Math.random() * box.w, y: box.y + Math.random() * box.h, vx: (Math.random() - .5), vy: (Math.random() - .5) });
  if (arr.length > n) arr.length = n;
  const v = isReduced() ? 0 : speed;
  arr.forEach(p => {
    p.x += p.vx * v * dt; p.y += p.vy * v * dt;
    if (p.x < box.x) { p.x = box.x; p.vx = Math.abs(p.vx); }
    if (p.x > box.x + box.w) { p.x = box.x + box.w; p.vx = -Math.abs(p.vx); }
    if (p.y < box.y) { p.y = box.y; p.vy = Math.abs(p.vy); }
    if (p.y > box.y + box.h) { p.y = box.y + box.h; p.vy = -Math.abs(p.vy); }
  });
}
function kDrawParticles(ctx, arr, r, color, alpha) {
  ctx.save();
  ctx.fillStyle = color; ctx.globalAlpha = alpha != null ? alpha : .9;
  arr.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

/** Bolhas de gás subindo a partir de srcY dentro de box. */
function kBubbles(arr, dt, box, rate, o = {}) {
  if (!isReduced() && Math.random() < rate * dt) {
    arr.push({ x: (o.x != null ? o.x : box.x + Math.random() * box.w) + (Math.random() - .5) * (o.spread || 10), y: o.y != null ? o.y : box.y + box.h - 4, r: 1.5 + Math.random() * 2.5, v: 26 + Math.random() * 30 });
  }
  for (let i = arr.length - 1; i >= 0; i--) {
    const b = arr[i];
    b.y -= b.v * dt; b.x += Math.sin(b.y * .12) * .25;
    if (b.y < (o.topo != null ? o.topo : box.y) + 3) arr.splice(i, 1);
  }
}
function kDrawBubbles(ctx, arr, color) {
  ctx.save();
  ctx.strokeStyle = color || 'rgba(255,255,255,.65)';
  ctx.lineWidth = 1.1;
  arr.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); });
  ctx.restore();
}

/** Elétrons (pontos) correndo ao longo de uma polilinha; t avança externamente. */
function kFlowDots(ctx, pts, phase, n, color, o = {}) {
  const segs = []; let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
    const L = Math.hypot(dx, dy); segs.push({ p: pts[i], dx, dy, L }); total += L;
  }
  ctx.save(); ctx.fillStyle = color;
  for (let k = 0; k < n; k++) {
    let d = (((phase + k / n) % 1) + 1) % 1 * total;
    for (const s of segs) {
      if (d <= s.L) {
        const t = d / s.L;
        ctx.beginPath(); ctx.arc(s.p[0] + s.dx * t, s.p[1] + s.dy * t, o.r || 2.6, 0, Math.PI * 2); ctx.fill();
        if (o.rotulo && k === 0) kLabel(ctx, 'e⁻', s.p[0] + s.dx * t, s.p[1] + s.dy * t - 9, { size: 9, color, mono: true });
        break;
      }
      d -= s.L;
    }
  }
  ctx.restore();
}

/** Interpola duas cores hex → 'rgb(r,g,b)'. */
function kMix(h1, h2, t) {
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const a = p(h1), b = p(h2);
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}

/** Interpolação linear em tabela de pontos [[x,y],...] ordenada por x. */
function kInterp(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

// ══════════════════════════════════════════════════════════════════
// MECÂNICA — SICIN · Cinética Química
// Modos: teoria das colisões · curva [A]×t · energia de ativação
// ══════════════════════════════════════════════════════════════════
class Mech {
  constructor(D) {
    this.D = D;
    this.modo = 'colisoes';
    // modo 1
    this.tcol = 25; this.na = 18; this.nb = 18; this.cat = 0;
    this.A = []; this.B = []; this.C = []; this.flashes = [];
    this.efetivas = 0; this.janela = 0; this.taxa = 0; this.taxaMedida = 0;
    this._semear();
    // modo 3 — curva cinética (k vem da mesma Arrhenius do modo Energia)
    this.a0 = 1; this.tcur = 25; this.curCaminho = D.CAMINHOS[0]; this.curRunning = false;
    this.curTipo = 'h2o2'; this.curRefReacao = D.ARRHENIUS_EXTRA[0];
    this.t1 = 5; this.t2 = 25; this.trel = 0;
    // modo 2 — superfície de contato
    this.nfrag = 1; this.supTempo = 0; this.supBubbles = []; this.supSubst = D.SUP_SUBSTANCIAS[0];
    this.supSol = D.SUP_SOLUCOES[0]; this.supFase = 'esperando'; this.supDropT = 0;
    // modo 4 — ordem de reação (0, 1ª, 2ª) e sua linearização
    this.nordem = 1; this.orda0 = 1; this.ordk = 0.03;
    this.ordview = 'conc'; this.ordTrel = 0; this.ordRunning = false;
    this.ordSecreto = false; this.ordOculta = 1;
    // modo 5
    this.caminho = D.CAMINHOS[0]; this.tene = 25; this.mecanismo = 'uma'; this.eneView = 'caminho';
    this.fase = 0;
    // modo 7 — mecanismo de reação e etapa determinante
    // O dado MECANISMOS ja existia no arquivo de dados sem nenhum modulo que
    // o usasse: alimentava so texto. Agora e mecanica.
    this.mec = D.MECANISMOS[0];
    this.mecEtapa = 0; this.mecView = 'etapas';
    this.mecPlay = false; this.mecT = 0;
    // modo 6 — gráfico de Arrhenius (ln k × 1/T)
    this.arrCaminho = D.CAMINHOS[0]; this.arrT = 25; this.arrPontos = [];
    this.arrModo = 'h2o2'; this.arrRefReacao = D.ARRHENIUS_EXTRA[0];
  }

  /** Botão desenhado dentro do canvas do modo Energia (alterna entre o
   *  diagrama de energia e a curva de Maxwell-Boltzmann). Retângulo
   *  fixo no canto superior direito, hit-test simples. */
  _eneBtnRect(W) { return { x: W - 56, y: 10, w: 40, h: 40 }; }

  /** Chamado pelo App quando o usuário clica/toca no canvas. Retorna
   *  true se algo mudou (pra forçar refresh dos resultados). */
  onCanvasClick(x, y, W, H) {
    if (this.modo === 'energia') {
      const r = this._eneBtnRect(W);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        this.eneView = this.eneView === 'caminho' ? 'maxwell' : 'caminho';
        playTone(700, .05, .05);
        announce(this.eneView === 'caminho' ? 'Mostrando diagrama de energia.' : 'Mostrando curva de Maxwell-Boltzmann.');
        return true;
      }
    }
    return false;
  }

  build(app) {
    fillOptGrid('ene-grid', this.D.CAMINHOS.map(c => ({
      value: c.id, nome: c.nome, dot: c.dot, extra: `Ea ${c.ea} kJ/mol`,
      aria: `${c.nome}, ${c.nota}, energia de ativação ${c.ea} quilojoules por mol`,
    })), this.caminho.id);
    fillOptGrid('arr-grid', this.D.CAMINHOS.map(c => ({
      value: c.id, nome: c.nome, dot: c.dot, extra: `Ea ${c.ea} kJ/mol`,
      aria: `${c.nome}, energia de ativação ${c.ea} quilojoules por mol`,
    })), this.arrModo === 'h2o2' ? this.arrCaminho.id : null);
    fillOptGrid('arr-grid-ref', this.D.ARRHENIUS_EXTRA.map(r => ({
      value: r.id, nome: r.nome, dot: r.dot, extra: `Ea ${fmt(r.ea, 0)} kJ/mol`,
      aria: `${r.nome}, energia de ativação ${fmt(r.ea, 0)} quilojoules por mol, dado real de literatura`,
    })), this.arrModo === 'referencia' ? this.arrRefReacao.id : null);
    fillOptGrid('cur-grid', this.D.CAMINHOS.map(c => ({
      value: c.id, nome: c.nome, dot: c.dot, extra: `Ea ${c.ea} kJ/mol`,
      aria: `${c.nome}, energia de ativação ${c.ea} quilojoules por mol`,
    })), this.curTipo === 'h2o2' ? this.curCaminho.id : null);
    fillOptGrid('mec-grid', this.D.MECANISMOS.map(m => ({
      value: m.id, nome: m.nome, extra: m.lei,
      aria: `${m.nome}. Equação global ${m.global}. Lei de velocidade ${m.lei}. ${m.pega}`,
    })), this.mec.id);
    this._mecSync();
    fillOptGrid('cur-grid-ref', this.D.ARRHENIUS_EXTRA.map(r => ({
      value: r.id, nome: r.nome, dot: r.dot, extra: `Ea ${fmt(r.ea, 0)} kJ/mol`,
      aria: `${r.nome}, energia de ativação ${fmt(r.ea, 0)} quilojoules por mol, dado real de literatura`,
    })), this.curTipo === 'referencia' ? this.curRefReacao.id : null);
    fillOptGrid('sup-grid', this.D.SUP_SUBSTANCIAS.map(s => ({
      value: s.id, nome: s.nome, dot: s.cor, extra: s.formula,
      aria: `${s.nome}, ${s.eq}`,
    })), this.supSubst.id);
    fillOptGrid('sup-grid-sol', this.D.SUP_SOLUCOES.map(s => ({
      value: s.id, nome: s.nome, extra: `×${fmt(s.relK, 2)}`,
      aria: `${s.nome}, ${s.nota}`,
    })), this.supSol.id);
  }

  setMode(id) {
    this.modo = id;
    if (id === 'curva') { this.trel = 0; this.curRunning = false; this._syncCurRange(); }
    if (id === 'ordem') { this.ordTrel = 0; this.ordRunning = false; }
    if (id === 'superficie') { this.supTempo = 0; this.supBubbles = []; this.supFase = 'esperando'; this.supDropT = 0; }
  }

  /** Ajusta o slider de etapa ao nº de etapas do mecanismo atual e escreve a
   *  "pegadinha" no painel — o texto que nomeia a confusão que o mecanismo
   *  desmonta (coeficiente da global × expoente da lei). */
  _mecSync() {
    const el = document.getElementById('mec-etapa');
    if (el) {
      el.max = String(this.mec.etapas.length - 1);
      el.value = String(this.mecEtapa);
    }
    if (this.app) this.app.syncSlider('mec-etapa', this.mecEtapa);
    const p = document.getElementById('mec-pega');
    if (p) p.textContent = this.mec.pega;
  }

  setParam(k, v) {
    switch (k) {
      case 'tcol': this.tcol = v; break;
      case 'na': this.na = v; this._semear(); break;
      case 'nb': this.nb = v; this._semear(); break;
      case 'cat':
        this.cat = +v;
        return { say: this.cat ? 'Catalisador adicionado: fração de colisões efetivas multiplicada por quatro.' : 'Catalisador removido.' };
      case 'a0': this.a0 = v; this.trel = 0; break;
      case 'tcur': this.tcur = v; this._syncCurRange(); break;
      case 'curcaminho': {
        this.curCaminho = this.D.CAMINHOS.find(c => c.id === v) || this.curCaminho;
        this.curTipo = 'h2o2'; this._syncCurRange();
        if (this.app) fillOptGrid('cur-grid-ref', this.D.ARRHENIUS_EXTRA.map(r => ({
          value: r.id, nome: r.nome, dot: r.dot, extra: `Ea ${fmt(r.ea, 0)} kJ/mol`,
        })), null);
        return { say: `${this.curCaminho.nome}: constante de velocidade recalculada com Ea de ${this.curCaminho.ea} quilojoules por mol.` };
      }
      case 'curref': {
        this.curRefReacao = this.D.ARRHENIUS_EXTRA.find(r => r.id === v) || this.curRefReacao;
        this.curTipo = 'referencia'; this._syncCurRange();
        if (this.app) fillOptGrid('cur-grid', this.D.CAMINHOS.map(c => ({
          value: c.id, nome: c.nome, dot: c.dot, extra: `Ea ${c.ea} kJ/mol`,
        })), null);
        return { say: `${this.curRefReacao.nome} selecionada, com Ea e A reais de literatura.` };
      }
      case 't1':
        this.t1 = v;
        if (this.t2 <= this.t1) { this.t2 = Math.min(60, this.t1 + 2); this.app.syncSlider('cur-t2', this.t2); }
        break;
      case 't2':
        this.t2 = v;
        if (this.t1 >= this.t2) { this.t1 = Math.max(0, this.t2 - 2); this.app.syncSlider('cur-t1', this.t1); }
        break;
      case 'caminho': {
        this.caminho = this.D.CAMINHOS.find(c => c.id === v) || this.caminho;
        if (this.caminho.id !== 'iodeto') this.mecanismo = 'uma';
        return { say: `${this.caminho.nome}: energia de ativação de ${this.caminho.ea} quilojoules por mol.` };
      }
      case 'tene': this.tene = v; break;
      case 'mecanismo': {
        this.mecanismo = v;
        if (v === 'duas' && this.caminho.id !== 'iodeto') {
          this.caminho = this.D.CAMINHOS.find(c => c.id === 'iodeto') || this.caminho;
          this.app && fillOptGrid('ene-grid', this.D.CAMINHOS.map(c => ({
            value: c.id, nome: c.nome, dot: c.dot, extra: `Ea ${c.ea} kJ/mol`,
            aria: `${c.nome}, ${c.nota}, energia de ativação ${c.ea} quilojoules por mol`,
          })), this.caminho.id);
          return { say: 'Mecanismo em duas etapas só está descrito para a via do iodeto — caminho trocado automaticamente. Etapa 1 é lenta e determina a velocidade; etapa 2 é rápida.' };
        }
        return { say: v === 'duas' ? 'Etapa 1 é lenta e determina a velocidade; etapa 2 é rápida.' : 'Voltando ao perfil de uma etapa só.' };
      }
      case 'nordem':
        this.nordem = parseInt(v, 10); this.ordTrel = 0; this.ordRunning = false;
        return { say: `Ordem ${v} selecionada: agora só o gráfico de ${this._labelOrdem(this.nordem)} deve ficar reto.` };
      case 'orda0': this.orda0 = v; this.ordTrel = 0; break;
      case 'ordk': this.ordk = v; this.ordTrel = 0; break;
      case 'ordview': this.ordview = v; break;
      case 'nfrag':
        this.nfrag = parseInt(v, 10); this.supTempo = 0; this.supBubbles = []; this.supFase = 'esperando'; this.supDropT = 0;
        if (this.app) this.app.syncSlider('sup-n', this.nfrag);
        return { say: `Amostra com ${this.nfrag} pedaço${this.nfrag > 1 ? 's' : ''}: quanto mais fragmentado, mais rápida a reação.` };
      case 'supsubst': {
        this.supSubst = this.D.SUP_SUBSTANCIAS.find(s => s.id === v) || this.supSubst;
        this.supTempo = 0; this.supBubbles = []; this.supFase = 'esperando'; this.supDropT = 0;
        return { say: `${this.supSubst.nome} selecionado: ${this.supSubst.eq}` };
      }
      case 'supsol': {
        this.supSol = this.D.SUP_SOLUCOES.find(s => s.id === v) || this.supSol;
        this.supTempo = 0; this.supBubbles = []; this.supFase = 'esperando'; this.supDropT = 0;
        return { say: `${this.supSol.nome} selecionada: ${this.supSol.nota}.` };
      }
      case 'arrcaminho': {
        this.arrCaminho = this.D.CAMINHOS.find(c => c.id === v) || this.arrCaminho;
        this.arrModo = 'h2o2'; this.arrPontos = [];
        if (this.app) fillOptGrid('arr-grid-ref', this.D.ARRHENIUS_EXTRA.map(r => ({
          value: r.id, nome: r.nome, dot: r.dot, extra: `Ea ${fmt(r.ea, 0)} kJ/mol`,
        })), null);
        return { say: `${this.arrCaminho.nome} selecionado. Pontos anteriores foram limpos — meça pelo menos duas temperaturas nesse caminho.` };
      }
      case 'arrref': {
        this.arrRefReacao = this.D.ARRHENIUS_EXTRA.find(r => r.id === v) || this.arrRefReacao;
        this.arrModo = 'referencia'; this.arrPontos = [];
        if (this.app) fillOptGrid('arr-grid', this.D.CAMINHOS.map(c => ({
          value: c.id, nome: c.nome, dot: c.dot, extra: `Ea ${c.ea} kJ/mol`,
        })), null);
        return { say: `${this.arrRefReacao.nome} selecionada, com Ea e fator pré-exponencial reais de literatura. Pontos anteriores foram limpos.` };
      }
      case 'arrT': this.arrT = v; break;

      /* ── modo 7: mecanismo de reacao ── */
      case 'mecId': {
        this.mec = this.D.MECANISMOS.find(m => m.id === v) || this.mec;
        this.mecEtapa = 0; this.mecPlay = false; this.mecT = 0;
        this._mecSync();
        return { say: `${this.mec.nome}. Equação global: ${this.mec.global}. Lei de velocidade medida: ${this.mec.lei}. ${this.mec.pega}` };
      }
      case 'mecEtapa': {
        this.mecEtapa = clamp(Math.round(v), 0, this.mec.etapas.length - 1);
        const e = this.mec.etapas[this.mecEtapa];
        return { say: `${this.mecEtapa + 1}ª etapa: ${e.eq}. ${e.lenta ? 'É a etapa LENTA, determinante da velocidade.' : 'Etapa rápida.'} Molecularidade ${e.mol}, energia de ativação ${fmt(e.ea, 1)} quilojoules por mol. ${e.nota}` };
      }
      case 'mecview': {
        this.mecView = v;
        return { say: v === 'fila'
          ? 'Visão do gargalo: cada etapa é um cano, e a largura vem da energia de ativação. A vazão que sai é a do cano mais estreito.'
          : 'Visão das etapas elementares, com a etapa lenta destacada e a soma que reproduz a equação global.' };
      }
    }
    return {};
  }

  action(name) {
    if (name === 'col-reset') { this._semear(); this.efetivas = 0; announce('Mistura reiniciada.'); }
    if (name === 'sup-play') {
      if (this.supFase === 'esperando') { this.supFase = 'caindo'; this.supDropT = 0; announce('Depositando o sólido na solução...'); }
    }
    if (name === 'sup-reset') {
      this.supTempo = 0; this.supBubbles = []; this.supFase = 'esperando'; this.supDropT = 0;
      announce('Nova amostra pronta — deposite pra começar.');
    }
    if (name === 'cur-play') { this.curRunning = true; announce('Corrida iniciada.'); }
    if (name === 'cur-reset') { this.trel = 0; this.curRunning = false; announce('Corrida reiniciada no tempo zero.'); }
    if (name === 'ord-play') {
      this.ordRunning = !this.ordRunning;
      announce(this.ordRunning ? 'Corrida iniciada.' : 'Corrida pausada.');
    }
    if (name === 'ord-reset') { this.ordTrel = 0; this.ordRunning = false; announce('Corrida de ordem reiniciada no tempo zero.'); }
    if (name === 'arr-medir') {
      const atual = this._arrAtual();
      this.arrPontos.push({ T: this.arrT, ea: atual.ea, aFator: atual.aFator });
      const reg = this._regressaoArrhenius();
      announce(reg
        ? `Ponto medido: k=${atual.k.toExponential(2)} em ${fmt(this.arrT, 0)} graus. Com ${this.arrPontos.length} pontos, Ea calculada é ${fmt(reg.ea, 1)} quilojoules por mol.`
        : `Ponto medido: k=${atual.k.toExponential(2)} em ${fmt(this.arrT, 0)} graus. Meça mais uma temperatura diferente para calcular a reta.`);
    }
    if (name === 'arr-reset') { this.arrPontos = []; announce('Pontos medidos apagados.'); }
    /* ══════════ modo 7 — mecanismo ══════════ */
    if (name === 'mec-play') {
      this.mecPlay = !this.mecPlay;
      this.mecT = 0;
      if (this.mecPlay) this.mecEtapa = 0;
      this._mecSync();
      playTone(this.mecPlay ? 760 : 420, .08, .05);
      announce(this.mecPlay
        ? 'Reproduzindo o mecanismo etapa por etapa. Repare que a etapa lenta demora muito mais que a rápida — é ela que governa o tempo total.'
        : 'Reprodução pausada.');
    }
    if (name === 'mec-lei') {
      const m = this.mec;
      const lenta = m.etapas.find(e => e.lenta);
      const partes = [
        `${m.nome}.`,
        `A equação global é ${m.global}, mas a lei de velocidade medida no laboratório é ${m.lei}.`,
        `Motivo: a etapa lenta é ${lenta.eq}, e é dela que saem os expoentes — numa etapa ELEMENTAR, e só nela, o expoente é igual ao coeficiente.`,
      ];
      if (m.inter && m.inter.length) partes.push(`${m.inter.join(' e ')} é intermediário: aparece numa etapa e é consumido na outra, então não sobra na global.`);
      if (m.cat) partes.push(`${m.cat} é catalisador: é consumido e depois regenerado, então também não aparece na global — mas está na lei de velocidade porque participa da etapa lenta.`);
      partes.push(m.pega);
      playTone(700, .08, .06);
      announce(partes.join(' '), 'assertive');
    }
    if (name === 'ene-status') {
      const sem = this.D.CAMINHOS[0], c = this.caminho;
      const f0 = this._fracao(sem.ea), f1 = this._fracao(c.ea);
      announce(`${c.nome}: energia de ativação ${c.ea} contra ${sem.ea} quilojoules por mol sem catalisador. A ${fmt(this.tene, 0)} graus a fração de moléculas capazes de reagir passa de ${f0.toExponential(2)} para ${f1.toExponential(2)}. O delta H continua igual a menos 98 quilojoules por mol.`);
    }
  }

  /* ── modelo ── */
  /** Fator de ENERGIA (um dos dois requisitos da colisão efetiva —
   *  Brown, cap. de Cinética). O outro requisito, orientação, é
   *  verificado geometricamente em _orientOk(), não por sorteio. */
  _pEf() { return clamp(0.05 * Math.pow(2, (this.tcol - 20) / 10) * (this.cat ? 4 : 1), 0, 0.95); }

  /** Janela de orientação favorável — modelo didático genérico (não
   *  é um fator estérico medido; fatores estéricos reais variam muito
   *  de reação pra reação e não há valor tabelado pro H₂O₂ em fonte
   *  introdutória). ±70° de tolerância entre a "face reativa" de cada
   *  partícula e a direção que liga os dois centros. */
  _TOL_ORIENT = Math.PI * 70 / 180;
  _angDiff(a1, a2) {
    let d = Math.abs(a1 - a2) % (Math.PI * 2);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  }
  _orientOk(a, b) {
    const angAB = Math.atan2(b.y - a.y, b.x - a.x);
    return this._angDiff(a.ang, angAB) < this._TOL_ORIENT
        && this._angDiff(b.ang, angAB + Math.PI) < this._TOL_ORIENT;
  }
  /** Fração teórica de pares com orientação favorável (janela/2π em cada partícula). */
  _fracaoOrientacao() { return Math.pow((this._TOL_ORIENT * 2) / (Math.PI * 2), 1); }
  /** Reação/via atualmente selecionada na Curva — H₂O₂ (A ilustrativo
   *  compartilhado) ou uma reação de referência (Ea e A reais próprios). */
  _curReacaoAtual() {
    if (this.curTipo === 'referencia') {
      const r = this.curRefReacao;
      return { ea: r.ea, aFator: r.aFator, nome: r.nome };
    }
    const c = this.curCaminho;
    return { ea: c.ea, aFator: this._aRef(), nome: c.nome };
  }
  /** k da corrida vem da MESMA equação de Arrhenius usada no modo
   *  Energia/Arrhenius — troca o multiplicador arbitrário antigo por
   *  um valor real, calculado a partir da reação escolhida. */
  _k() { const r = this._curReacaoAtual(); return this._kRef(r.ea, r.aFator, this.tcur); }
  _conc(t) { return this.a0 * Math.exp(-this._k() * t); }
  /** Janela de tempo do gráfico: sempre mostra ~6 meias-vidas, entre
   *  0,5 s e 60 s. Necessário porque, com k real de Arrhenius, um
   *  caminho catalisado (Ea baixa) pode ter meia-vida muito menor que
   *  a via sem catalisador — sem isso a curva "sumiria" em janelas
   *  de tempo fixas. */
  _curTmax() { return clamp(6 * Math.log(2) / this._k(), 0.5, 60); }
  /** Reajusta t1/t2 e os limites dos sliders sempre que k muda
   *  (troca de caminho ou de temperatura), pra continuarem dentro da
   *  janela visível da curva. */
  _syncCurRange() {
    const tmax = this._curTmax();
    if (this.trel > tmax) this.trel = tmax;
    if (this.t2 > tmax) this.t2 = tmax;
    if (this.t1 >= this.t2) this.t1 = Math.max(0, this.t2 * 0.2);
    if (this.app) {
      const s1 = document.getElementById('cur-t1'), s2 = document.getElementById('cur-t2');
      const passo = Math.max(tmax / 100, 0.001);
      if (s1) { s1.max = tmax; s1.step = passo; }
      if (s2) { s2.max = tmax; s2.min = passo; s2.step = passo; }
      this.app.syncSlider('cur-t1', this.t1);
      this.app.syncSlider('cur-t2', this.t2);
    }
  }
  _fracao(ea) { return Math.exp(-ea / (this.D.R_KJ * (this.tene + 273.15))); }

  /* ── leis de velocidade integradas — OpenStax Chemistry 2e, cap. 12 ──
     ordem 0: [A]=[A]₀−kt · ordem 1: [A]=[A]₀e^(−kt) · ordem 2: 1/[A]=1/[A]₀+kt */
  _concOrdem(n, a0, k, t) {
    if (n === 0) return Math.max(0, a0 - k * t);
    if (n === 1) return a0 * Math.exp(-k * t);
    return a0 / (1 + k * a0 * t);
  }
  /* meia-vida: diminui (0), constante (1ª), aumenta com o tempo (2ª) */
  _meiaVidaOrdem(n, a0, k) {
    if (n === 0) return a0 / (2 * k);
    if (n === 1) return Math.log(2) / k;
    return 1 / (k * a0);
  }
  /* transformação que deveria linearizar cada ordem */
  _transformOrdem(n) {
    if (n === 0) return c => c;
    if (n === 1) return c => Math.log(Math.max(c, 1e-4));
    return c => 1 / Math.max(c, 1e-4);
  }
  _labelOrdem(n) {
    return n === 0 ? '[A] × t' : n === 1 ? 'ln[A] × t' : '1/[A] × t';
  }

  /* ── superfície de contato ── mais fragmentos = maior área exposta =
     reação mais rápida, mesmo volume final (k0 é constante didática,
     igual em espírito ao k de _k(); o que importa é k ∝ nº de pedaços) */
  _kSup() { return 0.03 * this.nfrag * this.supSubst.relK * this.supSol.relK; }
  _volSup(t) { return 1 - Math.exp(-this._kSup() * t); } // fração de V∞ já liberada

  /* ── gráfico de Arrhenius ── A_REF é um fator pré-exponencial
     ilustrativo (não é valor de literatura): calibrado só pra que a
     via "sem catalisador" dê k≈0,05 s⁻¹ a 25 °C, mesma ordem de
     grandeza do modo Curva. As Ea usadas são as mesmas, reais e já
     sourced, do array CAMINHOS. As reações de referência (N₂O₅,
     ciclopropano) usam Ea E A próprios, de fonte real — ver
     ARRHENIUS_EXTRA em dadoscinetica.js. */
  _aRef() {
    if (this._aRefCache) return this._aRefCache;
    const semEa = this.D.CAMINHOS[0].ea;
    this._aRefCache = 0.05 / Math.exp(-semEa / (this.D.R_KJ * 298.15));
    return this._aRefCache;
  }
  _kArr(ea, tC) { return this._aRef() * Math.exp(-ea / (this.D.R_KJ * (tC + 273.15))); }
  /** Versão genérica com A explícito — usada pelas reações de referência. */
  _kRef(ea, aFator, tC) { return aFator * Math.exp(-ea / (this.D.R_KJ * (tC + 273.15))); }

  /** Dados da "via atual" no modo Arrhenius, seja H₂O₂ ou referência. */
  _arrAtual() {
    if (this.arrModo === 'referencia') {
      const r = this.arrRefReacao;
      return { ea: r.ea, aFator: r.aFator, k: this._kRef(r.ea, r.aFator, this.arrT), nome: r.nome, dot: r.dot, eq: r.eq };
    }
    const c = this.arrCaminho;
    const aFator = this._aRef();
    return { ea: c.ea, aFator, k: this._kRef(c.ea, aFator, this.arrT), nome: c.nome, dot: c.dot };
  }

  /** Regressão linear simples (mínimos quadrados) de ln k × 1/T.
   *  Retorna a Ea e o A extraídos da inclinação/intercepto, ou null
   *  se houver menos de 2 pontos (não dá pra traçar reta). Cada ponto
   *  já guarda seu próprio Ea/A no momento em que foi medido. */
  _regressaoArrhenius() {
    const pts = this.arrPontos;
    if (pts.length < 2) return null;
    const xs = pts.map(p => 1 / (p.T + 273.15));
    const ys = pts.map(p => Math.log(this._kRef(p.ea, p.aFator, p.T)));
    const n = pts.length;
    const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
    const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sxx = xs.reduce((a, x) => a + x * x, 0);
    const denom = n * sxx - sx * sx;
    if (Math.abs(denom) < 1e-12) return null; // pontos na mesma T — sem inclinação definida
    const slope = (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;
    return { slope, intercept, ea: -slope * this.D.R_KJ, aFator: Math.exp(intercept) };
  }

  _semear() {
    const mk = n => Array.from({ length: n }, () => ({
      x: (Math.random() - .5) * 300, y: (Math.random() - .5) * 200,
      vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2,
      ang: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * 3.2,
    }));
    this.A = mk(this.na); this.B = mk(this.nb); this.C = []; this.flashes = []; this.flashesQuase = [];
    this.tentativas = 0;
  }

  update(dt, app) {
    // Reproducao do mecanismo: o tempo que cada etapa ocupa e proporcional a
    // 1/vazao — a etapa lenta demora muito mais na tela, que e o ponto.
    if (this.modo === 'mecanismo') {
      this.mecT += dt;
      if (this.mecPlay) {
        const vz = this._mecVazoes();
        const dur = i => clamp(0.6 / Math.max(0.05, vz[i]), 0.6, 4.5);
        let acc = 0, idx = 0;
        const total = this.mec.etapas.reduce((a, _, i) => a + dur(i), 0);
        const t = this.mecT % total;
        for (let i = 0; i < this.mec.etapas.length; i++) {
          if (t < acc + dur(i)) { idx = i; break; }
          acc += dur(i);
        }
        if (idx !== this.mecEtapa) {
          this.mecEtapa = idx;
          this._mecSync();
          if (app) app.refresh();
        }
      }
    }
    this.fase += dt;
    if (this.modo === 'colisoes') this._updCol(dt, app);
    else if (this.modo === 'superficie') this._updSup(dt, app);
    else if (this.modo === 'curva' && this.curRunning) {
      const tmax = this._curTmax();
      this.trel = Math.min(tmax, this.trel + dt * (tmax / 20));
    }
    else if (this.modo === 'ordem' && this.ordRunning) this.ordTrel = Math.min(60, this.ordTrel + dt * 2.5);
  }

  /** Duração da animação de queda do sólido até a superfície do líquido. */
  _SUP_DROP_DUR = 0.7;

  _updSup(dt, app) {
    if (this.supFase === 'esperando') return; // nada acontece até o usuário depositar
    if (this.supFase === 'caindo') {
      this.supDropT += dt;
      if (this.supDropT >= this._SUP_DROP_DUR) { this.supFase = 'reagindo'; this.supTempo = 0; playTone(500, .06, .04); }
      return;
    }
    // fase 'reagindo'
    const tmax = 60;
    this.supTempo = Math.min(tmax, this.supTempo + dt * 2.5);
    const taxaInst = this._kSup() * Math.exp(-this._kSup() * this.supTempo); // dV/dt instantânea
    const geom = this._supBoxGeom(app.W, app.H);
    kBubbles(this.supBubbles, dt, geom, taxaInst * 40, { topo: geom.y });
  }

  /** Geometria do interior do béquer, calculada sem desenhar — usada
   *  tanto no update() (posicionar bolhas) quanto no draw() (desenhar
   *  o béquer de verdade com kBeaker), pra nunca dessincronizar.
   *  Proporcional ao canvas real (W,H), não mais um tamanho fixo.
   *  bw/bh = tamanho do béquer por fora; x/y/w/h = retângulo do
   *  líquido por dentro (mesmo contrato que kBeaker() devolve). */
  _supBoxGeom(W, H) {
    const bw = clamp(W * .34, 220, 420), bh = clamp(H * .5, 220, 420);
    const cx = W / 2, topY = H / 2 - bh * .55, level = .6;
    const lh = level * (bh - 10), ly = topY + bh - lh;
    return { cx, topY, bw, bh, x: cx - bw / 2 + 4, y: ly, w: bw - 8, h: lh };
  }

  /** Geometria do recipiente de colisões — responsiva ao tamanho real
   *  do canvas (antes era um retângulo fixo, sempre do mesmo tamanho
   *  não importava a janela). Coordenadas locais, origem no centro. */
  _colBoxGeom(W, H) {
    const bw = clamp(W * .62, 300, 620), bh = clamp(H * .56, 220, 460);
    return { x: -bw / 2, y: -bh / 2, w: bw, h: bh };
  }

  /** Resolução de colisão elástica robusta entre duas partículas de
   *  massas iguais. Corrige o bug clássico de "congelamento": inverter
   *  velocidade toda vez que a distância ficar pequena, sem separar as
   *  posições nem checar se elas ainda estão se aproximando, faz as
   *  partículas tremerem no lugar (a velocidade some inteira a cada
   *  quadro e volta ao normal no seguinte). Aqui: (1) sempre separa as
   *  posições pra não ficarem sobrepostas no próximo quadro, e (2) só
   *  troca velocidade se o movimento relativo for de aproximação. */
  _resolveColisao(a, b, minDist) {
    let dx = b.x - a.x, dy = b.y - a.y;
    let dist = Math.hypot(dx, dy);
    if (dist < 1e-4) { dx = 1; dy = 0; dist = 1; } // sobrepostas: separa numa direção arbitrária
    if (dist >= minDist) return false;
    const nx = dx / dist, ny = dy / dist;
    const overlap = (minDist - dist) / 2 + .2;
    a.x -= nx * overlap; a.y -= ny * overlap;
    b.x += nx * overlap; b.y += ny * overlap;
    const velAlongNormal = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (velAlongNormal < 0) {
      a.vx += velAlongNormal * nx; a.vy += velAlongNormal * ny;
      b.vx -= velAlongNormal * nx; b.vy -= velAlongNormal * ny;
    }
    return true;
  }

  _updCol(dt, app) {
    const vel = isReduced() ? 0 : 40 * Math.pow(1.03, this.tcol - 25);
    const box = this._colBoxGeom(app.W, app.H);
    const mover = arr => arr.forEach(p => {
      p.x += p.vx * vel * dt; p.y += p.vy * vel * dt;
      if (p.ang != null) p.ang += (p.spin || 0) * dt;
      if (p.x < box.x || p.x > box.x + box.w) { p.vx *= -1; p.x = clamp(p.x, box.x, box.x + box.w); }
      if (p.y < box.y || p.y > box.y + box.h) { p.vy *= -1; p.y = clamp(p.y, box.y, box.y + box.h); }
    });
    mover(this.A); mover(this.B); mover(this.C);

    // Colisão FÍSICA (sem reação química) entre partículas que não
    // reagem entre si: mesmo tipo (A-A, B-B, C-C) ou produto já
    // formado com A/B. Isso evita que fiquem se sobrepondo — só troca
    // as velocidades (ricochete), nunca gera flash nem produto.
    const ricocheteia = arr => {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) this._resolveColisao(arr[i], arr[j], 12);
      }
    };
    const ricocheteiaCruzado = (arr1, arr2) => {
      arr1.forEach(a => arr2.forEach(b => this._resolveColisao(a, b, 12)));
    };
    ricocheteia(this.A); ricocheteia(this.B); ricocheteia(this.C);
    ricocheteiaCruzado(this.A, this.C); ricocheteiaCruzado(this.B, this.C);

    const pEf = this._pEf();
    this.janela += dt;
    for (let i = this.A.length - 1; i >= 0; i--) {
      for (let j = this.B.length - 1; j >= 0; j--) {
        const a = this.A[i], b = this.B[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 12) {
          this.tentativas++;
          const energiaOk = Math.random() < pEf;
          const orientOk = energiaOk && this._orientOk(a, b);
          if (energiaOk && orientOk) {
            this.flashes.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, t: 0 });
            this.C.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2 });
            this.A.splice(i, 1); this.B.splice(j, 1);
            this.efetivas++;
          } else {
            if (energiaOk) this.flashesQuase.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, t: 0 });
            this._resolveColisao(a, b, 12);
          }
          break;
        }
      }
    }
    if (this.janela >= 1) {
      this.taxa = this.efetivas / this.janela;
      this.taxaMedida = this.tentativas > 0 ? this.efetivas / this.tentativas : 0;
      this.efetivas = 0; this.tentativas = 0; this.janela = 0;
    }
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].t += dt;
      if (this.flashes[i].t > .5) this.flashes.splice(i, 1);
    }
    for (let i = this.flashesQuase.length - 1; i >= 0; i--) {
      this.flashesQuase[i].t += dt;
      if (this.flashesQuase[i].t > .35) this.flashesQuase.splice(i, 1);
    }
  }

  draw(ctx, W, H, app) {
    if (this.modo === 'colisoes') this._drawCol(ctx, W, H);
    else if (this.modo === 'superficie') this._drawSup(ctx, W, H);
    else if (this.modo === 'curva') this._drawCur(ctx, W, H);
    else if (this.modo === 'ordem') this._drawOrdem(ctx, W, H);
    else if (this.modo === 'arrhenius') this._drawArr(ctx, W, H);
    else if (this.modo === 'mecanismo') this._drawMec(ctx, W, H);
    else this._drawEne(ctx, W, H);
  }

  _drawCol(ctx, W, H) {
    const box = this._colBoxGeom(W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2 - 10);
    // recipiente
    ctx.strokeStyle = cssVar('--glass', 'rgba(148,163,184,.38)');
    ctx.lineWidth = 2.2;
    kRound(ctx, box.x - 3, box.y - 3, box.w + 6, box.h + 6, 10); ctx.stroke();

    const cA = cssVar('--accent-cyan', '#22d3ee');
    const cB = cssVar('--accent-amber', '#fbbf24');
    const cC = cssVar('--accent-ok', '#4ade80');
    const cQuase = cssVar('--accent-exo', '#f87171');

    /** Desenha uma partícula com um tracinho claro indicando a "face
     *  reativa" (orientação) — é o que torna o requisito de orientação
     *  visível, não só teórico. */
    const desenhaParticula = (p, cor, r) => {
      ctx.save();
      ctx.fillStyle = cor;
      const grad = ctx.createRadialGradient(p.x - r * .3, p.y - r * .3, r * .1, p.x, p.y, r * 1.3);
      grad.addColorStop(0, cor); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.globalAlpha = .35; ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = cor;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      if (p.ang != null) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.globalAlpha = .9;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.ang) * r * 1.7, p.y + Math.sin(p.ang) * r * 1.7);
        ctx.stroke();
      }
      ctx.restore();
    };

    this.A.forEach(p => desenhaParticula(p, cA, 6));
    this.B.forEach(p => desenhaParticula(p, cB, 6));
    this.C.forEach(p => {
      ctx.fillStyle = cC;
      ctx.beginPath(); ctx.arc(p.x - 3.5, p.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x + 3.5, p.y, 5, 0, Math.PI * 2); ctx.fill();
    });

    this.flashes.forEach(f => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t / .5);
      ctx.strokeStyle = cC; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(f.x, f.y, 6 + f.t * 30, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
    this.flashesQuase.forEach(f => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t / .35) * .8;
      ctx.strokeStyle = cQuase; ctx.lineWidth = 1.6;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.arc(f.x, f.y, 5 + f.t * 16, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    if (this.cat) {
      ctx.save();
      ctx.globalAlpha = .16;
      ctx.fillStyle = cssVar('--accent-main', '#4ade80');
      kRound(ctx, box.x - 3, box.y - 3, box.w + 6, box.h + 6, 10); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // legenda
    const ly = H - 26;
    const leg = [['A', cA], ['B', cB], ['quase (energia OK, orientação errada)', cQuase], ['C (produto)', cC]];
    let lx = 40;
    leg.forEach((l) => {
      ctx.fillStyle = l[1];
      ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
      kLabel(ctx, l[0], lx + 10, ly, { size: 11, align: 'left' });
      lx += 26 + l[0].length * 6.4;
    });
  }

  /**
   * Modo Superfície de Contato. Reaproveita kBeaker (recipiente com
   * líquido) e kBubbles/kDrawBubbles (bolhas subindo) do kit de
   * desenho compartilhado. Os "pedaços" do sólido encolhem juntos
   * conforme a reação avança; quanto mais fragmentos ou mais reativa
   * a substância, mais rápido o encolhimento — mesmo volume final.
   * O gráfico de volume × tempo fica na aba Resultados (drawResultChart).
   */
  _drawSup(ctx, W, H) {
    const geom = this._supBoxGeom(W, H);
    const s = this.supSubst;
    const box = kBeaker(ctx, geom.cx, geom.topY, geom.bw, geom.bh, 0.6, 'rgba(125,211,252,.32)', { rotulo: this.supSol.nome });

    const fracaoRestante = this.supFase === 'reagindo' ? Math.exp(-this._kSup() * this.supTempo) : 1;
    const nDesenho = Math.min(this.nfrag, 16);
    const cols = Math.ceil(Math.sqrt(nDesenho));
    const rows = Math.ceil(nDesenho / cols);
    const cellW = box.w / cols, cellH = box.h / rows;
    const lado = Math.min(cellW, cellH) * 0.6 * Math.cbrt(Math.max(fracaoRestante, 0.02));

    // deslocamento vertical: 'esperando' paira acima do béquer; 'caindo'
    // anima a queda; 'reagindo' já está assentado (deslocamento zero)
    let offsetY = 0;
    if (this.supFase === 'esperando') offsetY = -(geom.topY - box.y) - 40;
    else if (this.supFase === 'caindo') {
      const u = easeIO(clamp(this.supDropT / this._SUP_DROP_DUR, 0, 1));
      offsetY = lerp(-(geom.topY - box.y) - 40, 0, u);
    }

    ctx.save();
    ctx.fillStyle = s.cor;
    for (let i = 0; i < nDesenho; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const px = box.x + cellW * (col + .5), py = box.y + cellH * (row + .5) + offsetY;
      kRound(ctx, px - lado / 2, py - lado / 2, lado, lado, 2);
      ctx.fill();
    }
    ctx.restore();

    kDrawBubbles(ctx, this.supBubbles, 'rgba(255,255,255,.7)');

    if (this.supFase === 'esperando') {
      kLabel(ctx, `${s.nome} pronto — clique em "Depositar e iniciar"`, geom.cx, geom.topY - Math.abs(offsetY) - 26,
        { size: 11, color: cssVar('--text-secondary') });
    }
  }

  /**
   * Gráfico auxiliar mostrado na aba Resultados (não mais no canvas
   * principal) — volume de gás liberado × tempo para a amostra atual.
   * Retorna true se desenhou algo (o App usa isso pra mostrar/esconder
   * o canvas de resultados conforme o modo ativo).
   */
  drawResultChart(ctx, W, H) {
    if (this.modo !== 'superficie') return false;
    ctx.clearRect(0, 0, W, H);
    const A = kAxes(ctx, {
      x: 46, y: 14, w: W - 62, h: H - 42, xmin: 0, xmax: 60, ymin: 0, ymax: 1.05,
      xticks: [0, 30, 60], yticks: [0, .5, 1], fmty: v => fmt(v * 100, 0) + '%',
      xlab: 'Tempo (s)', ylab: `${this.supSubst.gas} liberado`,
    });
    const pts = [];
    for (let t = 0; t <= 60; t += 1) pts.push([t, this._volSup(t)]);
    kLine(ctx, pts, A.px, A.py, { color: cssVar('--accent-main', '#4ade80'), w: 2.2 });
    ctx.fillStyle = cssVar('--accent-ok', '#4ade80');
    ctx.beginPath(); ctx.arc(A.px(this.supTempo), A.py(this._volSup(this.supTempo)), 4.5, 0, Math.PI * 2); ctx.fill();
    return true;
  }

  _drawCur(ctx, W, H) {
    // ANTES: `Math.min(W - 100, 560)` — o grafico travava em 560x340 px.
    const est = isEstreito(W);
    const gw = Math.max(180, W - (est ? 70 : 100)), gh = Math.max(140, H - (est ? 64 : 80));
    const tmax = this._curTmax();
    const A = kAxes(ctx, {
      x: 70, y: 40, w: gw, h: gh, xmin: 0, xmax: tmax, ymin: 0, ymax: this.a0 * 1.05,
      xticks: [0, tmax * .25, tmax * .5, tmax * .75, tmax], yticks: [0, this.a0 * .5, this.a0],
      fmtx: v => fmt(v, tmax < 2 ? 2 : tmax < 10 ? 1 : 0), fmty: v => fmt(v, 2),
      xlab: 'Tempo (s)', ylab: '[A] (mol/L)',
    });

    // curva completa até o tempo corrido
    const passo = tmax / 120;
    const pts = [];
    for (let t = 0; t <= this.trel; t += passo) pts.push([t, this._conc(t)]);
    if (pts.length > 1) kLine(ctx, pts, A.px, A.py, { color: cssVar('--accent-main', '#4ade80'), w: 2.6 });

    // curva prevista (tracejada) até o fim da janela
    const fut = [];
    for (let t = 0; t <= tmax; t += passo) fut.push([t, this._conc(t)]);
    kLine(ctx, fut, A.px, A.py, { color: cssVar('--accent-main'), w: 1.2, dash: [4, 4], alpha: .35 });

    // secante entre t1 e t2
    const c1 = this._conc(this.t1), c2 = this._conc(this.t2);
    ctx.save();
    ctx.strokeStyle = cssVar('--accent-amber', '#fbbf24');
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(A.px(this.t1), A.py(c1)); ctx.lineTo(A.px(this.t2), A.py(c2)); ctx.stroke();
    ctx.restore();
    [[this.t1, c1], [this.t2, c2]].forEach(p => {
      ctx.fillStyle = cssVar('--accent-amber');
      ctx.beginPath(); ctx.arc(A.px(p[0]), A.py(p[1]), 4.5, 0, Math.PI * 2); ctx.fill();
    });

    // meia-vida
    const th = Math.log(2) / this._k();
    if (th <= tmax) {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = cssVar('--accent-secondary', '#a78bfa');
      ctx.beginPath(); ctx.moveTo(A.px(th), A.py(0)); ctx.lineTo(A.px(th), A.py(this.a0 / 2)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(A.px(0), A.py(this.a0 / 2)); ctx.lineTo(A.px(th), A.py(this.a0 / 2)); ctx.stroke();
      ctx.restore();
    }

    // ponto atual correndo
    ctx.fillStyle = cssVar('--accent-ok', '#4ade80');
    ctx.beginPath(); ctx.arc(A.px(this.trel), A.py(this._conc(this.trel)), 5.5, 0, Math.PI * 2); ctx.fill();
  }

  /**
   * Modo Ordem de Reação. Mostra SÓ o gráfico da ordem selecionada —
   * concentração bruta [A]×t ou a linearização correspondente a essa
   * ordem (ln[A]×t para 1ª, 1/[A]×t para 2ª) — sem exibir as outras
   * ordens ao mesmo tempo, pra manter o foco na ordem escolhida.
   */
  _drawOrdem(ctx, W, H) {
    // nDados = ordem que realmente gera a curva (no modo secreto é a
    // ordem oculta sorteada); nView = ordem escolhida nos botões, usada
    // só pra decidir QUAL transformação mostrar (o "palpite" no secreto).
    const nDados = this.ordSecreto ? this.ordOculta : this.nordem;
    const nView = this.nordem;
    const a0 = this.orda0, k = this.ordk, tmax = 60;
    // ANTES: `Math.min(W - 70, 720)` / `Math.min(H - 60, 420)` — tetos fixos.
    const est = isEstreito(W);
    const gx = est ? 54 : 76, gy = 40;
    const gw = Math.max(180, W - gx - (est ? 22 : 40));
    const gh = Math.max(140, H - (est ? 56 : 60));

    if (this.ordview === 'conc') {
      const A = kAxes(ctx, {
        x: gx, y: gy, w: gw, h: gh, xmin: 0, xmax: tmax, ymin: 0, ymax: a0 * 1.05,
        xticks: [0, 15, 30, 45, 60], yticks: [0, a0 / 2, a0],
        fmty: v => fmt(v, 2), xlab: 'Tempo (s)', ylab: '[A] (mol/L)',
      });
      const pts = [];
      for (let t = 0; t <= tmax; t += .5) pts.push([t, this._concOrdem(nDados, a0, k, t)]);
      kLine(ctx, pts, A.px, A.py, { color: cssVar('--accent-main', '#4ade80'), w: 2.8 });

      const cAtual = this._concOrdem(nDados, a0, k, this.ordTrel);
      ctx.fillStyle = cssVar('--accent-ok', '#4ade80');
      ctx.beginPath(); ctx.arc(A.px(this.ordTrel), A.py(cAtual), 6, 0, Math.PI * 2); ctx.fill();

      if (!this.ordSecreto) {
        const th = this._meiaVidaOrdem(nDados, a0, k);
        if (th > 0 && th <= tmax) {
          ctx.save();
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = cssVar('--accent-secondary', '#a78bfa');
          ctx.beginPath(); ctx.moveTo(A.px(th), A.py(0)); ctx.lineTo(A.px(th), A.py(a0 / 2)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(A.px(0), A.py(a0 / 2)); ctx.lineTo(A.px(th), A.py(a0 / 2)); ctx.stroke();
          ctx.restore();
        }
      }
    } else {
      const transform = this._transformOrdem(nView);
      const pts = [];
      for (let t = 0; t <= tmax; t += .5) pts.push([t, transform(this._concOrdem(nDados, a0, k, t))]);
      const ys = pts.map(p => p[1]);
      const ymin = Math.min(...ys), ymax = Math.max(...ys), pad = (ymax - ymin) * .12 || 1;
      const A = kAxes(ctx, {
        x: gx, y: gy, w: gw, h: gh, xmin: 0, xmax: tmax, ymin: ymin - pad, ymax: ymax + pad,
        xticks: [0, 15, 30, 45, 60], yticks: [ymin, (ymin + ymax) / 2, ymax],
        fmty: v => fmt(v, 2), xlab: 'Tempo (s)', ylab: this._labelOrdem(nView).split(' × ')[0],
      });
      kLine(ctx, pts, A.px, A.py, { color: cssVar('--accent-main', '#4ade80'), w: 2.8 });

      const cAtual = transform(this._concOrdem(nDados, a0, k, this.ordTrel));
      ctx.fillStyle = cssVar('--accent-ok', '#4ade80');
      ctx.beginPath(); ctx.arc(A.px(this.ordTrel), A.py(cAtual), 6, 0, Math.PI * 2); ctx.fill();
    }

    if (this.ordSecreto) {
      const acertou = this.nordem === this.ordOculta;
      kChip(ctx, acertou ? '🔓 acertou! é essa ordem' : '🔒 ordem oculta — qual gráfico fica reto?',
        gx + gw / 2, gy - 18, { fg: acertou ? cssVar('--accent-ok') : cssVar('--accent-amber'), size: 11, bold: true });
    }
  }

  _drawEne(ctx, W, H) {
    const D = this.D;
    this._drawEneToggle(ctx, W);

    if (this.eneView === 'maxwell') this._drawEneMaxwell(ctx, W, H);
    else this._drawEneCaminho(ctx, W, H);
  }

  /** Botão clicável desenhado dentro do canvas — alterna a visualização
   *  do modo Energia. Hit-test correspondente em onCanvasClick(). */
  _drawEneToggle(ctx, W) {
    const r = this._eneBtnRect(W);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r.w / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(74,222,128,.14)';
    ctx.fill();
    ctx.strokeStyle = cssVar('--accent-main', '#4ade80');
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
    kLabel(ctx, '⇄', cx, cy + 1, { size: 17, bold: true, color: cssVar('--accent-main', '#4ade80') });
  }

  _drawEneCaminho(ctx, W, H) {
    const D = this.D;
    // ANTES: teto de 760x400 px.
    const est = isEstreito(W);
    const gw = Math.max(180, W - (est ? 76 : 110)), gh = Math.max(140, H - (est ? 72 : 90));
    const gx = 60, gy = 54;
    const emax = 110, emin = -120;
    const A = kAxes(ctx, {
      x: gx, y: gy, w: gw, h: gh, xmin: 0, xmax: 100, ymin: emin, ymax: emax,
      yticks: [-100, -50, 0, 50, 100], xticks: [],
      fmty: v => fmt(v, 0),
      xlab: 'Caminho da reação', ylab: 'Energia (kJ/mol)',
    });

    const perfil = (ea) => {
      const p = [];
      for (let x = 0; x <= 100; x += 2) {
        let e;
        if (x < 20) e = 0;
        else if (x > 80) e = D.DH;
        else {
          const u = (x - 20) / 60;
          const pico = Math.sin(u * Math.PI);
          e = lerp(0, D.DH, u) + ea * pico;
        }
        p.push([x, e]);
      }
      return p;
    };

    const duasEtapas = this.mecanismo === 'duas' && this.caminho.id === 'iodeto';
    const sem = D.CAMINHOS[0];

    if (duasEtapas) {
      const eaLenta = this.caminho.ea; // Ea medida da via — é a Ea da etapa lenta/determinante
      const eaRapida = eaLenta * 0.55; // ilustrativo: sem valor tabelado em fonte introdutória
      const vale = D.DH * 0.4;         // posição qualitativa do intermediário (só forma do "vale")
      const perfil2 = () => {
        const p = [];
        for (let x = 0; x <= 100; x += 1) {
          let e;
          if (x < 10) e = 0;
          else if (x < 40) { const u = (x - 10) / 30; e = lerp(0, vale, u) + eaLenta * Math.sin(u * Math.PI); }
          else if (x < 50) e = vale;
          else if (x < 90) { const u = (x - 50) / 40; e = lerp(vale, D.DH, u) + eaRapida * Math.sin(u * Math.PI); }
          else e = D.DH;
          p.push([x, e]);
        }
        return p;
      };
      kLine(ctx, perfil2(), A.px, A.py, { color: this.caminho.dot, w: 2.8 });

      const y0 = A.py(0), ytop1 = A.py(eaLenta), yvale = A.py(vale), ytop2 = A.py(vale + eaRapida), yf = A.py(D.DH);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = cssVar('--text-muted');
      [y0, yvale, yf].forEach(y => { ctx.beginPath(); ctx.moveTo(A.px(0), y); ctx.lineTo(A.px(100), y); ctx.stroke(); });
      ctx.restore();

      kArrow(ctx, A.px(20), y0, A.px(20), ytop1, { color: this.caminho.dot, w: 1.8 });
      kChip(ctx, 'Ea₁', A.px(20) + 26, (y0 + ytop1) / 2, { fg: this.caminho.dot, size: 10, bold: true });
      kArrow(ctx, A.px(65), yvale, A.px(65), ytop2, { color: cssVar('--text-secondary'), w: 1.6 });
      kChip(ctx, 'Ea₂', A.px(65) + 24, (yvale + ytop2) / 2, { fg: cssVar('--text-secondary'), size: 10 });
      ctx.fillStyle = cssVar('--accent-amber', '#fbbf24');
      ctx.beginPath(); ctx.arc(A.px(45), yvale, 4, 0, Math.PI * 2); ctx.fill();
      kArrow(ctx, A.px(92), y0, A.px(92), yf, { color: cssVar('--accent-exo', '#f87171'), w: 1.8 });
      kChip(ctx, 'ΔH', A.px(92) - 26, (y0 + yf) / 2, { fg: cssVar('--accent-exo'), size: 10, bold: true });
      kLabel(ctx, 'reagentes', A.px(6), y0 - 12, { size: 10 });
      kLabel(ctx, 'produtos', A.px(92), yf + 14, { size: 10 });
    } else {
      // caminho sem catalisador em fundo + caminho ativo em destaque
      if (this.caminho.id !== sem.id) {
        kLine(ctx, perfil(sem.ea), A.px, A.py, { color: sem.dot, w: 1.6, dash: [5, 4], alpha: .55 });
      }
      kLine(ctx, perfil(this.caminho.ea), A.px, A.py, { color: this.caminho.dot, w: 2.8 });

      // marcações de Ea e ΔH — só o símbolo; o valor numérico está na aba Resultados
      const ytop = A.py(this.caminho.ea), y0 = A.py(0), yf = A.py(D.DH);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = cssVar('--text-muted');
      [y0, ytop, yf].forEach(y => { ctx.beginPath(); ctx.moveTo(A.px(0), y); ctx.lineTo(A.px(100), y); ctx.stroke(); });
      ctx.restore();
      kArrow(ctx, A.px(14), y0, A.px(14), ytop, { color: this.caminho.dot, w: 1.8 });
      kChip(ctx, 'Ea', A.px(14) + 26, (y0 + ytop) / 2, { fg: this.caminho.dot, size: 10, bold: true });
      kArrow(ctx, A.px(92), y0, A.px(92), yf, { color: cssVar('--accent-exo', '#f87171'), w: 1.8 });
      kChip(ctx, 'ΔH', A.px(92) - 26, (y0 + yf) / 2, { fg: cssVar('--accent-exo'), size: 10, bold: true });
      kLabel(ctx, 'reagentes', A.px(8), y0 - 12, { size: 10 });
      kLabel(ctx, 'produtos', A.px(92), yf + 14, { size: 10 });
    }
  }

  _drawEneMaxwell(ctx, W, H) {
    const D = this.D;
    // ANTES: teto de 760x400 px.
    const est = isEstreito(W);
    const gw = Math.max(180, W - (est ? 76 : 110)), gh = Math.max(140, H - (est ? 84 : 110));
    const gx = 70, gy = 54;
    const B = kAxes(ctx, {
      x: gx, y: gy, w: gw, h: gh, xmin: 0, xmax: 120, ymin: 0, ymax: 1.05,
      xticks: [0, 40, 80, 120], yticks: [],
      xlab: 'Energia (kJ/mol)', ylab: 'Fração de moléculas',
    });
    const T = this.tene + 273.15, RT = D.R_KJ * T;
    const f = E => Math.sqrt(E) * Math.exp(-E / (RT * 12));
    let ymax = 0;
    for (let E = 0; E <= 120; E += 2) ymax = Math.max(ymax, f(E));
    const curva = [];
    for (let E = 0; E <= 120; E += 2) curva.push([E, f(E) / ymax]);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(B.px(this.caminho.ea), B.py(0));
    curva.filter(p => p[0] >= this.caminho.ea).forEach(p => ctx.lineTo(B.px(p[0]), B.py(p[1])));
    ctx.lineTo(B.px(120), B.py(0));
    ctx.closePath();
    ctx.fillStyle = this.caminho.dot; ctx.globalAlpha = .3; ctx.fill();
    ctx.restore();
    kLine(ctx, curva, B.px, B.py, { color: cssVar('--text-secondary'), w: 2 });
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = this.caminho.dot;
    ctx.beginPath(); ctx.moveTo(B.px(this.caminho.ea), B.py(0)); ctx.lineTo(B.px(this.caminho.ea), B.py(1)); ctx.stroke();
    ctx.restore();
    kChip(ctx, 'Ea', B.px(this.caminho.ea), B.py(1) - 14, { fg: this.caminho.dot, size: 10, bold: true });
    kLabel(ctx, 'área sombreada = fração com energia suficiente para reagir', gx + gw / 2, gy - 24, { size: 11, color: cssVar('--text-secondary') });
  }

  /**
   * Modo Gráfico de Arrhenius. Plota ln k × (1000/T) dos pontos que o
   * aluno "mediu"; com 2+ pontos, traça a reta de regressão. Funciona
   * tanto pras vias do H₂O₂ quanto pras reações de referência (cada
   * ponto já guarda seu próprio Ea/A no momento em que foi medido).
   */
  _drawArr(ctx, W, H) {
    // ANTES: teto de 560x340 px.
    const est = isEstreito(W);
    const gw = Math.max(180, W - (est ? 70 : 100)), gh = Math.max(140, H - (est ? 72 : 90));
    const gx = 74, gy = 40;
    const reg = this._regressaoArrhenius();
    const atual = this._arrAtual();

    const xOf = T => 1000 / (T + 273.15);
    const yOf = (ea, aFator, T) => Math.log(this._kRef(ea, aFator, T));

    // faixa dos eixos: cobre a temperatura atual + pontos já medidos
    const temps = [this.arrT, ...this.arrPontos.map(p => p.T)];
    const xs = temps.map(xOf);
    const xmin = Math.min(...xs) - .1, xmax = Math.max(...xs) + .1;
    const ysRef = temps.map(T => yOf(atual.ea, atual.aFator, T));
    const ymin = Math.min(...ysRef) - 1, ymax = Math.max(...ysRef) + 1;

    const A = kAxes(ctx, {
      x: gx, y: gy, w: gw, h: gh, xmin, xmax, ymin, ymax,
      xticks: [xmin, (xmin + xmax) / 2, xmax], yticks: [ymin, (ymin + ymax) / 2, ymax],
      fmtx: v => fmt(v, 2), fmty: v => fmt(v, 1),
      xlab: '1000 / T (K⁻¹)', ylab: 'ln k',
    });

    // pontos medidos
    this.arrPontos.forEach(p => {
      ctx.fillStyle = cssVar('--accent-main', '#4ade80');
      ctx.beginPath(); ctx.arc(A.px(xOf(p.T)), A.py(yOf(p.ea, p.aFator, p.T)), 5, 0, Math.PI * 2); ctx.fill();
    });
    // ponto "ao vivo" na temperatura atual do slider (ainda não medido)
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.strokeStyle = cssVar('--accent-amber', '#fbbf24'); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(A.px(xOf(this.arrT)), A.py(yOf(atual.ea, atual.aFator, this.arrT)), 6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    if (reg) {
      const pReta = [xmin, xmax].map(x => [x, reg.slope * (x / 1000) + reg.intercept]);
      kLine(ctx, pReta, A.px, A.py, { color: cssVar('--accent-amber', '#fbbf24'), w: 2, dash: [5, 4] });
    } else {
      kLabel(ctx, 'Meça pelo menos 2 temperaturas para traçar a reta', gx + gw / 2, gy - 18, { size: 11, color: cssVar('--text-secondary') });
    }
  }


  /* ══════════════════════════════════════════════════════════════════
     MODO 7 — MECANISMO DE REAÇÃO E ETAPA DETERMINANTE
     ══════════════════════════════════════════════════════════════════
     O dado (MECANISMOS, em dadoscinetica.js) ja existia e nao era usado por
     nenhum modulo — alimentava apenas texto solto. Aqui ele vira mecanica.

     O modo tem duas leituras:
       'etapas' — as etapas elementares empilhadas, com a lenta destacada,
                  e a soma que reproduz a equacao global (intermediarios se
                  cancelando, catalisador entrando e saindo).
       'fila'   — a metafora do gargalo: canos de larguras diferentes em
                  serie. O cano ESTREITO (etapa lenta) e que define a vazao,
                  e alargar o largo nao muda nada. E a resposta visual para
                  "por que so a etapa lenta conta?".
  ══════════════════════════════════════════════════════════════════ */

  /** Vazão relativa de cada etapa a partir da sua Ea, por Arrhenius.
   *  Serve para a largura dos canos na visão 'gargalo'.
   *
   *  A escala é LOGARÍTMICA e com span FIXO de 14 décadas, de propósito. A
   *  razão entre os k das etapas chega a 10¹⁴ (NO₂ + CO), então uma escala
   *  linear deixaria o cano rápido invisível. Mas normalizar por mecanismo
   *  seria pior: no caso do ozônio, em que a etapa lenta é só 2× mais lenta
   *  que a rápida, os canos apareceriam bem diferentes e o aluno concluiria
   *  que há um gargalo forte onde não há. Com span fixo, o ozônio sai com
   *  canos quase iguais — que é a verdade — e o `razao` devolvido junto
   *  permite dizer isso com número na tela. */
  _mecVazoes() {
    const R = 8.314e-3, T = 298;
    const ks = this.mec.etapas.map(e => Math.exp(-e.ea / (R * T)));
    const kmax = Math.max(...ks);
    const v = ks.map(k => clamp(1 + Math.log10(k / kmax) / 14, 0.12, 1));
    v.razao = kmax / Math.min(...ks);   // quantas vezes a lenta é mais lenta
    return v;
  }

  _mecCalc() {
    const m = this.mec;
    const i = clamp(Math.round(this.mecEtapa), 0, m.etapas.length - 1);
    const lentaIdx = m.etapas.findIndex(e => e.lenta);
    return {
      m, i, etapa: m.etapas[i], lentaIdx,
      lenta: m.etapas[lentaIdx],
      vazoes: this._mecVazoes(),
      // a etapa em foco é a determinante?
      focoEhLenta: i === lentaIdx,
    };
  }

  _drawMec(ctx, W, H) {
    const c = this._mecCalc(), m = c.m, est = isEstreito(W);

    // ── equação global e lei experimental, no topo ──
    kLabel(ctx, `global:  ${m.global}`, W / 2, est ? 18 : 26,
      { size: est ? 12 : 15, bold: true, color: cssVar('--text-primary'), maxW: W - 16 });
    kLabel(ctx, `lei medida no laboratório:  ${m.lei}   (ordem global ${m.ordemGlobal})`,
      W / 2, est ? 34 : 46,
      { size: est ? 9 : 12, bold: true, mono: true, color: cssVar('--accent-main', '#4ade80'), maxW: W - 16 });

    if (this.mecView === 'fila') return this._drawMecFila(ctx, W, H, c);

    // ── etapas elementares empilhadas ──
    const bx = est ? 16 : W * .07;
    const bw = Math.max(200, W - 2 * bx);
    let y = est ? 56 : 76;
    const bh = est ? 46 : 58;

    m.etapas.forEach((e, idx) => {
      const foco = idx === c.i;
      const cor = e.lenta ? cssVar('--accent-exo', '#f87171') : cssVar('--accent-cyan', '#22d3ee');
      ctx.save();
      ctx.fillStyle = cor;
      ctx.globalAlpha = foco ? .18 : .07;
      kRound(ctx, bx, y, bw, bh, 6); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = cor; ctx.lineWidth = foco ? 2.2 : 1;
      kRound(ctx, bx, y, bw, bh, 6); ctx.stroke();
      ctx.restore();

      kLabel(ctx, `${idx + 1}ª etapa`, bx + 10, y + 14,
        { size: est ? 9 : 10, align: 'left', bold: true, color: cor });
      kLabel(ctx, e.lenta ? 'LENTA · determinante' : 'rápida', bx + bw - 10, y + 14,
        { size: est ? 9 : 10, align: 'right', bold: true, color: cor, maxW: bw * .5 });
      kLabel(ctx, e.eq, bx + bw / 2, y + bh * .58,
        { size: est ? 11 : 14, bold: true, mono: true, color: cssVar('--text-primary'), maxW: bw - 20 });
      kLabel(ctx, `molecularidade ${e.mol}  ·  Ea ${fmt(e.ea, 1)} kJ/mol`, bx + bw / 2, y + bh - 9,
        { size: est ? 8 : 10, mono: true, color: cssVar('--text-muted'), maxW: bw - 20 });
      y += bh + (est ? 8 : 12);
    });

    // ── a soma: intermediários se cancelam, catalisador entra e sai ──
    ctx.save();
    ctx.strokeStyle = cssVar('--border', '#1c2e44'); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
    ctx.restore();
    y += est ? 16 : 20;
    kLabel(ctx, `soma  =  ${m.global}`, bx + bw / 2, y,
      { size: est ? 11 : 13, bold: true, mono: true, color: cssVar('--accent-ok', '#4ade80'), maxW: bw - 12 });
    y += est ? 18 : 22;
    const notas = [];
    if (m.inter && m.inter.length) notas.push(`${m.inter.join(', ')} se cancela na soma (intermediário)`);
    if (m.cat) notas.push(`${m.cat} é consumido e regenerado (catalisador)`);
    if (notas.length && y < H - 40) {
      kLabel(ctx, notas.join('  ·  '), bx + bw / 2, y,
        { size: est ? 9 : 11, color: cssVar('--accent-amber', '#fbbf24'), maxW: bw - 12 });
      y += est ? 18 : 22;
    }

    // ── a nota da etapa em foco ──
    if (y < H - 20) {
      kLabel(ctx, c.etapa.nota, bx + bw / 2, y,
        { size: est ? 9 : 11, color: cssVar('--text-secondary'), maxW: bw - 12 });
    }
  }

  /** Visão 'gargalo': canos em série de larguras diferentes.
   *  É a resposta visual para "por que só a etapa lenta conta?" — o fluxo que
   *  sai não pode ser maior que o do cano mais estreito, e alargar o cano
   *  largo não muda nada. */
  _drawMecFila(ctx, W, H, c) {
    const m = c.m, est = isEstreito(W);
    const bx = est ? 24 : W * .1;
    const bw = Math.max(180, W - 2 * bx);
    const cy = est ? H * .46 : H * .48;
    const n = m.etapas.length;
    const segW = bw / n;
    const hMax = est ? Math.min(H * .22, 90) : Math.min(H * .26, 130);

    m.etapas.forEach((e, idx) => {
      const v = c.vazoes[idx];
      const h = Math.max(8, v * hMax);
      const x = bx + idx * segW;
      const cor = e.lenta ? cssVar('--accent-exo', '#f87171') : cssVar('--accent-cyan', '#22d3ee');
      ctx.save();
      ctx.fillStyle = cor; ctx.globalAlpha = .22;
      kRound(ctx, x, cy - h / 2, segW - 4, h, 5); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = cor; ctx.lineWidth = e.lenta ? 2.4 : 1.3;
      kRound(ctx, x, cy - h / 2, segW - 4, h, 5); ctx.stroke();
      ctx.restore();

      // partículas escoando: a velocidade dentro de cada cano é a vazão
      const semMov = typeof isReduced === 'function' && isReduced();
      if (!semMov) {
        const vazaoMin = Math.min(...c.vazoes);
        ctx.save();
        ctx.fillStyle = cor;
        for (let p = 0; p < 6; p++) {
          // TODAS as etapas escoam na vazão da MAIS LENTA: é exatamente esse o
          // conceito. O cano largo não escoa mais rápido, ele só fica com folga.
          const t = ((this.mecT * vazaoMin * 0.5) + p / 6) % 1;
          ctx.globalAlpha = .8;
          ctx.beginPath();
          ctx.arc(x + t * (segW - 4), cy + Math.sin(p * 2.1) * (h * .22), est ? 2.6 : 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      kLabel(ctx, `${idx + 1}ª`, x + (segW - 4) / 2, cy - h / 2 - (est ? 12 : 16),
        { size: est ? 10 : 12, bold: true, color: cor });
      kLabel(ctx, e.lenta ? 'GARGALO' : 'com folga', x + (segW - 4) / 2, cy + h / 2 + (est ? 12 : 16),
        { size: est ? 9 : 11, bold: true, color: cor, maxW: segW });
      kLabel(ctx, `Ea ${fmt(e.ea, 1)}`, x + (segW - 4) / 2, cy + h / 2 + (est ? 26 : 32),
        { size: est ? 8 : 10, mono: true, color: cssVar('--text-muted'), maxW: segW });
    });

    // seta de entrada e saída, com a mesma vazão nas duas pontas
    kArrow(ctx, bx - (est ? 18 : 30), cy, bx - 4, cy, { color: cssVar('--text-secondary'), w: 2, head: 7 });
    kArrow(ctx, bx + bw - 2, cy, bx + bw + (est ? 16 : 28), cy, { color: cssVar('--text-secondary'), w: 2, head: 7 });

    let y = cy + hMax / 2 + (est ? 54 : 70);
    // A razão REAL entre as constantes, para o desenho não dizer mais do que a
    // química permite: quando ela é pequena, não há gargalo pronunciado, e vale
    // avisar em vez de deixar o aluno inferir errado do tamanho dos canos.
    const razao = c.vazoes.razao || 1;
    const forte = razao > 100;
    if (y < H - 30) {
      kLabel(ctx, forte
        ? 'A vazão que SAI é a do cano mais estreito. Alargar o cano largo não muda nada.'
        : 'Aqui as duas etapas têm velocidades PARECIDAS: o gargalo é fraco, e nenhuma das duas domina sozinha.',
        W / 2, y, { size: est ? 10 : 12, bold: true, color: cssVar('--accent-amber', '#fbbf24'), maxW: W - 24 });
      y += est ? 18 : 22;
    }
    if (y < H - 24) {
      kLabel(ctx, `a etapa lenta é ${razao >= 1000 ? razao.toExponential(1) : fmt(razao, 1)}× mais lenta que a rápida (a 25 °C, por Arrhenius)`,
        W / 2, y, { size: est ? 9 : 10, mono: true, color: cssVar('--text-muted'), maxW: W - 24 });
      y += est ? 18 : 22;
    }
    if (y < H - 14) {
      kLabel(ctx, m.pega, W / 2, y,
        { size: est ? 9 : 11, color: cssVar('--text-secondary'), maxW: W - 24 });
    }
  }

  getResults() {
    if (this.modo === 'mecanismo') {
      const c = this._mecCalc(), m = c.m, e = c.etapa;
      const rows = [
        { l: 'Mecanismo', v: m.nome },
        { l: 'Equação global', v: m.global },
        { l: 'Lei de velocidade', v: m.lei, cls: 'val-ok' },
        { l: 'Ordem global', v: String(m.ordemGlobal) },
        { l: '— Etapas elementares —', v: '' },
      ];
      m.etapas.forEach((et, idx) => {
        rows.push({
          l: `${idx + 1}ª etapa${et.lenta ? ' (LENTA)' : ''}`, v: et.eq,
          cls: et.lenta ? 'val-exo' : '',
        });
        rows.push({ l: `   molecularidade`, v: `${et.mol} — ${et.mol === 2 ? 'bimolecular' : et.mol === 1 ? 'unimolecular' : 'trimolecular'}` });
        rows.push({ l: `   Ea`, v: `${fmt(et.ea, 1)} kJ/mol` });
      });
      rows.push({ l: '— Leitura —', v: '' });
      rows.push({ l: 'Etapa determinante', v: `a ${c.lentaIdx + 1}ª — maior Ea, ${fmt(c.lenta.ea, 1)} kJ/mol`, cls: 'val-exo' });
      rows.push({ l: 'Intermediário', v: (m.inter && m.inter.length) ? `${m.inter.join(', ')} — aparece e é consumido` : 'nenhum' });
      rows.push({ l: 'Catalisador', v: m.cat ? `${m.cat} — consumido e regenerado` : 'nenhum' });
      rows.push({ l: 'Etapa em foco', v: `${c.i + 1}ª${c.focoEhLenta ? ' — é a determinante' : ' — rápida, não limita'}` });
      rows.push({ l: 'Nota da etapa', v: e.nota });
      rows.push({ l: 'A pegadinha', v: m.pega, cls: 'val-endo' });
      return rows;
    }
    if (this.modo === 'colisoes') {
      return [
        { l: 'Temperatura', v: fmt(this.tcol, 0) + ' °C' },
        { l: 'Catalisador', v: this.cat ? 'presente' : 'ausente', cls: this.cat ? 'val-ok' : '' },
        { l: 'Partículas A', v: String(this.A.length) },
        { l: 'Partículas B', v: String(this.B.length) },
        { l: 'Produto C', v: String(this.C.length), cls: 'val-ok' },
        { l: 'Fração c/ energia', v: fmt(this._pEf() * 100, 1) + ' %' },
        { l: 'Fração c/ orientação', v: fmt(this._fracaoOrientacao() * 100, 1) + ' %' },
        { l: 'Fração efetiva (medida)', v: fmt(this.taxaMedida * 100, 1) + ' %', cls: 'val-ok' },
        { l: 'Choques efetivos', v: fmt(this.taxa, 1) + ' /s' },
      ];
    }
    if (this.modo === 'superficie') {
      const s = this.supSubst, sol = this.supSol;
      const faseTxt = { esperando: 'aguardando depósito', caindo: 'depositando...', reagindo: 'reagindo' }[this.supFase];
      return [
        { l: 'Substância', v: s.nome },
        { l: 'Equação', v: s.eq },
        { l: 'Solução', v: sol.nome },
        { l: 'Fase', v: faseTxt, cls: this.supFase === 'reagindo' ? 'val-ok' : '' },
        { l: 'Fragmentos', v: String(this.nfrag) },
        { l: 'k (relativo)', v: fmt(this._kSup(), 3) + ' s⁻¹' },
        { l: 'Tempo decorrido', v: fmt(this.supTempo, 1) + ' s' },
        { l: `${s.gas} liberado`, v: fmt(this._volSup(this.supTempo) * 100, 0) + ' %', cls: 'val-ok' },
        { l: 'Volume final', v: 'igual em qualquer fragmentação' },
      ];
    }
    if (this.modo === 'curva') {
      const k = this._k(), c1 = this._conc(this.t1), c2 = this._conc(this.t2);
      const tmax = this._curTmax();
      const casasT = tmax < 2 ? 3 : tmax < 10 ? 2 : 1;
      return [
        { l: 'Reação', v: this._curReacaoAtual().nome },
        { l: 'Ea da reação', v: fmt(this._curReacaoAtual().ea, 1) + ' kJ·mol⁻¹' },
        { l: 'Corrida', v: this.curRunning ? 'em andamento' : 'parada — clique em Iniciar', cls: this.curRunning ? 'val-ok' : '' },
        { l: '[A]₀', v: fmt(this.a0, 2) + ' mol·L⁻¹' },
        { l: 'Constante k', v: fmtCientifico(k) + ' s⁻¹' },
        { l: 'Meia-vida t½', v: fmt(Math.log(2) / k, casasT) + ' s' },
        { l: 'Tempo corrido', v: fmt(this.trel, casasT) + ' s' },
        { l: '[A] atual', v: fmt(this._conc(this.trel), 3) + ' mol·L⁻¹' },
        { l: `[A] em ${fmt(this.t1, casasT)} s`, v: fmt(c1, 3) + ' mol·L⁻¹' },
        { l: `[A] em ${fmt(this.t2, casasT)} s`, v: fmt(c2, 3) + ' mol·L⁻¹' },
        { l: 'Velocidade média', v: fmtCientifico((c1 - c2) / (this.t2 - this.t1)) + ' mol·L⁻¹·s⁻¹', cls: 'val-ok' },
      ];
    }
    if (this.modo === 'ordem') {
      const n = this.nordem, unidadeK = n === 0 ? 'mol·L⁻¹·s⁻¹' : n === 1 ? 's⁻¹' : 'L·mol⁻¹·s⁻¹';
      if (this.ordSecreto) {
        const acertou = this.nordem === this.ordOculta;
        const linhas = [
          { l: '🔒 Desafio', v: 'ordem escondida — descubra pelo gráfico' },
          { l: 'Seu palpite', v: `Ordem ${n} (${this._labelOrdem(n)})` },
          { l: 'Resultado', v: acertou ? 'acertou! 🎉' : 'ainda não — teste outra ordem', cls: acertou ? 'val-ok' : '' },
          { l: 'Corrida', v: this.ordRunning ? 'em andamento' : 'parada — clique em Iniciar', cls: this.ordRunning ? 'val-ok' : '' },
          { l: 'Tempo corrido', v: fmt(this.ordTrel, 1) + ' s' },
        ];
        if (acertou) {
          const ex = this.D.ORDEM_EXEMPLOS[this.ordOculta];
          linhas.push({ l: 'Era a ordem', v: String(this.ordOculta), cls: 'val-ok' });
          linhas.push({ l: 'Exemplo real', v: ex.nome });
        }
        return linhas;
      }
      const th = this._meiaVidaOrdem(n, this.orda0, this.ordk);
      const ex = this.D.ORDEM_EXEMPLOS[n];
      return [
        { l: 'Ordem escolhida', v: String(n) },
        { l: 'Exemplo real', v: ex.nome },
        { l: 'Equação', v: ex.eq },
        { l: 'Fonte', v: ex.fonte },
        { l: 'Corrida', v: this.ordRunning ? 'em andamento' : 'parada — clique em Iniciar', cls: this.ordRunning ? 'val-ok' : '' },
        { l: '[A]₀', v: fmt(this.orda0, 2) + ' mol·L⁻¹' },
        { l: 'k', v: fmt(this.ordk, 4) + ' ' + unidadeK },
        { l: 'Tempo corrido', v: fmt(this.ordTrel, 1) + ' s' },
        { l: '[A] atual', v: fmt(this._concOrdem(n, this.orda0, this.ordk, this.ordTrel), 3) + ' mol·L⁻¹' },
        { l: 'Meia-vida t½', v: th > 0 ? fmt(th, 1) + ' s' : '—', cls: 'val-ok' },
        { l: 'Gráfico que fica reto', v: this._labelOrdem(n) },
      ];
    }
    if (this.modo === 'arrhenius') {
      const reg = this._regressaoArrhenius();
      const atual = this._arrAtual();
      const linhas = [
        { l: 'Reação', v: atual.nome },
        { l: 'Ea real (fonte)', v: fmt(atual.ea, 1) + ' kJ·mol⁻¹' },
        { l: 'A real (fonte)', v: fmtCientifico(atual.aFator) + ' s⁻¹' },
        { l: 'Temperatura atual', v: fmt(this.arrT, 0) + ' °C (' + fmt(this.arrT + 273.15, 0) + ' K)' },
        { l: 'k nesta T', v: fmtCientifico(atual.k) + ' s⁻¹' },
        { l: 'Pontos medidos', v: String(this.arrPontos.length) },
      ];
      if (reg) {
        linhas.push({ l: 'Ea calculada (inclinação)', v: fmt(reg.ea, 1) + ' kJ·mol⁻¹', cls: 'val-ok' });
        linhas.push({ l: 'A calculado (intercepto)', v: fmtCientifico(reg.aFator) + ' s⁻¹' });
      } else {
        linhas.push({ l: 'Ea calculada', v: 'meça mais 1 temperatura' });
      }
      return linhas;
    }
    const sem = this.D.CAMINHOS[0];
    if (this.mecanismo === 'duas' && this.caminho.id === 'iodeto') {
      const M = this.D.MECANISMO_IODETO;
      return [
        { l: 'Etapa 1', v: M.etapas[0].eq },
        { l: 'Etapa 1 é', v: M.etapas[0].tag, cls: 'val-ok' },
        { l: 'Etapa 2', v: M.etapas[1].eq },
        { l: 'Etapa 2 é', v: M.etapas[1].tag },
        { l: 'Intermediário', v: M.intermediario },
        { l: 'Lei de velocidade', v: M.leiVelocidade, cls: 'val-ok' },
        { l: 'ΔH da reação', v: fmt(this.D.DH, 0) + ' kJ·mol⁻¹', cls: 'val-exo' },
      ];
    }
    return [
      { l: 'Caminho', v: this.caminho.nome },
      { l: 'Ea', v: fmt(this.caminho.ea, 0) + ' kJ·mol⁻¹', cls: 'val-ok' },
      { l: 'Ea sem catálise', v: fmt(sem.ea, 0) + ' kJ·mol⁻¹' },
      { l: 'Redução da Ea', v: fmt(sem.ea - this.caminho.ea, 0) + ' kJ·mol⁻¹' },
      { l: 'ΔH da reação', v: fmt(this.D.DH, 0) + ' kJ·mol⁻¹', cls: 'val-exo' },
      { l: 'Temperatura', v: fmt(this.tene, 0) + ' °C (' + fmt(this.tene + 273.15, 0) + ' K)' },
      { l: 'Fração ativada', v: fmtCientifico(this._fracao(this.caminho.ea)) },
      { l: 'Ganho vs. sem cat.', v: fmtCientifico(this._fracao(this.caminho.ea) / this._fracao(sem.ea)) + '×' },
    ];
  }

  getOverlay() {
    if (this.modo === 'colisoes') return `${fmt(this.tcol, 0)} °C · ${this.cat ? 'com' : 'sem'} catalisador`;
    if (this.modo === 'superficie') return `${this.supSubst.nome} · ${this.nfrag} pedaço${this.nfrag > 1 ? 's' : ''}`;
    if (this.modo === 'curva') return `${this._curReacaoAtual().nome} · k = ${fmt(this._k(), 4)} s⁻¹`;
    if (this.modo === 'ordem') return `Ordem ${this.nordem} · k = ${fmt(this.ordk, 4)}`;
    if (this.modo === 'arrhenius') return `${this._arrAtual().nome} · ${this.arrPontos.length} ponto${this.arrPontos.length === 1 ? '' : 's'} medido${this.arrPontos.length === 1 ? '' : 's'}`;
    if (this.modo === 'mecanismo') {
      const c = this._mecCalc();
      return `${this.mec.nome} · etapa ${c.i + 1}/${this.mec.etapas.length}${c.focoEhLenta ? ' (lenta)' : ''}`;
    }
    if (this.mecanismo === 'duas' && this.caminho.id === 'iodeto') return `Mecanismo em 2 etapas · via iodeto`;
    return `${this.caminho.nome} · ${this.eneView === 'maxwell' ? 'Maxwell-Boltzmann' : 'Ea ' + this.caminho.ea + ' kJ/mol'}`;
  }
}

// ══════════════════════════════════════════════════════════════════
// APP — casco genérico da família de simuladores do 2º ano.
// Mesma usabilidade do SIMA/SITQ: acordeões, Alt+1–N,
// Enter/Espaço no canvas, gaveta mobile, resultados ao vivo.
// A mecânica específica vive na classe Mech (definida acima).
// ══════════════════════════════════════════════════════════════════
/** Preenche uma .opt-grid com botões a partir de itens dos dados. */
function fillOptGrid(gridId, items, selValue) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(it => {
    const b = document.createElement('button');
    b.className = 'opt-btn' + (String(it.value) === String(selValue) ? ' active' : '');
    b.dataset.value = it.value;
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', String(String(it.value) === String(selValue)));
    if (it.dot) { const d = document.createElement('span'); d.className = 'opt-dot'; d.style.setProperty('--dot', it.dot); b.appendChild(d); }
    const n = document.createElement('span'); n.className = 'opt-nome'; n.textContent = it.nome; b.appendChild(n);
    if (it.extra) { const x = document.createElement('span'); x.className = 'opt-c'; x.textContent = it.extra; b.appendChild(x); }
    if (it.aria) b.setAttribute('aria-label', it.aria);
    grid.appendChild(b);
  });
}

class App {
  constructor(mech) {
    this.mech = mech;
    mech.app = this;
    this.D = window.SIM_DATA;
    this.time = 0;
    this._curio = 0;
    this._fpsN = 0; this._fpsT = 0;

    this.canvas = document.getElementById('sim-canvas');
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
    // ResizeObserver: cobre qualquer mudança de tamanho da área de
    // desenho (arrastar o redimensionador do sidebar, abrir/fechar a
    // gaveta mobile, rotacionar o aparelho, zoom) — não só resize da
    // janela do navegador, que é o único evento que window.resize cobre.
    const wrap = this.canvas.closest('.canvas-wrap');
    if (wrap && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => this._resize()).observe(wrap);
    }
    // visualViewport: cobre zoom por pinça (touch) e alguns zooms de
    // trackpad, que às vezes mudam só a escala visual sem disparar
    // resize/ResizeObserver (o self-heal por quadro no _loop já cobre
    // isso também, mas reagir ao evento evita 1 quadro de atraso).
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this._resize());
    }

    this._buildModes();
    this._bindSidebar();
    this._bindModeIndicator();
    this._bindHeader();
    this._bindCanvasKeys();
    if (typeof mech.build === 'function') mech.build(this);

    // ── Estado inicial: NENHUM modo ativo — nada é desenhado no canvas
    //    até o usuário clicar em "Ativar" no painel do modo desejado
    //    (mesmo contrato do SILQ: canvas em branco por padrão). ──
    this.mode = null;
    document.querySelectorAll('.panel[data-owner]').forEach(p => { p.hidden = true; });
    const hint0 = document.getElementById('canvas-hint');
    if (hint0) hint0.textContent = 'Escolha um modo ao lado e clique em "Ativar" para iniciar a simulação.';
    this.refresh();
    announce(`${this.D.ACRO} carregado. Nenhum modo ativo. Escolha um modo à esquerda e ative-o para começar.`);

    this._last = performance.now();
    requestAnimationFrame(() => this._loop());
  }

  /* ── canvas responsivo com devicePixelRatio ── */
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    this.W = Math.max(80, r.width);
    this.H = Math.max(80, r.height);
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._lastDPR = dpr;
    // ── escala do canvas (ver bloco ESCALA DO CANVAS, no topo) ──
    // patchCtxFont e idempotente (marca ctx._fontPatched), entao pode ser
    // chamado a cada resize sem empilhar interceptadores.
    patchCtxFont(this.ctx);
    CANVAS_FS = canvasFS(this.W);
    this.lay = layoutMode(this.W);
  }

  /* ── painéis individuais por modo, gerados de SIM_DATA.MODES ──
     cada modo é um .panel padrão, igual a "Sobre o Modo"/"Resultados":
     cabeçalho ícone+nome+sigla+seta (expande/recolhe sozinho, cuidado
     por _bindPanelArea) + corpo com botão "Ativar", definição, fatos-
     chave, interação do canvas e itens recomendados ── */
  _buildModes() {
    const list = document.getElementById('model-list');
    this.D.MODES.forEach((m, i) => {
      const headerId = 'hdr-mode-' + m.id, bodyId = 'body-mode-' + m.id;

      const section = document.createElement('section');
      section.className = 'panel';
      section.dataset.modeCard = m.id;
      section.setAttribute('aria-labelledby', headerId);

      const header = document.createElement('button');
      header.type = 'button';
      header.id = headerId;
      header.className = 'panel-header';
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', bodyId);
      header.innerHTML = `<span class="panel-icon" aria-hidden="true">${m.icon || '🔹'}</span>
        <span class="panel-label">${m.nome}</span>
        <span class="panel-badge">${m.sigla}</span>
        <span class="mode-active-tag">Ativo</span>
        <span class="chevron" aria-hidden="true">▾</span>`;

      const body = document.createElement('div');
      body.id = bodyId;
      body.className = 'panel-body collapsed';
      // PADRAO SILQ: o corpo do painel e uma regiao nomeada pelo cabecalho,
      // para o leitor de tela saber onde o modulo comeca e termina.
      body.setAttribute('role', 'region');
      body.setAttribute('aria-labelledby', headerId);

      const activateBtn = document.createElement('button');
      activateBtn.type = 'button';
      activateBtn.className = 'action-btn mode-activate-btn';
      // Botao de ativacao e um toggle de estado -> aria-pressed (igual ao
      // .bond-mode-btn do SILQ). Sincronizado em setMode().
      activateBtn.setAttribute('aria-pressed', 'false');
      activateBtn.innerHTML = `<span aria-hidden="true">▶</span> Ativar ${m.nome}`;
      // TOGGLE — mesmo contrato do SILQ: clicar no modo JA ativo desativa e
      // devolve o simulador ao estado neutro (canvas em branco).
      activateBtn.addEventListener('click', () => {
        if (this.mode && this.mode.id === m.id) this.clearMode();
        else this.setMode(m.id);
      });
      // HINT DE HOVER — tooltip nativo, atualizado em setMode/clearMode.
      activateBtn.title = 'Ativar ' + m.nome + ' no canvas';
      body.appendChild(activateBtn);

      if (m.def) {
        const def = document.createElement('p');
        def.className = 'mode-define';
        def.textContent = m.def;
        body.appendChild(def);
      }

      if (m.fatos && m.fatos.length) {
        const grid = document.createElement('div');
        grid.className = 'fact-grid';
        m.fatos.forEach(ft => {
          const cell = document.createElement('div');
          cell.className = 'fact-cell';
          cell.innerHTML = `<span class="fact-label">${ft.l}</span><span class="fact-value">${ft.v}</span>`;
          grid.appendChild(cell);
        });
        body.appendChild(grid);
      }

      if (m.canvasInteracao) {
        const box = document.createElement('div');
        box.className = 'canvas-interactions';
        box.innerHTML = `<p class="canvas-interactions-title">Interações do canvas</p><p>${m.canvasInteracao}</p>`;
        body.appendChild(box);
      }

      if (m.recomendados && m.recomendados.length) {
        const rec = document.createElement('div');
        rec.className = 'recommended';
        rec.innerHTML = `<p class="recommended-title">Recomendados</p>
          <div class="chip-row">${m.recomendados.map(r => `<span class="chip">${r}</span>`).join('')}</div>`;
        body.appendChild(rec);
      }

      const hint = document.createElement('p');
      hint.className = 'hint-text';
      hint.textContent = m.hint;
      body.appendChild(hint);

      section.appendChild(header);
      section.appendChild(body);
      list.appendChild(section);
    });
  }

  /* ── DESATIVAR o modo — volta ao estado neutro, o mesmo em que o
     simulador abre (this.mode = null). Todo o resto do codigo ja trata
     esse caso: refresh(), o hint do canvas e os paineis por modo.
     Mesmo contrato de toggle do SILQ (setMode / clearMode). ── */
  clearMode() {
    this.mode = null;
    document.querySelectorAll('.panel[data-mode-card]').forEach(panel => {
      panel.classList.remove('active');
      const header = panel.querySelector('.panel-header');
      if (header) header.removeAttribute('aria-current');
      const actBtn = panel.querySelector('.mode-activate-btn');
      if (actBtn) {
        actBtn.setAttribute('aria-pressed', 'false');
        const nomeMod = (this.D.MODES.find(x => x.id === panel.dataset.modeCard) || {}).nome || '';
        actBtn.title = 'Ativar ' + nomeMod + ' no canvas';
      }
    });
    document.querySelectorAll('.panel[data-owner]').forEach(p => { p.hidden = true; });
    const hint = document.getElementById('canvas-hint');
    if (hint) hint.textContent = 'Escolha um modo ao lado e clique em "Ativar" para iniciar a simulação.';
    // esconde a pilula do canvas — volta ao estado puro
    const ind0 = document.getElementById('mode-indicator');
    if (ind0) ind0.classList.remove('mode-on');
    if (this.mech && typeof this.mech.setMode === 'function') this.mech.setMode(null);
    this.refresh();
    if (typeof playTone === 'function') playTone(420, .06, .05);
    announce('Modo desativado. Nenhum modo ativo — escolha um modo e ative-o para voltar a simular.');
  }

  setMode(id, silent) {
    const m = this.D.MODES.find(x => x.id === id);
    if (!m) return;
    this.mode = m;
    document.querySelectorAll('.panel[data-mode-card]').forEach(panel => {
      const on = panel.dataset.modeCard === id;
      panel.classList.toggle('active', on);
      const header = panel.querySelector('.panel-header');
      if (header) {
        if (on) header.setAttribute('aria-current', 'true'); else header.removeAttribute('aria-current');
      }
      // Espelha o estado no botao "Ativar" do modulo (padrao SILQ)
      const actBtn = panel.querySelector('.mode-activate-btn');
      if (actBtn) {
        actBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        const nomeMod = (this.D.MODES.find(x => x.id === panel.dataset.modeCard) || {}).nome || '';
        actBtn.title = on ? ('Desativar ' + nomeMod) : ('Ativar ' + nomeMod + ' no canvas');
      }
      if (on) {
        if (header) header.setAttribute('aria-expanded', 'true');
        const body = panel.querySelector('.panel-body');
        if (body) body.classList.remove('collapsed');
      }
    });
    document.querySelectorAll('.panel[data-owner]').forEach(p => {
      p.hidden = !(m.panels || []).includes(p.id);
    });
    const hint = document.getElementById('canvas-hint');
    if (hint) hint.textContent = m.hintCanvas || '';
    this.mech.setMode(id);
    this.refresh();
    if (!silent) {
      playTone(760, .06, .05);
      announce(`Modo ${m.nome} selecionado. ${(m.info || '').split('.')[0]}.`);
    }
  }

  /* ── delegação de controles declarativos nas duas sidebars ──
     esquerda: menus/listagens e informativos · direita: controles */
  /* Botao ✕ da pilula do canvas — desativa o modo, mesmo papel do
     #bond-mode-indicator-clear do SILQ. */
  _bindModeIndicator() {
    const btn = document.getElementById('overlay-clear');
    if (btn) btn.addEventListener('click', () => this.clearMode());
  }

  _bindSidebar() {
    ['sidebar-left', 'sidebar-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) this._bindPanelArea(el);
    });
  }

  _bindPanelArea(sb) {

    sb.addEventListener('click', (e) => {
      // modo secreto do painel de Ordem de Reação: 5 cliques no ícone
      // (📈) da barra de título do painel, em até 3s, alternam um
      // "desafio da ordem escondida" — a mecânica sorteia a ordem
      // verdadeira e o esconde; o aluno precisa descobrir testando as
      // três linearizações, igual ao método gráfico real.
      if (e.target.closest('#hdr-ord .panel-icon')) {
        const now = performance.now();
        if (!this._ordIconT || now - this._ordIconT > 3000) this._ordIconN = 0;
        this._ordIconT = now; this._ordIconN = (this._ordIconN || 0) + 1;
        if (this._ordIconN >= 5) {
          this._ordIconN = 0;
          this.mech.ordSecreto = !this.mech.ordSecreto;
          if (this.mech.ordSecreto) {
            this.mech.ordOculta = Math.floor(Math.random() * 3);
            this.mech.ordTrel = 0; this.mech.ordRunning = false;
            announce('Desafio da ordem escondida ativado! A ordem verdadeira foi sorteada e escondida — descubra testando as três linearizações.');
          } else {
            announce('Desafio da ordem escondida desativado.');
          }
          playTone(this.mech.ordSecreto ? 900 : 500, .1, .06);
          this.refresh();
        }
      }
      const hdr = e.target.closest('.panel-header');
      if (hdr) {
        const exp = hdr.getAttribute('aria-expanded') === 'true';
        hdr.setAttribute('aria-expanded', String(!exp));
        const body = document.getElementById(hdr.getAttribute('aria-controls'));
        if (body) body.classList.toggle('collapsed', exp);
        playTone(exp ? 500 : 750, .06, .04);
        return;
      }
      const opt = e.target.closest('.opt-btn');
      if (opt) {
        const grid = opt.closest('[data-group]');
        grid.querySelectorAll('.opt-btn').forEach(b => {
          const on = b === opt;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        this._param(grid.dataset.group, opt.dataset.value);
        return;
      }
      const seg = e.target.closest('.seg-btn');
      if (seg) {
        seg.closest('.seg').querySelectorAll('.seg-btn').forEach(b => b.setAttribute('aria-pressed', String(b === seg)));
        this._param(seg.closest('.seg').dataset.group, seg.dataset.value);
        return;
      }
      const act = e.target.closest('[data-action]');
      if (act) {
        this.mech.action(act.dataset.action, act);
        this.refresh();
      }
    });

    sb.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('input[type="range"][data-bind]')) {
        const v = parseFloat(t.value);
        const out = document.getElementById('out-' + t.id);
        if (out) out.textContent = this.fmtOut(t, v);
        this._param(t.dataset.bind, v);
      }
    });
    sb.addEventListener('change', (e) => {
      if (e.target.matches('select[data-bind]')) this._param(e.target.dataset.bind, e.target.value);
    });
  }

  fmtOut(inp, v) {
    const casas = inp.dataset.fmt === 'f2' ? 2 : inp.dataset.fmt === 'f1' ? 1 : 0;
    const val = inp.dataset.pow ? Math.pow(10, v) : v;
    const txt = inp.dataset.pow ? `10^${fmt(v, 1)}` : fmt(val, casas);
    return txt + (inp.dataset.unit ? ' ' + inp.dataset.unit : '');
  }

  _param(k, v) {
    const r = this.mech.setParam(k, v) || {};
    if (r.warn) announce(r.warn, 'assertive');
    if (r.say) announce(r.say);
    this.refresh();
  }

  /** Sincroniza um slider programaticamente (valor + output). */
  syncSlider(id, v) {
    const inp = document.getElementById(id);
    if (!inp) return;
    inp.value = v;
    const out = document.getElementById('out-' + id);
    if (out) out.textContent = this.fmtOut(inp, parseFloat(inp.value));
  }

  /* ── resultados + rótulo flutuante ── */
  refresh() {
    const grid = document.getElementById('result-grid');
    const resultPanel = grid ? grid.closest('.panel') : null;
    if (grid) {
      grid.innerHTML = '';
      if (!this.mode) {
        // Nenhum modo ativo: painel de Análise fica com aviso neutro,
        // igual ao "Clique em elementos..." do SILQ antes de qualquer ação.
        const p = document.createElement('p');
        p.className = 'hint-text';
        p.textContent = 'Ative um modo à esquerda para ver aqui a análise dos resultados.';
        grid.appendChild(p);
      } else {
        (this.mech.getResults() || []).forEach(r => {
          const row = document.createElement('div'); row.className = 'data-row';
          const dt = document.createElement('dt'); dt.className = 'data-label'; dt.textContent = r.l;
          const dd = document.createElement('dd'); dd.className = 'data-value' + (r.cls ? ' ' + r.cls : '');
          dd.textContent = r.v;
          row.append(dt, dd); grid.appendChild(row);
        });
      }
    }
    if (resultPanel) resultPanel.classList.toggle('panel--waiting', !this.mode);
    // INDICADOR DE MODO ATIVO (padrao SILQ): a pilula do topo do canvas
    // so existe quando ha modo ativo. Sem modo, o canvas fica PURO.
    const ind = document.getElementById('mode-indicator');
    const ovTxt = document.getElementById('overlay-text');
    const ovIco = document.getElementById('overlay-icon');
    if (ind) ind.classList.toggle('mode-on', !!this.mode);
    if (this.mode) {
      // "<Nome do modo> ativo" — igual ao SILQ ("Modo Metálico ativo").
      // O estado dinamico (temperatura, reagente, etc.) entra depois, num
      // span proprio, para nao virar frases como "t = 0 ativo".
      if (ovTxt) {
        ovTxt.textContent = this.mode.nome + ' ativo';
        const detalhe = (this.mech.getOverlay && this.mech.getOverlay()) || this.mode.overlay || '';
        if (detalhe && detalhe !== this.mode.nome) {
          const sp = document.createElement('span');
          sp.className = 'overlay-detail';
          sp.textContent = ' · ' + detalhe;
          ovTxt.appendChild(sp);
        }
      }
      if (ovIco) ovIco.textContent = this.mode.icon || '';
    }
    this._refreshResultChart();

    // botão Iniciar/Pausar da Ordem de Reação alterna de rótulo
    if (this.mode && this.mode.id === 'ordem') {
      const btn = document.querySelector('[data-action="ord-play"]');
      if (btn) btn.innerHTML = this.mech.ordRunning
        ? '<span aria-hidden="true">⏸</span> Pausar corrida'
        : '<span aria-hidden="true">▶</span> Iniciar corrida';
    }
  }

  /** Redesenha o canvas auxiliar de gráfico na aba Resultados (hoje só
   *  o modo Superfície de Contato usa). Chamado tanto de refresh()
   *  quanto a cada quadro do loop de animação, pra o gráfico acompanhar
   *  o tempo em tempo real, não só quando um controle muda. */
  _refreshResultChart() {
    const rc = document.getElementById('result-chart');
    if (!rc) return;
    const temGrafico = this.mode && typeof this.mech.drawResultChart === 'function';
    let desenhou = false;
    if (temGrafico) {
      const dpr = window.devicePixelRatio || 1;
      const w = rc.clientWidth || 260, h = rc.clientHeight || 160;
      if (rc.width !== w * dpr || rc.height !== h * dpr) { rc.width = w * dpr; rc.height = h * dpr; }
      const rctx = rc.getContext('2d');
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      desenhou = !!this.mech.drawResultChart(rctx, w, h);
    }
    rc.hidden = !desenhou;
  }

  /* ── header: pausa + curiosidades ── */
  _bindHeader() {
    const logo = document.getElementById('btn-app-logo');
    if (logo) logo.addEventListener('click', () => {
      const c = this.D.CURIOSIDADES;
      if (!c || !c.length) return;
      const fato = c[this._curio++ % c.length];
      playTone(660, .09, .06);
      announce('Você sabia? ' + fato);
    });
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= this.D.MODES.length) { e.preventDefault(); this.setMode(this.D.MODES[n - 1].id); }
    });
  }


  /* ── teclado no canvas: Enter/Espaço = ação primária; setas → mech ── */
  _bindCanvasKeys() {
    this.canvas.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.mode && this.mode.primary) { this.mech.action(this.mode.primary); this.refresh(); }
      } else if (this.mode && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && this.mech.onArrow) {
        const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        if (this.mech.onArrow(dx, dy)) { e.preventDefault(); this.refresh(); }
      }
    });
    if (this.mech.onDrag) {
      let drag = false, lx = 0, ly = 0;
      this.canvas.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; this.canvas.setPointerCapture(e.pointerId); });
      this.canvas.addEventListener('pointermove', e => {
        if (!drag) return;
        this.mech.onDrag(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
      });
      const up = () => { drag = false; };
      this.canvas.addEventListener('pointerup', up);
      this.canvas.addEventListener('pointercancel', up);
    }
    // clique/toque no canvas — usado hoje pelo botão de alternância
    // do modo Energia (diagrama ↔ Maxwell-Boltzmann desenhado no canvas)
    this.canvas.addEventListener('click', (e) => {
      if (!this.mode || typeof this.mech.onCanvasClick !== 'function') return;
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (this.mech.onCanvasClick(x, y, this.W, this.H)) this.refresh();
    });
  }

  /* ── loop rAF ── */
  _loop() {
    const now = performance.now();
    const dt = clamp((now - this._last) / 1000, 0, .05);
    this._last = now;

    // Auto-correção de tamanho: ResizeObserver e window.resize cobrem
    // a maioria dos casos, mas existem formas de zoom (escala do
    // Windows, certos gestos de zoom) que mudam devicePixelRatio SEM
    // alterar o layout CSS — nesse caso o tamanho em CSS px continua
    // igual e só comparar boundingClientRect não pega a mudança.
    // Por isso comparamos os DOIS: tamanho CSS e devicePixelRatio.
    const rNow = this.canvas.getBoundingClientRect();
    const dprNow = window.devicePixelRatio || 1;
    if (Math.abs(rNow.width - this.W) > .5 || Math.abs(rNow.height - this.H) > .5 || dprNow !== this._lastDPR) {
      this._resize();
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Sem modo ativo → canvas permanece em branco (nada é desenhado
    // "sozinho"; exige ativação explícita do usuário no painel).
    if (this.mode) {
      this.time += dt;
      this.mech.update(dt, this);
      this.mech.draw(ctx, this.W, this.H, this);

      // Painel de Resultados (texto + gráfico auxiliar) precisa
      // acompanhar o tempo real da simulação, não só reagir a cliques
      // em controles — por isso é atualizado aqui também, throttled a
      // ~8x/s (rebuild de DOM a 60fps seria desperdício).
      if (!this._lastResultsRefresh || now - this._lastResultsRefresh > 120) {
        this._lastResultsRefresh = now;
        this.refresh();
      }

      this._fpsN++;
      if (now - this._fpsT > 500) {
        const el = document.getElementById('fps-counter');
        if (el) el.textContent = Math.round(this._fpsN * 1000 / (now - this._fpsT)) + ' fps';
        this._fpsN = 0; this._fpsT = now;
      }
    }
    requestAnimationFrame(() => this._loop());
  }
}

window.addEventListener('DOMContentLoaded', () => new App(new Mech(window.SIM_DATA)));

// ══════════════════════════════════════════════════════════════════
// MOBILE OFF-CANVAS — as duas sidebars viram gavetas em telas
// estreitas: a esquerda (menus e informações) desliza da esquerda e
// a direita (controles) desliza da direita. Botões próprios no
// header, backdrop compartilhado, Escape fecha, abrir uma fecha a
// outra. (Mesmo padrão do SIMA/SITQ, estendido para dois lados.)
// ══════════════════════════════════════════════════════════════════
function initMobileSidebar() {
  const backdrop = document.getElementById('mobile-backdrop');
  if (!backdrop) return;

  const gavetas = [
    { btn: document.getElementById('mobile-info-btn'), el: document.getElementById('sidebar-left') },
    { btn: document.getElementById('mobile-menu-btn'), el: document.getElementById('sidebar-right') },
  ].filter(g => g.btn && g.el);
  if (!gavetas.length) return;

  function fecharTodas() {
    gavetas.forEach(g => {
      g.el.classList.remove('mobile-open');
      g.btn.setAttribute('aria-expanded', 'false');
    });
    backdrop.hidden = true;
  }
  function abrir(g) {
    fecharTodas();
    g.el.classList.add('mobile-open');
    g.btn.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
  }

  gavetas.forEach(g => {
    g.btn.addEventListener('click', () => {
      g.el.classList.contains('mobile-open') ? fecharTodas() : abrir(g);
    });
    // Fecha a gaveta ao escolher um modo/opção em telas estreitas
    g.el.addEventListener('click', (e) => {
      if (e.target.closest('.mode-activate-btn, .opt-btn') && window.innerWidth <= 1100) {
        setTimeout(fecharTodas, 150);
      }
    });
  });
  backdrop.addEventListener('click', fecharTodas);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharTodas(); });

  window._closeSidebar = fecharTodas;
}
window.addEventListener('DOMContentLoaded', initMobileSidebar);

// ══════════════════════════════════════════════════════════════════
// SIDEBARS REDIMENSIONÁVEIS
// Alça (.sidebar-resizer) na borda interna de cada sidebar; arrastar
// ajusta --swl (esquerda) ou --swr (direita) em tempo real; a largura
// escolhida persiste em localStorage. Ignorada no modo gaveta mobile
// (position:fixed). (Mesmo contrato do SIMA — chaves deste simulador.)
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  var targets = [
    { id: 'sidebar-left', side: 'left', cssVar: '--swl', min: 250, max: 480 },
    { id: 'sidebar-right', side: 'right', cssVar: '--swr', min: 250, max: 480 },
  ];
  var root = document.documentElement;
  var rafPending = false;

  function fireResize() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      window.dispatchEvent(new Event('resize'));
    });
  }

  targets.forEach(function (cfg) {
    var el = document.getElementById(cfg.id);
    if (!el) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

    var storeKey = 'cinetica-w-' + cfg.cssVar.replace(/^--/, '');
    try {
      var saved = parseInt(localStorage.getItem(storeKey), 10);
      if (saved && saved >= cfg.min && saved <= cfg.max) {
        root.style.setProperty(cfg.cssVar, saved + 'px');
      }
    } catch (e) { /* localStorage indisponível — segue sem persistência */ }

    var handle = document.createElement('div');
    handle.className = 'sidebar-resizer sidebar-resizer--' + cfg.side;
    handle.setAttribute('aria-hidden', 'true');
    el.appendChild(handle);

    var dragging = false, startX = 0, startW = 0;

    handle.addEventListener('pointerdown', function (e) {
      if (getComputedStyle(el).position === 'fixed') return; // gaveta mobile
      dragging = true;
      startX = e.clientX;
      startW = el.getBoundingClientRect().width;
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var delta = e.clientX - startX;
      var w = cfg.side === 'left' ? startW + delta : startW - delta;
      w = Math.max(cfg.min, Math.min(cfg.max, Math.round(w)));
      root.style.setProperty(cfg.cssVar, w + 'px');
      fireResize();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem(storeKey, Math.round(el.getBoundingClientRect().width));
      } catch (e) { /* sem persistência */ }
      fireResize();
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  });
});
