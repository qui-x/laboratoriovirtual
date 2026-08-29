/* ====================================================================
   SIMULADOR DE ESTEQUIOMETRIA — script.js (versão 100% 2D)
   Renderização: Canvas 2D puro (sem WebGL/Three.js).
   Física: Matter.js (motor de corpos rígidos 2D), ligações modeladas
   como constraints elásticos (lei de Hooke) com comprimento ajustável
   em tempo real — permite a vibração/ruptura sem depender de força
   bruta, evitando problemas de calibração entre massa/força.
   Elétrons: cada átomo carrega pares isolados (fixos) e elétrons de
   valência livres (desenhados como pontos amarelos órbitando o núcleo).
   Ao formar/romper uma ligação, os elétrons voam visivelmente entre o
   átomo e o ponto médio da ligação (par compartilhado).
   ==================================================================== */

/* ════════════════════════════════════════════════════════════════
   ACESSIBILIDADE — CONTRATO DO LABORATÓRIO VIRTUAL
   ─────────────────────────────────────────────────────────────────
   Recebe os parâmetros de URL enviados pelo hub ao abrir o simulador:
     ?theme=dark|light          → data-theme no <html>
     &contrast=true|false       → data-contrast="on" no <html>
     &fontscale=0.75..1.5       → --font-scale no <html>
     &spacing=true|false        → data-spacing="on" no <html>
     &motion=true|false         → data-motion="on" no <html>
     &reading=on|off            → data-reading="on" no <html>
     &colorblind=none|protanopia|deuteranopia|tritanopia|acromatopsia
                                → #colorblindOverlay (backdrop-filter)
   Também escuta postMessage do hub para atualizações em tempo real
   sem recarregar a página (quando o usuário muda a preferência após
   abrir o simulador via iframe ou navegação com histórico).
   NÃO há controles próprios aqui — a escolha é sempre feita no hub.
   ════════════════════════════════════════════════════════════════ */
(function iniciarA11y() {
  const html = document.documentElement;
  const COLORBLIND_OK = ["protanopia", "deuteranopia", "tritanopia", "acromatopsia"];

  function aplicar(params) {
    /* tema */
    const theme = params.get("theme");
    if (theme === "light" || theme === "dark") html.setAttribute("data-theme", theme);

    /* alto contraste */
    const contrast = params.get("contrast");
    html.setAttribute("data-contrast", contrast === "true" ? "on" : "off");

    /* escala de fonte */
    const fs = parseFloat(params.get("fontscale"));
    if (!isNaN(fs) && fs >= 0.75 && fs <= 1.5) {
      html.style.setProperty("--font-scale", fs);
    }

    /* espaçamento de letras */
    const spacing = params.get("spacing");
    html.setAttribute("data-spacing", spacing === "true" ? "on" : "off");

    /* reduzir animações */
    const motion = params.get("motion");
    html.setAttribute("data-motion", motion === "true" ? "on" : "off");

    /* leitura simples */
    const reading = params.get("reading");
    html.setAttribute("data-reading", reading === "on" ? "on" : "off");

    /* daltonismo — overlay fixo com backdrop-filter (não body.style.filter,
       que quebraria elementos position:fixed/absolute do simulador) */
    const cb = params.get("colorblind");
    const overlay = document.getElementById("colorblindOverlay");
    if (overlay) {
      const val = (cb && COLORBLIND_OK.includes(cb)) ? "url(#f-" + cb + ")" : "none";
      overlay.style.backdropFilter = val;
      overlay.style.webkitBackdropFilter = val;
    }
  }

  /* --- aplica na abertura via URL --- */
  const url = new URLSearchParams(location.search);
  if ([...url.keys()].length > 0) aplicar(url);

  /* --- escuta atualizações em tempo real do hub via postMessage --- */
  window.addEventListener("message", (e) => {
    if (!e.data || e.data.source !== "central-simuladores" || e.data.type !== "a11y-update") return;
    const p = e.data.payload || {};
    const map = new URLSearchParams({
      theme:      p.theme      ?? "",
      contrast:   String(p.contrast ?? false),
      fontscale:  String(p.fontScale ?? 1),
      spacing:    String(p.spacing   ?? false),
      motion:     String(p.motion    ?? false),
      reading:    p.reading    ?? "off",
      colorblind: p.colorblind ?? "none",
    });
    aplicar(map);
  });
})();

/* ---------------------------------------------------------------
   1. REGISTRO DE ELEMENTOS — propriedades químicas reais
   - massa molar (g/mol): valores oficiais do CIAAW/IUPAC, tabela
     "Abridged Standard Atomic Weights 2024" (ciaaw.org/abridged-
     atomic-weights.htm).
   - raio (Å): raios de ligação simples de Cordero et al. (2008),
     Dalton Trans., 2832–2838 (covalentes/metaloides) ou raio
     metálico/iônico padrão para os metais.
   - tipo: "covalente" (compartilha pares — usa valence/lonePairs),
     "ionico" (doa elétrons — usa valence como carga/elétrons
     doáveis, lonePairs sempre 0) ou "metalico" (mar de elétrons —
     não segue regra do octeto, valence/lonePairs não se aplicam).
   - valência = nº de elétrons DESPAREADOS (covalente) ou Nº de
     elétrons doáveis = carga iônica (iônico); lonePairs = pares
     isolados (só covalente).
   --------------------------------------------------------------- */
