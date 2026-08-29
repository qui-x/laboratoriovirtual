/* ================================================================
   Code.gs — BACKEND DE LOGIN DO QUÍMIX (Google Apps Script)
   ================================================================
   Este script fica DENTRO de uma Planilha Google (Extensões > Apps
   Script) e vira uma API quando publicado como "Web App". O front-end
   (config-api.js) fala com ele via fetch(), usando sempre um único
   parâmetro "action" pra dizer o que quer fazer.

   Veja LEIA-ME-LOGIN.md pro passo a passo de instalação.

   ----------------------------------------------------------------
   ABAS QUE ESTE SCRIPT USA (criadas automaticamente na 1ª execução
   de configurarPlanilha(), rodada uma vez manualmente pelo editor)
   ----------------------------------------------------------------
   Usuarios: idUsuario | nome | email | senhaHash | salt | papel |
             precisaTrocarSenha | resetPendente | tentativasLogin |
             bloqueadoAte | codigoTempExpiraEm | criadoEm

   Sessoes:  token | idUsuario | criadoEm | expiraEm

   Log:      dataHora | usuario | acao

   ----------------------------------------------------------------
   REGRAS DE NEGÓCIO QUE VALEM A PENA SABER
   ----------------------------------------------------------------
   • O PRIMEIRO usuário a se cadastrar vira "administrador" automati-
     camente. Todos os seguintes entram como "membro". Pra promover
     alguém depois, use o próprio painel de Administração (exige já
     ter 1 administrador) ou edite a coluna "papel" na planilha.

   • "Esqueci minha senha" (tela de login, sem estar logado) manda o
     código na hora, se o e-mail existir — sem revelar se existe ou
     não, pra não vazar quais e-mails têm conta.

   • "Solicitar nova senha" (dentro de "Minha conta", já logado) NÃO
     manda e-mail sozinho: só marca resetPendente=true. Um adminis-
     trador vê o pedido no painel e clica em "Enviar código" quando
     quiser liberar. É um pequeno freio manual, de propósito.

   • Senhas nunca ficam em texto puro: cada conta tem um "salt"
     (sal) próprio e a senha vira um hash SHA-256 salgado antes de
     ser gravada. O Apps Script não tem bcrypt/scrypt nativo — isso
     aqui é um meio-termo razoável pra um projeto desse porte, não
     o nível de um banco de dados de produção.
   ================================================================ */

/* ---------------------------------------------------------------
   0. CONFIGURAÇÃO — ajuste à vontade
   --------------------------------------------------------------- */
var NOME_SITE               = 'QuímiX';
var REMETENTE_NOME          = 'QuímiX — Laboratório Virtual';
var VALIDADE_SESSAO_DIAS    = 30;   // quanto tempo um token de login continua valendo
var VALIDADE_CODIGO_HORAS   = 24;   // quanto tempo um código temporário continua valendo
var MAX_TENTATIVAS_LOGIN    = 6;    // tentativas de senha erradas antes de bloquear a conta
var BLOQUEIO_MINUTOS        = 15;   // por quanto tempo a conta fica bloqueada


/* ---------------------------------------------------------------
   1. ROTEAMENTO HTTP
   --------------------------------------------------------------- */
function doGet(e) {
  return tratarRequisicao_((e && e.parameter) || {});
}

function doPost(e) {
  var dados = {};
  try {
    dados = JSON.parse(e.postData.contents);
  } catch (erro) {
    return responderJSON_({ sucesso: false, erro: 'Corpo da requisição inválido.' });
  }
  return tratarRequisicao_(dados);
}

