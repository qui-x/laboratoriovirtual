/* ═══════════════════════════════════════════════════════════════════
   scriptsiqi.js — SIQI v2
   Arquitetura: mesma do SIEM
     · receptor de acessibilidade (data-* no <html>)
     · painéis recolhíveis com transitionend / scroll-ready
     · sub-list com mol-cat-tabs (abas de categoria)
     · modal de expansão (expand-overlay)
     · mobile off-canvas com backdrop
     · canvas de partículas adaptado ao estado do Lab
   Didática: método socrático, 4 famílias de reações
═══════════════════════════════════════════════════════════════════ */
 /* Receptor de acessibilidade — mesmo contrato do SIEM.
       Aceita URL params e postMessage.
       Aplica: data-theme, data-contrast, #colorblindOverlay (daltonismo),
               data-reading, data-motion, --a11y-font-scale */
    (function(){
      var CVD=['none','protanopia','deuteranopia','tritanopia','acromatopsia'];
      function applyColorblindOverlay(type){
        var ov=document.getElementById('colorblindOverlay');
        if(!ov) return;
        var val=(!type||type==='none')?'none':'url(#f-'+type+')';
        ov.style.backdropFilter=val;
        ov.style.webkitBackdropFilter=val;
      }
      function applyPayload(pl){
        if(!pl) return;
        var h=document.documentElement;
        if(pl.theme)      h.setAttribute('data-theme', pl.theme);
        if(pl.contrast)   h.setAttribute('data-contrast', pl.contrast==='true'||pl.contrast===true?'high':'');
        if(pl.colorblind && CVD.indexOf(pl.colorblind)!==-1) applyColorblindOverlay(pl.colorblind);
        if(pl.reading)    h.setAttribute('data-reading', pl.reading);
        if(pl.motion)     h.setAttribute('data-motion', String(!!pl.motion));
        if(pl.fontScale)  h.style.setProperty('--a11y-font-scale', Math.min(1.5,Math.max(0.75,parseFloat(pl.fontScale)||1)));
      }
      (function(){
        var p=new URLSearchParams(window.location.search);
        applyPayload({
          theme:     p.get('theme'),
          contrast:  p.get('contrast'),
          colorblind:p.get('colorblind'),
          reading:   p.get('reading'),
          motion:    p.get('motion'),
          fontScale: p.get('fontscale'),
        });
      })();
      window.addEventListener('message',function(e){
        if(!e.data||e.data.source!=='central-simuladores'||e.data.type!=='a11y-update') return;
        applyPayload(e.data.payload);
      });
    })();
/* ════════════════════════════════════════════════════════════════
   1. DADOS — lidos de dadossiqi.js (carregado antes deste script)
   dadossiqi.js exporta as variáveis globais:
     FUNCAO_META, CATEGORIAS_SIQI, CATALOGO_SIQI, EXPERIMENTOS_SIQI
════════════════════════════════════════════════════════════════ */

/* Aliases para os nomes usados internamente pelo script */
var CATEGORIAS   = CATEGORIAS_SIQI;
var EXPERIMENTOS = EXPERIMENTOS_SIQI;

/* Converte CATALOGO_SIQI (array) → COMPOSTOS (dict keyed by formulaId) */
var COMPOSTOS = (function(){
  var dict = {};
  CATALOGO_SIQI.forEach(function(c){
    var estado = '—';
    if(c.Tf !== null && c.Tb !== null){
      if(c.Tf > 25)      estado = 'Sólido (25 °C)';
      else if(c.Tb < 25) estado = 'Gasoso (25 °C)';
      else               estado = 'Líquido (25 °C)';
    } else if(c.Tf === null){
      estado = 'Aquoso / Instável';
    } else if(c.Tf > 25){
      estado = 'Sólido (25 °C)';
    }
    dict[c.formulaId] = {
      nome:c.nome, funcao:c.funcao, categoria:c.categoria,
      massa:c.massa, estado:estado,
      Tf:c.Tf, Tb:c.Tb,
      pfStr: c.Tf !== null ? c.Tf + ' °C' : '—',
      peStr: c.Tb !== null ? c.Tb + ' °C' : '—  (decompõe)',
      densidade:c.densidade, solubilidade:c.solubilidade, ph:c.ph,
      nomenclatura:c.nomenclatura, badges:c.badges || [],
      geometria:c.geometria || '—', ligacao:c.ligacao || '—',
      equacao:c.equacao, reacao:c.reacao, lewis:c.lewis,
      uso:c.uso, curiosidade:c.curiosidade, descricao:c.descricao || '',
    };
  });
  return dict;
}());

/* ════════════════════════════════════════════════════════════════
   3. ESTADO GLOBAL
════════════════════════════════════════════════════════════════ */
/* ── Desbloqueados mantidos apenas em memória (reset ao recarregar) ── */
var STORAGE_KEY = 'siqi_desbloqueados_v1';
function carregarDesbloqueados(){
  /* Sempre começa do zero ao recarregar a página */
  return [];
}
function salvarDesbloqueados(arr){
  /* Não persiste — estado vive apenas em memória durante a sessão */
}
function desbloquearComposto(formulaId){
  if(STATE.desbloqueados.indexOf(formulaId)<0){
    STATE.desbloqueados.push(formulaId);
    salvarDesbloqueados(STATE.desbloqueados);
    renderSubList(normTxt((document.getElementById('mol-search')||{value:''}).value));
  }
}
function estaDesbloqueado(formulaId){
  return STATE.desbloqueados.indexOf(formulaId)>=0;
}

var STATE = {
  compostoAtual: null,
  desbloqueados: carregarDesbloqueados(),
  expAtual: null,
  hintIdx: 0,
  dicasUsadas: 0,
  expConcluidos: [],
  aguardandoResposta: false,
  catAtiva: 'todos',
  modoView: 'none',
};

