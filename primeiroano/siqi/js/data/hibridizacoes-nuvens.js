/* ═══════════════════════════════════════════════════════════════
   CAMADA: DADOS
   ARQUIVO: hibridizacoes-nuvens.js
   ───────────────────────────────────────────────────────────────
   O módulo "Hibridização de Nuvens Eletrônicas" substitui o antigo
   módulo de Redox — em vez de transferência de elétrons entre
   espécies, o tema agora é como as nuvens eletrônicas (orbitais
   atômicos s/p/d) se MISTURAM para formar novos orbitais híbridos
   usados nas ligações covalentes, e como isso se correlaciona com a
   geometria molecular (VSEPR).

   Cada entrada documenta, para o ÁTOMO CENTRAL de um composto real:
     nSigma        — nº de ligações σ (cada vizinho conta 1, não
                     importa se a ligação é simples/dupla/tripla —
                     dupla/tripla ligação é 1σ + 1 ou 2π, e é o π que
                     NÃO entra na hibridização, só o σ)
     nPares        — nº de pares de elétrons isolados no átomo central
     nDominios     — nSigma + nPares (a regra de contagem de domínios
                     de Gillespie-Nyholm/VSEPR)
     hibridizacao  — sp/sp²/sp³/sp³d/sp³d², decidida DIRETAMENTE por
                     nDominios (2→sp, 3→sp², 4→sp³, 5→sp³d, 6→sp³d²)
     geometriaEletronica — a geometria dos DOMÍNIOS (ligantes + pares
                     isolados juntos) — sempre bate com nDominios
     geometriaMolecular  — a geometria só dos ÁTOMOS visíveis (pares
                     isolados "empurram" os ligantes, mas não contam
                     como "vértice" da forma observada) — por isso
                     pode ser DIFERENTE da eletrônica quando há pares
                     isolados (ex.: NH₃ é tetraédrico na nuvem
                     eletrônica, mas PIRAMIDAL na forma observada)

   Mesma correlação já usada no motor VSEPR do SILQ (silqVsepAngle,
   ver js/render/silq-integracao.js) — o número de domínios é
   exatamente o que aquela função já recebe pra calcular o ângulo.
   Este módulo reaproveita a MESMA lógica de contagem, só que agora
   o produto pedagógico final é o TIPO DE ORBITAL HÍBRIDO, não (só) o
   ângulo.

   Referências: Atkins, Overton, Rourke, Weller & Armstrong,
   "Shriver & Atkins' Inorganic Chemistry"; Housecroft & Sharpe,
   "Inorganic Chemistry"; Brown, LeMay & Bursten, "Chemistry: The
   Central Science" Cap. 9 (Geometria Molecular e Teoria da Ligação);
   IUPAC Red Book 2005.

   BNCC: Habilidades EM13CNT101/EM13CNT207 (modelos explicativos de
   ligação química e geometria molecular, Ensino Médio).
   Depende de: nada. Usado por: js/hibridizacao/*.
═══════════════════════════════════════════════════════════════ */

'use strict';

