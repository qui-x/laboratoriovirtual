// ══════════════════════════════════════════════════════════════════
// MECÂNICA A — Soluções (origem: SISOL)
// Preparo: C = m/V e M = C/MM com limite de solubilidade a 25 °C
// (excesso → corpo de fundo). Diluição: C₁V₁ = C₂V₂ (massa de soluto
// conservada). Mistura (mesmo soluto): C_f = (C₁V₁+C₂V₂)/(V₁+V₂).
// Curvas: interpolação linear nas tabelas reais (dados no arquivo de
// dados) — abaixo da curva insaturada, sobre a curva saturada, acima
// corpo de fundo.
// ══════════════════════════════════════════════════════════════════
SISOL.MechA = class MechA {
  constructor(D) {
    this.D = D;
    this.mode = 'preparo';
    this.mix = {
      item: D.MISTURAS[0],
      resposta: null,
      acertos: 0,
      tentativas: 0,
      feedback: null,
      particulas: [],
      lente: false
    };
    this.prep = {
      sol: D.SOLUTOS[0],
      massa: 30,
      vol: 250,
      temp: 25,
      p: 0,
      dissolving: false,
      done: false,
      erro: 0,
      part: []
    };
    this.dil = {
      op: 'diluir',
      c1: 1.2,
      v1: 200,
      vagua: 200,
      c2: .4,
      v2: 200,
      q: 0,
      running: false,
      done: false,
      droplets: [],
      ripples: [],
      droplets2: [],
      ripples2: []
    };
    this.cur = {
      sal: D.SOLUBILIDADE[0],
      T: 20,
      m: 60,
      resposta: null,
      acertos: 0,
      tentativas: 0,
      feedback: null,
      zoom: false
    };
    this.fase = 0;
  }
  build() {
    SISOL.fillOptGrid('mix-grid', this.D.MISTURAS.map(s => ({
      value: s.id,
      nome: s.nome,
      dot: s.dot || s.cor
    })), this.mix.item.id);
    SISOL.fillOptGrid('preparo-grid', this.D.SOLUTOS.map(s => ({
      value: s.id,
      nome: s.nome,
      dot: s.dot,
      extra: `${SISOL.fmt(s.M, 2)} g/mol`,
      aria: `${s.nome}, massa molar ${SISOL.fmt(s.M, 2)} gramas por mol`
    })), this.prep.sol.id);
    SISOL.fillOptGrid('curvas-grid', this.D.SOLUBILIDADE.map(s => ({
      value: s.id,
      nome: s.nome,
      dot: s.cor,
      extra: s.g[10] > s.g[0] + 2 ? '↑ com T' : s.g[10] < s.g[0] - 2 ? '↓ com T' : '≈ estável'
    })), this.cur.sal.id);
    this._syncPrepMassaMax();
    this._initMixParticulas();
  }

  /** (Re)popula as partículas visuais da mistura selecionada, com posições
   *  iniciais espalhadas — a física de sedimentação/Browniano acontece no
   *  update(). */
  _initMixParticulas() {
    const item = this.mix.item;
    const n = item.tipo === 'solucao' ? 0 : item.tipo === 'coloide' ? 26 : 16;
    this.mix.particulas = Array.from({
      length: n
    }, (_, i) => ({
      x: Math.sin(i * 12.9) * .5 + .5,
      y: (Math.cos(i * 7.3) * .5 + .5) * .7,
      assentada: false
    }));
  }

  /** Solubilidade do soluto do PREPARO na temperatura atual (interpolada
   *  na mesma curva de 11 pontos usada no modo Curvas). */
  _solTPrep() {
    const c = this.prep.sol.curva;
    return SISOL.kInterp(c.map((y, i) => [i * 10, y]), this.prep.temp);
  }

  /** O limite de solubilidade depende do soluto, do volume E AGORA TAMBÉM
   *  da temperatura ao mesmo tempo (limite = sol(T) · vol / 100) — por
   *  isso o teto do slider de massa é recalculado sempre que qualquer um
   *  dos três mudar, e não fica travado num valor fixo. */
  _syncPrepMassaMax() {
    const P = this.prep;
    const limite = this._solTPrep() * P.vol / 100;
    const novoMax = Math.max(60, Math.ceil(limite * 1.8 / 10) * 10);
    const inp = document.getElementById('prep-massa');
    if (inp && Number(inp.max) !== novoMax) {
      inp.max = novoMax;
      if (P.massa > novoMax) {
        P.massa = novoMax;
        this.app.syncSlider('prep-massa', novoMax);
      }
    }
  }
  setMode(id) {
    this.mode = id;
  }
  setParam(k, v) {
    const P = this.prep,
      L = this.dil,
      C = this.cur,
      X = this.mix;
    switch (k) {
      case 'mixItem':
        {
          X.item = this.D.MISTURAS.find(s => s.id === v);
          X.resposta = null;
          X.feedback = null;
          this._initMixParticulas();
          return {
            say: `Observando: ${X.item.nome}. Repare no feixe de luz e se as partículas sedimentam.`
          };
        }
      case 'soluto':
        {
          P.sol = this.D.SOLUTOS.find(s => s.id === v);
          P.p = 0;
          P.done = false;
          P.part.length = 0;
          this._syncPrepMassaMax();
          return {
            say: `${P.sol.nome} selecionado. Solubilidade a ${SISOL.fmt(P.temp, 0)} graus: ${SISOL.fmt(this._solTPrep(), 1)} gramas por 100 gramas de água.`
          };
        }
      case 'massa':
        P.massa = v;
        P.done = false;
        return;
      case 'vol':
        P.vol = v;
        P.done = false;
        this._syncPrepMassaMax();
        return;
      case 'temp':
        {
          P.temp = v;
          P.done = false;
          this._syncPrepMassaMax();
          return {
            say: `Temperatura ajustada para ${SISOL.fmt(v, 0)} graus. Nova solubilidade: ${SISOL.fmt(this._solTPrep(), 1)} gramas por 100 gramas de água.`
          };
        }
      case 'op':
        {
          L.op = v;
          L.q = 0;
          L.done = false;
          document.getElementById('row-dil-agua').hidden = v !== 'diluir';
          document.getElementById('row-dil-c2').hidden = v !== 'misturar';
          return {
            say: v === 'diluir' ? 'Operação: diluir com água pela torneira.' : 'Operação: misturar duas soluções de KMnO₄ pelas torneiras.'
          };
        }
      case 'c1':
        L.c1 = v;
        L.q = 0;
        return;
      case 'v1':
        L.v1 = v;
        L.q = 0;
        return;
      case 'vagua':
        L.vagua = v;
        L.q = 0;
        return;
      case 'c2':
        L.c2 = v;
        L.q = 0;
        return;
      case 'v2':
        L.v2 = v;
        L.q = 0;
        return;
      case 'sal':
        {
          C.sal = this.D.SOLUBILIDADE.find(s => s.id === v);
          C.resposta = null;
          C.feedback = null;
          const maxSal = Math.max(...C.sal.g);
          const novoMax = maxSal > 230 ? Math.ceil(maxSal * 1.15 / 50) * 50 : 250;
          const inpMassa = document.getElementById('cur-massa');
          if (inpMassa && Number(inpMassa.max) !== novoMax) {
            inpMassa.max = novoMax;
            if (C.m > novoMax) {
              C.m = novoMax;
              this.app.syncSlider('cur-massa', novoMax);
            }
          }
          return {
            say: `${C.sal.nome} selecionado. Solubilidade a ${SISOL.fmt(C.T, 0)} graus: ${SISOL.fmt(this._solT(), 1)} gramas por 100 gramas de água. Compare com a massa escolhida.`
          };
        }
      case 't':
        C.T = v;
        C.resposta = null;
        return;
      case 'mcur':
        C.m = v;
        C.resposta = null;
        return;
    }
  }
  action(name) {
    const P = this.prep,
      L = this.dil,
      C = this.cur,
      X = this.mix;
    if (name === 'dica-mix') {
      SISOL.announce('Dica: se o feixe de luz não aparece, é solução. Se aparece mas nada sedimenta, é colóide. Se sedimenta com o tempo, é suspensão.');
    } else if (name === 'toggle-lente') {
      X.lente = !X.lente;
      SISOL.announce(X.lente ? 'Lente de observação ligada.' : 'Lente de observação desligada.');
    } else if (name === 'resp-solucao' || name === 'resp-coloide' || name === 'resp-suspensao') {
      const mapa = {
        'resp-solucao': 'solucao',
        'resp-coloide': 'coloide',
        'resp-suspensao': 'suspensao'
      };
      const nomes = {
        solucao: 'solução verdadeira',
        coloide: 'colóide',
        suspensao: 'suspensão'
      };
      const escolha = mapa[name],
        certo = escolha === X.item.tipo;
      X.tentativas++;
      if (certo) X.acertos++;
      X.resposta = escolha;
      X.feedback = {
        ok: certo,
        t: this.fase
      };
      SISOL.playTone(certo ? 880 : 300, .12, .07);
      SISOL.announce(certo ? `Certo! ${X.item.nome} é ${nomes[X.item.tipo]} — ${X.item.contexto}` : `Não foi dessa vez — ${X.item.nome} é, na verdade, ${nomes[X.item.tipo]}. ${X.item.contexto}`, 'assertive');
    } else if (name === 'dissolver') {
      P.p = 0;
      P.done = false;
      P.dissolving = true;
      // margem de erro experimental (±3%), como aconteceria com vidraria e
      // balança reais — sorteada de novo a cada tentativa de dissolução
      P.erro = (Math.random() * 2 - 1) * 0.03;
      if (SISOL.isReduced()) P.p = 1;
      SISOL.playTone(700, .08, .06);
      SISOL.announce(`Dissolvendo ${SISOL.fmt(P.massa, 0)} gramas de ${P.sol.nome} em ${SISOL.fmt(P.vol, 0)} mililitros de água a ${SISOL.fmt(P.temp, 0)} graus.`);
    } else if (name === 'prep-reset') {
      P.massa = 30;
      P.vol = 250;
      P.temp = 25;
      P.p = 0;
      P.done = false;
      P.dissolving = false;
      P.erro = 0;
      P.part.length = 0;
      this.app.syncSlider('prep-massa', 30);
      this.app.syncSlider('prep-vol', 250);
      this.app.syncSlider('prep-temp', 25);
      this._syncPrepMassaMax();
      SISOL.playTone(440, .07, .05);
      SISOL.announce('Preparo reiniciado: 30 gramas em 250 mililitros, 25 graus — resultados zerados.');
    } else if (name === 'aplicar') {
      L.q = 0;
      L.done = false;
      L.running = true;
      if (SISOL.isReduced()) L.q = 1;
      SISOL.playTone(700, .08, .06);
      SISOL.announce(L.op === 'diluir' ? 'Torneiras abertas: solução e água escoando para o béquer maior.' : 'Torneiras abertas: as duas soluções escoando para o béquer maior.');
    } else if (name === 'dil-reset') {
      Object.assign(L, {
        c1: 1.2,
        v1: 200,
        vagua: 200,
        c2: .4,
        v2: 200,
        q: 0,
        running: false,
        done: false
      });
      L.droplets.length = 0;
      L.ripples.length = 0;
      L.droplets2.length = 0;
      L.ripples2.length = 0;
      ['dil-c1', 'dil-v1', 'dil-vagua', 'dil-c2', 'dil-v2'].forEach((id, i) => this.app.syncSlider(id, [1.2, 200, 200, .4, 200][i]));
      SISOL.playTone(440, .07, .05);
      SISOL.announce('Diluição reiniciada.');
    } else if (name === 'dica') {
      SISOL.announce('Dica: compare a linha pontilhada (massa escolhida) com a altura da curva na temperatura marcada — está acima, sobre, ou abaixo dela?');
    } else if (name === 'toggle-zoom-curvas') {
      C.zoom = !C.zoom;
      SISOL.announce(C.zoom ? 'Lente de perto ligada.' : 'Lente de perto desligada.');
    } else if (name === 'resp-insat' || name === 'resp-sat' || name === 'resp-corpo') {
      const mapa = {
        'resp-insat': 'insat',
        'resp-sat': 'sat',
        'resp-corpo': 'corpo'
      };
      const nomes = {
        insat: 'insaturada',
        sat: 'saturada',
        corpo: 'com corpo de fundo'
      };
      const escolha = mapa[name],
        r = this._classe(),
        certo = escolha === r.tipo;
      C.tentativas++;
      if (certo) C.acertos++;
      C.resposta = escolha;
      C.feedback = {
        ok: certo,
        t: this.fase
      };
      SISOL.playTone(certo ? 880 : 300, .12, .07);
      SISOL.announce(certo ? `Certo! A solução está ${r.nome}. ${r.det}` : `Não foi dessa vez — na verdade está ${nomes[r.tipo]}. ${r.det}`, 'assertive');
    }
  }

  /* ── contas ── */
  _prepCalc() {
    const P = this.prep,
      e = SISOL.easeIO(SISOL.clamp(P.p, 0, 1));
    const limite = this._solTPrep() * P.vol / 100; // g dissolvíveis nesse volume E temperatura
    const dissMax = Math.min(P.massa, limite);
    const diss = dissMax * e;
    const corpo = P.massa - diss;
    const VL = P.vol / 1000;
    const err = 1 + (P.erro || 0);
    const C = diss / VL,
      M = C / P.sol.M;

    // ── UNIDADES QUE FALTAVAM ──
    // O simulador tinha C (g/L), M (mol/L), W (mol/kg) e fração molar, mas nao
    // titulo, porcentagem em massa nem ppm — conversoes cobradas em prova, e
    // que sao apenas contas sobre dados que ja estavam todos aqui.
    //
    // A massa de SOLUCAO e a soma do soluto dissolvido com a do solvente. A
    // agua e aproximada por 1,00 g/mL (densidade a 25 °C = 0,997), aproximacao
    // padrao em exercicio de ensino medio; o desvio e de 0,3 %.
    const mSolvente = P.vol * 1.0; // g de agua
    const mSolucao = mSolvente + diss; // g de solucao
    const titulo = mSolucao > 0 ? diss / mSolucao : 0; // adimensional
    const ppm = titulo * 1e6; // mg de soluto por kg de solucao
    // densidade da solucao: sobe com o soluto dissolvido, porque a massa cresce
    // e o volume, nesta aproximacao, nao
    const dSolucao = P.vol > 0 ? mSolucao / P.vol : 1; // g/mL
    // molalidade: mol de soluto por QUILO de solvente (nao de solucao)
    const molalidade = mSolvente > 0 ? diss / P.sol.M / (mSolvente / 1000) : 0;
    return {
      limite,
      dissMax,
      diss,
      corpo,
      Cnom: P.massa / VL,
      C,
      Cexp: C * err,
      M,
      Mexp: M * err,
      satFrac: limite > 0 ? diss / limite : 0,
      mSolvente,
      mSolucao,
      titulo,
      pct: titulo * 100,
      ppm,
      dSolucao,
      molalidade,
      nMol: diss / P.sol.M
    };
  }
  _dilCalc() {
    const L = this.dil,
      e = SISOL.easeIO(SISOL.clamp(L.q, 0, 1));
    if (L.op === 'diluir') {
      const V2 = L.v1 + L.vagua,
        C2 = L.c1 * L.v1 / V2;
      return {
        e,
        V2,
        C2,
        Cnow: L.c1 * L.v1 / (L.v1 + L.vagua * e),
        Vnow: L.v1 + L.vagua * e,
        fator: V2 / L.v1
      };
    }
    const Vf = L.v1 + L.v2,
      Cf = (L.c1 * L.v1 + L.c2 * L.v2) / Vf;
    return {
      e,
      Vf,
      Cf,
      m1: L.c1 * L.v1 / 1000,
      m2: L.c2 * L.v2 / 1000
    };
  }
  _solT() {
    const g = this.cur.sal.g;
    return SISOL.kInterp(g.map((y, i) => [i * 10, y]), this.cur.T);
  }
  _classe() {
    const s = this._solT(),
      m = this.cur.m,
      d = m - s;
    if (d > 0.5) return {
      tipo: 'corpo',
      nome: 'saturada com corpo de fundo',
      det: `Excesso não dissolvido: ${SISOL.fmt(d, 1)} g.`
    };
    if (d >= -0.5) return {
      tipo: 'sat',
      nome: 'saturada',
      det: 'A massa coincide com o coeficiente de solubilidade.'
    };
    return {
      tipo: 'insat',
      nome: 'insaturada',
      det: `Ainda cabem ${SISOL.fmt(-d, 1)} g até saturar.`
    };
  }
  update(dt) {
    const P = this.prep,
      L = this.dil;
    this.fase += dt;
    // sedimentação real das partículas de uma SUSPENSÃO (colóides e soluções
    // não sedimentam — colóide só balança com o movimento Browniano, feito
    // direto no desenho; solução não tem partículas visíveis)
    if (this.mix.item.tipo === 'suspensao') {
      this.mix.particulas.forEach(p => {
        if (!p.assentada) {
          p.y += dt * 0.12;
          if (p.y >= 0.92) {
            p.y = 0.92;
            p.assentada = true;
          }
        }
      });
    }
    if (P.dissolving) {
      P.p = Math.min(1, P.p + dt / 1.6);
      if (P.p >= 1 && !P.done) {
        P.done = true;
        P.dissolving = false;
        const c = this._prepCalc();
        SISOL.playTone(c.corpo > 0.2 ? 420 : 880, .12, .06);
        SISOL.announce(c.corpo > 0.2 ? `Saturou! Dissolveram ${SISOL.fmt(c.diss, 1)} g; ${SISOL.fmt(c.corpo, 1)} g ficaram como corpo de fundo. Concentração real: ${SISOL.fmt(c.C, 1)} g/L.` : `Tudo dissolvido. C = ${SISOL.fmt(c.C, 1)} g/L; molaridade = ${SISOL.fmt(c.M, 3)} mol/L.`, 'assertive');
      }
    }
    if (L.running) {
      L.q = Math.min(1, L.q + dt / 1.8);
      if (L.q >= 1 && !L.done) {
        L.done = true;
        L.running = false;
        const d = this._dilCalc();
        SISOL.playTone(880, .12, .06);
        SISOL.announce(L.op === 'diluir' ? `Diluição concluída: C₂ = ${SISOL.fmt(d.C2, 2)} g/L em ${SISOL.fmt(d.V2, 0)} mL (diluiu ${SISOL.fmt(d.fator, 1)} vez).` : `Mistura concluída: C final = ${SISOL.fmt(d.Cf, 2)} g/L em ${SISOL.fmt(d.Vf, 0)} mL.`, 'assertive');
      }
    }
    if (this.mode === 'preparo' && P.box) {
      const c = this._prepCalc();
      SISOL.kParticles(P.part, Math.round(SISOL.clamp(c.diss * 1.1, 0, 64)), P.box, 26, dt);
    }
    // gotas caindo + ondulações nas DUAS torneiras enquanto o líquido escoa
    // para o béquer maior — vale tanto para diluir (soluto + água) quanto
    // para misturar (solução A + solução B)
    if (this.mode === 'diluicao' && L.running && !SISOL.isReduced()) {
      if (L.dropX != null) SISOL.kDrops(L.droplets, dt, {
        x: L.dropX,
        y: L.dropY0,
        targetY: L.dropTarget,
        rate: 14
      });
      if (L.drop2X != null) SISOL.kDrops(L.droplets2, dt, {
        x: L.drop2X,
        y: L.drop2Y0,
        targetY: L.drop2Target,
        rate: 14
      });
      if (Math.random() < 7 * dt) L.ripples.push({
        r: 2,
        a: .55
      });
      if (Math.random() < 7 * dt) L.ripples2.push({
        r: 2,
        a: .55
      });
    }
    L.ripples.forEach(r => {
      r.r += 46 * dt;
      r.a -= dt * 0.75;
    });
    L.ripples = L.ripples.filter(r => r.a > 0.02);
    L.ripples2.forEach(r => {
      r.r += 46 * dt;
      r.a -= dt * 0.75;
    });
    L.ripples2 = L.ripples2.filter(r => r.a > 0.02);
  }

  /* ── desenho ── */
  draw(ctx, W, H, app) {
    if (this.mode === 'classificacao') this._drawMix(ctx, W, H);else if (this.mode === 'preparo') this._dPreparo(ctx, W, H, app);else if (this.mode === 'diluicao') this._dDil(ctx, W, H, app);else this._dCurvas(ctx, W, H);
  }

  /** Béquer + feixe de luz atravessando (efeito Tyndall) + partículas —
   *  a chave visual para diferenciar solução (feixe invisível, sem
   *  partículas), colóide (feixe visível, partículas suspensas com
   *  tremor Browniano) e suspensão (partículas sedimentando com o tempo). */
  _drawMix(ctx, W, H) {
    const X = this.mix,
      item = X.item;
    const estreito = W < 620;
    // margem reservada pro feixe+lanterna à ESQUERDA do béquer — cresce e
    // encolhe com o canvas, nunca fixa, pra nunca sair da área visível
    const margemFeixe = SISOL.clamp(W * .13, 34, 66);
    // sem a lente (padrão), o béquer fica mais centralizado e maior; com a
    // lente ligada, ele volta pra esquerda pra abrir espaço pra ela
    const bw = SISOL.clamp(W * (X.lente ? .24 : .3), estreito ? 120 : 170, X.lente ? 280 : 340);
    const bh = estreito ? Math.min(H * .38, 240) : Math.min(H * .7, 420);
    const cxPadrao = X.lente ? estreito ? W * .34 : W * .24 : W * .38;
    const cx = Math.max(cxPadrao, margemFeixe + bw / 2 + 20);
    const top = estreito ? H * .07 : H * .12;
    const box = SISOL.kBeaker(ctx, cx, top, bw, bh, .82, item.cor, {
      alpha: item.tipo === 'suspensao' ? .5 : .28,
      rotulo: item.nome
    });

    // feixe de luz entrando pela lateral esquerda do béquer
    const ly = top + bh * .42;
    const temFeixeVisivel = item.tipo !== 'solucao';
    ctx.save();
    ctx.strokeStyle = SISOL.cssVar('--accent-amber', '#fbbf24');
    ctx.lineWidth = temFeixeVisivel ? item.tipo === 'suspensao' ? 5 : 3 : 1;
    ctx.globalAlpha = item.tipo === 'solucao' ? .06 : item.tipo === 'suspensao' ? .35 : .8;
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2 - margemFeixe, ly);
    ctx.lineTo(cx + bw / 2 - 6, ly);
    ctx.stroke();
    ctx.restore();
    // lanterna
    ctx.save();
    ctx.fillStyle = SISOL.cssVar('--text-muted');
    ctx.fillRect(cx - bw / 2 - margemFeixe - 20, ly - 10, 22, 20);
    ctx.restore();
    SISOL.kLabel(ctx, temFeixeVisivel ? 'feixe visível (Tyndall)' : 'feixe invisível', cx - bw / 2 - margemFeixe, ly - 16, {
      size: 9,
      align: 'left',
      color: SISOL.cssVar('--text-secondary')
    });

    // partículas: paradas+Brownianas (colóide) ou sedimentando (suspensão)
    ctx.save();
    X.particulas.forEach((p, i) => {
      const jitterX = item.tipo === 'coloide' && !SISOL.isReduced() ? Math.sin(this.fase * 1.6 + i * 3.1) * 3 : 0;
      const px = cx - bw / 2 + 10 + p.x * (bw - 20) + jitterX;
      const py = top + bh * .12 + p.y * (bh * .8);
      ctx.fillStyle = item.dot || item.cor;
      ctx.globalAlpha = .85;
      ctx.beginPath();
      ctx.arc(px, py, item.tipo === 'suspensao' ? 3.2 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    if (item.tipo === 'suspensao' && X.particulas.some(p => p.assentada)) {
      SISOL.kLabel(ctx, 'sedimentando no fundo', cx, top + bh + 22, {
        size: 10,
        color: SISOL.cssVar('--text-secondary')
      });
    }

    // confirmação visual simples: um X/✓ grande junto ao béquer — sem placar,
    // só a confirmação de acerto do ponto (tipo) escolhido
    if (X.resposta) {
      const certo = X.resposta === item.tipo;
      const nomes = {
        solucao: 'solução verdadeira',
        coloide: 'colóide',
        suspensao: 'suspensão'
      };
      ctx.save();
      const corVeredito = certo ? SISOL.cssVar('--accent-ok', '#4ade80') : SISOL.cssVar('--accent-exo', '#f87171');
      (certo ? SISOL.kIconCheck : SISOL.kIconX)(ctx, cx, Math.max(26, top - 26), 30, corVeredito);
      ctx.restore();
      if (!certo) SISOL.kLabel(ctx, `era ${nomes[item.tipo]}`, cx, Math.max(26, top - 26) + 20, {
        size: 10,
        color: SISOL.cssVar('--accent-exo')
      });
    }
    if (X.feedback && this.fase - X.feedback.t < 1.2 && !SISOL.isReduced()) {
      const alpha = 1 - (this.fase - X.feedback.t) / 1.2;
      ctx.save();
      ctx.globalAlpha = alpha * .5;
      ctx.lineWidth = 4;
      ctx.strokeStyle = X.feedback.ok ? SISOL.cssVar('--accent-ok') : SISOL.cssVar('--accent-exo');
      ctx.beginPath();
      ctx.arc(cx, top + bh / 2, bw / 2 + 10 + (1 - alpha) * 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ── lente de observação: alternativa OPCIONAL (botão "Ver de perto" na
    // barra lateral) — ao LADO em telas largas, EMBAIXO em telas estreitas ──
    if (!X.lente) return;
    const lx = estreito ? W * .5 : W * .68;
    const lyC = estreito ? top + bh + Math.min(H * .2, 100) + 30 : H * .46;
    const lr = estreito ? SISOL.clamp(Math.min(W * .34, (H - lyC) * .8), 46, 100) : Math.min(W * .26, H * .38, 260);
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, lyC, lr, 0, Math.PI * 2);
    ctx.fillStyle = SISOL.cssVar('--bg-panel2', '#101c2b');
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = SISOL.cssVar('--border');
    ctx.stroke();
    ctx.clip();
    if (item.tipo === 'solucao') {
      // nada visível: só o fundo liso, feixe invisível
      ctx.globalAlpha = .05;
      ctx.strokeStyle = SISOL.cssVar('--accent-amber');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - lr, lyC);
      ctx.lineTo(lx + lr, lyC);
      ctx.stroke();
    } else if (item.tipo === 'coloide') {
      // feixe brilhante espalhado, com pontinhos de luz ao redor do trajeto
      ctx.globalAlpha = .9;
      ctx.strokeStyle = SISOL.cssVar('--accent-amber');
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(lx - lr, lyC);
      ctx.lineTo(lx + lr, lyC);
      ctx.stroke();
      ctx.fillStyle = SISOL.cssVar('--accent-amber');
      for (let i = 0; i < 22; i++) {
        const t = (i / 22 + (SISOL.isReduced() ? 0 : this.fase * .05)) % 1;
        const px = lx - lr + t * lr * 2,
          py = lyC + Math.sin(this.fase * 2 + i) * 5;
        ctx.globalAlpha = .5;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // suspensão: praticamente opaca, feixe curto e absorvido logo na entrada
      ctx.globalAlpha = .85;
      ctx.fillStyle = item.dot || item.cor;
      ctx.beginPath();
      ctx.arc(lx, lyC, lr, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = .8;
      ctx.strokeStyle = SISOL.cssVar('--accent-amber');
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(lx - lr, lyC);
      ctx.lineTo(lx - lr * .35, lyC);
      ctx.stroke();
    }
    ctx.restore();
    SISOL.kLabel(ctx, 'de perto', lx, lyC - lr - 12, {
      size: 10,
      color: SISOL.cssVar('--text-secondary')
    });
  }
  _corSolucao(sol, satFrac) {
    if (sol.cor) return {
      cor: sol.cor,
      alpha: .10 + .70 * SISOL.clamp(satFrac, 0, 1)
    };
    return {
      cor: SISOL.cssVar('--accent-endo', '#38bdf8'),
      alpha: .13
    };
  }
  _dPreparo(ctx, W, H, app) {
    const P = this.prep,
      c = this._prepCalc();
    const bw = SISOL.clamp(W * .34, 150, 250),
      bh = H * .56,
      top = H * .16,
      cx = W * .36;
    const tint = this._corSolucao(P.sol, c.satFrac);
    const box = SISOL.kBeaker(ctx, cx, top, bw, bh, P.vol / 1000, tint.cor, {
      alpha: tint.alpha,
      rotulo: `${SISOL.fmt(P.vol, 0)} mL de água`
    });
    P.box = {
      x: box.x + 6,
      y: box.y + 6,
      w: box.w - 12,
      h: Math.max(10, box.h - 12)
    };
    SISOL.kDrawParticles(ctx, P.part, 2.3, P.sol.dot, .85);
    if (c.corpo > 0.15 && box.h > 4) {
      // corpo de fundo como pilha granular (não mais uma única blob lisa)
      const nGraos = SISOL.clamp(Math.round(6 + c.corpo * 0.5), 6, 42);
      const baseY = top + bh - 4,
        spanX = bw * 0.36;
      const pilha = SISOL.clamp(c.corpo / 35, 0.15, 1);
      ctx.save();
      ctx.fillStyle = P.sol.dot;
      for (let i = 0; i < nGraos; i++) {
        const seed = i * 12.9898;
        const rx = Math.sin(seed) * 0.94;
        const rr = 2 + (Math.cos(seed * 1.7) * .5 + .5) * 3;
        const gx = cx + rx * spanX;
        const gy = baseY - Math.abs(Math.sin(seed * 2.3)) * (6 + pilha * 12) * (1 - Math.abs(rx) * .4);
        ctx.globalAlpha = .8 + .18 * Math.sin(seed);
        ctx.beginPath();
        ctx.ellipse(gx, gy, rr, rr * .78, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      SISOL.kChip(ctx, `corpo de fundo · ${SISOL.fmt(c.corpo, 1)} g`, cx, top + bh + 30, {
        fg: SISOL.cssVar('--accent-exo'),
        size: 10
      });
    }
    // pó caindo + redemoinho de agitação durante a dissolução
    if (P.dissolving && !SISOL.isReduced()) {
      ctx.save();
      ctx.fillStyle = P.sol.dot;
      for (let i = 0; i < 8; i++) {
        const yy = top - 14 + (app.time * 90 + i * 23) % (box.y - top + 18);
        ctx.globalAlpha = .8;
        ctx.fillRect(cx - 16 + i % 5 * 8, yy, 2.6, 2.6);
      }
      ctx.restore();
      ctx.save();
      ctx.translate(cx, box.surfaceY + 14);
      ctx.rotate(app.time * 2.4);
      ctx.strokeStyle = SISOL.cssVar('--accent-endo');
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = .5;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0.3, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }

    // painel-medidor: massa × limite de solubilidade — agora com as DUAS
    // zonas da barra rotuladas diretamente (dissolvido / corpo de fundo),
    // pra a equivalência "passou do limite → vira corpo de fundo" ficar
    // óbvia olhando só a barra, sem precisar ler o texto de baixo.
    const gx = W * .58,
      gw = SISOL.clamp(W * .36, 200, 320),
      gy = H * .3,
      barH = 24;
    const maxG = Math.max(150, c.limite * 1.15);
    const wOK = SISOL.clamp(Math.min(P.massa, c.limite) / maxG, 0, 1) * gw;
    const wExcesso = P.massa > c.limite ? SISOL.clamp((P.massa - c.limite) / maxG, 0, 1) * gw : 0;
    SISOL.kLabel(ctx, `Saturação a ${SISOL.fmt(P.temp, 0)} °C`, gx + gw / 2, gy - 32, {
      size: 13,
      bold: true,
      color: SISOL.cssVar('--text-primary')
    });
    ctx.save();
    ctx.fillStyle = SISOL.cssVar('--bg-panel2', '#101c2b');
    SISOL.kRound(ctx, gx, gy, gw, barH, 10);
    ctx.fill();
    ctx.fillStyle = SISOL.cssVar('--accent-ok');
    SISOL.kRound(ctx, gx, gy, Math.max(wOK, 2), barH, wExcesso > 0 ? 0 : 10);
    ctx.fill();
    if (wExcesso > 0) {
      ctx.fillStyle = SISOL.cssVar('--accent-exo');
      SISOL.kRound(ctx, gx + wOK, gy, wExcesso, barH, 10);
      ctx.fill();
    }
    // linha tracejada exatamente no limite de solubilidade
    const xl = gx + SISOL.clamp(c.limite / maxG, 0, 1) * gw;
    ctx.strokeStyle = SISOL.cssVar('--accent-amber');
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(xl, gy - 9);
    ctx.lineTo(xl, gy + barH + 9);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    SISOL.kLabel(ctx, `limite: ${SISOL.fmt(c.limite, 1)} g`, xl, gy - 15, {
      size: 10,
      color: SISOL.cssVar('--accent-amber'),
      mono: true,
      bold: true
    });

    // rótulos de zona, cada um centrado embaixo do próprio pedaço da barra
    if (wOK > 34) SISOL.kLabel(ctx, `dissolvido · ${SISOL.fmt(Math.min(P.massa, c.limite), 1)} g`, gx + wOK / 2, gy + barH + 16, {
      size: 10,
      color: SISOL.cssVar('--accent-ok'),
      bold: true
    });
    if (wExcesso > 34) SISOL.kLabel(ctx, `corpo de fundo · ${SISOL.fmt(P.massa - c.limite, 1)} g`, gx + wOK + wExcesso / 2, gy + barH + 16, {
      size: 10,
      color: SISOL.cssVar('--accent-exo'),
      bold: true
    });else if (wExcesso > 0) SISOL.kLabel(ctx, `+ corpo de fundo: ${SISOL.fmt(P.massa - c.limite, 1)} g`, gx + gw + 6, gy + barH / 2, {
      size: 10,
      align: 'left',
      color: SISOL.cssVar('--accent-exo'),
      bold: true
    });
    let yy = gy + barH + 40;
    SISOL.kChip(ctx, `C real = ${SISOL.fmt(c.C, 1)} g/L`, gx + gw / 2, yy, {
      fg: SISOL.cssVar('--accent-amber'),
      bold: true,
      size: 12
    });
    yy += 28;
    SISOL.kChip(ctx, `M = ${SISOL.fmt(c.M, 3)} mol/L`, gx + gw / 2, yy, {
      fg: SISOL.cssVar('--text-primary'),
      size: 11
    });
    yy += 30;
    SISOL.kLabel(ctx, c.corpo > .2 ? 'solução SATURADA + corpo de fundo' : c.satFrac > .98 ? 'solução SATURADA' : 'solução insaturada', gx + gw / 2, yy, {
      size: 11,
      color: c.corpo > .2 ? SISOL.cssVar('--accent-exo') : SISOL.cssVar('--accent-ok'),
      bold: true
    });
  }
  _dDil(ctx, W, H, app) {
    const L = this.dil,
      d = this._dilCalc(),
      roxo = this.D.DIL.corMax,
      cRef = this.D.DIL.cRef;
    const bwSrc = SISOL.clamp(W * .16, 86, 130),
      bhSrc = H * .19,
      topSrc = H * .08;
    const bwDest = SISOL.clamp(W * .42, 220, 340),
      bhDest = H * .44,
      topDest = H * .42,
      cxDest = W * .5;
    const lx = cxDest - bwDest * .3,
      rx = cxDest + bwDest * .3;

    // béquer de destino MAIOR — para onde as duas torneiras escoam
    const nivelDest = L.op === 'diluir' ? d.Vnow / 1000 : (L.v1 + L.v2) * d.e / 1000;
    const cAtual = L.op === 'diluir' ? d.Cnow : d.e > 0 ? d.Cf : 0;
    const rotuloDest = L.op === 'diluir' ? `${SISOL.fmt(d.Vnow, 0)} mL` : `${SISOL.fmt((L.v1 + L.v2) * d.e, 0)} mL`;
    const destino = SISOL.kBeaker(ctx, cxDest, topDest, bwDest, bhDest, nivelDest, roxo, {
      alpha: .08 + .72 * SISOL.clamp(cAtual / cRef, 0, 1),
      rotulo: rotuloDest
    });

    // os béqueres de ORIGEM esvaziam de verdade conforme a animação avança
    // (e: 0 → cheios, 1 → vazios) — antes o reservatório de água era só um
    // contorno estático que nunca mudava, então "verter" não parecia nada
    const nivelOrigem = .74 * (1 - d.e);
    if (L.op === 'diluir') {
      // torneira esquerda: solução concentrada C₁V₁, esvaziando
      SISOL.kBeaker(ctx, lx, topSrc, bwSrc, bhSrc, nivelOrigem, roxo, {
        alpha: .1 + .7 * SISOL.clamp(L.c1 / cRef, 0, 1),
        rotulo: `${SISOL.fmt(L.c1, 2)} g/L · ${SISOL.fmt(L.v1 * (1 - d.e), 0)} mL restantes`
      });
      // torneira direita: reservatório de água, também esvaziando
      SISOL.kBeaker(ctx, rx, topSrc, bwSrc, bhSrc, nivelOrigem, SISOL.cssVar('--accent-endo', '#38bdf8'), {
        alpha: .32,
        rotulo: `Água · ${SISOL.fmt(L.vagua * (1 - d.e), 0)} mL restantes`
      });
      L.dropX = lx;
      L.dropY0 = topSrc + bhSrc + 6;
      L.dropTarget = destino.surfaceY;
      L.drop2X = rx;
      L.drop2Y0 = topSrc + bhSrc + 6;
      L.drop2Target = destino.surfaceY;
      SISOL.kTap(ctx, lx, topSrc + bhSrc + 4, L.running, roxo);
      SISOL.kTap(ctx, rx, topSrc + bhSrc + 4, L.running, SISOL.cssVar('--accent-endo'));
    } else {
      SISOL.kBeaker(ctx, lx, topSrc, bwSrc, bhSrc, nivelOrigem, roxo, {
        alpha: .1 + .7 * SISOL.clamp(L.c1 / cRef, 0, 1),
        rotulo: `A: ${SISOL.fmt(L.c1, 2)} g/L · ${SISOL.fmt(L.v1 * (1 - d.e), 0)} mL restantes`
      });
      SISOL.kBeaker(ctx, rx, topSrc, bwSrc, bhSrc, nivelOrigem, roxo, {
        alpha: .1 + .7 * SISOL.clamp(L.c2 / cRef, 0, 1),
        rotulo: `B: ${SISOL.fmt(L.c2, 2)} g/L · ${SISOL.fmt(L.v2 * (1 - d.e), 0)} mL restantes`
      });
      L.dropX = lx;
      L.dropY0 = topSrc + bhSrc + 6;
      L.dropTarget = destino.surfaceY;
      L.drop2X = rx;
      L.drop2Y0 = topSrc + bhSrc + 6;
      L.drop2Target = destino.surfaceY;
      SISOL.kTap(ctx, lx, topSrc + bhSrc + 4, L.running, roxo);
      SISOL.kTap(ctx, rx, topSrc + bhSrc + 4, L.running, roxo);
    }
    if (L.running && !SISOL.isReduced()) {
      // cor das gotas de cada torneira: na diluição, a 1ª é solução (roxo) e
      // a 2ª é água (azul); na mistura, AS DUAS são solução (roxo) — antes a
      // 1ª saía sempre azul por engano, mesmo representando KMnO₄
      const cor1 = roxo,
        cor2 = L.op === 'diluir' ? SISOL.cssVar('--accent-endo') : roxo;
      SISOL.kDrawDrops(ctx, L.droplets, cor1);
      SISOL.kDrawDrops(ctx, L.droplets2, cor2);
      [[L.dropX, L.ripples, cor1], [L.drop2X, L.ripples2, cor2]].forEach(([x, arr, cor]) => {
        ctx.save();
        ctx.strokeStyle = cor;
        ctx.lineWidth = 1.4;
        arr.forEach(r => {
          ctx.globalAlpha = r.a;
          ctx.beginPath();
          ctx.ellipse(x, destino.surfaceY, r.r, r.r * .32, 0, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      });
    }

    // identificação rápida de cada fonte, sem precisar ler o rótulo inteiro
    if (L.op === 'misturar') {
      SISOL.kChip(ctx, 'A', lx, topSrc - 14, {
        fg: roxo,
        bold: true,
        size: 11,
        border: roxo
      });
      SISOL.kChip(ctx, 'B', rx, topSrc - 14, {
        fg: roxo,
        bold: true,
        size: 11,
        border: roxo
      });
    }
    SISOL.kLabel(ctx, L.op === 'diluir' ? 'C₁V₁ = C₂V₂ — massa de soluto se conserva' : 'Cf = (C₁V₁ + C₂V₂)/(V₁+V₂)', cxDest, topDest + bhDest + 40, {
      size: 11,
      color: SISOL.cssVar('--text-secondary')
    });
  }
  _dCurvas(ctx, W, H) {
    const C = this.cur;
    const maxSel = Math.max(...C.sal.g);
    const ymax = maxSel > 230 ? Math.ceil(maxSel * 1.12 / 100) * 100 : 260;
    const passo = ymax > 500 ? 200 : ymax > 260 ? 100 : 50;
    const yticks = [];
    for (let v = 0; v <= ymax; v += passo) yticks.push(v);
    const m = SISOL.kAxes(ctx, {
      x: 58,
      y: 24,
      w: W - 104,
      h: H - 88,
      xmin: 0,
      xmax: 100,
      ymin: 0,
      ymax,
      xticks: [0, 20, 40, 60, 80, 100],
      yticks,
      xlab: 'Temperatura (°C)',
      ylab: 'Solubilidade (g/100 g H₂O)'
    });

    // zonas de fundo relativas ao sal SELECIONADO: abaixo da curva = insaturada,
    // acima = corpo de fundo — torna o significado físico do gráfico visível
    // de cara, não só uma linha abstrata.
    const curvaSel = C.sal.g.map((y, i) => [i * 10, y]);
    ctx.save();
    ctx.beginPath();
    curvaSel.forEach((p, i) => i ? ctx.lineTo(m.px(p[0]), m.py(p[1])) : ctx.moveTo(m.px(p[0]), m.py(p[1])));
    ctx.lineTo(m.px(100), m.py(0));
    ctx.lineTo(m.px(0), m.py(0));
    ctx.closePath();
    ctx.fillStyle = SISOL.cssVar('--accent-ok');
    ctx.globalAlpha = .08;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    curvaSel.forEach((p, i) => i ? ctx.lineTo(m.px(p[0]), m.py(p[1])) : ctx.moveTo(m.px(p[0]), m.py(p[1])));
    ctx.lineTo(m.px(100), m.py(ymax));
    ctx.lineTo(m.px(0), m.py(ymax));
    ctx.closePath();
    ctx.fillStyle = SISOL.cssVar('--accent-exo');
    ctx.globalAlpha = .07;
    ctx.fill();
    ctx.restore();
    SISOL.kLabel(ctx, 'insaturada', m.px(6), m.py(0) - 12, {
      size: 9,
      align: 'left',
      color: SISOL.cssVar('--accent-ok')
    });
    SISOL.kLabel(ctx, 'corpo de fundo', m.px(6), m.py(ymax) + 14, {
      size: 9,
      align: 'left',
      color: SISOL.cssVar('--accent-exo')
    });
    const rotulosCurva = this.D.SOLUBILIDADE.map(s => {
      const sel = s.id === C.sal.id;
      SISOL.kLine(ctx, s.g.map((y, i) => [i * 10, y]), m.px, m.py, {
        color: s.cor,
        w: sel ? 3.2 : 1.6,
        alpha: sel ? 1 : .3
      });
      return {
        s,
        sel,
        x: m.px(100) + 6,
        y: m.py(Math.min(s.g[10], ymax))
      };
    });
    // anti-colisão: com muitos sais, vários acabam com solubilidade parecida
    // a 100 °C — sem isso, os rótulos empilhavam ilegíveis uns sobre os outros
    rotulosCurva.sort((a, b) => a.y - b.y);
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < rotulosCurva.length; i++) {
        for (let j = 0; j < rotulosCurva.length; j++) {
          if (i === j) continue;
          const dy = rotulosCurva[i].y - rotulosCurva[j].y;
          if (Math.abs(dy) < 13 && dy >= 0) rotulosCurva[i].y = rotulosCurva[j].y + 13;
        }
      }
    }
    rotulosCurva.forEach(r => SISOL.kLabel(ctx, r.s.nome, r.x, r.y, {
      size: 10,
      color: r.s.cor,
      align: 'left',
      bold: r.sel,
      mono: true
    }));
    const sT = this._solT();
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = SISOL.cssVar('--text-muted');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.px(C.T), m.py(0));
    ctx.lineTo(m.px(C.T), m.py(Math.max(C.m, sT)));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = C.sal.cor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(m.px(C.T), m.py(sT), 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // marcador da massa atual — cor NEUTRA (não entrega a classificação!) até
    // o estudante responder ao quiz; pulsa suavemente para chamar atenção
    const pulso = SISOL.isReduced() ? 0 : Math.sin(this.fase * 3) * 1.6;
    const corMarcador = C.resposta ? C.feedback && C.feedback.ok ? SISOL.cssVar('--accent-ok') : SISOL.cssVar('--accent-exo') : SISOL.cssVar('--text-primary');
    ctx.save();
    ctx.fillStyle = corMarcador;
    ctx.beginPath();
    ctx.arc(m.px(C.T), m.py(C.m), 6 + pulso, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // confirmação visual simples: ✓/✗ grande junto ao marcador, sem placar
    if (C.resposta) {
      const real = this._classe(),
        certo = C.resposta === real.tipo;
      const nomes = {
        insat: 'insaturada',
        sat: 'saturada',
        corpo: 'corpo de fundo'
      };
      ctx.save();
      ctx.fillStyle = certo ? SISOL.cssVar('--accent-ok', '#4ade80') : SISOL.cssVar('--accent-exo', '#f87171');
      (certo ? SISOL.kIconCheck : SISOL.kIconX)(ctx, m.px(C.T), m.py(C.m) - 24, 26, ctx.fillStyle);
      ctx.restore();
      if (!certo) SISOL.kLabel(ctx, `era ${nomes[real.tipo]}`, m.px(C.T), m.py(C.m) - 42, {
        size: 10,
        color: SISOL.cssVar('--accent-exo')
      });
    }
    // flash de feedback: anel que aparece e esmaece por ~1,2 s após responder
    if (C.feedback && this.fase - C.feedback.t < 1.2 && !SISOL.isReduced()) {
      const alpha = 1 - (this.fase - C.feedback.t) / 1.2;
      ctx.save();
      ctx.globalAlpha = alpha * .6;
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.feedback.ok ? SISOL.cssVar('--accent-ok') : SISOL.cssVar('--accent-exo');
      ctx.beginPath();
      ctx.arc(m.px(C.T), m.py(C.m), 14 + (1 - alpha) * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    SISOL.kLabel(ctx, `curva: ${SISOL.fmt(sT, 1)} g/100 g a ${SISOL.fmt(C.T, 0)} °C`, m.px(C.T), m.py(0) + 26, {
      size: 10,
      color: C.sal.cor,
      mono: true
    });

    // ── lente "de perto": alternativa OPCIONAL que amplia a vizinhança do
    // ponto (T, massa) contra a curva — útil quando os dois estão bem perto
    // e é difícil ver a olho nu se passou ou não da linha ──
    if (!C.zoom) return;
    const estreito = W < 620;
    const lx = estreito ? W * .5 : W * .78;
    const lyC = estreito ? H - Math.min(H * .22, 120) : H * .28;
    const lr = estreito ? SISOL.clamp(Math.min(W * .3, 90), 50, 100) : Math.min(W * .16, H * .22, 130);
    const janela = Math.max(6, ymax * .12); // faixa de massa mostrada na lente, centrada no ponto
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, lyC, lr, 0, Math.PI * 2);
    ctx.fillStyle = SISOL.cssVar('--bg-panel2', '#101c2b');
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = SISOL.cssVar('--border');
    ctx.stroke();
    ctx.clip();
    // reconstrói um mini-eixo Y só com a faixa próxima ao ponto, mesmo eixo X
    const zMin = Math.max(0, C.m - janela),
      zMax = C.m + janela;
    const zPy = v => lyC + lr - (v - zMin) / (zMax - zMin) * (lr * 2);
    const zPx = t => lx - lr + (t - Math.max(0, C.T - 15)) / 30 * (lr * 2);
    SISOL.kLine(ctx, curvaSel.map(p => p), zPx, zPy, {
      color: C.sal.cor,
      w: 3
    });
    ctx.save();
    ctx.fillStyle = corMarcador;
    ctx.beginPath();
    ctx.arc(zPx(C.T), zPy(C.m), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    SISOL.kLabel(ctx, 'de perto', lx, lyC - lr - 12, {
      size: 10,
      color: SISOL.cssVar('--text-secondary')
    });
  }
  getResults() {
    if (this.mode === 'classificacao') {
      const X = this.mix;
      const rows = [{
        l: 'Mistura em observação',
        v: X.item.nome
      }];
      if (X.resposta) {
        const nomes = {
          solucao: 'solução verdadeira',
          coloide: 'colóide',
          suspensao: 'suspensão'
        };
        const certo = X.resposta === X.item.tipo;
        rows.push({
          l: 'Sua resposta',
          v: `${nomes[X.resposta]}${certo ? ' <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>' : ' <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> (era ' + nomes[X.item.tipo] + ')'}`,
          cls: certo ? 'val-ok' : 'val-exo'
        });
        rows.push({
          l: 'Por quê',
          v: X.item.contexto
        });
      }
      return rows;
    }
    if (this.mode === 'preparo') {
      const P = this.prep;
      if (!P.done && !P.dissolving) {
        return [{
          l: 'Soluto',
          v: P.sol.nome.split(' (')[0]
        }, {
          l: 'Massa pesada',
          v: `${SISOL.fmt(P.massa, 0)} g`
        }, {
          l: 'Volume de água',
          v: `${SISOL.fmt(P.vol, 0)} mL`
        }, {
          l: 'Temperatura',
          v: `${SISOL.fmt(P.temp, 0)} °C`
        }, {
          l: 'Estado',
          v: 'aguardando o experimento — pressione "Dissolver"'
        }];
      }
      const c = this._prepCalc(),
        cl = c.corpo > .2 ? 'val-exo' : 'val-ok';
      return [{
        l: 'Soluto',
        v: P.sol.nome.split(' (')[0]
      }, {
        l: 'Massa molar',
        v: `${SISOL.fmt(P.sol.M, 2)} g/mol`
      }, {
        l: 'Soluto dissolvido',
        v: `${SISOL.fmt(c.diss, 2)} g  =  ${SISOL.fmt(c.nMol, 4)} mol`
      }, {
        l: 'Massa de solvente',
        v: `${SISOL.fmt(c.mSolvente, 0)} g de água`
      }, {
        l: 'Massa de solução',
        v: `${SISOL.fmt(c.mSolucao, 1)} g`
      }, /* ── as unidades de concentração, todas a partir dos MESMOS dados ── */
      {
        l: '— Concentração —',
        v: ''
      }, {
        l: 'C teórica (cálculo exato)',
        v: `${SISOL.fmt(c.C, 1)} g/L`
      }, {
        l: 'C real (medida)',
        v: `${SISOL.fmt(c.Cexp, 1)} g/L`,
        cls: 'val-ok'
      }, {
        l: 'Molaridade M = n/V',
        v: `${SISOL.fmt(c.Mexp, 3)} mol/L`
      }, {
        l: 'Molalidade W = n/kg solv.',
        v: `${SISOL.fmt(c.molalidade, 4)} mol/kg`
      }, {
        l: 'Título τ = m_soluto/m_sol.',
        v: SISOL.fmt(c.titulo, 5)
      }, {
        l: 'Porcentagem em massa',
        v: `${SISOL.fmt(c.pct, 3)} % (m/m)`,
        cls: 'val-ok'
      }, {
        l: 'ppm',
        v: `${SISOL.fmt(c.ppm, 0)} ppm`
      }, {
        l: 'Densidade da solução',
        v: `${SISOL.fmt(c.dSolucao, 4)} g/mL`
      }, {
        l: 'Relação C = 1000·d·τ',
        v: `${SISOL.fmt(1000 * c.dSolucao * c.titulo, 1)} g/L (confere com C)`
      }, {
        l: '— Saturação —',
        v: ''
      }, {
        l: 'Incerteza experimental',
        v: `± ${SISOL.fmt(Math.abs(P.erro * 100), 1)} %`
      }, {
        l: `Limite a ${SISOL.fmt(P.temp, 0)} °C`,
        v: `${SISOL.fmt(c.limite, 1)} g`
      }, {
        l: 'Corpo de fundo',
        v: `${SISOL.fmt(Math.max(0, c.corpo), 1)} g`,
        cls: cl
      }];
    }
    if (this.mode === 'diluicao') {
      const L = this.dil,
        d = this._dilCalc();
      if (L.op === 'diluir') return [{
        l: 'Massa de KMnO₄',
        v: `${SISOL.fmt(L.c1 * L.v1 / 1000, 2)} g`
      }, {
        l: 'C₁ · V₁',
        v: `${SISOL.fmt(L.c1, 2)} g/L · ${SISOL.fmt(L.v1, 0)} mL`
      }, {
        l: 'V₂ = V₁ + água',
        v: `${SISOL.fmt(d.V2, 0)} mL`
      }, {
        l: 'C₂ = C₁V₁/V₂',
        v: `${SISOL.fmt(d.C2, 2)} g/L`,
        cls: 'val-ok'
      }, {
        l: 'Fator de diluição',
        v: `${SISOL.fmt(d.fator, 1)}×`
      }];
      return [{
        l: 'Soluto em A',
        v: `${SISOL.fmt(d.m1, 2)} g`
      }, {
        l: 'Soluto em B',
        v: `${SISOL.fmt(d.m2, 2)} g`
      }, {
        l: 'V final',
        v: `${SISOL.fmt(d.Vf, 0)} mL`
      }, {
        l: 'C_f',
        v: `${SISOL.fmt(d.Cf, 2)} g/L`,
        cls: 'val-ok'
      }];
    }
    const C = this.cur,
      sT = this._solT();
    const rows = [{
      l: 'Sal',
      v: C.sal.nome
    }, {
      l: `Solubilidade a ${SISOL.fmt(C.T, 0)} °C`,
      v: `${SISOL.fmt(sT, 1)} g/100 g`
    }, {
      l: 'Massa adicionada',
      v: `${SISOL.fmt(C.m, 0)} g/100 g`
    }];
    if (C.resposta) {
      const nomes = {
        insat: 'insaturada',
        sat: 'saturada',
        corpo: 'corpo de fundo'
      };
      const real = this._classe(),
        certo = C.resposta === real.tipo;
      rows.push({
        l: 'Sua resposta',
        v: `${nomes[C.resposta]}${certo ? ' <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>' : ' <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> (era ' + nomes[real.tipo] + ')'}`,
        cls: certo ? 'val-ok' : 'val-exo'
      });
    }
    return rows;
  }
  getOverlay() {
    if (this.mode === 'classificacao') return this.mix.item.nome;
    if (this.mode === 'preparo') {
      const P = this.prep;
      if (!P.done && !P.dissolving) return `${P.sol.nome.split(' (')[0]} · aguardando`;
      const c = this._prepCalc();
      return `${P.sol.nome.split(' (')[0]} · ${SISOL.fmt(c.Cexp, 1)} g/L`;
    }
    if (this.mode === 'diluicao') return `KMnO₄ · ${this.dil.op === 'diluir' ? 'diluição' : 'mistura'}`;
    return `${this.cur.sal.nome} · ${SISOL.fmt(this.cur.T, 0)} °C`;
  }
};
/** Equação de Antoine: log₁₀(P_mmHg) = A − B/(C+T[°C]) → P em mmHg. */
SISOL.antoinePv = function antoinePv(coef, T) {
  const Tc = SISOL.clamp(T, coef.tmin, coef.tmax);
  return Math.pow(10, coef.A - coef.B / (coef.C + Tc));
};
/** Temperatura de ebulição (°C) para uma dada pressão externa, invertendo
 *  Antoine analiticamente: T = B/(A − log₁₀ P) − C. */
SISOL.antoineTe = function antoineTe(coef, P) {
  const Pc = Math.max(1, P);
  const T = coef.B / (coef.A - Math.log10(Pc)) - coef.C;
  return SISOL.clamp(T, coef.tmin - 10, coef.tmax + 10);
};
/** Gera pontos [T,P] para desenho da curva de um líquido, via Antoine
 *  (amostragem contínua) ou tabela CRC, conforme o que estiver disponível. */
SISOL.liquidCurve = function liquidCurve(l, xmax) {
  if (l.antoine) {
    const pts = [];
    const tEnd = Math.min(xmax, l.antoine.tmax);
    const tStart = Math.max(0, l.antoine.tmin);
    for (let t = tStart; t < tEnd; t += 5) pts.push([t, SISOL.antoinePv(l.antoine, t)]);
    pts.push([tEnd, SISOL.antoinePv(l.antoine, tEnd)]);
    return pts;
  }
  return l.pv;
};
/** Y exato do topo do mercúrio para um valor — mesma matemática do
 *  kThermo — usado para desenhar setas de deslocamento na altura certa. */
SISOL.thermoValueY = function thermoValueY(topY, h, tmin, tmax, t) {
  const bulbR = 8,
    tubeTop = topY,
    tubeBot = topY + h - bulbR * 2;
  const frac = Math.max(0, Math.min(1, (t - tmin) / (tmax - tmin)));
  return tubeBot - frac * (tubeBot - tubeTop - 4);
};
// ══════════════════════════════════════════════════════════════════
// MECÂNICA B — Propriedades Coligativas (origem: SIPC)
// Modos: pressão de vapor · ebulioscopia/crioscopia · osmose · Henry
// ══════════════════════════════════════════════════════════════════
SISOL.MechB = class MechB {
  constructor(D) {
    this.D = D;
    this.modo = 'pvap';
    // modo 1
    this.liquido = D.LIQUIDOS[0];
    this.tpv = 25;
    this.patm = 760;
    this.bolhas = [];
    // modo 2 — ebulioscopia/crioscopia: solvente + soluto
    this.solvente = D.SOLVENTES_COLIG[0];
    this.soluto = D.SOLUTOS_COL[0];
    this.w = 1;
    // modo 3 — osmose (dinâmica real: volumes e mols de cada lado)
    this.mesq = 0.2;
    this.mdir = 0.8;
    this.tosm = 25;
    this.osm = {
      V0: 0.5,
      Vesq: 0.5,
      Vdir: 0.5,
      nesq: 0,
      ndir: 0,
      running: false,
      papl: 0,
      modoRO: false
    };
    this.fase = 0;
    // modo 5 — misturas de líquidos voláteis: Lei de Raoult, ideal vs real
    this.raoult = {
      aId: 'etanol',
      bId: 'agua',
      desvio: 'positivo',
      xA: 0.5,
      T: 60,
      vista: 'grafico',
      // 'grafico' | 'balao' | 'desafio'
      // Visão Balão: composição construída fisicamente por gotas (mL),
      // convertida pra mol via densidade/massa molar de cada líquido
      volA: 50,
      volB: 50,
      // Desafio da Destilação
      desafioId: 'etanol-agua',
      desafioXA: 0.12,
      ciclos: 0,
      travado: false,
      historico: [0.12]
    };
    // modo 4 — Lei de Henry: C = kH(T)·P
    this.henry = {
      gas: D.GASES_HENRY[0],
      T: 4,
      P: 3,
      aberto: false,
      C: 0,
      liberando: false,
      bolhas: []
    };
    this.henry.C = this._henryEq(this.henry.gas, this.henry.T, this.henry.P);
  }
  build(app) {
    SISOL.fillOptGrid('pvap-grid', this.D.LIQUIDOS.map(l => ({
      value: l.id,
      nome: l.nome,
      dot: l.cor,
      extra: `Te ${SISOL.fmt(l.te, 1)} °C`,
      aria: `${l.nome}, ebulição a ${SISOL.fmt(l.te, 1)} graus Celsius ao nível do mar`
    })), this.liquido.id);
    SISOL.fillOptGrid('solvente-grid', this.D.SOLVENTES_COLIG.map(s => ({
      value: s.id,
      nome: s.nome,
      dot: s.cor,
      extra: `Kc ${SISOL.fmt(s.Kc, 2)}`,
      aria: `${s.nome}, constante crioscópica ${SISOL.fmt(s.Kc, 2)}, ebulioscópica ${SISOL.fmt(s.Ke, 2)} graus vezes quilo por mol`
    })), this.solvente.id);
    SISOL.fillOptGrid('colig-grid', this.D.SOLUTOS_COL.map(s => ({
      value: s.id,
      nome: s.nome,
      dot: s.dot,
      extra: `i = ${s.i}`,
      aria: `${s.nome}, ${s.tipo}, fator de van 't Hoff igual a ${s.i}`
    })), this.soluto.id);
    this._buildHenryGrid();
    this._syncHenryUI();
    this._buildRaoultGrids();
    SISOL.fillOptGrid('raoult-desafio-grid', this.D.DESAFIOS_DESTILACAO.map(d => ({
      value: d.id,
      nome: d.nome,
      extra: d.desvio === 'ideal' ? 'sem azeótropo' : 'com azeótropo real'
    })), this.raoult.desafioId);
    this._syncRaoultVistaUI();
  }
  /** Só os líquidos com Antoine (não o éter, que só tem tabela) entram no
   *  modo de mistura binária — o cálculo precisa da função contínua P°(T). */
  _liquidosAntoine() {
    return this.D.LIQUIDOS.filter(l => l.antoine);
  }
  _buildRaoultGrids() {
    const lst = this._liquidosAntoine();
    SISOL.fillOptGrid('raoult-a-grid', lst.map(l => ({
      value: l.id,
      nome: l.nome,
      dot: l.cor
    })), this.raoult.aId);
    SISOL.fillOptGrid('raoult-b-grid', lst.map(l => ({
      value: l.id,
      nome: l.nome,
      dot: l.cor
    })), this.raoult.bId);
  }
  _buildHenryGrid() {
    SISOL.fillOptGrid('henry-grid', this.D.GASES_HENRY.map(g => ({
      value: g.id,
      nome: g.nome,
      dot: g.cor,
      extra: `kH ${SISOL.fmt(g.kH25 * 1000, 2)}×10⁻³`,
      aria: `${g.nome}, constante de Henry ${SISOL.fmt(g.kH25, 5)} mol por litro por atmosfera a 25 graus`
    })), this.henry.gas.id);
  }
  /** Com a garrafa aberta a pressão é sempre 1 atm — oculta e desabilita o
   *  slider de pressão para não sugerir um controle sem efeito. */
  _syncHenryUI() {
    const row = document.getElementById('row-henry-p');
    if (row) row.hidden = this.henry.aberto;
    const inp = document.getElementById('henry-p');
    if (inp) inp.disabled = this.henry.aberto;
  }
  setMode(id) {
    this.modo = id;
  }
  setParam(k, v) {
    switch (k) {
      case 'liquido':
        {
          this.liquido = this.D.LIQUIDOS.find(l => l.id === v) || this.liquido;
          this.bolhas.length = 0;
          // cada líquido só tem dados reais numa faixa de temperatura (Antoine
          // ou tabela); sem essa checagem o slider podia continuar mostrando
          // uma T fora da faixa enquanto o cálculo usava, por baixo dos panos,
          // um valor diferente (clampeado) — número exibido ≠ número usado.
          const L = this.liquido;
          const faixa = L.antoine ? [L.antoine.tmin, L.antoine.tmax] : [L.pv[0][0], L.pv[L.pv.length - 1][0]];
          const tOk = SISOL.clamp(this.tpv, Math.max(0, faixa[0]), Math.min(110, faixa[1]));
          let aviso = '';
          if (Math.abs(tOk - this.tpv) > 0.5) {
            this.tpv = tOk;
            this.app.syncSlider('pv-t', tOk);
            aviso = ` Temperatura ajustada para ${SISOL.fmt(tOk, 0)} °C — fora disso não há dados reais para este líquido.`;
          }
          return {
            say: `${L.nome} selecionado. Ebulição normal a ${SISOL.fmt(L.te, 1)} graus.${aviso}`
          };
        }
      case 'tpv':
        this.tpv = v;
        break;
      case 'patm':
        this.patm = v;
        break;
      case 'solutocol':
        {
          this.soluto = this.D.SOLUTOS_COL.find(s => s.id === v) || this.soluto;
          return {
            say: `${this.soluto.nome}, ${this.soluto.tipo}. Fator i igual a ${this.soluto.i}.`
          };
        }
      case 'solvente':
        {
          this.solvente = this.D.SOLVENTES_COLIG.find(s => s.id === v) || this.solvente;
          return {
            say: `${this.solvente.nome} selecionado — Ke = ${SISOL.fmt(this.solvente.Ke, 2)}, Kc = ${SISOL.fmt(this.solvente.Kc, 2)} graus vezes quilo por mol. Ferve puro a ${SISOL.fmt(this.solvente.Te, 1)} graus e congela a ${SISOL.fmt(this.solvente.Tc, 1)} graus.`
          };
        }
      case 'w':
        this.w = v;
        break;
      case 'mesq':
        {
          const estava = this.osm.running;
          this.mesq = v;
          this._osmReset();
          return estava ? {
            say: 'Concentração alterada — o fluxo osmótico foi reiniciado do zero.'
          } : {};
        }
      case 'mdir':
        {
          const estava = this.osm.running;
          this.mdir = v;
          this._osmReset();
          return estava ? {
            say: 'Concentração alterada — o fluxo osmótico foi reiniciado do zero.'
          } : {};
        }
      case 'tosm':
        this.tosm = v;
        break;
      case 'modoOsm':
        {
          const reversa = v === 'reversa';
          this.osm.modoRO = reversa;
          this._osmReset();
          if (reversa) {
            // pressão inicial já acima do Δπ natural, pra reversão ficar
            // visível assim que o estudante iniciar o fluxo
            const o = this._osm();
            const pInicial = Math.max(5, Math.ceil((o.piMax + 3) / 5) * 5);
            this.osm.papl = pInicial;
            this.app.syncSlider('osm-papl', pInicial);
          } else {
            this.osm.papl = 0;
            this.app.syncSlider('osm-papl', 0);
          }
          document.getElementById('row-osm-papl').hidden = !reversa;
          const hint = document.getElementById('osm-hint');
          if (hint) hint.innerHTML = reversa ? 'Aumente a pressão aplicada: acima de Δπ, o fluxo se <strong>inverte</strong> e água pura sai do lado concentrado — o princípio da dessalinização.' : 'A água atravessa sozinha para o lado mais concentrado, até as concentrações se igualarem.';
          return {
            say: reversa ? 'Osmose reversa: uma pressão mecânica é aplicada no lado concentrado, empurrando água pura para fora dele — o princípio da dessalinização.' : 'Osmose direta: a água flui sozinha, sem pressão aplicada, do lado menos concentrado para o mais concentrado.'
          };
        }
      case 'papl':
        {
          this.osm.papl = v;
          const o = this._osm();
          return {
            say: v > o.piMax ? `Pressão aplicada acima da pressão osmótica: fluxo revertido — água pura sendo extraída do lado mais concentrado, como numa dessalinização.` : `Pressão aplicada: ${SISOL.fmt(v, 1)} atm.`
          };
        }
      case 'gasHenry':
        {
          const g = this.D.GASES_HENRY.find(x => x.id === v) || this.henry.gas;
          this.henry.gas = g;
          if (!this.henry.aberto) this.henry.C = this._henryEq(g, this.henry.T, this.henry.P);
          return {
            say: this.henry.aberto ? `${g.nome} selecionado — ${g.ctx}. Com a garrafa aberta, a concentração vai se ajustar aos poucos ao novo gás, não muda de uma vez.` : `${g.nome} selecionado — ${g.ctx}.`
          };
        }
      case 'henryT':
        {
          this.henry.T = v;
          if (!this.henry.aberto) this.henry.C = this._henryEq(this.henry.gas, v, this.henry.P);
          return;
        }
      case 'henryP':
        {
          this.henry.P = v;
          if (!this.henry.aberto) this.henry.C = this._henryEq(this.henry.gas, this.henry.T, v);
          return;
        }
      case 'liquidoA':
        {
          const Ra = this.raoult;
          if (v === Ra.bId) Ra.bId = Ra.aId; // não faz sentido misturar um líquido com ele mesmo — troca
          Ra.aId = v;
          this._syncRaoultT();
          this._buildRaoultGrids();
          return {
            say: `Líquido A: ${this._liquidosAntoine().find(l => l.id === v).nome}.`
          };
        }
      case 'liquidoB':
        {
          const Ra = this.raoult;
          if (v === Ra.aId) Ra.aId = Ra.bId;
          Ra.bId = v;
          this._syncRaoultT();
          this._buildRaoultGrids();
          return {
            say: `Líquido B: ${this._liquidosAntoine().find(l => l.id === v).nome}.`
          };
        }
      case 'desvio':
        {
          this.raoult.desvio = v;
          const nomes = {
            ideal: 'ideal — segue a Lei de Raoult à risca',
            positivo: 'desvio positivo — pressão real ACIMA da reta ideal, pode formar azeótropo de ebulição mínima',
            negativo: 'desvio negativo — pressão real ABAIXO da reta ideal, pode formar azeótropo de ebulição máxima'
          };
          return {
            say: nomes[v] || ''
          };
        }
      case 'xA':
        this.raoult.xA = v;
        return;
      case 'raoultT':
        this.raoult.T = v;
        return;
      case 'vistaRaoult':
        {
          this.raoult.vista = v;
          this._syncRaoultVistaUI();
          const nomes = {
            grafico: 'gráfico de pressão de vapor',
            balao: 'visão balão — evaporação partícula a partícula',
            desafio: 'desafio da destilação'
          };
          return {
            say: `Vista: ${nomes[v] || v}.`
          };
        }
      case 'desafioSelect':
        {
          const Ra = this.raoult;
          const desafio = this.D.DESAFIOS_DESTILACAO.find(x => x.id === v) || this.D.DESAFIOS_DESTILACAO[0];
          Ra.desafioId = desafio.id;
          Ra.desafioXA = desafio.xA0;
          Ra.ciclos = 0;
          Ra.travado = false;
          Ra.historico = [desafio.xA0];
          return {
            say: `${desafio.nome}. ${desafio.contexto}`
          };
        }
    }
    return {};
  }
  action(name) {
    if (name === 'pv-status') {
      const s = this._pv();
      return SISOL.announce(s.fervendo ? `${this.liquido.nome} fervendo: pressão de vapor ${SISOL.fmt(s.pv, 1)} milímetros de mercúrio iguala ou supera a externa de ${SISOL.fmt(this.patm, 0)}.` : `${this.liquido.nome} líquido a ${SISOL.fmt(this.tpv, 0)} graus. Pressão de vapor ${SISOL.fmt(s.pv, 1)} contra ${SISOL.fmt(this.patm, 0)} milímetros de mercúrio externos. Fervura prevista para ${SISOL.fmt(s.te, 1)} graus.`);
    }
    if (name === 'colig-status') {
      const c = this._colig();
      return SISOL.announce(`Solução ${SISOL.fmt(this.w, 2)} molal de ${this.soluto.nome} em ${this.solvente.nome}: ferve a ${SISOL.fmt(c.te, 2)} graus e congela a ${SISOL.fmt(c.tc, 2)} graus. Massa molar real ${SISOL.fmt(c.Mreal, 1)}, aparente (se ignorar i) ${SISOL.fmt(c.Map, 1)} g/mol.`);
    }
    if (name === 'raoult-exemplo-real') {
      const Ra = this.raoult;
      Ra.aId = 'etanol';
      Ra.bId = 'agua';
      Ra.desvio = 'positivo';
      Ra.T = 78;
      this._buildRaoultGrids();
      this.app.syncSlider('raoult-t', 78);
      const segs = document.querySelectorAll('[data-group="desvio"] .seg-btn');
      segs.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === 'positivo')));
      SISOL.announce('Etanol + água é um caso real bem documentado: forma um azeótropo perto de 89,5% em fração molar de etanol (95,6% em massa), fervendo a 78,2 graus — mova a fração molar de A até achar o pico da curva e compare com esse valor.', 'assertive');
    }
    if (name === 'raoult-status') {
      const r = this._raoult();
      const desvioTxt = r.Am === 0 ? 'comportamento ideal, segue a Lei de Raoult' : r.Am > 0 ? 'desvio positivo' : 'desvio negativo';
      const azeoTxt = r.azeo ? ` Azeótropo próximo de x igual a ${SISOL.fmt(r.azeo.x, 2)}, com pressão ${SISOL.fmt(r.azeo.p, 0)} milímetros de mercúrio.` : '';
      return SISOL.announce(`${r.A.nome} e ${r.B.nome} a ${SISOL.fmt(this.raoult.T, 0)} graus: ${desvioTxt}. Pressão ideal ${SISOL.fmt(r.Pideal, 0)}, pressão real ${SISOL.fmt(r.Preal, 0)} milímetros de mercúrio.${azeoTxt}`, 'assertive');
    }
    if (name === 'raoult-add-a' || name === 'raoult-add-b') {
      const Ra = this.raoult;
      if (name === 'raoult-add-a') Ra.volA = SISOL.clamp(Ra.volA + 10, 0, 500);else Ra.volB = SISOL.clamp(Ra.volB + 10, 0, 500);
      const mol = this._raoultMoles();
      SISOL.announce(`${name === 'raoult-add-a' ? mol.A.nome : mol.B.nome}: +10 mL. Fração molar de ${mol.A.nome} agora ${SISOL.fmt(mol.xA, 2)}.`);
    }
    if (name === 'raoult-reset-balao') {
      this.raoult.volA = 50;
      this.raoult.volB = 50;
      SISOL.announce('Balão reiniciado: 50 mL de cada líquido.');
    }
    if (name === 'raoult-desafio-destilar') {
      const Ra = this.raoult;
      const desafio = this.D.DESAFIOS_DESTILACAO.find(d => d.id === Ra.desafioId);
      const A = this.D.LIQUIDOS.find(l => l.id === desafio.aId),
        B = this.D.LIQUIDOS.find(l => l.id === desafio.bId);
      const Am = desafio.desvio === 'positivo' ? 1.1 : desafio.desvio === 'negativo' ? -1.1 : 0;
      const antigo = Ra.desafioXA;
      const yA = this._raoultY(antigo, desafio.T, Am, A, B);
      Ra.desafioXA = yA;
      Ra.ciclos++;
      Ra.historico.push(yA);
      const mudou = Math.abs(yA - antigo);
      Ra.travado = mudou < 0.008 && Am !== 0;
      SISOL.playTone(Ra.travado ? 260 : 760, .12, .07);
      if (Ra.travado) {
        SISOL.announce(`Travado! Depois de ${Ra.ciclos} ciclos, a composição parou de mudar em ${SISOL.fmt(yA * 100, 1)}% de ${A.nome} — o vapor tem a MESMA composição do líquido. Esse é o azeótropo: destilação simples não passa daqui.`, 'assertive');
      } else {
        SISOL.announce(`Ciclo ${Ra.ciclos}: pureza de ${A.nome} subiu de ${SISOL.fmt(antigo * 100, 1)}% para ${SISOL.fmt(yA * 100, 1)}%.`);
      }
    }
    if (name === 'raoult-desafio-reset') {
      const Ra = this.raoult;
      const desafio = this.D.DESAFIOS_DESTILACAO.find(d => d.id === Ra.desafioId);
      Ra.desafioXA = desafio.xA0;
      Ra.ciclos = 0;
      Ra.travado = false;
      Ra.historico = [desafio.xA0];
      SISOL.announce(`Desafio reiniciado: ${SISOL.fmt(desafio.xA0 * 100, 0)}% de ${this.D.LIQUIDOS.find(l => l.id === desafio.aId).nome}.`);
    }
    if (name === 'osmose-run') {
      const O = this.osm;
      O.Vesq = O.V0;
      O.Vdir = O.V0;
      O.nesq = this.mesq * O.V0;
      O.ndir = this.mdir * O.V0;
      O.running = true;
      SISOL.announce('Fluxo osmótico iniciado. A água atravessa a membrana para o lado mais concentrado, até as concentrações se igualarem.');
    }
    if (name === 'osmose-reset') {
      this._osmReset();
      if (this.osm.modoRO) {
        const o = this._osm();
        const pInicial = Math.max(5, Math.ceil((o.piMax + 3) / 5) * 5);
        this.osm.papl = pInicial;
        this.app.syncSlider('osm-papl', pInicial);
        SISOL.announce('Tubo reiniciado com os níveis iguais, pressão aplicada de volta ao padrão de demonstração.');
      } else {
        this.osm.papl = 0;
        this.app.syncSlider('osm-papl', 0);
        SISOL.announce('Tubo reiniciado com os níveis iguais e sem pressão aplicada.');
      }
    }
    if (name === 'henry-abrir') {
      const H = this.henry;
      H.aberto = !H.aberto;
      this._syncHenryUI();
      if (!H.aberto) {
        H.C = this._henryEq(H.gas, H.T, H.P);
        H.liberando = false;
        SISOL.announce(`Garrafa fechada e repressurizada: ${SISOL.fmt(H.P, 1)} atmosferas, concentração de equilíbrio ${SISOL.fmt(H.C, 4)} mol por litro.`);
      } else {
        const alvo = this._henryEq(H.gas, H.T, 1);
        SISOL.announce(H.C > alvo ? `Garrafa aberta! A pressão cai para 1 atmosfera e o excesso de ${H.gas.nome} escapa em bolhas até ${SISOL.fmt(alvo, 4)} mol por litro.` : `Garrafa aberta a 1 atmosfera — a concentração já está em equilíbrio, sem bolhas.`);
      }
    }
    if (name === 'henry-reset') {
      const H = this.henry;
      H.gas = this.D.GASES_HENRY[0];
      H.T = 4;
      H.P = 3;
      H.aberto = false;
      H.bolhas.length = 0;
      H.liberando = false;
      H.C = this._henryEq(H.gas, H.T, H.P);
      this.app.syncSlider('henry-t', 4);
      this.app.syncSlider('henry-p', 3);
      this._buildHenryGrid();
      this._syncHenryUI();
      SISOL.announce('Garrafa reiniciada: CO₂ a 4 graus e 3 atmosferas, fechada.');
    }
  }

  /** Reinicia a dinâmica de osmose (nível igual, sem fluxo em curso). */
  _osmReset() {
    const O = this.osm;
    O.Vesq = O.V0;
    O.Vdir = O.V0;
    O.running = false;
  }

  /* ── física ── */
  _pv() {
    const L = this.liquido;
    if (L.antoine) {
      const pv = SISOL.antoinePv(L.antoine, this.tpv);
      const te = SISOL.antoineTe(L.antoine, this.patm);
      return {
        pv,
        te,
        fervendo: pv >= this.patm - 0.5
      };
    }
    const pv = SISOL.kInterp(L.pv, SISOL.clamp(this.tpv, L.pv[0][0], L.pv[L.pv.length - 1][0]));
    // temperatura de ebulição pela pressão externa (inversa da tabela)
    let te = L.pv[L.pv.length - 1][0];
    for (let i = 1; i < L.pv.length; i++) {
      const [t0, p0] = L.pv[i - 1],
        [t1, p1] = L.pv[i];
      if (this.patm >= p0 && this.patm <= p1) {
        te = t0 + (this.patm - p0) / (p1 - p0) * (t1 - t0);
        break;
      }
    }
    return {
      pv,
      te,
      fervendo: pv >= this.patm - 0.5
    };
  }
  _colig() {
    const S = this.solvente,
      i = this.soluto.i,
      W = this.w;
    const dte = S.Ke * W * i,
      dtc = S.Kc * W * i;
    // tonoscopia: fração molar do solvente (Raoult), no ponto de ebulição do solvente puro
    const xs = S.molKg / (S.molKg + W * i);
    // massa molar "aparente" — o que alguém calcularia SE esquecesse de
    // multiplicar pelo fator i (erro clássico de laboratório): como
    // ΔT = K·W·i, ignorar i faz a pessoa inferir W_aparente = i·W_real,
    // logo M_aparente = M_real / i (sai i vezes MENOR que a real).
    const Mreal = this.soluto.M,
      Map = Mreal / i;
    return {
      dte,
      dtc,
      te: S.Te + dte,
      tc: S.Tc - dtc,
      p: 760 * xs,
      dp: 760 * (1 - xs),
      part: W * i,
      Mreal,
      Map
    };
  }
  _osm() {
    const O = this.osm,
      T = this.tosm + 273.15,
      R = this.D.R;
    const Me = O.running ? O.nesq / O.Vesq : this.mesq;
    const Md = O.running ? O.ndir / O.Vdir : this.mdir;
    const pe = Me * R * T,
      pd = Md * R * T;
    const d = Md - Me;
    const dpi = Math.abs(pd - pe);
    const papl = O.papl || 0;
    // pressão aplicada sempre no lado direito, opondo-se ao fluxo natural —
    // é exatamente o princípio da osmose reversa usada em dessalinização:
    // quando papl supera a pressão osmótica natural (dpi), o fluxo de água
    // se INVERTE (água pura é extraída do lado mais concentrado).
    const dEfetivo = d - papl / (R * T);
    const reversed = papl > 0 && Math.abs(d) > 1e-6 && Math.sign(dEfetivo) !== Math.sign(d || 1);
    const rel = Math.abs(dEfetivo) < 0.005 ? 'iso' : dEfetivo > 0 ? 'dir' : 'esq';
    const desnivel = SISOL.clamp((O.Vdir - O.Vesq) / (2 * O.V0), -1, 1);
    return {
      pe,
      pd,
      dpi,
      piMax: dpi,
      d,
      dEfetivo,
      reversed,
      papl,
      Me,
      Md,
      desnivel,
      rel
    };
  }
  _henryKH(gas, T) {
    return gas.kH25 * Math.exp(-gas.decaiK * (T - 25));
  }
  _henryEq(gas, T, P) {
    return this._henryKH(gas, T) * P;
  }

  /** Garante que a temperatura escolhida tem dados de Antoine válidos para
   *  os DOIS líquidos ao mesmo tempo (interseção das duas faixas) — mesmo
   *  cuidado já aplicado no modo de pressão de vapor. */
  _syncRaoultT() {
    const Ra = this.raoult,
      A = this.D.LIQUIDOS.find(l => l.id === Ra.aId),
      B = this.D.LIQUIDOS.find(l => l.id === Ra.bId);
    const tmin = Math.max(A.antoine.tmin, B.antoine.tmin),
      tmax = Math.min(A.antoine.tmax, B.antoine.tmax);
    const tOk = SISOL.clamp(Ra.T, tmin, tmax);
    if (Math.abs(tOk - Ra.T) > 0.5) {
      Ra.T = tOk;
      if (this.app) this.app.syncSlider('raoult-t', tOk);
    }
  }

  /** Mostra só os controles relevantes pra vista atual (gráfico/balão/
   *  desafio) — no desafio, os líquidos/desvio/temperatura ficam ocultos
   *  de propósito, pra o estudante DESCOBRIR o comportamento observando
   *  o gráfico, em vez de já saber a resposta de antemão. */
  _syncRaoultVistaUI() {
    const v = this.raoult.vista;
    const show = (id, cond) => {
      const el = document.getElementById(id);
      if (el) el.hidden = !cond;
    };
    show('row-raoult-exemplo', v === 'grafico');
    show('row-raoult-liquidos', v !== 'desafio');
    show('row-raoult-desvio', v !== 'desafio');
    show('row-raoult-temp', v !== 'desafio');
    show('row-raoult-grafico', v === 'grafico');
    show('row-raoult-balao', v === 'balao');
    show('row-raoult-desafio', v === 'desafio');
  }

  /** Converte as gotas (mL) de A e B da Visão Balão em mol, via
   *  densidade/massa molar de cada líquido — mesma lógica de C=m/V·MM
   *  já usada no modo Preparo, agora aplicada aos dois lados da mistura. */
  _raoultMoles() {
    const Ra = this.raoult;
    const A = this.D.LIQUIDOS.find(l => l.id === Ra.aId),
      B = this.D.LIQUIDOS.find(l => l.id === Ra.bId);
    const molA = Ra.volA * A.rho / A.M,
      molB = Ra.volB * B.rho / B.M;
    const total = molA + molB;
    return {
      molA,
      molB,
      xA: total > 0 ? molA / total : .5,
      A,
      B
    };
  }

  /** Lei de Raoult (ideal) vs modelo de Margules de 1 parâmetro (real) —
   *  simplificado para ILUSTRAR a forma do desvio (positivo/negativo) e o
   *  aparecimento de um azeótropo; não reproduz valores exatos de sistemas
   *  reais específicos, que dependem de dados experimentais de cada par. */
  _raoultP(xA, T, Am, A, B) {
    const PA0 = SISOL.antoinePv(A.antoine, T),
      PB0 = SISOL.antoinePv(B.antoine, T);
    const xB = 1 - xA;
    const gA = Math.exp(Am * xB * xB),
      gB = Math.exp(Am * xA * xA);
    const Preal = xA * gA * PA0 + xB * gB * PB0;
    // YA = composição do VAPOR em equilíbrio com o líquido — é isso que sai
    // primeiro na destilação (Lei de Dalton + Raoult: pA = YA·P_total = xA·γA·P°A)
    const YA = Preal > 0 ? xA * gA * PA0 / Preal : xA;
    return {
      PA0,
      PB0,
      Pideal: xA * PA0 + xB * PB0,
      Preal,
      gA,
      gB,
      YA
    };
  }
  /** Composição do vapor (fração molar de A) em equilíbrio com o líquido —
   *  usada tanto na Visão Balão (cor do vapor) quanto no Desafio da
   *  Destilação (pra onde a composição "salta" a cada ciclo). */
  _raoultY(xA, T, Am, A, B) {
    return this._raoultP(xA, T, Am, A, B).YA;
  }
  _raoult() {
    const Ra = this.raoult;
    const A = this.D.LIQUIDOS.find(l => l.id === Ra.aId),
      B = this.D.LIQUIDOS.find(l => l.id === Ra.bId);
    const Am = Ra.desvio === 'positivo' ? 1.1 : Ra.desvio === 'negativo' ? -1.1 : 0;
    const atual = this._raoultP(Ra.xA, Ra.T, Am, A, B);
    // varredura pra achar o azeótropo (extremo de Preal no interior do intervalo)
    let azeo = null;
    if (Am !== 0) {
      let best = null;
      for (let x = 0.02; x <= 0.98; x += 0.01) {
        const p = this._raoultP(x, Ra.T, Am, A, B).Preal;
        if (!best || (Am > 0 ? p > best.p : p < best.p)) best = {
          x,
          p
        };
      }
      // só conta como azeótropo se for de fato um extremo interno (não a borda)
      if (best && best.x > 0.03 && best.x < 0.97) azeo = best;
    }
    // referência real documentada: etanol+água forma um azeótropo bem
    // estudado a ≈89,5% em fração molar de etanol (95,6% em massa), a
    // 78,2 °C — usada aqui só como conferência de que o modelo simplificado
    // captura a ORDEM DE GRANDEZA certa, não como dado exato de outros pares
    let realRef = null;
    const parEtanolAgua = Ra.aId === 'etanol' && Ra.bId === 'agua' || Ra.aId === 'agua' && Ra.bId === 'etanol';
    if (parEtanolAgua && Am > 0) {
      const xEtanolReal = Ra.aId === 'etanol' ? 0.895 : 1 - 0.895;
      realRef = {
        xA: xEtanolReal,
        fonte: 'documentado: ≈95,6% em massa de etanol, ferve a 78,2 °C'
      };
    }
    return {
      A,
      B,
      Am,
      xA: Ra.xA,
      xB: 1 - Ra.xA,
      ...atual,
      azeo,
      realRef
    };
  }

  /* ── animação ── */
  update(dt, app) {
    this.fase += dt;
    if (this.modo === 'pvap') {
      const s = this._pv();
      const box = {
        x: -60,
        y: -110,
        w: 120,
        h: 110
      };
      const taxa = s.fervendo ? 45 : s.pv / this.patm * 8;
      SISOL.kBubbles(this.bolhas, dt, box, taxa, {
        vy: s.fervendo ? 70 : 30
      });
    } else if (this.modo === 'osmose' && this.osm.running) {
      const O = this.osm;
      const Me = O.nesq / O.Vesq,
        Md = O.ndir / O.Vdir;
      const T = this.tosm + 273.15,
        R = this.D.R;
      const kPerm = 0.18;
      // a pressão aplicada (osmose reversa) se opõe ao fluxo natural —
      // convertida para a mesma unidade de concentração via π=MRT
      const dEfetivo = Md - Me - (O.papl || 0) / (R * T);
      const fluxo = kPerm * dEfetivo;
      const Vmin = O.V0 * 0.12,
        Vmax = 2 * O.V0 - Vmin;
      O.Vesq = SISOL.clamp(O.Vesq - fluxo * dt, Vmin, Vmax);
      O.Vdir = SISOL.clamp(2 * O.V0 - O.Vesq, Vmin, Vmax);
    } else if (this.modo === 'henry') {
      const H = this.henry;
      const alvo = H.aberto ? this._henryEq(H.gas, H.T, 1) : this._henryEq(H.gas, H.T, H.P);
      const tau = 2.2;
      const antesC = H.C;
      H.C += (alvo - H.C) * (1 - Math.exp(-dt / Math.max(0.05, tau)));
      const taxaLiberacao = Math.max(0, (antesC - H.C) / Math.max(dt, 1e-6));
      H.liberando = H.aberto && taxaLiberacao > 1e-5;
      const box = {
        x: -46,
        y: -6,
        w: 92,
        h: 6
      };
      const taxaBolhas = H.aberto ? SISOL.clamp(taxaLiberacao * 5200, 0, 55) : 0;
      SISOL.kBubbles(H.bolhas, dt, box, taxaBolhas, {
        vy: 46,
        topo: -150
      });
    }
  }

  /* ── desenho ── */
  draw(ctx, W, H, app) {
    if (this.modo === 'pvap') this._drawPv(ctx, W, H);else if (this.modo === 'colig') this._drawColig(ctx, W, H);else if (this.modo === 'henry') this._drawHenry(ctx, W, H, app);else if (this.modo === 'raoult') this._drawRaoult(ctx, W, H);else this._drawOsm(ctx, W, H);
  }
  _drawPv(ctx, W, H) {
    const s = this._pv(),
      L = this.liquido;
    // gráfico ocupando toda a área do canvas — mesma proporção do modo
    // "Curvas de Solubilidade"; o béquer+termômetro foi para a barra lateral.
    const gw = W - 104,
      gh = H - 88;
    const A = SISOL.kAxes(ctx, {
      x: 58,
      y: 24,
      w: gw,
      h: gh,
      xmin: 0,
      xmax: 110,
      ymin: 0,
      ymax: 820,
      xticks: [0, 20, 40, 60, 80, 100],
      yticks: [0, 200, 400, 600, 760],
      xlab: 'Temperatura (°C)',
      ylab: 'Pressão de vapor (mmHg)'
    });

    // recorta as curvas à área do gráfico — sem isso, líquidos mais voláteis
    // (cuja pressão de vapor dispara bem acima de 820 mmHg antes dos 110 °C)
    // desenhavam a linha para FORA da área do eixo Y, por cima dos rótulos.
    const gx0 = 58,
      gy0 = 24;
    ctx.save();
    ctx.beginPath();
    ctx.rect(gx0, gy0, gw, gh);
    ctx.clip();
    this.D.LIQUIDOS.forEach((l, i) => {
      const on = l.id === L.id;
      const curva = SISOL.liquidCurve(l, 110);
      ctx.globalAlpha = on ? 1 : .3;
      SISOL.kLine(ctx, curva, A.px, A.py, {
        color: l.cor,
        w: on ? 2.6 : 1.4
      });
      ctx.globalAlpha = 1;
    });
    ctx.restore();

    // rótulos: posição "natural" no último ponto AINDA dentro da faixa
    // visível do eixo Y (≤800 mmHg) — depois resolve colisões de verdade
    // (ordena por x e empurra pra cima qualquer par que fique perto demais),
    // em vez de um escalonamento fixo que não escala com o número de líquidos
    const rotulos = this.D.LIQUIDOS.map(l => {
      const on = l.id === L.id;
      const curva = SISOL.liquidCurve(l, 110);
      let labelPt = curva[0];
      for (let k = 0; k < curva.length; k++) if (curva[k][1] <= 800) labelPt = curva[k];
      return {
        l,
        on,
        x: A.px(labelPt[0]) - 4,
        y: A.py(Math.min(labelPt[1], 800)) - 12
      };
    });
    rotulos.sort((a, b) => a.x - b.x);
    // relaxamento em várias passadas: resolve aglomerados de 3+ rótulos
    // próximos, não só pares — o anterior só comparava com um vizinho
    // por vez e podia deixar um terceiro rótulo colidindo.
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < rotulos.length; i++) {
        for (let j = 0; j < rotulos.length; j++) {
          if (i === j) continue;
          const dx = Math.abs(rotulos[i].x - rotulos[j].x),
            dy = rotulos[i].y - rotulos[j].y;
          if (dx < 60 && Math.abs(dy) < 20 && dy >= 0) rotulos[i].y = rotulos[j].y - 22;
        }
      }
    }
    rotulos.forEach(r => SISOL.kLabel(ctx, r.l.nome, r.x, r.y, {
      size: 10,
      color: r.l.cor,
      align: 'right',
      bold: r.on
    }));

    // linha da pressão externa
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = SISOL.cssVar('--accent-amber', '#fbbf24');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(A.px(0), A.py(this.patm));
    ctx.lineTo(A.px(110), A.py(this.patm));
    ctx.stroke();
    ctx.restore();
    SISOL.kChip(ctx, `P externa ${SISOL.fmt(this.patm, 0)} mmHg`, A.px(110) - 66, A.py(this.patm) - 12, {
      fg: SISOL.cssVar('--accent-amber'),
      size: 10
    });

    // ponto atual + ebulição prevista
    ctx.fillStyle = L.cor;
    ctx.beginPath();
    ctx.arc(A.px(this.tpv), A.py(s.pv), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = SISOL.cssVar('--accent-ok', '#4ade80');
    ctx.beginPath();
    ctx.moveTo(A.px(s.te), A.py(this.patm));
    ctx.lineTo(A.px(s.te), A.py(0));
    ctx.stroke();
    ctx.restore();
    SISOL.kChip(ctx, `Te ${SISOL.fmt(s.te, 1)} °C`, A.px(s.te), A.py(0) + 24, {
      fg: SISOL.cssVar('--accent-ok'),
      size: 11,
      bold: true
    });
  }

  /** Béquer + termômetro do líquido selecionado — desenhado num CANVAS
   *  separado, na barra lateral (não mais na área central), para deixar
   *  o gráfico de pressão de vapor ocupar o canvas inteiro. */
  _drawPvMini(ctx, w, h) {
    const s = this._pv(),
      L = this.liquido;
    ctx.clearRect(0, 0, w, h);
    const cx = w * .36,
      by = h - 18;
    ctx.save();
    ctx.translate(cx, by);
    const bw = Math.min(w * .5, 96),
      bh = Math.min(h * .56, 110);
    const box = SISOL.kBeaker(ctx, 0, -bh, bw, bh, .72, L.cor, {
      alpha: .55,
      rotulo: L.nome
    });
    SISOL.kDrawBubbles(ctx, this.bolhas, 'rgba(255,255,255,.7)');
    if (s.fervendo) SISOL.kFlame(ctx, 0, 6, .8, this.fase);
    const proximidade = SISOL.clamp(s.pv / this.patm, 0, 1);
    if (!SISOL.isReduced()) {
      if (s.fervendo) {
        SISOL.kSteam(ctx, -14, box.surfaceY - 2, this.fase, SISOL.cssVar('--text-secondary'));
        SISOL.kSteam(ctx, 14, box.surfaceY - 2, this.fase + 1.1, SISOL.cssVar('--text-secondary'));
      } else if (proximidade > 0.4) {
        ctx.save();
        ctx.globalAlpha = (proximidade - 0.4) / 0.6;
        SISOL.kSteam(ctx, 0, box.surfaceY - 2, this.fase, SISOL.cssVar('--text-secondary'));
        ctx.restore();
      }
    }
    ctx.restore();
    SISOL.kThermo(ctx, cx + bw * .72 + 22, by - bh + 6, bh + 6, this.tpv, 0, 110, {
      color: L.cor
    });
    SISOL.kChip(ctx, s.fervendo ? 'FERVENDO' : 'líquido', cx, by + 16, {
      fg: s.fervendo ? SISOL.cssVar('--accent-exo', '#f87171') : SISOL.cssVar('--text-secondary'),
      bold: true,
      size: 11
    });
  }
  _drawColig(ctx, W, H) {
    const c = this._colig(),
      S = this.solvente;
    const cx = W / 2;
    // três termômetros: solvente puro, ebulição da solução, congelamento —
    // faixa dinâmica porque cada solvente tem Te/Tc bem diferentes (água:
    // 0–100 °C · cânfora: 176–204 °C). Posições e altura em FRAÇÃO do
    // canvas (não mais pixels fixos), para aproveitar telas largas/altas.
    const y0 = H * .16,
      hh = SISOL.clamp(H * .52, 170, 380);
    const tmin = Math.min(-12, S.Tc - 20),
      tmax = Math.max(112, S.Te + 20);
    SISOL.kLabel(ctx, `${S.nome} pura × solução`, cx, H * .05, {
      size: 13,
      bold: true,
      color: SISOL.cssVar('--text-primary')
    });
    const passo = SISOL.clamp(W * .13, 90, 190);
    const cols = [{
      x: cx - passo * 1.5,
      t: S.Te,
      tmin,
      tmax,
      rot: `${S.nome} pura ferve`,
      cor: SISOL.cssVar('--accent-exo', '#f87171')
    }, {
      x: cx - passo * .4,
      t: c.te,
      tmin,
      tmax,
      rot: 'solução ferve',
      cor: SISOL.cssVar('--accent-exo', '#f87171')
    }, {
      x: cx + passo * .7,
      t: S.Tc,
      tmin,
      tmax,
      rot: `${S.nome} pura congela`,
      cor: SISOL.cssVar('--accent-cyan', '#22d3ee')
    }, {
      x: cx + passo * 1.8,
      t: c.tc,
      tmin,
      tmax,
      rot: 'solução congela',
      cor: SISOL.cssVar('--accent-cyan', '#22d3ee')
    }];
    cols.forEach(col => {
      if (col.x < 30 || col.x > W - 30) return;
      SISOL.kThermo(ctx, col.x, y0, hh, col.t, col.tmin, col.tmax, {
        color: col.cor,
        casas: 2,
        escala: false
      });
      SISOL.kLabel(ctx, col.rot, col.x, y0 + hh + 22, {
        size: 10,
        color: SISOL.cssVar('--text-secondary'),
        maxW: 100
      });
      // pistas visuais do estado físico: vapor sobre quem ferve, floco sobre quem congela
      if (col.rot.includes('ferve')) SISOL.kSteam(ctx, col.x, y0 - 6, SISOL.isReduced() ? 0 : this.fase, col.cor);else SISOL.kSnowflake(ctx, col.x, y0 - 10, 7, col.cor);
    });

    // setas de deslocamento ligando PURO → SOLUÇÃO, na altura exata do
    // mercúrio de cada um — o "antes/depois" fica visível de cara, não só
    // como números em separado nos dois termômetros
    if (cols[0].x >= 30 && cols[1].x <= W - 30) {
      const y1 = SISOL.thermoValueY(y0, hh, cols[0].tmin, cols[0].tmax, cols[0].t);
      const y2 = SISOL.thermoValueY(y0, hh, cols[1].tmin, cols[1].tmax, cols[1].t);
      SISOL.kArrow(ctx, cols[0].x + 13, y1, cols[1].x - 13, y2, {
        color: SISOL.cssVar('--accent-exo', '#f87171'),
        w: 2.2
      });
    }
    if (cols[2].x >= 30 && cols[3].x <= W - 30) {
      const y3 = SISOL.thermoValueY(y0, hh, cols[2].tmin, cols[2].tmax, cols[2].t);
      const y4 = SISOL.thermoValueY(y0, hh, cols[3].tmin, cols[3].tmax, cols[3].t);
      SISOL.kArrow(ctx, cols[2].x + 13, y3, cols[3].x - 13, y4, {
        color: SISOL.cssVar('--accent-cyan', '#22d3ee'),
        w: 2.2
      });
    }

    // divisor entre o grupo de ebulição e o de congelamento, com rótulos de grupo
    const midX = (cols[1].x + cols[2].x) / 2;
    if (midX > 30 && midX < W - 30) {
      ctx.save();
      ctx.strokeStyle = SISOL.cssVar('--border');
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, y0 - 22);
      ctx.lineTo(midX, y0 + hh + 34);
      ctx.stroke();
      ctx.restore();
    }
    SISOL.kLabel(ctx, 'PONTO DE EBULIÇÃO', (cols[0].x + cols[1].x) / 2, y0 - 26, {
      size: 9,
      bold: true,
      color: SISOL.cssVar('--text-muted')
    });
    SISOL.kLabel(ctx, 'PONTO DE CONGELAMENTO', (cols[2].x + cols[3].x) / 2, y0 - 26, {
      size: 9,
      bold: true,
      color: SISOL.cssVar('--text-muted')
    });

    // faixa de deslocamento
    const yb = y0 + hh + 46;
    SISOL.kChip(ctx, `ΔTe = +${SISOL.fmt(c.dte, 2)} °C`, cols[0].x + passo * .55, yb, {
      fg: SISOL.cssVar('--accent-exo', '#f87171'),
      bold: true
    });
    SISOL.kChip(ctx, `ΔTc = −${SISOL.fmt(c.dtc, 2)} °C`, cols[2].x + passo * .55, yb, {
      fg: SISOL.cssVar('--accent-cyan', '#22d3ee'),
      bold: true
    });

    // partículas do soluto no líquido — béquer maior, também proporcional
    const px = SISOL.clamp(W * .1, 70, 140);
    if (px > 20 && cols[0].x - px > 50) {
      const bw = SISOL.clamp(W * .1, 70, 110),
        bh = SISOL.clamp(H * .3, 100, 180);
      const n = Math.round(SISOL.clamp(c.part * 8, 0, 60));
      ctx.save();
      ctx.translate(px, y0 + hh * .55);
      SISOL.kBeaker(ctx, 0, -bh * .9, bw, bh, .7, SISOL.cssVar('--accent-primary', '#60a5fa'), {
        alpha: .3,
        rotulo: 'solução'
      });
      for (let i = 0; i < n; i++) {
        const a = i * 2.399 + this.fase * .25;
        const rr = bw * .1 + i % 7 * (bw * .055);
        ctx.fillStyle = this.soluto.dot;
        ctx.globalAlpha = .85;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, -bh * .42 + Math.sin(a * 1.3) * (bh * .24), 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      SISOL.kChip(ctx, `${SISOL.fmt(c.part, 2)} mol/kg de partículas`, px, y0 + hh * .55 + 26, {
        size: 10
      });
      SISOL.kChip(ctx, `M real ${SISOL.fmt(c.Mreal, 1)} × M aparente ${SISOL.fmt(c.Map, 1)} g/mol`, px, y0 + hh * .55 + 46, {
        size: 9,
        fg: this.soluto.i > 1 ? SISOL.cssVar('--accent-amber') : SISOL.cssVar('--text-secondary')
      });
    }
  }
  _drawOsm(ctx, W, H) {
    const o = this._osm();
    // tubo bem maior — usa a maior parte do canvas disponível, em vez de
    // ficar pequeno no meio de uma área vazia
    const cx = W / 2;
    const tw = SISOL.clamp(W * .1, 76, 150),
      gap = SISOL.clamp(W * .04, 32, 70),
      hcol = Math.min(H - 150, 380);
    const topY = Math.max(56, H * .1);
    const dn = o.desnivel * SISOL.clamp(hcol * .14, 22, 40);

    // tubo em U
    ctx.save();
    ctx.strokeStyle = SISOL.cssVar('--glass', 'rgba(148,163,184,.38)');
    ctx.lineWidth = 2.6;
    const lx = cx - gap / 2 - tw,
      rx = cx + gap / 2;
    const bot = topY + hcol;
    ctx.beginPath();
    ctx.moveTo(lx, topY);
    ctx.lineTo(lx, bot - 10);
    ctx.quadraticCurveTo(lx, bot, lx + 12, bot);
    ctx.lineTo(rx + tw - 12, bot);
    ctx.quadraticCurveTo(rx + tw, bot, rx + tw, bot - 10);
    ctx.lineTo(rx + tw, topY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx + tw, topY);
    ctx.lineTo(lx + tw, bot - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx, topY);
    ctx.lineTo(rx, bot - 30);
    ctx.stroke();
    ctx.restore();

    // líquidos
    const nivelBase = topY + hcol * .26;
    const yE = nivelBase + dn,
      yD = nivelBase - dn;
    const azul = SISOL.cssVar('--accent-primary', '#60a5fa');
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.fillStyle = SISOL.kMix(azul, '#ffffff', SISOL.clamp(1 - o.Me, 0, 1) * .35);
    ctx.fillRect(lx + 2, yE, tw - 4, bot - yE - 2);
    ctx.fillStyle = SISOL.kMix(azul, '#ffffff', SISOL.clamp(1 - o.Md, 0, 1) * .35);
    ctx.fillRect(rx + 2, yD, tw - 4, bot - yD - 2);
    ctx.globalAlpha = .5;
    ctx.fillRect(lx + 2, bot - 26, rx + tw - lx - 4, 24);
    ctx.restore();

    // membrana no fundo, no centro — com "poros" para reforçar que é semipermeável
    ctx.save();
    ctx.strokeStyle = SISOL.cssVar('--accent-amber', '#fbbf24');
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, bot - 30);
    ctx.lineTo(cx, bot - 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    for (let yy = bot - 4; yy >= bot - 28; yy -= 6) {
      ctx.beginPath();
      ctx.moveTo(cx - 3, yy);
      ctx.lineTo(cx + 3, yy);
      ctx.stroke();
    }
    ctx.restore();

    // partículas de soluto presas de cada lado
    const desenhaSoluto = (x0, m, y) => {
      const n = Math.round(m * 26);
      ctx.fillStyle = SISOL.cssVar('--accent-secondary', '#a78bfa');
      for (let i = 0; i < n; i++) {
        const a = i * 2.399 + this.fase * .3;
        ctx.beginPath();
        ctx.arc(x0 + tw / 2 + Math.cos(a) * (tw / 2 - 12), y + 24 + i * 17 % Math.max(10, bot - y - 40), 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    desenhaSoluto(lx, o.Me, yE);
    desenhaSoluto(rx, o.Md, yD);

    // pistão de pressão aplicada (osmose reversa) — empurra o lado direito
    if (o.papl > 0) {
      const pistonY = topY + 4 + SISOL.clamp(o.papl / 40, 0, 1) * 12;
      ctx.save();
      ctx.fillStyle = SISOL.cssVar('--text-muted');
      ctx.fillRect(rx + 4, pistonY, tw - 8, 7);
      ctx.strokeStyle = SISOL.cssVar('--accent-exo', '#f87171');
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const px = rx + tw * .22 + i * tw * .28;
        ctx.beginPath();
        ctx.moveTo(px, pistonY - 15);
        ctx.lineTo(px, pistonY - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 4, pistonY - 7);
        ctx.lineTo(px, pistonY - 2);
        ctx.lineTo(px + 4, pistonY - 7);
        ctx.stroke();
      }
      ctx.restore();
      SISOL.kChip(ctx, `${SISOL.fmt(o.papl, 1)} atm aplicada`, rx + tw / 2, pistonY + 20, {
        size: 10,
        fg: SISOL.cssVar('--accent-exo')
      });
    }
    if (o.reversed) {
      SISOL.kLabel(ctx, 'OSMOSE REVERSA — água pura sendo extraída do lado concentrado', cx, topY - 32, {
        size: 11,
        bold: true,
        color: SISOL.cssVar('--accent-exo', '#f87171')
      });
    }

    // fluxo de água atravessando a membrana — pontinhos em movimento contínuo,
    // não uma seta estática, para deixar claro que é um processo em curso
    if (o.rel !== 'iso') {
      const dir = o.rel === 'dir' ? 1 : -1;
      const yFlow = bot - 16;
      const pts = dir === 1 ? [[cx - 26, yFlow], [cx + 26, yFlow]] : [[cx + 26, yFlow], [cx - 26, yFlow]];
      SISOL.kFlowDots(ctx, pts, SISOL.isReduced() ? 0 : this.fase * .5, 3, o.reversed ? SISOL.cssVar('--accent-exo', '#f87171') : SISOL.cssVar('--accent-ok', '#4ade80'), {
        r: 2.4
      });
    }

    // só UM rótulo por região — o estado geral (isotônico/hipertônico) já
    // aparece no rótulo do canvas (overlay HTML), então aqui ficam só os
    // dados específicos de cada coluna e da membrana, sem repetir a mesma
    // informação duas vezes
    SISOL.kChip(ctx, `${SISOL.fmt(o.Me, 2)} mol/L · π ${SISOL.fmt(o.pe, 2)} atm`, lx + tw / 2, topY - 18, {
      size: 11
    });
    SISOL.kChip(ctx, `${SISOL.fmt(o.Md, 2)} mol/L · π ${SISOL.fmt(o.pd, 2)} atm`, rx + tw / 2, topY - 18, {
      size: 11
    });
    SISOL.kLabel(ctx, 'membrana semipermeável', cx, bot + 20, {
      size: 10,
      color: SISOL.cssVar('--accent-amber')
    });
  }
  _drawHenry(ctx, W, H, app) {
    const K = this.henry,
      g = K.gas;
    // garrafa e gráfico bem maiores — usam proporções do canvas, não mais
    // um tamanho fixo pequeno perdido numa área grande e vazia
    const cx = SISOL.clamp(W * .24, 100, 190),
      topY = H * .14,
      bw = SISOL.clamp(W * .2, 110, 190),
      bh = Math.min(H * .62, 320);
    const Patual = K.aberto ? 1 : K.P;
    ctx.save();
    ctx.translate(cx, 0);
    const box = SISOL.kBeaker(ctx, 0, topY, bw, bh, .68, g.cor, {
      alpha: .18 + .55 * SISOL.clamp(K.C / (g.kH25 * 10), 0, 1),
      rotulo: g.nome
    });
    // gás dissolvido: pontinhos numerosos e praticamente parados (só um leve
    // tremor browniano), com densidade proporcional a C — bem diferente das
    // bolhas grandes que sobem e escapam quando a garrafa está aberta.
    const nMicro = SISOL.clamp(Math.round(K.C / g.kH25 * 14), 3, 46);
    const fz = SISOL.isReduced() ? 0 : this.fase;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < nMicro; i++) {
      const seed = i * 7.319;
      const jx = Math.sin(fz * 1.3 + seed) * 2,
        jy = Math.cos(fz * 1.1 + seed * 1.7) * 2;
      const mx = Math.sin(seed) * (bw * .32) + jx;
      const my = box.y + 6 + (Math.cos(seed * 2.1) * .5 + .5) * (box.h - 12) + jy;
      ctx.globalAlpha = .3 + .25 * Math.sin(seed * 3);
      ctx.beginPath();
      ctx.arc(mx, my, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    SISOL.kDrawBubbles(ctx, K.bolhas, 'rgba(255,255,255,.75)');
    ctx.save();
    ctx.globalAlpha = SISOL.clamp(Patual / 6, .08, .5);
    ctx.fillStyle = g.cor;
    ctx.beginPath();
    ctx.ellipse(0, topY - 2, bw * .42, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = SISOL.cssVar('--glass');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, topY - 18);
    ctx.lineTo(-14, topY - 30);
    ctx.lineTo(14, topY - 30);
    ctx.lineTo(14, topY - 18);
    ctx.stroke();
    if (!K.aberto) {
      ctx.fillStyle = SISOL.cssVar('--accent-amber');
      ctx.fillRect(-16, topY - 34, 32, 8);
    }
    ctx.restore();
    ctx.restore();
    SISOL.kChip(ctx, K.aberto ? 'ABERTA · 1 atm' : `FECHADA · ${SISOL.fmt(K.P, 1)} atm`, cx, topY + bh + 26, {
      fg: K.aberto ? SISOL.cssVar('--accent-ok') : SISOL.cssVar('--accent-amber'),
      bold: true,
      size: 11
    });
    if (K.liberando) SISOL.kChip(ctx, 'liberando gás…', cx, topY + bh + 46, {
      fg: SISOL.cssVar('--accent-exo'),
      size: 10
    });
    const gx = W * .48,
      gy = H * .1,
      gw = Math.min(W * .46, 440),
      gh = Math.min(H - 130, 340);
    const kH = this._henryKH(g, K.T),
      pmax = 12;
    const A = SISOL.kAxes(ctx, {
      x: gx,
      y: gy,
      w: gw,
      h: gh,
      xmin: 0,
      xmax: pmax,
      ymin: 0,
      ymax: kH * pmax * 1.18,
      xticks: [0, 2, 4, 6, 8, 10, 12],
      yticks: [0, kH * 4, kH * 8, kH * 12].map(v => Number(v.toFixed(6))),
      xlab: 'Pressão (atm)',
      ylab: 'C dissolvida (mol/L)',
      fmty: v => SISOL.fmt(v * 1000, 1)
    });
    const pts = [];
    for (let p = 0; p <= pmax; p += .25) pts.push([p, kH * p]);
    SISOL.kLine(ctx, pts, A.px, A.py, {
      color: g.cor,
      w: 2.6
    });
    // só o marcador do ponto atual — o valor exato de C já está no painel de
    // resultados e no rótulo do topo do canvas, então não repetimos aqui
    ctx.save();
    ctx.fillStyle = g.cor;
    ctx.beginPath();
    ctx.arc(A.px(Patual), A.py(K.C), 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    SISOL.kLabel(ctx, `escala do eixo Y ×10⁻³ mol/L · kH a ${SISOL.fmt(K.T, 0)} °C = ${SISOL.fmt(kH * 1000, 2)}×10⁻³`, gx + gw / 2, gy + gh + 30, {
      size: 10,
      color: SISOL.cssVar('--text-secondary')
    });
  }
  _drawRaoult(ctx, W, H) {
    if (this.raoult.vista === 'balao') return this._drawRaoultBalao(ctx, W, H);
    if (this.raoult.vista === 'desafio') return this._drawRaoultDesafio(ctx, W, H);
    const r = this._raoult();
    const pmax = Math.max(r.PA0, r.PB0) * 1.35;
    const gw = W - 104,
      gh = H - 118;

    // legenda explicativa em linguagem simples — muda conforme o tipo de
    // desvio, pra deixar claro ANTES de olhar o gráfico o que está em jogo
    const explicacao = r.Am === 0 ? `${r.A.nome} e ${r.B.nome} interagem entre si igual a como interagem consigo mesmas — mistura ideal, segue Raoult à risca.` : r.Am > 0 ? `${r.A.nome} e ${r.B.nome} se atraem MENOS entre si do que consigo mesmas — "preferem" escapar, então a pressão real fica ACIMA do previsto.` : `${r.A.nome} e ${r.B.nome} se atraem MAIS entre si do que consigo mesmas — "preferem" ficar líquidas, então a pressão real fica ABAIXO do previsto.`;
    SISOL.kLabel(ctx, explicacao, W / 2, 16, {
      size: 11,
      bold: true,
      color: SISOL.cssVar('--text-primary'),
      maxW: gw + 60
    });
    const m = SISOL.kAxes(ctx, {
      x: 58,
      y: 46,
      w: gw,
      h: gh,
      xmin: 0,
      xmax: 1,
      ymin: 0,
      ymax: pmax,
      xticks: [0, .25, .5, .75, 1],
      yticks: [0, pmax * .25, pmax * .5, pmax * .75, pmax],
      xlab: `fração molar de ${r.A.nome} (x)`,
      ylab: 'Pressão de vapor (mmHg)'
    });

    // reta ideal (Lei de Raoult) — sempre uma linha reta entre P°B (x=0) e P°A (x=1)
    ctx.save();
    ctx.setLineDash([5, 4]);
    SISOL.kLine(ctx, [[0, r.PB0], [1, r.PA0]], m.px, m.py, {
      color: SISOL.cssVar('--text-muted'),
      w: 1.8
    });
    ctx.setLineDash([]);
    ctx.restore();
    SISOL.kLabel(ctx, 'previsão ideal (Raoult)', m.px(.5), m.py((r.PA0 + r.PB0) / 2) - 10, {
      size: 10,
      color: SISOL.cssVar('--text-muted')
    });

    // curva real (ideal, positiva ou negativa) — recortada à área do gráfico
    // por segurança, mesmo cuidado do modo de pressão de vapor
    const curvaReal = [];
    for (let x = 0; x <= 1.0001; x += 0.02) curvaReal.push([Math.min(x, 1), this._raoultP(Math.min(x, 1), this.raoult.T, r.Am, r.A, r.B).Preal]);
    ctx.save();
    ctx.beginPath();
    ctx.rect(58, 46, gw, gh);
    ctx.clip();
    SISOL.kLine(ctx, curvaReal, m.px, m.py, {
      color: SISOL.cssVar('--accent-primary', '#60a5fa'),
      w: 2.8
    });
    ctx.restore();
    SISOL.kLabel(ctx, 'realidade medida', m.px(.5), m.py(this._raoultP(.5, this.raoult.T, r.Am, r.A, r.B).Preal) + (r.Am >= 0 ? 16 : -14), {
      size: 10,
      color: SISOL.cssVar('--accent-primary'),
      bold: true
    });

    // pontos dos líquidos puros
    SISOL.kLabel(ctx, `${r.B.nome} pura`, m.px(0) + 4, m.py(r.PB0) - 10, {
      size: 10,
      align: 'left',
      color: r.B.cor,
      bold: true
    });
    SISOL.kLabel(ctx, `${r.A.nome} pura`, m.px(1) - 4, m.py(r.PA0) - 10, {
      size: 10,
      align: 'right',
      color: r.A.cor,
      bold: true
    });

    // azeótropo, se existir — caixa de explicação, não só um chip pequeno
    if (r.azeo) {
      ctx.save();
      ctx.fillStyle = SISOL.cssVar('--accent-amber', '#fbbf24');
      ctx.beginPath();
      ctx.arc(m.px(r.azeo.x), m.py(r.azeo.p), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      const ladoDir = r.azeo.x > .6;
      const bx = m.px(r.azeo.x) + (ladoDir ? -8 : 8);
      const by = m.py(r.azeo.p) + (r.Am > 0 ? -46 : 34);
      SISOL.kChip(ctx, `azeótropo em x≈${SISOL.fmt(r.azeo.x, 2)}`, bx, by, {
        fg: SISOL.cssVar('--accent-amber'),
        bold: true,
        size: 11,
        border: SISOL.cssVar('--accent-amber'),
        align: ladoDir ? 'right' : 'left'
      });
      SISOL.kLabel(ctx, 'aqui destilar não separa mais os líquidos', bx, by + 16, {
        size: 9,
        color: SISOL.cssVar('--accent-amber'),
        align: ladoDir ? 'right' : 'left'
      });
    }
    // referência real documentada (etanol+água): uma linha fina mostrando
    // onde o azeótropo REAL fica, pra comparar com o previsto pelo modelo
    if (r.realRef) {
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = SISOL.cssVar('--accent-ok', '#4ade80');
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(m.px(r.realRef.xA), m.py(0));
      ctx.lineTo(m.px(r.realRef.xA), m.py(pmax * .18));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      SISOL.kLabel(ctx, `valor real: x≈${SISOL.fmt(r.realRef.xA, 2)}`, m.px(r.realRef.xA), m.py(pmax * .18) + 14, {
        size: 9,
        color: SISOL.cssVar('--accent-ok'),
        bold: true
      });
    }

    // composição atual — guia pontilhada + marcador
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = SISOL.cssVar('--text-muted');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.px(r.xA), m.py(0));
    ctx.lineTo(m.px(r.xA), m.py(r.Preal));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = SISOL.cssVar('--accent-ok', '#4ade80');
    ctx.beginPath();
    ctx.arc(m.px(r.xA), m.py(r.Preal), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = SISOL.cssVar('--text-secondary');
    ctx.beginPath();
    ctx.arc(m.px(r.xA), m.py(r.Pideal), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const desvioTxt = r.Am === 0 ? 'ideal — segue Raoult' : r.Am > 0 ? 'desvio positivo' : 'desvio negativo';
    SISOL.kLabel(ctx, `x=${SISOL.fmt(r.xA, 2)} · P real ${SISOL.fmt(r.Preal, 0)} mmHg · P ideal ${SISOL.fmt(r.Pideal, 0)} mmHg · ${desvioTxt}`, m.px(.5), m.py(0) + 30, {
      size: 11,
      color: SISOL.cssVar('--text-secondary')
    });
  }

  /** MECÂNICA 1 — Visão Balão: em vez de olhar só pro gráfico, o estudante
   *  monta a mistura pingando mL de cada líquido (convertidos em mol via
   *  densidade/massa molar) num balão FECHADO, e vê partículas líquidas e
   *  de vapor — a cor do vapor reflete Yₐ, a composição real do vapor em
   *  equilíbrio (o que sairia primeiro numa destilação). */
  _drawRaoultBalao(ctx, W, H) {
    const Ra = this.raoult;
    const mol = this._raoultMoles();
    const Am = Ra.desvio === 'positivo' ? 1.1 : Ra.desvio === 'negativo' ? -1.1 : 0;
    const r = this._raoultP(mol.xA, Ra.T, Am, mol.A, mol.B);
    const cx = SISOL.clamp(W * .3, 140, 230),
      topY = H * .16,
      bw = SISOL.clamp(W * .26, 150, 230),
      bh = Math.min(H * .58, 300);
    SISOL.kLabel(ctx, `Balão fechado: ${mol.A.nome} + ${mol.B.nome} a ${SISOL.fmt(Ra.T, 0)} °C`, W / 2, 18, {
      size: 12,
      bold: true,
      color: SISOL.cssVar('--text-primary')
    });
    ctx.save();
    ctx.translate(cx, 0);
    const corLiquido = SISOL.kMix(mol.A.cor, mol.B.cor, mol.xA);
    const box = SISOL.kBeaker(ctx, 0, topY, bw, bh, .48, corLiquido, {
      alpha: .4,
      rotulo: `x_A = ${SISOL.fmt(mol.xA, 2)}`
    });

    // partículas líquidas: nº proporcional aos mols de cada componente
    const nLiq = 46,
      nLiqA = Math.round(nLiq * mol.xA);
    ctx.save();
    for (let i = 0; i < nLiq; i++) {
      const seed = i * 12.9898;
      const px = Math.sin(seed) * (bw * .38);
      const py = box.y + box.h * .25 + (Math.cos(seed * 2.1) * .5 + .5) * (box.h * .68);
      ctx.fillStyle = i < nLiqA ? mol.A.cor : mol.B.cor;
      ctx.globalAlpha = .8;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // vapor no espaço selado acima do líquido — quantidade ∝ pressão total,
    // MISTURA de cores ∝ Yₐ (não é a mesma proporção do líquido!)
    const fz = SISOL.isReduced() ? 0 : this.fase;
    const nVapor = SISOL.clamp(Math.round(r.Preal / 10), 4, 60);
    const nVaporA = Math.round(nVapor * r.YA);
    ctx.save();
    for (let i = 0; i < nVapor; i++) {
      const seed = i * 7.319 + 100;
      const jx = Math.sin(fz * 1.2 + seed) * 4,
        jy = Math.cos(fz * 1.4 + seed * 1.6) * 4;
      const px = Math.sin(seed) * (bw * .42) + jx;
      const py = topY + 10 + (Math.cos(seed * 2.3) * .5 + .5) * (box.y - topY - 8) + jy;
      ctx.fillStyle = i < nVaporA ? mol.A.cor : mol.B.cor;
      ctx.globalAlpha = .55;
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // selo do balão (fechado — nada escapa, só redistribui entre líquido e vapor)
    ctx.save();
    ctx.strokeStyle = SISOL.cssVar('--glass');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, topY - 4);
    ctx.lineTo(-14, topY - 20);
    ctx.lineTo(14, topY - 20);
    ctx.lineTo(14, topY - 4);
    ctx.stroke();
    ctx.fillStyle = SISOL.cssVar('--accent-amber');
    ctx.fillRect(-16, topY - 24, 32, 8);
    ctx.restore();
    ctx.restore();

    // legendas de cor + composição do vapor vs líquido, lado a lado
    const gx = W * .62,
      gy = H * .18;
    SISOL.kChip(ctx, `${mol.A.nome}`, gx, gy, {
      fg: mol.A.cor,
      bold: true,
      size: 12,
      border: mol.A.cor
    });
    SISOL.kChip(ctx, `${mol.B.nome}`, gx + 130, gy, {
      fg: mol.B.cor,
      bold: true,
      size: 12,
      border: mol.B.cor
    });
    SISOL.kLabel(ctx, `líquido: x_A = ${SISOL.fmt(mol.xA, 2)}  ·  vapor: Y_A = ${SISOL.fmt(r.YA, 2)}`, gx + 60, gy + 32, {
      size: 12,
      bold: true,
      color: SISOL.cssVar('--text-primary')
    });
    const destaque = r.YA > mol.xA + 0.03 ? `${mol.A.nome} é mais volátil — o vapor fica mais rico nele que o líquido.` : r.YA < mol.xA - 0.03 ? `${mol.B.nome} é mais volátil aqui — o vapor fica mais pobre em ${mol.A.nome} que o líquido.` : 'Vapor e líquido têm composição parecida nesse ponto.';
    SISOL.kLabel(ctx, destaque, gx + 60, gy + 54, {
      size: 10,
      color: SISOL.cssVar('--text-secondary'),
      maxW: 240
    });
    SISOL.kLabel(ctx, `P total = ${SISOL.fmt(r.Preal, 0)} mmHg`, gx + 60, gy + 78, {
      size: 11,
      color: SISOL.cssVar('--text-secondary')
    });
  }

  /** MECÂNICA 2 — Desafio da Destilação: a cada clique em "Destilar", a
   *  composição do líquido SALTA para a composição do vapor em equilíbrio
   *  (Yₐ) — simulando um estágio de destilação simples. Repetir isso
   *  aproxima de x=1 (pureza) SE não houver azeótropo no caminho; se
   *  houver (par real: etanol+água), a composição trava exatamente nele. */
  _drawRaoultDesafio(ctx, W, H) {
    const Ra = this.raoult;
    const desafio = this.D.DESAFIOS_DESTILACAO.find(d => d.id === Ra.desafioId);
    const A = this.D.LIQUIDOS.find(l => l.id === desafio.aId),
      B = this.D.LIQUIDOS.find(l => l.id === desafio.bId);
    const Am = desafio.desvio === 'positivo' ? 1.1 : desafio.desvio === 'negativo' ? -1.1 : 0;
    const pmax = Math.max(SISOL.antoinePv(A.antoine, desafio.T), SISOL.antoinePv(B.antoine, desafio.T)) * 1.35;
    const gw = W - 104,
      gh = H - 150;
    SISOL.kLabel(ctx, desafio.nome, W / 2, 16, {
      size: 13,
      bold: true,
      color: SISOL.cssVar('--text-primary')
    });
    SISOL.kLabel(ctx, desafio.contexto, W / 2, 34, {
      size: 10,
      color: SISOL.cssVar('--text-secondary'),
      maxW: gw
    });
    const m = SISOL.kAxes(ctx, {
      x: 58,
      y: 54,
      w: gw,
      h: gh,
      xmin: 0,
      xmax: 1,
      ymin: 0,
      ymax: pmax,
      xticks: [0, .25, .5, .75, 1],
      yticks: [0, pmax * .25, pmax * .5, pmax * .75, pmax],
      xlab: `fração molar de ${A.nome} (x)`,
      ylab: 'Pressão de vapor (mmHg)'
    });
    SISOL.kLine(ctx, [[0, SISOL.antoinePv(B.antoine, desafio.T)], [1, SISOL.antoinePv(A.antoine, desafio.T)]], m.px, m.py, {
      color: SISOL.cssVar('--text-muted'),
      w: 1.6
    });
    const curvaReal = [];
    for (let x = 0; x <= 1.0001; x += 0.02) curvaReal.push([Math.min(x, 1), this._raoultP(Math.min(x, 1), desafio.T, Am, A, B).Preal]);
    ctx.save();
    ctx.beginPath();
    ctx.rect(58, 54, gw, gh);
    ctx.clip();
    SISOL.kLine(ctx, curvaReal, m.px, m.py, {
      color: SISOL.cssVar('--accent-primary', '#60a5fa'),
      w: 2.4
    });
    ctx.restore();

    // trilha do histórico de composições já visitadas (staircase da destilação)
    ctx.save();
    ctx.strokeStyle = SISOL.cssVar('--text-muted');
    ctx.globalAlpha = .5;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([2, 2]);
    Ra.historico.forEach((x, i) => {
      if (i === 0) return;
      const pAnt = this._raoultP(Ra.historico[i - 1], desafio.T, Am, A, B).Preal;
      const pAtu = this._raoultP(x, desafio.T, Am, A, B).Preal;
      ctx.beginPath();
      ctx.moveTo(m.px(Ra.historico[i - 1]), m.py(pAnt));
      ctx.lineTo(m.px(x), m.py(pAtu));
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();
    Ra.historico.forEach((x, i) => {
      const p = this._raoultP(x, desafio.T, Am, A, B).Preal;
      ctx.save();
      ctx.fillStyle = SISOL.cssVar('--text-muted');
      ctx.globalAlpha = .35 + .5 * (i / Math.max(1, Ra.historico.length - 1));
      ctx.beginPath();
      ctx.arc(m.px(x), m.py(p), 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ponto atual — grande, com pulso se travado
    const pAtual = this._raoultP(Ra.desafioXA, desafio.T, Am, A, B).Preal;
    const pulso = Ra.travado && !SISOL.isReduced() ? Math.sin(this.fase * 4) * 2 : 0;
    ctx.save();
    ctx.fillStyle = Ra.travado ? SISOL.cssVar('--accent-exo', '#f87171') : SISOL.cssVar('--accent-ok', '#4ade80');
    ctx.beginPath();
    ctx.arc(m.px(Ra.desafioXA), m.py(pAtual), 7 + pulso, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // azeótropo de referência (mesma varredura do modo gráfico)
    if (Am !== 0) {
      let best = null;
      for (let x = 0.02; x <= 0.98; x += 0.01) {
        const p = this._raoultP(x, desafio.T, Am, A, B).Preal;
        if (!best || (Am > 0 ? p > best.p : p < best.p)) best = {
          x,
          p
        };
      }
      if (best.x > 0.03 && best.x < 0.97) {
        ctx.save();
        ctx.strokeStyle = SISOL.cssVar('--accent-amber');
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.px(best.x), m.py(0));
        ctx.lineTo(m.px(best.x), m.py(pmax));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // status: progresso normal ou travado no azeótropo
    const statusY = H - 46;
    if (Ra.travado) {
      SISOL.kIconLock(ctx, W / 2, statusY - 16, 15, SISOL.cssVar('--accent-exo', '#f87171'));
      SISOL.kLabel(ctx, `TRAVADO NO AZEÓTROPO após ${Ra.ciclos} ciclos — o vapor tem a MESMA composição do líquido: destilação simples não passa daqui.`, W / 2, statusY, {
        size: 12,
        bold: true,
        color: SISOL.cssVar('--accent-exo', '#f87171'),
        maxW: gw
      });
    } else {
      SISOL.kLabel(ctx, `Ciclo ${Ra.ciclos} · pureza de ${A.nome}: ${SISOL.fmt(Ra.desafioXA * 100, 1)}%`, W / 2, statusY, {
        size: 12,
        bold: true,
        color: SISOL.cssVar('--accent-ok', '#4ade80')
      });
    }
  }

  /* ── resultados ── */
  getResults() {
    if (this.modo === 'pvap') {
      const s = this._pv();
      return [{
        l: 'Líquido',
        v: this.liquido.nome
      }, {
        l: 'Temperatura',
        v: SISOL.fmt(this.tpv, 0) + ' °C'
      }, {
        l: 'Pressão de vapor',
        v: SISOL.fmt(s.pv, 1) + ' mmHg'
      }, {
        l: 'Pressão externa',
        v: SISOL.fmt(this.patm, 0) + ' mmHg'
      }, {
        l: 'Ferve a',
        v: SISOL.fmt(s.te, 1) + ' °C'
      }, {
        l: 'Estado',
        v: s.fervendo ? 'em ebulição' : 'líquido',
        cls: s.fervendo ? 'val-exo' : ''
      }];
    }
    if (this.modo === 'colig') {
      const c = this._colig(),
        S = this.solvente;
      return [{
        l: 'Solvente',
        v: S.nome
      }, {
        l: 'Soluto',
        v: this.soluto.nome
      }, {
        l: 'Fator i',
        v: String(this.soluto.i)
      }, {
        l: 'Molalidade W',
        v: SISOL.fmt(this.w, 2) + ' mol/kg'
      }, {
        l: 'Partículas W·i',
        v: SISOL.fmt(c.part, 2) + ' mol/kg'
      }, {
        l: 'ΔTe',
        v: '+' + SISOL.fmt(c.dte, 2) + ' °C'
      }, {
        l: 'Ferve a',
        v: SISOL.fmt(c.te, 2) + ' °C',
        cls: 'val-exo'
      }, {
        l: 'ΔTc',
        v: '−' + SISOL.fmt(c.dtc, 2) + ' °C'
      }, {
        l: 'Congela a',
        v: SISOL.fmt(c.tc, 2) + ' °C',
        cls: 'val-endo'
      }, {
        l: `P_vapor (${SISOL.fmt(S.Te, 0)} °C)`,
        v: SISOL.fmt(c.p, 1) + ' mmHg'
      }, {
        l: 'Massa molar REAL',
        v: SISOL.fmt(c.Mreal, 1) + ' g/mol'
      }, {
        l: 'Massa molar aparente (se ignorar i)',
        v: SISOL.fmt(c.Map, 1) + ' g/mol',
        cls: this.soluto.i > 1 ? 'val-exo' : ''
      }];
    }
    if (this.modo === 'osmose') {
      const o = this._osm();
      return [{
        l: 'Modo',
        v: this.osm.modoRO ? 'osmose reversa' : 'osmose direta'
      }, {
        l: 'M esquerda' + (this.osm.running ? ' (ao vivo)' : ''),
        v: SISOL.fmt(o.Me, 2) + ' mol/L'
      }, {
        l: 'M direita' + (this.osm.running ? ' (ao vivo)' : ''),
        v: SISOL.fmt(o.Md, 2) + ' mol/L'
      }, {
        l: 'Temperatura',
        v: SISOL.fmt(this.tosm, 0) + ' °C'
      }, {
        l: 'π esquerda',
        v: SISOL.fmt(o.pe, 2) + ' atm'
      }, {
        l: 'π direita',
        v: SISOL.fmt(o.pd, 2) + ' atm'
      }, {
        l: 'Δπ (pressão osmótica)',
        v: SISOL.fmt(o.dpi, 2) + ' atm'
      }, ...(this.osm.modoRO ? [{
        l: 'Pressão aplicada',
        v: SISOL.fmt(o.papl, 1) + ' atm',
        cls: o.reversed ? 'val-exo' : ''
      }] : []), {
        l: 'Fluxo de água',
        v: o.rel === 'iso' ? this.osm.running ? 'equilíbrio atingido' : 'equilíbrio' : (o.rel === 'dir' ? 'esquerda → direita' : 'direita → esquerda') + (o.reversed ? ' (revertido)' : ''),
        cls: o.reversed ? 'val-exo' : 'val-ok'
      }];
    }
    if (this.modo === 'raoult') {
      const Ra = this.raoult;
      if (Ra.vista === 'balao') {
        const mol = this._raoultMoles();
        const Am = Ra.desvio === 'positivo' ? 1.1 : Ra.desvio === 'negativo' ? -1.1 : 0;
        const r = this._raoultP(mol.xA, Ra.T, Am, mol.A, mol.B);
        return [{
          l: 'Vista',
          v: 'Balão (evaporação partícula a partícula)'
        }, {
          l: `${mol.A.nome} adicionado`,
          v: `${SISOL.fmt(Ra.volA, 0)} mL · ${SISOL.fmt(mol.molA, 3)} mol`
        }, {
          l: `${mol.B.nome} adicionado`,
          v: `${SISOL.fmt(Ra.volB, 0)} mL · ${SISOL.fmt(mol.molB, 3)} mol`
        }, {
          l: 'Fração molar do líquido (x_A)',
          v: SISOL.fmt(mol.xA, 3)
        }, {
          l: 'Fração molar do vapor (Y_A)',
          v: SISOL.fmt(r.YA, 3),
          cls: 'val-ok'
        }, {
          l: 'Pressão total',
          v: SISOL.fmt(r.Preal, 0) + ' mmHg'
        }];
      }
      if (Ra.vista === 'desafio') {
        const desafio = this.D.DESAFIOS_DESTILACAO.find(d => d.id === Ra.desafioId);
        return [{
          l: 'Desafio',
          v: desafio.nome
        }, {
          l: 'Ciclos de destilação',
          v: String(Ra.ciclos)
        }, {
          l: `Pureza atual de ${this.D.LIQUIDOS.find(l => l.id === desafio.aId).nome}`,
          v: SISOL.fmt(Ra.desafioXA * 100, 1) + ' %',
          cls: Ra.travado ? 'val-exo' : 'val-ok'
        }, {
          l: 'Estado',
          v: Ra.travado ? 'travado no azeótropo' : 'destilando',
          cls: Ra.travado ? 'val-exo' : ''
        }];
      }
      const r = this._raoult();
      const rows = [{
        l: 'Vista',
        v: 'Gráfico'
      }, {
        l: 'Líquido A',
        v: r.A.nome
      }, {
        l: 'Líquido B',
        v: r.B.nome
      }, {
        l: 'Temperatura',
        v: SISOL.fmt(this.raoult.T, 0) + ' °C'
      }, {
        l: 'Fração molar de A (x)',
        v: SISOL.fmt(r.xA, 2)
      }, {
        l: 'P° de A pura / B pura',
        v: `${SISOL.fmt(r.PA0, 0)} / ${SISOL.fmt(r.PB0, 0)} mmHg`
      }, {
        l: 'P ideal (Raoult)',
        v: SISOL.fmt(r.Pideal, 0) + ' mmHg'
      }, {
        l: 'P real (com desvio)',
        v: SISOL.fmt(r.Preal, 0) + ' mmHg',
        cls: r.Am === 0 ? '' : r.Am > 0 ? 'val-ok' : 'val-exo'
      }, {
        l: 'Tipo de desvio',
        v: r.Am === 0 ? 'ideal (γ=1)' : r.Am > 0 ? 'positivo' : 'negativo'
      }];
      if (r.azeo) rows.push({
        l: 'Azeótropo (x, P)',
        v: `${SISOL.fmt(r.azeo.x, 2)} · ${SISOL.fmt(r.azeo.p, 0)} mmHg`
      });
      if (r.realRef) rows.push({
        l: 'Valor real documentado',
        v: `x≈${SISOL.fmt(r.realRef.xA, 2)} (${r.realRef.fonte})`,
        cls: 'val-ok'
      });
      return rows;
    }
    const K = this.henry,
      kH = this._henryKH(K.gas, K.T);
    const alvo = K.aberto ? this._henryEq(K.gas, K.T, 1) : this._henryEq(K.gas, K.T, K.P);
    return [{
      l: 'Gás',
      v: K.gas.nome
    }, {
      l: 'Temperatura',
      v: SISOL.fmt(K.T, 0) + ' °C'
    }, {
      l: K.aberto ? 'Pressão (atmosférica)' : 'Pressão (garrafa fechada)',
      v: SISOL.fmt(K.aberto ? 1 : K.P, K.aberto ? 0 : 1) + ' atm'
    }, {
      l: 'kH nessa temperatura',
      v: SISOL.fmt(kH * 1000, 3) + '×10⁻³ mol/L/atm'
    }, {
      l: 'C dissolvida (ao vivo)',
      v: SISOL.fmt(K.C * 1000, 3) + '×10⁻³ mol/L',
      cls: 'val-ok'
    }, {
      l: 'C de equilíbrio',
      v: SISOL.fmt(alvo * 1000, 3) + '×10⁻³ mol/L'
    }, {
      l: 'Estado',
      v: K.liberando ? 'liberando gás em bolhas' : K.aberto ? 'aberta, em equilíbrio' : 'fechada, em equilíbrio',
      cls: K.liberando ? 'val-exo' : ''
    }];
  }
  getOverlay() {
    if (this.modo === 'pvap') return `${this.liquido.nome} · ${SISOL.fmt(this.tpv, 0)} °C`;
    if (this.modo === 'colig') return `${this.soluto.nome} em ${this.solvente.nome} · ${SISOL.fmt(this.w, 2)} molal`;
    if (this.modo === 'henry') return `${this.henry.gas.nome} · ${SISOL.fmt(this.henry.C * 1000, 2)}×10⁻³ mol/L`;
    if (this.modo === 'raoult') {
      const Ra = this.raoult;
      if (Ra.vista === 'balao') {
        const mol = this._raoultMoles();
        return `${mol.A.nome}+${mol.B.nome} · x=${SISOL.fmt(mol.xA, 2)}`;
      }
      if (Ra.vista === 'desafio') {
        const desafio = this.D.DESAFIOS_DESTILACAO.find(d => d.id === Ra.desafioId);
        return Ra.travado ? `Travado no azeótropo · ciclo ${Ra.ciclos}` : `${desafio.nome.replace(/^Desafio \d: /, '')} · ciclo ${Ra.ciclos}`;
      }
      const r = this._raoult();
      return r.azeo ? `${r.A.nome}+${r.B.nome} · azeótropo x≈${SISOL.fmt(r.azeo.x, 2)}` : `${r.A.nome}+${r.B.nome} · x=${SISOL.fmt(r.xA, 2)}`;
    }
    const o = this._osm();
    return o.reversed ? `Osmose REVERSA · ${SISOL.fmt(o.papl, 1)} atm aplicada` : o.rel === 'iso' ? 'Soluções isotônicas' : 'Osmose · Δπ ' + SISOL.fmt(o.dpi, 2) + ' atm';
  }
};
// ══════════════════════════════════════════════════════════════════
// MECH — FACHADA que une as duas mecânicas deste simulador.
// D.MECH_B (no arquivo de dados) lista os ids de modo atendidos pela
// segunda mecânica; todos os demais vão para a primeira. O App
// conversa apenas com esta classe, exatamente como num simulador de
// mecânica única — cada mecânica interna permanece intocada.
// ══════════════════════════════════════════════════════════════════
SISOL.Mech = class Mech {
  constructor(D) {
    this.D = D;
    this.a = new SISOL.MechA(D);
    this.b = new SISOL.MechB(D);
    this._bSet = new Set(D.MECH_B || []);
    this.cur = this.a;
  }
  set app(v) {
    this._app = v;
    this.a.app = v;
    this.b.app = v;
  }
  get app() {
    return this._app;
  }
  build(app) {
    if (typeof this.a.build === 'function') this.a.build(app);
    if (typeof this.b.build === 'function') this.b.build(app);
  }
  setMode(id) {
    this.cur = this._bSet.has(id) ? this.b : this.a;
    this.cur.setMode(id);
  }
  setParam(k, v) {
    return this.cur.setParam(k, v);
  }
  action(n, el) {
    return this.cur.action(n, el);
  }
  update(dt, app) {
    this.cur.update(dt, app);
  }
  draw(ctx, W, H, app) {
    this.cur.draw(ctx, W, H, app);
  }
  getResults() {
    return this.cur.getResults();
  }
  getOverlay() {
    return this.cur.getOverlay ? this.cur.getOverlay() : '';
  }
  onArrow(dx, dy) {
    return this.cur.onArrow ? this.cur.onArrow(dx, dy) : false;
  }
  onDrag(dx, dy) {
    if (this.cur.onDrag) this.cur.onDrag(dx, dy);
  }
};