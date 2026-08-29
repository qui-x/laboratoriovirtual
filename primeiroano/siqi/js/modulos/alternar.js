/* ═══════════════════════════════════════════════════════════════
   CAMADA: MÓDULOS (orquestração)
   ARQUIVO: alternar.js
   ───────────────────────────────────────────────────────────────
   Controla qual dos 3 módulos (Nomenclatura, Construtor, Redox) está
   ativo: mostra/oculta os painéis certos da sidebar direita
   (data-module-content / data-hide-for-module), troca a view central,
   e volta ao estado "nenhum módulo" ao desativar.
   Depende de: core/estado.js, ui/view-toggle.js.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════════
   7. MÓDULOS (Construtor | Nomenclatura | Redox)
      Plano de Ação SIQI Modular (2026)
   ────────────────────────────────────────────────────────────────
   A sidebar esquerda passa a ter um seletor de MÓDULO no topo,
   seguindo o mesmo padrão de organização usado no SIMA (barra
   lateral dedicada à escolha do que está ativo no centro/lateral).
   Aqui os 3 módulos moram todos na sidebar-left: o painel
   "Biblioteca" (Módulo 1, já existente) e dois painéis novos que
   ficam ocultos (`hidden`) até o botão do módulo correspondente
   ser clicado.

   ORDEM: Construtor vem ANTES de Nomenclatura de propósito — pedido
   do usuário: o Construtor ensina a GRAMÁTICA (montar o nome do
   zero, com blocos), a Nomenclatura serve DEPOIS como referência
   mais concisa/direta (fichas prontas, dados completos) — não faz
   sentido consultar a resposta pronta antes de tentar construí-la.

   Reaproveita integralmente o que já existe neste arquivo, em vez
   de duplicar:
     · $() , srAnnounce() , sub2()   — utilidades da seção 4
     · .panel[data-open] + initPaineis() — accordion de abrir/fechar
       (os painéis dos módulos 2 e 3 usam a MESMA marcação .panel >
       .panel-header + .panel-body, então herdam o abrir/fechar de
       graça, sem código extra aqui)
     · CATALOGO_SIQI, DESAFIOS_CONSTRUTOR, HIBRIDIZACOES_NUVENS — dados
       vindos de js/data/*

   Acessibilidade (WCAG 2.1 AA), no mesmo padrão já usado em
   .mol-cat-tabs/.mol-cat-btn (abas Ácidos/Bases/Sais/Óxidos) e em
   #sub-list (role="listbox"):
     · Seletor de módulo / eixo / dificuldade → role="tablist"/"tab"
       + aria-selected
     · Listas de compostos/reações filtrados  → role="listbox"/"option"
     · Mudanças de estado anunciadas via srAnnounce()

   BNCC: Habilidades EF09CI05 (Módulo 3 — estequiometria/balanço de
   elétrons) e EM13CNT101/EM13CNT207 (Módulo 2 — nomenclatura de
   coordenação, conteúdo de Ensino Médio).
════════════════════════════════════════════════════════════════ */

/* ── 7.1 Gerenciador de módulos (troca de aba) ─────────────────── */
var MODULOS = {
  construtor:    { label: 'Construtor',    descricaoAnuncio: 'Monte nomes IUPAC de compostos de coordenação com blocos.' },
  nomenclatura:  { label: 'Nomenclatura',  descricaoAnuncio: 'Biblioteca de compostos e nomenclatura IUPAC.' },
  redox:         { label: 'Redox',         descricaoAnuncio: 'Analise estados de oxidação e balanceie reações redox.' },
};

var _moduloAtual = null;

/* Igual ao SIMA (clique no [data-model] já ativo desativa e limpa o
   canvas): clicar no módulo já ativo o desliga. Quando nenhum módulo
   está ativo, a regra CSS :has() (stylesiqi.css) para de esconder os
   outros cards, e os 3 reaparecem sozinhos — sem estado extra pra
   sincronizar aqui. */
function alternarModulo(nome){
  if(_moduloAtual === nome){ desativarModulo(); return; }
  trocarModulo(nome);
}

