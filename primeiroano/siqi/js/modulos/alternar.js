/* ═══════════════════════════════════════════════════════════════
   CAMADA: APLICAÇÃO
   ARQUIVO: alternar.js
   ───────────────────────────────────────────────────────────────
   ARQUIVO RECONSTRUÍDO — não veio no projeto original (o
   <script src="js/modulos/alternar.js"> já existia no HTML,
   apontando para um arquivo que não existia, então o navegador
   simplesmente falhava em carregá-lo e seguia em frente sem erro
   visível — por isso o sintoma era só "os botões não fazem nada",
   sem nenhuma mensagem óbvia do porquê).

   Reconstruído a partir de três pistas deixadas no próprio código:
     1) o comentário do #panel-none em indexsiqi.html cita as
        funções trocarModulo()/desativarModulo() por nome e descreve
        exatamente o que elas devem fazer;
     2) view-toggle.js expõe window._setView('none'|'lab'|'info'
        |'construtor') e diz explicitamente "trocarModulo()/
        desativarModulo() cuidam de trocar para/desta view";
     3) construtor/bancada.js já escuta window.addEventListener(
        'siqi:module-switch', ...) esperando e.detail.module —
        esse evento nunca era disparado por ninguém.

   trocarModulo(nome, btn) — ativa o cartão de módulo clicado (marca
   aria-pressed, desmarca os outros — a troca visual de qual cartão
   fica visível já é 100% CSS via :has(), não precisa de JS aqui),
   troca a view central para a correspondente, e dispara o evento
   que os módulos Construtor/Nomenclatura escutam para se inicializar
   sob demanda (só na primeira vez que são abertos).

   desativarModulo(btn) — desfaz a ativação e volta para a view
   "none" (dica central, mesmo comportamento do sim.model=null do
   SIMA).

   Depende de: window._setView (ui/view-toggle.js).
   Usado por: redox/eventos-finais.js (liga o clique nos botões
              ".mode-activate-btn[data-module]").
═══════════════════════════════════════════════════════════════ */

'use strict';

function trocarModulo(nome, btn) {
  document.querySelectorAll('.mode-activate-btn[data-module]').forEach(function (b) {
    if (b !== btn) b.setAttribute('aria-pressed', 'false');
  });
  btn.setAttribute('aria-pressed', 'true');

  // 'construtor' tem sua própria view; 'nomenclatura' reaproveita a
  // Ficha (mesma tela de detalhes do composto que o Lab usa) — o
  // desafio de nomenclatura troca o conteúdo dela por dentro
  // (ver _mostrarDesafio() em nomenclatura/desafio.js).
  if (window._setView) {
    window._setView(nome === 'construtor' ? 'construtor' : 'info');
  }

  window.dispatchEvent(new CustomEvent('siqi:module-switch', { detail: { module: nome } }));
}

function desativarModulo(btn) {
  btn.setAttribute('aria-pressed', 'false');
  if (window._setView) window._setView('none');
}
