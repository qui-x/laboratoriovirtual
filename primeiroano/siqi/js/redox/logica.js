/* ═══════════════════════════════════════════════════════════════
   CAMADA: MÓDULO 3 (antigo — REDOX)
   ARQUIVO: logica.js
   ───────────────────────────────────────────────────────────────
   Esvaziado — o Módulo 3 deixou de ser "Redox" e passou a ser
   "Hibridização de Nuvens Eletrônicas", a pedido explícito do
   usuário. Toda a lógica (seletor de tipo, lista de compostos,
   análise completa gerada no centro) foi reescrita em
   js/hibridizacao/logica.js — inclusive as funções initModulo3()/
   mod3* que este arquivo continha, que agora vivem lá (initModulo3()
   manteve o MESMO nome de função, então js/redox/eventos-finais.js
   — o composition-root do app, que continua no lugar — não precisou
   de nenhuma mudança pra chamar a versão nova).
   Este arquivo não é mais carregado por indexsiqi.html — mantido
   vazio (em vez de removido) só pra não quebrar nenhuma referência
   externa que porventura ainda aponte pro nome antigo.
   Depende de: nada (arquivo intencionalmente vazio).
═══════════════════════════════════════════════════════════════ */

'use strict';
