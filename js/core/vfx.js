/* =========================================================================
   VFX – výrazné efekty speciálních útoků a výbuchů
   Skutečný oheň (plameny, jiskry, kouř), výbuchy, blesky, led, jed, voda,
   svaté světlo… Kreslí se ve světových souřadnicích bitvy, s aditivním
   mícháním (záře). Bitva volá vfx.update(dt), vfx.drawBack(ctx) pod vojáky
   a vfx.drawFront(ctx) nad vojáky.
   ========================================================================= */
(function () {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* měkké zářící skvrny – předkreslené sprity podle barvy */
  const glowCache = {};
  function glow(color) {
    if (glowCache[color]) return glowCache[color];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, color); gr.addColorStop(0.35, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (glowCache[color] = c);
  }
  const smokeSprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(40,36,34,.85)'); gr.addColorStop(0.6, 'rgba(50,46,44,.45)'); gr.addColorStop(1, 'rgba(60,56,54,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  })();
  const PAL = {
    fire: ['#fff6c8', '#ffd24a', '#ff8a1a', '#d8300c'],
    ice: ['#ffffff', '#d6f4ff', '#7fd3ff', '#2f7fd0'],
    poison: ['#f2ffd6', '#b6ff6a', '#5ad02a', '#1f6a14'],
    bolt: ['#ffffff', '#fff6a8', '#ffe14a', '#8a7aff'],
    holy: ['#ffffff', '#fff6c8', '#ffe08a', '#e8b84a'],
    water: ['#ffffff', '#c8ecff', '#3d9bff', '#1a4a9a'],
    stone: ['#efe6cf', '#c9b48a', '#8a7a68', '#4a3a2a'],
    shadow: ['#f0d8ff', '#c07cff', '#7a2a8a', '#2a0a3a'],
    gold: ['#ffffff', '#fff1b0', '#ffd24a', '#c98a1a'],
    heal: ['#ffffff', '#d6ffe0', '#6aff8a', '#1f8a44']
  };

  class VFX {
    constructor() { this.p = []; this.fx = []; }
    /* ---------- primitiva ---------- */
    spark(x, y, vx, vy, life, size, color, g, add) { if (this.p.length > 900) return; this.p.push({ k: 'glow', x, y, vx, vy, t: 0, life, s: size, c: color, g: g || 0, add: add !== false }); }
    smoke(x, y, vx, vy, life, size) { if (this.p.length > 900) return; this.p.push({ k: 'smoke', x, y, vx, vy, t: 0, life, s: size }); }
    flame(x, y, size, life, pal) { if (this.p.length > 900) return; this.p.push({ k: 'flame', x, y, vx: rnd(-14, 14), vy: rnd(-70, -40), t: 0, life, s: size, pal: pal || PAL.fire, ph: Math.random() * 10 }); }
    shard(x, y, vx, vy, life, size, color) { this.p.push({ k: 'shard', x, y, vx, vy, t: 0, life, s: size, c: color, rot: Math.random() * TAU, vr: rnd(-8, 8), g: 700 }); }

    /* ---------- složené efekty ---------- */
    /* výbuch: ohnivá koule, tlaková vlna, jiskry, střepy, kouř a stopa na zemi */
    explosion(x, y, size, kind) {
      const P = PAL[kind] || PAL.fire;
      this.fx.push({ k: 'boom', x, y, s: size, t: 0, life: 0.55, pal: P });
      this.fx.push({ k: 'ring', x, y, s: size * 1.6, t: 0, life: 0.5, c: P[1] });
      this.fx.push({ k: 'scorch', x, y, s: size * 0.9, t: 0, life: 4, c: kind === 'ice' ? 'rgba(200,235,255,.55)' : kind === 'poison' ? 'rgba(60,120,30,.5)' : 'rgba(20,14,10,.55)' });
      const n = Math.round(size / 3);
      for (let i = 0; i < n; i++) { const a = rnd(-Math.PI, 0), sp = rnd(120, 520) * size / 80; this.spark(x, y - 10, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.4, 0.9), rnd(4, 9), P[rnd(0, 1) < 0.5 ? 1 : 2], 600); }
      if (kind === 'fire' || kind === 'stone' || !kind) for (let i = 0; i < n / 2; i++) { const a = rnd(-Math.PI, 0), sp = rnd(160, 420); this.shard(x, y - 6, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.6, 1.1), rnd(4, 8), kind === 'stone' ? '#6a5a48' : '#3a2a20'); }
      if (kind === 'ice') for (let i = 0; i < n / 2; i++) { const a = rnd(-Math.PI, 0), sp = rnd(160, 460); this.shard(x, y - 6, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.6, 1.1), rnd(5, 10), '#dff6ff'); }
      if (kind !== 'ice' && kind !== 'holy' && kind !== 'water') for (let i = 0; i < n / 3; i++) this.smoke(x + rnd(-size / 2, size / 2), y - rnd(10, size), rnd(-30, 30), rnd(-70, -30), rnd(1.4, 2.4), rnd(size * 0.4, size * 0.8));
      if (kind === 'fire' || !kind) this.burn(x, y, size * 1.1, 2.2);
    }
    /* hořící země: plameny vyšlehávají po celou dobu */
    burn(x, y, w, dur) { this.fx.push({ k: 'burn', x, y, w, t: 0, life: dur, acc: 0 }); }
    /* padající ohnivá koule s ohonem plamenů */
    meteor(m) { /* jen stopa – pohyb řídí bitva */
      for (let i = 0; i < 3; i++) this.flame(m.x + rnd(-6, 6), m.y + rnd(-6, 6), (m.big ? 46 : 26) * rnd(0.7, 1.1), rnd(0.25, 0.45));
      this.spark(m.x, m.y, rnd(-60, 60), rnd(-60, 20), 0.4, rnd(4, 7), '#ffd24a');
      if (Math.random() < 0.5) this.smoke(m.x, m.y, rnd(-20, 20), rnd(-30, 0), 1.1, m.big ? 40 : 22);
    }
    /* blesk z nebe s větvemi, záblesk a jiskry */
    lightning(x, yTop, y) {
      const pts = [[x + rnd(-80, 80), yTop]];
      const n = 12;
      for (let i = 1; i < n; i++) pts.push([x + (pts[0][0] - x) * (1 - i / n) + rnd(-26, 26), yTop + (y - yTop) * i / n]);
      pts.push([x, y]);
      const br = [];
      for (let b = 0; b < 3; b++) { const i = 3 + Math.floor(Math.random() * 6), s = pts[i], d = Math.random() < 0.5 ? -1 : 1; const bp = [s]; for (let k = 1; k < 5; k++) bp.push([s[0] + d * k * rnd(12, 22), s[1] + k * rnd(14, 24)]); br.push(bp); }
      this.fx.push({ k: 'bolt', pts, br, t: 0, life: 0.65 });
      this.explosion(x, y, 70, 'bolt');
    }
    /* ledová kopí ze země */
    iceSpikes(x, y, w, dur) {
      const n = Math.max(5, Math.round(w / 34));
      for (let i = 0; i < n; i++) this.fx.push({ k: 'spike', x: x - w / 2 + (i + 0.5) * w / n + rnd(-8, 8), y: y + rnd(-26, 26), h: rnd(60, 120), wd: rnd(16, 26), t: -i * 0.03, life: dur });
      this.fx.push({ k: 'mist', x, y, s: w * 0.7, t: 0, life: dur, c: 'rgba(210,240,255,' });
      for (let i = 0; i < 30; i++) this.spark(x + rnd(-w / 2, w / 2), y - rnd(0, 60), rnd(-40, 40), rnd(-120, -30), rnd(0.6, 1.2), rnd(3, 6), '#e6f8ff', 0);
    }
    /* jedovatý mrak s bublinami */
    poison(x, y, r, dur) { this.fx.push({ k: 'mist', x, y: y - 30, s: r, t: 0, life: dur, c: 'rgba(110,220,60,', bubbles: true, acc: 0 }); }
    /* vodní vlna, která se valí dopředu */
    wave(x, y, dir) { this.fx.push({ k: 'wave', x, y, dir, t: 0, life: 1.4 }); }
    /* svatý paprsek */
    pillar(x, y, w, color, life) { this.fx.push({ k: 'pillar', x, y, w, c: color, t: 0, life: life || 1.2 }); }
    /* stoupající jiskry nad vojákem (léčení, posílení) */
    rise(x, y, kind, n) {
      const P = PAL[kind] || PAL.gold;
      for (let i = 0; i < (n || 10); i++) this.spark(x + rnd(-18, 18), y - rnd(0, 90), rnd(-10, 10), rnd(-140, -60), rnd(0.7, 1.3), rnd(4, 8), P[1 + (i % 2)], 0);
      this.fx.push({ k: 'ring', x, y, s: 60, t: 0, life: 0.6, c: P[2], flat: true });
      if (kind === 'heal') this.fx.push({ k: 'cross', x, y: y - 110, t: 0, life: 1.1 });
    }
    /* dračí dech: proud plamenů od hradu */
    breath(x0, y0, x1, dir) { this.fx.push({ k: 'breath', x0, y0, x1, dir, t: 0, life: 1.6, acc: 0 }); }

    /* ---------- update ---------- */
    update(dt) {
      for (const p of this.p) {
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.g) p.vy += p.g * dt;
        if (p.k === 'flame') { p.vy -= 40 * dt; p.vx *= 0.96; }
        if (p.k === 'smoke') { p.vx *= 0.98; p.vy *= 0.985; }
        if (p.k === 'shard') p.rot += p.vr * dt;
      }
      this.p = this.p.filter(p => p.t < p.life);
      for (const f of this.fx) {
        f.t += dt;
        if (f.k === 'burn' && f.t < f.life) { f.acc += dt; while (f.acc > 0.025) { f.acc -= 0.025; const k = 1 - f.t / f.life; this.flame(f.x + rnd(-f.w / 2, f.w / 2), f.y + rnd(-16, 16), rnd(26, 58) * (0.4 + k), rnd(0.35, 0.7)); if (Math.random() < 0.25) this.spark(f.x + rnd(-f.w / 2, f.w / 2), f.y - rnd(10, 50), rnd(-30, 30), rnd(-180, -80), rnd(0.6, 1.1), rnd(2.5, 4.5), '#ffd24a', -60); if (Math.random() < 0.12) this.smoke(f.x + rnd(-f.w / 2, f.w / 2), f.y - 60, rnd(-10, 10), rnd(-60, -30), 1.8, rnd(30, 50)); } }
        if (f.k === 'mist' && f.bubbles && f.t < f.life) { f.acc += dt; while (f.acc > 0.06) { f.acc -= 0.06; this.spark(f.x + rnd(-f.s, f.s) * 0.8, f.y + rnd(-10, 40), rnd(-10, 10), rnd(-60, -20), rnd(0.6, 1.2), rnd(4, 9), '#c8ff8a', 0, false); } }
        if (f.k === 'breath' && f.t < f.life - 0.3) { f.acc += dt; while (f.acc > 0.012) { f.acc -= 0.012; const sp = rnd(900, 1500); this.p.push({ k: 'flame', x: f.x0, y: f.y0, vx: f.dir * sp, vy: rnd(40, 200), t: 0, life: Math.abs(f.x1 - f.x0) / sp, s: rnd(40, 80), pal: PAL.fire, ph: Math.random() * 10 }); } }
      }
      this.fx = this.fx.filter(f => f.t < f.life);
    }

    /* ---------- kreslení ---------- */
    drawBack(ctx) {   // pod vojáky: spáleniny, mlha, ledová kopí, prstence na zemi
      for (const f of this.fx) {
        if (f.t < 0) continue;
        const a = 1 - f.t / f.life;
        if (f.k === 'scorch') { ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.5); ctx.beginPath(); ctx.ellipse(f.x, f.y + 6, f.s, f.s * 0.25, 0, 0, TAU); ctx.fillStyle = f.c; ctx.fill(); ctx.restore(); }
        if (f.k === 'ring' && f.flat) { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.s * (0.4 + f.t / f.life), f.s * 0.28 * (0.4 + f.t / f.life), 0, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = f.c; ctx.stroke(); ctx.restore(); }
      }
    }
    drawFront(ctx, time) {   // nad vojáky
      // kouř (normální míchání)
      for (const p of this.p) if (p.k === 'smoke') { const k = p.t / p.life, s = p.s * (0.6 + k * 1.4); ctx.globalAlpha = (1 - k) * 0.75; ctx.drawImage(smokeSprite, p.x - s, p.y - s, s * 2, s * 2); }
      for (const p of this.p) if (p.k === 'shard') { ctx.save(); ctx.globalAlpha = 1 - p.t / p.life; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(-p.s, -p.s * 0.4); ctx.lineTo(p.s, 0); ctx.lineTo(-p.s * 0.6, p.s * 0.5); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.globalAlpha = 1;
      for (const f of this.fx) {
        if (f.t < 0) continue;
        const k = f.t / f.life, a = 1 - k;
        if (f.k === 'spike') {
          const grow = Math.min(1, f.t / 0.12), fade = Math.min(1, (f.life - f.t) / 0.35), h = f.h * grow;
          ctx.save(); ctx.globalAlpha = fade;
          const g = ctx.createLinearGradient(f.x, f.y - h, f.x, f.y); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#bfe8ff'); g.addColorStop(1, '#3a8ad0');
          ctx.beginPath(); ctx.moveTo(f.x - f.wd / 2, f.y); ctx.lineTo(f.x - f.wd * 0.1, f.y - h); ctx.lineTo(f.x + f.wd / 2, f.y); ctx.closePath();
          ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#123'; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(f.x - f.wd * 0.1, f.y - h); ctx.lineTo(f.x + f.wd * 0.1, f.y - h * 0.2); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
          ctx.restore();
        }
        if (f.k === 'mist') {
          for (let i = 0; i < 9; i++) { const ox = Math.sin(time * 0.9 + i * 1.7) * f.s * 0.7, oy = Math.cos(time * 0.7 + i) * 26, s = f.s * (0.45 + (i % 3) * 0.12); ctx.globalAlpha = Math.min(1, (f.life - f.t) * 1.5) * 0.85; ctx.drawImage(glow(f.c + '0.55)'), f.x + ox - s, f.y + oy - s * 0.6, s * 2, s * 1.2); }
          ctx.globalAlpha = 1;
        }
        if (f.k === 'wave') {
          const x = f.x + f.dir * k * 520, h = 140 * Math.sin(Math.min(1, k * 2.5) * Math.PI * 0.5) * (1 - k * 0.6);
          ctx.save(); ctx.globalAlpha = a;
          const g = ctx.createLinearGradient(x, f.y - h, x, f.y); g.addColorStop(0, '#e8f8ff'); g.addColorStop(0.4, '#5ab0ff'); g.addColorStop(1, '#1a4a9a');
          ctx.beginPath(); ctx.moveTo(x - f.dir * 340, f.y + 20);
          ctx.quadraticCurveTo(x - f.dir * 160, f.y - h * 0.5, x, f.y - h);
          ctx.quadraticCurveTo(x + f.dir * 50, f.y - h * 1.1, x + f.dir * 30, f.y - h * 0.6);
          ctx.quadraticCurveTo(x + f.dir * 10, f.y - h * 0.4, x + f.dir * 60, f.y + 20); ctx.closePath();
          ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
          ctx.restore();
          for (let i = 0; i < 3; i++) this.spark(x + rnd(-20, 40) * f.dir, f.y - h + rnd(0, 20), f.dir * rnd(60, 200), rnd(-200, -60), rnd(0.4, 0.8), rnd(3, 6), '#e8f8ff', 500, false);
        }
      }
      // aditivní záře: plameny, jiskry, výbuchy, blesky, paprsky
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const f of this.fx) {
        if (f.t < 0) continue;
        const k = f.t / f.life, a = 1 - k;
        if (f.k === 'boom') {
          const s = f.s * (0.5 + k * 0.9);
          ctx.globalAlpha = a * 0.45; ctx.drawImage(glow(f.pal[2]), f.x - s * 1.5, f.y - s * 1.5 - s * 0.3, s * 3, s * 3);
        }
        if (f.k === 'ring' && !f.flat) { ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.s * (0.3 + k), f.s * 0.3 * (0.3 + k), 0, 0, TAU); ctx.lineWidth = 10 * a + 2; ctx.strokeStyle = f.c; ctx.stroke(); }
        if (f.k === 'bolt') {
          const flick = Math.random() < 0.7 ? 1 : 0.5;
          for (const [w, c] of [[40, 'rgba(160,140,255,.3)'], [16, 'rgba(255,240,150,.7)']]) {
            ctx.globalAlpha = a * flick; ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = 'round';
            ctx.beginPath(); f.pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
            for (const b of f.br) { ctx.lineWidth = w * 0.5; ctx.beginPath(); b.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); }
          }
        }
        if (f.k === 'pillar') {
          const w = f.w * (1 - k * 0.4), top = f.y - 900;
          const g = ctx.createLinearGradient(f.x - w, 0, f.x + w, 0);
          g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(0.5, f.c); g.addColorStop(1, 'rgba(255,240,180,0)');
          ctx.globalAlpha = Math.sin(Math.min(1, k * 1.2) * Math.PI) * 0.95; ctx.fillStyle = g; ctx.fillRect(f.x - w, top, w * 2, f.y - top + 10);
          ctx.drawImage(glow(f.c), f.x - w * 1.5, f.y - w * 0.5, w * 3, w);
        }
        if (f.k === 'cross') { ctx.globalAlpha = a; ctx.fillStyle = '#7dff9a'; const y = f.y - k * 40; ctx.fillRect(f.x - 5, y - 16, 10, 32); ctx.fillRect(f.x - 16, y - 5, 32, 10); }
      }
      for (const p of this.p) {
        if (p.k === 'glow') {
          if (!p.add) continue;
          const k = p.t / p.life, s = p.s * (1 - k * 0.5);
          ctx.globalAlpha = (1 - k) * 0.85; ctx.drawImage(glow(p.c), p.x - s * 1.5, p.y - s * 1.5, s * 3, s * 3);
        } else if (p.k === 'flame' && false) {
          // jazyk plamene: kapka se špičkou nahoru, bílé jádro → žlutá → oranžová → rudá
          const k = p.t / p.life, s = p.s * (k < 0.2 ? 0.5 + k * 2.5 : 1 - (k - 0.2) * 0.9), fl = Math.sin(time * 18 + p.ph) * 0.15;
          const col = k < 0.25 ? p.pal[0] : k < 0.5 ? p.pal[1] : k < 0.75 ? p.pal[2] : p.pal[3];
          ctx.globalAlpha = Math.max(0, 1 - k * 0.9);
          ctx.drawImage(glow(p.pal[3]), p.x - s, p.y - s * 1.1, s * 2, s * 2);
          ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1 + fl, 1 - fl);
          const g = ctx.createRadialGradient(0, -s * 0.15, 0, 0, -s * 0.2, s * 0.75);
          g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, col); g.addColorStop(1, 'rgba(200,40,10,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(0, -s * 1.15);
          ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.6, s * 0.1, 0, s * 0.35);
          ctx.bezierCurveTo(-s * 0.6, s * 0.1, -s * 0.55, -s * 0.5, 0, -s * 1.15); ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
      // ohnivé koule výbuchů (normální míchání, sytá barva)
      for (const f of this.fx) {
        if (f.k !== 'boom' || f.t < 0) continue;
        const k = f.t / f.life, s = f.s * (0.45 + k * 0.8);
        ctx.globalAlpha = Math.max(0, 1 - k * 1.1);
        const g = ctx.createRadialGradient(f.x, f.y - s * 0.4, 0, f.x, f.y - s * 0.4, s);
        g.addColorStop(0, f.pal[0]); g.addColorStop(0.25, f.pal[1]); g.addColorStop(0.6, f.pal[2]); g.addColorStop(0.85, f.pal[3]); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, f.y - s * 0.4, s, s * 0.85, 0, 0, TAU); ctx.fill();
      }
      // blesk: bílé jádro s tmavým obrysem, aby byl vidět i na světlém nebi
      for (const f of this.fx) {
        if (f.k !== 'bolt' || f.t < 0) continue;
        ctx.globalAlpha = 1 - f.t / f.life; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        for (const [w, c] of [[9, '#3a2a8a'], [5, '#ffffff']]) {
          ctx.lineWidth = w; ctx.strokeStyle = c;
          ctx.beginPath(); f.pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
          for (const b of f.br) { ctx.lineWidth = w * 0.55; ctx.beginPath(); b.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); }
        }
      }
      // plameny: skutečné jazyky ohně (normální míchání + jemná záře)
      for (const p of this.p) {
        if (p.k !== 'flame') continue;
        const k = p.t / p.life, s = p.s * (k < 0.2 ? 0.55 + k * 2.25 : 1 - (k - 0.2) * 0.85), fl = Math.sin(time * 18 + p.ph) * 0.14;
        ctx.globalAlpha = Math.max(0, 1 - k * 0.95);
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1 + fl, 1 - fl);
        const g = ctx.createLinearGradient(0, -s * 1.15, 0, s * 0.35);
        g.addColorStop(0, k < 0.5 ? p.pal[2] : p.pal[3]); g.addColorStop(0.45, k < 0.4 ? p.pal[1] : p.pal[2]); g.addColorStop(1, k < 0.3 ? p.pal[0] : p.pal[1]);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, -s * 1.15);
        ctx.bezierCurveTo(s * 0.5, -s * 0.55, s * 0.62, s * 0.05, 0, s * 0.35);
        ctx.bezierCurveTo(-s * 0.62, s * 0.05, -s * 0.5, -s * 0.55, 0, -s * 1.15); ctx.fill();
        if (k < 0.5) { // světlé vnitřní jádro
          ctx.fillStyle = p.pal[0]; ctx.beginPath(); ctx.moveTo(0, -s * 0.45);
          ctx.bezierCurveTo(s * 0.22, -s * 0.15, s * 0.26, s * 0.12, 0, s * 0.22);
          ctx.bezierCurveTo(-s * 0.26, s * 0.12, -s * 0.22, -s * 0.15, 0, -s * 0.45); ctx.fill();
        }
        ctx.restore();
      }
      // neaditivní jiskry (bubliny, kapky)
      for (const p of this.p) if (p.k === 'glow' && !p.add) { const k = p.t / p.life; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.6, 0, TAU); ctx.fillStyle = p.c; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }
  window.VFX = VFX;
  window.VFX_PAL = PAL;
})();
