/* ═══════════════════════════════════════════════════════════════════
   dadossiqi.js — Catálogo de compostos inorgânicos do SIQI
   Fontes: NIST WebBook, CRC Handbook, Toda Matéria, InfoEscola,
           Manual da Química, Infopédia, Scientia, Wikipédia (pt)
   Todos os valores verificados em múltiplas fontes.

   ATUALIZADO — Plano de Ação SIQI Modular (2026): este arquivo agora
   também contém os dados dos Módulos 2 e 3, além do Módulo 1
   (Nomenclatura, já existente):
     · 14 compostos prioritários ganharam os campos `classificacoes`
       e `regra` (usados pelos Modulos 2 e 1 respectivamente) - ver
       comentario MODULOS 1/2 dentro de cada composto.
     · var CLASSIFICACOES  — metadados do Módulo 2 (Classificação),
       definida perto do final deste arquivo.
     · var REACOES_REDOX   — dados do Módulo 3 (Redox), definida no
       final deste arquivo.
   Nenhum dado original foi removido ou alterado.

   Referências dos dados novos: IUPAC Red Book 2005; Brown, LeMay &
   Bursten (2012) "Chemistry: The Central Science", 12ª ed.; Zumdahl
   & Zumdahl (2009) "Chemistry", 8ª ed.; NIST WebBook; CRC Handbook.
   BNCC: Habilidades EF09CI05 e EF09CI07.
═══════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════
   dadossiqi.js — Catálogo de compostos inorgânicos do SIQI
   Fontes: NIST WebBook, CRC Handbook, Toda Matéria, InfoEscola,
           Manual da Química, Infopédia, Scientia, Wikipédia (pt)
   Todos os valores verificados em múltiplas fontes.
   Campos obrigatórios por composto:
     id, formula, nome, funcao, categoria
     massa, Tf, Tb, densidade, solubilidade, ph
     nomenclatura, badges, uso
     equacao, reacao, lewis
     curiosidade, descricao (texto pedagógico)
═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Metadados das funções inorgânicas ──────────────────────── */
var FUNCAO_META = {
  acido: {
    label: 'Ácido',
    desc:  'Doa prótons H⁺ em solução aquosa (Brønsted-Lowry)',
    cor:   '#F87171',
  },
  base: {
    label: 'Base',
    desc:  'Aceita prótons / libera OH⁻ em solução aquosa',
    cor:   '#4ADE80',
  },
  sal: {
    label: 'Sal',
    desc:  'Produto de neutralização: cátion + ânion iônico',
    cor:   '#FACC15',
  },
  oxido: {
    label: 'Óxido',
    desc:  'Composto binário: elemento + oxigênio',
    cor:   '#FB923C',
  },
};

/* ── Categorias para filtro de busca ────────────────────────── */
var CATEGORIAS_SIQI = [
  { id:'todos',  label:'Todos'       },
  { id:'acido',  label:'⚗️ Ácidos'   },
  { id:'base',   label:'🧪 Bases'    },
  { id:'sal',    label:'🧂 Sais'     },
  { id:'oxido',  label:'🔥 Óxidos'   },
];

/* ═══════════════════════════════════════════════════════════════
   CATÁLOGO PRINCIPAL
   Tf / Tb em °C (1 atm), densidade em g/cm³ (25 °C quando disponível)
═══════════════════════════════════════════════════════════════ */
var CATALOGO_SIQI = [

  /* ────────────────────────────────────────────────────────────
     ÁCIDOS
  ──────────────────────────────────────────────────────────── */
  {
    id: 'h2so4',
    formula: 'H₂SO₄',
    formulaId: 'H2SO4',
    nome: 'Ácido Sulfúrico',
    funcao: 'acido',
    categoria: 'Ácidos Fortes',

    /* Propriedades físicas — Fonte: Toda Matéria / Wikipédia pt */
    massa:      '98,08 g/mol',
    Tf:         10.4,          /* °C — puro */
    Tb:         337,           /* °C — puro */
    densidade:  '1,84 g/cm³',
    solubilidade: 'Miscível em água em qualquer proporção (exotérmico)',
    ph:         '< 1 (concentrado); ~1 a 2,5 mol·L⁻¹',

    /* Classificação */
    nomenclatura: 'Ácido sulfúrico (IUPAC: ácido tetraoxossulfúrico(VI))',
    badges: ['forte', 'diprótido', 'oxidante', 'higroscópico'],
    geometria: 'Tetraédrica distorcida (C₂ᵥ)',
    ligacao: 'Covalente polar; 2 ligações S=O e 2 ligações S–OH',

    /* Equações */
    equacao: 'H₂SO₄(aq) → 2 H⁺(aq) + SO₄²⁻(aq)',
    reacao:
      'Neutralização com NaOH:\n' +
      'H₂SO₄(aq) + 2 NaOH(aq) → Na₂SO₄(aq) + 2 H₂O(l)\n\n' +
      'Reação com metal (Zn):\n' +
      'Zn(s) + H₂SO₄(dil.) → ZnSO₄(aq) + H₂(g)',

    /* Diagrama Lewis simplificado */
    lewis: 'acido_oxigenado',

    /* Textos pedagógicos */
    uso: 'Fabricação de fertilizantes fosfatados (~50% da produção mundial), baterias de chumbo-ácido, refino de petróleo, síntese de outros ácidos',
    curiosidade:
      'O H₂SO₄ é o produto químico industrial mais produzido no mundo — sua ' +
      'produção anual supera 200 milhões de toneladas. É tão higroscópico que ' +
      'carboniza sacarose instantaneamente por desidratação: C₁₂H₂₂O₁₁ → 12 C + 11 H₂O. ' +
      'Sempre adicione o ácido à água, nunca o contrário — a diluição libera até 95 kJ/mol.',
    descricao:
      'Líquido viscoso, incolor e inodoro. Ácido forte dibásico que se ioniza ' +
      'completamente na 1ª etapa e ~10% na 2ª. Em altas concentrações age como ' +
      'desidratante e oxidante. P.F. = 10,4 °C; P.E. = 337 °C; d = 1,84 g/cm³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=10,4°C / Tb=337°C -> líquido a 25°C (regra: Tf<25<Tb). Geometria tetraédrica distorcida C2v já descrita no campo geometria.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'liquido',
      tipoLigacao: 'covalente',
      polaridade: 'polar',
      geometria: 'tetraedrica',
    },
    regra: {
      tipo: 'ácido oxigenado',
      descricao: 'Derivado do ânion sulfato (SO₄²⁻). O enxofre está no NOX máximo (+6), por isso recebe o sufixo tradicional -ico.',
      padrao: 'NOX máximo do elemento -> ácido [elemento]ico; nomenclatura sistemática usa prefixo tetraoxo- + NOX em algarismo romano',
      exemplo: 'SO₄²⁻ (sulfato, S⁺⁶) → H₂SO₄ (ácido sulfúrico / ácido tetraoxossulfúrico(VI))',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.2; Brown et al. (2012) Cap. 2.8',
    },
  },

  {
    id: 'hcl',
    formula: 'HCl',
    formulaId: 'HCl',
    nome: 'Ácido Clorídrico',
    funcao: 'acido',
    categoria: 'Ácidos Fortes',

    /* Fonte: Scientia / Wikipédia pt / CRC Handbook */
    massa:      '36,46 g/mol',
    Tf:         -114.2,        /* °C — HCl gás puro */
    Tb:         -85.1,         /* °C — HCl gás puro; solução 38%: Tb ≈ 48 °C */
    densidade:  '1,19 g/cm³ (solução 37–38%)',
    solubilidade: '72 g/100 mL a 20 °C; miscível em todas proporções',
    ph:         '< 1 (concentrado); ~0,1 a 1,0 mol·L⁻¹',

    nomenclatura: 'Ácido clorídrico / ácido muriático (IUPAC: cloreto de hidrogênio)',
    badges: ['forte', 'monoprótico', 'haloidro', 'fumegante'],
    geometria: 'Linear (diatômica)',
    ligacao: 'Covalente polar; μ = 1,08 D',

    equacao: 'HCl(g) → H⁺(aq) + Cl⁻(aq)',
    reacao:
      'Neutralização total:\n' +
      'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)\n\n' +
      'Reação com metal ativo:\n' +
      'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)',

    lewis: 'acido_haloidro',

    uso: 'Decapagem de metais, limpeza industrial, síntese orgânica, ajuste de pH, produção de cloreto de polivinila (PVC)',
    curiosidade:
      'O suco gástrico humano contém HCl a ~0,5% (pH 1,5–3,5). ' +
      'Misturado com HNO₃ na proporção 3:1 (v/v), forma a água-régia — ' +
      'única mistura capaz de dissolver ouro e platina. O HCl concentrado ' +
      'libera névoas brancas de cloreto de amônio ao contato com NH₃ do ar.',
    descricao:
      'Gás incolor de odor pungente; em solução aquosa forma o ácido clorídrico. ' +
      'Ácido forte monoprótico, ionização praticamente completa (~99,9%). ' +
      'Gás puro: P.F. = −114,2 °C; P.E. = −85,1 °C. Solução 37%: d ≈ 1,19 g/cm³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=-114,2°C / Tb=-85,1°C -> gasoso a 25°C (regra: Tb<25). Geometria linear diatômica já descrita no campo geometria.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'gas',
      tipoLigacao: 'covalente',
      polaridade: 'polar',
      geometria: 'linear',
    },
    regra: {
      tipo: 'ácido binário (hidrácido)',
      descricao: 'Formado por H + halogênio, sem oxigênio. O nome sistemático do composto molecular puro é cloreto de hidrogênio; em solução aquosa recebe o nome de ácido.',
      padrao: 'H + halogênio/calcogênio (sem O) → ácido [elemento]ídrico',
      exemplo: 'H + Cl → HCl(g) = cloreto de hidrogênio; em água: ácido clorídrico',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.1',
    },
  },

  {
    id: 'hno3',
    formula: 'HNO₃',
    formulaId: 'HNO3',
    nome: 'Ácido Nítrico',
    funcao: 'acido',
    categoria: 'Ácidos Fortes',

    /* Fonte: NIST WebBook, CRC */
    massa:      '63,01 g/mol',
    Tf:         -41.6,         /* °C */
    Tb:         83,            /* °C — puro (decompõe-se parcialmente) */
    densidade:  '1,51 g/cm³ (puro)',
    solubilidade: 'Miscível em água em qualquer proporção',
    ph:         '< 1 (concentrado)',

    nomenclatura: 'Ácido nítrico (IUPAC: ácido trioxonírico(V))',
    badges: ['forte', 'monoprótico', 'oxidante', 'corrosivo'],
    geometria: 'Planar (C_s)',
    ligacao: 'Covalente; estrutura de ressonância com dupla ligação N=O deslocalizada',

    equacao: 'HNO₃(aq) → H⁺(aq) + NO₃⁻(aq)',
    reacao:
      'Neutralização:\n' +
      'HNO₃(aq) + KOH(aq) → KNO₃(aq) + H₂O(l)\n\n' +
      'Reação com metal (Cu, diluído):\n' +
      '8 Cu(s) + ..HNO₃(dil.) → 3 Cu(NO₃)₂ + 2 NO(g) + 4 H₂O',

    lewis: 'acido_oxigenado',

    uso: 'Fabricação de explosivos (TNT, nitroglicerina), fertilizantes nitrogenados (nitrato de amônio), síntese de corantes e fármacos',
    curiosidade:
      'Água-régia = 3 vol HCl + 1 vol HNO₃. O HNO₃ oxida o metal e o HCl ' +
      'complexa o cátion gerado, impedindo a reprecipitação. O produto final ' +
      'para ouro é [AuCl₄]⁻. O ácido nítrico fumegante (>86%) tem cor ' +
      'amarela a marrom por acúmulo de NO₂.',
    descricao:
      'Líquido incolor a amarelado, forte ácido oxidante. Ionização completa ' +
      'em solução diluída. Decompõe-se à luz UV liberando NO₂ (gás marrom). ' +
      'P.F. = −41,6 °C; P.E. = 83 °C; d = 1,51 g/cm³ (puro).',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=-41,6°C / Tb=83°C -> líquido a 25°C. Geometria planar (C_s) com N central em arranjo trigonal (ressonância N=O) já descrita.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'liquido',
      tipoLigacao: 'covalente',
      polaridade: 'polar',
      geometria: 'trigonal',
    },
    regra: {
      tipo: 'ácido oxigenado',
      descricao: 'Derivado do ânion nitrato (NO₃⁻), com N no NOX máximo (+5).',
      padrao: 'NOX máximo do elemento -> sufixo -ico',
      exemplo: 'NO₃⁻ (nitrato, N⁺⁵) → HNO₃ (ácido nítrico)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.2; Brown et al. (2012) Cap. 2.8',
    },
  },

  {
    id: 'h2co3',
    formula: 'H₂CO₃',
    formulaId: 'H2CO3',
    nome: 'Ácido Carbônico',
    funcao: 'acido',
    categoria: 'Ácidos Fracos',

    /* Fonte: CRC Handbook — instável, dados da solução */
    massa:      '62,02 g/mol',
    Tf:         null,          /* Instável — decompõe antes de fundir */
    Tb:         null,
    densidade:  '~1,0 g/cm³ (solução aquosa)',
    solubilidade: 'Existe apenas em solução aquosa; CO₂(aq) ⇌ H₂CO₃',
    ph:         '3,7–4,0 (solução saturada de CO₂ a 25 °C)',

    nomenclatura: 'Ácido carbônico (IUPAC: ácido dioxocarbônico)',
    badges: ['fraco', 'diprótido', 'instável', 'volátil'],
    geometria: 'Planar (C₂ᵥ)',
    ligacao: 'Covalente; Ka₁ = 4,3×10⁻⁷; Ka₂ = 4,7×10⁻¹¹',

    equacao: 'H₂CO₃(aq) ⇌ H⁺(aq) + HCO₃⁻(aq)   (Ka₁ = 4,3×10⁻⁷)',
    reacao:
      'Formação a partir de CO₂:\n' +
      'CO₂(g) + H₂O(l) ⇌ H₂CO₃(aq)\n\n' +
      'Neutralização:\n' +
      'H₂CO₃(aq) + 2 NaOH(aq) → Na₂CO₃(aq) + 2 H₂O(l)',

    lewis: 'acido_oxigenado',

    uso: 'Bebidas carbonatadas (CO₂ sob pressão), regulação do pH sanguíneo (tampão bicarbonato), formação de estalactites e estalagmites em cavernas',
    curiosidade:
      'O H₂CO₃ é tão instável que menos de 0,3% do CO₂ dissolvido se converte ' +
      'nele. Por isso refrigerantes perdem gás ao serem abertos — o equilíbrio se ' +
      'desloca para CO₂(g). No sangue humano, a enzima anidrase carbônica acelera ' +
      'essa reação 10 milhões de vezes para garantir o transporte de CO₂.',
    descricao:
      'Ácido fraco dibásico, existe somente em solução aquosa. Forma-se pela ' +
      'dissolução de CO₂ em água. Ka₁ = 4,3×10⁻⁷; Ka₂ = 4,7×10⁻¹¹. ' +
      'Instável; decompõe-se rapidamente em CO₂ e H₂O.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf/Tb=null no catálogo (existe só em solução aquosa) -> tratado como líquido/aquoso, consistente com o rótulo "Aquoso / Instável" já usado pelo cálculo de estado em scriptsiqi.js. Geometria planar C2v (C central trigonal) já descrita.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'liquido',
      tipoLigacao: 'covalente',
      polaridade: 'polar',
      geometria: 'trigonal',
    },
    regra: {
      tipo: 'ácido oxigenado',
      descricao: 'Derivado do ânion carbonato (CO₃²⁻). Existe apenas em equilíbrio com CO₂ dissolvido; não é isolável puro.',
      padrao: 'CO₃²⁻ (carbonato) → H₂CO₃ (ácido carbônico)',
      exemplo: 'CO₂(g) + H₂O(l) ⇌ H₂CO₃(aq)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.2',
    },
  },

  /* ────────────────────────────────────────────────────────────
     BASES
  ──────────────────────────────────────────────────────────── */
  {
    id: 'naoh',
    formula: 'NaOH',
    formulaId: 'NaOH',
    nome: 'Hidróxido de Sódio',
    funcao: 'base',
    categoria: 'Bases Fortes',

    /* Fonte: Toda Matéria, Infopédia, InfoEscola, CRC */
    massa:      '40,00 g/mol',
    Tf:         318,           /* °C */
    Tb:         1388,          /* °C */
    densidade:  '2,13 g/cm³ (sólido)',
    solubilidade: '111 g/100 mL a 20 °C; dissolução muito exotérmica (~44 kJ/mol)',
    ph:         '> 13 (solução 1 mol·L⁻¹)',

    nomenclatura: 'Hidróxido de sódio / soda cáustica (IUPAC: hidróxido de sódio)',
    badges: ['forte', 'monovalente', 'corrosivo', 'higroscópico'],
    geometria: 'Linear (par iônico em solução)',
    ligacao: 'Iônica; Na⁺···OH⁻',

    equacao: 'NaOH(s) → Na⁺(aq) + OH⁻(aq)',
    reacao:
      'Neutralização:\n' +
      'NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)\n\n' +
      'Saponificação (triglicerídeo + NaOH → sabão + glicerol):\n' +
      'RCOOCH₂... + 3 NaOH → 3 RCOONa + C₃H₈O₃',

    lewis: 'base_forte',

    uso: 'Fabricação de sabão (saponificação), papel (processo Kraft), alumina da bauxita, desentupidores domésticos, ajuste de pH industrial',
    curiosidade:
      '"Cáustico" vem do grego kaustos — que queima. O NaOH destrói tecidos ' +
      'orgânicos por hidrólise de proteínas e saponificação de gorduras. ' +
      'É produzido industrialmente por eletrólise da salmoura (processo cloroálcali), ' +
      'gerando simultaneamente Cl₂ e H₂. Absorve CO₂ do ar formando Na₂CO₃ na superfície.',
    descricao:
      'Sólido branco cristalino, higroscópico. Base forte monovalente, ' +
      'dissociação completa em solução. ' +
      'P.F. = 318 °C; P.E. = 1388 °C; d = 2,13 g/cm³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=318°C>25 -> sólido a 25°C. Ligação iônica Na+/OH- já descrita (retículo cristalino, sem geometria molecular VSEPR aplicável).
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'reticular',
    },
    regra: {
      tipo: 'base (hidróxido)',
      descricao: 'Cátion metálico + ânion hidróxido (OH⁻).',
      padrao: '[Metal] + OH⁻ → hidróxido de [metal]',
      exemplo: 'Na⁺ + OH⁻ → NaOH (hidróxido de sódio)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.3',
    },
  },

  {
    id: 'caoh2',
    formula: 'Ca(OH)₂',
    formulaId: 'Ca(OH)2',
    nome: 'Hidróxido de Cálcio',
    funcao: 'base',
    categoria: 'Bases Fortes',

    /* Fonte: InfoEscola, CRC */
    massa:      '74,09 g/mol',
    Tf:         580,           /* °C — decompõe-se em CaO + H₂O */
    Tb:         null,          /* decompõe antes de ebulir */
    densidade:  '2,24 g/cm³ (sólido)',
    solubilidade: '1,73 g/L a 20 °C; 1,2 g/L a 25 °C (solubilidade diminui com temperatura)',
    ph:         '12,4–12,8 (solução saturada)',

    nomenclatura: 'Hidróxido de cálcio / cal hidratada / cal extinta (IUPAC: dihidróxido de cálcio)',
    badges: ['forte', 'divalente', 'pouco solúvel', 'construção'],
    geometria: 'Iônico (retículo hexagonal)',
    ligacao: 'Iônica; Ca²⁺ e 2 OH⁻',

    equacao: 'Ca(OH)₂(s) ⇌ Ca²⁺(aq) + 2 OH⁻(aq)   (Kps = 4,7×10⁻⁶)',
    reacao:
      'Neutralização com H₂SO₄:\n' +
      'Ca(OH)₂(aq) + H₂SO₄(aq) → CaSO₄↓(s) + 2 H₂O(l)\n\n' +
      'Carbonatação (reação com CO₂):\n' +
      'Ca(OH)₂(aq) + CO₂(g) → CaCO₃↓(s) + H₂O(l)',

    lewis: 'base_forte',

    uso: 'Construção civil (argamassa, cimento), tratamento de água e efluentes, correção de solo ácido, fabricação de açúcar (clarificação)',
    curiosidade:
      'A reação CaO + H₂O → Ca(OH)₂ libera ΔH = −63,7 kJ/mol — calor ' +
      'suficiente para elevar a temperatura da mistura a ~150 °C. ' +
      'A "água de cal" (solução saturada de Ca(OH)₂) fica leitosa ao soprar ' +
      'ar: o CO₂ expirado precipita CaCO₃ branco — teste clássico de CO₂ em laboratório.',
    descricao:
      'Sólido branco em pó ou pasta. Base forte divalente, pouco solúvel. ' +
      'Obtida pela hidratação do CaO (cal viva). ' +
      'P.F. = 580 °C (decomp.); d = 2,24 g/cm³; pH(sat.) = 12,4.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=580°C>25 -> sólido a 25°C. Retículo hexagonal iônico já descrito.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'reticular',
    },
    regra: {
      tipo: 'base (hidróxido)',
      descricao: 'Cátion Ca²⁺ (carga +2) exige 2 OH⁻ para neutralidade elétrica — prefixo di- indica as 2 hidroxilas.',
      padrao: '[Metal]²⁺ + 2 OH⁻ → hidróxido de [metal] (di-hidróxido, IUPAC)',
      exemplo: 'Ca²⁺ + 2 OH⁻ → Ca(OH)₂ (hidróxido de cálcio)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.3',
    },
  },

  {
    id: 'nh3',
    formula: 'NH₃',
    formulaId: 'NH3',
    nome: 'Amônia',
    funcao: 'base',
    categoria: 'Bases Fracas',

    /* Fonte: CRC Handbook / NIST */
    massa:      '17,03 g/mol',
    Tf:         -77.7,         /* °C */
    Tb:         -33.4,         /* °C */
    densidade:  '0,73 kg/m³ (gás, 0 °C); 682 kg/m³ (líquido, −33 °C)',
    solubilidade: '89,9 g/100 mL a 0 °C; 31,1 g/100 mL a 25 °C (altamente solúvel)',
    ph:         '11,6 (solução 1 mol·L⁻¹)',

    nomenclatura: 'Amônia / hidróxido de amônio em solução (IUPAC: azano)',
    badges: ['fraca', 'polar', 'ligação H', 'refrigerante'],
    geometria: 'Pirâmide trigonal (C₃ᵥ); ângulo H–N–H = 107°',
    ligacao: 'Covalente polar; μ = 1,47 D; par isolado no N',

    equacao: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)   (Kb = 1,8×10⁻⁵)',
    reacao:
      'Com ácido forte:\n' +
      'NH₃(g) + HCl(g) → NH₄Cl(s)  (névoa branca)\n\n' +
      'Reação com H₂SO₄:\n' +
      '2 NH₃(aq) + H₂SO₄(aq) → (NH₄)₂SO₄(aq)',

    lewis: 'base_fraca',

    uso: 'Processo Haber-Bosch (síntese de fertilizantes nitrogenados), refrigeração industrial, limpadores domésticos, síntese de nylon e plásticos',
    curiosidade:
      'O processo Haber-Bosch (N₂ + 3H₂ ⇌ 2NH₃) é considerado a síntese ' +
      'química mais importante do séc. XX — sem ele não haveria fertilizantes ' +
      'suficientes para alimentar a população atual. Estima-se que 50% do ' +
      'nitrogênio no corpo humano passou pelo processo Haber-Bosch.',
    descricao:
      'Gás incolor de odor pungente característico. Base fraca molecular. ' +
      'Par isolado no N captura H⁺ (base de Brønsted). ' +
      'P.F. = −77,7 °C; P.E. = −33,4 °C; Kb = 1,8×10⁻⁵.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=-77,7°C / Tb=-33,4°C -> gasoso a 25°C. Pirâmide trigonal (C3v), ângulo H-N-H=107° já descrita.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'gas',
      tipoLigacao: 'covalente',
      polaridade: 'polar',
      geometria: 'piramidal',
    },
    regra: {
      tipo: 'base molecular (exceção ao padrão hidróxido)',
      descricao: 'Base de Brønsted-Lowry molecular, não um hidróxido metálico. Nome IUPAC sistemático do hidreto: azano.',
      padrao: 'Nome consagrado "amônia" — não segue o padrão hidróxido-de-metal',
      exemplo: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
      fonte: 'IUPAC Red Book 2005, Seção IR-6.2.2',
    },
  },

  /* ────────────────────────────────────────────────────────────
     SAIS
  ──────────────────────────────────────────────────────────── */
  {
    id: 'nacl',
    formula: 'NaCl',
    formulaId: 'NaCl',
    nome: 'Cloreto de Sódio',
    funcao: 'sal',
    categoria: 'Sais Neutros',

    /* Fonte: CRC Handbook / NIST */
    massa:      '58,44 g/mol',
    Tf:         800.7,         /* °C */
    Tb:         1465,          /* °C */
    densidade:  '2,165 g/cm³ (sólido)',
    solubilidade: '35,9 g/100 mL a 25 °C; pouco afetada pela temperatura',
    ph:         '6,7–7,3 (solução aquosa — praticamente neutro)',

    nomenclatura: 'Cloreto de sódio / sal de cozinha / halita (IUPAC: cloreto de sódio)',
    badges: ['neutro', 'iônico', 'haleto', 'alimentar'],
    geometria: 'Cúbica de face centrada (FCC) — retículo iônico',
    ligacao: 'Iônica; Na⁺ e Cl⁻; energia reticular = 787 kJ/mol',

    equacao: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)',
    reacao:
      'Teste qualitativo de Cl⁻ com AgNO₃:\n' +
      'NaCl(aq) + AgNO₃(aq) → AgCl↓(s) + NaNO₃(aq)\n\n' +
      'Eletrólise da salmoura:\n' +
      '2 NaCl(aq) + 2 H₂O(l) → Cl₂(g) + H₂(g) + 2 NaOH(aq)',

    lewis: 'sal_ionico',

    uso: 'Alimentação e conservação de alimentos, produção de NaOH e Cl₂ (eletrólise), dessalinização, industria química (síntese do PVC)',
    curiosidade:
      'A palavra "salário" vem do latim salarium — os soldados romanos eram ' +
      'pagos parcialmente em sal, tão valioso quanto ouro na Antiguidade. ' +
      'O corpo humano adulto contém ~250 g de NaCl. A concentração no sangue ' +
      '(~0,9% m/v) é mantida rigorosamente pelo sistema renal.',
    descricao:
      'Sólido cristalino branco, inodoro. Retículo iônico cúbico. ' +
      'Sal de neutralização forte: HCl + NaOH → NaCl + H₂O. ' +
      'P.F. = 800,7 °C; P.E. = 1465 °C; d = 2,165 g/cm³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=800,7°C>25 -> sólido a 25°C. Retículo cúbico FCC já descrito.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'reticular',
    },
    regra: {
      tipo: 'sal (haleto neutro)',
      descricao: 'Produto de neutralização entre HCl e NaOH. Sufixo -eto para ânions binários.',
      padrao: '[Cátion] + [ânion]eto → [ânion]eto de [cátion]',
      exemplo: 'Na⁺ + Cl⁻ → NaCl (cloreto de sódio)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.4',
    },
  },

  {
    id: 'cuso4',
    formula: 'CuSO₄',
    formulaId: 'CuSO4',
    nome: 'Sulfato de Cobre (II)',
    funcao: 'sal',
    categoria: 'Sais Coloridos',

    /* Fonte: CRC Handbook / NIST */
    massa:      '159,61 g/mol (anidro); 249,69 g/mol (pentaidratado)',
    Tf:         200,           /* °C — anidro; perde água em etapas: 63°C, 109°C, 200°C */
    Tb:         650,           /* °C — decomposição */
    densidade:  '3,60 g/cm³ (anidro); 2,28 g/cm³ (pentaidratado)',
    solubilidade: '20,3 g/100 mL a 20 °C; 75,4 g/100 mL a 100 °C',
    ph:         '3,5–4,5 (hidrólise: Cu²⁺ + H₂O ⇌ [Cu(OH)]⁺ + H⁺)',

    nomenclatura: 'Sulfato de cobre (II) / vitríolo azul / sulfato cúprico',
    badges: ['colorido', 'hidratável', 'ácido em água', 'fungicida'],
    geometria: 'Cobre: octaédrico distorcido (efeito Jahn-Teller); SO₄²⁻: tetraédrica',
    ligacao: 'Iônica; Cu²⁺ e SO₄²⁻; no hidratado Cu²⁺ coordena 4 H₂O',

    equacao: 'CuSO₄(s) → Cu²⁺(aq) + SO₄²⁻(aq)',
    reacao:
      'Precipitação de Cu(OH)₂:\n' +
      'CuSO₄(aq) + 2 NaOH(aq) → Cu(OH)₂↓(s) + Na₂SO₄(aq)\n\n' +
      'Cementação (deslocamento):\n' +
      'CuSO₄(aq) + Fe(s) → FeSO₄(aq) + Cu(s)',

    lewis: 'sal_colorido',

    uso: 'Fungicida (calda bordalesa = CuSO₄ + Ca(OH)₂), galvanoplastia, indicador de umidade (anidro branco → hidratado azul), tinta azul',
    curiosidade:
      'O CuSO₄ anidro é um pó branco. Ao absorver água forma o pentaidratado ' +
      'CuSO₄·5H₂O de cor azul intensa — usado como indicador visual de umidade ' +
      'em dessecadores. O azul vem do íon Cu²⁺ coordenado por 4 moléculas ' +
      'de água no centro octaédrico distorcido (efeito Jahn-Teller).',
    descricao:
      'Sal de cobre (II) com sulfato. Anidro: branco, higroscópico. ' +
      'Pentaidratado: cristais azuis, forma mais comum. ' +
      'P.F. (anidro) ≈ 200 °C (decomp.); d(pentaidratado) = 2,28 g/cm³.',
  },

  {
    id: 'agno3',
    formula: 'AgNO₃',
    formulaId: 'AgNO3',
    nome: 'Nitrato de Prata',
    funcao: 'sal',
    categoria: 'Sais Especiais',

    /* Fonte: CRC Handbook / NIST */
    massa:      '169,87 g/mol',
    Tf:         209.7,         /* °C */
    Tb:         444,           /* °C — decompõe-se acima de 440 °C */
    densidade:  '4,35 g/cm³ (sólido)',
    solubilidade: '256 g/100 mL a 25 °C; altamente solúvel',
    ph:         '5,4–6,0 (hidrólise leve)',

    nomenclatura: 'Nitrato de prata / lunar cáustico (IUPAC: nitrato de prata)',
    badges: ['fotossensível', 'oxidante', 'analítico', 'antisséptico'],
    geometria: 'Iônico ortorrômbico → monoclínico acima de 160 °C',
    ligacao: 'Iônica; Ag⁺ e NO₃⁻',

    equacao: 'AgNO₃(s) → Ag⁺(aq) + NO₃⁻(aq)',
    reacao:
      'Teste qualitativo de Cl⁻ (precipitado branco):\n' +
      'AgNO₃(aq) + NaCl(aq) → AgCl↓(s) + NaNO₃(aq)\n\n' +
      'Redução a prata metálica:\n' +
      '2 AgNO₃(aq) + Cu(s) → Cu(NO₃)₂(aq) + 2 Ag(s)',

    lewis: 'sal_ionico',

    uso: 'Fotografia analógica (AgBr sensível à luz), espelhos (processo de Tollens), antisséptico (cauterização), análise qualitativa de haletos',
    curiosidade:
      'A mancha negra que aparece na pele ao tocar AgNO₃ é prata metálica ' +
      'formada pela redução do Ag⁺ pela luz solar e compostos orgânicos da pele. ' +
      'É permanente por 1–2 semanas — o epitélio precisa descamar para sumir. ' +
      'No séc. XIX, AgNO₃ era chamado "lunar cáustico" e usado para cauterizar feridas.',
    descricao:
      'Sólido cristalino incolor, altamente solúvel. Fotossensível — escurece ' +
      'à luz (Ag⁺ → Ag⁰). Forte oxidante; cáustico para tecidos. ' +
      'P.F. = 209,7 °C; P.E. = 444 °C (decomp.); d = 4,35 g/cm³.',
  },

  /* ────────────────────────────────────────────────────────────
     ÓXIDOS
  ──────────────────────────────────────────────────────────── */
  {
    id: 'cao',
    formula: 'CaO',
    formulaId: 'CaO',
    nome: 'Óxido de Cálcio',
    funcao: 'oxido',
    categoria: 'Óxidos Básicos',

    /* Fonte: InfoEscola, CRC Handbook */
    massa:      '56,08 g/mol',
    Tf:         2613,          /* °C — um dos maiores pf entre óxidos comuns */
    Tb:         2850,          /* °C */
    densidade:  '3,35 g/cm³ (sólido)',
    solubilidade: 'Reage exotermicamente com água (ΔH = −63,7 kJ/mol); não dissolve-se, hidrata-se',
    ph:         '12,4 (como Ca(OH)₂ formado)',

    nomenclatura: 'Óxido de cálcio / cal viva / cal virgem (IUPAC: óxido de cálcio)',
    badges: ['básico', 'exotérmico', 'construção', 'cáustico'],
    geometria: 'Cúbica (NaCl-like); Ca²⁺ e O²⁻',
    ligacao: 'Iônica; energia reticular = 3401 kJ/mol',

    equacao: 'CaO(s) + H₂O(l) → Ca(OH)₂(s) + calor  (ΔH = −63,7 kJ/mol)',
    reacao:
      'Hidratação (cal viva → cal hidratada):\n' +
      'CaO(s) + H₂O(l) → Ca(OH)₂(s)\n\n' +
      'Reação com ácido:\n' +
      'CaO(s) + H₂SO₄(aq) → CaSO₄(s) + H₂O(l)',

    lewis: 'oxido_basico',

    uso: 'Produção de cimento Portland, cal hidratada para construção, tratamento de água e efluentes, siderurgia (escória de alto-forno)',
    curiosidade:
      'A reação de hidratação do CaO libera calor suficiente para elevar a ' +
      'temperatura da mistura a ~150 °C — a mistura "ferve" sem fogo. ' +
      'O CaO é obtido industrialmente calcinando CaCO₃ a ~900 °C em fornos ' +
      'rotativos. O Brasil é o 3° maior produtor mundial de cal.',
    descricao:
      'Sólido branco em pó ou pedaços. Óxido básico de metal alcalino-terroso. ' +
      'Ponto de fusão elevadíssimo (ligação iônica forte). ' +
      'P.F. = 2613 °C; P.E. = 2850 °C; d = 3,35 g/cm³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=2613°C>25 -> sólido a 25°C. Retículo cúbico tipo NaCl já descrito.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'reticular',
    },
    regra: {
      tipo: 'óxido básico',
      descricao: 'Óxido iônico de metal alcalino-terroso; reage com água formando base forte Ca(OH)₂.',
      padrao: 'Óxido de [metal]',
      exemplo: '2 Ca + O₂ → 2 CaO (óxido de cálcio)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.5',
    },
  },

  {
    id: 'co2',
    formula: 'CO₂',
    formulaId: 'CO2',
    nome: 'Dióxido de Carbono',
    funcao: 'oxido',
    categoria: 'Óxidos Ácidos',

    /* Fonte: NIST WebBook / CRC */
    massa:      '44,01 g/mol',
    Tf:         -56.6,         /* °C — ponto triplo (5,18 atm); sublima a −78,5 °C a 1 atm */
    Tb:         -78.5,         /* °C — temperatura de sublimação a 1 atm */
    densidade:  '1,98 kg/m³ (gás, 0 °C); 1562 kg/m³ (sólido, gelo seco)',
    solubilidade: '1,45 g/L a 25 °C (sob 1 atm); forma H₂CO₃',
    ph:         '—  (gás); 3,7–4,0 (solução saturada)',

    nomenclatura: 'Dióxido de carbono / anidrido carbônico (IUPAC: dióxido de carbono)',
    badges: ['ácido', 'gasoso', 'linear', 'ambiental'],
    geometria: 'Linear (D∞h); ângulo O=C=O = 180°',
    ligacao: 'Covalente; 2 ligações C=O; μ = 0 (apolar por simetria)',

    equacao: 'CO₂(g) + H₂O(l) ⇌ H₂CO₃(aq)',
    reacao:
      'Com base forte:\n' +
      'CO₂(g) + 2 NaOH(aq) → Na₂CO₃(aq) + H₂O(l)\n\n' +
      'Teste de CO₂ (água de cal):\n' +
      'CO₂(g) + Ca(OH)₂(aq) → CaCO₃↓(s) + H₂O(l)',

    lewis: 'oxido_acido',

    uso: 'Extintores de incêndio, carbonatação de bebidas (refrigerantes, cerveja), gelo seco, atmosfera modificada para conservação de alimentos, fotossíntese',
    curiosidade:
      'O CO₂ sólido (gelo seco, −78,5 °C) sublima diretamente para gás a ' +
      '1 atm — não existe CO₂ líquido à pressão atmosférica. ' +
      'O ponto triplo está em −56,6 °C e 5,18 atm. A concentração ' +
      'atmosférica atual é ~424 ppm (2024), 50% acima do pré-industrial.',
    descricao:
      'Gás incolor, inodoro, não inflamável. Óxido ácido de ametal. ' +
      'Molécula linear simétrica, apolar. Sublima a −78,5 °C (1 atm). ' +
      'Ponto triplo: −56,6 °C / 5,18 atm. d(gás, 0 °C) = 1,98 kg/m³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tb=-78,5°C<25 -> gasoso (sublima) a 25°C. Molécula linear D∞h, apolar por simetria (μ=0) — já explicitado no campo ligacao.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'gas',
      tipoLigacao: 'covalente',
      polaridade: 'apolar',
      geometria: 'linear',
    },
    regra: {
      tipo: 'óxido ácido (anidrido)',
      descricao: 'Óxido covalente de ametal. Prefixos gregos indicam o número de átomos de oxigênio.',
      padrao: '[prefixo]óxido de [elemento]',
      exemplo: 'C + O₂ → CO₂ (dióxido de carbono)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.5',
    },
  },

  {
    id: 'fe2o3',
    formula: 'Fe₂O₃',
    formulaId: 'Fe2O3',
    nome: 'Óxido de Ferro (III)',
    funcao: 'oxido',
    categoria: 'Óxidos Básicos',

    /* Fonte: CRC Handbook / NIST */
    massa:      '159,69 g/mol',
    Tf:         1565,          /* °C — decomposição em Fe₃O₄ + O₂ acima de ~1400 °C */
    Tb:         null,          /* decompõe antes */
    densidade:  '5,26 g/cm³ (hematita, α-Fe₂O₃)',
    solubilidade: 'Insolúvel em água; solúvel em ácidos (HCl, H₂SO₄)',
    ph:         '—',

    nomenclatura: 'Óxido de ferro (III) / hematita / ferrugem (IUPAC: trióxido de dihierro)',
    badges: ['básico', 'insolúvel', 'mineral', 'pigmento'],
    geometria: 'Corindon (α); Fe³⁺ em octaédrica, O²⁻ em hexagonal compacta',
    ligacao: 'Iônica; Fe³⁺ e O²⁻',

    equacao: '4 Fe(s) + 3 O₂(g) → 2 Fe₂O₃(s)  (ferrugem)',
    reacao:
      'Dissolução em ácido:\n' +
      'Fe₂O₃(s) + 3 H₂SO₄(aq) → Fe₂(SO₄)₃(aq) + 3 H₂O(l)\n\n' +
      'Termoita (reação aluminotérmica):\n' +
      'Fe₂O₃(s) + 2 Al(s) → Al₂O₃(s) + 2 Fe(l)  (ΔT ≈ 2500 °C)',

    lewis: 'oxido_basico',

    uso: 'Pigmento vermelho (ocre, rouge), minério de ferro (hematita — principal minério siderúrgico), polimento (rouge de joalheiros), reação termoita para solda de trilhos',
    curiosidade:
      'A reação termoita (Fe₂O₃ + Al) atinge ~2500 °C em segundos — calor ' +
      'suficiente para fundir o ferro produzido. Era usada para soldar trilhos ' +
      'ferroviários in loco no campo, antes das soldas elétricas. ' +
      'A hematita é o principal minério de ferro e constitui a maior parte ' +
      'das exportações brasileiras (Carajás, PA).',
    descricao:
      'Sólido vermelho-marrom, insolúvel. Óxido básico de metal de transição. ' +
      'Mineral hematita (α-Fe₂O₃): estrutura corindon. ' +
      'P.F. ≈ 1565 °C (decomp.); d = 5,26 g/cm³.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf=1565°C>25 -> sólido a 25°C. Estrutura corindon (retículo) já descrita.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'reticular',
    },
    regra: {
      tipo: 'óxido básico',
      descricao: 'Óxido iônico de metal de transição no NOX +3, indicado por algarismo romano na nomenclatura de estoque.',
      padrao: 'Óxido de [metal] (NOX em romano)',
      exemplo: '4 Fe + 3 O₂ → 2 Fe₂O₃ (óxido de ferro III)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.5; Brown et al. (2012) Cap. 2.8',
    },
  },

  {
    id: 'so3',
    formula: 'SO₃',
    formulaId: 'SO3',
    nome: 'Trióxido de Enxofre',
    funcao: 'oxido',
    categoria: 'Óxidos Ácidos',

    /* Fonte: CRC Handbook / NIST */
    massa:      '80,06 g/mol',
    Tf:         16.9,          /* °C — forma α (polimérico) */
    Tb:         45.0,          /* °C */
    densidade:  '1,92 g/cm³ (líquido, 20 °C)',
    solubilidade: 'Reage violentamente com água: SO₃ + H₂O → H₂SO₄ (ΔH = −130 kJ/mol)',
    ph:         '—  (reage com H₂O antes de dissolver)',

    nomenclatura: 'Trióxido de enxofre / anidrido sulfúrico (IUPAC: trióxido de enxofre)',
    badges: ['ácido', 'poluente', 'reativo', 'precursor H₂SO₄'],
    geometria: 'Trigonal planar (D₃h); ângulo O=S=O = 120°',
    ligacao: 'Covalente; 3 ligações S=O deslocalizadas (ressonância); μ = 0',

    equacao: 'SO₃(g) + H₂O(l) → H₂SO₄(aq)',
    reacao:
      'Produção industrial de H₂SO₄ (processo de contato):\n' +
      '2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g)   (V₂O₅, 450 °C)\n' +
      'SO₃(g) + H₂SO₄(conc.) → H₂S₂O₇(l)  (oleum)\n\n' +
      'Com base:\n' +
      'SO₃(g) + 2 NaOH(aq) → Na₂SO₄(aq) + H₂O(l)',

    lewis: 'oxido_acido',

    uso: 'Produção de ácido sulfúrico (processo de contato), síntese de oleum, precursor de sulfonatos para detergentes',
    curiosidade:
      'O SO₂ emitido por vulcões e usinas termelétricas é oxidado ' +
      'na atmosfera a SO₃, que reage com vapor d\'água formando gotículas ' +
      'de H₂SO₄ — principal responsável pela chuva ácida (pH < 4,5). ' +
      'Já corroeu monumentos de calcário em toda a Europa industrial.',
    descricao:
      'Líquido incolor a 20–45 °C, altamente reativo com água. ' +
      'Óxido ácido de ametal. Trigonal planar, apolar. ' +
      'P.F. = 16,9 °C; P.E. = 45,0 °C; d(liq.) = 1,92 g/cm³.',
  },


  /* ─────────────────────────────────────────────────────────────
     ÁCIDO FOSFÓRICO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'h3po4',
    formula: 'H₃PO₄',
    formulaId: 'H3PO4',
    nome: 'Ácido Fosfórico',
    funcao: 'acido',
    categoria: 'Ácidos Médios',

    massa:       '97,99 g/mol',
    Tf:          42.4,
    Tb:          158,
    densidade:   '1,88 g/cm³ (puro); 1,69 g/cm³ (85%)',
    solubilidade:'Miscível em água em qualquer proporção',
    ph:          '1,5 a 2,1 (0,1 mol·L⁻¹)',

    nomenclatura: 'Ácido fosfórico / ácido ortofosfórico (IUPAC: ácido trioxofosfórico(V))',
    badges: ['médio', 'triprótico', 'higroscópico', 'não-oxidante'],
    geometria: 'Tetraédrica (C₃ᵥ)',
    ligacao: 'Covalente polar; 3 ligações P–OH e 1 P=O',
    pfStr: '42,4 °C', peStr: '158 °C',

    equacao: 'H₃PO₄ ⇌ H⁺ + H₂PO₄⁻  (Ka₁ = 7,5×10⁻³)',
    reacao:
      'Neutralização total:\n' +
      'H₃PO₄ + 3 NaOH → Na₃PO₄ + 3 H₂O\n\n' +
      'Neutralização parcial:\n' +
      'H₃PO₄ + NaOH → NaH₂PO₄ + H₂O',

    lewis: 'acido_oxigenado',

    uso: 'Refrigerantes cola (~0,05%), fertilizantes (superfosfato triplo), tratamento anti-ferrugem, aditivo alimentar (E338)',
    curiosidade:
      'O ácido fosfórico dá o sabor ácido às colas (Coca-Cola, Pepsi). ' +
      'Um copo de cola contém ~17 mg de H₃PO₄. É triprótico — pode perder ' +
      '3 H⁺ em três etapas — formando H₂PO₄⁻, HPO₄²⁻ e PO₄³⁻. ' +
      'Único ácido comum que não ataca o alumínio: forma camada protetora de AlPO₄.',
    descricao:
      'Sólido cristalino branco (puro) ou líquido viscoso incolor (85%). ' +
      'Ácido fraco a médio — triprótico, ioniza em 3 etapas. ' +
      'Não é oxidante (diferente de HNO₃ e H₂SO₄ conc). ' +
      'Produzido principalmente via "processo úmido": Ca₃(PO₄)₂ + 3H₂SO₄.',
  },

  /* ─────────────────────────────────────────────────────────────
     HIDRÓXIDO DE POTÁSSIO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'koh',
    formula: 'KOH',
    formulaId: 'KOH',
    nome: 'Hidróxido de Potássio',
    funcao: 'base',
    categoria: 'Bases Fortes',

    massa:       '56,11 g/mol',
    Tf:          360,
    Tb:          1327,
    densidade:   '2,04 g/cm³',
    solubilidade:'112 g/100 mL a 20 °C; dissolução muito exotérmica',
    ph:          '> 13 (solução 1 mol·L⁻¹)',

    nomenclatura: 'Hidróxido de potássio / potassa cáustica (IUPAC: hidróxido de potássio)',
    badges: ['forte', 'monovalente', 'higroscópico', 'cáustico'],
    geometria: 'Linear (par iônico em solução)',
    ligacao: 'Iônica; K⁺ e OH⁻',
    pfStr: '360 °C', peStr: '1327 °C',

    equacao: 'KOH(s) → K⁺(aq) + OH⁻(aq)',
    reacao:
      'Neutralização:\n' +
      'KOH + HCl → KCl + H₂O\n\n' +
      'Absorção de CO₂:\n' +
      'CO₂ + 2 KOH → K₂CO₃ + H₂O',

    lewis: 'base_forte',

    uso: 'Produção de sabão mole (potassa), eletrólito em pilhas alcalinas, síntese de K₂CO₃, fabricação de biodiesel',
    curiosidade:
      'KOH é chamado de "potassa cáustica". Pilhas alcalinas AA e AAA usam ' +
      'solução de KOH como eletrólito (não ácido sulfúrico!). ' +
      'É mais solúvel que NaOH (112 vs 111 g/100mL) e forma sabões mais macios — ' +
      'sabão líquido de potassa é a base de todos os sabões líquidos modernos.',
    descricao:
      'Sólido branco muito higroscópico. Base forte monovalente — ionização ' +
      'completa em água. Mais solúvel e mais cáustico que NaOH. ' +
      'Reage com vidro SiO₂ ao longo do tempo — não guardar em frascos de vidro fechados.',
  },

  /* ─────────────────────────────────────────────────────────────
     HIDRÓXIDO DE MAGNÉSIO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'mgoh2',
    formula: 'Mg(OH)₂',
    formulaId: 'Mg(OH)2',
    nome: 'Hidróxido de Magnésio',
    funcao: 'base',
    categoria: 'Bases Médias',

    massa:       '58,32 g/mol',
    Tf:          350,
    Tb:          null,
    densidade:   '2,37 g/cm³',
    solubilidade:'0,0009 g/100 mL a 20 °C (praticamente insolúvel)',
    ph:          '10,5 (suspensão saturada)',

    nomenclatura: 'Hidróxido de magnésio (IUPAC: hidróxido de magnésio)',
    badges: ['médio', 'divalente', 'insolúvel', 'antiácido'],
    geometria: 'Octaédrica (empacotamento em brucita)',
    ligacao: 'Iônica; Mg²⁺ e 2 OH⁻',
    pfStr: '350 °C (decomp.)', peStr: '—',

    equacao: 'Mg(OH)₂(s) ⇌ Mg²⁺(aq) + 2 OH⁻(aq)  [Kps = 5,6×10⁻¹²]',
    reacao:
      'Neutralização (antiácido):\n' +
      'Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O\n\n' +
      'Decomposição por calor:\n' +
      'Mg(OH)₂ →(Δ)→ MgO + H₂O',

    lewis: 'base_fraca',

    uso: 'Leite de magnésia (antiácido e laxante), retardante de chama em polímeros, tratamento de águas residuais, suplemento de Mg',
    curiosidade:
      'O "leite de magnésia" é uma suspensão de Mg(OH)₂ em água (não dissolve!). ' +
      'Neutraliza HCl do suco gástrico sem entrar na corrente sanguínea. ' +
      'Em doses altas, age como laxante osmótico — atrai água para o intestino. ' +
      'Retardante de chama: ao ser aquecido, libera H₂O que resfria o material.',
    descricao:
      'Pó branco praticamente insolúvel (Kps = 5,6×10⁻¹²). ' +
      'Base divalente de força média. Em água forma uma suspensão leitosa ' +
      '(não dissolve). Antiácido mais suave que NaOH. ' +
      'Decompõe-se a ~350 °C, liberando MgO e H₂O.',
  },

  /* ─────────────────────────────────────────────────────────────
     ÓXIDO DE ZINCO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'zno',
    formula: 'ZnO',
    formulaId: 'ZnO',
    nome: 'Óxido de Zinco',
    funcao: 'oxido',
    categoria: 'Óxidos Anfóteros',

    massa:       '81,38 g/mol',
    Tf:          1975,
    Tb:          null,
    densidade:   '5,60 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em ácidos e bases',
    ph:          '7 (anfótero)',

    nomenclatura: 'Óxido de zinco (IUPAC: óxido de zinco)',
    badges: ['anfótero', 'fotocatalítico', 'semicondutor', 'branco'],
    geometria: 'Wurtzita (hexagonal)',
    ligacao: 'Iônico-covalente misto; Zn²⁺ e O²⁻',
    pfStr: '1975 °C', peStr: 'sublima >1800 °C',

    equacao: 'ZnO + H₂SO₄ → ZnSO₄ + H₂O  (ácido)\nZnO + 2 NaOH → Na₂ZnO₂ + H₂O  (base)',
    reacao:
      'Com ácido:\n' +
      'ZnO + 2 HCl → ZnCl₂ + H₂O\n\n' +
      'Com base:\n' +
      'ZnO + 2 NaOH → Na₂ZnO₂ + H₂O',

    lewis: 'oxido_acido',

    uso: 'Protetor solar (bloqueador físico de UV), borracha vulcanizada, pigmento branco (tinta), semicondutor, pomada de zinco (cicatrizante)',
    curiosidade:
      'ZnO é único pois é anfótero — reage com ácido E com base! ' +
      'No protetor solar, partículas nanométricas de ZnO dispersam UV-A e UV-B. ' +
      'Aparece branco por refletir toda a luz visível, mas emite luz UV azul — ' +
      'base de LEDs brancos modernos (ZnO + camada fluorescente).',
    descricao:
      'Pó cristalino branco. Óxido anfótero: comporta-se como base com ácidos ' +
      'e como ácido com bases — propriedade rara. ' +
      'Semicondutor tipo N, gap óptico de 3,37 eV. ' +
      'Não funde — sublima acima de 1800 °C.',
  },

  /* ─────────────────────────────────────────────────────────────
     ÓXIDO DE MAGNÉSIO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'mgo',
    formula: 'MgO',
    formulaId: 'MgO',
    nome: 'Óxido de Magnésio',
    funcao: 'oxido',
    categoria: 'Óxidos Básicos',

    massa:       '40,30 g/mol',
    Tf:          2852,
    Tb:          3600,
    densidade:   '3,58 g/cm³',
    solubilidade:'0,062 g/100 mL a 20 °C',
    ph:          '10,3 (solução saturada)',

    nomenclatura: 'Óxido de magnésio / magnésia (IUPAC: óxido de magnésio)',
    badges: ['refratário', 'básico', 'cerâmica', 'antiácido'],
    geometria: 'Cúbica NaCl (Oh)',
    ligacao: 'Iônica; Mg²⁺ e O²⁻; energia de rede = 3795 kJ/mol',
    pfStr: '2852 °C', peStr: '3600 °C',

    equacao: 'MgO + H₂O → Mg(OH)₂',
    reacao:
      'Com ácido:\n' +
      'MgO + 2 HCl → MgCl₂ + H₂O\n\n' +
      'Com água:\n' +
      'MgO + H₂O → Mg(OH)₂',

    lewis: 'oxido_basico',

    uso: 'Tijolos refratários (fornos de aço), antiácido, suplemento de magnésio, isolante elétrico em cabos de alta temperatura',
    curiosidade:
      'Com P.F. de 2852 °C, MgO é um dos óxidos mais refratários — ' +
      'usado para revestir fornos de aço e alto-forno. ' +
      'A Magnésia (Mαγνησία), região da Grécia onde o mineral era encontrado, ' +
      'deu nome ao magnésio, ao magneto e à manga.',
    descricao:
      'Pó branco de ponto de fusão altíssimo (2852 °C). ' +
      'Óxido básico — reage lentamente com água formando Mg(OH)₂. ' +
      'Muito estável termicamente. Excelente isolante elétrico e térmico. ' +
      'Energia de rede enorme (3795 kJ/mol) torna-o muito duro (6 na escala Mohs).',
  },

  /* ─────────────────────────────────────────────────────────────
     CARBONATO DE SÓDIO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'na2co3',
    formula: 'Na₂CO₃',
    formulaId: 'Na2CO3',
    nome: 'Carbonato de Sódio',
    funcao: 'sal',
    categoria: 'Sais de Ácido Fraco',

    massa:       '105,99 g/mol',
    Tf:          851,
    Tb:          null,
    densidade:   '2,54 g/cm³',
    solubilidade:'21,5 g/100 mL a 20 °C',
    ph:          '11,6 (0,1 mol·L⁻¹) — hidrólise básica',

    nomenclatura: 'Carbonato de sódio / barrilha (IUPAC: carbonato de dissódio)',
    badges: ['hidrolisável', 'barrilha', 'alcalino', 'processo Solvay'],
    geometria: 'Trigonal planar CO₃²⁻',
    ligacao: 'Iônica; 2 Na⁺ e CO₃²⁻',
    pfStr: '851 °C', peStr: 'decompõe',

    equacao: 'Na₂CO₃ + H₂O ⇌ NaHCO₃ + NaOH  (hidrólise básica)',
    reacao:
      'Com ácido forte:\n' +
      'Na₂CO₃ + 2 HCl → 2 NaCl + H₂O + CO₂\n\n' +
      'Hidrólise:\n' +
      'CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻',

    lewis: 'sal_ionico',

    uso: 'Fabricação de vidro (~50% do consumo), detergentes, papel e celulose, tratamento de água, culinária (água com gás artificial)',
    curiosidade:
      'Na₂CO₃ é a "barrilha" — usado há 5000 anos no Egito para mumificação e ' +
      'fabricação de vidro. O processo Solvay (1863) revolucionou a produção: ' +
      'NaCl + NH₃ + CO₂ + H₂O → NaHCO₃ → Na₂CO₃. ' +
      'É o 11° produto químico mais produzido no mundo (~60 milhões ton/ano).',
    descricao:
      'Sólido cristalino branco. Sal de ácido fraco (H₂CO₃) e base forte (NaOH), ' +
      'portanto sofre hidrólise básica — solução aquosa tem pH ~11,6. ' +
      'Anidro (Na₂CO₃), mono- (·H₂O), deca- (·10H₂O = cristal de soda). ' +
      'O hidratado perde água ao ar (eflorescência).',
  },

  /* ─────────────────────────────────────────────────────────────
     CLORETO DE FERRO III
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'fecl3',
    formula: 'FeCl₃',
    formulaId: 'FeCl3',
    nome: 'Cloreto de Ferro III',
    funcao: 'sal',
    categoria: 'Sais de Metal de Transição',

    massa:       '162,20 g/mol',
    Tf:          306,
    Tb:          315,
    densidade:   '2,90 g/cm³',
    solubilidade:'91,2 g/100 mL a 20 °C',
    ph:          '3,0–3,5 (0,1 mol·L⁻¹) — hidrólise ácida',

    nomenclatura: 'Cloreto de ferro(III) / cloreto férrico (IUPAC: tricloreto de ferro)',
    badges: ['oxidante', 'coagulante', 'gravura', 'Lewis ácido'],
    geometria: 'Octaédrica [Fe(H₂O)₆]³⁺ em solução',
    ligacao: 'Iônico-covalente; Fe³⁺ e 3 Cl⁻',
    pfStr: '306 °C', peStr: '315 °C',

    equacao: 'FeCl₃ + 3 H₂O ⇌ Fe(OH)₃↓ + 3 HCl  (hidrólise ácida)',
    reacao:
      'Com NaOH:\n' +
      'FeCl₃ + 3 NaOH → Fe(OH)₃↓ + 3 NaCl\n\n' +
      'Gravura de cobre:\n' +
      '2 FeCl₃ + Cu → 2 FeCl₂ + CuCl₂',

    lewis: 'sal_colorido',

    uso: 'Gravura de PCBs (circuitos impressos), coagulante em tratamento de água, catalisador, pigmento marrom, reagente analítico (teste de fenol)',
    curiosidade:
      'FeCl₃ é o reagente usado para gravar circuitos impressos (PCBs): ' +
      'dissolve cobre seletivamente — 2FeCl₃ + Cu → 2FeCl₂ + CuCl₂. ' +
      'Teste de Mohr: FeCl₃ + KSCN → vermelho sangue intenso ([Fe(SCN)]²⁺) — ' +
      'detecta Fe³⁺ em concentrações nanomolares.',
    descricao:
      'Sólido cristalino marrom-preto ou escamas castanhas. ' +
      'Em solução adquire cor amarelo-alaranjada. ' +
      'Sal de ácido forte e base fraca: hidrólise ácida (pH ~3). ' +
      'Excelente coagulante — destabiliza coloides por troca de cargas.',
  },

  /* ─────────────────────────────────────────────────────────────
     ZINCO METÁLICO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'zn',
    formula: 'Zn',
    formulaId: 'Zn',
    nome: 'Zinco Metálico',
    funcao: 'elem',
    categoria: 'Metais de Transição',

    massa:       '65,38 g/mol',
    Tf:          419.5,
    Tb:          907,
    densidade:   '7,14 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em ácidos e NaOH',
    ph:          '—',

    nomenclatura: 'Zinco (IUPAC: zinco)',
    badges: ['anfótero', 'galvanização', 'redutor', 'essencial'],
    geometria: 'Hexagonal compacta (hcp)',
    ligacao: 'Metálica; banda de condução semi-preenchida',
    pfStr: '419,5 °C', peStr: '907 °C',

    equacao: 'Zn → Zn²⁺ + 2e⁻  (E° = +0,76 V vs SHE)',
    reacao:
      'Com ácido:\n' +
      'Zn + 2 HCl → ZnCl₂ + H₂\n\n' +
      'Com base (anfótero):\n' +
      'Zn + 2 NaOH → Na₂ZnO₂ + H₂',

    lewis: 'generico',

    uso: 'Galvanização de aço (zinco como ânodo de sacrifício), ligas metálicas (latão = Cu+Zn), pilhas zinco-carbono, suplemento (enzimas)',
    curiosidade:
      'Zn é anfótero — reage com HCl E com NaOH, liberando H₂ nas duas reações! ' +
      'A galvanização protege o aço: mesmo se o zinco rachar, ' +
      'ele continua protegendo por ser mais ativo (ânodo de sacrifício). ' +
      '300 mg de Zn são encontrados no corpo humano — cofator de +300 enzimas.',
    descricao:
      'Metal azulado-prateado, moderadamente ativo. ' +
      'Anfótero — dissolve em ácidos (formando Zn²⁺) e em bases (formando ZnO₂²⁻). ' +
      'E° = −0,76 V (mais negativo que Fe: −0,44 V), portanto protege o ferro. ' +
      'Fragiliza abaixo de 0 °C (transição dúctil-frágil).',
  },

  /* ─────────────────────────────────────────────────────────────
     ALUMÍNIO METÁLICO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'al',
    formula: 'Al',
    formulaId: 'Al',
    nome: 'Alumínio Metálico',
    funcao: 'elem',
    categoria: 'Metais do Grupo Principal',

    massa:       '26,98 g/mol',
    Tf:          660.3,
    Tb:          2519,
    densidade:   '2,70 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em ácidos diluídos e em NaOH',
    ph:          '—',

    nomenclatura: 'Alumínio (IUPAC: alumínio)',
    badges: ['anfótero', 'passivação', 'leve', 'redutor'],
    geometria: 'Cúbica de face centrada (fcc)',
    ligacao: 'Metálica; alta densidade eletrônica',
    pfStr: '660,3 °C', peStr: '2519 °C',

    equacao: 'Al → Al³⁺ + 3e⁻  (E° = +1,66 V vs SHE)',
    reacao:
      'Com ácido:\n' +
      '2 Al + 6 HCl → 2 AlCl₃ + 3 H₂\n\n' +
      'Com base (anfótero):\n' +
      '2 Al + 2 NaOH + 2 H₂O → 2 NaAlO₂ + 3 H₂',

    lewis: 'generico',

    uso: 'Embalagens (latas, folhas), aeronáutica, construção civil, condutores elétricos (alta tensão), ligas (duralumin)',
    curiosidade:
      'Al é o metal mais abundante na crosta terrestre (~8%), mas era mais ' +
      'valioso que ouro em 1850 (antes da eletrólise). Napoleão III usava talheres ' +
      'de Al nas grandes ocasiões. É anfótero: dissolve em HCl E em NaOH. ' +
      'O HNO₃ concentrado o passiva — forma Al₂O₃ protetora impenetrável.',
    descricao:
      'Metal leve, prateado, dúctil e maleável. ' +
      'Anfótero — dissolve em ácidos (Al³⁺) e em bases concentradas (AlO₂⁻). ' +
      'Em ar forma espontaneamente Al₂O₃ passivadora (2–3 nm) que o protege. ' +
      'Produzido por eletrólise da alumina (processo Hall-Héroult, 940 °C).',
  },

  /* ─────────────────────────────────────────────────────────────
     COBRE METÁLICO
  ──────────────────────────────────────────────────────────────── */
  {
    id: 'cu',
    formula: 'Cu',
    formulaId: 'Cu',
    nome: 'Cobre Metálico',
    funcao: 'elem',
    categoria: 'Metais de Transição',

    massa:       '63,55 g/mol',
    Tf:          1084.6,
    Tb:          2562,
    densidade:   '8,96 g/cm³',
    solubilidade:'Insolúvel em HCl e H₂SO₄ diluído; dissolve em HNO₃ e H₂SO₄ conc.',
    ph:          '—',

    nomenclatura: 'Cobre (IUPAC: cobre)',
    badges: ['nobre', 'condutor', 'colorido', 'biocida'],
    geometria: 'Cúbica de face centrada (fcc)',
    ligacao: 'Metálica; banda d preenchida — condução por banda s',
    pfStr: '1084,6 °C', peStr: '2562 °C',

    equacao: 'Cu + 2 H₂SO₄(conc.) → CuSO₄ + SO₂ + 2 H₂O',
    reacao:
      'Com HNO₃ diluído:\n' +
      '3 Cu + 8 HNO₃(dil.) → 3 Cu(NO₃)₂ + 2 NO + 4 H₂O\n\n' +
      'Deslocamento por Fe:\n' +
      'Cu²⁺ + Fe → Fe²⁺ + Cu',

    lewis: 'generico',

    uso: 'Fiação elétrica (~65% do consumo), tubulações (resistente à corrosão), moedas, ligas (bronze, latão), fungicida (calda bordalesa)',
    curiosidade:
      'Cu NÃO reage com HCl nem H₂SO₄ diluído — menos reativo que H₂ na fila! ' +
      'Mas dissolve em HNO₃ (oxidante) e H₂SO₄ concentrado quente. ' +
      'É o único metal naturalmente colorido (junto com ouro e césio). ' +
      'A estátua da Liberdade = 80 t de Cu — verde por pátina de Cu₂(OH)₂CO₃.',
    descricao:
      'Metal avermelhado brilhante. Muito bom condutor elétrico (2° depois da Ag) ' +
      'e térmico. Resistente à corrosão em água, mas dissolve em ácidos oxidantes. ' +
      'Forma pátina verde (verdigris = Cu₂(OH)₂CO₃) lentamente ao ar. ' +
      'Biocida natural — superfícies de Cu matam bactérias em horas.',
  },




  /* ══════════════════════════════════════════════════════════════
     ÁCIDOS — novos
  ══════════════════════════════════════════════════════════════ */

  {
    id: 'hf', formula: 'HF', formulaId: 'HF',
    nome: 'Ácido Fluorídrico', funcao: 'acido', categoria: 'Ácidos Haloidros',
    massa: '20,01 g/mol', Tf: -83.6, Tb: 19.5, densidade: '1,15 g/mL (líq.)',
    solubilidade: 'Miscível em água em qualquer proporção',
    ph: '< 1 a 3 (0,1 mol·L⁻¹) — ácido fraco!',
    nomenclatura: 'Ácido fluorídrico (IUPAC: fluoreto de hidrogênio)',
    badges: ['semiforte','haloidro','corrosivo','dissolve vidro'],
    geometria: 'Linear (diatômica); μ = 1,82 D (mais polar do grupo)',
    ligacao: 'Covalente polar com ligação de hidrogênio fortíssima (F–H···F)',
    pfStr: '−83,6 °C', peStr: '19,5 °C',
    equacao: 'HF ⇌ H⁺(aq) + F⁻(aq)  [Ka = 6,8×10⁻⁴ — semiforte]',
    reacao: 'Dissolve vidro:\nSiO₂ + 4 HF → SiF₄(g) + 2 H₂O\n\nNeutralização:\nHF + NaOH → NaF + H₂O',
    lewis: 'acido_haloidro',
    uso: 'Gravura em vidro, produção de fluoretos, catalisador em refino de petróleo, síntese de politetrafluoretileno (Teflon), revelação de aeronaves (etch)',
    curiosidade: 'HF é o único ácido que dissolve vidro (SiO₂ + 4HF → SiF₄ + 2H₂O). Apesar de ser ácido fraco (Ka = 6,8×10⁻⁴), é extremamente perigoso: penetra a pele sem dor e destrói ossos internamente. Tratamento: gluconato de cálcio (Ca²⁺ precipita F⁻ como CaF₂ insolúvel).',
    descricao: 'Gás incolor de odor pungente; ponto de ebulição 19,5 °C (quase líquido à temperatura ambiente). Ácido semiforte — ionização parcial. Forma pontes de hidrogênio excepcionalmente fortes (F é o átomo mais eletronegativo). Dissolve vidro — única substância capaz disso.',
  },

  {
    id: 'hbr', formula: 'HBr', formulaId: 'HBr',
    nome: 'Ácido Bromídrico', funcao: 'acido', categoria: 'Ácidos Haloidros',
    massa: '80,91 g/mol', Tf: -86.8, Tb: -66.8, densidade: '1,49 g/mL (solução 48%)',
    solubilidade: '193 g/100 mL a 20 °C',
    ph: '< 1 (0,1 mol·L⁻¹) — ácido forte',
    nomenclatura: 'Ácido bromídrico (IUPAC: brometo de hidrogênio)',
    badges: ['forte','haloidro','fumegante','redutor'],
    geometria: 'Linear (diatômica)',
    ligacao: 'Covalente polar; μ = 0,82 D (menos polar que HCl)',
    pfStr: '−86,8 °C', peStr: '−66,8 °C',
    equacao: 'HBr(g) → H⁺(aq) + Br⁻(aq)  [ionização ~100%]',
    reacao: 'Com metal:\nFe + 2 HBr → FeBr₂ + H₂\n\nCom AgNO₃:\nHBr + AgNO₃ → AgBr↓(amarelo) + HNO₃',
    lewis: 'acido_haloidro',
    uso: 'Síntese de brometos orgânicos, catalisador em alquilação, fonte de Br⁻ em análise química, produção de brometo de potássio (KBr — sedativo)',
    curiosidade: 'HBr é mais forte que HCl porque o ânion Br⁻ é maior e mais estável. O teste com AgNO₃ distingue HBr do HCl: AgBr precipita amarelo-pálido (vs. branco do AgCl). Mais solúvel em água que HCl a baixas temperaturas.',
    descricao: 'Gás incolor de odor pungente. Ácido forte monoprótico (ionização praticamente total). Em solução aquosa forma o ácido bromídrico. Menos volátil que HCl mas mais volátil que HI. Reduz compostos de I⁺ e Cl⁺ por ser agente redutor moderado.',
  },

  {
    id: 'hi', formula: 'HI', formulaId: 'HI',
    nome: 'Ácido Iodídrico', funcao: 'acido', categoria: 'Ácidos Haloidros',
    massa: '127,91 g/mol', Tf: -50.8, Tb: -35.4, densidade: '1,70 g/mL (solução 57%)',
    solubilidade: '245 g/100 mL a 20 °C (o mais solúvel dos haloidros)',
    ph: '< 1 (0,1 mol·L⁻¹) — ácido mais forte dos haloidros',
    nomenclatura: 'Ácido iodídrico (IUPAC: iodeto de hidrogênio)',
    badges: ['forte','haloidro','redutor forte','amarelece ao sol'],
    geometria: 'Linear (diatômica)',
    ligacao: 'Covalente polar; μ = 0,44 D (menos polar do grupo H-X)',
    pfStr: '−50,8 °C', peStr: '−35,4 °C',
    equacao: 'HI(g) → H⁺(aq) + I⁻(aq)  [Ka ≈ 10⁹ — fortíssimo]',
    reacao: 'Redução de Cu²⁺:\n2 Cu²⁺ + 4 I⁻ → 2 CuI↓ + I₂\n\nNeutralização:\nHI + KOH → KI + H₂O',
    lewis: 'acido_haloidro',
    uso: 'Redutor orgânico, síntese de iodetos, catalisador em reações orgânicas, medicina (KI para proteção da tireoide em acidentes nucleares)',
    curiosidade: 'HI é o ácido mais forte dos haloidros — Ka ≈ 10⁹! O ânion I⁻ é tão estável (grande e polarizável) que ioniza quase completamente. Ao sol, decompõe-se: 2HI → H₂ + I₂ (solução fica roxa por I₂). Sequência de acidez: HI > HBr > HCl >> HF.',
    descricao: 'Gás incolor que fuma ao ar. Ácido mais forte dos haloidros devido ao tamanho do I⁻. Solução aquosa tem cor amarelada (traços de I₂ por decomposição). Redutor poderoso: reduz Fe³⁺, Cu²⁺, I⁰₂→. Forma precipitado amarelo escuro com AgNO₃ (AgI, praticamente insolúvel).',
  },

  {
    id: 'h2s', formula: 'H₂S', formulaId: 'H2S',
    nome: 'Ácido Sulfídrico', funcao: 'acido', categoria: 'Ácidos Haloidros',
    massa: '34,08 g/mol', Tf: -85.6, Tb: -60.3, densidade: '1,36 g/L (gás, 0°C)',
    solubilidade: '3,98 g/L a 20 °C (gás dissolvido)',
    ph: '3,9–4,5 (0,1 mol·L⁻¹) — ácido fraco',
    nomenclatura: 'Ácido sulfídrico / gás sulfídrico (IUPAC: sulfeto de hidrogênio)',
    badges: ['fraco','diprotônico','tóxico','ovo podre'],
    geometria: 'Angular (C₂ᵥ); ângulo H–S–H = 92°',
    ligacao: 'Covalente polar; dipolo pequeno — S menos eletronegativo que O',
    pfStr: '−85,6 °C', peStr: '−60,3 °C',
    equacao: 'H₂S ⇌ H⁺ + HS⁻  (Ka₁ = 9,5×10⁻⁸) — ácido muito fraco',
    reacao: 'Com NaOH:\nH₂S + 2 NaOH → Na₂S + 2 H₂O\n\nCom Pb(NO₃)₂:\nH₂S + Pb²⁺ → PbS↓ (preto) + 2 H⁺',
    lewis: 'acido_haloidro',
    uso: 'Análise qualitativa (precipitação de sulfetos metálicos), produção de enxofre elementar, síntese de compostos de enxofre, ocorre naturalmente em vulcões e gás natural',
    curiosidade: 'H₂S é detectado pelo olfato em concentrações de ~0,0005 ppm — mas paralisa o nervo olfativo acima de 100 ppm, impedindo de sentir o perigo! LC₅₀ = 800 ppm (30 min). PbS preto (teste analítico) — por isso tinta de Pb fica preta em locais com H₂S (museus antigos).',
    descricao: 'Gás incolor com odor característico de ovo podre. Ácido fraco diprotônico — ionização muito pequena. Produzido por bactérias anaeróbias (esgotos, pântanos) e vulcões. Altamente tóxico — bloqueia citocromos na cadeia respiratória. Análise clássica de cátions do 2° grupo (precipita como CuS, PbS, etc.).',
  },

  {
    id: 'hclo', formula: 'HClO', formulaId: 'HClO',
    nome: 'Ácido Hipocloroso', funcao: 'acido', categoria: 'Ácidos Oxigenados',
    massa: '52,46 g/mol', Tf: null, Tb: null, densidade: '—',
    solubilidade: 'Existe apenas em solução aquosa (instável)',
    ph: '4–5 (0,1 mol·L⁻¹) — ácido fraco',
    nomenclatura: 'Ácido hipocloroso (IUPAC: ácido dioxocloroso — Cl⁺¹)',
    badges: ['fraco','oxidante','desinfetante','instável'],
    geometria: 'Angular (Cl–O–H)',
    ligacao: 'Covalente polar; Cl no NOX +1',
    pfStr: '—', peStr: '—',
    equacao: 'HClO ⇌ H⁺ + ClO⁻  [Ka = 3,0×10⁻⁸ — ácido fraco]',
    reacao: 'Formação:\nCl₂ + H₂O ⇌ HCl + HClO\n\nDecomposição:\n2 HClO →(luz)→ 2 HCl + O₂',
    lewis: 'acido_oxigenado',
    uso: 'Principal agente bactericida do cloro em tratamento de água e piscinas, desinfetante hospitalar (água clorada), produção de hipocloritos (NaClO, Ca(ClO)₂)',
    curiosidade: 'HClO é o agente ativo da desinfecção por cloro em piscinas — muito mais potente que ClO⁻ (hipoclorito). Por isso o pH ideal de piscinas é 7,2–7,8: mais baixo → mais HClO (melhor desinfecção). Cloro gás produz HClO ao contato com água: Cl₂ + H₂O → HCl + HClO.',
    descricao: 'Ácido fraco existente apenas em solução — extremamente instável no estado puro. Decompõe-se rapidamente pela luz (2HClO → 2HCl + O₂). Cl está no NOX +1 — estado oxidante. O cloro livre em piscinas é a soma de [HClO] + [ClO⁻]. pH determina a proporção entre as duas formas.',
  },

  /* ══════════════════════════════════════════════════════════════
     BASES — novas
  ══════════════════════════════════════════════════════════════ */

  {
    id: 'baoh2', formula: 'Ba(OH)₂', formulaId: 'Ba(OH)2',
    nome: 'Hidróxido de Bário', funcao: 'base', categoria: 'Bases Fortes',
    massa: '171,34 g/mol', Tf: 78, Tb: null, densidade: '2,18 g/cm³',
    solubilidade: '3,89 g/100 mL a 20 °C (mais solúvel que Ca(OH)₂)',
    ph: '> 13 (solução saturada)',
    nomenclatura: 'Hidróxido de bário (IUPAC: hidróxido de bário)',
    badges: ['forte','divalente','precipita SO₄²⁻','bário tóxico'],
    geometria: 'Octaédrica (estrutura cristalina)',
    ligacao: 'Iônica; Ba²⁺ e 2 OH⁻',
    pfStr: '78 °C (·8H₂O)', peStr: '—',
    equacao: 'Ba(OH)₂(s) → Ba²⁺(aq) + 2 OH⁻(aq)  [dissociação total]',
    reacao: 'Com H₂SO₄:\nBa(OH)₂ + H₂SO₄ → BaSO₄↓ + 2 H₂O\n\nCom NH₄Cl:\nBa(OH)₂·8H₂O + 2 NH₄Cl → BaCl₂ + 10 H₂O + 2 NH₃',
    lewis: 'base_forte',
    uso: 'Indicador de CO₂ (forma BaCO₃ branco), purificação de H₂SO₄ (remove Cl⁻), produção de BaSO₄ (sulfato de bário — contraste em raio-X), análise química',
    curiosidade: 'Ba(OH)₂ + 2NH₄Cl é uma das reações que mais resfria — mistura endotérmica que atinge −20 °C! O Ba²⁺ livre é altamente tóxico (bloqueia canais de K⁺), mas BaSO₄ é completamente inerte — usado para raio-X do trato gastrointestinal.',
    descricao: 'Sólido branco, base forte divalente. Mais solúvel que Ca(OH)₂. Reage com H₂SO₄ produzindo BaSO₄ insolúvel (Kps = 1,1×10⁻¹⁰) — reação usada para detectar SO₄²⁻. A reação com NH₄Cl·8H₂O é excelente exemplo de reação endotérmica — congela a superfície.',
  },

  {
    id: 'aloh3', formula: 'Al(OH)₃', formulaId: 'Al(OH)3',
    nome: 'Hidróxido de Alumínio', funcao: 'base', categoria: 'Hidróxidos Anfóteros',
    massa: '78,00 g/mol', Tf: 300, Tb: null, densidade: '2,42 g/cm³',
    solubilidade: 'Praticamente insolúvel (Kps = 1,9×10⁻³³)',
    ph: '—  (anfótero)',
    nomenclatura: 'Hidróxido de alumínio (IUPAC: hidróxido de alumínio)',
    badges: ['anfótero','antiácido','retardante de chama','insolúvel'],
    geometria: 'Octaédrica (estrutura gibbsita)',
    ligacao: 'Iônico-covalente; Al³⁺ e 3 OH⁻',
    pfStr: '300 °C (decomp.)', peStr: '—',
    equacao: 'Al(OH)₃ + 3 H⁺ → Al³⁺ + 3 H₂O  (comportamento ácido)\nAl(OH)₃ + OH⁻ → [Al(OH)₄]⁻  (comportamento básico)',
    reacao: 'Com ácido:\nAl(OH)₃ + 3 HCl → AlCl₃ + 3 H₂O\n\nCom base:\nAl(OH)₃ + NaOH → NaAlO₂ + 2 H₂O',
    lewis: 'base_fraca',
    uso: 'Antiácido estomacal (Maalox, Mylanta), retardante de chama em plásticos, coagulante em tratamento de água, produção de Al₂O₃ (alumina — abrasivo e cerâmica)',
    curiosidade: 'Al(OH)₃ é anfótero: dissolve tanto em ácido quanto em base — propriedade raríssima! Comprimidos de antiácido contêm Al(OH)₃: neutraliza HCl sem elevar muito o pH (tamponamento suave). Decompõe a 300 °C liberando H₂O — por isso é retardante de chama: resfria e dilui O₂.',
    descricao: 'Sólido branco gelatinoso. Anfótero clássico — comporta-se como base com ácidos e como ácido com bases. Kps = 1,9×10⁻³³ (praticamente insolúvel). Mineral natural: gibbsita (Al(OH)₃) é o componente principal da bauxita — minério do alumínio.',
  },

  {
    id: 'feoh3', formula: 'Fe(OH)₃', formulaId: 'Fe(OH)3',
    nome: 'Hidróxido de Ferro III', funcao: 'base', categoria: 'Hidróxidos Insolúveis',
    massa: '106,87 g/mol', Tf: null, Tb: null, densidade: '3,12 g/cm³',
    solubilidade: 'Praticamente insolúvel (Kps = 2,8×10⁻³⁹)',
    ph: '—  (base insolúvel)',
    nomenclatura: 'Hidróxido de ferro(III) / hidróxido férrico',
    badges: ['insolúvel','marrom-ferrugem','coloide','base fraca'],
    geometria: 'Octaédrica (Fe³⁺ coordenado por 6 OH⁻)',
    ligacao: 'Iônico-covalente; Fe³⁺ e 3 OH⁻',
    pfStr: 'decomp. ~500°C', peStr: '—',
    equacao: 'Fe(OH)₃(s) ⇌ Fe³⁺(aq) + 3 OH⁻(aq)  [Kps = 2,8×10⁻³⁹]',
    reacao: 'Formação:\nFeCl₃ + 3 NaOH → Fe(OH)₃↓ + 3 NaCl\n\nDecomposição:\n2 Fe(OH)₃ →(Δ)→ Fe₂O₃ + 3 H₂O',
    lewis: 'base_fraca',
    uso: 'Coagulante em tratamento de água (forma coloide que arrasta impurezas), pigmento marrom (ocre — Fe(OH)₃ natural = limonita), antídoto para envenenamento por arsênio',
    curiosidade: 'Fe(OH)₃ forma um coloide marrom-alaranjado que é o principal agente de coagulação em ETAs (Estações de Tratamento de Água) — o FeCl₃ adicionado precipita como Fe(OH)₃ coloidal que arrasta partículas em suspensão por adsorção. É a ferrugem hidratada!',
    descricao: 'Precipitado gelatinoso marrom-alaranjado. Kps = 2,8×10⁻³⁹ — extremamente insolúvel. Base fraca. Forma facilmente coloides de Fe(OH)₃ que adsorvem contaminantes. Decompõe-se a ~500°C formando Fe₂O₃ (óxido vermelho). A "ferrugem" é uma mistura de Fe₂O₃ e Fe(OH)₃.',
  },

  /* ══════════════════════════════════════════════════════════════
     SAIS — novos
  ══════════════════════════════════════════════════════════════ */

  {
    id: 'nahco3', formula: 'NaHCO₃', formulaId: 'NaHCO3',
    nome: 'Bicarbonato de Sódio', funcao: 'sal', categoria: 'Sais Ácidos',
    massa: '84,01 g/mol', Tf: null, Tb: null, densidade: '2,20 g/cm³',
    solubilidade: '9,6 g/100 mL a 20 °C',
    ph: '8,3 (solução 0,1 mol·L⁻¹) — levemente básico',
    nomenclatura: 'Hidrogenocarbonato de sódio / bicarbonato de sódio (IUPAC)',
    badges: ['sal ácido','antiácido','fermento','hidrólise básica'],
    geometria: 'HCO₃⁻ planar (ânion bicarbonato)',
    ligacao: 'Iônico; Na⁺ e HCO₃⁻',
    pfStr: '50 °C (decomp.)', peStr: '—',
    equacao: 'NaHCO₃ → Na⁺ + HCO₃⁻ \nHCO₃⁻ + H⁺ → H₂CO₃ → H₂O + CO₂',
    reacao: 'Com ácido:\nNaHCO₃ + HCl → NaCl + H₂O + CO₂\n\nDecomposição:\n2 NaHCO₃ →(Δ)→ Na₂CO₃ + H₂O + CO₂',
    lewis: 'sal_ionico',
    uso: 'Fermento em pó (libera CO₂ pelo calor ou ácido), antiácido estomacal, extintor de incêndio classe B, limpeza suave, controle de pH em piscinas',
    curiosidade: 'NaHCO₃ reage com ácidos liberando CO₂ — base dos bolos! "Bicarbonato + vinagre = vulcão de escola". Como antiácido, neutraliza HCl gástrico mas pode causar eructação (arroto de CO₂). Extintor de pó BC usa NaHCO₃ que decompõe liberando CO₂ e Na₂CO₃.',
    descricao: 'Pó branco cristalino, sabor levemente salino-alcalino. Sal ácido (tem 1 H ionizável no HCO₃⁻). Solução levemente básica (pH 8,3) por hidrólise do HCO₃⁻. Decompõe-se a partir de 50 °C. Um dos produtos químicos mais versáteis do cotidiano.',
  },

  {
    id: 'kno3', formula: 'KNO₃', formulaId: 'KNO3',
    nome: 'Nitrato de Potássio', funcao: 'sal', categoria: 'Nitratos',
    massa: '101,10 g/mol', Tf: 334, Tb: 400, densidade: '2,11 g/cm³',
    solubilidade: '31,6 g/100 mL a 20 °C; 247 g a 100 °C',
    ph: '~7 (neutro)',
    nomenclatura: 'Nitrato de potássio / salitre (IUPAC: nitrato de potássio)',
    badges: ['oxidante','salitre','fertilizante','pólvora'],
    geometria: 'Trigonal planar NO₃⁻',
    ligacao: 'Iônico; K⁺ e NO₃⁻',
    pfStr: '334 °C', peStr: '400 °C (decomp.)',
    equacao: 'KNO₃ →(Δ 400°C)→ KNO₂ + ½ O₂  (decomposição)',
    reacao: 'Pólvora negra:\n75 KNO₃ + 15 C + 10 S → gases + calor (mistura)\n\nNeutralização:\nKOH + HNO₃ → KNO₃ + H₂O',
    lewis: 'sal_ionico',
    uso: 'Componente da pólvora negra (75% KNO₃, 15% C, 10% S), fertilizante (fonte de K e N), conservante de carnes (cura), fumo de cachimbo, fogos de artifício',
    curiosidade: 'KNO₃ (salitre) foi o ingrediente mais valioso da pólvora por séculos — guerras eram travadas pela posse de fontes de salitre. O Brasil colonial exportava salitre das cavernas de morcegos (fezes = nitratos). No forno de churrasco, NaNO₃ nas carnes conserva e dá cor avermelhada.',
    descricao: 'Cristais brancos inodoros. Oxidante poderoso em altas temperaturas — fornece O₂ para combustões. Muito solúvel, com solubilidade crescente com temperatura. Fertilizante de alto valor: fornece K⁺ e NO₃⁻ (ambos essenciais). Não confundir com NaNO₃ (salitre do Chile).',
  },

  {
    id: 'caco3', formula: 'CaCO₃', formulaId: 'CaCO3',
    nome: 'Carbonato de Cálcio', funcao: 'sal', categoria: 'Carbonatos',
    massa: '100,09 g/mol', Tf: null, Tb: null, densidade: '2,71 g/cm³ (calcita)',
    solubilidade: '0,0013 g/100 mL a 20 °C (praticamente insolúvel)',
    ph: '~9,9 (solução saturada)',
    nomenclatura: 'Carbonato de cálcio / calcário / calcita / mármore',
    badges: ['insolúvel','calcário','mármore','antiácido'],
    geometria: 'Trigonal planar CO₃²⁻',
    ligacao: 'Iônico; Ca²⁺ e CO₃²⁻',
    pfStr: '825 °C (decomp.)', peStr: '—',
    equacao: 'CaCO₃(s) ⇌ Ca²⁺(aq) + CO₃²⁻(aq)  [Kps = 3,4×10⁻⁹]',
    reacao: 'Com ácido:\nCaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂\n\nCalcinação:\nCaCO₃ →(900°C)→ CaO + CO₂',
    lewis: 'sal_ionico',
    uso: 'Construção civil (cimento, cal), antiácido (Tums, Calafate), suplemento de cálcio, fabricação de vidro, correção de acidez do solo, mármore e calcário natural',
    curiosidade: 'CaCO₃ existe em 3 formas cristalinas: calcita (hexagonal), aragonita (ortorrômbica) e vaterita. Cascas de ovos e conchas são CaCO₃. O processo de formação de cavernas: CaCO₃ + H₂O + CO₂ → Ca(HCO₃)₂ (solúvel) — dissolve o calcário. Evaporação reconverte para CaCO₃ (estalactites).',
    descricao: 'Sólido branco praticamente insolúvel. O mineral mais abundante da crosta terrestre (~4%). Decompõe-se a 900 °C (calcinação) produzindo CaO (cal viva) — base da indústria cimenteira. Reage com ácidos (HCl, H₂SO₄, chuva ácida) liberando CO₂. Polimorfo: calcita, aragonita.',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf:null no catálogo original (decompõe a 825°C em vez de fundir), porém quimicamente é um sólido (mineral calcário/mármore) — usa-se aqui o dado real. Geometria trigonal do ânion CO₃²⁻ já descrita.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'trigonal',
    },
    regra: {
      tipo: 'sal (oxossal)',
      descricao: 'Sal do ácido carbônico: cátion Ca²⁺ + ânion carbonato (CO₃²⁻), sufixo -ato preservado do ácido de origem.',
      padrao: '[Cátion] + [ânion]ato → [ânion]ato de [cátion]',
      exemplo: 'Ca²⁺ + CO₃²⁻ → CaCO₃ (carbonato de cálcio)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.4',
    },
  },

  {
    id: 'baso4', formula: 'BaSO₄', formulaId: 'BaSO4',
    nome: 'Sulfato de Bário', funcao: 'sal', categoria: 'Sulfatos Insolúveis',
    massa: '233,39 g/mol', Tf: 1580, Tb: null, densidade: '4,49 g/cm³',
    solubilidade: '0,000245 g/100 mL a 25 °C — ultra insolúvel',
    ph: '~7 (neutro)',
    nomenclatura: 'Sulfato de bário / barita (IUPAC: sulfato de bário)',
    badges: ['ultra insolúvel','contraste RX','pigmento','Kps baixíssimo'],
    geometria: 'SO₄²⁻ tetraédrico',
    ligacao: 'Iônico; Ba²⁺ e SO₄²⁻',
    pfStr: '1580 °C', peStr: '—',
    equacao: 'BaSO₄(s) ⇌ Ba²⁺(aq) + SO₄²⁻(aq)  [Kps = 1,1×10⁻¹⁰]',
    reacao: 'Precipitação:\nBaCl₂ + Na₂SO₄ → BaSO₄↓ + 2 NaCl\n\nTeste:\nBa²⁺ + SO₄²⁻ → BaSO₄↓ (branco — confirma SO₄²⁻)',
    lewis: 'sal_ionico',
    uso: 'Contraste em raio-X gastrointestinal ("papa de bário"), pigmento branco (branco permanente), cargas em tintas/borracha, fluidos de perfuração petrolífera (barita)',
    curiosidade: 'BaSO₄ é inerte biologicamente pois é ultra insolúvel — o Ba²⁺ livre é tóxico mas BaSO₄ atravessa o trato GI sem dissolver! Usado em suspenão para raio-X: Ba⁵⁶ absorve muito raio-X por seu alto número atômico. Precipitado branco com Ba²⁺ + SO₄²⁻ é o teste clássico de sulfatos.',
    descricao: 'Sólido branco praticamente insolúvel em água, ácidos e bases (Kps = 1,1×10⁻¹⁰). Muito denso (4,49 g/cm³). Pigmento "branco permanente" — não amarela. Inerte quimicamente em condições normais. Mineral natural: barita. Principal teste de SO₄²⁻ em análise química qualitativa.',
  },

  {
    id: 'znso4', formula: 'ZnSO₄', formulaId: 'ZnSO4',
    nome: 'Sulfato de Zinco', funcao: 'sal', categoria: 'Sulfatos Solúveis',
    massa: '161,47 g/mol', Tf: null, Tb: null, densidade: '3,54 g/cm³ (anidro)',
    solubilidade: '57,7 g/100 mL a 20 °C',
    ph: '4,4–5,0 (hidrólise ácida)',
    nomenclatura: 'Sulfato de zinco (IUPAC: sulfato de zinco)',
    badges: ['solúvel','inseticida','fungicida','suplemento Zn'],
    geometria: 'Octaédrica [Zn(H₂O)₆]²⁺ em solução',
    ligacao: 'Iônico; Zn²⁺ e SO₄²⁻',
    pfStr: '680 °C (anidro)', peStr: '—',
    equacao: 'ZnSO₄ → Zn²⁺(aq) + SO₄²⁻(aq)',
    reacao: 'Formação:\nZn + H₂SO₄ → ZnSO₄ + H₂\n\nPrecipitação:\nZnSO₄ + 2 NaOH → Zn(OH)₂↓ + Na₂SO₄',
    lewis: 'sal_colorido',
    uso: 'Galvanização (banho eletrolítico de Zn), fungicida e inseticida agrícola (calda bordalesa de Zn), suplemento mineral para plantas, tratamento de água, indústria têxtil (mordente)',
    curiosidade: 'ZnSO₄·7H₂O é o "vitriolo branco" — irmão do "vitriolo azul" (CuSO₄·5H₂O). O zinco é essencial para >300 enzimas humanas. Deficiência de Zn causa anosmia (perda de olfato) — tema atual pós-COVID. A calda vitriolada (ZnSO₄ + CuSO₄) é fungicida clássico.',
    descricao: 'Sólido branco cristalino (anidro) ou cristais incolores (·7H₂O — vitriolo branco). Solução levemente ácida (hidrólise de Zn²⁺). Zn²⁺ é cofator enzimático essencial. Formado naturalmente por oxidação de sulfetos de zinco (ZnS + O₂ + H₂O). Galvanização eletrolítica usa ZnSO₄ como eletrólito.',
  },

  {
    id: 'feso4', formula: 'FeSO₄', formulaId: 'FeSO4',
    nome: 'Sulfato de Ferro II', funcao: 'sal', categoria: 'Sulfatos de Metais de Transição',
    massa: '151,91 g/mol', Tf: null, Tb: null, densidade: '3,65 g/cm³ (anidro)',
    solubilidade: '26,3 g/100 mL a 20 °C',
    ph: '3,7 (hidrólise ácida)',
    nomenclatura: 'Sulfato de ferro(II) / sulfato ferroso / vitriolo verde (IUPAC)',
    badges: ['vitriolo verde','anemia','redutor','oxidável'],
    geometria: 'Octaédrica [Fe(H₂O)₆]²⁺ em solução',
    ligacao: 'Iônico; Fe²⁺ e SO₄²⁻',
    pfStr: '300 °C (decomp.)', peStr: '—',
    equacao: 'FeSO₄ → Fe²⁺(aq) + SO₄²⁻(aq)\n4 FeSO₄ + O₂ + 2 H₂SO₄ → 2 Fe₂(SO₄)₃ + 2 H₂O  (oxidação ao ar)',
    reacao: 'Formação:\nFe + H₂SO₄(dil.) → FeSO₄ + H₂\n\nOxidação:\n2 FeSO₄ + H₂SO₄ + H₂O₂ → Fe₂(SO₄)₃ + 2 H₂O',
    lewis: 'sal_colorido',
    uso: 'Suplemento de ferro (tratamento de anemia ferropriva), redutor em síntese química, tinta de ferro galotanato (manuscritos medievais), tratamento de água residual, produção de pigmentos',
    curiosidade: 'FeSO₄·7H₂O ("vitriolo verde") foi usado por séculos para fazer tinta ferrogálica — a tinta com que manuscritos medievais e a Constituição dos EUA foram escritos. Oxida ao ar para Fe₂(SO₄)₃ (amarelo) — por isso soluções de FeSO₄ envelhecem. Tratamento de anemia: 200 mg/dia de FeSO₄.',
    descricao: 'Cristais verde-azulados (·7H₂O) ou pó branco-acinzentado (anidro). Solução levemente ácida. Fe²⁺ é oxidado facilmente a Fe³⁺ pelo O₂ do ar. Redutor útil em síntese. Mineral natural: melanterita (FeSO₄·7H₂O). Essencial para a hemoglobina (centro Fe do grupo heme).',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf:null (decompõe ~300°C), porém é sólido cristalino ("Cristais verde-azulados") — dado real usado. Geometria tetraédrica do ânion SO₄²⁻ (padrão dos sulfatos no catálogo).
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'tetraedrica',
    },
    regra: {
      tipo: 'sal (oxossal de metal de transição)',
      descricao: 'Cátion Fe²⁺ (NOX +2, algarismo romano) + ânion sulfato.',
      padrao: 'Sulfato de [metal](NOX romano)',
      exemplo: 'Fe²⁺ + SO₄²⁻ → FeSO₄ (sulfato de ferro II)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.4',
    },
  },

  {
    id: 'kmno4', formula: 'KMnO₄', formulaId: 'KMnO4',
    nome: 'Permanganato de Potássio', funcao: 'sal', categoria: 'Oxossais Oxidantes',
    massa: '158,03 g/mol', Tf: null, Tb: null, densidade: '2,70 g/cm³',
    solubilidade: '6,4 g/100 mL a 20 °C',
    ph: '~7–8',
    nomenclatura: 'Permanganato de potássio (IUPAC: tetraoxomanganato(VII) de potássio)',
    badges: ['oxidante forte','roxo','Mn⁺⁷','antiséptico'],
    geometria: 'Tetraédrica MnO₄⁻',
    ligacao: 'Iônico; K⁺ e MnO₄⁻',
    pfStr: 'decompõe ~240°C', peStr: '—',
    equacao: '2 KMnO₄ →(Δ)→ K₂MnO₄ + MnO₂ + O₂  (decomposição)',
    reacao: 'Em meio ácido:\nMnO₄⁻ + 5 e⁻ + 8 H⁺ → Mn²⁺ + 4 H₂O  (incolor)\n\nEm meio básico:\nMnO₄⁻ + 3 e⁻ → MnO₂↓  (marrom)',
    lewis: 'sal_colorido',
    uso: 'Volumetria (permanganatometria), oxidante em síntese orgânica, tratamento de água (elimina Fe²⁺, Mn²⁺, H₂S), antisséptico (Permanganato 1:10.000), branqueamento de fibras',
    curiosidade: 'KMnO₄ é o oxidante roxo mais famoso da química. Em solução ácida fica incolor (Mn⁷⁺→Mn²⁺) — base da permanganatometria. Em básico fica marrom (MnO₂). 1 mol de KMnO₄ aceita 5 elétrons em ácido (potência oxidante enorme). Usado para tratar pé-de-atleta e infecções fúngicas.',
    descricao: 'Cristais roxo-escuros, quase negros. Solução violeta intensa. Mn está no NOX +7 — estado mais oxidado do Mn. Decompõe-se ao calor liberando O₂. Mancha a pele de marrom-escuro (MnO₂). Indicador próprio em volumetria (descoloração = ponto de viragem).',
    /* ═══ MÓDULOS 1(regra)/2(classificacoes) — Plano de Ação SIQI Modular (2026)
       Tf:null (decompõe ~240°C), porém é sólido cristalino ("Cristais roxo-escuros") — dado real usado. Geometria tetraédrica do ânion MnO₄⁻ já descrita.
       Fontes: IUPAC Red Book 2005; Brown, LeMay & Bursten (2012)
       "Chemistry: The Central Science" 12ª ed.; NIST WebBook. ═══ */
    classificacoes: {
      estadoFisico: 'solido',
      tipoLigacao: 'ionico',
      polaridade: 'polar',
      geometria: 'tetraedrica',
    },
    regra: {
      tipo: 'sal (oxossal, ânion complexo)',
      descricao: 'Cátion K⁺ + ânion permanganato (MnO₄⁻), Mn no NOX máximo +7. Nome sistemático: tetraoxomanganato(VII).',
      padrao: 'Nomenclatura sistemática: tetraoxo[metal]ato(NOX) de [cátion]',
      exemplo: 'K⁺ + MnO₄⁻ → KMnO₄ (permanganato de potássio)',
      fonte: 'IUPAC Red Book 2005, Seção IR-8.4',
    },
  },

  {
    id: 'alcl3', formula: 'AlCl₃', formulaId: 'AlCl3',
    nome: 'Cloreto de Alumínio', funcao: 'sal', categoria: 'Haletos de Metais',
    massa: '133,34 g/mol', Tf: 192.6, Tb: 180, densidade: '2,48 g/cm³',
    solubilidade: '43,9 g/100 mL a 0 °C (hidrólise violenta)',
    ph: '3–4 (hidrólise ácida intensa)',
    nomenclatura: 'Cloreto de alumínio / tricloreto de alumínio (IUPAC)',
    badges: ['Lewis ácido','catalisador','hidrólise violenta','sublima'],
    geometria: 'Trigonal planar (Al—Cl₃) — dímero Al₂Cl₆ no sólido',
    ligacao: 'Covalente polar (≠ sal iônico típico); ligação dativa Al←Cl',
    pfStr: '192,6 °C (2,5 atm)', peStr: '180 °C (sublima)',
    equacao: 'AlCl₃ + 3 H₂O → Al(OH)₃ + 3 HCl  (hidrólise)',
    reacao: 'Catálise Friedel-Crafts:\nC₆H₆ + RCl →(AlCl₃)→ C₆H₅R + HCl\n\nFormação:\n2 Al + 3 Cl₂ → 2 AlCl₃',
    lewis: 'sal_ionico',
    uso: 'Catalisador de Friedel-Crafts (síntese orgânica — mais de 100 reações industriais), coagulante em tratamento de água, desodorantes (antiperspirante — bloqueia poros), produção de Al puro',
    curiosidade: 'AlCl₃ é um ácido de Lewis clássico — aceita par de elétrons do Cl⁻ do cloreto de alquila, formando carbocátion. Base de toda a catálise de Friedel-Crafts (produção de plásticos, corantes, fármacos). Antiperspirante: AlCl₃ se hidrolisa e forma gel de Al(OH)₃ que obstrui poros de suor.',
    descricao: 'Sólido amarelo-esbranquiçado que sublima a 180 °C. Comporta-se como ácido de Lewis (aceita par de elétrons). Reage violentamente com água liberando HCl (hidrólise). Dímero Al₂Cl₆ no estado sólido e gasoso. Principal catalisador na síntese orgânica industrial (alquilação, acilação Friedel-Crafts).',
  },

  /* ══════════════════════════════════════════════════════════════
     ÓXIDOS — novos
  ══════════════════════════════════════════════════════════════ */

  {
    id: 'n2o5', formula: 'N₂O₅', formulaId: 'N2O5',
    nome: 'Pentóxido de Dinitrogênio', funcao: 'oxido', categoria: 'Óxidos Ácidos',
    massa: '108,01 g/mol', Tf: 41, Tb: null, densidade: '1,64 g/cm³',
    solubilidade: 'Reage explosivamente com água → 2 HNO₃',
    ph: '< 1 (reage com H₂O → HNO₃)',
    nomenclatura: 'Pentóxido de dinitrogênio / anidrido nítrico (IUPAC)',
    badges: ['anidrido nítrico','oxidante','instável','N⁺⁵'],
    geometria: 'O₂N–O–NO₂ (linear simétrico)',
    ligacao: 'Covalente; N no NOX +5',
    pfStr: '41 °C', peStr: 'decompõe ~47°C',
    equacao: 'N₂O₅ + H₂O → 2 HNO₃  (anidrido do ácido nítrico)',
    reacao: 'Com água:\nN₂O₅ + H₂O → 2 HNO₃\n\nCom base:\nN₂O₅ + 2 NaOH → 2 NaNO₃ + H₂O',
    lewis: 'oxido_acido',
    uso: 'Síntese de HNO₃ anidro (nitração de compostos orgânicos), oxidante em propelentes sólidos de foguetes, agente de nitração em síntese orgânica de explosivos',
    curiosidade: 'N₂O₅ é o anidrido do HNO₃ — ou seja, HNO₃ "sem água". Reage tão violentamente com H₂O que pode explodir se molhado. Formado na estratosfera: N₂O₅ + H₂O → 2 HNO₃ (contribui para a chuva ácida). É sólido à temperatura ambiente mas extremamente instável acima de 47°C.',
    descricao: 'Sólido branco, extremamente instável e oxidante. Decompõe-se espontaneamente: 2N₂O₅ → 4NO₂ + O₂. Anidrido do HNO₃ — reage com água para regenerar o ácido. Importante em química atmosférica: formado pela reação de NO₃• radical com NO₂ na estratosfera noturna.',
  },

  {
    id: 'p2o5', formula: 'P₂O₅', formulaId: 'P2O5',
    nome: 'Pentóxido de Fósforo', funcao: 'oxido', categoria: 'Óxidos Ácidos',
    massa: '141,94 g/mol', Tf: 340, Tb: null, densidade: '2,30 g/cm³',
    solubilidade: 'Reage violentamente com água → H₃PO₄',
    ph: '< 1 (reage com H₂O → H₃PO₄)',
    nomenclatura: 'Pentóxido de difósforo / anidrido fosfórico (IUPAC: decaóxido de tetrafósforo — P₄O₁₀)',
    badges: ['anidrido fosfórico','dessecante','P₄O₁₀','higroscópico extremo'],
    geometria: 'P₄O₁₀ real (quatro P em tetraedro com O conectando)',
    ligacao: 'Covalente; P no NOX +5; fórmula molecular P₄O₁₀',
    pfStr: '340 °C', peStr: '—',
    equacao: 'P₂O₅ + 3 H₂O → 2 H₃PO₄  (anidrido do ácido fosfórico)',
    reacao: 'Com água:\nP₄O₁₀ + 6 H₂O → 4 H₃PO₄\n\nCom base:\nP₂O₅ + 6 KOH → 2 K₃PO₄ + 3 H₂O',
    lewis: 'oxido_acido',
    uso: 'Dessecante mais potente conhecido (absorve até 0,1 mg H₂O/L de ar), síntese de H₃PO₄, agente de desidratação em síntese orgânica, produção de ésteres fosfóricos',
    curiosidade: 'P₂O₅ (fórmula mínima; real = P₄O₁₀) é o dessecante mais eficiente já descoberto — absorve 35% do seu peso em água! Usado em dessecadores para manter amostras absolutamente secas. Reage tão violentemente com água que provoca queimaduras por "desidratação dos tecidos".',
    descricao: 'Pó branco higroscópio em grau extremo. Fórmula molecular correta é P₄O₁₀. P em NOX +5 — estado mais oxidado do fósforo. Dessecante mais eficiente disponível. Reage violentamente com água e umidade. Anidrido do H₃PO₄ — reage com água formando o ácido fosfórico.',

  },

  /* ────────────────────────────────────────────────────────────
     EXPANSÃO 3 — Novos compostos (inseridos no catálogo estático)
     Fontes: NIST WebBook, CRC Handbook 2024, IUPAC Red Book 2005
  ──────────────────────────────────────────────────────────── */

  {
    id: 'na2so4', formula: 'Na₂SO₄', formulaId: 'Na2SO4',
    nome: 'Sulfato de Sódio', funcao: 'sal', categoria: 'Sais de Sódio',
    massa: '142,04 g/mol', Tf: 884, Tb: 1429, densidade: '2,66 g/cm³',
    solubilidade: 'Solúvel (19,4 g/100 mL a 25°C)',
    ph: '7–9 (levemente alcalino)',
    nomenclatura: 'Sulfato de sódio (Sal de Glauber: Na₂SO₄·10H₂O)',
    badges: ['sal neutro','higroscópico','laxante'],
    geometria: 'Iônica; SO₄²⁻ tetraédrico', ligacao: 'Iônica (Na⁺ e SO₄²⁻)',
    equacao: 'Na₂SO₄ → 2 Na⁺(aq) + SO₄²⁻(aq)',
    reacao: '2 NaOH(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + 2 H₂O(l)',
    lewis: 'sal_ionico',
    uso: 'Produção de papel kraft, detergentes, vidro e laxante (sal de Glauber)',
    curiosidade: 'O decaidrato Na₂SO₄·10H₂O (sal de Glauber) libera 252 kJ/kg ao perder água — usado em sistemas de armazenamento de energia solar.',
    descricao: 'Sal formado pela neutralização total do H₂SO₄ dibásico com 2 mol de NaOH. Produzido via processo Mannheim (NaCl + H₂SO₄). Principal uso: produção de celulose (papel kraft).',
  },

  {
    id: 'k2so4', formula: 'K₂SO₄', formulaId: 'K2SO4',
    nome: 'Sulfato de Potássio', funcao: 'sal', categoria: 'Sais de Potássio',
    massa: '174,26 g/mol', Tf: 1069, Tb: 1689, densidade: '2,66 g/cm³',
    solubilidade: 'Moderadamente solúvel (11,1 g/100 mL a 20°C)',
    ph: '7–8',
    nomenclatura: 'Sulfato de potássio',
    badges: ['fertilizante','sem cloro','sal neutro'],
    geometria: 'Iônica; SO₄²⁻ tetraédrico', ligacao: 'Iônica (K⁺ e SO₄²⁻)',
    equacao: 'K₂SO₄ → 2 K⁺(aq) + SO₄²⁻(aq)',
    reacao: '2 KOH(aq) + H₂SO₄(aq) → K₂SO₄(aq) + 2 H₂O(l)',
    lewis: 'sal_ionico',
    uso: 'Fertilizante agrícola (K⁺ sem Cl⁻ para tabaco e frutas), vidro especial e alume',
    curiosidade: 'Preferido ao KCl em solos onde Cl⁻ é prejudicial. Demanda global supera 7 milhões de toneladas/ano.',
    descricao: 'Sal de alta importância agrícola. Formado pela neutralização de KOH com H₂SO₄. Preferido ao KCl em solos arenosos onde o excesso de Cl⁻ prejudica culturas sensíveis.',
  },

  {
    id: 'mgso4', formula: 'MgSO₄', formulaId: 'MgSO4',
    nome: 'Sulfato de Magnésio', funcao: 'sal', categoria: 'Sais de Magnésio',
    massa: '120,37 g/mol', Tf: 1124, Tb: null, densidade: '2,66 g/cm³',
    solubilidade: 'Muito solúvel (26,9 g/100 mL a 0°C; 71 g/100 mL a 100°C)',
    ph: '6–7',
    nomenclatura: 'Sulfato de magnésio (Sal de Epsom: MgSO₄·7H₂O)',
    badges: ['sal de Epsom','medicinal','fertilizante'],
    geometria: 'Iônica; SO₄²⁻ tetraédrico', ligacao: 'Iônica (Mg²⁺ e SO₄²⁻)',
    equacao: 'MgSO₄ → Mg²⁺(aq) + SO₄²⁻(aq)',
    reacao: 'MgO(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂O(l)',
    lewis: 'sal_ionico',
    uso: 'Medicina (anticonvulsivante IV, laxante), agricultura (Mg para plantas), curtume',
    curiosidade: 'O sal de Epsom (MgSO₄·7H₂O) vem de uma fonte mineral em Epsom, Inglaterra. O Mg²⁺ é cofator de mais de 300 enzimas humanas. O MgSO₄ IV é padrão-ouro no tratamento de eclâmpsia.',
    descricao: 'Produto da reação entre MgO e H₂SO₄. O heptaidrato (sal de Epsom) é usado em banhos terapêuticos. Clinicamente, MgSO₄ IV é o tratamento de referência para eclâmpsia e convulsões neonatais.',
  },

  {
    id: 'cacl2', formula: 'CaCl₂', formulaId: 'CaCl2',
    nome: 'Cloreto de Cálcio', funcao: 'sal', categoria: 'Sais de Cálcio',
    massa: '110,98 g/mol', Tf: 772, Tb: 1935, densidade: '2,15 g/cm³',
    solubilidade: 'Muito solúvel (74,5 g/100 mL a 20°C); dissolução exotérmica',
    ph: '6,5–8,5',
    nomenclatura: 'Cloreto de cálcio',
    badges: ['higroscópico','descongelante','exotérmico'],
    geometria: 'Iônica', ligacao: 'Iônica (Ca²⁺ e Cl⁻)',
    equacao: 'CaCl₂ → Ca²⁺(aq) + 2 Cl⁻(aq)',
    reacao: 'Ca(OH)₂(aq) + 2 HCl(aq) → CaCl₂(aq) + 2 H₂O(l)',
    lewis: 'sal_ionico',
    uso: 'Descongelante de estradas, secante industrial, conservante alimentar (E509), reposição de Ca²⁺ IV',
    curiosidade: 'O CaCl₂ libera calor ao dissolver-se em água (ΔH = −81,3 kJ/mol) — por isso é usado em compressas quentes descartáveis. Abaixa o ponto de fusão do gelo até −51°C, superando o NaCl.',
    descricao: 'Sal iônico muito solúvel e exotérmico. Formado pela neutralização do Ca(OH)₂ com HCl. Usado como descongelante pois abaixa o ponto de fusão da água mais eficientemente que o NaCl.',
  },

  {
    id: 'cuoh2', formula: 'Cu(OH)₂', formulaId: 'Cu(OH)2',
    nome: 'Hidróxido de Cobre II', funcao: 'base', categoria: 'Bases Insolúveis',
    massa: '97,56 g/mol', Tf: null, Tb: null, densidade: '3,37 g/cm³',
    solubilidade: 'Insolúvel em água (Kps ≈ 2×10⁻¹⁹); solúvel em ácidos e NH₃',
    ph: '> 7',
    nomenclatura: 'Hidróxido de cobre(II)',
    badges: ['insolúvel','azul','fungicida','Fehling'],
    geometria: 'Octaédrica distorcida', ligacao: 'Iônica com caráter covalente',
    equacao: 'Cu(OH)₂ → Cu²⁺(aq) + 2 OH⁻(aq)  Kps = 2,2×10⁻²⁰',
    reacao: 'CuSO₄(aq) + 2 NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
    lewis: 'generico',
    uso: 'Fungicida agrícola (calda bordalesa), eletrodeposição de Cu, reagente de Fehling (detecção de glicose)',
    curiosidade: 'A Solução de Fehling usa Cu(OH)₂ em meio alcalino: reage com açúcares redutores formando Cu₂O vermelho tijolo — base do teste de glicose em urina. A calda bordalesa salva videiras desde 1885.',
    descricao: 'Precipitado azul formado pela reação entre CuSO₄ e NaOH. Exemplo clássico de dupla troca com precipitação. Decompõe-se a ~80°C formando CuO preto + H₂O.',
  },

  {
    id: 'feoh2', formula: 'Fe(OH)₂', formulaId: 'Fe(OH)2',
    nome: 'Hidróxido de Ferro II', funcao: 'base', categoria: 'Bases Insolúveis',
    massa: '89,86 g/mol', Tf: null, Tb: null, densidade: '3,40 g/cm³',
    solubilidade: 'Insolúvel em água (Kps ≈ 4,9×10⁻¹⁷); solúvel em ácidos',
    ph: '> 7',
    nomenclatura: 'Hidróxido de ferro(II)',
    badges: ['insolúvel','verde','oxidável','ferrugem'],
    geometria: 'Octaédrica (estrutura laminada)', ligacao: 'Iônica',
    equacao: 'Fe(OH)₂ → Fe²⁺(aq) + 2 OH⁻(aq)  Kps = 4,9×10⁻¹⁷',
    reacao: 'FeSO₄(aq) + 2 NaOH(aq) → Fe(OH)₂(s)↓ + Na₂SO₄(aq)',
    lewis: 'generico',
    uso: 'Intermediário na produção de Fe(OH)₃, tratamento de efluentes com Fe²⁺, pigmentos',
    curiosidade: 'O precipitado verde de Fe(OH)₂ oxida rapidamente ao ar: 4 Fe(OH)₂ + O₂ + 2H₂O → 4 Fe(OH)₃ (castanho). Essa transformação verde→ferrugem é observável em segundos ao agitar ao ar.',
    descricao: 'Base insolúvel verde, facilmente oxidável ao Fe(OH)₃ (castanho) na presença de O₂. Formado pela reação de sais de Fe²⁺ com bases fortes. Intermediário no ciclo biogeoquímico do ferro.',
  },

  {
    id: 'h2o2', formula: 'H₂O₂', formulaId: 'H2O2',
    nome: 'Peróxido de Hidrogênio', funcao: 'acido', categoria: 'Peróxidos',
    massa: '34,01 g/mol', Tf: -0.43, Tb: 150.2, densidade: '1,44 g/cm³',
    solubilidade: 'Miscível em água em todas as proporções',
    ph: '4,5–5,0 (solução 30%)',
    nomenclatura: 'Peróxido de hidrogênio (água oxigenada)',
    badges: ['oxidante','redutor','instável','antisséptico'],
    geometria: 'Angular não-plana (diedro 111,5°)', ligacao: 'Covalente polar; ligação O–O peroxídica',
    equacao: 'H₂O₂ ⇌ H⁺ + HO₂⁻   Ka = 2,4×10⁻¹²',
    reacao: '2 H₂O₂(l) →(MnO₂)→ 2 H₂O(l) + O₂(g)   [decomposição catalítica]',
    lewis: 'generico',
    uso: 'Antisséptico (3%), alvejante de papel e tecidos, propelente de foguetes (>90%), tratamento de efluentes',
    curiosidade: 'A enzima catalase (presente no sangue) decompõe H₂O₂ a 10⁷ vezes por segundo — a efervescência ao aplicar água oxigenada em um ferimento é esta reação. Elefante de pasta de dente usa H₂O₂ concentrado + KI.',
    descricao: 'Composto com ligação O–O peroxídica, mais oxidante que O₂. A catálise por MnO₂ ou pela enzima catalase gera O₂ rapidamente. Armazenado em frascos âmbar para retardar decomposição pela luz.',
  },

  {
    id: 'k2co3', formula: 'K₂CO₃', formulaId: 'K2CO3',
    nome: 'Carbonato de Potássio', funcao: 'sal', categoria: 'Sais de Potássio',
    massa: '138,21 g/mol', Tf: 891, Tb: null, densidade: '2,43 g/cm³',
    solubilidade: 'Muito solúvel (112 g/100 mL a 20°C)',
    ph: '11–12 (solução 1 mol/L)',
    nomenclatura: 'Carbonato de potássio (potassa)',
    badges: ['alcalino','higroscópico','vidro de cristal'],
    geometria: 'Iônica; CO₃²⁻ triangular plano', ligacao: 'Iônica (K⁺ e CO₃²⁻)',
    equacao: 'K₂CO₃ + H₂O ⇌ 2 K⁺ + HCO₃⁻ + OH⁻  (hidrólise básica)',
    reacao: '2 KOH(aq) + CO₂(g) → K₂CO₃(aq) + H₂O(l)',
    lewis: 'sal_ionico',
    uso: 'Produção de cristal de Bohemia (vidro óptico), sabão de potassa, fertilizante, indústria alimentícia',
    curiosidade: 'A potassa (K₂CO₃) era obtida lixiviando cinzas de madeira — daí o nome potássio (pot ash = cinza de pote). Historicamente o primeiro álcali industrial ocidental, usado em sabões desde o século XVII.',
    descricao: 'Sal higroscópico e alcalino em solução. Produzido pela eletrólise de KCl (processo Solvay adaptado). É a base do vidro de cristal (Bohemia) e cerâmica de alta qualidade. Reage com CO₂ formando KHCO₃.',
  },

  {
    id: 'pb_no3_2', formula: 'Pb(NO₃)₂', formulaId: 'Pb(NO3)2',
    nome: 'Nitrato de Chumbo II', funcao: 'sal', categoria: 'Sais de Chumbo',
    massa: '331,21 g/mol', Tf: 470, Tb: null, densidade: '4,53 g/cm³',
    solubilidade: 'Solúvel em água (56,5 g/100 mL a 20°C)',
    ph: '3,5–4,5',
    nomenclatura: 'Nitrato de chumbo(II)',
    badges: ['tóxico','oxidante','chuva dourada'],
    geometria: 'Iônica; NO₃⁻ triangular plano', ligacao: 'Iônica (Pb²⁺ e NO₃⁻)',
    equacao: 'Pb(NO₃)₂ → Pb²⁺(aq) + 2 NO₃⁻(aq)',
    reacao: '2 Pb(NO₃)₂(s) →(Δ ~470°C)→ 2 PbO(s) + 4 NO₂(g) + O₂(g)',
    lewis: 'sal_ionico',
    uso: 'Síntese de outros sais de Pb²⁺, demonstração da chuva dourada (PbI₂), análise qualitativa',
    curiosidade: 'A reação Pb(NO₃)₂ + 2 KI → PbI₂↓ + 2 KNO₃ produz cristais amarelo-ouro que precipitam lentamente ao resfriar uma solução quente — experimento chamado "chuva dourada", um dos mais espetaculares da química.',
    descricao: 'Um dos poucos sais de chumbo solúveis em água. Usado em síntese de precipitados de Pb²⁺ (PbSO₄, PbI₂ amarelo, PbCrO₄ amarelo canário). A decomposição térmica libera NO₂ alaranjado tóxico.',
  },

  {
    id: 'nan3', formula: 'NaN₃', formulaId: 'NaN3',
    nome: 'Azida de Sódio', funcao: 'sal', categoria: 'Sais de Sódio',
    massa: '65,01 g/mol', Tf: 275, Tb: null, densidade: '1,85 g/cm³',
    solubilidade: 'Muito solúvel em água (41,7 g/100 mL a 17°C)',
    ph: '9,5–10,5',
    nomenclatura: 'Azida de sódio (trinitreto de sódio)',
    badges: ['airbag','explosivo','tóxico'],
    geometria: 'Iônica; N₃⁻ linear', ligacao: 'Iônica (Na⁺ e N₃⁻)',
    equacao: 'NaN₃ → Na⁺(aq) + N₃⁻(aq)',
    reacao: '2 NaN₃(s) →(faísca elétrica)→ 2 Na(s) + 3 N₂(g)',
    lewis: 'generico',
    uso: 'Airbags automotivos (gerador de N₂ em <30 ms), preservante microbiológico',
    curiosidade: 'Em 30 ms após impacto a 40 km/h, 130 g de NaN₃ geram ~50 L de N₂ para inflar o airbag completamente. O Na metálico formado reage com KNO₃ e SiO₂ (também no cartucho) para ser neutralizado.',
    descricao: 'Sal do ácido hidrazoico (HN₃). A decomposição pela faísca elétrica gera N₂ gasoso em milissegundos — base do airbag moderno. Altamente tóxico: 0,7 mg/m³ é o limite de exposição ocupacional.',
  },

  {
    id: 'mgcl2', formula: 'MgCl₂', formulaId: 'MgCl2',
    nome: 'Cloreto de Magnésio', funcao: 'sal', categoria: 'Sais de Magnésio',
    massa: '95,21 g/mol', Tf: 714, Tb: 1412, densidade: '2,32 g/cm³',
    solubilidade: 'Muito solúvel (54,6 g/100 mL a 20°C)',
    ph: '4,5–6,5',
    nomenclatura: 'Cloreto de magnésio (nigari)',
    badges: ['higroscópico','tofu','eletrólise'],
    geometria: 'Iônica', ligacao: 'Iônica (Mg²⁺ e Cl⁻)',
    equacao: 'MgCl₂ → Mg²⁺(aq) + 2 Cl⁻(aq)',
    reacao: 'Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g)',
    lewis: 'sal_ionico',
    uso: 'Produção de Mg metálico por eletrólise (processo Dow), nigari para coagulação do tofu, dessecante e descongelante',
    curiosidade: 'O nigari japonês (にがり) é MgCl₂ extraído da água do mar após cristalizar o NaCl. Coagula proteínas da soja formando o tofu. O Japão produz mais de 150.000 t/ano de tofu usando MgCl₂.',
    descricao: 'Sal higroscópico extraído da água do mar (bittern) e do mineral bischofita. Base da produção industrial de Mg metálico pelo processo Dow (eletrólise de MgCl₂ fundido). Mg: 3º metal mais usado no mundo.',
  },

];

/* ═══════════════════════════════════════════════════════════════
   EXPERIMENTOS DIDÁTICOS — 4 famílias de reações
═══════════════════════════════════════════════════════════════ */
var EXPERIMENTOS_SIQI = [

  /* ────────────────────────────────────────────────────────────
     EXP 1 — SÍNTESE / ADIÇÃO
     CaO(s) + H₂O(l) → Ca(OH)₂(s)
     Mecanismo: O²⁻ captura 2H⁺ da água → 2OH⁻ → liga com Ca²⁺
  ──────────────────────────────────────────────────────────── */
  {
    id: 1,
    icon: '🔥',
    familia: 'Síntese / Adição',
    titulo: 'CaO + H₂O',
    descricao: 'Cal viva + água',
    reagentes: ['CaO', 'H₂O'],
    condicao: '',
    produtos_visuais: ['Ca(OH)₂'],
    coefR: { 'CaO': 1, 'H₂O': 1 },
    coefP: [1],

    /* 8 candidatos: 1 correto + 7 distratores plausíveis */
    candidatos: [
      'Ca(OH)₂',  /* ✓ CORRETO */
      'CaCO₃',    /* distrator: contém Ca mas exige CO₂ */
      'CaO',      /* distrator: reagente, não produto */
      'CO₂',      /* distrator: gás de outra reação */
      'H₂',       /* distrator: gás de deslocamento */
      'HCl',      /* distrator: ácido não relacionado */
      'Ca(NO₃)₂', /* distrator: sal com NO₃ */
      'Na₂O',     /* distrator: outro óxido básico */
    ],

    gabarito: {
      produtos: [
        'ca(oh)2','hidroxido de calcio','hidróxido de cálcio',
        'cal hidratada','cal apagada','cal extinta',
      ],
      equacaoBalanceada: 'CaO(s) + H₂O(l) → Ca(OH)₂(s)',
    },

    hints: [
      'O²⁻ (do CaO) é uma base fortíssima — captura H⁺ da água. O que se forma quando O²⁻ reage com H₂O?',
      'O²⁻ + H₂O → 2 OH⁻. O Ca²⁺ que ficou livre combina com esses OH⁻. Qual é a fórmula?',
      'Ca²⁺ + 2 OH⁻ → Ca(OH)₂. Verifique os coeficientes: 1 CaO + 1 H₂O → 1 Ca(OH)₂ ✓',
    ],
    explicacao: 'O²⁻ + H₂O → 2OH⁻  ·  Ca²⁺ + 2OH⁻ → Ca(OH)₂(s)  ·  ΔH = −63,7 kJ/mol',
    proxExp: 2,
  },

  /* ────────────────────────────────────────────────────────────
     EXP 2 — DECOMPOSIÇÃO / ANÁLISE
     CaCO₃(s) →(Δ 900°C)→ CaO(s) + CO₂(g)
     Mecanismo: energia térmica fragmenta CO₃²⁻ → CO₂ + O²⁻
  ──────────────────────────────────────────────────────────── */
  {
    id: 2,
    icon: '🌡️',
    familia: 'Decomposição / Análise',
    titulo: 'CaCO₃ →(Δ)→ ?',
    descricao: 'Calcinação do calcário',
    reagentes: ['CaCO₃'],
    condicao: 'Δ 900°C',
    produtos_visuais: ['CaO', 'CO₂'],
    coefR: { 'CaCO₃': 1 },
    coefP: [1, 1],

    candidatos: [
      'CaO',       /* ✓ CORRETO */
      'CO₂',       /* ✓ CORRETO */
      'Ca(OH)₂',   /* distrator: hidratado, não é produto da calcinação */
      'CaCl₂',     /* distrator: sal de Cl, não há Cl na reação */
      'O₂',        /* distrator: gás mas não é o produto */
      'H₂O',       /* distrator: outra reação de CaO */
      'Ca(NO₃)₂',  /* distrator: sal com N */
      'CO',        /* distrator: monóxido em vez de dióxido */
    ],

    gabarito: {
      produtos: [
        'cao','co2','oxido de calcio','óxido de cálcio',
        'dioxido de carbono','dióxido de carbono',
      ],
      equacaoBalanceada: 'CaCO₃(s) →(Δ)→ CaO(s) + CO₂(g)',
    },

    hints: [
      'CO₃²⁻ se fragmenta com calor intenso. O carbono sai como gás levando oxigênio. Que gás de carbono é formado?',
      'CO₂ sai como gás (por isso o sólido perde massa). O Ca²⁺ fica com o O²⁻ restante. O que Ca²⁺ + O²⁻ forma?',
      'CaCO₃ tem 1 Ca, 1 C, 3 O. Verifique: CaO(1O) + CO₂(2O) = 3O ✓. Balanceado com coef. 1:1:1.',
    ],
    explicacao: 'CO₃²⁻ →(Δ)→ CO₂↑ + O²⁻  ·  Ca²⁺ + O²⁻ → CaO  ·  Calcinação industrial do calcário',
    proxExp: 3,
  },

  /* ────────────────────────────────────────────────────────────
     EXP 3 — SIMPLES TROCA / DESLOCAMENTO
     Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)
     Mecanismo: Zn > H na fila → Zn→Zn²⁺+2e⁻ / 2H⁺+2e⁻→H₂
  ──────────────────────────────────────────────────────────── */
  {
    id: 3,
    icon: '⚡',
    familia: 'Simples Troca / Deslocamento',
    titulo: 'Zn + HCl',
    descricao: 'Metal em ácido — cuidado com o gás!',
    reagentes: ['Zn', 'HCl'],
    condicao: '',
    produtos_visuais: ['ZnCl₂', 'H₂'],
    coefR: { 'Zn': 1, 'HCl': 2 },
    coefP: [1, 1],

    candidatos: [
      'ZnCl₂',  /* ✓ CORRETO */
      'H₂',     /* ✓ CORRETO */
      'ZnO',    /* distrator: óxido, sem Cl */
      'ZnSO₄',  /* distrator: sulfato, sem Cl */
      'NaCl',   /* distrator: sal de Na, não de Zn */
      'H₂O',    /* distrator: água — não é produto aqui */
      'FeCl₂',  /* distrator: sal de Fe, não de Zn */
      'HCl',    /* distrator: reagente, não produto */
    ],

    gabarito: {
      produtos: [
        'zncl2','h2','cloreto de zinco','hidrogênio',
        'gas hidrogenio','gás hidrogênio',
      ],
      equacaoBalanceada: 'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)',
    },

    hints: [
      'Zn é mais reativo que H. Zn perde 2 elétrons (Zn → Zn²⁺). Quantos H⁺ recebem esses 2 elétrons?',
      '2 H⁺ + 2e⁻ → H₂↑ (gás que explode). Zn²⁺ fica na solução com Cl⁻. Qual é o sal formado?',
      'Coef HCl = 2 (para 2H⁺ e 2Cl⁻). Confira: Zn=1✓ Cl=2✓ H=2✓.',
    ],
    explicacao: 'Zn→Zn²⁺+2e⁻ (oxidação)  ·  2H⁺+2e⁻→H₂↑ (redução)  ·  Zn desloca H — oxirredução',
    proxExp: 4,
  },

  /* ────────────────────────────────────────────────────────────
     EXP 4 — DUPLA TROCA / NEUTRALIZAÇÃO
     HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
     Mecanismo: H⁺ + OH⁻ → H₂O (força motriz 497 kJ/mol)
               Na⁺ e Cl⁻ são íons espectadores
  ──────────────────────────────────────────────────────────── */
  {
    id: 4,
    icon: '🧫',
    familia: 'Dupla Troca / Neutralização',
    titulo: 'HCl + NaOH',
    descricao: 'Titulação ácido-base com fenolftaleína',
    reagentes: ['HCl', 'NaOH'],
    condicao: '',
    produtos_visuais: ['NaCl', 'H₂O'],
    coefR: { 'HCl': 1, 'NaOH': 1 },
    coefP: [1, 1],

    candidatos: [
      'NaCl',    /* ✓ CORRETO */
      'H₂O',    /* ✓ CORRETO */
      'Na₂SO₄', /* distrator: sulfato, sem Cl */
      'Na₂CO₃', /* distrator: carbonato — outra reação */
      'NaHCO₃', /* distrator: bicarbonato */
      'HNO₃',   /* distrator: ácido — reagente, não produto */
      'Ca(OH)₂',/* distrator: outra base */
      'CO₂',    /* distrator: gás de outra reação */
    ],

    gabarito: {
      produtos: [
        'nacl','h2o','cloreto de sodio','agua','água',
        'cloreto de sódio',
      ],
      equacaoBalanceada: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    },

    hints: [
      'Na solução há 4 íons: H⁺, Cl⁻, Na⁺, OH⁻. H⁺ + OH⁻ → H₂O (força motriz). O que sobra?',
      'Na⁺ e Cl⁻ são íons espectadores — ficam em solução. Juntos formam qual sal?',
      'HCl : NaOH = 1:1. Coef. todos 1. Confira: Na=1✓ Cl=1✓ H=2✓ O=1✓.',
    ],
    explicacao: 'H⁺+OH⁻→H₂O (497kJ/mol)  ·  Na⁺+Cl⁻→NaCl(aq) (espectadores)  ·  pH=7 no ponto de equivalência',
    proxExp: null,
  },
];

var REACOES_LIVRES = {

  /* ════════════════════════════════════════════════════════════════
     H₂SO₄ — 5 reações (neutralização, deslocamento, dupla troca,
                          síntese, decomposição)
  ════════════════════════════════════════════════════════════════ */
  'H2SO4': [
    {
      id:'h2so4_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O',
      reagentes:['H₂SO₄','NaOH'], condicao:'', coefR:{'H₂SO₄':1,'NaOH':2},
      produtos_visuais:['Na₂SO₄','H₂O'], coefP:[1,2],
      candidatos:['Na₂SO₄','H₂O','NaCl','NaNO₃','Na₂CO₃','CaSO₄','NaHSO₄','H₂SO₄'],
      gabarito:{ produtos:['na2so4','sulfato de sodio','h2o','agua'],
        equacaoBalanceada:'H₂SO₄(aq) + 2 NaOH(aq) → Na₂SO₄(aq) + 2 H₂O(l)' },
      hints:['H₂SO₄ é dibásico: doa 2 H⁺. Quantos NaOH neutralizam?','2H⁺+2OH⁻→2H₂O. Na⁺+SO₄²⁻→?'],
      explicacao:'H₂SO₄+2NaOH→Na₂SO₄+2H₂O  ·  Neutralização total — ácido dibásico',
    },
    {
      id:'h2so4_zn', icon:'⚡', familia:'Simples Troca',
      titulo:'Zn + H₂SO₄ → ZnSO₄ + H₂',
      reagentes:['Zn','H₂SO₄'], condicao:'diluído', coefR:{'Zn':1,'H₂SO₄':1},
      produtos_visuais:['ZnSO₄','H₂'], coefP:[1,1],
      candidatos:['ZnSO₄','H₂','ZnO','ZnCl₂','ZnSO₃','H₂O','Na₂SO₄','FeSO₄'],
      gabarito:{ produtos:['znso4','sulfato de zinco','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + H₂SO₄(dil.) → ZnSO₄(aq) + H₂(g)' },
      hints:['Zn>H na reatividade. Zn→Zn²⁺+2e⁻. O que recebe os 2e⁻?','Zn²⁺+SO₄²⁻→ZnSO₄. 2H⁺+2e⁻→H₂↑'],
      explicacao:'Zn+H₂SO₄→ZnSO₄+H₂  ·  Deslocamento em ácido diluído',
    },
    {
      id:'h2so4_caoh2', icon:'💧', familia:'Neutralização / Precipitação',
      titulo:'H₂SO₄ + Ca(OH)₂ → CaSO₄↓ + 2 H₂O',
      reagentes:['H₂SO₄','Ca(OH)₂'], condicao:'', coefR:{'H₂SO₄':1,'Ca(OH)₂':1},
      produtos_visuais:['CaSO₄','H₂O'], coefP:[1,2],
      candidatos:['CaSO₄','H₂O','CaCl₂','Ca(NO₃)₂','CaCO₃','NaOH','Na₂SO₄','HCl'],
      gabarito:{ produtos:['caso4','sulfato de calcio','h2o','agua'],
        equacaoBalanceada:'H₂SO₄(aq) + Ca(OH)₂(aq) → CaSO₄↓(s) + 2 H₂O(l)' },
      hints:['Ca²⁺+SO₄²⁻→CaSO₄↓ (gesso — insolúvel). 2H⁺+2OH⁻→2H₂O'],
      explicacao:'H₂SO₄+Ca(OH)₂→CaSO₄↓+2H₂O  ·  Precipitação de gesso (Kps=4,93×10⁻⁵)',
    },
    {
      id:'h2so4_na2co3', icon:'🔄', familia:'Dupla Troca',
      titulo:'H₂SO₄ + Na₂CO₃ → Na₂SO₄ + H₂O + CO₂',
      reagentes:['H₂SO₄','Na₂CO₃'], condicao:'', coefR:{'H₂SO₄':1,'Na₂CO₃':1},
      produtos_visuais:['Na₂SO₄','H₂O','CO₂'], coefP:[1,1,1],
      candidatos:['Na₂SO₄','H₂O','CO₂','NaCl','NaHCO₃','CaSO₄','Na₂CO₃','NaNO₃'],
      gabarito:{ produtos:['na2so4','h2o','co2','dioxido de carbono'],
        equacaoBalanceada:'H₂SO₄(aq) + Na₂CO₃(aq) → Na₂SO₄(aq) + H₂O(l) + CO₂(g)' },
      hints:['H₂SO₄ desloca H₂CO₃ (ácido fraco). H₂CO₃→H₂O+CO₂↑','Na⁺+SO₄²⁻→Na₂SO₄(aq)'],
      explicacao:'H₂SO₄+Na₂CO₃→Na₂SO₄+H₂O+CO₂↑  ·  Ácido forte desloca ácido fraco',
    },
    {
      id:'h2so4_cu', icon:'⚡', familia:'Oxirredução',
      titulo:'Cu + 2 H₂SO₄ → CuSO₄ + SO₂ + 2 H₂O',
      reagentes:['Cu','H₂SO₄'], condicao:'conc. Δ', coefR:{'Cu':1,'H₂SO₄':2},
      produtos_visuais:['CuSO₄','SO₂','H₂O'], coefP:[1,1,2],
      candidatos:['CuSO₄','SO₂','H₂O','CuCl₂','H₂','Cu₂O','CuO','SO₃'],
      gabarito:{ produtos:['cuso4','sulfato de cobre','so2','dioxido de enxofre','h2o','agua'],
        equacaoBalanceada:'Cu(s) + 2 H₂SO₄(conc.) →(Δ)→ CuSO₄(aq) + SO₂(g) + 2 H₂O(l)' },
      hints:['H₂SO₄ concentrado é oxidante: S⁺⁶→S⁺⁴ (SO₂). Cu→Cu²⁺+2e⁻','2H₂SO₄: um forma CuSO₄, outro é reduzido a SO₂'],
      explicacao:'Cu+2H₂SO₄conc→CuSO₄+SO₂+2H₂O  ·  H₂SO₄ conc. como oxidante — Cu não reage com diluído',
    },
  
{
      id:'h2so4_fe', icon:'⚡', familia:'Simples Troca',
      titulo:'Fe + H₂SO₄ → FeSO₄ + H₂',
      reagentes:['Fe','H₂SO₄'], condicao:'diluído',
      coefR:{'Fe':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['FeSO₄','H₂'],
      candidatos:['FeSO₄','H₂','Fe₂(SO₄)₃','FeO','FeCl₂','H₂O','Fe₂O₃','ZnSO₄'],
      gabarito:{ produtos:['feso4','sulfato de ferro','h2','hidrogenio'],
        equacaoBalanceada:'Fe(s) + H₂SO₄(dil.) → FeSO₄(aq) + H₂(g)' },
      hints:['Fe>H. Fe→Fe²⁺+2e⁻. 2H⁺+2e⁻→H₂↑. Fe²⁺+SO₄²⁻→FeSO₄'],
      explicacao:'Fe+H₂SO₄→FeSO₄+H₂  ·  Dissolução de ferro em ácido diluído — decapagem industrial',
    },
    {
      id:'h2so4_al', icon:'⚡', familia:'Simples Troca',
      titulo:'2 Al + 3 H₂SO₄ → Al₂(SO₄)₃ + 3 H₂',
      reagentes:['Al','H₂SO₄'], condicao:'diluído',
      coefR:{'Al':2,'H₂SO₄':3}, coefP:[1,3],
      produtos_visuais:['Al₂(SO₄)₃','H₂'],
      candidatos:['Al₂(SO₄)₃','H₂','AlCl₃','Al(OH)₃','AlO₂⁻','H₂O','Al₂O₃','ZnSO₄'],
      gabarito:{ produtos:['al2(so4)3','sulfato de aluminio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 3 H₂SO₄(dil.) → Al₂(SO₄)₃(aq) + 3 H₂(g)' },
      hints:['Al→Al³⁺+3e⁻. 2Al×3e⁻=6e⁻=3H₂×2e⁻ ✓. Al³⁺+3/2 SO₄²⁻→Al₂(SO₄)₃'],
      explicacao:'2Al+3H₂SO₄→Al₂(SO₄)₃+3H₂  ·  Importante: Al conc. não reage (passivação)! Só com H₂SO₄ diluído',
    },
    {
      id:'h2so4_mg', icon:'⚡', familia:'Simples Troca',
      titulo:'Mg + H₂SO₄ → MgSO₄ + H₂',
      reagentes:['Mg','H₂SO₄'], condicao:'',
      coefR:{'Mg':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['MgSO₄','H₂'],
      candidatos:['MgSO₄','H₂','MgCl₂','MgO','Mg(OH)₂','H₂O','Na₂SO₄','ZnSO₄'],
      gabarito:{ produtos:['mgso4','sulfato de magnesio','h2','hidrogenio'],
        equacaoBalanceada:'Mg(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂(g)' },
      hints:['Mg>Zn>Fe>H. Mg→Mg²⁺+2e⁻. Reação vigorosa — Mg ativo demais'],
      explicacao:'Mg+H₂SO₄→MgSO₄+H₂  ·  MgSO₄ = sal de Epsom — laxante e sal de banho',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     HCl — 5 reações
  ════════════════════════════════════════════════════════════════ */
  'HCl': [
    {
      id:'hcl_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HCl + NaOH → NaCl + H₂O',
      reagentes:['HCl','NaOH'], condicao:'', coefR:{'HCl':1,'NaOH':1},
      produtos_visuais:['NaCl','H₂O'], coefP:[1,1],
      candidatos:['NaCl','H₂O','Na₂SO₄','NaNO₃','NaHCO₃','NaOH','Na₂CO₃','CaCl₂'],
      gabarito:{ produtos:['nacl','cloreto de sodio','h2o','agua'],
        equacaoBalanceada:'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)' },
      hints:['H⁺+OH⁻→H₂O. Na⁺+Cl⁻ ficam em solução — que sal formam?'],
      explicacao:'HCl+NaOH→NaCl+H₂O  ·  Neutralização clássica — ácido e base fortes',
    },
    {
      id:'hcl_fe', icon:'⚡', familia:'Simples Troca',
      titulo:'Fe + 2 HCl → FeCl₂ + H₂',
      reagentes:['Fe','HCl'], condicao:'', coefR:{'Fe':1,'HCl':2},
      produtos_visuais:['FeCl₂','H₂'], coefP:[1,1],
      candidatos:['FeCl₂','H₂','FeCl₃','FeO','Fe₂O₃','H₂O','NaCl','ZnCl₂'],
      gabarito:{ produtos:['fecl2','cloreto de ferro','h2','hidrogenio'],
        equacaoBalanceada:'Fe(s) + 2 HCl(aq) → FeCl₂(aq) + H₂(g)' },
      hints:['Fe→Fe²⁺+2e⁻. 2H⁺+2e⁻→H₂↑. Fe²⁺+2Cl⁻→?'],
      explicacao:'Fe+2HCl→FeCl₂+H₂  ·  Deslocamento — Fe desloca H do ácido forte',
    },
    {
      id:'hcl_mgoh2', icon:'⚗️', familia:'Neutralização',
      titulo:'2 HCl + Mg(OH)₂ → MgCl₂ + 2 H₂O',
      reagentes:['HCl','Mg(OH)₂'], condicao:'', coefR:{'HCl':2,'Mg(OH)₂':1},
      produtos_visuais:['MgCl₂','H₂O'], coefP:[1,2],
      candidatos:['MgCl₂','H₂O','MgSO₄','Mg(NO₃)₂','MgO','NaCl','CaCl₂','KCl'],
      gabarito:{ produtos:['mgcl2','cloreto de magnesio','h2o','agua'],
        equacaoBalanceada:'2 HCl(aq) + Mg(OH)₂(s) → MgCl₂(aq) + 2 H₂O(l)' },
      hints:['Mg(OH)₂ é divalente: 2OH⁻. Quantos HCl neutralizam?','Mg²⁺+2Cl⁻→MgCl₂. 2H⁺+2OH⁻→2H₂O'],
      explicacao:'2HCl+Mg(OH)₂→MgCl₂+2H₂O  ·  Leite de magnésia (antiácido) neutralizando HCl gástrico',
    },
    {
      id:'hcl_caco3', icon:'🔄', familia:'Dupla Troca',
      titulo:'2 HCl + CaCO₃ → CaCl₂ + H₂O + CO₂',
      reagentes:['HCl','CaCO₃'], condicao:'', coefR:{'HCl':2,'CaCO₃':1},
      produtos_visuais:['CaCl₂','H₂O','CO₂'], coefP:[1,1,1],
      candidatos:['CaCl₂','H₂O','CO₂','CaSO₄','CaCO₃','NaCl','MgCl₂','Ca(HCO₃)₂'],
      gabarito:{ produtos:['cacl2','cloreto de calcio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'2 HCl(aq) + CaCO₃(s) → CaCl₂(aq) + H₂O(l) + CO₂(g)' },
      hints:['HCl dissolve calcário: CO₃²⁻+2H⁺→H₂CO₃→H₂O+CO₂↑. Ca²⁺+2Cl⁻→?'],
      explicacao:'2HCl+CaCO₃→CaCl₂+H₂O+CO₂  ·  Base de como estalactites se formam — ácido dissolve calcário',
    },
    {
      id:'hcl_mno2', icon:'🔥', familia:'Oxirredução',
      titulo:'4 HCl + MnO₂ → MnCl₂ + Cl₂ + 2 H₂O',
      reagentes:['HCl','MnO₂'], condicao:'Δ', coefR:{'HCl':4,'MnO₂':1},
      produtos_visuais:['MnCl₂','Cl₂','H₂O'], coefP:[1,1,2],
      candidatos:['MnCl₂','Cl₂','H₂O','MnO','MnSO₄','HCl','Cl₂O','H₂'],
      gabarito:{ produtos:['mncl2','cloreto de manganes','cl2','cloro','h2o','agua'],
        equacaoBalanceada:'4 HCl(conc.) + MnO₂(s) →(Δ)→ MnCl₂(aq) + Cl₂(g) + 2 H₂O(l)' },
      hints:['HCl é oxidado: Cl⁻→Cl₂↑ (oxidação). MnO₂ é reduzido: Mn⁴⁺→Mn²⁺','4HCl: 2 formam MnCl₂, 2 são oxidados a Cl₂'],
      explicacao:'4HCl+MnO₂→MnCl₂+Cl₂+2H₂O  ·  Método laboratorial clássico de produção de Cl₂',
    },
  
{
      id:'hcl_zn', icon:'⚡', familia:'Simples Troca',
      titulo:'Zn + 2 HCl → ZnCl₂ + H₂',
      reagentes:['Zn','HCl'], condicao:'',
      coefR:{'Zn':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['ZnCl₂','H₂'],
      candidatos:['ZnCl₂','H₂','ZnO','ZnSO₄','ZnCO₃','H₂O','NaCl','FeCl₂'],
      gabarito:{ produtos:['zncl2','cloreto de zinco','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)' },
      hints:['Zn>H. Zn→Zn²⁺+2e⁻. 2HCl → 2H⁺+2Cl⁻. Zn²⁺+2Cl⁻→ZnCl₂'],
      explicacao:'Zn+2HCl→ZnCl₂+H₂  ·  Pilha de Volta — Zn em HCl gera corrente elétrica e H₂',
    },
    {
      id:'hcl_caoh2', icon:'⚗️', familia:'Neutralização',
      titulo:'2 HCl + Ca(OH)₂ → CaCl₂ + 2 H₂O',
      reagentes:['HCl','Ca(OH)₂'], condicao:'',
      coefR:{'HCl':2,'Ca(OH)₂':1}, coefP:[1,2],
      produtos_visuais:['CaCl₂','H₂O'],
      candidatos:['CaCl₂','H₂O','CaSO₄','CaCO₃','Ca(NO₃)₂','NaCl','MgCl₂','Ca(OH)₂'],
      gabarito:{ produtos:['cacl2','cloreto de calcio','h2o','agua'],
        equacaoBalanceada:'2 HCl(aq) + Ca(OH)₂(aq) → CaCl₂(aq) + 2 H₂O(l)' },
      hints:['Ca(OH)₂ tem 2 OH⁻. Precisa de 2 HCl. Ca²⁺+2Cl⁻→CaCl₂'],
      explicacao:'2HCl+Ca(OH)₂→CaCl₂+2H₂O  ·  CaCl₂ é anti-gelo de estradas e dessecante industrial',
    },
    {
      id:'hcl_na2s', icon:'🔬', familia:'Dupla Troca',
      titulo:'2 HCl + Na₂S → 2 NaCl + H₂S',
      reagentes:['HCl','Na₂S'], condicao:'',
      coefR:{'HCl':2,'Na₂S':1}, coefP:[2,1],
      produtos_visuais:['NaCl','H₂S'],
      candidatos:['NaCl','H₂S','Na₂SO₄','NaHS','Na₂O','SO₂','NaOH','NaCl'],
      gabarito:{ produtos:['nacl','cloreto de sodio','h2s','sulfeto de hidrogenio'],
        equacaoBalanceada:'2 HCl(aq) + Na₂S(aq) → 2 NaCl(aq) + H₂S(g)' },
      hints:['HCl desloca H₂S (ácido mais forte→mais fraco). S²⁻+2H⁺→H₂S↑ (cheiro de ovo podre)'],
      explicacao:'2HCl+Na₂S→2NaCl+H₂S  ·  H₂S cheiro de ovo podre — ácido forte desloca ácido fraco volátil',
    },
    {
      id:'hcl_al', icon:'⚡', familia:'Simples Troca',
      titulo:'2 Al + 6 HCl → 2 AlCl₃ + 3 H₂',
      reagentes:['Al','HCl'], condicao:'',
      coefR:{'Al':2,'HCl':6}, coefP:[2,3],
      produtos_visuais:['AlCl₃','H₂'],
      candidatos:['AlCl₃','H₂','Al(OH)₃','Al₂O₃','NaAlO₂','H₂O','AlBr₃','ZnCl₂'],
      gabarito:{ produtos:['alcl3','cloreto de aluminio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 6 HCl(aq) → 2 AlCl₃(aq) + 3 H₂(g)' },
      hints:['Al→Al³⁺+3e⁻. 2Al×3e⁻=6e⁻=3H₂×2e⁻. 6HCl→6H⁺+6Cl⁻. Al³⁺+3Cl⁻→AlCl₃'],
      explicacao:'2Al+6HCl→2AlCl₃+3H₂  ·  Base do desenvolvimento de proteção anticorrosão de alumínio',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     HNO₃ — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'HNO3': [
    {
      id:'hno3_koh', icon:'⚗️', familia:'Neutralização',
      titulo:'HNO₃ + KOH → KNO₃ + H₂O',
      reagentes:['HNO₃','KOH'], condicao:'', coefR:{'HNO₃':1,'KOH':1},
      produtos_visuais:['KNO₃','H₂O'], coefP:[1,1],
      candidatos:['KNO₃','H₂O','KCl','K₂SO₄','K₂CO₃','NaNO₃','Ca(OH)₂','KHCO₃'],
      gabarito:{ produtos:['kno3','nitrato de potassio','h2o','agua'],
        equacaoBalanceada:'HNO₃(aq) + KOH(aq) → KNO₃(aq) + H₂O(l)' },
      hints:['H⁺+OH⁻→H₂O. K⁺+NO₃⁻→KNO₃ — usado como fertilizante e em pólvora negra'],
      explicacao:'HNO₃+KOH→KNO₃+H₂O  ·  KNO₃ (salitre) — componente da pólvora negra',
    },
    {
      id:'hno3_cu', icon:'⚡', familia:'Oxirredução',
      titulo:'3 Cu + 8 HNO₃ → 3 Cu(NO₃)₂ + 2 NO + 4 H₂O',
      reagentes:['Cu','HNO₃'], condicao:'diluído', coefR:{'Cu':3,'HNO₃':8},
      produtos_visuais:['Cu(NO₃)₂','NO','H₂O'], coefP:[3,2,4],
      candidatos:['Cu(NO₃)₂','NO','H₂O','CuO','NO₂','Cu₂O','CuSO₄','N₂O'],
      gabarito:{ produtos:['cu(no3)2','nitrato de cobre','no','oxido nitrico','h2o','agua'],
        equacaoBalanceada:'3 Cu(s) + 8 HNO₃(dil.) → 3 Cu(NO₃)₂(aq) + 2 NO(g) + 4 H₂O(l)' },
      hints:['HNO₃ diluído: N⁺⁵+3e⁻→N⁺²(NO). Cu→Cu²⁺+2e⁻','3Cu×2e⁻=6e⁻. 2NO×3e⁻=6e⁻ ✓ Balanceado!'],
      explicacao:'3Cu+8HNO₃dil→3Cu(NO₃)₂+2NO↑+4H₂O  ·  HNO₃ diluído produz NO (incolor → vira NO₂ marrom no ar)',
    },
    {
      id:'hno3_cu_conc', icon:'🔥', familia:'Oxirredução',
      titulo:'Cu + 4 HNO₃ → Cu(NO₃)₂ + 2 NO₂ + 2 H₂O',
      reagentes:['Cu','HNO₃'], condicao:'conc.', coefR:{'Cu':1,'HNO₃':4},
      produtos_visuais:['Cu(NO₃)₂','NO₂','H₂O'], coefP:[1,2,2],
      candidatos:['Cu(NO₃)₂','NO₂','H₂O','NO','CuO','CuCl₂','N₂O₄','N₂'],
      gabarito:{ produtos:['cu(no3)2','nitrato de cobre','no2','dioxido de nitrogenio','h2o','agua'],
        equacaoBalanceada:'Cu(s) + 4 HNO₃(conc.) → Cu(NO₃)₂(aq) + 2 NO₂(g) + 2 H₂O(l)' },
      hints:['HNO₃ concentrado: N⁺⁵+1e⁻→N⁺⁴(NO₂ marrom). Cu→Cu²⁺+2e⁻','2NO₂×1e⁻=2e⁻ = Cu×2e⁻ ✓'],
      explicacao:'Cu+4HNO₃conc→Cu(NO₃)₂+2NO₂+2H₂O  ·  Gás marrom-avermelhado tóxico — HNO₃ conc. é oxidante mais forte',
    },
    {
      id:'hno3_na2co3', icon:'🔄', familia:'Dupla Troca',
      titulo:'2 HNO₃ + Na₂CO₃ → 2 NaNO₃ + H₂O + CO₂',
      reagentes:['HNO₃','Na₂CO₃'], condicao:'', coefR:{'HNO₃':2,'Na₂CO₃':1},
      produtos_visuais:['NaNO₃','H₂O','CO₂'], coefP:[2,1,1],
      candidatos:['NaNO₃','H₂O','CO₂','NaCl','Na₂SO₄','NaHCO₃','NaOH','KNO₃'],
      gabarito:{ produtos:['nano3','nitrato de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'2 HNO₃(aq) + Na₂CO₃(aq) → 2 NaNO₃(aq) + H₂O(l) + CO₂(g)' },
      hints:['HNO₃ é mais forte que H₂CO₃. CO₃²⁻+2H⁺→H₂CO₃→H₂O+CO₂↑'],
      explicacao:'2HNO₃+Na₂CO₃→2NaNO₃+H₂O+CO₂  ·  NaNO₃ = salitre do Chile (fertilizante)',
    },
  
{
      id:'hno3_fe', icon:'⚡', familia:'Oxirredução',
      titulo:'Fe + 4 HNO₃ → Fe(NO₃)₃ + NO + 2 H₂O',
      reagentes:['Fe','HNO₃'], condicao:'diluído exc.',
      coefR:{'Fe':1,'HNO₃':4}, coefP:[1,1,2],
      produtos_visuais:['Fe(NO₃)₃','NO','H₂O'],
      candidatos:['Fe(NO₃)₃','NO','H₂O','Fe(NO₃)₂','NO₂','FeO','Fe₂O₃','NH₄NO₃'],
      gabarito:{ produtos:['fe(no3)3','nitrato de ferro iii','no','oxido nitrico','h2o','agua'],
        equacaoBalanceada:'Fe(s) + 4 HNO₃(dil. exc.) → Fe(NO₃)₃(aq) + NO(g) + 2 H₂O(l)' },
      hints:['HNO₃ diluído: N⁺⁵+3e⁻→N⁺²(NO). Fe→Fe³⁺+3e⁻. 1Fe×3e⁻=1NO×3e⁻ ✓'],
      explicacao:'Fe+4HNO₃→Fe(NO₃)₃+NO+2H₂O  ·  Fe³⁺ (não Fe²⁺) porque HNO₃ é oxidante forte',
    },
    {
      id:'hno3_ca', icon:'⚡', familia:'Simples Troca',
      titulo:'Ca + 2 HNO₃ → Ca(NO₃)₂ + H₂',
      reagentes:['Ca','HNO₃'], condicao:'muito diluído',
      coefR:{'Ca':1,'HNO₃':2}, coefP:[1,1],
      produtos_visuais:['Ca(NO₃)₂','H₂'],
      candidatos:['Ca(NO₃)₂','H₂','CaO','Ca(OH)₂','CaCl₂','NO','CaCO₃','NH₄NO₃'],
      gabarito:{ produtos:['ca(no3)2','nitrato de calcio','h2','hidrogenio'],
        equacaoBalanceada:'Ca(s) + 2 HNO₃(muito dil.) → Ca(NO₃)₂(aq) + H₂(g)' },
      hints:['HNO₃ muito diluído age como ácido (H⁺). Ca→Ca²⁺+2e⁻. 2H⁺+2e⁻→H₂↑'],
      explicacao:'Ca+2HNO₃→Ca(NO₃)₂+H₂  ·  Ca(NO₃)₂ = fertilizante nitrocalcário — fonte dupla Ca+N',
    },
    {
      id:'hno3_caco3', icon:'🔄', familia:'Dupla Troca',
      titulo:'2 HNO₃ + CaCO₃ → Ca(NO₃)₂ + H₂O + CO₂',
      reagentes:['HNO₃','CaCO₃'], condicao:'',
      coefR:{'HNO₃':2,'CaCO₃':1}, coefP:[1,1,1],
      produtos_visuais:['Ca(NO₃)₂','H₂O','CO₂'],
      candidatos:['Ca(NO₃)₂','H₂O','CO₂','CaCl₂','NaNO₃','CaSO₄','CaO','Ca(HCO₃)₂'],
      gabarito:{ produtos:['ca(no3)2','nitrato de calcio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'2 HNO₃(aq) + CaCO₃(s) → Ca(NO₃)₂(aq) + H₂O(l) + CO₂(g)' },
      hints:['HNO₃ dissolve pedra calcária. CO₃²⁻+2H⁺→H₂O+CO₂↑. Ca²⁺+2NO₃⁻→Ca(NO₃)₂'],
      explicacao:'2HNO₃+CaCO₃→Ca(NO₃)₂+H₂O+CO₂  ·  Dissolução de mármore e calcário em ácido nítrico — chuva ácida',
    }
  ],

  /* ════════════════════════════════════════════════════════════════
     H₂CO₃ — 3 reações
  ════════════════════════════════════════════════════════════════ */
  'H2CO3': [
    {
      id:'h2co3_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'H₂CO₃ + 2 NaOH → Na₂CO₃ + 2 H₂O',
      reagentes:['H₂CO₃','NaOH'], condicao:'', coefR:{'H₂CO₃':1,'NaOH':2},
      produtos_visuais:['Na₂CO₃','H₂O'], coefP:[1,2],
      candidatos:['Na₂CO₃','H₂O','NaHCO₃','NaCl','CO₂','Na₂SO₄','NaOH','CaCO₃'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua'],
        equacaoBalanceada:'H₂CO₃(aq) + 2 NaOH(aq) → Na₂CO₃(aq) + 2 H₂O(l)' },
      hints:['H₂CO₃ é dibásico. 2 NaOH para neutralizar completamente','CO₃²⁻+2Na⁺→Na₂CO₃ (barrilha)'],
      explicacao:'H₂CO₃+2NaOH→Na₂CO₃+2H₂O  ·  Na₂CO₃ = barrilha — usada em sabão e vidro',
    },
    {
      id:'h2co3_naoh_parcial', icon:'⚗️', familia:'Neutralização Parcial',
      titulo:'H₂CO₃ + NaOH → NaHCO₃ + H₂O',
      reagentes:['H₂CO₃','NaOH'], condicao:'1:1', coefR:{'H₂CO₃':1,'NaOH':1},
      produtos_visuais:['NaHCO₃','H₂O'], coefP:[1,1],
      candidatos:['NaHCO₃','H₂O','Na₂CO₃','NaCl','CO₂','Na₂SO₄','NaNO₃','NaOH'],
      gabarito:{ produtos:['nahco3','bicarbonato de sodio','h2o','agua'],
        equacaoBalanceada:'H₂CO₃(aq) + NaOH(aq) → NaHCO₃(aq) + H₂O(l)' },
      hints:['Só 1 H⁺ é neutralizado (neutralização parcial). HCO₃⁻+Na⁺→NaHCO₃'],
      explicacao:'H₂CO₃+NaOH→NaHCO₃+H₂O  ·  NaHCO₃ = bicarbonato de sódio (fermento em pó)',
    },
    {
      id:'h2co3_caoh2', icon:'🔬', familia:'Precipitação',
      titulo:'H₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2 H₂O',
      reagentes:['H₂CO₃','Ca(OH)₂'], condicao:'', coefR:{'H₂CO₃':1,'Ca(OH)₂':1},
      produtos_visuais:['CaCO₃','H₂O'], coefP:[1,2],
      candidatos:['CaCO₃','H₂O','CaCl₂','CaSO₄','CaO','Na₂CO₃','Ca(HCO₃)₂','CO₂'],
      gabarito:{ produtos:['caco3','carbonato de calcio','h2o','agua'],
        equacaoBalanceada:'H₂CO₃(aq) + Ca(OH)₂(aq) → CaCO₃↓(s) + 2 H₂O(l)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓ (insolúvel — precipita). 2H⁺+2OH⁻→2H₂O'],
      explicacao:'H₂CO₃+Ca(OH)₂→CaCO₃↓+2H₂O  ·  Formação de estalactites — CaCO₃ precipita em cavernas',
    },
  
{
      id:'h2co3_caco3', icon:'🌊', familia:'Dissolução Cárstica',
      titulo:'H₂CO₃ + CaCO₃ → Ca(HCO₃)₂',
      reagentes:['H₂CO₃','CaCO₃'], condicao:'H₂O exc.',
      coefR:{'H₂CO₃':1,'CaCO₃':1}, coefP:[1],
      produtos_visuais:['Ca(HCO₃)₂'],
      candidatos:['Ca(HCO₃)₂','CaCl₂','CaSO₄','CaCO₃','Ca(OH)₂','CaO','NaHCO₃','CaC₂'],
      gabarito:{ produtos:['ca(hco3)2','bicarbonato de calcio','hidrogenocarbonato de calcio'],
        equacaoBalanceada:'H₂CO₃(aq) + CaCO₃(s) → Ca(HCO₃)₂(aq)' },
      hints:['H₂CO₃ (chuva ácida natural) dissolve pedra calcária. CaCO₃+H₂O+CO₂→Ca(HCO₃)₂ (solúvel)'],
      explicacao:'H₂CO₃+CaCO₃→Ca(HCO₃)₂  ·  Formação de cavernas cársticas — calcário se dissolve em chuva ácida natural',
    },
    {
      id:'h2co3_decomp', icon:'🌡️', familia:'Decomposição',
      titulo:'H₂CO₃ → H₂O + CO₂',
      reagentes:['H₂CO₃'], condicao:'instável',
      coefR:{'H₂CO₃':1}, coefP:[1,1],
      produtos_visuais:['H₂O','CO₂'],
      candidatos:['H₂O','CO₂','HCO₃⁻','CO₃²⁻','H₂O₂','SO₂','H₂S','CO'],
      gabarito:{ produtos:['h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'H₂CO₃(aq) → H₂O(l) + CO₂(g)' },
      hints:['H₂CO₃ é instável — se decompõe espontaneamente em H₂O e CO₂. Por isso refrigerantes perdem gás'],
      explicacao:'H₂CO₃→H₂O+CO₂  ·  H₂CO₃ é tão instável que não pode ser isolado puro — sempre se decompõe',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     NaOH — 5 reações
  ════════════════════════════════════════════════════════════════ */
  'NaOH': [
    {
      id:'naoh_hcl', icon:'⚗️', familia:'Neutralização',
      titulo:'NaOH + HCl → NaCl + H₂O',
      reagentes:['NaOH','HCl'], condicao:'', coefR:{'NaOH':1,'HCl':1},
      produtos_visuais:['NaCl','H₂O'], coefP:[1,1],
      candidatos:['NaCl','H₂O','Na₂SO₄','Na₂CO₃','NaHCO₃','KCl','Na₂O','NaNO₃'],
      gabarito:{ produtos:['nacl','cloreto de sodio','h2o','agua'],
        equacaoBalanceada:'NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)' },
      hints:['OH⁻+H⁺→H₂O. Na⁺+Cl⁻→NaCl(aq)'],
      explicacao:'NaOH+HCl→NaCl+H₂O  ·  Neutralização total — ΔH = −57,3 kJ/mol',
    },
    {
      id:'naoh_cuso4', icon:'🧪', familia:'Precipitação',
      titulo:'CuSO₄ + 2 NaOH → Cu(OH)₂↓ + Na₂SO₄',
      reagentes:['CuSO₄','NaOH'], condicao:'', coefR:{'CuSO₄':1,'NaOH':2},
      produtos_visuais:['Cu(OH)₂','Na₂SO₄'], coefP:[1,1],
      candidatos:['Cu(OH)₂','Na₂SO₄','CuO','CuCl₂','NaCl','CuCO₃','NaHCO₃','H₂O'],
      gabarito:{ produtos:['cu(oh)2','hidroxido de cobre','na2so4','sulfato de sodio'],
        equacaoBalanceada:'CuSO₄(aq) + 2 NaOH(aq) → Cu(OH)₂↓(s) + Na₂SO₄(aq)' },
      hints:['Cu²⁺+2OH⁻→Cu(OH)₂↓ (azul intenso). SO₄²⁻+2Na⁺→Na₂SO₄(aq)'],
      explicacao:'CuSO₄+2NaOH→Cu(OH)₂↓+Na₂SO₄  ·  Precipitado azul — teste de identificação de Cu²⁺',
    },
    {
      id:'naoh_al', icon:'⚡', familia:'Deslocamento',
      titulo:'2 Al + 2 NaOH + 2 H₂O → 2 NaAlO₂ + 3 H₂',
      reagentes:['Al','NaOH','H₂O'], condicao:'', coefR:{'Al':2,'NaOH':2,'H₂O':2},
      produtos_visuais:['NaAlO₂','H₂'], coefP:[2,3],
      candidatos:['NaAlO₂','H₂','Al(OH)₃','AlCl₃','Na₂O','Al₂O₃','NaCl','H₂O'],
      gabarito:{ produtos:['naaio2','aluminato de sodio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 2 NaOH(aq) + 2 H₂O(l) → 2 NaAlO₂(aq) + 3 H₂(g)' },
      hints:['Al reage com NaOH! Al→Al³⁺+3e⁻. OH⁻ ataca Al formando AlO₂⁻ (aluminato)','3×2e⁻=6e⁻ (2Al) = 3×2e⁻ (3H₂) ✓'],
      explicacao:'2Al+2NaOH+2H₂O→2NaAlO₂+3H₂  ·  Al é anfótero — reage com ácidos E bases! H₂ gerado desentope ralos',
    },
    {
      id:'naoh_fecl3', icon:'🔄', familia:'Precipitação',
      titulo:'FeCl₃ + 3 NaOH → Fe(OH)₃↓ + 3 NaCl',
      reagentes:['FeCl₃','NaOH'], condicao:'', coefR:{'FeCl₃':1,'NaOH':3},
      produtos_visuais:['Fe(OH)₃','NaCl'], coefP:[1,3],
      candidatos:['Fe(OH)₃','NaCl','Fe(OH)₂','FeCl₂','FeO','Na₂SO₄','Fe₂O₃','NaNO₃'],
      gabarito:{ produtos:['fe(oh)3','hidroxido de ferro','nacl','cloreto de sodio'],
        equacaoBalanceada:'FeCl₃(aq) + 3 NaOH(aq) → Fe(OH)₃↓(s) + 3 NaCl(aq)' },
      hints:['Fe³⁺+3OH⁻→Fe(OH)₃↓ (marrom-ferrugem). 3Cl⁻+3Na⁺→3NaCl(aq)'],
      explicacao:'FeCl₃+3NaOH→Fe(OH)₃↓+3NaCl  ·  Precipitado marrom de Fe(OH)₃ — teste de Fe³⁺',
    },
    {
      id:'naoh_co2', icon:'🌫️', familia:'Síntese',
      titulo:'CO₂ + 2 NaOH → Na₂CO₃ + H₂O',
      reagentes:['CO₂','NaOH'], condicao:'', coefR:{'CO₂':1,'NaOH':2},
      produtos_visuais:['Na₂CO₃','H₂O'], coefP:[1,1],
      candidatos:['Na₂CO₃','H₂O','NaHCO₃','NaCl','Na₂O','NaNO₃','Na₂SO₄','CO₂'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua'],
        equacaoBalanceada:'CO₂(g) + 2 NaOH(aq) → Na₂CO₃(aq) + H₂O(l)' },
      hints:['CO₂ é óxido ácido. CO₂+H₂O→H₂CO₃. H₂CO₃+2NaOH→Na₂CO₃+2H₂O'],
      explicacao:'CO₂+2NaOH→Na₂CO₃+H₂O  ·  Absorvedores de CO₂ em submarinos e máscaras usam NaOH',
    },
  
{
      id:'naoh_h2so4', icon:'⚗️', familia:'Neutralização',
      titulo:'2 NaOH + H₂SO₄ → Na₂SO₄ + 2 H₂O',
      reagentes:['NaOH','H₂SO₄'], condicao:'',
      coefR:{'NaOH':2,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['Na₂SO₄','H₂O'],
      candidatos:['Na₂SO₄','H₂O','NaHSO₄','NaCl','Na₂CO₃','NaNO₃','NaHCO₃','CaSO₄'],
      gabarito:{ produtos:['na2so4','sulfato de sodio','h2o','agua'],
        equacaoBalanceada:'2 NaOH(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + 2 H₂O(l)' },
      hints:['H₂SO₄ dibásico: 2H⁺. 2NaOH doam 2OH⁻. 2H⁺+2OH⁻→2H₂O. 2Na⁺+SO₄²⁻→Na₂SO₄'],
      explicacao:'2NaOH+H₂SO₄→Na₂SO₄+2H₂O  ·  Na₂SO₄ (sal de Glauber) — usado em detergentes e papel',
    },
    {
      id:'naoh_zn', icon:'⚡', familia:'Deslocamento (Anfótero)',
      titulo:'Zn + 2 NaOH → Na₂ZnO₂ + H₂',
      reagentes:['Zn','NaOH'], condicao:'conc.',
      coefR:{'Zn':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Na₂ZnO₂','H₂'],
      candidatos:['Na₂ZnO₂','H₂','ZnO','Zn(OH)₂','ZnCl₂','NaCl','ZnSO₄','Na₂O'],
      gabarito:{ produtos:['na2zno2','zincato de sodio','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + 2 NaOH(conc.) → Na₂ZnO₂(aq) + H₂(g)' },
      hints:['Zn é anfótero: reage com base! Zn→ZnO₂²⁻ (zincato). Na₂ZnO₂ = zincato de sódio'],
      explicacao:'Zn+2NaOH→Na₂ZnO₂+H₂  ·  Zn anfótero (como Al) — reage com HCl E com NaOH',
    },
    {
      id:'naoh_hno3', icon:'⚗️', familia:'Neutralização',
      titulo:'NaOH + HNO₃ → NaNO₃ + H₂O',
      reagentes:['NaOH','HNO₃'], condicao:'',
      coefR:{'NaOH':1,'HNO₃':1}, coefP:[1,1],
      produtos_visuais:['NaNO₃','H₂O'],
      candidatos:['NaNO₃','H₂O','NaCl','Na₂SO₄','Na₂CO₃','NaHNO₃','NaHCO₃','KNO₃'],
      gabarito:{ produtos:['nano3','nitrato de sodio','h2o','agua'],
        equacaoBalanceada:'NaOH(aq) + HNO₃(aq) → NaNO₃(aq) + H₂O(l)' },
      hints:['OH⁻+H⁺→H₂O. Na⁺+NO₃⁻→NaNO₃. Salitre do Chile!'],
      explicacao:'NaOH+HNO₃→NaNO₃+H₂O  ·  NaNO₃ = salitre — fertilizante e componente de explosivos',
    },
    {
      id:'naoh_sioh4', icon:'🪨', familia:'Síntese',
      titulo:'SiO₂ + 2 NaOH → Na₂SiO₃ + H₂O',
      reagentes:['SiO₂','NaOH'], condicao:'Δ',
      coefR:{'SiO₂':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Na₂SiO₃','H₂O'],
      candidatos:['Na₂SiO₃','H₂O','NaCl','Na₂SO₄','SiO₂','Na₂O','Si','NaHSiO₃'],
      gabarito:{ produtos:['na2sio3','silicato de sodio','h2o','agua'],
        equacaoBalanceada:'SiO₂(s) + 2 NaOH(l) →(Δ)→ Na₂SiO₃(l) + H₂O(g)' },
      hints:['SiO₂ é óxido ácido. NaOH é base. SiO₂+2NaOH→silicato+água','Na₂SiO₃ = vidro solúvel ("cimento de vidro")'],
      explicacao:'SiO₂+2NaOH→Na₂SiO₃+H₂O  ·  Vidro solúvel — adesivo industrial e tratamento anti-fogo',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     Ca(OH)₂ — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'Ca(OH)2': [
    {
      id:'caoh2_hcl', icon:'⚗️', familia:'Neutralização',
      titulo:'Ca(OH)₂ + 2 HCl → CaCl₂ + 2 H₂O',
      reagentes:['Ca(OH)₂','HCl'], condicao:'', coefR:{'Ca(OH)₂':1,'HCl':2},
      produtos_visuais:['CaCl₂','H₂O'], coefP:[1,2],
      candidatos:['CaCl₂','H₂O','CaSO₄','Ca(NO₃)₂','CaCO₃','NaCl','Ca(OH)₂','HCl'],
      gabarito:{ produtos:['cacl2','cloreto de calcio','h2o','agua'],
        equacaoBalanceada:'Ca(OH)₂(aq) + 2 HCl(aq) → CaCl₂(aq) + 2 H₂O(l)' },
      hints:['Ca(OH)₂ tem 2OH⁻. 2HCl para neutralizar. Ca²⁺+2Cl⁻→CaCl₂'],
      explicacao:'Ca(OH)₂+2HCl→CaCl₂+2H₂O  ·  CaCl₂ é usado para derreter gelo em estradas',
    },
    {
      id:'caoh2_co2', icon:'🔬', familia:'Síntese / Precipitação',
      titulo:'Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O',
      reagentes:['Ca(OH)₂','CO₂'], condicao:'', coefR:{'Ca(OH)₂':1,'CO₂':1},
      produtos_visuais:['CaCO₃','H₂O'], coefP:[1,1],
      candidatos:['CaCO₃','H₂O','CaO','Ca(HCO₃)₂','Na₂CO₃','CaSO₄','CaCl₂','CO₂'],
      gabarito:{ produtos:['caco3','carbonato de calcio','h2o','agua'],
        equacaoBalanceada:'Ca(OH)₂(aq) + CO₂(g) → CaCO₃↓(s) + H₂O(l)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓ (precipitado branco). CO₂+2OH⁻→CO₃²⁻+H₂O'],
      explicacao:'Ca(OH)₂+CO₂→CaCO₃↓+H₂O  ·  Água de cal ficando turva = teste clássico de CO₂',
    },
    {
      id:'caoh2_h2so4', icon:'💧', familia:'Precipitação',
      titulo:'Ca(OH)₂ + H₂SO₄ → CaSO₄↓ + 2 H₂O',
      reagentes:['Ca(OH)₂','H₂SO₄'], condicao:'', coefR:{'Ca(OH)₂':1,'H₂SO₄':1},
      produtos_visuais:['CaSO₄','H₂O'], coefP:[1,2],
      candidatos:['CaSO₄','H₂O','CaCl₂','Ca(NO₃)₂','CaCO₃','Na₂SO₄','CaO','CaSO₃'],
      gabarito:{ produtos:['caso4','sulfato de calcio','h2o','agua'],
        equacaoBalanceada:'Ca(OH)₂(aq) + H₂SO₄(aq) → CaSO₄↓(s) + 2 H₂O(l)' },
      hints:['Ca²⁺+SO₄²⁻→CaSO₄↓ (gesso — pouco solúvel). 2H⁺+2OH⁻→2H₂O'],
      explicacao:'Ca(OH)₂+H₂SO₄→CaSO₄↓+2H₂O  ·  Gesso (CaSO₄·½H₂O) é a base de moldes e construção',
    },
    {
      id:'caoh2_na2co3', icon:'🔄', familia:'Dupla Troca',
      titulo:'Ca(OH)₂ + Na₂CO₃ → CaCO₃↓ + 2 NaOH',
      reagentes:['Ca(OH)₂','Na₂CO₃'], condicao:'', coefR:{'Ca(OH)₂':1,'Na₂CO₃':1},
      produtos_visuais:['CaCO₃','NaOH'], coefP:[1,2],
      candidatos:['CaCO₃','NaOH','CaCl₂','Na₂SO₄','CaSO₄','Na₂O','Ca(HCO₃)₂','NaHCO₃'],
      gabarito:{ produtos:['caco3','carbonato de calcio','naoh','hidroxido de sodio'],
        equacaoBalanceada:'Ca(OH)₂(aq) + Na₂CO₃(aq) → CaCO₃↓(s) + 2 NaOH(aq)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓. 2Na⁺+2OH⁻→2NaOH — processo industrial de produção de NaOH'],
      explicacao:'Ca(OH)₂+Na₂CO₃→CaCO₃↓+2NaOH  ·  Processo de Solvay — produção industrial de NaOH',
    },
  
{
      id:'caoh2_cl2', icon:'🔬', familia:'Síntese',
      titulo:'2 Ca(OH)₂ + 2 Cl₂ → Ca(ClO)₂ + CaCl₂ + 2 H₂O',
      reagentes:['Ca(OH)₂','Cl₂'], condicao:'frio',
      coefR:{'Ca(OH)₂':2,'Cl₂':2}, coefP:[1,1,2],
      produtos_visuais:['Ca(ClO)₂','CaCl₂','H₂O'],
      candidatos:['Ca(ClO)₂','CaCl₂','H₂O','CaCl(ClO)','CaO','NaClO','Cl₂O','HClO'],
      gabarito:{ produtos:['ca(clo)2','hipoclorito de calcio','cacl2','cloreto de calcio','h2o','agua'],
        equacaoBalanceada:'2 Ca(OH)₂(s) + 2 Cl₂(g) → Ca(ClO)₂(s) + CaCl₂(s) + 2 H₂O(l)' },
      hints:['Cl₂ se desproporcionou em Cl⁻ e Cl⁺. Ca(ClO)₂ = cal clorada — piscinas e desinfecção'],
      explicacao:'2Ca(OH)₂+2Cl₂→Ca(ClO)₂+CaCl₂+2H₂O  ·  Cal clorada (cloro para piscina) — hipoclorito de cálcio',
    },
    {
      id:'caoh2_hno3', icon:'⚗️', familia:'Neutralização',
      titulo:'Ca(OH)₂ + 2 HNO₃ → Ca(NO₃)₂ + 2 H₂O',
      reagentes:['Ca(OH)₂','HNO₃'], condicao:'',
      coefR:{'Ca(OH)₂':1,'HNO₃':2}, coefP:[1,2],
      produtos_visuais:['Ca(NO₃)₂','H₂O'],
      candidatos:['Ca(NO₃)₂','H₂O','CaCl₂','CaSO₄','CaCO₃','KNO₃','NaNO₃','Ca(HCO₃)₂'],
      gabarito:{ produtos:['ca(no3)2','nitrato de calcio','h2o','agua'],
        equacaoBalanceada:'Ca(OH)₂(aq) + 2 HNO₃(aq) → Ca(NO₃)₂(aq) + 2 H₂O(l)' },
      hints:['2OH⁻+2H⁺→2H₂O. Ca²⁺+2NO₃⁻→Ca(NO₃)₂. Base divalente = 2 ácidos'],
      explicacao:'Ca(OH)₂+2HNO₃→Ca(NO₃)₂+2H₂O  ·  Ca(NO₃)₂ = nitrocálcio — fertilizante foliar rico em Ca e N',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     NH₃ — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'NH3': [
    {
      id:'nh3_hcl', icon:'🌫️', familia:'Síntese de Sal',
      titulo:'NH₃ + HCl → NH₄Cl',
      reagentes:['NH₃','HCl'], condicao:'', coefR:{'NH₃':1,'HCl':1},
      produtos_visuais:['NH₄Cl'], coefP:[1],
      candidatos:['NH₄Cl','NH₄NO₃','(NH₄)₂SO₄','NaCl','NH₄OH','HNO₃','NH₄Br','KCl'],
      gabarito:{ produtos:['nh4cl','cloreto de amonio'],
        equacaoBalanceada:'NH₃(g) + HCl(g) → NH₄Cl(s)' },
      hints:['Par isolado do N captura H⁺ do HCl. NH₃+H⁺→NH₄⁺. NH₄⁺+Cl⁻→NH₄Cl'],
      explicacao:'NH₃+HCl→NH₄Cl  ·  Névoa branca visível — formação direta de sal na fase gasosa',
    },
    {
      id:'nh3_h2so4', icon:'⚗️', familia:'Neutralização',
      titulo:'2 NH₃ + H₂SO₄ → (NH₄)₂SO₄',
      reagentes:['NH₃','H₂SO₄'], condicao:'', coefR:{'NH₃':2,'H₂SO₄':1},
      produtos_visuais:['(NH₄)₂SO₄'], coefP:[1],
      candidatos:['(NH₄)₂SO₄','NH₄Cl','NH₄NO₃','Na₂SO₄','(NH₄)₂CO₃','NH₄HSO₄','K₂SO₄','NaOH'],
      gabarito:{ produtos:['(nh4)2so4','sulfato de amonio'],
        equacaoBalanceada:'2 NH₃(g) + H₂SO₄(aq) → (NH₄)₂SO₄(aq)' },
      hints:['2NH₃ + 2H⁺→2NH₄⁺. 2NH₄⁺+SO₄²⁻→(NH₄)₂SO₄','Principal fertilizante nitrogenado do mundo'],
      explicacao:'2NH₃+H₂SO₄→(NH₄)₂SO₄  ·  Sulfato de amônio — fertilizante de maior produção global',
    },
    {
      id:'nh3_hno3', icon:'⚗️', familia:'Neutralização',
      titulo:'NH₃ + HNO₃ → NH₄NO₃',
      reagentes:['NH₃','HNO₃'], condicao:'', coefR:{'NH₃':1,'HNO₃':1},
      produtos_visuais:['NH₄NO₃'], coefP:[1],
      candidatos:['NH₄NO₃','(NH₄)₂SO₄','NH₄Cl','NaNO₃','KNO₃','NH₄OH','HNO₃','(NH₄)₂CO₃'],
      gabarito:{ produtos:['nh4no3','nitrato de amonio'],
        equacaoBalanceada:'NH₃(aq) + HNO₃(aq) → NH₄NO₃(aq)' },
      hints:['NH₃+H⁺→NH₄⁺. NH₄⁺+NO₃⁻→NH₄NO₃ — ATENÇÃO: pode explodir se aquecido rapidamente'],
      explicacao:'NH₃+HNO₃→NH₄NO₃  ·  Fertilizante e explosivo (ANFO). Usado em detonações controladas',
    },
    {
      id:'nh3_o2', icon:'🔥', familia:'Combustão / Oxidação Catalítica',
      titulo:'4 NH₃ + 5 O₂ → 4 NO + 6 H₂O',
      reagentes:['NH₃','O₂'], condicao:'Pt 900°C', coefR:{'NH₃':4,'O₂':5},
      produtos_visuais:['NO','H₂O'], coefP:[4,6],
      candidatos:['NO','H₂O','NO₂','N₂','N₂O','NH₄NO₃','HNO₃','N₂O₅'],
      gabarito:{ produtos:['no','oxido nitrico','h2o','agua'],
        equacaoBalanceada:'4 NH₃(g) + 5 O₂(g) →(Pt, 900°C)→ 4 NO(g) + 6 H₂O(g)' },
      hints:['N no NH₃: estado -3. N no NO: estado +2. Oxidação catalítica','Etapa 1 do processo Ostwald para HNO₃'],
      explicacao:'4NH₃+5O₂→4NO+6H₂O  ·  Processo Ostwald — 1ª etapa da síntese industrial de HNO₃',
    },
  
    {
      id:'nh3_h2o', icon:'💧', familia:'Ionização / Base Fraca',
      titulo:'NH₃ + HCl → NH₄Cl (base fraca)',
      reagentes:['NH₃','HCl'], condicao:'',
      coefR:{'NH₃':1,'HCl':1}, coefP:[1],
      produtos_visuais:['NH₄Cl'],
      candidatos:['NH₄Cl','NH₄NO₃','(NH₄)₂SO₄','NaCl','KCl','NH₄Br','NH₄HSO₄','NaOH'],
      gabarito:{ produtos:['nh4cl','cloreto de amonio'],
        equacaoBalanceada:'NH₃(g) + HCl(g) → NH₄Cl(s)  [Kb(NH₃)=1,8×10⁻⁵]' },
      hints:['NH₃ captura H⁺ do HCl (base de Brønsted). NH₃+H⁺→NH₄⁺. Névoa branca visível!'],
      explicacao:'NH₃+HCl→NH₄Cl  ·  NH₃ é base fraca (Kb=1,8×10⁻⁵) mas reage prontamente com ácido forte — névoa branca',
    },
    {
      id:'nh3_cu', icon:'🔵', familia:'Complexação',
      titulo:'CuSO₄ + 4 NH₃ → [Cu(NH₃)₄]SO₄',
      reagentes:['CuSO₄','NH₃'], condicao:'exc. NH₃',
      coefR:{'CuSO₄':1,'NH₃':4}, coefP:[1],
      produtos_visuais:['[Cu(NH₃)₄]SO₄'],
      candidatos:['[Cu(NH₃)₄]SO₄','Cu(OH)₂','CuO','CuCl₂','CuSO₄','Na₂SO₄','NH₄Cl','[Cu(H₂O)₄]SO₄'],
      gabarito:{ produtos:['[cu(nh3)4]so4','tetraaminossulfato de cobre','complexo azul'],
        equacaoBalanceada:'CuSO₄(aq) + 4 NH₃(aq) → [Cu(NH₃)₄]SO₄(aq)' },
      hints:['NH₃ é ligante: doa par de elétrons ao Cu²⁺. 4 NH₃ → esfera de coordenação completa','Cor azul-violeta intensa (≠ azul claro do CuSO₄) = confirmação da complexação'],
      explicacao:'CuSO₄+4NH₃→[Cu(NH₃)₄]SO₄  ·  Azul de Schweizer — dissolve celulose! Base de fibras artificiais rayon',
    },
    {
      id:'nh3_haber', icon:'🏭', familia:'Síntese Industrial',
      titulo:'N₂ + 3 H₂ ⇌ 2 NH₃',
      reagentes:['N₂','H₂'], condicao:'Fe, 450°C, 200atm',
      coefR:{'N₂':1,'H₂':3}, coefP:[2],
      produtos_visuais:['NH₃'],
      candidatos:['NH₃','N₂O','NH₄OH','NO','N₂H₄','HNO₃','NaOH','NH₄Cl'],
      gabarito:{ produtos:['nh3','amonia','amônia'],
        equacaoBalanceada:'N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)' },
      hints:['Processo Haber-Bosch: N₂+3H₂→2NH₃. Catalisador de Fe. Equilíbrio deslocado por alta pressão'],
      explicacao:'N₂+3H₂⇌2NH₃  ·  Processo Haber-Bosch — 150 milhões ton/ano — base de toda agricultura moderna',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     NaCl — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'NaCl': [
    {
      id:'nacl_agno3', icon:'🔬', familia:'Precipitação',
      titulo:'NaCl + AgNO₃ → AgCl↓ + NaNO₃',
      reagentes:['NaCl','AgNO₃'], condicao:'', coefR:{'NaCl':1,'AgNO₃':1},
      produtos_visuais:['AgCl','NaNO₃'], coefP:[1,1],
      candidatos:['AgCl','NaNO₃','AgBr','NaBr','NaCl','Ag₂SO₄','Ag₂CO₃','AgOH'],
      gabarito:{ produtos:['agcl','cloreto de prata','nano3','nitrato de sodio'],
        equacaoBalanceada:'NaCl(aq) + AgNO₃(aq) → AgCl↓(s) + NaNO₃(aq)' },
      hints:['Ag⁺+Cl⁻→AgCl↓ (precipitado branco — Kps=1,8×10⁻¹⁰). Na⁺+NO₃⁻→NaNO₃(aq)'],
      explicacao:'NaCl+AgNO₃→AgCl↓+NaNO₃  ·  Teste qualitativo de Cl⁻ — precipitado branco insolúvel',
    },
    {
      id:'nacl_eletr', icon:'⚡', familia:'Eletrólise',
      titulo:'2 NaCl + 2 H₂O →(eletr.)→ Cl₂ + H₂ + 2 NaOH',
      reagentes:['NaCl','H₂O'], condicao:'eletrólise', coefR:{'NaCl':2,'H₂O':2},
      produtos_visuais:['Cl₂','H₂','NaOH'], coefP:[1,1,2],
      candidatos:['Cl₂','H₂','NaOH','HCl','Na','NaClO','Cl₂O','Na₂O'],
      gabarito:{ produtos:['cl2','cloro','h2','hidrogenio','naoh','hidroxido de sodio'],
        equacaoBalanceada:'2 NaCl(aq) + 2 H₂O(l) →(eletrólise)→ Cl₂(g) + H₂(g) + 2 NaOH(aq)' },
      hints:['Cátodo: 2H₂O+2e⁻→H₂+2OH⁻. Ânodo: 2Cl⁻→Cl₂+2e⁻','Processo cloroálcali — Cl₂ para PVC, NaOH para sabão'],
      explicacao:'2NaCl+2H₂O→Cl₂+H₂+2NaOH  ·  Processo cloroálcali — base da indústria de PVC e plásticos',
    },
    {
      id:'nacl_h2so4', icon:'🔄', familia:'Dupla Troca',
      titulo:'NaCl + H₂SO₄ → NaHSO₄ + HCl',
      reagentes:['NaCl','H₂SO₄'], condicao:'Δ 150°C', coefR:{'NaCl':1,'H₂SO₄':1},
      produtos_visuais:['NaHSO₄','HCl'], coefP:[1,1],
      candidatos:['NaHSO₄','HCl','Na₂SO₄','NaCl','H₂SO₄','NaOH','Na₂O','Cl₂'],
      gabarito:{ produtos:['nahso4','sulfato acido de sodio','hcl','acido cloridrico'],
        equacaoBalanceada:'NaCl(s) + H₂SO₄(conc.) →(150°C)→ NaHSO₄(aq) + HCl(g)' },
      hints:['H₂SO₄ desloca HCl (ácido mais forte desloca mais fraco volátil)','1 NaOH para 1 H⁺ → bissulfato de sódio'],
      explicacao:'NaCl+H₂SO₄→NaHSO₄+HCl↑  ·  Produção laboratorial de HCl gasoso — ácido forte × sal volátil',
    },
    {
      id:'nacl_pb', icon:'🔬', familia:'Precipitação',
      titulo:'2 NaCl + Pb(NO₃)₂ → PbCl₂↓ + 2 NaNO₃',
      reagentes:['NaCl','Pb(NO₃)₂'], condicao:'', coefR:{'NaCl':2,'Pb(NO₃)₂':1},
      produtos_visuais:['PbCl₂','NaNO₃'], coefP:[1,2],
      candidatos:['PbCl₂','NaNO₃','PbSO₄','PbO','NaCl','Pb(OH)₂','AgCl','NaOH'],
      gabarito:{ produtos:['pbcl2','cloreto de chumbo','nano3','nitrato de sodio'],
        equacaoBalanceada:'2 NaCl(aq) + Pb(NO₃)₂(aq) → PbCl₂↓(s) + 2 NaNO₃(aq)' },
      hints:['Pb²⁺+2Cl⁻→PbCl₂↓ (branco — pouco solúvel a frio). 2Na⁺+2NO₃⁻→2NaNO₃(aq)'],
      explicacao:'2NaCl+Pb(NO₃)₂→PbCl₂↓+2NaNO₃  ·  PbCl₂ solúvel a quente, precipita no frio — separação por temperatura',
    },
  
{
      id:'nacl_naoh_cl2', icon:'⚗️', familia:'Desproporcionamento',
      titulo:'Cl₂ + 2 NaOH → NaCl + NaClO + H₂O',
      reagentes:['Cl₂','NaOH'], condicao:'frio',
      coefR:{'Cl₂':1,'NaOH':2}, coefP:[1,1,1],
      produtos_visuais:['NaCl','NaClO','H₂O'],
      candidatos:['NaCl','NaClO','H₂O','NaClO₃','NaCl','HCl','Cl₂O','Na₂O'],
      gabarito:{ produtos:['nacl','cloreto de sodio','naocl','hipoclorito de sodio','h2o','agua'],
        equacaoBalanceada:'Cl₂(g) + 2 NaOH(aq) → NaCl(aq) + NaClO(aq) + H₂O(l)' },
      hints:['Cl₂ se desproporcionou: Cl⁰→Cl⁻(NaCl) E Cl⁰→Cl⁺(NaClO)','NaClO = hipoclorito = água sanitária!'],
      explicacao:'Cl₂+2NaOH→NaCl+NaClO+H₂O  ·  Produção de água sanitária — Cl₂ se autoxirreduz em base',
    },
    {
      id:'nacl_nano3', icon:'🔄', familia:'Dupla Troca',
      titulo:'NaCl + AgNO₃ → AgCl↓ + NaNO₃',
      reagentes:['NaCl','AgNO₃'], condicao:'',
      coefR:{'NaCl':1,'AgNO₃':1}, coefP:[1,1],
      produtos_visuais:['AgCl','NaNO₃'],
      candidatos:['AgCl','NaNO₃','AgBr','NaBr','NaI','Ag₂SO₄','AgI','NaCl'],
      gabarito:{ produtos:['agcl','cloreto de prata','nano3','nitrato de sodio'],
        equacaoBalanceada:'NaCl(aq) + AgNO₃(aq) → AgCl↓(s) + NaNO₃(aq)' },
      hints:['Ag⁺+Cl⁻→AgCl↓ (branco, insolúvel). Precipitado solúvel em NH₃ mas não em HNO₃'],
      explicacao:'NaCl+AgNO₃→AgCl↓+NaNO₃  ·  Identificação de Cl⁻ por precipitação com AgNO₃',
    },
    {
      id:'nacl_forno', icon:'🔥', familia:'Eletrólise Ígnea',
      titulo:'2 NaCl →(eletr. ígnea)→ 2 Na + Cl₂',
      reagentes:['NaCl'], condicao:'eletr. ígnea 800°C',
      coefR:{'NaCl':2}, coefP:[2,1],
      produtos_visuais:['Na','Cl₂'],
      candidatos:['Na','Cl₂','NaOH','H₂','Na₂O','NaClO','HCl','Na₂S'],
      gabarito:{ produtos:['na','sodio','cl2','cloro'],
        equacaoBalanceada:'2 NaCl(l) →(eletrólise ígnea, 800°C)→ 2 Na(l) + Cl₂(g)' },
      hints:['Eletrólise ígnea: NaCl fundido. Cátodo: Na⁺+e⁻→Na. Ânodo: 2Cl⁻→Cl₂+2e⁻','Processo Down — único modo de obter Na metálico puro'],
      explicacao:'2NaCl→2Na+Cl₂  ·  Processo Down — Na metálico usado em reatores nucleares e síntese orgânica',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     CuSO₄ — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'CuSO4': [
    {
      id:'cuso4_naoh', icon:'🧪', familia:'Precipitação',
      titulo:'CuSO₄ + 2 NaOH → Cu(OH)₂↓ + Na₂SO₄',
      reagentes:['CuSO₄','NaOH'], condicao:'', coefR:{'CuSO₄':1,'NaOH':2},
      produtos_visuais:['Cu(OH)₂','Na₂SO₄'], coefP:[1,1],
      candidatos:['Cu(OH)₂','Na₂SO₄','CuO','CuCl₂','NaCl','CuCO₃','Na₂CO₃','H₂O'],
      gabarito:{ produtos:['cu(oh)2','hidroxido de cobre','na2so4','sulfato de sodio'],
        equacaoBalanceada:'CuSO₄(aq) + 2 NaOH(aq) → Cu(OH)₂↓(s) + Na₂SO₄(aq)' },
      hints:['Cu²⁺+2OH⁻→Cu(OH)₂↓ (azul intenso — Kps=2,2×10⁻²⁰)'],
      explicacao:'CuSO₄+2NaOH→Cu(OH)₂↓+Na₂SO₄  ·  Reagente de Fehling — detecta açúcares redutores',
    },
    {
      id:'cuso4_fe', icon:'⚡', familia:'Simples Troca',
      titulo:'Fe + CuSO₄ → FeSO₄ + Cu',
      reagentes:['Fe','CuSO₄'], condicao:'', coefR:{'Fe':1,'CuSO₄':1},
      produtos_visuais:['FeSO₄','Cu'], coefP:[1,1],
      candidatos:['FeSO₄','Cu','FeCl₂','CuO','CuCl₂','Fe₂O₃','FeO','CuSO₄'],
      gabarito:{ produtos:['feso4','sulfato de ferro','cu','cobre'],
        equacaoBalanceada:'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)' },
      hints:['Fe>Cu na fila de reatividade. Fe→Fe²⁺+2e⁻. Cu²⁺+2e⁻→Cu (cobre vermelho deposita)'],
      explicacao:'Fe+CuSO₄→FeSO₄+Cu  ·  Cementação — cobre metálico vermelho precipita sobre o ferro',
    },
    {
      id:'cuso4_nh3_exc', icon:'🔵', familia:'Complexação',
      titulo:'CuSO₄ + 4 NH₃ → [Cu(NH₃)₄]SO₄',
      reagentes:['CuSO₄','NH₃'], condicao:'excesso', coefR:{'CuSO₄':1,'NH₃':4},
      produtos_visuais:['[Cu(NH₃)₄]SO₄'], coefP:[1],
      candidatos:['[Cu(NH₃)₄]SO₄','Cu(OH)₂','CuO','CuCl₂','[Cu(H₂O)₄]²⁺','CuCO₃','Cu(NO₃)₂','Na₂SO₄'],
      gabarito:{ produtos:['[cu(nh3)4]so4','tetraaminocuprato','complexo de cobre'],
        equacaoBalanceada:'CuSO₄(aq) + 4 NH₃(aq) → [Cu(NH₃)₄]SO₄(aq)' },
      hints:['Em excesso de NH₃, Cu²⁺ forma complexo de coordenação azul-violeta intenso','4 NH₃ como ligantes → [Cu(NH₃)₄]²⁺ (azul de Schweizer)'],
      explicacao:'CuSO₄+4NH₃→[Cu(NH₃)₄]SO₄  ·  Azul de Schweizer — dissolve celulose! Base de fibras rayon',
    },
    {
      id:'cuso4_calor', icon:'🌡️', familia:'Decomposição',
      titulo:'CuSO₄ · 5H₂O →(Δ)→ CuSO₄ + 5 H₂O',
      /* Reagente modelado como CuSO₄ + 5H₂O para o parser funcionar */
      reagentes:['CuSO₄','H₂O'], condicao:'Δ 200°C', coefR:{'CuSO₄':1,'H₂O':5},
      produtos_visuais:['CuSO₄','H₂O'], coefP:[1,5],
      candidatos:['CuSO₄','H₂O','CuO','SO₃','Cu(OH)₂','CuSO₃','Cu₂SO₄','H₂SO₄'],
      gabarito:{ produtos:['cuso4','sulfato de cobre anidro','h2o','agua'],
        equacaoBalanceada:'CuSO₄·5H₂O(s) →(200°C)→ CuSO₄(s) + 5 H₂O(g)' },
      hints:['CuSO₄·5H₂O tem 5 moléculas de H₂O de cristalização. Aquecimento→azul vira branco','CuSO₄ anidro (branco) reabsorve umidade → azul — indicador de presença de água'],
      explicacao:'CuSO₄·5H₂O→CuSO₄+5H₂O  ·  Hidrato azul vira pó branco anidro — indicador de umidade em dessecadores',
    },
  
{
      id:'cuso4_zn', icon:'⚡', familia:'Simples Troca',
      titulo:'Zn + CuSO₄ → ZnSO₄ + Cu',
      reagentes:['Zn','CuSO₄'], condicao:'',
      coefR:{'Zn':1,'CuSO₄':1}, coefP:[1,1],
      produtos_visuais:['ZnSO₄','Cu'],
      candidatos:['ZnSO₄','Cu','ZnCl₂','CuO','CuCl₂','ZnO','ZnSO₃','CuSO₄'],
      gabarito:{ produtos:['znso4','sulfato de zinco','cu','cobre'],
        equacaoBalanceada:'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)' },
      hints:['Zn>Cu na fila. Zn→Zn²⁺+2e⁻. Cu²⁺+2e⁻→Cu (deposita vermelho sobre o zinco)'],
      explicacao:'Zn+CuSO₄→ZnSO₄+Cu  ·  Galvanoplastia — cobre vermelho deposita sobre zinco',
    },
    {
      id:'cuso4_al', icon:'⚡', familia:'Simples Troca',
      titulo:'2 Al + 3 CuSO₄ → Al₂(SO₄)₃ + 3 Cu',
      reagentes:['Al','CuSO₄'], condicao:'',
      coefR:{'Al':2,'CuSO₄':3}, coefP:[1,3],
      produtos_visuais:['Al₂(SO₄)₃','Cu'],
      candidatos:['Al₂(SO₄)₃','Cu','AlCl₃','CuO','Al(OH)₃','ZnSO₄','Al₂O₃','CuSO₄'],
      gabarito:{ produtos:['al2(so4)3','sulfato de aluminio','cu','cobre'],
        equacaoBalanceada:'2 Al(s) + 3 CuSO₄(aq) → Al₂(SO₄)₃(aq) + 3 Cu(s)' },
      hints:['Al>Zn>Fe>Cu. Al→Al³⁺+3e⁻. Cu²⁺+2e⁻→Cu. 2Al×3e⁻=6e⁻=3Cu×2e⁻ ✓'],
      explicacao:'2Al+3CuSO₄→Al₂(SO₄)₃+3Cu  ·  Al desloca Cu — aluminotermia em solução aquosa',
    },
    {
      id:'cuso4_baoh2', icon:'🔬', familia:'Precipitação',
      titulo:'CuSO₄ + Ba(OH)₂ → Cu(OH)₂↓ + BaSO₄↓',
      reagentes:['CuSO₄','Ba(OH)₂'], condicao:'',
      coefR:{'CuSO₄':1,'Ba(OH)₂':1}, coefP:[1,1],
      produtos_visuais:['Cu(OH)₂','BaSO₄'],
      candidatos:['Cu(OH)₂','BaSO₄','CuO','BaCl₂','Ba(NO₃)₂','CuSO₄','BaCO₃','CuCl₂'],
      gabarito:{ produtos:['cu(oh)2','hidroxido de cobre','baso4','sulfato de bario'],
        equacaoBalanceada:'CuSO₄(aq) + Ba(OH)₂(aq) → Cu(OH)₂↓(s) + BaSO₄↓(s)' },
      hints:['Dois precipitados simultâneos! Cu²⁺+2OH⁻→Cu(OH)₂↓ (azul). Ba²⁺+SO₄²⁻→BaSO₄↓ (branco)'],
      explicacao:'CuSO₄+Ba(OH)₂→Cu(OH)₂↓+BaSO₄↓  ·  Dupla precipitação — solução fica incolor, dois sólidos',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     AgNO₃ — 3 reações
  ════════════════════════════════════════════════════════════════ */
  'AgNO3': [
    {
      id:'agno3_nacl', icon:'🔬', familia:'Precipitação',
      titulo:'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
      reagentes:['AgNO₃','NaCl'], condicao:'', coefR:{'AgNO₃':1,'NaCl':1},
      produtos_visuais:['AgCl','NaNO₃'], coefP:[1,1],
      candidatos:['AgCl','NaNO₃','AgBr','AgI','NaBr','Ag₂SO₄','AgOH','NaCl'],
      gabarito:{ produtos:['agcl','cloreto de prata','nano3','nitrato de sodio'],
        equacaoBalanceada:'AgNO₃(aq) + NaCl(aq) → AgCl↓(s) + NaNO₃(aq)' },
      hints:['Ag⁺+Cl⁻→AgCl↓ branco (Kps=1,8×10⁻¹⁰). NO₃⁻+Na⁺ ficam em solução'],
      explicacao:'AgNO₃+NaCl→AgCl↓+NaNO₃  ·  Análise qualitativa — confirma Cl⁻ por precipitado branco',
    },
    {
      id:'agno3_nabr', icon:'🟡', familia:'Precipitação',
      titulo:'AgNO₃ + NaBr → AgBr↓ + NaNO₃',
      reagentes:['AgNO₃','NaBr'], condicao:'', coefR:{'AgNO₃':1,'NaBr':1},
      produtos_visuais:['AgBr','NaNO₃'], coefP:[1,1],
      candidatos:['AgBr','NaNO₃','AgCl','AgI','NaCl','Ag₂SO₄','AgOH','NaI'],
      gabarito:{ produtos:['agbr','brometo de prata','nano3','nitrato de sodio'],
        equacaoBalanceada:'AgNO₃(aq) + NaBr(aq) → AgBr↓(s) + NaNO₃(aq)' },
      hints:['Ag⁺+Br⁻→AgBr↓ amarelo-pálido (Kps=5,4×10⁻¹³ — menos solúvel que AgCl)'],
      explicacao:'AgNO₃+NaBr→AgBr↓+NaNO₃  ·  AgBr era a base da fotografia analógica — sensível à luz',
    },
    {
      id:'agno3_cu', icon:'⚡', familia:'Simples Troca',
      titulo:'2 AgNO₃ + Cu → Cu(NO₃)₂ + 2 Ag',
      reagentes:['AgNO₃','Cu'], condicao:'', coefR:{'AgNO₃':2,'Cu':1},
      produtos_visuais:['Cu(NO₃)₂','Ag'], coefP:[1,2],
      candidatos:['Cu(NO₃)₂','Ag','AgCl','CuO','CuSO₄','Cu₂O','AgNO₃','CuCl₂'],
      gabarito:{ produtos:['cu(no3)2','nitrato de cobre','ag','prata'],
        equacaoBalanceada:'2 AgNO₃(aq) + Cu(s) → Cu(NO₃)₂(aq) + 2 Ag(s)' },
      hints:['Cu>Ag na fila de reatividade. Cu→Cu²⁺+2e⁻. 2Ag⁺+2e⁻→2Ag (cristais brancos)'],
      explicacao:'2AgNO₃+Cu→Cu(NO₃)₂+2Ag  ·  Prata metálica cristaliza sobre o cobre — demonstração clássica de reatividade',
    },
  
{
      id:'agno3_fotolise', icon:'☀️', familia:'Fotólise',
      titulo:'2 AgNO₃ →(hν)→ 2 Ag + 2 NO₂ + O₂',
      reagentes:['AgNO₃'], condicao:'luz UV (hν)',
      coefR:{'AgNO₃':2}, coefP:[2,2,1],
      produtos_visuais:['Ag','NO₂','O₂'],
      candidatos:['Ag','NO₂','O₂','AgCl','Ag₂O','NO','AgNO₂','N₂O₄'],
      gabarito:{ produtos:['ag','prata','no2','dioxido de nitrogenio','o2','oxigenio'],
        equacaoBalanceada:'2 AgNO₃(s) →(hν)→ 2 Ag(s) + 2 NO₂(g) + O₂(g)' },
      hints:['Luz decompõe AgNO₃. Ag⁺+e⁻→Ag⁰. NO₃⁻ perde O→NO₂. Por isso AgNO₃ fica preto ao sol'],
      explicacao:'2AgNO₃→2Ag+2NO₂+O₂  ·  Por isso AgNO₃ deve ser guardado em frasco escuro — mancha pele de preto (argentismo)',
    },
    {
      id:'agno3_naoh', icon:'🔬', familia:'Precipitação',
      titulo:'AgNO₃ + NaOH → AgOH↓ + NaNO₃',
      reagentes:['AgNO₃','NaOH'], condicao:'',
      coefR:{'AgNO₃':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['AgOH','NaNO₃'],
      candidatos:['AgOH','NaNO₃','Ag₂O','AgCl','NaCl','Ag','NaOH','AgNO₂'],
      gabarito:{ produtos:['agoh','hidroxido de prata','nano3','nitrato de sodio'],
        equacaoBalanceada:'AgNO₃(aq) + NaOH(aq) → AgOH↓(s) + NaNO₃(aq)' },
      hints:['Ag⁺+OH⁻→AgOH↓ (amarelo-pálido, instável). Logo se decompõe: 2AgOH→Ag₂O+H₂O'],
      explicacao:'AgNO₃+NaOH→AgOH↓+NaNO₃  ·  AgOH instável — rapidamente vira Ag₂O marrom-escuro',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     CaO — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'CaO': [
    {
      id:'cao_h2o', icon:'🔥', familia:'Síntese / Adição',
      titulo:'CaO + H₂O → Ca(OH)₂',
      reagentes:['CaO','H₂O'], condicao:'', coefR:{'CaO':1,'H₂O':1},
      produtos_visuais:['Ca(OH)₂'], coefP:[1],
      candidatos:['Ca(OH)₂','CaCO₃','CaO','CO₂','CaCl₂','H₂','HCl','CaSO₄'],
      gabarito:{ produtos:['ca(oh)2','hidroxido de calcio','cal hidratada'],
        equacaoBalanceada:'CaO(s) + H₂O(l) → Ca(OH)₂(s)' },
      hints:['O²⁻ do CaO captura 2H⁺ da água. O²⁻+H₂O→2OH⁻. Ca²⁺+2OH⁻→Ca(OH)₂'],
      explicacao:'CaO+H₂O→Ca(OH)₂  ·  ΔH=−63,7kJ/mol — reação tão exotérmica que ferve a solução',
    },
    {
      id:'cao_h2so4', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'CaO + H₂SO₄ → CaSO₄ + H₂O',
      reagentes:['CaO','H₂SO₄'], condicao:'', coefR:{'CaO':1,'H₂SO₄':1},
      produtos_visuais:['CaSO₄','H₂O'], coefP:[1,1],
      candidatos:['CaSO₄','H₂O','Ca(OH)₂','CaCl₂','CaCO₃','CaO','Na₂SO₄','Ca(NO₃)₂'],
      gabarito:{ produtos:['caso4','sulfato de calcio','h2o','agua'],
        equacaoBalanceada:'CaO(s) + H₂SO₄(aq) → CaSO₄(s) + H₂O(l)' },
      hints:['Óxido básico + ácido → sal + água. Ca²⁺+SO₄²⁻→CaSO₄ (gesso — muito pouco solúvel)'],
      explicacao:'CaO+H₂SO₄→CaSO₄+H₂O  ·  Óxido básico neutraliza ácido — CaSO₄ (gesso) incrusta tubulações',
    },
    {
      id:'cao_co2', icon:'🌫️', familia:'Síntese',
      titulo:'CaO + CO₂ → CaCO₃',
      reagentes:['CaO','CO₂'], condicao:'', coefR:{'CaO':1,'CO₂':1},
      produtos_visuais:['CaCO₃'], coefP:[1],
      candidatos:['CaCO₃','Ca(OH)₂','CaO','CaSO₄','CaCl₂','CO','CaC₂','Ca(HCO₃)₂'],
      gabarito:{ produtos:['caco3','carbonato de calcio'],
        equacaoBalanceada:'CaO(s) + CO₂(g) → CaCO₃(s)' },
      hints:['Óxido básico + óxido ácido → sal. CaO+CO₂: O²⁻+CO₂→CO₃²⁻. Ca²⁺+CO₃²⁻→CaCO₃'],
      explicacao:'CaO+CO₂→CaCO₃  ·  Reação inversa da calcinação — morteiro de cal endurece absorvendo CO₂ do ar',
    },
    {
      id:'cao_c', icon:'🔥', familia:'Síntese (Alta Temperatura)',
      titulo:'CaO + 3 C → CaC₂ + CO',
      reagentes:['CaO','C'], condicao:'Δ 2000°C', coefR:{'CaO':1,'C':3},
      produtos_visuais:['CaC₂','CO'], coefP:[1,1],
      candidatos:['CaC₂','CO','CO₂','CaCO₃','Ca(OH)₂','CaO','CH₄','C₂H₂'],
      gabarito:{ produtos:['cac2','carbeto de calcio','co','monoxido de carbono'],
        equacaoBalanceada:'CaO(s) + 3 C(s) →(2000°C)→ CaC₂(s) + CO(g)' },
      hints:['2000°C em forno elétrico. CaO é reduzido pelo C. C oxida para CO (não CO₂)','CaC₂+H₂O→C₂H₂ (acetileno) — solda oxiacetilênica'],
      explicacao:'CaO+3C→CaC₂+CO  ·  CaC₂ (carbeto de cálcio) + H₂O → acetileno C₂H₂ — solda oxiacetilênica',
    },
  
{
      id:'cao_n2o5', icon:'🔥', familia:'Síntese',
      titulo:'CaO + N₂O₅ → Ca(NO₃)₂',
      reagentes:['CaO','N₂O₅'], condicao:'',
      coefR:{'CaO':1,'N₂O₅':1}, coefP:[1],
      produtos_visuais:['Ca(NO₃)₂'],
      candidatos:['Ca(NO₃)₂','CaCO₃','Ca(OH)₂','CaSO₄','CaO','CaCl₂','Ca(NO₂)₂','CaO₂'],
      gabarito:{ produtos:['ca(no3)2','nitrato de calcio'],
        equacaoBalanceada:'CaO(s) + N₂O₅(g) → Ca(NO₃)₂(s)' },
      hints:['Óxido básico + óxido ácido → sal (sem água). N₂O₅ = anidrido nítrico (≡ HNO₃)'],
      explicacao:'CaO+N₂O₅→Ca(NO₃)₂  ·  Reação óxido-óxido — Ca(NO₃)₂ é fertilizante nitrocalcário',
    },
    {
      id:'cao_so2', icon:'🏭', familia:'Síntese (Ambiental)',
      titulo:'CaO + SO₂ → CaSO₃',
      reagentes:['CaO','SO₂'], condicao:'',
      coefR:{'CaO':1,'SO₂':1}, coefP:[1],
      produtos_visuais:['CaSO₃'],
      candidatos:['CaSO₃','CaSO₄','CaCO₃','CaO','Ca(OH)₂','CaCl₂','SO₃','CaS'],
      gabarito:{ produtos:['caso3','sulfito de calcio'],
        equacaoBalanceada:'CaO(s) + SO₂(g) → CaSO₃(s)' },
      hints:['Óxido básico+óxido ácido→sal. CaO captura SO₂ (poluente). CaSO₃ pode oxidar a CaSO₄'],
      explicacao:'CaO+SO₂→CaSO₃  ·  Dessulfurização de gases de usinas — CaO captura SO₂ antes de sair pela chaminé',
    },
    {
      id:'cao_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'CaO + 2 HCl → CaCl₂ + H₂O',
      reagentes:['CaO','HCl'], condicao:'',
      coefR:{'CaO':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['CaCl₂','H₂O'],
      candidatos:['CaCl₂','H₂O','CaSO₄','Ca(OH)₂','CaCO₃','CaO','NaCl','MgCl₂'],
      gabarito:{ produtos:['cacl2','cloreto de calcio','h2o','agua'],
        equacaoBalanceada:'CaO(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l)' },
      hints:['Óxido básico + ácido → sal + água. O²⁻+2H⁺→H₂O. Ca²⁺+2Cl⁻→CaCl₂'],
      explicacao:'CaO+2HCl→CaCl₂+H₂O  ·  CaCl₂ é dessecante e anti-gelo — óxido básico neutraliza ácido',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     CO₂ — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'CO2': [
    {
      id:'co2_naoh_total', icon:'⚗️', familia:'Síntese',
      titulo:'CO₂ + 2 NaOH → Na₂CO₃ + H₂O',
      reagentes:['CO₂','NaOH'], condicao:'excesso base', coefR:{'CO₂':1,'NaOH':2},
      produtos_visuais:['Na₂CO₃','H₂O'], coefP:[1,1],
      candidatos:['Na₂CO₃','H₂O','NaHCO₃','NaCl','Na₂O','NaNO₃','Na₂SO₄','CO₂'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua'],
        equacaoBalanceada:'CO₂(g) + 2 NaOH(aq) → Na₂CO₃(aq) + H₂O(l)' },
      hints:['CO₂+H₂O→H₂CO₃ (instável). H₂CO₃+2NaOH→Na₂CO₃+2H₂O. Em excesso de NaOH→carbonato'],
      explicacao:'CO₂+2NaOH→Na₂CO₃+H₂O  ·  Carbonatação total — base do processo Solvay de Na₂CO₃',
    },
    {
      id:'co2_naoh_parcial', icon:'⚗️', familia:'Síntese Parcial',
      titulo:'CO₂ + NaOH → NaHCO₃',
      reagentes:['CO₂','NaOH'], condicao:'1:1', coefR:{'CO₂':1,'NaOH':1},
      produtos_visuais:['NaHCO₃'], coefP:[1],
      candidatos:['NaHCO₃','Na₂CO₃','NaCl','NaOH','Na₂O','CO₂','H₂CO₃','NaNO₃'],
      gabarito:{ produtos:['nahco3','bicarbonato de sodio'],
        equacaoBalanceada:'CO₂(g) + NaOH(aq) → NaHCO₃(aq)' },
      hints:['Com NaOH limitado (1:1): apenas 1 H⁺ é neutralizado → bicarbonato'],
      explicacao:'CO₂+NaOH→NaHCO₃  ·  Bicarbonato de sódio (fermento em pó) — formado com NaOH limitado',
    },
    {
      id:'co2_caoh2', icon:'🔬', familia:'Teste Analítico',
      titulo:'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O',
      reagentes:['CO₂','Ca(OH)₂'], condicao:'', coefR:{'CO₂':1,'Ca(OH)₂':1},
      produtos_visuais:['CaCO₃','H₂O'], coefP:[1,1],
      candidatos:['CaCO₃','H₂O','CaO','Ca(HCO₃)₂','CaSO₄','Na₂CO₃','CaCl₂','CO₂'],
      gabarito:{ produtos:['caco3','carbonato de calcio','h2o','agua'],
        equacaoBalanceada:'CO₂(g) + Ca(OH)₂(aq) → CaCO₃↓(s) + H₂O(l)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓. CO₂+2OH⁻→CO₃²⁻+H₂O. Água turva = CO₂ presente'],
      explicacao:'CO₂+Ca(OH)₂→CaCO₃↓+H₂O  ·  Água de cal turva — teste clássico de CO₂ em laboratório',
    },
    {
      id:'co2_h2o', icon:'🌧️', familia:'Síntese',
      titulo:'CO₂ + H₂O → H₂CO₃',
      reagentes:['CO₂','H₂O'], condicao:'', coefR:{'CO₂':1,'H₂O':1},
      produtos_visuais:['H₂CO₃'], coefP:[1],
      candidatos:['H₂CO₃','H₂SO₄','HNO₃','CO','H₂O','NaHCO₃','CaCO₃','HCl'],
      gabarito:{ produtos:['h2co3','acido carbonico','ácido carbônico'],
        equacaoBalanceada:'CO₂(g) + H₂O(l) ⇌ H₂CO₃(aq)' },
      hints:['CO₂ dissolve em água formando ácido fraco instável. CO₂+H₂O⇌H₂CO₃'],
      explicacao:'CO₂+H₂O⇌H₂CO₃  ·  Equilíbrio que dá acidez às chuvas naturais (pH 5,6) e refrigerantes',
    },
  
{
      id:'co2_c', icon:'🔥', familia:'Oxirredução',
      titulo:'CO₂ + C → 2 CO',
      reagentes:['CO₂','C'], condicao:'Δ 700°C',
      coefR:{'CO₂':1,'C':1}, coefP:[2],
      produtos_visuais:['CO'],
      candidatos:['CO','CO₂','C','CH₄','CaCO₃','Na₂CO₃','CaO','C₂H₂'],
      gabarito:{ produtos:['co','monoxido de carbono'],
        equacaoBalanceada:'CO₂(g) + C(s) →(700°C)→ 2 CO(g)' },
      hints:['C é reduzido em CO₂: C⁰+CO₂→2CO. C⁰ oxida de 0→+2. CO é gás do alto-forno'],
      explicacao:'CO₂+C→2CO  ·  Reação de Boudouard — gás de alto-forno; CO é o agente redutor principal',
    },
    {
      id:'co2_mg', icon:'🔥', familia:'Oxirredução',
      titulo:'2 Mg + CO₂ → 2 MgO + C',
      reagentes:['Mg','CO₂'], condicao:'Δ',
      coefR:{'Mg':2,'CO₂':1}, coefP:[2,1],
      produtos_visuais:['MgO','C'],
      candidatos:['MgO','C','MgCO₃','Mg(OH)₂','MgSO₄','CO','Mg₂C','MgC₂'],
      gabarito:{ produtos:['mgo','oxido de magnesio','c','carbono'],
        equacaoBalanceada:'2 Mg(s) + CO₂(g) → 2 MgO(s) + C(s)' },
      hints:['Mg é tão reativo que queima em CO₂! Mg→Mg²⁺ (oxidado). C⁺⁴→C⁰ (reduzido)','NUNCA apagar fogo de Mg com CO₂'],
      explicacao:'2Mg+CO₂→2MgO+C  ·  Mg é tão reativo que queima em CO₂! Jamais use extintor de CO₂ em fogo de Mg',
    },
    {
      id:'co2_k2o', icon:'🔥', familia:'Síntese',
      titulo:'CO₂ + K₂O → K₂CO₃',
      reagentes:['CO₂','K₂O'], condicao:'',
      coefR:{'CO₂':1,'K₂O':1}, coefP:[1],
      produtos_visuais:['K₂CO₃'],
      candidatos:['K₂CO₃','KHCO₃','KOH','K₂O','KNO₃','K₂SO₄','K₂O₂','KCl'],
      gabarito:{ produtos:['k2co3','carbonato de potassio'],
        equacaoBalanceada:'CO₂(g) + K₂O(s) → K₂CO₃(s)' },
      hints:['Óxido ácido+óxido básico→sal. CO₂+K₂O: sem água na reação óxido-óxido'],
      explicacao:'CO₂+K₂O→K₂CO₃  ·  K₂CO₃ (potassa) — fertilizante e base de sabões de potássio (sabão mole)',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     Fe₂O₃ — 4 reações
  ════════════════════════════════════════════════════════════════ */
  'Fe2O3': [
    {
      id:'fe2o3_h2so4', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Fe₂O₃ + 3 H₂SO₄ → Fe₂(SO₄)₃ + 3 H₂O',
      reagentes:['Fe₂O₃','H₂SO₄'], condicao:'', coefR:{'Fe₂O₃':1,'H₂SO₄':3},
      produtos_visuais:['Fe₂(SO₄)₃','H₂O'], coefP:[1,3],
      candidatos:['Fe₂(SO₄)₃','H₂O','FeSO₄','Fe(OH)₃','FeCl₃','FeO','CaSO₄','Fe₂O₃'],
      gabarito:{ produtos:['fe2(so4)3','sulfato de ferro iii','h2o','agua'],
        equacaoBalanceada:'Fe₂O₃(s) + 3 H₂SO₄(aq) → Fe₂(SO₄)₃(aq) + 3 H₂O(l)' },
      hints:['Óxido básico+ácido→sal+água. 2Fe³⁺ precisam de 3SO₄²⁻ para ficar neutro'],
      explicacao:'Fe₂O₃+3H₂SO₄→Fe₂(SO₄)₃+3H₂O  ·  Dissolução de ferrugem em ácido sulfúrico — decapagem de aço',
    },
    {
      id:'fe2o3_al', icon:'🔥', familia:'Oxirredução (Termoita)',
      titulo:'Fe₂O₃ + 2 Al → Al₂O₃ + 2 Fe',
      reagentes:['Fe₂O₃','Al'], condicao:'Δ ignição', coefR:{'Fe₂O₃':1,'Al':2},
      produtos_visuais:['Al₂O₃','Fe'], coefP:[1,2],
      candidatos:['Al₂O₃','Fe','FeO','Fe₃O₄','AlCl₃','Al(OH)₃','Fe₂O₃','Al₂S₃'],
      gabarito:{ produtos:['al2o3','oxido de aluminio','fe','ferro'],
        equacaoBalanceada:'Fe₂O₃(s) + 2 Al(s) →(ignição)→ Al₂O₃(s) + 2 Fe(l)' },
      hints:['Al>Fe na reatividade (elipotência). Al é oxidado, Fe³⁺ é reduzido','ΔH=−852kJ/mol. T≈2500°C — ferro fundido escorre'],
      explicacao:'Fe₂O₃+2Al→Al₂O₃+2Fe  ·  Reação termoita — 2500°C, usada para soldar trilhos in loco',
    },
    {
      id:'fe2o3_co', icon:'🏭', familia:'Oxirredução (Alto-Forno)',
      titulo:'Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂',
      reagentes:['Fe₂O₃','CO'], condicao:'Δ alto-forno', coefR:{'Fe₂O₃':1,'CO':3},
      produtos_visuais:['Fe','CO₂'], coefP:[2,3],
      candidatos:['Fe','CO₂','FeO','Fe₃O₄','CO','CaCO₃','Fe(CO)₅','C'],
      gabarito:{ produtos:['fe','ferro','co2','dioxido de carbono'],
        equacaoBalanceada:'Fe₂O₃(s) + 3 CO(g) →(1500°C)→ 2 Fe(l) + 3 CO₂(g)' },
      hints:['CO é o agente redutor: C⁺²→C⁺⁴ (CO→CO₂). Fe³⁺→Fe⁰ (reduzido)','Principal reação do alto-forno — produção de ferro-gusa'],
      explicacao:'Fe₂O₃+3CO→2Fe+3CO₂  ·  Alto-forno — principal processo de produção de aço no mundo',
    },
    {
      id:'fe2o3_h2', icon:'⚡', familia:'Oxirredução',
      titulo:'Fe₂O₃ + 3 H₂ → 2 Fe + 3 H₂O',
      reagentes:['Fe₂O₃','H₂'], condicao:'Δ 500°C', coefR:{'Fe₂O₃':1,'H₂':3},
      produtos_visuais:['Fe','H₂O'], coefP:[2,3],
      candidatos:['Fe','H₂O','FeO','Fe₃O₄','H₂O₂','Fe(OH)₂','CO₂','Fe₂O₃'],
      gabarito:{ produtos:['fe','ferro','h2o','agua'],
        equacaoBalanceada:'Fe₂O₃(s) + 3 H₂(g) →(500°C)→ 2 Fe(s) + 3 H₂O(g)' },
      hints:['H₂ é agente redutor: H₂→H⁺. Fe³⁺+3e⁻→Fe⁰. Balanceie e⁻: 2Fe×3e⁻=6e⁻=3H₂×2e⁻'],
      explicacao:'Fe₂O₃+3H₂→2Fe+3H₂O  ·  Redução direta com H₂ — processo limpo de produção de ferro verde',
    },
  
{
      id:'fe2o3_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Fe₂O₃ + 6 HCl → 2 FeCl₃ + 3 H₂O',
      reagentes:['Fe₂O₃','HCl'], condicao:'',
      coefR:{'Fe₂O₃':1,'HCl':6}, coefP:[2,3],
      produtos_visuais:['FeCl₃','H₂O'],
      candidatos:['FeCl₃','H₂O','FeCl₂','FeO','FeSO₄','Fe(OH)₃','Fe₂O₃','NaCl'],
      gabarito:{ produtos:['fecl3','cloreto de ferro iii','h2o','agua'],
        equacaoBalanceada:'Fe₂O₃(s) + 6 HCl(aq) → 2 FeCl₃(aq) + 3 H₂O(l)' },
      hints:['Óxido básico+ácido→sal+água. 2Fe³⁺ precisam de 6Cl⁻. 6HCl→6H⁺+6Cl⁻'],
      explicacao:'Fe₂O₃+6HCl→2FeCl₃+3H₂O  ·  FeCl₃ é coagulante de água e gravura em cobre (PCBs)',
    },
    {
      id:'fe2o3_hno3', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Fe₂O₃ + 6 HNO₃ → 2 Fe(NO₃)₃ + 3 H₂O',
      reagentes:['Fe₂O₃','HNO₃'], condicao:'',
      coefR:{'Fe₂O₃':1,'HNO₃':6}, coefP:[2,3],
      produtos_visuais:['Fe(NO₃)₃','H₂O'],
      candidatos:['Fe(NO₃)₃','H₂O','Fe(NO₃)₂','FeO','FeSO₄','Fe(OH)₃','Fe₂(SO₄)₃','NaNO₃'],
      gabarito:{ produtos:['fe(no3)3','nitrato de ferro iii','h2o','agua'],
        equacaoBalanceada:'Fe₂O₃(s) + 6 HNO₃(aq) → 2 Fe(NO₃)₃(aq) + 3 H₂O(l)' },
      hints:['Mesmo padrão: óxido+ácido→sal+água. 2Fe³⁺ com 6NO₃⁻. 6HNO₃→6H⁺+6NO₃⁻'],
      explicacao:'Fe₂O₃+6HNO₃→2Fe(NO₃)₃+3H₂O  ·  Síntese de Fe(NO₃)₃ — catalisador e oxidante em laboratório',
    },
    {
      id:'fe2o3_c', icon:'🏭', familia:'Oxirredução',
      titulo:'2 Fe₂O₃ + 3 C → 4 Fe + 3 CO₂',
      reagentes:['Fe₂O₃','C'], condicao:'Δ 1500°C',
      coefR:{'Fe₂O₃':2,'C':3}, coefP:[4,3],
      produtos_visuais:['Fe','CO₂'],
      candidatos:['Fe','CO₂','FeO','CO','Fe₃O₄','CaCO₃','Fe(CO)₅','C'],
      gabarito:{ produtos:['fe','ferro','co2','dioxido de carbono'],
        equacaoBalanceada:'2 Fe₂O₃(s) + 3 C(s) →(1500°C)→ 4 Fe(l) + 3 CO₂(g)' },
      hints:['C⁰→C⁺⁴(CO₂): oxidado. Fe³⁺→Fe⁰: reduzido. 4Fe×3e⁻=12e⁻=3C×4e⁻ ✓'],
      explicacao:'2Fe₂O₃+3C→4Fe+3CO₂  ·  Redução direta do minério pelo coque — pré-história da metalurgia',
    },
  ],

  /* ════════════════════════════════════════════════════════════════
     SO₃ — 3 reações
  ════════════════════════════════════════════════════════════════ */
  'SO3': [
    {
      id:'so3_h2o', icon:'🌧️', familia:'Síntese',
      titulo:'SO₃ + H₂O → H₂SO₄',
      reagentes:['SO₃','H₂O'], condicao:'', coefR:{'SO₃':1,'H₂O':1},
      produtos_visuais:['H₂SO₄'], coefP:[1],
      candidatos:['H₂SO₄','H₂SO₃','SO₂','HNO₃','H₂O','Na₂SO₄','H₂S','H₃PO₄'],
      gabarito:{ produtos:['h2so4','acido sulfurico'],
        equacaoBalanceada:'SO₃(g) + H₂O(l) → H₂SO₄(aq)' },
      hints:['Óxido ácido+água→ácido. SO₃+H₂O→H₂SO₄ (ΔH=−130kJ/mol)'],
      explicacao:'SO₃+H₂O→H₂SO₄  ·  Etapa final do processo de contato — produção industrial de H₂SO₄',
    },
    {
      id:'so3_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'SO₃ + 2 NaOH → Na₂SO₄ + H₂O',
      reagentes:['SO₃','NaOH'], condicao:'', coefR:{'SO₃':1,'NaOH':2},
      produtos_visuais:['Na₂SO₄','H₂O'], coefP:[1,1],
      candidatos:['Na₂SO₄','H₂O','NaHSO₄','NaHSO₃','NaCl','Na₂CO₃','CaSO₄','Na₂SO₃'],
      gabarito:{ produtos:['na2so4','sulfato de sodio','h2o','agua'],
        equacaoBalanceada:'SO₃(g) + 2 NaOH(aq) → Na₂SO₄(aq) + H₂O(l)' },
      hints:['Óxido ácido+base → sal+água. SO₃≡H₂SO₄ (anidrido). 2NaOH para SO₄²⁻'],
      explicacao:'SO₃+2NaOH→Na₂SO₄+H₂O  ·  Na₂SO₄ (sulfato de sódio) — usado em detergentes e vidro',
    },
    {
      id:'so3_cao', icon:'🔥', familia:'Síntese',
      titulo:'SO₃ + CaO → CaSO₄',
      reagentes:['SO₃','CaO'], condicao:'', coefR:{'SO₃':1,'CaO':1},
      produtos_visuais:['CaSO₄'], coefP:[1],
      candidatos:['CaSO₄','CaSO₃','CaCO₃','CaO','Ca(OH)₂','Na₂SO₄','CaCl₂','SO₂'],
      gabarito:{ produtos:['caso4','sulfato de calcio'],
        equacaoBalanceada:'SO₃(g) + CaO(s) → CaSO₄(s)' },
      hints:['Óxido ácido+óxido básico → sal (sem água). SO₃ é anidrido de H₂SO₄; CaO é anidrido de Ca(OH)₂'],
      explicacao:'SO₃+CaO→CaSO₄  ·  Reação óxido-óxido — dessulfurização industrial de gases de combustão',
    },
  
{
      id:'so3_so2_o2', icon:'🏭', familia:'Síntese Industrial',
      titulo:'2 SO₂ + O₂ ⇌ 2 SO₃',
      reagentes:['SO₂','O₂'], condicao:'V₂O₅, 450°C',
      coefR:{'SO₂':2,'O₂':1}, coefP:[2],
      produtos_visuais:['SO₃'],
      candidatos:['SO₃','SO₂','S','SO₄²⁻','H₂SO₄','CaSO₄','Na₂SO₄','SO₂Cl₂'],
      gabarito:{ produtos:['so3','trioxido de enxofre'],
        equacaoBalanceada:'2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g)' },
      hints:['Processo de contato: catalisador V₂O₅. Equilíbrio favorecido por baixa T e alta P'],
      explicacao:'2SO₂+O₂⇌2SO₃  ·  Etapa central do processo de contato — ΔH=−197kJ/mol',
    },
    {
      id:'so3_h2so4_oleum', icon:'⚡', familia:'Síntese',
      titulo:'SO₃ + H₂SO₄ → H₂S₂O₇',
      reagentes:['SO₃','H₂SO₄'], condicao:'',
      coefR:{'SO₃':1,'H₂SO₄':1}, coefP:[1],
      produtos_visuais:['H₂S₂O₇'],
      candidatos:['H₂S₂O₇','H₂SO₄','SO₃','H₂SO₃','HSO₄⁻','Na₂S₂O₇','CaSO₄','H₂S₂O₈'],
      gabarito:{ produtos:['h2s2o7','oleum','acido piroassulfurico'],
        equacaoBalanceada:'SO₃(g) + H₂SO₄(l) → H₂S₂O₇(l)' },
      hints:['H₂SO₄ absorve SO₃ → oleum (ácido fumegante). H₂S₂O₇ + H₂O → 2H₂SO₄'],
      explicacao:'SO₃+H₂SO₄→H₂S₂O₇  ·  Oleum (ácido fumegante) — industrialmente mais eficiente que absorver SO₃ em água direta',
    },
    {
      id:'so3_mgo', icon:'🔥', familia:'Síntese',
      titulo:'SO₃ + MgO → MgSO₄',
      reagentes:['SO₃','MgO'], condicao:'',
      coefR:{'SO₃':1,'MgO':1}, coefP:[1],
      produtos_visuais:['MgSO₄'],
      candidatos:['MgSO₄','MgSO₃','MgO','Mg(OH)₂','MgCl₂','CaSO₄','Na₂SO₄','MgCO₃'],
      gabarito:{ produtos:['mgso4','sulfato de magnesio'],
        equacaoBalanceada:'SO₃(g) + MgO(s) → MgSO₄(s)' },
      hints:['Óxido ácido+óxido básico→sal (sem água). MgSO₄ = sal de Epsom (7H₂O)'],
      explicacao:'SO₃+MgO→MgSO₄  ·  MgSO₄·7H₂O (sal de Epsom) — laxante, banhos relaxantes, nutrição vegetal',
    },
  ],

};


/* Reações dos novos compostos — adicionadas ao banco REACOES_LIVRES */
(function(){
  var extras = {

  /* ── H₃PO₄ — 5 reações ──────────────────────────────────── */
  'H3PO4': [
    {
      id:'h3po4_naoh3', icon:'⚗️', familia:'Neutralização Total',
      titulo:'H₃PO₄ + 3 NaOH → Na₃PO₄ + 3 H₂O',
      reagentes:['H₃PO₄','NaOH'], condicao:'', coefR:{'H₃PO₄':1,'NaOH':3}, coefP:[1,3],
      produtos_visuais:['Na₃PO₄','H₂O'],
      candidatos:['Na₃PO₄','H₂O','Na₂HPO₄','NaH₂PO₄','Na₂SO₄','NaCl','NaHCO₃','Na₃PO₃'],
      gabarito:{ produtos:['na3po4','fosfato de sodio','h2o','agua'],
        equacaoBalanceada:'H₃PO₄(aq) + 3 NaOH(aq) → Na₃PO₄(aq) + 3 H₂O(l)' },
      hints:['H₃PO₄ é triprótico. 3 NaOH para neutralizar todos os H⁺. PO₄³⁻+3Na⁺→Na₃PO₄'],
      explicacao:'H₃PO₄+3NaOH→Na₃PO₄+3H₂O  ·  Na₃PO₄ (fosfato trisódico) — detergente industrial e sequestrante',
    },
    {
      id:'h3po4_naoh1', icon:'⚗️', familia:'Neutralização Parcial (1ª etapa)',
      titulo:'H₃PO₄ + NaOH → NaH₂PO₄ + H₂O',
      reagentes:['H₃PO₄','NaOH'], condicao:'1:1', coefR:{'H₃PO₄':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaH₂PO₄','H₂O'],
      candidatos:['NaH₂PO₄','H₂O','Na₂HPO₄','Na₃PO₄','NaCl','Na₂SO₄','NaHCO₃','NaHSO₄'],
      gabarito:{ produtos:['nah2po4','dihidrogeno fosfato de sodio','h2o','agua'],
        equacaoBalanceada:'H₃PO₄(aq) + NaOH(aq) → NaH₂PO₄(aq) + H₂O(l)' },
      hints:['Apenas 1 H⁺ neutralizado. Produto é o sal ácido NaH₂PO₄ (2 H ainda ionizáveis)'],
      explicacao:'H₃PO₄+NaOH→NaH₂PO₄+H₂O  ·  NaH₂PO₄ (fosfato monossódico) — tampão fisiológico e aditivo alimentar E339',
    },
    {
      id:'h3po4_naoh2', icon:'⚗️', familia:'Neutralização Parcial (2ª etapa)',
      titulo:'H₃PO₄ + 2 NaOH → Na₂HPO₄ + 2 H₂O',
      reagentes:['H₃PO₄','NaOH'], condicao:'1:2', coefR:{'H₃PO₄':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Na₂HPO₄','H₂O'],
      candidatos:['Na₂HPO₄','H₂O','Na₃PO₄','NaH₂PO₄','Na₂SO₄','NaCl','Na₂CO₃','Na₂HPO₃'],
      gabarito:{ produtos:['na2hpo4','hidrogenofosfato de sodio','h2o','agua'],
        equacaoBalanceada:'H₃PO₄(aq) + 2 NaOH(aq) → Na₂HPO₄(aq) + 2 H₂O(l)' },
      hints:['2 dos 3 H⁺ neutralizados. Produto tem ainda 1 H ionizável: Na₂HPO₄'],
      explicacao:'H₃PO₄+2NaOH→Na₂HPO₄+2H₂O  ·  Na₂HPO₄ — tampão urinário e aditivo em alimentos processados E339(ii)',
    },
    {
      id:'h3po4_caoh2', icon:'🔬', familia:'Precipitação',
      titulo:'2 H₃PO₄ + 3 Ca(OH)₂ → Ca₃(PO₄)₂↓ + 6 H₂O',
      reagentes:['H₃PO₄','Ca(OH)₂'], condicao:'', coefR:{'H₃PO₄':2,'Ca(OH)₂':3}, coefP:[1,6],
      produtos_visuais:['Ca₃(PO₄)₂','H₂O'],
      candidatos:['Ca₃(PO₄)₂','H₂O','CaSO₄','CaHPO₄','Ca(H₂PO₄)₂','CaCO₃','CaCl₂','Ca(OH)₂'],
      gabarito:{ produtos:['ca3(po4)2','fosfato de calcio','h2o','agua'],
        equacaoBalanceada:'2 H₃PO₄(aq) + 3 Ca(OH)₂(aq) → Ca₃(PO₄)₂↓(s) + 6 H₂O(l)' },
      hints:['Ca²⁺+PO₄³⁻→Ca₃(PO₄)₂↓ (insolúvel — base dos ossos!). 3 Ca²⁺ para 2 PO₄³⁻'],
      explicacao:'2H₃PO₄+3Ca(OH)₂→Ca₃(PO₄)₂↓+6H₂O  ·  Ca₃(PO₄)₂ é o mineral dos ossos e dentes (hidroxiapatita)',
    },
    {
      id:'h3po4_zn', icon:'⚡', familia:'Simples Troca',
      titulo:'2 H₃PO₄ + 3 Zn → Zn₃(PO₄)₂ + 3 H₂',
      reagentes:['H₃PO₄','Zn'], condicao:'', coefR:{'H₃PO₄':2,'Zn':3}, coefP:[1,3],
      produtos_visuais:['Zn₃(PO₄)₂','H₂'],
      candidatos:['Zn₃(PO₄)₂','H₂','ZnO','ZnCl₂','ZnSO₄','ZnCO₃','Zn(OH)₂','H₂O'],
      gabarito:{ produtos:['zn3(po4)2','fosfato de zinco','h2','hidrogenio'],
        equacaoBalanceada:'2 H₃PO₄(aq) + 3 Zn(s) → Zn₃(PO₄)₂(s) + 3 H₂(g)' },
      hints:['Zn>H. Zn→Zn²⁺+2e⁻. 3Zn×2e⁻=6e⁻=3H₂×2e⁻. 2PO₄³⁻+3Zn²⁺→Zn₃(PO₄)₂'],
      explicacao:'2H₃PO₄+3Zn→Zn₃(PO₄)₂+3H₂  ·  Zn₃(PO₄)₂ = primer anticorrosivo de aço — base de tintas protetoras',
    },
  ],

  /* ── KOH — 5 reações ─────────────────────────────────────── */
  'KOH': [
    {
      id:'koh_hcl', icon:'⚗️', familia:'Neutralização',
      titulo:'KOH + HCl → KCl + H₂O',
      reagentes:['KOH','HCl'], condicao:'', coefR:{'KOH':1,'HCl':1}, coefP:[1,1],
      produtos_visuais:['KCl','H₂O'],
      candidatos:['KCl','H₂O','KNO₃','K₂SO₄','K₂CO₃','NaCl','KBr','KHCO₃'],
      gabarito:{ produtos:['kcl','cloreto de potassio','h2o','agua'],
        equacaoBalanceada:'KOH(aq) + HCl(aq) → KCl(aq) + H₂O(l)' },
      hints:['OH⁻+H⁺→H₂O. K⁺+Cl⁻→KCl. Substituto do NaCl para hipertensos!'],
      explicacao:'KOH+HCl→KCl+H₂O  ·  KCl é substituto do sal de cozinha para hipertensos e eletrólito esportivo',
    },
    {
      id:'koh_co2', icon:'🌫️', familia:'Síntese',
      titulo:'2 KOH + CO₂ → K₂CO₃ + H₂O',
      reagentes:['KOH','CO₂'], condicao:'', coefR:{'KOH':2,'CO₂':1}, coefP:[1,1],
      produtos_visuais:['K₂CO₃','H₂O'],
      candidatos:['K₂CO₃','H₂O','KHCO₃','KCl','K₂SO₄','KNO₃','K₂O','NaHCO₃'],
      gabarito:{ produtos:['k2co3','carbonato de potassio','h2o','agua'],
        equacaoBalanceada:'2 KOH(aq) + CO₂(g) → K₂CO₃(aq) + H₂O(l)' },
      hints:['CO₂+2OH⁻→CO₃²⁻+H₂O. 2K⁺+CO₃²⁻→K₂CO₃ (potassa perlada — usada em sabão mole)'],
      explicacao:'2KOH+CO₂→K₂CO₃+H₂O  ·  K₂CO₃ (potassa) — base de sabões líquidos e fertilizantes de potássio',
    },
    {
      id:'koh_h2so4', icon:'⚗️', familia:'Neutralização',
      titulo:'2 KOH + H₂SO₄ → K₂SO₄ + 2 H₂O',
      reagentes:['KOH','H₂SO₄'], condicao:'', coefR:{'KOH':2,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['K₂SO₄','H₂O'],
      candidatos:['K₂SO₄','H₂O','KHSO₄','KCl','KNO₃','K₂CO₃','Na₂SO₄','CaSO₄'],
      gabarito:{ produtos:['k2so4','sulfato de potassio','h2o','agua'],
        equacaoBalanceada:'2 KOH(aq) + H₂SO₄(aq) → K₂SO₄(aq) + 2 H₂O(l)' },
      hints:['H₂SO₄ dibásico. 2KOH para neutralizar. K₂SO₄ fertilizante sem cloro'],
      explicacao:'2KOH+H₂SO₄→K₂SO₄+2H₂O  ·  K₂SO₄ é fertilizante premium para culturas sensíveis ao Cl⁻ (tabaco, uva)',
    },
    {
      id:'koh_al', icon:'⚡', familia:'Deslocamento (Anfótero)',
      titulo:'2 Al + 2 KOH + 2 H₂O → 2 KAlO₂ + 3 H₂',
      reagentes:['Al','KOH','H₂O'], condicao:'', coefR:{'Al':2,'KOH':2,'H₂O':2}, coefP:[2,3],
      produtos_visuais:['KAlO₂','H₂'],
      candidatos:['KAlO₂','H₂','Al(OH)₃','AlCl₃','K₂SO₄','Al₂O₃','KCl','H₂O'],
      gabarito:{ produtos:['kaio2','aluminato de potassio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 2 KOH(aq) + 2 H₂O(l) → 2 KAlO₂(aq) + 3 H₂(g)' },
      hints:['Al anfótero: reage com base! Idêntico à reação com NaOH, mas forma KAlO₂'],
      explicacao:'2Al+2KOH+2H₂O→2KAlO₂+3H₂  ·  Al anfótero reage com KOH — desentupidor de pia (Al+NaOH/KOH)',
    },
    {
      id:'koh_fecl3', icon:'🔬', familia:'Precipitação',
      titulo:'FeCl₃ + 3 KOH → Fe(OH)₃↓ + 3 KCl',
      reagentes:['FeCl₃','KOH'], condicao:'', coefR:{'FeCl₃':1,'KOH':3}, coefP:[1,3],
      produtos_visuais:['Fe(OH)₃','KCl'],
      candidatos:['Fe(OH)₃','KCl','Fe(OH)₂','FeO','K₂SO₄','FeCl₂','KNO₃','Fe₂O₃'],
      gabarito:{ produtos:['fe(oh)3','hidroxido de ferro iii','kcl','cloreto de potassio'],
        equacaoBalanceada:'FeCl₃(aq) + 3 KOH(aq) → Fe(OH)₃↓(s) + 3 KCl(aq)' },
      hints:['Fe³⁺+3OH⁻→Fe(OH)₃↓ (marrom-ferrugem). 3Cl⁻+3K⁺→3KCl(aq) (espectadores)'],
      explicacao:'FeCl₃+3KOH→Fe(OH)₃↓+3KCl  ·  Precipitado marrom-ferrugem — base do tratamento de águas ricas em Fe',
    },
  ],

  /* ── Mg(OH)₂ — 4 reações ─────────────────────────────────── */
  'Mg(OH)2': [
    {
      id:'mgoh2_hcl', icon:'⚗️', familia:'Neutralização (Antiácido)',
      titulo:'Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O',
      reagentes:['Mg(OH)₂','HCl'], condicao:'', coefR:{'Mg(OH)₂':1,'HCl':2}, coefP:[1,2],
      produtos_visuais:['MgCl₂','H₂O'],
      candidatos:['MgCl₂','H₂O','MgSO₄','Mg(NO₃)₂','MgO','NaCl','CaCl₂','MgCO₃'],
      gabarito:{ produtos:['mgcl2','cloreto de magnesio','h2o','agua'],
        equacaoBalanceada:'Mg(OH)₂(s) + 2 HCl(aq) → MgCl₂(aq) + 2 H₂O(l)' },
      hints:['Mg(OH)₂ tem 2OH⁻. 2HCl→2H⁺. 2H⁺+2OH⁻→2H₂O. Mg²⁺+2Cl⁻→MgCl₂'],
      explicacao:'Mg(OH)₂+2HCl→MgCl₂+2H₂O  ·  Leite de magnésia neutraliza HCl gástrico (antiácido suave)',
    },
    {
      id:'mgoh2_h2so4', icon:'⚗️', familia:'Neutralização',
      titulo:'Mg(OH)₂ + H₂SO₄ → MgSO₄ + 2 H₂O',
      reagentes:['Mg(OH)₂','H₂SO₄'], condicao:'', coefR:{'Mg(OH)₂':1,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['MgSO₄','H₂O'],
      candidatos:['MgSO₄','H₂O','MgCl₂','Mg(NO₃)₂','MgCO₃','CaSO₄','Na₂SO₄','MgO'],
      gabarito:{ produtos:['mgso4','sulfato de magnesio','h2o','agua'],
        equacaoBalanceada:'Mg(OH)₂(s) + H₂SO₄(aq) → MgSO₄(aq) + 2 H₂O(l)' },
      hints:['Mg(OH)₂ divalente+H₂SO₄ dibásico → 1:1. 2H⁺+2OH⁻→2H₂O. Mg²⁺+SO₄²⁻→MgSO₄'],
      explicacao:'Mg(OH)₂+H₂SO₄→MgSO₄+2H₂O  ·  MgSO₄·7H₂O = sal de Epsom (banho relaxante e laxante)',
    },
    {
      id:'mgoh2_calor', icon:'🌡️', familia:'Decomposição',
      titulo:'Mg(OH)₂ →(Δ)→ MgO + H₂O',
      reagentes:['Mg(OH)₂'], condicao:'Δ 350°C', coefR:{'Mg(OH)₂':1}, coefP:[1,1],
      produtos_visuais:['MgO','H₂O'],
      candidatos:['MgO','H₂O','Mg(OH)Cl','MgCO₃','MgSO₄','Mg₂O','MgH₂','Mg'],
      gabarito:{ produtos:['mgo','oxido de magnesio','h2o','agua'],
        equacaoBalanceada:'Mg(OH)₂(s) →(350°C)→ MgO(s) + H₂O(g)' },
      hints:['Hidróxido aquecido → óxido + água. Mg(OH)₂→MgO+H₂O. Base desidroxilação'],
      explicacao:'Mg(OH)₂→MgO+H₂O  ·  Retardante de chama: absorve calor e libera H₂O (vapor resfria e dilui O₂)',
    },
    {
      id:'mgoh2_co2', icon:'🌫️', familia:'Síntese',
      titulo:'Mg(OH)₂ + CO₂ → MgCO₃ + H₂O',
      reagentes:['Mg(OH)₂','CO₂'], condicao:'', coefR:{'Mg(OH)₂':1,'CO₂':1}, coefP:[1,1],
      produtos_visuais:['MgCO₃','H₂O'],
      candidatos:['MgCO₃','H₂O','MgO','Mg(HCO₃)₂','MgSO₄','CaCO₃','Na₂CO₃','MgCl₂'],
      gabarito:{ produtos:['mgco3','carbonato de magnesio','h2o','agua'],
        equacaoBalanceada:'Mg(OH)₂(aq) + CO₂(g) → MgCO₃(s) + H₂O(l)' },
      hints:['Base+óxido ácido→sal+água. OH⁻+CO₂→HCO₃⁻→CO₃²⁻. Mg²⁺+CO₃²⁻→MgCO₃'],
      explicacao:'Mg(OH)₂+CO₂→MgCO₃+H₂O  ·  MgCO₃ (magnesita) — pó de ginástica e antiácido esportivo',
    },
  ],

  /* ── ZnO — 4 reações ─────────────────────────────────────── */
  'ZnO': [
    {
      id:'zno_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'ZnO + 2 HCl → ZnCl₂ + H₂O',
      reagentes:['ZnO','HCl'], condicao:'', coefR:{'ZnO':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['ZnCl₂','H₂O'],
      candidatos:['ZnCl₂','H₂O','ZnSO₄','ZnO','Zn(OH)₂','ZnCO₃','NaCl','MgCl₂'],
      gabarito:{ produtos:['zncl2','cloreto de zinco','h2o','agua'],
        equacaoBalanceada:'ZnO(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂O(l)' },
      hints:['Óxido básico+ácido→sal+água. O²⁻+2H⁺→H₂O. Zn²⁺+2Cl⁻→ZnCl₂'],
      explicacao:'ZnO+2HCl→ZnCl₂+H₂O  ·  Comportamento básico do ZnO anfótero — dissolve em ácido',
    },
    {
      id:'zno_naoh', icon:'⚡', familia:'Reação com Base (Anfótero)',
      titulo:'ZnO + 2 NaOH → Na₂ZnO₂ + H₂O',
      reagentes:['ZnO','NaOH'], condicao:'', coefR:{'ZnO':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Na₂ZnO₂','H₂O'],
      candidatos:['Na₂ZnO₂','H₂O','Zn(OH)₂','ZnCl₂','NaCl','Na₂SO₄','ZnO','NaZnOH'],
      gabarito:{ produtos:['na2zno2','zincato de sodio','h2o','agua'],
        equacaoBalanceada:'ZnO(s) + 2 NaOH(aq) → Na₂ZnO₂(aq) + H₂O(l)' },
      hints:['Anfótero: ZnO reage com BASE! Zn²⁺+4OH⁻→[Zn(OH)₄]²⁻→ZnO₂²⁻+2H₂O'],
      explicacao:'ZnO+2NaOH→Na₂ZnO₂+H₂O  ·  Comportamento ácido do ZnO anfótero — dissolve em base',
    },
    {
      id:'zno_h2', icon:'🔥', familia:'Oxirredução',
      titulo:'ZnO + H₂ → Zn + H₂O',
      reagentes:['ZnO','H₂'], condicao:'Δ 500°C', coefR:{'ZnO':1,'H₂':1}, coefP:[1,1],
      produtos_visuais:['Zn','H₂O'],
      candidatos:['Zn','H₂O','ZnCl₂','ZnSO₄','Zn(OH)₂','ZnS','ZnC','H₂O₂'],
      gabarito:{ produtos:['zn','zinco','h2o','agua'],
        equacaoBalanceada:'ZnO(s) + H₂(g) →(500°C)→ Zn(s) + H₂O(g)' },
      hints:['H₂ é agente redutor: H₀→H⁺(H₂O). Zn²⁺→Zn⁰ (reduzido). ΔH = −6,1 kJ/mol'],
      explicacao:'ZnO+H₂→Zn+H₂O  ·  Redução de óxido metálico por hidrogênio — metalurgia limpa do zinco',
    },
    {
      id:'zno_c', icon:'🏭', familia:'Oxirredução (Pirometalurgia)',
      titulo:'2 ZnO + C → 2 Zn + CO₂',
      reagentes:['ZnO','C'], condicao:'Δ 1000°C', coefR:{'ZnO':2,'C':1}, coefP:[2,1],
      produtos_visuais:['Zn','CO₂'],
      candidatos:['Zn','CO₂','ZnCl₂','ZnS','CO','ZnC₂','Zn₂C','CaO'],
      gabarito:{ produtos:['zn','zinco','co2','dioxido de carbono'],
        equacaoBalanceada:'2 ZnO(s) + C(s) →(1000°C)→ 2 Zn(g) + CO₂(g)' },
      hints:['C reduz Zn²⁺→Zn⁰. C⁰→C⁺⁴(CO₂). 2Zn×2e⁻=4e⁻=1C×4e⁻ ✓','Zn vaporiza a 907°C — coletado por condensação'],
      explicacao:'2ZnO+C→2Zn+CO₂  ·  Processo Imperial Smelting — 90% do zinco mundial é produzido assim',
    },
  ],

  /* ── MgO — 4 reações ─────────────────────────────────────── */
  'MgO': [
    {
      id:'mgo_h2o', icon:'💧', familia:'Síntese',
      titulo:'MgO + H₂O → Mg(OH)₂',
      reagentes:['MgO','H₂O'], condicao:'', coefR:{'MgO':1,'H₂O':1}, coefP:[1],
      produtos_visuais:['Mg(OH)₂'],
      candidatos:['Mg(OH)₂','MgCO₃','MgO','MgCl₂','MgSO₄','Ca(OH)₂','Mg(OH)Cl','MgH₂'],
      gabarito:{ produtos:['mg(oh)2','hidroxido de magnesio'],
        equacaoBalanceada:'MgO(s) + H₂O(l) → Mg(OH)₂(s)' },
      hints:['Óxido básico+água→hidróxido. O²⁻+H₂O→2OH⁻. Mg²⁺+2OH⁻→Mg(OH)₂'],
      explicacao:'MgO+H₂O→Mg(OH)₂  ·  Reação lenta (diferente de CaO) — usada para produzir leite de magnésia',
    },
    {
      id:'mgo_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'MgO + 2 HCl → MgCl₂ + H₂O',
      reagentes:['MgO','HCl'], condicao:'', coefR:{'MgO':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['MgCl₂','H₂O'],
      candidatos:['MgCl₂','H₂O','MgSO₄','Mg(OH)₂','MgO','CaCl₂','NaCl','MgCO₃'],
      gabarito:{ produtos:['mgcl2','cloreto de magnesio','h2o','agua'],
        equacaoBalanceada:'MgO(s) + 2 HCl(aq) → MgCl₂(aq) + H₂O(l)' },
      hints:['Óxido básico+ácido→sal+água. O²⁻+2H⁺→H₂O. Mg²⁺+2Cl⁻→MgCl₂'],
      explicacao:'MgO+2HCl→MgCl₂+H₂O  ·  MgCl₂ é usado em flocos anti-gelo e cimento sorel (cimento de magnésia)',
    },
    {
      id:'mgo_co2', icon:'🌫️', familia:'Síntese',
      titulo:'MgO + CO₂ → MgCO₃',
      reagentes:['MgO','CO₂'], condicao:'', coefR:{'MgO':1,'CO₂':1}, coefP:[1],
      produtos_visuais:['MgCO₃'],
      candidatos:['MgCO₃','Mg(OH)₂','MgSO₄','MgO','CaCO₃','Na₂CO₃','MgCl₂','CO'],
      gabarito:{ produtos:['mgco3','carbonato de magnesio'],
        equacaoBalanceada:'MgO(s) + CO₂(g) → MgCO₃(s)' },
      hints:['Óxido básico+óxido ácido→sal (sem água). MgCO₃ = magnesita mineral'],
      explicacao:'MgO+CO₂→MgCO₃  ·  Magnesita (MgCO₃) — fonte de Mg e refratário industrial',
    },
    {
      id:'mgo_so3', icon:'🔥', familia:'Síntese',
      titulo:'MgO + SO₃ → MgSO₄',
      reagentes:['MgO','SO₃'], condicao:'', coefR:{'MgO':1,'SO₃':1}, coefP:[1],
      produtos_visuais:['MgSO₄'],
      candidatos:['MgSO₄','MgSO₃','MgO','MgCO₃','CaSO₄','Na₂SO₄','MgCl₂','MgS'],
      gabarito:{ produtos:['mgso4','sulfato de magnesio'],
        equacaoBalanceada:'MgO(s) + SO₃(g) → MgSO₄(s)' },
      hints:['Óxido básico+óxido ácido→sal. SO₃≡H₂SO₄ (anidrido). MgO+SO₃→MgSO₄'],
      explicacao:'MgO+SO₃→MgSO₄  ·  MgSO₄·7H₂O = sal de Epsom (banhos, laxante, agricultura)',
    },
  ],

  /* ── Na₂CO₃ — 5 reações ─────────────────────────────────── */
  'Na2CO3': [
    {
      id:'na2co3_hcl', icon:'🔄', familia:'Dupla Troca',
      titulo:'Na₂CO₃ + 2 HCl → 2 NaCl + H₂O + CO₂',
      reagentes:['Na₂CO₃','HCl'], condicao:'', coefR:{'Na₂CO₃':1,'HCl':2}, coefP:[2,1,1],
      produtos_visuais:['NaCl','H₂O','CO₂'],
      candidatos:['NaCl','H₂O','CO₂','Na₂SO₄','NaHCO₃','NaOH','NaCl','Na₂O'],
      gabarito:{ produtos:['nacl','cloreto de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'Na₂CO₃(aq) + 2 HCl(aq) → 2 NaCl(aq) + H₂O(l) + CO₂(g)' },
      hints:['CO₃²⁻+2H⁺→H₂CO₃→H₂O+CO₂↑. 2Na⁺+2Cl⁻→2NaCl. Efervescência = CO₂'],
      explicacao:'Na₂CO₃+2HCl→2NaCl+H₂O+CO₂  ·  Barrilha reage com HCl liberando CO₂ — base de antiácidos efervescentes',
    },
    {
      id:'na2co3_h2so4', icon:'🔄', familia:'Dupla Troca',
      titulo:'Na₂CO₃ + H₂SO₄ → Na₂SO₄ + H₂O + CO₂',
      reagentes:['Na₂CO₃','H₂SO₄'], condicao:'', coefR:{'Na₂CO₃':1,'H₂SO₄':1}, coefP:[1,1,1],
      produtos_visuais:['Na₂SO₄','H₂O','CO₂'],
      candidatos:['Na₂SO₄','H₂O','CO₂','NaHSO₄','NaCl','NaHCO₃','Na₂SO₃','Na₂O'],
      gabarito:{ produtos:['na2so4','sulfato de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'Na₂CO₃(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + H₂O(l) + CO₂(g)' },
      hints:['H₂SO₄ desloca H₂CO₃ (mais forte→mais fraco). CO₃²⁻+2H⁺→H₂O+CO₂↑'],
      explicacao:'Na₂CO₃+H₂SO₄→Na₂SO₄+H₂O+CO₂  ·  Ácido forte desloca ácido fraco volátil — princípio fundamental',
    },
    {
      id:'na2co3_caoh2', icon:'🔬', familia:'Precipitação',
      titulo:'Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2 NaOH',
      reagentes:['Na₂CO₃','Ca(OH)₂'], condicao:'', coefR:{'Na₂CO₃':1,'Ca(OH)₂':1}, coefP:[1,2],
      produtos_visuais:['CaCO₃','NaOH'],
      candidatos:['CaCO₃','NaOH','CaCl₂','Na₂SO₄','CaSO₄','NaHCO₃','Ca(HCO₃)₂','NaCl'],
      gabarito:{ produtos:['caco3','carbonato de calcio','naoh','hidroxido de sodio'],
        equacaoBalanceada:'Na₂CO₃(aq) + Ca(OH)₂(aq) → CaCO₃↓(s) + 2 NaOH(aq)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓. 2Na⁺+2OH⁻→2NaOH. Processo Solvay modificado'],
      explicacao:'Na₂CO₃+Ca(OH)₂→CaCO₃↓+2NaOH  ·  Causticação — produção industrial de NaOH a partir de Na₂CO₃',
    },
    {
      id:'na2co3_cacl2', icon:'🔬', familia:'Precipitação',
      titulo:'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2 NaCl',
      reagentes:['Na₂CO₃','CaCl₂'], condicao:'', coefR:{'Na₂CO₃':1,'CaCl₂':1}, coefP:[1,2],
      produtos_visuais:['CaCO₃','NaCl'],
      candidatos:['CaCO₃','NaCl','CaSO₄','CaCl₂','Na₂SO₄','NaHCO₃','CaO','Na₂O'],
      gabarito:{ produtos:['caco3','carbonato de calcio','nacl','cloreto de sodio'],
        equacaoBalanceada:'Na₂CO₃(aq) + CaCl₂(aq) → CaCO₃↓(s) + 2 NaCl(aq)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓ (branco insolúvel). 2Na⁺+2Cl⁻→2NaCl (espectadores)'],
      explicacao:'Na₂CO₃+CaCl₂→CaCO₃↓+2NaCl  ·  Teste de Ca²⁺ — precipitado branco com carbonato',
    },
    {
      id:'na2co3_sio2', icon:'🔥', familia:'Síntese (Fusão)',
      titulo:'Na₂CO₃ + SiO₂ → Na₂SiO₃ + CO₂',
      reagentes:['Na₂CO₃','SiO₂'], condicao:'Δ fusão', coefR:{'Na₂CO₃':1,'SiO₂':1}, coefP:[1,1],
      produtos_visuais:['Na₂SiO₃','CO₂'],
      candidatos:['Na₂SiO₃','CO₂','SiO₂','Na₂O','NaCl','Na₂SO₄','Na₂Si₂O₅','Si'],
      gabarito:{ produtos:['na2sio3','silicato de sodio','co2','dioxido de carbono'],
        equacaoBalanceada:'Na₂CO₃(s) + SiO₂(s) →(fusão)→ Na₂SiO₃(l) + CO₂(g)' },
      hints:['SiO₂ é óxido ácido mais estável que CO₂ a alta T. Na₂CO₃+SiO₂→Na₂SiO₃+CO₂↑','Fabricação de vidro! Sílica+barrilha+calcário'],
      explicacao:'Na₂CO₃+SiO₂→Na₂SiO₃+CO₂  ·  Fabricação de vidro — barrilha + areia fundidas formam o vidro sodocálcico',
    },
  ],

  /* ── FeCl₃ — 4 reações ───────────────────────────────────── */
  'FeCl3': [
    {
      id:'fecl3_naoh', icon:'🔬', familia:'Precipitação',
      titulo:'FeCl₃ + 3 NaOH → Fe(OH)₃↓ + 3 NaCl',
      reagentes:['FeCl₃','NaOH'], condicao:'', coefR:{'FeCl₃':1,'NaOH':3}, coefP:[1,3],
      produtos_visuais:['Fe(OH)₃','NaCl'],
      candidatos:['Fe(OH)₃','NaCl','Fe(OH)₂','FeO','Fe₂O₃','NaNO₃','FeCl₂','Na₂SO₄'],
      gabarito:{ produtos:['fe(oh)3','hidroxido de ferro iii','nacl','cloreto de sodio'],
        equacaoBalanceada:'FeCl₃(aq) + 3 NaOH(aq) → Fe(OH)₃↓(s) + 3 NaCl(aq)' },
      hints:['Fe³⁺+3OH⁻→Fe(OH)₃↓ (marrom-ferrugem). 3 NaOH para cada FeCl₃'],
      explicacao:'FeCl₃+3NaOH→Fe(OH)₃↓+3NaCl  ·  Precipitado marrom-laranja característico de Fe³⁺',
    },
    {
      id:'fecl3_cu', icon:'⚡', familia:'Oxirredução',
      titulo:'2 FeCl₃ + Cu → 2 FeCl₂ + CuCl₂',
      reagentes:['FeCl₃','Cu'], condicao:'', coefR:{'FeCl₃':2,'Cu':1}, coefP:[2,1],
      produtos_visuais:['FeCl₂','CuCl₂'],
      candidatos:['FeCl₂','CuCl₂','FeCl₃','CuO','Cu₂Cl₂','FeSO₄','CuSO₄','Fe₂O₃'],
      gabarito:{ produtos:['fecl2','cloreto de ferro ii','cucl2','cloreto de cobre'],
        equacaoBalanceada:'2 FeCl₃(aq) + Cu(s) → 2 FeCl₂(aq) + CuCl₂(aq)' },
      hints:['Fe³⁺+e⁻→Fe²⁺ (reduzido). Cu→Cu²⁺+2e⁻ (oxidado). 2Fe×1e⁻=2e⁻=1Cu×2e⁻ ✓'],
      explicacao:'2FeCl₃+Cu→2FeCl₂+CuCl₂  ·  Gravura de PCBs — FeCl₃ dissolve cobre dos circuitos impressos',
    },
    {
      id:'fecl3_fe', icon:'⚡', familia:'Oxirredução',
      titulo:'2 FeCl₃ + Fe → 3 FeCl₂',
      reagentes:['FeCl₃','Fe'], condicao:'', coefR:{'FeCl₃':2,'Fe':1}, coefP:[3],
      produtos_visuais:['FeCl₂'],
      candidatos:['FeCl₂','FeCl₃','Fe(OH)₃','FeO','Fe₂O₃','FeSO₄','Fe₃Cl₆','FeS'],
      gabarito:{ produtos:['fecl2','cloreto de ferro ii'],
        equacaoBalanceada:'2 FeCl₃(aq) + Fe(s) → 3 FeCl₂(aq)' },
      hints:['Fe⁰→Fe²⁺+2e⁻. 2Fe³⁺+2e⁻→2Fe²⁺. Fe⁰ reduz Fe³⁺ a Fe²⁺','Proporção: 1Fe⁰ + 2Fe³⁺ → 3Fe²⁺'],
      explicacao:'2FeCl₃+Fe→3FeCl₂  ·  Fe metálico reduz Fe³⁺ a Fe²⁺ — comproportionação',
    },
    {
      id:'fecl3_agno3', icon:'🔬', familia:'Precipitação',
      titulo:'FeCl₃ + 3 AgNO₃ → Fe(NO₃)₃ + 3 AgCl↓',
      reagentes:['FeCl₃','AgNO₃'], condicao:'', coefR:{'FeCl₃':1,'AgNO₃':3}, coefP:[1,3],
      produtos_visuais:['Fe(NO₃)₃','AgCl'],
      candidatos:['Fe(NO₃)₃','AgCl','Fe(OH)₃','AgBr','FeSO₄','AgNO₃','FeCl₂','NaCl'],
      gabarito:{ produtos:['fe(no3)3','nitrato de ferro iii','agcl','cloreto de prata'],
        equacaoBalanceada:'FeCl₃(aq) + 3 AgNO₃(aq) → Fe(NO₃)₃(aq) + 3 AgCl↓(s)' },
      hints:['3Ag⁺+3Cl⁻→3AgCl↓ (precipitado branco). Fe³⁺+3NO₃⁻→Fe(NO₃)₃ (solúvel)'],
      explicacao:'FeCl₃+3AgNO₃→Fe(NO₃)₃+3AgCl↓  ·  Identificação de Cl⁻ — 3 precipitados brancos de AgCl',
    },
  ],

  /* ── Zn — 4 reações ──────────────────────────────────────── */
  'Zn': [
    {
      id:'zn_hcl', icon:'⚡', familia:'Simples Troca',
      titulo:'Zn + 2 HCl → ZnCl₂ + H₂',
      reagentes:['Zn','HCl'], condicao:'', coefR:{'Zn':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['ZnCl₂','H₂'],
      candidatos:['ZnCl₂','H₂','ZnO','ZnSO₄','ZnCO₃','H₂O','FeCl₂','NaCl'],
      gabarito:{ produtos:['zncl2','cloreto de zinco','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)' },
      hints:['Zn>H. Zn→Zn²⁺+2e⁻. 2H⁺+2e⁻→H₂↑. Reação usada na pilha de Volta'],
      explicacao:'Zn+2HCl→ZnCl₂+H₂  ·  Base da pilha voltaica original — Zn em ácido libera H₂ e gera corrente',
    },
    {
      id:'zn_naoh', icon:'⚡', familia:'Deslocamento (Anfótero)',
      titulo:'Zn + 2 NaOH → Na₂ZnO₂ + H₂',
      reagentes:['Zn','NaOH'], condicao:'conc.', coefR:{'Zn':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Na₂ZnO₂','H₂'],
      candidatos:['Na₂ZnO₂','H₂','ZnO','Zn(OH)₂','ZnCl₂','NaCl','ZnSO₄','Na₂O'],
      gabarito:{ produtos:['na2zno2','zincato de sodio','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + 2 NaOH(aq) → Na₂ZnO₂(aq) + H₂(g)' },
      hints:['Zn anfótero: dissolve em BASE! Zn+2OH⁻→ZnO₂²⁻+H₂. Desentupa com H₂↑'],
      explicacao:'Zn+2NaOH→Na₂ZnO₂+H₂  ·  Zn anfótero — reage com HCl E com NaOH, liberando H₂ nos dois casos',
    },
    {
      id:'zn_o2', icon:'🔥', familia:'Combustão / Síntese',
      titulo:'2 Zn + O₂ → 2 ZnO',
      reagentes:['Zn','O₂'], condicao:'Δ', coefR:{'Zn':2,'O₂':1}, coefP:[2],
      produtos_visuais:['ZnO'],
      candidatos:['ZnO','ZnO₂','ZnSO₄','Zn(OH)₂','ZnCO₃','ZnO₃','Zn₂O','ZnS'],
      gabarito:{ produtos:['zno','oxido de zinco'],
        equacaoBalanceada:'2 Zn(s) + O₂(g) →(Δ)→ 2 ZnO(s)' },
      hints:['Zn+O₂: combustão de metal. 2Zn²⁺+2O²⁻→2ZnO. Fumaça branca de ZnO'],
      explicacao:'2Zn+O₂→2ZnO  ·  Combustão de zinco produz fumaça branca densa de ZnO — precursor de pigmentos',
    },
    {
      id:'zn_cuso4', icon:'⚡', familia:'Cementação',
      titulo:'Zn + CuSO₄ → ZnSO₄ + Cu',
      reagentes:['Zn','CuSO₄'], condicao:'', coefR:{'Zn':1,'CuSO₄':1}, coefP:[1,1],
      produtos_visuais:['ZnSO₄','Cu'],
      candidatos:['ZnSO₄','Cu','ZnO','ZnCl₂','CuO','CuCl₂','ZnCO₃','FeSO₄'],
      gabarito:{ produtos:['znso4','sulfato de zinco','cu','cobre'],
        equacaoBalanceada:'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)' },
      hints:['Zn>Cu. Zn→Zn²⁺+2e⁻. Cu²⁺+2e⁻→Cu (cobre vermelho deposita sobre zinco)'],
      explicacao:'Zn+CuSO₄→ZnSO₄+Cu  ·  Cementação — clássica demonstração de reatividade: zinco cobre-se de cobre avermelhado',
    },
  ],

  /* ── Al — 4 reações ──────────────────────────────────────── */
  'Al': [
    {
      id:'al_hcl', icon:'⚡', familia:'Simples Troca',
      titulo:'2 Al + 6 HCl → 2 AlCl₃ + 3 H₂',
      reagentes:['Al','HCl'], condicao:'', coefR:{'Al':2,'HCl':6}, coefP:[2,3],
      produtos_visuais:['AlCl₃','H₂'],
      candidatos:['AlCl₃','H₂','Al(OH)₃','Al₂O₃','NaAlO₂','H₂O','AlBr₃','ZnCl₂'],
      gabarito:{ produtos:['alcl3','cloreto de aluminio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 6 HCl(aq) → 2 AlCl₃(aq) + 3 H₂(g)' },
      hints:['Al→Al³⁺+3e⁻. 2Al×3e⁻=6e⁻=3H₂×2e⁻. 6HCl→6H⁺+6Cl⁻. Al³⁺+3Cl⁻→AlCl₃'],
      explicacao:'2Al+6HCl→2AlCl₃+3H₂  ·  Al reage com ácidos diluídos (HCl, H₂SO₄), mas não com HNO₃ conc. (passivação)',
    },
    {
      id:'al_naoh', icon:'⚡', familia:'Deslocamento (Anfótero)',
      titulo:'2 Al + 2 NaOH + 2 H₂O → 2 NaAlO₂ + 3 H₂',
      reagentes:['Al','NaOH','H₂O'], condicao:'', coefR:{'Al':2,'NaOH':2,'H₂O':2}, coefP:[2,3],
      produtos_visuais:['NaAlO₂','H₂'],
      candidatos:['NaAlO₂','H₂','Al(OH)₃','AlCl₃','K₂AlO₄','Al₂O₃','NaCl','H₂O'],
      gabarito:{ produtos:['naaio2','aluminato de sodio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 2 NaOH(aq) + 2 H₂O(l) → 2 NaAlO₂(aq) + 3 H₂(g)' },
      hints:['Al anfótero: dissolve em NaOH! Al→Al³⁺+3e⁻. Al³⁺+4OH⁻→AlO₂⁻+2H₂O'],
      explicacao:'2Al+2NaOH+2H₂O→2NaAlO₂+3H₂  ·  Desentupidor de ralo: Al+NaOH gera H₂ e calor que dissolve gordura',
    },
    {
      id:'al_fe2o3', icon:'🔥', familia:'Termoita',
      titulo:'2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe',
      reagentes:['Al','Fe₂O₃'], condicao:'ignição', coefR:{'Al':2,'Fe₂O₃':1}, coefP:[1,2],
      produtos_visuais:['Al₂O₃','Fe'],
      candidatos:['Al₂O₃','Fe','FeO','Fe₃O₄','AlCl₃','Al(OH)₃','Fe₂O₃','AlFe'],
      gabarito:{ produtos:['al2o3','oxido de aluminio','fe','ferro'],
        equacaoBalanceada:'2 Al(s) + Fe₂O₃(s) →(ignição)→ Al₂O₃(s) + 2 Fe(l)' },
      hints:['Al>Fe (mais reativo). Al→Al³⁺ (oxidado). Fe³⁺→Fe⁰ (reduzido). ΔH=−852 kJ/mol!'],
      explicacao:'2Al+Fe₂O₃→Al₂O₃+2Fe  ·  Reação Termoita — temperatura ~2500°C, ferro fundido escorre, usada para soldar trilhos',
    },
    {
      id:'al_o2', icon:'🔥', familia:'Combustão',
      titulo:'4 Al + 3 O₂ → 2 Al₂O₃',
      reagentes:['Al','O₂'], condicao:'Δ', coefR:{'Al':4,'O₂':3}, coefP:[2],
      produtos_visuais:['Al₂O₃'],
      candidatos:['Al₂O₃','AlO','Al(OH)₃','AlCl₃','Al₂O','Al₄O₆','NaAlO₂','ZnO'],
      gabarito:{ produtos:['al2o3','oxido de aluminio'],
        equacaoBalanceada:'4 Al(s) + 3 O₂(g) →(Δ)→ 2 Al₂O₃(s)' },
      hints:['4Al→4Al³⁺+12e⁻. 3O₂+12e⁻→6O²⁻. 4Al³⁺+6O²⁻=2Al₂O₃. ΔH=−3352 kJ/mol'],
      explicacao:'4Al+3O₂→2Al₂O₃  ·  Pó de Al arde brilhantemente. A camada natural de Al₂O₃ (~3nm) impede corrosão',
    },
  ],

  /* ── Cu — 4 reações ──────────────────────────────────────── */
  'Cu': [
    {
      id:'cu_hno3dil', icon:'⚡', familia:'Oxirredução',
      titulo:'3 Cu + 8 HNO₃ → 3 Cu(NO₃)₂ + 2 NO + 4 H₂O',
      reagentes:['Cu','HNO₃'], condicao:'diluído', coefR:{'Cu':3,'HNO₃':8}, coefP:[3,2,4],
      produtos_visuais:['Cu(NO₃)₂','NO','H₂O'],
      candidatos:['Cu(NO₃)₂','NO','H₂O','CuO','NO₂','CuSO₄','Cu₂O','N₂O'],
      gabarito:{ produtos:['cu(no3)2','nitrato de cobre','no','oxido nitrico','h2o','agua'],
        equacaoBalanceada:'3 Cu(s) + 8 HNO₃(dil.) → 3 Cu(NO₃)₂(aq) + 2 NO(g) + 4 H₂O(l)' },
      hints:['Cu não reage com HCl ou H₂SO₄ diluído! Só com oxidantes. HNO₃ dil: N⁺⁵→N⁺²(NO)'],
      explicacao:'3Cu+8HNO₃dil→3Cu(NO₃)₂+2NO+4H₂O  ·  Cu é nobre — só dissolve em ácidos oxidantes como HNO₃',
    },
    {
      id:'cu_h2so4conc', icon:'🔥', familia:'Oxirredução',
      titulo:'Cu + 2 H₂SO₄ → CuSO₄ + SO₂ + 2 H₂O',
      reagentes:['Cu','H₂SO₄'], condicao:'conc. Δ', coefR:{'Cu':1,'H₂SO₄':2}, coefP:[1,1,2],
      produtos_visuais:['CuSO₄','SO₂','H₂O'],
      candidatos:['CuSO₄','SO₂','H₂O','CuCl₂','H₂','Cu₂O','CuO','SO₃'],
      gabarito:{ produtos:['cuso4','sulfato de cobre','so2','dioxido de enxofre','h2o','agua'],
        equacaoBalanceada:'Cu(s) + 2 H₂SO₄(conc.) →(Δ)→ CuSO₄(aq) + SO₂(g) + 2 H₂O(l)' },
      hints:['H₂SO₄ conc. é oxidante: S⁺⁶→S⁺⁴(SO₂). Cu→Cu²⁺+2e⁻. Cu não reage com H₂SO₄ diluído!'],
      explicacao:'Cu+2H₂SO₄conc→CuSO₄+SO₂+2H₂O  ·  H₂SO₄ conc. quente dissolve Cu — diferente do diluído que não reage',
    },
    {
      id:'cu_o2', icon:'🔥', familia:'Combustão / Oxidação',
      titulo:'2 Cu + O₂ → 2 CuO',
      reagentes:['Cu','O₂'], condicao:'Δ', coefR:{'Cu':2,'O₂':1}, coefP:[2],
      produtos_visuais:['CuO'],
      candidatos:['CuO','Cu₂O','CuO₂','Cu(OH)₂','CuSO₄','CuCl₂','Cu₂SO₄','CuCO₃'],
      gabarito:{ produtos:['cuo','oxido de cobre ii'],
        equacaoBalanceada:'2 Cu(s) + O₂(g) →(Δ)→ 2 CuO(s)' },
      hints:['Cu+O₂: oxidação superficial ao calor. 2Cu²⁺+2O²⁻→2CuO (pó preto)'],
      explicacao:'2Cu+O₂→2CuO  ·  Cobre aquecido fica preto por oxidação (CuO). Base da cerâmica de cobre preta',
    },
    {
      id:'cu_agno3', icon:'⚡', familia:'Cementação',
      titulo:'Cu + 2 AgNO₃ → Cu(NO₃)₂ + 2 Ag',
      reagentes:['Cu','AgNO₃'], condicao:'', coefR:{'Cu':1,'AgNO₃':2}, coefP:[1,2],
      produtos_visuais:['Cu(NO₃)₂','Ag'],
      candidatos:['Cu(NO₃)₂','Ag','AgCl','CuO','CuSO₄','Cu₂O','AgNO₃','CuCl₂'],
      gabarito:{ produtos:['cu(no3)2','nitrato de cobre','ag','prata'],
        equacaoBalanceada:'Cu(s) + 2 AgNO₃(aq) → Cu(NO₃)₂(aq) + 2 Ag(s)' },
      hints:['Cu>Ag na fila de reatividade. Cu→Cu²⁺+2e⁻. 2Ag⁺+2e⁻→2Ag (cristais brancos crescem sobre o cobre)'],
      explicacao:'Cu+2AgNO₃→Cu(NO₃)₂+2Ag  ·  Prata cristalina cresce sobre o cobre — demonstração clássica de eletroquímica',
    },
  ],

  };

  // Mesclar no banco principal
  Object.keys(extras).forEach(function(k){
    if(!REACOES_LIVRES[k]) REACOES_LIVRES[k] = [];
    extras[k].forEach(function(r){ REACOES_LIVRES[k].push(r); });
  });
})();

/* Reações dos compostos adicionados na expansão 2 */
(function(){
  var r2 = {

  'HF': [
    { id:'hf_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HF + NaOH → NaF + H₂O',
      reagentes:['HF','NaOH'], condicao:'', coefR:{'HF':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaF','H₂O'],
      candidatos:['NaF','H₂O','NaCl','NaBr','Na₂SiO₃','KF','NaHF₂','NaOH'],
      gabarito:{ produtos:['naf','fluoreto de sodio','h2o','agua'],
        equacaoBalanceada:'HF(aq) + NaOH(aq) → NaF(aq) + H₂O(l)' },
      hints:['HF é ácido fraco mas reage com NaOH. H⁺+OH⁻→H₂O. Na⁺+F⁻→NaF','NaF é usado em pasta de dente (flúor)'],
      explicacao:'HF+NaOH→NaF+H₂O  ·  NaF (fluoreto de sódio) — proteção dentária, prevenção de cáries' },
    { id:'hf_sio2', icon:'🔥', familia:'Dissolução de Vidro',
      titulo:'4 HF + SiO₂ → SiF₄ + 2 H₂O',
      reagentes:['HF','SiO₂'], condicao:'', coefR:{'HF':4,'SiO₂':1}, coefP:[1,2],
      produtos_visuais:['SiF₄','H₂O'],
      candidatos:['SiF₄','H₂O','SiO₂','Na₂SiO₃','H₂SiF₆','SiH₄','H₂SiO₃','NaF'],
      gabarito:{ produtos:['sif4','tetrafluoreto de silicio','h2o','agua'],
        equacaoBalanceada:'4 HF(aq) + SiO₂(s) → SiF₄(g) + 2 H₂O(l)' },
      hints:['HF dissolve vidro! SiO₂+4HF→SiF₄(gás)+2H₂O. F⁻ ataca Si da rede de sílica'],
      explicacao:'4HF+SiO₂→SiF₄+2H₂O  ·  Único ácido que dissolve vidro — gravura e fosqueamento de vidro' },
    { id:'hf_caoh2', icon:'⚗️', familia:'Neutralização',
      titulo:'2 HF + Ca(OH)₂ → CaF₂↓ + 2 H₂O',
      reagentes:['HF','Ca(OH)₂'], condicao:'', coefR:{'HF':2,'Ca(OH)₂':1}, coefP:[1,2],
      produtos_visuais:['CaF₂','H₂O'],
      candidatos:['CaF₂','H₂O','CaCl₂','CaSO₄','NaF','Ca(OH)₂','CaCO₃','CaBr₂'],
      gabarito:{ produtos:['caf2','fluoreto de calcio','h2o','agua'],
        equacaoBalanceada:'2 HF(aq) + Ca(OH)₂(aq) → CaF₂↓(s) + 2 H₂O(l)' },
      hints:['Ca²⁺+2F⁻→CaF₂↓ (fluorita — Kps=3,9×10⁻¹¹). 2H⁺+2OH⁻→2H₂O'],
      explicacao:'2HF+Ca(OH)₂→CaF₂↓+2H₂O  ·  CaF₂ (fluorita) é o mineral fonte de F — tratamento de intoxicação por HF' },
  ],

  'HBr': [
    { id:'hbr_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HBr + NaOH → NaBr + H₂O',
      reagentes:['HBr','NaOH'], condicao:'', coefR:{'HBr':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaBr','H₂O'],
      candidatos:['NaBr','H₂O','NaCl','NaI','NaF','KBr','Na₂SO₄','NaOH'],
      gabarito:{ produtos:['nabr','brometo de sodio','h2o','agua'],
        equacaoBalanceada:'HBr(aq) + NaOH(aq) → NaBr(aq) + H₂O(l)' },
      hints:['H⁺+OH⁻→H₂O. Na⁺+Br⁻→NaBr. NaBr foi sedativo (bromismo) — hoje substituído'],
      explicacao:'HBr+NaOH→NaBr+H₂O  ·  NaBr era sedativo clássico (sec XIX-XX) — "bromo" caiu em desuso' },
    { id:'hbr_agno3', icon:'🔬', familia:'Precipitação',
      titulo:'HBr + AgNO₃ → AgBr↓ + HNO₃',
      reagentes:['HBr','AgNO₃'], condicao:'', coefR:{'HBr':1,'AgNO₃':1}, coefP:[1,1],
      produtos_visuais:['AgBr','HNO₃'],
      candidatos:['AgBr','HNO₃','AgCl','AgI','NaBr','Ag₂SO₄','AgF','NaNO₃'],
      gabarito:{ produtos:['agbr','brometo de prata','hno3','acido nitrico'],
        equacaoBalanceada:'HBr(aq) + AgNO₃(aq) → AgBr↓(s) + HNO₃(aq)' },
      hints:['Ag⁺+Br⁻→AgBr↓ amarelo-pálido (Kps=5,4×10⁻¹³). Menos solúvel que AgCl'],
      explicacao:'HBr+AgNO₃→AgBr↓+HNO₃  ·  AgBr amarelo — base da fotografia analógica (sensível à luz)' },
    { id:'hbr_mg', icon:'⚡', familia:'Simples Troca',
      titulo:'Mg + 2 HBr → MgBr₂ + H₂',
      reagentes:['Mg','HBr'], condicao:'', coefR:{'Mg':1,'HBr':2}, coefP:[1,1],
      produtos_visuais:['MgBr₂','H₂'],
      candidatos:['MgBr₂','H₂','MgCl₂','MgSO₄','Mg(OH)₂','MgO','FeBr₂','ZnBr₂'],
      gabarito:{ produtos:['mgbr2','brometo de magnesio','h2','hidrogenio'],
        equacaoBalanceada:'Mg(s) + 2 HBr(aq) → MgBr₂(aq) + H₂(g)' },
      hints:['Mg>H. Mg→Mg²⁺+2e⁻. 2Br⁻ ficam. 2H⁺+2e⁻→H₂↑'],
      explicacao:'Mg+2HBr→MgBr₂+H₂  ·  MgBr₂ — sedativo e anticonvulsivante, precursor de síntese orgânica' },
  ],

  'HI': [
    { id:'hi_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HI + NaOH → NaI + H₂O',
      reagentes:['HI','NaOH'], condicao:'', coefR:{'HI':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaI','H₂O'],
      candidatos:['NaI','H₂O','NaCl','NaBr','NaF','KI','Na₂SO₄','NaHI₂'],
      gabarito:{ produtos:['nai','iodeto de sodio','h2o','agua'],
        equacaoBalanceada:'HI(aq) + NaOH(aq) → NaI(aq) + H₂O(l)' },
      hints:['H⁺+OH⁻→H₂O. Na⁺+I⁻→NaI. KI é usado para proteção da tireoide'],
      explicacao:'HI+NaOH→NaI+H₂O  ·  NaI e KI: suplemento de iodo, proteção da tireoide em acidentes nucleares' },
    { id:'hi_cl2', icon:'⚡', familia:'Oxirredução',
      titulo:'2 HI + Cl₂ → 2 HCl + I₂',
      reagentes:['HI','Cl₂'], condicao:'', coefR:{'HI':2,'Cl₂':1}, coefP:[2,1],
      produtos_visuais:['HCl','I₂'],
      candidatos:['HCl','I₂','HBr','ICl','HF','I₂O₅','NaCl','HClO'],
      gabarito:{ produtos:['hcl','acido cloridrico','i2','iodo'],
        equacaoBalanceada:'2 HI(aq) + Cl₂(g) → 2 HCl(aq) + I₂(s)' },
      hints:['Cl₂ é oxidante mais forte que I₂. Cl₀→Cl⁻ (reduz). I⁻→I₂ (oxida). Deslocamento de halogênio'],
      explicacao:'2HI+Cl₂→2HCl+I₂  ·  Cl₂ desloca I⁻: reatividade Cl₂>Br₂>I₂ — série de oxidação dos halogênios' },
    { id:'hi_h2so4', icon:'⚡', familia:'Oxirredução',
      titulo:'8 HI + H₂SO₄ → 4 I₂ + H₂S + 4 H₂O',
      reagentes:['HI','H₂SO₄'], condicao:'conc.', coefR:{'HI':8,'H₂SO₄':1}, coefP:[4,1,4],
      produtos_visuais:['I₂','H₂S','H₂O'],
      candidatos:['I₂','H₂S','H₂O','SO₂','HCl','I₂O₅','H₂SO₃','NaI'],
      gabarito:{ produtos:['i2','iodo','h2s','acido sulfidrico','h2o','agua'],
        equacaoBalanceada:'8 HI(aq) + H₂SO₄(conc.) → 4 I₂(s) + H₂S(g) + 4 H₂O(l)' },
      hints:['I⁻ é redutor forte: reduz S⁺⁶→S⁻²(H₂S). 8I⁻→4I₂+8e⁻=S⁺⁶+8e⁻→S⁻²(H₂S)'],
      explicacao:'8HI+H₂SO₄→4I₂+H₂S+4H₂O  ·  HI é o redutor mais forte dos haloidros — reduz H₂SO₄ a H₂S!' },
  ],

  'H2S': [
    { id:'h2s_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'H₂S + 2 NaOH → Na₂S + 2 H₂O',
      reagentes:['H₂S','NaOH'], condicao:'', coefR:{'H₂S':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Na₂S','H₂O'],
      candidatos:['Na₂S','H₂O','NaHS','NaCl','Na₂SO₄','NaOH','Na₂SO₃','Na₂S₂O₃'],
      gabarito:{ produtos:['na2s','sulfeto de sodio','h2o','agua'],
        equacaoBalanceada:'H₂S(g) + 2 NaOH(aq) → Na₂S(aq) + 2 H₂O(l)' },
      hints:['H₂S diprotônico. 2NaOH para neutralizar completamente. S²⁻+2Na⁺→Na₂S'],
      explicacao:'H₂S+2NaOH→Na₂S+2H₂O  ·  Na₂S usado em curtição de couro (remove pelos) e síntese de compostos de S' },
    { id:'h2s_pbno3', icon:'🔬', familia:'Precipitação (Teste)',
      titulo:'H₂S + Pb(NO₃)₂ → PbS↓ + 2 HNO₃',
      reagentes:['H₂S','Pb(NO₃)₂'], condicao:'', coefR:{'H₂S':1,'Pb(NO₃)₂':1}, coefP:[1,2],
      produtos_visuais:['PbS','HNO₃'],
      candidatos:['PbS','HNO₃','PbCl₂','PbSO₄','PbO','Pb(OH)₂','PbCO₃','Pb(NO₂)₂'],
      gabarito:{ produtos:['pbs','sulfeto de chumbo','hno3','acido nitrico'],
        equacaoBalanceada:'H₂S(g) + Pb(NO₃)₂(aq) → PbS↓(s) + 2 HNO₃(aq)' },
      hints:['Pb²⁺+S²⁻→PbS↓ (preto intenso — Kps=9,0×10⁻²⁹). Teste clássico de H₂S e de Pb²⁺'],
      explicacao:'H₂S+Pb(NO₃)₂→PbS↓+2HNO₃  ·  Precipitado preto de PbS — teste analítico clássico de H₂S e Pb²⁺' },
    { id:'h2s_o2', icon:'🔥', familia:'Combustão',
      titulo:'2 H₂S + 3 O₂ → 2 SO₂ + 2 H₂O',
      reagentes:['H₂S','O₂'], condicao:'Δ', coefR:{'H₂S':2,'O₂':3}, coefP:[2,2],
      produtos_visuais:['SO₂','H₂O'],
      candidatos:['SO₂','H₂O','SO₃','H₂SO₄','S','H₂O₂','SO₃','S₂O₃'],
      gabarito:{ produtos:['so2','dioxido de enxofre','h2o','agua'],
        equacaoBalanceada:'2 H₂S(g) + 3 O₂(g) →(Δ)→ 2 SO₂(g) + 2 H₂O(g)' },
      hints:['H₂S combustão completa→SO₂+H₂O. S⁻²→S⁺⁴(SO₂). 2H→H₂O. 3O₂ para 2H₂S'],
      explicacao:'2H₂S+3O₂→2SO₂+2H₂O  ·  Combustão de H₂S — tratamento de gás natural ácido; SO₂ pode ser oxidado a SO₃' },
  ],

  'HClO': [
    { id:'hclo_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HClO + NaOH → NaClO + H₂O',
      reagentes:['HClO','NaOH'], condicao:'', coefR:{'HClO':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaClO','H₂O'],
      candidatos:['NaClO','H₂O','NaCl','NaClO₂','NaClO₃','NaCl','Na₂O','NaOH'],
      gabarito:{ produtos:['naclo','hipoclorito de sodio','h2o','agua'],
        equacaoBalanceada:'HClO(aq) + NaOH(aq) → NaClO(aq) + H₂O(l)' },
      hints:['H⁺+OH⁻→H₂O. ClO⁻+Na⁺→NaClO (água sanitária!)'],
      explicacao:'HClO+NaOH→NaClO+H₂O  ·  NaClO = água sanitária (hipoclorito de sódio) — desinfetante e alvejante' },
    { id:'hclo_cl2', icon:'🔬', familia:'Equilíbrio',
      titulo:'Cl₂ + H₂O ⇌ HCl + HClO',
      reagentes:['Cl₂','H₂O'], condicao:'', coefR:{'Cl₂':1,'H₂O':1}, coefP:[1,1],
      produtos_visuais:['HCl','HClO'],
      candidatos:['HCl','HClO','NaClO','Cl₂O','HClO₂','HClO₃','HClO₄','HOCl'],
      gabarito:{ produtos:['hcl','acido cloridrico','hclo','acido hipocloroso'],
        equacaoBalanceada:'Cl₂(g) + H₂O(l) ⇌ HCl(aq) + HClO(aq)' },
      hints:['Cl₂ se desproporcionou: Cl⁰→Cl⁻(HCl) e Cl⁰→Cl⁺(HClO). Equilíbrio em água'],
      explicacao:'Cl₂+H₂O⇌HCl+HClO  ·  Base do cloro em piscinas: Cl₂ forma HClO (agente desinfetante real)' },
    { id:'hclo_luz', icon:'☀️', familia:'Fotodecomposição',
      titulo:'2 HClO →(hν)→ 2 HCl + O₂',
      reagentes:['HClO'], condicao:'luz', coefR:{'HClO':2}, coefP:[2,1],
      produtos_visuais:['HCl','O₂'],
      candidatos:['HCl','O₂','Cl₂','H₂O','ClO₂','HClO₂','H₂O₂','NaClO'],
      gabarito:{ produtos:['hcl','acido cloridrico','o2','oxigenio'],
        equacaoBalanceada:'2 HClO(aq) →(hν)→ 2 HCl(aq) + O₂(g)' },
      hints:['Luz UV quebra HClO. Cl⁺¹→Cl⁻¹(HCl). O⁻²→O₂↑ (oxidação). Por isso piscinas perdem cloro no sol'],
      explicacao:'2HClO→2HCl+O₂  ·  Fotodecomposição — piscinas ao sol perdem cloro rapidamente (UV destrói HClO)' },
  ],

  'Ba(OH)2': [
    { id:'baoh2_h2so4', icon:'🔬', familia:'Neutralização/Precipitação',
      titulo:'Ba(OH)₂ + H₂SO₄ → BaSO₄↓ + 2 H₂O',
      reagentes:['Ba(OH)₂','H₂SO₄'], condicao:'', coefR:{'Ba(OH)₂':1,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['BaSO₄','H₂O'],
      candidatos:['BaSO₄','H₂O','BaCl₂','Ba(NO₃)₂','CaSO₄','Na₂SO₄','BaCO₃','BaO'],
      gabarito:{ produtos:['baso4','sulfato de bario','h2o','agua'],
        equacaoBalanceada:'Ba(OH)₂(aq) + H₂SO₄(aq) → BaSO₄↓(s) + 2 H₂O(l)' },
      hints:['Ba²⁺+SO₄²⁻→BaSO₄↓ (branco, Kps=1,1×10⁻¹⁰). 2H⁺+2OH⁻→2H₂O'],
      explicacao:'Ba(OH)₂+H₂SO₄→BaSO₄↓+2H₂O  ·  Teste de SO₄²⁻: precipitado branco insolúvel em ácido' },
    { id:'baoh2_hcl', icon:'⚗️', familia:'Neutralização',
      titulo:'Ba(OH)₂ + 2 HCl → BaCl₂ + 2 H₂O',
      reagentes:['Ba(OH)₂','HCl'], condicao:'', coefR:{'Ba(OH)₂':1,'HCl':2}, coefP:[1,2],
      produtos_visuais:['BaCl₂','H₂O'],
      candidatos:['BaCl₂','H₂O','BaSO₄','Ba(NO₃)₂','CaCl₂','NaCl','BaCO₃','BaO'],
      gabarito:{ produtos:['bacl2','cloreto de bario','h2o','agua'],
        equacaoBalanceada:'Ba(OH)₂(aq) + 2 HCl(aq) → BaCl₂(aq) + 2 H₂O(l)' },
      hints:['Base divalente+ácido forte. 2H⁺+2OH⁻→2H₂O. Ba²⁺+2Cl⁻→BaCl₂'],
      explicacao:'Ba(OH)₂+2HCl→BaCl₂+2H₂O  ·  BaCl₂ é tóxico (Ba²⁺ livre) — diferente do inerte BaSO₄' },
    { id:'baoh2_nh4cl', icon:'❄️', familia:'Reação Endotérmica',
      titulo:'Ba(OH)₂ + 2 NH₄Cl → BaCl₂ + 2 NH₃ + 2 H₂O',
      reagentes:['Ba(OH)₂','NH₄Cl'], condicao:'', coefR:{'Ba(OH)₂':1,'NH₄Cl':2}, coefP:[1,2,2],
      produtos_visuais:['BaCl₂','NH₃','H₂O'],
      candidatos:['BaCl₂','NH₃','H₂O','BaSO₄','NH₄OH','N₂','Ba(NO₃)₂','NaCl'],
      gabarito:{ produtos:['bacl2','cloreto de bario','nh3','amonia','h2o','agua'],
        equacaoBalanceada:'Ba(OH)₂(s) + 2 NH₄Cl(s) → BaCl₂(aq) + 2 NH₃(g) + 2 H₂O(l)' },
      hints:['OH⁻+NH₄⁺→NH₃↑+H₂O. Ba²⁺+2Cl⁻→BaCl₂. Reação ENDOTÉRMICA: ΔH=+161 kJ/mol!'],
      explicacao:'Ba(OH)₂+2NH₄Cl→BaCl₂+2NH₃+2H₂O  ·  Reação endotérmica clássica: mistura sólida congela até −20°C sem geladeira' },
  ],

  'Al(OH)3': [
    { id:'aloh3_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Al(OH)₃ + 3 HCl → AlCl₃ + 3 H₂O',
      reagentes:['Al(OH)₃','HCl'], condicao:'', coefR:{'Al(OH)₃':1,'HCl':3}, coefP:[1,3],
      produtos_visuais:['AlCl₃','H₂O'],
      candidatos:['AlCl₃','H₂O','Al₂(SO₄)₃','Al(NO₃)₃','AlF₃','NaCl','AlOH','Al₂O₃'],
      gabarito:{ produtos:['alcl3','cloreto de aluminio','h2o','agua'],
        equacaoBalanceada:'Al(OH)₃(s) + 3 HCl(aq) → AlCl₃(aq) + 3 H₂O(l)' },
      hints:['Anfótero+ácido→sal+água. 3H⁺+3OH⁻→3H₂O. Al³⁺+3Cl⁻→AlCl₃'],
      explicacao:'Al(OH)₃+3HCl→AlCl₃+3H₂O  ·  Comportamento básico do Al(OH)₃ anfótero — dissolve em ácido' },
    { id:'aloh3_naoh', icon:'⚡', familia:'Reação com Base (Anfótero)',
      titulo:'Al(OH)₃ + NaOH → NaAlO₂ + 2 H₂O',
      reagentes:['Al(OH)₃','NaOH'], condicao:'', coefR:{'Al(OH)₃':1,'NaOH':1}, coefP:[1,2],
      produtos_visuais:['NaAlO₂','H₂O'],
      candidatos:['NaAlO₂','H₂O','AlCl₃','Na₂Al₂O₄','Al₂O₃','NaCl','NaAl(OH)₄','Al(OH)₂⁻'],
      gabarito:{ produtos:['naaio2','aluminato de sodio','h2o','agua'],
        equacaoBalanceada:'Al(OH)₃(s) + NaOH(aq) → NaAlO₂(aq) + 2 H₂O(l)' },
      hints:['Anfótero+base→salt+água. Al(OH)₃ age como ácido: Al(OH)₃→AlO₂⁻+H₂O+H⁺'],
      explicacao:'Al(OH)₃+NaOH→NaAlO₂+2H₂O  ·  Comportamento ácido do Al(OH)₃ anfótero — dissolve em base' },
    { id:'aloh3_calor', icon:'🌡️', familia:'Decomposição',
      titulo:'2 Al(OH)₃ →(Δ)→ Al₂O₃ + 3 H₂O',
      reagentes:['Al(OH)₃'], condicao:'Δ 300°C', coefR:{'Al(OH)₃':2}, coefP:[1,3],
      produtos_visuais:['Al₂O₃','H₂O'],
      candidatos:['Al₂O₃','H₂O','AlO','Al(OH)Cl','AlOOH','Al','Al₂S₃','Al₂(SO₄)₃'],
      gabarito:{ produtos:['al2o3','oxido de aluminio','h2o','agua'],
        equacaoBalanceada:'2 Al(OH)₃(s) →(300°C)→ Al₂O₃(s) + 3 H₂O(g)' },
      hints:['Hidróxido→óxido+água ao aquecimento. 2Al(OH)₃→Al₂O₃+3H₂O. Retardante de chama!'],
      explicacao:'2Al(OH)₃→Al₂O₃+3H₂O  ·  Retardante de chama: decompõe absorvendo calor e liberando vapor d\'água' },
  ],

  'Fe(OH)3': [
    { id:'feoh3_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Fe(OH)₃ + 3 HCl → FeCl₃ + 3 H₂O',
      reagentes:['Fe(OH)₃','HCl'], condicao:'', coefR:{'Fe(OH)₃':1,'HCl':3}, coefP:[1,3],
      produtos_visuais:['FeCl₃','H₂O'],
      candidatos:['FeCl₃','H₂O','FeCl₂','Fe₂(SO₄)₃','Fe(NO₃)₃','FeSO₄','FeO','NaCl'],
      gabarito:{ produtos:['fecl3','cloreto de ferro iii','h2o','agua'],
        equacaoBalanceada:'Fe(OH)₃(s) + 3 HCl(aq) → FeCl₃(aq) + 3 H₂O(l)' },
      hints:['Base insolúvel+ácido forte→sal solúvel+água. 3H⁺+3OH⁻→3H₂O. Fe³⁺+3Cl⁻→FeCl₃'],
      explicacao:'Fe(OH)₃+3HCl→FeCl₃+3H₂O  ·  Dissolução de hidróxido insolúvel em ácido forte' },
    { id:'feoh3_calor', icon:'🌡️', familia:'Decomposição',
      titulo:'2 Fe(OH)₃ →(Δ)→ Fe₂O₃ + 3 H₂O',
      reagentes:['Fe(OH)₃'], condicao:'Δ 500°C', coefR:{'Fe(OH)₃':2}, coefP:[1,3],
      produtos_visuais:['Fe₂O₃','H₂O'],
      candidatos:['Fe₂O₃','H₂O','FeO','Fe₃O₄','Fe(OH)₂','FeSO₄','FeOOH','Fe'],
      gabarito:{ produtos:['fe2o3','oxido de ferro iii','h2o','agua'],
        equacaoBalanceada:'2 Fe(OH)₃(s) →(500°C)→ Fe₂O₃(s) + 3 H₂O(g)' },
      hints:['Hidróxido→óxido+H₂O. Fe(OH)₃ vira Fe₂O₃ vermelho-ferrugem. Processo de formação de minério'],
      explicacao:'2Fe(OH)₃→Fe₂O₃+3H₂O  ·  Formação de hematita (Fe₂O₃) por desidratação da ferrugem hidratada' },
    { id:'feoh3_form', icon:'🔬', familia:'Precipitação',
      titulo:'FeCl₃ + 3 NH₃ + 3 H₂O → Fe(OH)₃↓ + 3 NH₄Cl',
      reagentes:['FeCl₃','NH₃','H₂O'], condicao:'', coefR:{'FeCl₃':1,'NH₃':3,'H₂O':3}, coefP:[1,3],
      produtos_visuais:['Fe(OH)₃','NH₄Cl'],
      candidatos:['Fe(OH)₃','NH₄Cl','Fe(OH)₂','FeCl₂','NaCl','Fe₂O₃','FeO','NH₄OH'],
      gabarito:{ produtos:['fe(oh)3','hidroxido de ferro iii','nh4cl','cloreto de amonio'],
        equacaoBalanceada:'FeCl₃(aq) + 3 NH₃(aq) + 3 H₂O(l) → Fe(OH)₃↓(s) + 3 NH₄Cl(aq)' },
      hints:['NH₃+H₂O→NH₄⁺+OH⁻. Fe³⁺+3OH⁻→Fe(OH)₃↓. NH₄⁺+Cl⁻→NH₄Cl'],
      explicacao:'FeCl₃+3NH₃+3H₂O→Fe(OH)₃↓+3NH₄Cl  ·  NH₃ como precipitante suave de Fe³⁺ em análise qualitativa' },
  ],

  'NaHCO3': [
    { id:'nahco3_hcl', icon:'🔄', familia:'Dupla Troca',
      titulo:'NaHCO₃ + HCl → NaCl + H₂O + CO₂',
      reagentes:['NaHCO₃','HCl'], condicao:'', coefR:{'NaHCO₃':1,'HCl':1}, coefP:[1,1,1],
      produtos_visuais:['NaCl','H₂O','CO₂'],
      candidatos:['NaCl','H₂O','CO₂','Na₂CO₃','NaHCO₃','Na₂SO₄','NaOH','NaNO₃'],
      gabarito:{ produtos:['nacl','cloreto de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'NaHCO₃(aq) + HCl(aq) → NaCl(aq) + H₂O(l) + CO₂(g)' },
      hints:['HCO₃⁻+H⁺→H₂CO₃→H₂O+CO₂↑. Na⁺+Cl⁻→NaCl. Efervescência = CO₂'],
      explicacao:'NaHCO₃+HCl→NaCl+H₂O+CO₂  ·  Antiácido efervescente: bicarbonato neutraliza HCl gástrico liberando CO₂' },
    { id:'nahco3_calor', icon:'🌡️', familia:'Decomposição',
      titulo:'2 NaHCO₃ →(Δ)→ Na₂CO₃ + H₂O + CO₂',
      reagentes:['NaHCO₃'], condicao:'Δ 80°C', coefR:{'NaHCO₃':2}, coefP:[1,1,1],
      produtos_visuais:['Na₂CO₃','H₂O','CO₂'],
      candidatos:['Na₂CO₃','H₂O','CO₂','NaOH','Na₂O','NaHCO₃','NaCl','Na₂SO₄'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'2 NaHCO₃(s) →(80°C)→ Na₂CO₃(s) + H₂O(g) + CO₂(g)' },
      hints:['Bicarbonato decompõe com calor. CO₂ e H₂O saem como gás. Por isso o bolo cresce no forno!'],
      explicacao:'2NaHCO₃→Na₂CO₃+H₂O+CO₂  ·  Fermento em pó: CO₂ formado expande a massa de bolo no forno (≥80°C)' },
    { id:'nahco3_naoh', icon:'⚗️', familia:'Neutralização Parcial',
      titulo:'NaHCO₃ + NaOH → Na₂CO₃ + H₂O',
      reagentes:['NaHCO₃','NaOH'], condicao:'', coefR:{'NaHCO₃':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['Na₂CO₃','H₂O'],
      candidatos:['Na₂CO₃','H₂O','NaCl','NaHCO₃','Na₂SO₄','NaOH','NaNO₃','Na₂O'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua'],
        equacaoBalanceada:'NaHCO₃(aq) + NaOH(aq) → Na₂CO₃(aq) + H₂O(l)' },
      hints:['HCO₃⁻ age como ácido fraco com NaOH. HCO₃⁻+OH⁻→CO₃²⁻+H₂O. 2Na⁺+CO₃²⁻→Na₂CO₃'],
      explicacao:'NaHCO₃+NaOH→Na₂CO₃+H₂O  ·  NaHCO₃ como ácido fraco — doando H⁺ para a base forte NaOH' },
  ],

  'KNO3': [
    { id:'kno3_form', icon:'⚗️', familia:'Neutralização',
      titulo:'KOH + HNO₃ → KNO₃ + H₂O',
      reagentes:['KOH','HNO₃'], condicao:'', coefR:{'KOH':1,'HNO₃':1}, coefP:[1,1],
      produtos_visuais:['KNO₃','H₂O'],
      candidatos:['KNO₃','H₂O','KCl','K₂SO₄','KNO₂','NaNO₃','Ca(NO₃)₂','KHCO₃'],
      gabarito:{ produtos:['kno3','nitrato de potassio','h2o','agua'],
        equacaoBalanceada:'KOH(aq) + HNO₃(aq) → KNO₃(aq) + H₂O(l)' },
      hints:['OH⁻+H⁺→H₂O. K⁺+NO₃⁻→KNO₃ (salitre — fertilizante e oxidante da pólvora)'],
      explicacao:'KOH+HNO₃→KNO₃+H₂O  ·  KNO₃ (salitre): componente da pólvora negra e fertilizante de potássio' },
    { id:'kno3_calor', icon:'🔥', familia:'Decomposição',
      titulo:'2 KNO₃ →(Δ 400°C)→ 2 KNO₂ + O₂',
      reagentes:['KNO₃'], condicao:'Δ 400°C', coefR:{'KNO₃':2}, coefP:[2,1],
      produtos_visuais:['KNO₂','O₂'],
      candidatos:['KNO₂','O₂','K₂O','NO₂','KCl','K₂CO₃','N₂','KOH'],
      gabarito:{ produtos:['kno2','nitrito de potassio','o2','oxigenio'],
        equacaoBalanceada:'2 KNO₃(s) →(400°C)→ 2 KNO₂(s) + O₂(g)' },
      hints:['N⁺⁵→N⁺³(NO₂⁻): redução parcial. O₂ liberado é o oxidante da pólvora'],
      explicacao:'2KNO₃→2KNO₂+O₂  ·  Fornece O₂ para combustão da pólvora — KNO₃ é o "fornecedor de oxigênio" (oxidante)' },
    { id:'kno3_comb', icon:'🔥', familia:'Decomposição (Alta T)',
      titulo:'4 KNO₃ →(Δ alta T)→ 2 K₂O + 4 NO₂ + O₂',
      reagentes:['KNO₃'], condicao:'Δ alta T', coefR:{'KNO₃':4}, coefP:[2,4,1],
      produtos_visuais:['K₂O','NO₂','O₂'],
      candidatos:['K₂O','NO₂','O₂','KNO₂','K₂CO₃','N₂','KCl','KOH'],
      gabarito:{ produtos:['k2o','oxido de potassio','no2','dioxido de nitrogenio','o2','oxigenio'],
        equacaoBalanceada:'4 KNO₃(s) →(alta T)→ 2 K₂O(s) + 4 NO₂(g) + O₂(g)' },
      hints:['Decomposição total: N⁺⁵→N⁺⁴(NO₂). K⁺ fica como K₂O. O excesso sai como O₂','4K×1=4K: 2K₂O✓ 4N=4NO₂✓ 12O: 2×1+4×2+2=12✓'],
      explicacao:'4KNO₃→2K₂O+4NO₂+O₂  ·  Decomposição total a alta T — em incêndios, nitratos liberam O₂ intensificando as chamas' },
  ],

  'CaCO3': [
    { id:'caco3_hcl', icon:'🔄', familia:'Dupla Troca',
      titulo:'CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂',
      reagentes:['CaCO₃','HCl'], condicao:'', coefR:{'CaCO₃':1,'HCl':2}, coefP:[1,1,1],
      produtos_visuais:['CaCl₂','H₂O','CO₂'],
      candidatos:['CaCl₂','H₂O','CO₂','CaSO₄','CaCO₃','NaCl','CaO','Ca(OH)₂'],
      gabarito:{ produtos:['cacl2','cloreto de calcio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'CaCO₃(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)' },
      hints:['CO₃²⁻+2H⁺→H₂O+CO₂↑. Ca²⁺+2Cl⁻→CaCl₂. Calcário "ferve" em HCl!'],
      explicacao:'CaCO₃+2HCl→CaCl₂+H₂O+CO₂  ·  Calcário dissolve em ácido — base da dissolução de estalactites' },
    { id:'caco3_calor', icon:'🏭', familia:'Decomposição (Calcinação)',
      titulo:'CaCO₃ →(Δ 900°C)→ CaO + CO₂',
      reagentes:['CaCO₃'], condicao:'Δ 900°C', coefR:{'CaCO₃':1}, coefP:[1,1],
      produtos_visuais:['CaO','CO₂'],
      candidatos:['CaO','CO₂','Ca(OH)₂','CaCl₂','Ca(NO₃)₂','CaC₂','CaO₂','CaSO₄'],
      gabarito:{ produtos:['cao','oxido de calcio','co2','dioxido de carbono'],
        equacaoBalanceada:'CaCO₃(s) →(900°C)→ CaO(s) + CO₂(g)' },
      hints:['Calcinação: CaCO₃→CaO+CO₂. Cal viva (CaO) = produto de alto valor industrial'],
      explicacao:'CaCO₃→CaO+CO₂  ·  Calcinação do calcário — produção de cal viva (base do cimento Portland)' },
    { id:'caco3_h2o_co2', icon:'🌊', familia:'Dissolução Cárstica',
      titulo:'CaCO₃ + H₂O + CO₂ → Ca(HCO₃)₂',
      reagentes:['CaCO₃','H₂O','CO₂'], condicao:'', coefR:{'CaCO₃':1,'H₂O':1,'CO₂':1}, coefP:[1],
      produtos_visuais:['Ca(HCO₃)₂'],
      candidatos:['Ca(HCO₃)₂','CaCl₂','CaSO₄','Ca(OH)₂','CaO','CaCO₃','Na₂CO₃','CaH₂CO₃'],
      gabarito:{ produtos:['ca(hco3)2','bicarbonato de calcio'],
        equacaoBalanceada:'CaCO₃(s) + H₂O(l) + CO₂(g) → Ca(HCO₃)₂(aq)' },
      hints:['Chuva (H₂O+CO₂→H₂CO₃) dissolve calcário. Ca(HCO₃)₂ é solúvel — formação de cavernas!'],
      explicacao:'CaCO₃+H₂O+CO₂→Ca(HCO₃)₂  ·  Formação de grutas cársticas — calcário dissolvido pela chuva ácida natural' },
  ],

  'BaSO4': [
    { id:'baso4_form', icon:'🔬', familia:'Precipitação',
      titulo:'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2 NaCl',
      reagentes:['BaCl₂','Na₂SO₄'], condicao:'', coefR:{'BaCl₂':1,'Na₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['BaSO₄','NaCl'],
      candidatos:['BaSO₄','NaCl','BaCO₃','BaS','Na₂SO₃','Na₂S','BaO','NaNO₃'],
      gabarito:{ produtos:['baso4','sulfato de bario','nacl','cloreto de sodio'],
        equacaoBalanceada:'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄↓(s) + 2 NaCl(aq)' },
      hints:['Ba²⁺+SO₄²⁻→BaSO₄↓ branco (Kps=1,1×10⁻¹⁰). 2Na⁺+2Cl⁻→2NaCl (espectadores)'],
      explicacao:'BaCl₂+Na₂SO₄→BaSO₄↓+2NaCl  ·  Teste clássico de SO₄²⁻ — precipitado branco insolúvel em HNO₃' },
    { id:'baso4_form2', icon:'🔬', familia:'Precipitação',
      titulo:'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2 HCl',
      reagentes:['BaCl₂','H₂SO₄'], condicao:'', coefR:{'BaCl₂':1,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['BaSO₄','HCl'],
      candidatos:['BaSO₄','HCl','BaCO₃','NaCl','BaO','Ba(OH)₂','BaS','HNO₃'],
      gabarito:{ produtos:['baso4','sulfato de bario','hcl','acido cloridrico'],
        equacaoBalanceada:'BaCl₂(aq) + H₂SO₄(aq) → BaSO₄↓(s) + 2 HCl(aq)' },
      hints:['Ba²⁺+SO₄²⁻→BaSO₄↓. Precipitado permanece mesmo em meio ácido (Kps extremamente baixo)'],
      explicacao:'BaCl₂+H₂SO₄→BaSO₄↓+2HCl  ·  BaSO₄ insolúvel até em ácido — contraste de raio-X gastrointestinal' },
    { id:'baso4_calor', icon:'🔥', familia:'Decomposição (Alta T)',
      titulo:'BaSO₄ →(Δ 1580°C)→ BaO + SO₃',
      reagentes:['BaSO₄'], condicao:'Δ 1580°C', coefR:{'BaSO₄':1}, coefP:[1,1],
      produtos_visuais:['BaO','SO₃'],
      candidatos:['BaO','SO₃','BaS','Ba(OH)₂','SO₂','BaSO₃','BaCO₃','BaCl₂'],
      gabarito:{ produtos:['bao','oxido de bario','so3','trioxido de enxofre'],
        equacaoBalanceada:'BaSO₄(s) →(1580°C)→ BaO(s) + SO₃(g)' },
      hints:['Decomposição a altíssima T. S⁺⁶→S⁺⁶(SO₃) e O²⁻ vai para BaO. Requer forno industrial'],
      explicacao:'BaSO₄→BaO+SO₃  ·  Decomposição a temperatura extrema — produção de BaO para aplicações especiais' },
  ],

  'ZnSO4': [
    { id:'znso4_form', icon:'⚡', familia:'Simples Troca',
      titulo:'Zn + H₂SO₄ → ZnSO₄ + H₂',
      reagentes:['Zn','H₂SO₄'], condicao:'dil.', coefR:{'Zn':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['ZnSO₄','H₂'],
      candidatos:['ZnSO₄','H₂','ZnCl₂','ZnO','ZnCO₃','ZnSO₃','FeSO₄','Na₂SO₄'],
      gabarito:{ produtos:['znso4','sulfato de zinco','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + H₂SO₄(dil.) → ZnSO₄(aq) + H₂(g)' },
      hints:['Zn>H. Zn→Zn²⁺+2e⁻. 2H⁺+2e⁻→H₂↑. Zn²⁺+SO₄²⁻→ZnSO₄'],
      explicacao:'Zn+H₂SO₄→ZnSO₄+H₂  ·  ZnSO₄·7H₂O (vitriolo branco) — galvanização e fungicida agrícola' },
    { id:'znso4_naoh', icon:'🔬', familia:'Precipitação',
      titulo:'ZnSO₄ + 2 NaOH → Zn(OH)₂↓ + Na₂SO₄',
      reagentes:['ZnSO₄','NaOH'], condicao:'', coefR:{'ZnSO₄':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Zn(OH)₂','Na₂SO₄'],
      candidatos:['Zn(OH)₂','Na₂SO₄','ZnO','NaCl','Na₂ZnO₂','ZnCl₂','Na₂SO₃','ZnCO₃'],
      gabarito:{ produtos:['zn(oh)2','hidroxido de zinco','na2so4','sulfato de sodio'],
        equacaoBalanceada:'ZnSO₄(aq) + 2 NaOH(aq) → Zn(OH)₂↓(s) + Na₂SO₄(aq)' },
      hints:['Zn²⁺+2OH⁻→Zn(OH)₂↓ (branco, anfótero). SO₄²⁻+2Na⁺→Na₂SO₄(aq)'],
      explicacao:'ZnSO₄+2NaOH→Zn(OH)₂↓+Na₂SO₄  ·  Zn(OH)₂ anfótero — dissolve em excesso de NaOH' },
    { id:'znso4_barium', icon:'🔬', familia:'Precipitação (Teste SO₄²⁻)',
      titulo:'ZnSO₄ + BaCl₂ → BaSO₄↓ + ZnCl₂',
      reagentes:['ZnSO₄','BaCl₂'], condicao:'', coefR:{'ZnSO₄':1,'BaCl₂':1}, coefP:[1,1],
      produtos_visuais:['BaSO₄','ZnCl₂'],
      candidatos:['BaSO₄','ZnCl₂','ZnSO₄','BaCO₃','BaS','ZnO','NaCl','BaO'],
      gabarito:{ produtos:['baso4','sulfato de bario','zncl2','cloreto de zinco'],
        equacaoBalanceada:'ZnSO₄(aq) + BaCl₂(aq) → BaSO₄↓(s) + ZnCl₂(aq)' },
      hints:['Ba²⁺+SO₄²⁻→BaSO₄↓ (branco). Zn²⁺+2Cl⁻→ZnCl₂(aq). Teste de SO₄²⁻!'],
      explicacao:'ZnSO₄+BaCl₂→BaSO₄↓+ZnCl₂  ·  Confirmação de íon sulfato SO₄²⁻ pelo precipitado branco insolúvel' },
  ],

  'FeSO4': [
    { id:'feso4_form', icon:'⚡', familia:'Simples Troca',
      titulo:'Fe + H₂SO₄ → FeSO₄ + H₂',
      reagentes:['Fe','H₂SO₄'], condicao:'dil.', coefR:{'Fe':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['FeSO₄','H₂'],
      candidatos:['FeSO₄','H₂','Fe₂(SO₄)₃','FeCl₂','FeO','ZnSO₄','Fe₂O₃','Na₂SO₄'],
      gabarito:{ produtos:['feso4','sulfato de ferro ii','h2','hidrogenio'],
        equacaoBalanceada:'Fe(s) + H₂SO₄(dil.) → FeSO₄(aq) + H₂(g)' },
      hints:['Fe>H. Fe→Fe²⁺+2e⁻. H₂SO₄dil: 2H⁺+2e⁻→H₂. Fe²⁺+SO₄²⁻→FeSO₄'],
      explicacao:'Fe+H₂SO₄→FeSO₄+H₂  ·  Produção de FeSO₄ (vitriolo verde) — suplemento de ferro e tinta ferrogálica' },
    { id:'feso4_naoh', icon:'🔬', familia:'Precipitação',
      titulo:'FeSO₄ + 2 NaOH → Fe(OH)₂↓ + Na₂SO₄',
      reagentes:['FeSO₄','NaOH'], condicao:'', coefR:{'FeSO₄':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Fe(OH)₂','Na₂SO₄'],
      candidatos:['Fe(OH)₂','Na₂SO₄','Fe(OH)₃','FeCl₂','FeO','NaCl','FeSO₃','Fe₂O₃'],
      gabarito:{ produtos:['fe(oh)2','hidroxido de ferro ii','na2so4','sulfato de sodio'],
        equacaoBalanceada:'FeSO₄(aq) + 2 NaOH(aq) → Fe(OH)₂↓(s) + Na₂SO₄(aq)' },
      hints:['Fe²⁺+2OH⁻→Fe(OH)₂↓ (verde-acinzentado). Oxida ao ar: 4Fe(OH)₂+O₂+2H₂O→4Fe(OH)₃'],
      explicacao:'FeSO₄+2NaOH→Fe(OH)₂↓+Na₂SO₄  ·  Fe(OH)₂ verde — oxida rapidamente a Fe(OH)₃ marrom no ar' },
    { id:'feso4_kmno4', icon:'⚡', familia:'Oxirredução',
      titulo:'10 FeSO₄ + 2 KMnO₄ + 8 H₂SO₄ → 5 Fe₂(SO₄)₃ + 2 MnSO₄ + K₂SO₄ + 8 H₂O',
      reagentes:['FeSO₄','KMnO₄','H₂SO₄'], condicao:'ácido', coefR:{'FeSO₄':10,'KMnO₄':2,'H₂SO₄':8}, coefP:[5,2,1,8],
      produtos_visuais:['Fe₂(SO₄)₃','MnSO₄','K₂SO₄','H₂O'],
      candidatos:['Fe₂(SO₄)₃','MnSO₄','K₂SO₄','H₂O','FeCl₃','MnO₂','KCl','Na₂SO₄'],
      gabarito:{ produtos:['fe2(so4)3','sulfato de ferro iii','mnso4','sulfato de manganes','k2so4','sulfato de potassio','h2o','agua'],
        equacaoBalanceada:'10 FeSO₄ + 2 KMnO₄ + 8 H₂SO₄ → 5 Fe₂(SO₄)₃ + 2 MnSO₄ + K₂SO₄ + 8 H₂O' },
      hints:['Fe²⁺→Fe³⁺+e⁻ (oxidado). Mn⁷⁺+5e⁻→Mn²⁺ (reduzido). 10Fe×1e⁻=10e⁻=2Mn×5e⁻ ✓'],
      explicacao:'10FeSO₄+2KMnO₄+8H₂SO₄→5Fe₂(SO₄)₃+2MnSO₄+K₂SO₄+8H₂O  ·  Permanganatometria de Fe²⁺ — KMnO₄ roxa some (Mn⁷⁺→Mn²⁺ incolor)' },
  ],

  'KMnO4': [
    { id:'kmno4_h2o2', icon:'⚡', familia:'Oxirredução',
      titulo:'2 KMnO₄ + 5 H₂O₂ + 3 H₂SO₄ → 2 MnSO₄ + K₂SO₄ + 8 H₂O + 5 O₂',
      reagentes:['KMnO₄','H₂O₂','H₂SO₄'], condicao:'ácido', coefR:{'KMnO₄':2,'H₂O₂':5,'H₂SO₄':3}, coefP:[2,1,8,5],
      produtos_visuais:['MnSO₄','K₂SO₄','H₂O','O₂'],
      candidatos:['MnSO₄','K₂SO₄','H₂O','O₂','MnO₂','KCl','SO₂','H₂O₂'],
      gabarito:{ produtos:['mnso4','sulfato de manganes','k2so4','sulfato de potassio','h2o','agua','o2','oxigenio'],
        equacaoBalanceada:'2 KMnO₄ + 5 H₂O₂ + 3 H₂SO₄ → 2 MnSO₄ + K₂SO₄ + 8 H₂O + 5 O₂' },
      hints:['Mn⁷⁺+5e⁻→Mn²⁺ (KMnO₄ como oxidante). H₂O₂: O⁻¹→O₂(O⁰) (oxidado). 2Mn×5e⁻=5H₂O₂×2e⁻'],
      explicacao:'2KMnO₄+5H₂O₂+3H₂SO₄→2MnSO₄+K₂SO₄+8H₂O+5O₂  ·  Iodometria: H₂O₂ reduz KMnO₄ — solução roxa vira incolor' },
    { id:'kmno4_feso4', icon:'⚡', familia:'Permanganatometria',
      titulo:'2 KMnO₄ + 10 FeSO₄ + 8 H₂SO₄ → 2 MnSO₄ + 5 Fe₂(SO₄)₃ + K₂SO₄ + 8 H₂O',
      reagentes:['KMnO₄','FeSO₄','H₂SO₄'], condicao:'ácido', coefR:{'KMnO₄':2,'FeSO₄':10,'H₂SO₄':8}, coefP:[2,5,1,8],
      produtos_visuais:['MnSO₄','Fe₂(SO₄)₃','K₂SO₄','H₂O'],
      candidatos:['MnSO₄','Fe₂(SO₄)₃','K₂SO₄','H₂O','KMnO₄','FeCl₃','MnO₂','NaCl'],
      gabarito:{ produtos:['mnso4','sulfato de manganes','fe2(so4)3','sulfato de ferro iii','k2so4','sulfato de potassio','h2o','agua'],
        equacaoBalanceada:'2 KMnO₄ + 10 FeSO₄ + 8 H₂SO₄ → 2 MnSO₄ + 5 Fe₂(SO₄)₃ + K₂SO₄ + 8 H₂O' },
      hints:['KMnO₄ é indicador próprio: roxa→incolor no ponto de equivalência. Fe²⁺→Fe³⁺, Mn⁷⁺→Mn²⁺'],
      explicacao:'2KMnO₄+10FeSO₄+8H₂SO₄→…  ·  Base da permanganatometria — determinação de Fe²⁺ em minérios de ferro' },
    { id:'kmno4_hcl', icon:'⚡', familia:'Oxirredução',
      titulo:'2 KMnO₄ + 16 HCl → 2 MnCl₂ + 5 Cl₂ + 2 KCl + 8 H₂O',
      reagentes:['KMnO₄','HCl'], condicao:'', coefR:{'KMnO₄':2,'HCl':16}, coefP:[2,5,2,8],
      produtos_visuais:['MnCl₂','Cl₂','KCl','H₂O'],
      candidatos:['MnCl₂','Cl₂','KCl','H₂O','MnO₂','MnSO₄','HClO','NaCl'],
      gabarito:{ produtos:['mncl2','cloreto de manganes','cl2','cloro','kcl','cloreto de potassio','h2o','agua'],
        equacaoBalanceada:'2 KMnO₄ + 16 HCl → 2 MnCl₂ + 5 Cl₂↑ + 2 KCl + 8 H₂O' },
      hints:['HCl é oxidado: Cl⁻→Cl₂ (5×2e⁻=10e⁻). Mn⁷⁺+5e⁻→Mn²⁺ (2×5e⁻=10e⁻) ✓'],
      explicacao:'2KMnO₄+16HCl→2MnCl₂+5Cl₂+2KCl+8H₂O  ·  KMnO₄ oxida HCl liberando Cl₂ — produção de cloro' },
  ],

  'AlCl3': [
    { id:'alcl3_naoh', icon:'🔬', familia:'Precipitação',
      titulo:'AlCl₃ + 3 NaOH → Al(OH)₃↓ + 3 NaCl',
      reagentes:['AlCl₃','NaOH'], condicao:'', coefR:{'AlCl₃':1,'NaOH':3}, coefP:[1,3],
      produtos_visuais:['Al(OH)₃','NaCl'],
      candidatos:['Al(OH)₃','NaCl','NaAlO₂','Al₂O₃','AlCl₃','Na₂SO₄','Al(OH)Cl₂','NaNO₃'],
      gabarito:{ produtos:['al(oh)3','hidroxido de aluminio','nacl','cloreto de sodio'],
        equacaoBalanceada:'AlCl₃(aq) + 3 NaOH(aq) → Al(OH)₃↓(s) + 3 NaCl(aq)' },
      hints:['Al³⁺+3OH⁻→Al(OH)₃↓ (gelatinoso branco). 3Na⁺+3Cl⁻→3NaCl(aq). Em excesso de NaOH: dissolve!'],
      explicacao:'AlCl₃+3NaOH→Al(OH)₃↓+3NaCl  ·  Coagulação em ETAs: AlCl₃ precipita Al(OH)₃ que arrasta impurezas' },
    { id:'alcl3_naoh_exc', icon:'⚡', familia:'Deslocamento (Anfótero)',
      titulo:'AlCl₃ + 4 NaOH → NaAlO₂ + 3 NaCl + 2 H₂O',
      reagentes:['AlCl₃','NaOH'], condicao:'excesso', coefR:{'AlCl₃':1,'NaOH':4}, coefP:[1,3,2],
      produtos_visuais:['NaAlO₂','NaCl','H₂O'],
      candidatos:['NaAlO₂','NaCl','H₂O','Al(OH)₃','Al₂O₃','NaOH','Na₂AlO₃','AlCl₃'],
      gabarito:{ produtos:['naaio2','aluminato de sodio','nacl','cloreto de sodio','h2o','agua'],
        equacaoBalanceada:'AlCl₃(aq) + 4 NaOH(aq) → NaAlO₂(aq) + 3 NaCl(aq) + 2 H₂O(l)' },
      hints:['Em excesso de NaOH: Al(OH)₃ dissolve! Al(OH)₃+OH⁻→AlO₂⁻+2H₂O. Al³⁺ anfótero'],
      explicacao:'AlCl₃+4NaOH(exc)→NaAlO₂+3NaCl+2H₂O  ·  Al anfótero dissolve em excesso de base — formação de aluminato' },
    { id:'alcl3_h2o', icon:'💧', familia:'Hidrólise',
      titulo:'AlCl₃ + 3 H₂O → Al(OH)₃ + 3 HCl',
      reagentes:['AlCl₃','H₂O'], condicao:'', coefR:{'AlCl₃':1,'H₂O':3}, coefP:[1,3],
      produtos_visuais:['Al(OH)₃','HCl'],
      candidatos:['Al(OH)₃','HCl','AlCl₂OH','Al₂O₃','NaCl','Al(OH)Cl₂','AlOCl','Al(NO₃)₃'],
      gabarito:{ produtos:['al(oh)3','hidroxido de aluminio','hcl','acido cloridrico'],
        equacaoBalanceada:'AlCl₃(s) + 3 H₂O(l) → Al(OH)₃(s) + 3 HCl(g)' },
      hints:['AlCl₃ reage violentamente com água! Al³⁺ polariza H₂O→H⁺+OH⁻. Hidrólise ácida intensa'],
      explicacao:'AlCl₃+3H₂O→Al(OH)₃+3HCl  ·  Hidrólise violenta: libera HCl gasoso — antiperspirante age por hidrólise parcial obstruindo poros' },
  ],

  'N2O5': [
    { id:'n2o5_h2o', icon:'💧', familia:'Síntese',
      titulo:'N₂O₅ + H₂O → 2 HNO₃',
      reagentes:['N₂O₅','H₂O'], condicao:'', coefR:{'N₂O₅':1,'H₂O':1}, coefP:[2],
      produtos_visuais:['HNO₃'],
      candidatos:['HNO₃','HNO₂','NO₂','N₂O₃','HClO₃','H₂SO₄','HCl','NO'],
      gabarito:{ produtos:['hno3','acido nitrico'],
        equacaoBalanceada:'N₂O₅(s) + H₂O(l) → 2 HNO₃(aq)' },
      hints:['Óxido ácido+água→ácido. N₂O₅ é o anidrido do HNO₃. 1N₂O₅+H₂O→2HNO₃'],
      explicacao:'N₂O₅+H₂O→2HNO₃  ·  N₂O₅ = anidrido nítrico — reage violentamente com água regenerando HNO₃' },
    { id:'n2o5_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'N₂O₅ + 2 NaOH → 2 NaNO₃ + H₂O',
      reagentes:['N₂O₅','NaOH'], condicao:'', coefR:{'N₂O₅':1,'NaOH':2}, coefP:[2,1],
      produtos_visuais:['NaNO₃','H₂O'],
      candidatos:['NaNO₃','H₂O','NaNO₂','Na₂N₂O₅','NaCl','Na₂O','NaOH','NaHNO₃'],
      gabarito:{ produtos:['nano3','nitrato de sodio','h2o','agua'],
        equacaoBalanceada:'N₂O₅(s) + 2 NaOH(aq) → 2 NaNO₃(aq) + H₂O(l)' },
      hints:['Óxido ácido+base→sal+água. N₂O₅+2NaOH: 2HNO₃+2NaOH→2NaNO₃+2H₂O (equivalente)'],
      explicacao:'N₂O₅+2NaOH→2NaNO₃+H₂O  ·  Óxido ácido neutralizado por base — formação de salitre sintético' },
    { id:'n2o5_decomp', icon:'🌡️', familia:'Decomposição',
      titulo:'2 N₂O₅ → 4 NO₂ + O₂',
      reagentes:['N₂O₅'], condicao:'Δ ou luz', coefR:{'N₂O₅':2}, coefP:[4,1],
      produtos_visuais:['NO₂','O₂'],
      candidatos:['NO₂','O₂','NO','N₂O','N₂','HNO₃','N₂O₃','N₂O₄'],
      gabarito:{ produtos:['no2','dioxido de nitrogenio','o2','oxigenio'],
        equacaoBalanceada:'2 N₂O₅(g) →(Δ)→ 4 NO₂(g) + O₂(g)' },
      hints:['N₂O₅ é instável. N⁺⁵→N⁺⁴(NO₂) + O₂. 2N₂O₅→4NO₂+O₂'],
      explicacao:'2N₂O₅→4NO₂+O₂  ·  Decomposição espontânea de N₂O₅ — reação de 1ª ordem estudada para cinética química' },
  ],

  'P2O5': [
    { id:'p2o5_h2o', icon:'💧', familia:'Síntese',
      titulo:'P₂O₅ + 3 H₂O → 2 H₃PO₄',
      reagentes:['P₂O₅','H₂O'], condicao:'', coefR:{'P₂O₅':1,'H₂O':3}, coefP:[2],
      produtos_visuais:['H₃PO₄'],
      candidatos:['H₃PO₄','H₃PO₃','HPO₃','H₄P₂O₇','H₂SO₄','HNO₃','H₃PO₂','H₂O'],
      gabarito:{ produtos:['h3po4','acido fosforico'],
        equacaoBalanceada:'P₄O₁₀(s) + 6 H₂O(l) → 4 H₃PO₄(aq)  [simplif.: P₂O₅ + 3H₂O → 2H₃PO₄]' },
      hints:['P₂O₅ (real: P₄O₁₀) + H₂O → H₃PO₄. Anidrido fosfórico reage VIOLENTAMENTE com água'],
      explicacao:'P₂O₅+3H₂O→2H₃PO₄  ·  P₂O₅ é o dessecante mais potente — absorve água formando H₃PO₄' },
    { id:'p2o5_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'P₂O₅ + 6 NaOH → 2 Na₃PO₄ + 3 H₂O',
      reagentes:['P₂O₅','NaOH'], condicao:'', coefR:{'P₂O₅':1,'NaOH':6}, coefP:[2,3],
      produtos_visuais:['Na₃PO₄','H₂O'],
      candidatos:['Na₃PO₄','H₂O','Na₂HPO₄','NaH₂PO₄','Na₂SO₄','NaCl','Na₄P₂O₇','Na₃PO₃'],
      gabarito:{ produtos:['na3po4','fosfato de sodio','h2o','agua'],
        equacaoBalanceada:'P₂O₅(s) + 6 NaOH(aq) → 2 Na₃PO₄(aq) + 3 H₂O(l)' },
      hints:['P₂O₅≡2H₃PO₄ (anidrido). 2H₃PO₄+6NaOH→2Na₃PO₄+6H₂O. 6 NaOH/P₂O₅'],
      explicacao:'P₂O₅+6NaOH→2Na₃PO₄+3H₂O  ·  Neutralização total do anidrido fosfórico — formação de Na₃PO₄ (detergente industrial)' },
    { id:'p2o5_cao', icon:'🔥', familia:'Síntese',
      titulo:'3 CaO + P₂O₅ → Ca₃(PO₄)₂',
      reagentes:['CaO','P₂O₅'], condicao:'Δ', coefR:{'CaO':3,'P₂O₅':1}, coefP:[1],
      produtos_visuais:['Ca₃(PO₄)₂'],
      candidatos:['Ca₃(PO₄)₂','CaHPO₄','Ca(H₂PO₄)₂','CaSO₄','CaCO₃','CaCl₂','CaO','Ca₂P₂O₇'],
      gabarito:{ produtos:['ca3(po4)2','fosfato de calcio'],
        equacaoBalanceada:'3 CaO(s) + P₂O₅(s) →(Δ)→ Ca₃(PO₄)₂(s)' },
      hints:['Óxido básico+óxido ácido→sal. 3CaO+P₂O₅→Ca₃(PO₄)₂. Mineral dos ossos!'],
      explicacao:'3CaO+P₂O₅→Ca₃(PO₄)₂  ·  Reação óxido-óxido — formação do fosfato tricálcico (base dos ossos e dentes)' },
  ],

  };

  Object.keys(r2).forEach(function(k){
    if(!REACOES_LIVRES[k]) REACOES_LIVRES[k] = [];
    r2[k].forEach(function(rxn){ REACOES_LIVRES[k].push(rxn); });
  });
})();



/* ═══════════════════════════════════════════════════════════════
   EXPANSÃO 3 — Novas reações livres
   Baseadas em: questões ENEM 2015-2025, vestibulares FUVEST/UNICAMP/
   MACKENZIE/UFMG, Manual da Química, Toda Matéria e IUPAC 2005
═══════════════════════════════════════════════════════════════ */
(function(){
  var r3 = {

  /* ══ H₂SO₄ — 3 novas reações (processo industrial, oxidante, baterias) ══ */
  'H2SO4': [
    {
      id:'h2so4_zn', icon:'⚡', familia:'Deslocamento / Oxirredução',
      titulo:'Zn + H₂SO₄ → ZnSO₄ + H₂',
      reagentes:['Zn','H₂SO₄'], condicao:'diluído', coefR:{'Zn':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['ZnSO₄','H₂'],
      candidatos:['ZnSO₄','H₂','ZnO','ZnCl₂','ZnCO₃','H₂O','Na₂SO₄','FeSO₄'],
      gabarito:{ produtos:['znso4','sulfato de zinco','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)' },
      hints:['Zn está acima do H na série de reatividade. Zn→Zn²⁺+2e⁻ / 2H⁺+2e⁻→H₂↑','ZnSO₄ fica em solução; H₂ sobe como gás. Coeficiente: 1:1:1:1'],
      explicacao:'Zn+H₂SO₄→ZnSO₄+H₂  ·  Metal ativo desloca H⁺. Usado para produzir H₂ em laboratório e galvanizar aço'
    },
    {
      id:'h2so4_cu_conc', icon:'🌡️', familia:'Oxidação / Ácido Concentrado',
      titulo:'Cu + 2 H₂SO₄(conc) → CuSO₄ + SO₂ + 2 H₂O',
      reagentes:['Cu','H₂SO₄'], condicao:'conc./Δ', coefR:{'Cu':1,'H₂SO₄':2}, coefP:[1,1,2],
      produtos_visuais:['CuSO₄','SO₂','H₂O'],
      candidatos:['CuSO₄','SO₂','H₂O','CuO','H₂','Na₂SO₄','Cu₂O','SO₃'],
      gabarito:{ produtos:['cuso4','sulfato de cobre','so2','dioxido de enxofre','h2o','agua'],
        equacaoBalanceada:'Cu(s) + 2 H₂SO₄(conc)(aq) →(Δ)→ CuSO₄(aq) + SO₂(g) + 2 H₂O(l)' },
      hints:['H₂SO₄ concentrado é oxidante forte: reage com Cu (inativo com H₂SO₄ diluído). S⁺⁶→S⁺⁴ (SO₂)','Azul do CuSO₄ + SO₂ fumegante. Cu não reage com ácido diluído, mas reage com concentrado quente'],
      explicacao:'Cu+2H₂SO₄(conc)→CuSO₄+SO₂+2H₂O  ·  H₂SO₄ conc. age como oxidante (≠ diluído que libera H₂). Exemplo clássico de oxirredução'
    },
    {
      id:'h2so4_so3', icon:'🏭', familia:'Síntese Industrial (Processo de Contato)',
      titulo:'SO₃ + H₂O → H₂SO₄',
      reagentes:['SO₃','H₂O'], condicao:'', coefR:{'SO₃':1,'H₂O':1}, coefP:[1],
      produtos_visuais:['H₂SO₄'],
      candidatos:['H₂SO₄','H₂SO₃','H₂S₂O₇','H₂SO₄','SO₂','HCl','H₃PO₄','H₂O'],
      gabarito:{ produtos:['h2so4','acido sulfurico'],
        equacaoBalanceada:'SO₃(g) + H₂O(l) → H₂SO₄(l)' },
      hints:['Óxido ácido + água → ácido. SO₃ é o anidrido do H₂SO₄. Última etapa do processo de contato','Industrialmente SO₃ é absorvido em H₂SO₄ 97% (oleum) e depois diluído. Gera ~250 Mt/ano de H₂SO₄'],
      explicacao:'SO₃+H₂O→H₂SO₄  ·  Etapa final do processo de contato (S→SO₂→SO₃→H₂SO₄). H₂SO₄ é o produto químico mais produzido no mundo'
    },
  ],

  /* ══ HCl — 3 novas reações (precipitação, amadurecimento industrial) ══ */
  'HCl': [
    {
      id:'hcl_agno3_precip', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'HCl + AgNO₃ → AgCl↓ + HNO₃',
      reagentes:['HCl','AgNO₃'], condicao:'', coefR:{'HCl':1,'AgNO₃':1}, coefP:[1,1],
      produtos_visuais:['AgCl','HNO₃'],
      candidatos:['AgCl','HNO₃','AgBr','AgI','NaCl','AgNO₂','HCl','NaNO₃'],
      gabarito:{ produtos:['agcl','cloreto de prata','hno3','acido nitrico'],
        equacaoBalanceada:'HCl(aq) + AgNO₃(aq) → AgCl(s)↓ + HNO₃(aq)' },
      hints:['Ag⁺ + Cl⁻ → AgCl↓ branco (insolúvel). Teste clássico para detectar Cl⁻. HNO₃ permanece em solução','AgCl é fotossensível: escurece ao sol (Ag metálica). Base da fotografia analógica'],
      explicacao:'HCl+AgNO₃→AgCl↓+HNO₃  ·  AgCl precipitado branco — teste qualitativo para halogênio cloreto. Fundamento da fotografia em prata'
    },
    {
      id:'hcl_fe', icon:'⚡', familia:'Deslocamento / Oxirredução',
      titulo:'Fe + 2 HCl → FeCl₂ + H₂',
      reagentes:['Fe','HCl'], condicao:'', coefR:{'Fe':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['FeCl₂','H₂'],
      candidatos:['FeCl₂','H₂','FeCl₃','FeO','Fe₂O₃','H₂O','NaCl','FeSO₄'],
      gabarito:{ produtos:['fecl2','cloreto de ferro','h2','hidrogenio'],
        equacaoBalanceada:'Fe(s) + 2 HCl(aq) → FeCl₂(aq) + H₂(g)' },
      hints:['Fe está acima de H na série. Fe→Fe²⁺+2e⁻. 2H⁺+2e⁻→H₂. Com HCl, o Fe forma cloreto de Fe(II)','Fe + HCl diluído → Fe²⁺ (não Fe³⁺). Com HNO₃ ou H₂SO₄ concentrado, pode dar Fe³⁺'],
      explicacao:'Fe+2HCl→FeCl₂+H₂  ·  Metal ativo + ácido diluído → sal de Fe(II) + H₂. Diferente do Cl₂ que forma FeCl₃'
    },
    {
      id:'hcl_al', icon:'⚡', familia:'Deslocamento / Oxirredução',
      titulo:'2 Al + 6 HCl → 2 AlCl₃ + 3 H₂',
      reagentes:['Al','HCl'], condicao:'', coefR:{'Al':2,'HCl':6}, coefP:[2,3],
      produtos_visuais:['AlCl₃','H₂'],
      candidatos:['AlCl₃','H₂','Al₂O₃','Al(OH)₃','FeCl₂','ZnCl₂','NaCl','AlF₃'],
      gabarito:{ produtos:['alcl3','cloreto de aluminio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 6 HCl(aq) → 2 AlCl₃(aq) + 3 H₂(g)' },
      hints:['Al é muito reativo (acima de H na série). 2Al→2Al³⁺+6e⁻. 6H⁺+6e⁻→3H₂','O Al natural é protegido por Al₂O₃ passivante. HCl dissolve essa camada e expõe o metal'],
      explicacao:'2Al+6HCl→2AlCl₃+3H₂  ·  Al dissolve em HCl (ácido) mas NÃO em HNO₃ concentrado (passivação). Exemplo de metal anfótero com ácido'
    },
  ],

  /* ══ NaOH — 3 novas reações ══ */
  'NaOH': [
    {
      id:'naoh_al_anfotero', icon:'⚡', familia:'Deslocamento (Anfótero)',
      titulo:'2 Al + 2 NaOH + 2 H₂O → 2 NaAlO₂ + 3 H₂',
      reagentes:['Al','NaOH','H₂O'], condicao:'', coefR:{'Al':2,'NaOH':2,'H₂O':2}, coefP:[2,3],
      produtos_visuais:['NaAlO₂','H₂'],
      candidatos:['NaAlO₂','H₂','Al(OH)₃','Al₂O₃','AlCl₃','Na₂O','NaCl','AlF₃'],
      gabarito:{ produtos:['naalO2','aluminato de sodio','h2','hidrogenio'],
        equacaoBalanceada:'2 Al(s) + 2 NaOH(aq) + 2 H₂O(l) → 2 NaAlO₂(aq) + 3 H₂(g)' },
      hints:['Al é anfótero: reage com ácido E com base! Al + NaOH forma aluminato (NaAlO₂) + H₂','Al³⁺ + 4OH⁻ → [Al(OH)₄]⁻ → AlO₂⁻ + 2H₂O. Isso explica por que Al não se usa em tubulações com NaOH'],
      explicacao:'2Al+2NaOH+2H₂O→2NaAlO₂+3H₂  ·  Al anfótero reage com base forte — tema recorrente no ENEM. Explica efervescência ao colocar Al em NaOH'
    },
    {
      id:'naoh_co2_carbonato', icon:'🌿', familia:'Síntese / Absorção de CO₂',
      titulo:'CO₂ + 2 NaOH → Na₂CO₃ + H₂O',
      reagentes:['CO₂','NaOH'], condicao:'excesso NaOH', coefR:{'CO₂':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Na₂CO₃','H₂O'],
      candidatos:['Na₂CO₃','H₂O','NaHCO₃','Na₂O','NaCl','NaOH','CO₂','Na₂SO₄'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua'],
        equacaoBalanceada:'CO₂(g) + 2 NaOH(aq) → Na₂CO₃(aq) + H₂O(l)' },
      hints:['Óxido ácido + base forte → sal + água. Com excesso de NaOH → Na₂CO₃. Com 1:1 → NaHCO₃','CO₂+NaOH(excesso)→Na₂CO₃. CO₂+NaOH(1:1)→NaHCO₃. Razão molar define o produto!'],
      explicacao:'CO₂+2NaOH→Na₂CO₃+H₂O  ·  Reação de absorção industrial de CO₂. Scrubbers de NaOH capturam CO₂ de gases de combustão'
    },
    {
      id:'naoh_fecl3_precip', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'FeCl₃ + 3 NaOH → Fe(OH)₃↓ + 3 NaCl',
      reagentes:['FeCl₃','NaOH'], condicao:'', coefR:{'FeCl₃':1,'NaOH':3}, coefP:[1,3],
      produtos_visuais:['Fe(OH)₃','NaCl'],
      candidatos:['Fe(OH)₃','NaCl','Fe(OH)₂','FeO','Fe₂O₃','NaOH','FeSO₄','Na₂SO₄'],
      gabarito:{ produtos:['fe(oh)3','hidroxido de ferro','nacl','cloreto de sodio'],
        equacaoBalanceada:'FeCl₃(aq) + 3 NaOH(aq) → Fe(OH)₃(s)↓ + 3 NaCl(aq)' },
      hints:['Fe³⁺+3OH⁻→Fe(OH)₃↓ castanho avermelhado. Na⁺+Cl⁻ ficam em solução','Fe(OH)₃ é insolúvel (Kps=2,8×10⁻³⁹). Precipitado castanho-alaranjado — parece ferrugem. Teste de Fe³⁺'],
      explicacao:'FeCl₃+3NaOH→Fe(OH)₃↓+3NaCl  ·  Precipitado castanho-alaranjado. Teste qualitativo para Fe³⁺ em solução. Fundamento do tratamento de água com coagulação'
    },
  ],

  /* ══ NH₃ — 3 novas reações (Haber-Bosch, fertilizantes) ══ */
  'NH3': [
    {
      id:'nh3_haber', icon:'🏭', familia:'Síntese Industrial (Haber-Bosch)',
      titulo:'N₂ + 3 H₂ → 2 NH₃',
      reagentes:['N₂','H₂'], condicao:'Fe/400°C/200atm', coefR:{'N₂':1,'H₂':3}, coefP:[2],
      produtos_visuais:['NH₃'],
      candidatos:['NH₃','N₂H₄','NO','NO₂','NH₄Cl','HNO₃','N₂O','NH₄NO₃'],
      gabarito:{ produtos:['nh3','amonia'],
        equacaoBalanceada:'N₂(g) + 3 H₂(g) ⇌(Fe,400°C,200atm) 2 NH₃(g)' },
      hints:['Síntese de Haber-Bosch: N₂ (ar) + H₂ (gás natural) → NH₃. Catalisador: Fe + K₂O','Equilíbrio reversível (⇌). Alta pressão e temperatura moderada favorecem NH₃. ~80% do nitrogênio dos fertilizantes vem desta reação'],
      explicacao:'N₂+3H₂⇌2NH₃  ·  Processo Haber-Bosch (1909). Responsável por alimentar ~50% da humanidade via fertilizantes nitrogenados. Nobel de Química 1918 (Haber)'
    },
    {
      id:'nh3_oxidacao_ostwald', icon:'🏭', familia:'Oxidação Catalítica',
      titulo:'4 NH₃ + 5 O₂ → 4 NO + 6 H₂O',
      reagentes:['NH₃','O₂'], condicao:'Pt/830°C', coefR:{'NH₃':4,'O₂':5}, coefP:[4,6],
      produtos_visuais:['NO','H₂O'],
      candidatos:['NO','H₂O','NO₂','N₂','N₂O','HNO₃','N₂O₃','NH₄NO₃'],
      gabarito:{ produtos:['no','monoxido de nitrogenio','h2o','agua'],
        equacaoBalanceada:'4 NH₃(g) + 5 O₂(g) →(Pt,830°C)→ 4 NO(g) + 6 H₂O(g)' },
      hints:['Processo Ostwald — 1ª etapa da produção de HNO₃. NH₃ é oxidada a NO com catalisador de platina','4NH₃+5O₂→4NO+6H₂O (Ostwald). Depois: 2NO+O₂→2NO₂. Depois: 3NO₂+H₂O→2HNO₃+NO'],
      explicacao:'4NH₃+5O₂→4NO+6H₂O  ·  1ª etapa do processo Ostwald para produção de HNO₃ industrial. NH₃→NO→NO₂→HNO₃. Toda a indústria de explosivos depende desta reação'
    },
    {
      id:'nh3_h2so4_sal', icon:'⚗️', familia:'Neutralização',
      titulo:'2 NH₃ + H₂SO₄ → (NH₄)₂SO₄',
      reagentes:['NH₃','H₂SO₄'], condicao:'', coefR:{'NH₃':2,'H₂SO₄':1}, coefP:[1],
      produtos_visuais:['(NH₄)₂SO₄'],
      candidatos:['(NH₄)₂SO₄','NH₄Cl','NH₄NO₃','Na₂SO₄','(NH₄)₂CO₃','NH₄HSO₄','NaCl','H₂O'],
      gabarito:{ produtos:['(nh4)2so4','sulfato de amonio'],
        equacaoBalanceada:'2 NH₃(aq) + H₂SO₄(aq) → (NH₄)₂SO₄(aq)' },
      hints:['NH₃ atua como base: NH₃+H⁺→NH₄⁺. H₂SO₄ dibásico precisa de 2 NH₃. Produto: sal de amônio','(NH₄)₂SO₄ é fertilizante nitrogenado muito usado. Fornece N e S ao solo'],
      explicacao:'2NH₃+H₂SO₄→(NH₄)₂SO₄  ·  Sulfato de amônio — fertilizante nitrogenado mundial (produção >10 Mt/ano). Fornece N assimilável pelas plantas'
    },
  ],

  /* ══ HNO₃ — 2 novas reações (metais, oxidante) ══ */
  'HNO3': [
    {
      id:'hno3_fe_diluido', icon:'⚡', familia:'Oxidação / Ácido Diluído',
      titulo:'4 Fe + 10 HNO₃(diluído) → 4 Fe(NO₃)₂ + NH₄NO₃ + 3 H₂O',
      reagentes:['Fe','HNO₃'], condicao:'muito diluído', coefR:{'Fe':4,'HNO₃':10}, coefP:[4,1,3],
      produtos_visuais:['Fe(NO₃)₂','NH₄NO₃','H₂O'],
      candidatos:['Fe(NO₃)₂','NH₄NO₃','H₂O','Fe(NO₃)₃','NO','NO₂','FeCl₃','Fe₂O₃'],
      gabarito:{ produtos:['fe(no3)2','nitrato de ferro','nh4no3','nitrato de amonio','h2o','agua'],
        equacaoBalanceada:'4 Fe(s) + 10 HNO₃(muito diluído) → 4 Fe(NO₃)₂(aq) + NH₄NO₃(aq) + 3 H₂O(l)' },
      hints:['HNO₃ muito diluído é oxidante fraco: N⁺⁵→N⁻³ (NH₄⁺). Fe→Fe²⁺','Com HNO₃ diluído: NO. Com HNO₃ muito diluído: NH₄⁺. Com HNO₃ concentrado: NO₂. Grau de oxidação varia com concentração'],
      explicacao:'Fe+HNO₃(muito dil.)→Fe(NO₃)₂+NH₄NO₃+H₂O  ·  Diferença crucial: concentração do ácido determina o produto da redução do N (NO₂/NO/NH₄⁺)'
    },
    {
      id:'hno3_cu_diluido', icon:'⚡', familia:'Oxidação / Ácido Diluído',
      titulo:'3 Cu + 8 HNO₃(diluído) → 3 Cu(NO₃)₂ + 2 NO + 4 H₂O',
      reagentes:['Cu','HNO₃'], condicao:'diluído', coefR:{'Cu':3,'HNO₃':8}, coefP:[3,2,4],
      produtos_visuais:['Cu(NO₃)₂','NO','H₂O'],
      candidatos:['Cu(NO₃)₂','NO','H₂O','NO₂','CuO','Cu₂O','CuSO₄','N₂O'],
      gabarito:{ produtos:['cu(no3)2','nitrato de cobre','no','monoxido de nitrogenio','h2o','agua'],
        equacaoBalanceada:'3 Cu(s) + 8 HNO₃(diluído)(aq) → 3 Cu(NO₃)₂(aq) + 2 NO(g) + 4 H₂O(l)' },
      hints:['Cu não reage com H₂SO₄ diluído, mas reage com HNO₃ (oxidante). Diluído → NO. Concentrado → NO₂','3Cu→3Cu²⁺+6e⁻. 2NO₃⁻+8H⁺+6e⁻→2NO+4H₂O. Balancear por oxirredução!'],
      explicacao:'3Cu+8HNO₃(dil.)→3Cu(NO₃)₂+2NO+4H₂O  ·  HNO₃ diluído produz NO (incolor→marrom ao oxidar a NO₂ no ar). Clássica questão de vestibular sobre metais e HNO₃'
    },
  ],

  /* ══ H₂CO₃ — nova reação ══ */
  'H2CO3': [
    {
      id:'h2co3_nahco3_decomp', icon:'🌡️', familia:'Decomposição / Cotidiano',
      titulo:'2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂',
      reagentes:['NaHCO₃'], condicao:'Δ', coefR:{'NaHCO₃':2}, coefP:[1,1,1],
      produtos_visuais:['Na₂CO₃','H₂O','CO₂'],
      candidatos:['Na₂CO₃','H₂O','CO₂','NaCl','NaOH','NaNO₃','Na₂O','NaHSO₄'],
      gabarito:{ produtos:['na2co3','carbonato de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'2 NaHCO₃(s) →(Δ)→ Na₂CO₃(s) + H₂O(g) + CO₂(g)' },
      hints:['NaHCO₃ (bicarbonato) decompõe ao aquecer. Dois NaHCO₃ formam um Na₂CO₃ + CO₂ + H₂O','É essa reação que faz o bolo crescer no forno! Fermento = NaHCO₃. CO₂ faz a massa expandir'],
      explicacao:'2NaHCO₃→Na₂CO₃+H₂O+CO₂  ·  Reação do fermento químico (bicarbonato de sódio). CO₂ gerado no forno faz o bolo crescer. Também ocorre em pastilhas antiácido aquecidas'
    },
  ],

  /* ══ CaO — 2 novas reações ══ */
  'CaO': [
    {
      id:'cao_co2_sindrome', icon:'🔥', familia:'Síntese / Indústria',
      titulo:'CaO + CO₂ → CaCO₃',
      reagentes:['CaO','CO₂'], condicao:'', coefR:{'CaO':1,'CO₂':1}, coefP:[1],
      produtos_visuais:['CaCO₃'],
      candidatos:['CaCO₃','CaSO₄','CaO','Ca(OH)₂','Ca(HCO₃)₂','CaCl₂','CO₂','MgCO₃'],
      gabarito:{ produtos:['caco3','carbonato de calcio'],
        equacaoBalanceada:'CaO(s) + CO₂(g) → CaCO₃(s)' },
      hints:['Óxido básico + óxido ácido → sal. CaO + CO₂ → CaCO₃. Reação inversa da calcinação','Esta é a reação oposta ao Exp 2 (decomposição do calcário). Ocorre naturalmente na formação de estalactites'],
      explicacao:'CaO+CO₂→CaCO₃  ·  Formação do calcário a partir da cal viva. Reação inversa da calcinação. Ocorre em furnas kársticas na formação de estalactites e estalagmites'
    },
    {
      id:'cao_so3_anidro', icon:'🏭', familia:'Síntese / Neutralização Anidra',
      titulo:'CaO + SO₃ → CaSO₄',
      reagentes:['CaO','SO₃'], condicao:'', coefR:{'CaO':1,'SO₃':1}, coefP:[1],
      produtos_visuais:['CaSO₄'],
      candidatos:['CaSO₄','CaSO₃','CaO','CaCO₃','CaCl₂','Ca(OH)₂','Na₂SO₄','CaO'],
      gabarito:{ produtos:['caso4','sulfato de calcio'],
        equacaoBalanceada:'CaO(s) + SO₃(g) → CaSO₄(s)' },
      hints:['Óxido básico + óxido ácido → sal. CaO + SO₃ → CaSO₄ (gesso anidro)','Essa reação ocorre em termelétricas com dessulfurização: SO₂+½O₂→SO₃, depois CaO captura SO₃'],
      explicacao:'CaO+SO₃→CaSO₄  ·  Dessulfurização de gases industriais. Termelétricas usam calcário (→CaO) para capturar SO₃ e evitar chuva ácida. Produto: gesso (CaSO₄)'
    },
  ],

  /* ══ CO₂ — 2 novas reações ══ */
  'CO2': [
    {
      id:'co2_ca_oh2_excesso', icon:'🔬', familia:'Dupla Troca (excesso CO₂)',
      titulo:'CaCO₃ + CO₂ + H₂O → Ca(HCO₃)₂',
      reagentes:['CaCO₃','CO₂','H₂O'], condicao:'CO₂ excesso', coefR:{'CaCO₃':1,'CO₂':1,'H₂O':1}, coefP:[1],
      produtos_visuais:['Ca(HCO₃)₂'],
      candidatos:['Ca(HCO₃)₂','CaSO₄','CaCl₂','Ca(OH)₂','CaCO₃','CaO','CO₂','NaHCO₃'],
      gabarito:{ produtos:['ca(hco3)2','bicarbonato de calcio'],
        equacaoBalanceada:'CaCO₃(s) + CO₂(g) + H₂O(l) → Ca(HCO₃)₂(aq)' },
      hints:['Com excesso de CO₂ o CaCO₃ (insolúvel) dissolve formando Ca(HCO₃)₂ (solúvel)','Esta é a razão da dureza temporária da água. Aquecimento reverte: Ca(HCO₃)₂→CaCO₃+CO₂+H₂O (incrustrações)'],
      explicacao:'CaCO₃+CO₂+H₂O→Ca(HCO₃)₂  ·  Dissolução do calcário com CO₂ excesso. Causa a dureza temporária da água. Forma grutas kársticas; ao aquecer, CaCO₃ deposita e entupe canos'
    },
    {
      id:'co2_na2o_basico', icon:'🔥', familia:'Síntese',
      titulo:'CO₂ + Na₂O → Na₂CO₃',
      reagentes:['CO₂','Na₂O'], condicao:'', coefR:{'CO₂':1,'Na₂O':1}, coefP:[1],
      produtos_visuais:['Na₂CO₃'],
      candidatos:['Na₂CO₃','NaOH','NaHCO₃','Na₂SO₄','NaCl','Na₂O','CO₂','NaNO₃'],
      gabarito:{ produtos:['na2co3','carbonato de sodio'],
        equacaoBalanceada:'CO₂(g) + Na₂O(s) → Na₂CO₃(s)' },
      hints:['Óxido ácido + óxido básico → sal. CO₂ (anidrido carbônico) + Na₂O → Na₂CO₃','Regra geral: óxido ácido + óxido básico → sal (sem água). Produto: carbonato de sódio (soda ash)'],
      explicacao:'CO₂+Na₂O→Na₂CO₃  ·  Óxido ácido + óxido básico → sal (sem água). Exemplo pedagógico da reação entre óxidos. Na₂CO₃ industrial é feito pelo processo Solvay (não esta via)'
    },
  ],

  /* ══ CaCO₃ — nova reação (calcário e chuva ácida) ══ */
  'CaCO3': [
    {
      id:'caco3_hno3_chuva', icon:'🌧️', familia:'Dupla Troca / Chuva Ácida',
      titulo:'CaCO₃ + 2 HNO₃ → Ca(NO₃)₂ + H₂O + CO₂',
      reagentes:['CaCO₃','HNO₃'], condicao:'', coefR:{'CaCO₃':1,'HNO₃':2}, coefP:[1,1,1],
      produtos_visuais:['Ca(NO₃)₂','H₂O','CO₂'],
      candidatos:['Ca(NO₃)₂','H₂O','CO₂','CaCl₂','CaSO₄','CaO','NaNO₃','Ca(HCO₃)₂'],
      gabarito:{ produtos:['ca(no3)2','nitrato de calcio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'CaCO₃(s) + 2 HNO₃(aq) → Ca(NO₃)₂(aq) + H₂O(l) + CO₂(g)' },
      hints:['Carbonato + ácido → sal + água + CO₂ (gás). CaCO₃ + HNO₃ → sal solúvel + efervescência','Chuva ácida contém HNO₃. Ao atingir monumentos de calcário (CaCO₃), corrói formando Ca(NO₃)₂ solúvel'],
      explicacao:'CaCO₃+2HNO₃→Ca(NO₃)₂+H₂O+CO₂  ·  Degradação de estátuas de mármore pela chuva ácida. CO₂ efervescente é evidência da reação. Ca(NO₃)₂ solúvel é lavado pela chuva'
    },
  ],

  /* ══ Fe₂O₃ — nova reação (termita) ══ */
  'Fe2O3': [
    {
      id:'fe2o3_al_termita', icon:'⚡', familia:'Deslocamento / Termita',
      titulo:'Fe₂O₃ + 2 Al → Al₂O₃ + 2 Fe',
      reagentes:['Fe₂O₃','Al'], condicao:'Mg/>2500°C', coefR:{'Fe₂O₃':1,'Al':2}, coefP:[1,2],
      produtos_visuais:['Al₂O₃','Fe'],
      candidatos:['Al₂O₃','Fe','FeO','AlCl₃','Fe₂O₃','Al₂O₃','FeCl₃','Al(OH)₃'],
      gabarito:{ produtos:['al2o3','oxido de aluminio','fe','ferro'],
        equacaoBalanceada:'Fe₂O₃(s) + 2 Al(s) →(Δ>2500°C)→ Al₂O₃(s) + 2 Fe(l)' },
      hints:['Termita: Al reduz Fe₂O₃ porque Al é mais reativo. ΔH = −851 kJ/mol — temperatura >3000°C!','Al é mais eletropositivo que Fe: Al→Al³⁺ e Fe³⁺→Fe. Reação altamente exotérmica — usada em solda de trilhos'],
      explicacao:'Fe₂O₃+2Al→Al₂O₃+2Fe  ·  Reação de termita — libera ~3000°C, derretendo o ferro. Usada para soldar trilhos de trem in situ. Impossível apagar com água (H₂O→H₂+O com Al em chamas)'
    },
  ],

  /* ══ KMnO₄ — 2 novas reações ══ */
  'KMnO4': [
    {
      id:'kmno4_fe2_acido', icon:'🔬', familia:'Oxirredução / Titulação',
      titulo:'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O',
      reagentes:['KMnO₄','FeSO₄','H₂SO₄'], condicao:'ácido', coefR:{'KMnO₄':2,'FeSO₄':10,'H₂SO₄':8}, coefP:[2,10,8],
      produtos_visuais:['MnSO₄','Fe₂(SO₄)₃','K₂SO₄','H₂O'],
      candidatos:['MnSO₄','Fe₂(SO₄)₃','K₂SO₄','H₂O','MnO₂','FeCl₃','MnO','FeSO₄'],
      gabarito:{ produtos:['mnso4','sulfato de manganes','fe2(so4)3','sulfato de ferro','k2so4','sulfato de potassio','h2o','agua'],
        equacaoBalanceada:'2 KMnO₄(aq) + 10 FeSO₄(aq) + 8 H₂SO₄(aq) → 2 MnSO₄(aq) + 5 Fe₂(SO₄)₃(aq) + K₂SO₄(aq) + 8 H₂O(l)' },
      hints:['KMnO₄ roxo + FeSO₄ → incolor (Mn²⁺) + amarelo (Fe³⁺). Roxo desaparece = ponto final da titulação','Mn⁺⁷ (MnO₄⁻) → Mn²⁺: ganho de 5e⁻. Fe²⁺→Fe³⁺: perde 1e⁻. Relação 1:5 (KMnO₄:FeSO₄)'],
      explicacao:'KMnO₄+FeSO₄+H₂SO₄→MnSO₄+Fe₂(SO₄)₃  ·  Titulação permanganométrica — padrão de dosagem de Fe²⁺ em sangue/medicamentos. Ponto final: permanência da cor rosa'
    },
    {
      id:'kmno4_decomp', icon:'🌡️', familia:'Decomposição Térmica',
      titulo:'2 KMnO₄ → K₂MnO₄ + MnO₂ + O₂',
      reagentes:['KMnO₄'], condicao:'Δ ~240°C', coefR:{'KMnO₄':2}, coefP:[1,1,1],
      produtos_visuais:['K₂MnO₄','MnO₂','O₂'],
      candidatos:['K₂MnO₄','MnO₂','O₂','KOH','KCl','MnO','K₂O','Mn₂O₃'],
      gabarito:{ produtos:['k2mno4','manganato de potassio','mno2','dioxido de manganes','o2','oxigenio'],
        equacaoBalanceada:'2 KMnO₄(s) →(Δ ~240°C)→ K₂MnO₄(s) + MnO₂(s) + O₂(g)' },
      hints:['KMnO₄ decompõe ao aquecer liberando O₂. Mn⁺⁷→Mn⁺⁶ (K₂MnO₄) e Mn⁺⁴ (MnO₂)','Experimento clássico de produção de O₂ em laboratório. K₂MnO₄ (verde) + MnO₂ (preto) no resíduo'],
      explicacao:'2KMnO₄→K₂MnO₄+MnO₂+O₂  ·  Método histórico de produção de O₂ (Scheele, 1774). Facilmente realizado em laboratório escolar. Mn⁷⁺ se reduz a Mn⁶⁺ e Mn⁴⁺ simultaneamente (desproporcionamento)'
    },
  ],

  /* ══ NaHCO₃ — nova reação (efervescente) ══ */
  'NaHCO3': [
    {
      id:'nahco3_hcl_efervescente', icon:'💊', familia:'Dupla Troca / Cotidiano',
      titulo:'NaHCO₃ + HCl → NaCl + H₂O + CO₂',
      reagentes:['NaHCO₃','HCl'], condicao:'', coefR:{'NaHCO₃':1,'HCl':1}, coefP:[1,1,1],
      produtos_visuais:['NaCl','H₂O','CO₂'],
      candidatos:['NaCl','H₂O','CO₂','Na₂CO₃','NaOH','NaNO₃','NaHSO₄','Na₂SO₄'],
      gabarito:{ produtos:['nacl','cloreto de sodio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'NaHCO₃(aq) + HCl(aq) → NaCl(aq) + H₂O(l) + CO₂(g)' },
      hints:['Bicarbonato antiácido neutraliza HCl gástrico. Efervescência = CO₂. NaCl fica em solução','Medicamento tipo Sal de Fruta = NaHCO₃ + ácido (tartárico/cítrico). Reage com HCl do estômago (pH<2)'],
      explicacao:'NaHCO₃+HCl→NaCl+H₂O+CO₂  ·  Reação do antiácido de bicarbonato. Neutraliza a acidez gástrica. CO₂ causa o arrotar. Pastilhas efervescentes usam esse princípio'
    },
  ],

  /* ══ FeSO₄ — nova reação ══ */
  'FeSO4': [
    {
      id:'feso4_naoh_precipita', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'FeSO₄ + 2 NaOH → Fe(OH)₂↓ + Na₂SO₄',
      reagentes:['FeSO₄','NaOH'], condicao:'', coefR:{'FeSO₄':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Fe(OH)₂','Na₂SO₄'],
      candidatos:['Fe(OH)₂','Na₂SO₄','Fe(OH)₃','FeCl₂','FeO','NaCl','Fe₂O₃','NaOH'],
      gabarito:{ produtos:['fe(oh)2','hidroxido de ferro','na2so4','sulfato de sodio'],
        equacaoBalanceada:'FeSO₄(aq) + 2 NaOH(aq) → Fe(OH)₂(s)↓ + Na₂SO₄(aq)' },
      hints:['Fe²⁺+2OH⁻→Fe(OH)₂↓ verde. Na₂SO₄ em solução. Fe(OH)₂ oxida rapidamente a Fe(OH)₃ castanho','Diferença de cor: Fe(OH)₂ verde ≠ Fe(OH)₃ castanho-ferrugem. Fácil distinguir na prática'],
      explicacao:'FeSO₄+2NaOH→Fe(OH)₂↓+Na₂SO₄  ·  Precipitado verde de Fe(OH)₂ que escurece rapidamente ao ar. Teste de Fe²⁺. Tratamento de efluentes industriais com Fe²⁺'
    },
  ],

  /* ══ ZnSO₄ — nova reação ══ */
  'ZnSO4': [
    {
      id:'znso4_naoh_zincato', icon:'🔬', familia:'Dupla Troca / Anfótero',
      titulo:'ZnSO₄ + 2 NaOH → Zn(OH)₂↓ + Na₂SO₄',
      reagentes:['ZnSO₄','NaOH'], condicao:'', coefR:{'ZnSO₄':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Zn(OH)₂','Na₂SO₄'],
      candidatos:['Zn(OH)₂','Na₂SO₄','ZnO','Na₂ZnO₂','NaCl','ZnCO₃','NaOH','Na₂SO₃'],
      gabarito:{ produtos:['zn(oh)2','hidroxido de zinco','na2so4','sulfato de sodio'],
        equacaoBalanceada:'ZnSO₄(aq) + 2 NaOH(aq) → Zn(OH)₂(s)↓ + Na₂SO₄(aq)' },
      hints:['Zn²⁺+2OH⁻→Zn(OH)₂↓ branco. Com excesso de NaOH: Zn(OH)₂+2NaOH→Na₂ZnO₂+2H₂O (anfótero!)','Zn(OH)₂ dissolve em ácido (como base) E em base forte (como ácido). Comportamento anfótero'],
      explicacao:'ZnSO₄+2NaOH→Zn(OH)₂↓+Na₂SO₄  ·  Precipitado branco gelatinoso. Com excesso de NaOH dissolve (Zn anfótero → Na₂ZnO₂). Demonstração da anfoteria do zinco'
    },
  ],

  /* ══ AlCl₃ — nova reação ══ */
  'AlCl3': [
    {
      id:'alcl3_naoh_excesso', icon:'🔬', familia:'Dupla Troca / Anfótero (excesso)',
      titulo:'AlCl₃ + 4 NaOH(excesso) → NaAlO₂ + 3 NaCl + 2 H₂O',
      reagentes:['AlCl₃','NaOH'], condicao:'excesso NaOH', coefR:{'AlCl₃':1,'NaOH':4}, coefP:[1,3,2],
      produtos_visuais:['NaAlO₂','NaCl','H₂O'],
      candidatos:['NaAlO₂','NaCl','H₂O','Al(OH)₃','AlF₃','Na₂SO₄','Al₂O₃','NaHCO₃'],
      gabarito:{ produtos:['naalO2','aluminato de sodio','nacl','cloreto de sodio','h2o','agua'],
        equacaoBalanceada:'AlCl₃(aq) + 4 NaOH(excesso)(aq) → NaAlO₂(aq) + 3 NaCl(aq) + 2 H₂O(l)' },
      hints:['Com NaOH em excesso, Al(OH)₃ anfótero dissolve: Al(OH)₃+NaOH→NaAlO₂+2H₂O','AlCl₃+3NaOH→Al(OH)₃↓+3NaCl (quantidade estequiométrica). Com excesso NaOH → Al(OH)₃ dissolve → NaAlO₂'],
      explicacao:'AlCl₃+4NaOH(exc.)→NaAlO₂+3NaCl+2H₂O  ·  Al anfótero dissolve em excesso de base. Na₂ZnO₂ e NaAlO₂ são os zincato/aluminato de sódio — tema clássico de anfoteria no ENEM'
    },
  ],

  /* ══ BaSO₄ — nova reação (insolúvel, diagnóstico) ══ */
  'BaSO4': [
    {
      id:'baso4_precip_diag', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2 NaCl',
      reagentes:['BaCl₂','Na₂SO₄'], condicao:'', coefR:{'BaCl₂':1,'Na₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['BaSO₄','NaCl'],
      candidatos:['BaSO₄','NaCl','BaCO₃','BaO','Na₂SO₃','NaNO₃','BaCl₂','Na₂CO₃'],
      gabarito:{ produtos:['baso4','sulfato de bario','nacl','cloreto de sodio'],
        equacaoBalanceada:'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2 NaCl(aq)' },
      hints:['Ba²⁺+SO₄²⁻→BaSO₄↓ branco (insolúvel em HCl). Teste para SO₄²⁻. NaCl permanece em solução','BaSO₄ é o contraste de raio-X do trato gastrointestinal (papa baritada). Inofensivo pois não absorve por ser Kps=1,1×10⁻¹⁰'],
      explicacao:'BaCl₂+Na₂SO₄→BaSO₄↓+2NaCl  ·  BaSO₄ insolúvel em ácidos — teste confirmatório de SO₄²⁻. Medicalmente: a papa baritada usa BaSO₄ como contraste em raio-X do intestino'
    },
  ],

  /* ══ KNO₃ — nova reação (pólvora negra) ══ */
  'KNO3': [
    {
      id:'kno3_polvoranegra', icon:'💥', familia:'Decomposição / Oxidação',
      titulo:'2 KNO₃ + S + 3 C → K₂S + N₂ + 3 CO₂',
      reagentes:['KNO₃','S','C'], condicao:'Δ (ignição)', coefR:{'KNO₃':2,'S':1,'C':3}, coefP:[1,1,3],
      produtos_visuais:['K₂S','N₂','CO₂'],
      candidatos:['K₂S','N₂','CO₂','KCl','SO₂','CO','K₂O','NO₂'],
      gabarito:{ produtos:['k2s','sulfeto de potassio','n2','nitrogenio','co2','dioxido de carbono'],
        equacaoBalanceada:'2 KNO₃(s) + S(s) + 3 C(s) →(ignição)→ K₂S(s) + N₂(g) + 3 CO₂(g)' },
      hints:['Pólvora negra = KNO₃ (75%) + carvão C (15%) + enxofre S (10%). KNO₃ é o oxidante','NO₃⁻ libera O₂ para queimar C e S. Gases N₂ e CO₂ expansão rápida = explosão. Inventada na China ~850 d.C.'],
      explicacao:'2KNO₃+S+3C→K₂S+N₂+3CO₂  ·  Reação da pólvora negra (saltpetre). KNO₃ fornece O₂, C e S reagem. Explosão = expansão súbita de N₂+CO₂. Usada há 1200 anos em fogos de artifício e armas'
    },
  ],

  /* ══ H₂O₂ — reações (novo composto) ══ */
  'H2O2': [
    {
      id:'h2o2_decomp_mno2', icon:'🧪', familia:'Decomposição Catalítica',
      titulo:'2 H₂O₂ → 2 H₂O + O₂',
      reagentes:['H₂O₂'], condicao:'MnO₂ (catalisador)', coefR:{'H₂O₂':2}, coefP:[2,1],
      produtos_visuais:['H₂O','O₂'],
      candidatos:['H₂O','O₂','H₂','HO₂','H₂O₂','OH','O₃','H₂SO₄'],
      gabarito:{ produtos:['h2o','agua','o2','oxigenio'],
        equacaoBalanceada:'2 H₂O₂(aq) →(MnO₂)→ 2 H₂O(l) + O₂(g)' },
      hints:['H₂O₂ é instável: O-O peroxídico rompe fácil. MnO₂ catalisa sem ser consumido','Enzima catalase (fígado/sangue) faz a mesma reação em 10⁷ vezes/s! Efervescência de H₂O₂ no ferimento = O₂ + H₂O'],
      explicacao:'2H₂O₂→2H₂O+O₂  ·  Decomposição catalisada por MnO₂ ou enzima catalase. Elefante de pasta de dente usa H₂O₂ concentrado. A efervescência ao desinfetar ferida é esta reação na catalase sanguínea'
    },
    {
      id:'h2o2_ki_redox', icon:'🔬', familia:'Oxirredução',
      titulo:'H₂O₂ + 2 KI → 2 KOH + I₂',
      reagentes:['H₂O₂','KI'], condicao:'', coefR:{'H₂O₂':1,'KI':2}, coefP:[2,1],
      produtos_visuais:['KOH','I₂'],
      candidatos:['KOH','I₂','KCl','H₂O','KIO₃','NaI','K₂O','HI'],
      gabarito:{ produtos:['koh','hidroxido de potassio','i2','iodo'],
        equacaoBalanceada:'H₂O₂(aq) + 2 KI(aq) → 2 KOH(aq) + I₂(s)' },
      hints:['H₂O₂ oxida I⁻→I₂ (marrom escuro). OH⁻ vem da redução do H₂O₂. O₂ oxidante e redutor ao mesmo tempo','KI é o catalisador da decomposição espetacular do H₂O₂ (elefante de pasta de dente). I₂ formado é o responsável pela cor'],
      explicacao:'H₂O₂+2KI→2KOH+I₂  ·  H₂O₂ oxida o iodeto a I₂ (marrom-escuro). Reação de referência para demostrar poder oxidante do H₂O₂. Mesma reação que ocorre no "elefante de pasta de dente"'
    },
    {
      id:'h2o2_h2o2_disproportionate', icon:'🧪', familia:'Desproporcionamento',
      titulo:'2 H₂O₂ → 2 H₂O + O₂ (espontânea)',
      reagentes:['H₂O₂'], condicao:'luz / Δ / metais', coefR:{'H₂O₂':2}, coefP:[2,1],
      produtos_visuais:['H₂O','O₂'],
      candidatos:['H₂O','O₂','H₂','H₂SO₄','HO₂','O₃','H₂O₂','OH'],
      gabarito:{ produtos:['h2o','agua','o2','oxigenio'],
        equacaoBalanceada:'2 H₂O₂(l) →(luz/Δ)→ 2 H₂O(l) + O₂(g)' },
      hints:['O H₂O₂ pode agir como oxidante (O reduz de -1 a -2) E como redutor (O oxida de -1 a 0) ao mesmo tempo','Desproporcionamento: um reagente é oxidado e reduzido simultaneamente. Por isso H₂O₂ farmacêutico é guardado em frasco escuro'],
      explicacao:'2H₂O₂→2H₂O+O₂  ·  Desproporcionamento: O(-1) → O(-2) e O(0) simultaneamente. Por isso H₂O₂ se decompõe na luz. Armazenado em frascos âmbar para retardar decomposição'
    },
  ],

  /* ══ Na₂SO₄ — reações (novo composto) ══ */
  'Na2SO4': [
    {
      id:'na2so4_bacl2_precip', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2 NaCl',
      reagentes:['Na₂SO₄','BaCl₂'], condicao:'', coefR:{'Na₂SO₄':1,'BaCl₂':1}, coefP:[1,2],
      produtos_visuais:['BaSO₄','NaCl'],
      candidatos:['BaSO₄','NaCl','BaCO₃','BaO','NaNO₃','NaOH','Ba(OH)₂','Na₂CO₃'],
      gabarito:{ produtos:['baso4','sulfato de bario','nacl','cloreto de sodio'],
        equacaoBalanceada:'Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2 NaCl(aq)' },
      hints:['SO₄²⁻ + Ba²⁺ → BaSO₄↓ branco (Kps = 1,1×10⁻¹⁰). Teste confirmatório para sulfato','BaSO₄ precipita mesmo em meio ácido — diferencia SO₄²⁻ de CO₃²⁻ e SO₃²⁻ que dissolvem em HCl'],
      explicacao:'Na₂SO₄+BaCl₂→BaSO₄↓+2NaCl  ·  Precipitação de BaSO₄ — teste qualitativo de SO₄²⁻. Insolúvel em HCl (diferencia de carbonatos). Base do método gravimétrico de análise de sulfato'
    },
    {
      id:'na2so4_h2so4_formacao', icon:'⚗️', familia:'Neutralização',
      titulo:'2 NaOH + H₂SO₄ → Na₂SO₄ + 2 H₂O',
      reagentes:['NaOH','H₂SO₄'], condicao:'', coefR:{'NaOH':2,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['Na₂SO₄','H₂O'],
      candidatos:['Na₂SO₄','H₂O','NaHSO₄','NaCl','Na₂CO₃','NaOH','Na₂SO₃','NaNO₃'],
      gabarito:{ produtos:['na2so4','sulfato de sodio','h2o','agua'],
        equacaoBalanceada:'2 NaOH(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + 2 H₂O(l)' },
      hints:['H₂SO₄ dibásico: 2 H⁺. Precisa de 2 NaOH para neutralização total. Produto: sal normal Na₂SO₄','Com 1 NaOH: NaHSO₄ (sal ácido). Com 2 NaOH: Na₂SO₄ (sal normal). Razão molar define o produto'],
      explicacao:'2NaOH+H₂SO₄→Na₂SO₄+2H₂O  ·  Neutralização total do H₂SO₄ dibásico. Sal de Glauber (Na₂SO₄·10H₂O) — indústria de papel. Controlar proporção: 1:1 → sal ácido; 2:1 → sal neutro'
    },
    {
      id:'na2so4_reducao_papel', icon:'🏭', familia:'Redução Industrial',
      titulo:'Na₂SO₄ + 2 C → Na₂S + 2 CO₂',
      reagentes:['Na₂SO₄','C'], condicao:'Δ ~900°C', coefR:{'Na₂SO₄':1,'C':2}, coefP:[1,2],
      produtos_visuais:['Na₂S','CO₂'],
      candidatos:['Na₂S','CO₂','Na₂SO₃','NaCl','Na₂O','CO','SO₂','Na₂CO₃'],
      gabarito:{ produtos:['na2s','sulfeto de sodio','co2','dioxido de carbono'],
        equacaoBalanceada:'Na₂SO₄(s) + 2 C(s) →(Δ 900°C)→ Na₂S(l) + 2 CO₂(g)' },
      hints:['Processo Kraft de papel: Na₂SO₄ é reduzido a Na₂S pelo carvão na fornalha de recuperação','Na₂S + NaOH formam o licor branco que digere a celulose. A polpa kraft produz 90% do papel mundial'],
      explicacao:'Na₂SO₄+2C→Na₂S+2CO₂  ·  Etapa central do processo kraft (papel). Na₂SO₄ é reduzido a Na₂S no forno de recuperação. Na₂S+NaOH=licor branco que dissolve lignina e libera fibras de celulose'
    },
  ],

  /* ══ MgSO₄ — reações (novo composto) ══ */
  'MgSO4': [
    {
      id:'mgso4_naoh_precip', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'MgSO₄ + 2 NaOH → Mg(OH)₂↓ + Na₂SO₄',
      reagentes:['MgSO₄','NaOH'], condicao:'', coefR:{'MgSO₄':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Mg(OH)₂','Na₂SO₄'],
      candidatos:['Mg(OH)₂','Na₂SO₄','MgO','MgCO₃','NaCl','MgCl₂','NaHCO₃','Na₂CO₃'],
      gabarito:{ produtos:['mg(oh)2','hidroxido de magnesio','na2so4','sulfato de sodio'],
        equacaoBalanceada:'MgSO₄(aq) + 2 NaOH(aq) → Mg(OH)₂(s)↓ + Na₂SO₄(aq)' },
      hints:['Mg²⁺+2OH⁻→Mg(OH)₂↓ branco gelatinoso. Na₂SO₄ em solução','Mg(OH)₂ = leite de magnésia (antiácido). Formado industrialmente pela reação de MgCl₂ da água do mar com Ca(OH)₂'],
      explicacao:'MgSO₄+2NaOH→Mg(OH)₂↓+Na₂SO₄  ·  Mg(OH)₂ = leite de magnésia (antiácido não sistêmico). Insolúvel em água — neutraliza ácido gástrico sem ser absorvido. Produção industrial: MgCl₂ da água do mar + Ca(OH)₂'
    },
    {
      id:'mgso4_h2so4_formacao', icon:'⚗️', familia:'Síntese',
      titulo:'MgO + H₂SO₄ → MgSO₄ + H₂O',
      reagentes:['MgO','H₂SO₄'], condicao:'', coefR:{'MgO':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['MgSO₄','H₂O'],
      candidatos:['MgSO₄','H₂O','MgCl₂','Mg(OH)₂','MgO','Na₂SO₄','MgCO₃','MgSO₃'],
      gabarito:{ produtos:['mgso4','sulfato de magnesio','h2o','agua'],
        equacaoBalanceada:'MgO(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂O(l)' },
      hints:['Óxido básico + ácido → sal + água. MgO + H₂SO₄ → MgSO₄ + H₂O. Regra geral','Sal de Epsom (MgSO₄·7H₂O) formado pela evaporação da solução. 7 moléculas de água de cristalização'],
      explicacao:'MgO+H₂SO₄→MgSO₄+H₂O  ·  Síntese do sal de Epsom. Reação modelo de óxido básico com ácido. MgSO₄·7H₂O (heptaidrato) = sal de banho terapêutico. Cristaliza com 7 H₂O ao resfriamento'
    },
  ],

  /* ══ CaCl₂ — reações (novo composto) ══ */
  'CaCl2': [
    {
      id:'cacl2_na2co3_precip', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'CaCl₂ + Na₂CO₃ → CaCO₃↓ + 2 NaCl',
      reagentes:['CaCl₂','Na₂CO₃'], condicao:'', coefR:{'CaCl₂':1,'Na₂CO₃':1}, coefP:[1,2],
      produtos_visuais:['CaCO₃','NaCl'],
      candidatos:['CaCO₃','NaCl','CaSO₄','Ca(OH)₂','NaHCO₃','Na₂SO₄','CaCl₂','Na₂O'],
      gabarito:{ produtos:['caco3','carbonato de calcio','nacl','cloreto de sodio'],
        equacaoBalanceada:'CaCl₂(aq) + Na₂CO₃(aq) → CaCO₃(s)↓ + 2 NaCl(aq)' },
      hints:['Ca²⁺+CO₃²⁻→CaCO₃↓ branco (calcário). NaCl em solução. Precipitação por dupla troca','Esta reação é a base do processo Solvay: CaCl₂ (resíduo) + Na₂CO₃ → NaCl (reutilizado) + CaCO₃'],
      explicacao:'CaCl₂+Na₂CO₃→CaCO₃↓+2NaCl  ·  Precipitação clássica de carbonato. Base do processo industrial Solvay para produção de Na₂CO₃. CaCO₃ precipita, NaCl permanece em solução para reutilização'
    },
    {
      id:'cacl2_caoh2_formacao', icon:'⚗️', familia:'Neutralização',
      titulo:'Ca(OH)₂ + 2 HCl → CaCl₂ + 2 H₂O',
      reagentes:['Ca(OH)₂','HCl'], condicao:'', coefR:{'Ca(OH)₂':1,'HCl':2}, coefP:[1,2],
      produtos_visuais:['CaCl₂','H₂O'],
      candidatos:['CaCl₂','H₂O','CaSO₄','Ca(NO₃)₂','CaCO₃','NaCl','Ca(OH)₂','CaO'],
      gabarito:{ produtos:['cacl2','cloreto de calcio','h2o','agua'],
        equacaoBalanceada:'Ca(OH)₂(aq) + 2 HCl(aq) → CaCl₂(aq) + 2 H₂O(l)' },
      hints:['Ca(OH)₂ dibásico: 2 OH⁻. Precisa 2 HCl. Ca²⁺+2Cl⁻→CaCl₂. Neutralização completa','CaCl₂ dissolve com ΔH negativo (exotérmico). Usado em bolsas de calor descartáveis (compressas quentes)'],
      explicacao:'Ca(OH)₂+2HCl→CaCl₂+2H₂O  ·  Neutralização da cal hidratada com HCl. CaCl₂ é utilíssimo: descongelante de estradas (mais eficaz que NaCl), dessecante industrial e conservante alimentar'
    },
  ],

  /* ══ Cu(OH)₂ — reações (novo composto) ══ */
  'Cu(OH)2': [
    {
      id:'cuoh2_decomp', icon:'🌡️', familia:'Decomposição Térmica',
      titulo:'Cu(OH)₂ → CuO + H₂O',
      reagentes:['Cu(OH)₂'], condicao:'Δ ~80°C', coefR:{'Cu(OH)₂':1}, coefP:[1,1],
      produtos_visuais:['CuO','H₂O'],
      candidatos:['CuO','H₂O','Cu₂O','Cu','CuSO₄','CuCl₂','CuCO₃','Cu(OH)Cl'],
      gabarito:{ produtos:['cuo','oxido de cobre','h2o','agua'],
        equacaoBalanceada:'Cu(OH)₂(s) →(Δ ~80°C)→ CuO(s) + H₂O(g)' },
      hints:['Hidróxido insolúvel ao aquecer → óxido + água. Cu(OH)₂ azul → CuO preto','Regra geral: base insolúvel → óxido + água. Cu(OH)₂ (azul) → CuO (preto). Mudança de cor visível'],
      explicacao:'Cu(OH)₂→CuO+H₂O  ·  Decomposição de base insolúvel em óxido. Regra geral da química inorgânica: Me(OH)n → MeO(n/2) + nH₂O. Azul→preto ao aquecer. CuO usado em pigmentos e catalisadores'
    },
    {
      id:'cuoh2_nacl_formacao', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'CuSO₄ + 2 NaOH → Cu(OH)₂↓ + Na₂SO₄',
      reagentes:['CuSO₄','NaOH'], condicao:'', coefR:{'CuSO₄':1,'NaOH':2}, coefP:[1,1],
      produtos_visuais:['Cu(OH)₂','Na₂SO₄'],
      candidatos:['Cu(OH)₂','Na₂SO₄','CuO','CuCl₂','NaCl','CuCO₃','Na₂CO₃','CuSO₃'],
      gabarito:{ produtos:['cu(oh)2','hidroxido de cobre','na2so4','sulfato de sodio'],
        equacaoBalanceada:'CuSO₄(aq) + 2 NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)' },
      hints:['Cu²⁺+2OH⁻→Cu(OH)₂↓ azul. Na₂SO₄ em solução. Precipitado azul característico','Calda bordalesa = Cu(OH)₂+Ca(OH)₂. Solução de Fehling = Cu(OH)₂+NaOH+tartarato (detecta açúcar redutor)'],
      explicacao:'CuSO₄+2NaOH→Cu(OH)₂↓+Na₂SO₄  ·  Precipitado azul de Cu(OH)₂. Base da Solução de Fehling (análise de glicose). Reage com açúcar redutor: Cu(OH)₂→Cu₂O vermelho tijolo (Fehling positivo)'
    },
    {
      id:'cuoh2_hcl_dissolucao', icon:'⚗️', familia:'Reação Ácido-Base',
      titulo:'Cu(OH)₂ + 2 HCl → CuCl₂ + 2 H₂O',
      reagentes:['Cu(OH)₂','HCl'], condicao:'', coefR:{'Cu(OH)₂':1,'HCl':2}, coefP:[1,2],
      produtos_visuais:['CuCl₂','H₂O'],
      candidatos:['CuCl₂','H₂O','CuSO₄','CuO','Cu','NaCl','CuCO₃','CuBr₂'],
      gabarito:{ produtos:['cucl2','cloreto de cobre','h2o','agua'],
        equacaoBalanceada:'Cu(OH)₂(s) + 2 HCl(aq) → CuCl₂(aq) + 2 H₂O(l)' },
      hints:['Base insolúvel + ácido → sal + água. Cu(OH)₂ dissolve no HCl formando solução verde de CuCl₂','Regra geral: Me(OH)n + nHX → MeXn + nH₂O. Cu(OH)₂ azul dissolve em HCl → CuCl₂ verde'],
      explicacao:'Cu(OH)₂+2HCl→CuCl₂+2H₂O  ·  Dissolução de base insolúvel em ácido. CuCl₂ é verde-azulado em solução. Usado em preservação de madeira e catalisador orgânico (reação de Wacker)'
    },
  ],

  /* ══ Fe(OH)₂ — reações (novo composto) ══ */
  'Fe(OH)2': [
    {
      id:'feoh2_oxidacao', icon:'🌿', familia:'Oxidação pelo O₂',
      titulo:'4 Fe(OH)₂ + O₂ + 2 H₂O → 4 Fe(OH)₃',
      reagentes:['Fe(OH)₂','O₂','H₂O'], condicao:'ar', coefR:{'Fe(OH)₂':4,'O₂':1,'H₂O':2}, coefP:[4],
      produtos_visuais:['Fe(OH)₃'],
      candidatos:['Fe(OH)₃','FeO','Fe₂O₃','FeSO₄','FeCl₃','Fe(OH)₂','FeOOH','Fe₃O₄'],
      gabarito:{ produtos:['fe(oh)3','hidroxido de ferro'],
        equacaoBalanceada:'4 Fe(OH)₂(s) + O₂(g) + 2 H₂O(l) → 4 Fe(OH)₃(s)' },
      hints:['Fe(OH)₂ verde oxida rapidamente ao ar: Fe²⁺→Fe³⁺. Precipitado verde→castanho','Esse é o mecanismo da ferrugem úmida! Fe(OH)₂ (verde) + O₂+H₂O → Fe(OH)₃ (castanho/ferrugem)'],
      explicacao:'4Fe(OH)₂+O₂+2H₂O→4Fe(OH)₃  ·  Oxidação do hidróxido de Fe(II) a Fe(III). É o mecanismo da ferrugem úmida. Fe(OH)₃ desidrata: 2Fe(OH)₃→Fe₂O₃·3H₂O (ferrugem). O verde→castanho é observável em segundos'
    },
    {
      id:'feoh2_h2so4_dissolve', icon:'⚗️', familia:'Reação Ácido-Base',
      titulo:'Fe(OH)₂ + H₂SO₄ → FeSO₄ + 2 H₂O',
      reagentes:['Fe(OH)₂','H₂SO₄'], condicao:'', coefR:{'Fe(OH)₂':1,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['FeSO₄','H₂O'],
      candidatos:['FeSO₄','H₂O','Fe₂(SO₄)₃','FeCl₂','FeO','Na₂SO₄','Fe(OH)₃','FeSO₃'],
      gabarito:{ produtos:['feso4','sulfato de ferro','h2o','agua'],
        equacaoBalanceada:'Fe(OH)₂(s) + H₂SO₄(aq) → FeSO₄(aq) + 2 H₂O(l)' },
      hints:['Base insolúvel + ácido → sal + água. Fe(OH)₂ dissolve em H₂SO₄ formando FeSO₄','FeSO₄ em solução = Fe²⁺ (verde pálido). Suplemento de ferro em medicamentos como FeSO₄·7H₂O (sulfato ferroso)'],
      explicacao:'Fe(OH)₂+H₂SO₄→FeSO₄+2H₂O  ·  Dissolução de hidróxido em ácido. FeSO₄·7H₂O (sulfato ferroso heptaidrato) = suplemento de ferro para anemia ferropriva. Comprimido de Fe²⁺ do SUS usa este sal'
    },
  ],

  /* ══ K₂CO₃ — reações (novo composto) ══ */
  'K2CO3': [
    {
      id:'k2co3_hcl_neutraliz', icon:'⚗️', familia:'Neutralização',
      titulo:'K₂CO₃ + 2 HCl → 2 KCl + H₂O + CO₂',
      reagentes:['K₂CO₃','HCl'], condicao:'', coefR:{'K₂CO₃':1,'HCl':2}, coefP:[2,1,1],
      produtos_visuais:['KCl','H₂O','CO₂'],
      candidatos:['KCl','H₂O','CO₂','K₂SO₄','KNO₃','KHCO₃','K₂O','KOH'],
      gabarito:{ produtos:['kcl','cloreto de potassio','h2o','agua','co2','dioxido de carbono'],
        equacaoBalanceada:'K₂CO₃(aq) + 2 HCl(aq) → 2 KCl(aq) + H₂O(l) + CO₂(g)' },
      hints:['Carbonato + ácido forte → sal + água + CO₂↑. Efervescência visível','K₂CO₃ + 2HCl → 2KCl + H₂O + CO₂. Mesma lógica de Na₂CO₃. CO₃²⁻ + 2H⁺ → H₂O + CO₂'],
      explicacao:'K₂CO₃+2HCl→2KCl+H₂O+CO₂  ·  Carbonato reage com ácido forte liberando CO₂. KCl é o cloreto de potássio (substituto do NaCl para hipertensos). CO₂ efervescente é a evidência visual'
    },
    {
      id:'k2co3_co2_bicarbonato', icon:'🌿', familia:'Síntese',
      titulo:'K₂CO₃ + CO₂ + H₂O → 2 KHCO₃',
      reagentes:['K₂CO₃','CO₂','H₂O'], condicao:'', coefR:{'K₂CO₃':1,'CO₂':1,'H₂O':1}, coefP:[2],
      produtos_visuais:['KHCO₃'],
      candidatos:['KHCO₃','KCl','KOH','K₂SO₄','K₂O','KNO₃','KNO₂','K₂CO₃'],
      gabarito:{ produtos:['khco3','bicarbonato de potassio'],
        equacaoBalanceada:'K₂CO₃(aq) + CO₂(g) + H₂O(l) → 2 KHCO₃(aq)' },
      hints:['K₂CO₃ (carbonato) absorve CO₂ formando KHCO₃ (bicarbonato). Análogo ao Na₂CO₃+CO₂+H₂O→2NaHCO₃','KHCO₃ = fermento de bolo sem sódio! Alternativa para dietas com restrição de Na⁺'],
      explicacao:'K₂CO₃+CO₂+H₂O→2KHCO₃  ·  Carbonatação de carbonato. KHCO₃ é bicarbonato de potássio — fermento de panificação alternativo ao NaHCO₃ para dietas com restrição de sódio'
    },
    {
      id:'k2co3_caco3_vidro', icon:'🏭', familia:'Síntese Industrial (Vidro)',
      titulo:'K₂CO₃ + SiO₂ → K₂SiO₃ + CO₂',
      reagentes:['K₂CO₃','SiO₂'], condicao:'Δ ~1400°C', coefR:{'K₂CO₃':1,'SiO₂':1}, coefP:[1,1],
      produtos_visuais:['K₂SiO₃','CO₂'],
      candidatos:['K₂SiO₃','CO₂','KCl','K₂SO₄','SiO₂','K₂O','Na₂SiO₃','CO'],
      gabarito:{ produtos:['k2sio3','silicato de potassio','co2','dioxido de carbono'],
        equacaoBalanceada:'K₂CO₃(s) + SiO₂(s) →(Δ ~1400°C)→ K₂SiO₃(l) + CO₂(g)' },
      hints:['Processo de produção do cristal de potássio: potassa + areia (SiO₂) → silicato de K','K₂CO₃+SiO₂→K₂SiO₃+CO₂. Vidro de Bohemia (cristal) usa K₂CO₃. Análogo: Na₂CO₃+SiO₂→Na₂SiO₃ (vidro comum)'],
      explicacao:'K₂CO₃+SiO₂→K₂SiO₃+CO₂  ·  Fundição do cristal de potássio (vidro Bohemia). K₂SiO₃ = silicato de potássio, índice de refração maior que o sódico → cristal mais brilhante. Produção mundial: 5 Mt vidro/ano'
    },
  ],

  /* ══ Pb(NO₃)₂ — reações (novo composto) ══ */
  'Pb(NO3)2': [
    {
      id:'pbno32_ki_precipitado', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'Pb(NO₃)₂ + 2 KI → PbI₂↓ + 2 KNO₃',
      reagentes:['Pb(NO₃)₂','KI'], condicao:'', coefR:{'Pb(NO₃)₂':1,'KI':2}, coefP:[1,2],
      produtos_visuais:['PbI₂','KNO₃'],
      candidatos:['PbI₂','KNO₃','PbCl₂','PbSO₄','KCl','KOH','PbO','NaNO₃'],
      gabarito:{ produtos:['pbi2','iodeto de chumbo','kno3','nitrato de potassio'],
        equacaoBalanceada:'Pb(NO₃)₂(aq) + 2 KI(aq) → PbI₂(s)↓ + 2 KNO₃(aq)' },
      hints:['Pb²⁺+2I⁻→PbI₂↓ amarelo canário (espetacular!). KNO₃ solúvel fica em solução','PbI₂ precipitado amarelo brilhante = "chuva dourada". Cristaliza quando a solução esfria após fervura'],
      explicacao:'Pb(NO₃)₂+2KI→PbI₂↓+2KNO₃  ·  PbI₂ amarelo canário — experimento "chuva dourada". Em solução quente dissolve; ao resfriar, cristais amarelos precipitam lentamente como flocos dourados. Demonstração clássica'
    },
    {
      id:'pbno32_na2so4_precipita', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'Pb(NO₃)₂ + Na₂SO₄ → PbSO₄↓ + 2 NaNO₃',
      reagentes:['Pb(NO₃)₂','Na₂SO₄'], condicao:'', coefR:{'Pb(NO₃)₂':1,'Na₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['PbSO₄','NaNO₃'],
      candidatos:['PbSO₄','NaNO₃','PbCl₂','PbI₂','Na₂CO₃','NaCl','PbO','NaOH'],
      gabarito:{ produtos:['pbso4','sulfato de chumbo','nano3','nitrato de sodio'],
        equacaoBalanceada:'Pb(NO₃)₂(aq) + Na₂SO₄(aq) → PbSO₄(s)↓ + 2 NaNO₃(aq)' },
      hints:['Pb²⁺+SO₄²⁻→PbSO₄↓ branco. NaNO₃ em solução. Outro precipitado de Pb²⁺','PbSO₄ branco — diferencia de PbI₂ (amarelo) e PbCrO₄ (amarelo ouro). Teste de Pb²⁺ em análise qualitativa'],
      explicacao:'Pb(NO₃)₂+Na₂SO₄→PbSO₄↓+2NaNO₃  ·  PbSO₄ precipitado branco. Usado em análise qualitativa para identificar Pb²⁺. Baterias de chumbo-ácido geram PbSO₄ durante a descarga: Pb+PbO₂+2H₂SO₄→2PbSO₄+2H₂O'
    },
    {
      id:'pbno32_decomp_termica', icon:'🌡️', familia:'Decomposição Térmica',
      titulo:'2 Pb(NO₃)₂ → 2 PbO + 4 NO₂ + O₂',
      reagentes:['Pb(NO₃)₂'], condicao:'Δ ~470°C', coefR:{'Pb(NO₃)₂':2}, coefP:[2,4,1],
      produtos_visuais:['PbO','NO₂','O₂'],
      candidatos:['PbO','NO₂','O₂','Pb(NO₃)₂','NO','PbO₂','N₂','Pb'],
      gabarito:{ produtos:['pbo','oxido de chumbo','no2','dioxido de nitrogenio','o2','oxigenio'],
        equacaoBalanceada:'2 Pb(NO₃)₂(s) →(Δ ~470°C)→ 2 PbO(s) + 4 NO₂(g) + O₂(g)' },
      hints:['Nitrato de metal pesado decompõe em óxido+NO₂+O₂. NO₂ marrom alaranjado tóxico','Regra: nitratos de metais pesados (Pb, Cu, Ag) → óxido + NO₂ + O₂. Nitratos de metais leves (K, Na) → nitrito + O₂'],
      explicacao:'2Pb(NO₃)₂→2PbO+4NO₂+O₂  ·  Decomposição com produção de NO₂ alaranjado tóxico. Regra mnemônica: metais pesados (Pb,Cu) → MO+NO₂+O₂; metais ativos (Na,K) → MNO₂+O₂. Sólido branco→pó amarelo PbO'
    },
  ],

  /* ══ NaN₃ — reações (novo composto) ══ */
  'NaN3': [
    {
      id:'nan3_airbag_decomp', icon:'💥', familia:'Decomposição / Airbag',
      titulo:'2 NaN₃ → 2 Na + 3 N₂',
      reagentes:['NaN₃'], condicao:'faísca elétrica', coefR:{'NaN₃':2}, coefP:[2,3],
      produtos_visuais:['Na','N₂'],
      candidatos:['Na','N₂','NH₃','NO','Na₂O','NaCl','N₂O','Na₂N'],
      gabarito:{ produtos:['na','sodio','n2','nitrogenio'],
        equacaoBalanceada:'2 NaN₃(s) →(faísca)→ 2 Na(s) + 3 N₂(g)' },
      hints:['NaN₃ decompõe em <30ms por faísca elétrica. Na metálico + N₂ gasoso (pressuriza o airbag)','Na metálico formado reage com KNO₃ e SiO₂ (também no airbag): 10Na+2KNO₃→K₂O+5Na₂O+N₂ (neutralização do Na)'],
      explicacao:'2NaN₃→2Na+3N₂  ·  Princípio do airbag: 130g de NaN₃ geram 67L de N₂ em 30ms. O Na metálico formado é perigoso mas reage com KNO₃ e SiO₂ presentes no cartucho, gerando silicato inofensivo'
    },
    {
      id:'nan3_h2o_hidroxido', icon:'🔬', familia:'Hidrólise',
      titulo:'NaN₃ + H₂O → NaOH + HN₃',
      reagentes:['NaN₃','H₂O'], condicao:'(parcial)', coefR:{'NaN₃':1,'H₂O':1}, coefP:[1,1],
      produtos_visuais:['NaOH','HN₃'],
      candidatos:['NaOH','HN₃','NH₃','N₂H₄','NaCl','Na₂O','H₂','N₂'],
      gabarito:{ produtos:['naoh','hidroxido de sodio','hn3','acido hidrazoico'],
        equacaoBalanceada:'NaN₃(aq) + H₂O(l) ⇌ NaOH(aq) + HN₃(aq)' },
      hints:['N₃⁻ + H₂O ⇌ HN₃ + OH⁻ (hidrólise básica). HN₃ = ácido hidrazoico (fraco, Kb=1,9×10⁻⁹)','Soluções aquosas de NaN₃ são levemente alcalinas por hidrólise parcial do N₃⁻'],
      explicacao:'NaN₃+H₂O⇌NaOH+HN₃  ·  Hidrólise básica parcial da azida. HN₃ é o ácido hidrazoico (extremamente tóxico em vapor). Por isso NaN₃ é manuseado em meio aquoso com cautela máxima em laboratório'
    },
    {
      id:'nan3_nacl_formacao', icon:'🏭', familia:'Síntese Industrial',
      titulo:'NaNH₂ + N₂O → NaN₃ + H₂O',
      reagentes:['NaNH₂','N₂O'], condicao:'Δ 190°C', coefR:{'NaNH₂':1,'N₂O':1}, coefP:[1,1],
      produtos_visuais:['NaN₃','H₂O'],
      candidatos:['NaN₃','H₂O','Na₂N','NH₃','NaCl','NaOH','N₂','Na'],
      gabarito:{ produtos:['nan3','azida de sodio','h2o','agua'],
        equacaoBalanceada:'NaNH₂(s) + N₂O(g) →(190°C)→ NaN₃(s) + H₂O(g)' },
      hints:['Processo industrial Wislicenus: amida de sódio + óxido nitroso → NaN₃. Reação em duas etapas','NaNH₂+N₂O→NaN₃+H₂O. Método alternativo: N₂H₄+HNO₂→HN₃+2H₂O, depois HN₃+NaOH→NaN₃+H₂O'],
      explicacao:'NaNH₂+N₂O→NaN₃+H₂O  ·  Síntese industrial de NaN₃ (processo Wislicenus). Produção mundial: ~250 t/ano apenas para airbags. Regulamentado rigorosamente por ser precursor de explosivos e altamente tóxico'
    },
  ],

  /* ══ MgCl₂ — reações (novo composto) ══ */
  'MgCl2': [
    {
      id:'mgcl2_naoh_precipita', icon:'🔬', familia:'Dupla Troca / Precipitação',
      titulo:'MgCl₂ + 2 NaOH → Mg(OH)₂↓ + 2 NaCl',
      reagentes:['MgCl₂','NaOH'], condicao:'', coefR:{'MgCl₂':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Mg(OH)₂','NaCl'],
      candidatos:['Mg(OH)₂','NaCl','MgO','MgCO₃','MgSO₄','Na₂SO₄','NaHCO₃','Na₂CO₃'],
      gabarito:{ produtos:['mg(oh)2','hidroxido de magnesio','nacl','cloreto de sodio'],
        equacaoBalanceada:'MgCl₂(aq) + 2 NaOH(aq) → Mg(OH)₂(s)↓ + 2 NaCl(aq)' },
      hints:['Mg²⁺+2OH⁻→Mg(OH)₂↓ branco gelatinoso. NaCl em solução','Leite de magnésia = suspensão de Mg(OH)₂. Extração industrial: MgCl₂ (da água do mar) + Ca(OH)₂ → Mg(OH)₂↓ + CaCl₂'],
      explicacao:'MgCl₂+2NaOH→Mg(OH)₂↓+2NaCl  ·  Produção do leite de magnésia. Industrialmente: MgCl₂ (bittern da salina) + Ca(OH)₂. Mg(OH)₂ filtra-se e calcina: Mg(OH)₂→MgO (magnésia). Base da produção de Mg metálico'
    },
    {
      id:'mgcl2_mg_eletrolitico', icon:'🏭', familia:'Eletrólise Industrial',
      titulo:'MgCl₂ →(eletrólise)→ Mg + Cl₂',
      reagentes:['MgCl₂'], condicao:'eletrólise fundido', coefR:{'MgCl₂':1}, coefP:[1,1],
      produtos_visuais:['Mg','Cl₂'],
      candidatos:['Mg','Cl₂','MgO','MgH₂','HCl','Mg(OH)₂','Na','NaCl'],
      gabarito:{ produtos:['mg','magnesio','cl2','cloro'],
        equacaoBalanceada:'MgCl₂(l) →(eletrólise)→ Mg(l) + Cl₂(g)' },
      hints:['Processo Dow: eletrólise de MgCl₂ fundido. Cátodo (−): Mg²⁺+2e⁻→Mg. Ânodo (+): 2Cl⁻→Cl₂+2e⁻','Mg metálico é o 3º metal mais usado (depois de Al e Fe). 90% vem da eletrólise de MgCl₂ da água do mar'],
      explicacao:'MgCl₂→Mg+Cl₂  ·  Processo Dow — eletrólise do MgCl₂ fundido (660°C). Cl₂ vendido para PVC e HCl. Mg usado em ligas aeronáuticas, estruturas de carros e baterias Mg-íon de nova geração'
    },
    {
      id:'mgcl2_mg_formacao', icon:'⚗️', familia:'Síntese',
      titulo:'Mg + 2 HCl → MgCl₂ + H₂',
      reagentes:['Mg','HCl'], condicao:'', coefR:{'Mg':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['MgCl₂','H₂'],
      candidatos:['MgCl₂','H₂','MgO','Mg(OH)₂','MgSO₄','MgCO₃','NaCl','H₂O'],
      gabarito:{ produtos:['mgcl2','cloreto de magnesio','h2','hidrogenio'],
        equacaoBalanceada:'Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g)' },
      hints:['Mg é muito reativo (acima de Zn e Fe na série). Mg→Mg²⁺+2e⁻. 2H⁺+2e⁻→H₂','Reação vigorosa com chama se acende em HCl. Mg é tão reativo que queima até em CO₂: 2Mg+CO₂→2MgO+C'],
      explicacao:'Mg+2HCl→MgCl₂+H₂  ·  Mg ativo reage com HCl com efervescência intensa. Mg queima em CO₂ (diferente de Fe, Zn, Al). Ligas Mg (duralumin) são as mais leves estruturalmente (1,74 g/cm³)'
    },
  ],

  }; // fim r3

  Object.keys(r3).forEach(function(k){
    if(!REACOES_LIVRES[k]) REACOES_LIVRES[k] = [];
    r3[k].forEach(function(rxn){ REACOES_LIVRES[k].push(rxn); });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   EXPANSÃO 4 — 47 novos compostos para atingir 100 total
   Fontes: NIST WebBook, CRC Handbook 2024, IUPAC 2005,
           Toda Matéria, Manual da Química, ENEM/vestibulares 2015-2025
═══════════════════════════════════════════════════════════════ */
(function(){
  var exp4 = [

  /* ── ÁCIDOS (7 novos) ── */
  {
    id:'hno2', formula:'HNO₂', formulaId:'HNO2',
    nome:'Ácido Nitroso', funcao:'acido', categoria:'Ácidos Fracos',
    massa:'47,01 g/mol', Tf:-42, Tb:null, densidade:'1,00 g/cm³ (aq)',
    solubilidade:'Solúvel em água; instável em solução',
    ph:'< 3 (solução 0,1 mol/L)',
    nomenclatura:'Ácido nitroso',
    badges:['fraco','instável','nitrosante'],
    geometria:'Angular (N central, ~120°)', ligacao:'Covalente polar',
    equacao:'HNO₂ ⇌ H⁺ + NO₂⁻   Ka = 4,5×10⁻⁴',
    reacao:'3 HNO₂ → HNO₃ + 2 NO + H₂O   [desproporcionamento]',
    lewis:'acido_oxigenado', uso:'Síntese de compostos diazo, agente nitrosante, diagnóstico de NO',
    curiosidade:'O HNO₂ é instável em solução. In vivo, os nitratos dos alimentos reduzem-se a nitrito e depois a NO — vasodilatador essencial. A nitroglicerina age pelo mesmo mecanismo.',
    descricao:'Ácido fraco e instável, existente apenas em solução aquosa. Importante intermediário em química orgânica (diazotação) e em bioquímica do óxido nítrico.',
  },
  {
    id:'h2so3', formula:'H₂SO₃', formulaId:'H2SO3',
    nome:'Ácido Sulfuroso', funcao:'acido', categoria:'Ácidos Fracos',
    massa:'82,07 g/mol', Tf:null, Tb:null, densidade:'1,03 g/cm³ (aq)',
    solubilidade:'Existe apenas em solução aquosa (SO₂ + H₂O)',
    ph:'< 2 (solução 1 mol/L)',
    nomenclatura:'Ácido sulfuroso',
    badges:['fraco','diácido','instável','conservante'],
    geometria:'Piramidal (S central)', ligacao:'Covalente polar',
    equacao:'H₂SO₃ ⇌ H⁺ + HSO₃⁻   Ka1 = 1,5×10⁻²',
    reacao:'SO₂(g) + H₂O(l) → H₂SO₃(aq)',
    lewis:'acido_oxigenado', uso:'Conservante alimentar (E220 via SO₂), branqueamento, antioxidante em vinhos',
    curiosidade:'O H₂SO₃ não existe como composto puro — forma-se ao dissolver SO₂ em água. O SO₂ dos vulcões e combustíveis fósseis forma H₂SO₃ na atmosfera → chuva ácida.',
    descricao:'Ácido diprótido instável, existente somente em solução. O sulfito (SO₃²⁻) é conservante largamente usado na indústria alimentícia. Facilmente oxidado a H₂SO₄.',
  },
  {
    id:'hclo3', formula:'HClO₃', formulaId:'HClO3',
    nome:'Ácido Clórico', funcao:'acido', categoria:'Oxiácidos do Cloro',
    massa:'84,46 g/mol', Tf:null, Tb:null, densidade:'1,28 g/cm³ (40% aq)',
    solubilidade:'Solúvel em água; instável >40%',
    ph:'< 1',
    nomenclatura:'Ácido clórico',
    badges:['forte','oxidante','instável','Cl(V)'],
    geometria:'Piramidal (Cl central)', ligacao:'Covalente polar',
    equacao:'HClO₃ → H⁺ + ClO₃⁻   (ionização completa)',
    reacao:'3 Cl₂(g) + 3 H₂O(l) → HClO₃(aq) + 5 HCl(aq)',
    lewis:'acido_oxigenado', uso:'Síntese de KClO₃, oxidante em laboratório',
    curiosidade:'HClO₃ a >40% é explosivo. O KClO₃ (sal do HClO₃) é usado na cabeça dos fósforos. Cl em NOX +5.',
    descricao:'Ácido forte da série dos cloroxiácidos. O ânion clorato (ClO₃⁻) é oxidante forte.',
  },
  {
    id:'hclo4', formula:'HClO₄', formulaId:'HClO4',
    nome:'Ácido Perclórico', funcao:'acido', categoria:'Oxiácidos do Cloro',
    massa:'100,46 g/mol', Tf:-112, Tb:203, densidade:'1,67 g/cm³',
    solubilidade:'Miscível em água',
    ph:'< 0 (superácido)',
    nomenclatura:'Ácido perclórico',
    badges:['superácido','mais forte','oxidante extremo','Cl(VII)'],
    geometria:'Tetraédrica (Cl central)', ligacao:'Covalente polar',
    equacao:'HClO₄ → H⁺ + ClO₄⁻   Ka ≈ 10⁷',
    reacao:'HClO₄(l) + H₂O → H₃O⁺ + ClO₄⁻',
    lewis:'acido_oxigenado', uso:'Digestão analítica, síntese de perclotatos, eletrólito em baterias',
    curiosidade:'O HClO₄ é o ácido inorgânico mais forte conhecido. Cl em NOX +7 (máximo). O perclorato de foguetes contamina solos e água potável.',
    descricao:'Ácido mais forte entre os ácidos inorgânicos. Concentrado é oxidante extremo. Diluído é estável e amplamente usado em análise.',
  },
  {
    id:'h3po3', formula:'H₃PO₃', formulaId:'H3PO3',
    nome:'Ácido Fosforoso', funcao:'acido', categoria:'Ácidos do Fósforo',
    massa:'82,00 g/mol', Tf:73.6, Tb:200, densidade:'1,65 g/cm³',
    solubilidade:'Muito solúvel (310 g/100 mL)',
    ph:'2–3',
    nomenclatura:'Ácido fosforoso (diácido — apenas 2 H ionizáveis)',
    badges:['diácido','redutor','P em NOX +3'],
    geometria:'Tetraédrica (P central, 1 H ligado ao P)', ligacao:'Covalente polar',
    equacao:'H₃PO₃ ⇌ H⁺ + H₂PO₃⁻   Ka1 = 5×10⁻²',
    reacao:'P₄O₆(s) + 6 H₂O(l) → 4 H₃PO₃(aq)',
    lewis:'acido_oxigenado', uso:'Redutor em síntese orgânica, estabilizante de polímeros',
    curiosidade:'Apesar da fórmula H₃PO₃ sugerir triácido, é diácido! Um H está ligado diretamente ao P (não ao O) e não é ionizável. Isso diferencia H₃PO₃ do H₃PO₄.',
    descricao:'Ácido diprótido com P no NOX +3. Uma ligação P-H não ionizável é característica marcante. Forte redutor: oxidado a H₃PO₄.',
  },
  {
    id:'h2cro4', formula:'H₂CrO₄', formulaId:'H2CrO4',
    nome:'Ácido Crômico', funcao:'acido', categoria:'Ácidos de Metais de Transição',
    massa:'118,00 g/mol', Tf:null, Tb:null, densidade:'1,20 g/cm³ (aq)',
    solubilidade:'Solúvel; existe em equilíbrio com Cr₂O₇²⁻',
    ph:'< 1',
    nomenclatura:'Ácido crômico (tetraoxocrômico(VI))',
    badges:['tóxico','cancerígeno','oxidante forte','Cr(VI)'],
    geometria:'Tetraédrica (Cr central)', ligacao:'Covalente com caráter iônico',
    equacao:'H₂CrO₄ ⇌ 2 H⁺ + CrO₄²⁻',
    reacao:'CrO₃(s) + H₂O(l) → H₂CrO₄(aq)',
    lewis:'acido_oxigenado', uso:'Cromagem industrial, oxidante em síntese orgânica (reagente de Jones)',
    curiosidade:'Cr(VI) é cancerígeno reconhecido pela IARC (grupo 1). O "caso Hinkley" da ativista Erin Brockovich envolvia Cr(VI) em água potável.',
    descricao:'Ácido diprótido com Cr em NOX +6. Em meio ácido, o cromato (CrO₄²⁻ amarelo) converte-se a dicromato (Cr₂O₇²⁻ laranja). Extremamente tóxico.',
  },
  /* ── BASES (5 novas) ── */
  {
    id:'lioh', formula:'LiOH', formulaId:'LiOH',
    nome:'Hidróxido de Lítio', funcao:'base', categoria:'Bases Fortes',
    massa:'23,95 g/mol', Tf:462, Tb:924, densidade:'1,46 g/cm³',
    solubilidade:'Solúvel (12,8 g/100 mL a 20°C)',
    ph:'> 13',
    nomenclatura:'Hidróxido de lítio',
    badges:['forte','baterias','Apollo','espacial'],
    geometria:'Iônica', ligacao:'Iônica (Li⁺ e OH⁻)',
    equacao:'LiOH → Li⁺(aq) + OH⁻(aq)',
    reacao:'2 Li(s) + 2 H₂O(l) → 2 LiOH(aq) + H₂(g)',
    lewis:'base_forte', uso:'Baterias de lítio, absorvedor de CO₂ em espaçonaves e submarinos',
    curiosidade:'O LiOH absorve CO₂: 2 LiOH + CO₂ → Li₂CO₃ + H₂O. A missão Apollo 13 entrou em crise quando os cartuchos de LiOH do módulo de comando não encaixavam no módulo lunar.',
    descricao:'Base forte, porém a mais fraca entre os hidróxidos de metais alcalinos. Fundamental nas baterias Li-íon de celulares e veículos elétricos.',
  },
  {
    id:'nh4oh', formula:'NH₄OH', formulaId:'NH4OH',
    nome:'Hidróxido de Amônio', funcao:'base', categoria:'Bases Fracas',
    massa:'35,05 g/mol', Tf:null, Tb:null, densidade:'0,91 g/cm³',
    solubilidade:'Solúvel (NH₃ em equilíbrio com NH₄OH)',
    ph:'11–12 (solução 1 mol/L)',
    nomenclatura:'Hidróxido de amônio (solução amoniacal)',
    badges:['fraca','volátil','limpeza','tampão'],
    geometria:'Tetraédrica (NH₄⁺)', ligacao:'Iônica + pontes de H',
    equacao:'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻   Kb = 1,8×10⁻⁵',
    reacao:'NH₃(g) + H₂O(l) ⇌ NH₄OH(aq) ⇌ NH₄⁺(aq) + OH⁻(aq)',
    lewis:'base_fraca', uso:'Limpador multiuso, tingimento de tecidos, tampão amoniacal (pH 9-11)',
    curiosidade:'O NH₄OH não existe como composto puro — é um equilíbrio de NH₃ dissolvido em água. O cheiro pungente de amoníaco em produtos de limpeza vem do NH₃ volátil.',
    descricao:'Base fraca que existe em equilíbrio aquoso. Par conjugado: NH₄⁺/NH₃. Tampão amoniacal (NH₃+NH₄Cl) mantém pH 9–11.',
  },
  {
    id:'snoh4', formula:'Sn(OH)₄', formulaId:'Sn(OH)4',
    nome:'Hidróxido de Estanho IV', funcao:'base', categoria:'Bases Anfóteras',
    massa:'186,73 g/mol', Tf:null, Tb:null, densidade:'3,00 g/cm³',
    solubilidade:'Insolúvel em água; solúvel em ácidos e bases fortes',
    ph:'> 7',
    nomenclatura:'Hidróxido de estanho(IV)',
    badges:['insolúvel','anfótero','Sn(IV)'],
    geometria:'Octaédrica', ligacao:'Iônica com caráter covalente',
    equacao:'Sn(OH)₄ ⇌ Sn⁴⁺ + 4 OH⁻',
    reacao:'SnCl₄(aq) + 4 NaOH(aq) → Sn(OH)₄(s)↓ + 4 NaCl(aq)',
    lewis:'generico', uso:'Intermediário na produção de SnO₂ (vidro condutor ITO), eletrônica',
    curiosidade:'Sn(OH)₄ é anfótero: dissolve em HCl (→ SnCl₄) E em NaOH (→ Na₂[Sn(OH)₆]). O SnO₂ dopado com In forma o ITO — material essencial para telas de toque e painéis solares.',
    descricao:'Base insolúvel e anfótera do estanho(IV). Ao aquecer decompõe-se em SnO₂ + H₂O. O SnO₂ dopado com In₂O₃ forma o ITO, material de telas LCD e OLED.',
  },
  {
    id:'pboh2', formula:'Pb(OH)₂', formulaId:'Pb(OH)2',
    nome:'Hidróxido de Chumbo II', funcao:'base', categoria:'Bases Anfóteras',
    massa:'241,21 g/mol', Tf:145, Tb:null, densidade:'7,59 g/cm³',
    solubilidade:'Insolúvel em água (Kps = 1,2×10⁻¹⁵)',
    ph:'> 7',
    nomenclatura:'Hidróxido de chumbo(II)',
    badges:['insolúvel','anfótero','tóxico','Pb(II)'],
    geometria:'Hexagonal', ligacao:'Iônica',
    equacao:'Pb(OH)₂ ⇌ Pb²⁺ + 2 OH⁻   Kps = 1,2×10⁻¹⁵',
    reacao:'Pb(NO₃)₂(aq) + 2 NaOH(aq) → Pb(OH)₂(s)↓ + 2 NaNO₃(aq)',
    lewis:'generico', uso:'Intermediário na produção de PbO e Pb₃O₄ (zarcão)',
    curiosidade:'O Pb(OH)₂ é anfótero: reage com HNO₃ (→ Pb(NO₃)₂) e com NaOH (→ Na₂PbO₂ + H₂O). O zarcão Pb₃O₄ (vermelho) foi usado como anticorrosivo em pontes até ser banido.',
    descricao:'Base anfótera e insolúvel do chumbo(II). Extremamente tóxico. Ao aquecer decompõe-se em PbO. Relacionado às pinturas à base de chumbo (proibidas).',
  },
  {
    id:'rboh', formula:'RbOH', formulaId:'RbOH',
    nome:'Hidróxido de Rubídio', funcao:'base', categoria:'Bases Fortes',
    massa:'102,48 g/mol', Tf:300, Tb:null, densidade:'3,20 g/cm³',
    solubilidade:'Muito solúvel em água',
    ph:'> 14',
    nomenclatura:'Hidróxido de rubídio',
    badges:['forte','alcalino','raro'],
    geometria:'Iônica', ligacao:'Iônica (Rb⁺ e OH⁻)',
    equacao:'RbOH → Rb⁺(aq) + OH⁻(aq)',
    reacao:'2 Rb(s) + 2 H₂O(l) → 2 RbOH(aq) + H₂(g)   [reação violenta]',
    lewis:'base_forte', uso:'Pesquisa em espectroscopia, síntese de compostos de rubídio',
    curiosidade:'O Rb reage explosivamente com água. O RbOH é uma das bases mais fortes conhecidas. O rubídio tem apenas um isótopo estável (⁸⁵Rb) e um radioativo natural (⁸⁷Rb).',
    descricao:'Base muito forte do metal alcalino rubídio. Raramente encontrada no cotidiano por ser cara e rara. Mais forte que KOH e NaOH.',
  },

  /* ── ÓXIDOS (12 novos) ── */
  {
    id:'na2o', formula:'Na₂O', formulaId:'Na2O',
    nome:'Óxido de Sódio', funcao:'oxido', categoria:'Óxidos Básicos',
    massa:'61,98 g/mol', Tf:1275, Tb:null, densidade:'2,27 g/cm³',
    solubilidade:'Reage violentamente com água → NaOH',
    ph:'> 13',
    nomenclatura:'Óxido de sódio',
    badges:['básico','muito reativo','precursor NaOH'],
    geometria:'Cúbica (iônica)', ligacao:'Iônica (Na⁺ e O²⁻)',
    equacao:'Na₂O + H₂O → 2 NaOH',
    reacao:'4 Na(s) + O₂(g) → 2 Na₂O(s)',
    lewis:'oxido_basico', uso:'Precursor de NaOH, síntese de vidros especiais',
    curiosidade:'O Na queima em excesso de O₂ forma principalmente Na₂O₂ (peróxido). O Na₂O reage tão violentamente com água que o calor gerado pode inflamar o H₂ liberado.',
    descricao:'Óxido básico muito reativo. Reage com H₂O → NaOH. Com CO₂ → Na₂CO₃. Componente modificador em vidros técnicos (diminui ponto de fusão).',
  },
  {
    id:'k2o', formula:'K₂O', formulaId:'K2O',
    nome:'Óxido de Potássio', funcao:'oxido', categoria:'Óxidos Básicos',
    massa:'94,20 g/mol', Tf:740, Tb:null, densidade:'2,35 g/cm³',
    solubilidade:'Reage com água → KOH (violento)',
    ph:'> 14',
    nomenclatura:'Óxido de potássio',
    badges:['básico','muito reativo','fertilizante indireto'],
    geometria:'Cúbica (iônica)', ligacao:'Iônica (K⁺ e O²⁻)',
    equacao:'K₂O + H₂O → 2 KOH',
    reacao:'4 K(s) + O₂(g) → 2 K₂O(s)',
    lewis:'oxido_basico', uso:'Vidros especiais, fertilizante (% K₂O equivalente)',
    curiosidade:'Em fertilizantes, o teor de potássio é expresso como "% de K₂O equivalente" — herança histórica da análise de cinzas vegetais (potassa).',
    descricao:'Óxido básico muito reativo. O K puro prefere formar KO₂ (superóxido) com excesso de O₂. Componente de vidros e cálculos de fertilização.',
  },
  {
    id:'bao', formula:'BaO', formulaId:'BaO',
    nome:'Óxido de Bário', funcao:'oxido', categoria:'Óxidos Básicos',
    massa:'153,33 g/mol', Tf:1923, Tb:2000, densidade:'5,72 g/cm³',
    solubilidade:'Reage com água formando Ba(OH)₂ (exotérmico)',
    ph:'> 13',
    nomenclatura:'Óxido de bário',
    badges:['básico','tóxico','cerâmica','dessecante'],
    geometria:'Cúbica (NaCl)', ligacao:'Iônica (Ba²⁺ e O²⁻)',
    equacao:'BaO + H₂O → Ba(OH)₂   ΔH = −126 kJ/mol',
    reacao:'2 Ba(s) + O₂(g) → 2 BaO(s)',
    lewis:'oxido_basico', uso:'Dessecante para solventes, síntese de Ba(OH)₂, cerâmica eletrônica',
    curiosidade:'BaO é excelente dessecante para solventes orgânicos não-polares. Porém altamente tóxico — Ba²⁺ inibe a K⁺-ATPase muscular, causando paralisia.',
    descricao:'Óxido básico de alta reatividade. Reage exotermicamente com H₂O → Ba(OH)₂. Componente em cerâmicas capacitivas (BaTiO₃).',
  },
  {
    id:'so2', formula:'SO₂', formulaId:'SO2',
    nome:'Dióxido de Enxofre', funcao:'oxido', categoria:'Óxidos Ácidos',
    massa:'64,06 g/mol', Tf:-75.5, Tb:-10, densidade:'2,93 g/L (gás)',
    solubilidade:'Muito solúvel (113 g/L a 20°C; forma H₂SO₃)',
    ph:'< 3 (solução saturada)',
    nomenclatura:'Dióxido de enxofre (anidrido sulfuroso)',
    badges:['poluente','chuva ácida','conservante E220'],
    geometria:'Angular (S central, 119°)', ligacao:'Covalente polar',
    equacao:'SO₂ + H₂O ⇌ H₂SO₃',
    reacao:'2 SO₂(g) + O₂(g) →(V₂O₅, 450°C)→ 2 SO₃(g)',
    lewis:'oxido_acido', uso:'Conservante de alimentos e vinhos (E220), produção de H₂SO₄, branqueamento',
    curiosidade:'O SO₂ dos vulcões e usinas é o principal precursor da chuva ácida. A "chuva de enxofre" bíblica provavelmente foi erupção vulcânica.',
    descricao:'Gás incolor com odor sufocante. Anidrido sulfuroso. Poluente crítico de combustíveis fósseis ricos em S. Primeiro passo do processo de contato: S → SO₂ → SO₃ → H₂SO₄.',
  },
  {
    id:'no2', formula:'NO₂', formulaId:'NO2',
    nome:'Dióxido de Nitrogênio', funcao:'oxido', categoria:'Óxidos Ácidos',
    massa:'46,01 g/mol', Tf:-11.2, Tb:21.2, densidade:'3,71 g/L (gás)',
    solubilidade:'Reage com água → HNO₃ + HNO₂',
    ph:'< 2',
    nomenclatura:'Dióxido de nitrogênio',
    badges:['tóxico','chuva ácida','NOx','marrom-alaranjado'],
    geometria:'Angular (N central, 134°)', ligacao:'Covalente polar; radical livre',
    equacao:'3 NO₂(g) + H₂O(l) → 2 HNO₃(aq) + NO(g)',
    reacao:'2 NO(g) + O₂(g) → 2 NO₂(g)',
    lewis:'oxido_acido', uso:'Síntese de HNO₃ (Ostwald), diagnóstico ambiental (poluente NOx)',
    curiosidade:'O NO₂ equilibra-se com N₂O₄ (incolor): 2NO₂ ⇌ N₂O₄. Ao aquecer → marrom (NO₂); ao resfriar → incolor (N₂O₄). Experimento visual clássico de equilíbrio!',
    descricao:'Gás radical livre, marrom-alaranjado. Poluente de motores a combustão. Reage com H₂O formando HNO₃ (chuva ácida). Intermediário essencial no processo Ostwald.',
  },
  {
    id:'no', formula:'NO', formulaId:'NO',
    nome:'Monóxido de Nitrogênio', funcao:'oxido', categoria:'Óxidos Neutros',
    massa:'30,01 g/mol', Tf:-163.7, Tb:-151.8, densidade:'1,36 g/L (gás)',
    solubilidade:'Pouco solúvel em água',
    ph:'neutro',
    nomenclatura:'Monóxido de nitrogênio (óxido nítrico)',
    badges:['neutro','vasodilatador','poluente','Nobel 1998'],
    geometria:'Linear diatômico', ligacao:'Covalente (elétron desemparelhado)',
    equacao:'NO não reage com H₂O (óxido neutro)',
    reacao:'N₂(g) + O₂(g) →(>1500°C ou raio)→ 2 NO(g)',
    lewis:'generico', uso:'Sinalização biológica (vasodilatador), síntese de HNO₃',
    curiosidade:'O NO relaxa vasos sanguíneos → reduz pressão arterial. A nitroglicerina age liberando NO. O Nobel de Medicina 1998 foi dado aos descobridores do papel do NO como mensageiro biológico.',
    descricao:'Gás incolor, radical livre, óxido neutro. Produzido em motores e por raios. Mensageiro do relaxamento vascular. Oxida ao ar: 2NO + O₂ → 2NO₂.',
  },
  {
    id:'co', formula:'CO', formulaId:'CO',
    nome:'Monóxido de Carbono', funcao:'oxido', categoria:'Óxidos Neutros',
    massa:'28,01 g/mol', Tf:-205.0, Tb:-191.5, densidade:'1,25 g/L (gás)',
    solubilidade:'Ligeiramente solúvel em água',
    ph:'neutro',
    nomenclatura:'Monóxido de carbono',
    badges:['tóxico','inodoro','incolor','assassino silencioso'],
    geometria:'Linear diatômico', ligacao:'Triple bond C≡O',
    equacao:'2 CO(g) + O₂(g) → 2 CO₂(g)   ΔH = −566 kJ/mol',
    reacao:'C(s) + CO₂(g) → 2 CO(g)   [reação de Boudouard]',
    lewis:'generico', uso:'Metalurgia (redução de Fe₂O₃), Fischer-Tropsch, conversor catalítico',
    curiosidade:'CO é inodoro e incolor — "assassino silencioso". Liga-se à hemoglobina 250× mais forte que O₂. Detector de CO é obrigatório em países com inverno rigoroso.',
    descricao:'Óxido neutro e redutor forte. Produzido por combustão incompleta. Reduz óxidos metálicos na siderurgia. Base do processo Fischer-Tropsch (CO + H₂ → combustíveis).',
  },
  {
    id:'al2o3', formula:'Al₂O₃', formulaId:'Al2O3',
    nome:'Óxido de Alumínio', funcao:'oxido', categoria:'Óxidos Anfóteros',
    massa:'101,96 g/mol', Tf:2072, Tb:2977, densidade:'3,99 g/cm³',
    solubilidade:'Praticamente insolúvel em água; dissolve em ácidos e bases fortes',
    ph:'neutro em água pura',
    nomenclatura:'Trióxido de dialumínio (alumina)',
    badges:['anfótero','alumina','cerâmica','rubi','safira'],
    geometria:'Hexagonal compacto', ligacao:'Iônica com caráter covalente',
    equacao:'Al₂O₃ + 6 HCl → 2 AlCl₃ + 3 H₂O   [básico]\nAl₂O₃ + 2 NaOH → 2 NaAlO₂ + H₂O   [ácido]',
    reacao:'4 Al(s) + 3 O₂(g) → 2 Al₂O₃(s)   ΔH = −3352 kJ/mol',
    lewis:'generico', uso:'Abrasivo (lixa, pasta dental), cerâmica técnica, catalisadores, velas automotivas',
    curiosidade:'Rubi = Al₂O₃ com Cr³⁺ (vermelho). Safira = Al₂O₃ com Ti⁴⁺ e Fe³⁺ (azul). Dureza 9 (escala de Mohs). A camada de Al₂O₃ impede o Al de enferrujar.',
    descricao:'Alumina: óxido anfótero, extremamente duro (9 Mohs). Ponto de fusão 2072°C. Produzida por calcinação do Al(OH)₃ no processo Bayer. Polimorfos: coríndon, γ-alumina.',
  },
  {
    id:'cuo', formula:'CuO', formulaId:'CuO',
    nome:'Óxido de Cobre II', funcao:'oxido', categoria:'Óxidos Básicos',
    massa:'79,55 g/mol', Tf:1326, Tb:2000, densidade:'6,31 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em HCl, HNO₃, H₂SO₄',
    ph:'> 7',
    nomenclatura:'Óxido de cobre(II) — cúprico',
    badges:['básico','preto','catalisador','vidros azuis'],
    geometria:'Monoclínica', ligacao:'Iônica (Cu²⁺ e O²⁻)',
    equacao:'CuO + 2 HCl → CuCl₂ + H₂O',
    reacao:'Cu(OH)₂(s) →(~80°C)→ CuO(s) + H₂O(g)',
    lewis:'oxido_basico', uso:'Pigmento preto em vidros e cerâmicas, catalisador, eletrodo de baterias',
    curiosidade:'CuO aquecido com H₂: CuO + H₂ → Cu + H₂O — experimento clássico de redução. O pó preto vira vermelho-metálico.',
    descricao:'Pó preto, óxido básico do Cu(II). Formado pela oxidação do cobre ou decomposição de Cu(OH)₂. Reduzido por H₂, CO ou C a Cu metálico.',
  },
  {
    id:'fe3o4', formula:'Fe₃O₄', formulaId:'Fe3O4',
    nome:'Magnetita', funcao:'oxido', categoria:'Óxidos Mistos',
    massa:'231,53 g/mol', Tf:1597, Tb:null, densidade:'5,20 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em HCl concentrado',
    ph:'neutro',
    nomenclatura:'Óxido de ferro(II,III) — magnetita',
    badges:['magnético','Fe²⁺/Fe³⁺','bússola','nano medicina'],
    geometria:'Espinélio invertido (cúbica)', ligacao:'Iônica mista',
    equacao:'Fe₃O₄ = FeO·Fe₂O₃   [óxido misto Fe(II) e Fe(III)]',
    reacao:'3 Fe(s) + 2 O₂(g) →(Δ)→ Fe₃O₄(s)',
    lewis:'generico', uso:'Minério de ferro, pigmento preto, nanopartículas para medicina, bússolas',
    curiosidade:'A magnetita deu origem ao nome "magnético". Nanopartículas de Fe₃O₄ são aquecidas por campo magnético externo para destruir tumores (hipertermia magnética).',
    descricao:'Óxido misto com Fe em estados +2 e +3. Mineral magnético mais abundante da crosta. Estrutura espinélio invertido. Biocompatível — usado como contraste em MRI.',
  },
  {
    id:'mno2', formula:'MnO₂', formulaId:'MnO2',
    nome:'Dióxido de Manganês', funcao:'oxido', categoria:'Óxidos Anfóteros',
    massa:'86,94 g/mol', Tf:535, Tb:null, densidade:'5,03 g/cm³',
    solubilidade:'Insolúvel em água',
    ph:'neutro-anfótero',
    nomenclatura:'Dióxido de manganês (pirolusita)',
    badges:['catalisador','pilhas','oxidante','pirolusita'],
    geometria:'Rutilo (tetragonal)', ligacao:'Iônica (Mn⁴⁺ e O²⁻)',
    equacao:'MnO₂ + 4 HCl → MnCl₂ + Cl₂ + 2 H₂O',
    reacao:'2 H₂O₂(aq) →(MnO₂)→ 2 H₂O(l) + O₂(g)',
    lewis:'generico', uso:'Pilhas secas (cátodo Zn-MnO₂), catalisador do H₂O₂, produção de Cl₂',
    curiosidade:'A pilha comum usa MnO₂ como cátodo: MnO₂ + H₂O + e⁻ → MnOOH + OH⁻. Um celular tem ~3-5 g de MnO₂. A bateria mais comum do mundo depende deste mineral!',
    descricao:'Pirolusita: óxido de Mn(IV), mineral natural. Catalisador para H₂O₂ e KClO₃. Eletrodo positivo nas pilhas secas. Forte oxidante em meio ácido.',
  },
  {
    id:'sio2', formula:'SiO₂', formulaId:'SiO2',
    nome:'Dióxido de Silício', funcao:'oxido', categoria:'Óxidos Ácidos',
    massa:'60,09 g/mol', Tf:1710, Tb:2230, densidade:'2,65 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em HF e NaOH fundido',
    ph:'levemente ácido (com NaOH)',
    nomenclatura:'Dióxido de silício (sílica)',
    badges:['ácido','areia','vidro','quartzo','fibra óptica'],
    geometria:'Rede covalente tridimensional (tetraedros SiO₄)', ligacao:'Covalente (rede infinita)',
    equacao:'SiO₂ + 4 HF → SiF₄ + 2 H₂O   [dissolução pelo HF]',
    reacao:'SiO₂ + 2 NaOH →(Δ)→ Na₂SiO₃ + H₂O',
    lewis:'oxido_acido', uso:'Vidro, cimento, fibra óptica, semicondutores (Si puro)',
    curiosidade:'O HF é o único ácido que dissolve vidro (SiO₂) — por isso é guardado em plástico. A fibra óptica da internet é 99,9999% SiO₂. O Si dos chips vem da areia!',
    descricao:'Rede covalente tridimensional. Três formas cristalinas: quartzo, cristobalita, tridimita. Matéria-prima do vidro: SiO₂ + Na₂CO₃ + CaO → vidro.',
  },

  /* ── SAIS (23 novos) ── */
  {
    id:'naclo_sal', formula:'NaClO', formulaId:'NaClO',
    nome:'Hipoclorito de Sódio', funcao:'sal', categoria:'Sais de Sódio',
    massa:'74,44 g/mol', Tf:null, Tb:null, densidade:'1,21 g/cm³ (solução 5%)',
    solubilidade:'Muito solúvel em água',
    ph:'11–13 (solução 5%)',
    nomenclatura:'Hipoclorito de sódio (água sanitária)',
    badges:['desinfetante','alvejante','bactericida','NUNCA misturar ácido'],
    geometria:'Iônica; ClO⁻ angular', ligacao:'Iônica (Na⁺ e ClO⁻)',
    equacao:'NaClO → Na⁺(aq) + ClO⁻(aq)',
    reacao:'Cl₂(g) + 2 NaOH(aq) → NaClO(aq) + NaCl(aq) + H₂O(l)',
    lewis:'sal_ionico', uso:'Água sanitária, piscinas, branqueamento de tecidos e papel',
    curiosidade:'NUNCA misturar água sanitária (NaClO) com vinagre ou ácidos — gera Cl₂ tóxico asfixiante. A água sanitária mata SARS-CoV-2 em 30 segundos.',
    descricao:'Sal do ácido hipocloroso. O Cl ativo (ClO⁻) oxida proteínas bacterianas. Decompõe-se em NaCl + O₂ com luz ou calor — por isso perde validade.',
  },
  {
    id:'kclo3', formula:'KClO₃', formulaId:'KClO3',
    nome:'Clorato de Potássio', funcao:'sal', categoria:'Sais de Potássio',
    massa:'122,55 g/mol', Tf:356, Tb:400, densidade:'2,32 g/cm³',
    solubilidade:'Solúvel (7,3 g/100 mL a 20°C)',
    ph:'neutro',
    nomenclatura:'Clorato de potássio',
    badges:['oxidante','explosivo','fósforos','pirotecnia'],
    geometria:'Iônica; ClO₃⁻ piramidal', ligacao:'Iônica (K⁺ e ClO₃⁻)',
    equacao:'2 KClO₃(s) →(MnO₂, Δ)→ 2 KCl(s) + 3 O₂(g)',
    reacao:'KClO₃(s) + C(s) →(ignição)→ KCl + CO₂',
    lewis:'sal_ionico', uso:'Cabeça de fósforos, fogos de artifício, produção laboratorial de O₂',
    curiosidade:'O fósforo de segurança contém KClO₃ + Sb₂S₃ na cabeça e fósforo vermelho na lixa. Inventado em 1855 por Johan Edvard Lundström.',
    descricao:'Forte oxidante cristalino. Libera O₂ ao aquecer com MnO₂. Misturado com combustíveis é explosivo. Cl em NOX +5.',
  },
  {
    id:'kclo4', formula:'KClO₄', formulaId:'KClO4',
    nome:'Perclorato de Potássio', funcao:'sal', categoria:'Sais de Potássio',
    massa:'138,55 g/mol', Tf:610, Tb:null, densidade:'2,52 g/cm³',
    solubilidade:'Ligeiramente solúvel (2,1 g/100 mL a 25°C)',
    ph:'neutro',
    nomenclatura:'Perclorato de potássio',
    badges:['oxidante','foguetes','propelente','Cl(VII)'],
    geometria:'Iônica; ClO₄⁻ tetraédrico', ligacao:'Iônica (K⁺ e ClO₄⁻)',
    equacao:'KClO₄ → K⁺ + ClO₄⁻',
    reacao:'KClO₃(s) →(Δ)→ KClO₄(s) + KCl(s)   [desproporcionamento]',
    lewis:'sal_ionico', uso:'Propelente sólido de foguetes (com Al), airbags, pirotecnia',
    curiosidade:'O Space Shuttle usava KClO₄ como oxidante do propelente sólido. O perclorato contamina solos e prejudica a tireoide — detectado em leite materno nos EUA.',
    descricao:'Oxidante mais estável que KClO₃. Cl em NOX +7. Propelente sólido: 4 Al + 3 KClO₄ → 2 Al₂O₃ + 3 KCl.',
  },
  {
    id:'znCl2_sal', formula:'ZnCl₂', formulaId:'ZnCl2',
    nome:'Cloreto de Zinco', funcao:'sal', categoria:'Sais de Zinco',
    massa:'136,30 g/mol', Tf:290, Tb:732, densidade:'2,91 g/cm³',
    solubilidade:'Muito solúvel (432 g/100 mL a 25°C!)',
    ph:'4–6',
    nomenclatura:'Cloreto de zinco',
    badges:['muito solúvel','ácido de Lewis','soldagem','galvanoplastia'],
    geometria:'Tetraédrica (Zn em coordenação IV)', ligacao:'Covalente com caráter iônico',
    equacao:'ZnCl₂ → Zn²⁺(aq) + 2 Cl⁻(aq)',
    reacao:'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)',
    lewis:'sal_ionico', uso:'Fluxo para solda de metais, galvanoplastia, pilhas secas, preservativo de madeira',
    curiosidade:'ZnCl₂ é tão solúvel (432 g/100 mL!) que soluções concentradas podem dissolver celulose. É um ácido de Lewis poderoso.',
    descricao:'Sal higroscópico altamente solúvel. Forte ácido de Lewis. Dissolve óxidos metálicos — usado como fluxo na solda. Eletrólito das pilhas secas Leclanché.',
  },
  {
    id:'fecl2', formula:'FeCl₂', formulaId:'FeCl2',
    nome:'Cloreto de Ferro II', funcao:'sal', categoria:'Sais de Ferro',
    massa:'126,75 g/mol', Tf:677, Tb:1023, densidade:'3,16 g/cm³',
    solubilidade:'Muito solúvel (68,5 g/100 mL a 20°C)',
    ph:'3–5',
    nomenclatura:'Cloreto de ferro(II) — cloreto ferroso',
    badges:['ferroso','redutor','Fe(II)','verde pálido'],
    geometria:'Iônica', ligacao:'Iônica (Fe²⁺ e Cl⁻)',
    equacao:'FeCl₂ → Fe²⁺(aq) + 2 Cl⁻(aq)',
    reacao:'Fe(s) + 2 HCl(aq) → FeCl₂(aq) + H₂(g)',
    lewis:'sal_ionico', uso:'Tratamento de efluentes, produção de Fe(OH)₂, síntese de pigmentos',
    curiosidade:'FeCl₂ é redutor — oxida-se facilmente a FeCl₃. Solução verde pálida ao ar vira marrom (FeCl₃). Mistura com FeCl₃ usada para gravar PCBs.',
    descricao:'Sal ferroso, verde pálido em solução. Fe em estado +2. Facilmente oxidado ao Fe(III). Tetrahidrato: FeCl₂·4H₂O verde.',
  },
  {
    id:'na2so3', formula:'Na₂SO₃', formulaId:'Na2SO3',
    nome:'Sulfito de Sódio', funcao:'sal', categoria:'Sais de Sódio',
    massa:'126,04 g/mol', Tf:33, Tb:null, densidade:'2,63 g/cm³',
    solubilidade:'Solúvel (22,7 g/100 mL a 20°C)',
    ph:'11–12',
    nomenclatura:'Sulfito de sódio',
    badges:['redutor','conservante','fotografia','antioxidante'],
    geometria:'Iônica; SO₃²⁻ piramidal', ligacao:'Iônica (Na⁺ e SO₃²⁻)',
    equacao:'Na₂SO₃ → 2 Na⁺ + SO₃²⁻',
    reacao:'Na₂SO₃(s) + H₂SO₄(aq) → Na₂SO₄(aq) + SO₂(g) + H₂O(l)',
    lewis:'sal_ionico', uso:'Conservante alimentar (E221), fotografia analógica, tratamento de efluentes com cloro',
    curiosidade:'Na₂SO₃ remove cloro residual da água: Na₂SO₃ + Cl₂ → Na₂SO₄ + 2 NaCl. Usado para dechlorinar efluentes antes de jogar em rios.',
    descricao:'Sal de S em NOX +4. Redutor — oxida-se a Na₂SO₄. Conservante E221. Essencial na fotografia analógica (revelador). Hidrolisa em meio básico.',
  },
  {
    id:'na3po4', formula:'Na₃PO₄', formulaId:'Na3PO4',
    nome:'Fosfato de Sódio', funcao:'sal', categoria:'Sais de Sódio',
    massa:'163,94 g/mol', Tf:1583, Tb:null, densidade:'2,54 g/cm³',
    solubilidade:'Solúvel (14,5 g/100 mL a 20°C)',
    ph:'11,5–12,5',
    nomenclatura:'Fosfato de trissódio (TSP)',
    badges:['alcalino','TSP','detergente industrial','eutrofização'],
    geometria:'Iônica; PO₄³⁻ tetraédrico', ligacao:'Iônica (Na⁺ e PO₄³⁻)',
    equacao:'Na₃PO₄ → 3 Na⁺ + PO₄³⁻',
    reacao:'H₃PO₄(aq) + 3 NaOH(aq) → Na₃PO₄(aq) + 3 H₂O(l)',
    lewis:'sal_ionico', uso:'Limpador industrial (TSP), condicionador de água, fertilizante',
    curiosidade:'O TSP era ingrediente de quase todo detergente de louça — banido em muitos países por eutrofização de rios (P alimenta algas). As caixas de cereal contêm Na₃PO₄ como "enriquecimento"!',
    descricao:'Sal básico intenso por hidrólise. Sequestrador de Ca²⁺ e Mg²⁺. Banido como detergente em muitos países por excesso de P em rios.',
  },
  {
    id:'caso4', formula:'CaSO₄', formulaId:'CaSO4',
    nome:'Sulfato de Cálcio', funcao:'sal', categoria:'Sais de Cálcio',
    massa:'136,14 g/mol', Tf:1460, Tb:null, densidade:'2,96 g/cm³',
    solubilidade:'Pouco solúvel (0,21 g/100 mL a 25°C)',
    ph:'6–7',
    nomenclatura:'Sulfato de cálcio (gesso: CaSO₄·½H₂O)',
    badges:['gesso','construção','fraturas','pirâmides'],
    geometria:'Iônica; SO₄²⁻ tetraédrico', ligacao:'Iônica (Ca²⁺ e SO₄²⁻)',
    equacao:'CaSO₄ → Ca²⁺(aq) + SO₄²⁻(aq)   Kps = 4,93×10⁻⁵',
    reacao:'Ca(OH)₂(aq) + H₂SO₄(aq) → CaSO₄(s)↓ + 2 H₂O(l)',
    lewis:'sal_ionico', uso:'Gesso médico, construção civil (drywall), anidrita, coagulante do tofu',
    curiosidade:'O gesso endurece expandindo ~1% — por isso não racha ao endurecer. As pirâmides egípcias foram cimentadas com gesso!',
    descricao:'Gipsita = CaSO₄·2H₂O. Gesso de Paris = CaSO₄·½H₂O (calcinado a 120°C). Reidrata e endurece em ~10 min. Incrusta em tubulações (dureza permanente da água).',
  },
  {
    id:'fes', formula:'FeS', formulaId:'FeS',
    nome:'Sulfeto de Ferro II', funcao:'sal', categoria:'Sais de Enxofre',
    massa:'87,91 g/mol', Tf:1193, Tb:null, densidade:'4,84 g/cm³',
    solubilidade:'Insolúvel em água (Kps ≈ 6×10⁻¹⁹)',
    ph:'neutro',
    nomenclatura:'Sulfeto de ferro(II)',
    badges:['insolúvel','gerador H₂S','mineral','Kipp'],
    geometria:'Hexagonal (empacotamento NiAs)', ligacao:'Iônica (Fe²⁺ e S²⁻)',
    equacao:'FeS + H₂SO₄ → FeSO₄ + H₂S↑',
    reacao:'Fe(s) + S(s) →(Δ)→ FeS(s)',
    lewis:'sal_ionico', uso:'Gerador laboratorial de H₂S (reação com HCl/H₂SO₄), produção de pigmentos',
    curiosidade:'FeS + 2 HCl → FeCl₂ + H₂S é o método de Kipp para H₂S. O H₂S tem cheiro de ovo podre e é mais tóxico que HCN! A pirita (FeS₂, "ouro dos tolos") confundiu mineradores por séculos.',
    descricao:'Sulfeto de Fe(II), precipitado preto. Produzido pela reação direta de Fe + S aquecidos. Principal uso: gerador de H₂S em laboratório via reação com ácidos.',
  },
  {
    id:'agcl', formula:'AgCl', formulaId:'AgCl',
    nome:'Cloreto de Prata', funcao:'sal', categoria:'Sais de Prata',
    massa:'143,32 g/mol', Tf:455, Tb:1547, densidade:'5,56 g/cm³',
    solubilidade:'Praticamente insolúvel (Kps = 1,8×10⁻¹⁰)',
    ph:'neutro',
    nomenclatura:'Cloreto de prata',
    badges:['insolúvel','fotossensível','fotografia','teste Cl⁻'],
    geometria:'Cúbica (NaCl)', ligacao:'Iônica com caráter covalente',
    equacao:'AgCl ⇌ Ag⁺ + Cl⁻   Kps = 1,8×10⁻¹⁰',
    reacao:'AgNO₃(aq) + HCl(aq) → AgCl(s)↓ + HNO₃(aq)',
    lewis:'sal_ionico', uso:'Fotografia analógica, eletrodo de referência, teste de cloretos',
    curiosidade:'O filme fotográfico usa cristais de AgBr/AgCl: luz reduz Ag⁺ → Ag⁰ (imagem latente). Um rolo de 36 fotos contém ~1,5 g de Ag!',
    descricao:'Precipitado branco fotossensível. Escurece ao sol (Ag⁺ → Ag⁰ pela luz UV). Dissolve em NH₃ formando [Ag(NH₃)₂]⁺. Eletrodo de referência padrão em eletroquímica.',
  },
  {
    id:'pbi2', formula:'PbI₂', formulaId:'PbI2',
    nome:'Iodeto de Chumbo II', funcao:'sal', categoria:'Sais de Chumbo',
    massa:'461,01 g/mol', Tf:402, Tb:954, densidade:'6,16 g/cm³',
    solubilidade:'Pouco solúvel (0,063 g/100 mL a 25°C; solúvel a quente)',
    ph:'neutro',
    nomenclatura:'Iodeto de chumbo(II)',
    badges:['amarelo canário','chuva dourada','perovskita solar'],
    geometria:'Hexagonal', ligacao:'Iônica com caráter covalente',
    equacao:'PbI₂ ⇌ Pb²⁺ + 2 I⁻   Kps = 9,8×10⁻⁹',
    reacao:'Pb(NO₃)₂(aq) + 2 KI(aq) → PbI₂(s)↓ + 2 KNO₃(aq)',
    lewis:'sal_ionico', uso:'"Chuva dourada" (demonstração), perovskitas fotovoltaicas, detecção de iodeto',
    curiosidade:'"Chuva dourada": PbI₂ dissolve-se em água quente; ao resfriar, cristais amarelo-ouro precipitam lentamente. PbI₂ na estrutura perovskita promete eficiência >30% em células solares!',
    descricao:'Precipitado amarelo-ouro vistoso. Solúvel a quente, precipita ao resfriar. Em pesquisa intensiva como material perovskita para células solares de alta eficiência.',
  },
  {
    id:'mnso4', formula:'MnSO₄', formulaId:'MnSO4',
    nome:'Sulfato de Manganês II', funcao:'sal', categoria:'Sais de Manganês',
    massa:'151,00 g/mol', Tf:700, Tb:null, densidade:'3,25 g/cm³',
    solubilidade:'Muito solúvel (70 g/100 mL a 20°C)',
    ph:'5–7',
    nomenclatura:'Sulfato de manganês(II)',
    badges:['Mn(II)','rosa pálido','fertilizante','micronutriente'],
    geometria:'Iônica; SO₄²⁻ tetraédrico', ligacao:'Iônica (Mn²⁺ e SO₄²⁻)',
    equacao:'MnSO₄ → Mn²⁺(aq) + SO₄²⁻(aq)',
    reacao:'MnO₂(s) + SO₂(g) → MnSO₄(s)',
    lewis:'sal_ionico', uso:'Fertilizante (micronutriente Mn), produção de MnO₂ eletrolítico, pigmento',
    curiosidade:'O manganês é micronutriente essencial: ativa enzimas fotossintéticas. Deficiência de Mn → clorose internervural. MnSO₄ é produto da titulação permanganométrica em meio ácido.',
    descricao:'Sal rosa pálido de Mn(II). Produto da redução do KMnO₄ em meio ácido. Fertilizante de micronutriente. Usado na produção industrial de MnO₂ por eletrólise.',
  },
  {
    id:'na2cro4', formula:'Na₂CrO₄', formulaId:'Na2CrO4',
    nome:'Cromato de Sódio', funcao:'sal', categoria:'Sais de Cromo',
    massa:'161,97 g/mol', Tf:792, Tb:null, densidade:'2,72 g/cm³',
    solubilidade:'Muito solúvel (87 g/100 mL a 20°C)',
    ph:'> 10',
    nomenclatura:'Cromato de sódio',
    badges:['amarelo','Cr(VI)','cancerígeno','indicador Mohr'],
    geometria:'Iônica; CrO₄²⁻ tetraédrico', ligacao:'Iônica (Na⁺ e CrO₄²⁻)',
    equacao:'Na₂CrO₄ → 2 Na⁺ + CrO₄²⁻',
    reacao:'2 Na₂CrO₄(aq) + H₂SO₄(aq) → Na₂Cr₂O₇(aq) + Na₂SO₄(aq) + H₂O(l)',
    lewis:'sal_ionico', uso:'Indicador de Ag⁺ (método Mohr), produção de Cr₂O₇²⁻, pigmento amarelo (proibido)',
    curiosidade:'CrO₄²⁻ (amarelo) ↔ Cr₂O₇²⁻ (laranja): equilíbrio dependente do pH! Método Mohr de titulação usa Na₂CrO₄ — quando AgNO₃ precipita todo Cl⁻, começa a precipitar Ag₂CrO₄ (vermelho).',
    descricao:'Sal amarelo de Cr(VI) — cancerígeno comprovado. Em meio ácido converte-se ao dicromato. Indicador clássico no método Mohr de titulação de cloretos.',
  },
  {
    id:'k2cr2o7', formula:'K₂Cr₂O₇', formulaId:'K2Cr2O7',
    nome:'Dicromato de Potássio', funcao:'sal', categoria:'Sais de Cromo',
    massa:'294,18 g/mol', Tf:398, Tb:500, densidade:'2,68 g/cm³',
    solubilidade:'Solúvel (11,7 g/100 mL a 20°C)',
    ph:'3,5–4,5',
    nomenclatura:'Dicromato de potássio',
    badges:['laranja cristalino','oxidante','bafômetro','padrão analítico'],
    geometria:'Iônica; Cr₂O₇²⁻', ligacao:'Iônica (K⁺ e Cr₂O₇²⁻)',
    equacao:'Cr₂O₇²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H₂O   E° = +1,33 V',
    reacao:'K₂Cr₂O₇(aq) + 6 FeSO₄(aq) + 7 H₂SO₄(aq) → K₂SO₄ + Cr₂(SO₄)₃ + 3 Fe₂(SO₄)₃ + 7 H₂O',
    lewis:'sal_ionico', uso:'Padrão analítico (titulação dicromatométrica), curtimento de couro',
    curiosidade:'O bafômetro antigo usava K₂Cr₂O₇: laranja → verde ao oxidar etanol (Cr⁶⁺→Cr³⁺). Hoje substituído por sensores eletroquímicos.',
    descricao:'Cristais laranja, padrão primário analítico. Titulação dicromatométrica: Cr₂O₇²⁻ oxida Fe²⁺ a Fe³⁺. Cancerígeno IARC grupo 1.',
  },  {
    id:'na2s', formula:'Na₂S', formulaId:'Na2S',
    nome:'Sulfeto de Sódio', funcao:'sal', categoria:'Sais de Sódio',
    massa:'78,04 g/mol', Tf:1180, Tb:null, densidade:'1,86 g/cm³',
    solubilidade:'Muito solúvel (18,6 g/100 mL)',
    ph:'12–14',
    nomenclatura:'Sulfeto de sódio',
    badges:['fortemente básico','redutor','papel kraft','odor H₂S'],
    geometria:'Iônica (S²⁻ e Na⁺)', ligacao:'Iônica',
    equacao:'Na₂S + H₂O ⇌ NaHS + NaOH   (hidrólise intensa)',
    reacao:'Na₂SO₄(s) + 2 C(s) →(Δ 900°C)→ Na₂S(l) + 2 CO₂(g)',
    lewis:'sal_ionico', uso:'Processo kraft (papel), depilação de couro, tratamento de efluentes com metais pesados',
    curiosidade:'O cheiro característico de fábricas de papel é Na₂S → H₂S + mercaptanos. No processo kraft, Na₂S rompe ligações éter da lignina liberando as fibras de celulose.',
    descricao:'Fortemente básico por hidrólise do S²⁻. Redutor poderoso. Precipita metais pesados como sulfetos. Insumo do licor branco no processo kraft de papel.',
  },
  {
    id:'nh4cl', formula:'NH₄Cl', formulaId:'NH4Cl',
    nome:'Cloreto de Amônio', funcao:'sal', categoria:'Sais de Amônio',
    massa:'53,49 g/mol', Tf:338, Tb:520, densidade:'1,53 g/cm³',
    solubilidade:'Muito solúvel (37,2 g/100 mL a 20°C)',
    ph:'4,5–5,5',
    nomenclatura:'Cloreto de amônio (sal amoníaco)',
    badges:['ácido fraco','tampão','pilha Leclanché','fumaça branca'],
    geometria:'Iônica; NH₄⁺ tetraédrico', ligacao:'Iônica (NH₄⁺ e Cl⁻)',
    equacao:'NH₄Cl → NH₄⁺(aq) + Cl⁻(aq)   NH₄⁺ ⇌ NH₃ + H⁺   Ka = 5,6×10⁻¹⁰',
    reacao:'NH₃(g) + HCl(g) → NH₄Cl(s)   [fumaça branca]',
    lewis:'sal_ionico', uso:'Pilhas Leclanché (eletrólito), fertilizante nitrogenado, fluxo para solda',
    curiosidade:'Misturar NH₃ e HCl gasosos produz fumaça branca densa de NH₄Cl — demonstração clássica de formação de sal. NH₄Cl sublima sem fundir a 338°C.',
    descricao:'Sal ácido (NH₄⁺ hidrolisa-se levemente). Eletrólito das pilhas Leclanché. Fertilizante rápido. Sublima sem fundir: sólido → vapor a 338°C.',
  },
  {
    id:'naf', formula:'NaF', formulaId:'NaF',
    nome:'Fluoreto de Sódio', funcao:'sal', categoria:'Sais de Sódio',
    massa:'41,99 g/mol', Tf:993, Tb:1704, densidade:'2,56 g/cm³',
    solubilidade:'Solúvel (4,22 g/100 mL a 25°C)',
    ph:'6,5–8',
    nomenclatura:'Fluoreto de sódio',
    badges:['dentifício','água fluoretada','esmalte dental','saúde pública'],
    geometria:'Cúbica (NaCl)', ligacao:'Iônica (Na⁺ e F⁻)',
    equacao:'NaF → Na⁺(aq) + F⁻(aq)',
    reacao:'NaOH(aq) + HF(aq) → NaF(aq) + H₂O(l)',
    lewis:'sal_ionico', uso:'Fluoretação de água potável (0,7 ppm), pasta de dente, preservação de madeira',
    curiosidade:'A fluoretação da água é uma das 10 maiores conquistas de saúde pública do século XX (CDC): reduz cárie em 25-40%. O F⁻ forma fluorapatita — mais resistente ao ácido das bactérias.',
    descricao:'Fonte de F⁻ para fluoretação. Incorporado ao esmalte dental: Ca₅(PO₄)₃OH → Ca₅(PO₄)₃F (fluorapatita), 100× mais resistente ao ácido. Em excesso: fluorose dental.',
  },
  {
    id:'sncl2', formula:'SnCl₂', formulaId:'SnCl2',
    nome:'Cloreto de Estanho II', funcao:'sal', categoria:'Sais de Estanho',
    massa:'189,60 g/mol', Tf:247, Tb:623, densidade:'3,95 g/cm³',
    solubilidade:'Solúvel (84 g/100 mL a 0°C)',
    ph:'< 3',
    nomenclatura:'Cloreto de estanho(II) — cloreto estanoso',
    badges:['redutor','Sn(II)','espelhos','conservante E512'],
    geometria:'Piramidal (par solitário no Sn)', ligacao:'Covalente com caráter iônico',
    equacao:'SnCl₂ + 2 H₂O ⇌ Sn(OH)Cl + HCl   (hidrólise)',
    reacao:'SnCl₂(aq) + 2 FeCl₃(aq) → SnCl₄(aq) + 2 FeCl₂(aq)',
    lewis:'sal_ionico', uso:'Redutor em síntese orgânica, conservante E512, prateamento de espelhos',
    curiosidade:'SnCl₂ reduz Hg²⁺ a Hg⁰: SnCl₂ + HgCl₂ → SnCl₄ + Hg↓ — teste clássico de Hg²⁺! Usado industrialmente para "silvarizar" espelhos de automóveis.',
    descricao:'Forte redutor (Sn²⁺/Sn⁴⁺). Par solitário no Sn dá geometria piramidal. Hidrolisa em excesso de água. Conservante E512 — reduz oxidação em óleos enlatados.',
  },
  {
    id:'pbbr2', formula:'PbBr₂', formulaId:'PbBr2',
    nome:'Brometo de Chumbo II', funcao:'sal', categoria:'Sais de Chumbo',
    massa:'367,01 g/mol', Tf:371, Tb:916, densidade:'6,66 g/cm³',
    solubilidade:'Pouco solúvel (1,01 g/100 mL a 25°C)',
    ph:'neutro',
    nomenclatura:'Brometo de chumbo(II)',
    badges:['amarelo pálido','Pb(II)','perovskita LED'],
    geometria:'Ortorrômbica', ligacao:'Iônica (Pb²⁺ e Br⁻)',
    equacao:'PbBr₂ ⇌ Pb²⁺ + 2 Br⁻   Kps = 4,0×10⁻⁵',
    reacao:'Pb(NO₃)₂(aq) + 2 KBr(aq) → PbBr₂(s)↓ + 2 KNO₃(aq)',
    lewis:'sal_ionico', uso:'Síntese de compostos de Pb(II), perovskitas (MAPbBr₃ para LEDs verdes)',
    curiosidade:'CH₃NH₃PbBr₃ (perovskita de brometo) emite luz verde intensa — candidato para LEDs de próxima geração com eficiência maior que GaN.',
    descricao:'Precipitado branco-amarelado. Importante para síntese de perovskitas. Teste de Br⁻: AgNO₃ + Br⁻ → AgBr (amarelo pálido, distingue do AgCl branco e AgI amarelo intenso).',
  },

  ]; // fim exp4

  /* Calcular estado físico e inserir no catálogo */
  exp4.forEach(function(c){
    var estado = '—';
    if(c.Tf !== null && c.Tb !== null){
      if(c.Tf > 25)       estado = 'Sólido (25 °C)';
      else if(c.Tb < 25)  estado = 'Gasoso (25 °C)';
      else                estado = 'Líquido (25 °C)';
    } else if(c.Tf === null){ estado = 'Aquoso / Instável';
    } else if(c.Tf > 25){    estado = 'Sólido (25 °C)'; }
    c.estado = estado;
    c.pfStr  = c.Tf !== null ? c.Tf + ' °C' : '—';
    c.peStr  = c.Tb !== null ? c.Tb + ' °C' : '— (decompõe)';
    CATALOGO_SIQI.push(c);
  });
})();


/* ═══════════════════════════════════════════════════════════════
   EXPANSÃO 4 — Reações para novos compostos
═══════════════════════════════════════════════════════════════ */
(function(){
  var r4 = {
  'HNO2':[
    {id:'hno2_naoh',icon:'⚗️',familia:'Neutralização',titulo:'HNO₂ + NaOH → NaNO₂ + H₂O',
     reagentes:['HNO₂','NaOH'],condicao:'',coefR:{'HNO₂':1,'NaOH':1},coefP:[1,1],
     produtos_visuais:['NaNO₂','H₂O'],
     candidatos:['NaNO₂','H₂O','NaNO₃','NaCl','Na₂SO₃','Na₂SO₄','NaOH','Na₂CO₃'],
     gabarito:{produtos:['nano2','nitrito de sodio','h2o','agua'],equacaoBalanceada:'HNO₂(aq) + NaOH(aq) → NaNO₂(aq) + H₂O(l)'},
     hints:['Ácido fraco + base forte → sal + água. NaNO₂ = nitrito de sódio','NaNO₂ é conservante de carnes (E250) — cura presunto e bacon, inibindo C. botulinum'],
     explicacao:'HNO₂+NaOH→NaNO₂+H₂O · NaNO₂ usado para curar carnes. Reage com aminas formando nitrosaminas cancerígenas — consumo moderado recomendado'},
    {id:'hno2_disprop',icon:'🌡️',familia:'Desproporcionamento',titulo:'3 HNO₂ → HNO₃ + 2 NO + H₂O',
     reagentes:['HNO₂'],condicao:'Δ',coefR:{'HNO₂':3},coefP:[1,2,1],
     produtos_visuais:['HNO₃','NO','H₂O'],
     candidatos:['HNO₃','NO','H₂O','NO₂','N₂O','HNO₂','N₂','H₂O₂'],
     gabarito:{produtos:['hno3','acido nitrico','no','monoxido de nitrogenio','h2o','agua'],equacaoBalanceada:'3 HNO₂(aq) → HNO₃(aq) + 2 NO(g) + H₂O(l)'},
     hints:['N⁺³ → N⁺⁵ (HNO₃) e N⁺² (NO) — desproporcionamento','HNO₂ instável: decompõe em solução concentrada ou quente'],
     explicacao:'3HNO₂→HNO₃+2NO+H₂O · Desproporcionamento: N(+3)→N(+5) e N(+2) ao mesmo tempo. Por isso HNO₂ não existe puro'},
  ],
  'H2SO3':[
    {id:'h2so3_naoh',icon:'⚗️',familia:'Neutralização',titulo:'H₂SO₃ + 2 NaOH → Na₂SO₃ + 2 H₂O',
     reagentes:['H₂SO₃','NaOH'],condicao:'',coefR:{'H₂SO₃':1,'NaOH':2},coefP:[1,2],
     produtos_visuais:['Na₂SO₃','H₂O'],
     candidatos:['Na₂SO₃','H₂O','NaHSO₃','Na₂SO₄','NaCl','Na₂S','NaHSO₄','Na₂CO₃'],
     gabarito:{produtos:['na2so3','sulfito de sodio','h2o','agua'],equacaoBalanceada:'H₂SO₃(aq) + 2 NaOH(aq) → Na₂SO₃(aq) + 2 H₂O(l)'},
     hints:['H₂SO₃ dibásico precisa 2 NaOH. Com 1 NaOH → NaHSO₃ (bissulfito)','Na₂SO₃ = conservante E221. Scrubbers de NaOH absorvem SO₂ → reduz chuva ácida'],
     explicacao:'H₂SO₃+2NaOH→Na₂SO₃+2H₂O · Na₂SO₃ conservante E221. Proporção 1:2 gera sal neutro; 1:1 gera NaHSO₃ (bissulfito)'},
    {id:'h2so3_form',icon:'🔬',familia:'Síntese',titulo:'SO₂ + H₂O → H₂SO₃',
     reagentes:['SO₂','H₂O'],condicao:'',coefR:{'SO₂':1,'H₂O':1},coefP:[1],
     produtos_visuais:['H₂SO₃'],
     candidatos:['H₂SO₃','H₂SO₄','H₂S','SO₃','HCl','H₂O','Na₂SO₃','NaHSO₃'],
     gabarito:{produtos:['h2so3','acido sulfuroso'],equacaoBalanceada:'SO₂(g) + H₂O(l) → H₂SO₃(aq)'},
     hints:['Óxido ácido + água → ácido. SO₂ = anidrido sulfuroso','Chuva ácida: SO₂ + H₂O → H₂SO₃ → oxidado → H₂SO₄'],
     explicacao:'SO₂+H₂O→H₂SO₃ · Formação do ácido sulfuroso. SO₂ de usinas + nuvens → chuva ácida (pH 2). Causa danos a monumentos e florestas'},
  ],
  'NaClO':[
    {id:'naclo_perigo',icon:'⚠️',familia:'NUNCA MISTURAR',titulo:'NaClO + 2 HCl → NaCl + H₂O + Cl₂',
     reagentes:['NaClO','HCl'],condicao:'PERIGO — não fazer!',coefR:{'NaClO':1,'HCl':2},coefP:[1,1,1],
     produtos_visuais:['NaCl','H₂O','Cl₂'],
     candidatos:['NaCl','H₂O','Cl₂','HClO','NaOH','NaClO','Cl₂O','HCl'],
     gabarito:{produtos:['nacl','cloreto de sodio','h2o','agua','cl2','cloro'],equacaoBalanceada:'NaClO(aq) + 2 HCl(aq) → NaCl(aq) + H₂O(l) + Cl₂(g)'},
     hints:['⚠️ NUNCA misturar água sanitária (NaClO) com ácidos! Gera Cl₂ tóxico asfixiante','Em meio ácido: ClO⁻+2H⁺+Cl⁻→Cl₂+H₂O. O Cl₂ inalado causa edema pulmonar'],
     explicacao:'NaClO+2HCl→NaCl+H₂O+Cl₂ · NUNCA misturar água sanitária com limpa-pedras ou vinagre! Gera Cl₂ — mesmo gás de guerra da 1ª Guerra Mundial. Causa de envenenamentos domésticos'},
    {id:'naclo_form',icon:'🏭',familia:'Síntese Industrial',titulo:'Cl₂ + 2 NaOH → NaCl + NaClO + H₂O',
     reagentes:['Cl₂','NaOH'],condicao:'frio',coefR:{'Cl₂':1,'NaOH':2},coefP:[1,1,1],
     produtos_visuais:['NaCl','NaClO','H₂O'],
     candidatos:['NaCl','NaClO','H₂O','HCl','Cl₂O','NaClO₃','HClO','NaOH'],
     gabarito:{produtos:['nacl','cloreto de sodio','naclo','hipoclorito de sodio','h2o','agua'],equacaoBalanceada:'Cl₂(g) + 2 NaOH(aq) → NaCl(aq) + NaClO(aq) + H₂O(l)'},
     hints:['Cl₂ + NaOH frio → NaCl + NaClO. Quente → NaCl + NaClO₃','Processo cloro-álcalis: eletrólise de NaCl → Cl₂ + NaOH → NaClO'],
     explicacao:'Cl₂+2NaOH→NaCl+NaClO+H₂O · Produção industrial da água sanitária. Brasil produz ~1 bilhão de litros/ano. Temperatura controla o produto: frio→hipoclorito; quente→clorato'},
  ],
  'KClO3':[
    {id:'kclo3_o2',icon:'🌡️',familia:'Decomposição Catalítica',titulo:'2 KClO₃ → 2 KCl + 3 O₂',
     reagentes:['KClO₃'],condicao:'MnO₂, Δ',coefR:{'KClO₃':2},coefP:[2,3],
     produtos_visuais:['KCl','O₂'],
     candidatos:['KCl','O₂','KClO₄','KOH','K₂O','Cl₂','KNO₃','KHCO₃'],
     gabarito:{produtos:['kcl','cloreto de potassio','o2','oxigenio'],equacaoBalanceada:'2 KClO₃(s) →(MnO₂,Δ)→ 2 KCl(s) + 3 O₂(g)'},
     hints:['Cl⁺⁵→Cl⁻¹ (ganho 6e⁻). MnO₂ catalisador (regenerado). Método histórico de O₂','2KClO₃→2KCl+3O₂. Scheele descobriu o Cl₂ e o O₂ usando pirolusita (MnO₂)'],
     explicacao:'2KClO₃→2KCl+3O₂ · Método de Scheele (1774) para O₂. MnO₂ catalisa. Experimento clássico de laboratório. Produziu o O₂ que Priestley e Lavoisier estudaram'},
  ],
  'SO2':[
    {id:'so2_naoh',icon:'⚗️',familia:'Absorção de SO₂',titulo:'SO₂ + 2 NaOH → Na₂SO₃ + H₂O',
     reagentes:['SO₂','NaOH'],condicao:'excesso NaOH',coefR:{'SO₂':1,'NaOH':2},coefP:[1,1],
     produtos_visuais:['Na₂SO₃','H₂O'],
     candidatos:['Na₂SO₃','H₂O','NaHSO₃','Na₂SO₄','NaCl','Na₂S','Na₂CO₃','NaHSO₄'],
     gabarito:{produtos:['na2so3','sulfito de sodio','h2o','agua'],equacaoBalanceada:'SO₂(g) + 2 NaOH(aq) → Na₂SO₃(aq) + H₂O(l)'},
     hints:['Óxido ácido + base → sal + água. Com 1 NaOH → NaHSO₃ (bissulfito)','Scrubbers industriais absorvem SO₂ com NaOH → reduz chuva ácida'],
     explicacao:'SO₂+2NaOH→Na₂SO₃+H₂O · Absorção industrial de SO₂. Com NaOH:SO₂=1:1 → NaHSO₃. Com 2:1 → Na₂SO₃. Tecnologia de dessulfurização de gases de combustão'},
    {id:'so2_o2',icon:'🏭',familia:'Processo de Contato',titulo:'2 SO₂ + O₂ → 2 SO₃',
     reagentes:['SO₂','O₂'],condicao:'V₂O₅, 450°C',coefR:{'SO₂':2,'O₂':1},coefP:[2],
     produtos_visuais:['SO₃'],
     candidatos:['SO₃','SO₂','H₂SO₄','H₂SO₃','S','O₃','SO₂Cl₂','H₂S'],
     gabarito:{produtos:['so3','trioxido de enxofre'],equacaoBalanceada:'2 SO₂(g) + O₂(g) ⇌(V₂O₅,450°C) 2 SO₃(g)'},
     hints:['Etapa central do processo de contato. Catalisador V₂O₅. Equilíbrio reversível','Alta pressão e T moderada (Le Chatelier) favorecem SO₃. Conversão ~98%'],
     explicacao:'2SO₂+O₂→2SO₃ · Etapa 2 do processo de contato. S→SO₂→SO₃→H₂SO₄. Temperatura ótima 450°C (equilíbrio vs cinética). 90% do H₂SO₄ mundial vem desta reação'},
  ],
  'NO2':[
    {id:'no2_hno3',icon:'🏭',familia:'Processo Ostwald',titulo:'3 NO₂ + H₂O → 2 HNO₃ + NO',
     reagentes:['NO₂','H₂O'],condicao:'',coefR:{'NO₂':3,'H₂O':1},coefP:[2,1],
     produtos_visuais:['HNO₃','NO'],
     candidatos:['HNO₃','NO','HNO₂','H₂O','NO₂','N₂O₃','N₂O₅','N₂'],
     gabarito:{produtos:['hno3','acido nitrico','no','monoxido de nitrogenio'],equacaoBalanceada:'3 NO₂(g) + H₂O(l) → 2 HNO₃(aq) + NO(g)'},
     hints:['Última etapa do Ostwald: NH₃→NO→NO₂→HNO₃. O NO reciclado→NO₂ novamente','3 NO₂: 2 formam HNO₃ (N⁺⁵), 1 reduzido a NO (N⁺²)'],
     explicacao:'3NO₂+H₂O→2HNO₃+NO · Etapa final do processo Ostwald. O NO liberado é oxidado de volta e reabsorvido → ~99% rendimento. Base da produção industrial de HNO₃'},
  ],
  'CO':[
    {id:'co_combustao',icon:'🔥',familia:'Combustão',titulo:'2 CO + O₂ → 2 CO₂',
     reagentes:['CO','O₂'],condicao:'ignição',coefR:{'CO':2,'O₂':1},coefP:[2],
     produtos_visuais:['CO₂'],
     candidatos:['CO₂','CO','H₂O','SO₂','NO','C','H₂','O₃'],
     gabarito:{produtos:['co2','dioxido de carbono'],equacaoBalanceada:'2 CO(g) + O₂(g) → 2 CO₂(g)   ΔH = −566 kJ/mol'},
     hints:['CO combustível: C+2→+4. Conversor catalítico do carro faz esta reação','2CO+O₂→2CO₂. ΔH = −566 kJ/mol, altamente exotérmica'],
     explicacao:'2CO+O₂→2CO₂ · Combustão do CO. Conversor catalítico (Pt/Pd/Rh) converte CO tóxico em CO₂: 2CO+O₂→2CO₂ e 2NO→N₂+O₂ simultaneamente'},
    {id:'co_fe2o3',icon:'🏭',familia:'Redução Metalúrgica',titulo:'3 CO + Fe₂O₃ → 2 Fe + 3 CO₂',
     reagentes:['CO','Fe₂O₃'],condicao:'alto-forno 1200°C',coefR:{'CO':3,'Fe₂O₃':1},coefP:[2,3],
     produtos_visuais:['Fe','CO₂'],
     candidatos:['Fe','CO₂','FeO','Fe₃O₄','FeCl₃','CO','Fe₂O₃','CaCO₃'],
     gabarito:{produtos:['fe','ferro','co2','dioxido de carbono'],equacaoBalanceada:'3 CO(g) + Fe₂O₃(s) →(1200°C)→ 2 Fe(l) + 3 CO₂(g)'},
     hints:['CO reduz Fe³⁺ a Fe⁰. C+2→+4. Fe+3→0. Redox no alto-forno','Alto-forno: coque→CO; CO+Fe₂O₃→Fe+CO₂. Produção mundial: 1,9 bilhão t ferro/ano'],
     explicacao:'3CO+Fe₂O₃→2Fe+3CO₂ · Princípio do alto-forno siderúrgico. O coque produz CO que reduz o minério. Base de 2000 anos de metalurgia do ferro'},
  ],
  'Al2O3':[
    {id:'al2o3_hcl',icon:'⚗️',familia:'Reação com Ácido',titulo:'Al₂O₃ + 6 HCl → 2 AlCl₃ + 3 H₂O',
     reagentes:['Al₂O₃','HCl'],condicao:'',coefR:{'Al₂O₃':1,'HCl':6},coefP:[2,3],
     produtos_visuais:['AlCl₃','H₂O'],
     candidatos:['AlCl₃','H₂O','Al(OH)₃','AlF₃','Al₂(SO₄)₃','NaCl','Al₂O₃','HCl'],
     gabarito:{produtos:['alcl3','cloreto de aluminio','h2o','agua'],equacaoBalanceada:'Al₂O₃(s) + 6 HCl(aq) → 2 AlCl₃(aq) + 3 H₂O(l)'},
     hints:['Óxido anfótero + ácido → sal + água. Al₂O₃ como base aqui','2 Al³⁺: cada precisa 3 HCl → 6 HCl total'],
     explicacao:'Al₂O₃+6HCl→2AlCl₃+3H₂O · Comportamento básico do Al₂O₃ anfótero. A camada de Al₂O₃ (1-4 nm) protege o Al da corrosão — por isso Al não enferruja'},
    {id:'al2o3_naoh',icon:'⚗️',familia:'Reação com Base (anfótero)',titulo:'Al₂O₃ + 2 NaOH → 2 NaAlO₂ + H₂O',
     reagentes:['Al₂O₃','NaOH'],condicao:'concentrado',coefR:{'Al₂O₃':1,'NaOH':2},coefP:[2,1],
     produtos_visuais:['NaAlO₂','H₂O'],
     candidatos:['NaAlO₂','H₂O','AlCl₃','Al(OH)₃','Na₂Al₂O₄','NaCl','Na₂SO₄','Al₂O₃'],
     gabarito:{produtos:['naalO2','aluminato de sodio','h2o','agua'],equacaoBalanceada:'Al₂O₃(s) + 2 NaOH(conc.) → 2 NaAlO₂(aq) + H₂O(l)'},
     hints:['Comportamento ácido do Al₂O₃: reage com base — anfótero!','Processo Bayer: NaOH dissolve Al₂O₃ da bauxita → NaAlO₂ → Al(OH)₃ → Al'],
     explicacao:'Al₂O₃+2NaOH→2NaAlO₂+H₂O · Al₂O₃ anfótero reage com base como óxido ácido. Processo Bayer de produção de alumínio usa NaOH para separar Al₂O₃ da bauxita'},
  ],
  'CuO':[
    {id:'cuo_h2',icon:'⚡',familia:'Redução com H₂',titulo:'CuO + H₂ → Cu + H₂O',
     reagentes:['CuO','H₂'],condicao:'Δ',coefR:{'CuO':1,'H₂':1},coefP:[1,1],
     produtos_visuais:['Cu','H₂O'],
     candidatos:['Cu','H₂O','CuCl₂','CuSO₄','Cu₂O','Fe','CO₂','H₂S'],
     gabarito:{produtos:['cu','cobre','h2o','agua'],equacaoBalanceada:'CuO(s) + H₂(g) →(Δ)→ Cu(s) + H₂O(g)'},
     hints:['H₂ reduz Cu²⁺ a Cu⁰. H: 0→+1. Cu: +2→0. Redução metalúrgica','Pó preto (CuO) → vermelho-metálico (Cu). Experimento visual clássico'],
     explicacao:'CuO+H₂→Cu+H₂O · Redução visual: preto→vermelho. H₂ é redutor; CuO é oxidante. Modelo de redução metalúrgica com H₂. Cu+2→0; H+0→+1'},
    {id:'cuo_co',icon:'🏭',familia:'Redução com CO',titulo:'CuO + CO → Cu + CO₂',
     reagentes:['CuO','CO'],condicao:'Δ',coefR:{'CuO':1,'CO':1},coefP:[1,1],
     produtos_visuais:['Cu','CO₂'],
     candidatos:['Cu','CO₂','CuCl₂','CuSO₄','Cu₂O','CO₂','Fe','CuO'],
     gabarito:{produtos:['cu','cobre','co2','dioxido de carbono'],equacaoBalanceada:'CuO(s) + CO(g) →(Δ)→ Cu(s) + CO₂(g)'},
     hints:['CO redutor + CuO oxidante → Cu + CO₂. C+2→+4; Cu+2→0','Análogo à metalurgia: coque (C) → CO → metal + CO₂'],
     explicacao:'CuO+CO→Cu+CO₂ · Redução do CuO pelo CO. Modelo da metalurgia extrativa. C: NOX+2→+4; Cu: NOX+2→0. Mesmo princípio do alto-forno em menor escala'},
  ],
  'MnO2':[
    {id:'mno2_hcl',icon:'🔬',familia:'Produção de Cl₂',titulo:'MnO₂ + 4 HCl → MnCl₂ + Cl₂ + 2 H₂O',
     reagentes:['MnO₂','HCl'],condicao:'concentrado, Δ',coefR:{'MnO₂':1,'HCl':4},coefP:[1,1,2],
     produtos_visuais:['MnCl₂','Cl₂','H₂O'],
     candidatos:['MnCl₂','Cl₂','H₂O','MnSO₄','MnO','FeCl₂','HCl','Mn'],
     gabarito:{produtos:['mncl2','cloreto de manganes','cl2','cloro','h2o','agua'],equacaoBalanceada:'MnO₂(s) + 4 HCl(conc.) →(Δ)→ MnCl₂(aq) + Cl₂(g) + 2 H₂O(l)'},
     hints:['MnO₂ (Mn⁴⁺) oxida Cl⁻ a Cl₂. Mn+4→+2. 4HCl: 2 fornecem H⁺ + 2 fornecem Cl⁻ oxidado','Scheele descobriu Cl₂ em 1774 com pirolusita (MnO₂) + HCl'],
     explicacao:'MnO₂+4HCl→MnCl₂+Cl₂+2H₂O · Descoberta histórica do Cl₂ por Scheele (1774). 2HCl→2H⁺+2e⁻. Mn⁴⁺+2e⁻→Mn²⁺. Método laboratorial clássico'},
  ],
  'SiO2':[
    {id:'sio2_hf',icon:'⚠️',familia:'Único ácido que dissolve vidro',titulo:'SiO₂ + 4 HF → SiF₄ + 2 H₂O',
     reagentes:['SiO₂','HF'],condicao:'',coefR:{'SiO₂':1,'HF':4},coefP:[1,2],
     produtos_visuais:['SiF₄','H₂O'],
     candidatos:['SiF₄','H₂O','H₂SiF₆','SiCl₄','HCl','SiO₂','NaF','H₂SiO₃'],
     gabarito:{produtos:['sif4','tetrafluoreto de silicio','h2o','agua'],equacaoBalanceada:'SiO₂(s) + 4 HF(aq) → SiF₄(g) + 2 H₂O(l)'},
     hints:['HF é o ÚNICO ácido que dissolve vidro (SiO₂). Si+4 forma SiF₄ (gás)','Por isso HF é guardado em plástico (PTFE), nunca em vidro'],
     explicacao:'SiO₂+4HF→SiF₄+2H₂O · HF corrói vidro — único ácido que faz isso. Guardado em plástico PTFE. Usado para gravar padrões em vidro e microfabricar chips. Extremamente perigoso!'},
    {id:'sio2_naoh',icon:'🏭',familia:'Síntese de Silicato',titulo:'SiO₂ + 2 NaOH → Na₂SiO₃ + H₂O',
     reagentes:['SiO₂','NaOH'],condicao:'Δ fundido',coefR:{'SiO₂':1,'NaOH':2},coefP:[1,1],
     produtos_visuais:['Na₂SiO₃','H₂O'],
     candidatos:['Na₂SiO₃','H₂O','NaCl','Na₂SO₄','SiF₄','NaF','Na₂CO₃','Na₂O'],
     gabarito:{produtos:['na2sio3','silicato de sodio','h2o','agua'],equacaoBalanceada:'SiO₂(s) + 2 NaOH(l) →(Δ)→ Na₂SiO₃(l) + H₂O(g)'},
     hints:['SiO₂ (óxido ácido) + NaOH (base) → sal + água. Na₂SiO₃ = vidro solúvel','Fabricação do vidro: SiO₂ + Na₂CO₃ + CaO → Na₂SiO₃ + CaSiO₃ + CO₂'],
     explicacao:'SiO₂+2NaOH→Na₂SiO₃+H₂O · SiO₂ como óxido ácido. Na₂SiO₃ (silicato de sódio / vidro solúvel) é adesivo industrial e tratamento anti-fogo. Reação da fabricação do vidro em alta T'},
  ],
  'LiOH':[
    {id:'lioh_co2',icon:'🚀',familia:'Absorção de CO₂',titulo:'2 LiOH + CO₂ → Li₂CO₃ + H₂O',
     reagentes:['LiOH','CO₂'],condicao:'',coefR:{'LiOH':2,'CO₂':1},coefP:[1,1],
     produtos_visuais:['Li₂CO₃','H₂O'],
     candidatos:['Li₂CO₃','H₂O','LiHCO₃','LiCl','LiNO₃','Na₂CO₃','LiOH','CO₂'],
     gabarito:{produtos:['li2co3','carbonato de litio','h2o','agua'],equacaoBalanceada:'2 LiOH(s) + CO₂(g) → Li₂CO₃(s) + H₂O(g)'},
     hints:['Base + óxido ácido → sal + água. LiOH absorve CO₂ mais eficientemente por massa que NaOH','Apollo 13: cartuchos de LiOH incompatíveis → crise de CO₂ resolvida com improviso'],
     explicacao:'2LiOH+CO₂→Li₂CO₃+H₂O · LiOH absorve CO₂ em espaçonaves e submarinos — superior ao NaOH por kg (menor massa molar). Apollo 13 usou improviso com plástico e fita para adaptar cartuchos'},
    {id:'lioh_hcl',icon:'⚗️',familia:'Neutralização',titulo:'LiOH + HCl → LiCl + H₂O',
     reagentes:['LiOH','HCl'],condicao:'',coefR:{'LiOH':1,'HCl':1},coefP:[1,1],
     produtos_visuais:['LiCl','H₂O'],
     candidatos:['LiCl','H₂O','LiNO₃','Li₂SO₄','LiBr','NaCl','LiHCO₃','LiOH'],
     gabarito:{produtos:['licl','cloreto de litio','h2o','agua'],equacaoBalanceada:'LiOH(aq) + HCl(aq) → LiCl(aq) + H₂O(l)'},
     hints:['Base forte + ácido forte → sal neutro + água','LiCl é higroscópico extremo — usado para secar ar em ar-condicionado e em baterias Li-metal'],
     explicacao:'LiOH+HCl→LiCl+H₂O · Neutralização simples. LiCl (cloreto de lítio) muito higroscópico. Usado para secar ar em sistemas de climatização e como eletrólito em baterias Li-metal experimentais'},
  ],
  'NH4Cl':[
    {id:'nh4cl_naoh',icon:'🔬',familia:'Produção de NH₃',titulo:'NH₄Cl + NaOH → NaCl + NH₃ + H₂O',
     reagentes:['NH₄Cl','NaOH'],condicao:'Δ',coefR:{'NH₄Cl':1,'NaOH':1},coefP:[1,1,1],
     produtos_visuais:['NaCl','NH₃','H₂O'],
     candidatos:['NaCl','NH₃','H₂O','NaNO₃','NH₄NO₃','Na₂SO₄','NaHCO₃','NH₄OH'],
     gabarito:{produtos:['nacl','cloreto de sodio','nh3','amonia','h2o','agua'],equacaoBalanceada:'NH₄Cl(aq) + NaOH(aq) →(Δ)→ NaCl(aq) + NH₃(g) + H₂O(l)'},
     hints:['Base forte desloca base fraca (NH₃) do sal. NH₄⁺ + OH⁻ → NH₃↑ + H₂O','Teste: papel de tornassol vermelho fica azul no vapor → confirma NH₃'],
     explicacao:'NH₄Cl+NaOH→NaCl+NH₃+H₂O · NaOH (base forte) libera NH₃ (base fraca) do sal de amônio. Método laboratorial simples de NH₃. Papel tornassol vermelho→azul confirma NH₃ volátil'},
    {id:'nh4cl_sublima',icon:'🌡️',familia:'Sublimação',titulo:'NH₄Cl(s) → NH₃(g) + HCl(g)',
     reagentes:['NH₄Cl'],condicao:'Δ ~338°C',coefR:{'NH₄Cl':1},coefP:[1,1],
     produtos_visuais:['NH₃','HCl'],
     candidatos:['NH₃','HCl','N₂','H₂','NaCl','NH₄NO₃','HBr','NaOH'],
     gabarito:{produtos:['nh3','amonia','hcl','acido cloridrico'],equacaoBalanceada:'NH₄Cl(s) →(338°C)→ NH₃(g) + HCl(g)'},
     hints:['NH₄Cl sublima: sólido→vapor sem fundir. NH₃+HCl se recombinam ao resfriar','Experimento: sublima na parte quente, condensa na parte fria como "neve branca"'],
     explicacao:'NH₄Cl→NH₃+HCl · Sublimação do cloreto de amônio. Ao resfriar NH₃+HCl recombinem → NH₄Cl. Experimento visual: "neve branca" na parte fria do tubo. Sublimação reversível'},
  ],
  'Na2SO3':[
    {id:'na2so3_hcl',icon:'🔬',familia:'Geração de SO₂',titulo:'Na₂SO₃ + 2 HCl → 2 NaCl + H₂O + SO₂',
     reagentes:['Na₂SO₃','HCl'],condicao:'',coefR:{'Na₂SO₃':1,'HCl':2},coefP:[2,1,1],
     produtos_visuais:['NaCl','H₂O','SO₂'],
     candidatos:['NaCl','H₂O','SO₂','Na₂SO₄','NaHSO₃','HCl','Na₂S','SO₃'],
     gabarito:{produtos:['nacl','cloreto de sodio','h2o','agua','so2','dioxido de enxofre'],equacaoBalanceada:'Na₂SO₃(aq) + 2 HCl(aq) → 2 NaCl(aq) + H₂O(l) + SO₂(g)'},
     hints:['Sal de ácido fraco + ácido forte → ácido fraco liberado (H₂SO₃→SO₂+H₂O)','Método laboratorial de SO₂: mais seguro que queimar enxofre'],
     explicacao:'Na₂SO₃+2HCl→2NaCl+H₂O+SO₂ · HCl forte libera H₂SO₃ instável → SO₂. Método laboratorial de SO₂. O gás branqueia flores (prova com tornassol → fica vermelho)'},
    {id:'na2so3_o2',icon:'🌿',familia:'Oxidação Espontânea',titulo:'2 Na₂SO₃ + O₂ → 2 Na₂SO₄',
     reagentes:['Na₂SO₃','O₂'],condicao:'ar',coefR:{'Na₂SO₃':2,'O₂':1},coefP:[2],
     produtos_visuais:['Na₂SO₄'],
     candidatos:['Na₂SO₄','Na₂SO₃','Na₂S','NaHSO₄','NaCl','Na₂CO₃','NaOH','Na₂SO₃'],
     gabarito:{produtos:['na2so4','sulfato de sodio'],equacaoBalanceada:'2 Na₂SO₃(aq) + O₂(g) → 2 Na₂SO₄(aq)'},
     hints:['S⁺⁴ (sulfito) oxidado a S⁺⁶ (sulfato) pelo O₂. Soluções de Na₂SO₃ envelhecem ao ar','Soluções devem ser frescas — envelhecidas perdem capacidade redutora'],
     explicacao:'2Na₂SO₃+O₂→2Na₂SO₄ · Oxidação espontânea do sulfito. Soluções guardadas ao ar perdem atividade. Por isso alimentos com "contém sulfitos" têm prazo de validade'},
  ],
  'CaSO4':[
    {id:'caso4_gesso',icon:'🏥',familia:'Hidratação do Gesso',titulo:'CaSO₄·½H₂O + H₂O → CaSO₄·2H₂O',
     reagentes:['CaSO₄'],condicao:'+ H₂O (amassar)',coefR:{'CaSO₄':1},coefP:[1],
     produtos_visuais:['CaSO₄'],
     candidatos:['CaSO₄','CaCO₃','CaCl₂','Ca(OH)₂','Ca(NO₃)₂','CaO','MgSO₄','BaSO₄'],
     gabarito:{produtos:['caso4','sulfato de calcio'],equacaoBalanceada:'CaSO₄·½H₂O(s) + H₂O(l) → CaSO₄·2H₂O(s)   [endurecimento]'},
     hints:['Gesso de Paris (hemihidrato) + H₂O → gipsita (dihidrato). Expansão ~1%: não racha','Endurece em ~10 min. Exotérmica. Expansão preenche detalhes do molde'],
     explicacao:'CaSO₄·½H₂O+H₂O→CaSO₄·2H₂O · Gesso endurece ao hidratar com expansão ~1%. Por isso não racha. Pirâmides egípcias cimentadas com gesso há 5000 anos!'},
    {id:'caso4_bacl2',icon:'🔬',familia:'Precipitação',titulo:'CaSO₄ + BaCl₂ → BaSO₄↓ + CaCl₂',
     reagentes:['CaSO₄','BaCl₂'],condicao:'',coefR:{'CaSO₄':1,'BaCl₂':1},coefP:[1,1],
     produtos_visuais:['BaSO₄','CaCl₂'],
     candidatos:['BaSO₄','CaCl₂','BaCO₃','BaO','Na₂SO₄','NaCl','CaSO₃','BaSO₃'],
     gabarito:{produtos:['baso4','sulfato de bario','cacl2','cloreto de calcio'],equacaoBalanceada:'CaSO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + CaCl₂(aq)'},
     hints:['BaSO₄ (Kps=1,1×10⁻¹⁰) precipita a partir do CaSO₄ (Kps=4,9×10⁻⁵)','BaSO₄ insolúvel em HCl — diferencia SO₄²⁻. Base da papa baritada em radiologia'],
     explicacao:'CaSO₄+BaCl₂→BaSO₄↓+CaCl₂ · O produto mais insolúvel precipita. Papa baritada: BaSO₄ opaco ao raio-X, usado para visualizar trato gastrointestinal'},
  ],
  'NaF':[
    {id:'naf_h2so4',icon:'🏭',familia:'Síntese Industrial de HF',titulo:'CaF₂ + H₂SO₄ → CaSO₄ + 2 HF',
     reagentes:['CaF₂','H₂SO₄'],condicao:'Δ 250°C',coefR:{'CaF₂':1,'H₂SO₄':1},coefP:[1,2],
     produtos_visuais:['CaSO₄','HF'],
     candidatos:['CaSO₄','HF','CaCl₂','CaF₂','NaF','H₂SiF₆','CaCO₃','Ca(NO₃)₂'],
     gabarito:{produtos:['caso4','sulfato de calcio','hf','acido fluoridrico'],equacaoBalanceada:'CaF₂(s) + H₂SO₄(l) →(250°C)→ CaSO₄(s) + 2 HF(g)'},
     hints:['Fluorita (CaF₂) + H₂SO₄ → CaSO₄ (gesso) + HF. Único método industrial de HF','Todo HF mundial vem desta reação. HF produz NaF, UF₆ (enriquecimento urânio), Teflon'],
     explicacao:'CaF₂+H₂SO₄→CaSO₄+2HF · Produção industrial de HF. CaF₂ (fluorita, mineral natural) + H₂SO₄ → HF a ~250°C. Toda a indústria do flúor (Teflon, refrigerantes, medicamentos fluorados) começa aqui'},
    {id:'naf_naoh',icon:'⚗️',familia:'Neutralização',titulo:'NaOH + HF → NaF + H₂O',
     reagentes:['NaOH','HF'],condicao:'',coefR:{'NaOH':1,'HF':1},coefP:[1,1],
     produtos_visuais:['NaF','H₂O'],
     candidatos:['NaF','H₂O','NaCl','NaBr','NaI','NaHF₂','Na₂SiF₆','NaOH'],
     gabarito:{produtos:['naf','fluoreto de sodio','h2o','agua'],equacaoBalanceada:'NaOH(aq) + HF(aq) → NaF(aq) + H₂O(l)'},
     hints:['Base forte + ácido fraco → sal + água. HF é ácido fraco (Ka=6,8×10⁻⁴) apesar do perigo','NaF usado para fluoretação de água potável (0,7 ppm) e pasta de dente'],
     explicacao:'NaOH+HF→NaF+H₂O · Neutralização: base forte (NaOH) + ácido fraco (HF) → NaF + H₂O. HF perigoso mas ácido fraco (Ka=6,8×10⁻⁴). NaF é inofensivo em concentrações de fluoretação'},
  ],
  'AgCl':[
    {id:'agcl_nh3',icon:'🔬',familia:'Dissolução em Amoníaco',titulo:'AgCl + 2 NH₃ → [Ag(NH₃)₂]⁺ + Cl⁻',
     reagentes:['AgCl','NH₃'],condicao:'',coefR:{'AgCl':1,'NH₃':2},coefP:[1,1],
     produtos_visuais:['Ag(NH₃)₂','NaCl'],
     candidatos:['Ag(NH₃)₂','NaCl','AgNO₃','AgBr','AgCN','NH₄Cl','NaOH','AgI'],
     gabarito:{produtos:['ag(nh3)2','ion diamineprata','nacl','cloreto'],equacaoBalanceada:'AgCl(s) + 2 NH₃(aq) → [Ag(NH₃)₂]⁺(aq) + Cl⁻(aq)'},
     hints:['NH₃ forma complexo com Ag⁺: [Ag(NH₃)₂]⁺. O AgCl insolúvel dissolve-se!','AgCl dissolve em NH₃. AgBr pouco. AgI não dissolve. Diferencia os haletos!'],
     explicacao:'AgCl+2NH₃→[Ag(NH₃)₂]⁺+Cl⁻ · Complexação dissolve precipitado. [Ag(NH₃)₂]⁺ = reagente de Tollens. AgBr dissolve parcialmente. AgI não dissolve. Método para diferenciar haletos de Ag na análise qualitativa'},
    {id:'agcl_luz',icon:'☀️',familia:'Fotólise',titulo:'2 AgCl →(luz)→ 2 Ag + Cl₂',
     reagentes:['AgCl'],condicao:'luz UV',coefR:{'AgCl':2},coefP:[2,1],
     produtos_visuais:['Ag','Cl₂'],
     candidatos:['Ag','Cl₂','AgNO₃','AgBr','Ag₂O','HCl','AgI','Ag₂CO₃'],
     gabarito:{produtos:['ag','prata','cl2','cloro'],equacaoBalanceada:'2 AgCl(s) →(hν)→ 2 Ag(s) + Cl₂(g)'},
     hints:['Luz reduz Ag⁺ a Ag⁰ (metal). AgCl branco → cinza-metálico ao sol','Base da fotografia analógica: AgBr exposto à luz → imagem latente → revelador amplifica'],
     explicacao:'2AgCl→2Ag+Cl₂ · Fotólise do AgCl. Ag⁺+e⁻(fóton)→Ag⁰. Escurecimento = base da fotografia analógica. Revelador amplifica a imagem latente por fator de 10⁸!'},
  ],
  'SnCl2':[
    {id:'sncl2_hgcl2',icon:'🔬',familia:'Teste de Hg²⁺',titulo:'SnCl₂ + 2 HgCl₂ → SnCl₄ + Hg₂Cl₂↓',
     reagentes:['SnCl₂','HgCl₂'],condicao:'',coefR:{'SnCl₂':1,'HgCl₂':2},coefP:[1,1],
     produtos_visuais:['SnCl₄','Hg₂Cl₂'],
     candidatos:['SnCl₄','Hg₂Cl₂','HgCl₂','SnCl₂','Hg','HgO','SnO₂','NaCl'],
     gabarito:{produtos:['sncl4','tetracloreto de estanho','hg2cl2','cloreto de dimercurio'],equacaoBalanceada:'SnCl₂(aq) + 2 HgCl₂(aq) → SnCl₄(aq) + Hg₂Cl₂(s)↓'},
     hints:['Sn²⁺→Sn⁴⁺ (perde 2e⁻). Hg²⁺→Hg₂²⁺ (ganham 2e⁻). Precipitado branco','Com excesso SnCl₂: Hg₂Cl₂+SnCl₂→2Hg+SnCl₄. Branco→cinza (Hg metálico)'],
     explicacao:'SnCl₂+2HgCl₂→SnCl₄+Hg₂Cl₂↓ · Teste histórico de Hg²⁺. Precipitado branco (Hg₂Cl₂). Com excesso SnCl₂→Hg metálico (cinza). Hoje substituído por ICP-MS'},
    {id:'sncl2_fecl3',icon:'🔬',familia:'Oxirredução',titulo:'SnCl₂ + 2 FeCl₃ → SnCl₄ + 2 FeCl₂',
     reagentes:['SnCl₂','FeCl₃'],condicao:'',coefR:{'SnCl₂':1,'FeCl₃':2},coefP:[1,2],
     produtos_visuais:['SnCl₄','FeCl₂'],
     candidatos:['SnCl₄','FeCl₂','FeCl₃','SnO₂','HgCl₂','NaCl','SnO','FeSO₄'],
     gabarito:{produtos:['sncl4','tetracloreto de estanho','fecl2','cloreto de ferro'],equacaoBalanceada:'SnCl₂(aq) + 2 FeCl₃(aq) → SnCl₄(aq) + 2 FeCl₂(aq)'},
     hints:['Sn²⁺→Sn⁴⁺ (perde 2e⁻). 2Fe³⁺→2Fe²⁺ (ganham 2e⁻). Marrom→verde','FeCl₃ (marrom) → FeCl₂ (verde pálido) ao adicionar SnCl₂. Mudança de cor visível'],
     explicacao:'SnCl₂+2FeCl₃→SnCl₄+2FeCl₂ · SnCl₂ reduz Fe³⁺ (marrom) a Fe²⁺ (verde). Sn²⁺/Sn⁴⁺ (E°=+0,15V) vs Fe³⁺/Fe²⁺ (E°=+0,77V) → reação espontânea. Teste visual simples'},
  ],
  'PbI2':[
    {id:'pbi2_chuva_dourada',icon:'✨',familia:'Precipitação / Chuva Dourada',titulo:'Pb(NO₃)₂ + 2 KI → PbI₂↓ + 2 KNO₃',
     reagentes:['Pb(NO₃)₂','KI'],condicao:'',coefR:{'Pb(NO₃)₂':1,'KI':2},coefP:[1,2],
     produtos_visuais:['PbI₂','KNO₃'],
     candidatos:['PbI₂','KNO₃','PbCl₂','PbSO₄','KCl','KOH','PbO','NaNO₃'],
     gabarito:{produtos:['pbi2','iodeto de chumbo','kno3','nitrato de potassio'],equacaoBalanceada:'Pb(NO₃)₂(aq) + 2 KI(aq) → PbI₂(s)↓ + 2 KNO₃(aq)'},
     hints:['Pb²⁺+2I⁻→PbI₂↓ amarelo canário espetacular! KNO₃ em solução','Chuva dourada: dissolve a quente, cristais amarelos precipitam ao resfriar'],
     explicacao:'Pb(NO₃)₂+2KI→PbI₂↓+2KNO₃ · "Chuva dourada": PbI₂ dissolve em água quente; ao resfriar, cristais amarelo-ouro precipitam lentamente como flocos dourados. Um dos experimentos mais visuais da química'},
  ],
  'FeCl2':[
    {id:'fecl2_naoh',icon:'🔬',familia:'Precipitação',titulo:'FeCl₂ + 2 NaOH → Fe(OH)₂↓ + 2 NaCl',
     reagentes:['FeCl₂','NaOH'],condicao:'',coefR:{'FeCl₂':1,'NaOH':2},coefP:[1,2],
     produtos_visuais:['Fe(OH)₂','NaCl'],
     candidatos:['Fe(OH)₂','NaCl','Fe(OH)₃','FeCl₃','FeO','Na₂SO₄','Fe₂O₃','NaOH'],
     gabarito:{produtos:['fe(oh)2','hidroxido de ferro','nacl','cloreto de sodio'],equacaoBalanceada:'FeCl₂(aq) + 2 NaOH(aq) → Fe(OH)₂(s)↓ + 2 NaCl(aq)'},
     hints:['Fe²⁺+2OH⁻→Fe(OH)₂↓ verde. Oxida rapidamente ao ar → Fe(OH)₃ castanho','Verde→castanho em segundos ao agitar ao ar: demonstração visual da oxidação do Fe(II)'],
     explicacao:'FeCl₂+2NaOH→Fe(OH)₂↓+2NaCl · Precipitado verde. Oxida ao ar: 4Fe(OH)₂+O₂+2H₂O→4Fe(OH)₃ (castanho). Isso é a ferrugem úmida! Transformação verde→ferrugem visível em segundos'},
    {id:'fecl2_oxidacao',icon:'🌿',familia:'Oxidação pelo O₂',titulo:'4 FeCl₂ + O₂ + 4 HCl → 4 FeCl₃ + 2 H₂O',
     reagentes:['FeCl₂','O₂','HCl'],condicao:'',coefR:{'FeCl₂':4,'O₂':1,'HCl':4},coefP:[4,2],
     produtos_visuais:['FeCl₃','H₂O'],
     candidatos:['FeCl₃','H₂O','FeSO₄','Fe₂(SO₄)₃','FeCl₂','FeO','Fe₂O₃','NaCl'],
     gabarito:{produtos:['fecl3','cloreto de ferro','h2o','agua'],equacaoBalanceada:'4 FeCl₂(aq) + O₂(g) + 4 HCl(aq) → 4 FeCl₃(aq) + 2 H₂O(l)'},
     hints:['Fe²⁺ oxidado a Fe³⁺ pelo O₂ em meio ácido. Verde pálido → marrom','Soluções de FeCl₂ ao ar ficam marrons gradualmente por esta reação'],
     explicacao:'4FeCl₂+O₂+4HCl→4FeCl₃+2H₂O · Oxidação do Fe(II) ao Fe(III) pelo O₂. Por isso soluções de FeCl₂ devem ser usadas frescas e guardadas em atmosfera inerte'},
  ],
  'MnSO4':[
    {id:'mnso4_naoh',icon:'🔬',familia:'Precipitação',titulo:'MnSO₄ + 2 NaOH → Mn(OH)₂↓ + Na₂SO₄',
     reagentes:['MnSO₄','NaOH'],condicao:'',coefR:{'MnSO₄':1,'NaOH':2},coefP:[1,1],
     produtos_visuais:['Mn(OH)₂','Na₂SO₄'],
     candidatos:['Mn(OH)₂','Na₂SO₄','MnO₂','MnO','MnCl₂','NaCl','Na₂CO₃','NaOH'],
     gabarito:{produtos:['mn(oh)2','hidroxido de manganes','na2so4','sulfato de sodio'],equacaoBalanceada:'MnSO₄(aq) + 2 NaOH(aq) → Mn(OH)₂(s)↓ + Na₂SO₄(aq)'},
     hints:['Mn²⁺+2OH⁻→Mn(OH)₂↓ branco (oxida ao ar → Mn(OH)₃ marrom → MnO₂ preto)','MnSO₄ é produto da titulação permanganométrica: KMnO₄+Fe²⁺+H₂SO₄ → MnSO₄'],
     explicacao:'MnSO₄+2NaOH→Mn(OH)₂↓+Na₂SO₄ · Precipitado branco de Mn(OH)₂ que oxida progressivamente ao ar: branco→marrom→preto (MnO₂). Indicador visual da oxidação do Mn²⁺'},
  ],
  'K2Cr2O7':[
    {id:'k2cr2o7_fe',icon:'🔬',familia:'Titulação Dicromatométrica',titulo:'K₂Cr₂O₇ + 6 FeSO₄ + 7 H₂SO₄ → Cr₂(SO₄)₃ + 3 Fe₂(SO₄)₃ + K₂SO₄ + 7 H₂O',
     reagentes:['K₂Cr₂O₇','FeSO₄','H₂SO₄'],condicao:'',coefR:{'K₂Cr₂O₇':1,'FeSO₄':6,'H₂SO₄':7},coefP:[1,3,1,7],
     produtos_visuais:['Cr₂(SO₄)₃','Fe₂(SO₄)₃','K₂SO₄','H₂O'],
     candidatos:['Cr₂(SO₄)₃','Fe₂(SO₄)₃','K₂SO₄','H₂O','KMnO₄','FeCl₃','MnSO₄','Na₂SO₄'],
     gabarito:{produtos:['cr2(so4)3','sulfato de cromo','fe2(so4)3','sulfato de ferro','k2so4','sulfato de potassio','h2o','agua'],equacaoBalanceada:'K₂Cr₂O₇+6FeSO₄+7H₂SO₄→K₂SO₄+Cr₂(SO₄)₃+3Fe₂(SO₄)₃+7H₂O'},
     hints:['Cr₂O₇²⁻ (laranja) + Fe²⁺ → Cr³⁺ (verde) + Fe³⁺. E°(Cr₂O₇²⁻/Cr³⁺)=+1,33V','Titulação dicromatométrica: padrão primário. Indicador: difenilamina (violeta → incolor)'],
     explicacao:'K₂Cr₂O₇+6FeSO₄+7H₂SO₄→... · Titulação dicromatométrica — padrão primário de Fe²⁺. Cr(VI) (laranja)→Cr(III) (verde). E°=+1,33V. Usado para dosagem de Fe em aço, minério, medicamentos'},
  ],
  };

  Object.keys(r4).forEach(function(k){
    if(!REACOES_LIVRES[k]) REACOES_LIVRES[k] = [];
    r4[k].forEach(function(rxn){ REACOES_LIVRES[k].push(rxn); });
  });
})();


/* ── 5 compostos adicionais para atingir exatamente 100 ── */
(function(){
  var exp5 = [
  {
    id:'cr2o3', formula:'Cr₂O₃', formulaId:'Cr2O3',
    nome:'Óxido de Cromo III', funcao:'oxido', categoria:'Óxidos Anfóteros',
    massa:'152,00 g/mol', Tf:2435, Tb:4000, densidade:'5,22 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em ácidos fortes',
    ph:'neutro-anfótero', nomenclatura:'Trióxido de dicromo (esmeraldina)',
    badges:['anfótero','verde','pigmento','cromo III'],
    geometria:'Coríndon (hexagonal)', ligacao:'Iônica (Cr³⁺ e O²⁻)',
    equacao:'Cr₂O₃ + 6 HCl → 2 CrCl₃ + 3 H₂O',
    reacao:'4 Cr(s) + 3 O₂(g) → 2 Cr₂O₃(s)',
    lewis:'generico', uso:'Pigmento verde (tinta, plástico, vidro), polimento de metais (pasta de Cr₂O₃), catalisador',
    curiosidade:'O Cr₂O₃ (verde) é muito menos tóxico que o Cr(VI) (laranja/amarelo). A "pasta verde" usada para afiar navalhas e bisturis é Cr₂O₃ fino. Rubi = Al₂O₃ com Cr³⁺ (vermelho); Esmeralda = Be₃Al₂(SiO₃)₆ com Cr³⁺ (verde).',
    descricao:'Óxido anfótero de Cr(III), pó verde intenso. Ponto de fusão altíssimo (2435°C). Pigmento verde industrial. Muito mais estável e menos tóxico que compostos de Cr(VI). Forma-se na superfície do aço inoxidável (camada passiva).',
  },
  {
    id:'tio2', formula:'TiO₂', formulaId:'TiO2',
    nome:'Dióxido de Titânio', funcao:'oxido', categoria:'Óxidos Anfóteros',
    massa:'79,87 g/mol', Tf:1843, Tb:2972, densidade:'4,23 g/cm³',
    solubilidade:'Insolúvel em água; dissolve em H₂SO₄ concentrado quente e HF',
    ph:'neutro', nomenclatura:'Dióxido de titânio (titânia)',
    badges:['branco','fotocatalisador','protetor solar','pigmento'],
    geometria:'Rutilo (tetragonal) ou anatásio', ligacao:'Iônica (Ti⁴⁺ e O²⁻)',
    equacao:'TiO₂ →(UV)→ e⁻(BC) + h⁺(BV)   [fotocatálise]',
    reacao:'TiCl₄(l) + 2 H₂O(g) → TiO₂(s) + 4 HCl(g)',
    lewis:'generico', uso:'Pigmento branco (tintas, plásticos, papel), protetor solar (bloqueio UV), fotocatálise (purificação de ar e água)',
    curiosidade:'TiO₂ é o pigmento branco mais usado no mundo — está em quase toda tinta branca, creme dental e protetor solar. A anatásio (TiO₂) sob UV decompõe poluentes orgânicos e mata bactérias — painéis autolimpantes e purificadores de ar.',
    descricao:'Óxido de Ti(IV), branco intenso. Maior índice de refração entre os óxidos comuns (n=2,55 rutilo) — por isso brilhante opaco. Fotocatalisador: bandgap 3,2 eV absorve UV, gera radicais •OH que oxidam poluentes.',
  },
  {
    id:'na2o2', formula:'Na₂O₂', formulaId:'Na2O2',
    nome:'Peróxido de Sódio', funcao:'oxido', categoria:'Peróxidos',
    massa:'77,98 g/mol', Tf:675, Tb:null, densidade:'2,81 g/cm³',
    solubilidade:'Reage violentamente com água → NaOH + H₂O₂',
    ph:'> 13', nomenclatura:'Peróxido de sódio',
    badges:['peróxido','oxidante','gerador O₂','submarinos'],
    geometria:'Iônica (O₂²⁻ e Na⁺)', ligacao:'Iônica (Na⁺ e O₂²⁻)',
    equacao:'2 Na₂O₂ + 2 H₂O → 4 NaOH + O₂   [geração de O₂]',
    reacao:'2 Na(s) + O₂(g) → Na₂O₂(s)   [queima em excesso de O₂]',
    lewis:'generico', uso:'Gerador de O₂ em submarinos e minas (reage com CO₂ e H₂O liberando O₂), branqueamento, oxidante',
    curiosidade:'Em submarinos: Na₂O₂ + CO₂ → Na₂CO₃ + O₂. O tripulante expira CO₂, o cartucho absorve e libera O₂. Uma equação que sustenta vida submersa! Também bleaching de tecidos: Na₂O₂ + H₂O → NaOH + H₂O₂.',
    descricao:'Peróxido do sódio — contém o íon O₂²⁻ (peroxídico). Forma-se quando Na queima com excesso de O₂. Usado para regenerar ar em ambientes fechados (submarinos, minas): absorve CO₂ e H₂O, libera O₂.',
  },
  {
    id:'caso3', formula:'CaSO₃', formulaId:'CaSO3',
    nome:'Sulfito de Cálcio', funcao:'sal', categoria:'Sais de Cálcio',
    massa:'120,17 g/mol', Tf:null, Tb:null, densidade:'2,51 g/cm³',
    solubilidade:'Pouco solúvel (0,0043 g/100 mL a 18°C)',
    ph:'8–10', nomenclatura:'Sulfito de cálcio',
    badges:['insolúvel','dessulfurização','FGD','precipitado'],
    geometria:'Iônica; SO₃²⁻ piramidal', ligacao:'Iônica (Ca²⁺ e SO₃²⁻)',
    equacao:'CaSO₃ ⇌ Ca²⁺ + SO₃²⁻   Kps = 3,1×10⁻⁷',
    reacao:'CaO(s) + SO₂(g) → CaSO₃(s)   [dessulfurização de gases]',
    lewis:'sal_ionico', uso:'Dessulfurização de gases de combustão (FGD — Flue Gas Desulfurization), branqueamento de papel',
    curiosidade:'Usinas termelétricas a carvão injetam CaO (calcário calcinado) nos gases de combustão: CaO + SO₂ → CaSO₃, reduzindo a emissão de SO₂ (chuva ácida) em até 95%. Produção mundial: milhões de toneladas/ano como subproduto.',
    descricao:'Precipitado branco pouco solúvel. Produzido em larga escala no processo FGD (dessulfurização de gases) de termelétricas a carvão e óleo. Pode ser oxidado a CaSO₄ (gesso) vendável para a construção civil.',
  },
  {
    id:'zns', formula:'ZnS', formulaId:'ZnS',
    nome:'Sulfeto de Zinco', funcao:'sal', categoria:'Sais de Enxofre',
    massa:'97,47 g/mol', Tf:1700, Tb:null, densidade:'4,09 g/cm³',
    solubilidade:'Insolúvel em água (Kps = 1,6×10⁻²⁴)',
    ph:'neutro', nomenclatura:'Sulfeto de zinco (blenda, esfalerita)',
    badges:['insolúvel','luminescente','mineral','blenda'],
    geometria:'Cúbica (blenda de zinco) ou hexagonal (wurtzita)', ligacao:'Covalente com caráter iônico',
    equacao:'ZnS ⇌ Zn²⁺ + S²⁻   Kps = 1,6×10⁻²⁴',
    reacao:'Zn(s) + S(s) →(Δ)→ ZnS(s)   [síntese direta]',
    lewis:'sal_ionico', uso:'Pigmento branco, tela de raios catódicos (CRT), cintilador, material fosforescente (visão noturna)',
    curiosidade:'ZnS dopado com Cu emite luz verde ao ser excitado por raios-X ou elétrons — foi o material das telas de TVs e monitores CRT durante décadas. ZnS:Ag emite azul. Ainda usado em telas de osciloscópio e detectores de radiação.',
    descricao:'Mineral esfalerita (blenda de zinco) — principal minério de Zn. Semicondutor de bandgap largo (3,6 eV). Fosforescente quando dopado. Precipitado branco em análise qualitativa: H₂S + Zn²⁺ (pH neutro) → ZnS↓.',
  },
  ];

  exp5.forEach(function(c){
    var estado='—';
    if(c.Tf!==null&&c.Tb!==null){ if(c.Tf>25) estado='Sólido (25 °C)'; else if(c.Tb<25) estado='Gasoso (25 °C)'; else estado='Líquido (25 °C)'; }
    else if(c.Tf===null){ estado='Aquoso / Instável'; }
    else if(c.Tf>25){ estado='Sólido (25 °C)'; }
    c.estado=estado; c.pfStr=c.Tf!==null?c.Tf+' °C':'—'; c.peStr=c.Tb!==null?c.Tb+' °C':'— (decompõe)';
    CATALOGO_SIQI.push(c);
  });
})();


/* ═══════════════════════════════════════════════════════════════
   EXPANSÃO 5 — Reações para os 26 compostos sem experimentos
═══════════════════════════════════════════════════════════════ */
(function(){
  var r5 = {

  /* ── BaO ── */
  'BaO': [
    { id:'bao_h2o', icon:'⚗️', familia:'Reação com Água',
      titulo:'BaO + H₂O → Ba(OH)₂',
      reagentes:['BaO','H₂O'], condicao:'exotérmico', coefR:{'BaO':1,'H₂O':1}, coefP:[1],
      produtos_visuais:['Ba(OH)₂'],
      candidatos:['Ba(OH)₂','BaSO₄','BaCO₃','BaCl₂','Ba(NO₃)₂','BaO','CaO','Ca(OH)₂'],
      gabarito:{produtos:['ba(oh)2','hidroxido de bario'],
        equacaoBalanceada:'BaO(s) + H₂O(l) → Ba(OH)₂(aq)   ΔH = −126 kJ/mol'},
      hints:['Óxido básico + água → base. BaO + H₂O → Ba(OH)₂ (hidróxido de bário)','Reação exotérmica (−126 kJ/mol). Ba(OH)₂ é a base mais solúvel dentre os alcalino-terrosos'],
      explicacao:'BaO+H₂O→Ba(OH)₂ · Óxido básico + água → base forte. Ba(OH)₂ é muito solúvel (5,6 g/100 mL a 20°C) e forte. Usado para preparar soluções básicas e como padrão analítico' },
    { id:'bao_co2', icon:'🔬', familia:'Síntese',
      titulo:'BaO + CO₂ → BaCO₃',
      reagentes:['BaO','CO₂'], condicao:'', coefR:{'BaO':1,'CO₂':1}, coefP:[1],
      produtos_visuais:['BaCO₃'],
      candidatos:['BaCO₃','BaSO₄','BaO','Ba(OH)₂','BaCl₂','CaCO₃','Na₂CO₃','MgCO₃'],
      gabarito:{produtos:['baco3','carbonato de bario'],
        equacaoBalanceada:'BaO(s) + CO₂(g) → BaCO₃(s)'},
      hints:['Óxido básico + óxido ácido → sal. BaO + CO₂ → BaCO₃ (witherita)','Mesma lógica: CaO+CO₂→CaCO₃. BaCO₃ = witherita, mineral raro'],
      explicacao:'BaO+CO₂→BaCO₃ · Óxido básico + anidrido carbônico → carbonato. BaCO₃ (witherita) é mineral natural raro. Reação análoga à recarbonação do Ca(OH)₂ na cura do cimento' },
    { id:'bao_h2so4', icon:'⚗️', familia:'Neutralização',
      titulo:'BaO + H₂SO₄ → BaSO₄↓ + H₂O',
      reagentes:['BaO','H₂SO₄'], condicao:'', coefR:{'BaO':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['BaSO₄','H₂O'],
      candidatos:['BaSO₄','H₂O','BaCl₂','BaCO₃','Ba(NO₃)₂','BaSO₃','CaSO₄','MgSO₄'],
      gabarito:{produtos:['baso4','sulfato de bario','h2o','agua'],
        equacaoBalanceada:'BaO(s) + H₂SO₄(aq) → BaSO₄(s)↓ + H₂O(l)'},
      hints:['Óxido básico + ácido → sal + água. BaSO₄ é insolúvel (Kps=1,1×10⁻¹⁰)','BaO + H₂SO₄ → BaSO₄↓ branco + H₂O. BaSO₄ = contraste de raio-X (papa baritada)'],
      explicacao:'BaO+H₂SO₄→BaSO₄↓+H₂O · Óxido básico + ácido → sal insolúvel. O BaSO₄ precipita imediatamente. Insolúvel em HCl — base da papa baritada usada em radiologia digestiva' },
  ],

  /* ── CaSO₃ ── */
  'CaSO3': [
    { id:'caso3_hcl', icon:'🔬', familia:'Dupla Troca',
      titulo:'CaSO₃ + 2 HCl → CaCl₂ + H₂O + SO₂',
      reagentes:['CaSO₃','HCl'], condicao:'', coefR:{'CaSO₃':1,'HCl':2}, coefP:[1,1,1],
      produtos_visuais:['CaCl₂','H₂O','SO₂'],
      candidatos:['CaCl₂','H₂O','SO₂','CaSO₄','Ca(OH)₂','CaO','Na₂SO₃','CaCO₃'],
      gabarito:{produtos:['cacl2','cloreto de calcio','h2o','agua','so2','dioxido de enxofre'],
        equacaoBalanceada:'CaSO₃(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l) + SO₂(g)'},
      hints:['Sal de ácido fraco (H₂SO₃) + ácido forte → libera SO₂ gasoso','CaSO₃ + 2HCl → CaCl₂ + H₂O + SO₂. Efervescência de SO₂ (odor pungente)'],
      explicacao:'CaSO₃+2HCl→CaCl₂+H₂O+SO₂ · Ácido forte desloca ácido fraco instável (H₂SO₃→SO₂). Analogia: CaCO₃+2HCl→CaCl₂+H₂O+CO₂. Produz SO₂ — identificado pelo odor e tornassol vermelho' },
    { id:'caso3_fgd', icon:'🏭', familia:'Dessulfurização Industrial',
      titulo:'CaO + SO₂ → CaSO₃',
      reagentes:['CaO','SO₂'], condicao:'FGD em termelétrica', coefR:{'CaO':1,'SO₂':1}, coefP:[1],
      produtos_visuais:['CaSO₃'],
      candidatos:['CaSO₃','CaSO₄','CaCO₃','Ca(OH)₂','CaO','Na₂SO₃','BaSO₃','MgSO₃'],
      gabarito:{produtos:['caso3','sulfito de calcio'],
        equacaoBalanceada:'CaO(s) + SO₂(g) → CaSO₃(s)'},
      hints:['Óxido básico + óxido ácido → sal. CaO captura SO₂ das chaminés','Processo FGD: calcário (CaCO₃) → CaO → CaO+SO₂ → CaSO₃ → oxidação → CaSO₄ (gesso)'],
      explicacao:'CaO+SO₂→CaSO₃ · Base do processo FGD de dessulfurização. Termelétricas a carvão injetam CaO nos gases → CaSO₃ precipita. Reduz SO₂ (chuva ácida) em até 95%. Subproduto oxidado → gesso (CaSO₄) vendável' },
  ],

  /* ── Cr₂O₃ ── */
  'Cr2O3': [
    { id:'cr2o3_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Cr₂O₃ + 6 HCl → 2 CrCl₃ + 3 H₂O',
      reagentes:['Cr₂O₃','HCl'], condicao:'', coefR:{'Cr₂O₃':1,'HCl':6}, coefP:[2,3],
      produtos_visuais:['CrCl₃','H₂O'],
      candidatos:['CrCl₃','H₂O','CrCl₂','Cr(OH)₃','Cr₂O₃','CrSO₄','AlCl₃','FeCl₃'],
      gabarito:{produtos:['crcl3','cloreto de cromo','h2o','agua'],
        equacaoBalanceada:'Cr₂O₃(s) + 6 HCl(aq) → 2 CrCl₃(aq) + 3 H₂O(l)'},
      hints:['Óxido anfótero + ácido → sal + água. Cr₂O₃ comporta-se como base aqui','2 Cr³⁺ precisa de 6 Cl⁻ → 6 HCl. Solução verde de CrCl₃'],
      explicacao:'Cr₂O₃+6HCl→2CrCl₃+3H₂O · Comportamento básico do Cr₂O₃ anfótero. CrCl₃ em solução é verde-escuro. Cr(III) é não-tóxico; bem diferente do Cr(VI) cancerígeno' },
    { id:'cr2o3_al_termita', icon:'⚡', familia:'Reação Aluminotérmica',
      titulo:'Cr₂O₃ + 2 Al → Al₂O₃ + 2 Cr',
      reagentes:['Cr₂O₃','Al'], condicao:'ignição', coefR:{'Cr₂O₃':1,'Al':2}, coefP:[1,2],
      produtos_visuais:['Al₂O₃','Cr'],
      candidatos:['Al₂O₃','Cr','AlCl₃','Al(OH)₃','CrCl₃','Cr₂O₃','Fe','CuO'],
      gabarito:{produtos:['al2o3','oxido de aluminio','cr','cromo'],
        equacaoBalanceada:'Cr₂O₃(s) + 2 Al(s) →(ignição)→ Al₂O₃(s) + 2 Cr(l)'},
      hints:['Reação aluminotérmica: Al reduz Cr³⁺ a Cr⁰. Al é mais reativo que Cr','Análoga à termita Fe₂O₃+2Al→Al₂O₃+2Fe. Usada para obter Cr metálico puro'],
      explicacao:'Cr₂O₃+2Al→Al₂O₃+2Cr · Aluminotermia de cromo. Al (mais reativo) reduz Cr³⁺. Altamente exotérmica. Usada industrialmente para produzir Cr metálico puro para ligas (aço inoxidável contém 10-18% Cr)' },
  ],

  /* ── Fe₃O₄ ── */
  'Fe3O4': [
    { id:'fe3o4_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Fe₃O₄ + 8 HCl → FeCl₂ + 2 FeCl₃ + 4 H₂O',
      reagentes:['Fe₃O₄','HCl'], condicao:'', coefR:{'Fe₃O₄':1,'HCl':8}, coefP:[1,2,4],
      produtos_visuais:['FeCl₂','FeCl₃','H₂O'],
      candidatos:['FeCl₂','FeCl₃','H₂O','FeO','Fe₂O₃','FeSO₄','Fe(OH)₂','Fe(OH)₃'],
      gabarito:{produtos:['fecl2','cloreto de ferro ii','fecl3','cloreto de ferro iii','h2o','agua'],
        equacaoBalanceada:'Fe₃O₄(s) + 8 HCl(aq) → FeCl₂(aq) + 2 FeCl₃(aq) + 4 H₂O(l)'},
      hints:['Fe₃O₄ = FeO·Fe₂O₃: contém Fe²⁺ e Fe³⁺. 1 FeCl₂ + 2 FeCl₃','8 HCl: 2 para Fe²⁺ + 6 para 2 Fe³⁺ = 8 total'],
      explicacao:'Fe₃O₄+8HCl→FeCl₂+2FeCl₃+4H₂O · Dissolução da magnetita em HCl. O óxido misto libera Fe²⁺ e Fe³⁺ na proporção 1:2 (FeO:Fe₂O₃). Método de análise do teor de Fe em minerais magnéticos' },
    { id:'fe3o4_h2', icon:'🏭', familia:'Redução com H₂',
      titulo:'Fe₃O₄ + 4 H₂ → 3 Fe + 4 H₂O',
      reagentes:['Fe₃O₄','H₂'], condicao:'Δ 800°C', coefR:{'Fe₃O₄':1,'H₂':4}, coefP:[3,4],
      produtos_visuais:['Fe','H₂O'],
      candidatos:['Fe','H₂O','FeO','Fe₂O₃','FeCl₂','CO₂','Fe(OH)₂','FeSO₄'],
      gabarito:{produtos:['fe','ferro','h2o','agua'],
        equacaoBalanceada:'Fe₃O₄(s) + 4 H₂(g) →(800°C)→ 3 Fe(s) + 4 H₂O(g)'},
      hints:['H₂ reduz os três Fe de Fe₃O₄ a Fe⁰. 4 H₂ para 4 O do óxido','Redução direta com H₂: alternativa "verde" ao coque (CO). Fe₃O₄+4H₂→3Fe+4H₂O'],
      explicacao:'Fe₃O₄+4H₂→3Fe+4H₂O · Redução da magnetita com H₂. "Green steel": usar H₂ (de eletrólise) em vez de coque (CO₂) para reduzir minério. Empresas europeias já produzem aço "verde" assim — emissão zero de CO₂' },
  ],

  /* ── FeS ── */
  'FeS': [
    { id:'fes_hcl_h2s', icon:'🔬', familia:'Geração de H₂S (Kipp)',
      titulo:'FeS + 2 HCl → FeCl₂ + H₂S↑',
      reagentes:['FeS','HCl'], condicao:'', coefR:{'FeS':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['FeCl₂','H₂S'],
      candidatos:['FeCl₂','H₂S','FeSO₄','FeO','Fe(OH)₂','HCl','NaCl','FeCl₃'],
      gabarito:{produtos:['fecl2','cloreto de ferro','h2s','acido sulfidrico'],
        equacaoBalanceada:'FeS(s) + 2 HCl(aq) → FeCl₂(aq) + H₂S(g)'},
      hints:['Ácido forte + sulfeto → libera H₂S gasoso (cheiro de ovo podre)','Método de Kipp: FeS+HCl→H₂S. H₂S é mais tóxico que HCN! Usar em boa ventilação'],
      explicacao:'FeS+2HCl→FeCl₂+H₂S · Método clássico de produção de H₂S em laboratório (aparelho de Kipp). H₂S tem cheiro inconfundível de ovo podre. Precipita metais pesados: H₂S+Pb²⁺→PbS↓ negro' },
    { id:'fes_fe_s_sint', icon:'🔥', familia:'Síntese Direta',
      titulo:'Fe + S → FeS',
      reagentes:['Fe','S'], condicao:'Δ', coefR:{'Fe':1,'S':1}, coefP:[1],
      produtos_visuais:['FeS'],
      candidatos:['FeS','FeS₂','Fe₂O₃','FeCl₂','FeO','Fe(OH)₂','ZnS','CuS'],
      gabarito:{produtos:['fes','sulfeto de ferro'],
        equacaoBalanceada:'Fe(s) + S(s) →(Δ)→ FeS(s)'},
      hints:['Reação de síntese direta: Fe + S → FeS ao aquecer. Mistura vira pó preto','Demonstração clássica: mistura Fe+S (atraída por ímã) aquecida → FeS (não atraída). Mostra ligação química alterando propriedades'],
      explicacao:'Fe+S→FeS · Experimento clássico de síntese. Mistura Fe+S é atraída por ímã (Fe metálico livre). Após aquecimento → FeS: NÃO é atraída pelo ímã. Prova que o produto é diferente dos reagentes!' },
  ],

  /* ── H₂CrO₄ ── */
  'H2CrO4': [
    { id:'h2cro4_naoh_cromato', icon:'⚗️', familia:'Neutralização',
      titulo:'H₂CrO₄ + 2 NaOH → Na₂CrO₄ + 2 H₂O',
      reagentes:['H₂CrO₄','NaOH'], condicao:'', coefR:{'H₂CrO₄':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Na₂CrO₄','H₂O'],
      candidatos:['Na₂CrO₄','H₂O','Na₂Cr₂O₇','NaCrO₄','NaCl','Na₂SO₄','NaNO₃','NaOH'],
      gabarito:{produtos:['na2cro4','cromato de sodio','h2o','agua'],
        equacaoBalanceada:'H₂CrO₄(aq) + 2 NaOH(aq) → Na₂CrO₄(aq) + 2 H₂O(l)'},
      hints:['Ácido diprótido + 2 base → sal + água. CrO₄²⁻ (amarelo) formado','Em pH básico: cromato CrO₄²⁻ (amarelo). Em pH ácido: dicromato Cr₂O₇²⁻ (laranja)'],
      explicacao:'H₂CrO₄+2NaOH→Na₂CrO₄+2H₂O · Neutralização formando cromato amarelo. Em meio ácido converte ao dicromato (Cr₂O₇²⁻). Equilíbrio 2CrO₄²⁻+2H⁺⇌Cr₂O₇²⁻+H₂O controla a cor: amarelo↔laranja' },
    { id:'h2cro4_hcl_dicrom', icon:'🔬', familia:'Conversão a Dicromato',
      titulo:'2 H₂CrO₄ + H₂SO₄ → Cr₂O₇²⁻ + ... ',
      reagentes:['H₂CrO₄','H₂SO₄'], condicao:'acidificação', coefR:{'H₂CrO₄':2,'H₂SO₄':1}, coefP:[1,3],
      produtos_visuais:['Na₂Cr₂O₇','H₂O'],
      candidatos:['Na₂Cr₂O₇','H₂O','Na₂CrO₄','CrCl₃','Cr₂O₃','H₂SO₄','K₂Cr₂O₇','CrSO₄'],
      gabarito:{produtos:['na2cr2o7','dicromato','h2o','agua'],
        equacaoBalanceada:'2 CrO₄²⁻(aq) + 2 H⁺(aq) → Cr₂O₇²⁻(aq) + H₂O(l)'},
      hints:['Acidificação: CrO₄²⁻ (amarelo) → Cr₂O₇²⁻ (laranja). Equilíbrio pH-dependente','Amarelo (básico) ↔ laranja (ácido). Adicionando ácido → solução fica laranja'],
      explicacao:'2CrO₄²⁻+2H⁺→Cr₂O₇²⁻+H₂O · Conversão cromato→dicromato. Equilíbrio dependente do pH. Adicionando ácido a Na₂CrO₄ amarelo → Na₂Cr₂O₇ laranja. Base reverte: Cr₂O₇²⁻+2OH⁻→2CrO₄²⁻+H₂O' },
  ],

  /* ── H₃PO₃ ── */
  'H3PO3': [
    { id:'h3po3_naoh', icon:'⚗️', familia:'Neutralização (diácido)',
      titulo:'H₃PO₃ + 2 NaOH → Na₂HPO₃ + 2 H₂O',
      reagentes:['H₃PO₃','NaOH'], condicao:'', coefR:{'H₃PO₃':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Na₂HPO₃','H₂O'],
      candidatos:['Na₂HPO₃','H₂O','Na₃PO₄','NaH₂PO₄','Na₃PO₃','NaCl','Na₂SO₄','NaOH'],
      gabarito:{produtos:['na2hpo3','fosfito de sodio','h2o','agua'],
        equacaoBalanceada:'H₃PO₃(aq) + 2 NaOH(aq) → Na₂HPO₃(aq) + 2 H₂O(l)'},
      hints:['H₃PO₃ é DIÁCIDO (não triácido): apenas 2 H ionizáveis. Precisa 2 NaOH','O 3º H está ligado diretamente ao P (P-H) e NÃO se ioniza. Na₂HPO₃ contém 1 H restante'],
      explicacao:'H₃PO₃+2NaOH→Na₂HPO₃+2H₂O · H₃PO₃ é diácido! O P tem um H não-ionizável (P-H direto). Requer 2 NaOH para neutralização completa. Na₂HPO₃ = fosfito de sódio, redutor e antioxidante industrial' },
    { id:'h3po3_agno3', icon:'🔬', familia:'Oxidação-Redução',
      titulo:'H₃PO₃ + 2 AgNO₃ + H₂O → H₃PO₄ + 2 Ag + 2 HNO₃',
      reagentes:['H₃PO₃','AgNO₃','H₂O'], condicao:'', coefR:{'H₃PO₃':1,'AgNO₃':2,'H₂O':1}, coefP:[1,2,2],
      produtos_visuais:['H₃PO₄','Ag','HNO₃'],
      candidatos:['H₃PO₄','Ag','HNO₃','AgCl','H₃PO₃','AgNO₂','H₂SO₄','AgOH'],
      gabarito:{produtos:['h3po4','acido fosforico','ag','prata','hno3','acido nitrico'],
        equacaoBalanceada:'H₃PO₃(aq) + 2 AgNO₃(aq) + H₂O(l) → H₃PO₄(aq) + 2 Ag(s) + 2 HNO₃(aq)'},
      hints:['H₃PO₃ (P+3) é redutor: oxida-se a H₃PO₄ (P+5). Reduz Ag⁺ a Ag⁰','P: +3→+5 (perde 2e⁻). 2 Ag⁺: cada ganha 1e⁻→Ag⁰. Prata metálica precipita'],
      explicacao:'H₃PO₃+2AgNO₃+H₂O→H₃PO₄+2Ag+2HNO₃ · H₃PO₃ é forte redutor. Reduz Ag⁺ a Ag⁰ (espelho de prata). P: NOX +3→+5. Reação análoga ao teste de Tollens — evidência do poder redutor do H₃PO₃' },
  ],

  /* ── HClO₃ ── */
  'HClO3': [
    { id:'hclo3_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HClO₃ + NaOH → NaClO₃ + H₂O',
      reagentes:['HClO₃','NaOH'], condicao:'', coefR:{'HClO₃':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaClO₃','H₂O'],
      candidatos:['NaClO₃','H₂O','NaClO₄','NaClO','NaCl','NaClO₂','Na₂SO₄','NaNO₃'],
      gabarito:{produtos:['naclo3','clorato de sodio','h2o','agua'],
        equacaoBalanceada:'HClO₃(aq) + NaOH(aq) → NaClO₃(aq) + H₂O(l)'},
      hints:['Ácido forte + base forte → sal neutro + água. NaClO₃ = clorato de sódio','Cl está em NOX +5. NaClO₃ é oxidante e usado em herbicidas (proibido em muitos países)'],
      explicacao:'HClO₃+NaOH→NaClO₃+H₂O · Neutralização do ácido clórico. NaClO₃ usado como herbicida total (mata qualquer planta). Cl em NOX +5. Reação análoga: HClO₄+NaOH→NaClO₄+H₂O' },
    { id:'hclo3_koh', icon:'⚗️', familia:'Neutralização',
      titulo:'HClO₃ + KOH → KClO₃ + H₂O',
      reagentes:['HClO₃','KOH'], condicao:'', coefR:{'HClO₃':1,'KOH':1}, coefP:[1,1],
      produtos_visuais:['KClO₃','H₂O'],
      candidatos:['KClO₃','H₂O','KClO₄','KCl','NaClO₃','KNO₃','K₂SO₄','KOH'],
      gabarito:{produtos:['kclo3','clorato de potassio','h2o','agua'],
        equacaoBalanceada:'HClO₃(aq) + KOH(aq) → KClO₃(aq) + H₂O(l)'},
      hints:['Ácido + base → sal + água. KClO₃ = clorato de potássio (fósforos!)','KClO₃ é o oxidante dos fósforos de segurança. Cl em +5'],
      explicacao:'HClO₃+KOH→KClO₃+H₂O · Formação do clorato de potássio — oxidante dos fósforos. Ao aquecer KClO₃ com MnO₂: 2KClO₃→2KCl+3O₂. Cl: +5→−1 (ganho 6e⁻)' },
  ],

  /* ── HClO₄ ── */
  'HClO4': [
    { id:'hclo4_naoh', icon:'⚗️', familia:'Neutralização',
      titulo:'HClO₄ + NaOH → NaClO₄ + H₂O',
      reagentes:['HClO₄','NaOH'], condicao:'', coefR:{'HClO₄':1,'NaOH':1}, coefP:[1,1],
      produtos_visuais:['NaClO₄','H₂O'],
      candidatos:['NaClO₄','H₂O','KClO₄','NaClO₃','NaCl','NaClO','Na₂SO₄','NaNO₃'],
      gabarito:{produtos:['naclo4','perclorato de sodio','h2o','agua'],
        equacaoBalanceada:'HClO₄(aq) + NaOH(aq) → NaClO₄(aq) + H₂O(l)'},
      hints:['Superácido + base forte → sal neutro. NaClO₄ = perclorato de sódio','Cl em +7 (máximo). HClO₄ é o ácido mais forte; NaClO₄ é o sal resultante'],
      explicacao:'HClO₄+NaOH→NaClO₄+H₂O · Neutralização do ácido mais forte. NaClO₄ é oxidante forte — usado em propelentes. Cl em NOX +7. Série: HOCl<HClO₂<HClO₃<HClO₄ (força crescente com mais O)' },
    { id:'hclo4_kcl_precip', icon:'🔬', familia:'Precipitação',
      titulo:'HClO₄ + KCl → KClO₄↓ + HCl',
      reagentes:['HClO₄','KCl'], condicao:'', coefR:{'HClO₄':1,'KCl':1}, coefP:[1,1],
      produtos_visuais:['KClO₄','HCl'],
      candidatos:['KClO₄','HCl','KCl','NaClO₄','K₂SO₄','KNO₃','KOH','HNO₃'],
      gabarito:{produtos:['kclo4','perclorato de potassio','hcl','acido cloridrico'],
        equacaoBalanceada:'HClO₄(aq) + KCl(aq) → KClO₄(s)↓ + HCl(aq)'},
      hints:['KClO₄ é pouco solúvel — precipita da solução. HCl permanece em solução','Teste: perclorato precipita K⁺ como KClO₄ (Kps=1,0×10⁻²)'],
      explicacao:'HClO₄+KCl→KClO₄↓+HCl · KClO₄ é insolúvel: teste qualitativo de K⁺. O ion ClO₄⁻ precipita K⁺ como KClO₄. Propelente sólido de foguetes. Cl em NOX +7' },
  ],

  /* ── K₂O ── */
  'K2O': [
    { id:'k2o_h2o', icon:'⚗️', familia:'Reação com Água',
      titulo:'K₂O + H₂O → 2 KOH',
      reagentes:['K₂O','H₂O'], condicao:'violento', coefR:{'K₂O':1,'H₂O':1}, coefP:[2],
      produtos_visuais:['KOH'],
      candidatos:['KOH','K₂CO₃','KCl','K₂SO₄','KNO₃','KHCO₃','KF','Na₂O'],
      gabarito:{produtos:['koh','hidroxido de potassio'],
        equacaoBalanceada:'K₂O(s) + H₂O(l) → 2 KOH(aq)'},
      hints:['Óxido básico + água → base forte. K₂O + H₂O → 2 KOH (potassa cáustica)','Análogo: Na₂O+H₂O→2NaOH. KOH é potassa cáustica, mais solúvel que NaOH'],
      explicacao:'K₂O+H₂O→2KOH · Potassa cáustica formada. KOH é mais solúvel que NaOH (121 g/100 mL a 20°C vs 111 g/100 mL). Usado em eletrólise alcalina de H₂ (produção de H₂ verde) e fabricação de sabão mole' },
    { id:'k2o_co2', icon:'🔬', familia:'Síntese',
      titulo:'K₂O + CO₂ → K₂CO₃',
      reagentes:['K₂O','CO₂'], condicao:'', coefR:{'K₂O':1,'CO₂':1}, coefP:[1],
      produtos_visuais:['K₂CO₃'],
      candidatos:['K₂CO₃','KHCO₃','KCl','K₂SO₄','KNO₃','K₂O','Na₂CO₃','CaCO₃'],
      gabarito:{produtos:['k2co3','carbonato de potassio'],
        equacaoBalanceada:'K₂O(s) + CO₂(g) → K₂CO₃(s)'},
      hints:['Óxido básico + óxido ácido → sal. K₂O + CO₂ → K₂CO₃ (potassa)','Potassa K₂CO₃: produção de vidro de cristal, sabão de potassa'],
      explicacao:'K₂O+CO₂→K₂CO₃ · Óxido básico + anidrido carbônico → carbonato. K₂CO₃ = potassa — componente do vidro Bohemia (cristal) e do sabão de potassa (mole). Nome "potassium" vem de "pot ash" (cinza de pote)' },
  ],

  /* ── KClO₄ ── */
  'KClO4': [
    { id:'kclo4_decomp', icon:'🌡️', familia:'Decomposição Térmica',
      titulo:'KClO₄ → KCl + 2 O₂',
      reagentes:['KClO₄'], condicao:'Δ ~610°C', coefR:{'KClO₄':1}, coefP:[1,2],
      produtos_visuais:['KCl','O₂'],
      candidatos:['KCl','O₂','KClO₃','KOH','K₂O','Cl₂','K₂SO₄','KNO₃'],
      gabarito:{produtos:['kcl','cloreto de potassio','o2','oxigenio'],
        equacaoBalanceada:'KClO₄(s) →(Δ ~610°C)→ KCl(s) + 2 O₂(g)'},
      hints:['Cl +7 → Cl -1 (ganho 8e⁻). Mais estável que KClO₃: precisa de temperatura maior','KClO₄ não explode ao bater (diferente de KClO₃). Mais seguro para manuseio'],
      explicacao:'KClO₄→KCl+2O₂ · Decomposição do perclorato. Mais segura que do KClO₃. Cl: +7→−1. Propelentes de foguete usam KClO₄+Al: 4Al+3KClO₄→2Al₂O₃+3KCl. Alta energia por mol de O₂ liberado' },
    { id:'kclo4_al_foguete', icon:'🚀', familia:'Combustão em Propelente',
      titulo:'4 Al + 3 KClO₄ → 2 Al₂O₃ + 3 KCl',
      reagentes:['Al','KClO₄'], condicao:'ignição', coefR:{'Al':4,'KClO₄':3}, coefP:[2,3],
      produtos_visuais:['Al₂O₃','KCl'],
      candidatos:['Al₂O₃','KCl','AlCl₃','K₂O','Al(OH)₃','KOH','Al₂S₃','K₂SO₄'],
      gabarito:{produtos:['al2o3','oxido de aluminio','kcl','cloreto de potassio'],
        equacaoBalanceada:'4 Al(s) + 3 KClO₄(s) →(ignição)→ 2 Al₂O₃(s) + 3 KCl(s)'},
      hints:['Al (combustível) + KClO₄ (oxidante). Al: 0→+3. Cl: +7→−1. Extremamente exotérmica','Propelente sólido do Space Shuttle SRB. Gerava 1250 t de empuxo por motor!'],
      explicacao:'4Al+3KClO₄→2Al₂O₃+3KCl · Propelente sólido de foguetes. Al é o combustível; KClO₄ o oxidante. ΔH enormemente negativo. Os SRBs do Space Shuttle usavam essa mistura (~400 t por motor). Fumaça branca = Al₂O₃ + HCl (da umidade)' },
  ],

  /* ── NH₄OH ── */
  'NH4OH': [
    { id:'nh4oh_hcl', icon:'💨', familia:'Neutralização / Fumaça Branca',
      titulo:'NH₄OH + HCl → NH₄Cl + H₂O',
      reagentes:['NH₄OH','HCl'], condicao:'', coefR:{'NH₄OH':1,'HCl':1}, coefP:[1,1],
      produtos_visuais:['NH₄Cl','H₂O'],
      candidatos:['NH₄Cl','H₂O','NaCl','NH₄NO₃','NH₄Br','NaOH','(NH₄)₂SO₄','NH₄HCO₃'],
      gabarito:{produtos:['nh4cl','cloreto de amonio','h2o','agua'],
        equacaoBalanceada:'NH₃(g) + HCl(g) → NH₄Cl(s)   [fumaça branca densa]'},
      hints:['NH₃ + HCl → NH₄Cl (fumaça branca). Gases se encontram no ar','Experimento clássico: abrir frascos de NH₃ e HCl próximos → fumaça branca densa'],
      explicacao:'NH₄OH+HCl→NH₄Cl+H₂O · NH₃ volátil reage com HCl gasoso → NH₄Cl sólido em suspensão (fumaça branca). Experimento dos "anéis de Newton": o anel de NH₄Cl forma mais perto do HCl (menor difusividade)' },
    { id:'nh4oh_fecl3', icon:'🔬', familia:'Precipitação Seletiva',
      titulo:'3 NH₄OH + FeCl₃ → Fe(OH)₃↓ + 3 NH₄Cl',
      reagentes:['NH₄OH','FeCl₃'], condicao:'', coefR:{'NH₄OH':3,'FeCl₃':1}, coefP:[1,3],
      produtos_visuais:['Fe(OH)₃','NH₄Cl'],
      candidatos:['Fe(OH)₃','NH₄Cl','Fe(OH)₂','FeCl₂','NaOH','NaCl','Fe₂O₃','(NH₄)₂SO₄'],
      gabarito:{produtos:['fe(oh)3','hidroxido de ferro','nh4cl','cloreto de amonio'],
        equacaoBalanceada:'3 NH₃(aq) + FeCl₃(aq) + 3 H₂O → Fe(OH)₃(s)↓ + 3 NH₄Cl(aq)'},
      hints:['NH₄OH (base fraca) precipita Fe(OH)₃ castanho sem dissolvê-lo','Vantagem: NH₃ não dissolve Al(OH)₃ (anfótero) — precipitação seletiva vs NaOH'],
      explicacao:'3NH₄OH+FeCl₃→Fe(OH)₃↓+3NH₄Cl · Base fraca precipita Fe(OH)₃ sem redissolver. Com NaOH forte, Al(OH)₃ anfótero dissolve-se. NH₄OH é seletivo — mantém Al(OH)₃ precipitado. Análise gravimétrica de Fe³⁺' },
    { id:'nh4oh_h2so4', icon:'⚗️', familia:'Neutralização',
      titulo:'2 NH₄OH + H₂SO₄ → (NH₄)₂SO₄ + 2 H₂O',
      reagentes:['NH₄OH','H₂SO₄'], condicao:'', coefR:{'NH₄OH':2,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['(NH₄)₂SO₄','H₂O'],
      candidatos:['(NH₄)₂SO₄','H₂O','NH₄Cl','NH₄NO₃','Na₂SO₄','(NH₄)₂CO₃','NH₄HSO₄','NaCl'],
      gabarito:{produtos:['(nh4)2so4','sulfato de amonio','h2o','agua'],
        equacaoBalanceada:'2 NH₃(aq) + H₂SO₄(aq) → (NH₄)₂SO₄(aq) + ... → (NH₄)₂SO₄'},
      hints:['H₂SO₄ dibásico precisa 2 NH₄OH. Produto: (NH₄)₂SO₄ — fertilizante','(NH₄)₂SO₄ = sulfato de amônio. Fertilizante nitrogenado importante, fornece N e S'],
      explicacao:'2NH₄OH+H₂SO₄→(NH₄)₂SO₄+2H₂O · (NH₄)₂SO₄ = sulfato de amônio, fertilizante. Produção >10 Mt/ano. Fornece N (para proteínas) e S (para enzimas) ao solo' },
  ],

  /* ── NO ── */
  'NO': [
    { id:'no_o2_no2', icon:'🌡️', familia:'Oxidação',
      titulo:'2 NO + O₂ → 2 NO₂',
      reagentes:['NO','O₂'], condicao:'', coefR:{'NO':2,'O₂':1}, coefP:[2],
      produtos_visuais:['NO₂'],
      candidatos:['NO₂','N₂O','NO','N₂O₃','N₂O₄','HNO₂','HNO₃','N₂'],
      gabarito:{produtos:['no2','dioxido de nitrogenio'],
        equacaoBalanceada:'2 NO(g) + O₂(g) → 2 NO₂(g)'},
      hints:['NO (incolor) + O₂ → NO₂ (marrom). Reação visível ao misturar NO com ar','Processo Ostwald: NO oxidado a NO₂, depois absorvido em água → HNO₃'],
      explicacao:'2NO+O₂→2NO₂ · NO incolor oxida rapidamente ao ar → NO₂ marrom-alaranjado. Esta é a "névoa fotoquímica": NO de carros + O₂ → NO₂ → absorção UV → radicais → ozônio troposférico' },
    { id:'no_h2o_hno3', icon:'🏭', familia:'Processo Ostwald',
      titulo:'3 NO₂ + H₂O → 2 HNO₃ + NO',
      reagentes:['NO','O₂','H₂O'], condicao:'→ via NO₂', coefR:{'NO':4,'O₂':3,'H₂O':2}, coefP:[4,1],
      produtos_visuais:['HNO₃','NO'],
      candidatos:['HNO₃','NO','HNO₂','N₂O','NO₂','H₂O','N₂','HCl'],
      gabarito:{produtos:['hno3','acido nitrico','no','monoxido de nitrogenio'],
        equacaoBalanceada:'4 NO(g) + 3 O₂(g) + 2 H₂O(l) → 4 HNO₃(aq)'},
      hints:['Processo Ostwald completo: NO+O₂→NO₂, depois NO₂+H₂O→HNO₃+NO','NH₃→NO (Pt,830°C)→NO₂ (ar)→HNO₃ (água). Toda a indústria de fertilizantes e explosivos'],
      explicacao:'Processo Ostwald: NH₃→NO→NO₂→HNO₃. O NO do passo 1 é reciclado. Etapa global: 4NO+3O₂+2H₂O→4HNO₃. Base da produção de fertilizantes nitrogenados e ácido nítrico industrial' },
    { id:'no_no2_agua_hn', icon:'⚗️', familia:'Reação com Água (via NO₂)',
      titulo:'4 NO + 3 O₂ + 2 H₂O → 4 HNO₃',
      reagentes:['NO','O₂','H₂O'], condicao:'', coefR:{'NO':4,'O₂':3,'H₂O':2}, coefP:[4],
      produtos_visuais:['HNO₃'],
      candidatos:['HNO₃','NO₂','HNO₂','N₂','NO','N₂O','H₂O','N₂O₅'],
      gabarito:{produtos:['hno3','acido nitrico'],
        equacaoBalanceada:'4 NO(g) + 3 O₂(g) + 2 H₂O(l) → 4 HNO₃(aq)'},
      hints:['Equação global do processo Ostwald. NO + excesso O₂ + H₂O → HNO₃','Nobel 1918 (Haber) + Ostwald. Base dos fertilizantes que alimentam metade da humanidade'],
      explicacao:'4NO+3O₂+2H₂O→4HNO₃ · Equação global do Ostwald. O NO é oxidado a NO₂ pelo O₂; NO₂ reage com H₂O→HNO₃+NO; NO reciclado. Produção mundial de HNO₃: >60 Mt/ano' },
  ],

  /* ── Na₂CrO₄ ── */
  'Na2CrO4': [
    { id:'na2cro4_agno3_mohr', icon:'🔬', familia:'Indicador / Método Mohr',
      titulo:'2 AgNO₃ + Na₂CrO₄ → Ag₂CrO₄↓ + 2 NaNO₃',
      reagentes:['Na₂CrO₄','AgNO₃'], condicao:'', coefR:{'Na₂CrO₄':1,'AgNO₃':2}, coefP:[1,2],
      produtos_visuais:['Ag₂CrO₄','NaNO₃'],
      candidatos:['Ag₂CrO₄','NaNO₃','AgCl','AgNO₃','Na₂SO₄','NaCl','AgBr','Ag₂SO₄'],
      gabarito:{produtos:['ag2cro4','cromato de prata','nano3','nitrato de sodio'],
        equacaoBalanceada:'2 AgNO₃(aq) + Na₂CrO₄(aq) → Ag₂CrO₄(s)↓ + 2 NaNO₃(aq)'},
      hints:['Ag₂CrO₄ precipita vermelho-tijolo. Usado no método Mohr para detectar ponto final','Mohr: adiciona AgNO₃ a solução de Cl⁻ com indicador Na₂CrO₄. Quando todo Cl⁻ precipita como AgCl, o próximo Ag⁺ forma Ag₂CrO₄ vermelho'],
      explicacao:'2AgNO₃+Na₂CrO₄→Ag₂CrO₄↓+2NaNO₃ · Ag₂CrO₄ vermelho-tijolo. Método Mohr de titulação: AgNO₃ + Cl⁻ → AgCl↓ branco; quando todo Cl⁻ é consumido → Ag⁺ livre + CrO₄²⁻ → Ag₂CrO₄ vermelho = ponto final' },
    { id:'na2cro4_h2so4_dicrom', icon:'🔬', familia:'Equilíbrio Cromato/Dicromato',
      titulo:'2 Na₂CrO₄ + H₂SO₄ → Na₂Cr₂O₇ + Na₂SO₄ + H₂O',
      reagentes:['Na₂CrO₄','H₂SO₄'], condicao:'acidificação', coefR:{'Na₂CrO₄':2,'H₂SO₄':1}, coefP:[1,1,1],
      produtos_visuais:['Na₂Cr₂O₇','Na₂SO₄','H₂O'],
      candidatos:['Na₂Cr₂O₇','Na₂SO₄','H₂O','K₂Cr₂O₇','CrCl₃','Na₂CrO₄','NaCl','Cr₂O₃'],
      gabarito:{produtos:['na2cr2o7','dicromato de sodio','na2so4','sulfato de sodio','h2o','agua'],
        equacaoBalanceada:'2 Na₂CrO₄(aq) + H₂SO₄(aq) → Na₂Cr₂O₇(aq) + Na₂SO₄(aq) + H₂O(l)'},
      hints:['CrO₄²⁻ (amarelo) + ácido → Cr₂O₇²⁻ (laranja). Equilíbrio pH-dependente','Solução muda de amarelo para laranja ao adicionar ácido. Base reverte para amarelo'],
      explicacao:'2Na₂CrO₄+H₂SO₄→Na₂Cr₂O₇+Na₂SO₄+H₂O · Conversão cromato→dicromato. pH < 6 → laranja (Cr₂O₇²⁻); pH > 8 → amarelo (CrO₄²⁻). Mudança de cor visual impressionante ao adicionar ácido ou base' },
  ],

  /* ── Na₂O ── */
  'Na2O': [
    { id:'na2o_h2o', icon:'⚗️', familia:'Reação com Água',
      titulo:'Na₂O + H₂O → 2 NaOH',
      reagentes:['Na₂O','H₂O'], condicao:'violento', coefR:{'Na₂O':1,'H₂O':1}, coefP:[2],
      produtos_visuais:['NaOH'],
      candidatos:['NaOH','Na₂CO₃','NaCl','Na₂SO₄','NaNO₃','NaHCO₃','NaF','KOH'],
      gabarito:{produtos:['naoh','hidroxido de sodio'],
        equacaoBalanceada:'Na₂O(s) + H₂O(l) → 2 NaOH(aq)'},
      hints:['Óxido básico + água → base forte. Na₂O + H₂O → 2 NaOH (soda cáustica)','Reação violenta e exotérmica. NaOH é a base industrial mais importante'],
      explicacao:'Na₂O+H₂O→2NaOH · Anidrido sódico reage violentamente com H₂O → NaOH (soda cáustica). Mesma lógica de todos óxidos básicos com água. NaOH: base industrial #1 (produção de papel, alumínio, sabão, plásticos)' },
    { id:'na2o_co2', icon:'🔬', familia:'Síntese',
      titulo:'Na₂O + CO₂ → Na₂CO₃',
      reagentes:['Na₂O','CO₂'], condicao:'', coefR:{'Na₂O':1,'CO₂':1}, coefP:[1],
      produtos_visuais:['Na₂CO₃'],
      candidatos:['Na₂CO₃','NaHCO₃','NaCl','NaOH','Na₂SO₄','NaNO₃','Na₂O','CO₂'],
      gabarito:{produtos:['na2co3','carbonato de sodio'],
        equacaoBalanceada:'Na₂O(s) + CO₂(g) → Na₂CO₃(s)'},
      hints:['Óxido básico + óxido ácido → sal. Na₂O + CO₂ → Na₂CO₃ (barrilha)','Na₂CO₃ = barrilha: fabricação de vidro, sabão, papel e refinação de metais'],
      explicacao:'Na₂O+CO₂→Na₂CO₃ · Óxido básico + anidrido carbônico → carbonato. Na₂CO₃ (barrilha) é matéria-prima do vidro: Na₂CO₃+SiO₂+CaO → vidro. Produção mundial via processo Solvay: ~50 Mt/ano' },
    { id:'na2o_hcl', icon:'⚗️', familia:'Reação com Ácido',
      titulo:'Na₂O + 2 HCl → 2 NaCl + H₂O',
      reagentes:['Na₂O','HCl'], condicao:'', coefR:{'Na₂O':1,'HCl':2}, coefP:[2,1],
      produtos_visuais:['NaCl','H₂O'],
      candidatos:['NaCl','H₂O','Na₂SO₄','NaNO₃','NaF','NaBr','NaHCO₃','KCl'],
      gabarito:{produtos:['nacl','cloreto de sodio','h2o','agua'],
        equacaoBalanceada:'Na₂O(s) + 2 HCl(aq) → 2 NaCl(aq) + H₂O(l)'},
      hints:['Óxido básico + ácido → sal + água. Na₂O + 2HCl → 2NaCl + H₂O','Na₂O tem 2 Na⁺ por fórmula → precisa de 2 HCl'],
      explicacao:'Na₂O+2HCl→2NaCl+H₂O · Regra geral: óxido básico+ácido→sal+água. 2 HCl necessários para os 2 Na⁺. NaCl = sal de cozinha. Reação análoga: CaO+2HCl→CaCl₂+H₂O' },
  ],

  /* ── Na₂O₂ ── */
  'Na2O2': [
    { id:'na2o2_h2o_o2', icon:'🚀', familia:'Reação com Água / Gerador O₂',
      titulo:'2 Na₂O₂ + 2 H₂O → 4 NaOH + O₂',
      reagentes:['Na₂O₂','H₂O'], condicao:'', coefR:{'Na₂O₂':2,'H₂O':2}, coefP:[4,1],
      produtos_visuais:['NaOH','O₂'],
      candidatos:['NaOH','O₂','Na₂O','H₂O₂','NaCl','Na₂CO₃','KOH','H₂O'],
      gabarito:{produtos:['naoh','hidroxido de sodio','o2','oxigenio'],
        equacaoBalanceada:'2 Na₂O₂(s) + 2 H₂O(l) → 4 NaOH(aq) + O₂(g)'},
      hints:['Peróxido + água → base forte + O₂. O₂²⁻: 1 O oxidado (→O₂) + 1 reduzido (→OH⁻)','Submarinos usam Na₂O₂: absorve H₂O e CO₂ expirados, libera O₂'],
      explicacao:'2Na₂O₂+2H₂O→4NaOH+O₂ · Geração de O₂ em submarinos. O₂²⁻ (peroxídico) se desproporcionam: parte→O₂ (oxidação), parte→OH⁻ (redução). Um cartucho de Na₂O₂ sustenta um homem por horas' },
    { id:'na2o2_co2_subm', icon:'🚀', familia:'Absorção de CO₂ (Submarino)',
      titulo:'2 Na₂O₂ + 2 CO₂ → 2 Na₂CO₃ + O₂',
      reagentes:['Na₂O₂','CO₂'], condicao:'', coefR:{'Na₂O₂':2,'CO₂':2}, coefP:[2,1],
      produtos_visuais:['Na₂CO₃','O₂'],
      candidatos:['Na₂CO₃','O₂','NaHCO₃','Na₂O','NaOH','CO₂','Na₂CO₃','KOH'],
      gabarito:{produtos:['na2co3','carbonato de sodio','o2','oxigenio'],
        equacaoBalanceada:'2 Na₂O₂(s) + 2 CO₂(g) → 2 Na₂CO₃(s) + O₂(g)'},
      hints:['Na₂O₂ absorve CO₂ E libera O₂ simultaneamente! Ideal para espaços fechados','2Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂. Tripulante expira CO₂ → Na₂O₂ absorve → O₂ liberado'],
      explicacao:'2Na₂O₂+2CO₂→2Na₂CO₃+O₂ · Reação dupla: absorve CO₂ tóxico E produz O₂ necessário. Cartuchos de Na₂O₂ usados em trajes espaciais, submarinos e minas. Única substância que realiza as duas funções simultâneas' },
  ],

  /* ── Na₂S ── */
  'Na2S': [
    { id:'na2s_hcl_h2s', icon:'🔬', familia:'Geração de H₂S',
      titulo:'Na₂S + 2 HCl → 2 NaCl + H₂S↑',
      reagentes:['Na₂S','HCl'], condicao:'', coefR:{'Na₂S':1,'HCl':2}, coefP:[2,1],
      produtos_visuais:['NaCl','H₂S'],
      candidatos:['NaCl','H₂S','Na₂SO₄','NaHS','NaOH','Na₂SO₃','H₂SO₄','H₂O'],
      gabarito:{produtos:['nacl','cloreto de sodio','h2s','acido sulfidrico'],
        equacaoBalanceada:'Na₂S(aq) + 2 HCl(aq) → 2 NaCl(aq) + H₂S(g)'},
      hints:['S²⁻ + 2H⁺ → H₂S↑ (cheiro ovo podre). Ácido forte desloca ácido fraco (H₂S)','H₂S mais tóxico que HCN! Efervescência gasosa com odor característico'],
      explicacao:'Na₂S+2HCl→2NaCl+H₂S · HCl (forte) desloca H₂S (fraco). H₂S produzido é tóxico (≡HCN em toxicidade). Usado em análise qualitativa: H₂S precipita metais pesados como sulfetos (PbS negro, CuS negro, ZnS branco)' },
    { id:'na2s_pb_precip', icon:'🔬', familia:'Precipitação de Metal Pesado',
      titulo:'Na₂S + Pb(NO₃)₂ → PbS↓ + 2 NaNO₃',
      reagentes:['Na₂S','Pb(NO₃)₂'], condicao:'', coefR:{'Na₂S':1,'Pb(NO₃)₂':1}, coefP:[1,2],
      produtos_visuais:['PbS','NaNO₃'],
      candidatos:['PbS','NaNO₃','PbSO₄','PbCl₂','Na₂SO₄','NaCl','PbO','NaOH'],
      gabarito:{produtos:['pbs','sulfeto de chumbo','nano3','nitrato de sodio'],
        equacaoBalanceada:'Na₂S(aq) + Pb(NO₃)₂(aq) → PbS(s)↓ + 2 NaNO₃(aq)'},
      hints:['S²⁻ + Pb²⁺ → PbS↓ negro (Kps=8×10⁻²⁸, extremamente insolúvel)','PbS negro: teste de Pb²⁺. Origem da "galena" (PbS), minério histórico de Pb'],
      explicacao:'Na₂S+Pb(NO₃)₂→PbS↓+2NaNO₃ · PbS (galena) precipita negro intenso. Kps=8×10⁻²⁸: um dos sais menos solúveis. Na₂S precipita metais pesados (Pb, Cu, Hg, Cd) — tratamento de efluentes industriais. Base do minerio de Pb (galena)' },
    { id:'na2s_cl2_oxidacao', icon:'⚡', familia:'Oxirredução',
      titulo:'Na₂S + Cl₂ → 2 NaCl + S',
      reagentes:['Na₂S','Cl₂'], condicao:'', coefR:{'Na₂S':1,'Cl₂':1}, coefP:[2,1],
      produtos_visuais:['NaCl','S'],
      candidatos:['NaCl','S','Na₂SO₄','Na₂SO₃','NaClO','NaSCN','Na₂S₂O₃','HCl'],
      gabarito:{produtos:['nacl','cloreto de sodio','s','enxofre'],
        equacaoBalanceada:'Na₂S(aq) + Cl₂(g) → 2 NaCl(aq) + S(s)'},
      hints:['Cl₂ (oxidante) oxida S²⁻ a S⁰. S: −2→0. Cl: 0→−1','Precipitado amarelo de enxofre coloidal. Cl₂ mais eletronegativo desloca S²⁻'],
      explicacao:'Na₂S+Cl₂→2NaCl+S · Cl₂ oxida S²⁻ a S⁰ (enxofre elementar). S: −2→0 (perde 2e⁻). Cl: 0→−1 (ganha e⁻). Precipitado amarelo de S coloidal. Cl₂ tem maior eletroafinidade que S' },
  ],

  /* ── Na₃PO₄ ── */
  'Na3PO4': [
    { id:'na3po4_hcl', icon:'⚗️', familia:'Neutralização',
      titulo:'Na₃PO₄ + 3 HCl → 3 NaCl + H₃PO₄',
      reagentes:['Na₃PO₄','HCl'], condicao:'', coefR:{'Na₃PO₄':1,'HCl':3}, coefP:[3,1],
      produtos_visuais:['NaCl','H₃PO₄'],
      candidatos:['NaCl','H₃PO₄','NaH₂PO₄','Na₂HPO₄','Na₂SO₄','NaNO₃','NaOH','HCl'],
      gabarito:{produtos:['nacl','cloreto de sodio','h3po4','acido fosforico'],
        equacaoBalanceada:'Na₃PO₄(aq) + 3 HCl(aq) → 3 NaCl(aq) + H₃PO₄(aq)'},
      hints:['Sal de triácido + ácido forte → ácido fraco liberado. 3 HCl para 3 Na⁺','PO₄³⁻ + 3H⁺ → H₃PO₄. Ácido fosfórico liberado é fraco e fica em solução'],
      explicacao:'Na₃PO₄+3HCl→3NaCl+H₃PO₄ · HCl (forte) desloca H₃PO₄ (fraco) do fosfato. 3 HCl para 3 Na⁺. PO₄³⁻+3H⁺→H₃PO₄. Hidrólise básica do Na₃PO₄: PO₄³⁻+H₂O⇌HPO₄²⁻+OH⁻ (pH 12)' },
    { id:'na3po4_cacl2', icon:'🔬', familia:'Precipitação',
      titulo:'2 Na₃PO₄ + 3 CaCl₂ → Ca₃(PO₄)₂↓ + 6 NaCl',
      reagentes:['Na₃PO₄','CaCl₂'], condicao:'', coefR:{'Na₃PO₄':2,'CaCl₂':3}, coefP:[1,6],
      produtos_visuais:['Ca₃(PO₄)₂','NaCl'],
      candidatos:['Ca₃(PO₄)₂','NaCl','CaSO₄','CaCO₃','CaHPO₄','NaOH','Na₂SO₄','CaF₂'],
      gabarito:{produtos:['ca3(po4)2','fosfato de calcio','nacl','cloreto de sodio'],
        equacaoBalanceada:'2 Na₃PO₄(aq) + 3 CaCl₂(aq) → Ca₃(PO₄)₂(s)↓ + 6 NaCl(aq)'},
      hints:['3 Ca²⁺ + 2 PO₄³⁻ → Ca₃(PO₄)₂↓ (Kps=1,2×10⁻²⁹, muito insolúvel)','Ca₃(PO₄)₂ = fosfato de cálcio: componente dos ossos e hidroxiapatita dentária'],
      explicacao:'2Na₃PO₄+3CaCl₂→Ca₃(PO₄)₂↓+6NaCl · Precipitação de fosfato de cálcio. Ca₃(PO₄)₂ é o mineral dos ossos e dentes (hidroxiapatita). Eutrofização: excesso de PO₄³⁻ + Ca²⁺ → Ca₃(PO₄)₂ no sedimento de rios' },
    { id:'na3po4_h2so4_acid', icon:'⚗️', familia:'Neutralização Parcial',
      titulo:'Na₃PO₄ + H₂SO₄ → NaH₂PO₄ + Na₂SO₄',
      reagentes:['Na₃PO₄','H₂SO₄'], condicao:'', coefR:{'Na₃PO₄':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['NaH₂PO₄','Na₂SO₄'],
      candidatos:['NaH₂PO₄','Na₂SO₄','Na₂HPO₄','NaCl','H₃PO₄','NaHSO₄','Na₃PO₄','NaOH'],
      gabarito:{produtos:['nah2po4','fosfato monobasico de sodio','na2so4','sulfato de sodio'],
        equacaoBalanceada:'Na₃PO₄(aq) + H₂SO₄(aq) → NaH₂PO₄(aq) + Na₂SO₄(aq)'},
      hints:['H₂SO₄ (dibásico, 2H⁺) + Na₃PO₄ → neutralização parcial. PO₄³⁻+2H⁺→H₂PO₄⁻','Produto: NaH₂PO₄ = fosfato monossódico — tampão ácido (pH 4-7)'],
      explicacao:'Na₃PO₄+H₂SO₄→NaH₂PO₄+Na₂SO₄ · Neutralização parcial. H₂SO₄ fornece 2H⁺ ao PO₄³⁻ → H₂PO₄⁻. NaH₂PO₄ = tampão ácido usado em alimentos (E339), soro fisiológico e cromatografia' },
  ],

  /* ── Pb(OH)₂ ── */
  'Pb(OH)2': [
    { id:'pboh2_hno3', icon:'⚗️', familia:'Dissolução em Ácido',
      titulo:'Pb(OH)₂ + 2 HNO₃ → Pb(NO₃)₂ + 2 H₂O',
      reagentes:['Pb(OH)₂','HNO₃'], condicao:'', coefR:{'Pb(OH)₂':1,'HNO₃':2}, coefP:[1,2],
      produtos_visuais:['Pb(NO₃)₂','H₂O'],
      candidatos:['Pb(NO₃)₂','H₂O','PbCl₂','PbSO₄','PbO','Pb','NaNO₃','Pb(NO₂)₂'],
      gabarito:{produtos:['pb(no3)2','nitrato de chumbo','h2o','agua'],
        equacaoBalanceada:'Pb(OH)₂(s) + 2 HNO₃(aq) → Pb(NO₃)₂(aq) + 2 H₂O(l)'},
      hints:['Base insolúvel + ácido → sal + água. Pb(OH)₂ dissolve em HNO₃','Pb(NO₃)₂ é um dos poucos sais de chumbo solúveis — fonte de Pb²⁺ em soluções'],
      explicacao:'Pb(OH)₂+2HNO₃→Pb(NO₃)₂+2H₂O · Dissolução de base anfótera em ácido. Pb(NO₃)₂ solúvel → fonte de Pb²⁺ para precipitações (PbI₂ chuva dourada, PbSO₄ branco, PbCrO₄ amarelo)' },
    { id:'pboh2_naoh_plumbato', icon:'🔬', familia:'Reação Anfótera com Base',
      titulo:'Pb(OH)₂ + 2 NaOH → Na₂PbO₂ + 2 H₂O',
      reagentes:['Pb(OH)₂','NaOH'], condicao:'concentrado', coefR:{'Pb(OH)₂':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Na₂PbO₂','H₂O'],
      candidatos:['Na₂PbO₂','H₂O','NaCl','PbSO₄','Na₂SO₄','NaOH','PbO','NaNO₃'],
      gabarito:{produtos:['na2pbo2','plumbato de sodio','h2o','agua'],
        equacaoBalanceada:'Pb(OH)₂(s) + 2 NaOH(conc.) → Na₂PbO₂(aq) + 2 H₂O(l)'},
      hints:['Pb(OH)₂ anfótero dissolve em NaOH forte → plumbato de sódio (Na₂PbO₂)','Pb² em base forte: Pb(OH)₂ + 2OH⁻ → [Pb(OH)₄]²⁻ → PbO₂²⁻ + 2H₂O'],
      explicacao:'Pb(OH)₂+2NaOH→Na₂PbO₂+2H₂O · Comportamento ácido do Pb(OH)₂ anfótero. Dissolve em base forte formando plumbato. Análogo ao Al(OH)₃+NaOH→NaAlO₂. Pb anfótero como Al e Zn' },
  ],

  /* ── PbBr₂ ── */
  'PbBr2': [
    { id:'pbbr2_form', icon:'🔬', familia:'Precipitação',
      titulo:'Pb(NO₃)₂ + 2 KBr → PbBr₂↓ + 2 KNO₃',
      reagentes:['Pb(NO₃)₂','KBr'], condicao:'', coefR:{'Pb(NO₃)₂':1,'KBr':2}, coefP:[1,2],
      produtos_visuais:['PbBr₂','KNO₃'],
      candidatos:['PbBr₂','KNO₃','PbI₂','PbCl₂','KCl','KOH','PbO','NaNO₃'],
      gabarito:{produtos:['pbbr2','brometo de chumbo','kno3','nitrato de potassio'],
        equacaoBalanceada:'Pb(NO₃)₂(aq) + 2 KBr(aq) → PbBr₂(s)↓ + 2 KNO₃(aq)'},
      hints:['Pb²⁺+2Br⁻→PbBr₂↓ branco-amarelado. Menos vistoso que PbI₂ amarelo','Série: AgCl (branco) < AgBr (amarelo pálido) < AgI (amarelo) em insolubilidade'],
      explicacao:'Pb(NO₃)₂+2KBr→PbBr₂↓+2KNO₃ · Precipitação de brometo. PbBr₂ menos amarelo que PbI₂. Teste de Br⁻: AgNO₃+Br⁻→AgBr↓ (amarelo pálido). Perovskita MAPbBr₃ = LED verde de próxima geração' },
    { id:'pbbr2_agno3', icon:'🔬', familia:'Teste de Br⁻',
      titulo:'PbBr₂ + 2 AgNO₃ → 2 AgBr↓ + Pb(NO₃)₂',
      reagentes:['PbBr₂','AgNO₃'], condicao:'dissolução prévia', coefR:{'PbBr₂':1,'AgNO₃':2}, coefP:[2,1],
      produtos_visuais:['AgBr','Pb(NO₃)₂'],
      candidatos:['AgBr','Pb(NO₃)₂','AgCl','AgI','NaNO₃','KNO₃','AgF','PbCl₂'],
      gabarito:{produtos:['agbr','brometo de prata','pb(no3)2','nitrato de chumbo'],
        equacaoBalanceada:'PbBr₂(aq) + 2 AgNO₃(aq) → 2 AgBr(s)↓ + Pb(NO₃)₂(aq)'},
      hints:['AgBr↓ amarelo pálido. Kps(AgBr)=5,4×10⁻¹³ < Kps(PbBr₂)=4×10⁻⁵','Ag⁺ precipita Br⁻ mais eficientemente que Pb²⁺. AgBr no filme fotográfico'],
      explicacao:'PbBr₂+2AgNO₃→2AgBr↓+Pb(NO₃)₂ · AgBr (amarelo pálido) mais insolúvel que PbBr₂. Teste de halogênio: AgNO₃+Cl⁻→branco; +Br⁻→amarelo pálido; +I⁻→amarelo intenso. AgBr fotossensível' },
  ],

  /* ── RbOH ── */
  'RbOH': [
    { id:'rboh_hcl', icon:'⚗️', familia:'Neutralização',
      titulo:'RbOH + HCl → RbCl + H₂O',
      reagentes:['RbOH','HCl'], condicao:'', coefR:{'RbOH':1,'HCl':1}, coefP:[1,1],
      produtos_visuais:['RbCl','H₂O'],
      candidatos:['RbCl','H₂O','RbNO₃','Rb₂SO₄','RbBr','NaCl','KCl','RbOH'],
      gabarito:{produtos:['rbcl','cloreto de rubidio','h2o','agua'],
        equacaoBalanceada:'RbOH(aq) + HCl(aq) → RbCl(aq) + H₂O(l)'},
      hints:['Base forte + ácido forte → sal neutro + água. RbOH + HCl → RbCl + H₂O','RbCl usado em espectroscopia atômica (linha vermelha intensa a 780 nm)'],
      explicacao:'RbOH+HCl→RbCl+H₂O · Neutralização simples. Rb foi descoberto por Bunsen e Kirchhoff em 1861 pelo espectroscópio (linhas vermelhas características). RbCl emite vermelho intenso na chama' },
    { id:'rboh_co2', icon:'🔬', familia:'Absorção de CO₂',
      titulo:'2 RbOH + CO₂ → Rb₂CO₃ + H₂O',
      reagentes:['RbOH','CO₂'], condicao:'', coefR:{'RbOH':2,'CO₂':1}, coefP:[1,1],
      produtos_visuais:['Rb₂CO₃','H₂O'],
      candidatos:['Rb₂CO₃','H₂O','RbHCO₃','RbCl','RbNO₃','K₂CO₃','Na₂CO₃','Rb₂O'],
      gabarito:{produtos:['rb2co3','carbonato de rubidio','h2o','agua'],
        equacaoBalanceada:'2 RbOH(aq) + CO₂(g) → Rb₂CO₃(aq) + H₂O(l)'},
      hints:['Base + óxido ácido → sal + água. Mesma reação do NaOH e KOH com CO₂','Rb₂CO₃ é muito higroscópico e muito solúvel — típico de alcalinos pesados'],
      explicacao:'2RbOH+CO₂→Rb₂CO₃+H₂O · Idêntica ao 2NaOH+CO₂→Na₂CO₃+H₂O e 2KOH+CO₂→K₂CO₃+H₂O. Confirma padrão dos alcalinos: todos reagem com CO₂ → carbonato. Rb₂CO₃ raro e caro, usado em vidros ópticos especiais' },
  ],

  /* ── Sn(OH)₄ ── */
  'Sn(OH)4': [
    { id:'snoh4_hcl', icon:'⚗️', familia:'Dissolução em Ácido',
      titulo:'Sn(OH)₄ + 4 HCl → SnCl₄ + 4 H₂O',
      reagentes:['Sn(OH)₄','HCl'], condicao:'', coefR:{'Sn(OH)₄':1,'HCl':4}, coefP:[1,4],
      produtos_visuais:['SnCl₄','H₂O'],
      candidatos:['SnCl₄','H₂O','SnCl₂','SnO₂','Sn(OH)₂','NaCl','SnSO₄','HCl'],
      gabarito:{produtos:['sncl4','tetracloreto de estanho','h2o','agua'],
        equacaoBalanceada:'Sn(OH)₄(s) + 4 HCl(aq) → SnCl₄(aq) + 4 H₂O(l)'},
      hints:['Base insolúvel + ácido → sal + água. 4 HCl para 4 OH⁻. Sn em +4','SnCl₄ é o precursor do SnO₂ (vidro condutor ITO — telas de toque)'],
      explicacao:'Sn(OH)₄+4HCl→SnCl₄+4H₂O · Comportamento básico do Sn(OH)₄ anfótero. SnCl₄ é precursor do ITO (Indium Tin Oxide = SnO₂+In₂O₃) — material de telas touchscreen e painéis solares' },
    { id:'snoh4_naoh_estanato', icon:'🔬', familia:'Reação Anfótera com Base',
      titulo:'Sn(OH)₄ + 2 NaOH → Na₂[Sn(OH)₆]',
      reagentes:['Sn(OH)₄','NaOH'], condicao:'concentrado', coefR:{'Sn(OH)₄':1,'NaOH':2}, coefP:[1],
      produtos_visuais:['Na₂SnO₃','H₂O'],
      candidatos:['Na₂SnO₃','H₂O','NaCl','SnCl₄','Na₂SO₄','NaOH','SnO₂','Na₂PbO₂'],
      gabarito:{produtos:['na2sno3','estanato de sodio','h2o','agua'],
        equacaoBalanceada:'Sn(OH)₄(s) + 2 NaOH(conc.) → Na₂[Sn(OH)₆](aq)'},
      hints:['Sn(OH)₄ anfótero dissolve em NaOH → complexo hexahidroxoestanato','Análogo: Al(OH)₃+NaOH→NaAlO₂. Zn(OH)₂+2NaOH→Na₂ZnO₂. Sn(OH)₄+2NaOH→Na₂SnO₃'],
      explicacao:'Sn(OH)₄+2NaOH→Na₂SnO₃ · Comportamento ácido do Sn(OH)₄ anfótero. Dissolve em NaOH forte → estanato. Série anfótera: Be(OH)₂, Al(OH)₃, Zn(OH)₂, Sn(OH)₄, Pb(OH)₂ — todos dissolvem em NaOH concentrado' },
    { id:'snoh4_decomp', icon:'🌡️', familia:'Decomposição Térmica',
      titulo:'Sn(OH)₄ → SnO₂ + 2 H₂O',
      reagentes:['Sn(OH)₄'], condicao:'Δ', coefR:{'Sn(OH)₄':1}, coefP:[1,2],
      produtos_visuais:['SnO₂','H₂O'],
      candidatos:['SnO₂','H₂O','SnO','Sn','SnCl₂','SnCl₄','Sn(OH)₂','SnSO₄'],
      gabarito:{produtos:['sno2','dioxido de estanho','h2o','agua'],
        equacaoBalanceada:'Sn(OH)₄(s) →(Δ)→ SnO₂(s) + 2 H₂O(g)'},
      hints:['Base insolúvel → óxido + água ao aquecer. Regra geral: Me(OH)n→MeO+H₂O','SnO₂ = cassiterita (principal minério de estanho) e material de telas ITO'],
      explicacao:'Sn(OH)₄→SnO₂+2H₂O · Regra geral: base insolúvel aquecida → óxido. Análogo: Cu(OH)₂→CuO+H₂O; Fe(OH)₃→½Fe₂O₃+H₂O. SnO₂ = cassiterita (mineral natural de Sn) e precursor do ITO' },
  ],

  /* ── TiO₂ ── */
  'TiO2': [
    { id:'tio2_h2so4', icon:'🔬', familia:'Dissolução em Ácido Concentrado',
      titulo:'TiO₂ + H₂SO₄(conc.) → TiOSO₄ + H₂O',
      reagentes:['TiO₂','H₂SO₄'], condicao:'conc., Δ', coefR:{'TiO₂':1,'H₂SO₄':1}, coefP:[1,1],
      produtos_visuais:['TiOSO₄','H₂O'],
      candidatos:['TiOSO₄','H₂O','TiCl₄','TiO₂','TiSO₄','Al₂(SO₄)₃','FeSO₄','ZrO₂'],
      gabarito:{produtos:['tioso4','sulfato de titanil','h2o','agua'],
        equacaoBalanceada:'TiO₂(s) + H₂SO₄(conc.) →(Δ)→ TiOSO₄(aq) + H₂O(l)'},
      hints:['TiO₂ dissolve em H₂SO₄ concentrado e quente. TiOSO₄ = sulfato de titanil','Processo de produção de TiO₂ puro: minério+H₂SO₄→TiOSO₄→hidrólise→TiO₂ puro'],
      explicacao:'TiO₂+H₂SO₄→TiOSO₄+H₂O · Produção industrial de TiO₂ pigmento (processo de sulfato). Minério de titânio + H₂SO₄ conc. → TiOSO₄ → hidrólise → TiO₂ precipitado → calcinação → pigmento branco puro' },
    { id:'tio2_fotocatalise', icon:'☀️', familia:'Fotocatálise',
      titulo:'TiO₂ + luz UV → 2 •OH (radical hidroxil)',
      reagentes:['TiO₂','H₂O'], condicao:'luz UV (λ < 380 nm)', coefR:{'TiO₂':1,'H₂O':2}, coefP:[1,1],
      produtos_visuais:['H₂O₂','O₂'],
      candidatos:['H₂O₂','O₂','OH⁻','H₂O','CO₂','TiO₂','HCl','H₂'],
      gabarito:{produtos:['h2o2','peroxido de hidrogenio','o2','oxigenio'],
        equacaoBalanceada:'TiO₂ →(UV)→ e⁻(CB) + h⁺(VB); h⁺ + H₂O → •OH + H⁺; •OH destrói poluentes'},
      hints:['Luz UV excita TiO₂: e⁻ para banda de condução + h⁺ na banda de valência','h⁺ + H₂O → •OH radical. •OH é o oxidante mais forte — destrói qualquer orgânico'],
      explicacao:'TiO₂+hν→e⁻+h⁺; h⁺+H₂O→•OH · Fotocatálise: luz UV excita TiO₂ (bandgap 3,2 eV). •OH gerado decompõe poluentes orgânicos (NOx, VOC, bactérias). Vidros autolimpantes, purificadores de ar, hospitais: revestimento de TiO₂' },
    { id:'tio2_hf', icon:'⚠️', familia:'Dissolução em HF',
      titulo:'TiO₂ + 4 HF → TiF₄ + 2 H₂O',
      reagentes:['TiO₂','HF'], condicao:'', coefR:{'TiO₂':1,'HF':4}, coefP:[1,2],
      produtos_visuais:['TiF₄','H₂O'],
      candidatos:['TiF₄','H₂O','TiCl₄','TiO₂','SiF₄','TiOSO₄','HCl','NaF'],
      gabarito:{produtos:['tif4','tetrafluoreto de titanio','h2o','agua'],
        equacaoBalanceada:'TiO₂(s) + 4 HF(aq) → TiF₄(aq) + 2 H₂O(l)'},
      hints:['TiO₂ dissolve em HF (como SiO₂). F⁻ forma ligações muito fortes com Ti⁴⁺','TiF₄ usado em tratamento dentário — fluoretação de superfícies de esmalte'],
      explicacao:'TiO₂+4HF→TiF₄+2H₂O · HF dissolve TiO₂ (como dissolve SiO₂ do vidro). Ti⁴⁺ forma fluoretos estáveis. TiF₄ aplicado em esmalte dental como alternativa ao NaF — forma TiO₂ na superfície do dente após reação' },
  ],

  /* ── ZnCl₂ ── */
  'ZnCl2': [
    { id:'zncl2_naoh', icon:'🔬', familia:'Precipitação / Anfótero',
      titulo:'ZnCl₂ + 2 NaOH → Zn(OH)₂↓ + 2 NaCl',
      reagentes:['ZnCl₂','NaOH'], condicao:'', coefR:{'ZnCl₂':1,'NaOH':2}, coefP:[1,2],
      produtos_visuais:['Zn(OH)₂','NaCl'],
      candidatos:['Zn(OH)₂','NaCl','ZnO','Na₂ZnO₂','NaOH','ZnSO₄','MgCl₂','ZnCO₃'],
      gabarito:{produtos:['zn(oh)2','hidroxido de zinco','nacl','cloreto de sodio'],
        equacaoBalanceada:'ZnCl₂(aq) + 2 NaOH(aq) → Zn(OH)₂(s)↓ + 2 NaCl(aq)'},
      hints:['Zn²⁺+2OH⁻→Zn(OH)₂↓ branco gelatinoso. Com excesso NaOH dissolve (anfótero)','Zn(OH)₂+2NaOH→Na₂ZnO₂+2H₂O (excesso). Anfótero como Al(OH)₃'],
      explicacao:'ZnCl₂+2NaOH→Zn(OH)₂↓+2NaCl · Precipitado branco gelatinoso. Com excesso de NaOH o Zn(OH)₂ dissolve-se formando zincato: Na₂ZnO₂. Anfoteria do Zn: dissolve em ácido E em base forte' },
    { id:'zncl2_h2o_hidrolise', icon:'🔬', familia:'Hidrólise',
      titulo:'ZnCl₂ + 2 H₂O ⇌ Zn(OH)₂ + 2 HCl',
      reagentes:['ZnCl₂','H₂O'], condicao:'(parcial)', coefR:{'ZnCl₂':1,'H₂O':2}, coefP:[1,2],
      produtos_visuais:['Zn(OH)₂','HCl'],
      candidatos:['Zn(OH)₂','HCl','ZnO','ZnSO₄','NaCl','MgCl₂','CaCl₂','ZnCO₃'],
      gabarito:{produtos:['zn(oh)2','hidroxido de zinco','hcl','acido cloridrico'],
        equacaoBalanceada:'ZnCl₂(aq) + 2 H₂O(l) ⇌ Zn(OH)Cl(s) + HCl(aq)   [hidrólise parcial]'},
      hints:['Zn²⁺ hidrolisa: Zn²⁺+H₂O⇌ZnOH⁺+H⁺. Por isso solução de ZnCl₂ tem pH 4-6','ZnCl₂ concentrado pode dissolver celulose! Ácido de Lewis muito forte'],
      explicacao:'ZnCl₂+H₂O→Zn(OH)Cl+HCl · Hidrólise parcial do ZnCl₂ — Zn²⁺ é ácido de Lewis forte que polariza a água, liberando H⁺. Por isso soluções de ZnCl₂ são ácidas (pH 4-6). Concentrado dissolve celulose (base dos solventes de celulose históricos)' },
    { id:'zncl2_zn', icon:'⚗️', familia:'Síntese Direta',
      titulo:'Zn + 2 HCl → ZnCl₂ + H₂',
      reagentes:['Zn','HCl'], condicao:'', coefR:{'Zn':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['ZnCl₂','H₂'],
      candidatos:['ZnCl₂','H₂','ZnO','ZnSO₄','Zn(OH)₂','NaCl','ZnCO₃','FeCl₂'],
      gabarito:{produtos:['zncl2','cloreto de zinco','h2','hidrogenio'],
        equacaoBalanceada:'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)'},
      hints:['Metal ativo + ácido → sal + H₂. Zn→Zn²⁺+2e⁻. 2H⁺+2e⁻→H₂','Efervescência de H₂. Zn é ativo mas menos que Al e Mg'],
      explicacao:'Zn+2HCl→ZnCl₂+H₂ · Metal ativo desloca H⁺. Zn acima do H na série de reatividade. ZnCl₂ formado é muito solúvel (432 g/100 mL). Mesmo princípio: Fe+2HCl→FeCl₂+H₂ e Al+3HCl→AlCl₃+(3/2)H₂' },
  ],

  /* ── ZnS ── */
  'ZnS': [
    { id:'zns_hcl', icon:'🔬', familia:'Dissolução em Ácido',
      titulo:'ZnS + 2 HCl → ZnCl₂ + H₂S↑',
      reagentes:['ZnS','HCl'], condicao:'', coefR:{'ZnS':1,'HCl':2}, coefP:[1,1],
      produtos_visuais:['ZnCl₂','H₂S'],
      candidatos:['ZnCl₂','H₂S','ZnSO₄','ZnO','Zn(OH)₂','HCl','FeCl₂','FeS'],
      gabarito:{produtos:['zncl2','cloreto de zinco','h2s','acido sulfidrico'],
        equacaoBalanceada:'ZnS(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂S(g)'},
      hints:['S²⁻ + 2H⁺ → H₂S↑. ZnS dissolve em ácido forte (diferente de PbS e CuS)','ZnS dissolve em HCl (pH neutro) mas não PbS ou CuS — diferencia sulfetos em análise'],
      explicacao:'ZnS+2HCl→ZnCl₂+H₂S · ZnS dissolve em HCl diluído (Kps=1,6×10⁻²⁴ mas dissolve em ácido). Diferente de PbS (Kps=8×10⁻²⁸) que não dissolve facilmente — separação analítica de Zn²⁺ de Pb²⁺ pelo comportamento do sulfeto' },
    { id:'zns_sint', icon:'🔥', familia:'Síntese Direta',
      titulo:'Zn + S → ZnS',
      reagentes:['Zn','S'], condicao:'Δ', coefR:{'Zn':1,'S':1}, coefP:[1],
      produtos_visuais:['ZnS'],
      candidatos:['ZnS','ZnO','ZnSO₄','Zn(OH)₂','FeS','CuS','ZnCl₂','Na₂S'],
      gabarito:{produtos:['zns','sulfeto de zinco'],
        equacaoBalanceada:'Zn(s) + S(s) →(Δ)→ ZnS(s)'},
      hints:['Síntese direta de sulfeto: Zn + S → ZnS. Flash brilhante ao reagir','ZnS:Cu emite verde; ZnS:Ag emite azul. Era o material das telas de CRT (TV/monitor)'],
      explicacao:'Zn+S→ZnS · Síntese direta com flash luminoso. ZnS dopado com Cu (verde) ou Ag (azul) emite luz sob excitação por elétrons — foi o material de todas as telas de TV e monitor CRT por décadas. Ainda usado em detectores de radiação' },
    { id:'zns_h2s_precip', icon:'🔬', familia:'Precipitação Analítica',
      titulo:'ZnSO₄ + H₂S → ZnS↓ + H₂SO₄',
      reagentes:['ZnSO₄','H₂S'], condicao:'pH neutro', coefR:{'ZnSO₄':1,'H₂S':1}, coefP:[1,1],
      produtos_visuais:['ZnS','H₂SO₄'],
      candidatos:['ZnS','H₂SO₄','ZnCl₂','ZnO','Zn(OH)₂','Na₂S','FeS','CuS'],
      gabarito:{produtos:['zns','sulfeto de zinco','h2so4','acido sulfurico'],
        equacaoBalanceada:'ZnSO₄(aq) + H₂S(g) → ZnS(s)↓ + H₂SO₄(aq)'},
      hints:['Zn²⁺ precipita como ZnS branco em pH neutro. Em pH ácido: ZnS dissolve-se','Análise qualitativa: H₂S precipita Cu²⁺ (preto), Cd²⁺ (amarelo), Zn²⁺ (branco)'],
      explicacao:'ZnSO₄+H₂S→ZnS↓+H₂SO₄ · ZnS precipita em pH neutro/básico. Em pH ácido forte, dissolve-se de volta. Análise: H₂S em pH neutro precipita ZnS (branco) — diferencia Zn²⁺ de Fe²⁺ (não precipita em pH neutro com H₂S)' },
  ],

  /* ── K₂SO₄ ── */
  'K2SO4': [
    { id:'k2so4_bacl2', icon:'🔬', familia:'Precipitação',
      titulo:'K₂SO₄ + BaCl₂ → BaSO₄↓ + 2 KCl',
      reagentes:['K₂SO₄','BaCl₂'], condicao:'', coefR:{'K₂SO₄':1,'BaCl₂':1}, coefP:[1,2],
      produtos_visuais:['BaSO₄','KCl'],
      candidatos:['BaSO₄','KCl','BaCO₃','K₂CO₃','Na₂SO₄','NaCl','BaSO₃','K₂SO₃'],
      gabarito:{produtos:['baso4','sulfato de bario','kcl','cloreto de potassio'],
        equacaoBalanceada:'K₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2 KCl(aq)'},
      hints:['SO₄²⁻+Ba²⁺→BaSO₄↓ branco (Kps=1,1×10⁻¹⁰). Teste confirmatório de SO₄²⁻','BaSO₄ não dissolve em HCl — distingue de CaSO₃, BaCO₃'],
      explicacao:'K₂SO₄+BaCl₂→BaSO₄↓+2KCl · Precipitação de BaSO₄ — teste confirmatório de sulfato. BaSO₄ insolúvel em ácidos (diferente de carbonatos e sulfitos). Base da papa baritada em radiologia: BaSO₄ opaco ao raio-X' },
    { id:'k2so4_form', icon:'⚗️', familia:'Neutralização',
      titulo:'2 KOH + H₂SO₄ → K₂SO₄ + 2 H₂O',
      reagentes:['KOH','H₂SO₄'], condicao:'', coefR:{'KOH':2,'H₂SO₄':1}, coefP:[1,2],
      produtos_visuais:['K₂SO₄','H₂O'],
      candidatos:['K₂SO₄','H₂O','KHSO₄','KCl','KNO₃','K₂CO₃','Na₂SO₄','K₂SO₃'],
      gabarito:{produtos:['k2so4','sulfato de potassio','h2o','agua'],
        equacaoBalanceada:'2 KOH(aq) + H₂SO₄(aq) → K₂SO₄(aq) + 2 H₂O(l)'},
      hints:['Base dibásica? Não — KOH é monobásico! H₂SO₄ é dibásico: precisa 2 KOH','Com 1 KOH → KHSO₄ (sal ácido). Com 2 KOH → K₂SO₄ (sal neutro)'],
      explicacao:'2KOH+H₂SO₄→K₂SO₄+2H₂O · H₂SO₄ dibásico neutralizado por 2 mol de KOH. K₂SO₄ = fertilizante agrícola sem cloro, preferido para tabaco e frutas. Com 1 KOH: KHSO₄ (sal ácido). Proporção molar decide o produto!' },
    { id:'k2so4_alum', icon:'🔬', familia:'Formação de Alume',
      titulo:'K₂SO₄ + Al₂(SO₄)₃ + 24 H₂O → 2 KAl(SO₄)₂·12H₂O',
      reagentes:['K₂SO₄','Al₂(SO₄)₃','H₂O'], condicao:'cristalização', coefR:{'K₂SO₄':1,'Al₂(SO₄)₃':1,'H₂O':24}, coefP:[2],
      produtos_visuais:['KAl(SO₄)₂'],
      candidatos:['KAl(SO₄)₂','K₂SO₄','Al₂(SO₄)₃','AlCl₃','K₂SO₄','Na₂SO₄','CaSO₄','KCl'],
      gabarito:{produtos:['kal(so4)2','alume de potassio'],
        equacaoBalanceada:'K₂SO₄(aq) + Al₂(SO₄)₃(aq) + 24 H₂O → 2 KAl(SO₄)₂·12H₂O(s)'},
      hints:['Alume = sal duplo de K⁺ e Al³⁺ com sulfato. Cristaliza belo octaedro','Alume de potássio: desodorante natural, clarificação de água, tingimento de tecidos'],
      explicacao:'K₂SO₄+Al₂(SO₄)₃+24H₂O→2KAl(SO₄)₂·12H₂O · Formação do alume de potássio (pedra-ume). Sal duplo com K⁺ e Al³⁺. Usado como desodorante mineral, coagulante de água e mordente para tingimento. Cristais octaédricos perfeitos' },
  ],

  };

  Object.keys(r5).forEach(function(k){
    if(!REACOES_LIVRES[k]) REACOES_LIVRES[k] = [];
    r5[k].forEach(function(rxn){ REACOES_LIVRES[k].push(rxn); });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   LIGANTES / METAIS_COMPLEXOS / PREFIXOS_MULT / DESAFIOS_CONSTRUTOR
   Módulo 2 — Construtor de Nomenclatura (química de coordenação)
   ---------------------------------------------------------------------
   Dados do novo Módulo 2, que substitui a antiga "Classificação" por
   um construtor de blocos ("estilo LEGO") para nomenclatura IUPAC de
   compostos de coordenação: [prefixo multiplicador] + [ligante] +
   ... + [metal (+sufixo -ato se o complexo for aniônico)] + [NOx em
   romano] + "de" + [cátion externo], na ordem certa da língua
   portuguesa (ânion primeiro, "de", cátion depois — ex.: "cloreto DE
   sódio").

   Referências: IUPAC Nomenclature of Inorganic Chemistry,
   Recommendations 2005 ("Red Book"), Seção IR-9 (Coordination
   Compounds); Brown, LeMay & Bursten (2012) "Chemistry: The Central
   Science", 12ª ed., Cap. 24; Lee, J.D. (1996) "Química Inorgânica
   não tão Concisa".

   BNCC: conteúdo de Ensino Médio (nomenclatura de coordenação vai além
   de EF09) — habilidades EM13CNT101/EM13CNT207 (investigação e
   representação de fenômenos químicos com linguagem própria da área).
═══════════════════════════════════════════════════════════════════ */

/* ── LIGANTES ─────────────────────────────────────────────────────
   Nome do ligante quando coordenado a um átomo central. Regra geral
   (IUPAC IR-9.2.2.1): ânions terminados em "-eto" viram "-o" (cloreto→
   cloro); ânions "-ato"/"-ito" mantêm a raiz; moléculas neutras usam o
   nome comum, com 4 exceções consagradas (água→aqua, amônia→amino,
   CO→carbonila, NO→nitrosila). */
var LIGANTES = {
  cloro:    { formula: 'Cl⁻',  nome_origem: 'cloreto', tipo: 'aniônico', desc: 'Ligante haleto mais comum.' },
  bromo:    { formula: 'Br⁻',  nome_origem: 'brometo', tipo: 'aniônico', desc: 'Haleto, menos comum que o cloro.' },
  fluoro:   { formula: 'F⁻',   nome_origem: 'fluoreto', tipo: 'aniônico', desc: 'Haleto mais eletronegativo.' },
  iodo:     { formula: 'I⁻',   nome_origem: 'iodeto', tipo: 'aniônico', desc: 'Haleto mais volumoso.' },
  ciano:    { formula: 'CN⁻',  nome_origem: 'cianeto', tipo: 'aniônico', desc: 'Liga-se pelo carbono; ligante forte, comum em complexos de ferro.' },
  hidroxo:  { formula: 'OH⁻',  nome_origem: 'hidróxido', tipo: 'aniônico', desc: 'Pode formar pontes entre dois metais.' },
  oxo:      { formula: 'O²⁻',  nome_origem: 'óxido', tipo: 'aniônico', desc: 'Ligante de carga 2−.' },
  tio:      { formula: 'S²⁻',  nome_origem: 'sulfeto', tipo: 'aniônico', desc: 'Análogo ao oxo, com enxofre.' },
  nitro:    { formula: 'NO₂⁻', nome_origem: 'nitrito', tipo: 'aniônico', desc: 'Liga-se pelo nitrogênio (isômero: nitrito liga pelo O).' },
  sulfato:  { formula: 'SO₄²⁻', nome_origem: 'sulfato', tipo: 'aniônico', desc: 'Mantém o próprio nome como ligante.' },
  carbonato:{ formula: 'CO₃²⁻', nome_origem: 'carbonato', tipo: 'aniônico', desc: 'Mantém o próprio nome como ligante.' },
  aqua:     { formula: 'H₂O',  nome_origem: 'água', tipo: 'neutro', desc: 'Exceção consagrada — não seria "oxidano".' },
  amino:    { formula: 'NH₃',  nome_origem: 'amônia', tipo: 'neutro', desc: 'Exceção consagrada — não seria "trihidridonitrogênio".' },
  carbonila:{ formula: 'CO',   nome_origem: 'monóxido de carbono', tipo: 'neutro', desc: 'Exceção consagrada, comum em complexos metal-carbonila.' },
  nitrosila:{ formula: 'NO',   nome_origem: 'óxido nítrico', tipo: 'neutro', desc: 'Exceção consagrada.' },
};

/* ── METAIS_COMPLEXOS ──────────────────────────────────────────────
   Nome do átomo central conforme o COMPLEXO seja catiônico/neutro
   (nome comum, sem sufixo) ou aniônico (sufixo "-ato", às vezes sobre
   a raiz latina — regra IUPAC IR-9.2.4.2). NOX comuns listados para
   referência pedagógica ao verificar as respostas. */
var METAIS_COMPLEXOS = {
  Fe: { nome_cation: 'ferro',    nome_anion: 'ferrato',    origem_latina: 'ferrum',    nox_comuns: [2, 3] },
  Cu: { nome_cation: 'cobre',    nome_anion: 'cuprato',    origem_latina: 'cuprum',    nox_comuns: [1, 2] },
  Ag: { nome_cation: 'prata',    nome_anion: 'argentato',  origem_latina: 'argentum',  nox_comuns: [1] },
  Au: { nome_cation: 'ouro',     nome_anion: 'aurato',     origem_latina: 'aurum',     nox_comuns: [1, 3] },
  Zn: { nome_cation: 'zinco',    nome_anion: 'zincato',    origem_latina: null,        nox_comuns: [2] },
  Ni: { nome_cation: 'níquel',   nome_anion: 'niquelato',  origem_latina: null,        nox_comuns: [2] },
  Co: { nome_cation: 'cobalto',  nome_anion: 'cobaltato',  origem_latina: null,        nox_comuns: [2, 3] },
  Cr: { nome_cation: 'cromo',    nome_anion: 'cromato',    origem_latina: null,        nox_comuns: [2, 3] },
  Mn: { nome_cation: 'manganês', nome_anion: 'manganato',  origem_latina: null,        nox_comuns: [2, 4] },
  Pt: { nome_cation: 'platina',  nome_anion: 'platinato',  origem_latina: null,        nox_comuns: [2, 4] },
  Sn: { nome_cation: 'estanho',  nome_anion: 'estanato',   origem_latina: 'stannum',   nox_comuns: [2, 4] },
  Pb: { nome_cation: 'chumbo',   nome_anion: 'plumbato',   origem_latina: 'plumbum',   nox_comuns: [2, 4] },
};

/* ── PREFIXOS_MULT ─────────────────────────────────────────────────
   Simples (mono–hexa): usados para ligantes de nome simples. Compostos
   (bis/tris/tetrakis): usados quando o nome do próprio ligante já tem
   um prefixo multiplicador embutido, ou é composto/entre parênteses —
   regra IUPAC IR-9.2.3.3 (evita ambiguidade; nenhum ligante da lista
   acima precisa deles, mas ficam disponíveis como distratores para
   testar se o aluno sabe quando NÃO usá-los). */
var PREFIXOS_MULT = {
  simples:   { 1: '', 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta', 6: 'hexa' },
  compostos: { 2: 'bis', 3: 'tris', 4: 'tetrakis' },
};

/* ── DESAFIOS_CONSTRUTOR ───────────────────────────────────────────
   Cada desafio traz: a fórmula-alvo, o tipo de composto (para o
   seletor da barra direita), o nível, a sequência CORRETA de blocos
   (na ordem exata do nome), uma lista de blocos DISTRATORES (opções
   plausíveis mas erradas, testando regras específicas), e as regras
   IUPAC relevantes (para o guia de regras da barra direita).

   Cada bloco tem: { id, texto, tipo } — "tipo" decide a cor/estilo do
   bloco na paleta (mesma legenda em todos os desafios):
     mult      = prefixo multiplicador (hexa, di, tetra...)
     ligante   = nome do ligante (ciano, amino, cloro...)
     metal     = nome do átomo central, já com sufixo -ato se aniônico
     nox       = estado de oxidação em romano, ex. "(III)"
     conectivo = a palavra "de"
     ion       = nome do cátion/ânion externo simples (potássio, sódio...)
     radical   = raiz do nome de ácido/sal simples (sulf, clor...)
     sufixo    = sufixo de ácido/sal simples (-ico, -oso, -ídrico...)
     fixo      = palavra fixa (ex. "ácido")
*/
var DESAFIOS_CONSTRUTOR = [

  {
    id: 'construtor_sal',
    formula: 'NaCl',
    nome_correto: 'cloreto de sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de sódio (sal de cozinha)',
    /* `titulo`/`nome_correto` só aparecem DEPOIS de resolvido (mensagem
       de sucesso do validador) — nunca antes, para não entregar a
       resposta. Ver mod2AtualizarInfoComposto()/mod2MontarBiblioteca()
       em scriptsiqi.js: usam `composicao` e `formula`, nunca `titulo`. */
    descricao: 'Sal binário simples, sem ligantes — a base gramatical [ânion] + "de" + [cátion] que sustenta os nomes de complexos mais à frente.',
    composicao: [
      { especie: 'Na⁺', papel: 'cátion', quantidade: 1, carga: '+1' },
      { especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '−1' },
    ],
    blocos_corretos: [
      { id: 'b1', texto: 'cloreto', tipo: 'metal' },
      { id: 'b2', texto: 'de', tipo: 'conectivo' },
      { id: 'b3', texto: 'sódio', tipo: 'ion' },
    ],
    distratores: [
      { id: 'd1', texto: 'cloro', tipo: 'ligante' },
      { id: 'd2', texto: 'mono', tipo: 'mult' },
    ],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: 'Sal de cozinha; eletrólito essencial para o corpo humano.',
    fonte: 'IUPAC Red Book 2005, Seção IR-8.4.',
  },

  {
    id: 'construtor_acido',
    formula: 'H₂SO₄',
    nome_correto: 'ácido sulfúrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido sulfúrico',
    descricao: 'Ácido oxigenado clássico: o enxofre está no maior estado de oxidação possível para ele. Pense em qual sufixo, entre os disponíveis, marca esse caso.',
    composicao: [
      { especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 2, carga: '+1 cada' },
      { especie: 'S', papel: 'átomo central do ânion', quantidade: 1, carga: 'NOX +6' },
      { especie: 'O²⁻', papel: 'oxigênios ligados ao enxofre', quantidade: 4, carga: '−2 cada' },
    ],
    blocos_corretos: [
      { id: 'b1', texto: 'ácido', tipo: 'fixo' },
      { id: 'b2', texto: 'sulf', tipo: 'radical' },
      { id: 'b3', texto: 'úrico', tipo: 'sufixo' },
    ],
    distratores: [
      { id: 'd1', texto: 'oso', tipo: 'sufixo' },
      { id: 'd2', texto: 'ídrico', tipo: 'sufixo' },
    ],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: 'Um dos ácidos mais produzidos no mundo; baterias de automóvel, fertilizantes.',
    fonte: 'IUPAC Red Book 2005, Seção IR-8.2; Brown et al. (2012) Cap. 2.8.',
  },

  {
    id: 'construtor_cation',
    formula: '[Cu(NH₃)₄]SO₄',
    nome_correto: 'sulfato de tetraaminocobre(II)',
    tipo: 'cation_complexo',
    nivel: 'intermediario',
    titulo: 'Sulfato de tetraaminocobre(II)',
    descricao: 'O CÁTION do sal é um complexo: moléculas neutras ao redor de um íon metálico de transição (veja o símbolo na ficha ao lado). Repare no sinal da carga do complexo inteiro antes de escolher a forma do nome do metal.',
    composicao: [
      { especie: 'Cu', papel: 'átomo central do complexo (cátion)', quantidade: 1, carga: 'NOX a determinar' },
      { especie: 'NH₃', papel: 'ligante neutro', quantidade: 4, carga: '0' },
      { especie: 'SO₄²⁻', papel: 'ânion externo', quantidade: 1, carga: '−2' },
    ],
    blocos_corretos: [
      { id: 'b1', texto: 'sulfato', tipo: 'metal' },
      { id: 'b2', texto: 'de', tipo: 'conectivo' },
      { id: 'b3', texto: 'tetra', tipo: 'mult' },
      { id: 'b4', texto: 'amino', tipo: 'ligante' },
      { id: 'b5', texto: 'cobre', tipo: 'metal' },
      { id: 'b6', texto: '(II)', tipo: 'nox' },
    ],
    distratores: [
      { id: 'd1', texto: 'cuprato', tipo: 'metal' },
      { id: 'd2', texto: 'hexa', tipo: 'mult' },
      { id: 'd3', texto: '(III)', tipo: 'nox' },
    ],
    regras_ativas: ['ordem_sal', 'sufixo_ato_aniônico', 'nox_romano', 'contagem_ligantes'],
    aplicacao: 'Solução azul-intensa usada classicamente no teste de Fehling/Benedict para açúcares redutores.',
    fonte: 'Brown et al. (2012), Cap. 24; IUPAC Red Book 2005, IR-9.2.4.2.',
  },

  {
    id: 'construtor_anion',
    formula: 'K₃[Fe(CN)₆]',
    nome_correto: 'hexacianoferrato(III) de potássio',
    tipo: 'anion_complexo',
    nivel: 'intermediario',
    titulo: 'Hexacianoferrato(III) de potássio',
    descricao: 'O ÂNION do sal é um complexo: ligantes carregados negativamente ao redor de um átomo de ferro. Calcule a carga total do complexo — ela determina que forma o nome do metal deve assumir.',
    composicao: [
      { especie: 'K⁺', papel: 'cátion externo', quantidade: 3, carga: '+1 cada' },
      { especie: 'Fe', papel: 'átomo central do complexo (ânion)', quantidade: 1, carga: 'NOX a determinar' },
      { especie: 'CN⁻', papel: 'ligante aniônico', quantidade: 6, carga: '−1 cada' },
    ],
    blocos_corretos: [
      { id: 'b1', texto: 'hexa', tipo: 'mult' },
      { id: 'b2', texto: 'ciano', tipo: 'ligante' },
      { id: 'b3', texto: 'ferrato', tipo: 'metal' },
      { id: 'b4', texto: '(III)', tipo: 'nox' },
      { id: 'b5', texto: 'de', tipo: 'conectivo' },
      { id: 'b6', texto: 'potássio', tipo: 'ion' },
    ],
    distratores: [
      { id: 'd1', texto: 'ferro', tipo: 'metal' },
      { id: 'd2', texto: 'tri', tipo: 'mult' },
      { id: 'd3', texto: '(II)', tipo: 'nox' },
    ],
    regras_ativas: ['ordem_sal', 'sufixo_ato_aniônico', 'nox_romano', 'contagem_ligantes'],
    aplicacao: 'Um sal duplo usado em fotografia analógica e como reagente para detectar íons Fe²⁺ em laboratório.',
    fonte: 'IUPAC Red Book 2005, IR-9.2.4.2; Lee (1996), Química Inorgânica não tão Concisa.',
  },

  {
    id: 'construtor_neutro',
    formula: '[Pt(NH₃)₂Cl₂]',
    nome_correto: 'diaminodicloroplatina(II)',
    tipo: 'neutro',
    nivel: 'avancado',
    titulo: 'Diaminodicloroplatina(II) — a cisplatina',
    descricao: 'Complexo NEUTRO com dois tipos de ligante diferentes ao redor de um metal de transição pesado (veja o símbolo na ficha ao lado). A ordem entre eles segue uma regra específica — veja o guia de regras ao lado.',
    composicao: [
      { especie: 'Pt', papel: 'átomo central do complexo (neutro)', quantidade: 1, carga: 'NOX a determinar' },
      { especie: 'NH₃', papel: 'ligante neutro', quantidade: 2, carga: '0' },
      { especie: 'Cl⁻', papel: 'ligante aniônico', quantidade: 2, carga: '−1 cada' },
    ],
    blocos_corretos: [
      { id: 'b1', texto: 'di', tipo: 'mult' },
      { id: 'b2', texto: 'amino', tipo: 'ligante' },
      { id: 'b3', texto: 'di', tipo: 'mult' },
      { id: 'b4', texto: 'cloro', tipo: 'ligante' },
      { id: 'b5', texto: 'platina', tipo: 'metal' },
      { id: 'b6', texto: '(II)', tipo: 'nox' },
    ],
    distratores: [
      { id: 'd1', texto: 'platinato', tipo: 'metal' },
      { id: 'd2', texto: 'hexa', tipo: 'mult' },
      { id: 'd3', texto: 'de', tipo: 'conectivo' },
    ],
    regras_ativas: ['ordem_alfabetica', 'sufixo_ato_aniônico', 'nox_romano', 'sem_cation_externo'],
    aplicacao: 'Um dos medicamentos quimioterápicos mais usados no tratamento de tumores sólidos.',
    fonte: 'Brown et al. (2012), Cap. 24 (quimioterapia com complexos de platina); IUPAC Red Book 2005, IR-9.2.3.1 (ordem alfabética).',
  },

  /* ── Compostos importados da Biblioteca de Nomenclatura (CATALOGO_SIQI) ──
     Gerados automaticamente por função química (ácido/base/sal/óxido) a
     partir do mesmo catálogo de 100 compostos usado no Módulo 1 — mesma
     fonte de dados, agora com blocos/composição/distratores próprios
     para o Construtor. 93 dos 100 compostos foram convertidos (7
     exceções sem padrão regular de nome — elementos puros, "Amônia",
     peróxidos, "Magnetita" — foram deixados de fora para não gerar
     blocos incorretos). Auditados um a um: nenhuma "espécie" da
     composição química repete o texto de um bloco da resposta (ver
     checagem em /home/claude/work/gerar_desafios_completos.js). ── */

  {
    id: 'auto_h2so4',
    formula: 'H₂SO₄',
    nome_correto: 'Ácido Sulfúrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Sulfúrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 2, carga: '+1 cada' }, { especie: 'SO₄', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-2' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'sulfúr', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hcl',
    formula: 'HCl',
    nome_correto: 'Ácido Clorídrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Clorídrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'Cl', papel: 'ânion (hidrácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'clor', tipo: 'radical' }, { id: 'b3', texto: 'ídrico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hno3',
    formula: 'HNO₃',
    nome_correto: 'Ácido Nítrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Nítrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'NO₃', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'nítr', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_h2co3',
    formula: 'H₂CO₃',
    nome_correto: 'Ácido Carbônico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Carbônico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 2, carga: '+1 cada' }, { especie: 'CO₃', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-2' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'carbôn', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_naoh',
    formula: 'NaOH',
    nome_correto: 'Hidróxido de Sódio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_caoh2',
    formula: 'Ca(OH)₂',
    nome_correto: 'Hidróxido de Cálcio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Cálcio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Ca', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cálcio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_nacl',
    formula: 'NaCl',
    nome_correto: 'Cloreto de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_cuso4',
    formula: 'CuSO₄',
    nome_correto: 'Sulfato de Cobre (II)',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Sulfato de Cobre (II)',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Cu', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cobre', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_agno3',
    formula: 'AgNO₃',
    nome_correto: 'Nitrato de Prata',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Nitrato de Prata',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'NO₃⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Ag', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'nitrato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'prata', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_cao',
    formula: 'CaO',
    nome_correto: 'Óxido de Cálcio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Cálcio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Ca', papel: 'elemento central', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cálcio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_co2',
    formula: 'CO₂',
    nome_correto: 'Dióxido de Carbono',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Dióxido de Carbono',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'C', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'di', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'carbono', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'tri', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_fe2o3',
    formula: 'Fe₂O₃',
    nome_correto: 'Óxido de Ferro (III)',
    tipo: 'oxido',
    nivel: 'intermediario',
    titulo: 'Óxido de Ferro (III)',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Fe', papel: 'elemento central', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(III)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(II)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_so3',
    formula: 'SO₃',
    nome_correto: 'Trióxido de Enxofre',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Trióxido de Enxofre',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'S', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'tri', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'enxofre', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'di', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_h3po4',
    formula: 'H₃PO₄',
    nome_correto: 'Ácido Fosfórico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Fosfórico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 3, carga: '+1 cada' }, { especie: 'PO₄', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-3' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'fosfór', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_koh',
    formula: 'KOH',
    nome_correto: 'Hidróxido de Potássio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_mgoh2',
    formula: 'Mg(OH)₂',
    nome_correto: 'Hidróxido de Magnésio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Magnésio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Mg', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'magnésio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_zno',
    formula: 'ZnO',
    nome_correto: 'Óxido de Zinco',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Zinco',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Zn', papel: 'elemento central', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'zinco', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_mgo',
    formula: 'MgO',
    nome_correto: 'Óxido de Magnésio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Magnésio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Mg', papel: 'elemento central', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'magnésio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na2co3',
    formula: 'Na₂CO₃',
    nome_correto: 'Carbonato de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Carbonato de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'CO₃²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'carbonato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_fecl3',
    formula: 'FeCl₃',
    nome_correto: 'Cloreto de Ferro III',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Cloreto de Ferro III',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Fe', papel: 'cátion', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(III)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(II)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hf',
    formula: 'HF',
    nome_correto: 'Ácido Fluorídrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Fluorídrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'F', papel: 'ânion (hidrácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'fluor', tipo: 'radical' }, { id: 'b3', texto: 'ídrico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hbr',
    formula: 'HBr',
    nome_correto: 'Ácido Bromídrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Bromídrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'Br', papel: 'ânion (hidrácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'brom', tipo: 'radical' }, { id: 'b3', texto: 'ídrico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hi',
    formula: 'HI',
    nome_correto: 'Ácido Iodídrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Iodídrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'I', papel: 'ânion (hidrácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'iod', tipo: 'radical' }, { id: 'b3', texto: 'ídrico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_h2s',
    formula: 'H₂S',
    nome_correto: 'Ácido Sulfídrico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Sulfídrico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 2, carga: '+1 cada' }, { especie: 'S', papel: 'ânion (hidrácido)', quantidade: 1, carga: '-2' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'sulf', tipo: 'radical' }, { id: 'b3', texto: 'ídrico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hclo',
    formula: 'HClO',
    nome_correto: 'Ácido Hipocloroso',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Hipocloroso',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'ClO', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'hipoclor', tipo: 'radical' }, { id: 'b3', texto: 'oso', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'ico', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_baoh2',
    formula: 'Ba(OH)₂',
    nome_correto: 'Hidróxido de Bário',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Bário',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Ba', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'bário', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_aloh3',
    formula: 'Al(OH)₃',
    nome_correto: 'Hidróxido de Alumínio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Alumínio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Al', papel: 'cátion', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'alumínio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_feoh3',
    formula: 'Fe(OH)₃',
    nome_correto: 'Hidróxido de Ferro III',
    tipo: 'base',
    nivel: 'intermediario',
    titulo: 'Hidróxido de Ferro III',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Fe', papel: 'cátion', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(III)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(II)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_nahco3',
    formula: 'NaHCO₃',
    nome_correto: 'Bicarbonato de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Bicarbonato de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'HCO₃⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'bicarbonato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_kno3',
    formula: 'KNO₃',
    nome_correto: 'Nitrato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Nitrato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'NO₃⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'nitrato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_caco3',
    formula: 'CaCO₃',
    nome_correto: 'Carbonato de Cálcio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Carbonato de Cálcio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'CO₃²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Ca', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'carbonato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cálcio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_baso4',
    formula: 'BaSO₄',
    nome_correto: 'Sulfato de Bário',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfato de Bário',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Ba', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'bário', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_znso4',
    formula: 'ZnSO₄',
    nome_correto: 'Sulfato de Zinco',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfato de Zinco',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Zn', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'zinco', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_feso4',
    formula: 'FeSO₄',
    nome_correto: 'Sulfato de Ferro II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Sulfato de Ferro II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Fe', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_kmno4',
    formula: 'KMnO₄',
    nome_correto: 'Permanganato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Permanganato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'MnO₄⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'permanganato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_alcl3',
    formula: 'AlCl₃',
    nome_correto: 'Cloreto de Alumínio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Alumínio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Al', papel: 'cátion', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'alumínio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_n2o5',
    formula: 'N₂O₅',
    nome_correto: 'Pentóxido de Dinitrogênio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Pentóxido de Dinitrogênio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'N', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'penta', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'di', tipo: 'mult' }, { id: 'b5', texto: 'nitrogênio', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'di', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_p2o5',
    formula: 'P₂O₅',
    nome_correto: 'Pentóxido de Fósforo',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Pentóxido de Fósforo',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'P', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'penta', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'fósforo', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'di', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na2so4',
    formula: 'Na₂SO₄',
    nome_correto: 'Sulfato de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfato de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_k2so4',
    formula: 'K₂SO₄',
    nome_correto: 'Sulfato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_mgso4',
    formula: 'MgSO₄',
    nome_correto: 'Sulfato de Magnésio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfato de Magnésio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Mg', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'magnésio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_cacl2',
    formula: 'CaCl₂',
    nome_correto: 'Cloreto de Cálcio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Cálcio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Ca', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cálcio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_cuoh2',
    formula: 'Cu(OH)₂',
    nome_correto: 'Hidróxido de Cobre II',
    tipo: 'base',
    nivel: 'intermediario',
    titulo: 'Hidróxido de Cobre II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Cu', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cobre', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_feoh2',
    formula: 'Fe(OH)₂',
    nome_correto: 'Hidróxido de Ferro II',
    tipo: 'base',
    nivel: 'intermediario',
    titulo: 'Hidróxido de Ferro II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Fe', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_k2co3',
    formula: 'K₂CO₃',
    nome_correto: 'Carbonato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Carbonato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'CO₃²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'carbonato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_pbno32',
    formula: 'Pb(NO₃)₂',
    nome_correto: 'Nitrato de Chumbo II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Nitrato de Chumbo II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'NO₃⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Pb', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'nitrato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'chumbo', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_nan3',
    formula: 'NaN₃',
    nome_correto: 'Azida de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Azida de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'N₃⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'azida', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_mgcl2',
    formula: 'MgCl₂',
    nome_correto: 'Cloreto de Magnésio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Magnésio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Mg', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'magnésio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hno2',
    formula: 'HNO₂',
    nome_correto: 'Ácido Nitroso',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Nitroso',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'NO₂', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'nitr', tipo: 'radical' }, { id: 'b3', texto: 'oso', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'ico', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_h2so3',
    formula: 'H₂SO₃',
    nome_correto: 'Ácido Sulfuroso',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Sulfuroso',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 2, carga: '+1 cada' }, { especie: 'SO₃', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-2' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'sulfur', tipo: 'radical' }, { id: 'b3', texto: 'oso', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'ico', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hclo3',
    formula: 'HClO₃',
    nome_correto: 'Ácido Clórico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Clórico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'ClO₃', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'clór', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_hclo4',
    formula: 'HClO₄',
    nome_correto: 'Ácido Perclórico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Perclórico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 1, carga: '+1 cada' }, { especie: 'ClO₄', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-1' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'perclór', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_h3po3',
    formula: 'H₃PO₃',
    nome_correto: 'Ácido Fosforoso',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Fosforoso',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 3, carga: '+1 cada' }, { especie: 'PO₃', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-3' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'fosfor', tipo: 'radical' }, { id: 'b3', texto: 'oso', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'ico', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_h2cro4',
    formula: 'H₂CrO₄',
    nome_correto: 'Ácido Crômico',
    tipo: 'acido',
    nivel: 'basico',
    titulo: 'Ácido Crômico',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'H⁺', papel: 'hidrogênio ionizável', quantidade: 2, carga: '+1 cada' }, { especie: 'CrO₄', papel: 'ânion (oxoácido)', quantidade: 1, carga: '-2' }],
    blocos_corretos: [{ id: 'b1', texto: 'ácido', tipo: 'fixo' }, { id: 'b2', texto: 'crôm', tipo: 'radical' }, { id: 'b3', texto: 'ico', tipo: 'sufixo' }],
    distratores: [{ id: 'd1', texto: 'oso', tipo: 'sufixo' }],
    regras_ativas: ['sufixo_ico_oso'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_lioh',
    formula: 'LiOH',
    nome_correto: 'Hidróxido de Lítio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Lítio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Li', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'lítio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_nh4oh',
    formula: 'NH₄OH',
    nome_correto: 'Hidróxido de Amônio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Amônio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'NH₄⁺', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'amônio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_snoh4',
    formula: 'Sn(OH)₄',
    nome_correto: 'Hidróxido de Estanho IV',
    tipo: 'base',
    nivel: 'intermediario',
    titulo: 'Hidróxido de Estanho IV',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Sn', papel: 'cátion', quantidade: 1, carga: '+4' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'estanho', tipo: 'ion' }, { id: 'b4', texto: '(IV)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_pboh2',
    formula: 'Pb(OH)₂',
    nome_correto: 'Hidróxido de Chumbo II',
    tipo: 'base',
    nivel: 'intermediario',
    titulo: 'Hidróxido de Chumbo II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Pb', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'chumbo', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_rboh',
    formula: 'RbOH',
    nome_correto: 'Hidróxido de Rubídio',
    tipo: 'base',
    nivel: 'basico',
    titulo: 'Hidróxido de Rubídio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'OH⁻', papel: 'hidroxila', quantidade: 1, carga: '-1' }, { especie: 'Rb', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'hidróxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'rubídio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na2o',
    formula: 'Na₂O',
    nome_correto: 'Óxido de Sódio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Na', papel: 'elemento central', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_k2o',
    formula: 'K₂O',
    nome_correto: 'Óxido de Potássio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'K', papel: 'elemento central', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_bao',
    formula: 'BaO',
    nome_correto: 'Óxido de Bário',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Bário',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Ba', papel: 'elemento central', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'bário', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_so2',
    formula: 'SO₂',
    nome_correto: 'Dióxido de Enxofre',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Dióxido de Enxofre',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'S', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'di', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'enxofre', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'tri', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_no2',
    formula: 'NO₂',
    nome_correto: 'Dióxido de Nitrogênio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Dióxido de Nitrogênio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'N', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'di', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'nitrogênio', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'tri', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_no',
    formula: 'NO',
    nome_correto: 'Monóxido de Nitrogênio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Monóxido de Nitrogênio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'N', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'mono', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'nitrogênio', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'di', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_co',
    formula: 'CO',
    nome_correto: 'Monóxido de Carbono',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Monóxido de Carbono',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'C', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'mono', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'carbono', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'di', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_al2o3',
    formula: 'Al₂O₃',
    nome_correto: 'Óxido de Alumínio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Óxido de Alumínio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Al', papel: 'elemento central', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'alumínio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_cuo',
    formula: 'CuO',
    nome_correto: 'Óxido de Cobre II',
    tipo: 'oxido',
    nivel: 'intermediario',
    titulo: 'Óxido de Cobre II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Cu', papel: 'elemento central', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cobre', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_mno2',
    formula: 'MnO₂',
    nome_correto: 'Dióxido de Manganês',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Dióxido de Manganês',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Mn', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'di', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'manganês', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'tri', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_sio2',
    formula: 'SiO₂',
    nome_correto: 'Dióxido de Silício',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Dióxido de Silício',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Si', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'di', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'silício', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'tri', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_naclo',
    formula: 'NaClO',
    nome_correto: 'Hipoclorito de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Hipoclorito de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'ClO⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'hipoclorito', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_kclo3',
    formula: 'KClO₃',
    nome_correto: 'Clorato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Clorato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'ClO₃⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'clorato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_kclo4',
    formula: 'KClO₄',
    nome_correto: 'Perclorato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Perclorato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'ClO₄⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'perclorato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_zncl2',
    formula: 'ZnCl₂',
    nome_correto: 'Cloreto de Zinco',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Zinco',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Zn', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'zinco', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_fecl2',
    formula: 'FeCl₂',
    nome_correto: 'Cloreto de Ferro II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Cloreto de Ferro II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Fe', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na2so3',
    formula: 'Na₂SO₃',
    nome_correto: 'Sulfito de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfito de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₃²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfito', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na3po4',
    formula: 'Na₃PO₄',
    nome_correto: 'Fosfato de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Fosfato de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'PO₄³⁻', papel: 'ânion', quantidade: 1, carga: '-3' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'fosfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_caso4',
    formula: 'CaSO₄',
    nome_correto: 'Sulfato de Cálcio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfato de Cálcio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Ca', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cálcio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_fes',
    formula: 'FeS',
    nome_correto: 'Sulfeto de Ferro II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Sulfeto de Ferro II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'S²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Fe', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfeto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'ferro', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_agcl',
    formula: 'AgCl',
    nome_correto: 'Cloreto de Prata',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Prata',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Ag', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'prata', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_pbi2',
    formula: 'PbI₂',
    nome_correto: 'Iodeto de Chumbo II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Iodeto de Chumbo II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'I⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Pb', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'iodeto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'chumbo', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_mnso4',
    formula: 'MnSO₄',
    nome_correto: 'Sulfato de Manganês II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Sulfato de Manganês II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Mn', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'manganês', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na2cro4',
    formula: 'Na₂CrO₄',
    nome_correto: 'Cromato de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cromato de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'CrO₄²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'cromato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_k2cr2o7',
    formula: 'K₂Cr₂O₇',
    nome_correto: 'Dicromato de Potássio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Dicromato de Potássio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cr₂O₇²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'K', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'dicromato', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'potássio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_na2s',
    formula: 'Na₂S',
    nome_correto: 'Sulfeto de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfeto de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'S²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfeto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_nh4cl',
    formula: 'NH₄Cl',
    nome_correto: 'Cloreto de Amônio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Cloreto de Amônio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'NH₄⁺', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'amônio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_naf',
    formula: 'NaF',
    nome_correto: 'Fluoreto de Sódio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Fluoreto de Sódio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'F⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Na', papel: 'cátion', quantidade: 1, carga: '+1' }],
    blocos_corretos: [{ id: 'b1', texto: 'fluoreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'sódio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_sncl2',
    formula: 'SnCl₂',
    nome_correto: 'Cloreto de Estanho II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Cloreto de Estanho II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Cl⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Sn', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'cloreto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'estanho', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_pbbr2',
    formula: 'PbBr₂',
    nome_correto: 'Brometo de Chumbo II',
    tipo: 'sal',
    nivel: 'intermediario',
    titulo: 'Brometo de Chumbo II',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'Br⁻', papel: 'ânion', quantidade: 1, carga: '-1' }, { especie: 'Pb', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'brometo', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'chumbo', tipo: 'ion' }, { id: 'b4', texto: '(II)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(III)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_cr2o3',
    formula: 'Cr₂O₃',
    nome_correto: 'Óxido de Cromo III',
    tipo: 'oxido',
    nivel: 'intermediario',
    titulo: 'Óxido de Cromo III',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Cr', papel: 'elemento central', quantidade: 1, carga: '+3' }],
    blocos_corretos: [{ id: 'b1', texto: 'óxido', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cromo', tipo: 'ion' }, { id: 'b4', texto: '(III)', tipo: 'nox' }],
    distratores: [{ id: 'd1', texto: '(II)', tipo: 'nox' }],
    regras_ativas: ['ordem_sal', 'nox_romano'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_tio2',
    formula: 'TiO₂',
    nome_correto: 'Dióxido de Titânio',
    tipo: 'oxido',
    nivel: 'basico',
    titulo: 'Dióxido de Titânio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'O²⁻', papel: 'ligado ao elemento central', quantidade: 1, carga: '-2 cada' }, { especie: 'Ti', papel: 'elemento central', quantidade: 1, carga: '—' }],
    blocos_corretos: [{ id: 'b1', texto: 'di', tipo: 'mult' }, { id: 'b2', texto: 'óxido', tipo: 'metal' }, { id: 'b3', texto: 'de', tipo: 'conectivo' }, { id: 'b4', texto: 'titânio', tipo: 'ion' }],
    distratores: [{ id: 'd1', texto: 'tri', tipo: 'mult' }],
    regras_ativas: ['ordem_sal', 'contagem_ligantes'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_caso3',
    formula: 'CaSO₃',
    nome_correto: 'Sulfito de Cálcio',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfito de Cálcio',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'SO₃²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Ca', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfito', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'cálcio', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

  {
    id: 'auto_zns',
    formula: 'ZnS',
    nome_correto: 'Sulfeto de Zinco',
    tipo: 'sal',
    nivel: 'basico',
    titulo: 'Sulfeto de Zinco',
    descricao: 'Composto real do catálogo de Nomenclatura — monte o nome pela fórmula e pela composição ao lado, sem espiar a resposta.',
    composicao: [{ especie: 'S²⁻', papel: 'ânion', quantidade: 1, carga: '-2' }, { especie: 'Zn', papel: 'cátion', quantidade: 1, carga: '+2' }],
    blocos_corretos: [{ id: 'b1', texto: 'sulfeto', tipo: 'metal' }, { id: 'b2', texto: 'de', tipo: 'conectivo' }, { id: 'b3', texto: 'zinco', tipo: 'ion' }],
    distratores: [],
    regras_ativas: ['ordem_sal', 'sufixo_eto'],
    aplicacao: '',
    fonte: 'Catálogo SIQI (Módulo 1 — Nomenclatura); IUPAC Red Book 2005.',
  },

];

/* ── REGRAS_IUPAC ──────────────────────────────────────────────────
   Cards explicativos mostrados no "Guia de Regras Ativas" (barra
   direita), filtrados por desafio.regras_ativas. */
var REGRAS_IUPAC = {
  ordem_sal: {
    titulo: 'Ordem do nome em sais (português)',
    texto: 'Em português, o nome de um sal segue [ânion] + "de" + [cátion] — o ânion vem primeiro no NOME, mesmo que o cátion venha primeiro na FÓRMULA. Ex.: NaCl → "cloreto DE sódio", não "sódio cloreto".',
  },
  sufixo_eto: {
    titulo: 'Sufixo "-eto" para ânions binários',
    texto: 'Ânions formados por um único elemento (haletos, calcogenetos) recebem o sufixo "-eto": Cl⁻ → cloreto, S²⁻ → sulfeto.',
  },
  sufixo_ico_oso: {
    titulo: 'Sufixos "-ico" e "-oso" em ácidos/sais oxigenados',
    texto: 'Quando um elemento forma dois oxoácidos comuns, o de NOX mais alto leva o sufixo "-ico" e o de NOX mais baixo leva "-oso". H₂SO₄ (S⁺⁶) → sulfúrico; H₂SO₃ (S⁺⁴) → sulfuroso.',
  },
  sufixo_ato_aniônico: {
    titulo: 'Sufixo "-ato" só quando o COMPLEXO é aniônico',
    texto: 'O nome do átomo central de um complexo só recebe o sufixo "-ato" quando o complexo INTEIRO tem carga negativa. Em complexos neutros ou catiônicos, usa-se o nome comum do metal, sem sufixo especial. Alguns metais usam a raiz latina nessa forma: ferro→ferrato, cobre→cuprato, prata→argentato.',
  },
  nox_romano: {
    titulo: 'Estado de oxidação em algarismo romano',
    texto: 'O NOX do átomo central vai em algarismos romanos entre parênteses, colado ao nome do metal, sem espaço: "ferrato(III)", não "ferrato (III)". Calcule pelo balanço de cargas: soma das cargas dos ligantes + NOX do metal = carga total do complexo.',
  },
  contagem_ligantes: {
    titulo: 'Prefixos multiplicadores contam ligantes, não átomos',
    texto: 'Os prefixos di-, tri-, tetra-, penta-, hexa- indicam quantos ligantes IGUAIS estão coordenados — não o número de átomos dentro do ligante. "Hexaciano" = 6 ligantes CN⁻, mesmo que cada um tenha 2 átomos.',
  },
  ordem_alfabetica: {
    titulo: 'Ordem alfabética dos ligantes',
    texto: 'Quando um complexo tem DOIS OU MAIS tipos de ligante diferentes, eles aparecem no nome em ordem ALFABÉTICA (pela primeira letra do nome do ligante) — os prefixos multiplicadores NÃO contam para essa ordenação. "Amino" vem antes de "cloro" porque A vem antes de C.',
  },
  sem_cation_externo: {
    titulo: 'Complexos neutros não têm "de + cátion"',
    texto: 'Quando o complexo inteiro já é eletricamente neutro (soma de cargas = 0), ele já É a substância — não existe um cátion externo separado para nomear com "de". O nome termina no NOX do metal.',
  },
};



/* ═══════════════════════════════════════════════════════════════════
   REACOES_REDOX — Módulo 3 (Reações de Oxirredução)
   Plano de Ação SIQI Modular (2026)
   ---------------------------------------------------------------------
   redox_001 — a equação '4 Fe(s) + 3 O₂(g) → 2 Fe₂O₃(s)' é EXATAMENTE
     o campo `equacao` do composto 'fe2o3' em CATALOGO_SIQI (acima).
   redox_002 — a semirreação de redução 'MnO₄⁻ + 5e⁻ + 8H⁺ → Mn²⁺ +
     4H₂O' vem do campo `reacao` do composto 'kmno4'; a oxidação de
     Fe²⁺ → Fe³⁺ é mencionada no campo `curiosidade` de 'feso4'.

   Cálculo de balanceamento (método do íon-elétron / meia-reação):
     1. Escrever as duas semirreações com elétrons explícitos.
     2. Calcular o MMC do nº de elétrons de cada semirreação.
     3. Multiplicar cada semirreação pelo fator que iguala os
        elétrons perdidos aos ganhos.
     4. Somar as semirreações; os elétrons se cancelam.

   Referências: Brown, LeMay & Bursten (2012) "Chemistry: The Central
   Science", 12ª ed., Cap. 20 (Eletroquímica); Zumdahl & Zumdahl
   (2009) "Chemistry", 8ª ed., Cap. 17-19; NIST WebBook.

   BNCC: Habilidade EF09CI05 (estequiometria via balanceamento de
   elétrons transferidos).
═══════════════════════════════════════════════════════════════════ */
var REACOES_REDOX = [

  {
    id: 'redox_001',
    titulo: 'Combustão do Ferro (formação da ferrugem)',
    equacao_desbalanceada: 'Fe(s) + O₂(g) → Fe₂O₃(s)',
    ambiente: 'neutro',
    oxidacao_estados: {
      Fe: { inicial: 0, final: 3 },
      O: { inicial: 0, final: -2 },
    },
    semireacoes: {
      oxidacao: { especie: 'Fe', estado_inicial: 0, estado_final: 3, mudanca: 3, eletrons: 3, equacao: 'Fe → Fe³⁺ + 3 e⁻' },
      reducao: { especie: 'O₂', estado_inicial: 0, estado_final: -2, mudanca: 2, eletrons: 4, equacao: 'O₂ + 4 e⁻ → 2 O²⁻' },
    },
    coeficientes: { Fe: 4, O2: 3, Fe2O3: 2 },
    equacao_balanceada: '4 Fe(s) + 3 O₂(g) → 2 Fe₂O₃(s)',
    dificuldade: 'basico',
    descricao: 'O ferro metálico (Fe⁰) é oxidado a Fe³⁺ enquanto o oxigênio molecular (O₂⁰) é reduzido a O²⁻, formando o óxido de ferro(III) — a ferrugem.',
    aplicacao: 'Corrosão de estruturas de ferro/aço expostas ao ar úmido; base da reação termoita (Fe₂O₃ + Al) usada para soldar trilhos ferroviários.',
    fonte: 'Brown et al. (2012), Cap. 20; dado consistente com o campo `equacao` do composto Fe₂O₃ em CATALOGO_SIQI.',
  },

  {
    id: 'redox_002',
    titulo: 'Permanganato oxidando íons Ferro(II) em meio ácido',
    equacao_desbalanceada: 'Fe²⁺(aq) + MnO₄⁻(aq) + H⁺(aq) → Fe³⁺(aq) + Mn²⁺(aq) + H₂O(l)',
    ambiente: 'acido',
    oxidacao_estados: {
      Fe: { inicial: 2, final: 3 },
      Mn: { inicial: 7, final: 2 },
    },
    semireacoes: {
      oxidacao: { especie: 'Fe²⁺', estado_inicial: 2, estado_final: 3, mudanca: 1, eletrons: 1, equacao: 'Fe²⁺ → Fe³⁺ + e⁻' },
      reducao: { especie: 'MnO₄⁻', estado_inicial: 7, estado_final: 2, mudanca: 5, eletrons: 5, equacao: 'MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O' },
    },
    coeficientes: { Fe2: 5, MnO4: 1, H: 8, Fe3: 5, Mn2: 1, H2O: 4 },
    equacao_balanceada: '5 Fe²⁺(aq) + MnO₄⁻(aq) + 8 H⁺(aq) → 5 Fe³⁺(aq) + Mn²⁺(aq) + 4 H₂O(l)',
    dificuldade: 'intermediaria',
    descricao: 'Titulação redox clássica: o permanganato (roxo intenso, Mn⁺⁷) é reduzido a Mn²⁺ (quase incolor) ao oxidar o Fe²⁺ a Fe³⁺. A viragem de cor (roxo → incolor) marca o ponto final da titulação sem indicador externo.',
    aplicacao: 'Permanganatometria — determinação quantitativa da concentração de Fe²⁺ em amostras (análise volumétrica).',
    fonte: 'Brown et al. (2012), Cap. 20 (titulação redox); dado consistente com o campo `reacao` do composto KMnO₄ e o campo `curiosidade` do composto FeSO₄ em CATALOGO_SIQI.',
  },

];
