# QuímiX — Substituição de emojis por SVG

> **Atualização:** corrigido o link "voltar" (`.header-back`) nos 7
> simuladores — apontava para `indexsegundoano.html` sem `../`, o que
> tentava abrir o hub DENTRO da própria pasta do simulador (não existe
> ali; o hub está uma pasta acima). Agora aponta para
> `../indexsegundoano.html`, testado resolvendo para o arquivo real via
> jsdom nos 7, não só conferido visualmente.

## O que foi feito

**204+ ícones de interface** trocados por SVG (biblioteca [Lucide](https://lucide.dev),
licença ISC — uso livre, inclusive comercial), em todos os 7 simuladores
reestruturados + SIATIV. Mesmo estilo visual em todos: `viewBox 24x24`,
traço (`stroke`), `currentColor` (herda a cor do texto ao redor — não
precisa de CSS extra), `width/height: 1em` (acompanha o tamanho da fonte,
igual o emoji fazia).

## O que NÃO foi tocado, e por quê

**Notação científica dentro do próprio texto** — setas de equilíbrio
(`⇌`), setas de eixo de gráfico ("Temperatura (°C) →"), atalhos de
teclado (`<kbd>← ↑ ↓ →</kbd>`), símbolos de decaimento radioativo
(`²³⁸U → ²⁰⁶Pb`). Trocar isso por ícone decorativo apagaria informação
científica real — não é decoração, é o próprio conteúdo.

**Textos que alimentam `.textContent` em vez de `.innerHTML`** — um
punhado de rótulos em Termoquímica (ícone de modo na pílula do canvas,
ícone de fase na tabela de resultados, status do Hess) são escritos via
`.textContent`, que exibe qualquer coisa como texto puro — um SVG ali
apareceria como código visível, não como desenho. Dava pra converter
esses pontos para `.innerHTML`, mas isso muda como a string é
interpretada (caracteres como `<`/`>`/`&` passam a ter significado
especial) — decidi não arriscar isso sem necessidade. Ficaram como emoji,
documentado no código em cada ponto.

## Ícones desenhados DENTRO do canvas

SVG não entra em `<canvas>` — pra veredito desenhado na própria simulação
(certo/errado, travado/destravado, alerta), criei `js/ui/icones-canvas.js`
(namespaced, presente em equilíbrio, soluções, radioatividade, cinética e
termoquímica) com funções que desenham o ícone com comandos de canvas
(linha, arco): `kIconCheck`, `kIconX`, `kIconLock`, `kIconUnlock`,
`kIconWarning`, mais `kIconText`/`kChipIcon` para combinar ícone + texto
mantendo o mesmo alinhamento (centro/esquerda/direita) que o texto sozinho
já tinha.

**8 pontos corrigidos**: alerta de tampão esgotado (Equilíbrio), check/x de
classificação × 2 e "travado no azeótropo" (Soluções), check/x de equação
de decaimento e chip de conservação (Radioatividade), chip de ordem oculta
(Cinética), check da soma de Hess (Termoquímica) — mais 3 que só apareceram
numa varredura sem padrão fixo (não presos a nenhum template específico):
o botão ✕ de fechar modo (nos 7), 3 botões soltos em Termoquímica, e o
veredito de quiz do SIATIV.

## Barra de modos mobile

A barra de modos em telas estreitas (Equilíbrio, o piloto do recurso)
agora mostra o **nome completo** do modo, não mais a sigla.

## Bug que a minha própria substituição introduziu (e corrigiu)

Ícones com mais de um `<path>` (ex.: `refresh-cw`) vieram do arquivo
original da Lucide com quebra de linha entre os elementos — colado direto
numa string JS de aspas simples, isso quebra a sintaxe (string não pode
conter quebra de linha literal). Pegado pelo `node -c` logo depois da
primeira leva de substituições, antes de qualquer coisa ser entregue —
corrigido colapsando espaço/quebra de linha dentro de todo SVG inserido,
nos 17 arquivos afetados.

## Validação

- Sintaxe (`node -c`) em todo `.js` do projeto.
- Varredura cruzada de referências (mesma checagem usada na conversão de
  namespace) nos novos ícones de canvas — zero problemas.
- Carregamento real em DOM (jsdom) nos 7 simuladores + SIATIV — zero
  erros, mesmo resultado de sempre (dados carregados, sidebars, canvas).
- Confirmação visual de que o SVG vira elemento `<svg>` de verdade no DOM
  (não texto escapado) — 18 ícones só na tela inicial de Gases.
