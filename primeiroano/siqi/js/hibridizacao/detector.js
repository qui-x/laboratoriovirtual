/* ═══════════════════════════════════════════════════════════════
   CAMADA: MÓDULO 3 — HIBRIDIZAÇÃO DE NUVENS ELETRÔNICAS
   ARQUIVO: detector.js
   ───────────────────────────────────────────────────────────────
   Torna o módulo compatível com TODOS os compostos que já existem no
   catálogo da Nomenclatura (CATALOGO_SIQI, ~100 compostos) — pedido
   explícito do usuário — em vez de só os 15 exemplos curados à mão
   em HIBRIDIZACOES_NUVENS.

   Reaproveita a MESMA infraestrutura já construída pra integração
   com o SILQ: silqConstruirMolecula() (átomos/ligações reais de
   qualquer composto) e a tabela ELEMENTS (valência). A partir da
   topologia, aplica a regra VSEPR de contagem de domínios pra achar
   o átomo central mais relevante e sua hibridização — sem precisar
   de dado nenhum escrito à mão.

   Nem todo composto do catálogo tem uma hibridização "interessante"
   pra mostrar: pares iônicos simples (NaCl, CaO...) e metais puros
   (Zn, Al, Cu) não têm nenhuma ligação COVALENTE — não há orbitais
   se misturando ali, e o detector corretamente retorna `null` pra
   esses casos (ver seção "Por que 100 → 46" no README).

   Depende de: js/render/silq-integracao.js (silqConstruirMolecula),
               js/data/elementos-silq.js (ELEMENTS),
               js/data/catalogo-compostos.js (CATALOGO_SIQI).
   Usado por: js/hibridizacao/logica.js.
═══════════════════════════════════════════════════════════════ */

'use strict';

var MODH_GEOMETRIA_POR_DOMINIOS = {
  2: 'Linear', 3: 'Trigonal planar', 4: 'Tetraédrica',
  5: 'Bipirâmide trigonal', 6: 'Octaédrica',
};
/* "nDominios-nPares" → forma observada, quando difere da eletrônica
   (mesma tabela VSEPR padrão — Gillespie-Nyholm). */
var MODH_GEOMETRIA_MOLECULAR_TABELA = {
  '3-1': 'Angular', '4-1': 'Pirâmide trigonal', '4-2': 'Angular',
  '5-1': 'Gangorra', '5-2': 'Forma de T', '5-3': 'Linear',
  '6-1': 'Pirâmide de base quadrada', '6-2': 'Quadrado planar',
};
var MODH_HIB_POR_DOMINIOS = { 2:'sp', 3:'sp2', 4:'sp3', 5:'sp3d', 6:'sp3d2' };

/* Compostos cuja fórmula real tem o átomo "central" repetido (2+
   átomos do mesmo elemento cada um com sua PRÓPRIA vizinhança) — o
   construtor de molécula deste app foi feito pra 1 único centro por
   composto (suficiente pra quase tudo: oxiácidos, óxidos simples,
   ânions poliatômicos comuns), e nesses 2 casos específicos ele
   junta todos os oxigênios num só átomo central, inflando a
   contagem de domínios pra um valor que não existe de verdade.
   Excluídos explicitamente em vez de mostrar um número errado —
   achado testando o detector contra os 100 compostos do catálogo. */
var MODH_EXCLUSAO_MULTICENTRO = { N2O5:true, P2O5:true };

/* Detecta hibridização a partir da TOPOLOGIA real (átomos/ligações
   já construídos por silqConstruirMolecula) — funciona pra qualquer
   composto, não só os 15 curados à mão. Retorna null quando não há
   ligação covalente nenhuma (par iônico simples/metal) ou quando a
   contagem foge do alcance didático coberto (2 a 6 domínios). */
function modHDetectarHibridizacao(formulaId, atoms, bonds){
  if(MODH_EXCLUSAO_MULTICENTRO[formulaId]) return null;

  var covBonds = bonds.filter(function(b){ return b.type === 'covalent'; });
  if(covBonds.length === 0) return null;

  var contagem = {};
  covBonds.forEach(function(b){
    contagem[b.a] = (contagem[b.a]||0) + 1;
    contagem[b.b] = (contagem[b.b]||0) + 1;
  });
  var centralId = null, maxC = 0;
  Object.keys(contagem).forEach(function(id){ if(contagem[id] > maxC){ maxC = contagem[id]; centralId = id; } });
  if(!centralId || maxC < 2) return null;

  var central = atoms.find(function(a){ return a.id === centralId; });
  var elData = (typeof ELEMENTS !== 'undefined' && ELEMENTS[central.element]) || {};
  var nSigma = maxC;
  var usado = covBonds.filter(function(b){ return b.a===centralId || b.b===centralId; })
    .reduce(function(s,b){ return s + b.order; }, 0);
  var nPares = Math.max(0, Math.floor(((elData.valence||4) - usado) / 2));
  var nDominios = nSigma + nPares;
  if(nDominios < 2 || nDominios > 6) return null;

  var hib = MODH_HIB_POR_DOMINIOS[nDominios];
  var geoEletronica = MODH_GEOMETRIA_POR_DOMINIOS[nDominios];
  var geoMolecular = nPares === 0 ? geoEletronica : (MODH_GEOMETRIA_MOLECULAR_TABELA[nDominios+'-'+nPares] || geoEletronica);

  return {
    atomoCentral: central.element, nSigma: nSigma, nPares: nPares, nDominios: nDominios,
    hibridizacao: hib, geometriaEletronica: geoEletronica, geometriaMolecular: geoMolecular,
  };
}

