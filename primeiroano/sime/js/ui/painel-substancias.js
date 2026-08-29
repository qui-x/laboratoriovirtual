/* ═══════════════════════════════════════════════════════════════
   CAMADA: INTERFACE (renderização + interação)
   ARQUIVO: painel-substancias.js
   ───────────────────────────────────────────────────────────────
   Constrói a lista de substâncias do painel esquerdo (com abas de
   categoria) e trata a seleção de uma substância: reseta pressão e
   volume para os valores padrão, recalibra o slider de temperatura
   para a nova substância e dispara uma renderização completa.
   A lista combina dois filtros: a aba de categoria química (acima da
   lista) e o módulo de estado físico ativo na sidebar esquerda —
   Gases/Líquidos/Sólidos, ver ui/painel-modulos.js — através de
   estado.modulo e da função pura estadoPadrao() (core/fisica.js).
   Depende de: data/catalogo-substancias.js, core/estado-simulacao.js,
               core/fisica.js (estadoPadrao, calcularTransicoesEfetivas),
               ui/dom-cache.js, ui/render-temperatura.js
               (calibrarSliderTemp, atualizarLinhasTermometro),
               ui/render-cilindro.js (atualizarCoresCilindro),
               a11y/acessibilidade.js (announce), orquestrador.js
               (atualizarSimulador).
   Usado por: main.js (construirPainelSubstancia, na inicialização),
              ui/painel-modulos.js (renderizarLista, ao trocar módulo).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════
   SELECIONAR SUBSTÂNCIA
═══════════════════════════════════════════════════════ */
function selecionarSubstancia(sub) {
  estado.substancia = sub;
  announce(sub.nome + ' selecionada. Tf=' + sub.Tf + '°C, Tb=' + sub.Tb + '°C.', 'assertive');
  // PASSO 1: reset completo
  estado.pressao          = LIMITES.pressaoRef;
  estado.volume           = LIMITES.volume.padrao;
  estado.fenomeno         = null;
  estado.estadoFisico     = '';
  estado._pressaoAnterior = LIMITES.pressaoRef;
  estado._volumeAnterior  = LIMITES.volume.padrao;
  estado._tempAnterior    = 25;
  // PASSO 2: TRANSICOES
  TRANSICOES.fusao    = sub.Tf;
  TRANSICOES.ebulicao = sub.Tb;
  // PASSO 3: calibrar slider → estado.temperatura = 25°C
  calibrarSliderTemp(sub);
  // PASSO 4: sincronizar sliders P e V
  if (D.sliderPressao) {
    D.sliderPressao.value = estado.pressao;
    estado.pressao = parseFloat(D.sliderPressao.value);
  }
  if (D.displayPressaoCtrl) D.displayPressaoCtrl.textContent = estado.pressao.toFixed(2) + ' atm';
  if (D.sliderVol) {
    D.sliderVol.value = estado.volume;
    estado.volume = parseFloat(D.sliderVol.value);
  }
  if (D.displayVol) D.displayVol.textContent = estado.volume + ' %';
  // PASSO 5: info visual
  /* BUG CORRIGIDO: este forEach estava VAZIO — alguem comecou a marcar o
     item escolhido na lista e nao terminou. Resultado: a coluna da
     esquerda nunca mostrava qual substancia estava ativa. A classe
     .sub-item.ativa ja existia no stylesime.css, sem ninguem aplicando.
     E tambem o gancho que o CSS usa para realcar a area central. */
  if (D.subLista) {
    D.subLista.querySelectorAll('.sub-item').forEach(function(li) {
      var ehAtiva = !!(sub && li.dataset.subId === sub.id);
      li.classList.toggle('ativa', ehAtiva);
      li.setAttribute('aria-selected', ehAtiva ? 'true' : 'false');
    });
  }
  atualizarLinhasTermometro(sub);
  atualizarCoresCilindro(sub);
  // PASSO 5b: pré-calcular transições efetivas
  calcularTransicoesEfetivas();
  var Tf0 = TRANSICOES.fusao, Tb0 = TRANSICOES.ebulicao;
  var slMin0 = D.sliderTemp ? parseFloat(D.sliderTemp.min) : -50;
  var slMax0 = D.sliderTemp ? parseFloat(D.sliderTemp.max) : 300;
  var fS = Math.max(0.5, Tf0 - slMin0);
  var fL = Math.max(0.5, Tb0 - Tf0);
  var fG = Math.max(0.5, slMax0 - Tb0);
  if (D.tpZonaSolido)  D.tpZonaSolido.style.flexGrow  = fS;
  if (D.tpZonaLiquido) D.tpZonaLiquido.style.flexGrow = fL;
  if (D.tpZonaGasoso)  D.tpZonaGasoso.style.flexGrow  = fG;
  if (D.tpLblFusao)    D.tpLblFusao.textContent    = Tf0.toFixed(0) + '°C';
  if (D.tpLblEbulicao) D.tpLblEbulicao.textContent = Tb0.toFixed(0) + '°C';
  if (D.lblFusao)    D.lblFusao.textContent    = Tf0.toFixed(0) + '°C';
  if (D.lblEbulicao) D.lblEbulicao.textContent = Tb0.toFixed(0) + '°C';
  if (D.displayTemp) D.displayTemp.textContent = estado.temperatura + ' °C';
  // PASSO 6: render completo
  atualizarSimulador();
}
 
