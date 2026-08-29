/* ═══════════════════════════════════════════════════════════════
   CAMADA: INTERFACE (independente dos módulos)
   ARQUIVO: sidebar-resizer.js
   ───────────────────────────────────────────────────────────────
   Alça de arraste nas bordas das sidebars, com largura salva em
   localStorage — mesmo padrão do SILQ/SIEM/SIME/SIE/SIMA.

   PADRONIZAÇÃO: este arquivo não existia no SIQI — a folha de
   estilos já trazia toda a aparência pronta (.sidebar-resizer,
   .sidebar-resizer--left/--right, o estado .dragging, o
   position:relative correto em .sidebar e o `display:none` dentro
   do modo gaveta em @media max-width:900px), mas nada no JS criava
   a alça nem escutava o arraste. Este arquivo fecha essa lacuna.
   Depende de: nada além do HTML/CSS (variáveis --sl/--sr).
   Usado por: carregado diretamente pela página.
═══════════════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════════════════════════════
// SIDEBARS REDIMENSIONÁVEIS
// Cria uma alça (.sidebar-resizer) na borda interna de cada sidebar.
// Arrastar ajusta a variável CSS de largura em tempo real; a largura
// escolhida é salva no localStorage e restaurada na próxima visita.
// A alça é ignorada quando a sidebar está em modo gaveta mobile
// (position:fixed) — nesse modo a largura é fixa por CSS.
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  var targets = [
    { id: 'sidebar-left',  side: 'left',  cssVar: '--sl', min: 220, max: 400 },
    { id: 'sidebar-right', side: 'right', cssVar: '--sr', min: 190, max: 320 }
  ];
  var root = document.documentElement;
  var rafPending = false;

  function fireResize() {
    // Notifica canvases/física que o espaço central mudou (mesmo evento
    // que os módulos já escutam para redimensionamento da janela).
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

    var storeKey = 'siqi-w-' + cfg.cssVar.replace(/^--/, '');
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
      // Em modo gaveta (mobile) a sidebar é position:fixed — não redimensiona.
      if (getComputedStyle(el).position === 'fixed') return;
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