/* ════════════════════════════════════════════════════════════════
   4. UTILIDADES
════════════════════════════════════════════════════════════════ */
function $(id){ return document.getElementById(id); }
function txt(id,v){ var el=$(id); if(el) el.textContent=v; }
function html(id,v){ var el=$(id); if(el) el.innerHTML=v; }
function sub2(f){
  var m={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
  return f.replace(/\d/g,function(d){ return m[d]||d; });
}
function srAnnounce(msg, prio){
  var id = prio==='assertive' ? 'sr-live-assertive' : 'sr-live';
  var el=$(id); if(!el) return;
  el.textContent=''; setTimeout(function(){ el.textContent=msg; }, 50);
}
function normTxt(t){
  return t.toLowerCase()
    .replace(/[áàãâ]/g,'a').replace(/[éèê]/g,'e')
    .replace(/[íì]/g,'i').replace(/[óòõô]/g,'o')
    .replace(/[úù]/g,'u').replace(/ç/g,'c')
    .replace(/\s+/g,' ').trim();
}
/* ── Render Markdown simples ───────────────────────────────── */
function renderMD(t){
  return t
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/`([^`]+)`/g,'<code style="background:var(--bg3);padding:.1em .3em;border-radius:3px;font-family:var(--mono);color:var(--coral2);">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>')
    .replace(/^#{1,3}\s+(.+)$/gm,'<div style="font-weight:700;color:var(--coral);margin:.35rem 0 .15rem;">$1</div>')
    .replace(/^[-•]\s+(.+)$/gm,'<div style="padding-left:.75rem;margin:.1rem 0;">• $1</div>')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
}

/* ════════════════════════════════════════════════════════════════
   5. PAINÉIS RECOLHÍVEIS — mesmo padrão SIEM (transitionend + scroll-ready)
════════════════════════════════════════════════════════════════ */
function initPaineis(){
  document.querySelectorAll('.panel-header').forEach(function(btn){
    btn.addEventListener('click', function(){
      var panel=btn.closest('.panel');
      var bd=panel.querySelector('.panel-body');
      var aberto=panel.dataset.open==='true';
      panel.dataset.open=aberto?'false':'true';
      btn.setAttribute('aria-expanded',String(!aberto));
      if(bd){
        bd.classList.remove('scroll-ready');
        if(!aberto){
          bd.addEventListener('transitionend',function h(){
            bd.classList.add('scroll-ready');
            bd.removeEventListener('transitionend',h);
          });
        }
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   6. MODAL DE EXPANSÃO — mesmo padrão SIEM
════════════════════════════════════════════════════════════════ */
function initExpandModal(){
  var overlay=$('expand-overlay');
  var closeBtn=$('expand-close');
  var body=$('expand-body');
  var titleEl=$('expand-title');
  if(!overlay) return;

  document.querySelectorAll('.expand-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var target=btn.dataset.expand;
      var conteudo=gerarConteudoModal(target);
      if(!conteudo) return;
      titleEl.textContent=conteudo.titulo;
      body.innerHTML=conteudo.html;
      overlay.hidden=false;
      document.body.classList.add('modal-open');
      if(conteudo.onOpen) setTimeout(conteudo.onOpen, 30);
      closeBtn.focus();
    });
  });

  function fechar(){
    overlay.hidden=true;
    document.body.classList.remove('modal-open');
  }
  closeBtn && closeBtn.addEventListener('click',fechar);
  overlay.addEventListener('click',function(e){ if(e.target===overlay) fechar(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!overlay.hidden) fechar(); });
}

function gerarConteudoModal(target){
  var c=COMPOSTOS[STATE.compostoAtual];
  if(!c) return null;
  var f=FUNCAO_META[c.funcao]||{};

  /* Composto BLOQUEADO nao tem ficha para expandir: o painel na tela esta
     zerado (ver _limparPainelFicha) e o modal precisa dizer o mesmo, em vez
     de revelar por atalho os dados que o desafio de nomenclatura esconde. */
  if(!estaDesbloqueado(STATE.compostoAtual)){
    return { titulo:'Composto bloqueado', html:
      '<p style="font-size:.9em;color:var(--tx2);line-height:1.7;text-align:center;'+
        'background:var(--bg2);border-radius:8px;padding:1rem;border:1px solid var(--bdr);">'+
        '🔒 <strong>'+sub2(STATE.compostoAtual)+'</strong> ainda está bloqueado.<br>'+
        'Acerte a nomenclatura na aba ◈ Ficha para liberar os dados e a estrutura.'+
      '</p>' };
  }

  /* Painel unico "Dados & Estrutura" → um unico ⤢ que expande as duas
     fichas juntas. Reaproveita os geradores 'lewis' e 'gerais' em vez de
     duplicar o HTML dos dois. */
  if(target==='ficha'){
    var lew = gerarConteudoModal('lewis');
    var ger = gerarConteudoModal('gerais');
    if(!lew || !ger) return null;
    return {
      titulo: 'Dados & Estrutura — ' + c.nome,
      html:   '<p class="data-subhead">Estrutura molecular</p>' + lew.html + ger.html,
      onOpen: lew.onOpen
    };
  }

  if(target==='gerais'){
    function dr(dt,dd){
      return '<div class="dr"><dt>'+dt+'</dt><dd>'+
        (dd&&dd!=='—'?dd:'<span class="na">—</span>')+'</dd></div>';
    }
    return { titulo:'Dados Gerais — '+c.nome, html:
      '<p class="data-subhead">Identificação</p>'+
      '<dl class="data-grid">'+
        dr('Fórmula',      '<span style="font-size:1.05em;color:var(--coral);">'+sub2(STATE.compostoAtual)+'</span>')+
        dr('Função',       '<span style="color:'+(FUNCAO_META[c.funcao]||{cor:'var(--tx1)'}).cor+';">'+(f.label||'—')+'</span>')+
        dr('Nomenclatura', c.nomenclatura||'—')+
        dr('Geometria',    c.geometria||'—')+
        dr('Ligação',      c.ligacao||'—')+
      '</dl>'+
      '<p class="data-subhead">Propriedades Físicas</p>'+
      '<dl class="data-grid">'+
        dr('Massa Molar',  c.massa)+
        dr('Estado (25°C)',c.estado)+
        dr('Pt. Fusão',    c.pfStr||'—')+
        dr('Pt. Ebulição', c.peStr||'—')+
        dr('Densidade',    c.densidade||'—')+
        dr('Solubilidade', c.solubilidade)+
        dr('pH aprox.',    c.ph)+
      '</dl>'+
      '<p class="data-subhead">Aplicações</p>'+
      '<dl class="data-grid">'+
        dr('Uso principal', c.uso)+
      '</dl>'+
      (c.descricao?'<p style="font-size:.8em;color:var(--tx2);margin-top:.8rem;line-height:1.7;'
        +'background:var(--bg2);border-radius:6px;padding:.6rem .8rem;border:1px solid var(--bdr);">'+
        c.descricao+'</p>':'')+
      ''
    };
  }
  if(target==='lewis'){
    /* Gera SVG inline após montar o HTML */
    return {
      titulo: 'Estrutura — '+c.nome,
      html:
        '<svg id="modal-lewis-svg" viewBox="0 0 300 200" '+
          'style="width:100%;max-width:420px;height:200px;display:block;margin:0 auto;'+
          'background:var(--bg2);border-radius:8px;border:1px solid var(--bdr);">'+
        '</svg>'+
        '<p style="text-align:center;color:var(--tx2);font-size:.82em;margin:.6rem 0 0;">'+
          c.nomenclatura+
        '</p>'+
        '<p style="font-size:.82em;color:var(--tx2);margin-top:.9rem;line-height:1.7;'+
          'background:var(--bg2);border-radius:6px;padding:.65rem .8rem;border:1px solid var(--bdr);">'+
          (c.curiosidade||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+
        '</p>',
      onOpen: function(){
        var svg=document.getElementById('modal-lewis-svg');
        if(svg) desenharLewis(STATE.compostoAtual, c, svg);
      }
    };
  }
  /* medidas modal removido */
  if(target==='reacao'){
    var eqDisplay = (c.equacao||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var reacaoDisplay = (c.reacao||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return { titulo:'Reação Modelo — '+c.nome, html:
      '<p class="data-subhead">Ionização / Dissociação</p>'+
      '<div style="font-family:var(--mono);font-size:1.05em;color:var(--coral2);'+
        'background:var(--bg2);border-radius:8px;padding:.75rem 1rem;'+
        'border:1px solid var(--bdr);text-align:center;letter-spacing:.02em;margin-bottom:.8rem;">'+
        eqDisplay+
      '</div>'+
      '<p class="data-subhead">Reação Modelo</p>'+
      '<pre style="font-family:var(--mono);font-size:.9em;line-height:1.9;'+
        'color:var(--tx1);white-space:pre-wrap;background:var(--bg2);'+
        'border-radius:8px;padding:.75rem 1rem;border:1px solid var(--bdr);">'+
        reacaoDisplay+
      '</pre>'+
      '<p class="data-subhead" style="margin-top:.9rem;">Curiosidade</p>'+
      '<p style="font-size:.85em;color:var(--tx2);line-height:1.75;'+
        'background:var(--bg2);border-radius:8px;padding:.7rem .9rem;border:1px solid var(--bdr);">'+
        (c.curiosidade||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+
      '</p>' };
  }
  return null;
}

/* ════════════════════════════════════════════════════════════════
   7. MOBILE OFF-CANVAS — mesmo padrão SIEM
════════════════════════════════════════════════════════════════ */
function initMobile(){
  var btnL=$('mobile-menu-btn'), btnR=$('mobile-menu-btn-right');
  var sideL=$('sidebar-left'), sideR=$('sidebar-right');
  var bkdp=$('mobile-backdrop');

  function fechar(){
    if(sideL) sideL.classList.remove('mobile-open');
    if(sideR) sideR.classList.remove('mobile-open');
    if(bkdp) bkdp.hidden=true;
    if(btnL) btnL.setAttribute('aria-expanded','false');
    if(btnR) btnR.setAttribute('aria-expanded','false');
  }

  function abrirEsq(){
    fechar();
    if(sideL) sideL.classList.add('mobile-open');
    if(bkdp) bkdp.hidden=false;
    if(btnL) btnL.setAttribute('aria-expanded','true');
  }
  function abrirDir(){
    fechar();
    if(sideR) sideR.classList.add('mobile-open');
    if(bkdp) bkdp.hidden=false;
    if(btnR) btnR.setAttribute('aria-expanded','true');
  }

  if(btnL) btnL.addEventListener('click',function(){
    sideL&&sideL.classList.contains('mobile-open') ? fechar() : abrirEsq();
  });
  if(btnR) btnR.addEventListener('click',function(){
    sideR&&sideR.classList.contains('mobile-open') ? fechar() : abrirDir();
  });
  if(bkdp) bkdp.addEventListener('click', fechar);

  /* Fechar ao pressionar Escape */
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape') fechar();
  });

  /* Fechar sidebar esquerda ao selecionar composto em mobile */
  document.addEventListener('click', function(e){
    if(e.target && e.target.closest && e.target.closest('.sub-item')){
      var isMobile = window.innerWidth <= 900;
      if(isMobile) setTimeout(fechar, 150);
    }
  });

  /* Swipe para fechar sidebars (touch) */
  var touchStartX=0, touchStartY=0;
  document.addEventListener('touchstart', function(e){
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if(dy > 60) return; /* swipe vertical, ignorar */
    /* Swipe left fecha sidebar esquerda */
    if(dx < -60 && sideL && sideL.classList.contains('mobile-open')) fechar();
    /* Swipe right fecha sidebar direita */
    if(dx > 60 && sideR && sideR.classList.contains('mobile-open'))  fechar();
  }, {passive:true});

  /* Expõe fechar globalmente */
  window._closeSidebars = fechar;
}

/* ════════════════════════════════════════════════════════════════
   8. CANVAS DE PARTÍCULAS — visualização do béquer
════════════════════════════════════════════════════════════════ */
var CANVAS_STATE = { particulas:[], raf:null, modo:'repouso' };

function initCanvas(){
  var cv=$('sim-canvas'); if(!cv) return;
  function resize(){ cv.width=cv.offsetWidth; cv.height=cv.offsetHeight||120; }
  resize();
  new ResizeObserver(resize).observe(cv);
  gerarParticulas('repouso');
  animarCanvas();
}

function gerarParticulas(modo){
  var cv=$('sim-canvas'); if(!cv) return;
  var c=COMPOSTOS[STATE.compostoAtual]||{};
  var col=FUNCAO_META[c.funcao]?FUNCAO_META[c.funcao].cor:'#FF6B47';
  CANVAS_STATE.modo=modo;
  CANVAS_STATE.particulas=[];
  var n= modo==='reacao' ? 35 : modo==='acerto' ? 25 : 20;
  for(var i=0;i<n;i++){
    var speed= modo==='reacao' ? 1.8 : modo==='acerto' ? 2.5 : 0.4;
    CANVAS_STATE.particulas.push({
      x:Math.random()*cv.width, y:Math.random()*cv.height,
      r:Math.random()*3+2,
      vx:(Math.random()-.5)*speed*2, vy:(Math.random()-.5)*speed*2,
      alpha:Math.random()*.5+.4,
      col:col, pulse:Math.random()*Math.PI*2,
    });
  }
}

function animarCanvas(){
  var cv=$('sim-canvas'); if(!cv) return;
  var ctx=cv.getContext('2d');
  function frame(){
    CANVAS_STATE.raf=requestAnimationFrame(frame);
    ctx.clearRect(0,0,cv.width,cv.height);
    CANVAS_STATE.particulas.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.pulse+=0.04;
      if(p.x<0||p.x>cv.width)  p.vx*=-1;
      if(p.y<0||p.y>cv.height) p.vy*=-1;
      var r=p.r+(CANVAS_STATE.modo==='reacao'?Math.sin(p.pulse)*1.5:0);
      ctx.beginPath();
      ctx.arc(p.x,p.y,r,0,Math.PI*2);
      ctx.fillStyle=p.col+(Math.round(p.alpha*255).toString(16).padStart(2,'0'));
      ctx.fill();
    });
  }
  frame();
}

/* ════════════════════════════════════════════════════════════════
   9. LISTA DE COMPOSTOS — mol-cat-tabs + sub-list (padrão SIEM)
════════════════════════════════════════════════════════════════ */
function initSubList(){
  var tabsEl=$('sub-cat-tabs');
  var listEl=$('sub-list');
  var searchEl=$('sub-search');
  if(!tabsEl||!listEl) return;

  /* Abas de categoria */
  CATEGORIAS.forEach(function(cat){
    var btn=document.createElement('button');
    btn.type='button'; btn.className='mol-cat-btn'; btn.textContent=cat.label;
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', cat.id==='todos'?'true':'false');
    if(cat.id==='todos') btn.classList.add('active-cat');
    btn.addEventListener('click',function(){
      tabsEl.querySelectorAll('.mol-cat-btn').forEach(function(b){
        b.classList.remove('active-cat'); b.setAttribute('aria-selected','false');
      });
      btn.classList.add('active-cat'); btn.setAttribute('aria-selected','true');
      STATE.catAtiva=cat.id;
      renderSubList('');
      if(searchEl) searchEl.value='';
    });
    tabsEl.appendChild(btn);
  });

  /* Busca */
  if(searchEl){
    searchEl.addEventListener('input',function(){
      renderSubList(normTxt(searchEl.value));
    });
  }

  renderSubList('');
}

function renderSubList(query){
  var listEl=$('sub-list'); if(!listEl) return;
  listEl.innerHTML='';

  var grupos={};
  Object.entries(COMPOSTOS).forEach(function(pair){
    var formula=pair[0], c=pair[1];
    if(STATE.catAtiva!=='todos'&&c.funcao!==STATE.catAtiva) return;
    if(query){
      var haystack=normTxt(formula+' '+c.nome+' '+c.nomenclatura);
      if(!haystack.includes(query)) return;
    }
    if(!grupos[c.funcao]) grupos[c.funcao]=[];
    grupos[c.funcao].push([formula,c]);
  });

  var total=0;
  var ordem=['acido','base','sal','oxido'];
  ordem.forEach(function(fn){
    if(!grupos[fn]) return;
    var meta=FUNCAO_META[fn]||{};
    if(STATE.catAtiva==='todos'){
      var hdr=document.createElement('li');
      hdr.className='sub-group-hdr'; hdr.textContent=meta.label||fn;
      listEl.appendChild(hdr);
    }
    grupos[fn].forEach(function(pair){
      var formula=pair[0], c=pair[1];
      total++;
      var desbloqueado = estaDesbloqueado(formula);
      var li=document.createElement('li');
      li.className='sub-item'+(formula===STATE.compostoAtual?' active':'')+(desbloqueado?'':' bloqueado');
      li.setAttribute('role','option');
      li.setAttribute('aria-selected', formula===STATE.compostoAtual?'true':'false');
      li.setAttribute('title', desbloqueado?c.nome:'Acerte a nomenclatura na ◈ Ficha para desbloquear');
      li.dataset.formula = formula;
      li.tabIndex=0;
      if(desbloqueado){
        li.innerHTML='<span class="si-dot" style="color:'+meta.cor+';" aria-hidden="true"></span>'+
          '<span class="si-formula">'+sub2(formula)+'</span>'+
          '<span class="si-name">'+c.nome+'</span>';
      } else {
        li.innerHTML='<span class="si-dot si-dot-lock" aria-hidden="true">🔒</span>'+
          '<span class="si-formula">'+sub2(formula)+'</span>'+
          '<span class="si-name si-name-lock">???</span>';
      }
      function selecionar(){
        if(!estaDesbloqueado(formula)){
          /* Levar para ficha de nomenclatura sem revelar nome.
             Este e o caminho que o clique na biblioteca usa de fato — ele
             NAO passa por carregarComposto(), entao a limpeza do painel
             "Dados & Estrutura" tem de ser chamada aqui tambem. Sem ela,
             o painel continuava mostrando os dados do composto liberado
             anteriormente. */
          STATE.compostoAtual = formula;
          _limparPainelFicha(formula);
          _mostrarDesafio(formula);
          listEl.querySelectorAll('.sub-item').forEach(function(el){
            el.classList.remove('active'); el.setAttribute('aria-selected','false');
          });
          li.classList.add('active'); li.setAttribute('aria-selected','true');
          return;
        }
        carregarComposto(formula);
        listEl.querySelectorAll('.sub-item').forEach(function(el){
          el.classList.remove('active'); el.setAttribute('aria-selected','false');
        });
        li.classList.add('active'); li.setAttribute('aria-selected','true');
      }
      li.addEventListener('click',selecionar);
      li.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selecionar(); }});
      listEl.appendChild(li);
    });
  });

  var badge=$('badge-total'); if(badge) badge.textContent=total;
  if(total===0){
    var empty=document.createElement('li');
    empty.style.cssText='padding:.4rem .5rem;font-size:.72rem;color:var(--tx3);';
    empty.textContent='Nenhum composto encontrado.';
    listEl.appendChild(empty);
  }
}

/* ════════════════════════════════════════════════════════════════
   10. CARREGAR COMPOSTO
════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════
   FICHA DE NOMENCLATURA — desafio para desbloquear o composto
════════════════════════════════════════════════════════════════ */
var _nomHtmlOriginal = null; /* salvo uma vez para restaurar */

/* Retorna um exemplo de nome que NÃO seja o composto atual */
function _placeholderNomeclatura(formulaIdAtual){
  var exemplos = [
    {id:'HCl',   nome:'Ácido clorídrico'},
    {id:'H2SO4', nome:'Ácido sulfúrico'},
    {id:'NaOH',  nome:'Hidróxido de sódio'},
    {id:'CaO',   nome:'Óxido de cálcio'},
    {id:'NaCl',  nome:'Cloreto de sódio'},
    {id:'CO2',   nome:'Dióxido de carbono'},
    {id:'NH3',   nome:'Amônia'},
    {id:'H2O',   nome:'Água'},
    {id:'FeCl3', nome:'Cloreto de ferro III'},
    {id:'ZnO',   nome:'Óxido de zinco'},
  ];
  var normaAtual = normFormula(formulaIdAtual);
  var disponiveis = exemplos.filter(function(e){
    return normFormula(e.id) !== normaAtual && e.id !== formulaIdAtual;
  });
  if(!disponiveis.length) return 'Digite o nome do composto…';
  var escolha = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  return 'Ex.: ' + escolha.nome + '…';
}


function _mostrarDesafio(formulaId){
  var c = COMPOSTOS[formulaId]; if(!c) return;
  var f = FUNCAO_META[c.funcao] || {};
  var painelInfo = document.getElementById('panel-info');
  if(!painelInfo) return;

  /* Salvar HTML original da ficha apenas uma vez */
  if(!_nomHtmlOriginal){
    _nomHtmlOriginal = painelInfo.innerHTML;
  }

  /* ── Nomes aceitos (normalizado) ── */
  var nomesAceitos = [normTxt(c.nome)];
  if(c.nomenclatura){
    nomesAceitos.push(normTxt(c.nomenclatura.split('(')[0].trim()));
    nomesAceitos.push(normTxt(c.nomenclatura));
  }
  /* variações sem prefixo */
  var base = nomesAceitos.slice();
  base.forEach(function(n){
    nomesAceitos.push(n.replace(/^acido\s+/,'').trim());
    nomesAceitos.push(n.replace(/^hidroxido de\s+/,'hidroxido ').trim());
    nomesAceitos.push(n.replace(/^oxido de\s+/,'oxido ').trim());
  });
  /* remover duplicatas e strings muito curtas */
  nomesAceitos = nomesAceitos.filter(function(n,i,a){
    return n.length > 2 && a.indexOf(n)===i;
  });

  /* ── Dicas progressivas ── */
  var dicas = [];
  var funcDesc = {acido:'ácido — libera H⁺ em solução aquosa',base:'base / hidróxido — libera OH⁻',sal:'sal — cátion ≠ H⁺ e ânion ≠ OH⁻',oxido:'óxido — binário com oxigênio'};
  dicas.push('Este composto é um ' + (funcDesc[c.funcao]||c.funcao) + '.');
  if(c.nome){
    dicas.push('O nome começa com "' + c.nome.charAt(0).toUpperCase() + '".');
    var palavras = c.nome.split(' ');
    if(palavras.length > 1){
      dicas.push('O nome tem ' + palavras.length + ' palavra(s): "' +
        palavras.map(function(p,i){ return i===0 ? p : '___'; }).join(' ') + '".');
    }
    if(palavras.length > 2){
      dicas.push('Penúltima palavra: "' + palavras[palavras.length-2] + '".');
    }
  }
  if(c.uso) dicas.push('Pista de uso: ' + c.uso.split(',')[0].split('.')[0] + '.');

  /* ── Montar HTML do desafio ── */
  var pistasHtml =
    '<div class="nom-pista-card"><span class="nom-pista-label">Função</span>'+
    '<span class="nom-pista-val" style="color:'+f.cor+'">'+( f.label||c.funcao)+'</span></div>';
  if(c.geometria) pistasHtml +=
    '<div class="nom-pista-card"><span class="nom-pista-label">Geometria</span>'+
    '<span class="nom-pista-val">'+c.geometria+'</span></div>';
  if(c.massa) pistasHtml +=
    '<div class="nom-pista-card"><span class="nom-pista-label">Massa Molar</span>'+
    '<span class="nom-pista-val mono">'+c.massa+'</span></div>';

  painelInfo.innerHTML =
    '<div class="ficha-scroll">' +
      '<div class="nom-desafio-hero">' +
        '<div class="nom-formula-big">'+sub2(formulaId)+'</div>' +
        '<div class="nom-funcao-pill" style="background:'+f.cor+';color:#09090b">'+
          (f.label||c.funcao)+
        '</div>' +
        '<p class="nom-instrucao">Digite o nome deste composto para desbloqueá-lo na biblioteca:</p>' +
      '</div>' +
      '<div class="nom-input-wrap">' +
        '<div class="nom-input-row">' +
          '<input type="text" id="nom-input" class="nom-input"' +
            ' placeholder="'+_placeholderNomeclatura(formulaId)+'" autocomplete="off" spellcheck="false"/>' +
          '<button type="button" id="nom-btn" class="nom-btn">Verificar ↩</button>' +
        '</div>' +
        '<div id="nom-feedback" class="nom-feedback" aria-live="polite"></div>' +
      '</div>' +
      '<div class="nom-dica-wrap">' +
        '<button type="button" id="nom-dica-btn" class="nom-dica-btn">💡 Pedir dica ('+(dicas.length)+')</button>' +
        '<div id="nom-dica-txt" class="nom-dica-txt" hidden></div>' +
      '</div>' +
      '<div class="nom-pistas">'+pistasHtml+'</div>' +
      '<div class="nom-lewis-wrap">' +
        '<p class="ficha-section-label" style="text-align:center;margin-bottom:.5rem">Estrutura (pista visual)</p>' +
        '<svg id="nom-lewis-svg" class="ficha-lewis-svg" role="img" viewBox="0 0 300 180"></svg>' +
      '</div>' +
    '</div>';

  /* Mostrar o painel (sem chamar _setView para evitar loop) */
  var panelLab  = document.getElementById('panel-lab');
  var panelInfo = document.getElementById('panel-info');
  var btnLab    = document.getElementById('view-lab-btn');
  var btnInfo   = document.getElementById('view-info-btn');
  if(panelLab)  panelLab.hidden  = true;
  if(panelInfo) panelInfo.hidden = false;
  if(btnLab)  { btnLab.classList.remove('active');  btnLab.setAttribute('aria-pressed','false'); }
  if(btnInfo) { btnInfo.classList.add('active');     btnInfo.setAttribute('aria-pressed','true'); }
  STATE.modoView = 'info';

  /* Desenhar Lewis */
  setTimeout(function(){
    var lewSvg = document.getElementById('nom-lewis-svg');
    if(lewSvg) desenharLewis(formulaId, c);
  }, 50);

  /* Dicas */
  var dicasNivel = 0;
  var dicaBtn = document.getElementById('nom-dica-btn');
  var dicaTxt = document.getElementById('nom-dica-txt');
  if(dicaBtn){
    dicaBtn.addEventListener('click', function(){
      if(dicasNivel < dicas.length){
        dicaTxt.textContent = dicas[dicasNivel++];
        dicaTxt.hidden = false;
        if(dicasNivel >= dicas.length) dicaBtn.disabled = true;
        else dicaBtn.textContent = '💡 Pedir dica ('+(dicas.length-dicasNivel)+' restantes)';
      }
    });
  }

  /* Verificação */
  var tentativas = 0;
  function verificarNome(){
    var input    = document.getElementById('nom-input');
    var feedback = document.getElementById('nom-feedback');
    if(!input||!feedback) return;
    var resposta = normTxt(input.value.trim());
    if(!resposta){
      feedback.className = 'nom-feedback nom-feedback-err';
      feedback.textContent = 'Digite o nome do composto acima.';
      return;
    }
    tentativas++;

    /* comparação flexível mas que exige substância */
    var acertou = nomesAceitos.some(function(n){
      if(resposta === n) return true;
      /* aceita se a resposta contém o nome completo ou o nome contém a resposta (min 5 chars) */
      if(resposta.length >= 5 && n.includes(resposta)) return true;
      if(n.length >= 5 && resposta.includes(n)) return true;
      return false;
    });

    if(acertou){
      feedback.className = 'nom-feedback nom-feedback-ok';
      feedback.textContent = '✓ Correto! "' + c.nome + '" — desbloqueado!';
      input.disabled = true;
      var btnV = document.getElementById('nom-btn');
      if(btnV) btnV.disabled = true;
      if(dicaBtn) dicaBtn.hidden = true;

      desbloquearComposto(formulaId);

      setTimeout(function(){
        /* Restaurar HTML original da ficha e carregar composto normalmente */
        if(_nomHtmlOriginal){
          var pi = document.getElementById('panel-info');
          if(pi) pi.innerHTML = _nomHtmlOriginal;
        }
        STATE.compostoAtual = formulaId;
        carregarComposto(formulaId);
        /* Mostrar painel info com ficha completa */
        if(window._setView) window._setView('info');
      }, 1800);

    } else {
      feedback.className = 'nom-feedback nom-feedback-err';
      var erros = ['Não foi. Tente novamente!','Incorreto — use a dica se precisar.',
                   'Ainda não… verifique a ortografia.','Quase! Confira o nome completo.'];
      feedback.textContent = erros[Math.min(tentativas-1, erros.length-1)];
      input.select();
    }
  }

  var btn = document.getElementById('nom-btn');
  var inp = document.getElementById('nom-input');
  if(btn) btn.addEventListener('click', verificarNome);
  if(inp){
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); verificarNome(); }});
    setTimeout(function(){ inp.focus(); }, 150);
  }
}



/* ════════════════════════════════════════════════════════════════
   11b. LIMPAR O PAINEL "DADOS & ESTRUTURA"

   CORRECAO DE BUG. carregarComposto() sai mais cedo quando o composto
   selecionado esta BLOQUEADO (vai direto para o desafio de nomenclatura).
   Como saia antes de escrever nos campos, o painel continuava exibindo
   os dados do composto ANTERIOR — ou seja, o aluno clicava num composto
   bloqueado e lia, ao lado, massa molar, pH, geometria e a estrutura de
   Lewis de outro composto. Alem de errado, entregava de graca parte do
   que o desafio deveria cobrar.

   Esta funcao zera o painel e o marca como bloqueado. E chamada logo
   antes de _mostrarDesafio().
════════════════════════════════════════════════════════════════ */
function _limparPainelFicha(formulaId){
  /* Chip de consulta: mantem a formula (ela nao e segredo — aparece na
     biblioteca e no proprio desafio), mas o nome vira o aviso de bloqueio */
  txt('consulta-formula', formulaId ? sub2(formulaId) : '—');
  txt('consulta-nome',    '🔒 Bloqueado — acerte a nomenclatura');
  var chip=$('consulta-chip');
  if(chip){
    chip.style.borderColor = 'var(--bdr2)';
    var chipFormula = chip.querySelector('#consulta-formula');
    if(chipFormula) chipFormula.style.color = 'var(--tx3)';
  }

  /* Todos os campos de dados voltam a "—" */
  ['d-formula','d-funcao','d-nomenclatura','d-geometria','d-massa','d-estado',
   'd-solu','d-ph','d-pf','d-pe','d-densidade','d-uso'].forEach(function(id){
    txt(id, '—');
  });

  /* Estrutura de Lewis: SVG esvaziado e legenda avisando o motivo */
  var svg=$('lewis-svg');
  if(svg){ while(svg.firstChild) svg.removeChild(svg.firstChild); }
  txt('lewis-legenda', 'Composto bloqueado — estrutura oculta');

  /* Pill do cabecalho tambem nao pode ficar com a funcao do composto
     anterior (nem revelar a funcao deste, que e a 1a dica do desafio) */
  var pill=$('state-pill');
  if(pill){
    var t0=document.getElementById('state-pill-text');
    if(t0) t0.textContent='🔒 Bloqueado';
    pill.className='state-pill';
  }
}

function carregarComposto(formula){
  var c=COMPOSTOS[formula]; if(!c) return;
  /* Se bloqueado, redirecionar para desafio de nomenclatura */
  if(!estaDesbloqueado(formula)){
    STATE.compostoAtual = formula;
    _limparPainelFicha(formula);   /* ← zera o painel antes de sair */
    _mostrarDesafio(formula);
    return;
  }
  STATE.compostoAtual=formula;
  var f=FUNCAO_META[c.funcao]||{};

  /* Pill de estado no header */
  var pill=$('state-pill');
  if(pill){
    var t1=document.getElementById('state-pill-text');
    if(t1) t1.textContent=f.label||'sem composto';
    pill.className='state-pill '+(f.label?c.funcao:'state-pill--vazio');
  }

  /* Ao selecionar composto:
     - Se lab ativo com experimento em curso → destacar no tray + mostrar ficha na sidebar
     - Se não há experimento ativo → ir para ficha central */
  if(STATE._compostoInicialCarregado){
    if(STATE.modoView==='lab'){
      /* Lab: abrir reações disponíveis para este composto */
      abrirReacoesLivres(formula, c);
    } else if(window._setView){
      window._setView('info');
    }
  }
  STATE._compostoInicialCarregado = true;

  /* Chip de consulta no topo do painel */
  txt('consulta-formula', sub2(formula));
  txt('consulta-nome',    c.nome||'—');
  var chip=$('consulta-chip');
  if(chip){
    chip.style.borderColor = f.cor||'var(--bdr2)';
    var chipFormula = chip.querySelector('#consulta-formula');
    if(chipFormula) chipFormula.style.color = f.cor||'var(--coral)';
  }

  /* Sidebar esquerda — dados gerais */
  txt('d-formula', sub2(formula));
  txt('d-funcao', f.label||'—');
  txt('d-nomenclatura', c.nomenclatura||'—');
  txt('d-massa', c.massa||'—');
  txt('d-estado', c.estado||'—');
  txt('d-solu', c.solubilidade||'—');
  txt('d-ph', c.ph||'—');
  txt('d-uso',          c.uso||'—');
  /* Campos extras de dadossiqi */
  txt('d-pf',       c.pfStr  || '—');
  txt('d-pe',       c.peStr  || '—');
  txt('d-densidade',c.densidade || '—');
  txt('d-geometria',c.geometria || '—');

  /* Diagrama de Lewis */
  desenharLewis(formula, c);

  /* reacao-mini e curiosidade-side removidos */

  /* ── Painel Ficha (área central) ── */
  txt('ficha-formula',     sub2(formula));
  txt('ficha-name',        c.nome);

  /* Badges de classificação */
  var badges=$('ficha-badges');
  if(badges) badges.innerHTML=(c.badges||[]).map(function(b){
    return '<span class="badge '+c.funcao+'">'+b+'</span>';
  }).join('');

  /* Banner de função */
  var ftag=$('funcao-tag'), fdesc=$('funcao-desc');
  if(ftag)  ftag.textContent=f.label||'—';
  if(fdesc) fdesc.textContent=f.desc||'—';
  var ftBanner=$('funcao-banner');
  if(ftBanner) ftBanner.style.borderLeftColor=f.cor||'var(--coral)';

  /* Equação de ionização */
  txt('equacao-display', c.equacao||'—');

  /* Grid de propriedades */
  txt('ficha-nomenclatura', c.nomenclatura||'—');
  txt('ficha-geometria',    c.geometria||'—');
  txt('ficha-massa',        c.massa||'—');
  txt('ficha-estado',       c.estado||'—');
  txt('ficha-pf',           c.pfStr||'—');
  txt('ficha-pe',           c.peStr||'—');
  txt('ficha-densidade',    c.densidade||'—');
  txt('ficha-ph',           c.ph||'—');
  txt('ficha-solu',         c.solubilidade||'—');
  txt('ficha-uso',          c.uso||'—');

  /* Lewis central na ficha */
  var fichaLewis=$('ficha-lewis-svg');
  var fichaLeg=$('ficha-lewis-leg');
  if(fichaLewis){
    while(fichaLewis.firstChild) fichaLewis.removeChild(fichaLewis.firstChild);
    var tipo=c.lewis||'generico';
    var lewFns={acido_haloidro:lewisHaloidro,acido_oxigenado:lewisOxigenado,
      base_forte:lewisBase,base_fraca:lewisBaseFraga,sal_ionico:lewisSal,
      sal_colorido:lewisSalColorido,oxido_basico:lewisOxidoBasico,
      oxido_acido:lewisOxidoAcido,generico:lewisGenerico};
    (lewFns[tipo]||lewFns.generico)(fichaLewis, formula);
    if(fichaLeg) fichaLeg.textContent=(f.label||c.funcao)+' — estrutura simplificada';
  }

  /* Reação e curiosidade */
  txt('reacao-txt',       c.reacao||'—');
  txt('curiosidade-txt',  c.curiosidade||'—');

  /* Medidas (painel direito) */


  /* Canvas */
  gerarParticulas('repouso');

  /* Atualizar destaque na lista sem re-renderizar tudo */
  atualizarDestaqueLista(formula);

  /* SR */
  srAnnounce('Composto '+c.nome+' ('+sub2(formula)+') carregado.');
}

/* ── Atualiza só o highlight visual da lista, sem re-render ── */
function atualizarDestaqueLista(formula){
  var listEl=$('sub-list'); if(!listEl) return;
  listEl.querySelectorAll('.sub-item').forEach(function(li){
    var isActive = li.dataset.formula === formula;
    li.classList.toggle('active', isActive);
    li.setAttribute('aria-selected', String(isActive));
  });
}

/* ════════════════════════════════════════════════════════════════
   11. LEWIS SVG
════════════════════════════════════════════════════════════════ */
function desenharLewis(formula, c, svgOverride){
  var svg=svgOverride||$('lewis-svg'); if(!svg) return;
  var leg=svgOverride?null:$('lewis-legenda');
  while(svg.firstChild) svg.removeChild(svg.firstChild);

  var tipo=c.lewis||'generico';
  var fn={ acido_haloidro:lewisHaloidro, acido_oxigenado:lewisOxigenado,
    base_forte:lewisBase, base_fraca:lewisBaseFraga,
    sal_ionico:lewisSal, sal_colorido:lewisSalColorido,
    oxido_basico:lewisOxidoBasico, oxido_acido:lewisOxidoAcido, generico:lewisGenerico };
  (fn[tipo]||fn.generico)(svg, formula);
  if(leg){ var f2=FUNCAO_META[c.funcao]||{}; leg.textContent=(f2.label||c.funcao)+' — estrutura simplificada'; }
}

function svgEl(tag,attrs){
  var el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.keys(attrs).forEach(function(k){ el.setAttribute(k,attrs[k]); });
  return el;
}
function atom(svg,x,y,sym,fill,r){
  r=r||17;
  svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r,fill:fill,stroke:'var(--bdr2)','stroke-width':'1.2'}));
  var t=svgEl('text',{x:x,y:y+1,'text-anchor':'middle','dominant-baseline':'middle',
    fill:'#fff','font-size':'10','font-weight':'700','font-family':'monospace'});
  t.textContent=sym; svg.appendChild(t);
}
function bond(svg,x1,y1,x2,y2,dbl){
  svg.appendChild(svgEl('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:'var(--tx2)','stroke-width':'2','stroke-linecap':'round'}));
  if(dbl){
    var dx=(y2-y1)*.1, dy=(x1-x2)*.1;
    svg.appendChild(svgEl('line',{x1:x1+dx,y1:y1+dy,x2:x2+dx,y2:y2+dy,stroke:'var(--tx2)','stroke-width':'1.2','stroke-linecap':'round'}));
  }
}
function lbl(svg,x,y,t){ var el=svgEl('text',{x:x,y:y,'text-anchor':'middle',fill:'var(--tx2)','font-size':'8'}); el.textContent=t; svg.appendChild(el); }
function dot(svg,x,y,col){ svg.appendChild(svgEl('circle',{cx:x,cy:y,r:2.5,fill:col||'var(--cyan)'})); }

function lewisHaloidro(svg){ atom(svg,100,90,'H','#FF6B47',14); bond(svg,114,90,136,90); atom(svg,150,90,'Cl','#4ADE80',17); [136,164,150,150].forEach(function(v,i){ dot(svg,i%2===0?v:150,i<2?90:i===2?73:107); }); lbl(svg,150,130,'par compartilhado + pares livres'); }
function lewisOxigenado(svg){ atom(svg,42,90,'O','#E11D48',14); bond(svg,56,90,74,90,true); atom(svg,90,90,'S','#FBBF24',17); bond(svg,106,90,124,90,true); atom(svg,140,90,'O','#E11D48',14); bond(svg,90,73,90,58); atom(svg,90,45,'O','#E11D48',14); bond(svg,90,107,90,122); atom(svg,90,135,'O','#E11D48',14); lbl(svg,91,168,'ácido oxigenado'); }
function lewisBase(svg){ atom(svg,90,85,'Na⁺','#F59E0B',18); var t=svgEl('text',{x:112,y:90,'dominant-baseline':'middle',fill:'var(--tx3)','font-size':'16'}); t.textContent='···'; svg.appendChild(t); atom(svg,148,85,'OH⁻','#4ADE80',18); lbl(svg,119,130,'atração iônica — base forte'); }
function lewisBaseFraga(svg){ atom(svg,150,80,'N','#6366F1',17); [[130,110],[150,112],[170,110]].forEach(function(p){ bond(svg,150,80,p[0],p[1]); atom(svg,p[0],p[1],'H','#94A3B8',12); }); dot(svg,148,60); dot(svg,156,60); lbl(svg,150,145,'par livre no N — base de Brønsted'); }
function lewisSal(svg){ atom(svg,88,90,'Na⁺','#F59E0B',19); var t=svgEl('text',{x:110,y:95,'dominant-baseline':'middle',fill:'var(--tx3)','font-size':'16'}); t.textContent='···'; svg.appendChild(t); atom(svg,148,90,'Cl⁻','#22C55E',19); lbl(svg,118,135,'atração eletrostática — ligação iônica'); lbl(svg,118,148,'(íons livres em solução)'); }
function lewisSalColorido(svg){ atom(svg,90,85,'Cu²⁺','#3B82F6',21); [[70,115],[90,118],[110,115],[76,55],[104,55]].forEach(function(p){ bond(svg,90,85,p[0],p[1]); var c=svgEl('circle',{cx:p[0],cy:p[1],r:7,fill:'#60A5FA',stroke:'var(--bdr2)','stroke-width':'1'}); svg.appendChild(c); var t=svgEl('text',{x:p[0],y:p[1]+1,'text-anchor':'middle','dominant-baseline':'middle',fill:'#fff','font-size':'6'}); t.textContent='H₂O'; svg.appendChild(t); }); lbl(svg,90,150,'Cu²⁺ coordena H₂O → azul intenso'); }
function lewisOxidoBasico(svg,f){ var s=f==='CaO'?'Ca²⁺':'Fe³⁺', col=f==='CaO'?'#22C55E':'#FB923C'; atom(svg,85,90,s,col,21); bond(svg,107,90,135,90,true); atom(svg,152,90,'O²⁻','#E11D48',19); lbl(svg,119,135,'óxido básico — forma base com H₂O'); }
function lewisOxidoAcido(svg,f){ if(f==='CO2'){ atom(svg,65,90,'O','#E11D48',14); bond(svg,79,90,97,90,true); atom(svg,113,90,'C','#6B7280',17); bond(svg,129,90,147,90,true); atom(svg,163,90,'O','#E11D48',14); lbl(svg,113,130,'O=C=O  linear — óxido ácido'); } else { atom(svg,75,80,'O','#E11D48',14); bond(svg,89,80,107,80,true); atom(svg,123,80,'S','#FBBF24',17); bond(svg,123,63,123,50,true); atom(svg,123,38,'O','#E11D48',14); bond(svg,139,80,157,80,true); atom(svg,173,80,'O','#E11D48',14); lbl(svg,115,130,'SO₃ — óxido ácido / pirâmide'); } }
function lewisGenerico(svg,f){ atom(svg,150,90,f.charAt(0)||'?','var(--coral)',22); lbl(svg,150,130,sub2(f)); }

/* ════════════════════════════════════════════════════════════════
   12. TOGGLE LAB / FICHA
════════════════════════════════════════════════════════════════ */
function initViewToggle(){
  var btnLab=$('view-lab-btn'), btnInfo=$('view-info-btn');
  var panelNone=$('panel-none'), panelLab=$('panel-lab'), panelInfo=$('panel-info'), panelRedox=$('panel-redox'), panelConstrutor=$('panel-construtor');
  if(!btnLab||!btnInfo) return;

  /* setView agora suporta 'none' | 'lab' | 'info' | 'redox' | 'construtor'.
     'none' é o estado inicial (réplica do canvas em branco do SIMA
     quando sim.model===null): nenhum módulo ativo, dica central
     convidando a escolher um. trocarModulo()/desativarModulo() cuidam
     de trocar para/desta view automaticamente — ver seção 7.1. */
  function setView(v){
    STATE.modoView=v;
    var isLab=v==='lab', isInfo=v==='info', isRedox=v==='redox', isNone=v==='none', isConstrutor=v==='construtor';
    btnLab.classList.toggle('active',isLab);   btnLab.setAttribute('aria-pressed',String(isLab));
    btnInfo.classList.toggle('active',isInfo); btnInfo.setAttribute('aria-pressed',String(isInfo));
    if(panelNone) panelNone.hidden=!isNone;
    if(panelLab) panelLab.hidden=!isLab;
    if(panelInfo) panelInfo.hidden=!isInfo;
    if(panelRedox) panelRedox.hidden=!isRedox;
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

/* ════════════════════════════════════════════════════════════════
   13. SIMULADOR DIDÁTICO — chat socrático
════════════════════════════════════════════════════════════════ */
function initSimulador(){
  document.addEventListener('click', function(e){
    var t = e.target;
    if(t && t.id==='btn-reiniciar') reiniciar();
  });

  /* btn-reiniciar: acessível via window.reiniciar() */

  mostrarBoasVindas();
}

/* initProgresso removida — painel de progresso removido */

/* atualizarProgresso removida */

/* atualizarMedidas removida — painel removido */

/* ── Toast de feedback visual (sem chat) ──────────────────── */
var _toastTimer = null;
function showToast(tipo, texto){
  var el = document.getElementById('lab-toast');
  if(!el) return;
  // tipo: 'ok' | 'err' | 'hint' | 'info'
  el.className = 'lab-toast lab-toast-' + tipo;
  el.innerHTML = renderMD(texto);
  el.hidden = false;
  if(_toastTimer) clearTimeout(_toastTimer);
  var dur = tipo==='ok' ? 3500 : tipo==='hint' ? 5000 : 4000;
  _toastTimer = setTimeout(function(){ el.hidden=true; }, dur);
  srAnnounce(el.textContent, tipo==='err'?'assertive':'polite');
}
/* alias para compatibilidade com chamadas legadas */
function addMsg(tipo, texto){ showToast(tipo==='acerto'?'ok':tipo==='dica'?'hint':tipo==='tutor'?'info':'err', texto); }

/* ── Estado inicial — laboratório vazio ────────────────────── */
function mostrarBoasVindas(){
  STATE.expAtual = null;
  STATE.aguardandoResposta = false;

  /* Ocultar header do experimento */
  var expHdr = document.getElementById('exp-header');
  if(expHdr) expHdr.hidden = true;

  /* Tela inicial limpa — só instrução de seleção */
  var rxnWrap = document.getElementById('rxn-wrapper');
  if(rxnWrap){
    rxnWrap.hidden = false;
    rxnWrap.innerHTML =
      '<div class="rxl-welcome">' +
        '<div class="rxl-welcome-icon">⚗️</div>' +
        '<div class="rxl-welcome-titulo">Laboratório de Química Inorgânica</div>' +
        '<div class="rxl-welcome-sub">' +
          'Selecione um composto na biblioteca ao lado para explorar suas reações' +
        '</div>' +
      '</div>';
  }

  /* Resetar balanço */
  var balEq = document.getElementById('bal-equacao');
  var balGr = document.getElementById('bal-grid');
  if(balEq) balEq.textContent = '—';
  if(balGr) balGr.innerHTML = '<span class="bal-hint">Selecione um composto para iniciar</span>';
}



/* ── Modo Lab — selecionar composto abre painel de reações ──── */
function abrirReacoesLivres(formulaId, composto){
  var reacoes = (typeof REACOES_LIVRES !== 'undefined') && REACOES_LIVRES[formulaId] || [];

  /* Garantir modo Lab */
  if(window._setView) window._setView('lab');

  /* Header */
  var expHdr = document.getElementById('exp-header');
  if(expHdr) expHdr.hidden = false;
  txt('exp-num', '🔬  Laboratório Livre');
  txt('exp-fam', sub2(formulaId) + ' — ' + composto.nome);

  var rxnWrap = document.getElementById('rxn-wrapper');
  if(!rxnWrap) return;
  rxnWrap.hidden = false;
  rxnWrap.innerHTML = '';

  /* ── SEMPRE mostrar seletor, mesmo com 1 reação ── */
  var sel = document.createElement('div');
  sel.className = 'rxl-seletor';

  /* Cabeçalho com bolha do composto */
  var hd = document.createElement('div');
  hd.className = 'rxl-seletor-hd';

  var bubbleWrap = document.createElement('div');
  bubbleWrap.className = 'rxl-composto-wrap';
  var bubble = document.createElement('div');
  bubble.className = 'rxl-composto-bubble rxb-mol-reagente';
  var ef = estadoFisico(sub2(formulaId));
  bubble.innerHTML =
    '<div class="rxb-mol-formula">'+sub2(formulaId)+
      '<span class="rxb-mol-estado">'+ef+'</span>'+
    '</div>' +
    '<div class="rxb-mol-nome">'+(nomeMol(sub2(formulaId))||composto.nome)+'</div>';
  bubbleWrap.appendChild(bubble);

  var hdInfo = document.createElement('div');
  hdInfo.className = 'rxl-hd-info';

  if(reacoes.length === 0){
    hdInfo.innerHTML =
      '<span class="rxl-seletor-nome">'+composto.nome+'</span>' +
      '<span class="rxl-seletor-label">Nenhuma reação cadastrada para este composto.</span>';
  } else {
    hdInfo.innerHTML =
      '<span class="rxl-seletor-nome">'+composto.nome+'</span>' +
      '<span class="rxl-seletor-label">' +
        (reacoes.length === 1
          ? '1 reação disponível — escolha uma:'
          : reacoes.length + ' reações disponíveis — escolha uma:') +
      '</span>';
  }

  hd.appendChild(bubbleWrap);
  hd.appendChild(hdInfo);
  sel.appendChild(hd);

  /* Cards de reação */
  if(reacoes.length > 0){
    var lista = document.createElement('div');
    lista.className = 'rxl-lista';

    reacoes.forEach(function(rxn){
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'rxl-card';

      /* Reagentes */
      var reagStr = rxn.reagentes.map(function(r){
        var ef2 = estadoFisico(r);
        return '<span class="rxl-card-mol">'+r+
          '<span style="font-size:.55em;opacity:.7;margin-left:.1rem;">'+ef2+'</span>'+
          '</span>';
      }).join('<span class="rxl-card-plus"> + </span>');

      /* Condição + seta */
      var cond = rxn.condicao ?
        '<span class="rxl-card-cond">'+rxn.condicao+'</span>' : '';

      card.innerHTML =
        '<span class="rxl-card-icon">'+rxn.icon+'</span>' +
        '<div class="rxl-card-info">' +
          '<div class="rxl-card-eq">'+
            reagStr +
            '<span class="rxl-card-arrow-eq">'+cond+'⟶</span>' +
            '<span class="rxl-card-prod">?</span>'+
          '</div>' +
          '<span class="rxl-card-familia">'+rxn.familia+'</span>' +
        '</div>' +
        '<span class="rxl-card-arrow">›</span>';

      card.addEventListener('click', function(){
        abrirReacaoLivre(rxn, formulaId, composto);
      });
      lista.appendChild(card);
    });
    sel.appendChild(lista);
  }

  /* Rodapé */
  var footer = document.createElement('div');
  footer.className = 'rxl-seletor-footer';
  var btnBack = document.createElement('button');
  btnBack.type = 'button';
  btnBack.className = 'rxl-btn-back';
  btnBack.textContent = '← Voltar';
  btnBack.addEventListener('click', mostrarBoasVindas);
  footer.appendChild(btnBack);
  sel.appendChild(footer);

  rxnWrap.appendChild(sel);
}

/* ─────────────────────────────────────────────────────────── */
function abrirReacaoLivre(rxn, formulaId, composto){
  /* Montar experimento compatível com o builder */
  var expFake = {
    id:             'livre_'+rxn.id,
    icon:           rxn.icon,
    familia:        rxn.familia,
    titulo:         rxn.titulo,
    descricao:      rxn.descricao || '',
    reagentes:      rxn.reagentes,
    condicao:       rxn.condicao || '',
    produtos_visuais: rxn.produtos_visuais,
    candidatos:     rxn.candidatos || rxn.produtos_visuais,
    coefR:          rxn.coefR     || null,
    coefP:          rxn.coefP     || null,
    gabarito:       rxn.gabarito,
    hints:          rxn.hints     || [],
    explicacao:     rxn.explicacao|| '',
    proxExp:        null,
    _isLivre:       true,
    _formulaId:     formulaId,
    _composto:      composto,
  };

  STATE.expAtual = expFake;
  STATE.hintIdx  = 0;
  STATE.aguardandoResposta = true;

  /* Header: familia + titulo da reação */
  var expHdr = document.getElementById('exp-header');
  if(expHdr) expHdr.hidden = false;
  txt('exp-num', rxn.icon + '  ' + rxn.familia);
  txt('exp-fam', rxn.titulo + (rxn.descricao ? '  ·  ' + rxn.descricao : ''));

  /* Builder */
  var rxnWrap = document.getElementById('rxn-wrapper');
  if(rxnWrap){
    rxnWrap.innerHTML = '';
    rxnWrap.appendChild(criarBuilder(expFake));
  }
}


/* ════════════════════════════════════════════════════════════════
   RXN BUILDER v2 — construtor interativo de reação
   Correções:
   · Parser universal de fórmulas (sem dicionário fixo)
   · Estado por experimento isolado (sem contaminação entre exps)
   · Slots independentes com coeficientes próprios
   · Tray correto: só produtos candidatos, nunca reagentes
   · Eq. estequiométrica atualiza a cada mudança
════════════════════════════════════════════════════════════════ */

/* ── Metadados visuais ──────────────────────────────────────── */
var RXN_META = {
  /* Elementos e compostos simples */
  'Zn':      {funcao:'elem',  nome:'Zinco metálico'},
  'H₂':      {funcao:'gas',   nome:'Gás Hidrogênio'},   'H2':{funcao:'gas',   nome:'Gás Hidrogênio'},
  'O₂':      {funcao:'elem',  nome:'Oxigênio'},          'O2':{funcao:'elem',  nome:'Oxigênio'},
  'H₂O':     {funcao:'elem',  nome:'Água'},              'H2O':{funcao:'elem', nome:'Água'},
  /* Ácidos */
  'HCl':     {funcao:'acido', nome:'Ácido Clorídrico'},
  'H₂SO₄':   {funcao:'acido', nome:'Ácido Sulfúrico'},   'H2SO4':{funcao:'acido', nome:'Ácido Sulfúrico'},
  'HNO₃':    {funcao:'acido', nome:'Ácido Nítrico'},     'HNO3':{funcao:'acido',  nome:'Ácido Nítrico'},
  'H₂CO₃':   {funcao:'acido', nome:'Ácido Carbônico'},   'H2CO3':{funcao:'acido', nome:'Ácido Carbônico'},
  /* Bases */
  'NaOH':    {funcao:'base',  nome:'Hidróxido de Sódio'},
  'Ca(OH)₂': {funcao:'base',  nome:'Hidróxido de Cálcio'}, 'Ca(OH)2':{funcao:'base', nome:'Hidróxido de Cálcio'},
  'NH₃':     {funcao:'base',  nome:'Amônia'},            'NH3':{funcao:'base',  nome:'Amônia'},
  /* Sais */
  'NaCl':    {funcao:'sal',   nome:'Cloreto de Sódio'},
  'CuSO₄':   {funcao:'sal',   nome:'Sulfato de Cobre'},  'CuSO4':{funcao:'sal', nome:'Sulfato de Cobre'},
  'AgNO₃':   {funcao:'sal',   nome:'Nitrato de Prata'},  'AgNO3':{funcao:'sal', nome:'Nitrato de Prata'},
  'ZnCl₂':   {funcao:'sal',   nome:'Cloreto de Zinco'},  'ZnCl2':{funcao:'sal', nome:'Cloreto de Zinco'},
  'Na₂SO₄':  {funcao:'sal',   nome:'Sulfato de Sódio'},  'Na2SO4':{funcao:'sal', nome:'Sulfato de Sódio'},
  'ZnO':     {funcao:'oxido', nome:'Óxido de Zinco'},
  'CaCO₃':   {funcao:'sal',   nome:'Carbonato de Cálcio'}, 'CaCO3':{funcao:'sal', nome:'Carbonato de Cálcio'},
  /* Óxidos */
  'CaO':     {funcao:'oxido', nome:'Óxido de Cálcio'},
  'CO₂':     {funcao:'oxido', nome:'Dióxido de Carbono'}, 'CO2':{funcao:'oxido', nome:'Dióxido de Carbono'},
  'Fe₂O₃':   {funcao:'oxido', nome:'Óxido de Ferro III'}, 'Fe2O3':{funcao:'oxido', nome:'Óxido de Ferro III'},
  'SO₃':     {funcao:'oxido', nome:'Trióxido de Enxofre'}, 'SO3':{funcao:'oxido', nome:'Trióxido de Enxofre'},
};

function funcaoMol(f){
  var m=RXN_META[f]; if(m) return m.funcao;
  var k=normFormula(f); var c=COMPOSTOS[k]||COMPOSTOS[f];
  return c?c.funcao:'elem';
}
function nomeMol(f){
  var m=RXN_META[f]; if(m) return m.nome;
  var k=normFormula(f); var c=COMPOSTOS[k]||COMPOSTOS[f];
  return c?c.nome:'';
}
/* Normaliza subscripts unicode → ASCII para lookup */
function normFormula(f){
  return f.replace(/[₀₁₂₃₄₅₆₇₈₉]/g,function(c){
    return '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)];
  });
}

/* ── Parser universal de fórmulas ───────────────────────────── */
function parsearFormula(formula){
  var f = normFormula(formula);
  var resultado = {};
  function parse(seg, mult){
    var i=0;
    while(i<seg.length){
      if(seg[i]==='('){
        var depth=1, j=i+1;
        while(j<seg.length&&depth>0){
          if(seg[j]==='(') depth++; else if(seg[j]===')') depth--; j++;
        }
        var inner=seg.slice(i+1,j-1);
        var nm=seg.slice(j).match(/^(\d+)/);
        var n=nm?parseInt(nm[1]):1;
        parse(inner, mult*n);
        i=j+(nm?nm[1].length:0);
      } else if(/[A-Z]/.test(seg[i])){
        var j2=i+1;
        while(j2<seg.length&&/[a-z]/.test(seg[j2])) j2++;
        var el=seg.slice(i,j2);
        var nm2=seg.slice(j2).match(/^(\d+)/);
        var n2=nm2?parseInt(nm2[1]):1;
        resultado[el]=(resultado[el]||0)+n2*mult;
        i=j2+(nm2?nm2[1].length:0);
      } else { i++; }
    }
  }
  parse(f,1);
  return resultado;
}


/* ── Estado físico de compostos comuns (25 °C, 1 atm) ──────── */
var ESTADO_FISICO = {
  /* Gases */
  'H₂':'(g)','H2':'(g)','O₂':'(g)','O2':'(g)',
  'CO₂':'(g)','CO2':'(g)','SO₃':'(g)','SO3':'(g)',
  'HCl':'(g)','NH₃':'(g)','NH3':'(g)',
  'NO':'(g)','NO₂':'(g)','SO₂':'(g)',
  /* Líquidos */
  'H₂O':'(l)','H2O':'(l)',
  'H₂SO₄':'(l)','H2SO4':'(l)',
  'HNO₃':'(l)','HNO3':'(l)',
  /* Sólidos */
  'NaOH':'(s)','CaO':'(s)','Ca(OH)₂':'(s)','Ca(OH)2':'(s)',
  'CaCO₃':'(s)','CaCO3':'(s)',
  'NaCl':'(s)','ZnCl₂':'(s)','ZnCl2':'(s)',
  'AgCl':'(s)','AgBr':'(s)',
  'CaSO₄':'(s)','CaSO4':'(s)',
  'Fe₂O₃':'(s)','Fe2O3':'(s)',
  'Al₂O₃':'(s)','Al2O3':'(s)',
  'Fe':'(s)','Al':'(s)','Zn':'(s)','Cu':'(s)',
  'NH₄Cl':'(s)','NH4Cl':'(s)',
  'CuSO₄':'(s)','CuSO4':'(s)',
  'AgNO₃':'(s)','AgNO3':'(s)',
  'FeCl₂':'(s)','FeCl2':'(s)',
  'FeCl₃':'(s)','FeCl3':'(s)',
  'ZnO':'(s)','ZnSO₄':'(s)','ZnSO4':'(s)',
  'KNO₃':'(s)','KNO3':'(s)','KOH':'(s)',
  'Na₂SO₄':'(s)','Na2SO4':'(s)',
  'Na₂CO₃':'(s)','Na2CO3':'(s)',
  'NaHCO₃':'(s)','NaHCO3':'(s)',
  'Cu(OH)₂':'(s)','Fe(OH)₃':'(s)',
  'CaCl₂':'(s)','CaCl2':'(s)',
  'Fe₂(SO₄)₃':'(s)',
  /* Aquosos — em solução */
  'H₂CO₃':'(aq)','H2CO3':'(aq)',
};

function estadoFisico(f){
  /* Verificar diretamente, depois sem subscripts */
  if(ESTADO_FISICO[f]) return ESTADO_FISICO[f];
  var k=normFormula(f);
  if(ESTADO_FISICO[k]) return ESTADO_FISICO[k];
  /* Padrão por funcao */
  var fn=funcaoMol(f);
  if(fn==='gas') return '(g)';
  if(fn==='elem') return '(s)';
  return '(aq)'; /* sais e ácidos em solução por padrão */
}

/* ── Candidatos por experimento ─────────────────────────────── */
var CANDIDATOS = {
  /* Exp 1: CaO + H₂O — corretos: Ca(OH)₂ */
  1: ['Ca(OH)₂','CO₂','CaCO₃','H₂','CaO','HCl','Na₂O','Ca(NO₃)₂'],
  /* Exp 2: CaCO₃ →Δ — corretos: CaO + CO₂ */
  2: ['CaO','CO₂','Ca(OH)₂','CaCl₂','O₂','H₂O','CaCO₃','Ca(NO₃)₂'],
  /* Exp 3: Zn + HCl — corretos: ZnCl₂ + H₂ */
  3: ['ZnCl₂','H₂','ZnO','NaCl','ZnSO₄','H₂O','FeCl₂','HCl'],
  /* Exp 4: HCl + NaOH — corretos: NaCl + H₂O */
  4: ['NaCl','H₂O','Na₂SO₄','Na₂CO₃','NaHCO₃','HNO₃','Ca(OH)₂','CO₂'],
};

/* ── Estado do builder (um por experimento ativo) ──────────── */
var BUILDER = {
  expId:    null,
  slots:    [],   /* Array<string|null> — fórmula em cada slot */
  coefR:    {},   /* {formula: n} — coeficientes dos reagentes */
  coefP:    [],   /* Array<n> — coeficiente de cada slot produto */
  selected: null, /* fórmula selecionada no tray */
};

/* Gera coeficiente aleatório 1-6 diferente do correto */
function coefAleatorio(correto){
  var ops = [1,2,3,4,5,6].filter(function(n){ return n !== (correto||1); });
  return ops[Math.floor(Math.random()*ops.length)];
}

function builderReset(exp){
  BUILDER.expId    = exp.id;
  BUILDER.slots    = new Array(exp.produtos_visuais.length).fill(null);
  BUILDER.selected = null;

  /* Coeficientes dos REAGENTES: valor aleatório ≠ correto */
  BUILDER.coefR = {};
  if(exp.coefR){
    Object.keys(exp.coefR).forEach(function(r){
      BUILDER.coefR[r] = coefAleatorio(exp.coefR[r]);
    });
  } else {
    exp.reagentes.forEach(function(r){ BUILDER.coefR[r] = coefAleatorio(1); });
  }

  /* Coeficientes dos PRODUTOS: sempre iniciam em 1 (aluno ajusta) */
  BUILDER.coefP = new Array(exp.produtos_visuais.length).fill(1);
}

/* ═══════════════════════════════════════════════════════════════
   CRIAÇÃO DO BUILDER
═══════════════════════════════════════════════════════════════ */
function criarBuilder(exp){
  builderReset(exp);

  var root=document.createElement('div');
  root.className='rxb-root'; root.id='rxb-root-'+exp.id;

  /* ── Zona da equação ───────────────────────────────────────── */
  var eqRow=document.createElement('div');
  eqRow.className='rxb-eq-row';

  /* Reagentes */
  exp.reagentes.forEach(function(r,i){
    if(i>0) eqRow.appendChild(rxbOp('+'));
    eqRow.appendChild(rxbReagente(r, exp));
  });

  /* Seta */
  var seta=document.createElement('div');
  seta.className='rxb-seta';
  seta.innerHTML='<span class="rxb-seta-arrow">⟶</span>'+
    (exp.condicao?'<span class="rxb-seta-cond">'+exp.condicao+'</span>':'');
  eqRow.appendChild(seta);

  /* Slots de produto */
  var slotsWrap=document.createElement('div');
  slotsWrap.className='rxb-slots-wrap'; slotsWrap.id='rxb-slots-'+exp.id;
  BUILDER.slots.forEach(function(_,idx){
    if(idx>0) slotsWrap.appendChild(rxbOp('+'));
    slotsWrap.appendChild(rxbSlot(exp,idx));
  });
  eqRow.appendChild(slotsWrap);
  root.appendChild(eqRow);

  /* ── Tray ──────────────────────────────────────────────────── */
  var trayLabel=document.createElement('div');
  trayLabel.className='rxb-tray-label';
  trayLabel.innerHTML='<span style="color:var(--tx3);">Candidatos</span>'
    + '<span style="color:var(--bdr2);margin:0 .4rem;">—</span>'
    + '<span style="color:var(--tx3);font-size:.58rem;">arraste ou clique para o slot ↑</span>';
  root.appendChild(trayLabel);

  var tray=document.createElement('div');
  tray.className='rxb-tray'; tray.id='rxb-tray-'+exp.id;
  /* Candidatos: do experimento (inclui distratores) ou fallback */
  var candidatosList = exp.candidatos || CANDIDATOS[exp.id] || exp.produtos_visuais;
  candidatosList.forEach(function(f){
    tray.appendChild(rxbTrayMol(f,exp));
  });
  root.appendChild(tray);

  /* ── Painel estequiométrico ────────────────────────────────── */
  var stoich=document.createElement('div');
  stoich.className='rxb-stoich'; stoich.id='rxb-stoich-'+exp.id;
  stoich.innerHTML='<span class="rxb-stoich-hint">Preencha os slots de produto ↑</span>';
  root.appendChild(stoich);

  /* ── Botão verificar ────────────────────────────────────────── */
  var footer=document.createElement('div');
  footer.className='rxb-footer';
  var btnCheck=document.createElement('button');
  btnCheck.className='rxb-btn-check'; btnCheck.id='rxb-btn-check-'+exp.id;
  btnCheck.textContent='Verificar reação ↗';
  btnCheck.addEventListener('click',function(){ verificarBuilder(exp); });
  footer.appendChild(btnCheck);
  root.appendChild(footer);

  return root;
}

/* ── Reagente com spinner ───────────────────────────────────── */
function rxbReagente(r, exp){
  var wrap=document.createElement('div');
  wrap.className='rxb-reagente';

  var bubble=document.createElement('div');
  bubble.className='rxb-mol rxb-mol-reagente';
  var efr=estadoFisico(r);
  bubble.innerHTML='<div class="rxb-mol-formula">'+r+'<span class="rxb-mol-estado">'+efr+'</span></div>'+
    '<div class="rxb-mol-nome">'+(nomeMol(r)||'')+'</div>';

  var coefInicial = BUILDER.coefR[r] || 1;
  var sp=rxbSpinner(coefInicial,function(v){
    BUILDER.coefR[r]=v; atualizarStoich(exp);
  });

  wrap.appendChild(sp);
  wrap.appendChild(bubble);
  return wrap;
}

/* ── Slot de produto ─────────────────────────────────────────── */
function rxbSlot(exp, idx){
  var slot=document.createElement('div');
  slot.className='rxb-slot rxb-slot-empty';
  slot.id='rxb-slot-'+exp.id+'-'+idx;
  slot.dataset.idx=idx;

  var ph=document.createElement('div');
  ph.className='rxb-slot-ph';
  ph.innerHTML='<span class="rxb-slot-ph-icon">＋</span><span class="rxb-slot-ph-txt">produto '+(idx+1)+'</span>';
  slot.appendChild(ph);

  function bindSlot(){
    slot.addEventListener('dragover',function(e){
      e.preventDefault(); slot.classList.add('rxb-drag-over');
    });
    slot.addEventListener('dragleave',function(){
      slot.classList.remove('rxb-drag-over');
    });
    slot.addEventListener('drop',function(e){
      e.preventDefault(); slot.classList.remove('rxb-drag-over');
      var f=e.dataTransfer.getData('text/plain');
      if(f) colocarNoSlot(f,idx,exp);
    });
    slot.addEventListener('click',function(){
      if(BUILDER.selected){
        colocarNoSlot(BUILDER.selected,idx,exp);
        deselecionarTray(exp.id);
      }
    });
  }
  bindSlot();
  return slot;
}

/* ── Molécula no tray ───────────────────────────────────────── */
function rxbTrayMol(f, exp){
  var el=document.createElement('div');
  el.className='rxb-tray-mol';
  el.id='rxb-tray-mol-'+exp.id+'-'+sanitizeId(f);
  el.draggable=true;
  el.dataset.formula=f;
  var ef=estadoFisico(f);
  el.innerHTML='<div class="rxb-mol-formula">'+f+'<span class="rxb-mol-estado">'+ef+'</span></div>'+
    '<div class="rxb-mol-nome">'+(nomeMol(f)||'')+'</div>';

  el.addEventListener('dragstart',function(e){
    e.dataTransfer.setData('text/plain',f);
    el.classList.add('rxb-dragging');
  });
  el.addEventListener('dragend',function(){
    el.classList.remove('rxb-dragging');
  });
  el.addEventListener('click',function(){
    var jaSelected=el.classList.contains('rxb-selected');
    deselecionarTray(exp.id);
    if(!jaSelected){
      el.classList.add('rxb-selected');
      BUILDER.selected=f;
    }
  });
  return el;
}

/* ── Spinner genérico (−/valor/+) ───────────────────────────── */
function rxbSpinner(init, onChange){
  var val=init;
  var wrap=document.createElement('div');
  wrap.className='rxb-coef-wrap';

  var bm=document.createElement('button');
  bm.className='rxb-coef-btn'; bm.textContent='−'; bm.type='button';
  var cv=document.createElement('span');
  cv.className='rxb-coef-val'; cv.textContent=String(val);
  var bp=document.createElement('button');
  bp.className='rxb-coef-btn'; bp.textContent='+'; bp.type='button';

  bm.addEventListener('click',function(e){
    e.stopPropagation();
    if(val>1){ val--; cv.textContent=val; onChange(val); }
  });
  bp.addEventListener('click',function(e){
    e.stopPropagation();
    if(val<9){ val++; cv.textContent=val; onChange(val); }
  });

  wrap.appendChild(bm); wrap.appendChild(cv); wrap.appendChild(bp);
  /* expõe getter/setter para leitura externa */
  wrap._getVal=function(){ return val; };
  wrap._setVal=function(v){ val=v; cv.textContent=v; };
  return wrap;
}

/* ── Colocar no slot ─────────────────────────────────────────── */
function colocarNoSlot(f, idx, exp){
  BUILDER.slots[idx]=f;
  BUILDER.coefP[idx]=1;

  var slot=document.getElementById('rxb-slot-'+exp.id+'-'+idx);
  if(!slot) return;

  slot.className='rxb-slot rxb-slot-filled';
  slot.innerHTML='';

  /* Spinner do produto */
  var sp=rxbSpinner(1,function(v){
    BUILDER.coefP[idx]=v;
    atualizarStoich(exp);
  });
  sp.className+=' rxb-coef-slot';

  /* Molécula */
  var molDiv=document.createElement('div');
  molDiv.className='rxb-slot-mol';
  var efs=estadoFisico(f);
  molDiv.innerHTML='<div class="rxb-mol-formula">'+f+'<span class="rxb-mol-estado">'+efs+'</span></div>'+
    '<div class="rxb-mol-nome">'+(nomeMol(f)||'')+'</div>';

  /* Botão remover */
  var btnRem=document.createElement('button');
  btnRem.type='button'; btnRem.className='rxb-slot-remove';
  btnRem.innerHTML='&times;'; btnRem.title='Remover';
  btnRem.addEventListener('click',function(e){
    e.stopPropagation();
    removerDoSlot(idx,exp);
  });

  slot.appendChild(sp);
  slot.appendChild(molDiv);
  slot.appendChild(btnRem);

  atualizarStoich(exp);
}

/* ── Remover do slot ─────────────────────────────────────────── */
function removerDoSlot(idx, exp){
  BUILDER.slots[idx]=null;
  BUILDER.coefP[idx]=1;

  var slot=document.getElementById('rxb-slot-'+exp.id+'-'+idx);
  if(!slot) return;

  slot.className='rxb-slot rxb-slot-empty';
  slot.innerHTML='';
  var ph=document.createElement('div');
  ph.className='rxb-slot-ph';
  ph.innerHTML='<span class="rxb-slot-ph-icon">＋</span><span class="rxb-slot-ph-txt">produto '+(idx+1)+'</span>';
  slot.appendChild(ph);

  slot.addEventListener('dragover',function(e){ e.preventDefault(); slot.classList.add('rxb-drag-over'); });
  slot.addEventListener('dragleave',function(){ slot.classList.remove('rxb-drag-over'); });
  slot.addEventListener('drop',function(e){
    e.preventDefault(); slot.classList.remove('rxb-drag-over');
    var f=e.dataTransfer.getData('text/plain');
    if(f) colocarNoSlot(f,idx,exp);
  });
  slot.addEventListener('click',function(){
    if(BUILDER.selected){ colocarNoSlot(BUILDER.selected,idx,exp); deselecionarTray(exp.id); }
  });

  atualizarStoich(exp);
}

/* ── Desselecionar tray ──────────────────────────────────────── */
function deselecionarTray(expId){
  var tray=document.getElementById('rxb-tray-'+expId);
  if(tray) tray.querySelectorAll('.rxb-tray-mol').forEach(function(m){
    m.classList.remove('rxb-selected');
  });
  BUILDER.selected=null;
}

/* ── Estequiometria ──────────────────────────────────────────── */
function atualizarStoich(exp){

  /* ── Painel central: equação em andamento ── */
  var stoich = document.getElementById('rxb-stoich-'+exp.id);
  if(stoich){
    var todosOkLocal = BUILDER.slots.every(function(s){ return s!==null; });
    if(!todosOkLocal){
      stoich.innerHTML = '<span class="rxb-stoich-hint">Preencha os slots de produto ↑</span>';
    } else {
      var esqTxt = exp.reagentes.map(function(r){
        var c = BUILDER.coefR[r]||1;
        return (c>1 ? '<span class="rxb-stoich-coef">'+c+'</span> ' : '') + r;
      }).join(' + ');
      var dirTxt = BUILDER.slots.map(function(p,i){
        var c = BUILDER.coefP[i]||1;
        return (c>1 ? '<span class="rxb-stoich-coef">'+c+'</span> ' : '') + p;
      }).join(' + ');
      stoich.innerHTML =
        '<div class="rxb-stoich-eq">' +
          '<span class="rxb-stoich-mol">'+esqTxt+'</span>' +
          '<span class="rxb-stoich-arrow"> ⟶ </span>' +
          '<span class="rxb-stoich-mol">'+dirTxt+'</span>' +
        '</div>';
    }
  }

  /* ── Sidebar direita: painel analítico ── */
  var balEq   = document.getElementById('bal-equacao');
  var balGrid = document.getElementById('bal-grid');
  if(!balEq && !balGrid) return;

  var todosOk = BUILDER.slots.every(function(s){ return s!==null; });

  if(!todosOk){
    if(balEq)   balEq.innerHTML   = '<span class="bal-status-idle">⏳ Aguardando produtos…</span>';
    if(balGrid) balGrid.innerHTML = '<p class="bal-hint">Arraste compostos para os slots de produto para ver a análise em tempo real.</p>';
    return;
  }

  /* ── Contar átomos ── */
  var esqAt = somarAtomos(exp.reagentes.map(function(r){
    return escalarAtomos(parsearFormula(r), BUILDER.coefR[r]||1);
  }));
  var dirAt = somarAtomos(BUILDER.slots.map(function(p,i){
    return escalarAtomos(parsearFormula(p||''), BUILDER.coefP[i]||1);
  }));

  var els = {};
  Object.keys(esqAt).forEach(function(e){ els[e]=1; });
  Object.keys(dirAt).forEach(function(e){ els[e]=1; });
  var todosEls = Object.keys(els).sort();

  var okCount = todosEls.filter(function(el){
    return (esqAt[el]||0) === (dirAt[el]||0);
  }).length;
  var totalOk = okCount === todosEls.length;
  var pct = todosEls.length ? Math.round((okCount/todosEls.length)*100) : 0;

  /* ── Equação + barra de progresso global ── */
  if(balEq){
    var esqS = exp.reagentes.map(function(r){
      var c = BUILDER.coefR[r]||1; return (c>1?c+' ':'')+r;
    }).join(' + ');
    var dirS = BUILDER.slots.map(function(p,i){
      var c = BUILDER.coefP[i]||1; return (c>1?c+' ':'')+p;
    }).join(' + ');
    var barColor = totalOk ? 'var(--green)' : (pct>=50 ? 'var(--amber)' : 'var(--red,#f55)');
    balEq.innerHTML =
      '<div class="bal-eq-line">'+esqS+' ⟶ '+dirS+'</div>' +
      '<div class="bal-progress-wrap">' +
        '<div class="bal-progress-bar" style="width:'+pct+'%;background:'+barColor+';"></div>' +
      '</div>' +
      '<div class="bal-status-row">' +
        '<span class="'+(totalOk?'bal-status-ok':'bal-status-err')+'">' +
          (totalOk ? '✓ Perfeitamente balanceado' : '✗ '+okCount+'/'+todosEls.length+' elementos OK') +
        '</span>' +
        '<span class="bal-pct">'+(totalOk?'100':pct)+'%</span>' +
      '</div>';
  }

  /* ── Grid analítico por elemento ── */
  if(balGrid){
    balGrid.innerHTML = todosEls.map(function(el){
      var esq = esqAt[el]||0;
      var dir = dirAt[el]||0;
      var ok  = esq===dir;
      var max = Math.max(esq, dir, 1);
      var barEsqW = Math.round((esq/max)*100);
      var barDirW = Math.round((dir/max)*100);
      var diff = dir - esq;
      var rowCls = ok ? 'bal-row bal-row-ok' : (dir>esq ? 'bal-row bal-row-over' : 'bal-row bal-row-under');
      var badge = ok
        ? '<span class="bal-badge bal-badge-ok">✓</span>'
        : (diff>0
            ? '<span class="bal-badge bal-badge-over">+'+diff+'</span>'
            : '<span class="bal-badge bal-badge-under">'+diff+'</span>');

      return '<div class="'+rowCls+'">' +
        '<div class="bal-row-hd">' +
          '<span class="bal-el">'+el+'</span>' +
          '<div class="bal-counts">' +
            '<span class="bal-count bal-count-esq" title="Reagentes">'+esq+'</span>' +
            '<span class="bal-count-sep">⟶</span>' +
            '<span class="bal-count bal-count-dir'+(ok?' bal-count-ok':(dir>esq?' bal-count-over':' bal-count-under'))+'" title="Produtos">'+dir+'</span>' +
          '</div>' +
          badge +
        '</div>' +
        '<div class="bal-bars">' +
          '<div class="bal-bar-track" title="Reagentes: '+esq+'">' +
            '<div class="bal-bar-fill bal-bar-esq" style="width:'+barEsqW+'%"></div>' +
          '</div>' +
          '<div class="bal-bar-track" title="Produtos: '+dir+'">' +
            '<div class="bal-bar-fill '+(ok?'bal-bar-ok':(dir>esq?'bal-bar-over':'bal-bar-under'))+'" style="width:'+barDirW+'%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="bal-row-labels">' +
          '<span class="bal-lbl">Reagentes</span>' +
          '<span class="bal-lbl">Produtos</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }
}

function escalarAtomos(atoms, coef){
  var r={};
  Object.keys(atoms).forEach(function(el){ r[el]=atoms[el]*coef; });
  return r;
}
function somarAtomos(lista){
  var t={};
  lista.forEach(function(a){ Object.keys(a).forEach(function(el){ t[el]=(t[el]||0)+a[el]; }); });
  return t;
}

/* ── Verificar ───────────────────────────────────────────────── */
function verificarBuilder(exp){
  if(!BUILDER.slots.every(function(s){ return s!==null; })){
    shake('rxb-root-'+exp.id);
    showToast('err','Preencha todos os slots primeiro.');
    return;
  }

  /* Verificar se os produtos estão corretos (sem importar ordem) */
  /* Usar gabarito.produtos (textos normalizados) OU produtos_visuais (fórmulas) */
  var gabProdutos = (exp.gabarito && exp.gabarito.produtos) ? exp.gabarito.produtos : [];
  var corretos = exp.produtos_visuais.every(function(pC){
    var normC = normFormula(pC).toLowerCase().replace(/[^a-z0-9]/g,'');
    return BUILDER.slots.some(function(pS){
      if(!pS) return false;
      var normS = normFormula(pS).toLowerCase().replace(/[^a-z0-9]/g,'');
      /* Verificar por fórmula */
      if(normS === normC) return true;
      /* Verificar por nome no gabarito */
      return gabProdutos.some(function(gp){
        return normTxt(pS).includes(normTxt(gp)) || normTxt(gp).includes(normTxt(pS));
      });
    });
  });

  /* Verificar balanceamento usando parser universal */
  var esqAt=somarAtomos(exp.reagentes.map(function(r){
    return escalarAtomos(parsearFormula(r), BUILDER.coefR[r]||1);
  }));
  var dirAt=somarAtomos(BUILDER.slots.map(function(p,i){
    return escalarAtomos(parsearFormula(p||''), BUILDER.coefP[i]||1);
  }));
  var els={}; Object.keys(esqAt).forEach(function(e){els[e]=1;});
  Object.keys(dirAt).forEach(function(e){els[e]=1;});
  var balanceado=Object.keys(els).every(function(el){
    return (esqAt[el]||0)===(dirAt[el]||0);
  });

  if(corretos && balanceado){
    /* ✓ Tudo certo */
    BUILDER.slots.forEach(function(_,i){
      var sl=document.getElementById('rxb-slot-'+exp.id+'-'+i);
      if(sl) sl.classList.add('rxb-slot-correct');
    });
    var root=document.getElementById('rxb-root-'+exp.id);
    if(root) root.classList.add('rxb-acertou');
    var btn=document.getElementById('rxb-btn-check-'+exp.id);
    if(btn){ btn.disabled=true; btn.textContent='✓ Correto!'; }
    setTimeout(acertou,500);

  } else if(corretos && !balanceado){
    shake('rxb-root-'+exp.id);
    showToast('hint','Produtos ✓ — ajuste os coeficientes até o painel ficar todo verde.');

  } else {
    shake('rxb-root-'+exp.id);
    /* Marcar slots errados brevemente */
    BUILDER.slots.forEach(function(p,i){
      if(!p) return;
      var ok=exp.produtos_visuais.some(function(pC){
        return normFormula(p)===normFormula(pC);
      });
      var sl=document.getElementById('rxb-slot-'+exp.id+'-'+i);
      if(sl){ sl.classList.add('rxb-slot-wrong'); setTimeout(function(){ sl.classList.remove('rxb-slot-wrong'); },700); }
    });
    var hint=exp.hints[Math.min(STATE.hintIdx,exp.hints.length-1)];
    showToast('err', hint);
    STATE.hintIdx=Math.min(STATE.hintIdx+1,exp.hints.length-1);
  }
}

/* ── Tela de acerto — grande, substitui o builder ───────────── */
function revelarProdutos(expId){
  var exp=EXPERIMENTOS.filter(function(e){ return e.id===expId; })[0];
  if(!exp) return;
  var rxnWrap=document.getElementById('rxn-wrapper');
  if(!rxnWrap) return;

  /* Construir equação colorida: reagentes (cinza) → seta (coral) → produtos (verde) */
  var eq = exp.gabarito.equacaoBalanceada;
  var partes = eq.split(/→|⟶/);
  var esqHtml = '<span class="rxb-eq-reagente">'+(partes[0]||'').trim()+'</span>';
  var dirHtml  = '<span class="rxb-eq-produto">'+ (partes[1]||'').trim()+'</span>';
  var eqHtml   = esqHtml+'<span class="rxb-eq-seta">→</span>'+dirHtml;

  var screen=document.createElement('div');
  screen.className='rxb-acerto-screen';
  screen.id='rxb-acerto-'+expId;
  screen.innerHTML=
    '<div class="rxb-acerto-icon">✓</div>'+
    '<div class="rxb-acerto-eq-wrap">'+
      '<div class="rxb-acerto-label">Equação Balanceada</div>'+
      '<div class="rxb-acerto-eq">'+eqHtml+'</div>'+
    '</div>'+
    '<div class="rxb-acerto-mecanismo">'+escapeHtml(exp.explicacao)+'</div>'+
    '<div class="rxb-acerto-actions">' +
      '<button class="rxb-acerto-btn-next" onclick="' +
        'var f=(STATE.expAtual&&STATE.expAtual._formulaId)||STATE.compostoAtual;' +
        'var c=COMPOSTOS[f];if(c)abrirReacoesLivres(f,c);else mostrarBoasVindas()' +
      '">← Explorar mais reações</button>' +
    '</div>';

  rxnWrap.innerHTML='';
  rxnWrap.appendChild(screen);

  /* Partículas de confetti */
  lancarParticulas(rxnWrap);
}

function escapeHtml(t){
  return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function lancarParticulas(container){
  var cores=['#FF6B47','#4ADE80','#FFAA44','#00C8FF','#A78BFA'];
  for(var i=0;i<18;i++){
    (function(i){
      setTimeout(function(){
        var p=document.createElement('div');
        p.className='rxb-particle';
        p.style.cssText='left:'+(15+Math.random()*70)+'%;top:'+(60+Math.random()*20)+'%;'+
          'background:'+cores[i%cores.length]+';'+
          'animation-delay:'+Math.random()*.3+'s;'+
          'animation-duration:'+(0.6+Math.random()*.5)+'s;';
        container.appendChild(p);
        setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p); }, 1200);
      }, i*50);
    })(i);
  }
}

/* iniciarExp removida — laboratório em modo livre */

/* ── Utilitários ────────────────────────────────────────────── */
function shake(id){
  var el=document.getElementById(id); if(!el) return;
  el.classList.add('rxb-shake');
  setTimeout(function(){ el.classList.remove('rxb-shake'); },500);
}
function sanitizeId(s){ return s.replace(/[^a-zA-Z0-9]/g,'_'); }
function rxbOp(char){
  var s=document.createElement('span');
  s.className='rxb-op'; s.textContent=char; return s;
}


/* enviarResposta/analisarResposta removidos — builder é o único canal de input */

/* ── Acertou ───────────────────────────────────────────────── */
function acertou(){
  var exp=STATE.expAtual; if(!exp) return;
  STATE.aguardandoResposta=false;
  if(STATE.expConcluidos.indexOf(exp.id)===-1) STATE.expConcluidos.push(exp.id);

  /* partículas integradas na tela de acerto */

  revelarProdutos(exp.id);
  /* Toast 1 linha com o mecanismo */
  showToast('ok', exp.explicacao || '✓ Correto!');
  srAnnounce('Correto!', 'assertive');

  /* Após acerto: sempre voltar ao seletor do composto */
  setTimeout(function(){
    var formulaId = (exp._formulaId) || STATE.compostoAtual;
    var comp = COMPOSTOS[formulaId];
    if(comp) abrirReacoesLivres(formulaId, comp);
    else mostrarBoasVindas();
  }, 2500);
}

/* mostrarConclusao removida — modo livre */

/* darDica removida — modo livre */

/* pularExp removida — modo livre sem pular */

/* ── Reiniciar ─────────────────────────────────────────────── */
function reiniciar(){
  STATE.expAtual=null; STATE.hintIdx=0; STATE.dicasUsadas=0;
  STATE.expConcluidos=[]; STATE.aguardandoResposta=false;
  var chat=$('sim-chat'); if(chat) chat.innerHTML='';

  mostrarBoasVindas();
}

/* ════════════════════════════════════════════════════════════════
   14. BOOTSTRAP
════════════════════════════════════════════════════════════════ */
window.reiniciar = reiniciar;
window.siqi_sim = {
  reiniciar: reiniciar,
  explorar: function(){ addMsg('sistema','🔬 Use a busca ou as abas na **barra lateral esquerda** para explorar compostos!'); }
};

/* ════════════════════════════════════════════════════════════════
   7. MÓDULOS (Nomenclatura | Classificação | Redox)
      Plano de Ação SIQI Modular (2026)
   ────────────────────────────────────────────────────────────────
   A sidebar esquerda passa a ter um seletor de MÓDULO no topo,
   seguindo o mesmo padrão de organização usado no SIMA (barra
   lateral dedicada à escolha do que está ativo no centro/lateral).
   Aqui os 3 módulos moram todos na sidebar-left: o painel
   "Biblioteca" (Módulo 1, já existente) e dois painéis novos que
   ficam ocultos (`hidden`) até o botão do módulo correspondente
   ser clicado.

   Reaproveita integralmente o que já existe neste arquivo, em vez
   de duplicar:
     · $() , srAnnounce() , sub2()   — utilidades da seção 4
     · .panel[data-open] + initPaineis() — accordion de abrir/fechar
       (os painéis dos módulos 2 e 3 usam a MESMA marcação .panel >
       .panel-header + .panel-body, então herdam o abrir/fechar de
       graça, sem código extra aqui)
     · CATALOGO_SIQI, CLASSIFICACOES, REACOES_REDOX — dados vindos
       de dadossiqi.js

   Acessibilidade (WCAG 2.1 AA), no mesmo padrão já usado em
   .mol-cat-tabs/.mol-cat-btn (abas Ácidos/Bases/Sais/Óxidos) e em
   #sub-list (role="listbox"):
     · Seletor de módulo / eixo / dificuldade → role="tablist"/"tab"
       + aria-selected
     · Listas de compostos/reações filtrados  → role="listbox"/"option"
     · Mudanças de estado anunciadas via srAnnounce()

   BNCC: Habilidades EF09CI05 (Módulo 3 — estequiometria/balanço de
   elétrons) e EF09CI07 (Módulo 2 — propriedades e classificação de
   substâncias).
════════════════════════════════════════════════════════════════ */

/* ── 7.1 Gerenciador de módulos (troca de aba) ─────────────────── */
var MODULOS = {
  nomenclatura:  { label: 'Nomenclatura',  descricaoAnuncio: 'Biblioteca de compostos e nomenclatura IUPAC.' },
  construtor:    { label: 'Construtor',    descricaoAnuncio: 'Monte nomes IUPAC de compostos de coordenação com blocos.' },
  redox:         { label: 'Redox',         descricaoAnuncio: 'Analise estados de oxidação e balanceie reações redox.' },
};
var _moduloAtual = null;

/* Igual ao SIMA (clique no [data-model] já ativo desativa e limpa o
   canvas): clicar no módulo já ativo o desliga. Quando nenhum módulo
   está ativo, a regra CSS :has() (stylesiqi.css) para de esconder os
   outros cards, e os 3 reaparecem sozinhos — sem estado extra pra
   sincronizar aqui. */
function alternarModulo(nome){
  if(_moduloAtual === nome){ desativarModulo(); return; }
  trocarModulo(nome);
}

/* Painéis que somem quando um módulo específico está ativo (ex.:
   Balanço Atômico/Dados & Estrutura/Verificar-Reiniciar não fazem
   sentido dentro do Construtor — "todos os outros menus precisam
   estar ocultos", pedido do usuário). Lista de módulos em
   data-hide-for-module é separada por vírgula, ex.: "construtor" ou
   "construtor,redox" se um dia precisar esconder de mais de um. */
function _aplicarHideForModule(moduloAtivo){
  document.querySelectorAll('[data-hide-for-module]').forEach(function(el){
    var lista = el.dataset.hideForModule.split(',').map(function(s){ return s.trim(); });
    el.hidden = moduloAtivo !== null && lista.indexOf(moduloAtivo) !== -1;
  });
}

function desativarModulo(){
  var meta = MODULOS[_moduloAtual];
  document.querySelectorAll('[data-module]').forEach(function(btn){
    btn.setAttribute('aria-pressed','false');
  });
  document.querySelectorAll('[data-module-content]').forEach(function(el){
    el.hidden = true;
  });
  _moduloAtual = null;
  _aplicarHideForModule(null);
  /* Área central volta ao estado "nenhum módulo" — réplica exata do
     clearModel() do SIMA (canvas em branco + dica), ver setView('none')
     em initViewToggle(). */
  if(window._setView) window._setView('none');
  if(meta) srAnnounce('Módulo ' + meta.label + ' desativado. Escolha um módulo para continuar.');
  window.dispatchEvent(new CustomEvent('siqi:module-switch', { detail:{ module: null } }));
}

function trocarModulo(nome){
  var meta = MODULOS[nome];
  if(!meta){ console.warn('[modulos] modulo desconhecido:', nome); return; }
  if(nome === _moduloAtual) return;

  /* Igual ao SIMA (mode-activate-btn): só alternamos aria-pressed.
     O selo "Ativo" no cabeçalho, o sufixo "✓ ativo" no botão E o
     ocultar dos outros cards são 100% CSS, via
     :has(.mode-activate-btn[aria-pressed="true"]) — ver stylesiqi.css,
     bloco "MÓDULOS (estilo SIMA)". */
  document.querySelectorAll('[data-module]').forEach(function(btn){
    var ativo = btn.dataset.module === nome;
    btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
  });
  document.querySelectorAll('[data-module-content]').forEach(function(el){
    el.hidden = el.dataset.moduleContent !== nome;
  });
  _aplicarHideForModule(nome);

  _moduloAtual = nome;
  srAnnounce('Módulo ' + meta.label + ' ativado. ' + meta.descricaoAnuncio);

  /* Área central "gera" o conteúdo do módulo ativo (mesmo padrão do
     SIMA: canvas mostra o modelo selecionado). Redox e Construtor têm
     suas próprias views centrais; ao entrar em Nomenclatura vindo de
     "nenhum módulo" ou de outro módulo, volta pra Ficha (se já há
     composto carregado) ou Lab — nunca fica preso na dica "escolha um
     módulo" ou no conteúdo do módulo anterior. */
  if(window._setView){
    if(nome === 'redox'){
      window._setView('redox');
    } else if(nome === 'construtor'){
      window._setView('construtor');
    } else if(STATE.modoView === 'redox' || STATE.modoView === 'construtor' || STATE.modoView === 'none'){
      window._setView(STATE.compostoAtual ? 'info' : 'lab');
    }
  }

  window.dispatchEvent(new CustomEvent('siqi:module-switch', { detail:{ module: nome } }));
}

function initModulos(){
  document.querySelectorAll('[data-module]').forEach(function(btn){
    var nome = btn.dataset.module;
    btn.addEventListener('click', function(){ alternarModulo(nome); });
  });
  /* Estado inicial: nenhum módulo ativo (réplica do this.model=null do
     SIMA) — todo painel de conteúdo começa oculto, nenhum botão com
     aria-pressed=true. A view central "none" já é a padrão no HTML
     (ver panel-none em indexsiqi.html), sem precisar de setView() aqui. */
  document.querySelectorAll('[data-module-content]').forEach(function(el){
    el.hidden = true;
  });
  _aplicarHideForModule(null);
}

/* ── 7.2 Módulo 2 — Construtor de Nomenclatura ─────────────────────
   Química de coordenação: o aluno monta o nome IUPAC clicando em
   blocos (prefixo multiplicador → ligante(s) → metal → NOX → "de" →
   cátion externo, quando existir) — mesma ideia de peças que se
   encaixam descrita no pedido do usuário. A "bancada de montagem"
   (paleta de blocos + sequência + fórmula preliminar) vive na ÁREA
   CENTRAL (#panel-construtor); a barra lateral direita traz o
   seletor de tipo, a lista de desafios, o guia de regras ativas e o
   validador de sintaxe — mesmo padrão de 3 camadas do Módulo 3.

   Dados: LIGANTES, METAIS_COMPLEXOS, PREFIXOS_MULT, DESAFIOS_CONSTRUTOR,
   REGRAS_IUPAC (dadossiqi.js). ────────────────────────────────────── */

var _mod2Busca = '';
var _mod2TipoAtual = 'todos';
var _mod2DesafioAtual = null;
var _mod2Slots = [];           /* array de {texto,tipo}|null, uma posição por slot do gabarito */
var _mod2Selecionado = null;   /* bloco selecionado na paleta (clique-para-colocar) */
var _mod2Resolvidos = {};      /* {desafioId: true} — marcados ✓ na Biblioteca após acerto */
var _mod2Iniciado = false;

var MOD2_TIPO_ABA_LABEL = {
  todos: 'Todos', sal: 'Sal', acido: 'Ácido', base: 'Base', oxido: 'Óxido',
  cation_complexo: 'Cátion', anion_complexo: 'Ânion', neutro: 'Neutro',
};

/* ── 7.2a Biblioteca — mesmo padrão do Módulo 1 (busca + abas +
   lista), só que a fonte é DESAFIOS_CONSTRUTOR em vez do catálogo
   geral, e cada item mostra SÓ A FÓRMULA — o nome IUPAC nunca aparece
   aqui, de propósito, pra não entregar a resposta antes da hora. ── */
function mod2MontarBiblioteca(){
  var badge = $('construtor-badge-total');
  if(badge) badge.textContent = DESAFIOS_CONSTRUTOR.length;

  var tabsWrap = $('construtor-tipo-tabs');
  if(tabsWrap){
    tabsWrap.innerHTML = '';
    tabsWrap.setAttribute('role', 'tablist');
    Object.keys(MOD2_TIPO_ABA_LABEL).forEach(function(tipo){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mol-cat-btn' + (tipo === _mod2TipoAtual ? ' active-cat' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', tipo === _mod2TipoAtual ? 'true' : 'false');
      btn.textContent = MOD2_TIPO_ABA_LABEL[tipo];
      btn.addEventListener('click', function(){
        _mod2TipoAtual = tipo;
        document.querySelectorAll('#construtor-tipo-tabs .mol-cat-btn').forEach(function(b){
          b.classList.remove('active-cat'); b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active-cat'); btn.setAttribute('aria-selected', 'true');
        mod2RenderBiblioteca();
      });
      tabsWrap.appendChild(btn);
    });
  }

  var busca = $('construtor-search');
  if(busca){
    busca.addEventListener('input', function(){
      _mod2Busca = busca.value.trim().toLowerCase();
      mod2RenderBiblioteca();
    });
  }

  mod2RenderBiblioteca();
}

function mod2RenderBiblioteca(){
  var lista = $('construtor-lista');
  if(!lista) return;

  var itens = DESAFIOS_CONSTRUTOR.filter(function(d){
    var passaTipo = _mod2TipoAtual === 'todos' || d.tipo === _mod2TipoAtual;
    var passaBusca = !_mod2Busca || d.formula.toLowerCase().indexOf(_mod2Busca) !== -1;
    return passaTipo && passaBusca;
  });

  lista.innerHTML = '';
  lista.setAttribute('role', 'listbox');
  lista.setAttribute('aria-label', 'Compostos disponíveis para montar');

  if(itens.length === 0){
    var vazio = document.createElement('li');
    vazio.className = 'no-results';
    vazio.textContent = 'Nenhum composto encontrado.';
    lista.appendChild(vazio);
    return;
  }

  itens.forEach(function(d){
    var li = document.createElement('li');
    li.className = 'sub-item construtor-lib-item';
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-selected', _mod2DesafioAtual && _mod2DesafioAtual.id === d.id ? 'true' : 'false');
    var resolvido = !!_mod2Resolvidos[d.id];
    li.innerHTML =
      '<span class="construtor-lib-formula">' + d.formula + '</span>' +
      '<span class="construtor-lib-badge' + (resolvido ? ' construtor-lib-badge--ok' : '') + '">' +
        (resolvido ? '✓ resolvido' : MOD2_TIPO_ABA_LABEL[d.tipo]) +
      '</span>';
    function selecionar(){
      lista.querySelectorAll('.construtor-lib-item').forEach(function(el){ el.setAttribute('aria-selected', 'false'); });
      li.setAttribute('aria-selected', 'true');
      mod2SelecionaDesafio(d);
    }
    li.addEventListener('click', selecionar);
    li.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selecionar(); }
    });
    lista.appendChild(li);
  });
}

/* ── 7.2b Informações do Composto — ficha "cega": fórmula + tabela de
   composição química BRUTA (espécie/papel/quantidade/carga), o
   suficiente pro aluno raciocinar sobre NOX/prefixos/sufixos sozinho.
   NUNCA usa desafio.titulo/nome_correto aqui. ─────────────────────── */
function mod2AtualizarInfoComposto(desafio){
  var div = $('construtor-info-content');
  if(!div) return;

  var linhas = (desafio.composicao || []).map(function(c){
    return '<tr><td>' + c.especie + '</td><td>' + c.papel + '</td><td>' + c.quantidade + '</td><td>' + c.carga + '</td></tr>';
  }).join('');

  div.innerHTML =
    '<p class="construtor-info-formula"><code>' + desafio.formula + '</code></p>' +
    '<table class="construtor-info-table">' +
      '<thead><tr><th>Espécie</th><th>Papel</th><th>Qtd.</th><th>Carga</th></tr></thead>' +
      '<tbody>' + linhas + '</tbody>' +
    '</table>' +
    '<p class="construtor-info-nota">' + desafio.descricao + '</p>';
}

function mod2SelecionaDesafio(desafio){
  _mod2DesafioAtual = desafio;
  _mod2Slots = [];
  _mod2Selecionado = null;
  if(window._setView) window._setView('construtor');
  mod2MontarBancada(desafio);
  mod2AtualizarInfoComposto(desafio);
  mod2AtualizarRegras(desafio);
  mod2AtualizarValidador();
  /* Anúncio usa a FÓRMULA, nunca desafio.titulo — não revelar o nome
     nem no leitor de tela. */
  srAnnounce('Composto ' + desafio.formula + ' selecionado. Monte o nome arrastando os blocos até os slots certos, ou clicando num bloco e depois no slot.');
}

/* ── 7.2c Bancada de montagem (área central) ───────────────────────
   Hero NUNCA usa desafio.titulo (revelava a resposta) — só fórmula +
   tipo/nível, que são dados de entrada legítimos, não a resposta. */
function mod2SeedDeString(str){
  var h = 0;
  for(var i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return h || 1;
}

/* Fisher-Yates com seed determinístico (mesmo desafio.id sempre
   embaralha igual, pra não reordenar sozinho a cada re-render — mas
   embaralha DE VERDADE). A tentativa anterior — ordenar por
   `(i*2654435761) % 97` — parecia aleatória, mas pra conjuntos
   pequenos (até 9 blocos) essa conta é estritamente crescente em i
   (0,12,24,36...): na prática NÃO embaralhava nada, e "hexa"+"ciano"+
   "ferrato" saíam adjacentes e na ordem certa — quase entregando a
   resposta. Confirmado calculando a sequência antes de trocar. */
function mod2TemParAdjacenteCorreto(itens, corretos){
  /* Varre a paleta já embaralhada procurando 2 blocos vizinhos que
     também sejam vizinhos, NA MESMA ORDEM, no gabarito — sinal de
     que a resposta está "legível" ali por acidente do embaralhamento
     (Fisher-Yates é correto em média, mas para 9 itens o seed de um
     desafio específico pode, por sorte, deixar isso acontecer). */
  for(var p = 0; p < itens.length - 1; p++){
    for(var c = 0; c < corretos.length - 1; c++){
      if(itens[p].texto === corretos[c].texto && itens[p+1].texto === corretos[c+1].texto){
        return p;
      }
    }
  }
  return -1;
}

function mod2PaletaEmbaralhada(desafio){
  var itens = desafio.blocos_corretos.concat(desafio.distratores).slice();
  var seed = mod2SeedDeString(desafio.id);
  function rand(){
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  for(var i = itens.length - 1; i > 0; i--){
    var j = Math.floor(rand() * (i + 1));
    var tmp = itens[i]; itens[i] = itens[j]; itens[j] = tmp;
  }

  /* Garantia extra, determinística: continua trocando o item ofensor
     de lugar até nenhum par adjacente da paleta reproduzir a ordem
     do gabarito — não depende só da sorte do embaralhamento acima. */
  var pos, tentativas = 0;
  while((pos = mod2TemParAdjacenteCorreto(itens, desafio.blocos_corretos)) !== -1 && tentativas < 30){
    var outro = Math.floor(rand() * itens.length);
    var tmp2 = itens[pos]; itens[pos] = itens[outro]; itens[outro] = tmp2;
    tentativas++;
  }
  return itens;
}

/* Rótulo mostrado no placeholder de cada slot vazio — indica o TIPO
   gramatical esperado naquela posição (não a resposta em si), igual
   ao "produto 1"/"produto 2" do Laboratório, só que tipado por
   categoria em vez de numerado. */
var MOD2_TIPO_LABEL = {
  mult: 'prefixo', ligante: 'ligante', metal: 'metal', nox: 'NOx',
  conectivo: 'conectivo', ion: 'cátion/ânion', radical: 'radical',
  sufixo: 'sufixo', fixo: 'palavra',
};

function mod2MontarBancada(desafio){
  _mod2Slots = desafio.blocos_corretos.map(function(){ return null; });
  _mod2Selecionado = null;

  var central = $('construtor-central-content');
  if(!central) return;

  var paleta = mod2PaletaEmbaralhada(desafio);

  central.innerHTML =
    '<div class="construtor-hero">'+
      '<p class="construtor-hero-label">'+desafio.nivel+' · '+desafio.tipo.replace('_',' ')+'</p>'+
      '<h2 class="construtor-hero-title">Monte o nome IUPAC deste composto</h2>'+
      '<code class="construtor-hero-formula">'+desafio.formula+'</code>'+
    '</div>'+
    '<div class="construtor-slots-wrap" id="construtor-slots" role="list" aria-label="Posições do nome a preencher"></div>'+
    '<div class="construtor-formula-preview" id="construtor-formula-preview"></div>'+
    '<p class="construtor-paleta-label">Blocos disponíveis — arraste até um slot, ou clique no bloco e depois no slot</p>'+
    '<div class="construtor-paleta" id="construtor-paleta" role="group" aria-label="Blocos disponíveis"></div>'+
    '<div class="construtor-acoes">'+
      '<button type="button" class="construtor-btn-limpar" id="construtor-btn-limpar">↺ Limpar montagem</button>'+
    '</div>';

  var slotsWrap = $('construtor-slots');
  desafio.blocos_corretos.forEach(function(_, idx){
    slotsWrap.appendChild(mod2CriarSlot(desafio, idx));
  });

  var paletaDiv = $('construtor-paleta');
  paleta.forEach(function(bloco){
    paletaDiv.appendChild(mod2CriarBlocoPaleta(bloco));
  });

  var btnLimpar = $('construtor-btn-limpar');
  if(btnLimpar) btnLimpar.addEventListener('click', function(){ mod2LimparSlots(desafio); });

  mod2RenderFormulaPreliminar();
}

/* ── Slot vazio: aceita arraste (dragover/dragleave/drop) E clique
   (se já houver um bloco selecionado na paleta) — mesmo padrão de
   dupla via de interação do rxbSlot() no Laboratório, garantindo que
   quem não consegue arrastar (teclado, leitor de tela, mobile sem
   suporte a drag) ainda consiga montar o nome. ────────────────── */
function mod2CriarSlot(desafio, idx){
  var slot = document.createElement('div');
  slot.className = 'construtor-slot construtor-slot--vazio';
  slot.id = 'construtor-slot-' + idx;
  slot.dataset.idx = idx;
  slot.setAttribute('role', 'listitem');
  mod2PreencherPlaceholderSlot(slot, desafio, idx);
  mod2BindSlotVazio(slot, desafio, idx);
  return slot;
}

function mod2PreencherPlaceholderSlot(slot, desafio, idx){
  var tipoEsperado = desafio.blocos_corretos[idx].tipo;
  var label = MOD2_TIPO_LABEL[tipoEsperado] || 'bloco';
  slot.innerHTML =
    '<span class="construtor-slot-ph-icon" aria-hidden="true">＋</span>'+
    '<span class="construtor-slot-ph-txt">'+label+'</span>';
}

function mod2BindSlotVazio(slot, desafio, idx){
  slot.addEventListener('dragover', function(e){
    e.preventDefault(); slot.classList.add('construtor-drag-over');
  });
  slot.addEventListener('dragleave', function(){
    slot.classList.remove('construtor-drag-over');
  });
  slot.addEventListener('drop', function(e){
    e.preventDefault(); slot.classList.remove('construtor-drag-over');
    var raw = e.dataTransfer.getData('text/plain');
    if(!raw) return;
    try { mod2ColocarNoSlot(JSON.parse(raw), idx, desafio); } catch(err){ /* payload inválido, ignora */ }
  });
  slot.addEventListener('click', function(){
    if(_mod2Selecionado){
      mod2ColocarNoSlot(_mod2Selecionado, idx, desafio);
      mod2DeselecionarPaleta();
    }
  });
}

/* ── Bloco na paleta: arrastável (dragstart carrega {texto,tipo} via
   dataTransfer) e clicável (seleciona/desseleciona, replicando
   rxbTrayMol()). Também navegável via teclado (Enter/Espaço). ──── */
function mod2CriarBlocoPaleta(bloco){
  var el = document.createElement('div');
  el.className = 'construtor-bloco construtor-bloco--' + bloco.tipo;
  el.textContent = bloco.texto;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('title', 'Arraste até um slot, ou clique e depois clique no slot certo');
  el.draggable = true;

  el.addEventListener('dragstart', function(e){
    e.dataTransfer.setData('text/plain', JSON.stringify(bloco));
    el.classList.add('construtor-bloco--arrastando');
  });
  el.addEventListener('dragend', function(){
    el.classList.remove('construtor-bloco--arrastando');
  });

  function selecionar(){
    var jaSelecionado = el.classList.contains('construtor-bloco--selecionado');
    mod2DeselecionarPaleta();
    if(!jaSelecionado){
      el.classList.add('construtor-bloco--selecionado');
      _mod2Selecionado = bloco;
    }
  }
  el.addEventListener('click', selecionar);
  el.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selecionar(); }
  });

  return el;
}

function mod2DeselecionarPaleta(){
  var paleta = $('construtor-paleta');
  if(paleta){
    paleta.querySelectorAll('.construtor-bloco--selecionado').forEach(function(b){
      b.classList.remove('construtor-bloco--selecionado');
    });
  }
  _mod2Selecionado = null;
}

/* ── Colocar/remover do slot — feedback IMEDIATO (correto/errado). */
function mod2ColocarNoSlot(bloco, idx, desafio){
  _mod2Slots[idx] = bloco;

  var slot = $('construtor-slot-' + idx);
  if(!slot) return;

  var correto = desafio.blocos_corretos[idx].texto === bloco.texto;

  slot.className = 'construtor-slot construtor-slot--preenchido construtor-bloco--' + bloco.tipo +
    (correto ? ' construtor-slot--correto' : ' construtor-slot--errado');
  slot.innerHTML =
    '<span class="construtor-slot-texto">' + bloco.texto + '</span>' +
    '<button type="button" class="construtor-slot-remover" title="Remover bloco" aria-label="Remover bloco ' + bloco.texto + '">&times;</button>';

  var btnRem = slot.querySelector('.construtor-slot-remover');
  btnRem.addEventListener('click', function(e){
    e.stopPropagation();
    mod2RemoverDoSlot(idx, desafio);
  });

  mod2RenderFormulaPreliminar();
  mod2AtualizarValidador();
}

function mod2RemoverDoSlot(idx, desafio){
  _mod2Slots[idx] = null;

  var slot = $('construtor-slot-' + idx);
  if(!slot) return;

  slot.className = 'construtor-slot construtor-slot--vazio';
  mod2PreencherPlaceholderSlot(slot, desafio, idx);
  mod2BindSlotVazio(slot, desafio, idx);

  mod2RenderFormulaPreliminar();
  mod2AtualizarValidador();
}

function mod2LimparSlots(desafio){
  desafio.blocos_corretos.forEach(function(_, idx){
    if(_mod2Slots[idx] !== null) mod2RemoverDoSlot(idx, desafio);
  });
  mod2DeselecionarPaleta();
  srAnnounce('Montagem limpa. Comece de novo.');
}

/* Fórmula-alvo revelada progressivamente, proporcional aos slots
   preenchidos CORRETAMENTE. */
function mod2RenderFormulaPreliminar(){
  var div = $('construtor-formula-preview');
  if(!div || !_mod2DesafioAtual) return;
  var corretos = _mod2DesafioAtual.blocos_corretos;
  var acertos = _mod2Slots.filter(function(b, i){ return b && corretos[i].texto === b.texto; }).length;
  var fracao = corretos.length ? acertos / corretos.length : 0;
  var alvo = _mod2DesafioAtual.formula;
  var visiveis = Math.round(alvo.length * fracao);
  var revelado = alvo.slice(0, visiveis);
  var oculto = alvo.slice(visiveis).replace(/[^\s]/g, '▢');

  div.innerHTML =
    '<p class="construtor-formula-preview-label">Fórmula preliminar</p>'+
    '<code class="construtor-formula-preview-valor">'+
      '<span class="revelado">'+revelado+'</span>'+
      '<span class="oculto">'+oculto+'</span>'+
    '</code>';
}

function mod2AtualizarRegras(desafio){
  var div = $('construtor-regras');
  if(!div) return;
  div.innerHTML = '';
  (desafio.regras_ativas || []).forEach(function(chave){
    var regra = REGRAS_IUPAC[chave];
    if(!regra) return;
    var card = document.createElement('div');
    card.className = 'construtor-regra-card';
    card.innerHTML = '<p class="construtor-regra-titulo">'+regra.titulo+'</p><p class="construtor-regra-texto">'+regra.texto+'</p>';
    div.appendChild(card);
  });
}

function mod2AtualizarValidador(){
  var div = $('construtor-validador');
  if(!div || !_mod2DesafioAtual) return;
  var corretos = _mod2DesafioAtual.blocos_corretos;
  var preenchidos = _mod2Slots.filter(function(b){ return b !== null; }).length;
  var acertos = _mod2Slots.filter(function(b, i){ return b && corretos[i].texto === b.texto; }).length;
  var errados = preenchidos - acertos;

  var estado, mensagem;
  if(preenchidos === 0){
    estado = 'vazio';
    mensagem = 'Arraste ou clique nos blocos para preencher os slots na área central.';
  } else if(errados > 0){
    estado = 'incorreto';
    mensagem = errados + ' bloco(s) no slot errado (marcado em vermelho). Confira o tipo indicado em cada posição.';
  } else if(preenchidos < corretos.length){
    estado = 'incompleto';
    mensagem = 'Até aqui está correto! Faltam ' + (corretos.length - preenchidos) + ' slot(s).';
  } else {
    estado = 'correto';
    /* SÓ AQUI, depois de resolvido de verdade, é que o nome completo
       aparece — recompensa final, não dica antecipada. */
    mensagem = '✓ Nome completo e correto: "' + _mod2DesafioAtual.nome_correto + '"';
  }

  div.className = 'construtor-validador construtor-validador--' + estado;
  div.innerHTML = '<p class="construtor-validador-texto">' + mensagem + '</p>';

  if(estado === 'correto'){
    if(!_mod2Resolvidos[_mod2DesafioAtual.id]){
      _mod2Resolvidos[_mod2DesafioAtual.id] = true;
      mod2RenderBiblioteca(); // atualiza o selo "✓ resolvido" na lista
    }
    srAnnounce('Parabéns! Nome montado corretamente: ' + _mod2DesafioAtual.nome_correto);
  }
}

function initModulo2(){
  if(_mod2Iniciado) return;
  if(typeof DESAFIOS_CONSTRUTOR === 'undefined'){
    console.error('[modulo2] DESAFIOS_CONSTRUTOR não definido — verifique dadossiqi.js.');
    return;
  }
  _mod2Iniciado = true;
  mod2MontarBiblioteca();
}
window.addEventListener('siqi:module-switch', function(e){
  if(e.detail && e.detail.module === 'construtor') initModulo2();
});

/* ── 7.3 Módulo 3 — Reações Redox ──────────────────────────────── */
var _mod3Dificuldades = [
  { id:'basico', label:'Básico' },
  { id:'intermediaria', label:'Intermediária' },
  { id:'avancada', label:'Avançada' },
];
var _mod3DificuldadeAtual = 'basico';
var _mod3Iniciado = false;

function mod3CalcularMDC(a,b){ return b===0 ? a : mod3CalcularMDC(b, a % b); }
function mod3CalcularMMC(a,b){ return (a*b) / mod3CalcularMDC(a,b); }

function mod3MontarDificuldades(){
  var wrap = $('difficulty-selector');
  if(!wrap) return;
  wrap.innerHTML = '';
  wrap.setAttribute('role','tablist');
  wrap.setAttribute('aria-label','Nível de dificuldade das reações redox');
  _mod3Dificuldades.forEach(function(d){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diff-btn' + (d.id === _mod3DificuldadeAtual ? ' diff-btn--active' : '');
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', d.id === _mod3DificuldadeAtual ? 'true' : 'false');
    btn.textContent = d.label;
    btn.addEventListener('click', function(){ mod3MudaDificuldade(d.id); });
    wrap.appendChild(btn);
  });
}

function mod3MudaDificuldade(dif){
  var temReacoes = REACOES_REDOX.some(function(r){ return r.dificuldade === dif; });
  if(!temReacoes){
    var d = _mod3Dificuldades.filter(function(x){ return x.id===dif; })[0];
    srAnnounce('Nível ' + (d?d.label:dif) + ' ainda não tem reações cadastradas. Em desenvolvimento.');
    return;
  }
  _mod3DificuldadeAtual = dif;
  document.querySelectorAll('#difficulty-selector .diff-btn').forEach(function(b,i){
    var ativo = _mod3Dificuldades[i].id === dif;
    b.classList.toggle('diff-btn--active', ativo);
    b.setAttribute('aria-selected', ativo ? 'true' : 'false');
  });
  mod3RenderReacoes();
  var painel = $('redox-detail-panel');
  if(painel) painel.hidden = true;
}

function mod3RenderReacoes(){
  var listDiv = $('redox-reactions-list');
  if(!listDiv) return;
  var reacoes = REACOES_REDOX.filter(function(r){ return r.dificuldade === _mod3DificuldadeAtual; });

  listDiv.innerHTML = '';
  listDiv.setAttribute('role','listbox');
  listDiv.setAttribute('aria-label','Reações redox de nível ' + _mod3DificuldadeAtual);

  if(reacoes.length === 0){
    var vazio = document.createElement('p');
    vazio.className = 'no-results';
    vazio.textContent = 'Nenhuma reação disponível neste nível ainda.';
    listDiv.appendChild(vazio);
    return;
  }

  reacoes.forEach(function(r, i){
    var item = document.createElement('div');
    item.className = 'redox-reaction-item';
    item.setAttribute('role','option');
    item.setAttribute('tabindex','0');
    item.setAttribute('aria-selected','false');
    item.innerHTML =
      '<div class="reaction-head">'+
        '<span class="reaction-num">Reação '+(i+1)+'</span>'+
        '<span class="reaction-diff">'+r.dificuldade+'</span>'+
      '</div>'+
      '<div class="reaction-title">'+r.titulo+'</div>'+
      '<code class="reaction-eq">'+r.equacao_desbalanceada+'</code>'+
      '<p class="reaction-desc">'+r.descricao+'</p>';

    function selecionar(){
      listDiv.querySelectorAll('.redox-reaction-item').forEach(function(el){ el.setAttribute('aria-selected','false'); });
      item.setAttribute('aria-selected','true');
      mod3SelecionaReacao(r);
    }
    item.addEventListener('click', selecionar);
    item.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selecionar(); }
    });
    listDiv.appendChild(item);
  });
}

function mod3SelecionaReacao(reacao){
  mod3RenderDetalheReacao(reacao);
  if(window._setView) window._setView('redox');
  srAnnounce('Reação ' + reacao.titulo + ' carregada. Analise os estados de oxidação.');
}

/* Renderiza a análise completa da reação — mesmo padrão da Ficha
   (Módulos 1/2 geram no centro via carregarComposto()): o painel
   lateral "Reações Disponíveis" é o CONTROLE (escolher a reação); a
   análise completa é GERADA na área central (#panel-redox), com mais
   espaço para a equação, os estados de oxidação, as semirreações lado
   a lado e o balanceamento — réplica do padrão de 3 camadas do SIMA
   (seletor → controles/dados na lateral → canvas central gera o
   resultado). A barra lateral mantém só um resumo compacto. */
function mod3RenderDetalheReacao(reacao){
  var mmc = mod3CalcularMMC(reacao.semireacoes.oxidacao.eletrons, reacao.semireacoes.reducao.eletrons);
  var fatorOx = mmc / reacao.semireacoes.oxidacao.eletrons;
  var fatorRed = mmc / reacao.semireacoes.reducao.eletrons;

  var estadosHtml = Object.keys(reacao.oxidacao_estados).map(function(el){
    var e = reacao.oxidacao_estados[el];
    var sinalI = e.inicial > 0 ? '+'+e.inicial : String(e.inicial);
    var sinalF = e.final > 0 ? '+'+e.final : String(e.final);
    return '<li><strong>'+el+'</strong>: NOX '+sinalI+' → '+sinalF+' (variação de '+Math.abs(e.final-e.inicial)+' unidade(s))</li>';
  }).join('');

  var coefHtml = Object.keys(reacao.coeficientes).map(function(k){
    return '<li>'+reacao.coeficientes[k]+' × '+k+'</li>';
  }).join('');

  var corpoDetalhe =
      '<p class="redox-subhead">Equação desbalanceada</p>'+
      '<code class="redox-eq-block">'+reacao.equacao_desbalanceada+'</code>'+
      '<p class="redox-subhead">Estados de oxidação (NOX)</p>'+
      '<ul class="redox-states-list">'+estadosHtml+'</ul>'+
      '<p class="redox-subhead">Semirreações</p>'+
      '<div class="half-reaction oxidacao">'+
        '<span class="half-reaction-label">⬆ Oxidação (perda de elétrons)</span>'+
        '<code>'+reacao.semireacoes.oxidacao.equacao+'</code>'+
        '<p class="half-reaction-detail">'+reacao.semireacoes.oxidacao.eletrons+' e⁻ por fórmula × fator '+fatorOx+' = '+mmc+' e⁻</p>'+
      '</div>'+
      '<div class="half-reaction reducao">'+
        '<span class="half-reaction-label">⬇ Redução (ganho de elétrons)</span>'+
        '<code>'+reacao.semireacoes.reducao.equacao+'</code>'+
        '<p class="half-reaction-detail">'+reacao.semireacoes.reducao.eletrons+' e⁻ por fórmula × fator '+fatorRed+' = '+mmc+' e⁻</p>'+
      '</div>'+
      '<p class="redox-subhead">Balanceamento</p>'+
      '<p class="redox-mmc">MMC de elétrons transferidos = <strong>'+mmc+'</strong></p>'+
      '<ul class="redox-coef-list">'+coefHtml+'</ul>'+
      '<p class="redox-subhead">Equação balanceada</p>'+
      '<code class="redox-eq-block redox-eq-final">'+reacao.equacao_balanceada+'</code>'+
      '<p class="redox-application"><strong>Aplicação:</strong> '+reacao.aplicacao+'</p>'+
      '<p class="redox-fonte"><strong>Fonte:</strong> '+reacao.fonte+'</p>';

  /* ── Central (GERADO): layout hero, igual à Ficha ── */
  var central = $('redox-central-content');
  if(central){
    central.innerHTML =
      '<div class="redox-hero">'+
        '<p class="redox-hero-label">'+reacao.dificuldade+' · '+reacao.ambiente+'</p>'+
        '<h2 class="redox-hero-title">'+reacao.titulo+'</h2>'+
        '<p class="redox-hero-desc">'+reacao.descricao+'</p>'+
      '</div>'+
      '<div class="redox-detail redox-detail--central">'+corpoDetalhe+'</div>';
  }

  /* ── Lateral (CONTROLE): resumo compacto, aponta pro centro ── */
  var painel = $('redox-detail-panel');
  if(painel){
    painel.hidden = false;
    painel.innerHTML =
      '<div class="redox-detail redox-detail--sidebar">'+
        '<p class="redox-resumo">✓ <strong>'+reacao.titulo+'</strong> selecionada — a análise completa (estados de oxidação, semirreações e balanceamento) está na área central. →</p>'+
        '<code class="redox-eq-block redox-eq-final">'+reacao.equacao_balanceada+'</code>'+
      '</div>';
  }
}

function initModulo3(){
  if(_mod3Iniciado) return;
  if(typeof REACOES_REDOX === 'undefined'){
    console.error('[modulo3] REACOES_REDOX não definido — verifique dadossiqi.js.');
    return;
  }
  _mod3Iniciado = true;
  mod3MontarDificuldades();
  mod3RenderReacoes();
}
window.addEventListener('siqi:module-switch', function(e){
  if(e.detail && e.detail.module === 'redox') initModulo3();
});


document.addEventListener('DOMContentLoaded', function(){
  initPaineis();
  initExpandModal();
  initMobile();
  initViewToggle();
  initSubList();
  initCanvas();
  initSimulador();
  initModulos();
  initModulo2();
  initModulo3();

  /* Scroll-ready ANTES de carregar composto */
  document.querySelectorAll('[data-open="true"] .panel-body').forEach(function(bd){
    bd.classList.add('scroll-ready');
  });

  /* Nenhum composto pré-carregado — tudo começa bloqueado */
});


// ══════════════════════════════════════════════════════════════════
// SIDEBARS REDIMENSIONÁVEIS
// Cria uma alça (.sidebar-resizer) na borda interna de cada sidebar.
// Arrastar ajusta a variável CSS de largura em tempo real; a largura
// escolhida é salva no localStorage e restaurada na próxima visita.
// A alça é ignorada quando a sidebar está em modo gaveta mobile
// (position:fixed) — nesse modo a largura é fixa por CSS.
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  var targets = [{ id:'sidebar-left', side:'left', cssVar:'--sl', min:200, max:520 },{ id:'sidebar-right', side:'right', cssVar:'--sr', min:180, max:480 }];
  var root = document.documentElement;
  var rafPending = false;

  function fireResize() {
    // Notifica canvases/física que o espaço central mudou (mesmo evento
    // que os módulos já escutam para redimensionamento da janela).
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      window.dispatchEvent(new Event('resize'));
    });
  }

  targets.forEach(function (cfg) {
    var el = document.getElementById(cfg.id);
    if (!el) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

    var storeKey = 'siqi-w-' + cfg.cssVar.replace(/^--/, '');
    try {
      var saved = parseInt(localStorage.getItem(storeKey), 10);
      if (saved && saved >= cfg.min && saved <= cfg.max) {
        root.style.setProperty(cfg.cssVar, saved + 'px');
      }
    } catch (e) { /* localStorage indisponível — segue sem persistência */ }

    var handle = document.createElement('div');
    handle.className = 'sidebar-resizer sidebar-resizer--' + cfg.side;
    handle.setAttribute('aria-hidden', 'true');
    el.appendChild(handle);

    var dragging = false, startX = 0, startW = 0;

    handle.addEventListener('pointerdown', function (e) {
      // Em modo gaveta (mobile) a sidebar é position:fixed — não redimensiona.
      if (getComputedStyle(el).position === 'fixed') return;
      dragging = true;
      startX = e.clientX;
      startW = el.getBoundingClientRect().width;
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var delta = e.clientX - startX;
      var w = cfg.side === 'left' ? startW + delta : startW - delta;
      w = Math.max(cfg.min, Math.min(cfg.max, Math.round(w)));
      root.style.setProperty(cfg.cssVar, w + 'px');
      fireResize();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem(storeKey, Math.round(el.getBoundingClientRect().width));
      } catch (e) { /* sem persistência */ }
      fireResize();
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  });
});
