# SIFI — Simulador Interativo de Forças Intermoleculares
### Documento de arquitetura — Etapa 17 (correção: dica presa na tela; Módulo 3 ganha termostato por tubo + contador de estados)

Este documento existe para você (que está começando em programação)
entender **por que** cada arquivo está onde está, **o que** já
funciona, e **o que** falta — sem precisar reler todo o código
toda vez que voltar ao projeto.

---

## 1. Relação SIFI ↔ SILQ

O SIFI **não é um projeto do zero**. Ele nasce reaproveitando o que
já existe no SILQ e é cientificamente idêntico nos dois simuladores
(dados de elementos, eletronegatividade, geometria de moléculas).
O que muda é a **pergunta que cada um responde**:

| | SILQ | SIFI |
|---|---|---|
| Pergunta central | Como os átomos se ligam **dentro** de uma molécula? | Como as moléculas se atraem **entre si**? |
| Unidade que se move | Átomo | Molécula inteira |
| Força em jogo | Ligação covalente/iônica/metálica | Ligação de hidrogênio / dipolo-dipolo / London |
| Resultado visível | Geometria molecular (VSEPR) | Propriedades físicas (ebulição, solubilidade) |

Por serem perguntas diferentes, o motor de física de um **não pode
ser copiado e colado** no outro — mas a base de dados científica
(quais elementos existem, qual a eletronegatividade de cada um) é
exatamente a mesma, então essa parte foi 100% reaproveitada.

---

## 2. Técnica de arquitetura reaproveitada do SILQ

O SILQ resolve um problema clássico de projetos que crescem: em vez
de centenas de variáveis soltas competindo pelo mesmo nome, tudo
mora dentro de **um único objeto global**:

```js
window.SILQ = {};        // SILQ
SILQ.canvasAtoms = [];
SILQ.physicsTick = function () { ... };
```

O SIFI usa a mesma técnica, com seu próprio objeto:

```js
window.SIFI = {};        // SIFI
SIFI.canvasMolecules = [];
SIFI.addMoleculeToSandbox = function (key) { ... };
```

Cada arquivo `.js` roda dentro de
`document.addEventListener('DOMContentLoaded', () => { ... })` —
isso garante que o HTML já existe na tela antes de qualquer script
tentar encontrar um elemento por `id`. A ordem dos `<script>` no
HTML importa: um arquivo só pode usar o que um arquivo **anterior**
já definiu.

---

## 3. Estrutura de pastas

```
sifi/
├── index-sifi.html                          ← página principal
├── css/
│   ├── sifi-styles.css                      ← cópia exata de stylesilq.css (mesmas cores)
│   └── sifi-extra.css                       ← elementos NOVOS + cores dos 3 módulos (reaproveitadas)
├── js/
│   ├── data/            (CAMADA: DADOS — fatos científicos, nunca mudam sozinhos)
│   │   ├── tabela-elementos.js              ← REAPROVEITADO do SILQ, sem alteração
│   │   ├── eletronegatividade.js            ← REAPROVEITADO do SILQ, sem alteração
│   │   └── dados-forcas-intermoleculares.js ← as 44 substâncias (34 originais + 5 do Módulo 3 + 5 mais adicionadas na expansão da prateleira — `density`/`polaridade` são os dados centrais do Módulo 3, `boilingPoint`/`meltingPoint` do Módulo 2)
│   ├── core/             (CAMADA: NÚCLEO — namespace, estado, DOM)
│   │   ├── namespace.js                     ← window.SIFI = {}
│   │   ├── estado.js                        ← o que muda em tempo de execução + constantes de física (Módulo 1, 2 e 3)
│   │   └── dom-refs.js                      ← referências de elementos HTML
│   ├── a11y/             (CAMADA: ACESSIBILIDADE)
│   │   ├── preferencias.js                  ← REAPROVEITADO do SILQ: lê window.A11Y (Central) e aplica tema/contraste/daltonismo/leitura simples — roda FORA do namespace SIFI, de propósito
│   │   └── anuncios.js                      ← REAPROVEITADO do SILQ: SIFI.announce() p/ leitor de tela
│   ├── ui/               (CAMADA: INTERFACE — o que o usuário vê e clica)
│   │   ├── icones.js                        ← biblioteca de ícones SVG (substitui os emojis)
│   │   ├── menu-moleculas.js                ← lista da Biblioteca (nome) + SIFI.moleculeLayout/buildMoleculeMiniSVG (desenho) + SIFI.dipoloAngleLocal (eixo do dipolo, para a rotação)
│   │   ├── sandbox.js                       ← caixa de areia do Módulo 1: arrastar, polos, detectar força
│   │   ├── termostato-lista.js              ← lista "Escolha o Líquido" do Módulo 2 (seleção única)
│   │   ├── beaker.js                        ← béquer do Módulo 2: partículas, seleção de substância, sólido↔líquido↔gás
│   │   ├── grafico-temperatura.js           ← gráfico Temperatura×Tempo, SVG puro (sem D3)
│   │   ├── prateleira.js                    ← prateleira de 17 reagentes do Módulo 3
│   │   ├── tubo-ensaio.js                   ← tubos DINÂMICOS do Módulo 3 (2 a 10), até 5 substâncias cada
│   │   └── menu-mobile.js                   ← REAPROVEITADO do SILQ: gavetas em tela pequena
│   ├── simulation/       (CAMADA: SIMULAÇÃO)
│   │   ├── fisica-intermolecular.js         ← motor do Módulo 1: atração/repulsão + rotação; detecção/redesenho desacoplados do tick (desempenho)
│   │   ├── fisica-termostato.js             ← motor do Módulo 2: agitação térmica + evaporação/condensação/fusão/solidificação nos pontos reais
│   │   └── fisica-solubilidade.js           ← motor do Módulo 3: SIFI.saoCompativeis (por índice de polaridade), SIFI.agruparPorFase (N substâncias → K fases), camadas por densidade, dissolução, separação iônica
│   └── init/             (CAMADA: INICIALIZAÇÃO — o "main.js")
│       ├── ativacao-modulos.js              ← "Ativar Módulo X" — mesmo padrão do SILQ; troca a visão (caixa de areia ↔ béquer ↔ tubos)
│       └── inicializacao-sifi.js            ← liga tudo no carregamento da página
└── test-sifi.js                             ← testes automatizados (ver seção 8)
```

Note que a ordem das pastas (`data` → `core` → `ui` → `init`) é a
mesma ordem em que os `<script>` aparecem no HTML — isso não é
coincidência, é a ordem de dependência: dado não depende de nada,
núcleo depende de dado, interface depende de núcleo, inicialização
depende de tudo.

---

## 4. O que cada arquivo faz (resumo de 1 linha cada)

