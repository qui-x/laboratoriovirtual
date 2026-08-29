# SIEM — Simulador Interativo de Estrutura da Matéria
### Guia da arquitetura refatorada

## O que mudou e o que NÃO mudou

- ✅ **Nenhum dado foi alterado.** As 95 substâncias (temperaturas de
  fusão/ebulição, ponto triplo, ponto crítico, densidades, geometria
  VSEPR, cores CPK) continuam com os mesmos valores de antes.
- ✅ **Nenhuma funcionalidade foi alterada.** Simulação 2D e 3D,
  diagrama de fases, busca e filtro de substâncias, calibração de
  temperatura/pressão, painel expandido, menu mobile, acessibilidade
  — tudo continua igual.
- ✅ **O projeto continua funcionando sem servidor** (`file://`), sem
  bundler.
- 📁 O que mudou foi **a organização dos arquivos**: `scriptsiem.js`
  (1255 linhas, três classes) virou 18 arquivos pequenos.
  `stylesiem.css` e `view3dsiem.js` já estavam bem organizados e
  foram **mantidos intocados** (só relocados). `dadossiem.js` foi
  dividido em dois arquivos de dados, como nos outros simuladores.
- 🔧 **Um detalhe técnico, sem efeito no funcionamento:**
  `dadossiem.js` usava terminadores de linha CRLF (Windows) enquanto
  todo o resto do projeto usa LF — os dois novos arquivos de dados
  foram normalizados para LF, como o restante do código. Isso não
  altera nenhum valor, só a forma como as quebras de linha são
  representadas em bytes (invisível para o JavaScript).

## Como isso foi validado

Um script de teste abriu a versão antiga e a nova num navegador
simulado **com canvas 2D real** (via o pacote `canvas`, não um stub) e:
- selecionou **as 95 substâncias, uma por uma**, e comparou todos os
  campos de dados/medidas exibidos (estado físico, temperaturas de
  fusão/ebulição na pressão atual, geometria VSEPR, densidades, ponto
  triplo/crítico, anomalia, descrição);
- testou a água em quatro cenários (25°C/1atm, 150°C, -20°C, alta
  pressão) para conferir as transições de estado;
- alternou entre os modos 2D e 3D e deixou o renderizador 3D rodar de
  verdade por vários frames;
- expandiu e fechou o painel "Dados & Medidas" no modal de leitura
  ampliada;
- mexeu nos sliders de temperatura, pressão e número de partículas.

Resultado: **0 divergências** em todas as 95 substâncias e em todos
os outros cenários, **0 erros de JavaScript** em qualquer uma das
duas versões.

## Por que reorganizar em camadas?

```
┌──────────────────────────────────────────────────────────────┐
│  main.js                          ← PONTO DE ENTRADA           │
├──────────────────────────────────────────────────────────────┤
│  js/ui/sidebar-resizer.js          ← INTERFACE independente    │
│  js/view3d/view3d.js                ← VISÃO 3D (autocontido)   │
│  js/app/*  (classe App)              ← APLICAÇÃO               │
├──────────────────────────────────────────────────────────────┤
│  js/phase-diagram/* (classe PhaseDiagram) ← DIAGRAMA DE FASES  │
│  js/simulation/* (classe Simulation)       ← SIMULAÇÃO 2D      │
├──────────────────────────────────────────────────────────────┤
│  js/a11y/acessibilidade.js            ← ACESSIBILIDADE + TEMA  │
│  js/core/*                             ← NÚCLEO (física pura)  │
├──────────────────────────────────────────────────────────────┤
│  js/data/*                              ← DADOS (catálogo)     │
└──────────────────────────────────────────────────────────────┘
```

## A técnica de dividir as 3 classes entre arquivos

`Simulation`, `PhaseDiagram` e `App` são declaradas com `class`. Cada
uma foi dividida em um arquivo "núcleo" (construtor + membros
essenciais) e um ou mais arquivos que **adicionam** métodos à mesma
classe, escrevendo direto no protótipo:

```js
// simulation-core.js — declara a classe
class Simulation {
  constructor(canvas) { ... }
}

// simulation-fisica.js — ADICIONA métodos à MESMA classe
Simulation.prototype.update = function() { ... };

// simulation-render.js — ADICIONA mais métodos
Simulation.prototype.draw = function() { ... };
```

Isso é **100% equivalente** a escrever tudo dentro de um único
`class{}`. A única regra é a ordem de carregamento: o arquivo que
**declara** a classe precisa vir antes dos que **adicionam** métodos
a ela — a ordem dos `<script>` em `indexsiem.html` segue essa
hierarquia rigorosamente.

