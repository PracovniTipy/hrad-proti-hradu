/* =========================================================================
   KOVÁRNA ZBRANÍ (Forge) – parametrická knihovna dílů zbraní
   Ze dílů (čepel / hlava, záštita, hlavice, ozdoba) se skládají stovky
   různých skinů. Všechny díly používají barvy z colors(pal, M):
     c = { blade, dark, edge, guard, grip, pommel, glow, gem, wood, string }
   takže stejný tvar jde libovolně přebarvit. Záře jen když je c.glow.

   API (volá datový soubor načtený PO tomto souboru):
     Forge.melee(id, { blade, guard, pommel, deco, grip, flip })      – meč
     Forge.melee(id, { head,  pommel, deco, grip })                    – sekera/palcát (HEADED)
     Forge.pole(id,  { head, collar })                                 – kopí
     Forge.bow(id,   { style, size })                                  – luk
     Forge.staff(id, { head })                                         – hůl mága
     Forge.lists = { blades, guards, pommels, decos, heads, poleHeads, collars, bowStyles, staffHeads }

   Souřadnice:
     MELEE: rukojeť v 0 směrem do −y, čepel do +y (6…56), záštita y 0…8
     POLE:  násadu kreslí engine podél +x, hrot x 44…82, y ±16
     BOW:   bowDecor(ctx, at, c, T, B, gemFn), at(k) bod na rameni (0.5 = úchop)
     STAFF: hlavice se středem (0, y), velikost ±12
   ========================================================================= */