/* Categoria química (aba) atualmente selecionada acima da lista — lembrada
   aqui para que ativar/desativar um módulo físico (Gases/Líquidos/Sólidos,
   sidebar esquerda) possa re-renderizar a lista sem "esquecer" a aba em
   que o usuário estava. Ver ui/painel-modulos.js. */
var _categoriaAtiva = 'Todas';

/* ═══════════════════════════════════════════════════════
   CONSTRUIR PAINEL DE SUBSTÂNCIAS
═══════════════════════════════════════════════════════ */
function construirPainelSubstancia() {
  if (!D.subLista) return;
  var tabs = document.getElementById('sub-cat-tabs');
  // Coletar categorias únicas
  var cats = ['Todas'];
  for (var i = 0; i < SUBSTANCIAS.length; i++) {
    if (cats.indexOf(SUBSTANCIAS[i].categoria) === -1)
      cats.push(SUBSTANCIAS[i].categoria);
  }
  // Criar abas
  if (tabs) {
    tabs.innerHTML = '';
    cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sub-cat-tab' + (cat === 'Todas' ? ' ativa' : '');
      btn.textContent = cat;
      btn.setAttribute('role','tab');
      btn.addEventListener('click', function() {
        tabs.querySelectorAll('.sub-cat-tab').forEach(function(b){ b.classList.remove('ativa'); });
        btn.classList.add('ativa');
        _categoriaAtiva = cat;
        renderizarLista(cat);
      });
      tabs.appendChild(btn);
    });
  }
  renderizarLista('Todas');
}

function renderizarLista(filtro) {
  if (!D.subLista) return;
  if (filtro === undefined) filtro = _categoriaAtiva;
  D.subLista.innerHTML = '';
  var visiveis = 0;
  for (var i = 0; i < SUBSTANCIAS.length; i++) {
    var s = SUBSTANCIAS[i];
    if (filtro !== 'Todas' && s.categoria !== filtro) continue;
    var estadoAgora = estadoPadrao(s);
    /* Filtro de MÓDULO (Gases/Líquidos/Sólidos, sidebar esquerda) — além
       do filtro de categoria química (abas acima da lista). Os dois se
       combinam: com um módulo ativo, só aparecem substâncias daquele
       estado físico de referência; dentro delas, a aba de categoria
       ainda pode restringir mais (ex.: módulo "Gases" + aba "Gases
       Nobres" mostra só He, Ne, Ar, Kr, Xe, Rn). */
    if (estado.modulo && estadoAgora !== estado.modulo) continue;
    visiveis++;
    /* Ícone SVG (ver <defs> de <symbol> no indexsime.html) + abreviação —
       substitui o antigo texto com emoji ('❄ Sól.', '💧 Líq.', '💨 Gás'). */
    var iconeMap = { solido:'solid', liquido:'liquid', gasoso:'gas' };
    var textoMap = { solido:'Sól.', liquido:'Líq.', gasoso:'Gás' };
    var li = document.createElement('li');
    li.className = 'sub-item';
    li.dataset.subId = s.id;     /* usado por atualizarSimulador p/ marcar .ativa */
    li.setAttribute('role','option');
    li.setAttribute('aria-selected','false');
    /* BUG CORRIGIDO: a classe aplicada ao pill era "estado-" + estadoAgora
       (ex.: "estado-solido"), mas o CSS define a cor em .sub-estado-pill.solido
       (sem o prefixo "estado-") — a classe nunca batia e o pill sempre caía
       no cinza padrão, mesmo a substância sendo sólida/líquida/gasosa. */
    li.innerHTML =
      '<span class="sub-formula-tag">' + s.formula + '</span>' +
      '<span class="sub-estado-pill ' + estadoAgora + '">' +
        '<svg class="icon" aria-hidden="true"><use href="#ic-' + iconeMap[estadoAgora] + '"/></svg>' +
        textoMap[estadoAgora] +
      '</span>';
    li.addEventListener('click', (function(sub){ return function(){ selecionarSubstancia(sub); }; })(s));
    D.subLista.appendChild(li);
  }
  if (visiveis === 0) {
    var vazio = document.createElement('li');
    vazio.className = 'sub-lista-vazia';
    vazio.setAttribute('role', 'note');
    vazio.textContent = 'Nenhuma substância nesta combinação de filtros.';
    D.subLista.appendChild(vazio);
  }
}
