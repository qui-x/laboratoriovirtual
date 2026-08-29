const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'index-sifi.html'), 'utf8');

function novaPagina() {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    resources: 'usable',
    url: 'http://localhost/index-sifi.html',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // jsdom nao mede layout real -> getBoundingClientRect/offsetWidth sempre 0.
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: 0, left: 0, width: 800, height: 500, right: 800, bottom: 500 };
  };
  Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', { get: () => 80, configurable: true });
  Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', { get: () => 70, configurable: true });
  window.HTMLElement.prototype.setPointerCapture = function () {};

  const scriptSrcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
    .map(m => m[1])
    .filter(src => !src.startsWith('http') && !src.startsWith('..'));

  const codigoCompleto = scriptSrcs
    .map(src => `\n// ---- ${src} ----\n` + fs.readFileSync(path.join(__dirname, src), 'utf8'))
    .join('\n');

  const errors = [];
  window.onerror = (msg) => errors.push(msg);
  try {
    window.eval(codigoCompleto);
  } catch (e) {
    errors.push(`Erro ao executar scripts: ${e.stack || e}`);
  }
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true }));

  return { window, document: window.document, errors };
}

const checks = [];
function chk(label, ok) { checks.push([label, !!ok]); }

/* Variante de novaPagina() que injeta um `window.A11Y` FALSO (simulando
   a central de simuladores já carregada, com `../a11y.js` presente)
   ANTES de rodar os scripts do SIFI — é assim que dá pra testar
   `js/a11y/preferencias.js` de verdade sem precisar do arquivo real da
   central (que fica FORA da pasta do projeto, num caminho relativo
   `../a11y.js` que nem existe neste ambiente de teste isolado). Sem
   essa injeção, `preferencias.js` sempre cairia no caminho de reserva
   (URL/localStorage) — o que TAMBÉM é testado, mas separadamente. */
function novaPaginaComA11Y(estadoA11Y) {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    resources: 'usable',
    url: 'http://localhost/index-sifi.html',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: 0, left: 0, width: 800, height: 500, right: 800, bottom: 500 };
  };
  Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', { get: () => 80, configurable: true });
  Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', { get: () => 70, configurable: true });
  window.HTMLElement.prototype.setPointerCapture = function () {};

  // A injeção em si — precisa existir ANTES do eval, porque
  // preferencias.js roda direto (não espera DOMContentLoaded) e checa
  // `window.A11Y.estado` logo na primeira execução.
  window.A11Y = { estado: estadoA11Y, definir: function () {} };

  const scriptSrcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
    .map(m => m[1])
    .filter(src => !src.startsWith('http') && !src.startsWith('..'));

  const codigoCompleto = scriptSrcs
    .map(src => `\n// ---- ${src} ----\n` + fs.readFileSync(path.join(__dirname, src), 'utf8'))
    .join('\n');

  const errors = [];
  window.onerror = (msg) => errors.push(msg);
  try {
    window.eval(codigoCompleto);
  } catch (e) {
    errors.push(`Erro ao executar scripts: ${e.stack || e}`);
  }
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true }));

  return { window, document: window.document, errors };
}

// ============================================================
// 1) ESTADO INICIAL — nenhum módulo ativo
// ============================================================
{
  const { window, document, errors } = novaPagina();
  chk('1.1 Nenhum erro de JS no carregamento', errors.length === 0);
  chk('1.2 SIFI.activeModule começa null', window.SIFI.activeModule === null);
  chk('1.3 Grid de moléculas foi preenchido (42 itens — 44 substâncias menos as 2 exclusivas do Módulo 3)', document.getElementById('menu-moleculas-grid').children.length === 42);
  chk('1.4 Indicador de módulo começa escondido', document.getElementById('module-indicator').classList.contains('hidden'));
  chk('1.5 Botão Módulo 2 está HABILITADO (módulo funcional)', document.getElementById('btn-modulo-2').disabled === false);
  chk('1.6 Botão Módulo 3 está HABILITADO (módulo funcional)', document.getElementById('btn-modulo-3').disabled === false);
  chk('1.7 Clicar numa molécula sem módulo ativo NÃO adiciona nada', (() => {
    window.SIFI.addMoleculeToSandbox('H2O');
    return window.SIFI.canvasMolecules.length === 0;
  })());
}

// ============================================================
// 2) ATIVAÇÃO DO MÓDULO 1 — mesmo padrão do "Ativar Modo Metálico"
// ============================================================
{
  const { window, document } = novaPagina();
  const btn1 = document.getElementById('btn-modulo-1');

  btn1.dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('2.1 Clicar em "Ativar Módulo 1" ativa o módulo', window.SIFI.activeModule === 1);
  chk('2.2 Botão fica aria-pressed=true', btn1.getAttribute('aria-pressed') === 'true');
  chk('2.3 Indicador de módulo aparece', !document.getElementById('module-indicator').classList.contains('hidden'));
  chk('2.4 Texto do indicador menciona "Tabuleiro das Atrações"', document.getElementById('module-indicator-text').textContent.includes('Tabuleiro das Atrações'));
  chk('2.5 Caixa de areia ganha a classe modulo-1-ativo', document.getElementById('sandbox').classList.contains('modulo-1-ativo'));
  chk('2.6 Menu de moléculas perde a classe grid-bloqueado', !document.getElementById('menu-moleculas-grid').classList.contains('grid-bloqueado'));
  chk('2.7 Física é ligada (simLoop existe)', window.SIFI.simLoop !== null);

  // Clicar de novo desativa (toggle, igual ao SILQ)
  btn1.dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('2.8 Clicar de novo DESATIVA o módulo', window.SIFI.activeModule === null);
  chk('2.9 Física é desligada ao desativar', window.SIFI.simLoop === null);
  chk('2.10 Indicador some de novo', document.getElementById('module-indicator').classList.contains('hidden'));
}

// ============================================================
// 3) COM O MÓDULO 1 ATIVO — adicionar molécula funciona
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.addMoleculeToSandbox('H2O');
  chk('3.1 Molécula é adicionada com o módulo ativo', window.SIFI.canvasMolecules.length === 1);
  chk('3.2 Ficha aparece no DOM', document.getElementById('sandbox').querySelectorAll('.sifi-molecule').length === 1);
  chk('3.3 poloLocal foi calculado (H2O tem 2 polos +, 1 polo -)', (() => {
    const m = window.SIFI.canvasMolecules[0];
    return m.poloLocal.positivo.length === 2 && m.poloLocal.negativo.length === 1;
  })());
}

// ============================================================
// 4) OS TRÊS MÓDULOS ESTÃO HABILITADOS — clicar em qualquer um ativa
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('4.1 Clicar no botão do Módulo 3 ativa ele de verdade', window.SIFI.activeModule === 3);
  window.SIFI.stopLabLoop();
}

// ============================================================
// 5) FÍSICA — DUAS ÁGUAS COM POLOS OPOSTOS SE ATRAEM
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.addMoleculeToSandbox('H2O');
  window.SIFI.addMoleculeToSandbox('H2O');
  const [a, b] = window.SIFI.canvasMolecules;

  // A em cima, B embaixo, alinhados no X -> o polo O (δ-) de A fica
  // voltado para os polos H (δ+) de B: polos OPOSTOS mais próximos.
  a.x = 100; a.y = 20; a.dom.style.left = '100px'; a.dom.style.top = '20px';
  b.x = 100; b.y = 140; b.dom.style.left = '100px'; b.dom.style.top = '140px';

  function distanciaCentros() {
    const cax = a.x + a.dom.offsetWidth / 2, cay = a.y + a.dom.offsetHeight / 2;
    const cbx = b.x + b.dom.offsetWidth / 2, cby = b.y + b.dom.offsetHeight / 2;
    return Math.hypot(cbx - cax, cby - cay);
  }

  const par = window.SIFI.polosMaisProximos(a, b);
  chk('5.1 Polos mais próximos identificados são OPOSTOS (δ+/δ-)', par.pa.sinal !== par.pb.sinal);

  const dAntes = distanciaCentros();
  for (let i = 0; i < 40; i++) window.SIFI.physicsTick();
  const dDepois = distanciaCentros();

  chk('5.2 Distância diminui com polos opostos (atração)', dDepois < dAntes);
  chk('5.3 Painel mostra Ligação de Hidrogênio', document.getElementById('interacoes-lista').textContent.includes('Ligação de Hidrogênio'));
}

// ============================================================
// 6) FÍSICA — POLOS IGUAIS PRÓXIMOS: A MOLÉCULA GIRA PRA CORRIGIR
//    (antes desta etapa, a translação empurrava as duas para longe;
//    agora, fisicamente mais correto, é a ROTAÇÃO que realinha os
//    dipolos — a distância pode até diminuir, porque a atração nunca
//    para, só a ORIENTAÇÃO estava errada, não a existência da força)
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.addMoleculeToSandbox('H2O');
  window.SIFI.addMoleculeToSandbox('H2O');
  const [a, b] = window.SIFI.canvasMolecules;

  // Lado a lado, mesma altura -> o H (δ+) direito de A fica perto do
  // H (δ+) esquerdo de B: polos IGUAIS mais próximos (orientação
  // desfavorável, como as duas nasceram sem girar nenhuma ainda).
  a.x = 100; a.y = 20; a.dom.style.left = '100px'; a.dom.style.top = '20px';
  b.x = 220; b.y = 20; b.dom.style.left = '220px'; b.dom.style.top = '20px';

  const par = window.SIFI.polosMaisProximos(a, b);
  chk('6.1 Polos mais próximos ANTES de girar são IGUAIS (δ+/δ+)', par.pa.sinal === par.pb.sinal);
  chk('6.2 Rotação começa em 0° (como desenhada)', a.rotation === 0 && b.rotation === 0);

  for (let i = 0; i < 120; i++) window.SIFI.physicsTick();

  chk('6.3 As duas moléculas giraram de verdade (não ficaram em 0°)', a.rotation !== 0 && b.rotation !== 0);

  const parDepois = window.SIFI.polosMaisProximos(a, b);
  chk('6.4 Depois de girar, os polos mais próximos viram OPOSTOS (δ+/δ−)', parDepois.pa.sinal !== parDepois.pb.sinal);
}

// ============================================================
// 6B) ROTAÇÃO — moléculas apolares giram livremente, polares só
//     quando têm uma interação polar ativa por perto
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 6B.1 — CH4 sozinho (apolar) já gira, mesmo sem ninguém por perto.
  window.SIFI.addMoleculeToSandbox('CH4');
  const ch4 = window.SIFI.canvasMolecules[0];
  chk('6B.1a Molécula apolar não tem eixo de dipolo (dipoloAngleLocal null)', ch4.dipoloAngleLocal === null);
  for (let i = 0; i < 20; i++) window.SIFI.physicsTick();
  chk('6B.1b CH4 sozinho já girou sozinho (giro livre, sem precisar de par)', ch4.rotation !== 0);
  window.SIFI.limparSandbox();

  // 6B.2 — HCl sozinho (polar) NÃO gira: não há ninguém pra alinhar com.
  window.SIFI.addMoleculeToSandbox('HCl');
  const hcl = window.SIFI.canvasMolecules[0];
  chk('6B.2a Molécula polar tem um eixo de dipolo definido (número)', typeof hcl.dipoloAngleLocal === 'number');
  for (let i = 0; i < 20; i++) window.SIFI.physicsTick();
  chk('6B.2b HCl sozinho NÃO gira (nada por perto pra alinhar)', hcl.rotation === 0);
  window.SIFI.limparSandbox();

  // 6B.3 — molécula sendo arrastada não gira (usuário está no controle).
  window.SIFI.addMoleculeToSandbox('CH4');
  window.SIFI.addMoleculeToSandbox('CH4');
  const [c1, c2] = window.SIFI.canvasMolecules;
  c1.x = 100; c1.y = 20; c1.dragging = true;
  c2.x = 150; c2.y = 20;
  const rotAntes = c1.rotation;
  for (let i = 0; i < 20; i++) window.SIFI.physicsTick();
  chk('6B.3 Molécula em arraste (dragging=true) não gira sozinha', c1.rotation === rotAntes);
}

