/* =========================================================================
   SVĚT – detailní evropská krajina, vrstvy pro hloubku (parallax)
   a pohyblivé mraky. Bojiště se kreslí do dvou vrstev:
     far  = nebe, hory, vzdálené kopce (posouvá se pomaleji = hloubka)
     near = stromy, louka, cesta, kytky (posouvá se s kamerou)
   ========================================================================= */
(function () {
  const { OUT, shade, fs, rng } = Art;
  const TAU = Math.PI * 2;
  const C = () => GameData.battleConfig;
  const T = window.ArtThemes;

  /* ---------- pomocné tvary ---------- */
  function ridge(ctx, W, base, amp, step, col, rand, jag = 0.5) {
    ctx.beginPath(); ctx.moveTo(-20, 700);
    let y = base;
    for (let x = -20; x <= W + 40; x += step) {
      y = base - amp * (0.5 + 0.5 * Math.sin(x * 0.0021 + base)) - rand() * amp * jag;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 40, 700); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  }
  function roundTree(ctx, x, y, s, rand, cols) {
    // kmen
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y); ctx.lineTo(x - 2 * s, y - 26 * s); ctx.lineTo(x + 2 * s, y - 26 * s); ctx.lineTo(x + 3.5 * s, y); ctx.closePath();
    ctx.fillStyle = '#5a3d26'; ctx.fill();
    ctx.lineWidth = 1.2 * s; ctx.strokeStyle = '#3a2616'; ctx.stroke();
    // koruna – tři tóny listí (stín, základ, světlo)
    const blobs = [];
    for (let i = 0; i < 9; i++) blobs.push([x + (rand() - 0.5) * 34 * s, y - 34 * s - rand() * 26 * s, (10 + rand() * 9) * s]);
    ctx.fillStyle = cols[0];
    blobs.forEach(([bx, by, r]) => { ctx.beginPath(); ctx.arc(bx + 2 * s, by + 3 * s, r, 0, TAU); ctx.fill(); });
    ctx.fillStyle = cols[1];
    blobs.forEach(([bx, by, r]) => { ctx.beginPath(); ctx.arc(bx, by, r * 0.92, 0, TAU); ctx.fill(); });
    ctx.fillStyle = cols[2];
    blobs.forEach(([bx, by, r]) => { ctx.beginPath(); ctx.arc(bx - r * 0.3, by - r * 0.35, r * 0.5, 0, TAU); ctx.fill(); });
  }
  function bush(ctx, x, y, s, rand, cols) {
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = cols[k];
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(x + (i - 1.5) * 7 * s - k * s, y - 6 * s - k * 2 * s - (i % 2) * 3 * s, (7 - k * 1.6) * s, 0, TAU); ctx.fill();
      }
    }
  }
  function flower(ctx, x, y, col, rand) {
    ctx.strokeStyle = '#3e7a2a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 1, y - 5, x + (rand() - 0.5) * 3, y - 9); ctx.stroke();
    const fx = x + (rand() - 0.5) * 3, fy = y - 9;
    ctx.fillStyle = col;
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 1.8, fy + Math.sin(a) * 1.8, 1.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#f6d24a'; ctx.beginPath(); ctx.arc(fx, fy, 1, 0, TAU); ctx.fill();
  }
  function grassTuft(ctx, x, y, h, rand, cols) {
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = cols[i % cols.length]; ctx.lineWidth = 1.5;
      const dx = (i - 2) * 1.6;
      ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.quadraticCurveTo(x + dx + 1, y - h * 0.6, x + dx * 2.4 + (rand() - 0.5) * 3, y - h * (0.7 + rand() * 0.4)); ctx.stroke();
    }
  }
  function rock(ctx, x, y, r, moss) {
    ctx.beginPath(); ctx.moveTo(x - r * 1.4, y); ctx.quadraticCurveTo(x - r * 1.3, y - r * 0.9, x - r * 0.3, y - r * 1.05);
    ctx.quadraticCurveTo(x + r * 1.1, y - r * 1.1, x + r * 1.45, y); ctx.closePath();
    const g = ctx.createLinearGradient(x - r, y - r, x + r, y);
    g.addColorStop(0, '#b4b8bf'); g.addColorStop(1, '#6d727b');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#3a3e45'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.7, r * 0.5, r * 0.18, -0.2, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
    if (moss) { ctx.beginPath(); ctx.ellipse(x + r * 0.3, y - r * 0.95, r * 0.6, r * 0.2, 0.1, 0, TAU); ctx.fillStyle = 'rgba(90,140,60,.7)'; ctx.fill(); }
  }
  function fence(ctx, x0, x1, y) {
    for (let x = x0; x < x1; x += 46) {
      ctx.fillStyle = '#7a5434'; ctx.strokeStyle = '#3a2616'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.rect(x, y - 24, 5, 26); ctx.fill(); ctx.stroke();
      if (x + 46 < x1) {
        for (const yy of [y - 19, y - 9]) { ctx.beginPath(); ctx.rect(x + 3, yy, 46, 3.6); ctx.fill(); ctx.stroke(); }
      }
    }
  }
  function windmill(ctx, x, y, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x - 9 * s, y); ctx.lineTo(x - 6 * s, y - 34 * s); ctx.lineTo(x + 6 * s, y - 34 * s); ctx.lineTo(x + 9 * s, y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 34 * s); ctx.lineTo(x, y - 44 * s); ctx.lineTo(x + 8 * s, y - 34 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2.2 * s;
    for (let i = 0; i < 4; i++) { const a = 0.4 + i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(x, y - 36 * s); ctx.lineTo(x + Math.cos(a) * 24 * s, y - 36 * s + Math.sin(a) * 24 * s); ctx.stroke(); }
  }
  function farCastle(ctx, x, y, s, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x - 30 * s, y - 22 * s, 60 * s, 22 * s);
    for (const [dx, h] of [[-26, 40], [-6, 52], [16, 36]]) {
      ctx.fillRect(x + dx * s, y - h * s, 10 * s, h * s);
      ctx.beginPath(); ctx.moveTo(x + dx * s - 2 * s, y - h * s); ctx.lineTo(x + dx * s + 5 * s, y - h * s - 12 * s); ctx.lineTo(x + dx * s + 12 * s, y - h * s); ctx.closePath(); ctx.fill();
    }
  }
  function village(ctx, x, y, s, rand) {
    for (let i = 0; i < 6; i++) {
      const hx = x + i * 14 * s + rand() * 4 * s, hy = y - rand() * 3 * s;
      ctx.fillStyle = '#d9cdb4'; ctx.fillRect(hx, hy - 7 * s, 10 * s, 7 * s);
      ctx.fillStyle = i % 2 ? '#a5523a' : '#8d4a36';
      ctx.beginPath(); ctx.moveTo(hx - 2 * s, hy - 7 * s); ctx.lineTo(hx + 5 * s, hy - 13 * s); ctx.lineTo(hx + 12 * s, hy - 7 * s); ctx.closePath(); ctx.fill();
    }
  }
  function birds(ctx, W, rand, n, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.6;
    for (let i = 0; i < n; i++) {
      const x = rand() * W, y = 70 + rand() * 120, s = 4 + rand() * 4;
      ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x - s / 2, y - s / 2, x, y); ctx.quadraticCurveTo(x + s / 2, y - s / 2, x + s, y); ctx.stroke();
    }
  }

  /* ---------- EVROPA: zelené údolí ---------- */
  T.battle.evropa = (ctx, W, H, seed, layer) => {
    const rand = rng(seed || 7);
    const cfg = C();
    const FAR = layer !== 'near', NEAR = layer !== 'far';
    if (FAR) {
      const sky = ctx.createLinearGradient(0, 0, 0, 400);
      sky.addColorStop(0, '#3d7fd0'); sky.addColorStop(0.5, '#8cc2ec'); sky.addColorStop(1, '#e6f3f7');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // slunce a paprsky
      const sx = W * 0.7, sy = 110;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * 0.35 + i * 0.09;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 900, sy + Math.sin(a) * 900); ctx.lineTo(sx + Math.cos(a + 0.035) * 900, sy + Math.sin(a + 0.035) * 900); ctx.closePath();
        ctx.fillStyle = 'rgba(255,240,200,.035)'; ctx.fill();
      }
      ctx.restore();
      const sun = ctx.createRadialGradient(sx, sy, 8, sx, sy, 240);
      sun.addColorStop(0, 'rgba(255,252,230,1)'); sun.addColorStop(0.12, 'rgba(255,246,210,.7)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, 420);
      birds(ctx, W, rand, 14, 'rgba(40,50,70,.55)');
      // vzdálené velehory se sněhem
      Art.mountains(ctx, W, 330, 140, 230, 120, '#93a9c9', '#f6f9fc', rand);
      ctx.fillStyle = 'rgba(220,235,246,.35)'; ctx.fillRect(0, 200, W, 140);
      Art.mountains(ctx, W, 352, 80, 150, 95, '#7290b4', '#e9f0f7', rand);
      // opar
      const haze = ctx.createLinearGradient(0, 290, 0, 390);
      haze.addColorStop(0, 'rgba(225,238,246,0)'); haze.addColorStop(1, 'rgba(225,238,246,.75)');
      ctx.fillStyle = haze; ctx.fillRect(0, 290, W, 100);
      // vzdálené kopce s vesnicí, mlýnem a hradem
      ridge(ctx, W, 385, 30, 40, '#7fa0a0', rand, 0.3);
      for (let x = 0; x < W; x += 6 + rand() * 6) Art.pine(ctx, x, 392 + rand() * 6, 14 + rand() * 10, '#5d8584', '#527776');
      farCastle(ctx, W * 0.22, 372, 0.9, '#6f8a93');
      windmill(ctx, W * 0.55, 380, 0.8, '#6f8a93');
      village(ctx, W * 0.62, 386, 0.9, rand);
      farCastle(ctx, W * 0.86, 370, 0.7, '#6f8a93');
      ctx.fillStyle = 'rgba(225,238,246,.35)'; ctx.fillRect(0, 360, W, 50);
    }
    if (!NEAR) return;
    for (let i = 0; i < 500; i++) rand();
    // bližší kopce
    const hill = ctx.createLinearGradient(0, 380, 0, 450);
    hill.addColorStop(0, '#79ad4c'); hill.addColorStop(1, '#5e933b');
    ctx.fillStyle = hill;
    ctx.beginPath(); ctx.moveTo(0, 420);
    for (let x = 0; x <= W; x += 30) ctx.lineTo(x, 404 + Math.sin(x * 0.005) * 14 + Math.sin(x * 0.019) * 5);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // lesy a stromy na kopcích
    for (let x = -10; x < W + 10; x += 16 + rand() * 14) Art.pine(ctx, x, 428 + rand() * 8, 34 + rand() * 26, '#2f6b3a', '#24552d');
    const leaf = [['#2f6a2e', '#4a8f3a', '#79b956'], ['#3a6a26', '#5c9a34', '#94c75a']];
    for (let x = 40; x < W; x += 90 + rand() * 140) roundTree(ctx, x, 440 + rand() * 6, 0.9 + rand() * 0.5, rand, leaf[(x | 0) % 2]);
    // louka
    const gr = ctx.createLinearGradient(0, 436, 0, H);
    gr.addColorStop(0, '#86b851'); gr.addColorStop(1, '#4f8a33');
    ctx.fillStyle = gr; ctx.fillRect(0, 440, W, H - 440);
    for (let i = 0; i < W / 10; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,200,.08)' : 'rgba(20,60,10,.08)';
      ctx.beginPath(); ctx.ellipse(rand() * W, 440 + rand() * (H - 440), 20 + rand() * 40, 4 + rand() * 4, 0, 0, TAU); ctx.fill();
    }
    // keře u cesty
    const bc = ['#2f6a2e', '#4a8f3a', '#79b956'];
    for (let x = 60; x < W; x += 140 + rand() * 180) bush(ctx, x, cfg.laneTop - 16, 1 + rand() * 0.4, rand, bc);
    // plot
    for (let x = 320; x < W - 400; x += 700 + rand() * 300) fence(ctx, x, x + 230 + rand() * 120, cfg.laneTop - 14);
    // cesta s vyjetými kolejemi
    const top = cfg.laneTop, bot = cfg.laneBottom;
    const road = ctx.createLinearGradient(0, top - 16, 0, bot + 16);
    road.addColorStop(0, '#c09c6a'); road.addColorStop(0.5, '#ab8653'); road.addColorStop(1, '#93703f');
    ctx.fillStyle = road;
    ctx.beginPath(); ctx.moveTo(0, top - 14);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, top - 14 + Math.sin(x * 0.02) * 3);
    for (let x = W; x >= 0; x -= 40) ctx.lineTo(x, bot + 14 + Math.sin(x * 0.015) * 4);
    ctx.closePath(); ctx.fill();
    for (const ry of [top + 16, bot - 16]) {
      ctx.strokeStyle = 'rgba(90,62,30,.35)'; ctx.lineWidth = 5;
      ctx.beginPath(); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, ry + Math.sin(x * 0.01) * 2.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,210,.18)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, ry - 3 + Math.sin(x * 0.01) * 2.5); ctx.stroke();
    }
    // kaluže
    for (let i = 0; i < 6; i++) {
      const x = 400 + rand() * (W - 800), y = top + 10 + rand() * (bot - top - 20);
      ctx.beginPath(); ctx.ellipse(x, y, 22 + rand() * 18, 4, 0, 0, TAU);
      const pg = ctx.createLinearGradient(0, y - 4, 0, y + 4); pg.addColorStop(0, '#9cc6e6'); pg.addColorStop(1, '#6f97b8');
      ctx.fillStyle = pg; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(70,50,30,.4)'; ctx.stroke();
    }
    for (let i = 0; i < W / 5; i++) {
      const x = rand() * W, y = top - 8 + rand() * (bot - top + 16);
      ctx.fillStyle = rand() < 0.5 ? 'rgba(90,64,34,.35)' : 'rgba(235,212,170,.4)';
      ctx.beginPath(); ctx.ellipse(x, y, 1.5 + rand() * 3.5, 1 + rand() * 1.2, 0, 0, TAU); ctx.fill();
    }
    // tráva, kytky a kameny v popředí
    const gc = ['#3e7a2a', '#5f9a3a', '#9ccc5e'];
    for (let i = 0; i < W / 2.2; i++) {
      const x = rand() * W, y = 444 + rand() * (H - 444);
      if (y > top - 20 && y < bot + 20) continue;
      grassTuft(ctx, x, y, 6 + rand() * 9, rand, gc);
    }
    const fcol = ['#e8463a', '#ffffff', '#5a7fe0', '#f2c94c', '#d86bd0'];
    for (let i = 0; i < W / 9; i++) {
      const x = rand() * W, y = rand() < 0.5 ? 448 + rand() * 18 : bot + 22 + rand() * 30;
      flower(ctx, x, y, fcol[i % fcol.length], rand);
    }
    for (let i = 0; i < 16; i++) rock(ctx, 300 + rand() * (W - 600), bot + 32 + rand() * 22, 7 + rand() * 11, rand() < 0.5);
    for (let i = 0; i < 6; i++) rock(ctx, 200 + rand() * (W - 400), top - 18 - rand() * 4, 5 + rand() * 6, true);
  };

  /* ---------- mraky – předkreslené obláčky, které pomalu plují ---------- */
  function cloudSprite(rand, tint) {
    const w = 260, h = 110;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    const blobs = [];
    for (let i = 0; i < 9; i++) blobs.push([40 + i * 22 + rand() * 10, 70 - Math.sin(i / 8 * Math.PI) * 30 - rand() * 10, 22 + rand() * 14]);
    x.fillStyle = tint[2]; blobs.forEach(([bx, by, r]) => { x.beginPath(); x.arc(bx, by + 6, r, 0, TAU); x.fill(); });
    x.fillStyle = tint[0]; blobs.forEach(([bx, by, r]) => { x.beginPath(); x.arc(bx, by, r, 0, TAU); x.fill(); });
    x.fillStyle = tint[1]; blobs.forEach(([bx, by, r]) => { x.beginPath(); x.arc(bx - r * 0.25, by - r * 0.3, r * 0.6, 0, TAU); x.fill(); });
    return c;
  }
  const CLOUD_TINTS = {
    evropa: ['rgba(255,255,255,.92)', 'rgba(255,255,255,1)', 'rgba(170,196,224,.55)'],
    japonsko: ['rgba(255,214,200,.75)', 'rgba(255,236,220,.9)', 'rgba(190,120,140,.45)'],
    sever: ['rgba(120,150,190,.35)', 'rgba(170,200,230,.4)', 'rgba(40,60,100,.3)']
  };
  function makeClouds(theme, W, n, seed) {
    const rand = rng(seed || 13);
    const tint = CLOUD_TINTS[theme] || CLOUD_TINTS.evropa;
    const arr = [];
    for (let i = 0; i < n; i++) arr.push({ img: cloudSprite(rand, tint), x: rand() * W, y: 40 + rand() * 170, s: 0.6 + rand() * 0.9, v: 4 + rand() * 9 });
    return arr;
  }
  function drawClouds(ctx, clouds, t, W) {
    for (const c of clouds) {
      const span = W + 300;
      const x = ((c.x + t * c.v) % span) - 260;
      ctx.drawImage(c.img, x, c.y, 260 * c.s, 110 * c.s);
    }
  }

  /* Vytvoří obě vrstvy bojiště */
  function makeLayers(W, H, seed, theme, res) {
    const mk = (layer, r) => {
      const cv = document.createElement('canvas');
      cv.width = Math.round(W * r); cv.height = Math.round(H * r);
      const x = cv.getContext('2d'); x.scale(r, r);
      Art.drawBattleBackground(x, W, H, seed, theme, layer);
      return cv;
    };
    return { far: mk('far', res * 0.8), near: mk('near', res), clouds: makeClouds(theme, W, (theme === 'sever' || theme === 'peklo') ? 0 : 9, seed) };
  }

  /* ---------- ZNAKY (erby) – kreslí se do kruhu o poloměru r ---------- */
  function drawEmblem(ctx, id, cx, cy, r, col) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(r / 12, r / 12);
    ctx.fillStyle = col; ctx.strokeStyle = col;
    switch (id) {
      case 'lev': {
        // lví hlava s hřívou
        ctx.beginPath();
        for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rr = i % 2 ? 9 : 12; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(0, 1, 6.2, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath(); ctx.arc(-2.4, -0.5, 1.1, 0, TAU); ctx.arc(2.4, -0.5, 1.1, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-1.6, 2.2); ctx.lineTo(1.6, 2.2); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2.5, 5.2); ctx.quadraticCurveTo(0, 6.4, 2.5, 5.2); ctx.stroke();
        break;
      }
      case 'orel': {
        ctx.beginPath(); ctx.ellipse(0, 1, 2.6, 7, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -7, 2.6, 0, TAU); ctx.fill();
        for (const d of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(d * 1.5, -3); ctx.lineTo(d * 12, -8); ctx.lineTo(d * 10, -4); ctx.lineTo(d * 12, -2); ctx.lineTo(d * 9, 1); ctx.lineTo(d * 10.5, 3); ctx.lineTo(d * 2, 2); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(d * 1, 7); ctx.lineTo(d * 5, 11); ctx.lineTo(d * 2, 9); ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'slunce': {
        ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, TAU); ctx.fill();
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.12) * 7, Math.sin(a - 0.12) * 7); ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a + 0.12) * 7, Math.sin(a + 0.12) * 7); ctx.closePath(); ctx.fill(); }
        break;
      }
      case 'hvezda': {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, rr = i % 2 ? 5 : 12; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'sakura': {
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + i / 5 * TAU;
          ctx.save(); ctx.rotate(a);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(5, -2, 11, 1); ctx.lineTo(9, 3); ctx.lineTo(11, 5); ctx.quadraticCurveTo(5, 6, 0, 0); ctx.fill();
          ctx.restore();
        }
        ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'havran': {
        ctx.beginPath();
        ctx.moveTo(-11, 2); ctx.quadraticCurveTo(-5, -9, 1, -3); ctx.quadraticCurveTo(4, -9, 9, -8); ctx.lineTo(12, -6); ctx.lineTo(9, -5);
        ctx.quadraticCurveTo(7, 0, 3, 2); ctx.lineTo(6, 9); ctx.lineTo(1, 4); ctx.lineTo(-3, 9); ctx.lineTo(-2, 3); ctx.quadraticCurveTo(-7, 4, -11, 2); ctx.closePath();
        ctx.fill();
        break;
      }
      case 'kriz': {
        ctx.beginPath();
        ctx.moveTo(-2.5, -12); ctx.lineTo(2.5, -12); ctx.lineTo(1.6, -2); ctx.lineTo(12, -2.5); ctx.lineTo(12, 2.5); ctx.lineTo(1.6, 2); ctx.lineTo(2.5, 12);
        ctx.lineTo(-2.5, 12); ctx.lineTo(-1.6, 2); ctx.lineTo(-12, 2.5); ctx.lineTo(-12, -2.5); ctx.lineTo(-1.6, -2); ctx.closePath(); ctx.fill();
        break;
      }
      case 'sekery': {
        ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(8, -9); ctx.moveTo(9, 10); ctx.lineTo(-8, -9); ctx.stroke();
        for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 7, -10); ctx.quadraticCurveTo(d * 13, -9, d * 12, -2); ctx.lineTo(d * 5, -6); ctx.closePath(); ctx.fill(); }
        break;
      }
      default: {
        // lilie
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(5.5, -3.5, 0, 6); ctx.quadraticCurveTo(-5.5, -3.5, 0, -12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-2, 1); ctx.quadraticCurveTo(-11, -8, -9, 4); ctx.quadraticCurveTo(-6, 6, -2, 4); ctx.fill();
        ctx.beginPath(); ctx.moveTo(2, 1); ctx.quadraticCurveTo(11, -8, 9, 4); ctx.quadraticCurveTo(6, 6, 2, 4); ctx.fill();
        ctx.fillRect(-7, 5, 14, 3);
        ctx.beginPath(); ctx.moveTo(-2, 8); ctx.lineTo(2, 8); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------- DEKORACE HRADU (zapékají se do obrázku hradu) ---------- */
  function hangBanner(ctx, x, y, w, h, pal) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w / 2, y + h - 10); ctx.lineTo(x, y + h); ctx.closePath();
    fs(ctx, pal.banner, 2);
    ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + w - 3, y + 3); ctx.lineTo(x + w - 3, y + h - 5); ctx.lineTo(x + w / 2, y + h - 14); ctx.lineTo(x + 3, y + h - 5); ctx.closePath();
    ctx.lineWidth = 1.4; ctx.strokeStyle = pal.emblem; ctx.stroke();
    drawEmblem(ctx, pal.emblemId, x + w / 2, y + h * 0.42, w * 0.36, pal.emblem);
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + w + 4, y); ctx.lineWidth = 4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#d9b24a'; ctx.stroke();
  }
  function heraldShield(ctx, x, y, pal) {
    ctx.beginPath(); ctx.moveTo(x - 10, y - 11); ctx.lineTo(x + 10, y - 11); ctx.quadraticCurveTo(x + 11, y + 4, x, y + 13); ctx.quadraticCurveTo(x - 11, y + 4, x - 10, y - 11); ctx.closePath();
    fs(ctx, pal.banner, 1.8);
    ctx.lineWidth = 1.4; ctx.strokeStyle = '#d9b24a'; ctx.stroke();
    drawEmblem(ctx, pal.emblemId, x, y, 6.5, pal.emblem);
  }
  function decorateCastle(ctx, img, cfg, style) {
    const d = (cfg && cfg.decor) || {};
    const pal = img.pal;
    const rand = rng(77);
    const B = 380;
    const J = style === 'japonsko', N = style === 'sever';
    // znak klanu na bráně (japonský hrad) a na věži (vikingská pevnost)
    if (J) {
      ctx.beginPath(); ctx.arc(276, 262, 10, 0, TAU); fs(ctx, '#f3efe6', 1.8);
      drawEmblem(ctx, pal.emblemId, 276, 262, 7.5, pal.banner);
    } else if (N) heraldShield(ctx, 276, 222, pal);
    // ZLACENÍ: široké zlaté pásy, zlatý rám brány a zlaté cimbuří
    if (d.zlato) {
      const y = J ? 197 : (N ? 300 : 250);
      const x1 = N ? 236 : 248;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, y - 4, x1, 9); const g = ctx.createLinearGradient(0, y - 4, 0, y + 5); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#f2c94c'); g.addColorStop(1, '#a8761a'); fs(ctx, g, 1.8);
      ctx.beginPath(); ctx.rect(0, B - 26, x1, 7); fs(ctx, g, 1.6);
      ctx.beginPath(); ctx.arc(277, 316, 31, Math.PI, 0); ctx.lineWidth = 9; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = '#f2c94c'; ctx.stroke();
      for (const x of [249, 305]) { ctx.beginPath(); ctx.rect(x - 4, 316, 8, B - 316); fs(ctx, '#f2c94c', 1.6); }
      ctx.restore();
    }
    // VELKÉ PRAPORY se znakem hradu
    if (d.prapory) {
      const pos = J ? [[60, 200], [118, 200], [176, 200]] : (N ? [[30, 300], [96, 300], [160, 300]] : [[14, 252], [74, 252], [134, 252], [194, 252]]);
      pos.forEach(([x, y]) => hangBanner(ctx, x, y, 34, J ? 92 : (N ? 70 : 104), pal));
    }
    // ERBOVNÍ ŠTÍTY – velké, na hradbě
    if (d.stity) {
      const ys = J ? 300 : (N ? 340 : 322);
      const xs = J ? [70, 130, 190] : [40, 100, 160, 220];
      xs.forEach(x => { ctx.save(); ctx.translate(x, ys); ctx.scale(1.9, 1.9); heraldShield(ctx, 0, 0, pal); ctx.restore(); });
    }
    // KAMENNÍ STRÁŽCI: dva lvi na podstavcích před hradbou
    if (d.sochy) {
      for (const [x, f] of [[200, 1], [118, -1]]) {
        ctx.save(); ctx.translate(x, B); ctx.scale(f * 1.6, 1.6);
        ctx.beginPath(); ctx.rect(-14, -14, 28, 14); fs(ctx, '#8b8f96', 1.8);
        ctx.beginPath(); ctx.rect(-16, -18, 32, 5); fs(ctx, '#a8adb6', 1.6);
        ctx.beginPath(); ctx.moveTo(-12, -18); ctx.quadraticCurveTo(-14, -30, -6, -34); ctx.quadraticCurveTo(0, -46, 8, -40); ctx.quadraticCurveTo(14, -36, 12, -28); ctx.lineTo(10, -18); ctx.closePath(); fs(ctx, '#c7ccd3', 1.8);
        ctx.beginPath(); ctx.arc(6, -38, 7.5, 0, TAU); fs(ctx, '#b6bcc5', 1.6);
        ctx.beginPath(); ctx.moveTo(-1, -44); for (let k = 0; k < 7; k++) { const a = -2.6 + k * 0.5; ctx.lineTo(6 + Math.cos(a) * 11, -38 + Math.sin(a) * 11); ctx.lineTo(6 + Math.cos(a + 0.25) * 8, -38 + Math.sin(a + 0.25) * 8); } ctx.closePath(); fs(ctx, '#9aa0aa', 1.4);
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(9, -39, 1.2, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    // ZAHRADA: velké keře, tvarované stromky a záhony
    if (d.zahrada) {
      const leaf = ['#2f6a2e', '#4a8f3a', '#79b956'];
      for (let x = 6; x < 240; x += 30 + rand() * 10) bush(ctx, x, B, 1.4 + rand() * 0.4, rand, leaf);
      for (const x of [30, 150]) { ctx.beginPath(); ctx.rect(x - 2, B - 18, 4, 18); fs(ctx, '#6b4528', 1.2); ctx.beginPath(); ctx.ellipse(x, B - 34, 11, 20, 0, 0, TAU); fs(ctx, '#2f7a3a', 1.6); ctx.beginPath(); ctx.ellipse(x - 3, B - 40, 4, 8, 0, 0, TAU); ctx.fillStyle = '#5aa84a'; ctx.fill(); }
      const fcol = ['#e8463a', '#ffffff', '#f2c94c', '#d86bd0'];
      for (let i = 0; i < 60; i++) {
        const x = 4 + rand() * 236, y = B - 2 - rand() * 10;
        ctx.fillStyle = fcol[i % 4]; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
      }
    }
    // pozice pochodní a ohňů (animace v drawCastle) – v souřadnicích základního hradu
    img.torchPts = J || N ? [[240, 304], [312, 304]] : [[240, 300], [313, 300]];
    if (d.pochodne) img.torchPts = img.torchPts.concat(J ? [[40, 214], [200, 214]] : N ? [[60, 316], [190, 316]] : [[60, 270], [180, 270]]);
    img.firePts = d.ohne ? (J ? [[30, 190], [120, 190], [210, 190]] : N ? [[40, 292], [130, 292], [220, 292]] : [[20, 240], [110, 240], [200, 240], [278, 172]]) : [];
  }

  Object.assign(Art, { drawEmblem, decorateCastle, makeLayers, drawClouds, makeClouds, roundTree, bush, rock, flower, grassTuft });
})();