function tratarRequisicao_(dados) {
  var acao = dados.action;
  try {
    switch (acao) {
      case 'login':               return responderJSON_(acaoLogin_(dados));
      case 'cadastrar':            return responderJSON_(acaoCadastrar_(dados));
      case 'esqueciSenha':         return responderJSON_(acaoEsqueciSenha_(dados));
      case 'definirNovaSenha':     return responderJSON_(acaoDefinirNovaSenha_(dados));
      case 'verificarSessao':      return responderJSON_(acaoVerificarSessao_(dados));
      case 'logout':               return responderJSON_(acaoLogout_(dados));
      case 'solicitarResetSenha':  return responderJSON_(acaoSolicitarResetSenha_(dados));
      case 'listarUsuarios':       return responderJSON_(acaoListarUsuarios_(dados));
      case 'adminAlterarPapel':    return responderJSON_(acaoAdminAlterarPapel_(dados));
      case 'adminRemoverUsuario':  return responderJSON_(acaoAdminRemoverUsuario_(dados));
      case 'adminEnviarReset':     return responderJSON_(acaoAdminEnviarReset_(dados));
      default:
        return responderJSON_({ sucesso: false, erro: 'Ação desconhecida ou não informada: "' + acao + '".' });
    }
  } catch (erro) {
    return responderJSON_({ sucesso: false, erro: 'Erro interno: ' + erro.message });
  }
}

function responderJSON_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}


/* ---------------------------------------------------------------
   2. CONFIGURAÇÃO INICIAL DA PLANILHA
   ---------------------------------------------------------------
   Rode esta função UMA VEZ manualmente pelo editor do Apps Script
   (▶ ao lado de "configurarPlanilha") antes do primeiro deploy.
   Ela cria as 3 abas com os cabeçalhos certos, se ainda não existirem.
   Pode rodar de novo sem problema: não apaga nada que já existe.
   --------------------------------------------------------------- */
function configurarPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  criarAbaSeNecessario_(ss, 'Usuarios', [
    'idUsuario', 'nome', 'email', 'senhaHash', 'salt', 'papel',
    'precisaTrocarSenha', 'resetPendente', 'tentativasLogin',
    'bloqueadoAte', 'codigoTempExpiraEm', 'criadoEm'
  ]);
  criarAbaSeNecessario_(ss, 'Sessoes', ['token', 'idUsuario', 'criadoEm', 'expiraEm']);
  criarAbaSeNecessario_(ss, 'Log', ['dataHora', 'usuario', 'acao']);
  Logger.log('Planilha configurada. Abas: Usuarios, Sessoes, Log.');
}

function criarAbaSeNecessario_(ss, nome, cabecalhos) {
  var aba = ss.getSheetByName(nome);
  if (!aba) aba = ss.insertSheet(nome);
  if (aba.getLastRow() === 0) {
    aba.appendRow(cabecalhos);
    aba.setFrozenRows(1);
  }
  return aba;
}


/* ---------------------------------------------------------------
   3. ACESSO ÀS ABAS
   --------------------------------------------------------------- */
function abaUsuarios_() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios'); }
function abaSessoes_()  { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sessoes'); }
function abaLog_()      { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log'); }

// Lê todos os usuários como uma lista de objetos {coluna: valor, ...},
// incluindo "_linha" (o número real da linha na planilha), pra dar
// pra escrever de volta depois sem ter que buscar de novo.
function lerUsuarios_() {
  var aba = abaUsuarios_();
  var valores = aba.getDataRange().getValues();
  var cabecalho = valores[0];
  var linhas = [];
  for (var i = 1; i < valores.length; i++) {
    var obj = {};
    for (var c = 0; c < cabecalho.length; c++) obj[cabecalho[c]] = valores[i][c];
    obj._linha = i + 1;
    linhas.push(obj);
  }
  return linhas;
}

function encontrarUsuarioPorEmail_(email) {
  var alvo = String(email || '').trim().toLowerCase();
  var todos = lerUsuarios_();
  for (var i = 0; i < todos.length; i++) {
    if (String(todos[i].email).toLowerCase() === alvo) return todos[i];
  }
  return null;
}

function encontrarUsuarioPorId_(idUsuario) {
  var alvo = String(idUsuario);
  var todos = lerUsuarios_();
  for (var i = 0; i < todos.length; i++) {
    if (String(todos[i].idUsuario) === alvo) return todos[i];
  }
  return null;
}

// Atualiza vários campos de UMA linha de usuário de uma vez só
// (uma leitura + uma escrita, em vez de uma escrita por campo).
function atualizarUsuario_(linha, campos) {
  var aba = abaUsuarios_();
  var totalColunas = aba.getLastColumn();
  var cabecalho = aba.getRange(1, 1, 1, totalColunas).getValues()[0];
  var linhaAtual = aba.getRange(linha, 1, 1, totalColunas).getValues()[0];
  for (var c = 0; c < cabecalho.length; c++) {
    if (Object.prototype.hasOwnProperty.call(campos, cabecalho[c])) {
      linhaAtual[c] = campos[cabecalho[c]];
    }
  }
  aba.getRange(linha, 1, 1, totalColunas).setValues([linhaAtual]);
}


/* ---------------------------------------------------------------
   4. SENHAS, TOKENS E CÓDIGOS
   --------------------------------------------------------------- */
function gerarSalt_() { return Utilities.getUuid(); }

function hashSenha_(senha, salt) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(senha) + ':' + String(salt));
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    var v = (bytes[i] + 256) % 256;
    hex += ('0' + v.toString(16)).slice(-2);
  }
  return hex;
}