## ⚠️ A ordem dos 3 últimos `<script>` importa de verdade

`view3d.js`, `main.js` e `sidebar-resizer.js` cada um registra seu
próprio listener de `DOMContentLoaded`. A ORDEM DE REGISTRO decide a
ordem de DISPARO. No arquivo original, a ordem de carregamento era
`dadossiem.js → view3dsiem.js → scriptsiem.js` — e dentro deste
último, o `new App()` era registrado antes do redimensionador de
sidebars. Ou seja, a ordem de disparo original era:

**view3d → App → redimensionador de sidebars**

O HTML refatorado preserva exatamente essa ordem (ver os comentários
de aviso dentro do próprio `indexsiem.html`, logo antes desses três
`<script>`). Isso importa porque `view3d.js` lê `window.SIEM_APP`
(exposto pelo construtor de `App`) — o código já era escrito para
tolerar rodar antes de `App` existir (com verificações `if (!app)
return;`), mas preservar a ordem original evita qualquer
comportamento sutil diferente do que já foi testado em produção.

## Por que view3d.js e stylesiem.css não foram divididos?

- **`view3d.js`** já é um módulo autocontido por design — o próprio
  cabeçalho do arquivo original explica que ele foi propositalmente
  isolado do motor de física, com uma superfície pública mínima
  (`window.SIEM_VIEW3D`). Dividi-lo em vários arquivos exigiria
  transformar suas variáveis internas (`BOND_TOPOLOGY`, `OrbitCamera`,
  a própria classe `View3D`) em globais, quebrando esse isolamento
  intencional sem ganho real de clareza — o arquivo já tem seções
  bem demarcadas internamente.
- **`stylesiem.css`** não foi tocado pela mesma razão do SIME e do
  SIMA: a ordem das regras CSS afeta a aparência final (a cascata), e
  reordenar é um risco desnecessário quando a prioridade é não
  quebrar nada.

## Mapa dos arquivos

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `js/data/paleta-cpk.js` | Dados | Cores CPK por elemento |
| `js/data/catalogo-substancias.js` | Dados | 95 substâncias com dados termodinâmicos e geometria VSEPR |
| `js/core/termodinamica.js` | Núcleo | Deslocamento de Tf/Tb com a pressão, determinação do estado físico |
| `js/core/cor.js` | Núcleo | Conversão hex → rgba() |
| `js/a11y/acessibilidade.js` | Acessibilidade | Receptor de tema/contraste/daltonismo + cache de cores do canvas (`window.SIEM_THEME`) |
| `js/simulation/simulation-core.js` | Simulação | Declara `class Simulation` (construtor, dimensionamento) |
| `js/simulation/simulation-fisica.js` | Simulação | Posicionamento, integração do movimento, colisões |
| `js/simulation/simulation-render.js` | Simulação | Desenho das moléculas no canvas 2D |
| `js/phase-diagram/phase-diagram-core.js` | Diagrama de fases | Declara `class PhaseDiagram` |
| `js/phase-diagram/phase-diagram-render.js` | Diagrama de fases | Desenho do gráfico P×T |
| `js/app/app-core.js` | Aplicação | Declara `class App` (cria Simulation e PhaseDiagram) |
| `js/app/app-substancias.js` | Aplicação | Lista de substâncias, busca, seleção |
| `js/app/app-controles.js` | Aplicação | Calibração dos sliders de temperatura/pressão |
| `js/app/app-dados-medidas.js` | Aplicação | Ficha da substância + leituras ao vivo |
| `js/app/app-paineis.js` | Aplicação | Painéis recolhíveis + modal de leitura ampliada |
| `js/app/app-eventos.js` | Aplicação | Liga todos os controles |
| `js/app/app-mobile.js` | Aplicação | Menu mobile |
| `js/app/app-loop.js` | Aplicação | Loop principal |
| `js/view3d/view3d.js` | Visão 3D | Renderizador 3D — **intocado** |
| `js/ui/sidebar-resizer.js` | Interface | Redimensionar sidebars |
| `js/main.js` | Entrada | Instancia `App` |
| `css/stylesiem.css` | Estilo | **Intocado** |

## Como rodar

Igual a antes: abra `indexsiem.html` no navegador (funciona por
`file://`) ou publique a pasta inteira num servidor estático,
mantendo `css/`, `js/` e subpastas ao lado de `indexsiem.html`.
