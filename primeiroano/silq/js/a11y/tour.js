/* ═══════════════════════════════════════════════════════════════
   CAMADA: ACESSIBILIDADE / ONBOARDING
   ARQUIVO: tour.js
   ───────────────────────────────────────────────────────────────
   Tours guiados (coachmark) específicos do SILQ. Dois níveis:

   1. Boas-vindas geral — dispara uma vez, na primeira visita, com
      a orientação básica: os 3 tipos de ligação → tabela periódica
      → canvas.
   2. Por MÓDULO — cada um dos 3 tipos de ligação (metálica, iônica,
      covalente) tem seu próprio tour curto, disparado na primeira
      vez que aquele modo específico é ativado, explicando só o que
      é exclusivo dali.

   Depende de: coachmark.js (motor genérico, carregado pela Central
               e copiado pra cá — ver <script> no <head>).
   Roda depois do DOM pronto (os elementos-alvo já precisam existir).
═══════════════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', function () {
  if (typeof Coachmark === 'undefined') return;

  /* ── util: expande um painel colapsado (clica no header se ainda
     não estiver aberto) — os alvos dos tours vivem dentro de painéis
     que começam fechados. ── */
  function abrirPainel(headerId) {
    var header = document.getElementById(headerId);
    if (header && header.getAttribute('aria-expanded') !== 'true') header.click();
  }

  /* ════════ 1. BOAS-VINDAS GERAL (uma vez, ao entrar no SILQ) ════════ */
  function tourBoasVindas() {
    Coachmark.iniciar({
      id: 'silq-boas-vindas',
      passos: [
        {
          alvo: '#left-accordion',
          titulo: 'Escolha o tipo de ligação',
          texto: 'Aqui estão os 3 tipos — metálica, iônica e covalente. Toque num card pra ver os detalhes e ativar o modo.'
        },
        {
          alvo: '#hdr-periodic',
          titulo: 'Escolha os elementos',
          texto: 'Com um modo ativo, abra a Tabela Periódica aqui e clique nos elementos pra adicioná-los ao canvas.',
          ao_entrar: function () { abrirPainel('hdr-periodic'); }
        },
        {
          alvo: '#main-content',
          titulo: 'Veja a ligação se formar',
          texto: 'O canvas mostra a ligação acontecendo na hora — cores, elétrons, tudo interativo.'
        }
      ]
    });
  }
  if (!Coachmark.jaViu('silq-boas-vindas')) {
    setTimeout(tourBoasVindas, 700);
  }

  /* ════════ 2. TOUR DO MÓDULO — LIGAÇÃO METÁLICA ════════
     Dispara na primeira vez que "Ativar Modo Metálico" é clicado.
     Só o que é EXCLUSIVO desse modo — o resto (tabela, canvas) já
     foi coberto no tour geral acima. */
  function tourModoMetalica() {
    abrirPainel('hdr-mode-metalica');
    Coachmark.iniciar({
      id: 'silq-modo-metalica',
      passos: [
        {
          alvo: '#body-mode-metalica .bond-ionic-pairs',
          titulo: 'Adicione metais iguais',
          texto: 'Clique em 2 metais iguais na tabela (ex.: Fe + Fe) — esses aqui são bons exemplos pra começar.'
        },
        {
          alvo: '#body-mode-metalica .bond-info-grid',
          titulo: 'Propriedades da ligação',
          texto: 'Energia, condutividade, maleabilidade — tudo isso muda de acordo com o tipo de ligação escolhido.'
        }
      ]
    });
  }
  var btnMet = document.getElementById('btn-mode-met');
  if (btnMet) {
    btnMet.addEventListener('click', function () {
      if (!Coachmark.jaViu('silq-modo-metalica')) {
        setTimeout(tourModoMetalica, 400);
      }
    });
  }

  /* ════════ 3. TOUR DO MÓDULO — LIGAÇÃO IÔNICA ════════
     O que é exclusivo aqui: precisa de metal + ametal (não um par
     igual, como na metálica), e o simulador mostra a carga (Na⁺/Cl⁻)
     sozinho assim que a transferência acontece. */
  function tourModoIonica() {
    abrirPainel('hdr-mode-ionica');
    Coachmark.iniciar({
      id: 'silq-modo-ionica',
      passos: [
        {
          alvo: '#body-mode-ionica .bond-ionic-pairs',
          titulo: 'Escolha metal + ametal',
          texto: 'Clique num metal e depois num ametal (ex.: Na + Cl) — precisa ser um de cada, não dois iguais.'
        },
        {
          alvo: '#body-mode-ionica .bond-interactions',
          titulo: 'A carga aparece sozinha',
          texto: 'Assim que a transferência acontece, o simulador mostra Na⁺ e Cl⁻ automaticamente sobre os átomos.'
        }
      ]
    });
  }
  var btnIon = document.getElementById('btn-mode-ion');
  if (btnIon) {
    btnIon.addEventListener('click', function () {
      if (!Coachmark.jaViu('silq-modo-ionica')) {
        setTimeout(tourModoIonica, 400);
      }
    });
  }

  /* ════════ 4. TOUR DO MÓDULO — LIGAÇÃO COVALENTE ════════
     O que é exclusivo aqui: escolher 2 átomos forma a ligação, mas
     ORDEM da ligação (σ/π), edição individual e direção da cunha
     NÃO ficam neste painel — foram realocados pro painel Controles,
     na sidebar direita. Sem apontar pra lá, a pessoa nunca acha. */
  function tourModoCovalente() {
    abrirPainel('hdr-mode-covalente');
    Coachmark.iniciar({
      id: 'silq-modo-covalente',
      passos: [
        {
          alvo: '#body-mode-covalente .bond-ionic-pairs',
          titulo: 'Escolha os átomos',
          texto: 'Clique em 2 átomos (ex.: H + O) pra formar a ligação — pode sair simples, dupla ou tripla.'
        },
        {
          alvo: '#hdr-controls',
          titulo: 'Ajuste a ligação aqui',
          texto: 'Ordem da ligação (σ/π), edição individual e direção da cunha ficam neste painel, não no de Ligação Covalente.',
          ao_entrar: function () { abrirPainel('hdr-controls'); }
        }
      ]
    });
  }
  var btnCov = document.getElementById('btn-mode-cov');
  if (btnCov) {
    btnCov.addEventListener('click', function () {
      if (!Coachmark.jaViu('silq-modo-covalente')) {
        setTimeout(tourModoCovalente, 400);
      }
    });
  }
});