// ============================================================
// 7) FÍSICA — CO2 + CO2 (APOLARES) SEMPRE ATRAI FRACAMENTE (LONDON)
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.addMoleculeToSandbox('CO2');
  window.SIFI.addMoleculeToSandbox('CO2');
  const [a, b] = window.SIFI.canvasMolecules;
  a.x = 100; a.y = 20; a.dom.style.left = '100px'; a.dom.style.top = '20px';
  b.x = 220; b.y = 20; b.dom.style.left = '220px'; b.dom.style.top = '20px';

  function distanciaCentros() {
    const cax = a.x + a.dom.offsetWidth / 2, cay = a.y + a.dom.offsetHeight / 2;
    const cbx = b.x + b.dom.offsetWidth / 2, cby = b.y + b.dom.offsetHeight / 2;
    return Math.hypot(cbx - cax, cby - cay);
  }
  const dAntes = distanciaCentros();
  for (let i = 0; i < 40; i++) window.SIFI.physicsTick();
  const dDepois = distanciaCentros();
  chk('7.1 CO2+CO2 se atraem fracamente (London)', dDepois < dAntes);
  chk('7.2 Painel mostra Dipolo Induzido / London', document.getElementById('interacoes-lista').textContent.includes('London'));
}

// ============================================================
// 8) TROCAR DE MÓDULO LIMPA A CAIXA DE AREIA
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.addMoleculeToSandbox('H2O');
  window.SIFI.addMoleculeToSandbox('HCl');
  chk('8.1 Duas moléculas na caixa antes de desativar', window.SIFI.canvasMolecules.length === 2);
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('8.2 Desativar o módulo limpa a caixa de areia', window.SIFI.canvasMolecules.length === 0);
}

// ============================================================
// 9) BIBLIOTECA DE COMPOSTOS — está na sidebar direita, sem desenho
// ============================================================
{
  const { window, document } = novaPagina();
  const grid = document.getElementById('menu-moleculas-grid');
  chk('9.1 Biblioteca está dentro da sidebar-right', !!grid.closest('#sidebar-right'));
  chk('9.2 Biblioteca NÃO está dentro da sidebar-left', !grid.closest('#sidebar-left'));
  chk('9.3 Itens usam a classe composto-item (lista por nome)', grid.querySelectorAll('.composto-item').length === 42);
  chk('9.4 Itens NÃO desenham SVG de geometria', grid.querySelectorAll('svg').length === 0);
  chk('9.5 Cada item mostra fórmula e nome', (() => {
    const primeiro = grid.querySelector('.composto-item');
    return !!primeiro.querySelector('.composto-formula') && !!primeiro.querySelector('.composto-nome');
  })());
  chk('9.6 Badge da biblioteca mostra 42', document.getElementById('badge-biblioteca').textContent === '42');
  chk('9.7 Painel do Módulo 1 (sidebar-left) não tem mais a lista de compostos', !document.getElementById('sidebar-left').querySelector('.composto-item'));
}

// ============================================================
// 10) REMOVER MOLÉCULA — duplo clique, tecla Delete (sem botão "×")
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 10.1 — não existe mais botão "×" (sobrepunha moléculas vizinhas
  // quando havia várias próximas na caixa de areia); duplo clique
  // remove e marca aria-hidden imediatamente.
  window.SIFI.addMoleculeToSandbox('H2O');
  const fichaH2O = window.SIFI.canvasMolecules[0].dom;
  chk('10.1a Ficha NÃO tem mais o botão de remover (×)', !fichaH2O.querySelector('.sifi-molecule-remove'));
  fichaH2O.dispatchEvent(new window.Event('dblclick', { bubbles: true }));
  chk('10.1b Duplo clique remove a molécula do estado', window.SIFI.canvasMolecules.length === 0);
  chk('10.1c Ficha removida vira aria-hidden imediatamente', fichaH2O.getAttribute('aria-hidden') === 'true');

  // 10.2 — Duplo clique na ficha (referenciando a instância certa, não
  // uma busca genérica que poderia pegar a ficha anterior ainda em
  // animação de saída no DOM)
  window.SIFI.addMoleculeToSandbox('HCl');
  const fichaHCl = window.SIFI.canvasMolecules[0].dom;
  fichaHCl.dispatchEvent(new window.Event('dblclick', { bubbles: true }));
  chk('10.2 Duplo clique remove a molécula do estado', window.SIFI.canvasMolecules.length === 0);

  // 10.3 — Tecla Delete com a ficha focada
  window.SIFI.addMoleculeToSandbox('CH4');
  const fichaCH4 = window.SIFI.canvasMolecules[0].dom;
  const evDelete = new window.KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true });
  fichaCH4.dispatchEvent(evDelete);
  chk('10.3 Tecla Delete remove a molécula do estado', window.SIFI.canvasMolecules.length === 0);

  // 10.4 — Ficha é focável (acessibilidade, igual ao átomo do SILQ)
  window.SIFI.addMoleculeToSandbox('F2');
  const fichaF2 = window.SIFI.canvasMolecules[0].dom;
  chk('10.4 Ficha tem tabindex para navegação por teclado', fichaF2.getAttribute('tabindex') === '0');
  chk('10.5 Ficha tem aria-label mencionando remoção', fichaF2.getAttribute('aria-label').includes('remover'));

  // 10.6 — Remover uma molécula não afeta as outras
  window.SIFI.addMoleculeToSandbox('NH3');
  chk('10.6a Duas moléculas na caixa antes de remover uma', window.SIFI.canvasMolecules.length === 2);
  const primeira = window.SIFI.canvasMolecules[0];
  window.SIFI.removeMolecule(primeira);
  chk('10.6b Sobra só uma molécula depois de remover a primeira', window.SIFI.canvasMolecules.length === 1);
}

// ============================================================
// 11) ÍCONES SÃO SVG, NÃO EMOJI
// ============================================================
{
  const { window, document } = novaPagina();

  chk('11.1 Ícone do painel Módulo 1 é um <svg>', !!document.querySelector('[data-icon="modulo1"] svg'));
  chk('11.2 Ícone do painel Biblioteca é um <svg>', !!document.querySelector('[data-icon="biblioteca"] svg'));
  chk('11.3 Botão hambúrguer (mobile) é um <svg>', !!document.querySelector('#mobile-menu-btn svg'));
  chk('11.4 Botão de limpar caixa de areia tem <svg>', !!document.querySelector('#btn-limpar-sandbox svg'));

  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('11.5 Ícone do indicador de módulo (preenchido via JS) é um <svg>', !!document.querySelector('#module-indicator-icon svg'));
  chk('11.6 Botão de fechar o indicador é um <svg>', !!document.querySelector('#module-indicator-clear svg'));

  window.SIFI.addMoleculeToSandbox('H2O');
  window.SIFI.addMoleculeToSandbox('H2O');
  const [a, b] = window.SIFI.canvasMolecules;
  a.x = 100; a.y = 20; a.dom.style.left = '100px'; a.dom.style.top = '20px';
  b.x = 100; b.y = 90; b.dom.style.left = '100px'; b.dom.style.top = '90px';
  window.SIFI.updateForceDetection();
  chk('11.7 Ícone da força detectada (dado puro, FORCE_TYPES) é um <svg>', document.getElementById('interacoes-lista').innerHTML.includes('<svg'));

  // Nenhum emoji visível deve sobrar no HTML renderizado da página
  const pattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
  chk('11.8 Nenhum emoji restante no <body> renderizado', !pattern.test(document.body.innerHTML));
}

// ============================================================
// 12) BIBLIOTECA — BUSCA, FILTRO POR FORÇA E ORDENAÇÃO
// ============================================================
{
  const { window, document } = novaPagina();
  const grid = document.getElementById('menu-moleculas-grid');

  // 12.1 — dados básicos da expansão
  chk('12.1 Contador inicial mostra 42 compostos', document.getElementById('biblioteca-contador').textContent.includes('42'));

  // 12.2 — busca por texto (nome e fórmula)
  const busca = document.getElementById('biblioteca-busca');
  busca.value = 'água';
  busca.dispatchEvent(new window.Event('input', { bubbles: true }));
  chk('12.2a Buscar "água" encontra só 1 composto', grid.querySelectorAll('.composto-item').length === 1);
  chk('12.2b O composto encontrado é a Água', grid.querySelector('.composto-nome').textContent === 'Água');

  busca.value = 'Cl';
  busca.dispatchEvent(new window.Event('input', { bubbles: true }));
  const resultadosCl = grid.querySelectorAll('.composto-item').length;
  chk('12.2c Buscar "Cl" encontra vários compostos (HCl, CH3Cl, Cl2...)', resultadosCl >= 3);

  busca.value = 'substancia-que-nao-existe-xyz';
  busca.dispatchEvent(new window.Event('input', { bubbles: true }));
  chk('12.2d Busca sem resultado mostra a mensagem "Nenhum composto encontrado"', grid.textContent.includes('Nenhum composto encontrado'));

  busca.value = '';
  busca.dispatchEvent(new window.Event('input', { bubbles: true }));
  chk('12.2e Limpar a busca volta a mostrar todos os 42', grid.querySelectorAll('.composto-item').length === 42);

  // 12.3 — filtro por tipo de força
  const btnLondon = document.querySelector('.mol-cat-btn[data-forca="london"]');
  btnLondon.dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('12.3a Filtro "London" mostra 20 compostos (18 originais + Hexano + Iodo)', grid.querySelectorAll('.composto-item').length === 20);
  chk('12.3b Botão "London" fica marcado como ativo', btnLondon.classList.contains('active-cat'));
  chk('12.3c Botão "Todos" deixa de estar ativo', !document.querySelector('.mol-cat-btn[data-forca="all"]').classList.contains('active-cat'));

  const btnHidrogenio = document.querySelector('.mol-cat-btn[data-forca="hydrogen-bond"]');
  btnHidrogenio.dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('12.3d Filtro "Ligação de Hidrogênio" mostra 9 compostos (7 anteriores + Ácido Acético + Glicerina)', grid.querySelectorAll('.composto-item').length === 9);

  const btnDipolo = document.querySelector('.mol-cat-btn[data-forca="dipole-dipole"]');
  btnDipolo.dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('12.3e Filtro "Dipolo-Dipolo" mostra 13 compostos (10 originais + Acetona + Clorofórmio + Éter Etílico)', grid.querySelectorAll('.composto-item').length === 13);

  document.querySelector('.mol-cat-btn[data-forca="all"]').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('12.3f Voltar para "Todos" mostra os 42 de novo', grid.querySelectorAll('.composto-item').length === 42);

  // 12.4 — ordenação por ponto de ebulição
  const selectOrdenar = document.getElementById('biblioteca-ordenar');
  selectOrdenar.value = 'pe-asc';
  selectOrdenar.dispatchEvent(new window.Event('change', { bubbles: true }));
  const primeiroAsc = grid.querySelector('.composto-item .composto-nome').textContent;
  chk('12.4a Ordenar por PE crescente coloca o Hélio primeiro (o mais frio)', primeiroAsc === 'Hélio');

  selectOrdenar.value = 'pe-desc';
  selectOrdenar.dispatchEvent(new window.Event('change', { bubbles: true }));
  const primeiroDesc = grid.querySelector('.composto-item .composto-nome').textContent;
  chk('12.4b Ordenar por PE decrescente coloca a Glicerina primeiro (290°C — a mais quente de todas agora)', primeiroDesc === 'Glicerina');

  // 12.5 — cada item mostra o ponto de ebulição
  chk('12.5 Item da lista mostra o ponto de ebulição (°C)', grid.querySelector('.composto-pe').textContent.includes('°C'));
}

