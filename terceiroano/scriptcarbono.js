/* ================================================================
   SICAR — scriptcarbono.js | mecânicas do simulador
   ================================================================
   Somente lógica: acessibilidade, utilitários de desenho, a classe
   Mech (química do módulo) e o casco App, comum a toda a família de
   simuladores. Os dados fixos ficam em dadoscarbono.js e as cores em
   stylecarbono.css.

   ORDEM DO ARQUIVO
   1. Receptor de acessibilidade (lê ?theme=...&contrast=... da URL)
   2. Utilitários (announce, playTone, fmt, cssVar...)
   3. Kit de desenho no canvas (funções k*)
   4. class Mech  → a parte que muda de módulo para módulo
   5. class App   → o casco: acordeões, teclado, gaveta mobile
   6. Gaveta mobile + sidebars redimensionáveis
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
const lerp  = (a, b, t) => a + (b - a) * t;
const isReduced = () => document.body.classList.contains('reduce-motion');

/** Lê uma variável de cor do CSS (fonte única de cores do simulador). */
function cssVar(name, fallback = '#94a3b8') {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

/** Contraste preto/branco por luminância YIQ. */
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
// simuladores. Todas as cores vêm de cssVar() → variáveis do CSS.
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

/** Texto simples com alinhamento e tamanho controlados. */
function kLabel(ctx, text, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.bold ? '700 ' : ''}${o.size || 12}px ${o.mono ? "'Consolas','Monaco',monospace" : "'Segoe UI',system-ui,sans-serif"}`;
  ctx.fillStyle = o.color || cssVar('--text-secondary', '#7a9ab8');
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'alphabetic';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Etiqueta arredondada (pílula) centrada em (x,y). */
function kChip(ctx, text, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.bold ? '700 ' : ''}${o.size || 11}px 'Segoe UI',system-ui,sans-serif`;
  const w = ctx.measureText(text).width + 14, h = (o.size || 11) + 10;
  ctx.fillStyle = o.bg || cssVar('--bg-panel2', '#101c2b');
  kRound(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = o.border || cssVar('--border', '#1c2e44');
  ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  kLabel(ctx, text, x, y + .5, {
    size: o.size || 11, color: o.fg || cssVar('--text-primary', '#ddeaf8'),
    bold: o.bold, align: 'center', baseline: 'middle',
  });
}

/** Seta reta com ponta — usada em equações e fluxos. */
function kArrow(ctx, x1, y1, x2, y2, o = {}) {
  const head = o.head || 7, ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = o.color || cssVar('--text-secondary', '#7a9ab8');
  ctx.lineWidth = o.width || 1.6;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - .4), y2 - head * Math.sin(ang - .4));
  ctx.lineTo(x2 - head * Math.cos(ang + .4), y2 - head * Math.sin(ang + .4));
  ctx.closePath();
  ctx.fillStyle = o.color || cssVar('--text-secondary', '#7a9ab8');
  ctx.fill();
  ctx.restore();
}

/** Eixos com grade e rótulos. Devolve px(v) e py(v) para converter
 *  valores em pixels — todo gráfico do simulador usa isso. */
function kAxes(ctx, cfg) {
  const { x, y, w, h, xmin, xmax, ymin, ymax } = cfg;
  const px = v => x + (v - xmin) / (xmax - xmin) * w;
  const py = v => y + h - (v - ymin) / (ymax - ymin) * h;
  const grid = cssVar('--border', '#1c2e44'), txt = cssVar('--text-muted', '#3d566e');

  ctx.save();
  ctx.strokeStyle = grid; ctx.lineWidth = 1;
  (cfg.xticks || []).forEach(t => {
    ctx.globalAlpha = .35;
    ctx.beginPath(); ctx.moveTo(px(t.v), y); ctx.lineTo(px(t.v), y + h); ctx.stroke();
    ctx.globalAlpha = 1;
    if (t.l != null) kLabel(ctx, String(t.l), px(t.v), y + h + 14, { size: 10, color: txt, align: 'center', mono: true });
  });
  (cfg.yticks || []).forEach(t => {
    ctx.globalAlpha = .35;
    ctx.beginPath(); ctx.moveTo(x, py(t.v)); ctx.lineTo(x + w, py(t.v)); ctx.stroke();
    ctx.globalAlpha = 1;
    if (t.l != null) kLabel(ctx, String(t.l), x - 6, py(t.v) + 3, { size: 10, color: txt, align: 'right', mono: true });
  });
  ctx.globalAlpha = 1;
  ctx.strokeStyle = cssVar('--text-muted', '#3d566e'); ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h);
  ctx.stroke();
  ctx.restore();

  if (cfg.xlabel) kLabel(ctx, cfg.xlabel, x + w, y + h + 30, { size: 11, align: 'right' });
  if (cfg.ylabel) {
    ctx.save(); ctx.translate(x - 34, y);
    ctx.rotate(-Math.PI / 2);
    kLabel(ctx, cfg.ylabel, 0, 0, { size: 11, align: 'right' });
    ctx.restore();
  }
  return { px, py };
}

