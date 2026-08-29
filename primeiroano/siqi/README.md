# SIQI — Simulador Interativo de Química Inorgânica
### Guia da arquitetura refatorada

## O que mudou e o que NÃO mudou (na refatoração original)

- ✅ **Nenhum dado foi alterado na refatoração em si.** Os 100
  compostos catalogados, o banco de reações do Laboratório (centenas
  de reações, acumuladas em 7 "expansões"), as regras IUPAC e as
  reações de redox foram movidos com os mesmos valores.
- ✅ **Nenhuma funcionalidade foi alterada na refatoração em si.** Os
  3 módulos (Nomenclatura socrática, Construtor de nomenclatura por
  blocos, Redox com balanceamento íon-elétron), o Laboratório de
  reações livres com física de partículas, acessibilidade, menu
  mobile — tudo continuou igual na hora de separar os arquivos.
- ✅ **O projeto continua funcionando sem servidor** (`file://`), sem
  bundler.
- 📁 O que mudou foi **a organização dos arquivos**: `scriptsiqi.js`
  (2975 linhas) virou **27 arquivos** por camada/módulo.
  `dadossiqi.js` — de longe o maior arquivo de dados de toda a
  coleção de simuladores, 572 KB — virou **15 arquivos** temáticos.

> ⚠️ **Depois** dessa refatoração, uma rodada de atualizações reais
> de conteúdo/funcionalidade foi aplicada por cima da estrutura
> modular — ver seção "Atualizações aplicadas após a refatoração"
> logo abaixo. `stylesiqi.css` deixou de estar "intocado": algumas
> regras foram adicionadas/removidas junto com essas atualizações.

## Atualizações aplicadas após a refatoração

