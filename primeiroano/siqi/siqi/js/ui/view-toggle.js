/* ═══════════════════════════════════════════════════════════════
   CAMADA: INTERFACE
   ARQUIVO: view-toggle.js
   ───────────────────────────────────────────────────────────────
   Alterna entre as views centrais do simulador (nenhum módulo, Lab,
   Ficha, Construtor) — expõe window._setView() para os
   botões inline "Voltar ao Laboratório" no HTML.
   Depende de: nada além do HTML.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════════
   12. TOGGLE LAB / FICHA
════════════════════════════════════════════════════════════════ */
function initViewToggle(){
  var btnLab=$('view-lab-btn'), btnInfo=$('view-info-btn');
  var panelNone=$('panel-none'), panelLab=$('panel-lab'), panelInfo=$('panel-info'), panelConstrutor=$('panel-construtor');
  if(!btnLab||!btnInfo) return;

  /* setView agora suporta 'none' | 'lab' | 'info' | 'construtor'.
     'none' é o estado inicial (réplica do canvas em branco do SIMA
     quando sim.model===null): nenhum módulo ativo, dica central
     convidando a escolher um. trocarModulo()/desativarModulo() cuidam
     de trocar para/desta view automaticamente — ver seção 7.1. */
  function setView(v){
    STATE.modoView=v;
    var isLab=v==='lab', isInfo=v==='info', isNone=v==='none', isConstrutor=v==='construtor';
    btnLab.classList.toggle('active',isLab);   btnLab.setAttribute('aria-pressed',String(isLab));
    btnInfo.classList.toggle('active',isInfo); btnInfo.setAttribute('aria-pressed',String(isInfo));
    if(panelNone) panelNone.hidden=!isNone;
    if(panelLab) panelLab.hidden=!isLab;
    if(panelInfo) panelInfo.hidden=!isInfo;
    if(panelConstrutor) panelConstrutor.hidden=!isConstrutor;
  }
  btnLab.addEventListener('click',function(){ setView('lab'); });
  btnInfo.addEventListener('click',function(){
    /* Se composto atual está bloqueado, ir para desafio de nomenclatura */
    if(STATE.compostoAtual && !estaDesbloqueado(STATE.compostoAtual) && COMPOSTOS[STATE.compostoAtual]){
      _limparPainelFicha(STATE.compostoAtual);
      _mostrarDesafio(STATE.compostoAtual);
    } else {
      setView('info');
    }
  });

  /* Expõe setView globalmente para carregarComposto e iniciarExp */
  window._setView = setView;
}

