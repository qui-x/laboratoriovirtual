/* =====================================================================
   SITP — RECEPTOR DE ACESSIBILIDADE (mesclado aqui de acessibilidadesitp.js
   — arquivo extra removido, já que a acessibilidade geral é controlada
   pela Central via URL/postMessage; não há motivo pra manter isso num
   arquivo .js separado).
   ---------------------------------------------------------------------
   Este bloco NÃO cria botões nem controles. A tabela não tem UI de
   acessibilidade própria: quem controla é a Central de Simuladores (menu).

   O menu envia o estado de acessibilidade de duas formas:
     (1) parâmetros na URL, no momento em que abre a tabela:
         ?theme=dark|light
         &reading=on|off
         &colorblind=none|protanopia|deuteranopia|tritanopia|acromatopsia
         &contrast=true|false
         &fontscale=0.75–1.5
     (2) postMessage em tempo real (caso a tabela seja embutida em iframe):
         { source:'central-simuladores', type:'a11y-update', payload:{...} }

   Aqui apenas traduzimos esse estado para os atributos data-* e a
   variável --font-scale que o resto deste arquivo já lê internamente.
   ===================================================================== */

(function () {
  const MIN_SCALE = 0.8, MAX_SCALE = 2.5;
  const root = document.documentElement;

  function aplicarEscala(val) {
    const fs = Math.min(MAX_SCALE, Math.max(MIN_SCALE, val));
    root.style.setProperty('--font-scale', fs);
  }

  // Repinta as cores de categoria em toda a tabela e legenda quando o
  // daltonismo muda, sem recriar o DOM. Usa getCatColorHex() do script.js.
  function redesenharCores() {
    if (typeof getCatColorHex !== 'function') return;
    if (window.modoLamber) {
      if (typeof window.__sitpPintarModoLamber === 'function') window.__sitpPintarModoLamber(true);
      return;
    }
    document.querySelectorAll('.element[data-cat]').forEach(div => {
      const cc = getCatColorHex(div.dataset.cat) || '#888';
      div.style.setProperty('--cat-color', cc);
      const sym = div.querySelector('.el-symbol');
      if (sym) sym.style.color = cc;
    });
    document.querySelectorAll('.serie-toggle').forEach(div => {
      const cc = getCatColorHex(div.dataset.cat) || '#888';
      div.style.setProperty('--cat-color', cc);
      const sym = div.querySelector('.el-symbol');
      if (sym) sym.style.color = cc;
      const arrow = div.querySelector('.toggle-arrow');
      if (arrow) arrow.style.color = cc;
    });
    document.querySelectorAll('.legend-item[data-cat] .legend-dot').forEach(dot => {
      const cat = dot.closest('.legend-item').dataset.cat;
      dot.style.background = getCatColorHex(cat) || '#888';
    });
    document.querySelectorAll('.legend-item[data-cat].ativo').forEach(b => {
      if (typeof setItemAtivo === 'function')
        setItemAtivo(b, getCatColorHex(b.dataset.cat) || '#00e5ff');
    });
    // Círculos do modo raio: usam --orb-s/p/d/f, que mudam com tema e
    // alto contraste, então precisam ser recalculados junto.
    // (No modo lamber o retorno acima já cobriu isso, porque
    // pintarModoLamber() repinta o círculo por conta própria.)
    /* Uma chamada cobre TODAS as propriedades: cores de bloco (que mudam
       com tema e contraste) e a rampa do mapa de calor (que troca de
       colorida para luminosidade em modo daltônico). */
    if (typeof atualizarVisualPropriedade === 'function') atualizarVisualPropriedade();
  }
  // expõe para uso interno
  window.__sitpRedesenharCores = redesenharCores;

  // O SITP não tem paleta dedicada para acromatopsia: usamos deuteranopia.
  function normalizarDaltonico(cb) {
    if (cb === null || cb === undefined || cb === 'none' || cb === '') return '';
    if (cb === 'acromatopsia') return 'deuteranopia';
    if (['protanopia', 'deuteranopia', 'tritanopia'].includes(cb)) return cb;
    return '';
  }

  function aplicarPayload(payload) {
    if (!payload) return;
    let mudouDalt = false;

    if (payload.theme) {
      root.setAttribute('data-theme', payload.theme === 'light' ? 'light' : '');
    }
    if (typeof payload.contrast !== 'undefined') {
      root.setAttribute('data-contrast', payload.contrast ? 'high' : '');
    }
    if (payload.reading) {
      // data-reading (nao data-simple): e o atributo que o a11y.js usa,
      // e agora o stylesitp.css tambem espera esse nome.
      root.setAttribute('data-reading', payload.reading === 'on' ? 'on' : 'off');
    }
    if (typeof payload.colorblind !== 'undefined' && payload.colorblind !== null) {
      const modo = normalizarDaltonico(payload.colorblind);
      const atual = root.getAttribute('data-daltonico') || '';
      mudouDalt = atual !== modo;
      root.setAttribute('data-daltonico', modo);
    }
    if (typeof payload.fontScale === 'number' && !Number.isNaN(payload.fontScale)) {
      aplicarEscala(payload.fontScale);
    }

    // Se a tabela já foi renderizada e o daltonismo mudou, repinta.
    if (mudouDalt) redesenharCores();
  }

  function aplicarDaUrl() {
    const p = new URLSearchParams(window.location.search);
    if (![...p.keys()].length) return;
    aplicarPayload({
      theme: p.get('theme'),
      reading: p.get('reading'),
      colorblind: p.get('colorblind'),
      contrast: p.get('contrast') === 'true',
      fontScale: p.has('fontscale') ? parseFloat(p.get('fontscale')) : undefined
    });
  }

  // postMessage em tempo real (quando embutida em iframe pelo menu)
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.source !== 'central-simuladores' || e.data.type !== 'a11y-update') return;
    aplicarPayload(e.data.payload || {});
  });

  // Aplica o estado vindo da URL assim que possível.
  // 1ª passada: imediata (define data-* / --font-scale antes da pintura).
  aplicarDaUrl();
  // 2ª passada: após a tabela existir, para repintar as cores de categoria.
  window.addEventListener('DOMContentLoaded', () => {
    aplicarDaUrl();
    if (typeof window.__sitpRedesenharCores === 'function') window.__sitpRedesenharCores();
  });
})();/* =====================================================================
   SITP — script.js | Simulador Interativo da Tabela Periódica
   Núcleo de dados e renderização.
   A tabela NÃO tem controles de acessibilidade próprios. Toda a
   acessibilidade (tema, contraste, daltonismo, leitura simples, fonte)
   é controlada pela Central de Simuladores (menu), que envia o estado
   via parâmetros de URL e postMessage. O receptor (bloco acima nesse
   mesmo arquivo) apenas aplica esse estado nos atributos data-* /
   variáveis que a tabela já lê.
   anunciar() (live region p/ leitor de tela) é definida aqui por ser
   parte do funcionamento da própria tabela.
   ===================================================================== */

/* ---------------------------------------------------------------------
   DEPENDENCIA: este arquivo LE as tabelas declaradas em dadossitp.js
   (ESTADO, MASSA, MASSA_ISOTOPO, FAMILIA, CAT_COLOR_*, LAMBER_*,
   CONFIG_EC, CURIOSIDADES, elementosBase, lantanideos, actinideos,
   RAIO, RAIO_*). Logo, dadossitp.js precisa ser carregado ANTES
   deste script no indexsitp.html. Nao declare dados aqui: dado novo
   vai para dadossitp.js.
   --------------------------------------------------------------------- */

