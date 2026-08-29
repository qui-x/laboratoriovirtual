/* ================================================================
   SIREA — dadosreacoes.js | dados fixos das Reações Orgânicas
   ================================================================
   FONTES DOS DADOS (conferir/atualizar sempre nestas referências):
   - Nomes dos produtos e das reações: IUPAC, "Nomenclature of Organic
     Chemistry: Recommendations and Preferred Names 2013" (Blue Book)
     e IUPAC "Glossary of terms used in physical organic chemistry"
     (adição, substituição, eliminação).
   - Regra de Markovnikov (o hidrogênio entra no carbono mais
     hidrogenado) e catalisadores de hidrogenação (Ni, Pd, Pt):
     livro-texto padrão de Química Orgânica (ex.: Solomons & Fryhle;
     McMurry), capítulos de alcenos e de aromáticos.
   - Substituição eletrofílica aromática (nitração, sulfonação,
     alquilação de Friedel-Crafts) e halogenação radicalar de alcanos:
     mesmos livros-texto, capítulos de benzeno e de alcanos.
   - Estequiometria da combustão: balanceamento a partir da fórmula
     geral do alcano CₙH₂ₙ₊₂ — o script calcula os coeficientes, nada
     está "chumbado" aqui.

   COMO ESTE ARQUIVO É USADO
   Cada reação traz o desenho de "antes" e "depois" em coordenadas
   normalizadas (0 a 1). Quem converte para pixels é o script.
   Rótulos com mais de uma letra (OH, Br, NO₂) são desenhados como um
   único nó, para o esqueleto ficar legível.
   ================================================================ */
'use strict';

