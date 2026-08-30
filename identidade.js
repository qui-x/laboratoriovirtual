/* ================================================================
   identidade.js — ABRIR/FECHAR O PORTÃO DE LOGIN
   ================================================================
   Cuida do ciclo de vida da sessão: aplicar uma sessão nova (depois
   de login/cadastro), restaurar uma sessão salva ao abrir a página,
   e encerrar a sessão (local e no servidor).

   O <main id="conteudo"> só aparece depois de aplicarSessao(). O
   cabeçalho (marca + acessibilidade) NUNCA fica escondido — o botão
   de acessibilidade continua funcionando inclusive na tela de login,
   de propósito. Só a barra de identidade (nome/"Minha conta"/"Sair")
   liga e desliga junto com a sessão.
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

  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('conteudo').classList.remove('hidden');
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

  document.getElementById('conteudo').classList.add('hidden');
  document.getElementById('identity-bar').classList.add('hidden');
  document.getElementById('modal-nova-senha').classList.add('hidden');
  fecharModalConta();
  fecharModalAdmin();
  document.getElementById('auth-gate').classList.remove('hidden');
  mostrarAuthView('login');
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
    document.getElementById('auth-gate').classList.remove('hidden');
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
    document.getElementById('auth-gate').classList.add('hidden');
    document.getElementById('conteudo').classList.remove('hidden');
    aplicarPermissoesPapel();
    atualizarBarraIdentidade();
  } catch (erro) {
    console.error('Sessão salva não pôde ser restaurada:', erro);
    encerrarSessaoLocal();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarSessao);
} else {
  iniciarSessao();
}