// ============================================================
// 13) SEM CAIXA/RÓTULO NA FICHA + MÚLTIPLAS INTERAÇÕES SIMULTÂNEAS
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 13.1 — a ficha não tem mais rótulo visível nem tooltip de identificação
  window.SIFI.addMoleculeToSandbox('H2O');
  const ficha = window.SIFI.canvasMolecules[0].dom;
  chk('13.1a Ficha não tem mais o rótulo de fórmula visível', !ficha.querySelector('.sifi-molecule-label'));
  chk('13.1b Ficha não tem atributo title revelando o composto', !ficha.getAttribute('title'));
  chk('13.1c Nome do composto só existe no aria-label (acessibilidade)', ficha.getAttribute('aria-label').includes('Água'));
  window.SIFI.limparSandbox();

  // 13.2 — três moléculas, DUAS interações diferentes ao mesmo tempo:
  // A e B (duas águas) fazem Ligação de Hidrogênio; A e C (água + CO2)
  // fazem só London. B e C ficam longe uma da outra de propósito.
  window.SIFI.addMoleculeToSandbox('H2O'); // A
  window.SIFI.addMoleculeToSandbox('H2O'); // B
  window.SIFI.addMoleculeToSandbox('CO2'); // C
  const [a, b, c] = window.SIFI.canvasMolecules;
  a.x = 100; a.y = 20;  a.dom.style.left = '100px'; a.dom.style.top = '20px';
  b.x = 100; b.y = 140; b.dom.style.left = '100px'; b.dom.style.top = '140px';
  c.x = 210; c.y = 20;  c.dom.style.left = '210px'; c.dom.style.top = '20px';
  // Zera o registro de "interações já vistas": adicionar cada molécula
  // (posição em cascata) já dispara uma detecção automática sozinha,
  // então sem este reset o teste de "isso é novo?" ficaria contaminado
  // por pares que já tinham ficado perto um do outro na cascata.
  window.SIFI.interacoesAtivas = new Set();
  window.SIFI.updateForceDetection();

  const lista = document.getElementById('interacoes-lista');
  chk('13.2a Contador de substâncias mostra 3', document.getElementById('stat-num-moleculas').textContent === '3');
  chk('13.2b Contador de interações ativas mostra 2', document.getElementById('stat-num-interacoes').textContent === '2');
  chk('13.2c A lista tem 2 itens de interação', lista.querySelectorAll('.interacao-item').length === 2);
  chk('13.2d Uma das interações é Ligação de Hidrogênio (A+B)', lista.textContent.includes('Ligação de Hidrogênio'));
  chk('13.2e A outra interação é London (A+C, água apolar não, CO2 é apolar)', lista.textContent.includes('London'));
  chk('13.2f A linha tracejada é desenhada para as 2 interações (2 <line>)', document.getElementById('bond-svg').querySelectorAll('line').length === 2);

  // 13.3 — interação nova pisca na primeira vez, mas não de novo se
  // continuar ativa no próximo recálculo (evita piscar sem parar).
  const primeiraRodada = lista.querySelectorAll('.interacao-item.interacao-nova').length;
  window.SIFI.updateForceDetection(); // recalcula de novo, nada mudou de posição
  const segundaRodada = lista.querySelectorAll('.interacao-item.interacao-nova').length;
  chk('13.3a Primeira detecção marca as interações como novas', primeiraRodada === 2);
  chk('13.3b Recalcular sem mudança não marca como novas de novo', segundaRodada === 0);
}

// ============================================================
// 14) MATEMÁTICA DA ROTAÇÃO (funções isoladas, sem precisar de DOM)
// ============================================================
{
  const { window } = novaPagina();

  // 14.1 — menor caminho angular (SIFI.anguloMaisCurto)
  chk('14.1a De 350° para 10°, o caminho curto é +20° (não -340°)', window.SIFI.anguloMaisCurto(350, 10) === 20);
  chk('14.1b De 10° para 350°, o caminho curto é -20°', window.SIFI.anguloMaisCurto(10, 350) === -20);
  chk('14.1c De 0° para 0°, a diferença é 0°', window.SIFI.anguloMaisCurto(0, 0) === 0);
  chk('14.1d De 0° para 90°, a diferença é +90°', window.SIFI.anguloMaisCurto(0, 90) === 90);

  // 14.2 — eixo do dipolo da água: O é o polo negativo (em 0,0) e os
  // dois H (polo positivo) ficam abaixo dele, simétricos em X — o
  // centroide dos H fica exatamente abaixo do O, então o dipolo
  // (do − para o +) aponta pra baixo: ângulo exato de -90°.
  const H2O = { polar: true, poloPositivo: [1, 2], poloNegativo: [0], atoms: [
    { x: 0, y: 0 },
    { x: -Math.sin(52.25 * Math.PI / 180) * 0.8, y: -Math.cos(52.25 * Math.PI / 180) * 0.8 },
    { x: Math.sin(52.25 * Math.PI / 180) * 0.8, y: -Math.cos(52.25 * Math.PI / 180) * 0.8 },
  ]};
  chk('14.2 Eixo do dipolo da água calculado corretamente (-90°)', Math.abs(window.SIFI.dipoloAngleLocal(H2O) - (-90)) < 0.01);

  // 14.3 — molécula apolar não tem eixo de dipolo
  const CH4fake = { polar: false, poloPositivo: [], poloNegativo: [], atoms: [] };
  chk('14.3 Molécula apolar retorna null (sem eixo definido)', window.SIFI.dipoloAngleLocal(CH4fake) === null);
}

// ============================================================
// 15) O DOM REALMENTE RECEBE O TRANSFORM, E A REMOÇÃO LIMPA ELE
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.addMoleculeToSandbox('CH4'); // apolar: já gira sozinho
  const instance = window.SIFI.canvasMolecules[0];

  window.SIFI.physicsTick();
  chk('15.1 O style.transform da ficha reflete a rotação atual', instance.dom.style.transform.includes('rotate('));

  window.SIFI.removeMolecule(instance);
  chk('15.2 Remover a molécula limpa o transform inline (pro scale(0) da saída funcionar)', instance.dom.style.transform === '');
}

// ============================================================
// 16) CABEÇALHO — PARIDADE ESTRUTURAL COM A RESPONSIVIDADE DO SILQ
//     (o CSS é cópia byte-a-byte de stylesilq.css; aqui confirmamos
//     que o HTML do SIFI usa exatamente as classes/estrutura que
//     esse CSS espera, senão as regras responsivas não têm efeito
//     nenhum por trás — CSS certo com HTML errado não funciona)
// ============================================================
{
  const { document } = novaPagina();

  // 16.1 — estrutura .header-back (ícone + rótulo texto, não só ícone)
  const back = document.querySelector('.header-back');
  chk('16.1a .header-back existe dentro de .header-brand', !!document.querySelector('.header-brand > .header-back'));
  chk('16.1b .header-back tem um <svg> (a seta)', !!back.querySelector('svg'));
  chk('16.1c .header-back tem um <span> com texto (rótulo, não só ícone)', back.querySelector('span') && back.querySelector('span').textContent.trim().length > 0);

  // 16.2 — .header-sub existe e é irmão do <h1>, dentro de header-brand > div
  const sub = document.querySelector('.header-brand > div > .header-sub');
  chk('16.2 .header-sub está no lugar certo (header-brand > div, junto do h1)', !!sub && !!sub.previousElementSibling && sub.previousElementSibling.tagName === 'H1');

  // 16.3 — os dois botões de menu mobile existem dentro de .header-right,
  // cada um com aria-controls apontando pra uma sidebar de verdade
  const btns = document.querySelectorAll('.header-right .mobile-menu-btn');
  chk('16.3a Dois botões de menu mobile dentro de .header-right', btns.length === 2);
  chk('16.3b Primeiro botão controla a sidebar-left', btns[0].getAttribute('aria-controls') === 'sidebar-left');
  chk('16.3c Segundo botão controla a sidebar-right', btns[1].getAttribute('aria-controls') === 'sidebar-right');
  chk('16.3d document.getElementById encontra as duas sidebars referenciadas', !!document.getElementById(btns[0].getAttribute('aria-controls')) && !!document.getElementById(btns[1].getAttribute('aria-controls')));

  // 16.4 — CSS da página realmente carrega as regras responsivas do
  // cabeçalho copiadas do SILQ (existe pelo menos a âncora textual das
  // media queries de 900px/640px no arquivo referenciado pela página)
  const fs = require('fs');
  const cssTexto = fs.readFileSync(require('path').join(__dirname, 'css/sifi-styles.css'), 'utf8');
  chk('16.4a CSS carregado tem a media query de 900px (modo gaveta)', cssTexto.includes('@media(max-width:900px)'));
  chk('16.4b CSS carregado tem a media query de 640px (botão Voltar em tela estreita)', cssTexto.includes('@media (max-width: 640px)'));
  chk('16.4c CSS carregado tem a regra de alvo de toque 44px (pointer:coarse)', cssTexto.includes('@media (pointer: coarse)') && cssTexto.includes('min-width: 44px'));
}

// ============================================================
// 17) AGRUPAMENTO — interações repetidas viram 1 linha + contador ×N
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 3 metanos formando um triângulo bem próximo: os 3 pares (A-B,
  // A-C, B-C) ficam dentro do raio de interação ao mesmo tempo, e
  // como são todos CH4+CH4 (apolar+apolar), os 3 pares são a MESMA
  // combinação força+composto — devem virar 1 item só, com "×3".
  window.SIFI.addMoleculeToSandbox('CH4');
  window.SIFI.addMoleculeToSandbox('CH4');
  window.SIFI.addMoleculeToSandbox('CH4');
  const [a, b, c] = window.SIFI.canvasMolecules;
  a.x = 100; a.y = 20;  a.dom.style.left = '100px'; a.dom.style.top = '20px';
  b.x = 180; b.y = 20;  b.dom.style.left = '180px'; b.dom.style.top = '20px';
  c.x = 140; c.y = 90;  c.dom.style.left = '140px'; c.dom.style.top = '90px';
  window.SIFI.interacoesAtivas = new Set();
  window.SIFI.updateForceDetection();

  const lista = document.getElementById('interacoes-lista');
  chk('17.1 Contador de interações ativas (bruto, sem agrupar) mostra 3', document.getElementById('stat-num-interacoes').textContent === '3');
  chk('17.2 A lista mostra só 1 item (os 3 pares agrupados)', lista.querySelectorAll('.interacao-item').length === 1);
  chk('17.3 O item mostra o selo de contagem "×3"', lista.querySelector('.interacao-contador').textContent === '×3');
  chk('17.4 O texto do par mostra CH₄ + CH₄, não repetido 3 vezes', lista.querySelectorAll('.interacao-par').length === 1 && lista.textContent.includes('CH₄ + CH₄'));

  // Adiciona um HCl bem longe de todo mundo: não interage com nada,
  // então o grupo dos CH4 continua sozinho na lista (2 grupos: os
  // 3 CH4 agrupados + nada do HCl, que fica isolado sem interação).
  window.SIFI.addMoleculeToSandbox('HCl');
  const hcl = window.SIFI.canvasMolecules[3];
  hcl.x = 700; hcl.y = 400; hcl.dom.style.left = '700px'; hcl.dom.style.top = '400px';
  window.SIFI.updateForceDetection();
  chk('17.5 HCl isolado não quebra o agrupamento dos CH4 (continua 1 item, ×3)', lista.querySelectorAll('.interacao-item').length === 1 && lista.querySelector('.interacao-contador').textContent === '×3');

  // Um único par (sem repetição) NÃO mostra contador — só aparece
  // quando count > 1, pra não poluir a maioria dos casos (2 moléculas).
  window.SIFI.limparSandbox();
  window.SIFI.addMoleculeToSandbox('H2O');
  window.SIFI.addMoleculeToSandbox('HF');
  const [h2o, hf] = window.SIFI.canvasMolecules;
  h2o.x = 100; h2o.y = 20; hf.x = 150; hf.y = 20;
  window.SIFI.updateForceDetection();
  chk('17.6 Um par único não mostra contador (sem "×")', !lista.querySelector('.interacao-contador'));
}

