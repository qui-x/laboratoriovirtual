/* ================================================================
   SICAR — dadoscarbono.js | dados fixos de Química do Carbono
   ================================================================
   FONTES DOS DADOS (conferir/atualizar sempre nestas referências):
   - Nomenclatura, hibridização e classificação de cadeias:
     IUPAC, "Nomenclature of Organic Chemistry: Recommendations and
     Preferred Names 2013" (Blue Book) — regras P-2 (hidrocarbonetos)
     e P-14 (termos gerais).
   - Ângulos de ligação e geometria (VSEPR): valores clássicos de
     109,5° (tetraédrica), 120° (trigonal plana) e 180° (linear).
   - Comprimentos médios de ligação carbono–carbono em pm:
     C–C ≈ 154, C=C ≈ 134, C≡C ≈ 120 (valores tabelados em
     compilações de dados estruturais, como o CRC Handbook of
     Chemistry and Physics e o NIST Computational Chemistry
     Comparison and Benchmark Database — cccbdb.nist.gov).
   - Postulados de Kekulé (carbono tetravalente, ligações iguais,
     encadeamento) — base histórica da Química Orgânica.

   COMO ESTE ARQUIVO É USADO
   window.SIM_DATA é lido por scriptcarbono.js. As moléculas usam
   coordenadas normalizadas (0 a 1); quem converte para pixels é a
   função _drawEsqueleto() do script — assim o desenho se adapta a
   qualquer tamanho de tela.
   ================================================================ */
'use strict';

