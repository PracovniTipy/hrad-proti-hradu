/* =========================================================================
   MAZLÍČCI – NOVÉ KRESBY (přepisují původní kresby z novinky.js)
   Souřadnice: střed (0,0), hledí doprava, tělo zhruba x −34…34, y −38…26
   (stín je na y≈26). Podpis: fn(c, t, act) – t = čas v s, act = schopnost.
   ========================================================================= */
(function () {
  const G = window.GameData; if (!G || !G.petDrawFns) return;
  const TAU = Math.PI * 2, OUT = '#1b1420';
  const K = G.petKit = {
    TAU, OUT,
    // lineární / radiální gradient: stops = [[0,'#fff'],[1,'#000']] nebo ['#fff','#000']
    lg(c, x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); K._st(g, st); return g; },
    rg(c, x, y, r0, r1, st, fx, fy) { const g = c.createRadialGradient(fx == null ? x : fx, fy == null ? y : fy, r0, x, y, r1); K._st(g, st); return g; },
    _st(g, st) { st.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / Math.max(1, st.length - 1), s)); },
    // vyplnit aktuální cestu + obrys
    fill(c, f, lw, oc) { c.fillStyle = f; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = oc || OUT; c.lineJoin = 'round'; c.stroke(); } },
    stroke(c, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); },
    // měkká záře (aditivně)
    glow(c, x, y, r, col, a) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a == null ? 0.6 : a; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); },
    // velké lesklé oko: r = poloměr, iris = barva duhovky, look = posun zornice (−1…1), blink 0..1
    eye(c, x, y, r, iris, look, blink) {
      look = look || 0.25; blink = blink || 0;
      c.save(); c.beginPath(); c.ellipse(x, y, r, r * 1.08 * (1 - blink * 0.92), 0, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.lineWidth = Math.max(0.8, r * 0.28); c.strokeStyle = OUT; c.stroke();
      if (blink < 0.6) {
        c.clip();
        const ix = x + r * look * 0.45, iy = y + r * 0.05, ir = r * 0.68;
        c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.fillStyle = K.rg(c, ix, iy + ir * 0.3, ir * 0.1, ir, [[0, '#fff'], [0.25, iris || '#3a7ad8'], [1, K.dark(iris || '#3a7ad8', 0.45)]]); c.fill();
        c.beginPath(); c.arc(ix + r * 0.05, iy, ir * 0.5, 0, TAU); c.fillStyle = '#0d0a12'; c.fill();
        c.beginPath(); c.arc(ix + ir * 0.35, iy - ir * 0.4, ir * 0.3, 0, TAU); c.fillStyle = '#fff'; c.fill();
        c.beginPath(); c.arc(ix - ir * 0.35, iy + ir * 0.4, ir * 0.14, 0, TAU); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
      }
      c.restore();
    },
    // jednoduchá zavřená / usměvavá očka ^ ^
    happyEye(c, x, y, r) { c.beginPath(); c.arc(x, y + r * 0.4, r, Math.PI * 1.15, Math.PI * 1.85); K.stroke(c, OUT, Math.max(1, r * 0.4)); },
    blush(c, x, y, r) { c.save(); c.globalAlpha = 0.45; c.beginPath(); c.ellipse(x, y, r, r * 0.6, 0, 0, TAU); c.fillStyle = '#ff6a8a'; c.fill(); c.restore(); },
    // ztmavit / zesvětlit hex barvu (k = 0..1)
    dark(h, k) { return K.mix(h, '#000000', k); }, light(h, k) { return K.mix(h, '#ffffff', k); },
    mix(a, b, k) { const p = x => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)]; if (a[0] !== '#' || a.length < 7) return a; const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); },
    // hvězdička / jiskra
    star(c, x, y, r, col, n, inner) { n = n || 5; inner = inner || 0.45; c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = col; c.fill(); },
    sparkle(c, x, y, r, col) { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fillStyle = col; c.fill(); },
    // lesklý odlesk (bílá elipsa s průhledností)
    gloss(c, x, y, rx, ry, rot, a) { c.save(); c.globalAlpha = a == null ? 0.55 : a; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.restore(); },
    // deterministické „náhodné“ číslo
    rnd(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  };
  const D = G.petDrawFns;

  /* část 1 – COMMON: sova, kaktus, zelva, rybka, slepice, mys, motyl, oblazek, svetluska, jezek */
  {
    const LW = 1.5, PI = Math.PI;
    // mrknutí: 0..1 krátce každých ~4 s
    const blk = (t, o) => { const p = (t + (o || 0)) % 3.9; return p < 0.16 ? Math.sin(p / 0.16 * PI) : 0; };
    const E = (c, x, y, rx, ry, r) => { c.beginPath(); c.ellipse(x, y, rx, ry, r || 0, 0, TAU); };
    // kulovité stínování (světlo vlevo nahoře)
    const sh = (c, x, y, r, base, hi, lo) => K.rg(c, x, y, r * 0.05, r * 1.15, [[0, K.light(base, hi == null ? 0.5 : hi)], [0.5, base], [1, K.dark(base, lo == null ? 0.35 : lo)]], x - r * 0.4, y - r * 0.45);
    // tlustá „trubka“ s obrysem (nohy, ruce, provázky); path = funkce kreslící cestu
    const tube = (c, path, w, col, hi) => {
      c.beginPath(); path(); K.stroke(c, OUT, w + 2.8);
      c.beginPath(); path(); K.stroke(c, col, w);
      if (hi) { c.save(); c.translate(-w * 0.18, -w * 0.18); c.globalAlpha = 0.55; c.beginPath(); path(); K.stroke(c, hi, w * 0.32); c.restore(); }
    };
    const plus = (c, x, y, r, col) => { c.beginPath(); c.rect(x - r * 0.32, y - r, r * 0.64, r * 2); c.rect(x - r, y - r * 0.32, r * 2, r * 0.64); c.fillStyle = col; c.fill(); };
    // rychlostní čárky
    const speed = (c, x, y, n, len, col, a) => { c.save(); c.globalAlpha = a || 0.6; c.strokeStyle = col; c.lineCap = 'round'; for (let i = 0; i < n; i++) { const yy = y + (i - (n - 1) / 2) * 6, l = len * (0.6 + K.rnd(i + 3) * 0.6); c.lineWidth = 1.6 - i * 0.1; c.beginPath(); c.moveTo(x, yy); c.lineTo(x - l, yy); c.stroke(); } c.restore(); };
    // mince
    const coin = (c, x, y, r, rot) => {
      const sx = Math.max(0.15, Math.abs(Math.cos(rot)));
      c.save(); c.translate(x, y); c.scale(sx, 1);
      E(c, 0, 0, r, r); K.fill(c, K.rg(c, 0, 0, r * 0.1, r, [[0, '#fff6c0'], [0.5, '#ffd23a'], [1, '#c8860e']], -r * 0.4, -r * 0.4), 1);
      E(c, 0, 0, r * 0.62, r * 0.62); c.strokeStyle = '#b8780c'; c.lineWidth = 0.8; c.stroke();
      c.restore();
    };

    Object.assign(D, {
      /* ---------------- LUNA – sněžná sova v čarodějném klobouku ---------------- */
      sova(c, t, act) {
        const br = Math.sin(t * 2.1), bl = blk(t, 0.2), sw = Math.sin(t * 1.6) * 1.6;
        c.save();
        c.translate(0, 24); c.scale(1 + br * 0.012, 1 - br * 0.014); c.translate(0, -24);
        // ocásek
        c.beginPath(); c.moveTo(-11, 15); c.lineTo(-21, 22); c.lineTo(-16, 22.5); c.lineTo(-19, 25.5); c.lineTo(-8, 21); c.closePath(); K.fill(c, '#c9d8ea', LW);
        // tělo
        E(c, 0, 4, 18.5, 20.5); K.fill(c, K.rg(c, 0, 4, 2, 25, [[0, '#ffffff'], [0.55, '#eef5fc'], [1, '#aec3dc']], -6, -6), 1.7);
        // tečkované pruhování na hrudi
        c.strokeStyle = '#8ea6c2'; c.lineWidth = 1.1; c.lineCap = 'round';
        for (let r = 0; r < 4; r++) for (let k = 0; k < 4 - (r === 3 ? 1 : 0); k++) {
          const x = -5 + k * 5.5 + (r % 2) * 2.7 - (r === 3 ? -2 : 0), y = 7 + r * 4.2;
          c.beginPath(); c.moveTo(x - 1.6, y - 0.7); c.quadraticCurveTo(x, y + 1, x + 1.6, y - 0.7); c.stroke();
        }
        // nožky s chmýřím
        for (const fx of [-4, 7]) {
          E(c, fx, 23.3, 4.6, 2.9); K.fill(c, K.lg(c, 0, 20, 0, 26, ['#ffffff', '#c6d4e6']), 1.2);
          c.strokeStyle = '#3a3440'; c.lineWidth = 1.1;
          for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(fx + 0.5 + k * 2, 25.2); c.quadraticCurveTo(fx + 2 + k * 2, 26.3, fx + 2.8 + k * 2, 25.3); c.stroke(); }
        }
        // zadní křídlo
        c.beginPath(); c.moveTo(-9, -7); c.bezierCurveTo(-23, -3, -24, 15, -14, 22); c.bezierCurveTo(-9, 18, -5, 10, -5, 0); c.closePath();
        K.fill(c, K.lg(c, -20, 0, -6, 10, ['#b4c8de', '#f2f7fd']), LW);
        c.strokeStyle = 'rgba(70,100,140,.45)'; c.lineWidth = 0.9;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-8 - i * 3, 3 + i * 3); c.quadraticCurveTo(-14 - i * 2, 12 + i * 2, -14 - i * 1, 19 - i); c.stroke(); }
        c.fillStyle = '#7d93ad'; for (let i = 0; i < 4; i++) { E(c, -15 + K.rnd(i) * 6, 2 + i * 4.5, 1.6, 0.8, -0.5); c.fill(); }
        // kouzelná kniha pod křídlem
        c.save(); c.translate(-16.5, 13.5); c.rotate(-0.45); c.scale(0.82, 0.82);
        c.beginPath(); c.rect(-6.5, -4.5, 13, 9.5); K.fill(c, '#f2e6c8', 1.1);
        c.strokeStyle = '#c8b898'; c.lineWidth = 0.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6, -1.5 + i * 1.6); c.lineTo(6, -1.5 + i * 1.6); c.stroke(); }
        c.beginPath(); c.rect(-7, -5.5, 14, 3.2); K.fill(c, K.lg(c, 0, -6, 0, -2, ['#b05ad8', '#6a2a9a']), 1.2);
        c.beginPath(); c.rect(-7, 3.8, 14, 2.6); K.fill(c, '#6a2a9a', 1.2);
        K.star(c, 0, -3.9, 1.5, '#ffe9a0');
        c.fillStyle = '#ff6a8a'; c.fillRect(3.5, 5.5, 1.5, 3); // záložka
        c.restore();
        // obličejový disk
        c.beginPath(); c.ellipse(-0.3, -5, 8.4, 8.8, 0, 0, TAU); c.ellipse(10.6, -5, 7.6, 8.3, 0, 0, TAU);
        c.fillStyle = K.rg(c, 5, -5, 3, 13, [[0, '#ffffff'], [0.7, '#f6faff'], [1, '#d4e2f2']]); c.fill();
        // obočí (moudrý výraz)
        c.strokeStyle = '#98aecb'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-5.5, -11.5); c.quadraticCurveTo(-0.5, -13.8, 3.8, -11.8); c.stroke();
        c.beginPath(); c.moveTo(6.8, -11.8); c.quadraticCurveTo(11, -13.6, 15, -11.2); c.stroke();
        K.eye(c, -0.2, -5, 5.3, '#f5b321', act ? 0.6 : 0.45, bl);
        K.eye(c, 10.5, -5, 4.9, '#f5b321', act ? 0.6 : 0.45, bl);
        K.blush(c, -4.5, 2, 2.2); K.blush(c, 14.5, 2, 2);
        // zobáček
        c.beginPath(); c.moveTo(3.4, -1.6); c.lineTo(7.2, -1.6); c.quadraticCurveTo(6.4, 2.2, 5.3, 3.6); c.quadraticCurveTo(4.2, 2.2, 3.4, -1.6); c.closePath();
        K.fill(c, K.lg(c, 0, -2, 0, 4, ['#7a7f8e', '#3a3d48']), 1);
        K.gloss(c, 4.6, -0.6, 1, 0.6, 0, 0.7);
        // přední křídlo + hůlka
        {
          const wa = act ? -2.1 + Math.sin(t * 10) * 0.08 : Math.sin(t * 2.1) * 0.05, ca = Math.cos(wa), sa = Math.sin(wa);
          const gx = 13 + ca * 5 - sa * 10, gy = -1 + sa * 5 + ca * 10; // úchop
          const dx = act ? 0.55 : 0.88, dy = act ? -0.83 : 0.47, L = act ? 13 : 11, cx = gx + dx * L, cy = gy + dy * L;
          c.beginPath(); c.moveTo(gx - dx * 2, gy - dy * 2); c.lineTo(cx, cy); K.stroke(c, OUT, 3.6);
          c.beginPath(); c.moveTo(gx - dx * 2, gy - dy * 2); c.lineTo(cx, cy); K.stroke(c, '#8a5a34', 2);
          c.beginPath(); c.moveTo(gx, gy - 0.4); c.lineTo(cx - dx, cy - dy - 0.4); K.stroke(c, '#c49064', 0.6);
          c.save(); c.translate(13, -1); c.rotate(wa);
          c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(8, 4, 7, 15); c.quadraticCurveTo(2, 13, -1, 7); c.closePath();
          K.fill(c, K.lg(c, 0, 0, 7, 12, ['#ffffff', '#b8cbe0']), 1.3);
          c.strokeStyle = 'rgba(70,100,140,.4)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(2, 5); c.quadraticCurveTo(5, 9, 5, 13); c.stroke();
          c.restore();
          const tw = 0.5 + 0.5 * Math.sin(t * 5);
          K.glow(c, cx, cy, act ? 14 : 7, '#9affd6', act ? 0.7 : 0.35 + tw * 0.2);
          c.save(); c.translate(cx, cy); c.rotate(t * (act ? 4 : 1));
          K.star(c, 0, 0, act ? 4.2 : 3, OUT, 5, 0.5); K.star(c, 0, 0, act ? 3.2 : 2.2, '#dffff0', 5, 0.5);
          c.restore();
          if (act) {
            for (let i = 0; i < 7; i++) {
              const p = (t * 0.9 + i / 7) % 1, x = cx + Math.sin(i * 2.4 + t * 3) * 7 + (K.rnd(i) - 0.5) * 10, y = cy + 10 - p * 22;
              c.save(); c.globalAlpha = Math.sin(p * PI);
              if (i % 2) { plus(c, x, y, 2.6, OUT); plus(c, x, y, 1.9, '#6dffa8'); } else K.sparkle(c, x, y, 3, '#eafff4');
              c.restore();
            }
          } else { c.save(); c.globalAlpha = tw; K.sparkle(c, cx + 4, cy - 3, 1.8, '#ffffff'); c.restore(); }
        }
        c.save(); c.translate(4, -15); c.rotate(-0.08 + (act ? -0.05 : 0)); c.translate(-4, 15);
        E(c, 4, -15.4, 17, 4.2); K.fill(c, K.lg(c, 0, -19, 0, -11, ['#4a52c4', '#232262']), LW);
        c.beginPath(); c.moveTo(-7, -16);
        c.bezierCurveTo(-5, -25, -2, -32, 1 + sw * 0.4, -36.5);
        c.quadraticCurveTo(-3 + sw, -42, -13 + sw, -39.5);
        c.quadraticCurveTo(-5 + sw, -38, 4.5 + sw * 0.4, -32.5);
        c.bezierCurveTo(9, -27, 13, -21, 15, -17.5);
        c.quadraticCurveTo(4, -14.2, -7, -16); c.closePath();
        K.fill(c, K.lg(c, -7, 0, 15, 0, [[0, '#3a3aa0'], [0.45, '#5b62d8'], [1, '#262270']]), LW);
        // záhyby
        c.strokeStyle = 'rgba(20,16,70,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(6, -18); c.quadraticCurveTo(5, -26, 3 + sw * 0.3, -32); c.stroke();
        c.strokeStyle = 'rgba(160,170,255,.5)'; c.beginPath(); c.moveTo(-3, -18); c.quadraticCurveTo(-2, -26, 0 + sw * 0.3, -33); c.stroke();
        // stuha s měsíčkem
        c.beginPath(); c.moveTo(-7, -16); c.quadraticCurveTo(4, -14.2, 15, -17.5); c.lineTo(14.2, -20.6); c.quadraticCurveTo(4, -17.6, -6.2, -19.6); c.closePath();
        K.fill(c, K.lg(c, 0, -20, 0, -15, ['#a8dcff', '#4a8ad8']), 1);
        c.beginPath(); c.arc(4.5, -17.3, 2.4, 0, TAU); c.fillStyle = '#e8f0ff'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = OUT; c.stroke();
        c.beginPath(); c.arc(5.4, -17.8, 1.9, 0, TAU); c.fillStyle = '#4a8ad8'; c.fill();
        // hvězdy na látce
        K.star(c, 1, -25.5, 1.9, '#ffe9a0'); K.sparkle(c, 8.5, -22.5, 1.6, '#ffffff'); K.star(c, -3 + sw * 0.6, -36.5, 1.3, '#ffe9a0');
        // bambulka na špičce
        E(c, -13.4 + sw, -39.3, 2.2, 2.2); K.fill(c, sh(c, -13.4 + sw, -39.3, 2.2, '#c9b6ff'), 1);
        c.restore();
        c.restore();
      },

      /* ---------------- PICHLÍK – kaktus na balónku ---------------- */
      kaktus(c, t, act) {
        const sw = Math.sin(t * 1.3) * 0.06, bob = Math.sin(t * 1.8) * 1.4, bl = blk(t, 1.1);
        const bx = -3, by = -31;
        c.save(); c.translate(0, bob);
        c.save(); c.translate(bx, by + 12); c.rotate(sw); c.translate(-bx, -(by + 12));
        // provázek do ruky
        const str = () => { c.moveTo(bx, by + 13); c.bezierCurveTo(bx - 3, by + 16, -11, -20, -14.5, -14.5); };
        c.beginPath(); str(); K.stroke(c, OUT, 2.2); c.beginPath(); str(); K.stroke(c, '#fff7e6', 1);
        // květináč
        c.beginPath(); c.moveTo(-10, 14); c.lineTo(-7.8, 24.5); c.quadraticCurveTo(0, 25.8, 7.8, 24.5); c.lineTo(10, 14); c.closePath();
        K.fill(c, K.lg(c, -10, 0, 10, 0, [[0, '#9a4a26'], [0.35, '#e0784a'], [0.6, '#f09060'], [1, '#8a3e1e']]), LW);
        // malovaný pásek se srdíčky
        c.strokeStyle = '#fff1d8'; c.lineWidth = 0.9; c.beginPath();
        for (let i = 0; i <= 8; i++) { const x = -8.6 + i * 2.15; c.lineTo(x, 19 + (i % 2 ? -1.2 : 1.2)); } c.stroke();
        c.strokeStyle = 'rgba(60,20,10,.6)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(5.5, 15.5); c.lineTo(4.5, 18); c.lineTo(6, 20); c.stroke(); // prasklinka
        // tělo kaktusu
        c.beginPath(); c.moveTo(-8.5, 13); c.lineTo(-8.5, -4); c.bezierCurveTo(-8.5, -15.5, 8.5, -15.5, 8.5, -4); c.lineTo(8.5, 13); c.closePath();
        const bodyG = K.lg(c, -8.5, 0, 8.5, 0, [[0, '#2c6e2a'], [0.28, '#56a646'], [0.55, '#8fd872'], [0.8, '#58a848'], [1, '#2e6a28']]);
        K.fill(c, bodyG, LW);
        c.save(); c.clip();
        c.strokeStyle = 'rgba(30,90,30,.55)'; c.lineWidth = 1;
        for (const rx of [-4.5, 0.5, 5.2]) { c.beginPath(); c.moveTo(rx, -14); c.quadraticCurveTo(rx + (rx - 0.5) * 0.15, 0, rx, 14); c.stroke(); }
        c.restore();
        // trnové chomáčky
        const tufts = [[-6.5, -8], [-6.8, 2], [-6.6, 10], [0.5, -11.5], [6.8, -7], [7, 9], [-2, 11], [3.5, 11.5]];
        c.strokeStyle = '#fffbe0'; c.lineWidth = 0.75;
        for (const [x, y] of tufts) { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 1.6, y - 1.6); c.moveTo(x, y); c.lineTo(x + 1.6, y - 1.6); c.moveTo(x, y); c.lineTo(x, y - 2.2); c.stroke(); c.fillStyle = '#e6f0a8'; E(c, x, y, 0.7, 0.7); c.fill(); }
        // levá ruka nahoře drží provázek
        tube(c, () => { c.moveTo(-8, 1); c.lineTo(-12, 1); c.quadraticCurveTo(-14.5, 1, -14.5, -2); c.lineTo(-14.5, -12.5); }, 5, '#4f9e42', '#9ae47e');
        E(c, -14.5, -13.6, 2.9, 2.6); K.fill(c, '#5aaa4a', 1.2);
        c.beginPath(); c.moveTo(-17, -14.5); c.lineTo(-12, -13.2); K.stroke(c, '#fff7e6', 0.8);
        // pravá ruka mává
        c.save(); c.translate(8.5, 3); c.rotate(act ? -0.6 : -0.15 + Math.sin(t * 4) * 0.35);
        tube(c, () => { c.moveTo(-1, 0); c.lineTo(3, 0); c.quadraticCurveTo(5.5, 0, 5.5, -3); c.lineTo(5.5, -8); }, 4.6, '#4f9e42', '#9ae47e');
        E(c, 5.5, -8.8, 2.6, 2.4); K.fill(c, '#5aaa4a', 1.2);
        c.restore();
        // květ na hlavě
        c.save(); c.translate(0.5, -12.6); c.rotate(Math.sin(t * 2.3) * 0.15 + (act ? t * 6 : 0));
        for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * TAU / 5); E(c, 0, -2.8, 1.8, 3); K.fill(c, K.lg(c, 0, -6, 0, 0, ['#ffd0ea', '#ff5aa8']), 0.9); c.restore(); }
        E(c, 0, 0, 1.7, 1.7); K.fill(c, '#ffe14a', 0.8);
        c.restore();
        // obličej
        const lx = act ? 0.8 : 0.5;
        K.eye(c, -0.6, -3.5, 3.3, '#5a3a1a', lx, bl); K.eye(c, 5.8, -3.5, 3.1, '#5a3a1a', lx, bl);
        if (act) {
          c.strokeStyle = OUT; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-3.5, -8.3); c.lineTo(1.5, -7); c.moveTo(3.8, -7); c.lineTo(8.5, -8.6); c.stroke();
          E(c, 2.6, 3.4, 2, 1.6); K.fill(c, '#7a1f2a', 1);
        } else {
          c.beginPath(); c.moveTo(0.2, 1.6); c.quadraticCurveTo(2.6, 6, 5, 1.6); c.closePath(); K.fill(c, '#8a2232', 1);
          E(c, 2.6, 3.6, 1.3, 0.8); c.fillStyle = '#ff7a9a'; c.fill();
        }
        K.blush(c, -3.6, 1.2, 1.9); K.blush(c, 7.6, 1.2, 1.7);
        c.restore();
        // balónek
        c.beginPath(); c.moveTo(bx, by + 11); c.lineTo(bx - 1.9, by + 13.8); c.lineTo(bx + 1.9, by + 13.8); c.closePath(); K.fill(c, '#d23a5e', 1);
        E(c, bx, by, 10, 11.6); K.fill(c, K.rg(c, bx, by, 1, 13, [[0, '#ffd6e0'], [0.45, '#ff5d7e'], [1, '#b8204a']], bx - 4, by - 5), LW);
        // záplata
        c.save(); c.translate(bx + 5.2, by + 2.5); c.rotate(0.35);
        c.beginPath(); c.rect(-2.6, -2.6, 5.2, 5.2); K.fill(c, '#f6e7c4', 0.8);
        c.strokeStyle = '#8a5a3a'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.6, -1.6); c.lineTo(1.6, 1.6); c.moveTo(1.6, -1.6); c.lineTo(-1.6, 1.6); c.stroke();
        c.restore();
        K.gloss(c, bx - 4, by - 5, 2.4, 4.2, 0.4, 0.75); K.gloss(c, bx - 1.5, by - 9.3, 1, 0.8, 0, 0.8);
        // jehličí při schopnosti
        if (act) {
          for (let i = 0; i < 10; i++) {
            const a = -0.7 + i * 0.22, p = (t * 2.2 + K.rnd(i) * 0.9) % 1, d = 12 + p * 26;
            const x = Math.cos(a) * d, y = 2 + Math.sin(a) * d, dx = Math.cos(a), dy = Math.sin(a);
            c.save(); c.globalAlpha = 1 - p * 0.6;
            c.beginPath(); c.moveTo(x - dx * 9, y - dy * 9); c.lineTo(x - dx * 3, y - dy * 3); K.stroke(c, 'rgba(255,255,220,.55)', 1.4);
            c.beginPath(); c.moveTo(x - dx * 4, y - dy * 4); c.lineTo(x, y); K.stroke(c, OUT, 2.2);
            c.beginPath(); c.moveTo(x - dx * 4, y - dy * 4); c.lineTo(x, y); K.stroke(c, '#fffbe0', 1.1); E(c, x - dx * 4, y - dy * 4, 0.9, 0.9); c.fillStyle = '#7ac85a'; c.fill();
            c.restore();
          }
        }
        c.restore();
      },

      /* ---------------- ŠELLY – raketová želva ---------------- */
      zelva(c, t, act) {
        const bob = Math.sin(t * 3) * 1.6, sw = Math.sin(t * 6), bl = blk(t, 2.2);
        c.save(); c.translate(0, -4 + bob); c.rotate(Math.sin(t * 1.5) * 0.04 - 0.04);
        // plamen z rakety
        {
          const fl = 1 + Math.sin(t * 31) * 0.12 + Math.sin(t * 17) * 0.1 + (act ? 0.35 : 0), x0 = -26, y0 = -19;
          K.glow(c, x0 - 6, y0, 12 * fl, '#ff9a3a', 0.45);
          c.beginPath(); c.moveTo(x0, y0 - 4); c.quadraticCurveTo(x0 - 8 * fl, y0 - 4, x0 - 15 * fl, y0); c.quadraticCurveTo(x0 - 8 * fl, y0 + 4, x0, y0 + 4); c.closePath();
          c.fillStyle = K.lg(c, x0, 0, x0 - 15 * fl, 0, ['#ffdc5a', '#ff7a2a', 'rgba(255,60,20,0)']); c.fill();
          c.beginPath(); c.moveTo(x0, y0 - 2.2); c.quadraticCurveTo(x0 - 5 * fl, y0 - 1.5, x0 - 8 * fl, y0); c.quadraticCurveTo(x0 - 5 * fl, y0 + 1.5, x0, y0 + 2.2); c.closePath();
          c.fillStyle = '#fffbe0'; c.fill();
          for (let i = 0; i < 3; i++) { const p = (t * 2 + i / 3) % 1; c.save(); c.globalAlpha = (1 - p) * 0.5; E(c, x0 - 14 - p * 10, y0 + 3 + p * 4, 2 + p * 3, 2 + p * 3); c.fillStyle = '#d8d8e0'; c.fill(); c.restore(); }
        }
        // zadní nohy (vzdálené)
        c.save(); c.translate(-12, 2); c.rotate(0.5 + sw * 0.3); E(c, -3, 3, 4.2, 2.6); K.fill(c, '#6ab24a', 1.2); c.restore();
        c.save(); c.translate(10, 2); c.rotate(-0.2 - sw * 0.3); E(c, 3, 3, 4.5, 2.4); K.fill(c, '#6ab24a', 1.2); c.restore();
        // ocásek
        c.beginPath(); c.moveTo(-18, 1); c.quadraticCurveTo(-24, 3, -25, 1); c.quadraticCurveTo(-22, -1, -18, -2); c.closePath(); K.fill(c, '#8ad06a', 1.2);
        // hlava + krk
        c.beginPath(); c.moveTo(11, -5); c.quadraticCurveTo(16, -9, 20, -8); c.lineTo(20, 2); c.quadraticCurveTo(15, 3, 11, 2); c.closePath(); K.fill(c, '#8ad06a', LW);
        E(c, 22.5, -4, 8, 6.8); K.fill(c, sh(c, 22.5, -4, 8, '#96d872', 0.45, 0.3), LW);
        c.fillStyle = 'rgba(60,120,40,.35)'; for (let i = 0; i < 4; i++) { E(c, 18 + K.rnd(i) * 6, -8 + K.rnd(i + 9) * 3, 0.9, 0.7); c.fill(); }
        K.eye(c, 24.5, -5.2, 3.5, '#3a2a1a', 0.6, bl);
        c.beginPath(); c.moveTo(25, -0.3); c.quadraticCurveTo(27.5, 1.5, 29.6, -0.8); K.stroke(c, OUT, 1.1);
        K.blush(c, 21.5, -0.6, 1.7);
        E(c, 30, -4.5, 0.5, 0.5); c.fillStyle = OUT; c.fill();
        // letecké brýle na čele
        c.beginPath(); c.moveTo(15.5, -9.2); c.quadraticCurveTo(22, -12.6, 29, -9); K.stroke(c, OUT, 2.8); c.beginPath(); c.moveTo(15.5, -9.2); c.quadraticCurveTo(22, -12.6, 29, -9); K.stroke(c, '#7a4a2a', 1.6);
        for (const gx of [20.5, 25.5]) { E(c, gx, -10.3, 2.6, 2.2); K.fill(c, '#c8963a', 1); E(c, gx, -10.3, 1.7, 1.4); c.fillStyle = K.lg(c, 0, -12, 0, -9, ['#d8f4ff', '#4aa8d8']); c.fill(); K.gloss(c, gx - 0.6, -10.9, 0.6, 0.4, 0, 0.9); }
        // krunýř
        c.beginPath(); c.moveTo(-21, 2); c.bezierCurveTo(-21, -21, 15, -23, 16, 2); c.closePath();
        K.fill(c, K.rg(c, -2, -4, 2, 22, [[0, '#9ae4b0'], [0.45, '#4ab87a'], [1, '#22704a']], -6, -14), LW);
        c.save(); c.clip();
        c.strokeStyle = 'rgba(16,70,40,.7)'; c.lineWidth = 1.1; c.fillStyle = 'rgba(200,255,210,.18)';
        const hex = (x, y, r) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3; c.lineTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 0.85); } c.closePath(); c.fill(); c.stroke(); };
        hex(-3, -11, 5); hex(-12.5, -6, 4.6); hex(6.5, -6, 4.6); hex(-3, -1.5, 4);
        c.beginPath(); c.moveTo(-3, -16.5); c.lineTo(-3, -22); c.moveTo(-12.5, -10); c.lineTo(-16, -15); c.moveTo(6.5, -10); c.lineTo(10, -15); c.stroke();
        c.restore();
        // okraj krunýře
        c.beginPath(); c.moveTo(-22, 2); c.quadraticCurveTo(-3, 6.5, 17, 2); c.lineTo(17, 0); c.quadraticCurveTo(-3, 3.5, -22, -0.5); c.closePath(); K.fill(c, '#c9e88a', 1.1);
        c.strokeStyle = 'rgba(80,110,30,.6)'; c.lineWidth = 0.8; for (let i = 0; i < 6; i++) { const x = -18 + i * 6.5; c.beginPath(); c.moveTo(x, 0.5 + Math.sin((x + 3) / 39 * PI) * 2.8); c.lineTo(x, 2.6 + Math.sin((x + 3) / 39 * PI) * 3); c.stroke(); }
        // popruh + raketa
        c.beginPath(); c.moveTo(-5, -17); c.quadraticCurveTo(-2, -6, -1, 3); K.stroke(c, OUT, 3.6); c.beginPath(); c.moveTo(-5, -17); c.quadraticCurveTo(-2, -6, -1, 3); K.stroke(c, '#8a5a34', 2.2);
        E(c, -2.2, -6, 1.4, 1.4); K.fill(c, '#d8d8e0', 0.8);
        c.save(); c.translate(-12, -19); c.rotate(-0.04);
        // ploutvičky
        c.beginPath(); c.moveTo(-10, -4); c.lineTo(-16, -9); c.lineTo(-13, -3); c.closePath(); K.fill(c, '#e0463a', 1.1);
        c.beginPath(); c.moveTo(-10, 4); c.lineTo(-16, 9); c.lineTo(-13, 3); c.closePath(); K.fill(c, '#b8322a', 1.1);
        c.beginPath(); c.moveTo(-14, -3); c.lineTo(-11, -4.4); c.lineTo(-11, 4.4); c.lineTo(-14, 3); c.closePath(); K.fill(c, '#5a5a68', 1.1);
        c.beginPath(); c.moveTo(-11, -4.5); c.lineTo(8, -4.5); c.quadraticCurveTo(15, -4, 17, 0); c.quadraticCurveTo(15, 4, 8, 4.5); c.lineTo(-11, 4.5); c.closePath();
        K.fill(c, K.lg(c, 0, -4.5, 0, 4.5, [[0, '#9aa0b0'], [0.3, '#ffffff'], [0.6, '#c8ccd8'], [1, '#6a7080']]), LW);
        c.beginPath(); c.moveTo(8, -4.5); c.quadraticCurveTo(15, -4, 17, 0); c.quadraticCurveTo(15, 4, 8, 4.5); c.closePath(); K.fill(c, K.lg(c, 0, -4.5, 0, 4.5, ['#ff8a7a', '#e0463a', '#9a2a22']), 1.1);
        c.fillStyle = '#5a6070'; for (let i = 0; i < 4; i++) { E(c, -8 + i * 4.5, -2.8, 0.55, 0.55); c.fill(); E(c, -8 + i * 4.5, 2.8, 0.55, 0.55); c.fill(); }
        E(c, 0.5, 0, 2, 2); K.fill(c, K.rg(c, 0.5, 0, 0.2, 2, ['#d8f4ff', '#3a88c8']), 0.9);
        c.restore();
        // přední ploutev (s klíčem při schopnosti)
        c.save(); c.translate(10, 3);
        c.rotate(act ? -1.4 + Math.sin(t * 12) * 0.25 : 0.35 + sw * 0.35);
        if (act) {
          c.save(); c.translate(9, 1); c.rotate(-0.3);
          c.beginPath(); c.moveTo(-1, 0); c.lineTo(9, 0); K.stroke(c, OUT, 3.6); c.beginPath(); c.moveTo(-1, 0); c.lineTo(9, 0); K.stroke(c, '#c8ccd8', 2.2);
          c.beginPath(); c.arc(11, 0, 3, 0.6, TAU - 0.6); K.stroke(c, OUT, 3.2); c.beginPath(); c.arc(11, 0, 3, 0.6, TAU - 0.6); K.stroke(c, '#dde0ea', 1.8);
          c.restore();
        }
        E(c, 5, 2, 7, 3); K.fill(c, K.lg(c, 0, -1, 0, 5, ['#9ae07a', '#5aa83a']), 1.3);
        c.strokeStyle = 'rgba(40,90,20,.5)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(3, 1); c.lineTo(9, 2); c.stroke();
        c.restore();
        // šála vlající za hlavou
        {
          const w1 = Math.sin(t * 7) * 2, w2 = Math.sin(t * 7 + 1.4) * 2.5;
          c.beginPath(); c.moveTo(16, -6); c.bezierCurveTo(12, -9 + w1, 8, -12 + w2, 3, -14 + w2); c.lineTo(1.5, -12 + w2 * 1.2); c.lineTo(4, -10 + w2);
          c.bezierCurveTo(8, -7 + w2, 11, -4 + w1, 16, -1); c.closePath();
          K.fill(c, K.lg(c, 16, 0, -6, 0, ['#ff5a4a', '#c82a3a']), 1.2);
          c.strokeStyle = '#ffe0a0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(7, -10 + w2 * 0.8); c.lineTo(8.5, -6.5 + w1 * 0.6); c.moveTo(10, -8.5 + w1 * 0.6); c.lineTo(11.5, -4.5 + w1 * 0.5); c.stroke();
          E(c, 15, -3.5, 3.2, 3.6); K.fill(c, '#e0403a', 1.2);
        }
        // oprava hradeb – kamínek s jiskrami
        if (act) {
          const p = (t * 1.5) % 1, bx = 30, by = -22 + Math.sin(t * 4) * 1.5;
          c.save(); c.translate(bx, by); c.rotate(Math.sin(t * 3) * 0.15);
          c.beginPath(); c.rect(-6, -4, 12, 8); K.fill(c, K.lg(c, 0, -4, 0, 4, ['#d8d0c0', '#9a8e7a']), 1.3);
          c.strokeStyle = 'rgba(60,50,40,.6)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.moveTo(-1, -4); c.lineTo(-1, 0); c.moveTo(3, 0); c.lineTo(3, 4); c.stroke();
          c.restore();
          for (let i = 0; i < 5; i++) { const q = (p + i / 5) % 1, a = i * 1.3 + t; c.save(); c.globalAlpha = 1 - q; if (i % 2) { plus(c, bx + Math.cos(a) * (6 + q * 8), by + Math.sin(a) * (5 + q * 6), 2.4, OUT); plus(c, bx + Math.cos(a) * (6 + q * 8), by + Math.sin(a) * (5 + q * 6), 1.7, '#7dffa8'); } else K.sparkle(c, bx + Math.cos(a) * (7 + q * 9), by + Math.sin(a) * (6 + q * 6), 2.6, '#fff6c0'); c.restore(); }
        }
        c.restore();
      },

      /* ---------------- BUBLINKA – rybka v létající kouli ---------------- */
      rybka(c, t, act) {
        const bob = Math.sin(t * 2.2) * 2, fl = Math.sin(t * 9), bl = blk(t, 0.7), R = 17, cy = -6;
        c.save(); c.translate(0, bob);
        // křidélka
        const wing = (s, a) => {
          c.save(); c.translate(s * 14, cy - 3); c.scale(s, 1); c.rotate(-0.3 - fl * 0.35);
          c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(6, -10, 16, -12, 19, -8); c.quadraticCurveTo(17, -6, 18, -4); c.quadraticCurveTo(14, -3, 15, -0.5); c.quadraticCurveTo(10, 0, 10, 2.5); c.quadraticCurveTo(5, 3, 0, 4); c.closePath();
          K.fill(c, K.lg(c, 0, -8, 0, 4, [a ? '#ffffff' : '#dfe8f4', a ? '#d4e4f6' : '#a8bcd4']), 1.3);
          c.strokeStyle = 'rgba(70,100,150,.4)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(3, 0); c.quadraticCurveTo(10, -6, 17, -7); c.moveTo(4, 2); c.quadraticCurveTo(10, -1, 15, -2); c.stroke();
          c.restore();
        };
        wing(-1, 1); wing(1, 1);
        // zadní stěna koule
        E(c, 0, cy, R, R); c.fillStyle = 'rgba(190,230,255,.28)'; c.fill();
        c.save(); E(c, 0, cy, R - 0.6, R - 0.6); c.clip();
        // voda
        const sy = cy - 9 + (act ? Math.sin(t * 10) * 1.6 : 0);
        c.beginPath(); c.moveTo(-R, sy); for (let x = -R; x <= R; x += 3) c.lineTo(x, sy + Math.sin(x * 0.35 + t * 3) * 0.9 + (act ? Math.sin(x * 0.5 + t * 12) * 1.5 : 0)); c.lineTo(R, cy + R); c.lineTo(-R, cy + R); c.closePath();
        c.fillStyle = K.lg(c, 0, sy, 0, cy + R, ['rgba(120,210,255,.55)', 'rgba(40,130,220,.75)']); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.stroke();
        // písek, kamínky a hrádek
        c.beginPath(); c.moveTo(-R, cy + 12); c.quadraticCurveTo(0, cy + 9, R, cy + 12); c.lineTo(R, cy + R); c.lineTo(-R, cy + R); c.closePath(); c.fillStyle = '#f0d8a0'; c.fill();
        for (let i = 0; i < 6; i++) { E(c, -11 + i * 4.4, cy + 13.2 + K.rnd(i) * 1.5, 1.6, 1.1); c.fillStyle = ['#ff8a8a', '#8ad8ff', '#ffe08a', '#b8ff9a'][i % 4]; c.fill(); }
        // malý hrad (Castle WARS!)
        c.beginPath(); c.moveTo(4, cy + 12); c.lineTo(4, cy + 2); for (let i = 0; i < 5; i++) { const x = 4 + i * 2; c.lineTo(x, cy + (i % 2 ? 2 : 0.4)); c.lineTo(x + 2, cy + (i % 2 ? 2 : 0.4)); } c.lineTo(14, cy + 2); c.lineTo(14, cy + 12); c.closePath();
        K.fill(c, K.lg(c, 4, 0, 14, 0, ['#c8bca8', '#8a7e6e']), 1);
        c.beginPath(); c.arc(9, cy + 12, 2.2, PI, 0); c.lineTo(11.2, cy + 12); c.fillStyle = '#3a2a3a'; c.fill();
        c.fillStyle = '#3a2a3a'; c.fillRect(6, cy + 4.5, 1.2, 2); c.fillRect(10.8, cy + 4.5, 1.2, 2);
        c.beginPath(); c.moveTo(9, cy + 0.6); c.lineTo(9, cy - 4); K.stroke(c, OUT, 0.8); c.beginPath(); c.moveTo(9, cy - 4); c.lineTo(12 + Math.sin(t * 3) * 0.6, cy - 3.2); c.lineTo(9, cy - 2.3); c.closePath(); c.fillStyle = '#e83a4a'; c.fill();
        // chaluha
        c.beginPath(); c.moveTo(-9, cy + 12); c.bezierCurveTo(-11 + Math.sin(t * 2) * 2, cy + 6, -7 + Math.sin(t * 2 + 1) * 2, cy + 2, -9 + Math.sin(t * 2 + 2) * 2.5, cy - 3); K.stroke(c, '#2a9a4a', 2.2);
        c.beginPath(); c.moveTo(-6, cy + 12); c.bezierCurveTo(-4 + Math.sin(t * 2.4) * 2, cy + 8, -7 + Math.sin(t * 2.4 + 1) * 2, cy + 5, -5 + Math.sin(t * 2.4 + 2) * 2, cy + 2); K.stroke(c, '#4ac86a', 1.6);
        // bublinky
        for (let i = 0; i < 4; i++) { const p = (t * 0.5 + i / 4) % 1; E(c, 8 + Math.sin(t * 3 + i) * 1.5 - i * 2, cy + 6 - p * 14, 0.8 + i * 0.25, 0.8 + i * 0.25); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.6; c.stroke(); }
        // rybka
        {
          const fx = -1 + Math.sin(t * 1.1) * 2 + (act ? 2 : 0), fy = cy + 1 + Math.sin(t * 1.7) * 1.2 - (act ? 3 : 0), tw = Math.sin(t * 6) * 0.25;
          c.save(); c.translate(fx, fy); c.rotate(act ? -0.25 : Math.sin(t * 1.1 + 1) * 0.06);
          // ocas
          c.save(); c.translate(-6, 0); c.rotate(tw);
          c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-5, -7, -11, -9, -10, -3); c.quadraticCurveTo(-8, 0, -10, 4); c.bezierCurveTo(-10, 9, -4, 7, 0, 0); c.closePath();
          K.fill(c, K.lg(c, 0, 0, -10, 0, ['rgba(255,140,40,.95)', 'rgba(255,220,120,.75)']), 1);
          c.strokeStyle = 'rgba(200,80,20,.5)'; c.lineWidth = 0.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-1, 0); c.lineTo(-9, i * 2.6); c.stroke(); }
          c.restore();
          // hřbetní ploutev
          c.beginPath(); c.moveTo(-3, -4.6); c.quadraticCurveTo(-2, -9 - tw * 2, 3, -6); c.lineTo(2, -4.5); c.closePath(); K.fill(c, 'rgba(255,190,90,.95)', 0.9);
          E(c, 0, 0, 8, 5.5); K.fill(c, K.rg(c, 0, 0, 0.5, 9, [[0, '#ffe0a0'], [0.4, '#ff9a3a'], [1, '#d85a14']], -1, -3), 1.3);
          c.strokeStyle = 'rgba(190,70,10,.45)'; c.lineWidth = 0.6;
          for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(-4 + i * 2.6, -1 + j * 2.6, 1.3, -0.6 * PI, 0.6 * PI); c.stroke(); }
          // ploutvička
          c.save(); c.translate(1, 2.5); c.rotate(0.5 + Math.sin(t * 8) * 0.3); E(c, -2, 0, 2.6, 1.3); K.fill(c, 'rgba(255,200,110,.95)', 0.8); c.restore();
          K.eye(c, 4.2, -1.2, 2.9, '#1a1a2a', 0.6, bl);
          E(c, 7.8, 1.5, 1, 1.2); K.fill(c, '#ff6a7a', 0.8);
          K.blush(c, 3.5, 2.4, 1.3);
          c.restore();
        }
        c.restore(); // clip
        // přední sklo: odlesky + obrys
        E(c, 0, cy, R, R); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke();
        c.beginPath(); c.arc(0, cy, R - 2.5, PI * 0.95, PI * 1.38); K.stroke(c, 'rgba(255,255,255,.85)', 2.4);
        c.beginPath(); c.arc(0, cy, R - 2.5, PI * 1.45, PI * 1.52); K.stroke(c, 'rgba(255,255,255,.85)', 2.4);
        c.beginPath(); c.arc(0, cy, R - 2, PI * 0.1, PI * 0.4); K.stroke(c, 'rgba(255,255,255,.35)', 1.5);
        // hrdlo koule
        E(c, 0, cy - R + 1.5, 8, 2.4); K.fill(c, K.lg(c, 0, cy - R - 1, 0, cy - R + 4, ['#ffffff', '#9ad0f0']), 1.4);
        E(c, 0, cy - R + 1.3, 5.6, 1.2); c.fillStyle = 'rgba(40,120,200,.45)'; c.fill();
        // vlna při schopnosti
        if (act) {
          const p = (t * 1.6) % 1, gx = 10 + p * 12;
          c.save(); c.globalAlpha = 1 - p * 0.5;
          c.beginPath(); c.moveTo(4, cy - R + 1); c.bezierCurveTo(14, cy - 30, gx + 18, cy - 26, gx + 16, cy - 2);
          c.quadraticCurveTo(gx + 14, cy - 8, gx + 9, cy - 9); c.bezierCurveTo(gx + 12, cy - 18, 12, cy - 22, 6, cy - R + 1); c.closePath();
          K.fill(c, K.lg(c, 0, cy - 30, 0, cy, ['#d8f4ff', '#4ab0f0', '#2a78d0']), 1.3);
          c.beginPath(); c.moveTo(8, cy - 22); c.quadraticCurveTo(gx + 6, cy - 28, gx + 14, cy - 18); K.stroke(c, 'rgba(255,255,255,.85)', 1.4);
          for (let i = 0; i < 5; i++) { const q = (p + i * 0.19) % 1, x = gx + 12 + i * 2.2 + q * 5, y = cy - 8 + q * 16 - i * 3, r = 1.8 - i * 0.2; c.beginPath(); c.moveTo(x, y - r * 2); c.quadraticCurveTo(x + r, y - r * 0.4, x + r, y); c.arc(x, y, r, 0, PI); c.quadraticCurveTo(x - r, y - r * 0.4, x, y - r * 2); K.fill(c, '#9ae0ff', 0.9); K.gloss(c, x - r * 0.3, y - r * 0.2, r * 0.3, r * 0.4, 0, 0.9); }
          c.restore();
        }
        c.restore();
      },

      /* ---------------- JINDRA – zlatá slepice ---------------- */
      slepice(c, t, act) {
        const bl = blk(t, 1.6), peck = act ? 0 : Math.max(0, Math.sin(t * 1.7)) ** 6, tail = Math.sin(t * 2) * 0.05;
        const flap = act ? Math.sin(t * 16) : 0;
        c.save();
        // hnízdečko za ní
        c.beginPath(); c.moveTo(-26, 21); c.quadraticCurveTo(-16, 28, -4, 22); c.quadraticCurveTo(-15, 17, -26, 21); c.closePath(); K.fill(c, '#c8963a', 1.2);
        // zlaté vajíčko v hnízdě
        E(c, -14, 18.5 - (act ? ((t * 1.4) % 1) * 4 : 0), 4, 5); K.fill(c, K.rg(c, -14, 18, 0.5, 6, [[0, '#fffbe0'], [0.4, '#ffd84a'], [1, '#c8860e']], -15.5, 16), 1.2);
        c.strokeStyle = '#e0b060'; c.lineWidth = 0.8; for (let i = 0; i < 7; i++) { const x = -25 + i * 3.2; c.beginPath(); c.moveTo(x, 21.5 + K.rnd(i) * 2); c.lineTo(x + 4, 23 + K.rnd(i + 4) * 2); c.stroke(); }
        c.strokeStyle = '#8a5a1a'; c.beginPath(); c.moveTo(-24, 22); c.quadraticCurveTo(-15, 26.5, -5, 22.5); c.stroke();
        // nohy
        for (const [lx, d] of [[-3, 0], [5, 0.4]]) {
          c.beginPath(); c.moveTo(lx, 14); c.lineTo(lx + 0.5, 22.5); K.stroke(c, OUT, 3.6); c.beginPath(); c.moveTo(lx, 14); c.lineTo(lx + 0.5, 22.5); K.stroke(c, '#f0a030', 2);
          c.beginPath(); c.moveTo(lx - 3, 24.5); c.lineTo(lx + 0.5, 22.5); c.lineTo(lx + 5, 24.6); c.moveTo(lx + 0.5, 22.5); c.lineTo(lx + 2.5, 25); K.stroke(c, OUT, 2.8);
          c.beginPath(); c.moveTo(lx - 3, 24.5); c.lineTo(lx + 0.5, 22.5); c.lineTo(lx + 5, 24.6); c.moveTo(lx + 0.5, 22.5); c.lineTo(lx + 2.5, 25); K.stroke(c, '#f0a030', 1.4);
        }
        // ocasní pera
        c.save(); c.translate(-12, -2); c.rotate(tail);
        const fcol = ['#b8761a', '#d8a030', '#f0c050', '#c88a20'];
        for (let i = 0; i < 4; i++) {
          c.save(); c.rotate(-0.95 + i * 0.32);
          c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-6, -5, -16, -6, -19, -2); c.bezierCurveTo(-14, 1, -6, 3, 0, 4); c.closePath();
          K.fill(c, K.lg(c, 0, 0, -18, -3, [K.light(fcol[i], 0.3), fcol[i], K.dark(fcol[i], 0.25)]), 1.2);
          c.beginPath(); c.moveTo(-1, 2); c.quadraticCurveTo(-9, -1, -17, -2); K.stroke(c, 'rgba(255,240,180,.6)', 0.6);
          c.restore();
        }
        c.restore();
        // tělo
        c.beginPath(); c.moveTo(-15, -2); c.bezierCurveTo(-20, 12, -6, 19, 4, 17); c.bezierCurveTo(16, 15, 18, 2, 14, -6);
        c.bezierCurveTo(12, -10, 7, -12, 6, -14); c.lineTo(4, -10); c.bezierCurveTo(-2, -6, -10, -8, -15, -2); c.closePath();
        K.fill(c, K.rg(c, 2, 3, 2, 22, [[0, '#fff8d8'], [0.45, '#ffe28a'], [1, '#d8a640']], 6, -4), 1.7);
        // šupinky peří na prsou
        c.strokeStyle = 'rgba(190,130,30,.55)'; c.lineWidth = 0.8;
        for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const x = 6 + k * 3 - r * 1.2, y = 2 + r * 3.6 + k * 0.5; c.beginPath(); c.arc(x, y, 1.6, 0.15 * PI, 0.85 * PI); c.stroke(); }
        // hlava
        c.save(); c.translate(11, -12); c.rotate(peck * 0.5 - (act ? 0.25 : 0)); c.translate(-11, 12);
        // hřebínek
        c.beginPath(); c.moveTo(6, -18); c.quadraticCurveTo(5, -25, 9, -24); c.quadraticCurveTo(10, -28, 13.5, -25.5); c.quadraticCurveTo(16.5, -27, 17, -23); c.quadraticCurveTo(19, -21, 16, -19); c.closePath();
        K.fill(c, K.rg(c, 12, -22, 0.5, 7, ['#ff9a8a', '#f03a3a', '#b01a2a']), 1.3);
        E(c, 11.5, -14, 8.2, 7.6); K.fill(c, K.rg(c, 11.5, -14, 0.5, 9, [[0, '#fffbe8'], [0.5, '#ffe9a0'], [1, '#e0b450']], 9, -17), 1.6);
        // lalůček
        c.beginPath(); c.moveTo(16, -9.5); c.quadraticCurveTo(15, -4, 17.5, -4.2); c.quadraticCurveTo(20, -5, 18.5, -9.5); c.closePath(); K.fill(c, '#f03a3a', 1.1);
        // zobák
        const op = act ? 0.5 + 0.5 * Math.abs(Math.sin(t * 9)) : 0;
        c.beginPath(); c.moveTo(18.5, -15); c.quadraticCurveTo(23.5, -14.5, 24.5, -12.5 - op); c.lineTo(18.5, -11.8); c.closePath(); K.fill(c, K.lg(c, 0, -15, 0, -11, ['#ffd060', '#f09020']), 1.1);
        c.beginPath(); c.moveTo(18.5, -11.6); c.lineTo(23, -11.2 + op * 1.5); c.lineTo(18.5, -9.6); c.closePath(); K.fill(c, '#e08018', 1);
        K.eye(c, 14, -15, 3.3, '#d87a1a', 0.6, bl);
        // řasy
        c.strokeStyle = OUT; c.lineWidth = 0.9; c.beginPath(); c.moveTo(11.6, -18.2); c.lineTo(10.6, -19.6); c.moveTo(13, -18.9); c.lineTo(12.6, -20.4); c.stroke();
        K.blush(c, 12, -10.3, 2);
        c.restore();
        // křídlo
        c.save(); c.translate(-4, 0); c.rotate(-flap * 0.5 - (act ? 0.3 : 0));
        c.beginPath(); c.moveTo(-6, -2); c.bezierCurveTo(2, -6, 12, -2, 10, 6); c.bezierCurveTo(6, 10, -2, 11, -8, 8);
        c.lineTo(-11, 9); c.lineTo(-9, 6); c.lineTo(-12, 5.5); c.lineTo(-9, 3); c.closePath();
        K.fill(c, K.lg(c, 0, -4, 0, 10, ['#ffe9a0', '#e8b040', '#c88a20']), 1.4);
        c.strokeStyle = 'rgba(140,90,10,.55)'; c.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6 + i * 4, 1 + i * 0.5); c.quadraticCurveTo(-3 + i * 4, 5, -8 + i * 2, 8 - i * 0.3); c.stroke(); }
        K.gloss(c, 2, -1.5, 4, 1.2, -0.1, 0.45);
        c.restore();
        // mince a jiskry při schopnosti
        if (act) {
          for (let i = 0; i < 4; i++) {
            const p = (t * 1.3 + i / 4) % 1, x = -16 + (i - 1.5) * 5 + p * (i - 1.5) * 6, y = 14 - Math.sin(p * PI) * 26;
            c.save(); c.globalAlpha = Math.min(1, (1 - p) * 3); coin(c, x, y, 3.8, t * 6 + i); c.restore();
          }
          K.sparkle(c, -20, 8 + Math.sin(t * 7) * 2, 2.6, '#fffbe0'); K.sparkle(c, -6, 6 + Math.cos(t * 6) * 2, 2, '#ffffff');
        } else { c.save(); c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3); K.sparkle(c, -12, 14.5, 1.8, '#ffffff'); c.restore(); }
        c.restore();
      },

      /* ---------------- SIR PIŠTÍK – myší rytíř ---------------- */
      mys(c, t, act) {
        const bl = blk(t, 2.7), br = Math.sin(t * 2.4), ls = act ? Math.min(1, ((t * 2.5) % 1) * 4) : 0;
        c.save(); c.translate(act ? 3 * ls : 0, 0);
        c.translate(0, 24); c.scale(1 + br * 0.01, 1 - br * 0.012); c.translate(0, -24);
        // plášť
        const cw = Math.sin(t * 2.6) * 1.5;
        c.beginPath(); c.moveTo(-1, -6); c.quadraticCurveTo(-12, 2, -17 + cw, 18); c.quadraticCurveTo(-11, 21, -5 + cw * 0.5, 17); c.quadraticCurveTo(-4, 6, 3, -5); c.closePath();
        K.fill(c, K.lg(c, -15, 0, 0, 0, ['#8a1a2a', '#d83a4a']), LW);
        // ocásek s obvazem
        c.beginPath(); c.moveTo(-6, 20); c.bezierCurveTo(-18, 24, -28, 18, -26, 8 + Math.sin(t * 2) * 2); c.bezierCurveTo(-25, 3, -21, 4, -22, 7);
        K.stroke(c, OUT, 3.4); c.beginPath(); c.moveTo(-6, 20); c.bezierCurveTo(-18, 24, -28, 18, -26, 8 + Math.sin(t * 2) * 2); c.bezierCurveTo(-25, 3, -21, 4, -22, 7); K.stroke(c, '#f4a8b0', 1.8);
        c.beginPath(); c.moveTo(-18.5, 19.8); c.lineTo(-17.5, 22.6); K.stroke(c, OUT, 3.2); c.beginPath(); c.moveTo(-18.5, 19.8); c.lineTo(-17.5, 22.6); K.stroke(c, '#fff6e6', 2);
        // nožky
        E(c, -3, 23.5, 4.4, 2.4); K.fill(c, '#f4b0b8', 1.2); E(c, 6, 23.5, 4.6, 2.4); K.fill(c, '#f4b0b8', 1.2);
        // tělo
        E(c, 1, 10, 10, 13); K.fill(c, sh(c, 1, 10, 12, '#b0a8a0', 0.45, 0.35), LW);
        E(c, 4, 13, 5.5, 8); c.fillStyle = 'rgba(255,240,230,.5)'; c.fill();
        // náprsník – oříšková skořápka
        c.beginPath(); c.moveTo(-6, 2); c.quadraticCurveTo(2, -1, 10, 3); c.quadraticCurveTo(10, 12, 2, 15); c.quadraticCurveTo(-6, 12, -6, 2); c.closePath();
        K.fill(c, K.rg(c, 2, 6, 1, 11, ['#e8b878', '#b07a3a', '#7a4a1e'], 0, 3), 1.3);
        c.strokeStyle = 'rgba(80,40,10,.5)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(3, 7, 2, 14.5); c.moveTo(-3, 4); c.quadraticCurveTo(-1, 8, -2, 12); c.moveTo(7, 4); c.quadraticCurveTo(5, 8, 6, 12); c.stroke();
        // opasek
        c.beginPath(); c.moveTo(-8.5, 15); c.quadraticCurveTo(1, 18, 10.5, 15); K.stroke(c, OUT, 3.2); c.beginPath(); c.moveTo(-8.5, 15); c.quadraticCurveTo(1, 18, 10.5, 15); K.stroke(c, '#6a3a1e', 2);
        c.beginPath(); c.rect(0, 14.6, 3, 2.6); K.fill(c, '#d8d8e0', 0.8);
        // štít – knoflík
        c.save(); c.translate(-7, 9); c.rotate(-0.2);
        E(c, 0, 0, 7, 7.4); K.fill(c, K.rg(c, 0, 0, 0.5, 8, [[0, '#6ac0ff'], [0.6, '#2a6ad0'], [1, '#183a8a']], -2, -3), 1.4);
        E(c, 0, 0, 5, 5.3); c.strokeStyle = 'rgba(10,20,60,.6)'; c.lineWidth = 0.9; c.stroke();
        for (const [hx, hy] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) { E(c, hx, hy, 0.9, 0.9); c.fillStyle = '#0d1a3a'; c.fill(); }
        K.gloss(c, -2.5, -3.5, 2.2, 1.1, -0.6, 0.6);
        c.restore();
        // hlava
        c.save(); c.translate(6, -9); c.rotate(act ? 0.12 : Math.sin(t * 1.2) * 0.05);
        // zadní ucho
        E(c, -8.5, -8.5, 6.4, 6.8, -0.3); K.fill(c, '#a8a098', LW); E(c, -8.3, -8.2, 4.1, 4.5, -0.3); c.fillStyle = '#e88a9a'; c.fill();
        // hlava + čumáček
        c.beginPath(); c.moveTo(-8, 2); c.bezierCurveTo(-10, -9, 2, -12, 6, -5); c.quadraticCurveTo(11, -2, 13, 1.5); c.quadraticCurveTo(10, 6, 2, 6); c.quadraticCurveTo(-6, 6, -8, 2); c.closePath();
        K.fill(c, sh(c, 0, -2, 11, '#bab2aa', 0.5, 0.3), LW);
        // přední ucho
        E(c, 3, -12, 6.2, 6.6, 0.25); K.fill(c, '#bab2aa', LW); E(c, 3.2, -11.6, 4, 4.4, 0.25); c.fillStyle = K.rg(c, 3.2, -11.6, 0.5, 4.4, ['#ffc0c8', '#e88a9a']); c.fill();
        // náprstková přilba
        c.beginPath(); c.moveTo(-8.5, -3.5); c.lineTo(-6.8, -11.5); c.quadraticCurveTo(-2.5, -14.2, 2, -12); c.lineTo(3.2, -4.4); c.quadraticCurveTo(-3, -2, -8.5, -3.5); c.closePath();
        K.fill(c, K.lg(c, -8, 0, 3, 0, [[0, '#7a808e'], [0.4, '#eef0f6'], [1, '#8a90a0']]), 1.4);
        c.fillStyle = 'rgba(40,44,60,.45)'; for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { E(c, -6.3 + k * 2.3 + r * 0.3, -10.8 + r * 2.2, 0.45, 0.45); c.fill(); }
        c.beginPath(); c.moveTo(-8.7, -3.6); c.quadraticCurveTo(-3, -1.8, 3.4, -4.4); K.stroke(c, OUT, 2.6); c.beginPath(); c.moveTo(-8.7, -3.6); c.quadraticCurveTo(-3, -1.8, 3.4, -4.4); K.stroke(c, '#d8b040', 1.4);
        // chochol z peříčka
        c.beginPath(); c.moveTo(-2.5, -13); c.bezierCurveTo(-6, -22, -14 + Math.sin(t * 3) * 1.5, -24, -17 + Math.sin(t * 3) * 2, -19);
        c.bezierCurveTo(-12, -19, -6, -17, -1, -12.5); c.closePath(); K.fill(c, K.lg(c, -2, -13, -16, -21, ['#ff5a5a', '#c81a3a']), 1.2);
        c.strokeStyle = 'rgba(255,200,200,.7)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-2, -13); c.quadraticCurveTo(-8, -19, -15, -20); c.stroke();
        // oko, nos, vousky
        K.eye(c, 4.5, -3, 3.2, '#3a2a1a', 0.7, act ? 0.3 : bl);
        if (act) { c.beginPath(); c.moveTo(1.5, -7.2); c.lineTo(7, -6); K.stroke(c, OUT, 1.2); }
        E(c, 13.2, 1.2, 1.7, 1.4); K.fill(c, '#ff7a8a', 1); K.gloss(c, 12.8, 0.6, 0.6, 0.4, 0, 0.8);
        c.strokeStyle = 'rgba(40,30,40,.6)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(10, 2.5); c.lineTo(16, 1); c.moveTo(10, 3.2); c.lineTo(16, 3.6); c.stroke();
        c.beginPath(); c.moveTo(8, 4); c.quadraticCurveTo(9.5, 5.2, 11, 4.2); K.stroke(c, OUT, 0.9);
        K.blush(c, 6, 2.5, 1.8);
        c.restore();
        // jehla – meč (s nití)
        c.save(); c.translate(11, 7); c.rotate(act ? -0.05 - (1 - ls) * 0.4 : -1.0 + Math.sin(t * 1.5) * 0.05);
        const L = act ? 26 : 22;
        c.beginPath(); c.moveTo(-1, 0); c.bezierCurveTo(-5, 4, -4 + Math.sin(t * 4) * 2, 8, -9 + Math.sin(t * 3) * 3, 10); K.stroke(c, '#e83a4a', 0.9);
        c.beginPath(); c.moveTo(0, -1.3); c.lineTo(L - 4, -0.9); c.lineTo(L, 0); c.lineTo(L - 4, 0.9); c.lineTo(0, 1.3); c.closePath(); K.fill(c, K.lg(c, 0, -1.3, 0, 1.3, ['#ffffff', '#b8c0d0', '#6a7080']), 1);
        E(c, 1.4, 0, 1.2, 0.5); c.fillStyle = OUT; c.fill();
        c.beginPath(); c.rect(3, -2.6, 1.6, 5.2); K.fill(c, '#d8b040', 0.9); // záštita
        c.beginPath(); c.moveTo(-2.4, -1.7); c.lineTo(3, -1.7); c.lineTo(3, 1.7); c.lineTo(-2.4, 1.7); c.closePath(); K.fill(c, '#e83a4a', 0.9); // omotaná nit
        c.strokeStyle = '#a81a2a'; c.lineWidth = 0.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-1.6 + i * 1.6, -1.7); c.lineTo(-0.6 + i * 1.6, 1.7); c.stroke(); }
        const gl = (t * 0.7) % 1; if (!act && gl < 0.3) { c.save(); c.globalAlpha = Math.sin(gl / 0.3 * PI); K.sparkle(c, 5 + gl / 0.3 * (L - 6), -0.5, 2.2, '#ffffff'); c.restore(); }
        if (act) { c.save(); c.globalAlpha = 0.6; c.beginPath(); c.moveTo(L + 1, -3); c.lineTo(L + 6, 0); c.lineTo(L + 1, 3); K.stroke(c, '#ffffff', 1); c.restore(); K.sparkle(c, L + 1, 0, 4 + Math.sin(t * 20), '#fffbe0'); }
        c.restore();
        // ruka držící jehlu
        E(c, 11, 7, 2.6, 2.4); K.fill(c, '#c8c0b8', 1.2);
        if (act) speed(c, -10, 2, 3, 10, '#ffffff', 0.5 * ls);
        c.restore();
      },

      /* ---------------- TŘPYTKA – duhový motýl ---------------- */
      motyl(c, t, act) {
        const bob = Math.sin(t * 2.5) * 2.2, fl = act ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t * 4.5)), bl = blk(t, 0.9);
        c.save(); c.translate(0, -6 + bob);
        // pyl
        const npol = act ? 12 : 5;
        for (let i = 0; i < npol; i++) {
          const p = (t * (act ? 0.7 : 0.35) + K.rnd(i) ) % 1, x = -14 + K.rnd(i + 20) * 26 + Math.sin(t * 2 + i) * 2.5, y = 6 + p * (act ? 26 : 22);
          c.save(); c.globalAlpha = Math.sin(p * PI) * (act ? 1 : 0.8);
          if (i % 3 === 0) K.sparkle(c, x, y, act ? 2.6 : 1.8, '#fff6c8'); else { E(c, x, y, 1, 1); c.fillStyle = ['#ffe36a', '#ff9ae0', '#b8f0ff'][i % 3]; c.fill(); }
          c.restore();
        }
        const rain = (x, y, r) => K.rg(c, x, y, r * 0.08, r, [[0, '#fff6fb'], [0.18, '#ff8ae0'], [0.36, '#ff9a5a'], [0.52, '#ffe35a'], [0.68, '#6ae08a'], [0.84, '#5ab0ff'], [1, '#9a6aff']]);
        const wings = (dim) => {
          // horní křídlo
          c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-6, -14, -22, -26, -28, -18); c.bezierCurveTo(-31, -12, -24, -4, -6, 1); c.closePath();
          K.fill(c, rain(-2, 0, 30), 1.4);
          if (!dim) {
            c.save(); c.clip();
            c.strokeStyle = 'rgba(70,30,90,.5)'; c.lineWidth = 0.8;
            for (const [x, y] of [[-14, -20], [-22, -18], [-25, -10], [-18, -4]]) { c.beginPath(); c.moveTo(-1, -1); c.quadraticCurveTo(x * 0.5, y * 0.5 - 2, x, y); c.stroke(); }
            c.restore();
            E(c, -19, -13, 3.6, 3.2, -0.5); K.fill(c, '#3a2a6a', 0.6); E(c, -19, -13, 2, 1.8, -0.5); c.fillStyle = '#9ae8ff'; c.fill(); E(c, -19.6, -13.8, 0.7, 0.7); c.fillStyle = '#fff'; c.fill();
            c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { E(c, -26 + i * 3.5, -19.5 + i * 3.6 - (i > 1 ? (i - 1) * 2 : 0), 0.9, 0.9); c.fill(); }
          }
          // dolní křídlo
          c.beginPath(); c.moveTo(-1, 2); c.bezierCurveTo(-14, 2, -22, 10, -18, 15); c.bezierCurveTo(-15, 19, -9, 15, -8, 18); c.bezierCurveTo(-5, 18, -2, 10, -1, 2); c.closePath();
          K.fill(c, K.rg(c, -2, 2, 1, 20, [[0, '#fff0fa'], [0.3, '#ff7ad0'], [0.65, '#b06aff'], [1, '#5a8aff']]), 1.4);
          if (!dim) { E(c, -12, 10, 2.2, 2, 0.3); K.fill(c, '#ffe35a', 0.6); }
        };
        // vzdálená křídla
        c.save(); c.translate(1, -3); c.rotate(0.35); c.scale(fl * 0.8, 0.85); c.globalAlpha = 0.85; wings(true); c.restore();
        // tělíčko
        c.beginPath(); c.moveTo(2, -3); c.bezierCurveTo(-1, 2, -5, 10, -8, 14); c.quadraticCurveTo(-6, 15, -4, 13); c.bezierCurveTo(0, 8, 4, 2, 5, -2); c.closePath();
        K.fill(c, K.lg(c, -6, 0, 5, 0, ['#8a4ab8', '#d890ff']), LW);
        c.strokeStyle = 'rgba(60,20,90,.5)'; c.lineWidth = 0.7; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-0.5 - i * 1.9, 1 + i * 3); c.lineTo(3.2 - i * 1.9, 2 + i * 3); c.stroke(); }
        E(c, 3, -3, 3.8, 3.6); K.fill(c, sh(c, 3, -3, 4, '#c88aff'), 1.3);
        // tykadla
        for (const [ax, ph, s] of [[6, 0, 1], [8.5, 1, 0.9]]) {
          const ex = ax + 6 * s + Math.sin(t * 3 + ph) * 1.2, ey = -20 + Math.cos(t * 3 + ph) * 1;
          c.beginPath(); c.moveTo(ax, -9); c.quadraticCurveTo(ax + 1, -18, ex, ey); K.stroke(c, OUT, 1.2);
          E(c, ex, ey, 1.8, 1.8); K.fill(c, sh(c, ex, ey, 1.8, '#ff8ae0'), 0.9);
        }
        // hlava
        E(c, 8, -7, 6.2, 5.8); K.fill(c, sh(c, 8, -7, 6.2, '#e0a0ff', 0.5, 0.3), LW);
        K.eye(c, 10, -8, 3, '#7a3ac8', 0.6, bl);
        c.beginPath(); c.moveTo(10.5, -3.5); c.quadraticCurveTo(12, -2.3, 13.3, -3.6); K.stroke(c, OUT, 0.9);
        K.blush(c, 8, -3.5, 1.6);
        // přední křídla
        c.save(); c.translate(0, -1); c.scale(fl, 1); wings(false);
        K.gloss(c, -15, -16, 5, 1.5, -0.7, 0.35);
        { const g = (t * 0.6) % 1; if (g < 0.3) { c.save(); c.globalAlpha = Math.sin(g / 0.3 * PI); K.sparkle(c, -24 + g * 30, -18 + g * 10, 2.4, '#ffffff'); c.restore(); } }
        c.restore();
        if (act) for (let i = 0; i < 3; i++) { const p = (t * 1.1 + i / 3) % 1, x = -10 + i * 9, y = 14 + p * 14; c.save(); c.globalAlpha = Math.sin(p * PI); c.translate(x, y); c.scale(0.6, 0.6);
          c.beginPath(); c.moveTo(0, 3); c.bezierCurveTo(-5, -1, -3, -5, 0, -2.5); c.bezierCurveTo(3, -5, 5, -1, 0, 3); c.closePath(); K.fill(c, '#ff7ab8', 1.4); c.restore(); }
        c.restore();
      },

      /* ---------------- OBLÁZEK – živý kámen ---------------- */
      oblazek(c, t, act) {
        const br = Math.sin(t * 1.8), bl = blk(t, 3.1), ph = act ? (t * 2) % 1 : 0;
        c.save();
        if (act) {
          // prachový obláček při odrazu
          c.save(); c.globalAlpha = 0.65 * (1 - ph);
          for (let i = 0; i < 3; i++) { E(c, -16 - i * 6 - ph * 6, 22 - i * 1.5, 4 + ph * 4 - i, 3 + ph * 2); c.fillStyle = '#d8ccb0'; c.fill(); }
          c.restore();
          c.translate(4, -8 - Math.sin(ph * PI) * 2); c.rotate(0.35 + ph * 0.25);
          speed(c, -20, 4, 4, 12, '#ffffff', 0.55);
        } else { c.translate(0, 24); c.scale(1 + br * 0.02, 1 - br * 0.02); c.translate(0, -24); }
        // nožky
        E(c, -7, 23, 4.2, 2.6); K.fill(c, '#7a7a6c', 1.2); E(c, 7, 23, 4.2, 2.6); K.fill(c, '#7a7a6c', 1.2);
        // tělo kamene
        c.beginPath(); c.moveTo(-19, 14); c.bezierCurveTo(-23, 2, -16, -11, -4, -12); c.bezierCurveTo(4, -14, 14, -11, 18, -3);
        c.bezierCurveTo(23, 5, 21, 17, 14, 21); c.bezierCurveTo(6, 25, -12, 25, -19, 14); c.closePath();
        K.fill(c, K.rg(c, 0, 6, 2, 26, [[0, '#d6d6c8'], [0.45, '#9a9a8a'], [1, '#5a5a4e']], -6, -6), 1.8);
        c.save(); c.clip();
        // ploška (fazeta) a stíny
        c.beginPath(); c.moveTo(-18, 2); c.quadraticCurveTo(-10, -9, 2, -9); c.quadraticCurveTo(-8, -4, -12, 8); c.closePath(); c.fillStyle = 'rgba(255,255,240,.28)'; c.fill();
        c.beginPath(); c.moveTo(22, 2); c.quadraticCurveTo(14, 18, -4, 25); c.lineTo(22, 25); c.closePath(); c.fillStyle = 'rgba(40,40,30,.22)'; c.fill();
        // skvrnky
        for (let i = 0; i < 14; i++) { E(c, -17 + K.rnd(i) * 34, -8 + K.rnd(i + 30) * 30, 0.5 + K.rnd(i + 60), 0.5 + K.rnd(i + 60) * 0.8); c.fillStyle = i % 3 ? 'rgba(60,60,50,.35)' : 'rgba(255,255,240,.45)'; c.fill(); }
        c.restore();
        // prasklina
        c.beginPath(); c.moveTo(-17, 6); c.lineTo(-13, 8); c.lineTo(-14.5, 11); c.lineTo(-10, 14); K.stroke(c, 'rgba(30,30,25,.7)', 1);
        // krystalek
        c.beginPath(); c.moveTo(13, 16); c.lineTo(15, 10.5); c.lineTo(17.5, 12); c.lineTo(17, 17); c.closePath(); K.fill(c, K.lg(c, 13, 10, 18, 17, ['#e8f8ff', '#9ac8f0', '#6a8ad8']), 1);
        c.beginPath(); c.moveTo(16.8, 17.5); c.lineTo(19, 13); c.lineTo(20, 15.5); c.closePath(); K.fill(c, '#b8a0f0', 0.9);
        { const tw = (t * 0.45) % 1; if (tw < 0.25) { c.save(); c.globalAlpha = Math.sin(tw / 0.25 * PI); K.sparkle(c, 15, 11.5, 2.2, '#ffffff'); c.restore(); } }
        // mech na temeni
        c.beginPath(); c.moveTo(-13, -7); c.bezierCurveTo(-12, -12, -6, -14, -2, -13); c.bezierCurveTo(3, -16, 9, -14, 12, -9);
        c.quadraticCurveTo(9, -7, 7, -9); c.quadraticCurveTo(5, -6, 2, -8.5); c.quadraticCurveTo(-1, -5.5, -4, -8); c.quadraticCurveTo(-7, -5, -9, -7.5); c.quadraticCurveTo(-11, -5, -13, -7); c.closePath();
        K.fill(c, K.lg(c, 0, -15, 0, -6, ['#9ae05a', '#4a9a32', '#2e6a24']), 1.3);
        c.fillStyle = '#c4f088'; for (let i = 0; i < 6; i++) { E(c, -9 + i * 3.6, -12 + K.rnd(i + 5) * 2.5, 0.8, 0.8); c.fill(); }
        // klíček se dvěma lístky
        c.save(); c.translate(0, -14); c.rotate(Math.sin(t * 2.2) * 0.18);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-0.5, -4, 0.5, -7); K.stroke(c, OUT, 2.4); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-0.5, -4, 0.5, -7); K.stroke(c, '#6ac04a', 1.1);
        c.save(); c.translate(0.5, -7); c.rotate(-0.6); E(c, -3, 0, 3.2, 1.7); K.fill(c, K.lg(c, -6, 0, 0, 0, ['#c8f89a', '#5ab03a']), 1); c.restore();
        c.save(); c.translate(0.5, -7); c.rotate(0.5); E(c, 3, 0, 3.2, 1.7); K.fill(c, K.lg(c, 0, 0, 6, 0, ['#5ab03a', '#c8f89a']), 1); c.restore();
        c.restore();
        // malá houbička
        c.beginPath(); c.moveTo(9, -9); c.lineTo(9.6, -13); K.stroke(c, OUT, 2.4); c.beginPath(); c.moveTo(9, -9); c.lineTo(9.6, -13); K.stroke(c, '#fff4e0', 1.2);
        c.beginPath(); c.ellipse(9.6, -13, 3, 2.2, 0, PI, 0); c.closePath(); K.fill(c, '#e8483a', 1); c.fillStyle = '#fff'; E(c, 8.6, -14, 0.6, 0.5); c.fill(); E(c, 10.6, -14.2, 0.5, 0.4); c.fill();
        // obličej – tvrdohlavý
        const lk = act ? 0.8 : 0.4;
        K.eye(c, 2, -1, 3.8, '#5a8a3a', lk, bl); K.eye(c, 11, -1, 3.5, '#5a8a3a', lk, bl);
        // těžká víčka
        c.save(); c.beginPath(); c.rect(-3, -6, 19, 3.9 - (act ? 1 : 0)); c.fillStyle = '#8e8e7e'; c.fill(); c.restore();
        c.beginPath(); c.moveTo(-2.5, -4.8); c.lineTo(6, act ? -2.8 : -3.4); c.moveTo(7.5, act ? -3 : -3.6); c.lineTo(15, -5.4); K.stroke(c, OUT, 1.8);
        if (act) { c.beginPath(); c.moveTo(3.5, 6.5); c.lineTo(10.5, 6.5); c.lineTo(10, 8.4); c.lineTo(4, 8.4); c.closePath(); K.fill(c, '#fff', 1); c.beginPath(); c.moveTo(5.5, 6.5); c.lineTo(5.5, 8.4); c.moveTo(7.3, 6.5); c.lineTo(7.3, 8.4); c.moveTo(9, 6.5); c.lineTo(9, 8.4); K.stroke(c, OUT, 0.5); }
        else { c.beginPath(); c.moveTo(4, 7.6); c.quadraticCurveTo(7, 5.6, 10, 7.6); K.stroke(c, OUT, 1.3); }
        K.blush(c, -0.5, 4, 2); K.blush(c, 13.5, 4, 1.8);
        // ručky v bok (tvrdohlavě)
        if (!act) {
          E(c, -21, 9, 3.6, 2.7, 0.6); K.fill(c, K.lg(c, 0, 6, 0, 12, ['#b8b8a8', '#76766a']), 1.3);
          E(c, 21, 8.5, 3.6, 2.7, -0.6); K.fill(c, K.lg(c, 0, 6, 0, 12, ['#c4c4b4', '#828272']), 1.3);
        } else {
          E(c, 21, 4, 3.6, 2.6, -0.5); K.fill(c, '#a8a898', 1.3); E(c, -20, 12, 3.4, 2.5, 0.5); K.fill(c, '#8a8a7a', 1.3);
        }
        c.restore();
      },

      /* ---------------- JISKRA – světluška ---------------- */
      svetluska(c, t, act) {
        const hx = Math.sin(t * 1.3) * 2.5, hy = Math.sin(t * 2.6) * 2 - 8, bl = blk(t, 1.9), pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
        c.save(); c.translate(hx, hy); c.rotate(Math.sin(t * 1.3) * 0.06);
        // svítící tečky kolem
        for (let i = 0; i < 4; i++) { const p = (t * 0.3 + i / 4) % 1, x = -14 - p * 14 + Math.sin(t * 2 + i * 2) * 3, y = 6 - p * 10 + Math.cos(t * 1.7 + i) * 3; c.save(); c.globalAlpha = Math.sin(p * PI) * 0.9; E(c, x, y, 0.9, 0.9); c.fillStyle = '#fff6a0'; c.fill(); c.restore(); K.glow(c, x, y, 3, '#fff36a', Math.sin(p * PI) * 0.4); }
        // záře zadečku
        K.glow(c, -9, 5, 18 + pulse * 3, '#fff36a', 0.35 + pulse * 0.2);
        // blanitá křídla (rychlé bzučení)
        const wz = Math.sin(t * 40);
        for (const [a0, al] of [[-1.9, 0.45], [-1.5, 0.6]]) {
          c.save(); c.translate(-1, -6); c.rotate(a0 + wz * 0.18); c.globalAlpha = al;
          E(c, 0, -9, 4.2, 10); c.fillStyle = K.lg(c, 0, 0, 0, -19, ['#e8f4ff', 'rgba(190,220,255,.6)']); c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(60,80,130,.7)'; c.stroke();
          c.beginPath(); c.moveTo(0, -1); c.lineTo(0, -16); c.moveTo(0, -7); c.lineTo(2.5, -12); c.strokeStyle = 'rgba(80,100,150,.5)'; c.lineWidth = 0.5; c.stroke();
          c.restore();
        }
        // nožky
        c.strokeStyle = OUT; c.lineWidth = 1.1; c.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const sx = -3 + i * 4, s = Math.sin(t * 4 + i) * 0.8; c.beginPath(); c.moveTo(sx, 3); c.lineTo(sx - 1 + s, 7); c.lineTo(sx + 0.5 + s, 9); c.stroke(); }
        // svítící zadeček
        c.beginPath(); c.moveTo(-3, -3); c.bezierCurveTo(-10, -5, -19, 0, -17, 7); c.bezierCurveTo(-15, 12, -6, 10, -1, 4); c.closePath();
        K.fill(c, K.rg(c, -10, 4, 1, 11, [[0, '#ffffff'], [0.35, '#fffbb0'], [0.7, '#fff36a'], [1, '#e8b830']], -11, 3), LW);
        c.save(); c.clip(); c.strokeStyle = 'rgba(200,150,30,.5)'; c.lineWidth = 0.8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-5 - i * 4, -6); c.quadraticCurveTo(-8 - i * 4, 3, -4 - i * 4, 12); c.stroke(); } c.restore();
        // tělo + krovky
        E(c, 1, -1, 7, 5.5, -0.2); K.fill(c, sh(c, 1, -1, 7, '#4a3a5a', 0.4, 0.4), LW);
        c.beginPath(); c.moveTo(4, -5.5); c.bezierCurveTo(-3, -9, -11, -6, -13, -1); c.bezierCurveTo(-8, -2, -2, -1, 3, 0); c.closePath();
        K.fill(c, K.lg(c, 0, -8, 0, 0, ['#8a5a3a', '#5a2a1a']), 1.3);
        K.gloss(c, -4, -5.2, 4, 0.9, -0.2, 0.45);
        // hlavový štítek (oranžový jako u skutečné světlušky)
        c.beginPath(); c.ellipse(6.5, -5, 4.6, 3.4, -0.3, PI, 0); c.closePath(); K.fill(c, '#ff8a3a', 1.2);
        E(c, 6.6, -6.3, 1.2, 0.9); c.fillStyle = '#4a2a1a'; c.fill();
        // hlava
        E(c, 10, -2, 5.6, 5.2); K.fill(c, sh(c, 10, -2, 5.6, '#5a4a6a', 0.45, 0.35), LW);
        // tykadla
        for (const [ax, ph] of [[10, 0], [12, 1.3]]) { const ex = ax + 6 + Math.sin(t * 3 + ph), ey = -13 + Math.cos(t * 2.5 + ph); c.beginPath(); c.moveTo(ax, -6); c.quadraticCurveTo(ax + 1, -12, ex, ey); K.stroke(c, OUT, 1.1); E(c, ex, ey, 1.1, 1.1); c.fillStyle = '#fff36a'; c.fill(); }
        K.eye(c, 12, -2.6, 3.2, '#ffb43a', 0.6, bl);
        c.beginPath(); c.moveTo(12.4, 1.8); c.quadraticCurveTo(13.8, 3, 15, 1.6); K.stroke(c, OUT, 0.9);
        K.blush(c, 9.5, 1.5, 1.5);
        // zápalka v nožce – rekvizita pro jiskru
        c.save(); c.translate(14, 5); c.rotate(act ? -0.9 : -0.3 + Math.sin(t * 2) * 0.1);
        c.beginPath(); c.moveTo(-3, 0); c.lineTo(7, 0); K.stroke(c, OUT, 2.8); c.beginPath(); c.moveTo(-3, 0); c.lineTo(7, 0); K.stroke(c, '#f0d8a0', 1.5);
        E(c, 8, 0, 2, 1.6); K.fill(c, '#d83a2a', 1);
        if (act) {
          const fk = 1 + Math.sin(t * 25) * 0.15;
          K.glow(c, 10, 0, 10, '#ffb43a', 0.7);
          c.beginPath(); c.moveTo(8, -1.5); c.quadraticCurveTo(12 * fk, -2, 15 * fk, 0); c.quadraticCurveTo(12 * fk, 2, 8, 1.5); c.closePath(); c.fillStyle = '#ffb43a'; c.fill();
          c.beginPath(); c.moveTo(8.5, -0.8); c.quadraticCurveTo(11, -0.8, 12.5 * fk, 0); c.quadraticCurveTo(11, 0.8, 8.5, 0.8); c.closePath(); c.fillStyle = '#fffbe0'; c.fill();
        }
        c.restore();
        E(c, 14, 5, 1.5, 1.4); K.fill(c, '#4a3a5a', 0.9);
        // vystřelená jiskra
        if (act) {
          const p = (t * 1.8) % 1, x = 18 + p * 18, y = -6 - p * 8;
          for (let i = 1; i < 5; i++) { c.save(); c.globalAlpha = (1 - i / 5) * 0.8; E(c, x - i * 3.2, y + i * 1.4, 1.6 - i * 0.25, 1.6 - i * 0.25); c.fillStyle = '#ffd04a'; c.fill(); c.restore(); }
          K.glow(c, x, y, 9, '#ffcf4a', 0.8);
          c.save(); c.translate(x, y); c.rotate(t * 8); K.star(c, 0, 0, 4.5, '#ff8a2a', 4, 0.4); K.star(c, 0, 0, 3, '#fffbe0', 4, 0.4); c.restore();
        }
        c.restore();
      },

      /* ---------------- BODLÍK – ježek na deštníku ---------------- */
      jezek(c, t, act) {
        const sw = Math.sin(t * 1.4) * 0.07, bob = Math.sin(t * 1.9) * 1.5, bl = blk(t, 0.4), px = -1, py = -30;
        c.save(); c.translate(0, bob);
        c.save(); c.translate(px, py); c.rotate(sw); c.translate(-px, -py);
        // tyč deštníku
        c.beginPath(); c.moveTo(px, py); c.lineTo(px, -12); K.stroke(c, OUT, 3.2); c.beginPath(); c.moveTo(px, py); c.lineTo(px, -12); K.stroke(c, '#c8ccd8', 1.6);
        // rukojeť (zahnutá)
        const hdl = () => { c.moveTo(px, -13); c.lineTo(px, -9.5); c.arc(px + 3, -9.5, 3, PI, -0.2, true); };
        c.beginPath(); hdl(); K.stroke(c, OUT, 3.8); c.beginPath(); hdl(); K.stroke(c, '#c85a3a', 2.2);
        c.save(); c.globalAlpha = 0.5; c.beginPath(); c.moveTo(px - 0.5, -13); c.lineTo(px - 0.5, -9.5); K.stroke(c, '#ffb08a', 0.6); c.restore();
        // ježek visí pod rukojetí
        c.save(); c.translate(px + 1, -10); c.rotate(-sw * 1.6); c.translate(-px - 1, 10);
        // nožky (houpou se)
        const ls = Math.sin(t * 3) * 0.25;
        for (const [lx, o] of [[-3, 0], [5, 1.4]]) { c.save(); c.translate(lx, 16); c.rotate(ls * (o ? -1 : 1)); E(c, 1, 4, 2.6, 3.6); K.fill(c, '#c8946a', 1.2); E(c, 1.5, 7, 2.8, 1.6); K.fill(c, '#5a3a2a', 1); c.restore(); }
        // bodliny (záda)
        const sp = act ? 1.25 : 1;
        c.beginPath();
        const N = 13;
        for (let i = 0; i <= N; i++) {
          const a = PI * 0.42 + i / N * PI * 1.18, r0 = 13, r1 = (19 + (i % 2) * 1.5 + Math.sin(t * 2 + i) * 0.3) * (i % 2 ? 1 : sp);
          c.lineTo(-1 + Math.cos(a) * (i % 2 ? r0 + 1 : r1), 5 + Math.sin(a) * (i % 2 ? r0 + 1 : r1));
        }
        c.closePath(); K.fill(c, K.rg(c, -4, 4, 3, 22, [[0, '#a87a4a'], [0.6, '#6a4424'], [1, '#3a2414']], -6, -2), LW);
        c.strokeStyle = 'rgba(255,230,190,.55)'; c.lineWidth = 0.8;
        for (let i = 0; i < 10; i++) { const a = PI * 0.55 + i / 9 * PI * 0.95, r = 11 + K.rnd(i) * 3; c.beginPath(); c.moveTo(-1 + Math.cos(a) * (r - 4), 5 + Math.sin(a) * (r - 4)); c.lineTo(-1 + Math.cos(a) * r * sp, 5 + Math.sin(a) * r * sp); c.stroke(); }
        // tělo / obličej
        c.beginPath(); c.moveTo(-2, -6); c.bezierCurveTo(6, -9, 12, -2, 17, 3); c.quadraticCurveTo(19, 6, 16.5, 7.5); c.bezierCurveTo(12, 9, 10, 18, 2, 19); c.bezierCurveTo(-6, 19, -8, 10, -6, 4); c.bezierCurveTo(-5, -1, -4, -4, -2, -6); c.closePath();
        K.fill(c, K.rg(c, 5, 5, 1, 16, [[0, '#fff0d8'], [0.55, '#e8c49a'], [1, '#b88a5a']], 6, 0), LW);
        // ouško
        E(c, 2.5, -4.5, 2.6, 2.3, -0.3); K.fill(c, '#d8a87a', 1.1); E(c, 2.6, -4.3, 1.4, 1.2, -0.3); c.fillStyle = '#f4a0a8'; c.fill();
        // bříško
        E(c, 3, 13, 5, 4.6); c.fillStyle = 'rgba(255,248,230,.7)'; c.fill();
        // čumáček
        E(c, 17.2, 4.8, 2, 1.7); K.fill(c, '#2a1a1a', 1); K.gloss(c, 16.6, 4.2, 0.7, 0.45, 0, 0.8);
        // letecké brýle na čele
        c.beginPath(); c.moveTo(-2, -3); c.quadraticCurveTo(5, -8, 12, -3.5); K.stroke(c, OUT, 2.8); c.beginPath(); c.moveTo(-2, -3); c.quadraticCurveTo(5, -8, 12, -3.5); K.stroke(c, '#5a3a2a', 1.6);
        E(c, 7.5, -4.6, 2.8, 2.3, 0.2); K.fill(c, '#a8a8b8', 1.1); E(c, 7.5, -4.6, 1.8, 1.4, 0.2); c.fillStyle = K.lg(c, 0, -6, 0, -3, ['#e8fbff', '#5ab8e8']); c.fill();
        K.eye(c, 9.5, 1.2, 3.2, '#3a2010', act ? 0.8 : 0.6, bl);
        if (act) { c.beginPath(); c.moveTo(6.5, -2.3); c.lineTo(12, -1.4); K.stroke(c, OUT, 1.1); }
        c.beginPath(); c.moveTo(12.5, 8.5); c.quadraticCurveTo(14, act ? 9 : 10, 15.5, 8.3); K.stroke(c, OUT, 1);
        K.blush(c, 10.5, 6.5, 1.8);
        // ručky nahoře držící rukojeť
        tube(c, () => { c.moveTo(-3, 1); c.quadraticCurveTo(-4, -6, px - 0.4, -10.5); }, 2.4, '#9a6a40');
        tube(c, () => { c.moveTo(4, 0); c.quadraticCurveTo(4, -5, px + 1.6, -8.4); }, 2.4, '#b07a4c');
        E(c, px - 0.4, -11, 2.2, 2); K.fill(c, '#e8b890', 1.1); E(c, px + 1.6, -8.4, 2.2, 2); K.fill(c, '#f0c49a', 1.1);
        c.restore();
        // vrchlík deštníku
        const segs = 5, W = 21, top = -41;
        const edge = (i) => px - W + i * (2 * W / segs);
        c.beginPath(); c.moveTo(px - W, py + 2);
        c.bezierCurveTo(px - W, top + 3, px + W, top + 3, px + W, py + 2);
        for (let i = segs; i > 0; i--) c.quadraticCurveTo((edge(i) + edge(i - 1)) / 2, py - 1.5, edge(i - 1), py + 2);
        c.closePath();
        K.fill(c, '#e84a4a', LW);
        c.save(); c.clip();
        for (let i = 0; i < segs; i++) if (i % 2) { c.beginPath(); c.moveTo(px, top - 2); c.lineTo(edge(i), py + 3); c.lineTo(edge(i + 1), py + 3); c.closePath(); c.fillStyle = '#fff2e0'; c.fill(); }
        c.fillStyle = K.lg(c, px - W, 0, px + W, 0, [[0, 'rgba(255,255,255,.35)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(60,0,20,.35)']]); c.fillRect(px - W, top - 2, W * 2, 16);
        // puntíky
        c.fillStyle = 'rgba(255,240,120,.9)'; for (const [dx, dy] of [[-14, -33], [-3, -37], [9, -34]]) { E(c, px + dx, dy, 1.3, 1.1); c.fill(); }
        c.restore();
        c.strokeStyle = 'rgba(40,10,20,.5)'; c.lineWidth = 0.8;
        for (let i = 1; i < segs; i++) { c.beginPath(); c.moveTo(px, top + 0.5); c.quadraticCurveTo((px + edge(i)) / 2, top + 3, edge(i), py + 2); c.stroke(); }
        // špička
        c.beginPath(); c.moveTo(px, top + 1); c.lineTo(px, top - 1.5); K.stroke(c, OUT, 2.6); E(c, px, top - 1.6, 1.2, 1.2); K.fill(c, '#d8d8e0', 0.8);
        c.restore();
        // vystřelené bodliny
        if (act) {
          for (let i = 0; i < 4; i++) {
            const a = -0.1 + i * 0.3, p = (t * 2 + i * 0.23) % 1, d = 14 + p * 22, x = 4 + Math.cos(a) * d, y = 6 + Math.sin(a) * d, dx = Math.cos(a), dy = Math.sin(a);
            c.save(); c.globalAlpha = 1 - p * 0.5;
            c.beginPath(); c.moveTo(x - dx * 10, y - dy * 10); c.lineTo(x - dx * 4, y - dy * 4); K.stroke(c, 'rgba(255,255,255,.45)', 1.4);
            c.beginPath(); c.moveTo(x - dx * 6, y - dy * 6); c.lineTo(x, y); K.stroke(c, OUT, 2.6);
            c.beginPath(); c.moveTo(x - dx * 6, y - dy * 6); c.lineTo(x - dx * 2, y - dy * 2); K.stroke(c, '#a87a4a', 1.3);
            c.beginPath(); c.moveTo(x - dx * 2, y - dy * 2); c.lineTo(x, y); K.stroke(c, '#fff0d8', 1.1);
            c.restore();
          }
        }
        c.restore();
      },
    });
  }

  /* část 2 – VZÁCNÍ (rare) mazlíčci */
  {
    const LW = 1.5, PI = Math.PI, sin = Math.sin, cos = Math.cos;
    // nová cesta s elipsou
    const E = (c, x, y, rx, ry, r) => { c.beginPath(); c.ellipse(x, y, rx, ry, r || 0, 0, TAU); };
    // přidá elipsu do aktuální cesty (bez spojovací čáry)
    const AE = (c, x, y, rx, ry, r) => { r = r || 0; c.moveTo(x + rx * cos(r), y + rx * sin(r)); c.ellipse(x, y, rx, ry, r, 0, TAU); };
    // sloučená silueta: obrys jen zvenku (tah 2× pod výplní)
    const sil = (c, f, lw) => { c.lineWidth = (lw || LW) * 2; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); c.fillStyle = f; c.fill(); };
    // mrknutí (0..1) s periodou ~4 s
    const blk = (t, s) => { const p = (t + s) % 4.1; return p < 0.18 ? sin(p / 0.18 * PI) : 0; };
    const dot = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); };
    const alpha = (c, a, fn) => { const o = c.globalAlpha; c.globalAlpha = o * a; fn(); c.globalAlpha = o; };
    // obláček kouře / páry
    const puff = (c, x, y, r, col, a) => alpha(c, a, () => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.arc(x + r * 0.7, y + r * 0.2, r * 0.75, 0, TAU); c.arc(x - r * 0.6, y + r * 0.3, r * 0.65, 0, TAU); c.fillStyle = col; c.fill(); });
    // plamen mířící doprava (len, poloviční šířka w, fáze ph)
    const flameR = (c, x, y, len, w, ph) => {
      c.beginPath(); c.moveTo(x, y - w * 0.3);
      c.bezierCurveTo(x + len * 0.3, y - w * (1 + 0.15 * sin(ph)), x + len * 0.75, y - w * (0.8 + 0.25 * sin(ph * 1.3)), x + len, y + sin(ph * 2) * w * 0.25);
      c.bezierCurveTo(x + len * 0.75, y + w * (0.8 + 0.25 * cos(ph * 1.1)), x + len * 0.3, y + w * (1 + 0.15 * cos(ph)), x, y + w * 0.3);
      c.closePath();
    };
    // plamen nahoru (základna x,y; výška h; poloviční šířka w)
    const flameU = (c, x, y, h, w, ph) => {
      c.beginPath(); c.moveTo(x - w * 0.6, y);
      c.bezierCurveTo(x - w * 1.2, y - h * 0.35, x - w * (0.4 + 0.2 * sin(ph)), y - h * 0.7, x + sin(ph * 1.7) * w * 0.35, y - h);
      c.bezierCurveTo(x + w * (0.45 + 0.2 * cos(ph * 1.2)), y - h * 0.65, x + w * 1.2, y - h * 0.35, x + w * 0.6, y);
      c.quadraticCurveTo(x, y + w * 0.45, x - w * 0.6, y); c.closePath();
    };
    // mince (spin = úhel otočení kolem svislé osy)
    const coin = (c, x, y, r, spin) => {
      const k = cos(spin), sx = Math.max(0.14, Math.abs(k));
      if (sx < 0.95) { E(c, x - Math.sign(k || 1) * (1 - sx) * r * 0.35, y, r * sx, r); c.fillStyle = '#a8701a'; c.fill(); c.lineWidth = 1; c.strokeStyle = OUT; c.stroke(); }
      E(c, x, y, r * sx, r); c.fillStyle = sx > 0.45 ? '#ffd24a' : '#e8a628'; c.fill(); c.lineWidth = 1; c.strokeStyle = OUT; c.stroke();
      if (sx > 0.35) { E(c, x, y, r * sx * 0.62, r * 0.62); c.lineWidth = 0.8; c.strokeStyle = '#c8861a'; c.stroke(); alpha(c, 0.8, () => { E(c, x - r * sx * 0.3, y - r * 0.35, r * sx * 0.25, r * 0.18, -0.5); c.fillStyle = '#fff8d8'; c.fill(); }); }
    };
    // rychlostní čáry
    const speed = (c, t, x, y0, n, gap, len, a) => alpha(c, a, () => {
      c.beginPath(); for (let i = 0; i < n; i++) { const o = (t * 90 + i * 17) % 18, y = y0 + i * gap; c.moveTo(x - o, y); c.lineTo(x - o - len * (0.6 + K.rnd(i) * 0.6), y); }
      K.stroke(c, '#ffffff', 1.3);
    });
    // stoupající jiskry / částice
    const motes = (c, t, n, x0, w, y0, h, sp, col, r, seed) => {
      for (let i = 0; i < n; i++) {
        const ph = (t * sp + K.rnd(i + seed)) % 1, x = x0 + K.rnd(i + seed + 7) * w + sin(t * 2 + i) * 2, y = y0 - ph * h;
        alpha(c, sin(ph * PI), () => dot(c, x, y, r * (1 - ph * 0.5), col));
      }
    };

    /* ---------- GRYF: mládě gryfa ---------- */
    const gWing = (c, x, y, ang, far) => {
      c.save(); c.translate(x, y); c.rotate(ang);
      const fc = far ? ['#bcae94', '#a89878'] : ['#fffaf0', '#ece2ca'], tip = far ? '#5a4632' : '#7a5230';
      for (let i = 0; i < 6; i++) {
        const k = i / 5, a = -2.8 - k * 0.75, L = 21 - k * 8, bx = -13 + k * 10, by = -13 + k * 10;
        const cx = bx + cos(a) * L * 0.5, cy = by + sin(a) * L * 0.5;
        E(c, cx, cy, L * 0.5, 3.3, a); K.fill(c, i % 2 ? fc[1] : fc[0], 1.2);
        c.save(); E(c, cx, cy, L * 0.5, 3.3, a); c.clip(); E(c, bx + cos(a) * L, by + sin(a) * L, L * 0.28, 4, a); c.fillStyle = tip; c.fill(); c.restore();
      }
      c.beginPath(); c.moveTo(3, 3); c.quadraticCurveTo(-2, -12, -13, -16); c.quadraticCurveTo(-19, -15, -17, -10);
      c.quadraticCurveTo(-12, -8, -11, -4); c.quadraticCurveTo(-6, -3, -5, 1); c.quadraticCurveTo(-1, 2, 3, 3); c.closePath();
      K.fill(c, far ? '#a8783a' : K.lg(c, -2, -14, -6, 2, ['#f8d690', '#d8a85a', '#b07a38']), 1.3);
      c.beginPath(); c.moveTo(-2, -9); c.quadraticCurveTo(-7, -9, -10, -11); c.moveTo(0, -3); c.quadraticCurveTo(-4, -3, -7, -5);
      K.stroke(c, far ? '#7a5428' : '#a8743a', 1);
      if (!far) K.gloss(c, -6, -11, 4, 1.2, -0.6, 0.45);
      c.restore();
    };
    const gryf = (c, t, act) => {
      const fl = act ? -0.45 + sin(t * 30) * 0.05 : sin(t * 4.2) * 0.32 - 0.05;
      const tl = sin(t * 2.3);
      c.save();
      if (act) { speed(c, t, -26, -22, 5, 8, 16, 0.7); c.translate(4, -8); c.rotate(0.38); }
      else c.translate(0, sin(t * 4.2) * 0.6);
      gWing(c, -9, -5, fl * 0.8 + 0.12, true);
      // ocas se střapcem
      c.beginPath(); c.moveTo(-20, 6); c.quadraticCurveTo(-32, 4, -31 + tl, -8); K.stroke(c, OUT, 5.4);
      c.beginPath(); c.moveTo(-20, 6); c.quadraticCurveTo(-32, 4, -31 + tl, -8); K.stroke(c, '#c8944a', 2.6);
      c.beginPath(); c.ellipse(-30 + tl, -11, 3.6, 5.2, 0.3 + tl * 0.1, 0, TAU); K.fill(c, '#6a3e1e', 1.3);
      E(c, -31 + tl, -12.5, 1.2, 2, 0.3); c.fillStyle = '#9a5e2e'; c.fill();
      // vzdálené nohy
      E(c, -17, 19, 4, 6); K.fill(c, '#a8743a', 1.3); E(c, -16, 24, 4.6, 2.4); K.fill(c, '#b88446', 1.2);
      if (!act) { c.beginPath(); c.moveTo(11, 14); c.lineTo(12, 23); K.stroke(c, OUT, 4.4); c.beginPath(); c.moveTo(11, 14); c.lineTo(12, 23); K.stroke(c, '#d89a2a', 2.2); }
      // lví tělo
      c.beginPath(); AE(c, -6, 9, 16, 10.5, -0.05); AE(c, -14, 12, 7.5, 8);
      sil(c, K.lg(c, 0, -2, 0, 20, ['#f2cc80', '#d8a85a', '#a8743a']));
      alpha(c, 0.6, () => { E(c, -4, 15, 10, 3.5); c.fillStyle = '#f6e0b0'; c.fill(); });
      c.beginPath(); c.moveTo(-15, 8); c.quadraticCurveTo(-12, 12, -14, 16); c.moveTo(-20, 7); c.quadraticCurveTo(-18, 10, -19, 13); K.stroke(c, '#a06a32', 1);
      // přední tlapa lva vzadu
      E(c, -12, 23.5, 5, 2.6); K.fill(c, '#e0b46a', 1.3);
      c.beginPath(); c.moveTo(-12, 22); c.lineTo(-12, 25); c.moveTo(-9.5, 22.2); c.lineTo(-9.5, 25); K.stroke(c, '#8a5a2a', 0.8);
      // orlí běhák s drápy
      const lx = act ? 14 : 6, ly = act ? 10 : 14;
      c.beginPath(); c.moveTo(4, 10); c.lineTo(lx, ly + 8); K.stroke(c, OUT, 5.6); c.beginPath(); c.moveTo(4, 10); c.lineTo(lx, ly + 8); K.stroke(c, '#f0b030', 3.4);
      E(c, 4.5, 10, 3.6, 3.8, 0.3); K.fill(c, '#e8dcc4', 1.1);
      c.beginPath(); c.moveTo(lx - 1.6, ly + 4); c.lineTo(lx + 0.6, ly + 4.5); c.moveTo(lx - 1, ly + 6); c.lineTo(lx + 1.2, ly + 6.4); K.stroke(c, '#b07018', 0.7);
      for (let k = 0; k < 3; k++) { const a = (act ? -0.4 : 0.1) + k * 0.45; c.beginPath(); c.moveTo(lx, ly + 8); c.quadraticCurveTo(lx + cos(a) * 4, ly + 8 + sin(a) * 4 - 1, lx + cos(a) * 5.4, ly + 8 + sin(a) * 5.4 + 1); K.stroke(c, OUT, 1.8); }
      // peřový límec
      c.beginPath(); c.moveTo(-4, -10); c.quadraticCurveTo(8, -12, 13, -5); c.quadraticCurveTo(13, 2, 10, 5);
      c.quadraticCurveTo(9, 8, 6, 6); c.quadraticCurveTo(4, 10, 1, 6); c.quadraticCurveTo(-2, 8, -3, 3); c.quadraticCurveTo(-7, 2, -5, -3); c.closePath();
      K.fill(c, K.lg(c, 0, -10, 0, 9, ['#ffffff', '#f0ece4', '#d8d0c4']), 1.3);
      c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(5, 2, 7, 0); c.moveTo(6, -4); c.quadraticCurveTo(9, -3, 10.5, -5); K.stroke(c, '#c8c0b0', 0.8);
      // hlava orla
      c.save(); c.translate(12, -12); c.rotate(act ? -0.25 : sin(t * 1.3) * 0.05);
      c.beginPath(); c.moveTo(-6, -7); c.lineTo(-17, -10); c.lineTo(-9, -3); c.lineTo(-18, -4); c.lineTo(-8, 1); c.lineTo(-15, 3); c.lineTo(-6, 5); c.closePath();
      AE(c, 0, 0, 10, 9.5); sil(c, K.rg(c, 3, -4, 1, 13, ['#ffffff', '#f2eee8', '#c8c4cc']));
      // zobák
      c.beginPath(); c.moveTo(6, -5); c.quadraticCurveTo(14, -7, 17, -1); c.quadraticCurveTo(17.5, 3, 15, 4.5); c.quadraticCurveTo(14.5, 1.5, 12, 1.5); c.lineTo(6, 3); c.closePath();
      K.fill(c, K.lg(c, 8, -6, 12, 4, ['#ffd25a', '#f0a020', '#c06a10']), 1.3);
      c.beginPath(); c.moveTo(7, 0.5); c.quadraticCurveTo(10, 1, 12.5, 0.8); K.stroke(c, OUT, 0.9);
      dot(c, 10.5, -2.5, 0.8, OUT); K.gloss(c, 10, -4.6, 2.6, 0.9, -0.2, 0.7);
      K.eye(c, 3, -1.5, 4.4, '#f0a020', act ? 0.7 : 0.45, act ? 0.15 : blk(t, 0.3));
      c.beginPath(); c.moveTo(-1.5, -6.5); c.quadraticCurveTo(3, act ? -5.2 : -7.6, 7.5, act ? -4 : -5.6); K.stroke(c, OUT, 1.6);
      K.blush(c, 4, 4, 2.2);
      c.restore();
      gWing(c, -3, -3, fl, false);
      c.restore();
    };

    /* ---------- DRÁČEK ---------- */
    const dWing = (c, x, y, ang, far) => {
      c.save(); c.translate(x, y); c.rotate(ang);
      const w = [-7, -16], f1 = [-3, -29], f2 = [-17, -27], f3 = [-28, -16];
      c.beginPath(); c.moveTo(0, 0); c.lineTo(w[0], w[1]); c.lineTo(f1[0], f1[1]);
      c.quadraticCurveTo(-8, -21, f2[0], f2[1]); c.quadraticCurveTo(-16, -17, f3[0], f3[1]); c.quadraticCurveTo(-16, -8, -12, 0); c.closePath();
      K.fill(c, far ? '#b8462a' : K.lg(c, -4, -24, -18, -8, ['#ffc070', '#ff8a4a', '#e0482a']), 1.3);
      c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(f1[0], f1[1]); c.moveTo(w[0], w[1]); c.lineTo(f2[0], f2[1]); c.moveTo(w[0], w[1]); c.lineTo(f3[0], f3[1]);
      K.stroke(c, far ? '#7a2014' : '#b8301a', 1.4);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(w[0], w[1]); K.stroke(c, OUT, 4.6); c.beginPath(); c.moveTo(0, 0); c.lineTo(w[0], w[1]); K.stroke(c, far ? '#b83a22' : '#e85a32', 2.6);
      c.beginPath(); c.moveTo(w[0] - 1, w[1] - 1); c.lineTo(w[0] + 1, w[1] - 4.5); c.lineTo(w[0] + 1.5, w[1]); c.closePath(); K.fill(c, '#fff0d0', 0.9);
      c.restore();
    };
    const draci = (c, t, act) => {
      const hb = sin(t * 2.6) * 2, fl = sin(t * 7), sw = sin(t * 2.2) * 4;
      c.save(); c.translate(-3, -4 + hb);
      motes(c, t, 4, -30, 50, 14, 40, 0.45, '#ffb030', 1.3, 3);
      dWing(c, -6, -6, fl * 0.35 + 0.15, true);
      // ocas
      const tx = -30, ty = -5 + sw;
      c.beginPath(); c.moveTo(-10, -1); c.quadraticCurveTo(-24, 0, tx, ty); c.quadraticCurveTo(-22, 12, -8, 12); c.closePath();
      K.fill(c, K.lg(c, 0, -2, 0, 12, ['#ff7048', '#c8301e']), LW);
      c.beginPath(); c.moveTo(tx + 2, ty + 1); c.lineTo(tx - 3, ty - 7); c.lineTo(tx - 10, ty - 1); c.lineTo(tx - 3, ty + 5); c.closePath(); K.fill(c, '#a81e14', LW);
      alpha(c, 0.8 + 0.2 * sin(t * 9), () => { E(c, tx - 3.5, ty - 0.5, 2.6, 2); c.fillStyle = '#ffb030'; c.fill(); });
      // hřbetní ostny
      [[-16, -1, 0.9], [-10, -6, 1.1], [-3, -9, 1.2]].forEach(([x, y, s]) => { c.beginPath(); c.moveTo(x - 3.5 * s, y + 2); c.lineTo(x - 3 * s, y - 5 * s); c.lineTo(x + 3 * s, y + 1); c.closePath(); K.fill(c, '#ffb347', 1.2); });
      // zadní noha
      E(c, -9, 13, 7, 6.5, 0.3); K.fill(c, K.lg(c, 0, 6, 0, 20, ['#e84e2e', '#a8261a']), LW);
      E(c, -7, 18.5, 5, 2.6); K.fill(c, '#d8402a', 1.3);
      for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-3.5 + k * -2.6, 19.5); c.lineTo(-2.5 + k * -2.6, 21.6); K.stroke(c, '#fff0d0', 1.3); }
      // tělo
      c.beginPath(); AE(c, -3, 4, 14, 12.5, -0.25);
      sil(c, K.rg(c, -6, -3, 2, 19, ['#ff9064', '#e0482a', '#8a1c18']));
      c.save(); E(c, -3, 4, 14, 12.5, -0.25); c.clip();
      E(c, 7, 10, 9, 12, -0.4); c.fillStyle = K.lg(c, 0, -2, 0, 16, ['#ffe2a8', '#ffc070']); c.fill();
      c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(-1 + k * 1.2, 1 + k * 4); c.quadraticCurveTo(5 + k, 3 + k * 4, 13, k * 4 - 1); } K.stroke(c, '#e09050', 1);
      c.beginPath(); [[-12, 0], [-8, -4], [-14, 6], [-9, 3], [-4, -2]].forEach(([x, y]) => { c.moveTo(x - 1.6, y); c.quadraticCurveTo(x, y + 1.8, x + 1.6, y); }); K.stroke(c, 'rgba(120,20,16,.55)', 0.8);
      K.gloss(c, -8, -4, 4.5, 1.6, -0.6, 0.35);
      c.restore();
      // hlava
      const hr = act ? -0.18 : sin(t * 1.4) * 0.05;
      c.save(); c.translate(11, -12); c.rotate(hr);
      // rohy
      c.beginPath(); c.moveTo(-6, -7); c.quadraticCurveTo(-11, -14, -15, -16); c.quadraticCurveTo(-9, -15, -2, -9); c.closePath(); K.fill(c, '#e8c890', 1.2);
      c.beginPath(); c.moveTo(-2, -9); c.quadraticCurveTo(-5, -18, -9, -21); c.quadraticCurveTo(-1, -18, 3, -9); c.closePath(); K.fill(c, K.lg(c, -8, -20, 2, -9, ['#fff4d8', '#e8c890']), 1.2);
      c.beginPath(); c.moveTo(-4.5, -14); c.lineTo(-1.5, -13); c.moveTo(-6.5, -17); c.lineTo(-4, -16.5); K.stroke(c, '#b8925a', 0.8);
      // ušní ploutvička
      c.beginPath(); c.moveTo(-6, -2); c.lineTo(-16, -3); c.lineTo(-12, 0); c.lineTo(-17, 2); c.lineTo(-6, 3); c.closePath(); K.fill(c, '#ffb347', 1.2);
      c.beginPath(); AE(c, 0, 0, 11, 10); AE(c, 9, 4, 8.5, 6.5, 0.1); if (act) AE(c, 11, 9, 7, 3.5, 0.3);
      sil(c, K.rg(c, -1, -5, 1, 15, ['#ff9a6a', '#e8502e', '#a0221a']));
      if (act) { c.beginPath(); c.moveTo(6, 6.5); c.quadraticCurveTo(13, 4.5, 18, 6); c.quadraticCurveTo(14, 12, 6, 9); c.closePath(); K.fill(c, '#5a0e14', 1); E(c, 11, 9, 3, 1.4); c.fillStyle = '#ff6a7a'; c.fill(); }
      else { c.beginPath(); c.moveTo(6, 7); c.quadraticCurveTo(11, 9.5, 16, 7.5); K.stroke(c, OUT, 1.2); c.beginPath(); c.moveTo(9.5, 8.3); c.lineTo(10.5, 10.6); c.lineTo(11.6, 8.5); c.fillStyle = '#fff'; c.fill(); }
      E(c, 15, 1.6, 1.1, 0.8, -0.3); c.fillStyle = '#5a0e14'; c.fill();
      K.gloss(c, 11, -0.6, 3.4, 1.1, -0.1, 0.5);
      K.blush(c, 4, 5.5, 2.6);
      K.eye(c, 1, -2, 5.2, '#ffc020', 0.55, act ? 0.25 : blk(t, 0.9));
      c.beginPath(); c.moveTo(-3.5, -7.5); c.quadraticCurveTo(1, -10, 6, -7); K.stroke(c, '#7a1612', 1.6);
      // kouř z nozder
      if (!act) for (let i = 0; i < 2; i++) { const ph = (t * 0.7 + i * 0.5) % 1; puff(c, 18 + ph * 5, -1 - ph * 12, 1.2 + ph * 2.2, '#b8b0b8', 0.55 * (1 - ph)); }
      c.restore();
      // ručička s opékaným marshmallow
      if (!act) {
        c.beginPath(); c.moveTo(7, 6); c.lineTo(20, 13); K.stroke(c, '#7a4a22', 1.4);
        c.save(); c.translate(21, 14); c.rotate(0.5); E(c, 0, 0, 3.2, 2.4); K.fill(c, K.lg(c, -3, 0, 3, 0, ['#fff8ee', '#e8b070', '#8a4a1a']), 1.1); c.restore();
        alpha(c, 0.6 + 0.3 * sin(t * 11), () => dot(c, 23.5, 13, 1, '#ffb030'));
        E(c, 7, 6.5, 3, 2.6, 0.4); K.fill(c, '#e8502e', 1.2);
      } else { E(c, 10, 2, 3, 2.6, -0.6); K.fill(c, '#e8502e', 1.2); }
      dWing(c, -2, -5, fl * 0.38 + 0.05, false);
      // dech ohně
      if (act) {
        const ph = t * 24, mx = 28, my = -2;
        K.glow(c, mx + 10, my, 26, '#ff8a20', 0.55);
        alpha(c, 0.9, () => { flameR(c, mx, my, 34, 11, ph); c.fillStyle = '#ff4a1a'; c.fill(); });
        flameR(c, mx, my, 29, 7.8, ph + 1); c.fillStyle = '#ff9a20'; c.fill();
        flameR(c, mx, my, 21, 4.8, ph + 2); c.fillStyle = '#ffe070'; c.fill();
        flameR(c, mx, my, 11, 2.4, ph + 3); c.fillStyle = '#fffbe0'; c.fill();
        for (let i = 0; i < 5; i++) { const p = (t * 2.5 + i / 5) % 1; alpha(c, 1 - p, () => dot(c, mx + 8 + p * 30, my + (K.rnd(i) - 0.5) * 20 * p - p * 4, 1.3, '#ffd040')); }
      }
      c.restore();
    };

    /* ---------- ŠKŘÍTEK S MINCEMI ---------- */
    const skritek = (c, t, act) => {
      const hb = sin(t * 2.2) * 2.2;
      c.save(); c.translate(0, hb - 3);
      const N = 7, orb = [];
      for (let i = 0; i < N; i++) { const a = i / N * TAU + t * 1.3; orb.push([cos(a) * 25, 15 + sin(a) * 5, 3.4 + sin(a) * 0.7, t * 3 + i * 1.7, sin(a)]); }
      orb.forEach(o => { if (o[4] < 0) coin(c, o[0], o[1], o[2], o[3]); });
      // uši
      c.beginPath(); c.moveTo(-6, -17); c.quadraticCurveTo(-18, -20, -27, -27 + sin(t * 3) * 1.2); c.quadraticCurveTo(-18, -12, -6, -10); c.closePath(); K.fill(c, '#7cc04a', LW);
      c.beginPath(); c.moveTo(-8, -15.5); c.quadraticCurveTo(-17, -18, -23, -24); c.quadraticCurveTo(-16, -14, -8, -12); c.closePath(); c.fillStyle = '#e8909a'; c.fill();
      // tělo – vesta
      c.beginPath(); AE(c, 0, 3, 12, 10.5); sil(c, K.lg(c, -10, 0, 10, 0, ['#7a3a8a', '#5a2a6a', '#3a1648']));
      c.beginPath(); c.moveTo(3, -7); c.lineTo(5, 12); K.stroke(c, '#d8a830', 1.2);
      dot(c, 6.5, -1, 1.2, '#ffd24a'); dot(c, 7, 4, 1.2, '#ffd24a');
      // řetízek monoklu
      // hlava
      c.beginPath(); AE(c, 2, -14, 11, 10.5); sil(c, K.rg(c, 0, -19, 2, 14, ['#b4e878', '#7cc04a', '#3e7a24']));
      // pravé ucho (vpředu)
      c.beginPath(); c.moveTo(10, -18); c.quadraticCurveTo(22, -22, 30, -29 + sin(t * 3 + 1) * 1.2); c.quadraticCurveTo(22, -13, 11, -12); c.closePath(); K.fill(c, '#8ad050', LW);
      c.beginPath(); c.moveTo(12, -16.5); c.quadraticCurveTo(21, -20, 26, -25); c.quadraticCurveTo(20, -15, 12, -13.5); c.closePath(); c.fillStyle = '#f0a0aa'; c.fill();
      c.beginPath(); c.arc(18, -15.5, 1.8, 0.3, PI * 1.6); K.stroke(c, '#ffd24a', 1);
      // čepice
      const hs = sin(t * 2.2 + 1) * 1.5;
      c.beginPath(); c.moveTo(-9, -19); c.quadraticCurveTo(-4, -32, 4, -33); c.quadraticCurveTo(-8, -38, -17 + hs, -33); c.quadraticCurveTo(-13, -29, -9, -28);
      c.quadraticCurveTo(0, -30, 6, -26); c.quadraticCurveTo(10, -23, 12, -19); c.quadraticCurveTo(2, -23, -9, -19); c.closePath();
      K.fill(c, K.lg(c, 0, -36, 0, -19, ['#e05050', '#b0283a']), LW);
      c.beginPath(); c.moveTo(-10, -19.5); c.quadraticCurveTo(1, -24, 12.5, -19.5); K.stroke(c, OUT, 4.2); c.beginPath(); c.moveTo(-10, -19.5); c.quadraticCurveTo(1, -24, 12.5, -19.5); K.stroke(c, '#d8a830', 2.4);
      dot(c, -17 + hs, -33, 2, '#ffd24a'); c.lineWidth = 1; c.strokeStyle = OUT; c.stroke();
      coin(c, 3, -26.5, 2.4, 0);
      // obličej
      const bl = blk(t, 1.7);
      if (act) { K.happyEye(c, -1, -15, 3.2); K.happyEye(c, 8, -15, 3.2); }
      else { K.eye(c, -1, -15, 3.8, '#e8c020', 0.6, bl); K.eye(c, 8, -15, 3.8, '#e8c020', 0.6, bl); }
      c.beginPath(); c.arc(8, -15, 5, 0, TAU); K.stroke(c, OUT, 2.2); c.beginPath(); c.arc(8, -15, 5, 0, TAU); K.stroke(c, '#ffd24a', 1.1);
      c.beginPath(); c.moveTo(-4.5, -20.5); c.lineTo(1.5, -19.5); c.moveTo(4.5, -20.8); c.lineTo(11, -21.5); K.stroke(c, '#2e5a1a', 1.4);
      // nos
      c.beginPath(); c.moveTo(5, -13); c.quadraticCurveTo(15, -14, 18, -10); c.quadraticCurveTo(18, -7, 14, -8); c.quadraticCurveTo(9, -9, 6, -9); c.closePath(); K.fill(c, '#86cc52', 1.2);
      dot(c, 11, -11.5, 0.8, '#5a9a32');
      // úsměv
      c.beginPath(); c.moveTo(-3, -7); c.quadraticCurveTo(4, act ? 1 : -2, 12, -6); c.quadraticCurveTo(4, act ? -3 : -5, -3, -7); c.closePath(); K.fill(c, '#3a0e1a', 1.1);
      c.beginPath(); c.rect(1, -6, 2.2, 1.8); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.rect(4.4, -5.7, 2.2, 2); c.fillStyle = '#ffd24a'; c.fill();
      K.blush(c, -3, -10, 2.4);
      // pytel
      c.save(); c.translate(-16, 3); c.rotate(-0.15);
      c.beginPath(); c.moveTo(-3, -6); c.quadraticCurveTo(-9, -2, -8, 5); c.quadraticCurveTo(-6, 11, 1, 11); c.quadraticCurveTo(8, 10, 8, 4); c.quadraticCurveTo(8, -2, 3, -6); c.closePath();
      K.fill(c, K.rg(c, -1, 1, 1, 12, ['#d8a870', '#a8743a', '#6a4220']), LW);
      c.beginPath(); c.moveTo(-4, -6); c.quadraticCurveTo(0, -4, 4, -6); K.stroke(c, '#5a3418', 1.6);
      coin(c, -1, -8, 2.6, 0.5); coin(c, 2.5, -8.5, 2.6, 1.2);
      c.beginPath(); c.rect(-5, 2, 5, 4); c.fillStyle = '#c89a5a'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#5a3418'; c.setLineDash([1, 1]); c.stroke(); c.setLineDash([]);
      c.restore();
      // ruce
      if (act) {
        E(c, -11, -11, 3, 2.6); K.fill(c, '#86cc52', 1.2); E(c, 15, -11, 3, 2.6); K.fill(c, '#86cc52', 1.2);
        for (let i = 0; i < 7; i++) { const ph = (t * 1.6 + i / 7) % 1, d = (i % 2 ? 1 : -1) * (0.4 + K.rnd(i) * 0.6); coin(c, 2 + d * ph * 26, -24 - sin(ph * PI) * 16 + ph * 22, 3, t * 9 + i); }
        motes(c, t, 4, -20, 40, -10, 30, 0.8, '#fff6a0', 1.2, 9);
      } else {
        E(c, -10, 0, 3, 2.6); K.fill(c, '#86cc52', 1.2);
        c.beginPath(); c.moveTo(9, 0); c.quadraticCurveTo(15, -1, 17, -6); K.stroke(c, OUT, 4.6); c.beginPath(); c.moveTo(9, 0); c.quadraticCurveTo(15, -1, 17, -6); K.stroke(c, '#7cc04a', 2.6);
        coin(c, 18.5, -9.5, 3.4, 0.2 + sin(t * 1.5) * 0.25);
        E(c, 17, -6, 2.6, 2.3); K.fill(c, '#86cc52', 1.1);
        const g = (t * 0.6) % 1; if (g < 0.25) alpha(c, sin(g / 0.25 * PI), () => K.sparkle(c, 20, -12, 4, '#fff'));
      }
      // oblak
      c.beginPath(); AE(c, -19, 15, 7.5, 6.5); AE(c, -9, 12, 9.5, 8); AE(c, 4, 12, 10, 8); AE(c, 16, 15, 8, 6.5); AE(c, -2, 18, 16, 6.5);
      sil(c, K.lg(c, 0, 4, 0, 24, ['#fffbe0', '#ffe48a', '#e8b03a']));
      alpha(c, 0.7, () => { E(c, -6, 9, 6, 2.2, -0.1); c.fillStyle = '#fff'; c.fill(); E(c, 8, 9.5, 4.5, 1.8); c.fill(); });
      coin(c, -12, 18, 3.2, 0.3); coin(c, 7, 19, 3.2, -0.4); coin(c, -1, 15, 2.8, 1.1);
      orb.forEach(o => { if (o[4] >= 0) coin(c, o[0], o[1], o[2], o[3]); });
      const tw = (t * 0.8) % 1; alpha(c, sin(tw * PI), () => K.sparkle(c, -18 + tw * 8, 10, 3, '#fff'));
      c.restore();
    };

    /* ---------- NATAHOVACÍ ROBOT ---------- */
    const robot = (c, t, act) => {
      const st = act ? 0 : sin(t * 5), rc = act ? -4 + Math.min(1, ((t * 3) % 1) * 3) * 3 : 0, bob = act ? 0 : Math.abs(st) * 1.2;
      c.save(); c.translate(rc - 2, -bob);
      // pára z komínku
      for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; puff(c, -12 - ph * 6, -30 - ph * 14, 1.5 + ph * 3, '#f0f0f4', 0.7 * (1 - ph)); }
      c.beginPath(); c.rect(-13, -30, 4, 8); K.fill(c, K.lg(c, -13, 0, -9, 0, ['#8a6a3a', '#5a4020']), 1.2);
      // natahovací klíč
      const ks = cos(t * 3);
      c.beginPath(); c.moveTo(-14, 3); c.lineTo(-20, 3); K.stroke(c, OUT, 3.4); c.beginPath(); c.moveTo(-14, 3); c.lineTo(-20, 3); K.stroke(c, '#b0b4bc', 1.6);
      c.save(); c.translate(-21, 3); c.scale(1, 1); c.beginPath(); AE(c, 0, -4.2 * Math.abs(ks) - 0.6, 2.6, 3.6 * Math.abs(ks) + 0.4); AE(c, 0, 4.2 * Math.abs(ks) + 0.6, 2.6, 3.6 * Math.abs(ks) + 0.4);
      sil(c, ks > 0 ? '#d8dce4' : '#9aa0aa', 1.1); c.restore();
      // nohy
      [[-6, st], [6, -st]].forEach(([x, s], i) => {
        const lift = Math.max(0, s) * 2.5;
        c.beginPath(); c.moveTo(x, 14); c.lineTo(x, 22 - lift); K.stroke(c, OUT, 4.4); c.beginPath(); c.moveTo(x, 14); c.lineTo(x, 22 - lift); K.stroke(c, i ? '#9aa0aa' : '#7a8088', 2.4);
        c.beginPath(); c.moveTo(x - 4, 26 - lift); c.lineTo(x - 4, 23 - lift); c.quadraticCurveTo(x, 20 - lift, x + 6, 23 - lift); c.lineTo(x + 6, 26 - lift); c.closePath();
        K.fill(c, i ? '#c99a3a' : '#a07828', 1.3);
      });
      // vzdálená ruka
      c.beginPath(); c.moveTo(-10, 2); c.quadraticCurveTo(-15, 8, -12, 13); K.stroke(c, OUT, 4); c.beginPath(); c.moveTo(-10, 2); c.quadraticCurveTo(-15, 8, -12, 13); K.stroke(c, '#7a8088', 2);
      c.beginPath(); c.arc(-12, 14, 2.4, 0.3, PI * 1.7); K.stroke(c, OUT, 1.6);
      // tělo – mosazný kotel
      c.beginPath(); AE(c, 0, 4, 14.5, 13); sil(c, K.rg(c, -5, -2, 1, 18, ['#fff0b0', '#d8aa48', '#c99a3a', '#6a4818']));
      c.save(); E(c, 0, 4, 14.5, 13); c.clip();
      c.fillStyle = K.lg(c, 0, 8, 0, 13, ['#8a6224', '#b8862e', '#8a6224']); c.fillRect(-16, 8, 32, 5);
      c.restore();
      c.beginPath(); c.moveTo(-14, 8); c.lineTo(14, 8); c.moveTo(-14, 13); c.lineTo(14, 13); K.stroke(c, OUT, 1);
      for (let k = -2; k <= 2; k++) { dot(c, k * 5.5, 10.5, 0.9, '#ffe8a0'); }
      K.gloss(c, -6, -3, 4, 2, -0.6, 0.45);
      // budík / tlakoměr
      c.beginPath(); c.arc(3, 0, 5, 0, TAU); K.fill(c, K.rg(c, 2, -1, 0, 5, ['#ffffff', '#e8e4d8']), 1.4);
      c.beginPath(); for (let k = 0; k < 5; k++) { const a = PI * 0.8 + k * 0.35; c.moveTo(3 + cos(a) * 3.8, sin(a) * 3.8); c.lineTo(3 + cos(a) * 4.5, sin(a) * 4.5); } K.stroke(c, OUT, 0.6);
      const na = act ? 0.9 : -1.4 + sin(t * 3) * 0.5; c.beginPath(); c.moveTo(3, 0); c.lineTo(3 + cos(na) * 3.6, sin(na) * 3.6); K.stroke(c, '#c8202a', 0.9); dot(c, 3, 0, 0.9, OUT);
      // hlava
      c.beginPath(); c.moveTo(-11, -10); c.lineTo(-12, -24); c.quadraticCurveTo(-12, -29, -6, -29); c.lineTo(8, -29); c.quadraticCurveTo(14, -29, 14, -24); c.lineTo(12, -10); c.closePath();
      sil(c, K.lg(c, -12, -28, 14, -10, ['#ffe49a', '#c99a3a', '#8a6224']));
      [[-9, -26], [11, -26], [-9, -12], [10, -12]].forEach(p => dot(c, p[0], p[1], 0.9, '#6a4818'));
      // oči – čočky
      const bl = blk(t, 2.4);
      [[-3.5, -19, 5], [7, -19, 5.6]].forEach(([x, y, r], i) => {
        c.beginPath(); c.arc(x, y, r + 1.4, 0, TAU); K.fill(c, '#b8b4ac', 1.2);
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = K.rg(c, x + 1, y + 1, 0, r, ['#e8ffff', '#5ae0f0', '#0a5a7a']); c.fill();
        c.beginPath(); c.arc(x + 1.2, y + 0.4, r * 0.38, 0, TAU); c.fillStyle = '#062a3a'; c.fill();
        dot(c, x - r * 0.35, y - r * 0.4, r * 0.25, '#fff');
        const sh = act && i === 0 ? 0.45 : bl; if (sh > 0) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.fillStyle = '#a07828'; c.fillRect(x - r, y - r, r * 2, r * 2 * sh); c.restore(); }
      });
      if (act) { c.beginPath(); c.moveTo(-7, -26); c.lineTo(0, -24.5); c.moveTo(3, -25); c.lineTo(11, -26.5); K.stroke(c, OUT, 1.5); }
      // ústa – mřížka
      c.beginPath(); c.rect(-1, -13.5, 9, 2.6); K.fill(c, '#3a2a1a', 1); c.beginPath(); for (let k = 1; k < 4; k++) { c.moveTo(-1 + k * 2.25, -13.5); c.lineTo(-1 + k * 2.25, -10.9); } K.stroke(c, '#c99a3a', 0.6);
      // vrtulková čepice
      c.beginPath(); c.moveTo(-8, -29); c.quadraticCurveTo(1, -40, 10, -29); c.closePath();
      c.save(); c.clip(); c.fillStyle = '#d83a3a'; c.fillRect(-9, -40, 20, 12); c.fillStyle = '#3a7ad8'; c.fillRect(-2, -40, 6, 12); c.fillStyle = '#ffd24a'; c.fillRect(8, -40, 3, 12); c.fillRect(-9, -40, 3, 12); c.restore();
      c.beginPath(); c.moveTo(-8, -29); c.quadraticCurveTo(1, -40, 10, -29); c.closePath(); c.lineWidth = LW; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.moveTo(-9, -29); c.lineTo(14, -29); K.stroke(c, OUT, 2.4); c.beginPath(); c.moveTo(-9, -29); c.lineTo(14, -29); K.stroke(c, '#d83a3a', 1.2);
      c.beginPath(); c.moveTo(1, -35); c.lineTo(1, -38.5); K.stroke(c, OUT, 2.2);
      const sp = t * (act ? 34 : 16), L = 12 * Math.abs(cos(sp)), L2 = 12 * Math.abs(sin(sp));
      alpha(c, 0.22, () => { E(c, 1, -38.8, 13, 2.4); c.fillStyle = '#fff'; c.fill(); });
      E(c, 1 + L * 0.5 * Math.sign(cos(sp)), -38.8, L * 0.5 + 0.5, 1.6); K.fill(c, '#ffd24a', 1);
      E(c, 1 - L2 * 0.5 * Math.sign(sin(sp)), -38.8, L2 * 0.5 + 0.5, 1.6); K.fill(c, '#3a7ad8', 1);
      dot(c, 1, -38.8, 1.4, '#d83a3a');
      // dělo-ruka
      c.save(); c.translate(12, 3); c.rotate(act ? -0.12 : sin(t * 2) * 0.06);
      c.beginPath(); c.moveTo(0, -3.5); c.lineTo(17, -4.5); c.lineTo(17, 4.5); c.lineTo(0, 3.5); c.closePath(); K.fill(c, K.lg(c, 0, -4, 0, 4, ['#9a9ea8', '#5a5e68', '#2a2c34']), LW);
      c.beginPath(); c.rect(15.5, -5.6, 4.5, 11.2); K.fill(c, K.lg(c, 0, -5, 0, 5, ['#ffe49a', '#c99a3a', '#7a5418']), 1.3);
      c.beginPath(); c.rect(5, -4.4, 2.6, 8.8); K.fill(c, '#c99a3a', 1);
      E(c, 20, 0, 1.2, 3.2); c.fillStyle = '#0e0c12'; c.fill();
      c.beginPath(); c.arc(0, 0, 5, 0, TAU); K.fill(c, K.rg(c, -1, -1, 0, 5, ['#ffe49a', '#a07828']), 1.3); dot(c, 0, 0, 1.3, '#6a4818');
      if (act) {
        const p = (t * 3) % 1;
        K.glow(c, 24, 0, 16, '#ffb040', 0.7 * (1 - p));
        K.star(c, 24, 0, 8 * (1 - p * 0.5), '#ffd040', 8, 0.45); K.star(c, 24, 0, 4.5 * (1 - p * 0.5), '#fff8d0', 8, 0.5);
        for (let i = 0; i < 3; i++) puff(c, 22 + p * 6 + i * 3, (i - 1) * 6 - p * 6, 2.5 + p * 3, '#d8d4d0', 0.6 * (1 - p));
        c.beginPath(); c.arc(28 + p * 22, -p * 4, 3.4, 0, TAU); K.fill(c, K.rg(c, 27 + p * 22, -1 - p * 4, 0, 4, ['#8a8e98', '#1a1a22']), 1);
      }
      c.restore();
      c.restore();
    };

    /* ---------- HOUBA ---------- */
    const SPOTS = [[-17, -18, 4.6], [-4, -31, 5], [12, -26, 4.2], [-24, -6, 2.8], [21, -11, 3.6], [3, -14, 3], [-12, -30, 2.4], [24, -24, 2]];
    const houba = (c, t, act) => {
      const br = sin(t * 2) * 0.03, sq = act ? 0.12 : 0;
      c.save(); c.translate(1, 0);
      // malá houbička – kamarád
      c.save(); c.translate(-25, 17);
      c.beginPath(); c.moveTo(-2.5, 0); c.quadraticCurveTo(-3, 6, -3.2, 8); c.lineTo(3.2, 8); c.quadraticCurveTo(3, 6, 2.5, 0); c.closePath(); K.fill(c, '#f6ead0', 1.1);
      c.beginPath(); c.moveTo(-7, 1); c.quadraticCurveTo(-6, -7, 0, -7); c.quadraticCurveTo(6, -7, 7, 1); c.quadraticCurveTo(0, 2.5, -7, 1); c.closePath(); K.fill(c, '#c8642a', 1.2);
      dot(c, -2.5, -3.5, 1.2, '#fff4e0'); dot(c, 2.5, -4.5, 0.9, '#fff4e0');
      dot(c, -0.8, 4, 0.6, OUT); dot(c, 1.6, 4, 0.6, OUT);
      c.restore();
      // tráva
      c.beginPath(); for (let k = 0; k < 7; k++) { const x = -14 + k * 4.6; c.moveTo(x - 1.6, 25); c.quadraticCurveTo(x + sin(t * 2 + k) * 1.2, 19 - (k % 2) * 3, x + 1.4, 25); } c.closePath();
      K.fill(c, '#5aa83a', 1);
      // nožky
      E(c, -6, 23.5, 4.5, 2.6); K.fill(c, '#efe0c0', 1.3); E(c, 7, 23.5, 4.5, 2.6); K.fill(c, '#efe0c0', 1.3);
      // tělo (třeň)
      c.save(); c.translate(0, 23); c.scale(1 + br + sq * 0.3, 1 - br - sq * 0.5); c.translate(0, -23);
      c.beginPath(); c.moveTo(-9, -4); c.quadraticCurveTo(-13, 10, -12.5, 20); c.quadraticCurveTo(0, 26, 12.5, 20); c.quadraticCurveTo(13, 10, 9, -4); c.closePath();
      K.fill(c, K.lg(c, -12, 0, 12, 0, ['#e4d0aa', '#fff8ea', '#fff2da', '#cdb48a']), LW);
      c.beginPath(); c.moveTo(-8, 18); c.quadraticCurveTo(-6, 14, -7.5, 10); c.moveTo(9, 17); c.quadraticCurveTo(8, 13, 9.5, 9); K.stroke(c, '#d8c4a0', 0.9);
      // ruce
      const wv = act ? -0.8 : sin(t * 2.4) * 0.25;
      E(c, -12.5, 11, 3, 4, 0.4); K.fill(c, '#f4e6c8', 1.3);
      c.save(); c.translate(11, 8); c.rotate(-0.6 + wv); E(c, 0, 4, 2.8, 4.2); K.fill(c, '#f4e6c8', 1.3); c.restore();
      // obličej
      const bl = blk(t, 0.6);
      if (act) {
        c.beginPath(); c.moveTo(-6, 4); c.lineTo(-2.5, 6); c.lineTo(-6, 8); c.moveTo(9.5, 4); c.lineTo(6, 6); c.lineTo(9.5, 8); K.stroke(c, OUT, 1.5);
        E(c, 2, 12, 2, 1.6); K.fill(c, '#7a2a2a', 1);
        K.blush(c, -7.5, 11, 3.4); K.blush(c, 10.5, 11, 3.4);
      } else {
        K.eye(c, -3.5, 6.5, 4.4, '#7a4a24', 0.5, bl); K.eye(c, 6.8, 6.5, 4.4, '#7a4a24', 0.5, bl);
        c.beginPath(); c.moveTo(0, 12.5); c.quadraticCurveTo(1.8, 14.6, 3.6, 12.5); K.stroke(c, OUT, 1.2);
        K.blush(c, -7, 10.5, 2.4); K.blush(c, 10, 10.5, 2.4);
      }
      c.restore();
      // klobouk
      c.save(); c.translate(0, -1); c.scale(0.86 * (1 + sq * 0.7 - br * 0.5), 0.86 * (1 - sq + br)); c.translate(0, 2);
      E(c, 0, -2.5, 25, 5); K.fill(c, '#f2dcb4', 1.3);
      c.save(); E(c, 0, -2.5, 25, 5); c.clip(); c.beginPath(); for (let k = -9; k <= 9; k++) { c.moveTo(k * 1.2, 0); c.lineTo(k * 2.8, -7); } K.stroke(c, '#c8a87a', 0.8); c.restore();
      c.beginPath(); c.moveTo(-29, -3); c.bezierCurveTo(-32, -28, -15, -40, 0, -40); c.bezierCurveTo(15, -40, 32, -28, 29, -3); c.quadraticCurveTo(25, -6, 20, -3.5); c.quadraticCurveTo(0, -9, -20, -3.5); c.quadraticCurveTo(-25, -6, -29, -3); c.closePath();
      K.fill(c, K.rg(c, -7, -30, 2, 38, ['#ff7a7a', '#e8323e', '#d6243a', '#7a0c1e']), LW);
      SPOTS.forEach(([x, y, r]) => { const sx = 1 - Math.abs(x) / 50; E(c, x + 0.4, y + 0.8, r * sx, r * 0.85); c.fillStyle = '#9a1a28'; c.fill(); E(c, x, y, r * sx, r * 0.85); c.fillStyle = K.lg(c, x, y - r, x, y + r, ['#ffffff', '#f4e4e0']); c.fill(); });
      K.gloss(c, -10, -32, 7, 2.6, -0.5, 0.35);
      c.beginPath(); c.moveTo(-27, -6); c.quadraticCurveTo(-24, -7, -20, -5.5); K.stroke(c, '#ff8a8a', 1);
      // rosa a lístek
      c.save(); c.translate(17, -33); c.rotate(0.5); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(4, -4, 9, 0); c.quadraticCurveTo(4, 3, 0, 0); c.closePath(); K.fill(c, '#e8a030', 1); c.beginPath(); c.moveTo(0, 0); c.lineTo(8, 0); K.stroke(c, '#a8601a', 0.6); c.restore();
      E(c, -19, -26, 1.8, 2.2); c.fillStyle = 'rgba(200,240,255,.85)'; c.fill(); dot(c, -19.6, -26.8, 0.6, '#fff');
      c.restore();
      // spory
      if (act) {
        const p = (t * 1.2) % 1;
        for (let i = 0; i < 9; i++) { const a = -PI + i / 8 * PI + K.rnd(i) * 0.3, rr = 20 + p * 16 + K.rnd(i + 3) * 6; puff(c, cos(a) * rr * 1.1, -12 + sin(a) * rr * 0.7, 3.5 + p * 3, i % 2 ? '#d4ff6a' : '#d8a8ff', 0.62 * (1 - p * 0.7)); }
        motes(c, t, 8, -30, 60, -10, 34, 0.9, '#e8ff9a', 1.1, 21);
      } else motes(c, t, 5, -22, 44, -4, 30, 0.35, '#e8ffa0', 1, 13);
      c.restore();
    };

    /* ---------- TUČŇÁK ADMIRÁL ---------- */
    const tucnak = (c, t, act) => {
      const w = act ? 0 : sin(t * 2.6) * 0.04, bl = blk(t, 3.1);
      c.save(); c.translate(-2, 0);
      // vločky
      for (let i = 0; i < 4; i++) { const ph = (t * 0.25 + K.rnd(i + 40)) % 1; alpha(c, sin(ph * PI) * 0.9, () => K.sparkle(c, -30 + K.rnd(i + 41) * 64 + sin(t + i) * 3, -36 + ph * 60, 1.6, '#ffffff')); }
      // nohy
      E(c, -6, 24.5, 6, 2.6); K.fill(c, '#ffa030', 1.3); E(c, 8, 24.5, 6.5, 2.6, 0.05); K.fill(c, '#ff9a20', 1.3);
      c.save(); c.translate(0, 24); c.rotate(w); c.translate(0, -24);
      // vzdálená ploutev
      if (!act) { c.save(); c.translate(10, -4); c.rotate(-1.1); E(c, 0, 6, 3.4, 8); K.fill(c, '#1e2a44', LW); c.restore(); }
      // tělo
      c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(14, -24, 18, -6, 17, 8); c.bezierCurveTo(16, 20, 8, 24, 0, 24); c.bezierCurveTo(-10, 24, -17, 18, -17, 6); c.bezierCurveTo(-17, -10, -12, -24, 0, -24); c.closePath();
      sil(c, K.lg(c, -17, -10, 17, 0, ['#4a6290', '#2a3a5a', '#16203a']));
      // bříško
      c.save(); c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(14, -24, 18, -6, 17, 8); c.bezierCurveTo(16, 20, 8, 24, 0, 24); c.bezierCurveTo(-10, 24, -17, 18, -17, 6); c.bezierCurveTo(-17, -10, -12, -24, 0, -24); c.clip();
      E(c, 5, 9, 11, 15); c.fillStyle = K.lg(c, 0, -6, 0, 24, ['#ffffff', '#e8eef6', '#c8d4e4']); c.fill();
      // šerpa
      c.beginPath(); c.moveTo(-8, -6); c.lineTo(20, 16); K.stroke(c, '#c8283a', 4.2); c.beginPath(); c.moveTo(-8, -8); c.lineTo(20, 14); K.stroke(c, '#ff6a6a', 0.8);
      c.restore();
      // medaile
      c.beginPath(); c.moveTo(7, 2); c.lineTo(8.5, 7); c.lineTo(10, 2); c.closePath(); K.fill(c, '#3a7ad8', 0.8);
      K.star(c, 8.5, 9, 3.4, '#ffd24a', 5, 0.48); c.lineWidth = 0.8; c.strokeStyle = '#8a5a10'; c.stroke();
      // obličejové bílé skvrny
      E(c, 6, -13, 7.5, 6); c.fillStyle = '#ffffff'; c.fill();
      // oko
      K.eye(c, 5, -13, 4.6, '#3a6ad8', 0.6, bl);
      c.beginPath(); c.moveTo(1, -18.4); c.quadraticCurveTo(5, act ? -18 : -20, 9.5, -18.8); K.stroke(c, OUT, 1.4);
      // zobák
      c.beginPath(); c.moveTo(12, -11); c.quadraticCurveTo(19, -10.5, 23, -7.5); c.quadraticCurveTo(18, act ? -3 : -5.5, 12, -6); c.closePath(); K.fill(c, K.lg(c, 12, -11, 12, -5, ['#ffc040', '#f08a10']), 1.2);
      if (act) { c.beginPath(); c.moveTo(12.5, -6.5); c.quadraticCurveTo(17, -3, 21, -4.5); K.stroke(c, OUT, 1); }
      K.blush(c, 4, -7, 2.2);
      // klobouk – dvourohý
      c.save(); c.translate(0, -22); c.rotate(-0.1 + sin(t * 2.6) * 0.03);
      c.beginPath(); c.moveTo(-17, 1); c.quadraticCurveTo(-3, -22, 16, 0); c.quadraticCurveTo(-1, -6, -17, 1); c.closePath();
      K.fill(c, K.lg(c, 0, -12, 0, 0, ['#2e3e64', '#141c34']), LW);
      c.beginPath(); c.moveTo(-15.5, 0); c.quadraticCurveTo(-3, -19.5, 14.5, -0.6); K.stroke(c, '#f0c040', 1.3);
      c.beginPath(); c.moveTo(-15, 0.4); c.quadraticCurveTo(-1, -4.6, 14.5, 0.2); K.stroke(c, '#f0c040', 1);
      // kokarda + pírko
      c.beginPath(); c.moveTo(-3, -9); c.quadraticCurveTo(-12, -16, -10, -22 + sin(t * 3) * 1); c.quadraticCurveTo(-5, -16, -1, -10); c.closePath(); K.fill(c, '#ffffff', 1.1);
      c.beginPath(); c.arc(-1.5, -7.5, 3, 0, TAU); K.fill(c, '#c8283a', 1.1); dot(c, -1.5, -7.5, 1.6, '#fff'); dot(c, -1.5, -7.5, 0.8, '#3a6ad8');
      c.restore();
      // blízká ploutev + nárameník
      c.save(); c.translate(-10, -4); c.rotate(act ? 2.5 + ((t * 2) % 1) * 1.3 : 0.25 + sin(t * 2.6) * 0.08);
      E(c, 0, 9, 4, 10); K.fill(c, K.lg(c, -4, 0, 4, 0, ['#3a5280', '#1a2440']), LW);
      if (act) { c.beginPath(); c.arc(0, 21, 4, 0, TAU); K.fill(c, '#f4faff', 1.2); }
      c.restore();
      c.beginPath(); c.ellipse(-10, -6, 6, 3, -0.3, 0, TAU); K.fill(c, K.lg(c, 0, -9, 0, -3, ['#ffe070', '#d89a20']), 1.2);
      c.beginPath(); for (let k = 0; k < 5; k++) { const x = -15 + k * 2.4; c.moveTo(x, -4.5 + k * 0.6); c.lineTo(x, -1.5 + k * 0.6); } K.stroke(c, '#ffd24a', 1.1);
      c.restore();
      // dalekohled
      if (!act) {
        const r = -0.18 + sin(t * 0.9) * 0.08;
        c.save(); c.translate(10, -17); c.rotate(r);
        [[0, 7, 2.2, '#d8aa48'], [7, 15, 2.8, '#c99a3a'], [15, 24, 3.5, '#b08430']].forEach(([a, b, h, col]) => { c.beginPath(); c.rect(a, -h, b - a, h * 2); K.fill(c, K.lg(c, 0, -h, 0, h, [K.light(col, 0.4), col, K.dark(col, 0.4)]), 1.2); });
        c.beginPath(); c.rect(23, -4.2, 2.6, 8.4); K.fill(c, '#7a5418', 1.2);
        E(c, 25.6, 0, 1.2, 3.2); c.fillStyle = '#9ad8ff'; c.fill(); dot(c, 25.6, -1.5, 0.8, '#fff');
        c.restore();
        E(c, 13, -10, 3.4, 3); K.fill(c, '#1e2a44', 1.2);
      } else {
        for (let i = 0; i < 3; i++) {
          const p = ((t * 2) + i / 3) % 1, x = 6 + p * 34, y = -26 - sin(p * PI) * 10 + p * 18;
          alpha(c, 0.35, () => { c.beginPath(); c.moveTo(x - 8, y + 2); c.lineTo(x, y); K.stroke(c, '#e0f4ff', 3); });
          c.beginPath(); c.arc(x, y, 3.2, 0, TAU); K.fill(c, K.rg(c, x - 1, y - 1, 0, 4, ['#ffffff', '#e4f2ff', '#a8c8e8']), 1.1);
          K.sparkle(c, x + 3, y - 3, 1.8, '#fff');
        }
      }
      c.restore();
    };

    /* ---------- LÉTAJÍCÍ VEVERKA ---------- */
    const veverka = (c, t, act) => {
      const gl = sin(t * 1.8);
      c.save(); c.translate(0, -6 + gl * 2.5); c.rotate(act ? 0.14 : sin(t * 1.8 + 1) * 0.05);
      if (act) speed(c, t, -24, -20, 4, 9, 14, 0.6);
      // ocas – huňatý
      const ts = sin(t * 2.4) * 1.6;
      const TL = [[-17, 5, 6.5, 5.5], [-24, 2, 7, 6.5], [-29, -5 + ts * 0.3, 7, 6.5], [-29, -14 + ts * 0.6, 6.2, 6], [-24, -20 + ts, 5, 4.6]];
      c.beginPath(); TL.forEach(([x, y, rx, ry]) => AE(c, x, y, rx, ry));
      [[-35, -6, 2.8], [-34, -15, 2.4], [-30, 6, 2.6]].forEach(([x, y, r]) => AE(c, x, y + (y < 0 ? ts * 0.5 : 0), r, r));
      sil(c, K.lg(c, -14, 6, -28, -22, ['#a8521e', '#d8823a', '#f6cc94']));
      c.beginPath(); c.moveTo(-15, 3); c.quadraticCurveTo(-26, 0, -28, -10 + ts * 0.5); c.moveTo(-22, 7); c.quadraticCurveTo(-32, 2, -33, -6); c.moveTo(-26, -9); c.quadraticCurveTo(-27, -16, -23, -19 + ts);
      K.stroke(c, 'rgba(138,66,24,.6)', 1);
      alpha(c, 0.7, () => { E(c, -25, -19 + ts, 3, 2, 0.3); c.fillStyle = '#fff4dc'; c.fill(); });
      // šála vlající nahoru dozadu
      const sp = [];
      for (let k = 0; k <= 5; k++) { const u = k / 5; sp.push([7 - u * 25, -8 - u * 5 + sin(t * 9 - k * 1.2) * (0.6 + u * 3.4), 3.4 - u * 1]); }
      c.beginPath(); c.moveTo(sp[0][0], sp[0][1] - sp[0][2]);
      sp.forEach(([x, y, w]) => c.lineTo(x, y - w));
      const e = sp[5]; c.lineTo(e[0] - 3, e[1] - 1); c.lineTo(e[0] - 1, e[1] + 0.6); c.lineTo(e[0] - 3, e[1] + 2.5);
      for (let k = 5; k >= 0; k--) c.lineTo(sp[k][0], sp[k][1] + sp[k][2]);
      c.closePath(); K.fill(c, K.lg(c, 0, -20, 0, -6, ['#ff6a6a', '#c8283a']), 1.3);
      c.beginPath(); [1, 3].forEach(k => { const [x, y, w] = sp[k]; c.moveTo(x + 1, y - w); c.lineTo(x - 1, y + w); }); K.stroke(c, '#fff0e8', 1.6);
      // blána
      c.beginPath(); c.moveTo(19, 1); c.quadraticCurveTo(10, 2, -15, 9); c.quadraticCurveTo(-10, 13, -6, 13); c.quadraticCurveTo(-1, 16, 3, 13); c.quadraticCurveTo(9, 13, 12, 9); c.quadraticCurveTo(16, 7, 19, 1); c.closePath();
      K.fill(c, K.lg(c, 0, 2, 0, 16, ['#d8823a', '#b0602a']), LW);
      c.beginPath(); c.moveTo(-6, 12.5); c.lineTo(-3, 8); c.moveTo(4, 12.5); c.lineTo(4, 7); K.stroke(c, '#8a4218', 0.8);
      // tělo
      c.beginPath(); AE(c, 1, 0, 15, 7.5, -0.12); sil(c, K.lg(c, 0, -8, 0, 8, ['#f0a060', '#c86a2a', '#9a4a1a']));
      alpha(c, 0.9, () => { E(c, 2, 4, 11, 3, -0.12); c.fillStyle = '#fbe6c4'; c.fill(); });
      // nábojnice s žaludy
      c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(0, 2, 6, 7); K.stroke(c, OUT, 3.6); c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(0, 2, 6, 7); K.stroke(c, '#7a4a22', 2);
      if (!act) [[-2.5, -1.5], [2, 3]].forEach(([x, y]) => { E(c, x, y + 1, 1.8, 2.2); K.fill(c, '#b8742a', 0.9); E(c, x, y - 0.6, 2.2, 1.2); K.fill(c, '#6a4220', 0.9); });
      // tlapky
      E(c, 20, 1, 2.6, 2); K.fill(c, '#fbe6c4', 1.1); E(c, -15, 9, 2.6, 2); K.fill(c, '#fbe6c4', 1.1);
      // hlava
      c.save(); c.translate(15, -10); c.rotate(act ? 0.12 : sin(t * 1.3) * 0.04);
      c.beginPath(); c.moveTo(-6, -6); c.lineTo(-6, -14); c.lineTo(-1, -8); c.closePath(); K.fill(c, '#c86a2a', 1.2);
      c.beginPath(); AE(c, 0, 0, 9.5, 8.5); AE(c, 7, 2, 5.5, 4.5, 0.2); sil(c, K.rg(c, 1, -3, 1, 12, ['#f4a868', '#d07432', '#9a4a1a']));
      E(c, 6, 4, 5, 3.5, 0.2); c.fillStyle = '#fbe6c4'; c.fill();
      E(c, 12, 1.4, 1.6, 1.2); K.fill(c, '#3a1e1a', 0.8); dot(c, 11.6, 1, 0.5, '#fff');
      c.beginPath(); c.moveTo(7, 6); c.quadraticCurveTo(9, 7.5, 11, 5.6); K.stroke(c, OUT, 1);
      c.beginPath(); c.rect(8.4, 6.3, 1.8, 2); K.fill(c, '#fff', 0.7);
      c.beginPath(); c.moveTo(10, 3); c.lineTo(17, 1.5); c.moveTo(10, 4); c.lineTo(16.5, 4.5); K.stroke(c, 'rgba(40,20,10,.6)', 0.5);
      K.blush(c, 2.5, 4, 2.2);
      // letecká čepice
      c.beginPath(); c.moveTo(-9, 1); c.quadraticCurveTo(-10, -10, 0, -9.5); c.quadraticCurveTo(6, -9.5, 8, -4); c.quadraticCurveTo(0, -6, -3, 0); c.quadraticCurveTo(-3, 5, -5, 8); c.quadraticCurveTo(-9, 6, -9, 1); c.closePath();
      K.fill(c, K.lg(c, 0, -10, 0, 6, ['#8a5a3a', '#5a3420']), 1.3);
      c.beginPath(); c.moveTo(-7, -2); c.quadraticCurveTo(-5, -8, 2, -8.5); c.setLineDash([1, 1]); K.stroke(c, '#c89a6a', 0.6); c.setLineDash([]);
      // ucho z čepice
      c.beginPath(); c.moveTo(-1, -8); c.lineTo(1, -16); c.lineTo(4, -8.6); c.closePath(); K.fill(c, '#d07432', 1.2);
      c.beginPath(); c.moveTo(0.5, -9); c.lineTo(1.4, -13.5); c.lineTo(2.6, -9); c.fillStyle = '#f0a0a0'; c.fill();
      const bl = blk(t, 2.2);
      if (!act) K.eye(c, 4, -1, 4.2, '#5a3a1a', 0.6, bl);
      c.beginPath(); c.moveTo(1, -5.5); c.quadraticCurveTo(4.5, -7, 8, -5); K.stroke(c, '#5a2a10', 1.2);
      // brýle
      const gy = act ? -1 : -9.5, gx = act ? 4 : 1;
      c.beginPath(); c.moveTo(gx - 9, gy + 1); c.lineTo(gx + 8, gy); K.stroke(c, '#3a2418', 1.8);
      [[gx - 1, gy, 3.4], [gx + 6, gy - 0.4, 3]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); K.fill(c, K.rg(c, x - 1, y - 1, 0, r, ['#e8ffff', '#7ad0f0', '#2a6a9a']), 1); c.beginPath(); c.arc(x, y, r, 0, TAU); K.stroke(c, '#d8aa48', 1.2); dot(c, x - r * 0.35, y - r * 0.35, r * 0.25, '#fff'); });
      c.restore();
      if (act) {
        for (let i = 0; i < 4; i++) {
          const p = (t * 1.6 + i / 4) % 1, x = -10 + i * 7 - p * 6, y = 12 + p * 22;
          c.save(); c.translate(x, y); c.rotate(sin(t * 6 + i) * 0.4);
          E(c, 0, 1.4, 2.6, 3.2); K.fill(c, K.lg(c, -2, 0, 2, 0, ['#e0a050', '#9a5a1a']), 1); E(c, 0, -1.6, 3, 1.6); K.fill(c, '#6a4220', 1);
          c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(1.5, -4.5, 1, -6); K.stroke(c, OUT, 0.7);
          alpha(c, 0.6 + 0.4 * sin(t * 30 + i), () => K.sparkle(c, 1, -6.5, 2, '#ffe060'));
          c.restore();
        }
      }
      c.restore();
    };

    /* ---------- ŽABÍ PRINC ---------- */
    const zaba = (c, t, act) => {
      const br = sin(t * 2.4) * 0.6, bl = blk(t, 0.2), kiss = !act && (t % 5) > 3.6;
      c.save();
      // leknín
      c.beginPath(); c.moveTo(0, 24.5); c.ellipse(0, 24.5, 27, 5, 0, -1.2, -0.95 + TAU - 0.3); c.closePath(); K.fill(c, K.lg(c, 0, 20, 0, 29, ['#6ac85a', '#2e8a3a']), 1.3);
      c.beginPath(); for (let k = 0; k < 5; k++) { const a = PI * 0.25 + k * 0.42; c.moveTo(0, 24.5); c.lineTo(cos(a + PI * 0.5) * 22, 24.5 + sin(a + PI * 0.5) * 4); } K.stroke(c, '#3e9a44', 0.8);
      // plášť
      c.beginPath(); c.moveTo(-6, -8); c.quadraticCurveTo(-22, -4, -26, 20); c.quadraticCurveTo(-18, 24, -8, 21); c.lineTo(-2, 0); c.closePath();
      K.fill(c, K.lg(c, -24, 0, -2, 0, ['#6a0e24', '#b8203a']), LW);
      c.beginPath(); c.moveTo(-23, 15); c.quadraticCurveTo(-21, 2, -12, -3); K.stroke(c, '#e04a5a', 1);
      c.beginPath(); [[-6, -9, 3.6], [-10.5, -8, 3.6], [-14.5, -5.5, 3.4], [-17.5, -2, 3]].forEach(([x, y, r]) => AE(c, x, y, r, r));
      sil(c, K.lg(c, 0, -12, 0, 0, ['#ffffff', '#dcd8e6']), 1.2);
      [[-10.5, -8], [-16, -3.4], [-6, -9.5]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 1.2); c.lineTo(x - 0.7, y + 1.2); c.lineTo(x + 0.7, y + 1.2); c.closePath(); c.fillStyle = OUT; c.fill(); });
      c.translate(0, -br * 0.5);
      // zadní stehno
      E(c, -11, 15, 9, 7.5, -0.3); K.fill(c, K.lg(c, 0, 8, 0, 22, ['#6ad05a', '#3a9a3a']), LW);
      E(c, -6, 22, 8, 2.4); K.fill(c, '#4aaa44', 1.3);
      for (let k = 0; k < 3; k++) dot(c, -1 + k * -3.5 - 1, 22.6, 1.1, '#8ae07a');
      // tělo + hlava + boule očí
      c.beginPath(); AE(c, 2, 7, 17, 14.5); AE(c, 5, -6, 16, 11); AE(c, -3, -16, 7, 6.5); AE(c, 13, -16, 7, 6.5);
      sil(c, K.rg(c, 2, -12, 2, 28, ['#a8f08a', '#5ac84a', '#2a7a2a']));
      // skvrny
      [[-9, 1, 2.4], [-6, 10, 1.8], [-12, -6, 1.6], [0, -12, 1.2]].forEach(([x, y, r]) => { E(c, x, y, r, r * 0.8); c.fillStyle = '#3a9a36'; c.fill(); });
      // bříško
      E(c, 8, 11, 10, 9.5); c.fillStyle = K.lg(c, 0, 2, 0, 20, ['#f4f8b0', '#d4e88a']); c.fill();
      c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(1, 7 + k * 4); c.quadraticCurveTo(8, 9 + k * 4, 16, 7 + k * 4); } K.stroke(c, '#c0d478', 0.7);
      // ruce
      c.beginPath(); c.moveTo(10, 4); c.quadraticCurveTo(14, 14, 12, 21); K.stroke(c, OUT, 5.6); c.beginPath(); c.moveTo(10, 4); c.quadraticCurveTo(14, 14, 12, 21); K.stroke(c, '#5ac84a', 3.2);
      for (let k = 0; k < 3; k++) { dot(c, 10 + k * 3, 22, 1.6, OUT); dot(c, 10 + k * 3, 22, 1.1, '#8ae07a'); }
      // oči
      if (act) { c.beginPath(); c.moveTo(-6, -16); c.lineTo(-0.5, -16); c.moveTo(10, -16); c.lineTo(15.5, -16); K.stroke(c, OUT, 1.8); }
      else { K.eye(c, -3, -16.5, 4.9, '#e8a820', 0.65, bl); K.eye(c, 13, -16.5, 4.9, '#e8a820', 0.65, bl); }
      K.blush(c, -1, -7, 2.6); K.blush(c, 17, -8, 2.4);
      // pusa
      if (kiss) {
        E(c, 18, -5, 2.6, 2.2); K.fill(c, '#ff7a9a', 1.2); E(c, 18.6, -5, 0.9, 0.7); c.fillStyle = '#a02a4a'; c.fill();
        c.beginPath(); c.moveTo(4, -4); c.quadraticCurveTo(10, -3, 15, -5); K.stroke(c, OUT, 1.2);
        const hp = ((t % 5) - 3.6) / 1.4;
        alpha(c, sin(hp * PI), () => { c.save(); c.translate(24 + hp * 6, -10 - hp * 12); c.scale(0.5 + hp * 0.4, 0.5 + hp * 0.4); c.beginPath(); c.moveTo(0, 3); c.bezierCurveTo(-6, -2, -3, -7, 0, -3); c.bezierCurveTo(3, -7, 6, -2, 0, 3); K.fill(c, '#ff5a7a', 1.2); c.restore(); });
      } else if (!act) {
        c.beginPath(); c.moveTo(-3, -6); c.quadraticCurveTo(9, 3, 21, -7); K.stroke(c, OUT, 1.5);
        c.beginPath(); c.moveTo(-4, -7.5); c.quadraticCurveTo(-3.5, -6, -2, -5.2); c.moveTo(20, -8.4); c.lineTo(21.8, -5.4); K.stroke(c, OUT, 1.2);
      }
      dot(c, 17, -10, 0.6, '#2a6a2a'); dot(c, 19, -10.4, 0.6, '#2a6a2a');
      // koruna
      c.save(); c.translate(5, -21); c.rotate(0.15 + sin(t * 2.4) * 0.04);
      c.beginPath(); c.moveTo(-6, 0); c.lineTo(-7, -7); c.lineTo(-3.5, -3.5); c.lineTo(0, -9); c.lineTo(3.5, -3.5); c.lineTo(7, -7); c.lineTo(6, 0); c.closePath();
      K.fill(c, K.lg(c, -6, -9, 6, 0, ['#fff2a0', '#ffd24a', '#c8901a']), 1.3);
      c.beginPath(); c.rect(-6.4, -1.8, 12.8, 2.6); K.fill(c, '#e8b030', 1.1);
      dot(c, 0, -0.5, 1.2, '#e02a4a'); dot(c, -3.6, -0.5, 0.8, '#3a8ae8'); dot(c, 3.6, -0.5, 0.8, '#3a8ae8');
      dot(c, -7, -7.4, 1, '#fff2a0'); dot(c, 0, -9.4, 1.1, '#fff2a0'); dot(c, 7, -7.4, 1, '#fff2a0');
      const g = (t * 0.5) % 1; if (g < 0.2) alpha(c, sin(g / 0.2 * PI), () => K.sparkle(c, 3.5, -5, 3.5, '#fff'));
      c.restore();
      // jazyk
      if (act) {
        const p = (t * 2.5) % 1, ext = sin(Math.min(1, p * 1.4) * PI), tx = 19 + ext * 26, ty = -6 - ext * 4;
        E(c, 15, -5, 4, 3); K.fill(c, '#5a0e1e', 1.2);
        c.beginPath(); c.moveTo(15, -5); c.quadraticCurveTo(19 + ext * 12, -3 + ext * 2, tx, ty); K.stroke(c, OUT, 4.6); c.beginPath(); c.moveTo(15, -5); c.quadraticCurveTo(19 + ext * 12, -3 + ext * 2, tx, ty); K.stroke(c, '#ff6a8a', 2.8);
        c.beginPath(); c.arc(tx, ty, 3.4, 0, TAU); K.fill(c, '#ff7a9a', 1.3);
        if (p > 0.35) coin(c, tx + 2, ty - 1, 3, t * 6);
        K.gloss(c, tx - 1, ty - 1.2, 1.2, 0.7, 0, 0.8);
      }
      c.restore();
    };

    /* ---------- ŽIVÁ LUCERNA ---------- */
    const lucernik = (c, t, act) => {
      const hop = Math.max(0, sin(t * 3)), fk = sin(t * 13) * 0.5 + sin(t * 7.3) * 0.5, bl = blk(t, 1.3);
      c.save();
      // nožky
      const lg2 = hop * 3;
      [[-6, -1], [6, 1]].forEach(([x, d]) => { c.beginPath(); c.moveTo(x, 17); c.lineTo(x + d, 23 - lg2 * 0.3); K.stroke(c, OUT, 3.6); c.beginPath(); c.moveTo(x, 17); c.lineTo(x + d, 23 - lg2 * 0.3); K.stroke(c, '#4a4650', 1.8); E(c, x + d * 2 + 1, 24.5 - lg2 * 0.3, 4, 2); K.fill(c, '#3a3640', 1.2); });
      c.translate(0, -hop * 3);
      K.glow(c, 0, -2, act ? 36 : 26, '#ffb347', act ? 0.6 : 0.32 + fk * 0.05);
      if (act) {
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.2; c.translate(0, -2); c.rotate(t * 0.8);
        c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.moveTo(cos(a - 0.1) * 16, sin(a - 0.1) * 16); c.lineTo(cos(a) * (28 + (i % 2) * 6), sin(a) * (28 + (i % 2) * 6)); c.lineTo(cos(a + 0.1) * 16, sin(a + 0.1) * 16); }
        c.fillStyle = '#ffd890'; c.fill(); c.restore();
      }
      // podstava
      c.beginPath(); c.moveTo(-14, 11); c.lineTo(14, 11); c.lineTo(11, 18); c.lineTo(-11, 18); c.closePath(); K.fill(c, K.lg(c, 0, 11, 0, 18, ['#6a6470', '#2e2a34']), LW);
      [-8, 0, 8].forEach(x => dot(c, x, 14.5, 0.9, '#9a94a0'));
      // sklo
      c.beginPath(); c.rect(-11.5, -16, 23, 27); c.fillStyle = K.rg(c, 0, 0, 2, 18, act ? ['#fffbe8', '#ffe090', '#ffa040'] : ['#fff2c0', '#ffc868', '#e8842a']); c.fill();
      c.fillStyle = 'rgba(120,60,20,.28)'; c.fillRect(-11.5, -16, 5, 27); c.fillRect(6.5, -16, 5, 27);
      // svíčka
      c.beginPath(); c.moveTo(-3.5, 3); c.lineTo(-3.5, 11); c.lineTo(3.5, 11); c.lineTo(3.5, 3); c.quadraticCurveTo(0, 4.5, -3.5, 3); c.closePath(); K.fill(c, '#fff4dc', 1);
      c.beginPath(); c.moveTo(1.5, 3.6); c.quadraticCurveTo(2.2, 6, 1.6, 7.4); K.stroke(c, '#f0dcb8', 1.2);
      // plamen s tváří
      const fh = act ? 21 : 17 + fk, ph = t * 9;
      flameU(c, 0, 3.5, fh, act ? 8.4 : 7, ph); c.fillStyle = '#ff7a1a'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#c84a10'; c.stroke();
      flameU(c, 0, 3.5, fh * 0.8, act ? 6.4 : 5.4, ph + 1); c.fillStyle = '#ffc040'; c.fill();
      flameU(c, 0, 3.5, fh * 0.45, act ? 3.6 : 2.6, ph + 2); c.fillStyle = '#fff8d8'; c.fill();
      if (act) { K.happyEye(c, -2.6, -3.5, 1.7); K.happyEye(c, 2.6, -3.5, 1.7); }
      else { [-2.6, 2.6].forEach(x => { E(c, x, -3.2, 1.5, 2.2 * (1 - bl * 0.9)); c.fillStyle = '#5a1e0a'; c.fill(); if (bl < 0.5) dot(c, x + 0.4, -3.9, 0.5, '#fff'); }); }
      c.beginPath(); c.arc(0, -0.5, act ? 1.8 : 1.2, 0.15 * PI, 0.85 * PI); K.stroke(c, '#5a1e0a', 0.9);
      // prasklina
      c.beginPath(); c.moveTo(-10.5, -12); c.lineTo(-8, -9); c.lineTo(-9.5, -7); c.lineTo(-7, -4); K.stroke(c, 'rgba(255,255,255,.8)', 0.7);
      alpha(c, 0.5, () => { c.beginPath(); c.moveTo(5, -14); c.lineTo(9, -14); c.lineTo(4, 6); c.lineTo(1, 6); c.closePath(); c.fillStyle = '#fff'; c.fill(); });
      // rám
      c.beginPath(); c.rect(-11.5, -16, 23, 27); c.lineWidth = LW; c.strokeStyle = OUT; c.stroke();
      [[-11.5, 2.4], [11.5, 2.4], [-6.5, 1.4], [6.5, 1.4]].forEach(([x, w]) => { c.beginPath(); c.moveTo(x, -16); c.lineTo(x, 11); K.stroke(c, OUT, w + 1.6); c.beginPath(); c.moveTo(x, -16); c.lineTo(x, 11); K.stroke(c, '#5a5460', w); });
      c.beginPath(); c.moveTo(-11.5, -3); c.lineTo(-6.5, -3); c.moveTo(6.5, -3); c.lineTo(11.5, -3); K.stroke(c, '#5a5460', 1.2);
      // střecha
      c.beginPath(); c.moveTo(-15.5, -15); c.lineTo(15.5, -15); c.lineTo(7, -25); c.lineTo(-7, -25); c.closePath();
      K.fill(c, K.lg(c, -15, 0, 15, 0, ['#4a6a64', '#6a7a74', '#3a4a48']), LW);
      E(c, -6, -18, 3, 1.4, -0.2); c.fillStyle = '#5ab8a0'; c.fill(); E(c, 8, -20, 2, 1, 0.3); c.fill();
      c.beginPath(); c.moveTo(-15.5, -15); c.lineTo(15.5, -15); K.stroke(c, OUT, 3.4); c.beginPath(); c.moveTo(-15.5, -15); c.lineTo(15.5, -15); K.stroke(c, '#8a8490', 1.6);
      for (let k = -2; k <= 2; k++) { E(c, k * 3.5, -21, 0.8, 1.5); c.fillStyle = act ? '#fff2a0' : '#ffb347'; c.fill(); }
      c.beginPath(); c.rect(-3.5, -28.5, 7, 3.5); K.fill(c, '#4a4650', 1.2);
      // háček – zatočený
      c.beginPath(); c.moveTo(0, -28.5); c.quadraticCurveTo(0, -35, 5, -35); c.quadraticCurveTo(9, -35, 8.5, -31.5); c.quadraticCurveTo(8, -29.5, 6, -30.5);
      K.stroke(c, OUT, 3.4); c.beginPath(); c.moveTo(0, -28.5); c.quadraticCurveTo(0, -35, 5, -35); c.quadraticCurveTo(9, -35, 8.5, -31.5); c.quadraticCurveTo(8, -29.5, 6, -30.5); K.stroke(c, '#6a6470', 1.6);
      // jiskry
      motes(c, t, act ? 5 : 2, -8, 16, -24, act ? 22 : 16, 0.9, '#ffd060', 1, 31);
      if (act) for (let i = 0; i < 5; i++) { const p = (t * 0.8 + i / 5) % 1, a = i / 5 * TAU + 0.6; alpha(c, sin(p * PI), () => { const x = cos(a) * (22 + p * 8), y = -4 + sin(a) * 14 - p * 10; c.fillStyle = '#9aff9a'; c.fillRect(x - 0.7, y - 2.4, 1.4, 4.8); c.fillRect(x - 2.4, y - 0.7, 4.8, 1.4); }); }
      // můra
      const ma = t * 1.6, mx = cos(ma) * 21, my = -8 + sin(ma * 2) * 6, wf = Math.abs(sin(t * 22));
      c.save(); c.translate(mx, my); c.scale(0.9, 0.9);
      E(c, -2, -1.5 * wf, 2.6, 2.2 * wf + 0.4, -0.4); K.fill(c, '#e8dcc8', 0.8); E(c, 2, -1.5 * wf, 2.6, 2.2 * wf + 0.4, 0.4); K.fill(c, '#f4ecdc', 0.8);
      E(c, 0, 0, 1, 2); K.fill(c, '#8a7a6a', 0.7);
      c.restore();
      c.restore();
    };

    /* ---------- KOLIBŘÍK ---------- */
    const kBody = (c, f) => { c.beginPath(); AE(c, -3, 3, 12, 7.5, -0.55); AE(c, 7, -8, 8, 7.5); c.moveTo(-10, 10); c.lineTo(-16, 14); c.lineTo(-8, 13); if (f) sil(c, f); };
    const kolibrik = (c, t, act) => {
      const hv = sin(t * 3) * 2.5, wb = sin(t * 46), bl = blk(t, 0.7), dash = act ? ((t * 2.5) % 1) : 0;
      c.save(); c.translate(-2 + (act ? 6 : 0), -8 + hv); c.rotate(act ? 0.12 : sin(t * 1.5) * 0.04);
      if (act) {
        speed(c, t, -20, -12, 4, 7, 14, 0.6);
        [16, 8].forEach((d, i) => alpha(c, 0.18 + i * 0.12, () => { c.save(); c.translate(-d, 0); kBody(c); c.fillStyle = '#7af0d8'; c.fill(); c.restore(); }));
      }
      // ocas
      c.save(); c.translate(-11, 11); c.rotate(sin(t * 3) * 0.1);
      [[-2.3, '#1a6a6a'], [-2.6, '#2a8a80'], [-2.0, '#2a8a80']].forEach(([a, col]) => { E(c, cos(a + PI * 0.4) * -6, sin(a + PI * 0.4) * -6, 8, 2.4, a + PI * 0.4); K.fill(c, col, 1.2); });
      c.restore();
      // zadní křídlo – rozmazané
      c.save(); c.translate(-1, -4);
      alpha(c, 0.22, () => { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 22, -2.9, -1.0); c.closePath(); c.fillStyle = '#d8fff4'; c.fill(); });
      c.rotate(-1.95 + wb * 0.75 - 0.25); E(c, 11, 0, 11, 3.2); K.fill(c, 'rgba(160,230,220,.75)', 1); c.restore();
      // tělo
      kBody(c, K.lg(c, -12, 10, 12, -14, ['#1a7a6a', '#3ac8a8', '#7af0b8']));
      c.save(); kBody(c); c.clip();
      E(c, 0, 9, 9, 5, -0.5); c.fillStyle = '#e8f4ee'; c.fill();
      // duhový lesk
      c.globalAlpha = 0.45; E(c, -4, -1, 7, 2.2, -0.55); c.fillStyle = K.lg(c, -10, -4, 4, 2, [[0, 'rgba(0,0,0,0)'], [((t * 0.4) % 1) * 0.6 + 0.2, '#e0fff0'], [1, 'rgba(0,0,0,0)']]); c.fill(); c.globalAlpha = 1;
      // rubínový náprsník (šupinky)
      c.beginPath(); c.moveTo(12.5, -5); c.quadraticCurveTo(15, 0, 9, 4.5); c.quadraticCurveTo(3, 5, 1.5, 0); c.quadraticCurveTo(6, -1, 12.5, -5); c.closePath();
      const sh = (t * 0.6) % 1;
      c.fillStyle = K.lg(c, 2, 5, 14, -5, [[0, '#a0084a'], [Math.max(0.01, sh * 0.8), '#ff3a7a'], [Math.min(0.99, sh * 0.8 + 0.2), '#ffb0d0'], [1, '#c80a4a']]); c.fill();
      c.beginPath(); for (let k = 0; k < 4; k++) { const x = 4 + k * 2.4, y = 2.5 - k * 1.6; c.moveTo(x - 1.2, y); c.quadraticCurveTo(x, y + 1.4, x + 1.2, y); } K.stroke(c, 'rgba(90,0,30,.55)', 0.6);
      c.restore();
      // zobák
      const bk = act ? 4 : 0;
      c.beginPath(); c.moveTo(14, -10); c.quadraticCurveTo(26, -9.5, 36 + bk, -6.5); c.quadraticCurveTo(26, -7, 14, -6.6); c.closePath(); K.fill(c, K.lg(c, 14, -10, 14, -6, ['#4a4a58', '#14141c']), 1.1);
      if (!act) { const dp = (t * 0.5) % 1; alpha(c, sin(dp * PI), () => { E(c, 37.5, -5.5 + dp * 3, 1, 1.3); c.fillStyle = '#c8f0ff'; c.fill(); }); }
      // oko
      K.eye(c, 8.5, -10, 3.9, '#3a2418', 0.7, act ? 0.3 : bl);
      c.beginPath(); c.moveTo(4.5, -14); c.quadraticCurveTo(8, -15.4, 12, -13.5); K.stroke(c, '#0e3a34', 1.2);
      K.blush(c, 5, -6.5, 1.8);
      // nožky
      c.beginPath(); c.moveTo(0, 9); c.lineTo(1.5, 12); c.moveTo(2.5, 8.5); c.lineTo(4, 11.5); K.stroke(c, OUT, 1);
      // přední křídlo
      c.save(); c.translate(-2, -2);
      alpha(c, 0.3, () => { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 24, -2.95, -0.85); c.closePath(); c.fillStyle = K.rg(c, 0, 0, 4, 24, ['rgba(255,255,255,0)', '#e8fffa']); c.fill(); });
      c.rotate(-1.9 + wb * 0.85); E(c, 12, 0, 12.5, 3.6); K.fill(c, K.lg(c, 0, 0, 24, 0, ['#2a9a8a', '#a8fff0']), 1.2);
      c.beginPath(); c.moveTo(4, 0); c.lineTo(20, 0); K.stroke(c, 'rgba(255,255,255,.6)', 0.6);
      c.restore();
      // třpyt
      const g = (t * 0.7) % 1; if (g < 0.3) alpha(c, sin(g / 0.3 * PI), () => K.sparkle(c, -2, -2, 3, '#ffffff'));
      if (act) {
        const tx = 40 + bk;
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t * 3, p = ((t * 5) + i * 0.2) % 1; alpha(c, 1 - p, () => K.star(c, tx + cos(a) * (3 + p * 8), -6 + sin(a) * (3 + p * 8), 2.2, '#fff2a0', 4, 0.4)); }
        K.star(c, tx, -6, 4 + dash * 2, '#ffffff', 4, 0.35);
      }
      c.restore();
    };

    Object.assign(D, { gryf, draci, skritek, robot, houba, tucnak, veverka, zaba, lucernik, kolibrik });
  }

  /* část 3 – EPIC: mracek, duch, chobotnice, netopyr, meduza, gemik, pegas, magmik, quetzal, mura */
  {
    const sin = Math.sin, cos = Math.cos, PI = Math.PI, abs = Math.abs, max = Math.max, min = Math.min, flo = Math.floor;
    // podcesta elipsy bez spojovací čáry
    const ell = (c, x, y, rx, ry, r) => { r = r || 0; c.moveTo(x + rx * cos(r), y + rx * sin(r)); c.ellipse(x, y, rx, ry, r, 0, TAU); };
    const E = (c, x, y, rx, ry, r) => { c.beginPath(); c.ellipse(x, y, rx, ry, r || 0, 0, TAU); };
    // sloučený obrys více tvarů: tlustý obrys, pak výplň (vnitřní čáry zmizí)
    const merged = (c, build, fill, lw, oc) => { c.beginPath(); build(); c.lineJoin = 'round'; c.lineWidth = lw * 2; c.strokeStyle = oc || OUT; c.stroke(); c.fillStyle = fill; c.fill(); };
    const blk = (t, p, o) => { const ph = ((t + (o || 0)) / p) % 1; return ph < 0.07 ? sin(ph / 0.07 * PI) : 0; };
    // víčko přes oko (amt 0..1, tilt = sklon)
    const lid = (c, x, y, r, amt, tilt, col) => {
      c.save(); c.beginPath(); c.ellipse(x, y, r, r * 1.08, 0, 0, TAU); c.clip();
      c.translate(x, y); c.rotate(tilt); const yy = -r * 1.15 + r * 2.3 * amt;
      c.fillStyle = col; c.fillRect(-r * 1.8, -r * 2.2, r * 3.6, yy + r * 2.2);
      c.beginPath(); c.moveTo(-r * 1.8, yy); c.lineTo(r * 1.8, yy); c.lineWidth = max(0.9, r * 0.34); c.strokeStyle = OUT; c.stroke(); c.restore();
      c.beginPath(); c.ellipse(x, y, r, r * 1.08, 0, 0, TAU); c.lineWidth = max(0.8, r * 0.28); c.strokeStyle = OUT; c.stroke();
    };
    const zig = (c, x0, y0, x1, y1, seed, n, j) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; c.moveTo(x0, y0); for (let i = 1; i < n; i++) { const k = i / n, o = (K.rnd(seed * 13.7 + i) - 0.5) * 2 * j; c.lineTo(x0 + dx * k + nx * o, y0 + dy * k + ny * o); } c.lineTo(x1, y1); };
    const bolt = (c, x0, y0, x1, y1, seed, n, j, col, w) => { c.save(); c.beginPath(); zig(c, x0, y0, x1, y1, seed, n, j); c.lineCap = 'round'; c.lineJoin = 'round'; c.globalCompositeOperation = 'lighter'; const a = c.globalAlpha; c.globalAlpha = a * 0.35; c.strokeStyle = col; c.lineWidth = w * 3.4; c.stroke(); c.globalAlpha = a; c.lineWidth = w; c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = w * 0.42; c.stroke(); c.restore(); };
    // zúžená končetina / chapadlo podle bodů
    const taper = (c, P, w0, w1) => {
      const n = P.length, L = [], R = [];
      for (let i = 0; i < n; i++) { const a = P[max(0, i - 1)], b = P[min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * i / (n - 1)) / 2; L.push([P[i][0] - dy / d * w, P[i][1] + dx / d * w]); R.push([P[i][0] + dy / d * w, P[i][1] - dx / d * w]); }
      c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]);
      const T = P[n - 1]; c.quadraticCurveTo(T[0] + (T[0] - P[n - 2][0]) * 0.6, T[1] + (T[1] - P[n - 2][1]) * 0.6, R[n - 1][0], R[n - 1][1]);
      for (let i = n - 2; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath();
    };
    // body zatáčející se křivky (stočený konec)
    const curl = (x, y, a, len, cv, n, wob) => { const P = [[x, y]], st = len / n; for (let i = 1; i <= n; i++) { a += cv * (i / n) * (i / n) * 2 + (wob || 0); x += cos(a) * st; y += sin(a) * st; P.push([x, y]); } return P; };
    const smooth = (c, P) => { c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) c.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2); const L = P[P.length - 1]; c.lineTo(L[0], L[1]); };
    const bz = (a, b, q, d, u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * q[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * q[1] + u * u * u * d[1]]; };
    // plamínek
    const tongue = (c, x, y, w, h, lean) => { c.moveTo(x - w, y); c.bezierCurveTo(x - w, y - h * 0.45, x + lean - w * 0.3, y - h * 0.7, x + lean, y - h); c.bezierCurveTo(x + lean * 0.4 + w * 0.5, y - h * 0.6, x + w, y - h * 0.4, x + w, y); c.closePath(); };
    // kůň (tělo + krk + hlava jako jedna cesta)
    const horseBuild = c => { ell(c, -4, 2, 14, 9, -0.06); c.moveTo(3, -3); c.lineTo(9, -19); c.lineTo(17, -15); c.lineTo(13, 5); c.closePath(); ell(c, 15, -19, 7.6, 6.6, 0.35); ell(c, 21.5, -13.5, 5.4, 4.6, 0.5); };
    const leg = (c, x, y, a1, a2, col, hoof, w, oc) => {
      const jx = x + sin(a1) * 8, jy = y + cos(a1) * 8, fx = jx + sin(a2) * 8, fy = jy + cos(a2) * 8;
      c.beginPath(); c.moveTo(x, y); c.lineTo(jx, jy); c.lineTo(fx, fy); c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = oc || OUT; c.lineWidth = w + 2.8; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
      if (hoof) { c.save(); c.translate(fx, fy); c.rotate(-a2); c.beginPath(); c.moveTo(-2.5, -1.2); c.lineTo(2.5, -1.2); c.lineTo(3, 2); c.lineTo(-3, 2); c.closePath(); K.fill(c, hoof, 1.2); c.restore(); }
      return [fx, fy];
    };
    // křídlo z bouřkového mraku
    const cloudWing = (c, x, y, flap, far, t, lit) => {
      c.save(); c.translate(x, y); c.rotate(0.08 + flap * 0.24); if (far) c.scale(0.86, 0.86);
      const L = [[0, 0, 5], [-6, -6, 6.5], [-13, -11, 7], [-20, -14, 6.5], [-27, -15.5, 5.5], [-33, -15.5, 4], [-8, 1, 4.5], [-15, -3, 5], [-22, -6.5, 4.5], [-28, -9.5, 3.5]];
      const b = () => L.forEach(l => ell(c, l[0], l[1], l[2], l[2]));
      merged(c, b, K.lg(c, 0, -22, 0, 5, far ? ['#8e9cbc', '#46526e'] : [[0, '#f0f4fc'], [0.5, '#aebcd6'], [1, '#5e6a8c']]), 1.4);
      c.save(); c.beginPath(); b(); c.clip();
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 1; i < 6; i++) { E(c, L[i][0] + 1, L[i][1] - L[i][2] * 0.45, L[i][2] * 0.55, L[i][2] * 0.28, -0.3); c.fill(); }
      E(c, -14, 4, 22, 5, -0.3); c.fillStyle = 'rgba(30,40,80,.28)'; c.fill();
      const f = lit ? 0.7 + 0.3 * sin(t * 40) : max(0, 1 - ((t * 0.8 + (far ? 0.5 : 0)) % 1) * 8);
      if (f > 0.02) { K.glow(c, -16, -9, 15, '#c8f4ff', f * 0.85); c.globalAlpha = f; bolt(c, -5, -5, -27, -12, flo(t * 0.8 + (far ? 3 : 0)) + (lit ? flo(t * 15) : 0), 4, 2.6, '#8aeaff', 0.9); c.globalAlpha = 1; }
      c.restore(); c.restore();
    };

    Object.assign(D, {
      /* ---------------- BOUŘŇÁČEK ---------------- */
      mracek(c, t, act) {
        const bob = sin(t * 1.8) * 1.4, jx = act ? sin(t * 53) * 0.8 : 0;
        c.save();
        // déšť
        c.lineCap = 'round'; c.strokeStyle = '#5a9ae8'; c.lineWidth = 1.5;
        const nR = act ? 9 : 6;
        for (let i = 0; i < nR; i++) { const ph = (t * (act ? 2.4 : 1.3) + K.rnd(i + 3)) % 1, x = -17 + i * (34 / (nR - 1)) + K.rnd(i) * 2 - ph * 3, y = 9 + ph * 15 + bob; c.globalAlpha = (1 - ph) * 0.85; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 1, y + 4); c.stroke(); }
        // šplouchnutí na zemi
        for (let i = 0; i < 2; i++) { const ph = (t * 1.3 + i * 0.5) % 1; c.globalAlpha = (1 - ph) * 0.6; E(c, -8 + i * 14, 25.5, 1 + ph * 4, 0.4 + ph * 1.2); c.lineWidth = 0.8; c.stroke(); }
        c.globalAlpha = 1;
        c.translate(jx, -8 + bob);
        const back = [[-21, -3, 9], [-9, -15, 11], [9, -16, 11], [22, -6, 9]], front = [[-18, 3, 10], [-6, -6, 14], [9, -7, 14], [21, 2, 10], [2, 6, 12], [-10, 8, 9], [13, 8, 9]];
        merged(c, () => back.forEach(b => ell(c, b[0], b[1], b[2], b[2])), K.lg(c, 0, -26, 0, 6, act ? ['#6a6898', '#2e2a4e'] : ['#7a86a8', '#3a4262']), 1.5);
        const fb = () => front.forEach(b => ell(c, b[0], b[1], b[2], b[2]));
        merged(c, fb, K.lg(c, 0, -20, 0, 18, act ? [[0, '#cfcaf0'], [0.45, '#7e7aae'], [1, '#3a3664']] : [[0, '#e6ecf8'], [0.45, '#a2b0cc'], [1, '#56607e']]), 1.6);
        c.save(); c.beginPath(); fb(); c.clip();
        const fl = act ? 0.55 + 0.45 * abs(sin(t * 31)) : max(0, 1 - ((t * 0.55 + 0.35) % 1) * 9);
        if (fl > 0.01) { K.glow(c, -12, -2, 22, '#fff4b0', fl * 0.9); c.globalAlpha = fl; bolt(c, -21, -13, -8, 8, flo(t * 4), 6, 3.2, '#ffd23a', 0.8); c.globalAlpha = 1; }
        c.fillStyle = 'rgba(255,255,255,.45)'; front.forEach(b => { if (b[1] < 4) { E(c, b[0] - b[2] * 0.2, b[1] - b[2] * 0.52, b[2] * 0.55, b[2] * 0.28, -0.2); c.fill(); } });
        E(c, 2, 17, 30, 7); c.fillStyle = 'rgba(30,30,70,.32)'; c.fill();
        c.restore();
        // jiskřička na okraji
        if (!act && (t * 1.7) % 1 < 0.2) bolt(c, -27, -10, -34, -18, flo(t * 1.7), 3, 1.6, '#fff36a', 0.8);
        // obličej
        const lidC = act ? '#a29ece' : '#b8c2d8', irisC = act ? '#ffd23a' : '#4a6ab0', ey = -3;
        K.eye(c, 3, ey, 3.5, irisC, 0.35, 0); K.eye(c, 13, ey, 3.5, irisC, 0.35, 0);
        lid(c, 3, ey, 3.5, act ? 0.32 : 0.47, act ? 0.55 : 0.32, lidC); lid(c, 13, ey, 3.5, act ? 0.32 : 0.47, act ? -0.55 : -0.32, lidC);
        c.fillStyle = '#2e3450';
        c.beginPath(); c.moveTo(-2.5, -10.5); c.lineTo(7, act ? -5.6 : -7.4); c.lineTo(7, -5); c.lineTo(-2, -8.4); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(18.5, -10.5); c.lineTo(9, act ? -5.6 : -7.4); c.lineTo(9, -5); c.lineTo(18, -8.4); c.closePath(); c.fill();
        if (act) { E(c, 8, 5, 4, 3.4); K.fill(c, '#3a1630', 1.3); E(c, 8, 7, 2.4, 1.2); c.fillStyle = '#ff6a8a'; c.fill(); c.fillStyle = '#fff'; c.fillRect(5.5, 1.9, 5, 1.2); }
        else {
          c.beginPath(); c.moveTo(4.5, 6); c.quadraticCurveTo(8, 2.4, 11.5, 6); K.stroke(c, OUT, 1.5); c.beginPath(); c.moveTo(6.5, 6.4); c.quadraticCurveTo(8, 7.7, 9.5, 6.4); K.stroke(c, OUT, 1);
          // pěstička s bleskem jako s klackem
          const ac = K.lg(c, 0, 6, 0, 16, ['#d6deee', '#8c98b6']);
          c.save(); c.translate(26, 12); c.rotate(0.35 + sin(t * 2) * 0.1);
          c.beginPath(); c.moveTo(-1, 0); c.lineTo(-3, 6); c.lineTo(0, 5.6); c.lineTo(-1.6, 12); c.lineTo(4, 3.4); c.lineTo(1, 3.8); c.lineTo(2.6, 0); c.closePath(); K.fill(c, '#ffe14a', 1);
          if ((t * 3) % 1 < 0.5) K.glow(c, 0, 6, 7, '#fff3a0', 0.6);
          c.restore();
          E(c, 25.5, 11, 3.8, 3.3); K.fill(c, ac, 1.3); K.gloss(c, 24.6, 9.8, 1.6, 0.8, -0.3, 0.6);
          E(c, -25, 10, 3.4, 3); K.fill(c, ac, 1.3);
        }
        if (act) { const s = flo(t * 18); bolt(c, 10, 15, 33, 33, s, 6, 3.5, '#ffe14a', 2.2); bolt(c, 21, 24, 29, 18, s + 7, 3, 2, '#ffe14a', 1); K.glow(c, 33, 33, 11, '#fff6a0', 0.9); }
        c.restore();
      },

      /* ---------------- DUCH RYTÍŘ ---------------- */
      duch(c, t, act) {
        const fl = sin(t * 2.2), w = t * 5;
        c.save(); c.translate(act ? 5 : 0, fl * 2 - 1); if (act) c.rotate(0.1);
        // odlétající chomáčky
        c.fillStyle = '#e4faff';
        for (let i = 0; i < 5; i++) { const ph = (t * 0.45 + i / 5) % 1, r = 2.6 * (1 - ph) + 0.7; c.globalAlpha = (1 - ph) * 0.6 * min(1, ph * 5); E(c, -24 - ph * 12 + sin(t * 2 + i * 2) * 2, 10 - ph * 24 + i, r, r); c.fill(); }
        c.globalAlpha = 1;
        const body = () => { c.moveTo(-13, -12); c.bezierCurveTo(-14, -31, 14, -31, 14, -12); c.bezierCurveTo(15, -2, 13, 6, 10, 12);
          c.quadraticCurveTo(6, 18 + sin(w) * 2, 1, 14); c.quadraticCurveTo(-3, 20 + sin(w + 1.3) * 2, -8, 15); c.quadraticCurveTo(-13, 21 + sin(w + 2.6) * 2, -18, 15); c.quadraticCurveTo(-25, 19 + sin(w + 3.9) * 2, -31, 9 + sin(w + 4.5) * 3);
          c.quadraticCurveTo(-23, 9, -18, 3); c.bezierCurveTo(-14, -1, -12, -5, -13, -12); c.closePath(); };
        c.beginPath(); body(); K.fill(c, K.rg(c, 3, -12, 2, 30, [[0, 'rgba(255,255,255,.98)'], [0.5, 'rgba(214,246,255,.93)'], [1, 'rgba(120,196,236,.82)']]), 1.5, '#24506e');
        c.save(); c.beginPath(); body(); c.clip();
        c.strokeStyle = 'rgba(120,220,255,.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-8, 12); c.quadraticCurveTo(-18, 12, -27, 8); c.moveTo(-4, 8); c.quadraticCurveTo(-12, 7, -18, 5); c.stroke();
        K.glow(c, -20, 10, 12, '#7ae8ff', act ? 0.7 : 0.4);
        c.restore();
        // roztrhaná varkoč s věžičkou
        c.beginPath(); c.moveTo(-10, -1); c.lineTo(11, -1); c.lineTo(10, 10); c.lineTo(7.5, 8); c.lineTo(5.5, 12); c.lineTo(2.5, 9); c.lineTo(-0.5, 12.5); c.lineTo(-3.5, 8.5); c.lineTo(-6.5, 11); c.lineTo(-9, 7); c.closePath();
        c.globalAlpha = 0.88; K.fill(c, K.lg(c, 0, -1, 0, 12, ['#6a84d8', '#34468a']), 1.1); c.globalAlpha = 1;
        c.fillStyle = '#eaf0ff'; c.fillRect(-1, 2.8, 4.4, 4.6); c.fillRect(-1, 1.6, 1.2, 1.4); c.fillRect(0.6, 1.6, 1.2, 1.4); c.fillRect(2.2, 1.6, 1.2, 1.4); c.fillStyle = '#34468a'; c.fillRect(0.6, 5.2, 1.2, 2.2);
        // obličej
        if (act) {
          E(c, 2.5, -8, 3.6, 4.6, -0.15); c.fillStyle = '#0e1c2e'; c.fill(); E(c, 11, -8, 3.6, 4.6, 0.15); c.fill();
          K.glow(c, 3, -7.5, 5, '#7affff', 0.9); K.glow(c, 11.5, -7.5, 5, '#7affff', 0.9);
          c.fillStyle = '#c8ffff'; E(c, 3, -7.5, 1.1, 1.4); c.fill(); E(c, 11.5, -7.5, 1.1, 1.4); c.fill();
          c.beginPath(); c.moveTo(3, -1); c.quadraticCurveTo(7, -4, 11.5, -1); c.quadraticCurveTo(13, 5, 7, 7); c.quadraticCurveTo(1, 5, 3, -1); K.fill(c, '#0e1c2e', 1.2);
          K.glow(c, 7, 3, 5, '#5ad8ff', 0.4);
        } else {
          const b = blk(t, 3.7, 1);
          K.eye(c, 3, -7.4, 3.3, '#3aa8ff', 0.45, b); K.eye(c, 11, -7.4, 3.3, '#3aa8ff', 0.45, b);
          c.beginPath(); c.moveTo(4.5, -2.6); c.quadraticCurveTo(7, -0.2, 9.5, -2.6); K.stroke(c, OUT, 1.3);
          K.blush(c, -0.5, -3.5, 2.2); K.blush(c, 14, -3.5, 1.8);
        }
        // helma (stará, promáčklá, trochu nakřivo)
        c.save(); c.translate(0, -23); c.rotate(-0.07 + sin(t * 1.3) * 0.03);
        const sw = sin(t * 2.4) * 0.12;
        [[-2.75, 21, 5.8, '#c82a3e'], [-2.45, 17, 4.6, '#e8505e'], [-3.05, 14, 4, '#a01e30']].forEach(([a, l, wd, col], i) => { taper(c, curl(-3, -15, a + 0.35 + sw * (1 + i * 0.4), l, -0.42, 6, 0), wd, 0.8); K.fill(c, col, 1.1); });
        c.beginPath(); c.moveTo(-8, -18.5); c.quadraticCurveTo(-13, -19.5, -17, -16); K.stroke(c, 'rgba(255,200,200,.6)', 0.7);
        c.beginPath(); c.rect(-4.6, -17, 3.4, 4); K.fill(c, '#7a6a5a', 1);
        const helm = () => { c.moveTo(-16, 16); c.bezierCurveTo(-18, -2, -10, -14, -3, -15); c.bezierCurveTo(6, -14, 15, -6, 15, 6); c.lineTo(15, 9); c.quadraticCurveTo(4, 7, -6, 9); c.quadraticCurveTo(-8, 13, -9, 16); c.closePath(); };
        c.beginPath(); helm(); K.fill(c, K.lg(c, -10, -14, 10, 12, [[0, '#e2e8ee'], [0.45, '#9aa2ac'], [1, '#4c525c']]), 1.5);
        c.save(); c.beginPath(); helm(); c.clip();
        c.fillStyle = 'rgba(170,96,50,.55)'; E(c, -11, 6, 3, 2.2, 0.4); c.fill(); E(c, 9, 0, 2, 1.4); c.fill(); E(c, -6, 13, 2.6, 1.6); c.fill();
        c.beginPath(); c.arc(2, -4, 4, 0.3, 2.4); K.stroke(c, 'rgba(40,44,54,.6)', 1.1); c.beginPath(); c.arc(2, -5, 4, 0.5, 2.2); K.stroke(c, 'rgba(255,255,255,.5)', 0.7);
        c.beginPath(); c.moveTo(-12, 6); c.bezierCurveTo(-13, -4, -8, -11, -3, -12.5); K.stroke(c, 'rgba(255,255,255,.75)', 1.4);
        c.restore();
        c.beginPath(); c.moveTo(15, 8); c.quadraticCurveTo(4, 5.6, -7, 8.4); K.stroke(c, '#5a606a', 2.6);
        c.fillStyle = '#d8dee6'; [[12, 7.3], [7, 6.6], [2, 6.6], [-3, 7.2]].forEach(([x, y]) => { E(c, x, y, 0.8, 0.8); c.fill(); });
        // zvednuté hledí
        const vis = () => { c.moveTo(-1, -3); c.quadraticCurveTo(7, -8, 16, -9.5); c.quadraticCurveTo(12.5, -3, 13.5, 2.5); c.quadraticCurveTo(6, 0, -1, -3); c.closePath(); };
        c.beginPath(); vis(); K.fill(c, K.lg(c, 0, -12, 8, 4, ['#c8d0d8', '#6a727c']), 1.3);
        c.beginPath(); c.moveTo(5, -2.2); c.lineTo(11.5, -5); c.moveTo(6.5, 0); c.lineTo(12, -2); K.stroke(c, '#262a32', 1);
        E(c, -1, -1.5, 1.6, 1.6); K.fill(c, '#b8c0c8', 0.9);
        c.restore();
        // ručky a starý meč
        const sa = act ? 0.25 : 0.5 + sin(t * 1.5) * 0.06;
        c.save(); c.translate(16.5, act ? -6 : 4); c.rotate(sa);
        c.beginPath(); c.moveTo(-1.3, -3); c.lineTo(-1.3, -17); c.lineTo(0, -20); c.lineTo(1.3, -17); c.lineTo(1.3, -12); c.lineTo(0.4, -11); c.lineTo(1.3, -10); c.lineTo(1.3, -3); c.closePath(); K.fill(c, K.lg(c, -1.3, 0, 1.3, 0, ['#f0f6ff', '#9aa6b4']), 1);
        c.fillStyle = 'rgba(160,90,50,.7)'; c.fillRect(-1, -7, 1.6, 1.4);
        c.beginPath(); c.rect(-4.5, -4, 9, 1.8); K.fill(c, '#8a6a3a', 1); c.beginPath(); c.rect(-0.9, -2.4, 1.8, 4.4); K.fill(c, '#5a3a22', 0.9); E(c, 0, 2.6, 1.3, 1.3); K.fill(c, '#8a6a3a', 0.9);
        c.restore();
        const gc = 'rgba(228,248,255,.96)';
        if (act) { E(c, -13, -9, 2.8, 4.6, -0.5); K.fill(c, gc, 1.2, '#24506e'); c.beginPath(); c.moveTo(-15, -13); c.lineTo(-16, -16); c.moveTo(-13, -13.5); c.lineTo(-13, -17); c.moveTo(-11, -13); c.lineTo(-10, -16); K.stroke(c, '#24506e', 1); E(c, 16.5, -6, 3.2, 2.6); K.fill(c, gc, 1.2, '#24506e'); }
        else { E(c, -13, 1, 4, 2.6, 0.6 + sin(t * 3) * 0.2); K.fill(c, gc, 1.2, '#24506e'); E(c, 16.5, 4, 3.2, 2.6); K.fill(c, gc, 1.2, '#24506e'); }
        // BÚ – vlny strachu
        if (act) for (let k = 0; k < 3; k++) { const ph = (t * 2 + k / 3) % 1; c.beginPath(); c.arc(18, -6, 6 + ph * 22, -0.75, 0.75); c.strokeStyle = `rgba(200,250,255,${(1 - ph) * 0.9})`; c.lineWidth = 2.4 * (1 - ph) + 0.4; c.lineCap = 'round'; c.stroke(); }
        c.restore();
      },

      /* ---------------- CHOBOTNICE PIRÁTKA ---------------- */
      chobotnice(c, t, act) {
        const bob = sin(t * 1.6) * 1.6;
        c.save(); c.translate(0, bob); c.rotate(sin(t * 1.1) * 0.05);
        // stožár s vlajkou (za bublinou)
        c.beginPath(); c.moveTo(-12, 8); c.lineTo(-21, -36); K.stroke(c, OUT, 2.6); c.beginPath(); c.moveTo(-12, 8); c.lineTo(-21, -36); K.stroke(c, '#9a6a32', 1.2);
        const fw = t * 6, fy = i => sin(fw - i * 0.9) * 1.3 * (i / 4);
        c.beginPath(); c.moveTo(-20.6, -35.5); for (let i = 1; i <= 4; i++) c.lineTo(-20.6 - i * 3.4, -35.5 + fy(i)); c.lineTo(-31.5, -31.5 + fy(4)); c.lineTo(-34.2, -27.5 + fy(4)); for (let i = 3; i >= 0; i--) c.lineTo(-20 - i * 3.4, -27.5 + fy(i)); c.closePath(); K.fill(c, '#1e1a26', 1.1);
        const sy = -31.5 + fy(2);
        c.beginPath(); c.moveTo(-29.5, sy + 3); c.lineTo(-24, sy - 1.5); c.moveTo(-29.5, sy - 1.5); c.lineTo(-24, sy + 3); K.stroke(c, '#f4efe2', 0.9);
        E(c, -26.8, sy - 0.6, 2, 1.8); c.fillStyle = '#f4efe2'; c.fill(); c.fillStyle = '#1e1a26'; E(c, -27.6, sy - 0.8, 0.5, 0.6); c.fill(); E(c, -26, sy - 0.8, 0.5, 0.6); c.fill();
        // vnější chapadla (pod límcem)
        const tg = K.lg(c, 0, 8, 0, 26, ['#b07aff', '#6a2ac8']);
        const TP = [];
        for (let i = 0; i < 5; i++) {
          const x0 = -9 + i * 4.5, sgn = i < 2 ? 1 : -1, a0 = PI / 2 + (2 - i) * 0.32 + sin(t * 2.4 + i) * 0.12;
          const P = i === 4 ? curl(x0, 10, 0.75, 15, -0.42, 7, sin(t * 2 + 1) * 0.02) : curl(x0, 10, a0, 16 + (i % 2) * 2, sgn * 0.5, 7, sin(t * 3 + i) * 0.03);
          TP.push(P); taper(c, P, 5, 1.1); K.fill(c, tg, 1.2);
        }
        c.fillStyle = '#efd4ff'; [TP[1], TP[3]].forEach(P => { for (let k = 2; k < 6; k++) { E(c, P[k][0] + 0.8, P[k][1] + 0.4, 0.75, 0.75); c.fill(); } });
        // dalekohled
        const S = TP[4][6]; c.save(); c.translate(S[0], S[1]); c.rotate(-0.35);
        c.beginPath(); c.rect(-3, -1.6, 7, 3.2); K.fill(c, K.lg(c, 0, -1.6, 0, 1.6, ['#ffe08a', '#a8701e']), 1); c.beginPath(); c.rect(3.6, -2.1, 3.4, 4.2); K.fill(c, K.lg(c, 0, -2, 0, 2, ['#ffe08a', '#8a5a14']), 1);
        c.fillStyle = '#bff0ff'; c.fillRect(6.4, -1.4, 0.8, 2.8); c.restore();
        // vrtulka
        E(c, -15.5, 9.5, 1.2, 0.8 + 6 * abs(sin(t * 22))); K.fill(c, 'rgba(200,210,220,.8)', 0.9); E(c, -14.5, 9.5, 1.4, 1.4); K.fill(c, '#c8902a', 0.9);
        // vnitřek bubliny
        E(c, 0, -11, 21, 21); c.fillStyle = K.rg(c, -6, -18, 2, 22, [[0, 'rgba(235,250,255,.22)'], [0.8, 'rgba(160,215,255,.28)'], [1, 'rgba(110,170,255,.5)']]); c.fill();
        c.save(); E(c, 0, -11, 20.4, 20.4); c.clip();
        // chapadla uvnitř
        c.lineCap = 'round';
        [[-6, -2, -8, 11], [1, 0, 1, 11], [8, -2, 9, 11]].forEach(([x0, y0, x1, y1], i) => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + sin(t * 2 + i) * 3, (y0 + y1) / 2, x1, y1); c.strokeStyle = OUT; c.lineWidth = 6.4; c.stroke(); c.strokeStyle = '#8a4ae8'; c.lineWidth = 4; c.stroke(); });
        // hlava (plášť)
        E(c, -1, -12, 11, 11.5, -0.3); K.fill(c, K.rg(c, 0, -10, 1, 13, [[0, '#d8acff'], [0.5, '#9a5aff'], [1, '#4a1e9a']], -4, -17), 1.4);
        c.fillStyle = 'rgba(80,20,150,.45)'; E(c, -8, -12, 1.8, 1.3, 0.4); c.fill(); E(c, -6, -6, 1.3, 1); c.fill(); E(c, -9.5, -7.5, 1, 0.8); c.fill();
        K.gloss(c, -5, -18, 3.4, 1.6, -0.6, 0.45);
        // páska přes oko + oko
        c.beginPath(); c.moveTo(-11, -14); c.quadraticCurveTo(-2, -10, 11, -17.5); K.stroke(c, '#16121c', 1.1);
        E(c, -1, -9, 3.2, 3); K.fill(c, '#16121c', 1); K.gloss(c, -2, -10.2, 1.2, 0.6, -0.4, 0.4);
        if (act) { K.eye(c, 7, -9, 3.5, '#ffb43a', 0.6, 0); lid(c, 7, -9, 3.5, 0.38, -0.3, '#a868f8'); E(c, 9.5, -2.6, 2.2, 2); K.fill(c, '#2a0a40', 1.1); E(c, 4.2, -4, 2.4, 1.8); c.fillStyle = 'rgba(255,120,200,.5)'; c.fill(); }
        else {
          K.eye(c, 7, -9, 3.5, '#ffb43a', 0.5, blk(t, 4.1, 0.5));
          c.beginPath(); c.moveTo(3, -3.4); c.quadraticCurveTo(7, -0.8, 10.5, -4.4); K.stroke(c, OUT, 1.2); c.fillStyle = '#ffd24a'; c.fillRect(6.4, -2.6, 1.3, 1.2);
          K.blush(c, 10.5, -5.5, 1.6);
        }
        // pirátský klobouk
        c.save(); c.translate(0, -22); c.rotate(0.12); c.scale(1.12, 1.12);
        taper(c, curl(-5, -3, PI + 0.5, 9, 0.5, 4, sin(t * 3) * 0.03), 2.6, 0.5); K.fill(c, '#d8243a', 0.9);
        c.beginPath(); c.moveTo(-7, 2); c.bezierCurveTo(-7, -7, 7, -7, 7, 2); c.closePath(); K.fill(c, K.lg(c, 0, -5, 0, 2, ['#3a3044', '#18121e']), 1.2);
        c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(0, 9, 15, -3); c.quadraticCurveTo(9, 3, 0, 2.5); c.quadraticCurveTo(-8, 3, -14, -2); c.closePath(); K.fill(c, '#2e2436', 1.2);
        c.beginPath(); c.moveTo(-13.4, -1.6); c.quadraticCurveTo(-8, 3, 0, 2.5); c.quadraticCurveTo(9, 3, 14.4, -2.6); K.stroke(c, '#f0c24a', 0.9);
        E(c, 0.5, -2.2, 1.9, 1.7); c.fillStyle = '#f4f0e6'; c.fill(); c.fillRect(-0.4, -1.2, 1.8, 1.3); c.fillStyle = '#221a2a'; E(c, -0.2, -2.3, 0.5, 0.55); c.fill(); E(c, 1.2, -2.3, 0.5, 0.55); c.fill();
        c.restore();
        // voda (zbarví spodek)
        const wv = t * 3;
        c.beginPath(); c.moveTo(-22, 1 + sin(wv) * 1.2); for (let i = 1; i <= 8; i++) c.lineTo(-22 + i * 5.5, 1 + sin(wv + i * 0.9) * 1.2); c.lineTo(22, 12); c.lineTo(-22, 12); c.closePath();
        c.fillStyle = act ? K.lg(c, 0, 0, 0, 10, ['rgba(90,40,150,.6)', 'rgba(30,10,60,.85)']) : K.lg(c, 0, 0, 0, 10, ['rgba(110,215,240,.5)', 'rgba(30,110,190,.75)']); c.fill();
        c.beginPath(); c.moveTo(-22, 1 + sin(wv) * 1.2); for (let i = 1; i <= 8; i++) c.lineTo(-22 + i * 5.5, 1 + sin(wv + i * 0.9) * 1.2); K.stroke(c, 'rgba(220,250,255,.8)', 0.8);
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.6;
        for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i / 5) % 1, r = 0.7 + (i % 2) * 0.6; c.beginPath(); c.arc(-12 + i * 6 + sin(t * 3 + i) * 1.5, 9 - ph * 36, r, 0, TAU); c.stroke(); }
        c.restore();
        // sklo: obrys, odlesky, duhový lesk
        E(c, 0, -11, 21, 21); c.lineWidth = 1.5; c.strokeStyle = '#1e3a5a'; c.stroke();
        c.lineCap = 'round';
        c.beginPath(); c.arc(0, -11, 17, PI * 1.08, PI * 1.42); K.stroke(c, 'rgba(255,255,255,.85)', 2.4);
        K.gloss(c, -2, -28.4, 1.6, 1, 0, 0.8);
        c.beginPath(); c.arc(0, -11, 19.3, 0.15, 1.25); K.stroke(c, 'rgba(255,255,255,.55)', 1.2);
        c.beginPath(); c.arc(0, -11, 19, -1.25, -0.35); K.stroke(c, 'rgba(255,140,230,.5)', 1.3); c.beginPath(); c.arc(0, -11, 17.6, -1.2, -0.4); K.stroke(c, 'rgba(110,255,220,.45)', 1);
        // mosazný límec + tryska
        c.beginPath(); c.rect(11, 7, 6.5, 3.4); K.fill(c, K.lg(c, 0, 7, 0, 10.4, ['#ffe08a', '#8a5a14']), 1); E(c, 18, 8.7, 1.3, 2.1); K.fill(c, '#3a2410', 1);
        E(c, 0, 11, 11.5, 3.2); K.fill(c, K.lg(c, -13, 0, 13, 0, ['#5a3a12', '#a8782a', '#5a3a12']), 1.3);
        E(c, 0, 8.8, 12.5, 3.4); K.fill(c, K.lg(c, -13, 6, 13, 10, [[0, '#8a5a1a'], [0.35, '#ffe28a'], [0.6, '#d8a038'], [1, '#6a4416']]), 1.3);
        c.fillStyle = '#5a3a12'; for (let k = 0; k < 5; k++) { const x = -8 + k * 4; E(c, x, 8.8 + Math.sqrt(1 - (x / 12.5) * (x / 12.5)) * 2.1, 0.65, 0.65); c.fill(); }
        // INKOUST
        if (act) {
          c.beginPath(); c.moveTo(17.5, 7); c.quadraticCurveTo(26, 2.5, 37, 5); c.quadraticCurveTo(27, 9, 17.5, 10.4); c.closePath(); K.fill(c, '#3a1a5c', 1);
          for (let i = 0; i < 6; i++) { const ph = (t * 2.4 + i / 6) % 1, x = 22 + ph * 20, y = 6 - sin(ph * PI) * 6 + (i % 2 ? 3 : -2), r = 1.4 + ph * 3.4; E(c, x, y, r, r * 0.85); K.fill(c, '#2e1248', 0.9); K.gloss(c, x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.2, 0, 0.5); }
        }
        c.restore();
      },

      /* ---------------- HRABĚ NETOPÝR ---------------- */
      netopyr(c, t, act) {
        const bob = sin(t * 2.4) * 1.8, flap = act ? 0.55 + sin(t * 14) * 0.1 : 0.15 + sin(t * 5) * 0.22;
        c.save(); c.translate(0, bob - 2);
        const wing = (s, dark) => {
          c.save(); c.translate(s * 4, -3); c.scale(s, 1); c.rotate(-flap);
          c.beginPath(); c.moveTo(0, 0); c.lineTo(16, -17); c.lineTo(31, -21); c.quadraticCurveTo(27, -14, 34, -6); c.quadraticCurveTo(25, -2, 27, 5); c.quadraticCurveTo(16, 2, 16, 9); c.quadraticCurveTo(9, 3, 3, 8); c.closePath();
          K.fill(c, K.lg(c, 0, -20, 22, 10, dark ? ['#4a1e5e', '#1e0a2a'] : ['#8a46ac', '#3a124e']), 1.4);
          c.beginPath(); c.moveTo(16, -17); c.lineTo(30, -19.5); c.moveTo(16, -17); c.lineTo(32.5, -6.5); c.moveTo(16, -17); c.lineTo(26, 3.5); c.moveTo(16, -17); c.lineTo(15.5, 7.5); K.stroke(c, dark ? '#6a3a7a' : '#b884d4', 0.8);
          c.beginPath(); c.moveTo(15, -17); c.lineTo(14, -21.5); c.lineTo(17.5, -18); c.closePath(); c.fillStyle = '#e8dcf0'; c.fill();
          c.restore();
        };
        wing(-1, true); wing(1, false);
        // plášť
        const hm = t * 3;
        c.beginPath(); c.moveTo(-6, -5); c.quadraticCurveTo(-14, 6, -15, 20 + sin(hm) * 1.2); c.lineTo(-10, 18 + sin(hm + 1)); c.lineTo(-5, 21 + sin(hm + 2)); c.lineTo(0, 18 + sin(hm + 3)); c.lineTo(5, 21 + sin(hm + 4)); c.lineTo(10, 18); c.quadraticCurveTo(12, 4, 8, -5); c.closePath();
        K.fill(c, K.lg(c, -14, 0, 10, 0, ['#2a1036', '#120818']), 1.4);
        c.beginPath(); c.moveTo(-6, -5); c.quadraticCurveTo(-13, 6, -15, 20 + sin(hm) * 1.2); c.lineTo(-12, 19); c.quadraticCurveTo(-11, 6, -6, -5); c.fillStyle = '#b0142e'; c.fill();
        // vysoký límec
        c.beginPath(); c.moveTo(-4, -5); c.lineTo(-16, -29); c.quadraticCurveTo(-10, -24, -4, -22); c.lineTo(-2, -10); c.closePath(); K.fill(c, K.lg(c, -16, -28, -3, -6, ['#ff3a56', '#7a0a20']), 1.3);
        c.beginPath(); c.moveTo(8, -5); c.lineTo(19, -28); c.quadraticCurveTo(13, -24, 8, -22); c.lineTo(6, -10); c.closePath(); K.fill(c, K.lg(c, 19, -28, 6, -6, ['#e8284a', '#6a0818']), 1.3);
        // šosy fraku
        c.beginPath(); c.moveTo(-6, 6); c.lineTo(-10, 19); c.lineTo(-5, 16); c.lineTo(-2, 19.5); c.lineTo(1, 8); c.closePath(); K.fill(c, '#1a1222', 1.2);
        // nožky
        c.fillStyle = '#3a2a40'; [[0, 13.5], [5.5, 13]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x - 1.5, y - 1); c.lineTo(x - 1.8, y + 2.4); c.lineTo(x - 0.4, y + 1.2); c.lineTo(x + 0.4, y + 2.8); c.lineTo(x + 1.2, y + 1.2); c.lineTo(x + 2, y + 2.4); c.lineTo(x + 1.6, y - 1); c.closePath(); K.fill(c, '#3a2a40', 0.8); });
        // frak
        c.beginPath(); c.moveTo(-7, -4); c.quadraticCurveTo(-10, 6, -6, 11); c.quadraticCurveTo(2, 14, 10, 10); c.quadraticCurveTo(12, 2, 9, -4); c.closePath(); K.fill(c, K.lg(c, -8, 0, 10, 0, ['#14101c', '#3e3250', '#1a1424']), 1.4);
        c.beginPath(); c.moveTo(-1, -4); c.lineTo(7.5, -4); c.lineTo(3.5, 7); c.closePath(); c.fillStyle = '#f4f0ff'; c.fill();
        c.fillStyle = '#7a3aa0'; c.beginPath(); c.moveTo(-2.4, -4); c.lineTo(3.5, 7); c.lineTo(-1.5, 3); c.closePath(); c.fill(); c.beginPath(); c.moveTo(8.6, -4); c.lineTo(3.5, 7); c.lineTo(8.4, 3); c.closePath(); c.fill();
        c.fillStyle = '#e0c06a'; E(c, 7, 7.6, 0.7, 0.7); c.fill(); E(c, 7.5, 10, 0.7, 0.7); c.fill();
        // motýlek s rubínem
        c.beginPath(); c.moveTo(3.5, -2.4); c.lineTo(-0.6, -4.6); c.lineTo(-0.6, -0.2); c.closePath(); c.moveTo(3.5, -2.4); c.lineTo(7.6, -4.6); c.lineTo(7.6, -0.2); c.closePath(); K.fill(c, '#c8183a', 0.8);
        E(c, 3.5, -2.4, 1.3, 1.3); K.fill(c, '#ff4a66', 0.7); K.gloss(c, 3.1, -2.9, 0.5, 0.4, 0, 0.9); K.glow(c, 3.5, -2.4, 4, '#ff3050', 0.5);
        // hlava
        const fur = K.rg(c, 2, -14, 2, 13, ['#8a5a9a', '#5a2e6a', '#2e1238'], -1, -19);
        [[-5, -21, -0.38], [9.5, -22, 0.3]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.moveTo(-4.6, 3); c.quadraticCurveTo(-3, -8, 0, -13.5); c.quadraticCurveTo(3, -8, 4.6, 3); c.closePath(); K.fill(c, fur, 1.4); c.beginPath(); c.moveTo(-2.4, 2); c.quadraticCurveTo(-1.5, -6, 0, -9.5); c.quadraticCurveTo(1.5, -6, 2.4, 2); c.closePath(); c.fillStyle = '#d88aa8'; c.fill(); c.restore(); });
        c.beginPath(); c.moveTo(-8.6, -9); c.lineTo(-10.6, -6.5); c.lineTo(-7, -6.4); c.moveTo(12.6, -9); c.lineTo(14.6, -6.5); c.lineTo(11, -6.4); c.fillStyle = '#5a2e6a'; c.fill();
        E(c, 2, -14, 10.5, 10); K.fill(c, fur, 1.4);
        c.beginPath(); c.moveTo(-8.4, -17.5); c.quadraticCurveTo(2, -28.5, 12.4, -18); c.lineTo(9, -17.6); c.lineTo(4, -14.6); c.lineTo(1.5, -17.6); c.lineTo(-5.5, -16.6); c.closePath(); c.fillStyle = '#1e1028'; c.fill();
        c.beginPath(); c.moveTo(-3, -21.5); c.quadraticCurveTo(2, -25, 8, -22.5); K.stroke(c, 'rgba(200,170,230,.45)', 0.8);
        E(c, 5, -9.5, 6.4, 4.4); c.fillStyle = '#c49ac8'; c.fill();
        const iris = act ? '#ff2a3a' : '#d81a3a';
        K.eye(c, -0.5, -14.6, 3.1, iris, 0.5, act ? 0 : blk(t, 4.4, 2)); K.eye(c, 8, -14.6, 3.1, iris, 0.5, act ? 0 : blk(t, 4.4, 2));
        lid(c, -0.5, -14.6, 3.1, act ? 0.36 : 0.3, act ? 0.4 : 0.12, '#6a3a7a'); lid(c, 8, -14.6, 3.1, act ? 0.36 : 0.3, act ? -0.4 : -0.12, '#6a3a7a');
        if (act) { K.glow(c, -0.5, -14, 6, '#ff2040', 0.7); K.glow(c, 8, -14, 6, '#ff2040', 0.7); }
        // monokl
        c.beginPath(); c.arc(8, -14.6, 4.6, 0, TAU); c.fillStyle = 'rgba(220,240,255,.18)'; c.fill(); c.lineWidth = 1.1; c.strokeStyle = '#e0c060'; c.stroke();
        c.beginPath(); c.arc(8, -14.6, 3.6, PI * 1.1, PI * 1.5); K.stroke(c, 'rgba(255,255,255,.8)', 0.7);
        c.beginPath(); c.moveTo(11.5, -11.6); c.quadraticCurveTo(13, -4, 8.2, 1.5); c.setLineDash([0.8, 0.7]); K.stroke(c, '#e0c060', 0.6); c.setLineDash([]);
        E(c, 5.4, -11.2, 1.9, 1.2); c.fillStyle = '#5a2a4a'; c.fill();
        if (act) { E(c, 5.4, -6.6, 3.2, 2.5); K.fill(c, '#5a0a1e', 1.1); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(3, -8.6); c.lineTo(3.8, -5.4); c.lineTo(4.6, -8.6); c.moveTo(6.2, -8.6); c.lineTo(7, -5.4); c.lineTo(7.8, -8.6); c.fill(); }
        else { c.beginPath(); c.moveTo(1.8, -7.6); c.quadraticCurveTo(5.5, -5.4, 9.5, -8.2); K.stroke(c, OUT, 1.1); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(3.2, -7); c.lineTo(3.9, -4.9); c.lineTo(4.6, -6.7); c.moveTo(6.5, -6.6); c.lineTo(7.2, -4.7); c.lineTo(7.8, -6.9); c.fill(); }
        // ruka: pohár / sání života
        if (act) {
          c.beginPath(); c.moveTo(8, -1); c.lineTo(17, -4); K.stroke(c, OUT, 4.6); c.beginPath(); c.moveTo(8, -1); c.lineTo(17, -4); K.stroke(c, '#2e2440', 2.8);
          c.beginPath(); c.moveTo(17.5, -4); c.lineTo(21, -7); c.moveTo(17.8, -4); c.lineTo(21.6, -4); c.moveTo(17.5, -4); c.lineTo(21, -1.4); K.stroke(c, '#c8a8d8', 1.1);
          const p0 = [44, 8], p1 = [33, -15], p2 = [27, 6], p3 = [20, -4];
          c.beginPath(); c.moveTo(44, 8); c.bezierCurveTo(33, -15, 27, 6, 20, -4); c.strokeStyle = 'rgba(200,10,40,.5)'; c.lineWidth = 6; c.lineCap = 'round'; c.stroke(); c.strokeStyle = '#ff4a5e'; c.lineWidth = 1.5; c.stroke();
          for (let i = 0; i < 6; i++) { const u = (t * 1.6 + i / 6) % 1, p = bz(p0, p1, p2, p3, u), r = 1.2 + sin(u * PI) * 0.9; E(c, p[0], p[1], r, r); K.fill(c, '#e8102e', 0.6, '#5a0010'); K.gloss(c, p[0] - r * 0.3, p[1] - r * 0.35, r * 0.35, r * 0.25, 0, 0.8); }
          K.glow(c, 20, -4, 8, '#ff3050', 0.75);
        } else {
          c.save(); c.translate(14, -1 + sin(t * 2.4 + 1) * 0.6);
          c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1, 2); K.stroke(c, OUT, 4.4); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1, 2); K.stroke(c, '#2e2440', 2.6);
          c.beginPath(); c.moveTo(-0.6, 4); c.lineTo(-0.6, 1); c.lineTo(0.6, 1); c.lineTo(0.6, 4); c.moveTo(-2.4, 4.6); c.lineTo(2.4, 4.6); K.stroke(c, '#c8ccd8', 1);
          c.beginPath(); c.moveTo(-3.2, -5); c.lineTo(3.2, -5); c.quadraticCurveTo(3, 1.4, 0, 1.4); c.quadraticCurveTo(-3, 1.4, -3.2, -5); c.closePath(); K.fill(c, K.lg(c, -3, 0, 3, 0, ['#f0f4ff', '#8a90a8']), 1);
          c.beginPath(); c.moveTo(-2.8, -3.4); c.lineTo(2.8, -3.4); c.quadraticCurveTo(2.5, 0.8, 0, 0.8); c.quadraticCurveTo(-2.5, 0.8, -2.8, -3.4); c.fillStyle = '#b0102a'; c.fill();
          E(c, -1, 1.5, 1.6, 1.3); K.fill(c, '#7a5a8a', 0.8);
          c.restore();
        }
        c.restore();
      },

      /* ---------------- NEBESKÁ MEDÚZA ---------------- */
      meduza(c, t, act) {
        const ph = act ? 0.5 + 0.5 * sin(t * 16) : 0.5 + 0.5 * sin(t * 2.6), sq = 1 - ph * (act ? 0.18 : 0.07), wd = 1 + ph * (act ? 0.1 : 0.04);
        c.save(); c.translate(0, sin(t * 2.6 - 1.2) * 1.6 - 1);
        // chapadla
        const TT = [];
        for (let i = 0; i < 6; i++) { const x0 = -12.5 + i * 5, s = t * 2.2 + i * 1.1; TT.push([[x0, -4], [x0 + sin(s) * 2.4, 3], [x0 - 2 + sin(s + 1) * 3.6, 11], [x0 - 4 + sin(s + 2) * 4.2, 18], [x0 - 6 + sin(s + 3) * 4, 25 - (i % 2) * 3]]); }
        TT.forEach(P => { c.beginPath(); smooth(c, P); c.lineCap = 'round'; c.strokeStyle = 'rgba(20,70,110,.85)'; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = '#9af6ff'; c.lineWidth = 1.2; c.stroke(); });
        TT.forEach((P, i) => { const b = 0.5 + 0.5 * sin(t * 4 - i); K.glow(c, P[4][0], P[4][1], 4, '#9affff', 0.4 + b * 0.5); E(c, P[4][0], P[4][1], 1, 1); c.fillStyle = '#e8ffff'; c.fill(); E(c, P[2][0], P[2][1], 0.8, 0.8); c.fill(); });
        // ústní ramena
        for (let i = 0; i < 3; i++) { const x0 = -5 + i * 5, P = []; for (let k = 0; k < 6; k++) P.push([x0 + sin(t * 2.4 + k * 0.9 + i) * (1 + k * 0.5) - k * 0.6, -4 + k * 3.3]); taper(c, P, 4.2, 1.4); K.fill(c, 'rgba(255,150,230,.78)', 1, '#7a2a8a'); }
        // zvon
        const BW = 21 * wd, rimY = -4, top = rimY - 36 * sq;
        const bell = () => { c.moveTo(-BW, rimY); c.bezierCurveTo(-BW, top, BW, top, BW, rimY); const st = 2 * BW / 6; for (let k = 0; k < 6; k++) c.quadraticCurveTo(BW - (k + 0.5) * st, rimY + 4.6 + sin(t * 4 + k) * 0.8, BW - (k + 1) * st, rimY); c.closePath(); };
        c.beginPath(); bell(); K.fill(c, K.rg(c, -4, -20, 2, 28, [[0, 'rgba(245,255,255,.97)'], [0.45, 'rgba(150,240,255,.92)'], [1, 'rgba(46,150,214,.92)']]), 1.5, '#12486a');
        c.save(); c.beginPath(); bell(); c.clip();
        E(c, 0, -1, BW * 0.82, 8); c.fillStyle = 'rgba(30,110,190,.28)'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 0.9;
        for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 2.6, top + 8); c.quadraticCurveTo(k * 11 * wd, -18, k * 8.4 * wd, -3); c.stroke(); }
        const cy = -20 * sq - 2, gl = 0.55 + ph * 0.4;
        E(c, 0, cy, 11, 9); c.fillStyle = K.rg(c, 0, cy, 0, 11, [[0, `rgba(255,244,180,${0.7 + gl * 0.3})`], [0.45, `rgba(255,205,120,${0.35 + gl * 0.3})`], [1, 'rgba(255,190,120,0)']]); c.fill(); K.glow(c, 0, cy, 16, '#ffe6a0', act ? 1 : gl * 0.7);
        c.fillStyle = '#ff9a7a'; for (let k = 0; k < 4; k++) { const a = k * PI / 2 + t * 0.4; E(c, sin(a) * 2.2, cy - cos(a) * 1.4, 1.4, 1.1, a); c.fill(); }
        E(c, 0, cy, 1.5, 1.5); c.fillStyle = '#fffbe0'; c.fill();
        c.restore();
        K.gloss(c, -10, -23, 4.5, 2.2, -0.8, 0.75); K.gloss(c, -14.5, -15, 1.3, 2.4, -0.3, 0.5);
        c.beginPath(); c.moveTo(BW - 2, rimY - 3); c.bezierCurveTo(BW - 1, top + 10, BW * 0.5, top + 3, 4, top + 9.5); K.stroke(c, 'rgba(255,255,255,.55)', 1);
        // obličej
        if (act) {
          K.eye(c, -3.5, -11, 3.1, '#2a7aff', 0.4, 0); K.eye(c, 6, -11, 3.1, '#2a7aff', 0.4, 0);
          E(c, 1.5, -5.6, 2, 2.2); K.fill(c, '#1a3a6a', 1.1);
        } else {
          const b = blk(t, 3.9, 2.5);
          K.eye(c, -3.5, -11, 3.1, '#2a7aff', 0.4, b); K.eye(c, 6, -11, 3.1, '#2a7aff', 0.4, b);
          c.beginPath(); c.moveTo(-0.5, -6.6); c.quadraticCurveTo(1.5, -4.2, 3.5, -6.6); K.stroke(c, OUT, 1.2);
          K.blush(c, -7.5, -6.8, 2); K.blush(c, 10, -6.8, 2);
        }
        // poletující světélka
        for (let i = 0; i < 4; i++) { const p = (t * 0.35 + i / 4) % 1, x = -22 + i * 14 + sin(t * 1.5 + i * 2) * 3, y = 12 - p * 44; c.globalAlpha = sin(p * PI) * 0.9; K.sparkle(c, x, y, 1.6 + (i % 2), '#e8ffff'); }
        c.globalAlpha = 1;
        // ELEKTRICKÝ PULZ
        if (act) {
          const s = flo(t * 24);
          bolt(c, -10, -3, -15, 23, s, 5, 2.2, '#7af0ff', 1); bolt(c, 5, -3, 3, 24, s + 3, 5, 2.2, '#7af0ff', 1); bolt(c, -2, -2, 13, 21, s + 6, 4, 2, '#c8ffff', 0.8);
          for (let k = 0; k < 3; k++) { const p = (t * 2 + k / 3) % 1; E(c, 0, 20 + p * 6, 8 + p * 26, 2.4 + p * 6); c.strokeStyle = `rgba(150,250,255,${(1 - p) * 0.95})`; c.lineWidth = 2.2 * (1 - p) + 0.4; c.stroke(); }
          K.glow(c, 0, -14, 26, '#bff8ff', 0.5);
        }
        c.restore();
      },

      /* ---------------- KRYSTALOVÝ GOLEMÍK ---------------- */
      gemik(c, t, act) {
        const bob = act ? 0 : abs(sin(t * 2.2)) * -1.2;
        const prism = (x, y, ang, len, w, col, gl) => {
          c.save(); c.translate(x, y); c.rotate(ang + PI / 2);
          c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -len * 0.72); c.lineTo(0, -len); c.lineTo(w / 2, -len * 0.72); c.lineTo(w / 2, 0); c.closePath(); K.fill(c, col, 1.2);
          c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -len); c.lineTo(w / 2, -len * 0.72); c.lineTo(w / 2, 0); c.closePath(); c.fillStyle = 'rgba(40,0,60,.28)'; c.fill();
          c.beginPath(); c.moveTo(-w / 2 + 0.9, -1); c.lineTo(-w / 2 + 0.9, -len * 0.7); K.stroke(c, 'rgba(255,255,255,.75)', 0.7);
          if (gl) K.glow(c, 0, -len * 0.6, len * 0.6, col, gl);
          c.restore();
        };
        // nožky
        const rock = K.lg(c, 0, -10, 0, 24, ['#a898c0', '#6a5a82', '#3e3252']);
        c.save(); c.translate(0, bob);
        E(c, -7, 20.5 - bob, 5.2, 4.2); K.fill(c, rock, 1.4); E(c, 7.5, 20.5 - bob, 5.2, 4.2); K.fill(c, rock, 1.4);
        prism(-10, 22 - bob, -2.2, 4, 2.6, '#7af0ff'); prism(11.5, 22 - bob, -0.8, 4, 2.6, '#ff8ae0');
        // krystaly na zádech
        const ga = act ? 0.6 + 0.3 * sin(t * 20) : 0;
        prism(-10, -2, -2.85, 14, 5, '#ff8ae0', ga); prism(-9, -5, -2.35, 20, 6, '#7af0ff', ga); prism(-5, -8, -2.0, 15, 5, '#b48aff', ga); prism(-12, 4, -3.1, 9, 4, '#7af0ff', ga);
        // zadní ruka
        E(c, -15, 3, 4, 5.6, 0.3); K.fill(c, rock, 1.4); prism(-17, 7, 2.3, 5, 3, '#b48aff');
        // tělo
        const bd = () => { c.beginPath(); c.moveTo(-12, -9); c.quadraticCurveTo(0, -12.5, 12, -9.5); c.quadraticCurveTo(17.5, -2, 15.5, 6); c.quadraticCurveTo(13.5, 16, 4, 16.5); c.lineTo(-5, 16.5); c.quadraticCurveTo(-15.5, 15, -15.5, 5); c.quadraticCurveTo(-16, -4, -12, -9); c.closePath(); };
        bd(); K.fill(c, K.rg(c, 0, 4, 2, 18, ['#b8a8d0', '#7a6a96', '#3e3252'], -6, -4), 1.5);
        c.save(); bd(); c.clip();
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-12, -9); c.lineTo(-1, -11); c.lineTo(-5, -2); c.lineTo(-16, 3); c.closePath(); c.fill();
        c.fillStyle = 'rgba(20,0,40,.22)'; c.beginPath(); c.moveTo(17, 0); c.lineTo(14, 17); c.lineTo(4, 17); c.lineTo(9, 6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-5, -2); c.lineTo(-7, 8); c.lineTo(-3, 16); c.moveTo(9, 6); c.lineTo(12, -9); K.stroke(c, 'rgba(30,20,50,.4)', 0.8);
        c.restore();
        // zarostlé krystalky v kameni
        [[10, 12, -0.7, 6, 3, '#7af0ff'], [12.5, 11, 0.1, 5, 2.6, '#ff8ae0'], [-11, 13, -2.6, 5, 2.6, '#b48aff']].forEach(q => prism(q[0], q[1], q[2], q[3], q[4], q[5]));
        // srdce – rudý drahokam
        const hp = 0.5 + 0.5 * sin(t * 3.2);
        K.glow(c, 1.5, 4, 9, '#ff3a8a', act ? 0.9 : 0.35 + hp * 0.35);
        c.beginPath(); c.moveTo(1.5, -1); c.lineTo(6, 3); c.lineTo(1.5, 9.5); c.lineTo(-3, 3); c.closePath(); K.fill(c, K.lg(c, -3, -1, 6, 9, ['#ffb0d0', '#ff2a6a', '#8a0a3a']), 1.1);
        c.beginPath(); c.moveTo(-3, 3); c.lineTo(6, 3); c.moveTo(1.5, -1); c.lineTo(1.5, 9.5); K.stroke(c, 'rgba(255,255,255,.45)', 0.5);
        // hlava – broušený drahokam
        const HP = [[-6, -34], [8, -34], [15, -26], [15, -19], [10, -10], [-9, -10], [-14, -19], [-14, -26]];
        c.beginPath(); HP.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); K.fill(c, K.lg(c, -14, -34, 15, -10, ['#ffe4f8', '#ff8ae0', '#c23aa8']), 1.5);
        const poly = (pts, col) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = col; c.fill(); };
        poly([[-6, -34], [8, -34], [5, -29], [-3, -29]], 'rgba(255,255,255,.45)');
        poly([[-6, -34], [-3, -29], [-14, -26]], 'rgba(255,255,255,.25)');
        poly([[8, -34], [15, -26], [5, -29]], 'rgba(120,0,90,.2)');
        poly([[15, -26], [15, -19], [10, -10], [11, -22]], 'rgba(110,0,90,.25)');
        poly([[-14, -26], [-14, -19], [-9, -10], [-11, -22]], 'rgba(255,255,255,.18)');
        c.beginPath(); c.moveTo(-3, -29); c.lineTo(5, -29); c.lineTo(15, -26); c.moveTo(-3, -29); c.lineTo(-14, -26); c.moveTo(-11, -22); c.lineTo(11, -22); K.stroke(c, 'rgba(255,255,255,.5)', 0.6);
        // obličej
        const b = act ? 0 : blk(t, 3.5, 0.8);
        K.eye(c, 0, -18.5, 3.2, '#8a1a9a', 0.5, b); K.eye(c, 8.6, -18.5, 3.2, '#8a1a9a', 0.5, b);
        if (act) { lid(c, 0, -18.5, 3.2, 0.3, 0.35, '#ff9ae6'); lid(c, 8.6, -18.5, 3.2, 0.3, -0.35, '#ff9ae6'); E(c, 4.6, -12.6, 2.4, 1.7); K.fill(c, '#5a0a3a', 1); }
        else { c.beginPath(); c.moveTo(2.2, -13.8); c.quadraticCurveTo(4.6, -10.6, 7, -13.8); c.closePath(); K.fill(c, '#7a1250', 1); K.blush(c, -3.5, -14, 1.8); K.blush(c, 12.4, -14, 1.6); }
        // přední ruka s mincí
        if (act) { E(c, 16, -4, 4, 3.4, -0.4); K.fill(c, rock, 1.4); prism(18, -6, -0.4, 6, 3.2, '#7af0ff', 0.5); }
        else {
          const ca = sin(t * 2.2) * 0.1;
          E(c, 15.5, 1, 3.8, 5.2, -0.3 + ca); K.fill(c, rock, 1.4);
          const cw = 3.4 * (0.75 + 0.25 * cos(t * 3));
          E(c, 18, -6.5, cw, 3.4); K.fill(c, K.lg(c, 15, -10, 21, -3, ['#fff2a0', '#ffc23a', '#c07a10']), 1.1); E(c, 18, -6.5, cw * 0.6, 2); K.stroke(c, 'rgba(160,90,10,.6)', 0.6);
          E(c, 17.5, -3.6, 3.2, 2.6); K.fill(c, rock, 1.2);
        }
        // jiskry
        [[-8, -31, 0], [13, -23, 1.7], [-1, 5, 3.1], [-14, -12, 4.2]].forEach(([x, y, o]) => { const a = max(0, sin(t * 2.4 + o)); if (a > 0.05) { c.globalAlpha = a; K.sparkle(c, x, y, 1.2 + a * 1.6, '#ffffff'); } });
        c.globalAlpha = 1;
        c.restore();
        // ÚLOMKY + mince
        if (act) {
          for (let i = 0; i < 4; i++) { const p = (t * 3 + i / 4) % 1, x = 22 + p * 22, y = -8 + (i - 1.5) * 4.5 + p * (i - 1.5) * 3, col = ['#7af0ff', '#ff8ae0', '#b48aff', '#ffffff'][i];
            c.globalAlpha = 1 - p * 0.5; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x - 14 * (0.4 + p), y); K.stroke(c, 'rgba(255,255,255,.6)', 1.2);
            c.beginPath(); c.moveTo(x + 5, y); c.lineTo(x, y - 1.8); c.lineTo(x - 4, y); c.lineTo(x, y + 1.8); c.closePath(); K.fill(c, col, 0.9); }
          c.globalAlpha = 1;
          for (let i = 0; i < 3; i++) { const p = (t * 1.6 + i / 3) % 1, x = -10 - p * 18 - i * 2, y = 0 - sin(p * PI) * 12 + p * 20, w = 2.8 * abs(cos(t * 9 + i)) + 0.4; E(c, x, y, w, 2.8); K.fill(c, '#ffd23a', 0.9); }
        }
      },

      /* ---------------- BOUŘNÝ PEGAS ---------------- */
      pegas(c, t, act) {
        const bob = act ? 0 : sin(t * 2) * 2, fl = act ? -0.75 : sin(t * 4.5);
        c.save(); c.translate(act ? 3 : 0, bob - 1); if (act) c.rotate(0.1);
        if (act) {
          const s = flo(t * 20);
          c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineCap = 'round';
          for (let i = 0; i < 4; i++) { const y = -10 + i * 6, p = (t * 4 + i * 0.3) % 1; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-22 - p * 8, y); c.lineTo(-36 - p * 8, y); c.stroke(); }
          bolt(c, -15, 2, -40, -6, s, 5, 3, '#7ae0ff', 1.4); bolt(c, -14, 8, -40, 12, s + 9, 5, 3, '#7ae0ff', 1.1);
        }
        cloudWing(c, 1, -6, fl, true, t, act);
        // ocas – elektrické prameny
        const tw = sin(t * 3) * 0.12;
        [[0.3, 16, '#4a9ae8'], [0.05, 18, '#7ac8ff'], [0.55, 13, '#bfeaff']].forEach(([a, l, col], i) => { taper(c, curl(-16, -2, PI - 0.4 + a + tw * (i + 1), l, -0.45 + i * 0.1, 6, 0), 5, 0.6); K.fill(c, col, 1.1, '#1a3a6a'); });
        // nohy
        const W = '#f2f8ff', WF = '#c8d8ec', HF = '#6a8ac0';
        const sw = sin(t * 4) * 0.15;
        let L;
        if (act) L = [[-14, 5, 1.1, 1.4, WF], [5, 6, -1.25, -0.9, WF], [-10, 6, 0.9, 1.2, W], [9, 6, -1.1, -1.4, W]];
        else L = [[-14, 5, 0.4, -0.1, WF], [5, 6, -0.3 - sw, 0.7, WF], [-10, 6, 0.25, -0.25 + sw, W], [9, 6, -0.6 + sw, 1.0, W]];
        const feet = L.map(l => leg(c, l[0], l[1], l[2], l[3], l[4], HF, 4.2));
        // ucho vzadu
        c.beginPath(); c.moveTo(10.5, -23); c.lineTo(11, -31.5); c.lineTo(15, -24.5); c.closePath(); K.fill(c, W, 1.2); c.beginPath(); c.moveTo(11.6, -24); c.lineTo(11.8, -29); c.lineTo(14, -24.8); c.fillStyle = '#ffb0c8'; c.fill();
        // tělo
        merged(c, () => horseBuild(c), K.lg(c, 0, -26, 0, 12, ['#ffffff', '#e4f0ff', '#a8c0e0']), 1.4);
        c.save(); c.beginPath(); horseBuild(c); c.clip();
        E(c, -4, 10.5, 15, 4); c.fillStyle = 'rgba(80,110,170,.25)'; c.fill();
        K.gloss(c, -6, -4.5, 8, 1.8, -0.08, 0.6);
        c.beginPath(); c.moveTo(-10, -3); c.lineTo(-14, 2); c.lineTo(-11.5, 2); c.lineTo(-14.5, 7); c.lineTo(-9, 0.5); c.lineTo(-11.5, 0.5); c.closePath(); K.fill(c, '#6ac0ff', 0.6, '#2a6ab0');
        c.restore();
        // hříva – elektrické plameny
        const mG = K.lg(c, 12, -16, -2, -26, ['#4aa8ff', '#c8f4ff']);
        for (let i = 0; i < 6; i++) { const k = i / 5, x = 12 - k * 9, y = -25 + k * 18, f = sin(t * 9 + i * 1.7);
          taper(c, curl(x, y, -2.4 + k * 0.5 + f * 0.08, 7 + (1 - k) * 2 + f, -0.35, 4, 0), 3.8, 0.3); K.fill(c, mG, 1, '#1a3a6a'); }
        taper(c, curl(14, -25, -1.2 + sin(t * 7) * 0.1, 7, 0.5, 4, 0), 3.4, 0.3); K.fill(c, '#8ad8ff', 1, '#1a3a6a');
        if ((t * 2.3) % 1 < 0.25) bolt(c, 6, -20, -2, -16, flo(t * 2.3), 3, 1.4, '#9af0ff', 0.7);
        // hlava
        if (act) { K.eye(c, 16.5, -20, 3.1, '#2a8aff', 0.6, 0); lid(c, 16.5, -20, 3.1, 0.32, 0.35, '#e4f0ff'); }
        else K.eye(c, 16.5, -20, 3.1, '#2a8aff', 0.55, blk(t, 4.2, 1.5));
        E(c, 25, -13.5, 0.9, 0.6, 0.5); c.fillStyle = OUT; c.fill();
        c.beginPath(); c.moveTo(24.5, -10.3); c.quadraticCurveTo(22.5, act ? -9.5 : -10.6, 20.5, -10.4); K.stroke(c, OUT, 0.9);
        K.blush(c, 20, -13.5, 1.6);
        // kopyta jiskří
        feet.forEach(([x, y], i) => { const a = max(0, sin(t * 6 + i * 1.6)); if (a > 0.3 || act) { c.globalAlpha = act ? 1 : a; K.sparkle(c, x + 1, y + 3, 1.6, '#bff4ff'); } });
        c.globalAlpha = 1;
        cloudWing(c, -3, -4, fl, false, t, act);
        c.restore();
      },

      /* ---------------- LÁVOVÝ GOLEMÍK ---------------- */
      magmik(c, t, act) {
        const st = sin(t * 4), bob = abs(st) * 1.2, pulse = 0.6 + 0.4 * sin(t * 3);
        c.save(); if (act) { c.translate(0, 24); c.rotate(0.14); c.translate(0, -24); }
        const rock = K.lg(c, 0, -22, 0, 22, [[0, '#76493a'], [0.5, '#4a2a26'], [1, '#26161a']]);
        const f1 = max(0, st) * 2.4, f2 = max(0, -st) * 2.4;
        E(c, -8, 22 - f1, 5.6, 3.6); K.fill(c, '#3a2220', 1.4); E(c, 9, 22 - f2, 5.6, 3.6); K.fill(c, '#3a2220', 1.4);
        c.beginPath(); c.moveTo(-11, 22 - f1); c.lineTo(-5, 22.5 - f1); c.moveTo(6, 22.5 - f2); c.lineTo(12, 22 - f2); K.stroke(c, `rgba(255,140,40,${pulse})`, 0.8);
        c.translate(0, -bob);
        // zadní ruka
        E(c, -16.5, 4, 4, 5, 0.4); K.fill(c, '#3e2420', 1.4);
        // tělo-sopka
        const body = () => { c.moveTo(-17, 19); c.quadraticCurveTo(-20, 12, -16, 6); c.quadraticCurveTo(-15, -2, -12, -8); c.quadraticCurveTo(-11, -15, -8.5, -20); c.lineTo(8.5, -21); c.quadraticCurveTo(11, -14, 12, -9); c.quadraticCurveTo(17, -2, 16, 5); c.quadraticCurveTo(20, 12, 18, 19); c.quadraticCurveTo(0, 23, -17, 19); c.closePath(); };
        c.beginPath(); body(); K.fill(c, rock, 1.6);
        c.save(); c.beginPath(); body(); c.clip();
        c.fillStyle = 'rgba(255,220,200,.1)'; c.beginPath(); c.moveTo(-12, -8); c.lineTo(-4, -10); c.lineTo(-7, 2); c.lineTo(-16, 6); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.moveTo(12, -9); c.lineTo(17, 3); c.lineTo(10, 10); c.lineTo(8, -2); c.closePath(); c.fill();
        K.glow(c, 0, 24, 18, '#ff6a1a', 0.35 * pulse);
        const cracks = [[[-15, 15], [-11, 9], [-13, 3], [-9, -3]], [[14, 15], [10, 9], [13, 4], [10, -2], [11, -8]], [[-4, -20], [-5, -15], [-2, -12]], [[5, -20], [6, -15], [4, -13]], [[-6, 21], [-3, 15], [2, 17], [6, 12]]];
        const crk = () => { c.beginPath(); cracks.forEach(P => P.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); };
        crk(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = `rgba(255,110,20,${0.45 * pulse + 0.2})`; c.lineWidth = 3.2; c.stroke(); c.strokeStyle = '#ffa82a'; c.lineWidth = 1.4; c.stroke(); c.strokeStyle = `rgba(255,248,180,${pulse})`; c.lineWidth = 0.5; c.stroke();
        c.beginPath(); c.moveTo(13, -9); c.quadraticCurveTo(18, 2, 17, 18); K.stroke(c, 'rgba(255,140,60,.55)', 1.2);
        c.restore();
        // kráter
        E(c, 0, -20.5, 8.8, 3); K.fill(c, '#2a1612', 1.3);
        E(c, 0, -20.3, 7, 2.1); c.fillStyle = K.rg(c, 0, -20.3, 0.5, 7, ['#fff6b0', '#ffb43a', '#ff4a10']); c.fill();
        for (let i = 0; i < 2; i++) { const p = (t * 1.2 + i * 0.5) % 1, r = 0.6 + p * 1.6; c.globalAlpha = 1 - p * 0.7; E(c, -3 + i * 5, -21 - p, r, r * 0.8); K.fill(c, '#ffd25a', 0.5, '#c0400a'); }
        c.globalAlpha = 1;
        // stékající láva
        const dp = (t * 0.35) % 1, dl = 3 + dp * 9;
        c.beginPath(); c.moveTo(4, -20); c.quadraticCurveTo(9, -19, 9.5, -16); c.lineTo(10.6, -18 + dl); c.quadraticCurveTo(10.6, -15 + dl + 2.6, 9, -16 + dl); c.quadraticCurveTo(7.8, -15, 6.5, -18.6); c.closePath();
        K.fill(c, K.lg(c, 0, -20, 0, -10 + dl, ['#fff0a0', '#ff8a1a', '#d8300a']), 1, '#5a1a08');
        c.beginPath(); c.moveTo(-5, -20); c.quadraticCurveTo(-8.5, -19, -8.8, -15); c.quadraticCurveTo(-9, -12.5, -7.6, -12.5); c.quadraticCurveTo(-6.6, -14.5, -5.5, -18.5); c.closePath(); K.fill(c, '#ff8a1a', 1, '#5a1a08');
        // obličej
        const eyeL = (x, y) => { E(c, x, y, 3.6, 4); c.fillStyle = '#140808'; c.fill(); E(c, x, y + 0.2, 2.9, 3.3); c.fillStyle = K.rg(c, x, y + 0.6, 0.3, 3.4, ['#fffbd0', '#ffc23a', '#ff5a12']); c.fill(); E(c, x + 0.9, y + 0.3, 1.2, 1.8); c.fillStyle = '#2a0a06'; c.fill(); E(c, x + 1.5, y - 0.8, 0.6, 0.6); c.fillStyle = '#fff'; c.fill(); };
        eyeL(-2.5, -5); eyeL(7, -5);
        K.glow(c, 2, -5, 10, '#ff8a2a', 0.3 + pulse * 0.2);
        c.fillStyle = '#5a3830';
        c.beginPath(); c.moveTo(-6.5, act ? -11 : -10.4); c.lineTo(1, act ? -8.6 : -10); c.lineTo(0.6, -8.4); c.lineTo(-6.4, -9); c.closePath(); K.fill(c, '#5a3830', 1);
        c.beginPath(); c.moveTo(11, act ? -11 : -10.4); c.lineTo(3.5, act ? -8.6 : -10); c.lineTo(3.9, -8.4); c.lineTo(10.9, -9); c.closePath(); K.fill(c, '#5a3830', 1);
        if (act) { E(c, 2.5, 4, 5, 4); K.fill(c, K.rg(c, 2.5, 5, 0.5, 5, ['#fff6b0', '#ff9a2a', '#c0300a']), 1.3); }
        else { c.beginPath(); c.moveTo(-3.5, 2.5); c.quadraticCurveTo(2.5, 9.5, 10, 2); c.quadraticCurveTo(3, 5, -3.5, 2.5); c.closePath(); K.fill(c, K.lg(c, 0, 2, 0, 7, ['#ffe680', '#ff6a1a']), 1.2); c.fillStyle = '#3a2220'; c.fillRect(0.5, 3.3, 1.6, 1.4); c.fillRect(4.6, 3.6, 1.6, 1.4); }
        // přední ruka s šálkem
        E(c, 16.5, 4, 4, 4.6, -0.4); K.fill(c, '#4a2c26', 1.4);
        if (!act) {
          c.save(); c.translate(21, 1.5); c.rotate(sin(t * 2) * 0.05);
          c.beginPath(); c.arc(3.6, -1.2, 1.7, -1.4, 1.4); K.stroke(c, OUT, 2); c.beginPath(); c.arc(3.6, -1.2, 1.7, -1.4, 1.4); K.stroke(c, '#f4f0ea', 0.9);
          c.beginPath(); c.moveTo(-3.6, -3.6); c.lineTo(3.6, -3.6); c.quadraticCurveTo(3.4, 2.6, 0, 2.6); c.quadraticCurveTo(-3.4, 2.6, -3.6, -3.6); c.closePath(); K.fill(c, K.lg(c, -3, 0, 3, 0, ['#ffffff', '#c8c4c0']), 1);
          c.fillStyle = '#3a6ad8'; c.fillRect(-3.3, -2, 6.6, 1);
          E(c, 0, -3.6, 3.5, 0.9); c.fillStyle = '#ff8a1a'; c.fill();
          c.restore();
          E(c, 18.5, 4.5, 2.4, 2); K.fill(c, '#4a2c26', 1);
          for (let i = 0; i < 2; i++) { const p = (t * 0.8 + i * 0.5) % 1; c.globalAlpha = sin(p * PI) * 0.7; c.beginPath(); c.moveTo(21 + i * 1.5, -3 - p * 4); c.quadraticCurveTo(23 + i * 1.5, -5 - p * 6, 21 + i * 1.5, -7 - p * 8); K.stroke(c, '#ffffff', 0.9); }
          c.globalAlpha = 1;
        }
        // kouř a jiskry
        for (let i = 0; i < 4; i++) { const p = (t * 0.55 + i / 4) % 1, r = 2 + p * 4.5, x = sin(i * 2 + t) * 2.5 - p * 7, y = -24 - p * 13; c.globalAlpha = (1 - p) * 0.75 * min(1, p * 6); E(c, x, y, r, r * 0.9); c.fillStyle = act ? '#4a3a3a' : '#7a6e74'; c.fill(); E(c, x - r * 0.2, y - r * 0.3, r * 0.55, r * 0.4); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }
        c.fillStyle = '#ffb43a';
        for (let i = 0; i < 4; i++) { const p = (t * 0.8 + K.rnd(i + 20)) % 1; c.globalAlpha = 1 - p; E(c, -8 + i * 5 + sin(t * 3 + i) * 2, -20 - p * 18, 0.8, 0.8); c.fill(); }
        c.globalAlpha = 1;
        c.restore();
        // ERUPCE: lávové jezírko
        if (act) {
          E(c, 31, 24.5, 11, 3.4); K.fill(c, K.rg(c, 31, 24.5, 1, 11, ['#fff6b0', '#ffa82a', '#e0400a']), 1.2, '#5a1a08');
          c.fillStyle = '#3a1c14'; E(c, 26, 24.2, 2.4, 0.8, 0.2); c.fill(); E(c, 35, 25.2, 2, 0.7); c.fill();
          K.glow(c, 31, 22, 13, '#ff7a1a', 0.6);
          const fy = u => -23 - 50 * u + 97 * u * u;
          c.save(); c.globalAlpha = 0.85; c.beginPath(); for (let k = 0; k <= 12; k++) { const u = k / 12; k ? c.lineTo(6 + u * 26, fy(u)) : c.moveTo(6, fy(0)); } c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#ff6a12'; c.lineWidth = 3.2; c.stroke(); c.strokeStyle = '#ffe680'; c.lineWidth = 1.1; c.stroke(); c.restore();
          for (let i = 0; i < 7; i++) { const u = (t * 1.8 + i / 7) % 1, x = 6 + u * 26 + sin(i * 3) * 1.2, y = fy(u), r = 2.3 - u * 0.5; E(c, x, y, r, r * 0.9); K.fill(c, i % 2 ? '#ffd25a' : '#ff7a1a', 0.8, '#5a1a08'); }
          K.glow(c, 6, -24, 9, '#ffb43a', 0.8);
          for (let i = 0; i < 3; i++) { const p = (t * 2.5 + i / 3) % 1; E(c, 6 + (i - 1) * 4 * p, -24 - p * 7 + p * p * 6, 1.2, 1.2); K.fill(c, '#ffd25a', 0.7, '#5a1a08'); }
          for (let i = 0; i < 2; i++) { const p = (t * 0.9 + i * 0.5) % 1, r = 2 + p * 3; c.globalAlpha = (1 - p) * 0.6; E(c, 28 + i * 6, 20 - p * 12, r, r); c.fillStyle = '#e8e4e8'; c.fill(); }
          c.globalAlpha = 1;
        }
      },

      /* ---------------- OPEŘENÝ HAD ---------------- */
      quetzal(c, t, act) {
        const hx = act ? 7 : sin(t * 1.6) * 1.2, hy = act ? 3 : sin(t * 1.6 + 1) * 1;
        c.save();
        // větrné spirály
        for (let i = 0; i < 2; i++) { const p = (t * 0.3 + i / 2) % 1, x0 = 24 - p * 54, y0 = -28 + i * 18, a0 = t * 2 + i; c.globalAlpha = sin(p * PI) * 0.7;
          c.beginPath(); c.moveTo(x0 + 10, y0 + 4.5); for (let k = 0; k <= 12; k++) { const r = 4.5 * (1 - k / 14), a = PI / 2 + k * 0.6; c.lineTo(x0 + cos(a) * r, y0 + sin(a) * r); } K.stroke(c, '#ffffff', 1.1); }
        c.globalAlpha = 1;
        const bG = K.lg(c, 0, -14, 0, 26, ['#5af0b8', '#2ab88a', '#13785a']);
        // ocas s pery
        const TPp = curl(-30, 9, -1.75, 11, -0.4, 5, 0); const tip = TPp[5];
        const tfG = K.lg(c, 0, 0, 12, 0, ['#e83a3a', '#1ad89a', '#0a7a6a']); for (let i = 0; i < 3; i++) { c.save(); c.translate(tip[0], tip[1]); c.rotate(-2.5 + i * 0.35 + sin(t * 2.5 + i) * 0.1); const l = 12 - i * 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -2.6, l, 0); c.quadraticCurveTo(l * 0.5, 2.6, 0, 0); K.fill(c, tfG, 1); E(c, l * 0.75, 0, 1.2, 1); c.fillStyle = '#3af0ff'; c.fill(); c.restore(); }
        taper(c, TPp, 8.4, 1.2); K.fill(c, bG, 1.3);
        // zadní křídlo
        const wing = (x, y, flap, far) => { c.save(); c.translate(x, y); c.rotate(flap); if (far) c.scale(0.85, 0.85);
          for (let k = 0; k < 5; k++) { c.save(); c.rotate(-2.0 - k * 0.27); const l = 9 + k * 1.6; E(c, l / 2, 0, l / 2, 2.2); K.fill(c, far ? ['#0e7a6a', '#128a6a', '#17986a', '#1aa070', '#22a878'][k] : ['#1ae0c0', '#22d0a0', '#2ac88a', '#3ad890', '#5ae8a0'][k], 1); c.restore(); }
          for (let k = 0; k < 3; k++) { c.save(); c.rotate(-2.1 - k * 0.35); E(c, 3, 0, 3.2, 1.7); K.fill(c, ['#e83a3a', '#ffc23a', '#e83a3a'][k], 0.9); c.restore(); }
          c.restore(); };
        const fl = sin(t * 3) * 0.12;
        wing(9, 10, fl - 0.1, true);
        // tělo
        const bodyP = () => { c.beginPath(); c.moveTo(-30, 9); c.bezierCurveTo(-31, 21, -20, 24, -12, 20); c.bezierCurveTo(-5, 16.5, 0, 24, 7, 21); c.bezierCurveTo(14, 18, 16, 10, 13, 2); c.bezierCurveTo(11 + hx * 0.3, -4 + hy * 0.5, 9 + hx * 0.6, -8 + hy, 12 + hx, -13 + hy); };
        c.lineCap = 'round'; c.lineJoin = 'round';
        bodyP(); c.strokeStyle = OUT; c.lineWidth = 11; c.stroke(); c.strokeStyle = bG; c.lineWidth = 8.4; c.stroke();
        c.save(); c.translate(0.7, 1.7); bodyP(); c.strokeStyle = '#e8f0a0'; c.lineWidth = 2.4; c.stroke(); c.restore();
        bodyP(); c.setLineDash([1.4, 2.4]); c.strokeStyle = 'rgba(8,70,50,.4)'; c.lineWidth = 5.4; c.stroke(); c.setLineDash([]);
        c.save(); c.translate(-0.4, -2); bodyP(); c.strokeStyle = 'rgba(220,255,240,.45)'; c.lineWidth = 1.3; c.stroke(); c.restore();
        // zlaté nákrčníky s tyrkysem
        [[[-30, 9], [-31, 21], [-20, 24], [-12, 20], 0.55], [[7, 21], [14, 18], [16, 10], [13, 2], 0.35]].forEach(([a, b, q, d, u]) => { const p = bz(a, b, q, d, u), p2 = bz(a, b, q, d, u + 0.02); c.save(); c.translate(p[0], p[1]); c.rotate(Math.atan2(p2[1] - p[1], p2[0] - p[0])); c.beginPath(); c.rect(-1.4, -5.2, 2.8, 10.4); K.fill(c, '#f0b830', 0.9); c.fillStyle = 'rgba(255,255,220,.6)'; c.fillRect(-1, -4.8, 0.8, 9.6); E(c, 0, 0, 1, 1); c.fillStyle = '#3ae8e0'; c.fill(); c.restore(); });
        wing(11, 11, -fl, false);
        // hlava
        c.save(); c.translate(hx, hy);
        // límec z per
        for (let k = 0; k < 7; k++) { const a = -0.6 + k * 0.42 + sin(t * 3 + k) * 0.05; c.save(); c.translate(11, -12); c.rotate(a + PI / 2); c.beginPath(); tongue(c, 0, 0, 2.4, 6.5, 0); K.fill(c, ['#e83a3a', '#ffc23a', '#2ac88a', '#e83a3a', '#ffc23a', '#2ac88a', '#e83a3a'][k], 0.9); c.restore(); }
        // chochol
        const crG = K.lg(c, 0, 0, 19, 0, [[0, '#ffc23a'], [0.25, '#2ad89a'], [1, '#0a8a7a']]);
        for (let k = 0; k < 5; k++) { const a = -2.75 + k * 0.26 + sin(t * 2.2 + k * 0.7) * 0.06, l = 15 + (k % 2) * 4 + (k === 2 ? 3 : 0); c.save(); c.translate(11, -20); c.rotate(a);
          c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -3, l, 0); c.quadraticCurveTo(l * 0.5, 3, 0, 0); K.fill(c, crG, 1);
          c.beginPath(); c.moveTo(1, 0); c.lineTo(l - 1, 0); K.stroke(c, 'rgba(255,255,255,.5)', 0.5); E(c, l - 2.4, 0, 1.4, 1.1); c.fillStyle = '#e83a3a'; c.fill(); c.restore(); }
        const hinge = [11, -14], ja = act ? 0.42 : 0, ua = act ? -0.28 : 0;
        // spodní čelist
        c.save(); c.translate(hinge[0], hinge[1]); c.rotate(ja); c.translate(-hinge[0], -hinge[1]);
        c.beginPath(); c.moveTo(9.5, -13.5); c.quadraticCurveTo(18, -13, 26, -14); c.quadraticCurveTo(24, -10, 17, -9.5); c.quadraticCurveTo(11, -9.5, 9.5, -13.5); c.closePath(); K.fill(c, K.lg(c, 0, -14, 0, -9, ['#3ac898', '#e8f0a0']), 1.2);
        if (act) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(22, -13.6); c.lineTo(23, -16.5); c.lineTo(24, -13.8); c.fill(); }
        c.restore();
        if (act) { c.beginPath(); c.moveTo(11, -14); c.lineTo(26, -19); c.lineTo(25, -10); c.closePath(); c.fillStyle = '#a8203a'; c.fill(); }
        // jazyk
        const tp = (t * 0.55) % 1;
        if (!act && tp < 0.18) { const l = sin(tp / 0.18 * PI) * 6; c.beginPath(); c.moveTo(25, -14); c.lineTo(26 + l, -14); c.lineTo(27.5 + l, -15.5); c.moveTo(26 + l, -14); c.lineTo(27.5 + l, -12.6); K.stroke(c, '#e0304a', 0.9); }
        c.save(); c.translate(hinge[0], hinge[1]); c.rotate(ua); c.translate(-hinge[0], -hinge[1]);
        c.beginPath(); c.moveTo(8, -17); c.bezierCurveTo(8.5, -24, 18, -25, 22, -21); c.quadraticCurveTo(27, -19, 28, -16); c.quadraticCurveTo(26, -13.4, 20, -13.4); c.quadraticCurveTo(14, -13, 9, -12); c.closePath(); K.fill(c, K.lg(c, 10, -24, 14, -12, ['#6af8c4', '#2ab88a', '#168a64']), 1.3);
        c.fillStyle = 'rgba(255,240,140,.55)'; [[13, -21.5], [17.5, -22.2], [21.5, -20.4]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 1.3); c.lineTo(x + 1.3, y); c.lineTo(x, y + 1.3); c.lineTo(x - 1.3, y); c.fill(); });
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(22.5, -13.5); c.lineTo(23.4, act ? -10 : -11.4); c.lineTo(24.3, -13.5); c.fill();
        E(c, 25.6, -17.6, 0.8, 0.5, 0.4); c.fillStyle = OUT; c.fill();
        E(c, 9.6, -15.4, 1.5, 1.5); K.fill(c, K.rg(c, 9.6, -15.4, 0.2, 1.5, ['#bfffff', '#1ac8c0', '#0a6a7a']), 0.8);
        K.eye(c, 16.6, -18.4, 3.3, '#ffb41a', 0.6, act ? 0 : blk(t, 4.6, 3));
        lid(c, 16.6, -18.4, 3.3, act ? 0.38 : 0.26, act ? 0.4 : 0.15, '#2ab88a');
        c.restore();
        // JED
        if (act) {
          for (let i = 0; i < 2; i++) { const p = (t * 1.5 + i * 0.5) % 1; E(c, 23.4 + i * 1.2, -9 + p * 10, 0.9, 1.2 + p * 0.4); c.fillStyle = '#8aff3a'; c.fill(); }
          for (let i = 0; i < 5; i++) { const p = (t * 2 + i / 5) % 1, r = 2 + p * 4, x = 28 + p * 14, y = -15 + (i - 2) * 2.4 + p * (i - 2) * 2; c.globalAlpha = (1 - p) * 0.75; E(c, x, y, r, r * 0.85); c.fillStyle = '#7aee4a'; c.fill(); E(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.3); c.fillStyle = '#d8ffb0'; c.fill(); }
          c.globalAlpha = 1;
        }
        c.restore();
        c.restore();
      },

      /* ---------------- NOČNÍ MŮRA ---------------- */
      mura(c, t, act) {
        c.save();
        if (act) { c.translate(-8, 20); c.rotate(-0.36); c.translate(8, -20); }
        else c.translate(0, sin(t * 1.5) * 0.8);
        // kouřové stopy
        for (let i = 0; i < 5; i++) { const p = (t * 0.5 + i / 5) % 1, r = 2 + p * 5; c.globalAlpha = (1 - p) * 0.5 * min(1, p * 5); E(c, -14 - p * 18, -4 - p * 16 + sin(t + i) * 2, r, r * 0.8); c.fillStyle = '#3a2452'; c.fill(); }
        c.globalAlpha = 1;
        const FL = K.lg(c, 0, -40, 0, 0, ['#ffe680', '#ff8a2a', '#ff2a6a']);
        // ohnivý ocas
        for (let i = 0; i < 4; i++) { const f = sin(t * 10 + i * 1.9); c.save(); c.translate(-16, -1); c.rotate(-1.35 + i * 0.28 + f * 0.08); c.beginPath(); tongue(c, 0, 0, 3.8 - i * 0.4, 15 - i * 1.5 + f * 2, -4 - f * 2); K.fill(c, i === 3 ? '#ffd24a' : FL, 1, '#5a0a2a'); c.restore(); }
        // kouřové nohy
        const legC = K.lg(c, 0, 4, 0, 24, [[0, '#2e1c44'], [0.55, 'rgba(46,28,68,.85)'], [1, 'rgba(46,28,68,0)']]), legO = K.lg(c, 0, 4, 0, 24, [[0, OUT], [0.5, 'rgba(27,20,32,.8)'], [1, 'rgba(27,20,32,0)']]);
        const sw = sin(t * 2) * 0.08;
        const L = act ? [[-14, 5, 0.25, 0.1], [5, 6, -1.5, -0.4], [-10, 6, 0.1, -0.05], [9, 6, -1.7, -0.6]] : [[-14, 5, 0.3, -0.05], [5, 6, -0.15 + sw, 0.15], [-10, 6, 0.15, -0.1], [9, 6, -0.3 - sw, 0.25]];
        const feet = L.map((l, i) => leg(c, l[0], l[1], l[2], l[3], i % 2 ? '#3a2654' : legC, act && i % 2 ? '#2a1a3a' : null, 4.2, i % 2 && act ? OUT : legO));
        feet.forEach(([x, y], i) => { if (act && i % 2) return; for (let k = 0; k < 2; k++) { const p = (t * 0.9 + k * 0.5 + i * 0.23) % 1, r = 1.6 + p * 3.2; c.globalAlpha = (1 - p) * 0.6; E(c, x - p * 6, y - p * 3, r, r * 0.75); c.fillStyle = '#4a3466'; c.fill(); } });
        c.globalAlpha = 1;
        // ucho
        c.beginPath(); c.moveTo(10.5, -23); c.lineTo(10, -33); c.lineTo(15, -24.5); c.closePath(); K.fill(c, '#3a2654', 1.2); c.beginPath(); c.moveTo(11.5, -24); c.lineTo(11.2, -30); c.lineTo(14, -24.8); c.fillStyle = '#ff5a8a'; c.fill();
        // tělo s fialovým okrajovým světlem
        merged(c, () => horseBuild(c), '#8a5ac8', 1.4);
        c.save(); c.beginPath(); horseBuild(c); c.clip(); c.translate(1.3, 1.7); c.beginPath(); horseBuild(c); c.fillStyle = K.lg(c, 0, -26, 0, 12, ['#4a2e6a', '#24143a', '#120a1c']); c.fill(); c.translate(-1.3, -1.7);
        c.fillStyle = 'rgba(160,110,230,.25)'; E(c, -6, -3, 9, 2, -0.1); c.fill();
        c.restore();
        // ohnivá hříva
        K.glow(c, 6, -20, 16, '#ff5a2a', act ? 0.8 : 0.45 + 0.1 * sin(t * 9));
        for (let i = 0; i < 6; i++) { const k = i / 5, x = 13 - k * 10, y = -26 + k * 20, f = sin(t * 11 + i * 1.7), h = ((act ? 15 : 10) + (1 - k) * 2) * (0.75 + K.rnd(i + 40) * 0.45) + f * 1.8; c.save(); c.translate(x, y); c.rotate(-0.5 + k * 0.12 + f * 0.08); c.beginPath(); tongue(c, 0, 0, 3.4, h, -5 - f * 1.5); K.fill(c, FL, 0.9, 'rgba(110,10,40,.7)'); c.beginPath(); tongue(c, 0.4, 0, 1.7, h * 0.6, -3 - f); c.fillStyle = '#ffd25a'; c.fill(); c.beginPath(); tongue(c, 0.6, 0, 0.8, h * 0.3, -1); c.fillStyle = '#fffbe0'; c.fill(); c.restore(); }
        c.fillStyle = '#ffb43a'; for (let i = 0; i < 3; i++) { const p = (t * 0.9 + i / 3) % 1; c.globalAlpha = 1 - p; E(c, 6 - p * 14 + sin(t * 4 + i) * 2, -24 - p * 12 + i * 5, 0.8, 0.8); c.fill(); } c.globalAlpha = 1;
        // oko
        if (act) K.glow(c, 16.5, -20, 10, '#ff6a1a', 0.9); else K.glow(c, 16.5, -20, 6, '#ff6a1a', 0.5);
        E(c, 16.5, -20, 3.3, 2.9, 0.2); K.fill(c, K.rg(c, 16.5, -20, 0.3, 3.4, ['#fffbe0', '#ffb43a', '#ff3a1a']), 1.1);
        E(c, 17.2, -20, 0.8, 2.2); c.fillStyle = '#1a0a10'; c.fill();
        c.save(); E(c, 16.5, -20, 3.3, 2.9, 0.2); c.clip(); c.translate(16.5, -20); c.rotate(0.45); c.fillStyle = '#2a1840'; c.fillRect(-5, -6, 10, act ? 4.6 : 4.2); c.restore();
        c.beginPath(); c.moveTo(12.6, -22.4); c.lineTo(20.4, -20.4); K.stroke(c, OUT, 1.3);
        // nozdry kouří
        E(c, 25, -13.5, 0.9, 0.6, 0.5); c.fillStyle = '#ff6a1a'; c.fill();
        for (let k = 0; k < 2; k++) { const p = (t * 1.1 + k * 0.5) % 1, r = 1 + p * 2.4; c.globalAlpha = (1 - p) * 0.55; E(c, 27 + p * 6, -13 - p * 4, r, r * 0.8); c.fillStyle = '#5a4470'; c.fill(); }
        c.globalAlpha = 1;
        if (act) { c.beginPath(); c.moveTo(25.5, -11); c.quadraticCurveTo(22, -7, 18.6, -10.6); c.quadraticCurveTo(22, -9.6, 25.5, -11); K.fill(c, '#ff8a2a', 1); }
        else { c.beginPath(); c.moveTo(24.6, -10.4); c.quadraticCurveTo(22.5, -9.4, 20, -10.8); K.stroke(c, OUT, 0.9); }
        c.restore();
        // VLNA DĚSU – křičící přízraky
        if (act) {
          for (let k = 0; k < 2; k++) { const p = (t * 1.8 + k / 2) % 1; c.beginPath(); c.arc(14, -14, 8 + p * 24, -0.7, 0.7); c.strokeStyle = `rgba(150,90,220,${(1 - p) * 0.45})`; c.lineWidth = 2 * (1 - p) + 0.4; c.stroke(); }
          for (let i = 0; i < 3; i++) { const p = (t * 1.5 + i / 3) % 1, x = 24 + p * 16, y = -22 + i * 10 + sin(t * 6 + i) * 1.5; c.globalAlpha = (1 - p) * 0.9;
            c.beginPath(); c.moveTo(x - 11, y + 2 + sin(t * 9 + i) * 1.5); c.quadraticCurveTo(x - 4, y - 5, x + 1, y - 4.5); c.arc(x + 1, y, 4.5, -PI / 2, PI / 2); c.quadraticCurveTo(x - 4, y + 5, x - 11, y + 2 + sin(t * 9 + i) * 1.5); K.fill(c, '#6a46a0', 1, '#e0c8ff');
            c.fillStyle = '#140a20'; E(c, x + 0.4, y - 1.2, 1, 1.4); c.fill(); E(c, x + 3.2, y - 1.2, 1, 1.4); c.fill(); E(c, x + 1.9, y + 2, 1.1, 1.6); c.fill();
            c.fillStyle = '#ffb43a'; E(c, x + 0.6, y - 1.2, 0.4, 0.4); c.fill(); E(c, x + 3.4, y - 1.2, 0.4, 0.4); c.fill(); }
          c.globalAlpha = 1;
        }
      }
    });
  }

  /* část 4 – LEGENDARY: fenix, duha, kitsune, havran, kocka, ignis, astralion, leviatan, serafina, frostwyrm */
  {
    const PI = Math.PI, sin = Math.sin, cos = Math.cos, R = K.rnd, LW = 1.5;
    const GOLD = [[0, '#fff7c8'], [0.3, '#ffd84a'], [0.65, '#e89a1a'], [1, '#8a520e']];
    const blinkAt = (t, p) => { const x = (t + p) % 4.3; return x < 0.16 ? sin(x / 0.16 * PI) : 0; };
    // plynulá cesta přes body
    const thru = (c, pts, move) => {
      if (move) c.moveTo(pts[0][0], pts[0][1]); else c.lineTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) c.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
      const l = pts[pts.length - 1]; c.lineTo(l[0], l[1]);
    };
    // středová čára: start, úhel, délka, celkové zakřivení, počet úseků, vlnění(k)
    const spine = (x, y, a, len, bend, n, wob) => {
      const pts = [[x, y]], st = len / n;
      for (let i = 1; i <= n; i++) { const k = i / n, aa = a + bend * k + (wob ? wob(k) : 0); x += cos(aa) * st; y += sin(aa) * st; pts.push([x, y]); }
      return pts;
    };
    // zužující se stuha kolem středové čáry (wf(k) = plná šířka), kulatá špička; vrací okraje
    const ribbon = (c, pts, wf, noBegin) => {
      const n = pts.length, L = [], Rt = [];
      for (let i = 0; i < n; i++) {
        const p = pts[i > 0 ? i - 1 : 0], q = pts[i < n - 1 ? i + 1 : n - 1];
        let dx = q[0] - p[0], dy = q[1] - p[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
        const w = wf(i / (n - 1)) * 0.5;
        L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); Rt.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
      }
      const e = pts[n - 1], p = pts[n - 2], dx = e[0] - p[0], dy = e[1] - p[1], d = Math.hypot(dx, dy) || 1, we = wf(1) * 0.7 + 0.5;
      if (!noBegin) c.beginPath();
      thru(c, L, true);
      c.quadraticCurveTo(e[0] + dx / d * we * 1.5, e[1] + dy / d * we * 1.5, Rt[n - 1][0], Rt[n - 1][1]);
      const Rr = Rt.slice().reverse(); thru(c, Rr, false); c.closePath();
      return { L, R: Rt };
    };
    // list / pero: kořen x,y, úhel, délka, šířka (řídicí bod), asymetrie
    const leaf = (c, x, y, a, len, w, asym) => {
      const ca = cos(a), sa = sin(a), tx = x + ca * len, ty = y + sa * len, nx = -sa * w, ny = ca * w, mx = x + ca * len * 0.5, my = y + sa * len * 0.5;
      asym = asym == null ? 1 : asym;
      c.moveTo(x, y); c.quadraticCurveTo(mx + nx, my + ny, tx, ty); c.quadraticCurveTo(mx - nx * asym, my - ny * asym, x, y);
    };
    // plamen: základna x,y o poloměru w, špička ve vzdálenosti h ve směru a, vychýlení wob
    const flame = (c, x, y, w, h, a, wob) => {
      const ca = cos(a), sa = sin(a), nx = -sa, ny = ca, tx = x + ca * h + nx * wob, ty = y + sa * h + ny * wob;
      c.moveTo(tx, ty);
      c.bezierCurveTo(x + ca * h * 0.45 + nx * (w * 0.55 + wob * 0.5), y + sa * h * 0.45 + ny * (w * 0.55 + wob * 0.5), x + ca * h * 0.12 + nx * w * 1.1, y + sa * h * 0.12 + ny * w * 1.1, x + nx * w, y + ny * w);
      c.arc(x, y, w, a + PI / 2, a + PI * 1.5);
      c.bezierCurveTo(x + ca * h * 0.12 - nx * w * 1.1, y + sa * h * 0.12 - ny * w * 1.1, x + ca * h * 0.45 - nx * (w * 0.55 - wob * 0.5), y + sa * h * 0.45 - ny * (w * 0.55 - wob * 0.5), tx, ty);
    };
    const gem = (c, x, y, r, col) => {
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = K.rg(c, x, y, 0, r * 1.2, [[0, '#ffffff'], [0.35, col], [1, K.dark(col, 0.55)]], x - r * 0.35, y - r * 0.35); c.fill();
      c.lineWidth = 0.7; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.arc(x - r * 0.32, y - r * 0.35, r * 0.28, 0, TAU); c.fillStyle = 'rgba(255,255,255,.95)'; c.fill();
    };
    const add = (c, a) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; };
    // sjednocený tvar: tlustý obrys pod výplní (vnitřní hrany zmizí)
    // (pole funkcí = každá část se vyplní zvlášť, takže nevadí opačné vinutí cest)
    const uni = (c, paths, fill, lw) => {
      const A = Array.isArray(paths) ? paths : [paths];
      c.beginPath(); A.forEach(f => f()); c.lineJoin = 'round'; c.lineWidth = lw * 2; c.strokeStyle = OUT; c.stroke(); c.fillStyle = fill;
      if (A.length === 1) c.fill(); else A.forEach(f => { c.beginPath(); f(); c.fill(); });
    };
    // oheň čitelný i na světlém nebi: průsvitný gradient + aditivní jádro
    const FIRE = (c, x, y, r) => K.rg(c, x, y, r * 0.05, r, [[0, '#fff6c0'], [0.35, '#ffc23a'], [0.7, 'rgba(255,100,20,.85)'], [1, 'rgba(220,30,10,0)']]);
    // stoupající částice (deterministické)
    const motes = (c, t, n, seed, x0, w, y0, h, sp, sz, col, sway, a0) => {
      c.fillStyle = col; a0 = a0 == null ? 1 : a0;
      for (let i = 0; i < n; i++) {
        const ph = (t * sp + R(i + seed)) % 1, x = x0 + R(i * 3.1 + seed + 1) * w + sin(t * 2 + i * 1.7) * sway, y = y0 - ph * h, r = sz * (1 - ph * 0.7) * (0.6 + R(i + seed + 9) * 0.7);
        c.globalAlpha = a0 * Math.min(1, (1 - ph) * 1.8, ph * 8);
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      }
      c.globalAlpha = a0;
    };
    const heart = (c, x, y, s) => { c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.6, y - s * 1.2, x, y - s * 0.35); c.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.5, y - s * 0.1, x, y + s * 0.9); };
    const flake = (c, x, y, r) => { const a = r * 0.5, b = r * 0.866; c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x - a, y - b); c.lineTo(x + a, y + b); c.moveTo(x - a, y + b); c.lineTo(x + a, y - b); };
    // dračí / kočičí oko se štěrbinou
    const dEye = (c, x, y, r, iris, rot, slit) => {
      c.save(); c.translate(x, y); c.rotate(rot || 0);
      c.beginPath(); c.moveTo(-r, 0.1 * r); c.quadraticCurveTo(-0.1 * r, -r * 1.3, r, -r * 0.15); c.quadraticCurveTo(0.1 * r, r * 1.0, -r, 0.1 * r); c.closePath();
      c.fillStyle = K.rg(c, 0, r * 0.15, 0, r * 1.05, [[0, '#fffbe0'], [0.45, iris], [1, K.dark(iris, 0.55)]]); c.fill(); c.lineWidth = 1.2; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.ellipse(r * 0.12, -r * 0.05, r * 0.2 * (slit || 1), r * 0.6, 0, 0, TAU); c.fillStyle = '#120a0a'; c.fill();
      c.beginPath(); c.arc(-r * 0.3, -r * 0.32, r * 0.2, 0, TAU); c.fillStyle = '#fff'; c.fill();
      c.restore();
    };
    // opeřené křídlo: kořen, středový úhel, měřítko, počet per, výplň, rozevření, délka(k); vrací špičky
    const wingF = (c, x, y, a, sc, n, fill, spread, lenF, lw, oc) => {
      const tips = [];
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1), fa = a - spread * 0.5 + k * spread, len = lenF(k) * sc;
        c.beginPath(); leaf(c, x, y, fa, len, 6.5 * sc, 0.55); K.fill(c, fill, lw || 1.1, oc);
        tips.push([x + cos(fa) * len, y + sin(fa) * len, fa]);
      }
      return tips;
    };
    // netopýří křídlo (drak): rameno, úhel paže, měřítko, výplň blány, barva prstů
    const batWing = (c, sx, sy, ua, sc, memb, bone, vein) => {
      const ex = sx + cos(ua) * 12 * sc, ey = sy + sin(ua) * 12 * sc, wa = ua - 0.35, wx = ex + cos(wa) * 11 * sc, wy = ey + sin(wa) * 11 * sc;
      const T = [[-0.25, 14], [-0.8, 20], [-1.25, 20], [-1.7, 15]].map(([o, l]) => [wx + cos(ua + o) * l * sc, wy + sin(ua + o) * l * sc]);
      const bx = sx - 9 * sc, by = sy + 5 * sc;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(wx, wy); c.lineTo(T[0][0], T[0][1]);
      for (let i = 1; i <= 4; i++) {
        const A = T[i - 1], B = i < 4 ? T[i] : [bx, by], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        c.quadraticCurveTo(mx + (wx - mx) * 0.32, my + (wy - my) * 0.32, B[0], B[1]);
      }
      c.closePath(); K.fill(c, memb, LW);
      // prsty
      c.beginPath(); T.forEach(p => { c.moveTo(wx, wy); c.lineTo(p[0], p[1]); });
      c.strokeStyle = OUT; c.lineWidth = 2.4 * sc; c.lineCap = 'round'; c.stroke(); c.strokeStyle = bone; c.lineWidth = 1.2 * sc; c.stroke();
      if (vein) { add(c, 0.7); c.beginPath(); T.forEach((p, i) => { const m = [(wx + p[0]) / 2, (wy + p[1]) / 2]; c.moveTo(m[0], m[1]); c.lineTo(m[0] + (p[0] - wx) * 0.2 + (i - 1.5) * 2, m[1] + 4 * sc); }); K.stroke(c, vein, 0.8); c.restore(); }
      // paže
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(wx, wy);
      c.strokeStyle = OUT; c.lineWidth = 4.6 * sc; c.lineJoin = 'round'; c.stroke(); c.strokeStyle = bone; c.lineWidth = 2.4 * sc; c.stroke();
      // dráp na zápěstí
      c.beginPath(); c.moveTo(wx - 1.5, wy); c.quadraticCurveTo(wx - 1, wy - 4.5 * sc, wx + 2.5 * sc, wy - 5 * sc); c.lineTo(wx + 1.5, wy + 0.5); c.closePath(); K.fill(c, '#fff0c8', 0.9);
      return T;
    };
    const bone = (c, pts, w, col) => { c.beginPath(); thru(c, pts, true); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w + 2.4; c.strokeStyle = OUT; c.stroke(); c.lineWidth = w; c.strokeStyle = col; c.stroke(); };
    const knob = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, 0, TAU); K.fill(c, col, 0.9); };

    const F = {
      /* ---------------- FÉNIX – kuře z popela ---------------- */
      fenix(c, t, act) {
        const b = sin(t * 3) * 1.5 - (act ? 4 : 0), fl = act ? 0 : sin(t * 6.5), bl = blinkAt(t, 0.3);
        // hnízdo z popela se skořápkou
        c.beginPath(); c.ellipse(-1, 23.5, 14, 5, 0, PI, TAU); c.closePath(); K.fill(c, K.lg(c, 0, 18, 0, 24, ['#6a5a5a', '#2a2024']), 1.2);
        add(c, 0.6 + sin(t * 4) * 0.3); c.beginPath(); c.moveTo(-10, 22.5); c.lineTo(-6, 20.5); c.lineTo(-3, 22); c.moveTo(2, 21); c.lineTo(6, 19.6); c.lineTo(9, 21.5); c.moveTo(-1, 19.5); c.lineTo(1, 22.5); K.stroke(c, '#ff8a2a', 0.9); c.restore();
        [[-11, 19, 5.2, -0.3], [9.5, 19.6, 4, 0.45]].forEach(([x, y, r, rot]) => {
          c.save(); c.translate(x, y); c.rotate(rot);
          c.beginPath(); c.arc(0, 0, r, 0, PI); c.lineTo(-r * 0.55, -r * 0.5); c.lineTo(-r * 0.15, 0); c.lineTo(r * 0.25, -r * 0.6); c.lineTo(r * 0.6, -r * 0.05); c.closePath();
          K.fill(c, K.lg(c, 0, -r, 0, r, ['#fffaf0', '#f0d8a8', '#c8986a']), 1);
          c.beginPath(); c.ellipse(0, -0.2, r * 0.75, r * 0.22, 0, 0, TAU); c.fillStyle = 'rgba(255,130,30,.75)'; c.fill();
          c.beginPath(); c.arc(-r * 0.4, r * 0.45, r * 0.12, 0, TAU); c.arc(r * 0.35, r * 0.6, r * 0.09, 0, TAU); c.fillStyle = '#c87a3a'; c.fill(); c.restore();
        });
        add(c, 1); motes(c, t, 6, 3, -14, 26, 21, 54, 0.5, 1.5, '#ffd24a', 2.5); motes(c, t, 4, 11, -10, 20, 18, 40, 0.7, 1.1, '#ff6a1a', 3); c.restore();
        c.save(); c.translate(0, b);
        // výbuch plamenů (schopnost)
        if (act) {
          add(c, 0.9); c.beginPath();
          for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * 0.8; flame(c, cos(a) * 17, -5 + sin(a) * 17, 4, 15 + sin(t * 10 + i * 2.3) * 4, a, sin(t * 12 + i) * 2.5); }
          c.fillStyle = K.rg(c, 0, -5, 12, 40, [[0, '#fff6c0'], [0.45, '#ffb02a'], [1, 'rgba(255,40,10,0)']]); c.fill();
          c.globalAlpha = 0.7; c.beginPath(); c.arc(0, -5, 34 + (t * 30) % 8, 0, TAU); K.stroke(c, '#ffe08a', 1.5); c.restore();
        }
        // ocasní pera s „pávími očky“
        for (let i = 0; i < 3; i++) {
          const pts = spine(-11, 4, PI * (0.7 + i * 0.12), 28 + i * 3, 0.55 + i * 0.1, 8, k => sin(t * 3.2 - k * 3 + i * 1.3) * 0.16 * k);
          const s = pts[0], e = pts[8], p = pts[7], ea = Math.atan2(e[1] - p[1], e[0] - p[0]);
          ribbon(c, pts, k => 1.6 + 4.6 * sin(PI * (0.15 + k * 0.7)));
          K.fill(c, K.lg(c, s[0], s[1], e[0], e[1], ['#a8141a', '#ff5a1a', '#ffb02a', '#ffe48a']), 1.2);
          c.beginPath(); thru(c, pts.slice(1, 8), true); K.stroke(c, 'rgba(255,240,170,.75)', 0.6);
          add(c, 0.85); c.beginPath(); flame(c, e[0], e[1], 2.4, 9 + sin(t * 9 + i * 2) * 2.5, ea, sin(t * 11 + i) * 1.6); c.fillStyle = K.lg(c, e[0], e[1], e[0] + cos(ea) * 11, e[1] + sin(ea) * 11, ['#fff2a0', 'rgba(255,90,20,0)']); c.fill(); c.restore();
          c.beginPath(); c.ellipse(e[0], e[1], 3.4, 2.6, ea, 0, TAU); K.fill(c, '#ffe24a', 1);
          c.beginPath(); c.ellipse(e[0], e[1], 1.9, 1.5, ea, 0, TAU); c.fillStyle = '#2a8acf'; c.fill();
          c.beginPath(); c.arc(e[0], e[1], 0.8, 0, TAU); c.fillStyle = '#1b1420'; c.fill();
        }
        // pařátky
        c.beginPath(); [-3, 4].forEach(x => { c.moveTo(x, 11); c.lineTo(x - 1.8, 16); c.moveTo(x, 11); c.lineTo(x + 1.6, 16.5); c.moveTo(x, 11); c.lineTo(x, 17); });
        K.stroke(c, OUT, 2.8); K.stroke(c, '#ffb02a', 1.4);
        const WC = [[0, '#b81e1a'], [0.4, '#ff5a1a'], [0.75, '#ffa82a'], [1, '#fff0a0']];
        const flames = (tips, sc) => {
          c.beginPath(); tips.forEach((p, i) => flame(c, p[0] - cos(p[2]) * 2, p[1] - sin(p[2]) * 2, 2.2 * sc, (8 + sin(t * 10 + i * 1.9) * 2.2) * sc, p[2] - 0.15, sin(t * 13 + i) * 1.6));
          c.fillStyle = 'rgba(255,190,50,.92)'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = 'rgba(200,40,20,.9)'; c.stroke();
          add(c, 0.7); c.beginPath(); tips.forEach((p, i) => flame(c, p[0], p[1], 1 * sc, (4.5 + sin(t * 10 + i * 1.9)) * sc, p[2] - 0.15, 0)); c.fillStyle = '#fff2b0'; c.fill(); c.restore();
        };
        // zadní křídlo
        const wa1 = act ? -PI * 0.56 : -PI * 0.8 + fl * 0.26, sc1 = act ? 1.3 : 1;
        const t1 = wingF(c, -2, -10, wa1, sc1, 6, K.rg(c, -2, -10, 3, 28 * sc1, [[0, '#8a141a'], [0.45, '#d8401a'], [0.8, '#f08a2a'], [1, '#ffd27a']]), 0.95, k => 13 + k * 11);
        flames(t1, sc1);
        // hřebínek z plamenů
        const hx = 10, hy = -14;
        c.beginPath();
        for (let j = 0; j < 5; j++) { const a = -PI * (0.4 + j * 0.13), bx = hx + cos(a) * 8, by = hy + sin(a) * 8; flame(c, bx, by, 3.4 - j * 0.25, 12 + j * 1.6 + sin(t * 8 + j * 2) * 2 + (act ? 6 : 0), a - 0.35, sin(t * 9 + j * 1.7) * 2.2); }
        K.fill(c, K.rg(c, hx, hy, 6, 32, [[0, '#ffe680'], [0.4, '#ff8a1a'], [1, '#c8141a']]), 1.2);
        c.save(); c.globalAlpha = 0.9; c.beginPath();
        for (let j = 0; j < 5; j++) { const a = -PI * (0.4 + j * 0.13), bx = hx + cos(a) * 9, by = hy + sin(a) * 9; flame(c, bx, by, 1.6, 7 + j + sin(t * 8 + j * 2) * 1.5 + (act ? 4 : 0), a - 0.35, sin(t * 9 + j * 1.7) * 1.4); }
        c.fillStyle = '#ffe680'; c.fill(); c.restore();
        // tělo + hlava
        uni(c, () => { c.ellipse(-1, 1, 15, 13, 0, 0, TAU); c.moveTo(21, -14); c.arc(10, -14, 11, 0, TAU); },
          K.rg(c, 6, -14, 2, 30, [[0, '#ffe9a0'], [0.3, '#ffa22a'], [0.7, '#f0501a'], [1, '#a8201a']], 12, -18), LW);
        c.beginPath(); c.ellipse(4, 4, 9.5, 8.5, -0.3, 0, TAU); c.fillStyle = K.lg(c, 4, -4, 4, 12, ['#fff6c8', '#ffc85a']); c.fill();
        c.beginPath(); for (let r = 0; r < 3; r++) for (let j = 0; j < 3 - (r === 2 ? 1 : 0); j++) { const x = 0 + j * 4 + r * 1.5, y = 0 + r * 3.6; c.moveTo(x + 1.8, y); c.arc(x, y, 1.8, 0, PI); }
        K.stroke(c, 'rgba(232,120,30,.7)', 0.7);
        c.beginPath(); c.arc(10, -14, 9.6, -1.25, -0.15); K.stroke(c, 'rgba(255,250,210,.85)', 1.2);
        // znak u oka + oko + zobák
        c.beginPath(); c.moveTo(8.6, -16.6); c.quadraticCurveTo(4, -20.5, -2.5, -21); c.quadraticCurveTo(3, -17.6, 8.4, -14.6); c.closePath(); c.fillStyle = '#c8201a'; c.fill();
        K.eye(c, 14.5, -15, 4.5, '#ff9a1a', 0.35, act ? 0 : bl);
        if (act) { c.beginPath(); c.moveTo(10.5, -20.5); c.lineTo(17.5, -19); K.stroke(c, OUT, 1.4); }
        c.beginPath(); c.moveTo(20, -11.5); c.lineTo(25.5, act ? -7.5 : -10.5); c.lineTo(20.5, act ? -7.5 : -9); c.closePath(); K.fill(c, '#d8861a', 1);
        c.beginPath(); c.moveTo(19.5, -16.8); c.quadraticCurveTo(25.5, -17.2, 28, -12.2); c.quadraticCurveTo(25, -12.4, 20, -11.2); c.closePath(); K.fill(c, K.lg(c, 20, -17, 26, -11, GOLD), 1.2);
        K.blush(c, 15.5, -8.8, 2.6);
        // přední křídlo
        const wa2 = act ? -PI * 0.92 : -PI * 0.93 + sin(t * 6.5 + 0.4) * 0.26, sc2 = act ? 1.15 : 0.9;
        const t2 = wingF(c, -4, -3, wa2, sc2, 6, K.rg(c, -5, -4, 3, 26 * sc2, [[0, '#ff7a1a'], [0.45, '#ff9a2a'], [0.8, '#ffc84a'], [1, '#fff4b0']]), 0.95, k => 11 + k * 11);
        c.beginPath(); c.ellipse(-3 + cos(wa2) * 4, -3 + sin(wa2) * 4, 7 * sc2, 5 * sc2, wa2, 0, TAU); K.fill(c, '#ff8a2a', 1.1);
        flames(t2, sc2);
        if (act) { K.glow(c, 4, -8, 26, '#fff2a0', 0.55); add(c, 1); motes(c, t, 6, 21, -16, 36, 8, 40, 1.2, 1.6, '#c8ff8a', 4); c.restore(); }
        c.restore();
      },

      /* ---------------- DUHA – létající duhový jednorožec ---------------- */
      duha(c, t, act) {
        const b = sin(t * 2.4) * 2, bl = blinkAt(t, 1.1);
        const RB = ['#ff4a5a', '#ff9a3a', '#ffe04a', '#5ad86a', '#4ab0ff', '#a06aff'];
        c.save(); c.translate(0, b - (act ? 2 : 0)); c.rotate(act ? -0.2 : -0.04 + sin(t * 2.4 + 1) * 0.03);
        // duhová stopa
        c.lineCap = 'butt';
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          for (let x = -14; x >= -50; x -= 4) { const u = (-x - 14) / 36, y = -4 + (i - 2.5) * 2.3 + sin(t * 3.4 + x * 0.14) * 3 * u + u * 9; x === -14 ? c.moveTo(x, y) : c.lineTo(x, y); }
          c.strokeStyle = K.lg(c, -14, 0, -50, 0, [[0, RB[i]], [0.6, RB[i]], [1, 'rgba(255,255,255,0)']]); c.lineWidth = 2.5; c.stroke();
        }
        add(c, 1); for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + R(i + 70)) % 1, x = -18 - ph * 30, y = -6 + R(i + 71) * 12 + ph * 8; c.globalAlpha = 1 - ph; K.sparkle(c, x, y, 1.2 + (1 - ph) * 1.8, '#ffffff'); } c.restore();
        // ocas z duhových pramenů
        for (let i = 0; i < 6; i++) {
          const pts = spine(-16, -4 + i * 0.7, PI * 0.95 - i * 0.04, 20 + (i % 3) * 3, 0.55 - i * 0.12, 7, k => sin(t * 4 - k * 4 + i * 0.6) * 0.28 * k);
          ribbon(c, pts, k => 4.4 * (1 - k * 0.75)); K.fill(c, RB[i], 0.9, K.dark(RB[i], 0.5));
        }
        const leg = (x, y, a, bend, len, fill) => {
          const p = spine(x, y, a, len, bend, 4), e = p[4], q = p[3];
          ribbon(c, p, k => 5.4 - k * 1.6); K.fill(c, fill, 1.2);
          c.beginPath(); c.ellipse(e[0], e[1], 2.5, 2.2, Math.atan2(e[1] - q[1], e[0] - q[0]), 0, TAU); K.fill(c, K.lg(c, e[0] - 2, e[1] - 2, e[0] + 2, e[1] + 2, GOLD), 1.1);
        };
        const PEARL = K.lg(c, 0, -10, 0, 22, ['#ffffff', '#e2d6f8']), PEARL2 = K.lg(c, 0, -10, 0, 22, ['#e6dcf6', '#b8a6e0']);
        // vzdálené nohy + křídlo
        leg(-13, 3, act ? PI * 0.62 : PI * 0.8, 0.5, 13, PEARL2);
        leg(9, 4, act ? -0.5 : PI * 0.3, act ? 1.2 : 1.9, 12, PEARL2);
        const fw = act ? -PI * 0.58 : -PI * 0.7 + sin(t * 5) * 0.35;
        wingF(c, 5, -10, fw, 0.95, 6, K.rg(c, 5, -10, 3, 27, [[0, '#e8dcff'], [0.5, '#e0b8f0'], [0.85, '#a8b8ff'], [1, '#90d0ff']]), 1.1, k => 12 + k * 12);
        // ucho
        c.beginPath(); c.moveTo(13, -25); c.quadraticCurveTo(11.5, -33, 14.5, -35); c.quadraticCurveTo(18.5, -31, 18, -25.5); c.closePath(); K.fill(c, PEARL, 1.2);
        c.beginPath(); c.moveTo(14.2, -27); c.quadraticCurveTo(13.8, -31.5, 14.8, -32.5); c.quadraticCurveTo(16.5, -30, 16.5, -27); c.fillStyle = '#ffb8e0'; c.fill();
        // tělo + krk + hlava
        uni(c, () => {
          c.ellipse(-2, -1, 17, 10.5, -0.05, 0, TAU);
          c.moveTo(5, -6); c.quadraticCurveTo(9, -20, 15, -26); c.lineTo(23, -21); c.quadraticCurveTo(17, -10, 14, 4); c.closePath();
          c.moveTo(26.5, -20); c.arc(18, -20, 8.5, 0, TAU);
          c.moveTo(31.3, -12.6); c.ellipse(26, -15, 5.8, 4.6, 0.45, 0, TAU);
        }, K.rg(c, 14, -18, 2, 34, [[0, '#ffffff'], [0.55, '#f6f0ff'], [1, '#cdbdf0']]), LW);
        c.beginPath(); c.ellipse(-3, 4.5, 14, 4.5, 0, 0, PI); c.fillStyle = 'rgba(160,130,225,.28)'; c.fill();
        K.star(c, -9, -2.5, 3.4, '#ff8ad0'); K.sparkle(c, -4.5, -5, 1.6, '#ffd84a');
        // blízké nohy
        leg(-10, 5, act ? PI * 0.55 : PI * 0.72, 0.3, 14, PEARL);
        leg(13, 5, act ? -0.3 : PI * 0.42, act ? 1.3 : 1.7, 13, PEARL);
        // hříva
        for (let i = 0; i < 6; i++) {
          const pts = spine(13.5 + i * 1.3, -30 + i * 1.6, PI * 0.8, 24 - i * 1.5, 0.35, 8, k => sin(t * 4.4 - k * 4.5) * 0.3 * k);
          ribbon(c, pts, k => 4.2 * (1 - k * 0.7)); K.fill(c, RB[i], 0.9, K.dark(RB[i], 0.5));
        }
        c.beginPath(); thru(c, spine(14, -29.6, PI * 0.8, 20, 0.35, 6, k => sin(t * 4.4 - k * 4.5) * 0.3 * k), true); K.stroke(c, 'rgba(255,255,255,.6)', 0.8);
        // roh
        const hx = 21, hy = -27, ha = -PI * 0.36 - (act ? 0.08 : 0), hl = 15, ca = cos(ha), sa = sin(ha), nx = -sa, ny = ca, tx = hx + ca * hl, ty = hy + sa * hl;
        c.beginPath(); c.moveTo(hx + nx * 2.8, hy + ny * 2.8); c.lineTo(tx, ty); c.lineTo(hx - nx * 2.8, hy - ny * 2.8); c.closePath();
        K.fill(c, K.lg(c, hx + nx * 3, hy + ny * 3, hx - nx * 3, hy - ny * 3, ['#fff8dc', '#ffd84a', '#c8861a']), 1.2);
        c.beginPath(); for (let j = 1; j < 5; j++) { const k = j / 5.3, w = 2.8 * (1 - k); c.moveTo(hx + ca * hl * k + nx * w, hy + sa * hl * k + ny * w); c.lineTo(hx + ca * hl * (k + 0.09) - nx * w * 0.9, hy + sa * hl * (k + 0.09) - ny * w * 0.9); }
        K.stroke(c, '#a8661a', 0.7);
        // čupřina
        [[RB[0], 0], [RB[4], 1], [RB[2], 2]].forEach(([col, j]) => { const pts = spine(18 + j * 1.5, -28 + j * 0.5, -0.4 + j * 0.2, 7 - j, 1.6, 4, k => sin(t * 4 + j) * 0.15 * k); ribbon(c, pts, k => 3.6 * (1 - k * 0.8)); K.fill(c, col, 0.8, K.dark(col, 0.5)); });
        // obličej
        K.eye(c, 21.5, -19.5, 3.9, '#8a4ae8', 0.4, bl);
        c.beginPath(); c.moveTo(23.6, -23.3); c.lineTo(25.4, -25.2); c.moveTo(24.9, -22.1); c.lineTo(27.2, -23.4); K.stroke(c, OUT, 1);
        c.beginPath(); c.ellipse(29.6, -15.2, 0.9, 0.6, 0.5, 0, TAU); c.fillStyle = OUT; c.fill();
        c.beginPath(); c.arc(27, -13.5, 2.4, 0.5, 2.0); K.stroke(c, OUT, 0.9);
        K.blush(c, 24, -14.2, 2.2);
        // blízké křídlo
        const nw = act ? -PI * 0.86 : -PI * 0.8 + sin(t * 5 + 0.35) * 0.38;
        wingF(c, 1, -7, nw, 1.08, 7, K.rg(c, 1, -7, 3, 30, [[0, '#ffffff'], [0.45, '#fff0fa'], [0.75, '#ffc8ec'], [1, '#b8d8ff']]), 1.2, k => 12 + k * 13);
        c.beginPath(); c.ellipse(1 + cos(nw) * 4, -7 + sin(nw) * 4, 7.5, 4.8, nw, 0, TAU); K.fill(c, '#ffffff', 1.1);
        // jiskra na rohu
        add(c, 1); K.sparkle(c, tx, ty, 2.6 + sin(t * 5) * 1.2 + (act ? 3 : 0), '#ffffff'); c.restore();
        K.glow(c, tx, ty, act ? 14 : 7, '#fff4c0', act ? 0.9 : 0.6);
        c.restore();
        // duhová bariéra
        if (act) {
          const cx = 6, cy = -8;
          c.save(); c.globalAlpha = 0.2; c.beginPath(); c.arc(cx, cy, 39, -1.45, 1.1); c.lineWidth = 14; c.strokeStyle = '#ffffff'; c.stroke();
          c.globalAlpha = 0.9; c.lineWidth = 1.6; RB.forEach((col, i) => { c.beginPath(); c.arc(cx, cy, 33.5 + i * 1.7, -1.45, 1.1); c.strokeStyle = col; c.stroke(); });
          c.restore();
          add(c, 1); for (let i = 0; i < 6; i++) { const a = -1.4 + i * 0.5, tw = 0.5 + 0.5 * sin(t * 6 + i * 2); c.globalAlpha = tw; K.sparkle(c, cx + cos(a) * 38, cy + sin(a) * 38, 2 + tw * 2.5, '#ffffff'); } c.restore();
        }
      },

      /* ---------------- KITSUNE – devítiocasá liška ---------------- */
      kitsune(c, t, act) {
        const bl = blinkAt(t, 2.2);
        const wisp = (x, y, s, ph) => {
          c.beginPath(); c.arc(x, y - 2 * s, 8 * s, 0, TAU); c.fillStyle = K.rg(c, x, y - 2 * s, 0, 8 * s, ['rgba(70,170,255,.35)', 'rgba(70,170,255,0)']); c.fill();
          c.beginPath(); flame(c, x, y, 3.2 * s, 10 * s + sin(t * 9 + ph) * 1.5 * s, -PI / 2 + sin(t * 4 + ph) * 0.3, sin(t * 7 + ph) * 2.6 * s);
          flame(c, x - 2 * s, y + 0.5 * s, 1.8 * s, 7 * s + sin(t * 11 + ph) * s, -PI / 2 - 0.5, sin(t * 8 + ph) * 1.2 * s); flame(c, x + 2 * s, y + 0.5 * s, 1.6 * s, 6 * s + sin(t * 10 + ph) * s, -PI / 2 + 0.5, sin(t * 9 + ph) * 1.2 * s);
          c.fillStyle = K.rg(c, x, y - 1.5 * s, 0.3, 11 * s, [[0, '#ffffff'], [0.25, '#8af0ff'], [0.6, 'rgba(40,140,255,.95)'], [1, 'rgba(130,70,255,.2)']]); c.fill(); c.lineWidth = 0.7; c.strokeStyle = 'rgba(30,70,180,.7)'; c.stroke();
          c.beginPath(); c.arc(x, y + 0.5 * s, 1.5 * s, 0, TAU); c.fillStyle = '#ffffff'; c.fill();
        };
        const orb = [0, 1].map(i => { const o = t * 1.3 + i * PI; return [-2 + cos(o) * 32, -14 + sin(o) * 9, sin(o)]; });
        if (!act) orb.forEach(o => { if (o[2] < 0) wisp(o[0], o[1], 0.8, o[0]); });
        // magický kruh
        if (act) {
          add(c, 0.9); c.beginPath(); c.ellipse(2, 24, 28, 6, 0, 0, TAU); c.moveTo(25, 24); c.ellipse(2, 24, 23, 4.8, 0, 0, TAU); K.stroke(c, '#6ae8ff', 1.2);
          c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 0.6; c.moveTo(2 + cos(a) * 23, 24 + sin(a) * 4.8); c.lineTo(2 + cos(a) * 28, 24 + sin(a) * 6); } K.stroke(c, '#b8f4ff', 0.8); c.restore();
        }
        // devět ocasů
        const N = 9, sp = act ? 1.15 : 1, tipsArr = [];
        [0, 8, 1, 7, 2, 6, 3, 5, 4].forEach(i => {
          const k0 = i / (N - 1), a = -PI * (0.46 + k0 * 0.66 * sp);
          const pts = spine(-10, 8, a, 31 + (i % 2) * 2, (k0 - 0.4) * 1.2, 9, k => sin(t * 2.2 + i * 0.8 - k * 2.5) * 0.24 * k);
          const s = pts[0], e = pts[9];
          ribbon(c, pts, k => 3 + 9 * sin(PI * (0.1 + 0.75 * k)));
          K.fill(c, K.lg(c, s[0], s[1], e[0], e[1], [[0, '#c8401a'], [0.4, '#ff8a3a'], [0.7, '#ffc27a'], [0.84, '#fff4e4'], [1, '#ffffff']]), 1.2);
          c.beginPath(); const m = pts[5], q = pts[7]; c.moveTo(m[0], m[1]); c.quadraticCurveTo(pts[6][0], pts[6][1], q[0], q[1]); K.stroke(c, 'rgba(255,255,255,.55)', 1.1);
          tipsArr.push([e, Math.atan2(e[1] - pts[8][1], e[0] - pts[8][0]), i]);
        });
        // ohníčky na špičkách ocasů
        c.beginPath();
        tipsArr.forEach(([e, ea, i]) => { if (act || i % 2) flame(c, e[0] + cos(ea) * 1.5, e[1] + sin(ea) * 1.5, 2.2, 7 + sin(t * 9 + i * 1.3) * 2 + (act ? 4 : 0), -PI / 2 + (ea + PI / 2) * 0.35, sin(t * 11 + i) * 1.8); });
        c.fillStyle = 'rgba(60,170,255,.85)'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = 'rgba(20,60,160,.8)'; c.stroke();
        add(c, 0.9); c.beginPath(); tipsArr.forEach(([e, ea, i]) => { if (act || i % 2) flame(c, e[0] + cos(ea) * 1.5, e[1] + sin(ea) * 1.5, 1, 4 + sin(t * 9 + i * 1.3), -PI / 2 + (ea + PI / 2) * 0.35, 0); }); c.fillStyle = '#c8f8ff'; c.fill(); c.restore();
        // vzdálená noha + uši
        c.beginPath(); const lp = spine(5.5, 5, PI * 0.5, 16, 0, 2); ribbon(c, lp, () => 5); K.fill(c, K.lg(c, 0, 5, 0, 22, [[0, '#d8601a'], [0.55, '#b8481a'], [1, '#2a1410']]), 1.2);
        const ear = (x1, y1, x2, y2, x3, y3) => {
          c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(x2 - 2.5, y2 + 5, x2, y2); c.quadraticCurveTo(x2 + 3, y2 + 6, x3, y3); c.closePath();
          K.fill(c, K.lg(c, (x1 + x3) / 2, y1, x2, y2, [[0, '#ff8a3a'], [0.55, '#e8601a'], [1, '#3a1410']]), LW);
          c.beginPath(); c.moveTo(x1 + 1.5, y1 - 0.5); c.quadraticCurveTo(x2 - 0.5, y2 + 6, x2 + 0.3, y2 + 4); c.quadraticCurveTo(x2 + 1.5, y2 + 7, x3 - 1.5, y3 - 0.5); c.closePath(); c.fillStyle = '#fff0e0'; c.fill();
        };
        const tw = sin(t * 1.7) > 0.93 ? 0.15 : 0;
        ear(6.5, -21, 4.5, -37, 12.5, -25); ear(12, -24.5, 18.5 + tw * 6, -38, 20.5, -20.5);
        // tělo
        uni(c, () => {
          c.ellipse(-4, 10, 12, 11, 0, 0, TAU);
          c.moveTo(16, 0); c.ellipse(7, 0, 9, 13, -0.25, 0, TAU);
          c.moveTo(22, -16); c.arc(12, -16, 10, 0, TAU);
          c.moveTo(29, -12.5); c.ellipse(21, -12.5, 8, 4.6, 0.12, 0, TAU);
        }, K.rg(c, 12, -16, 2, 32, [[0, '#ffc27a'], [0.45, '#ff8a3a'], [1, '#c8481a']], 15, -20), LW);
        // bílé náprsenka a líce
        c.beginPath(); c.moveTo(13.5, -9); c.lineTo(16, -3); c.lineTo(13.8, -1.5); c.lineTo(15.2, 3.5); c.lineTo(12.5, 5); c.lineTo(13, 9.5); c.lineTo(9.5, 9); c.quadraticCurveTo(5, 3, 7, -5); c.closePath();
        c.fillStyle = K.lg(c, 8, -8, 14, 10, ['#ffffff', '#ffe8d4']); c.fill();
        c.beginPath(); c.moveTo(9, -12); c.lineTo(3.5, -10.5); c.lineTo(6.5, -8.5); c.lineTo(3, -6); c.lineTo(8, -6.5); c.quadraticCurveTo(16, -6, 22, -8.5); c.quadraticCurveTo(27, -9.8, 28.6, -11.6); c.quadraticCurveTo(20, -11, 9, -12); c.fillStyle = '#fff8f0'; c.fill();
        // provaz shimenawa se zvonkem
        c.beginPath(); c.moveTo(4, -7.5); c.quadraticCurveTo(10, -3, 16.5, -6.5); K.stroke(c, OUT, 4.4); K.stroke(c, '#f4ecdc', 3);
        c.beginPath(); for (let j = 0; j < 5; j++) { const u = j / 4.5, x = 4.6 + u * 11.4, y = -7.2 + sin(u * PI) * 3.3; c.moveTo(x - 0.9, y - 1.2); c.lineTo(x + 0.9, y + 1.2); } K.stroke(c, '#d81e3a', 1);
        c.beginPath(); c.moveTo(6.5, -5); c.lineTo(5, -1); c.lineTo(7, -1.5); c.lineTo(5.6, 2.5); K.stroke(c, OUT, 2.2); K.stroke(c, '#ffffff', 1.1);
        c.beginPath(); c.arc(11.5, -2.2, 2.6, 0, TAU); K.fill(c, K.rg(c, 11, -3, 0, 3, GOLD), 1); c.beginPath(); c.moveTo(11.5, -1.5); c.lineTo(11.5, 0.3); K.stroke(c, OUT, 0.8);
        // blízká noha + zadní tlapa
        c.beginPath(); c.ellipse(-6, 20.5, 6.5, 3.2, 0, 0, TAU); K.fill(c, K.lg(c, 0, 17, 0, 24, ['#e8601a', '#3a1a12']), 1.2);
        const lp2 = spine(11.5, 6, PI * 0.5, 16, 0, 2); ribbon(c, lp2, () => 5.4); K.fill(c, K.lg(c, 0, 5, 0, 23, [[0, '#ff8a3a'], [0.55, '#d8601a'], [1, '#2a1410']]), 1.2);
        // kresba kumadori
        c.beginPath(); c.moveTo(10, -20); c.quadraticCurveTo(15, -24.5, 21, -21); c.quadraticCurveTo(15, -22.2, 11, -18.8); c.closePath();
        c.moveTo(14, -12.5); c.quadraticCurveTo(10, -11.5, 5.5, -14.5); c.quadraticCurveTo(10, -13, 14, -13.6); c.closePath(); c.fillStyle = '#d81e3a'; c.fill();
        c.beginPath(); flame(c, 12, -23.5, 1.4, 5, -PI / 2 - 0.2, sin(t * 3) * 0.4); K.fill(c, K.lg(c, 12, -23, 12, -29, ['#d81e3a', '#ffcf4a']), 0.7);
        // oko, nos, tlama
        K.eye(c, 16, -16.8, 3.6, act ? '#7af0ff' : '#ffc21a', 0.45, bl);
        c.beginPath(); c.arc(16, -16.8, 3.9, -PI * 0.98, -PI * 0.12); K.stroke(c, OUT, 1.5);
        c.beginPath(); c.moveTo(19.5, -18.6); c.lineTo(22.2, -20.4); K.stroke(c, '#d81e3a', 1.1);
        c.beginPath(); c.ellipse(28.6, -13.6, 1.7, 1.3, 0, 0, TAU); c.fillStyle = OUT; c.fill(); K.gloss(c, 28.1, -14.1, 0.6, 0.4, 0, 0.8);
        c.beginPath(); c.moveTo(28, -11.8); c.quadraticCurveTo(25, -9.4, 21.8, -10.6); K.stroke(c, OUT, 1);
        c.beginPath(); c.arc(12, -16, 9.2, -1.4, -0.35); K.stroke(c, 'rgba(255,240,200,.8)', 1.1);
        if (act) {
          K.glow(c, 16, -17, 9, '#7af0ff', 0.7);
          [[32, -28, 0], [39, -9, 2], [30, 9, 4]].forEach(([x, y, ph]) => wisp(x + sin(t * 3 + ph) * 1.5, y + cos(t * 2.5 + ph) * 2, 1.5, ph));
        } else orb.forEach(o => { if (o[2] >= 0) wisp(o[0], o[1], 0.8, o[0]); });
      },

      /* ---------------- HAVRAN – kostěný havran ---------------- */
      havran(c, t, act) {
        const fl = sin(t * 3.2), BONE = '#efe6cf', BONE2 = '#c8b898';
        // přízračná mlha u nohou
        add(c, 0.45); c.fillStyle = '#7a4aff';
        for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(-14 + i * 9 + sin(t * 1.2 + i) * 3, 23 - (i % 2) * 1.5, 8 + sin(t * 2 + i) * 1.5, 2.8, 0, 0, TAU); c.fill(); }
        c.restore();
        // nekromantský kruh + ruka (schopnost)
        if (act) {
          add(c, 0.95); c.beginPath(); c.ellipse(6, 24, 32, 7, 0, 0, TAU); K.stroke(c, '#ff2a4a', 1.5);
          c.beginPath(); c.ellipse(6, 24, 26, 5.6, 0, 0, TAU); K.stroke(c, '#b04aff', 1);
          c.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - t * 0.8, x = 6 + cos(a) * 29, y = 24 + sin(a) * 6.3; c.moveTo(x - 1.2, y - 1); c.lineTo(x, y + 1); c.lineTo(x + 1.2, y - 1); } K.stroke(c, '#ff8aa0', 0.8);
          motes(c, t, 7, 31, -18, 48, 24, 46, 0.9, 1.6, '#c87aff', 3);
          // kostlivá ruka ze země
          const hy = 22 - ((t * 0.8) % 1) * 3;
          c.globalAlpha = 0.9; c.beginPath(); c.moveTo(30, 24); c.lineTo(30.5, hy - 6); c.moveTo(27.5, hy - 6); c.lineTo(25.5, hy - 13); c.moveTo(29.5, hy - 7); c.lineTo(29, hy - 15); c.moveTo(31.5, hy - 7); c.lineTo(32.5, hy - 14.5); c.moveTo(33, hy - 6); c.lineTo(35.5, hy - 11.5); c.moveTo(27, hy - 4); c.lineTo(23.5, hy - 7);
          K.stroke(c, '#8affc8', 1.6); c.beginPath(); c.ellipse(30.3, hy - 5, 3.4, 2.4, 0, 0, TAU); c.fillStyle = '#8affc8'; c.fill();
          c.restore();
        }
        // křídlo z kostí a přízračných per
        const wingB = (sx, sy, aU, sc, dim) => {
          const aF = aU - 0.55 + (act ? -0.2 : 0), aH = aF - 0.45;
          const ex = sx + cos(aU) * 11 * sc, ey = sy + sin(aU) * 11 * sc, wx = ex + cos(aF) * 13 * sc, wy = ey + sin(aF) * 13 * sc, hx = wx + cos(aH) * 12 * sc, hy = wy + sin(aH) * 12 * sc;
          const off = aU + PI * 0.8;
          c.beginPath();
          for (let i = 0; i < 9; i++) {
            const k = i / 8, px = k < 0.5 ? ex + (wx - ex) * k * 2 : wx + (hx - wx) * (k - 0.5) * 2, py = k < 0.5 ? ey + (wy - ey) * k * 2 : wy + (hy - wy) * (k - 0.5) * 2;
            const fa = PI * (0.62 + k * 0.43) + off * 0.9 + (act ? -0.25 * k : 0), len = (12 + k * 10) * sc;
            leaf(c, px, py, fa, len, 3.6 * sc, 0.5); leaf(c, px, py, fa + 0.14, len * 0.8, 2.6 * sc, 0.5);
          }
          c.fillStyle = K.rg(c, wx, wy, 2, 26 * sc, dim ? [[0, '#2a1838'], [0.6, '#1a0e24'], [1, 'rgba(70,30,120,.35)']] : [[0, '#4a2a6a'], [0.55, '#28163a'], [1, 'rgba(110,50,190,.4)']]);
          c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(13,10,18,.9)'; c.stroke();
          const col = dim ? BONE2 : BONE;
          bone(c, [[sx, sy], [ex, ey]], 2.6 * sc, col); bone(c, [[ex, ey], [wx, wy]], 2.1 * sc, col); bone(c, [[wx, wy], [hx, hy]], 1.6 * sc, col);
          knob(c, ex, ey, 1.9 * sc, col); knob(c, wx, wy, 1.7 * sc, col); knob(c, sx, sy, 2 * sc, col);
        };
        wingB(1, -11, act ? -PI * 0.55 : -PI * 0.68 + fl * 0.22, act ? 1.2 : 1, true);
        // ocasní kosti
        for (let i = 0; i < 5; i++) {
          const a = PI * (0.78 + i * 0.06) + sin(t * 2 + i) * 0.04, x2 = -12 + cos(a) * 18, y2 = 6 + sin(a) * 18;
          c.beginPath(); leaf(c, -12 + cos(a) * 6, 6 + sin(a) * 6, a, 14, 4.2, 0.5); c.fillStyle = 'rgba(40,22,60,.9)'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = OUT; c.stroke();
          bone(c, [[-12, 6], [x2, y2]], 1.2, BONE2);
        }
        // nohy
        [[-4, BONE2], [3, BONE]].forEach(([x, col]) => {
          bone(c, [[x, 6], [x + 1, 15], [x + 2.5, 22]], 1.8, col); knob(c, x + 1, 15, 1.5, col);
          c.beginPath(); c.moveTo(x + 2.5, 22); c.lineTo(x + 8, 24); c.moveTo(x + 2.5, 22); c.lineTo(x + 5, 25); c.moveTo(x + 2.5, 22); c.lineTo(x - 2, 24.5);
          K.stroke(c, OUT, 3); K.stroke(c, col, 1.5);
        });
        // přízračné tělo
        c.beginPath(); c.ellipse(-1, -1, 13.5, 11, -0.35, 0, TAU); K.fill(c, K.rg(c, 2, -4, 1, 16, [[0, '#4a2a62'], [0.7, '#22122e'], [1, '#140a1c']]), LW);
        // duše v hrudi
        const pu = 1 + sin(t * 5) * 0.12 + (act ? 0.25 : 0);
        K.glow(c, 2, 0, 11 * pu, '#ff2a2a', 0.7);
        c.beginPath(); heart(c, 2, 0.5, 4 * pu); c.fillStyle = K.rg(c, 1, -1, 0, 5 * pu, ['#ffe0c0', '#ff3a2a', '#9a0a1a']); c.fill();
        // páteř + žebra + hrudní kost
        c.beginPath(); for (let i = 0; i < 6; i++) { const u = i / 5, x = 6 - u * 19, y = -11 + u * 14 + sin(u * PI) * -1.5; c.moveTo(x + 1.6, y); c.arc(x, y, 1.6, 0, TAU); } K.fill(c, BONE2, 0.9);
        for (let i = 0; i < 5; i++) {
          const u = i / 4, x = 3.5 - u * 12, y = -9.5 + u * 10.5, kx = 9 - u * 6, ky = -2 + u * 9;
          bone(c, [[x, y], [x + 4 + u * 2, y + 1 - u], [kx, ky]], 1.3, BONE);
        }
        bone(c, [[10, -5], [10.5, 2], [5, 9]], 2, BONE);
        // roztrhaná karmínová šála
        { const sp = spine(7, -9, PI * 0.92, 15, 0.35, 5, k => sin(t * 4 - k * 4) * 0.3 * k), r = ribbon(c, sp, k => 4.4 - k * 1.2), e = sp[5];
          c.moveTo(e[0] + 1, e[1] - 1.5); c.lineTo(e[0] - 3, e[1] + 1.5); c.lineTo(e[0] - 0.5, e[1] + 0.5); c.lineTo(e[0] - 2.5, e[1] + 3.5); c.lineTo(e[0] + 1.5, e[1] + 1.5); c.closePath();
          K.fill(c, K.lg(c, 7, -9, e[0], e[1], ['#c8203a', '#6a0a1e']), 1.1); }
        c.beginPath(); c.moveTo(4.5, -11); c.quadraticCurveTo(9, -6.5, 13, -10.5); K.stroke(c, OUT, 4.6); K.stroke(c, '#b81a32', 3);
        // obratle krku
        [[7, -9], [9, -12], [10.5, -15]].forEach(([x, y]) => knob(c, x, y, 2, BONE));
        // lebka
        c.save(); c.translate(12, -18 + sin(t * 2) * 0.6); c.rotate(act ? -0.28 : sin(t * 1.3) * 0.07);
        c.beginPath(); for (let j = 0; j < 3; j++) flame(c, -4 - j * 2.2, -4 + j * 1.5, 2.3, 10 + j * 2 + sin(t * 5 + j) * 2, -PI * 0.88 - j * 0.22, sin(t * 6 + j) * 2);
        K.fill(c, K.lg(c, 0, 0, -16, -6, ['#3a2050', 'rgba(110,60,190,.5)']), 1);
        c.save(); c.translate(2, 3); c.rotate(act ? 0.38 : 0); c.translate(-2, -3);
        c.beginPath(); c.moveTo(2, 3); c.quadraticCurveTo(12, 6.2, 21.5, 5.6); c.lineTo(20.5, 7.2); c.quadraticCurveTo(11, 8.8, 0.5, 6.2); c.closePath(); K.fill(c, K.lg(c, 0, 3, 0, 9, [BONE, BONE2]), 1.2);
        c.restore();
        if (act) { c.beginPath(); c.moveTo(4, 4); c.lineTo(18, 6); c.lineTo(6, 9); c.fillStyle = '#ff3a2a'; c.globalAlpha = 0.6; c.fill(); c.globalAlpha = 1; }
        uni(c, () => { c.arc(0, 0, 8.5, 0, TAU); c.moveTo(3.5, -7.6); c.quadraticCurveTo(15, -6, 23.5, 4.8); c.quadraticCurveTo(14, 1.6, 4.5, 4.2); c.closePath(); },
          K.lg(c, 0, -9, 0, 8, ['#fffaf0', BONE, '#b8a888']), LW);
        c.beginPath(); c.moveTo(6, -5.5); c.quadraticCurveTo(15, -4, 21.5, 3.2); K.stroke(c, 'rgba(255,255,255,.8)', 0.7);
        c.beginPath(); c.ellipse(12.5, -2.2, 2.3, 0.75, 0.38, 0, TAU); c.fillStyle = '#2a1820'; c.fill();
        c.beginPath(); c.moveTo(-5, -5.5); c.lineTo(-2.8, -3.5); c.lineTo(-4.2, -1); c.moveTo(-6.5, 1); c.lineTo(-4.5, 2.5); K.stroke(c, '#8a7a60', 0.6);
        // oční důlek s rudým okem a ohnivou stopou
        c.beginPath(); c.ellipse(1, -1, 4.7, 4.3, 0, 0, TAU); c.fillStyle = K.rg(c, 1, -1, 0, 5, ['#3a0a14', '#14060c']); c.fill(); c.lineWidth = 0.9; c.strokeStyle = OUT; c.stroke();
        K.glow(c, 1.6, -1, act ? 14 : 9, '#ff2a1a', 0.85);
        add(c, 0.85); c.beginPath(); flame(c, 1.2, -1, 1.6, 9 + sin(t * 9) * 2 + (act ? 6 : 0), PI + 0.15, sin(t * 11) * 1.5); c.fillStyle = K.lg(c, 1, -1, -10, -2, ['#ff6a3a', 'rgba(255,20,20,0)']); c.fill(); c.restore();
        c.beginPath(); c.arc(1.6, -1, act ? 2.6 : 2.1, 0, TAU); c.fillStyle = K.rg(c, 1.6, -1, 0, 2.6, ['#fff6c8', '#ff4a1a', '#a8100a']); c.fill();
        c.beginPath(); c.arc(1, -1.8, 0.6, 0, TAU); c.fillStyle = '#fff'; c.fill();
        c.restore();
        // blízké křídlo
        wingB(-3, -9, act ? -PI * 0.78 : -PI * 0.78 + sin(t * 3.2 + 0.4) * 0.25, act ? 1.2 : 0.95, false);
      },

      /* ---------------- KOČKA – čarodějnická kočka na koštěti ---------------- */
      kocka(c, t, act) {
        const b = sin(t * 2.2) * 2, bl = blinkAt(t, 0.7);
        const FUR = K.rg(c, 10, -20, 1, 26, [[0, '#5a5078'], [0.4, '#2a2638'], [1, '#0e0c14']], 12, -22);
        const catEye = (x, y, r) => {
          c.beginPath(); c.ellipse(x, y, r, r * 1.05, 0, 0, TAU); c.fillStyle = K.rg(c, x, y + r * 0.3, 0, r * 1.1, [[0, '#ffffd0'], [0.45, act ? '#d8ff4a' : '#b8ff3a'], [1, '#3a8a1a']]); c.fill(); c.lineWidth = 1.1; c.strokeStyle = OUT; c.stroke();
          if (bl > 0.5) { c.beginPath(); c.ellipse(x, y, r * 1.05, r * 1.1, 0, PI, TAU); c.fillStyle = '#1e1a2a'; c.fill(); }
          c.beginPath(); c.ellipse(x + r * 0.15, y, r * (act ? 0.12 : 0.24), r * 0.82, 0, 0, TAU); c.fillStyle = '#0d0a12'; c.fill();
          c.beginPath(); c.arc(x - r * 0.3, y - r * 0.4, r * 0.26, 0, TAU); c.fillStyle = '#fff'; c.fill();
        };
        c.save(); c.translate(0, b); c.rotate(-0.08 + sin(t * 2.2 + 0.8) * 0.04);
        // magická stopa
        add(c, 0.9);
        c.beginPath(); for (let x = -40; x >= -54; x -= 2) { const u = (-x - 40) / 14, y = 8 + sin(t * 5 + x * 0.35) * 3 * u; x === -40 ? c.moveTo(x, y) : c.lineTo(x, y); }
        c.strokeStyle = K.lg(c, -40, 0, -54, 0, ['#c88aff', 'rgba(120,255,140,0)']); c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
        for (let i = 0; i < 8; i++) { const ph = (t * 0.9 + R(i + 80)) % 1, x = -38 - ph * 14, y = 8 + (R(i + 81) - 0.5) * 16 + sin(t * 3 + i) * 2; c.globalAlpha = 1 - ph; K.sparkle(c, x, y, (1 - ph) * 2.4 + 0.5, i % 2 ? '#d8a0ff' : '#a0ffb0'); }
        c.restore();
        // zadní noha
        ribbon(c, spine(-3, 3, PI * 0.42, 10, 0.3, 2), () => 4.6); K.fill(c, '#1e1a2a', 1.2);
        // ocas s mašlí
        const tp = spine(-10, 1, PI * 0.95, 24, 2.6, 10, k => sin(t * 2.5 - k * 3) * 0.22 * k);
        ribbon(c, tp, k => 4.6 - k * 1.8); K.fill(c, K.lg(c, -30, -20, -10, 0, ['#3a3550', '#14121c']), 1.3);
        const tb = tp[4];
        c.beginPath(); c.moveTo(tb[0], tb[1]); c.lineTo(tb[0] - 5, tb[1] - 3.5); c.lineTo(tb[0] - 4.5, tb[1] + 2.5); c.closePath(); c.moveTo(tb[0], tb[1]); c.lineTo(tb[0] + 3, tb[1] - 5); c.lineTo(tb[0] + 4.5, tb[1] + 0.5); c.closePath(); K.fill(c, '#9a4ae8', 1);
        c.beginPath(); c.arc(tb[0], tb[1] + 2.2, 1.8, 0, TAU); K.fill(c, K.rg(c, tb[0], tb[1] + 1.5, 0, 2, GOLD), 0.8);
        // koště
        c.beginPath(); c.moveTo(-17, 4.5); c.quadraticCurveTo(-30, 0, -43, -2.5); c.quadraticCurveTo(-47, 8, -43, 18.5); c.quadraticCurveTo(-30, 16, -17, 11.5); c.closePath();
        K.fill(c, K.lg(c, 0, -2, 0, 18, ['#f8d878', '#d8a040', '#9a6a20']), 1.3);
        c.beginPath(); for (let j = 0; j < 7; j++) { const y0 = 5.6 + j * 0.95, y1 = -1 + j * 3.1; c.moveTo(-18, y0); c.quadraticCurveTo(-30, y0 + (y1 - y0) * 0.4, -43, y1); } K.stroke(c, 'rgba(138,90,24,.8)', 0.6);
        c.beginPath(); c.ellipse(-18.5, 8, 2.6, 4.6, 0, 0, TAU); K.fill(c, '#7a3ac8', 1.1); c.beginPath(); c.moveTo(-19.8, 4.5); c.lineTo(-19.8, 11.5); c.moveTo(-17.4, 4.3); c.lineTo(-17.4, 11.7); K.stroke(c, '#ffd84a', 0.7);
        c.beginPath(); c.moveTo(-16, 8); c.lineTo(36, 6.6); K.stroke(c, OUT, 5.4); c.strokeStyle = K.lg(c, 0, 5.5, 0, 9.5, ['#d8a060', '#8a5420']); c.lineWidth = 3.2; c.stroke();
        c.beginPath(); c.moveTo(-10, 7.3); c.lineTo(30, 6.2); K.stroke(c, 'rgba(255,220,160,.5)', 0.6);
        c.beginPath(); c.arc(36.5, 6.6, 2.5, 0, TAU); K.fill(c, '#9a6a3a', 1.1);
        // lektvar
        const sw = sin(t * 2.6) * 1.5;
        c.beginPath(); c.moveTo(25, 7); c.lineTo(25 + sw * 0.6, 11.5); K.stroke(c, OUT, 0.7);
        K.glow(c, 25 + sw, 15.5, 7, '#7aff6a', 0.5);
        c.beginPath(); c.arc(25 + sw, 15.5, 3.1, 0, TAU); c.rect(23.9 + sw, 10.8, 2.2, 2.6); K.fill(c, K.rg(c, 24 + sw, 14.5, 0, 3.5, ['#eaffc8', '#6aff4a', '#1a8a2a']), 1);
        // kočka: tělo + hlava
        uni(c, () => {
          c.ellipse(-1, -2, 10.5, 9.5, 0, 0, TAU);
          c.moveTo(18.5, -16); c.arc(8, -16, 10.5, 0, TAU);
          c.moveTo(-1, -19); c.lineTo(-5, -16); c.lineTo(-2, -14.5); c.lineTo(-4.5, -11); c.lineTo(0, -10); c.closePath();
        }, FUR, LW);
        c.beginPath(); c.arc(-1, -2, 9.3, PI * 0.95, PI * 1.45); K.stroke(c, 'rgba(160,130,255,.75)', 1.2);
        c.beginPath(); c.moveTo(9, -8); c.lineTo(11.5, -4); c.lineTo(9.5, -3.5); c.lineTo(10.5, 0); c.lineTo(7, -1.5); c.closePath(); c.fillStyle = '#3e3856'; c.fill();
        // obojek s půlměsícem
        c.beginPath(); c.moveTo(1, -7.5); c.quadraticCurveTo(8, -3, 15.5, -8); K.stroke(c, OUT, 3.6); K.stroke(c, '#8a3ad8', 2.2);
        c.beginPath(); c.arc(8.5, -3.2, 2.5, 0, TAU); K.fill(c, K.rg(c, 8, -4, 0, 3, GOLD), 0.9); c.beginPath(); c.arc(9.6, -3.9, 1.9, 0, TAU); c.fillStyle = '#2a2638'; c.fill();
        // tlama
        c.beginPath(); c.ellipse(14.8, -11.2, 4.3, 3, 0, 0, TAU); c.fillStyle = '#3a3450'; c.fill();
        c.beginPath(); c.moveTo(16.8, -13.6); c.lineTo(19, -13.6); c.lineTo(17.9, -12.2); c.closePath(); K.fill(c, '#ff8ab0', 0.7);
        c.beginPath(); c.moveTo(17.9, -12.2); c.quadraticCurveTo(17.6, -10.2, 15.6, -10.6); c.moveTo(17.9, -12.2); c.quadraticCurveTo(18.5, -10.3, 20, -10.8); K.stroke(c, '#0d0a12', 0.8);
        c.beginPath(); c.moveTo(16.3, -10.5); c.lineTo(16.8, -8.8); c.lineTo(17.3, -10.5); c.fillStyle = '#fff'; c.fill();
        c.beginPath(); c.moveTo(18, -11.5); c.lineTo(28, -14.5); c.moveTo(18, -11); c.lineTo(28.5, -11.2); c.moveTo(17.5, -10.5); c.lineTo(26.5, -7.5); K.stroke(c, 'rgba(225,215,250,.9)', 0.55);
        catEye(13.3, -17, 3.7); catEye(6.4, -17.4, 3.1);
        if (act) { K.glow(c, 13, -17, 8, '#b8ff3a', 0.6); c.beginPath(); c.moveTo(9.5, -22); c.lineTo(16.5, -20.5); c.moveTo(3.5, -22); c.lineTo(8.5, -21.2); K.stroke(c, OUT, 1.3); }
        // ucho + klobouk
        c.beginPath(); c.moveTo(12.5, -24); c.quadraticCurveTo(17, -31, 19.8, -33.5); c.quadraticCurveTo(20, -26, 17.8, -20.5); c.closePath(); K.fill(c, FUR, LW);
        c.beginPath(); c.moveTo(14.5, -24); c.quadraticCurveTo(17.5, -28.5, 18.8, -30.5); c.quadraticCurveTo(18.8, -26, 17.2, -22.5); c.closePath(); c.fillStyle = '#c86aa0'; c.fill();
        const hp = spine(3, -26.5, -PI / 2 - 0.32, 23, -1.25 + sin(t * 2) * 0.15, 8, k => sin(t * 2.6 - k * 2) * 0.12 * k);
        const hr = ribbon(c, hp, k => 17 * (1 - k) + 0.9);
        K.fill(c, K.lg(c, -6, -30, 10, -30, ['#a878f0', '#5a2ea0', '#2a1450']), LW);
        [[3, 0.45, 1.6], [5, -0.3, 1.2], [2, -0.35, 1.1]].forEach(([i, o, r]) => { const p = hp[i], q = hr.L[i]; K.star(c, p[0] + (q[0] - p[0]) * o, p[1] + (q[1] - p[1]) * o, r, '#ffd84a'); });
        c.beginPath(); { const p = hp[4], q = hr.R[4]; const x = p[0] + (q[0] - p[0]) * 0.4, y = p[1] + (q[1] - p[1]) * 0.4; c.rect(x - 2, y - 1.6, 4, 3.2); } c.fillStyle = '#3ac86a'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = OUT; c.stroke();
        c.beginPath(); c.moveTo(hr.L[0][0], hr.L[0][1]); c.lineTo(hr.L[1][0], hr.L[1][1]); c.lineTo(hr.R[1][0], hr.R[1][1]); c.lineTo(hr.R[0][0], hr.R[0][1]); c.closePath(); K.fill(c, '#3ac86a', 1);
        const bx = (hr.L[0][0] + hr.R[1][0]) / 2 + 1, by = (hr.L[0][1] + hr.R[1][1]) / 2 + 0.5;
        c.beginPath(); c.rect(bx - 2.2, by - 2, 4.4, 4); K.fill(c, K.lg(c, bx, by - 2, bx, by + 2, GOLD), 0.9); c.beginPath(); c.rect(bx - 1, by - 0.9, 2, 1.8); c.fillStyle = '#3ac86a'; c.fill();
        c.beginPath(); c.ellipse(4, -26, 15.5, 4, -0.1, 0, TAU); K.fill(c, K.lg(c, 0, -30, 0, -22, ['#8a5ad8', '#3a1a6a']), LW);
        c.beginPath(); c.ellipse(4, -26.6, 13, 2.4, -0.1, PI * 1.05, PI * 1.95); K.stroke(c, 'rgba(210,180,255,.6)', 0.8);
        const he = hp[8], sx = he[0] + sin(t * 3) * 1.6, sy = he[1] + 5;
        c.beginPath(); c.moveTo(he[0], he[1]); c.lineTo(sx, sy - 2.5); K.stroke(c, '#ffd84a', 0.7);
        K.star(c, sx, sy, 3, '#ffd84a'); c.lineWidth = 0.8; c.strokeStyle = OUT; c.stroke();
        add(c, 0.8 + sin(t * 4) * 0.2); K.sparkle(c, sx + 2.5, sy - 3, 1.4, '#fff'); c.restore();
        // přední tlapky / zaklínání
        if (act) {
          ribbon(c, spine(10, -5, -0.45, 11, 0, 2), () => 4.6); K.fill(c, FUR, 1.2);
          c.beginPath(); c.arc(21, -10, 3, 0, TAU); K.fill(c, '#2a2638', 1.1); c.beginPath(); c.arc(22, -10.5, 0.9, 0, TAU); c.arc(21.2, -8.5, 0.7, 0, TAU); c.fillStyle = '#ff8ab0'; c.fill();
          const qx = 31, qy = -16;
          K.glow(c, qx, qy, 14, '#a04aff', 0.5);
          c.save(); c.beginPath(); c.arc(qx, qy, 9.5, 0, TAU); c.fillStyle = 'rgba(70,20,120,.35)'; c.fill(); c.moveTo(qx + 7, qy); c.arc(qx, qy, 7, 0, TAU); K.stroke(c, '#a04aff', 1.3);
          c.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 2; c.moveTo(qx + cos(a) * 7, qy + sin(a) * 7); c.lineTo(qx + cos(a + 0.15) * 9.5, qy + sin(a + 0.15) * 9.5); } K.stroke(c, '#7a2ad8', 0.8);
          c.beginPath(); for (let k = 0; k < 26; k++) { const a = k * 0.5 - t * 5, r = k * 0.24; k ? c.lineTo(qx + cos(a) * r, qy + sin(a) * r) : c.moveTo(qx, qy); } K.stroke(c, '#5ae83a', 1.3);
          // lebečka kletby
          const kx = 38 + sin(t * 3) * 1.5, ky = 0 + cos(t * 2.4) * 1.5;
          c.globalAlpha = 0.85; c.beginPath(); c.arc(kx, ky, 4.4, 0, TAU); c.rect(kx - 2.6, ky + 2.5, 5.2, 3); c.fillStyle = '#9aff7a'; c.fill();
          c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
          c.beginPath(); c.arc(kx - 1.6, ky - 0.2, 1.2, 0, TAU); c.arc(kx + 1.6, ky - 0.2, 1.2, 0, TAU); c.fillStyle = '#2a1440'; c.fill();
          c.restore();
        } else {
          c.beginPath(); c.ellipse(10, 5.2, 3, 2.3, 0, 0, TAU); c.moveTo(18, 5); c.ellipse(15, 5, 3, 2.3, 0, 0, TAU); K.fill(c, '#221e30', 1.1);
        }
        c.restore();
      },

      /* ---------------- IGNIS – dračí král ---------------- */
      ignis(c, t, act) {
        const fl = sin(t * 2.6), bl = blinkAt(t, 3.1);
        const RED = K.rg(c, 10, -16, 2, 42, [[0, '#ff9a6a'], [0.35, '#e8402a'], [0.75, '#a8181e'], [1, '#5a0a14']], 16, -22);
        const RED2 = K.lg(c, 0, -10, 0, 24, ['#a8181e', '#5a0a14']);
        const claws = (x, y) => { c.beginPath(); for (let j = 0; j < 3; j++) { const cx = x + j * 2.4; c.moveTo(cx, y - 1); c.lineTo(cx + 2.4, y + 0.6); c.lineTo(cx + 0.2, y + 1.4); } K.fill(c, '#fff0c8', 0.8); };
        // vzdálené křídlo
        batWing(c, 0, -12, act ? -1.5 : -1.85 + fl * 0.18, act ? 1.1 : 0.92, K.lg(c, -20, -40, -6, -6, ['#c8401a', '#8a1a1a', '#4a0a14']), '#5a1414');
        // ocas s ostny a plamenem
        const tp = spine(-15, 13, PI * 0.86, 28, 1.0, 10, k => sin(t * 2.2 - k * 3) * 0.18 * k), TW = k => 10 - k * 8;
        c.beginPath();
        for (let i = 2; i < 10; i += 2) { const p = tp[i], q = tp[i + 1], o = tp[i - 1]; let dx = q[0] - o[0], dy = q[1] - o[1]; const d = Math.hypot(dx, dy); dx /= d; dy /= d; const w = TW(i / 10) / 2, s = 2.5 - i * 0.12; c.moveTo(p[0] - dy * (w - 1) + dx * s, p[1] + dx * (w - 1) + dy * s); c.lineTo(p[0] - dy * (w + 4.5) - dx * 2, p[1] + dx * (w + 4.5) - dy * 2); c.lineTo(p[0] - dy * (w - 1) - dx * s, p[1] + dx * (w - 1) - dy * s); c.closePath(); }
        K.fill(c, '#ffb84a', 1.1);
        ribbon(c, tp, TW); K.fill(c, RED, LW);
        const te = tp[10], ta = Math.atan2(te[1] - tp[9][1], te[0] - tp[9][0]);
        c.beginPath(); flame(c, te[0], te[1], 4.5, 15 + sin(t * 9) * 3, ta - 0.6, sin(t * 11) * 2.5); c.fillStyle = FIRE(c, te[0], te[1], 17); c.fill();
        add(c, 0.8); c.beginPath(); flame(c, te[0], te[1], 2.2, 8 + sin(t * 13) * 2, ta - 0.7, sin(t * 9) * 1.5); c.fillStyle = '#ffe9a0'; c.fill(); c.restore();
        // ostny na hřbetě
        c.beginPath();
        [[9.5, -20.5, -2.5, 5], [6.5, -15, -2.4, 5.5], [1, -9.5, -1.95, 6.2], [-6, -7.5, -1.75, 6.5], [-13, -5.5, -2.05, 6], [-18, -1, -2.45, 5]].forEach(([x, y, a, h]) => {
          const ca = cos(a), sa = sin(a); c.moveTo(x - sa * 2.6, y + ca * 2.6); c.lineTo(x + ca * h - sa * -1.5, y + sa * h + ca * -1.5); c.lineTo(x + sa * 2.6, y - ca * 2.6); c.closePath();
        });
        K.fill(c, K.lg(c, 0, -26, 0, -2, ['#ffd24a', '#c8401a']), 1.1);
        // vzdálené nohy
        c.beginPath(); c.ellipse(-15, 15, 5.5, 7, -0.2, 0, TAU); K.fill(c, RED2, 1.3);
        ribbon(c, spine(4, 6, PI * 0.45, 13, 0, 3), k => 5.5 - k); K.fill(c, RED2, 1.3); claws(5.5, 19);
        // tělo + krk
        uni(c, () => {
          c.ellipse(-4, 5, 16, 13, -0.1, 0, TAU);
          c.moveTo(4, -6); c.quadraticCurveTo(8, -17, 12, -22); c.lineTo(20, -15); c.quadraticCurveTo(15, -6, 12, 6); c.closePath();
        }, RED, LW);
        c.beginPath(); for (let i = 0; i < 9; i++) { const x = -14 + (i % 3) * 5 + (i > 2 ? 2.5 : 0), y = 0 + Math.floor(i / 3) * 4; c.moveTo(x + 2, y); c.arc(x, y, 2, 0, PI); } K.stroke(c, 'rgba(90,10,20,.45)', 0.7);
        // královský plášť s hermelínem
        c.beginPath(); c.moveTo(9, -11); c.quadraticCurveTo(0, -15.5, -8, -11.5); c.quadraticCurveTo(-18, -4, -21, 8);
        c.quadraticCurveTo(-17.5, 11.5, -14, 9); c.quadraticCurveTo(-10.5, 13, -7, 10); c.quadraticCurveTo(-3, 13, 0, 9); c.quadraticCurveTo(3, 0, 9, -11); c.closePath();
        K.fill(c, K.lg(c, -14, -12, -8, 12, ['#e8304a', '#9a0a2a', '#4a0420']), LW);
        c.beginPath(); c.moveTo(-21, 8); c.quadraticCurveTo(-17.5, 11.5, -14, 9); c.quadraticCurveTo(-10.5, 13, -7, 10); c.quadraticCurveTo(-3, 13, 0, 9); K.stroke(c, '#ffd24a', 1.4);
        [[-12, -2], [-6, 2], [-15, 4], [-4, -6]].forEach(([x, y]) => K.star(c, x, y, 1.5, '#ffcf4a', 4, 0.4));
        c.beginPath(); c.moveTo(-4, -12); c.quadraticCurveTo(-13, -6, -16, 6); K.stroke(c, 'rgba(255,140,160,.45)', 1);
        // náprsní pláty
        const QL = u => [(1 - u) * (1 - u) * 7 + 2 * u * (1 - u) * 7 + u * u * -1, (1 - u) * (1 - u) * -8 + 2 * u * (1 - u) * 4 + u * u * 17], QR = u => [(1 - u) * (1 - u) * 13.5 + 2 * u * (1 - u) * 18 + u * u * 8, (1 - u) * (1 - u) * -12 + 2 * u * (1 - u) * 2 + u * u * 16];
        c.beginPath(); c.moveTo(13.5, -12); c.quadraticCurveTo(18, 2, 8, 16); c.lineTo(-1, 17); c.quadraticCurveTo(7, 4, 7, -8); c.closePath(); K.fill(c, K.lg(c, 8, -12, 4, 17, ['#ffe28a', '#ffb03a', '#d8761a']), 1.1);
        c.beginPath(); for (let j = 1; j < 7; j++) { const u = j / 7, a = QL(u), bb = QR(u); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2 + 1.6, bb[0], bb[1]); } K.stroke(c, '#b8661a', 0.8);
        K.glow(c, 10, 2, 10, '#ffcf4a', 0.25 + sin(t * 3) * 0.12);
        // hermelínový límec
        c.beginPath(); c.moveTo(-8.5, -12); c.quadraticCurveTo(2, -16.5, 11.5, -8.5); K.stroke(c, OUT, 7.6); K.stroke(c, K.lg(c, 0, -16, 0, -8, ['#ffffff', '#e8e0d8']), 4.8);
        c.beginPath(); [0.12, 0.34, 0.56, 0.78].forEach(u => { const x = (1 - u) * (1 - u) * -8.5 + 2 * u * (1 - u) * 2 + u * u * 11.5, y = (1 - u) * (1 - u) * -12 + 2 * u * (1 - u) * -16.5 + u * u * -8.5; c.moveTo(x, y - 1.4); c.lineTo(x - 0.8, y + 0.6); c.lineTo(x + 0.8, y + 0.6); c.closePath(); }); c.fillStyle = OUT; c.fill();
        c.beginPath(); c.arc(11.2, -8.6, 2.6, 0, TAU); K.fill(c, K.rg(c, 10.5, -9.3, 0, 3, GOLD), 1); gem(c, 11.2, -8.6, 1.5, '#e8102a');
        // blízké nohy
        c.beginPath(); c.ellipse(-8, 12, 8, 8.5, -0.3, 0, TAU); K.fill(c, RED, LW);
        c.beginPath(); c.ellipse(-5.5, 21.5, 7, 3, 0, 0, TAU); K.fill(c, RED2, 1.2); claws(-2, 21.5);
        ribbon(c, spine(10, 6, PI * 0.42, 13, 0, 3), k => 6 - k); K.fill(c, RED, LW); claws(13, 18.5);
        // blízké křídlo
        batWing(c, -4, -11, act ? -1.75 : -2.0 + sin(t * 2.6 + 0.3) * 0.2, act ? 1.15 : 0.92, K.lg(c, -30, -42, -10, -2, ['#ffb24a', '#e8501a', '#8a1a1a']), '#7a1a1a', '#ffcf4a');
        // hlava
        c.save(); c.translate(12, -12); c.rotate(act ? -0.32 : sin(t * 1.5) * 0.04); c.translate(-12, 12);
        [[11, -21, 13], [14.5, -23, 15]].forEach(([x, y, l]) => {
          const p = spine(x, y, -PI * 0.86, l, 1.0, 6); ribbon(c, p, k => 5.2 * (1 - k) + 0.3);
          K.fill(c, K.lg(c, p[0][0], p[0][1], p[6][0], p[6][1], ['#fff4d8', '#d8b888', '#6a4a2a']), 1.2);
          c.beginPath(); for (let i = 1; i < 5; i++) { const q = p[i], w = 2.4 * (1 - i / 6); c.moveTo(q[0] - w, q[1] + w * 0.4); c.lineTo(q[0] + w, q[1] - w * 0.4); } K.stroke(c, 'rgba(110,70,40,.7)', 0.6);
        });
        c.beginPath(); c.moveTo(12, -17); c.lineTo(4, -15); c.lineTo(11, -13.5); c.lineTo(5, -10); c.lineTo(12, -10.5); c.closePath(); K.fill(c, K.lg(c, 4, -14, 12, -14, ['#ffcf4a', '#e8601a']), 1.1);
        if (act) { c.beginPath(); c.moveTo(19, -11); c.lineTo(31, -11.5); c.lineTo(27, -3.5); c.lineTo(18.5, -7); c.closePath(); c.fillStyle = K.rg(c, 22, -9, 0, 9, ['#fff6c0', '#ff7a1a', '#7a0a10']); c.fill(); }
        c.save(); c.translate(19, -10); c.rotate(act ? 0.45 : 0); c.translate(-19, 10);
        c.beginPath(); c.moveTo(18, -11); c.quadraticCurveTo(26, -10.6, 31, -11); c.quadraticCurveTo(31.6, -8.5, 29, -7.4); c.quadraticCurveTo(22, -6.4, 17, -7.4); c.closePath(); K.fill(c, RED, 1.3);
        c.beginPath(); c.moveTo(19, -7.2); c.quadraticCurveTo(24, -6.6, 28.5, -7.6); K.stroke(c, '#ffb87a', 0.9);
        if (act) { c.beginPath(); c.moveTo(27, -10.8); c.lineTo(28, -13); c.lineTo(29, -10.8); c.moveTo(23.5, -10.6); c.lineTo(24.3, -12.4); c.lineTo(25.1, -10.6); c.fillStyle = '#fff'; c.fill(); }
        c.restore();
        uni(c, () => { c.arc(17, -17, 8.5, 0, TAU); c.moveTo(19, -23.5); c.quadraticCurveTo(28, -24.5, 33, -17.5); c.quadraticCurveTo(34.5, -12.5, 30.5, -11); c.lineTo(19, -10); c.closePath(); }, RED, LW);
        c.beginPath(); c.moveTo(21, -22.6); c.quadraticCurveTo(28, -22.8, 31.8, -17.5); K.stroke(c, 'rgba(255,200,160,.7)', 0.9);
        c.beginPath(); c.ellipse(31, -15.6, 1.4, 0.8, 0.4, 0, TAU); c.fillStyle = '#3a0a10'; c.fill();
        if (!act) { c.beginPath(); c.moveTo(26.3, -11); c.lineTo(27.1, -8.4); c.lineTo(28, -11.1); K.fill(c, '#ffffff', 0.8); }
        dEye(c, 20.5, -17.6, 4.3, '#ffd23a', 0.08, act ? 0.55 : 1);
        if (bl > 0.3) { c.beginPath(); c.ellipse(20.5, -17.8, 4.6, 3.6 * bl, 0.08, 0, TAU); K.fill(c, RED, 1); }
        c.beginPath(); c.moveTo(15, -21.8); c.lineTo(26, -21.6); c.lineTo(23.5, -19.4); c.quadraticCurveTo(19, -20.6, 15, -19.6); c.closePath(); K.fill(c, '#7a1018', 1);
        add(c, 1); motes(c, t, 4, 90, 30, 3, -16, 14, 0.8, 1.1, '#ffb03a', 1.5); c.restore();
        // koruna
        c.save(); c.translate(15.5, -25); c.rotate(-0.18);
        c.beginPath(); c.moveTo(-7, 0); c.lineTo(-8.5, -7); c.lineTo(-5.5, -3.8); c.lineTo(-4, -9.5); c.lineTo(-2, -4.2); c.lineTo(0, -11.5); c.lineTo(2, -4.2); c.lineTo(4, -9.5); c.lineTo(5.5, -3.8); c.lineTo(8.5, -7); c.lineTo(7, 0); c.closePath();
        K.fill(c, K.lg(c, 0, -11, 0, 1, GOLD), 1.2);
        c.beginPath(); c.moveTo(-7.4, -3.4); c.quadraticCurveTo(0, -1.8, 7.4, -3.4); c.lineTo(7, 0.8); c.quadraticCurveTo(0, 2.2, -7, 0.8); c.closePath(); K.fill(c, K.lg(c, 0, -3, 0, 2, ['#ffe680', '#c8820e']), 1);
        [[-8.5, -7], [-4, -9.5], [0, -11.5], [4, -9.5], [8.5, -7]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y - 0.8, 1.1, 0, TAU); K.fill(c, '#fffaf0', 0.7); });
        gem(c, 0, -0.6, 1.7, '#e8102a'); gem(c, -4.6, -0.9, 1.15, '#2a8aff'); gem(c, 4.6, -0.9, 1.15, '#2acc6a');
        c.beginPath(); c.moveTo(-2.5, -5); c.quadraticCurveTo(0, -8, 2.5, -5); K.stroke(c, '#a86a10', 0.5);
        add(c, 0.5 + 0.5 * sin(t * 3)); K.sparkle(c, -4, -8.5, 2.2, '#fff'); c.restore();
        c.restore();
        c.restore();
        // meteor
        if (act) {
          const mx = 32, my = -37 + ((t * 1.3) % 1) * 4;
          c.beginPath(); flame(c, mx, my, 9, 32, -PI * 0.78, sin(t * 12) * 2.5); c.fillStyle = FIRE(c, mx, my, 32); c.fill();
          c.beginPath(); flame(c, mx, my, 6.5, 19, -PI * 0.78, sin(t * 14) * 1.5); c.fillStyle = K.rg(c, mx, my, 1, 19, ['#ffffff', '#fff2a0', 'rgba(255,200,60,0)']); c.fill();
          K.glow(c, mx, my, 12, '#ff9a2a', 0.6);
          c.beginPath(); c.arc(mx, my, 5.5, 0, TAU); K.fill(c, K.rg(c, mx - 1.5, my - 1.5, 0, 6, ['#7a5a4a', '#3a2420', '#1a1010']), 1.2);
          c.beginPath(); c.moveTo(mx - 3.5, my - 1); c.quadraticCurveTo(mx - 1, my + 0.5, mx + 0.5, my + 3.5); c.moveTo(mx + 1, my - 3.5); c.lineTo(mx + 2.5, my - 0.5); K.stroke(c, '#ffb03a', 1);
          c.beginPath(); c.arc(mx + 2, my + 2, 1.1, 0, TAU); c.arc(mx - 2, my - 3, 0.8, 0, TAU); c.fillStyle = '#ffcf4a'; c.fill();
          c.beginPath(); for (let i = 0; i < 3; i++) flame(c, 32, -16, 3.2, 13 + sin(t * 10 + i) * 3, -0.75 + (i - 1) * 0.32, sin(t * 13 + i) * 2); c.fillStyle = FIRE(c, 32, -16, 16); c.fill();
        }
      },

      /* ---------------- ASTRALION – hvězdný lev ---------------- */
      astralion(c, t, act) {
        const bl = blinkAt(t, 1.7);
        const NIGHT = K.rg(c, -4, -8, 2, 36, [[0, '#6a5ae8'], [0.45, '#3a2aa8'], [1, '#160e4a']], 4, -12);
        // ocas s kometou
        const tp = spine(-23, -2, -PI * 0.8, 22, 1.5, 8, k => sin(t * 2.4 - k * 3) * 0.25 * k);
        ribbon(c, tp, k => 3.6 - k * 1.4); K.fill(c, NIGHT, 1.2);
        const te = tp[8], ta = Math.atan2(te[1] - tp[7][1], te[0] - tp[7][0]);
        K.glow(c, te[0], te[1], 10, '#9a8aff', 0.7);
        add(c, 0.95); c.beginPath(); flame(c, te[0], te[1], 3.4, 9 + sin(t * 6) * 2, ta + 0.4, sin(t * 7) * 1.5); c.fillStyle = K.rg(c, te[0], te[1], 0, 11, ['#ffffff', '#b8a8ff', 'rgba(90,60,255,0)']); c.fill(); c.restore();
        K.star(c, te[0], te[1], 3.4, '#fff6c8'); c.lineWidth = 0.8; c.strokeStyle = OUT; c.stroke();
        // vzdálené nohy
        ribbon(c, spine(-12, 3, PI * 0.5, 19, 0.06, 2), k => 6.5 - k); K.fill(c, '#221864', 1.3);
        ribbon(c, spine(4, 3, PI * 0.5, 19, -0.05, 2), k => 6.2 - k); K.fill(c, '#221864', 1.3);
        // tělo s mlhovinou
        const bodyP = () => {
          c.ellipse(-7, 2, 18, 10.5, -0.05, 0, TAU, true);
          ribbon(c, spine(-18, 4, PI * 0.52, 18, -0.1, 2), k => 8.5 - k * 2.5, true);
          ribbon(c, spine(10, 3, PI * 0.5, 19, 0.04, 2), k => 7 - k, true);
        };
        uni(c, bodyP, NIGHT, LW);
        c.save(); c.beginPath(); bodyP(); c.clip();
        K.glow(c, -12, -1, 14, '#ff6ad8', 0.45); K.glow(c, 3, 5, 12, '#4ad8ff', 0.35); K.glow(c, -21, 9, 10, '#a86aff', 0.45);
        add(c, 1); c.fillStyle = '#ffffff';
        for (let i = 0; i < 20; i++) { const x = -27 + R(i + 100) * 40, y = -8 + R(i + 101) * 30, tw = 0.5 + 0.5 * sin(t * 3 + i * 2.1); c.globalAlpha = 0.3 + 0.7 * tw; c.beginPath(); c.arc(x, y, 0.45 + R(i + 102) * 0.6, 0, TAU); c.fill(); }
        c.globalAlpha = 1; [[-14, -3], [-3, 6], [-22, 4]].forEach(([x, y], i) => K.sparkle(c, x, y, 1.6 + sin(t * 4 + i * 2) * 0.6, '#fff6c8'));
        c.restore();
        c.beginPath(); c.moveTo(-24, 4); c.lineTo(-17, 0); c.lineTo(-9, 2); c.lineTo(-3, -3); K.stroke(c, 'rgba(255,246,200,.4)', 0.5);
        c.restore();
        // tlapy
        [[-18.5, 22], [11, 22]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x - 1, y - 1.5); c.lineTo(x - 1, y); c.moveTo(x + 1.3, y - 1.5); c.lineTo(x + 1.3, y); K.stroke(c, 'rgba(190,180,255,.8)', 0.7); });
        // hříva
        const mx = 12, my = -13, ml = act ? 5 : 0;
        const puffs = (n, r0, rr, ph, gl) => { const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + ph, bk = 0.5 + 0.5 * cos(a + PI * 0.8), d = r0 + bk * 5 + ml * 0.6 + sin(t * 2.5 + i * 1.7) * 0.8; P.push([mx + cos(a) * d - bk * 2, my + sin(a) * d, rr + bk * 3 + ml * 0.3]); } return P; };
        const P1 = puffs(13, 10.5, 4.8, 0.15), P2 = puffs(11, 7, 4, 0.45);
        uni(c, () => { c.moveTo(mx + 14, my); c.arc(mx, my, 14, 0, TAU); P1.forEach(([x, y, r]) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }); }, K.rg(c, mx - 2, my, 6, 28, [[0, '#24166e'], [0.5, '#4a38c8'], [0.82, '#8a78ff'], [1, '#dcd2ff']]), 1.3);
        c.beginPath(); P2.forEach(([x, y, r]) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }); c.fillStyle = K.rg(c, mx - 1, my, 3, 20, [[0, '#3a2ab0'], [0.6, '#7a68f0'], [1, '#c8bcff']]); c.fill();
        c.beginPath(); P1.forEach(([x, y, r], i) => { if (y < my + 4) { c.moveTo(x - r * 0.6, y - r * 0.35); c.quadraticCurveTo(x, y - r * 0.95, x + r * 0.6, y - r * 0.35); } }); K.stroke(c, 'rgba(240,235,255,.75)', 0.9);
        // kosmické plamínky na temeni hřívy
        c.beginPath(); for (let i = 0; i < 4; i++) { const a = -PI * (0.55 + i * 0.16); flame(c, mx + cos(a) * 17 - 2, my + sin(a) * 17, 3.4, 8 + sin(t * 4 + i * 2) * 2 + ml, a - 0.5, sin(t * 5 + i) * 1.5); }
        c.fillStyle = K.rg(c, mx, my, 14, 32, ['#9a8aff', 'rgba(200,190,255,.9)', 'rgba(240,235,255,0)']); c.fill();
        if (act) { add(c, 0.3); c.beginPath(); c.arc(mx, my, 26, 0, TAU); c.fillStyle = K.rg(c, mx, my, 10, 28, ['rgba(160,140,255,0)', 'rgba(200,190,255,.55)', 'rgba(160,140,255,0)']); c.fill(); c.restore(); }
        // souhvězdí v hřívě
        const CS = [[-15, -6], [-11, -16], [-3, -20], [-17, 4], [-7, -11]].map(([x, y]) => [mx + x, my + y]);
        c.beginPath(); [[0, 1], [1, 2], [1, 4], [0, 3]].forEach(([a, bb]) => { c.moveTo(CS[a][0], CS[a][1]); c.lineTo(CS[bb][0], CS[bb][1]); }); K.stroke(c, 'rgba(255,246,200,.8)', 0.6);
        add(c, 1); CS.forEach(([x, y], i) => K.sparkle(c, x, y, 1.8 + sin(t * 4 + i * 1.7) * 0.8, '#fff6c8')); c.restore();
        CS.forEach(([x, y], i) => K.glow(c, x, y, 4, '#fff6c8', 0.5 + 0.3 * sin(t * 4 + i * 1.7)));
        // hlava
        c.save(); c.translate(12, -8); c.rotate(act ? -0.16 : sin(t * 1.4) * 0.03); c.translate(-12, 8);
        c.beginPath(); c.arc(10, -20.5, 3.6, 0, TAU); K.fill(c, NIGHT, 1.2); c.beginPath(); c.arc(10.3, -20.2, 1.8, 0, TAU); c.fillStyle = '#8a7aff'; c.fill();
        uni(c, () => { c.arc(16, -12, 8.2, 0, TAU); c.moveTo(28.9, -8); c.ellipse(22.5, -8, 6.4, 5, 0.1, 0, TAU); }, K.rg(c, 18, -14, 1, 15, [[0, '#b8acff'], [0.5, '#6a5ae0'], [1, '#3a2aa8']]), LW);
        c.beginPath(); c.ellipse(23.5, -6.8, 4.8, 3.4, 0.1, 0, TAU); c.fillStyle = 'rgba(220,214,255,.85)'; c.fill();
        if (act) { c.beginPath(); c.moveTo(19, -4.5); c.quadraticCurveTo(24, -6, 28, -6.5); c.quadraticCurveTo(26.5, 1.5, 21, 0.5); c.closePath(); K.fill(c, K.rg(c, 24, -3, 0, 6, ['#ff8ab0', '#5a1040']), 1.1); c.beginPath(); c.moveTo(26.5, -6.3); c.lineTo(26, -4); c.lineTo(25, -6.1); c.fillStyle = '#fff'; c.fill(); }
        else { c.beginPath(); c.moveTo(27.6, -9); c.lineTo(27.6, -7); c.quadraticCurveTo(26, -5.3, 24, -6.2); c.moveTo(27.6, -7); c.quadraticCurveTo(28.5, -5.5, 29.6, -6.2); K.stroke(c, '#1a1240', 0.9); }
        c.beginPath(); c.moveTo(25.8, -11); c.lineTo(29.4, -11.2); c.quadraticCurveTo(28.6, -8.6, 27.6, -8.6); c.quadraticCurveTo(26.4, -8.8, 25.8, -11); K.fill(c, '#1a1240', 0.8);
        K.eye(c, 19.2, -13.3, 3.6, '#ffd84a', 0.45, act ? 0 : bl);
        c.beginPath(); c.moveTo(15.4, -17.6); c.quadraticCurveTo(19, -19.2, 22.4, -17.4); K.stroke(c, OUT, 1.3);
        K.glow(c, 19.2, -13.3, 6, '#ffd84a', 0.35);
        // půlměsíc na čele
        c.beginPath(); c.arc(14.5, -18.5, 3, 0.4, PI * 2 - 0.4); c.arc(16, -19.2, 2.4, PI * 2 - 0.9, 0.9, true); c.closePath(); K.fill(c, K.lg(c, 12, -21, 16, -16, ['#ffffff', '#ffe08a', '#c8a03a']), 0.8);
        c.restore();
        // padající hvězdy
        if (act) {
          add(c, 1);
          for (let i = 0; i < 5; i++) {
            const ph = (t * 1.1 + i * 0.2) % 1, x = 30 + i * 3.6 + ph * 7, y = -52 + ph * 74;
            if (y > 22) continue;
            c.beginPath(); c.moveTo(x, y); c.lineTo(x - 9, y - 16); c.strokeStyle = K.lg(c, x, y, x - 9, y - 16, ['rgba(255,250,210,.95)', 'rgba(160,140,255,0)']); c.lineWidth = 2.6; c.lineCap = 'round'; c.stroke();
            K.star(c, x, y, 3.4, '#fff6c8');
          }
          c.restore();
          for (let i = 0; i < 5; i++) { const ph = (t * 1.1 + i * 0.2) % 1, x = 30 + i * 3.6 + ph * 7, y = -52 + ph * 74; if (y <= 22) K.glow(c, x, y, 7, '#c8b8ff', 0.6); }
        }
      },

      /* ---------------- LEVIATAN – mládě krakena ---------------- */
      leviatan(c, t, act) {
        const bl = blinkAt(t, 2.6);
        const SKIN = K.lg(c, 0, -10, 0, 26, ['#5ab8e8', '#3a8ab8', '#245c8a']), SKIN2 = K.lg(c, 0, -10, 0, 26, ['#3a80b0', '#22507a', '#163a60']);
        // bubliny
        c.lineWidth = 0.7;
        for (let i = 0; i < 5; i++) { const ph = (t * 0.4 + R(i + 120)) % 1, x = -24 + R(i + 121) * 48 + sin(t * 2 + i) * 2, y = 20 - ph * 62, r = 1 + R(i + 122) * 1.6; c.globalAlpha = Math.min(1, (1 - ph) * 2); c.beginPath(); c.arc(x, y, r, 0, TAU); c.strokeStyle = 'rgba(220,250,255,.9)'; c.stroke(); c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, TAU); c.fillStyle = '#fff'; c.fill(); }
        c.globalAlpha = 1;
        const tent = (x, y, a, len, bend, ph, w0, fill, curl, side) => {
          const pts = spine(x, y, a, len, bend, 9, k => sin(t * 3 + ph - k * 4) * 0.3 * k + curl * k * k * k);
          const r = ribbon(c, pts, k => w0 * (1 - k * 0.82)); K.fill(c, fill, 1.3);
          const S = side > 0 ? r.R : r.L;
          c.beginPath(); for (let i = 2; i < 9; i++) { const k = i / 9, p = pts[i], q = S[i], sx = p[0] + (q[0] - p[0]) * 0.5, sy = p[1] + (q[1] - p[1]) * 0.5, rr = 1.3 * (1 - k * 0.65); c.moveTo(sx + rr, sy); c.arc(sx, sy, rr, 0, TAU); }
          c.fillStyle = '#ffd8d0'; c.fill(); c.lineWidth = 0.45; c.strokeStyle = 'rgba(160,90,110,.7)'; c.stroke();
          return pts;
        };
        // zadní chapadla
        if (act) {
          tent(-11, -4, -PI * 0.74, 26, 1.0, 0, 7, SKIN2, 0.4, -1);
        } else {
          tent(-9, -1, PI * 0.82, 20, 0.5, 0, 6, SKIN2, 1.6, 1); tent(9, -1, PI * 0.12, 20, -0.5, 2.1, 6, SKIN2, -1.6, -1);
        }
        tent(-4, 1, PI * 0.64, 18, 0.5, 1.3, 6, SKIN2, 1.3, 1); tent(4, 1, PI * 0.3, 18, -0.4, 2.6, 6, SKIN2, -1.3, -1);
        // hlava (plášť)
        c.beginPath(); c.ellipse(-1, -13, 16.5, 17.5, -0.2, 0, TAU); K.fill(c, K.rg(c, -4, -20, 1, 24, [[0, '#bff4ff'], [0.25, '#6ac8f0'], [0.65, '#3a8ab8'], [1, '#163a68']], -7, -24), LW);
        c.beginPath(); [[-9, -21, 2.6], [-13, -12, 2], [-3, -25, 1.8], [-14, -4, 1.6], [3, -22, 1.5]].forEach(([x, y, r]) => { c.moveTo(x + r, y); c.ellipse(x, y, r, r * 0.8, 0.4, 0, TAU); }); c.fillStyle = 'rgba(20,60,110,.35)'; c.fill();
        add(c, 1); for (let i = 0; i < 5; i++) { const u = i / 4, x = -14 + u * 4 + sin(u * 3) * 2, y = -18 + u * 15, a = 0.5 + 0.5 * sin(t * 4 - i * 0.9); c.globalAlpha = 0.4 + a * 0.6; c.beginPath(); c.arc(x, y, 1.1, 0, TAU); c.fillStyle = '#9affff'; c.fill(); } c.restore();
        K.gloss(c, -7, -22, 5.5, 3, -0.6, 0.4);
        // oči a tvář
        K.eye(c, 8.5, -7, 5.3, '#ffcc33', 0.45, bl); K.eye(c, -1.5, -7.5, 4.4, '#ffcc33', 0.45, bl);
        if (act) { c.beginPath(); c.moveTo(4.5, -14.5); c.lineTo(12, -12); c.moveTo(-5, -13.5); c.lineTo(1.5, -12.3); K.stroke(c, OUT, 1.5); }
        c.beginPath(); c.arc(4, -1.5, 1.8, 0.2, PI - 0.2); K.stroke(c, OUT, 1);
        K.blush(c, 12.5, -1.5, 2.2); K.blush(c, -4.5, -2, 1.8);
        // korálová koruna
        c.save(); c.translate(-4.5, -28.5); c.rotate(-0.2);
        const BR = [[[-6, 0], [-8, -6], [-7, -10]], [[-7.6, -5], [-11, -8]], [[-2, -1], [-2, -8], [-4, -13]], [[-2, -7], [1, -11]], [[2.5, -1], [3, -7], [2, -12.5]], [[6, 0], [8, -5], [7, -9]], [[7.6, -4.5], [10.5, -7.5]]];
        c.beginPath(); BR.forEach(p => thru(c, p, true)); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 3.8; c.strokeStyle = OUT; c.stroke(); c.strokeStyle = K.lg(c, 0, 0, 0, -13, ['#e8405a', '#ff7a8a', '#ffb8c0']); c.lineWidth = 2.2; c.stroke();
        c.beginPath(); BR.forEach(p => { const e = p[p.length - 1]; c.moveTo(e[0] + 1.3, e[1]); c.arc(e[0], e[1], 1.3, 0, TAU); }); K.fill(c, '#ffd0d8', 0.7);
        c.beginPath(); c.moveTo(-9, 1); c.quadraticCurveTo(0, -2.5, 9, 1); c.lineTo(8.5, 3.6); c.quadraticCurveTo(0, 0.6, -8.5, 3.6); c.closePath(); K.fill(c, K.lg(c, 0, -2, 0, 4, GOLD), 1);
        [[-5, 1.2], [5, 1.2]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.1, 0, TAU); K.fill(c, '#fffaf0', 0.6); });
        gem(c, 0, 0, 2, '#4ae8d8');
        c.restore();
        // přední chapadla + trojzubec
        tent(-8, 2, PI * 0.74, 21, 0.4, 0.6, 6.4, SKIN, 2, 1);
        tent(-2, 3.5, PI * 0.55, 18, 0.25, 1.9, 6.4, SKIN, 1.8, 1);
        tent(4, 3.5, PI * 0.42, 18, -0.25, 3.2, 6.4, SKIN, -1.8, -1);
        const gx = 20 + sin(t * 3 + 4) * 0.8, gy = 9 + sin(t * 2) * 1;
        const x0 = gx - 2.5, y0 = gy + 13, x1 = gx + 3.5, y1 = gy - 24 - (act ? 4 : 0);
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); K.stroke(c, OUT, 3.4); K.stroke(c, '#e8b030', 1.8);
        c.save(); c.translate(x1, y1); c.rotate(Math.atan2(y1 - y0, x1 - x0) + PI / 2);
        c.beginPath(); c.moveTo(-5.5, -8); c.lineTo(-4, -5); c.quadraticCurveTo(-4, -1, 0, -0.5); c.quadraticCurveTo(4, -1, 4, -5); c.lineTo(5.5, -8); c.quadraticCurveTo(6.2, -0.5, 0, 2.5); c.quadraticCurveTo(-6.2, -0.5, -5.5, -8); c.closePath();
        c.moveTo(-1.3, 0); c.lineTo(0, -11); c.lineTo(1.3, 0); c.closePath(); K.fill(c, K.lg(c, -5, -8, 5, 2, GOLD), 1);
        gem(c, 0, 2.2, 1.4, '#4ae8d8'); c.restore();
        tent(9, 1.5, 0.15, 17, -0.2, 4.4, 6.4, SKIN, -2.4, -1);
        // úder (schopnost)
        if (act) {
          tent(8, -1, -0.95, 40, 2.75, 0, 7.5, SKIN, 0.15, 1);
          const sx = 34, sy = 23;
          add(c, 0.95); c.beginPath(); for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.33, h = 9 + sin(t * 9 + i * 2) * 2.5 + (i % 2) * 4; flame(c, sx + cos(a) * 2, sy + sin(a) * 2, 1.9, h, a, 0); } c.fillStyle = '#bfefff'; c.fill();
          c.beginPath(); c.ellipse(sx, sy, 13, 3.2, 0, 0, TAU); K.stroke(c, '#dff8ff', 1.4); c.beginPath(); c.ellipse(sx, sy, 19, 4.6, 0, 0, TAU); K.stroke(c, 'rgba(160,230,255,.7)', 1);
          c.restore();
          [0, 1, 2].forEach(i => { const a = t * 4 + i * TAU / 3; K.star(c, sx + cos(a) * 8, 8 + sin(a) * 2.2, 2.2, '#ffe04a'); });
        }
      },

      /* ---------------- SERAFINA – strážná víla ---------------- */
      serafina(c, t, act) {
        const b = sin(t * 2) * 2 - 1, bl = blinkAt(t, 0.9), fl = sin(t * 12);
        const SKIN = K.rg(c, 7, -22, 1, 12, ['#fff6ee', '#ffe0cc', '#f0b8a0']), HAIR = K.lg(c, 4, -32, -12, 2, ['#fff6c8', '#ffd860', '#e0a030']);
        c.save(); c.translate(0, b);
        if (act) {
          add(c, 0.55); c.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.5; c.moveTo(6, -16); c.lineTo(6 + cos(a - 0.08) * 46, -16 + sin(a - 0.08) * 46); c.lineTo(6 + cos(a + 0.08) * 46, -16 + sin(a + 0.08) * 46); c.closePath(); }
          c.fillStyle = K.rg(c, 6, -16, 4, 46, ['#fff8d0', 'rgba(255,220,120,0)']); c.fill(); c.restore();
        }
        // šest křídel světla
        const W = (x, y, a, len, w, dim) => {
          c.beginPath(); leaf(c, x, y, a, len, w, 0.7);
          c.fillStyle = K.lg(c, x, y, x + cos(a) * len, y + sin(a) * len, dim ? [[0, 'rgba(255,245,220,.85)'], [0.6, 'rgba(225,210,255,.6)'], [1, 'rgba(195,185,255,.5)']] : [[0, 'rgba(255,255,255,.97)'], [0.55, 'rgba(255,242,195,.82)'], [1, 'rgba(255,200,236,.62)']]);
          c.fill(); c.lineWidth = 1.1; c.strokeStyle = dim ? 'rgba(190,150,80,.8)' : '#d8962a'; c.stroke();
          const ca = cos(a), sa = sin(a), mx = x + ca * len * 0.5, my = y + sa * len * 0.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + ca * len * 0.9, y + sa * len * 0.9);
          c.moveTo(mx - ca * len * 0.15, my - sa * len * 0.15); c.lineTo(mx + ca * len * 0.12 - sa * w * 0.32, my + sa * len * 0.12 + ca * w * 0.32);
          c.moveTo(mx - ca * len * 0.1, my - sa * len * 0.1); c.lineTo(mx + ca * len * 0.2 + sa * w * 0.25, my + sa * len * 0.2 - ca * w * 0.25);
          K.stroke(c, dim ? 'rgba(200,170,255,.7)' : 'rgba(255,190,80,.85)', 0.6);
        };
        const sp = act ? 0.22 : 0, sc = act ? 1.18 : 1;
        [[-PI * 0.58, 24, 12], [-PI * 0.82, 22, 11], [PI * 0.94, 16, 9]].forEach(([a, l, w], i) => W(1, -10, a - sp * (1 - i) + fl * 0.07, l * sc, w, true));
        [[-PI * 0.68, 28, 13], [-PI * 0.93, 25, 12], [PI * 0.82, 18, 10]].forEach(([a, l, w], i) => W(-1.5, -8, a - sp * (1 - i) + sin(t * 12 + 0.6) * 0.08, l * sc, w, false));
        K.glow(c, -12, -16, 24, '#fff4c0', act ? 0.6 : 0.35);
        // vlasy vzadu
        for (let j = 0; j < 4; j++) { const pts = spine(1 + j * 1.3, -25 + j * 3.2, PI * 0.7 + j * 0.1, 17 + j * 2, -0.7 + j * 0.15, 7, k => sin(t * 3 - k * 4 + j) * 0.22 * k); ribbon(c, pts, k => 8 * (1 - k * 0.75)); K.fill(c, HAIR, 1.1); }
        // nožky
        [[3.5, 2], [8.5, 9.5]].forEach(([x, x2], i) => { c.beginPath(); c.moveTo(x, 13); c.lineTo(x2, 20.5 - i); K.stroke(c, OUT, 3.6); K.stroke(c, '#ffe0cc', 2); c.beginPath(); c.ellipse(x2 + 0.8, 21 - i, 2.4, 1.3, 0.2, 0, TAU); K.fill(c, K.lg(c, x2, 19, x2, 23, GOLD), 0.9); });
        // šaty
        c.beginPath(); c.moveTo(3.5, -7); c.quadraticCurveTo(-3, 5, -6, 16.5); for (let s = 0; s < 5; s++) { const x = -6 + s * 4.6; c.quadraticCurveTo(x + 2.3, 19.5, x + 4.6, 16.5); } c.quadraticCurveTo(15, 5, 9, -7); c.closePath();
        K.fill(c, K.lg(c, 0, -6, 0, 18, ['#ffe0f0', '#ffc8e4']), 1.2);
        c.beginPath(); c.moveTo(3.5, -7); c.quadraticCurveTo(-1, 4, -3.5, 14); for (let s = 0; s < 4; s++) { const x = -3.5 + s * 4.6; c.quadraticCurveTo(x + 2.3, 17, x + 4.6, 14); } c.quadraticCurveTo(13, 4, 9, -7); c.closePath();
        K.fill(c, K.lg(c, 0, -6, 0, 15, ['#ffffff', '#fff6dc', '#ffe6a8']), 1.2);
        c.beginPath(); c.moveTo(-3.5, 14); for (let s = 0; s < 4; s++) { const x = -3.5 + s * 4.6; c.quadraticCurveTo(x + 2.3, 17, x + 4.6, 14); } K.stroke(c, '#e8a828', 1.1);
        c.beginPath(); c.moveTo(6, -6); c.quadraticCurveTo(4.5, 4, 2, 13); c.moveTo(7, -6); c.quadraticCurveTo(9, 4, 11, 13); K.stroke(c, 'rgba(232,168,40,.45)', 0.7);
        c.beginPath(); c.ellipse(6.3, -9.5, 4.2, 4.6, 0, 0, TAU); K.fill(c, K.lg(c, 0, -14, 0, -5, ['#ffffff', '#ffeab0']), 1.2);
        c.beginPath(); c.moveTo(3, -12); c.lineTo(6.3, -7); c.lineTo(9.6, -12); K.stroke(c, '#e8a828', 0.9);
        gem(c, 6.3, -7.2, 1.2, '#ff6ab8');
        // ruce a hůl
        const top = act ? [22, -40] : [21, -22], bot = act ? [14.5, 4] : [16.5, 17];
        const hx = bot[0] + (top[0] - bot[0]) * 0.55, hy = bot[1] + (top[1] - bot[1]) * 0.55;
        if (act) { c.beginPath(); c.moveTo(4, -11); c.quadraticCurveTo(-1, -17, -2, -24); K.stroke(c, OUT, 3.8); K.stroke(c, '#ffe0cc', 2.2); c.beginPath(); c.arc(-2, -25, 1.8, 0, TAU); K.fill(c, '#ffe0cc', 1); add(c, 1); K.sparkle(c, -2, -29, 3.5 + sin(t * 8) * 1, '#fff'); c.restore(); }
        else { c.beginPath(); c.moveTo(4.5, -11); c.quadraticCurveTo(1.5, -7, 2.2, -3); K.stroke(c, OUT, 3.6); K.stroke(c, '#ffe0cc', 2); }
        c.beginPath(); c.moveTo(bot[0], bot[1]); c.lineTo(top[0], top[1]); K.stroke(c, OUT, 3.2); c.strokeStyle = K.lg(c, bot[0] - 1, 0, bot[0] + 1, 0, ['#ffe680', '#c8820e']); c.lineWidth = 1.7; c.stroke();
        c.beginPath(); for (let j = 0; j < 5; j++) { const u = 0.15 + j * 0.15, x = bot[0] + (top[0] - bot[0]) * u, y = bot[1] + (top[1] - bot[1]) * u; c.moveTo(x - 1.4, y + 0.6); c.lineTo(x + 1.4, y - 1.6); } K.stroke(c, '#ff8ac8', 0.9);
        c.beginPath(); c.arc(top[0], top[1] - 2, 4.6, 0.25, PI - 0.25); K.stroke(c, OUT, 3); K.stroke(c, '#ffd84a', 1.6);
        c.beginPath(); c.moveTo(top[0] - 4.4, top[1] - 0.7); c.quadraticCurveTo(top[0] - 7.5, top[1] - 4, top[0] - 5, top[1] - 6.5); c.moveTo(top[0] + 4.4, top[1] - 0.7); c.quadraticCurveTo(top[0] + 7.5, top[1] - 4, top[0] + 5, top[1] - 6.5); K.stroke(c, '#ffd84a', 1);
        K.glow(c, top[0], top[1] - 6, act ? 18 : 10, '#bff4ff', 0.8);
        c.beginPath(); c.moveTo(top[0], top[1] - 13); c.lineTo(top[0] + 3, top[1] - 6); c.lineTo(top[0], top[1] - 1); c.lineTo(top[0] - 3, top[1] - 6); c.closePath(); K.fill(c, K.lg(c, top[0] - 3, top[1] - 12, top[0] + 3, top[1], ['#ffffff', '#9aeaff', '#4ab0ff']), 1);
        c.beginPath(); c.moveTo(top[0], top[1] - 13); c.lineTo(top[0], top[1] - 1); c.moveTo(top[0] - 3, top[1] - 6); c.lineTo(top[0] + 3, top[1] - 6); K.stroke(c, 'rgba(255,255,255,.8)', 0.5);
        add(c, 1); c.save(); c.translate(top[0], top[1] - 6); c.rotate(t * 1.5); K.sparkle(c, 0, 0, 6 + sin(t * 5) * 1.5 + (act ? 4 : 0), 'rgba(255,255,255,.85)'); c.restore(); c.restore();
        c.beginPath(); c.moveTo(8.5, -11); c.quadraticCurveTo(12, -7, hx - 1, hy); K.stroke(c, OUT, 3.6); K.stroke(c, '#ffe0cc', 2);
        c.beginPath(); c.arc(hx, hy, 1.9, 0, TAU); K.fill(c, '#ffe0cc', 1);
        // hlava
        c.beginPath(); c.moveTo(-1, -19.5); c.lineTo(-7.5, -25.5); c.lineTo(-0.5, -16); c.closePath(); K.fill(c, SKIN, 1.1);
        c.beginPath(); c.arc(6.5, -21, 10, 0, TAU); K.fill(c, SKIN, LW);
        c.beginPath(); c.arc(6.5, -22, 10.9, PI * 0.93, PI * 2.04);
        c.lineTo(16, -21); c.quadraticCurveTo(15.2, -24, 13.2, -21.5); c.quadraticCurveTo(12, -25, 9.2, -21.8); c.quadraticCurveTo(7.4, -25.5, 5, -22.5); c.quadraticCurveTo(3, -24.5, 0.8, -21.5); c.quadraticCurveTo(-1, -19, -3.6, -15); c.closePath();
        K.fill(c, HAIR, LW);
        c.beginPath(); c.arc(6.5, -22, 9, -PI * 0.85, -PI * 0.45); K.stroke(c, 'rgba(255,255,255,.75)', 1.1);
        // čelenka (diadém)
        c.beginPath(); c.moveTo(-1.8, -26.5); c.quadraticCurveTo(6, -31.5, 15.2, -25.5); K.stroke(c, OUT, 2.6); K.stroke(c, '#ffd84a', 1.4);
        c.beginPath(); c.moveTo(11.6, -30.5); c.quadraticCurveTo(9.6, -33.5, 7.4, -31.2); c.moveTo(13.6, -30); c.quadraticCurveTo(16.8, -32.5, 17.6, -29.2); K.stroke(c, '#ffd84a', 1.1);
        c.beginPath(); c.moveTo(12.4, -33.8); c.lineTo(14.4, -30.4); c.lineTo(12.4, -26.4); c.lineTo(10.4, -30.4); c.closePath(); K.fill(c, K.lg(c, 10, -34, 14, -27, ['#ffffff', '#7ae0ff', '#2a7ad8']), 1);
        K.glow(c, 12.4, -30.4, 6, '#bff4ff', 0.5 + 0.3 * sin(t * 3));
        // obličej
        K.eye(c, 11.6, -18.5, 3.4, '#3ab0ff', 0.45, act ? 0 : bl); K.eye(c, 4.6, -18.8, 2.8, '#3ab0ff', 0.45, act ? 0 : bl);
        c.beginPath(); c.moveTo(13.8, -21.4); c.lineTo(15.6, -22.8); c.moveTo(14.7, -20.2); c.lineTo(16.8, -21); K.stroke(c, OUT, 0.9);
        K.blush(c, 13.5, -14.6, 1.9); K.blush(c, 3.2, -14.8, 1.5);
        c.beginPath(); c.arc(9.6, -14.2, 1.6, 0.3, PI - 0.3); K.stroke(c, '#a8505a', 0.9);
        // světelné jiskry / léčení
        add(c, 1); motes(c, t, 6, 150, -8, 30, 22, 30, 0.6, 1.2, '#fff6c0', 2); c.restore();
        if (act) {
          add(c, 1);
          for (let i = 0; i < 6; i++) { const ph = (t * 0.8 + i / 6) % 1, x = -22 + i * 9 + sin(t * 3 + i) * 2, y = 18 - ph * 50; c.globalAlpha = Math.min(1, (1 - ph) * 2); if (i % 2) { c.beginPath(); heart(c, x, y, 2.2); c.fillStyle = '#ff8ac0'; c.fill(); } else { c.beginPath(); c.rect(x - 0.8, y - 2.6, 1.6, 5.2); c.rect(x - 2.6, y - 0.8, 5.2, 1.6); c.fillStyle = '#d8ff8a'; c.fill(); } }
          c.restore();
        }
        c.restore();
      },

      /* ---------------- FROSTWYRM – ledový drak ---------------- */
      frostwyrm(c, t, act) {
        const bl = blinkAt(t, 3.6), N = 14, P = [];
        for (let i = 0; i <= N; i++) { const k = i / N; P.push([12 - k * 55, -8 + 13 * sin(k * PI * 1.1) - 6 * k * k + sin(t * 2.6 - k * 6) * 2.5 * k]); }
        const WF = k => 1.2 + 15 * sin(PI * (0.35 + k * 0.65));
        // sněžení za ocasem
        c.lineCap = 'round';
        for (let i = 0; i < 10; i++) { const ph = (t * 0.35 + R(i + 140)) % 1, x = -46 + R(i + 141) * 36 + sin(t * 1.5 + i) * 2 - ph * 4, y = -16 + R(i + 142) * 10 + ph * 36; c.globalAlpha = Math.min(1, (1 - ph) * 1.5, ph * 6); c.beginPath(); flake(c, x, y, 1.2 + R(i + 143) * 1.4); c.strokeStyle = '#ffffff'; c.lineWidth = 0.7; c.stroke(); }
        c.globalAlpha = 1;
        const cWing = (x, y, a, sc, dim) => {
          const sh = [[-0.05, 26], [0.25, 33], [0.55, 30], [0.85, 24], [1.12, 17]];
          const tips = sh.map(([o, l]) => [x + cos(a - o) * l * sc, y + sin(a - o) * l * sc, a - o, l * sc]);
          c.beginPath(); c.moveTo(x, y); tips.forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fillStyle = dim ? 'rgba(90,150,230,.28)' : 'rgba(140,210,255,.35)'; c.fill();
          const g = K.rg(c, x, y, 2, 34 * sc, dim ? [[0, 'rgba(200,230,255,.92)'], [0.45, 'rgba(100,170,240,.85)'], [1, 'rgba(40,100,200,.75)']] : [[0, 'rgba(240,252,255,.97)'], [0.45, 'rgba(130,205,255,.88)'], [1, 'rgba(50,130,230,.78)']]);
          tips.forEach(([tx, ty, aa, l]) => {
            const ca = cos(aa), sa = sin(aa);
            c.beginPath(); c.moveTo(x, y); c.lineTo(x + ca * l * 0.38 - sa * 3.4 * sc, y + sa * l * 0.38 + ca * 3.4 * sc); c.lineTo(tx, ty); c.lineTo(x + ca * l * 0.44 + sa * 2.2 * sc, y + sa * l * 0.44 - ca * 2.2 * sc); c.closePath();
            c.fillStyle = g; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#123a7a'; c.lineJoin = 'round'; c.stroke();
            c.beginPath(); c.moveTo(x + ca * 3, y + sa * 3); c.lineTo(x + ca * l * 0.38 - sa * 3.4 * sc, y + sa * l * 0.38 + ca * 3.4 * sc); c.lineTo(tx - ca * 1.5, ty - sa * 1.5); K.stroke(c, 'rgba(255,255,255,.85)', 0.6);
          });
        };
        cWing(5, -10, act ? -PI * 0.42 : -PI * 0.5 + sin(t * 2.6) * 0.15, act ? 1.08 : 0.85, true);
        // nohy
        [[2, 0.9], [7, 1]].forEach(([i, s]) => { const p = P[i]; ribbon(c, spine(p[0] - 1, p[1] + 3, PI * 0.5 + 0.35, 9 * s, -0.5, 2), k => 4.6 - k); K.fill(c, '#7ab8e8', 1.2); const e = [p[0] - 1 + cos(PI * 0.5 + 0.1) * 9 * s - 2, p[1] + 3 + 9 * s]; c.beginPath(); for (let j = 0; j < 3; j++) { const cx = e[0] + j * 2.1; c.moveTo(cx, e[1] - 1); c.lineTo(cx + 2.2, e[1] + 1.2); c.lineTo(cx, e[1] + 1); } K.fill(c, '#eafcff', 0.8); });
        // ledové ostny na hřbetě
        c.beginPath();
        for (let i = 1; i < N - 1; i++) {
          const k = i / N, p = P[i], o = P[i - 1], q = P[i + 1]; let dx = q[0] - o[0], dy = q[1] - o[1]; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
          const w = WF(k) / 2, h = 3 + WF(k) * 0.35, nx = -dy, ny = dx;
          c.moveTo(p[0] + nx * (w - 1) + dx * 2.2, p[1] + ny * (w - 1) + dy * 2.2); c.lineTo(p[0] + nx * (w + h) + dx * 1.8, p[1] + ny * (w + h) + dy * 1.8); c.lineTo(p[0] + nx * (w - 1) - dx * 2.2, p[1] + ny * (w - 1) - dy * 2.2); c.closePath();
        }
        K.fill(c, K.lg(c, 0, -30, 0, 8, ['#eafcff', '#8ad4ff', '#4a9ae8']), 1, '#123a7a');
        // tělo
        const br = ribbon(c, P, WF); K.fill(c, K.lg(c, 0, -22, 0, 16, ['#2a68c0', '#6ab4ee', '#c4ecff', '#f2fcff']), LW);
        c.beginPath(); for (let i = 1; i < N - 2; i++) { const p = P[i], q = br.R[i]; c.moveTo(q[0], q[1]); c.lineTo(q[0] + (p[0] - q[0]) * 0.5, q[1] + (p[1] - q[1]) * 0.5); } K.stroke(c, 'rgba(110,170,220,.6)', 0.7);
        c.beginPath(); thru(c, br.L.slice(1, N - 2).map((q, i) => [q[0] + (P[i + 1][0] - q[0]) * 0.3, q[1] + (P[i + 1][1] - q[1]) * 0.3]), true); K.stroke(c, 'rgba(255,255,255,.7)', 0.9);
        // krystal na konci ocasu
        const e = P[N], pe = P[N - 1]; let ex = e[0] - pe[0], ey = e[1] - pe[1]; const ed = Math.hypot(ex, ey); ex /= ed; ey /= ed;
        c.beginPath(); c.moveTo(e[0] + ex * 8, e[1] + ey * 8); c.lineTo(e[0] + ex * 2 - ey * 3.5, e[1] + ey * 2 + ex * 3.5); c.lineTo(e[0] - ex, e[1] - ey); c.lineTo(e[0] + ex * 2 + ey * 3.5, e[1] + ey * 2 - ex * 3.5); c.closePath();
        K.fill(c, K.lg(c, e[0], e[1], e[0] + ex * 8, e[1] + ey * 8, ['#ffffff', '#7ad0ff']), 1.1, '#1a4a8a');
        // krk + hlava
        c.save(); c.translate(14, -12); c.rotate(act ? -0.12 : sin(t * 1.6) * 0.04); c.translate(-14, 12);
        [[16, -26, 15, -PI * 0.86], [19, -27.5, 12, -PI * 0.78]].forEach(([x, y, l, a]) => {
          const p = spine(x, y, a, l, 0.7, 5); ribbon(c, p, k => 4.6 * (1 - k) + 0.2);
          K.fill(c, K.lg(c, p[0][0], p[0][1], p[5][0], p[5][1], ['#ffffff', '#8ad8ff', '#2a78d8']), 1.1, '#123a7a');
          c.beginPath(); thru(c, p.slice(0, 5), true); K.stroke(c, 'rgba(255,255,255,.8)', 0.6);
        });
        c.beginPath(); c.moveTo(14.5, -19); c.lineTo(6, -16); c.lineTo(13, -15.5); c.lineTo(7, -11.5); c.lineTo(14, -13); c.closePath(); K.fill(c, 'rgba(200,240,255,.95)', 1, '#1a4a8a');
        if (act) { c.beginPath(); c.moveTo(21, -16); c.lineTo(34, -16.5); c.lineTo(30, -9); c.lineTo(20, -12); c.closePath(); c.fillStyle = K.rg(c, 24, -14, 0, 9, ['#ffffff', '#9ae8ff', '#2a5aa8']); c.fill(); }
        c.save(); c.translate(21, -15.5); c.rotate(act ? 0.4 : 0); c.translate(-21, 15.5);
        c.beginPath(); c.moveTo(20, -16); c.quadraticCurveTo(27, -15.6, 33, -16.2); c.quadraticCurveTo(32.5, -13.2, 30, -12.6); c.quadraticCurveTo(24, -12, 19.5, -12.8); c.closePath(); K.fill(c, '#d8f4ff', 1.2);
        c.beginPath(); [22.5, 25.5, 28.5].forEach((x, i) => { c.moveTo(x - 1.2, -12.4); c.lineTo(x, -8.6 + i * 0.6); c.lineTo(x + 1.2, -12.5); }); K.fill(c, '#eafcff', 0.8, '#1a4a8a');
        c.restore();
        uni(c, [() => ribbon(c, spine(P[0][0] - 3, P[0][1] + 2, -PI * 0.32, 13, -0.15, 3), k => 12 - k * 3, true),
          () => { c.ellipse(19, -21, 7.5, 6.5, -0.1, 0, TAU); },
          () => { c.moveTo(21, -27); c.quadraticCurveTo(29, -26.5, 35.5, -20.5); c.quadraticCurveTo(36.8, -16.8, 33, -15.8); c.lineTo(20, -15); c.closePath(); }
        ], K.rg(c, 24, -22, 1, 22, [[0, '#ffffff'], [0.35, '#c4eaff'], [1, '#3a7ad0']], 26, -25), LW);
        c.beginPath(); c.moveTo(13, -25); c.quadraticCurveTo(22, -29.5, 34.5, -21.5); c.quadraticCurveTo(26, -24.5, 17, -22.5); c.closePath(); c.fillStyle = 'rgba(42,104,192,.55)'; c.fill();
        c.beginPath(); c.moveTo(22, -25.4); c.quadraticCurveTo(29, -25, 34, -20.4); K.stroke(c, 'rgba(255,255,255,.9)', 0.9);
        c.beginPath(); c.ellipse(33.6, -19.8, 1.1, 0.7, 0.5, 0, TAU); c.fillStyle = '#1a3a6a'; c.fill();
        dEye(c, 23, -22.3, 3.9, '#5af0ff', 0.12, act ? 0.55 : 1);
        if (bl > 0.3) { c.beginPath(); c.ellipse(23, -22.5, 4.2, 3.4 * bl, 0.12, 0, TAU); K.fill(c, '#b8e8ff', 1); }
        c.beginPath(); c.moveTo(18.5, -25.5); c.lineTo(26.5, -26.2); c.lineTo(24.5, -24); c.closePath(); K.fill(c, '#eafcff', 0.9, '#1a4a8a');
        K.glow(c, 23, -22.3, act ? 11 : 6, '#5af0ff', 0.55);
        add(c, 0.6); for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; c.globalAlpha = (1 - ph) * 0.55; c.beginPath(); c.arc(36 + ph * 7, -19 - ph * 5, 1 + ph * 2.4, 0, TAU); c.fillStyle = '#e8faff'; c.fill(); } c.restore();
        c.restore();
        // blízké křídlo
        cWing(1, -6, act ? -PI * 0.56 : -PI * 0.6 + sin(t * 2.6 + 0.3) * 0.17, act ? 1.18 : 1, false);
        // ledový dech
        if (act) {
          const mx = 33, my = -13;
          add(c, 0.9); c.beginPath(); c.moveTo(mx, my - 2); c.lineTo(58, my - 16); c.quadraticCurveTo(64, my + 2, 58, my + 18); c.lineTo(mx, my + 2); c.closePath();
          c.fillStyle = K.lg(c, mx, my, 60, my, ['rgba(255,255,255,.95)', 'rgba(170,235,255,.65)', 'rgba(120,200,255,0)']); c.fill(); c.restore();
          c.lineCap = 'round';
          for (let i = 0; i < 7; i++) { const ph = (t * 1.4 + i / 7) % 1, x = mx + 3 + ph * 22, y = my + (R(i + 160) - 0.5) * ph * 26; c.globalAlpha = Math.min(1, (1 - ph) * 2); c.beginPath(); flake(c, x, y, 1.2 + ph * 1.8); c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke(); }
          c.globalAlpha = 1;
          [[44, -21, -0.5], [48, -6, 0.2], [42, 2, 0.6]].forEach(([x, y, a]) => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(-4, 0); c.lineTo(0, -1.6); c.lineTo(5, 0); c.lineTo(0, 1.6); c.closePath(); K.fill(c, 'rgba(220,250,255,.95)', 0.8, '#1a4a8a'); c.restore(); });
        }
      },
    };
    Object.keys(F).forEach(k => { const f = F[k]; D[k] = (c, t, act) => { c.save(); f(c, t, act); c.restore(); }; });
  }
})();