/** Liga uma sequência de pontos {x,y} em valores de dados. */
function kLine(ctx, pts, px, py, o = {}) {
  if (!pts.length) return;
  ctx.save();
  ctx.strokeStyle = o.color || cssVar('--accent-main', '#4ade80');
  ctx.lineWidth = o.width || 2;
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath();
  pts.forEach((p, i) => { const X = px(p.x), Y = py(p.y); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  ctx.stroke();
  ctx.restore();
}

/** Átomo: bolinha com símbolo no centro — base dos desenhos orgânicos. */
function kAtom(ctx, x, y, r, simbolo, o = {}) {
  const cor = o.color || cssVar('--scene-b', '#94a3b8');
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = cor; ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = cssVar('--bg-void', '#080c14'); ctx.stroke();
  ctx.restore();
  if (simbolo) kLabel(ctx, simbolo, x, y + .5, {
    size: o.size || Math.max(9, r), bold: true, align: 'center', baseline: 'middle',
    color: o.fg || getContrastColor(cor.startsWith('#') ? cor : '#94a3b8'),
  });
}

/** Ligação entre dois pontos: ordem 1, 2 ou 3 (traços paralelos). */
function kBond(ctx, x1, y1, x2, y2, ordem = 1, o = {}) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;           // vetor perpendicular
  const gap = o.gap || 3.2;
  const desloc = ordem === 1 ? [0] : ordem === 2 ? [-gap, gap] : [-gap * 1.6, 0, gap * 1.6];
  ctx.save();
  ctx.strokeStyle = o.color || cssVar('--scene-a', '#94a3b8');
  ctx.lineWidth = o.width || 2;
  ctx.lineCap = 'round';
  desloc.forEach(d => {
    ctx.beginPath();
    ctx.moveTo(x1 + nx * d, y1 + ny * d);
    ctx.lineTo(x2 + nx * d, y2 + ny * d);
    ctx.stroke();
  });
  ctx.restore();
}

/** Béquer com líquido — usado nos módulos com solução aquosa. */
function kBeaker(ctx, cx, topY, w, h, level, liquidColor, o = {}) {
  const x = cx - w / 2, glass = cssVar('--glass', 'rgba(148,163,184,.38)');
  const lh = Math.max(0, Math.min(1, level)) * (h - 10);
  const ly = topY + h - lh;
  ctx.save();
  ctx.fillStyle = liquidColor;
  ctx.globalAlpha = o.alpha != null ? o.alpha : .8;
  ctx.beginPath(); ctx.rect(x + 3, ly, w - 6, lh); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = glass; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, topY); ctx.lineTo(x, topY + h); ctx.lineTo(x + w, topY + h); ctx.lineTo(x + w, topY);
  ctx.stroke();
  ctx.restore();
}

/** Partículas simples com colisão nas bordas de uma caixa. */
function kParticles(arr, n, box, speed, dt) {
  while (arr.length < n) {
    arr.push({
      x: box.x + Math.random() * box.w, y: box.y + Math.random() * box.h,
      vx: (Math.random() - .5), vy: (Math.random() - .5),
    });
  }
  while (arr.length > n) arr.pop();
  const v = isReduced() ? 0 : speed;
  arr.forEach(p => {
    p.x += p.vx * v * dt * 60; p.y += p.vy * v * dt * 60;
    if (p.x < box.x) { p.x = box.x; p.vx *= -1; }
    if (p.x > box.x + box.w) { p.x = box.x + box.w; p.vx *= -1; }
    if (p.y < box.y) { p.y = box.y; p.vy *= -1; }
    if (p.y > box.y + box.h) { p.y = box.y + box.h; p.vy *= -1; }
  });
}

function kDrawParticles(ctx, arr, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.fillStyle = color;
  arr.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

/** Bolhas subindo (gás liberado). */
function kBubbles(arr, dt, box, rate, o = {}) {
  if (!isReduced() && Math.random() < rate * dt * 60) {
    arr.push({ x: box.x + Math.random() * box.w, y: box.y + box.h, r: 1.5 + Math.random() * 2.5, v: 20 + Math.random() * 30 });
  }
  arr.forEach(b => { b.y -= b.v * dt; });
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i].y < box.y) arr.splice(i, 1);
  if (arr.length > (o.max || 120)) arr.splice(0, arr.length - (o.max || 120));
}

