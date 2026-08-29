# SIMA — Simulador Interativo dos Modelos Atômicos
### Guia da arquitetura refatorada

## O que mudou e o que NÃO mudou

- ✅ **Nenhum dado foi alterado.** Os 118 elementos da tabela periódica,
  massas atômicas, anos de descoberta, a tabela empírica de Thomson
  (1904), as constantes físicas e os textos de cada modelo continuam
  com os mesmos valores de antes.
- ✅ **Nenhuma funcionalidade foi alterada.** Os 5 modelos atômicos
  (Dalton, Thomson, Rutherford, Bohr, Quântico), a tabela periódica
  com busca e navegação por teclado, os dois Easter Eggs (espalhamento
  de Geiger-Marsden e controles de salto quântico), acessibilidade,
  painéis recolhíveis e menu mobile — tudo continua igual.
- ✅ **O projeto continua funcionando sem servidor** (`file://`), sem
  bundler — só `<script>` tags simples, na ordem certa.
- 📁 O que mudou foi **a organização dos arquivos**: um arquivo de
  1129+ linhas (`scriptsima.js`) virou 20 arquivos pequenos, cada um
  com uma responsabilidade clara. `dadossima.js` e `stylesima.css` já
  estavam bem organizados e foram **mantidos intocados**, só movidos
  de lugar (ver seções abaixo).

## Como isso foi validado

Um script de teste abriu a versão antiga e a nova num navegador
simulado (com canvas 2D **real**, não simulado) e, em sequência:
- ativou cada um dos 5 modelos atômicos e conferiu a pílula indicadora
  e o estado dos botões;
- selecionou **os 118 elementos da tabela periódica, um por um**, com
  o modelo Quântico ativo, e comparou todos os campos do painel "Dados
  do Elemento" (nome, símbolo, massa, categoria, distribuição
  eletrônica, camadas, última subcamada, ano de descoberta);
- acionou os dois Easter Eggs (disparo de partículas alfa no
  Rutherford, excitação de elétron no Bohr) e conferiu os contadores;
- deixou os 5 modelos rodando de verdade (update + draw no canvas) por
  vários frames, trocando de elemento no meio da simulação.

Resultado: **0 divergências** em todos os 118 elementos e em todos os
outros cenários — e nenhum erro de JavaScript em nenhuma das duas
versões (o único erro que aparece, `scrollIntoView is not a function`,
acontece **identicamente nas duas versões**: é uma limitação do
navegador simulado usado no teste, não do código — navegadores de
verdade implementam esse método normalmente).

## Por que reorganizar em camadas?

```
┌──────────────────────────────────────────────────────────────┐
│  main.js                    ← PONTO DE ENTRADA                 │
├──────────────────────────────────────────────────────────────┤
│  js/ui/menu-mobile.js        ← INTERFACE independente          │
│  js/app/*  (classe AtomicApp)← APLICAÇÃO (tabela, eventos...)  │
├──────────────────────────────────────────────────────────────┤
│  js/models/*  (classe AtomicSim) ← MODELOS FÍSICOS             │
├──────────────────────────────────────────────────────────────┤
│  js/a11y/*                    ← ACESSIBILIDADE                 │
│  js/core/*                     ← NÚCLEO (física pura + utils)  │
├──────────────────────────────────────────────────────────────┤
│  js/data/dados-sima.js          ← DADOS (catálogo científico)  │
└──────────────────────────────────────────────────────────────┘
```

## A técnica por trás da divisão das duas classes

O código original define duas classes com `class`: `AtomicSim` (a
física de cada modelo atômico) e `AtomicApp` (o controlador da
interface). Cada uma tinha *dezenas* de métodos — dividir uma classe
inteira em um único arquivo não ajudaria em nada.

A solução: a classe é **declarada** em um arquivo (com o construtor e
os métodos mais essenciais) e os demais métodos são **adicionados**
depois, em outros arquivos, escrevendo direto no protótipo da classe:

```js
// models/atomic-sim-core.js — declara a classe
class AtomicSim {
  constructor(canvas) { ... }
  rebuild() { ... }
}

// models/dalton.js — ADICIONA métodos à MESMA classe
AtomicSim.prototype._buildDalton = function() { ... };
AtomicSim.prototype._updateDalton = function() { ... };
```