const ELEMENTS = {
  // --- COVALENTES (compartilham pares de elétrons) ---
  H:  { z: 1,  tipo: "covalente", valence: 1, molar: 1.008,  radius: 0.31, lonePairs: 0, colorCss: "#f2f5f7", textColor: "#11151b", categoria: "Não-metal" },
  C:  { z: 6,  tipo: "covalente", valence: 4, molar: 12.011, radius: 0.76, lonePairs: 0, colorCss: "#3a3f47", textColor: "#fff",    categoria: "Não-metal" },
  N:  { z: 7,  tipo: "covalente", valence: 3, molar: 14.007, radius: 0.71, lonePairs: 1, colorCss: "#4c6fff", textColor: "#fff",    categoria: "Não-metal" },
  O:  { z: 8,  tipo: "covalente", valence: 2, molar: 15.999, radius: 0.66, lonePairs: 2, colorCss: "#ff5d5d", textColor: "#fff",    categoria: "Não-metal" },
  F:  { z: 9,  tipo: "covalente", valence: 1, molar: 18.998, radius: 0.57, lonePairs: 3, colorCss: "#b8f24c", textColor: "#15210a", categoria: "Halogênio" },
  Si: { z: 14, tipo: "covalente", valence: 4, molar: 28.085, radius: 1.11, lonePairs: 0, colorCss: "#caa472", textColor: "#241a0a", categoria: "Metaloide" },
  P:  { z: 15, tipo: "covalente", valence: 3, molar: 30.974, radius: 1.07, lonePairs: 1, colorCss: "#ff9d42", textColor: "#2a1500", categoria: "Não-metal" },
  S:  { z: 16, tipo: "covalente", valence: 2, molar: 32.06,  radius: 1.05, lonePairs: 2, colorCss: "#ffd23f", textColor: "#241a02", categoria: "Não-metal" },
  Cl: { z: 17, tipo: "covalente", valence: 1, molar: 35.45,  radius: 1.02, lonePairs: 3, colorCss: "#3ddc6a", textColor: "#08230f", categoria: "Halogênio" },
  Br: { z: 35, tipo: "covalente", valence: 1, molar: 79.904, radius: 1.20, lonePairs: 3, colorCss: "#a83232", textColor: "#fff",    categoria: "Halogênio" },
  I:  { z: 53, tipo: "covalente", valence: 1, molar: 126.90, radius: 1.39, lonePairs: 3, colorCss: "#8b2fb5", textColor: "#fff",    categoria: "Halogênio" },

  // --- IÔNICOS (doam elétrons — formam cátion; valence = carga/e⁻ doáveis) ---
  Li: { z: 3,  tipo: "ionico", valence: 1, molar: 6.94,   radius: 1.28, lonePairs: 0, colorCss: "#c9a0ff", textColor: "#1d0a2e", categoria: "Metal Alcalino" },
  Na: { z: 11, tipo: "ionico", valence: 1, molar: 22.990, radius: 1.66, lonePairs: 0, colorCss: "#ab5cf2", textColor: "#fff",    categoria: "Metal Alcalino" },
  K:  { z: 19, tipo: "ionico", valence: 1, molar: 39.098, radius: 2.03, lonePairs: 0, colorCss: "#8f3fd6", textColor: "#fff",    categoria: "Metal Alcalino" },
  Mg: { z: 12, tipo: "ionico", valence: 2, molar: 24.305, radius: 1.41, lonePairs: 0, colorCss: "#6bcb3c", textColor: "#0a1a04", categoria: "Metal Alcalino-Terroso" },
  Ca: { z: 20, tipo: "ionico", valence: 2, molar: 40.078, radius: 1.76, lonePairs: 0, colorCss: "#3dbb6e", textColor: "#fff",    categoria: "Metal Alcalino-Terroso" },
  Al: { z: 13, tipo: "ionico", valence: 3, molar: 26.982, radius: 1.21, lonePairs: 0, colorCss: "#c0c4cc", textColor: "#15171a", categoria: "Metal" },
  Zn: { z: 30, tipo: "ionico", valence: 2, molar: 65.38,  radius: 1.42, lonePairs: 0, colorCss: "#7d9bb0", textColor: "#fff",    categoria: "Metal de Transição" },
  // Fe: na vida real tem estados de oxidação variáveis (Fe²⁺/Fe³⁺); aqui
  // fixamos Fe³⁺ (valence:3) por ser o mais comum no ensino médio — a
  // ferrugem, Fe2O3. Por isso Fe entra como "ionico", não "metalico".
  Fe: { z: 26, tipo: "ionico", valence: 3, molar: 55.845, radius: 1.32, lonePairs: 0, colorCss: "#d8852b", textColor: "#1a0d00", categoria: "Metal de Transição" },

  // --- METÁLICOS (mar de elétrons deslocalizados — sem regra do octeto) ---
  Cu: { z: 29, tipo: "metalico", valence: 0, lonePairs: 0, molar: 63.546, radius: 1.32, colorCss: "#c87137", textColor: "#fff",    categoria: "Metal de Transição" },
  Sn: { z: 50, tipo: "ionico", valence: 2, lonePairs: 0, molar: 118.71, radius: 1.40, colorCss: "#9fa6ad", textColor: "#15171a", categoria: "Metal" },
  Au: { z: 79, tipo: "metalico", valence: 0, lonePairs: 0, molar: 196.97, radius: 1.36, colorCss: "#ffd24c", textColor: "#241a00", categoria: "Metal de Transição" },
  Ag: { z: 47, tipo: "ionico", valence: 1, lonePairs: 0, molar: 107.87, radius: 1.45, colorCss: "#e3e6ea", textColor: "#15171a", categoria: "Metal de Transição" },

  // --- IONICO (gerado por grupo/categoria) ---
  Be: { z: 4, tipo: "ionico", valence: 2, molar: 9.0122, radius: 0.96, lonePairs: 0, colorCss: "#fb923c", textColor: "#111827", categoria: "Metal Alcalino-Terroso" },
  Ga: { z: 31, tipo: "ionico", valence: 3, molar: 69.723, radius: 1.22, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Rb: { z: 37, tipo: "ionico", valence: 1, molar: 85.468, radius: 2.2, lonePairs: 0, colorCss: "#ef4444", textColor: "#ffffff", categoria: "Metal Alcalino" },
  Sr: { z: 38, tipo: "ionico", valence: 2, molar: 87.62, radius: 1.95, lonePairs: 0, colorCss: "#fb923c", textColor: "#111827", categoria: "Metal Alcalino-Terroso" },
  Cd: { z: 48, tipo: "ionico", valence: 2, molar: 112.41, radius: 1.44, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  In: { z: 49, tipo: "ionico", valence: 3, molar: 114.82, radius: 1.42, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Cs: { z: 55, tipo: "ionico", valence: 1, molar: 132.91, radius: 2.44, lonePairs: 0, colorCss: "#ef4444", textColor: "#ffffff", categoria: "Metal Alcalino" },
  Ba: { z: 56, tipo: "ionico", valence: 2, molar: 137.33, radius: 2.15, lonePairs: 0, colorCss: "#fb923c", textColor: "#111827", categoria: "Metal Alcalino-Terroso" },
  La: { z: 57, tipo: "ionico", valence: 3, molar: 138.91, radius: 2.07, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Ce: { z: 58, tipo: "ionico", valence: 3, molar: 140.12, radius: 2.04, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Pr: { z: 59, tipo: "ionico", valence: 3, molar: 140.91, radius: 2.03, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Nd: { z: 60, tipo: "ionico", valence: 3, molar: 144.24, radius: 2.01, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Pm: { z: 61, tipo: "ionico", valence: 3, molar: 145.0, radius: 1.99, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Sm: { z: 62, tipo: "ionico", valence: 3, molar: 150.36, radius: 1.98, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Eu: { z: 63, tipo: "ionico", valence: 3, molar: 151.96, radius: 1.98, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Gd: { z: 64, tipo: "ionico", valence: 3, molar: 157.25, radius: 1.96, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Tb: { z: 65, tipo: "ionico", valence: 3, molar: 158.93, radius: 1.94, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Dy: { z: 66, tipo: "ionico", valence: 3, molar: 162.5, radius: 1.92, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Ho: { z: 67, tipo: "ionico", valence: 3, molar: 164.93, radius: 1.92, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Er: { z: 68, tipo: "ionico", valence: 3, molar: 167.26, radius: 1.89, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Tm: { z: 69, tipo: "ionico", valence: 3, molar: 168.93, radius: 1.9, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Yb: { z: 70, tipo: "ionico", valence: 3, molar: 173.05, radius: 1.87, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Lu: { z: 71, tipo: "ionico", valence: 3, molar: 174.97, radius: 1.87, lonePairs: 0, colorCss: "#fbbf24", textColor: "#111827", categoria: "Lantanídeo" },
  Hg: { z: 80, tipo: "ionico", valence: 2, molar: 200.59, radius: 1.32, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Tl: { z: 81, tipo: "ionico", valence: 1, molar: 204.38, radius: 1.45, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Pb: { z: 82, tipo: "ionico", valence: 2, molar: 207.2, radius: 1.46, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Bi: { z: 83, tipo: "ionico", valence: 3, molar: 208.98, radius: 1.48, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Fr: { z: 87, tipo: "ionico", valence: 1, molar: 223.0, radius: 2.6, lonePairs: 0, colorCss: "#ef4444", textColor: "#ffffff", categoria: "Metal Alcalino" },
  Ra: { z: 88, tipo: "ionico", valence: 2, molar: 226.0, radius: 2.21, lonePairs: 0, colorCss: "#fb923c", textColor: "#111827", categoria: "Metal Alcalino-Terroso" },
  Nh: { z: 113, tipo: "ionico", valence: 3, molar: 286.0, radius: 1.36, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Fl: { z: 114, tipo: "ionico", valence: 2, molar: 289.0, radius: 1.43, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Mc: { z: 115, tipo: "ionico", valence: 3, molar: 290.0, radius: 1.62, lonePairs: 0, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  // --- COVALENTE (gerado por grupo/categoria) ---
  B: { z: 5, tipo: "covalente", valence: 3, molar: 10.81, radius: 0.84, lonePairs: 0, colorCss: "#2dd4bf", textColor: "#111827", categoria: "Metaloide" },
  Ge: { z: 32, tipo: "covalente", valence: 4, molar: 72.63, radius: 1.22, lonePairs: 0, colorCss: "#2dd4bf", textColor: "#111827", categoria: "Metaloide" },
  As: { z: 33, tipo: "covalente", valence: 3, molar: 74.922, radius: 1.19, lonePairs: 1, colorCss: "#2dd4bf", textColor: "#111827", categoria: "Metaloide" },
  Se: { z: 34, tipo: "covalente", valence: 2, molar: 78.971, radius: 1.2, lonePairs: 2, colorCss: "#4ade80", textColor: "#111827", categoria: "Não-metal" },
  Sb: { z: 51, tipo: "covalente", valence: 3, molar: 121.76, radius: 1.39, lonePairs: 1, colorCss: "#2dd4bf", textColor: "#111827", categoria: "Metaloide" },
  Te: { z: 52, tipo: "covalente", valence: 2, molar: 127.6, radius: 1.38, lonePairs: 2, colorCss: "#2dd4bf", textColor: "#111827", categoria: "Metaloide" },
  Po: { z: 84, tipo: "covalente", valence: 2, molar: 209.0, radius: 1.4, lonePairs: 2, colorCss: "#2dd4bf", textColor: "#111827", categoria: "Metal" },
  At: { z: 85, tipo: "covalente", valence: 1, molar: 210.0, radius: 1.5, lonePairs: 3, colorCss: "#4ade80", textColor: "#111827", categoria: "Halogênio" },
  Lv: { z: 116, tipo: "covalente", valence: 2, molar: 293.0, radius: 1.75, lonePairs: 2, colorCss: "#94a3b8", textColor: "#111827", categoria: "Metal" },
  Ts: { z: 117, tipo: "covalente", valence: 1, molar: 294.0, radius: 1.65, lonePairs: 3, colorCss: "#4ade80", textColor: "#111827", categoria: "Halogênio" },
  // --- METALICO (gerado por grupo/categoria) ---
  Sc: { z: 21, tipo: "metalico", valence: 0, molar: 44.956, radius: 1.7, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ti: { z: 22, tipo: "metalico", valence: 0, molar: 47.867, radius: 1.6, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  V: { z: 23, tipo: "metalico", valence: 0, molar: 50.942, radius: 1.53, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Cr: { z: 24, tipo: "metalico", valence: 0, molar: 51.996, radius: 1.39, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Mn: { z: 25, tipo: "metalico", valence: 0, molar: 54.938, radius: 1.61, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Co: { z: 27, tipo: "metalico", valence: 0, molar: 58.933, radius: 1.26, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ni: { z: 28, tipo: "metalico", valence: 0, molar: 58.693, radius: 1.24, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Y: { z: 39, tipo: "metalico", valence: 0, molar: 88.906, radius: 1.9, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Zr: { z: 40, tipo: "metalico", valence: 0, molar: 91.224, radius: 1.75, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Nb: { z: 41, tipo: "metalico", valence: 0, molar: 92.906, radius: 1.64, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Mo: { z: 42, tipo: "metalico", valence: 0, molar: 95.95, radius: 1.54, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Tc: { z: 43, tipo: "metalico", valence: 0, molar: 97.0, radius: 1.47, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ru: { z: 44, tipo: "metalico", valence: 0, molar: 101.07, radius: 1.46, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Rh: { z: 45, tipo: "metalico", valence: 0, molar: 102.91, radius: 1.42, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Pd: { z: 46, tipo: "metalico", valence: 0, molar: 106.42, radius: 1.39, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Hf: { z: 72, tipo: "metalico", valence: 0, molar: 178.49, radius: 1.75, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ta: { z: 73, tipo: "metalico", valence: 0, molar: 180.95, radius: 1.7, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  W: { z: 74, tipo: "metalico", valence: 0, molar: 183.84, radius: 1.62, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Re: { z: 75, tipo: "metalico", valence: 0, molar: 186.21, radius: 1.51, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Os: { z: 76, tipo: "metalico", valence: 0, molar: 190.23, radius: 1.44, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ir: { z: 77, tipo: "metalico", valence: 0, molar: 192.22, radius: 1.41, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Pt: { z: 78, tipo: "metalico", valence: 0, molar: 195.08, radius: 1.36, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ac: { z: 89, tipo: "metalico", valence: 0, molar: 227.0, radius: 2.15, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Th: { z: 90, tipo: "metalico", valence: 0, molar: 232.04, radius: 2.06, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Pa: { z: 91, tipo: "metalico", valence: 0, molar: 231.04, radius: 2.0, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  U: { z: 92, tipo: "metalico", valence: 0, molar: 238.03, radius: 1.96, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Np: { z: 93, tipo: "metalico", valence: 0, molar: 237.0, radius: 1.9, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Pu: { z: 94, tipo: "metalico", valence: 0, molar: 244.0, radius: 1.87, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Am: { z: 95, tipo: "metalico", valence: 0, molar: 243.0, radius: 1.8, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Cm: { z: 96, tipo: "metalico", valence: 0, molar: 247.0, radius: 1.69, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Bk: { z: 97, tipo: "metalico", valence: 0, molar: 247.0, radius: 1.68, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Cf: { z: 98, tipo: "metalico", valence: 0, molar: 251.0, radius: 1.68, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Es: { z: 99, tipo: "metalico", valence: 0, molar: 252.0, radius: 1.65, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Fm: { z: 100, tipo: "metalico", valence: 0, molar: 257.0, radius: 1.67, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Md: { z: 101, tipo: "metalico", valence: 0, molar: 258.0, radius: 1.73, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  No: { z: 102, tipo: "metalico", valence: 0, molar: 259.0, radius: 1.76, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Lr: { z: 103, tipo: "metalico", valence: 0, molar: 266.0, radius: 1.61, lonePairs: 0, colorCss: "#34d399", textColor: "#111827", categoria: "Actinídeo" },
  Rf: { z: 104, tipo: "metalico", valence: 0, molar: 267.0, radius: 1.57, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Db: { z: 105, tipo: "metalico", valence: 0, molar: 268.0, radius: 1.49, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Sg: { z: 106, tipo: "metalico", valence: 0, molar: 269.0, radius: 1.43, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Bh: { z: 107, tipo: "metalico", valence: 0, molar: 270.0, radius: 1.41, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Hs: { z: 108, tipo: "metalico", valence: 0, molar: 269.0, radius: 1.34, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Mt: { z: 109, tipo: "metalico", valence: 0, molar: 278.0, radius: 1.29, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Ds: { z: 110, tipo: "metalico", valence: 0, molar: 281.0, radius: 1.28, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Rg: { z: 111, tipo: "metalico", valence: 0, molar: 282.0, radius: 1.21, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  Cn: { z: 112, tipo: "metalico", valence: 0, molar: 285.0, radius: 1.22, lonePairs: 0, colorCss: "#60a5fa", textColor: "#111827", categoria: "Metal de Transição" },
  // --- INERTE (gerado por grupo/categoria) ---
  He: { z: 2, tipo: "inerte", valence: 0, molar: 4.0026, radius: 0.31, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
  Ne: { z: 10, tipo: "inerte", valence: 0, molar: 20.18, radius: 0.38, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
  Ar: { z: 18, tipo: "inerte", valence: 0, molar: 39.948, radius: 0.71, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
  Kr: { z: 36, tipo: "inerte", valence: 0, molar: 83.798, radius: 0.88, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
  Xe: { z: 54, tipo: "inerte", valence: 0, molar: 131.29, radius: 1.08, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
  Rn: { z: 86, tipo: "inerte", valence: 0, molar: 222.0, radius: 1.2, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
  Og: { z: 118, tipo: "inerte", valence: 0, molar: 294.0, radius: 1.57, lonePairs: 0, colorCss: "#7dd3fc", textColor: "#111827", categoria: "Gás Nobre" },
};
// ordem de exibição das fórmulas (convenção usual: cátion primeiro em
// compostos iônicos e hidretos, halogênios em ordem decrescente de
// tamanho, O/F por último)
const ELEMENT_ORDER = [
  "Li", "Na", "K", "Rb", "Cs", "Fr", "Be", "Mg", "Ca", "Sr", "Ba", "Ra",
  "Al", "Ga", "In", "Tl", "Zn", "Cd", "Hg", "Fe", "Ag", "Sn", "Pb", "Bi",
  "Nh", "Fl", "Mc",
  "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
  "B", "Si", "Ge", "C", "N", "P", "As", "Sb", "H", "S", "Se", "Te", "Po", "Lv",
  "I", "Br", "Cl", "F", "At", "Ts", "O",
];
const PX_POR_ANGSTROM = 42;



/* ---------------------------------------------------------------
   2. GABARITOS MOLECULARES 2D — comprimentos de ligação reais (Å)
   H–H: 0.74 | O=O: 1.21 | N≡N: 1.10 | Cl–Cl: 1.99 | C–H: 1.09
   F–F: 1.42 | O–H (água): 0.96, ângulo 104.5°
   CH4 é desenhado em "cruz" (projeção 2D simplificada do tetraedro,
   convenção usual de estrutura de Lewis plana). H2O é desenhada com
   o ângulo real de ligação (geometria angular/VSEPR), já que aqui é
   usada como REAGENTE intacto (decomposição), não só como produto.
   --------------------------------------------------------------- */
function offsetsDiatomico2D(comprimentoAngstrom) {
  const len = comprimentoAngstrom * PX_POR_ANGSTROM;
  return [{ x: -len / 2, y: 0 }, { x: len / 2, y: 0 }];
}
function offsetsCruz2D(comprimentoAngstrom) {
  const len = comprimentoAngstrom * PX_POR_ANGSTROM;
  return [{ x: 0, y: 0 }, { x: len, y: 0 }, { x: -len, y: 0 }, { x: 0, y: len }, { x: 0, y: -len }];
}
function offsetsAngular2D(comprimentoAngstrom, anguloGraus) {
  const L = comprimentoAngstrom * PX_POR_ANGSTROM;
  const meio = (anguloGraus * Math.PI / 180) / 2;
  return [{ x: 0, y: 0 }, { x: L * Math.sin(meio), y: L * Math.cos(meio) }, { x: -L * Math.sin(meio), y: L * Math.cos(meio) }];
}

const MOLECULE_TEMPLATES = {
  H2:  { atoms: ["H", "H"],                bonds: [[0, 1, 1]],                                   offsets: offsetsDiatomico2D(0.74) },
  O2:  { atoms: ["O", "O"],                bonds: [[0, 1, 2]],                                   offsets: offsetsDiatomico2D(1.21) },
  N2:  { atoms: ["N", "N"],                bonds: [[0, 1, 3]],                                   offsets: offsetsDiatomico2D(1.10) },
  F2:  { atoms: ["F", "F"],                bonds: [[0, 1, 1]],                                   offsets: offsetsDiatomico2D(1.42) },
  Cl2: { atoms: ["Cl", "Cl"],              bonds: [[0, 1, 1]],                                   offsets: offsetsDiatomico2D(1.99) },
  Br2: { atoms: ["Br", "Br"],              bonds: [[0, 1, 1]],                                   offsets: offsetsDiatomico2D(2.28) },
  I2:  { atoms: ["I", "I"],                bonds: [[0, 1, 1]],                                   offsets: offsetsDiatomico2D(2.67) },
  CH4: { atoms: ["C", "H", "H", "H", "H"], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],   offsets: offsetsCruz2D(1.09) },
  H2O: { atoms: ["O", "H", "H"],           bonds: [[0, 1, 1], [0, 2, 1]],                        offsets: offsetsAngular2D(0.96, 104.5) },
  C:   { atoms: ["C"],                     bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  S:   { atoms: ["S"],                     bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Si:  { atoms: ["Si"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  P:   { atoms: ["P"],                     bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Li:  { atoms: ["Li"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Na:  { atoms: ["Na"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  K:   { atoms: ["K"],                     bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Mg:  { atoms: ["Mg"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Ca:  { atoms: ["Ca"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Al:  { atoms: ["Al"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Zn:  { atoms: ["Zn"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Fe:  { atoms: ["Fe"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Cu:  { atoms: ["Cu"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Sn:  { atoms: ["Sn"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Au:  { atoms: ["Au"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },
  Ag:  { atoms: ["Ag"],                    bonds: [],                                            offsets: [{ x: 0, y: 0 }] },

  Be:  { atoms: ["Be"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ga:  { atoms: ["Ga"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Rb:  { atoms: ["Rb"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Sr:  { atoms: ["Sr"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Cd:  { atoms: ["Cd"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  In:  { atoms: ["In"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Cs:  { atoms: ["Cs"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ba:  { atoms: ["Ba"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  La:  { atoms: ["La"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ce:  { atoms: ["Ce"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pr:  { atoms: ["Pr"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Nd:  { atoms: ["Nd"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pm:  { atoms: ["Pm"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Sm:  { atoms: ["Sm"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Eu:  { atoms: ["Eu"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Gd:  { atoms: ["Gd"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Tb:  { atoms: ["Tb"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Dy:  { atoms: ["Dy"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ho:  { atoms: ["Ho"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Er:  { atoms: ["Er"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Tm:  { atoms: ["Tm"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Yb:  { atoms: ["Yb"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Lu:  { atoms: ["Lu"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Hg:  { atoms: ["Hg"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Tl:  { atoms: ["Tl"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pb:  { atoms: ["Pb"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Bi:  { atoms: ["Bi"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Fr:  { atoms: ["Fr"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ra:  { atoms: ["Ra"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Nh:  { atoms: ["Nh"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Fl:  { atoms: ["Fl"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Mc:  { atoms: ["Mc"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  B:  { atoms: ["B"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ge:  { atoms: ["Ge"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  As:  { atoms: ["As"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Se:  { atoms: ["Se"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Sb:  { atoms: ["Sb"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Te:  { atoms: ["Te"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Po:  { atoms: ["Po"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  At2: { atoms: ["At", "At"], bonds: [[0, 1, 1]], offsets: offsetsDiatomico2D(2.3) },
  Lv:  { atoms: ["Lv"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ts2: { atoms: ["Ts", "Ts"], bonds: [[0, 1, 1]], offsets: offsetsDiatomico2D(2.9) },
  Sc:  { atoms: ["Sc"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ti:  { atoms: ["Ti"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  V:  { atoms: ["V"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Cr:  { atoms: ["Cr"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Mn:  { atoms: ["Mn"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Co:  { atoms: ["Co"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ni:  { atoms: ["Ni"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Y:  { atoms: ["Y"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Zr:  { atoms: ["Zr"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Nb:  { atoms: ["Nb"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Mo:  { atoms: ["Mo"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Tc:  { atoms: ["Tc"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ru:  { atoms: ["Ru"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Rh:  { atoms: ["Rh"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pd:  { atoms: ["Pd"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Hf:  { atoms: ["Hf"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ta:  { atoms: ["Ta"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  W:  { atoms: ["W"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Re:  { atoms: ["Re"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Os:  { atoms: ["Os"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ir:  { atoms: ["Ir"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pt:  { atoms: ["Pt"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ac:  { atoms: ["Ac"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Th:  { atoms: ["Th"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pa:  { atoms: ["Pa"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  U:  { atoms: ["U"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Np:  { atoms: ["Np"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Pu:  { atoms: ["Pu"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Am:  { atoms: ["Am"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Cm:  { atoms: ["Cm"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Bk:  { atoms: ["Bk"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Cf:  { atoms: ["Cf"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Es:  { atoms: ["Es"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Fm:  { atoms: ["Fm"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Md:  { atoms: ["Md"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  No:  { atoms: ["No"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Lr:  { atoms: ["Lr"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Rf:  { atoms: ["Rf"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Db:  { atoms: ["Db"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Sg:  { atoms: ["Sg"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Bh:  { atoms: ["Bh"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Hs:  { atoms: ["Hs"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Mt:  { atoms: ["Mt"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Ds:  { atoms: ["Ds"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Rg:  { atoms: ["Rg"], bonds: [], offsets: [{ x: 0, y: 0 }] },
  Cn:  { atoms: ["Cn"], bonds: [], offsets: [{ x: 0, y: 0 }] },
};

// Elementos que existem isolados (não-diatômicos) podem permanecer como
// "excesso elementar" sem bloquear a validação — ex.: carbono ou enxofre
// sobrando de uma reação incompleta. Derivado dos próprios gabaritos.
const ELEMENTOS_MONOATOMICOS = new Set(
  Object.values(MOLECULE_TEMPLATES).filter((t) => t.atoms.length === 1).map((t) => t.atoms[0])
);

/* ---------------------------------------------------------------
   3. CATÁLOGO DE REAÇÕES (menu lateral) — equações balanceadas
   2H2+O2->2H2O | N2+3H2->2NH3 | H2+Cl2->2HCl | CH4+2O2->CO2+2H2O
   C+O2->CO2 | H2+F2->2HF | H2+S->H2S | C+2Cl2->CCl4 | 2H2O->2H2+O2
   --------------------------------------------------------------- */
const REACTIONS = {
  water: {
    label: "Síntese da água", equation: "2 H₂ + O₂ → 2 H₂O", deltaEN: 1.24, caraterLigacao: "covalente polar",
    reagents: [{ formula: "H2", label: "H₂", defaultQty: 5 }, { formula: "O2", label: "O₂", defaultQty: 2 }],
    coeffs: { H2: 2, O2: 1, H2O: 2 },
  },
  ammonia: {
    label: "Síntese da amônia (Haber-Bosch)", equation: "N₂ + 3 H₂ → 2 NH₃", deltaEN: 0.84, caraterLigacao: "covalente polar",
    reagents: [{ formula: "N2", label: "N₂", defaultQty: 2 }, { formula: "H2", label: "H₂", defaultQty: 7 }],
    coeffs: { N2: 1, H2: 3, NH3: 2 },
  },
  hcl: {
    label: "Formação do ácido clorídrico", equation: "H₂ + Cl₂ → 2 HCl", deltaEN: 0.96, caraterLigacao: "covalente polar",
    reagents: [{ formula: "H2", label: "H₂", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { H2: 1, Cl2: 1, HCl: 2 },
  },
  hf: {
    label: "Síntese do fluoreto de hidrogênio", equation: "H₂ + F₂ → 2 HF", deltaEN: 1.78, caraterLigacao: "covalente polar",
    reagents: [{ formula: "H2", label: "H₂", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { H2: 1, F2: 1, HF: 2 },
  },
  h2s: {
    label: "Síntese do gás sulfídrico", equation: "H₂ + S → H₂S", deltaEN: 0.38, caraterLigacao: "covalente polar",
    reagents: [{ formula: "H2", label: "H₂", defaultQty: 5 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { H2: 1, S: 1, H2S: 1 },
  },
  methane: {
    label: "Combustão do metano", equation: "CH₄ + 2 O₂ → CO₂ + 2 H₂O", deltaEN: 0.89, caraterLigacao: "covalente polar",
    reagents: [{ formula: "CH4", label: "CH₄", defaultQty: 3 }, { formula: "O2", label: "O₂", defaultQty: 5 }],
    coeffs: { CH4: 1, O2: 2, CO2: 1, H2O: 2 },
  },
  carbon: {
    label: "Combustão do carbono", equation: "C + O₂ → CO₂", deltaEN: 0.89, caraterLigacao: "covalente polar",
    reagents: [{ formula: "C", label: "C", defaultQty: 4 }, { formula: "O2", label: "O₂", defaultQty: 3 }],
    coeffs: { C: 1, O2: 1, CO2: 1 },
  },
  ccl4: {
    label: "Síntese do tetracloreto de carbono", equation: "C + 2 Cl₂ → CCl₄", deltaEN: 0.61, caraterLigacao: "covalente polar",
    reagents: [{ formula: "C", label: "C", defaultQty: 3 }, { formula: "Cl2", label: "Cl₂", defaultQty: 5 }],
    coeffs: { C: 1, Cl2: 2, CCl4: 1 },
  },
  electrolysis: {
    label: "Decomposição da água (eletrólise)", equation: "2 H₂O → 2 H₂ + O₂",
    reagents: [{ formula: "H2O", label: "H₂O", defaultQty: 6 }],
    coeffs: { H2O: 2, H2: 2, O2: 1 },
  },

  // ---- LIGAÇÃO IÔNICA (transferência completa de elétrons: metal -> ametal) ----
  nacl: {
    label: "Formação do cloreto de sódio", equation: "2 Na + Cl₂ → 2 NaCl", tipoLigacao: "ionico", deltaEN: 2.23, caraterLigacao: "iônica",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 5 }, { formula: "Cl2", label: "Cl₂", defaultQty: 2 }],
    coeffs: { Na: 2, Cl2: 1, NaCl: 2 },
  },
  kcl: {
    label: "Formação do cloreto de potássio", equation: "2 K + Cl₂ → 2 KCl", tipoLigacao: "ionico", deltaEN: 2.34, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 5 }, { formula: "Cl2", label: "Cl₂", defaultQty: 2 }],
    coeffs: { K: 2, Cl2: 1, KCl: 2 },
  },
  mgcl2: {
    label: "Formação do cloreto de magnésio", equation: "Mg + Cl₂ → MgCl₂", tipoLigacao: "ionico", deltaEN: 1.85, caraterLigacao: "iônica",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { Mg: 1, Cl2: 1, MgCl2: 1 },
  },
  mgo: {
    label: "Formação do óxido de magnésio", equation: "2 Mg + O₂ → 2 MgO", tipoLigacao: "ionico", deltaEN: 2.13, caraterLigacao: "iônica",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 5 }, { formula: "O2", label: "O₂", defaultQty: 2 }],
    coeffs: { Mg: 2, O2: 1, MgO: 2 },
  },
  cacl2: {
    label: "Formação do cloreto de cálcio", equation: "Ca + Cl₂ → CaCl₂", tipoLigacao: "ionico", deltaEN: 2.16, caraterLigacao: "iônica",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { Ca: 1, Cl2: 1, CaCl2: 1 },
  },
  al2o3: {
    label: "Formação do óxido de alumínio", equation: "4 Al + 3 O₂ → 2 Al₂O₃", tipoLigacao: "ionico", deltaEN: 1.83, caraterLigacao: "iônica",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 5 }, { formula: "O2", label: "O₂", defaultQty: 4 }],
    coeffs: { Al: 4, O2: 3, Al2O3: 2 },
  },

  // ---- "DO DIA A DIA" — exemplos clássicos de ligação iônica que
  // aparecem fora da sala de aula (ferrugem, zinco de pilhas/galvanização,
  // sal de cozinha e sal iodado) ----
  ferrugem: {
    label: "Ferrugem (óxido de ferro III)", equation: "4 Fe + 3 O₂ → 2 Fe₂O₃", tipoLigacao: "ionico", deltaEN: 1.61, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 5 }, { formula: "O2", label: "O₂", defaultQty: 4 }],
    coeffs: { Fe: 4, O2: 3, Fe2O3: 2 },
  },
  fecl3: {
    label: "Cloreto de ferro III", equation: "2 Fe + 3 Cl₂ → 2 FeCl₃", tipoLigacao: "ionico", deltaEN: 1.33, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 5 }, { formula: "Cl2", label: "Cl₂", defaultQty: 4 }],
    coeffs: { Fe: 2, Cl2: 3, FeCl3: 2 },
  },
  zno: {
    label: "Óxido de zinco", equation: "2 Zn + O₂ → 2 ZnO", tipoLigacao: "ionico", deltaEN: 1.79, caraterLigacao: "iônica",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 5 }, { formula: "O2", label: "O₂", defaultQty: 2 }],
    coeffs: { Zn: 2, O2: 1, ZnO: 2 },
  },
  zncl2: {
    label: "Cloreto de zinco", equation: "Zn + Cl₂ → ZnCl₂", tipoLigacao: "ionico", deltaEN: 1.51, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { Zn: 1, Cl2: 1, ZnCl2: 1 },
  },
  nabr: {
    label: "Brometo de sódio", equation: "2 Na + Br₂ → 2 NaBr", tipoLigacao: "ionico", deltaEN: 2.03, caraterLigacao: "iônica",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 5 }, { formula: "Br2", label: "Br₂", defaultQty: 2 }],
    coeffs: { Na: 2, Br2: 1, NaBr: 2 },
  },
  ki: {
    label: "Iodeto de potássio (sal iodado)", equation: "2 K + I₂ → 2 KI", tipoLigacao: "ionico", deltaEN: 1.84, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 5 }, { formula: "I2", label: "I₂", defaultQty: 2 }],
    coeffs: { K: 2, I2: 1, KI: 2 },
  },

  // ---- LIGAÇÃO METÁLICA (mar de elétrons — sem fórmula/estequiometria fixa) ----
  metalCu: {
    label: "Ligação Metálica: Cobre puro", equation: "Cu (s) — retículo metálico", modo: "metalico",
    reagents: [{ formula: "Cu", label: "Cu", defaultQty: 9 }],
  },
  ligaBronze: {
    label: "Liga Metálica: Cobre + Estanho (bronze)", equation: "Cu + Sn — liga metálica", modo: "metalico",
    reagents: [{ formula: "Cu", label: "Cu", defaultQty: 6 }, { formula: "Sn", label: "Sn", defaultQty: 4 }],
  },

  // ==================================================================
  // BLOCO GERADO: +77 reações (covalentes, iônicas e ligas metálicas)
  // cobrindo combinações comuns do dia a dia entre os elementos
  // simulados. Fórmulas e coeficientes calculados pela mesma regra de
  // valência cruzada usada no gerador da Tabela Periódica (mdc + razão
  // d_puro), garantindo consistência com o motor de validação.
  // ==================================================================
  cov_SiH: {
    label: "Formação do tetraidreto de silício", equation: "Si + 2 H₂ → SiH₄", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "H2", label: "H₂", defaultQty: 5 }],
    coeffs: { "Si": 1, "H2": 2, "SiH4": 1 },
  },
  cov_PH: {
    label: "Formação do triidreto de fósforo", equation: "2 P + 3 H₂ → 2 PH₃", tipoLigacao: "covalente", deltaEN: 0.01, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 4 }, { formula: "H2", label: "H₂", defaultQty: 7 }],
    coeffs: { "P": 2, "H2": 3, "PH3": 2 },
  },
  cov_HBr: {
    label: "Formação do brometo de hidrogênio", equation: "H₂ + Br₂ → 2 HBr", tipoLigacao: "covalente", deltaEN: 0.76, caraterLigacao: "covalente polar",
    reagents: [{ formula: "H2", label: "H₂", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "H2": 1, "Br2": 1, "HBr": 2 },
  },
  cov_HI: {
    label: "Formação do iodeto de hidrogênio", equation: "H₂ + I₂ → 2 HI", tipoLigacao: "covalente", deltaEN: 0.46, caraterLigacao: "covalente polar",
    reagents: [{ formula: "H2", label: "H₂", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "H2": 1, "I2": 1, "HI": 2 },
  },
  cov_CF: {
    label: "Formação do tetrafluoreto de carbono", equation: "C + 2 F₂ → CF₄", tipoLigacao: "covalente", deltaEN: 1.43, caraterLigacao: "covalente polar",
    reagents: [{ formula: "C", label: "C", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 5 }],
    coeffs: { "C": 1, "F2": 2, "CF4": 1 },
  },
  cov_SiC: {
    label: "Formação do carbeto de silício", equation: "Si + C → SiC", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "C", label: "C", defaultQty: 3 }],
    coeffs: { "Si": 1, "C": 1, "SiC": 1 },
  },
  cov_CS: {
    label: "Formação do disulfeto de carbono", equation: "C + 2 S → CS₂", tipoLigacao: "covalente", deltaEN: 0.03, caraterLigacao: "covalente polar",
    reagents: [{ formula: "C", label: "C", defaultQty: 2 }, { formula: "S", label: "S", defaultQty: 5 }],
    coeffs: { "C": 1, "S": 2, "CS2": 1 },
  },
  cov_CBr: {
    label: "Formação do tetrabrometo de carbono", equation: "C + 2 Br₂ → CBr₄", tipoLigacao: "covalente", deltaEN: 0.41, caraterLigacao: "covalente polar",
    reagents: [{ formula: "C", label: "C", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 5 }],
    coeffs: { "C": 1, "Br2": 2, "CBr4": 1 },
  },
  cov_NF: {
    label: "Formação do trifluoreto de nitrogênio", equation: "N₂ + 3 F₂ → 2 NF₃", tipoLigacao: "covalente", deltaEN: 0.94, caraterLigacao: "covalente polar",
    reagents: [{ formula: "N2", label: "N₂", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 7 }],
    coeffs: { "N2": 1, "F2": 3, "NF3": 2 },
  },
  cov_SiN: {
    label: "Formação do tetranitreto de trisilício", equation: "3 Si + 2 N₂ → Si₃N₄", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 6 }, { formula: "N2", label: "N₂", defaultQty: 5 }],
    coeffs: { "Si": 3, "N2": 2, "Si3N4": 1 },
  },
  cov_NCl: {
    label: "Formação do tricloreto de nitrogênio", equation: "N₂ + 3 Cl₂ → 2 NCl₃", tipoLigacao: "covalente", deltaEN: 0.12, caraterLigacao: "covalente polar",
    reagents: [{ formula: "N2", label: "N₂", defaultQty: 2 }, { formula: "Cl2", label: "Cl₂", defaultQty: 7 }],
    coeffs: { "N2": 1, "Cl2": 3, "NCl3": 2 },
  },
  cov_PO: {
    label: "Formação do trióxido de difósforo", equation: "4 P + 3 O₂ → 2 P₂O₃", tipoLigacao: "covalente", deltaEN: 1.25, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 8 }, { formula: "O2", label: "O₂", defaultQty: 7 }],
    coeffs: { "P": 4, "O2": 3, "P2O3": 2 },
  },
  cov_SiF: {
    label: "Formação do tetrafluoreto de silício", equation: "Si + 2 F₂ → SiF₄", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 5 }],
    coeffs: { "Si": 1, "F2": 2, "SiF4": 1 },
  },
  cov_PF: {
    label: "Formação do trifluoreto de fósforo", equation: "2 P + 3 F₂ → 2 PF₃", tipoLigacao: "covalente", deltaEN: 1.79, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 7 }],
    coeffs: { "P": 2, "F2": 3, "PF3": 2 },
  },
  cov_ClF: {
    label: "Formação do fluoreto de cloro", equation: "Cl₂ + F₂ → 2 ClF", tipoLigacao: "covalente", deltaEN: 0.82, caraterLigacao: "covalente polar",
    reagents: [{ formula: "Cl2", label: "Cl₂", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Cl2": 1, "F2": 1, "ClF": 2 },
  },
  cov_BrF: {
    label: "Formação do fluoreto de bromo", equation: "Br₂ + F₂ → 2 BrF", tipoLigacao: "covalente", deltaEN: 1.02, caraterLigacao: "covalente polar",
    reagents: [{ formula: "Br2", label: "Br₂", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Br2": 1, "F2": 1, "BrF": 2 },
  },
  cov_IF: {
    label: "Formação do fluoreto de iodo", equation: "I₂ + F₂ → 2 IF", tipoLigacao: "covalente", deltaEN: 1.32, caraterLigacao: "covalente polar",
    reagents: [{ formula: "I2", label: "I₂", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "I2": 1, "F2": 1, "IF": 2 },
  },
  cov_SiS: {
    label: "Formação do disulfeto de silício", equation: "Si + 2 S → SiS₂", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "S", label: "S", defaultQty: 5 }],
    coeffs: { "Si": 1, "S": 2, "SiS2": 1 },
  },
  cov_SiCl: {
    label: "Formação do tetracloreto de silício", equation: "Si + 2 Cl₂ → SiCl₄", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "Cl2", label: "Cl₂", defaultQty: 5 }],
    coeffs: { "Si": 1, "Cl2": 2, "SiCl4": 1 },
  },
  cov_SiBr: {
    label: "Formação do tetrabrometo de silício", equation: "Si + 2 Br₂ → SiBr₄", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 5 }],
    coeffs: { "Si": 1, "Br2": 2, "SiBr4": 1 },
  },
  cov_SiI: {
    label: "Formação do tetraiodeto de silício", equation: "Si + 2 I₂ → SiI₄", tipoLigacao: "covalente", caraterLigacao: "covalente (semimetal)",
    reagents: [{ formula: "Si", label: "Si", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 5 }],
    coeffs: { "Si": 1, "I2": 2, "SiI4": 1 },
  },
  cov_PS: {
    label: "Formação do trisulfeto de difósforo", equation: "2 P + 3 S → P₂S₃", tipoLigacao: "covalente", deltaEN: 0.39, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 4 }, { formula: "S", label: "S", defaultQty: 7 }],
    coeffs: { "P": 2, "S": 3, "P2S3": 1 },
  },
  cov_PCl: {
    label: "Formação do tricloreto de fósforo", equation: "2 P + 3 Cl₂ → 2 PCl₃", tipoLigacao: "covalente", deltaEN: 0.97, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 7 }],
    coeffs: { "P": 2, "Cl2": 3, "PCl3": 2 },
  },
  cov_PBr: {
    label: "Formação do tribrometo de fósforo", equation: "2 P + 3 Br₂ → 2 PBr₃", tipoLigacao: "covalente", deltaEN: 0.77, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 4 }, { formula: "Br2", label: "Br₂", defaultQty: 7 }],
    coeffs: { "P": 2, "Br2": 3, "PBr3": 2 },
  },
  cov_PI: {
    label: "Formação do triiodeto de fósforo", equation: "2 P + 3 I₂ → 2 PI₃", tipoLigacao: "covalente", deltaEN: 0.47, caraterLigacao: "covalente polar",
    reagents: [{ formula: "P", label: "P", defaultQty: 4 }, { formula: "I2", label: "I₂", defaultQty: 7 }],
    coeffs: { "P": 2, "I2": 3, "PI3": 2 },
  },
  cov_SCl: {
    label: "Formação do dicloreto de enxofre", equation: "S + Cl₂ → SCl₂", tipoLigacao: "covalente", deltaEN: 0.58, caraterLigacao: "covalente polar",
    reagents: [{ formula: "S", label: "S", defaultQty: 2 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { "S": 1, "Cl2": 1, "SCl2": 1 },
  },
  cov_SBr: {
    label: "Formação do dibrometo de enxofre", equation: "S + Br₂ → SBr₂", tipoLigacao: "covalente", deltaEN: 0.38, caraterLigacao: "covalente polar",
    reagents: [{ formula: "S", label: "S", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "S": 1, "Br2": 1, "SBr2": 1 },
  },
  cov_BrCl: {
    label: "Formação do cloreto de bromo", equation: "Br₂ + Cl₂ → 2 BrCl", tipoLigacao: "covalente", deltaEN: 0.20, caraterLigacao: "covalente polar",
    reagents: [{ formula: "Br2", label: "Br₂", defaultQty: 2 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { "Br2": 1, "Cl2": 1, "BrCl": 2 },
  },
  cov_ClI: {
    label: "Formação do iodeto de cloro", equation: "Cl₂ + I₂ → 2 ICl", tipoLigacao: "covalente", deltaEN: 0.50, caraterLigacao: "covalente polar",
    reagents: [{ formula: "Cl2", label: "Cl₂", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Cl2": 1, "I2": 1, "ICl": 2 },
  },
  cov_BrI: {
    label: "Formação do iodeto de bromo", equation: "Br₂ + I₂ → 2 IBr", tipoLigacao: "covalente", deltaEN: 0.30, caraterLigacao: "covalente polar",
    reagents: [{ formula: "Br2", label: "Br₂", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Br2": 1, "I2": 1, "IBr": 2 },
  },
  ion_LiF: {
    label: "Formação do fluoreto de lítio", equation: "2 Li + F₂ → 2 LiF", tipoLigacao: "ionico", deltaEN: 3.00, caraterLigacao: "iônica",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Li": 2, "F2": 1, "LiF": 2 },
  },
  ion_LiCl: {
    label: "Formação do cloreto de lítio", equation: "2 Li + Cl₂ → 2 LiCl", tipoLigacao: "ionico", deltaEN: 2.18, caraterLigacao: "iônica",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 3 }],
    coeffs: { "Li": 2, "Cl2": 1, "LiCl": 2 },
  },
  ion_LiBr: {
    label: "Formação do brometo de lítio", equation: "2 Li + Br₂ → 2 LiBr", tipoLigacao: "ionico", deltaEN: 1.98, caraterLigacao: "iônica",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 4 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "Li": 2, "Br2": 1, "LiBr": 2 },
  },
  ion_LiI: {
    label: "Formação do iodeto de lítio", equation: "2 Li + I₂ → 2 LiI", tipoLigacao: "ionico", deltaEN: 1.68, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 4 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Li": 2, "I2": 1, "LiI": 2 },
  },
  ion_LiO: {
    label: "Formação do óxido de dilítio", equation: "4 Li + O₂ → 2 Li₂O", tipoLigacao: "ionico", deltaEN: 2.46, caraterLigacao: "iônica",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 8 }, { formula: "O2", label: "O₂", defaultQty: 3 }],
    coeffs: { "Li": 4, "O2": 1, "Li2O": 2 },
  },
  ion_LiS: {
    label: "Formação do sulfeto de dilítio", equation: "2 Li + S → Li₂S", tipoLigacao: "ionico", deltaEN: 1.60, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 4 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { "Li": 2, "S": 1, "Li2S": 1 },
  },
  ion_LiN: {
    label: "Formação do nitreto de trilítio", equation: "6 Li + N₂ → 2 Li₃N", tipoLigacao: "ionico", deltaEN: 2.06, caraterLigacao: "iônica",
    reagents: [{ formula: "Li", label: "Li", defaultQty: 12 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Li": 6, "N2": 1, "Li3N": 2 },
  },
  ion_NaF: {
    label: "Formação do fluoreto de sódio", equation: "2 Na + F₂ → 2 NaF", tipoLigacao: "ionico", deltaEN: 3.05, caraterLigacao: "iônica",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Na": 2, "F2": 1, "NaF": 2 },
  },
  ion_NaI: {
    label: "Formação do iodeto de sódio", equation: "2 Na + I₂ → 2 NaI", tipoLigacao: "ionico", deltaEN: 1.73, caraterLigacao: "iônica",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 4 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Na": 2, "I2": 1, "NaI": 2 },
  },
  ion_NaO: {
    label: "Formação do óxido de disódio", equation: "4 Na + O₂ → 2 Na₂O", tipoLigacao: "ionico", deltaEN: 2.51, caraterLigacao: "iônica",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 8 }, { formula: "O2", label: "O₂", defaultQty: 3 }],
    coeffs: { "Na": 4, "O2": 1, "Na2O": 2 },
  },
  ion_NaS: {
    label: "Formação do sulfeto de disódio", equation: "2 Na + S → Na₂S", tipoLigacao: "ionico", deltaEN: 1.65, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 4 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { "Na": 2, "S": 1, "Na2S": 1 },
  },
  ion_NaN: {
    label: "Formação do nitreto de trisódio", equation: "6 Na + N₂ → 2 Na₃N", tipoLigacao: "ionico", deltaEN: 2.11, caraterLigacao: "iônica",
    reagents: [{ formula: "Na", label: "Na", defaultQty: 12 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Na": 6, "N2": 1, "Na3N": 2 },
  },
  ion_KF: {
    label: "Formação do fluoreto de potássio", equation: "2 K + F₂ → 2 KF", tipoLigacao: "ionico", deltaEN: 3.16, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "K": 2, "F2": 1, "KF": 2 },
  },
  ion_KBr: {
    label: "Formação do brometo de potássio", equation: "2 K + Br₂ → 2 KBr", tipoLigacao: "ionico", deltaEN: 2.14, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 4 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "K": 2, "Br2": 1, "KBr": 2 },
  },
  ion_KO: {
    label: "Formação do óxido de dipotássio", equation: "4 K + O₂ → 2 K₂O", tipoLigacao: "ionico", deltaEN: 2.62, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 8 }, { formula: "O2", label: "O₂", defaultQty: 3 }],
    coeffs: { "K": 4, "O2": 1, "K2O": 2 },
  },
  ion_KS: {
    label: "Formação do sulfeto de dipotássio", equation: "2 K + S → K₂S", tipoLigacao: "ionico", deltaEN: 1.76, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 4 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { "K": 2, "S": 1, "K2S": 1 },
  },
  ion_KN: {
    label: "Formação do nitreto de tripotássio", equation: "6 K + N₂ → 2 K₃N", tipoLigacao: "ionico", deltaEN: 2.22, caraterLigacao: "iônica",
    reagents: [{ formula: "K", label: "K", defaultQty: 12 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "K": 6, "N2": 1, "K3N": 2 },
  },
  ion_MgF: {
    label: "Formação do difluoreto de magnésio", equation: "Mg + F₂ → MgF₂", tipoLigacao: "ionico", deltaEN: 2.67, caraterLigacao: "iônica",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Mg": 1, "F2": 1, "MgF2": 1 },
  },
  ion_MgBr: {
    label: "Formação do dibrometo de magnésio", equation: "Mg + Br₂ → MgBr₂", tipoLigacao: "ionico", deltaEN: 1.65, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "Mg": 1, "Br2": 1, "MgBr2": 1 },
  },
  ion_MgI: {
    label: "Formação do diiodeto de magnésio", equation: "Mg + I₂ → MgI₂", tipoLigacao: "ionico", deltaEN: 1.35, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Mg": 1, "I2": 1, "MgI2": 1 },
  },
  ion_MgS: {
    label: "Formação do sulfeto de magnésio", equation: "Mg + S → MgS", tipoLigacao: "ionico", deltaEN: 1.27, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 2 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { "Mg": 1, "S": 1, "MgS": 1 },
  },
  ion_MgN: {
    label: "Formação do dinitreto de trimagnésio", equation: "3 Mg + N₂ → Mg₃N₂", tipoLigacao: "ionico", deltaEN: 1.73, caraterLigacao: "iônica",
    reagents: [{ formula: "Mg", label: "Mg", defaultQty: 6 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Mg": 3, "N2": 1, "Mg3N2": 1 },
  },
  ion_CaF: {
    label: "Formação do difluoreto de cálcio", equation: "Ca + F₂ → CaF₂", tipoLigacao: "ionico", deltaEN: 2.98, caraterLigacao: "iônica",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Ca": 1, "F2": 1, "CaF2": 1 },
  },
  ion_CaBr: {
    label: "Formação do dibrometo de cálcio", equation: "Ca + Br₂ → CaBr₂", tipoLigacao: "ionico", deltaEN: 1.96, caraterLigacao: "iônica",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "Ca": 1, "Br2": 1, "CaBr2": 1 },
  },
  ion_CaI: {
    label: "Formação do diiodeto de cálcio", equation: "Ca + I₂ → CaI₂", tipoLigacao: "ionico", deltaEN: 1.66, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Ca": 1, "I2": 1, "CaI2": 1 },
  },
  ion_CaO: {
    label: "Formação do óxido de cálcio", equation: "2 Ca + O₂ → 2 CaO", tipoLigacao: "ionico", deltaEN: 2.44, caraterLigacao: "iônica",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 4 }, { formula: "O2", label: "O₂", defaultQty: 3 }],
    coeffs: { "Ca": 2, "O2": 1, "CaO": 2 },
  },
  ion_CaS: {
    label: "Formação do sulfeto de cálcio", equation: "Ca + S → CaS", tipoLigacao: "ionico", deltaEN: 1.58, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 2 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { "Ca": 1, "S": 1, "CaS": 1 },
  },
  ion_CaN: {
    label: "Formação do dinitreto de tricálcio", equation: "3 Ca + N₂ → Ca₃N₂", tipoLigacao: "ionico", deltaEN: 2.04, caraterLigacao: "iônica",
    reagents: [{ formula: "Ca", label: "Ca", defaultQty: 6 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Ca": 3, "N2": 1, "Ca3N2": 1 },
  },
  ion_AlF: {
    label: "Formação do trifluoreto de alumínio", equation: "2 Al + 3 F₂ → 2 AlF₃", tipoLigacao: "ionico", deltaEN: 2.37, caraterLigacao: "iônica",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 7 }],
    coeffs: { "Al": 2, "F2": 3, "AlF3": 2 },
  },
  ion_AlCl: {
    label: "Formação do tricloreto de alumínio", equation: "2 Al + 3 Cl₂ → 2 AlCl₃", tipoLigacao: "ionico", deltaEN: 1.55, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 4 }, { formula: "Cl2", label: "Cl₂", defaultQty: 7 }],
    coeffs: { "Al": 2, "Cl2": 3, "AlCl3": 2 },
  },
  ion_AlBr: {
    label: "Formação do tribrometo de alumínio", equation: "2 Al + 3 Br₂ → 2 AlBr₃", tipoLigacao: "ionico", deltaEN: 1.35, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 4 }, { formula: "Br2", label: "Br₂", defaultQty: 7 }],
    coeffs: { "Al": 2, "Br2": 3, "AlBr3": 2 },
  },
  ion_AlI: {
    label: "Formação do triiodeto de alumínio", equation: "2 Al + 3 I₂ → 2 AlI₃", tipoLigacao: "ionico", deltaEN: 1.05, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 4 }, { formula: "I2", label: "I₂", defaultQty: 7 }],
    coeffs: { "Al": 2, "I2": 3, "AlI3": 2 },
  },
  ion_AlS: {
    label: "Formação do trisulfeto de dialumínio", equation: "2 Al + 3 S → Al₂S₃", tipoLigacao: "ionico", deltaEN: 0.97, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 4 }, { formula: "S", label: "S", defaultQty: 7 }],
    coeffs: { "Al": 2, "S": 3, "Al2S3": 1 },
  },
  ion_AlN: {
    label: "Formação do nitreto de alumínio", equation: "2 Al + N₂ → 2 AlN", tipoLigacao: "ionico", deltaEN: 1.43, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Al", label: "Al", defaultQty: 4 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Al": 2, "N2": 1, "AlN": 2 },
  },
  ion_ZnF: {
    label: "Formação do difluoreto de zinco", equation: "Zn + F₂ → ZnF₂", tipoLigacao: "ionico", deltaEN: 2.33, caraterLigacao: "iônica",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 2 }, { formula: "F2", label: "F₂", defaultQty: 3 }],
    coeffs: { "Zn": 1, "F2": 1, "ZnF2": 1 },
  },
  ion_ZnBr: {
    label: "Formação do dibrometo de zinco", equation: "Zn + Br₂ → ZnBr₂", tipoLigacao: "ionico", deltaEN: 1.31, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 2 }, { formula: "Br2", label: "Br₂", defaultQty: 3 }],
    coeffs: { "Zn": 1, "Br2": 1, "ZnBr2": 1 },
  },
  ion_ZnI: {
    label: "Formação do diiodeto de zinco", equation: "Zn + I₂ → ZnI₂", tipoLigacao: "ionico", deltaEN: 1.01, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 2 }, { formula: "I2", label: "I₂", defaultQty: 3 }],
    coeffs: { "Zn": 1, "I2": 1, "ZnI2": 1 },
  },
  ion_ZnS: {
    label: "Formação do sulfeto de zinco", equation: "Zn + S → ZnS", tipoLigacao: "ionico", deltaEN: 0.93, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 2 }, { formula: "S", label: "S", defaultQty: 3 }],
    coeffs: { "Zn": 1, "S": 1, "ZnS": 1 },
  },
  ion_ZnN: {
    label: "Formação do dinitreto de trizinco", equation: "3 Zn + N₂ → Zn₃N₂", tipoLigacao: "ionico", deltaEN: 1.39, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Zn", label: "Zn", defaultQty: 6 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Zn": 3, "N2": 1, "Zn3N2": 1 },
  },
  ion_FeF: {
    label: "Formação do trifluoreto de ferro III", equation: "2 Fe + 3 F₂ → 2 FeF₃", tipoLigacao: "ionico", deltaEN: 2.15, caraterLigacao: "iônica",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 4 }, { formula: "F2", label: "F₂", defaultQty: 7 }],
    coeffs: { "Fe": 2, "F2": 3, "FeF3": 2 },
  },
  ion_FeBr: {
    label: "Formação do tribrometo de ferro III", equation: "2 Fe + 3 Br₂ → 2 FeBr₃", tipoLigacao: "ionico", deltaEN: 1.13, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 4 }, { formula: "Br2", label: "Br₂", defaultQty: 7 }],
    coeffs: { "Fe": 2, "Br2": 3, "FeBr3": 2 },
  },
  ion_FeI: {
    label: "Formação do triiodeto de ferro III", equation: "2 Fe + 3 I₂ → 2 FeI₃", tipoLigacao: "ionico", deltaEN: 0.83, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 4 }, { formula: "I2", label: "I₂", defaultQty: 7 }],
    coeffs: { "Fe": 2, "I2": 3, "FeI3": 2 },
  },
  ion_FeS: {
    label: "Formação do trisulfeto de diferro III", equation: "2 Fe + 3 S → Fe₂S₃", tipoLigacao: "ionico", deltaEN: 0.75, caraterLigacao: "iônica (regra geral metal+ametal — ΔEN abaixo do critério estrito de Pauling)",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 4 }, { formula: "S", label: "S", defaultQty: 7 }],
    coeffs: { "Fe": 2, "S": 3, "Fe2S3": 1 },
  },
  ion_FeN: {
    label: "Formação do nitreto de ferro III", equation: "2 Fe + N₂ → 2 FeN", tipoLigacao: "ionico", deltaEN: 1.21, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [{ formula: "Fe", label: "Fe", defaultQty: 4 }, { formula: "N2", label: "N₂", defaultQty: 3 }],
    coeffs: { "Fe": 2, "N2": 1, "FeN": 2 },
  },
  ligaOuroCobre: {
    label: "Liga Metálica: Ouro + Cobre (joalheria)", equation: "Au + Cu — liga metálica", modo: "metalico",
    reagents: [{ formula: "Au", label: "Au", defaultQty: 7 }, { formula: "Cu", label: "Cu", defaultQty: 5 }],
  },
  ligaPrataEsterlina: {
    label: "Liga Metálica: Prata + Cobre (prata de lei)", equation: "Ag + Cu — liga metálica", modo: "metalico",
    reagents: [{ formula: "Ag", label: "Ag", defaultQty: 8 }, { formula: "Cu", label: "Cu", defaultQty: 3 }],
  },
  ligaEletro: {
    label: "Liga Metálica: Ouro + Prata (electrum)", equation: "Au + Ag — liga metálica", modo: "metalico",
    reagents: [{ formula: "Au", label: "Au", defaultQty: 6 }, { formula: "Ag", label: "Ag", defaultQty: 6 }],
  },

  // ==================================================================
  // REAÇÕES COM 3 A 6 REAGENTES — o motor já é genérico sobre o nº de
  // reagentes (nenhuma parte do código pressupõe exatamente 2), então
  // estas entradas só precisaram de pesquisa/balanceamento, sem mudança
  // de engine. Dois grupos:
  // (a) carbonatos/silicatos — síntese teórica a partir dos elementos;
  //     o C/Si forma 1 ligação dupla + 2 simples (como na estrutura real
  //     do íon carbonato/silicato) e o metal doa 1 e⁻ para cada O que
  //     ficou com valência aberta — combina covalente + iônica na MESMA
  //     molécula, o que o motor já suporta nativamente.
  // (b) halogenações múltiplas / combustão de misturas — vários
  //     reagentes simples reagindo em paralelo (cada ligação isolada é
  //     simples; a complexidade vem da quantidade de peças, não da
  //     dificuldade de cada ligação).
  // ==================================================================
  calcita: {
    label: "Carbonato de cálcio (calcário)", equation: "2 Ca + 2 C + 3 O₂ → 2 CaCO₃", tipoLigacao: "ionico", deltaEN: 1.55, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [
      { formula: "Ca", label: "Ca", defaultQty: 2 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { Ca: 2, C: 2, O2: 3, CaCO3: 2 },
  },
  carbonatoSodio: {
    label: "Carbonato de sódio (barrilha)", equation: "4 Na + 2 C + 3 O₂ → 2 Na₂CO₃", tipoLigacao: "ionico", deltaEN: 1.62, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [
      { formula: "Na", label: "Na", defaultQty: 4 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { Na: 4, C: 2, O2: 3, Na2CO3: 2 },
  },
  carbonatoMagnesio: {
    label: "Carbonato de magnésio", equation: "2 Mg + 2 C + 3 O₂ → 2 MgCO₃", tipoLigacao: "ionico", deltaEN: 1.24, caraterLigacao: "iônica (zona de transição — caráter parcialmente covalente)",
    reagents: [
      { formula: "Mg", label: "Mg", defaultQty: 2 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { Mg: 2, C: 2, O2: 3, MgCO3: 2 },
  },
  carbonatoPotassio: {
    label: "Carbonato de potássio (potassa)", equation: "4 K + 2 C + 3 O₂ → 2 K₂CO₃", tipoLigacao: "ionico", deltaEN: 1.73, caraterLigacao: "iônica",
    reagents: [
      { formula: "K", label: "K", defaultQty: 4 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { K: 4, C: 2, O2: 3, K2CO3: 2 },
  },
  silicatoCalcio: {
    label: "Silicato de cálcio (cimento)", equation: "2 Ca + 2 Si + 3 O₂ → 2 CaSiO₃", tipoLigacao: "ionico", deltaEN: 2.44, caraterLigacao: "iônica",
    reagents: [
      { formula: "Ca", label: "Ca", defaultQty: 2 },
      { formula: "Si", label: "Si", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { Ca: 2, Si: 2, O2: 3, CaSiO3: 2 },
  },
  silicatoMagnesio: {
    label: "Silicato de magnésio (piroxênio)", equation: "2 Mg + 2 Si + 3 O₂ → 2 MgSiO₃", tipoLigacao: "ionico", deltaEN: 2.13, caraterLigacao: "iônica",
    reagents: [
      { formula: "Mg", label: "Mg", defaultQty: 2 },
      { formula: "Si", label: "Si", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { Mg: 2, Si: 2, O2: 3, MgSiO3: 2 },
  },
  silicatoSodio: {
    label: "Silicato de sódio (vidro solúvel)", equation: "4 Na + 2 Si + 3 O₂ → 2 Na₂SiO₃", tipoLigacao: "ionico", deltaEN: 2.51, caraterLigacao: "iônica",
    reagents: [
      { formula: "Na", label: "Na", defaultQty: 4 },
      { formula: "Si", label: "Si", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 3 },
    ],
    coeffs: { Na: 4, Si: 2, O2: 3, Na2SiO3: 2 },
  },
  halogenacaoMg: {
    label: "Halogenação mista do magnésio", equation: "2 Mg + Cl₂ + Br₂ → MgCl₂ + MgBr₂", tipoLigacao: "ionico", deltaEN: 1.85, caraterLigacao: "iônica",
    reagents: [
      { formula: "Mg", label: "Mg", defaultQty: 2 },
      { formula: "Cl2", label: "Cl₂", defaultQty: 1 },
      { formula: "Br2", label: "Br₂", defaultQty: 1 },
    ],
    coeffs: { Mg: 2, Cl2: 1, Br2: 1, MgCl2: 1, MgBr2: 1 },
  },
  halogenacaoNa: {
    label: "Halogenação múltipla do sódio", equation: "6 Na + F₂ + Cl₂ + Br₂ → 2 NaF + 2 NaCl + 2 NaBr", tipoLigacao: "ionico", deltaEN: 3.05, caraterLigacao: "iônica",
    reagents: [
      { formula: "Na", label: "Na", defaultQty: 6 },
      { formula: "F2", label: "F₂", defaultQty: 1 },
      { formula: "Cl2", label: "Cl₂", defaultQty: 1 },
      { formula: "Br2", label: "Br₂", defaultQty: 1 },
    ],
    coeffs: { Na: 6, F2: 1, Cl2: 1, Br2: 1, NaF: 2, NaCl: 2, NaBr: 2 },
  },
  halogenacaoK: {
    label: "Halogenação completa do potássio", equation: "8 K + F₂ + Cl₂ + Br₂ + I₂ → 2 KF + 2 KCl + 2 KBr + 2 KI", tipoLigacao: "ionico", deltaEN: 3.16, caraterLigacao: "iônica",
    reagents: [
      { formula: "K", label: "K", defaultQty: 8 },
      { formula: "F2", label: "F₂", defaultQty: 1 },
      { formula: "Cl2", label: "Cl₂", defaultQty: 1 },
      { formula: "Br2", label: "Br₂", defaultQty: 1 },
      { formula: "I2", label: "I₂", defaultQty: 1 },
    ],
    coeffs: { K: 8, F2: 1, Cl2: 1, Br2: 1, I2: 1, KF: 2, KCl: 2, KBr: 2, KI: 2 },
  },
  reatividadeTotalK: {
    label: "Reatividade total do potássio", equation: "12 K + F₂ + Cl₂ + Br₂ + I₂ + O₂ → 2 KF + 2 KCl + 2 KBr + 2 KI + 2 K₂O", tipoLigacao: "ionico", deltaEN: 3.16, caraterLigacao: "iônica",
    reagents: [
      { formula: "K", label: "K", defaultQty: 12 },
      { formula: "F2", label: "F₂", defaultQty: 1 },
      { formula: "Cl2", label: "Cl₂", defaultQty: 1 },
      { formula: "Br2", label: "Br₂", defaultQty: 1 },
      { formula: "I2", label: "I₂", defaultQty: 1 },
      { formula: "O2", label: "O₂", defaultQty: 1 },
    ],
    coeffs: { K: 12, F2: 1, Cl2: 1, Br2: 1, I2: 1, O2: 1, KF: 2, KCl: 2, KBr: 2, KI: 2, K2O: 2 },
  },
  combustaoMista3: {
    label: "Combustão de mistura combustível (H₂+CH₄+C)", equation: "2 H₂ + 2 CH₄ + 2 C + 7 O₂ → 4 CO₂ + 6 H₂O", deltaEN: 0.00, caraterLigacao: "covalente apolar",
    reagents: [
      { formula: "H2", label: "H₂", defaultQty: 2 },
      { formula: "CH4", label: "CH₄", defaultQty: 2 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 7 },
    ],
    coeffs: { H2: 2, CH4: 2, C: 2, O2: 7, CO2: 4, H2O: 6 },
  },
  combustaoMista4: {
    label: "Combustão com impureza de silício", equation: "2 H₂ + 2 CH₄ + 2 C + 2 Si + 9 O₂ → 4 CO₂ + 6 H₂O + 2 SiO₂", deltaEN: 0.00, caraterLigacao: "covalente apolar",
    reagents: [
      { formula: "H2", label: "H₂", defaultQty: 2 },
      { formula: "CH4", label: "CH₄", defaultQty: 2 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "Si", label: "Si", defaultQty: 2 },
      { formula: "O2", label: "O₂", defaultQty: 9 },
    ],
    coeffs: { H2: 2, CH4: 2, C: 2, Si: 2, O2: 9, CO2: 4, H2O: 6, SiO2: 2 },
  },
  combustaoCarvaoMineral: {
    label: "Combustão do carvão mineral (mistura complexa)", equation: "2 H₂ + 2 CH₄ + 2 C + 2 Si + 4 P + 12 O₂ → 4 CO₂ + 6 H₂O + 2 SiO₂ + 2 P₂O₃", deltaEN: 0.00, caraterLigacao: "covalente apolar",
    reagents: [
      { formula: "H2", label: "H₂", defaultQty: 2 },
      { formula: "CH4", label: "CH₄", defaultQty: 2 },
      { formula: "C", label: "C", defaultQty: 2 },
      { formula: "Si", label: "Si", defaultQty: 2 },
      { formula: "P", label: "P", defaultQty: 4 },
      { formula: "O2", label: "O₂", defaultQty: 12 },
    ],
    coeffs: { H2: 2, CH4: 2, C: 2, Si: 2, P: 4, O2: 12, CO2: 4, H2O: 6, SiO2: 2, P2O3: 2 },
  },
};

let currentReactionKey = "water";
/* ── ESTADO VAZIO NO CARREGAMENTO ──
   O SIE abria com a reacao da agua ja montada no canvas, o que fazia
   "tem reacao escolhida" ser sempre verdadeiro — o realce da area
   central nunca poderia significar nada.

   Por que uma flag em vez de currentReactionKey = null: existem seis
   pontos que fazem REACTIONS[currentReactionKey].algo SEM checar se
   veio undefined. Zerar a chave transformaria cada um deles num
   TypeError. Mantendo a chave apontando para um objeto valido e
   controlando o estado por esta flag, nenhum desses pontos muda de
   comportamento e o canvas continua vazio ate a primeira escolha. */
let reacaoEscolhida = false;
let currentQuantities = {};

/* ---------------------------------------------------------------
   4. ESTADO GERAL DA SIMULAÇÃO
   --------------------------------------------------------------- */
const EA_NECESSARIA = 100;
const CARGA_POR_SEGUNDO = 42;
const DECAIMENTO_POR_SEGUNDO = 70;
const RAIO_ATRACAO_MULT = 2.6;
const RAIO_CAPTURA_MULT = 1.25;

let state = "IDLE"; // IDLE -> CHARGING -> ACTIVATED -> VALIDATED
let charge = 0;
let tempoCongelado = null; // timestamp fixo usado só pelo osciloscópio de energia pós-validação (a animação dos elétrons nos átomos continua sempre ativa)
let chargingHeld = false;

const atoms = new Map();
const bonds = new Map();
let atomIdSeq = 0;
let bondIdSeq = 0;
let flyingElectrons = [];

/* ---------------------------------------------------------------
   5. MUNDO FÍSICO (Matter.js) — corpos rígidos 2D, colisão real
   ---------------------------------------------------------------
   Matter.js vem de um CDN externo. Numa conexão instável, modo avião
   ou bloqueio de rede, o script pode não carregar — e como o motor de
   física é usado em todo o restante deste arquivo (não é um recurso
   isolado), não há como degradar graciosamente feature por feature.
   Em vez de travar com um erro silencioso no console e a página pela
   metade, mostramos um aviso claro e paramos a inicialização.
   --------------------------------------------------------------- */
if (typeof Matter === 'undefined') {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                background:#090c11;color:#e8edf2;font-family:'Segoe UI',system-ui,sans-serif;
                text-align:center;padding:2rem;">
      <div style="max-width:420px;">
        <div style="font-size:2.5rem;margin-bottom:1rem;">⚠️</div>
        <h1 style="font-family:'Segoe UI',system-ui,sans-serif;font-size:1.3rem;margin:0 0 .75rem;">
          Não foi possível carregar o simulador
        </h1>
        <p style="color:#7b8794;font-size:.92rem;line-height:1.5;margin-bottom:1.25rem;">
          O motor de física (Matter.js) não carregou — verifique sua conexão
          com a internet e recarregue a página. Se o problema persistir,
          tente novamente mais tarde.
        </p>
        <a href="index.html" style="display:inline-flex;align-items:center;gap:.4rem;
           color:#FF6B6B;text-decoration:none;font-size:.85rem;font-weight:600;
           border:1px solid #232b38;border-radius:6px;padding:.4rem .8rem;">
          ← Voltar à Central de Simuladores
        </a>
      </div>
    </div>`;
  throw new Error('SIE: Matter.js não carregou (CDN indisponível) — inicialização interrompida.');
}
const engine = Matter.Engine.create();
engine.world.gravity.x = 0;
engine.world.gravity.y = 0; // ambiente molecular em "gravidade zero"

// Portado do SIMA (scriptsima.js) — feedback sonoro discreto para
// mecânicas da sidebar (abrir/fechar painel, ativar módulo). Osc +
// gain com decaimento exponencial, sem dependência externa. Falha
// silenciosa em navegadores sem Web Audio ou com autoplay bloqueado —
// nunca deve travar a interação por causa de som.
let _audioCtx = null;
function playTone(freq = 880, dur = 0.08, vol = 0.07) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!_audioCtx) _audioCtx = new Ctx();
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain); gain.connect(_audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + dur);
    osc.start(); osc.stop(_audioCtx.currentTime + dur);
  } catch (e) { /* silencioso — som é reforço, nunca bloqueio */ }
}

/* ---------------------------------------------------------------
   6. CANVAS 2D
   --------------------------------------------------------------- */
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
addEventListener("orientationchange", () => setTimeout(resize, 150));
resize();

const BREAKPOINT_MOBILE = 768;

function areaDeJogo() {
  const headerEl = document.querySelector(".app-header");
  const headerH = headerEl ? headerEl.getBoundingClientRect().height : 54;
  const top = headerH + 24; // título/status saíram do canvas; só uma margem de respiro
  const bottom = innerHeight - 24;

  // Em telas estreitas as sidebars viram GAVETAS que sobrepõem o canvas
  // (como em qualquer app mobile padrão) em vez de espremê-lo — então o
  // canvas usa a largura/altura cheias da tela, estejam as gavetas
  // abertas ou não.
  if (innerWidth <= BREAKPOINT_MOBILE) {
    const left = 14;
    const right = innerWidth - 14;
    return { left, right: Math.max(left + 150, right), top, bottom: Math.max(top + 150, bottom) };
  }

  // Medido em tempo real a partir do DOM (sidebar à esquerda, HUD à
  // direita, cabeçalho fixo no topo) — evita "chutar" margens fixas que
  // ficam erradas sempre que o layout muda (era a causa de átomos
  // aparecerem atrás da sidebar).
  const sidebarEl = document.getElementById("sidebar-left");
  const hudEl = document.getElementById("sidebar-right");
  const sidebarW = sidebarEl ? sidebarEl.getBoundingClientRect().width : 360;
  const hudW = hudEl ? hudEl.getBoundingClientRect().width : 0; // 0 quando oculto (display:none)

  const left = sidebarW + 40;
  const right = innerWidth - (hudW > 0 ? hudW + 64 : 40);
  return {
    left,
    right: Math.max(left + 200, right),
    top,
    bottom: Math.max(top + 200, bottom),
  };
}

/* ---------------------------------------------------------------
   7. FÁBRICA DE ÁTOMOS E LIGAÇÕES
   --------------------------------------------------------------- */
// escala: multiplicador opcional do raio (default 1 = tamanho normal,
// o que a Estequiometria sempre usou). O módulo Mols passa um valor
// menor pra caber mais substâncias na tela sem ficar ilegível — ver
// MOLS_ESCALA mais abaixo.
function criarAtomo(elemento, pos, escala = 1) {
  const id = "a" + (atomIdSeq++);
  const def = ELEMENTS[elemento];
  const radiusPx = def.radius * PX_POR_ANGSTROM * escala;

  const body = Matter.Bodies.circle(pos.x, pos.y, radiusPx, {
    restitution: 0, // sem ricochete em colisões — átomos se tocam e simplesmente param/escorregam
    friction: 0.02,
    frictionAir: 0.06,
    inertia: Infinity, // trava a rotação — círculos não precisam girar e isso simplifica o desenho dos elétrons
  });
  Matter.Composite.add(engine.world, body);

  const atomo = {
    id, elemento, body, radiusPx,
    tipo: def.tipo,
    valenceMax: def.valence,
    lonePairs: def.lonePairs,
    bondIds: new Set(),
    phase: Math.random() * Math.PI * 2,
    isDragging: false,
  };
  atoms.set(id, atomo);
  return atomo;
}

function criarLigacao(atomoA, atomoB, order, comprimentoIdeal, opcoes) {
  opcoes = opcoes || {};
  const id = "b" + (bondIdSeq++);
  const constraint = Matter.Constraint.create({
    bodyA: atomoA.body,
    bodyB: atomoB.body,
    length: comprimentoIdeal,
    stiffness: Math.min(0.85, 0.3 + order * 0.18),
    damping: 0.2,
  });
  Matter.Composite.add(engine.world, constraint);

  const ligacao = {
    id, atomA: atomoA.id, atomB: atomoB.id, order, constraint, restLength: comprimentoIdeal, integrity: 1,
    ionica: !!opcoes.ionica,
    doador: opcoes.doador || null,   // id do átomo que cede o(s) elétron(s) — só em ligação iônica
    receptor: opcoes.receptor || null,
  };
  bonds.set(id, ligacao);
  atomoA.bondIds.add(id);
  atomoB.bondIds.add(id);
  return ligacao;
}

function removerLigacao(id) {
  const ligacao = bonds.get(id);
  if (!ligacao) return;
  Matter.Composite.remove(engine.world, ligacao.constraint);
  const a = atoms.get(ligacao.atomA);
  const b = atoms.get(ligacao.atomB);
  if (a) a.bondIds.delete(id);
  if (b) b.bondIds.delete(id);
  bonds.delete(id);
}

function encontrarLigacaoEntre(a, b) {
  for (const id of a.bondIds) if (b.bondIds.has(id)) return bonds.get(id);
  return null;
}

// Nº de elétrons de valência ainda livres (não comprometidos em nenhuma
// ligação) — calculado a partir das ligações reais, nunca armazenado à
// parte, eliminando qualquer risco de desincronização desse contador.
function slotsLivres(atomo) {
  const usados = [...atomo.bondIds].reduce((soma, bid) => soma + bonds.get(bid).order, 0);
  return atomo.valenceMax - usados;
}

/* ---------------------------------------------------------------
   8. MONTAGEM DE MOLÉCULAS A PARTIR DOS GABARITOS
   --------------------------------------------------------------- */
function limparCena() {
  [...bonds.keys()].forEach((id) => removerLigacao(id));
  atoms.forEach((a) => Matter.Composite.remove(engine.world, a.body));
  atoms.clear();
  atomIdSeq = 0;
  bondIdSeq = 0;
  flyingElectrons = [];
  metallicElectrons = [];
}

function instanciarMolecula(formulaKey, centro, escala = 1) {
  const template = MOLECULE_TEMPLATES[formulaKey];
  const ang = Math.random() * Math.PI * 2;
  const cos = Math.cos(ang), sin = Math.sin(ang);
  const girar = (p) => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos });

  const criados = template.atoms.map((elemento, i) => {
    const off = girar(template.offsets[i]);
    return criarAtomo(elemento, { x: centro.x + off.x * escala, y: centro.y + off.y * escala }, escala);
  });

  template.bonds.forEach(([i, j, order]) => {
    const dx = template.offsets[i].x - template.offsets[j].x;
    const dy = template.offsets[i].y - template.offsets[j].y;
    const dist = Math.hypot(dx, dy) * escala;
    criarLigacao(criados[i], criados[j], order, dist);
  });

  return criados;
}

// Raio de "ocupação" de uma molécula (do centro até a borda do átomo
// mais distante) — usado para garantir espaçamento mínimo no spawn.
// Nem toda fórmula tem gabarito em MOLECULE_TEMPLATES: produtos que só
// existem depois de uma reação de verdade (ex. HCl, NH3, CO2) nunca
// precisaram de um, porque nasciam da física de ligação, não de um
// spawn direto — mas o módulo Mols desenha reagentes E produtos juntos
// de uma vez, então esta função passou a precisar cobrir os dois casos.
// Sem gabarito, estima o raio com o MESMO cálculo que o desenho de
// fallback do Mols usa (átomo central + periférico à distância da soma
// dos raios reais) — antes usava um valor genérico fixo (1 Å pra
// qualquer par), que subestimava o espaço de moléculas com átomos
// grandes (K, I, Br) e deixava moléculas vizinhas próximas demais.
// escala: mesmo multiplicador de criarAtomo/instanciarMolecula — default
// 1 preserva o comportamento de sempre pra Estequiometria.
function raioMolecula(formulaKey, escala = 1) {
  const template = MOLECULE_TEMPLATES[formulaKey];
  if (!template) {
    const contagem = contarAtomos(formulaKey);
    const simbolosUnicos = Object.keys(contagem);
    if (simbolosUnicos.length === 0) return 20 * escala;
    let simboloCentral = simbolosUnicos[0];
    simbolosUnicos.forEach((s) => { if (contagem[s] < contagem[simboloCentral]) simboloCentral = s; });
    const raioCentralAngstrom = ELEMENTS[simboloCentral].radius;
    let maiorAlcanceAngstrom = raioCentralAngstrom; // molécula de 1 átomo só (ex.: "K" sozinho como reagente)
    simbolosUnicos.forEach((s) => {
      if (s === simboloCentral) return; // o próprio central não é "periférico" de si mesmo
      const alcance = raioCentralAngstrom + ELEMENTS[s].radius * 2; // até a borda externa do periférico
      if (alcance > maiorAlcanceAngstrom) maiorAlcanceAngstrom = alcance;
    });
    return maiorAlcanceAngstrom * PX_POR_ANGSTROM * escala;
  }
  let maxR = 0;
  template.atoms.forEach((elemento, i) => {
    const off = template.offsets[i];
    const dist = (Math.hypot(off.x, off.y) + ELEMENTS[elemento].radius * PX_POR_ANGSTROM) * escala;
    if (dist > maxR) maxR = dist;
  });
  return maxR;
}

// Posiciona N moléculas numa grade embaralhada (em vez de posição 100%
// aleatória) — garante uma distância mínima entre os centros, grande o
// bastante para a maior molécula do lote. Sem isso, com até 6 reagentes
// e quantidades altas, a sobreposição inicial era comum e o solver de
// física tentava resolver várias penetrações ao mesmo tempo, "explodindo"
// os átomos com velocidades absurdas logo no primeiro frame.
function gerarPosicoesSemSobreposicao(formulas, area, escala = 1) {
  const n = formulas.length;
  if (n === 0) return [];

  const maiorRaio = Math.max(...formulas.map((f) => raioMolecula(f, escala)), 20);
  const espacamentoMinimo = maiorRaio * 2.3;

  const largura = Math.max(200, area.right - area.left);
  const altura = Math.max(200, area.bottom - area.top);

  // quantas colunas/linhas cabem no espaço SEM violar o espaçamento mínimo
  const maxCols = Math.max(1, Math.floor(largura / espacamentoMinimo));
  const maxRows = Math.max(1, Math.floor(altura / espacamentoMinimo));

  let cols, rows;
  if (maxCols * maxRows >= n) {
    // há espaço de sobra: escolhe a grade mais "quadrada" possível dentro
    // do limite que cada eixo permite, garantindo cellW E cellH adequados
    const minColsNecessarias = Math.ceil(n / maxRows);
    const colsIdeais = Math.round(Math.sqrt((n * largura) / altura));
    cols = Math.min(maxCols, Math.max(minColsNecessarias, colsIdeais, 1));
    rows = Math.ceil(n / cols);
  } else {
    // espaço insuficiente para o espaçamento ideal de todas as N moléculas
    // ao mesmo tempo — aceita a grade mais equilibrada possível (ainda
    // assim muito melhor que posição 100% aleatória, que sobrepunha tudo)
    cols = Math.max(1, Math.round(Math.sqrt((n * largura) / altura)));
    rows = Math.max(1, Math.ceil(n / cols));
  }

  const cellW = largura / cols;
  const cellH = altura / rows;

  const celulas = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) celulas.push({ r, c });
  for (let i = celulas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [celulas[i], celulas[j]] = [celulas[j], celulas[i]];
  }

  const jitterMax = Math.min(cellW, cellH) * 0.22;
  return formulas.map((_, idx) => {
    const { r, c } = celulas[idx % celulas.length];
    return {
      x: area.left + c * cellW + cellW / 2 + (Math.random() - 0.5) * jitterMax,
      y: area.top + r * cellH + cellH / 2 + (Math.random() - 0.5) * jitterMax,
    };
  });
}

// Mesma escala reduzida que o módulo Mols usa (ver MOLS_ESCALA) — a
// Estequiometria tinha o mesmo problema: com quantidades aleatórias
// (ver gerarQuantidadesAleatorias) alguns reagentes podem chegar a
// 8-12 unidades, e átomos grandes como K (85px de raio em escala 1)
// lotavam o canvas rapidinho. Mesmo valor 0,5 do Mols, pela mesma
// razão — consistência entre os dois módulos, não um ajuste
// específico daqui.
const ESTEQ_ESCALA = 0.5;

function montarReagentes(specs) {
  limparCena();
  state = "IDLE";
  charge = 0;
  tempoCongelado = null;
  energyBtn.classList.remove("is-charging");
  atualizarRotuloBotaoEnergia();

  const area = areaDeJogo();
  const formulas = [];
  specs.forEach((spec) => { for (let i = 0; i < spec.qty; i++) formulas.push(spec.formula); });
  const posicoes = gerarPosicoesSemSobreposicao(formulas, area, ESTEQ_ESCALA);
  formulas.forEach((formula, idx) => instanciarMolecula(formula, posicoes[idx], ESTEQ_ESCALA));

  // Trava os átomos na posição de spawn (corpos estáticos): antes da
  // energia de ativação ser fornecida, nada deve sair do lugar — só os
  // elétrons (desenho decorativo, não-físico) continuam girando. Sem
  // isso, pequenos impulsos residuais de colisão entre moléculas vizinhas
  // (inevitáveis ao posicionar muitas de uma vez) faziam tudo derivar
  // lentamente da posição inicial.
  atoms.forEach((a) => Matter.Body.setStatic(a.body, true));

  const r = REACTIONS[currentReactionKey];
  // O <h2> que mostrava o nome da reação saiu da tela; a informação
  // continua chegando a quem usa leitor de tela por aqui.
  anunciar(`Reagentes de "${r.label}" montados no canvas.`);

  if (r.modo === "metalico") {
    // ligação metálica: sem octeto, sem reagente/produto — os átomos já
    // nascem livres e o "mar de elétrons" começa a vagar imediatamente.
    // (não passa pela ruptura por energia, então libera do estático aqui)
    state = "ACTIVATED";
    atoms.forEach((a) => Matter.Body.setStatic(a.body, false));
    energyBtn.disabled = true;
    document.getElementById("validateBtn").disabled = true;
    inicializarEletronsMetalicos();
    setStatus("Ligação metálica: arraste os átomos para aproximá-los e observe o mar de elétrons deslocalizados (amarelo) — não há octeto nem fórmula fixa aqui.", "info");
  } else {
    energyBtn.disabled = false;
    document.getElementById("validateBtn").disabled = true;
    setStatus('Reagentes prontos. Segure "Fornecer Energia de Ativação" para iniciar a reação.', "info");
  }
}

function montarReagentesAtual() {
  const r = REACTIONS[currentReactionKey];
  const specs = r.reagents.map((rg) => ({ formula: rg.formula, qty: currentQuantities[rg.formula] }));
  montarReagentes(specs);
}

/* ---------------------------------------------------------------
   9. ENERGIA DE ATIVAÇÃO — vibração, ruptura e estado ativado
   --------------------------------------------------------------- */
const energyBtn = document.getElementById("energyBtn");
const waveformCanvas = document.getElementById("waveform");
const wfCtx = waveformCanvas.getContext("2d");

function iniciarCarga() {
  if (!reacaoEscolhida) {
    setStatus("Escolha uma reação antes de fornecer energia de ativação.", "error");
    return;
  }
  if (state !== "IDLE") return;
  chargingHeld = true;
  state = "CHARGING";
  energyBtn.classList.add("is-charging");
  setStatus("Fornecendo energia de ativação (Eₐ) — as ligações vibram à medida que os reagentes se aproximam do complexo ativado...", "warning");
}
function soltarCarga() {
  chargingHeld = false;
  energyBtn.classList.remove("is-charging");
}
energyBtn.addEventListener("pointerdown", iniciarCarga);
addEventListener("pointerup", soltarCarga);
energyBtn.addEventListener("pointerleave", () => { if (chargingHeld) soltarCarga(); });

function ruidoPseudoPerlin(t, seed) {
  return ((Math.sin(t * 3.1 + seed * 7.0) + Math.sin(t * 5.3 + seed * 2.0) * 0.5) / 1.5) * (Math.random() * 0.4 + 0.8);
}

// Vibração: nudges diretos de posição (não força) — evita qualquer
// dependência de calibração massa/força do motor físico. O "esticar/
// encolher" real da ligação vem da mudança de constraint.length, que o
// próprio solver do Matter já resolve proporcionalmente.
function aplicarVibracao(intensidade) {
  const t = performance.now() * 0.006;
  atoms.forEach((a) => {
    const amp = 1.4 * intensidade * intensidade;
    Matter.Body.translate(a.body, {
      x: Math.sin(t + a.phase) * amp * 0.35,
      y: Math.cos(t * 1.3 + a.phase) * amp * 0.35,
    });
  });
  bonds.forEach((ligacao) => {
    const jitter = ruidoPseudoPerlin(t, ligacao.id.length + ligacao.order) * 9 * intensidade;
    ligacao.constraint.length = ligacao.restLength + jitter;
    ligacao.integrity = 1 - 0.85 * intensidade;
  });
}

// Rótulo do botão segue os 3 estágios nomeados na literatura de cinética
// química (diagrama de energia da reação): reagentes fornecem energia de
// ativação (Eₐ) → formam o complexo ativado (pico do diagrama) → este se
// decompõe nos produtos formados (estado final).
function atualizarRotuloBotaoEnergia() {
  const icone = energyBtn.querySelector(".btn-icon");
  const rotulo = energyBtn.querySelector(".btn-label");
  let texto, emoji;
  if (state === "VALIDATED") { texto = "Produtos Formados"; emoji = "✅"; }
  else if (state === "ACTIVATED") { texto = "Complexo Ativado"; emoji = "⚛️"; }
  else { texto = "Fornecer Energia de Ativação"; emoji = "⚡"; }
  if (icone) icone.textContent = emoji;
  if (rotulo) rotulo.textContent = " " + texto;
}

function romperLigacoes() {
  state = "ACTIVATED";
  energyBtn.classList.remove("is-charging");
  energyBtn.disabled = true;
  atualizarRotuloBotaoEnergia();

  // só agora os átomos deixam de ser estáticos — a reação está
  // de fato começando, então passam a poder se mover/ser arrastados.
  atoms.forEach((a) => Matter.Body.setStatic(a.body, false));

  [...bonds.keys()].forEach((id) => romperLigacaoComFlight(id));

  atoms.forEach((a) => {
    Matter.Body.setVelocity(a.body, {
      x: a.body.velocity.x + (Math.random() - 0.5) * 5,
      y: a.body.velocity.y + (Math.random() - 0.5) * 5,
    });
  });

  document.getElementById("validateBtn").disabled = false;
  setStatus("Complexo ativado! Arraste os átomos livres para formar os produtos.", "warning");
}

// Remove uma ligação do mundo físico e anima seus elétrons compartilhados
// voando de volta para os átomos de origem (usado tanto na ruptura geral
// por energia de ativação quanto na ruptura manual por estiramento).
function romperLigacaoComFlight(bondId) {
  const ligacao = bonds.get(bondId);
  if (!ligacao) return;
  const a = atoms.get(ligacao.atomA), b = atoms.get(ligacao.atomB);
  for (let p = 0; p < ligacao.order; p++) {
    const pos = calcularPosicaoParLigacao(ligacao, p);
    if (ligacao.ionica) {
      const doador = atoms.get(ligacao.doador);
      spawnFlight(pos.cx, pos.cy, doador.body.position.x, doador.body.position.y);
    } else {
      spawnFlight(pos.cx + pos.px * 3, pos.cy + pos.py * 3, a.body.position.x, a.body.position.y);
      spawnFlight(pos.cx - pos.px * 3, pos.cy - pos.py * 3, b.body.position.x, b.body.position.y);
    }
  }
  removerLigacao(bondId);
}

/* ---------------------------------------------------------------
   10. ARRASTO (corpo estático durante o drag) + MAGNETISMO
   --------------------------------------------------------------- */
const LIMIAR_RUPTURA_MANUAL = 2.3; // x o comprimento natural da ligação — puxar o átomo além disso a rompe

let draggedAtom = null;
let candidatoAtual = null;

function pointFromEvent(evento) {
  const rect = canvas.getBoundingClientRect();
  return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
}

function encontrarAtomoEm(x, y) {
  let melhor = null, menorD = Infinity;
  atoms.forEach((a) => {
    const d = Math.hypot(a.body.position.x - x, a.body.position.y - y);
    if (d <= a.radiusPx + 4 && d < menorD) { menorD = d; melhor = a; }
  });
  return melhor;
}

canvas.addEventListener("pointerdown", (evento) => {
  if (state !== "ACTIVATED") return;
  const { x, y } = pointFromEvent(evento);
  const atomo = encontrarAtomoEm(x, y);
  if (!atomo) return;

  draggedAtom = atomo;
  draggedAtom.isDragging = true;
  Matter.Body.setStatic(draggedAtom.body, true);
});

canvas.addEventListener("pointermove", (evento) => {
  if (!draggedAtom) return;
  const { x, y } = pointFromEvent(evento);
  Matter.Body.setPosition(draggedAtom.body, { x, y });
  candidatoAtual = encontrarCandidatoProximo(draggedAtom);
  romperLigacoesPorEstiramento(draggedAtom);
});

addEventListener("pointerup", () => {
  if (!draggedAtom) return;
  if (candidatoAtual) formarNovaLigacao(draggedAtom, candidatoAtual);
  Matter.Body.setStatic(draggedAtom.body, false);
  Matter.Body.setVelocity(draggedAtom.body, { x: 0, y: 0 }); // sem ricochete: solta sem nenhuma velocidade residual
  draggedAtom.isDragging = false;
  draggedAtom = null;
  candidatoAtual = null;
});

// Permite desfazer uma montagem errada: se o átomo arrastado for puxado
// além do limiar de distância da(s) sua(s) ligação(ões) atual(is), a
// ligação se rompe (com a mesma animação de elétrons voltando para o
// átomo de origem), liberando-o para ser reorganizado em outra parte.
function romperLigacoesPorEstiramento(atomo) {
  const idsParaRomper = [];
  atomo.bondIds.forEach((bid) => {
    const ligacao = bonds.get(bid);
    const a = atoms.get(ligacao.atomA), b = atoms.get(ligacao.atomB);
    const dist = Math.hypot(a.body.position.x - b.body.position.x, a.body.position.y - b.body.position.y);
    if (dist > ligacao.restLength * LIMIAR_RUPTURA_MANUAL) idsParaRomper.push(bid);
  });
  if (idsParaRomper.length === 0) return;
  idsParaRomper.forEach((bid) => romperLigacaoComFlight(bid));
  setStatus("Ligação desfeita — reorganize os átomos para corrigir a montagem.", "warning");
}

function encontrarCandidatoProximo(origem) {
  let melhor = null, menorDist = Infinity;
  atoms.forEach((alvo) => {
    if (alvo.id === origem.id) return;
    if (slotsLivres(origem) <= 0 || slotsLivres(alvo) <= 0) return;
    const dist = Math.hypot(alvo.body.position.x - origem.body.position.x, alvo.body.position.y - origem.body.position.y);
    const raioAtracao = (origem.radiusPx + alvo.radiusPx) * RAIO_ATRACAO_MULT;
    if (dist <= raioAtracao && dist < menorDist) { menorDist = dist; melhor = alvo; }
  });
  return melhor;
}

// Magnetismo ambiente: nudge de posição sutil e contínuo entre átomos
// com valência aberta — dá vida à cena, mas a ligação só se forma com
// ação manual (arrastar e soltar dentro do raio de captura).
function aplicarMagnetismoAmbiente() {
  const livres = [...atoms.values()].filter((a) => slotsLivres(a) > 0 && !a.isDragging);
  for (let i = 0; i < livres.length; i++) {
    for (let j = i + 1; j < livres.length; j++) {
      const a = livres[i], b = livres[j];
      const dist = Math.hypot(b.body.position.x - a.body.position.x, b.body.position.y - a.body.position.y);
      const raioAtracao = (a.radiusPx + b.radiusPx) * RAIO_ATRACAO_MULT;
      if (dist > raioAtracao || dist < 1) continue;
      const nudge = 0.16 * (1 - dist / raioAtracao);
      const ux = (b.body.position.x - a.body.position.x) / dist, uy = (b.body.position.y - a.body.position.y) / dist;
      Matter.Body.translate(a.body, { x: ux * nudge, y: uy * nudge });
      Matter.Body.translate(b.body, { x: -ux * nudge, y: -uy * nudge });
    }
  }
}

function manterDentroDosLimites() {
  const rect = areaDeJogo();
  atoms.forEach((a) => {
    if (a.isDragging) return;
    const p = a.body.position;
    if (p.x < rect.left) Matter.Body.translate(a.body, { x: 2, y: 0 });
    if (p.x > rect.right) Matter.Body.translate(a.body, { x: -2, y: 0 });
    if (p.y < rect.top) Matter.Body.translate(a.body, { x: 0, y: 2 });
    if (p.y > rect.bottom) Matter.Body.translate(a.body, { x: 0, y: -2 });
  });
}

// Ao validar com sucesso, a montagem deve parecer DEFINITIVA — sem
// nenhum resquício de vibração/oscilação do solver físico nem da
// rotação decorativa dos elétrons. Em vez de só "parar de aplicar
// forças" (o que ainda deixa um pouco de inércia/jitter residual do
// solver de constraints), congela os corpos como estáticos e fixa o
// timestamp usado pela órbita dos elétrons — visual 100% imóvel.
function congelarCena() {
  atoms.forEach((a) => {
    Matter.Body.setVelocity(a.body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(a.body, 0);
    Matter.Body.setStatic(a.body, true);
  });
  tempoCongelado = performance.now();
}

// Ligação metálica: átomos do mesmo retículo se atraem entre si (sem
// relação com valência/octeto — é o que diferencia o "mar de elétrons"
// da ligação covalente/iônica) para formar um aglomerado compacto.
function aplicarMagnetismoMetalico() {
  const metalicos = [...atoms.values()].filter((a) => a.tipo === "metalico" && !a.isDragging);
  for (let i = 0; i < metalicos.length; i++) {
    for (let j = i + 1; j < metalicos.length; j++) {
      const a = metalicos[i], b = metalicos[j];
      const dist = Math.hypot(b.body.position.x - a.body.position.x, b.body.position.y - a.body.position.y);
      const raioAtracao = (a.radiusPx + b.radiusPx) * 3.2;
      if (dist > raioAtracao || dist < 1) continue;
      const nudge = 0.12 * (1 - dist / raioAtracao);
      const ux = (b.body.position.x - a.body.position.x) / dist, uy = (b.body.position.y - a.body.position.y) / dist;
      Matter.Body.translate(a.body, { x: ux * nudge, y: uy * nudge });
      Matter.Body.translate(b.body, { x: -ux * nudge, y: -uy * nudge });
    }
  }
}

// "Mar de elétrons": pontos amarelos deslocalizados que vagam livremente
// por toda a região ocupada pelos átomos metálicos — não pertencem a
// nenhum átomo específico (ao contrário dos elétrons de valência
// covalentes/iônicos), refletindo a condutividade/maleabilidade do metal.
let metallicElectrons = [];
function inicializarEletronsMetalicos() {
  const n = Math.max(8, atoms.size * 2);
  metallicElectrons = Array.from({ length: n }, () => ({
    x: 0, y: 0, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6, posicionado: false,
  }));
}
function atualizarEletronsMetalicos() {
  if (metallicElectrons.length === 0 || atoms.size === 0) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  atoms.forEach((a) => {
    minX = Math.min(minX, a.body.position.x); maxX = Math.max(maxX, a.body.position.x);
    minY = Math.min(minY, a.body.position.y); maxY = Math.max(maxY, a.body.position.y);
  });
  const margem = 26;
  minX -= margem; maxX += margem; minY -= margem; maxY += margem;

  metallicElectrons.forEach((e) => {
    if (!e.posicionado) {
      e.x = minX + Math.random() * (maxX - minX);
      e.y = minY + Math.random() * (maxY - minY);
      e.posicionado = true;
    }
    e.vx = Math.max(-2, Math.min(2, e.vx + (Math.random() - 0.5) * 0.3));
    e.vy = Math.max(-2, Math.min(2, e.vy + (Math.random() - 0.5) * 0.3));
    e.x += e.vx; e.y += e.vy;
    if (e.x < minX) { e.x = minX; e.vx *= -1; }
    if (e.x > maxX) { e.x = maxX; e.vx *= -1; }
    if (e.y < minY) { e.y = minY; e.vy *= -1; }
    if (e.y > maxY) { e.y = maxY; e.vy *= -1; }
  });
}
function dibujarEletronsMetalicos() {
  metallicElectrons.forEach((e) => { if (e.posicionado) desenharPontoEletron(e.x, e.y); });
}

/* ---------------------------------------------------------------
   11. FORMAÇÃO DE LIGAÇÕES (simples ou de ordem maior) + ELÉTRONS
   IMPORTANTE: permite arrastar o MESMO par de átomos novamente para
   aumentar a ordem da ligação (dupla/tripla) — necessário para montar
   corretamente O2/N2 reformados e o CO2 (duas ligações duplas C=O).
   --------------------------------------------------------------- */
function formarNovaLigacao(a, b) {
  const ehIonica = (a.tipo === "ionico" && b.tipo === "covalente") || (a.tipo === "covalente" && b.tipo === "ionico");
  const doador = ehIonica ? (a.tipo === "ionico" ? a : b) : null;
  const receptor = ehIonica ? (a.tipo === "ionico" ? b : a) : null;

  const existente = encontrarLigacaoEntre(a, b);
  let novaOrdem;

  if (existente) {
    existente.order += 1;
    existente.restLength *= 0.92; // ligações de ordem maior são mais curtas (aproximação didática)
    existente.constraint.length = existente.restLength;
    existente.constraint.stiffness = Math.min(0.85, existente.constraint.stiffness + 0.15);
    novaOrdem = existente.order;
    const pos = calcularPosicaoParLigacao(existente, existente.order - 1);
    if (ehIonica) {
      spawnFlight(doador.body.position.x, doador.body.position.y, pos.cx, pos.cy);
    } else {
      spawnFlight(a.body.position.x, a.body.position.y, pos.cx + pos.px * 3, pos.cy + pos.py * 3);
      spawnFlight(b.body.position.x, b.body.position.y, pos.cx - pos.px * 3, pos.cy - pos.py * 3);
    }
  } else {
    const distIdeal = (a.radiusPx + b.radiusPx) * RAIO_CAPTURA_MULT * 0.8;
    const dx = b.body.position.x - a.body.position.x, dy = b.body.position.y - a.body.position.y;
    const len = Math.hypot(dx, dy) || 1;
    Matter.Body.setPosition(b.body, {
      x: a.body.position.x + (dx / len) * distIdeal,
      y: a.body.position.y + (dy / len) * distIdeal,
    });
    Matter.Body.setVelocity(b.body, { x: 0, y: 0 });

    const nova = criarLigacao(a, b, 1, distIdeal, ehIonica ? { ionica: true, doador: doador.id, receptor: receptor.id } : null);
    novaOrdem = 1;
    const pos = calcularPosicaoParLigacao(nova, 0);
    if (ehIonica) {
      spawnFlight(doador.body.position.x, doador.body.position.y, pos.cx, pos.cy);
    } else {
      spawnFlight(a.body.position.x, a.body.position.y, pos.cx + pos.px * 3, pos.cy + pos.py * 3);
      spawnFlight(b.body.position.x, b.body.position.y, pos.cx - pos.px * 3, pos.cy - pos.py * 3);
    }
  }

  setStatus(mensagemPosLigacao(a, b, novaOrdem, ehIonica, doador, receptor), "info");
  verificarConclusao();
}

// Feedback didático: deixa explícito quando um átomo ainda tem elétrons
// livres após a ligação — é exatamente o caso do CO2 (cada C=O precisa
// de uma ligação DUPLA: arraste o mesmo par de novo para reforçá-la).
// Para ligação iônica, o texto deixa claro que houve TRANSFERÊNCIA
// completa (cátion/ânion), não compartilhamento.
function mensagemPosLigacao(a, b, novaOrdem, ehIonica, doador, receptor) {
  let msg;
  if (ehIonica) {
    msg = `${doador.elemento} transferiu 1 elétron para ${receptor.elemento}: ${doador.elemento}${formatarCarga(cargaAtual(doador))} + ${receptor.elemento}${formatarCarga(cargaAtual(receptor))} (ligação iônica).`;
  } else {
    const ordemTexto = { 1: "simples", 2: "dupla", 3: "tripla" }[novaOrdem] || `ordem ${novaOrdem}`;
    msg = `Ligação ${a.elemento}–${b.elemento} formada (${ordemTexto}).`;
  }
  const ra = slotsLivres(a), rb = slotsLivres(b);
  if (ra > 0 || rb > 0) {
    const partes = [];
    if (ra > 0) partes.push(`${a.elemento} ainda tem ${ra} elétron(s) ${a.tipo === "ionico" ? "doável(is)" : "livre(s)"}`);
    if (rb > 0) partes.push(`${b.elemento} ainda tem ${rb} elétron(s) ${b.tipo === "ionico" ? "doável(is)" : "livre(s)"}`);
    msg += ` ${partes.join(" e ")} — arraste o MESMO átomo de novo sobre o parceiro para reforçar, ou conecte a outro átomo livre.`;
  }
  return msg;
}

// Carga atual de um átomo iônico: cátion = elétrons já doados (positivo);
// ânion = elétrons já recebidos (negativo). Derivado das ligações reais.
function cargaAtual(atomo) {
  if (atomo.tipo === "ionico") {
    return [...atomo.bondIds].reduce((s, bid) => s + (bonds.get(bid).ionica ? bonds.get(bid).order : 0), 0);
  }
  const recebidos = [...atomo.bondIds].reduce((s, bid) => {
    const l = bonds.get(bid);
    return s + (l.ionica && l.receptor === atomo.id ? l.order : 0);
  }, 0);
  return -recebidos;
}
function formatarCarga(carga) {
  if (!carga) return "";
  const sinal = carga > 0 ? "+" : "−";
  const mag = Math.abs(carga);
  return mag > 1 ? `${mag}${sinal}` : sinal;
}

// Posição geométrica do par de elétrons nº `pairIndex` de uma ligação,
// junto com o vetor perpendicular usado para separar os 2 pontinhos.
// Em ligação iônica, o par fica todo do lado do RECEPTOR (como mais um
// par isolado seu) — não há "compartilhamento" no meio da ligação.
function calcularPosicaoParLigacao(ligacao, pairIndex) {
  const a = atoms.get(ligacao.atomA), b = atoms.get(ligacao.atomB);
  if (ligacao.ionica) {
    const receptor = atoms.get(ligacao.receptor);
    const doador = atoms.get(ligacao.doador);
    const dx = doador.body.position.x - receptor.body.position.x;
    const dy = doador.body.position.y - receptor.body.position.y;
    const anguloBase = Math.atan2(dy, dx) + (pairIndex - (ligacao.order - 1) / 2) * 0.6;
    const raioOrbita = receptor.radiusPx + 9;
    const cx = receptor.body.position.x + Math.cos(anguloBase) * raioOrbita;
    const cy = receptor.body.position.y + Math.sin(anguloBase) * raioOrbita;
    const px = -Math.sin(anguloBase), py = Math.cos(anguloBase);
    return { cx, cy, px, py };
  }
  const ax = a.body.position.x, ay = a.body.position.y, bx = b.body.position.x, by = b.body.position.y;
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const espacamento = 9;
  const deslocamento = (pairIndex - (ligacao.order - 1) / 2) * espacamento;
  return { cx: mx + ux * deslocamento, cy: my + uy * deslocamento, px, py };
}

function spawnFlight(x0, y0, x1, y1) {
  flyingElectrons.push({ x0, y0, x1, y1, start: performance.now(), duration: 380 });
}

/* ---------------------------------------------------------------
   12. VALIDAÇÃO (Lavoisier + octeto/duteto) E HUD DINÂMICO
   --------------------------------------------------------------- */
function atomoEhExcessoElementarValido(a) {
  return a.bondIds.size === 0 && ELEMENTOS_MONOATOMICOS.has(a.elemento);
}
function listarIncompletos() {
  return [...atoms.values()].filter((a) => slotsLivres(a) > 0 && !atomoEhExcessoElementarValido(a));
}

function calcularGrupos() {
  const visitado = new Set();
  const grupos = [];
  atoms.forEach((atomo) => {
    if (visitado.has(atomo.id)) return;
    const pilha = [atomo.id];
    const grupo = [];
    while (pilha.length) {
      const id = pilha.pop();
      if (visitado.has(id)) continue;
      visitado.add(id);
      const at = atoms.get(id);
      grupo.push(at);
      at.bondIds.forEach((bid) => {
        const lig = bonds.get(bid);
        const outro = lig.atomA === id ? lig.atomB : lig.atomA;
        if (!visitado.has(outro)) pilha.push(outro);
      });
    }
    grupos.push(grupo);
  });
  return grupos;
}

// Gera a string de fórmula (ex.: "CO2", "H2O") a partir de uma contagem de
// átomos por elemento — usada tanto para grupos reais na cena (abaixo)
// quanto para o produto de uma equação gerada pela tabela periódica.
function formulaDeContagem(contagem) {
  let formula = "";
  ELEMENT_ORDER.forEach((el) => { if (contagem[el]) formula += el + (contagem[el] > 1 ? contagem[el] : ""); });
  return formula || "?";
}

// Analisa um grupo conectado (BFS de ligações reais) e o expressa como
// MÚLTIPLOS de uma unidade de fórmula mínima, reduzindo pelo MDC dos
// átomos de cada elemento. Isso é ESSENCIAL para ligação iônica: ao
// contrário da covalente (onde o octeto trava cada átomo em exatamente
// 1 molécula discreta), uma rede iônica pode legitimamente conectar
// várias "unidades de fórmula" num só bloco (ex.: 4 Al + 6 O ligados
// entre si = quimicamente 2× Al2O3, não uma fórmula "Al4O6" errada).
// Sem essa redução, montagens corretas eram rejeitadas sempre que o
// multiplicador da equação (ξ) exigia mais de 1 unidade do composto.
function analisarGrupo(grupo) {
  const contagem = {};
  grupo.forEach((a) => { contagem[a.elemento] = (contagem[a.elemento] || 0) + 1; });

  // A redução só faz sentido (e só é necessária) para compostos com 2+
  // elementos distintos — ligações covalentes homonucleares (H2, O2...)
  // já são auto-limitadas pelo octeto/duteto e NUNCA devem ser reduzidas
  // (o MDC de um único valor é ele mesmo, o que reduziria "H2" para "H"
  // incorretamente).
  const elementosDistintos = Object.keys(contagem);
  let g = 1;
  if (elementosDistintos.length >= 2) {
    const valores = Object.values(contagem);
    g = valores.reduce((acc, v) => mdc(acc, v));
    if (!g || g < 1) g = 1;
  }

  const reduzido = {};
  Object.entries(contagem).forEach(([el, n]) => { reduzido[el] = n / g; });
  const formula = formulaDeContagem(reduzido);
  const massaUnidade = Object.entries(reduzido).reduce((soma, [el, n]) => soma + ELEMENTS[el].molar * n, 0);
  return { formula, multiplicidade: g, massaUnidade };
}




// A funcao atualizarEquacaoGlobal foi REMOVIDA junto com o #globalEquation.
// Ela era a quarta copia da mesma equacao na tela. A equacao agora existe
// uma unica vez, no #eqBuilder, e e editavel.

function verificarConclusao() {
  if (listarIncompletos().length === 0 && state === "ACTIVATED") {
    setStatus('Todos os átomos saturados! Clique em "Validar Montagem" para concluir.', "info");
  }
}

// Calcula o rendimento TEÓRICO da reação a partir do reagente limitante e
// do multiplicador da equação balanceada (coeffs) — não apenas "tudo está
// com octeto satisfeito", mas "a quantidade de produto corresponde
// exatamente ao que a estequiometria da reação prevê". Sem essa conferência,
// seria possível "validar" simplesmente desfazendo tudo e reformando os
// próprios reagentes originais (que também satisfazem octeto/duteto).
// Checagem PURA de balanceamento — mesma lógica que verificarBalanceamentoUI
// já usava, extraída pra poder ser reaproveitada também na hora de
// sortear o estado inicial (garantir que não caia por acaso já
// balanceado, ver gerarCoeficientesIniciais).
function equacaoEstaBalanceada(r, coeffs) {
  const reagentes = r.reagents.map((rg) => rg.formula);
  const lados = { esq: {}, dir: {} };
  Object.entries(coeffs).forEach(([formula, coef]) => {
    const lado = reagentes.includes(formula) ? "esq" : "dir";
    Object.entries(contarAtomos(formula)).forEach(([simbolo, n]) => {
      lados[lado][simbolo] = (lados[lado][simbolo] || 0) + coef * n;
    });
  });
  const simbolos = new Set([...Object.keys(lados.esq), ...Object.keys(lados.dir)]);
  for (const s of simbolos) {
    if ((lados.esq[s] || 0) !== (lados.dir[s] || 0)) return false;
  }
  return true;
}

function calcularRendimentoTeorico(r) {
  // Usa coeffsOriginais — a proporção REAL da reação — nunca o que está
  // na caixinha (r.coeffs), que agora É o palpite que o aluno ainda
  // está ajustando. "Validar" e o rendimento teórico não podem
  // depender de uma equação que pode estar errada nesse instante.
  const coeffs = r.coeffsOriginais;
  const reagentesFormulas = r.reagents.map((rg) => rg.formula);
  const qtdInicial = (f) => currentQuantities[f] || 0;

  const razoes = reagentesFormulas.map((f) => qtdInicial(f) / coeffs[f]);
  const extensao = Math.floor(Math.min(...razoes) + 1e-9); // nº de "eventos de reação" completos possíveis

  const esperado = {};
  Object.keys(coeffs).forEach((f) => {
    esperado[f] = reagentesFormulas.includes(f)
      ? qtdInicial(f) - extensao * coeffs[f]   // sobra esperada do reagente
      : extensao * coeffs[f];                  // rendimento esperado do produto
  });
  return { extensao, esperado, reagentesFormulas };
}

function compararComEsperado(esperado, contagemFormulas) {
  const divergencias = [];
  Object.entries(esperado).forEach(([f, qtdEsperada]) => {
    const atual = contagemFormulas[f] || 0;
    if (atual !== qtdEsperada) divergencias.push({ formula: f, atual, esperado: qtdEsperada });
  });
  Object.entries(contagemFormulas).forEach(([f, atual]) => {
    if (!(f in esperado) && atual > 0) divergencias.push({ formula: f, atual, esperado: 0 });
  });
  return divergencias;
}

document.getElementById("validateBtn").addEventListener("click", () => {
  const r0 = REACTIONS[currentReactionKey];
  if (r0.modo === "metalico") {
    setStatus("Ligação metálica não tem fórmula fixa para validar — explore o mar de elétrons livremente.", "info");
    return;
  }

  const incompletos = listarIncompletos();
  if (incompletos.length > 0) {
    setStatus(`Avanço bloqueado: ${incompletos.length} átomo(s) com ligação incompleta (octeto/duteto não satisfeito).`, "error");
    return;
  }

  const grupos = calcularGrupos();
  const contagemFormulas = {};
  grupos.forEach((g) => {
    const { formula, multiplicidade } = analisarGrupo(g);
    contagemFormulas[formula] = (contagemFormulas[formula] || 0) + multiplicidade;
  });

  const r = REACTIONS[currentReactionKey];
  const { esperado, reagentesFormulas } = calcularRendimentoTeorico(r);
  const divergencias = compararComEsperado(esperado, contagemFormulas);

  if (divergencias.length > 0) {
    const detalhe = divergencias
      .map((d) => `${d.formula}: formado(s) ${d.atual}, esperado(s) ${d.esperado}`)
      .join(" | ");
    setStatus(
      `Octeto satisfeito, mas a quantidade não corresponde ao multiplicador da equação balanceada para o reagente limitante. ${detalhe}. Continue reorganizando até atingir o rendimento teórico.`,
      "error"
    );
    return;
  }

  state = "VALIDATED";
  congelarCena();
  atualizarRotuloBotaoEnergia();

  const sobras = Object.entries(contagemFormulas).filter(([f]) => reagentesFormulas.includes(f) && contagemFormulas[f] > 0);
  let banner = "Montagem validada — produtos formados: " +
    Object.entries(contagemFormulas).filter(([f]) => !reagentesFormulas.includes(f)).map(([f, n]) => `${n} ${f}`).join(", ") + ".";

  if (sobras.length > 0) {
    const excessoTxt = sobras.map(([f, n]) => `${f} sobrou (Excesso): ${n} unidade(s)`).join(" | ");
    const limitanteTxt = reagentesFormulas.filter((f) => !sobras.some(([sf]) => sf === f)).map((f) => `${f} esgotado (Limitante)`).join(" | ");
    banner += ` ${limitanteTxt} | ${excessoTxt}`;
  } else {
    banner += " Proporção exata — nenhum reagente em excesso.";
  }

  setStatus(banner, "success");
  document.getElementById("validateBtn").disabled = true;
});

/* ---------------------------------------------------------------
   13. OSCILOSCÓPIO DE ENERGIA (assinatura visual)
   --------------------------------------------------------------- */
function desenharOsciloscopio() {
  /* O buffer deste canvas ficava travado no valor do HTML (232x50) enquanto
     o CSS o exibia em outro tamanho (259x57 no desktop). Duas consequencias:
     a onda saia esticada de forma desigual (12% na horizontal, 15% na
     vertical) e, em telas de alta densidade, com um quarto dos pixels.
     Agora o buffer acompanha o tamanho exibido x DPR, e setTransform deixa
     o desenho trabalhando em pixels CSS — o resto da funcao continua igual.
     Mesmo padrao do #scene deste arquivo e dos outros 19 simuladores. */
  const dpr = window.devicePixelRatio || 1;
  const r = waveformCanvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  const bufW = Math.round(w * dpr), bufH = Math.round(h * dpr);
  if (waveformCanvas.width !== bufW || waveformCanvas.height !== bufH) {
    waveformCanvas.width = bufW; waveformCanvas.height = bufH;
  }
  wfCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  wfCtx.clearRect(0, 0, w, h);
  wfCtx.strokeStyle = "rgba(35,43,56,0.6)";
  wfCtx.beginPath(); wfCtx.moveTo(0, h / 2); wfCtx.lineTo(w, h / 2); wfCtx.stroke();

  // Produtos formados: sistema estável, de baixa energia — onda calma e
  // verde, visualmente distinta do complexo ativado (vermelho/agitado).
  if (state === "VALIDATED") {
    wfCtx.strokeStyle = "rgba(46, 204, 154, 0.85)";
    wfCtx.lineWidth = 2;
    wfCtx.beginPath();
    const t = (tempoCongelado || 0) * 0.004;
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin(x * 0.08 + t) * 2.5;
      x === 0 ? wfCtx.moveTo(x, y) : wfCtx.lineTo(x, y);
    }
    wfCtx.stroke();
    return;
  }

  const frac = charge / EA_NECESSARIA;
  const cor = frac < 0.5
    ? lerpColorRgb([240, 207, 76], [255, 140, 66], frac / 0.5)
    : lerpColorRgb([255, 140, 66], [255, 71, 87], (frac - 0.5) / 0.5);

  wfCtx.strokeStyle = `rgb(${cor[0]},${cor[1]},${cor[2]})`;
  wfCtx.lineWidth = 2;
  wfCtx.beginPath();
  const t = performance.now() * 0.01;
  for (let x = 0; x <= w; x += 4) {
    const freq = 0.15 + frac * 0.5;
    const ruido = (Math.random() - 0.5) * frac * 10;
    const y = h / 2 + Math.sin(x * freq + t) * (3 + frac * 16) + ruido;
    x === 0 ? wfCtx.moveTo(x, y) : wfCtx.lineTo(x, y);
  }
  wfCtx.stroke();
}
function lerpColorRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round);
}

/* ---------------------------------------------------------------
   14. STATUS / MENSAGENS DIDÁTICAS
   O #statusBanner saiu do topo da sidebar direita (era a "dica" fixa
   ali). setStatus() continua existindo — dezenas de lugares no arquivo
   chamam ela — só que agora ela só ANUNCIA por voz (via anunciar(),
   a mesma live region que já cuidava dos leitores de tela), sem
   desenhar nada na tela para quem enxerga.
   --------------------------------------------------------------- */
function setStatus(texto) {
  anunciar(texto);
}

/* ---------------------------------------------------------------
   15. SIDEBAR — MENU DE REAÇÕES E STEPPERS DE REAGENTES
   --------------------------------------------------------------- */
function renderizarMenuReacoes() {
  const container = document.getElementById("reactionMenu");
  container.innerHTML = "";
  const ROTULO_TIPO = { covalente: "Covalente", ionico: "Iônica", metalico: "Metálica" };
  const grupos = { covalente: [], ionico: [], metalico: [] };

  Object.entries(REACTIONS).forEach(([key, r]) => {
    const tipo = r.modo === "metalico" ? "metalico" : (r.tipoLigacao || "covalente");
    grupos[tipo].push([key, r]);
  });

  ["covalente", "ionico", "metalico"].forEach((tipo) => {
    if (grupos[tipo].length === 0) return;

    const heading = document.createElement("div");
    heading.className = "rc-group-heading";
    heading.dataset.tipoGrupo = tipo;
    heading.textContent = `${ROTULO_TIPO[tipo]} (${grupos[tipo].length})`;
    container.appendChild(heading);

    grupos[tipo].forEach(([key, r]) => {
      const card = document.createElement("button");
      card.type = "button";
      const estaAtivo = reacaoEscolhida && key === currentReactionKey;
    card.className = "reaction-card" + (estaAtivo ? " is-active" : "");
    /* WCAG 4.1.2 (Nome, Funcao, Valor): sem isto o card ativo se anunciava
       igual aos inativos no leitor de tela — a selecao existia so na cor e
       na borda. O card e <button>, entao aria-pressed e o atributo certo. */
    card.setAttribute("aria-pressed", estaAtivo ? "true" : "false");
      card.dataset.busca = `${r.label} ${r.equation} ${ROTULO_TIPO[tipo]}`.toLowerCase();
      card.dataset.tipo = tipo;
      card.innerHTML = `<span class="rc-dot" aria-hidden="true"></span><span class="rc-name">${r.label}</span>`;
      card.addEventListener("click", () => selecionarReacao(key));
      container.appendChild(card);
    });
  });

  document.getElementById("reactionsBadge").textContent = Object.keys(REACTIONS).length;
  aplicarFiltroReacoes();
}

let reactionTipoFiltroAtivo = "todas";
function aplicarFiltroReacoes() {
  const termo = document.getElementById("reactionSearch").value.trim().toLowerCase();
  document.querySelectorAll(".reaction-card").forEach((card) => {
    const correspondeBusca = !termo || card.dataset.busca.includes(termo);
    const correspondeTipo = reactionTipoFiltroAtivo === "todas" || card.dataset.tipo === reactionTipoFiltroAtivo;
    card.style.display = correspondeBusca && correspondeTipo ? "" : "none";
  });
  // esconde o cabeçalho de um grupo se nenhum card dele sobrou visível
  document.querySelectorAll(".rc-group-heading").forEach((heading) => {
    const tipo = heading.dataset.tipoGrupo;
    const algumVisivel = [...document.querySelectorAll(`.reaction-card[data-tipo="${tipo}"]`)].some((c) => c.style.display !== "none");
    heading.style.display = algumVisivel ? "" : "none";
  });
}
document.getElementById("reactionSearch").addEventListener("input", aplicarFiltroReacoes);

document.querySelectorAll(".rc-filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    reactionTipoFiltroAtivo = chip.dataset.tipo;
    document.querySelectorAll(".rc-filter-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    aplicarFiltroReacoes();
  });
});

// Sorteia o estado INICIAL da equação inteira — reagentes e produtos —
// pra virar um exercício de balanceamento de verdade: a caixinha
// mostra esse número direto (não mais "quantidade real" separada do
// "coeficiente da equação balanceada" — os dois viraram a mesma coisa,
// editável, que o aluno ajusta até bater). A proporção CERTA continua
// guardada em r.coeffsOriginais (capturada em selecionarReacao, antes
// de qualquer sorteio) — é ela que "Restaurar coeficientes" devolve, e
// é ela que os cálculos de verdade (rendimento teórico, razão,
// reagente limitante) usam por baixo, não o palpite atual do aluno.
//
// Sorteio direto de 1 a LIMITE_MOLS_ALEATORIO por substância — não é
// mais um múltiplo do coeficiente (isso explodia em reações com
// coeficiente grande, ex. O₂:9 em "Combustão com impureza de
// silício"). Garantido não cair já balanceado por acaso: se dentro de
// algumas tentativas o sorteio bater na proporção certa (ou um
// múltiplo dela), resorteia tudo de novo — sem isso o exercício às
// vezes nasceria "já resolvido", sem nada pra ajustar.
const LIMITE_MOLS_ALEATORIO = 8;

function gerarCoeficientesIniciais(r) {
  const sorteio = () => 1 + Math.floor(Math.random() * LIMITE_MOLS_ALEATORIO); // 1..8
  let coeficientes;
  let tentativas = 0;
  do {
    coeficientes = {};
    Object.keys(r.coeffsOriginais).forEach((formula) => { coeficientes[formula] = sorteio(); });
    tentativas++;
  } while (equacaoEstaBalanceada(r, coeficientes) && tentativas < 25);
  return coeficientes;
}

function selecionarReacao(key) {
  // Mesmo contrato do SIMA: nada reage no canvas antes de um módulo
  // ser ativado. Sem esta guarda, um clique num card de "Reações
  // Prontas" montava reagentes no canvas mesmo com o módulo
  // Estequiometria desligado (ou nenhum módulo ativo, no carregamento
  // inicial da página).
  if (moduloAtivo !== "estequiometria") {
    setStatus("Ative o módulo Estequiometria, na barra lateral esquerda, antes de escolher uma reação.");
    return;
  }
  reacaoEscolhida = true;
  currentReactionKey = key;
  const r = REACTIONS[key];

  // Guarda a proporção REAL do catálogo antes de qualquer sorteio — só
  // na primeira vez que a reação é escolhida nesta sessão. É o que
  // "Restaurar coeficientes" devolve, e o que os cálculos de verdade
  // (rendimento teórico, razão, reagente limitante) usam por baixo,
  // mesmo enquanto o aluno está com a equação errada na tela.
  if (!r.coeffsOriginais) r.coeffsOriginais = { ...r.coeffs };

  if (r.modo === "metalico") {
    currentQuantities = Object.fromEntries(r.reagents.map((rg) => [rg.formula, rg.defaultQty]));
  } else {
    // A caixinha da equação passa a EDITAR r.coeffs diretamente — não
    // existe mais "coeficiente da equação balanceada" (fixo, mostrado)
    // separado de "quantidade real que você tem" (sorteada, escondida
    // atrás de um badge). É a mesma caixa, o mesmo número: o aluno
    // ajusta até a equação balancear de verdade.
    r.coeffs = gerarCoeficientesIniciais(r);
    currentQuantities = {};
    r.reagents.forEach((rg) => { currentQuantities[rg.formula] = r.coeffs[rg.formula]; });
  }

  renderizarMenuReacoes();
  renderizarQuantidades();
  atualizarCalculadora();
  montarReagentesAtual();
  atualizarModeIndicator();
}

document.getElementById("resetBtn").addEventListener("click", () => {
  /* sem esta guarda, "Reiniciar" montava a agua no canvas mesmo sem
     nenhuma reacao escolhida — currentReactionKey ainda aponta p/ ela */
  if (!reacaoEscolhida) {
    setStatus('Escolha uma reação em "Reações Prontas" primeiro.', "error");
    return;
  }
  montarReagentesAtual();
});

/* ---------------------------------------------------------------
   15a. COEFICIENTE + QUANTIDADE — mesma caixinha, papéis diferentes
   Antes existiam DOIS controles por substância em dois lugares: a
   bolinha do coeficiente numa "equação interativa" à parte, e a caixa
   de quantidade aqui embaixo. Isso duplicava a interação sem motivo —
   os dois são "entrada", só que uma é fixa (o coeficiente da equação
   balanceada) e a outra é livre (quanto você de fato tem). Agora as
   duas vivem na MESMA linha, com a MESMA linguagem visual retangular
   que o painel de Análise já usava — sem introduzir um segundo padrão
   de caixa (redonda) só para a equação.
   --------------------------------------------------------------- */

// Conta os átomos de cada elemento numa fórmula. Usa a MESMA varredura de
// massaMolarDaFormula, para não existirem no projeto duas leituras de
// fórmula que possam divergir entre si.
function contarAtomos(formula) {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const conta = {};
  let m;
  while ((m = regex.exec(formula)) !== null) {
    if (!m[1]) continue;
    conta[m[1]] = (conta[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
  }
  return conta;
}

// Lei de Lavoisier: cálculo estequiométrico só vale para equação
// balanceada. Como os coeficientes agora são editáveis nas próprias
// caixinhas de quantidade, a conferência fica logo abaixo da lista —
// antes era possível ajustar "2 H₂ + 5 O₂ → 2 H₂O" e a calculadora
// obedecia sem avisar nada.
// WCAG 3.3.3: a mensagem diz QUAL elemento está errado e QUANTO falta.
// WCAG 3.3.3 pede indicação de erro — mas aqui é intencional NÃO dizer
// qual elemento está errado nem por quanto: é o próprio aluno quem
// precisa avaliar a equação e decidir o que ajustar, não uma dica
// pronta apontando a resposta. A mensagem fica só o veredito.
function verificarBalanceamentoUI() {
  const el = document.getElementById("eqBalance");
  const r = reacaoEscolhida ? REACTIONS[currentReactionKey] : null;

  if (!r || r.modo === "metalico") {
    el.textContent = "";
    el.removeAttribute("data-ok");
    return;
  }

  const ok = equacaoEstaBalanceada(r, r.coeffs);
  el.dataset.ok = String(ok);
  el.textContent = ok ? "✓ Equação Balanceada" : "✗ Equação Não Balanceada";

  document.querySelectorAll(".qty-coef-input").forEach((i) => {
    if (ok) i.removeAttribute("data-desbalanceado");
    else i.setAttribute("data-desbalanceado", "true");
  });
}

// Devolve os coeficientes originais do catálogo. Sem isto, depois de
// desbalancear a equação o aluno só voltaria recarregando a página.
function restaurarCoeficientes() {
  if (!reacaoEscolhida) return;
  const r = REACTIONS[currentReactionKey];
  if (!r.coeffsOriginais) return;
  Object.keys(r.coeffsOriginais).forEach((f) => { r.coeffs[f] = r.coeffsOriginais[f]; });
  // Mesma sincronização que editar uma caixinha já faz — sem isso o
  // canvas ficava com as quantidades sorteadas antigas mesmo depois da
  // equação voltar pra proporção certa.
  r.reagents.forEach((rg) => { currentQuantities[rg.formula] = r.coeffs[rg.formula]; });
  montarReagentesAtual();
  renderizarQuantidades();
  atualizarCalculadora();
  setStatus("Coeficientes restaurados para a equação balanceada do catálogo — canvas remontado.", "info");
}

document.getElementById("restoreCoeffBtn").addEventListener("click", restaurarCoeficientes);

/* ---------------------------------------------------------------
   15b. EQUAÇÃO EM LINHA — coeficiente por termo, sempre editável
   Formatada como na literatura química: reagentes + operadores + seta
   + produtos, tudo em UMA linha reta quando cabe. Cada grupo
   (reagentes / produtos) é seu próprio flex-wrap — se a reação for
   grande demais pra uma linha só, a quebra cai exatamente entre os
   dois grupos, nunca no meio de um deles. Sem toggle "ativar edição":
   os coeficientes já nascem editáveis, mudar qualquer um já reformula
   a equação e refaz a conferência de balanceamento na hora.
   --------------------------------------------------------------- */

function renderizarQuantidades() {
  const linha = document.getElementById("eqLine");
  const balanceEl = document.getElementById("eqBalance");
  linha.innerHTML = "";

  if (!reacaoEscolhida) {
    linha.innerHTML = '<p class="qty-empty">Escolha uma reação em "Reações Prontas", aqui do lado.</p>';
    balanceEl.textContent = "";
    balanceEl.removeAttribute("data-ok");
    return;
  }

  const r = REACTIONS[currentReactionKey];

  if (r.modo === "metalico") {
    linha.innerHTML = '<p class="qty-empty">Ligação metálica não tem coeficientes: a proporção entre os átomos não é fixa.</p>';
    balanceEl.textContent = "";
    balanceEl.removeAttribute("data-ok");
    return;
  }

  const reagentesFormulas = r.reagents.map((rg) => rg.formula);
  const produtosFormulas = Object.keys(r.coeffs).filter((f) => !reagentesFormulas.includes(f));

  // Um termo = caixinha de coeficiente + fórmula, exatamente como
  // aparece impresso numa equação de verdade ("2 H₂"). "+" entre
  // termos do mesmo grupo; a seta "→" fica sozinha, entre os dois
  // grupos — nunca dentro de um deles.
  //
  // A caixinha edita r.coeffs diretamente — não existe mais um
  // "coeficiente da equação balanceada" fixo separado de uma
  // "quantidade real" escondida atrás de um badge. É a mesma caixa, o
  // mesmo número: nasce sorteado (ver gerarCoeficientesIniciais, quase
  // sempre errado de propósito) e o aluno ajusta até "Reação
  // balanceada" aparecer. A proporção certa continua guardada em
  // r.coeffsOriginais — usada por baixo dos panos pelos cálculos de
  // verdade (razão, limitante, rendimento), não pela caixinha.
  const criarTermo = (formula, rotulo) => {
    const termo = document.createElement("span");
    termo.className = "eq-term";
    termo.innerHTML = `
      <label class="eq-coef">
        <span class="sr-only">Quantidade de ${rotulo} nesta reação</span>
        <input type="number" class="qty-coef-input" min="1" max="20"
               value="${r.coeffs[formula]}" data-formula="${formula}" />
      </label>
      <span class="eq-formula">${rotulo}</span>`;
    return termo;
  };
  const criarMais = () => {
    const s = document.createElement("span");
    s.className = "eq-plus";
    s.setAttribute("aria-hidden", "true");
    s.textContent = "+";
    return s;
  };

  const grupoReagentes = document.createElement("span");
  grupoReagentes.className = "eq-group eq-group--reagentes";
  r.reagents.forEach((rg, i) => {
    if (i > 0) grupoReagentes.appendChild(criarMais());
    grupoReagentes.appendChild(criarTermo(rg.formula, rg.label));
  });

  const seta = document.createElement("span");
  seta.className = "eq-arrow";
  seta.setAttribute("aria-hidden", "true");
  seta.textContent = "→";
  const setaLeitura = document.createElement("span");
  setaLeitura.className = "sr-only";
  setaLeitura.textContent = " produz ";

  const grupoProdutos = document.createElement("span");
  grupoProdutos.className = "eq-group eq-group--produtos";
  produtosFormulas.forEach((f, i) => {
    if (i > 0) grupoProdutos.appendChild(criarMais());
    grupoProdutos.appendChild(criarTermo(f, rotuloFormula(f)));
  });

  linha.appendChild(grupoReagentes);
  linha.appendChild(seta);
  linha.appendChild(setaLeitura);
  linha.appendChild(grupoProdutos);

  // Coeficiente: muda a estrutura da equação, então remonta a linha
  // inteira e refaz a conferência de balanceamento.
  linha.querySelectorAll(".qty-coef-input").forEach((input) => {
    input.addEventListener("change", () => {
      const formula = input.dataset.formula;
      r.coeffs[formula] = Math.max(1, Math.min(20, parseInt(input.value, 10) || 1));

      // O canvas ficava preso na primeira montagem (currentQuantities só
      // era definida uma vez, a partir de defaultQty, na hora de
      // escolher a reação) — editar um coeficiente nunca remontava nada,
      // então a equação dizia uma coisa e os círculos no canvas
      // continuavam mostrando outra. Agora, ao editar QUALQUER
      // coeficiente, o canvas remonta com a quantidade de cada reagente
      // igual ao coeficiente atual da equação — o desenho volta a bater
      // exatamente com o que está escrito, como um diagrama de
      // partículas de livro didático.
      r.reagents.forEach((rg) => { currentQuantities[rg.formula] = r.coeffs[rg.formula]; });
      montarReagentesAtual();

      atualizarCalculadora();
      renderizarQuantidades();
      setStatus(`Coeficiente de ${rotuloFormula(formula)} ajustado para ${r.coeffs[formula]} — canvas remontado com as novas quantidades.`);
    });
  });

  verificarBalanceamentoUI();
}

/* ---------------------------------------------------------------
   15b-ter. MÓDULOS DA SIDEBAR ESQUERDA — mesmo mecanismo do SIMA
   (models Dalton/Thomson/Rutherford/Bohr/Quântico): cada botão com
   data-modulo ativa um módulo e desativa os demais (mutuamente
   exclusivo); clicar no módulo JÁ ativo desativa e devolve tudo ao
   estado em branco (toggle — mesmo contrato do clearModel() do SIMA).
   Abrir/fechar o painel (o cabeçalho .panel-header) é uma ação
   independente — não mexe em qual módulo está ativo, só na
   visibilidade do conteúdo. O selo "Ativo" no cabeçalho é só CSS
   (:has()), não precisa de nada aqui.

   Como no SIMA, NENHUM módulo começa ativo (moduloAtivo = null) — o
   canvas nasce em branco, coberto pelo #canvas-hint, até o aluno
   clicar em "Ativar módulo". selecionarReacao() (mais acima no
   arquivo) recusa a escolha de reação enquanto o módulo Estequiometria
   não estiver ativo — é o mesmo contrato do SIMA, em que nada reage no
   canvas antes de um modelo ser ativado.

   Por enquanto só o módulo "Estequiometria" tem conteúdo funcional;
   "Mols" é um placeholder — ativá-lo anuncia o estado por voz e marca
   o botão como pressed, mas ainda não muda nada no canvas. Quando o
   módulo Mols ganhar comportamento de verdade, o ponto de entrada é
   este mesmo listener. --------------------------------------------- */
let moduloAtivo = null;

const NOMES_MODULO = { estequiometria: "Estequiometria", mols: "Mols" };

// Mostra o aviso sobre o canvas sempre que NENHUM módulo está ativo —
// inclusive no carregamento inicial, antes de qualquer clique. Mesmo
// papel do #canvas-hint do SIMA/SISOL. Bug corrigido: antes só reconhecia
// "estequiometria"; com o módulo Mols ativo o hint nunca escondia,
// mesmo com uma substância já desenhada no canvas por trás dele.
function atualizarCanvasHint() {
  const hint = document.getElementById("canvas-hint");
  if (hint) hint.hidden = moduloAtivo !== null;
}

// Pílula flutuante sobre o canvas — mesma peça #mode-indicator do
// SIMA/SISOL, compartilhada pelos DOIS módulos (não é mais exclusiva do
// Mols). Cor e ícone mudam por [data-mode], igual ao
// #mode-indicator[data-mode="dalton"] do SIMA. Precisa vir depois de
// TODAS as variáveis de Estequiometria e Mols já declaradas no arquivo
// (reacaoEscolhida, molsReacaoAtual etc.) — por isso só é chamada de
// dentro de handlers de clique, nunca no topo do script antes delas
// existirem.
function atualizarModeIndicator() {
  const canvasArea = document.getElementById("canvas-area");
  const overlay = document.getElementById("mode-indicator");
  const overlayIcon = document.getElementById("overlay-icon");
  const overlayText = document.getElementById("overlay-text");

  // Mesmo padrão do SIMA: um texto PRINCIPAL curto ("X ativo") e um
  // .overlay-detail secundário (opacidade menor) com o que está
  // acontecendo agora — nome da reação, progresso etc. Evita que a
  // pílula vire uma frase só do mesmo peso visual do início ao fim.
  const montarTexto = (principal, detalhe) => {
    overlayText.textContent = principal;
    if (detalhe) {
      const sp = document.createElement("span");
      sp.className = "overlay-detail";
      sp.textContent = ` · ${detalhe}`;
      overlayText.appendChild(sp);
    }
  };

  if (moduloAtivo === "estequiometria") {
    canvasArea.dataset.mode = "estequiometria"; // dono de --mod/--mod-rgb agora — ver stylesie.css
    overlayIcon.textContent = "⚗️";
    if (reacaoEscolhida) {
      montarTexto("Investigando", REACTIONS[currentReactionKey].label);
    } else {
      montarTexto("Estequiometria ativa", "escolha uma reação em Reações Prontas");
    }
    overlay.classList.add("mode-on");
  } else if (moduloAtivo === "mols") {
    canvasArea.dataset.mode = "mols";
    overlayIcon.textContent = "🔎";
    if (typeof molsReacaoAtual !== "undefined" && molsReacaoAtual) {
      const formulas = Object.keys(molsSubstancias);
      const completos = formulas.filter((f) => substanciaCompletaMols(f)).length;
      montarTexto("Investigando", `${REACTIONS[molsReacaoAtual].label} · ${completos}/${formulas.length} substâncias`);
    } else {
      montarTexto("Mols ativo", "escolha uma reação em Investigar Reação");
    }
    overlay.classList.add("mode-on");
  } else {
    delete canvasArea.dataset.mode;
    overlay.classList.remove("mode-on");
  }
}

// Mesmo gesto do ✕ do #mode-indicator no SIMA: desativa QUALQUER módulo
// que esteja ativo no momento (não é mais fixo no Mols) e devolve o
// canvas ao estado em branco.
document.getElementById("overlay-clear").addEventListener("click", () => {
  if (moduloAtivo) {
    const btn = document.querySelector(`.mode-activate-btn[data-modulo="${moduloAtivo}"]`);
    if (btn) btn.click();
  }
});

// Sair do módulo Estequiometria devolve o canvas ao estado em branco —
// mesmo contrato do clearModel() do SIMA. Sem isso, trocar para "Mols"
// deixaria reagentes/produtos da reação anterior soltos no canvas
// mesmo com o módulo desativado.
function desativarModuloEstequiometria() {
  limparCena();
  reacaoEscolhida = false;
  state = "IDLE";
  energyBtn.disabled = true;
  document.getElementById("validateBtn").disabled = true;
  renderizarMenuReacoes();
  renderizarQuantidades();
  atualizarCalculadora();
}

// Mesmo princípio: sair do módulo Mols reseta a investigação em
// andamento e trava o seletor de reação de novo — "nada aparece até o
// módulo ativar" vale nos dois sentidos, ativar E desativar.
function desativarModuloMols() {
  const search = document.getElementById("molsReactionSearch");
  search.disabled = true;
  search.value = "";
  molsReacaoSelecionadaKey = null;
  document.querySelectorAll("#molsReactionMenu .reaction-card").forEach((c) => {
    c.classList.remove("is-active");
    c.setAttribute("aria-selected", "false");
    c.style.display = "";
  });
  document.getElementById("molsSubstanceRow").hidden = true;
  if (typeof resetInvestigacaoMols === "function") resetInvestigacaoMols();
}

document.querySelectorAll(".mode-activate-btn[data-modulo]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modulo = btn.dataset.modulo;

    // TOGGLE — clicar no módulo JÁ ativo desativa e devolve o canvas
    // ao estado em branco. Mesmo contrato do SIMA (setMode/clearModel):
    // o clique sempre foi pensado como toggle, mas antes o "if (modulo
    // === moduloAtivo) return;" fazia o segundo clique não fazer nada —
    // dava para ATIVAR um módulo, mas não tinha como DESATIVAR de volta.
    if (modulo === moduloAtivo) {
      playTone(500, .08, .05); // grave — mesmo par de tons do abrir/fechar painel
      if (modulo === "estequiometria") desativarModuloEstequiometria();
      if (modulo === "mols") desativarModuloMols();
      moduloAtivo = null;
      btn.setAttribute("aria-pressed", "false");
      btn.title = `Ativar o módulo ${NOMES_MODULO[modulo]}`;
      atualizarCanvasHint();
      atualizarModeIndicator();
      sincronizarPaineisDireitaPorModulo();
      anunciar(`Módulo ${NOMES_MODULO[modulo]} desativado.`);
      return;
    }

    playTone(modulo === "mols" ? 1100 : 880, .08, .07); // agudo — mesmo padrão do SIMA (tom mais alto = modelo "mais avançado")
    const moduloAnterior = moduloAtivo;
    moduloAtivo = modulo;
    document.querySelectorAll(".mode-activate-btn[data-modulo]").forEach((b) => {
      const ativo = b.dataset.modulo === modulo;
      b.setAttribute("aria-pressed", String(ativo));
      b.title = ativo ? `Desativar o módulo ${NOMES_MODULO[b.dataset.modulo]}` : `Ativar o módulo ${NOMES_MODULO[b.dataset.modulo]}`;
    });

    if (moduloAnterior === "estequiometria" && modulo !== "estequiometria") {
      desativarModuloEstequiometria();
    }
    if (moduloAnterior === "mols" && modulo !== "mols") {
      desativarModuloMols();
    }
    if (modulo === "mols") {
      document.getElementById("molsReactionSearch").disabled = false;
    }
    atualizarCanvasHint();
    atualizarModeIndicator();
    sincronizarPaineisDireitaPorModulo();

    // Mesmo padrão do SIMA: "Modelo X selecionado. [1ª frase da
    // descrição]." — não só o nome, também o que o módulo faz, pra
    // quem usa leitor de tela não precisar navegar até o card pra
    // saber o que acabou de ativar.
    const def = document.getElementById(`def-mod-${modulo}`);
    const primeiraFrase = def ? def.textContent.trim().split(/(?<=[.!?])\s/)[0] : "";
    anunciar(`Módulo ${NOMES_MODULO[modulo]} ativado. ${primeiraFrase}`);

    // Mesmo comportamento do SIMA (.mode-activate-btn, .model-btn em
    // telas ≤1100px): ativar um módulo fecha a gaveta mobile sozinho —
    // o aluno já fez a escolha, a tela deve voltar pro canvas.
    if (innerWidth <= BREAKPOINT_MOBILE) fecharSidebarsMobile();
  });
});

// Mesmo papel que a Tabela Periódica tem, sozinha, na sidebar direita do
// SIMA: cada módulo tem seu próprio conjunto de painéis de ESCOLHA na
// direita, e só o do módulo ativo aparece. Reações Prontas + Análise
// pertencem à Estequiometria; Investigar Substância pertence ao Mols.
// Sem módulo nenhum ativo, nenhum dos três aparece — a coluna direita
// fica tão vazia quanto o canvas (mesmo #canvas-hint cobrindo os dois).
function sincronizarPaineisDireitaPorModulo() {
  const painelReacoes = document.getElementById("panel-reactions");
  const painelAnalise = document.getElementById("panel-analysis");
  const painelDados = document.getElementById("panel-reaction-data");
  const painelMols = document.getElementById("panel-mols-investigar");
  painelReacoes.hidden = moduloAtivo !== "estequiometria";
  painelAnalise.hidden = moduloAtivo !== "estequiometria";
  painelDados.hidden = moduloAtivo !== "estequiometria";
  painelMols.hidden = moduloAtivo !== "mols";
}

atualizarCanvasHint(); // estado inicial: nenhum módulo ativo, hint visível
sincronizarPaineisDireitaPorModulo(); // estado inicial: nenhum painel de escolha visível

/* ---------------------------------------------------------------
   15c. PAINÉIS COLAPSÁVEIS
   O estado vive no .panel (data-open), não no <button>: CSS não sobe
   na árvore, então com a classe no botão era impossível estilizar a
   borda do painel, o badge e o chevron a partir do estado — por isso
   antes "só o chevron mudava" quando um painel abria.
   Em .accordion--exclusive, abrir um painel fecha os outros. É esse
   mecanismo, somado ao painel aberto crescer via flex, que faz a coluna
   direita caber sem barra de rolagem.
   --------------------------------------------------------------- */
document.querySelectorAll(".panel-header").forEach((header) => {
  const panel = header.closest(".panel");
  const body = document.getElementById(header.getAttribute("aria-controls"));
  const grupo = panel.closest(".accordion--exclusive");

  panel.dataset.open = header.getAttribute("aria-expanded") === "true" ? "true" : "false";
  if (panel.dataset.open === "true" && body) body.classList.add("scroll-ready");

  header.addEventListener("click", () => {
    const estavaAberto = panel.dataset.open === "true";
    playTone(estavaAberto ? 500 : 750, .06, .04); // mesmo padrão do SIMA: grave ao fechar, agudo ao abrir

    if (!estavaAberto && grupo) {
      grupo.querySelectorAll('.panel[data-open="true"]').forEach((outro) => {
        outro.dataset.open = "false";
        const btn = outro.querySelector(".panel-header");
        if (btn) btn.setAttribute("aria-expanded", "false");
        const bd = outro.querySelector(".panel-body");
        if (bd) bd.classList.remove("scroll-ready");
      });
    }

    panel.dataset.open = estavaAberto ? "false" : "true";
    header.setAttribute("aria-expanded", String(!estavaAberto));
    if (!body) return;

    if (estavaAberto) {
      body.classList.remove("scroll-ready");
      return;
    }

    // O scroll interno só passa a existir DEPOIS da animação: assim a
    // barra não aparece e desaparece durante o abre-e-fecha.
    const aoTerminar = (e) => {
      if (e.target !== body || e.propertyName !== "max-height") return;
      body.classList.add("scroll-ready");
      body.removeEventListener("transitionend", aoTerminar);
    };
    body.addEventListener("transitionend", aoTerminar);
  });
});
/* ---------------------------------------------------------------
   15d. UTILITÁRIOS COMPARTILHADOS DE FÓRMULA
   mdc/rotuloFormula/anunciar continuam usados pelo resto do simulador
   (analisarGrupo, atualizarCalculadora, mensagens de status etc.) — a
   tabela periódica e o gerador de reações por valência cruzada que
   viviam aqui foram removidos: a mecânica de criar reações por conta
   própria deixava a coluna poluída, então o SIE volta a trabalhar só
   com o catálogo de reações reais.
   --------------------------------------------------------------- */
function mdc(a, b) { return b === 0 ? a : mdc(b, a % b); }

const SUBSCRITOS = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
function rotuloFormula(formula) {
  return formula.replace(/\d+/g, (m) => m.split("").map((d) => SUBSCRITOS[d]).join(""));
}

const a11yAnnouncer = document.getElementById("a11yAnnouncer");
function anunciar(texto) { if (a11yAnnouncer) a11yAnnouncer.textContent = texto; }


// Extrai a massa molar de uma fórmula (ex.: "CO2", "H2O", "CCl4") somando
// a massa de cada elemento presente — mesma fonte de dados (ELEMENTS)
// usada em todo o resto do simulador, então calculadora, HUD e validação
// nunca podem divergir entre si.
function massaMolarDaFormula(formula) {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let total = 0, m;
  while ((m = regex.exec(formula)) !== null) {
    if (!m[1]) continue;
    const contagem = m[2] ? parseInt(m[2], 10) : 1;
    if (ELEMENTS[m[1]]) total += ELEMENTS[m[1]].molar * contagem;
  }
  return total;
}

// Painel "Calculadora Estequiométrica": deixa o usuário testar livremente
// as quantidades de reagentes (via os steppers) e ver, ANTES de montar
// qualquer átomo, qual é o reagente limitante e o rendimento teórico
// exato — reaproveita calcularRendimentoTeorico(), a mesma função usada
// pela validação, então o que a calculadora mostra é garantidamente o
// que será exigido para validar a montagem.
// Leitura da analise estequiometrica. Agora em <dl>: pares termo->valor
// tem semantica propria, que o leitor de tela navega (WCAG 1.3.1). E sem
// text-overflow:ellipsis — antes o dado central do simulador virava
// "3 ÷ 1 = 3.0…" quando a coluna estreitava.
// O reagente limitante vem PRIMEIRO, porque e a leitura que importa; e e
// identificado pela MENOR RAZAO, nao por "quem nao sobrou".
function atualizarCalculadora() {
  const container = document.getElementById("calcPanel");
  container.innerHTML = "";
  const badges = [document.getElementById("analysisBadge"), document.getElementById("reactionDataBadge")].filter(Boolean);
  if (!reacaoEscolhida) { badges.forEach((b) => { b.textContent = "—"; b.removeAttribute("title"); }); return; }

  const r = REACTIONS[currentReactionKey];

  // Badge do cabeçalho mostra QUAL reação está selecionada — antes
  // mostrava o reagente limitante (só calculado lá embaixo, e some de
  // novo ao trocar de reação); agora fica fixo assim que a reação é
  // escolhida, com o texto completo em title pra quando o nome for
  // maior que o espaço da pílula. Os dois painéis (Análise e Dados da
  // Reação) mostram o mesmo nome — é a mesma reação, só a INTERAÇÃO
  // que está separada em dois lugares agora.
  badges.forEach((b) => { b.textContent = r.label; b.title = r.label; });

  const par = (rotulo, valor, className) => {
    const dr = document.createElement("div");
    dr.className = "dr" + (className ? ` ${className}` : "");
    dr.innerHTML = `<dt>${rotulo}</dt><dd>${valor}</dd>`;
    container.appendChild(dr);
  };

  if (r.modo === "metalico") {
    par("Modelo", "Mar de elétrons deslocalizados");
    par("Energia de ligação", "70–850 kJ/mol");
    par("Conduz calor e eletricidade", "Sempre");
    par("Maleável e dúctil", "Sim");
    return;
  }

  // Caráter da ligação — calculado a partir da eletronegatividade real
  // (mesma tabela e mesma regra de Pauling que o SILQ usa), não um
  // rótulo estático. Mostra o ΔEN de verdade mesmo quando o veredito
  // (iônica/covalente) já está fixo no catálogo — é isso que torna a
  // classificação uma CONTA que o aluno pode conferir, não uma
  // afirmação pra decorar.
  if (r.caraterLigacao) {
    const valorEN = r.deltaEN !== undefined ? `ΔEN = ${r.deltaEN.toFixed(2).replace(".", ",")} · ${r.caraterLigacao}` : r.caraterLigacao;
    par("Caráter da ligação", valorEN, "is-bond-character");
  }

  const { esperado, reagentesFormulas } = calcularRendimentoTeorico(r);

  // coeffsOriginais aqui, não r.coeffs — "Dados da Reação" mostra a
  // química de verdade (o que aconteceria com o que está no canvas
  // agora), independente de a equação em "Ajustar e Reagir" já estar
  // balanceada ou não.
  const razoes = r.reagents.map((rg) => ({
    label: rg.label,
    qtd: currentQuantities[rg.formula],
    coef: r.coeffsOriginais[rg.formula],
    razao: currentQuantities[rg.formula] / r.coeffsOriginais[rg.formula],
  }));
  const menorRazao = Math.min(...razoes.map((x) => x.razao));
  const limitantes = razoes
    .filter((x) => Math.abs(x.razao - menorRazao) < 1e-9)
    .map((x) => x.label);

  par("Reagente limitante", limitantes.join(" e "), "is-limiting");
  par("Grau de avanço (ξ)", `${menorRazao.toFixed(2)} mol`);

  razoes.forEach((x) => {
    par(`Razão ${x.label}`, `${x.qtd} ÷ ${x.coef} = ${x.razao.toFixed(2)}`);
  });

  // Só mol aqui — massa em gramas saiu de propósito: é o módulo Mols
  // (Investigar Reação) que já faz essa conta, elemento por elemento,
  // como investigação em si. Duplicar o número pronto aqui roubaria o
  // motivo de existir daquele módulo.
  Object.entries(esperado).forEach(([formula, qtd]) => {
    const ehProduto = !reagentesFormulas.includes(formula);
    par(
      `${ehProduto ? "Produto" : "Sobra"} ${rotuloFormula(formula)}`,
      `${qtd} mol`,
      ehProduto ? "is-product" : "is-leftover"
    );
  });
}
/* ---------------------------------------------------------------
   16. RENDERIZAÇÃO 2D — átomos, ligações e elétrons
   --------------------------------------------------------------- */
function corLigacaoAtual(l) {
  if (l.ionica) return "rgba(255, 107, 203, 0.8)"; // eletrostática — cor própria, distinta do par compartilhado
  const integ = l.integrity ?? 1;
  const t = Math.max(0, Math.min(1, 1 - integ));
  const [r, g, b] = lerpColorRgb([240, 207, 76], [255, 71, 87], t);
  return `rgb(${r},${g},${b})`;
}

function desenharPontoEletron(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 2.1, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe066";
  ctx.fill();
}

// posições (ângulos) dos pares isolados + elétrons livres em volta do átomo
function calcularPontosOrbita(atomo, agora) {
  const livres = slotsLivres(atomo);
  const totalGrupos = atomo.lonePairs + Math.max(0, livres);
  if (totalGrupos <= 0) return [];
  const baseAngle = atomo.phase + agora * 0.0003;
  const passo = (Math.PI * 2) / totalGrupos;
  const pontos = [];
  let idx = 0;
  for (let i = 0; i < atomo.lonePairs; i++) { pontos.push({ ang: baseAngle + passo * idx, tipo: "par" }); idx++; }
  for (let i = 0; i < Math.max(0, livres); i++) { pontos.push({ ang: baseAngle + passo * idx, tipo: "livre" }); idx++; }
  return pontos;
}

function dibujarLigacao(l) {
  const a = atoms.get(l.atomA), b = atoms.get(l.atomB);
  if (!a || !b) return;
  ctx.beginPath();
  if (l.ionica) ctx.setLineDash([5, 4]);
  ctx.moveTo(a.body.position.x, a.body.position.y);
  ctx.lineTo(b.body.position.x, b.body.position.y);
  ctx.strokeStyle = corLigacaoAtual(l);
  ctx.lineWidth = l.ionica ? 1.6 : 3 + l.order * 1.4;
  ctx.lineCap = "round";
  ctx.stroke();
  if (l.ionica) ctx.setLineDash([]);
}

function dibujarAtomo(a) {
  const def = ELEMENTS[a.elemento];
  const p = a.body.position;

  ctx.beginPath();
  ctx.arc(p.x, p.y, a.radiusPx, 0, Math.PI * 2);
  ctx.fillStyle = def.colorCss;
  ctx.fill();

  if (a === candidatoAtual) {
    ctx.beginPath(); ctx.arc(p.x, p.y, a.radiusPx + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#2ecc9a"; ctx.lineWidth = 2.5; ctx.stroke();
  } else if (state === "ACTIVATED" && slotsLivres(a) > 0 && !atomoEhExcessoElementarValido(a)) {
    ctx.beginPath(); ctx.arc(p.x, p.y, a.radiusPx + 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,140,66,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (moduloAtivo === "mols" && a.molsFormula !== undefined && molsSubstancias[a.molsFormula]) {
    // Anel de status da investigação: tracejado âmbar = ainda não
    // descoberto/contado; verde sólido = contado, com o número da
    // ocorrência ao lado (mesma cor --accent-green usada no anel de
    // "candidato a ligação" acima, para não introduzir uma terceira cor
    // de destaque no canvas). O registro é por SUBSTÂNCIA — o mesmo
    // símbolo em duas substâncias diferentes (ex.: H em H₂ e H em HCl)
    // tem contagens independentes.
    const registro = molsSubstancias[a.molsFormula].contagem[a.elemento];
    const contada = registro.contadosIdx.has(a.molsIndice);
    ctx.beginPath();
    ctx.arc(p.x, p.y, a.radiusPx + 4, 0, Math.PI * 2);
    ctx.strokeStyle = contada ? "#2ecc9a" : "#ff8c42";
    ctx.lineWidth = contada ? 2.5 : 2;
    if (!contada) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (contada) {
      const numero = [...registro.contadosIdx].indexOf(a.molsIndice) + 1;
      // Escala com o átomo (átomos do Mols são menores — MOLS_ESCALA),
      // com piso mínimo pra continuar legível mesmo no H, o menor de todos.
      const raioBadge = Math.max(6, Math.min(8, a.radiusPx * 0.55));
      const fonteBadge = Math.max(8, Math.min(10, a.radiusPx * 0.62));
      const bx = p.x + a.radiusPx * 0.72, by = p.y - a.radiusPx * 0.72;
      ctx.beginPath(); ctx.arc(bx, by, raioBadge, 0, Math.PI * 2);
      ctx.fillStyle = "#2ecc9a"; ctx.fill();
      ctx.fillStyle = "#06170b";
      ctx.font = `700 ${fonteBadge}px 'Consolas', 'Monaco', monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(numero), bx, by + 0.5);
    }
  }

  ctx.fillStyle = def.textColor;
  ctx.font = `700 ${Math.max(10, a.radiusPx * 0.85)}px 'Consolas', 'Monaco', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(a.elemento, p.x, p.y + 1);

  if (a.tipo === "ionico" || (a.tipo === "covalente" && cargaAtual(a) !== 0)) {
    const carga = cargaAtual(a);
    if (carga !== 0) {
      const rotulo = formatarCarga(carga);
      ctx.font = `700 ${Math.max(9, a.radiusPx * 0.5)}px 'Consolas', 'Monaco', monospace`;
      ctx.fillStyle = carga > 0 ? "#ff8c42" : "#ff6bcb";
      ctx.textAlign = "left";
      ctx.fillText(rotulo, p.x + a.radiusPx * 0.55, p.y - a.radiusPx * 0.55);
    }
  }
}

function dibujarElectronesLivres(a, agora) {
  const raioOrbita = a.radiusPx + 9;
  calcularPontosOrbita(a, agora).forEach((pt) => {
    const cx = a.body.position.x + Math.cos(pt.ang) * raioOrbita;
    const cy = a.body.position.y + Math.sin(pt.ang) * raioOrbita;
    if (pt.tipo === "par") {
      const perpX = -Math.sin(pt.ang), perpY = Math.cos(pt.ang);
      desenharPontoEletron(cx + perpX * 2.6, cy + perpY * 2.6);
      desenharPontoEletron(cx - perpX * 2.6, cy - perpY * 2.6);
    } else {
      desenharPontoEletron(cx, cy);
    }
  });
}

function dibujarElectronesLigacao(l) {
  for (let p = 0; p < l.order; p++) {
    const pos = calcularPosicaoParLigacao(l, p);
    desenharPontoEletron(pos.cx + pos.px * 3, pos.cy + pos.py * 3);
    desenharPontoEletron(pos.cx - pos.px * 3, pos.cy - pos.py * 3);
  }
}

function dibujarFlights(agora) {
  flyingElectrons = flyingElectrons.filter((f) => agora - f.start < f.duration);
  flyingElectrons.forEach((f) => {
    const t = Math.min(1, (agora - f.start) / f.duration);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    desenharPontoEletron(f.x0 + (f.x1 - f.x0) * ease, f.y0 + (f.y1 - f.y0) * ease);
  });
}

function draw() {
  // Os elétrons (desenho puramente decorativo, baseado em performance.now())
  // continuam girando mesmo após a validação — quem fica fisicamente
  // imóvel são os átomos (corpos estáticos via congelarCena()), não o
  // desenho dos elétrons.
  const agora = performance.now();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  bonds.forEach((l) => dibujarLigacao(l));
  atoms.forEach((a) => dibujarAtomo(a));
  atoms.forEach((a) => dibujarElectronesLivres(a, agora));
  bonds.forEach((l) => dibujarElectronesLigacao(l));
  dibujarFlights(agora);
  dibujarEletronsMetalicos();
  desenharOsciloscopio();
}

/* ---------------------------------------------------------------
   17. LOOP PRINCIPAL (física + render)
   --------------------------------------------------------------- */
let last = performance.now();
function animate(now) {
  const dt = Math.min(now - last, 50); // ms
  last = now;

  if (state === "CHARGING") {
    if (chargingHeld) {
      charge = Math.min(EA_NECESSARIA, charge + CARGA_POR_SEGUNDO * (dt / 1000));
      aplicarVibracao(charge / EA_NECESSARIA);
      if (charge >= EA_NECESSARIA) romperLigacoes();
    } else {
      charge = Math.max(0, charge - DECAIMENTO_POR_SEGUNDO * (dt / 1000));
      aplicarVibracao(charge / EA_NECESSARIA);
      if (charge === 0) {
        state = "IDLE";
        bonds.forEach((l) => { l.integrity = 1; });
        setStatus('Energia de ativação dissipada — os reagentes voltaram ao estado de repouso. Segure "Fornecer Energia de Ativação" novamente para retomar.', "info");
      }
    }
  }

  if (state === "ACTIVATED") {
    aplicarMagnetismoAmbiente();
    aplicarMagnetismoMetalico();
    atualizarEletronsMetalicos();
  }
  if (state !== "VALIDATED") manterDentroDosLimites();

  Matter.Engine.update(engine, dt);
  draw();
  requestAnimationFrame(animate);
}

/* ---------------------------------------------------------------
   18. RESPONSIVIDADE — sidebars como gavetas em telas pequenas
   Em telas largas as sidebars ficam sempre visíveis (como já eram). Em
   telas estreitas (mobile/tablet retrato) elas viram gavetas escondidas
   por padrão, abertas pelos botões do cabeçalho ou fechadas tocando no
   overlay/Esc — sem isso, não haveria espaço de tela para o canvas.
   --------------------------------------------------------------- */
/* Mesmo contrato dos outros 19 simuladores: os pares botao+painel vem de
   ids padronizados, o estado aberto e a classe .mobile-open no PROPRIO
   painel (nao mais uma classe no <body>), e o backdrop usa o atributo
   [hidden]. O .filter() no fim deixa a funcao tolerante: se algum id nao
   existir, aquele par simplesmente nao entra, sem quebrar a pagina. */
const mobileBackdrop = document.getElementById("mobile-backdrop");
const gavetasMobile = [
  { btn: document.getElementById("mobile-info-btn"), el: document.getElementById("sidebar-left") },
  { btn: document.getElementById("mobile-menu-btn"), el: document.getElementById("sidebar-right") },
].filter((g) => g.btn && g.el);

function fecharSidebarsMobile() {
  gavetasMobile.forEach((g) => {
    g.el.classList.remove("mobile-open");
    g.btn.setAttribute("aria-expanded", "false");
  });
  if (mobileBackdrop) mobileBackdrop.hidden = true;
}

function abrirSidebarMobile(g) {
  fecharSidebarsMobile();
  g.el.classList.add("mobile-open");
  g.btn.setAttribute("aria-expanded", "true");
  if (mobileBackdrop) mobileBackdrop.hidden = false;
}

gavetasMobile.forEach((g) => {
  g.btn.addEventListener("click", () => {
    g.el.classList.contains("mobile-open") ? fecharSidebarsMobile() : abrirSidebarMobile(g);
  });
});
if (mobileBackdrop) mobileBackdrop.addEventListener("click", fecharSidebarsMobile);
addEventListener("keydown", (e) => { if (e.key === "Escape") fecharSidebarsMobile(); });

// Atalhos de teclado — mesmo padrão do SIMA (Alt+1 a Alt+5 pros
// modelos). O SIE só tem 2 módulos, então só Alt+1/Alt+2.
addEventListener("keydown", (e) => {
  if (!e.altKey) return;
  const modulos = ["estequiometria", "mols"];
  const indice = { "1": 0, "2": 1 }[e.key];
  if (indice === undefined) return;
  e.preventDefault();
  document.querySelector(`.mode-activate-btn[data-modulo="${modulos[indice]}"]`)?.click();
});

// Ao escolher uma reação ou tocar no canvas em mobile, fecha a gaveta
// automaticamente — o usuário já fez sua escolha, a tela deve voltar
// para a simulação em si.
document.getElementById("reactionMenu").addEventListener("click", () => {
  if (innerWidth <= BREAKPOINT_MOBILE) fecharSidebarsMobile();
});
canvas.addEventListener("pointerdown", () => {
  if (innerWidth <= BREAKPOINT_MOBILE) fecharSidebarsMobile();
}, { passive: true });


/* ---------------------------------------------------------------
   19. INICIALIZAÇÃO
   --------------------------------------------------------------- */
/* Antes: selecionarReacao("water") — montava a agua no canvas sem o
   aluno ter pedido. Agora so o menu e renderizado; o canvas espera. */
renderizarMenuReacoes();
renderizarQuantidades(); // mostra o placeholder "Escolha uma reação…" já na carga, em vez do <!-- comentário --> cru
setStatus('Escolha uma reação em "Reações Prontas" para montar os reagentes no canvas.');
atualizarModeIndicator(); // estado inicial: nenhum módulo ativo, pílula escondida
requestAnimationFrame(animate);


// ══════════════════════════════════════════════════════════════════
// SIDEBARS REDIMENSIONÁVEIS
// Cria uma alça (.sidebar-resizer) na borda interna de cada sidebar.
// Arrastar ajusta a variável CSS de largura em tempo real; a largura
// escolhida é salva no localStorage e restaurada na próxima visita.
// A alça é ignorada quando a sidebar está em modo gaveta mobile
// (position:fixed) — nesse modo a largura é fixa por CSS.
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  var targets = [{ id:'sidebar-left', side:'left', cssVar:'--sidebar-w', min:260, max:560 },{ id:'sidebar-right', side:'right', cssVar:'--sidebar-right-w', min:240, max:520 }];
  var root = document.documentElement;
  var rafPending = false;

  function fireResize() {
    // Notifica canvases/física que o espaço central mudou (mesmo evento
    // que os módulos já escutam para redimensionamento da janela).
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      window.dispatchEvent(new Event('resize'));
    });
  }

  targets.forEach(function (cfg) {
    var el = document.getElementById(cfg.id);
    if (!el) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

    var storeKey = 'sie-w-' + cfg.cssVar.replace(/^--/, '');
    try {
      var saved = parseInt(localStorage.getItem(storeKey), 10);
      if (saved && saved >= cfg.min && saved <= cfg.max) {
        root.style.setProperty(cfg.cssVar, saved + 'px');
      }
    } catch (e) { /* localStorage indisponível — segue sem persistência */ }

    var handle = document.createElement('div');
    handle.className = 'sidebar-resizer sidebar-resizer--' + cfg.side;
    handle.setAttribute('aria-hidden', 'true');
    el.appendChild(handle);

    var dragging = false, startX = 0, startW = 0;

    handle.addEventListener('pointerdown', function (e) {
      // Em modo gaveta (mobile) a sidebar é position:fixed — não redimensiona.
      if (getComputedStyle(el).position === 'fixed') return;
      dragging = true;
      startX = e.clientX;
      startW = el.getBoundingClientRect().width;
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var delta = e.clientX - startX;
      var w = cfg.side === 'left' ? startW + delta : startW - delta;
      w = Math.max(cfg.min, Math.min(cfg.max, Math.round(w)));
      root.style.setProperty(cfg.cssVar, w + 'px');
      fireResize();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem(storeKey, Math.round(el.getBoundingClientRect().width));
      } catch (e) { /* sem persistência */ }
      fireResize();
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  });
});

/* ===================================================================
   MÓDULO MOLS — funções extraídas do scriptsitp.js (SITP)
   ===================================================================
   Os DADOS (118 elementos, massas, config eletrônica, fusão/ebulição,
   curiosidades, propriedades) vêm de graça via <script src="dadossitp.js">
   no HTML — zero cópia, mesmo arquivo que o SITP usa.

   Só as FUNÇÕES PURAS abaixo foram extraídas (copiadas) do
   scriptsitp.js: são as que renderizam o conteúdo do modal a partir
   dos dados, sem tocar em nenhum elemento de DOM específico do SITP
   (grade de 118 células, slider de temperatura, filtros). O card de
   Raio Atômico (5 vistas: Dados/Grade/Bohr/Lewis/Nuvem, ~721 linhas)
   ficou de fora por decisão — não tem relação com massa molar.

   TEMP_REF (25 °C, de dadossitp.js) é usado como temperatura fixa em
   todo canto que o SITP original deixaria variável por um slider — o
   Mols não tem controle de temperatura.
   =================================================================== */

// Os 118 elementos, juntando as 3 listas do dadossitp.js — mesma
// combinação que o SITP usa internamente ([...elementosBase, ...lantanideos, ...actinideos]).
const TODOS_ELEMENTOS_MOLS = [...elementosBase, ...lantanideos, ...actinideos];
const ELEMENTO_POR_SIMBOLO_MOLS = {};
TODOS_ELEMENTOS_MOLS.forEach((el) => { ELEMENTO_POR_SIMBOLO_MOLS[el.simbolo] = el; });

// Só os dois ícones que os cards de propriedade usam (ionização e
// eletronegatividade) — o de raio ficou de fora junto com o card.
const ICO_MOLS = {
  ionizacao: '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9.6" cy="14.2" r="5.5"/><line x1="7.4" y1="14.2" x2="11.8" y2="14.2"/><line x1="9.6" y1="12" x2="9.6" y2="16.4"/><line x1="14.4" y1="9.4" x2="19.2" y2="4.6"/><polyline points="15.6,4.4 19.6,4.4 19.6,8.4"/></svg>',
  en: '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="7" cy="12" r="4.1"/><circle cx="17" cy="12" r="5.5"/><circle cx="14.2" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
};

// ---- distribuição eletrônica (extraído de scriptsitp.js) ----
function distribuirEletronsMols(Z) {
  let e = Z, dist = {};
  for (const sub of ORDEM_SUBNIVEIS) {
    if (e <= 0) break;
    const fill = Math.min(e, MAX_SUB[sub[sub.length - 1]]);
    if (fill > 0) { dist[sub] = fill; e -= fill; }
  }
  return dist;
}
function porCamadaMols(dist) {
  const camadas = {};
  for (const [sub, e] of Object.entries(dist)) {
    const n = parseInt(sub[0]);
    if (!camadas[n]) camadas[n] = [];
    camadas[n].push({ sub, e });
  }
  return camadas;
}
// N = A - Z, com A vindo de MASSA_ISOTOPO (dadossitp.js).
function calcNeutronsMols(Z) {
  return (MASSA_ISOTOPO[Z] || Z * 2) - Z;
}
function verbalizarConfigMols(notacao) {
  const sup2n = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  return notacao.split(/\s+/).map((termo) => {
    let base = '', exp = '';
    for (const ch of termo) {
      if (sup2n[ch] !== undefined) exp += sup2n[ch]; else base += ch;
    }
    if (!exp) return base;
    if (exp === '1') return `${base} com 1 elétron`;
    if (exp === '2') return `${base} com 2 elétrons`;
    return `${base} com ${exp} elétrons`;
  }).join(', ');
}
function renderConfigMols(Z) {
  const notacao = CONFIG_EC[Z];
  if (!notacao) {
    return `<div class="ec-title">Notação eletrônica</div>
<p class="ec-aviso">Configuração não disponível para este elemento (Z=${Z}).</p>`;
  }
  const aviso = Z >= 104
    ? `<p class="ec-aviso">Configuração prevista por cálculos relativísticos — este é um elemento sintético superpesado.</p>`
    : '';
  const dist = distribuirEletronsMols(Z);
  const camadas = porCamadaMols(dist);
  let html = `<div class="ec-title">Notação eletrônica</div>${aviso}<div class="ec-full" role="text" aria-label="Configuração eletrônica: ${verbalizarConfigMols(notacao)}">${notacao}</div>
<div class="ec-title" style="margin-top:6px">Por camada (Diagrama de Pauling)</div><div class="ec-camadas">`;
  const nMax = Object.keys(camadas).length;
  for (let n = 1; n <= nMax; n++) {
    const nome = CAMADAS_NOME[n - 1] || '?';
    const subs = camadas[n] || [];
    const orbs = subs.map(({ sub, e }) => {
      const tipo = sub[1];
      const col = { s: 'var(--orb-s)', p: 'var(--orb-p)', d: 'var(--orb-d)', f: 'var(--orb-f)' }[tipo] || 'var(--text-secondary)';
      const exp = String(e).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(d)]).join('');
      const leitura = e === 1 ? `${sub} com 1 elétron` : `${sub} com ${e} elétrons`;
      return `<span class="ec-orbital" style="color:${col}" role="text" aria-label="${leitura}">${sub}${exp}</span>`;
    }).join(' ');
    html += `<div class="ec-row"><span class="ec-camada-name" aria-label="Camada ${nome}">${nome}</span><div class="ec-orbitals">${orbs}</div></div>`;
  }
  return html + '</div>';
}

// ---- estado físico (fixo em TEMP_REF — o Mols não tem slider) ----
function estadoNaTemperaturaMols(Z, t) {
  const f = FUSAO[Z], e = EBULICAO[Z];
  if (f === null && e === null) return '?';
  if (f === null) return (e !== null && t >= e) ? 'G' : 'L';
  if (e !== null && e < f) return (t < e) ? 'S' : 'G';
  if (t < f) return 'S';
  if (e === null) return 'L';
  return (t < e) ? 'L' : 'G';
}
function sublimaMols(Z) {
  const f = FUSAO[Z], e = EBULICAO[Z];
  return f !== null && e !== null && e < f;
}

// ---- cor por categoria (lê os mesmos atributos data-theme/data-daltonico
// que o SIE já usa, herdados do a11y.js compartilhado entre simuladores) ----
function getCatColorHexMols(cat) {
  const dalt = document.documentElement.getAttribute('data-daltonico');
  if (dalt && CAT_COLOR_HEX_DALT[dalt]) return CAT_COLOR_HEX_DALT[dalt][cat] || '#888';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return (isLight ? CAT_COLOR_HEX_LIGHT : CAT_COLOR_HEX_DARK)[cat] || '#888';
}

// ---- cards de propriedade (eletronegatividade / energia de ionização) ----
function escalaDaPropriedadeMols(prop) {
  const r = document.documentElement;
  const dalt = r.getAttribute('data-daltonico');
  const alto = r.getAttribute('data-contrast') === 'on';
  const mono = (alto || (dalt && dalt !== 'nenhum'));
  return (mono && prop.escalaMono) ? prop.escalaMono : (prop.escala || ESCALA_CALOR);
}
function hexParaRgbMols(hex) {
  const h = String(hex).replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbParaHexMols(r, g, b) {
  return '#' + [r, g, b].map((n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')).join('');
}
function corNaEscalaMols(prop, v) {
  const paradas = escalaDaPropriedadeMols(prop);
  const p = fracaoPropriedadeMols(prop, v);
  for (let i = 0; i < paradas.length - 1; i++) {
    const a = paradas[i], b = paradas[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (b.p === a.p) ? 0 : (p - a.p) / (b.p - a.p);
      const ca = hexParaRgbMols(a.hex), cb = hexParaRgbMols(b.hex);
      return rgbParaHexMols(ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t);
    }
  }
  return paradas[paradas.length - 1].hex;
}
function valorPropriedadeMols(prop, Z) {
  const linha = prop.tabela ? prop.tabela[Z] : undefined;
  if (linha === null || linha === undefined) return null;
  const v = prop.campo ? linha[prop.campo] : linha;
  return (typeof v === 'number' && isFinite(v)) ? v : null;
}
function numeroPropriedadeMols(prop, v) {
  if (v === null) return '—';
  return v.toFixed(prop.decimais).replace('.', ',');
}
function fracaoPropriedadeMols(prop, v) {
  if (v === null) return 0;
  const span = prop.vmax - prop.vmin;
  if (!(span > 0)) return 0;
  return Math.max(0, Math.min(1, (v - prop.vmin) / span));
}
function renderPropriedadeModalMols(prop, Z, el) {
  const v = valorPropriedadeMols(prop, Z);
  if (v === null) {
    const m = (prop.semDadoMotivos || []).find((g) => g.zs.includes(Z));
    return `<div class="en-wrap">
      <p class="en-sem-dados">${prop.semDadoTitulo || 'Sem valor publicado.'}
      ${m ? m.texto : (prop.semDadoPadrao || '')}</p>
    </div>`;
  }
  const cor = corNaEscalaMols(prop, v);
  const pct = Math.round(fracaoPropriedadeMols(prop, v) * 100);
  const faixa = (prop.faixas || []).find((f) => v >= f.min && v < f.max);
  const num = numeroPropriedadeMols(prop, v);
  const fmt = (x) => String(x).replace('.', ',');
  const alt = prop.fatorAlt
    ? `<span class="en-valor-alt">= ${fmt(Math.round(v * prop.fatorAlt))} ${prop.unidadeAlt}</span>`
    : '';
  return `<div class="en-wrap" style="--en-cor:${cor}">
    <div class="en-visual">
      <div class="en-valor-box">
        <span class="en-valor-titulo">${prop.label}</span>
        <span class="en-valor-num" aria-label="${num} ${prop.unidadeLonga || ''}">${num}${prop.unidade}</span>
        <span class="en-valor-escala">${prop.unidadeLonga || ''}</span>
        ${alt}
      </div>
      <div class="en-info-col">
        <span class="en-faixa-badge">${faixa ? faixa.label : '—'}</span>
        <span class="en-valor-fonte">Fonte: ${prop.fonte || '—'}</span>
      </div>
    </div>
    <div class="en-barra-wrap">
      <span class="en-barra-titulo">Posição na escala — de ${fmt(prop.vmin)} a ${fmt(prop.vmax)}${prop.unidade}</span>
      <div class="en-barra-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Posição de ${el.nome} na escala de ${prop.label}: ${pct} por cento">
        <div class="en-barra-fill" style="width:${pct}%"></div>
        <div class="en-barra-marca" style="left:${pct}%" aria-hidden="true"></div>
      </div>
      <div class="en-barra-legenda"><span>menor</span><span>${num}${prop.unidade} (${pct}%)</span><span>maior</span></div>
    </div>
  </div>`;
}
function renderCardsPropriedadeMols(Z, el) {
  const cx = document.getElementById('modalPropriedadesMols');
  if (!cx) return;
  cx.innerHTML = PROPRIEDADES.filter((p) => p.cardModal).map((p) => `
    <section class="info-card" aria-labelledby="propTitleMols-${p.id}">
      <h4 id="propTitleMols-${p.id}">${ICO_MOLS[p.icone] || ''} ${p.label}</h4>
      <div>${renderPropriedadeModalMols(p, Z, el)}</div>
    </section>`).join('');
}

/* ===================================================================
   MODAL DE ELEMENTO — abrir/fechar (nova, escrita para o SIE)
   ===================================================================
   Não é a abrirModal()/fecharModal() do SITP copiada — aquela mexe em
   grade de 118 células, filtros e modo daltônico que o Mols não tem.
   Esta é uma versão nova, escrita para o contexto do SIE, que só
   monta o conteúdo do modal a partir do símbolo do elemento e chama
   as funções extraídas acima. Estado físico sempre a TEMP_REF (25°C,
   dadossitp.js) — sem slider.
   =================================================================== */
const modalOverlayMols = document.getElementById("modalOverlayMols");
const btnCloseMols = document.getElementById("btnCloseMols");
let elementoAbertoMols = null;

function abrirModalElemento(simbolo) {
  const el = ELEMENTO_POR_SIMBOLO_MOLS[simbolo];
  if (!el) { console.warn(`Elemento "${simbolo}" não encontrado em dadossitp.js.`); return; }

  const Z = el.numero;
  const est = estadoNaTemperaturaMols(Z, TEMP_REF);
  const ccHex = getCatColorHexMols(el.cat);

  const sym = document.getElementById("modalSymbolMols");
  sym.textContent = el.simbolo; sym.style.color = ccHex;
  document.getElementById("modalNumberMols").textContent = "#" + Z;
  const nm = document.getElementById("modalNameMols");
  nm.textContent = el.nome; nm.style.color = ccHex;

  const massaBox = document.getElementById("modalMassMols");
  massaBox.innerHTML = "";
  massaBox.append(`Massa: ${MASSA[Z] || "—"} u`);
  const iv = MASSA_INTERVALO[Z];
  if (iv) {
    const nota = document.createElement("span");
    nota.className = "modal-mass-intervalo";
    nota.textContent = `intervalo [${iv[0]}; ${iv[1]}] u`;
    nota.title = "A massa atômica deste elemento varia naturalmente conforme a origem da amostra, por causa da variação na abundância dos seus isótopos. A CIAAW publica um intervalo em vez de um valor único.";
    massaBox.appendChild(nota);
  }

  const familia = FAMILIA[el.grupo] || "—";
  const periodo = (el.periodo || 0) <= 7 ? el.periodo : (el.cat === "Lantanídeo" ? 6 : 7);
  document.getElementById("modalMetaMols").textContent = `Família ${familia} · Período ${periodo} · ${el.cat}`;

  const estHex = { S: "var(--text-primary)", L: "var(--accent-main)", G: "var(--accent-amber)", "?": "var(--text-secondary)" }[est] || "var(--text-secondary)";
  document.getElementById("modalBadgesMols").innerHTML =
    `<span class="badge" style="background:${estHex}22;color:${estHex};border-color:${estHex}55">${ESTADO_LABEL[est]}</span>` +
    `<span class="badge" style="background:${ccHex}22;color:${ccHex};border-color:${ccHex}55">${el.cat}</span>`;

  document.getElementById("stateCardMols").style.borderLeftColor = estHex;

  const f = FUSAO[Z], e = EBULICAO[Z];
  const fmt = (v) => v === null ? "—" : String(v).replace(".", ",") + " °C";
  document.getElementById("modalStateMols").innerHTML =
    `<p class="est-desc">${ESTADO_DESC[est]}</p>
     <div class="est-pontos">
       <span><b>Fusão</b> ${fmt(f)}</span>
       <span><b>${sublimaMols(Z) ? "Sublimação" : "Ebulição"}</b> ${fmt(e)}</span>
     </div>`
    + (sublimaMols(Z) ? `<p class="est-nota">A 1 atm este elemento passa de sólido direto a gás: nunca é líquido.</p>` : "");

  const N = calcNeutronsMols(Z);
  document.getElementById("modalParticlesMols").innerHTML =
    `<div class="particle-box"><span class="pval" style="color:var(--orb-d)">${Z}</span><span class="plabel">Prótons</span></div>` +
    `<div class="particle-box"><span class="pval" style="color:var(--orb-f)">${N}</span><span class="plabel">Nêutrons</span></div>` +
    `<div class="particle-box"><span class="pval" style="color:var(--orb-s)">${Z}</span><span class="plabel">Elétrons</span></div>`;

  document.getElementById("modalConfigMols").innerHTML = renderConfigMols(Z);
  document.getElementById("modalObtencaoMols").textContent = el.obtencao || "—";
  document.getElementById("modalCuriosidadeMols").textContent = (typeof CURIOSIDADES !== "undefined" && CURIOSIDADES[Z]) || "—";
  renderCardsPropriedadeMols(Z, el);

  elementoAbertoMols = simbolo;
  modalOverlayMols.classList.add("aberto");
  modalOverlayMols.setAttribute("aria-hidden", "false");
  anunciar(`${el.nome}, número atômico ${Z}, ${el.cat}, ${ESTADO_LABEL[est]}.`);
  setTimeout(() => btnCloseMols.focus(), 260);
}

function fecharModalElemento() {
  modalOverlayMols.classList.remove("aberto");
  modalOverlayMols.setAttribute("aria-hidden", "true");
  document.querySelector("#modalMols .modal-body-mols").scrollTop = 0;
  const simboloFechado = elementoAbertoMols;
  elementoAbertoMols = null;
  anunciar("Modal fechado.");
  // Ganchos por quem estava esperando o fechamento — hoje só a
  // investigação de massa molar (aoFecharModalMols), definida mais
  // abaixo no arquivo. A checagem typeof evita erro caso este arquivo
  // seja usado num contexto sem o módulo Mols carregado.
  if (typeof aoFecharModalMols === "function") aoFecharModalMols(simboloFechado);
  return simboloFechado;
}

btnCloseMols.addEventListener("click", () => fecharModalElemento());
modalOverlayMols.addEventListener("click", (e) => { if (e.target === modalOverlayMols) fecharModalElemento(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlayMols.classList.contains("aberto")) fecharModalElemento();
});

/* ===================================================================
   INVESTIGAÇÃO DE MASSA MOLAR — módulo Mols
   ===================================================================
   Fluxo: escolhe uma reação (mesmo catálogo REACTIONS que "Reações
   Prontas" usa) → TODA a reação — reagentes e produtos — é desenhada
   junto no canvas, reagentes à esquerda, produtos à direita. É assim
   que estão de fato numa solução real: juntos, não um de cada vez.
   Clicar num átomo do CANVAS ainda sem massa descoberta abre o modal
   completo do SITP — é lá que o aluno localiza o dado de massa. Ao
   fechar, a massa é registrada e aquele clique já conta como a 1ª
   ocorrência NAQUELA substância. Cliques seguintes em átomos do mesmo
   elemento (já com massa conhecida) só numeram a ocorrência — sem
   reabrir o modal. A massa molar de cada substância aparece sozinha na
   tabela assim que todos os seus átomos estão contados — sem precisar
   de um botão "Pronto". Uma pílula flutuante sobre o canvas (mesmo
   padrão do #mode-indicator do SIMA) mostra quantas substâncias já
   foram concluídas.
   =================================================================== */
let molsReacaoAtual = null; // key da reação em REACTIONS, ou null
// { [formula]: { papel: "reagente"|"produto",
//                contagem: { [simbolo]: { total, contadosIdx: Set<number>, massa: number|null } } } }
let molsSubstancias = {};
let molsFichaPendente = null; // { formula, indice } do átomo que abriu o modal, aguardando fechamento

const molsReactionSearch = document.getElementById("molsReactionSearch");
const molsReactionMenu = document.getElementById("molsReactionMenu");
const molsSubstanceRow = document.getElementById("molsSubstanceRow");
const molsSubstanceLegend = document.getElementById("molsSubstanceLegend");
const molsInstrucaoCanvas = document.getElementById("molsInstrucaoCanvas");
const molsTallyEl = document.getElementById("molsTally");
const molsTallyBody = document.getElementById("molsTallyBody");
const molsResultadoEl = document.getElementById("molsResultado");
let molsReacaoSelecionadaKey = null;

// Popula a lista de reações a partir do MESMO catálogo REACTIONS —
// não é uma lista paralela, é o mesmo dado de "Reações Prontas". Mesmo
// template de card (.reaction-card/.rc-dot) que renderizarMenuReacoes()
// usa lá, num container PRÓPRIO (#molsReactionMenu) — buscar e escolher
// aqui não deve interferir na lista da Estequiometria.
function popularListaReacoesMols() {
  molsReactionMenu.innerHTML = "";
  const ROTULO_TIPO = { covalente: "Covalente", ionico: "Iônica" };
  Object.entries(REACTIONS).forEach(([key, r]) => {
    if (r.modo === "metalico") return; // ligação metálica não tem fórmula fixa pra investigar
    const tipo = r.tipoLigacao || "covalente";
    const card = document.createElement("button");
    card.type = "button";
    card.className = "reaction-card";
    card.setAttribute("role", "option");
    card.setAttribute("aria-selected", "false");
    card.dataset.busca = `${r.label} ${r.equation} ${ROTULO_TIPO[tipo] || tipo}`.toLowerCase();
    card.dataset.tipo = tipo;
    card.dataset.key = key;
    card.innerHTML = `<span class="rc-dot" aria-hidden="true"></span><span class="rc-name">${r.label}</span>`;
    card.addEventListener("click", () => {
      molsReacaoSelecionadaKey = key;
      molsReactionMenu.querySelectorAll(".reaction-card").forEach((c) => {
        const ativo = c === card;
        c.classList.toggle("is-active", ativo);
        c.setAttribute("aria-selected", String(ativo));
      });
      resetInvestigacaoMols();
      iniciarInvestigacaoReacaoMols(key);
    });
    molsReactionMenu.appendChild(card);
  });
}
popularListaReacoesMols();

function aplicarFiltroReacoesMols() {
  const termo = molsReactionSearch.value.trim().toLowerCase();
  molsReactionMenu.querySelectorAll(".reaction-card").forEach((card) => {
    card.style.display = !termo || card.dataset.busca.includes(termo) ? "" : "none";
  });
}
molsReactionSearch.addEventListener("input", aplicarFiltroReacoesMols);

function resetInvestigacaoMols() {
  molsReacaoAtual = null;
  molsSubstancias = {};
  molsFichaPendente = null;
  molsSubstanceRow.hidden = true;
  molsSubstanceLegend.innerHTML = "";
  molsInstrucaoCanvas.hidden = true;
  atualizarModeIndicator();
  molsTallyEl.hidden = true;
  molsTallyBody.innerHTML = "";
  molsResultadoEl.hidden = true;
  molsResultadoEl.textContent = "";
  limparCena();
}

// Desenha TODA a reação no canvas — reagentes à esquerda, produtos à
// direita, com um respiro no meio. O NÚMERO DE CÓPIAS de cada substância
// segue o coeficiente estequiométrico de verdade na LEGENDA e no
// CÁLCULO (massa total = coeficiente × massa molar) — mas não mais no
// número de cópias desenhadas. Chegou a desenhar uma molécula por
// unidade de coeficiente (Si + 2 H₂ → SiH₄ desenhava 2 moléculas de
// H₂), o que ficava correto pra reações pequenas mas virava um canvas
// ilegível em reações com muitas substâncias e coeficientes grandes
// (ex.: "Reatividade total do potássio", coeficiente 6+ em vários
// halogênios de uma vez — dezenas de círculos sobrepostos). Voltou a
// ser 1 molécula por substância, sempre — o coeficiente aparece por
// escrito na legenda ("6 × K") e entra direto na conta da massa total,
// sem precisar ser desenhado fisicamente dezenas de vezes.
// Reaproveita instanciarMolecula()/criarAtomo() e o mesmo espalhamento
// sem sobreposição (gerarPosicoesSemSobreposicao) que a montagem de
// reagentes da Estequiometria já usa.
// Escala de desenho do módulo Mols — bem menor que o tamanho normal
// (1 = tamanho real da Estequiometria). Faz sentido reduzir aqui e só
// aqui: o Mols pode mostrar até uma dezena de substâncias diferentes
// de uma vez (uma reação inteira), enquanto a Estequiometria só
// desenha os poucos reagentes escolhidos — o mesmo tamanho de átomo
// que cabe bem lá vira ilegível aqui. 0,5 ainda deixa cada átomo
// clicável com folga (a tolerância de clique já soma +4px ao raio).
const MOLS_ESCALA = 0.5;

function renderizarReacaoNoCanvasMols(reactionKey) {
  limparCena();
  const r = REACTIONS[reactionKey];
  const reagentesFormulas = r.reagents.map((rg) => rg.formula);
  const produtosFormulas = Object.keys(r.coeffs).filter((f) => !reagentesFormulas.includes(f));

  const area = areaDeJogo();
  const meio = (area.left + area.right) / 2;
  const vao = 34; // respiro em volta do centro, onde a leitura da equação "vira" de reagente pra produto
  const areaEsq = { left: area.left, right: Math.max(area.left + 40, meio - vao), top: area.top, bottom: area.bottom };
  const areaDir = { left: Math.min(area.right - 40, meio + vao), right: area.right, top: area.top, bottom: area.bottom };

  const posReagentes = gerarPosicoesSemSobreposicao(reagentesFormulas, areaEsq, MOLS_ESCALA);
  const posProdutos = gerarPosicoesSemSobreposicao(produtosFormulas, areaDir, MOLS_ESCALA);

  const criarSubstancia = (formula, centro, papel) => {
    const contagem = contarAtomos(formula); // átomos por 1 unidade de fórmula
    const coeficiente = r.coeffs[formula];

    // total = porUnidade (não multiplicado pelo coeficiente): clicar
    // conta os átomos DESSA molécula, uma vez — o coeficiente entra na
    // conta de massa total depois, sem precisar de mais cliques.
    molsSubstancias[formula] = { papel, coeficiente, contagem: {} };
    const proximoIndice = {};
    Object.entries(contagem).forEach(([simbolo, n]) => {
      molsSubstancias[formula].contagem[simbolo] = { porUnidade: n, total: n, contadosIdx: new Set(), massa: null };
      proximoIndice[simbolo] = 0;
    });

    const simbolosNaOrdem = [];
    Object.entries(contagem).forEach(([simbolo, n]) => { for (let i = 0; i < n; i++) simbolosNaOrdem.push(simbolo); });

    const tagear = (a, simbolo) => {
      a.molsFormula = formula;
      a.molsIndice = proximoIndice[simbolo]++;
    };

    if (MOLECULE_TEMPLATES[formula]) {
      const antes = new Set(atoms.keys());
      instanciarMolecula(formula, centro, MOLS_ESCALA);
      const indicesLocaisPorSimbolo = {}; // só pra casar átomo-do-template com seu símbolo, na ordem certa
      simbolosNaOrdem.forEach((s, i) => { (indicesLocaisPorSimbolo[s] = indicesLocaisPorSimbolo[s] || []).push(i); });
      const usadosLocal = {};
      Object.keys(contagem).forEach((s) => { usadosLocal[s] = 0; });
      atoms.forEach((a, id) => {
        if (antes.has(id)) return; // átomo de outra substância já criada
        const lista = indicesLocaisPorSimbolo[a.elemento];
        if (!lista || usadosLocal[a.elemento] >= lista.length) return;
        usadosLocal[a.elemento]++;
        tagear(a, a.elemento);
      });
    } else {
      // Sem gabarito de geometria (produto formado só pela física de
      // ligação de uma reação de verdade — NH₃, HCl, SiH₄...). Antes:
      // círculo solto de átomos, NENHUM ligado a nada — incoerente com
      // o resto do canvas, onde toda molécula aparece com os átomos de
      // fato ligados (é assim que o módulo Estequiometria sempre
      // desenhou). Agora: um átomo CENTRAL (o símbolo com menor
      // contagem — geralmente o elemento menos eletronegativo do
      // composto, como N em NH₃ ou Si em SiH₄) com todos os demais
      // ligados a ele por criarLigacao(), a mesma função que os
      // gabaritos de MOLECULE_TEMPLATES usam — não é a geometria real
      // da ligação (não sabemos os ângulos VSEPR de cada composto sem
      // um gabarito dedicado), mas ao menos fica visualmente CONECTADO,
      // como uma molécula de verdade.
      const simbolosUnicos = Object.keys(contagem);
      let simboloCentral = simbolosUnicos[0];
      simbolosUnicos.forEach((s) => { if (contagem[s] < contagem[simboloCentral]) simboloCentral = s; });

      const central = criarAtomo(simboloCentral, { x: centro.x, y: centro.y }, MOLS_ESCALA);
      tagear(central, simboloCentral);

      const perifericos = [];
      Object.entries(contagem).forEach(([s, n]) => {
        const vezes = s === simboloCentral ? n - 1 : n; // 1 ocorrência do central já foi criada acima
        for (let i = 0; i < vezes; i++) perifericos.push(s);
      });
      perifericos.forEach((simbolo, i) => {
        // Comprimento de ligação = soma dos raios reais dos dois átomos
        // (em Å, convertido pra px) — antes era um valor GENÉRICO fixo
        // (1,0 Å pra qualquer par), que ficava menor que o próprio raio
        // de átomos grandes como K (2,03 Å): o periférico nascia
        // literalmente DENTRO do círculo do central. Com a soma dos
        // raios, o periférico sempre nasce encostado na borda externa
        // do central, nunca sobreposto — mesmo princípio que os
        // gabaritos manuais (H-H, Cl-Cl etc.) já usam, só que calculado
        // na hora em vez de medido à mão por composto.
        const comprimentoLigacao = (ELEMENTS[simboloCentral].radius + ELEMENTS[simbolo].radius) * PX_POR_ANGSTROM * MOLS_ESCALA;
        const ang = (i / perifericos.length) * Math.PI * 2;
        const a = criarAtomo(simbolo, {
          x: centro.x + Math.cos(ang) * comprimentoLigacao,
          y: centro.y + Math.sin(ang) * comprimentoLigacao,
        }, MOLS_ESCALA);
        tagear(a, simbolo);
        criarLigacao(central, a, 1, comprimentoLigacao);
      });
    }
  };

  reagentesFormulas.forEach((formula, i) => criarSubstancia(formula, posReagentes[i], "reagente"));
  produtosFormulas.forEach((formula, i) => criarSubstancia(formula, posProdutos[i], "produto"));

  atoms.forEach((a) => Matter.Body.setStatic(a.body, true)); // parado: o Mols não simula reação
}

function iniciarInvestigacaoReacaoMols(reactionKey) {
  molsReacaoAtual = reactionKey;
  molsFichaPendente = null;
  molsResultadoEl.hidden = true;
  molsResultadoEl.textContent = "";

  renderizarReacaoNoCanvasMols(reactionKey);

  const r = REACTIONS[reactionKey];
  const reagentesFormulas = r.reagents.map((rg) => rg.formula);
  const todasFormulas = Object.keys(r.coeffs);

  molsSubstanceLegend.innerHTML = todasFormulas.map((formula) => {
    const ehReagente = reagentesFormulas.includes(formula);
    const coef = r.coeffs[formula];
    const prefixoCoef = coef > 1 ? `${coef} × ` : "";
    return `<span class="mols-substance-chip${ehReagente ? "" : " mols-substance-chip--produto"}">
      <span class="mols-substance-dot" aria-hidden="true"></span>
      <span class="mols-substance-formula">${prefixoCoef}${rotuloFormula(formula)}</span>
      <span class="mols-substance-papel">${ehReagente ? "reagente" : "produto"}</span>
    </span>`;
  }).join("");
  molsSubstanceRow.hidden = false;
  molsInstrucaoCanvas.hidden = false;

  renderizarTallyMols();
  molsTallyEl.hidden = false;

  atualizarModeIndicator();
  anunciar(`Investigando a reação ${r.label}. Reagentes à esquerda, produtos à direita — clique nos átomos do canvas para descobrir a massa de cada elemento.`);
}

// Chamada pelo hit-test do canvas (ver o pointerdown mais abaixo), não
// mais por um clique de ficha na barra lateral.
function cliqueAtomoMols(atomo) {
  const formula = atomo.molsFormula;
  const indice = atomo.molsIndice;
  const simbolo = atomo.elemento;
  if (formula === undefined || indice === undefined) return; // átomo fora da investigação atual
  const substancia = molsSubstancias[formula];
  if (!substancia) return;
  const registro = substancia.contagem[simbolo];
  if (!registro) return;

  if (registro.massa === null) {
    // 1º clique nesse elemento NESTA substância: abre o modal completo
    // do SITP — é lá que o aluno localiza o dado de massa. Ao fechar,
    // marcarAtomoContado registra a massa e já conta este clique como
    // a 1ª ocorrência.
    molsFichaPendente = { formula, indice };
    abrirModalElemento(simbolo);
    return;
  }
  if (registro.contadosIdx.has(indice)) return; // já contada, clique não faz nada
  marcarAtomoContado(formula, indice, simbolo);
}

// Hit-test do canvas: mesma encontrarAtomoEm() que o arrastar-e-ligar da
// Estequiometria usa. Só reage quando o módulo Mols está ativo e há uma
// investigação em andamento — não interfere no fluxo de reação.
canvas.addEventListener("pointerdown", (evento) => {
  if (moduloAtivo !== "mols" || !molsReacaoAtual) return;
  const { x, y } = pointFromEvent(evento);
  const atomo = encontrarAtomoEm(x, y);
  if (atomo) cliqueAtomoMols(atomo);
});

// O "anel" de estado ao redor do átomo não é atualizado aqui: ele é
// desenhado a cada quadro por dibujarAtomo(), lendo molsSubstancias
// diretamente — atualizar o estado já é suficiente pro próximo frame
// mostrar o anel certo, sem precisar tocar em nenhum elemento de DOM.
function marcarAtomoContado(formula, indice, simbolo) {
  const registro = molsSubstancias[formula].contagem[simbolo];
  registro.contadosIdx.add(indice);
  const numero = registro.contadosIdx.size;
  anunciar(`${simbolo} em ${rotuloFormula(formula)}, ocorrência ${numero} de ${registro.total} contada.`);
  renderizarTallyMols();
  atualizarModeIndicator();
}

// Chamada quando o modal fecha — se havia um átomo pendente (o clique
// que ABRIU o modal), registra a massa e já conta aquele clique como a
// 1ª ocorrência, sem exigir um segundo clique no mesmo átomo.
function aoFecharModalMols(simboloFechado) {
  if (molsFichaPendente === null || !simboloFechado) return;
  const { formula, indice } = molsFichaPendente;
  molsFichaPendente = null;
  const substancia = molsSubstancias[formula];
  const registro = substancia && substancia.contagem[simboloFechado];
  if (!registro || registro.massa !== null) return; // segurança: não é o fluxo esperado

  const bruta = MASSA[ELEMENTO_POR_SIMBOLO_MOLS[simboloFechado].numero];
  registro.massa = parseFloat(String(bruta).replace(/[\[\]]/g, "").replace(",", "."));
  marcarAtomoContado(formula, indice, simboloFechado);
}

function substanciaCompletaMols(formula) {
  const registros = Object.values(molsSubstancias[formula].contagem);
  return registros.every((r) => r.massa !== null && r.contadosIdx.size === r.total);
}

// Massa de 1 mol da substância — soma (massa atômica × átomos POR
// UNIDADE de fórmula). Não muda com o coeficiente da reação: é a mesma
// se a equação pedir 1 ou 12 unidades dela.
function massaMolarSubstanciaMols(formula) {
  let total = 0;
  Object.values(molsSubstancias[formula].contagem).forEach((r) => { total += r.massa * r.porUnidade; });
  return total;
}

// Massa REAL presente na reação — massa molar × coeficiente
// estequiométrico. É essa que soma dos dois lados da equação (Lei de
// Lavoisier): a massa total dos reagentes tem que bater com a dos
// produtos.
function massaTotalSubstanciaMols(formula) {
  return massaMolarSubstanciaMols(formula) * molsSubstancias[formula].coeficiente;
}

// Tabela agrupada por substância: cabeçalho (fórmula + papel), linhas
// de elemento — a CONTAGEM já é o total real da reação (coeficiente ×
// átomos por unidade), não uma unidade de fórmula só — e, assim que
// TODOS os átomos daquela substância estiverem descobertos e contados,
// duas linhas de resultado: massa molar (1 mol) e massa total (a
// quantidade real que a equação pede). Sem precisar de nenhum botão
// "Pronto". Quando TODAS as substâncias da reação estão completas, o
// resumo final aparece, com a conferência de Lavoisier.
function renderizarTallyMols() {
  molsTallyBody.innerHTML = "";
  let todasCompletas = Object.keys(molsSubstancias).length > 0;

  Object.entries(molsSubstancias).forEach(([formula, substancia]) => {
    const coef = substancia.coeficiente;
    const prefixoCoef = coef > 1 ? `${coef} × ` : "";
    const trCab = document.createElement("tr");
    trCab.className = "mols-tally-substancia" + (substancia.papel === "produto" ? " mols-tally-substancia--produto" : "");
    trCab.innerHTML = `<td colspan="3">${prefixoCoef}${rotuloFormula(formula)}<span class="mols-substance-papel">${substancia.papel}</span></td>`;
    molsTallyBody.appendChild(trCab);

    Object.entries(substancia.contagem).forEach(([simbolo, registro]) => {
      const completo = registro.contadosIdx.size === registro.total;
      const tr = document.createElement("tr");
      tr.className = completo ? "is-completo" : "";
      tr.innerHTML = `
        <td>${simbolo}</td>
        <td>${registro.massa === null ? "?" : registro.massa.toFixed(3).replace(".", ",")}</td>
        <td>${registro.contadosIdx.size}/${registro.total}${completo ? " ✓" : ""}</td>`;
      molsTallyBody.appendChild(tr);
    });

    if (substanciaCompletaMols(formula)) {
      const massaMolar = massaMolarSubstanciaMols(formula);
      const trMolar = document.createElement("tr");
      trMolar.className = "mols-tally-resultado";
      trMolar.innerHTML = `<td colspan="3">Massa molar (1 mol): ${massaMolar.toFixed(2).replace(".", ",")} g/mol</td>`;
      molsTallyBody.appendChild(trMolar);

      if (coef > 1) {
        const massaTotal = massaTotalSubstanciaMols(formula);
        const trTotal = document.createElement("tr");
        trTotal.className = "mols-tally-resultado";
        trTotal.innerHTML = `<td colspan="3">Massa total nesta reação (${coef} mol): ${massaTotal.toFixed(2).replace(".", ",")} g</td>`;
        molsTallyBody.appendChild(trTotal);
      }
    } else {
      todasCompletas = false;
    }
  });

  if (todasCompletas) {
    mostrarResumoFinalMols();
  } else {
    molsResultadoEl.hidden = true;
  }
}

// Resumo final — junta a massa total de cada substância (coeficiente ×
// massa molar) e confere a Lei de Lavoisier: massa total dos reagentes
// tem que ser igual à massa total dos produtos. É a mesma conservação
// de massa que a equação balanceada já garante em número de átomos —
// aqui ela aparece em gramas, fechando o ciclo entre balanceamento e
// massa molar que o módulo Mols existe pra ensinar.
function mostrarResumoFinalMols() {
  const formulas = Object.keys(molsSubstancias);

  const massaReagentes = formulas
    .filter((f) => molsSubstancias[f].papel === "reagente")
    .reduce((soma, f) => soma + massaTotalSubstanciaMols(f), 0);
  const massaProdutos = formulas
    .filter((f) => molsSubstancias[f].papel === "produto")
    .reduce((soma, f) => soma + massaTotalSubstanciaMols(f), 0);
  // margem pequena pra arredondamento de ponto flutuante, não pra erro químico real
  const conserva = Math.abs(massaReagentes - massaProdutos) < 0.05;

  const fmt = (x) => x.toFixed(2).replace(".", ",");
  const linhasPorSubstancia = formulas
    .map((formula) => {
      const sub = molsSubstancias[formula];
      const coef = sub.coeficiente;
      const detalhe = coef > 1 ? `${coef} mol × ${fmt(massaMolarSubstanciaMols(formula))} g/mol = ${fmt(massaTotalSubstanciaMols(formula))} g` : `${fmt(massaMolarSubstanciaMols(formula))} g/mol`;
      return `<strong>${rotuloFormula(formula)}</strong>: ${detalhe}`;
    })
    .join(" · ");

  const linhaLavoisier = `<p class="mols-lavoisier ${conserva ? "is-ok" : "is-erro"}">
    ${conserva ? "✓" : "✗"} Massa dos reagentes (${fmt(massaReagentes)} g) ${conserva ? "=" : "≠"} massa dos produtos (${fmt(massaProdutos)} g) — Lei de Lavoisier.
  </p>`;

  molsResultadoEl.hidden = false;
  molsResultadoEl.innerHTML = `Reação totalmente investigada — ${linhasPorSubstancia}${linhaLavoisier}`;
  anunciar(`Todas as substâncias da reação foram investigadas. Massa dos reagentes: ${fmt(massaReagentes)} gramas. Massa dos produtos: ${fmt(massaProdutos)} gramas. ${conserva ? "A massa se conserva, confirmando a Lei de Lavoisier." : "Atenção: as massas não bateram — confira a contagem."}`);
}