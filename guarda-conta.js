/* ================================================================
   guarda-conta.js — GUARDA DE SESSÃO DA PÁGINA "MINHA CONTA"
   ================================================================
   Só existe nesta página. index.html tem seu próprio portão
   (#auth-gate) cuidado por iniciarSessao() em identidade.js; aqui é
   mais simples — sem sessão válida, não tem o que mostrar, então só
   volta pra Central. Reaproveita CHAVE_TOKEN, chamarAPIGet() e
   renderContaView()/sessaoUsuario já carregados pelos scripts
   anteriores (config-api.js, identidade.js, conta.js).
   ================================================================ */

(async function guardaConta() {
  var tokenSalvo = null;
  try { tokenSalvo = localStorage.getItem(CHAVE_TOKEN); } catch (e) { /* sem localStorage: sem sessão possível */ }

  if (!tokenSalvo) {
    window.location.href = 'index.html';
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

    renderContaView();
    var main = document.getElementById('conteudo-conta');
    if (main) main.classList.remove('hidden');
  } catch (erro) {
    console.error('Sessão salva não pôde ser restaurada:', erro);
    window.location.href = 'index.html';
  }
})();
