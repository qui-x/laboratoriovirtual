/* ═══════════════════════════════════════════════════════════════
   CAMADA: MÓDULO 3 — HIBRIDIZAÇÃO DE NUVENS ELETRÔNICAS
   ARQUIVO: logica.js
   ───────────────────────────────────────────────────────────────
   Substitui o antigo módulo de Redox. Mesmo padrão de 3 camadas dos
   outros módulos (seletor → controles/lista na lateral → análise
   completa gerada no centro), mas o seletor lateral agora organiza
   por TIPO DE HIBRIDIZAÇÃO (sp/sp²/sp³/sp³d/sp³d²) em vez de
   dificuldade — mais direto pro tema do módulo: navegar "todos os
   exemplos de sp²" ajuda a fixar o padrão melhor do que misturar
   tipos dentro de um nível de dificuldade.

   A análise central reaproveita o motor 2D do SILQ
   (desenharSILQ2D, já usado na pista visual da Nomenclatura) pra
   mostrar a estrutura de verdade ao lado da contagem de domínios —
   mesma integração entre simuladores da plataforma, sem duplicar
   motor de desenho nenhum.

   Depende de: data/hibridizacoes-nuvens.js,
               render/silq-integracao.js (silqConstruirMolecula),
               render/silq-2d-preview.js (desenharSILQ2D).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── 7.3 Módulo 3 — Hibridização de Nuvens Eletrônicas ─────────── */
var _modHTipos = [
  { id:'todos', label:'Todos' },
  { id:'sp',    label:'sp' },
  { id:'sp2',   label:'sp²' },
  { id:'sp3',   label:'sp³' },
  { id:'sp3d',  label:'sp³d' },
  { id:'sp3d2', label:'sp³d²' },
];
var _modHTipoAtual = 'todos';
var _modHIniciado = false;
var _modHAtual = null;

var MODH_LABEL_GEOMETRIA = {
  'Linear':'Linear', 'Trigonal planar':'Trigonal planar', 'Tetraédrica':'Tetraédrica',
  'Bipirâmide trigonal':'Bipirâmide trigonal', 'Octaédrica':'Octaédrica',
  'Pirâmide trigonal':'Pirâmide trigonal', 'Angular':'Angular',
};

function modHMontarTipos(){
  var wrap = $('difficulty-selector');
  if(!wrap) return;
  wrap.innerHTML = '';
  wrap.setAttribute('role','tablist');
  wrap.setAttribute('aria-label','Tipo de hibridização');
  _modHTipos.forEach(function(t){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diff-btn' + (t.id === _modHTipoAtual ? ' diff-btn--active' : '');
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', t.id === _modHTipoAtual ? 'true' : 'false');
    btn.textContent = t.label;
    btn.addEventListener('click', function(){ modHMudaTipo(t.id); });
    wrap.appendChild(btn);
  });
}

function modHMudaTipo(tipo){
  _modHTipoAtual = tipo;
  document.querySelectorAll('#difficulty-selector .diff-btn').forEach(function(b,i){
    var ativo = _modHTipos[i].id === tipo;
    b.classList.toggle('diff-btn--active', ativo);
    b.setAttribute('aria-selected', ativo ? 'true' : 'false');
  });
  modHRenderLista();
}

function modHRenderLista(){
  var listDiv = $('redox-reactions-list');
  if(!listDiv) return;
  var itens = HIBRIDIZACOES_NUVENS.filter(function(h){
    return _modHTipoAtual === 'todos' || h.hibridizacao === _modHTipoAtual;
  });

  listDiv.innerHTML = '';
  listDiv.setAttribute('role','listbox');
  listDiv.setAttribute('aria-label','Compostos de hibridização ' + _modHTipoAtual);

  if(itens.length === 0){
    var vazio = document.createElement('p');
    vazio.className = 'no-results';
    vazio.textContent = 'Nenhum composto disponível neste tipo ainda.';
    listDiv.appendChild(vazio);
    return;
  }

  var LABEL_HIB = { sp:'sp', sp2:'sp²', sp3:'sp³', sp3d:'sp³d', sp3d2:'sp³d²' };
  itens.forEach(function(h){
    var item = document.createElement('div');
    item.className = 'redox-reaction-item';
    item.setAttribute('role','option');
    item.setAttribute('tabindex','0');
    item.setAttribute('aria-selected','false');
    item.innerHTML =
      '<div class="reaction-head">'+
        '<span class="reaction-num">'+LABEL_HIB[h.hibridizacao]+'</span>'+
        '<span class="reaction-diff">'+h.nivel+'</span>'+
      '</div>'+
      '<div class="reaction-title">'+h.nome+'</div>'+
      '<code class="reaction-eq">'+h.formula+'</code>'+
      '<p class="reaction-desc">Átomo central: '+h.atomoCentral+' · '+h.nDominios+' domínios · '+h.geometriaMolecular+'</p>';

    function selecionar(){
      listDiv.querySelectorAll('.redox-reaction-item').forEach(function(el){ el.setAttribute('aria-selected','false'); });
      item.setAttribute('aria-selected','true');
      modHSelecionaComposto(h);
    }
    item.addEventListener('click', selecionar);
    item.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selecionar(); }
    });
    listDiv.appendChild(item);
  });
}

