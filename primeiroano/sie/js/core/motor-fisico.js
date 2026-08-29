/* ═══════════════════════════════════════════════════════════════
   CAMADA: NÚCLEO (motor de física)
   ARQUIVO: motor-fisico.js
   ───────────────────────────────────────────────────────────────
   Verifica se o Matter.js (motor de corpos rígidos 2D, carregado via
   CDN externo) carregou — interrompe a inicialização com uma
   mensagem clara se não carregou (ex: sem internet) — e cria o
   `engine` compartilhado, com gravidade zerada (os átomos flutuam
   livremente, sem "cair").
   Depende de: window.Matter (biblioteca externa).
   Usado por: js/atoms/atomos-ligacoes-crud.js e praticamente toda a
              física do módulo Estequiometria.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ---------------------------------------------------------------
   5. MUNDO FÍSICO (Matter.js) — corpos rígidos 2D, colisão real
   ---------------------------------------------------------------
   Matter.js vem de um CDN externo. Numa conexão instável, modo avião
   ou bloqueio de rede, o script pode não carregar — e como o motor de
   física é usado em todo o restante deste arquivo (não é um recurso
   isolado), não há como degradar graciosamente feature por feature.
   Em vez de travar com um erro silencioso no console e a página pela
   metade, mostramos um aviso claro e paramos a inicialização.
   --------------------------------------------------------------- */
if (typeof Matter === 'undefined') {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                background:#090c11;color:#e8edf2;font-family:'Segoe UI',system-ui,sans-serif;
                text-align:center;padding:2rem;">
      <div style="max-width:420px;">
        <div style="font-size:2.5rem;margin-bottom:1rem;">⚠️</div>
        <h1 style="font-family:'Segoe UI',system-ui,sans-serif;font-size:1.3rem;margin:0 0 .75rem;">
          Não foi possível carregar o simulador
        </h1>
        <p style="color:#7b8794;font-size:.92rem;line-height:1.5;margin-bottom:1.25rem;">
          O motor de física (Matter.js) não carregou — verifique sua conexão
          com a internet e recarregue a página. Se o problema persistir,
          tente novamente mais tarde.
        </p>
        <a href="index.html" style="display:inline-flex;align-items:center;gap:.4rem;
           color:#FF6B6B;text-decoration:none;font-size:.85rem;font-weight:600;
           border:1px solid #232b38;border-radius:6px;padding:.4rem .8rem;">
          ← Voltar à Central de Simuladores
        </a>
      </div>
    </div>`;
  throw new Error('SIE: Matter.js não carregou (CDN indisponível) — inicialização interrompida.');
}

const engine = Matter.Engine.create();

engine.world.gravity.x = 0;

engine.world.gravity.y = 0; // ambiente molecular em "gravidade zero"

