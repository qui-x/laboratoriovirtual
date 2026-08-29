/* ═══════════════════════════════════════════════════════════════
   CAMADA: PONTO DE ENTRADA (composition root)
   ARQUIVO: eventos-finais.js
   ───────────────────────────────────────────────────────────────
   Liga os botões "Selecionar módulo" de cada card aos módulos
   correspondentes e dispara a inicialização completa do simulador ao
   carregar a página — é o arquivo mais próximo de um "main.js" que
   este projeto tem, por isso é o ÚLTIMO a carregar.
   Depende de: praticamente tudo (é o topo da árvore de
               dependências).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* (antigo listener de window.addEventListener('siqi:module-switch', ...)
   que disparava a inicialização do módulo de Hibridização/Redox —
   removido junto com o módulo. O evento 'siqi:module-switch' continua
   sendo disparado por alternar.js a cada troca de módulo, caso algum
   outro código queira escutar no futuro; só não há mais nenhum
   listener aqui.) */

document.addEventListener('DOMContentLoaded', function(){
  initPaineis();
  initExpandModal();
  initMobile();
  initViewToggle();
  initSubList();
  initCanvas();
  initSimulador();
  initModulos();
  initModulo2();

  /* Scroll-ready ANTES de carregar composto */
  document.querySelectorAll('[data-open="true"] .panel-body').forEach(function(bd){
    bd.classList.add('scroll-ready');
  });

  /* Nenhum composto pré-carregado — tudo começa bloqueado */
});

// ══════════════════════════════════════════════════════════════════
// SIDEBARS REDIMENSIONÁVEIS
// Cria uma alça (.sidebar-resizer) na borda interna de cada sidebar.
// Arrastar ajusta a variável CSS de largura em tempo real; a largura
// escolhida é salva no localStorage e restaurada na próxima visita.
// A alça é ignorada quando a sidebar está em modo gaveta mobile
// (position:fixed) — nesse modo a largura é fixa por CSS.
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  var targets = [{ id:'sidebar-left', side:'left', cssVar:'--sl', min:200, max:520 },{ id:'sidebar-right', side:'right', cssVar:'--sr', min:180, max:480 }];
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