function modHSelecionaComposto(h){
  _modHAtual = h;
  modHRenderDetalhe(h);
  if(window._setView) window._setView('redox');
  srAnnounce('Composto ' + h.nome + ' carregado. Analise os domínios eletrônicos e a hibridização.');
}

/* Renderiza a análise completa — mesmo padrão de 3 camadas dos
   outros módulos: a lateral (CONTROLE) mostra um resumo compacto; a
   área central (GERADO) recebe a análise completa, incluindo a
   estrutura 2D de verdade (motor do SILQ, reaproveitado da
   Nomenclatura) ao lado da contagem de domínios. */
function modHRenderDetalhe(h){
  var LABEL_HIB = { sp:'sp', sp2:'sp²', sp3:'sp³', sp3d:'sp³d', sp3d2:'sp³d²' };
  var hibLabel = LABEL_HIB[h.hibridizacao];

  var domHtml = '';
  for(var i=0;i<h.nSigma;i++) domHtml += '<span class="modh-dominio modh-dominio--ligante" title="Par ligante (ligação σ)">σ</span>';
  for(var j=0;j<h.nPares;j++) domHtml += '<span class="modh-dominio modh-dominio--par" title="Par isolado">••</span>';

  var geometriasIguais = h.geometriaEletronica === h.geometriaMolecular;

  var corpoDetalhe =
      '<p class="redox-subhead">Contagem de domínios eletrônicos (regra VSEPR)</p>'+
      '<div class="modh-dominios-wrap">'+
        '<span class="modh-dominios-central">'+h.atomoCentral+'</span>'+
        '<div class="modh-dominios-lista">'+domHtml+'</div>'+
      '</div>'+
      '<p class="modh-dominios-formula">'+h.nSigma+' ligante(s) σ + '+h.nPares+' par(es) isolado(s) = <strong>'+h.nDominios+' domínios</strong></p>'+

      '<p class="redox-subhead">Hibridização resultante</p>'+
      '<div class="modh-hib-destaque">'+
        '<span class="modh-hib-tipo">'+hibLabel+'</span>'+
        '<span class="modh-hib-seta">→</span>'+
        '<span class="modh-hib-geo">'+h.geometriaEletronica+'</span>'+
      '</div>'+

      '<p class="redox-subhead">Como os orbitais se misturam</p>'+
      '<div class="orb-diagrama-wrap"><div id="modh-orbitais" class="orb-diagrama-canvas"></div></div>'+

      '<p class="redox-subhead">Geometria eletrônica × geometria molecular</p>'+
      '<div class="modh-geo-compara">'+
        '<div class="modh-geo-item"><span class="modh-geo-label">Nuvem eletrônica (domínios)</span><span class="modh-geo-val">'+h.geometriaEletronica+'</span></div>'+
        '<div class="modh-geo-item"><span class="modh-geo-label">Forma observada (só átomos)</span><span class="modh-geo-val'+(geometriasIguais?'':' modh-geo-val--diff')+'">'+h.geometriaMolecular+'</span></div>'+
      '</div>'+
      (geometriasIguais ? '' :
        '<p class="modh-geo-nota">Diferentes porque há par(es) isolado(s) no átomo central — eles ocupam espaço na nuvem eletrônica, mas não aparecem como "vértice" na forma observada.</p>') +

      '<p class="redox-subhead">Ângulo de ligação</p>'+
      '<p class="modh-angulo">Ideal (VSEPR): <strong>'+h.anguloIdeal+'°</strong>'+
        (h.anguloReal !== h.anguloIdeal ? ' · Medido na literatura: <strong>'+h.anguloReal+'°</strong>' : '') +
      '</p>'+

      '<p class="redox-subhead">O que está acontecendo nos orbitais</p>'+
      '<p class="modh-explicacao">'+h.explicacaoOrbitais+'</p>'+

      '<p class="redox-application"><strong>Aplicação:</strong> '+h.aplicacao+'</p>'+
      '<p class="redox-fonte"><strong>Fonte:</strong> '+h.fonte+'</p>';

  /* ── Central (GERADO): hero + estrutura 2D real (motor do SILQ) + análise ── */
  var central = $('redox-central-content');
  if(central){
    central.innerHTML =
      '<div class="redox-hero">'+
        '<p class="redox-hero-label">'+h.nivel+' · hibridização '+hibLabel+'</p>'+
        '<h2 class="redox-hero-title">'+h.nome+' <code class="modh-hero-formula">'+h.formula+'</code></h2>'+
        '<p class="redox-hero-desc">Átomo central: <strong>'+h.atomoCentral+'</strong> — '+h.nDominios+' domínios eletrônicos → hibridização <strong>'+hibLabel+'</strong></p>'+
      '</div>'+
      '<div class="modh-estrutura-wrap">'+
        '<p class="ficha-section-label">Estrutura <span class="silq-selo" title="Renderizado no estilo do SILQ">via SILQ</span></p>'+
        '<div id="modh-lewis-2d" class="silq2d-canvas"></div>'+
      '</div>'+
      '<div class="redox-detail redox-detail--central">'+corpoDetalhe+'</div>';

    /* Desenha a estrutura DEPOIS do innerHTML existir no DOM — mesmo
       cuidado de timing já resolvido antes pro visualizador 3D da
       Ficha (ver silq-integracao.js): sem o setTimeout, o container
       podia ainda não ter layout "assentado" no instante da medição. */
    setTimeout(function(){
      var lewDiv = document.getElementById('modh-lewis-2d');
      if(lewDiv && typeof desenharMoleculaHibridizacao === 'function'){
        desenharMoleculaHibridizacao(h, lewDiv);
      }
      var orbDiv = document.getElementById('modh-orbitais');
      if(orbDiv && typeof desenharDiagramaHibridizacao === 'function'){
        desenharDiagramaHibridizacao(orbDiv, h.hibridizacao);
      }
    }, 50);
  }

  /* ── Lateral (CONTROLE): resumo compacto ── */
  var painel = $('redox-detail-panel');
  if(painel){
    painel.hidden = false;
    painel.innerHTML =
      '<div class="redox-detail redox-detail--sidebar">'+
        '<p class="redox-resumo">✓ <strong>'+h.nome+'</strong> selecionado — a análise completa (domínios, hibridização, geometria) está na área central. →</p>'+
        '<code class="redox-eq-block redox-eq-final">'+hibLabel+' · '+h.geometriaMolecular+'</code>'+
      '</div>';
  }
}

