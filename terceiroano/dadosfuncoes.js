/* ================================================================
   SIFOR — dadosfuncoes.js | dados fixos das Funções Orgânicas
   ================================================================
   FONTES DOS DADOS (conferir/atualizar sempre nestas referências):
   - Nomenclatura, sufixos e prefixos de cadeia: IUPAC, "Nomenclature
     of Organic Chemistry: Recommendations and Preferred Names 2013"
     (Blue Book) — regras P-14.4 (prefixos numéricos), P-31/P-63
     (sufixos das classes funcionais).
   - Pontos de ebulição a 1 atm (101,325 kPa): NIST Chemistry WebBook
     (webbook.nist.gov/chemistry) — conferir espécie por espécie; os
     valores dos álcoois de cadeia maior são arredondados na
     literatura, por isso aparecem sem casa decimal aqui.
   - Regra do aumento do ponto de ebulição com a massa molar e com as
     ligações de hidrogênio: qualquer livro-texto de Química Orgânica
     (ex.: Solomons & Fryhle, cap. de forças intermoleculares).

   OBSERVAÇÃO IMPORTANTE SOBRE O MODO "MONTADOR DE NOME"
   O montador segue a nomenclatura mais simples da IUPAC (cadeia
   normal, grupo na posição 1). Nomes com ramificações, posições ou
   mais de um grupo funcional exigem regras adicionais que este
   módulo não simula — isso está avisado na tela.
   ================================================================ */
'use strict';