/* Explicação genérica (pro composto NÃO estar entre os 15 curados à
   mão) — descreve o PADRÃO geral daquele nº de domínios, sem o texto
   específico/rico escrito pra cada um dos 15 exemplos principais. */
var MODH_EXPLICACAO_GENERICA = {
  sp:    'domínios: {nSigma} ligante(s) σ + {nPares} par(es) isolado(s). Com 2 domínios, o átomo central mistura 1 orbital s + 1 orbital p, formando 2 orbitais híbridos sp colineares (180° entre si).',
  sp2:   'domínios: {nSigma} ligante(s) σ + {nPares} par(es) isolado(s). Com 3 domínios, o átomo central mistura 1 orbital s + 2 orbitais p, formando 3 orbitais híbridos sp² no mesmo plano (120° entre si).',
  sp3:   'domínios: {nSigma} ligante(s) σ + {nPares} par(es) isolado(s). Com 4 domínios, o átomo central mistura 1 orbital s + 3 orbitais p, formando 4 orbitais híbridos sp³ apontando pros vértices de um tetraedro (109,5° entre si).',
  sp3d:  'domínios: {nSigma} ligante(s) σ + {nPares} par(es) isolado(s). Com 5 domínios, o átomo central mistura 1 orbital s + 3 orbitais p + 1 orbital d, formando 5 orbitais híbridos sp³d numa bipirâmide trigonal.',
  sp3d2: 'domínios: {nSigma} ligante(s) σ + {nPares} par(es) isolado(s). Com 6 domínios, o átomo central mistura 1 orbital s + 3 orbitais p + 2 orbitais d, formando 6 orbitais híbridos sp³d² numa geometria octaédrica.',
};

var ANGULO_IDEAL_POR_DOMINIOS = { 2:180, 3:120, 4:109.5, 5:120, 6:90 };

/* Monta uma "entrada" no MESMO formato de HIBRIDIZACOES_NUVENS a
   partir da detecção automática — usada como complemento pros
   compostos do catálogo que não estão entre os 15 exemplos
   principais (que continuam com o texto pedagógico rico, escrito à
   mão). Reaproveita uso/nome/massa já existentes em CATALOGO_SIQI. */
function modHMontarEntradaAutomatica(c, deteccao){
  var explicacaoTpl = MODH_EXPLICACAO_GENERICA[deteccao.hibridizacao] || '';
  var explicacao = 'Contagem de ' + explicacaoTpl
    .replace('{nSigma}', deteccao.nSigma)
    .replace('{nPares}', deteccao.nPares);
  return {
    id: 'auto_' + c.formulaId, formula: c.formula, formulaId: c.formulaId, nome: c.nome,
    atomoCentral: deteccao.atomoCentral, nSigma: deteccao.nSigma, nPares: deteccao.nPares, nDominios: deteccao.nDominios,
    hibridizacao: deteccao.hibridizacao,
    geometriaEletronica: deteccao.geometriaEletronica, geometriaMolecular: deteccao.geometriaMolecular,
    anguloIdeal: ANGULO_IDEAL_POR_DOMINIOS[deteccao.nDominios], anguloReal: ANGULO_IDEAL_POR_DOMINIOS[deteccao.nDominios],
    massa: c.massa || '—', nivel: 'catalogo',
    explicacaoOrbitais: explicacao,
    aplicacao: c.uso || c.curiosidade || '',
    fonte: 'Detectado automaticamente a partir da fórmula (regra VSEPR — Gillespie & Nyholm, 1957); dado bruto de CATALOGO_SIQI.',
    _automatico: true,
  };
}

/* Monta a lista COMPLETA de compostos com hibridização — os 15
   curados à mão primeiro (mantêm o texto pedagógico rico), depois
   todo o resto do catálogo que passa no detector automático,
   evitando duplicar quem já está nos 15. Calculado uma vez e
   guardado em cache (o catálogo não muda em tempo de execução). */
var _modHListaCompleta = null;
function modHObterListaCompleta(){
  if(_modHListaCompleta) return _modHListaCompleta;
  var lista = HIBRIDIZACOES_NUVENS.slice();
  var jaIncluidos = {};
  lista.forEach(function(h){ jaIncluidos[h.formulaId] = true; });

  if(typeof CATALOGO_SIQI !== 'undefined' && typeof silqConstruirMolecula === 'function'){
    CATALOGO_SIQI.forEach(function(c){
      if(jaIncluidos[c.formulaId]) return;
      var m;
      try { m = silqConstruirMolecula(c.formulaId, c); } catch(err){ return; }
      var deteccao = modHDetectarHibridizacao(c.formulaId, m.atoms, m.bonds);
      if(!deteccao) return;
      lista.push(modHMontarEntradaAutomatica(c, deteccao));
      jaIncluidos[c.formulaId] = true;
    });
  }
  _modHListaCompleta = lista;
  return lista;
}

/* Atualiza o badge do card "Hibridização" (sidebar-left) com a
   contagem REAL assim que os dados carregam — não espera o usuário
   ativar o módulo pela primeira vez (o valor "15" no HTML é só um
   placeholder inicial, pro card não aparecer vazio antes do
   JavaScript rodar). O elemento já existe no DOM neste ponto (aparece
   ANTES desta tag <script> no HTML), não precisa esperar
   DOMContentLoaded. */
(function _modHAtualizarBadgeInicial(){
  var badge = document.getElementById('modh-badge-total');
  if(badge){
    try { badge.textContent = modHObterListaCompleta().length; } catch(err){ /* mantém o placeholder se algo faltar */ }
  }
})();
