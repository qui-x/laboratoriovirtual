/* ================================================================
   sw.js — SERVICE WORKER DO PWA
   ================================================================
   Responsável por duas coisas:
   1. Deixar o Chrome/Android saber que este site "pode virar app"
      (é um dos requisitos, junto do manifest.json, pra aparecer o
      botão de instalar).
   2. Guardar em cache o que já foi visitado, pra funcionar (pelo
      menos parcialmente) sem internet depois da primeira visita —
      útil porque a maioria dos simuladores roda inteiramente no
      navegador, sem precisar de rede nenhuma depois de carregados.

   ESTRATÉGIA: "stale-while-revalidate" — sempre responde com o que
   já está em cache na hora (rápido), e ao mesmo tempo busca uma
   versão nova na rede pra guardar pra próxima vez. Assim a página
   nunca fica "presa" numa versão velha por muito tempo, mas também
   nunca trava esperando a rede se ela estiver lenta ou ausente.

   O QUE NUNCA ENTRA NO CACHE:
   - Requisições que não são GET (o login/cadastro/admin usam POST
     pra falar com o Apps Script — cachear isso não faz sentido e
     poderia até causar bug de sessão).
   - Chamadas para script.google.com (o backend de login): sempre
     precisam ir na rede de verdade, nunca responder com algo velho.
   ================================================================ */

const CACHE_NAME = 'quimix-cache-v2';

// Alguns arquivos "essenciais" da página inicial são pré-carregados
// assim que o service worker instala, pra primeira visita offline já
// funcionar. O resto (todos os outros simuladores, imagens, etc.) vai
// entrando no cache sozinho, conforme a pessoa for navegando por eles
// — não precisamos (nem devemos) listar os 287 arquivos aqui.
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './favicon.svg',
  './favicon-32.png',
  './favicon-16.png',
  './favicon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Nunca cachear (nem tentar responder do cache) requisições que
// contenham qualquer um desses trechos na URL.
const NUNCA_CACHEAR = [
  'script.google.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes.filter((nome) => nome !== CACHE_NAME).map((nome) => caches.delete(nome))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requisicao = event.request;

  if (requisicao.method !== 'GET') return;
  if (NUNCA_CACHEAR.some((trecho) => requisicao.url.includes(trecho))) return;

  event.respondWith(
    caches.match(requisicao).then((respostaEmCache) => {
      const buscaNaRede = fetch(requisicao)
        .then((respostaDaRede) => {
          // Guarda em cache respostas normais (mesmo domínio) e
          // também respostas "opacas" (recursos de outro domínio,
          // tipo fontes do Google — não dá pra checar se deram certo,
          // mas ainda vale guardar pra funcionar offline).
          if (respostaDaRede && (respostaDaRede.ok || respostaDaRede.type === 'opaque')) {
            const copia = respostaDaRede.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(requisicao, copia));
          }
          return respostaDaRede;
        })
        .catch(() => respostaEmCache); // sem internet: usa o que já tinha em cache

      return respostaEmCache || buscaNaRede;
    })
  );
});