function senhaConfere_(senhaDigitada, hashSalvo, salt) {
  return hashSenha_(senhaDigitada, salt) === hashSalvo;
}

function gerarToken_() { return Utilities.getUuid(); }

// Código curto pra digitar (sem 0/O, 1/I/l, que se confundem).
function gerarCodigoTemporario_() {
  var alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var codigo = '';
  for (var i = 0; i < 8; i++) codigo += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
  return codigo;
}


/* ---------------------------------------------------------------
   5. SESSÕES
   --------------------------------------------------------------- */
function criarSessao_(idUsuario) {
  var token = gerarToken_();
  var agora = new Date();
  var expira = new Date(agora.getTime() + VALIDADE_SESSAO_DIAS * 24 * 60 * 60 * 1000);
  abaSessoes_().appendRow([token, idUsuario, agora, expira]);
  return token;
}

function validarSessao_(token) {
  if (!token) return null;
  var aba = abaSessoes_();
  var valores = aba.getDataRange().getValues();
  for (var i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === String(token)) {
      var expira = new Date(valores[i][3]).getTime();
      if (isNaN(expira) || expira < Date.now()) return null;
      return encontrarUsuarioPorId_(valores[i][1]);
    }
  }
  return null;
}

function encerrarSessao_(token) {
  var aba = abaSessoes_();
  var valores = aba.getDataRange().getValues();
  for (var i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === String(token)) { aba.deleteRow(i + 1); return; }
  }
}

// Aproveita a leitura que o login já faz pra ir limpando sessões
// vencidas, sem precisar de um gatilho por tempo separado.
function limparSessoesExpiradas_() {
  var aba = abaSessoes_();
  var valores = aba.getDataRange().getValues();
  var agora = Date.now();
  for (var i = valores.length - 1; i >= 1; i--) {
    var expira = new Date(valores[i][3]).getTime();
    if (isNaN(expira) || expira < agora) aba.deleteRow(i + 1);
  }
}


/* ---------------------------------------------------------------
   6. LOG DE ATIVIDADE
   --------------------------------------------------------------- */
function registrarLog_(usuarioNome, acao) {
  abaLog_().appendRow([new Date(), usuarioNome, acao]);
}


/* ---------------------------------------------------------------
   7. E-MAIL
   --------------------------------------------------------------- */
function enviarEmailCodigoTemporario_(destinatarioEmail, destinatarioNome, codigo) {
  var assunto = NOME_SITE + ' — código temporário de acesso';
  var corpo =
    'Olá, ' + destinatarioNome + '!\n\n' +
    'Recebemos um pedido para redefinir a senha da sua conta no ' + NOME_SITE + '.\n\n' +
    'Use o código abaixo no lugar da senha, na tela de login:\n\n' +
    '    ' + codigo + '\n\n' +
    'Depois de entrar com esse código, você vai poder escolher uma senha nova.\n' +
    'Ele é válido por ' + VALIDADE_CODIGO_HORAS + ' horas.\n\n' +
    'Se você não pediu isso, pode ignorar este e-mail — sua senha atual continua valendo normalmente.\n\n' +
    '— ' + NOME_SITE;
  MailApp.sendEmail({ to: destinatarioEmail, subject: assunto, body: corpo, name: REMETENTE_NOME });
}


