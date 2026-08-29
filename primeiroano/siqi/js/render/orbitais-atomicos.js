/* ═══════════════════════════════════════════════════════════════
   CAMADA: RENDERIZAÇÃO
   ARQUIVO: orbitais-atomicos.js
   ───────────────────────────────────────────────────────────────
   Desenha as FORMAS REAIS dos orbitais atômicos (s esférico, p em
   halteres/"figura-8", d em folha-de-trevo) e o diagrama "orbitais
   puros → orbitais híbridos" que o módulo de Hibridização de Nuvens
   Eletrônicas usa — pedido explícito do usuário, mostrando imagem de
   referência com as formas espaciais de d e f.

   Convenção de cor (mesma da maioria dos livros-texto e da imagem de
   referência do usuário): os 2 lobos de um orbital p/d têm FASES
   opostas (sinal da função de onda) — azul/ciano para fase positiva,
   rosa/magenta para fase negativa. Já um orbital HÍBRIDO (resultado
   da mistura) é mostrado numa cor quente única (âmbar/coral) — ele
   não é "positivo" nem "negativo" isolado, é o orbital que a
   ligação química realmente usa.

   Cobre s/p/d (o que hibridização sp/sp²/sp³/sp³d/sp³d² precisa) —
   não cobre f (a imagem do usuário mostrava d E f, mas nenhuma
   hibridização usual em química geral/Ensino Médio usa orbital f).

   Depende de: nada (funções de desenho puras, sem estado).
   Usado por: js/hibridizacao/logica.js.
═══════════════════════════════════════════════════════════════ */

'use strict';

var ORBITAL_COR_POS = '#4FC3F7';  // fase positiva — azul/ciano (mesmo tom de bond-covalent)
var ORBITAL_COR_NEG = '#F06292';  // fase negativa — rosa/magenta
var ORBITAL_COR_HIBRIDO = '#FFAA44'; // orbital híbrido (resultado da mistura) — âmbar

function _svgOrb(tag, attrs){
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.keys(attrs).forEach(function(k){ el.setAttribute(k, attrs[k]); });
  return el;
}

var _orbGradientesCriados = {};
function _orbGarantirGradiente(svg, cor, id){
  var defs = svg.querySelector('defs');
  if(!defs){ defs = _svgOrb('defs',{}); svg.insertBefore(defs, svg.firstChild); }
  if(defs.querySelector('#'+id)) return id;
  var grad = _svgOrb('radialGradient', { id:id, cx:'50%', cy:'50%', r:'65%' });
  grad.appendChild(_svgOrb('stop', { offset:'0%', 'stop-color':'#ffffff', 'stop-opacity':'.75' }));
  grad.appendChild(_svgOrb('stop', { offset:'40%', 'stop-color':cor, 'stop-opacity':'.85' }));
  grad.appendChild(_svgOrb('stop', { offset:'100%', 'stop-color':cor, 'stop-opacity':'.35' }));
  defs.appendChild(grad);
  return id;
}

/* Um único "lobo" (forma de gota/pétala) apontando pra fora do centro
   (cx,cy), na direção `anguloGraus`, com comprimento `tamanho`. Usado
   sozinho pros orbitais híbridos (1 lobo grande + 1 pequeno) e em
   pares/quartetos pros orbitais p/d puros. */
function _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus, cor, largura){
  largura = largura || 0.62;
  var rad = anguloGraus * Math.PI / 180;
  var perpRad = rad + Math.PI/2;
  var ponta = { x: cx + Math.cos(rad)*tamanho, y: cy + Math.sin(rad)*tamanho };
  var meio = tamanho * 0.55;
  var larguraPx = tamanho * largura * 0.5;
  var c1 = { x: cx + Math.cos(rad)*meio + Math.cos(perpRad)*larguraPx, y: cy + Math.sin(rad)*meio + Math.sin(perpRad)*larguraPx };
  var c2 = { x: cx + Math.cos(rad)*meio - Math.cos(perpRad)*larguraPx, y: cy + Math.sin(rad)*meio - Math.sin(perpRad)*larguraPx };

  var gradId = 'orbgrad-' + cor.replace('#','');
  _orbGarantirGradiente(svg, cor, gradId);

  var d = 'M '+cx+','+cy+' Q '+c1.x+','+c1.y+' '+ponta.x+','+ponta.y+' Q '+c2.x+','+c2.y+' '+cx+','+cy+' Z';
  var path = _svgOrb('path', { d:d, fill:'url(#'+gradId+')', stroke:cor, 'stroke-width':'1', 'stroke-opacity':'.5' });
  grupo.appendChild(path);
}

/* Orbital s — esfera simples (sem nó angular, sempre 1 fase só). */
function orbDesenharS(svg, grupo, cx, cy, raio){
  var gradId = 'orbgrad-' + ORBITAL_COR_POS.replace('#','');
  _orbGarantirGradiente(svg, ORBITAL_COR_POS, gradId);
  grupo.appendChild(_svgOrb('circle', { cx:cx, cy:cy, r:raio, fill:'url(#'+gradId+')', stroke:ORBITAL_COR_POS, 'stroke-width':'1', 'stroke-opacity':'.5' }));
}