/* ── Construtor de estrutura DIRETO a partir dos próprios dados de
   HIBRIDIZACOES_NUVENS (nSigma/nPares já contados à mão em cada
   entrada) — em vez de reaproveitar o despachante de
   silqConstruirMolecula() (que decide a receita certa consultando
   `c.funcao` acido/base/sal/óxido, categorias da Nomenclatura que não
   fazem sentido pra vários compostos deste módulo: BeCl₂/BF₃/CH₄/
   PCl₅/SF₆ não são ácido nem óxido nenhum). Bug real, achado ANTES de
   testar: tentar inferir `funcao` a partir só da fórmula classificava
   BeCl₂ (sem oxigênio nenhum) como "óxido" por falta de opção melhor,
   e o despachante acabava desenhando um par iônico Be²⁺⋯Cl⁻ em vez da
   molécula COVALENTE linear que o exemplo pedagógico pede. Como este
   módulo já sabe exatamente quantos vizinhos o átomo central tem
   (nSigma), constrói a topologia direto — sem precisar adivinhar
   função química nenhuma. ── */
function modHConstruirEstrutura(h){
  var tokens = (typeof silqParseFormula === 'function') ? silqParseFormula(h.formulaId) : [];
  var vizinhos = tokens.filter(function(t){ return t.simbolo !== h.atomoCentral; });

  var atoms = [], bonds = [];
  function novoAtomo(elemento){
    var a = { id: 'modh_' + atoms.length, element: elemento, x:0, y:0, charge:0 };
    atoms.push(a);
    return a;
  }

  var central = novoAtomo(h.atomoCentral);

  /* Caso especial: moléculas orgânicas com 2 carbonos ligados entre si
     (C₂H₂, C₂H₄) — aqui "nSigma" descreve UM dos carbonos (ligações
     dele: 1 pro outro C + os H dele), não "central + N vizinhos
     terminais" como nos outros casos. Tratado à parte pra não
     distribuir H's no carbono errado. */
  if(h.formulaId === 'C2H2' || h.formulaId === 'C2H4'){
    var c2 = novoAtomo('C');
    var ordemCC = h.formulaId === 'C2H2' ? 3 : 2; // tripla no etino, dupla no eteno
    bonds.push({ a: central.id, b: c2.id, order: ordemCC, type: 'covalent' });
    var nH = h.formulaId === 'C2H2' ? 1 : 2; // H por carbono
    for(var k=0;k<nH;k++){
      var hAt1 = novoAtomo('H'); bonds.push({ a: central.id, b: hAt1.id, order:1, type:'covalent' });
      var hAt2 = novoAtomo('H'); bonds.push({ a: c2.id, b: hAt2.id, order:1, type:'covalent' });
    }
    return { atoms: atoms, bonds: bonds };
  }

  /* Caso especial: oxiácidos onde o(s) H fica(m) pendurado(s) num
     OXIGÊNIO periférico, não ligado direto ao átomo central (HNO₃,
     H₂SO₄, H₃PO₄ deste conjunto de dados) — o construtor genérico
     abaixo distribuiria o H como se fosse vizinho direto do átomo
     central, o que é quimicamente errado (P/N/S não se ligam a H
     nesses ácidos; quem se liga é o O). Detectado quando há H E O
     entre os vizinhos e o átomo central não é H nem O. */
  var temH = vizinhos.some(function(t){ return t.simbolo==='H'; });
  var temO = vizinhos.some(function(t){ return t.simbolo==='O'; });
  if(temH && temO && h.atomoCentral!=='H' && h.atomoCentral!=='O'){
    var nO = vizinhos.find(function(t){return t.simbolo==='O';}).qtd;
    var nHtok = vizinhos.find(function(t){return t.simbolo==='H';}).qtd;
    var comH = Math.min(nHtok, nO);
    for(var oi=0; oi<nO; oi++){
      var oAt = novoAtomo('O');
      bonds.push({ a: central.id, b: oAt.id, order: oi<comH?1:2, type:'covalent' });
      if(oi < comH){
        var hAt = novoAtomo('H');
        bonds.push({ a: oAt.id, b: hAt.id, order:1, type:'covalent' });
      }
    }
    return { atoms: atoms, bonds: bonds };
  }

  /* Caso geral: átomo central + nSigma vizinhos, distribuídos a partir
     dos átomos realmente presentes na fórmula (fora o próprio
     central). Ordem de ligação simples (1) pra todos — o objetivo
     aqui é mostrar a TOPOLOGIA/geometria certa pro preview 2D, não
     replicar simples/dupla/tripla com precisão (isso já é explicado
     em texto na "explicação dos orbitais" de cada composto). */
  var restam = h.nSigma;
  vizinhos.forEach(function(tok){
    for(var i=0;i<tok.qtd && restam>0;i++){
      var v = novoAtomo(tok.simbolo);
      bonds.push({ a: central.id, b: v.id, order:1, type:'covalent' });
      restam--;
    }
  });
  return { atoms: atoms, bonds: bonds };
}