var HIBRIDIZACOES_NUVENS = [

  /* ═══════════ sp — linear, 2 domínios, 180° ═══════════ */
  {
    id: 'hib_co2', formula: 'CO₂', formulaId: 'CO2', nome: 'Dióxido de Carbono',
    atomoCentral: 'C', nSigma: 2, nPares: 0, nDominios: 2,
    hibridizacao: 'sp',
    geometriaEletronica: 'Linear', geometriaMolecular: 'Linear',
    anguloIdeal: 180, anguloReal: 180,
    massa: '44,01 g/mol', nivel: 'basico',
    explicacaoOrbitais: 'O carbono mistura 1 orbital 2s + 1 orbital 2p, formando 2 orbitais híbridos sp colineares (180° entre si). Os 2 orbitais 2p que NÃO entram na mistura ficam perpendiculares entre si e fazem as 2 ligações π (uma pra cada O) — cada ligação C=O é, na verdade, 1σ (do orbital sp) + 1π (do orbital p puro).',
    aplicacao: 'Produto da respiração celular e da combustão completa; gás estufa; usado em extintores e em bebidas carbonatadas.',
    fonte: 'Atkins et al., Shriver & Atkins Inorganic Chemistry, Cap. 2; geometria consistente com CATALOGO_SIQI.',
  },
  {
    id: 'hib_becl2', formula: 'BeCl₂', formulaId: 'BeCl2', nome: 'Cloreto de Berílio',
    atomoCentral: 'Be', nSigma: 2, nPares: 0, nDominios: 2,
    hibridizacao: 'sp',
    geometriaEletronica: 'Linear', geometriaMolecular: 'Linear',
    anguloIdeal: 180, anguloReal: 180,
    massa: '79,91 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'O berílio tem só 2 elétrons de valência (2s²) e, isolado, nenhum orbital p ocupado — mas ao se ligar, promove 1 elétron 2s pra um orbital 2p vazio e hibridiza os dois (1s+1p → 2 sp), abrindo mão da configuração de "gás nobre" pra formar 2 ligações covalentes. Exemplo clássico de octeto INCOMPLETO (só 4 elétrons ao redor do Be na molécula isolada).',
    aplicacao: 'Na fase gasosa (molécula isolada) é linear; no estado sólido forma cadeias poliméricas com Be em ambiente tetraédrico — bom exemplo de como a hibridização de uma unidade isolada pode mudar com o estado de agregação.',
    fonte: 'Housecroft & Sharpe, Inorganic Chemistry, Cap. 10 (compostos deficientes em elétrons).',
  },
  {
    id: 'hib_c2h2', formula: 'C₂H₂', formulaId: 'C2H2', nome: 'Etino (Acetileno)',
    atomoCentral: 'C', nSigma: 2, nPares: 0, nDominios: 2,
    hibridizacao: 'sp',
    geometriaEletronica: 'Linear', geometriaMolecular: 'Linear',
    anguloIdeal: 180, anguloReal: 180,
    massa: '26,04 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'Cada carbono é sp (1s+1p), ligado ao H por 1σ e ao outro C por 1σ+2π (ligação tripla C≡C) — os 2 orbitais p puros de cada carbono, perpendiculares entre si, fazem as 2 ligações π da tripla. É o exemplo clássico de hibridização sp em química orgânica, espelhando o mesmo raciocínio do CO₂ em compostos inorgânicos.',
    aplicacao: 'Combustível do maçarico oxiacetilênico (solda/corte de metais, chama > 3000 °C); matéria-prima industrial pra PVC e outros polímeros.',
    fonte: 'Brown, LeMay & Bursten, Chemistry: The Central Science, Cap. 9.',
  },

  /* ═══════════ sp² — trigonal planar, 3 domínios, 120° ═══════════ */
  {
    id: 'hib_so3', formula: 'SO₃', formulaId: 'SO3', nome: 'Trióxido de Enxofre',
    atomoCentral: 'S', nSigma: 3, nPares: 0, nDominios: 3,
    hibridizacao: 'sp2',
    geometriaEletronica: 'Trigonal planar', geometriaMolecular: 'Trigonal planar',
    anguloIdeal: 120, anguloReal: 120,
    massa: '80,06 g/mol', nivel: 'basico',
    explicacaoOrbitais: 'O enxofre mistura 1 orbital 3s + 2 orbitais 3p, formando 3 orbitais híbridos sp² no mesmo plano (120° entre si) — cada um faz uma ligação σ com um oxigênio. O orbital 3p que sobra, perpendicular ao plano, participa da ressonância que distribui a ligação π entre os 3 oxigênios igualmente.',
    aplicacao: 'Intermediário-chave na produção industrial de ácido sulfúrico (processo de contato: SO₂ → SO₃ → H₂SO₄); poluente atmosférico ligado à chuva ácida.',
    fonte: 'IUPAC Red Book 2005; geometria consistente com CATALOGO_SIQI.',
  },
  {
    id: 'hib_bf3', formula: 'BF₃', formulaId: 'BF3', nome: 'Trifluoreto de Boro',
    atomoCentral: 'B', nSigma: 3, nPares: 0, nDominios: 3,
    hibridizacao: 'sp2',
    geometriaEletronica: 'Trigonal planar', geometriaMolecular: 'Trigonal planar',
    anguloIdeal: 120, anguloReal: 120,
    massa: '67,81 g/mol', nivel: 'basico',
    explicacaoOrbitais: 'O boro (2s²2p¹) promove um elétron e mistura 1 orbital 2s + 2 orbitais 2p, formando 3 sp² planos. Assim como o BeCl₂, é um octeto incompleto (só 6 elétrons ao redor do B) — o orbital 2p vazio, perpendicular ao plano da molécula, faz do BF₃ um forte ácido de Lewis (aceita um par de elétrons ali).',
    aplicacao: 'Catalisador ácido de Lewis clássico em síntese orgânica (ex.: alquilação de Friedel-Crafts); usado em soldagem de alumínio.',
    fonte: 'Shriver & Atkins Inorganic Chemistry, Cap. 9 (ácidos e bases de Lewis).',
  },
  {
    id: 'hib_hno3', formula: 'HNO₃', formulaId: 'HNO3', nome: 'Ácido Nítrico',
    atomoCentral: 'N', nSigma: 3, nPares: 0, nDominios: 3,
    hibridizacao: 'sp2',
    geometriaEletronica: 'Trigonal planar', geometriaMolecular: 'Trigonal planar',
    anguloIdeal: 120, anguloReal: 120,
    massa: '63,01 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'O nitrogênio central faz 3 ligações σ (pra 3 oxigênios) usando orbitais sp², sem par isolado próprio (todo o NOX +5 está "gasto" nas ligações, incluindo a π deslocalizada por ressonância entre os 2 oxigênios terminais). Mesma lógica do SO₃, só que com N em vez de S.',
    aplicacao: 'Um dos ácidos industriais mais produzidos no mundo; fabricação de fertilizantes nitrogenados e explosivos (TNT, nitroglicerina).',
    fonte: 'Brown et al., Chemistry: The Central Science, Cap. 9; geometria consistente com CATALOGO_SIQI.',
  },
  {
    id: 'hib_so2', formula: 'SO₂', formulaId: 'SO2', nome: 'Dióxido de Enxofre',
    atomoCentral: 'S', nSigma: 2, nPares: 1, nDominios: 3,
    hibridizacao: 'sp2',
    geometriaEletronica: 'Trigonal planar', geometriaMolecular: 'Angular',
    anguloIdeal: 120, anguloReal: 119,
    massa: '64,07 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'Mesmos 3 domínios do SO₃ (sp²), mas aqui um dos 3 orbitais híbridos carrega um PAR ISOLADO em vez de um ligante — a nuvem eletrônica continua trigonal plana, mas a forma MOLECULAR observada (só os 3 átomos: O-S-O) é angular, porque o par isolado é "invisível" na forma, só nos ângulos. Por isso o ângulo real (119°) fica perto — mas não exatamente igual — ao ideal de 120°: o par isolado ocupa mais espaço que uma ligação e empurra os 2 oxigênios um pouco.',
    aplicacao: 'Poluente atmosférico primário (queima de combustíveis fósseis com enxofre); usado como conservante alimentar e alvejante.',
    fonte: 'IUPAC Red Book 2005; geometria consistente com CATALOGO_SIQI.',
  },

  /* ═══════════ sp³ — tetraédrico, 4 domínios, 109,5° ═══════════ */
  {
    id: 'hib_ch4', formula: 'CH₄', formulaId: 'CH4', nome: 'Metano',
    atomoCentral: 'C', nSigma: 4, nPares: 0, nDominios: 4,
    hibridizacao: 'sp3',
    geometriaEletronica: 'Tetraédrica', geometriaMolecular: 'Tetraédrica',
    anguloIdeal: 109.5, anguloReal: 109.5,
    massa: '16,04 g/mol', nivel: 'basico',
    explicacaoOrbitais: 'O EXEMPLO clássico de hibridização sp³: o carbono mistura 1 orbital 2s + 3 orbitais 2p, formando 4 orbitais híbridos idênticos, apontando pros vértices de um tetraedro regular (109,5° entre quaisquer dois). Sem par isolado no carbono, a geometria molecular bate exatamente com a eletrônica.',
    aplicacao: 'Principal componente do gás natural; combustível fóssil; gás de efeito estufa mais potente que o CO₂ por molécula.',
    fonte: 'Pauling (1931), teoria da hibridização; Brown et al., Cap. 9.',
  },
  {
    id: 'hib_nh3', formula: 'NH₃', formulaId: 'NH3', nome: 'Amônia',
    atomoCentral: 'N', nSigma: 3, nPares: 1, nDominios: 4,
    hibridizacao: 'sp3',
    geometriaEletronica: 'Tetraédrica', geometriaMolecular: 'Pirâmide trigonal',
    anguloIdeal: 109.5, anguloReal: 107,
    massa: '17,03 g/mol', nivel: 'basico',
    explicacaoOrbitais: 'Mesma hibridização sp³ do metano (4 domínios), mas 1 dos 4 orbitais carrega um par isolado em vez de um H — a nuvem eletrônica é tetraédrica, mas a forma observada (só os 4 átomos: N + 3H) é pirâmide trigonal. O par isolado, mais "gorducho" que um par ligante, comprime o ângulo H–N–H de 109,5° pros 107° medidos — exemplo didático clássico do efeito de repulsão do par isolado (regra de Gillespie-Nyholm).',
    aplicacao: 'Matéria-prima do processo Haber-Bosch (fertilizantes nitrogenados); refrigerante industrial; produtos de limpeza doméstica.',
    fonte: 'Gillespie & Nyholm (1957), teoria VSEPR; geometria consistente com CATALOGO_SIQI.',
  },
  {
    id: 'hib_h2s', formula: 'H₂S', formulaId: 'H2S', nome: 'Sulfeto de Hidrogênio',
    atomoCentral: 'S', nSigma: 2, nPares: 2, nDominios: 4,
    hibridizacao: 'sp3',
    geometriaEletronica: 'Tetraédrica', geometriaMolecular: 'Angular',
    anguloIdeal: 109.5, anguloReal: 92,
    massa: '34,08 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'Ainda 4 domínios (sp³), mas agora 2 dos 4 orbitais carregam pares isolados — só sobram 2 ligantes (H), então a forma observada é angular. O ângulo real medido (92°) fica BEM abaixo do ideal 109,5° — mais afastado que o da água (H₂O, ~104,5°) — porque o enxofre é mais eletronegativamente "preguiçoso" que o oxigênio pra hibridizar plenamente (regra de Bent: átomos centrais mais pesados/menos eletronegativos tendem a usar orbitais p "mais puros", quase não-híbridos, nas ligações com átomos menos eletronegativos, deixando os pares isolados em orbitais de mais caráter s).',
    aplicacao: 'Gás de cheiro de ovo podre, subproduto do refino de petróleo e gás natural; tóxico em altas concentrações; usado na síntese de compostos de enxofre.',
    fonte: 'Bent (1961), "An Appraisal of Valence-Bond Structures..."; geometria consistente com CATALOGO_SIQI.',
  },
  {
    id: 'hib_h2so4', formula: 'H₂SO₄', formulaId: 'H2SO4', nome: 'Ácido Sulfúrico',
    atomoCentral: 'S', nSigma: 4, nPares: 0, nDominios: 4,
    hibridizacao: 'sp3',
    geometriaEletronica: 'Tetraédrica', geometriaMolecular: 'Tetraédrica',
    anguloIdeal: 109.5, anguloReal: 109.5,
    massa: '98,08 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'O enxofre central faz 4 ligações σ (2 O simples + 2 O duplos, incluindo 2 O–H) usando orbitais sp³ — nenhum par isolado próprio, então a nuvem e a forma observada coincidem. Note que o enxofre "usa" orbitais d vazios pra acomodar as 2 ligações π extras das duplas S=O, além dos 4 σ — um caso de octeto expandido tratado hoje mais como ressonância/carga formal do que hibridização d literal (visão moderna, ver Housecroft & Sharpe).',
    aplicacao: 'O ácido mais produzido industrialmente no mundo; fabricação de fertilizantes, baterias de chumbo-ácido, refino de petróleo.',
    fonte: 'Housecroft & Sharpe, Inorganic Chemistry, Cap. 15 (visão moderna do octeto expandido); geometria consistente com CATALOGO_SIQI.',
  },
  {
    id: 'hib_h3po4', formula: 'H₃PO₄', formulaId: 'H3PO4', nome: 'Ácido Fosfórico',
    atomoCentral: 'P', nSigma: 4, nPares: 0, nDominios: 4,
    hibridizacao: 'sp3',
    geometriaEletronica: 'Tetraédrica', geometriaMolecular: 'Tetraédrica',
    anguloIdeal: 109.5, anguloReal: 109.5,
    massa: '98,00 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'Mesma lógica do H₂SO₄: fósforo central com 4 ligações σ (3 O–H + 1 O duplo) em orbitais sp³, sem par isolado. Comparar os dois lado a lado ajuda a fixar que a fórmula muda, mas a CONTAGEM DE DOMÍNIOS (e portanto a hibridização) é a mesma sempre que o padrão de ligação for "1 átomo central + 4 vizinhos, 0 pares isolados".',
    aplicacao: 'Aditivo alimentar (acidulante em refrigerantes tipo cola); fabricação de fertilizantes fosfatados; tratamento antiferrugem.',
    fonte: 'IUPAC Red Book 2005; geometria consistente com CATALOGO_SIQI.',
  },

  /* ═══════════ sp³d — bipirâmide trigonal, 5 domínios ═══════════ */
  {
    id: 'hib_pcl5', formula: 'PCl₅', formulaId: 'PCl5', nome: 'Pentacloreto de Fósforo',
    atomoCentral: 'P', nSigma: 5, nPares: 0, nDominios: 5,
    hibridizacao: 'sp3d',
    geometriaEletronica: 'Bipirâmide trigonal', geometriaMolecular: 'Bipirâmide trigonal',
    anguloIdeal: 120, anguloReal: 120,
    massa: '208,24 g/mol', nivel: 'avancado',
    explicacaoOrbitais: 'O fósforo mistura 1 orbital 3s + 3 orbitais 3p + 1 orbital 3d, formando 5 híbridos sp³d — mas ATENÇÃO: nem todos os 5 são geometricamente iguais. 3 ficam num plano equatorial (120° entre si) e 2 ficam perpendiculares a esse plano (posições axiais, 90° do plano) — por isso a bipirâmide trigonal tem DOIS ângulos ideais diferentes (120° equatorial, 90° axial-equatorial), diferente dos outros tipos de hibridização, que têm só um ângulo característico.',
    aplicacao: 'Agente clorante em síntese orgânica (converte ácidos carboxílicos em cloretos de acila); catalisador industrial.',
    fonte: 'Housecroft & Sharpe, Inorganic Chemistry, Cap. 1 (formas VSEPR com 5 domínios).',
  },

  /* ═══════════ sp³d² — octaédrica, 6 domínios ═══════════ */
  {
    id: 'hib_sf6', formula: 'SF₆', formulaId: 'SF6', nome: 'Hexafluoreto de Enxofre',
    atomoCentral: 'S', nSigma: 6, nPares: 0, nDominios: 6,
    hibridizacao: 'sp3d2',
    geometriaEletronica: 'Octaédrica', geometriaMolecular: 'Octaédrica',
    anguloIdeal: 90, anguloReal: 90,
    massa: '146,06 g/mol', nivel: 'avancado',
    explicacaoOrbitais: 'O enxofre mistura 1 orbital 3s + 3 orbitais 3p + 2 orbitais 3d, formando 6 híbridos sp³d² idênticos, apontando pros 6 vértices de um octaedro regular (90° entre vizinhos, 180° entre opostos). É o caso extremo de octeto expandido — 12 elétrons ao redor do S — só possível porque o flúor é pequeno o bastante pra "caber" 6 ao redor de um átomo central do 3º período em diante.',
    aplicacao: 'Gás isolante em equipamentos elétricos de alta tensão (excelente isolante, quimicamente inerte); também é o gás de efeito estufa mais potente já medido por molécula, hoje regulado internacionalmente.',
    fonte: 'IUPAC Red Book 2005; Housecroft & Sharpe, Cap. 15.',
  },

  /* ═══════════ mais exemplos sp² (orgânico + inorgânico) ═══════════ */
  {
    id: 'hib_c2h4', formula: 'C₂H₄', formulaId: 'C2H4', nome: 'Eteno (Etileno)',
    atomoCentral: 'C', nSigma: 3, nPares: 0, nDominios: 3,
    hibridizacao: 'sp2',
    geometriaEletronica: 'Trigonal planar', geometriaMolecular: 'Trigonal planar',
    anguloIdeal: 120, anguloReal: 121.5,
    massa: '28,05 g/mol', nivel: 'intermediario',
    explicacaoOrbitais: 'Cada carbono é sp² (1s+2p), com 3 ligações σ (2 pra H, 1 pra o outro C) no mesmo plano — o orbital 2p que sobra em cada carbono, perpendicular ao plano da molécula, se sobrepõe ao do outro carbono formando a ligação π da dupla C=C. É esse par de elétrons π, "por fora" do esqueleto σ, que torna o eteno muito mais reativo (adições eletrofílicas) que o etano (só ligações simples, sp³).',
    aplicacao: 'Hormônio vegetal natural (amadurecimento de frutas); matéria-prima mais produzida da indústria petroquímica (polietileno — o plástico mais comum do mundo).',
    fonte: 'Brown, LeMay & Bursten, Chemistry: The Central Science, Cap. 9.',
  },

];
