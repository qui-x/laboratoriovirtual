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
      if (e.target.closest('.model-btn, .opt-btn, .mode-activate-btn') && window.innerWidth <= 1100) {
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
//
