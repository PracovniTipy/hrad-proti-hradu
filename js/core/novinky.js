/* =========================================================================
   NOVINKY V BITVĚ
   1) POČASÍ A DENNÍ DOBA – každá bitva jinak: den, západ slunce, noc, déšť,
      sníh, mlha, bouřka. Každé počasí má i malý vliv na boj.
   2) HLASATEL (anglicky) – série zabití (Double Kill … Godlike), milníky,
      poplach na hradě, vítězství. Hlas přes syntézu řeči v angličtině,
      velké nápisy a odměna mincí za sérii.
   3) MAZLÍČEK – létá nad bojištěm, sbírá padlé mince a má vlastní schopnost.
   4) TROFEJE – padají z bossů, generálů a za velké činy v bitvě.
   Vše se napojuje přes háčky v battle.js (_onKill, _drawWorldFx, _drawScreenFx)
   a obalením Battle.prototype.update / _damage / _end.
   ========================================================================= */
(function () {
  if (!window.Battle) return;
  const G = GameData, B = Battle.prototype, TAU = Math.PI * 2;
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  const C = () => G.battleConfig;
  const US = () => (C().unitScale || 1);

  /* ======================= HLASATEL (anglicky) ======================= */
  const Ann = window.Hlasatel = {
    voice: null, last: 0,
    pickVoice() {
      if (!('speechSynthesis' in window)) return null;
      const vs = speechSynthesis.getVoices() || [];
      const pref = [/Daniel/i, /Google UK English Male/i, /Arthur/i, /Fred/i, /Alex/i, /Microsoft (George|Ryan|Guy|David)/i, /en-GB/i, /en-US/i, /^en/i];
      for (const re of pref) { const v = vs.find(x => re.test(x.name) || re.test(x.lang)); if (v && /^en/i.test(v.lang)) return (this.voice = v); }
      return (this.voice = vs.find(x => /^en/i.test(x.lang)) || null);
    },
    say(text, prio) {
      try {
        if (!window.Zvuk || !Zvuk.settings().sfx || !('speechSynthesis' in window)) return;
        const now = performance.now();
        if (!prio && now - this.last < 1200) return;          // ať hlasatel nemluví přes sebe
        if (prio) speechSynthesis.cancel();
        this.last = now;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-GB'; const v = this.voice || this.pickVoice(); if (v) u.voice = v;
        u.rate = 0.95; u.pitch = 0.7; u.volume = Math.min(1, (Zvuk.settings().sfxVol || 100) / 100);
        speechSynthesis.speak(u);
      } catch (e) { /* bez hlasu */ }
    }
  };
  if ('speechSynthesis' in window) { try { speechSynthesis.onvoiceschanged = () => Ann.pickVoice(); } catch (e) {} }

  function banner(b, txt, sub, color, big, voice, prio) {
    (b._banners = b._banners || []).push({ txt, sub, color: color || '#ffd77a', t: 0, life: big ? 2.6 : 2, big: !!big });
    if (b._banners.length > 3) b._banners.shift();
    if (voice) Ann.say(voice, prio);
    if (window.Zvuk) Zvuk.play(big ? 'horn' : 'skill', big ? 0.7 : 0.45);
  }

  /* ======================= POČASÍ ======================= */
  const WX = {
    den: { cs: 'Jasný den', en: 'Clear day', fx: ['', ''], say: null, w: 34 },
    zapad: { cs: 'Západ slunce', en: 'Sunset', fx: ['Zlatá hodinka: +15 % mincí za zabití', 'Golden hour: +15% coins per kill'], say: 'The sun is setting. Golden hour!', w: 14 },
    noc: { cs: 'Noc', en: 'Night', fx: ['Lučištníci vidí hůř (−10 % útok), pěchota se plíží (+5 % útok)', 'Archers see less (−10% attack), melee sneaks in (+5% attack)'], say: 'Night falls. Archers can barely see.', w: 16 },
    dest: { cs: 'Déšť', en: 'Rain', fx: ['Oheň hoří o polovinu kratší dobu, tětivy vlhnou (−10 % střelci)', 'Fire burns half as long, bowstrings are wet (−10% ranged)'], say: 'Rain is coming. Bowstrings are wet.', w: 13 },
    snih: { cs: 'Sněžení', en: 'Snowfall', fx: ['Mráz: všichni o 5 % slabší, mágové o 10 % silnější', 'Frost: everyone 5% weaker, mages 10% stronger'], say: 'Snow falls upon the battlefield.', w: 10 },
    mlha: { cs: 'Mlha', en: 'Fog', fx: ['Střelci v mlze míjí (−15 % útok)', 'Archers miss in the fog (−15% attack)'], say: 'A thick fog rolls in.', w: 7 },
    bourka: { cs: 'Bouřka', en: 'Thunderstorm', fx: ['Blesky bijí do bojiště! Oheň zhasíná', 'Lightning strikes the battlefield! Fire dies down'], say: 'A storm is upon us. Beware the lightning!', w: 6 }
  };
  G.weathers = WX;
  function pickWeather(b) {
    const th = b.theme || 'evropa', r = b.rand ? b.rand() : Math.random();
    const w = Object.assign({}, ...Object.keys(WX).map(k => ({ [k]: WX[k].w })));
    if (th === 'sever') { w.snih += 18; w.dest -= 6; }
    if (th === 'japonsko') { w.mlha += 6; w.zapad += 6; }
    if (th === 'peklo') { w.snih = 0; w.dest = 0; w.bourka += 8; w.noc += 8; }
    const tot = Object.values(w).reduce((a, b) => a + Math.max(0, b), 0);
    let x = r * tot; for (const k in w) { x -= Math.max(0, w[k]); if (x <= 0) return k; }
    return 'den';
  }

  /* ======================= MAZLÍČCI ======================= */
  const PETS = G.pets = [
    { id: 'sova', cs: 'Luna, sněžná sova', en: 'Luna the Snowy Owl', d: ['Moudrá sova s čarodějným kloboučkem. Každých 14 s vyléčí 3 nejzraněnější vojáky.', 'A wise owl in a little wizard hat. Every 14 s she heals your 3 most wounded soldiers.'], wins: 0, cd: 14, kind: 'heal', col: '#e8f4ff' },
    { id: 'gryf', cs: 'Ostrozob, mládě gryfa', en: 'Sharpbeak the Griffin Cub', d: ['Napůl orel, napůl lev. Každých 18 s se střemhlav vrhne na nejsilnějšího nepřítele.', 'Half eagle, half lion. Every 18 s it dives onto the strongest enemy.'], wins: 3, cd: 18, kind: 'dive', col: '#d8a85a' },
    { id: 'draci', cs: 'Žhavík, dráček', en: 'Ember the Baby Dragon', d: ['Malý drak, velký oheň. Každých 20 s spálí přední řadu nepřátel.', 'A small dragon with a big flame. Every 20 s it scorches the enemy front row.'], wins: 8, cd: 20, kind: 'fire', col: '#e0482a' },
    { id: 'skritek', cs: 'Zlatoušek, mincovní skřítek', en: 'Goldie the Coin Goblin', d: ['Sedí na obláčku z mincí. Každých 10 s přinese 25 mincí a za každé zabití sebere 3 mince navíc.', 'Rides a cloud of coins. Every 10 s he brings 25 coins and grabs 3 extra coins per kill.'], wins: 15, cd: 10, kind: 'gold', col: '#ffd24a' },
    { id: 'mracek', cs: 'Bouřňáček, mrzutý mráček', en: 'Grumble the Storm Cloud', d: ['Pořád se mračí a prší z něj. Každých 16 s udeří bleskem do nepřítele a omráčí ho.', 'Always frowning and drizzling. Every 16 s he strikes an enemy with lightning and stuns it.'], wins: 25, cd: 16, kind: 'bolt', col: '#8a9ab8' },
    { id: 'fenix', cs: 'Plamínek, mládě fénixe', en: 'Blaze the Phoenix Chick', d: ['Rodí se z popela. Každých 24 s vzplane: vyléčí vojáky kolem sebe a popálí nepřátele.', 'Reborn from the ashes. Every 24 s it bursts into flame: heals nearby soldiers and burns enemies.'], wins: 40, cd: 24, kind: 'rebirth', col: '#ff9a2a' },
    { id: 'duch', cs: 'Bubu, duch rytíře', en: 'Boo the Ghost Knight', d: ['Hodný duch ve staré helmě. Každých 15 s vybafne na nepřátele – couvnou a chvíli se třesou strachy.', 'A kind ghost in an old helmet. Every 15 s he spooks enemies – they back off and tremble for a moment.'], wins: 60, cd: 15, kind: 'scare', col: '#c8f0ff' },
    { id: 'duha', cs: 'Duhovka, létající jednorožec', en: 'Rainbow the Flying Unicorn', d: ['Za sebou nechává duhu. Každých 22 s ochrání celou tvou armádu duhovým štítem.', 'Leaves a rainbow trail. Every 22 s she shields your whole army with a rainbow barrier.'], wins: 80, cd: 22, kind: 'shield', col: '#ffb8e8' }
  ];
  const petWins = save => ((save.stats && save.stats.wins) || 0) + ((save.stats && save.stats.pvpWins) || 0);
  G.petNeed = p => p.need || { k: 'wins', n: p.wins || 0 };
  G.petProgress = (save, p) => { const N = G.petNeed(p); return N.k === 'wins' ? petWins(save) : N.k === 'kills' ? ((save.stats && save.stats.kills) || 0) : N.k === 'trophies' ? Object.keys(save.relics || {}).length : ((save.petsOwned || []).includes(p.id) ? 1 : 0); };
  G.petUnlocked = (save, p) => { const N = G.petNeed(p); return N.k === 'gems' ? (save.petsOwned || []).includes(p.id) : G.petProgress(save, p) >= N.n; };
  G.petOf = save => { const id = save.pet || 'sova'; const p = PETS.find(x => x.id === id) || PETS[0]; return G.petUnlocked(save, p) ? p : PETS[0]; };

  /* --- kreslení mazlíčků (místní souřadnice, hledí doprava, velikost ~ 50 px) --- */
  const OUT = '#1a1410';
  const fs = (c, f, lw) => { c.fillStyle = f; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = OUT; c.stroke(); } };
  const eye = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, 0, TAU); fs(c, '#fff', 1.2); c.beginPath(); c.arc(x + r * 0.25, y, r * 0.55, 0, TAU); c.fillStyle = col || '#1a1410'; c.fill(); c.beginPath(); c.arc(x + r * 0.45, y - r * 0.3, r * 0.2, 0, TAU); c.fillStyle = '#fff'; c.fill(); };
  const wingPair = (c, x, y, flap, col, len, feather) => {
    [[-1, 0.5], [1, 1]].forEach(([s, a]) => {
      c.save(); c.translate(x, y); c.rotate(-0.6 - flap * 0.8 * s * 0.5 - (s < 0 ? 0.3 : 0)); c.globalAlpha = a;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-len * 0.4, -len * 0.9, -len, -len * 0.5); c.quadraticCurveTo(-len * 0.6, -len * 0.2, -len * 0.9, 0); c.quadraticCurveTo(-len * 0.5, 0.1, 0, 4); c.closePath(); fs(c, col, 1.4);
      if (feather) { c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-len * 0.2 * i, -len * 0.1 * i); c.lineTo(-len * 0.25 * i - 4, len * 0.05); c.stroke(); } }
      c.restore();
    });
  };
  const DRAW = {
    sova(c, t, act) {
      const f = Math.sin(t * 9) * (act ? 1.4 : 1);
      wingPair(c, -4, -2, f, '#f4f8ff', 26, true);
      c.beginPath(); c.ellipse(0, 0, 15, 18, 0, 0, TAU); fs(c, '#f4f8ff', 2);
      c.fillStyle = '#9ab0c8'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-6 + (i % 3) * 6, 2 + Math.floor(i / 3) * 6, 1.3, 0, TAU); c.fill(); }
      eye(c, -4, -6, 5, '#e8a020'); eye(c, 6, -6, 5, '#e8a020');
      c.beginPath(); c.moveTo(1, -3); c.lineTo(4, -3); c.lineTo(2.5, 1); c.closePath(); fs(c, '#e8a020', 1);
      // čarodějný klobouček
      c.beginPath(); c.moveTo(-12, -15); c.quadraticCurveTo(0, -18, 12, -15); c.lineTo(2, -38); c.quadraticCurveTo(-2, -26, -12, -15); c.closePath(); fs(c, '#3a4aa8', 1.6);
      c.beginPath(); c.ellipse(0, -15, 15, 3.5, 0, 0, TAU); fs(c, '#2a3a88', 1.4);
      for (const [x, y] of [[-3, -24], [3, -30], [-5, -19]]) { c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fillStyle = '#ffe28a'; c.fill(); }
      c.beginPath(); c.moveTo(-6, 17); c.lineTo(-6, 22); c.moveTo(5, 17); c.lineTo(5, 22); c.lineWidth = 2.4; c.strokeStyle = '#e8a020'; c.stroke();
    },
    gryf(c, t, act) {
      const f = Math.sin(t * 10) * (act ? 1.5 : 1);
      // lví zadek s ocasem
      c.beginPath(); c.moveTo(-14, 4); c.quadraticCurveTo(-30, 0, -32, -10); c.lineWidth = 3; c.strokeStyle = '#c89048'; c.stroke(); c.beginPath(); c.arc(-32, -11, 4, 0, TAU); fs(c, '#8a5a28', 1);
      wingPair(c, -2, -6, f, '#e8d8b0', 30, true);
      c.beginPath(); c.ellipse(-4, 4, 17, 11, 0, 0, TAU); fs(c, '#d8a85a', 2);
      [[-14, 12], [-2, 13], [8, 12]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y + 7); c.lineWidth = 4; c.strokeStyle = '#b88848'; c.stroke(); });
      // orlí hlava
      c.beginPath(); c.arc(11, -8, 11, 0, TAU); fs(c, '#ffffff', 2);
      c.beginPath(); c.moveTo(18, -11); c.quadraticCurveTo(30, -9, 26, -1); c.quadraticCurveTo(22, -4, 18, -4); c.closePath(); fs(c, '#ffc23a', 1.4);
      eye(c, 13, -11, 3.6, '#8a5a10');
      c.beginPath(); c.moveTo(4, -17); c.lineTo(-2, -24); c.lineTo(8, -19); c.closePath(); fs(c, '#ffffff', 1.2);
    },
    draci(c, t, act) {
      const f = Math.sin(t * 8) * (act ? 1.5 : 1);
      c.beginPath(); c.moveTo(-12, 6); c.quadraticCurveTo(-28, 10, -30, -2); c.quadraticCurveTo(-28, 2, -22, 2); c.lineWidth = 4; c.strokeStyle = '#c0381e'; c.stroke();
      c.beginPath(); c.moveTo(-31, -2); c.lineTo(-36, -7); c.lineTo(-32, 2); c.closePath(); fs(c, '#ffb347', 1);
      wingPair(c, -4, -4, f, '#ff8a4a', 24, false);
      c.beginPath(); c.ellipse(-2, 4, 14, 11, 0, 0, TAU); fs(c, '#e0482a', 2);
      c.beginPath(); c.ellipse(1, 7, 9, 6, 0, 0, Math.PI); c.fillStyle = '#ffd08a'; c.fill();
      c.beginPath(); c.arc(11, -6, 10, 0, TAU); fs(c, '#e0482a', 2);
      c.beginPath(); c.ellipse(19, -3, 6, 4.5, 0, 0, TAU); fs(c, '#e0482a', 1.4);
      eye(c, 12, -9, 3.8, '#1a1410');
      [[5, -15, -0.5], [11, -16, 0]].forEach(([x, y, a]) => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(-2, 0); c.lineTo(0, -7); c.lineTo(2, 0); c.closePath(); fs(c, '#ffe9b0', 1); c.restore(); });
      if (act) { for (let i = 0; i < 3; i++) { const L2 = 14 + i * 6 + Math.sin(t * 20 + i) * 3; c.beginPath(); c.moveTo(23, -3); c.quadraticCurveTo(23 + L2 * 0.5, -8, 23 + L2, -2); c.quadraticCurveTo(23 + L2 * 0.5, 5, 23, 1); c.closePath(); c.fillStyle = ['rgba(255,90,20,.8)', 'rgba(255,170,50,.75)', 'rgba(255,240,180,.7)'][i]; c.fill(); } }
      else { const ph = (t * 0.8) % 1; c.beginPath(); c.arc(25 + ph * 6, -6 - ph * 14, 2 + ph * 3, 0, TAU); c.fillStyle = `rgba(120,120,120,${0.5 * (1 - ph)})`; c.fill(); }
    },
    skritek(c, t, act) {
      // obláček z mincí
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * 0.8; c.beginPath(); c.ellipse(Math.cos(a) * 14, 14 + Math.sin(a) * 3, 5, 3.4, 0, 0, TAU); fs(c, i % 2 ? '#ffd24a' : '#f2b440', 1); }
      c.beginPath(); c.ellipse(0, 8, 11, 9, 0, 0, TAU); fs(c, '#4a8a3a', 2);
      c.beginPath(); c.arc(1, -6, 10, 0, TAU); fs(c, '#7ac85a', 2);
      // velké uši
      c.beginPath(); c.moveTo(-8, -8); c.lineTo(-20, -14); c.lineTo(-8, -2); c.closePath(); fs(c, '#7ac85a', 1.4);
      c.beginPath(); c.moveTo(9, -8); c.lineTo(21, -14); c.lineTo(10, -2); c.closePath(); fs(c, '#7ac85a', 1.4);
      eye(c, -2, -8, 3.2, '#1a1410'); eye(c, 5, -8, 3.2, '#1a1410');
      c.beginPath(); c.arc(2, -2, 4, 0.2, Math.PI - 0.2); c.lineWidth = 1.6; c.strokeStyle = OUT; c.stroke();
      // čepička a pytel
      c.beginPath(); c.moveTo(-8, -14); c.quadraticCurveTo(2, -30, 12, -14); c.closePath(); fs(c, '#c0381e', 1.4);
      c.beginPath(); c.ellipse(-12, 6, 7, 8, 0.3, 0, TAU); fs(c, '#a87a4a', 1.4); c.font = 'bold 8px sans-serif'; c.fillStyle = '#ffd24a'; c.fillText('$', -15, 9);
      if (act) for (let i = 0; i < 4; i++) { const ph = ((t * 2 + i / 4) % 1); c.beginPath(); c.ellipse(-12 + i * 4, 4 - ph * 30, 3.5, 3.5 * Math.abs(Math.cos(t * 6 + i)), 0, 0, TAU); fs(c, '#ffd24a', 0.8); }
    },
    mracek(c, t, act) {
      const blobs = [[-12, 2, 10], [-2, -5, 13], [11, 0, 11], [2, 6, 10]];
      blobs.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); fs(c, act ? '#6a7a98' : '#8a9ab8', 2); });
      blobs.forEach(([x, y, r]) => { c.beginPath(); c.arc(x - r * 0.2, y - r * 0.3, r * 0.6, 0, TAU); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); });
      // zamračené obočí a oči
      c.beginPath(); c.moveTo(-8, -6); c.lineTo(-2, -3); c.moveTo(10, -6); c.lineTo(4, -3); c.lineWidth = 2.4; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.arc(-4, 0, 2, 0, TAU); c.arc(6, 0, 2, 0, TAU); c.fillStyle = OUT; c.fill();
      c.beginPath(); c.arc(1, 9, 4, Math.PI + 0.3, -0.3); c.lineWidth = 1.8; c.stroke();
      // kapky deště
      for (let i = 0; i < 4; i++) { const ph = ((t * 1.6 + i * 0.27) % 1); c.beginPath(); c.moveTo(-10 + i * 7, 12 + ph * 18); c.lineTo(-11 + i * 7, 16 + ph * 18); c.lineWidth = 1.6; c.strokeStyle = `rgba(140,190,255,${1 - ph})`; c.stroke(); }
      if (act) { c.beginPath(); c.moveTo(2, 12); c.lineTo(-3, 22); c.lineTo(3, 22); c.lineTo(-2, 34); c.lineWidth = 2.6; c.strokeStyle = '#fff36a'; c.stroke(); }
    },
    fenix(c, t, act) {
      const f = Math.sin(t * 9) * (act ? 1.6 : 1);
      // ohnivý ocas
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(-24 - i * 4, 4 + i * 6 + Math.sin(t * 6 + i) * 3, -34 - i * 3, 10 + i * 8); c.lineWidth = 3.4 - i * 0.6; c.strokeStyle = ['#ff6a1a', '#ffb347', '#ffe28a'][i]; c.stroke(); }
      wingPair(c, -3, -4, f, '#ffb347', 26, true);
      c.beginPath(); c.ellipse(0, 2, 13, 12, 0, 0, TAU); fs(c, '#ff9a2a', 2);
      c.beginPath(); c.ellipse(2, 6, 7, 6, 0, 0, Math.PI); c.fillStyle = '#ffe28a'; c.fill();
      eye(c, 4, -3, 4, '#c0381e');
      c.beginPath(); c.moveTo(11, -2); c.lineTo(17, 0); c.lineTo(11, 3); c.closePath(); fs(c, '#ffd24a', 1);
      // plamenná chocholka
      for (let i = 0; i < 3; i++) { const h = 10 + i * 3 + Math.sin(t * 12 + i) * 2; c.beginPath(); c.moveTo(-4 + i * 4, -9); c.quadraticCurveTo(-6 + i * 4, -9 - h * 0.6, -2 + i * 4, -9 - h); c.quadraticCurveTo(0 + i * 4, -9 - h * 0.5, 0 + i * 4, -9); c.closePath(); c.fillStyle = ['#ff6a1a', '#ffb347', '#ffe28a'][i]; c.fill(); }
      if (act) { const g = c.createRadialGradient(0, 0, 4, 0, 0, 40); g.addColorStop(0, 'rgba(255,200,80,.5)'); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.fillRect(-40, -40, 80, 80); }
    },
    duch(c, t, act) {
      c.globalAlpha = 0.88;
      c.beginPath(); c.moveTo(-13, -2); c.quadraticCurveTo(-14, -22, 0, -22); c.quadraticCurveTo(14, -22, 13, -2);
      for (let i = 0; i < 5; i++) { const x = 13 - i * 6.5, y = 18 + Math.sin(t * 6 + i) * 3; c.quadraticCurveTo(x - 1.5, y + 4, x - 3.2, y - 3); }
      c.closePath(); fs(c, '#e8f8ff', 1.8); c.globalAlpha = 1;
      // stará helma
      c.beginPath(); c.moveTo(-12, -10); c.quadraticCurveTo(-12, -26, 0, -27); c.quadraticCurveTo(12, -26, 12, -10); c.closePath(); fs(c, '#9aa0aa', 1.6);
      c.beginPath(); c.rect(-12, -12, 24, 4); fs(c, '#7a8088', 1.2);
      c.beginPath(); c.moveTo(-1, -27); c.quadraticCurveTo(-8, -38, 4, -40); c.quadraticCurveTo(0, -32, 3, -27); c.closePath(); fs(c, '#d6243a', 1.2);
      c.beginPath(); c.ellipse(-4, -2, 2.6, 3.4, 0, 0, TAU); c.ellipse(5, -2, 2.6, 3.4, 0, 0, TAU); c.fillStyle = '#2a3a5a'; c.fill();
      c.beginPath(); c.ellipse(1, 7, act ? 4.5 : 2.4, act ? 5 : 2, 0, 0, TAU); c.fillStyle = '#2a3a5a'; c.fill();
      // ručičky
      c.beginPath(); c.moveTo(-12, 2); c.quadraticCurveTo(-20, act ? -8 : 4, -22, act ? -12 : 8); c.moveTo(12, 2); c.quadraticCurveTo(20, act ? -8 : 4, 22, act ? -12 : 8); c.lineWidth = 3; c.strokeStyle = '#e8f8ff'; c.stroke();
    },
    duha(c, t, act) {
      // duhová stopa
      const R = ['#ff5a5a', '#ffb347', '#ffe14a', '#7be04a', '#4ac8ff', '#a45cff'];
      R.forEach((col, i) => { c.beginPath(); c.moveTo(-12, -2 + i * 2.2); c.quadraticCurveTo(-30, -8 + i * 2.2 + Math.sin(t * 4) * 3, -52, 2 + i * 2.2); c.lineWidth = 2.4; c.strokeStyle = col; c.globalAlpha = 0.75; c.stroke(); }); c.globalAlpha = 1;
      wingPair(c, -4, -6, Math.sin(t * 9) * (act ? 1.5 : 1), '#fff0fa', 22, true);
      c.beginPath(); c.ellipse(-2, 4, 15, 10, 0, 0, TAU); fs(c, '#ffffff', 2);
      [[-12, 12], [-4, 13], [4, 13], [10, 12]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 8); c.lineWidth = 3.4; c.strokeStyle = '#ffffff'; c.stroke(); c.beginPath(); c.rect(x - 2, y + 7, 4, 2.6); c.fillStyle = '#c8a0ff'; c.fill(); });
      c.beginPath(); c.ellipse(13, -6, 8, 9, -0.3, 0, TAU); fs(c, '#ffffff', 2);
      c.beginPath(); c.ellipse(19, -2, 5, 4, 0, 0, TAU); fs(c, '#ffe8f4', 1.2);
      eye(c, 14, -8, 2.8, '#7a3aaa');
      // hříva a duhový roh
      R.forEach((col, i) => { c.beginPath(); c.arc(6 - i * 1.2, -12 + i * 2.6, 3, 0, TAU); c.fillStyle = col; c.fill(); });
      c.beginPath(); c.moveTo(12, -14); c.lineTo(20, -28); c.lineTo(16, -13); c.closePath(); fs(c, '#ffe14a', 1.2);
      if (act) { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t * 3; c.beginPath(); c.arc(Math.cos(a) * 26, Math.sin(a) * 20, 2.4, 0, TAU); c.fillStyle = R[k]; c.fill(); } }
    }
  };
  /* ---------- DALŠÍCH 12 MAZLÍČKŮ ---------- */
  PETS.push(
    { id: 'chobotnice', cs: 'Inkoustka, vzduchoplavecká chobotnice', en: 'Inky the Sky Octopus', d: ['Pirátka v bublině s kloboukem. Každých 15 s postříká nepřátele inkoustem – 4 s útočí jen poloviční silou.', 'A pirate in a bubble with a hat. Every 15 s she sprays enemies with ink – for 4 s they hit at half strength.'], need: { k: 'kills', n: 300 }, cd: 15, kind: 'blind', col: '#9a5aff' },
    { id: 'kaktus', cs: 'Pichlík, kaktus na balónku', en: 'Prickles the Balloon Cactus', d: ['Visí na balónku a usmívá se. Každých 12 s spustí déšť bodlin na 10 nepřátel.', 'Hangs from a balloon and smiles. Every 12 s he rains needles on 10 enemies.'], need: { k: 'wins', n: 12 }, cd: 12, kind: 'needles', col: '#5aaa4a' },
    { id: 'zelva', cs: 'Krunýřka, želva s raketou', en: 'Shelly the Rocket Turtle', d: ['Pomalá na zemi, rychlá ve vzduchu. Každých 18 s opraví hradby o 4 % životů.', 'Slow on the ground, fast in the air. Every 18 s she repairs your walls by 4% health.'], need: { k: 'trophies', n: 3 }, cd: 18, kind: 'repair', col: '#4ab87a' },
    { id: 'netopyr', cs: 'Hrabě Vampík, netopýr', en: 'Count Batula', d: ['Netopýr ve fraku s pláštěm. Každých 14 s vysaje nepříteli život a dá ho tvému nejzraněnějšímu vojákovi.', 'A bat in a tailcoat and cape. Every 14 s he drains an enemy’s life and gives it to your most wounded soldier.'], need: { k: 'gems', n: 400 }, cd: 14, kind: 'drain', col: '#6a2a8a' },
    { id: 'robot', cs: 'Šroubek, hodinový robot', en: 'Cogsworth the Clockwork Bot', d: ['Natahovací robot s vrtulkou na hlavě. Každých 13 s vystřelí tři dělové koule.', 'A wind-up robot with a propeller cap. Every 13 s he fires three cannonballs.'], need: { k: 'kills', n: 800 }, cd: 13, kind: 'cannon', col: '#c99a3a' },
    { id: 'meduza', cs: 'Svítilka, nebeská medúza', en: 'Glimmer the Sky Jelly', d: ['Svítí jako lampion. Každých 17 s vyšle elektrický puls, který omráčí nepřátele pod ní.', 'Glows like a lantern. Every 17 s she sends an electric pulse that stuns enemies below.'], need: { k: 'trophies', n: 6 }, cd: 17, kind: 'pulse', col: '#7af0ff' },
    { id: 'kitsune', cs: 'Ohnivka, devítiocasá liška', en: 'Kitsune the Nine-Tailed Fox', d: ['Liščí duch z dávných legend. Každých 16 s vypustí tři bludičky lišího ohně.', 'A fox spirit from ancient legends. Every 16 s she releases three foxfire wisps.'], need: { k: 'wins', n: 50 }, cd: 16, kind: 'foxfire', col: '#ff8a3a' },
    { id: 'havran', cs: 'Krákor, kostěný havran', en: 'Crowbones the Skeleton Raven', d: ['Havran z kostí s rudýma očima. Každých 25 s probudí padlého vojáka, který bojuje dál za tebe.', 'A raven of bones with red eyes. Every 25 s he raises a fallen soldier who fights on for you.'], need: { k: 'kills', n: 2000 }, cd: 25, kind: 'raise', col: '#efe6cf' },
    { id: 'rybka', cs: 'Bublinka, rybka v akváriu', en: 'Bubbles the Fishbowl Fish', d: ['Zlatá rybka v létajícím akváriu. Každých 14 s vyšplíchne vlnu, která odhodí nepřátele.', 'A goldfish in a flying fishbowl. Every 14 s she splashes a wave that pushes enemies back.'], need: { k: 'wins', n: 20 }, cd: 14, kind: 'splash', col: '#ff9a3a' },
    { id: 'houba', cs: 'Muchomůrka, houbový skřítek', en: 'Toadstool the Mushroom Sprite', d: ['Má puntíkovaný klobouk a práší z něj. Každých 15 s vypustí jedovatý oblak výtrusů.', 'Has a spotted cap that puffs spores. Every 15 s he releases a poisonous spore cloud.'], need: { k: 'gems', n: 250 }, cd: 15, kind: 'spores', col: '#d6243a' },
    { id: 'gemik', cs: 'Gemík, krystalový golem', en: 'Gemmy the Crystal Golem', d: ['Malý golem z drahokamů. Každých 16 s vystřelí krystalové střepy a přinese 15 mincí.', 'A tiny golem made of gems. Every 16 s he shoots crystal shards and brings 15 coins.'], need: { k: 'gems', n: 600 }, cd: 16, kind: 'shards', col: '#ff8ae0' },
    { id: 'kocka', cs: 'Mňauka, čarodějná kočka', en: 'Whiskers the Witch Cat', d: ['Černá kočka na koštěti. Každých 18 s prokleje nepřátele – 3 s dostávají o polovinu víc zranění.', 'A black cat on a broomstick. Every 18 s she curses the enemies – for 3 s they take 50% more damage.'], need: { k: 'wins', n: 100 }, cd: 18, kind: 'curse', col: '#2a2a3a' }
  );
  Object.assign(DRAW, {
    chobotnice(c, t, act) {
      c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fillStyle = 'rgba(190,230,255,.22)'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(220,240,255,.7)'; c.stroke();
      for (let i = 0; i < 6; i++) { const x = -12 + i * 5; c.beginPath(); c.moveTo(x, 4); c.bezierCurveTo(x + Math.sin(t * 4 + i) * 6, 14, x - Math.sin(t * 4 + i) * 6, 18, x + 3, 22); c.lineWidth = 3.6; c.strokeStyle = '#9a5aff'; c.lineCap = 'round'; c.stroke(); }
      c.beginPath(); c.ellipse(0, -2, 14, 13, 0, 0, TAU); fs(c, '#a86aff', 2);
      eye(c, -5, -2, 3.6); eye(c, 5, -2, 3.6);
      c.beginPath(); c.moveTo(-14, -10); c.quadraticCurveTo(0, -18, 14, -10); c.lineTo(8, -22); c.lineTo(-8, -22); c.closePath(); fs(c, '#2a2a3a', 1.4);
      c.beginPath(); c.arc(0, -16, 2.4, 0, TAU); c.fillStyle = '#fff'; c.fill();
      c.beginPath(); c.arc(-26, -18, 4, 0, TAU); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill();
      if (act) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(20 + i * 7, 6 + Math.sin(i) * 4, 4 - i * 0.6, 0, TAU); c.fillStyle = '#1a1030'; c.fill(); }
    },
    kaktus(c, t, act) {
      c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(4, -22, 0, -30); c.lineWidth = 1.2; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.ellipse(0, -40, 11, 13, 0, 0, TAU); fs(c, '#ff5a7a', 1.8); c.beginPath(); c.ellipse(-4, -44, 3, 4, -0.4, 0, TAU); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
      c.beginPath(); c.moveTo(-8, 22); c.lineTo(-9, -6); c.quadraticCurveTo(0, -16, 9, -6); c.lineTo(8, 22); c.closePath(); fs(c, '#5aaa4a', 2);
      c.beginPath(); c.moveTo(-8, 6); c.lineTo(-16, 6); c.lineTo(-16, -4); c.moveTo(8, 2); c.lineTo(16, 2); c.lineTo(16, -8); c.lineWidth = 6; c.strokeStyle = '#5aaa4a'; c.lineCap = 'round'; c.stroke();
      c.strokeStyle = '#f4ecd8'; c.lineWidth = 1; for (let i = 0; i < 10; i++) { const x = -6 + (i % 3) * 6, y = -4 + Math.floor(i / 3) * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y - 2); c.stroke(); }
      eye(c, -3, 0, 2.6); eye(c, 4, 0, 2.6); c.beginPath(); c.arc(0.5, 5, 3, 0.2, Math.PI - 0.2); c.lineWidth = 1.4; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.arc(0, -12, 4, 0, TAU); fs(c, '#ff8ac8', 1);
      c.beginPath(); c.rect(-10, 20, 20, 8); fs(c, '#c86a3a', 1.6);
      if (act) for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(14 + i * 5, -4 + i * 3); c.lineTo(20 + i * 5, -2 + i * 3); c.lineWidth = 1.4; c.strokeStyle = '#2a5a1a'; c.stroke(); }
    },
    zelva(c, t, act) {
      // raketa s plamenem
      c.beginPath(); c.rect(-20, -6, 10, 14); fs(c, '#c8ccd2', 1.4);
      const fl = 8 + Math.sin(t * 30) * 3 + (act ? 6 : 0); c.beginPath(); c.moveTo(-19, 8); c.lineTo(-15, 8 + fl); c.lineTo(-11, 8); c.closePath(); c.fillStyle = '#ff9a2a'; c.fill();
      c.beginPath(); c.ellipse(0, 2, 15, 11, 0, Math.PI, TAU); c.lineTo(15, 4); c.lineTo(-15, 4); c.closePath(); fs(c, '#3a8a5a', 2);
      c.strokeStyle = '#2a6a3a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-6, -8); c.lineTo(0, -2); c.lineTo(6, -8); c.moveTo(0, -2); c.lineTo(0, 4); c.stroke();
      c.beginPath(); c.ellipse(19, -2, 7, 6, 0, 0, TAU); fs(c, '#8ad87a', 1.8); eye(c, 21, -4, 2.6);
      c.beginPath(); c.moveTo(14, -6); c.lineTo(26, -8); c.lineWidth = 2.4; c.strokeStyle = '#d6243a'; c.stroke();
      [[-10, 6], [8, 6]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y + 3, 4, 2.6, 0, 0, TAU); fs(c, '#8ad87a', 1); });
      c.beginPath(); c.ellipse(6, -11, 6, 3, 0.2, 0, TAU); c.fillStyle = 'rgba(180,230,255,.7)'; c.fill(); c.lineWidth = 1; c.strokeStyle = OUT; c.stroke();
    },
    netopyr(c, t, act) {
      const f = Math.sin(t * 12);
      [-1, 1].forEach(s => { c.save(); c.scale(s, 1); c.rotate(f * 0.4 * s); c.beginPath(); c.moveTo(4, -2); c.lineTo(30, -14); c.lineTo(27, -4); c.lineTo(22, -6); c.lineTo(20, 2); c.lineTo(14, 0); c.lineTo(10, 6); c.closePath(); fs(c, '#4a2a5a', 1.4); c.restore(); });
      c.beginPath(); c.moveTo(-10, 0); c.lineTo(-16, 22); c.lineTo(16, 22); c.lineTo(10, 0); c.closePath(); fs(c, '#8a1424', 1.4);
      c.beginPath(); c.ellipse(0, 2, 9, 11, 0, 0, TAU); fs(c, '#5a3a6a', 1.8);
      c.beginPath(); c.moveTo(-5, -1); c.lineTo(0, 6); c.lineTo(5, -1); c.closePath(); c.fillStyle = '#f4f4f4'; c.fill();
      c.beginPath(); c.moveTo(-8, -8); c.lineTo(-10, -18); c.lineTo(-3, -10); c.moveTo(8, -8); c.lineTo(10, -18); c.lineTo(3, -10); c.closePath(); fs(c, '#5a3a6a', 1.2);
      c.beginPath(); c.arc(-3.5, -5, 2.4, 0, TAU); c.arc(3.5, -5, 2.4, 0, TAU); c.fillStyle = '#ff3a3a'; c.fill();
      c.beginPath(); c.moveTo(-2, 0); c.lineTo(-1.4, 3.4); c.lineTo(-0.8, 0); c.moveTo(2, 0); c.lineTo(1.4, 3.4); c.lineTo(0.8, 0); c.fillStyle = '#fff'; c.fill();
      if (act) { c.beginPath(); c.arc(0, 0, 22 + Math.sin(t * 10) * 3, 0, TAU); c.lineWidth = 2; c.strokeStyle = 'rgba(214,36,58,.6)'; c.stroke(); }
    },
    robot(c, t, act) {
      c.save(); c.translate(0, -22); c.rotate(t * 14); c.fillStyle = '#d6243a'; c.fillRect(-14, -1.4, 28, 2.8); c.restore();
      c.beginPath(); c.rect(-1.5, -22, 3, 6); fs(c, '#8a8f96', 0.8);
      c.beginPath(); c.rect(-10, -17, 20, 14); fs(c, '#c99a3a', 2);
      c.beginPath(); c.arc(-4, -10, 3.4, 0, TAU); c.arc(4, -10, 3.4, 0, TAU); fs(c, '#7ae0ff', 1);
      c.beginPath(); c.rect(-13, -3, 26, 18); fs(c, '#b8862a', 2);
      gearMini(c, 0, 6, 6, t * 2); c.beginPath(); c.moveTo(13, 2); c.lineTo(22, 0); c.lineWidth = 5; c.strokeStyle = '#5a5f68'; c.stroke();
      c.save(); c.translate(-15, 6); c.rotate(t * 3); c.fillStyle = '#8a8f96'; c.fillRect(-1, -8, 2, 16); c.restore();
      if (act) { c.beginPath(); c.arc(26, 0, 5, 0, TAU); c.fillStyle = 'rgba(255,200,90,.8)'; c.fill(); }
      c.beginPath(); c.moveTo(-8, 15); c.lineTo(-8, 22); c.moveTo(8, 15); c.lineTo(8, 22); c.lineWidth = 3; c.strokeStyle = '#5a5f68'; c.stroke();
    },
    meduza(c, t, act) {
      const p = 1 + Math.sin(t * 3) * 0.06;
      const g = c.createRadialGradient(0, -4, 2, 0, -4, 30); g.addColorStop(0, act ? 'rgba(160,255,255,.6)' : 'rgba(120,240,255,.35)'); g.addColorStop(1, 'rgba(120,240,255,0)'); c.fillStyle = g; c.fillRect(-30, -34, 60, 60);
      for (let i = 0; i < 7; i++) { const x = -10 + i * 3.4; c.beginPath(); c.moveTo(x, 2); c.bezierCurveTo(x + Math.sin(t * 3 + i) * 5, 12, x - Math.sin(t * 3 + i) * 5, 20, x + Math.sin(t * 2 + i) * 3, 28); c.lineWidth = 1.6; c.strokeStyle = 'rgba(200,250,255,.85)'; c.stroke(); }
      c.save(); c.scale(p, 1 / p); c.beginPath(); c.moveTo(-14, 2); c.quadraticCurveTo(-15, -18, 0, -18); c.quadraticCurveTo(15, -18, 14, 2); c.quadraticCurveTo(7, -1, 0, 3); c.quadraticCurveTo(-7, -1, -14, 2); c.closePath(); c.fillStyle = 'rgba(140,240,255,.75)'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#2a8aa8'; c.stroke(); c.restore();
      c.beginPath(); c.arc(-4, -8, 1.8, 0, TAU); c.arc(4, -8, 1.8, 0, TAU); c.fillStyle = '#1a3a4a'; c.fill();
      c.beginPath(); c.arc(0, -4, 2.4, 0.2, Math.PI - 0.2); c.lineWidth = 1.2; c.stroke();
      if (act) { c.beginPath(); c.moveTo(-6, 26); c.lineTo(-2, 34); c.lineTo(2, 30); c.lineTo(6, 40); c.lineWidth = 2; c.strokeStyle = '#fff36a'; c.stroke(); }
    },
    kitsune(c, t, act) {
      for (let i = 0; i < 9; i++) { const a = Math.PI + (i - 4) * 0.22 + Math.sin(t * 2 + i) * 0.06; c.save(); c.translate(-8, 2); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -6, 24, 0); c.quadraticCurveTo(14, 5, 0, 0); fs(c, i % 2 ? '#ff8a3a' : '#ffa85a', 0.8); c.beginPath(); c.arc(23, 0, 2.6, 0, TAU); c.fillStyle = '#fff4e0'; c.fill(); c.restore(); }
      c.beginPath(); c.ellipse(0, 4, 12, 8, 0, 0, TAU); fs(c, '#ff8a3a', 1.8);
      c.beginPath(); c.moveTo(6, -2); c.lineTo(20, 2); c.lineTo(8, 8); c.closePath(); fs(c, '#ff8a3a', 1.6);
      c.beginPath(); c.arc(8, -2, 8, 0, TAU); fs(c, '#ff9a4a', 1.8);
      c.beginPath(); c.moveTo(3, -8); c.lineTo(2, -18); c.lineTo(8, -10); c.moveTo(10, -9); c.lineTo(14, -18); c.lineTo(14, -6); fs(c, '#ff9a4a', 1.2);
      c.beginPath(); c.moveTo(8, 2); c.lineTo(20, 2); c.lineTo(10, 6); c.closePath(); c.fillStyle = '#fff4e0'; c.fill();
      c.beginPath(); c.moveTo(5, -4); c.quadraticCurveTo(7, -6, 9, -4); c.moveTo(11, -4); c.quadraticCurveTo(13, -6, 15, -4); c.lineWidth = 1.6; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.arc(9, -12, 2, 0, TAU); c.fillStyle = '#d6243a'; c.fill();
      for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1, x = Math.cos(a) * 24, y = Math.sin(a) * 12 - 6; c.beginPath(); c.arc(x, y, act ? 4.4 : 3, 0, TAU); c.fillStyle = 'rgba(120,220,255,.8)'; c.fill(); }
    },
    havran(c, t, act) {
      const f = Math.sin(t * 10);
      [-1, 1].forEach(s => { c.save(); c.rotate(-0.4 + f * 0.5 * s * 0.6 - (s < 0 ? 0.2 : 0)); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-2, -2); c.lineTo(-22 + i * 2, -12 + i * 5); c.lineWidth = 2.2; c.strokeStyle = s < 0 ? '#bfb6a0' : '#efe6cf'; c.stroke(); } c.restore(); });
      c.beginPath(); c.ellipse(0, 2, 10, 7, 0, 0, TAU); c.lineWidth = 2; c.strokeStyle = '#efe6cf'; c.stroke();
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-6, 2 + i * 3); c.lineTo(6, 2 + i * 3); c.lineWidth = 1.4; c.stroke(); }
      c.beginPath(); c.arc(10, -6, 7, 0, TAU); fs(c, '#efe6cf', 1.8);
      c.beginPath(); c.moveTo(15, -7); c.lineTo(26, -4); c.lineTo(15, -2); c.closePath(); fs(c, '#2a2a2a', 1);
      c.beginPath(); c.arc(11, -8, 2.6, 0, TAU); c.fillStyle = '#2a1a10'; c.fill(); c.beginPath(); c.arc(11.4, -8, 1.2, 0, TAU); c.fillStyle = '#ff2a2a'; c.fill();
      c.beginPath(); c.moveTo(-10, 2); c.lineTo(-20, 6); c.lineTo(-18, 0); c.lineWidth = 2; c.strokeStyle = '#efe6cf'; c.stroke();
      if (act) { c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.lineWidth = 2; c.strokeStyle = 'rgba(122,255,138,.6)'; c.stroke(); }
    },
    rybka(c, t, act) {
      c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.fillStyle = 'rgba(150,210,255,.35)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(220,240,255,.9)'; c.stroke();
      c.save(); c.beginPath(); c.arc(0, 0, 19, 0, TAU); c.clip(); c.fillStyle = 'rgba(60,150,230,.5)'; c.fillRect(-20, 4 + Math.sin(t * 2) * 1.5, 40, 20);
      const fx = Math.sin(t * 1.4) * 5; c.beginPath(); c.ellipse(fx, 0, 8, 6, 0, 0, TAU); fs(c, '#ff9a2a', 1.4); c.beginPath(); c.moveTo(fx - 7, 0); c.lineTo(fx - 13, -5 + Math.sin(t * 9) * 2); c.lineTo(fx - 13, 5 - Math.sin(t * 9) * 2); c.closePath(); fs(c, '#ffb347', 1);
      eye(c, fx + 4, -1, 2); c.restore();
      c.beginPath(); c.ellipse(0, -19, 10, 3, 0, 0, TAU); c.lineWidth = 2.4; c.strokeStyle = 'rgba(220,240,255,.9)'; c.stroke();
      for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; c.beginPath(); c.arc(4 + i * 3, -16 - ph * 14, 1.6 + ph * 1.6, 0, TAU); c.lineWidth = 1; c.strokeStyle = `rgba(220,240,255,${1 - ph})`; c.stroke(); }
      if (act) { c.beginPath(); c.moveTo(14, -10); c.quadraticCurveTo(30, -20, 36, 4); c.lineWidth = 4; c.strokeStyle = 'rgba(90,180,255,.8)'; c.stroke(); }
    },
    houba(c, t, act) {
      c.beginPath(); c.moveTo(-7, 18); c.quadraticCurveTo(-8, 4, -5, 0); c.lineTo(5, 0); c.quadraticCurveTo(8, 4, 7, 18); c.closePath(); fs(c, '#f4ecd8', 1.8);
      eye(c, -3, 7, 2.4); eye(c, 3, 7, 2.4); c.beginPath(); c.arc(0, 12, 2, 0, Math.PI); c.lineWidth = 1.2; c.strokeStyle = OUT; c.stroke();
      c.beginPath(); c.moveTo(-20, 2); c.quadraticCurveTo(-20, -20, 0, -20); c.quadraticCurveTo(20, -20, 20, 2); c.closePath(); fs(c, '#d6243a', 2);
      [[-10, -8, 3], [2, -14, 3.6], [11, -6, 2.6], [-2, -4, 2.2]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#fff'; c.fill(); });
      for (let i = 0; i < (act ? 10 : 4); i++) { const ph = (t * 0.6 + i * 0.17) % 1; c.beginPath(); c.arc(-14 + i * 3, -18 - ph * 20, 1.4, 0, TAU); c.fillStyle = `rgba(180,230,120,${1 - ph})`; c.fill(); }
    },
    gemik(c, t, act) {
      const col = ['#ff8ae0', '#8ad8ff', '#a0ff8a'];
      c.beginPath(); c.moveTo(0, -20); c.lineTo(12, -8); c.lineTo(8, 10); c.lineTo(-8, 10); c.lineTo(-12, -8); c.closePath(); fs(c, col[0], 2);
      c.beginPath(); c.moveTo(0, -20); c.lineTo(-3, 10); c.lineTo(-12, -8); c.closePath(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
      [[-16, 2, 0], [16, 2, 1]].forEach(([x, y, k]) => { c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 4, y); c.lineTo(x, y + 6); c.lineTo(x - 4, y); c.closePath(); fs(c, col[k + 1], 1.4); });
      [[-5, 16], [5, 16]].forEach(([x, y]) => { c.beginPath(); c.rect(x - 3, y - 6, 6, 8); fs(c, col[1], 1.2); });
      c.beginPath(); c.arc(-4, -6, 2, 0, TAU); c.arc(4, -6, 2, 0, TAU); c.fillStyle = '#fff'; c.fill();
      for (let i = 0; i < 4; i++) { const a = t * 1.6 + i * 1.57; c.beginPath(); c.moveTo(Math.cos(a) * 24, Math.sin(a) * 10 - 22); c.lineTo(Math.cos(a) * 24 + 2, Math.sin(a) * 10 - 18); c.lineTo(Math.cos(a) * 24, Math.sin(a) * 10 - 14); c.lineTo(Math.cos(a) * 24 - 2, Math.sin(a) * 10 - 18); c.closePath(); c.fillStyle = col[i % 3]; c.fill(); }
      if (act) { c.beginPath(); c.arc(0, -4, 26, 0, TAU); c.lineWidth = 2; c.strokeStyle = 'rgba(255,138,224,.6)'; c.stroke(); }
    },
    kocka(c, t, act) {
      // koště
      c.beginPath(); c.moveTo(-26, 10); c.lineTo(20, 4); c.lineWidth = 3; c.strokeStyle = '#8a5a2a'; c.stroke();
      c.beginPath(); c.moveTo(-26, 10); c.lineTo(-40, 2); c.lineTo(-42, 18); c.closePath(); fs(c, '#d8b060', 1.2);
      c.beginPath(); c.ellipse(-2, 0, 12, 8, 0, 0, TAU); fs(c, '#2a2a3a', 1.8);
      c.beginPath(); c.moveTo(-12, -2); c.quadraticCurveTo(-26, -6, -22, -20); c.lineWidth = 3; c.strokeStyle = '#2a2a3a'; c.stroke();
      c.beginPath(); c.arc(10, -6, 8, 0, TAU); fs(c, '#2a2a3a', 1.8);
      c.beginPath(); c.moveTo(5, -11); c.lineTo(5, -19); c.lineTo(10, -13); c.moveTo(12, -13); c.lineTo(16, -19); c.lineTo(16, -10); fs(c, '#2a2a3a', 1.2);
      c.beginPath(); c.ellipse(8, -7, 2, 2.6, 0, 0, TAU); c.ellipse(14, -7, 2, 2.6, 0, 0, TAU); c.fillStyle = '#a0ff5a'; c.fill();
      c.beginPath(); c.moveTo(1, -12); c.quadraticCurveTo(10, -14, 19, -12); c.lineTo(12, -28); c.closePath(); fs(c, '#5a2a8a', 1.4);
      c.beginPath(); c.moveTo(18, -4); c.lineTo(24, -5); c.moveTo(18, -3); c.lineTo(24, -1); c.lineWidth = 0.8; c.strokeStyle = '#ddd'; c.stroke();
      if (act) for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.25; c.beginPath(); c.arc(Math.cos(a) * 22, Math.sin(a) * 14 - 4, 2.4, 0, TAU); c.fillStyle = '#b25cff'; c.fill(); }
    }
  });
  function gearMini(c, x, y, r, a) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, rr = i % 2 ? r : r * 0.75; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); fs(c, '#8a8f96', 1); c.restore(); }
  G.drawPet = (ctx, id, t, act) => { const f = DRAW[id] || DRAW.sova; f(ctx, t, act); };

  /* ======================= TROFEJE ======================= */
  const TROPHY_TYPES = ['helm', 'prapor', 'mec', 'koruna', 'lebka', 'roh', 'stit', 'amulet'];
  const ACH = G.trophyAch = [
    { id: 'a_prvni', cs: 'První krev', en: 'First Blood', d: ['První zabití v bitvě.', 'First kill of a battle.'], type: 'mec', col: '#d6243a' },
    { id: 'a_godlike', cs: 'Božský řezník', en: 'Godlike', d: ['Série 25 zabití bez přestávky.', 'A streak of 25 kills without a pause.'], type: 'koruna', col: '#ffd24a' },
    { id: 'a_massacre', cs: 'Krvavý prapor', en: 'Bloody Banner', d: ['Série 10 zabití bez přestávky.', 'A streak of 10 kills without a pause.'], type: 'prapor', col: '#a8262a' },
    { id: 'a_stovka', cs: 'Pán stovky', en: 'Lord of a Hundred', d: ['100 zabití v jedné bitvě.', '100 kills in one battle.'], type: 'lebka', col: '#efe6cf' },
    { id: 'a_noc', cs: 'Noční lovec', en: 'Night Hunter', d: ['Vyhraj bitvu v noci.', 'Win a battle at night.'], type: 'amulet', col: '#7a8aff' },
    { id: 'a_bourka', cs: 'Pán hromu', en: 'Thunder Lord', d: ['Vyhraj bitvu v bouřce.', 'Win a battle in a thunderstorm.'], type: 'roh', col: '#fff36a' },
    { id: 'a_mlha', cs: 'Přízrak z mlhy', en: 'Phantom of the Fog', d: ['Vyhraj bitvu v mlze.', 'Win a battle in the fog.'], type: 'helm', col: '#c8d8e8' },
    { id: 'a_snih', cs: 'Ledové srdce', en: 'Heart of Ice', d: ['Vyhraj bitvu ve sněžení.', 'Win a battle in snowfall.'], type: 'amulet', col: '#bfe8ff' },
    { id: 'a_hrad', cs: 'Nedobytný', en: 'Unbreakable', d: ['Vyhraj bitvu, aniž by tvůj hrad ztratil život.', 'Win a battle without your castle losing any health.'], type: 'stit', col: '#7ab8ff' },
    { id: 'a_zachrana', cs: 'Na poslední chvíli', en: 'Last Stand', d: ['Vyhraj s hradem pod 10 % životů.', 'Win with your castle under 10% health.'], type: 'stit', col: '#ff7a4a' },
    { id: 'a_mazlicek', cs: 'Věrný přítel', en: 'Loyal Friend', d: ['Mazlíček použije schopnost 8× v jedné bitvě.', 'Your pet uses its ability 8 times in one battle.'], type: 'amulet', col: '#ffb8e8' },
    { id: 'a_blesk', cs: 'Bleskový útok', en: 'Blitz', d: ['Vyhraj bitvu za méně než 3 minuty.', 'Win a battle in under 3 minutes.'], type: 'roh', col: '#ffe14a' }
  ];
  G.trophyBonus = save => Math.min(0.2, Object.keys((save.relics || {})).length * 0.01);   // +1 % mincí v bitvě za každou trofej (max +20 %)
  function giveTrophy(b, id, def) {
    const save = window.App && App.save; if (!save || b.net) return;
    save.relics = save.relics || {};
    if (save.relics[id]) return;
    save.relics[id] = Object.assign({ at: Date.now() }, def || {});
    (b._newTrophies = b._newTrophies || []).push(id);
    const nm = def && def.name ? def.name : (ACH.find(a => a.id === id) || {})[L('cs', 'en') === 'cs' ? 'cs' : 'en'] || id;
    banner(b, L('Nová trofej!', 'New trophy!'), nm, '#ffd24a', false, 'A new trophy for your hall of fame!');
    try { App.persist(); } catch (e) {}
  }
  G.giveTrophy = giveTrophy;

  /* ======================= NAPOJENÍ NA BITVU ======================= */
  const U0 = B.update;
  B.update = function (dt) {
    if (!this._nvInit) this._nvInit2();
    U0.call(this, dt);
    if (this.over) return;
    this._nvUpdate(dt);
  };
  B._nvInit2 = function () {
    this._nvInit = true;
    const mode = (this.o && this.o.mode) || this.mode;
    this.wx = this.o && this.o.weather ? this.o.weather : pickWeather(this);
    const W = WX[this.wx];
    this._wxParts = [];
    this._streak = { n: 0, last: -9, said: 0 }; this._enStreak = { n: 0, last: -9, said: false };
    this._alerts = {}; this._ms = 0;
    this._castleStartHp = this.side.player.castle.hp;
    const save = window.App && App.save;
    // mazlíček (jen pro hráče, ne v online bitvách proti lidem)
    if (save && !this.net) {
      const p = G.petOf(save);
      this.pet = { def: p, x: this.side.player.castle.front + 120, y: C().laneTop - 120, cd: p.cd * 0.6, act: 0, uses: 0, tx: null, ty: null, coins: [] };
      // bonus trofejí: víc mincí
      const k = 1 + G.trophyBonus(save);
      if (k > 1) { const s = this.side.player; s.income *= k; s.baseIncome = (s.baseIncome || s.income / k) * k; }
    }
    if (W && W.say) this.later(1.6, () => { if (!this.over) banner(this, L(W.cs, W.en), L(W.fx[0], W.fx[1]), '#bfe6ff', true, W.say, true); });
  };
  B._nvUpdate = function (dt) {
    const t = this.time, cfg = C();
    // déšť a bouřka zkracují hoření
    if (this.wx === 'dest' || this.wx === 'bourka') for (const u of this.units) if (u.dot && u._rainDot !== u.dot && /255,1[24]0/.test(u.dot.c || '')) { u._rainDot = u.dot; u.dot.until = t + Math.max(0.5, (u.dot.until - t) * 0.5); }
    // blesky v bouřce
    if (this.wx === 'bourka') {
      this._boltT = (this._boltT == null ? 6 : this._boltT) - dt;
      if (this._boltT <= 0) {
        this._boltT = 7 + (this.rand ? this.rand() : Math.random()) * 8;
        const vis = this.units.filter(u => !u.dead && !u._sh && u.x > this.cam.x && u.x < this.cam.x + this.cam.viewW);
        if (vis.length) {
          const u = vis[Math.floor((this.rand ? this.rand() : Math.random()) * vis.length)];
          this.vfx.lightning(u.x, (this.H - this.cam.viewH) - 20, u.y - 10);
          this.flash = { color: '#eef4ff', t: 0, life: 0.25 }; this.shake = Math.max(this.shake, 0.4);
          this._damage(u, 70, null);
          if (window.Zvuk) Zvuk.play('bolt', 0.9);
        }
      }
    }
    // poplach na hradě a poslední útok
    const P = this.side.player.castle, E = this.side.enemy.castle, A = this._alerts;
    if (!A.p60 && P.hp < P.maxHp * 0.6) { A.p60 = 1; banner(this, L('Hrad je pod útokem!', 'Castle under attack!'), '', '#ff7a6a', false, 'Your castle is under attack!', true); }
    if (!A.p25 && P.hp < P.maxHp * 0.25) { A.p25 = 1; banner(this, L('Hradby se hroutí!', 'The walls are crumbling!'), L('Braň hrad!', 'Defend the castle!'), '#ff4a3a', true, 'The walls are crumbling! Defend the castle!', true); }
    if (!A.e50 && E.hp < E.maxHp * 0.5) { A.e50 = 1; banner(this, L('Nepřátelské hradby praskají!', 'Enemy walls are cracking!'), '', '#ffd77a', false, 'The enemy walls are cracking!'); }
    if (!A.e20 && E.hp < E.maxHp * 0.2) { A.e20 = 1; banner(this, L('Poslední útok!', 'Final push!'), L('Dobij jejich hrad!', 'Bring it down!'), '#ffd24a', true, 'Final push! Bring it down!', true); }
    // boss na scéně
    if (!A.boss && this.units.some(u => !u.dead && u.def.boss)) { A.boss = 1; Ann.say('A mighty foe approaches!', true); }
    // konec série (pauza)
    if (this._streak.n && t - this._streak.last > 3) this._streak.n = 0;
    if (this._enStreak.n && t - this._enStreak.last > 3) { this._enStreak.n = 0; this._enStreak.said = false; }
    // nápisy
    if (this._banners) { for (const b of this._banners) b.t += dt; this._banners = this._banners.filter(b => b.t < b.life); }
    // počasí – částice
    this._wxUpdate(dt);
    // mazlíček
    if (this.pet) this._petUpdate(dt);
  };

  // hlasatel: série zabití
  const STREAK = [[2, 'Double Kill!', 'Double kill!'], [3, 'Triple Kill!', 'Triple kill!'], [4, 'Quadra Kill!', 'Quadra kill!'], [6, 'Rampage!', 'Rampage!'], [10, 'Massacre!', 'Massacre!'], [15, 'Unstoppable!', 'Unstoppable!'], [25, 'Godlike!', 'Godlike!'], [40, 'Legendary!', 'Legendary!']];
  const MILES = [[1, 'First Blood!', 'First blood!'], [25, 'Killing Spree!', 'Killing spree!'], [50, 'Dominating!', 'Dominating!'], [100, 'Annihilation!', 'Total annihilation!'], [250, 'Warlord!', 'You are a true warlord!'], [500, 'Immortal Army!', 'Your army is immortal!']];
  B._onKill = function (target, from, killer) {
    if (!this._nvInit) return;
    const t = this.time;
    if (killer === 'player') {
      const S = this._streak;
      S.n = t - S.last <= 3 ? S.n + 1 : 1; S.last = t;
      const st = STREAK.filter(s => s[0] === S.n)[0];
      if (st) {
        const bonus = S.n * 6;
        if (!this.net || this.net.role !== 'client') { const ps = this.side.player; ps.coins = Math.min(ps.maxCoins, ps.coins + bonus); }
        banner(this, st[1], '+' + bonus + ' ' + L('mincí', 'coins'), S.n >= 10 ? '#ff7a4a' : '#ffd77a', S.n >= 6, st[2], S.n >= 6);
        if (S.n === 10) giveTrophy(this, 'a_massacre');
        if (S.n === 25) giveTrophy(this, 'a_godlike');
      }
      const m = MILES.find(x => x[0] === this.kills);
      if (m) { banner(this, m[1], '', '#ffe28a', this.kills >= 50, m[2]); if (this.kills === 1) giveTrophy(this, 'a_prvni'); if (this.kills === 100) giveTrophy(this, 'a_stovka'); }
      // západ slunce: zlatá hodinka
      if (this.wx === 'zapad') { const ps = this.side.player, r = Math.round(target.def.cost * C().killRewardRatio * 0.15); ps.coins = Math.min(ps.maxCoins, ps.coins + r); }
      // mazlíček sbírá padlé mince
      if (this.pet) {
        const g = this.pet.def.kind === 'gold' ? 3 : 1, ps = this.side.player;
        ps.coins = Math.min(ps.maxCoins, ps.coins + g);
        if (this.pet.coins.length < 14) this.pet.coins.push({ x: target.x, y: target.y - 40, t: 0 });
      }
      // trofej z bosse / generála
      if (target.def.boss || target.gen) {
        const id = 'b_' + target.def.id;
        if (target.def.boss || Math.random() < 0.5) giveTrophy(this, id, { name: target.def.name, type: TROPHY_TYPES[Math.abs(hash(target.def.id)) % TROPHY_TYPES.length], col: (target.def.look && (target.def.look.magic || target.def.look.plume)) || '#ffd24a', boss: !!target.def.boss });
      }
    } else if (killer === 'enemy') {
      const S = this._enStreak; S.n = t - S.last <= 3 ? S.n + 1 : 1; S.last = t;
      if (S.n >= 6 && !S.said) { S.said = true; banner(this, L('Nepřítel řádí!', 'The enemy is on a rampage!'), '', '#ff7a6a', false, 'The enemy is on a rampage!'); }
    }
  };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };

  // vliv počasí na zranění
  const D0 = B._damage;
  B._damage = function (target, raw, from, fire) {
    if (from && from.blindUntil > this.time) raw *= 0.5;   // oslepený inkoustem
    if (this.wx && from && from.def && !this._abGate) {
      const w = this.wx, rg = from.def.ranged, mag = from.def.roleKey === 'mag';
      if (w === 'noc') raw *= rg ? 0.9 : 1.05;
      else if (w === 'dest' || w === 'bourka') { if (rg && !mag) raw *= 0.9; }
      else if (w === 'mlha') { if (rg && !mag) raw *= 0.85; }
      else if (w === 'snih') raw *= mag ? 1.1 : 0.95;
    }
    return D0.call(this, target, raw, from, fire);
  };
  // konec bitvy: hlasatel a trofeje za počasí
  const E0 = B._end;
  B._end = function (win, reason) {
    if (this.over) return E0.call(this, win, reason);
    try {
      if (this._nvInit) {
        Ann.say(win ? 'Victory! The enemy castle has fallen!' : 'Defeat. Your castle has fallen.', true);
        if (win) {
          const wxT = { noc: 'a_noc', bourka: 'a_bourka', mlha: 'a_mlha', snih: 'a_snih' }[this.wx]; if (wxT) giveTrophy(this, wxT);
          const pc = this.side.player.castle;
          if (pc.hp >= this._castleStartHp) giveTrophy(this, 'a_hrad');
          if (pc.hp < pc.maxHp * 0.1) giveTrophy(this, 'a_zachrana');
          if (this.time < 180) giveTrophy(this, 'a_blesk');
          if (this.pet && this.pet.uses >= 8) giveTrophy(this, 'a_mazlicek');
        }
      }
    } catch (e) { /* nic */ }
    return E0.call(this, win, reason);
  };

  /* ---------------- počasí: částice a kreslení ---------------- */
  B._wxUpdate = function (dt) {
    const w = this.wx, P = this._wxParts; if (!P) return;
    const want = w === 'dest' ? 160 : w === 'bourka' ? 220 : w === 'snih' ? 140 : w === 'mlha' ? 7 : 0;
    while (P.length < want) P.push({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.8, ph: Math.random() * 6 });
    if (P.length > want) P.length = want;
    for (const p of P) {
      if (w === 'snih') { p.y += dt * 0.08 * p.s; p.x += dt * (0.01 + Math.sin(p.ph += dt * 1.5) * 0.015); }
      else if (w === 'mlha') { p.x += dt * 0.012 * p.s; }
      else { p.y += dt * 1.1 * p.s; p.x -= dt * 0.18 * p.s; }
      if (p.y > 1.05) { p.y = -0.05; p.x = Math.random() * 1.2; }
      if (p.x < -0.1) p.x += 1.2; if (p.x > 1.15) p.x -= 1.25;
    }
  };
  // ve světě (pod texty): tma a světla v noci, mazlíček
  B._drawWorldFx = function (ctx, t) {
    if (!this._nvInit) return;
    const w = this.wx, W = this.canvas.width, H = this.canvas.height;
    if (w === 'noc' || w === 'bourka' || w === 'zapad' || w === 'dest' || w === 'mlha') {
      const tr = ctx.getTransform();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (w === 'noc') { ctx.fillStyle = 'rgba(6,12,40,.48)'; ctx.fillRect(0, 0, W, H); }
      else if (w === 'bourka') { ctx.fillStyle = 'rgba(14,18,34,.38)'; ctx.fillRect(0, 0, W, H); }
      else if (w === 'dest') { ctx.fillStyle = 'rgba(30,40,60,.18)'; ctx.fillRect(0, 0, W, H); }
      else if (w === 'zapad') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,120,60,.26)'); g.addColorStop(0.6, 'rgba(255,90,80,.12)'); g.addColorStop(1, 'rgba(80,20,60,.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      else if (w === 'mlha') { ctx.fillStyle = 'rgba(220,228,236,.16)'; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
      if (w === 'noc' || w === 'bourka') {
        // světla: brány hradů, hořící vojáci a mágové
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const glow = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
        const gy = C().groundY;
        [this.side.player.castle.front, this.side.enemy.castle.front].forEach(x => { glow(x, gy - 120, 230, 'rgba(255,160,70,.30)'); glow(x, gy - 220, 120, 'rgba(255,190,90,.25)'); });
        let n = 0; const x0 = this.cam.x - 50, x1 = this.cam.x + this.cam.viewW + 50;
        for (const u of this.units) { if (n > 40 || u.dead || u.x < x0 || u.x > x1) continue; if (u.dot && this.time < u.dot.until) { glow(u.x, u.y - 40, 70, 'rgba(255,140,50,.28)'); n++; } else if (u.def.roleKey === 'mag') { glow(u.x, u.y - 60, 46, 'rgba(140,180,255,.2)'); n++; } }
        ctx.restore();
      }
      ctx.setTransform(tr);
    }
    if (this.pet) this._petDraw(ctx, t);
  };
  // přes obrazovku (nad texty): déšť, sníh, mlha, měsíc a nápisy hlasatele
  B._drawScreenFx = function (ctx) {
    if (!this._nvInit) return;
    const W = this.canvas.width, H = this.canvas.height, w = this.wx, P = this._wxParts, d = this.dpr || 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (w === 'noc') {
      const mx = W * 0.86, my = H * 0.16, r = 26 * d;
      const g = ctx.createRadialGradient(mx, my, r * 0.6, mx, my, r * 4); g.addColorStop(0, 'rgba(220,230,255,.35)'); g.addColorStop(1, 'rgba(220,230,255,0)'); ctx.fillStyle = g; ctx.fillRect(mx - r * 4, my - r * 4, r * 8, r * 8);
      ctx.beginPath(); ctx.arc(mx, my, r, 0, TAU); ctx.fillStyle = '#f2f4ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(mx - r * 0.3, my - r * 0.2, r * 0.22, 0, TAU); ctx.arc(mx + r * 0.35, my + r * 0.25, r * 0.15, 0, TAU); ctx.fillStyle = 'rgba(180,190,220,.6)'; ctx.fill();
      for (let i = 0; i < 40; i++) { const sx = (i * 9973 % 1000) / 1000 * W, sy = (i * 7919 % 1000) / 1000 * H * 0.35, tw = 0.5 + Math.sin(this.time * 2 + i) * 0.5; ctx.fillStyle = `rgba(255,255,255,${0.3 + tw * 0.5})`; ctx.fillRect(sx, sy, 1.6 * d, 1.6 * d); }
    }
    if (P && P.length) {
      if (w === 'dest' || w === 'bourka') {
        ctx.beginPath(); for (const p of P) { const x = p.x * W, y = p.y * H; ctx.moveTo(x, y); ctx.lineTo(x - 5 * d * p.s, y + 18 * d * p.s); }
        ctx.lineWidth = 1.2 * d; ctx.strokeStyle = 'rgba(190,210,240,.42)'; ctx.stroke();
      } else if (w === 'snih') {
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); for (const p of P) { const x = p.x * W, y = p.y * H, r = 1.6 * d * p.s; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } ctx.fill();
      } else if (w === 'mlha') {
        for (const p of P) { const x = p.x * W, y = H * (0.45 + p.y * 0.5); const g = ctx.createRadialGradient(x, y, 10, x, y, 260 * d * p.s); g.addColorStop(0, 'rgba(235,240,245,.32)'); g.addColorStop(1, 'rgba(235,240,245,0)'); ctx.fillStyle = g; ctx.fillRect(x - 260 * d * p.s, y - 260 * d * p.s, 520 * d * p.s, 520 * d * p.s); }
      }
    }
    // nápisy hlasatele
    if (this._banners && this._banners.length) {
      this._banners.forEach((b, i) => {
        const k = b.t / b.life, a = k < 0.1 ? k / 0.1 : k > 0.75 ? (1 - k) / 0.25 : 1, pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.5 : k < 0.2 ? 1.1 - (k - 0.12) / 0.08 * 0.1 : 1;
        const y = H * 0.24 + i * 62 * d, size = (b.big ? 48 : 34) * d * pop;
        ctx.globalAlpha = Math.max(0, a);
        ctx.textAlign = 'center'; ctx.font = `900 ${size}px "Cinzel", "Alegreya Sans", serif`;
        ctx.lineWidth = 8 * d; ctx.strokeStyle = 'rgba(8,10,16,.92)'; ctx.strokeText(b.txt, W / 2, y);
        const g = ctx.createLinearGradient(0, y - size, 0, y); g.addColorStop(0, '#ffffff'); g.addColorStop(1, b.color); ctx.fillStyle = g; ctx.fillText(b.txt, W / 2, y);
        if (b.sub) { ctx.font = `800 ${17 * d}px "Alegreya Sans", sans-serif`; ctx.lineWidth = 4 * d; ctx.strokeText(b.sub, W / 2, y + 24 * d); ctx.fillStyle = '#fff4d8'; ctx.fillText(b.sub, W / 2, y + 24 * d); }
      });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  /* ---------------- mazlíček v bitvě ---------------- */
  B._petUpdate = function (dt) {
    const p = this.pet, cfg = C(), me = this.side.player, foe = this.side.enemy;
    // drží se nad přední linií vlastní armády
    let front = me.castle.front + 140;
    for (const u of this.units) if (!u.dead && u.team === 'player' && u.x > front - 140 && u.x < foe.castle.front) front = Math.max(front, u.x - 30);
    const hx = Math.min(front, foe.castle.front - 220), hy = cfg.laneTop - 120 + Math.sin(this.time * 1.6) * 12;
    const tx = p.tx != null ? p.tx : hx, ty = p.ty != null ? p.ty : hy;
    const k = Math.min(1, dt * (p.tx != null ? 6 : 1.6));
    p.x += (tx - p.x) * k; p.y += (ty - p.y) * k;
    if (p.act > 0) { p.act -= dt; if (p.act <= 0) { p.tx = p.ty = null; } }
    for (const c of p.coins) c.t += dt * 1.6; p.coins = p.coins.filter(c => c.t < 1);
    p.cd -= dt;
    if (p.cd > 0) return;
    p.cd = p.def.cd;
    const foes = this.units.filter(e => e.team === 'enemy' && !e.dead && !e._sh);
    const mine = this.units.filter(u => u.team === 'player' && !u.dead);
    const near = (x, r) => foes.filter(e => Math.abs(e.x - x) < r);
    const used = () => { p.uses++; p.act = 1.1; };
    switch (p.def.kind) {
      case 'heal': {
        const w = mine.filter(u => u.hp < u.maxHp).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp).slice(0, 3);
        if (!w.length) { p.cd = 2; return; }
        w.forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.25); this.vfx.rise(u.x, u.y, 'heal', 10); });
        used(); break;
      }
      case 'dive': {
        const e = near(p.x, 520).sort((a, b) => b.hp - a.hp)[0]; if (!e) { p.cd = 2; return; }
        p.tx = e.x; p.ty = e.y - 50; used();
        this.later(0.45, () => { if (!this.over && !e.dead) { this._damage(e, 120, null); this._sparks(e.x, e.y - 40, '#ffe28a', 12); if (window.Zvuk) Zvuk.play('sword', 0.8); } });
        break;
      }
      case 'fire': {
        const f = foes.filter(e => Math.abs(e.x - p.x) < 480).sort((a, b) => a.x - b.x).slice(0, 8); if (!f.length) { p.cd = 2; return; }
        p.tx = f[0].x - 90; p.ty = f[0].y - 80; used();
        this.later(0.4, () => { if (this.over) return; f.forEach(e => { if (!e.dead) { this._damage(e, 55, null, true); e.dot = { until: this.time + 2.5, dps: 10, c: 'rgba(255,120,40,.45)' }; } }); if (f[0]) this.vfx.explosion(f[0].x, f[0].y - 30, 70, 'fire'); if (window.Zvuk) Zvuk.play('fire', 0.7); });
        break;
      }
      case 'gold': {
        me.coins = Math.min(me.maxCoins, me.coins + 25); used();
        this.texts.push({ x: p.x, y: p.y - 30, txt: '+25', color: '#ffd54f', t: 0, life: 1.2, coin: true });
        if (window.Zvuk) Zvuk.play('coin', 0.7); break;
      }
      case 'bolt': {
        const e = near(p.x, 560).sort((a, b) => b.def.cost - a.def.cost)[0]; if (!e) { p.cd = 2; return; }
        p.tx = e.x; p.ty = e.y - 150; used();
        this.later(0.38, () => { if (this.over || e.dead) return; this.vfx.lightning(e.x, e.y - 150, e.y - 10); this._damage(e, 150, null); e.stunUntil = this.time + 1; if (window.Zvuk) Zvuk.play('bolt', 0.8); });
        break;
      }
      case 'rebirth': {
        used(); this.vfx.explosion(p.x, p.y + 40, 120, 'fire');
        mine.filter(u => Math.abs(u.x - p.x) < 200).forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.15); this.vfx.rise(u.x, u.y, 'heal', 8); });
        near(p.x, 200).forEach(e => this._damage(e, 40, null, true));
        if (window.Zvuk) Zvuk.play('fire', 0.7); break;
      }
      case 'scare': {
        const f = near(p.x + 120, 160); if (!f.length) { p.cd = 2; return; }
        p.tx = p.x + 120; used();
        f.forEach(e => { if (!e.def.boss) { e.x += 60; e.slotX = null; } e.stunUntil = this.time + 0.8; });
        this.texts.push({ x: p.x + 120, y: p.y - 20, txt: 'BUBU!', color: '#c8f0ff', t: 0, life: 1, big: true });
        if (window.Zvuk) Zvuk.play('magic', 0.7); break;
      }
      case 'blind': {
        const f = near(p.x + 100, 220); if (!f.length) { p.cd = 2; return; }
        used(); f.forEach(e => { e.blindUntil = this.time + 4; this.particles.push({ x: e.x, y: e.y - 50, vx: 0, vy: -10, g: 0, t: 0, life: 1.2, r: 9, color: 'rgba(30,16,48,.8)', soft: true }); });
        if (window.Zvuk) Zvuk.play('magic', 0.6); break;
      }
      case 'needles': {
        const f = near(p.x + 150, 300).slice(0, 10); if (!f.length) { p.cd = 2; return; }
        used(); f.forEach((e, i) => this.later(0.05 * i, () => { if (!e.dead) { this._damage(e, 30, null); this._sparks(e.x, e.y - 50, '#7be04a', 4); } }));
        break;
      }
      case 'repair': {
        const c0 = me.castle; if (c0.hp >= c0.maxHp) { p.cd = 3; return; }
        used(); c0.hp = Math.min(c0.maxHp, c0.hp + c0.maxHp * 0.04); this.vfx.rise(c0.front - 100, cfg.groundY - 80, 'heal', 20);
        p.tx = c0.front - 60; p.ty = cfg.groundY - 260; if (window.Zvuk) Zvuk.play('heal', 0.7); break;
      }
      case 'drain': {
        const e = near(p.x, 500).sort((a, b) => b.hp - a.hp)[0]; if (!e) { p.cd = 2; return; }
        const w = mine.filter(u => u.hp < u.maxHp).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        p.tx = e.x; p.ty = e.y - 70; used();
        this.later(0.4, () => { if (this.over) return; if (!e.dead) this._damage(e, 80, null); if (w && !w.dead) { w.hp = Math.min(w.maxHp, w.hp + 80); this.vfx.rise(w.x, w.y, 'heal', 8); } });
        break;
      }
      case 'cannon': {
        const f = near(p.x + 150, 420).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x)).slice(0, 3); if (!f.length) { p.cd = 2; return; }
        used(); f.forEach((e, i) => this.later(0.2 + i * 0.25, () => { if (!e.dead) { this._damage(e, 50, null); this.vfx.explosion(e.x, e.y - 20, 36, 'stone'); if (window.Zvuk) Zvuk.play('boom', 0.4); } }));
        break;
      }
      case 'pulse': {
        const f = near(p.x, 150); if (!f.length) { p.cd = 2; return; }
        used(); this.vfx.explosion(p.x, p.y + 60, 90, 'ice');
        f.forEach(e => { this._damage(e, 25, null); e.stunUntil = this.time + 1.2; });
        if (window.Zvuk) Zvuk.play('bolt', 0.6); break;
      }
      case 'foxfire': {
        const f = near(p.x + 150, 450); if (!f.length) { p.cd = 2; return; }
        used(); for (let i = 0; i < 3; i++) { const e = f[Math.floor(Math.random() * f.length)]; this.later(0.2 + i * 0.2, () => { if (!e.dead) { this._damage(e, 60, null, true); e.dot = { until: this.time + 2, dps: 8, c: 'rgba(255,120,40,.45)' }; this.vfx.explosion(e.x, e.y - 30, 40, 'fire'); } }); }
        if (window.Zvuk) Zvuk.play('fire', 0.6); break;
      }
      case 'raise': {
        const uid = G.unitForRole(me.faction, 'pech'); if (!uid) { p.cd = 3; return; }
        used(); this.spawn('player', uid, true); const u = this.units[this.units.length - 1];
        if (u) { u.x = Math.max(me.castle.front + 60, p.x); this.vfx.pillar(u.x, u.y, 50, 'rgba(122,255,138,.6)', 0.9); this.vfx.rise(u.x, u.y, 'shadow', 12); }
        if (window.Zvuk) Zvuk.play('magic', 0.7); break;
      }
      case 'splash': {
        const f = near(p.x + 120, 170); if (!f.length) { p.cd = 2; return; }
        used(); this.vfx.explosion(p.x + 120, cfg.laneTop + 60, 90, 'water');
        f.forEach(e => { this._damage(e, 20, null); if (!e.def.boss) { e.x = Math.min(foe.castle.front - 30, e.x + 80); e.slotX = null; } });
        if (window.Zvuk) Zvuk.play('boom', 0.4); break;
      }
      case 'spores': {
        const f = near(p.x + 150, 300); if (!f.length) { p.cd = 2; return; }
        used(); const x = f[0].x; this.clouds.push({ team: 'player', x, y: f[0].y, r: 100, until: this.time + 4, dps: 18, tick: 0.2 }); this.vfx.explosion(x, f[0].y - 20, 60, 'poison');
        break;
      }
      case 'shards': {
        const f = near(p.x + 150, 380).slice(0, 6);
        used(); me.coins = Math.min(me.maxCoins, me.coins + 15); this.texts.push({ x: p.x, y: p.y - 30, txt: '+15', color: '#ffd54f', t: 0, life: 1.1, coin: true });
        f.forEach((e, i) => this.later(0.1 * i, () => { if (!e.dead) { this._damage(e, 45, null); this._sparks(e.x, e.y - 40, '#ff8ae0', 6); } }));
        break;
      }
      case 'curse': {
        if (!foes.length) { p.cd = 2; return; }
        used(); foe.curseUntil = Math.max(foe.curseUntil || 0, this.time + 3);
        foes.filter(e => Math.abs(e.x - p.x) < 700).slice(0, 40).forEach(e => this.vfx.rise(e.x, e.y, 'shadow', 5));
        if (window.Zvuk) Zvuk.play('magic', 0.7); break;
      }
      case 'shield': {
        me.shieldUntil = Math.max(me.shieldUntil || 0, this.time + 3); used();
        mine.slice(0, 30).forEach(u => this.vfx.rise(u.x, u.y, 'holy', 6));
        if (window.Zvuk) Zvuk.play('magic', 0.7); break;
      }
    }
  };
  B._petDraw = function (ctx, t) {
    const p = this.pet; if (!p) return;
    // mince letící k mazlíčkovi
    for (const c of p.coins) { const x = c.x + (p.x - c.x) * c.t, y = c.y + (p.y - c.y) * c.t - Math.sin(c.t * Math.PI) * 40; ctx.beginPath(); ctx.ellipse(x, y, 5, 5 * Math.abs(Math.cos(t * 8 + c.x)), 0, 0, TAU); ctx.fillStyle = '#ffd24a'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#8a5a10'; ctx.stroke(); }
    const S = 1.25 * US();
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(S, S);
    ctx.beginPath(); ctx.ellipse(0, 26, 16, 4, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fill();
    G.drawPet(ctx, p.def.id, t, p.act > 0);
    ctx.restore();
  };
})();