// Live region para leitores de tela (modais, filtros, navegação).
function anunciar(msg) {
  const lr = document.getElementById('live-region');
  if (!lr) return;
  lr.textContent = '';
  setTimeout(() => { lr.textContent = msg; }, 50);
}
// Escolhe a paleta de estado fisico conforme o tema. Le ESTADO_HEX_DARK /
// ESTADO_HEX_LIGHT de dadossitp.js.
function getEstadoHex(est){
  const isLight = document.documentElement.getAttribute('data-theme')==='light';
  return (isLight ? ESTADO_HEX_LIGHT : ESTADO_HEX_DARK)[est] || '#888';
}
// Escolhe a paleta de categoria conforme daltonismo/tema. Le
// CAT_COLOR_HEX_DALT / _LIGHT / _DARK de dadossitp.js.
function getCatColorHex(cat){
  const dalt = document.documentElement.getAttribute('data-daltonico');
  if(dalt && CAT_COLOR_HEX_DALT[dalt]){
    return CAT_COLOR_HEX_DALT[dalt][cat] || '#888';
  }
  const isLight = document.documentElement.getAttribute('data-theme')==='light';
  return (isLight ? CAT_COLOR_HEX_LIGHT : CAT_COLOR_HEX_DARK)[cat] || '#888';
}
function distribuirEletrons(Z) {
  let e = Z, dist = {};
  for (const sub of ORDEM_SUBNIVEIS) {
    if (e <= 0) break;
    const fill = Math.min(e, MAX_SUB[sub[sub.length-1]]);
    if (fill > 0) { dist[sub] = fill; e -= fill; }
  }
  return dist;
}
function porCamada(dist) {
  const camadas = {};
  for (const [sub, e] of Object.entries(dist)) {
    const n = parseInt(sub[0]);
    if (!camadas[n]) camadas[n] = [];
    camadas[n].push({ sub, e });
  }
  return camadas;
}
// N = A - Z, com A vindo de MASSA_ISOTOPO (dadossitp.js).
function calcNeutrons(Z) {
  return (MASSA_ISOTOPO[Z] || Z * 2) - Z;
}
function classificarPreenchimento(elCount, maxEl, tipo){
  if(elCount === 0)           return { status:'vazio',          label:'Vazio',                   icon:'○' };
  if(elCount === maxEl)       return { status:'preenchido',      label:'Preenchido',              icon:'●' };
  if(elCount === maxEl / 2)   return { status:'semipreenchido',  label:'Semipreenchido',          icon:'◑' };
  return                       { status:'parcial',              label:'Parcialmente preenchido', icon:'◔' };
}
function ultimoSubnivel(Z){
  const cfg = CONFIG_EC[Z];
  if(!cfg) return null;
  const termos = cfg.replace(/\[[A-Za-z]+\]\s*/,'').trim().split(/\s+/);
  if(!termos.length) return null;
  const ultimo = termos[termos.length - 1];
  const match = ultimo.match(/^(\d[spdf])(.*)$/);
  if(!match) return null;
  const sub = match[1];
  const expStr = match[2];
  const sup2n = {'⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9};
  const elCount = [...expStr].reduce((acc,c)=>{
    const d = sup2n[c]; return d !== undefined ? acc * 10 + d : acc;
  }, 0);
  const tipo = sub[1];
  const bloco = tipo.toUpperCase();
  const n = parseInt(sub[0]);
  const maxEl = {s:2,p:6,d:10,f:14}[tipo]||0;
  const numOrbitais = maxEl / 2;
  const preenche = classificarPreenchimento(elCount, maxEl, tipo);
  return {
    sub, n, tipo, bloco, elCount, maxEl, numOrbitais,
    status:    preenche.status,
    statusLabel: preenche.label,
    statusIcon:  preenche.icon,
    camada: 'KLMNOPQ'[n-1]||'?'
  };
}
function resolverCorCSS(cssVar){
  const val = getComputedStyle(document.documentElement)
                .getPropertyValue(cssVar.replace('var(','').replace(')','').trim())
                .trim();
  return val || '#888';
}
function rgbToHex(str){
  if(!str) return '#888888';
  if(str.startsWith('#')) return str;
  const m = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if(m) return '#'+[m[1],m[2],m[3]].map(v=>parseInt(v).toString(16).padStart(2,'0')).join('');
  return '#888888';
}
/* =====================================================================
   MOTOR DE COR DO MAPA DE CALOR
   ---------------------------------------------------------------------
   corEN(chi) devolve o hex da tonalidade do card, interpolando as
   paradas de cor declaradas na propriedade (dadossitp.js).

   Escolha da escala: no modo daltonico ou em alto contraste usa a rampa
   de luminosidade (ESCALA_CALOR_MONO), porque a colorida passa por verde e
   vermelho — justamente o par que protanopia e deuteranopia confundem.

   corTextoSobre() resolve o problema que um fundo tingido cria: o texto
   do card tem cor fixa e ficaria ilegivel sobre as tonalidades claras
   da escala. Calcula a luminancia relativa do fundo (formula WCAG) e
   devolve texto escuro ou claro conforme o caso, garantindo contraste
   em toda a faixa da escala.
   ===================================================================== */
function escalaDaPropriedade(prop){
  const r = document.documentElement;
  const dalt = r.getAttribute('data-daltonico');
  const alto = r.getAttribute('data-contrast') === 'on';
  const mono = (alto || (dalt && dalt !== 'nenhum'));
  return (mono && prop.escalaMono) ? prop.escalaMono : (prop.escala || ESCALA_CALOR);
}
// mantida para o card de eletronegatividade do modal, que fala de UMA
// propriedade específica e não precisa do registro
function corEN(chi){ return corNaEscala(propriedadePorId('en') || {vmin:EN_MIN,vmax:EN_MAX,escala:ESCALA_CALOR,escalaMono:ESCALA_CALOR_MONO}, chi); }
function hexParaRgb(hex){
  const h = String(hex).replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function rgbParaHex(r,g,b){
  return '#' + [r,g,b].map(n=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0')).join('');
}
/* Generalizada: recebe a propriedade e o valor, e usa as rampas
   declaradas nela. Antes era fixa na escala da eletronegatividade. */
function corNaEscala(prop, v){
  const paradas = escalaDaPropriedade(prop);
  const p = fracaoPropriedade(prop, v);
  for(let i=0; i<paradas.length-1; i++){
    const a = paradas[i], b = paradas[i+1];
    if(p >= a.p && p <= b.p){
      const t = (b.p === a.p) ? 0 : (p - a.p) / (b.p - a.p);
      const ca = hexParaRgb(a.hex), cb = hexParaRgb(b.hex);
      return rgbParaHex(ca[0]+(cb[0]-ca[0])*t, ca[1]+(cb[1]-ca[1])*t, ca[2]+(cb[2]-ca[2])*t);
    }
  }
  return paradas[paradas.length-1].hex;
}
const EN_TXT_CLARO  = '#f5f5fb';
const EN_TXT_ESCURO  = '#0b0b14';
const EN_CONTRASTE_MIN = 4.5;   // WCAG 2.1 AA para texto normal

// Luminancia relativa (WCAG 2.1).
function luminancia(hex){
  const lin = c => { c = c/255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const [r,g,b] = hexParaRgb(hex);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}
// Razao de contraste entre duas cores (1:1 a 21:1).
function contraste(a, b){
  const la = luminancia(a), lb = luminancia(b);
  const claro = Math.max(la, lb), escuro = Math.min(la, lb);
  return (claro + 0.05) / (escuro + 0.05);
}
// Escolhe entre texto claro e escuro o que der MAIS contraste sobre o
// fundo. Um limiar fixo de luminancia erra nos tons medios da escala,
// onde nenhum dos dois e obviamente melhor.
function corTextoSobre(hex){
  return contraste(hex, EN_TXT_CLARO) >= contraste(hex, EN_TXT_ESCURO)
    ? EN_TXT_CLARO : EN_TXT_ESCURO;
}
/* Garantia de legibilidade: nos tons medios da escala (verde, ciano)
   NENHUMA das duas cores de texto alcanca 4,5:1. Em vez de aceitar
   texto ilegivel ou de trocar a escala por uma sem graca, o fundo e
   empurrado no sentido oposto ao texto — escurecido se o texto e claro,
   clareado se e escuro — em passos de 4%, ate cruzar o minimo.
   O matiz se mantem, entao a leitura de mapa de calor nao se perde, e
   o contraste passa a ser garantido por construcao, nao por sorte. */
function ajustarFundoParaContraste(bgHex, txtHex){
  const alvoEscuro = txtHex === EN_TXT_CLARO;   // texto claro -> escurecer o fundo
  let [r,g,b] = hexParaRgb(bgHex);
  for(let i = 0; i < 25; i++){
    const atual = rgbParaHex(r,g,b);
    if(contraste(atual, txtHex) >= EN_CONTRASTE_MIN) return atual;
    if(alvoEscuro){ r *= 0.96; g *= 0.96; b *= 0.96; }
    else          { r += (255-r)*0.06; g += (255-g)*0.06; b += (255-b)*0.06; }
  }
  return rgbParaHex(r,g,b);
}

/* Icones SVG usados em markup gerado por JavaScript. Os do estado
   fisico NAO estao aqui: moram em ESTADO_DOT (dadossitp.js), que e o
   ponto unico de verdade deles. Mesmas duas regras do molde: tamanho
   em 1em (herda font-size) e cor em currentColor (herda a cor do
   texto, entao acompanha tema e alto contraste sem JS). */
const ICO = {
  /* energia de ionizacao: atomo com sinal + no nucleo (ja perdeu eletron)
     e uma seta diagonal saindo. Silhueta = circulo com cruz + seta.
     NAO pode ser o icone de eletronegatividade espelhado: os dois eram
     o mesmo desenho com a seta invertida e, a 17px, ficavam
     indistinguiveis — parecia botao repetido. */
  ionizacao: '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9.6" cy="14.2" r="5.5"/><line x1="7.4" y1="14.2" x2="11.8" y2="14.2"/><line x1="9.6" y1="12" x2="9.6" y2="16.4"/><line x1="14.4" y1="9.4" x2="19.2" y2="4.6"/><polyline points="15.6,4.4 19.6,4.4 19.6,8.4"/></svg>',
  /* eletronegatividade: a LIGACAO entre dois atomos de tamanhos
     diferentes, com o par de eletrons deslocado para o maior. E o que a
     propriedade mede: quem puxa o par da ligacao.
     Silhueta = DOIS circulos que se tocam, deliberadamente diferente da
     de ionizacao (um circulo com cruz). */
  en:        '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="7" cy="12" r="4.1"/><circle cx="17" cy="12" r="5.5"/><circle cx="14.2" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
  raio:      '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" stroke-dasharray="2.4 2.2"/><circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="20.5" y2="12"/><polyline points="18.1,9.7 20.5,12 18.1,14.3"/></svg>',
  aviso:     '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4.2 2.6 20.4h18.8L12 4.2z"/><line x1="12" y1="10.2" x2="12" y2="14.8"/><circle cx="12" cy="17.6" r="1.15" fill="currentColor" stroke="none"/></svg>',
  telacheia: '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="4.2,9.2 4.2,4.2 9.2,4.2"/><polyline points="14.8,4.2 19.8,4.2 19.8,9.2"/><polyline points="19.8,14.8 19.8,19.8 14.8,19.8"/><polyline points="9.2,19.8 4.2,19.8 4.2,14.8"/></svg>',
  livro:     '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 6.5S9.9 4.7 5.6 4.7v12.9S9.9 17.6 12 19.4c2.1-1.8 6.4-1.8 6.4-1.8V4.7C14.1 4.7 12 6.5 12 6.5z"/><line x1="12" y1="6.5" x2="12" y2="19.4"/></svg>',
  seta:      '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="9.8,5.6 16.2,12 9.8,18.4"/></svg>'
};
// Preenche os placeholders <... data-ico-estado="S"> do guia com o
// icone de ESTADO_DOT, para o desenho nao ficar duplicado no HTML.
function preencherIconesEstado(){
  document.querySelectorAll('[data-ico-estado]').forEach(n=>{
    n.innerHTML = ESTADO_DOT[n.dataset.icoEstado] || '';
  });
}
function corBlocoDe(Z, ccHex){
  return corAtomo(BLOCO[Z] || '', ccHex);
}
function corAtomo(bloco, ccHex){
  const varMap = {S:'--orb-s', P:'--orb-p', D:'--orb-d', F:'--orb-f'};
  const v = varMap[bloco];
  if(v){
    const raw = resolverCorCSS(v);
    return rgbToHex(raw);
  }
  return ccHex || '#888888';
}
function vizinhosRaio(Z, el, allEls){
  const periodo = (el.periodo||0)<=7?el.periodo:(el.cat==='Lantanídeo'?6:7);
  const grupo   = el.grupo||0;
  const mesmoPer = allEls
    .filter(e=>{
      const p=(e.periodo||0)<=7?e.periodo:(e.cat==='Lantanídeo'?6:7);
      return p===periodo && RAIO[e.numero] && e.numero!==Z;
    })
    .sort((a,b)=>a.grupo-b.grupo)
    .slice(0,5);
  const mesmoGrp = allEls
    .filter(e=>{
      const p=(e.periodo||0)<=7?e.periodo:(e.cat==='Lantanídeo'?6:7);
      return e.grupo===grupo && p!==periodo && RAIO[e.numero] && e.numero!==Z;
    })
    .sort((a,b)=>{
      const pa=(a.periodo||0)<=7?a.periodo:(a.cat==='Lantanídeo'?6:7);
      const pb=(b.periodo||0)<=7?b.periodo:(b.cat==='Lantanídeo'?6:7);
      return pa-pb;
    })
    .slice(0,5);
  return { mesmoPer, mesmoGrp };
}
/* =====================================================================
   CARD DE PROPRIEDADE no modal (GENÉRICO)
   ---------------------------------------------------------------------
   Um render para toda propriedade com cardModal: true no registro.
   Substituiu renderEN(), que era específica da eletronegatividade.
   Acrescentar uma propriedade ao registro faz o card do modal aparecer
   sozinho — não há HTML nem função nova.

   Estrutura espelhada na do raio de propósito (valor grande + barra de
   escala relativa + fonte), para o aluno reconhecer o mesmo padrão de
   leitura em todas as propriedades.

   A cor vem de corNaEscala(), a MESMA função do mapa de calor dos
   cards. Então a tonalidade aqui e a do card são iguais por construção.
   ===================================================================== */
function renderPropriedadeModal(prop, Z, el){
  const v = valorPropriedade(prop, Z);
  if(v === null){
    // motivo específico quando o registro declara um para este Z;
    // senão, o motivo padrão da propriedade
    const m = (prop.semDadoMotivos || []).find(g => g.zs.includes(Z));
    return `<div class="en-wrap">
      <p class="en-sem-dados">${prop.semDadoTitulo || 'Sem valor publicado.'}
      ${m ? m.texto : (prop.semDadoPadrao || '')}</p>
    </div>`;
  }
  const cor   = corNaEscala(prop, v);
  const pct   = Math.round(fracaoPropriedade(prop, v) * 100);
  const faixa = (prop.faixas || []).find(f => v >= f.min && v < f.max);
  const num   = numeroPropriedade(prop, v);
  const fmt   = x => String(x).replace('.', ',');
  // unidade alternativa: a conversão é conteúdo de aula, não detalhe
  const alt   = prop.fatorAlt
    ? `<span class="en-valor-alt">= ${fmt(Math.round(v * prop.fatorAlt))} ${prop.unidadeAlt}</span>`
    : '';
  return `<div class="en-wrap" style="--en-cor:${cor}">
    <div class="en-visual">
      <div class="en-valor-box">
        <span class="en-valor-titulo">${prop.label}</span>
        <span class="en-valor-num" aria-label="${num} ${prop.unidadeLonga || ''}">${num}${prop.unidade}</span>
        <span class="en-valor-escala">${prop.unidadeLonga || ''}</span>
        ${alt}
      </div>
      <div class="en-info-col">
        <span class="en-faixa-badge">${faixa ? faixa.label : '—'}</span>
        <span class="en-valor-fonte">Fonte: ${prop.fonte || '—'}</span>
      </div>
    </div>
    <div class="en-barra-wrap tecnico-avancado">
      <span class="en-barra-titulo">Posição na escala — de ${fmt(prop.vmin)} a ${fmt(prop.vmax)}${prop.unidade}</span>
      <div class="en-barra-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Posição de ${el.nome} na escala de ${prop.label}: ${pct} por cento">
        <div class="en-barra-fill" style="width:${pct}%"></div>
        <div class="en-barra-marca" style="left:${pct}%" aria-hidden="true"></div>
      </div>
      <div class="en-barra-legenda"><span>menor</span><span>${num}${prop.unidade} (${pct}%)</span><span>maior</span></div>
    </div>
  </div>`;
}
/* Monta uma seção por propriedade com cardModal: true. O contêiner do
   HTML é único e vazio; as seções nascem daqui. */
function renderCardsPropriedade(Z, el){
  const cx = document.getElementById('modalPropriedades');
  if(!cx) return;
  cx.innerHTML = PROPRIEDADES.filter(p => p.cardModal).map(p => `
    <section class="info-card" aria-labelledby="propTitle-${p.id}">
      <h4 id="propTitle-${p.id}">${ICO[p.icone] || ''} ${p.label}</h4>
      <div>${renderPropriedadeModal(p, Z, el)}</div>
    </section>`).join('');
}
function renderRaio(Z, el, ccHex){
  const dados = RAIO[Z];
  const sub   = ultimoSubnivel(Z);
  if(!dados && !sub){
    return `<p class="raio-sem-dados">Dados de raio atômico não disponíveis — elemento sintético superpesado sem medição experimental confirmada.</p>`;
  }
  const atomCor  = corBlocoDe(Z, ccHex);
  const atomGlow = (()=>{
    const h = atomCor.replace('#','');
    if(h.length < 6) return 'rgba(136,136,136,0.5)';
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},0.5)`;
  })();
  const rPm      = dados ? dados.r   : null;
  const tipoKey  = dados ? dados.t   : null;
  const fonteKey = dados ? dados.f   : null;
  const tipoLabel = tipoKey  ? (RAIO_TIPO_LABEL[tipoKey] ||tipoKey)  : '—';
  const tipoDef   = tipoKey  ? (RAIO_TIPO_DEF[tipoKey]  ||'')        : '';
  const fonteLabel= fonteKey ? (RAIO_FONTE_LABEL[fonteKey]||fonteKey) : '—';
  const diam = rPm ? Math.round(20+(rPm/RAIO_MAX_PM)*60) : 40;
  const pct  = rPm ? Math.round((rPm/RAIO_MAX_PM)*100)   : 0;
  const circuloHtml=`
    <div class="raio-circulo-wrap">
      <div class="raio-circulo" style="width:${diam}px;height:${diam}px;--atom-color:${atomCor};--atom-color-glow:${atomGlow}"
           role="img" aria-label="${rPm||'sem dado'} pm — representação proporcional"></div>
      <span class="raio-circulo-label" aria-hidden="true">${el.simbolo||''}</span>
    </div>`;
  const valorHtml = rPm
    ? `<div class="raio-valor-box" style="--atom-color:${atomCor}">
         <span class="raio-valor-titulo">Raio ${tipoLabel}</span>
         <span class="raio-valor-num" aria-label="${rPm} picômetros">${rPm}<span class="raio-valor-unit"> pm</span></span>
         <span class="raio-valor-fonte">Fonte: ${fonteLabel}</span>
       </div>`
    : `<div class="raio-valor-box"><span class="raio-valor-titulo">Raio atômico</span>
       <span class="raio-sem-dados">Sem dado experimental disponível</span></div>`;
  const subHtml = sub ? (()=>{
    const statusClass = {
      preenchido:    'raio-status-preenchido',
      semipreenchido:'raio-status-semipreenchido',
      parcial:       'raio-status-parcial',
      vazio:         'raio-status-vazio'
    }[sub.status] || 'raio-status-parcial';
    return `
    <div class="raio-sub-box tecnico-avancado">
      <span class="raio-sub-titulo">Camada de valência — último subnível</span>
      <span class="raio-sub-valor" aria-label="Subnível ${sub.sub}: ${sub.elCount} de ${sub.maxEl} elétrons">${sub.sub} &nbsp;·&nbsp; ${sub.elCount}/${sub.maxEl} e⁻</span>
      <span class="raio-sub-tipo">
        Bloco <b>${sub.bloco}</b> &nbsp;·&nbsp; Camada <b>${sub.camada}</b> (n = ${sub.n}) &nbsp;·&nbsp; ${sub.numOrbitais} orbital${sub.numOrbitais>1?'is':''}
      </span>
      <span class="raio-status-badge ${statusClass}" aria-label="Estado de preenchimento: ${sub.statusLabel}">${sub.statusLabel}</span>
    </div>`;
  })() : '';
  const barraHtml = rPm ? `
    <div class="raio-barra-wrap tecnico-avancado">
      <span class="raio-barra-titulo">Escala relativa — referência: Fr = ${RAIO_MAX_PM} pm</span>
      <div class="raio-barra-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Raio relativo a Fr: ${pct}%">
        <div class="raio-barra-fill" style="width:${pct}%;--atom-color:${atomCor};--atom-color-glow:${atomGlow}"></div>
      </div>
      <div class="raio-barra-legenda"><span>0 pm</span><span>${rPm} pm (${pct}%)</span><span>${RAIO_MAX_PM} pm (Fr)</span></div>
    </div>` : '';
  const toggleHtml=`
    <div class="raio-header">
      <span class="raio-tend-titulo">${ICO.raio} Raio Atômico — ${rPm||'—'} pm</span>
      <div class="raio-view-toggle" role="group" aria-label="Modo de visualização">
        <button class="raio-vbtn ativo" id="rbtn-dados-${Z}" aria-pressed="true"
                onclick="raioVista('dados','${Z}',this)">Dados</button>
        <button class="raio-vbtn" id="rbtn-grade-${Z}" aria-pressed="false"
                onclick="raioVista('grade','${Z}',this)">Grade</button>
        <button class="raio-vbtn" id="rbtn-bohr-${Z}" aria-pressed="false"
                onclick="raioVista('bohr','${Z}',this)">Bohr</button>
        <button class="raio-vbtn" id="rbtn-lewis-${Z}" aria-pressed="false"
                onclick="raioVista('lewis','${Z}',this)">Lewis</button>
        <button class="raio-vbtn" id="rbtn-nuvem-${Z}" aria-pressed="false"
                onclick="raioVista('nuvem','${Z}',this)">Nuvem</button>
      </div>
    </div>`;
  const painelDadosHtml=`
    <div id="raio-painel-dados-${Z}">
      <div class="raio-visual">${circuloHtml}<div class="raio-info-col">${valorHtml}</div></div>
      ${subHtml}
      ${barraHtml}
    </div>`;
  const elJSON = JSON.stringify({numero:el.numero,simbolo:el.simbolo||'',nome:el.nome||'',grupo:el.grupo,periodo:el.periodo||0,cat:el.cat||''});
  const painelGradeHtml=`
    <div id="raio-painel-grade-${Z}" style="display:none"
         data-lazy="grade" data-z="${Z}"
         data-cor="${atomCor.replace(/"/g,'&quot;')}"
         data-glow="${atomGlow.replace(/"/g,'&quot;')}"
         data-el='${elJSON.replace(/'/g,'&#39;')}'>
    </div>`;
  const painelBohrHtml=`
    <div id="raio-painel-bohr-${Z}" style="display:none"
         data-lazy="bohr" data-z="${Z}"
         data-cor="${atomCor.replace(/"/g,'&quot;')}"
         data-glow="${atomGlow.replace(/"/g,'&quot;')}"
         data-el='${elJSON.replace(/'/g,'&#39;')}'>
    </div>`;
  const painelLewisHtml=`
    <div id="raio-painel-lewis-${Z}" style="display:none"
         data-lazy="lewis" data-z="${Z}"
         data-cor="${atomCor.replace(/"/g,'&quot;')}"
         data-glow="${atomGlow.replace(/"/g,'&quot;')}"
         data-el='${elJSON.replace(/'/g,'&#39;')}'>
    </div>`;
  const _nuvemOrbs = (()=>{
    const dist2 = distribuirEletrons(Z); const cam2 = porCamada(dist2);
    const nc2 = Object.keys(cam2).length; const orbs = [];
    for(let n2=1; n2<=nc2; n2++){
      const subs2 = cam2[n2]||[];
      subs2.forEach(({sub:s2, e:e2})=>{
        const t2 = s2[s2.length-1];
        const vm = {s:'--orb-s', p:'--orb-p', d:'--orb-d', f:'--orb-f'};
        orbs.push({sub:s2, e:e2, tipo:t2, n:parseInt(s2[0]), cor:rgbToHex(resolverCorCSS(vm[t2]||'--orb-s'))});
      });
    }
    return orbs;
  })();
  const painelNuvemHtml=`
    <div id="raio-painel-nuvem-${Z}" style="display:none"
         data-lazy="nuvem" data-z="${Z}"
         data-cor="${atomCor.replace(/"/g,'&quot;')}"
         data-glow="${atomGlow.replace(/"/g,'&quot;')}"
         data-orbitais='${JSON.stringify(_nuvemOrbs).replace(/'/g,'&#39;')}'
         data-el='${elJSON.replace(/'/g,'&#39;')}'>
    </div>`;
  return `<div class="raio-wrap" style="--atom-color:${atomCor};--atom-color-glow:${atomGlow}">
    ${toggleHtml}
    ${painelDadosHtml}
    ${painelGradeHtml}
    ${painelBohrHtml}
    ${painelLewisHtml}
    ${painelNuvemHtml}
  </div>`;
}
function renderBohr(Z, el, sub, atomCor, atomGlow, escala){
  escala = escala || 1;
  const dist     = distribuirEletrons(Z);
  const camadas  = porCamada(dist);
  const nCamadas = Object.keys(camadas).length;
  if(!nCamadas) return '';
  const elPorCamada = [];
  for(let n=1; n<=nCamadas; n++){
    const subs  = camadas[n]||[];
    const total = subs.reduce((a,{e})=>a+e,0);
    elPorCamada.push({n, total, nome:'KLMNOPQ'[n-1]||'?'});
  }
  const nVal    = nCamadas;
  const elVal   = elPorCamada[nCamadas-1].total;
  const nomeVal = elPorCamada[nCamadas-1].nome;
  const COR_BORDA  = resolverCorCSS('--border');
  const COR_DIM    = resolverCorCSS('--text-dim');
  const COR_ACCENT = resolverCorCSS('--accent');
  const COR_NUCLEO = resolverCorCSS('--bg-deep');
  const COR_TEXT   = resolverCorCSS('--text-main');
  function buildSVG(camPara, modo){
    const nC     = camPara.length;
    const R_NUC  = Math.round(32 * escala);
    /* PAD = faixa livre reservada nas QUATRO bordas, DENTRO do próprio
       quadrado. É nela que entram os rótulos.

       POR QUE MUDOU: existia MARG, uma sobra de 100px só à DIREITA
       (SVG_W = DIM + MARG). O viewBox ficava retangular (~1,5:1) e o
       núcleo, desenhado em DIM/2, caía à ESQUERDA do centro da caixa —
       era isso que produzia o átomo encostado num lado e a área vazia do
       outro na captura de tela cheia.

       Com PAD igual nos quatro lados o núcleo fica no centro geométrico e
       o viewBox fica QUADRADO: a mesma proporção 1:1 do Lewis (530x530) e
       da Nuvem (canvas aspect-ratio 1/1). Uma única regra de CSS passa a
       servir para as três vistas. */
    const AVAIL  = Math.round(320 * escala);
    const GAP    = Math.min(Math.round(38*escala), (AVAIL - R_NUC - 8) / nC);
    const R_EL   = Math.max(4.5*escala, Math.min(7*escala, GAP * 0.19));
    const R_OUT  = R_NUC + nC * GAP + R_EL + 6;
    /* FATOR compensa uma distorção que já existia: o corpo do texto era fixo
       (10px) enquanto o viewBox CRESCIA com o número de camadas — 282 no modo
       Valência, 510 no "Todas as camadas" do cobre, 738 no urânio. Como o
       desenho é exibido sempre na mesma caixa, quanto mais camadas, MENOR o
       texto na tela: os rótulos e as letras K/L/M/N do modo "Todas as
       camadas" chegavam a ~6px reais, ilegíveis. Escalar o texto junto com o
       viewBox mantém o tamanho aparente constante nos dois modos.
       O teto de 1,6 evita o outro extremo: PAD grande demais afastaria as
       órbitas das bordas e o desenho ficaria pequeno dentro do quadrado. */
    const FATOR  = Math.min(1.6, R_OUT / (R_NUC + GAP + R_EL + 6));
    const PAD    = Math.round(58 * escala * FATOR);
    const DIM    = (R_OUT + PAD) * 2;
    const SVG_W  = DIM;
    const SVG_H  = DIM;
    const CX = DIM/2, CY = DIM/2;
    /* fSz = rótulos das bordas e letras das camadas: acompanham o viewBox.
       fSzSm = número atômico, que fica DENTRO do núcleo. O núcleo tem raio
       fixo (R_NUC) em qualquer elemento, então esse texto não pode crescer,
       ou transbordaria o círculo. Mesma razão vale para symFS, o símbolo. */
    const fSz = Math.round(10 * escala * FATOR);
    const fSzSm = Math.round(8 * escala);
    const defs = `<defs>
      <marker id="mA-${Z}-${modo}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="${COR_ACCENT}"/>
      </marker>
      <marker id="mD-${Z}-${modo}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="${COR_DIM}"/>
      </marker>
    </defs>`;
    let p = [];
    camPara.forEach(({n:cn, total:nEl, nome:cnome}, idx)=>{
      const r   = R_NUC + (idx+1)*GAP;
      const isV = modo==='val' ? true : (cn===nVal);
      p.push(`<circle cx="${CX.toFixed(1)}" cy="${CY.toFixed(1)}" r="${r.toFixed(1)}"
        fill="none" stroke="${isV?atomCor:COR_BORDA}" stroke-width="${isV?2.2:1}"
        opacity="${isV?1:0.4}"/>`);
      if(modo==='all'){
        p.push(`<text x="${(CX-r-6).toFixed(1)}" y="${(CY+4).toFixed(1)}"
          text-anchor="end" font-family="Share Tech Mono,monospace"
          font-size="${fSz}" fill="${isV?atomCor:COR_DIM}" opacity="${isV?1:0.65}">${cnome}</text>`);
      }
    });
    camPara.forEach(({n:cn, total:nEl}, idx)=>{
      const r   = R_NUC + (idx+1)*GAP;
      const isV = modo==='val' ? true : (cn===nVal);
      for(let j=0; j<nEl; j++){
        const ang = (2*Math.PI*j/nEl) - Math.PI/2;
        const ex  = CX + r*Math.cos(ang);
        const ey  = CY + r*Math.sin(ang);
        if(isV) p.push(`<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}"
          r="${(R_EL+3).toFixed(1)}" fill="${atomGlow}" opacity="0.28"/>`);
        p.push(`<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}"
          r="${R_EL.toFixed(1)}" fill="${isV?atomCor:COR_DIM}"
          stroke="${isV?COR_NUCLEO:'none'}" stroke-width="${isV?1.2:0}"
          opacity="${isV?1:0.6}"/>`);
      }
    });
    const symLen = (el.simbolo||'').length;
    const symFS  = Math.round((symLen > 2 ? 16 : 20) * escala);
    p.push(
      `<circle cx="${CX.toFixed(1)}" cy="${CY.toFixed(1)}" r="${R_NUC}"
        fill="${COR_NUCLEO}" stroke="${atomCor}" stroke-width="${(2.5*escala).toFixed(1)}"/>`,
      `<text x="${CX.toFixed(1)}" y="${(CY+1).toFixed(1)}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Rajdhani,sans-serif" font-weight="700"
        font-size="${symFS}" fill="${atomCor}">${el.simbolo||''}</text>`,
      `<text x="${CX.toFixed(1)}" y="${(CY+R_NUC-8*escala).toFixed(1)}"
        text-anchor="middle" font-family="Share Tech Mono,monospace"
        font-size="${fSzSm}" fill="${COR_DIM}" opacity="0.8">${Z}</text>`
    );
    /* RÓTULOS — agora ancorados nas faixas PAD de cima e de baixo, com
       text-anchor="end" na borda direita interna. Antes eles saíam a
       partir da órbita para FORA do quadrado, e era essa fuga que exigia
       a sobra MARG à direita.

       As caixas <rect> de fundo saíram: o Lewis anota com texto solto e
       linha-guia tracejada, sem retângulo. Manter as caixas só no Bohr era
       a diferença mais visível entre as duas vistas em tela cheia. */
    const rVa   = R_NUC + camPara.length * GAP;
    const AX    = DIM - 10*escala;      // borda direita interna: fim do texto
    const LINHA = fSz*1.3;              // entrelinha
    /* onde a linha-guia para. Sai da LARGURA ESTIMADA do texto (o rótulo mais
       longo, "Camada de valência", tem 18 caracteres, e em Rajdhani cada um
       ocupa cerca de meio corpo de fonte), mais uma folga. Se fosse um número
       fixo em px, o texto cresceria com fSz e a linha entraria por baixo
       dele nos elementos com muitas camadas. */
    const FIM_L = AX - fSz*11;
    /* superior direito: o elétron de valência */
    const tY = PAD*0.42;
    p.push(
      `<line x1="${CX.toFixed(1)}" y1="${(CY-rVa-R_EL-2).toFixed(1)}"
             x2="${FIM_L.toFixed(1)}" y2="${(tY+LINHA*0.6).toFixed(1)}"
             stroke="${COR_DIM}" stroke-width="1" stroke-dasharray="3,2"
             marker-end="url(#mD-${Z}-${modo})"/>`,
      `<text x="${AX.toFixed(1)}" y="${tY.toFixed(1)}" text-anchor="end"
             font-family="Rajdhani,sans-serif" font-size="${fSz}"
             fill="${COR_DIM}">Elétron de valência</text>`,
      `<text x="${AX.toFixed(1)}" y="${(tY+LINHA).toFixed(1)}" text-anchor="end"
             font-family="Rajdhani,sans-serif" font-size="${fSz}"
             fill="${COR_DIM}">${elVal} no nível ${nomeVal}</text>`
    );
    /* inferior direito: a camada de valência */
    const bY = DIM - PAD*0.42;
    p.push(
      /* sentido: do RÓTULO para a órbita, para a seta apontar o que está
         sendo nomeado — como fazia o marcador ◄ da versão anterior. A linha
         do elétron, acima, corre no sentido oposto (do elétron para o texto)
         porque ali o que se aponta é a legenda, não o desenho. */
      `<line x1="${FIM_L.toFixed(1)}" y1="${(bY-LINHA*1.4).toFixed(1)}"
             x2="${(CX+rVa+R_EL+3).toFixed(1)}" y2="${CY.toFixed(1)}"
             stroke="${COR_ACCENT}" stroke-width="1.3"
             marker-end="url(#mA-${Z}-${modo})"/>`,
      `<text x="${AX.toFixed(1)}" y="${(bY-LINHA).toFixed(1)}" text-anchor="end"
             font-family="Rajdhani,sans-serif" font-size="${fSz}" font-weight="700"
             fill="${COR_ACCENT}">Camada de valência</text>`,
      `<text x="${AX.toFixed(1)}" y="${bY.toFixed(1)}" text-anchor="end"
             font-family="Rajdhani,sans-serif" font-size="${fSz}" font-weight="700"
             fill="${COR_ACCENT}">(${nomeVal}) — ${elVal} e⁻</text>`
    );
    return `<svg viewBox="0 0 ${SVG_W.toFixed(0)} ${SVG_H.toFixed(0)}"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="bohr-t-${Z}-${modo} bohr-d-${Z}-${modo}"
      >
      <title id="bohr-t-${Z}-${modo}">Diagrama de Bohr de ${el.nome||el.simbolo||''}</title>
      <desc id="bohr-d-${Z}-${modo}">Modelo de Bohr mostrando ${nCamadas} ${nCamadas===1?'camada eletrônica':'camadas eletrônicas'} ao redor do núcleo. A camada de valência ${nomeVal} contém ${elVal} ${elVal===1?'elétron':'elétrons'}.</desc>
      ${defs}
      ${p.join('\n      ')}
    </svg>`;
  }
  const svgVal = buildSVG([elPorCamada[nCamadas-1]], 'val');
  const svgAll = buildSVG(elPorCamada, 'all');
  const maxCap = [2,8,18,32,50,72,98];
  const fsCam  = Math.max(0.78, Math.min(1.4, escala));
  const linhas = elPorCamada.map(({n,total,nome})=>{
    const cap = maxCap[n-1]||2*n*n;
    const pct = Math.round(total/cap*100);
    const isV = n===nVal;
    return `<div class="bohr-camada-row" style="font-size:calc(${fsCam} * 0.78rem * var(--font-scale))">
      <span class="bohr-camada-nome" style="${isV?'color:'+atomCor:''}">${nome}</span>
      <span class="bohr-camada-el">${total}/${cap} e⁻</span>
      <div class="bohr-camada-bar-track">
        <div class="bohr-camada-bar-fill" style="width:${pct}%;background:${isV?atomCor:COR_DIM};opacity:${isV?1:0.5}"></div>
      </div>
      ${isV?`<span class="bohr-camada-val-tag">← valência</span>`:''}
    </div>`;
  }).join('');
  return `<div class="bohr-wrap">
    <div class="bohr-header">
      <span class="bohr-titulo">Diagrama de Bohr</span>
      <div class="raio-view-toggle" role="group" aria-label="Modo do diagrama Bohr">
        <button class="raio-vbtn ativo" id="bohr-btn-val-${Z}" aria-pressed="true"
                onclick="bohrModo('val','${Z}')">Valência</button>
        <button class="raio-vbtn" id="bohr-btn-all-${Z}" aria-pressed="false"
                onclick="bohrModo('all','${Z}')">Todas as camadas</button>
      </div>
    </div>
    <div class="bohr-svg-wrap">
      <div id="bohr-svg-val-${Z}">${svgVal}</div>
      <div id="bohr-svg-all-${Z}" style="display:none">${svgAll}</div>
    </div>
    <div class="bohr-camada-info">
      <span class="bohr-camada-titulo">Elétrons por camada</span>
      ${linhas}
    </div>
  </div>`;
}
function renderLewis(Z, el, sub, atomCor, atomGlow, escala){
  escala = escala || 1;
  if(!sub) return '<p class="raio-sem-dados">Diagrama de Lewis não disponível.</p>';
  const elV = sub.elCount;
  const dist    = distribuirEletrons(Z);
  const camadas = porCamada(dist);
  const nCam    = Object.keys(camadas).length;
  const subsCam = camadas[nCam]||[];
  const eValTotal = subsCam.reduce((a,{e})=>a+e,0);
  const maxLewis = (Z<=2) ? 2 : 8;
  const eL = Math.min(eValTotal, maxLewis);
  const COR_DIM    = resolverCorCSS('--text-dim');
  const COR_ACCENT = resolverCorCSS('--accent');
  const COR_TEXT   = resolverCorCSS('--text-main');
  const COR_BG     = resolverCorCSS('--bg-card');
  const COR_NUCLEO = resolverCorCSS('--bg-deep');
  const SZ   = Math.round(220 * escala);
  const CX   = SZ/2, CY = SZ/2;
  const BOX  = Math.round(36 * escala);
  const DIST = Math.round(54 * escala);
  const R_PT = 5.5 * escala;
  const GAP  = 14 * escala;
  const fSz  = Math.round(10 * escala);
  const FACES = [
    {dx:0,   dy:-DIST, ax: 0,  ay:-1, label:''},
    {dx:DIST, dy:0,    ax: 1,  ay: 0, label:''},
    {dx:0,   dy:DIST,  ax: 0,  ay: 1, label:''},
    {dx:-DIST,dy:0,    ax:-1,  ay: 0, label:''},
  ];
  const slots = [
    {fi:0,slot:0},{fi:1,slot:0},{fi:2,slot:0},{fi:3,slot:0},
    {fi:0,slot:1},{fi:1,slot:1},{fi:2,slot:1},{fi:3,slot:1},
  ].slice(0, eL);
  const ocup = [0,0,0,0];
  slots.forEach(({fi})=> ocup[fi]++);
  let parts = [];
  const defs = `<defs>
    <marker id="lmA-${Z}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${COR_ACCENT}"/>
    </marker>
  </defs>`;
  parts.push(`<rect width="${SZ}" height="${SZ}" fill="transparent"/>`);
  FACES.forEach(({dx,dy,ax,ay}, fi)=>{
    const n = ocup[fi];
    if(n===0) return;
    const fx = CX+dx, fy = CY+dy;
    if(n===1){
      parts.push(
        `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(R_PT+3).toFixed(1)}" fill="${atomGlow}" opacity="0.3"/>`,
        `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${R_PT}" fill="${atomCor}" stroke="${COR_NUCLEO}" stroke-width="1.2"/>`
      );
    } else {
      const px = ay!==0 ? GAP/2 : 0;
      const py = ax!==0 ? GAP/2 : 0;
      [-1,1].forEach(s=>{
        const ex = fx + s*px;
        const ey = fy + s*py;
        parts.push(
          `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(R_PT+2.5).toFixed(1)}" fill="${atomGlow}" opacity="0.28"/>`,
          `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${R_PT}" fill="${atomCor}" stroke="${COR_NUCLEO}" stroke-width="1.2"/>`
        );
      });
      parts.push(`<line x1="${(fx-px).toFixed(1)}" y1="${(fy-py).toFixed(1)}"
        x2="${(fx+px).toFixed(1)}" y2="${(fy+py).toFixed(1)}"
        stroke="${atomCor}" stroke-width="1" opacity="0.5"/>`);
    }
  });
  const symLen = (el.simbolo||'').length;
  const symFS  = Math.round((symLen > 2 ? 18 : 26) * escala);
  parts.push(
    `<rect x="${(CX-BOX).toFixed(1)}" y="${(CY-BOX).toFixed(1)}"
           width="${(BOX*2).toFixed(0)}" height="${(BOX*2).toFixed(0)}"
           rx="6" fill="${COR_NUCLEO}" stroke="${atomCor}" stroke-width="2"/>`,
    `<text x="${CX.toFixed(1)}" y="${(CY+2).toFixed(1)}"
           text-anchor="middle" dominant-baseline="middle"
           font-family="Rajdhani,sans-serif" font-weight="700"
           font-size="${symFS}" fill="${atomCor}">${el.simbolo||''}</text>`
  );
  const annoY = CY - DIST - R_PT - 22*escala;
  const annoX = CX + 38*escala;
  const annoTX = CX + 42*escala;
  parts.push(
    `<line x1="${(CX+4*escala).toFixed(1)}" y1="${(CY-DIST-R_PT-3*escala).toFixed(1)}"
           x2="${annoX.toFixed(1)}" y2="${(annoY+12*escala).toFixed(1)}"
           stroke="${COR_DIM}" stroke-width="1" stroke-dasharray="3,2"
           marker-end="url(#lmA-${Z})"/>`,
    `<text x="${annoTX.toFixed(1)}" y="${annoY.toFixed(1)}"
           font-family="Rajdhani,sans-serif" font-size="${fSz}"
           fill="${COR_ACCENT}" font-weight="700">${eValTotal} e⁻ de valência</text>`,
    `<text x="${annoTX.toFixed(1)}" y="${(annoY+12*escala).toFixed(1)}"
           font-family="Rajdhani,sans-serif" font-size="${fSz}"
           fill="${COR_DIM}">${sub.statusLabel}</text>`
  );
  const maxW = Math.round(260 * escala);
  const svgLewis = `<svg viewBox="0 0 ${SZ} ${SZ}"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="lewis-t-${Z} lewis-d-${Z}"
    style="max-width:${maxW}px;">
    <title id="lewis-t-${Z}">Diagrama de Lewis de ${el.nome||el.simbolo||''}</title>
    <desc id="lewis-d-${Z}">Estrutura de Lewis mostrando o símbolo ${el.simbolo||''} ao centro, rodeado por ${eValTotal} ${eValTotal===1?'elétron de valência':'elétrons de valência'} representados como pontos. Estado de preenchimento: ${sub.statusLabel}.</desc>
    ${defs}
    ${parts.join('\n    ')}
  </svg>`;
  const pares  = Math.floor(eL/2);
  const solt   = eL - pares*2;
  const legendaRows = [
    ['Elétrons de valência', `${eValTotal}`, atomCor],
    ['Pares de elétrons',    `${pares}`,     atomCor],
    ['Elétrons solitários',  `${solt}`,      COR_DIM],
    ['Estado',               sub.statusLabel, COR_ACCENT],
  ].map(([lbl,val,cor])=>
    `<div class="lewis-legenda-row">
      <div class="lewis-legenda-dot" style="background:${cor}"></div>
      <span class="lewis-legenda-lbl">${lbl}</span>
      <span class="lewis-legenda-val" style="color:${cor}">${val}</span>
    </div>`
  ).join('');
  const nota = eValTotal > 8
    ? `<p style="font-size:calc(0.72rem * var(--font-scale));color:${COR_DIM};font-style:italic;margin-top:4px">
        Nota: O diagrama de Lewis convencional representa até 8 e⁻ (octeto).
        Este elemento possui ${eValTotal} e⁻ na camada de valência —
        o excedente ocorre em elementos do bloco ${sub.bloco} com expansão de octeto.
       </p>` : '';
  return `<div class="lewis-wrap">
    <div class="lewis-header">
      <span class="lewis-titulo">Diagrama de Lewis — Elétrons de Valência</span>
    </div>
    <div class="lewis-svg-wrap">${svgLewis}</div>
    <div class="lewis-legenda">
      <span class="lewis-legenda-titulo">Legenda</span>
      ${legendaRows}
    </div>
    ${nota}
  </div>`;
}
function renderNuvem(Z, el, sub, atomCor, atomGlow){
  const dist    = distribuirEletrons(Z);
  const camadas = porCamada(dist);
  const nCam    = Object.keys(camadas).length;
  const orbitaisInfo = [];
  for(let n=1; n<=nCam; n++){
    const subs = camadas[n]||[];
    subs.forEach(({sub:s, e})=>{
      const tipo = s[s.length-1];
      const varMap = {s:'--orb-s', p:'--orb-p', d:'--orb-d', f:'--orb-f'};
      const cor = rgbToHex(resolverCorCSS(varMap[tipo]||'--orb-s'));
      orbitaisInfo.push({sub:s, e, tipo, n:parseInt(s[0]), cor});
    });
  }
  const orbitaisJSON = JSON.stringify(orbitaisInfo);
  const resumoOrbitais = orbitaisInfo.map(o=>`${o.sub} com ${o.e} ${o.e===1?'elétron':'elétrons'}`).join(', ');
  return `<div class="nuvem-wrap">
    <div class="nuvem-header">
      <span class="nuvem-titulo" id="nuvem-titulo-${Z}">Nuvem Eletrônica de Probabilidade</span>
      <div class="nuvem-controles" role="group" aria-label="Controles da nuvem">
        <label class="nuvem-label" for="nuvem-orb-${Z}">Orbital:</label>
        <select class="nuvem-select" id="nuvem-orb-${Z}" aria-label="Selecionar orbital a exibir" onchange="nuvemMudarOrbital(${Z})">
          <option value="all">Todos</option>
          ${orbitaisInfo.map(o=>`<option value="${o.sub}">${o.sub} (${o.e} e⁻)</option>`).join('')}
        </select>
      </div>
    </div>
    <canvas id="nuvem-canvas-${Z}" class="nuvem-canvas"
            role="img"
            aria-label="Representação artística da nuvem eletrônica de probabilidade do ${el.nome}. Distribuição por orbitais: ${resumoOrbitais}. A densidade de pontos indica a probabilidade de encontrar elétrons em cada região."
            data-z="${Z}" data-orbitais='${orbitaisJSON}'
            data-cor="${atomCor}" data-glow="${atomGlow}"></canvas>
    <p class="sr-only">Descrição textual: a nuvem eletrônica do ${el.nome} é formada pelos orbitais ${resumoOrbitais}. Cada cor na legenda abaixo corresponde a um tipo de orbital.</p>
    <div class="nuvem-legenda" id="nuvem-legenda-${Z}"></div>
  </div>`;
}
function nuvemIniciarCanvas(Z, forceOrbital){
  const canvas = document.getElementById('nuvem-canvas-'+Z);
  if(!canvas) return;
  const sel    = document.getElementById('nuvem-orb-'+Z);
  const orbital= forceOrbital || (sel ? sel.value : 'all');
  _nuvemDrawOnCanvas(canvas, orbital);
  nuvemLegenda(canvas.closest('.nuvem-wrap'), canvas, orbital);
}
function nuvemLegenda(container, canvas, orbital){
  const leg = container ? container.querySelector('.nuvem-legenda') : null;
  if(!leg || !canvas) return;
  const orbs  = JSON.parse(canvas.dataset.orbitais||'[]');
  const shown = (orbital && orbital !== 'all') ? orbs.filter(o=>o.sub===orbital) : orbs;
  leg.innerHTML = shown.map(o=>`<div class="nuvem-leg-row"><span class="nuvem-leg-dot" style="background:${o.cor}"></span><span class="nuvem-leg-sub">${o.sub}</span><span class="nuvem-leg-e">${o.e} e⁻</span></div>`).join('');
}
function nuvemMudarOrbital(Z){
  const canvas = document.getElementById('nuvem-canvas-'+Z);
  const sel    = document.getElementById('nuvem-orb-'+Z);
  if(!canvas) return;
  const orbital = sel ? sel.value : 'all';
  _nuvemDrawOnCanvas(canvas, orbital);
  nuvemLegenda(canvas.closest('.nuvem-wrap'), canvas, orbital);
}

