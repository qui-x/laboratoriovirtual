/* ═══════════════════════════════════════════════════════════════
   CAMADA: DADOS (constantes de referência)
   ARQUIVO: estados-e-fenomenos.js
   ───────────────────────────────────────────────────────────────
   Vocabulário dos 3 estados físicos (nome, ícone, descrição) e dos
   6 fenômenos de mudança de estado (fusão, solidificação,
   vaporização, condensação, sublimação, ressublimação).
   Depende de: nada.
   Usado por: ui/render-cilindro.js, ui/render-medidas.js,
              core/fisica.js (detectarFenomeno).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── ESTADOS FÍSICOS ─── */
var ESTADOS = {
  SOLIDO:  { id:'solido',  nome:'Sólido',  icone:'❄️', descricao:'Forma e volume definidos. Não precisa de recipiente.' },
  LIQUIDO: { id:'liquido', nome:'Líquido', icone:'💧', descricao:'Volume definido, forma variável. Adapta-se ao recipiente.' },
  GASOSO:  { id:'gasoso',  nome:'Gasoso',  icone:'💨', descricao:'Sem forma nem volume definidos. Preenche todo o espaço disponível.' },
};

/* ─── FENÔMENOS ─── */
var FENOMENOS = {
  FUSAO:        { nome:'Fusão',         descricao:'Sólido → Líquido', emoji:'🔥', cor:'#FF8C00' },
  SOLIDIFICACAO:{ nome:'Solidificação', descricao:'Líquido → Sólido', emoji:'🧊', cor:'#00D4FF' },
  VAPORIZACAO:  { nome:'Vaporização',   descricao:'Líquido → Gasoso', emoji:'♨️', cor:'#FF4500' },
  CONDENSACAO:  { nome:'Condensação',   descricao:'Gasoso → Líquido', emoji:'🌫️', cor:'#7C3AED' },
  SUBLIMACAO:   { nome:'Sublimação',    descricao:'Sólido → Gasoso',  emoji:'✨', cor:'#EC4899' },
  RESSUBLIMACAO:{ nome:'Ressublimação', descricao:'Gasoso → Sólido',  emoji:'❄️', cor:'#06B6D4' },
};
