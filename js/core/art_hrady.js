/* =========================================================================
   HRADY – NOVÉ VZHLEDY S VLASTNÍM TVAREM
   Každý vzhled hradu mění nejen barvy, ale i tvar: povrch zdí (krystaly, láva,
   kůra stromu, kosti, runy, hvězdné nebe…), okraj hradeb (rampouchy, poleva,
   ostny, sníh, listí…), ozdoby na špičkách věží a živé efekty nad hradem.
   Funguje pro všechny národy i velkou pevnost: tvar se odvodí z obrysu hradu.
   ========================================================================= */
(function () {
  if (!window.Art || !Art.castleImage || !window.GameData) return;
  const G = GameData, TAU = Math.PI * 2, OUT = Art.OUT || '#1a1410';
  const fs = (ctx, f, lw) => { ctx.fillStyle = f; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.stroke(); } };
  const rng = s => { let a = s >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* ---------------- NOVÉ VZHLEDY ---------------- */
  const P = (stone, stoneDark, stoneLight, roof, roofDark, window, trim, glowWindows) => ({ stone, stoneDark, stoneLight, roof, roofDark, window, trim, glowWindows: !!glowWindows });
  const NEW = [
    { id: 'lavova', name: 'Lávová kovárna', rarity: 'Legendární', price: 340, desc: 'Čedič protkaný žhnoucí lávou, z cimbuří stéká magma a na věžích hoří ohně.', en: { name: 'Lava Forge', desc: 'Basalt veined with glowing lava, magma dripping from the battlements and fires burning on the towers.' },
      palette: P('#3a3236', '#211c1f', '#544a4e', '#2a2226', '#140f12', '#ff7a1a', '#ff9a2a', 1), shape: { back: 'volcano', front: 'lavapool', tex: 'lava', edge: 'drips', edgeCol: '#ff7a1a', top: 'flame', fx: 'embers' } },
    { id: 'krystalova', name: 'Krystalová katedrála', rarity: 'Legendární', price: 360, desc: 'Celá vyrostla z fialových krystalů. Z věží trčí obří krystaly a vzduchem tančí jiskry.', en: { name: 'Crystal Cathedral', desc: 'Grown entirely from violet crystal. Giant crystals jut from the towers and sparks dance in the air.' },
      palette: P('#b8a4e8', '#7a62b8', '#e4d8ff', '#8a5cd8', '#5a3a9a', '#ff8ae0', '#f4ecff', 1), shape: { back: 'crystals', front: 'crystalbase', tex: 'facets', edge: 'crystals', edgeCol: '#e4d8ff', top: 'crystal', fx: 'sparkles' } },
    { id: 'kostena', name: 'Kostěná tvrz', rarity: 'Epický', price: 200, desc: 'Zdi z kostí a lebek, ostny na hradbách a zelené přízračné plamínky.', en: { name: 'Bone Keep', desc: 'Walls of bones and skulls, spikes on the battlements and green ghostly wisps.' },
      palette: P('#d8cdb0', '#9a8c6c', '#f2ead4', '#3a3a32', '#1e1e1a', '#7aff8a', '#5a5040', 1), shape: { back: 'ribs', front: 'bonepile', tex: 'skulls', edge: 'spikes', edgeCol: '#efe6cf', top: 'skull', fx: 'wisps' } },
    { id: 'strom', name: 'Strom života', rarity: 'Legendární', price: 320, desc: 'Hrad vyrostlý ze živého stromu: kůra, popínavé šlahouny, listnaté koruny a světlušky.', en: { name: 'Tree of Life', desc: 'A castle grown from a living tree: bark, climbing vines, leafy crowns and fireflies.' },
      palette: P('#8a6440', '#5a3e24', '#a88458', '#3f8a3a', '#255a22', '#ffe28a', '#d8f0a0', 1), shape: { back: 'canopy', front: 'roots', tex: 'bark', edge: 'leaves', edgeCol: '#4ea844', top: 'blossom', fx: 'fireflies' } },
    { id: 'pernikova', name: 'Perníková pevnost', rarity: 'Epický', price: 180, desc: 'Perník, bílá poleva stékající z hradeb, lízátkové proužky a želé bonbony na věžích.', en: { name: 'Gingerbread Fortress', desc: 'Gingerbread, white icing dripping off the walls, candy stripes and gumdrops on the towers.' },
      palette: P('#b8743a', '#7a4a20', '#d89a5a', '#ff6a9a', '#c03a6a', '#5a2a10', '#ffffff'), shape: { back: 'lollipops', front: 'canes', tex: 'candy', edge: 'icing', edgeCol: '#fffaf4', top: 'gumdrop', fx: 'sprinkles' } },
    { id: 'nebeska', name: 'Nebeský hrad', rarity: 'Legendární', price: 380, desc: 'Bílý hrad na oblacích se zlatými svatozářemi nad věžemi a třpytivým světlem.', en: { name: 'Sky Castle', desc: 'A white castle on the clouds with golden halos over the towers and glittering light.' },
      palette: P('#f4f2ec', '#c8c2b4', '#ffffff', '#ffd24a', '#c99a2a', '#7ab8ff', '#ffd24a', 1), shape: { back: 'wings', front: 'cloudsfront', tex: 'gold', edge: 'snow', edgeCol: '#ffffff', base: 'clouds', top: 'halo', fx: 'sparkles' } },
    { id: 'morska', name: 'Korálová citadela', rarity: 'Epický', price: 220, desc: 'Vylovená z hlubin: korály, mušle, chaluhy a perly na věžích. Kolem stoupají bubliny.', en: { name: 'Coral Citadel', desc: 'Raised from the deep: coral, shells, seaweed and pearls on the towers. Bubbles rise around it.' },
      palette: P('#3ab0a8', '#1f7a78', '#7ad8d0', '#ff7a6a', '#c04a3a', '#0a3a4a', '#ffd8a8'), shape: { back: 'fan', front: 'reef', tex: 'coral', edge: 'seaweed', edgeCol: '#2e8a4a', top: 'pearl', fx: 'bubbles' } },
    { id: 'hvezdna', name: 'Hvězdná observatoř', rarity: 'Legendární', price: 360, desc: 'Zdi z noční oblohy plné hvězd, zlaté srpky měsíce na věžích a mihotavé souhvězdí.', en: { name: 'Star Observatory', desc: 'Walls made of the night sky full of stars, golden crescents on the towers and twinkling constellations.' },
      palette: P('#2a3260', '#161a3a', '#3e4880', '#1a1f44', '#0e1230', '#ffe28a', '#ffd24a', 1), shape: { back: 'planet', front: 'telescope', tex: 'stars', edge: 'none', top: 'moon', fx: 'twinkle' } },
    { id: 'parni', name: 'Parní bašta', rarity: 'Epický', price: 200, desc: 'Měď, nýty a obří ozubená kola. Z komínů na věžích se valí pára.', en: { name: 'Steam Bastion', desc: 'Copper, rivets and huge cogwheels. Steam billows from the chimneys on the towers.' },
      palette: P('#8a8f96', '#5a5f68', '#b0b5bc', '#b8662e', '#7d401a', '#ffcf6a', '#d89a3a', 1), shape: { back: 'bigcog', front: 'pipes', tex: 'gears', edge: 'rivets', edgeCol: '#d89a3a', top: 'chimney', fx: 'steam' } },
    { id: 'runova', name: 'Runová mohyla', rarity: 'Vzácný', price: 120, desc: 'Starý mechem porostlý kámen s modře žhnoucími runami a menhiry na věžích.', en: { name: 'Rune Barrow', desc: 'Ancient moss-covered stone with blue-glowing runes and standing stones on the towers.' },
      palette: P('#8a9088', '#5a6058', '#a8ada4', '#4a5a4a', '#2a362a', '#7fc8ff', '#7fc8ff', 1), shape: { back: 'stonecircle', front: 'menhirs', tex: 'runes', edge: 'moss', edgeCol: '#5a8a3a', top: 'menhir', fx: 'motes' } },
    { id: 'sakurova', name: 'Sakurový palác', rarity: 'Vzácný', price: 110, desc: 'Bílé zdi, růžové střechy, kvetoucí větve sakury a padající okvětní lístky.', en: { name: 'Sakura Palace', desc: 'White walls, pink roofs, blooming sakura branches and falling petals.' },
      palette: P('#f2ece4', '#c8bcb0', '#ffffff', '#e87aa0', '#a84a6a', '#3a2a3a', '#ffb8cf'), shape: { back: 'sakura', front: 'petalsground', tex: 'branches', edge: 'blossoms', edgeCol: '#ffb8cf', top: 'lantern', fx: 'petals' } }
  ];
  NEW.forEach(s => { if (!G.castleSkins.find(x => x.id === s.id)) G.castleSkins.push(s); });
  // i staré vzhledy dostanou vlastní tvar
  const OLD = {
    pisecna: { back: 'palms', front: 'dunes', tex: 'sand', edge: 'none', top: 'onion', fx: 'dust' },
    temna: { front: 'thorns', tex: 'cracks', edge: 'spikes', edgeCol: '#2c2a33', top: 'orb', topCol: '#b25cff', fx: 'wisps', fxCol: '#b25cff' },
    ledova: { back: 'icespires', front: 'snowdrift', tex: 'facets', edge: 'icicles', edgeCol: '#e6f6ff', top: 'crystal', topCol: '#bfe8ff', fx: 'snow' },
    mramor: { back: 'sundisc', front: 'statues', tex: 'gold', edge: 'none', top: 'orb', topCol: '#ffd24a', fx: 'sparkles' }
  };
  G.castleSkins.forEach(s => { if (OLD[s.id] && !s.shape) s.shape = OLD[s.id]; });

  /* ---------------- OBRYS HRADU ---------------- */
  function outline(cv, w, h) {
    const res = cv.width / w, d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, W = cv.width;
    const top = new Array(Math.ceil(w)).fill(null);
    for (let x = 0; x < w; x++) { const px = Math.min(W - 1, Math.round(x * res)); for (let y = 0; y < cv.height; y += 1) { if (d[(y * W + px) * 4 + 3] > 140) { top[x] = y / res; break; } } }
    return top;
  }
  const flatRuns = (top, step) => { const out = []; for (let x = 2; x < top.length - 2; x += step) { const a = top[x], b = top[x - 2], c = top[x + 2]; if (a != null && b != null && c != null && Math.abs(a - b) < 1.5 && Math.abs(a - c) < 1.5) out.push([x, a]); } return out; };

  /* ---------------- POVRCHY (kreslí se jen na zdi: source-atop) ---------------- */
  const TEX = {
    lava(ctx, w, h, r) {
      for (let k = 0; k < 16; k++) { let x = r() * w, y = h - r() * 40; const pts = [[x, y]]; for (let i = 0; i < 9; i++) { x += (r() - 0.5) * 22; y -= 10 + r() * 16; pts.push([x, y]); }
        [[7, 'rgba(255,80,20,.25)'], [3.4, 'rgba(255,120,30,.85)'], [1.3, '#ffe08a']].forEach(([lw, c]) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.lineJoin = 'round'; ctx.stroke(); }); }
      const g = ctx.createLinearGradient(0, h - 60, 0, h); g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, 'rgba(255,90,20,.45)'); ctx.fillStyle = g; ctx.fillRect(0, h - 60, w, 60);
    },
    cracks(ctx, w, h, r) { for (let k = 0; k < 12; k++) { let x = r() * w, y = 60 + r() * (h - 60); ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (r() - 0.5) * 18; y += 6 + r() * 10; ctx.lineTo(x, y); } ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(178,92,255,.35)'; ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(230,190,255,.8)'; ctx.stroke(); } },
    facets(ctx, w, h, r) {
      for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, s = 8 + r() * 22; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.6, y); ctx.lineTo(x, y + s * 0.7); ctx.lineTo(x - s * 0.5, y); ctx.closePath(); ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(40,20,90,.14)'; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke(); }
      for (let k = 0; k < 18; k++) star4(ctx, r() * w, r() * h, 2 + r() * 3, 'rgba(255,255,255,.9)');
    },
    skulls(ctx, w, h, r) {
      for (let k = 0; k < 26; k++) { const x = r() * w, y = 40 + r() * (h - 40), s = 4 + r() * 4; skull(ctx, x, y, s); }
      ctx.strokeStyle = 'rgba(90,70,40,.5)'; ctx.lineWidth = 2.2; for (let k = 0; k < 30; k++) { const x = r() * w, y = r() * h, a = r() * Math.PI; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 9, y - Math.sin(a) * 9); ctx.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); ctx.stroke(); }
    },
    bark(ctx, w, h, r) {
      ctx.strokeStyle = 'rgba(40,24,10,.45)'; ctx.lineWidth = 1.6;
      for (let x = 0; x < w; x += 7 + r() * 6) { ctx.beginPath(); let y = 0, xx = x; ctx.moveTo(xx, y); while (y < h) { y += 14; xx += (r() - 0.5) * 4; ctx.lineTo(xx, y); } ctx.stroke(); }
      for (let k = 0; k < 10; k++) { const x = r() * w, y = 60 + r() * (h - 80); ctx.beginPath(); ctx.ellipse(x, y, 5, 8, 0, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,24,10,.55)'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y, 2, 4, 0, 0, TAU); ctx.fillStyle = 'rgba(30,18,8,.6)'; ctx.fill(); }
      // popínavé šlahouny
      for (let k = 0; k < 9; k++) { let x = r() * w, y = h; ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 8; i++) { x += Math.sin(i + k) * 8; y -= 18 + r() * 10; ctx.lineTo(x, y); leaf(ctx, x, y, 4, i % 2 ? 0.6 : -0.6, '#4ea844'); } ctx.lineWidth = 2; ctx.strokeStyle = '#2e6a28'; ctx.stroke(); }
    },
    candy(ctx, w, h, r) {
      for (let y = h * 0.62; y < h; y += h * 0.22) { ctx.save(); ctx.beginPath(); ctx.rect(0, y, w, 10); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(0, y, w, 10); ctx.fillStyle = '#ff4a7a'; for (let x = -20; x < w; x += 14) { ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x + 7, y); ctx.lineTo(x + 13, y); ctx.lineTo(x + 6, y + 10); ctx.closePath(); ctx.fill(); } ctx.restore(); }
      const C = ['#ff4a7a', '#4ac8ff', '#ffd24a', '#7be04a', '#b07aff', '#ffffff'];
      for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, a = r() * Math.PI; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = C[k % C.length]; ctx.fillRect(-2.2, -0.8, 4.4, 1.6); ctx.restore(); }
      for (let k = 0; k < 8; k++) { const x = r() * w, y = 70 + r() * (h - 90); ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); fs(ctx, '#ffffff', 1.2); ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.save(); ctx.clip(); ctx.strokeStyle = '#ff4a7a'; ctx.lineWidth = 2; for (let a = 0; a < 4; a++) { ctx.beginPath(); ctx.arc(x, y, 3 + a, a, a + 2.4); ctx.stroke(); } ctx.restore(); }
    },
    gold(ctx, w, h, r) {
      ctx.strokeStyle = 'rgba(255,210,74,.85)'; ctx.lineWidth = 1.6;
      for (let y = 30; y < h; y += 38) { ctx.beginPath(); for (let x = 0; x <= w; x += 6) { const yy = y + Math.sin(x * 0.08) * 3; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
        for (let x = 10; x < w; x += 24) { ctx.beginPath(); ctx.arc(x, y + Math.sin(x * 0.08) * 3, 2.4, 0, TAU); ctx.fillStyle = '#ffe28a'; ctx.fill(); } }
      for (let k = 0; k < 22; k++) { const x = r() * w, y = r() * h; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 1.5); ctx.stroke(); }
    },
    coral(ctx, w, h, r) {
      for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, s = 1.5 + r() * 3.5; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(0,40,40,.35)'; ctx.stroke(); }
      for (let k = 0; k < 10; k++) { const x = r() * w, y = 80 + r() * (h - 100); shell(ctx, x, y, 6 + r() * 4); }
      for (let k = 0; k < 7; k++) coralBranch(ctx, r() * w, h, 30 + r() * 40, r, k % 2 ? '#ff7a6a' : '#ffb347');
    },
    stars(ctx, w, h, r) {
      ctx.fillStyle = 'rgba(8,10,30,.45)'; ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.7); g.addColorStop(0, 'rgba(140,90,220,.3)'); g.addColorStop(1, 'rgba(40,60,160,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let k = 0; k < 220; k++) { ctx.beginPath(); ctx.arc(r() * w, r() * h, r() < 0.9 ? 0.7 : 1.4, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${0.5 + r() * 0.5})`; ctx.fill(); }
      for (let k = 0; k < 14; k++) star4(ctx, r() * w, r() * h, 3 + r() * 3, '#fff6c8');
      // souhvězdí
      for (let c = 0; c < 3; c++) { let x = r() * w, y = 60 + r() * (h - 120); ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 4; i++) { x += (r() - 0.3) * 30; y += (r() - 0.5) * 24; ctx.lineTo(x, y); } ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,230,140,.6)'; ctx.stroke(); }
    },
    gears(ctx, w, h, r) {
      for (let k = 0; k < 9; k++) gear(ctx, r() * w, 60 + r() * (h - 80), 9 + r() * 14, k % 2 ? '#d89a3a' : '#9aa0aa');
      ctx.strokeStyle = '#6a3a1a'; ctx.lineWidth = 5;
      for (let k = 0; k < 4; k++) { const y = 80 + r() * (h - 120), x0 = r() * w * 0.5, x1 = x0 + 40 + r() * 80; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y + 30); ctx.stroke(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#d89a3a'; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#6a3a1a'; }
      for (let y = 20; y < h; y += 30) for (let x = 6; x < w; x += 16) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fillStyle = 'rgba(255,230,180,.55)'; ctx.fill(); }
    },
    runes(ctx, w, h, r) {
      for (let k = 0; k < 40; k++) { const x = r() * w, y = 30 + r() * (h - 30); ctx.beginPath(); ctx.ellipse(x, y, 8 + r() * 14, 4 + r() * 6, 0, 0, TAU); ctx.fillStyle = 'rgba(70,120,50,.35)'; ctx.fill(); }
      ctx.lineCap = 'round';
      for (let k = 0; k < 22; k++) { const x = r() * w, y = 60 + r() * (h - 80); rune(ctx, x, y, 6, r, 'rgba(127,200,255,.35)', 4); rune(ctx, x, y, 6, rngSame(k), '#bfe8ff', 1.4); }
    },
    sand(ctx, w, h, r) { ctx.strokeStyle = 'rgba(120,80,30,.3)'; ctx.lineWidth = 1.2; for (let y = 20; y < h; y += 12) { ctx.beginPath(); for (let x = 0; x <= w; x += 8) { const yy = y + Math.sin(x * 0.05 + y) * 2; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
      for (let k = 0; k < 6; k++) { const x = r() * w, y = 80 + r() * (h - 120); ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x, y); ctx.arc(x + 6, y, 6, Math.PI, 0); ctx.lineTo(x + 12, y + 10); ctx.closePath(); ctx.lineWidth = 2; ctx.strokeStyle = '#c9962a'; ctx.stroke(); } },
    branches(ctx, w, h, r) {
      for (let k = 0; k < 6; k++) { let x = r() < 0.5 ? 0 : w, y = 40 + r() * (h * 0.6); const dir = x ? -1 : 1; ctx.beginPath(); ctx.moveTo(x, y); const pts = []; for (let i = 0; i < 6; i++) { x += dir * (14 + r() * 12); y += (r() - 0.6) * 10; ctx.lineTo(x, y); pts.push([x, y]); } ctx.lineWidth = 3; ctx.strokeStyle = '#4a2a1e'; ctx.stroke(); pts.forEach(p => blossom(ctx, p[0], p[1] - 3, 3.5)); }
    }
  };
  const rngSame = k => rng(9000 + k * 77);

  /* ---------------- OKRAJE HRADEB ---------------- */
  const EDGE = {
    none() {},
    drips(ctx, top, col, r) { flatRuns(top, 3).forEach(([x, y], i) => { if (r() < 0.45) { const L = 6 + r() * 16; ctx.beginPath(); ctx.moveTo(x - 2.4, y); ctx.lineTo(x - 1.6, y + L); ctx.arc(x, y + L, 2, Math.PI, 0, true); ctx.lineTo(x + 2.4, y); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.beginPath(); ctx.arc(x - 0.6, y + L - 1, 0.8, 0, TAU); ctx.fillStyle = '#ffe08a'; ctx.fill(); } }); capLine(ctx, top, col, 2.8); },
    icing(ctx, top, col, r) { capLine(ctx, top, col, 4.4, true); flatRuns(top, 4).forEach(([x, y]) => { if (r() < 0.5) { const L = 4 + r() * 12; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x - 2.4, y + L); ctx.arc(x, y + L, 2.6, Math.PI, 0, true); ctx.lineTo(x + 3, y); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(120,80,60,.5)'; ctx.stroke(); } }); },
    icicles(ctx, top, col, r) { capLine(ctx, top, '#ffffff', 3.4, true); flatRuns(top, 5).forEach(([x, y]) => { if (r() < 0.6) { const L = 5 + r() * 15; ctx.beginPath(); ctx.moveTo(x - 2.6, y + 1); ctx.lineTo(x, y + L); ctx.lineTo(x + 2.6, y + 1); ctx.closePath(); ctx.fillStyle = 'rgba(230,246,255,.9)'; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(80,140,190,.8)'; ctx.stroke(); } }); },
    spikes(ctx, top, col, r) { flatRuns(top, 9).forEach(([x, y]) => { if (r() < 0.75) { const L = 7 + r() * 9; ctx.beginPath(); ctx.moveTo(x - 3, y + 1); ctx.quadraticCurveTo(x - 1, y - L * 0.6, x + (r() - 0.5) * 3, y - L); ctx.quadraticCurveTo(x + 1, y - L * 0.5, x + 3, y + 1); ctx.closePath(); fs(ctx, col, 1.2); } }); },
    crystals(ctx, top, col, r) { flatRuns(top, 11).forEach(([x, y]) => { if (r() < 0.7) crystal(ctx, x, y + 2, 4 + r() * 4, 10 + r() * 14, (r() - 0.5) * 0.6, '#c8b8ff'); }); },
    snow(ctx, top, col, r) { capLine(ctx, top, col, 4.6, true); flatRuns(top, 7).forEach(([x, y]) => { if (r() < 0.5) { ctx.beginPath(); ctx.arc(x, y - 1, 3 + r() * 2.5, Math.PI, 0); ctx.fillStyle = col; ctx.fill(); } }); },
    leaves(ctx, top, col, r) { flatRuns(top, 5).forEach(([x, y]) => { for (let k = 0; k < 2; k++) leaf(ctx, x + (r() - 0.5) * 6, y + (r() - 0.6) * 6, 4 + r() * 3, (r() - 0.5) * 2.4, r() < 0.5 ? col : '#2e7a28'); if (r() < 0.12) blossom(ctx, x, y - 2, 3, '#ffd2ea'); }); },
    seaweed(ctx, top, col, r) { flatRuns(top, 8).forEach(([x, y]) => { if (r() < 0.5) { const L = 10 + r() * 18; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 5, y + L * 0.3, x - 5, y + L * 0.6, x + 2, y + L); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); } if (r() < 0.12) shell(ctx, x, y - 2, 4); }); },
    rivets(ctx, top, col) { capLine(ctx, top, col, 3); flatRuns(top, 6).forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y + 3, 1.3, 0, TAU); ctx.fillStyle = '#ffe0a8'; ctx.fill(); }); },
    moss(ctx, top, col, r) { flatRuns(top, 4).forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x, y + 1, 3.6 + r() * 2, 2 + r() * 1.6, 0, 0, TAU); ctx.fillStyle = r() < 0.5 ? col : '#7aa84a'; ctx.fill(); if (r() < 0.2) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 4, y + 6 + r() * 10); ctx.lineWidth = 1.4; ctx.strokeStyle = col; ctx.stroke(); } }); },
    blossoms(ctx, top, col, r) { flatRuns(top, 7).forEach(([x, y]) => { if (r() < 0.5) blossom(ctx, x, y - 1, 3 + r() * 1.6, r() < 0.5 ? col : '#ffd8e6'); }); }
  };
  function capLine(ctx, top, col, lw, round) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    let on = false; ctx.beginPath();
    for (let x = 0; x < top.length; x++) { const y = top[x]; if (y == null) { on = false; continue; } if (!on) { ctx.moveTo(x, y + lw * 0.3); on = true; } else ctx.lineTo(x, y + lw * 0.3); }
    ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
  }

  /* ---------------- DROBNÉ TVARY ---------------- */
  function star4(ctx, x, y, s, col) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fillStyle = col; ctx.fill(); }
  function skull(ctx, x, y, s) { ctx.beginPath(); ctx.arc(x, y, s, Math.PI, 0); ctx.lineTo(x + s * 0.7, y + s * 0.9); ctx.lineTo(x - s * 0.7, y + s * 0.9); ctx.closePath(); fs(ctx, '#f2ead4', 0.9); ctx.beginPath(); ctx.arc(x - s * 0.38, y + s * 0.1, s * 0.26, 0, TAU); ctx.arc(x + s * 0.38, y + s * 0.1, s * 0.26, 0, TAU); ctx.fillStyle = '#2a2018'; ctx.fill(); }
  function leaf(ctx, x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s, -s * 0.8, s * 2, 0); ctx.quadraticCurveTo(s, s * 0.8, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(20,50,10,.6)'; ctx.stroke(); ctx.restore(); }
  function blossom(ctx, x, y, s, col) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.7, s * 0.6, s * 0.42, a, 0, TAU); ctx.fillStyle = col || '#ffb8cf'; ctx.fill(); } ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0, TAU); ctx.fillStyle = '#ffd24a'; ctx.fill(); }
  function shell(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.6); ctx.arc(x, y, s, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); fs(ctx, '#ffe0c8', 0.9); ctx.strokeStyle = 'rgba(160,90,60,.7)'; ctx.lineWidth = 0.7; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.6); ctx.lineTo(x + i * s * 0.35, y - s * 0.85); ctx.stroke(); } }
  function coralBranch(ctx, x, y, L, r, col) { const br = (x, y, a, l, d) => { const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.lineWidth = Math.max(1.2, 4 - d); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); if (d < 3) { br(x2, y2, a - 0.45 - r() * 0.3, l * 0.7, d + 1); br(x2, y2, a + 0.45 + r() * 0.3, l * 0.7, d + 1); } }; br(x, y, -Math.PI / 2, L * 0.4, 0); }
  function gear(ctx, x, y, R, col) { ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, rr = i % 2 ? R : R * 0.78; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); fs(ctx, col, 1.2); ctx.beginPath(); ctx.arc(x, y, R * 0.42, 0, TAU); fs(ctx, '#3a3a40', 1); ctx.beginPath(); ctx.arc(x, y, R * 0.15, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
  function crystal(ctx, x, y, w, h, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.8, -h * 0.75); ctx.lineTo(0, -h); ctx.lineTo(w * 0.8, -h * 0.75); ctx.lineTo(w, 0); ctx.closePath(); fs(ctx, col, 1.2); ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(-w * 0.15, 0); ctx.lineTo(-w * 0.8, -h * 0.75); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill(); ctx.restore(); }
  function rune(ctx, x, y, s, r, col, lw) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); const k = Math.floor(r() * 4); if (k === 0) { ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.7, y - s * 0.3); } else if (k === 1) { ctx.moveTo(x - s * 0.6, y - s * 0.4); ctx.lineTo(x + s * 0.6, y + s * 0.2); } else if (k === 2) { ctx.moveTo(x, y); ctx.lineTo(x + s * 0.7, y - s * 0.6); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.7, y + s * 0.6); } else { ctx.moveTo(x - s * 0.6, y - s * 0.6); ctx.lineTo(x + s * 0.6, y - s * 0.1); ctx.lineTo(x - s * 0.6, y + s * 0.4); } ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); }

  /* ---------------- OZDOBY NA ŠPIČKÁCH VĚŽÍ ---------------- */
  const TOP = {
    flame(ctx, x, y) { ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x, y + 8, x + 8, y); ctx.closePath(); fs(ctx, '#2a2226', 1.4); const g = ctx.createRadialGradient(x, y - 8, 1, x, y - 8, 22); g.addColorStop(0, 'rgba(255,160,60,.55)'); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.fillRect(x - 24, y - 32, 48, 48);
      [['#ff6a1a', 15], ['#ffb347', 10], ['#fff0b0', 5]].forEach(([c, h]) => { ctx.beginPath(); ctx.moveTo(x - h * 0.45, y); ctx.quadraticCurveTo(x - h * 0.5, y - h * 0.8, x, y - h * 1.3); ctx.quadraticCurveTo(x + h * 0.5, y - h * 0.8, x + h * 0.45, y); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }); },
    crystal(ctx, x, y, col) { crystal(ctx, x - 6, y + 2, 3.5, 14, -0.35, col || '#d8c8ff'); crystal(ctx, x + 6, y + 2, 3.5, 12, 0.35, col || '#d8c8ff'); crystal(ctx, x, y + 2, 5, 22, 0, col || '#e8dcff'); star4(ctx, x + 2, y - 16, 3, '#fff'); },
    skull(ctx, x, y) { skull(ctx, x, y - 6, 8); ctx.beginPath(); ctx.moveTo(x - 9, y - 10); ctx.quadraticCurveTo(x - 18, y - 18, x - 16, y - 26); ctx.quadraticCurveTo(x - 12, y - 16, x - 6, y - 12); ctx.closePath(); fs(ctx, '#e8dcbc', 1); ctx.beginPath(); ctx.moveTo(x + 9, y - 10); ctx.quadraticCurveTo(x + 18, y - 18, x + 16, y - 26); ctx.quadraticCurveTo(x + 12, y - 16, x + 6, y - 12); ctx.closePath(); fs(ctx, '#e8dcbc', 1); ctx.beginPath(); ctx.arc(x - 3, y - 5.6, 1.4, 0, TAU); ctx.arc(x + 3, y - 5.6, 1.4, 0, TAU); ctx.fillStyle = '#7aff8a'; ctx.fill(); },
    blossom(ctx, x, y) { for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; leaf(ctx, x + Math.cos(a) * 6, y - 8 + Math.sin(a) * 5, 5, a, k % 2 ? '#4ea844' : '#3f8a3a'); } blossom(ctx, x, y - 10, 5.5, '#ffd2ea'); blossom(ctx, x - 8, y - 4, 3.5, '#fff0f6'); blossom(ctx, x + 8, y - 5, 3.5, '#ffd2ea'); },
    gumdrop(ctx, x, y) { const C = ['#ff4a7a', '#4ac8ff', '#7be04a']; ctx.beginPath(); ctx.moveTo(x - 9, y + 2); ctx.quadraticCurveTo(x - 9, y - 16, x, y - 16); ctx.quadraticCurveTo(x + 9, y - 16, x + 9, y + 2); ctx.closePath(); fs(ctx, C[Math.floor(Math.abs(x) % 3)], 1.4); for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.arc(x - 6 + (k * 37 % 12), y - 12 + (k * 23 % 12), 0.9, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); } ctx.beginPath(); ctx.ellipse(x - 3.5, y - 10, 2, 3.5, -0.4, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill(); },
    halo(ctx, x, y) { ctx.beginPath(); ctx.ellipse(x, y - 30, 14, 4.6, 0, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,226,138,.45)'; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#ffd24a'; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 2, 5, 0, TAU); fs(ctx, '#ffe28a', 1.2); },
    pearl(ctx, x, y) { ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.quadraticCurveTo(x - 12, y - 12, x - 2, y - 8); ctx.lineTo(x + 2, y - 8); ctx.quadraticCurveTo(x + 12, y - 12, x + 10, y); ctx.closePath(); fs(ctx, '#ffd8c8', 1.2); const g = ctx.createRadialGradient(x - 2, y - 10, 1, x, y - 8, 7); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d8e0f0'); ctx.beginPath(); ctx.arc(x, y - 8, 6, 0, TAU); fs(ctx, g, 1.2); },
    moon(ctx, x, y) { ctx.beginPath(); ctx.arc(x, y - 12, 10, 0.6, TAU - 0.6); ctx.arc(x + 5, y - 12, 7.5, TAU - 0.9, 0.9, true); ctx.closePath(); fs(ctx, '#ffd24a', 1.4); star4(ctx, x + 10, y - 24, 3.5, '#fff6c8'); },
    chimney(ctx, x, y) { ctx.beginPath(); ctx.rect(x - 5, y - 18, 10, 20); fs(ctx, '#6a3a1a', 1.4); ctx.beginPath(); ctx.rect(x - 7, y - 21, 14, 4); fs(ctx, '#d89a3a', 1.2); gear(ctx, x + 8, y - 6, 5, '#9aa0aa'); },
    menhir(ctx, x, y) { ctx.beginPath(); ctx.moveTo(x - 6, y + 2); ctx.lineTo(x - 5, y - 18); ctx.quadraticCurveTo(x, y - 24, x + 5, y - 19); ctx.lineTo(x + 6, y + 2); ctx.closePath(); fs(ctx, '#8a9088', 1.4); rune(ctx, x, y - 9, 4.5, rng(Math.round(x)), '#bfe8ff', 1.4); },
    lantern(ctx, x, y) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 4); ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y - 11, 6, 8, 0, 0, TAU); fs(ctx, '#e83a3a', 1.3); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.8; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(x, y - 11, 6 * (0.3 + Math.abs(i) * 0.5), 8, 0, -Math.PI / 2, Math.PI / 2, i < 0); ctx.stroke(); } ctx.beginPath(); ctx.rect(x - 3, y - 20, 6, 2); ctx.rect(x - 3, y - 4, 6, 2); ctx.fillStyle = '#2a2a2a'; ctx.fill(); },
    onion(ctx, x, y) { ctx.beginPath(); ctx.moveTo(x - 8, y + 2); ctx.bezierCurveTo(x - 14, y - 8, x - 4, y - 14, x, y - 24); ctx.bezierCurveTo(x + 4, y - 14, x + 14, y - 8, x + 8, y + 2); ctx.closePath(); fs(ctx, '#2ab8c8', 1.4); ctx.beginPath(); ctx.moveTo(x - 4, y - 2); ctx.bezierCurveTo(x - 8, y - 8, x - 2, y - 12, x, y - 20); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 25, 2, 0, TAU); fs(ctx, '#ffd24a', 0.8); },
    orb(ctx, x, y, col) { const c = col || '#b25cff'; const g = ctx.createRadialGradient(x, y - 8, 1, x, y - 8, 18); g.addColorStop(0, c + 'aa'); g.addColorStop(1, c + '00'); ctx.fillStyle = g; ctx.fillRect(x - 20, y - 28, 40, 40); ctx.beginPath(); ctx.arc(x, y - 8, 6.5, 0, TAU); fs(ctx, c, 1.3); ctx.beginPath(); ctx.arc(x - 2, y - 10, 2, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); }
  };

  /* ---------------- PODKLAD (např. oblaka pod hradem) ---------------- */
  function clouds(ctx, w, h, r) {
    for (let k = 0; k < 16; k++) { const x = (k / 15) * w + (r() - 0.5) * 20, y = h - 6 - r() * 18, s = 14 + r() * 14; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); }
    for (let k = 0; k < 10; k++) { const x = r() * w, y = h - 2 - r() * 8; ctx.beginPath(); ctx.arc(x, y, 9 + r() * 8, 0, TAU); ctx.fillStyle = 'rgba(220,230,245,.95)'; ctx.fill(); }
  }

  /* ---------------- VELKÉ STAVBY ZA HRADEM (back) A PŘED NÍM (front) ---------------- */
  const PAD = 120;
  const tallest = flags => flags.reduce((a, f) => (f.y < a.y ? f : a), flags[0] || { x: 0, y: 0 });
  function feather(ctx, x, y, a, L, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -L * 0.18, L, 0); ctx.quadraticCurveTo(L * 0.5, L * 0.14, 0, 0); fs(ctx, col, 1.2); ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(L * 0.9, 0); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(160,130,60,.5)'; ctx.stroke(); ctx.restore(); }
  function wingShape(ctx, x, y, dir, S) {
    // křídlo míří ven (dir 1 = doprava); tři řady per od dlouhých letek po krátké krovky
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * S, S);
    const rows = [[9, 120, '#ffe9a8'], [8, 86, '#fff6dc'], [6, 54, '#ffffff']];
    rows.forEach(([n, L, col], ri) => { for (let i = n - 1; i >= 0; i--) { const a = -1.15 + i * (1.5 / (n - 1)); feather(ctx, ri * 4, ri * 6, a, L * (1 - i * 0.04), col); } });
    ctx.restore();
  }
  const BACK = {
    volcano(ctx, w, h, fl, r) { ctx.beginPath(); ctx.moveTo(-PAD * 0.8, h); ctx.lineTo(w * 0.28, -40); ctx.lineTo(w * 0.42, -52); ctx.lineTo(w * 0.56, -38); ctx.lineTo(w + PAD * 0.8, h); ctx.closePath(); fs(ctx, '#3a2a28', 2);
      ctx.beginPath(); ctx.moveTo(w * 0.28, -40); ctx.quadraticCurveTo(w * 0.42, -30, w * 0.56, -38); ctx.lineTo(w * 0.42, -52); ctx.closePath(); ctx.fillStyle = '#ff7a1a'; ctx.fill();
      for (let k = 0; k < 4; k++) { let x = w * (0.32 + k * 0.07), y = -36; ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (r() - 0.4) * 26 * (k % 2 ? 1 : -1); y += 22; ctx.lineTo(x, y); } ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,90,20,.5)'; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#ffb347'; ctx.stroke(); }
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(w * 0.42 + (k - 2) * 12, -62 - k * 14, 12 + k * 4, 0, TAU); ctx.fillStyle = `rgba(60,50,50,${0.5 - k * 0.07})`; ctx.fill(); } },
    crystals(ctx, w, h, fl, r) { [[0.2, 1], [0.38, 1.5], [0.55, 1.15], [0.7, 0.9]].forEach(([fx, k], i) => { crystal(ctx, w * fx, h * 0.55, 16 * k, 160 * k, (i - 1.5) * 0.18, i % 2 ? '#a88ae8' : '#c8b0ff'); }); },
    ribs(ctx, w, h, fl, r) { ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const x = w * (0.12 + i * 0.13), H = 120 + Math.sin(i * 0.9) * 30; ctx.beginPath(); ctx.moveTo(x - 10, h * 0.6); ctx.quadraticCurveTo(x - 40, h * 0.3 - H, x + 30, -H * 0.4); ctx.lineWidth = 11; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#efe6cf'; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.35); ctx.quadraticCurveTo(w * 0.5, -30, w * 0.9, h * 0.32); ctx.lineWidth = 13; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 10; ctx.strokeStyle = '#e0d4b4'; ctx.stroke(); },
    canopy(ctx, w, h, fl, r) { ctx.beginPath(); ctx.moveTo(w * 0.44, h); ctx.bezierCurveTo(w * 0.4, h * 0.5, w * 0.36, h * 0.3, w * 0.42, 0); ctx.lineTo(w * 0.58, 0); ctx.bezierCurveTo(w * 0.62, h * 0.3, w * 0.6, h * 0.5, w * 0.56, h); ctx.closePath(); fs(ctx, '#5a3e24', 2);
      const blobs = []; for (let k = 0; k < 22; k++) blobs.push([w * 0.5 + (r() - 0.5) * w * 1.15, -10 + (r() - 0.5) * 110, 30 + r() * 26]);
      blobs.forEach(([x, y, s]) => { ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); fs(ctx, '#2e7a28', 2); }); blobs.forEach(([x, y, s]) => { ctx.beginPath(); ctx.arc(x - s * 0.2, y - s * 0.25, s * 0.7, 0, TAU); ctx.fillStyle = '#4ea844'; ctx.fill(); });
      for (let k = 0; k < 18; k++) { const b = blobs[k % blobs.length]; ctx.beginPath(); ctx.arc(b[0] + (r() - 0.5) * b[2], b[1] + (r() - 0.5) * b[2], 3.4, 0, TAU); ctx.fillStyle = r() < 0.5 ? '#ffd2ea' : '#ffe28a'; ctx.fill(); } },
    lollipops(ctx, w, h, fl, r) { [[0.08, 150, '#ff4a7a'], [0.5, 190, '#4ac8ff'], [0.9, 140, '#7be04a']].forEach(([fx, H, c]) => { const x = w * fx; ctx.beginPath(); ctx.rect(x - 3, h * 0.4 - H + 40, 6, H); fs(ctx, '#fff', 1.4); const y = h * 0.4 - H + 30; ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); fs(ctx, '#fff', 2); ctx.save(); ctx.beginPath(); ctx.arc(x, y, 32, 0, TAU); ctx.clip(); ctx.lineWidth = 7; ctx.strokeStyle = c; ctx.beginPath(); for (let a = 0; a < 26; a += 0.2) { const rr = a * 1.3; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.stroke(); ctx.restore(); }); },
    wings(ctx, w, h, fl, r) { wingShape(ctx, w - 20, h * 0.36, 1, 1); wingShape(ctx, 20, h * 0.36, -1, 1); },
    fan(ctx, w, h, fl, r) { const x = w * 0.5, y = h * 0.62; for (let i = 0; i < 13; i++) { const a = Math.PI + i / 12 * Math.PI; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - 0.12) * 230, y + Math.sin(a - 0.12) * 230); ctx.arc(x, y, 230, a - 0.12, a + 0.12); ctx.closePath(); fs(ctx, i % 2 ? '#ffb8a8' : '#ffd8c8', 1.6); }
      for (let k = 0; k < 5; k++) coralBranch(ctx, w * (0.1 + k * 0.2), h * 0.5, 110 + r() * 60, r, k % 2 ? '#ff7a6a' : '#c84a9a'); },
    planet(ctx, w, h, fl, r) { const x = w * 0.62, y = -10; const g = ctx.createRadialGradient(x - 20, y - 20, 6, x, y, 70); g.addColorStop(0, '#c8a0ff'); g.addColorStop(1, '#4a2a8a'); ctx.beginPath(); ctx.ellipse(x, y, 120, 24, -0.25, Math.PI, TAU); ctx.lineWidth = 7; ctx.strokeStyle = '#ffd27a'; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 62, 0, TAU); fs(ctx, g, 2); ctx.beginPath(); ctx.ellipse(x, y, 120, 24, -0.25, 0, Math.PI); ctx.lineWidth = 7; ctx.strokeStyle = '#ffd27a'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.12, -30, 30, 0.6, TAU - 0.6); ctx.arc(w * 0.12 + 14, -30, 23, TAU - 0.9, 0.9, true); ctx.closePath(); fs(ctx, '#fff2b0', 1.6); for (let k = 0; k < 10; k++) star4(ctx, r() * w, -90 + r() * 70, 3 + r() * 3, '#fff6c8'); },
    bigcog(ctx, w, h, fl, r) { gear(ctx, w * 0.3, h * 0.15, 95, '#7a7f88'); gear(ctx, w * 0.78, h * 0.05, 60, '#b8662e'); gear(ctx, w * 0.06, h * 0.45, 40, '#9aa0aa'); },
    stonecircle(ctx, w, h, fl, r) { for (let i = 0; i < 7; i++) { const x = -PAD * 0.6 + i * (w + PAD * 1.2) / 6, H = 90 + r() * 60; ctx.beginPath(); ctx.moveTo(x - 16, h); ctx.lineTo(x - 14, h - H); ctx.quadraticCurveTo(x, h - H - 14, x + 14, h - H + 2); ctx.lineTo(x + 16, h); ctx.closePath(); fs(ctx, '#7a8078', 2); rune(ctx, x, h - H * 0.55, 9, rng(i + 3), 'rgba(127,200,255,.5)', 5); rune(ctx, x, h - H * 0.55, 9, rng(i + 3), '#bfe8ff', 2); }
      ctx.beginPath(); ctx.rect(-PAD * 0.6 - 18, h - 170, w + PAD * 1.2 + 36, 18); fs(ctx, '#8a9088', 2); },
    sakura(ctx, w, h, fl, r) { const x = -30; ctx.beginPath(); ctx.moveTo(x - 14, h); ctx.bezierCurveTo(x - 6, h * 0.5, x + 30, h * 0.3, x + 70, h * 0.05); ctx.lineTo(x + 80, h * 0.12); ctx.bezierCurveTo(x + 40, h * 0.35, x + 14, h * 0.55, x + 12, h); ctx.closePath(); fs(ctx, '#4a2a1e', 2);
      for (let k = 0; k < 26; k++) { const bx = x + 20 + r() * 220, by = -20 + r() * 120, s = 16 + r() * 18; ctx.beginPath(); ctx.arc(bx, by, s, 0, TAU); ctx.fillStyle = k % 3 ? '#ffb8cf' : '#ff9ab8'; ctx.fill(); } for (let k = 0; k < 40; k++) blossom(ctx, x + 20 + r() * 220, -20 + r() * 120, 3, '#fff0f6'); },
    palms(ctx, w, h, fl, r) { [[-40, 1], [w + 30, -1]].forEach(([x, d]) => { ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + d * 30, h * 0.5, x + d * 10, h * 0.15); ctx.lineWidth = 10; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#8a6a3a'; ctx.stroke(); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.5; ctx.save(); ctx.translate(x + d * 10, h * 0.15); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -14, 70, 14); ctx.quadraticCurveTo(40, 4, 0, 0); fs(ctx, i % 2 ? '#3f8a3a' : '#5aaa4a', 1.4); ctx.restore(); } }); },
    batwings(ctx, w, h, fl, r) { [[30, 1], [w - 30, -1]].forEach(([x, d]) => { ctx.save(); ctx.translate(x, h * 0.3); ctx.scale(-d, 1); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, -110); ctx.quadraticCurveTo(80, -60, 110, -70); ctx.quadraticCurveTo(100, -20, 130, -10); ctx.quadraticCurveTo(90, 10, 100, 40); ctx.quadraticCurveTo(50, 20, 0, 40); ctx.closePath(); fs(ctx, '#2a1a30', 2); ctx.strokeStyle = '#4a3058'; ctx.lineWidth = 2; [[60, -110], [110, -70], [130, -10], [100, 40]].forEach(p => { ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(p[0], p[1]); ctx.stroke(); }); ctx.restore(); }); },
    icespires(ctx, w, h, fl, r) { for (let i = 0; i < 6; i++) crystal(ctx, w * (0.05 + i * 0.18), h * 0.5, 12 + r() * 8, 130 + r() * 90, (r() - 0.5) * 0.3, i % 2 ? '#d8f0ff' : '#a8d8f8'); },
    sundisc(ctx, w, h, fl, r) { const x = w * 0.45, y = -6; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(a - 0.06) * 60, y + Math.sin(a - 0.06) * 60); ctx.lineTo(x + Math.cos(a) * (i % 2 ? 110 : 90), y + Math.sin(a) * (i % 2 ? 110 : 90)); ctx.lineTo(x + Math.cos(a + 0.06) * 60, y + Math.sin(a + 0.06) * 60); ctx.closePath(); fs(ctx, i % 2 ? '#ffd24a' : '#ffe9a0', 1); } ctx.beginPath(); ctx.arc(x, y, 62, 0, TAU); fs(ctx, '#ffd24a', 2); ctx.beginPath(); ctx.arc(x, y, 48, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = '#c99a2a'; ctx.stroke(); }
  };
  const FRONT = {
    lavapool(ctx, w, h, fl, r) { ctx.beginPath(); ctx.ellipse(w * 0.4, h + 2, w * 0.55, 10, 0, 0, TAU); fs(ctx, '#ff6a1a', 1.6); ctx.beginPath(); ctx.ellipse(w * 0.4, h, w * 0.4, 5, 0, 0, TAU); ctx.fillStyle = '#ffd27a'; ctx.fill(); for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(w * (0.05 + r() * 0.7), h + (r() - 0.5) * 6, 2 + r() * 3, 0, TAU); ctx.fillStyle = '#3a2226'; ctx.fill(); } },
    crystalbase(ctx, w, h, fl, r) { for (let k = 0; k < 9; k++) crystal(ctx, -20 + r() * (w + 40), h + 2, 5 + r() * 6, 18 + r() * 30, (r() - 0.5) * 0.8, r() < 0.5 ? '#c8b0ff' : '#e8dcff'); },
    bonepile(ctx, w, h, fl, r) { for (let k = 0; k < 10; k++) skull(ctx, -30 + r() * (w + 60), h - 4, 5 + r() * 3); for (let k = 0; k < 8; k++) { const x = -30 + r() * (w + 60), a = (r() - 0.5) * 1.2; ctx.save(); ctx.translate(x, h - 2); ctx.rotate(a); ctx.beginPath(); ctx.rect(-10, -1.8, 20, 3.6); fs(ctx, '#efe6cf', 1); ctx.restore(); } },
    roots(ctx, w, h, fl, r) { ctx.lineCap = 'round'; for (let k = 0; k < 9; k++) { let x = w * (0.05 + k * 0.11), y = h - 30 - r() * 40; ctx.beginPath(); ctx.moveTo(x, y); const d = k < 4 ? -1 : 1; ctx.bezierCurveTo(x + d * 12, y + 14, x + d * 22, h - 4, x + d * (36 + r() * 20), h + 3); ctx.lineWidth = 9; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 6.5; ctx.strokeStyle = '#6a4a2a'; ctx.stroke(); } },
    canes(ctx, w, h, fl, r) { [[-14, 1], [w * 0.72, -1], [w + 16, -1]].forEach(([x, d]) => { ctx.save(); ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, h - 110); ctx.arc(x + d * 14, h - 110, 14, Math.PI, d > 0 ? 0 : Math.PI * 2, d < 0); ctx.lineWidth = 12; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.setLineDash([8, 8]); ctx.strokeStyle = '#ff2a5a'; ctx.stroke(); ctx.restore(); }); },
    cloudsfront(ctx, w, h, fl, r) { for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.arc(-60 + k * (w + 120) / 11, h + 2 - r() * 10, 16 + r() * 12, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.fill(); } },
    reef(ctx, w, h, fl, r) { for (let k = 0; k < 6; k++) coralBranch(ctx, -20 + r() * (w + 40), h + 2, 40 + r() * 30, r, ['#ff7a6a', '#ffb347', '#c84a9a'][k % 3]); for (let k = 0; k < 5; k++) shell(ctx, -20 + r() * (w + 40), h - 3, 7 + r() * 4); },
    telescope(ctx, w, h, fl, r) { const f = tallest(fl); if (!f) return; ctx.save(); ctx.translate(f.x + 4, f.y + 30); ctx.rotate(-0.7); ctx.beginPath(); ctx.rect(-6, -8, 64, 16); fs(ctx, '#c99a2a', 2); ctx.beginPath(); ctx.rect(56, -11, 14, 22); fs(ctx, '#ffd24a', 2); ctx.beginPath(); ctx.arc(70, 0, 8, 0, TAU); fs(ctx, '#7ab8ff', 1.4); ctx.restore(); },
    pipes(ctx, w, h, fl, r) { ctx.lineCap = 'round'; [[0.1, 0.55], [0.85, 0.45]].forEach(([fx, fy]) => { const x = w * fx; ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, h * fy); ctx.lineTo(x + 30, h * fy); ctx.lineWidth = 12; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#b8662e'; ctx.stroke(); ctx.beginPath(); ctx.arc(x, h * fy + 30, 8, 0, TAU); fs(ctx, '#d8dce4', 1.4); ctx.beginPath(); ctx.moveTo(x, h * fy + 30); ctx.lineTo(x + 5, h * fy + 26); ctx.lineWidth = 1.5; ctx.strokeStyle = '#c03a2a'; ctx.stroke(); }); },
    menhirs(ctx, w, h, fl, r) { [[-28], [w + 26]].forEach(([x], i) => { ctx.beginPath(); ctx.moveTo(x - 13, h); ctx.lineTo(x - 11, h - 70); ctx.quadraticCurveTo(x, h - 82, x + 11, h - 70); ctx.lineTo(x + 13, h); ctx.closePath(); fs(ctx, '#8a9088', 2); rune(ctx, x, h - 40, 9, rng(i + 40), 'rgba(127,200,255,.5)', 5); rune(ctx, x, h - 40, 9, rng(i + 40), '#bfe8ff', 2); }); },
    petalsground(ctx, w, h, fl, r) { for (let k = 0; k < 40; k++) { ctx.beginPath(); ctx.ellipse(-30 + r() * (w + 60), h - 1 + r() * 3, 2.6, 1.4, r() * 3, 0, TAU); ctx.fillStyle = k % 2 ? '#ffb8cf' : '#ffd8e6'; ctx.fill(); } },
    dunes(ctx, w, h, fl, r) { ctx.beginPath(); ctx.moveTo(-60, h + 4); ctx.quadraticCurveTo(-10, h - 22, 50, h + 4); ctx.quadraticCurveTo(w * 0.8, h - 14, w + 60, h + 4); ctx.closePath(); fs(ctx, '#e8c890', 1.4); },
    thorns(ctx, w, h, fl, r) { for (let k = 0; k < 8; k++) { const x = -30 + r() * (w + 60), H = 30 + r() * 40; ctx.beginPath(); ctx.moveTo(x - 5, h); ctx.quadraticCurveTo(x + (r() - 0.5) * 20, h - H * 0.6, x + (r() - 0.5) * 14, h - H); ctx.quadraticCurveTo(x + 2, h - H * 0.4, x + 5, h); ctx.closePath(); fs(ctx, '#2a1a30', 1.4); } },
    snowdrift(ctx, w, h, fl, r) { for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.ellipse(-40 + k * (w + 80) / 9, h, 26 + r() * 16, 9 + r() * 6, 0, Math.PI, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); } },
    statues(ctx, w, h, fl, r) { [[-26], [w + 24]].forEach(([x]) => { ctx.beginPath(); ctx.rect(x - 14, h - 24, 28, 24); fs(ctx, '#f4f2ec', 1.8); ctx.beginPath(); ctx.ellipse(x, h - 58, 9, 26, 0, 0, TAU); fs(ctx, '#e8e4dc', 1.6); ctx.beginPath(); ctx.arc(x, h - 88, 8, 0, TAU); fs(ctx, '#e8e4dc', 1.6); ctx.beginPath(); ctx.ellipse(x, h - 99, 9, 2.6, 0, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = '#ffd24a'; ctx.stroke(); }); }
  };
  function overlay(fn, base, r, S, toppers) {
    const w = base.w, h = base.h, res = Math.min(2, base.canvas.width / w);
    const cv = document.createElement('canvas'); cv.width = Math.round((w + PAD * 2) * res); cv.height = Math.round((h + PAD + 10) * res);
    const ctx = cv.getContext('2d'); ctx.scale(res, res); ctx.translate(PAD, PAD);
    try { if (fn) fn(ctx, w, h, base.flags || [], r); if (toppers && S.top && TOP[S.top]) (base.flags || []).forEach(f => { ctx.save(); ctx.translate(f.x, f.y + 4); ctx.scale(1.7, 1.7); TOP[S.top](ctx, 0, 0, S.topCol); ctx.restore(); }); } catch (e) { console.warn('Hrad – stavba', e); }
    return cv;
  }
  function drawOv(ctx, ov, img, front, groundY, facing) {
    if (!ov) return;
    const W = img.w + PAD * 2, H = img.h + PAD + 10, top = groundY - img.h;
    ctx.save();
    if (facing === 1) ctx.drawImage(ov, front - img.w + 2 - PAD, top - PAD, W, H);
    else { ctx.translate(front - 2 + img.w, top); ctx.scale(-1, 1); ctx.drawImage(ov, -PAD, -PAD, W, H); }
    ctx.restore();
  }

  /* ---------------- VÝROBA HRADU S TVAREM (cache) ---------------- */
  const cache = new WeakMap();
  const orig = Art.castleImage;
  function shaped(base, skinId) {
    const sk = G.castleSkins.find(s => s.id === skinId), S = sk && sk.shape;
    if (!S || !base || !base.canvas) return base;
    if (cache.has(base)) return cache.get(base);
    const w = base.w, h = base.h, res = base.canvas.width / w;
    const cv = document.createElement('canvas'); cv.width = base.canvas.width; cv.height = base.canvas.height;
    const ctx = cv.getContext('2d'); ctx.drawImage(base.canvas, 0, 0); ctx.scale(res, res);
    const r = rng(skinId.length * 131 + Math.round(w) * 7 + Math.round(h));
    const top = outline(base.canvas, w, h);
    try {
      if (TEX[S.tex]) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; TEX[S.tex](ctx, w, h, r); ctx.restore(); }
      if (EDGE[S.edge]) { ctx.save(); EDGE[S.edge](ctx, top, S.edgeCol || '#fff', r); ctx.restore(); }
      if (S.base === 'clouds') clouds(ctx, w, h, r);
    } catch (e) { console.warn('Hrad s tvarem', skinId, e); }
    const out = Object.assign({}, base, { canvas: cv, shapeFx: S.fx, shapeFxCol: S.fxCol, ovBack: BACK[S.back] ? overlay(BACK[S.back], base, rng(skinId.length * 7 + 1), S, false) : null, ovFront: overlay(FRONT[S.front], base, rng(skinId.length * 11 + 2), S, true) });
    cache.set(base, out);
    return out;
  }
  Art.castleImage = function (team, skinId) { return shaped(orig.apply(this, arguments), skinId); };
  // ikona v obchodě: stejná jako původní, jen přes hrad s tvarem
  Art.renderCastleIcon = function (canvas, team, skinId, level, style) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth || canvas.width, ch = canvas.clientHeight || canvas.height;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, cw, ch);
    const img = Art.castleImage(team, skinId, level || 1, 2, style || 'evropa');
    const s = Math.min(cw / (img.w + 30), ch / (img.h + 40)), fx = cw / 2 + (img.w * s) / 2;
    ctx.save(); ctx.scale(s, s); Art.drawCastle(ctx, img, fx / s, ch / s - 4, 1, performance.now() / 1000, 1, G.teamCastleColors[team].banner); ctx.restore();
  };

  /* ---------------- ŽIVÉ EFEKTY NAD HRADEM ---------------- */
  const FX = {
    embers: (i, ph) => ({ dy: -ph, c: `rgba(255,${130 + (i % 3) * 40},40,${1 - ph})`, s: 1.6 }),
    sparkles: (i, ph) => ({ dy: -ph * 0.3, c: `rgba(255,255,255,${Math.sin(ph * Math.PI)})`, s: 2, star: 1 }),
    wisps: (i, ph, col) => ({ dy: -ph * 0.8, c: col ? col + 'aa' : `rgba(122,255,138,${0.7 * (1 - ph)})`, s: 2.6, sway: 8 }),
    fireflies: (i, ph) => ({ dy: -ph * 0.25, c: `rgba(255,236,120,${Math.sin(ph * Math.PI)})`, s: 1.8, sway: 14, glow: 1 }),
    sprinkles: (i, ph) => ({ dy: ph, c: ['#ff4a7a', '#4ac8ff', '#ffd24a', '#7be04a'][i % 4], s: 1.8, rect: 1 }),
    bubbles: (i, ph) => ({ dy: -ph, c: `rgba(200,250,255,${0.7 * (1 - ph)})`, s: 2.4 + (i % 3), ring: 1, sway: 5 }),
    twinkle: (i, ph) => ({ dy: 0, c: `rgba(255,246,200,${Math.max(0, Math.sin(ph * TAU))})`, s: 2.6, star: 1 }),
    steam: (i, ph) => ({ dy: -ph * 0.7, c: `rgba(230,230,235,${0.45 * (1 - ph)})`, s: 4 + ph * 10, sway: 6, fromTop: 1 }),
    motes: (i, ph) => ({ dy: -ph * 0.6, c: `rgba(160,220,255,${0.8 * Math.sin(ph * Math.PI)})`, s: 1.6, sway: 6 }),
    petals: (i, ph) => ({ dy: ph, c: i % 2 ? '#ffb8cf' : '#ffd8e6', s: 2.6, petal: 1, sway: 20 }),
    snow: (i, ph) => ({ dy: ph, c: 'rgba(255,255,255,.9)', s: 1.8, sway: 10 }),
    dust: (i, ph) => ({ dy: -ph * 0.15, c: `rgba(230,200,140,${0.4 * Math.sin(ph * Math.PI)})`, s: 2.2, sway: 30 })
  };
  const origDraw = Art.drawCastle;
  Art.drawCastle = function (ctx, img, front, groundY, facing, t) {
    if (img && img.ovBack) drawOv(ctx, img.ovBack, img, front, groundY, facing);
    origDraw.apply(this, arguments);
    if (img && img.ovFront) drawOv(ctx, img.ovFront, img, front, groundY, facing);
    const f = img && img.shapeFx && FX[img.shapeFx]; if (!f) return;
    const x0 = facing === 1 ? front - img.w + 2 : front - 2, top = groundY - img.h, now = performance.now() / 1000;
    for (let i = 0; i < 18; i++) {
      const sp = 0.08 + (i % 5) * 0.02, ph = (now * sp + i * 0.173) % 1, o = f(i, ph, img.shapeFxCol);
      let x = x0 + ((i * 97) % 100) / 100 * img.w, y;
      if (o.fromTop && img.flags && img.flags.length) { const fl = img.flags[i % img.flags.length]; x = facing === 1 ? x0 + fl.x : front - 2 + (img.w - fl.x); y = top + fl.y - 14 + o.dy * 70; }
      else y = o.dy < 0 ? top + img.h * 0.55 + o.dy * img.h * 0.8 : o.dy > 0 ? top - 30 + o.dy * (img.h + 20) : top + ((i * 53) % 100) / 100 * img.h * 0.8;
      if (o.sway) x += Math.sin(now * 1.3 + i) * o.sway;
      ctx.save();
      if (o.glow) { ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(x, y, o.s * 3, 0, TAU); ctx.fillStyle = o.c; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.c;
      if (o.star) star4(ctx, x, y, o.s, o.c);
      else if (o.rect) { ctx.translate(x, y); ctx.rotate(i + now); ctx.fillRect(-o.s, -o.s * 0.35, o.s * 2, o.s * 0.7); }
      else if (o.petal) { ctx.translate(x, y); ctx.rotate(now * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, o.s, o.s * 0.55, 0, 0, TAU); ctx.fill(); }
      else if (o.ring) { ctx.beginPath(); ctx.arc(x, y, o.s, 0, TAU); ctx.lineWidth = 1; ctx.strokeStyle = o.c; ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x, y, o.s, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
  };
})();
