/* ═══════════════════════════════════════════════════════════════
   CAMADA: MÓDULO 3 — HIBRIDIZAÇÃO DE NUVENS ELETRÔNICAS
   ARQUIVO: animacao.js
   ───────────────────────────────────────────────────────────────
   Controlador da animação "orbitais puros → orbitais híbridos" —
   pedido explícito do usuário: "gatilhos que disparem uma animação
   controlada", com um "menu recolhível na direita" pros controles.

   Mantém um `progresso` (0 a 1) e avança ele com um loop de
   requestAnimationFrame quando "tocando", redesenhando o SVG a cada
   frame via desenharOrbitaisAnimado() (js/render/orbitais-atomicos.js
   — este arquivo só CONTROLA o progresso, não sabe desenhar nada).

   Depende de: js/render/orbitais-atomicos.js (desenharOrbitaisAnimado).
   Usado por: js/hibridizacao/logica.js (cria os botões de controle),
              indexsiqi.html (painel "Controles da Animação").
═══════════════════════════════════════════════════════════════ */

'use strict';

var _modHAnim = {
  progresso: 0,
  tocando: false,
  velocidade: 1,      // multiplicador: 0.5=lento, 1=normal, 2=rápido
  tipoAtual: null,
  container: null,
  rafId: null,
  ultimoTs: null,
  duracaoBaseMs: 2200, // tempo pra progresso ir de 0 a 1 na velocidade normal
};

/* Easing suave (ease-in-out cúbico) — a transição parece mais
   natural do que avançar o progresso em velocidade constante. */
function _modHEaseInOut(t){
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

function _modHAnimRedesenhar(){
  if(!_modHAnim.container || !_modHAnim.tipoAtual) return;
  var progressoSuave = _modHEaseInOut(_modHAnim.progresso);
  if(typeof desenharOrbitaisAnimado === 'function'){
    desenharOrbitaisAnimado(_modHAnim.container, _modHAnim.tipoAtual, progressoSuave);
  }
  modHAnimAtualizarControlesUI();
}

function _modHAnimLoop(ts){
  if(!_modHAnim.tocando) return;
  if(_modHAnim.ultimoTs === null) _modHAnim.ultimoTs = ts;
  var delta = ts - _modHAnim.ultimoTs;
  _modHAnim.ultimoTs = ts;

  var incremento = (delta / _modHAnim.duracaoBaseMs) * _modHAnim.velocidade;
  _modHAnim.progresso = Math.min(1, _modHAnim.progresso + incremento);
  _modHAnimRedesenhar();

  if(_modHAnim.progresso >= 1){
    modHAnimPausar();
    srAnnounce('Hibridização completa — orbitais híbridos formados.');
    return;
  }
  _modHAnim.rafId = requestAnimationFrame(_modHAnimLoop);
}

/* ── API pública — chamada pelos botões do painel de controles ── */

/* Prepara uma NOVA animação pro composto selecionado (chamado pelo
   logica.js sempre que o usuário escolhe um composto diferente).
   Começa pausada, no quadro inicial (orbitais puros, progresso=0). */
function modHAnimPreparar(container, tipoHibridizacao){
  modHAnimPausar();
  _modHAnim.container = container;
  _modHAnim.tipoAtual = tipoHibridizacao;
  _modHAnim.progresso = 0;
  _modHAnim.ultimoTs = null;
  _modHAnimRedesenhar();
}

function modHAnimTocar(){
  if(_modHAnim.tocando || !_modHAnim.tipoAtual) return;
  if(_modHAnim.progresso >= 1) _modHAnim.progresso = 0; // reinicia se já tinha terminado
  _modHAnim.tocando = true;
  _modHAnim.ultimoTs = null;
  _modHAnim.rafId = requestAnimationFrame(_modHAnimLoop);
  modHAnimAtualizarControlesUI();
}

function modHAnimPausar(){
  _modHAnim.tocando = false;
  if(_modHAnim.rafId) cancelAnimationFrame(_modHAnim.rafId);
  _modHAnim.rafId = null;
  modHAnimAtualizarControlesUI();
}

function modHAnimReiniciar(){
  modHAnimPausar();
  _modHAnim.progresso = 0;
  _modHAnimRedesenhar();
}

/* Avança/volta em incrementos fixos — pro usuário conferir uma etapa
   específica da mistura sem precisar acertar o play/pause no
   momento exato (controle fino, pedido junto com o play contínuo). */
function modHAnimEtapa(direcao){
  modHAnimPausar();
  _modHAnim.progresso = Math.max(0, Math.min(1, _modHAnim.progresso + direcao*0.2));
  _modHAnimRedesenhar();
}

function modHAnimSetVelocidade(v){
  _modHAnim.velocidade = v;
  modHAnimAtualizarControlesUI();
}

/* Sincroniza os controles (botão play/pause, barra de progresso,
   velocidade) com o estado atual — chamado a cada frame e sempre que
   o estado muda por outro caminho (preparar/reiniciar/etapa). */
function modHAnimAtualizarControlesUI(){
  var textoBtn = _modHAnim.tocando ? '⏸ Pausar' : (_modHAnim.progresso >= 1 ? '↺ Reiniciar e tocar' : '▶ Iniciar hibridização');
  ['modh-anim-play', 'modh-anim-play-central'].forEach(function(id){
    var btn = document.getElementById(id);
    if(btn){
      btn.textContent = textoBtn;
      btn.setAttribute('aria-pressed', _modHAnim.tocando ? 'true' : 'false');
    }
  });
  var barra = document.getElementById('modh-anim-progresso');
  if(barra){
    barra.style.width = (_modHAnim.progresso*100).toFixed(1)+'%';
  }
  var barraWrap = document.getElementById('modh-anim-progresso-wrap');
  if(barraWrap) barraWrap.setAttribute('aria-valuenow', Math.round(_modHAnim.progresso*100));
  document.querySelectorAll('.modh-anim-vel-btn').forEach(function(b){
    b.classList.toggle('modh-anim-vel-btn--ativo', parseFloat(b.dataset.vel) === _modHAnim.velocidade);
  });
}

/* Clicar direto numa posição da barra de progresso pula pra lá
   (scrubbing) — útil pra "voltar e ver de novo" uma etapa específica. */
function modHAnimClicarBarra(evt){
  var wrap = document.getElementById('modh-anim-progresso-wrap');
  if(!wrap) return;
  modHAnimPausar();
  var rect = wrap.getBoundingClientRect();
  var fracao = (evt.clientX - rect.left) / rect.width;
  _modHAnim.progresso = Math.max(0, Math.min(1, fracao));
  _modHAnimRedesenhar();
}