/* ===== FULLSCREEN ===== */
let _fsZ = null, _fsVista = null;
/* Orçamento de espaço do modo tela cheia, num lugar só. Antes cada
   vista tinha seus próprios números soltos (0.88/0.72 no Bohr,
   0.55/0.72 no Lewis, nada na Grade), e era por isso que uma vista
   ficava pequena e a outra estourava a tela.
   As sobras cobrem o cabeçalho, o respiro lateral e a legenda. */
const FS_MARGEM_W  = 0.90;   // fração da largura útil
const FS_MARGEM_H  = 0.74;   // fração da altura útil (desconta cabeçalho)
const FS_ESCALA_MAX = 4.0;   // teto: além disso o traço fica grosseiro
/* Escala usada ao gerar o SVG em tela cheia. NAO define o tamanho na
   tela — isso e do CSS. Define a PROPORCAO interna do desenho: espessura
   de traco e corpo de texto em relacao ao circulo. 1 mantem as mesmas
   proporcoes do desenho dentro do modal. */
const FS_ESCALA_DESENHO = 1;
const FS_ESCALA_MIN_FATOR = 0.42;  // piso da redução da 2ª passada

/* A segunda passada de ajuste (_fsCaberNaTela) foi removida: ela media o
   transbordo e encolhia a escala do SVG para caber. Nao faz mais sentido —
   o tamanho passou a ser definido pela caixa do CSS, que cabe por
   construcao, e a funcao ficava reduzindo a escala em vao, deixando o
   desenho cada vez menor sem resolver nada. */
