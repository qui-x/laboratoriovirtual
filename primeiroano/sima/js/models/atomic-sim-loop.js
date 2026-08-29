/* ═══════════════════════════════════════════════════════════════
   CAMADA: MODELOS FÍSICOS — orquestração da simulação
   ARQUIVO: atomic-sim-loop.js
   ───────────────────────────────────────────────────────────────
   update() e draw() são os despachantes chamados a cada frame:
   olham this.model e chamam o método de update/draw do modelo
   ativo (Dalton, Thomson, Rutherford, Bohr ou Quantum — cada um
   definido nos outros arquivos de models/). Também traz duas
   funções pequenas usadas por vários modelos ao desenhar
   (_hexToRgbStr, _legend).
   ⚠ Este arquivo deve carregar DEPOIS de todos os outros arquivos
   de models/, já que update()/draw() só fazem sentido quando os
   métodos de update/draw de cada modelo já foram adicionados — mas
   por serem apenas ATRIBUIÇÕES ao protótipo (não chamadas), a
   ordem exata só importa antes da simulação realmente começar a
   rodar, o que só acontece no primeiro requestAnimationFrame.
   Adiciona a AtomicSim.prototype: update, draw, _hexToRgbStr,
   _legend.
   Depende de: models/atomic-sim-core.js.
═══════════════════════════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════════════════════════════════
  // LOOP PRINCIPAL
  // ════════════════════════════════════════════════════════════════
  AtomicSim.prototype.update = function() {
    this.t++;
    switch(this.model) {
      case 'dalton':     this._updateDalton();     break;
      case 'thomson':    this._updateThomson();     break;
      case 'rutherford': this._updateRutherford();  break;
      case 'bohr':       this._updateBohr();        break;
      case 'quantum':    this._updateQuantum();     break;
    }
  };

  AtomicSim.prototype.draw = function() {
    const ctx=this.ctx, W=this.canvas.width, H=this.canvas.height;
    ctx.clearRect(0,0,W,H);
    switch(this.model) {
      case 'dalton':     this._drawDalton(ctx,W,H);     break;
      case 'thomson':    this._drawThomson(ctx,W,H);    break;
      case 'rutherford': this._drawRutherford(ctx,W,H); break;
      case 'bohr':       this._drawBohr(ctx,W,H);       break;
      case 'quantum':    this._drawQuantum(ctx,W,H);    break;
    }
  };

  /** Converte #rrggbb em "r,g,b" para montar rgba() dinamicamente —
   * mesmo utilitário hexToRgb usado internamente pelo SITP. */
  AtomicSim.prototype._hexToRgbStr = function(hex) {
    const h = (hex||'#f59e0b').replace('#','');
    if (h.length<6) return '245,158,11';
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    return `${r},${g},${b}`;
  };

  AtomicSim.prototype._legend = function(ctx,H,text){
    ctx.fillStyle='rgba(122,154,181,.42)'; ctx.font='11px Consolas'; ctx.fillText(text,14,H-12);
  };