(function () {
  const A = window.Art;
  if (!A || !A.MELEE_REF || !A.POLE_REF) return;
  const TAU = Math.PI * 2, OUT = A.OUT || '#121419';
  const M = A.MELEE_REF, PO = A.POLE_REF, BF = A.bladeFill, GO = A.glowOn, GF = A.glowOff, gem = A.gemDot;
  const HEADED = A.HEADED_REF, FLIP = A.FLIP_REF;
  A.BOW_REF = A.BOW_REF || {}; A.bowDecor = A.bowDecor || {};
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  const HEX = /^#[0-9a-f]{6}$/i;
  const shade = (h, a) => (typeof h === 'string' && HEX.test(h) ? A.shade(h, a) : h);
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const glowS = (ctx, col, b) => { ctx.shadowColor = col; ctx.shadowBlur = b; };
  const now = () => performance.now() / 1000;
  const star = (ctx, x, y, r1, r2, n, rot) => { ctx.beginPath(); for (let k = 0; k < n * 2; k++) { const a = (rot == null ? -Math.PI / 2 : rot) + k * Math.PI / n, r = k % 2 ? r2 : r1; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); };
  // obtažená čára: tmavý obrys + barva (pro řetězy, úponky, kroucené záštity)
  const line2 = (ctx, col, w) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w + 2; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
  const BONE = '#ece3cc';
  const hexA = (h, a) => { if (!(typeof h === 'string' && HEX.test(h))) return h; const v = parseInt(h.slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; };
  const gemCol = c => c.gem || c.glow || '#d6243a';
  const litCol = (c, dflt) => c.glow || dflt;
  // malá lebka (cx, cy), r = poloměr, up = směr temene (1 = +y, -1 = −y)
  function skull(ctx, x, y, r, up, eyeCol, col) {
    ctx.beginPath(); ctx.arc(x, y + up * r * 0.15, r, 0, TAU); fs(ctx, col || BONE, Math.max(0.8, r * 0.28));
    rr(ctx, x - r * 0.55, y - up * r * 0.95 - (up < 0 ? 0 : r * 0.5), r * 1.1, r * 0.55, r * 0.2); fs(ctx, col || BONE, Math.max(0.6, r * 0.22));
    ctx.fillStyle = OUT; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * r * 0.42, y + up * r * 0.05, r * 0.3, 0, TAU); ctx.fill(); }
    if (eyeCol) { ctx.save(); glowS(ctx, eyeCol, 6); ctx.fillStyle = eyeCol; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * r * 0.42, y + up * r * 0.05, r * 0.16, 0, TAU); ctx.fill(); } ctx.restore(); }
  }
  // runové znaky (jednotkové souřadnice, lomené čáry)
  const GLY = [
    [[0, -1, 0, 1], [0, -0.9, 0.8, -0.35], [0, -0.15, 0.8, 0.4]],
    [[-0.55, -1, -0.55, 1], [0.55, -1, 0.55, 1], [-0.55, -0.4, 0.55, 0.4]],
    [[0, -1, 0, 1], [-0.7, -0.5, 0.7, 0.5], [0.7, -0.5, -0.7, 0.5]],
    [[-0.6, 1, 0, -1, 0.6, 1], [-0.3, 0.2, 0.3, 0.2]],
    [[0, -1, 0, 1], [0, -1, 0.75, -0.45, 0, 0.1]],
    [[0.6, -1, -0.6, 0, 0.6, 1]],
    [[0, -1, 0, 1], [-0.7, -1, 0, -0.3, 0.7, -1]],
    [[-0.6, -0.6, 0, -1, 0.6, -0.6, 0, 1, -0.6, -0.6]]
  ];
  function glyph(ctx, x, y, k, s) {
    const g = GLY[((k % GLY.length) + GLY.length) % GLY.length];
    ctx.beginPath();
    for (const pl of g) { ctx.moveTo(x + pl[0] * s * 0.7, y + pl[1] * s); for (let i = 2; i < pl.length; i += 2) ctx.lineTo(x + pl[i] * s * 0.7, y + pl[i + 1] * s); }
    ctx.stroke();
  }
  function orb(ctx, x, y, r, glow, raise) {
    ctx.save(); glowS(ctx, glow, 10 + (raise || 0) * 14);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.4, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, glow); g.addColorStop(1, shade(glow, -0.4));
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.stroke();
  }
  // deterministický pseudonáhodný generátor (praskliny, střepy – stejné každý snímek)
  const rnd = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  /* =====================================================================
     1) ČEPELE MEČŮ  { w, bx:[x0,x1], y0, y1, grip, flip, path(ctx), mid(y), detail(ctx,c) }
     ===================================================================== */
  const BL = {
    // široký meč s žlábkem a zkosenými hranami
    broad: { w: 5.4, y0: 8, y1: 40, grip: 11,
      path(ctx) { ctx.moveTo(-5.4, 6); ctx.lineTo(-5, 40); ctx.lineTo(0, 51); ctx.lineTo(5, 40); ctx.lineTo(5.4, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 38); ctx.lineWidth = 1.8; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-0.9, 9); ctx.lineTo(-0.9, 37); ctx.lineWidth = 0.5; ctx.strokeStyle = c.edge; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3.8, 7); ctx.lineTo(-3.6, 40); ctx.lineTo(0, 48); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
      } },
    // listová čepel (řecký xiphos) – nejširší ve dvou třetinách
    leaf: { w: 6.6, y0: 8, y1: 44, grip: 10,
      path(ctx) { ctx.moveTo(-2.4, 6); ctx.bezierCurveTo(-4, 18, -8.6, 32, 0, 54); ctx.bezierCurveTo(8.6, 32, 4, 18, 2.4, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 50); ctx.lineWidth = 1.1; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1.6, 12); ctx.bezierCurveTo(-3.6, 24, -5.6, 34, -0.6, 50); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke();
      } },
    // tesák (falchion): rovný hřbet, ostří se vydouvá ke useknuté špičce
    falchion: { w: 6, bx: [-8.8, 3.4], y0: 8, y1: 40, grip: 10, flip: true, mid: y => -2 - Math.max(0, y - 18) * 0.1,
      path(ctx) { ctx.moveTo(3.2, 6); ctx.lineTo(3.4, 40); ctx.quadraticCurveTo(3, 47, 0.6, 50); ctx.quadraticCurveTo(-7.4, 46, -8.8, 36); ctx.quadraticCurveTo(-4.4, 22, -3, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(2.2, 8); ctx.lineTo(2.3, 40); ctx.lineWidth = 0.9; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-2.2, 8); ctx.quadraticCurveTo(-3.6, 22, -7.6, 36); ctx.quadraticCurveTo(-6.4, 44, 0, 48.6); ctx.lineWidth = 0.8; ctx.strokeStyle = c.edge; ctx.stroke();
      } },
    // šavle (scimitar): silně zahnutá, rozšířená ke špičce
    scimitar: { w: 7, bx: [-13, 3.4], y0: 8, y1: 42, grip: 10, flip: true, mid: y => (y < 18 ? 0 : -Math.pow((y - 18) / 28, 2) * 8),
      path(ctx) { ctx.moveTo(-2.6, 6); ctx.bezierCurveTo(-2, 24, -5, 37, -13.5, 47); ctx.bezierCurveTo(-6, 50, 2.4, 42, 3.6, 26); ctx.lineTo(3, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(2.4, 8); ctx.lineTo(2.6, 26); ctx.bezierCurveTo(1.6, 39, -5, 46.6, -11.5, 46.8); ctx.lineWidth = 0.9; ctx.strokeStyle = c.edge; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1.4, 8); ctx.bezierCurveTo(-1, 22, -3, 32, -6, 38); ctx.lineWidth = 0.9; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke();
      } },
    // katana: štíhlá, jemně zahnutá, s vlnitou linií kalení (hamon)
    katana: { w: 3, bx: [-8, 3.4], y0: 8, y1: 46, grip: 14, wrap: 'ito', flip: true, mid: y => -Math.pow((y - 6) / 48, 2) * 5,
      path(ctx) { ctx.moveTo(-1.9, 6); ctx.quadraticCurveTo(-0.6, 36, -8, 56); ctx.quadraticCurveTo(-4.6, 54, -3.4, 51); ctx.quadraticCurveTo(3.6, 33, 2.4, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); for (let y = 8; y <= 49; y += 1.5) { const x = -Math.pow((y - 6) / 48, 2) * 5 + 0.9 + Math.sin(y * 0.9) * 0.55; y === 8 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1, 8); ctx.quadraticCurveTo(0, 34, -6, 53); ctx.lineWidth = 0.6; ctx.strokeStyle = shade(c.dark, -0.25); ctx.stroke();
        rr(ctx, -2.4, 4.6, 5, 3.6, 0.8); fs(ctx, c.guard, 1);   // habaki
      } },
    // plamenná čepel (flamberk): výrazné vlny po celé délce
    flame: { w: 5.6, y0: 8, y1: 44, grip: 12, mid: y => Math.sin(y * 0.42) * 1.9 * (1 - (y - 6) / 80),
      path(ctx) {
        const wv = y => Math.sin(y * 0.42) * 1.9 * (1 - (y - 6) / 80);
        ctx.moveTo(-3.4, 6); for (let y = 8; y <= 46; y += 2) ctx.lineTo(-3.6 + wv(y), y);
        ctx.lineTo(0, 56); for (let y = 46; y >= 8; y -= 2) ctx.lineTo(3.6 + wv(y), y); ctx.lineTo(3.4, 6); ctx.closePath();
      },
      detail(ctx, c) {
        ctx.beginPath(); for (let y = 8; y <= 48; y += 2) { const x = Math.sin(y * 0.42) * 1.9 * (1 - (y - 6) / 80); y === 8 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.lineWidth = 1.1; ctx.strokeStyle = c.glow || shade(c.dark, -0.2); ctx.stroke();
      } },
    // pilovitá čepel: jedno hladké ostří, druhé se zuby pily
    serrated: { w: 5.6, y0: 8, y1: 42, grip: 11,
      path(ctx) { ctx.moveTo(4.4, 6); ctx.lineTo(4.2, 40); ctx.lineTo(0, 53); ctx.lineTo(-4.4, 42); for (let y = 42; y > 10; y -= 3.6) { ctx.lineTo(-7.4, y - 1); ctx.lineTo(-4.4, y - 3.6); } ctx.lineTo(-4.4, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(-3.4, 8); ctx.lineTo(-3.4, 42); ctx.lineWidth = 0.8; ctx.strokeStyle = shade(c.dark, -0.25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(3.4, 8); ctx.lineTo(3.2, 40); ctx.lineTo(0, 50); ctx.lineWidth = 0.7; ctx.strokeStyle = c.edge; ctx.stroke();
      } },
    // klínová dvousečná čepel zužující se do jehly (estok)
    tapered: { w: 6.4, y0: 8, y1: 44, grip: 12,
      path(ctx) { ctx.moveTo(-6.4, 6); ctx.lineTo(0, 58); ctx.lineTo(6.4, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(-6.4, 6); ctx.lineTo(0, 58); ctx.lineTo(0, 6); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, 56); ctx.lineWidth = 0.9; ctx.strokeStyle = shade(c.dark, -0.25); ctx.stroke();
      } },
    // zlomená čepel: ulomený zubatý konec, vyštípnuté ostří a praskliny
    broken: { w: 4.6, y0: 8, y1: 30, grip: 10,
      path(ctx) { ctx.moveTo(-4.4, 6); ctx.lineTo(-4.3, 19); ctx.lineTo(-2.6, 21.5); ctx.lineTo(-4.3, 24); ctx.lineTo(-4.2, 34); ctx.lineTo(-2.2, 38.5); ctx.lineTo(-1, 33.5); ctx.lineTo(0.8, 38); ctx.lineTo(2.4, 32.6); ctx.lineTo(4.3, 36.4); ctx.lineTo(4.5, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.strokeStyle = shade(c.dark, -0.35); ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(-1, 33.5); ctx.lineTo(-0.4, 28); ctx.lineTo(-1.4, 24); ctx.moveTo(-0.4, 28); ctx.lineTo(1.4, 25); ctx.moveTo(2.4, 32.6); ctx.lineTo(2.6, 29); ctx.moveTo(-2.6, 21.5); ctx.lineTo(-0.6, 19.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 22); ctx.lineWidth = 1.4; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      } },
    // chopeš: rovný krk a velký srpkovitý hák
    crescent: { w: 6, bx: [-13, 2.6], y0: 8, y1: 40, grip: 10, flip: true, mid: y => (y < 24 ? 0 : -6),
      path(ctx) { ctx.moveTo(-2.4, 6); ctx.lineTo(-2.4, 24); ctx.bezierCurveTo(-15, 27, -15, 51, 0.5, 55); ctx.bezierCurveTo(-7, 47, -7, 33, 2.6, 28); ctx.lineTo(2.6, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(-3, 27); ctx.bezierCurveTo(-13.6, 30, -13.4, 49, -1, 54); ctx.lineWidth = 0.9; ctx.strokeStyle = c.edge; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 24); ctx.lineWidth = 1.2; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      } },
    // sekáček (cleaver): široký obdélník s otvorem
    cleaver: { w: 6.8, bx: [-10, 3.6], y0: 10, y1: 40, grip: 10, mid: () => -3.2,
      path(ctx) { ctx.moveTo(-2.4, 6); ctx.lineTo(-9.6, 9); ctx.lineTo(-10.2, 44); ctx.quadraticCurveTo(-4, 47.5, 3.6, 44.6); ctx.lineTo(3.6, 6); ctx.closePath();
        ctx.moveTo(-3.8, 14.4); ctx.arc(-6.2, 14.4, 2.4, 0, TAU, false); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(-9.2, 11); ctx.lineTo(-9.6, 43); ctx.quadraticCurveTo(-4, 46, 2.6, 43.6); ctx.lineWidth = 1; ctx.strokeStyle = c.edge; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2.6, 8); ctx.lineTo(2.6, 43); ctx.lineWidth = 0.8; ctx.strokeStyle = shade(c.dark, -0.25); ctx.stroke();
      } },
    // kord (rapír): velmi tenká dlouhá čepel
    rapier: { w: 2, y0: 10, y1: 46, grip: 10,
      path(ctx) { ctx.moveTo(-1.7, 6); ctx.lineTo(-1.1, 50); ctx.lineTo(0, 58); ctx.lineTo(1.1, 50); ctx.lineTo(1.7, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, 54); ctx.lineWidth = 0.5; ctx.strokeStyle = c.edge; ctx.stroke();
        rr(ctx, -2.2, 6, 4.4, 5, 1); fs(ctx, c.dark, 0.9);   // ricasso
      } },
    // vidličná čepel: od poloviny se dělí do dvou hrotů
    forked: { w: 5.6, y0: 8, y1: 32, grip: 11,
      path(ctx) { ctx.moveTo(-4.2, 6); ctx.lineTo(-4.6, 36); ctx.lineTo(-5.6, 55); ctx.lineTo(-1.6, 42); ctx.lineTo(0, 33); ctx.lineTo(1.6, 42); ctx.lineTo(5.6, 55); ctx.lineTo(4.6, 36); ctx.lineTo(4.2, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.strokeStyle = shade(c.dark, -0.2); ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 30); ctx.moveTo(-1.6, 33); ctx.lineTo(-4.2, 50); ctx.moveTo(1.6, 33); ctx.lineTo(4.2, 50); ctx.stroke();
      } },
    // prolamovaná čepel: tři průhledné otvory po délce
    hollow: { w: 5.8, y0: 8, y1: 42, grip: 11,
      path(ctx) { ctx.moveTo(-5.8, 6); ctx.lineTo(-5.2, 41); ctx.lineTo(0, 52); ctx.lineTo(5.2, 41); ctx.lineTo(5.8, 6); ctx.closePath();
        for (const [y, ry] of [[13, 3.6], [23, 3.8], [33, 3.4]]) { ctx.moveTo(2.4, y); ctx.ellipse(0, y, 2.4, ry, 0, 0, TAU, false); }
        ctx.moveTo(1.3, 42); ctx.ellipse(0, 42, 1.3, 2.2, 0, 0, TAU, false); },
      detail(ctx, c) {
        ctx.strokeStyle = c.edge; ctx.lineWidth = 0.5;
        for (const [y, ry] of [[13, 3.6], [23, 3.8], [33, 3.4]]) { ctx.beginPath(); ctx.ellipse(0, y, 3.2, ry + 0.8, 0, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); }
      } },
    // runový žlábek: hluboký kanál se zářícími runami
    runic: { w: 5.8, y0: 10, y1: 38, grip: 11,
      path(ctx) { ctx.moveTo(-5.8, 6); ctx.lineTo(-5.4, 40); ctx.lineTo(0, 51); ctx.lineTo(5.4, 40); ctx.lineTo(5.8, 6); ctx.closePath(); },
      detail(ctx, c) {
        rr(ctx, -2, 9, 4, 33, 1.6); ctx.fillStyle = shade(c.dark, -0.55); ctx.fill();
        const col = c.glow || c.guard;
        ctx.save(); if (c.glow) glowS(ctx, c.glow, 8); ctx.strokeStyle = col; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
        for (let k = 0; k < 5; k++) glyph(ctx, 0, 13 + k * 6.4, k + 1, 2.1);
        ctx.restore();
      } },
    // krystalová čepel: fasetovaný průsvitný krystal
    crystal: { w: 6.8, y0: 8, y1: 44, grip: 10, alpha: 0.9,
      path(ctx) { ctx.moveTo(-2.6, 6); ctx.lineTo(-6, 15); ctx.lineTo(-3.4, 22); ctx.lineTo(-6.8, 31); ctx.lineTo(-3.6, 38); ctx.lineTo(-5, 45); ctx.lineTo(0, 57); ctx.lineTo(4.6, 44); ctx.lineTo(3.2, 37); ctx.lineTo(6.4, 28); ctx.lineTo(3.4, 20); ctx.lineTo(5.6, 12); ctx.lineTo(2.6, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(-1, 18); ctx.lineTo(0.6, 30); ctx.lineTo(-0.6, 42); ctx.lineTo(0, 55); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
        ctx.beginPath(); for (const [x, y, x2, y2] of [[-6, 15, -1, 18], [-6.8, 31, 0.6, 30], [-5, 45, -0.6, 42], [5.6, 12, -1, 18], [6.4, 28, 0.6, 30], [4.6, 44, -0.6, 42]]) { ctx.moveTo(x, y); ctx.lineTo(x2, y2); }
        ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-5.6, 9); ctx.lineTo(-9.4, 13); ctx.lineTo(-5, 14); ctx.closePath(); fs(ctx, BF(ctx, c, -9, -5), 0.9);   // úlomek u kořene
      } },
    // dračí tesák: zahnutý kostěný zub s rýhami
    tooth: { w: 5, bx: [-9, 4.6], y0: 8, y1: 42, grip: 10, flip: true, mid: y => -Math.pow((y - 6) / 46, 2) * 6,
      path(ctx) { ctx.moveTo(-4.6, 6); ctx.quadraticCurveTo(-4.6, 36, -9.4, 54); ctx.quadraticCurveTo(3.6, 40, 4.6, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.strokeStyle = shade(c.dark, -0.2); ctx.lineWidth = 0.8;
        for (const y of [10, 14, 18]) { ctx.beginPath(); ctx.moveTo(-4.4, y); ctx.quadraticCurveTo(0, y + 1.6, 4.4, y - 0.4); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(3, 20); ctx.quadraticCurveTo(1.6, 40, -7.6, 51.5); ctx.lineWidth = 0.8; ctx.strokeStyle = c.edge; ctx.stroke();
      } },
    // obouruční greatsword: masivní čepel s parírovacími výstupky
    great: { w: 7, y0: 16, y1: 44, grip: 16,
      path(ctx) { ctx.moveTo(-3, 6); ctx.lineTo(-3, 11); ctx.lineTo(-7, 12.6); ctx.lineTo(-6.4, 46); ctx.lineTo(0, 57); ctx.lineTo(6.4, 46); ctx.lineTo(7, 12.6); ctx.lineTo(3, 11); ctx.lineTo(3, 6); ctx.closePath(); },
      detail(ctx, c) {
        ctx.strokeStyle = shade(c.dark, -0.2); ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(-1.2, 16); ctx.lineTo(-1.2, 44); ctx.moveTo(1.2, 16); ctx.lineTo(1.2, 44); ctx.stroke();
        rr(ctx, -3, 6, 6, 5, 1); fs(ctx, c.grip, 1);   // kožený ricasso
      } }
  };
  for (const k in BL) { const b = BL[k]; b.mid = b.mid || (() => 0); b.bx = b.bx || [-b.w, b.w]; }

  /* =====================================================================
     2) HLAVY SEKER A PALCÁTŮ (HEADED – v boji se drží hlavou nahoru)
        { top, y0, y1, w, cx(s), path(ctx,s), detail(ctx,c,s), back?(ctx,c,s) }
     ===================================================================== */
  const eye = (ctx, c, y, h) => { rr(ctx, -2.8, y, 5.6, h, 1.2); fs(ctx, c.dark, 1.2); };
  const HD = {
    // dánská sekera s dlouhým vousem
    beard: { top: 44, y0: 27, y1: 46, w: 5, cx: s => s * 9, bx: s => [s * 18, s * 1.6],
      path(ctx, s) { ctx.moveTo(s * 1.6, 28); ctx.lineTo(s * 14, 24.5); ctx.quadraticCurveTo(s * 18.4, 37, s * 13, 51.5); ctx.quadraticCurveTo(s * 8, 47, s * 5, 40); ctx.quadraticCurveTo(s * 3.5, 37, s * 1.6, 36.5); ctx.closePath(); },
      detail(ctx, c, s) { ctx.beginPath(); ctx.moveTo(s * 14.4, 26); ctx.quadraticCurveTo(s * 17.4, 37, s * 12.6, 50); ctx.lineWidth = 1.2; ctx.strokeStyle = c.edge; ctx.stroke(); eye(ctx, c, 27, 10.5); } },
    // dvoubřitá motýlí sekera
    double: { top: 44, y0: 22, y1: 40, w: 6, cx: s => s * 8, bx: () => [-18, 18], twin: true,
      path(ctx) { for (const d of [-1, 1]) { ctx.moveTo(d * 1.6, 27); ctx.bezierCurveTo(d * 8, 25, d * 12, 18, d * 14, 15); ctx.quadraticCurveTo(d * 20, 31, d * 14, 47); ctx.bezierCurveTo(d * 12, 44, d * 8, 37, d * 1.6, 35); ctx.closePath(); } },
      detail(ctx, c) { for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 14.6, 17); ctx.quadraticCurveTo(d * 19, 31, d * 14.6, 45); ctx.lineWidth = 1.1; ctx.strokeStyle = c.edge; ctx.stroke(); } eye(ctx, c, 25, 11); ctx.beginPath(); ctx.moveTo(-1.8, 37); ctx.lineTo(0, 47); ctx.lineTo(1.8, 37); ctx.closePath(); fs(ctx, c.dark, 1); } },
    // měsíční sekera: velký srpek připevněný ve dvou bodech
    moon: { top: 48, y0: 18, y1: 50, w: 4, cx: s => s * 15, bx: s => [s * 21, s * 1.6],
      path(ctx, s) { ctx.moveTo(s * 2, 24); ctx.quadraticCurveTo(s * 8, 22, s * 12, 15); ctx.bezierCurveTo(s * 23, 25, s * 23, 45, s * 12, 54); ctx.quadraticCurveTo(s * 8, 47, s * 2, 45); ctx.lineTo(s * 2, 40); ctx.quadraticCurveTo(s * 7, 40, s * 10.4, 42.6); ctx.bezierCurveTo(s * 15.6, 37, s * 15.6, 31, s * 10.4, 25.6); ctx.quadraticCurveTo(s * 7, 29, s * 2, 29); ctx.closePath(); },
      detail(ctx, c, s) { ctx.beginPath(); ctx.moveTo(s * 13, 17); ctx.bezierCurveTo(s * 22, 26, s * 22, 44, s * 13, 52); ctx.lineWidth = 1.2; ctx.strokeStyle = c.edge; ctx.stroke(); eye(ctx, c, 22, 8); eye(ctx, c, 39, 7.5); } },
    // vějířová bitevní sekera s bodcem vzadu
    fan: { top: 44, y0: 26, y1: 44, w: 5, cx: s => s * 9, bx: s => [s * 19, s * 1.6],
      path(ctx, s) { ctx.moveTo(s * 1.6, 30); ctx.lineTo(s * 8, 27); ctx.lineTo(s * 14, 19); ctx.quadraticCurveTo(s * 20, 34, s * 14, 49); ctx.lineTo(s * 8, 41); ctx.lineTo(s * 1.6, 38); ctx.closePath(); },
      back(ctx, c, s) { ctx.beginPath(); ctx.moveTo(-s * 1.6, 31); ctx.lineTo(-s * 11, 34.4); ctx.lineTo(-s * 1.6, 37.4); ctx.closePath(); fs(ctx, c.dark, 1.2); },
      detail(ctx, c, s) { ctx.beginPath(); ctx.moveTo(s * 14.6, 21); ctx.quadraticCurveTo(s * 19, 34, s * 14.6, 47); ctx.lineWidth = 1.2; ctx.strokeStyle = c.edge; ctx.stroke(); ctx.beginPath(); ctx.moveTo(s * 8, 28.6); ctx.lineTo(s * 8, 39.6); ctx.lineWidth = 0.8; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke(); eye(ctx, c, 28, 11); } },
    // tomahavk: malá hlava, dlouhý zahnutý zadní bodec a pírko
    tomahawk: { top: 46, y0: 34, y1: 45, w: 3.4, cx: s => s * 6, bx: s => [s * 12.4, s * 1.6],
      path(ctx, s) { ctx.moveTo(s * 1.6, 36); ctx.lineTo(s * 9, 33.4); ctx.quadraticCurveTo(s * 12.6, 39.5, s * 10.4, 46); ctx.lineTo(s * 1.6, 41.6); ctx.closePath(); },
      back(ctx, c, s) {
        ctx.beginPath(); ctx.moveTo(-s * 1.6, 36.4); ctx.quadraticCurveTo(-s * 8, 36, -s * 12, 42); ctx.quadraticCurveTo(-s * 7, 39.4, -s * 1.6, 40.6); ctx.closePath(); fs(ctx, c.dark, 1.1);
        const sw = Math.sin(now() * 3) * 0.12;
        ctx.beginPath(); ctx.moveTo(-s * 1.8, 30); ctx.quadraticCurveTo(-s * 5, 29, -s * 6, 25); ctx.lineWidth = 0.8; ctx.strokeStyle = OUT; ctx.stroke();
        ctx.beginPath(); ctx.arc(-s * 6, 24.6, 1.1, 0, TAU); fs(ctx, c.guard, 0.6);
        for (const [o, col] of [[0, gemCol(c)], [1, '#f4f2ea']]) { ctx.save(); ctx.translate(-s * 6, 24); ctx.rotate(-s * (0.15 + o * 0.45) + sw); ctx.beginPath(); ctx.ellipse(0, -5, 1.5, 5, 0, 0, TAU); fs(ctx, col, 0.8); ctx.beginPath(); ctx.moveTo(0, -0.6); ctx.lineTo(0, -9.4); ctx.lineWidth = 0.4; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.stroke(); ctx.restore(); }
      },
      detail(ctx, c, s) { ctx.beginPath(); ctx.moveTo(s * 9.6, 35); ctx.quadraticCurveTo(s * 12, 39.5, s * 10, 44.6); ctx.lineWidth = 1; ctx.strokeStyle = c.edge; ctx.stroke(); rr(ctx, -2.4, 33.4, 4.8, 9, 1); fs(ctx, c.dark, 1.1); rr(ctx, -2.2, 26, 4.4, 5, 1); fs(ctx, c.grip, 1); } },
    // katovská sekera: vysoká obdélná čepel s okem
    executioner: { top: 48, y0: 22, y1: 44, w: 5, cx: s => s * 8, bx: s => [s * 14, s * 1.6],
      path(ctx, s) { ctx.moveTo(s * 1.6, 22); ctx.lineTo(s * 12, 19.6); ctx.lineTo(s * 14.4, 46.6); ctx.quadraticCurveTo(s * 8, 49.6, s * 1.6, 46); ctx.closePath(); const x = s * 7; ctx.moveTo(x + 2.4, 27); ctx.arc(x, 27, 2.4, 0, TAU, s > 0); },
      detail(ctx, c, s) { ctx.beginPath(); ctx.moveTo(s * 12.6, 21); ctx.lineTo(s * 14.6, 45.6); ctx.lineWidth = 1.2; ctx.strokeStyle = c.edge; ctx.stroke(); eye(ctx, c, 21, 26); for (const y of [24, 31, 38, 44]) { ctx.beginPath(); ctx.arc(0, y, 0.8, 0, TAU); ctx.fillStyle = c.guard; ctx.fill(); } } },
    // dračí sekera: blána křídla se zubatým ostřím a okem
    dragon: { top: 46, y0: 22, y1: 44, w: 5, cx: s => s * 9, bx: s => [s * 19, s * 1.6],
      path(ctx, s) { ctx.moveTo(s * 1.6, 24); ctx.lineTo(s * 10, 15); ctx.lineTo(s * 16.4, 21.4); ctx.lineTo(s * 14, 27); ctx.lineTo(s * 19.4, 31.6); ctx.lineTo(s * 15, 36.4); ctx.lineTo(s * 18.4, 44); ctx.lineTo(s * 10.6, 46.6); ctx.lineTo(s * 6, 41); ctx.lineTo(s * 1.6, 40); ctx.closePath(); },
      detail(ctx, c, s) {
        ctx.strokeStyle = shade(c.dark, -0.25); ctx.lineWidth = 0.8; ctx.beginPath(); for (const [x, y] of [[10, 15], [14, 27], [15, 36.4], [10.6, 46.6]]) { ctx.moveTo(s * 2.6, 32); ctx.lineTo(s * x, y); } ctx.stroke();
        eye(ctx, c, 23, 18); gem(ctx, s * 5.6, 31.6, 1.8, gemCol(c));
      } },
    // válečný krumpáč: dlouhý zahnutý zobec a kladívko
    pick: { top: 46, y0: 31, y1: 40, w: 3.4, cx: s => s * 9, bx: s => [s * 21, -s * 8],
      path(ctx, s) { ctx.moveTo(s * 1.8, 32.6); ctx.quadraticCurveTo(s * 12, 30.6, s * 21.4, 42.6); ctx.quadraticCurveTo(s * 11, 37, s * 1.8, 38.6); ctx.closePath(); },
      back(ctx, c, s) { rr(ctx, s > 0 ? -8.4 : 1.8, 31, 6.6, 9, 1.4); fs(ctx, BF(ctx, c, -8, 8), 1.3); ctx.fillStyle = shade(c.dark, -0.3); for (const y of [33.4, 37.4]) for (const x of [3.6, 6.2]) { ctx.beginPath(); ctx.arc(-s * x, y, 0.6, 0, TAU); ctx.fill(); } },
      detail(ctx, c, s) { ctx.beginPath(); ctx.moveTo(s * 4, 32.6); ctx.quadraticCurveTo(s * 13, 31.6, s * 20, 41); ctx.lineWidth = 0.9; ctx.strokeStyle = c.edge; ctx.stroke(); rr(ctx, -2.8, 30, 5.6, 11, 1.2); fs(ctx, c.guard, 1.2); ctx.beginPath(); ctx.moveTo(-1.5, 41); ctx.lineTo(0, 48); ctx.lineTo(1.5, 41); ctx.closePath(); fs(ctx, c.dark, 1); } },
    /* ---------- palcáty a kladiva ---------- */
    // přírubový palcát: šest kovových přírub
    flanged: { top: 44, y0: 27, y1: 45, w: 3, cx: () => 0, bx: () => [-8.6, 8.6], mace: true,
      path(ctx) { for (const d of [-1, 1]) { ctx.moveTo(d * 2.4, 26.4); ctx.lineTo(d * 8.6, 30); ctx.lineTo(d * 8.6, 41); ctx.lineTo(d * 2.4, 46); ctx.closePath(); } },
      back(ctx, c) { rr(ctx, -3, 25, 6, 22, 2); fs(ctx, c.dark, 1.3); },
      detail(ctx, c) {
        for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 4.6, 30); ctx.lineTo(d * 5, 41.6); ctx.lineWidth = 0.7; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke(); }
        rr(ctx, -1.4, 24.6, 2.8, 23, 1); fs(ctx, BF(ctx, c, -1.4, 1.4), 1); ctx.beginPath(); ctx.arc(0, 48.4, 2.4, 0, TAU); fs(ctx, c.guard, 1.1);
        rr(ctx, -3.2, 22.4, 6.4, 2.8, 1); fs(ctx, c.guard, 1);
      } },
    // ranní hvězda: ostnatá koule s pásem
    morning: { top: 36, y0: 34, y1: 46, w: 5, cx: () => 0, bx: () => [-7, 7], mace: true,
      path(ctx) { ctx.arc(0, 40, 7, 0, TAU); },
      back(ctx, c) { for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + 0.3, ca = Math.cos(a), sa = Math.sin(a); ctx.beginPath(); ctx.moveTo(ca * 5.6 - sa * 1.8, 40 + sa * 5.6 + ca * 1.8); ctx.lineTo(ca * 12, 40 + sa * 12); ctx.lineTo(ca * 5.6 + sa * 1.8, 40 + sa * 5.6 - ca * 1.8); ctx.closePath(); fs(ctx, c.dark, 1); } },
      detail(ctx, c) { ctx.beginPath(); ctx.ellipse(0, 40, 7, 2, 0, 0, TAU); ctx.lineWidth = 1.6; ctx.strokeStyle = c.guard; ctx.stroke(); ctx.beginPath(); ctx.arc(-2.4, 37, 1.6, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); rr(ctx, -2.6, 30, 5.2, 3.4, 1); fs(ctx, c.guard, 1); } },
    // válečné kladivo: hranatá palice, zadní bodec a horní hrot
    warhammer: { top: 42, y0: 30, y1: 40, w: 3.6, cx: s => s * 5, bx: s => [s * 10, -s * 12],
      path(ctx, s) { ctx.moveTo(s * 1.8, 29.6); ctx.lineTo(s * 9.6, 29); ctx.lineTo(s * 10.4, 30.4); ctx.lineTo(s * 10.4, 39.6); ctx.lineTo(s * 9.6, 41); ctx.lineTo(s * 1.8, 40.4); ctx.closePath(); },
      back(ctx, c, s) { ctx.beginPath(); ctx.moveTo(-s * 1.8, 31.6); ctx.quadraticCurveTo(-s * 8, 32.6, -s * 12.6, 38); ctx.quadraticCurveTo(-s * 7, 36, -s * 1.8, 38.4); ctx.closePath(); fs(ctx, BF(ctx, c, -12, 12), 1.2); ctx.beginPath(); ctx.moveTo(-1.6, 40); ctx.lineTo(0, 50); ctx.lineTo(1.6, 40); ctx.closePath(); fs(ctx, BF(ctx, c, -1.6, 1.6), 1.1); },
      detail(ctx, c, s) { ctx.fillStyle = shade(c.dark, -0.2); for (const y of [32, 35, 38]) for (const x of [4.6, 7.6]) { ctx.beginPath(); ctx.moveTo(s * x, y - 1); ctx.lineTo(s * (x + 1), y); ctx.lineTo(s * x, y + 1); ctx.lineTo(s * (x - 1), y); ctx.closePath(); ctx.fill(); } rr(ctx, -2.6, 28.4, 5.2, 13, 1.2); fs(ctx, c.guard, 1.1); } },
    // obří palice (maul) s kovovými pásy a nýty
    maul: { top: 30, y0: 29, y1: 45, w: 7, cx: () => 0, bx: () => [-10, 10], mace: true,
      path(ctx) { ctx.roundRect ? ctx.roundRect(-10, 28.6, 20, 16, 2.6) : ctx.rect(-10, 28.6, 20, 16); },
      detail(ctx, c) {
        for (const y of [31, 40.6]) { rr(ctx, -10.6, y, 21.2, 2.4, 1); fs(ctx, c.dark, 1); }
        ctx.fillStyle = c.guard; for (const x of [-7, -2.4, 2.4, 7]) for (const y of [32.2, 41.8]) { ctx.beginPath(); ctx.arc(x, y, 0.75, 0, TAU); ctx.fill(); }
        ctx.beginPath(); ctx.moveTo(-8.6, 35); ctx.lineTo(8.6, 35); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.stroke();
        rr(ctx, -2.8, 25.4, 5.6, 3.6, 1); fs(ctx, c.guard, 1);
      } },
    // hvězdný palcát: plochá šesticípá hvězda s drahokamem
    star: { top: 30, y0: 30, y1: 46, w: 4, cx: () => 0, bx: () => [-11, 11], mace: true,
      path(ctx) { for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k * Math.PI / 6, r = k % 2 ? 4.8 : 11; ctx.lineTo(Math.cos(a) * r, 38 + Math.sin(a) * r); } ctx.closePath(); },
      detail(ctx, c) {
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 0.6; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + k * Math.PI / 3; ctx.moveTo(0, 38); ctx.lineTo(Math.cos(a) * 9.6, 38 + Math.sin(a) * 9.6); } ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 38, 3.4, 0, TAU); fs(ctx, c.guard, 1.1); gem(ctx, 0, 38, 2, gemCol(c));
      } },
    // lebkový palcát: kovová lebka s rohy a zářícíma očima
    skullmace: { top: 34, y0: 32, y1: 46, w: 5, cx: () => 0, bx: () => [-12, 12], mace: true,
      path(ctx) { ctx.ellipse(0, 41, 6.6, 7.4, 0, 0, TAU); },
      back(ctx, c) { for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 4.6, 44); ctx.bezierCurveTo(d * 12, 46, d * 13.6, 38, d * 10, 33); ctx.bezierCurveTo(d * 10.6, 38, d * 9, 41, d * 5, 40); ctx.closePath(); fs(ctx, c.guard, 1.1); } },
      detail(ctx, c) {
        ctx.fillStyle = OUT; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 2.6, 41.6, 1.8, 2.2, 0, 0, TAU); ctx.fill(); }
        if (c.glow) { ctx.save(); glowS(ctx, c.glow, 8); ctx.fillStyle = c.glow; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 2.6, 41.6, 0.9, 0, TAU); ctx.fill(); } ctx.restore(); }
        ctx.beginPath(); ctx.moveTo(-0.9, 38.6); ctx.lineTo(0.9, 38.6); ctx.lineTo(0, 40); ctx.closePath(); ctx.fillStyle = OUT; ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 0.7; for (const x of [-2.4, -0.8, 0.8, 2.4]) { ctx.beginPath(); ctx.moveTo(x, 34.4); ctx.lineTo(x, 36.6); ctx.stroke(); }
        rr(ctx, -2.8, 30.6, 5.6, 3, 1); fs(ctx, c.guard, 1);
      } }
  };

  /* =====================================================================
     3) ZÁŠTITY  (ctx, c, bw = půlšířka čepele, gl = délka rukojeti)
     ===================================================================== */
  const GU = {
    // klasický kříž s kosočtverečnými konci
    cross(ctx, c) {
      rr(ctx, -10, 2.2, 20, 3.4, 1.5); fs(ctx, c.guard, 1.4);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 9.6, 1); ctx.lineTo(d * 12.4, 3.9); ctx.lineTo(d * 9.6, 6.8); ctx.lineTo(d * 8.6, 3.9); ctx.closePath(); fs(ctx, shade(c.guard, -0.12), 1.1); }
      rr(ctx, -2.8, 1, 5.6, 6, 1.4); fs(ctx, shade(c.guard, 0.12), 1.2);
      if (c.gem) gem(ctx, 0, 4, 1.4, c.gem);
    },
    // stočené parírovací záštity (spirály k čepeli)
    curl(ctx, c) {
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(d * 2, 4);
        ctx.bezierCurveTo(d * 6, 3.4, d * 9, 2.4, d * 10.4, 5);
        for (let i = 0; i <= 12; i++) { const a = -Math.PI * 0.15 + i / 12 * Math.PI * 1.5, r = 3 - i * 0.16; ctx.lineTo(d * (8 + Math.cos(a) * r), 6.2 + Math.sin(a) * r); }
        line2(ctx, c.guard, 2);
      }
      rr(ctx, -3.2, 1.2, 6.4, 5.6, 1.6); fs(ctx, c.guard, 1.2);
      ctx.beginPath(); ctx.arc(0, 4, 1.3, 0, TAU); ctx.fillStyle = shade(c.guard, -0.35); ctx.fill();
    },
    // andělská křídla s pery
    wings(ctx, c) {
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(d * 2, 1.2); ctx.bezierCurveTo(d * 8, -0.6, d * 13, 1.6, d * 15, 10);
        ctx.quadraticCurveTo(d * 12.6, 7.2, d * 11.6, 8.6); ctx.quadraticCurveTo(d * 10, 5.6, d * 8.4, 7.6); ctx.quadraticCurveTo(d * 6.6, 4.8, d * 5, 6.8); ctx.quadraticCurveTo(d * 3.4, 5, d * 2, 6);
        ctx.closePath(); fs(ctx, c.guard, 1.2);
        ctx.strokeStyle = shade(c.guard, -0.3); ctx.lineWidth = 0.6; ctx.beginPath(); for (const [x, y] of [[11.6, 8.6], [8.4, 7.6], [5, 6.8]]) { ctx.moveTo(d * 3, 3); ctx.lineTo(d * x, y - 0.6); } ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 3.6, 2.6, 0, TAU); fs(ctx, shade(c.guard, 0.15), 1.1);
      if (c.gem || c.glow) gem(ctx, 0, 3.6, 1.4, gemCol(c));
    },
    // lebka se zkříženou kostí
    skull(ctx, c) {
      rr(ctx, -10, 2.6, 20, 2.6, 1.2); fs(ctx, BONE, 1.1);
      for (const d of [-1, 1]) for (const o of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 10.4, 3.9 + o * 1.3, 1.5, 0, TAU); fs(ctx, BONE, 0.9); }
      skull(ctx, 0, 4.6, 4.4, 1, c.glow, BONE);
    },
    // japonská tsuba: disk s výřezy
    tsuba(ctx, c) {
      ctx.beginPath(); ctx.ellipse(0, 3.6, 7, 2.7, 0, 0, TAU); fs(ctx, c.guard, 1.3);
      ctx.beginPath(); ctx.ellipse(0, 3.6, 5.6, 1.9, 0, 0, TAU); ctx.lineWidth = 0.6; ctx.strokeStyle = shade(c.guard, -0.35); ctx.stroke();
      ctx.fillStyle = OUT; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 3.8, 3.6, 1, 0.7, 0, 0, TAU); ctx.fill(); }
    },
    // košíková/rapírová: oblouk přes ruku, boční prstenec a krátké záštity
    ring(ctx, c, bw, gl) {
      ctx.beginPath(); ctx.moveTo(4, 4); ctx.bezierCurveTo(9, 2.4, 8, -gl + 1, 1.6, -gl - 0.6); line2(ctx, c.guard, 1.5);
      ctx.beginPath(); ctx.ellipse(-3.6, 7, 3, 2.2, 0.5, 0, TAU); line2(ctx, c.guard, 1.3);
      rr(ctx, -8, 2.4, 16, 2.6, 1.2); fs(ctx, c.guard, 1.1);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 8, 3.7, 1.6, 0, TAU); fs(ctx, c.guard, 0.9); }
      ctx.beginPath(); ctx.arc(0, 3.6, 1.8, 0, TAU); fs(ctx, shade(c.guard, 0.15), 1);
    },
    // netopýří křídla s blánami
    bat(ctx, c) {
      const col = shade(c.guard, -0.3);
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(d * 2, 5); ctx.quadraticCurveTo(d * 8, 7.4, d * 13.4, 9);
        ctx.quadraticCurveTo(d * 10.6, 5, d * 10.4, 1.4); ctx.quadraticCurveTo(d * 8, 3.6, d * 6.4, 1); ctx.quadraticCurveTo(d * 4.4, 3, d * 2, 0.8); ctx.closePath(); fs(ctx, col, 1.2);
        ctx.strokeStyle = shade(c.guard, 0.2); ctx.lineWidth = 0.6; ctx.beginPath(); for (const [x, y] of [[13.4, 9], [10.4, 1.4], [6.4, 1]]) { ctx.moveTo(d * 2.4, 4.6); ctx.lineTo(d * x, y); } ctx.stroke();
      }
      ctx.beginPath(); ctx.ellipse(0, 3.6, 2.6, 3.2, 0, 0, TAU); fs(ctx, col, 1.1);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 0.8, 6.4); ctx.lineTo(d * 2.2, 8.6); ctx.lineTo(d * 2, 5.6); ctx.closePath(); fs(ctx, col, 0.8); }
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 6); ctx.fillStyle = c.glow || '#ff3a3a'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 1, 4, 0.6, 0, TAU); ctx.fill(); } ctx.restore();
    },
    // dravčí pařáty svírající čepel
    claw(ctx, c) {
      const tal = shade(c.guard, -0.25);
      for (const d of [-1, 1]) for (let k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.moveTo(d * 2.2, 1.8 + k * 1.6); ctx.quadraticCurveTo(d * (7 + k * 1.4), 0.6 + k * 2, d * (6.4 + k * 1.2), 8.4 + k * 2.2);
        ctx.quadraticCurveTo(d * (5 + k), 4 + k * 1.6, d * 2.2, 4.2 + k * 1.6); ctx.closePath(); fs(ctx, tal, 0.9);
        ctx.beginPath(); ctx.arc(d * (6.4 + k * 1.2), 8 + k * 2.2, 0.55, 0, TAU); ctx.fillStyle = c.edge; ctx.fill();
      }
      ctx.beginPath(); ctx.ellipse(0, 3.4, 3.8, 3, 0, 0, TAU); fs(ctx, c.guard, 1.2);
      gem(ctx, 0, 3.4, 1.6, gemCol(c));
    },
    // měsíční srpek objímající kořen čepele
    crescent(ctx, c) {
      ctx.beginPath(); ctx.arc(0, 10, 10.4, Math.PI + 0.22, TAU - 0.22); ctx.arc(0, 11.8, 8.4, TAU - 0.3, Math.PI + 0.3, true); ctx.closePath(); fs(ctx, c.guard, 1.3);
      ctx.beginPath(); ctx.arc(0, 10, 9.4, Math.PI + 0.5, TAU - 0.5); ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke();
      gem(ctx, 0, 1.2, 1.5, gemCol(c));
    },
    // bez záštity: jen kovová objímka
    none(ctx, c, bw) { const w = Math.min(4.2, bw * 0.75 + 0.6); rr(ctx, -w, 1.6, w * 2, 4.6, 1.2); fs(ctx, c.dark, 1.1); },
    // ostnatá záštita
    spiked(ctx, c) {
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(d * 9, 2.2); ctx.lineTo(d * 15, 0.2); ctx.lineTo(d * 9, 5.6); ctx.closePath(); fs(ctx, c.dark, 1);
        ctx.beginPath(); ctx.moveTo(d * 4, 5); ctx.lineTo(d * 5.4, 10.4); ctx.lineTo(d * 6.6, 5); ctx.closePath(); fs(ctx, c.dark, 0.9);
        ctx.beginPath(); ctx.moveTo(d * 5, 2.4); ctx.lineTo(d * 6, -2.6); ctx.lineTo(d * 7, 2.4); ctx.closePath(); fs(ctx, c.dark, 0.9);
      }
      rr(ctx, -9.6, 2.2, 19.2, 3.4, 1); fs(ctx, c.guard, 1.3);
      ctx.fillStyle = shade(c.guard, -0.4); for (const x of [-6, 0, 6]) { ctx.beginPath(); ctx.arc(x, 3.9, 0.7, 0, TAU); ctx.fill(); }
    },
    // královská záštita do V s drahokamem
    royal(ctx, c) {
      ctx.beginPath(); ctx.moveTo(-11, -0.4); ctx.quadraticCurveTo(-5, 6, 0, 3.6); ctx.quadraticCurveTo(5, 6, 11, -0.4); ctx.lineTo(9.8, 3.2); ctx.quadraticCurveTo(4.6, 9, 0, 7.2); ctx.quadraticCurveTo(-4.6, 9, -9.8, 3.2); ctx.closePath(); fs(ctx, c.guard, 1.3);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 11, -0.4, 1.4, 0, TAU); fs(ctx, c.guard, 0.9); }
      gem(ctx, 0, 5, 2, gemCol(c));
    }
  };

  /* =====================================================================
     4) HLAVICE  (ctx, c, y = konec rukojeti, záporné y)
     ===================================================================== */
  const PM = {
    ball(ctx, c, y) { ctx.beginPath(); ctx.arc(0, y - 2.4, 2.9, 0, TAU); fs(ctx, c.pommel, 1.2); ctx.beginPath(); ctx.arc(-0.9, y - 3.2, 0.9, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); },
    gem(ctx, c, y) {
      ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(-2.4, y - 2.6); ctx.lineTo(2.4, y - 2.6); ctx.lineTo(3, y); ctx.closePath(); fs(ctx, c.pommel, 1.1);
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 8);
      ctx.beginPath(); ctx.moveTo(0, y - 8.4); ctx.lineTo(2.8, y - 4.6); ctx.lineTo(0, y - 1.8); ctx.lineTo(-2.8, y - 4.6); ctx.closePath(); fs(ctx, gemCol(c), 1.1); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-1.4, y - 4.6); ctx.lineTo(0, y - 7); ctx.lineTo(0.6, y - 4.6); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
    },
    ring(ctx, c, y) { rr(ctx, -2.2, y - 1.6, 4.4, 2.2, 0.8); fs(ctx, c.pommel, 1); ctx.beginPath(); ctx.arc(0, y - 4.8, 3, 0, TAU); line2(ctx, c.pommel, 1.6); },
    skull(ctx, c, y) { skull(ctx, 0, y - 3.6, 3.3, -1, c.glow, BONE); },
    spike(ctx, c, y) { rr(ctx, -2.6, y - 1.6, 5.2, 2.2, 0.8); fs(ctx, c.pommel, 1); ctx.beginPath(); ctx.moveTo(-2, y - 1.4); ctx.lineTo(0, y - 10); ctx.lineTo(2, y - 1.4); ctx.closePath(); fs(ctx, BF(ctx, c, -2, 2), 1.1); },
    fishtail(ctx, c, y) { ctx.beginPath(); ctx.moveTo(-1.7, y + 0.4); ctx.lineTo(-1.7, y - 1.6); ctx.quadraticCurveTo(-3.8, y - 3, -5.2, y - 6.6); ctx.quadraticCurveTo(-2, y - 4.6, 0, y - 5); ctx.quadraticCurveTo(2, y - 4.6, 5.2, y - 6.6); ctx.quadraticCurveTo(3.8, y - 3, 1.7, y - 1.6); ctx.lineTo(1.7, y + 0.4); ctx.closePath(); fs(ctx, c.pommel, 1.1); },
    crown(ctx, c, y) { ctx.save(); ctx.translate(0, y); ctx.scale(1.3, 1.3); ctx.translate(0, -y); PM._crown(ctx, c, y); ctx.restore(); },
    _crown(ctx, c, y) {
      rr(ctx, -3.2, y - 2.6, 6.4, 2.6, 0.6); fs(ctx, c.pommel, 1);
      ctx.beginPath(); ctx.moveTo(-3.2, y - 2.4); ctx.lineTo(-3.8, y - 6.6); ctx.lineTo(-1.6, y - 4.2); ctx.lineTo(0, y - 7.8); ctx.lineTo(1.6, y - 4.2); ctx.lineTo(3.8, y - 6.6); ctx.lineTo(3.2, y - 2.4); ctx.closePath(); fs(ctx, c.pommel, 1.1);
      ctx.fillStyle = gemCol(c); for (const [x, yy] of [[-3.8, -6.6], [0, -7.8], [3.8, -6.6]]) { ctx.beginPath(); ctx.arc(x, y + yy, 0.75, 0, TAU); ctx.fill(); }
    },
    eye(ctx, c, y) {
      ctx.beginPath(); ctx.moveTo(-3.8, y - 3.4); ctx.quadraticCurveTo(0, y - 8, 3.8, y - 3.4); ctx.quadraticCurveTo(0, y + 1.2, -3.8, y - 3.4); ctx.closePath(); fs(ctx, c.pommel, 1.1);
      ctx.beginPath(); ctx.ellipse(0, y - 3.4, 2.6, 1.6, 0, 0, TAU); ctx.fillStyle = '#fff6e8'; ctx.fill();
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 7); ctx.beginPath(); ctx.arc(0, y - 3.4, 1.3, 0, TAU); ctx.fillStyle = gemCol(c); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, y - 3.4, 0.35, 1.1, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
    },
    disc(ctx, c, y) { ctx.beginPath(); ctx.ellipse(0, y - 2.4, 4.4, 2.4, 0, 0, TAU); fs(ctx, c.pommel, 1.2); ctx.beginPath(); ctx.moveTo(-4, y - 2.4); ctx.lineTo(4, y - 2.4); ctx.lineWidth = 0.6; ctx.strokeStyle = shade(c.pommel, -0.35); ctx.stroke(); ctx.beginPath(); ctx.arc(0, y - 2.4, 0.9, 0, TAU); ctx.fillStyle = gemCol(c); ctx.fill(); },
    lobed(ctx, c, y) { rr(ctx, -3.8, y - 1.8, 7.6, 2, 0.6); fs(ctx, c.pommel, 1); for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(k * 1.55, y - 3.4 + Math.abs(k) * 0.5, 1.45, 0, TAU); fs(ctx, c.pommel, 0.9); } }
  };

  /* =====================================================================
     5) OZDOBY  { back?(ctx,c,S), front?(ctx,c,S) }   S = tvar čepele/hlavy
        S = { path(ctx), mid(y), y0, y1, w, head }
     ===================================================================== */
  const clipTo = (ctx, S) => { ctx.beginPath(); S.path(ctx); ctx.clip(); };
  const along = (S, n) => { const a = []; for (let k = 0; k < n; k++) { const y = S.y0 + (S.y1 - S.y0) * (n === 1 ? 0.5 : k / (n - 1)); a.push([S.mid(y), y]); } return a; };
  const DE = {
    // runy po délce čepele (bez záře jen vyryté)
    runes: { front(ctx, c, S) {
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 7); ctx.strokeStyle = c.glow || shade(c.dark, -0.55); ctx.lineWidth = c.glow ? 0.95 : 1.15; ctx.lineCap = 'round';
      along(S, S.head ? 2 : 4).forEach(([x, y], k) => glyph(ctx, x, y, k * 3 + 2, S.head ? 2.4 : 2));
      ctx.restore(); } },
    // vsazené drahokamy ve zlatých lůžkách
    gems: { front(ctx, c, S) {
      const col = gemCol(c);
      along(S, S.head ? 1 : 3).forEach(([x, y], k) => { const r = (S.head ? 3.6 : 3) - k * 0.3; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr2 = i % 2 ? r * 0.82 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); fs(ctx, c.guard, 0.9); ctx.save(); if (c.glow) glowS(ctx, c.glow, 6); gem(ctx, x, y, r * 0.62, col); ctx.restore(); });
    } },
    // řetěz omotaný kolem kořene čepele / topůrka
    chain: { front(ctx, c, S) {
      const link = (x, y, a, flat) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 1.9, flat ? 0.75 : 1.25, 0, 0, TAU); fs(ctx, flat ? shade(c.dark, -0.1) : shade(c.dark, 0.3), 0.7); if (!flat) { ctx.beginPath(); ctx.ellipse(0, 0, 0.9, 0.4, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill(); } ctx.restore(); };
      if (S.head) { for (let k = 0; k < 4; k++) link((k % 2 ? 0.6 : -0.6), S.y0 - 3 - k * 2.6, Math.PI / 2 + (k % 2 ? 0.5 : -0.5), k % 2); for (let k = 0; k < 4; k++) link(-3 - k * 0.6, S.y0 - 6 - k * 3, Math.PI / 2 - 0.2, k % 2); return; }
      const w = S.w + 1.2;
      for (const yb of [S.y0 + 1, S.y0 + 9]) { const x0 = S.mid(yb) - w, n = 5; for (let k = 0; k < n; k++) { const u = k / (n - 1); link(x0 + u * w * 2, yb + u * 5, 0.45, k % 2); } }
    } },
    // plameny olizující ostří (vzadu velké, vepředu jiskry)
    flames: {
      back(ctx, c, S) {
        const t = now(), col = c.glow || '#ff7a2a';
        ctx.save(); if (c.glow) glowS(ctx, c.glow, 12);
        along(S, S.head ? 3 : 5).forEach(([x, y], k) => { for (const d of [-1, 1]) {
          const fl = 1 + 0.25 * Math.sin(t * 9 + k * 1.7 + d * 2), bx = x + d * S.w * 0.5;
          ctx.beginPath(); ctx.moveTo(bx, y - 3); ctx.quadraticCurveTo(bx + d * (S.w * 0.6 + 5 * fl), y, bx + d * (S.w * 0.5 + 2.6 * fl), y + 8 * fl); ctx.quadraticCurveTo(bx + d * 1.4, y + 3, bx, y + 3); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
          ctx.beginPath(); ctx.moveTo(bx, y - 1.6); ctx.quadraticCurveTo(bx + d * (S.w * 0.55 + 2.4 * fl), y + 0.6, bx + d * (S.w * 0.5 + 1.2 * fl), y + 5 * fl); ctx.quadraticCurveTo(bx + d * 0.8, y + 2.4, bx, y + 2.4); ctx.closePath(); ctx.fillStyle = '#ffe07a'; ctx.fill();
        } });
        ctx.restore();
      },
      front(ctx, c, S) { ctx.save(); clipTo(ctx, S); const g = ctx.createLinearGradient(0, S.y0 - 4, 0, S.y1 + 6); const fc = c.glow || '#ff8a28'; g.addColorStop(0, hexA(fc, 0.55)); g.addColorStop(1, hexA(fc, 0)); ctx.fillStyle = g; ctx.fillRect(-30, S.y0 - 6, 60, S.y1 - S.y0 + 14); ctx.restore(); }
    },
    // mráz: ledové krystaly na hranách a praskliny
    frost: {
      back(ctx, c, S) {
        const r = rnd(7), ice = c.glow ? shade(c.glow, 0.6) : '#dff4ff';
        ctx.save(); if (c.glow) glowS(ctx, c.glow, 6);
        along(S, S.head ? 4 : 6).forEach(([x, y], k) => { const d = k % 2 ? 1 : -1, bx = x + d * S.w * 0.6, h = 3.4 + r() * 3.4;
          ctx.beginPath(); ctx.moveTo(bx, y - 2.2); ctx.lineTo(bx + d * (S.w * 0.4 + h), y + 2 + r() * 2.4); ctx.lineTo(bx, y + 2.2); ctx.closePath();
          ctx.fillStyle = ice; ctx.fill(); ctx.lineWidth = 0.6; ctx.strokeStyle = shade(c.dark, -0.3); ctx.stroke(); });
        ctx.restore();
      },
      front(ctx, c, S) {
        ctx.save(); clipTo(ctx, S);
        const g = ctx.createLinearGradient(0, S.y0 - 4, 0, S.y1 + 8); g.addColorStop(0, 'rgba(220,245,255,.55)'); g.addColorStop(1, 'rgba(220,245,255,0.08)'); ctx.fillStyle = g; ctx.fillRect(-30, S.y0 - 8, 60, S.y1 - S.y0 + 20);
        const r = rnd(11); if (c.glow) glowS(ctx, c.glow, 5); ctx.strokeStyle = c.glow ? shade(c.glow, 0.5) : '#ffffff'; ctx.lineWidth = 0.6;
        ctx.beginPath(); along(S, S.head ? 3 : 5).forEach(([x, y]) => { let px = x + (r() - 0.5) * S.w, py = y; ctx.moveTo(px, py); for (let i = 0; i < 3; i++) { px += (r() - 0.5) * S.w * 1.2; py += 1.4 + r() * 2.6; ctx.lineTo(px, py); } }); ctx.stroke();
        ctx.restore();
      }
    },
    // popínavé úponky s lístky a květem
    vines: { front(ctx, c, S) {
      const pts = []; for (let y = S.y0 - 2; y <= S.y1; y += 1.2) pts.push([S.mid(y) + Math.sin((y - S.y0) * 0.42) * S.w * 0.8, y]);
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); line2(ctx, '#3f8a3a', 1.1);
      for (let i = 4; i < pts.length; i += 5) { const [x, y] = pts[i], d = (i / 5) % 2 ? 1 : -1; ctx.beginPath(); ctx.ellipse(x + d * 1.8, y + 0.6, 2, 1, d * 0.6, 0, TAU); fs(ctx, '#6cc04a', 0.6); }
      const e = pts[pts.length - 1]; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; ctx.beginPath(); ctx.arc(e[0] + Math.cos(a) * 1.3, e[1] + Math.sin(a) * 1.3, 1.1, 0, TAU); ctx.fillStyle = c.gem || '#ff8ac0'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(e[0], e[1], 0.8, 0, TAU); ctx.fillStyle = '#ffe07a'; ctx.fill();
    } },
    // nýtovaný pás u kořene a nýty po hřbetu
    rivets: { front(ctx, c, S) {
      ctx.save(); clipTo(ctx, S); const m = S.mid(S.y0); rr(ctx, m - 12, S.y0 - 1, 24, 4.4, 0.6); fs(ctx, c.dark, 1); ctx.restore();
      const dot = (x, y) => { ctx.beginPath(); ctx.arc(x, y, 0.85, 0, TAU); fs(ctx, c.guard, 0.5); };
      for (const d of [-1, 1]) dot(S.mid(S.y0) + d * S.w * 0.5, S.y0 + 1.2);
      along(S, S.head ? 3 : 5).slice(1).forEach(([x, y]) => dot(x, y));
    } },
    // zářící žlábek (bez záře: hluboký tmavý žlábek se světlou linkou)
    fuller: { front(ctx, c, S) {
      ctx.beginPath(); for (let y = S.y0; y <= S.y1; y += 1.5) { const x = S.mid(y); y === S.y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.lineCap = 'round'; ctx.lineWidth = 2.8; ctx.strokeStyle = shade(c.dark, -0.5); ctx.stroke();
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 10); ctx.lineWidth = 1.1; ctx.strokeStyle = c.glow || c.edge; ctx.stroke(); ctx.restore();
    } },
    // rytý filigrán: zlaté spirály
    filigree: { front(ctx, c, S) {
      ctx.save(); clipTo(ctx, S); ctx.strokeStyle = c.guard; ctx.lineWidth = 0.6; ctx.lineCap = 'round';
      along(S, S.head ? 2 : 4).forEach(([x, y], k) => { for (const d of [-1, 1]) {
        const w = Math.min(S.w * 0.7, 3.4); ctx.beginPath(); ctx.moveTo(x, y - 2.4); ctx.bezierCurveTo(x + d * w, y - 2, x + d * w, y + 1.4, x + d * w * 0.4, y + 1);
        ctx.arc(x + d * w * 0.55, y, 0.9, Math.PI * 0.5, d > 0 ? Math.PI * 2 : -Math.PI, d < 0); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y + 2.6, 0.55, 0, TAU); ctx.fillStyle = c.guard; ctx.fill(); });
      ctx.restore();
    } },
    // hvězdná obloha vsazená do čepele
    starfield: { front(ctx, c, S) {
      ctx.save(); clipTo(ctx, S); ctx.beginPath(); for (let y = S.y0 - 1; y <= S.y1 + 3; y += 1.5) { const x = S.mid(y); y === S.y0 - 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.lineCap = 'round'; ctx.lineWidth = S.w * 1.15; ctx.strokeStyle = '#1a1c3a'; ctx.stroke();
      const r = rnd(5); if (c.glow) glowS(ctx, c.glow, 5); ctx.fillStyle = '#fff6c4';
      along(S, S.head ? 4 : 8).forEach(([x, y], k) => { const xx = x + (r() - 0.5) * S.w * 0.8; if (k % 3 === 0) { star(ctx, xx, y, 1.6, 0.5, 4, 0); ctx.fill(); } else { ctx.beginPath(); ctx.arc(xx, y, 0.55, 0, TAU); ctx.fill(); } });
      ctx.restore();
    } },
    // blesk po délce čepele
    lightning: { front(ctx, c, S) {
      const col = c.glow || '#fff36a', r = rnd(3);
      ctx.save(); if (S.head) clipTo(ctx, S); glowS(ctx, col, c.glow ? 10 : 4); ctx.strokeStyle = col; ctx.lineWidth = 1.1; ctx.lineJoin = 'miter';
      ctx.beginPath(); let first = true; for (let y = S.y0 - 2; y <= S.y1 + 2; y += 3.2) { const x = S.mid(y) + (r() - 0.5) * S.w * 1.1; first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; } ctx.stroke();
      ctx.lineWidth = 0.6; ctx.beginPath(); const y1 = S.y0 + (S.y1 - S.y0) * 0.4, x1 = S.mid(y1); ctx.moveTo(x1, y1); ctx.lineTo(x1 + S.w * 0.9, y1 + 3); ctx.lineTo(x1 + S.w * 0.5, y1 + 6); ctx.stroke();
      ctx.restore();
    } },
    // magma: ztmavlá čepel se žhnoucími prasklinami
    magma: { front(ctx, c, S) {
      ctx.save(); clipTo(ctx, S); ctx.fillStyle = 'rgba(30,8,4,.6)'; ctx.fillRect(-30, -10, 60, 80);
      const col = c.glow || '#ff7a2a', r = rnd(19); glowS(ctx, col, 8); ctx.strokeStyle = col; ctx.lineWidth = 0.9; ctx.lineJoin = 'round';
      ctx.beginPath(); for (let y = S.y0 - 4; y <= S.y1 + 6; y += 2.6) { const x = S.mid(y) + (r() - 0.5) * S.w * 0.9; y === S.y0 - 4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
      ctx.beginPath(); along(S, S.head ? 3 : 5).forEach(([x, y]) => { const d = r() > 0.5 ? 1 : -1; ctx.moveTo(x, y); ctx.lineTo(x + d * S.w * 0.6, y + 1.6); ctx.lineTo(x + d * S.w * 1.2, y + 1); }); ctx.lineWidth = 0.6; ctx.stroke();
      ctx.strokeStyle = '#ffe07a'; ctx.lineWidth = 0.35; ctx.stroke();
      ctx.restore();
    } }
  };

  /* =====================================================================
     SKLÁDÁNÍ ZBRANÍ NA BLÍZKO
     ===================================================================== */
  function grip(ctx, c, gl, style) {
    rr(ctx, -1.9, -gl, 3.8, gl + 2.4, 1.2); fs(ctx, c.grip, 1.2);
    if (style === 'ito') { ctx.fillStyle = shade(c.grip, 0.5); for (let y = -gl + 1; y < 1; y += 2.6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1.6, y + 1.3); ctx.lineTo(0, y + 2.6); ctx.lineTo(-1.6, y + 1.3); ctx.closePath(); ctx.fill(); } }
    else { ctx.strokeStyle = shade(c.grip, 0.35); ctx.lineWidth = 0.7; for (let y = -gl + 1; y < 2; y += 2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1.2); ctx.stroke(); } }
  }
  function haft(ctx, c, gl, top) {
    rr(ctx, -1.8, -gl, 3.6, gl + top, 1.4); fs(ctx, c.wood, 1.4);
    ctx.strokeStyle = shade(c.wood, -0.3); ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0.6, 4); ctx.lineTo(0.4, top - 6); ctx.stroke();
    rr(ctx, -2.1, -gl + 1, 4.2, 11, 1.2); fs(ctx, c.grip, 1.1);
    ctx.strokeStyle = shade(c.grip, 0.35); ctx.lineWidth = 0.7; for (let y = -gl + 2; y < -gl + 12; y += 2.2) { ctx.beginPath(); ctx.moveTo(-2, y); ctx.lineTo(2, y + 1); ctx.stroke(); }
  }
  const decoList = d => [].concat(d || []).map(k => DE[k]).filter(Boolean);
  function composeBlade(def) {
    const b = BL[def.blade] || BL.broad, g = GU[def.guard] || (def.guard === null ? null : GU.cross), p = PM[def.pommel] || (def.pommel === null ? null : PM.ball);
    const decos = decoList(def.deco), gl = def.grip === 'long' ? b.grip + 6 : (typeof def.grip === 'number' ? def.grip : b.grip);
    const bw = Math.max(Math.abs(b.bx[0]), Math.abs(b.bx[1]));
    const S = { path: b.path, mid: b.mid, y0: b.y0, y1: b.y1, w: b.w, head: false };
    return (ctx, c) => {
      grip(ctx, c, gl, def.wrap || b.wrap);
      if (p) p(ctx, c, -gl);
      for (const d of decos) if (d.back) d.back(ctx, c, S);
      GO(ctx, c, 12);
      if (b.alpha) ctx.globalAlpha = b.alpha;
      ctx.beginPath(); b.path(ctx); fs(ctx, BF(ctx, c, b.bx[0], b.bx[1]), 1.6);
      ctx.globalAlpha = 1; GF(ctx);
      if (b.detail) b.detail(ctx, c);
      for (const d of decos) if (d.front) d.front(ctx, c, S);
      if (g) g(ctx, c, bw, gl);
    };
  }
  function composeHead(def) {
    const h = HD[def.head] || HD.beard, p = PM[def.pommel] || null, decos = decoList(def.deco), gl = typeof def.grip === 'number' ? def.grip : 10;
    return (ctx, c) => {
      const s = M.AXE_SIDE || -1;
      const S = { path: ctx2 => h.path(ctx2, s), mid: () => h.cx(s), y0: h.y0, y1: h.y1, w: h.w, head: true };
      haft(ctx, c, gl, h.top);
      if (p) p(ctx, c, -gl); else { rr(ctx, -2.4, -gl - 2, 4.8, 2.6, 1); fs(ctx, c.dark, 1); }
      for (const d of decos) if (d.back) d.back(ctx, c, S);
      if (h.back) h.back(ctx, c, s);
      GO(ctx, c, 12);
      const bx = h.bx(s);
      ctx.beginPath(); h.path(ctx, s); fs(ctx, BF(ctx, c, Math.min(bx[0], bx[1]), Math.max(bx[0], bx[1])), 1.6);
      GF(ctx);
      if (h.detail) h.detail(ctx, c, s);
      for (const d of decos) if (d.front) d.front(ctx, c, S);
    };
  }

  /* =====================================================================
     6) HROTY KOPÍ  (ctx, c)  – x 44…82, y ±16
     ===================================================================== */
  const socket = (ctx, c, x, w) => { rr(ctx, x, -2.8, w || 5, 5.6, 1); fs(ctx, c.guard, 1); };
  const PH = {
    leaf(ctx, c) { GO(ctx, c); ctx.beginPath(); ctx.moveTo(46, -1.8); ctx.bezierCurveTo(52, -8, 64, -6.6, 79, 0); ctx.bezierCurveTo(64, 6.6, 52, 8, 46, 1.8); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 79), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(75, 0); ctx.lineWidth = 1; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(50, -2.6); ctx.bezierCurveTo(56, -5.6, 64, -5, 74, -0.8); ctx.lineWidth = 0.6; ctx.strokeStyle = c.edge; ctx.stroke(); socket(ctx, c, 42); },
    partisan(ctx, c) { GO(ctx, c);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(47, d * 2.6); ctx.quadraticCurveTo(48, d * 12, 57, d * 15); ctx.quadraticCurveTo(52, d * 8, 54, d * 3); ctx.closePath(); fs(ctx, BF(ctx, c, 47, 57), 1.3); }
      ctx.beginPath(); ctx.moveTo(45, -4.4); ctx.lineTo(80, 0); ctx.lineTo(45, 4.4); ctx.closePath(); fs(ctx, BF(ctx, c, 45, 80), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(76, 0); ctx.lineWidth = 0.9; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke(); socket(ctx, c, 41); if (c.gem) gem(ctx, 48.6, 0, 1.6, c.gem); },
    winged(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(48, -2.6); ctx.quadraticCurveTo(62, -6.4, 79, 0); ctx.quadraticCurveTo(62, 6.4, 48, 2.6); ctx.closePath(); fs(ctx, BF(ctx, c, 48, 79), 1.4);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(43, d * 2); ctx.lineTo(44, d * 12); ctx.quadraticCurveTo(47, d * 9, 49, d * 12.6); ctx.lineTo(48.6, d * 2); ctx.closePath(); fs(ctx, BF(ctx, c, 43, 49), 1.2); }
      GF(ctx); ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(75, 0); ctx.lineWidth = 0.8; ctx.strokeStyle = c.dark; ctx.stroke(); socket(ctx, c, 38, 5); },
    halberd(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(48, -1.8); ctx.lineTo(81, 0); ctx.lineTo(48, 1.8); ctx.closePath(); fs(ctx, BF(ctx, c, 48, 81), 1.3);
      ctx.beginPath(); ctx.moveTo(46, 1.6); ctx.lineTo(48, 15); ctx.quadraticCurveTo(56, 17.4, 62, 14); ctx.quadraticCurveTo(57, 8, 58, 1.6); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 62), 1.5);
      ctx.beginPath(); ctx.moveTo(49, -1.6); ctx.quadraticCurveTo(48, -9, 43, -13); ctx.quadraticCurveTo(52, -10, 54, -1.6); ctx.closePath(); fs(ctx, c.dark, 1.2); GF(ctx);
      ctx.beginPath(); ctx.moveTo(48.6, 14.6); ctx.quadraticCurveTo(56, 16.6, 61.4, 13.6); ctx.lineWidth = 1; ctx.strokeStyle = c.edge; ctx.stroke(); socket(ctx, c, 42, 6); },
    glaive(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(45, -3); ctx.lineTo(55, -3.4); ctx.lineTo(57, -8.4); ctx.lineTo(60, -3.6); ctx.lineTo(72, -4.4); ctx.lineTo(82, -8.4); ctx.quadraticCurveTo(78, 4.4, 62, 5.4); ctx.quadraticCurveTo(52, 5.4, 45, 3.4); ctx.closePath(); fs(ctx, BF(ctx, c, 45, 82), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(48, 3.6); ctx.quadraticCurveTo(62, 4.4, 72, 1); ctx.quadraticCurveTo(77, -2, 80, -7); ctx.lineWidth = 0.9; ctx.strokeStyle = c.edge; ctx.stroke(); ctx.beginPath(); ctx.ellipse(44, 0, 2.4, 5.2, 0, 0, TAU); fs(ctx, c.guard, 1.2); },
    bardiche(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(30, -2); ctx.quadraticCurveTo(26, -10, 34, -16.4); ctx.quadraticCurveTo(56, -17, 68, -12); ctx.quadraticCurveTo(76, -6, 78, 0); ctx.lineTo(62, -2); ctx.lineTo(44, -2); ctx.closePath(); fs(ctx, BF(ctx, c, 30, 78), 1.6); GF(ctx);
      ctx.beginPath(); ctx.moveTo(34, -15); ctx.quadraticCurveTo(56, -15.6, 67, -10.6); ctx.quadraticCurveTo(74, -5.6, 76, -1.4); ctx.lineWidth = 1.1; ctx.strokeStyle = c.edge; ctx.stroke();
      for (const x of [33, 48]) { rr(ctx, x, -3, 3, 6, 1); fs(ctx, c.guard, 1); } },
    trident(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(46, -9); ctx.quadraticCurveTo(52, -11, 60, -10.4); ctx.lineTo(60, -7.4); ctx.quadraticCurveTo(52, -7.4, 50, -1.8); ctx.lineTo(50, 1.8); ctx.quadraticCurveTo(52, 7.4, 60, 7.4); ctx.lineTo(60, 10.4); ctx.quadraticCurveTo(52, 11, 46, 9); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 60), 1.3);
      for (const [y, L] of [[-8.9, 70], [0, 80], [8.9, 70]]) { ctx.beginPath(); ctx.moveTo(y ? 59 : 49, y - 1.5); ctx.lineTo(L, y); ctx.lineTo(y ? 59 : 49, y + 1.5); ctx.closePath(); fs(ctx, BF(ctx, c, 49, L), 1.2); ctx.beginPath(); ctx.moveTo(L - 7, y - (y > 0 ? -1 : 1) * 1.2); ctx.lineTo(L - 10, y - (y > 0 ? -1 : 1) * 4.4); ctx.lineTo(L - 5, y); ctx.closePath(); fs(ctx, c.blade, 0.9); }
      GF(ctx); socket(ctx, c, 41, 6); },
    fork(ctx, c) { GO(ctx, c);
      rr(ctx, 46, -6, 5, 12, 1.4); fs(ctx, BF(ctx, c, 46, 51), 1.3);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(50, d * 5.6); ctx.lineTo(79, d * 4.6); ctx.lineTo(81, d * 3.6); ctx.lineTo(79, d * 2.8); ctx.lineTo(50, d * 2.6); ctx.closePath(); fs(ctx, BF(ctx, c, 50, 81), 1.2); ctx.beginPath(); ctx.moveTo(56, d * 5.4); ctx.quadraticCurveTo(58, d * 11, 54, d * 13); ctx.quadraticCurveTo(60, d * 10, 60, d * 5.2); ctx.closePath(); fs(ctx, BF(ctx, c, 54, 60), 1); }
      GF(ctx); socket(ctx, c, 41); },
    naginata(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(46, -2.6); ctx.quadraticCurveTo(66, -3, 81, -14); ctx.quadraticCurveTo(80, -2, 68, 3.4); ctx.quadraticCurveTo(57, 4.4, 46, 3); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 81), 1.5); GF(ctx);
      ctx.beginPath(); for (let x = 48; x <= 76; x += 1.5) { const y = 1.2 - Math.pow((x - 46) / 35, 2) * 9 + Math.sin(x * 0.9) * 0.5; x === 48 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      rr(ctx, 43, -3.2, 3.6, 6.4, 0.8); fs(ctx, c.guard, 1); rr(ctx, 36, -3, 7, 6, 1); fs(ctx, '#1a1a1a', 1); },
    lance(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(47, -5.4); ctx.lineTo(83, 0); ctx.lineTo(47, 5.4); ctx.closePath(); fs(ctx, BF(ctx, c, 47, 83), 1.5); GF(ctx);
      ctx.save(); ctx.beginPath(); ctx.moveTo(47, -5.4); ctx.lineTo(83, 0); ctx.lineTo(47, 5.4); ctx.closePath(); ctx.clip(); ctx.strokeStyle = c.guard; ctx.lineWidth = 2; for (let x = 44; x < 84; x += 7) { ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x + 5, 6); ctx.stroke(); } ctx.restore();
      ctx.beginPath(); ctx.ellipse(46, 0, 2.6, 10.4, 0, 0, TAU); fs(ctx, BF(ctx, c, 43, 49), 1.4); ctx.beginPath(); ctx.ellipse(46, 0, 1, 7, 0, 0, TAU); ctx.fillStyle = shade(c.dark, -0.2); ctx.fill(); },
    scythe(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(47, -2.4); ctx.bezierCurveTo(48, -17, 66, -23, 83, -15); ctx.bezierCurveTo(68, -17, 57, -12, 53, -2.4); ctx.closePath(); fs(ctx, BF(ctx, c, 47, 83), 1.5);
      ctx.beginPath(); ctx.moveTo(49, -1.6); ctx.lineTo(60, 0); ctx.lineTo(49, 1.6); ctx.closePath(); fs(ctx, BF(ctx, c, 49, 60), 1.1); GF(ctx);
      ctx.beginPath(); ctx.moveTo(52.6, -4); ctx.bezierCurveTo(56, -12.6, 67, -16.6, 80, -15); ctx.lineWidth = 1; ctx.strokeStyle = c.edge; ctx.stroke(); rr(ctx, 43, -3.6, 7, 7.2, 1.2); fs(ctx, c.guard, 1.1); },
    hook(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(46, -3); ctx.lineTo(72, -2.6); ctx.quadraticCurveTo(83, 0, 79, 10.6); ctx.quadraticCurveTo(76.6, 14.4, 70.6, 12.6); ctx.quadraticCurveTo(75, 8.4, 72.4, 4.2); ctx.lineTo(46, 3.4); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 82), 1.5);
      ctx.beginPath(); ctx.moveTo(53, -2.6); ctx.lineTo(55, -11); ctx.lineTo(59, -2.6); ctx.closePath(); fs(ctx, c.dark, 1.1); GF(ctx);
      ctx.beginPath(); ctx.moveTo(48, -2); ctx.lineTo(72, -1.6); ctx.quadraticCurveTo(81, 0.6, 78, 9.4); ctx.lineWidth = 0.8; ctx.strokeStyle = c.edge; ctx.stroke(); socket(ctx, c, 41); },
    moon(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(82, -14.4); ctx.bezierCurveTo(61, -16.6, 51, -8.4, 51, 0); ctx.bezierCurveTo(51, 8.4, 61, 16.6, 82, 14.4); ctx.bezierCurveTo(67, 10.4, 61, 6, 61, 0); ctx.bezierCurveTo(61, -6, 67, -10.4, 82, -14.4); ctx.closePath(); fs(ctx, BF(ctx, c, 51, 82), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(80, -14.2); ctx.bezierCurveTo(61, -15.6, 52.4, -8, 52.4, 0); ctx.bezierCurveTo(52.4, 8, 61, 15.6, 80, 14.2); ctx.lineWidth = 0.9; ctx.strokeStyle = c.edge; ctx.stroke();
      rr(ctx, 44, -2.2, 8, 4.4, 1); fs(ctx, c.dark, 1); gem(ctx, 56, 0, 1.8, gemCol(c)); socket(ctx, c, 40); },
    drill(ctx, c) { GO(ctx, c);
      const P = () => { ctx.beginPath(); ctx.moveTo(46, -6.4); ctx.lineTo(81, 0); ctx.lineTo(46, 6.4); ctx.closePath(); };
      P(); fs(ctx, BF(ctx, c, 46, 81), 1.5); GF(ctx);
      ctx.save(); P(); ctx.clip(); for (let x = 42; x < 82; x += 5) { ctx.beginPath(); ctx.moveTo(x, -7); ctx.quadraticCurveTo(x + 4, 0, x + 1, 7); ctx.lineWidth = 1.6; ctx.strokeStyle = shade(c.dark, -0.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 1.4, -7); ctx.quadraticCurveTo(x + 5.4, 0, x + 2.4, 7); ctx.lineWidth = 0.6; ctx.strokeStyle = c.edge; ctx.stroke(); } ctx.restore();
      P(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke(); rr(ctx, 41, -4, 6, 8, 1.4); fs(ctx, c.guard, 1.1); },
    crystal(ctx, c) {
      ctx.save(); GO(ctx, c, 14); ctx.globalAlpha = 0.92;
      for (const [y, L, a] of [[-5, 62, -0.35], [5, 62, 0.35]]) { ctx.save(); ctx.translate(48, y * 0.3); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(L - 52, 0); ctx.lineTo(0, 2); ctx.closePath(); fs(ctx, BF(ctx, c, 0, L - 52), 1); ctx.restore(); }
      ctx.beginPath(); ctx.moveTo(46, -3); ctx.lineTo(52, -5.6); ctx.lineTo(70, -3); ctx.lineTo(82, 0); ctx.lineTo(70, 3); ctx.lineTo(52, 5.6); ctx.lineTo(46, 3); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 82), 1.4);
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(52, -5.6); ctx.lineTo(56, 0); ctx.lineTo(52, 5.6); ctx.moveTo(56, 0); ctx.lineTo(80, 0); ctx.moveTo(70, -3); ctx.lineTo(66, 0); ctx.lineTo(70, 3); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(43, d * 2); ctx.quadraticCurveTo(46, d * 6, 50, d * 4); ctx.lineWidth = 1.6; ctx.strokeStyle = c.guard; ctx.stroke(); } socket(ctx, c, 40); },
    wavy(ctx, c) { GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(46, -3.4); for (let x = 48; x <= 72; x += 2) ctx.lineTo(x, -3.6 - Math.sin((x - 46) * 0.5) * 1.8 * (1 - (x - 46) / 40)); ctx.lineTo(82, 0);
      for (let x = 72; x >= 48; x -= 2) ctx.lineTo(x, 3.6 - Math.sin((x - 46) * 0.5) * 1.8 * (1 - (x - 46) / 40)); ctx.lineTo(46, 3.4); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 82), 1.5); GF(ctx);
      ctx.beginPath(); for (let x = 48; x <= 78; x += 2) { const y = -Math.sin((x - 46) * 0.5) * 1.8 * (1 - (x - 46) / 40); x === 48 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 1; ctx.strokeStyle = c.glow || shade(c.dark, -0.2); ctx.stroke(); socket(ctx, c, 41); }
  };

  /* ---------------- OBJÍMKY / STRAPCE / PRAPORKY (x 28…46) ---------------- */
  const CO = {
    ring(ctx, c) { for (const x of [36, 40.4]) { rr(ctx, x, -2.9, 2.8, 5.8, 0.8); fs(ctx, c.guard, 1); } },
    tassel(ctx, c) {
      const sw = Math.sin(now() * 3) * 1.6, col = c.gem || '#c8262a';
      ctx.beginPath(); ctx.moveTo(41, 2); ctx.quadraticCurveTo(39, 7, 37 + sw * 0.4, 9); line2(ctx, shade(col, -0.2), 0.9);
      ctx.beginPath(); ctx.moveTo(35.4 + sw * 0.4, 9); ctx.lineTo(38.6 + sw * 0.4, 9); ctx.lineTo(40 + sw, 17); ctx.quadraticCurveTo(37 + sw, 18.4, 33.4 + sw, 17); ctx.closePath(); fs(ctx, col, 1);
      ctx.strokeStyle = shade(col, -0.35); ctx.lineWidth = 0.5; ctx.beginPath(); for (const o of [-1.4, 0, 1.4]) { ctx.moveTo(37 + sw * 0.4 + o * 0.4, 10.4); ctx.lineTo(36.8 + sw + o, 16.6); } ctx.stroke();
      rr(ctx, 35, 8.4, 4, 2, 0.8); fs(ctx, c.guard, 0.8); rr(ctx, 40, -2.9, 3, 5.8, 0.8); fs(ctx, c.guard, 1);
    },
    banner(ctx, c) {
      const t = now(), col = c.gem || c.guard;
      const wv = k => Math.sin(t * 4 + k) * 0.9;
      ctx.beginPath(); ctx.moveTo(26, -2.4); ctx.lineTo(43, -2.4); ctx.lineTo(43, -16 + wv(0)); ctx.lineTo(34.5, -11 + wv(2)); ctx.lineTo(26, -16 + wv(3)); ctx.closePath();
      fs(ctx, col, 1.2);
      ctx.beginPath(); ctx.moveTo(26, -4.4); ctx.lineTo(43, -4.4); ctx.lineWidth = 1.4; ctx.strokeStyle = shade(col, -0.35); ctx.stroke();
      star(ctx, 34.5, -8.4, 3, 1.2, 4, 0); fs(ctx, c.guard, 0.7);
      for (const x of [26.4, 42.6]) { rr(ctx, x - 1.3, -3, 2.6, 6, 0.6); fs(ctx, c.guard, 0.9); }
    },
    feathers(ctx, c) {
      const sw = Math.sin(now() * 2.6) * 0.12;
      for (const [k, col] of [[0, '#f4f2ea'], [1, c.gem || '#c8262a'], [2, '#2a2a30']]) { ctx.save(); ctx.translate(41, 2.4); ctx.rotate(0.3 + k * 0.42 + sw); ctx.beginPath(); ctx.ellipse(0, 7.6, 2, 7, 0, 0, TAU); fs(ctx, col, 0.8); ctx.beginPath(); ctx.moveTo(0, 1.2); ctx.lineTo(0, 14); ctx.lineWidth = 0.4; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke(); ctx.restore(); }
      rr(ctx, 39.4, -2.9, 3.4, 5.8, 0.8); fs(ctx, c.guard, 1);
    },
    skull(ctx, c) { rr(ctx, 35, -2.9, 9, 5.8, 1); fs(ctx, c.dark, 1); skull(ctx, 39.6, -6, 3.4, -1, c.glow, BONE); },
    chain(ctx, c) {
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(36 + k * 2.4, 0, 1.4, 3.2, 0.4, 0, TAU); line2(ctx, shade(c.dark, 0.2), 0.8); }
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(41 - k * 0.8, 5 + k * 2.4, k % 2 ? 0.6 : 1.3, 1.6, 0, 0, TAU); line2(ctx, shade(c.dark, 0.2), 0.7); }
      ctx.beginPath(); ctx.arc(39, 13.6, 2, 0, TAU); line2(ctx, c.guard, 1);
    },
    fur(ctx, c) {
      ctx.beginPath(); for (let k = 0; k <= 16; k++) { const a = k / 16 * TAU, r = k % 2 ? 5.4 : 7.6; ctx.lineTo(38 + Math.cos(a) * r * 0.75, Math.sin(a) * r * 1.15); } ctx.closePath(); fs(ctx, '#8a6a4a', 1.1);
      ctx.beginPath(); ctx.ellipse(38, 0, 3.4, 5.6, 0, 0, TAU); ctx.fillStyle = '#a8865e'; ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,20,.5)'; ctx.lineWidth = 0.6; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.moveTo(38 + Math.cos(a) * 2, Math.sin(a) * 3); ctx.lineTo(38 + Math.cos(a) * 4.6, Math.sin(a) * 7); } ctx.stroke();
      rr(ctx, 43, -2.9, 2.6, 5.8, 0.6); fs(ctx, c.guard, 0.9);
    },
    none() {}
  };

  /* =====================================================================
     7) LUKY – styly ozdob ramen   { size:[top,bot], fn(ctx, at, c, T, B, gemFn) }
     ===================================================================== */
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const tipDir = (at, top) => (top ? unit(at(0.08), at(0)) : unit(at(0.92), at(1)));
  const tips = (at, T, B) => [[T, tipDir(at, true), -1], [B, tipDir(at, false), 1]];
  const limbPts = (at, k0, k1, n) => { const a = []; for (let i = 0; i <= n; i++) a.push(at(k0 + (k1 - k0) * i / n)); return a; };
  const BS = {
    // reflexní luk: konce stočené do spirál dopředu, kovové nátrubky
    recurve: { size: [33, 30], fn(ctx, at, c, T, B) {
      for (const [p, u] of tips(at, T, B)) {
        const q = [p[0] + u[0] * 5.4, p[1] + u[1] * 5.4], e = [p[0] + u[0] * 3.2 + 6.4, p[1] + u[1] * 3.2];
        ctx.beginPath(); ctx.moveTo(p[0] - u[0] * 3, p[1] - u[1] * 3); ctx.lineTo(p[0], p[1]); ctx.quadraticCurveTo(q[0], q[1], e[0], e[1]); line2(ctx, c.wood, 2.4);
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(q[0], q[1], e[0], e[1]); ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.stroke();
        ctx.beginPath(); ctx.arc(e[0], e[1], 1.5, 0, TAU); fs(ctx, c.guard, 0.9);
        const m = [p[0] - u[0] * 3.4, p[1] - u[1] * 3.4]; rr(ctx, m[0] - 2.6, m[1] - 1.1, 5.2, 2.2, 0.8); fs(ctx, c.guard, 0.8);
      }
      for (const k of [0.33, 0.67]) { const p = at(k); rr(ctx, p[0] - 3, p[1] - 1.2, 6, 2.4, 0.8); fs(ctx, c.guard, 0.9); }
    } },
    // rohové špičky (beraní roh) s vroubky
    horn: { size: [35, 32], fn(ctx, at, c, T, B) {
      for (const [p, u, d] of tips(at, T, B)) {
        const b = at(d < 0 ? 0.12 : 0.88), n = [-u[1], u[0]], e = [p[0] + u[0] * 7 + 3, p[1] + u[1] * 7];
        ctx.beginPath(); ctx.moveTo(b[0] + n[0] * 2.4, b[1] + n[1] * 2.4); ctx.quadraticCurveTo(p[0] + n[0] * 2.6 + 1, p[1] + n[1] * 2.6, e[0], e[1]); ctx.quadraticCurveTo(p[0] - n[0] * 1.6 + 2, p[1] - n[1] * 1.6, b[0] - n[0] * 2.4, b[1] - n[1] * 2.4); ctx.closePath();
        const g = ctx.createLinearGradient(b[0], b[1], e[0], e[1]); g.addColorStop(0, '#d8c39a'); g.addColorStop(1, '#4a3a2a'); fs(ctx, g, 1);
        ctx.strokeStyle = 'rgba(60,40,20,.6)'; ctx.lineWidth = 0.6; for (let i = 1; i < 4; i++) { const q = [b[0] + (e[0] - b[0]) * i / 4, b[1] + (e[1] - b[1]) * i / 4]; ctx.beginPath(); ctx.moveTo(q[0] + n[0] * 2, q[1] + n[1] * 2); ctx.lineTo(q[0] - n[0] * 2, q[1] - n[1] * 2); ctx.stroke(); }
      }
    } },
    // visící pera s korálky
    feathers: { size: [34, 31], fn(ctx, at, c) {
      const sw = Math.sin(now() * 2.4) * 0.15;
      for (const k of [0.2, 0.8]) { const p = at(k);
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - 1, p[1] + 5); ctx.lineWidth = 0.7; ctx.strokeStyle = OUT; ctx.stroke();
        ctx.beginPath(); ctx.arc(p[0] - 1, p[1] + 5.4, 1.2, 0, TAU); fs(ctx, c.guard, 0.6);
        for (const [o, col] of [[0, c.gem || '#c8262a'], [1, '#f4f2ea']]) { ctx.save(); ctx.translate(p[0] - 1, p[1] + 6.4); ctx.rotate(0.25 - o * 0.45 + sw); ctx.beginPath(); ctx.ellipse(0, 5, 1.5, 5, 0, 0, TAU); fs(ctx, col, 0.7); ctx.beginPath(); ctx.moveTo(0, 0.4); ctx.lineTo(0, 9.6); ctx.lineWidth = 0.4; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.stroke(); ctx.restore(); }
      }
    } },
    // ostří vystupující dopředu z ramen + čepelové konce
    spikes: { size: [35, 32], fn(ctx, at, c, T, B) {
      for (const k of [0.13, 0.26, 0.39, 0.61, 0.74, 0.87]) { const p = at(k), d = k < 0.5 ? -1 : 1; ctx.beginPath(); ctx.moveTo(p[0], p[1] - 1.8); ctx.lineTo(p[0] + 6.4, p[1] + d * 2.6); ctx.lineTo(p[0], p[1] + 1.8); ctx.closePath(); fs(ctx, BF(ctx, c, p[0], p[0] + 6), 0.8); }
      for (const [p, u] of tips(at, T, B)) { const n = [-u[1], u[0]]; ctx.beginPath(); ctx.moveTo(p[0] + n[0] * 2, p[1] + n[1] * 2); ctx.lineTo(p[0] + u[0] * 8, p[1] + u[1] * 8); ctx.lineTo(p[0] - n[0] * 2, p[1] - n[1] * 2); ctx.closePath(); fs(ctx, BF(ctx, c, p[0] - 2, p[0] + 2), 0.9); }
    } },
    // runové destičky a (se září) energetická žilka po ramenou
    runes: { size: [35, 32], fn(ctx, at, c) {
      if (c.glow) { ctx.save(); glowS(ctx, c.glow, 8); ctx.strokeStyle = c.glow; ctx.lineWidth = 0.8; for (const [k0, k1] of [[0.04, 0.42], [0.58, 0.96]]) { ctx.beginPath(); limbPts(at, k0, k1, 10).forEach((p, i) => (i ? ctx.lineTo(p[0] + 0.6, p[1]) : ctx.moveTo(p[0] + 0.6, p[1]))); ctx.stroke(); } ctx.restore(); }
      [0.18, 0.32, 0.68, 0.82].forEach((k, i) => { const p = at(k); rr(ctx, p[0] - 2.4, p[1] - 3, 4.8, 6, 1); fs(ctx, shade(c.dark, -0.3), 0.9); ctx.save(); if (c.glow) glowS(ctx, c.glow, 6); ctx.strokeStyle = c.glow || c.guard; ctx.lineWidth = 0.8; ctx.lineCap = 'round'; glyph(ctx, p[0], p[1], i * 2 + 1, 2); ctx.restore(); });
    } },
    // úponky obtočené kolem ramen a květy u úchopu
    vines: { size: [34, 31], fn(ctx, at, c) {
      for (const [k0, k1] of [[0.03, 0.44], [0.56, 0.97]]) {
        const pts = limbPts(at, k0, k1, 24).map((p, i) => [p[0] + Math.sin(i * 0.9) * 2.4, p[1]]);
        ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); line2(ctx, '#3f8a3a', 1);
        for (let i = 3; i < pts.length; i += 4) { const p = pts[i], d = (i % 8 < 4) ? 1 : -1; ctx.beginPath(); ctx.ellipse(p[0] + d * 2.4, p[1], 2.2, 1.1, d * 0.5, 0, TAU); fs(ctx, '#6cc04a', 0.6); }
      }
      for (const k of [0.42, 0.58]) { const p = at(k); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.arc(p[0] + 4 + Math.cos(a) * 1.5, p[1] + Math.sin(a) * 1.5, 1.2, 0, TAU); ctx.fillStyle = c.gem || '#ff8ac0'; ctx.fill(); } ctx.beginPath(); ctx.arc(p[0] + 4, p[1], 0.9, 0, TAU); ctx.fillStyle = '#ffe07a'; ctx.fill(); }
    } },
    // řetěz zavěšený mezi rameny před lukem
    chains: { size: [35, 32], fn(ctx, at, c) {
      const a = at(0.2), b = at(0.8), cp = [Math.max(a[0], b[0]) + 26, (a[1] + b[1]) / 2], N = 14;
      for (let i = 0; i <= N; i++) { const u = i / N, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * cp[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * cp[1] + u * u * b[1];
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2 + (u - 0.5) * 1.4); ctx.beginPath(); ctx.ellipse(0, 0, 1.9, i % 2 ? 0.7 : 1.2, 0, 0, TAU); fs(ctx, i % 2 ? shade(c.dark, -0.1) : shade(c.dark, 0.3), 0.6); ctx.restore(); }
      for (const p of [a, b]) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, TAU); line2(ctx, c.guard, 1); }
    } },
    // drahokamy ve zlatých lůžkách a velký kámen vpředu
    gems: { size: [35, 32], fn(ctx, at, c, T, B, gemFn) {
      const g = gemFn || gem, col = gemCol(c);
      for (const k of [0.14, 0.3, 0.7, 0.86]) { const p = at(k); ctx.beginPath(); ctx.moveTo(p[0], p[1] - 3); ctx.lineTo(p[0] + 2.6, p[1]); ctx.lineTo(p[0], p[1] + 3); ctx.lineTo(p[0] - 2.6, p[1]); ctx.closePath(); fs(ctx, c.guard, 0.8); ctx.save(); if (c.glow) glowS(ctx, c.glow, 6); g(ctx, p[0], p[1], 1.4, col); ctx.restore(); }
      const m = at(0.5); ctx.beginPath(); ctx.ellipse(m[0] + 5, m[1], 2.6, 4, 0, 0, TAU); fs(ctx, c.guard, 1); ctx.save(); if (c.glow) glowS(ctx, c.glow, 8); g(ctx, m[0] + 5, m[1], 1.9, col); ctx.restore();
    } },
    // lebky na koncích a uprostřed
    skulls: { size: [36, 33], fn(ctx, at, c, T, B) {
      for (const [p, u] of tips(at, T, B)) skull(ctx, p[0] + u[0] * 3.4 + 0.6, p[1] + u[1] * 3.4, 3, u[1] < 0 ? -1 : 1, c.glow, BONE);
      const m = at(0.5); skull(ctx, m[0] + 5.6, m[1], 3.4, -1, c.glow, BONE);
      for (const k of [0.22, 0.78]) { const p = at(k); ctx.beginPath(); ctx.ellipse(p[0], p[1], 2.6, 1.5, 0, 0, TAU); fs(ctx, BONE, 0.7); }
    } },
    // plameny šlehající z konců ramen
    flame: { size: [36, 34], fn(ctx, at, c, T, B) {
      const t = now(), col = c.glow || '#ff7a2a';
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 12);
      for (const [p, u, d] of tips(at, T, B)) { const n = [-u[1], u[0]];
        for (const [s0, cc] of [[1.3, col], [0.75, '#ffe07a']]) { const s = s0, L = (5.4 + Math.sin(t * 8 + d) * 0.8) * s, e = [p[0] + u[0] * L + 2.4 * s, p[1] + u[1] * L];
          ctx.beginPath(); ctx.moveTo(p[0] + n[0] * 3 * s - u[0] * 3, p[1] + n[1] * 3 * s - u[1] * 3); ctx.quadraticCurveTo(p[0] + n[0] * 4 * s + u[0] * L * 0.5, p[1] + n[1] * 4 * s + u[1] * L * 0.5, e[0], e[1]); ctx.quadraticCurveTo(p[0] - n[0] * 2 * s + u[0] * L * 0.4, p[1] - n[1] * 2 * s + u[1] * L * 0.4, p[0] - n[0] * 2.6 * s - u[0] * 3, p[1] - n[1] * 2.6 * s - u[1] * 3); ctx.closePath(); ctx.fillStyle = cc; ctx.fill(); }
      }
      for (const k of [0.2, 0.34, 0.66, 0.8]) { const p = at(k), f = Math.sin(t * 9 + k * 9), up = k < 0.5 ? -1 : 1;
        for (const [s, cc] of [[1, col], [0.55, '#ffe07a']]) { ctx.beginPath(); ctx.moveTo(p[0], p[1] - 2.4 * s); ctx.quadraticCurveTo(p[0] + 5 * s, p[1] - 2 * s + up * f * 0.5, p[0] + 8 * s, p[1] + up * (4 + f) * s); ctx.quadraticCurveTo(p[0] + 4 * s, p[1] + 1 * s, p[0], p[1] + 2.4 * s); ctx.closePath(); ctx.fillStyle = cc; ctx.fill(); } }
      ctx.restore();
    } },
    // vznášející se krystalové střepy a krystalové hroty
    shards: { size: [36, 33], fn(ctx, at, c, T, B) {
      const t = now(), col = c.glow || '#9fe0ff';
      const cry = (x, y, r, a) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.45, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.45, 0); ctx.closePath(); const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, col); ctx.globalAlpha = 0.92; fs(ctx, g, 0.8); ctx.restore(); };
      ctx.save(); if (c.glow) glowS(ctx, c.glow, 8);
      [0.16, 0.33, 0.67, 0.84].forEach((k, i) => { const p = at(k); cry(p[0] + 6 + Math.sin(t * 2 + i) * 1.2, p[1] + Math.cos(t * 1.6 + i) * 1.2, 2.8, 0.4 + i); });
      for (const [p, u] of tips(at, T, B)) cry(p[0] + u[0] * 4, p[1] + u[1] * 4, 4.6, Math.atan2(u[1], u[0]) + Math.PI / 2);
      ctx.restore();
    } },
    // dračí hlavy na koncích ramen a šupiny
    dragon: { size: [38, 35], fn(ctx, at, c, T, B) {
      ctx.fillStyle = shade(c.guard, -0.2); for (let k = 0.12; k < 0.9; k += 0.07) { if (Math.abs(k - 0.5) < 0.1) continue; const p = at(k); ctx.beginPath(); ctx.arc(p[0] + 1.4, p[1], 1.1, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
      for (const [p, u, d] of tips(at, T, B)) {
        ctx.save(); ctx.translate(p[0] - u[0] * 5.6, p[1] - u[1] * 5.6); ctx.rotate(Math.atan2(u[1], u[0])); ctx.scale(1.35, -d * 1.35);
        // zadní roh
        for (const [hy, hl] of [[-2.2, 8.4], [-0.6, 6.4]]) { ctx.beginPath(); ctx.moveTo(-0.6, hy); ctx.quadraticCurveTo(-hl * 0.5, hy - 3.4, -hl, hy - 2.6); ctx.quadraticCurveTo(-hl * 0.5, hy - 1, -2.4, hy + 1.6); ctx.closePath(); fs(ctx, shade(c.guard, 0.25), 0.8); }
        // hlava s otevřenou tlamou
        ctx.beginPath(); ctx.moveTo(-3, -2.6); ctx.quadraticCurveTo(2, -4.6, 8, -2.4); ctx.lineTo(8.6, -0.6); ctx.lineTo(3.6, 0); ctx.lineTo(7.6, 1.6); ctx.lineTo(6.6, 3); ctx.quadraticCurveTo(1, 3.6, -3, 2.6); ctx.closePath(); fs(ctx, c.guard, 1);
        ctx.beginPath(); ctx.moveTo(3.6, 0); ctx.lineTo(8.4, -0.6); ctx.lineTo(7.6, 1.6); ctx.closePath(); ctx.fillStyle = '#7a1a1a'; ctx.fill();
        ctx.save(); if (c.glow) glowS(ctx, c.glow, 6); ctx.beginPath(); ctx.arc(1.6, -1.6, 0.8, 0, TAU); ctx.fillStyle = c.glow || '#ffd23f'; ctx.fill(); ctx.restore();
        ctx.restore();
      }
    } },
    // pernatá křídla vyrůstající z ramen dopředu
    wings: { size: [36, 34], fn(ctx, at, c) {
      for (const [k, d] of [[0.3, -1], [0.7, 1]]) { const p = at(k);
        for (let i = 0; i < 5; i++) { const a = d * (0.4 + i * 0.28), L = 13 - i * 1.6; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(L * 0.5, 0, L * 0.5, 1.7, 0, 0, TAU); fs(ctx, i % 2 ? '#e8e4da' : '#f8f6f0', 0.7); ctx.restore(); }
        ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, TAU); fs(ctx, c.guard, 0.8);
      }
    } },
    // měsíční srpky (čepele) na koncích
    moon: { size: [34, 31], fn(ctx, at, c, T, B) {
      for (const [p, u, d] of tips(at, T, B)) {
        ctx.save(); ctx.translate(p[0] + u[0] * 1.6, p[1] + u[1] * 1.6); ctx.rotate(Math.atan2(u[1], u[0]));
        ctx.beginPath(); ctx.arc(0, 0, 5.6, -Math.PI * 0.6, Math.PI * 0.6); ctx.arc(-2.2, 0, 4.4, Math.PI * 0.5, -Math.PI * 0.5, true); ctx.closePath(); fs(ctx, BF(ctx, c, -4, 6), 1); ctx.restore();
      }
      for (const k of [0.3, 0.7]) { const p = at(k); gem(ctx, p[0], p[1], 1.5, gemCol(c)); }
    } }
  };

  /* =====================================================================
     8) HLAVICE HOLÍ  (ctx, y, k)  k = { glow, trim, raise, t, metal, dark, wood, gem }
     ===================================================================== */
  const SH = {
    // koule v kovové kleci s hrotem
    orbcage(ctx, y, k) { orb(ctx, 0, y - 3, 5.2, k.glow, k.raise);
      ctx.save(); ctx.beginPath(); for (const sx of [1, 0.45, -0.45, -1]) { ctx.moveTo(0, y - 10.4); ctx.bezierCurveTo(sx * 9, y - 9, sx * 9, y + 3, 0, y + 4.4); } ctx.lineWidth = 2.6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 1.2; ctx.strokeStyle = k.metal; ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-1.6, y - 10); ctx.lineTo(0, y - 15); ctx.lineTo(1.6, y - 10); ctx.closePath(); fs(ctx, k.metal, 1); rr(ctx, -3, y + 3.4, 6, 3, 1); fs(ctx, k.metal, 1); },
    // vztyčený srpek s plovoucí hvězdou mezi rohy
    crescent(ctx, y, k) {
      ctx.beginPath(); ctx.arc(0, y - 6, 9.6, 0.15, Math.PI - 0.15); ctx.arc(0, y - 8.4, 7.6, Math.PI - 0.25, 0.25, true); ctx.closePath(); fs(ctx, k.metal, 1.3);
      ctx.beginPath(); ctx.arc(0, y - 6, 8.8, 0.5, Math.PI - 0.5); ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke();
      const b = Math.sin(k.t * 2.4) * 1.2; ctx.save(); glowS(ctx, k.glow, 10 + k.raise * 12); star(ctx, 0, y - 8 + b, 4.4, 1.7, 4, k.t * 0.8); fs(ctx, k.glow, 0.8); ctx.restore();
      rr(ctx, -2.4, y + 2.4, 4.8, 3.4, 1); fs(ctx, k.metal, 1); },
    // strom světa: listnatá koruna se zářícími plody
    tree(ctx, y, k) {
      ctx.lineCap = 'round'; for (const [x2, y2] of [[-5, -6], [0, -9], [5, -5]]) { ctx.beginPath(); ctx.moveTo(0, y + 6); ctx.quadraticCurveTo(x2 * 0.3, y, x2, y + y2); ctx.lineWidth = 3.4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 1.8; ctx.strokeStyle = k.wood; ctx.stroke(); }
      for (const [x, yy, r] of [[-6, -7, 4.4], [6, -7, 4.4], [0, -11, 5], [-3, -4, 3.6], [3.4, -4, 3.6]]) { ctx.beginPath(); ctx.arc(x, y + yy, r, 0, TAU); fs(ctx, '#4f9a3a', 1); }
      ctx.beginPath(); ctx.arc(-1.6, y - 11.6, 2.4, 0, TAU); ctx.fillStyle = '#7ccc52'; ctx.fill();
      ctx.save(); glowS(ctx, k.glow, 8 + k.raise * 10); ctx.fillStyle = k.glow; for (const [x, yy] of [[-5, -8], [4.6, -9.6], [0.4, -5], [-1.6, -13]]) { ctx.beginPath(); ctx.arc(x, y + yy, 1.3, 0, TAU); ctx.fill(); } ctx.restore(); },
    // shluk krystalů rozevřený do vějíře
    cluster(ctx, y, k) {
      ctx.save(); glowS(ctx, k.glow, 10 + k.raise * 14);
      for (const [a, h, w] of [[-1.0, 10.4, 2.4], [1.0, 10, 2.4], [-0.5, 13, 2.8], [0.52, 12.4, 2.8], [0, 16.4, 3.4]]) { ctx.save(); ctx.translate(0, y + 4); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w, -h * 0.7); ctx.lineTo(0, -h); ctx.lineTo(w, -h * 0.7); ctx.lineTo(w, 0); ctx.closePath(); const g = ctx.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, k.glow); g.addColorStop(1, shade(k.glow, -0.4)); fs(ctx, g, 1); ctx.beginPath(); ctx.moveTo(0, -h + 1); ctx.lineTo(0, -1); ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke(); ctx.restore(); }
      ctx.restore(); ctx.beginPath(); ctx.ellipse(0, y + 4.8, 4, 1.8, 0, 0, TAU); fs(ctx, '#6a6e78', 1.1); },
    // lebka se svíčkou na temeni
    skull(ctx, y, k) {
      ctx.beginPath(); ctx.arc(0, y - 1, 6.2, 0, TAU); fs(ctx, BONE, 1.4); rr(ctx, -3.6, y + 3.4, 7.2, 4, 1.2); fs(ctx, BONE, 1.2);
      ctx.fillStyle = OUT; for (const x of [-1.8, 0, 1.8]) ctx.fillRect(x - 0.35, y + 4.2, 0.7, 2.6);
      ctx.save(); glowS(ctx, k.glow, 8 + k.raise * 10); ctx.fillStyle = k.glow; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 2.4, y - 0.6, 1.7, 1.4, d * 0.3, 0, TAU); ctx.fill(); } ctx.restore();
      ctx.beginPath(); ctx.moveTo(-0.8, y + 2.2); ctx.lineTo(0.8, y + 2.2); ctx.lineTo(0, y + 1); ctx.closePath(); ctx.fillStyle = OUT; ctx.fill();
      rr(ctx, -1.6, y - 11.6, 3.2, 5, 0.6); fs(ctx, '#f2ead6', 0.9); ctx.beginPath(); ctx.moveTo(-1.6, y - 7); ctx.quadraticCurveTo(-3, y - 6, -2.4, y - 5); ctx.lineWidth = 1; ctx.strokeStyle = '#f2ead6'; ctx.stroke();
      const f = Math.sin(k.t * 10) * 0.6; ctx.save(); glowS(ctx, '#ffb347', 8); ctx.beginPath(); ctx.moveTo(-1.4, y - 11.6); ctx.quadraticCurveTo(-1.6, y - 14, f, y - 16.4); ctx.quadraticCurveTo(1.6, y - 14, 1.4, y - 11.6); ctx.closePath(); ctx.fillStyle = '#ffb347'; ctx.fill(); ctx.restore(); },
    // oko s víčky a ostnatou svatozáří
    eye(ctx, y, k) {
      ctx.save(); glowS(ctx, k.glow, 6 + k.raise * 10); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + k.t * 0.3, r = i % 2 ? 7.4 : 11; ctx.lineTo(Math.cos(a) * r, y - 2 + Math.sin(a) * r); } ctx.closePath(); fs(ctx, shade(k.glow, -0.35), 1); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-7.4, y - 2); ctx.quadraticCurveTo(0, y - 10, 7.4, y - 2); ctx.quadraticCurveTo(0, y + 6, -7.4, y - 2); ctx.closePath(); fs(ctx, k.metal, 1.3);
      ctx.beginPath(); ctx.ellipse(0, y - 2, 5.2, 3, 0, 0, TAU); ctx.fillStyle = '#fff6e8'; ctx.fill();
      const lx = Math.sin(k.t * 0.9) * 1.6; ctx.save(); glowS(ctx, k.glow, 8); ctx.beginPath(); ctx.arc(lx, y - 2, 2.4 + k.raise * 0.6, 0, TAU); ctx.fillStyle = k.glow; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.ellipse(lx, y - 2, 0.7, 2, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill(); },
    // ohnivá mísa (žároviště) s vysokými plameny
    flamebowl(ctx, y, k) {
      const t = k.t; ctx.save(); glowS(ctx, k.glow, 12 + k.raise * 14);
      for (const [s, col, o] of [[1, k.glow, 0], [0.62, '#ffe9a0', 1]]) { ctx.beginPath(); ctx.moveTo(-6 * s, y - 2); for (let i = 0; i <= 4; i++) { const x = -6 * s + i * 3 * s, h = (i % 2 ? 9 : 14) * s + Math.sin(t * 9 + i * 2 + o) * 1.6 + k.raise * 3; ctx.quadraticCurveTo(x - 1.4 * s, y - 2 - h * 0.6, x, y - 2 - h); ctx.quadraticCurveTo(x + 1.4 * s, y - 2 - h * 0.5, x + 1.5 * s, y - 3); } ctx.lineTo(6 * s, y - 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-8, y - 3); ctx.lineTo(8, y - 3); ctx.quadraticCurveTo(7, y + 4, 0, y + 4.6); ctx.quadraticCurveTo(-7, y + 4, -8, y - 3); ctx.closePath(); fs(ctx, k.metal, 1.4);
      ctx.beginPath(); ctx.moveTo(-7.6, y - 1); ctx.lineTo(7.6, y - 1); ctx.lineWidth = 0.8; ctx.strokeStyle = shade(k.metal, -0.35); ctx.stroke();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 8.6, y - 1, 1.4, 0, TAU); line2(ctx, k.metal, 0.8); } },
    // přesýpací hodiny se zářícím pískem
    hourglass(ctx, y, k) {
      const gl = () => { ctx.beginPath(); ctx.moveTo(-4.6, y - 11); ctx.lineTo(4.6, y - 11); ctx.quadraticCurveTo(4.6, y - 5, 0.8, y - 3); ctx.quadraticCurveTo(4.6, y - 1, 4.6, y + 5); ctx.lineTo(-4.6, y + 5); ctx.quadraticCurveTo(-4.6, y - 1, -0.8, y - 3); ctx.quadraticCurveTo(-4.6, y - 5, -4.6, y - 11); ctx.closePath(); };
      gl(); ctx.fillStyle = 'rgba(220,240,255,.35)'; ctx.fill();
      const ph = (k.t * 0.25) % 1; ctx.save(); gl(); ctx.clip(); glowS(ctx, k.glow, 8 + k.raise * 10); ctx.fillStyle = k.glow; ctx.fillRect(-5, y - 9 + ph * 5, 10, 6 - ph * 5); ctx.beginPath(); ctx.moveTo(-4.6, y + 5); ctx.lineTo(0, y + 5 - 1 - ph * 5); ctx.lineTo(4.6, y + 5); ctx.closePath(); ctx.fill(); ctx.fillRect(-0.4, y - 3.4, 0.8, 8); ctx.restore();
      gl(); ctx.lineWidth = 1.1; ctx.strokeStyle = OUT; ctx.stroke();
      for (const yy of [y - 12.6, y + 5]) { rr(ctx, -6.4, yy, 12.8, 2.4, 1); fs(ctx, k.metal, 1.1); }
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 5.6, y - 11); ctx.lineTo(d * 5.6, y + 5); line2(ctx, k.wood, 1); } },
    // otáčející se osmicípá hvězda v prstenci
    star(ctx, y, k) {
      ctx.beginPath(); ctx.arc(0, y - 3, 9.4, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 1.4; ctx.strokeStyle = k.metal; ctx.stroke();
      ctx.save(); glowS(ctx, k.glow, 10 + k.raise * 14); star(ctx, 0, y - 3, 8, 3, 8, k.t * 0.6); fs(ctx, k.glow, 0.9); star(ctx, 0, y - 3, 3.4, 1.4, 4, -k.t); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-2, y + 6.4); ctx.lineTo(0, y + 2); ctx.lineTo(2, y + 6.4); ctx.closePath(); fs(ctx, k.metal, 1); },
    // caduceus: dva hadi a křídla s koulí
    serpent(ctx, y, k) {
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 1.5, y - 9.6); ctx.quadraticCurveTo(d * 7, y - 17, d * 13, y - 15); ctx.quadraticCurveTo(d * 10, y - 13, d * 11, y - 11.4); ctx.quadraticCurveTo(d * 8, y - 11, d * 8.6, y - 9); ctx.quadraticCurveTo(d * 5.4, y - 9.4, d * 5.6, y - 7.4); ctx.quadraticCurveTo(d * 3.4, y - 8, d * 1.5, y - 7); ctx.closePath(); fs(ctx, '#f4f2ea', 1);
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(d * 2, y - 8.6); ctx.lineTo(d * 11, y - 11.4); ctx.moveTo(d * 2, y - 8.2); ctx.lineTo(d * 8.6, y - 9); ctx.stroke(); }
      for (const [d, col] of [[1, '#3f8a3a'], [-1, '#5aa84a']]) { ctx.beginPath(); ctx.moveTo(0, y + 8); ctx.bezierCurveTo(d * 6, y + 6, d * 6, y + 2, 0, y); ctx.bezierCurveTo(-d * 6, y - 2, -d * 6, y - 5, d * 2.6, y - 6.6); line2(ctx, col, 2.2); ctx.beginPath(); ctx.ellipse(d * 4, y - 7.6, 2.6, 1.7, d * 0.4, 0, TAU); fs(ctx, col, 1); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(d * 4.6, y - 8.2, 0.6, 0, TAU); ctx.fill(); }
      orb(ctx, 0, y - 12, 3, k.glow, k.raise); },
    // pastýřská berla se zvonkem
    bell(ctx, y, k) {
      ctx.beginPath(); ctx.moveTo(0, y + 8); ctx.lineTo(0, y - 4); ctx.bezierCurveTo(0, y - 14, 10, y - 14, 10, y - 6); line2(ctx, k.wood, 2.4);
      const sw = Math.sin(k.t * 4) * 0.25; ctx.save(); ctx.translate(10, y - 6); ctx.rotate(sw);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 2); ctx.lineWidth = 0.9; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2.6, 2.6); ctx.quadraticCurveTo(-3, 6.6, -4.6, 8.6); ctx.lineTo(4.6, 8.6); ctx.quadraticCurveTo(3, 6.6, 2.6, 2.6); ctx.quadraticCurveTo(0, 1, -2.6, 2.6); ctx.closePath(); fs(ctx, k.metal, 1.1);
      ctx.save(); glowS(ctx, k.glow, 8 + k.raise * 10); ctx.beginPath(); ctx.arc(0, 9.4, 1.3, 0, TAU); ctx.fillStyle = k.glow; ctx.fill(); ctx.restore(); ctx.restore();
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(14 + i * 1.4, y + 2 - i * 3 - (k.t * 3 % 3), 0.6, 0, TAU); ctx.fillStyle = k.glow; ctx.fill(); } },
    // lucerna na háku s plamínkem
    lantern(ctx, y, k) {
      ctx.beginPath(); ctx.moveTo(0, y + 8); ctx.lineTo(0, y - 10); ctx.quadraticCurveTo(0, y - 14, 5, y - 13); line2(ctx, k.metal, 1.4);
      const sw = Math.sin(k.t * 2) * 0.12; ctx.save(); ctx.translate(6, y - 12); ctx.rotate(sw);
      ctx.save(); glowS(ctx, k.glow, 12 + k.raise * 14); rr(ctx, -3.4, 2.6, 6.8, 9, 1.6); ctx.fillStyle = k.glow; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-1, 10); ctx.quadraticCurveTo(-1.6, 7, 0, 4.6 + Math.sin(k.t * 9) * 0.5); ctx.quadraticCurveTo(1.6, 7, 1, 10); ctx.closePath(); ctx.fillStyle = '#fffbe0'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = 1; rr(ctx, -3.4, 2.6, 6.8, 9, 1.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 2.6); ctx.lineTo(0, 11.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-4.4, 2.8); ctx.lineTo(0, -0.6); ctx.lineTo(4.4, 2.8); ctx.closePath(); fs(ctx, k.metal, 1); rr(ctx, -4, 11, 8, 1.8, 0.6); fs(ctx, k.metal, 0.9);
      ctx.beginPath(); ctx.arc(0, -1.4, 1, 0, TAU); line2(ctx, k.metal, 0.6); ctx.restore(); },
    // prstenec obíhajících runových kamenů kolem jádra
    runering(ctx, y, k) {
      orb(ctx, 0, y - 3, 3.4, k.glow, k.raise);
      ctx.beginPath(); ctx.ellipse(0, y - 3, 10, 4, 0, 0, TAU); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke();
      const st = []; for (let i = 0; i < 5; i++) { const a = k.t * 1.2 + i / 5 * TAU; st.push([Math.cos(a) * 10, y - 3 + Math.sin(a) * 4, Math.sin(a), i]); }
      st.sort((p, q) => p[2] - q[2]).forEach(([x, yy, z, i]) => { const s = 0.85 + z * 0.15; rr(ctx, x - 2.2 * s, yy - 2.8 * s, 4.4 * s, 5.6 * s, 1); fs(ctx, '#8a8f99', 0.9); ctx.save(); glowS(ctx, k.glow, 6); ctx.strokeStyle = k.glow; ctx.lineWidth = 0.7; ctx.lineCap = 'round'; glyph(ctx, x, yy, i, 1.7 * s); ctx.restore(); }); },
    // totem s vyřezávanou tváří a pery
    totem(ctx, y, k) {
      for (const [a, col] of [[-0.7, '#f4f2ea'], [-0.25, k.gem], [0.25, '#2a2a30'], [0.7, '#f4f2ea']]) { ctx.save(); ctx.translate(0, y - 8); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -5, 1.7, 5.4, 0, 0, TAU); fs(ctx, col, 0.8); ctx.restore(); }
      rr(ctx, -5, y - 9, 10, 14, 2); fs(ctx, k.wood, 1.3);
      ctx.fillStyle = OUT; rr(ctx, -3.6, y - 5.6, 2.8, 2, 0.6); ctx.fill(); rr(ctx, 0.8, y - 5.6, 2.8, 2, 0.6); ctx.fill();
      ctx.save(); glowS(ctx, k.glow, 6 + k.raise * 10); ctx.fillStyle = k.glow; for (const x of [-2.2, 2.2]) { ctx.beginPath(); ctx.arc(x, y - 4.6, 0.7, 0, TAU); ctx.fill(); } ctx.restore();
      ctx.beginPath(); ctx.moveTo(-2.6, y + 0.6); ctx.lineTo(2.6, y + 0.6); ctx.lineTo(0, y + 2.6); ctx.closePath(); ctx.fillStyle = '#c8262a'; ctx.fill();
      ctx.strokeStyle = k.trim; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, y - 1.6); ctx.lineTo(5, y - 1.6); ctx.moveTo(-5, y + 3.4); ctx.lineTo(5, y + 3.4); ctx.stroke();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 5, y - 7); ctx.lineTo(d * 8.6, y - 5); ctx.lineTo(d * 5, y - 2.6); ctx.closePath(); fs(ctx, k.wood, 0.9); } },
    // beraní rohy stočené kolem koule
    horned(ctx, y, k) {
      orb(ctx, 0, y - 4, 4.4, k.glow, k.raise);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 2, y + 4); ctx.bezierCurveTo(d * 12, y + 4, d * 13, y - 12, d * 5, y - 12); ctx.bezierCurveTo(d * 1, y - 12, d * 2, y - 7, d * 6, y - 7.6);
        line2(ctx, '#d8c39a', 2.6); ctx.strokeStyle = 'rgba(80,60,30,.5)'; ctx.lineWidth = 0.6; for (let i = 0; i < 4; i++) { const yy = y + 2 - i * 3.6; ctx.beginPath(); ctx.moveTo(d * (8.6 + (i === 0 ? -2 : 0)), yy); ctx.lineTo(d * (11 - (i === 0 ? 2 : 0)), yy - 0.6); ctx.stroke(); } }
      rr(ctx, -3, y + 3, 6, 3, 1); fs(ctx, k.metal, 1); },
    // galaxie: rotující spirální ramena kolem jasného jádra
    galaxy(ctx, y, k) {
      ctx.save(); ctx.translate(0, y - 3); ctx.scale(1, 0.75);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 11); g.addColorStop(0, 'rgba(30,20,60,.9)'); g.addColorStop(1, 'rgba(30,20,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
      glowS(ctx, k.glow, 8 + k.raise * 12);
      for (let arm = 0; arm < 3; arm++) { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const r = 1 + i * 0.6, a = k.t * 1.4 + arm * TAU / 3 + i * 0.32; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.lineCap = 'round'; ctx.lineWidth = 1.8; ctx.strokeStyle = arm % 2 ? '#ffffff' : k.glow; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore(); ctx.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { const a = -k.t * 0.7 + i * 1.7; ctx.beginPath(); ctx.arc(Math.cos(a) * 11, y - 3 + Math.sin(a) * 7, 0.6, 0, TAU); ctx.fill(); }
      rr(ctx, -2.4, y + 4, 4.8, 3, 1); fs(ctx, k.metal, 1); }
  };

  /* =====================================================================
     REGISTRACE
     ===================================================================== */
  const STAFF_REG = {};
  const prevHead = A.staffHead;
  A.staffHead = (ctx, id, y, mc, trim, raise, Mo) => {
    const h = STAFF_REG[id];
    if (!h) return prevHead ? prevHead(ctx, id, y, mc, trim, raise, Mo) : undefined;
    Mo = Mo || {};
    const glow = Mo.glow || mc || '#7fc8ff';
    h(ctx, y, { glow, trim: trim || '#e8b84a', raise: raise || 0, t: now(), metal: Mo.guard || trim || '#c9a24a', dark: Mo.dark || '#5a5a64', wood: Mo.wood || '#6b4528', gem: Mo.gem || glow, Mo });
  };

  const Forge = {
    parts: { blades: BL, heads: HD, guards: GU, pommels: PM, decos: DE, poleHeads: PH, collars: CO, bowStyles: BS, staffHeads: SH },
    /* meč: { blade, guard, pommel, deco (id nebo pole), grip ('long' | číslo), wrap ('ito'), flip }
       sekera/palcát: { head, pommel, deco, grip } – automaticky HEADED_REF */
    melee(id, def) {
      def = def || {};
      if (def.head && HD[def.head]) { M[id] = composeHead(def); HEADED[id] = 1; delete FLIP[id]; }
      else { M[id] = composeBlade(def); delete HEADED[id]; const b = BL[def.blade] || BL.broad; if (def.flip != null ? def.flip : b.flip) FLIP[id] = 1; else delete FLIP[id]; }
      if (A.meleeModels && A.meleeModels.indexOf(id) < 0) A.meleeModels.push(id);
      return M[id];
    },
    // kopí: { head, collar }
    pole(id, def) {
      def = def || {};
      const h = PH[def.head] || PH.leaf, co = def.collar === undefined ? CO.ring : (CO[def.collar] || CO.none);
      PO[id] = (ctx, c) => { co(ctx, c); h(ctx, c); };
      if (A.poleModels && A.poleModels.indexOf(id) < 0) A.poleModels.push(id);
      return PO[id];
    },
    // luk: { style, size:[top, bot] }
    bow(id, def) {
      def = def || {};
      const s = BS[def.style] || BS.recurve;
      A.BOW_REF[id] = (def.size || s.size).slice();
      A.bowDecor[id] = s.fn;
      return A.bowDecor[id];
    },
    // hůl: { head }
    staff(id, def) {
      def = def || {};
      STAFF_REG[id] = SH[def.head] || SH.orbcage;
      return STAFF_REG[id];
    },
    lists: {
      blades: Object.keys(BL),
      guards: Object.keys(GU),
      pommels: Object.keys(PM).filter(k => k[0] !== '_'),
      decos: Object.keys(DE),
      heads: Object.keys(HD),
      axeHeads: Object.keys(HD).filter(k => !HD[k].mace && ['flanged', 'morning', 'warhammer', 'maul', 'star', 'skullmace'].indexOf(k) < 0),
      maceHeads: ['flanged', 'morning', 'warhammer', 'maul', 'star', 'skullmace'],
      poleHeads: Object.keys(PH),
      collars: Object.keys(CO),
      bowStyles: Object.keys(BS),
      staffHeads: Object.keys(SH)
    }
  };
  window.Forge = Forge;
})();