/* silencioso=true é usado pelo recálculo de resize/rotação: refaz o
   desenho sem reanunciar no leitor de tela nem mexer no foco, que
   seria intrusivo a cada arraste da janela. */
function abrirFullscreen(vista, Z, silencioso){
  _fsZ = Z; _fsVista = vista;
  const ov    = document.getElementById('fullscreen-overlay');
  const body  = document.getElementById('fullscreen-body');
  const title = document.getElementById('fullscreen-title');
  if(!ov || !body) return;
  const titulos = {grade:'Grade de Raios Atômicos', bohr:'Diagrama de Bohr', lewis:'Diagrama de Lewis', nuvem:'Nuvem Eletrônica de Probabilidade'};
  title.textContent = titulos[vista] || vista;
  const srcPainel = document.getElementById('raio-painel-'+vista+'-'+Z);
  if(!srcPainel) return;
  const atomCor  = srcPainel.dataset.cor  || '#00e5ff';
  const atomGlow = srcPainel.dataset.glow || 'rgba(0,229,255,0.5)';
  const elData   = JSON.parse(srcPainel.dataset.el || '{}');
  const Z_num    = parseInt(srcPainel.dataset.z) || Z;
  const sub      = ultimoSubnivel(Z_num);
  const allEls   = [...elementosBase, ...lantanideos, ...actinideos];
  const el       = allEls.find(e=>e.numero===Z_num) || elData;
  const VH = window.innerHeight - 52;
  const VW = window.innerWidth;
  body.innerHTML = '';
  if(vista === 'grade'){
    const { mesmoPer, mesmoGrp } = vizinhosRaio(Z_num, el, allEls);
    /* A grade usava (r/260)*110, SEM o piso de 14px que a versão dentro
       do modal tem. Resultado: o hidrogênio (31 pm) saía com 13px em
       tela cheia contra 19px no modal — MENOR ao expandir. Agora usa a
       mesma fórmula da versão embutida, multiplicada por um fator de
       ampliação calculado a partir do espaço real disponível.
       O fator considera a maior das duas fileiras (período e grupo),
       porque é ela que define a largura necessária. */
    const nMaior     = Math.max(mesmoPer.length, mesmoGrp.length) + 1;
    const larguraNec = nMaior * (60 + 14);        // esfera máxima + gap
    const alturaNec  = 2 * (60 + 58);             // duas fileiras + rótulos
    const escalaGrade = Math.min(
      (VW * FS_MARGEM_W) / larguraNec,
      (VH * FS_MARGEM_H) / alturaNec,
      FS_ESCALA_MAX
    );
    const esfera = (e, isA) => {
      const r = RAIO[e.numero]; if(!r) return '';
      const cE = corBlocoDe(e.numero, getCatColorHex(e.cat));
      const h6 = cE.replace('#','');
      const gE = h6.length>=6?`rgba(${parseInt(h6.slice(0,2),16)},${parseInt(h6.slice(2,4),16)},${parseInt(h6.slice(4,6),16)},0.4)`:'rgba(136,136,136,0.4)';
      const d  = Math.round((14 + (r.r/RAIO_MAX_PM)*46) * escalaGrade);
      const bd = isA?`outline:3px solid var(--accent);outline-offset:3px;`:'';
      return `<div class="raio-grade-item fs-grade-item"><div class="raio-grade-esfera" style="width:${d}px;height:${d}px;--esfera-cor:${cE};--esfera-glow:${gE};${bd}" aria-label="${e.nome}: ${r.r} pm"></div><span class="raio-grade-sim fs-grade-sim" style="color:${isA?'var(--accent)':'var(--text-dim)'}">${e.simbolo}</span><span class="raio-grade-val fs-grade-val">${r.r} pm</span></div>`;
    };
    const blocoFs = (lista, atual, titulo, seta) => {
      if(!lista.length) return '';
      const todos = [...lista, atual].sort((a,b)=>a.grupo-b.grupo||((a.periodo||0)-(b.periodo||0)));
      return `<div class="raio-grade-wrap visivel fs-grade-wrap"><span class="raio-grade-titulo fs-grade-titulo">${titulo}</span><div class="raio-grade fs-grade">${todos.map(e=>esfera(e,e.numero===Z_num)).join('')}</div><div class="raio-grade-setas">${seta}</div></div>`;
    };
    const gPer = blocoFs(mesmoPer, el, `Período ${(el.periodo||0)<=7?el.periodo:(el.cat==='Lantanídeo'?6:7)} — raio diminui →`, '← raio maior &nbsp;&nbsp;&nbsp; raio menor →');
    const gGrp = blocoFs(mesmoGrp, el, `Grupo ${el.grupo} — raio aumenta ↓`, '↑ raio menor &nbsp;&nbsp;&nbsp; raio maior ↓');
    body.innerHTML = `<div class="fs-grade-container">${gPer}${gGrp}</div>`;
  } else if(vista === 'bohr'){
    /* ESCALA FIXA — e nao calculada da viewport.
       O SVG e vetorial e tem viewBox: quem decide o tamanho na tela e a
       CAIXA definida no CSS, e o preserveAspectRatio padrao ajusta o
       desenho dentro dela. Calcular a escala aqui era redundante e
       prejudicial: mudava a PROPORCAO do viewBox conforme a janela (as
       constantes +16 e +100 nao escalam junto), entao o desenho tinha
       proporcoes diferentes em cada tela. Com escala fixa, tela cheia e
       modal mostram exatamente o mesmo desenho, so em tamanhos
       diferentes — e o CSS faz o resto.
       Nao ha mais _fsCaberNaTela aqui: a caixa do CSS ja cabe por
       construcao, e a segunda passada estava encolhendo a escala em vao. */
    const wrap = document.createElement('div');
    wrap.className = 'fs-bohr-wrap';
    wrap.innerHTML = renderBohr(Z_num, el, sub, atomCor, atomGlow, FS_ESCALA_DESENHO);
    body.appendChild(wrap);
  } else if(vista === 'lewis'){
    // mesma razao do Bohr: escala fixa, tamanho definido pelo CSS
    const wrap = document.createElement('div');
    wrap.className = 'fs-lewis-wrap';
    wrap.innerHTML = renderLewis(Z_num, el, sub, atomCor, atomGlow, FS_ESCALA_DESENHO);
    body.appendChild(wrap);
  } else if(vista === 'nuvem'){
    const orbitaisData = srcPainel.dataset.orbitais || '[]';
    const nuvemHTML = renderNuvem(Z_num, el, sub, atomCor, atomGlow);
    body.innerHTML = `<div class="fs-nuvem-wrap">${nuvemHTML}</div>`;
    const canvas = body.querySelector('canvas');
    const sel    = body.querySelector('.nuvem-select');
    if(canvas){
      canvas.dataset.z        = Z_num;
      canvas.dataset.orbitais = orbitaisData;
      canvas.dataset.cor      = atomCor;
      canvas.dataset.glow     = atomGlow;
      canvas.classList.add('fs-nuvem-canvas');
    }
    if(sel) sel.onchange = ()=>{ if(canvas){ _nuvemDrawOnCanvas(canvas, sel.value); nuvemLegenda(body, canvas, sel.value); } };
    setTimeout(()=>{
      if(canvas){ _nuvemDrawOnCanvas(canvas, 'all'); nuvemLegenda(body, canvas, 'all'); }
    }, 50);
  }
  ov.classList.add('aberto');
  ov.setAttribute('aria-hidden','false');
  if(!silencioso){
    document.getElementById('btnFullscreenClose').focus();
    anunciar(`${titulos[vista]||vista} expandido para tela cheia.`);
  }
}
function _nuvemDrawOnCanvas(canvas, orbital){
  if(!canvas) return;
  const orbitaisInfo = JSON.parse(canvas.dataset.orbitais||'[]');
  const atomCor = canvas.dataset.cor || '#00e5ff';
  const Z_num   = parseInt(canvas.dataset.z)||1;
  const DIM = Math.max(canvas.offsetWidth, canvas.offsetHeight, 340);
  canvas.width  = DIM;
  canvas.height = DIM;
  const ctx = canvas.getContext('2d');
  /* getContext pode devolver null: navegador sem suporte a canvas 2D,
     contexto perdido (troca de GPU, aba suspensa por muito tempo) ou
     ambiente sem renderizacao. Sem esta guarda a funcao lancava
     "Cannot read properties of null" e o painel da nuvem ficava em
     branco, sem nenhuma mensagem. */
  if(!ctx){
    const aviso = canvas.parentElement;
    if(aviso && !aviso.querySelector('.nuvem-sem-canvas')){
      const p = document.createElement('p');
      p.className = 'nuvem-sem-canvas raio-sem-dados';
      p.textContent = 'Não foi possível desenhar a nuvem eletrônica neste navegador. '
        + 'A distribuição em texto continua disponível no card de configuração eletrônica.';
      aviso.appendChild(p);
    }
    return;
  }
  ctx.clearRect(0,0,DIM,DIM);
  const bg = resolverCorCSS('--bg-card');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,DIM,DIM);
  const CX = DIM/2, CY = DIM/2;
  const MAX_R = DIM*0.46;
  const SHELL_SCALE = { s:1.0, p:0.78, d:0.6, f:0.45 };
  const N_DOTS = Math.min(12000, Math.max(2000, Z_num * 60));
  function hexToRgb(hex){
    if(!hex) return {r:0,g:229,b:255};
    const mRgb = hex.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if(mRgb) return {r:parseInt(mRgb[1]),g:parseInt(mRgb[2]),b:parseInt(mRgb[3])};
    const h = hex.replace('#','');
    if(h.length < 6) return {r:0,g:229,b:255};
    return {r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16)};
  }
  const toRender = orbital === 'all' ? orbitaisInfo : orbitaisInfo.filter(o=>o.sub===orbital);
  if(!toRender.length) return;
  const totalE = toRender.reduce((a,o)=>a+o.e,0);
  toRender.forEach(orb=>{
    const frac = orb.e / totalE;
    const nDots = Math.round(N_DOTS * frac);
    const nLevel = orb.n;
    const tipo   = orb.tipo;
    const scale  = SHELL_SCALE[tipo] || 1.0;
    const baseR  = MAX_R * (nLevel / 7) * scale;
    const spread = baseR * (0.35 + 0.15*(tipo==='s'?0:tipo==='p'?1:tipo==='d'?2:3));
    const {r:cr, g:cg, b:cb} = hexToRgb(orb.cor);
    for(let i=0; i<nDots; i++){
      let x, y, alpha;
      if(tipo === 's'){
        const u = Math.random();
        const r = baseR * Math.pow(u, 1/3) + (Math.random()-0.5)*spread*0.6;
        const theta = Math.random() * Math.PI * 2;
        x = CX + r * Math.cos(theta);
        y = CY + r * Math.sin(theta);
        alpha = 0.55 - (r/(baseR+spread))*0.4;
      } else if(tipo === 'p'){
        const lobe = Math.random() < 0.5 ? 1 : -1;
        const r = baseR * (0.5 + Math.random() * 0.9);
        const ang = (Math.random() - 0.5) * Math.PI * 0.7;
        x = CX + lobe * r * Math.cos(ang);
        y = CY + r * Math.sin(ang) * 0.5;
        alpha = 0.5 * (1 - Math.abs(ang) / (Math.PI*0.7)*0.5);
      } else if(tipo === 'd'){
        const lobe = Math.floor(Math.random()*4);
        const ang0 = lobe * Math.PI/2 + Math.PI/4;
        const r  = baseR * (0.3 + Math.random() * 0.85);
        const jitter = (Math.random()-0.5) * spread * 0.9;
        x = CX + (r + jitter) * Math.cos(ang0 + (Math.random()-0.5)*0.6);
        y = CY + (r + jitter) * Math.sin(ang0 + (Math.random()-0.5)*0.6);
        alpha = 0.4 + Math.random()*0.2;
      } else {
        const lobe = Math.floor(Math.random()*7);
        const ang0 = lobe * (Math.PI*2/7);
        const r  = baseR * (0.25 + Math.random() * 0.75);
        const jitter = (Math.random()-0.5) * spread * 1.1;
        x = CX + (r + jitter) * Math.cos(ang0 + (Math.random()-0.5)*0.4);
        y = CY + (r + jitter) * Math.sin(ang0 + (Math.random()-0.5)*0.4);
        alpha = 0.3 + Math.random()*0.25;
      }
      alpha = Math.max(0.05, Math.min(0.82, alpha));
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(2)})`;
      ctx.fill();
    }
  });
  const grd = ctx.createRadialGradient(CX,CY,1,CX,CY,14);
  const {r:nr,g:ng,b:nb} = hexToRgb(atomCor);
  grd.addColorStop(0, `rgba(${nr},${ng},${nb},0.95)`);
  grd.addColorStop(0.5,`rgba(${nr},${ng},${nb},0.5)`);
  grd.addColorStop(1,  `rgba(${nr},${ng},${nb},0)`);
  ctx.beginPath();
  ctx.arc(CX,CY,14,0,Math.PI*2);
  ctx.fillStyle = grd;
  ctx.fill();
}
/* As escalas são calculadas UMA vez, na abertura, a partir de
   window.innerWidth/innerHeight. Girar o celular ou redimensionar a
   janela deixava o desenho na escala antiga — pequeno demais ou
   estourando. _fsZ e _fsVista já eram guardados, mas ninguém os usava:
   agora servem para reabrir a mesma vista com as medidas novas.
   O debounce evita recalcular a cada pixel durante o arraste. */
let _fsResizeTimer = null;
function _fsRecalcular(){
  if(_fsZ === null || !_fsVista) return;           // fullscreen fechado
  abrirFullscreen(_fsVista, _fsZ, true);           // true = sem anúncio/foco
}
window.addEventListener('resize', ()=>{
  if(_fsZ === null) return;
  clearTimeout(_fsResizeTimer);
  _fsResizeTimer = setTimeout(_fsRecalcular, 180);
});
window.addEventListener('orientationchange', ()=>{
  if(_fsZ === null) return;
  clearTimeout(_fsResizeTimer);
  // a rotação só reporta as medidas novas depois do reflow
  _fsResizeTimer = setTimeout(_fsRecalcular, 320);
});
function fecharFullscreen(){
  const ov = document.getElementById('fullscreen-overlay');
  if(!ov) return;
  ov.classList.remove('aberto');
  ov.setAttribute('aria-hidden','true');
  _fsZ = null; _fsVista = null;
  anunciar('Tela cheia fechada.');
}
function raioLazyRender(vista, Z){
  const painel = document.getElementById('raio-painel-'+vista+'-'+Z);
  if(!painel || painel.dataset.rendered) return;
  painel.dataset.rendered = '1';
  const atomCor  = painel.dataset.cor  || '#00e5ff';
  const atomGlow = painel.dataset.glow || 'rgba(0,229,255,0.5)';
  const elData   = JSON.parse(painel.dataset.el || '{}');
  const Z_num    = parseInt(painel.dataset.z) || Z;
  const sub      = ultimoSubnivel(Z_num);
  const allEls = [...elementosBase, ...lantanideos, ...actinideos];
  const el     = allEls.find(e=>e.numero===Z_num) || elData;
  const fsBar = `<div class="painel-fullscreen-bar">
    <button class="painel-fullscreen-btn" aria-label="Expandir para tela cheia"
            onclick="abrirFullscreen('${vista}','${Z}')">${ICO.telacheia} Tela cheia</button>
  </div>`;
  if(vista === 'grade'){
    const dados      = RAIO[Z_num];
    const allEls2    = [...elementosBase, ...lantanideos, ...actinideos];
    const { mesmoPer, mesmoGrp } = vizinhosRaio(Z_num, el, allEls2);
    const esferaGrade = (e, isAtual) => {
      const r = RAIO[e.numero];
      if(!r) return '';
      const corE  = corBlocoDe(e.numero, getCatColorHex(e.cat));
      const h6    = corE.replace('#','');
      const glowE = h6.length>=6
        ? `rgba(${parseInt(h6.slice(0,2),16)},${parseInt(h6.slice(2,4),16)},${parseInt(h6.slice(4,6),16)},0.4)`
        : 'rgba(136,136,136,0.4)';
      const d     = Math.round(14+(r.r/RAIO_MAX_PM)*46);
      const bord  = isAtual ? `outline:2px solid var(--accent);outline-offset:2px;` : '';
      return `<div class="raio-grade-item">
        <div class="raio-grade-esfera" style="width:${d}px;height:${d}px;--esfera-cor:${corE};--esfera-glow:${glowE};${bord}"
             aria-label="${e.nome}: ${r.r} pm"></div>
        <span class="raio-grade-sim" style="color:${isAtual?'var(--accent)':'var(--text-dim)'}">${e.simbolo}</span>
        <span class="raio-grade-val">${r.r} pm</span>
      </div>`;
    };
    const blocoGrade = (lista, atual, titulo, seta) => {
      if(!lista.length) return '';
      const todos = [...lista, atual].sort((a,b)=>a.grupo-b.grupo||((a.periodo||0)-(b.periodo||0)));
      const items = todos.map(e=>esferaGrade(e, e.numero===Z_num)).join('');
      return `<div class="raio-grade-wrap visivel">
        <span class="raio-grade-titulo">${titulo}</span>
        <div class="raio-grade">${items}</div>
        <div class="raio-grade-setas"><span>${seta}</span></div>
      </div>`;
    };
    const gradePer = blocoGrade(mesmoPer, el, `Período ${(el.periodo||0)<=7?el.periodo:(el.cat==='Lantanídeo'?6:7)} — raio diminui →`, '← raio maior &nbsp;&nbsp;&nbsp; raio menor →');
    const gradeGrp = blocoGrade(mesmoGrp, el, `Grupo ${el.grupo} — raio aumenta ↓`, '↑ raio menor &nbsp;&nbsp;&nbsp; raio maior ↓');
    painel.innerHTML = fsBar + `<div id="raio-grade-container-${Z_num}">${gradePer}${gradeGrp}</div>`;
  } else if(vista === 'bohr'){
    painel.innerHTML = fsBar + renderBohr(Z_num, el, sub, atomCor, atomGlow);
  } else if(vista === 'lewis'){
    painel.innerHTML = fsBar + renderLewis(Z_num, el, sub, atomCor, atomGlow);
  } else if(vista === 'nuvem'){
    painel.innerHTML = fsBar + renderNuvem(Z_num, el, sub, atomCor, atomGlow);
    setTimeout(()=>{ nuvemIniciarCanvas(Z_num); }, 30);
  }
}
function raioVista(vista, Z, btnEl){
  const ids    = ['dados','grade','bohr','lewis','nuvem'];
  const paineis = ids.map(id => document.getElementById('raio-painel-'+id+'-'+Z));
  const btns    = ids.map(id => document.getElementById('rbtn-'+id+'-'+Z));
  ids.forEach((id, i) => {
    const active = id === vista;
    if(paineis[i]) paineis[i].style.display = active ? '' : 'none';
    if(btns[i]){
      btns[i].classList.toggle('ativo', active);
      btns[i].setAttribute('aria-pressed', String(active));
    }
  });
  if(vista !== 'dados'){
    raioLazyRender(vista, Z);
  }
}
function bohrModo(modo, Z){
  const svgVal  = document.getElementById('bohr-svg-val-'+Z);
  const svgAll  = document.getElementById('bohr-svg-all-'+Z);
  const btnVal  = document.getElementById('bohr-btn-val-'+Z);
  const btnAll  = document.getElementById('bohr-btn-all-'+Z);
  if(!svgVal || !svgAll) return;
  const isVal = modo === 'val';
  svgVal.style.display  = isVal ? '' : 'none';
  svgAll.style.display  = isVal ? 'none' : '';
  btnVal.classList.toggle('ativo', isVal);
  btnVal.setAttribute('aria-pressed', String(isVal));
  btnAll.classList.toggle('ativo', !isVal);
  btnAll.setAttribute('aria-pressed', String(!isVal));
}
let estadoSeries={lantanideos:false,actinideos:false};
let elementoAtivo=null,divAtiva=null;
let filtroCategoria=null,filtroEstado=null,filtroLamber=null;
const botoesToggle={},posicaoMap={};
const modalOverlay=document.getElementById('modalOverlay');
const btnClose=document.getElementById('btnClose');
function abrirModal(el,divEl){
  // estado na temperatura ATUAL do controle, para o modal não contradizer
  // o card que o usuário acabou de clicar
  const est=estadoNaTemperatura(el.numero, tempAtual);
  const cc=CAT_COLOR[el.cat]||'var(--text-dim)';
  const ccHex=getCatColorHex(el.cat)||'#888';
  const estHex=getEstadoHex(est);
  if(elementoAtivo===el.numero){fecharModal();return;}
  if(divAtiva)divAtiva.classList.remove('selected');
  elementoAtivo=el.numero;divAtiva=divEl;divEl.classList.add('selected');
  const sym=document.getElementById('modalSymbol');
  sym.textContent=el.simbolo;sym.style.color=ccHex;
  document.getElementById('modalNumber').textContent='#'+el.numero;
  const nm=document.getElementById('modalName');
  nm.textContent=el.nome;nm.style.color=ccHex;
  (()=>{
    /* No modal cabe o intervalo completo, que no card seria truncado.
       O intervalo NÃO é imprecisão de medida: é variação natural da
       abundância isotópica, e por isso vale explicar em vez de esconder. */
    const iv = MASSA_INTERVALO[el.numero];
    const box = document.getElementById('modalMass');
    box.textContent = 'Massa: ' + (MASSA[el.numero]||'—') + ' u';
    if(iv){
      const nota = document.createElement('span');
      nota.className = 'modal-mass-intervalo';
      nota.textContent = `intervalo [${iv[0]}; ${iv[1]}] u`;
      nota.title = 'A massa atômica deste elemento varia naturalmente conforme a origem da amostra, por causa da variação na abundância dos seus isótopos. A CIAAW publica um intervalo em vez de um valor único.';
      box.appendChild(nota);
    }
  })();
  const familia=FAMILIA[el.grupo]||'—';
  const periodo=(el.periodo||0)<=7?el.periodo:(el.cat==='Lantanídeo'?6:7);
  document.getElementById('modalMeta').textContent='Família '+familia+' · Período '+periodo+' · '+el.cat;
  document.getElementById('modalBadges').innerHTML=
    (modoLamber ? '' : `<span class="badge" style="background:${estHex}22;color:${estHex};border-color:${estHex}55">${ESTADO_DOT[est]} ${ESTADO_LABEL[est]}</span>`)+
    `<span class="badge" style="background:${ccHex}22;color:${ccHex};border-color:${ccHex}55">${el.cat}</span>`+
    (modoLamber && LAMBER[el.numero] ? `<span class="badge lamber-badge" style="background:${LAMBER_HEX[LAMBER[el.numero]]}22;color:${LAMBER_HEX[LAMBER[el.numero]]};border-color:${LAMBER_HEX[LAMBER[el.numero]]}55">${LAMBER_EMOJI[LAMBER[el.numero]]} ${LAMBER_LABEL[LAMBER[el.numero]]}</span>` : '');
  document.getElementById('stateCard').style.borderLeftColor=estHex;
  document.getElementById('modalName').style.color=ccHex;
  (()=>{
    /* Card de estado físico: além da descrição, mostra os dois pontos que
       o cálculo usa, e a temperatura corrente quando ela saiu de 25 °C.
       Assim o aluno vê DE ONDE veio o estado que está na tela. */
    // el.numero, não Z: o const Z de abrirModal é declarado depois deste
    // bloco e estaria na zona morta (TDZ)
    const zz = el.numero;
    const box = document.getElementById('modalState');
    const f = FUSAO[zz], e = EBULICAO[zz];
    const fmt = v => v === null ? '—' : String(v).replace('.', ',') + ' °C';
    box.innerHTML = `<p class="est-desc">${ESTADO_DESC[est]}</p>
      <div class="est-pontos">
        <span><b>Fusão</b> ${fmt(f)}</span>
        <span><b>${sublima(zz) ? 'Sublimação' : 'Ebulição'}</b> ${fmt(e)}</span>
      </div>`
      + (sublima(zz) ? `<p class="est-nota">A 1 atm este elemento passa de sólido direto a gás: nunca é líquido.</p>` : '')
      + (tempAtual !== TEMP_REF
        ? `<p class="est-temp-aviso">${ICO.aviso} Estado calculado a ${tempAtual} °C, e não na referência de ${TEMP_REF} °C.</p>`
        : '');
  })();
  const Z=el.numero,N=calcNeutrons(Z);
  document.getElementById('modalParticles').innerHTML=
    `<div class="particle-box"><span class="pval" style="color:var(--orb-d)">${Z}</span><span class="plabel">Prótons</span></div>`+
    `<div class="particle-box"><span class="pval" style="color:var(--orb-f)">${N}</span><span class="plabel">Nêutrons</span></div>`+
    `<div class="particle-box"><span class="pval" style="color:var(--orb-s)">${Z}</span><span class="plabel">Elétrons</span></div>`;
  document.getElementById('modalConfig').innerHTML=renderConfig(Z);
  document.getElementById('modalObtencao').textContent=el.obtencao||'—';
  document.getElementById('modalCuriosidade').textContent=CURIOSIDADES[el.numero]||'—';
  document.getElementById("modalRaio").innerHTML=renderRaio(Z,el,ccHex);
  renderCardsPropriedade(Z, el);
  modalOverlay.classList.add('aberto');
  modalOverlay.setAttribute('aria-hidden','false');
  anunciar(`${el.nome}, número atômico ${Z}, ${el.cat}, ${ESTADO_LABEL[est]}.`);
  setTimeout(()=>btnClose.focus(),260);
}
function fecharModal(){
  modalOverlay.classList.remove('aberto');
  modalOverlay.setAttribute('aria-hidden','true');
  document.querySelector('.modal-body').scrollTop = 0;
  if(divAtiva){divAtiva.classList.remove('selected');divAtiva.focus();}
  elementoAtivo=null;divAtiva=null;
  anunciar('Modal fechado.');
}
btnClose.addEventListener('click',fecharModal);
modalOverlay.addEventListener('click',e=>{if(e.target===modalOverlay)fecharModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalOverlay.classList.contains('aberto'))fecharModal();});
modalOverlay.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const foc=[...modalOverlay.querySelectorAll('button,[tabindex="0"],[href],input,select,textarea')].filter(el=>!el.disabled);
  const first=foc[0],last=foc[foc.length-1];
  if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}
  else{if(document.activeElement===last){e.preventDefault();first.focus();}}
});
function verbalizarConfig(notacao){
  const sup2n = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  return notacao.split(/\s+/).map(termo=>{
    let base = '', exp = '';
    for(const ch of termo){
      if(sup2n[ch] !== undefined) exp += sup2n[ch]; else base += ch;
    }
    if(!exp) return base;
    if(exp === '1') return `${base} com 1 elétron`;
    if(exp === '2') return `${base} com 2 elétrons`;
    return `${base} com ${exp} elétrons`;
  }).join(', ');
}
function renderConfig(Z){
  const notacao=CONFIG_EC[Z];
  if(!notacao){
    return `<div class="ec-title">Notação eletrônica</div>
<p class="ec-aviso">Configuração não disponível para este elemento (Z=${Z}).</p>`;
  }
  const aviso = Z>=104
    ? `<p class="ec-aviso">${ICO.aviso} Configuração prevista por cálculos relativísticos — este é um elemento sintético superpesado.</p>`
    : '';
  const dist=distribuirEletrons(Z);
  const camadas=porCamada(dist);
  let html=`<div class="ec-title">Notação eletrônica</div>${aviso}<div class="ec-full" role="text" aria-label="Configuração eletrônica: ${verbalizarConfig(notacao)}">${notacao}</div>
<div class="ec-title tecnico-avancado" style="margin-top:6px">Por camada (Diagrama de Pauling)</div><div class="ec-camadas tecnico-avancado">`;
  const nMax=Object.keys(camadas).length;
  for(let n=1;n<=nMax;n++){
    const nome=CAMADAS_NOME[n-1]||'?';
    const subs=camadas[n]||[];
    const orbs=subs.map(({sub,e})=>{
      const tipo=sub[1];
      const col={s:'var(--orb-s)',p:'var(--orb-p)',d:'var(--orb-d)',f:'var(--orb-f)'}[tipo]||'var(--text-dim)';
      const exp=String(e).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(d)]).join('');
      const leitura = e===1 ? `${sub} com 1 elétron` : `${sub} com ${e} elétrons`;
      return `<span class="ec-orbital" style="color:${col}" role="text" aria-label="${leitura}">${sub}${exp}</span>`;
    }).join(' ');
    html+=`<div class="ec-row"><span class="ec-camada-name" aria-label="Camada ${nome}">${nome}</span><div class="ec-orbitals">${orbs}</div></div>`;
  }
  return html+'</div>';
}
function abrirSerie(s){estadoSeries[s]=true;setTimeout(()=>tabindexMovel(),0);document.getElementById(`linha-${s}`)?.classList.remove('recolhida');if(botoesToggle[s]){botoesToggle[s].classList.add('aberta');botoesToggle[s].setAttribute('aria-expanded','true');}}
function fecharSerie(s){estadoSeries[s]=false;setTimeout(()=>tabindexMovel(),0);document.getElementById(`linha-${s}`)?.classList.add('recolhida');if(botoesToggle[s]){botoesToggle[s].classList.remove('aberta');botoesToggle[s].setAttribute('aria-expanded','false');}}
function elementoBateFiltro(Z,cat){
  // estado CALCULADO, não ESTADO[Z]: senão o filtro continuaria filtrando
  // pelo estado a 25 °C depois de mexer no controle de temperatura
  const est = estadoNaTemperatura(Z, tempAtual);
  return (!filtroCategoria||cat===filtroCategoria)&&(!filtroEstado||est===filtroEstado)&&(!filtroLamber||(LAMBER[Z]||null)===filtroLamber);
}
function aplicarDim(){
  document.querySelectorAll('.element[data-cat]').forEach(e=>{
    const Z=parseInt(e.dataset.z)||0;
    const ok=elementoBateFiltro(Z,e.dataset.cat);
    e.classList.toggle('dim',!ok);
    e.setAttribute('aria-hidden',String(!ok));
    /* VIOLACAO CORRIGIDA: o card atenuado recebia aria-hidden="true" mas
       continuava focavel. Elemento focavel e invisivel para a tecnologia
       assistiva e uma parada de foco fantasma — o leitor chega nele e nao
       tem o que anunciar. A ARIA proibe a combinacao.
       Quem cuida do tabindex agora e tabindexMovel(), chamado no fim
       desta funcao: com tabindex movel so UM card fica na ordem de
       tabulacao, e ele nunca pode ser um card atenuado. */
    if(modoLamber){
      const st=e.querySelector('.lamber-sticker');
      if(st) st.style.display = ok ? '' : 'none';
    }
  });
  if(filtroEstado||filtroCategoria||filtroLamber){
    const laOk=lantanideos.some(el=>elementoBateFiltro(el.numero,el.cat));
    const acOk=actinideos.some(el=>elementoBateFiltro(el.numero,el.cat));
    laOk?(!estadoSeries.lantanideos&&abrirSerie('lantanideos')):(estadoSeries.lantanideos&&fecharSerie('lantanideos'));
    acOk?(!estadoSeries.actinideos&&abrirSerie('actinideos')):(estadoSeries.actinideos&&fecharSerie('actinideos'));
    setTimeout(()=>{
      document.querySelectorAll('.element[data-cat]').forEach(e=>{
        const Z=parseInt(e.dataset.z)||0;
        const ok=elementoBateFiltro(Z,e.dataset.cat);
        e.classList.toggle('dim',!ok);
        if(modoLamber){
          const st=e.querySelector('.lamber-sticker');
          if(st) st.style.display = ok ? '' : 'none';
        }
      });
    },220);
  }else{fecharSerie('lantanideos');fecharSerie('actinideos');}
  /* Se o foco estava num card que acabou de ser atenuado, ele ficaria
     preso num elemento agora aria-hidden. Devolve ao container da grade. */
  tabindexMovel();
  const foc = document.activeElement;
  if(foc && foc.classList && foc.classList.contains('dim')){
    // o foco estava num card que acabou de ser atenuado: leva para o
    // card que virou o ponto de entrada, nao para o container
    if(_cardAtual) _cardAtual.focus();
    else document.getElementById('periodic-table').focus();
  }
}
function hexToRgba(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${r},${g},${b},${a})`;}
function setItemAtivo(btn,cor){btn.style.setProperty('--item-color',cor);btn.style.setProperty('--item-bg',hexToRgba(cor,0.18));btn.classList.add('ativo');btn.setAttribute('aria-pressed','true');}
function clearItemAtivo(btn){btn.style.removeProperty('--item-color');btn.style.removeProperty('--item-bg');btn.classList.remove('ativo');btn.setAttribute('aria-pressed','false');}
function aplicarFiltroCat(cat){
  filtroCategoria=filtroCategoria===cat?null:cat;
  document.querySelectorAll('.legend-item[data-cat]').forEach(b=>b.dataset.cat===filtroCategoria?setItemAtivo(b,getCatColorHex(b.dataset.cat)||'#00e5ff'):clearItemAtivo(b));
  aplicarDim();anunciar(filtroCategoria?`Filtro: ${filtroCategoria}`:'Filtro de categoria removido');
}
function aplicarFiltroEstado(est){
  filtroEstado=filtroEstado===est?null:est;
  document.querySelectorAll('.legend-item[data-est]').forEach(b=>b.dataset.est===filtroEstado?setItemAtivo(b,getEstadoHex(b.dataset.est)||'#00e5ff'):clearItemAtivo(b));
  aplicarDim();anunciar(filtroEstado?`Filtro: ${ESTADO_LABEL[filtroEstado]}`:'Filtro de estado removido');
}
function aplicarFiltroLamber(cat){
  filtroLamber=filtroLamber===cat?null:cat;
  document.querySelectorAll('.legend-item[data-lamber]').forEach(b=>b.dataset.lamber===filtroLamber?setItemAtivo(b,LAMBER_HEX[b.dataset.lamber]):clearItemAtivo(b));
  aplicarDim();anunciar(filtroLamber?`Filtro secreto: ${LAMBER_LABEL[filtroLamber]}`:'Filtro secreto removido');
}
function registrarPosicao(el,div){const key=`${el.periodo||0}_${el.grupo}`;if(!posicaoMap[key])posicaoMap[key]=[];posicaoMap[key].push(div);}
/* Devolve o vizinho NAVEGAVEL: pula card atenuado por filtro (que e
   aria-hidden e tem tabindex -1) e card de serie recolhida (display:none).
   Antes devolvia o primeiro da lista, e a seta pousava num card que o
   leitor de tela nao anuncia. */
