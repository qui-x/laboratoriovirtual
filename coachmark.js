/* ================================================================
   coachmark.js — MOTOR GENÉRICO DE TOUR GUIADO (COACHMARK)
   ================================================================
   Um "coachmark" é o balão flutuante que aponta pra um elemento real
   da tela e explica o que ele faz — a técnica de onboarding mais
   comum em apps (Notion, Duolingo, quase todo app novo usa isso nos
   primeiros segundos). Este arquivo é o MOTOR genérico: qualquer
   página do site pode montar seu próprio tour só descrevendo os
   passos, sem reescrever a mecânica de balão/destaque/navegação.

   COMO USAR (de qualquer página):
     Coachmark.iniciar({
       id: 'home',                 // chave própria no localStorage — tours diferentes não pisam um no outro
       passos: [
         { alvo: '#drawerToggle',  titulo: 'Abra o menu', texto: 'Toque aqui...' },
         { alvo: null,             titulo: 'Sem alvo', texto: 'Aparece centralizado, sem destaque.' },
       ]
     });

   Cada passo pode ter:
     alvo      — seletor CSS do elemento a destacar, ou null/ausente
                 pra um passo "flutuante" (sem recorte, balão centralizado)
     titulo    — título curto do balão
     texto     — texto explicativo
     ao_entrar — função opcional, roda ANTES de mostrar o passo (ex.:
                 abrir a gaveta pra revelar o próximo alvo)
     ao_sair   — função opcional, roda ao SAIR do passo (ex.: fechar
                 a gaveta de novo antes de avançar)

   Coachmark.jaViu(id)      — true se esse tour específico já foi
                               concluído ou pulado antes.
   Coachmark.reiniciar(id)  — esquece que já viu, pra rever o tour.

   Depende de: nada (motor puro). Estilos em coachmark.css.
   ================================================================ */

