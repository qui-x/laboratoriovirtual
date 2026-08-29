/* ================================================================
   conta.js — "MINHA CONTA"
   ================================================================
   Modal aberto pelo botão "Minha conta" na barra de identidade.
   Mostra nome/e-mail/papel e o botão de solicitar troca de senha
   (disponível pra qualquer papel — o administrador vê um aviso
   diferente, porque o fluxo dele pra recuperar a própria senha é
   sair e usar "Esqueceu sua senha?" na tela de login).
   ================================================================ */

function abrirModalConta() {
  renderContaView();
  document.getElementById('modal-conta').classList.remove('hidden');
}

function fecharModalConta() {
  var modal = document.getElementById('modal-conta');
  if (modal) modal.classList.add('hidden');
}

function renderContaView() {
  if (!sessaoUsuario) return;

  var info = document.getElementById('conta-info');
  if (info) {
    info.innerHTML =
      '<div class="linha"><span class="rotulo">Nome</span><span>' + escaparHtml_(sessaoUsuario.nome) + '</span></div>' +
      '<div class="linha"><span class="rotulo">E-mail</span><span>' + escaparHtml_(sessaoUsuario.email) + '</span></div>' +
      '<div class="linha"><span class="rotulo">Papel</span><span class="role-badge ' + (souAdmin() ? 'admin' : '') + '">' + escaparHtml_(sessaoUsuario.papel) + '</span></div>';
  }

  document.getElementById('conta-membro-area').classList.toggle('hidden', souAdmin());
  document.getElementById('conta-admin-area').classList.toggle('hidden', !souAdmin());

  var status = document.getElementById('conta-reset-status');
  if (status) status.textContent = '';
  var botao = document.getElementById('solicitar-reset-btn');
  if (botao) { botao.disabled = false; botao.textContent = 'Solicitar nova senha'; }
}

async function handleSolicitarReset() {
  if (!sessaoUsuario) return;
  var botao = document.getElementById('solicitar-reset-btn');
  definirCarregando(botao, true, 'Solicitar nova senha');
  try {
    var resposta = await chamarAPI({ action: 'solicitarResetSenha', token: sessaoUsuario.token });
    if (!resposta.sucesso && tratarErroSessaoOuPermissao(resposta)) return;

    var status = document.getElementById('conta-reset-status');
    if (status) status.textContent = resposta.mensagem || resposta.erro || '';

    if (resposta.sucesso) {
      botao.disabled = true;
      botao.textContent = 'Solicitação enviada';
      return;
    }
  } catch (erro) {
    console.error(erro);
    var status2 = document.getElementById('conta-reset-status');
    if (status2) status2.textContent = 'Não foi possível conectar. Tente de novo.';
  }
  definirCarregando(botao, false, 'Solicitar nova senha');
}
