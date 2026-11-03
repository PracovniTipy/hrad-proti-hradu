/* =========================================================================
   VĚŽOVÉ SADY – ÚPLNĚ NOVÉ TVARY (jen za hraní Castle Tower)
   Každá sada má vlastní přilbu, štít, ozdoby zbroje (vzadu, na hrudi, nad hlavou)
   a vlastní modely meče, kopí, luku a hole – nic z dřívějších skinů.
     kamen    – Kamenná stráž: chrlič na přilbě, kamenné desky, levitující balvany
     boure    – Pán bouře: koruna z blesků, bouřkový mrak a jiskřící oblouky
     obsidian – Obsidiánový rytíř: přilba z krystalů, vznášející se střepy
     feniks   – Fénixova zbroj: přilba ptačí hlavy, ohnivá křídla z per
     hvezdy   – Hvězdný vládce: otevřená koruna hvězd, souhvězdí a planoucí kruh
     pan      – Pán věže: rohatá koruna, plášť z temných úponků a oko věže
   ========================================================================= */
(function () {
  const A = window.Art, P = window.ArtParts, TAU = Math.PI * 2, OUT = A.OUT || '#121419';
  if (!A || !P) return;
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  const shade = A.shade;
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const M = A.MELEE_REF, PO = A.POLE_REF, BF = A.bladeFill, GO = A.glowOn, GF = A.glowOff, gem = A.gemDot;
  const glowS = (ctx, col, b) => { ctx.shadowColor = col; ctx.shadowBlur = b; };
  const star = (ctx, x, y, r1, r2, n, rot) => { ctx.beginPath(); for (let k = 0; k < n * 2; k++) { const a = (rot || -Math.PI / 2) + k * Math.PI / n, r = k % 2 ? r2 : r1; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); };

  /* =================== PŘILBY =================== */
  // KAMEN: hranatá kamenná přilba s chrličem (rohatá hlava s křídly) na temeni
  P.helmet.vz_kamen = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-9.5, -55); ctx.lineTo(-10, -70); ctx.lineTo(-5, -78); ctx.lineTo(7, -78); ctx.lineTo(12, -70); ctx.lineTo(12, -55); ctx.lineTo(4, -53); ctx.closePath();
    const g = ctx.createLinearGradient(-10, -78, 12, -55); g.addColorStop(0, shade(pal.metal, 0.25)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.strokeStyle = shade(pal.metalDark, -0.2); ctx.lineWidth = 0.8;   // spáry mezi kameny
    ctx.beginPath(); ctx.moveTo(-9.8, -66); ctx.lineTo(12, -66); ctx.moveTo(1, -78); ctx.lineTo(1, -66); ctx.moveTo(-3, -66); ctx.lineTo(-3, -55); ctx.moveTo(7, -66); ctx.lineTo(7, -55); ctx.stroke();
    rr(ctx, 3.2, -64, 9, 2.2, 0.8); ctx.fillStyle = OUT; ctx.fill();                 // průzor
    ctx.save(); glowS(ctx, pal.trim, 6); rr(ctx, 4.6, -63.6, 6, 1.2, 0.6); ctx.fillStyle = pal.trim; ctx.fill(); ctx.restore();
    // mech na hraně
    for (const [x, y] of [[-8, -70], [-6, -77], [10, -72]]) { ctx.beginPath(); ctx.ellipse(x, y, 2.6, 1.4, 0.4, 0, TAU); fs(ctx, '#5a8a3a', 0.6); }
    // chrlič: hlava s rohy a malými křídly
    ctx.beginPath(); ctx.moveTo(-2, -78); ctx.quadraticCurveTo(-2, -86, 3, -87); ctx.quadraticCurveTo(8, -86, 8, -78); ctx.closePath(); fs(ctx, pal.metal, 1.4);
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(3 + d * 3, -85); ctx.quadraticCurveTo(3 + d * 7, -88, 3 + d * 6, -93); ctx.lineTo(3 + d * 4.5, -86); ctx.closePath(); fs(ctx, pal.metalDark, 1); }
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(3 + d * 4, -81); ctx.quadraticCurveTo(3 + d * 11, -88, 3 + d * 13, -80); ctx.quadraticCurveTo(3 + d * 9, -81, 3 + d * 5, -79); ctx.closePath(); fs(ctx, shade(pal.metal, -0.15), 1); }
    ctx.save(); glowS(ctx, pal.trim, 5); ctx.fillStyle = pal.trim; for (const x of [1.4, 4.6]) { ctx.beginPath(); ctx.arc(x, -83, 0.9, 0, TAU); ctx.fill(); } ctx.restore();
  };
  // BOURE: helma s maskou a korunou z klikatých blesků
  P.helmet.vz_boure = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-8.6, -56); ctx.quadraticCurveTo(-10, -74, 1.5, -78); ctx.quadraticCurveTo(12, -74, 11.6, -60); ctx.lineTo(13, -56); ctx.lineTo(3, -53); ctx.closePath();
    const g = ctx.createLinearGradient(-8, -78, 12, -56); g.addColorStop(0, shade(pal.metal, 0.3)); g.addColorStop(1, pal.metalDark); fs(ctx, g, 1.8);
    ctx.beginPath(); ctx.moveTo(2, -66); ctx.lineTo(12.4, -64); ctx.lineTo(12, -58); ctx.lineTo(4, -57); ctx.closePath(); fs(ctx, shade(pal.tunic, -0.3), 1.2);   // maska
    ctx.save(); glowS(ctx, '#fff36a', 8); ctx.strokeStyle = '#fff6a8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(5, -62); ctx.lineTo(8, -61); ctx.lineTo(7, -63); ctx.lineTo(11, -62); ctx.stroke(); ctx.restore();
    // koruna z blesků
    ctx.save(); glowS(ctx, '#fff36a', 10);
    for (const [x, h, d] of [[-6, 9, -1], [-1, 13, 1], [4, 16, -1], [9, 11, 1]]) {
      ctx.beginPath(); ctx.moveTo(x - 1.4, -74.5); ctx.lineTo(x + d * 2, -74.5 - h * 0.5); ctx.lineTo(x - d * 0.6, -74.5 - h * 0.55); ctx.lineTo(x + d * 1.6, -74.5 - h); ctx.lineTo(x + 0.8, -74.5 - h * 0.45); ctx.lineTo(x + d * -1.4, -74.5 - h * 0.4); ctx.lineTo(x + 1.4, -74.5); ctx.closePath();
      fs(ctx, '#ffe14a', 0.9);
    }
    ctx.restore();
    rr(ctx, -8.6, -76, 21, 3, 1.2); fs(ctx, pal.trim, 1.2);
  };
  // OBSIDIAN: přilba z ostrých černých krystalů s fialovými prasklinami
  P.helmet.vz_obsidian = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-9, -55); ctx.lineTo(-11, -66); ctx.lineTo(-6, -76); ctx.lineTo(2, -80); ctx.lineTo(10, -75); ctx.lineTo(12.5, -64); ctx.lineTo(12, -55); ctx.lineTo(3, -52); ctx.closePath();
    const g = ctx.createLinearGradient(-10, -80, 12, -55); g.addColorStop(0, '#4a3a5a'); g.addColorStop(0.5, pal.metal); g.addColorStop(1, '#0a080c'); fs(ctx, g, 1.8);
    ctx.save(); glowS(ctx, '#b25cff', 8); ctx.strokeStyle = '#d08aff'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(-6, -72); ctx.lineTo(-2, -66); ctx.lineTo(-5, -59); ctx.moveTo(6, -76); ctx.lineTo(3, -70); ctx.lineTo(7, -66); ctx.stroke();
    rr(ctx, 4, -64, 8, 1.8, 0.6); ctx.fillStyle = '#e8c8ff'; ctx.fill(); ctx.restore();
    // krystalové hroty
    for (const [x, y, h, a] of [[-7, -74, 12, -0.6], [-1, -79, 16, -0.15], [6, -78, 13, 0.3], [11, -70, 9, 0.8]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-2.4, 2); ctx.lineTo(0, -h); ctx.lineTo(2.4, 2); ctx.closePath();
      const gg = ctx.createLinearGradient(-2, 0, 2, 0); gg.addColorStop(0, '#5a4a6a'); gg.addColorStop(1, '#0e0a12'); fs(ctx, gg, 1.1);
      ctx.beginPath(); ctx.moveTo(0, -h + 1); ctx.lineTo(0.5, 0); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(220,180,255,.7)'; ctx.stroke();
      ctx.restore();
    }
  };
  // FENIKS: přilba ve tvaru ptačí hlavy – zobák jako hledí, ohnivý hřeben z per
  P.helmet.vz_feniks = (ctx, L, pal) => {
    // hřeben z per (dozadu)
    ctx.save(); glowS(ctx, '#ff8a3a', 10);
    for (let k = 0; k < 5; k++) {
      const a = -1.9 - k * 0.28, len = 16 - k * 1.5;
      ctx.beginPath(); ctx.moveTo(-2, -74); ctx.quadraticCurveTo(-2 + Math.cos(a) * len * 0.6, -74 + Math.sin(a) * len * 0.6 - 3, -2 + Math.cos(a) * len, -74 + Math.sin(a) * len);
      ctx.quadraticCurveTo(-2 + Math.cos(a) * len * 0.5 + 3, -74 + Math.sin(a) * len * 0.5, -1, -72); ctx.closePath();
      fs(ctx, k % 2 ? '#ffb347' : '#ff5a1a', 0.9);
    }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-9, -56); ctx.quadraticCurveTo(-11, -72, 0, -77); ctx.quadraticCurveTo(10, -76, 12, -66); ctx.lineTo(12, -57); ctx.lineTo(3, -53); ctx.closePath();
    const g = ctx.createLinearGradient(-9, -77, 12, -56); g.addColorStop(0, '#ffe0a0'); g.addColorStop(0.5, pal.metal); g.addColorStop(1, pal.metalDark); fs(ctx, g, 1.8);
    // zobák
    ctx.beginPath(); ctx.moveTo(5, -68); ctx.quadraticCurveTo(16, -67, 21, -61); ctx.quadraticCurveTo(14, -61.5, 8, -59); ctx.closePath(); fs(ctx, '#ffd24a', 1.5);
    ctx.beginPath(); ctx.moveTo(8, -60); ctx.quadraticCurveTo(14, -60, 18, -58); ctx.quadraticCurveTo(13, -57, 8, -57.5); ctx.closePath(); fs(ctx, '#e8a04a', 1.1);
    ctx.save(); glowS(ctx, '#ff6a2a', 8); ctx.beginPath(); ctx.ellipse(6, -66, 2.2, 1.4, 0.2, 0, TAU); ctx.fillStyle = '#fff1a0'; ctx.fill(); ctx.restore();
    // pera po stranách
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(-6 + k * 2, -62 + k * 2, 4, 1.6, -0.6, 0, TAU); fs(ctx, k % 2 ? '#c8361c' : '#ff8a3a', 0.8); }
  };
  // HVEZDY: otevřená stříbrná koruna s hvězdami a vznášející se hvězdou nad čelem
  P.helmet.vz_hvezdy = (ctx, L, pal, st) => {
    const t = (st && st.t) || 0;
    ctx.beginPath(); ctx.moveTo(-9, -60); ctx.quadraticCurveTo(-9.5, -71, 1.5, -74); ctx.quadraticCurveTo(12, -71, 11.6, -60); ctx.lineTo(9, -60); ctx.quadraticCurveTo(9, -69, 1.5, -70.5); ctx.quadraticCurveTo(-6, -69, -6.4, -60); ctx.closePath();
    const g = ctx.createLinearGradient(-9, -74, 12, -60); g.addColorStop(0, '#ffffff'); g.addColorStop(1, pal.metalDark); fs(ctx, g, 1.6);
    // koruna z pěti hvězdných cípů
    for (let k = 0; k < 5; k++) { const x = -6 + k * 3.8, h = k === 2 ? 10 : k % 2 ? 7.5 : 6; ctx.beginPath(); ctx.moveTo(x - 1.8, -72.5); ctx.lineTo(x, -72.5 - h); ctx.lineTo(x + 1.8, -72.5); ctx.closePath(); fs(ctx, '#f4f8ff', 1); }
    ctx.save(); glowS(ctx, '#bfe8ff', 10);
    star(ctx, 1.5, -88 + Math.sin(t * 2) * 1.5, 4.4, 1.8, 5); fs(ctx, '#ffe28a', 1);
    for (let k = 0; k < 3; k++) { const a = t * 1.2 + k * 2.1; star(ctx, 1.5 + Math.cos(a) * 13, -78 + Math.sin(a) * 4, 1.8, 0.8, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); }
    ctx.restore();
    gem(ctx, 1.5, -71.5, 1.5, '#7fd3ff');
  };
  // PAN: černá koruna s obřími zakroucenými rohy a planoucími štěrbinami
  P.helmet.vz_pan = (ctx, L, pal) => {
    for (const d of [-1, 1]) {   // rohy
      ctx.beginPath(); ctx.moveTo(1.5 + d * 6, -72); ctx.bezierCurveTo(1.5 + d * 18, -76, 1.5 + d * 20, -92, 1.5 + d * 10, -100); ctx.bezierCurveTo(1.5 + d * 14, -90, 1.5 + d * 11, -80, 1.5 + d * 3, -76); ctx.closePath();
      const gh = ctx.createLinearGradient(0, -100, 0, -72); gh.addColorStop(0, '#ffd24a'); gh.addColorStop(0.3, '#3a0a0e'); gh.addColorStop(1, '#1a0406'); fs(ctx, gh, 1.5);
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(1.5 + d * (6 + k * 3), -74 - k * 4); ctx.lineTo(1.5 + d * (10 + k * 2.5), -76 - k * 5); ctx.lineWidth = 0.8; ctx.strokeStyle = '#c9962a'; ctx.stroke(); }
    }
    ctx.beginPath(); ctx.moveTo(-9, -55); ctx.lineTo(-10, -70); ctx.quadraticCurveTo(1.5, -79, 13, -70); ctx.lineTo(12.5, -55); ctx.lineTo(3, -51); ctx.closePath();
    const g = ctx.createLinearGradient(-9, -79, 13, -55); g.addColorStop(0, '#4a1418'); g.addColorStop(1, '#0e0204'); fs(ctx, g, 1.8);
    // koruna
    ctx.beginPath(); ctx.moveTo(-9.5, -71); for (let k = 0; k <= 6; k++) ctx.lineTo(-9.5 + k * 3.7, k % 2 ? -71 : -78); ctx.lineTo(13, -71); ctx.closePath(); fs(ctx, '#c9962a', 1.2);
    gem(ctx, 1.6, -74, 1.4, '#ff2a2a');
    ctx.save(); glowS(ctx, '#ff3a3a', 10); ctx.fillStyle = '#ff5a3a';
    ctx.beginPath(); ctx.moveTo(3, -64); ctx.lineTo(12, -66); ctx.lineTo(11, -62.5); ctx.closePath(); ctx.fill(); ctx.restore();
  };

  /* =================== ŠTÍTY =================== */
  const sxOf = atk => (atk >= 0 && atk < 0.6 ? -1.5 : 0);
  P.shield.vz_kamen = (ctx, L, pal, atk) => {   // kulatý kamenný štít se zářící runou
    const x = 9 + sxOf(atk), y = -41;
    ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + 0.2; ctx.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13); } ctx.closePath(); fs(ctx, pal.metal, 2);
    ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); fs(ctx, pal.metalDark, 1.2);
    ctx.save(); glowS(ctx, pal.trim, 8); ctx.strokeStyle = pal.trim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.moveTo(x - 4, y - 2); ctx.lineTo(x + 4, y + 2); ctx.moveTo(x + 4, y - 2); ctx.lineTo(x - 4, y + 2); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = shade(pal.metalDark, -0.2); ctx.lineWidth = 0.8; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + 0.2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); ctx.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13); ctx.stroke(); }
  };
  P.shield.vz_boure = (ctx, L, pal, atk) => {   // dlouhý štít s bleskem a bouřkovým mrakem
    const s = sxOf(atk);
    ctx.save(); ctx.translate(s, 0);
    const path = () => { ctx.beginPath(); ctx.moveTo(10.5, -64); ctx.quadraticCurveTo(22, -58, 21, -40); ctx.quadraticCurveTo(19, -26, 10.5, -18); ctx.quadraticCurveTo(2, -26, 0, -40); ctx.quadraticCurveTo(-1, -58, 10.5, -64); ctx.closePath(); };
    path(); fs(ctx, pal.tunic, 2.2);
    ctx.save(); path(); ctx.clip(); ctx.beginPath(); ctx.ellipse(10.5, -54, 12, 5, 0, 0, TAU); fs(ctx, '#4a5a8a', 0.8); ctx.restore();
    ctx.save(); glowS(ctx, '#fff36a', 10); ctx.beginPath(); ctx.moveTo(12, -54); ctx.lineTo(6, -40); ctx.lineTo(11, -40); ctx.lineTo(8, -26); ctx.lineTo(16, -43); ctx.lineTo(11, -43); ctx.lineTo(15, -54); ctx.closePath(); fs(ctx, '#ffe14a', 1); ctx.restore();
    path(); ctx.lineWidth = 1.6; ctx.strokeStyle = pal.trim; ctx.stroke();
    ctx.restore();
  };
  P.shield.vz_obsidian = (ctx, L, pal, atk) => {   // štít z jednoho velkého krystalu
    const s = sxOf(atk);
    ctx.save(); ctx.translate(s, 0);
    ctx.beginPath(); ctx.moveTo(10, -66); ctx.lineTo(21, -50); ctx.lineTo(18, -26); ctx.lineTo(10, -16); ctx.lineTo(1, -28); ctx.lineTo(-1, -50); ctx.closePath();
    const g = ctx.createLinearGradient(0, -66, 20, -16); g.addColorStop(0, '#5a4a6a'); g.addColorStop(0.5, '#1a141f'); g.addColorStop(1, '#0a080c'); fs(ctx, g, 2);
    ctx.save(); glowS(ctx, '#b25cff', 9); ctx.strokeStyle = '#d08aff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, -66); ctx.lineTo(10, -16); ctx.moveTo(-1, -50); ctx.lineTo(10, -42); ctx.lineTo(21, -50); ctx.moveTo(1, -28); ctx.lineTo(10, -34); ctx.lineTo(18, -26); ctx.stroke(); ctx.restore();
    ctx.restore();
  };
  P.shield.vz_feniks = (ctx, L, pal, atk) => {   // štít ve tvaru roztaženého ptačího křídla
    const s = sxOf(atk);
    ctx.save(); ctx.translate(s, 0);
    for (let k = 0; k < 6; k++) {
      ctx.beginPath(); ctx.moveTo(4, -60 + k * 2); ctx.quadraticCurveTo(18, -58 + k * 6, 14 + k * 0.6, -26 + k * 1.5); ctx.quadraticCurveTo(10, -40 + k * 3, 4, -58 + k * 2); ctx.closePath();
      fs(ctx, k % 2 ? '#ffb347' : '#e8501a', 1);
    }
    ctx.beginPath(); ctx.arc(7, -52, 5, 0, TAU); fs(ctx, '#ffd24a', 1.4);
    ctx.save(); glowS(ctx, '#ff6a2a', 10); star(ctx, 7, -52, 3.4, 1.4, 6); ctx.fillStyle = '#fff1a0'; ctx.fill(); ctx.restore();
    ctx.restore();
  };
  P.shield.vz_hvezdy = (ctx, L, pal, atk) => {   // stříbrný štít ve tvaru osmicípé hvězdy
    const x = 9 + sxOf(atk), y = -41;
    star(ctx, x, y, 15, 9, 8, -Math.PI / 2); fs(ctx, '#f4f8ff', 2);
    star(ctx, x, y, 9, 5, 8, -Math.PI / 2 + 0.2); fs(ctx, '#2a3a6a', 1.2);
    ctx.save(); glowS(ctx, '#bfe8ff', 10); star(ctx, x, y, 5, 2, 4); fs(ctx, '#ffe28a', 0.8); ctx.restore();
  };
  P.shield.vz_pan = (ctx, L, pal, atk) => {   // štít s tváří démona a zlatými rohy
    const x = 9 + sxOf(atk), y = -42;
    ctx.beginPath(); ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y - 14); ctx.lineTo(x + 11, y + 6); ctx.quadraticCurveTo(x, y + 20, x - 11, y + 6); ctx.closePath(); fs(ctx, '#2a0608', 2.2);
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 9, y - 13); ctx.quadraticCurveTo(x + d * 16, y - 22, x + d * 11, y - 28); ctx.quadraticCurveTo(x + d * 12, y - 20, x + d * 5, y - 13); ctx.closePath(); fs(ctx, '#c9962a', 1.2); }
    ctx.save(); glowS(ctx, '#ff3a3a', 10); ctx.fillStyle = '#ff4a2a';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 2, y - 6); ctx.lineTo(x + d * 8, y - 9); ctx.lineTo(x + d * 6, y - 4); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(x - 5, y + 4); for (let k = 0; k <= 5; k++) ctx.lineTo(x - 5 + k * 2, y + (k % 2 ? 8 : 4)); ctx.lineWidth = 1.2; ctx.strokeStyle = '#ffd24a'; ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y - 14); ctx.lineWidth = 2; ctx.strokeStyle = '#c9962a'; ctx.stroke();
  };

  /* =================== OZDOBY ZBROJE (vzadu / hruď / nad hlavou) =================== */
  function backFx(ctx, id, t, moving) {
    if (id === 'kamen') {   // tři levitující balvany obíhající kolem
      for (let k = 0; k < 3; k++) {
        const a = t * 0.9 + k * 2.09, x = -6 + Math.cos(a) * 20, y = -50 + Math.sin(a) * 6 + Math.sin(t * 2 + k) * 2;
        ctx.beginPath(); for (let j = 0; j < 6; j++) { const b = j / 6 * TAU; ctx.lineTo(x + Math.cos(b) * (3.4 + (j % 2)), y + Math.sin(b) * (3 + (j % 2) * 0.6)); } ctx.closePath(); fs(ctx, k % 2 ? '#8a8f86' : '#6a7068', 1.1);
        ctx.fillStyle = 'rgba(168,224,138,.55)'; ctx.beginPath(); ctx.arc(x, y + 6, 2, 0, TAU); ctx.fill();
      }
    } else if (id === 'boure') {   // bouřkový mráček nad ramenem a jiskřící oblouky
      ctx.save(); ctx.globalAlpha = 0.9;
      for (const [x, y, r] of [[-16, -84, 6], [-10, -88, 7], [-3, -85, 5.5]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#3a4a6a'; ctx.fill(); }
      ctx.restore();
      if (Math.sin(t * 7) > 0.2) {
        ctx.save(); glowS(ctx, '#fff36a', 10); ctx.strokeStyle = '#fff6a8'; ctx.lineWidth = 1.4;
        const s = Math.floor(t * 8) % 3;
        ctx.beginPath(); ctx.moveTo(-10, -80); ctx.lineTo(-13 + s, -72); ctx.lineTo(-9, -70); ctx.lineTo(-12 - s, -60); ctx.stroke(); ctx.restore();
      }
    } else if (id === 'obsidian') {   // vznášející se ostré střepy za zády
      for (let k = 0; k < 4; k++) {
        const x = -14 + k * 3 + Math.sin(t * 1.6 + k) * 1.5, y = -62 + k * 7 + Math.cos(t * 1.3 + k) * 2;
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6 + k * 0.4 + Math.sin(t + k) * 0.2);
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(2.4, 0); ctx.lineTo(0, 7); ctx.lineTo(-2.4, 0); ctx.closePath(); fs(ctx, '#1a141f', 1);
        ctx.strokeStyle = '#b25cff'; ctx.lineWidth = 0.7; ctx.stroke(); ctx.restore();
      }
    } else if (id === 'feniks') {   // ohnivá křídla z per
      const flap = moving ? Math.sin(t * 9) * 0.12 : Math.sin(t * 2) * 0.06;
      ctx.save(); glowS(ctx, '#ff6a2a', 14);
      for (const side of [0, 1]) {
        ctx.save(); ctx.translate(-4, -58); ctx.rotate(-0.35 - side * 0.25 - flap); ctx.globalAlpha = side ? 0.7 : 1;
        for (let k = 0; k < 6; k++) {
          const len = 30 - k * 3.2, a = -0.25 + k * 0.17;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-len * 0.5, -6 + k * 2, -Math.cos(a) * len, Math.sin(a) * len - 8);
          ctx.quadraticCurveTo(-len * 0.6, 2 + k * 3, 0, 3); ctx.closePath();
          fs(ctx, k % 2 ? '#ffb347' : '#ff5a1a', 0.8);
        }
        ctx.restore();
      }
      ctx.restore();
    } else if (id === 'hvezdy') {   // planoucí kruh se souhvězdím za zády
      ctx.save(); ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(-2, -56, 22, 0, TAU); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(191,232,255,.8)'; ctx.stroke();
      glowS(ctx, '#bfe8ff', 8);
      const pts = [];
      for (let k = 0; k < 7; k++) { const a = t * 0.4 + k * 0.9; pts.push([-2 + Math.cos(a) * 22, -56 + Math.sin(a) * 22]); }
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke();
      pts.forEach(p => { star(ctx, p[0], p[1], 2.2, 0.9, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); });
      ctx.restore();
    } else if (id === 'pan') {   // plášť z temných úponků a oko věže za zády
      ctx.save();
      for (let k = 0; k < 5; k++) {
        const ph = t * 2 + k;
        ctx.beginPath(); ctx.moveTo(-6 + k * 2, -64); ctx.bezierCurveTo(-14 - k * 2, -50, -8 + Math.sin(ph) * 6, -30, -16 - k * 2 + Math.sin(ph * 1.3) * 5, -8);
        ctx.lineCap = 'round'; ctx.lineWidth = 4 - k * 0.5; ctx.strokeStyle = k % 2 ? '#1a0406' : '#3a0a0e'; ctx.stroke();
      }
      glowS(ctx, '#ff3a3a', 12);
      ctx.beginPath(); ctx.ellipse(-14, -78, 6, 3.6, 0, 0, TAU); fs(ctx, '#2a0608', 1.2);
      ctx.beginPath(); ctx.arc(-14, -78, 2.2, 0, TAU); ctx.fillStyle = '#ff3a3a'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(-14, -78, 0.7, 2, 0, 0, TAU); ctx.fillStyle = '#ffd24a'; ctx.fill();
      ctx.restore();
    }
  }
  function chestFx(ctx, id, t) {
    const x = 1, y = -40;
    ctx.save();
    if (id === 'kamen') { rr(ctx, x - 5, y - 6, 10, 12, 1.5); fs(ctx, '#6a7068', 1.2); glowS(ctx, '#a8e08a', 6); ctx.strokeStyle = '#a8e08a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.stroke(); }
    else if (id === 'boure') { glowS(ctx, '#fff36a', 8); ctx.beginPath(); ctx.moveTo(x + 2, y - 7); ctx.lineTo(x - 3, y + 1); ctx.lineTo(x, y + 1); ctx.lineTo(x - 2, y + 7); ctx.lineTo(x + 4, y - 2); ctx.lineTo(x + 1, y - 2); ctx.closePath(); fs(ctx, '#ffe14a', 0.8); }
    else if (id === 'obsidian') { ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 4, y); ctx.closePath(); fs(ctx, '#1a141f', 1.1); glowS(ctx, '#b25cff', 8); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fillStyle = '#d08aff'; ctx.fill(); }
    else if (id === 'feniks') { glowS(ctx, '#ff6a2a', 8); ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.quadraticCurveTo(x - 8, y - 2, x - 6, y - 6); ctx.quadraticCurveTo(x - 2, y - 2, x, y - 7); ctx.quadraticCurveTo(x + 2, y - 2, x + 6, y - 6); ctx.quadraticCurveTo(x + 8, y - 2, x, y + 6); ctx.closePath(); fs(ctx, '#ffb347', 0.9); }
    else if (id === 'hvezdy') { glowS(ctx, '#bfe8ff', 8); star(ctx, x, y, 6, 2.4, 4); fs(ctx, '#f4f8ff', 0.9); star(ctx, x, y, 2.4, 1, 4, 0); ctx.fillStyle = '#7fd3ff'; ctx.fill(); }
    else if (id === 'pan') { ctx.beginPath(); ctx.ellipse(x, y, 6, 3.6, 0, 0, TAU); fs(ctx, '#c9962a', 1.1); glowS(ctx, '#ff3a3a', 8); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fillStyle = '#ff3a3a'; ctx.fill(); }
    ctx.restore();
  }
  const drawPrev = A.drawFeatures;
  A.drawFeatures = (ctx, L, pal, st, layer, moving, w) => {
    const F = pal.feat;
    if (F && F.vz) {
      const t = (st && st.t) || 0;
      if (layer === 'back') backFx(ctx, F.vz, t, moving);
      if (layer === 'chest') chestFx(ctx, F.vz, t);
      const F2 = Object.assign({}, F, { vz: null });
      return drawPrev(ctx, L, Object.assign({}, pal, { feat: F2 }), st, layer, moving, w);
    }
    return drawPrev(ctx, L, pal, st, layer, moving, w);
  };

  /* =================== MEČE (rukojeť v 0, čepel ve směru +y) =================== */
  const handle = (ctx, c, len) => { rr(ctx, -1.9, -len, 3.8, len + 2, 1.2); fs(ctx, c.grip || '#2a1a10', 1.2); };
  Object.assign(M, {
    // kamenný obouruční meč s výřezem pro zářící runu
    vz_kamen(ctx, c) {
      handle(ctx, c, 11);
      ctx.beginPath(); ctx.moveTo(-3, -13); ctx.lineTo(3, -13); ctx.lineTo(2, -10); ctx.lineTo(-2, -10); ctx.closePath(); fs(ctx, c.guard, 1.1);
      ctx.beginPath(); ctx.moveTo(-5.6, 6); ctx.lineTo(-5.2, 44); ctx.lineTo(-2, 52); ctx.lineTo(2, 52); ctx.lineTo(5.2, 44); ctx.lineTo(5.6, 6); ctx.closePath(); fs(ctx, BF(ctx, c, -5.6, 5.6), 1.8);
      ctx.strokeStyle = shade(c.dark, -0.2); ctx.lineWidth = 0.7; for (const y of [16, 28, 40]) { ctx.beginPath(); ctx.moveTo(-5.4, y); ctx.lineTo(5.4, y + 1.5); ctx.stroke(); }
      rr(ctx, -1.6, 10, 3.2, 30, 1); ctx.fillStyle = OUT; ctx.fill();
      ctx.save(); glowS(ctx, c.guard, 8); rr(ctx, -0.8, 12, 1.6, 26, 0.8); ctx.fillStyle = c.guard; ctx.fill(); ctx.restore();
      rr(ctx, -9, 2, 18, 4.4, 1.4); fs(ctx, c.dark, 1.3);
    },
    // čepel ve tvaru blesku (klikatá)
    vz_boure(ctx, c) {
      handle(ctx, c, 10);
      ctx.save(); GO(ctx, c, 14);
      ctx.beginPath(); ctx.moveTo(-3.4, 6); ctx.lineTo(3.6, 6); ctx.lineTo(1.2, 20); ctx.lineTo(5.6, 20); ctx.lineTo(0.4, 36); ctx.lineTo(4, 36); ctx.lineTo(-1.2, 56); ctx.lineTo(-0.4, 39); ctx.lineTo(-4.4, 39); ctx.lineTo(-0.8, 23); ctx.lineTo(-5.2, 23); ctx.closePath();
      fs(ctx, BF(ctx, c, -5, 5), 1.6); ctx.restore();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(d * 9, 1); ctx.lineTo(d * 6, 5); ctx.lineTo(d * 11, 6); ctx.lineTo(0, 7); ctx.closePath(); fs(ctx, c.guard, 1.1); }
      if (c.gem || c.glow) gem(ctx, 0, -12, 1.8, c.glow || c.gem);
    },
    // zubatá čepel z obsidiánu (nepravidelné střepy)
    vz_obsidian(ctx, c) {
      handle(ctx, c, 10);
      ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-6.4, 14); ctx.lineTo(-3.6, 18); ctx.lineTo(-6, 27); ctx.lineTo(-3, 31); ctx.lineTo(-5, 41); ctx.lineTo(0, 55); ctx.lineTo(4.6, 40); ctx.lineTo(2.4, 35); ctx.lineTo(5.6, 26); ctx.lineTo(3, 21); ctx.lineTo(5.4, 12); ctx.lineTo(4, 6); ctx.closePath();
      const g = ctx.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#5a4a6a'); g.addColorStop(0.5, c.blade || '#2a2230'); g.addColorStop(1, '#0a080c'); fs(ctx, g, 1.7);
      ctx.save(); glowS(ctx, c.glow || '#b25cff', 10); ctx.strokeStyle = c.edge || '#d08aff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(-1, 22); ctx.lineTo(1, 34); ctx.lineTo(0, 50); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-8, 3); ctx.lineTo(0, 0); ctx.lineTo(8, 3); ctx.lineTo(0, 7); ctx.closePath(); fs(ctx, c.guard, 1.2);
    },
    // zahnutá čepel ve tvaru pera s plamenem
    vz_feniks(ctx, c) {
      handle(ctx, c, 10);
      ctx.save(); GO(ctx, c, 14);
      ctx.beginPath(); ctx.moveTo(-3, 6); ctx.quadraticCurveTo(-9, 28, -2, 54); ctx.quadraticCurveTo(8, 34, 4, 6); ctx.closePath(); fs(ctx, BF(ctx, c, -6, 6), 1.7);
      ctx.strokeStyle = shade(c.guard || '#ffd24a', -0.1); ctx.lineWidth = 0.8;
      for (let y = 12; y < 48; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(-4.6 + y * 0.04, y + 3); ctx.moveTo(0, y); ctx.lineTo(3.6 - y * 0.03, y + 3); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, 6); ctx.quadraticCurveTo(-2, 30, -1.8, 52); ctx.lineWidth = 1; ctx.strokeStyle = '#fff1a0'; ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.quadraticCurveTo(-10, 2, -8, -4); ctx.quadraticCurveTo(-2, 2, 0, 1); ctx.quadraticCurveTo(2, 2, 8, -4); ctx.quadraticCurveTo(10, 2, 0, 7); ctx.closePath(); fs(ctx, c.guard, 1.1);
    },
    // srpkovitá hvězdná čepel s hvězdou na hrotu
    vz_hvezdy(ctx, c) {
      handle(ctx, c, 10);
      ctx.save(); GO(ctx, c, 12);
      ctx.beginPath(); ctx.moveTo(-3.6, 6); ctx.lineTo(-3, 42); ctx.quadraticCurveTo(-1, 48, 0, 46); ctx.quadraticCurveTo(1, 48, 3, 42); ctx.lineTo(3.6, 6); ctx.closePath(); fs(ctx, BF(ctx, c, -3.6, 3.6), 1.6);
      star(ctx, 0, 50, 6, 2.4, 4, 0); fs(ctx, '#ffe28a', 1.1); ctx.restore();
      for (let y = 12; y < 40; y += 8) { ctx.save(); glowS(ctx, '#bfe8ff', 5); star(ctx, 0, y, 1.6, 0.6, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore(); }
      ctx.beginPath(); ctx.arc(0, 4, 7, 0.15, Math.PI - 0.15); ctx.lineWidth = 2.4; ctx.strokeStyle = c.guard; ctx.stroke();
      gem(ctx, 0, -12, 1.8, c.gem || '#7fd3ff');
    },
    // černá pilovitá čepel démona s okem ve středu záštity
    vz_pan(ctx, c) {
      handle(ctx, c, 11);
      ctx.save(); GO(ctx, c, 16);
      ctx.beginPath(); ctx.moveTo(-4.6, 6);
      for (let y = 8; y <= 46; y += 5) { ctx.lineTo(-5.2, y); ctx.lineTo(-3.2, y + 2.5); }
      ctx.lineTo(0, 58); ctx.lineTo(4.6, 46); ctx.lineTo(4.6, 6); ctx.closePath();
      fs(ctx, BF(ctx, c, -5, 5), 1.7); ctx.restore();
      ctx.save(); glowS(ctx, '#ff3a3a', 8); ctx.beginPath(); ctx.moveTo(1.6, 8); ctx.lineTo(1.6, 46); ctx.lineWidth = 1.2; ctx.strokeStyle = '#ff5a3a'; ctx.stroke(); ctx.restore();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(d * 8, 6, d * 12, 0, d * 10, -6); ctx.bezierCurveTo(d * 9, 0, d * 5, 2, 0, 2); ctx.closePath(); fs(ctx, c.guard || '#3a0a0e', 1.2); }
      ctx.beginPath(); ctx.ellipse(0, 4, 3.4, 2.2, 0, 0, TAU); fs(ctx, '#c9962a', 1); ctx.save(); glowS(ctx, '#ff3a3a', 6); ctx.beginPath(); ctx.arc(0, 4, 1.3, 0, TAU); ctx.fillStyle = '#ff2a2a'; ctx.fill(); ctx.restore();
    }
  });

  /* =================== KOPÍ (násada podél +x, hrot kolem x 46–76) =================== */
  Object.assign(PO, {
    vz_kamen(ctx, c) {   // kamenná palice s bodcem (kladivové kopí)
      rr(ctx, 44, -7, 14, 14, 2); fs(ctx, BF(ctx, c, 44, 58), 1.6);
      ctx.strokeStyle = shade(c.dark, -0.2); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(51, -7); ctx.lineTo(51, 7); ctx.moveTo(44, 0); ctx.lineTo(58, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(58, -3); ctx.lineTo(74, 0); ctx.lineTo(58, 3); ctx.closePath(); fs(ctx, BF(ctx, c, 58, 74), 1.3);
      ctx.save(); glowS(ctx, c.guard, 8); ctx.beginPath(); ctx.arc(51, 0, 2.2, 0, TAU); ctx.fillStyle = c.guard; ctx.fill(); ctx.restore();
    },
    vz_boure(ctx, c) {   // trojzubec, jehož hroty jsou blesky
      ctx.save(); GO(ctx, c, 14);
      for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(48, d * 5 - 1.6); ctx.lineTo(58, d * 6 + 1); ctx.lineTo(56, d * 6 - 1.6); ctx.lineTo(70 + (d ? -4 : 4), d * 8); ctx.lineTo(57, d * 6 + 2.6); ctx.lineTo(59, d * 6 + 0.4); ctx.lineTo(48, d * 5 + 1.6); ctx.closePath(); fs(ctx, '#ffe14a', 0.9); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(46, -7); ctx.lineTo(49, -7); ctx.lineTo(49, 7); ctx.lineTo(46, 7); ctx.closePath(); fs(ctx, c.guard || '#ffe14a', 1.1);
    },
    vz_obsidian(ctx, c) {   // dlouhý krystalový hrot s vedlejšími střepy
      ctx.beginPath(); ctx.moveTo(46, -4); ctx.lineTo(80, 0); ctx.lineTo(46, 4); ctx.lineTo(50, 0); ctx.closePath();
      const g = ctx.createLinearGradient(46, -4, 46, 4); g.addColorStop(0, '#5a4a6a'); g.addColorStop(1, '#0a080c'); fs(ctx, g, 1.5);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(50, d * 2); ctx.lineTo(60, d * 10); ctx.lineTo(56, d * 3); ctx.closePath(); fs(ctx, '#1a141f', 1); }
      ctx.save(); glowS(ctx, '#b25cff', 10); ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(76, 0); ctx.lineWidth = 1; ctx.strokeStyle = '#d08aff'; ctx.stroke(); ctx.restore();
    },
    vz_feniks(ctx, c) {   // hrot jako ptačí hlava s rozevřenými křídly
      ctx.save(); GO(ctx, c, 12);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(50, 0); ctx.quadraticCurveTo(52, d * 12, 44, d * 16); ctx.quadraticCurveTo(50, d * 8, 46, d * 6); ctx.closePath(); fs(ctx, d < 0 ? '#ffb347' : '#e8501a', 1); }
      ctx.beginPath(); ctx.moveTo(48, -4); ctx.quadraticCurveTo(64, -5, 78, 0); ctx.quadraticCurveTo(64, 5, 48, 4); ctx.closePath(); fs(ctx, BF(ctx, c, 48, 78), 1.4);
      ctx.restore();
      ctx.beginPath(); ctx.arc(52, -1, 1.2, 0, TAU); ctx.fillStyle = '#fff1a0'; ctx.fill();
    },
    vz_hvezdy(ctx, c) {   // štíhlý hrot zakončený zářící hvězdou
      ctx.beginPath(); ctx.moveTo(46, -2.4); ctx.lineTo(66, -1.2); ctx.lineTo(66, 1.2); ctx.lineTo(46, 2.4); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 66), 1.3);
      ctx.save(); glowS(ctx, '#bfe8ff', 12); star(ctx, 72, 0, 8, 3, 4, 0); fs(ctx, '#ffe28a', 1.1); star(ctx, 72, 0, 3, 1.2, 4, Math.PI / 4); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(48, 0, 4, 0, TAU); ctx.lineWidth = 1.6; ctx.strokeStyle = c.guard; ctx.stroke();
    },
    vz_pan(ctx, c) {   // kopí-kosa: dlouhý černý hrot a zakřivené ostří
      ctx.save(); GO(ctx, c, 14);
      ctx.beginPath(); ctx.moveTo(46, -3); ctx.lineTo(78, 0); ctx.lineTo(46, 3); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 78), 1.4);
      ctx.beginPath(); ctx.moveTo(52, -2); ctx.bezierCurveTo(56, -16, 68, -20, 74, -14); ctx.bezierCurveTo(66, -15, 60, -10, 58, -2); ctx.closePath(); fs(ctx, '#1a0406', 1.3);
      ctx.restore();
      ctx.save(); glowS(ctx, '#ff3a3a', 8); ctx.beginPath(); ctx.moveTo(56, -6); ctx.bezierCurveTo(60, -14, 66, -16, 72, -14); ctx.lineWidth = 0.9; ctx.strokeStyle = '#ff5a3a'; ctx.stroke(); ctx.restore();
      gem(ctx, 47, 0, 2, '#ff2a2a');
    }
  });
  // samurajové mohou nosit i věžové meče a kopí (jsou to meče a kopí)
  if (GameData.SAM_OK) { ['vz_kamen', 'vz_boure', 'vz_obsidian', 'vz_feniks', 'vz_hvezdy', 'vz_pan'].forEach(id => { GameData.SAM_OK.melee.push(id); GameData.SAM_OK.pole.push(id); }); }

  /* =================== LUKY =================== */
  Object.assign(A.BOW_REF, { vz_kamen: [34, 30], vz_boure: [36, 34], vz_obsidian: [37, 34], vz_feniks: [38, 36], vz_hvezdy: [36, 33], vz_pan: [38, 35] });
  Object.assign(A.bowDecor, {
    vz_kamen(ctx, at, c) { for (const k of [0.12, 0.3, 0.7, 0.88]) { const p = at(k); rr(ctx, p[0] - 4, p[1] - 2.6, 6, 5.2, 1); fs(ctx, '#6a7068', 0.9); } const m = at(0.5); ctx.save(); glowS(ctx, '#a8e08a', 8); ctx.beginPath(); ctx.arc(m[0] - 2, m[1], 2.2, 0, TAU); ctx.fillStyle = '#a8e08a'; ctx.fill(); ctx.restore(); },
    vz_boure(ctx, at, c, T, B) { ctx.save(); glowS(ctx, '#fff36a', 8); ctx.strokeStyle = '#fff6a8'; ctx.lineWidth = 1.1; for (const k of [0.15, 0.35, 0.65, 0.85]) { const p = at(k); ctx.beginPath(); ctx.moveTo(p[0] - 1, p[1] - 3); ctx.lineTo(p[0] - 5, p[1]); ctx.lineTo(p[0] - 2, p[1]); ctx.lineTo(p[0] - 6, p[1] + 3); ctx.stroke(); } for (const p of [T, B]) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.4, 0, TAU); ctx.fillStyle = '#ffe14a'; ctx.fill(); } ctx.restore(); },
    vz_obsidian(ctx, at) { for (let k = 0.08; k < 0.95; k += 0.12) { if (Math.abs(k - 0.5) < 0.1) continue; const p = at(k); ctx.beginPath(); ctx.moveTo(p[0], p[1] - 2); ctx.lineTo(p[0] - 8, p[1] + (k < 0.5 ? -3 : 3)); ctx.lineTo(p[0], p[1] + 2); ctx.closePath(); fs(ctx, '#1a141f', 0.8); ctx.strokeStyle = '#b25cff'; ctx.lineWidth = 0.6; ctx.stroke(); } },
    vz_feniks(ctx, at, c, T, B) { ctx.save(); glowS(ctx, '#ff6a2a', 10); for (const [p, d] of [[T, -1], [B, 1]]) { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(p[0] - 6 - k * 2, p[1] + d * (2 + k * 2), p[0] - 9 - k * 3, p[1] + d * (6 + k * 3)); ctx.lineWidth = 2.2 - k * 0.5; ctx.strokeStyle = k % 2 ? '#ffb347' : '#ff5a1a'; ctx.stroke(); } } ctx.restore(); },
    vz_hvezdy(ctx, at, c, T, B) { ctx.save(); glowS(ctx, '#bfe8ff', 8); for (const p of [T, B]) { star(ctx, p[0], p[1], 4.4, 1.8, 4, 0); fs(ctx, '#ffe28a', 0.8); } for (const k of [0.25, 0.75]) { const p = at(k); star(ctx, p[0] - 1, p[1], 2, 0.8, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); } ctx.restore(); },
    vz_pan(ctx, at, c, T, B) { for (const [p, d] of [[T, -1], [B, 1]]) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[0] - 4, p[1] + d * -6, p[0] - 10, p[1] + d * -4, p[0] - 9, p[1] + d * 3); ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#c9962a'; ctx.stroke(); } const m = at(0.5); ctx.beginPath(); ctx.ellipse(m[0] - 2, m[1], 3, 4.4, 0, 0, TAU); fs(ctx, '#2a0608', 1); ctx.save(); glowS(ctx, '#ff3a3a', 8); ctx.beginPath(); ctx.arc(m[0] - 2, m[1], 1.5, 0, TAU); ctx.fillStyle = '#ff3a3a'; ctx.fill(); ctx.restore(); }
  });

  /* =================== HOLE MÁGŮ =================== */
  const prevHead = A.staffHead;
  A.staffHead = (ctx, id, y, mc, trim, raise, Mo) => {
    raise = raise || 0;
    const glow = (Mo && Mo.glow) || mc;
    const t = performance.now() / 1000;
    if (id === 'vz_kamen') {   // vznášející se runová kostka nad kamennými drápy
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 1.4, y + 8); ctx.lineTo(d * 6, y + 3); ctx.lineTo(d * 4, y - 1); ctx.lineWidth = 2.4; ctx.strokeStyle = '#6a7068'; ctx.stroke(); }
      const yy = y - 6 + Math.sin(t * 2) * 1.5;
      ctx.save(); ctx.translate(0, yy); ctx.rotate(t * 0.8); rr(ctx, -4.6, -4.6, 9.2, 9.2, 1.2); fs(ctx, '#8a8f86', 1.3);
      glowS(ctx, glow, 8 + raise * 10); ctx.strokeStyle = glow; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 3); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke(); ctx.restore();
    } else if (id === 'vz_boure') {   // bouřkový mrak s bleskem
      for (const [x, yy, r] of [[-4, y - 4, 4.6], [3, y - 6, 5.4], [6, y - 1, 3.6], [-1, y, 4]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, TAU); fs(ctx, '#4a5a7a', 1); }
      ctx.save(); glowS(ctx, '#fff36a', 10 + raise * 10); ctx.beginPath(); ctx.moveTo(1, y); ctx.lineTo(-2, y + 7); ctx.lineTo(1, y + 7); ctx.lineTo(-1, y + 13); ctx.lineTo(4, y + 5); ctx.lineTo(1, y + 5); ctx.closePath(); fs(ctx, '#ffe14a', 0.8); ctx.restore();
    } else if (id === 'vz_obsidian') {   // shluk černých krystalů s fialovým jádrem
      ctx.save(); glowS(ctx, glow, 10 + raise * 12); ctx.beginPath(); ctx.arc(0, y - 2, 3, 0, TAU); ctx.fillStyle = glow; ctx.fill(); ctx.restore();
      for (const [x, h, a] of [[-4, 10, -0.4], [0, 14, 0], [4, 11, 0.4], [-2, 7, -0.9], [3, 7, 0.9]]) { ctx.save(); ctx.translate(x * 0.6, y + 4); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(0, -h); ctx.lineTo(2, 0); ctx.closePath(); fs(ctx, '#1a141f', 1); ctx.strokeStyle = '#b25cff'; ctx.lineWidth = 0.5; ctx.stroke(); ctx.restore(); }
    } else if (id === 'vz_feniks') {   // hlava fénixe s ohnivým chocholem
      ctx.save(); glowS(ctx, '#ff6a2a', 10 + raise * 12);
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-2, y - 4); ctx.quadraticCurveTo(-6 - k * 2, y - 10 - k * 2, -3 - k * 3, y - 16 - k); ctx.lineWidth = 2.4 - k * 0.5; ctx.strokeStyle = k % 2 ? '#ffb347' : '#ff5a1a'; ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, y - 2, 5, 6, 0, 0, TAU); fs(ctx, '#e8501a', 1.3);
      ctx.beginPath(); ctx.moveTo(4, y - 3); ctx.lineTo(10, y - 1); ctx.lineTo(4, y + 1); ctx.closePath(); fs(ctx, '#ffd24a', 1);
      ctx.beginPath(); ctx.arc(1.8, y - 4, 1, 0, TAU); ctx.fillStyle = '#fff1a0'; ctx.fill();
    } else if (id === 'vz_hvezdy') {   // prstenec se souhvězdím a hvězdou uprostřed
      ctx.beginPath(); ctx.arc(0, y - 2, 9, 0, TAU); ctx.lineWidth = 1.6; ctx.strokeStyle = '#dfe9f5'; ctx.stroke();
      ctx.save(); glowS(ctx, '#bfe8ff', 10 + raise * 12); star(ctx, 0, y - 2, 5.4, 2.2, 4, t); fs(ctx, '#ffe28a', 0.9);
      for (let k = 0; k < 4; k++) { const a = t * 1.5 + k * Math.PI / 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 9, y - 2 + Math.sin(a) * 9, 1.3, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); }
      ctx.restore();
    } else if (id === 'vz_pan') {   // temná věžička s planoucím okem na vrcholu
      ctx.beginPath(); ctx.moveTo(-4, y + 8); ctx.lineTo(-3, y - 8); ctx.lineTo(0, y - 14); ctx.lineTo(3, y - 8); ctx.lineTo(4, y + 8); ctx.closePath(); fs(ctx, '#2a0608', 1.3);
      ctx.fillStyle = '#c9962a'; for (const yy of [y + 2, y - 4]) ctx.fillRect(-3.6, yy, 7.2, 1);
      ctx.save(); glowS(ctx, '#ff3a3a', 10 + raise * 14); ctx.beginPath(); ctx.ellipse(0, y - 4, 2.6, 1.6, 0, 0, TAU); ctx.fillStyle = '#ff3a3a'; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, y - 4, 0.6, 1.4, 0, 0, TAU); ctx.fillStyle = '#ffd24a'; ctx.fill();
    } else return prevHead(ctx, id, y, mc, trim, raise, Mo);
  };
})();