/* ---------------------------------------------------------------
   8. AÇÕES — CONTA E SESSÃO
   --------------------------------------------------------------- */
function acaoLogin_(dados) {
  limparSessoesExpiradas_();

  var email = String(dados.email || '').trim().toLowerCase();
  var senha = String(dados.senha || '');
  var ERRO_GENERICO = 'E-mail ou senha incorretos.';
  if (!email || !senha) return { sucesso: false, erro: 'Informe e-mail e senha.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var usuario = encontrarUsuarioPorEmail_(email);
    if (!usuario) return { sucesso: false, erro: ERRO_GENERICO };

    if (usuario.bloqueadoAte && new Date(usuario.bloqueadoAte).getTime() > Date.now()) {
      return { sucesso: false, erro: 'Conta temporariamente bloqueada por muitas tentativas erradas. Tente de novo em alguns minutos.' };
    }

    if (usuario.precisaTrocarSenha && usuario.codigoTempExpiraEm &&
        new Date(usuario.codigoTempExpiraEm).getTime() < Date.now()) {
      return { sucesso: false, erro: 'Esse código temporário expirou. Peça um novo em "Esqueceu sua senha?".' };
    }

    if (!senhaConfere_(senha, usuario.senhaHash, usuario.salt)) {
      var tentativas = (Number(usuario.tentativasLogin) || 0) + 1;
      var campos = { tentativasLogin: tentativas };
      if (tentativas >= MAX_TENTATIVAS_LOGIN) {
        campos.bloqueadoAte = new Date(Date.now() + BLOQUEIO_MINUTOS * 60 * 1000);
        campos.tentativasLogin = 0;
      }
      atualizarUsuario_(usuario._linha, campos);
      return { sucesso: false, erro: ERRO_GENERICO };
    }

    atualizarUsuario_(usuario._linha, { tentativasLogin: 0, bloqueadoAte: '' });
    var token = criarSessao_(usuario.idUsuario);
    registrarLog_(usuario.nome, 'Entrou');

    return {
      sucesso: true,
      dados: {
        token: token,
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        precisaTrocarSenha: !!usuario.precisaTrocarSenha
      }
    };
  } finally {
    lock.releaseLock();
  }
}