function vizinho(g,p){
  return (posicaoMap[`${p}_${g}`] || []).find(cardNavegavel) || null;
}
/* ── TABINDEX MOVEL (roving tabindex) ─────────────────────────────────
   Antes o container e os 118 cards tinham tabindex="0": 119 paradas de
   Tab. Quem navega por teclado passava por 118 cards antes de alcancar a
   legenda, e nao havia como sair da tabela sem atravessar tudo.

   O padrao ARIA de grade pede UMA parada: so o card "atual" tem
   tabindex="0", todos os outros "-1", e as SETAS movem o foco. Tab entra
   na grade e Tab sai dela.

   O card atual e guardado em _cardAtual. Regras:
     - comeca no hidrogenio (primeiro card navegavel)
     - andar com as setas move o tabindex="0" junto do foco
     - card atenuado por filtro nunca e o atual (e aria-hidden)
     - se o atual sair de cena (filtro ou serie recolhida), escolhe outro
   -------------------------------------------------------------------- */
let _cardAtual = null;
/* Criterio ESTRUTURAL, nao de layout. A versao anterior usava
   offsetParent !== null, que depende de o navegador ja ter calculado
   layout — funciona no browser, mas nao e testavel e falha se chamada
   antes do primeiro paint.
   As tres condicoes cobrem os unicos casos em que um card nao e
   navegavel: atenuado por filtro, marcado como oculto, ou dentro de uma
   serie recolhida (a unica regra display:none que atinge cards). */