Depois que a estrutura em 42 arquivos foi validada (ver "Como isso
foi validado", abaixo), as seguintes mudanças de conteúdo e
funcionalidade foram aplicadas por cima dela:

1. **Construtor: 98 → 96 desafios.** Dois compostos (NaCl e H₂SO₄)
   existiam **duplicados** — uma vez como exemplo manual, outra como
   item gerado automaticamente do catálogo, cada um com uma
   decomposição diferente em blocos. As versões duplicadas geradas
   automaticamente foram removidas.
2. **Distratores expandidos.** A paleta de blocos de cada desafio do
   Construtor passou a ter, em média, ~8 blocos no total (corretos +
   distratores) — mesma densidade usada nas reações do Laboratório
   ("8 candidatos: 1 correto + 7 distratores plausíveis"). Antes,
   quase metade dos desafios não tinha distrator nenhum.
3. **Guia de Regras removido do Construtor.** O painel "Regras &
   Validador" da barra lateral virou só "Validador" — o guia de
   regras genéricas foi identificado como redundante com as
   "Informações do Composto" (dados químicos brutos) já mostradas ao
   lado. `js/data/regras-iupac.js` continua existindo como dado (não
   foi apagado), só deixou de ser renderizado.
4. **Alinhamento com a literatura de química inorgânica.** Pesquisa
   contra Atkins/Overton/Rourke/Weller/Armstrong, Miessler/Fischer/
   Tarr, Housecroft & Sharpe, J.D. Lee, Chang e Cotton/Wilkinson
   resultou em 2 correções: prefixo multiplicador composto
   "tetrakis" (grafia inglesa) → "tetraquis" (grafia em português,
   confirmada em múltiplas fontes universitárias brasileiras); os
   prefixos "hipo-"/"per-" dos ácidos HClO e HClO₄ passaram a ser
   blocos próprios (antes ficavam "grudados" no radical, ex.:
   "hipoclor" como um bloco só).
5. **Ordem dos módulos: Construtor antes de Nomenclatura.** O
   Construtor ensina a gramática (montar o nome do zero); a
   Nomenclatura serve depois como referência mais concisa/direta.
6. **Catálogo completo: 53 → 100 compostos.** A modularização original
   só tinha capturado os 53 compostos declarados diretamente no array
   inicial de `CATALOGO_SIQI` — os outros 47 eram adicionados no
   arquivo monolítico por dois blocos autoexecutáveis (`exp4`+`exp5`)
   fisicamente intercalados no meio de outras seções de dados
   (Experimentos, Reações), e a separação por arquivo não os capturou.
   Portados para `js/data/catalogo-compostos.js`.
7. **Auditoria completa da Estrutura Molecular + motor 3D do SILQ.**
   Ver seção dedicada logo abaixo.
8. **Módulo 3: Redox → Hibridização de Nuvens Eletrônicas.** A pedido
   explícito do usuário, o módulo de transferência de elétrons foi
   substituído por um módulo sobre hibridização de orbitais atômicos
   (sp/sp²/sp³/sp³d/sp³d²) em ligações químicas gerais. Ver seção
   dedicada mais abaixo.

## Auditoria da Estrutura Molecular + integração com o motor 3D do SILQ

O sistema de desenho da estrutura molecular de cada composto (na
Ficha) tinha um problema sério: só existiam **9 templates fixos** por
"tipo" de composto, e a maioria mostrava a estrutura **errada** — todo
`sal_ionico`, por exemplo, desenhava sempre "Na⁺⋯Cl⁻", mesmo pra
AgNO₃, K₂CO₃ ou CaSO₄. De ~83 compostos com um tipo específico, só
~9 mostravam o átomo/rótulo certo.

**A correção — reescrita orientada a dados:** o desenho 2D
(`js/render/lewis.js`) passou a fazer parsing real da fórmula de cada
composto (elemento a elemento, respeitando parênteses) e identificar
cátion/ânion por balanço de carga, em vez de usar rótulos fixos.
Validado contra os 100 compostos: 0 exceções, 0 rótulos incorretos.

**A integração com o SILQ:** por cima dessa correção, o card central
"Estrutura Molecular" da Ficha completa passou a ser desenhado pelo
**motor 3D do SILQ** (Simulador Interativo de Ligações Químicas) —
zero dependências externas, geometria calculada via VSEPR real
(Gillespie-Nyholm, regra de Bent) + banco de ângulos da literatura
(NIST/IUPAC), a partir só da topologia (quem está ligado a quem), não
de posições 2D arbitrárias.

Arquivos novos (`js/render/silq-integracao.js` é o único 100% novo;
os outros 3 são cópias do SILQ, quase-verbatim):

| Arquivo | Origem | O que faz |
|---|---|---|
| `js/data/elementos-silq.js` | Cópia verbatim do SILQ | Os 118 elementos (cor, raio, valência, EN) |
| `js/data/geometrias-moleculares-silq.js` | Cópia verbatim do SILQ | Banco de 80 geometrias exatas da literatura |
| `js/render/view3d-silq.js` | SILQ, com 1 adaptação | O motor de desenho 3D em si — só `isLight()`/`isHiContrast()` foram trocadas pra ler `data-theme`/`data-contrast` do SIQI (o SILQ usa classes no `<body>`); todo o resto (câmera orbital, projeção, cunhas estereoquímicas) é idêntico ao original |
| `js/render/silq-integracao.js` | **Novo** — a ponte | Converte a fórmula/função química de um composto do SIQI em `{atoms, bonds}` no formato que o motor do SILQ espera, reaproveitando a mesma lógica de conectividade já auditada em `lewis.js` |

**Só existe UM `#viewer3d` na página** (o motor foi desenhado pra 1
instância só) — por isso a distribuição final ficou:
- **Ficha central** (composto desbloqueado): motor 3D do SILQ —
  card mais espaçoso, ideal pra explorar rotação/zoom.
- **Sidebar** (compacta, sempre visível) e **pista visual** do
  desafio bloqueado: SVG 2D próprio (`lewis.js`, já corrigido).

**5 bugs reais encontrados e corrigidos testando em Chromium real**
durante a integração:
1. Mesmo bug de subscrito unicode já visto em outras partes do
   projeto (`"H₂SO₄"` vs `"H2SO4"`) — todo átomo virava quantidade 1.
2. Cátion poliatômico (NH₄⁺) virando um "átomo" fake chamado "NH4" em
   vez de decompor em N + 4 H.
3. Um **terceiro local** de desenho (`#ficha-lewis-svg`, o card
   central da Ficha completa — o mais proeminente de todos) tinha
   ficado de fora da reescrita de `lewis.js`: código morto dentro de
   `desafio.js` ainda referenciava as funções antigas
   (`lewisHaloidro` etc.), gerando `ReferenceError` em tempo real.
4. Ânions poliatômicos (nitrato, sulfato, fosfato...) usavam só
   ligação simples, fazendo o motor VSEPR calcular pares isolados que
   não existem de verdade — nitrato mostrava 107° em vez do 120°
   trigonal planar correto. Corrigido calculando quantas ligações
   precisam virar dupla pra zerar os pares isolados espúrios.
5. Bicarbonato (`HCO3`) teria H como átomo central do cluster por
   engano, já que H vem primeiro na string da fórmula — corrigido com
   tratamento especial, igual à hidroxila.

**Validação:** 100 compostos testados na ponte de dados (0 exceções,
0 elementos inválidos, 0 átomos fora da fórmula real); 68 checks
automatizados em Chromium real (Playwright) cobrindo os 3 módulos,
accordion, jogo socrático, e a Ficha completa com estrutura 3D — 0
falhas, 0 erros de JavaScript.

### A "pista visual" do desafio bloqueado também ganhou o estilo do SILQ

Depois da integração 3D acima, o mesmo princípio foi estendido pra
"pista visual" que aparece durante o desafio socrático (composto
ainda bloqueado, Nomenclatura) — antes um SVG simples de
círculos+linhas, agora reaproveita o **visual real dos átomos do
SILQ**: círculo colorido com anel de elétrons de valência orbitando
(cópia fiel de `.atom`/`.electron-orbit`/`.electron-dot` do CSS
original do SILQ), só que **sem GSAP** — a rotação do anel usa
`@keyframes` CSS puro, mantendo o mesmo efeito visual sem precisar
carregar uma biblioteca externa só pra isso (mesmo princípio de "zero
dependências externas" da integração 3D).

Arquivo novo: `js/render/silq-2d-preview.js` — reaproveita
`silqConstruirMolecula()` (a mesma ponte de átomos/ligações da
integração 3D) e calcula um layout 2D próprio usando o motor de
ângulos VSEPR do SILQ (`silqVsepAngle`), de forma recursiva (mesma
ideia do motor 3D: posiciona os ligantes de um centro, depois recursa
nos que têm ligantes próprios — como o H de uma hidroxila pendurada
num O central).

**3 bugs reais encontrados testando visualmente** durante essa
segunda integração:
1. Distância de ligação (46px) quase do mesmo tamanho que os átomos
   (44px de diâmetro) — sobrava ~2px de linha visível entre eles.
   Aumentada pra 78px.
2. O SVG das ligações usava um `viewBox` com escala própria, enquanto
   os átomos (divs) usavam pixels diretos — em telas mais estreitas
   que o card, ligação e átomo desalinhavam. Corrigido medindo o
   tamanho real do container em pixels no momento do desenho (1
   unidade do SVG = 1px real, sempre).
3. Erro de sinal na recursão: ao posicionar um átomo "pendurado"
   (como o H de uma hidroxila), a fórmula somava 180° à direção de
   chegada — isso apontava de volta pra *perto* do átomo de origem em
   vez de continuar pra fora. No H₂SO₄, um dos H ficava desenhado
   quase em cima do próprio S. Corrigido removendo a inversão de
   sinal indevida.

Depois desses fixes, moléculas mais ramificadas (H₂SO₄, H₃PO₄) ainda
ultrapassavam a área visível do card — resolvido com uma auto-escala
que mede o quanto a molécula realmente ocupa e encolhe só quando
necessário, mantendo moléculas simples (H₂O, NH₃, NaCl) grandes e
legíveis.

**Validação:** layout 2D calculado pros 100 compostos sem exceções e
sem nenhum átomo fora da área visível do card; suíte completa de
regressão revalidada (accordion, jogo socrático, os 3 módulos, e os
3 sistemas de desenho — 2D novo na pista visual, 3D na Ficha central,
SVG compacto na sidebar — coexistindo sem conflito) — 0 falhas, 0
erros de JavaScript.

### Bug relatado em uso real: caixa "Estrutura Molecular" em branco

Depois de entregue, o usuário reportou (com print de tela, testando
no Chrome/Windows de verdade) que a caixa "Estrutura Molecular" da
Ficha às vezes ficava **completamente em branco** — badge "via SILQ
3D" e legenda apareciam certos, mas nenhum átomo era desenhado.

**Causa:** a chamada que ativa o motor 3D (`atualizarEstruturaSILQ3D`)
rodava **síncrona**, no mesmo instante em que o painel da Ficha era
desescondido. O motor mede o tamanho do container
(`getBoundingClientRect()`) pra dimensionar o `<canvas>` assim que
ativa — e nesse instante síncrono exato, alguns navegadores ainda não
tinham terminado de recalcular o layout do painel recém-visível,
resultando num canvas **0×0** que nunca mais era redimensionado
depois. A pista visual 2D (seção acima) já evitava exatamente esse
problema rodando dentro de um `setTimeout` — só a chamada do motor 3D
na Ficha central tinha ficado de fora dessa proteção.

**Correção, em 2 camadas:**
1. A chamada do motor 3D passou a rodar dentro do mesmo padrão
   `setTimeout(..., 50)` já usado pela pista visual 2D.
2. Proteção extra dentro de `atualizarEstruturaSILQ3D`: logo depois de
   ativar o motor, um `requestAnimationFrame` confere se o canvas
   ainda ficou com 0 de largura/altura e, se sim, força mais uma
   medição/redimensionamento — rede de segurança barata (só dispara
   no caso raro) que não depende de acertar um valor de `setTimeout`
   grande o bastante pra qualquer máquina/navegador.

**Validação:** testado com timing agressivo de propósito (150ms entre
clicar no composto e conferir o canvas, bem menos que qualquer teste
anterior) em 5 compostos diferentes, simulando alguém navegando rápido
entre compostos — canvas com dimensões reais em 100% dos casos, 0
falhas. Suíte completa de regressão revalidada.

### Verificação exaustiva contra os 100 compostos — 2 bugs estruturais graves

Depois dos fixes acima (timing), o usuário relatou que **vários
compostos continuavam** com problema de visualização — não só
alguns casos isolados. Isso pedia uma verificação diferente: em vez
de testar uma amostra, testei automaticamente os **100 compostos, um
por um**, nos dois sistemas (2D da pista visual e 3D da Ficha), e
encontrei 2 bugs estruturais que a amostragem anterior não pegava.

**Bug #1 — 147 compostos em vez de 100.** `CATALOGO_SIQI.length`
voltou a dar 147 (não 100) assim que a página carregava, sem nenhuma
interação. Causa: dois arquivos NOMEADOS como reação
(`reacoes-livres-expansao-4.js`, `reacoes-livres-expansao-6.js`)
continham, na verdade, os MESMOS blocos de 42 e 5 compostos que já
tinham sido corretamente portados pra `catalogo-compostos.js` (ver
seção "Catálogo completo: 53 → 100 compostos", acima) — a separação
automática por arquivo, feita na modularização original, tinha
associado esses blocos de composto a esses 2 arquivos só por
proximidade física no arquivo monolítico, não por conteúdo real
(confirmado: 0 ocorrências de `REACOES_LIVRES[` nos dois, mas 1 de
`CATALOGO_SIQI.push` em cada). Resultado: cada um desses 47 compostos
aparecia DUAS VEZES no catálogo. Corrigido esvaziando os 2 arquivos
(documentando o motivo em cada um), mantendo os 42+5 compostos numa
única cópia, correta, em `catalogo-compostos.js`.

**Bug #2 — canvas 3D "não existe" em 100% dos compostos testados em
sequência.** Isolei o padrão exato: clicar num composto AINDA
BLOQUEADO, e depois clicar em OUTRO composto que já estava
desbloqueado (sem resolver o primeiro), deixava `#panel-info`
mostrando o template do desafio socrático — o código que popula a
ficha completa (`#ficha-formula`, `#viewer3d` etc.) tentava escrever
nesses elementos, mas eles simplesmente não existiam mais naquele
HTML (código morto, silencioso, sem erro nenhum). Não era mais o
mesmo bug de timing do fix anterior — a estrutura inteira da ficha
estava ausente, não só demorando a aparecer.

Corrigido em 2 frentes:
1. `carregarComposto()` agora confere, antes de popular qualquer
   campo da ficha, se a estrutura (`#ficha-formula`) realmente está
   presente no DOM — se não estiver (e existir uma cópia salva do
   HTML original), restaura automaticamente antes de continuar.
   Autocorreção: garante a estrutura certa não importa o que estava
   lá antes.
2. Como proteção adicional (útil mesmo com o fix acima, e cobre
   qualquer outro caminho futuro que recrie a Ficha via innerHTML):
   `silqGarantirCanvas3D()`, em `js/render/silq-integracao.js`,
   confere se `window.SILQ_VIEW3D.canvas` ainda está conectado ao DOM
   vivo (`isConnected`) antes de cada atualização — se não estiver
   (canvas "fantasma", desenhando num lugar que ninguém vê), recria o
   canvas e a instância do motor do zero. Isso exigiu expor a classe
   `SilqView3D` globalmente em `view3d-silq.js` (segunda adaptação
   necessária desse arquivo em relação ao original do SILQ — a
   primeira foi a detecção de tema).

**Validação:** os 100 compostos testados nos dois sistemas de
visualização, em sequência (simulando navegação real, incluindo
clicar em compostos bloqueados no meio do caminho) — **0 falhas em
3D** (antes: 100/100 falhavam nesse cenário específico). Uma segunda
categoria de "falha" apareceu no teste 2D (17 buscas retornando mais
de 1 resultado) — investigado e confirmado que é comportamento
CORRETO e intencional da busca (que combina fórmula + nome +
nomenclatura, então "NaCl" encontra tanto "NaCl" quanto "NaClO", já
que um é substring do outro) — não é um bug. Suíte completa de
regressão revalidada, 0 erros de JavaScript.

## Módulo 3: de Redox para Hibridização de Nuvens Eletrônicas

O usuário pediu a substituição completa do módulo de Redox
(transferência de elétrons, balanceamento por íon-elétron) por um
módulo sobre **hibridização de nuvens eletrônicas** — como orbitais
atômicos (s, p, d) se misturam pra formar os orbitais híbridos usados
nas ligações covalentes, e como isso se correlaciona com a geometria
molecular observada.

### Reaproveitamento em vez de reconstrução

O motor VSEPR já construído pra integração com o SILQ
(`silqVsepAngle`, em `js/render/silq-integracao.js`) já recebia
exatamente o número de domínios eletrônicos (ligantes σ + pares
isolados) pra calcular o ângulo de ligação — a MESMA contagem é o que
determina o tipo de hibridização (2 domínios→sp, 3→sp², 4→sp³,
5→sp³d, 6→sp³d²). O novo módulo reaproveita essa correlação
diretamente, em vez de duplicar lógica.

### Dados: 15 compostos reais cobrindo os 5 tipos

`js/data/hibridizacoes-nuvens.js` documenta, pra cada composto, a
contagem de domínios do átomo central, o tipo de hibridização
resultante, a geometria ELETRÔNICA (dos domínios) separada da
geometria MOLECULAR (só dos átomos — que diverge quando há pares
isolados, ex.: NH₃ é tetraédrico na nuvem eletrônica mas pirâmide
trigonal na forma observada), os ângulos ideal (VSEPR) e medido (da
literatura, quando diferem — ex.: H₂S mede 92°, bem abaixo do ideal
109,5°, ilustrando a regra de Bent), e uma explicação de qual orbital
se mistura com qual.

| Tipo | Exemplos | Domínios |
|---|---|---|
| sp | CO₂, BeCl₂, C₂H₂ (acetileno) | 2 |
| sp² | SO₃, BF₃, HNO₃, SO₂, C₂H₄ (eteno) | 3 |
| sp³ | CH₄, NH₃, H₂S, H₂SO₄, H₃PO₄ | 4 |
| sp³d | PCl₅ | 5 |
| sp³d² | SF₆ | 6 |

8 desses compostos já existiam em `CATALOGO_SIQI` (reaproveitados
com seus dados reais de geometria); os outros 7 (BeCl₂, C₂H₂, BF₃,
CH₄, PCl₅, SF₆, C₂H₄) são exemplos clássicos de hibridização que não
fazem parte do catálogo inorgânico da Nomenclatura (ácidos/bases/
sais/óxidos) — adicionados como dados próprios deste módulo.

### Bug real encontrado durante a implementação

A primeira tentativa tentou reaproveitar o despachante de construção
de moléculas já existente (`silqConstruirMolecula`, usado na Ficha da
Nomenclatura), que decide a receita certa consultando `c.funcao`
(ácido/base/sal/óxido). Mas vários compostos deste módulo não são
NENHUMA dessas categorias — BeCl₂ não tem oxigênio nenhum, por
exemplo — e tentar classificá-los à força fazia o despachante
desenhar um PAR IÔNICO (Be²⁺⋯Cl⁻) em vez da molécula COVALENTE linear
que o exemplo pedagógico pede (justamente pra ilustrar hibridização
sp em uma ligação covalente).

Corrigido com um construtor de estrutura DEDICADO
(`modHConstruirEstrutura`, em `js/hibridizacao/logica.js`), que usa a
contagem de domínios já presente nos próprios dados — sem precisar
adivinhar função química nenhuma — com casos especiais pra oxiácidos
(o H fica pendurado num oxigênio periférico, não ligado direto ao
átomo central — mesmo padrão já resolvido antes na Ficha) e pras 2
moléculas orgânicas com dois carbonos ligados entre si (C₂H₂/C₂H₄).

### Coerência com o resto do app

Aplicado o mesmo padrão já estabelecido nos outros módulos: Balanço
Atômico, Dados & Estrutura e Verificar/Reiniciar agora ficam ocultos
também quando Hibridização está ativa (antes só Construtor e
Nomenclatura escondiam esses painéis) — não fazem sentido pro tema
deste módulo. O botão "Voltar ao Laboratório" também foi removido da
view central (mesma correção já aplicada ao Construtor antes).

**Validação:** os 15 compostos testados sistematicamente, um por um,
em Chromium real (estrutura desenhada sem erro, contagem de átomos
batendo com a fórmula real) — 0 falhas. Suíte completa de regressão
revalidada (accordion, Construtor, Nomenclatura, e o novo módulo) —
0 falhas, 0 erros de JavaScript.

### Diagrama "orbitais puros → orbitais híbridos"

Depois de entregue o módulo, o usuário pediu uma mecânica mais
próxima da representação espacial REAL dos orbitais atômicos —
mandou uma imagem de referência mostrando as formas de lóbulo dos
subníveis d e f (a mesma ilustração clássica de livro-texto: d em
"folha de trevo", f com formas ainda mais complexas). O módulo até
então só mostrava a molécula em si (bola-e-vareta) e um resumo em
texto da contagem de domínios — faltava a peça central da teoria de
hibridização: MOSTRAR os orbitais puros (s esférico, p em halteres,
d em folha de trevo) se misturando pra formar os híbridos.

**Arquivo novo dedicado**: `js/render/orbitais-atomicos.js` — funções
de desenho SVG para cada forma de orbital, com a convenção de cor
usada na maioria dos livros-texto (e na imagem de referência do
usuário): os 2 lados de um orbital p/d têm FASES opostas da função de
onda (azul/ciano positivo, rosa/magenta negativo — um detalhe
quimicamente real, não só estético); o orbital HÍBRIDO resultante é
mostrado numa cor quente única (âmbar), já que ele não tem mais essa
distinção de fase isolada — é o orbital que a ligação realmente usa.

Cobre s/p/d (o suficiente pra sp/sp²/sp³/sp³d/sp³d²) — não cobre f,
já que nenhuma hibridização do currículo de Ensino Médio/Química
Geral usa orbital f.

O diagrama mostra, lado a lado: os orbitais puros que entram na
mistura (contados a partir do próprio tipo de hibridização — sp=1s+1p,
sp³d²=1s+3p+2d, etc.), uma seta com a "equação" da mistura, e os N
orbitais híbridos resultantes já apontando nos ângulos geométricos
corretos (mesmo ângulo mostrado no resto da análise), reforçando
visualmente que a contagem bate: nº de orbitais que entram = nº de
híbridos que saem.

**Bug real de espaçamento, achado testando visualmente**: pra tipos
com 4+ orbitais puros empilhados (sp³: 1s+3p), o último rótulo ficava
espremido quase em cima da legenda de fase no rodapé do diagrama —
confirmado no DOM (rótulo do 3º "p" a menos de 5px da legenda).
Corrigido reservando espaço fixo pro título de cima e pra legenda de
baixo ANTES de distribuir os itens da coluna, em vez de usar a altura
total do card — testado nos 5 tipos de hibridização, distância mínima
da legenda agora ≥19,6px em todos.

**Validação:** os 15 compostos testados sistematicamente contra o
diagrama de orbitais (contagem de formas/rótulos batendo com a
receita de cada tipo de hibridização) — 0 falhas. Cores dos 3 tipos
de orbital (fase +/fase −/híbrido) com contraste ≥5,6:1 contra o
fundo do card. Suíte completa de regressão revalidada — 0 falhas, 0
erros de JavaScript.

## Uma curiosidade do maior arquivo de dados da coleção

`dadossiqi.js` guarda o banco de reações do Laboratório
(`REACOES_LIVRES`) de um jeito interessante: em vez de um único
objeto gigante, o arquivo original já declarava um núcleo
(`var REACOES_LIVRES = {...}`) e depois **7 blocos autoexecutáveis**
(`(function(){ ... })()`), cada um mesclando mais reações no mesmo
banco — o comentário de cada bloco no arquivo original diz
"Reações dos compostos adicionados na expansão 2", "expansão 3" etc.,
sinal de que o catálogo foi crescendo ao longo do tempo. A
refatoração preservou exatamente essa estrutura: um arquivo
`reacoes-livres-base.js` com o núcleo, e sete arquivos
`reacoes-livres-expansao-1.js` a `-7.js`, cada um com o mesmo
bloco autoexecutável de antes — só que agora cada um é o seu próprio
arquivo, carregado em sequência.

## Por que este arquivo NÃO precisou da técnica de namespace do SILQ

Como o SIE e o SITP, o SIQI tem suas declarações soltas no escopo de
topo do arquivo (não dentro de um único closure gigante como o
SILQ). Uma checagem estática confirmou **zero casos** de função
referenciada antes de sua declaração de um jeito que dependesse de
hoisting entre arquivos.

## Como isso foi validado

- Comparação linha-a-linha entre os arquivos originais (script E
  dados) e os 42 novos — **100% idêntico**. O cabeçalho geral do
  arquivo de dados (fontes, campos, referências bibliográficas) foi
  incorporado a este README e aos cabeçalhos dos arquivos de dados
  mais relevantes, em vez de ficar de fora da comparação sem
  explicação.
- Teste funcional cobrindo os 3 módulos: ativar Nomenclatura e
  consultar um composto (H₂SO₄), alternar Lab/Ficha, ativar
  Construtor e montar um desafio, ativar Redox e analisar uma reação
  completa.
- Teste exaustivo (na refatoração original): **os 97 compostos da
  Biblioteca de Nomenclatura e os 98 desafios do Construtor da época**
  — cada um clicado e comparado entre a versão original e a
  refatorada. Resultado: **0 divergências**, **0 erros de
  JavaScript**. Os números de desafios do Construtor mudaram depois
  (ver "Atualizações aplicadas após a refatoração"), mas o método de
  validação (clicar item a item, comparar saída) foi reaplicado a
  cada atualização subsequente.

## Mapa dos arquivos

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `js/data/metadados-funcao.js` | Dados | Funções inorgânicas + categorias |
| `js/data/catalogo-compostos.js` | Dados | 100 compostos catalogados |
| `js/data/experimentos.js` | Dados | Desafios socráticos (Nomenclatura) |
| `js/data/reacoes-livres-base.js` | Dados | Banco de reações do Lab (núcleo) |
| `js/data/reacoes-livres-expansao-1.js` … `-7.js` | Dados | Reações adicionadas em cada expansão |
| `js/data/ligantes-metais.js` | Dados | Ligantes, metais, prefixos gregos |
| `js/data/desafios-construtor.js` | Dados | 96 desafios do Construtor |
| `js/data/regras-iupac.js` | Dados | Regras IUPAC (dado disponível; não renderizado — Guia de Regras removido) |
| `js/data/reacoes-redox.js` | Dados | **Esvaziado** — substituído por `hibridizacoes-nuvens.js` |
| `js/data/hibridizacoes-nuvens.js` | Dados | 15 compostos: domínios VSEPR, hibridização, geometrias |
| `js/a11y/preferencias.js` | Acessibilidade | Tema/contraste/daltonismo |
| `js/core/dados-adapter.js` | Núcleo | Catálogo bruto → dicionário COMPOSTOS |
| `js/core/desbloqueio.js` | Núcleo | Compostos desbloqueados (memória) |
| `js/core/estado.js` | Núcleo | Estado global do módulo 1 |
| `js/core/dom-utils.js` | Núcleo | $ , txt, html, subscritos, anúncios |
| `js/ui/paineis.js` | Interface | Painéis recolhíveis |
| `js/ui/modal-expandir.js` | Interface | Modal de leitura ampliada |
| `js/ui/menu-mobile.js` | Interface | Gavetas mobile |
| `js/ui/canvas-particulas.js` | Interface | Canvas decorativo do Lab |
| `js/nomenclatura/biblioteca.js` | Módulo 1 | Lista de compostos + busca |
| `js/nomenclatura/desafio.js` | Módulo 1 | Desafio socrático + ficha |
| `js/render/lewis.js` | Renderização | Estrutura em SVG 2D (sidebar + pista visual) |
| `js/render/view3d-silq.js` | Renderização | Motor 3D — importado do SILQ (ver seção de auditoria) |
| `js/render/silq-integracao.js` | Renderização | Ponte de dados SIQI → SILQ (átomos/ligações) |
| `js/render/silq-2d-preview.js` | Renderização | Pista visual do desafio bloqueado — átomos estilo SILQ 2D (círculo + elétrons orbitando) |
| `js/data/elementos-silq.js` | Dados | 118 elementos — importado do SILQ |
| `js/data/geometrias-moleculares-silq.js` | Dados | 80 geometrias da literatura — importado do SILQ |
| `js/ui/view-toggle.js` | Interface | Alternar Lab/Ficha/Redox/Construtor |
| `js/init/bootstrap-simulador.js` | Entrada parcial | Inicializações comuns |
| `js/lab/toast.js` | Laboratório | Notificações temporárias |
| `js/lab/reacoes-livres.js` | Laboratório | Abrir reação livre |
| `js/lab/parser-formula.js` | Laboratório | Parser de fórmula química |
| `js/lab/estado-fisico.js` | Laboratório | Estado físico a 25°C |
| `js/lab/builder-estado.js` | Laboratório | Estado do builder |
| `js/lab/builder-mecanica.js` | Laboratório | Bancada + estequiometria ao vivo |
| `js/lab/builder-verificacao.js` | Laboratório | Verificar reação + reiniciar |
| `js/lab/eventos.js` | Laboratório | Botões Verificar/Reiniciar |
| `js/modulos/alternar.js` | Módulos | Alternar entre os 3 módulos |
| `js/construtor/estado-biblioteca.js` | Módulo 2 | Estado + biblioteca de desafios |
| `js/construtor/bancada.js` | Módulo 2 | Bancada de montagem + validador (sem guia de regras) |
| `js/redox/logica.js` | Módulo 3 (antigo) | **Esvaziado** — substituído por `js/hibridizacao/logica.js` |
| `js/hibridizacao/logica.js` | Módulo 3 | Tipos de hibridização, lista de compostos, análise (domínios/geometria/estrutura) |
| `js/render/orbitais-atomicos.js` | Renderização | Formas de orbitais s/p/d + diagrama "puros → híbridos" |
| `js/redox/eventos-finais.js` | Entrada | Disparo final (≈"main.js") — continua no lugar, não é específico de um módulo |
| `css/stylesiqi.css` | Estilo | Sincronizado com as atualizações (CSS morto do Guia de Regras removido) |

## Como rodar

Igual a antes: abra `indexsiqi.html` no navegador (funciona por
`file://`) ou publique a pasta inteira num servidor estático,
mantendo `css/` e `js/` (com todas as subpastas) ao lado de
`indexsiqi.html`.