/* Orbital p — halteres: 2 lobos opostos, fases diferentes (uma das
   marcas registradas visuais da química quântica: p tem 1 nó
   angular, os 2 lados têm sinal oposto da função de onda). */
function orbDesenharP(svg, grupo, cx, cy, tamanho, anguloGraus){
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus, ORBITAL_COR_POS);
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus+180, ORBITAL_COR_NEG);
}

/* Orbital d — folha de trevo: 4 lobos a 90° um do outro, fases
   alternando (positivo/negativo/positivo/negativo ao redor) — forma
   característica de dxy/dxz/dyz/dx²-y² (a quinta, dz², tem uma forma
   diferente — halter + anel — simplificada aqui pro mesmo padrão de
   4 lobos, suficiente pro nível deste módulo). */
function orbDesenharD(svg, grupo, cx, cy, tamanho, anguloGraus){
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus,     ORBITAL_COR_POS, 0.5);
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus+90,  ORBITAL_COR_NEG, 0.5);
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus+180, ORBITAL_COR_POS, 0.5);
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus+270, ORBITAL_COR_NEG, 0.5);
}

/* Orbital híbrido — a MISTURA de s+p (ou s+p+d): 1 lobo grande + 1
   lobo pequeno do lado oposto, cor única (âmbar) — é isso que faz um
   orbital híbrido ser bom pra ligação química: toda a densidade
   eletrônica concentrada de UM lado, apontando pro átomo vizinho. */
function orbDesenharHibrido(svg, grupo, cx, cy, tamanho, anguloGraus){
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho, anguloGraus, ORBITAL_COR_HIBRIDO, 0.6);
  _orbDesenharLobo(svg, grupo, cx, cy, tamanho*0.32, anguloGraus+180, ORBITAL_COR_HIBRIDO, 0.6);
}

/* ════════════════════════════════════════════════════════════════
   RECEITA DE MISTURA por tipo de hibridização — quantos orbitais s/
   p/d puros entram, e quantos híbridos saem (sempre igual à soma).
════════════════════════════════════════════════════════════════ */
var RECEITA_HIBRIDIZACAO = {
  sp:    { s:1, p:1, d:0, resultado:2, anguloResultado:180 },
  sp2:   { s:1, p:2, d:0, resultado:3, anguloResultado:120 },
  sp3:   { s:1, p:3, d:0, resultado:4, anguloResultado:109.5 },
  sp3d:  { s:1, p:3, d:1, resultado:5, anguloResultado:120 },  // simplificado: mostra o plano equatorial (120°); os 2 axiais ficam implícitos no texto
  sp3d2: { s:1, p:3, d:2, resultado:6, anguloResultado:90 },
};

/* Desenha o diagrama "orbitais puros → orbitais híbridos" completo:
   esquerda = os orbitais ANTES de misturar (s + p's + d's, cada um
   um ícone separado), seta central, direita = os N orbitais híbridos
   resultantes, já apontando nos ângulos geométricos corretos (mesmo
   ângulo mostrado no resto da análise — sp linear, sp² trigonal,
   etc.), pra reforçar visualmente que a CONTAGEM bate: nº de
   orbitais que entram = nº de híbridos que saem. */