function cardNavegavel(d){
  return !!d && !d.classList.contains('dim')
             && d.getAttribute('aria-hidden') !== 'true'
             && !d.closest('.linha-serie.recolhida');
}
/* Faz de `div` o unico card na ordem de tabulacao. */
function definirCardAtual(div){
  if(!div) return;
  if(_cardAtual && _cardAtual !== div) _cardAtual.setAttribute('tabindex','-1');
  _cardAtual = div;
  div.setAttribute('tabindex','0');
}
/* Recalcula quem deve ser o atual. Chamada no render e a cada mudanca de
   filtro, temperatura ou serie — situacoes em que o card atual pode ter
   deixado de ser navegavel. */
function tabindexMovel(){
  /* :not(.serie-toggle) — os dois botoes de serie (La-Lu / Ac-Lr) tambem
     tem a classe .element e um data-z, mas sao CONTROLES independentes,
     com role=button e aria-expanded. Eles precisam continuar na ordem de
     tabulacao: o tabindex movel vale so para os 118 cards de elemento. */
  const todosCards = [...document.querySelectorAll('.element[data-z]:not(.serie-toggle)')];
  // ninguem em tabindex 0 alem do escolhido
  todosCards.forEach(d=>{ if(d !== _cardAtual) d.setAttribute('tabindex','-1'); });
  if(cardNavegavel(_cardAtual)){ _cardAtual.setAttribute('tabindex','0'); return; }
  const novo = todosCards.find(cardNavegavel);
  if(novo) definirCardAtual(novo);
  else _cardAtual = null;
}
function navegarTabela(e,div){
  const g=parseInt(div.dataset.grupo)||0,p=parseInt(div.dataset.periodo)||0;
  let alvo=null;
  if(e.key==='ArrowRight')alvo=vizinho(g+1,p)||vizinho(g+2,p)||vizinho(g+3,p);
  if(e.key==='ArrowLeft') alvo=vizinho(g-1,p)||vizinho(g-2,p)||vizinho(g-3,p);
  if(e.key==='ArrowDown') alvo=vizinho(g,p+1)||vizinho(g,p+2);
  if(e.key==='ArrowUp')   alvo=vizinho(g,p-1)||vizinho(g,p-2);
  if(alvo){e.preventDefault();definirCardAtual(alvo);alvo.focus();}
}
/* =====================================================================
   PALETA DAS CORES DE BLOCO (s/p/d/f)
   ---------------------------------------------------------------------
   corAtomo() faz getComputedStyle() a cada chamada; com 118 cards isso
   custaria 118 recálculos de estilo. Daí o cache: as 4 cores de bloco
   são resolvidas uma vez por passada de repintura.
   Quem repinta é atualizarVisualPropriedade(), chamada na troca de modo
   e por redesenharCores() quando muda tema, daltonismo ou contraste.
   ===================================================================== */
let _paletaOrb = null;
function paletaOrbital(recalcular){
  if(recalcular || !_paletaOrb){
    _paletaOrb = { S:corAtomo('S'), P:corAtomo('P'), D:corAtomo('D'), F:corAtomo('F') };
  }
  return _paletaOrb;
}
/* =====================================================================
   CONTROLE DE TEMPERATURA — estado físico calculado
   ---------------------------------------------------------------------
   Isto NÃO é um modo de propriedade e não entra em PROPRIEDADES. Os
   modos trocam o que o card MOSTRA; este controle troca um dado
   DERIVADO (o estado físico) que a tabela toda já usava como fixo.
   Por isso tem mecânica própria: um parâmetro global, tempAtual, e uma
   função de recálculo.

   ESTADO[Z] continua existindo e continua sendo a referência da IUPAC a
   25 °C. Em TEMP_REF o cálculo devolve exatamente ela — validado nos
   118 elementos. Fora de 25 °C, quem manda é o cálculo.
   ===================================================================== */
let tempAtual = TEMP_REF;

/* Mapeamento não-linear do controle. Uma régua linear de -273 a 6000 °C
   deixaria a faixa de -273 a 500, onde estão mais de 60 transições, em
   12% do curso. Com expoente TEMP_CURVA o início anda pouco e o fim
   anda muito, dando resolução fina onde as transições estão. */
