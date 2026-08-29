/* ═══════════════════════════════════════════════════════════════
   CAMADA: INTERFACE (interação)
   ARQUIVO: painel-modulos.js
   ───────────────────────────────────────────────────────────────
   Os 3 cartões de módulo da sidebar esquerda — Gases, Líquidos e
   Sólidos — no mesmo padrão visual/comportamental do menu de modelos
   do SIMA (.panel--mode / .mode-activate-btn): cada um pode ser
   "ativado" para filtrar a lista de substâncias do painel direito
   (ui/painel-substancias.js) pelo estado físico de referência
   (25 °C, 1 atm — ver estadoPadrao() em core/fisica.js). Ativar um
   módulo é uma alternância (toggle), igual ao SIMA: clicar de novo
   no mesmo módulo desativa o filtro e a lista volta a mostrar as
   102 substâncias. Só um módulo fica ativo por vez — a troca para
   outro desativa o anterior automaticamente.

   Também liga os "chips" de exemplo de cada módulo (ex.: O₂, N₂, CO₂
   no módulo Gases): diferente do SIMA, onde os chips de "bons
   exemplos" são só decorativos, aqui cada chip é um atalho clicável
   que já carrega aquela substância no cilindro — mais útil num
   simulador onde a substância é o dado central do experimento.

   Depende de: data/catalogo-substancias.js (SUBSTANCIAS),
               core/estado-simulacao.js (estado.modulo),
               core/fisica.js (estadoPadrao),
               ui/painel-substancias.js (renderizarLista,
               selecionarSubstancia), a11y/acessibilidade.js (announce).
   Usado por: main.js.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════
   CONTAGEM POR ESTADO — preenche o badge de cada cartão de módulo
   com o número real de substâncias do catálogo (nunca um valor fixo
   digitado à mão, que ficaria desatualizado se o catálogo mudasse).
═══════════════════════════════════════════════════════ */
function contarSubstanciasPorEstado() {
  var contagem = { solido: 0, liquido: 0, gasoso: 0 };
  for (var i = 0; i < SUBSTANCIAS.length; i++) {
    var e = estadoPadrao(SUBSTANCIAS[i]);
    if (contagem[e] !== undefined) contagem[e]++;
  }
  return contagem;
}

function preencherBadgesModulo() {
  var contagem = contarSubstanciasPorEstado();
  var mapaBadge = {
    gasoso:  'badge-mod-gasoso',
    liquido: 'badge-mod-liquido',
    solido:  'badge-mod-solido'
  };
  Object.keys(mapaBadge).forEach(function(chave) {
    var el = document.getElementById(mapaBadge[chave]);
    if (el) el.textContent = contagem[chave];
  });
}

/* ═══════════════════════════════════════════════════════
   ATIVAR / DESATIVAR MÓDULO
═══════════════════════════════════════════════════════ */
function alternarModulo(modulo, btn) {
  var jaEstavaAtivo = estado.modulo === modulo;

  // Qualquer outro botão de módulo que porventura estivesse pressionado
  // (não deveria — só um módulo fica ativo por vez — mas isto garante
  // consistência mesmo se o HTML for editado no futuro).
  document.querySelectorAll('.mode-activate-btn[data-modulo-ativar]').forEach(function(b) {
    b.setAttribute('aria-pressed', 'false');
  });

  var nomes = { gasoso: 'Gases', liquido: 'Líquidos', solido: 'Sólidos' };

  if (jaEstavaAtivo) {
    estado.modulo = null;
    announce('Módulo ' + nomes[modulo] + ' desativado. A lista de substâncias voltou a mostrar todos os estados físicos.', 'assertive');
  } else {
    estado.modulo = modulo;
    btn.setAttribute('aria-pressed', 'true');
    announce('Módulo ' + nomes[modulo] + ' ativado. A lista de substâncias foi filtrada.', 'assertive');
  }
  renderizarLista();
}

/* ═══════════════════════════════════════════════════════
   CHIPS DE EXEMPLO — atalho para carregar a substância direto
═══════════════════════════════════════════════════════ */
function buscarSubstanciaPorId(id) {
  for (var i = 0; i < SUBSTANCIAS.length; i++) {
    if (SUBSTANCIAS[i].id === id) return SUBSTANCIAS[i];
  }
  return null;
}

/* ═══════════════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════════════ */
function inicializarModulos() {
  preencherBadgesModulo();

  document.querySelectorAll('.mode-activate-btn[data-modulo-ativar]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      alternarModulo(btn.dataset.moduloAtivar, btn);
    });
  });

  document.querySelectorAll('.chip[data-sub-id]').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var sub = buscarSubstanciaPorId(chip.dataset.subId);
      if (sub) selecionarSubstancia(sub);
    });
  });
}
