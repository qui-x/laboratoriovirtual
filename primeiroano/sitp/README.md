# SITP — Simulador Interativo da Tabela Periódica
### Guia da arquitetura refatorada

## O que mudou e o que NÃO mudou

- ✅ **Nenhum dado foi alterado.** Os 118 elementos, suas 5 vistas
  (Bohr, Lewis, nuvem eletrônica, raio atômico, propriedades),
  curiosidades, formas de obtenção — tudo com os mesmos valores.
- ✅ **Nenhuma funcionalidade foi alterada.** Modal completo do
  elemento, os 5 diagramas + tela cheia, slider de temperatura
  (muda o estado físico em tempo real), filtros por categoria/
  estado/"modo lamber", modo propriedade (colorir a tabela inteira
  por eletronegatividade ou energia de ionização), navegação por
  teclado, guia de leitura do card — tudo continua igual.
- ✅ **O projeto continua funcionando sem servidor** (`file://`), sem
  bundler.
- 📁 O que mudou foi **a organização dos arquivos**: `scriptsitp.js`
  (2469 linhas) virou **33 arquivos pequenos**. `dadossitp.js`
  (1296 linhas) e `stylesitp.css` foram **mantidos intocados**.

## Por que dadossitp.js não foi dividido

Esse arquivo não pertence só ao SITP: é uma **dependência pública
compartilhada** — o simulador SIE (Estequiometria), por exemplo,
carrega exatamente `dadossitp.js` por esse nome para alimentar seu
módulo de investigação de elementos, sem copiar nada. Dividir esse
arquivo em vários módulos quebraria esse contrato para qualquer outro
simulador que dependa dele. Por isso ele foi mantido como está —
mesmo raciocínio já aplicado ao CSS e a outros arquivos
"emprestados" entre simuladores da coleção.

## Por que este arquivo NÃO precisou da técnica de namespace do SILQ

Assim como o SIE, o SITP tem suas ~150 declarações soltas no escopo
de topo do arquivo (não dentro de um único closure gigante como o
SILQ), o que permite simplesmente mover cada uma para o arquivo
certo, sem precisar renomear nada. Uma checagem estática (a mesma
técnica usada no SILQ e no SIE) confirmou **zero casos** de função
referenciada antes de sua declaração de um jeito que dependesse de
function hoisting dentro de um único arquivo.

## Como isso foi validado

- Comparação linha-a-linha entre o arquivo original e os 33 novos —
  **100% idêntico**. Um pequeno cabeçalho de arquivo (a descrição
  geral do script + a nota sobre a dependência de dadossitp.js) que
  ficou "solto" entre duas declarações foi identificado e movido para
  este README e para o cabeçalho de `js/a11y/anunciar.js`, em vez de
  ficar preso a um arquivo sem relação temática com ele.
- Teste funcional: abrir a ficha de vários elementos (Ouro, Hidrogênio,
  Urânio), variar a temperatura ao extremo, aplicar filtro de
  categoria.
- Teste exaustivo: abrir **os 118 elementos + espaços vazios (120
  células)**, incluindo expandir as linhas de lantanídeos e
  actinídeos, e comparar TODOS os campos do modal (estado físico,
  configuração eletrônica, partículas subatômicas, raio, propriedades,
  obtenção, curiosidade) entre a versão original e a refatorada.
  Resultado: **0 divergências**, **0 erros de JavaScript**.
- Uma primeira rodada desse teste exaustivo mostrou 2 elementos
  "trocados" por execução — investigando, era uma instabilidade do
  MÉTODO de teste (esperar um tempo fixo entre cliques, insuficiente
  em alguns casos por variação de carga do processo), não um bug no
  código. Trocar a espera fixa por uma espera ativa (checar até o
  modal realmente mostrar o símbolo do elemento clicado) eliminou o
  problema por completo.

## Mapa dos arquivos

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `js/a11y/preferencias.js` | Acessibilidade | Tema/contraste/daltonismo |
| `js/a11y/anunciar.js` | Acessibilidade | Avisos ao leitor de tela |
| `js/core/cores-estado.js` | Núcleo | Cor de estado físico e categoria |
| `js/core/config-eletronica.js` | Núcleo | Distribuição eletrônica |
| `js/core/cor-css-utils.js` | Núcleo | Resolver variável CSS → hex |
| `js/core/escala-propriedade.js` | Núcleo | Valor → cor numa escala |
| `js/core/contraste-wcag.js` | Núcleo | Contraste WCAG |
| `js/ui/icones-estado.js` | Interface | Ícones de estado físico |
| `js/render/cores-atomo.js` | Renderização | Cor do átomo nos diagramas |
| `js/render/raio-e-propriedades-modal.js` | Renderização | Raio + cards de propriedade |
| `js/render/bohr.js` | Renderização | Diagrama de Bohr |
| `js/render/lewis.js` | Renderização | Estrutura de Lewis |
| `js/render/nuvem-eletronica.js` | Renderização | Nuvem de probabilidade |
| `js/render/fullscreen-consts-estado.js` | Renderização | Estado da tela cheia |
| `js/render/fullscreen.js` | Renderização | Abrir vista em tela cheia |
| `js/render/nuvem-canvas-draw.js` | Renderização | Desenho pixel-a-pixel do orbital |
| `js/render/fullscreen-resize-fechar.js` | Renderização | Redimensionar/fechar tela cheia |
| `js/render/raio-bohr-lazy-modo.js` | Renderização | Raio preguiçoso + modo Bohr |
| `js/modal/estado-modal.js` | Modal | Estado do modal |
| `js/modal/abrir-fechar.js` | Modal | Abrir/fechar ficha do elemento |
| `js/modal/config-eletronica-ui.js` | Modal | HTML da configuração eletrônica |
| `js/ui/series-f.js` | Interface | Expandir lantanídeos/actinídeos |
| `js/filters/dimming-filtros.js` | Filtros | Categoria/estado/lamber |
| `js/ui/navegacao-teclado.js` | Interface | Navegação por setas (grid) |
| `js/ui/paleta-orbital.js` | Interface | Cache de cores dos orbitais |
| `js/temperatura/controle-temperatura.js` | Temperatura | Slider + estado físico dinâmico |
| `js/table/criar-celula.js` | Tabela | Construir uma célula |
| `js/table/legenda.js` | Tabela | Legenda de categorias |
| `js/ui/guia.js` | Interface | Guia de leitura do card |
| `js/table/construir-tabela.js` | Tabela | Montar a grade completa |
| `js/easter-egg/modo-lamber.js` | Easter egg | Modo lamber |
| `js/property-mode/logica.js` | Modo propriedade | Colorir a tabela por propriedade |
| `js/init/bootstrap.js` | Entrada | Disparo final |
| `dadossitp.js` | Dados | **Intocado** — dependência pública |
| `css/stylesitp.css` | Estilo | **Intocado** |

## Como rodar

Igual a antes: abra `indexsitp.html` no navegador (funciona por
`file://`) ou publique a pasta inteira num servidor estático,
mantendo `css/`, `js/` e `dadossitp.js` ao lado de `indexsitp.html`.
