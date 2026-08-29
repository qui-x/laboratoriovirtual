# SILQ — Simulador Interativo de Ligações Químicas
### Guia da arquitetura refatorada

## O que mudou e o que NÃO mudou

- ✅ **Nenhum dado foi alterado.** Os 118 elementos, o banco de 49
  moléculas prontas, as geometrias moleculares da literatura, dados
  de ligação e eletronegatividade continuam com os mesmos valores.
- ✅ **Nenhuma funcionalidade foi alterada.** Criar e ligar átomos,
  os 49 presets de moléculas, física de partículas, "Snap
  Literatura", cunhas estereoquímicas, visão 3D, gráfico de energia,
  tabela periódica com busca — tudo continua igual.
- ✅ **O projeto continua funcionando sem servidor** (`file://`), sem
  bundler.
- 📁 O que mudou foi **a organização dos arquivos**: `scriptsilq.js`
  (3752 linhas) virou 25 arquivos pequenos. `stylesilq.css` e
  `view3dsilq.js` foram **mantidos intocados**. `dadossilq.js` foi
  dividido em 8 arquivos de dados temáticos.

## O desafio específico do SILQ (diferente do SIME/SIMA/SIEM)

Os outros três simuladores usavam `class` (SIMA, SIEM) ou variáveis
soltas no escopo global (SIME) — dava para simplesmente mover pedaços
de código entre arquivos. O SILQ é diferente: **quase o app inteiro
vivia dentro de um único closure**,

```js
document.addEventListener('DOMContentLoaded', () => {
  let canvasAtoms = [];
  let bonds = [];
  // ... mais de 3400 linhas, ~150 variáveis e funções ...
});
```

Variáveis declaradas com `let`/`const`/`function` dentro dessa função
são **locais a ela** — não existem fora, e não podem ser
compartilhadas entre arquivos `<script>` diferentes (cada um roda no
seu próprio espaço). Não dava para simplesmente "cortar em pedaços".

### A solução: namespace compartilhado

A técnica usada: transformar esse closure num **objeto global único**
que guarda tudo o que antes era local:

```js
// antes (tudo preso dentro do closure):
let canvasAtoms = [];
function addAtom(sym, x, y) { canvasAtoms.push(...); }

// depois (em arquivos separados, tudo em window.SILQ):
window.SILQ = {};                          // core/namespace.js
SILQ.canvasAtoms = [];                     // core/estado.js
SILQ.addAtom = function addAtom(sym,x,y){  // js/atoms/atomos.js
  SILQ.canvasAtoms.push(...);
};
```

Isso foi feito com uma ferramenta própria (não à mão): um script que
lê o código com um parser de JavaScript real, identifica os ~150
nomes compartilhados, confirma que **nenhum** deles é reaproveitado
como variável local em alguma função aninhada (o que causaria
comportamento errado), e só então troca cada referência pelo
equivalente `SILQ.nome` — preservando 100% dos comentários e valores
originais.

## A pegadinha que essa técnica revelou: *function hoisting*

Essa conversão tem uma consequência sutil, que a bateria de testes
funcionais pegou: em JavaScript, uma declaração `function nome(){}`
é **"içada" (hoisted)** para o topo do bloco onde vive — ou seja, pode
ser *usada* em código que aparece **antes** dela no arquivo. Isso é
uma particularidade só de `function nome(){}`; atribuições comuns
(`SILQ.nome = function(){}`) não têm essa propriedade.

O código original usava esse comportamento (provavelmente sem intenção
consciente) em 2 lugares — por exemplo:

```js
searchInput.addEventListener('input', applyFilters);  // linha 1323
// ...
function applyFilters() { /* definida só aqui embaixo */ }  // linha 1324
```

Isso funcionava no original graças ao hoisting. Depois de virar
`SILQ.applyFilters = function(){}`, deixou de funcionar — o
`addEventListener` capturava `undefined` no lugar da função. Os 2
casos (`applyFilters` e `getMoleculeKey`) foram corrigidos movendo a
declaração para antes do uso, com um comentário `CORREÇÃO DE ORDEM`
no arquivo explicando exatamente o quê e por quê. **Só a ordem
mudou** — o corpo das duas funções é idêntico ao original.

## Como isso foi validado

- Um script de análise estática varreu **as 176 declarações
  originais** procurando qualquer outro caso de função referenciada
  antes de ser declarada — confirmando que só esses 2 casos existem
  em todo o arquivo.
- Testes funcionais num navegador simulado com **canvas 2D real**:
  adicionar átomos pela tabela periódica, montar **os 49 presets de
  moléculas prontas, um por um**, resetar o canvas, ativar "Snap
  Literatura", alternar 2D/3D com o renderizador rodando de verdade,
  pausar física, buscar/filtrar elementos.