window.SIM_DATA = {
  ACRO: 'SIFOR',
  TITLE: 'Simulador Interativo de Funções Orgânicas',

  /* ── Prefixos de cadeia (número de carbonos) — IUPAC P-14.4 ── */
  PREFIXOS: ['met', 'et', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'],

  /* ── Infixo: tipo de ligação entre carbonos ── */
  INFIXOS: [
    { id: 'an', nome: 'an', desc: 'só ligações simples (saturada)', deltaH: 0,  minC: 1 },
    { id: 'en', nome: 'en', desc: 'uma ligação dupla',              deltaH: -2, minC: 2 },
    { id: 'in', nome: 'in', desc: 'uma ligação tripla',             deltaH: -4, minC: 2 },
  ],

  /* ── Funções orgânicas ──
     sufixo  → terminação do nome (IUPAC)
     hBase   → hidrogênios da versão saturada, em função de n
     o, n     → átomos de oxigênio e nitrogênio da função
     minC    → mínimo de carbonos para a função existir            */
  FUNCOES: [
    {
      id: 'hidrocarboneto', nome: 'Hidrocarboneto', grupo: 'apenas C e H',
      sufixo: 'o', dot: '#94a3b8', minC: 1, hBase: n => 2 * n + 2, o: 0, n: 0,
      exemplo: 'Metano (CH₄)', usa: 'combustíveis, gás de cozinha, plásticos',
      desc: 'Formado só por carbono e hidrogênio. É a função de referência das outras.',
    },
    {
      id: 'alcool', nome: 'Álcool', grupo: '–OH ligado a carbono saturado',
      sufixo: 'ol', dot: '#60a5fa', minC: 1, hBase: n => 2 * n + 2, o: 1, n: 0,
      exemplo: 'Etanol (C₂H₆O)', usa: 'combustível, antisséptico, bebidas',
      desc: 'A hidroxila faz ligação de hidrogênio: por isso o álcool ferve muito acima do alcano de massa parecida.',
    },
    {
      id: 'aldeido', nome: 'Aldeído', grupo: '–CHO na ponta da cadeia',
      sufixo: 'al', dot: '#a78bfa', minC: 1, hBase: n => 2 * n, o: 1, n: 0,
      exemplo: 'Metanal (CH₂O)', usa: 'conservante (formol), resinas',
      desc: 'A carbonila fica no carbono da extremidade, sempre com um hidrogênio ligado a ela.',
    },
    {
      id: 'cetona', nome: 'Cetona', grupo: 'C=O entre dois carbonos',
      sufixo: 'ona', dot: '#f472b6', minC: 3, hBase: n => 2 * n, o: 1, n: 0,
      exemplo: 'Propanona (C₃H₆O)', usa: 'solvente, removedor de esmalte',
      desc: 'A carbonila fica no meio da cadeia — por isso precisa de pelo menos 3 carbonos.',
    },
    {
      id: 'acido', nome: 'Ácido carboxílico', grupo: '–COOH',
      sufixo: 'oico', prefixoNome: 'ácido ', dot: '#f87171', minC: 1, hBase: n => 2 * n, o: 2, n: 0,
      exemplo: 'Ácido etanoico (C₂H₄O₂)', usa: 'vinagre, conservantes, sabões',
      desc: 'A carboxila é o grupo mais ácido das funções orgânicas comuns.',
    },
    {
      id: 'amina', nome: 'Amina', grupo: '–NH₂ ligado a carbono',
      sufixo: 'amina', dot: '#4ade80', minC: 1, hBase: n => 2 * n + 3, o: 0, n: 1,
      exemplo: 'Metanamina (CH₅N)', usa: 'medicamentos, corantes, proteínas',
      desc: 'Derivada da amônia (NH₃) trocando hidrogênios por grupos orgânicos; tem caráter básico.',
    },
    {
      id: 'ester', nome: 'Éster', grupo: '–COO– entre carbonos',
      sufixo: 'oato de …ila', dot: '#fbbf24', minC: 2, hBase: n => 2 * n, o: 2, n: 0,
      exemplo: 'Etanoato de etila (C₄H₈O₂)', usa: 'aromas de frutas, essências, biodiesel',
      desc: 'Vem da reação entre ácido carboxílico e álcool (esterificação). O nome tem duas partes.',
      semMontador: true,
    },
    {
      id: 'eter', nome: 'Éter', grupo: '–O– entre carbonos',
      sufixo: 'oxi… (prefixo)', dot: '#22d3ee', minC: 2, hBase: n => 2 * n + 2, o: 1, n: 0,
      exemplo: 'Etoxietano (C₄H₁₀O)', usa: 'solvente, antigo anestésico',
      desc: 'O oxigênio fica ENTRE dois carbonos, o que torna a cadeia heterogênea.',
      semMontador: true,
    },
  ],

  /* ── Pontos de ebulição a 1 atm, em °C (fonte: NIST WebBook) ──
     Servem para comparar alcanos (sem ligação de hidrogênio) com
     álcoois de mesmo número de carbonos. */
  PE_ALCANOS: [
    { n: 1, nome: 'Metano',  pe: -161.5 },
    { n: 2, nome: 'Etano',   pe: -88.6 },
    { n: 3, nome: 'Propano', pe: -42.1 },
    { n: 4, nome: 'Butano',  pe: -0.5 },
    { n: 5, nome: 'Pentano', pe: 36.1 },
    { n: 6, nome: 'Hexano',  pe: 68.7 },
    { n: 7, nome: 'Heptano', pe: 98.4 },
    { n: 8, nome: 'Octano',  pe: 125.7 },
  ],
  PE_ALCOOIS: [
    { n: 1, nome: 'Metanol',    pe: 64.7 },
    { n: 2, nome: 'Etanol',     pe: 78.4 },
    { n: 3, nome: '1-propanol', pe: 97.2 },
    { n: 4, nome: '1-butanol',  pe: 117.7 },
    { n: 5, nome: '1-pentanol', pe: 138 },
    { n: 6, nome: '1-hexanol',  pe: 157 },
    { n: 7, nome: '1-heptanol', pe: 176 },
    { n: 8, nome: '1-octanol',  pe: 195 },
  ],

  MODES: [
    {
      id: 'grupos', sigla: 'R–X', nome: 'Grupos Funcionais', sub: 'Quem é quem',
      icon: '🔍',
      hint: 'Escolha uma função na lista e veja o grupo funcional desenhado, com o sufixo do nome e um exemplo do dia a dia.',
      info: 'Função orgânica é um conjunto de compostos que têm o mesmo grupo funcional e, por isso, propriedades químicas parecidas. O grupo funcional é o "endereço" da reatividade da molécula: é ali que a reação acontece. Cada função tem um sufixo próprio na nomenclatura IUPAC — ol para álcool, al para aldeído, ona para cetona, oico para ácido carboxílico.',
      formula: 'função = mesmo grupo funcional → mesmas reações',
      formulaNote: 'Éster e éter têm nomes com duas partes, por isso não entram no montador do modo 2.',
      hintCanvas: 'Enter/Espaço passa para a próxima função',
      def: 'Cada função orgânica é definida por um grupo funcional, que determina o sufixo do nome e as reações típicas do composto.',
      fatos: [
        { l: 'Álcool',  v: '–OH · sufixo ol' },
        { l: 'Aldeído', v: '–CHO · sufixo al' },
        { l: 'Cetona',  v: 'C=O interno · ona' },
        { l: 'Ácido',   v: '–COOH · oico' },
      ],
      canvasInteracao: 'O grupo funcional aparece desenhado em destaque, ligado ao resto da cadeia (R).',
      recomendados: ['Álcool', 'Ácido carboxílico', 'Amina'],
      overlay: 'Grupos funcionais', panels: ['panel-grupos'], primary: 'fun-next',
    },
    {
      id: 'nomenclatura', sigla: 'IUPAC', nome: 'Montador de Nome', sub: 'Prefixo + infixo + sufixo',
      icon: '🔤',
      hint: 'Escolha o número de carbonos, o tipo de ligação e a função — o nome IUPAC e a fórmula molecular são montados na hora.',
      info: 'O nome IUPAC de um composto simples tem três pedaços: o prefixo diz quantos carbonos a cadeia principal tem (met, et, prop, but...), o infixo diz o tipo de ligação entre eles (an para saturada, en para dupla, in para tripla) e o sufixo diz a função (o, ol, al, ona, oico, amina). A fórmula molecular é calculada junto: cada ligação dupla tira 2 hidrogênios e cada tripla tira 4.',
      formula: 'nome = prefixo + infixo + sufixo',
      formulaNote: 'Este montador usa a cadeia normal com o grupo na posição 1. Ramificações e posições pedem regras adicionais da IUPAC.',
      hintCanvas: 'Enter/Espaço sorteia uma combinação',
      def: 'O nome IUPAC se monta em três pedaços: quantos carbonos, que tipo de ligação e qual função.',
      fatos: [
        { l: 'Prefixo', v: 'met, et, prop, but…' },
        { l: 'Infixo',  v: 'an, en, in' },
        { l: 'Sufixo',  v: 'o, ol, al, ona, oico' },
        { l: 'Fórmula', v: 'calculada junto' },
      ],
      canvasInteracao: 'A cadeia é desenhada com o número de carbonos escolhido, a insaturação e o grupo funcional na ponta.',
      overlay: 'Montador de nome', panels: ['panel-nomenclatura'], primary: 'nom-sortear',
    },
    {
      id: 'ebulicao', sigla: 'PE', nome: 'Ponto de Ebulição', sub: 'Alcano × álcool',
      icon: '🌡️',
      hint: 'Arraste o número de carbonos e compare, no gráfico, o ponto de ebulição do alcano com o do álcool de mesma cadeia.',
      info: 'Duas coisas fazem o ponto de ebulição subir: cadeia maior (mais massa e mais superfície de contato, logo mais forças de dispersão) e ligações de hidrogênio. O álcool tem hidroxila e faz ligação de hidrogênio; o alcano não. Por isso o metanol ferve acima de 60 °C enquanto o metano ferve abaixo de −160 °C, mesmo tendo cadeias do mesmo tamanho. Todos os valores são medidos a 1 atm.',
      formula: 'PE ↑ com massa molar ↑ e com ligação de hidrogênio',
      formulaNote: 'A diferença entre álcool e alcano diminui à medida que a cadeia cresce, porque a dispersão passa a pesar mais que a hidroxila.',
      hintCanvas: 'Enter/Espaço anuncia a comparação atual',
      def: 'O álcool ferve muito acima do alcano de mesma cadeia porque a hidroxila faz ligação de hidrogênio.',
      fatos: [
        { l: 'Metano',  v: '−161,5 °C' },
        { l: 'Metanol', v: '64,7 °C' },
        { l: 'Causa',   v: 'ligação de hidrogênio' },
        { l: 'Fonte',   v: 'NIST WebBook, 1 atm' },
      ],
      canvasInteracao: 'As duas curvas são desenhadas juntas; a cadeia escolhida fica marcada nas duas.',
      overlay: 'Ponto de ebulição', panels: ['panel-ebulicao'], primary: 'ebu-status',
    },
  ],

  CURIOSIDADES: [
    'O cheiro de fruta de muitos doces vem de ésteres: o etanoato de isoamila lembra banana.',
    'O formol é uma solução aquosa de metanal, o aldeído mais simples que existe.',
    'O vinagre é uma solução de ácido etanoico (ácido acético) a cerca de 4 a 8 por cento.',
    'A propanona, conhecida como acetona, é a cetona mais simples e um solvente muito usado.',
    'As aminas são derivadas da amônia e aparecem em quase todos os medicamentos.',
    'O etanol e o dimetil éter têm a mesma fórmula C₂H₆O, mas funções diferentes: são isômeros de função.',
    'Álcoois com até três carbonos se misturam com a água em qualquer proporção; a partir do butanol a solubilidade cai bastante.',
  ],
};
