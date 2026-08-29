/* ═══════════════════════════════════════════════════════════════
   CAMADA: APLICAÇÃO — Módulos de estado físico
   ARQUIVO: app-modulos.js
   ───────────────────────────────────────────────────────────────
   Os 3 cartões de módulo da sidebar esquerda — Gases, Líquidos e
   Sólidos — no mesmo padrão do SIMA/SIME (.panel--mode /
   .mode-activate-btn): cada um pode ser "ativado" para filtrar a
   lista de substâncias do painel direito (app-substancias.js) pelo
   estado físico de referência (25 °C, 1 atm — ver estadoPadrao() em
   core/termodinamica.js). Ativar um módulo é uma alternância: clicar
   de novo no mesmo módulo desativa o filtro. Só um módulo fica ativo
   por vez.

   A sidebar direita (Substância/Diagrama/Controles/Dados & Medidas)
   começa TRANCADA: sem nenhum módulo ativo, os 4 painéis ficam com o
   atributo `inert` e esmaecidos por CSS; um aviso explica o porquê.
   Ativar qualquer módulo destrava tudo de uma vez.

   Também liga os chips de exemplo de cada módulo: clicar num chip
   ativa o módulo daquele cartão (se ainda não estiver ativo) e já
   carrega a substância correspondente.

   Adiciona a App.prototype: _initModulos, _alternarModulo.
   Depende de: data/catalogo-substancias.js (CATALOG),
               core/termodinamica.js (estadoPadrao),
               app/app-substancias.js (_buildList, _selectEntryByFormula).
   Usado por: app/app-core.js (chamado no construtor).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════
   CONTAGEM POR ESTADO — preenche o badge de cada cartão de módulo
   com o número real de substâncias do catálogo.
═══════════════════════════════════════════════════════ */
App.prototype._contarSubstanciasPorEstado = function() {
  const contagem = { solido: 0, liquido: 0, gasoso: 0 };
  const mapaEstado = { solid: 'solido', liquid: 'liquido', gas: 'gasoso' };
  for (const e of CATALOG) {
    const estado = mapaEstado[estadoPadrao(e)];
    if (estado) contagem[estado]++;
  }
  return contagem;
};

App.prototype._preencherBadgesModulo = function() {
  const contagem = this._contarSubstanciasPorEstado();
  const mapaBadge = { gasoso: 'badge-mod-gasoso', liquido: 'badge-mod-liquido', solido: 'badge-mod-solido' };
  Object.keys(mapaBadge).forEach((chave) => {
    const el = document.getElementById(mapaBadge[chave]);
    if (el) el.textContent = contagem[chave];
  });
};

/* ═══════════════════════════════════════════════════════
   TRANCA DA SIDEBAR DIREITA (mesma técnica do SIME: `inert`)
═══════════════════════════════════════════════════════ */
App.prototype._atualizarTrancaSidebarDireita = function() {
  const travar = !this._activeModulo;
  document.querySelectorAll('#sidebar-right > .panel').forEach((painel) => {
    painel.inert = travar;
  });
};

/* ═══════════════════════════════════════════════════════
   ATIVAR / DESATIVAR MÓDULO
═══════════════════════════════════════════════════════ */
App.prototype._alternarModulo = function(modulo, btn) {
  const jaEstavaAtivo = this._activeModulo === modulo;

  document.querySelectorAll('.mode-activate-btn[data-modulo-ativar]').forEach((b) => {
    b.setAttribute('aria-pressed', 'false');
  });

  const nomes = { gasoso: 'Gases', liquido: 'Líquidos', solido: 'Sólidos' };

  if (jaEstavaAtivo) {
    this._activeModulo = null;
  } else {
    this._activeModulo = modulo;
    btn.setAttribute('aria-pressed', 'true');
  }

  const search = document.getElementById('sub-search');
  this._buildList(search ? search.value : '');
  this._atualizarTrancaSidebarDireita();

  if (typeof announce === 'function') {
    announce(jaEstavaAtivo
      ? `Módulo ${nomes[modulo]} desativado. A barra de substância, diagrama, controles e medidas foi trancada novamente.`
      : `Módulo ${nomes[modulo]} ativado. A lista de substâncias foi filtrada e a barra da direita foi destrancada.`,
      'assertive');
  }
};

/* ═══════════════════════════════════════════════════════
   CHIPS DE EXEMPLO — atalho para carregar a substância direto
═══════════════════════════════════════════════════════ */
App.prototype._buscarSubstanciaPorFormula = function(formula) {
  return CATALOG.find((e) => e.formula === formula) || null;
};

/* ═══════════════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════════════ */
App.prototype._initModulos = function() {
  this._preencherBadgesModulo();

  document.querySelectorAll('.mode-activate-btn[data-modulo-ativar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      this._alternarModulo(btn.dataset.moduloAtivar, btn);
    });
  });

  document.querySelectorAll('.chip[data-sub-formula]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const entry = this._buscarSubstanciaPorFormula(chip.dataset.subFormula);
      if (!entry) return;
      const cartao = chip.closest('.panel--mode');
      const modulo = cartao ? cartao.dataset.modulo : null;
      if (modulo && this._activeModulo !== modulo) {
        const btnAtivar = cartao.querySelector('.mode-activate-btn[data-modulo-ativar]');
        if (btnAtivar) this._alternarModulo(modulo, btnAtivar);
      }
      // Reaproveita a mesma seleção de sempre: busca o <li> que
      // representa essa substância na lista (pode não existir ainda
      // se o filtro de categoria da aba ativa não bater — nesse caso
      // simplesmente troca a substância sem destacar nenhum <li>).
      const liExistente = Array.from(document.querySelectorAll('#sub-list .sub-item'))
        .find((li) => li.querySelector('.si-formula')?.textContent === entry.formula);
      if (liExistente) {
        this._selectEntry(entry, liExistente);
      } else {
        // Substância filtrada para fora da aba de categoria atual:
        // volta a aba para "Todas" e tenta de novo.
        const tabTodas = document.querySelector('#sub-cat-tabs .mol-cat-btn[data-cat="all"]');
        if (tabTodas) tabTodas.click();
        const li = Array.from(document.querySelectorAll('#sub-list .sub-item'))
          .find((el) => el.querySelector('.si-formula')?.textContent === entry.formula);
        if (li) this._selectEntry(entry, li);
      }
    });
  });

  // Estado inicial: nenhum módulo ativo → sidebar direita começa trancada.
  this._atualizarTrancaSidebarDireita();
};
