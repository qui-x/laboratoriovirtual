/* ================================================================
   SIRAD — scrpitradioatividade.js | mecânica e casco do simulador
   de Radioatividade
   ================================================================
   Mesmo casco da família do 2º ano (receptor de acessibilidade,
   kit de desenho, App, gaveta mobile e alças de redimensionar).
   A classe Mech implementa: emissões α/β/γ com barreiras e campo
   elétrico, meia-vida com amostra de 100 núcleos e fissão em
   cadeia com barras de controle. Requer dadosradioatividade.js.
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
// MECÂNICA — SIRAD · Radioatividade
// Emissões: trajetórias de α, β e γ contra barreiras (papel, alumínio,
// chumbo) ou entre placas eletrizadas. Meia-vida: N = N₀·(1/2)^(t/t½)
// numa grade de 100 átomos com ordem de decaimento pré-sorteada.
// Cadeia: nêutrons móveis fissionam U-235 e liberam 3 nêutrons,
// filtrados pelas barras de controle (k = 3·(1 − controle)).
// ══════════════════════════════════════════════════════════════════
class Mech {
  constructor(D) {
    this.D = D;
    this.mode = 'emissoes';
    this.em = { cenario: 'barreiras', fase: 1.2, pulso: 0 };
    this.mv = { iso: D.ISOTOPOS[0], m0: 100, t: 0, ordem: this._shuffle100() };
    this.cd = { nucleos: [], neutrons: [], ctrl: 50, fissoes: 0, emitidos: 0, flashes: [], iniciado: false };
    // ── modo 4: equacoes nucleares (Soddy) ──
    // Z e A comecam DESLOCADOS do valor certo de proposito: o exercicio e
    // chegar la, nao conferir uma resposta ja posta.
    this.sod = { idx: 0, z: 88, a: 230 };
    // ── modo 5: datacao radioativa ──
    this.dat = { metodo: D.METODOS_DATACAO[0], frac: 50 };
    // ── modo 6: serie radioativa do U-238 ──
    this.ser = { passo: 0, auto: false, tAuto: 0 };
    this._cdInit();
  }

  _shuffle100() {
    const a = Array.from({ length: 100 }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  _cdInit() {
    const C = this.cd;
    C.nucleos = [];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) {
      C.nucleos.push({ gx: c, gy: r, vivo: true });
    }
    C.neutrons = []; C.fissoes = 0; C.emitidos = 0; C.flashes = []; C.iniciado = false;
  }

  build() {
    fillOptGrid('meia-grid', this.D.ISOTOPOS.map(i => ({
      value: i.id, nome: `${i.nome} ${i.simb}`, dot: i.cor, extra: `t½ ${i.meia}`,
      aria: `${i.nome}, meia-vida de ${i.meia}. Uso: ${i.uso}`,
    })), this.mv.iso.id);
    // ── modo 4: lista de decaimentos a completar ──
    fillOptGrid('soddy-grid', this.D.DESAFIOS_SODDY.map((d, i) => {
      const p = this.D.PARTICULAS.find(q => q.id === d.part);
      return {
        value: String(i), nome: `${d.pai.s}-${d.pai.A}`, dot: p.cor, extra: p.rot.split(' ')[0],
        aria: `${d.pai.s} ${d.pai.A} emitindo ${p.rot}. ${d.ctx}`,
      };
    }), '0');
    // ── modo 5: metodos de datacao ──
    fillOptGrid('dat-grid', this.D.METODOS_DATACAO.map(m => ({
      value: m.id, nome: m.nome, dot: m.cor, extra: this._fmtAnos(m.t12a),
      aria: `${m.nome}, par ${m.par}, meia-vida de ${this._fmtAnos(m.t12a)}. Serve para datar ${m.alvo}.`,
    })), this.dat.metodo.id);
    this._sodSyncSliders();
    this._serNota();
  }

  /** Ajusta a faixa dos sliders de Z e A à ordem de grandeza do desafio atual.
   *  Sem isto, procurar Z = 7 (carbono-14 → nitrogênio) num slider que vai até
   *  95 seria um exercício de paciência, não de química. */
  _sodSyncSliders() {
    const d = this._sodDesafio();
    const zEl = document.getElementById('sod-z');
    const aEl = document.getElementById('sod-a');
    if (zEl) {
      zEl.min = Math.max(1, d.pai.Z - 6); zEl.max = d.pai.Z + 4;
      zEl.value = this.sod.z;
    }
    if (aEl) {
      aEl.min = Math.max(1, d.pai.A - 10); aEl.max = d.pai.A + 4;
      aEl.value = this.sod.a;
    }
    if (this.app) {
      this.app.syncSlider('sod-z', this.sod.z);
      this.app.syncSlider('sod-a', this.sod.a);
    }
  }

  /** Escreve a nota da etapa atual da série no painel lateral. */
  _serNota() {
    const el = document.getElementById('ser-nota');
    if (!el) return;
    const r = this._serCalc();
    el.textContent = r.atual.nota || `${r.atual.s}-${r.atual.A} · meia-vida de ${r.atual.meia}` +
      (r.part ? `, emite ${r.part.rot}.` : '.');
  }

  setMode(id) { this.mode = id; }

  setParam(k, v) {
    const E = this.em, M = this.mv, C = this.cd;
    switch (k) {
      case 'cenario': {
        E.cenario = v; E.fase = 0;
        return { say: v === 'barreiras'
          ? 'Cenário: barreiras de papel, alumínio e chumbo.'
          : 'Cenário: campo elétrico entre placas positiva e negativa.' };
      }
      case 'isotopo': {
        M.iso = this.D.ISOTOPOS.find(i => i.id === v) || M.iso;
        return { say: `${M.iso.nome} selecionado. Meia-vida: ${M.iso.meia}. ${M.iso.uso}.` };  // t½ numérica em iso.t12s alimenta λ e a atividade
      }
      case 'mvM0': M.m0 = v; return;
      case 'mvT': M.t = v; return;
      case 'cadCtrl': C.ctrl = v; return;

      /* ── modo 4: equacoes nucleares ── */
      case 'sodDesafio': {
        const i = clamp(parseInt(v, 10) || 0, 0, this.D.DESAFIOS_SODDY.length - 1);
        this.sod.idx = i;
        const d = this._sodDesafio(), p = this._sodParticula();
        // recoloca o palpite longe da resposta, para o exercicio continuar sendo exercicio
        this.sod.z = clamp(d.filho.Z + (p.dz >= 0 ? 3 : -3), 1, 95);
        this.sod.a = clamp(d.filho.A + 4, 1, 245);
        this._sodSyncSliders();
        return { say: `${d.pai.s} ${d.pai.A} emitindo ${p.rot}. ${d.ctx} Ajuste Z e A do produto até as duas somas fecharem.` };
      }
      case 'sodZ': this.sod.z = Math.round(v); return;
      case 'sodA': this.sod.a = Math.round(v); return;

      /* ── modo 5: datacao ── */
      case 'datMetodo': {
        this.dat.metodo = this.D.METODOS_DATACAO.find(m => m.id === v) || this.dat.metodo;
        const m = this.dat.metodo;
        return { say: `${m.nome}, par ${m.par}. Meia-vida de ${this._fmtAnos(m.t12a)}. Serve para datar ${m.alvo}. ${m.nota}` };
      }
      case 'datFrac': this.dat.frac = v; return;

      /* ── modo 6: serie radioativa ── */
      case 'serPasso': {
        this.ser.passo = Math.round(v); this.ser.auto = false;
        this._serNota();
        const r = this._serCalc();
        return { say: `Etapa ${r.i}: ${r.atual.s} ${r.atual.A}, meia-vida de ${r.atual.meia}.` +
          (r.part ? ` Emite ${r.part.rot}.` : ' Núcleo estável — fim da série.') };
      }
    }
  }

  action(name, el) {
    const E = this.em, M = this.mv, C = this.cd;
    if (name === 'emitir') {
      E.fase = 0; E.pulso++;
      if (isReduced()) E.fase = 1.2;
      playTone(700, .08, .06);
      announce(E.cenario === 'barreiras'
        ? 'Pulso emitido: alfa para no papel, beta no alumínio e gama atravessa até o chumbo.'
        : 'Pulso emitido: alfa desvia para a placa negativa, beta para a positiva e gama segue reto.');
    } else if (name === 'mv-sortear') {
      M.ordem = this._shuffle100();
      playTone(660, .08, .05);
      const r = this._mvCalc();
      announce(`Novo sorteio da amostra. Restam ${fmt(r.frac * 100, 1)} por cento dos núcleos após ${fmt(M.t, 1)} meias-vidas, ou seja, ${r.tRealTxt}. Atividade de ${r.atvBq.toExponential(2)} becquerels.`);
    } else if (name === 'mv-reset') {
      M.t = 0; M.m0 = 100;
      this.app.syncSlider('mv-t', 0); this.app.syncSlider('mv-m0', 100);
      playTone(440, .07, .05); announce('Amostra restaurada: 100 gramas, tempo zero.');
    } else if (name === 'disparar') {
      C.iniciado = true;
      C.neutrons.push({ x: 0, y: .5 + (Math.random() - .5) * .3, vx: .34, vy: (Math.random() - .5) * .12 });
      playTone(700, .08, .06);
      announce('Nêutron disparado contra o combustível de urânio-235.');
    } else if (name === 'cad-reset') {
      this._cdInit();
      playTone(440, .07, .05); announce('Combustível novo: todos os núcleos de urânio restaurados.');

    /* ══════════ modo 4 — equacoes nucleares ══════════ */
    } else if (name === 'sod-conferir') {
      const c = this._sodCalc();
      if (c.ok) {
        playTone(660, .09, .07); setTimeout(() => playTone(880, .12, .07), 110);
        return announce(`Correto! ${c.d.pai.s} ${c.d.pai.A} emitindo ${c.p.rot} produz ${c.d.filho.s} ${c.d.filho.A}. As duas somas fecham: massa ${c.d.pai.A} igual a ${c.somaA}, e número atômico ${c.d.pai.Z} igual a ${c.somaZ}. ${c.d.ctx}`, 'assertive');
      }
      playTone(300, .12, .06);
      // Diz QUAL conservacao falhou — e a informacao que permite corrigir.
      const partes = [];
      if (!c.okA) partes.push(`a soma das MASSAS não fecha: à esquerda ${c.d.pai.A}, à direita ${c.somaA}`);
      if (!c.okZ) partes.push(`a soma dos números ATÔMICOS não fecha: à esquerda ${c.d.pai.Z}, à direita ${c.somaZ}`);
      return announce(`Ainda não. ${partes.join('; e ')}. Lembre: a emissão ${c.p.rot} leva embora ${c.p.da} de massa e ${c.p.dz} de carga, então ${c.p.efeito}.`, 'assertive');

    } else if (name === 'sod-resolver') {
      const c = this._sodCalc();
      this.sod.z = c.zCerto; this.sod.a = c.aCerto;
      this._sodSyncSliders();
      playTone(520, .1, .06);
      return announce(`Solução: o produto é ${c.d.filho.s} ${c.d.filho.A}, com Z igual a ${c.d.filho.Z}. Veio de ${c.p.efeito}. ${c.d.ctx}`, 'assertive');

    } else if (name === 'sod-proximo') {
      const n = (this.sod.idx + 1) % this.D.DESAFIOS_SODDY.length;
      const r = this.setParam('sodDesafio', String(n));
      playTone(700, .07, .05);
      return announce(r && r.say ? r.say : 'Próximo decaimento.');

    /* ══════════ modo 5 — datacao ══════════ */
    } else if (name === 'dat-status') {
      const r = this._datCalc();
      const aviso = r.dentro ? `Está dentro da faixa confiável do método. ${r.m.nota}`
        : r.tarde ? 'ATENÇÃO: essa idade está ACIMA da faixa confiável — praticamente não resta isótopo para medir. Use um método de meia-vida mais longa.'
          : 'ATENÇÃO: essa idade está ABAIXO da faixa confiável — sobrou isótopo demais, e a diferença seria menor que o erro do equipamento.';
      playTone(700, .08, .06);
      return announce(`${r.m.nome}. Restam ${fmt(r.frac * 100, 1)} por cento do isótopo, o que corresponde a ${fmt(r.nMeias, 3)} meias-vidas. Idade estimada: ${r.txt}. ${aviso}`, 'assertive');

    } else if (name === 'dat-set') {
      const v = el && parseFloat(el.dataset.frac);
      if (!isFinite(v)) return;
      this.dat.frac = v;
      this.app.syncSlider('dat-frac', v);
      const r = this._datCalc();
      playTone(760, .07, .05);
      return announce(`Fração restante posta em ${fmt(v, 2)} por cento, ou seja ${fmt(r.nMeias, 0)} meias-vidas. Idade: ${r.txt}.`);

    /* ══════════ modo 6 — serie radioativa ══════════ */
    } else if (name === 'ser-avancar' || name === 'ser-voltar') {
      const d = name === 'ser-avancar' ? 1 : -1;
      const antes = this._serCalc();
      this.ser.passo = clamp(this.ser.passo + d, 0, this.D.SERIE_U238.length - 1);
      this.ser.auto = false;
      this.app.syncSlider('ser-passo', this.ser.passo);
      this._serNota();
      const r = this._serCalc();
      if (r.i === antes.i) {
        playTone(300, .1, .05);
        return announce(d > 0 ? 'A série já terminou: o chumbo-206 é estável e não decai mais.' : 'Já estamos no urânio-238, o início da série.');
      }
      playTone(d > 0 ? 620 : 480, .07, .05);
      const via = d > 0 && antes.part ? ` Foi por emissão ${antes.part.rot}: ${antes.part.efeito}.` : '';
      return announce(`Etapa ${r.i}: ${r.atual.s} ${r.atual.A}.${via} Meia-vida de ${r.atual.meia}. Já saíram ${r.na} alfa e ${r.nb} beta. ${r.atual.nota || ''}`, 'assertive');

    } else if (name === 'ser-auto') {
      this.ser.auto = !this.ser.auto;
      this.ser.tAuto = 0;
      if (this.ser.auto && this._serCalc().fim) { this.ser.passo = 0; this.app.syncSlider('ser-passo', 0); }
      playTone(this.ser.auto ? 760 : 420, .08, .05);
      return announce(this.ser.auto
        ? 'Percorrendo a série sozinho, uma etapa por segundo. Acompanhe o ziguezague no gráfico.'
        : 'Percurso automático pausado.');

    } else if (name === 'ser-reset') {
      this.ser.passo = 0; this.ser.auto = false;
      this.app.syncSlider('ser-passo', 0);
      this._serNota();
      playTone(440, .07, .05);
      return announce('De volta ao urânio-238, o início da série.');
    }
  }

  /* ── contas ── */

  /* Escreve uma quantidade de tempo em segundos na unidade que faz sentido
     para a grandeza — de segundos a bilhoes de anos. Sem isto, a datacao do
     U-238 apareceria como 1,4e17 s, que nao diz nada a ninguem. */
  _fmtTempo(seg) {
    const S = this.D.SEG;
    if (!isFinite(seg) || seg <= 0) return '0 s';
    if (seg < 60) return `${fmt(seg, 1)} s`;
    if (seg < S.h) return `${fmt(seg / 60, 1)} min`;
    if (seg < S.d) return `${fmt(seg / S.h, 2)} h`;
    if (seg < S.a) return `${fmt(seg / S.d, 1)} dias`;
    const anos = seg / S.a;
    if (anos < 1e3) return `${fmt(anos, 2)} anos`;
    if (anos < 1e6) return `${fmt(anos, 0)} anos`;
    if (anos < 1e9) return `${fmt(anos / 1e6, 2)} milhões de anos`;
    return `${fmt(anos / 1e9, 2)} bilhões de anos`;
  }

  /* CORRECAO CENTRAL DO SIRAD.
     Antes: `_mvCalc()` devolvia apenas a fracao restante, e o tempo era
     contado em multiplos de t½ — grandeza ADIMENSIONAL. Todos os isotopos
     se comportavam igual: o Tc-99m (6 h) e o U-238 (4,47 bilhoes de anos)
     produziam exatamente os mesmos numeros na tela.

     Agora o slider continua marcando o tempo em meias-vidas (que e o
     controle pedagogicamente natural, e mantem a curva sempre no mesmo
     enquadramento), mas TODAS as grandezas fisicas saem dele:
       t_real = n · t½                      (tempo de relogio)
       λ      = ln2 / t½                    (constante de desintegracao, s⁻¹)
       N      = (m / A) · N_A                (numero de nucleos)
       Atv    = λ · N                        (atividade, em Bq; /3,7e10 → Ci)
     Assim trocar de isotopo muda de fato a fisica, e nao so a cor. */
  _mvCalc() {
    const M = this.mv, iso = M.iso, D = this.D;
    const frac = Math.pow(.5, M.t);
    const resto = M.m0 * frac;

    const t12s = iso.t12s || 1;
    const lambda = Math.LN2 / t12s;             // s⁻¹
    const tReal = M.t * t12s;                   // segundos decorridos
    // numero de nucleos ainda ativos: massa restante / massa molar × N_A
    const N = iso.A ? (resto / iso.A) * D.NA : 0;
    const atvBq = lambda * N;                   // desintegracoes por segundo

    return {
      frac, resto, vivos: Math.round(100 * frac),
      lambda, tReal, N, atvBq, atvCi: atvBq / D.BQ_CI,
      tRealTxt: this._fmtTempo(tReal),
      t12Txt: this._fmtTempo(t12s),
    };
  }
  _cdK() { return this.D.FISSAO.neutronsPorFissao * (1 - this.cd.ctrl / 100); }
  _cdRegime() {
    const k = this._cdK();
    if (k < .92) return { rot: 'subcrítica', cor: '--accent-endo', det: 'a reação se apaga' };
    if (k <= 1.12) return { rot: 'crítica', cor: '--accent-ok', det: 'reator estável' };
    return { rot: 'supercrítica', cor: '--accent-exo', det: 'crescimento explosivo' };
  }

  update(dt) {
    const E = this.em, C = this.cd;
    if (E.fase < 1.2) E.fase = Math.min(1.2, E.fase + dt * .55);
    // serie radioativa em percurso automatico: uma etapa por segundo
    if (this.mode === 'serie' && this.ser.auto) {
      this.ser.tAuto += dt;
      if (this.ser.tAuto >= 1) {
        this.ser.tAuto = 0;
        const ultimo = this.D.SERIE_U238.length - 1;
        if (this.ser.passo >= ultimo) {
          this.ser.auto = false;
          announce('Série concluída: chegamos ao chumbo-206, que é estável. Foram 8 emissões alfa e 6 beta.', 'assertive');
        } else {
          this.ser.passo++;
          if (this.app) this.app.syncSlider('ser-passo', this.ser.passo);
          this._serNota();
          playTone(560 + this.ser.passo * 18, .05, .04);
        }
      }
    }
    // fissão em cadeia (coordenadas normalizadas 0..1)
    if (C.neutrons.length) {
      const vivos = C.nucleos.filter(n => n.vivo);
      for (let i = C.neutrons.length - 1; i >= 0; i--) {
        const n = C.neutrons[i];
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.y < .04 || n.y > .96) n.vy *= -1;
        if (n.x < -.05 || n.x > 1.05) { C.neutrons.splice(i, 1); continue; }
        for (const u of vivos) {
          if (!u.vivo) continue;
          const ux = .14 + u.gx * .09, uy = .12 + u.gy * .15;
          if (Math.hypot(n.x - ux, n.y - uy) < .035) {
            u.vivo = false; C.fissoes++;
            C.flashes.push({ x: ux, y: uy, ttl: .5 });
            C.neutrons.splice(i, 1);
            for (let e = 0; e < this.D.FISSAO.neutronsPorFissao; e++) {
              C.emitidos++;
              if (Math.random() * 100 >= C.ctrl && C.neutrons.length < 90) {
                const a = Math.random() * Math.PI * 2;
                C.neutrons.push({ x: ux, y: uy, vx: Math.cos(a) * .3, vy: Math.sin(a) * .3 });
              }
            }
            playTone(520 + Math.random() * 240, .05, .03);
            break;
          }
        }
      }
      if (C.iniciado && !C.neutrons.length && C.fissoes) {
        C.iniciado = false;
        announce(`Reação encerrada: ${C.fissoes} fissões. Regime ${this._cdRegime().rot}.`, 'assertive');
      }
    }
    C.flashes.forEach(f => f.ttl -= dt);
    C.flashes = C.flashes.filter(f => f.ttl > 0);
  }

  /* ── desenho ── */
  draw(ctx, W, H, app) {
    if (this.mode === 'emissoes') this._dEmis(ctx, W, H, app);
    else if (this.mode === 'meiavida') this._dMeia(ctx, W, H);
    else if (this.mode === 'soddy') this._dSoddy(ctx, W, H);
    else if (this.mode === 'datacao') this._dDatacao(ctx, W, H);
    else if (this.mode === 'serie') this._dSerie(ctx, W, H);
    else this._dCadeia(ctx, W, H);
  }

  _fonte(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = cssVar('--bg-hover'); ctx.strokeStyle = cssVar('--border-glow'); ctx.lineWidth = 2;
    kRound(ctx, x - 22, y - 30, 44, 60, 8); ctx.fill(); ctx.stroke();
    // trifólio
    ctx.fillStyle = cssVar('--accent-main');
    for (let i = 0; i < 3; i++) {
      const a0 = -Math.PI / 2 + i * 2 * Math.PI / 3 - .5, a1 = a0 + 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 13, a0, a1); ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    kLabel(ctx, 'fonte', x, y + 42, { size: 10, color: cssVar('--text-secondary') });
  }

  _dEmis(ctx, W, H, app) {
    const E = this.em, D = this.D.EMISSOES;
    const x0 = W * .13, y0 = H * .5;
    this._fonte(ctx, x0, y0);
    const prog = clamp(E.fase, 0, 1);
    if (E.cenario === 'barreiras') {
      const bx = [W * .38, W * .6, W * .82];
      const nomes = ['papel', 'alumínio', 'chumbo'];
      const esp = [3, 7, 16];
      bx.forEach((x, i) => {
        ctx.save(); ctx.fillStyle = cssVar('--glass');
        ctx.fillRect(x - esp[i] / 2, H * .16, esp[i], H * .68); ctx.restore();
        kLabel(ctx, nomes[i], x, H * .1, { size: 11, color: cssVar('--text-secondary'), bold: true });
      });
      const ys = [y0 - H * .18, y0, y0 + H * .18];
      const fim = [bx[0], bx[1], W * .94];   // onde cada emissão para
      D.forEach((e, i) => {
        const xEnd = x0 + 26 + (fim[i] - x0 - 26) * prog;
        ctx.save(); ctx.strokeStyle = e.cor; ctx.lineWidth = i === 0 ? 4 : i === 1 ? 2.4 : 2;
        if (i === 2) ctx.setLineDash([7, 5]);
        ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.moveTo(x0 + 26, ys[i]);
        if (i === 2) { // gama ondulada
          for (let x = x0 + 26; x <= xEnd; x += 6) ctx.lineTo(x, ys[i] + Math.sin(x * .12 + app.time * 6) * 4);
        } else ctx.lineTo(xEnd, ys[i]);
        ctx.stroke(); ctx.setLineDash([]);
        // partícula na frente
        ctx.fillStyle = e.cor;
        ctx.beginPath(); ctx.arc(Math.min(xEnd, fim[i]), ys[i] + (i === 2 ? Math.sin(xEnd * .12 + app.time * 6) * 4 : 0), i === 0 ? 5 : 3.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        kLabel(ctx, `${e.nome} ${e.simb}`, x0 + 52, ys[i] - 14, { size: 11, color: e.cor, bold: true, align: 'left' });
        if (prog >= (fim[i] - x0) / (W * .94 - x0) || prog >= .99) {
          if (i < 2) kChip(ctx, 'barrada', fim[i] + 4, ys[i] + 18, { fg: e.cor, size: 10 });
          else kChip(ctx, 'atenuada, atravessa', W * .86, ys[i] + 20, { fg: e.cor, size: 10 });
        }
      });
    } else {
      // campo elétrico: placa + em cima, − embaixo
      ctx.save();
      ctx.fillStyle = cssVar('--accent-exo'); ctx.fillRect(W * .32, H * .12, W * .5, 6);
      ctx.fillStyle = cssVar('--accent-endo'); ctx.fillRect(W * .32, H * .86, W * .5, 6);
      ctx.restore();
      kLabel(ctx, 'placa positiva (+)', W * .57, H * .08, { size: 11, color: cssVar('--accent-exo'), bold: true });
      kLabel(ctx, 'placa negativa (−)', W * .57, H * .93, { size: 11, color: cssVar('--accent-endo'), bold: true });
      const curvas = [
        { e: D[0], k: .22 },   // alfa: desvio pequeno p/ baixo (placa −)
        { e: D[2], k: 0 },     // gama: reto
        { e: D[1], k: -.62 },  // beta: desvio grande p/ cima (placa +)
      ];
      curvas.forEach(c => {
        ctx.save(); ctx.strokeStyle = c.e.cor; ctx.lineWidth = c.e.id === 'alfa' ? 4 : 2.4;
        if (c.e.id === 'gama') ctx.setLineDash([7, 5]);
        ctx.beginPath();
        const steps = 40;
        for (let s = 0; s <= steps * prog; s++) {
          const t = s / steps, x = x0 + 26 + t * (W * .68);
          const y = y0 + c.k * t * t * H * .5;
          s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke(); ctx.setLineDash([]);
        const t = prog, fx = x0 + 26 + t * (W * .68), fy = y0 + c.k * t * t * H * .5;
        ctx.fillStyle = c.e.cor;
        ctx.beginPath(); ctx.arc(fx, fy, c.e.id === 'alfa' ? 5 : 3.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        kLabel(ctx, c.e.nome, fx + 8, fy - 10, { size: 11, color: c.e.cor, bold: true, align: 'left' });
      });
      // ANTES: este rotulo saia pelas duas bordas em canvas de 380 px
      // (texto longo, fonte fixa, centrado em W*.55). Agora quebra em duas
      // linhas quando a tela e estreita.
      if (isEstreito(W)) {
        kLabel(ctx, 'β é ~7.000× mais leve que α:', W / 2, H * .76, { size: 10, color: cssVar('--text-secondary'), maxW: W - 24 });
        kLabel(ctx, 'mesmo com carga −1, desvia muito mais', W / 2, H * .82, { size: 10, color: cssVar('--text-secondary'), maxW: W - 24 });
      } else {
        kLabel(ctx, 'β é ~7.000× mais leve que α: mesmo com carga −1, desvia muito mais', W * .55, H * .78, { size: 10, color: cssVar('--text-secondary'), maxW: W * .86 });
      }
    }
  }

  _dMeia(ctx, W, H) {
    const M = this.mv, r = this._mvCalc();
    // grade 10×10 de átomos à esquerda
    // ANTES: `Math.min(W * .38, H * .7) / 10` — em celular cada nucleo ficava
    // com ~4 px de raio, indistinguivel. Em tela estreita a grade agora usa
    // a largura quase toda e a curva desce para baixo dela.
    const est = isEstreito(W);
    const gx0 = est ? W * .10 : W * .07;
    const gy0 = est ? H * .07 : H * .14;
    const cell = est ? Math.min(W * .80, H * .40) / 10 : Math.min(W * .40, H * .70) / 10;
    const decaidos = new Set(M.ordem.slice(0, 100 - r.vivos));
    for (let i = 0; i < 100; i++) {
      const x = gx0 + (i % 10) * cell + cell / 2, y = gy0 + Math.floor(i / 10) * cell + cell / 2;
      const morto = decaidos.has(i);
      ctx.save();
      ctx.fillStyle = morto ? cssVar('--text-muted') : M.iso.cor;
      ctx.globalAlpha = morto ? .38 : .95;
      ctx.beginPath(); ctx.arc(x, y, cell * .3, 0, Math.PI * 2); ctx.fill();
      if (morto) {
        ctx.strokeStyle = cssVar('--text-muted'); ctx.lineWidth = 1.4; ctx.globalAlpha = .8;
        ctx.beginPath(); ctx.moveTo(x - cell * .18, y - cell * .18); ctx.lineTo(x + cell * .18, y + cell * .18);
        ctx.moveTo(x + cell * .18, y - cell * .18); ctx.lineTo(x - cell * .18, y + cell * .18); ctx.stroke();
      }
      ctx.restore();
    }
    kLabel(ctx, `${r.vivos} de 100 núcleos ativos`, gx0 + cell * 5, gy0 + cell * 10 + 16, { size: 11, color: M.iso.cor, bold: true });
    // curva exponencial à direita
    const m = kAxes(ctx, {
      x: est ? W * .16 : W * .56,
      y: est ? gy0 + cell * 10 + 42 : H * .12,
      w: est ? W * .76 : W * .38,
      h: est ? Math.max(90, H * .88 - (gy0 + cell * 10 + 42)) : H * .62,
      xmin: 0, xmax: 6, ymin: 0, ymax: 100,
      xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 25, 50, 75, 100],
      xlab: 'tempo (meias-vidas)', ylab: '% restante',
    });
    const pts = []; for (let t = 0; t <= 6.001; t += .1) pts.push([t, Math.pow(.5, t) * 100]);
    kLine(ctx, pts, m.px, m.py, { color: M.iso.cor, w: 2.6 });
    [1, 2, 3].forEach(n => kLabel(ctx, `${fmt(100 / Math.pow(2, n), 1)}%`, m.px(n) + 4, m.py(100 / Math.pow(2, n)) - 9, { size: 9, color: cssVar('--text-muted'), mono: true, align: 'left' }));
    ctx.save(); ctx.fillStyle = cssVar('--accent-amber');
    ctx.beginPath(); ctx.arc(m.px(M.t), m.py(r.frac * 100), 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    kChip(ctx, `${fmt(r.frac * 100, 1)} % · ${fmt(r.resto, 1)} g`, m.px(M.t), m.py(r.frac * 100) - 20, { fg: cssVar('--accent-amber'), bold: true, size: 11, border: cssVar('--accent-amber') });
    // ANTES: `t = 1,0 t½` — numero sem unidade, igual para todo isotopo.
    // Agora mostra o tempo de RELOGIO correspondente e a atividade medida.
    kLabel(ctx, `${M.iso.nome} · t½ = ${M.iso.meia} · decorrido: ${r.tRealTxt}`,
      W / 2, H * .93, { size: 11, color: cssVar('--text-secondary') });
    kLabel(ctx, `atividade ≈ ${r.atvBq.toExponential(2)} Bq  ·  λ = ${r.lambda.toExponential(2)} s⁻¹`,
      W / 2, H * .985, { size: 10, color: cssVar('--text-muted'), mono: true });
  }

  _dCadeia(ctx, W, H) {
    const C = this.cd, reg = this._cdRegime();
    // caixa do combustível
    ctx.save(); ctx.strokeStyle = cssVar('--glass'); ctx.lineWidth = 2.4;
    ctx.strokeRect(W * .05, H * .05, W * .9, H * .82); ctx.restore();
    // barras de controle (opacidade ∝ controle)
    ctx.save(); ctx.globalAlpha = .1 + .55 * C.ctrl / 100; ctx.fillStyle = cssVar('--text-muted');
    for (let i = 1; i <= 4; i++) ctx.fillRect(W * (.05 + i * .18) - 4, H * .05, 8, H * .82 * (C.ctrl / 100));
    ctx.restore();
    // núcleos
    C.nucleos.forEach(u => {
      const x = W * (.05 + .9 * (.14 + u.gx * .09)), y = H * (.05 + .82 * (.12 + u.gy * .15));
      ctx.save();
      if (u.vivo) {
        ctx.fillStyle = cssVar('--accent-main'); ctx.globalAlpha = .92;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.globalAlpha = .5;
      } else {
        ctx.fillStyle = cssVar('--text-muted'); ctx.globalAlpha = .5;
        ctx.beginPath(); ctx.arc(x - 5, y + 3, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 5, y - 3, 4.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
    // flashes de fissão
    C.flashes.forEach(f => {
      ctx.save(); ctx.strokeStyle = cssVar('--accent-amber'); ctx.globalAlpha = f.ttl * 1.6; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W * (.05 + .9 * f.x), H * (.05 + .82 * f.y), (1 - f.ttl) * 26 + 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
    // nêutrons
    ctx.save(); ctx.fillStyle = '#ffffff';
    C.neutrons.forEach(n => { ctx.beginPath(); ctx.arc(W * (.05 + .9 * n.x), H * (.05 + .82 * n.y), 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    kChip(ctx, `k ≈ ${fmt(this._cdK(), 1)} · reação ${reg.rot}`, W / 2, H * .93, { fg: cssVar(reg.cor), bold: true, size: 12, border: cssVar(reg.cor) });
  }


  /* ══════════════════════════════════════════════════════════════════
     MODO 4 — EQUAÇÕES NUCLEARES (Leis de Soddy)
     ══════════════════════════════════════════════════════════════════
     As duas leis existiam no simulador apenas como frase de texto no campo
     `efeito` das emissoes. Aqui elas viram exercicio: o aluno ajusta Z e A do
     produto e o simulador confere as DUAS conservacoes SEPARADAMENTE, dizendo
     qual falhou — porque "errou" nao ajuda ninguem, e "a massa fecha mas o
     numero atomico nao" ajuda muito.
  ══════════════════════════════════════════════════════════════════ */

  _sodDesafio() { return this.D.DESAFIOS_SODDY[this.sod.idx]; }
  _sodParticula() { return this.D.PARTICULAS.find(p => p.id === this._sodDesafio().part); }

  /** Confere as duas conservações e devolve o diagnóstico separado. */
  _sodCalc() {
    const d = this._sodDesafio(), p = this._sodParticula(), S = this.sod;
    // ΣA e ΣZ do lado DIREITO com o palpite atual (produto + partícula emitida)
    const somaA = S.a + p.da;
    const somaZ = S.z + p.dz;
    const okA = somaA === d.pai.A;
    const okZ = somaZ === d.pai.Z;
    return {
      d, p, okA, okZ, ok: okA && okZ,
      somaA, somaZ,
      zCerto: d.pai.Z - p.dz,
      aCerto: d.pai.A - p.da,
      // símbolo do elemento: só revelado quando Z está certo — o simbolo é
      // consequência do Z, não uma informação separada a ser decorada
      simb: S.z === d.filho.Z ? d.filho.s : '?',
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     MODO 5 — DATAÇÃO RADIOATIVA
     ══════════════════════════════════════════════════════════════════
     Só possível porque a meia-vida deixou de ser string e virou número
     (ver dadosradioatividade.js). t = t½ · log₂(N₀/N).
  ══════════════════════════════════════════════════════════════════ */

  _datCalc() {
    const S = this.dat, m = S.metodo;
    const frac = clamp(S.frac / 100, 1e-6, 0.999999);
    // t = t½ · log₂(1/frac) — a forma que o aluno usa na prova
    const nMeias = Math.log2(1 / frac);
    const idade = m.t12a * nMeias;
    const [fmin, fmax] = m.faixa;
    return {
      m, frac, nMeias, idade,
      dentro: idade >= fmin && idade <= fmax,
      cedo: idade < fmin,      // sobrou isótopo demais: a diferença é menor que o erro
      tarde: idade > fmax,     // sobrou de menos: sinal indistinguível do ruído
      txt: this._fmtAnos(idade),
      lambda: Math.LN2 / m.t12a,   // por ano, aqui — é a unidade natural da datação
    };
  }

  /** Escreve uma quantidade de anos na escala legível. Separado de _fmtTempo
   *  (que recebe segundos) porque a datação trabalha em anos do começo ao fim. */
  _fmtAnos(a) {
    if (!isFinite(a) || a <= 0) return '0 anos';
    if (a < 1e3) return `${fmt(a, 0)} anos`;
    if (a < 1e6) return `${fmt(a / 1e3, 2)} mil anos`;
    if (a < 1e9) return `${fmt(a / 1e6, 2)} milhões de anos`;
    return `${fmt(a / 1e9, 2)} bilhões de anos`;
  }

  /* ══════════════════════════════════════════════════════════════════
     MODO 6 — SÉRIE RADIOATIVA DO URÂNIO-238
     ══════════════════════════════════════════════════════════════════ */

  _serCalc() {
    const S = this.ser, L = this.D.SERIE_U238;
    const i = clamp(Math.round(S.passo), 0, L.length - 1);
    const atual = L[i];
    // balanço acumulado até aqui: quantos α e quantos β já saíram
    let na = 0, nb = 0;
    for (let k = 0; k < i; k++) {
      if (L[k].emite === 'alfa') na++;
      else if (L[k].emite === 'beta') nb++;
    }
    return {
      i, atual, L, na, nb,
      total: L.length,
      dA: L[0].A - atual.A,
      dZ: L[0].Z - atual.Z,
      fim: i === L.length - 1,
      part: atual.emite ? this.D.PARTICULAS.find(p => p.id === atual.emite) : null,
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     DESENHO DOS TRÊS MODOS NOVOS
     ══════════════════════════════════════════════════════════════════ */

  _dSoddy(ctx, W, H) {
    const c = this._sodCalc(), d = c.d, p = c.p, est = isEstreito(W);
    const cy = est ? H * .30 : H * .34;

    // ── a equação, em tamanho grande ──
    // Notação de núclideo: A em cima, Z embaixo, à esquerda do símbolo.
    const escala = clamp(W / 900, .8, 1.6);
    const fs = (est ? 22 : 30) * escala;
    const nuclideo = (x, A, Z, simb, cor, destaque) => {
      ctx.save();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = cor;
      ctx.font = `700 ${fs * .46}px Consolas, monospace`;
      ctx.fillText(String(A), x - fs * .06, cy - fs * .30);
      ctx.fillText(String(Z), x - fs * .06, cy + fs * .30);
      ctx.textAlign = 'left';
      ctx.font = `700 ${fs}px Consolas, monospace`;
      ctx.fillText(simb, x, cy);
      if (destaque) {
        const w = ctx.measureText(simb).width;
        ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.globalAlpha = .5;
        kRound(ctx, x - fs * .55, cy - fs * .62, w + fs * .68, fs * 1.24, 6);
        ctx.stroke();
      }
      ctx.restore();
      ctx.save(); ctx.font = `700 ${fs}px Consolas, monospace`;
      const larg = ctx.measureText(simb).width + fs * .55;
      ctx.restore();
      return x + larg;
    };

    const larguraTotal = est ? W * .92 : W * .7;
    let x = (W - larguraTotal) / 2 + fs * .5;
    x = nuclideo(x, d.pai.A, d.pai.Z, d.pai.s, cssVar('--text-primary', '#e6f0fa'), false);

    ctx.save();
    ctx.fillStyle = cssVar('--text-secondary'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = `${fs * .8}px Consolas, monospace`;
    ctx.fillText('→', x, cy); x += fs * .95;
    ctx.restore();

    // o produto é o que o aluno está montando
    const corProd = c.ok ? cssVar('--accent-ok', '#4ade80')
      : (c.okA || c.okZ) ? cssVar('--accent-amber', '#fbbf24')
        : cssVar('--accent-exo', '#f87171');
    x = nuclideo(x, this.sod.a, this.sod.z, c.simb, corProd, true);

    ctx.save();
    ctx.fillStyle = cssVar('--text-secondary'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = `${fs * .7}px Consolas, monospace`;
    ctx.fillText('+', x, cy); x += fs * .8;
    ctx.restore();
    nuclideo(x, p.da, -p.dz, p.id === 'alfa' ? 'α' : p.id === 'gama' ? 'γ' : 'e', p.cor, false);

    // ── as duas conservações, conferidas SEPARADAMENTE ──
    // É este detalhe que faz o modo ensinar: dizer só "errado" não corrige nada.
    let ty = cy + (est ? 62 : 84);
    const linha = (rot, esq, dir, ok) => {
      const cor = ok ? cssVar('--accent-ok', '#4ade80') : cssVar('--accent-exo', '#f87171');
      kLabel(ctx, rot, W / 2 - (est ? 100 : 150), ty,
        { size: est ? 11 : 13, align: 'left', bold: true, color: cssVar('--text-secondary') });
      kLabel(ctx, `${esq}  ${ok ? '=' : '≠'}  ${dir}   ${ok ? '✓' : '✗'}`,
        W / 2 + (est ? 100 : 150), ty,
        { size: est ? 11 : 13, align: 'right', bold: true, mono: true, color: cor });
      ty += est ? 22 : 28;
    };
    linha('Σ números de MASSA (A)', d.pai.A, c.somaA, c.okA);
    linha('Σ números ATÔMICOS (Z)', d.pai.Z, c.somaZ, c.okZ);

    // veredito e a pista útil
    ty += est ? 4 : 8;
    if (c.ok) {
      kChip(ctx, '✓ As duas conservações fecham — equação correta', W / 2, ty,
        { fg: cssVar('--accent-ok'), size: est ? 11 : 12, bold: true, border: cssVar('--accent-ok') });
    } else {
      const falta = !c.okA && !c.okZ ? 'as duas somas' : (!c.okA ? 'a soma das MASSAS' : 'a soma dos números ATÔMICOS');
      kChip(ctx, `Ainda não fecha ${falta}`, W / 2, ty,
        { fg: cssVar('--accent-amber'), size: est ? 10 : 12, bold: true, border: cssVar('--accent-amber') });
    }
    ty += est ? 26 : 32;
    kLabel(ctx, `Emissão ${p.rot} → ${p.efeito}`, W / 2, ty,
      { size: est ? 10 : 12, bold: true, color: p.cor, maxW: W - 24 });
    ty += est ? 18 : 22;
    kLabel(ctx, p.nota, W / 2, ty, { size: est ? 9 : 11, color: cssVar('--text-muted'), maxW: W - 24 });
    ty += est ? 18 : 22;
    if (ty < H - 10) kLabel(ctx, d.ctx, W / 2, ty, { size: est ? 9 : 11, color: cssVar('--text-secondary'), maxW: W - 24 });
  }

  _dDatacao(ctx, W, H) {
    const r = this._datCalc(), m = r.m, est = isEstreito(W);

    kLabel(ctx, `${m.nome}   ·   ${m.par}   ·   t½ = ${this._fmtAnos(m.t12a)}`,
      W / 2, est ? 20 : 28, { size: est ? 11 : 14, bold: true, color: m.cor, maxW: W - 16 });

    // ── curva de decaimento com o ponto da amostra ──
    const gx = est ? 46 : 78;
    const gy = est ? 44 : 58;
    const gw = Math.max(160, W - gx - (est ? 24 : 44));
    const gh = Math.max(110, (est ? H * .40 : H * .48));
    const A = kAxes(ctx, {
      x: gx, y: gy, w: gw, h: gh, xmin: 0, xmax: 8, ymin: 0, ymax: 100,
      xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], yticks: [0, 12.5, 25, 50, 100],
      fmty: v => fmt(v, 1),
      xlab: 'tempo (meias-vidas)', ylab: '% restante',
    });
    const pts = []; for (let t = 0; t <= 8.001; t += .08) pts.push([t, Math.pow(.5, t) * 100]);
    kLine(ctx, pts, A.px, A.py, { color: m.cor, w: 2.6 });

    // linhas-guia das frações notáveis: é por elas que o aluno raciocina
    [[1, 50], [2, 25], [3, 12.5]].forEach(([n, pc]) => {
      ctx.save();
      ctx.setLineDash([2, 4]); ctx.strokeStyle = cssVar('--text-muted'); ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.moveTo(A.px(0), A.py(pc)); ctx.lineTo(A.px(n), A.py(pc));
      ctx.lineTo(A.px(n), A.py(0)); ctx.stroke();
      ctx.restore();
      kLabel(ctx, `${pc} %`, A.px(0) - 6, A.py(pc), { size: 8, align: 'right', mono: true, color: cssVar('--text-muted') });
    });

    // ponto da amostra
    const cor = r.dentro ? cssVar('--accent-ok', '#4ade80') : cssVar('--accent-amber', '#fbbf24');
    if (r.nMeias <= 8) {
      ctx.save();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = cor; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(A.px(r.nMeias), A.py(0)); ctx.lineTo(A.px(r.nMeias), A.py(r.frac * 100)); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.fillStyle = cor;
      ctx.beginPath(); ctx.arc(A.px(r.nMeias), A.py(r.frac * 100), est ? 5 : 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
      kChip(ctx, `${fmt(r.frac * 100, 1)} %`, clamp(A.px(r.nMeias), gx + 40, gx + gw - 40), A.py(r.frac * 100) - 20,
        { fg: cor, size: 10, bold: true });
    }

    // ── a idade, em destaque, e a conta que a produziu ──
    let ty = gy + gh + (est ? 34 : 46);
    kChip(ctx, `idade ≈ ${r.txt}`, W / 2, ty,
      { fg: cor, size: est ? 13 : 16, bold: true, border: cor });
    ty += est ? 24 : 30;
    kLabel(ctx, `t = t½ · log₂(N₀/N) = ${fmt(m.t12a, 0)} × log₂(100/${fmt(r.frac * 100, 1)}) = ${fmt(m.t12a, 0)} × ${fmt(r.nMeias, 3)}`,
      W / 2, ty, { size: est ? 9 : 11, mono: true, color: cssVar('--text-secondary'), maxW: W - 16 });

    // ── barra da faixa confiável do método ──
    ty += est ? 22 : 28;
    if (ty + 40 < H) {
      const bx = est ? 30 : W * .12, bw = W - 2 * bx;
      // escala log de 100 anos a 50 bilhões de anos
      const lmin = 2, lmax = Math.log10(5e10);
      const px = a => bx + clamp((Math.log10(Math.max(1, a)) - lmin) / (lmax - lmin), 0, 1) * bw;
      ctx.save();
      ctx.fillStyle = cssVar('--bg-hover'); kRound(ctx, bx, ty, bw, 14, 4); ctx.fill();
      ctx.fillStyle = cssVar('--accent-ok', '#4ade80'); ctx.globalAlpha = .42;
      kRound(ctx, px(m.faixa[0]), ty, Math.max(3, px(m.faixa[1]) - px(m.faixa[0])), 14, 4); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = r.dentro ? '#fff' : cssVar('--accent-exo', '#f87171'); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(px(r.idade), ty - 5); ctx.lineTo(px(r.idade), ty + 19); ctx.stroke();
      ctx.restore();
      kLabel(ctx, 'faixa confiável do método', bx + bw / 2, ty - 10,
        { size: 9, color: cssVar('--accent-ok'), maxW: bw });
      ty += 30;
      const aviso = r.dentro ? m.nota
        : r.tarde ? `Fora da faixa: com essa idade praticamente não resta ${m.nome.split('-')[0]}-${m.nome.split('-')[1]} para medir. Use um método de meia-vida mais longa.`
          : 'Fora da faixa: sobrou isótopo demais, e a diferença medida seria menor que o erro do equipamento.';
      if (ty < H - 8) kLabel(ctx, aviso, W / 2, ty,
        { size: est ? 9 : 10, color: r.dentro ? cssVar('--text-muted') : cssVar('--accent-amber'), maxW: W - 20 });
    }
  }

  _dSerie(ctx, W, H) {
    const r = this._serCalc(), est = isEstreito(W);
    const L = r.L;

    kLabel(ctx, '²³⁸U  →  (8 α + 6 β⁻)  →  ²⁰⁶Pb', W / 2, est ? 18 : 26,
      { size: est ? 12 : 16, bold: true, color: cssVar('--text-primary') });

    // ── gráfico N × Z: onde o ziguezague aparece ──
    // Este é o motivo de o módulo existir: em N×Z, cada α é um passo diagonal
    // longo para baixo/esquerda e cada β⁻ um passo curto para cima/direita.
    const gx = est ? 44 : 76;
    const gy = est ? 40 : 54;
    const gw = Math.max(150, (est ? W - gx - 24 : W * .52));
    const gh = Math.max(120, (est ? H * .44 : H * .68));
    const Zs = L.map(x => x.Z), Ns = L.map(x => x.A - x.Z);
    const zmin = Math.min(...Zs) - 1, zmax = Math.max(...Zs) + 1;
    const nmin = Math.min(...Ns) - 2, nmax = Math.max(...Ns) + 2;
    const A2 = kAxes(ctx, {
      x: gx, y: gy, w: gw, h: gh, xmin: zmin, xmax: zmax, ymin: nmin, ymax: nmax,
      xticks: [82, 84, 86, 88, 90, 92], yticks: [124, 130, 136, 142, 146],
      fmtx: v => fmt(v, 0), fmty: v => fmt(v, 0),
      xlab: 'prótons (Z)', ylab: 'nêutrons (N)',
    });

    // trilha completa, apagada; o percorrido, aceso
    const ponto = i => [A2.px(L[i].Z), A2.py(L[i].A - L[i].Z)];
    ctx.save();
    ctx.strokeStyle = cssVar('--text-muted'); ctx.globalAlpha = .3; ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    L.forEach((_, i) => { const [x, y] = ponto(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke(); ctx.restore();

    for (let i = 0; i < r.i; i++) {
      const p = this.D.PARTICULAS.find(q => q.id === L[i].emite);
      const [x0, y0] = ponto(i), [x1, y1] = ponto(i + 1);
      kArrow(ctx, x0, y0, x1, y1, { color: p ? p.cor : cssVar('--text-muted'), w: 2.4, head: 7 });
    }
    L.forEach((n, i) => {
      const [x, y] = ponto(i);
      const passado = i <= r.i;
      ctx.save();
      ctx.globalAlpha = passado ? 1 : .34;
      ctx.fillStyle = i === L.length - 1 ? cssVar('--accent-ok', '#4ade80')
        : (i === r.i ? cssVar('--accent-amber', '#fbbf24') : cssVar('--text-secondary'));
      ctx.beginPath(); ctx.arc(x, y, i === r.i ? (est ? 6 : 7.5) : (est ? 3.4 : 4.2), 0, Math.PI * 2); ctx.fill();
      if (i === r.i) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.stroke(); }
      ctx.restore();
    });
    // rótulo do núcleo atual junto ao ponto
    const [cxp, cyp] = ponto(r.i);
    kChip(ctx, `${r.atual.s}-${r.atual.A}`, clamp(cxp, gx + 30, gx + gw - 30), cyp - 18,
      { fg: cssVar('--accent-amber'), size: est ? 9 : 11, bold: true });

    // legenda dos passos
    const la = this.D.PARTICULAS.find(p => p.id === 'alfa');
    const lb = this.D.PARTICULAS.find(p => p.id === 'beta');
    kLabel(ctx, '↙ α: −2 p, −2 n', gx + 6, gy + 12, { size: 9, align: 'left', color: la.cor });
    kLabel(ctx, '↗ β⁻: n vira p', gx + 6, gy + 26, { size: 9, align: 'left', color: lb.cor });

    // ── ficha da etapa atual ──
    const tx = est ? 28 : gx + gw + W * .04;
    const tw = est ? W - 56 : Math.max(120, W - tx - 24);
    let ty = est ? gy + gh + 40 : gy + 16;

    kLabel(ctx, `Etapa ${r.i} de ${r.total - 1}`, tx, ty,
      { size: 10, align: 'left', bold: true, color: cssVar('--text-muted'), maxW: tw });
    ty += 20;
    kLabel(ctx, `${r.atual.s}-${r.atual.A}`, tx, ty,
      { size: est ? 16 : 20, align: 'left', bold: true, color: r.fim ? cssVar('--accent-ok') : cssVar('--text-primary'), maxW: tw });
    ty += est ? 22 : 26;

    const linhas = [
      ['Z (prótons)', String(r.atual.Z)],
      ['N (nêutrons)', String(r.atual.A - r.atual.Z)],
      ['Meia-vida', r.atual.meia],
      ['Emite', r.part ? r.part.rot : '— estável —'],
      ['Já saíram', `${r.na} α  +  ${r.nb} β⁻`],
      ['A perdido', `${r.dA}  (= 4 × ${r.na})`],
      ['Z perdido', `${r.dZ}  (= 2×${r.na} − ${r.nb})`],
    ];
    const dy = Math.max(14, Math.min(21, (H - ty - 40) / linhas.length));
    linhas.forEach(l => {
      if (ty > H - 30) return;
      kLabel(ctx, l[0], tx, ty, { size: 10, align: 'left', color: cssVar('--text-secondary'), maxW: tw * .52 });
      kLabel(ctx, l[1], tx + tw, ty, { size: 10, align: 'right', mono: true, bold: true, color: cssVar('--text-primary'), maxW: tw * .46 });
      ty += dy;
    });
    if (r.atual.nota && ty < H - 14) {
      ty += 4;
      kLabel(ctx, r.atual.nota, tx, ty,
        { size: 9, align: 'left', color: r.fim ? cssVar('--accent-ok') : cssVar('--accent-amber'), maxW: tw });
    }
  }

  getResults() {
    if (this.mode === 'emissoes') {
      const rows = [];
      this.D.EMISSOES.forEach(e => {
        rows.push({ l: `${e.nome} — natureza`, v: e.natureza });
        rows.push({ l: `${e.nome} — barrada por`, v: e.barrada, cls: e.id === 'gama' ? 'val-exo' : '' });
      });
      return rows;
    }
    if (this.mode === 'meiavida') {
      const M = this.mv, r = this._mvCalc();
      return [
        { l: 'Isótopo', v: `${M.iso.nome} ${M.iso.simb}` },
        { l: 'Meia-vida t½', v: M.iso.meia },
        { l: 'Constante λ = ln2/t½', v: `${r.lambda.toExponential(3)} s⁻¹` },
        { l: 'Tempo decorrido', v: `${fmt(M.t, 1)} t½  =  ${r.tRealTxt}`, cls: 'val-ok' },
        { l: 'Fração restante', v: `${fmt(r.frac * 100, 1)} %`, cls: 'val-ok' },
        { l: 'Massa inicial', v: `${fmt(M.m0, 0)} g` },
        { l: 'Massa restante', v: `${fmt(r.resto, 1)} g`, cls: 'val-ok' },
        { l: 'Já decaiu', v: `${fmt(M.m0 - r.resto, 1)} g`, cls: 'val-exo' },
        { l: 'Núcleos ativos N', v: `${r.N.toExponential(3)}` },
        { l: 'Atividade A = λ·N', v: `${r.atvBq.toExponential(3)} Bq`, cls: 'val-exo' },
        { l: 'Atividade em curie', v: `${r.atvCi.toExponential(3)} Ci` },
        { l: 'Aplicação', v: M.iso.uso },
      ];
    }
    if (this.mode === 'soddy') {
      const c = this._sodCalc(), d = c.d, p = c.p;
      return [
        { l: 'Decaimento', v: `${d.pai.s}-${d.pai.A}  →  ?  +  ${p.rot}` },
        { l: 'Partícula emitida', v: p.rot },
        { l: 'O que ela leva', v: `${p.da} de massa · ${p.dz > 0 ? '+' : ''}${p.dz} de carga nuclear` },
        { l: 'Efeito no núcleo', v: p.efeito, cls: 'val-ok' },
        { l: '— Lado esquerdo —', v: '' },
        { l: 'A do núcleo-pai', v: String(d.pai.A) },
        { l: 'Z do núcleo-pai', v: String(d.pai.Z) },
        { l: '— Seu palpite —', v: '' },
        { l: 'A do produto', v: String(this.sod.a) },
        { l: 'Z do produto', v: String(this.sod.z) },
        { l: 'Elemento', v: c.simb === '?' ? 'ajuste o Z para descobrir' : c.simb, cls: c.simb === '?' ? '' : 'val-ok' },
        { l: '— Conservação —', v: '' },
        { l: 'ΣA à direita', v: `${this.sod.a} + ${p.da} = ${c.somaA}`, cls: c.okA ? 'val-ok' : 'val-exo' },
        { l: 'Massa fecha?', v: c.okA ? `sim (= ${d.pai.A})` : `NÃO (deveria dar ${d.pai.A})`, cls: c.okA ? 'val-ok' : 'val-exo' },
        { l: 'ΣZ à direita', v: `${this.sod.z} + (${p.dz}) = ${c.somaZ}`, cls: c.okZ ? 'val-ok' : 'val-exo' },
        { l: 'Nº atômico fecha?', v: c.okZ ? `sim (= ${d.pai.Z})` : `NÃO (deveria dar ${d.pai.Z})`, cls: c.okZ ? 'val-ok' : 'val-exo' },
        { l: 'Situação', v: c.ok ? 'EQUAÇÃO CORRETA ✓' : 'ainda montando…', cls: c.ok ? 'val-ok' : '' },
        { l: 'Contexto', v: d.ctx },
      ];
    }
    if (this.mode === 'datacao') {
      const r = this._datCalc(), m = r.m;
      return [
        { l: 'Método', v: m.nome },
        { l: 'Par usado', v: m.par },
        { l: 'Meia-vida', v: this._fmtAnos(m.t12a) },
        { l: 'Constante λ = ln2/t½', v: `${r.lambda.toExponential(3)} ano⁻¹` },
        { l: 'Isótopo restante N/N₀', v: `${fmt(r.frac * 100, 2)} %` },
        { l: 'Já decaiu', v: `${fmt((1 - r.frac) * 100, 2)} %`, cls: 'val-exo' },
        { l: 'Nº de meias-vidas', v: fmt(r.nMeias, 4), cls: 'val-endo' },
        { l: 'Conta', v: `t = ${fmt(m.t12a, 0)} × log₂(1/${fmt(r.frac, 4)})` },
        { l: 'IDADE ESTIMADA', v: r.txt, cls: 'val-ok' },
        { l: 'Idade em anos', v: `${r.idade.toExponential(4)} anos` },
        { l: 'Faixa útil do método', v: `${this._fmtAnos(m.faixa[0])} a ${this._fmtAnos(m.faixa[1])}` },
        { l: 'Dentro da faixa?', v: r.dentro ? 'sim — resultado confiável' : (r.tarde ? 'NÃO — velho demais para este método' : 'NÃO — jovem demais para este método'), cls: r.dentro ? 'val-ok' : 'val-exo' },
        { l: 'Serve para datar', v: m.alvo },
        { l: 'Observação', v: m.nota },
      ];
    }
    if (this.mode === 'serie') {
      const r = this._serCalc(), L = r.L, prim = L[0], ult = L[L.length - 1];
      return [
        { l: 'Série', v: `${prim.s}-${prim.A}  →  ${ult.s}-${ult.A}` },
        { l: 'Etapa atual', v: `${r.i} de ${r.total - 1}` },
        { l: 'Núcleo', v: `${r.atual.s}-${r.atual.A}`, cls: r.fim ? 'val-ok' : 'val-endo' },
        { l: 'Z (prótons)', v: String(r.atual.Z) },
        { l: 'N (nêutrons)', v: String(r.atual.A - r.atual.Z) },
        { l: 'Meia-vida', v: r.atual.meia },
        { l: 'Emite', v: r.part ? `${r.part.rot} → ${r.part.efeito}` : '— estável, fim da série —', cls: r.part ? '' : 'val-ok' },
        { l: '— Acumulado —', v: '' },
        { l: 'Emissões α até aqui', v: String(r.na) },
        { l: 'Emissões β⁻ até aqui', v: String(r.nb) },
        { l: 'Massa perdida', v: `${r.dA}  =  4 × ${r.na}` },
        { l: 'Z perdido', v: `${r.dZ}  =  2×${r.na} − ${r.nb}` },
        { l: '— Balanço final —', v: '' },
        { l: 'Total da série', v: '8 α  +  6 β⁻' },
        { l: 'Por que 8 α?', v: 'ΔA = 238 − 206 = 32, e 32 ÷ 4 = 8' },
        { l: 'Por que 6 β⁻?', v: '8 α tirariam 16 de Z, mas Z caiu só 10 (92→82); os 6 β⁻ devolveram a diferença' },
        { l: 'Quem dita o ritmo', v: 'a etapa mais LENTA: o próprio ²³⁸U, 4,47 bilhões de anos' },
        { l: 'Nota da etapa', v: r.atual.nota || '—' },
      ];
    }
    const C = this.cd, reg = this._cdRegime();
    return [
      { l: 'Combustível', v: this.D.FISSAO.alvo },
      { l: 'Barras de controle', v: `${fmt(C.ctrl, 0)} % de absorção` },
      { l: 'k (nêutrons úteis/fissão)', v: fmt(this._cdK(), 1), cls: 'val-ok' },
      { l: 'Regime', v: `${reg.rot} — ${reg.det}`, cls: reg.rot === 'supercrítica' ? 'val-exo' : reg.rot === 'crítica' ? 'val-ok' : 'val-endo' },
      { l: 'Fissões ocorridas', v: String(C.fissoes) },
      { l: 'Nêutrons em voo', v: String(C.neutrons.length) },
      { l: 'Núcleos restantes', v: `${C.nucleos.filter(n => n.vivo).length} de 54` },
    ];
  }

  getOverlay() {
    if (this.mode === 'emissoes') return this.em.cenario === 'barreiras' ? 'α β γ · barreiras' : 'α β γ · campo elétrico';
    if (this.mode === 'meiavida') { const r = this._mvCalc(); return `${this.mv.iso.simb} · ${fmt(r.frac * 100, 0)} % · ${r.tRealTxt}`; }
    if (this.mode === 'soddy') {
      const c = this._sodCalc();
      return `${c.d.pai.s}-${c.d.pai.A} + ${c.p.rot.split(' ')[0]} · ${c.ok ? 'correto ✓' : 'montando'}`;
    }
    if (this.mode === 'datacao') { const r = this._datCalc(); return `${r.m.nome} · ${r.txt}`; }
    if (this.mode === 'serie') {
      const r = this._serCalc();
      return `${r.atual.s}-${r.atual.A} · etapa ${r.i}/${r.total - 1}`;
    }
    return `fissão · ${this._cdRegime().rot}`;
  }

  onArrow(dx, dy) {
    if (this.mode === 'meiavida') {
      if (!dx) return false;
      this.mv.t = clamp(this.mv.t + dx * .1, 0, 6);
      this.app.syncSlider('mv-t', this.mv.t);
      return true;
    }
    // Soddy: horizontal ajusta Z, vertical ajusta A — mesma disposicao da
    // notacao de nuclideo, em que Z fica embaixo e A em cima.
    if (this.mode === 'soddy') {
      if (dx) { this.sod.z = clamp(this.sod.z + dx, 1, 95); }
      if (dy) { this.sod.a = clamp(this.sod.a - dy, 1, 245); }
      this._sodSyncSliders();
      return !!(dx || dy);
    }
    if (this.mode === 'datacao') {
      if (!dx) return false;
      this.dat.frac = clamp(this.dat.frac + dx * 2, 0.2, 99);
      this.app.syncSlider('dat-frac', this.dat.frac);
      return true;
    }
    if (this.mode === 'serie') {
      if (!dx) return false;
      this.ser.passo = clamp(this.ser.passo + dx, 0, this.D.SERIE_U238.length - 1);
      this.ser.auto = false;
      this.app.syncSlider('ser-passo', this.ser.passo);
      this._serNota();
      return true;
    }
    return false;
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

    var storeKey = 'radioatividade-w-' + cfg.cssVar.replace(/^--/, '');
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