/* Painéis que somem quando um módulo específico está ativo (ex.:
   Balanço Atômico/Dados & Estrutura/Verificar-Reiniciar não fazem
   sentido dentro do Construtor — "todos os outros menus precisam
   estar ocultos", pedido do usuário). Lista de módulos em
   data-hide-for-module é separada por vírgula, ex.: "construtor" ou
   "construtor,redox" se um dia precisar esconder de mais de um. */
function _aplicarHideForModule(moduloAtivo){
  document.querySelectorAll('[data-hide-for-module]').forEach(function(el){
    var lista = el.dataset.hideForModule.split(',').map(function(s){ return s.trim(); });
    el.hidden = moduloAtivo !== null && lista.indexOf(moduloAtivo) !== -1;
  });
}

function desativarModulo(){
  var meta = MODULOS[_moduloAtual];
  document.querySelectorAll('[data-module]').forEach(function(btn){
    btn.setAttribute('aria-pressed','false');
  });
  document.querySelectorAll('[data-module-content]').forEach(function(el){
    el.hidden = true;
  });
  _moduloAtual = null;
  _aplicarHideForModule(null);
  /* Área central volta ao estado "nenhum módulo" — réplica exata do
     clearModel() do SIMA (canvas em branco + dica), ver setView('none')
     em initViewToggle(). */
  if(window._setView) window._setView('none');
  if(meta) srAnnounce('Módulo ' + meta.label + ' desativado. Escolha um módulo para continuar.');
  window.dispatchEvent(new CustomEvent('siqi:module-switch', { detail:{ module: null } }));
}

function trocarModulo(nome){
  var meta = MODULOS[nome];
  if(!meta){ console.warn('[modulos] modulo desconhecido:', nome); return; }
  if(nome === _moduloAtual) return;

  /* Igual ao SIMA (mode-activate-btn): só alternamos aria-pressed.
     O selo "Ativo" no cabeçalho, o sufixo "✓ ativo" no botão E o
     ocultar dos outros cards são 100% CSS, via
     :has(.mode-activate-btn[aria-pressed="true"]) — ver stylesiqi.css,
     bloco "MÓDULOS (estilo SIMA)". */
  document.querySelectorAll('[data-module]').forEach(function(btn){
    var ativo = btn.dataset.module === nome;
    btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
  });
  document.querySelectorAll('[data-module-content]').forEach(function(el){
    el.hidden = el.dataset.moduleContent !== nome;
  });
  _aplicarHideForModule(nome);

  _moduloAtual = nome;
  srAnnounce('Módulo ' + meta.label + ' ativado. ' + meta.descricaoAnuncio);

  /* Área central "gera" o conteúdo do módulo ativo (mesmo padrão do
     SIMA: canvas mostra o modelo selecionado). Redox e Construtor têm
     suas próprias views centrais; ao entrar em Nomenclatura vindo de
     "nenhum módulo" ou de outro módulo, volta pra Ficha (se já há
     composto carregado) ou Lab — nunca fica preso na dica "escolha um
     módulo" ou no conteúdo do módulo anterior. */
  if(window._setView){
    if(nome === 'redox'){
      window._setView('redox');
    } else if(nome === 'construtor'){
      window._setView('construtor');
    } else if(STATE.modoView === 'redox' || STATE.modoView === 'construtor' || STATE.modoView === 'none'){
      window._setView(STATE.compostoAtual ? 'info' : 'lab');
    }
  }

  window.dispatchEvent(new CustomEvent('siqi:module-switch', { detail:{ module: nome } }));
}

function initModulos(){
  document.querySelectorAll('[data-module]').forEach(function(btn){
    var nome = btn.dataset.module;
    btn.addEventListener('click', function(){ alternarModulo(nome); });
  });
  /* Estado inicial: nenhum módulo ativo (réplica do this.model=null do
     SIMA) — todo painel de conteúdo começa oculto, nenhum botão com
     aria-pressed=true. A view central "none" já é a padrão no HTML
     (ver panel-none em indexsiqi.html), sem precisar de setView() aqui. */
  document.querySelectorAll('[data-module-content]').forEach(function(el){
    el.hidden = true;
  });
  _aplicarHideForModule(null);
}

