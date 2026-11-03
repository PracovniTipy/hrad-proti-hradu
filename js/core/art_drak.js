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

  /* ---------- napojení: drak sedí ~30 m před hradem, přikovaný řetězem; hýbe se jen krkem ---------- */
  const HS = 0.95;
  function pose(img, front, groundY, facing, t, heat) {
    const BX = img.big || { S: 1 }, S = BX.S * 0.9;
    const x = front + facing * 300;              // 300 px = 30 m (dosah útoků se ukazuje jako px/10)
    const y = groundY - 46;                       // stojí v pozadí za cestou, vojáci chodí před ním
    // hlava na konci krku: v klidu se rozhlíží, při chrlení se natáhne k nepřátelům
    const sw = Math.sin(t * 0.7), sw2 = Math.sin(t * 1.3 + 1);
    const hx = lerp(92 + sw * 10, 128, heat), hy = lerp(-128 + sw2 * 9 - Math.max(0, Math.sin(t * 0.23)) * 14, -112, heat);
    const tilt = lerp(sw * 0.08 - 0.05, 0.22, heat);
    return { x, y, S, hx, hy, tilt };
  }
  function mouthOf(P, facing) {
    const mx = 48 * HS, my = 2 * HS, c = Math.cos(P.tilt), s = Math.sin(P.tilt);
    return [P.x + facing * P.S * (P.hx + mx * c - my * s), P.y + P.S * (P.hy + mx * s + my * c)];
  }
  const origMouth = Art.dragonMouth;
  Art.dragonMouth = function (img, front, groundY, facing) {
    if (!img || !img.cfg || !img.cfg.decor || !img.cfg.decor.drak) return origMouth ? origMouth.apply(this, arguments) : null;
    return mouthOf(pose(img, front, groundY, facing, performance.now() / 1000, 1), facing);
  };
  function chain(ctx, a, b, sag, t) {
    // články řetězu po prověšené křivce
    const cx = (a[0] + b[0]) / 2, cy = Math.max(a[1], b[1]) + sag;
    const n = Math.max(6, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 7));
    for (let i = 0; i <= n; i++) {
      const k = i / n, u = 1 - k;
      const x = u * u * a[0] + 2 * u * k * cx + k * k * b[0], y = u * u * a[1] + 2 * u * k * cy + k * k * b[1];
      const k2 = Math.min(1, k + 0.01), u2 = 1 - k2;
      const ang = Math.atan2((u2 * u2 * a[1] + 2 * u2 * k2 * cy + k2 * k2 * b[1]) - y, (u2 * u2 * a[0] + 2 * u2 * k2 * cx + k2 * k2 * b[0]) - x);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.beginPath(); if (i % 2) ctx.ellipse(0, 0, 4.6, 1.5, 0, 0, TAU); else ctx.ellipse(0, 0, 4.6, 2.8, 0, 0, TAU);
      ctx.lineWidth = 3.4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 1.8; ctx.strokeStyle = i % 2 ? '#7a7f88' : '#a4a9b2'; ctx.stroke();
      ctx.restore();
    }
  }
  function chained(ctx, P, t, heat, fire, part) {
    const stake = [-128, -4];
    if (part !== 'dyn') {
    // spálená zem, kosti a kolík v zemi
    ctx.beginPath(); ctx.ellipse(10, 2, 150, 16, 0, 0, TAU); ctx.fillStyle = 'rgba(40,24,16,.35)'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, 2, 105, 10, 0, 0, TAU); ctx.fillStyle = 'rgba(20,12,8,.35)'; ctx.fill();
    const bone = (x, y, a, l) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.rect(-l / 2, -1.6, l, 3.2); fs(ctx, C.horn, 1); [-l / 2, l / 2].forEach(e => { ctx.beginPath(); ctx.arc(e, -1.8, 2.4, 0, TAU); ctx.arc(e, 1.8, 2.4, 0, TAU); fs(ctx, C.horn, 1); }); ctx.restore(); };
    bone(120, 2, 0.3, 22); bone(-118, 4, -0.5, 18); bone(140, 6, -1.2, 14);
    ctx.save(); ctx.translate(150, 4); ctx.beginPath(); ctx.arc(0, -6, 9, Math.PI, 0); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.closePath(); fs(ctx, '#e8dcbc', 1.2);
    ctx.beginPath(); ctx.arc(-3.5, -6, 2.2, 0, TAU); ctx.arc(3.5, -6, 2.2, 0, TAU); ctx.fillStyle = '#2a1a10'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(stake[0] - 6, 4); ctx.lineTo(stake[0] - 4, -22); ctx.lineTo(stake[0] + 4, -22); ctx.lineTo(stake[0] + 6, 4); ctx.closePath(); fs(ctx, '#4a4e56', 1.8);
    ctx.beginPath(); ctx.rect(stake[0] - 8, -26, 16, 6); fs(ctx, '#6a6f78', 1.6);
    ctx.beginPath(); ctx.arc(stake[0], -30, 6, 0, TAU); ctx.lineWidth = 4.5; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = '#8a8f98'; ctx.stroke();
    // složené křídlo za tělem
    ctx.save(); ctx.translate(14, -96); wing(ctx, 0.2, -1.2 + Math.sin(t * 0.6) * 0.04, true, heat); ctx.restore();
    // tělo s ocasem a zadní tlapou (sedí na zemi)
    ctx.save(); ctx.translate(0, -70); body(ctx, t, heat, 0); ctx.restore();
    // pouto na zadní noze a řetěz ke kolíku
    ctx.beginPath(); ctx.rect(-22, -18, 22, 7); fs(ctx, '#6a6f78', 1.6);
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(-18 + k * 7, -14.5, 1.3, 0, TAU); ctx.fillStyle = '#c8ccd2'; ctx.fill(); }
    chain(ctx, [-22, -14], [stake[0] + 2, -28], 14, t);
    // přední tlapa opřená o zem
    ctx.save(); ctx.translate(34, -40);
    ctx.beginPath(); ctx.moveTo(-10, -14); ctx.quadraticCurveTo(-12, 14, -4, 34); ctx.lineTo(14, 36); ctx.quadraticCurveTo(10, 10, 12, -14); ctx.closePath(); fs(ctx, C.sc2, 1.8);
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-2 + k * 5, 34); ctx.quadraticCurveTo(4 + k * 5, 38, 2 + k * 5, 42); ctx.lineTo(4 + k * 5, 34); ctx.closePath(); fs(ctx, C.horn, 0.9); }
    ctx.restore();
    if (part === 'static') return;
    }
    // blízké složené křídlo přitisknuté k boku (při chrlení se lehce pootevře)
    ctx.save(); ctx.translate(-4, -98); wing(ctx, 0.18 + heat * 0.25, -1.5 + heat * 0.5 + Math.sin(t * 0.6) * 0.04, false, heat); ctx.restore();
    // krk od ramen k hlavě
    const base = [38, -78], H = [P.hx - 4, P.hy + 6];
    const neck = bez(base, [62, -96 - heat * 6], [H[0] - 30, H[1] + 14], H, 12);
    tube(ctx, neck, 34, 21, C.sc, C.belly);
    spikes(ctx, neck.map(p => [p[0], p[1], 0.9]), 11, C.dark);
    magma(ctx, neck.slice(2, 10).map((p, i) => [p[0] + Math.sin(i * 1.9) * 3, p[1] + 2 + Math.cos(i * 2.3) * 2]), t, heat, 5);
    // ostnatý obojek na krku a hlavní řetěz ke kolíku – napne se, když se drak natáhne
    const cp = neck[5], cq = neck[6], ca = Math.atan2(cq[1] - cp[1], cq[0] - cp[0]);
    chain(ctx, [cp[0] - 4, cp[1] + 6], [stake[0] + 4, -32], lerp(40, 6, heat), t);
    ctx.save(); ctx.translate(cp[0], cp[1]); ctx.rotate(ca + Math.PI / 2);
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 5.5, 0, 0, TAU); fs(ctx, '#5a5f68', 2);
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 6.5 - 2.4, -4); ctx.lineTo(k * 6.5, -11); ctx.lineTo(k * 6.5 + 2.4, -4); ctx.closePath(); fs(ctx, '#b8bcc4', 1); }
    ctx.beginPath(); ctx.arc(0, 6, 4, 0, TAU); ctx.lineWidth = 3.6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#a4a9b2'; ctx.stroke();
    ctx.restore();
    // hlava
    ctx.save(); ctx.translate(P.hx, P.hy); ctx.rotate(P.tilt); ctx.scale(HS, HS);
    head(ctx, t, fire ? 0.5 : 0.08 + Math.max(0, Math.sin(t * 0.9)) * 0.06, fire, heat);
    ctx.restore();
  }
  const orig = Art.drawCastle;
  Art.drawCastle = function (ctx, img, front, groundY, facing, t, hpRatio, flagColor) {
    const dec = img && img.cfg && img.cfg.decor;
    if (!dec || !dec.drak) return orig.apply(this, arguments);
    const now = performance.now(), fire = !!(img._breathUntil && now < img._breathUntil);
    img._dragHeat = lerp(img._dragHeat || 0, fire ? 1 : 0, fire ? 0.16 : 0.03);
    const heat = img._dragHeat, tt = now / 1000;
    // drak jen na bojišti (ne v náhledu hradu v editoru)
    if (!(front > 0 && groundY > 0)) return orig.apply(this, arguments);
    dec.drak = false;   // hrad bez staré kamenné hlavy na zdi
    try { orig.apply(this, arguments); } finally { dec.drak = true; }
    const P = pose(img, front, groundY, facing, tt, heat);
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(facing * P.S, P.S);
    const g = ctx.createRadialGradient(60, -80, 10, 60, -80, 170);
    g.addColorStop(0, `rgba(255,90,30,${0.06 + heat * 0.22})`); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.fillRect(-120, -250, 360, 280);
    // nehybné tělo se kreslí jen jednou do obrázku (plynulost), živý je jen krk, hlava a křídlo
    if (!img._dragStatic) {
      const R = 2.2, X0 = -240, Y0 = -280, W = 450, H = 320, cv = document.createElement('canvas');
      cv.width = Math.round(W * R * P.S); cv.height = Math.round(H * R * P.S);
      const c2 = cv.getContext('2d'); c2.scale(R * P.S, R * P.S); c2.translate(-X0, -Y0);
      chained(c2, P, 0, 0, false, 'static');
      img._dragStatic = { cv, X0, Y0, W, H };
    }
    const DS = img._dragStatic; ctx.drawImage(DS.cv, DS.X0, DS.Y0, DS.W, DS.H);
    chained(ctx, P, tt, heat, fire, 'dyn');
    ctx.restore();
    for (let i = 0; i < 8; i++) {
      const ph = (tt * (0.22 + (i % 4) * 0.05) + i * 0.137) % 1, ex = P.x + facing * P.S * (-60 + ((i * 53) % 180)) + Math.sin(tt * 2 + i) * 4, ey = P.y - 60 * P.S - ph * 120 * P.S;
      ctx.beginPath(); ctx.arc(ex, ey, (1.2 + (i % 3) * 0.5) * P.S, 0, TAU); ctx.fillStyle = `rgba(255,${150 + (i % 3) * 40},60,${(0.2 + heat * 0.5) * (1 - ph)})`; ctx.fill();
    }
  };
})();
