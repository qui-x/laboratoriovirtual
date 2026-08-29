# SIME — Simulador Interativo de Matéria e Estados
### Guia da arquitetura refatorada

Este documento explica **como o código foi reorganizado** e **por quê**. Ele
não é necessário para o simulador funcionar — é um guia de estudo para quem
vai manter ou expandir o projeto.

## O que mudou e o que NÃO mudou

- ✅ **Nenhum dado foi alterado.** Os pontos de fusão/ebulição, cores,
  fórmulas, faixas de pressão/temperatura e todo o resto do catálogo de 102
  substâncias continuam com os mesmos valores de antes.
- ✅ **Nenhuma funcionalidade foi alterada.** Sliders, botões, seleção de
  substância, painéis recolhíveis, menu mobile, acessibilidade,
  redimensionamento das barras laterais — tudo continua igual.
- ✅ **O projeto continua funcionando sem servidor** (abrindo `indexsime.html`
  direto no navegador, via `file://`), exatamente como antes — não foram
  usados `import`/`export` do JavaScript (que exigem um servidor).
- 🔧 **A única mudança de comportamento** foi remover um bloco de código
  duplicado: o "receptor de acessibilidade" (tema, contraste, daltonismo
  etc.) existia **colado duas vezes**, palavra por palavra, dentro de
  `scriptsime.js`. Isso fazia o simulador aplicar as mesmas preferências de
  acessibilidade duas vezes seguidas a cada carregamento — sem nenhum efeito
  visível, mas era trabalho redundante. Mantive só uma cópia.
- 📁 O que mudou de verdade foi **a organização dos arquivos**: dois arquivos
  gigantes (`dadossime.js` com ~900 linhas e `scriptsime.js` com ~1130
  linhas) viraram 20 arquivos pequenos, cada um com uma responsabilidade
  clara.

Isso foi validado automaticamente: um script de teste abriu a versão antiga
e a nova num navegador simulado, selecionou as 102 substâncias uma por uma,
mexeu nos controles de temperatura/pressão/volume, e comparou **todos os
valores exibidos na tela** entre as duas versões. O resultado foi 100%
idêntico em todos os casos.

## Por que reorganizar em camadas?

Um programa bem estruturado separa suas responsabilidades em **camadas**,
cada uma dependendo apenas das camadas "abaixo" dela. Isso é um dos
princípios centrais de engenharia de software (baixo acoplamento, alta
coesão): fica mais fácil entender, testar e corrigir cada parte
isoladamente, sem precisar ler o programa inteiro.

```
┌─────────────────────────────────────────────────────────────┐
│  main.js               ← PONTO DE ENTRADA (liga tudo)         │
├─────────────────────────────────────────────────────────────┤
│  js/ui/*                ← INTERFACE (lê/escreve o HTML)       │
│  js/orquestrador.js     ← ORQUESTRAÇÃO (chama a UI na ordem)  │
├─────────────────────────────────────────────────────────────┤
│  js/core/*               ← NÚCLEO (estado + física, sem DOM)  │
├─────────────────────────────────────────────────────────────┤
│  js/data/*                ← DADOS (catálogo científico fixo)  │
├─────────────────────────────────────────────────────────────┤
│  js/a11y/*                 ← ACESSIBILIDADE (transversal)     │
└─────────────────────────────────────────────────────────────┘
```

Uma seta de dependência sempre aponta **para baixo**: a interface (`ui/`)
lê os dados e o núcleo, mas o núcleo (`core/`) nunca sabe que existe um
`<div>` na tela — ele só faz contas. Isso é o que torna a **física do
simulador** (`core/fisica.js`) isolada e fácil de revisar cientificamente,
sem se perder em meio a manipulação de tela.

## Mapa dos arquivos

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `js/data/limites.js` | Dados | Faixas válidas de temperatura/volume/pressão |
| `js/data/paleta-cores.js` | Dados | Paletas de cor (sólido/líquido/gás) |
| `js/data/catalogo-substancias.js` | Dados | As 102 substâncias e seus dados termodinâmicos (NIST/CRC/IUPAC) |
| `js/data/estados-e-fenomenos.js` | Dados | Nomes/ícones dos 3 estados físicos e das 6 mudanças de estado |
| `js/data/escalas-visuais.js` | Dados | Faixas de classificação de P/T e escala do termômetro |
| `js/core/estado-simulacao.js` | Núcleo | O objeto `estado` (T, P, V, substância ativa) e `TRANSICOES` (Tf/Tb efetivos) |
| `js/core/fisica.js` | Núcleo | Clausius-Clapeyron, determinação de estado físico, detecção de fenômeno |
| `js/a11y/acessibilidade.js` | Acessibilidade | Tema, contraste, daltonismo, leitura simplificada, `announce()` |
| `js/ui/dom-cache.js` | Interface | Busca todos os elementos do HTML uma única vez |
| `js/ui/render-temperatura.js` | Interface | Termômetro, chapa aquecedora, range dinâmico do slider |
| `js/ui/render-pressao.js` | Interface | Manômetro e faixa de pressão |
| `js/ui/render-cilindro.js` | Interface | Êmbolo, desenho sólido/líquido/gás, cores da substância |
| `js/ui/render-medidas.js` | Interface | Tabela de medidas numéricas |
| `js/orquestrador.js` | Orquestração | `atualizarSimulador()` — chama tudo na ordem certa |
| `js/ui/painel-substancias.js` | Interface | Lista de substâncias e seleção |
| `js/ui/paineis-recolhiveis.js` | Interface | Abrir/fechar painéis laterais |
| `js/ui/menu-mobile.js` | Interface | Gavetas do menu mobile |
| `js/ui/eventos.js` | Interface | Sliders, botões, atalhos de teclado |
| `js/ui/sidebar-resizer.js` | Interface | Redimensionar as barras laterais |
| `js/main.js` | Entrada | `inicializar()` — liga tudo ao carregar a página |
| `css/stylesime.css` | Estilo | Todo o CSS original, **sem nenhuma alteração** |

A ordem de carregamento dos `<script>` em `indexsime.html` segue exatamente
essa hierarquia (dados → núcleo → acessibilidade → interface →
orquestração → entrada), porque nenhum módulo usa `import`/`export`: cada
`<script>` só pode usar o que os `<script>` anteriores já definiram.

## Por que o CSS não foi dividido em vários arquivos?

Diferente do JavaScript, a ordem das regras no CSS **importa para o
resultado visual** (é a "cascata" do CSS: entre duas regras de mesma
especificidade, a última declarada vence). Dividir o CSS em vários arquivos
ou reordenar suas regras é uma operação de risco — um pequeno deslize pode
mudar a aparência da página sem que isso apareça como "erro" em lugar
nenhum. Como a prioridade era **não alterar nada do que já funciona**,
o arquivo `stylesime.css` foi movido para `css/stylesime.css` **byte por
byte, sem nenhuma linha reordenada ou reescrita**.

## Como rodar

Igual a antes: basta abrir `indexsime.html` no navegador (funciona direto
por `file://`, sem precisar de servidor), ou publicar a pasta inteira num
servidor estático. Só é importante manter a estrutura de pastas
(`css/`, `js/` e suas subpastas) exatamente como está, ao lado de
`indexsime.html`.