// ============================================================
// 18) DESEMPENHO — throttle da detecção, limite de linhas, skip de redesenho
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 18.1 — updateForceDetection roda bem menos vezes que physicsTick
  let chamadas = 0;
  const original = window.SIFI.updateForceDetection;
  window.SIFI.updateForceDetection = function (...args) { chamadas++; return original.apply(this, args); };
  for (let i = 0; i < 60; i++) window.SIFI.physicsTick();
  chk('18.1 Em 60 ticks de física, a detecção roda só 10 vezes (throttle de 6)', chamadas === 10);
  window.SIFI.updateForceDetection = original; // restaura

  // 18.2 — linhas SVG ficam limitadas mesmo com muito mais pares ativos
  // (8 metanos bem próximos uns dos outros -> C(8,2) = 28 pares, todos
  // dentro do raio de interação; reduzimos o limite pra 5 só neste
  // teste, pra não precisar de 60+ moléculas pra provar o limite)
  window.SIFI.limparSandbox();
  const limiteOriginal = window.SIFI.MAX_LINHAS_DESENHADAS;
  window.SIFI.MAX_LINHAS_DESENHADAS = 5;
  for (let i = 0; i < 8; i++) window.SIFI.addMoleculeToSandbox('CH4');
  const mols = window.SIFI.canvasMolecules;
  mols.forEach((m, i) => {
    m.x = 20 + (i % 4) * 45; m.y = 20 + Math.floor(i / 4) * 45;
    m.dom.style.left = m.x + 'px'; m.dom.style.top = m.y + 'px';
  });
  window.SIFI.updateForceDetection();
  const totalParesAtivos = Number(document.getElementById('stat-num-interacoes').textContent);
  chk('18.2a Existem mais pares ativos do que o limite de linhas', totalParesAtivos > 5);
  chk('18.2b Mas só 5 linhas são desenhadas de verdade (respeitando o limite)', document.getElementById('bond-svg').querySelectorAll('line').length === 5);
  chk('18.2c O contador do painel continua contando TODOS os pares, sem limite (não trava em 5)', totalParesAtivos > 5 && totalParesAtivos !== 5);
  window.SIFI.MAX_LINHAS_DESENHADAS = limiteOriginal;

  // 18.3 — recalcular sem nenhuma mudança não reconstrói o DOM da lista
  // (o mesmo elemento <div> continua sendo o mesmo, não um novo)
  window.SIFI.limparSandbox();
  window.SIFI.addMoleculeToSandbox('H2O');
  window.SIFI.addMoleculeToSandbox('H2O');
  const [a, b] = window.SIFI.canvasMolecules;
  a.x = 100; a.y = 20; b.x = 150; b.y = 20;
  window.SIFI.updateForceDetection();
  const itemAntes = document.querySelector('.interacao-item');
  window.SIFI.updateForceDetection(); // nada mudou de posição nem de par
  const itemDepois = document.querySelector('.interacao-item');
  chk('18.3 Sem mudança nenhuma, o item da lista NÃO é recriado (mesma referência de nó)', itemAntes === itemDepois);
}

// ============================================================
// 19) TETO DE 1000 INTERAÇÕES ATIVAS + AVISO DISCRETO NO PAINEL
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  const tetoInteracoesOriginal = window.SIFI.MAX_INTERACOES_ATIVAS;
  const tetoMoleculasOriginal = window.SIFI.MAX_MOLECULAS_SANDBOX;
  const aviso = document.getElementById('interacoes-limite-aviso');
  chk('19.1 Aviso de limite começa escondido', aviso.hidden === true);

  // --- Parte A: o portão de INTERAÇÕES bloqueia novas adições assim
  // que o teto é atingido (a forma mais comum de crescer sem controle:
  // clicar "adicionar" repetidas vezes, como no caso das 128 moléculas) ---
  window.SIFI.MAX_INTERACOES_ATIVAS = 1;
  window.SIFI.addMoleculeToSandbox('CH4');
  window.SIFI.addMoleculeToSandbox('CH4');
  const [p0, p1] = window.SIFI.canvasMolecules;
  p0.x = 20; p0.y = 20; p0.dom.style.left = '20px'; p0.dom.style.top = '20px';
  p1.x = 60; p1.y = 20; p1.dom.style.left = '60px'; p1.dom.style.top = '20px';
  window.SIFI.updateForceDetection();
  chk('19.2 Duas moléculas próximas geram 1 par — já no teto (1)', window.SIFI.interacoesAtivas.size === 1);

  const totalNoTeto = window.SIFI.canvasMolecules.length;
  window.SIFI.addMoleculeToSandbox('CH4'); // deve ser recusada: já está no teto
  chk('19.3 No teto de interações, a próxima adição é recusada', window.SIFI.canvasMolecules.length === totalNoTeto);
  chk('19.4 Aviso de limite aparece no painel', aviso.hidden === false);
  chk('19.5 Texto do aviso menciona o teto de interações certo (1)', aviso.textContent.includes('1 interaç'));

  window.SIFI.MAX_INTERACOES_ATIVAS = tetoInteracoesOriginal;
  window.SIFI.limparSandbox();
  chk('19.6 Limpar a caixa de areia esconde o aviso de novo', aviso.hidden === true);

  // --- Parte B: a garantia MATEMÁTICA — o teto de MOLÉCULAS impede
  // ultrapassar o teto de interações mesmo que as já existentes se
  // aproximem umas das outras depois (não só "bloquear quando já
  // encheu", e sim impedir que a base para ultrapassar exista) ---
  window.SIFI.MAX_INTERACOES_ATIVAS = 2; // baixo, mas ainda não atingido pelas 3 primeiras
  window.SIFI.MAX_MOLECULAS_SANDBOX = 3;

  window.SIFI.addMoleculeToSandbox('CH4');
  window.SIFI.addMoleculeToSandbox('CH4');
  window.SIFI.addMoleculeToSandbox('CH4');
  chk('19.7 As 3 primeiras (dentro do teto de moléculas) são aceitas', window.SIFI.canvasMolecules.length === 3);

  const totalComTetoMoleculas = window.SIFI.canvasMolecules.length;
  window.SIFI.addMoleculeToSandbox('CH4'); // 4ª: deve ser recusada pelo teto de MOLÉCULAS
  chk('19.8 A 4ª molécula é recusada pelo teto de moléculas (capacidade da caixa de areia)', window.SIFI.canvasMolecules.length === totalComTetoMoleculas);

  // Agora aproxima as 3 já existentes TODAS bem juntas (o pior caso
  // possível) — mesmo assim, C(3,2)=3 pares é o máximo matematicamente
  // possível com 3 moléculas, e o teto de moléculas garante que nunca
  // vai ter uma 4ª para aumentar esse número.
  const [q0, q1, q2] = window.SIFI.canvasMolecules;
  q0.x = 20; q0.y = 20; q1.x = 60; q1.y = 20; q2.x = 20; q2.y = 60;
  [q0, q1, q2].forEach(m => { m.dom.style.left = m.x + 'px'; m.dom.style.top = m.y + 'px'; });
  window.SIFI.updateForceDetection();
  chk('19.9 Com só 3 moléculas, no máximo 3 pares existem — nunca mais que isso', window.SIFI.interacoesAtivas.size <= 3);

  window.SIFI.MAX_INTERACOES_ATIVAS = tetoInteracoesOriginal;
  window.SIFI.MAX_MOLECULAS_SANDBOX = tetoMoleculasOriginal;
  window.SIFI.limparSandbox();

  // --- Parte C: o texto do aviso é dinâmico, não um valor fixo no HTML ---
  window.SIFI.MAX_INTERACOES_ATIVAS = 5;
  window.SIFI.renderInteracoesPanel(new Array(5).fill({ forceKey: 'london', a: { mol: { formula: 'CH₄' } }, b: { mol: { formula: 'CH₄' } }, nova: false }));
  chk('19.10 Aviso aparece quando a lista simulada chega no teto (5)', aviso.hidden === false);
  chk('19.11 Texto do aviso mostra o número certo do teto (5), não um valor fixo', aviso.textContent.includes('5'));

  window.SIFI.MAX_INTERACOES_ATIVAS = tetoInteracoesOriginal;
  window.SIFI.limparSandbox();
}

// ============================================================
// 20) ESTRESSE COM OS VALORES REAIS (90 moléculas / 1000 interações)
//     — reproduz o cenário que expôs o problema original: muitas
//     tentativas de adicionar compostos bem próximos uns dos outros,
//     desta vez com um empacotamento FISICAMENTE REALISTA (hexagonal,
//     no limite da distância mínima de colisão — não moléculas
//     artificialmente sobrepostas, que a física nunca produziria).
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));

  chk('20.1 Teto de moléculas padrão é 90 (testado com empacotamento hexagonal)', window.SIFI.MAX_MOLECULAS_SANDBOX === 90);
  chk('20.2 Teto de interações padrão continua 1000', window.SIFI.MAX_INTERACOES_ATIVAS === 1000);

  // 200 tentativas de adicionar — bem mais que o teto de moléculas.
  for (let i = 0; i < 200; i++) window.SIFI.addMoleculeToSandbox('BF3');
  chk('20.3 No máximo 90 moléculas são aceitas, mesmo com 200 tentativas', window.SIFI.canvasMolecules.length <= 90);

  // Empacotamento hexagonal no limite da distância de colisão real
  // (~49px) — o agrupamento mais apertado que a física já produziria,
  // sem forçar sobreposição artificial nenhuma.
  const mols = window.SIFI.canvasMolecules;
  const espacamento = 49;
  const cols = Math.ceil(Math.sqrt(mols.length));
  mols.forEach((m, i) => {
    const col = i % cols, lin = Math.floor(i / cols);
    m.x = 300 + col * espacamento + (lin % 2) * (espacamento / 2);
    m.y = 300 + lin * (espacamento * 0.87);
    m.dom.style.left = m.x + 'px'; m.dom.style.top = m.y + 'px';
  });
  window.SIFI.updateForceDetection();

  chk('20.4 No pior caso FISICAMENTE realista (hexagonal), interações ficam abaixo de 1000', window.SIFI.interacoesAtivas.size < 1000);

  // Se, ainda assim, o painel apontar o teto de interações batido,
  // tentar adicionar mais uma deve ser recusado por ELE (não pelo de
  // moléculas, que nem chegou a ser atingido neste cenário).
  const totalAntes = window.SIFI.canvasMolecules.length;
  window.SIFI.addMoleculeToSandbox('BF3');
  if (window.SIFI.interacoesAtivas.size >= window.SIFI.MAX_INTERACOES_ATIVAS) {
    chk('20.5 No teto de interações, a próxima adição é recusada de verdade', window.SIFI.canvasMolecules.length === totalAntes);
  } else {
    chk('20.5 (não atingiu o teto de interações neste layout — dentro da capacidade, ok)', true);
  }
}