function acaoCadastrar_(dados) {
  var nome = String(dados.nome || '').trim();
  var email = String(dados.email || '').trim().toLowerCase();
  var senha = String(dados.senha || '');
  var confirmar = String(dados.confirmarSenha || '');

  if (!nome || !email || !senha) return { sucesso: false, erro: 'Preencha nome, e-mail e senha.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { sucesso: false, erro: 'Digite um e-mail válido.' };
  if (senha.length < 6) return { sucesso: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' };
  if (senha !== confirmar) return { sucesso: false, erro: 'As senhas não conferem.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (encontrarUsuarioPorEmail_(email)) {
      return { sucesso: false, erro: 'Já existe uma conta com esse e-mail.' };
    }

    var ehPrimeiroUsuario = lerUsuarios_().length === 0;
    var idUsuario = Utilities.getUuid();
    var salt = gerarSalt_();
    var senhaHash = hashSenha_(senha, salt);
    var papel = ehPrimeiroUsuario ? 'administrador' : 'membro';

    abaUsuarios_().appendRow([
      idUsuario, nome, email, senhaHash, salt, papel,
      false, false, 0, '', '', new Date()
    ]);

    var token = criarSessao_(idUsuario);
    registrarLog_(nome, 'Criou conta' + (ehPrimeiroUsuario ? ' (1º usuário → administrador)' : ''));

    return {
      sucesso: true,
      dados: { token: token, idUsuario: idUsuario, nome: nome, email: email, papel: papel, precisaTrocarSenha: false }
    };
  } finally {
    lock.releaseLock();
  }
}

function acaoEsqueciSenha_(dados) {
  var email = String(dados.email || '').trim().toLowerCase();
  var MSG_GENERICA = 'Se esse e-mail tiver uma conta, enviamos um código temporário para ele agora.';
  if (!email) return { sucesso: false, erro: 'Informe o e-mail.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var usuario = encontrarUsuarioPorEmail_(email);
    // Não revela se o e-mail existe ou não: sempre responde a mesma mensagem.
    if (!usuario) return { sucesso: true, mensagem: MSG_GENERICA };

    var codigo = gerarCodigoTemporario_();
    var salt = gerarSalt_();
    var hash = hashSenha_(codigo, salt);
    var expira = new Date(Date.now() + VALIDADE_CODIGO_HORAS * 60 * 60 * 1000);

    atualizarUsuario_(usuario._linha, {
      senhaHash: hash, salt: salt, precisaTrocarSenha: true, resetPendente: false,
      codigoTempExpiraEm: expira, tentativasLogin: 0, bloqueadoAte: ''
    });
    enviarEmailCodigoTemporario_(usuario.email, usuario.nome, codigo);
    registrarLog_(usuario.nome, 'Pediu código (esqueceu a senha)');

    return { sucesso: true, mensagem: MSG_GENERICA };
  } finally {
    lock.releaseLock();
  }
}

function acaoDefinirNovaSenha_(dados) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var usuario = validarSessao_(dados.token);
    if (!usuario) return { sucesso: false, codigo: 'SESSAO_EXPIRADA', erro: 'Sessão expirada. Faça login de novo.' };

    var s1 = String(dados.novaSenha || '');
    var s2 = String(dados.confirmarNovaSenha || '');
    if (s1.length < 6) return { sucesso: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' };
    if (s1 !== s2) return { sucesso: false, erro: 'As senhas não conferem.' };

    var salt = gerarSalt_();
    var hash = hashSenha_(s1, salt);
    atualizarUsuario_(usuario._linha, {
      senhaHash: hash, salt: salt, precisaTrocarSenha: false, codigoTempExpiraEm: ''
    });
    registrarLog_(usuario.nome, 'Definiu uma nova senha');
    return { sucesso: true };
  } finally {
    lock.releaseLock();
  }
}

function acaoVerificarSessao_(dados) {
  var usuario = validarSessao_(dados.token);
  if (!usuario) return { sucesso: false, codigo: 'SESSAO_EXPIRADA', erro: 'Sessão inválida ou expirada.' };
  return {
    sucesso: true,
    dados: { idUsuario: usuario.idUsuario, nome: usuario.nome, email: usuario.email, papel: usuario.papel }
  };
}

function acaoLogout_(dados) {
  if (dados.token) encerrarSessao_(dados.token);
  return { sucesso: true };
}

// Pedido de troca de senha feito de dentro de "Minha conta" (já logado).
// De propósito NÃO manda e-mail sozinho — só sinaliza pro administrador,
// que decide quando enviar o código (ver acaoAdminEnviarReset_).
function acaoSolicitarResetSenha_(dados) {
  var usuario = validarSessao_(dados.token);
  if (!usuario) return { sucesso: false, codigo: 'SESSAO_EXPIRADA', erro: 'Sessão expirada. Faça login de novo.' };

  atualizarUsuario_(usuario._linha, { resetPendente: true });
  registrarLog_(usuario.nome, 'Solicitou troca de senha');
  return { sucesso: true, mensagem: 'Pedido enviado. Um administrador vai liberar um código por e-mail em breve.' };
}


/* ---------------------------------------------------------------
   9. AÇÕES — SÓ ADMINISTRADOR
   --------------------------------------------------------------- */
