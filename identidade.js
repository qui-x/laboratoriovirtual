/* ================================================================
   identidade.js — ABRIR/FECHAR O PORTÃO DE LOGIN
   ================================================================
   Cuida do ciclo de vida da sessão: aplicar uma sessão nova (depois
   de login/cadastro), restaurar uma sessão salva ao abrir a página,
   e encerrar a sessão (local e no servidor).

   O <main id="conteudo"> só aparece depois de aplicarSessao() — e o
   botão de menu (hambúrguer) segue o mesmo destino: ele dá acesso a
   conta, simuladores e acessibilidade, então só faz sentido DEPOIS
   do login (mostrar simuladores/conta pra quem ainda não entrou não
   faz sentido). Por isso #drawerToggle começa com o atributo hidden
   direto no HTML — falha "fechado": se o JS falhar, o botão nunca
   aparece antes da hora, em vez do contrário.
   ================================================================ */

var CHAVE_TOKEN = 'quimix_token'; // localStorage: sobrevive a F5, a trocar de aba e ao
                                   // navegador descartar a aba da memória (comum no Android
                                   // quando o app fica em segundo plano). Quem expira a
                                   // sessão de verdade é o servidor (VALIDADE_SESSAO_HORAS).

function aplicarSessao(dadosLogin) {
  sessaoUsuario = {
    token: dadosLogin.token,
    idUsuario: dadosLogin.idUsuario,
    nome: dadosLogin.nome,
    email: dadosLogin.email,
    papel: dadosLogin.papel
  };
  try { localStorage.setItem(CHAVE_TOKEN, dadosLogin.token); } catch (e) { /* modo privado: segue só na memória */ }

  var _ag = document.getElementById('auth-gate'); if (_ag) _ag.classList.add('hidden');
  var _ct = document.getElementById('conteudo'); if (_ct) _ct.classList.remove('hidden');
  mostrarMenuPrincipal();
  aplicarPermissoesPapel();
  atualizarBarraIdentidade();
}

async function handleLogout() {
  var token = sessaoUsuario ? sessaoUsuario.token : null;
  encerrarSessaoLocal();
  if (token) {
    try { await chamarAPI({ action: 'logout', token: token }); } catch (erro) { /* já saímos localmente, não precisa travar por isso */ }
  }
}

function encerrarSessaoLocal() {
  sessaoUsuario = null;
  usuariosCarregado = false;
  usuariosRoster = [];
  atividadeLog = [];
  try { localStorage.removeItem(CHAVE_TOKEN); } catch (e) { /* nada a fazer */ }

  var _ct2 = document.getElementById('conteudo'); if (_ct2) _ct2.classList.add('hidden');
  var _ib = document.getElementById('identity-bar'); if (_ib) _ib.classList.add('hidden');
  var _mns = document.getElementById('modal-nova-senha'); if (_mns) _mns.classList.add('hidden');
  if (typeof fecharModalConta === 'function') fecharModalConta();
  if (typeof fecharModalAdmin === 'function') fecharModalAdmin();
  esconderMenuPrincipal();

  // Páginas sem #auth-gate (hoje, só minha-conta.html) não têm como
  // "mostrar a tela de login de novo" no lugar — a tela de login só
  // existe na Central. Sem sessão, não há mais nada pra fazer aqui, então
  // volta pra lá (com os parâmetros de acessibilidade, via a11y.js).
  if (!document.getElementById('auth-gate')) {
    window.location.href = 'index.html';
    return;
  }
  var _ag2 = document.getElementById('auth-gate'); if (_ag2) _ag2.classList.remove('hidden');
  if (typeof mostrarAuthView === 'function') mostrarAuthView('login');
}