window.SIM_DATA = {
  ACRO: 'SICAR',
  TITLE: 'Simulador Interativo de Química do Carbono',

  /* ── Hibridização do carbono ── */
  HIBRIDIZACOES: [
    {
      id: 'sp3', nome: 'sp³', angulo: 109.5, geometria: 'tetraédrica',
      sigma: 4, pi: 0, ligacao: 'somente ligações simples',
      exemplo: 'CH₄ — metano', comprimento: 154, dot: '#60a5fa',
      nota: 'um orbital s + três orbitais p geram quatro orbitais iguais',
    },
    {
      id: 'sp2', nome: 'sp²', angulo: 120, geometria: 'trigonal plana',
      sigma: 3, pi: 1, ligacao: 'uma ligação dupla',
      exemplo: 'C₂H₄ — eteno', comprimento: 134, dot: '#a78bfa',
      nota: 'sobra um orbital p puro, que forma a ligação pi',
    },
    {
      id: 'sp', nome: 'sp', angulo: 180, geometria: 'linear',
      sigma: 2, pi: 2, ligacao: 'uma tripla ou duas duplas',
      exemplo: 'C₂H₂ — etino', comprimento: 120, dot: '#f472b6',
      nota: 'sobram dois orbitais p puros, que formam duas ligações pi',
    },
  ],

  /* ── Cadeias carbônicas para classificar ──
     Coordenadas normalizadas (x, y de 0 a 1) e lista de ligações
     [índiceA, índiceB, ordem]. A classificação segue os critérios
     da IUPAC/Blue Book usados no Ensino Médio. */
  CADEIAS: [
    {
      id: 'butano', nome: 'Butano', formula: 'C₄H₁₀', dot: '#60a5fa',
      classes: { fechamento: 'aberta (acíclica)', saturacao: 'saturada', natureza: 'homogênea', ramos: 'normal' },
      atomos: [[.12, .62, 'C'], [.34, .40, 'C'], [.56, .62, 'C'], [.78, .40, 'C']],
      ligacoes: [[0, 1, 1], [1, 2, 1], [2, 3, 1]],
    },
    {
      id: 'isobutano', nome: '2-metilpropano', formula: 'C₄H₁₀', dot: '#93c5fd',
      classes: { fechamento: 'aberta (acíclica)', saturacao: 'saturada', natureza: 'homogênea', ramos: 'ramificada' },
      atomos: [[.18, .62, 'C'], [.42, .45, 'C'], [.66, .62, 'C'], [.42, .18, 'C']],
      ligacoes: [[0, 1, 1], [1, 2, 1], [1, 3, 1]],
    },
    {
      id: 'buteno', nome: 'But-1-eno', formula: 'C₄H₈', dot: '#a78bfa',
      classes: { fechamento: 'aberta (acíclica)', saturacao: 'insaturada', natureza: 'homogênea', ramos: 'normal' },
      atomos: [[.12, .62, 'C'], [.34, .40, 'C'], [.56, .62, 'C'], [.78, .40, 'C']],
      ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 1]],
    },
    {
      id: 'ciclohexano', nome: 'Ciclo-hexano', formula: 'C₆H₁₂', dot: '#4ade80',
      classes: { fechamento: 'fechada (cíclica, alicíclica)', saturacao: 'saturada', natureza: 'homogênea', ramos: 'sem ramificações' },
      atomos: [[.50, .18, 'C'], [.68, .30, 'C'], [.68, .54, 'C'], [.50, .66, 'C'], [.32, .54, 'C'], [.32, .30, 'C']],
      ligacoes: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1]],
    },
    {
      id: 'benzeno', nome: 'Benzeno', formula: 'C₆H₆', dot: '#f472b6',
      classes: { fechamento: 'fechada (cíclica, aromática)', saturacao: 'insaturada', natureza: 'homogênea', ramos: 'sem ramificações' },
      atomos: [[.50, .18, 'C'], [.68, .30, 'C'], [.68, .54, 'C'], [.50, .66, 'C'], [.32, .54, 'C'], [.32, .30, 'C']],
      ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1]],
      nota: 'na prática as seis ligações são equivalentes (ressonância) — o anel alternado é só uma das estruturas de Kekulé',
    },
    {
      id: 'etoxietano', nome: 'Etoxietano (éter comum)', formula: 'C₄H₁₀O', dot: '#fbbf24',
      classes: { fechamento: 'aberta (acíclica)', saturacao: 'saturada', natureza: 'heterogênea', ramos: 'normal' },
      atomos: [[.10, .62, 'C'], [.30, .42, 'C'], [.50, .62, 'O'], [.70, .42, 'C'], [.90, .62, 'C']],
      ligacoes: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1]],
      nota: 'o oxigênio está ENTRE carbonos — é isso que torna a cadeia heterogênea',
    },
  ],

  /* ── Classificação dos carbonos de uma cadeia ──
     Molécula usada: 2,2,4-trimetilpentano (o "isoctano" da escala de
     octanagem). Cada carbono recebe sua classe conforme o número de
     outros CARBONOS ligados a ele. */
  MOLECULA_CLASSES: {
    nome: '2,2,4-trimetilpentano', formula: 'C₈H₁₈',
    atomos: [
      [.10, .55, 'C'], // 0 — CH₃ terminal
      [.28, .40, 'C'], // 1 — C quaternário
      [.46, .55, 'C'], // 2 — CH₂
      [.64, .40, 'C'], // 3 — CH terciário
      [.82, .55, 'C'], // 4 — CH₃ terminal
      [.28, .16, 'C'], // 5 — metila do C quaternário
      [.10, .24, 'C'], // 6 — metila do C quaternário
      [.64, .16, 'C'], // 7 — metila do C terciário
    ],
    ligacoes: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [1, 5, 1], [1, 6, 1], [3, 7, 1]],
    // classe[i] = quantos carbonos vizinhos aquele átomo tem
    classe: [1, 4, 2, 3, 1, 1, 1, 1],
  },
  CLASSES_C: [
    { id: 1, nome: 'Primário',    desc: 'ligado a apenas 1 outro carbono', dot: '#60a5fa' },
    { id: 2, nome: 'Secundário',  desc: 'ligado a 2 outros carbonos',      dot: '#4ade80' },
    { id: 3, nome: 'Terciário',   desc: 'ligado a 3 outros carbonos',      dot: '#fbbf24' },
    { id: 4, nome: 'Quaternário', desc: 'ligado a 4 outros carbonos',      dot: '#f472b6' },
  ],

  MODES: [
    {
      id: 'hibridizacao', sigla: 'sp³', nome: 'Hibridização do Carbono', sub: 'sp³, sp² e sp',
      icon: '🧩',
      hint: 'Escolha a hibridização na lista e compare o ângulo, a geometria e o número de ligações sigma e pi.',
      info: 'O carbono tem 4 elétrons na camada de valência e forma sempre 4 ligações. A mistura de orbitais (hibridização) define a geometria: sp³ dá quatro ligações simples em ângulos de 109,5°; sp² deixa um orbital p livre que forma a ligação pi da dupla, com ângulos de 120°; sp deixa dois orbitais p livres, formando a tripla, com ângulo de 180°. Quanto maior o caráter s, mais curta e mais forte é a ligação.',
      formula: 'sp³ → 109,5° · sp² → 120° · sp → 180°',
      formulaNote: 'Comprimentos médios: C–C ≈ 154 pm, C=C ≈ 134 pm, C≡C ≈ 120 pm.',
      hintCanvas: 'Enter/Espaço passa para a próxima hibridização',
      def: 'A hibridização mistura os orbitais do carbono e define o ângulo, a geometria e quantas ligações pi ele consegue formar.',
      fatos: [
        { l: 'sp³', v: '109,5° · tetraédrica' },
        { l: 'sp²', v: '120° · trigonal plana' },
        { l: 'sp',  v: '180° · linear' },
        { l: 'Ligações', v: 'sempre 4 no total' },
      ],
      canvasInteracao: 'Veja o carbono central com suas ligações no ângulo real de cada hibridização.',
      overlay: 'Hibridização', panels: ['panel-hibridizacao'], primary: 'hib-next',
    },
    {
      id: 'cadeias', sigla: 'C–C', nome: 'Cadeias Carbônicas', sub: 'Como classificar',
      icon: '🔗',
      hint: 'Escolha uma cadeia e leia a classificação nos quatro critérios. Use "Sortear cadeia" para treinar antes de conferir.',
      info: 'Toda cadeia carbônica é classificada por quatro critérios independentes: fechamento (aberta/acíclica ou fechada/cíclica), saturação (saturada, só ligações simples, ou insaturada, com dupla ou tripla), natureza (homogênea, só carbonos na cadeia principal, ou heterogênea, com um heteroátomo entre carbonos) e ramificação (normal ou ramificada). Os quatro valem ao mesmo tempo para a mesma molécula.',
      formula: 'fechamento · saturação · natureza · ramificação',
      formulaNote: 'Cadeia heterogênea exige o heteroátomo ENTRE carbonos: o oxigênio do álcool (na ponta) não torna a cadeia heterogênea.',
      hintCanvas: 'Enter/Espaço sorteia outra cadeia',
      def: 'Uma cadeia é classificada em quatro critérios ao mesmo tempo: fechamento, saturação, natureza e ramificação.',
      fatos: [
        { l: 'Fechamento', v: 'aberta ou fechada' },
        { l: 'Saturação',  v: 'saturada ou insaturada' },
        { l: 'Natureza',   v: 'homogênea ou heterogênea' },
        { l: 'Ramificação', v: 'normal ou ramificada' },
      ],
      canvasInteracao: 'A cadeia é desenhada em bastão; ligações duplas aparecem com dois traços e heteroátomos em destaque.',
      recomendados: ['Butano', 'Benzeno', 'Etoxietano (éter comum)'],
      overlay: 'Cadeias carbônicas', panels: ['panel-cadeias'], primary: 'cad-sortear',
    },
    {
      id: 'classificacao', sigla: '1º–4º', nome: 'Classificação dos Carbonos', sub: 'Primário a quaternário',
      icon: '🎯',
      hint: 'Escolha uma classe para destacar no 2,2,4-trimetilpentano — os carbonos daquela classe acendem no desenho.',
      info: 'Um carbono é primário, secundário, terciário ou quaternário conforme o número de OUTROS CARBONOS ligados a ele (hidrogênios não contam). O 2,2,4-trimetilpentano tem os quatro tipos ao mesmo tempo, por isso é o exemplo clássico. Essa classificação é a base para prever reações de substituição e a estabilidade de carbocátions.',
      formula: 'classe = número de carbonos vizinhos',
      formulaNote: 'Hidrogênios nunca entram nessa contagem.',
      hintCanvas: 'Enter/Espaço passa para a próxima classe',
      def: 'A classe de um carbono é o número de outros carbonos ligados a ele — de primário (1) a quaternário (4).',
      fatos: [
        { l: 'Primário',    v: '1 carbono vizinho' },
        { l: 'Secundário',  v: '2 carbonos vizinhos' },
        { l: 'Terciário',   v: '3 carbonos vizinhos' },
        { l: 'Quaternário', v: '4 carbonos vizinhos' },
      ],
      canvasInteracao: 'Os carbonos da classe escolhida ficam coloridos e numerados no esqueleto da molécula.',
      overlay: 'Classificação dos carbonos', panels: ['panel-classificacao'], primary: 'cls-next',
    },
  ],

  CURIOSIDADES: [
    'O carbono forma mais compostos do que todos os outros elementos somados — passam de dezenas de milhões de substâncias catalogadas.',
    'Diamante e grafite são feitos só de carbono: a diferença está na hibridização (sp³ no diamante, sp² no grafite).',
    'A tetravalência do carbono foi proposta por Kekulé em 1858, antes de existir qualquer modelo de orbital.',
    'O benzeno não tem três duplas fixas: as ligações são todas equivalentes por ressonância, algo que Kekulé só conseguiu representar alternando as duplas.',
    'O 2,2,4-trimetilpentano é o padrão de octanagem 100 dos combustíveis — daí o nome "isoctano".',
    'Quanto mais caráter s na hibridização, mais curta a ligação: por isso a tripla (sp) é a mais curta das três.',
  ],
};
