/* =========================================================================
   KOVÁRNA ZBROJÍ (ArmorForge) – parametrická knihovna dílů zbroje.
   Z kombinací dílů se skládají přilby, štíty a ozdoby zbroje pro skiny
   rytířů, samurajů a vikingů (pěšáci, lučištníci, kopiníci, jezdci, mágové,
   velitelé). Datový soubor načtený PO tomto souboru jen registruje kombinace:

     ArmorForge.helmet('af_h_xyz', { shell:'great', crest:'horn_bull', visor:'grill', colors:{ metal:'#..' } });
     ArmorForge.shield('af_s_xyz', { shape:'kite', emblem:'lion', pattern:'quarters', colors:{ field:'#..', emblem:'#..' } });
     skin.feat = { af: { back:'cape', chest:'scale', shoulder:'spiked', aura:'embers', glow:'#..', fur:'#..', accent:'#..' } }

   Souřadnice postavy: hledí +x, chodidla y=0, střed obličeje ~ (1.5,-63),
   trup y -54..-32, štít x 0..21 y -64..-20.
   ========================================================================= */
(function () {
  const A = window.Art, P = window.ArtParts;
  if (!A || !P) return;
  P.helmet = P.helmet || {}; P.shield = P.shield || {};
  const TAU = Math.PI * 2, PI = Math.PI, OUT = A.OUT || '#121419';
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  const isHex = s => typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);
  const hx = (s, d) => (isHex(s) ? s : d);
  const shade = (h, a) => A.shade(hx(h, '#808080'), a);
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
  const glowS = (ctx, col, b) => { ctx.shadowColor = col; ctx.shadowBlur = b; };
  const noGlow = ctx => { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; };
  const stroke = (ctx, col, lw) => { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
  const oStroke = (ctx, col, lw) => { stroke(ctx, OUT, lw + 2.2); stroke(ctx, col, lw); };
  const gem = (ctx, x, y, r, col) => {
    if (A.gemDot) return A.gemDot(ctx, x, y, r, col);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); fs(ctx, col, 0.9);
  };
  const star = (ctx, x, y, r1, r2, n, rot) => { ctx.beginPath(); for (let k = 0; k < n * 2; k++) { const a = (rot == null ? -PI / 2 : rot) + k * PI / n, r = k % 2 ? r2 : r1; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); };
  const lg = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const s of stops) g.addColorStop(s[0], s[1]); return g; };
  const metalG = (ctx, c, x0, y0, x1, y1, m) => lg(ctx, x0, y0, x1, y1, [[0, shade(m || c.metal, 0.42)], [0.45, m || c.metal], [1, m ? shade(m, -0.38) : c.metalDark]]);
  const goldG = (ctx, x0, y0, x1, y1, col) => lg(ctx, x0, y0, x1, y1, [[0, shade(col, 0.5)], [0.5, col], [1, shade(col, -0.4)]]);
  const fsEO = (ctx, fill, lw) => { ctx.fillStyle = fill; ctx.fill('evenodd'); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.stroke(); } };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

  /* tlustá zúžená trubice podél křivky (rohy, parohy, ocasy) */
  function tube(ctx, f, r0, r1, col, n, rings) {
    n = n || 16;
    const pts = []; for (let i = 0; i <= n; i++) { const s = i / n; pts.push([f(s), r0 + (r1 - r0) * s]); }
    ctx.fillStyle = OUT; for (const [p, r] of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], r + 1.05, 0, TAU); ctx.fill(); }
    for (const [p, r] of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
    // světlo
    ctx.beginPath(); pts.forEach(([p, r], i) => { const x = p[0] - r * 0.35, y = p[1] - r * 0.4; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineWidth = Math.max(0.5, r0 * 0.45); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineCap = 'round'; ctx.stroke();
    if (rings) { ctx.strokeStyle = shade(col, -0.4); ctx.lineWidth = 0.7; for (let i = 2; i < n - 2; i += rings) { const [p, r] = pts[i], q = pts[i + 1][0]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; ctx.beginPath(); ctx.moveTo(p[0] - dy / L * r, p[1] + dx / L * r); ctx.lineTo(p[0] + dy / L * r, p[1] - dx / L * r); ctx.stroke(); } }
  }
  const qb = (p0, p1, p2) => s => { const u = 1 - s; return [u * u * p0[0] + 2 * u * s * p1[0] + s * s * p2[0], u * u * p0[1] + 2 * u * s * p1[1] + s * s * p2[1]]; };
  const cb = (p0, p1, p2, p3) => s => { const u = 1 - s; return [u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0], u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1]]; };

  /* pero (podél +x po otočení o ang) */
  function feather(ctx, x, y, ang, len, wid, col, lw) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(len * 0.25, -wid, len * 0.75, -wid * 1.05, len, -wid * 0.1);
    ctx.bezierCurveTo(len * 0.8, wid * 0.8, len * 0.3, wid * 0.85, 0, 0); ctx.closePath();
    fs(ctx, col, lw == null ? 1 : lw);
    ctx.beginPath(); ctx.moveTo(0.6, 0); ctx.quadraticCurveTo(len * 0.5, -wid * 0.08, len * 0.95, -wid * 0.1); stroke(ctx, shade(col, -0.4), 0.6);
    ctx.strokeStyle = shade(col, 0.3); ctx.lineWidth = 0.5;
    for (let k = 0.3; k < 0.9; k += 0.2) { ctx.beginPath(); ctx.moveTo(len * k, -wid * 0.05); ctx.lineTo(len * (k + 0.08), -wid * 0.75); ctx.stroke(); }
    ctx.restore();
  }
  /* plamínek (špička nahoru) */
  function flameShape(ctx, x, y, w, h, lean) {
    ctx.beginPath(); ctx.moveTo(x - w, y);
    ctx.bezierCurveTo(x - w * 1.1, y - h * 0.45, x - w * 0.2 + lean * 0.4, y - h * 0.6, x + lean, y - h);
    ctx.bezierCurveTo(x + w * 0.4 + lean * 0.3, y - h * 0.55, x + w * 1.15, y - h * 0.4, x + w, y);
    ctx.quadraticCurveTo(x, y + w * 0.6, x - w, y); ctx.closePath();
  }

  /* barvy: paleta skinu + ozdoby af + přepisy z registrace */
  function colors(pal, over) {
    const af = (pal.feat && pal.feat.af) || {};
    const metal = hx(pal.metal, '#9aa3b0'), tunic = hx(pal.tunic, '#2f62b8');
    const eyes = hx(pal.eyes, '#1b1b1b');
    const c = {
      metal, metalDark: hx(pal.metalDark, shade(metal, -0.4)), trim: hx(pal.trim, '#e8b84a'),
      tunic, tunicDark: hx(pal.tunicDark, shade(tunic, -0.35)), cape: hx(pal.cape, tunic), plume: hx(pal.plume, hx(pal.cape, '#d6243a')),
      leather: hx(pal.leather, '#7a5232'), leatherDark: hx(pal.leatherDark, '#4a3020'), skin: hx(pal.skin, '#f0c8a0'),
      fur: hx(af.fur, hx(pal.fur, '#8a6f52')), glow: hx(af.glow, eyes !== '#1b1b1b' ? eyes : hx(pal.glow, '#7fe8ff')),
      accent: hx(af.accent, hx(pal.trim, '#e8b84a')), lace: hx(pal.lace, tunic), mask: hx(pal.mask, '#9b2a22'),
      bone: '#efe6cf', hood: hx(pal.hood, hx(pal.robe, tunic)), wing: hx(af.wing, hx(pal.wing, '#f4f1ea')),
      sashi: hx(pal.sashi, tunic), mon: hx(pal.mon, hx(pal.trim, '#e8b84a'))
    };
    if (over) for (const k in over) if (isHex(over[k])) c[k] = over[k];
    if (over && isHex(over.metal) && !isHex(over.metalDark)) c.metalDark = shade(over.metal, -0.42);
    return c;
  }

  /* =====================================================================
     PŘILBY – SKOŘEPINY  { top: y temene, closed: zakrývá obličej, eye:[x,y] průzor }
     ===================================================================== */
  const SHELL = {};
  // velká hrncová přilba s křížovou výztuhou
  SHELL.great = { top: -77, closed: true, eye: [7.4, -66.2], draw(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-8.4, -53); ctx.lineTo(-9, -72); ctx.quadraticCurveTo(-8.6, -77.4, 1.5, -77.6); ctx.quadraticCurveTo(11.6, -77.4, 12.2, -72); ctx.lineTo(12.6, -53.6); ctx.quadraticCurveTo(2, -51, -8.4, -53); ctx.closePath();
    fs(ctx, metalG(ctx, c, -9, -77, 12, -53), 2);
    ctx.beginPath(); ctx.moveTo(-8.8, -71.4); ctx.quadraticCurveTo(1.6, -73.6, 12.1, -71.4); stroke(ctx, c.metalDark, 1.2);
    rr(ctx, 8.4, -71, 2.8, 17, 1); fs(ctx, c.trim, 1);
    rr(ctx, -8.6, -59.5, 21.2, 2.4, 1); fs(ctx, c.trim, 1);
    ctx.fillStyle = OUT; for (let x = -6.5; x < 8; x += 3.4) { ctx.beginPath(); ctx.arc(x, -58.3, 0.55, 0, TAU); ctx.fill(); }
    if (!o.full) {
      rr(ctx, 2.6, -67.4, 10, 2.4, 1); ctx.fillStyle = '#0b0d12'; ctx.fill();
      ctx.fillStyle = '#0b0d12'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(4.4 + i * 1.8, -63 + j * 1.8, 0.55, 0, TAU); ctx.fill(); }
    }
    ctx.beginPath(); ctx.moveTo(-6, -75); ctx.quadraticCurveTo(1, -76.6, 6, -75.4); stroke(ctx, 'rgba(255,255,255,.45)', 0.9);
  } };
  // barbuta s otvorem ve tvaru T
  SHELL.barbute = { top: -79, closed: false, eye: [6.6, -63.2], draw(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-8.6, -53.5); ctx.quadraticCurveTo(-11.2, -70, -6, -76.4); ctx.quadraticCurveTo(1, -81.4, 8, -77); ctx.quadraticCurveTo(12.6, -72, 12.2, -62); ctx.lineTo(12.4, -53.6); ctx.quadraticCurveTo(2, -51.4, -8.6, -53.5); ctx.closePath();
    if (!o.full) { ctx.moveTo(3.6, -65.8); ctx.lineTo(12.8, -65.8); ctx.lineTo(12.8, -61); ctx.lineTo(9.8, -61); ctx.lineTo(9.8, -53.2); ctx.lineTo(6.8, -53.2); ctx.lineTo(6.8, -61); ctx.lineTo(3.6, -61); ctx.closePath(); }
    fsEO(ctx, metalG(ctx, c, -9, -80, 12, -53), 2);
    if (!o.full) { ctx.beginPath(); ctx.moveTo(3.6, -61); ctx.lineTo(3.6, -65.8); ctx.lineTo(12.8, -65.8); stroke(ctx, 'rgba(0,0,0,.35)', 1.6); }
    ctx.beginPath(); ctx.moveTo(-3, -79); ctx.quadraticCurveTo(-9, -72, -7.6, -56); stroke(ctx, 'rgba(255,255,255,.4)', 1);
    ctx.beginPath(); ctx.moveTo(1.5, -80); ctx.quadraticCurveTo(10, -78, 11.6, -67); stroke(ctx, c.metalDark, 0.9);
  } };
  // armet se špičatým hledím a rondelou vzadu
  SHELL.armet = { top: -79, closed: true, eye: [8.6, -66.6], draw(ctx, c, o) {
    ctx.beginPath(); ctx.arc(-8.6, -56, 3.4, 0, TAU); fs(ctx, c.trim, 1.3); ctx.beginPath(); ctx.arc(-8.6, -56, 1.2, 0, TAU); ctx.fillStyle = shade(c.trim, -0.4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8.4, -54); ctx.quadraticCurveTo(-11, -72, -3, -78.6); ctx.quadraticCurveTo(6, -81, 10.6, -72); ctx.lineTo(11.4, -60); ctx.quadraticCurveTo(10, -53, 2, -52.6); ctx.closePath();
    fs(ctx, metalG(ctx, c, -9, -80, 11, -53), 2);
    ctx.beginPath(); ctx.moveTo(-2, -78.4); ctx.quadraticCurveTo(-6, -72, -6.6, -60); stroke(ctx, 'rgba(255,255,255,.4)', 1);
    if (!o.full) {
      ctx.beginPath(); ctx.moveTo(1.6, -71.4); ctx.quadraticCurveTo(9, -72.6, 15.4, -65); ctx.quadraticCurveTo(15.6, -60, 12.4, -56); ctx.lineTo(2.6, -54.6); ctx.quadraticCurveTo(0.8, -63, 1.6, -71.4); ctx.closePath();
      fs(ctx, metalG(ctx, c, 2, -72, 15, -55, shade(c.metal, 0.12)), 1.7);
      ctx.fillStyle = '#0b0d12'; rr(ctx, 5, -67.6, 8.6, 1.7, 0.8); ctx.fill(); rr(ctx, 5.4, -64.8, 8, 1.3, 0.6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(7, -60); ctx.lineTo(13.6, -60.4); stroke(ctx, c.metalDark, 0.8);
      ctx.beginPath(); ctx.arc(2.8, -63.4, 1.3, 0, TAU); fs(ctx, c.trim, 0.8);
    }
  } };
  // žabí hlava (kolčí přilba) s průzorem mezi temenem a vystouplým rtem
  SHELL.frogmouth = { top: -79, closed: true, eye: [11, -69.4], draw(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-8, -51); ctx.lineTo(-9.8, -66); ctx.quadraticCurveTo(-8, -70.4, -3, -71); ctx.lineTo(10, -69.6); ctx.lineTo(16, -67.6); ctx.quadraticCurveTo(17, -60, 13.4, -52); ctx.quadraticCurveTo(2, -49.4, -8, -51); ctx.closePath();
    fs(ctx, metalG(ctx, c, -9, -71, 16, -50), 2);
    ctx.beginPath(); ctx.moveTo(2, -71); ctx.lineTo(12.4, -72.2); ctx.lineTo(16.6, -67.6); ctx.lineTo(10, -68.6); ctx.lineTo(2, -68.8); ctx.closePath(); ctx.fillStyle = '#0b0d12'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9.6, -66.4); ctx.quadraticCurveTo(-8.4, -79.4, 2, -79.4); ctx.quadraticCurveTo(10.6, -79, 11.6, -72.6); ctx.lineTo(-3, -71.4); ctx.closePath();
    fs(ctx, metalG(ctx, c, -9, -80, 12, -70), 1.9);
    ctx.beginPath(); ctx.moveTo(-4, -77.6); ctx.quadraticCurveTo(2, -79, 7, -77); stroke(ctx, 'rgba(255,255,255,.45)', 0.9);
    ctx.fillStyle = c.trim; for (const [x, y] of [[-6, -64], [-6, -56], [4, -55], [10, -56]]) { ctx.beginPath(); ctx.arc(x, y, 0.9, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(14.4, -66); ctx.quadraticCurveTo(15.6, -60, 12.6, -53.4); stroke(ctx, 'rgba(255,255,255,.3)', 0.9);
    ctx.fillStyle = '#0b0d12'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(10.4 + i * 0.4, -64 + i * 2.2, 0.5, 0, TAU); ctx.fill(); }
  } };
  // morion: hřeben a lodicová krempa
  SHELL.morion = { top: -84, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    ctx.beginPath(); ctx.arc(1.8, -66, 8.8, PI, 0); ctx.closePath(); fs(ctx, metalG(ctx, c, -7, -75, 10, -66), 1.8);
    ctx.beginPath(); ctx.moveTo(-6, -71.4); ctx.quadraticCurveTo(-3.6, -85, 2.4, -85.6); ctx.quadraticCurveTo(8.6, -85, 9.8, -71.4); ctx.closePath();
    fs(ctx, metalG(ctx, c, -6, -86, 10, -71, shade(c.metal, 0.08)), 1.7);
    ctx.beginPath(); ctx.moveTo(-3.4, -73); ctx.quadraticCurveTo(-1.4, -83, 2.4, -83.6); stroke(ctx, 'rgba(255,255,255,.45)', 0.9);
  }, over(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-15.4, -72.6); ctx.quadraticCurveTo(-9, -63.2, 1.8, -63.6); ctx.quadraticCurveTo(12.8, -63.2, 18.4, -73);
    ctx.quadraticCurveTo(13, -66.2, 1.8, -66.4); ctx.quadraticCurveTo(-9.4, -66.2, -15.4, -72.6); ctx.closePath();
    fs(ctx, metalG(ctx, c, -15, -73, 18, -63), 1.6);
    ctx.fillStyle = c.trim; for (const x of [-7, -2, 3.6, 9.2]) { ctx.beginPath(); ctx.arc(x, -67.6, 0.8, 0, TAU); ctx.fill(); }
  } };
  // široký železný klobouk (kettle) s nýtovanou krempou
  SHELL.kettle_wide = { top: -76, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    ctx.beginPath(); ctx.arc(1.8, -66.4, 9.4, PI, 0); ctx.closePath(); fs(ctx, metalG(ctx, c, -8, -76, 11, -66), 1.8);
    ctx.beginPath(); ctx.moveTo(1.8, -75.8); ctx.lineTo(1.8, -67); stroke(ctx, shade(c.metal, 0.45), 1.1);
    rr(ctx, -7.8, -69.2, 19.2, 2.6, 1); fs(ctx, c.trim, 1);
  }, over(ctx, c) {
    ctx.beginPath(); ctx.ellipse(1.8, -66.2, 15.6, 3, -0.05, 0, TAU); fs(ctx, metalG(ctx, c, -14, -69, 17, -63), 1.6);
    ctx.beginPath(); ctx.ellipse(1.8, -66.6, 15.6, 2.2, -0.05, PI * 1.05, PI * 1.95); stroke(ctx, 'rgba(255,255,255,.4)', 0.8);
    ctx.fillStyle = OUT; for (let k = 0; k < 7; k++) { const a = PI * 0.15 + k * PI * 0.12; ctx.beginPath(); ctx.arc(1.8 + Math.cos(a) * 13.6, -66.2 + Math.sin(a) * 2.2, 0.55, 0, TAU); ctx.fill(); }
  } };
  // hluboký klobouk s průzorem v krempě (chapel de fer)
  SHELL.kettle_slot = { top: -79, closed: true, eye: [8.8, -66.5], draw(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-9, -62); ctx.quadraticCurveTo(-10.4, -78.6, 1.8, -79.4); ctx.quadraticCurveTo(13.4, -78.6, 12.4, -62); ctx.closePath();
    fs(ctx, metalG(ctx, c, -9, -79, 12, -62), 1.9);
    ctx.beginPath(); ctx.moveTo(1.8, -79); ctx.quadraticCurveTo(0, -72, 0.6, -64); stroke(ctx, c.metalDark, 1.1);
    ctx.beginPath(); ctx.moveTo(-4, -77); ctx.quadraticCurveTo(-8, -72, -8, -65); stroke(ctx, 'rgba(255,255,255,.4)', 0.9);
    if (!o.full) { rr(ctx, 5.4, -67.4, 7, 1.8, 0.8); ctx.fillStyle = '#0b0d12'; ctx.fill(); }
  }, over(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-14, -59.6); ctx.lineTo(-9.4, -63.8); ctx.lineTo(12.4, -64.2); ctx.lineTo(18.6, -58.4); ctx.lineTo(17, -57.4); ctx.lineTo(11.6, -61.6); ctx.lineTo(-9, -61.2); ctx.lineTo(-12.6, -58.6); ctx.closePath();
    fs(ctx, metalG(ctx, c, -14, -64, 18, -58), 1.6);
    ctx.fillStyle = c.trim; for (const x of [-6, -1, 4, 9]) { ctx.beginPath(); ctx.arc(x, -62.6, 0.7, 0, TAU); ctx.fill(); }
  } };
  // kabuto s velkými fukigaeši a šikoro
  SHELL.kabuto = { top: -75.6, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-6 + i * 0.4, -67 + i * 3.6); ctx.quadraticCurveTo(-11.6 - i * 1.4, -66 + i * 3.6, -13.6 - i * 1.6, -61.6 + i * 3.6);
      ctx.lineTo(-10.6 - i * 1.4, -59.4 + i * 3.6); ctx.quadraticCurveTo(-7.6, -61.6 + i * 3.6, -3.6, -63 + i * 3.6); ctx.closePath();
      fs(ctx, i % 2 ? c.metalDark : c.metal, 1.3);
      ctx.beginPath(); ctx.moveTo(-6, -64.6 + i * 3.6); ctx.lineTo(-12 - i * 1.5, -61.6 + i * 3.6); stroke(ctx, c.lace, 1.1);
    }
    ctx.beginPath(); ctx.arc(1.8, -64.6, 10.4, PI * 1.03, -0.03); ctx.closePath(); fs(ctx, metalG(ctx, c, -8, -75, 12, -64), 1.9);
    ctx.fillStyle = shade(c.metal, 0.5);
    for (let a = -2.75; a <= -0.4; a += 0.42) { ctx.beginPath(); ctx.moveTo(1.8, -64.6); ctx.lineTo(1.8 + Math.cos(a) * 10, -64.6 + Math.sin(a) * 10); stroke(ctx, 'rgba(0,0,0,.25)', 0.8); for (let r = 4; r < 10; r += 2.6) { ctx.beginPath(); ctx.arc(1.8 + Math.cos(a) * r, -64.6 + Math.sin(a) * r, 0.45, 0, TAU); ctx.fill(); } }
    ctx.beginPath(); ctx.arc(1.8, -75, 1.7, 0, TAU); fs(ctx, c.trim, 0.9);
    ctx.beginPath(); ctx.moveTo(4, -66); ctx.quadraticCurveTo(11, -67.4, 15, -63.6); ctx.lineTo(13.4, -63); ctx.quadraticCurveTo(9, -65, 4, -64.6); ctx.closePath(); fs(ctx, c.metalDark, 1.2);
    // fukigaeši
    ctx.beginPath(); ctx.moveTo(6.6, -67.4); ctx.quadraticCurveTo(12, -71, 15.6, -69.6); ctx.lineTo(14.6, -61.2); ctx.quadraticCurveTo(11, -62.6, 7.6, -63.6); ctx.closePath(); fs(ctx, c.lace, 1.3);
    ctx.beginPath(); ctx.moveTo(7.4, -66.6); ctx.quadraticCurveTo(12, -69.6, 14.8, -68.6); stroke(ctx, c.trim, 1);
    ctx.beginPath(); ctx.arc(11.6, -65.6, 1.8, 0, TAU); fs(ctx, c.trim, 0.8); ctx.beginPath(); ctx.arc(11.6, -65.6, 0.7, 0, TAU); ctx.fillStyle = c.lace; ctx.fill();
  } };
  // džingasa: lakovaný kužel s lemem a uzlem
  SHELL.jingasa = { top: -78, closed: false, eye: [6.6, -62.8], draw() {}, over(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-1, -61); ctx.quadraticCurveTo(4, -55, 9, -56); stroke(ctx, c.leatherDark, 1);
    ctx.beginPath(); ctx.moveTo(-16, -63.4); ctx.quadraticCurveTo(-6, -70, 1.8, -78); ctx.quadraticCurveTo(10, -70, 19.6, -63.4); ctx.quadraticCurveTo(1.8, -60, -16, -63.4); ctx.closePath();
    fs(ctx, metalG(ctx, c, -16, -78, 19, -62), 1.8);
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 0.7; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(1.8, -78); ctx.lineTo(1.8 + k * 5.4, -61); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(-16, -63.4); ctx.quadraticCurveTo(1.8, -60, 19.6, -63.4); stroke(ctx, c.trim, 1.7);
    ctx.beginPath(); ctx.moveTo(-8, -68); ctx.quadraticCurveTo(-3, -73, 1, -76.6); stroke(ctx, 'rgba(255,255,255,.45)', 0.9);
    ctx.beginPath(); ctx.arc(4.6, -68.6, 2.6, 0, TAU); fs(ctx, c.mon, 1); ctx.beginPath(); ctx.arc(4.6, -68.6, 1, 0, TAU); ctx.fillStyle = shade(c.metal, -0.3); ctx.fill();
    ctx.beginPath(); ctx.arc(1.8, -77.6, 1.4, 0, TAU); fs(ctx, c.trim, 0.9);
  } };
  // vysoký lakovaný klobouk eboši s ohybem
  SHELL.eboshi = { top: -98, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    const lac = '#16131a';
    ctx.beginPath(); ctx.moveTo(-7.6, -67.6); ctx.quadraticCurveTo(-9.6, -85, -5.4, -97); ctx.quadraticCurveTo(0, -101, 5, -96); ctx.quadraticCurveTo(3, -89, 8, -83); ctx.quadraticCurveTo(10.6, -76, 9.4, -67.6); ctx.closePath();
    fs(ctx, lg(ctx, -9, -100, 10, -68, [[0, '#4a4452'], [0.5, lac], [1, '#050407']]), 1.7);
    ctx.beginPath(); ctx.moveTo(-5.4, -95); ctx.quadraticCurveTo(-8, -84, -6.6, -71); stroke(ctx, 'rgba(255,255,255,.22)', 1);
    ctx.beginPath(); ctx.moveTo(5, -96); ctx.quadraticCurveTo(2, -88, 3.4, -82); stroke(ctx, 'rgba(255,255,255,.14)', 0.8);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-4 + (k % 2) * 3, -90 + k * 4.4, 0.8, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-7.8, -70.4); ctx.quadraticCurveTo(1, -72.4, 9.6, -70.6); stroke(ctx, OUT, 3.4); stroke(ctx, c.trim, 1.8);
    ctx.beginPath(); ctx.moveTo(-6.6, -68); ctx.quadraticCurveTo(-5.4, -60, -2.6, -56); stroke(ctx, '#f2ecdc', 0.9);
  } };
  // spangenhelm: segmentovaná kónická přilba, nánosník a kroužkový závěs
  SHELL.spangen = { top: -83, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-9.4, -64); ctx.quadraticCurveTo(-13, -57, -10.6, -50.4); ctx.quadraticCurveTo(-5, -49.4, -1, -52); ctx.lineTo(-1.6, -60); ctx.closePath(); fs(ctx, c.metalDark, 1.3);
    ctx.save(); ctx.clip(); ctx.fillStyle = shade(c.metal, 0.2); for (let y = -62; y < -50; y += 2) for (let x = -13; x < 0; x += 2) { ctx.beginPath(); ctx.arc(x + (y % 4 ? 1 : 0), y, 0.55, 0, TAU); ctx.fill(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(-8.8, -63.6); ctx.quadraticCurveTo(-6.6, -76.6, 2, -83.2); ctx.quadraticCurveTo(9.6, -76.6, 12, -63.6); ctx.closePath();
    fs(ctx, metalG(ctx, c, -8, -83, 12, -63), 1.8);
    for (const x of [-3.4, 6.8]) { ctx.beginPath(); ctx.moveTo(2, -82.4); ctx.quadraticCurveTo((2 + x) / 2 + (x < 2 ? -1.5 : 1.5), -73, x, -64); stroke(ctx, OUT, 3.2); stroke(ctx, c.trim, 1.6); }
    rr(ctx, -9.4, -65.8, 22.2, 3.6, 1.2); fs(ctx, c.trim, 1.2);
    ctx.fillStyle = OUT; for (let x = -7; x < 12; x += 3.2) { ctx.beginPath(); ctx.arc(x, -64, 0.55, 0, TAU); ctx.fill(); }
    rr(ctx, 9, -64.4, 2.6, 9.6, 1); fs(ctx, c.trim, 1.1);
  } };
  // vendelská přilba: hřebenový pás, brýlový chránič s obočím a lícnice
  SHELL.vendel = { top: -76, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-8.6, -63); ctx.quadraticCurveTo(-12, -56, -9.4, -51); ctx.quadraticCurveTo(-5, -50, -2.4, -53); ctx.lineTo(-2.4, -62); ctx.closePath(); fs(ctx, c.metalDark, 1.3);
    ctx.save(); ctx.clip(); ctx.fillStyle = shade(c.metal, 0.2); for (let y = -62; y < -50; y += 2) for (let x = -12; x < -2; x += 2) { ctx.beginPath(); ctx.arc(x + (y % 4 ? 1 : 0), y, 0.5, 0, TAU); ctx.fill(); } ctx.restore();
    ctx.beginPath(); ctx.arc(1.8, -64, 10.2, PI, 0); ctx.closePath(); fs(ctx, metalG(ctx, c, -8, -74, 12, -64), 1.8);
    ctx.beginPath(); ctx.moveTo(-4, -72); ctx.quadraticCurveTo(-7.6, -69, -8, -66); stroke(ctx, 'rgba(255,255,255,.45)', 0.9);
    ctx.beginPath(); ctx.arc(1.8, -64, 10.8, PI * 1.04, -0.04); stroke(ctx, OUT, 4.4); stroke(ctx, c.trim, 2.4);
    rr(ctx, -9, -65.8, 21.6, 3, 1.2); fs(ctx, c.trim, 1.1);
    // brýle s obočím
    ctx.beginPath(); ctx.arc(6.6, -62.4, 3, PI * 1.05, PI * 0.15); stroke(ctx, OUT, 3.6); stroke(ctx, c.trim, 1.9);
    ctx.beginPath(); ctx.moveTo(3, -66.2); ctx.quadraticCurveTo(6.6, -68.4, 10.6, -66.4); stroke(ctx, OUT, 3); stroke(ctx, shade(c.trim, 0.3), 1.4);
    rr(ctx, 9.4, -64.6, 2.6, 9, 1); fs(ctx, c.trim, 1.1);
    // lícnice
    ctx.beginPath(); ctx.moveTo(-3, -64); ctx.lineTo(2, -64); ctx.quadraticCurveTo(2.8, -58.6, 1.2, -55); ctx.quadraticCurveTo(-1.6, -54.4, -3.2, -56.4); ctx.closePath(); fs(ctx, metalG(ctx, c, -3, -64, 3, -54), 1.3);
    ctx.fillStyle = c.trim; ctx.beginPath(); ctx.arc(-0.6, -60.4, 0.7, 0, TAU); ctx.fill();
  } };
  // medvědí hlava přes přilbu
  SHELL.bearhood = { top: -78, closed: false, eye: [6.6, -62.8], draw() {}, over(ctx, c) {
    const f = c.fur === '#8a6f52' ? '#5a3f2a' : c.fur;
    ctx.beginPath(); ctx.moveTo(-5, -73); ctx.quadraticCurveTo(-18, -67, -16, -47); ctx.quadraticCurveTo(-11, -45, -5, -49); ctx.quadraticCurveTo(-8, -60, -1, -66); ctx.closePath(); fs(ctx, shade(f, -0.18), 1.6);
    ctx.strokeStyle = shade(f, 0.2); ctx.lineWidth = 0.7; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-8 - k * 1.6, -66 + k * 2); ctx.quadraticCurveTo(-12 - k, -58, -11 - k, -50); ctx.stroke(); }
    for (const [x, y] of [[-6, -76.4], [0.6, -78]]) { ctx.beginPath(); ctx.arc(x, y, 3.1, 0, TAU); fs(ctx, f, 1.4); ctx.beginPath(); ctx.arc(x, y + 0.4, 1.4, 0, TAU); ctx.fillStyle = shade(f, -0.4); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(1, -70.4, 11, 6.6, -0.08, 0, TAU); fs(ctx, lg(ctx, 0, -77, 0, -64, [[0, shade(f, 0.2)], [1, shade(f, -0.2)]]), 1.8);
    ctx.beginPath(); ctx.moveTo(5, -74); ctx.quadraticCurveTo(15.6, -75.6, 18.6, -70); ctx.quadraticCurveTo(17.6, -66, 9, -66); ctx.closePath(); fs(ctx, shade(f, 0.1), 1.6);
    ctx.beginPath(); ctx.ellipse(18, -71.6, 1.8, 1.4, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
    ctx.fillStyle = '#f4efe2'; for (let x = 9.4; x < 17; x += 2.2) { ctx.beginPath(); ctx.moveTo(x, -66.4); ctx.lineTo(x + 0.8, -64); ctx.lineTo(x + 1.6, -66.6); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.5; ctx.strokeStyle = OUT; ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(6.6, -72.6, 1.3, 0.9, 0, 0, TAU); ctx.fillStyle = '#1a0c06'; ctx.fill();
    ctx.beginPath(); ctx.arc(6.9, -72.8, 0.4, 0, TAU); ctx.fillStyle = '#ffb34a'; ctx.fill();
    ctx.strokeStyle = shade(f, 0.25); ctx.lineWidth = 0.7; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-8 + k * 3, -74.4 + Math.abs(k - 2)); ctx.lineTo(-7 + k * 3, -71.6 + Math.abs(k - 2)); ctx.stroke(); }
  } };
  // vlčí hlava s ušima a tesáky
  SHELL.wolfhood = { top: -79, closed: false, eye: [6.6, -62.8], draw() {}, over(ctx, c) {
    const f = c.fur === '#8a6f52' ? '#8f939c' : c.fur;
    ctx.beginPath(); ctx.moveTo(-5, -73); ctx.quadraticCurveTo(-19, -66, -20, -44); ctx.lineTo(-15, -47); ctx.lineTo(-13, -43); ctx.quadraticCurveTo(-9, -46, -5, -49); ctx.quadraticCurveTo(-8, -60, -1, -66); ctx.closePath(); fs(ctx, shade(f, -0.18), 1.6);
    for (const [x0, x1, x2, sh] of [[-6.4, -6, -0.6, -0.2], [-0.6, 2, 5, 0]]) { ctx.beginPath(); ctx.moveTo(x0, -74); ctx.lineTo(x1 - 1, -86.6); ctx.lineTo(x2, -75.4); ctx.closePath(); fs(ctx, shade(f, sh), 1.4); ctx.beginPath(); ctx.moveTo(x0 + 1.4, -74.6); ctx.lineTo(x1 - 0.6, -83.4); ctx.lineTo(x2 - 1.4, -75.6); ctx.closePath(); ctx.fillStyle = '#d59a8a'; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-8.6, -66); ctx.quadraticCurveTo(-9, -77.4, 0.6, -77.4); ctx.lineTo(9.4, -74.4); ctx.lineTo(20, -70.4); ctx.quadraticCurveTo(18.4, -67, 10, -66.6); ctx.lineTo(-8.6, -64); ctx.closePath();
    fs(ctx, lg(ctx, 0, -78, 0, -64, [[0, shade(f, 0.25)], [1, shade(f, -0.15)]]), 1.8);
    ctx.beginPath(); ctx.moveTo(9, -74.2); ctx.lineTo(19.6, -70.6); stroke(ctx, shade(f, -0.35), 0.8);
    ctx.beginPath(); ctx.ellipse(19.4, -70.8, 1.4, 1.1, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
    ctx.fillStyle = '#f4efe2'; for (const x of [11, 15.4]) { ctx.beginPath(); ctx.moveTo(x, -66.8); ctx.lineTo(x + 0.9, -63.4); ctx.lineTo(x + 1.9, -67); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.5; ctx.strokeStyle = OUT; ctx.stroke(); }
    ctx.save(); glowS(ctx, c.glow, 6); ctx.beginPath(); ctx.moveTo(4.6, -72.6); ctx.lineTo(8.4, -73); ctx.lineTo(7.6, -71.6); ctx.closePath(); ctx.fillStyle = c.glow; ctx.fill(); ctx.restore();
    ctx.strokeStyle = shade(f, 0.35); ctx.lineWidth = 0.7; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-6 + k * 2.6, -66); ctx.lineTo(-5 + k * 2.6, -64); ctx.stroke(); }
  } };
  // hluboká kápě mága se stínem přes obličej a cípem vzadu
  SHELL.wizardhood = { top: -78, closed: false, eye: [6.6, -62.8], draw() {}, over(ctx, c, o) {
    const h = c.hood;
    ctx.beginPath(); ctx.moveTo(-6, -75); ctx.quadraticCurveTo(-16, -74, -22, -62 + Math.sin((o.t || 0) * 2) * 1.2); ctx.quadraticCurveTo(-15, -64, -10, -64); ctx.closePath(); fs(ctx, shade(h, -0.2), 1.4);
    ctx.beginPath(); ctx.moveTo(11.6, -52.6); ctx.quadraticCurveTo(14, -66, 8.6, -73.6); ctx.quadraticCurveTo(1, -81, -7.4, -75.4); ctx.quadraticCurveTo(-13.6, -70, -14.4, -58); ctx.quadraticCurveTo(-14.6, -50, -10, -46.4); ctx.lineTo(0, -49.4); ctx.closePath();
    ctx.moveTo(12, -61.6); ctx.ellipse(6.4, -61.6, 5.6, 7.8, 0, 0, TAU, true);
    fsEO(ctx, lg(ctx, -14, -80, 12, -48, [[0, shade(h, 0.25)], [0.6, h], [1, shade(h, -0.35)]]), 1.8);
    ctx.save(); ctx.beginPath(); ctx.ellipse(6.4, -61.6, 5.6, 7.8, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = lg(ctx, 0, -69.6, 0, -58, [[0, 'rgba(8,6,14,.82)'], [0.55, 'rgba(8,6,14,.35)'], [1, 'rgba(8,6,14,0)']]); ctx.fillRect(0, -70, 13, 16);
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(6.4, -61.6, 5.9, 8.1, 0, PI * 0.62, PI * 2.3); stroke(ctx, OUT, 3); stroke(ctx, c.trim, 1.4);
    ctx.beginPath(); ctx.moveTo(-6, -74); ctx.quadraticCurveTo(-12, -68, -12, -54); stroke(ctx, shade(h, -0.3), 0.9);
  } };
  // čelenka-korunka přes vlasy
  SHELL.circlet = { top: -72, closed: false, eye: [6.6, -62.8], draw(ctx, c) {
    const g = c.trim;
    ctx.beginPath(); ctx.moveTo(-6.8, -66.4); ctx.quadraticCurveTo(1.6, -72, 10.6, -68.4); ctx.lineTo(10.4, -66); ctx.quadraticCurveTo(1.6, -69.4, -6.8, -64); ctx.closePath(); fs(ctx, goldG(ctx, 0, -72, 0, -64, g), 1.3);
    for (const [x, y, h] of [[1.6, -70, 4.6], [5.2, -69.8, 6.6], [8.8, -68.8, 4.4]]) { ctx.beginPath(); ctx.moveTo(x - 1.6, y + 0.6); ctx.lineTo(x, y - h); ctx.lineTo(x + 1.6, y + 0.4); ctx.closePath(); fs(ctx, goldG(ctx, x, y - h, x, y, g), 1); }
    gem(ctx, 5.2, -70.2, 1.3, c.glow);
    ctx.beginPath(); ctx.moveTo(-6, -65.8); ctx.quadraticCurveTo(1.6, -70.6, 10, -67.8); stroke(ctx, 'rgba(255,255,255,.5)', 0.6);
  } };
  // přilba ve tvaru lebky
  SHELL.skull = { top: -78.6, closed: true, eye: [7.4, -65], draw(ctx, c, o) {
    const b = '#efe6cf';
    ctx.beginPath(); ctx.moveTo(-8.4, -55); ctx.quadraticCurveTo(-11, -74, 0.4, -78.6); ctx.quadraticCurveTo(10.6, -78.6, 12.8, -68); ctx.quadraticCurveTo(13.8, -63, 12.2, -60.2); ctx.lineTo(12.8, -57.6); ctx.quadraticCurveTo(9, -55.6, 5, -55.4); ctx.lineTo(4.4, -52.6); ctx.quadraticCurveTo(-2, -51.6, -8.4, -55); ctx.closePath();
    fs(ctx, lg(ctx, -8, -78, 12, -53, [[0, '#fffaf0'], [0.5, b], [1, '#a89c80']]), 1.9);
    ctx.beginPath(); ctx.moveTo(-6, -64); ctx.quadraticCurveTo(-3, -70, 3.6, -70.6); stroke(ctx, 'rgba(90,70,40,.45)', 0.8);
    ctx.beginPath(); ctx.moveTo(-2, -78); ctx.lineTo(-1, -74); ctx.lineTo(-3, -71.6); stroke(ctx, 'rgba(70,50,30,.7)', 0.7);
    if (!o.full) {
      ctx.beginPath(); ctx.ellipse(7.6, -65, 3, 2.6, 0.2, 0, TAU); ctx.fillStyle = '#141016'; ctx.fill();
      ctx.save(); glowS(ctx, c.glow, 7); ctx.beginPath(); ctx.arc(8.2, -65, 1, 0, TAU); ctx.fillStyle = c.glow; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(11.6, -62.6); ctx.lineTo(13, -59.8); ctx.lineTo(10.8, -60.2); ctx.closePath(); ctx.fillStyle = '#141016'; ctx.fill();
      ctx.fillStyle = '#141016'; rr(ctx, 5, -58.2, 7.6, 2.6, 0.8); ctx.fill();
      ctx.fillStyle = '#f4ecd6'; for (let x = 5.4; x < 12.4; x += 1.75) { rr(ctx, x, -58, 1.4, 2.2, 0.4); ctx.fill(); }
    }
  } };
  // jen maska (oni / nó) na řemíncích, vlasy zůstávají vidět
  SHELL.mask = { top: -72, closed: true, eye: [7.4, -64.4], draw(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(2, -67); ctx.quadraticCurveTo(-5, -69.4, -6.6, -62.4); stroke(ctx, OUT, 3); stroke(ctx, c.leather, 1.6);
    ctx.beginPath(); ctx.moveTo(2, -58); ctx.quadraticCurveTo(-3, -56.6, -4.6, -59.6); stroke(ctx, OUT, 3); stroke(ctx, c.leather, 1.6);
    ctx.beginPath(); ctx.moveTo(1.6, -71.4); ctx.quadraticCurveTo(10.4, -72.4, 12.4, -66); ctx.quadraticCurveTo(13.6, -63, 12, -61); ctx.quadraticCurveTo(12.8, -55.4, 7.4, -53.2); ctx.quadraticCurveTo(2.6, -53.4, 1.4, -57); ctx.quadraticCurveTo(0.4, -64, 1.6, -71.4); ctx.closePath();
    fs(ctx, lg(ctx, 1, -72, 12, -53, [[0, '#ffffff'], [0.6, '#efe8dc'], [1, '#b9ae9c']]), 1.6);
    if (!o.full) {
      ctx.beginPath(); ctx.moveTo(4.6, -64.6); ctx.quadraticCurveTo(7.4, -66.6, 10.2, -64.4); ctx.quadraticCurveTo(7.4, -63, 4.6, -64.6); ctx.closePath(); ctx.fillStyle = '#141016'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, -67.4); ctx.quadraticCurveTo(7, -69.4, 10.6, -67.6); stroke(ctx, c.mask, 1.3);
      ctx.beginPath(); ctx.moveTo(6.2, -57.2); ctx.quadraticCurveTo(8.4, -56, 10.6, -57.4); stroke(ctx, c.mask, 1.2);
      ctx.beginPath(); ctx.ellipse(5.4, -60.4, 1.6, 0.9, 0, 0, TAU); ctx.fillStyle = 'rgba(214,36,58,.35)'; ctx.fill();
    }
  } };

  /* =====================================================================
     HLEDÍ A OBLIČEJ  { full: zakrývá celý obličej }
     ===================================================================== */
  const VISOR = {};
  const facePlate = (ctx, c) => {
    ctx.beginPath(); ctx.moveTo(1.4, -71); ctx.quadraticCurveTo(10.4, -71.6, 13, -66.4); ctx.lineTo(13.2, -56.4); ctx.quadraticCurveTo(8.4, -52.8, 1.4, -53.6); ctx.quadraticCurveTo(0.2, -62, 1.4, -71); ctx.closePath();
    fs(ctx, metalG(ctx, c, 1, -71, 13, -54, shade(c.metal, 0.08)), 1.7);
  };
  VISOR.none = { full: false, draw() {} };
  VISOR.tslit = { full: true, draw(ctx, c) {
    facePlate(ctx, c);
    ctx.fillStyle = '#0b0d12'; rr(ctx, 4, -66.8, 9.4, 2.2, 0.9); ctx.fill(); rr(ctx, 8.2, -66, 2.2, 8.8, 0.9); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -64.4); ctx.lineTo(8, -64.4); stroke(ctx, 'rgba(255,255,255,.3)', 0.6);
    ctx.fillStyle = c.trim; for (const [x, y] of [[2.8, -68.6], [2.8, -56.6], [11.8, -55.4]]) { ctx.beginPath(); ctx.arc(x, y, 0.75, 0, TAU); ctx.fill(); }
  } };
  VISOR.grill = { full: true, draw(ctx, c) {
    facePlate(ctx, c);
    rr(ctx, 3.6, -68.4, 9.2, 10.4, 2.2); ctx.fillStyle = '#0b0d12'; ctx.fill();
    for (const x of [4.9, 7.1, 9.3, 11.5]) { ctx.beginPath(); ctx.moveTo(x, -68.4); ctx.lineTo(x, -58); stroke(ctx, OUT, 2.2); stroke(ctx, shade(c.metal, 0.25), 1.1); }
    ctx.beginPath(); ctx.moveTo(3.6, -63.4); ctx.lineTo(12.8, -63.4); stroke(ctx, OUT, 2.2); stroke(ctx, shade(c.metal, 0.25), 1.1);
    rr(ctx, 3.6, -68.4, 9.2, 10.4, 2.2); stroke(ctx, c.trim, 1.1);
  } };
  VISOR.mempo = { full: false, draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-0.6, -61.4); ctx.lineTo(10.4, -61.8); ctx.lineTo(12.8, -59.6); ctx.lineTo(11.2, -58.8); ctx.quadraticCurveTo(11, -53.6, 4.6, -52.8); ctx.quadraticCurveTo(-0.6, -54, -0.6, -61.4); ctx.closePath();
    fs(ctx, lg(ctx, 0, -62, 10, -53, [[0, shade(c.mask, 0.3)], [1, shade(c.mask, -0.35)]]), 1.5);
    ctx.beginPath(); ctx.moveTo(5.4, -58.4); ctx.quadraticCurveTo(9, -60.4, 11.6, -58.6); ctx.quadraticCurveTo(12.6, -56.6, 14.2, -57.2); stroke(ctx, OUT, 2.8); stroke(ctx, '#f2ecdc', 1.4);
    ctx.fillStyle = '#f8f2e2'; rr(ctx, 6.6, -57.2, 4, 1.2, 0.4); ctx.fill();
    for (let i = 0; i < 2; i++) { rr(ctx, -0.6 + i * 0.6, -53.6 + i * 2.2, 11 - i, 2.4, 0.8); fs(ctx, i % 2 ? c.metalDark : c.metal, 1); ctx.beginPath(); ctx.moveTo(0.4 + i * 0.6, -52.4 + i * 2.2); ctx.lineTo(10 - i * 0.4, -52.4 + i * 2.2); stroke(ctx, c.lace, 0.7); }
  } };
  VISOR.beak = { full: true, draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(1.4, -71.4); ctx.quadraticCurveTo(11, -71.4, 20.4, -63.2); ctx.quadraticCurveTo(11, -54.6, 1.4, -54.6); ctx.quadraticCurveTo(0, -63, 1.4, -71.4); ctx.closePath();
    fs(ctx, metalG(ctx, c, 1, -71, 20, -55, shade(c.metal, 0.1)), 1.7);
    ctx.beginPath(); ctx.moveTo(3, -63.4); ctx.lineTo(20, -63.2); stroke(ctx, 'rgba(0,0,0,.35)', 0.8);
    ctx.beginPath(); ctx.moveTo(4, -69); ctx.quadraticCurveTo(12, -68.4, 18, -64); stroke(ctx, 'rgba(255,255,255,.45)', 0.8);
    ctx.fillStyle = '#0b0d12'; rr(ctx, 5, -67.4, 7.6, 1.5, 0.7); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(8 + i * 1.8, -60.6 + i * 0.5, 0.55, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(2.6, -63.2, 1.4, 0, TAU); fs(ctx, c.trim, 0.8);
  } };
  VISOR.jaw = { full: false, draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(0.2, -61); ctx.lineTo(11.6, -60.6); ctx.quadraticCurveTo(13, -56.4, 11, -53); ctx.quadraticCurveTo(5, -51.4, 0.4, -54.4); ctx.closePath();
    fs(ctx, lg(ctx, 0, -61, 0, -52, [[0, '#fbf6ea'], [1, '#b3a78e']]), 1.5);
    ctx.fillStyle = '#141016'; rr(ctx, 4.6, -60.2, 7, 2.2, 0.6); ctx.fill();
    ctx.fillStyle = '#f8f0dc'; for (let x = 4.9; x < 11.4; x += 1.6) { rr(ctx, x, -60.4, 1.2, 2.4, 0.4); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(1, -56.4); ctx.quadraticCurveTo(5, -54.6, 9, -55.6); stroke(ctx, 'rgba(90,70,40,.5)', 0.7);
    ctx.beginPath(); ctx.arc(1.2, -59, 1.2, 0, TAU); fs(ctx, '#d9cfb6', 0.8);
  } };
  VISOR.aventail = { full: false, draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-9.4, -61.6); ctx.quadraticCurveTo(-11.4, -53, -6.4, -49.6); ctx.quadraticCurveTo(3, -47.6, 11.8, -51.2); ctx.quadraticCurveTo(12.6, -55, 11, -58); ctx.quadraticCurveTo(6, -55.6, 1, -57); ctx.quadraticCurveTo(-3, -58, -5, -62.4); ctx.closePath();
    fs(ctx, c.metalDark, 1.5);
    ctx.save(); ctx.clip(); ctx.strokeStyle = shade(c.metal, 0.25); ctx.lineWidth = 0.55;
    for (let y = -62; y < -47; y += 1.7) for (let x = -12; x < 13; x += 1.9) { ctx.beginPath(); ctx.arc(x + ((y * 10) % 2 ? 0.95 : 0), y, 0.65, 0, TAU); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-6.4, -49.8); ctx.quadraticCurveTo(3, -47.8, 11.6, -51.4); stroke(ctx, c.trim, 1.1);
  } };
  VISOR.veil = { full: false, draw(ctx, c, o) {
    const fl = Math.sin((o.t || 0) * 3) * 1.4, v = c.tunicDark;
    ctx.beginPath(); ctx.moveTo(-3, -61); ctx.quadraticCurveTo(-10, -60 + fl, -14, -55 + fl); ctx.lineTo(-11, -53); ctx.quadraticCurveTo(-7, -56, -3, -55); ctx.closePath(); fs(ctx, shade(v, -0.15), 1.3);
    ctx.beginPath(); ctx.moveTo(-1, -61.4); ctx.quadraticCurveTo(6, -62.2, 12.4, -61); ctx.quadraticCurveTo(13.4, -57, 12, -52.6); ctx.quadraticCurveTo(5, -50, -1, -52.6); ctx.closePath();
    fs(ctx, lg(ctx, 0, -62, 0, -51, [[0, shade(v, 0.2)], [1, shade(v, -0.25)]]), 1.5);
    ctx.strokeStyle = shade(v, -0.4); ctx.lineWidth = 0.7; for (const x of [3, 6.6, 10]) { ctx.beginPath(); ctx.moveTo(x, -60.6); ctx.quadraticCurveTo(x + 0.6, -56, x - 0.4, -52); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-0.6, -61.2); ctx.quadraticCurveTo(6, -62, 12.4, -60.8); stroke(ctx, c.trim, 1);
  } };
  VISOR.glow = { full: false, draw(ctx, c, o) {
    const e = o.eye || [6.8, -62.8];
    if (!o.closed) { rr(ctx, 2.2, e[1] - 2.6, 10.6, 4.8, 2.2); ctx.fillStyle = 'rgba(8,6,14,.88)'; ctx.fill(); }
    const fl = 0.75 + Math.sin((o.t || 0) * 5) * 0.25;
    ctx.save(); glowS(ctx, c.glow, 9); ctx.globalAlpha = fl;
    ctx.beginPath(); ctx.moveTo(e[0] - 2.6, e[1] + 0.2); ctx.quadraticCurveTo(e[0] + 0.4, e[1] - 1.6, e[0] + 3, e[1] - 0.4); ctx.quadraticCurveTo(e[0] + 0.4, e[1] + 1, e[0] - 2.6, e[1] + 0.2); ctx.closePath(); ctx.fillStyle = c.glow; ctx.fill();
    ctx.beginPath(); ctx.arc(e[0] + 0.6, e[1] - 0.3, 0.55, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();
  } };
  VISOR.nasal = { full: false, draw(ctx, c) {
    rr(ctx, 9, -70, 2.8, 12.4, 1.2); fs(ctx, metalG(ctx, c, 9, -70, 12, -58), 1.2);
    ctx.beginPath(); ctx.moveTo(9.2, -58.4); ctx.lineTo(10.4, -56.6); ctx.lineTo(11.8, -58.4); ctx.closePath(); fs(ctx, c.metal, 0.9);
    ctx.fillStyle = c.trim; ctx.beginPath(); ctx.arc(10.4, -67.6, 0.7, 0, TAU); ctx.fill();
  } };
  VISOR.cheeks = { full: false, draw(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-3, -66.4); ctx.lineTo(4.4, -66.4); ctx.quadraticCurveTo(6, -60.4, 4.6, -54.2); ctx.quadraticCurveTo(0, -52.6, -3.4, -55.6); ctx.closePath();
    fs(ctx, metalG(ctx, c, -3, -66, 5, -54), 1.5);
    ctx.beginPath(); ctx.moveTo(-1.6, -64.6); ctx.lineTo(3.4, -64.6); ctx.quadraticCurveTo(4.4, -60, 3.4, -55.6); stroke(ctx, c.trim, 0.9);
    ctx.fillStyle = c.trim; ctx.beginPath(); ctx.arc(0.6, -60.4, 0.9, 0, TAU); ctx.fill();
  } };
  VISOR.oni = { full: true, draw(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(1.4, -71.4); ctx.quadraticCurveTo(10.6, -72.4, 13.2, -66); ctx.lineTo(14.8, -62.6); ctx.lineTo(12.8, -61.4); ctx.quadraticCurveTo(13.6, -55, 7.4, -52.6); ctx.quadraticCurveTo(2, -52.8, 1, -57); ctx.quadraticCurveTo(0.2, -64, 1.4, -71.4); ctx.closePath();
    fs(ctx, lg(ctx, 1, -72, 13, -53, [[0, shade(c.mask, 0.35)], [1, shade(c.mask, -0.35)]]), 1.6);
    ctx.beginPath(); ctx.moveTo(3.4, -68.6); ctx.lineTo(8, -66.6); ctx.lineTo(12.4, -68.4); stroke(ctx, OUT, 1.8);
    ctx.beginPath(); ctx.moveTo(4.6, -65.6); ctx.quadraticCurveTo(7.6, -66.8, 10.6, -64.8); ctx.quadraticCurveTo(7.4, -63.6, 4.6, -65.6); ctx.closePath();
    ctx.save(); glowS(ctx, c.glow, 6); ctx.fillStyle = '#ffe14a'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(4.6, -58.6); ctx.quadraticCurveTo(8.6, -60.4, 12.6, -58.4); ctx.quadraticCurveTo(9, -55, 4.6, -58.6); ctx.closePath(); ctx.fillStyle = '#1a0806'; ctx.fill();
    ctx.fillStyle = '#fff6e0'; for (const [x, y, d] of [[5.6, -58.6, 1], [11.4, -58.4, 1], [7.4, -56.2, -1]]) { ctx.beginPath(); ctx.moveTo(x - 0.8, y); ctx.lineTo(x, y + d * 2.4); ctx.lineTo(x + 0.8, y); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(3.8, -60.4); ctx.quadraticCurveTo(1, -57, 2.4, -54.6); stroke(ctx, '#f2ecdc', 1);
  } };

  /* =====================================================================
     HŘEBENY / OZDOBY NAHOŘE  { back(): za skořepinou, front(): před ní }
     T = y temene, X = 1.8 střed hlavy
     ===================================================================== */
  const X = 1.8;
  const CREST = {};
  CREST.none = {};
  CREST.plume = { front(ctx, c, T, o) {
    const sw = Math.sin((o.t || 0) * 4) * 0.06;
    const cols = [shade(c.plume, -0.2), c.plume, shade(c.plume, 0.3)];
    for (let k = 0; k < 3; k++) feather(ctx, X - 0.5, T + 1, -1.85 - k * 0.38 + sw * (k + 1), 21 - k * 2.6, 6.2 - k * 0.6, cols[k], 1.2);
    feather(ctx, X + 0.4, T + 1, -1.45 + sw, 12, 3.6, c.trim, 1);
    rr(ctx, X - 2.6, T - 2, 5.2, 4.4, 1.4); fs(ctx, goldG(ctx, 0, T - 2, 0, T + 2.4, c.trim), 1.1);
  } };
  CREST.horsehair = { front(ctx, c, T, o) {
    const t = o.t || 0, mv = o.moving ? 2.2 : 1;
    const strand = (k, col, lw) => { const s = Math.sin(t * 3 + k * 0.7) * 2.4 * mv; ctx.beginPath(); ctx.moveTo(X, T - 1); ctx.bezierCurveTo(X - 2, T - 10, -12 + s * 0.4, T - 9 - k, -15 + s - k * 1.4, T + 6 + k * 3); ctx.quadraticCurveTo(-18 + s * 1.4 - k, T + 16 + k * 2, -15 + s * 1.8 - k * 1.6, T + 24 + k * 3); stroke(ctx, col, lw); };
    for (let k = 0; k < 4; k++) strand(k, OUT, 5.6 - k * 0.6);
    for (let k = 0; k < 4; k++) strand(k, k % 2 ? shade(c.plume, -0.2) : c.plume, 3.4 - k * 0.5);
    for (let k = 0; k < 4; k++) strand(k + 0.5, shade(c.plume, 0.35), 0.6);
    ctx.beginPath(); ctx.moveTo(X - 2, T + 2); ctx.lineTo(X - 1.4, T - 4); ctx.lineTo(X + 1.4, T - 4); ctx.lineTo(X + 2, T + 2); ctx.closePath(); fs(ctx, goldG(ctx, 0, T - 4, 0, T + 2, c.trim), 1.1);
  } };
  const BONE = '#ece3cc';
  const bullHorn = (ctx, d, T, col) => tube(ctx, qb([X + d * 6, T + 8], [X + d * 19, T + 6], [X + d * 15.4, T - 9]), 2.6, 0.5, col, 16, 3);
  CREST.horn_bull = { back(ctx, c, T) { bullHorn(ctx, -1, T, shade(BONE, -0.25)); }, front(ctx, c, T) { bullHorn(ctx, 1, T, BONE); } };
  const ramCurl = (cx, cy, r0, turns, dir) => s => { const a = -PI * 0.6 + dir * s * turns * TAU, r = r0 * (1 - s * 0.7); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  CREST.horn_ram = {
    back(ctx, c, T) { tube(ctx, ramCurl(X + 5.6, T + 7.6, 6, 1.1, 1), 2.4, 0.6, shade('#c9b896', -0.25), 18, 2); },
    front(ctx, c, T) { tube(ctx, ramCurl(X - 4.6, T + 11.6, 7.4, 1.25, -1), 3.1, 0.7, '#d8c8a2', 20, 2); }
  };
  const antler = (ctx, d, T, col) => {
    ctx.save(); ctx.translate(X, T + 6); ctx.scale(0.72, 0.72); ctx.translate(-X, -(T + 6));
    const tines = [[[X + d * 4, T + 6], [X + d * 9, T - 2], [X + d * 10, T - 14]], [[X + d * 7.4, T - 1], [X + d * 12, T - 2], [X + d * 15, T - 7]], [[X + d * 9.6, T - 8], [X + d * 7, T - 12], [X + d * 5.4, T - 17]], [[X + d * 9.8, T - 10], [X + d * 14, T - 12], [X + d * 16, T - 17]]];
    for (const tn of tines) { ctx.beginPath(); ctx.moveTo(tn[0][0], tn[0][1]); ctx.quadraticCurveTo(tn[1][0], tn[1][1], tn[2][0], tn[2][1]); stroke(ctx, OUT, 4.4); }
    for (const tn of tines) { ctx.beginPath(); ctx.moveTo(tn[0][0], tn[0][1]); ctx.quadraticCurveTo(tn[1][0], tn[1][1], tn[2][0], tn[2][1]); stroke(ctx, col, 2.3); }
    ctx.restore();
  };
  CREST.antler = { back(ctx, c, T) { antler(ctx, -1, T, '#b8a27a'); }, front(ctx, c, T) { antler(ctx, 1, T, '#e0cba0'); } };
  const demonHorn = (ctx, d, T, col, tip) => {
    const f = cb([X + d * 4.4, T + 6], [X + d * 12, T - 1], [X + d * 12, T - 12], [X + d * 5, T - 19]);
    tube(ctx, f, 2.8, 0.45, col, 18, 0);
    ctx.save(); glowS(ctx, tip, 7); const q = f(1); ctx.beginPath(); ctx.arc(q[0], q[1], 0.9, 0, TAU); ctx.fillStyle = tip; ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 0.6; for (let s = 0.25; s < 0.8; s += 0.16) { const p = f(s); ctx.beginPath(); ctx.moveTo(p[0] - 1.3, p[1] + 0.4); ctx.lineTo(p[0] + 1.3, p[1] - 0.4); ctx.stroke(); }
  };
  CREST.horn_demon = { back(ctx, c, T) { demonHorn(ctx, -1, T, '#24121a', c.glow); }, front(ctx, c, T) { demonHorn(ctx, 1, T, '#3a1a22', c.glow); } };
  CREST.maedate = { front(ctx, c, T) {
    const cx = X + 3, cy = T + 3;
    ctx.beginPath(); ctx.arc(cx, cy - 10, 13, -0.367, PI + 0.367); ctx.arc(cx, cy - 13.4, 12.2, PI + 0.104, -0.104, true); ctx.closePath();
    fs(ctx, goldG(ctx, cx - 12, cy - 15, cx + 12, cy + 3, '#f2c94c'), 1.4);
    ctx.beginPath(); ctx.arc(cx, cy - 10.8, 12.4, PI * 0.62, PI * 0.95); stroke(ctx, 'rgba(255,255,255,.6)', 0.8);
    ctx.beginPath(); ctx.arc(cx, cy + 1, 2.8, 0, TAU); fs(ctx, goldG(ctx, cx, cy - 2, cx, cy + 4, '#f2c94c'), 1.1);
    gem(ctx, cx, cy + 1, 1.3, c.glow);
  } };
  const helmWing = (ctx, x, y, col, sc) => { for (let k = 0; k < 5; k++) feather(ctx, x, y, -1.45 - k * 0.3, (17 - k * 2.2) * sc, 3.8 * sc, k % 2 ? shade(col, -0.12) : col, 1); };
  CREST.wings = { back(ctx, c, T) { helmWing(ctx, X + 4, T + 5, shade(c.wing, -0.3), 0.8); }, front(ctx, c, T) { helmWing(ctx, X - 3, T + 9, c.wing, 1); ctx.beginPath(); ctx.arc(X - 3, T + 9, 1.8, 0, TAU); fs(ctx, goldG(ctx, 0, T + 7, 0, T + 11, c.trim), 0.9); } };
  CREST.spikes = { front(ctx, c, T) {
    for (let k = 0; k < 6; k++) { const a = -2.75 + k * 0.42, cx = X, cy = T + 10.4, r = 9.6;
      const bx = cx + Math.cos(a) * r, by = cy + Math.sin(a) * r, nx = Math.cos(a), ny = Math.sin(a), L = k === 2 || k === 3 ? 8 : 6;
      ctx.beginPath(); ctx.moveTo(bx - ny * 1.8, by + nx * 1.8); ctx.lineTo(bx + nx * L, by + ny * L); ctx.lineTo(bx + ny * 1.8, by - nx * 1.8); ctx.closePath();
      fs(ctx, metalG(ctx, c, bx - 2, by - L, bx + 2, by, shade(c.metalDark, 0.1)), 1.1);
    }
  } };
  CREST.fin = { front(ctx, c, T) {
    ctx.beginPath(); ctx.moveTo(-8.4, T + 9); ctx.quadraticCurveTo(-9, T - 4, -2, T - 8);
    for (let k = 0; k < 5; k++) { ctx.lineTo(-0.6 + k * 2.8, T - 9.6 + k * 1.2); ctx.lineTo(0.4 + k * 2.8, T - 6 + k * 1.2); }
    ctx.quadraticCurveTo(12, T - 2, 11, T + 5); ctx.quadraticCurveTo(X, T - 1.4, -8.4, T + 9); ctx.closePath();
    fs(ctx, metalG(ctx, c, -8, T - 10, 12, T + 6, shade(c.trim, -0.05)), 1.4);
    ctx.beginPath(); ctx.moveTo(-6.6, T + 5); ctx.quadraticCurveTo(-5, T - 3, 1, T - 5); stroke(ctx, 'rgba(255,255,255,.5)', 0.8);
    ctx.fillStyle = OUT; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-4 + k * 4, T + 0.4 + Math.abs(k - 1.5) * 0.8, 0.55, 0, TAU); ctx.fill(); }
  } };
  CREST.flame = { front(ctx, c, T, o) {
    const t = o.t || 0;
    ctx.save(); glowS(ctx, '#ff7a2a', 10);
    const layers = [['#d6301a', 6, 17, 0], ['#ff8a2a', 4.6, 13, 0.7], ['#ffe37a', 2.6, 8, 1.4]];
    for (const [col, w, h, ph] of layers) { flameShape(ctx, X - 1, T + 3, w, h + Math.sin(t * 9 + ph) * 1.6, -3 + Math.sin(t * 6 + ph) * 2.4); ctx.fillStyle = col; ctx.fill(); }
    for (let k = 0; k < 3; k++) { const life = (t * 1.2 + k / 3) % 1; ctx.globalAlpha = 1 - life; ctx.beginPath(); ctx.arc(X - 2 - life * 8 + Math.sin(t * 4 + k) * 2, T - 8 - life * 14, 1.1 - life * 0.6, 0, TAU); ctx.fillStyle = '#ffd24a'; ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(X - 1, T + 2.6, 4.4, 1.6, 0, 0, TAU); fs(ctx, goldG(ctx, 0, T + 1, 0, T + 4, c.trim), 1);
  } };
  CREST.halo = {
    back(ctx, c, T, o) { const y = T - 8 + Math.sin((o.t || 0) * 2) * 1.2; ctx.save(); glowS(ctx, '#ffe9a0', 8); ctx.beginPath(); ctx.ellipse(X - 1, y, 10, 3, -0.12, PI, TAU); stroke(ctx, 'rgba(255,233,160,.95)', 2.2); ctx.restore(); },
    front(ctx, c, T, o) { const y = T - 8 + Math.sin((o.t || 0) * 2) * 1.2; ctx.save(); glowS(ctx, '#ffe9a0', 10); ctx.beginPath(); ctx.ellipse(X - 1, y, 10, 3, -0.12, 0, PI); stroke(ctx, '#fff4c8', 2.4); ctx.restore(); }
  };
  CREST.crystal = { front(ctx, c, T, o) {
    const shards = [[-3, T + 4, 9, -0.5], [X, T + 3, 15, -0.08], [6, T + 4, 11, 0.35], [-6, T + 7, 6, -0.9], [9.4, T + 7, 6, 0.85]];
    ctx.save(); glowS(ctx, c.glow, 8 + Math.sin((o.t || 0) * 3) * 3);
    for (const [x, y, h, a] of shards) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-2.4, 0); ctx.lineTo(-1.6, -h * 0.75); ctx.lineTo(0, -h); ctx.lineTo(1.8, -h * 0.72); ctx.lineTo(2.4, 0); ctx.closePath(); fs(ctx, lg(ctx, -2, 0, 2, 0, [[0, shade(c.glow, 0.6)], [0.5, c.glow], [1, shade(c.glow, -0.45)]]), 1); ctx.beginPath(); ctx.moveTo(0, -h + 1); ctx.lineTo(0.3, -1); stroke(ctx, 'rgba(255,255,255,.7)', 0.5); ctx.restore(); }
    ctx.restore();
  } };
  CREST.banner = { back(ctx, c, T, o) {
    const t = o.t || 0, s = Math.sin(t * 4) * 1.6;
    ctx.beginPath(); ctx.moveTo(-5, T + 7); ctx.lineTo(-7, T - 18); stroke(ctx, OUT, 3); stroke(ctx, c.trim, 1.4);
    ctx.beginPath(); ctx.moveTo(-6.8, T - 17); ctx.quadraticCurveTo(-14, T - 18 + s, -22, T - 16 + s * 1.4); ctx.lineTo(-17, T - 13 + s); ctx.lineTo(-22, T - 10 + s * 1.4); ctx.quadraticCurveTo(-14, T - 11 + s, -6.2, T - 9.6); ctx.closePath();
    fs(ctx, c.plume, 1.3);
    ctx.beginPath(); ctx.moveTo(-7, T - 13.4); ctx.quadraticCurveTo(-13, T - 14 + s, -18, T - 13 + s); stroke(ctx, c.trim, 0.9);
    ctx.beginPath(); ctx.arc(-7, T - 19, 1.3, 0, TAU); fs(ctx, c.trim, 0.8);
  } };
  CREST.kuwagata = { front(ctx, c, T) {
    const b = X + 4.6, y = T + 6, g = '#f2c94c';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(b + d * 1.6, y); ctx.quadraticCurveTo(b + d * 4, y - 10, b + d * 9.6, y - 20); ctx.lineTo(b + d * 11.4, y - 18.6); ctx.quadraticCurveTo(b + d * 6.6, y - 9, b + d * 4.4, y + 0.6); ctx.closePath(); fs(ctx, goldG(ctx, b, y - 20, b, y, g), 1.3); }
    ctx.beginPath(); ctx.moveTo(b - 4, y + 1); ctx.quadraticCurveTo(b, y - 4, b + 4, y + 1); ctx.closePath(); fs(ctx, goldG(ctx, b, y - 4, b, y + 1, g), 1.1);
    gem(ctx, b, y - 0.6, 1.5, c.glow === '#7fe8ff' ? '#d6243a' : c.glow);
  } };
  CREST.crown = { front(ctx, c, T) {
    const y = T + 4, g = '#f5d36b';
    ctx.beginPath(); ctx.moveTo(-6.6, y + 2.6); for (let k = 0; k <= 4; k++) { const x = -6.6 + k * 4.2; ctx.lineTo(x, y - (k % 2 ? 4 : 7)); if (k < 4) ctx.lineTo(x + 2.1, y - 1); } ctx.lineTo(10.2, y + 2.6); ctx.closePath();
    fs(ctx, goldG(ctx, 0, y - 7, 0, y + 2.6, g), 1.3);
    for (let k = 0; k <= 4; k += 2) { ctx.beginPath(); ctx.arc(-6.6 + k * 4.2, y - 7.6, 1.1, 0, TAU); fs(ctx, '#fff4d0', 0.7); }
    gem(ctx, X, y, 1.3, '#d6243a'); gem(ctx, -3.4, y + 0.4, 0.9, '#3a8ad6'); gem(ctx, 7, y + 0.4, 0.9, '#2aa05a');
  } };
  CREST.dragon = { back(ctx, c, T, o) {
    const fl = Math.sin((o.t || 0) * 3) * 1.2;
    ctx.beginPath(); ctx.moveTo(X - 1, T - 2); ctx.lineTo(X - 9, T - 15 - fl); ctx.lineTo(X - 8, T - 10); ctx.lineTo(X - 13, T - 11 - fl); ctx.lineTo(X - 10, T - 6); ctx.lineTo(X - 14, T - 5 - fl * 0.5); ctx.lineTo(X - 5, T + 1); ctx.closePath();
    fs(ctx, lg(ctx, X - 14, T - 15, X, T, [[0, shade(c.trim, -0.1)], [1, shade(c.trim, -0.45)]]), 1.1);
  }, front(ctx, c, T) {
    const g = c.trim;
    tube(ctx, cb([X - 7, T + 6], [X - 1, T - 1], [X + 1, T - 3], [X + 4, T - 11]), 2.6, 1.7, g, 16, 3);
    tube(ctx, qb([X - 7, T + 6], [X - 13, T + 5], [X - 12, T + 10]), 1.8, 0.4, shade(g, -0.12), 10, 0);
    ctx.beginPath(); ctx.moveTo(X + 2, T - 13.6); ctx.lineTo(X + 10.6, T - 12.4); ctx.lineTo(X + 11.4, T - 10.4); ctx.lineTo(X + 7, T - 9.8); ctx.lineTo(X + 9.6, T - 8.4); ctx.lineTo(X + 4, T - 8.2); ctx.closePath();
    fs(ctx, goldG(ctx, 0, T - 14, 0, T - 8, g), 1.2);
    ctx.beginPath(); ctx.moveTo(X + 3, T - 13.4); ctx.lineTo(X - 0.6, T - 17.6); ctx.lineTo(X + 4.6, T - 13.6); ctx.closePath(); fs(ctx, BONE, 0.8);
    ctx.save(); glowS(ctx, '#ff3a2a', 5); ctx.beginPath(); ctx.arc(X + 6, T - 11.8, 0.8, 0, TAU); ctx.fillStyle = '#ff3a2a'; ctx.fill(); ctx.restore();
    ctx.fillStyle = shade(g, -0.45); for (let s2 = 0.15; s2 < 0.9; s2 += 0.2) { const p = cb([X - 7, T + 6], [X - 1, T - 1], [X + 1, T - 3], [X + 4, T - 11])(s2); ctx.beginPath(); ctx.moveTo(p[0] - 1.6, p[1] - 1.6); ctx.lineTo(p[0] - 3, p[1] - 3.6); ctx.lineTo(p[0] - 0.4, p[1] - 2.4); ctx.closePath(); ctx.fill(); }
  } };

  /* =====================================================================
     ŠTÍTY – TVARY  { path(ctx), cx, cy, es (měřítko znaku), metalField, deco(ctx,c) }
     ===================================================================== */
  const SHAPE = {};
  SHAPE.kite = { cx: 10.5, cy: -47, es: 0.95, path(ctx) { ctx.beginPath(); ctx.moveTo(1, -58.4); ctx.quadraticCurveTo(10.5, -62.6, 20, -58.4); ctx.quadraticCurveTo(21.4, -40, 10.5, -19); ctx.quadraticCurveTo(-0.4, -40, 1, -58.4); ctx.closePath(); },
    deco(ctx, c) { ctx.beginPath(); ctx.moveTo(3.4, -56.6); ctx.quadraticCurveTo(10.5, -60, 17.6, -56.6); ctx.quadraticCurveTo(18.6, -41, 10.5, -23.4); ctx.quadraticCurveTo(2.4, -41, 3.4, -56.6); ctx.closePath(); stroke(ctx, c.rim, 1.4); } };
  SHAPE.heater = { cx: 10.5, cy: -44, es: 1, path(ctx) { ctx.beginPath(); ctx.moveTo(0.5, -58); ctx.quadraticCurveTo(10.5, -60, 20.5, -58); ctx.lineTo(20.5, -45); ctx.quadraticCurveTo(19.6, -29, 10.5, -21.4); ctx.quadraticCurveTo(1.4, -29, 0.5, -45); ctx.closePath(); },
    deco(ctx, c) { ctx.beginPath(); ctx.moveTo(2.4, -56.2); ctx.quadraticCurveTo(10.5, -58, 18.6, -56.2); ctx.lineTo(18.6, -45); ctx.quadraticCurveTo(17.8, -31, 10.5, -24); ctx.quadraticCurveTo(3.2, -31, 2.4, -45); ctx.closePath(); stroke(ctx, c.rim, 1.4); } };
  SHAPE.round = { cx: 9, cy: -41, es: 1.05, path(ctx) { ctx.beginPath(); ctx.arc(9, -41, 12.6, 0, TAU); },
    deco(ctx, c) { ctx.beginPath(); ctx.arc(9, -41, 11.4, 0, TAU); stroke(ctx, OUT, 3.4); stroke(ctx, c.metal, 2); ctx.fillStyle = OUT; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; ctx.beginPath(); ctx.arc(9 + Math.cos(a) * 11.4, -41 + Math.sin(a) * 11.4, 0.6, 0, TAU); ctx.fill(); } } };
  SHAPE.buckler = { cx: 9, cy: -42, es: 0.62, metalField: true, path(ctx) { ctx.beginPath(); ctx.arc(9, -42, 9, 0, TAU); },
    deco(ctx, c) { for (const r of [7.6, 5.6]) { ctx.beginPath(); ctx.arc(9, -42, r, 0, TAU); stroke(ctx, shade(c.metal, -0.3), 0.9); } ctx.beginPath(); ctx.arc(9, -42, 8.8, PI * 1.1, PI * 1.6); stroke(ctx, 'rgba(255,255,255,.6)', 1); ctx.fillStyle = c.rim; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.beginPath(); ctx.arc(9 + Math.cos(a) * 7.8, -42 + Math.sin(a) * 7.8, 0.7, 0, TAU); ctx.fill(); } } };
  SHAPE.pavise = { cx: 10.4, cy: -44, es: 1.1, path(ctx) { ctx.beginPath(); ctx.moveTo(0, -61); ctx.quadraticCurveTo(0, -64.6, 3.6, -64.6); ctx.lineTo(17, -64.6); ctx.quadraticCurveTo(20.6, -64.6, 20.6, -61); ctx.lineTo(21.4, -20); ctx.lineTo(-0.8, -20); ctx.closePath(); },
    field(ctx, c) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(8.2, -66, 4.4, 47); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(8.2, -66, 1.2, 47); },
    deco(ctx, c) { ctx.beginPath(); ctx.moveTo(2.4, -60.6); ctx.lineTo(2.4, -62.4); ctx.lineTo(18.2, -62.4); ctx.lineTo(18.8, -22.4); ctx.lineTo(1.6, -22.4); ctx.closePath(); stroke(ctx, c.rim, 1.4); } };
  SHAPE.tower = { cx: 10, cy: -43, es: 1.25, path(ctx) { ctx.beginPath(); ctx.moveTo(-1.4, -66); ctx.quadraticCurveTo(10, -69.4, 21.4, -66); ctx.lineTo(21.4, -17); ctx.quadraticCurveTo(10, -13.6, -1.4, -17); ctx.closePath(); },
    deco(ctx, c) { for (const y of [-64.4, -18.6]) { ctx.beginPath(); ctx.moveTo(-1, y); ctx.quadraticCurveTo(10, y + (y < -40 ? -3 : 3), 21, y); stroke(ctx, OUT, 3.6); stroke(ctx, c.metal, 2.2); } ctx.fillStyle = OUT; for (const [x, y] of [[1, -64], [19, -64], [1, -19], [19, -19], [10, -66.6], [10, -16.2]]) { ctx.beginPath(); ctx.arc(x, y, 0.7, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.moveTo(-0.4, -60); ctx.lineTo(-0.4, -22); stroke(ctx, 'rgba(255,255,255,.3)', 1); } };
  SHAPE.oval = { cx: 10, cy: -41, es: 1.05, path(ctx) { ctx.beginPath(); ctx.ellipse(10, -41, 10.4, 16, 0, 0, TAU); },
    deco(ctx, c) { ctx.beginPath(); ctx.ellipse(10, -41, 8.8, 14.4, 0, 0, TAU); stroke(ctx, c.rim, 1.3); } };
  SHAPE.hex = { cx: 10, cy: -41, es: 0.95, path(ctx) { ctx.beginPath(); ctx.moveTo(10, -60); ctx.lineTo(20.6, -52); ctx.lineTo(20.6, -30); ctx.lineTo(10, -22); ctx.lineTo(-0.6, -30); ctx.lineTo(-0.6, -52); ctx.closePath(); },
    deco(ctx, c) { ctx.beginPath(); ctx.moveTo(10, -57.4); ctx.lineTo(18.4, -51); ctx.lineTo(18.4, -31); ctx.lineTo(10, -24.6); ctx.lineTo(1.6, -31); ctx.lineTo(1.6, -51); ctx.closePath(); stroke(ctx, c.rim, 1.3); ctx.fillStyle = c.rim; for (const [x, y] of [[10, -60], [20.6, -52], [20.6, -30], [10, -22], [-0.6, -30], [-0.6, -52]]) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, TAU); fs(ctx, c.metal, 0.8); } } };
  SHAPE.crescent = { cx: 10, cy: -36, es: 0.9, path(ctx) { ctx.beginPath(); ctx.moveTo(-1.4, -58); ctx.quadraticCurveTo(4, -47, 10, -47.6); ctx.quadraticCurveTo(16, -47, 21.4, -58); ctx.quadraticCurveTo(24, -29, 10, -21); ctx.quadraticCurveTo(-4, -29, -1.4, -58); ctx.closePath(); },
    deco(ctx, c) { ctx.beginPath(); ctx.moveTo(0.4, -53); ctx.quadraticCurveTo(5, -45, 10, -45.4); ctx.quadraticCurveTo(15, -45, 19.6, -53); stroke(ctx, c.rim, 1.3); for (const x of [-1.4, 21.4]) { ctx.beginPath(); ctx.arc(x, -58, 1.6, 0, TAU); fs(ctx, c.metal, 0.9); } } };
  SHAPE.spiked = { cx: 9, cy: -41, es: 0.85, path(ctx) { ctx.beginPath(); ctx.arc(9, -41, 11.6, 0, TAU); },
    pre(ctx, c) { for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + 0.3, x = 9 + Math.cos(a) * 11, y = -41 + Math.sin(a) * 11, nx = Math.cos(a), ny = Math.sin(a); ctx.beginPath(); ctx.moveTo(x - ny * 2.2, y + nx * 2.2); ctx.lineTo(x + nx * 5.6, y + ny * 5.6); ctx.lineTo(x + ny * 2.2, y - nx * 2.2); ctx.closePath(); fs(ctx, metalG(ctx, c, x - 3, y - 3, x + 3, y + 3), 1.1); } },
    deco(ctx, c) { ctx.beginPath(); ctx.arc(9, -41, 10.4, 0, TAU); stroke(ctx, OUT, 3.2); stroke(ctx, c.metalDark, 1.8); } };
  SHAPE.gothic = { cx: 10, cy: -41, es: 0.92, path(ctx) { ctx.beginPath(); ctx.moveTo(0.4, -58); ctx.lineTo(12.6, -58); ctx.quadraticCurveTo(13.4, -53.4, 17.4, -53.6); ctx.quadraticCurveTo(19.6, -54, 21, -58.4); ctx.lineTo(20.6, -43); ctx.quadraticCurveTo(19, -27, 10.5, -20.6); ctx.quadraticCurveTo(2, -27, 0.4, -43); ctx.closePath(); },
    field(ctx, c) { ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(2 + k * 4, -58); ctx.quadraticCurveTo(4 + k * 3, -40, 10.5, -21); ctx.stroke(); } ctx.strokeStyle = 'rgba(255,255,255,.14)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(3 + k * 4, -58); ctx.quadraticCurveTo(5 + k * 3, -40, 11.2, -21.4); ctx.stroke(); } },
    deco(ctx, c) { ctx.beginPath(); ctx.moveTo(15.2, -53.4); ctx.quadraticCurveTo(17.4, -52.6, 19.6, -55); stroke(ctx, c.rim, 1.2); ctx.beginPath(); ctx.moveTo(2.2, -56); ctx.lineTo(11.4, -56); stroke(ctx, c.rim, 1.2); } };
  SHAPE.tate = { cx: 10, cy: -44, es: 0.95, path(ctx) { rr(ctx, 0.6, -59.6, 18.8, 31, 1.4); },
    deco(ctx, c) { rr(ctx, 0.6, -59.6, 18.8, 31, 1.4); stroke(ctx, OUT, 4.2); stroke(ctx, '#1a1418', 2.4); for (const y of [-56, -32]) { ctx.beginPath(); ctx.moveTo(1.8, y); ctx.lineTo(18.2, y); stroke(ctx, c.rim, 1); } ctx.beginPath(); ctx.moveTo(10, -28.6); ctx.quadraticCurveTo(9, -24, 11, -20.4); stroke(ctx, OUT, 2.6); stroke(ctx, c.lace, 1.4); ctx.beginPath(); ctx.arc(11, -20, 1.6, 0, TAU); fs(ctx, c.lace, 0.9); } };
  SHAPE.viking = { cx: 8.6, cy: -41, es: 1.0, boss: true, path(ctx) { ctx.beginPath(); ctx.arc(8.6, -41, 13, 0, TAU); },
    field(ctx, c) { ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 0.8; for (let x = -3; x < 22; x += 3.6) { ctx.beginPath(); ctx.moveTo(x, -55); ctx.lineTo(x + 0.4, -27); ctx.stroke(); } },
    deco(ctx, c) { ctx.beginPath(); ctx.arc(8.6, -41, 12.2, 0, TAU); stroke(ctx, OUT, 3.4); stroke(ctx, c.leather, 2); ctx.strokeStyle = shade(c.leather, 0.35); ctx.lineWidth = 0.6; for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; ctx.beginPath(); ctx.moveTo(8.6 + Math.cos(a) * 11.6, -41 + Math.sin(a) * 11.6); ctx.lineTo(8.6 + Math.cos(a + 0.12) * 12.8, -41 + Math.sin(a + 0.12) * 12.8); ctx.stroke(); } } };

  /* ŠTÍTY – ZNAKY (střed 0,0, poloměr ~7.5) */
  const EMBLEM = {};
  const eFs = (ctx, e) => fs(ctx, e, 0.9);
  EMBLEM.none = { draw() {} };
  EMBLEM.lion = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, r = k % 2 ? 5.6 : 7.6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.05); } ctx.closePath(); eFs(ctx, e);
    ctx.beginPath(); ctx.arc(-3.4, -3.6, 1.6, 0, TAU); ctx.arc(3.4, -3.6, 1.6, 0, TAU); eFs(ctx, shade(e, 0.15));
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-4.6, 4, 0, 5); ctx.quadraticCurveTo(4.6, 4, 4, -2); ctx.quadraticCurveTo(0, -5, -4, -2); ctx.closePath(); eFs(ctx, shade(e, 0.3));
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(-1.7, -0.6, 0.7, 0, TAU); ctx.arc(1.7, -0.6, 0.7, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1.1, 1.4); ctx.lineTo(1.1, 1.4); ctx.lineTo(0, 2.6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 2.6); ctx.lineTo(0, 3.4); ctx.moveTo(-1.6, 3.6); ctx.quadraticCurveTo(0, 4.4, 1.6, 3.6); stroke(ctx, OUT, 0.6);
  } };
  EMBLEM.eagle = { noBoss: true, draw(ctx, e) {
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 1.4, -1.4); ctx.quadraticCurveTo(d * 5, -6.6, d * 8, -5.6); ctx.lineTo(d * 7, -3.6); ctx.lineTo(d * 8, -2.6); ctx.lineTo(d * 6.6, -1); ctx.lineTo(d * 7.2, 0.4); ctx.lineTo(d * 5.4, 1.2); ctx.quadraticCurveTo(d * 3, 1.6, d * 1.4, 2.4); ctx.closePath(); eFs(ctx, e); }
    ctx.beginPath(); ctx.ellipse(0, 0.6, 2.2, 4, 0, 0, TAU); eFs(ctx, e);
    ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(-3, 7.6); ctx.lineTo(0, 6.4); ctx.lineTo(3, 7.6); ctx.lineTo(2, 4); ctx.closePath(); eFs(ctx, e);
    ctx.beginPath(); ctx.arc(0.4, -4.4, 1.9, 0, TAU); eFs(ctx, e);
    ctx.beginPath(); ctx.moveTo(2, -4.8); ctx.lineTo(4, -4); ctx.lineTo(2, -3.2); ctx.closePath(); eFs(ctx, shade(e, 0.3));
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(0.9, -4.8, 0.45, 0, TAU); ctx.fill();
  } };
  EMBLEM.dragon = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.moveTo(-1, -1.4); ctx.lineTo(-6.4, -7.6); ctx.lineTo(-5.4, -4.4); ctx.lineTo(-8, -4); ctx.lineTo(-5.6, -1.8); ctx.lineTo(-7.8, 0.2); ctx.lineTo(-2.4, 1); ctx.closePath(); eFs(ctx, shade(e, -0.18));
    ctx.beginPath(); ctx.moveTo(1.6, -5.8); ctx.lineTo(6.6, -6.4); ctx.lineTo(7.6, -4.6); ctx.lineTo(4.4, -4); ctx.lineTo(6, -2.8); ctx.lineTo(3, -2.6);
    ctx.quadraticCurveTo(1.6, 0, 3, 2.6); ctx.lineTo(4.6, 5.6); ctx.lineTo(2.6, 5.6); ctx.lineTo(1.4, 3.6); ctx.quadraticCurveTo(-1, 5.4, -3.4, 4.6); ctx.quadraticCurveTo(-6.4, 4.4, -7.4, 7.4); ctx.quadraticCurveTo(-7.8, 2.6, -3.6, 2.4);
    ctx.quadraticCurveTo(-1.4, 2, -1.2, 0); ctx.quadraticCurveTo(-1, -4, 1.6, -5.8); ctx.closePath(); eFs(ctx, e);
    ctx.beginPath(); ctx.moveTo(1.8, -5.6); ctx.lineTo(0.4, -8.4); ctx.lineTo(3, -6); ctx.closePath(); eFs(ctx, e);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(4.2, -5.2, 0.5, 0, TAU); ctx.fill();
  } };
  EMBLEM.wolf = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.moveTo(-5, 6.6); ctx.quadraticCurveTo(-6, 0, -3, -3); ctx.lineTo(-3.4, -7.6); ctx.lineTo(-0.6, -4.6); ctx.lineTo(1.6, -6.4); ctx.lineTo(1.6, -3.6); ctx.lineTo(7.4, -6.6); ctx.lineTo(4.4, -2.6); ctx.lineTo(7, -1.4); ctx.lineTo(3, 0); ctx.quadraticCurveTo(1.6, 3, 3, 6.6); ctx.closePath(); eFs(ctx, e);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.moveTo(0, -3.4); ctx.lineTo(2, -3.8); ctx.lineTo(1.2, -2.8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3, 1); ctx.lineTo(-1, 3); ctx.moveTo(-3.4, 3.4); ctx.lineTo(-1.4, 5.4); stroke(ctx, shade(e, -0.4), 0.6);
  } };
  const crossPath = (ctx, a, b) => { ctx.beginPath(); ctx.moveTo(-a, -7.4); ctx.lineTo(a, -7.4); ctx.lineTo(a, -b - 1.6); ctx.lineTo(6.6, -b - 1.6); ctx.lineTo(6.6, b - 1.6); ctx.lineTo(a, b - 1.6); ctx.lineTo(a, 7.4); ctx.lineTo(-a, 7.4); ctx.lineTo(-a, b - 1.6); ctx.lineTo(-6.6, b - 1.6); ctx.lineTo(-6.6, -b - 1.6); ctx.lineTo(-a, -b - 1.6); ctx.closePath(); };
  EMBLEM.cross = { draw(ctx, e) { crossPath(ctx, 1.4, 1.4); eFs(ctx, e); } };
  EMBLEM.cross_pattee = { draw(ctx, e) {
    const arm = (rot) => { const p = [[-1, -1], [-3.4, -7.4], [3.4, -7.4], [1, -1]]; const cs = Math.cos(rot), sn = Math.sin(rot); return p.map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]); };
    ctx.beginPath(); for (let k = 0; k < 4; k++) { const pts = arm(k * PI / 2); pts.forEach((q, i) => (i === 0 && k === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]))); } ctx.closePath(); eFs(ctx, e);
  } };
  EMBLEM.cross_celtic = { draw(ctx, e) {
    ctx.beginPath(); ctx.arc(0, -1.6, 4.6, 0, TAU); stroke(ctx, OUT, 3.4); stroke(ctx, e, 1.8);
    crossPath(ctx, 1.3, 1.3); eFs(ctx, e);
    ctx.beginPath(); ctx.arc(0, -1.6, 1.2, 0, TAU); ctx.fillStyle = shade(e, -0.4); ctx.fill();
  } };
  EMBLEM.sun = { draw(ctx, e) {
    star(ctx, 0, 0, 7.8, 4.4, 12, 0); eFs(ctx, e);
    ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, TAU); eFs(ctx, shade(e, 0.25));
    ctx.fillStyle = shade(e, -0.5); ctx.beginPath(); ctx.arc(-1.3, -0.8, 0.5, 0, TAU); ctx.arc(1.3, -0.8, 0.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0.6, 1.6, 0.3, PI - 0.3); stroke(ctx, shade(e, -0.5), 0.6);
  } };
  EMBLEM.moon = { draw(ctx, e) {
    ctx.beginPath(); ctx.arc(-0.6, 0, 7, 0.75, TAU - 0.75); ctx.arc(2.4, -0.4, 5.4, TAU - 1.05, 1.05, true); ctx.closePath(); eFs(ctx, e);
    star(ctx, 4, -3.6, 1.8, 0.7, 5); eFs(ctx, e); star(ctx, 5, 2.6, 1.2, 0.5, 5); eFs(ctx, e);
  } };
  EMBLEM.star = { draw(ctx, e) { star(ctx, 0, 0, 8, 2.6, 8, -PI / 2); eFs(ctx, e); star(ctx, 0, 0, 3.6, 1.6, 4, -PI / 4); eFs(ctx, shade(e, 0.3)); } };
  EMBLEM.tree = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.moveTo(-1.2, 1); ctx.lineTo(-1.6, 5.4); ctx.lineTo(-4.4, 7.4); ctx.lineTo(4.4, 7.4); ctx.lineTo(1.6, 5.4); ctx.lineTo(1.2, 1); ctx.closePath(); eFs(ctx, shade(e, -0.2));
    for (const [x, y, r] of [[-3.4, -1.4, 3.2], [3.4, -1.4, 3.2], [0, -4.4, 3.8], [-1.6, -0.4, 2.6], [1.8, -0.4, 2.6]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); eFs(ctx, e); }
    ctx.fillStyle = shade(e, 0.35); for (const [x, y] of [[-2, -5], [2.4, -3], [-3.6, -2]]) { ctx.beginPath(); ctx.arc(x, y, 0.7, 0, TAU); ctx.fill(); }
  } };
  EMBLEM.skull = { noBoss: true, draw(ctx, e) {
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-6.4 * d, 7); ctx.lineTo(6.4 * d, -1.4); stroke(ctx, OUT, 3.4); stroke(ctx, e, 1.8); }
    ctx.beginPath(); ctx.arc(0, -2.4, 5, PI * 0.85, PI * 2.15); ctx.lineTo(2.6, 3.4); ctx.lineTo(-2.6, 3.4); ctx.closePath(); eFs(ctx, e);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.ellipse(-1.9, -2.2, 1.4, 1.6, 0, 0, TAU); ctx.ellipse(1.9, -2.2, 1.4, 1.6, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -0.4); ctx.lineTo(-0.7, 0.9); ctx.lineTo(0.7, 0.9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1.2, 2); ctx.lineTo(-1.2, 3.4); ctx.moveTo(0, 2); ctx.lineTo(0, 3.4); ctx.moveTo(1.2, 2); ctx.lineTo(1.2, 3.4); stroke(ctx, OUT, 0.5);
  } };
  EMBLEM.axe = { noBoss: true, draw(ctx, e) {
    for (const d of [-1, 1]) {
      ctx.save(); ctx.rotate(d * 0.6);
      ctx.beginPath(); ctx.moveTo(0, 7.6); ctx.lineTo(0, -7); stroke(ctx, OUT, 2.8); stroke(ctx, shade(e, -0.3), 1.2);
      ctx.beginPath(); ctx.moveTo(d * 0.6, -6.6); ctx.quadraticCurveTo(d * 4, -7.6, d * 5.4, -3); ctx.quadraticCurveTo(d * 3.6, -3.2, d * 0.6, -2.6); ctx.closePath(); eFs(ctx, e);
      ctx.restore();
    }
  } };
  EMBLEM.runes = { draw(ctx, e, o) {
    ctx.save();
    const R = [[[0, -3], [0, 3], [0, -3], [2.4, -0.6], [0, -3]], [[-1.4, -3], [-1.4, 3], [-1.4, -1.4], [1.4, -3]], [[0, -3], [0, 3], [-2, -1], [2, 1]]];
    const pos = [[0, -4.6], [-4.4, 2.6], [4.4, 2.6]];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); R.forEach((r, i) => { const [px, py] = pos[i]; for (let j = 0; j < r.length; j += 2) { ctx.moveTo(px + r[j][0] * 0.95, py + r[j][1] * 0.95); if (r[j + 1]) ctx.lineTo(px + r[j + 1][0] * 0.95, py + r[j + 1][1] * 0.95); } }); };
    path(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
    glowS(ctx, e, 5); path(); ctx.lineWidth = 1.5; ctx.strokeStyle = e; ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, 7.8, 0, TAU); stroke(ctx, OUT, 2.4); stroke(ctx, e, 1);
  } };
  EMBLEM.mon = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.arc(0, 0, 7.4, 0, TAU); eFs(ctx, e);
    ctx.beginPath(); ctx.arc(0, 0, 6.2, 0, TAU); ctx.fillStyle = shade(e, -0.55); ctx.fill();
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU - PI / 2; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.arc(3.2, 0, 1.9, 0, TAU); ctx.fillStyle = e; ctx.fill(); ctx.beginPath(); ctx.moveTo(5.1, 0); ctx.arc(0, 0, 5.1, 0, 1.75); ctx.quadraticCurveTo(1.6, 2.6, 1.3, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
  } };
  EMBLEM.flame = { noBoss: true, draw(ctx, e) {
    flameShape(ctx, 0, 6, 5.4, 14, 1.6); eFs(ctx, e);
    flameShape(ctx, 0.2, 6, 3, 9, 1); ctx.fillStyle = shade(e, 0.45); ctx.fill();
  } };
  EMBLEM.fleur = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.moveTo(0, -7.6); ctx.quadraticCurveTo(2.8, -4, 0.9, 1.6); ctx.lineTo(-0.9, 1.6); ctx.quadraticCurveTo(-2.8, -4, 0, -7.6); ctx.closePath(); eFs(ctx, e);
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 0.8, 1.2); ctx.quadraticCurveTo(d * 2, -4.4, d * 5.6, -3.6); ctx.quadraticCurveTo(d * 7.4, -1, d * 5, 1); ctx.quadraticCurveTo(d * 4.4, -1.6, d * 2.6, 2.4); ctx.closePath(); eFs(ctx, e); }
    rr(ctx, -4, 1.6, 8, 1.8, 0.6); eFs(ctx, e);
    ctx.beginPath(); ctx.moveTo(-1, 3.4); ctx.lineTo(-2.4, 7.4); ctx.lineTo(0, 5.6); ctx.lineTo(2.4, 7.4); ctx.lineTo(1, 3.4); ctx.closePath(); eFs(ctx, e);
  } };
  EMBLEM.raven = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.moveTo(-7, -1); ctx.quadraticCurveTo(-3, -7.4, 1, -2.6); ctx.quadraticCurveTo(2, -5.6, 4.6, -5); ctx.lineTo(7.6, -4); ctx.lineTo(5, -3.2); ctx.quadraticCurveTo(4.4, 1.4, 1, 3.4); ctx.lineTo(-2.6, 7); ctx.lineTo(-2, 3.6); ctx.quadraticCurveTo(-5, 3, -7, -1); ctx.closePath(); eFs(ctx, e);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(3.8, -4.2, 0.55, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -1.4); ctx.quadraticCurveTo(-2, -3, 0, -1); stroke(ctx, shade(e, -0.45), 0.6);
  } };
  EMBLEM.chalice = { noBoss: true, draw(ctx, e) {
    ctx.beginPath(); ctx.moveTo(-5.4, -6.4); ctx.lineTo(5.4, -6.4); ctx.quadraticCurveTo(5, 0, 0.8, 0.8); ctx.lineTo(0.8, 4.6); ctx.lineTo(3.6, 6.8); ctx.lineTo(-3.6, 6.8); ctx.lineTo(-0.8, 4.6); ctx.lineTo(-0.8, 0.8); ctx.quadraticCurveTo(-5, 0, -5.4, -6.4); ctx.closePath(); eFs(ctx, e);
    ctx.beginPath(); ctx.ellipse(0, -6.4, 5.4, 1.2, 0, 0, TAU); eFs(ctx, shade(e, 0.25));
  } };

  /* pole štítu (heraldické dělení) */
  const PATTERN = {
    none() {},
    split(ctx, f2) { ctx.fillStyle = f2; ctx.fillRect(10.4, -70, 16, 60); },
    quarters(ctx, f2, S) { ctx.fillStyle = f2; ctx.fillRect(S.cx, -70, 16, S.cy + 70); ctx.fillRect(-6, S.cy, S.cx + 6, 40); },
    bend(ctx, f2, S) { ctx.beginPath(); ctx.moveTo(-4, S.cy - 18); ctx.lineTo(2, S.cy - 22); ctx.lineTo(26, S.cy + 18); ctx.lineTo(20, S.cy + 22); ctx.closePath(); ctx.fillStyle = f2; ctx.fill(); },
    stripes(ctx, f2) { ctx.fillStyle = f2; for (let y = -66; y < -14; y += 7) ctx.fillRect(-6, y, 32, 3.5); },
    chevron(ctx, f2, S) { ctx.beginPath(); ctx.moveTo(-6, S.cy + 8); ctx.lineTo(S.cx, S.cy - 4); ctx.lineTo(26, S.cy + 8); ctx.lineTo(26, S.cy + 14); ctx.lineTo(S.cx, S.cy + 2); ctx.lineTo(-6, S.cy + 14); ctx.closePath(); ctx.fillStyle = f2; ctx.fill(); },
    bordure(ctx, f2, S) { S.path(ctx); ctx.lineWidth = 5; ctx.strokeStyle = f2; ctx.stroke(); },
    checky(ctx, f2) { ctx.fillStyle = f2; for (let y = -66, i = 0; y < -14; y += 4, i++) for (let x = -4 + (i % 2) * 4; x < 26; x += 8) ctx.fillRect(x, y, 4, 4); },
    rays(ctx, f2, S) { ctx.fillStyle = f2; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.beginPath(); ctx.moveTo(S.cx, S.cy); ctx.arc(S.cx, S.cy, 30, a, a + TAU / 16); ctx.closePath(); ctx.fill(); } }
  };

  /* =====================================================================
     OZDOBY ZBROJE: vzadu / hruď / rameno / aura
     každý díl: { back?(ctx,c,o), chest?(ctx,c,o), top?(ctx,c,o) }
     ===================================================================== */
  const flowOf = o => (o.moving ? Math.sin((o.w || 0) * 0.9) * 3 : Math.sin((o.t || 0) * 2) * 1.2);
  const capePath = (ctx, fl, len, wid) => {
    ctx.beginPath(); ctx.moveTo(-7, -53); ctx.quadraticCurveTo(-18 - fl, -36, -wid - fl * 1.5, -len);
    ctx.quadraticCurveTo(-wid * 0.55 - fl, -len + 3, -6 - fl * 0.6, -len + 1); ctx.quadraticCurveTo(-5, -30, 3, -51); ctx.closePath();
  };
  const BACK = {};
  BACK.cape = { back(ctx, c, o) {
    const fl = flowOf(o);
    capePath(ctx, fl, 4, 24);
    fs(ctx, lg(ctx, -24, -50, 2, -4, [[0, shade(c.cape, 0.12)], [1, shade(c.cape, -0.3)]]), 1.9);
    ctx.beginPath(); ctx.moveTo(-24 - fl * 1.5, -4); ctx.quadraticCurveTo(-13 - fl, -1, -6 - fl * 0.6, -3); stroke(ctx, OUT, 3.6); stroke(ctx, c.trim, 2);
    ctx.strokeStyle = shade(c.cape, -0.4); ctx.lineWidth = 1; for (const k of [0, 1]) { ctx.beginPath(); ctx.moveTo(-9 - k * 4, -44); ctx.quadraticCurveTo(-14 - k * 3 - fl, -26, -14 - k * 5 - fl * 1.3, -7); ctx.stroke(); }
  }, chest(ctx, c) { for (const x of [-6, 6.4]) { ctx.beginPath(); ctx.arc(x, -51.6, 1.9, 0, TAU); fs(ctx, goldG(ctx, x, -53.6, x, -49.6, c.trim), 1); } ctx.beginPath(); ctx.moveTo(-4.6, -51.4); ctx.quadraticCurveTo(0.2, -49, 5, -51.4); stroke(ctx, OUT, 2); stroke(ctx, c.trim, 0.9); } };
  BACK.tattered = { back(ctx, c, o) {
    const fl = flowOf(o), t = o.t || 0, col = shade(c.cape, -0.15);
    ctx.beginPath(); ctx.moveTo(-7, -53); ctx.quadraticCurveTo(-18 - fl, -36, -23 - fl * 1.5, -8);
    const pts = [[-23, -8], [-20, -2], [-18, -9], [-15, -1], [-13, -7], [-10, 0], [-8, -6], [-6, -2]];
    pts.forEach(([x, y], i) => ctx.lineTo(x - fl * (1.5 - i * 0.12), y + Math.sin(t * 5 + i) * 0.8));
    ctx.quadraticCurveTo(-5, -30, 3, -51); ctx.closePath();
    ctx.moveTo(-14 - fl, -26); ctx.ellipse(-15 - fl, -26, 1.6, 2.6, 0.3, 0, TAU); ctx.moveTo(-10 - fl * 0.8, -15); ctx.ellipse(-11 - fl * 0.8, -15, 1.2, 1.8, -0.2, 0, TAU);
    fsEO(ctx, lg(ctx, -24, -50, 0, 0, [[0, col], [1, shade(col, -0.45)]]), 1.7);
    ctx.strokeStyle = shade(col, -0.5); ctx.lineWidth = 0.8; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-8 - k * 3, -46); ctx.quadraticCurveTo(-12 - k * 3 - fl, -26, -12 - k * 4 - fl * 1.3, -6); ctx.stroke(); }
  } };
  BACK.furcloak = {
    back(ctx, c, o) { const fl = flowOf(o) * 0.7; capePath(ctx, fl, 8, 22); fs(ctx, lg(ctx, -22, -50, 0, -6, [[0, shade(c.cape, 0.05)], [1, shade(c.cape, -0.35)]]), 1.9);
      ctx.beginPath(); ctx.moveTo(-22 - fl * 1.5, -8); for (let k = 0; k <= 8; k++) ctx.lineTo(-22 - fl * 1.5 + k * 2 + (k % 2) * 0.6, -8 + (k % 2 ? 2.2 : 0)); stroke(ctx, OUT, 3.6); stroke(ctx, shade(c.fur, 0.3), 2.2); },
    chest(ctx, c) {
      ctx.beginPath(); ctx.moveTo(-12.6, -50.6); for (let k = 0; k <= 12; k++) { const a = PI * 1.05 + k / 12 * PI * 0.9; ctx.lineTo(0.4 + Math.cos(a) * (12.4 + (k % 2) * 1.6), -50 + Math.sin(a) * (6.8 + (k % 2) * 1.2)); }
      ctx.lineTo(12.4, -49); for (let k = 12; k >= 0; k--) { const a = PI * 1.05 + k / 12 * PI * 0.9; ctx.lineTo(0.4 + Math.cos(a) * (10 + (k % 2) * 1.4), -46.6 + Math.sin(a) * 2.4 + (k % 2) * 1.2); } ctx.closePath();
      fs(ctx, lg(ctx, 0, -58, 0, -44, [[0, shade(c.fur, 0.3)], [1, shade(c.fur, -0.25)]]), 1.5);
      ctx.strokeStyle = shade(c.fur, -0.35); ctx.lineWidth = 0.7; for (let x = -9; x < 11; x += 2.6) { ctx.beginPath(); ctx.moveTo(x, -53.6); ctx.lineTo(x + 0.8, -49.6); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0.4, -48.6, 1.8, 0, TAU); fs(ctx, goldG(ctx, 0, -50.4, 0, -46.8, c.trim), 1);
    } };
  BACK.quiver = { back(ctx, c, o) {
    ctx.save(); ctx.translate(-7.6, -54); ctx.rotate(-0.42);
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-3 + i * 2, 0); ctx.lineTo(-3.4 + i * 2.2, -10); stroke(ctx, OUT, 1.8); stroke(ctx, '#c9a06a', 0.8); feather(ctx, -3.4 + i * 2.2, -8.4, -PI / 2, 5.4, 1.6, i % 2 ? c.plume : shade(c.plume, 0.35), 0.8); }
    rr(ctx, -4.6, -1, 9.2, 26, 2.6); fs(ctx, lg(ctx, -4.6, 0, 4.6, 0, [[0, shade(c.leather, 0.2)], [1, shade(c.leather, -0.3)]]), 1.6);
    for (const y of [1.4, 21]) { rr(ctx, -5, y, 10, 2.6, 1); fs(ctx, goldG(ctx, 0, y, 0, y + 2.6, c.trim), 1); }
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(2.6, 11); ctx.lineTo(0, 16); ctx.lineTo(-2.6, 11); ctx.closePath(); fs(ctx, c.trim, 0.9); gem(ctx, 0, 11, 1, c.glow);
    ctx.restore();
  } };
  const sashiFlag = (ctx, c, o, col, emb) => {
    const sway = Math.sin((o.t || 0) * 3 + (o.w || 0) * 0.5) * 1.5;
    ctx.beginPath(); ctx.moveTo(-7, -38); ctx.lineTo(-9, -106); stroke(ctx, OUT, 3.8); stroke(ctx, '#2a1a10', 2);
    ctx.beginPath(); ctx.moveTo(-9, -104); ctx.lineTo(-25 + sway, -104); stroke(ctx, OUT, 3.2); stroke(ctx, '#2a1a10', 1.4);
    ctx.beginPath(); ctx.moveTo(-9, -103); ctx.lineTo(-24.6 + sway, -103); ctx.lineTo(-23.4 + sway * 1.3, -70); ctx.lineTo(-9, -70); ctx.closePath();
    fs(ctx, lg(ctx, -24, -100, -9, -70, [[0, shade(col, 0.15)], [1, shade(col, -0.25)]]), 1.6);
    ctx.save(); ctx.translate(-16.4 + sway * 0.7, -86.6); ctx.scale(0.7, 0.7); emb(ctx); ctx.restore();
    return sway;
  };
  BACK.sashi_mon = { noSashi: true, back(ctx, c, o) { sashiFlag(ctx, c, o, c.sashi, cx => EMBLEM.mon.draw(cx, c.mon)); } };
  BACK.sashi_twin = { noSashi: true, back(ctx, c, o) {
    const sway = Math.sin((o.t || 0) * 3 + (o.w || 0) * 0.5) * 1.5;
    for (const [px, h, col] of [[-5, -100, shade(c.sashi, -0.2)], [-10, -108, c.sashi]]) {
      ctx.beginPath(); ctx.moveTo(px + 2, -38); ctx.lineTo(px, h - 2); stroke(ctx, OUT, 3.4); stroke(ctx, '#2a1a10', 1.6);
      ctx.beginPath(); ctx.moveTo(px, h); ctx.lineTo(px - 8 + sway, h + 1); ctx.lineTo(px - 7.4 + sway * 1.3, h + 34); ctx.lineTo(px - 0.4, h + 33); ctx.closePath(); fs(ctx, col, 1.5);
      ctx.beginPath(); ctx.moveTo(px - 0.6, h + 8); ctx.lineTo(px - 7.6 + sway, h + 9); stroke(ctx, c.mon, 1.4);
    }
    ctx.save(); ctx.translate(-14 + sway * 0.6, -88); ctx.scale(0.42, 0.42); EMBLEM.mon.draw(ctx, c.mon); ctx.restore();
    ctx.fillStyle = '#f2c94c'; for (const [x, y] of [[-10, -109], [-5, -101]]) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, TAU); fs(ctx, '#f2c94c', 0.8); }
  } };
  BACK.horo = { noSashi: true, back(ctx, c, o) {
    const t = o.t || 0, puff = Math.sin(t * 2.4) * 1 + (o.moving ? 2 : 0);
    ctx.beginPath(); ctx.moveTo(-4, -56); ctx.bezierCurveTo(-20 - puff, -84, -38 - puff, -50, -24 - puff * 0.5, -22); ctx.quadraticCurveTo(-14, -18, -6, -30); ctx.closePath();
    fs(ctx, lg(ctx, -36, -76, -6, -24, [[0, shade(c.sashi, 0.3)], [0.5, c.sashi], [1, shade(c.sashi, -0.4)]]), 1.9);
    ctx.strokeStyle = shade(c.sashi, -0.4); ctx.lineWidth = 0.9; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-5, -54 + k * 8); ctx.quadraticCurveTo(-24 - puff - k * 2, -62 + k * 10, -22 - puff * 0.5 + k * 2, -26 + k); ctx.stroke(); }
    ctx.save(); ctx.translate(-20 - puff * 0.6, -52); ctx.scale(0.62, 0.62); EMBLEM.mon.draw(ctx, c.mon); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-4, -56); ctx.bezierCurveTo(-20 - puff, -84, -38 - puff, -50, -24 - puff * 0.5, -22); stroke(ctx, c.trim, 0.9);
  } };
  BACK.sashi_fan = { noSashi: true, back(ctx, c, o) {
    const sway = Math.sin((o.t || 0) * 2.4) * 0.05;
    ctx.beginPath(); ctx.moveTo(-7, -38); ctx.lineTo(-9, -82); stroke(ctx, OUT, 3.6); stroke(ctx, '#2a1a10', 1.8);
    ctx.save(); ctx.translate(-9, -84); ctx.rotate(-0.3 + sway);
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.arc(0, 4, 22, -PI * 0.88, -PI * 0.12); ctx.closePath();
    fs(ctx, lg(ctx, -20, -18, 20, 0, [[0, '#fff1b0'], [0.5, '#f2c94c'], [1, '#b8862a']]), 1.6);
    ctx.strokeStyle = 'rgba(120,80,20,.6)'; ctx.lineWidth = 0.7; for (let k = 1; k < 9; k++) { const a = -PI * 0.88 + k / 9 * PI * 0.76; ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(Math.cos(a) * 22, 4 + Math.sin(a) * 22); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, -8, 4.6, 0, TAU); ctx.fillStyle = '#d6243a'; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.restore();
  } };
  BACK.swords = { back(ctx, c) {
    for (const [hx0, hy0, rot] of [[-21, -62, -0.42], [-9, -84, 0.36]]) {
      ctx.save(); ctx.translate(hx0, hy0); ctx.rotate(rot);
      ctx.beginPath(); ctx.moveTo(-2, 6); ctx.lineTo(-2, 40); ctx.lineTo(0, 45); ctx.lineTo(2, 40); ctx.lineTo(2, 6); ctx.closePath(); fs(ctx, metalG(ctx, c, -2, 0, 2, 0, '#c9d2dc'), 1.4);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 40); stroke(ctx, 'rgba(255,255,255,.5)', 0.6);
      rr(ctx, -5.6, 3.4, 11.2, 2.6, 1); fs(ctx, goldG(ctx, 0, 3, 0, 6, c.trim), 1.1);
      rr(ctx, -1.3, -4, 2.6, 7.6, 1); fs(ctx, c.leatherDark, 1);
      ctx.beginPath(); ctx.arc(0, -5, 1.8, 0, TAU); fs(ctx, goldG(ctx, 0, -7, 0, -3, c.trim), 1);
      ctx.restore();
    }
  } };
  const wingFrame = (ctx, o, fn) => {
    const flap = (o.moving ? Math.sin((o.t || 0) * 9) * 0.12 : Math.sin((o.t || 0) * 2.2) * 0.06);
    for (const [sc, al, rot] of [[0.9, 0.7, -0.24], [1, 1, 0]]) { ctx.save(); ctx.translate(-4, -54); ctx.rotate(rot - flap); ctx.scale(sc, sc); ctx.globalAlpha *= al; fn(); ctx.restore(); }
  };
  BACK.wing_feather = { back(ctx, c, o) {
    wingFrame(ctx, o, () => { ctx.scale(1.15, 1.15);
      for (let k = 0; k < 7; k++) { const a = -2.2 - k * 0.2, L = 44 - k * 3.6; feather(ctx, -12 + Math.cos(a) * 4, -18 + k * 3, a + 0.25, L * 0.62, 5, k % 2 ? shade(c.wing, -0.14) : shade(c.wing, 0.05), 1); }
      ctx.beginPath(); ctx.moveTo(2, 2); ctx.quadraticCurveTo(-10, -26, -30, -34); ctx.quadraticCurveTo(-24, -22, -28, -10); ctx.quadraticCurveTo(-14, -4, -16, 6); ctx.quadraticCurveTo(-6, 4, 2, 6); ctx.closePath();
      fs(ctx, lg(ctx, -30, -34, 2, 6, [[0, shade(c.wing, 0.25)], [1, shade(c.wing, -0.18)]]), 1.4);
      ctx.strokeStyle = shade(c.wing, -0.32); ctx.lineWidth = 0.7; for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-6 - k * 4.6 - r * 2, -6 - k * 4.4 + r * 6, 2.6, 0.3, PI - 0.3); ctx.stroke(); }
    });
  } };
  BACK.wing_bat = { back(ctx, c, o) {
    const col = c.wing === '#f4f1ea' ? '#3a1820' : c.wing;
    wingFrame(ctx, o, () => {
      const el = [-15, -24], tips = [[-38, -34], [-40, -12], [-32, 6], [-18, 12]];
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(el[0], el[1]); ctx.lineTo(tips[0][0], tips[0][1]);
      for (let i = 1; i < tips.length; i++) ctx.quadraticCurveTo((tips[i - 1][0] + tips[i][0]) / 2 + 6, (tips[i - 1][1] + tips[i][1]) / 2, tips[i][0], tips[i][1]);
      ctx.quadraticCurveTo(-8, 8, 0, 8); ctx.closePath();
      fs(ctx, lg(ctx, 0, -30, -36, 10, [[0, shade(col, 0.2)], [1, shade(col, -0.4)]]), 1.6);
      for (const tp of tips) { ctx.beginPath(); ctx.moveTo(el[0], el[1]); ctx.lineTo(tp[0], tp[1]); stroke(ctx, shade(col, -0.6), 1.5); }
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(el[0], el[1]); stroke(ctx, OUT, 3.4); stroke(ctx, shade(col, -0.3), 1.8);
      ctx.beginPath(); ctx.moveTo(el[0], el[1]); ctx.lineTo(el[0] - 2, el[1] - 4); ctx.lineTo(el[0] + 1.6, el[1] - 1); ctx.closePath(); fs(ctx, BONE, 0.9);
    });
  } };
  BACK.wing_crystal = { back(ctx, c, o) {
    ctx.save(); glowS(ctx, c.glow, 10);
    wingFrame(ctx, o, () => {
      for (let k = 0; k < 7; k++) { const a = -PI + 0.95 - k * 0.24, len = 44 - k * 4; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(len * 0.7, -5.4); ctx.lineTo(len, 0); ctx.lineTo(len * 0.7, 4); ctx.lineTo(0, 3); ctx.closePath();
        fs(ctx, lg(ctx, 0, -4, 0, 3, [[0, shade(c.glow, 0.65)], [0.5, c.glow], [1, shade(c.glow, -0.5)]]), 1); ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(len - 2, 0); stroke(ctx, 'rgba(255,255,255,.7)', 0.5); ctx.restore(); }
    });
    ctx.restore();
  } };
  BACK.wing_flame = { back(ctx, c, o) {
    const t = o.t || 0;
    ctx.save(); glowS(ctx, '#ff6a2a', 12);
    wingFrame(ctx, o, () => {
      for (let k = 0; k < 7; k++) { const a = -PI + 0.95 - k * 0.22, len = 42 - k * 3.6 + Math.sin(t * 8 + k) * 2.4; ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.bezierCurveTo(len * 0.4, -8, len * 0.7, -2 + Math.sin(t * 7 + k) * 2, len, Math.sin(t * 9 + k) * 1.6); ctx.bezierCurveTo(len * 0.7, 4, len * 0.4, 5, 0, 4); ctx.closePath();
        ctx.fillStyle = k % 2 ? '#ff8a2a' : '#e8401a'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(1, -1); ctx.quadraticCurveTo(len * 0.5, -2, len * 0.75, 0); ctx.quadraticCurveTo(len * 0.5, 1.4, 1, 1); ctx.closePath(); ctx.fillStyle = '#ffe07a'; ctx.fill(); ctx.restore(); }
    });
    ctx.restore();
  } };
  const RUNE_GLYPHS = [[[0, -3, 0, 3], [0, -3, 2.4, -1], [0, -0.4, 2.4, 1.6]], [[-1.6, -3, -1.6, 3], [-1.6, -1, 1.6, -3]], [[0, -3, 0, 3], [-2, -1.4, 2, 1.4]], [[-1.6, 3, 0, -3], [0, -3, 1.6, 3]], [[0, -3, 0, 3], [0, -3, 2, -1.4], [2, -1.4, 0, 0]]];
  const runeStone = (ctx, c, x, y, i, rot, al) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= al;
    ctx.beginPath(); ctx.moveTo(-3.2, -4); ctx.lineTo(2.6, -4.4); ctx.lineTo(3.6, 3.4); ctx.lineTo(-2.6, 4.2); ctx.closePath(); fs(ctx, lg(ctx, -3, -4, 3, 4, [[0, '#9aa096'], [1, '#4a5048']]), 1.1);
    glowS(ctx, c.glow, 6); ctx.strokeStyle = c.glow; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    for (const s of RUNE_GLYPHS[i % RUNE_GLYPHS.length]) { ctx.beginPath(); ctx.moveTo(s[0] * 0.8, s[1] * 0.8); ctx.lineTo(s[2] * 0.8, s[3] * 0.8); ctx.stroke(); }
    ctx.restore();
  };
  const runeOrbit = (ctx, c, o, front) => {
    const t = o.t || 0;
    for (let k = 0; k < 5; k++) { const a = t * 0.9 + k * TAU / 5, z = Math.sin(a); if ((z > 0) !== front) continue; ctx.save(); ctx.translate(Math.cos(a) * 19, -44 + z * 4); ctx.scale(1.3, 1.3); ctx.translate(-Math.cos(a) * 19, 44 - z * 4); runeStone(ctx, c, 0 + Math.cos(a) * 19, -44 + z * 4 + Math.sin(t * 2 + k) * 1.6, k, Math.sin(t + k) * 0.3, front ? 1 : 0.75); ctx.restore(); }
  };
  BACK.runes = { back(ctx, c, o) { runeOrbit(ctx, c, o, false); }, top(ctx, c, o) { runeOrbit(ctx, c, o, true); } };
  BACK.banner = { back(ctx, c, o) {
    const t = o.t || 0, s = Math.sin(t * 2.6 + (o.w || 0) * 0.4) * 1.4;
    ctx.beginPath(); ctx.moveTo(-8, -34); ctx.lineTo(-10, -112); stroke(ctx, OUT, 3.6); stroke(ctx, '#5a3a1e', 1.8);
    rr(ctx, -21 + s * 0.2, -106, 22, 2.6, 1); fs(ctx, goldG(ctx, 0, -106, 0, -103, c.trim), 1);
    ctx.beginPath(); ctx.moveTo(-20 + s * 0.3, -103.6); ctx.lineTo(0, -103.6); ctx.lineTo(0.4 + s * 0.5, -78); ctx.lineTo(-4.6 + s, -72); ctx.lineTo(-9.6 + s * 1.1, -77); ctx.lineTo(-14.6 + s * 1.2, -72); ctx.lineTo(-19.6 + s * 1.3, -78); ctx.closePath();
    fs(ctx, lg(ctx, -20, -104, 0, -72, [[0, shade(c.cape, 0.2)], [1, shade(c.cape, -0.3)]]), 1.6);
    ctx.save(); ctx.translate(-9.8 + s * 0.8, -90); ctx.scale(0.75, 0.75); (EMBLEM[o.af.bannerEmblem] || EMBLEM.cross).draw(ctx, c.trim, o); ctx.restore();
    ctx.beginPath(); ctx.arc(-10.2, -113, 1.8, 0, TAU); fs(ctx, goldG(ctx, 0, -115, 0, -111, c.trim), 1);
  } };
  BACK.shell = { back(ctx, c, o) {
    const col = c.metal;
    ctx.beginPath(); ctx.moveTo(-3, -58); ctx.bezierCurveTo(-22, -60, -24, -26, -8, -22); ctx.quadraticCurveTo(-5, -40, -3, -58); ctx.closePath();
    fs(ctx, lg(ctx, -22, -58, -4, -22, [[0, shade(col, 0.4)], [0.5, col], [1, shade(col, -0.45)]]), 1.9);
    ctx.save(); ctx.clip(); ctx.strokeStyle = shade(col, -0.5); ctx.lineWidth = 0.9;
    for (const [x, y] of [[-12, -50], [-15, -40], [-12, -30], [-7, -45], [-7, -35]]) { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.lineTo(x + Math.cos(a) * 4.4, y + Math.sin(a) * 4.4); } ctx.closePath(); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-6, -56); ctx.bezierCurveTo(-19, -56, -21, -34, -12, -26); stroke(ctx, 'rgba(255,255,255,.35)', 0.9);
    for (const [x, y] of [[-14, -54], [-19, -42], [-16, -30]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4.4, y - 1.6); ctx.lineTo(x - 0.6, y + 2.4); ctx.closePath(); fs(ctx, shade(col, -0.3), 1); }
  } };
  BACK.smoke = { back(ctx, c, o) {
    const t = o.t || 0;
    ctx.save();
    for (let k = 0; k < 10; k++) { const life = (t * 0.35 + k / 10) % 1, x = -10 + Math.sin(k * 2.3 + t) * 8 - life * 6, y = -14 - life * 70, r = 5 + life * 9;
      ctx.globalAlpha = Math.sin(life * PI) * 0.55; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, k % 2 ? 'rgba(30,22,40,.9)' : 'rgba(60,46,74,.85)'); g.addColorStop(1, 'rgba(30,22,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    ctx.restore();
  } };

  const torsoClip = ctx => { rr(ctx, -10.4, -54, 20.8, 21.6, 6.4); ctx.clip(); };
  const CHEST = {};
  CHEST.engraved = { chest(ctx, c) {
    rr(ctx, -10.5, -54, 21, 20.6, 7); fs(ctx, metalG(ctx, c, -10, -54, 10, -34), 1.8);
    ctx.beginPath(); ctx.moveTo(0.6, -53); ctx.lineTo(0.6, -35); stroke(ctx, c.metalDark, 1);
    ctx.strokeStyle = c.trim; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0.6, -50); ctx.bezierCurveTo(0.6 + d * 6, -52, 0.6 + d * 7, -45, 0.6 + d * 3, -44.6); ctx.bezierCurveTo(0.6 + d * 0.6, -44.4, 0.6 + d * 1.6, -47, 0.6 + d * 3, -46.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.6, -42); ctx.bezierCurveTo(0.6 + d * 5, -42, 0.6 + d * 7, -38, 0.6 + d * 8, -36); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-9.6, -50); ctx.quadraticCurveTo(0.6, -55, 10.6, -50); stroke(ctx, c.trim, 1.2);
    gem(ctx, 0.6, -46, 1.3, c.glow);
    ctx.beginPath(); ctx.moveTo(-7, -52); ctx.quadraticCurveTo(-9, -45, -7.6, -38); stroke(ctx, 'rgba(255,255,255,.4)', 0.9);
  } };
  CHEST.scale = { chest(ctx, c) {
    ctx.save(); torsoClip(ctx); ctx.fillStyle = c.metalDark; ctx.fillRect(-11, -55, 22, 23);
    for (let r = 0, y = -55; y < -33; y += 3, r++) for (let x = -12 + (r % 2) * 2; x < 12; x += 4) {
      ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x + 2, y); ctx.quadraticCurveTo(x + 2.2, y + 3, x, y + 4.2); ctx.quadraticCurveTo(x - 2.2, y + 3, x - 2, y); ctx.closePath();
      ctx.fillStyle = lg(ctx, x - 2, y, x + 2, y + 4, [[0, shade(c.metal, 0.35)], [1, shade(c.metal, -0.2)]]); ctx.fill(); ctx.lineWidth = 0.5; ctx.strokeStyle = OUT; ctx.stroke(); }
    ctx.restore();
    rr(ctx, -10.4, -54, 20.8, 21.6, 6.4); stroke(ctx, OUT, 1.6);
    ctx.beginPath(); ctx.moveTo(-8.6, -53); ctx.quadraticCurveTo(0, -48.6, 9.6, -53); stroke(ctx, OUT, 3); stroke(ctx, c.trim, 1.6);
  } };
  CHEST.lamellar = { chest(ctx, c) {
    ctx.save(); torsoClip(ctx); ctx.fillStyle = c.lace; ctx.fillRect(-11, -55, 22, 23);
    for (let r = 0, y = -53.6; y < -33; y += 4.4, r++) { for (let x = -10.4; x < 11; x += 2.6) { rr(ctx, x + 0.2, y, 2.2, 3.4, 0.6); ctx.fillStyle = r % 2 ? c.metal : shade(c.metal, -0.15); ctx.fill(); ctx.lineWidth = 0.4; ctx.strokeStyle = OUT; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-11, y + 3.8); ctx.lineTo(11, y + 3.8); stroke(ctx, c.lace, 1); }
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-11, -55, 4, 23);
    ctx.restore();
    rr(ctx, -10.4, -54, 20.8, 21.6, 6.4); stroke(ctx, OUT, 1.6);
  } };
  CHEST.chain = { chest(ctx, c) {
    ctx.save(); torsoClip(ctx); ctx.fillStyle = c.metalDark; ctx.fillRect(-11, -55, 22, 23);
    ctx.strokeStyle = shade(c.metal, 0.3); ctx.lineWidth = 0.6;
    for (let r = 0, y = -54; y < -33; y += 1.8, r++) for (let x = -11 + (r % 2) * 1; x < 11; x += 2) { ctx.beginPath(); ctx.arc(x, y, 0.75, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-11, -55, 5, 23);
    ctx.restore();
    rr(ctx, -10.4, -54, 20.8, 21.6, 6.4); stroke(ctx, OUT, 1.6);
    ctx.beginPath(); ctx.moveTo(-8, -53.4); ctx.quadraticCurveTo(0.6, -49.4, 9, -53.4); stroke(ctx, OUT, 3.2); stroke(ctx, c.leather, 1.8);
  } };
  CHEST.belt = { chest(ctx, c) {
    rr(ctx, -11.6, -38, 23.2, 5.8, 1.6); fs(ctx, lg(ctx, 0, -38, 0, -32, [[0, shade(c.leather, 0.15)], [1, shade(c.leatherDark, -0.2)]]), 1.5);
    ctx.fillStyle = c.trim; for (let x = -9; x < 11; x += 3) { if (Math.abs(x - 0.6) < 4) continue; ctx.beginPath(); ctx.arc(x, -35.1, 0.7, 0, TAU); ctx.fill(); }
    rr(ctx, -3.4, -39.6, 8, 9, 2); fs(ctx, goldG(ctx, 0, -39.6, 0, -30.6, c.trim), 1.4);
    rr(ctx, -1.6, -37.8, 4.4, 5.4, 1.2); ctx.fillStyle = shade(c.trim, -0.45); ctx.fill();
    gem(ctx, 0.6, -35.1, 1.3, c.glow);
    ctx.beginPath(); ctx.moveTo(5, -32.6); ctx.quadraticCurveTo(6, -28, 4.4, -25); stroke(ctx, OUT, 3); stroke(ctx, c.leather, 1.6);
  } };
  CHEST.cross = { chest(ctx, c) {
    ctx.beginPath(); ctx.moveTo(-6.4, -53.4); ctx.lineTo(7, -53.4); ctx.lineTo(8, -29); ctx.lineTo(0.3, -26); ctx.lineTo(-7.4, -29); ctx.closePath(); fs(ctx, lg(ctx, 0, -54, 0, -26, [[0, '#ffffff'], [1, '#cfc8ba']]), 1.5);
    ctx.save(); ctx.translate(0.3, -42.6); ctx.scale(0.75, 0.9); crossPath(ctx, 1.5, 1.5); fs(ctx, c.cape === c.tunic ? '#c41e2a' : c.cape, 0.9); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-6.4, -53.4); ctx.lineTo(7, -53.4); stroke(ctx, c.trim, 1.2);
  } };
  CHEST.sun = { chest(ctx, c, o) {
    ctx.save(); ctx.translate(0.6, -45); ctx.rotate((o.t || 0) * 0.3);
    star(ctx, 0, 0, 8.4, 5, 16, 0); fs(ctx, goldG(ctx, 0, -8, 0, 8, c.trim), 1.1); ctx.restore();
    ctx.beginPath(); ctx.arc(0.6, -45, 4.4, 0, TAU); fs(ctx, goldG(ctx, 0, -49, 0, -41, shade(c.trim, 0.2)), 1.1);
    ctx.save(); glowS(ctx, '#ffe9a0', 6); gem(ctx, 0.6, -45, 2, c.glow); ctx.restore();
  } };
  CHEST.skull = { chest(ctx, c) {
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0.6 - d * 7, -38); ctx.lineTo(0.6 + d * 7, -51); stroke(ctx, OUT, 3.6); stroke(ctx, BONE, 2); for (const e of [-1, 1]) { ctx.beginPath(); ctx.arc(0.6 + d * e * 7 + (e > 0 ? 0 : 0), e > 0 ? -51 : -38, 1.4, 0, TAU); fs(ctx, BONE, 0.8); } }
    ctx.beginPath(); ctx.arc(0.6, -46.4, 5.2, PI * 0.82, PI * 2.18); ctx.lineTo(3.4, -40.4); ctx.lineTo(-2.2, -40.4); ctx.closePath(); fs(ctx, lg(ctx, 0, -52, 0, -40, [[0, '#fffaf0'], [1, '#b9ad92']]), 1.2);
    ctx.fillStyle = '#141016'; ctx.beginPath(); ctx.ellipse(-1.4, -46.2, 1.5, 1.7, 0, 0, TAU); ctx.ellipse(2.6, -46.2, 1.5, 1.7, 0, 0, TAU); ctx.fill();
    ctx.save(); glowS(ctx, c.glow, 6); ctx.fillStyle = c.glow; ctx.beginPath(); ctx.arc(-1.4, -46.2, 0.6, 0, TAU); ctx.arc(2.6, -46.2, 0.6, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#141016'; ctx.beginPath(); ctx.moveTo(0.6, -44.4); ctx.lineTo(-0.2, -43); ctx.lineTo(1.4, -43); ctx.closePath(); ctx.fill();
  } };
  CHEST.amulet = { chest(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-6.4, -53.4); ctx.quadraticCurveTo(0.6, -42, 7.4, -53.4); stroke(ctx, OUT, 2.6); ctx.setLineDash([1.4, 0.8]); stroke(ctx, '#ffd77a', 1.2); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0.6, -48.6); ctx.lineTo(4.6, -44); ctx.lineTo(0.6, -38.4); ctx.lineTo(-3.4, -44); ctx.closePath(); fs(ctx, goldG(ctx, 0, -49, 0, -38, c.trim), 1.3);
    ctx.save(); glowS(ctx, c.glow, 8 + Math.sin((o.t || 0) * 3) * 4); ctx.beginPath(); ctx.ellipse(0.6, -44, 2, 2.8, 0, 0, TAU); fs(ctx, lg(ctx, -1, -47, 2, -41, [[0, shade(c.glow, 0.6)], [1, shade(c.glow, -0.4)]]), 0.8); ctx.restore();
    ctx.beginPath(); ctx.arc(0, -45.2, 0.6, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
  } };
  CHEST.furstraps = { chest(ctx, c) {
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0.6 - d * 9, -52.6); ctx.lineTo(0.6 + d * 8, -35); stroke(ctx, OUT, 4.6); stroke(ctx, c.leatherDark, 2.8); ctx.strokeStyle = shade(c.leatherDark, 0.3); ctx.lineWidth = 0.5; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-10.6, -53); for (let k = 0; k <= 10; k++) ctx.lineTo(-10.6 + k * 2.2, -53 + (k % 2 ? 3 : 0.4) - Math.sin(k / 10 * PI) * 1.6); ctx.lineTo(11.4, -50.4); ctx.quadraticCurveTo(0.6, -54, -10.6, -50.4); ctx.closePath(); fs(ctx, c.fur, 1.3);
    ctx.beginPath(); ctx.arc(0.6, -43.8, 3, 0, TAU); fs(ctx, metalG(ctx, c, -2, -47, 3, -41), 1.2);
    ctx.save(); ctx.translate(0.6, -43.8); ctx.scale(0.36, 0.36); EMBLEM.runes.draw(ctx, c.glow); ctx.restore();
    for (const [x, y] of [[-5.6, -48.4], [6.6, -48.4], [-4.4, -39], [5.4, -39]]) { ctx.beginPath(); ctx.arc(x, y, 0.8, 0, TAU); ctx.fillStyle = c.trim; ctx.fill(); }
  } };
  CHEST.shimenawa = { chest(ctx, c) {
    const pth = () => { ctx.beginPath(); ctx.moveTo(-11, -52); ctx.quadraticCurveTo(0, -42, 11.4, -38.4); };
    pth(); stroke(ctx, OUT, 5); stroke(ctx, '#d8c08a', 3.4);
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 0.8; for (let s = 0.05; s < 1; s += 0.09) { const p = qb([-11, -52], [0, -42], [11.4, -38.4])(s); ctx.beginPath(); ctx.moveTo(p[0] - 1.2, p[1] - 1.4); ctx.lineTo(p[0] + 1, p[1] + 1.4); ctx.stroke(); }
    for (const s of [0.28, 0.62]) { const p = qb([-11, -52], [0, -42], [11.4, -38.4])(s); ctx.beginPath(); ctx.moveTo(p[0], p[1] + 1.4); ctx.lineTo(p[0] + 2.4, p[1] + 1.4); ctx.lineTo(p[0] + 0.8, p[1] + 4); ctx.lineTo(p[0] + 3, p[1] + 4); ctx.lineTo(p[0] + 1.2, p[1] + 7.4); ctx.lineTo(p[0] - 0.6, p[1] + 4.4); ctx.lineTo(p[0] + 0.8, p[1] + 4.4); ctx.lineTo(p[0] - 1, p[1] + 1.4); ctx.closePath(); fs(ctx, '#ffffff', 0.8); }
  } };
  CHEST.runestone = { chest(ctx, c, o) {
    ctx.beginPath(); ctx.moveTo(-5.4, -53.4); ctx.lineTo(0.6, -47); ctx.lineTo(6.6, -53.4); stroke(ctx, OUT, 2.4); stroke(ctx, c.leather, 1.1);
    ctx.save(); ctx.translate(0.6, -43); ctx.rotate(Math.sin((o.t || 0) * 2) * 0.06); runeStone(ctx, c, 0, 0, 0, 0, 1); ctx.restore();
  } };
  CHEST.lionplate = { chest(ctx, c) {
    rr(ctx, -10.5, -54, 21, 20.6, 7); fs(ctx, metalG(ctx, c, -10, -54, 10, -34), 1.8);
    ctx.save(); ctx.translate(0.6, -45); ctx.scale(0.82, 0.82); EMBLEM.lion.draw(ctx, c.trim); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-9.6, -37); ctx.quadraticCurveTo(0.6, -34, 10.6, -37); stroke(ctx, c.trim, 1);
  } };
  CHEST.dragonscale = { chest(ctx, c) {
    const d = c.accent;
    ctx.save(); torsoClip(ctx); ctx.fillStyle = shade(d, -0.5); ctx.fillRect(-11, -55, 22, 23);
    for (let r = 0, y = -56; y < -33; y += 2.6, r++) for (let x = -12 + (r % 2) * 1.6; x < 12; x += 3.2) { ctx.beginPath(); ctx.moveTo(x - 1.6, y); ctx.quadraticCurveTo(x, y + 4.6, x + 1.6, y); ctx.closePath(); ctx.fillStyle = lg(ctx, x, y, x, y + 3.6, [[0, shade(d, 0.3)], [1, shade(d, -0.25)]]); ctx.fill(); ctx.lineWidth = 0.4; ctx.strokeStyle = OUT; ctx.stroke(); }
    ctx.restore();
    rr(ctx, -10.4, -54, 20.8, 21.6, 6.4); stroke(ctx, OUT, 1.6);
    ctx.save(); glowS(ctx, c.glow, 6); ctx.beginPath(); ctx.ellipse(0.6, -46, 1.6, 3, 0, 0, TAU); ctx.fillStyle = c.glow; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.ellipse(0.6, -46, 0.5, 2.4, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
  } };

  /* NÁRAMENÍKY (střed ramene 0,0 = (-1,-50.5)) */
  const SHOULDER = {};
  const dome = (ctx, c, rx, ry, col) => { ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, -0.2, PI * 0.95, TAU + 0.15); ctx.closePath(); fs(ctx, metalG(ctx, c, -rx, -ry, rx, ry, col), 1.6); };
  SHOULDER.plate = { top(ctx, c) {
    for (let k = 2; k >= 0; k--) { ctx.save(); ctx.translate(0, k * 2.6); dome(ctx, c, 8 - k * 0.4, 6 - k * 0.6, k ? shade(c.metal, -0.08 * k) : null); ctx.restore(); }
    ctx.beginPath(); ctx.ellipse(0, 0.6, 7.6, 4.6, -0.2, PI * 1.02, TAU + 0.1); stroke(ctx, c.trim, 1.2);
    ctx.fillStyle = OUT; for (const [x, y] of [[-4.6, -2.6], [0, -4.6], [4.4, -3.6]]) { ctx.beginPath(); ctx.arc(x, y, 0.55, 0, TAU); ctx.fill(); }
  } };
  SHOULDER.spiked = { top(ctx, c) {
    dome(ctx, c, 8.2, 6.4);
    ctx.beginPath(); ctx.ellipse(0, 1.2, 8, 4, -0.2, PI * 1.02, TAU + 0.1); stroke(ctx, c.trim, 1.1);
    for (const [x, y, a, L] of [[-4.6, -2.4, -0.75, 6.4], [0, -4.2, -0.15, 8.4], [4.6, -3.6, 0.5, 6.4]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-1.9, 1.2); ctx.lineTo(0, -L); ctx.lineTo(1.9, 1.2); ctx.closePath(); fs(ctx, metalG(ctx, c, -2, -L, 2, 1, shade(c.metal, 0.15)), 1.1); ctx.restore(); }
  } };
  SHOULDER.layered = { top(ctx, c) {
    for (let k = 3; k >= 0; k--) { ctx.save(); ctx.translate(-k * 0.6, k * 3); ctx.beginPath(); ctx.ellipse(0, 0, 9.6 - k * 0.3, 6.2 - k * 0.5, -0.25, PI * 0.92, TAU + 0.18); ctx.closePath(); fs(ctx, metalG(ctx, c, -9, -6, 9, 6, k % 2 ? shade(c.metal, -0.12) : c.metal), 1.5); ctx.beginPath(); ctx.ellipse(0, 0.6, 9.6 - k * 0.3, 5.2 - k * 0.5, -0.25, PI * 0.98, TAU + 0.1); stroke(ctx, c.trim, 0.9); ctx.restore(); }
    gem(ctx, 0.4, -2.4, 1.4, c.glow);
  } };
  SHOULDER.fur = { top(ctx, c) {
    const puffs = [[-6.4, 1.4, 3.6], [-3.6, -2.6, 4], [0.6, -4, 4.2], [4.8, -2.8, 3.8], [7, 1, 3.2], [-1.4, 0.6, 4.4], [3, 0.4, 4]];
    ctx.fillStyle = OUT; for (const [x, y, r] of puffs) { ctx.beginPath(); ctx.arc(x, y, r + 1.1, 0, TAU); ctx.fill(); }
    for (const [x, y, r] of puffs) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = lg(ctx, x - r, y - r, x + r, y + r, [[0, shade(c.fur, 0.3)], [1, shade(c.fur, -0.22)]]); ctx.fill(); }
    ctx.strokeStyle = shade(c.fur, -0.38); ctx.lineWidth = 0.7; for (const [x, y, r] of puffs) { ctx.beginPath(); ctx.arc(x + r * 0.2, y + r * 0.3, r * 0.55, 0.3, 1.6); ctx.stroke(); }
    ctx.strokeStyle = shade(c.fur, 0.45); ctx.lineWidth = 0.6; for (const [x, y, r] of puffs) { ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.5, 3.6, 4.8); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-7, 4.4); ctx.lineTo(7.6, 3); stroke(ctx, OUT, 3.2); stroke(ctx, c.leatherDark, 1.8);
    ctx.beginPath(); ctx.arc(0.6, 3.6, 1.6, 0, TAU); fs(ctx, goldG(ctx, 0, 2, 0, 5.2, c.trim), 0.9);
  } };
  SHOULDER.dragon = { top(ctx, c) {
    const d = c.accent;
    ctx.beginPath(); ctx.moveTo(-8, 3); ctx.quadraticCurveTo(-8, -7, 1, -7); ctx.lineTo(6, -6); ctx.lineTo(12, -3); ctx.lineTo(7.4, -2); ctx.lineTo(11, 1); ctx.lineTo(5, 1.6); ctx.quadraticCurveTo(2, 4.6, -8, 3); ctx.closePath();
    fs(ctx, lg(ctx, 0, -7, 0, 4, [[0, shade(d, 0.35)], [1, shade(d, -0.35)]]), 1.5);
    for (const [x, y] of [[-5, -5.6], [-1.6, -7.4]]) { ctx.beginPath(); ctx.moveTo(x - 1.4, y + 1); ctx.lineTo(x - 3, y - 4.6); ctx.lineTo(x + 1.4, y + 0.4); ctx.closePath(); fs(ctx, BONE, 0.9); }
    ctx.fillStyle = '#ffffff'; for (const x of [7.6, 9.2]) { ctx.beginPath(); ctx.moveTo(x, -2.2); ctx.lineTo(x + 0.6, 0); ctx.lineTo(x + 1.2, -2.2); ctx.closePath(); ctx.fill(); }
    ctx.save(); glowS(ctx, c.glow, 6); ctx.beginPath(); ctx.ellipse(3.6, -4.4, 1.4, 0.8, 0.2, 0, TAU); ctx.fillStyle = c.glow; ctx.fill(); ctx.restore();
    ctx.strokeStyle = shade(d, -0.45); ctx.lineWidth = 0.6; for (let x = -6; x < 2; x += 2.2) { ctx.beginPath(); ctx.arc(x, -1, 1.6, 0.2, PI - 0.2); ctx.stroke(); }
  } };
  SHOULDER.skull = { top(ctx, c) {
    dome(ctx, c, 8, 5.6, c.metalDark);
    ctx.save(); ctx.translate(0.6, -2.6); ctx.beginPath(); ctx.arc(0, -1, 4.4, PI * 0.85, PI * 2.15); ctx.lineTo(2.2, 3.4); ctx.lineTo(-2.2, 3.4); ctx.closePath(); fs(ctx, lg(ctx, 0, -5, 0, 3, [[0, '#fffaf0'], [1, '#b9ad92']]), 1.1);
    ctx.fillStyle = '#141016'; ctx.beginPath(); ctx.ellipse(-1.6, -0.8, 1.2, 1.4, 0, 0, TAU); ctx.ellipse(1.6, -0.8, 1.2, 1.4, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1, 2); ctx.lineTo(-1, 3.4); ctx.moveTo(0.2, 2); ctx.lineTo(0.2, 3.4); ctx.moveTo(1.2, 2); ctx.lineTo(1.2, 3.4); stroke(ctx, OUT, 0.5); ctx.restore();
  } };
  SHOULDER.sode = { top(ctx, c) {
    ctx.save(); ctx.rotate(-0.08);
    for (let k = 0; k < 4; k++) { rr(ctx, -6.6, -3 + k * 3.8, 14, 4.2, 1); fs(ctx, k % 2 ? shade(c.metal, -0.15) : c.metal, 1.2); ctx.fillStyle = c.trim; for (let x = -5; x < 7; x += 2.4) { ctx.beginPath(); ctx.arc(x, -0.9 + k * 3.8, 0.4, 0, TAU); ctx.fill(); } }
    for (const x of [-3.4, 3.6]) { ctx.beginPath(); ctx.moveTo(x, -3); ctx.lineTo(x, 12); stroke(ctx, c.lace, 1.4); }
    ctx.beginPath(); ctx.moveTo(-6.6, 12.4); ctx.lineTo(7.4, 12.4); stroke(ctx, c.trim, 1.6);
    ctx.restore();
  } };
  SHOULDER.wing = { top(ctx, c) {
    for (let k = 0; k < 4; k++) feather(ctx, 3, -1, -PI + 0.5 + k * 0.35, 13 - k * 1.6, 2.6, k % 2 ? shade(c.wing, -0.15) : c.wing, 0.9);
    dome(ctx, c, 7.4, 5.4);
    ctx.beginPath(); ctx.ellipse(0, 1.2, 7.4, 3.6, -0.2, PI * 1.02, TAU + 0.1); stroke(ctx, c.trim, 1.2);
  } };
  SHOULDER.crystal = { top(ctx, c, o) {
    dome(ctx, c, 7.6, 5.6, c.metalDark);
    ctx.save(); glowS(ctx, c.glow, 7 + Math.sin((o.t || 0) * 3) * 3);
    for (const [x, y, h, a] of [[-4, -2, 7, -0.6], [0, -4, 10, -0.1], [4.4, -3, 7, 0.5]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-1.8, 1); ctx.lineTo(0, -h); ctx.lineTo(1.8, 1); ctx.closePath(); fs(ctx, lg(ctx, -2, 0, 2, 0, [[0, shade(c.glow, 0.6)], [1, shade(c.glow, -0.4)]]), 0.9); ctx.restore(); }
    ctx.restore();
  } };
  SHOULDER.horns = { top(ctx, c) {
    tube(ctx, qb([-3, -3], [-12, -6], [-10, -15]), 2, 0.4, BONE, 12, 3);
    tube(ctx, qb([3, -3], [10, -7], [12, -13]), 1.7, 0.35, shade(BONE, -0.1), 12, 3);
    dome(ctx, c, 8, 6);
    ctx.beginPath(); ctx.ellipse(0, 1.4, 8, 4, -0.2, PI * 1.02, TAU + 0.1); stroke(ctx, c.trim, 1.2);
  } };
  SHOULDER.lion = { top(ctx, c) {
    dome(ctx, c, 8.4, 6.2);
    ctx.save(); ctx.translate(0.4, -1.6); ctx.scale(0.55, 0.55); EMBLEM.lion.draw(ctx, c.trim); ctx.restore();
  } };

  /* AURY: záře vzadu, částice vpředu */
  const AURA = {};
  const pLoop = (n, t, spd, fn) => { for (let i = 0; i < n; i++) { const life = (t * spd + i / n + (i * 0.37) % 1) % 1; fn(i, life); } };
  const softGlow = (ctx, col, a) => { const g = ctx.createRadialGradient(0, -44, 4, 0, -44, 44); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(-46, -92, 92, 92); };
  AURA.embers = {
    back(ctx) { softGlow(ctx, 'rgba(255,110,40,A)', 0.18); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); pLoop(8, t, 0.45, (i, l) => { const x = -16 + ((i * 47) % 34) + Math.sin(t * 2.4 + i) * 3, y = -6 - l * 84; ctx.globalAlpha = Math.sin(l * PI) * 0.95; ctx.beginPath(); ctx.arc(x, y, 1.3 - l * 0.6, 0, TAU); ctx.fillStyle = i % 3 ? '#ffb347' : '#ff5a1a'; ctx.fill(); }); ctx.restore(); }
  };
  AURA.snow = {
    back(ctx) { softGlow(ctx, 'rgba(170,220,255,A)', 0.16); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.55; pLoop(7, t, 0.22, (i, l) => { const x = -18 + ((i * 53) % 38) + Math.sin(t * 1.4 + i * 2) * 4, y = -92 + l * 90; ctx.globalAlpha = Math.sin(l * PI) * 0.95; ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); for (let k = 0; k < 3; k++) { ctx.rotate(PI / 3); ctx.beginPath(); ctx.moveTo(-1.6, 0); ctx.lineTo(1.6, 0); ctx.stroke(); } ctx.restore(); }); ctx.restore(); }
  };
  AURA.petals = {
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); pLoop(7, t, 0.18, (i, l) => { const x = 22 - l * 46 + Math.sin(t * 2 + i) * 3, y = -88 + l * 80 + Math.sin(t * 3 + i * 1.7) * 4 + ((i * 29) % 20) - 10; ctx.globalAlpha = Math.sin(l * PI); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.beginPath(); ctx.moveTo(0, -1.8); ctx.quadraticCurveTo(1.6, 0, 0, 1.8); ctx.quadraticCurveTo(-1.6, 0, 0, -1.8); ctx.fillStyle = i % 2 ? '#ffc4d6' : '#ff9ab8'; ctx.fill(); ctx.lineWidth = 0.4; ctx.strokeStyle = '#d8608a'; ctx.stroke(); ctx.restore(); }); ctx.restore(); }
  };
  AURA.sparks = {
    back(ctx) { softGlow(ctx, 'rgba(140,200,255,A)', 0.14); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); glowS(ctx, c.glow, 6); ctx.strokeStyle = shade(c.glow, 0.5); ctx.lineWidth = 0.9;
      for (let k = 0; k < 2; k++) { if (Math.sin(t * (7 + k * 2) + k * 3) < 0.55) continue; const sx = k ? 14 : -15, sy = -70 + k * 22, s = Math.floor(t * 10 + k) % 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (k ? -3 : 3) + s, sy + 5); ctx.lineTo(sx - 1, sy + 8); ctx.lineTo(sx + (k ? -2 : 2), sy + 13); ctx.stroke(); }
      ctx.fillStyle = '#ffffff'; pLoop(5, t, 0.9, (i, l) => { const a = i * 1.3 + t, r = 14 + l * 8; ctx.globalAlpha = 1 - l; ctx.beginPath(); ctx.arc(Math.cos(a) * r, -44 + Math.sin(a) * r * 1.4, 0.8, 0, TAU); ctx.fill(); });
      ctx.restore(); }
  };
  AURA.wisps = {
    back(ctx, c, o) { const t = o.t || 0; ctx.save(); softGlow(ctx, 'rgba(90,40,130,A)', 0.2);
      for (let k = 0; k < 4; k++) { const l = (t * 0.3 + k / 4) % 1; ctx.globalAlpha = Math.sin(l * PI) * 0.6; ctx.beginPath(); ctx.moveTo(-10 + k * 6, -4); ctx.bezierCurveTo(-16 + k * 6 + Math.sin(t * 2 + k) * 6, -30, -4 + k * 4, -50 - l * 10, -10 + k * 5 + Math.sin(t + k) * 8, -70 - l * 20); stroke(ctx, k % 2 ? '#2a1438' : '#4a2a66', 3.4 - k * 0.5); }
      ctx.restore(); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); pLoop(5, t, 0.3, (i, l) => { const x = -14 + ((i * 41) % 30) + Math.sin(t * 2 + i) * 4, y = -8 - l * 70; ctx.globalAlpha = Math.sin(l * PI) * 0.7; ctx.beginPath(); ctx.arc(x, y, 2.4 - l * 1.4, 0, TAU); ctx.fillStyle = i % 2 ? '#6a3a8a' : '#1e0e2a'; ctx.fill(); }); ctx.restore(); }
  };
  AURA.motes = {
    back(ctx, c, o) { ctx.save(); const g = ctx.createLinearGradient(0, -100, 0, 0); g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(1, 'rgba(255,240,180,.22)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, -100); ctx.lineTo(14, -100); ctx.lineTo(20, 0); ctx.lineTo(-20, 0); ctx.closePath(); ctx.fill(); ctx.restore(); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); glowS(ctx, '#ffe9a0', 6); pLoop(7, t, 0.3, (i, l) => { const x = -16 + ((i * 37) % 32) + Math.sin(t * 1.6 + i) * 2.4, y = -4 - l * 88; ctx.globalAlpha = Math.sin(l * PI); star(ctx, x, y, 1.8, 0.6, 4, t + i); ctx.fillStyle = '#fff4c8'; ctx.fill(); }); ctx.restore(); }
  };
  AURA.leaves = {
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); pLoop(6, t, 0.25, (i, l) => { const a = l * TAU + i, r = 16 + (i % 3) * 3; const x = Math.cos(a) * r, y = -10 - l * 70; ctx.globalAlpha = Math.sin(l * PI); ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2); ctx.beginPath(); ctx.moveTo(-2.4, 0); ctx.quadraticCurveTo(0, -2, 2.4, 0); ctx.quadraticCurveTo(0, 2, -2.4, 0); ctx.fillStyle = i % 2 ? '#7ac04a' : '#c9a23a'; ctx.fill(); ctx.lineWidth = 0.4; ctx.strokeStyle = '#3a5a1a'; ctx.stroke(); ctx.restore(); }); ctx.restore(); }
  };
  AURA.stars = {
    back(ctx) { softGlow(ctx, 'rgba(120,140,255,A)', 0.16); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); glowS(ctx, '#bfe8ff', 6); for (let k = 0; k < 6; k++) { const a = t * 0.7 + k * TAU / 6, tw = 0.5 + Math.sin(t * 4 + k * 2) * 0.5; ctx.globalAlpha = tw; star(ctx, Math.cos(a) * 20, -46 + Math.sin(a) * 30, 2 * tw + 0.6, 0.6, 4, 0); ctx.fillStyle = '#ffffff'; ctx.fill(); } ctx.restore(); }
  };
  AURA.blood = {
    back(ctx) { softGlow(ctx, 'rgba(200,20,40,A)', 0.2); },
    top(ctx, c, o) { const t = o.t || 0; ctx.save(); pLoop(6, t, 0.4, (i, l) => { const x = -14 + ((i * 43) % 30), y = -84 + l * 80; ctx.globalAlpha = Math.sin(l * PI) * 0.8; ctx.beginPath(); ctx.moveTo(x, y - 2.4); ctx.quadraticCurveTo(x + 1.4, y, x, y + 1.2); ctx.quadraticCurveTo(x - 1.4, y, x, y - 2.4); ctx.fillStyle = '#b0101e'; ctx.fill(); }); ctx.restore(); }
  };

  /* =====================================================================
     SKLÁDÁNÍ A REGISTRACE
     ===================================================================== */
  const warn = (m) => { if (typeof console !== 'undefined') console.warn('[ArmorForge] ' + m); };
  function pick(cat, id, name) { if (id == null || id === 'none') return null; const p = cat[id]; if (!p) warn('neznámý díl ' + name + ': ' + id); return p || null; }

  function helmet(id, spec) {
    spec = spec || {};
    const S = pick(SHELL, spec.shell || 'great', 'shell') || SHELL.great;
    const C = pick(CREST, spec.crest, 'crest'), V = pick(VISOR, spec.visor, 'visor');
    const T = S.top + (spec.crestY || 0);
    const fn = (ctx, L, pal, st) => {
      const c = colors(pal, spec.colors);
      const o = { t: (st && st.t) || 0, moving: st && st.moving, full: !!(V && V.full), closed: !!S.closed || !!(V && V.full), eye: S.eye, L, st };
      ctx.save();
      if (C && C.back) { ctx.save(); C.back(ctx, c, T, o); ctx.restore(); }
      S.draw(ctx, c, o);
      if (V) { ctx.save(); V.draw(ctx, c, o); ctx.restore(); }
      if (S.over) S.over(ctx, c, o);
      if (C && C.front) { ctx.save(); C.front(ctx, c, T, o); ctx.restore(); }
      ctx.restore();
    };
    fn.afSpec = Object.assign({ kind: 'helmet' }, spec);
    P.helmet[id] = fn;
    return id;
  }

  function shield(id, spec) {
    spec = spec || {};
    const S = pick(SHAPE, spec.shape || 'heater', 'shape') || SHAPE.heater;
    const E = pick(EMBLEM, spec.emblem, 'emblem');
    const PT = PATTERN[spec.pattern] || PATTERN.none;
    if (spec.pattern && !PATTERN[spec.pattern]) warn('neznámé dělení pole: ' + spec.pattern);
    const fn = (ctx, L, pal, atk) => {
      const c = colors(pal, spec.colors);
      const F = pal.feat || {};
      const field = hx(spec.colors && spec.colors.field, S.metalField ? c.metal : c.tunic);
      const field2 = hx(spec.colors && spec.colors.field2, shade(field, -0.38));
      const emb = hx(spec.colors && spec.colors.emblem, hx(F.emblemColor, c.trim));
      c.rim = hx(spec.colors && spec.colors.rim, c.trim);
      const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0;
      ctx.save(); ctx.translate(sx, 0);
      if (S.pre) S.pre(ctx, c);
      S.path(ctx);
      fs(ctx, S.metalField ? metalG(ctx, c, S.cx - 9, S.cy - 9, S.cx + 9, S.cy + 9, field) : lg(ctx, S.cx - 12, S.cy - 18, S.cx + 12, S.cy + 18, [[0, shade(field, 0.18)], [0.55, field], [1, shade(field, -0.28)]]), 2.2);
      ctx.save(); S.path(ctx); ctx.clip();
      PT(ctx, field2, S);
      if (S.field) S.field(ctx, c);
      if (E) { ctx.save(); ctx.translate(S.cx, S.cy); ctx.scale(S.es * (spec.emblemScale || 1), S.es * (spec.emblemScale || 1)); E.draw(ctx, emb, { t: now() }); ctx.restore(); }
      ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.beginPath(); ctx.ellipse(S.cx - 5, S.cy - 9, 5, 9, -0.3, 0, TAU); ctx.fill();
      ctx.restore();
      if (S.deco) S.deco(ctx, c);
      S.path(ctx); ctx.lineWidth = 2.2; ctx.strokeStyle = OUT; ctx.stroke();
      if (S.boss && !(E && E.noBoss)) { ctx.beginPath(); ctx.arc(S.cx, S.cy, 3.4, 0, TAU); fs(ctx, metalG(ctx, c, S.cx - 3, S.cy - 3, S.cx + 3, S.cy + 3), 1.4); ctx.beginPath(); ctx.arc(S.cx - 1, S.cy - 1.1, 1, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); }
      else if (S.boss) { ctx.fillStyle = c.metal; for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + PI / 4; ctx.beginPath(); ctx.arc(S.cx + Math.cos(a) * 9.6, S.cy + Math.sin(a) * 9.6, 1, 0, TAU); fs(ctx, c.metal, 0.7); } }
      ctx.restore();
    };
    fn.afSpec = Object.assign({ kind: 'shield' }, spec);
    P.shield[id] = fn;
    return id;
  }

  /* jediný obal drawFeatures – čte pal.feat.af = { back, chest, shoulder, aura } */
  const ORDER = { back: [['aura', 'back'], ['back', 'back'], ['chest', 'back'], ['shoulder', 'back']], chest: [['back', 'chest'], ['chest', 'chest']], top: [['shoulder', 'top'], ['chest', 'top'], ['back', 'top'], ['aura', 'top']] };
  const CATS = { back: BACK, chest: CHEST, shoulder: SHOULDER, aura: AURA };
  const prevDraw = A.drawFeatures;
  A.drawFeatures = (ctx, L, pal, st, layer, moving, w) => {
    const F = pal.feat;
    if (F && F.af) {
      const af = F.af, seq = ORDER[layer];
      if (seq) {
        const c = colors(pal, af.colors);
        const o = { t: (st && st.t) || 0, moving, w: w || 0, L, st, af };
        for (const [slot, fnName] of seq) { const part = af[slot] && CATS[slot][af[slot]]; if (part && part[fnName]) { ctx.save(); if (slot === 'shoulder') ctx.translate(-1, -50.5); part[fnName](ctx, c, o); ctx.restore(); } }
      }
      const F2 = Object.assign({}, F, { af: null });
      return prevDraw ? prevDraw(ctx, L, Object.assign({}, pal, { feat: F2 }), st, layer, moving, w) : undefined;
    }
    return prevDraw ? prevDraw(ctx, L, pal, st, layer, moving, w) : undefined;
  };
  // vlastní sašimono (prapor na zádech) nahrazuje původní praporek samurajů
  const prevBack = P.back;
  if (prevBack) P.back = (ctx, L, pal, st, moving, w, bob) => {
    const af = pal && pal.feat && pal.feat.af;
    if (L.sashimono && af && BACK[af.back] && BACK[af.back].noSashi) return prevBack(ctx, Object.assign({}, L, { sashimono: false }), pal, st, moving, w, bob);
    return prevBack(ctx, L, pal, st, moving, w, bob);
  };

  const keys = o => Object.keys(o).filter(k => k !== 'none');
  window.ArmorForge = {
    helmet, shield,
    lists: { shells: keys(SHELL), crests: keys(CREST), visors: keys(VISOR), shieldShapes: keys(SHAPE), emblems: keys(EMBLEM), patterns: keys(PATTERN), backs: keys(BACK), chests: keys(CHEST), shoulders: keys(SHOULDER), auras: keys(AURA) },
    parts: { shells: SHELL, crests: CREST, visors: VISOR, shieldShapes: SHAPE, emblems: EMBLEM, patterns: PATTERN, backs: BACK, chests: CHEST, shoulders: SHOULDER, auras: AURA },
    /* pomocník: složí feat objekt pro skin */
    feat(o) { return { af: Object.assign({}, o) }; },
    has(cat, id) { const C = this.parts[cat]; return !!(C && C[id]); }
  };
})();