window.SIM_DATA = {
  ACRO: 'SIREA',
  TITLE: 'Simulador Interativo de Reações Orgânicas',

  /* ── REAÇÕES DE ADIÇÃO (em alceno: propeno) ──
     A dupla se abre e os dois fragmentos do reagente entram nos
     carbonos que formavam a dupla. */
  ADICOES: [
    {
      id: 'h2', nome: 'Hidrogenação catalítica', reagente: 'H₂', catalisador: 'Ni, Pd ou Pt',
      dot: '#94a3b8', produto: 'Propano',
      eq: 'CH₂=CH–CH₃ + H₂ → CH₃–CH₂–CH₃',
      regra: 'não há ambiguidade: entra um H em cada carbono',
      nota: 'é a mesma reação usada para transformar óleo vegetal em gordura sólida',
      antes: { atomos: [[.20, .68, 'C'], [.50, .40, 'C'], [.80, .68, 'C']], ligacoes: [[0, 1, 2], [1, 2, 1]] },
      depois: { atomos: [[.14, .68, 'C'], [.44, .40, 'C'], [.74, .68, 'C'], [.06, .34, 'H'], [.44, .10, 'H']],
        ligacoes: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [1, 4, 1]] },
    },
    {
      id: 'br2', nome: 'Halogenação', reagente: 'Br₂', catalisador: 'não precisa',
      dot: '#f87171', produto: '1,2-dibromopropano',
      eq: 'CH₂=CH–CH₃ + Br₂ → CH₂Br–CHBr–CH₃',
      regra: 'um halogênio em cada carbono da antiga dupla',
      nota: 'o descoramento da água de bromo é o teste clássico para identificar insaturação',
      antes: { atomos: [[.20, .68, 'C'], [.50, .40, 'C'], [.80, .68, 'C']], ligacoes: [[0, 1, 2], [1, 2, 1]] },
      depois: { atomos: [[.18, .70, 'C'], [.48, .45, 'C'], [.78, .70, 'C'], [.10, .32, 'Br'], [.48, .12, 'Br']],
        ligacoes: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [1, 4, 1]] },
    },
    {
      id: 'hbr', nome: 'Adição de HX (Markovnikov)', reagente: 'HBr', catalisador: 'não precisa',
      dot: '#a78bfa', produto: '2-bromopropano',
      eq: 'CH₂=CH–CH₃ + HBr → CH₃–CHBr–CH₃',
      regra: 'Markovnikov: o H entra no carbono MAIS hidrogenado, o Br no menos',
      nota: 'o produto principal é o 2-bromopropano, não o 1-bromopropano',
      antes: { atomos: [[.20, .68, 'C'], [.50, .40, 'C'], [.80, .68, 'C']], ligacoes: [[0, 1, 2], [1, 2, 1]] },
      depois: { atomos: [[.18, .68, 'C'], [.48, .45, 'C'], [.78, .68, 'C'], [.48, .12, 'Br']],
        ligacoes: [[0, 1, 1], [1, 2, 1], [1, 3, 1]] },
    },
    {
      id: 'h2o', nome: 'Hidratação em meio ácido', reagente: 'H₂O / H⁺', catalisador: 'H₂SO₄ diluído',
      dot: '#38bdf8', produto: 'Propan-2-ol',
      eq: 'CH₂=CH–CH₃ + H₂O → CH₃–CH(OH)–CH₃',
      regra: 'Markovnikov: a hidroxila entra no carbono menos hidrogenado',
      nota: 'é o caminho industrial para produzir álcoois a partir de alcenos',
      antes: { atomos: [[.20, .68, 'C'], [.50, .40, 'C'], [.80, .68, 'C']], ligacoes: [[0, 1, 2], [1, 2, 1]] },
      depois: { atomos: [[.18, .68, 'C'], [.48, .45, 'C'], [.78, .68, 'C'], [.48, .12, 'OH']],
        ligacoes: [[0, 1, 1], [1, 2, 1], [1, 3, 1]] },
    },
  ],

  /* ── REAÇÕES DE SUBSTITUIÇÃO ──
     Um átomo ou grupo sai e outro entra no lugar; a cadeia não muda
     de tamanho. */
  SUBSTITUICOES: [
    {
      id: 'cloracao', nome: 'Halogenação de alcano', reagente: 'Cl₂', condicao: 'luz ultravioleta ou calor',
      dot: '#4ade80', produto: 'Clorometano + HCl', substrato: 'Metano',
      eq: 'CH₄ + Cl₂ → CH₃Cl + HCl',
      mecanismo: 'radicalar (radicais livres em cadeia)',
      nota: 'a reação não para no primeiro produto: dá mistura de mono, di, tri e tetraclorado',
      antes: { atomos: [[.50, .45, 'C'], [.50, .12, 'H'], [.20, .65, 'H'], [.80, .65, 'H'], [.50, .82, 'H']],
        ligacoes: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
      depois: { atomos: [[.50, .45, 'C'], [.50, .12, 'Cl'], [.20, .65, 'H'], [.80, .65, 'H'], [.50, .82, 'H']],
        ligacoes: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    },
    {
      id: 'nitracao', nome: 'Nitração do benzeno', reagente: 'HNO₃', condicao: 'H₂SO₄ concentrado',
      dot: '#fbbf24', produto: 'Nitrobenzeno + H₂O', substrato: 'Benzeno',
      eq: 'C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O',
      mecanismo: 'substituição eletrofílica aromática',
      nota: 'o anel aromático prefere substituir a adicionar, para não perder a estabilidade da ressonância',
      antes: { atomos: [[.50, .18, 'C'], [.74, .34, 'C'], [.74, .62, 'C'], [.50, .78, 'C'], [.26, .62, 'C'], [.26, .34, 'C']],
        ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1]] },
      depois: { atomos: [[.44, .28, 'C'], [.66, .42, 'C'], [.66, .68, 'C'], [.44, .82, 'C'], [.22, .68, 'C'], [.22, .42, 'C'], [.44, .04, 'NO₂']],
        ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]] },
    },
    {
      id: 'sulfonacao', nome: 'Sulfonação do benzeno', reagente: 'H₂SO₄', condicao: 'ácido sulfúrico fumegante',
      dot: '#f472b6', produto: 'Ácido benzenossulfônico + H₂O', substrato: 'Benzeno',
      eq: 'C₆H₆ + H₂SO₄ → C₆H₅SO₃H + H₂O',
      mecanismo: 'substituição eletrofílica aromática',
      nota: 'os ácidos sulfônicos são a base dos detergentes sintéticos',
      antes: { atomos: [[.50, .18, 'C'], [.74, .34, 'C'], [.74, .62, 'C'], [.50, .78, 'C'], [.26, .62, 'C'], [.26, .34, 'C']],
        ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1]] },
      depois: { atomos: [[.44, .28, 'C'], [.66, .42, 'C'], [.66, .68, 'C'], [.44, .82, 'C'], [.22, .68, 'C'], [.22, .42, 'C'], [.44, .04, 'SO₃H']],
        ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]] },
    },
    {
      id: 'alquilacao', nome: 'Alquilação de Friedel-Crafts', reagente: 'CH₃Cl', condicao: 'AlCl₃ (catalisador)',
      dot: '#22d3ee', produto: 'Metilbenzeno (tolueno) + HCl', substrato: 'Benzeno',
      eq: 'C₆H₆ + CH₃Cl → C₆H₅CH₃ + HCl',
      mecanismo: 'substituição eletrofílica aromática',
      nota: 'o tolueno formado é matéria-prima de solventes e explosivos',
      antes: { atomos: [[.50, .18, 'C'], [.74, .34, 'C'], [.74, .62, 'C'], [.50, .78, 'C'], [.26, .62, 'C'], [.26, .34, 'C']],
        ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1]] },
      depois: { atomos: [[.44, .28, 'C'], [.66, .42, 'C'], [.66, .68, 'C'], [.44, .82, 'C'], [.22, .68, 'C'], [.22, .42, 'C'], [.44, .04, 'CH₃']],
        ligacoes: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]] },
    },
  ],

  /* ── COMBUSTÃO ──
     Os coeficientes são CALCULADOS pelo script a partir da fórmula
     geral do alcano CₙH₂ₙ₊₂ — assim nunca ficam desbalanceados. */
  COMBUSTAO_TIPOS: [
    { id: 'completa',  nome: 'Completa',            produto: 'CO₂ + H₂O', dot: '#38bdf8',
      nota: 'oxigênio em excesso; libera a maior quantidade de energia e a chama fica azul' },
    { id: 'monoxido',  nome: 'Incompleta (CO)',      produto: 'CO + H₂O',  dot: '#fbbf24',
      nota: 'oxigênio insuficiente; forma monóxido de carbono, gás tóxico e inodoro' },
    { id: 'fuligem',   nome: 'Incompleta (fuligem)', produto: 'C(s) + H₂O', dot: '#f87171',
      nota: 'oxigênio muito escasso; sobra carbono sólido (fuligem) e a chama fica amarela e fumacenta' },
  ],

  MODES: [
    {
      id: 'adicao', sigla: '+', nome: 'Reações de Adição', sub: 'A dupla se abre',
      icon: '➕',
      hint: 'Escolha o reagente que vai atacar o propeno e compare a molécula antes e depois da reação.',
      info: 'Na adição, a ligação dupla se rompe parcialmente e os dois fragmentos do reagente entram nos carbonos que formavam a insaturação. A cadeia fica saturada e nenhum átomo é liberado — tudo que entra fica na molécula. Quando os dois fragmentos são diferentes (como em HBr ou H₂O), a regra de Markovnikov diz onde cada um entra: o hidrogênio vai para o carbono que já tem mais hidrogênios.',
      formula: 'C=C + X–Y → C(X)–C(Y)',
      formulaNote: 'Markovnikov vale quando os fragmentos são diferentes; com H₂ ou Br₂ não há ambiguidade.',
      hintCanvas: 'Enter/Espaço passa para o próximo reagente',
      def: 'Na adição a dupla se abre e o reagente entra inteiro na molécula — nada é eliminado.',
      fatos: [
        { l: 'Hidrogenação', v: 'H₂ com Ni, Pd ou Pt' },
        { l: 'Halogenação',  v: 'Br₂ descora' },
        { l: 'HX e H₂O',     v: 'seguem Markovnikov' },
        { l: 'Resultado',    v: 'cadeia saturada' },
      ],
      canvasInteracao: 'À esquerda o propeno com a dupla; à direita o produto, com os átomos que entraram destacados.',
      recomendados: ['Hidrogenação catalítica', 'Adição de HX (Markovnikov)'],
      overlay: 'Reações de adição', panels: ['panel-adicao'], primary: 'ad-next',
    },
    {
      id: 'substituicao', sigla: '↔', nome: 'Reações de Substituição', sub: 'Um sai, outro entra',
      icon: '🔁',
      hint: 'Escolha a reação e compare o substrato com o produto: veja qual átomo saiu e qual entrou no lugar.',
      info: 'Na substituição, um átomo ou grupo da molécula orgânica sai e outro entra no mesmo lugar; o tamanho da cadeia não muda e sempre se forma um segundo produto pequeno (HCl, H₂O). Nos alcanos a reação é radicalar e precisa de luz ou calor. No benzeno, a substituição é preferida à adição justamente porque adicionar destruiria a estabilidade da ressonância do anel aromático.',
      formula: 'R–H + X–Y → R–X + H–Y',
      formulaNote: 'No benzeno o mecanismo é eletrofílico; no alcano é radicalar e dá mistura de produtos.',
      hintCanvas: 'Enter/Espaço passa para a próxima reação',
      def: 'Na substituição um átomo sai da molécula e outro entra no lugar, formando também um produto pequeno.',
      fatos: [
        { l: 'Alcano + Cl₂', v: 'precisa de luz' },
        { l: 'Benzeno',      v: 'substitui, não adiciona' },
        { l: 'Nitração',     v: 'HNO₃ com H₂SO₄' },
        { l: 'Friedel-Crafts', v: 'AlCl₃ como catalisador' },
      ],
      canvasInteracao: 'O átomo que entra aparece em destaque no produto, à direita da seta.',
      recomendados: ['Nitração do benzeno', 'Halogenação de alcano'],
      overlay: 'Reações de substituição', panels: ['panel-substituicao'], primary: 'sub-next',
    },
    {
      id: 'combustao', sigla: 'O₂', nome: 'Combustão de Alcanos', sub: 'Balanceamento automático',
      icon: '🔥',
      hint: 'Escolha o número de carbonos do alcano e o tipo de combustão — a equação é balanceada na hora.',
      info: 'A combustão é a reação do hidrocarboneto com o oxigênio. Com O₂ suficiente, a combustão é completa e forma só CO₂ e H₂O. Com O₂ insuficiente, forma monóxido de carbono (tóxico) ou até carbono sólido, a fuligem. Todos os coeficientes desta tela são calculados a partir da fórmula geral do alcano, CₙH₂ₙ₊₂, e depois simplificados para os menores números inteiros.',
      formula: 'CₙH₂ₙ₊₂ + O₂ → produtos + H₂O',
      formulaNote: 'Completa: n CO₂ e (n+1) H₂O. Quanto menos O₂, mais o carbono fica "mal oxidado" (CO e depois fuligem).',
      hintCanvas: 'Enter/Espaço alterna o tipo de combustão',
      def: 'Quanto menos oxigênio disponível, menos oxidado fica o carbono: de CO₂ para CO e depois para fuligem.',
      fatos: [
        { l: 'Completa',   v: 'CO₂ + H₂O' },
        { l: 'Incompleta', v: 'CO + H₂O' },
        { l: 'Muito pobre', v: 'C(s) + H₂O' },
        { l: 'Coeficientes', v: 'calculados na hora' },
      ],
      canvasInteracao: 'A equação balanceada é escrita no canvas junto com a proporção de O₂ consumida.',
      overlay: 'Combustão', panels: ['panel-combustao'], primary: 'comb-next',
    },
  ],

  CURIOSIDADES: [
    'A água de bromo descora na presença de alcenos: é um teste rápido para saber se a cadeia tem insaturação.',
    'A margarina é feita hidrogenando óleos vegetais — a mesma reação de adição de H₂ do primeiro modo.',
    'A regra de Markovnikov foi enunciada em 1870 e só décadas depois foi explicada pela estabilidade dos carbocátions.',
    'O monóxido de carbono é perigoso porque se liga à hemoglobina cerca de 200 vezes mais firmemente que o oxigênio.',
    'A chama azul do fogão indica combustão completa; chama amarelada indica falta de oxigênio.',
    'O benzeno prefere substituição a adição para não perder a estabilidade extra da ressonância do anel.',
    'Na cloração do metano o produto nunca é único: sempre sai mistura de clorometano, diclorometano, triclorometano e tetracloreto de carbono.',
  ],
};