function kDrawBubbles(ctx, arr, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = .7;
  arr.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); });
  ctx.restore();
}

/** Mistura duas cores hexadecimais (t = 0 → h1, t = 1 → h2). */
function kMix(h1, h2, t) {
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const a = p(h1), b = p(h2);
  const c = a.map((v, i) => Math.round(lerp(v, b[i], clamp(t, 0, 1))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ══════════════════════════════════════════════════════════════════
// MECÂNICA — SICAR · Química do Carbono
// Modos: hibridização · classificação de cadeias · classes de carbono
// ══════════════════════════════════════════════════════════════════
class Mech {
  constructor(D) {
    this.D = D;
    this.modo = 'hibridizacao';
    this.t = 0;

    // modo 1 — hibridização
    this.hib = D.HIBRIDIZACOES[0];
    // modo 2 — cadeias
    this.cadeia = D.CADEIAS[0];
    // modo 3 — classes de carbono
    this.classeSel = 1;
  }

  /* ── monta as listas montadas por JS (o HTML só tem o contêiner) ── */
  build() {
    fillOptGrid('hib-grid', this.D.HIBRIDIZACOES.map(h => ({
      value: h.id, nome: h.nome, dot: h.dot, extra: `${fmt(h.angulo, 1)}°`,
      aria: `${h.nome}, geometria ${h.geometria}, ângulo de ${fmt(h.angulo, 1)} graus`,
    })), this.hib.id);

    fillOptGrid('cad-grid', this.D.CADEIAS.map(c => ({
      value: c.id, nome: c.nome, dot: c.dot, extra: c.formula,
      aria: `${c.nome}, ${c.formula}, cadeia ${c.classes.fechamento}, ${c.classes.saturacao}, ${c.classes.natureza}`,
    })), this.cadeia.id);
  }

  setMode(id) { this.modo = id; this.t = 0; }

  setParam(k, v) {
    switch (k) {
      case 'hib': {
        this.hib = this.D.HIBRIDIZACOES.find(h => h.id === v) || this.hib;
        return { say: `Hibridização ${this.hib.nome}: geometria ${this.hib.geometria}, ângulo de ${fmt(this.hib.angulo, 1)} graus, ${this.hib.sigma} ligações sigma e ${this.hib.pi} pi.` };
      }
      case 'cad': {
        this.cadeia = this.D.CADEIAS.find(c => c.id === v) || this.cadeia;
        const c = this.cadeia.classes;
        return { say: `${this.cadeia.nome}: cadeia ${c.fechamento}, ${c.saturacao}, ${c.natureza} e ${c.ramos}.` };
      }
      case 'cls': {
        this.classeSel = +v;
        const info = this.D.CLASSES_C.find(x => x.id === this.classeSel);
        const n = this._contaClasse(this.classeSel);
        return { say: `Classe ${info.nome}: ${info.desc}. A molécula tem ${n} carbono${n === 1 ? '' : 's'} dessa classe.` };
      }
    }
    return {};
  }

  action(name) {
    if (name === 'hib-next') {
      const L = this.D.HIBRIDIZACOES;
      const i = (L.indexOf(this.hib) + 1) % L.length;
      this.hib = L[i];
      this._marcarOpt('hib-grid', this.hib.id);
      playTone(720, .07, .05);
      announce(`Hibridização ${this.hib.nome}: ${this.hib.geometria}, ${fmt(this.hib.angulo, 1)} graus. Exemplo: ${this.hib.exemplo}.`);
    }
    if (name === 'cad-sortear') {
      const L = this.D.CADEIAS;
      let nova = this.cadeia;
      while (L.length > 1 && nova === this.cadeia) nova = L[Math.floor(Math.random() * L.length)];
      this.cadeia = nova;
      this._marcarOpt('cad-grid', this.cadeia.id);
      playTone(640, .07, .05);
      announce(`Cadeia sorteada: ${this.cadeia.nome}, ${this.cadeia.formula}. Tente classificar antes de ler o resultado.`);
    }
    if (name === 'cls-next') {
      this.classeSel = this.classeSel >= 4 ? 1 : this.classeSel + 1;
      document.querySelectorAll('.seg[data-group="cls"] .seg-btn').forEach(b => {
        b.setAttribute('aria-pressed', String(+b.dataset.value === this.classeSel));
      });
      const info = this.D.CLASSES_C.find(x => x.id === this.classeSel);
      playTone(700, .07, .05);
      announce(`Destacando carbonos ${info.nome.toLowerCase()}s: ${info.desc}.`);
    }
  }

  /** Marca visualmente o botão ativo de uma .opt-grid montada por JS. */
  _marcarOpt(gridId, value) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.querySelectorAll('.opt-btn').forEach(b => {
      const on = b.dataset.value === String(value);
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
  }

  _contaClasse(n) { return this.D.MOLECULA_CLASSES.classe.filter(c => c === n).length; }

  update(dt) { this.t += dt; }

  draw(ctx, W, H) {
    if (this.modo === 'hibridizacao') this._drawHib(ctx, W, H);
    else if (this.modo === 'cadeias') this._drawCadeia(ctx, W, H);
    else if (this.modo === 'classificacao') this._drawClasses(ctx, W, H);
  }

  /* ══════════ MODO 1 — hibridização ══════════ */
  _drawHib(ctx, W, H) {
    const cx = W / 2, cy = H / 2 + 6;
    const R = Math.min(W, H) * .19;
    const corC = cssVar('--scene-a', '#60a5fa');
    const corH = cssVar('--scene-b', '#94a3b8');
    const pulso = isReduced() ? 0 : Math.sin(this.t * 2.2) * 1.2;

    kLabel(ctx, `Hibridização ${this.hib.nome} — ${this.hib.geometria}`, cx, 38,
      { size: 15, bold: true, align: 'center', color: cssVar('--text-primary', '#ddeaf8') });
    kLabel(ctx, this.hib.exemplo, cx, 58, { size: 12, align: 'center' });

    if (this.hib.id === 'sp3') {
      // Metano: projeção 2D das quatro ligações do tetraedro
      const angs = [-140, -40, 60, 160].map(a => a * Math.PI / 180);
      angs.forEach(a => {
        const x = cx + Math.cos(a) * (R + pulso), y = cy + Math.sin(a) * (R + pulso);
        kBond(ctx, cx, cy, x, y, 1, { color: corC, width: 2.4 });
        kAtom(ctx, x, y, 12, 'H', { color: corH });
      });
      kAtom(ctx, cx, cy, 17, 'C', { color: corC, size: 13 });
      this._arco(ctx, cx, cy, R * .55, angs[0], angs[1], '109,5°');
    } else if (this.hib.id === 'sp2') {
      // Eteno: dois carbonos sp² ligados por dupla, 120° entre ligações
      const d = R * 1.05;
      const c1 = { x: cx - d / 2, y: cy }, c2 = { x: cx + d / 2, y: cy };
      kBond(ctx, c1.x, c1.y, c2.x, c2.y, 2, { color: corC, width: 2.4, gap: 4 });
      [[c1, 120, 240], [c2, 60, -60]].forEach(([c, a1, a2]) => {
        [a1, a2].forEach(g => {
          const a = g * Math.PI / 180;
          const x = c.x + Math.cos(a) * (R * .85 + pulso), y = c.y + Math.sin(a) * (R * .85 + pulso);
          kBond(ctx, c.x, c.y, x, y, 1, { color: corC, width: 2.2 });
          kAtom(ctx, x, y, 11, 'H', { color: corH });
        });
        kAtom(ctx, c.x, c.y, 16, 'C', { color: corC, size: 12 });
      });
      this._arco(ctx, c1.x, c1.y, R * .5, 120 * Math.PI / 180, 0, '120°');
      kLabel(ctx, 'a segunda ligação (pi) vem do orbital p que não hibridizou', cx, H - 30,
        { size: 11, align: 'center', color: cssVar('--text-muted', '#3d566e') });
    } else {
      // Etino: cadeia linear H–C≡C–H
      const d = R * .95;
      const c1 = { x: cx - d / 2, y: cy }, c2 = { x: cx + d / 2, y: cy };
      kBond(ctx, c1.x, c1.y, c2.x, c2.y, 3, { color: corC, width: 2.2, gap: 4 });
      const h1 = { x: c1.x - R * .95 - pulso, y: cy }, h2 = { x: c2.x + R * .95 + pulso, y: cy };
      kBond(ctx, c1.x, c1.y, h1.x, h1.y, 1, { color: corC, width: 2.2 });
      kBond(ctx, c2.x, c2.y, h2.x, h2.y, 1, { color: corC, width: 2.2 });
      kAtom(ctx, h1.x, h1.y, 11, 'H', { color: corH });
      kAtom(ctx, h2.x, h2.y, 11, 'H', { color: corH });
      kAtom(ctx, c1.x, c1.y, 16, 'C', { color: corC, size: 12 });
      kAtom(ctx, c2.x, c2.y, 16, 'C', { color: corC, size: 12 });
      kLabel(ctx, '180° — todos os átomos na mesma reta', cx, cy + R + 34,
        { size: 11, align: 'center', color: cssVar('--text-muted', '#3d566e') });
    }

    kChip(ctx, `${this.hib.sigma} sigma · ${this.hib.pi} pi`, W / 2, H - 54,
      { size: 11, fg: cssVar('--accent-main', '#60a5fa') });
  }

  /** Arco de ângulo entre duas ligações, com rótulo. */
  _arco(ctx, cx, cy, r, a1, a2, texto) {
    ctx.save();
    ctx.strokeStyle = cssVar('--accent-amber', '#fbbf24');
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.min(a1, a2), Math.max(a1, a2));
    ctx.stroke();
    ctx.restore();
    const am = (a1 + a2) / 2;
    kLabel(ctx, texto, cx + Math.cos(am) * (r + 16), cy + Math.sin(am) * (r + 16),
      { size: 11, bold: true, align: 'center', baseline: 'middle', color: cssVar('--accent-amber', '#fbbf24') });
  }

  /* ══════════ desenho genérico de esqueleto ══════════
     Recebe a molécula com coordenadas normalizadas (0–1) e devolve
     as posições em pixels, para quem quiser anotar em cima.       */
  _drawEsqueleto(ctx, W, H, mol, o = {}) {
    const padX = W * .10, padTop = 84, padBot = 96;
    const bw = W - padX * 2, bh = Math.max(60, H - padTop - padBot);
    const pos = mol.atomos.map(a => ({
      x: padX + a[0] * bw, y: padTop + a[1] * bh, el: a[2],
    }));
    const corLig = cssVar('--scene-a', '#94a3b8');
    mol.ligacoes.forEach(([i, j, ordem]) => {
      kBond(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, ordem, { color: corLig, width: 2.4, gap: 3.6 });
    });
    pos.forEach((p, i) => {
      const cor = (o.corPor && o.corPor(i, p)) || (p.el === 'C' ? cssVar('--scene-b', '#94a3b8') : cssVar('--accent-amber', '#fbbf24'));
      const r = (o.raioPor && o.raioPor(i, p)) || 13;
      kAtom(ctx, p.x, p.y, r, p.el, { color: cor });
      if (o.rotulo) {
        const txt = o.rotulo(i, p);
        if (txt) kLabel(ctx, txt, p.x, p.y - r - 8, { size: 10, bold: true, align: 'center', color: cssVar('--accent-main', '#60a5fa') });
      }
    });
    return pos;
  }

  /* ══════════ MODO 2 — cadeias carbônicas ══════════ */
  _drawCadeia(ctx, W, H) {
    const c = this.cadeia;
    kLabel(ctx, `${c.nome} — ${c.formula}`, W / 2, 40,
      { size: 15, bold: true, align: 'center', color: cssVar('--text-primary', '#ddeaf8') });

    this._drawEsqueleto(ctx, W, H, c, {
      corPor: (i, p) => p.el === 'C' ? cssVar('--scene-b', '#94a3b8') : cssVar('--accent-amber', '#fbbf24'),
    });

    const linhas = [
      ['Fechamento', c.classes.fechamento],
      ['Saturação', c.classes.saturacao],
      ['Natureza', c.classes.natureza],
      ['Ramificação', c.classes.ramos],
    ];
    const y0 = H - 74;
    linhas.forEach(([rot, val], i) => {
      const x = W * (.14 + .24 * (i % 4));
      kLabel(ctx, rot.toUpperCase(), x, y0, { size: 9, bold: true, align: 'center', color: cssVar('--text-muted', '#3d566e') });
      kLabel(ctx, val, x, y0 + 16, { size: 11, align: 'center', color: cssVar('--accent-main', '#60a5fa') });
    });
    if (c.nota) {
      kLabel(ctx, c.nota, W / 2, H - 22,
        { size: 10, align: 'center', color: cssVar('--text-muted', '#3d566e') });
    }
  }

  /* ══════════ MODO 3 — classificação dos carbonos ══════════ */
  _drawClasses(ctx, W, H) {
    const mol = this.D.MOLECULA_CLASSES;
    const info = this.D.CLASSES_C.find(x => x.id === this.classeSel);
    const pulso = isReduced() ? 0 : (Math.sin(this.t * 3) * .5 + .5);

    kLabel(ctx, `${mol.nome} — ${mol.formula}`, W / 2, 40,
      { size: 15, bold: true, align: 'center', color: cssVar('--text-primary', '#ddeaf8') });
    kLabel(ctx, `Destaque: carbono ${info.nome.toLowerCase()} (${info.desc})`, W / 2, 60,
      { size: 12, align: 'center', color: info.dot });

    this._drawEsqueleto(ctx, W, H, mol, {
      corPor: (i) => mol.classe[i] === this.classeSel ? info.dot : cssVar('--scene-b', '#94a3b8'),
      raioPor: (i) => mol.classe[i] === this.classeSel ? 14 + pulso * 3 : 12,
      rotulo: (i) => mol.classe[i] === this.classeSel ? String(mol.classe[i]) + 'º' : '',
    });

    const y = H - 44;
    this.D.CLASSES_C.forEach((cl, i) => {
      const x = W * (.14 + .24 * i);
      const on = cl.id === this.classeSel;
      kChip(ctx, `${cl.nome}: ${this._contaClasse(cl.id)}`, x, y, {
        size: 11, bold: on,
        fg: on ? cl.dot : cssVar('--text-secondary', '#7a9ab8'),
        border: on ? cl.dot : cssVar('--border', '#1c2e44'),
      });
    });
  }

  /* ══════════ resultados (painel da direita) ══════════ */
  getResults() {
    if (this.modo === 'hibridizacao') {
      const h = this.hib;
      return [
        { l: 'Hibridização', v: h.nome },
        { l: 'Ângulo de ligação', v: `${fmt(h.angulo, 1)}°` },
        { l: 'Geometria', v: h.geometria },
        { l: 'Ligações sigma', v: String(h.sigma) },
        { l: 'Ligações pi', v: String(h.pi), cls: h.pi ? 'val-alt' : '' },
        { l: 'Tipo de ligação', v: h.ligacao },
        { l: 'Comprimento C–C', v: `${h.comprimento} pm` },
        { l: 'Exemplo', v: h.exemplo },
      ];
    }
    if (this.modo === 'cadeias') {
      const c = this.cadeia;
      const nC = c.atomos.filter(a => a[2] === 'C').length;
      const hetero = c.atomos.filter(a => a[2] !== 'C').map(a => a[2]);
      return [
        { l: 'Molécula', v: c.nome },
        { l: 'Fórmula', v: c.formula },
        { l: 'Carbonos na cadeia', v: String(nC) },
        { l: 'Heteroátomos', v: hetero.length ? hetero.join(', ') : 'nenhum' },
        { l: 'Fechamento', v: c.classes.fechamento },
        { l: 'Saturação', v: c.classes.saturacao },
        { l: 'Natureza', v: c.classes.natureza },
        { l: 'Ramificação', v: c.classes.ramos },
      ];
    }
    const mol = this.D.MOLECULA_CLASSES;
    const info = this.D.CLASSES_C.find(x => x.id === this.classeSel);
    return [
      { l: 'Molécula', v: mol.nome },
      { l: 'Total de carbonos', v: String(mol.atomos.length) },
      { l: 'Classe destacada', v: info.nome },
      { l: 'Critério', v: info.desc },
      { l: 'Primários', v: String(this._contaClasse(1)) },
      { l: 'Secundários', v: String(this._contaClasse(2)) },
      { l: 'Terciários', v: String(this._contaClasse(3)) },
      { l: 'Quaternários', v: String(this._contaClasse(4)) },
    ];
  }

  getOverlay() {
    if (this.modo === 'hibridizacao') return `Hibridização ${this.hib.nome} · ${fmt(this.hib.angulo, 1)}°`;
    if (this.modo === 'cadeias') return `${this.cadeia.nome} · ${this.cadeia.formula}`;
    const info = this.D.CLASSES_C.find(x => x.id === this.classeSel);
    return `Carbono ${info.nome.toLowerCase()}`;
  }
}

// ══════════════════════════════════════════════════════════════════
// APP — casco genérico da família de simuladores.
// Acordeões, Alt+1–N, Enter/Espaço no canvas, gaveta mobile,
// resultados ao vivo. A mecânica específica vive na classe Mech.
// ══════════════════════════════════════════════════════════════════
/** Preenche uma .opt-grid com botões a partir de itens dos dados. */
function fillOptGrid(gridId, items, selValue) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(it => {
    const b = document.createElement('button');
    b.type = 'button';
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
    // Modos já vistos nesta sessão (modal de 1ª ativação) + controle da
    // "largada com antecipação" do gatilho — ver setMode()/_loop().
    this._modosVistos = new Set();
    this._modeStartsAt = 0;
    this._modeStartTimer = null;

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
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this._resize());
    }

    this._buildModes();
    this._buildModeTabsMobile();
    this._bindSidebar();
    this._bindModeIndicator();
    this._bindModeInfoModal();
    this._bindHeader();
    this._bindCanvasKeys();
    if (typeof mech.build === 'function') mech.build(this);

    // ── Estado inicial: NENHUM modo ativo — nada é desenhado no canvas
    //    até o usuário clicar em "Ativar" no painel do modo desejado. ──
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
  }

  /* ── painéis individuais por modo, gerados de SIM_DATA.MODES ──
     cada modo é um .panel padrão, igual ao de "Resultados": cabeçalho
     ícone+nome+sigla+seta (expande/recolhe sozinho, cuidado por
     _bindPanelArea) + corpo com botão "Ativar", definição, fatos-chave,
     interação do canvas e itens recomendados ── */
  _buildModes() {
    const list = document.getElementById('model-list');
    if (!list) return;
    this.D.MODES.forEach((m) => {
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
    // Cancela qualquer "largada com antecipação" pendente do modo
    // anterior.
    if (this._modeStartTimer) { clearTimeout(this._modeStartTimer); this._modeStartTimer = null; }
    this._modeStartsAt = 0;
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
    this._syncMobileModeUI(null);
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
      // Ao ativar, o painel se RECOLHE (em vez de expandir) — o gatilho de
      // ativação abre espaço pro canvas. Reabrir é um clique no
      // cabeçalho, a qualquer momento, inclusive com a simulação rodando.
      if (on) {
        if (header) header.setAttribute('aria-expanded', 'false');
        const body = panel.querySelector('.panel-body');
        if (body) body.classList.add('collapsed');
      }
    });
    document.querySelectorAll('.panel[data-owner]').forEach(p => {
      p.hidden = !(m.panels || []).includes(p.id);
    });
    const hint = document.getElementById('canvas-hint');
    this.mech.setMode(id);
    this.refresh();
    this._syncMobileModeUI(id);
    // No mobile, ativar um modo RECOLHE o bottom sheet de controles (se
    // estiver aberto) em vez de abri-lo — reabrir pra ajustar parâmetros
    // é um toque no botão 🎛 do cabeçalho, a qualquer momento.
    if (window.innerWidth <= 1100 && typeof window._closeSidebar === 'function') {
      window._closeSidebar();
    }
    // ── largada com 2s de antecipação ──
    // O ESTADO já foi montado (mech.setMode acima), então o canvas mostra
    // o quadro inicial "parado" imediatamente — só a FÍSICA (mech.update,
    // chamada em _loop) fica pausada por 2s.
    if (this._modeStartTimer) clearTimeout(this._modeStartTimer);
    this._modeStartsAt = performance.now() + 2000;
    if (hint) hint.textContent = 'Iniciando em instantes…';
    this._modeStartTimer = setTimeout(() => {
      const h = document.getElementById('canvas-hint');
      if (h && this.mode && this.mode.id === id) h.textContent = m.hintCanvas || '';
    }, 2000);
    if (!silent) {
      playTone(760, .06, .05);
      announce(`Modo ${m.nome} selecionado. A animação começa em 2 segundos. ${(m.info || '').split('.')[0]}.`);
    }
  }

  /* ── barra de modos MOBILE — mesma ordem/dados de _buildModes() acima,
     como abas roláveis em vez de acordeão (ver CSS, ativa só abaixo de
     1100px). Clicar chama setMode/clearMode, o MESMO contrato de sempre —
     a barra não tem lógica própria de estado, só delega. ── */
  _buildModeTabsMobile() {
    const bar = document.getElementById('mode-tabs-mobile');
    if (!bar) return;
    this.D.MODES.forEach(m => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'mode-tab';
      tab.dataset.modeTab = m.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', 'false');
      tab.innerHTML = `<span aria-hidden="true">${m.icon || ''}</span><span>${m.nome}</span>`;
      tab.title = m.nome;
      tab.addEventListener('click', () => {
        if (this.mode && this.mode.id === m.id) this.clearMode();else this.setMode(m.id);
      });
      bar.appendChild(tab);
    });
  }

  /* ── resumo do modo, para dentro do bottom sheet mobile (definição +
     fatos-chave — a mesma informação que já existe no acordeão da
     sidebar esquerda, só que reduzida e em outro lugar). ── */
  _modeSummaryHTML(m) {
    let html = '';
    if (m.def) html += `<p class="mode-define">${m.def}</p>`;
    if (m.fatos && m.fatos.length) {
      html += '<div class="fact-grid">' + m.fatos.map(ft =>
        `<div class="fact-cell"><span class="fact-label">${ft.l}</span><span class="fact-value">${ft.v}</span></div>`
      ).join('') + '</div>';
    }
    return html;
  }

  /* ── sincroniza a barra de modos e o resumo do bottom sheet com o modo
     ativo — chamada por setMode()/clearMode(), nunca sozinha. ── */
  _syncMobileModeUI(id) {
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.modeTab === id ? 'true' : 'false');
    });
    const activeTab = id && document.querySelector(`.mode-tab[data-mode-tab="${id}"]`);
    if (activeTab && typeof activeTab.scrollIntoView === 'function') {
      const reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      activeTab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduzido ? 'auto' : 'smooth' });
    }
    const box = document.getElementById('mode-summary-mobile');
    const toggle = document.getElementById('mode-summary-toggle');
    const body = document.getElementById('mode-summary-body');
    if (!box || !toggle || !body) return;
    if (!id) { box.hidden = true; return; }
    const m = this.D.MODES.find(x => x.id === id);
    if (!m) { box.hidden = true; return; }
    box.hidden = false;
    body.innerHTML = this._modeSummaryHTML(m);
    const primeiraVez = !this._modosVistos.has(id);
    this._modosVistos.add(id);
    toggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('open');
    if (primeiraVez && window.innerWidth <= 1100) this._showModeInfoModal(m);
    if (!toggle._wired) {
      toggle._wired = true;
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        body.classList.toggle('open', !open);
      });
    }
  }

  /* ── MODAL de informações do modo (1ª ativação, mobile) ── */
  _showModeInfoModal(m) {
    const overlay = document.getElementById('modeInfoOverlay');
    if (!overlay) return;
    const icon = document.getElementById('modeInfoIcon');
    const title = document.getElementById('modeInfoTitle');
    const body = document.getElementById('modeInfoBody');
    const closeBtn = document.getElementById('modeInfoClose');
    if (icon) icon.innerHTML = m.icon || '';
    if (title) title.textContent = m.nome;
    if (body) body.innerHTML = this._modeSummaryHTML(m);
    overlay.classList.add('aberto');
    overlay.setAttribute('aria-hidden', 'false');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 220);
  }
  _hideModeInfoModal() {
    const overlay = document.getElementById('modeInfoOverlay');
    if (!overlay) return;
    overlay.classList.remove('aberto');
    overlay.setAttribute('aria-hidden', 'true');
  }
  _bindModeInfoModal() {
    const overlay = document.getElementById('modeInfoOverlay');
    const closeBtn = document.getElementById('modeInfoClose');
    if (!overlay || !closeBtn) return;
    closeBtn.addEventListener('click', () => this._hideModeInfoModal());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this._hideModeInfoModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('aberto')) this._hideModeInfoModal();
    });
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
    return fmt(v, casas) + (inp.dataset.unit ? ' ' + inp.dataset.unit : '');
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
  }

  /** Redesenha o canvas auxiliar de gráfico no painel de Resultados,
   *  se a mecânica do módulo implementar drawResultChart(). */
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
    // clique/toque no canvas — a mecânica decide se usa ou não
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

    // Auto-correção de tamanho: existem formas de zoom que mudam o
    // devicePixelRatio SEM alterar o layout CSS — por isso comparamos
    // os DOIS: tamanho em CSS px e devicePixelRatio.
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
      // "Largada com antecipação": _modeStartsAt (marcado em setMode) segura
      // o UPDATE por 2s — o desenho continua rodando (mostra o quadro
      // congelado), só a física não avança até o tempo passar.
      if (now >= this._modeStartsAt) {
        this.time += dt;
        this.mech.update(dt, this);
      }
      this.mech.draw(ctx, this.W, this.H, this);

      // O painel de Resultados acompanha o tempo real da simulação,
      // com throttle de ~8x/s (rebuild de DOM a 60fps seria desperdício).
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
// header, backdrop compartilhado, Escape fecha, abrir uma fecha a outra.
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
  // Abertura PROGRAMÁTICA de uma gaveta específica — usada pela barra de
  // modos mobile (mode-tabs-mobile) para abrir/fechar o bottom sheet de
  // controles ao tocar um modo, sem duplicar a mecânica de abrir/fechar
  // que já existe aqui.
  window._openSidebar = function (elId) {
    const g = gavetas.find(x => x.el.id === elId);
    if (g) abrir(g);
  };
}
window.addEventListener('DOMContentLoaded', initMobileSidebar);

// ══════════════════════════════════════════════════════════════════
// SIDEBARS REDIMENSIONÁVEIS
// Alça (.sidebar-resizer) na borda interna de cada sidebar; arrastar
// ajusta --swl (esquerda) ou --swr (direita) em tempo real; a largura
// escolhida persiste em localStorage. Ignorada no modo gaveta mobile.
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

    var storeKey = 'carbono-w-' + cfg.cssVar.replace(/^--/, '');
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
