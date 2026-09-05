/* ================================================================
   SIELQ — scrpiteletroquimica.js | mecânicas e casco do simulador
   de Eletroquímica (fusão SIPIL + SIELE)
   ================================================================
   MechA: montar a pilha, espontaneidade e tabela de potenciais.
   MechB: eletrólise ígnea, aquosa e leis de Faraday. A classe Mech,
   no fim, é uma FACHADA que direciona cada modo à mecânica dona
   dele — o casco App continua idêntico ao da família. Requer
   dadoseletroquimica.js.
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
// MECÂNICA A — Pilhas e potenciais (origem: SIPIL)
// Modos: montar pilha · espontaneidade · tabela de potenciais
// ══════════════════════════════════════════════════════════════════
class MechA {
  constructor(D) {
    this.D = D;
    this.M = D.METAIS.filter(m => !m.ref);
    this.modo = 'montar';
    this.esq = null;
    this.dir = null;
    this.fita = null;
    this.solucao = null;
    this.destaque = null;
    this.mergulhado = 0;   // 0…1 progresso da deposição
    this.imerso = false;
    this.fase = 0;
    this.massaAn = 1; this.massaCat = 1;
    this.concEsq = 0; this.concDir = 0;   // expoente do slider (10^x mol/L) — modo "montar" (Nernst)
  }

  _get(id) { return this.D.METAIS.find(m => m.id === id); }
  _mdc(a, b) { return b < 1e-9 ? a : this._mdc(b, a % b); }
  _mmc(a, b) { return (a * b) / this._mdc(a, b); }
  /** Concentração em mol/L, sempre em decimal — nunca em potência de 10,
      pra não repetir a confusão do "-1" sem contexto nos controles. */
  _fmtConc(c) { return fmt(c, c < 0.01 ? 4 : c < 0.1 ? 3 : c < 1 ? 2 : 1); }

  build(app) {
    const encher = (selId, sel) => {
      const el = document.getElementById(selId);
      if (!el) return;
      el.innerHTML = '';
      const ph = document.createElement('option');
      ph.value = ''; ph.textContent = 'Selecione um metal…';
      if (!sel) ph.selected = true;
      el.appendChild(ph);
      this.M.forEach(m => {
        const o = document.createElement('option');
        o.value = m.id;
        o.textContent = `${m.simb} · ${m.nome} (${fmt(m.e0, 2)} V)`;
        if (sel && m.id === sel.id) o.selected = true;
        el.appendChild(o);
      });
    };
    encher('sel-esq', this.esq);
    encher('sel-dir', this.dir);
    encher('sel-fita', this.fita);
    encher('sel-sol', this.solucao);

    fillOptGrid('tab-grid', this.D.METAIS.map(m => ({
      value: m.id, nome: `${m.simb} / ${m.ion}`, dot: m.cor, extra: fmt(m.e0, 2) + ' V',
      aria: `${m.nome}, potencial padrão de redução ${fmt(m.e0, 2)} volts`,
    })), this.destaque ? this.destaque.id : null);
  }

  setMode(id) { this.modo = id; }

  setParam(k, v) {
    if (k === 'esq' || k === 'dir') {
      this[k] = this._get(v) || null;
      if (!this.esq || !this.dir) return {};
      if (this.esq.id === this.dir.id) {
        return { warn: 'Os dois eletrodos são do mesmo metal: não há diferença de potencial e a pilha não funciona.' };
      }
      const p = this._pilha();
      return { say: `${p.anodo.nome} é o ânodo e ${p.catodo.nome} é o cátodo. Diferença de potencial de ${fmt(p.de, 2)} volts.` };
    }
    if (k === 'concEsq' || k === 'concDir') {
      this[k] = v;
      const p = this._pilha();
      if (!p.valida) return {};
      const foraDoPadrao = Math.abs(p.deN - p.de) > 0.005;
      return { say: foraDoPadrao
        ? `Fora da condição padrão: pela equação de Nernst, ΔE agora é ${fmt(p.deN, 2)} volts, contra ${fmt(p.de, 2)} volts em condição padrão.`
        : `Em condição padrão (1 mol/L): ΔE = ${fmt(p.deN, 2)} volts.` };
    }
    if (k === 'fita' || k === 'solucao') {
      this[k] = this._get(v) || null;
      this.mergulhado = 0; this.imerso = false;
      if (!this.fita || !this.solucao) return {};
      if (this.fita.id === this.solucao.id) {
        return { warn: 'Fita e solução são do mesmo metal: não há deslocamento, porque não existe metal menos reativo pra comparar.' };
      }
      const e = this._espont();
      return { say: e.reage
        ? `Fita de ${this.fita.nome} em solução de ${this.solucao.ion}: a reação é espontânea, delta E igual a ${fmt(e.de, 2)} volts.`
        : `Fita de ${this.fita.nome} em solução de ${this.solucao.ion}: não há reação, delta E igual a ${fmt(e.de, 2)} volts.` };
    }
    if (k === 'destaque') {
      this.destaque = this.D.METAIS.find(m => m.id === v) || this.destaque;
      return { say: `${this.destaque.nome}: potencial padrão de ${fmt(this.destaque.e0, 2)} volts.` };
    }
    return {};
  }

  action(name) {
    if (name === 'pilha-status') {
      const p = this._pilha();
      if (!p.valida) return announce('Selecione dois metais diferentes para montar a pilha.');
      const nernst = Math.abs(p.deN - p.de) > 0.005
        ? ` Nas concentrações atuais, a equação de Nernst corrige para ΔE igual a ${fmt(p.deN, 2)} volts.`
        : '';
      return announce(`Pilha de ${p.anodo.nome} e ${p.catodo.nome}. No ânodo, polo negativo, ${p.anodo.simb} sólido se oxida a ${p.anodo.ion}, liberando elétrons. No cátodo, polo positivo, ${p.catodo.ion} recebe elétrons e deposita ${p.catodo.simb} sólido. Diferença de potencial padrão de ${fmt(p.de, 2)} volts.${nernst} A energia livre vale ${fmt(p.dG0, 0)} quilojoules por mol, negativa — é o mesmo critério de espontaneidade da termoquímica: delta E positivo equivale a delta G negativo.`);
    }
    if (name === 'mergulhar') {
      if (!this.fita || !this.solucao) return announce('Escolha a fita e a solução antes de mergulhar.');
      this.imerso = true;
      const e = this._espont();
      const c = n => n > 1 ? n + ' ' : '';
      announce(e.reage
        ? `Fita mergulhada. A reação acontece: ${c(e.coefFita)}${this.fita.simb} se oxida a ${c(e.coefFita)}${this.fita.ion}, e ${c(e.coefSol)}${this.solucao.simb} se deposita sobre a fita.`
        : 'Fita mergulhada. Nada acontece: o metal da fita é menos reativo que o íon da solução.');
    }
    if (name === 'esp-reset') {
      this.imerso = false; this.mergulhado = 0;
      announce('Fita retirada da solução.');
    }
    if (name === 'tab-status') {
      const m = this.destaque;
      if (!m) return announce('Escolha um metal na lista ou use as setas ↑ ↓ para começar.');
      const forca = m.e0 < 0 ? 'bom agente redutor: oxida-se com facilidade'
        : 'seu íon é bom agente oxidante: reduz-se com facilidade';
      announce(`${m.nome}, par ${m.ion} barra ${m.simb}, potencial padrão de redução ${fmt(m.e0, 2)} volts. É um ${forca}.`);
    }
  }

  onArrow(dx, dy) {
    if (this.modo !== 'tabela' || !dy) return false;
    if (!this.destaque) {
      // nada escolhido ainda: a primeira seta apenas ativa a régua,
      // começando pelas pontas (Au no topo, Li na base) conforme a
      // direção da tecla.
      this.destaque = this.D.METAIS[dy < 0 ? this.D.METAIS.length - 1 : 0];
      fillOptGrid('tab-grid', this.D.METAIS.map(m => ({
        value: m.id, nome: `${m.simb} / ${m.ion}`, dot: m.cor, extra: fmt(m.e0, 2) + ' V',
        aria: `${m.nome}, potencial padrão de redução ${fmt(m.e0, 2)} volts`,
      })), this.destaque.id);
      announce(`${this.destaque.nome}, ${fmt(this.destaque.e0, 2)} volts.`);
      return true;
    }
    const i = this.D.METAIS.indexOf(this.destaque);
    // D.METAIS está em ordem CRESCENTE de E° (Li primeiro, Au por último),
    // mas na régua visual é o oposto (Au no topo, Li na base — ver
    // _drawTab). Por isso a tecla ↓ precisa DIMINUIR o índice (rumo ao
    // Li, base da tela) e ↑ precisa AUMENTAR (rumo ao Au, topo da tela);
    // sem esse sinal invertido, as setas moviam o destaque na direção
    // contrária à que aparecia na tela.
    const j = clamp(i - dy, 0, this.D.METAIS.length - 1);
    if (j === i) return false;
    this.destaque = this.D.METAIS[j];
    fillOptGrid('tab-grid', this.D.METAIS.map(m => ({
      value: m.id, nome: `${m.simb} / ${m.ion}`, dot: m.cor, extra: fmt(m.e0, 2) + ' V',
      aria: `${m.nome}, potencial padrão de redução ${fmt(m.e0, 2)} volts`,
    })), this.destaque.id);
    announce(`${this.destaque.nome}, ${fmt(this.destaque.e0, 2)} volts.`);
    return true;
  }

  /* ── modelos ── */
  _pilha() {
    if (!this.esq || !this.dir) return { valida: false, de: 0, deN: 0, anodo: null, catodo: null };
    const a = this.esq, b = this.dir;
    if (a.id === b.id) return { valida: false, de: 0, deN: 0, anodo: a, catodo: b };
    const catodo = a.e0 > b.e0 ? a : b;
    const anodo = a.e0 > b.e0 ? b : a;
    const de = catodo.e0 - anodo.e0;
    const anodoEsq = anodo === a;

    // equação de Nernst: ΔE = ΔE° − (0,0592/n)·log Q, a 25 °C
    // n = mmc dos elétrons trocados; a reação é balanceada multiplicando
    // cada semirreação pelo fator que faz os elétrons coincidirem em n.
    const concAnodo = Math.pow(10, anodoEsq ? this.concEsq : this.concDir);
    const concCatodo = Math.pow(10, anodoEsq ? this.concDir : this.concEsq);
    const n = this._mmc(anodo.n, catodo.n);
    const coefAnodo = n / anodo.n;   // expoente do produto [ânodoⁿ⁺] em Q
    const coefCatodo = n / catodo.n; // expoente do reagente [cátodoᵐ⁺] em Q
    const Q = Math.pow(concAnodo, coefAnodo) / Math.pow(concCatodo, coefCatodo);
    const deN = de - (0.0592 / n) * Math.log10(Q);

    // ── A PONTE COM A TERMOQUÍMICA: ΔG = −n·F·ΔE ──
    // Todos os ingredientes já estavam calculados aqui (n, ΔE) e a constante
    // de Faraday já estava nos dados; faltava só fazer a conta. É o resultado
    // que amarra o simulador de eletroquímica ao de termoquímica: ΔE > 0
    // significa ΔG < 0, ou seja, exatamente o mesmo critério de espontaneidade
    // que o módulo Espontaneidade do SITQ usa. E, de ΔG° = −R·T·ln K, sai
    // também a constante de equilíbrio da reação da pilha.
    const F = this.D.F;                       // 96500 C/mol de elétrons
    const dG0 = -n * F * de / 1000;           // kJ/mol (÷1000: J → kJ)
    const dG  = -n * F * deN / 1000;          // idem, nas concentrações atuais
    const R = 8.314, T = 298.15;
    const K = Math.exp(n * F * de / (R * T));

    return {
      valida: true, anodo, catodo, de, deN, anodoEsq,
      n, coefAnodo, coefCatodo, Q, concAnodo, concCatodo,
      dG0, dG, K, F,
    };
  }

  _espont() {
    if (!this.fita || !this.solucao) return { de: 0, reage: false, n: 1, coefFita: 1, coefSol: 1 };
    const de = this.solucao.e0 - this.fita.e0;
    const reage = de > 0.001 && this.fita.id !== this.solucao.id;
    // balanceamento por mmc dos elétrons — sem isso, pares com números de
    // oxidação diferentes (ex.: Zn (n=2) deslocando Ag⁺ (n=1)) apareciam
    // com equação global na proporção errada (1:1 em vez de 1:2).
    const n = this._mmc(this.fita.n, this.solucao.n);
    const coefFita = n / this.fita.n;   // Zn e Zn²⁺ nessa proporção
    const coefSol = n / this.solucao.n; // Ag⁺ e Ag nessa proporção
    return { de, reage, n, coefFita, coefSol };
  }

  update(dt, app) {
    this.fase += dt;
    if (this.modo === 'espontaneidade' && this.imerso) {
      const e = this._espont();
      if (e.reage) {
        // velocidade proporcional ao ΔE°: uma reação bem espontânea
        // (ex.: Mg em AgNO₃, ΔE° grande) muda de cor visivelmente mais
        // rápido que uma mal espontânea (ex.: Cu em AgNO₃, ΔE° pequeno)
        // — antes a taxa era fixa, sem refletir a reatividade de cada par.
        const taxa = clamp(0.08 + e.de * 0.18, 0.08, 0.55);
        this.mergulhado = Math.min(1, this.mergulhado + dt * taxa);
      }
    }
    if (this.modo === 'montar') {
      const p = this._pilha();
      if (p.valida) {
        this.massaAn = clamp(this.massaAn - dt * 0.02 * p.deN, 0.25, 1);
        this.massaCat = clamp(this.massaCat + dt * 0.02 * p.deN, 1, 1.7);
      }
    }
  }

  draw(ctx, W, H, app) {
    if (this.modo === 'montar') this._drawPilha(ctx, W, H);
    else if (this.modo === 'espontaneidade') this._drawEsp(ctx, W, H);
    else this._drawTab(ctx, W, H);
  }

  _drawPilha(ctx, W, H) {
    const p = this._pilha();
    // escala derivada do canvas real: a composição foi desenhada
    // originalmente pra caber num quadro de ~420×280px; em canvases
    // maiores (a maioria das telas), ela ficava pequena no meio de uma
    // área vazia enorme. Agora cresce proporcionalmente ao espaço
    // disponível, respeitando largura E altura, até um teto razoável.
    const scale = clamp(Math.min(W / 420, H / 280), 1, 2.8);
    const cx = W / 2, cy = H / 2 + 20 * scale;
    const bw = 118 * scale, bh = 130 * scale, gap = Math.min(W * .22, 130 * scale);
    const xl = cx - gap - bw / 2, xr = cx + gap - bw / 2;
    const top = cy - bh / 2;

    if (!p.valida) {
      kLabel(ctx, 'Escolha dois metais diferentes', cx, cy, { size: 14, bold: true, color: cssVar('--accent-amber', '#fbbf24') });
      return;
    }
    const esqM = this.esq, dirM = this.dir;
    const esqEhAnodo = esqM === p.anodo;

    // béqueres — a concentração real (Nernst) aparece no rótulo, em decimal.
    // A opacidade também acompanha o progresso da reação (mesmo ritmo,
    // ditado por ΔE, que já move as placas dos eletrodos): o ânodo vai
    // ficando mais concentrado (íons se acumulando), o cátodo mais claro
    // (íons sendo consumidos) — antes as duas soluções ficavam com
    // opacidade fixa, sem refletir a reatividade do par escolhido.
    const progAnodo = clamp((1 - this.massaAn) / 0.75, 0, 1);
    const progCatodo = clamp((this.massaCat - 1) / 0.7, 0, 1);
    const alphaAnodo = 0.4 + progAnodo * 0.35;
    const alphaCatodo = 0.4 - progCatodo * 0.3;
    const cor = m => m.sol || cssVar('--accent-cyan', '#22d3ee');
    ctx.save(); ctx.translate(xl + bw / 2, 0);
    kBeaker(ctx, 0, top, bw, bh, .68, cor(esqM), { alpha: esqEhAnodo ? alphaAnodo : alphaCatodo, rotulo: `${esqM.ion} ${this._fmtConc(Math.pow(10, this.concEsq))} mol/L` });
    ctx.restore();
    ctx.save(); ctx.translate(xr + bw / 2, 0);
    kBeaker(ctx, 0, top, bw, bh, .68, cor(dirM), { alpha: esqEhAnodo ? alphaCatodo : alphaAnodo, rotulo: `${dirM.ion} ${this._fmtConc(Math.pow(10, this.concDir))} mol/L` });
    ctx.restore();

    // eletrodos (largura acompanha a massa)
    const fs = clamp(scale, 1, 1.35); // fontes crescem mais devagar que o resto, pra não ficar exagerado
    const placa = (x, m, anodo) => {
      const larg = 15 * scale * (anodo ? this.massaAn : this.massaCat);
      ctx.save();
      ctx.fillStyle = m.cor;
      kRound(ctx, x - larg / 2, top - 26 * scale, larg, bh - 8 * scale, 2); ctx.fill();
      ctx.strokeStyle = cssVar('--border', '#1c2e44'); ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      kLabel(ctx, m.simb, x, top + bh - 24 * scale, { size: 13 * fs, bold: true, color: '#0b1220' });
      kChip(ctx, anodo ? 'ÂNODO −' : 'CÁTODO +', x, top + bh + 30 * scale,
        { fg: anodo ? cssVar('--accent-cyan', '#22d3ee') : cssVar('--accent-main', '#facc15'), size: 10 * fs, bold: true });
    };
    placa(xl + bw / 2, esqM, esqEhAnodo);
    placa(xr + bw / 2, dirM, !esqEhAnodo);

    // fio externo + lâmpada
    const yFio = top - 62 * scale;
    const fio = [[xl + bw / 2, top - 26 * scale], [xl + bw / 2, yFio], [xr + bw / 2, yFio], [xr + bw / 2, top - 26 * scale]];
    ctx.save();
    ctx.strokeStyle = cssVar('--text-secondary', '#94a3b8');
    ctx.lineWidth = 2;
    ctx.beginPath();
    fio.forEach((p2, i) => i ? ctx.lineTo(p2[0], p2[1]) : ctx.moveTo(p2[0], p2[1]));
    ctx.stroke();
    ctx.restore();

    // elétrons do ânodo para o cátodo
    const rota = esqEhAnodo ? fio : fio.slice().reverse();
    kFlowDots(ctx, rota, (this.fase * 0.25 * Math.max(.3, p.deN)) % 1, 9,
      cssVar('--accent-cyan', '#22d3ee'), { rotulo: true });

    // lâmpada — brilho segue o ΔE real (Nernst), não só o padrão
    const brilho = clamp(p.deN / 2.5, .1, 1);
    const raioLamp = 26 * scale;
    ctx.save();
    const g = ctx.createRadialGradient(cx, yFio, 2, cx, yFio, raioLamp);
    g.addColorStop(0, `rgba(250,204,21,${brilho})`);
    g.addColorStop(1, 'rgba(250,204,21,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, yFio, raioLamp, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = cssVar('--accent-main', '#facc15');
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, yFio, 11 * scale, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    const foraDoPadrao = Math.abs(p.deN - p.de) > 0.005;
    kChip(ctx, `ΔE = ${fmt(p.deN, 2)} V`, cx, yFio - 34 * scale,
      { fg: cssVar('--accent-main'), size: 12 * fs, bold: true });
    if (foraDoPadrao) {
      kLabel(ctx, `ΔE° padrão = ${fmt(p.de, 2)} V`, cx, yFio - 50 * scale,
        { size: 9 * fs, color: cssVar('--text-secondary'), mono: true });
    }

    // ponte salina — tubo em U invertido arqueando por cima dos eletrodos,
    // como nos diagramas de livro-texto (ex.: LibreTexts 6.6, OpenStax
    // 17.2): "an inverted U-tube containing a gel... the salt bridge must
    // be present to close the circuit". A versão anterior desenhava só
    // uma linha fina cujo arco (fixo em 34px, sem acompanhar a escala)
    // ficava quase dentro do líquido em telas maiores — nunca chegava a
    // passar por cima dos eletrodos, que é o ponto central da imagem
    // padrão. Agora ela sobe claramente acima do topo dos eletrodos.
    const pEsq = { x: xl + bw - 18 * scale, y: top + 12 * scale };
    const pDir = { x: xr + 18 * scale, y: top + 12 * scale };
    const topoEletrodo = top - 26 * scale;
    const picoPonte = topoEletrodo - 22 * scale;
    ctx.save();
    ctx.lineCap = 'round';
    // parede do tubo (vidro)
    ctx.strokeStyle = cssVar('--border', '#334155');
    ctx.lineWidth = 13 * scale;
    ctx.beginPath();
    ctx.moveTo(pEsq.x, pEsq.y);
    ctx.quadraticCurveTo(cx, picoPonte, pDir.x, pDir.y);
    ctx.stroke();
    // gel do eletrólito inerte, visível dentro do tubo
    ctx.strokeStyle = cssVar('--accent-secondary', '#a78bfa');
    ctx.lineWidth = 8 * scale;
    ctx.globalAlpha = .8;
    ctx.beginPath();
    ctx.moveTo(pEsq.x, pEsq.y);
    ctx.quadraticCurveTo(cx, picoPonte, pDir.x, pDir.y);
    ctx.stroke();
    ctx.restore();
    // tampas porosas nas pontas, mergulhadas em cada solução
    ctx.save();
    ctx.fillStyle = cssVar('--border', '#334155');
    ctx.beginPath(); ctx.arc(pEsq.x, pEsq.y, 6.5 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pDir.x, pDir.y, 6.5 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    kLabel(ctx, 'ponte salina (KCl)', cx, picoPonte - 8 * scale, { size: 10 * fs, color: cssVar('--accent-secondary') });
    // (a notação da pilha saiu do canvas — já está na linha "Notação" do
    // painel de Resultados, junto das concentrações de cada íon)
  }

  _drawEsp(ctx, W, H) {
    const cx = W / 2, cy = H / 2;
    // mesma lógica de escala do Montar: cresce com o canvas real em vez
    // de ficar num tamanho quase fixo, pequeno demais em telas grandes.
    const scale = clamp(Math.min(W / 300, H / 450), 1, 2.4);
    const fs = clamp(scale, 1, 1.35);
    const bw = 150 * scale, bh = 170 * scale, top = cy - bh / 2 + 10 * scale;
    if (!this.fita || !this.solucao) {
      kLabel(ctx, 'Escolha a fita e a solução para começar', cx, cy, { size: 14, bold: true, color: cssVar('--accent-amber', '#fbbf24') });
      return;
    }
    const e = this._espont();

    // solução: cor esmaece à medida que o íon é consumido
    const base = this.solucao.sol || '#7dd3fc';
    const corSol = e.reage ? kMix(base, '#dbeafe', this.mergulhado * .8) : base;
    ctx.save(); ctx.translate(cx, 0);
    kBeaker(ctx, 0, top, bw, bh, .7, corSol, { alpha: .55, rotulo: `solução de ${this.solucao.ion}` });
    ctx.restore();

    // fita metálica
    const faixa = 130 * scale;
    const fy = this.imerso ? top - 20 * scale : top - 70 * scale;
    ctx.save();
    ctx.fillStyle = this.fita.cor;
    kRound(ctx, cx - 11 * scale, fy, 22 * scale, faixa, 3); ctx.fill();
    // depósito do outro metal sobre a fita
    if (e.reage && this.mergulhado > 0.02) {
      ctx.globalAlpha = clamp(this.mergulhado, 0, 1);
      ctx.fillStyle = this.solucao.cor;
      const dh = 100 * scale * this.mergulhado;
      kRound(ctx, cx - 12 * scale, fy + faixa - dh, 24 * scale, dh, 3); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = cssVar('--border', '#1c2e44'); ctx.lineWidth = 1;
    kRound(ctx, cx - 11 * scale, fy, 22 * scale, faixa, 3); ctx.stroke();
    ctx.restore();
    kLabel(ctx, this.fita.simb, cx, fy - 12 * scale, { size: 13 * fs, bold: true, color: this.fita.cor });

    // veredito
    const cor = e.reage ? cssVar('--accent-ok', '#4ade80') : cssVar('--accent-exo', '#f87171');
    kChip(ctx, e.reage ? 'REAÇÃO ESPONTÂNEA' : 'NÃO HÁ REAÇÃO', cx, 30, { fg: cor, size: 12, bold: true });
    kLabel(ctx, `ΔE° = E°(${this.solucao.ion}) − E°(${this.fita.ion}) = ${fmt(this.solucao.e0, 2)} − (${fmt(this.fita.e0, 2)}) = ${fmt(e.de, 2)} V`,
      cx, H - 40, { size: 11, mono: true, color: cssVar('--text-secondary') });
    // (a equação global balanceada saiu daqui — já está na linha
    // "Equação global" do painel de Resultados quando a reação ocorre)
    if (!e.reage) {
      kLabel(ctx, `${this.fita.simb} é menos reativo que ${this.solucao.simb}: não desloca`,
        cx, H - 20, { size: 11, color: cor });
    }
  }

  /** Posições Y da régua de potenciais sem sobreposição de rótulo.
      Preserva a ORDEM (sempre por E° crescente) e usa o espaço livre
      proporcionalmente à diferença real de potencial — mas nunca deixa
      dois rótulos mais próximos que minGap, mesmo quando os E° são
      quase idênticos (ex.: K −2,93 V e Cs −2,92 V, a 0,01 V um do outro,
      que antes caíam a menos de 1px de distância e ficavam ilegíveis). */
  _layoutRuler(metaisOrdenados, top, alt, minGap = 17) {
    const n = metaisOrdenados.length;
    if (n <= 1) return metaisOrdenados.map(() => top + alt / 2);
    const valores = metaisOrdenados.map(m => m.e0);
    // valor absoluto: a lista pode vir crescente ou decrescente (aqui é
    // decrescente, Au→Li), e a distribuição só deve olhar pra MAGNITUDE
    // da diferença entre vizinhos, nunca pro sinal.
    const totalRange = Math.abs(valores[n - 1] - valores[0]) || 1;
    const minTotal = (n - 1) * minGap;
    // tela baixa demais pro mínimo legível: distribui igualmente em vez
    // de garantir minGap — é o melhor possível no espaço que existe.
    const gapBase = minTotal <= alt ? minGap : alt / (n - 1);
    const slack = Math.max(0, alt - minTotal);
    const ys = [top];
    for (let i = 1; i < n; i++) {
      const valueGap = Math.abs(valores[i] - valores[i - 1]);
      ys.push(ys[i - 1] + gapBase + slack * (valueGap / totalRange));
    }
    return ys;
  }

  _drawTab(ctx, W, H) {
    // ordena defensivamente por E° — a régua nunca deve depender de
    // METAIS já vir ordenado no arquivo de dados.
    const M = [...this.D.METAIS].sort((a, b) => b.e0 - a.e0);
    const x = W / 2;
    const top = 50, bottomPad = 46;
    // usa a altura real do canvas (sem teto fixo de 300px, que
    // desperdiçava espaço disponível em telas maiores) com um piso
    // mínimo pra não colapsar em janelas muito baixas.
    const alt = Math.max(220, H - top - bottomPad);
    const ys = this._layoutRuler(M, top, alt);

    // régua
    ctx.save();
    ctx.strokeStyle = cssVar('--border', '#1c2e44');
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + alt); ctx.stroke();
    ctx.restore();

    // offsets horizontais escaláveis — em vez de fixos, evitam que
    // setas e legendas saiam da área visível em canvases estreitos.
    const setaX = Math.min(150, W * 0.28);
    const chipX = Math.min(96, W * 0.18);

    M.forEach((m, i) => {
      const y = ys[i];
      const on = !!this.destaque && m.id === this.destaque.id;
      ctx.save();
      ctx.strokeStyle = on ? cssVar('--accent-main', '#facc15') : cssVar('--text-muted', '#64748b');
      ctx.lineWidth = on ? 2.4 : 1.2;
      ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.stroke();
      ctx.fillStyle = m.cor;
      ctx.beginPath(); ctx.arc(x, y, on ? 6.5 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      kLabel(ctx, `${m.simb} / ${m.ion}`, x - 24, y,
        { size: on ? 12 : 11, align: 'right', bold: on, color: on ? cssVar('--accent-main') : cssVar('--text-secondary') });
      kLabel(ctx, fmt(m.e0, 2) + ' V', x + 24, y,
        { size: on ? 12 : 11, align: 'left', bold: on, mono: true, color: on ? cssVar('--accent-main') : cssVar('--text-secondary') });
      if (m.ref) kChip(ctx, 'referência', x + chipX, y, { fg: cssVar('--accent-secondary', '#a78bfa'), size: 9 });
    });

    kArrow(ctx, x - setaX, top + alt, x - setaX, top, { color: cssVar('--accent-cyan', '#22d3ee'), w: 2 });
    kLabel(ctx, 'poder oxidante do íon →', x - setaX, top - 16, { size: 10, color: cssVar('--accent-cyan') });
    kArrow(ctx, x + setaX, top, x + setaX, top + alt, { color: cssVar('--accent-exo', '#f87171'), w: 2 });
    kLabel(ctx, 'poder redutor do metal →', x + setaX, top + alt + 18, { size: 10, color: cssVar('--accent-exo') });
    kLabel(ctx, 'Potenciais padrão de redução (25 °C, 1 mol/L)', W / 2, 22,
      { size: 12, bold: true, color: cssVar('--text-primary') });
  }

  getResults() {
    if (this.modo === 'montar') {
      const p = this._pilha();
      if (!p.valida) {
        const msg = (!this.esq || !this.dir) ? 'escolha dois metais para montar a pilha' : 'metais iguais';
        return [{ l: 'Situação', v: msg, cls: 'val-amber' }];
      }
      return [
        { l: 'Ânodo (oxidação)', v: `${p.anodo.simb} · ${fmt(p.anodo.e0, 2)} V` },
        { l: 'Cátodo (redução)', v: `${p.catodo.simb} · ${fmt(p.catodo.e0, 2)} V` },
        { l: 'Semirreação anódica', v: `${p.anodo.simb} → ${p.anodo.ion} + ${p.anodo.n} e⁻` },
        { l: 'Semirreação catódica', v: `${p.catodo.ion} + ${p.catodo.n} e⁻ → ${p.catodo.simb}` },
        { l: `[${p.anodo.ion}]`, v: this._fmtConc(p.concAnodo) + ' mol/L' },
        { l: `[${p.catodo.ion}]`, v: this._fmtConc(p.concCatodo) + ' mol/L' },
        { l: 'Elétrons trocados (n)', v: String(p.n) },
        { l: 'Quociente Q', v: fmt(p.Q, 4) },
        { l: 'ΔE° (padrão, 1 mol/L)', v: fmt(p.de, 2) + ' V' },
        { l: 'ΔE (Nernst, agora)', v: fmt(p.deN, 2) + ' V', cls: p.deN > 0 ? 'val-ok' : 'val-exo' },
        { l: 'Espontânea agora?', v: p.deN > 0 ? 'sim' : 'não', cls: p.deN > 0 ? 'val-ok' : 'val-exo' },
        /* ── ponte com a termoquímica ── */
        { l: '— Energia livre —', v: '' },
        { l: 'F (Faraday)', v: `${p.F} C/mol e⁻` },
        { l: 'ΔG° = −n·F·ΔE°', v: `${fmt(p.dG0, 1)} kJ/mol`, cls: p.dG0 < 0 ? 'val-ok' : 'val-exo' },
        { l: 'ΔG (nas conc. atuais)', v: `${fmt(p.dG, 1)} kJ/mol`, cls: p.dG < 0 ? 'val-ok' : 'val-exo' },
        { l: 'Critério equivalente', v: 'ΔE > 0  ⟺  ΔG < 0  ⟺  espontânea' },
        { l: 'K (de ΔG° = −RT·lnK)', v: p.K > 1e15 ? '> 10¹⁵' : p.K.toExponential(2) },
        { l: 'Notação', v: `${p.anodo.simb}|${p.anodo.ion}‖${p.catodo.ion}|${p.catodo.simb}` },
      ];
    }
    if (this.modo === 'espontaneidade') {
      if (!this.fita || !this.solucao) {
        return [{ l: 'Situação', v: 'escolha a fita e a solução', cls: 'val-amber' }];
      }
      const e = this._espont();
      const c = n => n > 1 ? n + ' ' : '';
      const linhas = [
        { l: 'Fita', v: `${this.fita.simb} · ${fmt(this.fita.e0, 2)} V` },
        { l: 'Íon da solução', v: `${this.solucao.ion} · ${fmt(this.solucao.e0, 2)} V` },
        { l: 'ΔE°', v: fmt(e.de, 2) + ' V', cls: e.reage ? 'val-ok' : 'val-exo' },
        { l: 'Reage?', v: e.reage ? 'sim, espontânea' : 'não', cls: e.reage ? 'val-ok' : 'val-exo' },
      ];
      if (e.reage) {
        linhas.push(
          { l: 'Agente redutor', v: `${this.fita.simb} (oxida, perde e⁻)` },
          { l: 'Agente oxidante', v: `${this.solucao.ion} (reduz, ganha e⁻)` },
          { l: 'Semirreação de oxidação', v: `${this.fita.simb} → ${this.fita.ion} + ${this.fita.n} e⁻` },
          { l: 'Semirreação de redução', v: `${this.solucao.ion} + ${this.solucao.n} e⁻ → ${this.solucao.simb}` },
          { l: 'Equação global', v: `${c(e.coefFita)}${this.fita.simb} + ${c(e.coefSol)}${this.solucao.ion} → ${c(e.coefFita)}${this.fita.ion} + ${c(e.coefSol)}${this.solucao.simb}` },
        );
      }
      linhas.push(
        { l: 'Deposição', v: fmt(this.mergulhado * 100, 0) + ' %' },
        { l: 'Fita imersa', v: this.imerso ? 'sim' : 'não' },
      );
      return linhas;
    }
    const m = this.destaque;
    if (!m) return [{ l: 'Situação', v: 'escolha um metal na lista ou use as setas ↑ ↓', cls: 'val-amber' }];
    return [
      { l: 'Metal', v: m.nome },
      { l: 'Par redox', v: `${m.ion} / ${m.simb}` },
      { l: 'Elétrons (n)', v: String(m.n) },
      { l: 'E° de redução', v: fmt(m.e0, 2) + ' V', cls: 'val-ok' },
      { l: 'E° de oxidação', v: fmt(-m.e0, 2) + ' V' },
      { l: 'Caráter', v: m.e0 < 0 ? 'bom redutor' : 'íon bom oxidante' },
      { l: 'Posição na régua', v: `${[...this.D.METAIS].sort((a, b) => b.e0 - a.e0).findIndex(x => x.id === m.id) + 1}ª de ${this.D.METAIS.length} (topo = mais oxidante)` },
    ];
  }

  getOverlay() {
    if (this.modo === 'montar') {
      const p = this._pilha();
      return p.valida ? `${p.anodo.simb} ‖ ${p.catodo.simb} · ΔE ${fmt(p.deN, 2)} V` : 'Escolha dois metais';
    }
    if (this.modo === 'espontaneidade') {
      if (!this.fita || !this.solucao) return 'Escolha a fita e a solução';
      const e = this._espont();
      return `${this.fita.simb} em ${this.solucao.ion} · ${e.reage ? 'reage' : 'não reage'}`;
    }
    if (!this.destaque) return 'Escolha um metal';
    return `${this.destaque.simb} · ${fmt(this.destaque.e0, 2)} V`;
  }
}

// ══════════════════════════════════════════════════════════════════
// MECÂNICA B — Eletrólise e Faraday (origem: SIELE)
// Modos: ígnea (sal fundido) · aquosa (filas de descarga) · Faraday
// ══════════════════════════════════════════════════════════════════
class MechB {
  constructor(D) {
    this.D = D;
    this.modo = 'ignea';
    // modo 1
    this.sal = null;
    this.iign = 2;
    this.ligada = true;
    this.ions = [];
    this.bolhasAn = []; this.bolhasCat = [];
    // modo 2
    this.eletrolito = null;
    this.iaq = 2;
    this.ligadaAq = true;
    this.bAn = []; this.bCat = [];
    // modo 3
    this.metal = null;
    this.ifar = 2; this.tfar = 1800;
    this.prog = 0; this.depositando = false;
    this.fase = 0;
    this._semear();
  }

  build(app) {
    fillOptGrid('ignea-grid', this.D.IGNEA.map(s => ({
      value: s.id, nome: s.nome, dot: s.corAn, extra: `${s.cation} / ${s.anion}`,
      aria: `${s.nome}, cátion ${s.cation}, ânion ${s.anion}, funde a ${s.tfusao} graus`,
    })), this.sal ? this.sal.id : null);
    fillOptGrid('aquosa-grid', this.D.AQUOSA.map(e => ({
      value: e.id, nome: e.nome, dot: e.corSol, extra: `${e.cat} + ${e.an}`,
      aria: `${e.nome} produz ${e.cat} no cátodo e ${e.an} no ânodo`,
    })), this.eletrolito ? this.eletrolito.id : null);
    fillOptGrid('far-grid', this.D.GALVANO.map(m => ({
      value: m.id, nome: m.nome, dot: m.cor, extra: `${fmt(m.M, 2)} · n=${m.n}`,
      aria: `${m.nome}, massa molar ${fmt(m.M, 2)} gramas por mol, ${m.n} elétrons por íon`,
    })), this.metal ? this.metal.id : null);
  }

  setMode(id) { this.modo = id; }

  setParam(k, v) {
    switch (k) {
      case 'sal':
        this.sal = this.D.IGNEA.find(s => s.id === v) || this.sal;
        this._semear();
        return { say: `${this.sal.nome}. No cátodo forma-se ${this.sal.cat}; no ânodo, ${this.sal.an}.` };
      case 'iign': this.iign = v; break;
      case 'eletrolito':
        this.eletrolito = this.D.AQUOSA.find(e => e.id === v) || this.eletrolito;
        this.bAn = []; this.bCat = [];
        return { say: `${this.eletrolito.nome}: no cátodo ${this.eletrolito.cat}, no ânodo ${this.eletrolito.an}. ${this.eletrolito.resta}.` };
      case 'iaq': this.iaq = v; break;
      case 'metal':
        this.metal = this.D.GALVANO.find(m => m.id === v) || this.metal;
        this.prog = 0;
        return { say: `${this.metal.nome}: massa molar ${fmt(this.metal.M, 2)} e ${this.metal.n} elétrons por íon.` };
      case 'ifar': this.ifar = v; this.prog = 0; break;
      case 'tfar': this.tfar = v; this.prog = 0; break;
    }
    return {};
  }

  action(name) {
    if (name === 'toggle-fonte') {
      if (!this.sal) return announce('Escolha um sal fundido antes de ligar a fonte.');
      this.ligada = !this.ligada;
      announce(this.ligada
        ? `Fonte ligada. Cátions ${this.sal.cation} migram ao cátodo e ânions ${this.sal.anion} ao ânodo.`
        : 'Fonte desligada: os íons param de migrar.');
    }
    if (name === 'toggle-fonte-aq') {
      if (!this.eletrolito) return announce('Escolha um eletrólito antes de ligar a fonte.');
      this.ligadaAq = !this.ligadaAq;
      announce(this.ligadaAq
        ? `Fonte ligada. Cátodo produz ${this.eletrolito.cat} e ânodo produz ${this.eletrolito.an}.`
        : 'Fonte desligada.');
    }
    if (name === 'depositar') {
      if (!this.metal) return announce('Escolha um metal antes de depositar.');
      this.depositando = true; this.prog = 0;
      const r = this._faraday();
      announce(`Deposição iniciada. Ao fim de ${fmt(this.tfar, 0)} segundos serão depositados ${fmt(r.m, 4)} gramas de ${this.metal.nome}.`);
    }
    if (name === 'far-reset') {
      this.depositando = false; this.prog = 0;
      announce('Cuba reiniciada.');
    }
  }

  _semear() {
    this.ions = [];
    for (let i = 0; i < 26; i++) {
      this.ions.push({
        x: (Math.random() - .5) * 210, y: (Math.random() - .5) * 90,
        cat: i % 2 === 0, ph: Math.random(),
      });
    }
  }

  _faraday() {
    if (!this.metal) return { Q: 0, mole: 0, m: 0, molE: 0 };
    const M = this.metal, Q = this.ifar * this.tfar;
    const mole = Q / (M.n * this.D.F);
    return { Q, mole, m: mole * M.M, molE: Q / this.D.F };
  }

  /** Fator de escala da cuba (ígnea/aquosa), usado tanto no update()
      (posição dos íons, caixa das bolhas) quanto no _drawCuba (tamanho
      dos elementos) — precisa ser a MESMA conta nos dois lugares, ou os
      íons se movem numa área diferente da que é desenhada. */
  _cubaScale(W, H) { return clamp(Math.min(W / 380, H / 340), 1, 2); }

  update(dt, app) {
    this.fase += dt;
    const scale = app ? this._cubaScale(app.W, app.H) : 1;
    if (this.modo === 'ignea' && this.ligada && this.sal) {
      // teto do clamp ampliado na mesma proporção do máximo do slider
      // (0,5–10 A -> 0,5–20 A), pra corrente alta continuar acelerando
      // visivelmente os íons em vez de saturar na metade da faixa nova.
      const v = isReduced() ? 0 : 26 * scale * clamp(this.iign / 4, .3, 4.4);
      const limite = 105 * scale;
      this.ions.forEach(io => {
        io.x += (io.cat ? -1 : 1) * v * dt;
        if (io.x < -limite) io.x = limite;
        if (io.x > limite) io.x = -limite;
      });
      const boxA = { x: 78 * scale, y: -46 * scale, w: 22 * scale, h: 84 * scale };
      if (this.sal.gasAn) kBubbles(this.bolhasAn, dt, boxA, 12 * this.iign, {});
    }
    if (this.modo === 'aquosa' && this.ligadaAq && this.eletrolito) {
      const E = this.eletrolito;
      const boxA = { x: 74 * scale, y: -46 * scale, w: 22 * scale, h: 84 * scale };
      const boxC = { x: -96 * scale, y: -46 * scale, w: 22 * scale, h: 84 * scale };
      if (E.gasAn) kBubbles(this.bAn, dt, boxA, 12 * this.iaq, {});
      if (E.gasCat) kBubbles(this.bCat, dt, boxC, 12 * this.iaq, {});
    }
    if (this.modo === 'faraday' && this.depositando) {
      // velocidade da animação escalada pela corrente: antes era uma
      // taxa fixa (dt*.35) que terminava sempre no mesmo tempo visual,
      // não importava se eram 0,5 A ou 10 A — mesmo a massa calculada
      // variando 20x entre os dois. Agora corrente maior deposita
      // visivelmente mais rápido, refletindo a física de fato.
      const taxa = this.metal ? clamp(0.12 + this.ifar * 0.045, 0.12, 0.6) : 0.35;
      this.prog = Math.min(1, this.prog + dt * taxa);
      if (this.prog >= 1) this.depositando = false;
    }
  }

  draw(ctx, W, H, app) {
    if (this.modo === 'ignea') this._drawCuba(ctx, W, H, false);
    else if (this.modo === 'aquosa') this._drawCuba(ctx, W, H, true);
    else this._drawFar(ctx, W, H);
  }

  _drawCuba(ctx, W, H, aquosa) {
    const E = aquosa ? this.eletrolito : this.sal;
    if (!E) {
      kLabel(ctx, aquosa ? 'Escolha um eletrólito para começar' : 'Escolha um sal fundido para começar',
        W / 2, H / 2, { size: 14, bold: true, color: cssVar('--accent-amber', '#fbbf24') });
      return;
    }
    const on = aquosa ? this.ligadaAq : this.ligada;
    const corr = aquosa ? this.iaq : this.iign;
    // mesma escala usada no update() pros íons — precisa bater, ou o
    // enxame de íons se move numa área diferente do que está desenhado.
    const scale = this._cubaScale(W, H);
    const fs = clamp(scale, 1, 1.35);
    const cx = W / 2, cy = H / 2 + 26 * scale;
    const bw = 250 * scale, bh = 130 * scale;

    // cuba
    const corLiq = aquosa ? E.corSol : '#f59e0b';
    ctx.save(); ctx.translate(cx, 0);
    kBeaker(ctx, 0, cy - bh / 2, bw, bh, .82, corLiq,
      { alpha: aquosa ? .45 : .6, rotulo: aquosa ? E.nome + ' — solução' : E.nome });
    ctx.restore();
    if (!aquosa) kFlame(ctx, cx, cy + bh / 2 + 30 * scale, 18 * scale, this.fase);

    // eletrodos
    const ey = cy - bh / 2 - 26 * scale, eh = bh - 6 * scale;
    const ex1 = cx - 86 * scale, ex2 = cx + 86 * scale;
    const placa = (x, pos, rot) => {
      ctx.save();
      ctx.fillStyle = cssVar('--text-secondary', '#94a3b8');
      kRound(ctx, x - 8 * scale, ey, 16 * scale, eh, 2); ctx.fill();
      ctx.restore();
      kChip(ctx, rot, x, cy + bh / 2 + 20 * scale,
        { fg: pos ? cssVar('--accent-exo', '#f87171') : cssVar('--accent-cyan', '#22d3ee'), size: 10 * fs, bold: true });
    };
    placa(ex1, false, 'CÁTODO (−)');
    placa(ex2, true, 'ÂNODO (+)');

    // fonte externa e fio
    const yTop = ey - 56 * scale;
    const fio = [[ex1, ey], [ex1, yTop], [cx - 26 * scale, yTop], [cx + 26 * scale, yTop], [ex2, yTop], [ex2, ey]];
    ctx.save();
    ctx.strokeStyle = cssVar('--text-secondary');
    ctx.lineWidth = 2;
    ctx.beginPath();
    fio.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.stroke();
    // símbolo da fonte
    ctx.strokeStyle = on ? cssVar('--accent-main', '#f87171') : cssVar('--text-muted', '#64748b');
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 8 * scale, yTop - 12 * scale); ctx.lineTo(cx - 8 * scale, yTop + 12 * scale); ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx + 8 * scale, yTop - 7 * scale); ctx.lineTo(cx + 8 * scale, yTop + 7 * scale); ctx.stroke();
    ctx.restore();
    kChip(ctx, on ? `fonte ligada · ${fmt(corr, 1)} A` : 'fonte desligada', cx, yTop - 28 * scale,
      { fg: on ? cssVar('--accent-main') : cssVar('--text-muted'), size: 11 * fs, bold: true });

    // elétrons no fio externo: da fonte para o cátodo
    if (on) {
      kFlowDots(ctx, [[cx - 26 * scale, yTop], [ex1, yTop], [ex1, ey]], (this.fase * .3) % 1, 4,
        cssVar('--accent-cyan', '#22d3ee'), { rotulo: true });
      kFlowDots(ctx, [[ex2, ey], [ex2, yTop], [cx + 26 * scale, yTop]], (this.fase * .3) % 1, 4,
        cssVar('--accent-cyan', '#22d3ee'), {});
    }

    if (!aquosa) {
      // íons migrando
      ctx.save(); ctx.translate(cx, cy);
      this.ions.forEach(io => {
        ctx.fillStyle = io.cat ? this.sal.corCat : this.sal.corAn;
        ctx.beginPath(); ctx.arc(io.x, io.y, 4.4 * scale, 0, Math.PI * 2); ctx.fill();
        kLabel(ctx, io.cat ? '+' : '−', io.x, io.y, { size: 8 * fs, color: '#0b1220', bold: true });
      });
      ctx.restore();
      // bolhas de gás no ânodo
      ctx.save(); ctx.translate(cx, cy);
      kDrawBubbles(ctx, this.bolhasAn, 'rgba(255,255,255,.7)');
      ctx.restore();
      // metal líquido acumulando no cátodo
      ctx.save();
      ctx.fillStyle = this.sal.corCat;
      ctx.globalAlpha = .8;
      kRound(ctx, ex1 - 14 * scale, cy + bh / 2 - 16 * scale, 28 * scale, 12 * scale, 3); ctx.fill();
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(cx, cy);
      kDrawBubbles(ctx, this.bAn, 'rgba(255,255,255,.75)');
      kDrawBubbles(ctx, this.bCat, 'rgba(255,255,255,.75)');
      ctx.restore();
      if (!E.gasCat) {
        ctx.save();
        ctx.fillStyle = E.corCat;
        kRound(ctx, ex1 - 10 * scale, ey + 12 * scale, 20 * scale, eh - 18 * scale, 2); ctx.fill();
        ctx.restore();
      }
    }

    // (semirreações completas e fusão/observação saíram do canvas —
    // já aparecem por extenso e mais legíveis no painel de Resultados;
    // manter os dois lugares só duplicava texto sem ganhar clareza)
  }

  _drawFar(ctx, W, H) {
    if (!this.metal) {
      kLabel(ctx, 'Escolha um metal para começar', W / 2, H / 2, { size: 14, bold: true, color: cssVar('--accent-amber', '#fbbf24') });
      return;
    }
    const r = this._faraday();
    const cx = W / 2, cy = H / 2 + 20;
    // mesma lógica de escala dos outros modos: cresce com o canvas real
    // até um teto, em vez de ficar pequeno em telas grandes (antes era
    // só um Math.min, que nunca deixava crescer de verdade).
    const scale = clamp(Math.min(W / 380, H / 320), 1, 2.2);
    const fs = clamp(scale, 1, 1.35);
    const bw = 230 * scale, bh = 140 * scale;

    ctx.save(); ctx.translate(cx, 0);
    kBeaker(ctx, 0, cy - bh / 2, bw, bh, .8, '#7dd3fc', { alpha: .35, rotulo: `banho de ${this.metal.nome}` });
    ctx.restore();

    // peça a ser revestida (cátodo) com camada crescendo
    const px = cx - bw * 0.287, ey = cy - bh / 2 - bh * 0.157, eh = bh - 4 * scale;
    const pw = bw * 0.139;
    ctx.save();
    ctx.fillStyle = cssVar('--text-secondary', '#94a3b8');
    kRound(ctx, px - pw / 2, ey, pw, eh, 3); ctx.fill();
    // alvo da camada em escala √massa, com teto proporcional à própria
    // peça (não mais um valor fixo em pixels): antes, em massas grandes
    // (ex.: correntes/tempos altos), a camada crescia até ~42px, quase
    // do tamanho do béquer inteiro, e engolia o desenho — inclusive
    // colidindo com os rótulos de baixo. Agora o teto acompanha o
    // tamanho do béquer, então nunca deixa de caber.
    const camAlvo = clamp(3 * scale + Math.sqrt(r.m) * 2 * scale, 3 * scale, bw * 0.07);
    const cam = camAlvo * this.prog;
    if (cam > .5) {
      ctx.fillStyle = this.metal.cor;
      kRound(ctx, px - pw / 2 - cam, ey - cam / 2, pw + cam * 2, eh + cam, 3); ctx.fill();
    }
    ctx.restore();
    kChip(ctx, 'peça — CÁTODO (−)', px, cy + bh / 2 + 20 * scale, { fg: cssVar('--accent-cyan', '#22d3ee'), size: 10 * fs, bold: true });

    // ânodo do metal puro
    const ax = cx + bw * 0.33;
    ctx.save();
    ctx.fillStyle = this.metal.cor;
    kRound(ctx, ax - bw * 0.039, ey, bw * 0.078, eh * (1 - this.prog * .18), 3); ctx.fill();
    ctx.restore();
    kChip(ctx, `${this.metal.nome} — ÂNODO (+)`, ax, cy + bh / 2 + 20 * scale, { fg: cssVar('--accent-exo', '#f87171'), size: 10 * fs, bold: true });

    // circuito
    const yTop = ey - bh * 0.36;
    ctx.save();
    ctx.strokeStyle = cssVar('--text-secondary');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, ey); ctx.lineTo(px, yTop); ctx.lineTo(ax, yTop); ctx.lineTo(ax, ey);
    ctx.stroke();
    ctx.restore();
    if (this.depositando) {
      kFlowDots(ctx, [[ax, ey], [ax, yTop], [px, yTop], [px, ey]], (this.fase * .35) % 1, 7,
        cssVar('--accent-cyan', '#22d3ee'), { rotulo: true });
    }
    kChip(ctx, `${fmt(this.ifar, 1)} A durante ${fmt(this.tfar, 0)} s`, cx, yTop - 24 * scale,
      { fg: cssVar('--accent-main', '#f87171'), size: 11 * fs, bold: true });

    // (o rótulo "X depositado: Y g" que ficava aqui, perto do topo, saiu:
    // é a mesma informação do selo overlay-label — mesmo texto, mesma
    // posição — então as duas colidiam visualmente. O selo já resolve.)

    // barra de progresso
    if (this.prog > 0) {
      const barW = Math.min(W - 80, 300);
      ctx.save();
      ctx.fillStyle = cssVar('--border', '#1c2e44');
      kRound(ctx, cx - barW / 2, H - 26, barW, 8, 4); ctx.fill();
      ctx.fillStyle = this.metal.cor;
      kRound(ctx, cx - barW / 2, H - 26, Math.max(4, barW * this.prog), 8, 4); ctx.fill();
      ctx.restore();
    }
  }

  getResults() {
    if (this.modo === 'ignea') {
      if (!this.sal) return [{ l: 'Situação', v: 'escolha um sal fundido', cls: 'val-amber' }];
      const s = this.sal;
      return [
        { l: 'Sal fundido', v: s.nome },
        { l: 'Fusão', v: s.tfusao + ' °C' },
        { l: 'Cátodo (−)', v: s.semiCat, cls: 'val-endo' },
        { l: 'Ânodo (+)', v: s.semiAn, cls: 'val-exo' },
        { l: 'Produto catódico', v: s.cat },
        { l: 'Produto anódico', v: s.an },
        { l: 'Corrente', v: fmt(this.iign, 1) + ' A' },
        { l: 'Fonte', v: this.ligada ? 'ligada' : 'desligada', cls: this.ligada ? 'val-ok' : '' },
      ];
    }
    if (this.modo === 'aquosa') {
      if (!this.eletrolito) return [{ l: 'Situação', v: 'escolha um eletrólito', cls: 'val-amber' }];
      const E = this.eletrolito;
      // "Produtos" saiu (repetia Cátodo+Ânodo) e as duas filas completas
      // de descarga saíram (texto de referência genérico, despejado
      // inteiro em toda seleção — poluía o painel). A "Observação" já
      // traz o porquê específico deste eletrólito; a fila geral continua
      // acessível no card "Sobre o modo", à esquerda.
      return [
        { l: 'Eletrólito', v: E.nome },
        { l: 'Cátodo (−)', v: E.semiCat, cls: 'val-endo' },
        { l: 'Ânodo (+)', v: E.semiAn, cls: 'val-exo' },
        { l: 'Observação', v: E.resta },
        { l: 'Fonte', v: this.ligadaAq ? 'ligada' : 'desligada', cls: this.ligadaAq ? 'val-ok' : '' },
      ];
    }
    if (!this.metal) return [{ l: 'Situação', v: 'escolha um metal', cls: 'val-amber' }];
    const r = this._faraday(), M = this.metal;
    return [
      { l: 'Metal', v: M.nome },
      { l: 'Massa molar', v: fmt(M.M, 2) + ' g/mol' },
      { l: 'Elétrons (n)', v: String(M.n) },
      { l: 'Corrente', v: fmt(this.ifar, 1) + ' A' },
      { l: 'Tempo', v: fmt(this.tfar, 0) + ' s (' + fmt(this.tfar / 60, 1) + ' min)' },
      { l: 'Carga Q = i·t', v: fmt(r.Q, 0) + ' C' },
      { l: 'mol de elétrons', v: fmt(r.molE, 5) + ' mol' },
      { l: 'mol de metal', v: fmt(r.mole, 5) + ' mol' },
      { l: 'Massa depositada', v: fmt(r.m, 4) + ' g', cls: 'val-ok' },
    ];
  }

  getOverlay() {
    if (this.modo === 'ignea') return this.sal ? `${this.sal.nome} · ${this.ligada ? fmt(this.iign, 1) + ' A' : 'desligada'}` : 'Escolha um sal fundido';
    if (this.modo === 'aquosa') return this.eletrolito ? `${this.eletrolito.nome} · ${this.eletrolito.cat} + ${this.eletrolito.an}` : 'Escolha um eletrólito';
    return this.metal ? `${this.metal.nome} · ${fmt(this._faraday().m, 4)} g` : 'Escolha um metal';
  }
}