- **`tabela-elementos.js`** — 118 elementos: símbolo, cor, raio, eletronegatividade.
- **`eletronegatividade.js`** — tabela de Pauling, usada para saber se uma ligação é polar.
- **`dados-forcas-intermoleculares.js`** — as 44 substâncias (Módulos 1, 2 e 3), com a geometria, a força que cada uma faz consigo mesma, QUAIS átomos são δ+/δ−, o ponto de ebulição/fusão/massa molar/densidade/**índice de polaridade de Snyder** real de cada uma, e os casos especiais (`sublima`, `ionico`, `apenasModulo3`).
- **`namespace.js`** — cria a caixa `window.SIFI` onde tudo mais vive.
- **`estado.js`** — o estado de cada módulo (moléculas na caixa de areia, partículas no béquer, os dois tubos de ensaio, qual módulo está ativo) e todas as constantes de física dos três.
- **`dom-refs.js`** — busca cada elemento do HTML uma única vez.
- **`anuncios.js`** — `SIFI.announce()`, avisa leitores de tela quando algo importante acontece.
- **`preferencias.js`** — recebe as preferências de acessibilidade da Central (`window.A11Y`) e aplica no `<body>`/`<html>`: tema, alto contraste, leitura simples, daltonismo, escala de fonte. Roda ANTES de tudo, fora do namespace SIFI (ver seção 7.11 — o bug que motivou esta correção).
- **`icones.js`** — `SIFI.ICONS`, os ícones SVG reaproveitados em mais de um lugar (módulos, ações), e `SIFI.aplicarIcones()`, que injeta cada um em todo elemento `data-icon="nome"` do HTML.
- **`menu-moleculas.js`** — desenha os cartões clicáveis do menu, expõe `SIFI.moleculeLayout()` (coordenadas compartilhadas com a física) e `SIFI.buildMoleculeMiniSVG()` (o desenho em si — reaproveitado pelos 3 módulos, inclusive pros íons soltos do Módulo 3), `SIFI.dipoloAngleLocal()` (eixo do dipolo de cada molécula, usado pela rotação do Módulo 1), e a lógica de busca/filtro/ordenação da Biblioteca (`SIFI.filtrarMoleculas`, que também filtra fora as substâncias `apenasModulo3`).
- **`sandbox.js`** — cria a molécula na caixa de areia quando o Módulo 1 está ativo; calcula a posição de cada polo δ+/δ−; acha TODOS os pares em interação simultânea; desenha as linhas; atualiza o painel "Interações" (agrupado, com contador ×N).
- **`termostato-lista.js`** — a lista "Escolha o Líquido" do Módulo 2 (seleção única, mesma técnica da Biblioteca, também filtrando fora `apenasModulo3`).
- **`beaker.js`** — cria/remove partículas do béquer, move cada uma entre sólido↔líquido↔gás, atualiza a ficha da substância e o texto de status.
- **`grafico-temperatura.js`** — o gráfico Temperatura×Tempo, SVG puro (sem depender de D3), com as linhas de fusão E ebulição.
- **`prateleira.js`** — a prateleira de 17 reagentes do Módulo 3, e `SIFI.estadoFisicoAmbiente()` (sólido ou líquido a 25°C).
- **`tubo-ensaio.js`** — tubos DINÂMICOS (criar/remover, até 10), cada um com até 5 substâncias; adicionar/limpar reagentes, cria as partículas, os painéis de texto (legenda + status).
- **`menu-mobile.js`** — em telas ≤900px, transforma as duas sidebars em gavetas.
- **`fisica-intermolecular.js`** — o motor do Módulo 1: a cada 16ms, calcula a força de atração entre cada par de moléculas próximas (sempre atrai — a orientação quem resolve é a rotação) e GIRA cada molécula: polares alinham o dipolo com a vizinha mais próxima, apolares giram livre o tempo todo.
- **`fisica-termostato.js`** — o motor do Módulo 2: a cada 50ms, agita cada partícula conforme a temperatura, e decide se ela funde/solidifica/evapora/condensa comparando com o ponto de fusão e ebulição reais da substância.
- **`fisica-solubilidade.js`** — o motor do Módulo 3: `SIFI.saoCompativeis()` (a regra "semelhante dissolve semelhante", por índice de polaridade), `SIFI.agruparPorFase()` (agrupa até 5 substâncias em quantas fases forem necessárias), separa fases incompatíveis em camadas por densidade real, dissolve sólidos compatíveis aos poucos, e separa sal dissolvido em íons Na⁺/Cl⁻ independentes.
- **`ativacao-modulos.js`** — os botões "Ativar Módulo X": liga/desliga a física certa, troca a visão inteira (caixa de areia ↔ béquer ↔ tubos) e os painéis da sidebar direita, mostra o indicador colorido. Os três módulos da especificação original já existem e funcionam.
- **`inicializacao-sifi.js`** — constrói as três listas (Biblioteca, Líquidos e Prateleira), deixa os painéis e dicas no estado inicial, e liga os painéis que abrem/fecham.

---

## 5. Como o Módulo 1 funciona por completo

### 5.1 — Ativação (mesmo padrão do "Ativar Modo Metálico" do SILQ)

Nada acontece na caixa de areia até o usuário clicar em
**"Ativar Módulo 1"**. Esse botão (`js/init/ativacao-modulos.js`):

1. Marca `SIFI.activeModule = 1`.
2. Mostra o indicador colorido no topo da caixa de areia (`#module-indicator`).
3. Pinta a borda da caixa de areia com a cor do módulo.
4. "Acende" o menu de moléculas (que ficava apagado, `opacity:.4`).
5. Liga o motor de física (`SIFI.startSimLoop()`).
6. Clicar de novo no mesmo botão **desativa** (toggle) — e desativar
   limpa a caixa de areia, exatamente como trocar de "Ativar Modo X"
   no SILQ com átomos já no canvas.

Enquanto nenhum módulo está ativo, `SIFI.addMoleculeToSandbox()` se
recusa a colocar qualquer coisa na tela (só avisa por leitor de tela
por que não funcionou) — é o mesmo "portão" que o SILQ usa para não
deixar formar ligação sem um modo escolhido.

### 5.2 — Como a força entre duas moléculas é decidida

Em `sandbox.js`, `SIFI.classifyPairForce(molA, molB)`:

1. As duas moléculas fazem ligação de hidrogênio sozinhas (H ligado a
   F/O/N)? → **Ligação de Hidrogênio**.
2. Senão, as duas são polares? → **Dipolo-Dipolo**.
3. Senão (pelo menos uma é apolar) → **Dipolo Induzido / London**.

Essa é uma **simplificação didática documentada no próprio código**.
Ela acerta os 6 casos da especificação (H₂O→hidrogênio,
HCl→dipolo-dipolo, CO₂/CH₄/F₂→London).

### 5.3 — Física de atração (e rotação — a orientação certa)

`js/simulation/fisica-intermolecular.js` roda a cada 16ms
(`SIFI.physicsTick`). Para cada par de moléculas dentro do raio de
interação (`SIFI.RAIO_INTERACAO`):

- **Colisão** (muito perto): sempre repele um pouco — as moléculas
  "têm tamanho" e não podem se sobrepor. Isso não depende de polo,
  só de volume.
- **London** (pelo menos uma apolar): sempre atrai fracamente — sem
  polo fixo, não existe "direção errada" para essa força.
- **Dipolo-Dipolo / Ligação de Hidrogênio** (as duas polares):
  **sempre atrai** (a intensidade certa para cada força). O que muda
  com a orientação não é SE atrai — é o quão bem alinhados os
  dipolos estão, e isso quem resolve é a **rotação** (seção 5.11),
  não mais uma inversão de sinal na força de translação.

A posição de cada polo em pixels (`poloLocal`, relativa ao CENTRO da
ficha) é calculada **uma única vez**, quando a molécula é criada,
usando a mesma função de coordenadas do desenho (`SIFI.moleculeLayout`,
em `menu-moleculas.js`) — e é GIRADA junto com a molécula a cada tick
(`SIFI.polosAbsolutos`, em `sandbox.js`), por isso a linha tracejada
de interação sempre liga exatamente os pontos δ+/δ− certos, mesmo
com a molécula girando.

### 5.4 — Feedback visual ("piscar")

- Os símbolos δ+/δ− têm uma animação CSS de piscar suave e contínua
  (`.sifi-pole`, em `sifi-extra.css`), respeitando
  `prefers-reduced-motion`.
- Cada interação nova no painel "Interações" pisca uma vez ao
  aparecer (`.interacao-nova`) — ver seção 5.10.

### 5.5 — Layout: módulos à esquerda, controles à direita (padrão SILQ)

A barra **esquerda** (`sidebar-left`) só tem os cards de módulo
("Ativar Módulo 1/2/3", descrição, estatísticas) — igual ao SILQ, que
mantém ali só os tipos de ligação. Nenhum controle de escolha de
composto mora lá.

A barra **direita** (`sidebar-right`) tem os dois painéis de
controle: **Biblioteca de Compostos** (a lista de moléculas
disponíveis, por nome — sem desenhar a geometria) e **Interações**
(seção 5.10 — quantas substâncias, quantas interações ativas, e uma
lista com cada uma). É o mesmo agrupamento que o SILQ usa (Tabela
Periódica + Moléculas Prontas + Análise, todos na direita).

A Biblioteca (`SIFI.buildMenuMoleculas`, em `menu-moleculas.js`)
mostra só fórmula + nome + uma bolinha colorida com a força
dominante — o desenho completo (átomos, ligações, polos δ+/δ−) só
aparece depois, na própria caixa de areia, quando o composto é
colocado lá (`SIFI.buildMoleculeMiniSVG`, chamado por
`SIFI.addMoleculeToSandbox`). São dois momentos diferentes: "o que eu
posso escolher" (nome basta) vs. "o que eu escolhi, e onde ficam os
polos dele" (precisa do desenho).

### 5.6 — Remover uma molécula da caixa de areia

Mesmo padrão de exclusão que o SILQ usa para átomos
(`js/atoms/atomos.js` → `removeAtom`), adaptado para moléculas
inteiras em `SIFI.removeMolecule` (sandbox.js), com duas formas de
acionar:

1. **Duplo clique** em qualquer parte da ficha.
2. **Tecla Delete ou Backspace** com a ficha focada (Tab até ela) —
   alternativa para quem não usa mouse/toque.

**Por que sem botão de remover:** a primeira versão tinha um botão
"×" (bolinha vermelha) no canto de cada ficha, aparecendo ao passar o
mouse — mesmo padrão do `.atom-remove-x` do SILQ. Só que, com várias
moléculas próximas umas das outras na caixa de areia (o cenário
normal do Módulo 1: é assim que se testa uma interação!), o botão de
uma ficha ficava sobreposto em cima dos átomos da ficha vizinha,
tampando parte do desenho e do próprio botão de remover dela.
Como a remoção por duplo clique e por tecla Delete já cobriam mouse,
toque e teclado sem precisar de um elemento extra fixo na tela, o
botão foi removido — resolve a sobreposição sem perder nenhuma forma
de interação.

Por baixo, `SIFI.removeMolecule`:
- Tira a molécula de `SIFI.canvasMolecules` **imediatamente** (a
  física e a detecção de força param de considerá-la na mesma hora,
  mesmo antes da animação de saída terminar).
- Marca a ficha como `aria-hidden="true"` e `tabindex="-1"` na hora,
  para leitores de tela e navegação por Tab não "verem" mais algo que
  já foi removido logicamente.
- Só então toca a animação CSS de encolher/sumir e remove o elemento
  do DOM ~200ms depois — puramente visual, sem bloquear nada.

### 5.7 — Ícones: SVG em vez de emoji

O SILQ usa emoji como ícone (🧲⚡🔗). O SIFI troca isso por SVG de
linha, pelo mesmo estilo que o SILQ já usa no chevron do accordion e
no logo do cabeçalho. Duas razões práticas, além da estética:

- **Emoji renderiza diferente em cada sistema** — o 🧲 do Windows não
  é o mesmo desenho do 🧲 do Android ou do iPhone (cor, traço,
  ângulo mudam). SVG desenhado à mão é **idêntico em qualquer
  navegador e sistema**.
- **Emoji não herda cor** — não dá para pintar um 🧲 de azul quando o
  Módulo 1 está ativo. Um SVG com `stroke="currentColor"` herda a
  cor do texto ao redor automaticamente — é por isso que o mesmo
  ícone do Módulo 2 aparece laranja no painel e também laranja no
  indicador flutuante, sem precisar de dois desenhos.

`SIFI.ICONS` (`js/ui/icones.js`) guarda cada SVG usado em mais de um
lugar (os 3 módulos, fechar, biblioteca, átomo, lixeira, hambúrguer,
controles). No HTML, um elemento só precisa de `data-icon="modulo1"`
e `SIFI.aplicarIcones()` (chamado uma vez na inicialização) preenche
o desenho — o HTML fica limpo, sem SVG longo escrito dentro dele.

Duas exceções que NÃO usam `SIFI.ICONS`:
- **`FORCE_TYPES.icon`** (dados-forcas-intermoleculares.js) — como é
  a CAMADA DE DADOS, carrega antes do `namespace.js` e não pode
  depender de nada, então o SVG de cada força (gota, ímã, brilho)
  fica escrito por extenso ali mesmo.
- **O ícone do indicador de módulo ativo** — muda em tempo real
  conforme o módulo, então é preenchido diretamente via
  `.innerHTML = cfg.icon` em `ativacao-modulos.js` (que aí sim lê de
  `SIFI.ICONS`, evitando desenhar o mesmo SVG duas vezes).

### 5.8 — Biblioteca expandida: 34 compostos, busca, filtro e ordenação

A base do SILQ (`moleculas-prontas.js`, 49 moléculas prontas do
painel de VSEPR) foi o ponto de partida: boa parte da geometria
2D das moléculas novas (H₂O₂, O₃, HCN, CH₃CHO, N₂O, CCl₄, SiH₄, BF₃,
SF₆, CS₂...) veio de lá, copiada sem alteração. O que o SILQ não
tinha — ponto de ebulição e massa molar — foi pesquisado (ver
"Fontes dos dados" abaixo) e adicionado a CADA uma das 34 moléculas,
porque é isso que transforma "identificar uma força" em "comparar a
força de verdade":

- **6 fazem Ligação de Hidrogênio**: H₂O, NH₃, HF, CH₃OH, HCOOH, H₂O₂
- **10 fazem Dipolo-Dipolo**: HCl, HBr, HI, SO₂, H₂S, CH₃Cl, O₃, HCN,
  CH₃CHO, N₂O
- **18 fazem só Forças de London**: CH₄, CO₂, F₂, Cl₂, Br₂, N₂, O₂,
  He, Ne, Ar, Kr, Xe, PH₃, CCl₄, SiH₄, BF₃, SF₆, CS₂

Alguns pares foram escolhidos de propósito para gerar comparações
interessantes na caixa de areia:

- **NH₃ vs. PH₃** — mesma forma piramidal, mas só a NH₃ faz ligação
  de hidrogênio (ΔEN(P,H) ≈ 0, então a "amônia de fósforo" é apolar).
- **CO₂ vs. SO₂**, **BF₃ vs. NF₃-like (CH₃Cl assimétrico)**, **CCl₄
  vs. CH₃Cl**, **SF₆, BF₃, SO₃-like** — o mesmo tipo de ligação polar
  pode gerar uma molécula POLAR ou APOLAR dependendo só da simetria.
  BF₃ é o caso mais extremo: a maior diferença de eletronegatividade
  de toda a biblioteca (ΔEN = 1,94) e ainda assim é apolar.
- **Br₂ vs. CH₃OH** — Br₂ é apolar (só London) e ainda ferve mais
  alto (58,8°C) que o metanol, que faz ligação de hidrogênio
  (64,7°C, quase empatado!) — só porque o Br₂ é uma molécula bem
  mais pesada. Força mais forte não é a única coisa que decide o
  ponto de ebulição.
- **He, Ne, Ar, Kr, Xe** — os 5 gases nobres monoatômicos, todos só
  com London, em ordem crescente de ponto de ebulição conforme o
  átomo fica maior/mais polarizável.

**Interface**: com 34 itens, uma lista simples de rolar não bastava
mais, então a Biblioteca ganhou (dentro do painel, sidebar direita):
- Uma **busca** por nome ou fórmula (reaproveita `.pt-search-input`,
  a mesma classe que o SILQ usa na busca da tabela periódica).
- **Filtros por força** — Todos / Ligação de Hidrogênio / Dipolo-
  Dipolo / London (reaproveita `.mol-cat-btn`/`.active-cat`, a mesma
  classe das abas de categoria do painel "Moléculas Prontas" do
  SILQ) — assim dá pra isolar só um tipo de força e comparar só
  entre elas.
- Um **seletor de ordenação** — Nome (A-Z) ou Ponto de Ebulição
  (crescente/decrescente) — pra literalmente enxergar a fila de
  quem ferve primeiro.

A lógica de filtrar (`SIFI.filtrarMoleculas`) foi separada de quem
desenha a lista (`SIFI.buildMenuMoleculas`) de propósito: a primeira
não toca no DOM, só recebe o estado (busca/filtro/ordenação) e
devolve a lista certa — isso é o que permite testar "o filtro
funciona?" sem precisar simular clique nenhum.

**Fontes dos dados** (pontos de ebulição e massas molares
pesquisados para as moléculas que o SILQ não tinha): Wikipedia
(artigos individuais de cada composto — H₂O₂, N₂O, O₃, HCN, CH₃CHO,
CCl₄, BF₃, SF₆, Krypton, Xenon, Noble gas data page) e fontes
técnicas de fabricantes/fichas de segurança para SiH₄ e CS₂. Os
valores de HBr, HI, SO₂, H₂S, CH₃Cl, CH₃OH, HCOOH, PH₃, Br₂ (e os 6
originais H₂O/NH₃/HF/HCl/CH₄/CO₂/F₂) são valores padrão de tabela
periódica/livro-texto amplamente documentados.

**Pontos de fusão** (`meltingPoint`, pesquisados numa etapa
posterior, quando o Módulo 2 ganhou o estado sólido — seção 6.7):
mesmas fontes de referência (Wikipedia, NIST WebBook, Britannica,
ChemicalBook) para as 34 substâncias, com atenção especial aos dois
casos que fogem da regra — CO₂ e SF₆ sublimam a 1 atm (sem fase
líquida estável: o valor de fusão registrado só existe em pressões
bem mais altas) e o Hélio nunca solidifica a 1 atm (precisa de ~25
atm), confirmados cruzando várias fontes antes de tratar como caso
especial no código, não só simplificados/ignorados.

### 5.9 — Sem cartão, sem identificação: só os átomos interagindo

Até a etapa anterior, cada molécula na caixa de areia aparecia dentro
de um cartão (fundo, borda, sombra) com a fórmula escrita embaixo.
Isso foi removido de propósito:

- **`.sifi-molecule` não tem mais fundo, borda nem sombra** — só os
  átomos, ligações e polos δ+/δ− soltos na tela. O `padding: 10px`
  continua existindo, mas invisível: é só uma área de toque confortável
  ao redor dos átomos finos, pra não ficar difícil de arrastar/tocar
  bem em cima de um círculo pequeno. Ao passar o mouse ou focar, um
  `filter: drop-shadow(...)` contorna a SILHUETA dos átomos (não um
  retângulo) — dá feedback visual sem reintroduzir uma "caixa".
- **O rótulo com a fórmula foi removido do HTML** (não só escondido
  por CSS). O atributo `title` (que mostraria um tooltip nativo do
  navegador ao passar o mouse) também não é mais escrito.
- **O `aria-label` continua completo** (nome, fórmula, instruções de
  arrastar/remover) — isso não é uma "brecha" que entrega a resposta
  visualmente: só quem usa leitor de tela ouve essa informação, e sem
  ela a pessoa simplesmente não consegue usar o simulador. Acessibilidade
  não é sacrificada em nome do exercício visual.

A ideia pedagógica: o aluno raciocina sobre a interação observando a
FORMA e os POLOS visíveis na tela — nenhuma legenda entrega "isto é
água" de graça. A identificação de qual composto é qual só aparece
depois, no painel **Interações** (sidebar direita), como conferência
da análise visual, não como cola colada na molécula.

### 5.10 — Painel "Interações": várias ao mesmo tempo, não só uma

Antes, o painel da direita mostrava só o par de moléculas MAIS
PRÓXIMO — um problema real assim que a caixa de areia passa a ter 3+
moléculas, porque aí é perfeitamente possível ter duas (ou mais)
interações acontecendo ao mesmo tempo, cada uma com sua força
diferente (ex.: duas águas fazendo Ligação de Hidrogênio enquanto,
do outro lado da tela, uma delas também está perto de um CO₂ fazendo
só London).

`SIFI.updateForceDetection()` (sandbox.js) agora percorre TODOS os
pares de moléculas, não só procura o mais próximo — cada par dentro
do raio de interação vira uma linha tracejada na caixa de areia E uma
entrada na lista do painel. O painel mostra:

- **Quantas substâncias** estão na caixa de areia agora (contagem
  simples de `SIFI.canvasMolecules`).
- **Quantas interações estão ativas** neste exato momento.
- **Uma lista, uma linha por interação**: ícone + nome da força
  (colorido) + os dois compostos envolvidos (por fórmula — aqui sim,
  o nome aparece, porque o painel é a "conferência", não a molécula).

Cada interação **nova** (que não existia no cálculo anterior) pisca
uma vez ao entrar na lista (`SIFI.interacoesAtivas`, um `Set` com as
chaves `"idA-idB"` já vistas, comparado a cada novo cálculo) — assim
dá pra perceber quando uma nova ligação se forma sem precisar reler a
lista inteira toda vez, mas sem ficar piscando sem parar enquanto ela
continua ativa.

**Agrupamento com contador ("×N"):** com muitas moléculas na caixa de
areia (20+), é comum ter várias interações IGUAIS ao mesmo tempo —
várias águas próximas umas das outras, todas fazendo "Ligação de
Hidrogênio" entre si. Listar cada par separado (a mesma linha
repetida 12 vezes seguidas) não ajuda em nada. `renderInteracoesPanel`
agrupa por **força + par de compostos** (fórmulas ordenadas
alfabeticamente, então "HCl + H₂O" e "H₂O + HCl" caem no mesmo grupo)
e mostra **uma linha só**, com um selo `×N` quando há mais de um par
naquele grupo. O contador de "interações ativas" no topo do painel
continua mostrando o número BRUTO (todos os pares, sem agrupar) — só
a LISTA agrupa; a estatística não perde precisão.

Um grupo pisca se **pelo menos um** dos pares dentro dele for novo
neste cálculo — não precisa que TODOS sejam novos. A ordem da lista é
fixa (Ligação de Hidrogênio → Dipolo-Dipolo → London, depois
alfabética pelo par) e não muda conforme os contadores sobem ou
descem a cada tick — se reordenasse por contagem, a lista ficaria
"pulando" de lugar toda hora, difícil de acompanhar.

### 5.11 — Rotação: cada molécula gira em torno do próprio eixo

Até aqui, a física só movia (translação); a orientação da molécula
nunca mudava. Isso não bate com a química de verdade: dipolos
GIRAM para se alinhar de um jeito favorável antes de (e enquanto)
se atraem. Esta etapa adiciona rotação de verdade, com uma regra
diferente para cada tipo de força:

**Moléculas polares (dipolo-dipolo / ligação de hidrogênio):**
quando têm uma interação polar ativa por perto, giram para alinhar o
PRÓPRIO dipolo com a molécula vizinha — δ+ "liderando" rumo ao δ− da
outra (o alinhamento cauda-cabeça, de menor energia). As DUAS
moléculas do par giram para a MESMA direção (a da reta que liga os
dois centros) — é assim que dois dipolos reais se alinham ao se
aproximar. **Sem** interação polar ativa, a molécula fica parada:
nada está "chamando" ela para girar.

**Moléculas apolares (só London):** giram devagar e livremente O
TEMPO TODO, em qualquer sentido, mesmo sozinhas na caixa de areia —
porque não existe orientação "certa" para uma molécula sem polo
fixo. É exatamente por isso, quimicamente, que a força de London não
depende de direção nenhuma: sem dipolo permanente, não há alinhamento
preferencial a buscar.

**Como funciona por dentro** (`js/simulation/fisica-intermolecular.js`):
1. Cada molécula, ao ser criada, calcula seu próprio
   `dipoloAngleLocal` (`SIFI.dipoloAngleLocal`, em `menu-moleculas.js`)
   — o ângulo, no referencial DELA MESMA (sem nenhuma rotação ainda),
   de onde aponta o dipolo: do centroide do(s) polo(s) δ− para o
   centroide do(s) polo(s) δ+. `null` para moléculas apolares.
2. A cada tick de física, para cada par com interação dipolo-dipolo/
   ligação de hidrogênio ativa, calcula-se o ângulo da reta que liga
   os dois centros — esse é o alvo de rotação (mundo) das DUAS.
3. Para girar de verdade a ficha até esse alvo, subtrai-se o
   `dipoloAngleLocal`: a ficha precisa girar até que
   `dipoloAngleLocal + rotação da ficha = alvo`.
4. `SIFI.anguloMaisCurto(atual, alvo)` acha o caminho angular mais
   curto entre dois ângulos (de 350° para 10° é +20°, não -340° dando
   a volta inteira) — sem isso, a molécula giraria pelo caminho
   errado toda vez que cruzasse 0°/360°.
5. A cada tick, a rotação anda uma fração (`SIFI.ROTATION_EASING`,
   10%) do caminho que falta — um "amortecimento" suave, sem
   trancos, até estabilizar no alvo.
6. Se a molécula tiver MAIS de uma interação polar ativa ao mesmo
   tempo, só a MAIS PRÓXIMA decide o alvo de rotação daquele tick —
   é a que "pesa mais" fisicamente.
7. Moléculas apolares somam, a cada tick, um `tumbleSpeed` fixo
   (sorteado uma vez na criação, entre -1,1°/tick e +1,1°/tick) — giro
   livre, contínuo, sem alvo.
8. Molécula sendo arrastada (`dragging: true`) não gira sozinha nos
   dois casos — o usuário está com o controle dela.

A rotação em si é aplicada como `transform: rotate(...)` na PRÓPRIA
ficha (`.sifi-molecule`), com `transform-origin: center` — não muda
nada no desenho SVG interno (continua sendo montado do mesmo jeito,
sem rotação nenhuma "de fábrica"); é a ficha inteira que gira ao
redor do seu centro geométrico. Como `transform` não muda o tamanho
do elemento (`offsetWidth`/`offsetHeight` continuam os mesmos), o
cálculo do CENTRO da molécula (usado em tudo: física, distância,
linha de interação) não precisa de nenhum ajuste especial.

**O que muda no cálculo dos polos:** antes, a posição de cada δ+/δ−
era só "canto da ficha + deslocamento fixo". Agora, o deslocamento
(guardado em `poloLocal`, relativo ao CENTRO da ficha, não mais ao
canto) precisa ser GIRADO pelo ângulo atual da molécula antes de
somar à posição do centro na tela (`SIFI.polosAbsolutos`, em
`sandbox.js`) — senão o δ+/δ− "ficaria parado" enquanto o desenho
gira ao redor dele.

**Uma consequência importante:** como a rotação agora resolve a
orientação, a força de translação para dipolo-dipolo/ligação de
hidrogênio deixou de inverter de sinal conforme os polos mais
próximos — ela SEMPRE atrai (a intensidade certa para cada força).
O que antes era "polos errados → repele" virou "polos errados → a
molécula gira até alinhar" — mais correto quimicamente: a força
está lá o tempo todo, só a orientação inicial não estava favorável.

### 5.12 — Auditoria: responsividade do cabeçalho, ponto a ponto com o SILQ

Como `css/sifi-styles.css` é cópia byte-a-byte de `stylesilq.css`
(conferido com `diff`, sem nenhuma diferença), TODAS as regras
responsivas do cabeçalho do SILQ já existem no SIFI — o que precisava
de conferência de verdade era se o **HTML** usa exatamente as classes/
estrutura que esse CSS espera, porque CSS certo com HTML errado
simplesmente não tem efeito nenhum. Levantei cada `@media` que toca
o cabeçalho no SILQ e confirmei, uma por uma, contra o `index-sifi.html`:

1. **`@media(max-width:900px)`** — abaixo de 900px, os botões
   `.mobile-menu-btn` aparecem (`display:flex`) e as sidebars viram
   gavetas deslizantes (`position:fixed`, `transform:translateX`) —
   já coberto desde a etapa de responsividade mobile (ver seção
   anterior sobre `menu-mobile.js`).
2. **Rótulo do botão "Voltar" preservado** — o SILQ tem uma regra que
   ESCONDE o texto do botão de voltar em telas pequenas
   (`.header-back span{ display:none; }`, dentro do mesmo `@media
   900px` acima) e, DE PROPÓSITO, um segundo bloco `@media(max-width:
   900px)` escrito no FIM do arquivo que **desfaz** isso
   (`.header-back span{ display:inline; }`) — o comentário do próprio
   SILQ explica o motivo: "uma seta sozinha não diz PARA ONDE leva".
   Como CSS resolve empates de especificidade pela ORDEM (a regra
   escrita depois vence), e o SIFI usa o arquivo inteiro sem cortar
   nada, esse "conserto" já se aplica igual. Conferido: o `<span>`
   dentro de `.header-back` no SIFI tem texto de verdade ("Voltar"),
   não é só o ícone.
3. **Subtítulo cede espaço, mas sem sumir pra leitor de tela** — o
   `.header-sub` (a linha "Simulador Interativo de...") é escondido
   visualmente em telas pequenas com a técnica de "visually hidden"
   (`position:absolute; width:1px; height:1px; clip-path:inset(50%)`),
   nunca com `display:none` — que apagaria a informação também para
   quem usa leitor de tela. Conferido: o `.header-sub` do SIFI está
   no mesmo lugar na árvore (`.header-brand > div`, logo depois do
   `<h1>`) que essa regra espera.
4. **`@media(max-width:640px)`** — garante que o botão "Voltar"
   continua existindo mesmo em telas muito estreitas (a regra comenta
   que "1º Ano" — 6 caracteres — cabe em 320px depois que o
   subtítulo saiu; o rótulo do SIFI, "Voltar", também tem 6
   caracteres, então a mesma conta vale).
5. **`@media(pointer:coarse)`** — em telas de toque, o botão "Voltar"
   ganha uma área de toque de 44×44px (mínimo do WCAG 2.5.5) via um
   `::after` posicionado por cima, sem mudar o tamanho visual do
   botão nem a altura do cabeçalho.

**O que eu corrigi:** só um pequeno descompasso de CONTEÚDO, não de
responsividade — o `aria-label` do botão "Voltar" no SIFI estava
"Voltar aos simuladores" (mais curto que o do SILQ, "Voltar aos
simuladores do 1º Ano"), mesmo os dois apontando pro mesmo hub
(`indexprimeiroano.html`). Alinhei o texto para ficar consistente.

**O que eu NÃO mudei:** reparei que o SILQ tem uma regra
`@media(prefers-reduced-motion:reduce)` que reaplica a MESMA animação
do logo em vez de desligá-la — não faz o que o nome promete. Isso já
vem assim no arquivo original (e o SIFI herdou, por ser cópia exata).
Não mexi nisso agora porque não foi o que foi pedido e alterar
`sifi-styles.css` quebraria a decisão de arquitetura de mantê-lo como
cópia fiel — mas fica registrado aqui como um ajuste válido para uma
etapa futura de acessibilidade, se você quiser.

### 5.13 — Desempenho: física fluida, análise desacoplada

Com muitas moléculas na caixa de areia (20+), o número de PARES cresce
como combinação, não como soma: 21 moléculas → até 210 pares possíveis.
Antes desta etapa, TUDO rodava junto, a cada tick de física (60×/s):
mover/girar as moléculas, procurar todos os pares em interação, apagar
e redesenhar TODAS as linhas SVG do zero, e reconstruir o HTML inteiro
da lista do painel "Interações". Mexer em DOM é a parte cara desse
conjunto — e estava rodando 60 vezes por segundo mesmo quando nada de
relevante tinha mudado desde o frame anterior.

A ideia central: **movimento precisa ser fluido; análise não precisa
ser instantânea**. Ninguém percebe a lista de interações atualizando
a 10× por segundo em vez de 60× — mas o processador percebe MUITO a
diferença entre desenhar 60 ou 600 elementos SVG por segundo. Três
mudanças, nenhuma delas tocando na sensação de fluidez do movimento:

1. **Detecção/redesenho desacoplados do tick de física**
   (`SIFI.INTERACAO_RENDER_A_CADA`, em `estado.js`, valor `6`): o
   `physicsTick` (`fisica-intermolecular.js`) continua movendo e
   girando toda molécula em TODO tick, sem exceção — é isso que
   mantém a animação sem solavancos. Só a chamada para
   `SIFI.updateForceDetection()` (que decide quais pares interagem,
   desenha linhas e atualiza o painel) passou a rodar a cada 6 ticks
   (~96ms, uns 10×/s) em vez de a cada 1. Chamadas DIRETAS a essa
   função — ao adicionar/remover uma molécula, ou durante o arraste —
   continuam imediatas, sem esse espaçamento: são eventos pontuais do
   usuário, não um loop contínuo, então não pesam do mesmo jeito.
2. **Linhas SVG limitadas às interações mais próximas**
   (`SIFI.MAX_LINHAS_DESENHADAS`, valor `60`): com 100+ pares ativos,
   desenhar uma linha tracejada para CADA UM tanto sobrecarrega quanto
   vira um emaranhado ilegível na tela. Agora só os pares mais
   próximos (as interações "mais fortes" naquele instante) ganham
   linha, até esse limite. Os NÚMEROS do painel (substâncias,
   interações ativas, e o contador "×N" de cada grupo — etapa 5.10)
   continuam contando TODOS os pares, sem nenhuma exceção: só o
   DESENHO da linha é limitado, a análise continua completa.
3. **Pula reconstruir a lista quando nada mudou**
   (`SIFI._ultimaAssinaturaPainel`): a cada render, monta-se uma
   "assinatura" (texto curto) resumindo os grupos atuais
   (força+par+quantidade). Se for idêntica à do render anterior — e
   nenhum grupo for nova interação —, a lista NÃO é reconstruída (é
   comum, com moléculas já "assentadas" numa configuração estável,
   recalcular o mesmo resultado repetidas vezes seguidas). Mesmo
   pulando a reconstrução, uma limpeza barata garante que a classe de
   "piscar" (`.interacao-nova`) de um render anterior não fique presa
   para sempre num item que já não é mais novidade.

**Resultado medido** (21 moléculas de água bem próximas, gerando ~200
pares ativos, simulando 2 segundos a 60fps = 120 ticks): a detecção/
redesenho, que antes rodaria 120 vezes nesses 2 segundos, agora roda
20 — e o número de linhas SVG desenhadas fica travado no limite
configurado, mesmo com todos os pares sendo contados corretamente
nos números do painel (ver seção 5.14 sobre por que esse limite
subiu de 60 para 150 depois).

### 5.14 — Teto de interações: duas camadas, calibradas com teste de verdade

Testando a versão anterior com muitas moléculas de propósito (128
tentativas de adicionar BF₃/CCl₄ bem próximas), dois problemas
apareceram: (1) com centenas de pares ativos e só 60 linhas
desenhadas, várias moléculas que ESTAVAM interagindo de verdade
pareciam soltas na tela, sem nenhuma linha as conectando — o limite
de desenho (seção 5.13) criava uma inconsistência visual; (2) nada
impedia a simulação de crescer para milhares de interações (1382, no
teste), só a exibição das linhas era limitada.

**Correção do problema 1 — `SIFI.MAX_LINHAS_DESENHADAS` subiu de 60
para 150.** A conta muda porque o CONTEXTO mudou: esse limite existe
pensando em "quantas linhas por segundo", não "quantas linhas de uma
vez". Antes da etapa 5.13 (throttle), a detecção rodava a 60×/s, então
60 linhas já significavam ~3.600 linhas/s. Com o throttle a ~10×/s,
150 linhas dão só 1.500 linhas/s — folgado, e ainda assim resolve boa
parte do "parece que não está interagindo".

**Correção do problema 2 — dois portões em `SIFI.addMoleculeToSandbox`,
não um só:**

1. **Portão de interações** (`SIFI.MAX_INTERACOES_ATIVAS = 1000`) —
   recusa adicionar mais compostos se `SIFI.interacoesAtivas.size` já
   estiver no teto. É a proteção PRINCIPAL, porque reage à posição
   REAL das moléculas: barra o jeito mais comum de crescer sem
   controle, clicar "adicionar" repetidas vezes na Biblioteca.
2. **Portão de moléculas** (`SIFI.MAX_MOLECULAS_SANDBOX`) —
   complementar ao de cima: o portão de interações sozinho só olha o
   número de pares NO MOMENTO do clique, nada impede que moléculas
   JÁ colocadas se aproximem depois via física e ultrapassem o teto
   sozinhas. Este segundo portão é uma capacidade máxima pra própria
   caixa de areia.

**Como esse segundo número foi calibrado — e por que mudou de 45 para
90 depois:** a primeira versão calculava esse teto para o "pior caso
matemático absoluto" — TODAS as N moléculas mutuamente coladas ao
mesmo tempo, C(N,2) = N×(N−1)/2 pares, o que dava N=45 para garantir
<1000 SEMPRE, não importa a posição. Só que isso é fisicamente
exagerado: a física sempre mantém uma distância mínima de colisão
entre moléculas (~48px, `SIFI.REPEL_COLISAO`) — elas nunca ficam
*todas* realmente coladas ao mesmo tempo. Calculado pro pior caso
absoluto, 45 deixava a caixa de areia injustamente vazia pro uso
normal.

Em vez de simplesmente "chutar" um número maior, simulei o
agrupamento mais apertado que a física É CAPAZ de produzir de
verdade: um empacotamento **hexagonal** (mais denso que uma grade
quadrada) no limite exato da distância de colisão, e medi quantas
interações cada quantidade de moléculas gera nesse cenário:

| Moléculas | Interações (hexagonal, no limite de colisão) |
|---|---|
| 80 | 859 |
| 85 | 914 |
| 88 | 959 |
| **90** | **983** ✅ ainda abaixo de 1000 |
| 92 | 1004 ❌ já passa |
| 95 | 1049 ❌ |
| 100 | 1114 ❌ |

**90** é o maior valor com folga confirmada abaixo do teto de
interações, mesmo no agrupamento mais denso fisicamente possível —
o dobro do valor original (45), testado, não só calculado na teoria.

**O aviso discreto** (`#interacoes-limite-aviso`, dentro do painel
"Interações") aparece quando QUALQUER um dos dois portões está
fechado, com o texto certo pra cada caso — montado em JavaScript a
partir das constantes (`SIFI.MAX_INTERACOES_ATIVAS`/
`SIFI.MAX_MOLECULAS_SANDBOX`), nunca escrito fixo no HTML, pra nunca
ficar dessincronizado se os números mudarem no futuro. O menu de
moléculas da Biblioteca também "apaga" nesse estado (reaproveitando a
mesma classe `.grid-bloqueado` que já existia para "Módulo 1
inativo" — `SIFI.atualizarBloqueioMenu`, agora chamada também a
cada render do painel de interações, não só na ativação do módulo).

**Testado com o cenário real** que expôs o problema, com os números
finais: 200 tentativas de adicionar BF₃ bem próximos resultam em
exatamente 90 moléculas na caixa de areia (o resto é recusado);
aglomerando essas 90 no empacotamento hexagonal mais apertado
fisicamente possível, as interações ficam em 983 — nunca 1382, nunca
1000.

---

## 6. Módulo 2 — Termostato Molecular (Estados Físicos e Ebulição)

Segunda etapa grande do SIFI: conecta as forças intermoleculares do
Módulo 1 à energia térmica — por que substâncias diferentes fervem
em temperaturas diferentes. Segue a especificação original ponto a
ponto: um béquer fechado com ~40 partículas da mesma substância, um
termostato (slider de temperatura) e um gráfico Temperatura×Tempo.

### 6.1 — Cada partícula é a estrutura molecular real, não uma bolinha

**Decisão revisada.** A primeira versão desenhava cada partícula do
béquer como uma bolinha colorida simples, com a justificativa de que
o Módulo 2 é sobre ENERGIA CINÉTICA e ESTADO FÍSICO (não FORMA e
ORIENTAÇÃO, como o Módulo 1), então "quantas partículas, se movendo
quão rápido, presas ou livres" bastaria — como um diagrama de teoria
cinética dos gases de livro didático.

Na prática, isso deixava o béquer sem graça nenhuma visualmente, e
pedagogicamente jogava fora justamente a informação mais interessante:
dá muito mais impacto literalmente VER a molécula de água (ou o ácido
fluorídrico, ou o metano) fervendo — com seus átomos, ligações e
polos δ+/δ− visíveis — do que uma bolinha abstrata que podia ser
qualquer coisa. `js/ui/beaker.js` agora usa `SIFI.buildMoleculeMiniSVG`
(a MESMA função que desenha as moléculas do Módulo 1, versão pequena)
pra cada uma das 40 partículas, em vez de um `<div>` colorido.

O medo original era desempenho — mas o próprio Módulo 1 já prova que
isso não é problema: ele anima até 90 estruturas iguais a essas ao
mesmo tempo, a 60×/s, com física de pares completa (seção 5.13/5.14).
O béquer só tem 40, atualizando a 20×/s (`SIFI.TERMOSTATO_DT` = 50ms)
— bem mais folgado. Cada partícula ainda ganha um leve brilho na cor
da força dominante da substância (`--particula-cor`, mesma paleta de
`FORCE_TYPES`) — uma pista visual rápida sem esconder o desenho.

### 6.2 — O dado central já existia: `boilingPoint`

Nenhum dado novo precisou ser criado: as 34 substâncias de
`dados-forcas-intermoleculares.js` (Módulo 1) já tinham
`boilingPoint` desde o início — é literalmente o dado que este
módulo precisa. A lista "Escolha o Líquido" (`termostato-lista.js`)
reaproveita `INTERMOL_MOLECULES` inteiro, com a MESMA técnica de
lista+busca da Biblioteca do Módulo 1 (reaproveita até a classe CSS
`.composto-item`) — a única diferença de comportamento é que aqui é
**seleção única**: escolher um líquido novo troca o que já estava no
béquer, não adiciona mais um.

### 6.3 — A física: agitação térmica + evaporação/condensação

`js/simulation/fisica-termostato.js` roda a cada 50ms (mais devagar
que o Módulo 1 — agitação térmica não precisa da mesma fluidez que
um arraste de mouse). Para cada partícula:

- **Líquida**: balança (movimento browniano) com intensidade
  proporcional à temperatura do termostato (`SIFI.calcularAmplitudeTermica`).
  Se a temperatura estiver ACIMA do ponto de ebulição REAL da
  substância, tem uma chance a cada tick de escapar pro estado
  gasoso — a chance cresce quanto mais quente acima do ponto de
  ebulição (`SIFI.calcularChanceEscape`): bem na hora de ferver,
  escapa devagar; bem mais quente, escapa rápido.
- **Gasosa**: se move mais livre e mais rápido, na zona de cima do
  béquer. Se a temperatura CAIR de volta pra abaixo do ponto de
  ebulição, tem uma chance de condensar e voltar (`SIFI.calcularChanceCondensa`)
  — a física real funciona nos dois sentidos, o simulador também.

Essas três funções são deliberadamente **simplificações didáticas**
(a curva real de evaporação depende de pressão de vapor, área de
superfície, e muito mais) — o que importa é a LIÇÃO: "quanto mais
quente acima do ponto de ebulição, mais rápido evapora", que é
exatamente o que se testa (seção 7, grupo 23).

**Confirmado com um teste de ponta a ponta**, a 50°C: a água (ferve
a 100°C) continua 100% líquida; o acetaldeído (ferve a 20,2°C) e o
HCl (ferve a −85°C) evaporam completamente — o contraste central que
a especificação original pedia.

### 6.4 — "A ligação covalente não quebrou" — explícito na tela

A especificação pede que fique claro que ferver não quebra nenhuma
ligação química, só afasta as moléculas umas das outras.
`SIFI.atualizarStatusTexto` (beaker.js) mostra uma nota fixa
(`#beaker-nota-covalente`) sempre que a substância está fervendo, e
a esconde de novo assim que a temperatura cai — usando o MESMO
`--forca-cor` amarelo/âmbar já usado em outros avisos do projeto,
não uma cor nova.

**Um bug real que os testes pegaram:** a primeira versão só tinha
código pra MOSTRAR a nota (`if (acima) { ...hidden = false; }`), sem
nunca escrever o caminho contrário — ela ficava presa visível pra
sempre depois da primeira vez que fervia, mesmo esfriando de novo.
A correção: sempre define os dois estados explicitamente
(`SIFI.beakerNotaCovalente.hidden = !acima;`, incondicional, antes
do `if`), não só "quando aparece".

### 6.5 — O gráfico Temperatura × Tempo: SVG puro, sem D3

O SILQ tem um gráfico (`grafico-energia.js`), mas ele depende do
D3.js (CDN externa) pra desenhar uma curva de energia potencial de
ligação — nada a ver com "temperatura ao longo do tempo", e uma
dependência a mais que poderia falhar se a CDN estivesse fora do ar.
`js/ui/grafico-temperatura.js` desenha tudo com SVG puro, do mesmo
jeito que `SIFI.drawInteractionLine` (Módulo 1) já desenha linhas —
consistente com o resto do projeto.

O domínio do eixo Y (faixa de temperatura mostrada) se AJUSTA à
substância atual (inclui o ponto de ebulição dela, a temperatura de
agora, e o histórico recente, com margem) — um domínio FIXO
cobrindo a faixa inteira do slider (−270 a 200) deixaria o gráfico
de quase toda substância minúsculo perto de uma escala pensada pra
caber o Hélio também. Uma linha tracejada horizontal marca sempre o
ponto de ebulição real, então dá pra ver visualmente o momento em
que a curva de temperatura cruza essa marca.

### 6.6 — Ativação: troca de VISÃO inteira, não só de conteúdo

Diferente do Módulo 1 (que só liga/desliga interações dentro da
MESMA caixa de areia), o Módulo 2 tem uma interface visual totalmente
diferente — um béquer, não uma caixa de areia livre. `ativacao-modulos.js`
ganhou uma função nova, `atualizarVisibilidadePorModulo(num)`, que:

- Alterna `#canvas-wrapper` (Módulo 1) e `#beaker-wrapper` (Módulo 2)
  via a classe `.hidden` — só um dos dois aparece por vez.
- Esconde/mostra cada painel da sidebar direita conforme o atributo
  `data-modulo="1"` ou `data-modulo="2"` que ele carrega no HTML —
  a Biblioteca e Interações somem quando o Módulo 2 está ativo; a
  lista de líquidos e o Termostato somem quando é o Módulo 1.
- Liga o loop de física certo (`SIFI.startSimLoop` ou
  `SIFI.startTermostatoLoop`) e para os dois ao trocar de módulo
  (`pararTodosOsLoops()`) — nunca os dois rodando ao mesmo tempo,
  já que só um é visível.

### 6.7 — Estado sólido: a terceira fase, e dois casos especiais

A primeira versão do Módulo 2 só tinha líquido↔gás — "Estados
Físicos" de verdade precisa das TRÊS fases, com dois pontos de
transição (fusão E ebulição), não só um. Isso exigiu três coisas:
dado novo (`meltingPoint`, pesquisado e conferido pras 34 substâncias
— ver a lista de fontes abaixo), um terceiro estado de partícula
(`'solido'`), e dois pontos de transição na física em vez de um.

**Sólido e líquido dividem a MESMA zona do béquer** (`beaker-liquido-zona`)
— não existe uma "zona sólida" separada. O que muda é o
COMPORTAMENTO: uma partícula sólida fica presa numa posição FIXA de
grade regular (`SIFI.calcularPosicaoGrade`, uma rede cristalina
simplificada), só vibrando ao redor desse ponto
(`SIFI.TERMOSTATO_VIBRACAO_SOLIDO`) sem nunca se afastar dali de
verdade — `p.x`/`p.y` não mudam enquanto sólida, só o desenho na tela
balança um pouco a cada tick. Líquida balança livre pela zona inteira
(movimento browniano, como já era). É a mesma ideia de um cubo de
gelo boiando num copo de água: os dois "moram" no mesmo espaço
físico, só a organização é diferente.

**As partículas já nascem no estado certo pra temperatura atual** —
antes, escolher um líquido sempre criava partículas líquidas, não
importa a temperatura do termostato. Agora, se o termostato já
estiver frio o bastante quando você escolhe a água, ela nasce
congelada (`estadoInicialPara`, em beaker.js), não líquida — mais
correto e evita um "derretimento instantâneo" estranho logo na
criação.

**Duas funções novas, mesmo formato das duas que já existiam**
(`SIFI.calcularChanceFusao`/`SIFI.calcularChanceSolidificacao`,
espelhando `calcularChanceEscape`/`calcularChanceCondensa`) — mesma
ideia física aplicada ao OUTRO ponto de transição: zero até cruzar a
marca, cresce suavemente depois. `js/simulation/fisica-termostato.js`
agora tem três ramos (sólida/líquida/gasosa) em vez de dois, cada um
checando as transições que fazem sentido pra aquele estado.

**Dois casos especiais, verificados na literatura, não simplificados
por baixo do tapete:**

1. **CO₂ e SF₆ SUBLIMAM** (`sublima: true`) — a 1 atm, essas duas não
   têm fase líquida ESTÁVEL: vão direto de sólido pra gás (é por isso
   que gelo-seco nunca "derrete", só "fuma"). O simulador pula a fase
   líquida inteira pra elas: sólido vira gás direto ao cruzar o
   "ponto de ebulição" (que, pra essas duas, é na prática o ponto de
   sublimação), e gás volta direto pra sólido ao esfriar de novo
   (deposição) — nunca passando por líquido em nenhum momento,
   testado (grupo 27, seção 7) rodando a física 300 ticks seguidos e
   conferindo que nenhuma partícula ficou líquida em NENHUM instante.
2. **Hélio nunca solidifica a 1 atm** (`meltingPoint: null`) — o
   único caso assim entre as 34 substâncias. Mesmo a -270°C (quase o
   zero absoluto), continua líquido ou gás — um efeito quântico
   genuíno das forças de London ultra-fracas do Hélio, que precisa de
   ~25 atm de pressão pra solidificar. O painel explica isso em texto
   quando o Hélio está selecionado, em vez de esconder a peculiaridade.

**Gráfico**: ganhou uma segunda linha tracejada (azul, a mesma cor já
usada pra ligação de hidrogênio — nenhuma cor nova), marcando o ponto
de fusão, ao lado da linha âmbar do ponto de ebulição que já existia.
Só não aparece pro Hélio (`meltingPoint === null` → sem linha, já que
não existe uma marca real pra desenhar).

---

## 7. Módulo 3 — Laboratório de Solubilidade (Misturas e Densidade)

Terceira e última etapa grande do SIFI: conecta a polaridade das
moléculas (Módulo 1) à regra clássica "semelhante dissolve
semelhante". Dois tubos de ensaio virtuais, uma prateleira com 6
reagentes, e uma única regra de compatibilidade que decide TODOS os
casos da especificação original.

### 7.1 — Cinco substâncias novas, pesquisadas e verificadas

A especificação pedia Água (já existia), Óleo de Soja, Álcool
Etílico, Iodo sólido e Sal de Cozinha — nenhum desses 4 últimos
existia em `dados-forcas-intermoleculares.js`. Acrescentei também
Hexano, que não estava na lista original mas é necessário pro
"Desafio do Iodo": a especificação pede pra comparar iodo em água
(não dissolve) com iodo num solvente apolar (dissolve) — sem um
solvente apolar líquido na prateleira, essa comparação não dava pra
fazer.

Cada substância ganhou um campo NOVO, `density` (g/mL, a 20°C) — o
dado central deste módulo, que decide quem flutua sobre quem. Fontes:
Wikipedia, ChemicalBook, NIST WebBook e patentes/artigos técnicos
(a densidade do óleo de soja, 0,917 g/mL, e do etanol, 0,789 g/mL,
vieram de uma mesma fonte — uma patente que documenta os dois se
separando em camadas de verdade, uma confirmação experimental direta
do que o simulador precisa mostrar).

**Duas decisões de simplificação, documentadas explicitamente no
código, não escondidas:**

1. **Óleo de Soja é uma simplificação deliberada.** Um triglicerídeo
   de verdade (3 cadeias de ácido graxo presas a um glicerol) é grande
   e complexo demais pra desenhar átomo por átomo com clareza numa
   ficha pequena. A representação usada é só UMA cadeia hidrocarbônica
   longa e apolar — o que importa pra lição deste módulo é justamente
   isso: uma molécula GRANDE, toda apolar, sem grupo nenhum que faça
   ligação de hidrogênio com a água. `apenasModulo3: true` também
   marca essa entrada: sem `boilingPoint`/`meltingPoint` reais (óleo é
   uma MISTURA, sem ponto de fusão/ebulição único), ela não aparece no
   Termostato do Módulo 2, que precisa desses dois valores pra
   funcionar.
2. **Sal de Cozinha (NaCl) não é uma molécula covalente** como todo o
   resto da lista — é uma rede cristalina de íons Na⁺ e Cl⁻ se
   atraindo eletricamente. `ionico: true` marca esse caso especial, e
   `apenasModulo3: true` mantém o sal fora da Biblioteca (Módulo 1) e
   do Termostato (Módulo 2): os dois modelam explicitamente forças
   INTERMOLECULARES entre moléculas covalentes, e ligação iônica é um
   paradigma diferente — colocar o sal no sandbox do Módulo 1, por
   exemplo, faria a física tratar "Na-Cl" como uma molécula London
   comum, o que é conceitualmente errado.

Álcool Etílico, Hexano e Iodo, ao contrário, são moléculas covalentes
normais — ficam disponíveis de graça na Biblioteca do Módulo 1 e no
Termostato do Módulo 2 também, sem nenhum código extra: o Módulo 1
ganhou 3 substâncias novas pra comparar (37 no total agora, visíveis
nos dois primeiros módulos — 39 contando as 2 exclusivas do Módulo 3).

### 7.2 — Uma regra só decide todos os casos da especificação

`SIFI.saoCompativeis(molA, molB)` (fisica-solubilidade.js) é
deliberadamente simples — duas substâncias são compatíveis se tiverem
a MESMA polaridade (iônico conta como "polar" pra este fim, já que
íons interagem bem com solventes polares por atração íon-dipolo):

```js
SIFI.saoCompativeis = function saoCompativeis(molA, molB) {
  const polarA = molA.ionico ? true : molA.polar;
  const polarB = molB.ionico ? true : molB.polar;
  return polarA === polarB;
};
```

Essa ÚNICA função, chamada em UM lugar (`SIFI.classificarTubo`),
resolve os 3 casos da especificação e mais um bônus:

- Água(polar) + Óleo(apolar) → incompatíveis → **camadas por densidade**
- Água(polar) + Álcool(polar) → compatíveis → **mistura homogênea**
- Iodo(apolar) + Água(polar) → incompatíveis → **cristal intocado**
- Iodo(apolar) + Hexano(apolar) → compatíveis → **cristal dissolve**
- Sal(iônico≈polar) + Água(polar) → compatíveis → **dissolve, em íons**

### 7.3 — Líquido + líquido: camadas por densidade OU mistura livre

Quando os dois reagentes são líquidos, `SIFI.classificarTubo` decide
na hora (assim que o segundo reagente é adicionado, sem esperar o
primeiro tick de física):

- **Incompatíveis**: cada substância fica confinada numa FAIXA
  VERTICAL fixa dentro do tubo, ordenada pela densidade REAL — a mais
  densa embaixo. `fisica-solubilidade.js`'s `labTick` mantém essa
  restrição a cada tick (sem ela, com o tempo a agitação iria misturar
  tudo, o que seria fisicamente errado pra duas fases realmente
  imiscíveis) — é isso que faz a separação durar, não é só a posição
  inicial.
- **Compatíveis**: SEM restrição nenhuma — as partículas das duas
  substâncias se movem livres por TODO o tubo, a "dança molecular" da
  especificação.

### 7.4 — Sólido + líquido: dissolve aos poucos, ou nunca

Um sólido (Iodo ou Sal) nasce amontoado perto do fundo do tubo — um
"cristal" ainda inteiro, com cada partícula numa posição fixa que só
vibra no lugar (mesma técnica do sólido do Módulo 2). A cada tick,
SE compatível com o líquido base, cada partícula do cristal tem uma
chance pequena (`SIFI.LAB_CHANCE_DISSOLVER`, 2% por tick) de se
soltar e passar a se mover livre pelo tubo — dissolvendo aos poucos,
não tudo de uma vez. Se incompatível, essa chance nunca é testada: o
cristal fica intacto pra sempre, só balançando no lugar.

**Testado com o cenário exato da especificação** ("Desafio do
Iodo"): dois tubos, um com Água+Iodo, outro com Hexano+Iodo, rodando
400 ticks de física em paralelo — o iodo na água continua 100% em
cristal; o iodo no hexano dissolve.

### 7.5 — Sal dissolve em ÍONS, não em "moléculas" intactas

Esse é o detalhe cientificamente mais interessante do módulo. Iodo é
covalente — quando uma "unidade" se solta do cristal, ela continua
sendo uma molécula I₂ inteira (o par de átomos permanece unido, só se
afasta das vizinhas). Sal é diferente: NaCl sólido não tem
"moléculas" de verdade, é uma rede de íons. Então, quando uma unidade
do cristal de sal se solta (`SIFI.separarEmIons`), ela não continua
como um par grudado — **se separa em duas partículas independentes**,
um Na sozinho e um Cl sozinho, cada uma desenhada como sua própria
"molécula-fantasma" de 1 átomo só (reaproveitando a MESMA
`SIFI.buildMoleculeMiniSVG` que desenha moléculas de verdade — ela
não se importa se recebe 1 átomo ou 20).

**Testado**: um tubo com Água+Sal, rodando a física até dissolver —
o número de partículas de sal EXATAMENTE DOBRA em relação aos pares
originais (cada par vira 2 íons), e existem partículas dos dois tipos
de íon (Na e Cl) espalhadas pelo tubo, não pares intactos.

### 7.6 — Dois tubos independentes, pra comparação lado a lado

A especificação pede "dois tubos de ensaio" — a razão fica clara no
"Desafio do Iodo": comparar Água+Iodo vs. Hexano+Iodo SIMULTANEAMENTE,
lado a lado, é o que realmente demonstra a lição ("mesmo soluto,
solventes diferentes, resultados diferentes"). `SIFI.laboratorio.tuboAtivo`
controla pra qual tubo a prateleira está adicionando agora; o botão
"Limpar tubo selecionado" só afeta o tubo ativo, os outros continuam
intocados (testado explicitamente).

### 7.7 — Prateleira expandida: de 6 para 17 reagentes

A versão original tinha só os 6 reagentes literais da especificação.
Expandi pra 17, de duas formas:

1. **6 reaproveitados da Biblioteca do Módulo 1**, que já tinham a
   geometria pronta — só ganharam `density` (o dado que faltava pro
   Módulo 3): Metanol, Ácido Fórmico, Peróxido de Hidrogênio, Bromo,
   Tetracloreto de Carbono, Dissulfeto de Carbono.
2. **5 substâncias inteiramente novas**, pesquisadas do zero:
   Acetona, Ácido Acético, Glicerina, Clorofórmio, Éter Etílico —
   todas com geometria própria, `boilingPoint`/`meltingPoint`/`density`
   reais (o que significa que também ficam disponíveis de graça nos
   Módulos 1 e 2, um bônus da arquitetura de dados compartilhada).

**Fontes**: Wikipedia (List of boiling and freezing information of
solvents — confirma density/bp/mp de vários de uma vez), ChemicalBook
(Ácido Acético, Glicerol), e o próprio artigo de Snyder (ver 7.8) pra
polaridade. Glicerina rendeu um bom contraste pedagógico: com 3
hidroxilas na mesma molécula (contra 1 do etanol), ferve a 290°C —
quase 4× mais alto — e é visualmente óbvio o porquê no desenho (3
pares de polos δ+/δ−, não 1).

### 7.8 — Regra de compatibilidade: de binária pra um espectro contínuo

A primeira versão de `SIFI.saoCompativeis` comparava só o booleano
`polar` de cada substância (a mesma categoria = compatível). Isso
tem um limite real: a acetona (bem polar) se mistura tanto com água
QUANTO com hexano (bem apolar) — o "solvente versátil" clássico de
laboratório —, e uma regra de "mesma categoria" NUNCA capturaria
isso (nenhuma das duas caixas, polar ou apolar, explica a acetona se
dar bem com as duas pontas do espectro ao mesmo tempo).

A correção: troquei `polar` (booleano) por `polaridade` (número, o
**Índice de Polaridade de Snyder** — L.R. Snyder, *Journal of
Chromatography*, 92 (1978) 223-234, o mesmo dado usado de verdade em
química analítica pra escolher solventes de cromatografia), e
`SIFI.saoCompativeis` virou uma diferença dentro de um limite
(`SIFI.LAB_LIMITE_POLARIDADE = 5.0`), não mais uma comparação de
categoria:

```js
SIFI.saoCompativeis = function saoCompativeis(molA, molB) {
  const diff = Math.abs(molA.polaridade - molB.polaridade);
  return diff <= SIFI.LAB_LIMITE_POLARIDADE;
};
```

**O limite (5,0) foi calibrado, não chutado** — testei contra ~12
pares reais de miscibilidade/solubilidade conhecidos (água+etanol
miscíveis, água+hexano não, iodo+hexano dissolve, acetona+água E
acetona+hexano miscíveis nos dois...) até achar o maior valor que
acerta todos ao mesmo tempo.

**Uma exceção documentada, não escondida**: clorofórmio (índice 4,1)
fica dentro do limite de compatibilidade com a água (índice 9,0,
diferença 4,9) segundo essa regra — mas na química real, clorofórmio
é praticamente imiscível com água (só traços se dissolvem). Isso é
uma limitação conhecida e registrada explicitamente no comentário da
entrada do CHCl₃ em `dados-forcas-intermoleculares.js`: a polaridade
de Snyder mede afinidade cromatográfica, não é um preditor perfeito
de miscibilidade — o simulador é uma simplificação didática, e
simplificações têm limites, que preferi documentar a esconder ou
forçar um número "errado" só pra fazer esse caso específico bater.

Substâncias iônicas (NaCl) recebem `polaridade: 10` — ACIMA até da
água, de propósito: fica fora da escala de Snyder (que mede
solventes moleculares), mas a atração íon-dipolo é genuinamente mais
forte que a dipolo-dipolo comum, então um valor alto captura essa
realidade sem precisar de um caso especial na lógica.

### 7.9 — De 2 substâncias fixas pra N substâncias: agrupamento em fases

A versão original só aceitava "base + 1 adicionado" (exatamente 2
substâncias por tubo). Pra aceitar até 5, o modelo de dados mudou de
dois campos fixos (`baseKey`/`adicionadoKey`) pra uma lista
(`tubo.substancias`, array de até 5 chaves) — e a física precisou
generalizar de "compatível ou não" (um par) pra "quantas FASES essas
N substâncias formam" (`SIFI.agruparPorFase`).

**O algoritmo** (deliberadamente simples): ordena as substâncias
líquidas pela polaridade, anda pela lista ordenada, e agrupa cada uma
com a anterior se a diferença estiver dentro do limite, ou começa um
grupo novo se não estiver:

```js
SIFI.agruparPorFase = function agruparPorFase(mols) {
  const ordenados = mols.slice().sort((a, b) => a.polaridade - b.polaridade);
  const fases = [[ordenados[0]]];
  for (let i = 1; i < ordenados.length; i++) {
    const diff = Math.abs(ordenados[i].polaridade - ordenados[i-1].polaridade);
    if (diff <= SIFI.LAB_LIMITE_POLARIDADE) fases[fases.length - 1].push(ordenados[i]);
    else fases.push([ordenados[i]]);
  }
  return fases;
};
```

**Limitação reconhecida, não escondida**: compatibilidade nem sempre
é perfeitamente transitiva na química real (A compatível com B, B
compatível com C, não GARANTE que A seja compatível com C se a
cadeia for longa demais) — mas pro número de substâncias que cabem
num tubo (até 5), esse algoritmo dá um resultado determinístico e
razoável, testado com 3 substâncias polares reais (água, álcool
etílico, acetona) formando corretamente 1 fase só.

Cada fase resultante vira uma FAIXA VERTICAL do tubo (a mais densa
embaixo, calculada pela densidade MÉDIA da fase) — a generalização
natural de "2 líquidos incompatíveis formam 2 camadas" pra "N
líquidos formam K fases". Sólidos verificam compatibilidade contra
CADA fase presente (não só um booleano do tubo inteiro) — um sólido
pode ser compatível com a fase de cima e incompatível com a de baixo
ao mesmo tempo, e as partículas que se soltam do cristal vão
especificamente pra banda da fase compatível, não pro tubo inteiro.

### 7.10 — Tubos dinâmicos: de 2 fixos pra até 10, criados em tempo de execução

A versão original tinha exatamente 2 `<div>` de tubo escritos direto
no HTML (`#tubo-coluna-1`, `#tubo-coluna-2`). Pra aceitar até 10, os
tubos viraram inteiramente DINÂMICOS: `#lab-tubos` é um contêiner
vazio no HTML, e cada tubo é montado do zero por `SIFI.criarTubo()`
— que cria o `<div>`, guarda as referências de DOM **direto no objeto
do tubo** (`tubo.dom.corpo`, `tubo.dom.legenda`...), e registra os
próprios listeners de clique.

**Por que guardar as referências no objeto do tubo, e não num array
separado indexado por posição** (como o Módulo 1/2 fazem com seus
elementos fixos): um array por posição quebra fácil ao remover um
tubo do meio — se o Tubo 2 de `[1,2,3]` for removido, o array vira
`[1,3]`, e qualquer código que faça `array[id-1]` erra feio. Guardar
a referência DENTRO do próprio objeto do tubo, e sempre localizar por
`.find(t => t.id === id)`, é imune a essa classe inteira de bug —
não importa a ordem ou quais tubos existem, cada um sempre sabe onde
está seu próprio HTML.

`SIFI.laboratorio.proximoIdTubo` só cresce, nunca reusa um ID já
usado — remover o Tubo 2 e adicionar um novo não faz esse novo virar
um "Tubo 2 fantasma" diferente do que existia antes; ele vira Tubo 4
(ou o próximo número disponível), sem ambiguidade nenhuma.

**Consistência com os outros dois módulos**: ativar o Módulo 3 sempre
cria exatamente `SIFI.LAB_TUBOS_INICIAIS` (2) tubos frescos — sair
dele (trocar de módulo, ou desativar) deixa `laboratorio.tubos = []`
de verdade, o mesmo padrão de "sem módulo ativo, sem estado nenhum"
que `canvasMolecules=[]` (Módulo 1) e `particulas=[]` (Módulo 2) já
tinham. Isso exigiu separar duas funções que antes eram uma só:
`SIFI.limparLaboratorioCompleto()` (esvazia de verdade, sem recriar
nada — usada ao SAIR do módulo) e `SIFI.resetLaboratorio()` (esvazia
E recria os 2 padrão — usada especificamente ao ATIVAR o Módulo 3).

---

## 7.11 — Correção: o SIFI não lia as preferências de acessibilidade da Central

Um bug real, achado depois de conferir a estrutura de acessibilidade do
SILQ com atenção: o `<head>` do SIFI já tinha TUDO que parecia
necessário — o script `../a11y.js` da Central carregando primeiro, os
4 filtros SVG de simulação de daltonismo, o `#colorblindOverlay`, os
atributos `data-theme`/`data-colorblind`/etc no `<html>`. Visualmente,
parecia pronto. **Mas nada lia o resultado.**

O SILQ tem um arquivo específico pra isso — `js/a11y/preferencias.js`
— que é o único que de fato faz a ponte: lê `window.A11Y.estado`
(o objeto que `../a11y.js` deixa pronto) e aplica no `<body>` (classes
`.light-mode`, `.high-contrast`, `.simple-read`) e no `#colorblindOverlay`
(o filtro CSS certo). **Esse arquivo nunca tinha sido copiado pro
SIFI** — só o `anuncios.js` (avisos pra leitor de tela) tinha sido
reaproveitado antes. Sem ele, `../a11y.js` carregava e calculava tudo
certinho em `window.A11Y`, mas literalmente nada no SIFI ia buscar
esse valor — os filtros de cor, o alto contraste, o tema claro, todos
mudos, mesmo com a Central mandando o valor certo.

### Por que o botão "Voltar" está ligado a esse bug

O comentário original do SILQ (preservado no arquivo copiado) explica
a conexão: antes de ser corrigido no SILQ, o código antigo lia a URL
primeiro e, se ela viesse "limpa" — **exatamente o que acontece ao
clicar em "Voltar" pro hub, dar F5, ou abrir um favorito** —, caía no
`localStorage` PRÓPRIO do simulador (que tem tema escuro como padrão),
sobrescrevendo o que `../a11y.js` tinha acabado de aplicar certinho a
partir da memória global da Central. Eram dois sistemas de preferência
disputando o mesmo `<body>`. A correção (já presente no SILQ, e agora
também no SIFI): `window.A11Y.estado` é sempre a fonte da verdade
quando existe — a URL/localStorage só serve de reserva pro caso de o
SIFI ser aberto ISOLADO, fora da Central, sem `../a11y.js` disponível.

### O que foi copiado — quase sem alteração nenhuma

`js/a11y/preferencias.js` é uma IIFE completamente independente, sem
NENHUMA referência ao namespace SIFI nem a nenhuma das ~150 variáveis
internas do SILQ original — só mexe em `document.body`,
`document.documentElement`, `localStorage` e `window.A11Y`. Isso
significa que o arquivo funciona igual em QUALQUER simulador da
Central sem precisar adaptar nada de específico. A única mudança real
foi renomear um hook opcional (`__silqRefreshThemedColors` →
`__sifiRefreshThemedColors`) — um gancho pra recolorir elementos que
não seguem variável CSS sozinhos; o SIFI não usa isso ainda, mas o
gancho fica pronto pro dia que precisar, sem custo nenhum (é só um
`typeof === 'function'` que não faz nada se a função não existir).

Posicionado no HTML exatamente onde o SILQ posiciona — logo depois de
`namespace.js`, antes de `estado.js`/`dom-refs.js` — pra aplicar as
preferências o quanto antes, antes do resto do app terminar de montar
a tela.

### Testado com um `window.A11Y` simulado

Como `../a11y.js` é externo (fica FORA da pasta do projeto, num
caminho relativo que não existe neste ambiente de teste isolado), os
testes injetam um `window.A11Y` falso ANTES de rodar os scripts do
SIFI (`novaPaginaComA11Y`, um helper novo em `test-sifi.js`) — a única
forma de testar `preferencias.js` de verdade sem depender do arquivo
real da Central. Confirmado: tema claro, alto contraste e leitura
simples da Central são aplicados no `<body>`; o filtro de daltonismo
certo é ligado no overlay; a escala de fonte vira a variável CSS;
SEM a Central presente, cai no padrão (tema escuro) sem erro nenhum;
uma atualização ao vivo por mensagem da Central (o usuário muda algo
lá com o SIFI já aberto) é aplicada na hora; mensagens de origem que
não é a Central são ignoradas (ninguém de fora consegue injetar
preferência no SIFI).

---

## 7.12 — Correção: tubos encolhem pra caber, em vez de rolar

O tamanho de cada tubo era calculado só a partir do viewport
(`width: min(120px, 26vw)`) — nunca considerava QUANTOS tubos
existiam. Com poucos tubos isso é inofensivo, mas com 7-8+ numa tela
pequena, o resultado é óbvio: os tubos continuam "grandes" (120px),
sobra menos espaço do que precisa, e `#lab-tubos` recorre à barra de
rolagem (`overflow-y: auto`) como saída — exatamente o que apareceu
na imagem que motivou esta correção.

**A solução: calcular o tamanho de verdade, não só herdar do
viewport.** `SIFI.calcularLayoutTubos(n, larguraDisponivel, alturaDisponivel)`
é uma função PURA (não mexe em DOM, só recebe números e devolve
números — testável isolada) que resolve um problema clássico de
empacotamento: testa cada número de colunas possível (1 até N — como
N nunca passa de 10, testar até 10 opções é instantâneo, não precisa
de nada mais esperto que força bruta) e escolhe o que resulta no
MAIOR tubo (mantendo a proporção largura/altura do desenho original)
sem estourar nem a largura nem a altura disponíveis.

```js
SIFI.calcularLayoutTubos = function calcularLayoutTubos(n, larguraDisponivel, alturaDisponivel) {
  let melhor = { area: 0, largura: SIFI.TUBO_LARGURA_MIN, colunas: 1 };
  for (let colunas = 1; colunas <= n; colunas++) {
    const linhas = Math.ceil(n / colunas);
    const larguraPorTubo = (larguraDisponivel - gap * (colunas - 1)) / colunas;
    const alturaPorTubo = (alturaDisponivel - gap * (linhas - 1)) / linhas - SIFI.TUBO_ALTURA_EXTRA;
    let largura = Math.min(larguraPorTubo, alturaPorTubo * SIFI.TUBO_ASPECT, SIFI.TUBO_LARGURA_MAX);
    if (largura * largura > melhor.area) melhor = { area: largura * largura, largura, colunas };
  }
  return melhor;
};
```

`SIFI.atualizarTamanhoTubos()` MEDE o espaço de verdade
(`SIFI.labTubosContainer.getBoundingClientRect()`), chama a função
pura acima, e aplica o resultado como variáveis CSS
(`--tubo-largura`, `--tubo-altura`, `--particula-tamanho`) no
container — o CSS (`.tubo-corpo`, `.tubo-particula`) passou a ler
essas variáveis, com o valor antigo (`min(120px, 26vw)`) como
FALLBACK só pro instante antes do primeiro cálculo rodar.

**Chamada nos 3 momentos que mudam quantos tubos existem** —
`SIFI.criarTubo()`, `SIFI.removerTubo()` (ambos recalculam depois de
mudar a contagem) — e num listener de `resize` da janela (com um
pequeno debounce de 150ms, pra não recalcular a cada pixel arrastado
durante o redimensionamento, só quando o usuário parar).

**Dois detalhes que também precisavam mudar junto**, senão o
resultado ficaria estranho mesmo com o tamanho certo calculado:

1. **`border-radius` do tubo virou percentual**, não mais pixel fixo
   (`50px`/`34px` → `45%`/`26%`) — um tubo de 46px de largura com
   canto arredondado de 50px fixo ficaria com a base toda deformada;
   percentual escala junto com o tamanho automaticamente.
2. **O tamanho das partículas também ficou proporcional**
   (`--particula-tamanho`, calculado como ~28% da largura do tubo,
   com piso de 14px e teto de 30px) — sem isso, tubos bem pequenos
   ficariam com partículas do mesmo tamanho de sempre, ocupando o
   tubo inteiro e parecendo quebrado.

**Testado com o cenário exato da imagem**: 8 tubos num espaço de
~700×480px (uma janela estreita) — o cálculo confirma que o tamanho
resultante encolhe de verdade (abaixo do máximo de 120px) e, mais
importante, CABE no espaço disponível de verdade (conferido fazendo
a mesma conta que o CSS faria: largura total das colunas escolhidas
e altura total das linhas necessárias, as duas dentro do limite).
Testado também no extremo — 10 tubos (o teto) num espaço de celular
(360×500px) — sem travar, sem `NaN`, sempre dentro do piso/teto
definidos.

---

## 7.13 — Correção: dica "Ative o Módulo 1" presa na tela

Bug real, visível assim que qualquer outro módulo é ativado: o
`#canvas-wrapper` (a caixa de areia do Módulo 1, incluindo a dica
"Ative o Módulo 1 no menu ao lado") já vem VISÍVEL por padrão no HTML
— diferente de `#beaker-wrapper`/`#lab-wrapper`, que já nascem com
`class="hidden"`. O JavaScript (`atualizarVisibilidadePorModulo`)
trocava a classe `.hidden` em `#canvas-wrapper` corretamente sempre
que outro módulo assumia — mas **nenhuma regra CSS reagia a essa
classe especificamente para esse elemento**: `#beaker-wrapper.hidden`
e `#lab-wrapper.hidden` tinham a contrapartida (`display: none`),
`#canvas-wrapper.hidden` não. Resultado: a classe mudava no DOM, mas
visualmente nada acontecia — a caixa de areia (com a dica) continuava
ocupando espaço e aparecendo, não importa qual módulo estivesse
realmente ativo.

A correção é uma linha: `#canvas-wrapper.hidden { display: none; }`.
Como o jsdom não carrega folhas de estilo externas de verdade (falha
de resolução `file://`, sem rede disponível no ambiente de teste), o
teste automatizado confere o CONTEÚDO do arquivo CSS entregue
diretamente — mesmo padrão já usado pras media queries do cabeçalho
(grupo 16) — em vez de depender do cascade real do navegador.

## 7.14 — Módulo 3 ganha termostato por tubo + contador de estados

Duas peças que faltavam pro Módulo 3 ficar didaticamente completo,
pedidas juntas porque são a mesma ideia: mostrar as transformações
físicas através das forças intermoleculares, exatamente como o
Módulo 2 já faz — só que agora dentro de um tubo de ensaio, e com
cada tubo podendo estar numa temperatura DIFERENTE ao mesmo tempo.

### Dois mecanismos independentes, o mesmo tubo

A ideia central: FUSÃO (por temperatura) e DISSOLUÇÃO (por
solubilidade) são coisas quimicamente diferentes, e o simulador
agora modela as duas separadamente, podendo agir ao mesmo tempo no
mesmo sólido:

- **Temperatura** (`tubo.temperatura`, um termostato PRÓPRIO por
  tubo — dá pra comparar o mesmo composto em condições diferentes
  lado a lado) compara com o PONTO DE FUSÃO/EBULIÇÃO da própria
  substância (`SIFI.estadoFisicoNaTemperatura`, generalizada a partir
  do `estadoFisicoAmbiente` que já existia) — decide se ela está
  sólida, líquida ou gasosa AGORA, e faz a transição GRADUALMENTE,
  reaproveitando literalmente as MESMAS quatro funções de chance por
  tick já escritas pro Módulo 2 (`calcularChanceFusao/Escape/
  Condensa/Solidificacao`) — zero duplicação de lógica.
- **Solubilidade** (o que já existia — `SIFI.saoCompativeis`, o
  índice de polaridade) decide se um sólido consegue se DISSOLVER num
  líquido presente, independente de ter ou não atingido o próprio
  ponto de fusão.

**Testado explicitamente que os dois não se confundem**: iodo (apolar)
numa água (polar) a 20°C fica sólido e preso — não dissolve por
solubilidade. Aquecendo o TUBO acima de 113,7°C (o ponto de fusão
REAL do iodo), ele derrete — mecanismo de temperatura — mesmo
continuando quimicamente incompatível com a água. O contrário também
é real: sal (iônico) dissolve em água a QUALQUER temperatura razoável,
porque a atração íon-dipolo não depende de calor nenhum.

### Zonas verticais dentro do tubo

De cima pra baixo: **gás** (topo, `SIFI.LAB_ZONA_GAS_MIN/MAX`) →
**líquido** (várias camadas, se não forem todas compatíveis —
mecanismo que já existia) → **sólido** (cristal ainda preso, sempre
no fundo, `SIFI.LAB_ZONA_CRISTAL_MIN/MAX`). Uma linha tracejada bem
sutil no CSS (`.tubo-corpo::before`) marca onde a zona de gás termina,
sem ser uma "parede" de verdade.

### `SIFI.classificarTubo` virou idempotente, chamada a cada tick

Antes, essa função só rodava quando uma substância era adicionada.
Agora, como a TEMPERATURA pode mudar quais substâncias estão líquidas
AGORA a qualquer momento (inclusive sozinha, entre um tick e outro),
ela roda A CADA TICK — mas de um jeito que não causa nenhum
"teleporte" visual: partículas que já estão dentro da própria banda
de fase simplesmente ficam onde estão (a função só CLAMPA a posição
pra dentro dos limites, nunca sorteia uma posição nova se não
precisar). Só quando uma transição de fase de verdade acontece
(`transicionarEstadoFisico`, chamada pelo tick) é que a partícula
"pula" pra zona certa.

### Um bug pego no meio do desenvolvimento: texto de status "preso"

Rodando o cenário de teste (iodo derretendo por temperatura), o texto
do painel continuava dizendo "não dissolve" mesmo DEPOIS da partícula
já ter virado líquida de verdade — porque `gerarTextoStatusTubo` só
era chamado quando o usuário mexia no slider manualmente, não a cada
tick. Como as transições são GRADUAIS (chance por tick, não
instantâneas), uma transição podia terminar de acontecer vários
ticks DEPOIS do usuário ter soltado o slider — e o texto ficava
"congelado" na última leitura manual. Corrigido: o tick agora também
atualiza o texto de status (e o contador) do tubo ATIVO a cada
volta, mantendo a tela sincronizada com transições que estão
acontecendo sozinhas, sem precisar de nova interação do usuário —
exatamente o tipo de discrepância entre "estado interno" e "o que a
tela mostra" que os testes automatizados existem pra pegar.

### Contador sólido/líquido/gás — mesma UI do Módulo 2, por tubo

`SIFI.atualizarContadorEstadosTubo(tubo)` conta as partículas do tubo
ATIVO por `estadoFisico` e escreve nos mesmos elementos visuais
(`.interacoes-resumo`) já usados no painel "Termostato" do Módulo 2 —
mesma linguagem visual em todo o simulador, sem inventar um
componente novo.

---

## 8. Como testar que nada quebrou

`test-sifi.js` carrega a página inteira num navegador simulado
(jsdom) e roda **288 checagens automáticas**, em 42 grupos:

1. Estado inicial (nenhum módulo ativo, os TRÊS módulos com botão
   HABILITADO — Módulo 3 foi o último a deixar de estar desabilitado
   —, adicionar molécula sem ativar não faz nada).
2. Ativação/desativação do Módulo 1 (indicador, classe da caixa de
   areia, física ligando/desligando, toggle).
3. Adicionar molécula com o módulo ativo (ficha aparece, polos calculados).
4. Os três módulos estão habilitados — clicar no Módulo 3 ativa ele de verdade.
5. **Física real**: duas águas posicionadas com polos opostos mais
   próximos → a distância entre elas **diminui sozinha** ao longo de
   40 ticks de física (atração).
6. **Rotação corrige a orientação**: duas águas lado a lado nascem
   com os polos "errados" mais próximos (δ+/δ+) → depois de 120 ticks
   de física, as duas giraram de verdade (saíram de 0°) e os polos
   mais próximos viram opostos (δ+/δ−) sozinhos.
   **6B**: molécula apolar gira sozinha mesmo sem ninguém por perto
   (giro livre); molécula polar sozinha NÃO gira (nada pra alinhar);
   molécula em arraste (`dragging`) não gira sozinha.
7. CO₂+CO₂ (apolares) sempre se atraem fracamente (London).
8. Trocar/desativar módulo limpa a caixa de areia.
9. **Layout**: a Biblioteca de Compostos está dentro da `sidebar-right`
   (nunca na esquerda), os itens são uma lista por nome sem SVG de
   geometria, e o badge mostra a contagem certa (42, visíveis nos
   Módulos 1/2 — 44 no total, contando as 2 exclusivas do Módulo 3).
10. **Remover molécula**: duplo clique e tecla Delete
    removem do estado; a ficha vira `aria-hidden` na hora; remover
    uma não afeta as outras; confirma que o antigo botão "×" não
    existe mais (ele sobrepunha moléculas vizinhas).
11. **Ícones**: os ícones estáticos e os preenchidos via JS (indicador
    de módulo, força detectada) são `<svg>`, e uma varredura no
    `<body>` inteiro confirma que não sobrou nenhum emoji renderizado.
12. **Biblioteca — busca/filtro/ordenação**: buscar "água" encontra
    só a água; buscar "Cl" encontra vários halogenados; busca sem
    resultado mostra a mensagem certa; filtrar por força mostra a
    contagem exata de cada categoria (9 Ligação de Hidrogênio / 13
    Dipolo-Dipolo / 20 London); ordenar por ponto de ebulição coloca
    o Hélio primeiro (crescente) e a Glicerina primeiro (decrescente,
    290°C — a mais quente de todas depois da expansão) — os dois
    extremos reais da biblioteca.
13. **Sem caixa/rótulo + interações simultâneas**: a ficha não tem
    rótulo visível nem `title` revelando o composto (só o `aria-label`,
    para leitor de tela); com 3 moléculas posicionadas de propósito
    (duas águas próximas + um CO₂ perto de uma delas, mas longe da
    outra), o painel mostra corretamente 3 substâncias e 2 interações
    ativas ao mesmo tempo (uma Ligação de Hidrogênio, uma London), com
    2 linhas tracejadas desenhadas; uma interação só pisca como "nova"
    na primeira vez que é detectada, não a cada recálculo.
14. **Matemática da rotação isolada**: `SIFI.anguloMaisCurto` acerta o
    caminho mais curto entre dois ângulos (350°→10° dá +20°, não
    -340°); `SIFI.dipoloAngleLocal` calcula corretamente o eixo do
    dipolo da água (-90°, conferido à mão a partir da geometria) e
    retorna `null` para uma molécula apolar.
15. **Rotação no DOM de verdade**: o `style.transform` da ficha reflete
    a rotação atual depois de um tick de física; remover uma molécula
    limpa esse `transform` inline antes de aplicar a animação de saída
    (senão o `scale(0)` da saída não teria efeito nenhum, por causa da
    prioridade do estilo inline sobre a classe CSS).
16. **Cabeçalho — paridade estrutural com a responsividade do SILQ**:
    o botão "Voltar" tem ícone E texto (não só ícone); o subtítulo
    está no lugar certo na árvore do DOM; os dois botões de menu
    mobile existem dentro de `.header-right` e cada um referencia uma
    sidebar que existe de verdade; o CSS carregado contém as 3 media
    queries responsivas do cabeçalho copiadas do SILQ (900px, 640px,
    alvo de toque 44px).
17. **Agrupamento com contador**: 3 metanos formando um triângulo
    próximo geram 3 pares London idênticos → a lista mostra só 1 item
    com o selo "×3" (o contador bruto no topo continua mostrando 3);
    um composto isolado sem interação não quebra o agrupamento dos
    outros; um par único (sem repetição) não mostra selo nenhum.
18. **Desempenho**: em 60 ticks de física, a detecção/redesenho roda
    só 10 vezes (throttle); com mais pares ativos do que o limite de
    linhas, só o limite é desenhado de verdade — mas o contador do
    painel continua completo, sem cortar nada; recalcular sem nenhuma
    mudança de posição não recria os elementos da lista (mesma
    referência de nó antes e depois).
19. **Teto de interações — as duas camadas de proteção**: o portão de
    interações recusa adicionar quando já no teto, mostrando o aviso
    certo no painel; o portão de moléculas recusa adicionar mesmo
    quando o teto de interações ainda não foi atingido; o texto do
    aviso reflete o número real das constantes, não um valor fixo no
    HTML.
20. **Estresse com os valores reais (90/1000)**: 200 tentativas de
    adicionar resultam em no máximo 90 moléculas; empacotando essas 90
    no arranjo hexagonal mais apertado fisicamente possível (mesmo
    limite de distância que a física real usa), as interações ficam
    confirmadamente abaixo de 1000.
21. **Módulo 2 — ativação e troca de visão**: ativar mostra o béquer e
    esconde a caixa de areia; os painéis certos da sidebar direita
    aparecem/somem (`data-modulo="1"` vs `"2"`); voltar pro Módulo 1
    desfaz tudo corretamente.
22. **Módulo 2 — escolher líquido**: sem o módulo ativo, escolher não
    funciona (mesmo portão do Módulo 1); a lista mostra as 34
    substâncias; escolher cria 40 partículas líquidas com a ficha
    certa (nome, ponto de ebulição); cada partícula desenha a
    estrutura molecular REAL (átomos + ligações, não uma bolinha —
    a água mostra exatamente 3 círculos, 2 H + 1 O); trocar de
    líquido substitui as partículas (não acumula); esvaziar o béquer
    volta ao zero.
23. **Módulo 2 — física de fervura/condensação**: a 20°C (bem abaixo
    de 100°C) nenhuma molécula de água evapora; a 140°C, várias
    evaporam; esfriando de novo, o número em gás diminui (condensação
    de verdade); a nota "ligação covalente intacta" aparece só
    enquanto está fervendo, e SOME de novo ao esfriar (é o bug real
    que este teste pegou — ver seção 6.4).
24. **Módulo 2 — funções puras e gráfico**: chance de escapar é
    exatamente 0 no/abaixo do ponto de ebulição e cresce com a
    temperatura; chance de condensar segue o padrão oposto; o gráfico
    mostra texto vazio sem substância, e desenha a linha de
    temperatura + a marca do ponto de ebulição depois de girar o
    termostato.
25. **Módulo 2 — estado sólido nasce certo pra temperatura**: água a
    -10°C nasce toda sólida; a 20°C nasce toda líquida; a 150°C nasce
    toda gasosa; as 40 posições de grade das partículas sólidas são
    todas distintas entre si (sem sobreposição).
26. **Módulo 2 — fusão e solidificação de verdade**: água sólida
    aquecida acima do ponto de fusão derrete com o tempo (não só no
    nascimento); esfriando de novo bem abaixo do ponto de fusão,
    volta a solidificar.
27. **Módulo 2 — casos especiais**: CO₂ frio nasce sólido e, aquecido,
    vira gás SEM NUNCA passar pelo estado líquido em nenhum dos 300
    ticks testados (sublimação de verdade); Hélio a -270°C continua
    líquido, nunca solidifica, mesmo depois de rodar a física.
28. **Módulo 2 — funções puras de fusão/solidificação e gráfico**:
    chance de fundir é exatamente 0 no/abaixo do ponto de fusão;
    chance de solidificar cresce com o frio; todas as posições de
    grade ficam dentro de 0–100%; o gráfico desenha as duas linhas
    (fusão E ebulição) pra água, mas só uma (ebulição) pro Hélio, que
    não tem ponto de fusão a 1 atm.
29. **Módulo 3 — ativação cria 2 tubos, troca de visão**: antes de
    ativar, nenhum tubo existe; ativar cria exatamente 2 (o padrão
    pedido) e esconde a caixa de areia E o béquer; sair do módulo
    remove os tubos de verdade (não fica "escondido" em segundo
    plano); reativar cria 2 tubos frescos de novo, do zero.
30. **Módulo 3 — adicionar/remover tubos (até 10, nunca menos que 1)**:
    tentar adicionar 20 vezes nunca passa de 10 (o botão fica
    desabilitado no teto); remover libera o botão de novo; nunca deixa
    remover o último tubo; remover o tubo ATIVO seleciona outro
    automaticamente, sem deixar "no vácuo".
31. **Módulo 3 — prateleira (17 reagentes) e regras de preenchimento**:
    sem o módulo ativo, nada funciona; começar um tubo com um SÓLIDO é
    recusado; até 5 substâncias diferentes cabem no mesmo tubo; uma 6ª
    é recusada; repetir uma substância já presente é recusado.
32. **Módulo 3 — a regra central (`saoCompativeis`) e o agrupamento em
    fases**: testa os pares de compatibilidade reais (água×óleo,
    água×álcool, iodo×hexano, sal×água, e o "solvente versátil" —
    acetona compatível com água E hexano ao mesmo tempo);
    `SIFI.agruparPorFase` isolado: 3 substâncias próximas viram 1 fase,
    2 distantes viram 2, lista vazia não quebra.
33. **Módulo 3 — Água + Óleo (2 fases)**: classificados como
    incompatíveis; depois de rodar a física, a água (mais densa) fica
    comprovadamente mais embaixo que o óleo.
34. **Módulo 3 — três substâncias polares, 1 fase só (N>2 de verdade)**:
    água + álcool etílico + acetona no MESMO tubo formam uma única
    fase (não só o caso de 2 substâncias); a água se espalha livre
    pelo tubo inteiro, sem confinamento de camada.
35. **Módulo 3 — o Desafio do Iodo**: dois tubos rodando em paralelo
    (Água+Iodo vs. Hexano+Iodo, 400 ticks) — o iodo na água continua
    100% em cristal; o iodo no hexano dissolveu de verdade.
36. **Módulo 3 — Sal em Água dissolve em ÍONS**: começa com pares
    Na-Cl intactos; depois de dissolver, o número de partículas de sal
    DOBRA (cada par virou 2 íons independentes), com os dois tipos de
    íon (Na e Cl) presentes.
37. **Módulo 3 — limpar um tubo não afeta os outros nem o remove**:
    limpar o Tubo 2 esvazia só ele (o Tubo 1 continua intocado), e o
    tubo continua existindo no laboratório (diferente de removê-lo).
38. **Acessibilidade — lê e aplica as preferências da Central**: com
    um `window.A11Y` simulado (`novaPaginaComA11Y`), confirma que
    tema/contraste/leitura simples/daltonismo/escala de fonte são
    todos aplicados no `<body>`; sem a Central presente, cai no
    padrão (tema escuro) sem erro; uma mensagem ao vivo da Central é
    aplicada na hora; mensagens de origem errada são ignoradas.
39. **Módulo 3 — tubos encolhem pra caber, em vez de rolar**: com
    espaço de sobra, ficam no tamanho máximo; no cenário exato
    relatado (8 tubos, espaço apertado), o tamanho encolhe de
    verdade — e CABE no espaço disponível (conferido fazendo a mesma
    conta que o CSS faria); no extremo de 10 tubos num espaço de
    celular, não trava nem retorna `NaN`.
40. **Módulo 3 — termostato POR TUBO**: os dois tubos começam na
    mesma temperatura padrão; mexer no slider muda só o tubo ATIVO
    (o outro fica intocado); trocar de tubo ativo mostra a
    temperatura DELE no slider, não a do tubo anterior.
41. **Módulo 3 — ciclo completo de estados dentro de um tubo**: água
    a 20°C nasce líquida; esfriando pra -20°C congela por completo;
    esquentando pra 150°C vira gás por completo; voltando pra 20°C
    condensa de volta — o mesmo ciclo do Módulo 2, agora dentro de
    um tubo de ensaio.
42. **Módulo 3 — contador por tubo e independência entre os dois
    mecanismos**: iodo em água a 20°C fica sólido e preso (não
    dissolve por solubilidade); o contador na tela mostra a
    distribuição certa; aquecendo acima do ponto de fusão real do
    iodo, ele derrete por TEMPERATURA mesmo continuando incompatível
    por solubilidade; e o texto de status acompanha essa transição
    sozinho, sem precisar de nova interação do usuário.

Para rodar (precisa de Node.js instalado):
```bash
cd sifi
npm install jsdom
node test-sifi.js
```
Isso é opcional — a página funciona normalmente sem instalar nada,
o teste é só uma rede de segurança para quando você for mexer no
código depois e quiser ter certeza de que não quebrou nada.

---

## 9. Próximos passos (na ordem que eu sugiro)

Os TRÊS módulos da especificação original agora existem e funcionam
de ponta a ponta. O que resta é só polimento — nada bloqueado.

1. **Refinos possíveis do Módulo 1** (não bloqueiam nada, são polimento):
   contra-girar só o TEXTO dos símbolos δ+/δ− para ficarem sempre
   legíveis mesmo com a molécula rodada (hoje eles giram junto com o
   resto do desenho); um pequeno "flash" na própria ficha (não só no
   painel) no instante em que uma nova interação se forma; sons ou
   vibração ao formar uma ligação de hidrogênio.
2. **Refinos possíveis do Módulo 2** (idem, polimento): "bico de
   Bunsen" desenhado embaixo do béquer se acendendo conforme a
   temperatura sobe (hoje é só o slider numérico); tocar as duas
   substâncias lado a lado ao mesmo tempo pra comparação direta A/B
   (hoje é uma de cada vez, precisa trocar pra comparar); marcar no
   próprio gráfico o instante exato em que a primeira partícula
   evaporou, não só a linha do ponto de ebulição.
3. **Refinos possíveis do Módulo 3** (idem, polimento): linhas
   tracejadas (`#tubo-bonds-svg-N`, já existe no HTML mas ainda sem
   uso) conectando as moléculas de água que estão "hidratando" um íon
   de sal recém-dissolvido, reforçando visualmente a atração
   íon-dipolo; uma "seringa" ou "conta-gotas" animado(a) ao adicionar
   um reagente, em vez da partícula só aparecer; permitir escolher
   QUANTO de cada reagente adicionar (hoje é sempre a mesma
   quantidade fixa, `LAB_NUM_PARTICULAS_BASE`/`_ADICIONADO`).
4. Trocar as cores em `css/sifi-styles.css` quando você tiver a
   identidade visual definitiva do SIFI.

---

## 10. Decisões de engenharia que vale explicar

- **Por que copiar `tabela-elementos.js` e `eletronegatividade.js`
  em vez de só referenciar os arquivos do SILQ?** Porque o SIFI é
  (ou vai virar) um produto separado, hospedado em outra pasta/URL.
  Se o SIFI "importasse" arquivos de dentro da pasta do SILQ, uma
  mudança no SILQ quebraria o SIFI sem aviso. Copiar cria uma
  fronteira clara entre os dois projetos — o preço é que, se um dado
  científico for corrigido, precisa corrigir nos dois lugares (isso
  é uma troca consciente, não um descuido).
- **Por que `menu-mobile.js` foi copiado 100% igual, sem nem trocar `SILQ` por `SIFI`?**
  Porque esse arquivo específico nunca tocou no namespace — ele só lê
  e escreve em elementos de HTML por `id`/classe (`sidebar-left`,
  `mobile-backdrop`...). Como o SIFI usa os mesmos `id`s nesses
  elementos, o arquivo funciona sem alteração. Isso é sinal de que o
  arquivo original já era bem desacoplado — vale reparar nesse tipo
  de arquivo quando for escrever código novo: quanto menos ele
  depender de "SILQ." ou "SIFI.", mais fácil de reaproveitar depois.
- **Por que `sifi-extra.css` em vez de editar `sifi-styles.css`?**
  Para que trocar as cores do tema (`sifi-styles.css`, seu próximo
  passo) nunca exija mexer na estrutura (`sifi-extra.css`). Cada
  arquivo muda por um motivo diferente — isso é o princípio de
  "responsabilidade única" aplicado a CSS.
- **Por que a física usa a distância entre CENTROS pra decidir SE
  aplica força, mas a distância entre POLOS pra decidir a DIREÇÃO?**
  São perguntas diferentes: "essas duas moléculas estão perto o
  bastante pra interagir?" é sobre o conjunto da molécula (por isso
  centro); "esse encontro é atração ou repulsão?" depende de qual
  pontinha específica está mais perto (por isso polo). Misturar os
  dois numa contra só complicaria sem ganhar precisão.
- **Por que o sistema de ativação de módulo vive num arquivo
  separado (`ativacao-modulos.js`) e não dentro de `sandbox.js`?**
  Porque `sandbox.js` sabe fazer as coisas do Módulo 1 (adicionar
  molécula, detectar força), mas não devia precisar saber que existe
  um Módulo 2 ou 3. Quem sabe disso é o "gerente" (`ativacao-modulos.js`),
  que liga/desliga o que cada módulo precisa. Essa separação é o que
  permite adicionar o Módulo 2 sem tocar em uma linha do Módulo 1.
- **Um exemplo real de bug que os testes pegaram:** ao escrever os
  testes de remoção, o botão "×" removia a molécula do ESTADO na
  hora, mas o elemento visual continuava no DOM por mais 200ms
  (animação de saída) — e durante esse tempo ele ainda não tinha
  `aria-hidden`. Um teste que simulava "remover, depois adicionar
  outra, depois interagir com ela" pegou esse detalhe. A correção
  (marcar `aria-hidden="true"` e `tabindex="-1"` no exato instante em
  que a molécula sai do estado, não só quando o elemento é apagado de
  verdade) é o tipo de coisa fácil de esquecer sem um teste cobrando.

