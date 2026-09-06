/* ═══════════════════════════════════════════════════════════════
   CAMADA: ACESSIBILIDADE / ONBOARDING
   ARQUIVO: tour.js
   ───────────────────────────────────────────────────────────────
   Tours guiados (coachmark) do SIQI. Mesmo padrão do SILQ: um tour
   geral de boas-vindas + um tour próprio por módulo (Construtor e
   Nomenclatura), disparado na primeira vez que aquele módulo
   específico é ativado.
   Depende de: coachmark.js (motor genérico, referenciado da raiz),
               siqi:module-switch (evento já disparado por
               trocarModulo() em js/modulos/alternar.js).
═══════════════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', function () {
  if (typeof Coachmark === 'undefined') return;

  function abrirPainel(headerId) {
    var header = document.getElementById(headerId);
    if (header) {
      var painel = header.closest('.panel');
      if (painel && painel.dataset.open !== 'true') header.click();
    }
  }

  /* ════════ 1. BOAS-VINDAS GERAL ════════ */
  function tourBoasVindas() {
    Coachmark.iniciar({
      id: 'siqi-boas-vindas',
      passos: [
        {
          alvo: '#sidebar-left',
          titulo: 'Escolha um módulo',
          texto: 'Construtor ou Nomenclatura — cada um ensina a montar o nome de um composto de um jeito diferente.'
        },
        {
          alvo: '#sim-area',
          titulo: 'Veja tudo acontecer aqui',
          texto: 'O composto escolhido alimenta todos os painéis ao redor — dados, estrutura e balanço atômico.'
        }
      ]
    });
  }
  if (!Coachmark.jaViu('siqi-boas-vindas')) {
    setTimeout(tourBoasVindas, 700);
  }

  /* ════════ 2. TOUR DO MÓDULO — CONSTRUTOR ════════
     O que é exclusivo aqui: o nome do composto fica ESCONDIDO até
     você montar certo — é um desafio, não uma consulta. */
  function tourConstrutor() {
    Coachmark.iniciar({
      id: 'siqi-modulo-construtor',
      passos: [
        {
          alvo: '#hdr-construtor-biblioteca',
          titulo: 'Escolha um composto',
          texto: 'Escolha um composto pela fórmula — o nome fica em segredo até você montá-lo certo na área central.',
          ao_entrar: function () { abrirPainel('hdr-construtor-biblioteca'); }
        },
        {
          alvo: '#construtor-central-content',
          titulo: 'Monte o nome',
          texto: 'Arraste os blocos (metal, conectivo, cátion/ânion) até os espaços certos, na ordem certa.'
        },
        {
          alvo: null,
          titulo: 'Confira sua resposta',
          texto: 'O Validador e o Balanço Atômico, na barra direita, mostram se você está no caminho certo antes de confirmar.'
        }
      ]
    });
  }

  /* ════════ 3. TOUR DO MÓDULO — NOMENCLATURA ════════
     O que é exclusivo aqui: é consulta livre, não desafio — o nome
     já aparece, junto com todos os dados reais do composto. */
  function tourNomenclatura() {
    Coachmark.iniciar({
      id: 'siqi-modulo-nomenclatura',
      passos: [
        {
          alvo: '#hdr-compostos',
          titulo: 'Escolha um composto',
          texto: 'A Biblioteca aqui alimenta a Ficha ao lado — escolha um composto real pra consultar tudo sobre ele.',
          ao_entrar: function () { abrirPainel('hdr-compostos'); }
        },
        {
          alvo: '#panel-info',
          titulo: 'Nome, fórmula e estrutura',
          texto: 'Ao contrário do Construtor, aqui o nome já aparece — é pra consultar e entender, não pra adivinhar.'
        }
      ]
    });
  }

  window.addEventListener('siqi:module-switch', function (e) {
    var modulo = e.detail && e.detail.module;
    if (modulo === 'construtor' && !Coachmark.jaViu('siqi-modulo-construtor')) {
      setTimeout(tourConstrutor, 400);
    } else if (modulo === 'nomenclatura' && !Coachmark.jaViu('siqi-modulo-nomenclatura')) {
      setTimeout(tourNomenclatura, 400);
    }
  });
});