// ══════════════════════════════════════════════════════════════════
// MECH — FACHADA que une as duas mecânicas deste simulador.
// D.MECH_B (no arquivo de dados) lista os ids de modo atendidos pela
// segunda mecânica; todos os demais vão para a primeira. O App
// conversa apenas com esta classe, exatamente como num simulador de
// mecânica única — cada mecânica interna permanece intocada.
// ══════════════════════════════════════════════════════════════════
class Mech {
  constructor(D) {
    this.D = D;
    this.a = new MechA(D);
    this.b = new MechB(D);
    this._bSet = new Set(D.MECH_B || []);
    this.cur = this.a;
  }
  set app(v) { this._app = v; this.a.app = v; this.b.app = v; }
  get app() { return this._app; }
  build(app) {
    if (typeof this.a.build === 'function') this.a.build(app);
    if (typeof this.b.build === 'function') this.b.build(app);
  }
  setMode(id) {
    this.cur = this._bSet.has(id) ? this.b : this.a;
    this.cur.setMode(id);
  }
  setParam(k, v) { return this.cur.setParam(k, v); }
  action(n, el) { return this.cur.action(n, el); }
  update(dt, app) { this.cur.update(dt, app); }
  draw(ctx, W, H, app) { this.cur.draw(ctx, W, H, app); }
  getResults() { return this.cur.getResults(); }
  getOverlay() { return this.cur.getOverlay ? this.cur.getOverlay() : ''; }
  onArrow(dx, dy) { return this.cur.onArrow ? this.cur.onArrow(dx, dy) : false; }
  onDrag(dx, dy) { if (this.cur.onDrag) this.cur.onDrag(dx, dy); }
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
    // 'data-pow' é um atributo booleano sem valor — no dataset ele vira
    // string vazia (""), que é FALSY em JS. Testar com "inp.dataset.pow ?"
    // nunca entra no ramo verdadeiro; é preciso checar a PRESENÇA do
    // atributo, não a veracidade do seu valor.
    const ehLog = inp.hasAttribute('data-pow');
    const casas = inp.dataset.fmt === 'f2' ? 2 : inp.dataset.fmt === 'f1' ? 1 : 0;
    const val = ehLog ? Math.pow(10, v) : v;
    // sliders logarítmicos (ex.: concentração) mostram o valor real em
    // mol/L, com casas decimais suficientes p/ o número não sumir — nunca
    // o expoente cru, que confundia sem indicar o que ele representava.
    const casasPow = val < 0.01 ? 4 : val < 0.1 ? 3 : val < 1 ? 2 : 1;
    const txt = ehLog ? fmt(val, casasPow) : fmt(val, casas);
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

      // O painel de "Resultados" só era atualizado em cliques/seleções
      // (via _param/action), nunca durante a animação em si — por isso
      // valores que mudam com o tempo (ex.: % de Deposição na fita, em
      // Espontaneidade) ficavam visualmente travados no valor do instante
      // do clique, mesmo com o canvas animando normalmente ao lado.
      // Atualiza uns 6x/s: fluido o bastante, sem recriar o DOM a 60fps.
      if (!this._refreshT || now - this._refreshT > 160) {
        this.refresh();
        this._refreshT = now;
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

    var storeKey = 'eletroquimica-w-' + cfg.cssVar.replace(/^--/, '');
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