- Resultado: **0 divergências** em todos os 49 presets e nos demais
  cenários, **0 erros de JavaScript** em qualquer das duas versões
  (depois de simular, para o teste, as duas bibliotecas externas —
  GSAP e D3 — que a rede do ambiente de teste não conseguia baixar;
  isso não tem relação com a refatoração, acontece igual nas duas
  versões).

## Por que tudo roda dentro de `DOMContentLoaded` de novo?

Cada arquivo de "conteúdo" (dados à parte) tem seu código dentro de
`document.addEventListener('DOMContentLoaded', () => {...})` — o
MESMO padrão do arquivo original, que também rodava tudo só depois do
DOMContentLoaded. Isso é intencional: manter esse comportamento é
mais fiel ao original do que tentar antecipar a execução para o
momento em que cada `<script>` é lido. A ordem relativa entre os
arquivos que registram esse evento foi cuidadosamente preservada
(comentários no `indexsilq.html` explicam os pontos críticos), assim
como no arquivo original o `view3dsilq.js` carregava antes do resto.

## Por que view3dsilq.js e stylesilq.css não foram divididos?

Mesma razão do SIEM: `view3dsilq.js` já é um módulo autocontido por
design (só expõe `window.SILQ_VIEW3D_STATE`/`window.SILQ_VIEW3D` como
superfície pública), e `stylesilq.css` não foi tocado porque a ordem
das regras CSS afeta a aparência final — reordenar é um risco
desnecessário.

## Mapa dos arquivos

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `js/data/tabela-elementos.js` | Dados | Os 118 elementos |
| `js/data/layout-tabela-periodica.js` | Dados | Layout da tabela + categorias |
| `js/data/dados-ligacoes.js` | Dados | Comprimento/energia de ligação |
| `js/data/pares-isolados.js` | Dados | Pares isolados (VSEPR) |
| `js/data/eletronegatividade.js` | Dados | Eletronegatividade de Pauling |
| `js/data/periodos.js` | Dados | Período de cada elemento |
| `js/data/geometrias-moleculares.js` | Dados | Ângulos reais da literatura |
| `js/data/moleculas-prontas.js` | Dados | 49 presets de moléculas |
| `js/core/namespace.js` | Núcleo | `window.SILQ = {}` |
| `js/core/estado.js` | Núcleo | Átomos, ligações, flags de modo |
| `js/core/dom-refs.js` | Núcleo | Referências de elementos do HTML |
| `js/core/fisica-quimica-utils.js` | Núcleo | Utilitários físico-químicos |
| `js/core/validacao-ligacoes.js` | Núcleo | Regras científicas de ligação |
| `js/core/vsepr.js` | Núcleo | Geometria molecular VSEPR quantitativa |
| `js/simulation/fisica-tick.js` | Simulação | Loop de física por frame |
| `js/a11y/preferencias.js` | Acessibilidade | Tema/contraste/daltonismo |
| `js/a11y/anuncios.js` | Acessibilidade | Avisos ao leitor de tela |
| `js/ui/tabela-periodica.js` | Interface | Tabela periódica + busca |
| `js/ui/dropzone-delete.js` | Interface | Arraste por teclado + remover átomo |
| `js/ui/painel-molecular-info.js` | Interface | Painel de fórmula e análise |
| `js/ui/grafico-energia.js` | Interface | Gráfico de energia (D3) |
| `js/ui/menu-mobile.js` | Interface | Gavetas mobile |
| `js/ui/sidebar-resizer.js` | Interface | Redimensionar sidebars |
| `js/atoms/atomos.js` | Átomos | Criar/remover/arrastar átomos |
| `js/bonds/ordem-edicao.js` | Ligações | Edição individual de ligação |
| `js/bonds/logica-ligacoes.js` | Ligações | Formar/quebrar ligações |
| `js/render/wedge-linhas.js` | Renderização | Cunhas + linhas de ligação |
| `js/render/dipolo-glow-eletrons.js` | Renderização | Dipolo, brilho, mar de elétrons |
| `js/molecules/estereoquimica.js` | Moléculas | Ponte 3D + nota estereoquímica |
| `js/molecules/presets.js` | Moléculas | Painel de moléculas prontas |
| `js/init/controles-fisica.js` | Inicialização | Pausar/travar/Snap Literatura |
| `js/init/visualizacao-3d-reset.js` | Inicialização | Ponte 3D + toggle 2D/3D |
| `js/init/inicializacao-final.js` | Inicialização | Disparo final (≈"main.js") |
| `js/view3d/view3d.js` | Visão 3D | Renderizador 3D — **intocado** |
| `css/stylesilq.css` | Estilo | **Intocado** |

## Como rodar

Igual a antes: abra `indexsilq.html` no navegador (funciona por
`file://`) ou publique a pasta inteira num servidor estático,
mantendo `css/`, `js/` e subpastas ao lado de `indexsilq.html`.