// Mostra/esconde o botão de menu (hambúrguer) e, ao esconder, garante
// que a gaveta não fique aberta por trás da tela de login caso o
// usuário saia com ela aberta. #drawerToggle/#appDrawer podem não
// existir ainda dependendo da ordem de carregamento dos scripts —
// por isso os elementos são buscados de novo aqui, sem cache.
function mostrarMenuPrincipal() {
  // O botão em si (#drawerToggle) fica SEMPRE visível, mesmo na tela
  // de login — é o único jeito de chegar em Acessibilidade antes de
  // entrar, e isso precisa continuar funcionando pra quem depende de
  // alto contraste/fonte maior só pra conseguir ler o formulário.
  // Só a parte de Conta+Simuladores (que não faz sentido pré-login)
  // liga/desliga aqui — ver #drawerAuthOnlySection no HTML.
  var authOnly = document.getElementById('drawerAuthOnlySection');
  if (authOnly) authOnly.hidden = false;
  // Aviso pra quem quiser reagir ao menu ficar disponível (hoje, só
  // o tour guiado da home — ver script.js) sem acoplar os dois
  // arquivos diretamente.
  window.dispatchEvent(new CustomEvent('quimix:menu-liberado'));
}
function esconderMenuPrincipal() {
  var authOnly = document.getElementById('drawerAuthOnlySection');
  var drawer = document.getElementById('appDrawer');
  var backdrop = document.getElementById('drawerBackdrop');
  if (drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
  if (backdrop) { backdrop.classList.remove('open'); backdrop.hidden = true; }
  if (authOnly) authOnly.hidden = true;
  var toggle = document.getElementById('drawerToggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

// Esconde/mostra tudo que tem [data-papel="administrador"] — hoje
// só o botão "Administração" do cabeçalho, mas serve pra qualquer
// coisa nova que precise ser admin-only no futuro.
function aplicarPermissoesPapel() {
  var admin = souAdmin();
  var elementos = document.querySelectorAll('[data-papel="administrador"]');
  for (var i = 0; i < elementos.length; i++) elementos[i].classList.toggle('hidden', !admin);
}

function atualizarBarraIdentidade() {
  if (!sessaoUsuario) return;
  var texto = document.getElementById('identity-status-texto');
  if (texto) texto.textContent = sessaoUsuario.nome;
  document.getElementById('identity-bar').classList.remove('hidden');
}

/* ---------------------------------------------------------------
   Ponto de entrada: roda ao carregar a página. Se houver um token
   salvo, confirma com o backend antes de confiar nele (o token pode
   ter expirado, ou a conta pode ter sido removida nesse meio-tempo).
   --------------------------------------------------------------- */
async function iniciarSessao() {
  var tokenSalvo = null;
  try { tokenSalvo = localStorage.getItem(CHAVE_TOKEN); } catch (e) { /* sem localStorage: segue pro login */ }

  if (!tokenSalvo) {
    var _ag3 = document.getElementById('auth-gate'); if (_ag3) _ag3.classList.remove('hidden');
    return;
  }

  try {
    var resposta = await chamarAPIGet({ action: 'verificarSessao', token: tokenSalvo });
    if (!resposta.sucesso) throw new Error(resposta.erro || 'Sessão inválida.');

    sessaoUsuario = {
      token: tokenSalvo,
      idUsuario: resposta.dados.idUsuario,
      nome: resposta.dados.nome,
      email: resposta.dados.email,
      papel: resposta.dados.papel
    };
    var _ag4 = document.getElementById('auth-gate'); if (_ag4) _ag4.classList.add('hidden');
    var _ct4 = document.getElementById('conteudo'); if (_ct4) _ct4.classList.remove('hidden');
    mostrarMenuPrincipal();
    aplicarPermissoesPapel();
    atualizarBarraIdentidade();
  } catch (erro) {
    console.error('Sessão salva não pôde ser restaurada:', erro);
    encerrarSessaoLocal();
  }
}

// Só dispara sozinho em páginas que TÊM #auth-gate (hoje, só a
// Central). minha-conta.html carrega este arquivo pelas funções
// compartilhadas (sessaoUsuario, aplicarPermissoesPapel etc.), mas
// tem sua PRÓPRIA guarda de sessão (ver guarda-conta.js) — sem esta
// checagem, os dois rodariam em paralelo, e iniciarSessao() ainda
// tentaria mexer num #auth-gate que não existe ali.
if (document.getElementById('auth-gate')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarSessao);
  } else {
    iniciarSessao();
  }
}