var Coachmark = (function () {
  'use strict';

  var CHAVE_PREFIXO = 'quimix_coach_visto_';
  var estadoAtual = null; // { id, passos, indice, els:{overlay,spot,balao,...} }

  function jaViu(id) {
    try { return localStorage.getItem(CHAVE_PREFIXO + id) === '1'; }
    catch (e) { return false; }
  }
  function marcarVisto(id) {
    try { localStorage.setItem(CHAVE_PREFIXO + id, '1'); } catch (e) { /* modo privado: ok, só reaparece na próxima visita */ }
  }
  function reiniciar(id) {
    try { localStorage.removeItem(CHAVE_PREFIXO + id); } catch (e) { /* nada a fazer */ }
  }

  function montarDom() {
    var overlay = document.createElement('div');
    overlay.className = 'coach-overlay';
    overlay.innerHTML =
      '<div class="coach-spot" id="coachSpot" hidden></div>' +
      '<div class="coach-balao" role="dialog" aria-modal="true" aria-labelledby="coachTitulo">' +
      '  <button type="button" class="coach-pular" id="coachPular">Pular tour</button>' +
      '  <p class="coach-titulo" id="coachTitulo"></p>' +
      '  <p class="coach-texto" id="coachTexto"></p>' +
      '  <div class="coach-rodape">' +
      '    <div class="coach-pontos" id="coachPontos"></div>' +
      '    <div class="coach-botoes">' +
      '      <button type="button" class="coach-btn coach-btn--voltar" id="coachVoltar">Anterior</button>' +
      '      <button type="button" class="coach-btn coach-btn--avancar" id="coachAvancar">Próximo</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);
    return {
      overlay: overlay,
      spot: overlay.querySelector('#coachSpot'),
      balao: overlay.querySelector('.coach-balao'),
      titulo: overlay.querySelector('#coachTitulo'),
      texto: overlay.querySelector('#coachTexto'),
      pontos: overlay.querySelector('#coachPontos'),
      btnVoltar: overlay.querySelector('#coachVoltar'),
      btnAvancar: overlay.querySelector('#coachAvancar'),
      btnPular: overlay.querySelector('#coachPular')
    };
  }

  function posicionarNoAlvo(els, alvoEl) {
    if (!alvoEl) {
      els.spot.hidden = true;
      els.balao.classList.add('coach-balao--centro');
      els.balao.style.top = '';
      els.balao.style.left = '';
      return;
    }
    els.balao.classList.remove('coach-balao--centro');
    var r = alvoEl.getBoundingClientRect();
    var pad = 8;
    els.spot.hidden = false;
    els.spot.style.top = (r.top - pad) + 'px';
    els.spot.style.left = (r.left - pad) + 'px';
    els.spot.style.width = (r.width + pad * 2) + 'px';
    els.spot.style.height = (r.height + pad * 2) + 'px';

    /* Ordem de tentativa: embaixo → em cima → à direita → à esquerda
       → por último, cola no topo da tela (alvo mais alto que a tela
       inteira, ex.: uma barra lateral esticada — nenhuma das quatro
       serve). Cada tentativa checa se cabe de verdade, sem cortar
       nas bordas. */
    var margemTela = 12;
    var balaoRect = els.balao.getBoundingClientRect();
    var top, left;

    var cabeEmbaixo = r.bottom + pad + 10 + balaoRect.height <= window.innerHeight - margemTela;
    var cabeEmCima = r.top - pad - 10 - balaoRect.height >= margemTela;
    var cabeDireita = r.right + pad + 10 + balaoRect.width <= window.innerWidth - margemTela;
    var cabeEsquerda = r.left - pad - 10 - balaoRect.width >= margemTela;

    if (cabeEmbaixo) {
      top = r.bottom + pad + 10;
      left = r.left + r.width / 2 - balaoRect.width / 2;
    } else if (cabeEmCima) {
      top = r.top - pad - 10 - balaoRect.height;
      left = r.left + r.width / 2 - balaoRect.width / 2;
    } else if (cabeDireita) {
      left = r.right + pad + 10;
      top = r.top + r.height / 2 - balaoRect.height / 2;
    } else if (cabeEsquerda) {
      left = r.left - pad - 10 - balaoRect.width;
      top = r.top + r.height / 2 - balaoRect.height / 2;
    } else {
      // alvo maior que a tela em todas as direções: última saída,
      // cola no topo, centralizado na largura.
      top = margemTela;
      left = window.innerWidth / 2 - balaoRect.width / 2;
    }

    top = Math.max(margemTela, Math.min(top, window.innerHeight - balaoRect.height - margemTela));
    left = Math.max(margemTela, Math.min(left, window.innerWidth - balaoRect.width - margemTela));

    els.balao.style.top = top + 'px';
    els.balao.style.left = left + 'px';
  }

  function renderPasso() {
    var st = estadoAtual;
    var passo = st.passos[st.indice];
    var els = st.els;

    els.titulo.textContent = passo.titulo || '';
    els.texto.textContent = passo.texto || '';
    els.btnVoltar.hidden = st.indice === 0;
    els.btnAvancar.textContent = (st.indice === st.passos.length - 1) ? 'Concluir' : 'Próximo';

    els.pontos.innerHTML = '';
    st.passos.forEach(function (_, i) {
      var p = document.createElement('span');
      p.className = 'coach-ponto' + (i === st.indice ? ' coach-ponto--ativo' : '');
      els.pontos.appendChild(p);
    });

    var alvoEl = passo.alvo ? document.querySelector(passo.alvo) : null;
    if (alvoEl && typeof alvoEl.scrollIntoView === 'function') {
      alvoEl.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
    // Espera passado o tempo de qualquer transição CSS que ao_entrar()
    // possa ter disparado (ex.: abrir a gaveta) — medir a posição
    // ANTES disso pegaria o alvo no meio do caminho, ainda animando.
    setTimeout(function () { posicionarNoAlvo(els, alvoEl); }, 300);

    setTimeout(function () { els.btnAvancar.focus(); }, 50);
  }

  function irParaPasso(indice) {
    var st = estadoAtual;
    var passoAtual = st.passos[st.indice];
    if (passoAtual && typeof passoAtual.ao_sair === 'function') passoAtual.ao_sair();

    st.indice = indice;
    var novoPasso = st.passos[st.indice];
    if (novoPasso && typeof novoPasso.ao_entrar === 'function') novoPasso.ao_entrar();

    renderPasso();
  }

  function encerrar() {
    if (!estadoAtual) return;
    var passoAtual = estadoAtual.passos[estadoAtual.indice];
    if (passoAtual && typeof passoAtual.ao_sair === 'function') passoAtual.ao_sair();
    marcarVisto(estadoAtual.id);
    estadoAtual.els.overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    window.removeEventListener('resize', onResize);
    estadoAtual = null;
  }

  function onKeydown(e) {
    if (!estadoAtual) return;
    if (e.key === 'Escape') { encerrar(); return; }
    if (e.key === 'ArrowRight') avancar();
    if (e.key === 'ArrowLeft') voltar();
  }
  function onResize() {
    if (!estadoAtual) return;
    var passo = estadoAtual.passos[estadoAtual.indice];
    var alvoEl = passo.alvo ? document.querySelector(passo.alvo) : null;
    posicionarNoAlvo(estadoAtual.els, alvoEl);
  }

  function avancar() {
    var st = estadoAtual;
    if (st.indice >= st.passos.length - 1) { encerrar(); return; }
    irParaPasso(st.indice + 1);
  }
  function voltar() {
    var st = estadoAtual;
    if (st.indice <= 0) return;
    irParaPasso(st.indice - 1);
  }

  function iniciar(config) {
    if (!config || !config.passos || !config.passos.length) return;
    if (estadoAtual) encerrar(); // não empilha dois tours

    var els = montarDom();
    estadoAtual = { id: config.id || 'tour', passos: config.passos, indice: 0, els: els };

    els.btnAvancar.addEventListener('click', avancar);
    els.btnVoltar.addEventListener('click', voltar);
    els.btnPular.addEventListener('click', encerrar);
    els.overlay.addEventListener('click', function (e) {
      if (e.target === els.overlay) encerrar(); // toque no fundo escurecido = pular
    });
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', onResize);

    var primeiroPasso = estadoAtual.passos[0];
    if (primeiroPasso && typeof primeiroPasso.ao_entrar === 'function') primeiroPasso.ao_entrar();
    renderPasso();
  }

  return { iniciar: iniciar, encerrar: encerrar, jaViu: jaViu, reiniciar: reiniciar };
})();
