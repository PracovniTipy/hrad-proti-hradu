/* =========================================================================
   VFX PLUS – propracované efekty speciálních útoků
   Rozšiřuje VFX (vfx.js) a doplňuje k útokům vrstvy navíc:
   - fraktálové blesky s větvemi, opakovaným zábleskem a elektrickými
     výboji po zemi; řetězový blesk skutečně přeskakuje mezi vojáky
   - bouřkové nebe s deštěm, magické runové kruhy, sluneční paprsky,
     praskliny s lávou, tlakové vlny prachu, sněžení a mrazivá zem,
     bubliny štítu, aury síly a kletby, trosky ve vichřici
   Vše se kreslí ve světových souřadnicích; respektuje „Úsporu baterie“.
   ========================================================================= */
(function () {
  if (!window.VFX) return;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const V = VFX.prototype;
  const lite = () => !!(window.Volby && Volby.on('saver'));
  const q = n => Math.max(1, Math.round(n * (lite() ? 0.5 : 1)));

  /* ---------- sprity ---------- */
  const cache = {};
  function glow(color) {
    if (cache[color]) return cache[color];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, color); gr.addColorStop(0.3, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (cache[color] = c);
  }
  const dustSprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(150,126,96,.75)'); gr.addColorStop(0.6, 'rgba(130,110,84,.35)'); gr.addColorStop(1, 'rgba(120,100,80,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  })();

  /* ---------- fraktálová cesta blesku (posun středního bodu) ---------- */
  function boltPath(x0, y0, x1, y1, disp, minLen) {
    const pts = [[x0, y0], [x1, y1]];
    let d = disp;
    for (let it = 0; it < 7; it++) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len > minLen) {
          const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len, o = rnd(-d, d);
          out.push([(a[0] + b[0]) / 2 + nx * o, (a[1] + b[1]) / 2 + ny * o]);
        }
        out.push(b);
      }
      pts.length = 0; pts.push(...out); d *= 0.55;
    }
    return pts;
  }
  function branches(main, n, depth) {
    const res = [];
    for (let b = 0; b < n; b++) {
      const i = 2 + Math.floor(Math.random() * (main.length * 0.7)), s = main[Math.min(i, main.length - 2)];
      const dirX = Math.random() < 0.5 ? -1 : 1, len = rnd(60, 150) / (depth + 1);
      const ex = s[0] + dirX * len * rnd(0.6, 1.1), ey = s[1] + len * rnd(0.7, 1.3);
      const p = boltPath(s[0], s[1], ex, ey, len * 0.35, 7);
      res.push({ p, w: 0.55 / (depth + 1) });
      if (depth < 1 && Math.random() < 0.6) branches(p, 1, depth + 1).forEach(x => res.push(x));
    }
    return res;
  }
  function strokePath(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.stroke(); }

  /* ---------- nové efekty ---------- */
  /* blesk z nebe: fraktál, větve, 2–3 opakované záblesky, výboje po zemi */
  V.lightning = function (x, yTop, y) {
    const sx = x + rnd(-90, 90);
    const mk = () => { const m = boltPath(sx, yTop, x, y, 70, 9); return { m, br: branches(m, lite() ? 2 : 4, 0) }; };
    this.fx.push({ k: 'bolt2', x, y, yTop, sx, cur: mk(), mk, t: 0, life: 0.6, next: 0.08, strikes: 0 });
    this.fx.push({ k: 'skyglow', x: sx, y: yTop + 10, t: 0, life: 0.5 });
    this.fx.push({ k: 'garc', x, y, t: 0, life: 0.55, n: lite() ? 4 : 7 });
    this.fx.push({ k: 'scorch', x, y: y + 4, s: 46, t: 0, life: 3.5, c: 'rgba(30,24,50,.5)' });
    this.fx.push({ k: 'ring', x, y: y + 4, s: 120, t: 0, life: 0.45, c: '#bfb4ff' });
    for (let i = 0; i < q(26); i++) { const a = rnd(-Math.PI, 0), sp = rnd(160, 560); this.spark(x, y - 6, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.25, 0.6), rnd(3, 6), i % 3 ? '#e8e4ff' : '#9fd8ff', 700); }
    this.fx.push({ k: 'boom', x, y, s: 60, t: 0, life: 0.35, pal: ['#ffffff', '#efeaff', '#a99cff', '#4a3aa8'] });
  };
  /* elektrický oblouk mezi dvěma body (řetězový blesk) */
  V.arc = function (pts) {
    const a = pts[0], b = pts[pts.length - 1];
    this.fx.push({ k: 'arc', a, b, t: 0, life: 0.45, p: boltPath(a[0], a[1], b[0], b[1], 30, 6) });
    for (let i = 0; i < q(8); i++) this.spark(b[0], b[1], rnd(-160, 160), rnd(-200, 40), rnd(0.2, 0.45), rnd(3, 5), '#dff4ff', 500);
  };
  /* bouřkové nebe s deštěm přes celé bojiště */
  V.stormSky = function (x0, w, yTop, h, dur) { this.fx.push({ k: 'sky', x0, w, yTop, h, t: 0, life: dur, acc: 0, fl: 0 }); };
  /* magický runový kruh na zemi */
  V.rune = function (x, y, r, color, life, spin) { this.fx.push({ k: 'rune', x, y, r, c: color, t: 0, life: life || 1.4, spin: spin || 1, seed: Math.random() * 10 }); };
  /* sluneční paprsky z nebe */
  V.rays = function (x, y, color, life) { this.fx.push({ k: 'rays', x, y, c: color, t: 0, life: life || 1.6, n: lite() ? 5 : 9, seed: Math.random() * 10 }); };
  /* tlaková vlna prachu po zemi */
  V.dust = function (x, y, s) {
    this.fx.push({ k: 'dring', x, y, s, t: 0, life: 0.8 });
    for (let i = 0; i < q(14); i++) { const a = rnd(0, TAU); this.p.push({ k: 'dust', x: x + Math.cos(a) * s * 0.3, y: y + Math.sin(a) * s * 0.08, vx: Math.cos(a) * rnd(120, 260) * s / 120, vy: Math.sin(a) * rnd(10, 40) - rnd(10, 40), t: 0, life: rnd(0.9, 1.6), s: rnd(s * 0.25, s * 0.45) }); }
  };
  /* praskliny země s rozžhaveným jádrem */
  V.crack = function (x, y, len, life) {
    const segs = [];
    for (const d of [-1, 1]) {
      let px = x, py = y; const p = [[px, py]];
      for (let i = 0; i < 8; i++) { px += d * rnd(len / 14, len / 9); py += rnd(-8, 8); p.push([px, py]); if (Math.random() < 0.35) segs.push({ p: [[px, py], [px + d * rnd(12, 28), py + rnd(-7, 7)]], w: 0.55 }); }
      segs.push({ p, w: 1 });
    }
    this.fx.push({ k: 'crack', x, y, segs, t: 0, life: life || 2.6 });
    for (let i = 0; i < q(10); i++) this.spark(x + rnd(-len / 2, len / 2), y, rnd(-20, 20), rnd(-160, -60), rnd(0.6, 1.1), rnd(3, 5), '#ff9a3a', 120);
  };
  /* sněžení + zamrzlá zem */
  V.snow = function (x, y, w, dur) {
    this.fx.push({ k: 'frost', x, y, w, t: 0, life: dur + 0.6 });
    this.fx.push({ k: 'snowfall', x, y, w, t: 0, life: dur, acc: 0 });
  };
  /* bublina štítu kolem vojáka (sleduje ho) */
  V.bubble = function (u, dur) { this.fx.push({ k: 'bubble', u, t: 0, life: dur, ph: Math.random() * TAU }); };
  /* aura (síla / kletba) – plamínky kolem vojáka */
  V.aura = function (u, dur, pal) { this.fx.push({ k: 'aura', u, t: 0, life: dur, pal, acc: Math.random() * 0.1 }); };

  /* ---------- silnější verze stávajících efektů ---------- */
  const oldExplosion = V.explosion;
  V.explosion = function (x, y, size, kind) {
    oldExplosion.call(this, x, y, size, kind);
    if (size >= 150 && (kind === 'fire' || kind === 'stone' || !kind)) {   // obří meteor / velký výbuch
      this.dust(x, y + 6, size);
      this.crack(x, y + 4, size * 1.6, 3.2);
      this.fx.push({ k: 'ring', x, y, s: size * 2.6, t: 0, life: 0.7, c: '#ffcf7a' });
      for (let i = 0; i < q(22); i++) { const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05), sp = rnd(300, 760); this.spark(x, y - 20, Math.cos(a) * sp, Math.sin(a) * sp, rnd(1, 1.8), rnd(3, 6), '#ffb24a', 900); }
    } else if (size >= 90 && kind === 'stone') this.dust(x, y + 4, size * 0.8);
    if (kind === 'holy' && size >= 120) { this.rays(x, y, 'rgba(255,240,190,.55)', 1.5); this.rune(x, y + 4, size * 1.1, '#ffe08a', 1.5, 1); }
    if (kind === 'poison' && size >= 60) this.rune(x, y + 4, size * 1.2, '#8aff5a', 2.2, -0.6);
  };
  const oldIce = V.iceSpikes;
  V.iceSpikes = function (x, y, w, dur) {
    oldIce.call(this, x, y, w, dur);
    if (w >= 160) { this.snow(x, y, w * 1.3, dur); this.rune(x, y + 6, w * 0.62, '#bfeaff', dur + 0.3, 0.7); }
  };
  const oldPillar = V.pillar;
  V.pillar = function (x, y, w, color, life) {
    oldPillar.call(this, x, y, w, color, life);
    if (w >= 100) this.rays(x, y, color, (life || 1.2) + 0.3);
  };

  /* ---------- update ---------- */
  const oldUpdate = V.update;
  V.update = function (dt) {
    for (const f of this.fx) {
      if (f.k === 'bolt2') { f.next -= dt; if (f.next <= 0 && f.strikes < 2 && f.t < f.life - 0.15) { f.cur = f.mk(); f.strikes++; f.next = rnd(0.08, 0.14); f.flash = 1; } f.flash = Math.max(0, (f.flash || 0) - dt * 8); }
      if (f.k === 'arc' && Math.random() < 0.5) f.p = boltPath(f.a[0], f.a[1], f.b[0], f.b[1], 30, 6);
      if (f.k === 'sky') {
        f.acc += dt; const rate = lite() ? 0.03 : 0.012;
        while (f.acc > rate) { f.acc -= rate; if (this.p.length < 900) this.p.push({ k: 'rain', x: f.x0 + Math.random() * f.w, y: f.yTop + rnd(-20, f.h * 0.4), vx: -120, vy: rnd(1100, 1500), t: 0, life: rnd(0.45, 0.8), s: rnd(14, 26) }); }
        f.fl = Math.max(0, f.fl - dt * 4); if (Math.random() < dt * 1.6) f.fl = 1;
      }
      if (f.k === 'snowfall' && f.t < f.life) {
        f.acc += dt; const rate = lite() ? 0.05 : 0.022;
        while (f.acc > rate) { f.acc -= rate; if (this.p.length < 900) this.p.push({ k: 'flake', x: f.x + rnd(-f.w / 2, f.w / 2), y: f.y - rnd(180, 340), vx: rnd(-20, 20), vy: rnd(70, 130), t: 0, life: rnd(1.6, 2.6), s: rnd(3, 6), ph: Math.random() * TAU, rot: Math.random() * TAU }); }
      }
      if (f.k === 'aura' && f.u && !f.u.dead && f.t < f.life) {
        f.acc += dt; while (f.acc > 0.12) { f.acc -= 0.12; this.spark(f.u.x + rnd(-14, 14), f.u.y - rnd(0, 20), rnd(-8, 8), rnd(-110, -60), rnd(0.4, 0.7), rnd(3, 6), f.pal[Math.random() < 0.5 ? 1 : 2], 0); }
      }
    }
    for (const p of this.p) if (p.k === 'flake') { p.vx += Math.sin(p.t * 3 + p.ph) * 30 * dt; p.rot += dt * 2; }
    oldUpdate.call(this, dt);
    for (const p of this.p) if (p.k === 'dust') { p.vx *= 0.95; p.vy *= 0.95; }
  };

  /* ---------- kreslení: pod vojáky ---------- */
  const oldBack = V.drawBack;
  V.drawBack = function (ctx) {
    oldBack.call(this, ctx);
    for (const f of this.fx) {
      if (f.t < 0) continue;
      const k = f.t / f.life, a = 1 - k;
      if (f.k === 'frost') {
        const s = Math.min(1, f.t / 0.3), al = Math.min(1, (f.life - f.t) / 0.6);
        ctx.save(); ctx.globalAlpha = 0.55 * al;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.w * 0.55 * s);
        g.addColorStop(0, 'rgba(235,250,255,.95)'); g.addColorStop(0.6, 'rgba(170,220,255,.6)'); g.addColorStop(1, 'rgba(150,210,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.w * 0.55 * s, f.w * 0.13 * s, 0, 0, TAU); ctx.fill();
        // krystalky ledu po zemi
        ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6;
        for (let i = 0; i < 14; i++) { const an = i * 2.4, r = (0.2 + (i % 5) * 0.16) * f.w * 0.5 * s, cx = f.x + Math.cos(an) * r, cy = f.y + Math.sin(an) * r * 0.24; ctx.beginPath(); for (let j = 0; j < 3; j++) { const b = j * Math.PI / 3; ctx.moveTo(cx - Math.cos(b) * 5, cy - Math.sin(b) * 2.2); ctx.lineTo(cx + Math.cos(b) * 5, cy + Math.sin(b) * 2.2); } ctx.stroke(); }
        ctx.restore();
      }
      if (f.k === 'crack') {
        const al = Math.min(1, (f.life - f.t) / 0.8), grow = Math.min(1, f.t / 0.18);
        ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        for (const sg of f.segs) {
          const n = Math.max(2, Math.ceil(sg.p.length * grow)), p = sg.p.slice(0, n);
          ctx.globalAlpha = al * 0.9; ctx.strokeStyle = '#140a04'; ctx.lineWidth = 6 * sg.w; strokePath(ctx, p);
          ctx.globalCompositeOperation = 'lighter'; const pu = 0.75 + 0.25 * Math.sin(f.t * 9);
          ctx.globalAlpha = al * pu * 0.6; ctx.strokeStyle = '#ff5a10'; ctx.lineWidth = 9 * sg.w; strokePath(ctx, p);
          ctx.globalAlpha = al * pu; ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 2.6 * sg.w; strokePath(ctx, p);
          ctx.strokeStyle = '#fff2c0'; ctx.lineWidth = 1 * sg.w; strokePath(ctx, p);
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.restore();
      }
      if (f.k === 'rune') {
        const grow = Math.min(1, f.t / 0.25), al = Math.min(1, (f.life - f.t) / 0.45), r = f.r * (0.7 + 0.3 * grow), rot = f.t * f.spin * 1.4;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.9;
        ctx.drawImage(glow(f.c), f.x - r * 1.1, f.y - r * 0.3, r * 2.2, r * 0.6);
        ctx.strokeStyle = f.c; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, r, r * 0.28, 0, 0, TAU); ctx.stroke();
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(f.x, f.y, r * 0.8, r * 0.224, 0, 0, TAU); ctx.stroke();
        // runy mezi kruhy
        for (let i = 0; i < 12; i++) {
          const an = rot + i * TAU / 12, cx = f.x + Math.cos(an) * r * 0.9, cy = f.y + Math.sin(an) * r * 0.252, s = r * 0.045 + 3;
          ctx.beginPath();
          const t = (i + Math.floor(f.seed)) % 4;
          if (t === 0) { ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy); ctx.moveTo(cx, cy - s * 0.5); ctx.lineTo(cx, cy + s * 0.5); }
          else if (t === 1) { ctx.moveTo(cx - s, cy + s * 0.4); ctx.lineTo(cx, cy - s * 0.4); ctx.lineTo(cx + s, cy + s * 0.4); }
          else if (t === 2) { ctx.ellipse(cx, cy, s * 0.7, s * 0.3, 0, 0, TAU); }
          else { ctx.moveTo(cx - s, cy - s * 0.4); ctx.lineTo(cx + s, cy + s * 0.4); ctx.moveTo(cx + s, cy - s * 0.4); ctx.lineTo(cx - s, cy + s * 0.4); }
          ctx.stroke();
        }
        // hvězda uvnitř
        ctx.lineWidth = 1.4; ctx.beginPath();
        for (let i = 0; i <= 5; i++) { const an = -rot * 0.7 + i * TAU * 2 / 5, px = f.x + Math.cos(an) * r * 0.74, py = f.y + Math.sin(an) * r * 0.207; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
        ctx.restore();
      }
      if (f.k === 'dring') {
        ctx.save(); ctx.globalAlpha = a * 0.7; ctx.lineWidth = 14 * a + 3; ctx.strokeStyle = 'rgba(170,145,110,.8)';
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.s * (0.3 + k * 1.6), f.s * 0.22 * (0.3 + k * 1.6), 0, 0, TAU); ctx.stroke(); ctx.restore();
      }
    }
  };

  /* ---------- kreslení: nad vojáky ---------- */
  const oldFront = V.drawFront;
  V.drawFront = function (ctx, time) {
    // bouřkové nebe (pod ostatními efekty)
    for (const f of this.fx) {
      if (f.k !== 'sky') continue;
      const inA = Math.min(1, f.t / 0.5), outA = Math.min(1, (f.life - f.t) / 0.8), al = inA * outA;
      ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      // valící se bouřkové mraky (měkké, bez ostrých hran)
      const n = Math.max(6, Math.round(f.w / 160));
      for (let i = 0; i < n; i++) {
        const cx = f.x0 + ((i / n + time * 0.015 + (i % 3) * 0.04) % 1) * f.w, cy = f.yTop + 30 + (i % 3) * 30, s = 190 + (i % 4) * 50;
        ctx.globalAlpha = 0.7 * al; ctx.drawImage(glow('rgba(30,26,58,.95)'), cx - s, cy - s * 0.45, s * 2, s * 0.9);
      }
      if (f.fl > 0) {   // záblesk uvnitř mraků
        ctx.globalCompositeOperation = 'lighter';
        const cx = f.x0 + ((Math.floor(time * 3) * 0.37) % 1) * f.w, s = 320;
        ctx.globalAlpha = f.fl * 0.8 * al; ctx.drawImage(glow('rgba(170,160,255,.9)'), cx - s, f.yTop - s * 0.2, s * 2, s * 0.9);
      }
      ctx.restore();
    }
    // prach a déšť
    for (const p of this.p) {
      if (p.k === 'dust') { const k = p.t / p.life, s = p.s * (0.7 + k * 1.2); ctx.globalAlpha = (1 - k) * 0.7; ctx.drawImage(dustSprite, p.x - s, p.y - s * 0.7, s * 2, s * 1.4); }
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.strokeStyle = 'rgba(190,205,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (const p of this.p) if (p.k === 'rain') { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 0.02, p.y - p.s); }
    ctx.stroke(); ctx.restore();

    oldFront.call(this, ctx, time);

    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // sněhové vločky
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4;
    for (const p of this.p) {
      if (p.k !== 'flake') continue;
      const k = p.t / p.life; ctx.globalAlpha = Math.min(1, (1 - k) * 2);
      ctx.beginPath(); for (let j = 0; j < 3; j++) { const b = p.rot + j * Math.PI / 3; ctx.moveTo(p.x - Math.cos(b) * p.s, p.y - Math.sin(b) * p.s); ctx.lineTo(p.x + Math.cos(b) * p.s, p.y + Math.sin(b) * p.s); } ctx.stroke();
    }
    // bubliny štítu
    for (const f of this.fx) {
      if (f.k !== 'bubble' || !f.u || f.u.dead) continue;
      const inA = Math.min(1, f.t / 0.25), outA = Math.min(1, (f.life - f.t) / 0.4), al = inA * outA;
      const x = f.u.x, y = f.u.y - 44, r = 40 + Math.sin(time * 3 + f.ph) * 1.5;
      ctx.globalAlpha = al * 0.22; ctx.fillStyle = '#8fd0ff'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.8, r, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = al * 0.85; ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 2; ctx.stroke();
      // šestiúhelníková síť – jen pár buněk, ať je přehledné
      ctx.globalAlpha = al * (0.25 + 0.2 * Math.sin(time * 5 + f.ph)); ctx.lineWidth = 1;
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = i * TAU / 6 + time * 0.4, hx = x + Math.cos(an) * r * 0.42, hy = y + Math.sin(an) * r * 0.55; for (let j = 0; j <= 6; j++) { const b = j * TAU / 6, px = hx + Math.cos(b) * 8, py = hy + Math.sin(b) * 8; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } } ctx.stroke();
      ctx.globalAlpha = al * 0.9; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.55, 6, 3, -0.6, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.restore();

    // aditivní: blesky, oblouky, paprsky, záře
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const f of this.fx) {
      if (f.t < 0) continue;
      const k = f.t / f.life, a = 1 - k;
      if (f.k === 'skyglow') { const s = 260 * (0.6 + k); ctx.globalAlpha = a * 0.8; ctx.drawImage(glow('rgba(170,150,255,.9)'), f.x - s, f.y - s * 0.5, s * 2, s); }
      if (f.k === 'rays') {
        const al = Math.sin(Math.min(1, k * 1.1) * Math.PI);
        for (let i = 0; i < f.n; i++) {
          const sp = (i - (f.n - 1) / 2) * 0.09 + Math.sin(time * 0.8 + f.seed + i) * 0.02, top = f.y - 900, w = 18 + (i % 3) * 10;
          const tx = f.x + Math.tan(sp) * 900;
          const g = ctx.createLinearGradient(0, top, 0, f.y);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, f.c); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = al * 0.55; ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(tx - w * 2, top); ctx.lineTo(tx + w * 2, top); ctx.lineTo(f.x + w * 0.3, f.y); ctx.lineTo(f.x - w * 0.3, f.y); ctx.closePath(); ctx.fill();
        }
      }
      if (f.k === 'garc') {
        for (let i = 0; i < f.n; i++) {
          const an = i * TAU / f.n + Math.random() * 0.4, len = rnd(50, 110) * (0.6 + a * 0.4);
          const p = boltPath(f.x, f.y, f.x + Math.cos(an) * len, f.y + Math.sin(an) * len * 0.25, 10, 5);
          ctx.globalAlpha = a * 0.5; ctx.strokeStyle = '#7f6aff'; ctx.lineWidth = 6; strokePath(ctx, p);
          ctx.globalAlpha = a; ctx.strokeStyle = '#eef0ff'; ctx.lineWidth = 1.8; strokePath(ctx, p);
        }
      }
      if (f.k === 'bolt2' || f.k === 'arc') {
        const flick = f.k === 'bolt2' ? (0.75 + 0.25 * Math.random()) * (1 + (f.flash || 0) * 0.5) : 0.7 + 0.3 * Math.random();
        const main = f.k === 'bolt2' ? f.cur.m : f.p, br = f.k === 'bolt2' ? f.cur.br : [];
        const layers = [[34, 'rgba(120,90,255,.22)'], [16, 'rgba(150,200,255,.45)'], [7, 'rgba(230,240,255,.85)']];
        for (const [w, c] of layers) {
          ctx.globalAlpha = Math.min(1, a * flick); ctx.strokeStyle = c;
          ctx.lineWidth = w * (f.k === 'arc' ? 0.6 : 1); strokePath(ctx, main);
          for (const b of br) { ctx.lineWidth = w * b.w; strokePath(ctx, b.p); }
        }
        if (f.k === 'bolt2') { const s = 90 * (1 + (f.flash || 0)); ctx.globalAlpha = a; ctx.drawImage(glow('rgba(200,190,255,.95)'), f.x - s, f.y - s * 0.6, s * 2, s * 1.2); }
      }
    }
    ctx.restore();
    // bílé jádro blesků s tmavým lemem (vidět i na světlé obloze)
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const f of this.fx) {
      if (f.k !== 'bolt2' && f.k !== 'arc') continue;
      const a = 1 - f.t / f.life, main = f.k === 'bolt2' ? f.cur.m : f.p, br = f.k === 'bolt2' ? f.cur.br : [];
      ctx.globalAlpha = a * 0.55; ctx.strokeStyle = '#2a1f6a'; ctx.lineWidth = f.k === 'arc' ? 4 : 6; strokePath(ctx, main);
      ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = f.k === 'arc' ? 2 : 3.2; strokePath(ctx, main);
      for (const b of br) { ctx.lineWidth = 3.2 * b.w; strokePath(ctx, b.p); }
    }
    ctx.restore();
  };

  /* =====================================================================
     NAPOJENÍ NA BITVU – vrstvy navíc ke každému speciálnímu útoku
     ===================================================================== */
  function hook() {
    if (!window.Battle || Battle.prototype._vfxPlus) return false;
    const B = Battle.prototype;
    B._vfxPlus = true;
    const oldUse = B.useAbility;
    B.useAbility = function (team, id, forced) {
      const ok = oldUse.apply(this, arguments);
      try { if (ok && this.vfx && this._abInfo) this._abExtras(this._abInfo); } catch (e) {}
      return ok;
    };
    B._abExtras = function (I) {
      const V = this.vfx, a = I.a, C = GameData.battleConfig, top = this.H - this.cam.viewH;
      const mine = this.units.filter(u => u.team === I.team && !u.dead), foe = I.team === 'player' ? 'enemy' : 'player';
      const foes = this.units.filter(u => u.team === foe && !u.dead);
      const cap = (arr, n) => arr.length > n ? arr.filter((u, i) => i % Math.ceil(arr.length / n) === 0) : arr;
      switch (a.kind) {
        case 'storm':
          V.stormSky(0, this.W, top - 40, this.cam.viewH * 0.75, 3.8);
          break;
        case 'quake': {
          const x0 = this.cam.x, w = this.cam.viewW;
          for (let i = 0; i < (lite() ? 2 : 4); i++) V.crack(x0 + w * (i + 0.5) / (lite() ? 2 : 4) + rnd(-40, 40), I.midY + rnd(-30, 30), rnd(150, 230), 2.8);
          for (let i = 0; i < 4; i++) V.dust(x0 + w * (i + 0.5) / 4, I.midY + rnd(-20, 30), 140);
          break;
        }
        case 'meteors': V.rune(I.tx, I.midY + 6, a.radius * 1.2, '#ff8a3a', 1.2, 1.4); break;
        case 'meteor': V.rune(I.tx, I.midY + 6, a.radius * 1.1, '#ff6a2a', 1.4, 1.8); break;
        case 'stun': if (a.icon === 'snow') V.stormSky(I.tx - 600, 1200, top - 40, this.cam.viewH * 0.5, a.duration + 0.4); break;
        case 'heal': cap(mine, 24).forEach(u => V.rune(u.x, u.y + 4, 46, '#7dff9a', 1.3, 1)); break;
        case 'buff': cap(mine, 24).forEach(u => { V.rune(u.x, u.y + 4, 44, '#ffcf5a', 1.2, 1.5); V.aura(u, a.duration, VFX_PAL.gold); }); break;
        case 'curse': cap(foes, 24).forEach(u => { V.rune(u.x, u.y + 4, 46, '#c07cff', 1.6, -1.2); V.aura(u, a.duration, VFX_PAL.shadow); }); break;
        case 'shield': cap(mine, 30).forEach(u => V.bubble(u, a.duration)); break;
        case 'summon': V.rune(this.side[I.team].castle.front + I.dir * 60, C.groundY ? I.midY : I.midY, 90, '#ffe9a0', 1.6, 1); break;
        case 'holy': V.rune(I.tx, I.midY + 6, a.radius * 1.15, '#ffe08a', 1.6, 1); break;
        case 'gold': for (let i = 0; i < q(30); i++) V.spark(this.side[I.team].castle.front - I.dir * rnd(20, 200), I.midY - rnd(200, 420), rnd(-30, 30), rnd(40, 160), rnd(1, 1.6), rnd(4, 7), '#ffd24a', 500); break;
        case 'element':
          if (a.el === 'blesk') V.stormSky(I.tx - 500, 1000, top - 40, this.cam.viewH * 0.5, 1.6);
          if (a.el === 'led') V.snow(I.tx, I.midY, 300, 2.2);
          break;
      }
    };
    // trosky a prach ve vichřici
    const oldUpd = B.update;
    B.update = function (dt) {
      oldUpd.call(this, dt);
      if (!this.vfx || !this.tornados || !this.tornados.length) return;
      for (const o of this.tornados) {
        o._acc = (o._acc || 0) + dt;
        while (o._acc > (lite() ? 0.08 : 0.035)) {
          o._acc -= lite() ? 0.08 : 0.035;
          const h = rnd(0, 260), r = 16 + h * 0.32, an = Math.random() * TAU;
          this.vfx.p.push({ k: 'shard', x: o.x + Math.cos(an) * r, y: o.y + 10 - h, vx: -Math.sin(an) * rnd(160, 280) + o.vx, vy: rnd(-60, -10), t: 0, life: rnd(0.35, 0.7), s: rnd(3, 6), c: Math.random() < 0.5 ? '#6a5a40' : '#4a7a3a', rot: an, vr: rnd(-10, 10), g: 0 });
          if (Math.random() < 0.3) this.vfx.p.push({ k: 'dust', x: o.x + rnd(-40, 40), y: o.y + 14, vx: rnd(-80, 80) + o.vx * 0.5, vy: rnd(-30, -5), t: 0, life: rnd(0.6, 1), s: rnd(26, 46) });
        }
      }
    };
    return true;
  }
  if (!hook()) window.addEventListener('load', hook);
})();
