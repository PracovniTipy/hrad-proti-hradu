/* =========================================================================
   DRAK ZA HRADEM – k útoku Dračí dech už nepatří jen hlava na zdi.
   Za hradem sedí celý drak: obrovská netopýří křídla nad hradbami, žhnoucí
   magmatické praskliny v šupinách, ocas omotaný kolem věže, dlouhý krk,
   který se vynoří zpoza věže, a hlava s korunou rohů. Při Dračím dechu se
   drak vzepne, roztáhne křídla, zamává jimi a praskliny se rozžhaví.
   Tlama zůstává přesně tam, odkud vychází oheň (Art.dragonMouth).
   ========================================================================= */
(function () {
  if (!window.Art || !Art.drawCastle) return;
  const TAU = Math.PI * 2, OUT = '#1a0c0a';
  const C = { sc: '#5a1410', sc2: '#7e1d16', sc3: '#a8301f', dark: '#2a0806', belly: '#d89a5a', belly2: '#b8743a', horn: '#f2e2b8', horn2: '#c9a870', gold: '#ffcf4a', mem: 'rgba(120,20,16,.86)', mem2: 'rgba(170,40,24,.55)', magma: '#ff7a1a', magma2: '#ffd27a' };
  const fs = (ctx, f, lw) => { ctx.fillStyle = f; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.stroke(); } };
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- KŘÍDLO: rameno v (0,0), roste nahoru a dozadu (-x) ---------- */
  function wing(ctx, sp, flap, far, heat) {
    ctx.save(); ctx.rotate(flap * 0.38 + (far ? 0.42 : 0));
    const fold = 0.5 + 0.5 * sp;
    const el = [Math.cos(-2.35) * 62, Math.sin(-2.35) * 62];
    const wa = -1.55 - (1 - sp) * 0.25;
    const wr = [el[0] + Math.cos(wa) * 78 * fold, el[1] + Math.sin(wa) * 78 * fold];
    const FA = [-1.7, -2.2, -2.7, -3.15].map(a => lerp(-2.3, a, sp));
    const FL = [128, 136, 118, 92].map(l => l * fold);
    const tips = FA.map((a, i) => [wr[0] + Math.cos(a) * FL[i], wr[1] + Math.sin(a) * FL[i]]);
    const root = [-52, 18];
    // blána se zubatými okraji
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(el[0], el[1]); ctx.lineTo(wr[0], wr[1]); ctx.lineTo(tips[0][0], tips[0][1]);
    for (let i = 1; i < tips.length; i++) {
      const a = tips[i - 1], b = tips[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - wr[0], dy = my - wr[1];
      ctx.quadraticCurveTo(mx - dx * 0.28, my - dy * 0.28, b[0], b[1]);
    }
    { const a = tips[tips.length - 1], mx = (a[0] + root[0]) / 2, my = (a[1] + root[1]) / 2; ctx.quadraticCurveTo(mx + 14, my - 22, root[0], root[1]); }
    ctx.closePath();
    ctx.fillStyle = far ? 'rgba(70,12,10,.92)' : C.mem; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = OUT; ctx.stroke();
    // prosvítající žilky a světlo ohně skrz blánu
    ctx.save(); ctx.clip();
    if (!far) {
      const g = ctx.createRadialGradient(wr[0], wr[1], 10, wr[0], wr[1], 170 * fold);
      g.addColorStop(0, `rgba(255,${120 + heat * 80},40,${0.18 + heat * 0.35})`); g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = g; ctx.fillRect(-260, -260, 360, 320);
    }
    ctx.strokeStyle = far ? 'rgba(160,40,30,.35)' : 'rgba(255,140,90,.38)'; ctx.lineWidth = 1.1;
    tips.forEach((tp, i) => { for (let k = 1; k <= 2; k++) { const f = k / 3; ctx.beginPath(); ctx.moveTo(wr[0] + (tp[0] - wr[0]) * f, wr[1] + (tp[1] - wr[1]) * f); const nx = tips[Math.min(i + 1, tips.length - 1)]; ctx.quadraticCurveTo(lerp(tp[0], nx[0], 0.5) * f + wr[0] * (1 - f) + 6, lerp(tp[1], nx[1], 0.5) * f + wr[1] * (1 - f) + 6, wr[0] + (nx[0] - wr[0]) * f, wr[1] + (nx[1] - wr[1]) * f); ctx.stroke(); } });
    // díry a trhliny v bláně – stará bojová zranění
    if (!far) { ctx.beginPath(); ctx.ellipse(lerp(wr[0], tips[2][0], 0.62), lerp(wr[1], tips[2][1], 0.62), 6, 3.4, 0.6, 0, TAU); ctx.fillStyle = 'rgba(20,6,6,.55)'; ctx.fill(); }
    ctx.restore();
    // kosti křídla
    ctx.lineCap = 'round';
    const bone = (a, b, w) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineWidth = w + 2.4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = far ? '#3a0c0a' : C.sc2; ctx.stroke(); };
    bone([0, 0], el, 9); bone(el, wr, 7); tips.forEach((tp, i) => bone(wr, tp, 3.6 - i * 0.5));
    // dráp na zápěstí a kostěné hroty na koncích prstů
    ctx.save(); ctx.translate(wr[0], wr[1]); ctx.rotate(wa + 0.4);
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(4, -16, 14, -22); ctx.quadraticCurveTo(6, -10, 5, 2); ctx.closePath(); fs(ctx, C.horn, 1.4); ctx.restore();
    tips.forEach((tp, i) => { ctx.save(); ctx.translate(tp[0], tp[1]); ctx.rotate(FA[i]); ctx.beginPath(); ctx.moveTo(0, -2.4); ctx.lineTo(11, 0); ctx.lineTo(0, 2.4); ctx.closePath(); fs(ctx, C.horn2, 1); ctx.restore(); });
    ctx.restore();
  }

  /* ---------- tělo, ocas, krk (za hradem) ---------- */
  function spikes(ctx, pts, size, col) {
    for (let i = 1; i < pts.length - 1; i += 1) {
      const p = pts[i], q = pts[i + 1], a = Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI / 2, s = size * (p[2] || 1);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-s * 0.45, 0); ctx.quadraticCurveTo(-s * 0.1, -s * 0.7, s * 0.25, -s * 1.15); ctx.quadraticCurveTo(s * 0.2, -s * 0.4, s * 0.45, 0); ctx.closePath(); fs(ctx, col, 1.1);
      ctx.restore();
    }
  }
  function bez(p0, p1, p2, p3, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; }
  // trubice podél křivky (krk, ocas), šířka w0 → w1
  function tube(ctx, pts, w0, w1, fill, belly) {
    const L = [], R = [];
    pts.forEach((p, i) => {
      const q = pts[Math.min(i + 1, pts.length - 1)], r = pts[Math.max(i - 1, 0)];
      const dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (pts.length - 1)) / 2;
      L.push([p[0] - dy / d * w, p[1] + dx / d * w]); R.push([p[0] + dy / d * w, p[1] - dx / d * w]);
    });
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); L.forEach(p => ctx.lineTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); fs(ctx, fill, 2.2);
    if (belly) { ctx.beginPath(); L.forEach((p, i) => { const c = pts[i], x = lerp(c[0], p[0], 0.7), y = lerp(c[1], p[1], 0.7); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); for (let i = L.length - 1; i >= 0; i--) ctx.lineTo(L[i][0], L[i][1]); ctx.closePath(); ctx.fillStyle = belly; ctx.fill();
      ctx.strokeStyle = C.belly2; ctx.lineWidth = 1; for (let i = 1; i < L.length - 1; i++) { const c = pts[i], p = L[i]; ctx.beginPath(); ctx.moveTo(lerp(c[0], p[0], 0.7), lerp(c[1], p[1], 0.7)); ctx.lineTo(p[0], p[1]); ctx.stroke(); } }
    return { L, R };
  }
  function magma(ctx, pts, t, heat, seed) {
    const a = 0.45 + heat * 0.55 + Math.sin(t * 2.2 + seed) * 0.12;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,90,20,${a * 0.35})`; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,${150 + heat * 80},60,${a})`; ctx.stroke();
    ctx.restore();
  }

  function body(ctx, t, heat, rear) {
    const br = Math.sin(t * 1.4) * 1.8;
    // ocas – vine se dozadu, stočí se a končí ostnatým hrotem
    const sw = Math.sin(t * 0.9) * 16;
    const tail = bez([-40, 22], [-130, 30 + sw * 0.3], [-190, -30 + sw], [-150, -92 + sw * 0.6], 16);
    const tl = tube(ctx, tail, 34, 8, C.sc, C.belly);
    spikes(ctx, tail.filter((_, i) => i % 2 === 0).map(p => [p[0], p[1], 1]), 11, C.dark);
    const tip = tail[tail.length - 1], pre = tail[tail.length - 2], ta = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
    ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(ta);
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(4, -18, 26, 0); ctx.quadraticCurveTo(4, 18, -4, 0); ctx.closePath(); fs(ctx, C.horn2, 1.6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20, 0); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(80,40,20,.5)'; ctx.stroke(); ctx.restore();
    magma(ctx, tail.slice(2, 12).map((p, i) => [p[0] + Math.sin(i * 2.1) * 3, p[1] + Math.cos(i * 1.7) * 3]), t, heat, 1);
    // trup
    ctx.save(); ctx.rotate(-0.22 - rear * 0.18); ctx.scale(1, 1 + br * 0.006);
    ctx.beginPath(); ctx.ellipse(-6, 0, 62, 38, 0, 0, TAU); fs(ctx, C.sc, 2.4);
    ctx.beginPath(); ctx.ellipse(6, 14, 48, 20, 0.05, 0, Math.PI); ctx.fillStyle = C.belly; ctx.fill();
    ctx.strokeStyle = C.belly2; ctx.lineWidth = 1.2; for (let x = -30; x <= 46; x += 11) { ctx.beginPath(); ctx.moveTo(x, 14); ctx.quadraticCurveTo(x + 3, 26, x + 1, 33); ctx.stroke(); }
    // šupiny
    ctx.strokeStyle = C.sc3; ctx.lineWidth = 1.1;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const x = -48 + i * 14 + (r % 2) * 7, y = -24 + r * 11; ctx.beginPath(); ctx.arc(x, y, 5, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke(); }
    magma(ctx, [[-40, -6], [-26, -12], [-14, -4], [2, -14], [16, -8], [30, -18]], t, heat, 2);
    magma(ctx, [[-30, 8], [-18, 4], [-6, 10]], t, heat, 3);
    // hřbetní ostny
    spikes(ctx, [[-64, -6], [-52, -24], [-34, -34], [-14, -38], [6, -36], [26, -30], [44, -20]].map(p => [p[0], p[1], 1.25]), 16, C.dark);
    ctx.restore();
    // zadní tlapa s drápy zarytými do zdi
    ctx.save(); ctx.translate(-8, 30);
    ctx.beginPath(); ctx.moveTo(-18, -10); ctx.quadraticCurveTo(-26, 16, -10, 30); ctx.lineTo(16, 30); ctx.quadraticCurveTo(14, 6, 18, -8); ctx.closePath(); fs(ctx, C.sc2, 1.8);
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 7, 28); ctx.quadraticCurveTo(-4 + i * 7, 40, -10 + i * 7, 44); ctx.lineTo(-6 + i * 7, 30); ctx.closePath(); fs(ctx, C.horn, 1); }
    ctx.restore();
  }

  /* ---------- hlava (před hradem); tlama na (48, 2) jako u Art.dragonMouth ---------- */
  function head(ctx, t, jaw, fire, heat) {
    // koruna rohů
    const horn = (x, y, a, l, w, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -w); ctx.quadraticCurveTo(-l * 0.5, -w - l * 0.1, -l, -w * 0.2 - l * 0.32); ctx.quadraticCurveTo(-l * 0.55, w * 0.3, 0, w); ctx.closePath(); fs(ctx, col, 1.5);
      ctx.strokeStyle = 'rgba(90,60,30,.45)'; ctx.lineWidth = 1; for (let k = 1; k < 4; k++) { const f = k / 4; ctx.beginPath(); ctx.moveTo(-l * f, -w * (1 - f) - l * 0.12 * f); ctx.lineTo(-l * f + 2, w * (1 - f) * 0.7); ctx.stroke(); } ctx.restore(); };
    horn(6, -18, 0.55, 34, 5, C.horn2);
    horn(12, -20, 0.2, 46, 6, C.horn);
    horn(4, -10, -0.15, 26, 4.5, C.horn2);
    // zlatý kroužek na rohu
    ctx.save(); ctx.translate(12, -20); ctx.rotate(0.2); ctx.beginPath(); ctx.ellipse(-18, -7, 2.2, 6.2, 0.3, 0, TAU); fs(ctx, C.gold, 1); ctx.restore();
    // lícní blány (ploutve)
    const fr = Math.sin(t * 2) * 0.06 + heat * 0.15;
    ctx.save(); ctx.translate(4, 2); ctx.rotate(fr);
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-26, -20); ctx.quadraticCurveTo(-20, -8, -30, -2); ctx.quadraticCurveTo(-18, 2, -28, 12); ctx.quadraticCurveTo(-12, 10, 0, 8); ctx.closePath(); ctx.fillStyle = C.mem; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.strokeStyle = C.horn2; ctx.lineWidth = 1.4; [[-26, -20], [-30, -2], [-28, 12]].forEach(p => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
    ctx.restore();
    // vnitřek tlamy
    ctx.save(); ctx.translate(16, 3); ctx.rotate(jaw);
    ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(34, -6); ctx.lineTo(30, 2); ctx.lineTo(0, 4); ctx.closePath(); ctx.fillStyle = fire ? '#ff9a2a' : '#3a0a06'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(48, -4); ctx.lineTo(48, 2); ctx.lineTo(16, 6); ctx.closePath(); ctx.fillStyle = fire ? '#ffd27a' : '#3a0a06'; ctx.fill();
    // dolní čelist s vousy z ostnů
    ctx.save(); ctx.translate(16, 3); ctx.rotate(jaw);
    ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(30, -1); ctx.quadraticCurveTo(35, 0, 33, 4); ctx.lineTo(4, 12); ctx.quadraticCurveTo(-6, 11, -6, -1); ctx.closePath(); fs(ctx, C.sc2, 1.8);
    ctx.beginPath(); ctx.moveTo(2, 8); ctx.lineTo(28, 2); ctx.lineTo(26, 4.5); ctx.lineTo(4, 11); ctx.closePath(); ctx.fillStyle = C.belly; ctx.fill();
    for (let x = 6; x < 30; x += 5.5) { ctx.beginPath(); ctx.moveTo(x, -1); ctx.lineTo(x + 2, -5.5); ctx.lineTo(x + 4, -1); ctx.closePath(); fs(ctx, C.horn, 0.8); }
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-2 + i * 6, 10 - i); ctx.lineTo(-6 + i * 6, 20 - i * 1.5); ctx.lineTo(2 + i * 6, 9.5 - i); ctx.closePath(); fs(ctx, C.dark, 1); }
    ctx.restore();
    // lebka a čenich
    ctx.beginPath();
    ctx.moveTo(-4, -14); ctx.quadraticCurveTo(8, -26, 24, -20);
    ctx.lineTo(42, -12); ctx.quadraticCurveTo(52, -10, 50, -3);
    ctx.lineTo(34, -1); ctx.lineTo(16, 3); ctx.quadraticCurveTo(2, 11, -6, 8); ctx.quadraticCurveTo(-12, -4, -4, -14); ctx.closePath();
    fs(ctx, C.sc2, 2.2);
    ctx.beginPath(); ctx.moveTo(4, -18); ctx.quadraticCurveTo(22, -22, 46, -9); ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(255,170,130,.3)'; ctx.stroke();
    ctx.strokeStyle = C.sc3; ctx.lineWidth = 1.1;
    for (const [x, y] of [[0, -8], [6, -2], [10, -12], [16, -6], [26, -12], [33, -8], [40, -6]]) { ctx.beginPath(); ctx.arc(x, y, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    // nosní hrb s malými růžky
    for (const x of [36, 41]) { ctx.beginPath(); ctx.moveTo(x - 2.5, -11.5 + (x - 36) * 0.25); ctx.lineTo(x, -17 + (x - 36) * 0.3); ctx.lineTo(x + 2.5, -10.5 + (x - 36) * 0.25); ctx.closePath(); fs(ctx, C.horn2, 0.9); }
    // magmatické praskliny na lebce
    magma(ctx, [[-2, -6], [6, -10], [12, -4], [20, -8]], t, heat, 4);
    // zuby, tesák, nozdra
    for (let x = 20; x < 46; x += 6) { const d = (x - 20) * -0.08; ctx.beginPath(); ctx.moveTo(x, -1 + d); ctx.lineTo(x + 2, 4 + d); ctx.lineTo(x + 4, -1.6 + d); ctx.closePath(); fs(ctx, C.horn, 0.8); }
    ctx.beginPath(); ctx.moveTo(40, -3); ctx.lineTo(42, 7); ctx.lineTo(44, -3.5); ctx.closePath(); fs(ctx, C.horn, 1);
    ctx.beginPath(); ctx.ellipse(46, -7.5, 2.4, 1.5, -0.3, 0, TAU); ctx.fillStyle = fire ? '#ffb347' : C.dark; ctx.fill();
    // obočí a žhnoucí plazí oko
    ctx.beginPath(); ctx.moveTo(12, -20); ctx.quadraticCurveTo(24, -26, 32, -16); ctx.lineTo(27, -14); ctx.quadraticCurveTo(22, -19, 13, -16); ctx.closePath(); fs(ctx, C.dark, 1.2);
    const pulse = 0.75 + Math.sin(t * 3) * 0.25 + heat * 0.4;
    const gl = ctx.createRadialGradient(23, -12, 0.5, 23, -12, 14);
    gl.addColorStop(0, `rgba(255,220,90,${Math.min(1, 0.7 * pulse)})`); gl.addColorStop(1, 'rgba(255,140,30,0)');
    ctx.fillStyle = gl; ctx.fillRect(8, -27, 30, 30);
    ctx.beginPath(); ctx.ellipse(23, -12, 4.8, 3.1, -0.2, 0, TAU); fs(ctx, '#ffd23a', 1.2);
    const blink = (t % 5.3) < 0.12;
    ctx.beginPath(); ctx.ellipse(23.6, -12, 1, blink ? 0.3 : 2.7, 0, 0, TAU); ctx.fillStyle = '#2a0a04'; ctx.fill();
    // kouř z nozder, plamen z tlamy
    if (!fire) for (let i = 0; i < 4; i++) {
      const ph = ((t * 0.55 + i / 4) % 1), x = 48 + ph * 12 + Math.sin(t * 2 + i) * 2.5, y = -9 - ph * 30, r = 2 + ph * 7;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = `rgba(${90 + (i % 2) * 40},${80 + (i % 2) * 10},80,${0.42 * (1 - ph)})`; ctx.fill();
    }
    if (fire) for (let i = 0; i < 4; i++) {
      const L = 26 + i * 8 + Math.sin(t * 20 + i) * 4;
      ctx.beginPath(); ctx.moveTo(46, 0); ctx.quadraticCurveTo(46 + L * 0.5, -10 - i * 2, 46 + L, -2 + Math.sin(t * 17 + i) * 3); ctx.quadraticCurveTo(46 + L * 0.5, 12 + i * 2, 46, 6); ctx.closePath();
      ctx.fillStyle = ['rgba(255,90,20,.75)', 'rgba(255,150,40,.7)', 'rgba(255,210,90,.65)', 'rgba(255,245,200,.6)'][i]; ctx.fill();
    }
  }

  /* ---------- napojení na vykreslení hradu ---------- */
  const orig = Art.drawCastle;
  Art.drawCastle = function (ctx, img, front, groundY, facing, t, hpRatio, flagColor) {
    const dec = img && img.cfg && img.cfg.decor;
    if (!dec || !dec.drak || !img.dragonPt) return orig.apply(this, arguments);
    const BX = img.big || { S: 1, ox: 0, oy: 0 }, K = BX.S * 1.45, S = K * 0.78;
    const now = performance.now(), fire = !!(img._breathUntil && now < img._breathUntil);
    // plynulé vzepětí a rozžhavení (0..1)
    img._dragHeat = lerp(img._dragHeat || 0, fire ? 1 : 0, fire ? 0.12 : 0.03);
    const heat = img._dragHeat;
    const x0 = facing === 1 ? front - img.w + 2 : front - 2;
    const [hx, hy] = Art.castleWorldPt ? Art.castleWorldPt(img, front, groundY, facing, img.dragonPt) : [front, groundY - img.h * 0.7];
    // tělo sedí za hradem, nad vnitřní částí hradeb
    const bx = facing === 1 ? x0 + img.w * 0.42 : front - 2 + img.w * 0.58, by = groundY - img.h * 0.74 - heat * 14 * S;
    const sp = 0.42 + heat * 0.58 + Math.sin(t * 0.7) * 0.05;
    const flap = fire ? Math.sin(now / 1000 * 7) * 0.5 : Math.sin(t * 0.8) * 0.06;
    ctx.save(); ctx.translate(bx, by); ctx.scale(facing * S, S);
    // záře za drakem
    const g = ctx.createRadialGradient(0, -40, 10, 0, -40, 220);
    g.addColorStop(0, `rgba(255,90,30,${0.1 + heat * 0.25})`); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.fillRect(-240, -280, 480, 380);
    ctx.save(); ctx.translate(26, -24); wing(ctx, sp, flap, true, heat); ctx.restore();
    body(ctx, t, heat, heat);
    // krk: z trupu za věží až k hlavě
    const hl = [(hx - facing * 6 * K - bx) / (facing * S), (hy + 2 * K - by) / S];
    const neck = bez([34, -22], [70, -70 - heat * 20], [hl[0] - 60, hl[1] - 40], hl, 14);
    tube(ctx, neck, 34, 22, C.sc, C.belly);
    spikes(ctx, neck.map(p => [p[0], p[1], 0.95]), 12, C.dark);
    magma(ctx, neck.slice(2, 11).map((p, i) => [p[0] + Math.sin(i * 1.9) * 4, p[1] + 3 + Math.cos(i * 2.3) * 3]), t, heat, 5);
    ctx.save(); ctx.translate(-14, -30); wing(ctx, sp, flap, false, heat); ctx.restore();
    ctx.restore();
    // hrad (bez staré kamenné hlavy)
    dec.drak = false;
    try { orig.apply(this, arguments); } finally { dec.drak = true; }
    // přední tlapa přes cimbuří a hlava
    ctx.save(); ctx.translate(hx, hy); ctx.scale(facing * K, K);
    ctx.save(); ctx.translate(-16, 14);
    ctx.beginPath(); ctx.moveTo(-10, -12); ctx.quadraticCurveTo(-4, 6, 4, 14); ctx.lineTo(16, 12); ctx.quadraticCurveTo(10, 0, 6, -12); ctx.closePath(); fs(ctx, C.sc2, 1.6);
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(4 + i * 4.5, 13); ctx.quadraticCurveTo(8 + i * 4.5, 22, 3 + i * 4.5, 26); ctx.lineTo(7 + i * 4.5, 13); ctx.closePath(); fs(ctx, C.horn, 0.9); }
    ctx.restore();
    const jaw = fire ? 0.5 : 0.06 + Math.max(0, Math.sin(t * 0.9)) * 0.05;
    ctx.translate(heat * -2, -heat * 3); ctx.rotate(-heat * 0.06);
    head(ctx, t, jaw, fire, heat);
    ctx.restore();
    // žhavé uhlíky stoupající kolem draka
    for (let i = 0; i < 12; i++) {
      const ph = (t * (0.22 + (i % 4) * 0.05) + i * 0.137) % 1, ex = bx + facing * S * (-120 + ((i * 53) % 240)) + Math.sin(t * 2 + i) * 6, ey = by + 30 * S - ph * 200 * S;
      ctx.beginPath(); ctx.arc(ex, ey, (1.4 + (i % 3) * 0.6) * S, 0, TAU); ctx.fillStyle = `rgba(255,${150 + (i % 3) * 40},60,${(0.25 + heat * 0.5) * (1 - ph)})`; ctx.fill();
    }
  };
})();