function desenharDiagramaHibridizacao(container, tipoHibridizacao){
  if(!container) return;
  var receita = RECEITA_HIBRIDIZACAO[tipoHibridizacao];
  if(!receita) return;

  var rect = container.getBoundingClientRect();
  var W = rect.width || 560, H = rect.height || 220;
  container.innerHTML = '<svg class="orb-diagrama-svg" viewBox="0 0 '+W+' '+H+'"></svg>';
  var svg = container.querySelector('.orb-diagrama-svg');

  var colunaEsquerdaX = W*0.20;
  var colunaSetaX = W*0.5;
  var colunaDireitaX = W*0.78;

  /* Reserva espaço fixo pro título de cima (~18px) e pra legenda de
     fase embaixo (~24px) ANTES de distribuir os itens — sem isso, o
     último orbital da coluna esquerda (quando há 4+ itens: 1s+3p,
     por exemplo) ficava espremido quase em cima da legenda de fase.
     Bug real, achado testando CH₄ (sp³) visualmente: o rótulo do 3º
     "p" praticamente colava no texto "fase +/−/híbrido". */
  var margemTopo = 22, margemBase = 26;
  var alturaUtil = H - margemTopo - margemBase;
  var centroUtilY = margemTopo + alturaUtil/2;

  /* ── Esquerda: orbitais puros, empilhados verticalmente ── */
  var puros = [];
  for(var i=0;i<receita.s;i++) puros.push({tipo:'s'});
  for(var j=0;j<receita.p;j++) puros.push({tipo:'p', angulo: j*45});
  for(var k=0;k<receita.d;k++) puros.push({tipo:'d', angulo: k*45+22});

  var alturaItem = Math.min(56, alturaUtil / puros.length);
  var yInicio = centroUtilY - (alturaItem*(puros.length-1))/2;
  puros.forEach(function(orb, idx){
    var y = yInicio + idx*alturaItem;
    var grupo = _svgOrb('g', {});
    svg.appendChild(grupo);
    var tam = alturaItem*0.34;
    if(orb.tipo === 's') orbDesenharS(svg, grupo, colunaEsquerdaX, y, tam*0.62);
    else if(orb.tipo === 'p') orbDesenharP(svg, grupo, colunaEsquerdaX, y, tam, orb.angulo);
    else orbDesenharD(svg, grupo, colunaEsquerdaX, y, tam*0.85, orb.angulo);

    var label = _svgOrb('text', { x:colunaEsquerdaX, y:y+alturaItem*0.48, 'text-anchor':'middle', fill:'var(--tx2)', 'font-size':'9' });
    label.textContent = orb.tipo==='s' ? 's' : orb.tipo==='p' ? 'p' : 'd';
    svg.appendChild(label);
  });

  var legendaEsq = _svgOrb('text', { x:colunaEsquerdaX, y:14, 'text-anchor':'middle', fill:'var(--tx2)', 'font-size':'9.5', 'font-weight':'700' });
  legendaEsq.textContent = 'Orbitais puros';
  svg.appendChild(legendaEsq);

  /* ── Centro: seta + fórmula da mistura ── */
  var formulaPartes = [];
  if(receita.s) formulaPartes.push(receita.s+'s');
  if(receita.p) formulaPartes.push(receita.p+'p');
  if(receita.d) formulaPartes.push(receita.d+'d');
  var formulaTxt = _svgOrb('text', { x:colunaSetaX, y:centroUtilY-18, 'text-anchor':'middle', fill:'var(--tx1)', 'font-size':'11', 'font-weight':'700', 'font-family':'var(--mono)' });
  formulaTxt.textContent = formulaPartes.join('+') + ' → ' + receita.resultado + tipoHibridizacaoLabel(tipoHibridizacao);
  svg.appendChild(formulaTxt);

  var seta = _svgOrb('path', { d:'M '+(colunaSetaX-34)+','+centroUtilY+' L '+(colunaSetaX+30)+','+centroUtilY+' M '+(colunaSetaX+18)+','+(centroUtilY-8)+' L '+(colunaSetaX+30)+','+centroUtilY+' L '+(colunaSetaX+18)+','+(centroUtilY+8), stroke:'var(--tx1)', 'stroke-width':'2', fill:'none', 'stroke-linecap':'round', 'stroke-linejoin':'round' });
  svg.appendChild(seta);

  /* ── Direita: orbitais híbridos, nos ângulos geométricos reais ── */
  var grupoHib = _svgOrb('g', {});
  svg.appendChild(grupoHib);
  var raioHib = Math.min(W-colunaDireitaX-14, H*0.32);
  var anguloBase = -90; // primeiro híbrido apontando "pra cima"
  for(var h=0; h<receita.resultado; h++){
    var ang = anguloBase + h*receita.anguloResultado;
    orbDesenharHibrido(svg, grupoHib, colunaDireitaX, centroUtilY, raioHib*0.72, ang);
  }
  var ncleoHib = _svgOrb('circle', { cx:colunaDireitaX, cy:centroUtilY, r:5, fill:'var(--tx1)' });
  svg.appendChild(ncleoHib);

  var legendaDir = _svgOrb('text', { x:colunaDireitaX, y:14, 'text-anchor':'middle', fill:'var(--tx2)', 'font-size':'9.5', 'font-weight':'700' });
  legendaDir.textContent = 'Orbitais híbridos';
  svg.appendChild(legendaDir);

  /* ── Legenda de cor (fase) ── */
  var legY = H-10;
  var legItens = [
    { cor: ORBITAL_COR_POS, texto:'fase +' },
    { cor: ORBITAL_COR_NEG, texto:'fase −' },
    { cor: ORBITAL_COR_HIBRIDO, texto:'híbrido' },
  ];
  var legX = 12;
  legItens.forEach(function(it){
    svg.appendChild(_svgOrb('circle', { cx:legX, cy:legY, r:4, fill:it.cor }));
    var t = _svgOrb('text', { x:legX+9, y:legY+3, fill:'var(--tx2)', 'font-size':'8' });
    t.textContent = it.texto;
    svg.appendChild(t);
    legX += it.texto.length*4.6 + 22;
  });
}

function tipoHibridizacaoLabel(tipo){
  var LABELS = { sp:'sp', sp2:'sp²', sp3:'sp³', sp3d:'sp³d', sp3d2:'sp³d²' };
  return ' ' + (LABELS[tipo]||tipo);
}