function desenharMoleculaHibridizacao(h, container){
  if(!container) return;
  container.innerHTML = '<svg class="silq2d-bonds"></svg>';
  var svg = container.querySelector('.silq2d-bonds');
  var rect = container.getBoundingClientRect();
  var W = rect.width || 360, H = rect.height || 200;
  svg.setAttribute('viewBox', '0 0 '+W+' '+H);
  var grupo = document.createElementNS('http://www.w3.org/2000/svg','g');
  grupo.setAttribute('transform', 'translate('+(W/2)+','+(H/2)+')');
  svg.appendChild(grupo);

  var molecula;
  try { molecula = modHConstruirEstrutura(h); } catch(err){ molecula = { atoms:[], bonds:[] }; }
  if(!molecula.atoms.length) return;

  var pos = silq2DCalcularLayout(molecula.atoms, molecula.bonds);
  molecula.bonds.forEach(function(b){
    var pa = pos.get(b.a), pb = pos.get(b.b);
    if(!pa || !pb) return;
    silq2DRenderLigacao(grupo, pa[0], pa[1], pb[0], pb[1], b.order, b.type);
  });
  molecula.atoms.forEach(function(a){
    var p = pos.get(a.id); if(!p) return;
    silq2DRenderAtomo(container, a, p[0], p[1]);
  });
}

function initModulo3(){
  if(_modHIniciado) return;
  if(typeof HIBRIDIZACOES_NUVENS === 'undefined'){
    console.error('[moduloHibridizacao] HIBRIDIZACOES_NUVENS não definido — verifique js/data/hibridizacoes-nuvens.js.');
    return;
  }
  _modHIniciado = true;
  modHMontarTipos();
  modHRenderLista();
}