function posParaTemp(pos){
  const f = Math.max(0, Math.min(1, pos / TEMP_PASSOS));
  return Math.round(TEMP_MIN + (TEMP_MAX - TEMP_MIN) * Math.pow(f, TEMP_CURVA));
}
function tempParaPos(t){
  const f = (t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
  return Math.round(TEMP_PASSOS * Math.pow(Math.max(0, f), 1 / TEMP_CURVA));
}
/* Estado físico de Z na temperatura t. Os casos sem dado são tratados
   um por um, em vez de virarem tudo "desconhecido":
     sem fusão e sem ebulição -> desconhecido de fato
     sem fusão, com ebulição  -> não solidifica a 1 atm (é o hélio):
                                 líquido abaixo da ebulição, gás acima
     com fusão, sem ebulição  -> sólido abaixo da fusão, líquido acima;
                                 nunca declara gás sem ter o dado */
function estadoNaTemperatura(Z, t){
  const f = FUSAO[Z], e = EBULICAO[Z];
  if(f === null && e === null) return '?';
  if(f === null) return (e !== null && t >= e) ? 'G' : 'L';
  /* SUBLIMAÇÃO: quando a ebulição é MENOR que a fusão, o elemento passa
     de sólido direto a gás e nunca é líquido a 1 atm. É o caso do
     arsênio (funde a 817, sublima a 614). Sem este ramo o cálculo o
     daria como líquido entre 614 e 817, uma faixa em que ele não
     existe como líquido. */
  if(e !== null && e < f) return (t < e) ? 'S' : 'G';
  if(t < f) return 'S';
  if(e === null) return 'L';
  return (t < e) ? 'L' : 'G';
}
// true quando o elemento sublima a 1 atm (ebulição abaixo da fusão)
function sublima(Z){
  const f = FUSAO[Z], e = EBULICAO[Z];
  return f !== null && e !== null && e < f;
}
/* Rótulo acessível base, recomposto: o estado entra nele, então muda
   junto com a temperatura. Antes era montado uma vez no criarEl. */
function montarRotuloBase(div){
  const est = div.dataset.est || '?';
  const per = parseInt(div.dataset.periodo) || 0;
  div.dataset.rotuloBase = `${div.dataset.nome}, símbolo ${div.dataset.simbolo}, `
    + `número atômico ${div.dataset.z}, ${div.dataset.cat}, `
    + `estado ${ESTADO_LABEL[est]}${per ? ', período ' + per : ''}`;
}
/* Aplica a temperatura: recalcula o estado de cada card, repinta o
   ícone (que vem de ESTADO_DOT, ponto único de verdade) e refaz os
   rótulos. Reaplica o filtro, senão ele continuaria filtrando pelo
   estado antigo. */
function aplicarTemperatura(t, silencioso){
  tempAtual = t;
  const tabela = document.getElementById('periodic-table');
  if(tabela){
    if(t === TEMP_REF) tabela.removeAttribute('data-temp-fora');
    else               tabela.setAttribute('data-temp-fora','');
  }
  document.querySelectorAll('.element[data-z]:not(.serie-toggle)').forEach(div=>{
    const Z = parseInt(div.dataset.z) || 0;
    const est = estadoNaTemperatura(Z, t);
    if(div.dataset.est !== est){
      div.dataset.est = est;
      const dot = div.querySelector('.state-dot');
      if(dot) dot.innerHTML = ESTADO_DOT[est] || '';
    }
    montarRotuloBase(div);
  });
  atualizarRotulos();
  if(typeof aplicarDim === 'function') aplicarDim();
  else if(typeof tabindexMovel === 'function') tabindexMovel();
  const out = document.getElementById('tempOut');
  if(out) out.textContent = `${t} °C`;
  const lbl = document.getElementById('lblStates');
  if(lbl) lbl.textContent = rotuloEstadoLegenda();
  const sl = document.getElementById('tempSlider');
  if(sl){
    sl.setAttribute('aria-valuetext', `${t} graus Celsius`);
    if(parseInt(sl.value) !== tempParaPos(t)) sl.value = tempParaPos(t);
  }
  const btn = document.getElementById('btnTempReset');
  if(btn) btn.hidden = (t === TEMP_REF);
  if(!silencioso) anunciarTemperatura(t);
}
/* Anúncio resumido: ler 118 mudanças seria inútil, então informa a
   temperatura e a contagem por estado. Com atraso, para o arraste do
   controle não gerar uma fila de anúncios. */
let _tempAnuncio = null;
function anunciarTemperatura(t){
  clearTimeout(_tempAnuncio);
  _tempAnuncio = setTimeout(()=>{
    const c = {S:0,L:0,G:0,'?':0};
    document.querySelectorAll('.element[data-z]:not(.serie-toggle)')
      .forEach(d=>{ c[d.dataset.est] = (c[d.dataset.est]||0) + 1; });
    anunciar(t === TEMP_REF
      ? `Temperatura de volta a 25 graus Celsius, a referência da tabela. ${c.S} sólidos, ${c.L} líquidos, ${c.G} gasosos.`
      : `${t} graus Celsius. ${c.S} elementos sólidos, ${c.L} líquidos, ${c.G} gasosos, ${c['?']} sem dado.`);
  }, 600);
}
// Rotulo da legenda de estado: acompanha a temperatura do controle.
function rotuloEstadoLegenda(){
  return `Estado Físico (${tempAtual} °C · 1 atm)`;
}
function montarControleTemperatura(){
  const sl = document.getElementById('tempSlider');
  if(!sl) return;
  sl.min = 0; sl.max = TEMP_PASSOS; sl.step = 1;
  sl.value = tempParaPos(TEMP_REF);
  sl.addEventListener('input', ()=>aplicarTemperatura(posParaTemp(parseInt(sl.value))));
  const btn = document.getElementById('btnTempReset');
  if(btn){
    btn.hidden = true;
    btn.addEventListener('click', ()=>aplicarTemperatura(TEMP_REF));
  }
}
function criarEl(el){
  const div=document.createElement('div');
  div.className='element';
  div.dataset.cat=el.cat;div.dataset.z=el.numero;
  div.dataset.grupo=el.grupo;div.dataset.periodo=el.periodo||0;
  // estado inicial pelo CÁLCULO, não pela tabela fixa: em 25 °C os dois
  // coincidem nos 118 (validado), e assim o card nasce coerente com o
  // controle de temperatura
  const est=estadoNaTemperatura(el.numero, tempAtual);
  div.dataset.est=est;   // usado pelo CSS para colorir o ícone de estado
  div.dataset.nome=el.nome; div.dataset.simbolo=el.simbolo;
  const ccHexEl=getCatColorHex(el.cat)||'#888';
  div.style.setProperty('--cat-color',ccHexEl);
  // dados do modo raio: bloco (define a cor) e fração do raio (define o tamanho)
  div.dataset.bloco = BLOCO[el.numero] || '';
  div.setAttribute('role','gridcell');div.setAttribute('tabindex','-1');   // ver tabindexMovel()
  // Guardado em dataset porque o modo raio acrescenta o valor em pm ao
  // rótulo e precisa poder voltar ao original ao desligar. O símbolo
  // continua no rótulo mesmo com o modo ligado: quem usa leitor de tela
  // não perde a informação que desapareceu da tela.
  montarRotuloBase(div);
  div.setAttribute('aria-label',div.dataset.rotuloBase);
  const massaEl = MASSA[el.numero]||'';
  div.innerHTML=
    `<div class="el-number" aria-hidden="true">${el.numero}</div>`+
    `<div class="el-symbol" style="color:${ccHexEl}" aria-hidden="true">${el.simbolo}</div>`+
    /* UM elemento de desenho e UM de valor, para QUALQUER propriedade.
       Ficam sempre no DOM (o CSS os esconde) e têm o conteúdo preenchido
       na troca de modo — então ligar um modo é trocar um atributo e
       escrever texto, sem recriar os 118 cards. Antes havia um par de
       elementos por propriedade (.el-raio/.el-pm/.el-en), o que exigia
       CSS novo a cada propriedade acrescentada. */
    `<div class="el-prop-desenho" aria-hidden="true"></div>`+
    `<div class="el-name"   aria-hidden="true">${el.nome}</div>`+
    `<div class="el-mass"   aria-hidden="true">${massaEl}</div>`+
    `<div class="el-prop-valor" aria-hidden="true"></div>`+
    `<div class="state-dot" aria-hidden="true">${ESTADO_DOT[est]}</div>`;
  if(LAMBER_DBLCLICK_TRIGGER.includes(el.numero)){
    let timerCliqueLamber=null;
    const ESPERA_LAMBER_MS=600; // janela generosa para o "clique duplo" do easter egg
    div.addEventListener('click',()=>{
      if(timerCliqueLamber){
        clearTimeout(timerCliqueLamber);
        timerCliqueLamber=null;
        toggleModoLamber();
      }else{
        timerCliqueLamber=setTimeout(()=>{
          timerCliqueLamber=null;
          abrirModal(el,div);
        },ESPERA_LAMBER_MS);
      }
    });
  }else{
    div.addEventListener('click',()=>abrirModal(el,div));
  }
  // clicar ou focar torna o card o ponto de entrada da grade
  div.addEventListener('focus',()=>definirCardAtual(div));
  div.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();abrirModal(el,div);}
    navegarTabela(e,div);
  });
  registrarPosicao(el,div);
  return div;
}
function criarLegendaBar(){
}
function criarLegendaGridCell(container){
  /* Os tres blocos de legenda ficam numa unica linha ARIA. Eles ocupam
     celulas VAZIAS da grade da tabela — sao um recurso de layout —, e sem
     o wrapper seriam filhos invalidos de role="grid". Cada bloco e um
     gridcell que contem botoes, que e um padrao previsto: celula de grade
     com widgets dentro. */
  const linhaLegenda = linhaGrade();
  const catCell = document.createElement('div');
  catCell.className = 'legend-grid-cats';
  catCell.setAttribute('role','gridcell');   // filho de role=row
  catCell.setAttribute('aria-label','Filtros por categoria');
  const lcLbl = document.createElement('div');
  lcLbl.className='legend-section-label'; lcLbl.id='lblCats'; lcLbl.textContent='Categorias';
  catCell.appendChild(lcLbl);
  const gridCat = document.createElement('div');
  gridCat.className='legend-cats';
  gridCat.setAttribute('role','group'); gridCat.setAttribute('aria-labelledby','lblCats');
  Object.entries(CAT_COLOR).forEach(([cat])=>{
    const btn=document.createElement('button'); btn.className='legend-item'; btn.dataset.cat=cat;
    btn.setAttribute('aria-pressed','false'); btn.setAttribute('aria-label',`Filtrar por categoria: ${cat}`);
    btn.innerHTML=`<div class="legend-dot" aria-hidden="true" style="background:${getCatColorHex(cat)}"></div><span>${cat}</span>`;
    btn.addEventListener('click',()=>aplicarFiltroCat(cat)); gridCat.appendChild(btn);
  });
  catCell.appendChild(gridCat);
  linhaLegenda.appendChild(catCell);
  const stCell = document.createElement('div');
  stCell.className='legend-grid-states';
  stCell.setAttribute('role','gridcell');   // filho de role=row
  stCell.setAttribute('aria-label','Filtros por estado físico');
  const leLbl = document.createElement('div');
  // texto montado por rotuloEstadoLegenda(): era uma string fixa com
  // "25 °C" que continuava mentindo depois de mexer no controle de
  // temperatura, enquanto os icones ao lado ja mostravam outra coisa
  leLbl.className='legend-section-label'; leLbl.id='lblStates';
  leLbl.textContent=rotuloEstadoLegenda();
  stCell.appendChild(leLbl);
  const gridEst = document.createElement('div');
  gridEst.className='legend-states';
  gridEst.setAttribute('role','group'); gridEst.setAttribute('aria-labelledby','lblStates');
  // o icone vem de ESTADO_DOT, o mesmo que os cards usam — assim o
  // filtro e o canto do card nunca mostram desenhos diferentes
  [{k:'S',label:'Sólido'},{k:'L',label:'Líquido'},
   {k:'G',label:'Gasoso'},{k:'?',label:'Desconhecido'}]
    .forEach(({k,label})=>{
      const btn=document.createElement('button'); btn.className='legend-item'; btn.dataset.est=k;
      btn.setAttribute('aria-pressed','false'); btn.setAttribute('aria-label',`Filtrar: ${label}`);
      btn.innerHTML=`<span class="legend-est-ico" data-est="${k}" aria-hidden="true">${ESTADO_DOT[k]}</span><span>${label}</span>`;
      btn.addEventListener('click',()=>aplicarFiltroEstado(k)); gridEst.appendChild(btn);
    });
  stCell.appendChild(gridEst);
  linhaLegenda.appendChild(stCell);

  /* ── CELULA "PROPRIEDADES" ──────────────────────────────────────────
     Ocupa a faixa livre da linha 2 (período 1) à direita das outras duas
     legendas: colunas 14 a 18. É o único espaço vazio que resta depois
     de os filtros passarem a ocupar as colunas 4 a 13.

     NÃO É FILTRO, e o formato diz isso: rótulo "Propriedades" em vez de
     "Filtrar por", e botões com borda em vez do fundo preenchido dos
     chips de filtro. A distinção importa: filtro ATENUA elementos e é
     exclusivo com os outros filtros; propriedade TROCA o que todos os
     cards mostram e convive com qualquer filtro.
     ------------------------------------------------------------------ */
  const prCell = document.createElement('div');
  prCell.className = 'legend-grid-props';
  prCell.id = 'legendGridProps';
  prCell.setAttribute('role','gridcell');   // filho de role=row
  prCell.setAttribute('aria-label','Propriedades para mostrar no card');
  const prLbl = document.createElement('div');
  prLbl.className = 'legend-section-label'; prLbl.id = 'lblProps';
  /* Duas formas do rotulo: a celula tem so 2 grupos de largura, e em
     janela estreita "PROPRIEDADES" nao cabe — antes era cortado pelo
     overflow, aparecendo como "PROPRIEDADE". Quem escolhe qual mostrar e
     uma media query; as duas ficam no DOM. */
  prLbl.innerHTML = '<span class="lp-nome-longo">Propriedades</span>'
                  + '<span class="lp-nome-curto" aria-hidden="true">Propr.</span>';
  prCell.appendChild(prLbl);
  const gridPr = document.createElement('div');
  gridPr.className = 'legend-props'; gridPr.id = 'legendPropsBotoes';
  gridPr.setAttribute('role','group'); gridPr.setAttribute('aria-labelledby','lblProps');
  prCell.appendChild(gridPr);
  linhaLegenda.appendChild(prCell);
  container.appendChild(linhaLegenda);
}
function criarLegendaLamberCell(container){
  const wrap = document.createElement('div');
  wrap.className = 'legend-grid-lamber';
  wrap.id = 'legendGridLamber';
  wrap.setAttribute('role','gridcell');   // filho de role=row
  wrap.setAttribute('aria-label','Filtros secretos: Posso lamber isso?');
  wrap.hidden = true;
  const lbl = document.createElement('div');
  lbl.className='legend-section-label';
  lbl.textContent='🍬 Posso lamber isso?';
  wrap.appendChild(lbl);
  const grid = document.createElement('div');
  grid.className='legend-lamber-grid';
  LAMBER_ORDEM.forEach(cat=>{
    const btn=document.createElement('button');
    btn.className='legend-item'; btn.dataset.lamber=cat;
    btn.setAttribute('aria-pressed','false');
    btn.setAttribute('aria-label',`Filtrar: ${LAMBER_LABEL[cat]}`);
    btn.innerHTML=`<div class="legend-dot" aria-hidden="true" style="background:${LAMBER_HEX[cat]}"></div><span>${LAMBER_EMOJI[cat]} ${LAMBER_LABEL[cat]}</span>`;
    btn.addEventListener('click',()=>aplicarFiltroLamber(cat));
    grid.appendChild(btn);
  });
  wrap.appendChild(grid);
  const linhaLamber = linhaGrade();
  linhaLamber.appendChild(wrap);
  container.appendChild(linhaLamber);
}
function criarLegendaDemoCell(container){
  // filho de role=row: gridcell. O conteudo e ilustrativo, nao interativo
  // alem do botao "Como ler".
  const cell = document.createElement('button');
  cell.className = 'legend-demo-cell';
  cell.setAttribute('type','button');
  cell.setAttribute('aria-haspopup','dialog');
  cell.setAttribute('aria-label','Abrir guia de leitura do card de elemento');
  cell.setAttribute('title','Como ler um card — clique para abrir o guia');
  cell.innerHTML = `
    <div class="legend-demo-body" aria-hidden="true">
      <div class="demo-card">
        <div class="d-num">79</div>
        <div class="d-sym" style="color:var(--c-transition)">Au</div>
        <div class="d-name">Ouro</div>
        <div class="d-mass">196,97 u</div>
        <div class="d-dot">${ESTADO_DOT.S}</div>
      </div>
    </div>
    <div class="legend-demo-footer" aria-hidden="true">
      <span class="legend-demo-footer-text">${ICO.livro} Como ler ${ICO.seta}</span>
    </div>`;
  cell.addEventListener('click', abrirGuia);
  cell.addEventListener('keydown', e => {
    if(e.key==='Enter'||e.key===' '){ e.preventDefault(); abrirGuia(); }
  });
  const linhaDemo = linhaGrade();
  linhaDemo.appendChild(celulaGrade(cell));
  container.appendChild(linhaDemo);
}
function abrirGuia(){
  const ov = document.getElementById('guiaOverlay');
  ov.classList.add('aberto');
  ov.setAttribute('aria-hidden','false');
  document.getElementById('btnGuiaClose').focus();
  anunciar('Guia de leitura do card aberto.');
}
function fecharGuia(){
  const ov = document.getElementById('guiaOverlay');
  ov.classList.remove('aberto');
  ov.setAttribute('aria-hidden','true');
  anunciar('Guia fechado.');
}
document.getElementById('btnGuiaClose').addEventListener('click', fecharGuia);
document.getElementById('guiaOverlay').addEventListener('click', e => {
  if(e.target === document.getElementById('guiaOverlay')) fecharGuia();
});
document.addEventListener('keydown', e => {
  if(e.key==='Escape' && document.getElementById('guiaOverlay').classList.contains('aberto')) fecharGuia();
});
document.getElementById('guiaOverlay').addEventListener('keydown', e => {
  if(e.key!=='Tab') return;
  const foc = [...document.getElementById('guiaOverlay')
    .querySelectorAll('button,[tabindex="0"],[href]')].filter(el=>!el.disabled);
  if(!foc.length) return;
  const first=foc[0], last=foc[foc.length-1];
  if(e.shiftKey){ if(document.activeElement===first){e.preventDefault();last.focus();} }
  else          { if(document.activeElement===last) {e.preventDefault();first.focus();} }
});
document.addEventListener('keydown', e => {
  if(e.key==='Escape' && document.getElementById('fullscreen-overlay')?.classList.contains('aberto')) fecharFullscreen();
});
document.getElementById('fullscreen-overlay')?.addEventListener('click', e => {
  if(e.target === document.getElementById('fullscreen-overlay')) fecharFullscreen();
});
/* ── ESTRUTURA ARIA DA GRADE ──────────────────────────────────────────
   role="grid" so admite role="row" (ou rowgroup) como filho direto. Antes
   os 90 cards do corpo, os 25 rotulos, as celulas de legenda e o
   separador eram todos filhos DIRETOS do #periodic-table[role=grid]:
   os role="gridcell" ficavam sem linha, e o leitor de tela nao tinha como
   anunciar "linha 3, coluna 14".

   As duas series ja faziam certo (criarLinha usa role="row"), e e por
   isso que a tecnica esta provada aqui: o wrapper leva display:contents,
   entao os filhos continuam participando do CSS grid do pai e o layout
   nao muda em nada.

   linhaGrade() cria esse wrapper. Uso: uma linha por periodo, uma para os
   rotulos de grupo, e uma para cada bloco de legenda. */
/* Celula ARIA para envolver um controle que precisa manter o proprio
   papel. Um <button> nao pode ser filho direto de role="row" — mas PODE
   estar dentro de um role="gridcell". E o padrao "celula de grade com
   widget". display:contents mantem o controle no CSS grid do pai. */
function celulaGrade(filho){
  const c = document.createElement('div');
  c.className = 'grid-cell-wrap';
  c.setAttribute('role','gridcell');
  c.appendChild(filho);
  return c;
}
function linhaGrade(classe){
  const w = document.createElement('div');
  w.className = 'grid-row-wrap' + (classe ? ' ' + classe : '');
  w.setAttribute('role','row');
  return w;
}
function criarRotulos(c){
  // linha 1: cabecalhos de coluna (os numeros de grupo)
  const linhaGrupos = linhaGrade();
  for(let g=1;g<=18;g++){
    const d=document.createElement('div');d.className='family-label';
    d.style.cssText=`grid-column:${g+1};grid-row:1;`;d.textContent=g;
    d.setAttribute('role','columnheader');
    d.setAttribute('aria-label',`Grupo ${g}`);
    linhaGrupos.appendChild(d);
  }
  c.appendChild(linhaGrupos);
  /* Os rotulos de periodo NAO entram aqui: cada um pertence a linha do
     seu proprio periodo, como role="rowheader". Sao criados em
     criarLinhasPeriodo(), junto dos cards daquele periodo. */
}
/* Uma linha ARIA por periodo, com o rotulo do periodo como rowheader e os
   cards daquele periodo como gridcell. */