// ============================================================
// 21) MÓDULO 2 — ATIVAÇÃO E TROCA DE VISÃO (caixa de areia ↔ béquer)
// ============================================================
{
  const { window, document } = novaPagina();

  // 21.1 — ativar o Módulo 2 mostra o béquer e esconde a caixa de areia
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('21.1a Módulo 2 fica ativo', window.SIFI.activeModule === 2);
  chk('21.1b Béquer fica visível', !document.getElementById('beaker-wrapper').classList.contains('hidden'));
  chk('21.1c Caixa de areia fica escondida', document.getElementById('canvas-wrapper').classList.contains('hidden'));

  // 21.2 — painéis certos aparecem/somem na sidebar direita
  const painelBiblioteca = document.querySelector('[data-modulo="1"]');
  const painelLiquido = document.getElementById('hdr-termostato-liquido').closest('[data-modulo="2"]');
  chk('21.2a Painel do Módulo 1 (Biblioteca) fica escondido', painelBiblioteca.hidden === true);
  chk('21.2b Painel "Escolha o Líquido" (Módulo 2) fica visível', painelLiquido.hidden === false);

  // 21.3 — indicador de módulo mostra o nome certo
  chk('21.3 Indicador mostra "Termostato Molecular"', document.getElementById('module-indicator-text').textContent.includes('Termostato Molecular'));

  // 21.4 — voltar pro Módulo 1 desfaz tudo
  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('21.4a Caixa de areia volta a aparecer', !document.getElementById('canvas-wrapper').classList.contains('hidden'));
  chk('21.4b Béquer volta a ficar escondido', document.getElementById('beaker-wrapper').classList.contains('hidden'));
  chk('21.4c Painel da Biblioteca (Módulo 1) volta a aparecer', painelBiblioteca.hidden === false);
  chk('21.4d Painel "Escolha o Líquido" (Módulo 2) volta a esconder', painelLiquido.hidden === true);

  window.SIFI.stopTermostatoLoop();
  window.SIFI.stopSimLoop();
}

// ============================================================
// 22) MÓDULO 2 — ESCOLHER LÍQUIDO, PORTÃO DE ATIVAÇÃO, BÉQUER
// ============================================================
{
  const { window, document } = novaPagina();

  // 22.1 — sem o módulo ativo, escolher um líquido não funciona
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  chk('22.1 Sem o Módulo 2 ativo, escolher líquido não funciona', window.SIFI.termostato.substanciaKey === null);

  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 22.2 — lista de líquidos foi montada com as 34 substâncias
  chk('22.2 Lista de líquidos mostra as 42 substâncias (44 menos as 2 exclusivas do Módulo 3)', document.getElementById('termostato-lista-liquidos').children.length === 42);

  // 22.3 — escolher a água cria as partículas e atualiza a ficha
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  chk('22.3a Substância fica marcada no estado', window.SIFI.termostato.substanciaKey === 'H2O');
  chk('22.3b 40 partículas são criadas no béquer', window.SIFI.termostato.particulas.length === 40);
  chk('22.3g Cada partícula desenha a estrutura molecular real (SVG com átomos), não uma bolinha genérica',
    window.SIFI.termostato.particulas.every(p => p.dom.querySelector('svg.mol-card-svg') && p.dom.querySelectorAll('circle').length >= 1));
  chk('22.3h A água (H₂O) desenha os 2 átomos de hidrogênio + 1 de oxigênio (3 círculos)',
    window.SIFI.termostato.particulas[0].dom.querySelectorAll('circle').length === 3);
  chk('22.3c Todas nascem no estado líquido', window.SIFI.termostato.particulas.every(p => p.estado === 'liquido'));
  chk('22.3d Ficha mostra o nome certo', document.getElementById('termostato-substancia-nome').textContent.includes('Água'));
  chk('22.3e Ficha mostra o ponto de ebulição certo (100°C)', document.getElementById('termostato-pe').textContent.includes('100'));
  chk('22.3f Dica do béquer some depois de escolher', document.getElementById('beaker-hint').classList.contains('hidden'));

  // 22.4 — trocar de líquido troca as partículas (não acumula)
  window.SIFI.selecionarSubstanciaTermostato('HF');
  chk('22.4a Substância nova substitui a antiga', window.SIFI.termostato.substanciaKey === 'HF');
  chk('22.4b Continua com 40 partículas (não dobrou)', window.SIFI.termostato.particulas.length === 40);

  // 22.5 — esvaziar o béquer volta ao estado inicial
  window.SIFI.limparBequer();
  chk('22.5a Substância volta a null', window.SIFI.termostato.substanciaKey === null);
  chk('22.5b Nenhuma partícula sobra', window.SIFI.termostato.particulas.length === 0);
  chk('22.5c Dica do béquer volta a aparecer', !document.getElementById('beaker-hint').classList.contains('hidden'));

  window.SIFI.stopTermostatoLoop();
}

// ============================================================
// 23) MÓDULO 2 — FÍSICA: FERVURA E CONDENSAÇÃO NO PONTO REAL
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 23.1 — bem abaixo do ponto de ebulição da água (100°C), NINGUÉM evapora
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  window.SIFI.termostato.temperatura = 20;
  window.SIFI.termostato.rodando = true;
  for (let i = 0; i < 100; i++) window.SIFI.termostatoTick();
  chk('23.1 A 20°C (bem abaixo de 100°C), nenhuma molécula de água evapora', window.SIFI.termostato.particulas.every(p => p.estado === 'liquido'));

  // 23.2 — bem ACIMA do ponto de ebulição, várias evaporam com o tempo
  window.SIFI.termostato.temperatura = 140; // 40°C acima do PE da água
  for (let i = 0; i < 150; i++) window.SIFI.termostatoTick();
  const numGasAgua = window.SIFI.termostato.particulas.filter(p => p.estado === 'gas').length;
  chk('23.2 A 140°C (acima de 100°C), várias moléculas de água evaporam', numGasAgua > 0);

  // 23.3 — esfriar de novo permite condensar (pelo menos alguma volta)
  window.SIFI.termostato.temperatura = 20;
  for (let i = 0; i < 300; i++) window.SIFI.termostatoTick();
  const numGasDepoisDeEsfriar = window.SIFI.termostato.particulas.filter(p => p.estado === 'gas').length;
  chk('23.3 Esfriando de novo, o número de partículas em gás diminui (condensação)', numGasDepoisDeEsfriar < numGasAgua);

  // 23.4 — a nota "ligação covalente intacta" aparece só quando fervendo
  window.SIFI.selecionarSubstanciaTermostato('HF'); // reseta partículas
  window.SIFI.termostato.temperatura = 10; // abaixo do PE do HF (19.5°C)
  window.SIFI.atualizarStatusTexto();
  chk('23.4a Nota sobre ligação covalente escondida quando não está fervendo', document.getElementById('beaker-nota-covalente').hidden === true);
  window.SIFI.termostato.temperatura = 50; // acima do PE do HF
  window.SIFI.atualizarStatusTexto();
  chk('23.4b Nota sobre ligação covalente aparece quando está fervendo', document.getElementById('beaker-nota-covalente').hidden === false);

  window.SIFI.termostato.rodando = false;
}

// ============================================================
// 24) MÓDULO 2 — FUNÇÕES PURAS E GRÁFICO
// ============================================================
{
  const { window, document } = novaPagina();

  // 24.1 — chance de escapar é ZERO abaixo/na do ponto de ebulição
  chk('24.1a Chance de escapar é 0 abaixo do ponto de ebulição', window.SIFI.calcularChanceEscape(50, 100) === 0);
  chk('24.1b Chance de escapar é 0 EXATAMENTE no ponto de ebulição', window.SIFI.calcularChanceEscape(100, 100) === 0);
  chk('24.1c Chance de escapar é maior que 0 acima do ponto de ebulição', window.SIFI.calcularChanceEscape(110, 100) > 0);
  chk('24.1d Quanto mais quente acima do PE, maior a chance de escapar', window.SIFI.calcularChanceEscape(150, 100) > window.SIFI.calcularChanceEscape(110, 100));

  // 24.2 — chance de condensar é ZERO acima/na do ponto de ebulição
  chk('24.2a Chance de condensar é 0 acima do ponto de ebulição', window.SIFI.calcularChanceCondensa(150, 100) === 0);
  chk('24.2b Chance de condensar cresce quanto mais frio', window.SIFI.calcularChanceCondensa(-50, 100) > window.SIFI.calcularChanceCondensa(50, 100));

  // 24.3 — amplitude térmica cresce com a temperatura
  chk('24.3 Amplitude do movimento é maior em temperatura mais alta', window.SIFI.calcularAmplitudeTermica(100) > window.SIFI.calcularAmplitudeTermica(-100));

  // 24.4 — gráfico: vazio sem substância, preenchido depois de girar o termostato
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));
  const svg = document.getElementById('termostato-grafico');
  chk('24.4a Gráfico mostra texto vazio sem substância escolhida', svg.querySelector('.termostato-grafico-vazio') !== null);

  window.SIFI.selecionarSubstanciaTermostato('CH3OH');
  window.SIFI.termostato.rodando = true;
  for (let i = 0; i < 40; i++) window.SIFI.termostatoTick(); // gera pontos suficientes no histórico
  chk('24.4b Histórico ganhou pontos', window.SIFI.termostato.historico.length > 0);
  chk('24.4c Gráfico desenhou a linha da temperatura', svg.querySelector('.termostato-grafico-linha') !== null);
  chk('24.4d Gráfico desenhou a linha do ponto de ebulição', svg.querySelector('.termostato-grafico-pe') !== null);

  window.SIFI.termostato.rodando = false;
  window.SIFI.stopTermostatoLoop();
}