function exigirAdmin_(token) {
  var usuario = validarSessao_(token);
  if (!usuario) return { erro: { sucesso: false, codigo: 'SESSAO_EXPIRADA', erro: 'Sessão expirada. Faça login de novo.' } };
  if (usuario.papel !== 'administrador') {
    return { erro: { sucesso: false, codigo: 'PERMISSAO_NEGADA', erro: 'Essa ação é exclusiva de administradores.' } };
  }
  return { usuario: usuario };
}

function acaoListarUsuarios_(dados) {
  var checagem = exigirAdmin_(dados.token);
  if (checagem.erro) return checagem.erro;

  var usuarios = lerUsuarios_().map(function (u) {
    return { idUsuario: u.idUsuario, nome: u.nome, email: u.email, papel: u.papel, resetPendente: !!u.resetPendente };
  });

  var aba = abaLog_();
  var ultimaLinha = aba.getLastRow();
  var valoresLog = ultimaLinha > 1 ? aba.getRange(2, 1, ultimaLinha - 1, 3).getValues() : [];
  var log = valoresLog.slice(-50).reverse().map(function (l) {
    return { dataHora: l[0], usuario: l[1], acao: l[2] };
  });

  return { sucesso: true, dados: { usuarios: usuarios, log: log } };
}

function acaoAdminAlterarPapel_(dados) {
  var checagem = exigirAdmin_(dados.token);
  if (checagem.erro) return checagem.erro;
  var admin = checagem.usuario;

  if (String(dados.idUsuario) === String(admin.idUsuario)) {
    return { sucesso: false, erro: 'Você não pode alterar o próprio papel por aqui.' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var alvo = encontrarUsuarioPorId_(dados.idUsuario);
    if (!alvo) return { sucesso: false, erro: 'Usuário não encontrado.' };

    var novoPapel = dados.novoPapel === 'administrador' ? 'administrador' : 'membro';
    atualizarUsuario_(alvo._linha, { papel: novoPapel });
    registrarLog_(admin.nome, 'Alterou o papel de ' + alvo.nome + ' para ' + novoPapel);
    return { sucesso: true };
  } finally {
    lock.releaseLock();
  }
}

function acaoAdminRemoverUsuario_(dados) {
  var checagem = exigirAdmin_(dados.token);
  if (checagem.erro) return checagem.erro;
  var admin = checagem.usuario;

  if (String(dados.idUsuario) === String(admin.idUsuario)) {
    return { sucesso: false, erro: 'Você não pode remover a própria conta por aqui.' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var alvo = encontrarUsuarioPorId_(dados.idUsuario);
    if (!alvo) return { sucesso: false, erro: 'Usuário não encontrado.' };

    abaUsuarios_().deleteRow(alvo._linha);
    registrarLog_(admin.nome, 'Removeu a conta de ' + alvo.nome);
    return { sucesso: true };
  } finally {
    lock.releaseLock();
  }
}

function acaoAdminEnviarReset_(dados) {
  var checagem = exigirAdmin_(dados.token);
  if (checagem.erro) return checagem.erro;
  var admin = checagem.usuario;

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var alvo = encontrarUsuarioPorId_(dados.idUsuario);
    if (!alvo) return { sucesso: false, erro: 'Usuário não encontrado.' };

    var codigo = gerarCodigoTemporario_();
    var salt = gerarSalt_();
    var hash = hashSenha_(codigo, salt);
    var expira = new Date(Date.now() + VALIDADE_CODIGO_HORAS * 60 * 60 * 1000);

    atualizarUsuario_(alvo._linha, {
      senhaHash: hash, salt: salt, precisaTrocarSenha: true, resetPendente: false,
      codigoTempExpiraEm: expira, tentativasLogin: 0, bloqueadoAte: ''
    });
    enviarEmailCodigoTemporario_(alvo.email, alvo.nome, codigo);
    registrarLog_(admin.nome, 'Enviou código temporário para ' + alvo.nome);

    return { sucesso: true, mensagem: 'Código enviado para ' + alvo.email + '.' };
  } finally {
    lock.releaseLock();
  }
}
