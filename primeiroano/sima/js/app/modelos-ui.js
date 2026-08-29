/* ═══════════════════════════════════════════════════════════════
   CAMADA: APLICAÇÃO — Ativação/sincronização dos modelos
   ARQUIVO: modelos-ui.js
   ───────────────────────────────────────────────────────────────
   Ativa/desativa o modelo atômico corrente, mantém os cartões da
   sidebar esquerda sincronizados com o modelo ativo, atualiza a
   pílula indicadora sobre o canvas e os seletores de camada do
   Bohr (De/Para).
   Adiciona a AtomicApp.prototype: clearModel, _syncModelPanels,
   _updateOverlay, _updateBohrShellSelectors.
   Depende de: app/atomic-app-core.js, core/dados.js (SHELLS).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── DESATIVAR o modelo — canvas volta ao estado puro, o mesmo em que o
     SIMA agora abre (sim.model = null). Nada e desenhado porque os tres
     switch(this.model) de rebuild/update/draw nao casam nenhum case.
     Mesmo contrato de toggle do SILQ (setMode / clearMode). ── */
  AtomicApp.prototype.clearModel = function() {
    playTone(420, .06, .05);
    this.sim.model = null;
    // desliga eventuais easter eggs que pertencem a um modelo especifico
    this.sim.ruthEggMode = false;
    this.sim.bohrEggMode = false;
    document.querySelectorAll('[data-model]').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    // Sem restricao historica de ano: a tabela volta com os 118 elementos
    // (MODEL_YEAR[null] e undefined, e o ?? 9999 ja cobre esse caso).
    const busca = document.getElementById('pt-search');
    this._buildPeriodicTable(busca ? busca.value : '');
    this._updateOverlay();
    this._updateElementUI();
    this._syncModelPanels();
    announce('Modelo desativado. Canvas em branco — escolha um modelo e ative-o para voltar a simular.');
  };

  /* Painéis que só fazem sentido com um modelo ativo.

     O painel "Sobre o Modelo" foi REMOVIDO da sidebar direita: ele repetia
     o <p class="mode-define"> que cada card de modelo (sidebar esquerda) já
     mostra, e o card só é relevante quando o modelo está ativo — que era
     exatamente o caso em que esse painel tinha o que dizer.
     O convite do estado "sem modelo" continua sendo dado pelo #canvas-hint,
     sobre o canvas em branco (última linha deste método). */
  AtomicApp.prototype._syncModelPanels = function() {
    const m = this.sim.model;
    const proj = document.getElementById('body-projection');
    if (proj && proj.closest('.panel')) proj.closest('.panel').hidden = (m !== 'quantum');
    ['egg-panel-rutherford', 'egg-panel-bohr'].forEach(id => {
      const p = document.getElementById(id);
      if (p && !m) p.hidden = true;
    });
    const hint = document.getElementById('canvas-hint');
    if (hint) hint.hidden = !!m;
  };

  AtomicApp.prototype._updateOverlay = function() {
    const MNAMES={dalton:'Dalton',thomson:'Thomson',rutherford:'Rutherford',bohr:'Bohr',quantum:'Quântico'};
    // mesmos icones SVG do .panel-icon de cada painel de modelo (ver <defs>
    // de <symbol> no topo do indexsima.html), para a pilula do canvas casar
    // visualmente com o menu de modulos (padrao SILQ). Substituiu os
    // emojis que existiam aqui antes — ver ic.innerHTML abaixo.
    const MICONS={
      dalton:'<svg class="icon" aria-hidden="true"><use href="#ic-dalton"/></svg>',
      thomson:'<svg class="icon" aria-hidden="true"><use href="#ic-thomson"/></svg>',
      rutherford:'<svg class="icon" aria-hidden="true"><use href="#ic-rutherford"/></svg>',
      bohr:'<svg class="icon" aria-hidden="true"><use href="#ic-bohr"/></svg>',
      quantum:'<svg class="icon" aria-hidden="true"><use href="#ic-quantum"/></svg>',
    };
    const[Z,,name]=this.sim.elData;
    const txt=document.getElementById('overlay-text');
    const ico=document.getElementById('overlay-icon');
    const ind=document.getElementById('mode-indicator');
    // Sem modelo ativo a pilula desaparece — canvas puro, como no SILQ.
    if (ind) ind.classList.toggle('mode-on', !!this.sim.model);
    if (!this.sim.model) { if (ind) ind.dataset.mode=''; return; }
    if (txt) {
      txt.textContent=`${MNAMES[this.sim.model]} ativo`;
      const sp=document.createElement('span');
      sp.className='overlay-detail';
      sp.textContent=` · ${name} (Z=${Z})`;
      txt.appendChild(sp);
    }
    if (ico) ico.innerHTML=MICONS[this.sim.model]||'';
    // data-mode pinta a pilula com a cor do modelo, as mesmas 5 cores do menu
    if (ind) ind.dataset.mode=this.sim.model||'';
  };

  // ── Seletores de camada do Bohr (subir/retornar) ───────────────
  AtomicApp.prototype._updateBohrShellSelectors = function() {
    const ns = Math.min(this.sim.electrons.length, 7);
    const fromSel = document.getElementById('bohr-from-shell');
    const toSel   = document.getElementById('bohr-to-shell');
    if (!fromSel || !toSel) return;
    fromSel.innerHTML=''; toSel.innerHTML='';
    for (let s=0;s<ns;s++) {
      const optF=document.createElement('option'); optF.value=s; optF.textContent=SHELLS[s];
      fromSel.appendChild(optF);
      const optT=document.createElement('option'); optT.value=s; optT.textContent=SHELLS[s];
      toSel.appendChild(optT);
    }
    if (ns>1) toSel.value = 1;
  };