// ============================================================
// 25) MÓDULO 2 — ESTADO SÓLIDO: NASCE NO ESTADO CERTO PARA A TEMPERATURA
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 25.1 — água bem fria (-10°C, abaixo do PF de 0°C) nasce SÓLIDA
  window.SIFI.termostato.temperatura = -10;
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  chk('25.1a Água a -10°C nasce toda sólida', window.SIFI.termostato.particulas.every(p => p.estado === 'solido'));
  chk('25.1b Ficha da ficha marca a classe visual de sólido', document.querySelectorAll('.termostato-particula--solido').length === 40);

  // 25.2 — mesma água, agora a 20°C (entre PF e PE), nasce LÍQUIDA
  window.SIFI.termostato.temperatura = 20;
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  chk('25.2 Água a 20°C nasce toda líquida', window.SIFI.termostato.particulas.every(p => p.estado === 'liquido'));

  // 25.3 — mesma água, agora a 150°C (acima do PE), nasce GASOSA
  window.SIFI.termostato.temperatura = 150;
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  chk('25.3 Água a 150°C nasce toda gasosa', window.SIFI.termostato.particulas.every(p => p.estado === 'gas'));

  // 25.4 — partículas sólidas ficam em posições de grade DISTINTAS
  // (não empilhadas todas no mesmo ponto)
  window.SIFI.termostato.temperatura = -50;
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  const posicoes = new Set(window.SIFI.termostato.particulas.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`));
  chk('25.4 As 40 posições de grade são todas diferentes entre si', posicoes.size === 40);
}

// ============================================================
// 26) MÓDULO 2 — FUSÃO E SOLIDIFICAÇÃO DE VERDADE (não só nascimento)
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 26.1 — água sólida (-20°C), esquenta pra 20°C: deve derreter com o tempo
  window.SIFI.termostato.temperatura = -20;
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  chk('26.1a Começa toda sólida', window.SIFI.termostato.particulas.every(p => p.estado === 'solido'));

  window.SIFI.termostato.temperatura = 20; // acima do PF (0°C), abaixo do PE
  window.SIFI.termostato.rodando = true;
  for (let i = 0; i < 200; i++) window.SIFI.termostatoTick();
  const numLiquidoDepoisDeEsquentar = window.SIFI.termostato.particulas.filter(p => p.estado === 'liquido').length;
  chk('26.1b Depois de esquentar acima do PF, várias moléculas derretem', numLiquidoDepoisDeEsquentar > 0);

  // 26.2 — as que derreteram, esfriando bem abaixo do PF de novo, voltam a solidificar
  window.SIFI.termostato.temperatura = -30;
  for (let i = 0; i < 300; i++) window.SIFI.termostatoTick();
  const numSolidoDepoisDeEsfriar = window.SIFI.termostato.particulas.filter(p => p.estado === 'solido').length;
  chk('26.2 Esfriando bem abaixo do PF de novo, várias voltam a solidificar', numSolidoDepoisDeEsfriar > 0);

  window.SIFI.termostato.rodando = false;
}

// ============================================================
// 27) MÓDULO 2 — CASOS ESPECIAIS: SUBLIMAÇÃO (CO₂/SF₆) E HÉLIO
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));

  // 27.1 — CO₂ frio nasce sólido, nunca líquido (sublima: true)
  window.SIFI.termostato.temperatura = -150;
  window.SIFI.selecionarSubstanciaTermostato('CO2');
  chk('27.1a CO₂ frio nasce sólido (não líquido)', window.SIFI.termostato.particulas.every(p => p.estado === 'solido'));

  // 27.2 — esquentando o CO₂ até acima do "ponto de ebulição" dele
  // (-78,5°C, que na prática é o ponto de sublimação), vira GÁS direto,
  // nunca passando por líquido em nenhum momento do processo.
  window.SIFI.termostato.temperatura = -40; // bem acima de -78.5
  window.SIFI.termostato.rodando = true;
  let passouPorLiquidoAlgumaVez = false;
  for (let i = 0; i < 300; i++) {
    window.SIFI.termostatoTick();
    if (window.SIFI.termostato.particulas.some(p => p.estado === 'liquido')) passouPorLiquidoAlgumaVez = true;
  }
  const numGasCO2 = window.SIFI.termostato.particulas.filter(p => p.estado === 'gas').length;
  chk('27.2a CO₂ aquecido gera partículas em gás', numGasCO2 > 0);
  chk('27.2b Em NENHUM momento o CO₂ passou pelo estado líquido (sublima de verdade)', !passouPorLiquidoAlgumaVez);
  window.SIFI.termostato.rodando = false;

  // 27.3 — Hélio: mesmo extremamente frio, NUNCA nasce sólido.
  window.SIFI.termostato.temperatura = -270; // quase o zero absoluto
  window.SIFI.selecionarSubstanciaTermostato('He');
  chk('27.3 Hélio a -270°C ainda nasce líquido, nunca sólido', window.SIFI.termostato.particulas.every(p => p.estado === 'liquido'));

  // 27.4 — e continua nunca solidificando mesmo rodando a física por um tempo.
  window.SIFI.termostato.rodando = true;
  for (let i = 0; i < 200; i++) window.SIFI.termostatoTick();
  chk('27.4 Hélio continua sem nenhuma partícula sólida depois de rodar a física', window.SIFI.termostato.particulas.every(p => p.estado !== 'solido'));
  window.SIFI.termostato.rodando = false;
}

// ============================================================
// 28) MÓDULO 2 — FUNÇÕES PURAS DE FUSÃO/SOLIDIFICAÇÃO E GRÁFICO
// ============================================================
{
  const { window, document } = novaPagina();

  // 28.1 — chance de fundir é 0 abaixo/no ponto de fusão, cresce acima
  chk('28.1a Chance de fundir é 0 abaixo do ponto de fusão', window.SIFI.calcularChanceFusao(-10, 0) === 0);
  chk('28.1b Chance de fundir é 0 EXATAMENTE no ponto de fusão', window.SIFI.calcularChanceFusao(0, 0) === 0);
  chk('28.1c Chance de fundir é maior que 0 acima do ponto de fusão', window.SIFI.calcularChanceFusao(10, 0) > 0);

  // 28.2 — chance de solidificar é 0 acima/no ponto de fusão, cresce abaixo
  chk('28.2a Chance de solidificar é 0 acima do ponto de fusão', window.SIFI.calcularChanceSolidificacao(10, 0) === 0);
  chk('28.2b Chance de solidificar cresce quanto mais frio', window.SIFI.calcularChanceSolidificacao(-50, 0) > window.SIFI.calcularChanceSolidificacao(-5, 0));

  // 28.3 — a grade de posições sempre fica dentro dos limites do béquer (0-100%)
  const posicoes = [];
  for (let i = 0; i < 40; i++) posicoes.push(window.SIFI.calcularPosicaoGrade(i, 40));
  chk('28.3 Todas as posições de grade ficam dentro de 0–100%', posicoes.every(p => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100));

  // 28.4 — o gráfico desenha as DUAS linhas (fusão e ebulição) quando a
  // substância tem as duas, mas só UMA (ebulição) para o Hélio.
  document.getElementById('btn-modulo-2').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.selecionarSubstanciaTermostato('H2O');
  window.SIFI.termostato.rodando = true;
  for (let i = 0; i < 20; i++) window.SIFI.termostatoTick();
  const svg = document.getElementById('termostato-grafico');
  chk('28.4a Água: gráfico desenha a linha do ponto de ebulição', !!svg.querySelector('.termostato-grafico-pe'));
  chk('28.4b Água: gráfico desenha TAMBÉM a linha do ponto de fusão', !!svg.querySelector('.termostato-grafico-pf'));

  window.SIFI.selecionarSubstanciaTermostato('He');
  for (let i = 0; i < 20; i++) window.SIFI.termostatoTick();
  chk('28.4c Hélio: gráfico desenha a linha de ebulição', !!svg.querySelector('.termostato-grafico-pe'));
  chk('28.4d Hélio: gráfico NÃO desenha linha de fusão (ele não tem uma)', !svg.querySelector('.termostato-grafico-pf'));

  window.SIFI.termostato.rodando = false;
  window.SIFI.stopTermostatoLoop();
}

// ============================================================
// 29) MÓDULO 3 — ATIVAÇÃO CRIA 2 TUBOS, TROCA DE VISÃO
// ============================================================
{
  const { window, document } = novaPagina();

  chk('29.0 Antes de ativar o módulo, nenhum tubo existe ainda', window.SIFI.laboratorio.tubos.length === 0);

  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('29.1a Módulo 3 fica ativo', window.SIFI.activeModule === 3);
  chk('29.1b Tubos ficam visíveis', !document.getElementById('lab-wrapper').classList.contains('hidden'));
  chk('29.1c Caixa de areia fica escondida', document.getElementById('canvas-wrapper').classList.contains('hidden'));
  chk('29.1d Béquer fica escondido', document.getElementById('beaker-wrapper').classList.contains('hidden'));
  chk('29.1e Ativar o módulo cria exatamente 2 tubos (o padrão pedido)', window.SIFI.laboratorio.tubos.length === 2);
  chk('29.1f Os 2 tubos realmente existem no DOM', document.getElementById('lab-tubos').children.length === 2);

  const painelPrateleira = document.getElementById('hdr-prateleira').closest('[data-modulo="3"]');
  chk('29.2 Painel "Prateleira de Reagentes" (Módulo 3) fica visível', painelPrateleira.hidden === false);
  chk('29.3 Indicador mostra "Laboratório de Solubilidade"', document.getElementById('module-indicator-text').textContent.includes('Laboratório de Solubilidade'));

  document.getElementById('btn-modulo-1').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('29.4a Tubos voltam a ficar escondidos ao trocar de módulo', document.getElementById('lab-wrapper').classList.contains('hidden'));
  chk('29.4b Painel da prateleira volta a esconder', painelPrateleira.hidden === true);
  chk('29.4c Trocar de módulo remove os tubos antigos (não acumula)', window.SIFI.laboratorio.tubos.length === 0);

  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('29.5 Reativar o Módulo 3 cria 2 tubos frescos de novo', window.SIFI.laboratorio.tubos.length === 2);

  window.SIFI.stopSimLoop();
  window.SIFI.stopLabLoop();
}

// ============================================================
// 30) MÓDULO 3 — ADICIONAR/REMOVER TUBOS (até 10, nunca menos que 1)
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));

  chk('30.1 Começa com 2 tubos', window.SIFI.laboratorio.tubos.length === 2);

  for (let i = 0; i < 20; i++) window.SIFI.adicionarTubo();
  chk('30.2 Nunca passa de 10 tubos, mesmo tentando adicionar 20 vezes', window.SIFI.laboratorio.tubos.length === 10);
  chk('30.3 O botão "Adicionar tubo" fica desabilitado no teto', document.getElementById('btn-adicionar-tubo').disabled === true);

  const idParaRemover = window.SIFI.laboratorio.tubos[5].id;
  window.SIFI.removerTubo(idParaRemover);
  chk('30.4 Remover um tubo funciona (10 → 9)', window.SIFI.laboratorio.tubos.length === 9);
  chk('30.5 O botão "Adicionar tubo" libera de novo, fora do teto', document.getElementById('btn-adicionar-tubo').disabled === false);
  chk('30.6 O tubo removido específico não existe mais na lista', !window.SIFI.laboratorio.tubos.some(t => t.id === idParaRemover));

  while (window.SIFI.laboratorio.tubos.length > 1) {
    window.SIFI.removerTubo(window.SIFI.laboratorio.tubos[0].id);
  }
  chk('30.7 Consegue remover até sobrar só 1 tubo', window.SIFI.laboratorio.tubos.length === 1);
  const idUltimo = window.SIFI.laboratorio.tubos[0].id;
  window.SIFI.removerTubo(idUltimo);
  chk('30.8 NUNCA remove o último tubo — sempre sobra pelo menos 1', window.SIFI.laboratorio.tubos.length === 1);

  window.SIFI.adicionarTubo();
  const tuboA = window.SIFI.laboratorio.tubos[0].id, tuboB = window.SIFI.laboratorio.tubos[1].id;
  window.SIFI.selecionarTubo(tuboA);
  window.SIFI.removerTubo(tuboA);
  chk('30.9 Remover o tubo ATIVO seleciona outro automaticamente', window.SIFI.laboratorio.tuboAtivo === tuboB);

  window.SIFI.stopLabLoop();
}

// ============================================================
// 31) MÓDULO 3 — PRATELEIRA COM 17 REAGENTES, REGRAS DE PREENCHIMENTO
// ============================================================
{
  const { window, document } = novaPagina();

  window.SIFI.adicionarReagenteAoTubo('H2O');
  chk('31.1 Sem o Módulo 3 ativo, adicionar reagente não funciona (nenhum tubo existe ainda)', window.SIFI.laboratorio.tubos.length === 0);

  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  chk('31.2 Prateleira mostra os 17 reagentes', document.getElementById('prateleira-lista').children.length === 17);

  window.SIFI.adicionarReagenteAoTubo('I2');
  chk('31.3 Tentar começar um tubo com sólido (Iodo) é recusado', window.SIFI.laboratorio.tubos[0].substancias.length === 0);

  window.SIFI.adicionarReagenteAoTubo('H2O');
  chk('31.4 Água (líquida) entra normalmente como primeira substância', window.SIFI.laboratorio.tubos[0].substancias[0] === 'H2O');

  ['C2H5OH', 'CH3OH', 'C3H6O', 'HCOOH'].forEach(k => window.SIFI.adicionarReagenteAoTubo(k));
  chk('31.5 Tubo aceita até 5 substâncias diferentes', window.SIFI.laboratorio.tubos[0].substancias.length === 5);

  window.SIFI.adicionarReagenteAoTubo('C6H14');
  chk('31.6 Uma 6ª substância é recusada — o teto de 5 é respeitado', window.SIFI.laboratorio.tubos[0].substancias.length === 5);

  const totalAntes = window.SIFI.laboratorio.tubos[0].substancias.length;
  window.SIFI.adicionarReagenteAoTubo('H2O');
  chk('31.7 Adicionar a mesma substância duas vezes é recusado', window.SIFI.laboratorio.tubos[0].substancias.length === totalAntes);

  window.SIFI.stopLabLoop();
}

// ============================================================
// 32) MÓDULO 3 — REGRA CENTRAL (saoCompativeis) E AGRUPAMENTO EM FASES
// ============================================================
{
  const { window } = novaPagina();
  const agua = { polaridade: 9.0 }, oleo = { polaridade: 0.2 }, alcool = { polaridade: 4.3 };
  const iodo = { polaridade: 0 }, hexano = { polaridade: 0.1 };
  const sal = { polaridade: 10 };
  const acetona = { polaridade: 5.1 };

  chk('32.1 Água + Óleo são INCOMPATÍVEIS (diferença 8,8)', window.SIFI.saoCompativeis(agua, oleo) === false);
  chk('32.2 Água + Álcool são COMPATÍVEIS (diferença 4,7)', window.SIFI.saoCompativeis(agua, alcool) === true);
  chk('32.3 Iodo + Hexano são COMPATÍVEIS (diferença 0,1)', window.SIFI.saoCompativeis(iodo, hexano) === true);
  chk('32.4 Sal + Água são COMPATÍVEIS (diferença 1,0)', window.SIFI.saoCompativeis(sal, agua) === true);
  chk('32.5 Acetona + Água E Acetona + Hexano são AMBOS compatíveis (o "solvente versátil")',
    window.SIFI.saoCompativeis(acetona, agua) === true && window.SIFI.saoCompativeis(acetona, hexano) === true);

  const grupoPolar = [{ polaridade: 9.0 }, { polaridade: 4.3 }, { polaridade: 5.1 }];
  const fasesPolar = window.SIFI.agruparPorFase(grupoPolar);
  chk('32.6 Três substâncias mutuamente próximas viram 1 fase só', fasesPolar.length === 1);

  const grupoMisto = [{ polaridade: 9.0 }, { polaridade: 0.1 }];
  const fasesMisto = window.SIFI.agruparPorFase(grupoMisto);
  chk('32.7 Duas substâncias bem distantes em polaridade viram 2 fases', fasesMisto.length === 2);

  chk('32.8 agruparPorFase de uma lista vazia retorna lista vazia (sem erro)', window.SIFI.agruparPorFase([]).length === 0);
}

// ============================================================
// 33) MÓDULO 3 — ÁGUA + ÓLEO: 2 FASES, CAMADAS POR DENSIDADE
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.adicionarReagenteAoTubo('H2O');
  window.SIFI.adicionarReagenteAoTubo('Oleo');

  const tubo = window.SIFI.laboratorio.tubos[0];
  chk('33.1 Água + Óleo formam 2 fases (não uma mistura)', tubo.fases.length === 2);
  chk('33.2 Texto de status descreve 2 camadas separadas', document.getElementById('tubo-status-texto').textContent.includes('2 camadas'));

  window.SIFI.laboratorio.rodando = true;
  for (let i = 0; i < 150; i++) window.SIFI.labTick();

  const aguaY = tubo.particulas.filter(p => p.substanciaKey === 'H2O').map(p => p.y);
  const oleoY = tubo.particulas.filter(p => p.substanciaKey === 'Oleo').map(p => p.y);
  const mediaAgua = aguaY.reduce((a, b) => a + b, 0) / aguaY.length;
  const mediaOleo = oleoY.reduce((a, b) => a + b, 0) / oleoY.length;
  chk('33.3 Água (mais densa) fica mais embaixo que o Óleo (menos denso)', mediaAgua > mediaOleo);

  window.SIFI.stopLabLoop();
}

// ============================================================
// 34) MÓDULO 3 — TRÊS SUBSTÂNCIAS POLARES: 1 FASE SÓ (N>2 de verdade)
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.adicionarReagenteAoTubo('H2O');
  window.SIFI.adicionarReagenteAoTubo('C2H5OH');
  window.SIFI.adicionarReagenteAoTubo('C3H6O');

  const tubo = window.SIFI.laboratorio.tubos[0];
  chk('34.1 Três substâncias no mesmo tubo', tubo.substancias.length === 3);
  chk('34.2 As três formam 1 fase só (mistura homogênea de verdade, N>2)', tubo.fases.length === 1);
  chk('34.3 Texto de status descreve mistura homogênea', document.getElementById('tubo-status-texto').textContent.includes('homogênea'));

  window.SIFI.laboratorio.rodando = true;
  for (let i = 0; i < 150; i++) window.SIFI.labTick();

  const aguaY = tubo.particulas.filter(p => p.substanciaKey === 'H2O').map(p => p.y);
  const faixaAgua = Math.max(...aguaY) - Math.min(...aguaY);
  chk('34.4 Água se espalha livremente pelo tubo inteiro (faixa ampla)', faixaAgua > 40);

  window.SIFI.stopLabLoop();
}

// ============================================================
// 35) MÓDULO 3 — O DESAFIO DO IODO: dissolve em hexano, não em água
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));

  window.SIFI.selecionarTubo(window.SIFI.laboratorio.tubos[0].id);
  window.SIFI.adicionarReagenteAoTubo('H2O');
  window.SIFI.adicionarReagenteAoTubo('I2');

  window.SIFI.selecionarTubo(window.SIFI.laboratorio.tubos[1].id);
  window.SIFI.adicionarReagenteAoTubo('C6H14');
  window.SIFI.adicionarReagenteAoTubo('I2');

  window.SIFI.laboratorio.rodando = true;
  for (let i = 0; i < 400; i++) window.SIFI.labTick();

  const tubo1 = window.SIFI.laboratorio.tubos[0];
  const tubo2 = window.SIFI.laboratorio.tubos[1];
  const iodoTubo1 = tubo1.particulas.filter(p => p.substanciaKey === 'I2');
  const iodoTubo2 = tubo2.particulas.filter(p => p.substanciaKey === 'I2');
  chk('35.1 Iodo em ÁGUA continua 100% em cristal — não dissolve', iodoTubo1.every(p => p.estadoNoTubo === 'presa'));
  chk('35.2 Iodo em HEXANO dissolveu (pelo menos uma partícula saiu do cristal)', iodoTubo2.some(p => p.estadoNoTubo === 'livre'));

  window.SIFI.stopLabLoop();
}

// ============================================================
// 36) MÓDULO 3 — SAL EM ÁGUA: dissolve E se separa em ÍONS
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.adicionarReagenteAoTubo('H2O');
  window.SIFI.adicionarReagenteAoTubo('NaCl');

  const tubo = window.SIFI.laboratorio.tubos[0];
  chk('36.1 Sal + Água formam 1 fase (compatíveis)', tubo.fases.length === 1);

  const totalSalAntes = tubo.particulas.filter(p => p.substanciaKey === 'NaCl').length;
  chk('36.2 Começa com pares Na-Cl intactos (nenhum separado ainda)',
    totalSalAntes === window.SIFI.LAB_PARTICULAS_POR_SUBSTANCIA && tubo.particulas.filter(p => p.ionDe).length === 0);

  window.SIFI.laboratorio.rodando = true;
  for (let i = 0; i < 400; i++) window.SIFI.labTick();

  const ionsDepois = tubo.particulas.filter(p => p.ionDe);
  chk('36.3 Depois de dissolver, existem partículas marcadas como ÍONS separados', ionsDepois.length > 0);
  chk('36.4 O número de partículas de sal DOBROU (cada par virou 2 íons)', tubo.particulas.filter(p => p.substanciaKey === 'NaCl').length === totalSalAntes * 2);
  chk('36.5 Existem íons de Na e íons de Cl (os dois tipos)', ionsDepois.some(p => p.ionDe === 'Na') && ionsDepois.some(p => p.ionDe === 'Cl'));

  window.SIFI.stopLabLoop();
}

// ============================================================
// 37) MÓDULO 3 — LIMPAR UM TUBO NÃO AFETA OS OUTROS (e não o remove)
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));

  const [t1, t2] = window.SIFI.laboratorio.tubos;
  window.SIFI.selecionarTubo(t1.id);
  window.SIFI.adicionarReagenteAoTubo('H2O');
  window.SIFI.adicionarReagenteAoTubo('I2');

  window.SIFI.selecionarTubo(t2.id);
  window.SIFI.adicionarReagenteAoTubo('C6H14');

  window.SIFI.limparTubo(t2.id);
  chk('37.1 Limpar o Tubo 2 esvazia só ele', t2.substancias.length === 0);
  chk('37.2 Tubo 1 continua intocado (água + iodo)', t1.substancias.length === 2 && t1.substancias.includes('H2O') && t1.substancias.includes('I2'));
  chk('37.3 Limpar um tubo NÃO remove ele do laboratório (continua existindo)', window.SIFI.laboratorio.tubos.length === 2);

  window.SIFI.stopLabLoop();
}

// ============================================================
// 38) ACESSIBILIDADE — LÊ E APLICA AS PREFERÊNCIAS DA CENTRAL
//     (js/a11y/preferencias.js) — o bug relatado: depois de integrar
//     com a central, o SIFI carregava `../a11y.js` mas não tinha
//     NENHUM script que lesse `window.A11Y.estado` e aplicasse no
//     <body>. Sem `preferencias.js`, os filtros de daltonismo, o
//     alto contraste, o tema claro e a leitura simples ficavam todos
//     mudos, mesmo com a central mandando o valor certo.
// ============================================================
{
  // 38.1 — Central presente, tema claro + alto contraste + leitura simples.
  const { window, document, errors } = novaPaginaComA11Y({
    theme: 'light', contrast: true, reading: 'on', colorblind: 'none', fontScale: 1,
  });
  chk('38.1a Nenhum erro de JS ao processar as preferências da central', errors.length === 0);
  chk('38.1b Tema claro da central é aplicado (body.light-mode)', document.body.classList.contains('light-mode'));
  chk('38.1c Alto contraste da central é aplicado (body.high-contrast)', document.body.classList.contains('high-contrast'));
  chk('38.1d Leitura simples da central é aplicada (body.simple-read)', document.body.classList.contains('simple-read'));

  // 38.2 — Daltonismo: o filtro SVG certo é ligado no overlay.
  const { document: doc2 } = novaPaginaComA11Y({
    theme: 'dark', contrast: false, reading: 'off', colorblind: 'deuteranopia', fontScale: 1,
  });
  const overlay = doc2.getElementById('colorblindOverlay');
  chk('38.2a Overlay de daltonismo (colorblindOverlay) existe no DOM', !!overlay);
  chk('38.2b O filtro certo (deuteranopia) é aplicado no overlay', overlay.style.backdropFilter.includes('f-deuteranopia'));
  chk('38.2c Os 4 filtros SVG de daltonismo (protanopia/deuteranopia/tritanopia/acromatopsia) existem no HTML', ['f-protanopia', 'f-deuteranopia', 'f-tritanopia', 'f-acromatopsia'].every(id => !!doc2.getElementById(id)));

  // 38.3 — Escala de fonte: aplicada na variável CSS --font-scale.
  const { document: doc3 } = novaPaginaComA11Y({
    theme: 'dark', contrast: false, reading: 'off', colorblind: 'none', fontScale: 1.3,
  });
  chk('38.3 Escala de fonte da central (1,3) vira a variável --font-scale', doc3.documentElement.style.getPropertyValue('--font-scale') === '1.3');

  // 38.4 — Sem a central presente (cenário real de abrir o SIFI
  // isolado, sem `../a11y.js`), cai no padrão — tema escuro, sem
  // nenhum filtro ligado — sem quebrar nem lançar erro nenhum.
  const { document: doc4, errors: errors4 } = novaPagina();
  chk('38.4a Sem a central, nenhum erro de JS acontece (cai no padrão de boa)', errors4.length === 0);
  chk('38.4b Sem a central, o padrão é tema escuro (sem light-mode)', !doc4.body.classList.contains('light-mode'));
  chk('38.4c Sem a central, alto contraste começa desligado', !doc4.body.classList.contains('high-contrast'));

  // 38.5 — Atualização AO VIVO por mensagem da Central (o usuário muda
  // uma preferência lá enquanto o SIFI já está aberto, sem precisar
  // recarregar a página). Usa dispatchEvent com um MessageEvent
  // montado na mão em vez de window.postMessage() de propósito:
  // postMessage entrega de forma ASSÍNCRONA (até no jsdom), então um
  // teste síncrono checando o resultado logo em seguida sempre falharia
  // por timing, não por bug de verdade — dispatchEvent roda os
  // listeners na hora, sem essa fila.
  const { window: win5, document: doc5 } = novaPagina();
  chk('38.5a Antes da mensagem, tema continua escuro', !doc5.body.classList.contains('light-mode'));
  win5.dispatchEvent(new win5.MessageEvent('message', {
    data: { source: 'central-simuladores', type: 'a11y-update', payload: { theme: 'light', contrast: true } },
  }));
  chk('38.5b Depois da mensagem da central, tema claro é aplicado ao vivo', doc5.body.classList.contains('light-mode'));
  chk('38.5c Depois da mensagem da central, alto contraste é aplicado ao vivo', doc5.body.classList.contains('high-contrast'));

  // 38.6 — Mensagens de origem ERRADA (não a Central) são ignoradas —
  // não dá pra qualquer site injetar preferências no SIFI de fora.
  const { window: win6, document: doc6 } = novaPagina();
  win6.dispatchEvent(new win6.MessageEvent('message', {
    data: { source: 'site-qualquer', type: 'a11y-update', payload: { theme: 'light' } },
  }));
  chk('38.6 Mensagem de origem que não é a Central é ignorada (continua tema escuro)', !doc6.body.classList.contains('light-mode'));
}

// ============================================================
// 39) MÓDULO 3 — TUBOS ENCOLHEM PRA CABER, EM VEZ DE ROLAR
//     (SIFI.calcularLayoutTubos — a correção pro problema relatado:
//     em telas pequenas com muitos tubos, aparecia barra de rolagem
//     em vez dos tubos diminuírem de tamanho pra caber todos).
// ============================================================
{
  const { window } = novaPagina();

  // 39.1 — com poucos tubos e bastante espaço, fica no tamanho MÁXIMO
  // (nunca cresce além do original, só encolhe quando precisa).
  const poucosTubos = window.SIFI.calcularLayoutTubos(2, 900, 600);
  chk('39.1 Com espaço de sobra, 2 tubos ficam no tamanho máximo (120px)', poucosTubos.largura === window.SIFI.TUBO_LARGURA_MAX);

  // 39.2 — O CENÁRIO EXATO relatado: janela estreita (~700px de
  // largura útil), 8 tubos. No tamanho fixo antigo (120px cada),
  // 8 tubos em 4 colunas precisariam de 2 linhas de 260px de altura
  // = mais de 600px só de tubo, sem nem contar cabeçalho/legenda —
  // não cabia, e por isso a barra de rolagem aparecia. Com o cálculo
  // novo, o resultado tem que ser MENOR que o máximo (120px).
  const oitoTubos = window.SIFI.calcularLayoutTubos(8, 700, 480);
  chk('39.2a Com 8 tubos num espaço apertado, o tamanho encolhe (< 120px)', oitoTubos.largura < window.SIFI.TUBO_LARGURA_MAX);
  chk('39.2b O tamanho nunca fica menor que o mínimo legível (46px)', oitoTubos.largura >= window.SIFI.TUBO_LARGURA_MIN);

  // 39.3 — confirma que o resultado REALMENTE cabe no espaço, fazendo
  // a mesma conta que o CSS faria de verdade (largura total das
  // colunas escolhidas, e altura total das linhas necessárias).
  const gap = 14;
  const colunas = oitoTubos.colunas;
  const linhas = Math.ceil(8 / colunas);
  const alturaTubo = oitoTubos.largura / window.SIFI.TUBO_ASPECT;
  const larguraTotal = colunas * oitoTubos.largura + (colunas - 1) * gap;
  const alturaTotal = linhas * (alturaTubo + window.SIFI.TUBO_ALTURA_EXTRA) + (linhas - 1) * gap;
  chk('39.3a A largura total calculada cabe no espaço disponível (700px)', larguraTotal <= 700 + 1); // +1 de folga de arredondamento
  chk('39.3b A altura total calculada cabe no espaço disponível (480px)', alturaTotal <= 480 + 1);

  // 39.4 — mais tubos ainda (o teto de 10) num espaço ainda mais
  // apertado (celular) — nunca deveria travar, nem retornar algo
  // negativo ou NaN.
  const dezTubosCelular = window.SIFI.calcularLayoutTubos(10, 360, 500);
  chk('39.4a Com 10 tubos num celular, o cálculo não trava nem retorna NaN', Number.isFinite(dezTubosCelular.largura));
  chk('39.4b O resultado continua dentro dos limites (mínimo/máximo)', dezTubosCelular.largura >= window.SIFI.TUBO_LARGURA_MIN && dezTubosCelular.largura <= window.SIFI.TUBO_LARGURA_MAX);

  // 39.5 — SIFI.atualizarTamanhoTubos aplica o resultado como
  // variáveis CSS de verdade no container, sem quebrar mesmo sem
  // medição real de layout disponível (o caso do jsdom, que sempre
  // retorna 0 em getBoundingClientRect — mesma situação de um
  // elemento ainda não visível na tela de verdade).
  const { window: win2, document: doc2 } = novaPagina();
  doc2.getElementById('btn-modulo-3').dispatchEvent(new win2.Event('click', { bubbles: true }));
  win2.SIFI.atualizarTamanhoTubos();
  const valorAplicado = win2.SIFI.labTubosContainer.style.getPropertyValue('--tubo-largura');
  chk('39.5 atualizarTamanhoTubos aplica --tubo-largura de verdade no container, sem travar', valorAplicado.endsWith('px'));
  win2.SIFI.stopLabLoop();

  // 39.6 — a regra CSS que fazia #canvas-wrapper esconder de verdade
  // (bug real: a classe `.hidden` era trocada certinho pelo JS, mas
  // sem NENHUM CSS reagindo a ela — "Ative o Módulo 1" continuava
  // visível com qualquer outro módulo ativo). jsdom não carrega os
  // arquivos CSS externos de verdade (falha de resolução file://), então
  // confere o conteúdo do arquivo entregue diretamente, mesmo padrão
  // já usado pras media queries do cabeçalho (grupo 16).
  const cssExtra = fs.readFileSync(path.join(__dirname, 'css/sifi-extra.css'), 'utf8');
  chk('39.6 CSS entregue tem a regra #canvas-wrapper.hidden{display:none} (antes faltava)', cssExtra.includes('#canvas-wrapper.hidden'));
}

// ============================================================
// 40) MÓDULO 3 — TERMOSTATO POR TUBO: cada um com sua própria temperatura
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));

  const [t1, t2] = window.SIFI.laboratorio.tubos;
  chk('40.1 Os dois tubos começam na mesma temperatura padrão (20°C)', t1.temperatura === 20 && t2.temperatura === 20);

  window.SIFI.selecionarTubo(t1.id);
  document.getElementById('tubo-temp-slider').value = '-50';
  document.getElementById('tubo-temp-slider').dispatchEvent(new window.Event('input', { bubbles: true }));
  chk('40.2a Mexer no slider muda a temperatura do tubo ATIVO', t1.temperatura === -50);
  chk('40.2b O outro tubo continua na temperatura dele, intocado', t2.temperatura === 20);

  window.SIFI.selecionarTubo(t2.id);
  chk('40.3 Trocar de tubo ativo mostra a temperatura DELE no slider', document.getElementById('tubo-temp-slider').value === '20');

  window.SIFI.stopLabLoop();
}

// ============================================================
// 41) MÓDULO 3 — CICLO COMPLETO: água congela, ferve, e condensa de
//     volta, só mudando a temperatura do tubo (mesma física do
//     Módulo 2, agora dentro de um tubo de ensaio).
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.adicionarReagenteAoTubo('H2O');
  const tubo = window.SIFI.laboratorio.tubos[0];
  window.SIFI.laboratorio.rodando = true;

  chk('41.1 Água a 20°C nasce toda líquida', tubo.particulas.every(p => p.estadoFisico === 'liquido'));

  tubo.temperatura = -20;
  for (let i = 0; i < 400; i++) window.SIFI.labTick();
  chk('41.2 Esfriando pra -20°C, toda a água congela', tubo.particulas.every(p => p.estadoFisico === 'solido'));

  tubo.temperatura = 150;
  for (let i = 0; i < 400; i++) window.SIFI.labTick();
  chk('41.3 Esquentando pra 150°C, toda a água vira gás', tubo.particulas.every(p => p.estadoFisico === 'gas'));

  tubo.temperatura = 20;
  for (let i = 0; i < 400; i++) window.SIFI.labTick();
  chk('41.4 Voltando pra 20°C, a água condensa de volta pra líquida', tubo.particulas.every(p => p.estadoFisico === 'liquido'));

  window.SIFI.stopLabLoop();
}

// ============================================================
// 42) MÓDULO 3 — CONTADOR sólido/líquido/gás POR TUBO (igual ao
//     Módulo 2), e os DOIS mecanismos (fusão por temperatura ×
//     dissolução por solubilidade) funcionando INDEPENDENTES no
//     mesmo tubo.
// ============================================================
{
  const { window, document } = novaPagina();
  document.getElementById('btn-modulo-3').dispatchEvent(new window.Event('click', { bubbles: true }));
  window.SIFI.adicionarReagenteAoTubo('H2O');
  window.SIFI.adicionarReagenteAoTubo('I2'); // apolar em água polar — não deveria dissolver por solubilidade
  const tubo = window.SIFI.laboratorio.tubos[0];
  window.SIFI.laboratorio.rodando = true;
  for (let i = 0; i < 300; i++) window.SIFI.labTick();

  const iodoAntes = tubo.particulas.filter(p => p.substanciaKey === 'I2');
  chk('42.1 Iodo em água a 20°C continua sólido e preso (não dissolve por solubilidade)', iodoAntes.every(p => p.estadoFisico === 'solido' && p.estadoNoTubo === 'presa'));

  // Contador reflete a mistura de estados do tubo (água líquida + iodo sólido).
  chk('42.2a Contador na tela mostra o sólido certo (10 partículas de iodo)', Number(document.getElementById('tubo-num-solido').textContent) === window.SIFI.LAB_PARTICULAS_POR_SUBSTANCIA);
  chk('42.2b Contador na tela mostra o líquido certo (10 partículas de água)', Number(document.getElementById('tubo-num-liquido').textContent) === window.SIFI.LAB_PARTICULAS_POR_SUBSTANCIA);

  // Aquece ACIMA do ponto de fusão do iodo (113,7°C) — o iodo derrete
  // por TEMPERATURA (mecanismo 1), mesmo continuando incompatível com
  // a água por SOLUBILIDADE (mecanismo 2) — os dois são independentes.
  tubo.temperatura = 120;
  for (let i = 0; i < 500; i++) window.SIFI.labTick();
  const iodoDepois = tubo.particulas.filter(p => p.substanciaKey === 'I2');
  chk('42.3 Acima do PF do iodo, ele derrete por TEMPERATURA (não por solubilidade)', iodoDepois.every(p => p.estadoFisico === 'liquido'));

  // O texto de status precisa ACOMPANHAR essa mudança sozinho, sem
  // precisar mexer no slider de novo (bug real corrigido: antes o
  // texto ficava "preso" na última leitura manual, não a transição
  // gradual que aconteceu nos ticks seguintes).
  chk('42.4 Texto de status acompanha a transição sozinho, sem precisar mexer no slider de novo', document.getElementById('tubo-status-texto').textContent.includes('Iodo líquida'));

  window.SIFI.stopLabLoop();
}

console.log('\n=== RESULTADO DOS TESTES ===');
let allOk = true;
for (const [label, ok] of checks) {
  console.log((ok ? 'OK    ' : 'FALHOU') + ' - ' + label);
  if (!ok) allOk = false;
}
console.log(`\n${checks.filter(c => c[1]).length}/${checks.length} passaram.`);
process.exit(allOk ? 0 : 1);