Isso é **100% equivalente** a escrever tudo dentro de um único
`class AtomicSim { ... }` — `class` e `prototype.metodo =` escrevem no
mesmo objeto por baixo dos panos. A única regra é a ordem de
carregamento: o arquivo que **declara** a classe (`atomic-sim-core.js`,
`atomic-app-core.js`) precisa vir **antes** de qualquer arquivo que
adicione métodos a ela — por isso a ordem dos `<script>` em
`indexsima.html` segue rigorosamente essa hierarquia.

Essa técnica foi usada para dividir:
- **`AtomicSim`** (física) → 1 arquivo "núcleo" + 5 arquivos, um por
  modelo atômico (`dalton.js`, `thomson.js`, `rutherford.js`,
  `bohr.js`, `quantum.js`) + 1 arquivo com o loop de
  atualização/desenho (`atomic-sim-loop.js`).
- **`AtomicApp`** (interface) → 1 arquivo "núcleo" + 6 arquivos, um
  por responsabilidade (tabela periódica, dados do elemento,
  sincronização dos painéis, eventos, Easter Eggs, loop principal).

## Mapa dos arquivos

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `js/data/dados-sima.js` | Dados | Catálogo científico completo (118 elementos, constantes físicas, anos de descoberta, tabela de Thomson) — **intocado**, já usava um padrão de namespace (`window.SIMA_DATA`, `Object.freeze`) |
| `js/core/dados.js` | Núcleo | Ponte: desestrutura `window.SIMA_DATA` nos nomes usados pelo resto do código |
| `js/core/fisica.js` | Núcleo | Matemática pura de Bohr (energia, fóton, cor) e preenchimento de subcamadas |
| `js/core/cor.js` | Núcleo | Cor por categoria química e cálculo de contraste — usado por modelos E interface |
| `js/core/audio.js` | Núcleo | Retorno sonoro (Web Audio) — usado por modelos E interface |
| `js/a11y/acessibilidade.js` | Acessibilidade | Receptor de tema/contraste/daltonismo + `announce()` |
| `js/models/atomic-sim-core.js` | Modelos | Declara `class AtomicSim` (construtor, getters, `rebuild()`) |
| `js/models/dalton.js` | Modelos | Física do modelo de Dalton (1803) |
| `js/models/thomson.js` | Modelos | Física do modelo de Thomson (1904) |
| `js/models/rutherford.js` | Modelos | Física do modelo de Rutherford (1911) + espalhamento |
| `js/models/bohr.js` | Modelos | Física do modelo de Bohr (1913) |
| `js/models/quantum.js` | Modelos | Física do modelo Quântico (1926) |
| `js/models/atomic-sim-loop.js` | Modelos | `update()`/`draw()` — despacha para o modelo ativo |
| `js/app/atomic-app-core.js` | Aplicação | Declara `class AtomicApp` (construtor, `_resize()`) |
| `js/app/tabela-periodica.js` | Aplicação | Monta a tabela periódica, busca, navegação por teclado |
| `js/app/elemento-ui.js` | Aplicação | Painel "Dados do Elemento" e Projeção Matemática |
| `js/app/modelos-ui.js` | Aplicação | Ativa/desativa modelo, sincroniza painéis e seletores |
| `js/app/eventos.js` | Aplicação | Liga todos os controles da interface |
| `js/app/easter-eggs.js` | Aplicação | Os dois experimentos escondidos (logo do cabeçalho) |
| `js/app/loop.js` | Aplicação | Loop principal (`requestAnimationFrame`) |
| `js/ui/menu-mobile.js` | Interface | Gavetas do menu mobile |
| `js/main.js` | Entrada | Instancia `AtomicApp`, inicia o menu mobile |
| `css/stylesima.css` | Estilo | Todo o CSS original, **sem nenhuma alteração** (mesma razão do SIME: a ordem das regras CSS afeta a aparência, então mover regras de lugar é um risco desnecessário) |

## Como rodar

Igual a antes: abra `indexsima.html` no navegador (funciona direto por
`file://`) ou publique a pasta inteira num servidor estático. Mantenha
a estrutura de pastas (`css/`, `js/` e subpastas) ao lado de
`indexsima.html`.