function criarLinhasPeriodo(c){
  for(let p=1;p<=7;p++){
    const linha = linhaGrade('linha-periodo');
    linha.setAttribute('aria-label', `Período ${p}`);
    const rh=document.createElement('div');rh.className='period-label';
    rh.style.cssText=`grid-column:1;grid-row:${p+1};`;rh.textContent=p;
    rh.setAttribute('role','rowheader');
    rh.setAttribute('aria-label',`Período ${p}`);
    linha.appendChild(rh);
    elementosBase.filter(el=>el.periodo===p).forEach(el=>{
      const d=criarEl(el);
      d.style.gridColumn=el.grupo+1; d.style.gridRow=el.periodo+1;
      linha.appendChild(d);
    });
    // os botoes das series ficam na linha do periodo 6 e 7, onde aparecem
    if(p===6) linha.appendChild(celulaGrade(criarBotaoSerie('lantanideos')));
    if(p===7) linha.appendChild(celulaGrade(criarBotaoSerie('actinideos')));
    c.appendChild(linha);
  }
}
function criarBotaoSerie(serie){
  const cfgs={
    lantanideos:{numero:'57-71',simbolo:'La-Lu',nome:'Lant.',grupo:3,periodo:6,cat:'Lantanídeo',obtencao:'Série dos lantanídeos (Z=57–71).',curiosidade:'15 elementos (terras raras) usados em ímãs, lasers e fibra óptica.'},
    actinideos: {numero:'89-103',simbolo:'Ac-Lr',nome:'Actin.',grupo:3,periodo:7,cat:'Actinídeo',obtencao:'Série dos actinídeos (Z=89–103).',curiosidade:'15 elementos, maioria radioativa; incluem urânio e plutônio.'}
  };
  const cfg=cfgs[serie];const cc=getCatColorHex(cfg.cat)||'#888';
  const div=document.createElement('div');
  div.className='element serie-toggle';
  div.dataset.cat=cfg.cat;div.dataset.z=cfg.numero;div.dataset.grupo=cfg.grupo;div.dataset.periodo=cfg.periodo;
  div.setAttribute('role','button');div.setAttribute('tabindex','0');div.setAttribute('aria-expanded','false');
  div.setAttribute('aria-label',`${serie==='lantanideos'?'Lantanídeos':'Actinídeos'} — elementos ${cfg.numero}. Clique simples para expandir ou recolher. Clique duplo para abrir os detalhes.`);
  div.style.cssText=`grid-column:${cfg.grupo+1};grid-row:${cfg.periodo+1};--cat-color:${cc}`;
  div.innerHTML=
    `<div class="el-number" aria-hidden="true" style="font-size:calc(0.4rem * var(--font-scale))">${cfg.numero}</div>`+
    `<div class="el-symbol" aria-hidden="true" style="color:${cc};font-size:calc(0.52vw * var(--font-scale));line-height:1.1">${cfg.simbolo}</div>`+
    `<div class="el-name"   aria-hidden="true">${cfg.nome}</div>`+
    `<span class="toggle-arrow" aria-hidden="true" style="color:${cc}">&#9660;</span>`;
  let timerClique = null;
  const ESPERA_MS = 300;
  const handler = () => {
    if (timerClique) {
      clearTimeout(timerClique);
      timerClique = null;
      elementoAtivo = null;
      abrirModal({...cfg, numero: cfg.numero, grupo: cfg.grupo}, div);
      anunciar(`Detalhes da série ${serie === 'lantanideos' ? 'Lantanídeos' : 'Actinídeos'} abertos.`);
    } else {
      timerClique = setTimeout(() => {
        timerClique = null;
        const novoEstado = !estadoSeries[serie];
        estadoSeries[serie] = novoEstado;
        div.classList.toggle('aberta', novoEstado);
        div.setAttribute('aria-expanded', String(novoEstado));
        document.getElementById(`linha-${serie}`)?.classList.toggle('recolhida', !novoEstado);
        anunciar(novoEstado
          ? 'Série expandida. Clique duplo para abrir os detalhes.'
          : 'Série recolhida.');
      }, ESPERA_MS);
    }
  };
  div.addEventListener('click', handler);
  div.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    navegarTabela(e, div);
  });
  botoesToggle[serie] = div;
  return div;
}
function criarLinha(serie,els,row){
  const w=document.createElement('div');w.id=`linha-${serie}`;w.className='linha-serie recolhida';w.setAttribute('role','row');
  els.forEach(el=>{const d=criarEl(el);d.style.gridColumn=el.grupo+1;d.style.gridRow=row;w.appendChild(d);});
  return w;
}
function renderizar(){
  const c=document.getElementById('periodic-table');
  criarRotulos(c);
  criarLegendaGridCell(c);
  criarLegendaLamberCell(c);
  criarLegendaDemoCell(c);
  criarLinhasPeriodo(c);
  const sep=document.createElement('div');sep.className='serie-separator';sep.style.gridRow='9';sep.setAttribute('aria-hidden','true');
  const linhaSep=linhaGrade();linhaSep.setAttribute('aria-hidden','true');linhaSep.appendChild(celulaGrade(sep));c.appendChild(linhaSep);
  c.appendChild(criarLinha('lantanideos',lantanideos,10));
  c.appendChild(criarLinha('actinideos',actinideos,11));
  criarLegendaBar();
}
/* =====================================================================
   🥚 EASTER EGG — motor de ativação do "Posso lamber isso?"
   Sem dica visível: clique no ícone (grade 2x3) ao lado do título
   "SITP" no topo da página para ativar/desativar.
   ===================================================================== */
let modoLamber = false;
window.modoLamber = false;
function pintarModoLamber(ativar){
  // Paleta de bloco resolvida uma vez: o círculo do modo raio também é
  // repintado aqui, senão ficaria na cor do bloco enquanto o resto do
  // card já está nas cores do easter egg.
  const paletaLamber = paletaOrbital(true);
  const propAtiva = propriedadePorId(modoAtivo);
  document.querySelectorAll('.element[data-z]:not(.serie-toggle)').forEach(div=>{
    const Z=parseInt(div.dataset.z)||0;
    const dot=div.querySelector('.state-dot');
    if(dot) dot.style.visibility = ativar ? 'hidden' : '';
    // o desenho da propriedade ativa também segue as cores do easter egg
    pintarCardPropriedade(div, propAtiva, paletaLamber);
    const cat=LAMBER[Z];
    if(!cat) return;
    const sym=div.querySelector('.el-symbol');
    if(ativar){
      const hex=LAMBER_HEX[cat];
      div.style.setProperty('--cat-color',hex);
      if(sym) sym.style.color=hex;
      if(!div.querySelector('.lamber-sticker')){
        const st=document.createElement('div');
        st.className='lamber-sticker';
        st.setAttribute('aria-hidden','true');
        st.textContent=LAMBER_EMOJI[cat];
        div.appendChild(st);
      }
    }else{
      const hex=getCatColorHex(div.dataset.cat)||'#888';
      div.style.setProperty('--cat-color',hex);
      if(sym) sym.style.color=hex;
      div.querySelector('.lamber-sticker')?.remove();
    }
  });
}
window.__sitpPintarModoLamber = pintarModoLamber;
function mostrarBannerLamber(){
  if(document.getElementById('lamberBanner')) return;
  const b=document.createElement('div');
  b.id='lamberBanner';
  b.className='lamber-banner';
  b.setAttribute('role','status');
  b.innerHTML=
    `<span class="lamber-banner-txt">🍭 Modo secreto ativado: <strong>"Posso lamber isso?"</strong> — confira os novos filtros na tabela. Clique no ícone do título (ou Esc) para sair.</span>`+
    `<button type="button" class="lamber-banner-close" aria-label="Fechar e sair do modo secreto">✕</button>`;
  b.querySelector('.lamber-banner-close').addEventListener('click',toggleModoLamber);
  const header=document.querySelector('.app-header');
  if(header && header.parentNode){
    header.insertAdjacentElement('afterend', b);
  }else{
    document.body.appendChild(b);
  }
}
function removerBannerLamber(){
  document.getElementById('lamberBanner')?.remove();
}
function toggleModoLamber(){
  modoLamber=!modoLamber;
  window.modoLamber=modoLamber;
  document.body.classList.toggle('modo-lamber',modoLamber);
  const legLamber=document.getElementById('legendGridLamber');
  const legCats=document.querySelector('.legend-grid-cats');
  const legStates=document.querySelector('.legend-grid-states');
  const legProps=document.getElementById('legendGridProps');
  if(modoLamber){
    if(legLamber) legLamber.hidden=false;
    if(legCats) legCats.hidden=true;
    if(legStates) legStates.hidden=true;
    /* A celula de propriedades some junto: no easter egg os cards sao
       repintados com as cores da piada, e um mapa de calor por cima disso
       nao significaria nada. Desliga o modo ativo ANTES de esconder,
       senao o usuario ficaria sem o botao para desligar. */
    if(legProps){ if(modoAtivo) aplicarModoPropriedade(null); legProps.hidden=true; }
    pintarModoLamber(true);
    aplicarDim();
    mostrarBannerLamber();
    anunciar('Modo secreto ativado: Posso lamber isso? Novos filtros disponíveis.');
  }else{
    if(filtroLamber) aplicarFiltroLamber(filtroLamber);
    if(legLamber) legLamber.hidden=true;
    if(legCats) legCats.hidden=false;
    if(legStates) legStates.hidden=false;
    if(legProps) legProps.hidden=false;
    pintarModoLamber(false);
    removerBannerLamber();
    anunciar('Modo secreto desativado.');
  }
}
(function(){
  const logo = document.getElementById('logoEasterEgg');
  if (logo) {
    logo.addEventListener('click', toggleModoLamber);
    logo.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleModoLamber(); }
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modoLamber) toggleModoLamber();
  });
})();
/* =====================================================================
   MOTOR GENÉRICO DE MODOS DE PROPRIEDADE
   ---------------------------------------------------------------------
   Um único mecanismo para todas as entradas de PROPRIEDADES
   (dadossitp.js). Substituiu aplicarModoRaio/toggleModoRaio e
   aplicarModoEN/toggleModoEN, que eram quase idênticas.

   EXCLUSÃO MÚTUA VEM DE GRAÇA: o estado mora num único atributo,
   data-modo="<id>" no #periodic-table. Um atributo só pode ter um valor,
   então é impossível dois modos ficarem ligados ao mesmo tempo — antes
   isso dependia de duas funções lembrarem de se desligar uma à outra.

   ZERO CSS NOVO POR PROPRIEDADE: o CSS não conhece "raio" nem "en".
   Ele reage a data-modo (qualquer valor), data-modo-desenho e
   data-modo-mapa, que saem do campo `visual` da propriedade. Cada card
   tem UM elemento de valor e UM de desenho, cujo conteúdo é preenchido
   na troca de modo, em vez de um par de elementos por propriedade.
   ===================================================================== */
let modoAtivo = null;                       // id da propriedade, ou null
function propriedadePorId(id){ return PROPRIEDADES.find(p => p.id === id) || null; }

// Lê o número de uma propriedade para o elemento Z, ou null se não houver.
function valorPropriedade(prop, Z){
  const linha = prop.tabela ? prop.tabela[Z] : undefined;
  if(linha === null || linha === undefined) return null;
  const v = prop.campo ? linha[prop.campo] : linha;
  return (typeof v === 'number' && isFinite(v)) ? v : null;
}
// Impressão em pt-BR: vírgula decimal. Só o número, sem unidade —
// o rótulo acessível escreve a unidade por extenso ("picômetros") e
// somar as duas daria "31 pm picômetros".
function numeroPropriedade(prop, v){
  if(v === null) return '—';
  return v.toFixed(prop.decimais).replace('.', ',');
}
// Para o card: número + unidade abreviada.
function formatarPropriedade(prop, v){
  if(v === null) return '—';
  return numeroPropriedade(prop, v) + prop.unidade;
}
/* Complemento opcional do rótulo acessível: um segundo campo da mesma
   tabela, traduzido por uma tabela de rótulos. É o que preserva o tipo
   de raio ("Covalente (ligação simples)"), que a tela não mostra mas o
   leitor de tela anunciava. Declarado em campoExtra + tabelaExtra. */
function extraPropriedade(prop, Z){
  if(!prop.campoExtra || !prop.tabelaExtra || !prop.tabela) return '';
  const linha = prop.tabela[Z];
  if(!linha) return '';
  const chave = linha[prop.campoExtra];
  const rotulo = prop.tabelaExtra[chave];
  return rotulo ? ` — ${rotulo}` : '';
}
// Posição de 0 a 1 dentro da faixa declarada — serve ao tamanho do
// círculo e à posição na rampa de cor.
function fracaoPropriedade(prop, v){
  if(v === null) return 0;
  const span = prop.vmax - prop.vmin;
  if(!(span > 0)) return 0;
  return Math.max(0, Math.min(1, (v - prop.vmin) / span));
}

/* Escreve no card tudo que a propriedade ativa exige: texto do valor,
   tamanho e cor do desenho, tonalidade de fundo e cor de texto legível.
   Uma passada por card, sem recriar nada. */
function pintarCardPropriedade(div, prop, paleta){
  const Z = parseInt(div.dataset.z) || 0;
  const alvoValor   = div.querySelector('.el-prop-valor');
  const alvoDesenho = div.querySelector('.el-prop-desenho');
  if(!prop){
    div.removeAttribute('data-prop-sem-dado');
    ['--prop-frac','--prop-cor','--prop-glow','--prop-bg','--prop-txt']
      .forEach(v => div.style.removeProperty(v));
    return;
  }
  const v = valorPropriedade(prop, Z);
  if(alvoValor) alvoValor.textContent = formatarPropriedade(prop, v);
  if(v === null) div.setAttribute('data-prop-sem-dado','');
  else           div.removeAttribute('data-prop-sem-dado');

  if(prop.visual === 'circulo'){
    const frac = fracaoPropriedade(prop, v);
    if(alvoDesenho) alvoDesenho.style.setProperty('--prop-frac', frac.toFixed(3));
    const cor = corDesenhoPropriedade(div, prop, paleta);
    div.style.setProperty('--prop-cor', cor);
    div.style.setProperty('--prop-glow', hexToRgba(cor, 0.5));
    div.style.removeProperty('--prop-bg');
    div.style.removeProperty('--prop-txt');
  }else if(prop.visual === 'mapa'){
    if(v === null){
      div.style.removeProperty('--prop-bg');
      div.style.removeProperty('--prop-txt');
    }else{
      const bruto = corNaEscala(prop, v);
      const txt   = corTextoSobre(bruto);
      div.style.setProperty('--prop-bg', ajustarFundoParaContraste(bruto, txt));
      div.style.setProperty('--prop-txt', txt);
    }
  }
}
/* Cor do desenho. corBloco=true usa a cor do bloco s/p/d/f, a mesma do
   círculo do modal; no easter egg segue o hex do lamber para não brigar
   com a borda e o sticker do card. */
function corDesenhoPropriedade(div, prop, paleta){
  const Z = parseInt(div.dataset.z) || 0;
  if(modoLamber && LAMBER[Z]) return LAMBER_HEX[LAMBER[Z]];
  if(prop.corBloco) return paleta[div.dataset.bloco||''] || getCatColorHex(div.dataset.cat) || '#888888';
  return getCatColorHex(div.dataset.cat) || '#888888';
}
/* Repinta todos os cards. Chamada na troca de modo e por
   redesenharCores() quando muda tema, daltonismo ou alto contraste —
   ambos alteram as cores de bloco e a rampa do mapa de calor. */
function atualizarVisualPropriedade(){
  const prop = propriedadePorId(modoAtivo);
  const paleta = paletaOrbital(true);
  document.querySelectorAll('.element[data-z]:not(.serie-toggle)')
    .forEach(div => pintarCardPropriedade(div, prop, paleta));
}
/* Rótulo do leitor de tela: recomposto de dataset.rotuloBase. Num lugar
   só, senão ligar um modo apagaria o acréscimo do outro. */
function atualizarRotulos(){
  const prop = propriedadePorId(modoAtivo);
  document.querySelectorAll('.element[data-z]:not(.serie-toggle)').forEach(div=>{
    const base = div.dataset.rotuloBase || '';
    if(!base) return;
    if(!prop){ div.setAttribute('aria-label', base); return; }
    const Z = parseInt(div.dataset.z) || 0;
    const v = valorPropriedade(prop, Z);
    const extra = (v === null)
      ? prop.semDado
      : prop.a11yValor.replace('@', numeroPropriedade(prop, v)) + extraPropriedade(prop, Z);
    div.setAttribute('aria-label', `${base}, ${extra}`);
  });
}
/* Liga a propriedade indicada, ou desliga tudo com id null. */
function aplicarModoPropriedade(id){
  const prop = propriedadePorId(id);
  modoAtivo = prop ? prop.id : null;
  const tabela = document.getElementById('periodic-table');
  if(tabela){
    if(prop){
      tabela.setAttribute('data-modo', prop.id);
      // atributos derivados do tipo de visual: é só neles que o CSS mexe
      if(prop.visual === 'circulo'){ tabela.setAttribute('data-modo-desenho',''); tabela.removeAttribute('data-modo-mapa'); }
      else if(prop.visual === 'mapa'){ tabela.setAttribute('data-modo-mapa','');   tabela.removeAttribute('data-modo-desenho'); }
      else { tabela.removeAttribute('data-modo-desenho'); tabela.removeAttribute('data-modo-mapa'); }
    }else{
      ['data-modo','data-modo-desenho','data-modo-mapa'].forEach(a=>tabela.removeAttribute(a));
    }
  }
  PROPRIEDADES.forEach(pr=>{
    const b = document.getElementById('btnProp-'+pr.id);
    if(!b) return;
    const on = (pr.id === modoAtivo);
    b.classList.toggle('ativo', on);
    b.setAttribute('aria-pressed', String(on));
  });
  atualizarVisualPropriedade();
  atualizarRotulos();
}
function alternarModoPropriedade(id){
  const ligar = (modoAtivo !== id);
  aplicarModoPropriedade(ligar ? id : null);
  const prop = propriedadePorId(id);
  if(prop) anunciar(ligar ? prop.ligado : prop.desligado);
}
/* Botões gerados do registro: propriedade nova entra sem tocar no HTML. */
/* Botões gerados do registro, dentro da célula "Propriedades" da legenda.
   Levam ÍCONE + NOME: no cabeçalho eram só ícone por falta de espaço, e
   aqui há largura para o rótulo, o que dispensa o tooltip para saber o
   que cada um faz.
   Propriedade nova entra sem tocar em HTML nem em CSS. */
function montarBotoesPropriedade(){
  const cx = document.getElementById('legendPropsBotoes');
  if(!cx) return;
  cx.innerHTML = PROPRIEDADES.map(pr=>
    `<button type="button" id="btnProp-${pr.id}" class="legend-prop-item" aria-pressed="false"
             data-prop="${pr.id}" aria-label="Mostrar no card: ${pr.label}" title="${pr.titulo}">
       <span class="lp-ico" aria-hidden="true">${ICO[pr.icone] || ''}</span><span>${pr.label}</span>
     </button>`).join('');
  cx.querySelectorAll('button[data-prop]').forEach(b=>{
    b.addEventListener('click', ()=>alternarModoPropriedade(b.dataset.prop));
  });
}
/* ── INICIALIZACAO (a ordem importa) ─────────────────────────────────
   1. renderizar() monta os 118 cards E as celulas da legenda, incluindo
      a de propriedades — que antes vivia no cabecalho e por isso era
      preenchida ANTES do render. Agora tem de ser depois.
   2. os botoes de propriedade, dentro da celula recem-criada
   3. icones de estado nos placeholders do guia
   4. o controle de temperatura
   ------------------------------------------------------------------- */
renderizar();
tabindexMovel();   // define o ponto de entrada unico da grade
montarBotoesPropriedade();
preencherIconesEstado();
montarControleTemperatura();

window.addEventListener('load', () => {
  setTimeout(() => {
    anunciar('Tabela periódica carregada. Use Tab para navegar até a tabela, depois as setas do teclado para mover entre os elementos e Enter para abrir os detalhes. Há botões de acessibilidade na barra de ferramentas: tamanho da fonte, tema, alto contraste e leitura simples.');
  }, 800);
});