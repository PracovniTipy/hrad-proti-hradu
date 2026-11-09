/* =========================================================================
   VÁNOCE V CASTLE WARS – živá událost (1.–31. prosince)
   - Zasněžené bojiště i domovská scéna: sníh na zemi a hradech, padající sníh,
     světýlka na hradbách, vánoční stromek u hradu (vše předkreslené = levné).
   - Adventní kalendář (24 okének, 1.–24. 12.): každý den jedno okénko zdarma,
     zmeškaná okénka jdou dohnat za vločky nebo drahokamy. Odměny rostou až
     k velkému dárku 24. prosince.
   - Vánoční skiny s vlastním tvarem pro všech 6 druhů vojáků (Santa Klaus,
     skřítci, louskáčci, perníčci, sobí jezdci, sněhuláci), vánoční zbraně,
     hrad „Vánoční palác“ a dekorace „Vánoční výzdoba“.
   - Exkluzivní mazlíček Sobík Rudolf: jen do 25. 12. 23:59 (12 okének). Kdo ho
     má, má ho navždy.
   - Vločky ❄: dárky ze Santových saní v bitvách (klepni na dárek), výhry a
     denní Vánoční koulovačka. Za vločky se dohánějí okénka a nakupuje
     v Santově obchůdku.
   - Upozornění v Android aplikaci (id 201–224).
   Test: ?vanoce=1 nebo localStorage['cw-vanoce']='1' (událost zapnutá),
         localStorage['cw-vanoce-den']='12' (předstíraný den v prosinci),
         localStorage['cw-vanoce']='teaser' (odpočet před Vánoci).
   Postup hráče se nikdy nemaže: stav je v App.save.vanoce.
   ========================================================================= */
(function () {
  const G = window.GameData, A = window.Art;
  if (!G || !A) return;
  const TAU = Math.PI * 2, PI = Math.PI, OUT = '#1a1410';
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;   // překlad: js/i18n_l.js
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } } };
  const portal = () => !!window.CW_PORTAL;
  const ROLES = ['pech', 'strelec', 'kopi', 'jizda', 'mag', 'velitel'];

  /* ======================= ČAS UDÁLOSTI ======================= */
  const QS = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(''); } })();
  const flag = () => ls.get('cw-vanoce');
  const forced = () => QS.get('vanoce') === '1' || flag() === '1';
  const fakeDay = () => { const v = parseInt(ls.get('cw-vanoce-den'), 10); return v >= 1 && v <= 31 ? v : 0; };
  /* „dnešek“ události: { y, m (0–11), d } – s testovacím přepisem */
  function today() {
    const r = new Date(), fd = fakeDay();
    if (fd && (forced() || r.getMonth() === 11 || flag() !== '0')) return { y: r.getMonth() === 0 ? r.getFullYear() - 1 : r.getFullYear(), m: 11, d: fd };
    if (forced() && r.getMonth() !== 11) return { y: r.getMonth() === 0 ? r.getFullYear() - 1 : r.getFullYear(), m: 11, d: 1 };
    return { y: r.getFullYear(), m: r.getMonth(), d: r.getDate() };
  }
  const active = () => today().m === 11;                         // 1.–31. prosince
  const petOpen = () => active() && today().d <= 25;             // Rudolf jen do 25. 12. 23:59
  const dayKey = () => { const n = today(); return n.y + '-' + (n.m + 1) + '-' + n.d; };
  function teaserDays() {
    if (active()) return 0;
    if (flag() === 'teaser') return 7;
    const r = new Date(); if (r.getMonth() !== 10) return 0;     // odpočet jen v listopadu
    return Math.max(1, Math.ceil((new Date(r.getFullYear(), 11, 1) - r) / 864e5));
  }
  const daysWord = n => L(n === 1 ? 'den' : n >= 2 && n <= 4 ? 'dny' : 'dní', n === 1 ? 'day' : 'days');

  /* ======================= STAV HRÁČE ======================= */
  function state(save) {
    const n = today();
    const S = save.vanoce || (save.vanoce = { y: n.y, doors: {}, fl: 0, day: {}, shop: {} });
    S.doors = S.doors || {}; S.day = S.day || {}; S.shop = S.shop || {}; S.fl = S.fl || 0;
    // nový rok: loňská okénka se uloží do historie (nic se nemaže), kalendář začne znovu
    if (active() && S.y !== n.y) { S.past = S.past || {}; S.past[S.y] = { doors: S.doors }; S.doors = {}; S.y = n.y; S.snowDay = ''; }
    if (S.day.k !== dayKey()) S.day = { k: dayKey(), p: 0, w: 0 };
    return S;
  }
  const opened = save => Object.keys(state(save).doors).length;
  const FL_CAP = { p: 30, w: 24 };                               // denní strop vloček: dárky ze saní, bitvy
  function addFlakes(save, n, src) {
    const S = state(save);
    if (src) { const left = Math.max(0, FL_CAP[src] - (S.day[src] || 0)); n = Math.min(n, left); S.day[src] = (S.day[src] || 0) + n; }
    S.fl += n; return n;
  }

  /* ======================= VÁNOČNÍ SKINY: DATA ======================= */
  const XA = { pech: 'xm_louskacek', strelec: 'xm_skritek', kopi: 'xm_pernik', jizda: 'xm_sob', mag: 'xm_snehulak', velitel: 'xm_santa' };
  const isSam = uid => G.units[uid] && G.units[uid].faction === 'samurajove';
  function xWeapon(uid) {
    const cat = A.weaponCat ? A.weaponCat(G.units[uid].look.weapon) : null;
    if (G.units[uid].look.weapon === 'staff') return 'xm_w_staff';
    if (cat === 'bow') return 'xm_w_bow';
    if (cat === 'pole') return 'xm_w_spear';
    if (cat === 'melee') return isSam(uid) ? 'xm_w_kat' : 'xm_w_cane';
    return null;
  }
  const SKIN = (id, only, name, rarity, palette, feat, look, desc, en, extra) => Object.assign({
    id, only, name, rarity, palette, feat, look, desc, en, codeOnly: true, season: 'xmas', cost: {},
    bonus: rarity === 'Legendární' ? { hp: 0.1, dmg: 0.1 } : { hp: 0.07 }
  }, extra || {});
  const unitsOf = role => (G.skinOwn ? G.skinOwn.unitsOfRole(role) : []);

  /* ---------- tvary (ArmorForge díly) ---------- */
  const AF = window.ArmorForge, FP = AF && AF.parts;
  const lg = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; };
  const rg = (c, x, y, r0, r1, stops, fx, fy) => { const g = c.createRadialGradient(fx == null ? x : fx, fy == null ? y : fy, r0, x, y, r1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; };
  const fs = (c, f, lw) => { c.fillStyle = f; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); } };
  const st = (c, col, lw) => { c.lineWidth = lw; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  const ost = (c, col, lw) => { st(c, OUT, lw + 2.2); st(c, col, lw); };
  const star = (c, x, y, r1, r2, n, rot) => { c.beginPath(); for (let k = 0; k < n * 2; k++) { const a = (rot == null ? -PI / 2 : rot) + k * PI / n, r = k % 2 ? r2 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); };
  const holly = (c, x, y, s) => {
    for (const a of [-0.5, 0.6]) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(2.2 * s, -2.4 * s, 4.6 * s, -1.4 * s); c.lineTo(5.6 * s, 0); c.lineTo(4.6 * s, 1.4 * s); c.quadraticCurveTo(2.2 * s, 2.4 * s, 0, 0); fs(c, '#2f8a3a', 0.7 * s); c.restore(); }
    for (const [dx, dy] of [[-0.6, -0.4], [0.6, -0.8], [0.2, 0.6]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, 1.1 * s, 0, TAU); fs(c, '#e0243a', 0.5 * s); }
  };
  const fluff = (c, pts, r, col) => { c.beginPath(); pts.forEach(([x, y], i) => { c.moveTo(x + r, y); c.arc(x, y, r * (0.85 + (i % 3) * 0.12), 0, TAU); }); fs(c, col, 1.1); };
  const bell = (c, x, y, s) => { c.beginPath(); c.moveTo(x - 2.2 * s, y + 1.6 * s); c.quadraticCurveTo(x - 2 * s, y - 2.4 * s, x, y - 2.4 * s); c.quadraticCurveTo(x + 2 * s, y - 2.4 * s, x + 2.2 * s, y + 1.6 * s); c.closePath(); fs(c, lg(c, x - 2, y - 2, x + 2, y + 2, ['#fff2a8', '#f2c230', '#a8761a']), 0.7 * s); c.beginPath(); c.arc(x, y + 1.9 * s, 0.7 * s, 0, TAU); c.fillStyle = '#6a4a10'; c.fill(); };

  if (FP) {
    const SHL = FP.shells, BK = FP.backs, CH = FP.chests, SHO = FP.shoulders, PAT = FP.patterns;
    /* Santa: čepice s kožešinou přepadlá dozadu s bambulí, bílé vousy a knír */
    SHL.xm_santa = { top: -86, closed: false, eye: [6.6, -62.8], draw(c, k, o) {
      const sw = Math.sin((o.t || 0) * 2.2) * 0.9;
      c.beginPath(); c.moveTo(10.8, -69.6); c.quadraticCurveTo(9.6, -80, 2, -83.2); c.quadraticCurveTo(-7, -86, -13 + sw, -80.6); c.quadraticCurveTo(-17.6 + sw, -76.6, -16.6 + sw, -71.4);
      c.quadraticCurveTo(-12.4 + sw, -74.6, -8.6, -74.2); c.quadraticCurveTo(-9.6, -71.4, -9.2, -68.4); c.quadraticCurveTo(1, -72.6, 10.8, -69.6); c.closePath();
      fs(c, lg(c, -10, -86, 8, -68, ['#ff5a5a', '#d61f2c', '#8a0e18']), 1.8);
      c.beginPath(); c.moveTo(4, -81.4); c.quadraticCurveTo(-5, -83.6, -11.6 + sw, -79); st(c, 'rgba(255,255,255,.35)', 1);
      // kožešinový lem
      c.beginPath(); c.moveTo(-10.2, -69.8); c.quadraticCurveTo(1, -74.6, 12.2, -70.6); c.lineTo(12.4, -65.6); c.quadraticCurveTo(1, -69.2, -10, -64.8); c.closePath();
      fs(c, lg(c, 0, -74, 0, -64, ['#ffffff', '#e8e4dc', '#c9c2b4']), 1.6);
      c.fillStyle = 'rgba(160,150,140,.45)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-8 + i * 2.4, -68.4 + Math.sin(i * 1.7) * 1.1 - (i - 4) * (i - 4) * 0.03, 0.55, 0, TAU); c.fill(); }
      // bambule
      fluff(c, [[-16.4 + sw, -71], [-18.2 + sw, -69.6], [-14.8 + sw, -69.2], [-16.6 + sw, -67.8]], 2.3, '#ffffff');
    }, over(c, k) {
      // vousy přes spodní polovinu obličeje
      c.beginPath(); c.moveTo(0.2, -62.6); c.quadraticCurveTo(-1.4, -55, 1.6, -49.6); c.quadraticCurveTo(4, -45.6, 6.4, -47.6); c.quadraticCurveTo(8.6, -45.2, 10.2, -49);
      c.quadraticCurveTo(12.4, -52, 11.2, -57.4); c.quadraticCurveTo(8, -56.4, 5.4, -58); c.quadraticCurveTo(3, -60, 2.6, -63); c.closePath();
      fs(c, lg(c, 0, -62, 6, -46, ['#ffffff', '#ece8e0', '#c8c0b2']), 1.4);
      c.strokeStyle = 'rgba(150,140,130,.6)'; c.lineWidth = 0.6; for (const [x0, y0, x1, y1] of [[2.6, -56, 3.6, -50], [5.6, -55, 6.4, -49], [8.6, -54, 9.4, -50.4]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 - 0.8, (y0 + y1) / 2, x1, y1); c.stroke(); }
      // knír
      c.beginPath(); c.ellipse(7.2, -58.8, 3.4, 1.5, -0.25, 0, TAU); fs(c, '#ffffff', 1); c.beginPath(); c.ellipse(10.6, -58.9, 2.4, 1.3, 0.35, 0, TAU); fs(c, '#f4f0ea', 1);
      // huňaté bílé obočí a červený nos
      c.beginPath(); c.moveTo(4.2, -65.2); c.quadraticCurveTo(6.6, -67.2, 9.2, -65.4); st(c, '#ffffff', 1.8);
      c.beginPath(); c.arc(10.2, -61.2, 1.5, 0, TAU); fs(c, '#ff8a8a', 0.7);
      c.save(); c.globalAlpha = 0.45; c.beginPath(); c.arc(4.6, -60.4, 1.8, 0, TAU); c.fillStyle = '#ff6a7a'; c.fill(); c.restore();
    } };
    /* skřítek: zelená špičatá čepice se zvonečkem, zubatý pruhovaný lem, špičaté ucho */
    SHL.xm_elf = { top: -90, closed: false, eye: [6.6, -62.8], draw(c, k, o) {
      const sw = Math.sin((o.t || 0) * 2.6) * 1.2;
      c.beginPath(); c.moveTo(11.4, -69.2); c.quadraticCurveTo(8, -80, -2, -86); c.quadraticCurveTo(-8, -90, -14 + sw, -88.4); c.quadraticCurveTo(-11, -86, -10.4, -82); c.quadraticCurveTo(-10, -75, -9.6, -68.4); c.quadraticCurveTo(1, -72.6, 11.4, -69.2); c.closePath();
      fs(c, lg(c, -10, -88, 10, -68, ['#5fd06a', '#2a9a3a', '#16602a']), 1.7);
      c.beginPath(); c.moveTo(6, -76); c.quadraticCurveTo(0, -84, -8, -86.4); st(c, 'rgba(255,255,255,.3)', 1);
      bell(c, -14.6 + sw, -86.6, 1.25);
      // zubatý lem: červenobílé pruhy
      const pts = []; for (let i = 0; i <= 10; i++) { const x = -10.2 + i * 2.25, y = -69.8 + Math.pow((i - 5) / 5, 2) * 1.6 - 3.4; pts.push([x, y]); }
      c.beginPath(); c.moveTo(-10.4, -66.2); pts.forEach(([x, y], i) => c.lineTo(x, i % 2 ? y + 1.4 : y - 1.6)); c.lineTo(12.4, -66.6); c.quadraticCurveTo(1, -69.6, -10.4, -66.2); c.closePath();
      fs(c, '#ffffff', 1.4);
      c.save(); c.clip(); c.fillStyle = '#d6243a'; for (let x = -12; x < 14; x += 4.4) { c.beginPath(); c.moveTo(x, -74); c.lineTo(x + 2.2, -74); c.lineTo(x + 0.2, -64); c.lineTo(x - 2, -64); c.closePath(); c.fill(); } c.restore();
    }, over(c, k) {
      // špičaté ucho přes kulaté
      c.beginPath(); c.moveTo(0.4, -59); c.quadraticCurveTo(-3.6, -60.6, -7.6, -67.6); c.quadraticCurveTo(-2.6, -64.4, 0.6, -63.6); c.closePath(); fs(c, k.skin, 1.1);
      c.beginPath(); c.moveTo(-0.4, -61); c.quadraticCurveTo(-3, -62.2, -5.4, -65.4); st(c, 'rgba(160,80,60,.5)', 0.6);
      c.save(); c.globalAlpha = 0.5; c.beginPath(); c.arc(5, -59.8, 1.7, 0, TAU); c.fillStyle = '#ff6a7a'; c.fill(); c.restore();
    } };
    /* louskáček: vysoká červená čáka se zlatým štítkem a chocholem, velký knír a vousy */
    SHL.xm_shako = { top: -96, closed: false, eye: [6.6, -62.8], draw(c, k) {
      c.beginPath(); c.moveTo(-8.4, -68.6); c.lineTo(-9.4, -88.6); c.quadraticCurveTo(1.6, -91.4, 12.4, -89); c.lineTo(11.6, -69.4); c.quadraticCurveTo(1.6, -71.6, -8.4, -68.6); c.closePath();
      fs(c, lg(c, -9, 0, 12, 0, ['#ff5a5a', '#c8202a', '#7a0e16']), 1.8);
      c.beginPath(); c.moveTo(-9.6, -89); c.quadraticCurveTo(1.6, -92, 12.6, -89.4); ost(c, '#ffd24a', 1.6);
      c.beginPath(); c.moveTo(-8.6, -70.4); c.quadraticCurveTo(1.6, -73.2, 11.8, -71); ost(c, '#ffd24a', 2.2);
      c.beginPath(); c.moveTo(-9, -78); c.quadraticCurveTo(1.6, -80.6, 12.2, -78.4); st(c, '#1a1a24', 1.4);
      // zlatý štítek s hvězdou
      c.beginPath(); c.ellipse(7, -80.6, 3.6, 4.6, 0, 0, TAU); fs(c, lg(c, 4, -85, 10, -76, ['#fff2a8', '#f2c230', '#a8761a']), 1.1);
      star(c, 7, -80.6, 2.4, 1, 5); c.fillStyle = '#d6243a'; c.fill();
      // chochol
      c.beginPath(); c.moveTo(4.6, -90); c.bezierCurveTo(2, -98, 8, -102, 10.6, -97); c.bezierCurveTo(9, -96, 8, -93, 7.4, -90); c.closePath(); fs(c, lg(c, 4, -101, 10, -90, ['#ffffff', '#dfe9f5']), 1.2);
      // podbradní řemínek
      c.beginPath(); c.moveTo(11.2, -69); c.quadraticCurveTo(11.6, -60, 7, -53.6); ost(c, '#ffd24a', 0.9);
    }, over(c) {
      // čtverhranné vousy louskáčka a obrovský knír
      c.beginPath(); c.moveTo(1, -60.6); c.lineTo(1.4, -51); c.quadraticCurveTo(6, -48.6, 11, -51.6); c.lineTo(11, -57.6); c.closePath(); fs(c, lg(c, 0, -60, 0, -48, ['#ffffff', '#e0dbd2']), 1.3);
      c.beginPath(); c.rect(5.2, -56.8, 5.4, 2.6); fs(c, '#ffffff', 0.8); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 0.5; for (const x of [6.6, 8, 9.4]) { c.beginPath(); c.moveTo(x, -56.6); c.lineTo(x, -54.4); c.stroke(); }
      c.beginPath(); c.moveTo(9.6, -60.2); c.bezierCurveTo(6, -62.4, 2, -60, 0.4, -57.6); c.bezierCurveTo(3.4, -58.6, 6.4, -58, 9.6, -58.4); c.bezierCurveTo(11.6, -57.4, 13.6, -58.6, 14.4, -60.6); c.bezierCurveTo(12.8, -61.4, 11, -61.2, 9.6, -60.2); c.closePath(); fs(c, '#ffffff', 1.1);
      c.beginPath(); c.moveTo(4.2, -65.6); c.lineTo(9.4, -66.2); st(c, '#1a1a24', 1.9);
      c.save(); c.globalAlpha = 0.6; c.beginPath(); c.arc(5.4, -61, 2.1, 0, TAU); c.fillStyle = '#ff5a6a'; c.fill(); c.restore();
    } };
    /* perníček: poleva kolem hlavy, polevové obočí a úsměv, růžové tvářičky */
    SHL.xm_ginger = { top: -72, closed: false, eye: [6.6, -62.8], draw() {}, over(c) {
      c.beginPath(); for (let i = 0; i <= 18; i++) { const a = -PI * 0.98 + i / 18 * PI * 0.96, r = 7.1 + (i % 2) * 0.9; const x = 1.8 + Math.cos(a) * r, y = -62 + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } st(c, '#ffffff', 1.3);
      c.beginPath(); c.moveTo(4.4, -65.6); c.quadraticCurveTo(6.6, -67, 8.8, -65.8); st(c, '#ffffff', 1.1);
      c.beginPath(); c.moveTo(5.2, -58.6); c.quadraticCurveTo(7.6, -56, 10, -58.4); st(c, '#ffffff', 1.1);
      c.beginPath(); c.arc(4.6, -60.2, 1.3, 0, TAU); c.arc(10.4, -61, 0.9, 0, TAU); c.fillStyle = '#ff7a9a'; c.fill();
      // malý cukrový čepeček (gumový bonbon)
      c.beginPath(); c.moveTo(-1, -69.4); c.quadraticCurveTo(1.6, -76.6, 5, -69.8); c.closePath(); fs(c, lg(c, 0, -76, 0, -69, ['#ff8aa8', '#e0244a']), 1.1);
      c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y] of [[0.8, -71.4], [2.6, -73.2], [3.4, -70.8]]) { c.beginPath(); c.arc(x, y, 0.5, 0, TAU); c.fill(); }
    } };
    /* sobí jezdec: pletená čepice s ušima, sněhovým vzorem a bambulí */
    SHL.xm_bobble = { top: -84, closed: false, eye: [6.6, -62.8], draw(c) {
      c.beginPath(); c.moveTo(-9.6, -64); c.quadraticCurveTo(-10.6, -78.4, 1.6, -79.6); c.quadraticCurveTo(13, -78.6, 12, -67.4); c.quadraticCurveTo(1, -71.4, -9.6, -64); c.closePath();
      fs(c, lg(c, -10, -80, 12, -64, ['#ff6a5a', '#c8202a', '#7a0e16']), 1.7);
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 0.6; for (let x = -7; x < 11; x += 2.6) { c.beginPath(); c.moveTo(x, -77 + Math.abs(x - 1.6) * 0.1); c.lineTo(x + 0.8, -68.4); c.stroke(); }
      c.beginPath(); c.moveTo(-10, -66.6); c.quadraticCurveTo(1, -73.4, 12.4, -69.6); c.lineTo(12.4, -66.4); c.quadraticCurveTo(1, -70, -9.8, -63.2); c.closePath(); fs(c, '#f6f2ea', 1.2);
      c.fillStyle = '#c8202a'; for (let i = 0; i < 6; i++) { const x = -7.4 + i * 3.6, y = -67.6 + Math.pow((i - 2.6) / 3, 2) * 1.4 - 1.4; c.beginPath(); c.moveTo(x, y - 1.4); c.lineTo(x + 1.2, y); c.lineTo(x, y + 1.4); c.lineTo(x - 1.2, y); c.closePath(); c.fill(); }
      // ušnice
      c.beginPath(); c.moveTo(-3.6, -65.6); c.quadraticCurveTo(-6, -58, -2.6, -54.6); c.quadraticCurveTo(0.6, -58, 0.8, -64.8); c.closePath(); fs(c, lg(c, -4, -66, 0, -54, ['#c8202a', '#8a1018']), 1.2);
      c.beginPath(); c.moveTo(-2.6, -54.6); c.lineTo(-3.4, -50); st(c, '#f6f2ea', 1); c.beginPath(); c.arc(-3.4, -49.4, 1.2, 0, TAU); fs(c, '#ffffff', 0.6);
      fluff(c, [[1.6, -81.4], [-0.2, -80.4], [3.4, -80.6], [1.6, -79.4]], 2.2, '#ffffff');
    } };
    /* sněhulák: sněhová koule místo hlavy, uhlíky, mrkev a cylindr s cesmínou */
    SHL.xm_snowman = { top: -92, closed: true, eye: [6.6, -64], draw(c) {
      c.beginPath(); c.arc(1.8, -63.4, 10.6, 0, TAU); fs(c, rg(c, 1.8, -63.4, 1, 11.4, [[0, '#ffffff'], [0.6, '#eef5fb'], [1, '#b4cce0']], -1.4, -67.4), 1.8);
      c.fillStyle = 'rgba(150,190,220,.35)'; c.beginPath(); c.ellipse(-2.6, -58.4, 4.6, 2.2, 0.4, 0, TAU); c.fill();
      c.fillStyle = '#1a1a22'; for (const [x, y, r] of [[4.6, -66, 1.25], [8.8, -65.6, 1.15]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      c.fillStyle = '#fff'; for (const [x, y] of [[4.9, -66.4], [9.1, -66]]) { c.beginPath(); c.arc(x, y, 0.4, 0, TAU); c.fill(); }
      c.fillStyle = '#2a2a32'; for (let i = 0; i < 5; i++) { const a = 0.25 + i * 0.28; c.beginPath(); c.arc(5.2 + Math.cos(a) * 5.2 - 1.6, -61.4 + Math.sin(a) * 3.6, 0.7, 0, TAU); c.fill(); }
      c.beginPath(); c.moveTo(9.6, -63.8); c.lineTo(19.6, -61.6); c.lineTo(9.8, -60.6); c.closePath(); fs(c, lg(c, 10, -63, 18, -61, ['#ffb04a', '#f07a1a', '#c4500a']), 1);
      c.strokeStyle = 'rgba(120,50,0,.6)'; c.lineWidth = 0.5; for (const x of [12.4, 15]) { c.beginPath(); c.moveTo(x, -63); c.lineTo(x + 0.6, -61); c.stroke(); }
      // cylindr
      c.beginPath(); c.ellipse(1.8, -73, 11.4, 2.6, -0.06, 0, TAU); fs(c, '#22222c', 1.5);
      c.beginPath(); c.moveTo(-5.6, -73.6); c.lineTo(-6.2, -88.4); c.quadraticCurveTo(1.8, -90.4, 9.8, -88.6); c.lineTo(9.4, -73.8); c.quadraticCurveTo(1.8, -72, -5.6, -73.6); c.closePath(); fs(c, lg(c, -6, 0, 10, 0, ['#4a4a58', '#22222c', '#0e0e14']), 1.6);
      c.beginPath(); c.moveTo(-5.8, -77.4); c.quadraticCurveTo(1.8, -76, 9.6, -77.6); c.lineTo(9.6, -75); c.quadraticCurveTo(1.8, -73.4, -5.7, -74.8); c.closePath(); fs(c, '#c8202a', 0.9);
      holly(c, 6.6, -76.4, 1.1);
    } };
    /* Santův pytel s dárky na zádech */
    BK.xm_sack = { back(c, k, o) {
      const sw = o.moving ? Math.sin((o.w || 0) * 0.9) * 1.4 : Math.sin((o.t || 0) * 1.6) * 0.5;
      c.save(); c.translate(-12 - sw * 0.4, -38); c.rotate(-0.22 + sw * 0.02);
      // dárky vykukující z pytle
      c.beginPath(); c.rect(-9, -24, 9, 8); fs(c, '#2a9a4a', 1.1); c.beginPath(); c.rect(-5.4, -24, 1.8, 8); c.fillStyle = '#ffd24a'; c.fill();
      c.beginPath(); c.rect(-1, -27, 8, 9); fs(c, '#d6243a', 1.1); c.beginPath(); c.rect(2.2, -27, 1.6, 9); c.rect(-1, -23.4, 8, 1.6); c.fillStyle = '#ffd24a'; c.fill();
      c.beginPath(); c.ellipse(1.4, -28, 2.2, 1.3, -0.5, 0, TAU); c.ellipse(4.4, -28, 2.2, 1.3, 0.5, 0, TAU); fs(c, '#ffd24a', 0.7);
      c.beginPath(); c.moveTo(-11, -21); c.quadraticCurveTo(-13, -30, -8, -31); st(c, OUT, 3.6); st(c, '#ffffff', 2); c.save(); c.setLineDash([1.6, 1.6]); st(c, '#d6243a', 2); c.restore();
      // pytel
      c.beginPath(); c.moveTo(-10, -18); c.quadraticCurveTo(-17, -6, -13, 6); c.quadraticCurveTo(-4, 14, 8, 8); c.quadraticCurveTo(13, -4, 7, -18); c.quadraticCurveTo(-2, -15, -10, -18); c.closePath();
      fs(c, lg(c, -14, -18, 10, 10, ['#d8b07a', '#a87a48', '#6a4a26']), 1.8);
      c.strokeStyle = 'rgba(80,50,20,.45)'; c.lineWidth = 0.7; for (const [a, b] of [[-8, -12], [-3, -10], [3, -11]]) { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(a - 1, b + 10, a + 1, b + 18); c.stroke(); }
      c.fillStyle = 'rgba(80,50,20,.35)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(-6 + i * 3, -2 + (i % 2) * 3, 1.6, 1.6); c.fill(); }
      c.beginPath(); c.moveTo(-10.6, -17.4); c.quadraticCurveTo(-2, -13.4, 7.6, -17.4); ost(c, '#8a2a1a', 1.4);
      c.restore();
      c.beginPath(); c.moveTo(-18, -52); c.quadraticCurveTo(-8, -58, 0, -52); ost(c, '#8a2a1a', 1.4);
    } };
    /* vlající pruhovaná šála */
    BK.xm_scarf = { back(c, k, o) {
      const fl = o.moving ? Math.sin((o.w || 0) * 0.9) * 3 : Math.sin((o.t || 0) * 2) * 1.4;
      c.beginPath(); c.moveTo(-3, -55.6); c.quadraticCurveTo(-14 - fl, -56 + fl * 0.4, -24 - fl * 1.4, -50 + fl); c.lineTo(-23.4 - fl * 1.4, -45.6 + fl); c.quadraticCurveTo(-13 - fl, -51 + fl * 0.4, -2.4, -51.6); c.closePath();
      fs(c, '#ffffff', 1.4);
      c.save(); c.clip(); c.fillStyle = '#d6243a'; for (let x = -26; x < 0; x += 5) { c.beginPath(); c.rect(x - fl, -60, 2.6, 18); c.fill(); } c.restore();
      c.beginPath(); c.moveTo(-24 - fl * 1.4, -50 + fl); c.lineTo(-27 - fl * 1.5, -49 + fl); c.moveTo(-23.8 - fl * 1.4, -47.6 + fl); c.lineTo(-27 - fl * 1.5, -46.6 + fl); st(c, '#d6243a', 0.9);
    }, chest(c) { c.beginPath(); c.ellipse(1.4, -53.6, 8.6, 2.8, 0.05, 0, TAU); fs(c, '#ffffff', 1.3); c.save(); c.clip(); c.fillStyle = '#d6243a'; for (let x = -8; x < 12; x += 4.4) c.fillRect(x, -57, 2.2, 7); c.restore(); } };
    /* Santův kabát: bílý kožešinový pruh, široký opasek se zlatou přezkou */
    CH.xm_fur = { chest(c) {
      c.beginPath(); c.moveTo(-1.4, -54.6); c.lineTo(3.8, -54.6); c.lineTo(4.4, -32.6); c.lineTo(-1.6, -32.6); c.closePath(); fs(c, lg(c, -2, 0, 4, 0, ['#ffffff', '#e2ddd4']), 1.2);
      c.fillStyle = 'rgba(160,150,140,.5)'; for (let y = -52; y < -34; y += 3) { c.beginPath(); c.arc(0.4 + (y % 2), y, 0.5, 0, TAU); c.arc(2.6, y + 1.5, 0.5, 0, TAU); c.fill(); }
      c.beginPath(); c.rect(-11.4, -38.6, 23, 5.6); fs(c, lg(c, 0, -38.6, 0, -33, ['#3a3a44', '#14141a']), 1.4);
      c.beginPath(); c.rect(-0.6, -39.6, 7.4, 7.6); fs(c, lg(c, 0, -39.6, 0, -32, ['#fff2a8', '#f2c230', '#a8761a']), 1.2); c.beginPath(); c.rect(1.4, -37.6, 3.4, 3.6); c.fillStyle = '#14141a'; c.fill();
      c.beginPath(); c.ellipse(1.2, -55, 9.6, 3.2, 0, 0, TAU); fs(c, lg(c, 0, -58, 0, -52, ['#ffffff', '#dcd6cc']), 1.3);
    } };
    /* skřítek: zubatý límec se zvonečky */
    CH.xm_elfcol = { chest(c) {
      const n = 7; c.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = PI * 1.02 + i / (n * 2) * PI * 0.96, r = i % 2 ? 7.2 : 12.6; c.lineTo(1 + Math.cos(a) * r * 0.95, -51.6 - Math.sin(a) * r * 0.42 + (i % 2 ? -1.6 : 3.4)); } c.closePath();
      fs(c, lg(c, 0, -58, 0, -46, ['#ff5a5a', '#c8202a']), 1.3);
      for (let i = 0; i <= n * 2; i += 2) { const a = PI * 1.02 + i / (n * 2) * PI * 0.96; if (i === 0 || i === n * 2) continue; bell(c, 1 + Math.cos(a) * 12, -51.6 - Math.sin(a) * 5.3 + 4.2, 0.62); }
      c.beginPath(); c.rect(-11, -37.4, 22.6, 4.6); fs(c, '#1a1a24', 1.2); c.beginPath(); c.rect(-0.4, -38, 5.4, 5.8); fs(c, '#ffd24a', 1);
    } };
    /* louskáček: zlaté šňůrování přes hruď */
    CH.xm_hussar = { chest(c) {
      for (const y of [-50.4, -46.6, -42.8]) { c.beginPath(); c.moveTo(-6.4, y); c.quadraticCurveTo(1.4, y - 1.4, 9, y); ost(c, '#ffd24a', 1.1); for (const x of [-6.4, 9]) { c.beginPath(); c.arc(x, y, 1.1, 0, TAU); fs(c, '#ffd24a', 0.6); } }
      c.beginPath(); c.moveTo(-9.4, -54); c.lineTo(10.4, -34); ost(c, '#ffffff', 2);
      c.beginPath(); c.rect(-11, -37.4, 22.6, 4.6); fs(c, '#ffffff', 1.2); c.beginPath(); c.rect(-0.6, -38, 5.4, 5.8); fs(c, '#ffd24a', 1);
    } };
    SHO.xm_epaulet = { top(c) {
      c.beginPath(); c.ellipse(0, 0, 7.6, 4.4, -0.15, PI, TAU); c.closePath(); fs(c, lg(c, 0, -5, 0, 1, ['#fff2a8', '#f2c230', '#a8761a']), 1.3);
      c.strokeStyle = '#d8a020'; c.lineWidth = 1; for (let x = -6.4; x <= 6.6; x += 1.6) { c.beginPath(); c.moveTo(x, 0.2); c.lineTo(x - 0.4, 4.8); c.stroke(); }
      c.beginPath(); c.moveTo(-7, 0.4); c.lineTo(7.2, 0.4); st(c, OUT, 0.8);
    } };
    /* perníček: polevové cikcaky a gumové knoflíky, motýlek */
    CH.xm_icing = { chest(c) {
      c.beginPath(); for (let i = 0; i <= 10; i++) c.lineTo(-9 + i * 2, -52.8 + (i % 2) * 1.6); st(c, '#ffffff', 1.1);
      c.beginPath(); for (let i = 0; i <= 12; i++) c.lineTo(-11.4 + i * 2, -23.6 + (i % 2) * 1.6); st(c, '#ffffff', 1.1);
      [['#ff4a6a', -49.6], ['#3ac85a', -45], ['#ffd24a', -40.6]].forEach(([col, y]) => { c.beginPath(); c.moveTo(0.4, y + 1.4); c.quadraticCurveTo(2.6, y - 2.6, 4.8, y + 1.4); c.closePath(); fs(c, col, 0.8); c.beginPath(); c.arc(2, y - 0.2, 0.45, 0, TAU); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); });
      c.beginPath(); c.moveTo(2.6, -54.4); c.lineTo(-1.6, -56.6); c.lineTo(-1.6, -52.2); c.closePath(); c.moveTo(2.6, -54.4); c.lineTo(6.8, -56.6); c.lineTo(6.8, -52.2); c.closePath(); fs(c, '#d6243a', 0.9);
      c.beginPath(); c.arc(2.6, -54.4, 1.1, 0, TAU); fs(c, '#ff6a7a', 0.6);
    } };
    /* sněhulák: tělo ze dvou sněhových koulí přes nohy i trup, uhlíkové knoflíky a šála */
    CH.xm_snowbody = { chest(c) {
      c.beginPath(); c.ellipse(0.6, -14, 17.4, 15.4, 0, 0, TAU); fs(c, rg(c, 0.6, -14, 1, 18, [[0, '#ffffff'], [0.65, '#eaf2fa'], [1, '#a8c2da']], -5, -20), 2);
      c.beginPath(); c.ellipse(0.8, -41.6, 12.6, 12, 0, 0, TAU); fs(c, rg(c, 0.8, -41.6, 1, 13, [[0, '#ffffff'], [0.65, '#eef5fb'], [1, '#b0c8dc']], -3, -46), 1.9);
      c.fillStyle = 'rgba(150,190,220,.3)'; c.beginPath(); c.ellipse(-5, -6, 8, 3, 0.2, 0, TAU); c.fill();
      c.fillStyle = '#1a1a22'; for (const [x, y] of [[7.4, -47], [8.6, -41.6], [8.2, -36.2], [9.6, -20], [9.8, -12]]) { c.beginPath(); c.arc(x, y, 1.15, 0, TAU); c.fill(); }
      c.beginPath(); c.ellipse(1.4, -53.4, 8.8, 3, 0.05, 0, TAU); fs(c, '#2a6ad8', 1.3); c.save(); c.clip(); c.fillStyle = '#ffffff'; for (let x = -8; x < 12; x += 4.4) c.fillRect(x, -57, 1.6, 7); c.restore();
      c.beginPath(); c.moveTo(-4, -52); c.quadraticCurveTo(-7, -44, -5.6, -36); c.lineTo(-2.4, -36.6); c.quadraticCurveTo(-3.6, -44, -1.4, -51.4); c.closePath(); fs(c, '#2a6ad8', 1.1);
    } };
    /* vzory štítů: pepermintový bonbon, dárková stuha */
    PAT.xm_pepper = (c, f2, S) => { c.fillStyle = f2; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.beginPath(); c.moveTo(S.cx, S.cy); c.quadraticCurveTo(S.cx + Math.cos(a + 0.5) * 9, S.cy + Math.sin(a + 0.5) * 9, S.cx + Math.cos(a) * 18, S.cy + Math.sin(a) * 18); c.lineTo(S.cx + Math.cos(a + 0.38) * 18, S.cy + Math.sin(a + 0.38) * 18); c.quadraticCurveTo(S.cx + Math.cos(a + 0.8) * 9, S.cy + Math.sin(a + 0.8) * 9, S.cx, S.cy); c.fill(); } };
    PAT.xm_ribbon = (c, f2, S) => { c.fillStyle = f2; c.fillRect(S.cx - 2.2, -72, 4.4, 64); c.fillRect(-8, S.cy - 2.2, 40, 4.4); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(S.cx - 2.2, -72, 1.2, 64); };
    AF.helmet('xm_h_santa', { shell: 'xm_santa' });
    AF.helmet('xm_h_elf', { shell: 'xm_elf' });
    AF.helmet('xm_h_shako', { shell: 'xm_shako' });
    AF.helmet('xm_h_ginger', { shell: 'xm_ginger' });
    AF.helmet('xm_h_bobble', { shell: 'xm_bobble' });
    AF.helmet('xm_h_snowman', { shell: 'xm_snowman' });
    AF.shield('xm_s_pepper', { shape: 'round', pattern: 'xm_pepper', colors: { field: '#ffffff', field2: '#d6243a', rim: '#d6243a', metal: '#d6243a' } });
    AF.shield('xm_s_gift', { shape: 'heater', pattern: 'xm_ribbon', emblem: 'star', colors: { field: '#c8202a', field2: '#ffd24a', emblem: '#ffd24a', rim: '#ffd24a' } });
  }

  /* ---------- sob pod jezdcem: parohy, postroj se zvonečky (kreslí se přes koně) ---------- */
  const prevFeat = A.drawFeatures;
  A.drawFeatures = (ctx, Lk, pal, stt, layer, moving, w) => {
    const r = prevFeat ? prevFeat(ctx, Lk, pal, stt, layer, moving, w) : undefined;
    const MT = pal && pal.mount;
    if (layer === 'back' && MT && MT.reindeer) {
      const t = (stt && stt.t) || 0, nod = moving ? Math.sin((w || 0) * 2) * 1.5 : Math.sin(t * 1.5) * 0.8;
      ctx.save(); ctx.translate(6, 27 + nod);
      // parohy
      const ant = (x0, y0, s, back) => {
        ctx.save(); ctx.translate(x0, y0); ctx.scale(s, s);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-4, -10, -2, -20); ctx.moveTo(-1.6, -8); ctx.quadraticCurveTo(-8, -10, -10, -16); ctx.moveTo(-2.6, -15); ctx.quadraticCurveTo(3, -17, 5, -23); ctx.moveTo(-2, -20); ctx.lineTo(-6, -27); ctx.moveTo(-2, -20); ctx.lineTo(1, -28);
        st(ctx, OUT, 4.6); st(ctx, back ? '#9a6a3a' : '#d8b07a', 2.6);
        ctx.restore();
      };
      ant(38, -91, 1.05, true); ant(42, -90, 1.15, false);
      // postroj se zvonečky na krku
      ctx.beginPath(); ctx.moveTo(22, -60); ctx.quadraticCurveTo(30, -55, 37, -66); ost(ctx, MT.barding || '#c8202a', 2.6);
      for (const [x, y] of [[25, -58.6], [30, -58.2], [34.4, -61.6]]) bell(ctx, x, y + 2.6, 0.9);
      ctx.restore();
    }
    return r;
  };

  /* ---------- zbraně ---------- */
  const M = A.MELEE_REF, PO = A.POLE_REF;
  if (M) {
    // cukrová hůl: pruhovaná hůl s hákem a cesmínou u rukojeti
    M.xm_cane = (ctx, c) => {
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-2, -12, 4, 13, 1.4) : ctx.rect(-2, -12, 4, 13); fs(ctx, '#2a8a3a', 1.2);
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 0.7; for (let y = -11; y < 0; y += 2.2) { ctx.beginPath(); ctx.moveTo(-1.9, y); ctx.lineTo(1.9, y + 1); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, 42); ctx.arc(-6.4, 42, 6.4, 0, PI, false); st(ctx, OUT, 7.4); st(ctx, '#fbf6f0', 5);
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, 42); ctx.arc(-6.4, 42, 6.4, 0, PI, false); ctx.setLineDash([2.6, 3]); st(ctx, '#d6243a', 5); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-1.4, 4); ctx.lineTo(-1.4, 41); st(ctx, 'rgba(255,255,255,.55)', 0.9);
      holly(ctx, 0, 2.6, 1.15);
    };
    if (A.meleeModels && A.meleeModels.indexOf('xm_cane') < 0) A.meleeModels.push('xm_cane');
  }
  if (window.Forge) {
    const FG = Forge, FPA = FG.parts;
    try { FG.melee('xm_kat', { blade: 'katana', guard: 'tsuba', pommel: 'ring', deco: 'frost', wrap: 'ito' }); } catch (e) { /* nic */ }
    FPA.poleHeads.xm_star = (ctx, c) => {
      ctx.save(); ctx.beginPath(); ctx.rect(-22, -2.2, 64, 4.4); ctx.clip(); ctx.fillStyle = '#d6243a'; for (let x = -24; x < 44; x += 6) { ctx.beginPath(); ctx.moveTo(x, -3); ctx.lineTo(x + 2.6, -3); ctx.lineTo(x + 0.6, 3); ctx.lineTo(x - 2, 3); ctx.closePath(); ctx.fill(); } ctx.restore();
      ctx.beginPath(); ctx.moveTo(62, -1.6); ctx.lineTo(82, 0); ctx.lineTo(62, 1.6); ctx.closePath(); fs(ctx, lg(ctx, 62, 0, 82, 0, ['#ffffff', c.blade || '#e8f6ff', c.dark || '#6a9ac8']), 1.1);
      ctx.save(); ctx.translate(56, 0); ctx.rotate(Math.PI / 2); star(ctx, 0, 0, 9.6, 4.2, 5); fs(ctx, lg(ctx, -8, -8, 8, 8, ['#fff6c8', '#ffd24a', '#c98a1a']), 1.3); star(ctx, 0, 0, 4.2, 1.8, 5); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.ellipse(41, -4.2, 3.4, 2, -0.6, 0, TAU); ctx.ellipse(41, 4.2, 3.4, 2, 0.6, 0, TAU); fs(ctx, '#2a8a3a', 1); ctx.beginPath(); ctx.arc(42, 0, 2, 0, TAU); fs(ctx, '#d6243a', 0.9);
    };
    try { FG.pole('xm_spear', { head: 'xm_star', collar: 'none' }); } catch (e) { /* nic */ }
    FPA.bowStyles.xm_candy = { size: [40, 38], fn(ctx, at, c, T, B) {
      for (let k = 0.04; k < 0.97; k += 0.052) { if (Math.abs(k - 0.5) < 0.07) continue; const p = at(k); ctx.beginPath(); ctx.moveTo(p[0] - 2.3, p[1] + 1.5); ctx.lineTo(p[0] + 2.3, p[1] - 1.5); ctx.lineWidth = 1.7; ctx.strokeStyle = '#d6243a'; ctx.lineCap = 'butt'; ctx.stroke(); }
      for (const [p, d] of [[T, -1], [B, 1]]) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.arc(p[0] + 3.4, p[1], 3.4, PI, d < 0 ? PI * 2 : 0, d > 0); st(ctx, OUT, 4.6); st(ctx, '#fbf6f0', 2.6); ctx.beginPath(); ctx.arc(p[0] + 3.4, p[1], 3.4, PI * 1.25, PI * 1.6); st(ctx, '#d6243a', 2.4); }
      const g = at(0.5); ctx.beginPath(); ctx.ellipse(g[0] - 2.6, g[1] - 3, 3.2, 1.8, -0.6, 0, TAU); ctx.ellipse(g[0] - 2.6, g[1] + 3, 3.2, 1.8, 0.6, 0, TAU); fs(ctx, '#2a9a4a', 0.9);
      ctx.beginPath(); ctx.arc(g[0] - 1.4, g[1], 1.7, 0, TAU); fs(ctx, '#d6243a', 0.8);
    } };
    try { FG.bow('xm_bow', { style: 'xm_candy' }); } catch (e) { /* nic */ }
    FPA.staffHeads.xm_flake = (ctx, y, k) => {
      const r = 11 + k.raise * 2, t = k.t || 0;
      ctx.save(); ctx.globalAlpha = 0.55 + k.raise * 0.3; ctx.fillStyle = rg(ctx, 0, y - 2, 1, r * 1.6, [[0, 'rgba(200,240,255,.9)'], [1, 'rgba(160,220,255,0)']]); ctx.fillRect(-r * 1.6, y - 2 - r * 1.6, r * 3.2, r * 3.2); ctx.restore();
      ctx.save(); ctx.translate(0, y - 2); ctx.rotate(t * 0.6);
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, ca = Math.cos(a), sa = Math.sin(a); ctx.moveTo(0, 0); ctx.lineTo(ca * r, sa * r); for (const q of [0.45, 0.72]) { const bx = ca * r * q, by = sa * r * q, l = r * 0.28; ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + 0.8) * l, by + Math.sin(a + 0.8) * l); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - 0.8) * l, by + Math.sin(a - 0.8) * l); } }
      st(ctx, '#1a2a4a', 3.2); st(ctx, '#e8f8ff', 1.6);
      star(ctx, 0, 0, 3.4, 1.6, 6); fs(ctx, '#bfeaff', 0.8);
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-3, y + 8); ctx.lineTo(3, y + 8); st(ctx, OUT, 3.4); st(ctx, '#bfe6ff', 1.6);
    };
    try { FG.staff('xm_staff', { head: 'xm_flake' }); } catch (e) { /* nic */ }
    if (G.SAM_OK) { G.SAM_OK.melee.push('xm_kat'); G.SAM_OK.pole.push('xm_spear'); }
  }
  const WSK = (id, name, cat, model, desc, en) => ({ id, name, rarity: 'Epický', cat, model: Object.assign({ cat }, model), desc, en, codeOnly: true, season: 'xmas', bonus: { dmg: 0.07 }, cost: {} });
  if (G.weaponSkins) G.weaponSkins.push(
    WSK('xm_w_cane', 'Cukrová hůl', 'melee', { id: 'xm_cane', blade: '#ffffff', dark: '#d6243a', edge: '#ffffff', guard: '#2a8a3a', grip: '#2a8a3a', gem: '#d6243a' }, 'Obří pruhovaná cukrová hůl s cesmínou. Vánoční událost.', { name: 'Candy Cane', desc: 'A giant striped candy cane with holly. Christmas event.' }),
    WSK('xm_w_kat', 'Mrazivá katana', 'melee', { id: 'xm_kat', blade: '#eaf8ff', dark: '#6a9ac8', edge: '#ffffff', glow: '#bfeaff', guard: '#ffd24a', grip: '#c8202a', pommel: '#ffd24a', gem: '#d6243a' }, 'Čepel z vánočního ledu, rudá omotávka a zlatá tsuba. Vánoční událost.', { name: 'Frost Katana', desc: 'A blade of Christmas ice, a red wrap and a golden tsuba. Christmas event.' }),
    WSK('xm_w_spear', 'Hvězdné kopí', 'pole', { id: 'xm_spear', blade: '#eaf8ff', dark: '#6a9ac8', edge: '#ffffff', wood: '#fbf6f0', guard: '#ffd24a' }, 'Pruhovaná násada jako lízátko a zlatá vánoční hvězda na hrotu. Vánoční událost.', { name: 'Star Spear', desc: 'A candy-striped shaft with a golden Christmas star on the tip. Christmas event.' }),
    WSK('xm_w_bow', 'Lízátkový luk', 'bow', { id: 'xm_bow', wood: '#fbf6f0', string: '#ffffff', arrow: '#fbf6f0', tip: '#d6243a' }, 'Luk z cukrové hole se zatočenými konci a mašlí. Vánoční událost.', { name: 'Candy Cane Bow', desc: 'A bow made of candy cane with curled tips and a bow ribbon. Christmas event.' }),
    WSK('xm_w_staff', 'Hůl sněhové vločky', 'staff', { id: 'xm_staff', glow: '#bfeaff' }, 'Ledová hůl s točící se sněhovou vločkou. Vánoční událost.', { name: 'Snowflake Staff', desc: 'An ice staff with a spinning snowflake. Christmas event.' })
  );

  /* ---------- zbroje (každý druh vojáka jiný tvar) ---------- */
  if (G.unitSkins) {
    const af = o => ({ af: o });
    G.unitSkins.push(
      SKIN('xm_santa', unitsOf('velitel'), 'Santa Klaus', 'Legendární',
        { tunic: '#c8202a', tunicDark: '#8a1018', trim: '#ffffff', metal: '#d22a30', metalDark: '#8a1018', cape: '#c8202a', plume: '#ffffff', hair: '#f2f0ea', leather: '#3a2a20', leatherDark: '#1a1418', belt: '#14141a', hood: '#c8202a', hat: '#c8202a', robe: '#c8202a', fur: '#ffffff', lace: '#ffffff', sashi: '#c8202a', mon: '#ffd24a', mask: '#ffffff' },
        af({ back: 'xm_sack', chest: 'xm_fur', aura: 'snow', glow: '#ffe28a' }), { helmet: 'xm_h_santa', shield: 'xm_s_gift' },
        'Červený kabát s kožešinou, bílé vousy, čepice s bambulí a pytel plný dárků na zádech. Štít je zabalený jako dárek.',
        { name: 'Santa Claus', desc: 'A red fur-trimmed coat, a white beard, a bobble hat and a sack full of presents on his back. The shield is wrapped like a gift.' }, { glow: '#ffe28a' }),
      SKIN('xm_skritek', unitsOf('strelec'), 'Vánoční skřítek', 'Epický',
        { tunic: '#2a9a3a', tunicDark: '#16602a', trim: '#d6243a', leather: '#8a3a1a', leatherDark: '#5a2410', hair: '#c86a2a', cape: '#2a9a3a', hood: '#2a9a3a', hat: '#2a9a3a', plume: '#d6243a', metal: '#dfe6ee', metalDark: '#8a96a6', lace: '#d6243a', sashi: '#2a9a3a', mon: '#ffd24a' },
        af({ chest: 'xm_elfcol', back: 'quiver' }), { helmet: 'xm_h_elf' },
        'Špičatá čepice se zvonečkem, špičaté uši a zubatý límec plný rolniček. Santův nejlepší střelec.',
        { name: 'Christmas Elf', desc: 'A pointy hat with a bell, pointy ears and a jagged collar full of jingle bells. Santa’s best shot.' }),
      SKIN('xm_louskacek', unitsOf('pech'), 'Louskáček', 'Epický',
        { tunic: '#c8202a', tunicDark: '#1a2a5a', trim: '#ffd24a', metal: '#d22a30', metalDark: '#7a0e16', legs: '#1a2a5a', boots: '#14141a', leatherDark: '#14141a', hair: '#ffffff', skin: '#f6d8c0', lace: '#c8202a', sashi: '#c8202a', mon: '#ffd24a' },
        af({ chest: 'xm_hussar', shoulder: 'xm_epaulet' }), { helmet: 'xm_h_shako', shield: 'xm_s_pepper' },
        'Dřevěný voják: vysoká čáka s chocholem, obrovský knír, zlaté šňůrování a štít jako pepermintový bonbon.',
        { name: 'Nutcracker', desc: 'A wooden soldier: a tall plumed shako, a huge moustache, gold frogging and a peppermint candy shield.' }),
      SKIN('xm_pernik', unitsOf('kopi'), 'Perníkový panáček', 'Epický',
        { tunic: '#b8702f', tunicDark: '#8a4f1e', trim: '#ffffff', skin: '#c47c3a', hair: '#c47c3a', metal: '#c88440', metalDark: '#8a5a24', leather: '#a8642a', leatherDark: '#6a3a14', legs: '#b8702f', boots: '#8a4f1e', lace: '#ffffff', sashi: '#b8702f', mon: '#ffffff' },
        af({ chest: 'xm_icing' }), { helmet: 'xm_h_ginger' },
        'Celý z perníku: polevové cikcaky, gumové knoflíky, motýlek a bonbonový čepeček.',
        { name: 'Gingerbread Man', desc: 'Made entirely of gingerbread: icing zigzags, gumdrop buttons, a bow tie and a candy cap.' }),
      SKIN('xm_sob', unitsOf('jizda'), 'Sobí jezdec', 'Epický',
        { tunic: '#c8202a', tunicDark: '#8a1018', trim: '#ffffff', metal: '#dfe6ee', metalDark: '#8a96a6', cape: '#c8202a', plume: '#ffffff', leather: '#6a3a1a', leatherDark: '#3a2010', lace: '#ffffff', sashi: '#c8202a', mon: '#ffd24a' },
        af({ back: 'xm_scarf' }), { helmet: 'xm_h_bobble' },
        'Jede na sobovi s parohy a rolničkami. Pletená čepice s bambulí a vlající pruhovaná šála.',
        { name: 'Reindeer Rider', desc: 'Rides an antlered reindeer with jingle bells. A knitted bobble hat and a fluttering striped scarf.' },
        { mount: { coat: '#9a6a42', coatDark: '#6a4428', mane: '#f2e8d8', barding: '#c8202a', bardingTrim: '#ffd24a', reindeer: true } }),
      SKIN('xm_snehulak', unitsOf('mag'), 'Sněhulák kouzelník', 'Epický',
        { tunic: '#5a3a1e', tunicDark: '#3a2410', trim: '#2a6ad8', leather: '#5a3a1e', leatherDark: '#3a2410', robe: '#5a3a1e', hood: '#22222c', hat: '#22222c', skin: '#f2f8ff', lace: '#2a6ad8', sashi: '#2a6ad8', mon: '#ffffff' },
        af({ chest: 'xm_snowbody', aura: 'snow' }), { helmet: 'xm_h_snowman' },
        'Kouzelný sněhulák: tělo ze sněhových koulí, uhlíkové oči, mrkev místo nosu, cylindr a ruce z větviček.',
        { name: 'Snowman Wizard', desc: 'A magic snowman: a body of snowballs, coal eyes, a carrot nose, a top hat and twig arms.' })
    );
  }
  const SET_W = role => unitsOf(role).map(u => xWeapon(u)).filter(Boolean);

  /* ---------- hrad „Vánoční palác“ (zabalený jako dárek) a dekorace ---------- */
  const XCASTLE = { id: 'vanocni', name: 'Vánoční palác', rarity: 'Legendární', price: 650, excl: true, xmas: true,
    desc: 'Hrad zabalený jako obří dárek: rudé stuhy s mašlí, girlanda s baňkami, zlaté hvězdy na věžích a ozdobené stromky.',
    en: { name: 'Christmas Palace', desc: 'A castle wrapped like a giant present: red ribbons with a bow, a garland with baubles, golden stars on the towers and decorated trees.' },
    palette: { stone: '#f2eee6', stoneDark: '#c9c0b4', stoneLight: '#ffffff', roof: '#1f7a3e', roofDark: '#124a26', window: '#ffcf6a', trim: '#ffd24a', glowWindows: true } };
  if (G.castleSkins && !G.castleSkins.find(s => s.id === 'vanocni')) G.castleSkins.push(XCASTLE);
  const XDECOR = { id: 'xm_vyzdoba', name: 'Vánoční výzdoba', desc: 'Věnec na bráně, girlandy s baňkami, cukrové hole a ozdobené stromky u hradeb. Vánoční událost.', price: 0, xmas: true };
  if (G.castleCustom && !G.castleCustom.decorations.find(d => d.id === XDECOR.id)) G.castleCustom.decorations.push(XDECOR);
  if (window.I18N_EN && I18N_EN.decor) I18N_EN.decor.xm_vyzdoba = { name: 'Christmas Decorations', desc: 'A wreath on the gate, garlands with baubles, candy canes and decorated trees by the walls. Christmas event.' };

  /* ======================= KRESBY: HRAD, STROMEK, DÁRKY, SANĚ ======================= */
  function xtree(c, x, y, h, lit, seed) {
    // vánoční stromek: kmen, tři patra větví se sněhem, baňky, girlanda, hvězda
    const w = h * 0.42;
    c.beginPath(); c.rect(x - h * 0.05, y - h * 0.14, h * 0.1, h * 0.15); fs(c, '#6a4428', 1.2);
    for (let k = 0; k < 3; k++) {
      const y0 = y - h * 0.12 - k * h * 0.24, ww = w * (1 - k * 0.24), hh = h * 0.42;
      c.beginPath(); c.moveTo(x - ww, y0); c.quadraticCurveTo(x - ww * 0.4, y0 - hh * 0.35, x, y0 - hh); c.quadraticCurveTo(x + ww * 0.4, y0 - hh * 0.35, x + ww, y0);
      for (let i = 4; i >= 0; i--) c.quadraticCurveTo(x - ww + (i + 0.5) * ww * 0.4, y0 + h * 0.03, x - ww + i * ww * 0.4, y0);
      c.closePath(); fs(c, lg(c, x - ww, y0 - hh, x + ww, y0, ['#3a9a52', '#1f6a36', '#0e3a1e']), 1.4);
      c.beginPath(); c.moveTo(x - ww * 0.9, y0 - 1); for (let i = 0; i <= 6; i++) c.quadraticCurveTo(x - ww * 0.9 + (i + 0.5) * ww * 0.3, y0 - h * 0.035 - (i % 2) * h * 0.012, x - ww * 0.9 + (i + 1) * ww * 0.3, y0 - 1); st(c, 'rgba(255,255,255,.9)', h * 0.022);
    }
    // girlanda
    c.beginPath(); c.moveTo(x - w * 0.6, y - h * 0.26); c.quadraticCurveTo(x, y - h * 0.18, x + w * 0.5, y - h * 0.44); c.moveTo(x - w * 0.42, y - h * 0.52); c.quadraticCurveTo(x, y - h * 0.44, x + w * 0.32, y - h * 0.68); st(c, '#ffd24a', h * 0.012 + 0.6);
    // baňky
    const cols = ['#e0243a', '#ffd24a', '#3a8aff', '#ff7ad0', '#ffffff'];
    const pts = [[-0.55, -0.2], [0.1, -0.24], [0.5, -0.2], [-0.3, -0.36], [0.32, -0.42], [-0.45, -0.5], [0.05, -0.56], [0.25, -0.66], [-0.15, -0.74]];
    pts.forEach(([fx, fy], i) => { const bx = x + fx * w, by = y + fy * h, r = h * 0.032 + 0.6, col = cols[(i + seed) % cols.length]; c.beginPath(); c.arc(bx, by, r, 0, TAU); fs(c, rg(c, bx, by, 0.2, r, [[0, '#ffffff'], [0.35, col], [1, col]], bx - r * 0.4, by - r * 0.4), 0.7); });
    if (lit != null) { pts.forEach(([fx, fy], i) => { if ((i + lit) % 2) return; const bx = x + fx * w, by = y + fy * h, r = h * 0.09; c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, bx, by, 0, r, [[0, 'rgba(255,230,160,.55)'], [1, 'rgba(255,200,120,0)']]); c.fillRect(bx - r, by - r, r * 2, r * 2); c.restore(); }); }
    // hvězda
    star(c, x, y - h * 0.86, h * 0.075, h * 0.032, 5); fs(c, lg(c, x, y - h * 0.94, x, y - h * 0.8, ['#fff6c8', '#ffd24a', '#c98a1a']), 1);
  }
  function gift(c, x, y, w, h, col, rib) {
    c.beginPath(); c.rect(x - w / 2, y - h, w, h); fs(c, lg(c, x - w / 2, y - h, x + w / 2, y, [col, col, shadeHex(col, -0.35)]), 1.1);
    c.beginPath(); c.rect(x - w * 0.09, y - h, w * 0.18, h); c.rect(x - w / 2, y - h * 0.62, w, h * 0.16); c.fillStyle = rib; c.fill();
    c.beginPath(); c.ellipse(x - w * 0.16, y - h - 1.4, w * 0.18, w * 0.1, -0.5, 0, TAU); c.ellipse(x + w * 0.16, y - h - 1.4, w * 0.18, w * 0.1, 0.5, 0, TAU); fs(c, rib, 0.8);
  }
  function shadeHex(h, k) { if (!/^#[0-9a-f]{6}$/i.test(h)) return h; const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * (1 + k)))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); }
  function snowman(c, x, y, s) {
    c.beginPath(); c.arc(x, y - 9 * s, 10 * s, 0, TAU); fs(c, rg(c, x, y - 9 * s, 1, 11 * s, [[0, '#ffffff'], [1, '#b8cee0']], x - 4 * s, y - 13 * s), 1.2);
    c.beginPath(); c.arc(x, y - 24 * s, 7 * s, 0, TAU); fs(c, rg(c, x, y - 24 * s, 1, 8 * s, [[0, '#ffffff'], [1, '#b8cee0']], x - 3 * s, y - 27 * s), 1.2);
    c.beginPath(); c.arc(x + 0.5 * s, y - 35 * s, 5.4 * s, 0, TAU); fs(c, rg(c, x, y - 35 * s, 1, 6 * s, [[0, '#ffffff'], [1, '#b8cee0']], x - 2 * s, y - 37 * s), 1.1);
    c.fillStyle = '#1a1a22'; for (const [dx, dy] of [[1.6, -36.4], [4, -36], [2.6, -24], [2.8, -20.6], [2.4, -27.4]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, 0.75 * s, 0, TAU); c.fill(); }
    c.beginPath(); c.moveTo(x + 4 * s, y - 34.6 * s); c.lineTo(x + 10 * s, y - 33.6 * s); c.lineTo(x + 4.2 * s, y - 32.8 * s); c.closePath(); fs(c, '#f07a1a', 0.6);
    c.beginPath(); c.ellipse(x + 0.5 * s, y - 39.6 * s, 6.4 * s, 1.4 * s, 0, 0, TAU); fs(c, '#22222c', 0.8); c.beginPath(); c.rect(x - 3.4 * s, y - 47 * s, 7.8 * s, 7.4 * s); fs(c, '#22222c', 0.8);
    c.beginPath(); c.ellipse(x, y - 29.6 * s, 6.6 * s, 1.8 * s, 0, 0, TAU); fs(c, '#d6243a', 0.7);
    c.beginPath(); c.moveTo(x - 6 * s, y - 24 * s); c.lineTo(x - 14 * s, y - 30 * s); c.moveTo(x - 11 * s, y - 27.6 * s); c.lineTo(x - 13 * s, y - 24 * s); c.moveTo(x + 6 * s, y - 24 * s); c.lineTo(x + 13 * s, y - 29 * s); st(c, '#5a3a1e', 1.3 * s);
  }
  function canes(c, x, y, h, flip) {
    c.save(); c.translate(x, y); c.scale(flip ? -1 : 1, 1);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h); c.arc(-h * 0.14, -h, h * 0.14, 0, PI, true); st(c, OUT, h * 0.13 + 2); st(c, '#fbf6f0', h * 0.13);
    c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h); c.arc(-h * 0.14, -h, h * 0.14, 0, PI, true); c.setLineDash([h * 0.07, h * 0.08]); st(c, '#d6243a', h * 0.13); c.restore();
    c.restore();
  }
  function wreath(c, x, y, r) {
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.42, r * 0.24, a + 0.9, 0, TAU); fs(c, i % 2 ? '#1f6a36' : '#2f8a4a', 0.6); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.3; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.13, 0, TAU); fs(c, '#e0243a', 0.5); }
    c.beginPath(); c.moveTo(x, y + r); c.lineTo(x - r * 0.6, y + r * 0.6); c.lineTo(x - r * 0.6, y + r * 1.4); c.closePath(); c.moveTo(x, y + r); c.lineTo(x + r * 0.6, y + r * 0.6); c.lineTo(x + r * 0.6, y + r * 1.4); c.closePath(); fs(c, '#d6243a', 0.8);
    c.beginPath(); c.moveTo(x - r * 0.1, y + r); c.lineTo(x - r * 0.5, y + r * 2); c.moveTo(x + r * 0.1, y + r); c.lineTo(x + r * 0.5, y + r * 2); st(c, '#d6243a', r * 0.16);
  }
  function garland(c, x0, x1, y, sag, step) {
    for (let x = x0; x < x1 - 1; x += step) {
      const xe = Math.min(x1, x + step);
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + xe) / 2, y + sag * 2, xe, y); st(c, OUT, 5); st(c, '#1f6a36', 3.6);
      c.save(); c.setLineDash([1.4, 2.2]); st(c, '#3a9a52', 2); c.restore();
      const bx = (x + xe) / 2, by = y + sag; c.beginPath(); c.arc(bx, by + 2.4, 2.2, 0, TAU); fs(c, ['#e0243a', '#ffd24a', '#3a8aff'][Math.round(x / step) % 3], 0.6);
    }
  }

  /* ---------- Vánoční palác: zpracování obrázku hradu ---------- */
  const PADC = 120;
  function outlineTop(cv, w, h) {
    const res = cv.width / w, d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, W = cv.width;
    const top = new Array(Math.ceil(w)).fill(null);
    for (let x = 0; x < w; x++) { const px = Math.min(W - 1, Math.round(x * res)); for (let y = 0; y < cv.height; y++) if (d[(y * W + px) * 4 + 3] > 140) { top[x] = y / res; break; } }
    return top;
  }
  const xcCache = new WeakMap();
  function xmasCastle(base) {
    if (!base || !base.canvas) return base;
    if (xcCache.has(base)) return xcCache.get(base);
    const w = base.w, h = base.h, res = base.canvas.width / w;
    const cv = document.createElement('canvas'); cv.width = base.canvas.width; cv.height = base.canvas.height;
    const c = cv.getContext('2d'); c.drawImage(base.canvas, 0, 0); c.scale(res, res);
    const top = outlineTop(base.canvas, w, h);
    try {
      // stuhy dárku přes celé zdi (jen na hradu: source-atop)
      c.save(); c.globalCompositeOperation = 'source-atop';
      const rx = w * 0.42, ry = h * 0.62;
      c.fillStyle = 'rgba(200,24,40,.9)'; c.fillRect(rx - 9, 0, 18, h); c.fillRect(0, ry - 8, w, 16);
      c.fillStyle = 'rgba(255,210,74,.95)'; c.fillRect(rx - 9, 0, 2.2, h); c.fillRect(rx + 6.8, 0, 2.2, h); c.fillRect(0, ry - 8, w, 2); c.fillRect(0, ry + 6, w, 2);
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(rx - 5, 0, 3, h);
      // drobné zlaté vločky po zdech
      c.strokeStyle = 'rgba(214,170,60,.5)'; c.lineWidth = 0.9;
      for (let i = 0; i < 26; i++) { const x = ((i * 97) % 100) / 100 * w, y = 40 + ((i * 61) % 100) / 100 * (h - 70); if (Math.abs(x - rx) < 16 || Math.abs(y - ry) < 14) continue; c.beginPath(); for (let k = 0; k < 3; k++) { const a = k * PI / 3; c.moveTo(x - Math.cos(a) * 3, y - Math.sin(a) * 3); c.lineTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); } c.stroke(); }
      c.restore();
      // sněhová čepice a girlanda s baňkami po obrysu
      c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      let on = false; c.beginPath(); for (let x = 0; x < top.length; x++) { const y = top[x]; if (y == null) { on = false; continue; } if (!on) { c.moveTo(x, y + 1.4); on = true; } else c.lineTo(x, y + 1.4); }
      c.lineWidth = 4.6; c.strokeStyle = '#ffffff'; c.stroke();
      c.restore();
      const flat = []; for (let x = 3; x < top.length - 3; x += 1) { const a = top[x]; if (a != null && top[x - 3] != null && top[x + 3] != null && Math.abs(a - top[x - 3]) < 1.5 && Math.abs(a - top[x + 3]) < 1.5) flat.push([x, a]); }
      let last = -99; const cols = ['#e0243a', '#ffd24a', '#2f8a4a', '#3a8aff'];
      flat.forEach(([x, y], i) => { if (x - last < 9) return; last = x; c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x, y + 6); st(c, '#1f6a36', 1); c.beginPath(); c.arc(x, y + 8, 2.3, 0, TAU); fs(c, rg(c, x, y + 8, 0.2, 2.3, [[0, '#ffffff'], [0.4, cols[i % 4]], [1, cols[i % 4]]], x - 0.8, y + 7.2), 0.6); });
      // mašle na stuze
      const bow = (x, y, s) => { c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x - 14 * s, y - 12 * s, x - 18 * s, y + 6 * s, x, y); c.moveTo(x, y); c.bezierCurveTo(x + 14 * s, y - 12 * s, x + 18 * s, y + 6 * s, x, y); fs(c, lg(c, x - 18 * s, y - 10 * s, x + 18 * s, y + 6 * s, ['#ff4a5a', '#c8182a', '#7a0e16']), 1.2); c.beginPath(); c.moveTo(x - 2, y + 1); c.lineTo(x - 7 * s, y + 14 * s); c.lineTo(x - 3 * s, y + 12 * s); c.moveTo(x + 2, y + 1); c.lineTo(x + 7 * s, y + 14 * s); c.lineTo(x + 3 * s, y + 12 * s); st(c, '#c8182a', 2.4 * s); c.beginPath(); c.arc(x, y, 3 * s, 0, TAU); fs(c, '#e0243a', 1); };
      bow(rx, ry, 1.1);
    } catch (e) { console.warn('Vánoční palác', e); }
    const ov = (fn, seed) => {
      const o = document.createElement('canvas'); o.width = Math.round((w + PADC * 2) * res); o.height = Math.round((h + PADC + 10) * res);
      const x = o.getContext('2d'); x.scale(res, res); x.translate(PADC, PADC);
      try { fn(x, seed); } catch (e) { console.warn('Vánoční palác – ozdoby', e); }
      return o;
    };
    const flags = base.flags || [];
    const out = Object.assign({}, base, { canvas: cv, shapeFx: 'snow',
      ovBack: ov(x => { xtree(x, -38, h + 4, 170, null, 0); xtree(x, w + 34, h + 4, 140, null, 2); }),
      ovFront: ov(x => {
        // zlaté hvězdy na špičkách stožárů
        flags.forEach(f => { star(x, f.x, f.y - 32, 7.4, 3, 5); fs(x, lg(x, f.x, f.y - 40, f.x, f.y - 24, ['#fff6c8', '#ffd24a', '#c98a1a']), 1.2); });
        // velká mašle na nejvyšší věži
        const tf = flags.reduce((a, f) => (!a || f.y < a.y ? f : a), null);
        if (tf) { const bx = tf.x, by = tf.y + 30; x.beginPath(); x.moveTo(bx, by); x.bezierCurveTo(bx - 16, by - 16, bx - 22, by + 6, bx, by); x.moveTo(bx, by); x.bezierCurveTo(bx + 16, by - 16, bx + 22, by + 6, bx, by); fs(x, lg(x, bx - 20, by - 12, bx + 20, by + 8, ['#ff4a5a', '#c8182a', '#7a0e16']), 1.3); x.beginPath(); x.arc(bx, by, 3.4, 0, TAU); fs(x, '#e0243a', 1); }
        // sníh, dárky, sněhulák a cukrové hole před hradbou
        for (let k = 0; k < 12; k++) { x.beginPath(); x.ellipse(-30 + k * (w + 60) / 11, h + 4, 30, 9, 0, PI, TAU); x.fillStyle = k % 2 ? '#f4f9ff' : '#e6f0fa'; x.fill(); }
        const gx = w * 0.62;
        gift(x, gx - 30, h + 2, 22, 18, '#c8202a', '#ffd24a'); gift(x, gx - 8, h + 2, 16, 24, '#2a8a4a', '#ffffff'); gift(x, gx + 10, h + 2, 18, 13, '#3a6ad8', '#ffd24a'); gift(x, gx - 20, h - 15, 13, 11, '#ffd24a', '#c8202a');
        snowman(x, w * 0.12, h + 4, 1.25);
        canes(x, w * 0.86 - 22, h + 2, 34, false); canes(x, w * 0.86 + 26, h + 2, 34, true);
      }) });
    xcCache.set(base, out);
    return out;
  }
  const CI0 = A.castleImage;
  A.castleImage = function (team, skinId, level, res, style) {
    const img = CI0.apply(this, arguments);
    if (img && img.canvas && style) img._st = img._st || style;
    return skinId === 'vanocni' ? xmasCastle(img) : img;
  };

  /* ---------- dekorace Vánoční výzdoba (zapéká se do obrázku hradu) ---------- */
  const DC0 = A.decorateCastle;
  if (DC0) A.decorateCastle = function (ctx, img, cfg, style) {
    const r = DC0.apply(this, arguments);
    if (cfg && cfg.decor && cfg.decor.xm_vyzdoba) {
      try {
        const J = style === 'japonsko', N = style === 'sever', B = 380;
        const wy = J ? 236 : N ? 262 : 268, ty = J ? 197 : (N ? 300 : 250), x1 = N ? 236 : 248;
        garland(ctx, 4, x1, ty + 4, 6, 41);
        wreath(ctx, 277, wy, 11);
        canes(ctx, 238, B, 42, false); canes(ctx, 318, B, 42, true);
        xtree(ctx, 196, B + 2, 74, 0, 1); xtree(ctx, 24, B + 2, 62, 0, 3);
        gift(ctx, 214, B, 13, 11, '#c8202a', '#ffd24a'); gift(ctx, 180, B, 11, 14, '#2a6ad8', '#ffffff');
      } catch (e) { console.warn('Vánoční výzdoba', e); }
    }
    return r;
  };

  /* ======================= ZIMA: BOJIŠTĚ A DOMOVSKÁ SCÉNA ======================= */
  const winterOn = () => active();
  /* přebarvení krajiny na zimní (jednou při vytvoření pozadí, tabulka barev = rychlé) */
  let LUT = null;
  function winterLut() {
    if (LUT) return LUT;
    LUT = new Uint32Array(32768);
    const le = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
    const pack = (r, g, b) => le ? ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0 : ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
    for (let i = 0; i < 32768; i++) {
      const r = ((i >> 10) & 31) * 8.2, g = ((i >> 5) & 31) * 8.2, b = (i & 31) * 8.2;
      const lum = 0.3 * r + 0.59 * g + 0.11 * b, green = g - Math.max(r, b);
      let R, Gc, Bc;
      if (green > 6 && lum > 112) { const k = Math.min(1, (lum - 112) / 70 + 0.55); const s = 214 + Math.min(40, (lum - 112) * 0.5); R = s * k + r * (1 - k) * 0.6; Gc = (s + 6) * k + g * (1 - k) * 0.7; Bc = (s + 16) * k + b * (1 - k) + 30 * (1 - k); }
      else if (green > 6) { const k = 0.45; R = r * (1 - k) + 40 * k; Gc = g * (1 - k) + 82 * k; Bc = b * (1 - k) + 86 * k; }
      else { const k = 0.18; R = r * (1 - k) + 210 * k; Gc = g * (1 - k) + 225 * k; Bc = b * (1 - k) + 245 * k; }
      LUT[i] = pack(Math.min(255, R | 0), Math.min(255, Gc | 0), Math.min(255, Bc | 0));
    }
    return LUT;
  }
  function winterize(ctx, W, H, layer, theme, seed) {
    const cv = ctx.canvas, cw = cv.width, ch = cv.height, k = cw / W;
    const y0 = layer === 'near' ? Math.floor(330 * k) : 0, hh = ch - y0;
    if (hh <= 0) return;
    const id = ctx.getImageData(0, y0, cw, hh), d32 = new Uint32Array(id.data.buffer), lut = winterLut(), d8 = id.data;
    const le = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
    if (theme !== 'sever') for (let i = 0, n = d32.length; i < n; i++) {
      const a = d8[i * 4 + 3]; if (a < 8) continue;
      const v = lut[((d8[i * 4] >> 3) << 10) | ((d8[i * 4 + 1] >> 3) << 5) | (d8[i * 4 + 2] >> 3)];
      d32[i] = a === 255 ? v : (le ? ((v & 0x00ffffff) | (a << 24)) >>> 0 : ((v & 0xffffff00) | a) >>> 0);
    }
    // sněhové čepice na horních hranách (stromy, kopce, ploty)
    if (layer !== 'far') {
      const cap = Math.max(2, Math.round(2.4 * k));
      for (let x = 0; x < cw; x++) {
        let prev = 0;
        for (let y = 0; y < hh; y++) {
          const a = d8[(y * cw + x) * 4 + 3];
          if (a > 160 && prev < 60) { for (let q = 0; q < cap && y + q < hh; q++) { const p = ((y + q) * cw + x) * 4; if (d8[p + 3] < 160) break; const s = q === cap - 1 ? 225 : 248; d8[p] = s - 4; d8[p + 1] = s; d8[p + 2] = 255; } }
          prev = a;
        }
      }
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(id, 0, y0); ctx.restore();
    if (layer === 'far') { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = lg(ctx, 0, 0, 0, 440, [[0, 'rgba(40,60,110,.18)'], [0.7, 'rgba(200,215,235,.10)'], [1, 'rgba(235,242,250,.22)']]); ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
    // jiskřivý sníh a závěje podél cesty
    const C = G.battleConfig, rnd = (A.rng || (s => Math.random))(seed * 7 + 3);
    ctx.save();
    for (let i = 0; i < W / 3; i++) { const x = rnd() * W, y = 444 + rnd() * (H - 444); if (y > C.laneTop - 22 && y < C.laneBottom + 14) continue; ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.85)' : 'rgba(190,215,240,.6)'; ctx.fillRect(x, y, 1.4, 1.4); }
    for (let x = -20; x < W + 20; x += 34 + rnd() * 40) { ctx.beginPath(); ctx.ellipse(x, C.laneTop - 13, 26 + rnd() * 26, 5 + rnd() * 3, 0, PI, TAU); ctx.fillStyle = 'rgba(246,250,255,.92)'; ctx.fill(); }
    for (let x = -20; x < W + 20; x += 30 + rnd() * 40) { ctx.beginPath(); ctx.ellipse(x, C.laneBottom + 14, 24 + rnd() * 24, 4 + rnd() * 3, 0, PI, TAU); ctx.fillStyle = 'rgba(240,247,255,.9)'; ctx.fill(); }
    // vyjeté stopy ve sněhu na cestě
    ctx.globalAlpha = 0.28; ctx.fillStyle = '#ffffff'; for (let i = 0; i < W / 40; i++) { const x = rnd() * W, y = C.laneTop - 4 + rnd() * (C.laneBottom - C.laneTop + 8); ctx.beginPath(); ctx.ellipse(x, y, 20 + rnd() * 30, 2 + rnd() * 2, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    // vánoční výzdoba bojiště (jen velké bojiště, ne domovská scéna)
    if (W >= 3000) {
      const pf = C.playerFront, ef = W - (C.worldW - C.enemyFront), y = C.laneTop - 12;
      xtree(ctx, pf + 150, y, 150, 0, 0); gift(ctx, pf + 126, y + 2, 16, 13, '#c8202a', '#ffd24a'); gift(ctx, pf + 176, y + 2, 13, 17, '#2a8a4a', '#ffffff');
      xtree(ctx, ef - 150, y, 120, 0, 2);
      for (let x = pf + 700; x < ef - 500; x += 900 + rnd() * 500) { if (rnd() < 0.5) snowman(ctx, x, y + 2, 1.2); else { xtree(ctx, x, y, 90 + rnd() * 40, 0, (x | 0) % 5); gift(ctx, x + 26, y + 2, 12, 10, '#3a6ad8', '#ffd24a'); } }
    }
  }
  const DBB0 = A.drawBattleBackground;
  A.drawBattleBackground = function (ctx, W, H, seed, theme, layer) {
    const r = DBB0.apply(this, arguments);
    if (winterOn() && theme !== 'peklo') {
      try {
        if (!layer) { winterize(ctx, W, H, 'near', theme, seed || 1); }
        else winterize(ctx, W, H, layer, theme, seed || 1);
      } catch (e) { console.warn('Zimní krajina', e); }
    }
    return r;
  };

  /* ---------- sníh a světýlka na hradech (předkreslené, střídají se 2 fáze) ---------- */
  const wCache = new WeakMap();
  function winterOverlay(img) {
    if (wCache.has(img)) return wCache.get(img);
    const src = img.canvas, cw = src.width, ch = src.height, res = cw / img.w;
    const sd = src.getContext('2d').getImageData(0, 0, cw, ch).data;
    const mk = () => { const o = document.createElement('canvas'); o.width = cw; o.height = ch; return o; };
    const base = mk(), bc = base.getContext('2d'), id = bc.createImageData(cw, ch), dd = id.data;
    const cap = Math.max(3, Math.round(3.2 * res));
    for (let x = 0; x < cw; x++) {
      let prev = 0, drape = 0;
      for (let y = 0; y < ch; y++) {
        const a = sd[(y * cw + x) * 4 + 3];
        if (a > 150 && prev < 60) {
          const cH = cap + ((x * 7 + y * 3) % 3);
          for (let q = -1; q < cH && y + q < ch; q++) { const p = ((y + q) * cw + x) * 4; if (q >= 0 && sd[p + 3] < 150) break; const s = q >= cH - 1 ? 222 : 250; dd[p] = s - 6; dd[p + 1] = s - 1; dd[p + 2] = 255; dd[p + 3] = q < 0 ? 170 : 255; }
          drape = 0;
        }
        // rampouchy pod převisy
        if (a < 40 && prev > 150 && ((x * 13 + y * 7) % 11) < 3) { const L = 2 + ((x * 31 + y) % 5) * res; for (let q = 0; q < L && y + q < ch; q++) { const p = ((y + q) * cw + x) * 4; dd[p] = 210; dd[p + 1] = 236; dd[p + 2] = 255; dd[p + 3] = 220 - q * 18; } }
        prev = a; void drape;
      }
    }
    bc.putImageData(id, 0, 0);
    // světýlka podél horního obrysu
    const top = []; for (let x = 0; x < img.w; x++) { const px = Math.min(cw - 1, Math.round(x * res)); let yy = null; for (let y = 0; y < ch; y++) if (sd[(y * cw + px) * 4 + 3] > 150) { yy = y / res; break; } top.push(yy); }
    const bulbs = []; let last = -99;
    for (let x = 4; x < img.w - 4; x++) { const y = top[x]; if (y == null || top[x - 3] == null || top[x + 3] == null) continue; if (Math.abs(top[x - 3] - y) > 1.2 || Math.abs(top[x + 3] - y) > 1.2) continue; if (x - last < 13) continue; last = x; bulbs.push([x, y + 5.4]); }
    const COLS = ['#ff3a4a', '#ffd24a', '#3aff7a', '#4ab8ff', '#ff8ae0'];
    const phase = ph => {
      const o = mk(), c = o.getContext('2d'); c.drawImage(base, 0, 0); c.scale(res, res);
      c.beginPath(); for (let i = 1; i < bulbs.length; i++) { const [x0, y0] = bulbs[i - 1], [x1, y1] = bulbs[i]; if (x1 - x0 > 30 || Math.abs(y1 - y0) > 8) continue; c.moveTo(x0, y0 - 1); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 2.6, x1, y1 - 1); } st(c, 'rgba(20,40,20,.85)', 0.8);
      bulbs.forEach(([x, y], i) => {
        const col = COLS[i % COLS.length], on = (i + ph) % 2 === 0;
        if (on) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, x, y, 0, 7, [[0, col + 'aa'], [1, col + '00']]); c.fillRect(x - 7, y - 7, 14, 14); c.restore(); }
        c.beginPath(); c.ellipse(x, y + 0.6, 1.5, 2.1, 0, 0, TAU); c.fillStyle = on ? col : shadeHex(col, -0.45); c.fill(); c.lineWidth = 0.5; c.strokeStyle = 'rgba(0,0,0,.6)'; c.stroke();
        if (on) { c.beginPath(); c.arc(x - 0.4, y, 0.6, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); }
      });
      return o;
    };
    const out = [phase(0), phase(1)];
    wCache.set(img, out);
    return out;
  }
  /* domovská scéna: vánoční stromek u brány, dárky a sněhulák (předkreslené, 2 fáze světel) */
  let homeSpr = null;
  function homeSprites() {
    if (homeSpr) return homeSpr;
    const mk = ph => { const o = document.createElement('canvas'); o.width = 300; o.height = 300; const c = o.getContext('2d'); c.scale(2, 2); xtree(c, 60, 140, 128, ph, 0); gift(c, 34, 142, 20, 16, '#c8202a', '#ffd24a'); gift(c, 84, 142, 16, 22, '#2a6ad8', '#ffffff'); gift(c, 100, 142, 14, 11, '#ffd24a', '#c8202a'); return o; };
    const sm = document.createElement('canvas'); sm.width = 80; sm.height = 120; const sc = sm.getContext('2d'); sc.scale(2, 2); snowman(sc, 20, 58, 1.15);
    return (homeSpr = { tree: [mk(0), mk(1)], snowman: sm });
  }
  const DC1 = A.drawCastle;
  A.drawCastle = function (ctx, img, front, groundY, facing, t) {
    const r = DC1.apply(this, arguments);
    try {
      const id = ctx.canvas && ctx.canvas.id;
      if (winterOn() && img && img.canvas && (id === 'bCanvas' || id === 'homeCv') && !(id === 'bCanvas' && X.bTheme === 'peklo') && img._st !== 'peklo') {
        const ov = winterOverlay(img), ph = Math.floor(performance.now() / 700) % 2, o = ov[ph];
        const x0 = facing === 1 ? front - img.w + 2 : front - 2;
        if (facing === 1) ctx.drawImage(o, x0, groundY - img.h, img.w, img.h);
        else { ctx.save(); ctx.translate(front - 2 + img.w, groundY - img.h); ctx.scale(-1, 1); ctx.drawImage(o, 0, 0, img.w, img.h); ctx.restore(); }
        if (id === 'homeCv' && facing === 1) {
          const S = homeSprites();
          ctx.drawImage(S.tree[ph], front + 40, groundY - 140, 150, 150);
          ctx.drawImage(S.snowman, front - img.w - 62, groundY - 54, 40, 60);
        }
      }
    } catch (e) { /* nic */ }
    return r;
  };

  /* ---------- sprity: Santovy saně a padající dárek ---------- */
  let sleighSpr = null;
  function sleighSprite() {
    if (sleighSpr) return sleighSpr;
    const o = document.createElement('canvas'); o.width = 520; o.height = 140; const c = o.getContext('2d'); c.scale(2, 2);
    // sobi s postrojem
    const deer = (x, y, s) => {
      c.save(); c.translate(x, y); c.scale(s, s);
      c.beginPath(); c.ellipse(0, 0, 14, 6.4, -0.08, 0, TAU); fs(c, lg(c, 0, -6, 0, 6, ['#b07a4a', '#7a4a2a']), 1.2);
      c.beginPath(); c.moveTo(-10, 3); c.lineTo(-16, 12); c.moveTo(-6, 4); c.lineTo(-9, 13); c.moveTo(8, 4); c.lineTo(14, 11); c.moveTo(11, 3); c.lineTo(19, 8); st(c, '#5a3a20', 2.4);
      c.beginPath(); c.moveTo(10, -3); c.quadraticCurveTo(16, -10, 20, -12); st(c, '#9a6a3a', 5);
      c.beginPath(); c.ellipse(22, -12.6, 5, 3.4, 0.25, 0, TAU); fs(c, '#a87244', 1.1);
      c.beginPath(); c.moveTo(19, -15); c.quadraticCurveTo(17, -22, 20, -26); c.moveTo(18.4, -19); c.lineTo(14, -22); c.moveTo(21, -15); c.quadraticCurveTo(24, -21, 22, -25); st(c, '#d8b07a', 1.4);
      c.beginPath(); c.arc(26.6, -11.4, 1.4, 0, TAU); c.fillStyle = '#1a1410'; c.fill();
      c.restore();
    };
    c.beginPath(); c.moveTo(150, 46); c.lineTo(40, 40); st(c, '#c9a050', 0.8);
    deer(30, 40, 1); deer(72, 42, 1); deer(114, 44, 1);
    // saně
    c.beginPath(); c.moveTo(150, 48); c.quadraticCurveTo(152, 30, 170, 28); c.lineTo(214, 28); c.quadraticCurveTo(222, 30, 222, 44); c.quadraticCurveTo(200, 56, 160, 54); c.closePath(); fs(c, lg(c, 150, 28, 220, 56, ['#ff4a4a', '#c8202a', '#7a0e16']), 1.4);
    c.beginPath(); c.moveTo(152, 47); c.quadraticCurveTo(190, 54, 220, 44); st(c, '#ffd24a', 1.4);
    c.beginPath(); c.moveTo(146, 60); c.lineTo(222, 60); c.quadraticCurveTo(232, 60, 230, 52); st(c, OUT, 3.4); st(c, '#ffd24a', 1.8);
    c.beginPath(); c.moveTo(168, 54); c.lineTo(166, 60); c.moveTo(208, 52); c.lineTo(208, 60); st(c, '#ffd24a', 1.4);
    // Santa a pytel
    c.beginPath(); c.ellipse(212, 22, 11, 12, 0, 0, TAU); fs(c, lg(c, 200, 10, 222, 34, ['#d8b07a', '#8a5a2a']), 1.2);
    gift(c, 206, 12, 9, 8, '#2a8a4a', '#ffd24a'); gift(c, 216, 13, 7, 9, '#3a6ad8', '#ffffff');
    c.beginPath(); c.ellipse(182, 24, 9, 10, 0, 0, TAU); fs(c, '#c8202a', 1.2);
    c.beginPath(); c.arc(186, 10, 6, 0, TAU); fs(c, '#f6d0b0', 1);
    c.beginPath(); c.moveTo(181, 12); c.quadraticCurveTo(184, 22, 192, 14); c.quadraticCurveTo(190, 10, 186, 12); c.closePath(); fs(c, '#ffffff', 0.8);
    c.beginPath(); c.moveTo(180, 7); c.quadraticCurveTo(186, -3, 192, 6); c.closePath(); fs(c, '#c8202a', 1); c.beginPath(); c.ellipse(186, 7, 6.6, 1.8, 0, 0, TAU); fs(c, '#ffffff', 0.8);
    c.beginPath(); c.moveTo(188, 26); c.lineTo(150, 46); st(c, '#7a4a2a', 0.8);
    sleighSpr = o; return o;
  }
  let giftSpr = null;
  function giftSprite() {
    if (giftSpr) return giftSpr;
    const o = document.createElement('canvas'); o.width = 96; o.height = 96; const c = o.getContext('2d'); c.scale(2, 2);
    gift(c, 24, 44, 26, 22, '#c8202a', '#ffd24a');
    c.beginPath(); c.arc(24, 16, 1.4, 0, TAU); c.fillStyle = '#fff6c8'; c.fill();
    giftSpr = o; return o;
  }

  /* ======================= BITVA: SNÍH, SANĚ A DÁRKY, KOULOVAČKA ======================= */
  const X = { bTheme: null };
  if (window.Battle) {
    const B = Battle.prototype;
    const R0 = B.render;
    B.render = function () { X.bTheme = this.theme; return R0.apply(this, arguments); };
    // víc sněžení o Vánocích (jen mimo online souboje proti lidem)
    const NV0 = B._nvInit2;
    if (NV0) B._nvInit2 = function () {
      if (winterOn() && !this.net && this.o && !this.o.weather && this.theme !== 'peklo' && Math.random() < 0.3) this.o.weather = 'snih';
      const r = NV0.apply(this, arguments);
      if (winterOn() && !this.net && this.wx === 'dest') this.wx = 'snih';
      return r;
    };
    const U0 = B.update;
    B.update = function (dt) {
      U0.call(this, dt);
      if (this.over || !winterOn()) return;
      try { xmUpdate(this, dt); } catch (e) { /* nic */ }
    };
    const WF0 = B._drawWorldFx;
    B._drawWorldFx = function (ctx, t) { if (WF0) WF0.call(this, ctx, t); if (this._xm) try { xmDrawWorld(this, ctx, t); } catch (e) { /* nic */ } };
    const SF0 = B._drawScreenFx;
    B._drawScreenFx = function (ctx) { if (SF0) SF0.call(this, ctx); if (winterOn()) try { xmDrawScreen(this, ctx); } catch (e) { /* nic */ } };
    const DS0 = B.destroy;
    B.destroy = function () { if (this._xmDown) { try { this.canvas.removeEventListener('pointerdown', this._xmDown, true); } catch (e) { /* nic */ } this._xmDown = null; } return DS0.apply(this, arguments); };
    // schopnost Rudolfa (sobík): zářící nos oslní nepřátele a shodí dárek
    const PU0 = B._petUpdate;
    if (PU0) B._petUpdate = function (dt) {
      const p = this.pet, before = p ? p.cd : 0;
      PU0.call(this, dt);
      if (p && p.def && p.def.kind === 'sobik' && before - dt <= 0 && Math.abs(p.cd - p.def.cd) < 1e-6) rudolfAbility(this, p);
    };
  }
  function rudolfAbility(b, p) {
    const foes = b.units.filter(e => e.team === 'enemy' && !e.dead && !e._sh && e.x > p.x - 80 && e.x < p.x + 420);
    if (!foes.length) { p.cd = 2; return; }
    p.uses++; p.act = 1.2; p.tx = p.x + 30;
    (b._xm || (b._xm = xmInit(b))).beams.push({ x: p.x + 20, y: p.y - 6, t: 0, life: 0.7 });
    b.later(0.3, () => {
      if (b.over) return;
      foes.slice(0, 12).forEach(e => { if (e.dead) return; e.stunUntil = Math.max(e.stunUntil || 0, b.time + 1.5); b._damage(e, 30, null); });
      const me = b.side.player; me.coins = Math.min(me.maxCoins, me.coins + 20);
      b.texts.push({ x: p.x, y: p.y - 34, txt: '+20', color: '#ffd54f', t: 0, life: 1.2, coin: true });
      if (window.Zvuk) Zvuk.play('magic', 0.6);
    });
  }
  function xmInit(b) {
    const o = b.o || {}, ok = !b.net && !b.film && o.mode !== 'online';
    const s = { sleigh: null, gifts: [], balls: [], beams: [], next: ok ? (o.xmasSnow ? 8 : 26) : Infinity, got: 0, gold: 0, snow: !!o.xmasSnow, ballT: 3 };
    if (ok && window.App && App.save) {
      b._xmDown = e => {
        if (!b._xm || !b._xm.gifts.length || b.over || b.paused) return;
        const wpt = b._toWorld ? b._toWorld(e.clientX, e.clientY) : null; if (!wpt) return;
        const r = Math.max(46, 40 / Math.max(0.2, b.cam.scale || 1));
        const g = b._xm.gifts.find(q => q.landed >= 0 && Math.abs(q.x - wpt[0]) < r && Math.abs(q.y - 22 - wpt[1]) < r * 1.2);
        if (!g) return;
        e.stopImmediatePropagation(); e.preventDefault();
        collectGift(b, g);
      };
      b.canvas.addEventListener('pointerdown', b._xmDown, true);
    }
    return s;
  }
  function collectGift(b, g) {
    const S = b._xm; S.gifts = S.gifts.filter(q => q !== g);
    const me = b.side.player, coins = 30 + Math.round(Math.random() * 20);
    me.coins = Math.min(me.maxCoins, me.coins + coins);
    let fl = 0; const sv = window.App && App.save;
    if (sv) { fl = addFlakes(sv, 1 + Math.floor(Math.random() * 3), 'p'); S.got += fl; }
    b.texts.push({ x: g.x, y: g.y - 44, txt: `+${coins}`, color: '#ffd54f', t: 0, life: 1.2, coin: true });
    if (fl) b.texts.push({ x: g.x, y: g.y - 70, txt: `+${fl} ❄`, color: '#bfeaff', t: 0, life: 1.6, big: true });
    if (b.vfx) for (let i = 0; i < 14; i++) b.vfx.spark(g.x, g.y - 14, (Math.random() - 0.5) * 220, -60 - Math.random() * 160, 0.8, 2.4, ['#ffd24a', '#ffffff', '#ff4a5a'][i % 3], 300);
    if (window.Zvuk) Zvuk.play('coin', 0.9);
    if (sv && window.App) { try { App.persist(); } catch (e) { /* nic */ } }
  }
  function xmUpdate(b, dt) {
    const S = b._xm || (b._xm = xmInit(b)), C = G.battleConfig;
    const viewTop = b.H - (b.cam.viewH || b.H);
    // saně přelétají nad bojištěm a shodí dárek
    S.next -= dt;
    if (!S.sleigh && S.next <= 0 && isFinite(S.next)) { S.sleigh = { t: 0, dur: 8, dropped: false, x0: b.cam.x - 300, x1: b.cam.x + b.cam.viewW + 300 }; S.next = S.snow ? 18 + Math.random() * 10 : 50 + Math.random() * 30; }
    if (S.sleigh) {
      const sl = S.sleigh; sl.t += dt; const k = sl.t / sl.dur;
      sl.x = sl.x0 + (sl.x1 - sl.x0) * k; sl.y = viewTop + 150 + Math.sin(sl.t * 2.2) * 8;
      if (!sl.dropped && k > 0.42) { sl.dropped = true; S.gifts.push({ x: Math.max(C.playerFront + 120, Math.min(C.enemyFront - 200, sl.x + 120)), y: sl.y + 40, ty: C.laneTop + 8 + Math.random() * (C.laneBottom - C.laneTop - 16), landed: -1, t: 0, sway: Math.random() * 6 }); }
      if (k >= 1) S.sleigh = null;
    }
    for (const g of S.gifts) { g.t += dt; if (g.landed < 0) { g.y += 95 * dt; if (g.y >= g.ty) { g.y = g.ty; g.landed = 0; } } else g.landed += dt; }
    S.gifts = S.gifts.filter(g => g.landed < 10);
    // koulovačka: skřítci z hradeb hází sněhové koule
    if (S.snow) {
      S.ballT -= dt;
      if (S.ballT <= 0) {
        S.ballT = 4.5;
        const pc = b.side.player.castle;
        const foes = b.units.filter(e => e.team === 'enemy' && !e.dead && !e._sh && e.x < pc.front + 1600).sort((a, c) => a.x - c.x).slice(0, 6);
        foes.forEach((e, i) => S.balls.push({ x0: pc.front - 60 + (i % 3) * 22, y0: C.groundY - 230 - (i % 2) * 20, e, ex: e.x, ey: e.y - 30, t: -i * 0.12, dur: 0.9 }));
      }
      for (const q of S.balls) {
        q.t += dt; if (q.t < 0) continue;
        if (!q.e.dead) { q.ex = q.e.x; q.ey = q.e.y - 30; }
        if (q.t >= q.dur && !q.hit) { q.hit = true; if (!q.e.dead) { b._damage(q.e, 38, null); q.e.slowUntil = Math.max(q.e.slowUntil || 0, b.time + 2); } if (b.vfx) b.vfx.explosion(q.ex, q.ey + 6, 24, 'ice'); }
      }
      S.balls = S.balls.filter(q => !q.hit);
    }
    for (const be of S.beams) be.t += dt;
    S.beams = S.beams.filter(be => be.t < be.life);
  }
  function xmDrawWorld(b, ctx, t) {
    const S = b._xm;
    if (S.sleigh) { const sl = S.sleigh, sp = sleighSprite(); ctx.drawImage(sp, sl.x - 130, sl.y - 30, 260, 70); }
    if (S.gifts.length) {
      const sp = giftSprite();
      for (const g of S.gifts) {
        const blink = g.landed > 7 && Math.floor(g.landed * 6) % 2;
        if (blink) continue;
        if (g.landed < 0) {
          const sw = Math.sin(g.t * 3 + g.sway) * 0.16;
          ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(sw);
          ctx.beginPath(); ctx.moveTo(-18, -38); ctx.quadraticCurveTo(0, -62, 18, -38); ctx.closePath(); ctx.fillStyle = '#f6f2ea'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OUT; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-6, -38); ctx.quadraticCurveTo(0, -60, 6, -38); ctx.fillStyle = '#d6243a'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(-17, -38); ctx.lineTo(-6, -14); ctx.moveTo(17, -38); ctx.lineTo(6, -14); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(40,30,20,.7)'; ctx.stroke();
          ctx.drawImage(sp, -24, -38, 48, 48);
          ctx.restore();
        } else {
          const pulse = 0.5 + Math.sin(g.landed * 5) * 0.5;
          ctx.beginPath(); ctx.ellipse(g.x, g.y + 2, 26 + pulse * 6, 8 + pulse * 2, 0, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,214,90,${0.35 + pulse * 0.45})`; ctx.stroke();
          ctx.drawImage(sp, g.x - 24, g.y - 42 - Math.abs(Math.sin(g.landed * 4)) * 3, 48, 48);
        }
      }
    }
    if (S.balls.length) {
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(80,110,150,.9)'; ctx.lineWidth = 1.4;
      for (const q of S.balls) { if (q.t < 0) continue; const k = Math.min(1, q.t / q.dur), x = q.x0 + (q.ex - q.x0) * k, y = q.y0 + (q.ey - q.y0) * k - Math.sin(k * PI) * 160; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); ctx.stroke(); }
    }
    for (const be of S.beams) {
      const a = 1 - be.t / be.life;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.8;
      ctx.beginPath(); ctx.moveTo(be.x, be.y); ctx.lineTo(be.x + 440, be.y + 40); ctx.lineTo(be.x + 440, be.y + 150); ctx.closePath();
      ctx.fillStyle = lg(ctx, be.x, 0, be.x + 440, 0, [[0, 'rgba(255,80,80,.75)'], [1, 'rgba(255,80,80,0)']]); ctx.fill();
      ctx.restore();
    }
  }
  /* padající sníh přes obrazovku – jedna cesta, bez stavu (levné) */
  function xmDrawScreen(b, ctx) {
    if (b.theme === 'peklo' || b.wx === 'snih' || b.theme === 'sever') return;
    const W = b.canvas.width, H = b.canvas.height, d = b.dpr || 1, t = b._rt || b.time || 0, n = Math.round(70 + Math.min(50, W / d / 22));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const s = 0.6 + ((i * 37) % 10) / 12, x = (((i * 0.618034) % 1) * W + t * 14 * s * d + Math.sin(t * 0.9 + i) * 10 * d) % W, y = ((((i * 0.3819) % 1) * H) + t * 38 * s * d) % H, r = 1.4 * s * d;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fill(); ctx.restore();
  }

  /* ---------- domovská scéna: sníh a saně na obloze ---------- */
  if (window.Sin && Sin.drawHome) {
    const DH0 = Sin.drawHome;
    Sin.drawHome = function (ctx, t, save) {
      DH0.apply(this, arguments);
      if (!winterOn()) return;
      try {
        const ph = t % 26; if (ph < 7) { const sp = sleighSprite(), k = ph / 7; ctx.drawImage(sp, -260 + k * 1900, 178 + Math.sin(t * 2) * 6 - k * 50, 180, 49); }
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath();
        for (let i = 0; i < 90; i++) { const s = 0.6 + ((i * 37) % 10) / 12, x = (((i * 0.618034) % 1) * 1500 + t * 10 * s + Math.sin(t * 0.8 + i) * 8) % 1500 - 50, y = (((i * 0.3819) % 1) * 640 + t * 26 * s) % 640 - 40, r = 1.5 * s; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
        ctx.fill();
      } catch (e) { /* nic */ }
    };
  }

  /* ======================= MAZLÍČEK: SOBÍK RUDOLF ======================= */
  const PET = { id: 'sobik', cs: 'Sobík Rudolf', en: 'Rudolph the Reindeer',
    d: ['Exkluzivní vánoční mazlíček – získáš ho jen do 25. prosince za 12 adventních okének. Každých 15 s rozzáří nos: oslní nepřátele před sebou (omráčí je na 1,5 s) a shodí dárek za 20 mincí.',
      'Exclusive Christmas pet – only until 25 December for 12 advent doors. Every 15 s his nose lights up: he dazzles the enemies in front of him (stuns them for 1.5 s) and drops a present worth 20 coins.'],
    need: { k: 'xmas', n: 12 }, cd: 15, kind: 'sobik', col: '#ff6a5a', rar: 'legendary', excl: true };
  function petRegister(save) {
    if (!G.pets) return;
    const own = save && (save.petsOwned || []).includes('sobik');
    const has = G.pets.find(p => p.id === 'sobik');
    if (!has && (own || petOpen())) { G.pets.push(PET); }
    PET.name = L(PET.cs, PET.en); PET.desc = L(PET.d[0], PET.d[1]);
  }
  if (G.petProgress) {
    const PP0 = G.petProgress;
    G.petProgress = (s, p) => (p && p.id === 'sobik' ? ((s.petsOwned || []).includes('sobik') ? 12 : Math.min(12, s.vanoce ? Object.keys(s.vanoce.doors || {}).length : 0)) : PP0(s, p));
  }
  if (G.petUnlocked) { const PU = G.petUnlocked; G.petUnlocked = (s, p) => (p && p.id === 'sobik' ? (s.petsOwned || []).includes('sobik') : PU(s, p)); }
  function checkPet(App) {
    const save = App.save; if (!save || (save.petsOwned || []).includes('sobik')) return false;
    if (!petOpen() || opened(save) < 12) return false;
    save.petsOwned = (save.petsOwned || []).concat('sobik'); petRegister(save); App.persist();
    return true;
  }
  if (G.petDrawFns && G.petKit) {
    const K = G.petKit;
    G.petDrawFns.sobik = function (c, t, act) {
      const bob = Math.sin(t * 2.2) * 2, run = act ? t * 14 : t * 5, gl = act ? 1 : 0.55 + Math.sin(t * 3) * 0.25;
      c.save(); c.translate(0, bob + 3); c.scale(0.94, 0.94);
      // stříbrný prach za kopyty
      for (let i = 0; i < 5; i++) { const ph = (t * 0.9 + i / 5) % 1; c.globalAlpha = 1 - ph; K.sparkle(c, -22 - ph * 20, 10 + Math.sin(i * 2 + t) * 6, 2.4 * (1 - ph) + 0.6, i % 2 ? '#ffe9a8' : '#ffffff'); }
      c.globalAlpha = 1;
      // zadní nohy
      const leg = (x, ph, col) => { const a = Math.sin(run + ph) * 0.5; c.save(); c.translate(x, 6); c.rotate(a); c.beginPath(); c.moveTo(-2.2, 0); c.lineTo(-1.6, 15); c.lineTo(1.8, 15); c.lineTo(2.2, 0); c.closePath(); K.fill(c, col, 1.2); c.beginPath(); c.rect(-2.4, 14, 4.8, 3); K.fill(c, '#3a2418', 1); c.restore(); };
      leg(-12, PI, '#8a5a34'); leg(9, 0, '#8a5a34');
      // ocásek
      c.beginPath(); c.ellipse(-19, -4, 4, 2.6, -0.6, 0, TAU); K.fill(c, '#fff6ea', 1.2);
      // tělo
      c.beginPath(); c.ellipse(-2, 2, 18, 11, -0.05, 0, TAU); K.fill(c, K.rg(c, -2, 2, 1, 20, ['#d8a070', '#a86a3c', '#6a4024'], -8, -4), 1.6);
      c.beginPath(); c.ellipse(4, 8, 9, 4.4, 0, 0, PI); c.fillStyle = 'rgba(255,240,220,.55)'; c.fill();
      K.gloss(c, -6, -4, 7, 2, -0.1, 0.35);
      // přední nohy
      leg(-6, PI * 0.5, '#a86a3c'); leg(12, PI * 1.5, '#a86a3c');
      // krk a hlava
      c.beginPath(); c.moveTo(8, -4); c.quadraticCurveTo(14, -16, 16, -20); c.lineTo(23, -16); c.quadraticCurveTo(19, -6, 15, 2); c.closePath(); K.fill(c, '#b07440', 1.4);
      c.beginPath(); c.ellipse(21, -21, 8.4, 7, 0.15, 0, TAU); K.fill(c, K.rg(c, 21, -21, 1, 9, ['#e0aa78', '#a86a3c'], 18, -24), 1.5);
      c.beginPath(); c.ellipse(27.4, -17.6, 5.4, 4.2, 0.2, 0, TAU); K.fill(c, '#e8c098', 1.3);
      // parohy
      const antler = (x, y, s, col) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-3, -8, -1, -15); c.moveTo(-1.6, -6); c.quadraticCurveTo(-7, -7, -9, -12); c.moveTo(-1.6, -11); c.quadraticCurveTo(3, -13, 4.6, -18); c.moveTo(-1, -15); c.lineTo(-4.6, -20); K.stroke(c, '#1b1420', 4); K.stroke(c, col, 2.4); c.restore(); };
      antler(16, -26, 0.85, '#b8905a'); antler(21, -27, 0.95, '#e8c890');
      // uši
      c.beginPath(); c.ellipse(14.6, -24, 4, 1.8, -0.7, 0, TAU); K.fill(c, '#a86a3c', 1.1);
      // oko
      K.eye(c, 22.6, -23, 2.8, '#5a3a1e', 0.5, (t % 4.3) > 4.15 ? 0.9 : 0);
      c.beginPath(); c.moveTo(20.4, -27.4); c.quadraticCurveTo(22.6, -28.6, 25, -27.6); K.stroke(c, '#5a3a20', 0.8);
      K.blush(c, 24, -18.6, 1.8);
      c.beginPath(); c.moveTo(25.6, -14.8); c.quadraticCurveTo(27.6, -13.4, 29.6, -15); K.stroke(c, '#5a3a20', 0.8);
      // zářící červený nos
      K.glow(c, 32.4, -18.6, act ? 22 : 12, '#ff3a3a', 0.55 * gl + 0.2);
      c.beginPath(); c.arc(32.4, -18.6, 3.2, 0, TAU); K.fill(c, K.rg(c, 32.4, -18.6, 0.3, 3.4, [[0, '#ffe0e0'], [0.35, '#ff3a3a'], [1, '#b0101a']], 31.4, -19.8), 1.1);
      // šála a zvoneček
      c.beginPath(); c.moveTo(11, -11); c.quadraticCurveTo(17, -7, 22, -13); c.lineTo(22, -9.6); c.quadraticCurveTo(16, -3, 10.6, -7.4); c.closePath(); K.fill(c, '#c8202a', 1.1);
      c.save(); c.clip(); c.fillStyle = '#ffffff'; for (let x = 10; x < 24; x += 3.6) c.fillRect(x, -16, 1.4, 12); c.restore();
      const fl = Math.sin(t * 4) * 1.4; c.beginPath(); c.moveTo(11.6, -9); c.quadraticCurveTo(6, -6 + fl, 1.6, -9 + fl); c.lineTo(2.4, -5.6 + fl); c.quadraticCurveTo(6.6, -3 + fl, 11.6, -6); c.closePath(); K.fill(c, '#c8202a', 1);
      bell(c, 16.8, -4.4, 1.15);
      if (act) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(34, -18.6); c.lineTo(70, -30); c.lineTo(70, -6); c.closePath(); c.fillStyle = K.lg(c, 34, 0, 70, 0, ['rgba(255,90,90,.9)', 'rgba(255,90,90,0)']); c.fill(); c.restore(); }
      c.restore();
    };
  }

  /* ======================= ODMĚNY ADVENTU ======================= */
  const REW = [
    { gold: 500 }, { gems: 20 }, { fl: 15 }, { chest: 's' }, { set: 'strelec', w: 1 }, { set: 'strelec', a: 1 },
    { gold: 1000 }, { gems: 40 }, { decor: 1 }, { chest: 'm' }, { set: 'kopi', w: 1 }, { set: 'kopi', a: 1 },
    { gold: 1500 }, { gems: 60 }, { fl: 25 }, { chest: 'l' }, { set: 'mag', w: 1 }, { set: 'mag', a: 1 },
    { set: 'pech', a: 1, w: 1 }, { gems: 80 }, { gold: 3000 }, { set: 'jizda', a: 1, w: 1 }, { chest: 'l', fl: 30 }, { set: 'velitel', a: 1, w: 1, castle: 1, gems: 300 }
  ];
  const BIG = { 6: 1, 12: 1, 18: 1, 19: 1, 22: 1, 24: 1 };
  const CATCH = { fl: 10, gems: 30 };
  const ROLE_N = { pech: ['pěšáky', 'infantry'], strelec: ['lučištníky', 'archers'], kopi: ['kopiníky', 'spearmen'], jizda: ['jízdu', 'cavalry'], mag: ['mágy', 'mages'], velitel: ['velitele', 'commanders'] };
  const SET_N = { pech: ['Louskáček', 'Nutcracker'], strelec: ['Vánoční skřítek', 'Christmas Elf'], kopi: ['Perníkový panáček', 'Gingerbread Man'], jizda: ['Sobí jezdec', 'Reindeer Rider'], mag: ['Sněhulák kouzelník', 'Snowman Wizard'], velitel: ['Santa Klaus', 'Santa Claus'] };
  const CHEST = { s: { gold: [400, 800], odds: [0.45, 0.45, 0.1, 0], n: 1 }, m: { gold: [800, 1500], odds: [0.15, 0.5, 0.3, 0.05], n: 1 }, l: { gold: [1500, 3000], odds: [0, 0.35, 0.5, 0.15], n: 2 } };

  /* udělí odměnu; vrací seznam pro okno s odměnami */
  function grant(App, r, noComp) {
    const save = App.save, got = [], S = state(save);
    const give = { gold: r.gold || 0, gems: r.gems || 0, items: [], random: [] };
    if (r.chest) { const C = CHEST[r.chest]; give.gold += Math.round((C.gold[0] + Math.random() * (C.gold[1] - C.gold[0])) / 10) * 10; for (let i = 0; i < C.n; i++) give.random.push({ odds: C.odds }); }
    if (r.set) {
      unitsOf(r.set).forEach(uid => {
        if (r.a && XA[r.set]) give.items.push({ k: 'a', id: XA[r.set], unit: uid });
        const wid = r.w && xWeapon(uid); if (wid) give.items.push({ k: 'w', id: wid, unit: uid });
      });
    }
    const O = G.skinOwn;
    const before = give.items.filter(it => it.k === 'a' ? !O.has(save, it.unit, it.id) : !O.hasW(save, it.unit, it.id)).length;
    if (give.items.length && !before && !noComp) give.gems += 100;     // set už hráč má → drahokamy místo něj
    if (!give.gold) delete give.gold; if (!give.gems) delete give.gems;
    if (!give.random.length) delete give.random; if (!give.items.length) delete give.items;
    if (r.decor) give.decor = ['xm_vyzdoba'];
    const res = Shop.grant(App, give);   // nový skin se nasadí sám jen vojákům ve výchozí zbroji (jinak tlačítko Obléknout)
    res.forEach(x => got.push(x));
    if (r.castle) {
      save.skins.ownedCastle = save.skins.ownedCastle || [];
      if (!save.skins.ownedCastle.includes('vanocni')) { save.skins.ownedCastle.push('vanocni'); got.push({ kind: 'castle', id: 'vanocni' }); }
      else { save.gems += 150; got.push({ kind: 'gems', n: 150 }); }
    }
    if (r.fl) { S.fl += r.fl; got.push({ kind: 'fl', n: r.fl }); }
    App.persist();
    return got;
  }
  const flakeSvg = (cls) => `<svg class="${cls || 'xm-fl'}" viewBox="0 0 24 24" aria-hidden="true"><g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.8L12 6.3l2.5-2.5M9.5 20.2L12 17.7l2.5 2.5M4.2 10.6l3.4-.9-.9-3.4M19.8 13.4l-3.4.9.9 3.4M4.2 13.4l3.4.9-.9 3.4M19.8 10.6l-3.4-.9.9-3.4"/></g></svg>`;
  const giftSvg = `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M60 8c-10-12-30-6-24 8 4 8 16 8 24 6 8 2 20 2 24-6 6-14-14-20-24-8z" fill="#ffd24a" stroke="#1a0e06" stroke-width="4"/><rect x="14" y="26" width="92" height="22" rx="4" fill="#e0243a" stroke="#1a0e06" stroke-width="4"/><rect x="22" y="48" width="76" height="44" rx="3" fill="#c8182a" stroke="#1a0e06" stroke-width="4"/><path d="M52 26h16v66H52z" fill="#ffd24a" stroke="#1a0e06" stroke-width="3"/><path d="M24 58h72" stroke="#ff7a8a" stroke-width="3" opacity=".6"/><g fill="#fff"><circle cx="30" cy="38" r="3"/><circle cx="90" cy="38" r="3"/><circle cx="34" cy="70" r="2.6"/><circle cx="86" cy="80" r="2.6"/></g><path d="M8 30c8-10 18-12 26-8M112 30c-8-10-18-12-26-8" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`;
  const advSvg = `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M12 38L60 8l48 30v54H12z" fill="#c8182a" stroke="#1a0e06" stroke-width="4" stroke-linejoin="round"/><path d="M6 40L60 4l54 36" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 40L60 4l54 36" fill="none" stroke="#1a0e06" stroke-width="2"/><g stroke="#1a0e06" stroke-width="3"><rect x="22" y="46" width="22" height="18" rx="2" fill="#2a8a4a"/><rect x="49" y="46" width="22" height="18" rx="2" fill="#ffd24a"/><rect x="76" y="46" width="22" height="18" rx="2" fill="#2a8a4a"/><rect x="22" y="69" width="22" height="18" rx="2" fill="#ffd24a"/><rect x="49" y="69" width="22" height="18" rx="2" fill="#fff6e0"/><rect x="76" y="69" width="22" height="18" rx="2" fill="#ffd24a"/></g><path d="M60 72l2.4 5 5.4.6-4 3.6 1.2 5.3-5-2.7-5 2.7 1.2-5.3-4-3.6 5.4-.6z" fill="#e0243a"/><g fill="#1a0e06" font-family="Arial" font-weight="900" font-size="11" text-anchor="middle"><text x="33" y="59">6</text><text x="60" y="59">12</text><text x="87" y="59">18</text><text x="33" y="82">3</text><text x="87" y="82">9</text></g><path d="M60 8l3 6 6.6.8-4.8 4.4 1.4 6.4L60 22.4l-6.2 3.2 1.4-6.4-4.8-4.4L57 14z" fill="#ffd24a" stroke="#1a0e06" stroke-width="2.4"/></svg>`;
  const chestIco = k => `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M14 46h92v40a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="${k === 'l' ? '#5a2a7a' : '#8a5a32'}" stroke="#1a0e06" stroke-width="5"/><path d="M14 46c0-20 20-30 46-30s46 10 46 30z" fill="${k === 'l' ? '#3a1650' : '#5a3a1e'}" stroke="#1a0e06" stroke-width="5"/><path d="M14 46h92M30 18v74M90 18v74" stroke="${k === 's' ? '#c9d3e0' : '#ffd77a'}" stroke-width="7"/><rect x="49" y="39" width="22" height="24" rx="3" fill="#ffd77a" stroke="#1a0e06" stroke-width="3"/><path d="M8 20c10-8 20-8 30 0" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`;
  const wreathSvg = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="48" r="30" fill="none" stroke="#1a0e06" stroke-width="22"/><circle cx="50" cy="48" r="30" fill="none" stroke="#2a8a4a" stroke-width="16" stroke-dasharray="7 3"/><g fill="#e0243a" stroke="#1a0e06" stroke-width="2"><circle cx="28" cy="34" r="5"/><circle cx="72" cy="34" r="5"/><circle cx="74" cy="62" r="5"/><circle cx="26" cy="62" r="5"/></g><path d="M50 74L36 88V66zM50 74l14 14V66z" fill="#e0243a" stroke="#1a0e06" stroke-width="3"/></svg>`;

  /* ======================= UI ======================= */
  const V = {
    active, petOpen, today, state, winterOn,
    _armed: false,
    /* domovská obrazovka (volá screens.js) */
    home(App, el) {
      const host = el && el.querySelector('.hero-live'); if (!host) return;
      petRegister(App.save);
      host.querySelectorAll('.xm-btn').forEach(b => b.remove());
      if (active()) {
        const S = state(App.save), d = today().d, ready = d <= 24 && !S.doors[d];
        const b = document.createElement('button');
        b.className = 'daily-btn xm-btn'; b.id = 'xmBtn'; b.setAttribute('aria-label', L('Adventní kalendář', 'Advent calendar'));
        b.innerHTML = `<span class="daily-chest">${advSvg}</span><span class="daily-lbl">${L('Advent', 'Advent')}</span>${ready ? '<i class="daily-dot">!</i>' : ''}`;
        b.addEventListener('click', () => this.open(App));
        host.appendChild(b);
        if (checkPet(App)) setTimeout(() => this.petModal(App), 400);
        this._autoOpen(App);
      } else {
        const n = teaserDays(); if (!n) return;
        const b = document.createElement('button');
        b.className = 'daily-btn xm-btn xm-teaser'; b.id = 'xmBtn'; b.setAttribute('aria-label', L(`Vánoce za ${n} ${daysWord(n)}`, `Christmas in ${n} ${daysWord(n)}`)); b.title = b.getAttribute('aria-label');
        b.innerHTML = `<span class="daily-chest">${giftSvg}</span><span class="daily-lbl xm-count">${n} ${daysWord(n)}</span>`;
        b.addEventListener('click', () => this.teaser(App, n));
        host.appendChild(b);
      }
    },
    /* jednou denně se kalendář otevře sám (po denní odměně) */
    _autoOpen(App) {
      const S = state(App.save), k = dayKey(), d = today().d;
      if (S.auto === k || d > 24 || S.doors[d] || this._autoAt) return;
      this._autoAt = Date.now(); let tries = 0;
      const go = () => {
        if (App.current !== 'hrad' || App.battle) { this._autoAt = 0; return; }
        const busy = !App.save.lang || (window.Tutorial && Tutorial.active) || !document.getElementById('modal').hidden;
        if (busy) { if (++tries < 40) setTimeout(go, 1500); else this._autoAt = 0; return; }
        S.auto = k; App.persist(); this.open(App);
      };
      setTimeout(go, 2500);
    },
    teaser(App, n) {
      App.modal(`<div class="xm-adv xm-tz">
        <div class="xm-hero"><canvas id="xmTzCv"></canvas><div class="xm-hero-txt"><div class="eyebrow">${L('Už brzy', 'Coming soon')}</div><h2>${L('Vánoce v Castle WARS', 'Christmas in Castle WARS')}</h2>
        <p class="xm-big-count">${L(`za ${n} ${daysWord(n)}`, `in ${n} ${daysWord(n)}`)}</p></div></div>
        <ul class="xm-tz-list">
          <li>${advSvg}<span><b>${L('Adventní kalendář', 'Advent calendar')}</b>${L('24 okének s dárky – od 1. prosince každý den jedno.', '24 doors with gifts – one every day from 1 December.')}</span></li>
          <li>${giftSvg}<span><b>${L('Vánoční skiny', 'Christmas skins')}</b>${L('Santa, skřítci, louskáčci, perníčci, sobí jezdci a sněhuláci.', 'Santa, elves, nutcrackers, gingerbread men, reindeer riders and snowmen.')}</span></li>
          <li><canvas id="xmTzPet"></canvas><span><b>${L('Sobík Rudolf', 'Rudolph the Reindeer')}</b>${L('Exkluzivní mazlíček jen do 25. prosince.', 'Exclusive pet only until 25 December.')}</span></li>
        </ul>
        <div class="modal-actions"><button class="btn btn-gold" data-close>${L('Těším se!', 'Can’t wait!')}</button></div></div>`, (c) => {
        this._anim(c, () => { this._paintScene(c.querySelector('#xmTzCv'), performance.now() / 1000); this._paintPet(c.querySelector('#xmTzPet'), performance.now() / 1000, false); });
      });
    },
    /* ---------- hlavní okno ---------- */
    open(App, tab) {
      if (!active()) return;
      const save = App.save, S = state(save), d = today().d;
      petRegister(save);
      tab = tab || this._tab || 'kal'; this._tab = tab;
      const own = (save.petsOwned || []).includes('sobik'), n = opened(save);
      const petTxt = own ? `<b class="xm-ok">✓ ${L('Rudolf je tvůj!', 'Rudolph is yours!')}</b>`
        : petOpen() ? `${L('Okénka', 'Doors')} <b>${Math.min(n, 12)} / 12</b><span class="xm-bar"><i style="width:${Math.min(100, n / 12 * 100)}%"></i></span><small>${L(`jen do 25. 12. · zbývá ${Math.max(0, 25 - d + 1)} ${daysWord(Math.max(0, 25 - d + 1))}`, `until 25 Dec · ${Math.max(0, 25 - d + 1)} ${daysWord(Math.max(0, 25 - d + 1))} left`)}</small>`
          : `<small>${L('Rudolf už odletěl – příští Vánoce se vrátí.', 'Rudolph has flown away – he’ll be back next Christmas.')}</small>`;
      const body = tab === 'kal' ? this._calHtml(save) : tab === 'snih' ? this._snowHtml(save) : this._shopHtml(save);
      App.modal(`<div class="xm-adv">
        <div class="xm-hero"><canvas id="xmHeroCv"></canvas>
          <div class="xm-hero-txt"><div class="eyebrow">${L(`Vánoční událost · ${d}. prosince`, `Christmas event · ${d} December`)}</div><h2>${L('Adventní kalendář', 'Advent Calendar')}</h2>
          <div class="xm-chips"><span class="xm-chip xm-flk" title="${L('Vločky', 'Snowflakes')}">${flakeSvg()}<b>${fmt(S.fl)}</b></span><span class="xm-chip">${ico('gem')}<b>${fmt(save.gems)}</b></span></div></div>
          <div class="xm-pet"><canvas id="xmPetCv"></canvas><div><div class="xm-pet-n">${L('Sobík Rudolf', 'Rudolph the Reindeer')} <span class="xm-leg">${L('Legendární', 'Legendary')}</span></div>${petTxt}</div></div>
        </div>
        <div class="xm-tabs" role="tablist">
          <button class="xm-tab ${tab === 'kal' ? 'on' : ''}" data-xtab="kal">${L('Kalendář', 'Calendar')}</button>
          <button class="xm-tab ${tab === 'snih' ? 'on' : ''}" data-xtab="snih">${L('Koulovačka', 'Snowball Fight')}${S.snowDay !== dayKey() ? '<i class="xm-dot"></i>' : ''}</button>
          <button class="xm-tab ${tab === 'shop' ? 'on' : ''}" data-xtab="shop">${L('Santův obchůdek', 'Santa’s Shop')}</button>
        </div>
        <div class="xm-body">${body}</div>
        <button class="xm-x" data-close aria-label="${L('Zavřít', 'Close')}">✕</button>
      </div>`, (c, close) => {
        c.querySelectorAll('[data-xtab]').forEach(b => b.addEventListener('click', () => this.open(App, b.dataset.xtab)));
        this._anim(c, () => { const t = performance.now() / 1000; this._paintScene(c.querySelector('#xmHeroCv'), t); this._paintPet(c.querySelector('#xmPetCv'), t, false, !own && !petOpen()); });
        if (tab === 'kal') this._bindCal(App, c, close);
        else if (tab === 'snih') this._bindSnow(App, c, close);
        else this._bindShop(App, c, close);
      });
    },
    _anim(c, fn) {
      let last = 0;
      const step = now => { if (!c.isConnected || document.getElementById('modal').hidden || !c.querySelector('.xm-adv')) return; if (now - last > 40) { last = now; try { fn(); } catch (e) { /* nic */ } } requestAnimationFrame(step); };
      requestAnimationFrame(step);
    },
    _fit(cv) {
      if (!cv) return null; const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return { ctx, w, h };
    },
    /* zasněžená noční krajina se saněmi (záhlaví okna) */
    _paintScene(cv, t) {
      const F = this._fit(cv); if (!F) return; const { ctx: c, w, h } = F;
      if (!this._sky || this._sky.width !== cv.width || this._sky.height !== cv.height) {
        const o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height; const x = o.getContext('2d'); const k = cv.width / w; x.scale(k, k);
        x.fillStyle = lg(x, 0, 0, 0, h, [[0, '#0b1636'], [0.55, '#1c3a6e'], [1, '#4a78a8']]); x.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + ((i * 37) % 10) / 16})`; x.fillRect((i * 97.3) % w, (i * 53.1) % (h * 0.6), 1.3, 1.3); }
        x.fillStyle = 'rgba(255,248,220,.95)'; x.beginPath(); x.arc(w * 0.86, h * 0.24, Math.min(16, h * 0.14), 0, TAU); x.fill();
        x.fillStyle = '#c8daf0'; x.beginPath(); x.moveTo(0, h); for (let X0 = 0; X0 <= w; X0 += 20) x.lineTo(X0, h * 0.72 - Math.sin(X0 * 0.012) * h * 0.08 - Math.sin(X0 * 0.031) * h * 0.03); x.lineTo(w, h); x.closePath(); x.fill();
        x.fillStyle = '#eef5fc'; x.beginPath(); x.moveTo(0, h); for (let X0 = 0; X0 <= w; X0 += 20) x.lineTo(X0, h * 0.84 - Math.sin(X0 * 0.02 + 1) * h * 0.04); x.lineTo(w, h); x.closePath(); x.fill();
        for (let i = 0; i < Math.ceil(w / 70); i++) { const tx = 20 + i * 70 + ((i * 31) % 30), th = h * (0.24 + ((i * 17) % 10) / 60); x.fillStyle = '#1a4a36'; x.beginPath(); x.moveTo(tx - th * 0.3, h * 0.86); x.lineTo(tx, h * 0.86 - th); x.lineTo(tx + th * 0.3, h * 0.86); x.closePath(); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(tx - th * 0.12, h * 0.86 - th * 0.6); x.lineTo(tx, h * 0.86 - th); x.lineTo(tx + th * 0.12, h * 0.86 - th * 0.6); x.closePath(); x.fill(); }
        this._sky = o;
      }
      c.drawImage(this._sky, 0, 0, w, h);
      const ph = (t * 0.07) % 1, sp = sleighSprite(); c.drawImage(sp, -170 + ph * (w + 340), h * 0.18 + Math.sin(t * 1.6) * 4, 150, 40);
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); for (let i = 0; i < 40; i++) { const s = 0.6 + ((i * 37) % 10) / 14, X0 = ((i * 0.618) % 1 * w + t * 8 * s) % w, Y0 = ((i * 0.382) % 1 * h + t * 18 * s) % h; c.moveTo(X0 + 1.3 * s, Y0); c.arc(X0, Y0, 1.3 * s, 0, TAU); } c.fill();
    },
    _paintPet(cv, t, act, dim) {
      const F = this._fit(cv); if (!F || !G.drawPet) return; const { ctx: c, w, h } = F;
      c.clearRect(0, 0, w, h);
      const k = Math.min(w, h) / 86;
      c.save(); c.translate(w / 2, h * 0.58); c.scale(k, k); if (dim) c.globalAlpha = 0.45;
      G.drawPet(c, 'sobik', t, act || (t % 5) > 4.3); c.restore();
    },
    /* ---------- kalendář ---------- */
    _calHtml(save) {
      const S = state(save), d = today().d;
      const cell = i => {
        const r = REW[i - 1], got = S.doors[i], now = i === d && !got && d <= 24, miss = !got && i < d, lock = i > d;
        const cls = ['xm-door', 'c' + (i % 4), BIG[i] ? 'big' : '', got ? 'open' : '', now ? 'now' : '', miss ? 'miss' : '', lock ? 'lock' : ''].join(' ');
        const inner = got ? `<span class="xm-in">${this._rewIco(r, i)}</span>`
          : `<span class="xm-num">${i}</span>${BIG[i] ? '<span class="xm-star">★</span>' : ''}${now ? `<span class="xm-hint">${L('Otevři!', 'Open!')}</span>` : miss ? `<span class="xm-cost">${flakeSvg('xm-fl-s')}${CATCH.fl}</span>` : lock ? `<span class="xm-date">${i}. 12.</span>` : ''}`;
        return `<button class="${cls}" data-door="${i}" ${lock ? 'aria-disabled="true"' : ''} aria-label="${L('Okénko', 'Door')} ${i}">${inner}<i class="xm-leaf"></i></button>`;
      };
      const all = Object.keys(S.doors).length;
      return `<div class="xm-grid">${Array.from({ length: 24 }, (_, k) => cell(k + 1)).join('')}</div>
        <p class="xm-note">${L('Každý den otevřeš jedno okénko zdarma. Zmeškaná okénka doženeš za', 'Open one door free every day. Catch up on missed doors for')} ${flakeSvg('xm-fl-s')} ${CATCH.fl} ${L('nebo', 'or')} ${ico('gem')} ${CATCH.gems}. ${L('Otevři všech 24 a dostaneš navíc', 'Open all 24 to get an extra')} ${ico('gem')} 500${all >= 24 ? ' ✓' : ''}.</p>`;
    },
    _rewIco(r, i) {
      if (r.set) return `<canvas data-xset="${r.set}|${r.a ? 1 : 0}|${r.w ? 1 : 0}"></canvas>`;
      if (r.decor) return `<span class="xm-ri">${wreathSvg}</span>`;
      if (r.chest) return `<span class="xm-ri">${chestIco(r.chest)}</span>`;
      if (r.fl) return `<span class="xm-ri xm-ri-fl">${flakeSvg()}<b>${r.fl}</b></span>`;
      if (r.gems) return `<span class="xm-ri">${ico('gem')}<b>${r.gems}</b></span>`;
      return `<span class="xm-ri">${ico('coin')}<b>${fmt(r.gold)}</b></span>`;
    },
    _paintSetIco(cv) {
      const [role, a, w] = cv.dataset.xset.split('|'); const uid = unitsOf(role)[0]; if (!uid) return;
      const GH = G.gearHelpers, def = G.units[uid], wid = w === '1' ? xWeapon(uid) : null;
      if (a === '1') { const fake = { skins: { unit: { [uid]: XA[role] }, weapon: { [uid]: wid || 'w_zakladni' }, own: {}, ownW: {} } }; const lk = GH.look(fake, uid); Art.renderUnitIcon(cv, uid, 'player', XA[role], { zoom: 0.92, def: GH.drawDef(def, lk), pal: GH.palette('player', XA[role], def.faction, lk) }); }
      else { const W = G.weaponSkinById(wid); const pal = Art.unitPalette('player', 'zakladni', def.faction); pal.wmodel = W.model; Art.renderWeaponIcon(cv, uid, pal); }
    },
    _bindCal(App, c, close) {
      const save = App.save, S = state(save), d = today().d;
      c.querySelectorAll('canvas[data-xset]').forEach(cv => requestAnimationFrame(() => this._paintSetIco(cv)));
      c.querySelectorAll('[data-door]').forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.door; if (S.doors[i]) return;
        if (i > d) { App.toast(L(`Okénko ${i} se otevře ${i}. prosince.`, `Door ${i} opens on ${i} December.`)); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
        if (i < d) return this._catchUp(App, i);
        this._openDoor(App, b, i, close);
      }));
    },
    _catchUp(App, i) {
      const save = App.save, S = state(save);
      App.modal(`<div class="xm-adv xm-small"><div class="eyebrow">${L('Zmeškané okénko', 'Missed door')}</div><h2>${L(`Okénko ${i}`, `Door ${i}`)}</h2>
        <p class="muted">${L('Tohle okénko jsi zmeškal. Otevři ho teď:', 'You missed this door. Open it now:')}</p>
        <div class="modal-actions">
          <button class="btn btn-gold" id="xmCF" ${S.fl < CATCH.fl ? 'disabled' : ''}>${flakeSvg('xm-fl-s')} ${CATCH.fl} ${L('vloček', 'snowflakes')}</button>
          <button class="btn btn-green" id="xmCG" ${save.gems < CATCH.gems ? 'disabled' : ''}>${ico('gem')} ${CATCH.gems}</button>
          <button class="btn" id="xmCB">${L('Zpět', 'Back')}</button></div>
        <p class="xm-note">${L('Vločky získáš za dárky ze Santových saní v bitvách, za výhry a v denní koulovačce.', 'Earn snowflakes from presents dropped by Santa’s sleigh in battles, from wins and in the daily snowball fight.')}</p></div>`, (c, close) => {
        c.querySelector('#xmCB').addEventListener('click', () => this.open(App, 'kal'));
        const pay = k => { if (k === 'fl') { if (S.fl < CATCH.fl) return; S.fl -= CATCH.fl; } else { if (save.gems < CATCH.gems) return; save.gems -= CATCH.gems; } this._give(App, i, true); };
        c.querySelector('#xmCF').addEventListener('click', () => pay('fl'));
        c.querySelector('#xmCG').addEventListener('click', () => pay('gems'));
      });
    },
    _openDoor(App, b, i, close) {
      if (b.classList.contains('opening')) return;
      b.classList.add('opening');
      if (window.Zvuk) Zvuk.play('coin', 0.7);
      setTimeout(() => this._give(App, i), 650);
    },
    _give(App, i, paid) {
      const save = App.save, S = state(save);
      if (S.doors[i]) return;
      S.doors[i] = paid ? 2 : 1;
      const got = grant(App, REW[i - 1]);
      if (Object.keys(S.doors).length >= 24 && !S.allBonus) { S.allBonus = 1; save.gems += 500; got.push({ kind: 'gems', n: 500, all: true }); }
      const pet = checkPet(App);
      if (pet) got.push({ kind: 'pet' });
      App.persist(); App.refreshTop();
      this._rewards(App, L(`Okénko ${i}`, `Door ${i}`), got, () => this.open(App, 'kal'));
      if (App.current === 'hrad') { const el = App.screenEl; if (el) this.home(App, el); }
    },
    /* okno s odměnami (vlastní: umí i hrad, vločky a mazlíčka) */
    _rewards(App, title, got, back) {
      const item = (r, i) => {
        if (r.kind === 'gold') return `<div class="rw"><span class="rw-ico">${ico('coin')}</span><b>+${fmt(r.n)}</b><small>${t('gold')}</small></div>`;
        if (r.kind === 'gems') return `<div class="rw"><span class="rw-ico">${ico('gem')}</span><b>+${fmt(r.n)}</b><small>${r.all ? L('Všech 24 okének!', 'All 24 doors!') : t('gems')}</small></div>`;
        if (r.kind === 'fl') return `<div class="rw"><span class="rw-ico xm-flk">${flakeSvg()}</span><b>+${fmt(r.n)}</b><small>${L('vloček', 'snowflakes')}</small></div>`;
        if (r.kind === 'castle') return `<div class="rw rw-gear" style="--rc:#f2b440"><canvas data-rwc="1"></canvas><b>${esc(XCASTLE.name)}</b><small>${L('Vzhled hradu', 'Castle look')}</small></div>`;
        if (r.kind === 'pet') return `<div class="rw rw-gear" style="--rc:#f2b440"><canvas data-rwp="1"></canvas><b>${L('Sobík Rudolf', 'Rudolph the Reindeer')}</b><small>${L('Legendární mazlíček!', 'Legendary pet!')}</small></div>`;
        if (r.kind === 'decor') { const dd = G.castleCustom.decorations.find(x => x.id === r.id); return `<div class="rw"><span class="rw-ico xm-wr">${wreathSvg}</span><b>${esc(dd ? dd.name : '')}</b><small>${t('decor_word')}</small></div>`; }
        if (r.kind === 'skinA' || r.kind === 'skinW') {
          const Sk = r.kind === 'skinA' ? G.unitSkins.find(x => x.id === r.id) : G.weaponSkinById(r.id);
          const names = [...new Set(r.units.map(u => G.units[u].name))].join(', ');
          return `<div class="rw rw-gear" style="--rc:${G.rarityColors[Sk.rarity]}"><canvas data-rwi="${i}"></canvas><b>${esc(Sk.name)}</b><small>${t('skin_for_units', { u: esc(names) })}</small></div>`;
        }
        return '';
      };
      App.modal(`<div class="xm-adv xm-rew">
        <div class="xm-gift-open" aria-hidden="true"><div class="xm-gift-lid">${giftSvg}</div><div class="chest-rays"></div></div>
        <h2 style="text-align:center">${esc(title)}</h2>
        <div class="rw-grid">${got.map(item).join('')}</div>
        <div class="modal-actions">${got.some(r => r.kind === 'skinA' || r.kind === 'skinW') ? `<button class="btn btn-green" id="xmRwEq">${L('Obléknout', 'Equip')}</button>` : ''}<button class="btn btn-gold btn-big" id="xmRwOk">${t('great')}</button></div></div>`, (c, close) => {
        const eq = c.querySelector('#xmRwEq');
        if (eq) eq.addEventListener('click', () => {
          const sk = App.save.skins; got.forEach(r => { if (r.kind === 'skinA') r.units.forEach(u => { sk.unit[u] = r.id; }); if (r.kind === 'skinW') r.units.forEach(u => { sk.weapon = sk.weapon || {}; sk.weapon[u] = r.id; }); });
          App.persist(); eq.disabled = true; eq.textContent = '✓ ' + L('Oblečeno', 'Equipped'); if (App.current === 'hrad' && !App.battle) { /* scéna se překreslí sama */ }
        });
        c.querySelectorAll('canvas[data-rwi]').forEach(cv => requestAnimationFrame(() => {
          const r = got[+cv.dataset.rwi], uid = r.units[0], def = G.units[uid];
          if (r.kind === 'skinA') { const GH = G.gearHelpers, fake = { skins: { unit: { [uid]: r.id }, weapon: {} } }; const lk = GH.look(fake, uid); Art.renderUnitIcon(cv, uid, 'player', r.id, { zoom: 0.95, def: GH.drawDef(def, lk), pal: GH.palette('player', r.id, def.faction, lk) }); }
          else { const W = G.weaponSkinById(r.id); const pal = Art.unitPalette('player', 'zakladni', def.faction); pal.wmodel = W.model; Art.renderWeaponIcon(cv, uid, pal); }
        }));
        const cc = c.querySelector('canvas[data-rwc]'); if (cc) requestAnimationFrame(() => Art.renderCastleIcon(cc, 'player', 'vanocni', 4, (G.factions[App.save.faction] || {}).castleStyle || 'evropa'));
        const pc = c.querySelector('canvas[data-rwp]'); if (pc) this._anim(c, () => this._paintPet(pc, performance.now() / 1000, false));
        c.querySelector('#xmRwOk').addEventListener('click', () => { if (back) back(); else close(); });
        if (window.Zvuk) Zvuk.play('coin', 1);
      });
    },
    petModal(App) {
      this._rewards(App, L('Sobík Rudolf je tvůj!', 'Rudolph is yours!'), [{ kind: 'pet' }], () => { document.getElementById('modal').hidden = true; App.go('mazlicci', { pet: 'sobik' }); });
    },
    /* ---------- koulovačka ---------- */
    _snowHtml(save) {
      const S = state(save), done = S.snowDay === dayKey(), D = S.day;
      return `<div class="xm-snow">
        <div class="xm-snow-art"><canvas id="xmSnowCv"></canvas></div>
        <div class="xm-snow-txt">
          <h3>${L('Vánoční koulovačka', 'Christmas Snowball Fight')}</h3>
          <p>${L('Krampusova banda útočí! Santovi skřítci z hradeb zasypávají nepřátele sněhovými koulemi, které je zpomalí, a saně shazují dárky dvakrát častěji.', 'The Krampus gang attacks! Santa’s elves pelt the enemies with snowballs from the walls, slowing them down, and the sleigh drops presents twice as often.')}</p>
          <p class="xm-rw-line">${done ? `✓ ${L('Dnešní odměna je vybraná – hrát můžeš dál pro dárky.', 'Today’s reward is claimed – keep playing for presents.')}` : `${L('Dnešní odměna:', 'Today’s reward:')} <b>${flakeSvg('xm-fl-s')} 20</b> + <b>${ico('coin')} 500</b> ${L('za výhru', 'for a win')} · <b>${flakeSvg('xm-fl-s')} 8</b> ${L('za prohru', 'for a loss')}`}</p>
          <button class="btn btn-green btn-big" id="xmSnowGo">${L('Do koulovačky!', 'Start the fight!')}</button>
          <ul class="xm-how">
            <li>${flakeSvg('xm-fl-s')} ${L('Dárky ze saní v každé bitvě – klepni na ně', 'Presents from the sleigh in every battle – tap them')} <b>${Math.min(D.p || 0, FL_CAP.p)} / ${FL_CAP.p}</b></li>
            <li>${flakeSvg('xm-fl-s')} ${L('Výhra +3, prohra +1', 'Win +3, loss +1')} <b>${Math.min(D.w || 0, FL_CAP.w)} / ${FL_CAP.w}</b></li>
          </ul>
        </div></div>`;
    },
    _bindSnow(App, c, close) {
      const cv = c.querySelector('#xmSnowCv');
      const GHs = G.gearHelpers, sv = App.save;
      this._anim(c, () => {
        const F = this._fit(cv); if (!F) return; const { ctx, w, h } = F, t = performance.now() / 1000;
        ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#2a4a7a'], [0.6, '#8ab0d8'], [0.6, '#eef5fc'], [1, '#c8dcef']]); ctx.fillRect(0, 0, w, h);
        const k = h / 120;
        ['velitel', 'strelec', 'mag'].forEach((role, i) => {
          const uid = unitsOf(role).find(u => G.units[u].faction === sv.faction) || unitsOf(role)[0]; if (!uid) return;
          const fake = { skins: { unit: { [uid]: XA[role] }, weapon: { [uid]: xWeapon(uid) || 'w_zakladni' }, own: {}, ownW: {} } };
          const lk = GHs.look(fake, uid);
          ctx.save(); ctx.translate(w * (0.2 + i * 0.3), h * 0.94); ctx.scale(k * 0.95, k * 0.95);
          Art.drawUnit(ctx, GHs.drawDef(G.units[uid], lk), GHs.palette('player', XA[role], G.units[uid].faction, lk), { x: 0, y: 0, facing: 1, t: t + i, atk: ((t * 0.7 + i * 0.33) % 1.6) < 1 ? ((t * 0.7 + i * 0.33) % 1.6) : -1 });
          ctx.restore();
        });
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(80,110,150,.9)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i / 4) % 1, x = w * 0.15 + ph * w * 0.9, y = h * 0.55 - Math.sin(ph * PI) * h * 0.35; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); for (let i = 0; i < 30; i++) { const X0 = ((i * 0.618) % 1 * w + t * 9) % w, Y0 = ((i * 0.382) % 1 * h + t * 20 * (0.6 + (i % 5) / 8)) % h; ctx.moveTo(X0 + 1.4, Y0); ctx.arc(X0, Y0, 1.4, 0, TAU); } ctx.fill();
      });
      c.querySelector('#xmSnowGo').addEventListener('click', () => { close(); this.startSnow(App); });
    },
    startSnow(App) {
      const save = App.save, Gd = G;
      const foes = Gd.factionOrder.filter(f => Gd.factions[f] && Gd.factions[f].roles && f !== 'spojenectvi');
      const ef = foes[Math.floor(Math.random() * foes.length)] || 'kralovstvi';
      const lvl = Math.max(1, Math.min(14, Gd.calc.castleLevel(save)));
      App.pickArmy(pf => App.startBattle({ playFaction: pf, mode: 'training', xmas: 'snih', xmasSnow: true,
        title: L('Vánoční koulovačka', 'Christmas Snowball Fight'), difficulty: Math.min(1.6, 0.8 + lvl * 0.05),
        enemyUnits: Gd.factionUnits(ef), enemyFaction: ef, theme: 'sever', enemyName: L('Krampusova banda', 'Krampus Gang'),
        enemyCastleSkin: 'temna', enemyUnitSkin: 'stinovy', enemyCastleLevel: Math.max(2, lvl - 1), weather: 'snih',
        tweak: b => { b.o.xmasSnow = true; b.o.weather = 'snih'; } }));
    },
    /* ---------- po bitvě (volá main.js) ---------- */
    onBattleEnd(App, cfg, res) {
      if (!active() || !cfg || cfg.film || res.reason === 'spojeni') return null;
      const save = App.save, S = state(save), out = { rewards: [], note: '' };
      const b = App.battle, got = b && b._xm ? b._xm.got : 0;
      const fw = addFlakes(save, res.win ? 3 : 1, 'w');
      let total = got + fw;
      if (cfg.xmas === 'snih') {
        if (S.snowDay !== dayKey()) {
          S.snowDay = dayKey();
          const f = res.win ? 20 : 8; S.fl += f; total += f;
          if (res.win) { save.gold += 500; out.rewards.push(`<span class="pill">${ico('coin')} +500</span>`); }
        }
        out.note = res.win ? L('Krampusova banda prchá! Santa děkuje za pomoc s dárky. 🎄', 'The Krampus gang flees! Santa thanks you for helping with the presents. 🎄')
          : L('Krampus tentokrát vyhrál. Zkus to znovu – dárky ze saní se počítají i tak!', 'Krampus won this time. Try again – the sleigh presents still count!');
        out.replace = true;
      }
      if (total > 0) out.rewards.push(`<span class="pill xm-pill">${flakeSvg('xm-fl-s')} +${total}</span>`);
      if (got > 0 && !out.note) out.note = L(`Sebral jsi dárky ze Santových saní: +${got} vloček.`, `You collected presents from Santa’s sleigh: +${got} snowflakes.`);
      if (checkPet(App)) setTimeout(() => this.petModal(App), 900);
      return out;
    },
    /* ---------- Santův obchůdek ---------- */
    _shopItems() {
      const it = ROLES.map(role => ({ id: 'set_' + role, role, fl: 120, gems: 480, name: L(SET_N[role][0], SET_N[role][1]), sub: L(`Zbroj a zbraň pro ${ROLE_N[role][0]} všech národů`, `Armor and weapon for ${ROLE_N[role][1]} of all nations`) }));
      it.push({ id: 'castle', fl: 200, gems: 650, name: XCASTLE.name, sub: L('Hrad zabalený jako dárek', 'A castle wrapped like a present') });
      it.push({ id: 'decor', fl: 60, gems: 250, name: XDECOR.name, sub: L('Věnec, girlandy a stromky', 'Wreath, garlands and trees') });
      it.push({ id: 'bundle', gems: 2600, name: L('Velký vánoční balík', 'Grand Christmas Bundle'), sub: L('Všech 6 sad + Vánoční palác + výzdoba · sleva 30 %', 'All 6 sets + Christmas Palace + decorations · 30% off'), wide: true });
      return it;
    },
    _owned(save, it) {
      const O = G.skinOwn; O.ensure(save);
      const setOwn = role => unitsOf(role).every(u => O.has(save, u, XA[role]) && (!xWeapon(u) || O.hasW(save, u, xWeapon(u))));
      if (it.role) return setOwn(it.role);
      if (it.id === 'castle') return (save.skins.ownedCastle || []).includes('vanocni');
      if (it.id === 'decor') return (save.ownedDecor || []).includes('xm_vyzdoba');
      if (it.id === 'bundle') return ROLES.every(setOwn) && (save.skins.ownedCastle || []).includes('vanocni') && (save.ownedDecor || []).includes('xm_vyzdoba');
      return false;
    },
    _shopHtml(save) {
      const S = state(save);
      return `<p class="xm-note">${L('Vánoční zboží je k mání jen do 31. prosince. Co koupíš, zůstane ti navždy.', 'Christmas goods are only available until 31 December. Whatever you buy is yours forever.')}</p>
        <div class="xm-shop">${this._shopItems().map(it => { const own = this._owned(save, it);
          return `<article class="xm-card ${it.wide ? 'wide' : ''} ${own ? 'own' : ''}">
            <canvas data-xshop="${it.id}"></canvas>
            <div class="xm-card-t"><b>${esc(it.name)}</b><small>${esc(it.sub)}</small></div>
            <div class="xm-buy">${own ? `<span class="xm-ok">✓ ${L('Máš', 'Owned')}</span>` : `${it.fl ? `<button class="btn btn-sm btn-gold" data-xbuy="${it.id}" data-k="fl" ${S.fl < it.fl ? 'disabled' : ''}>${flakeSvg('xm-fl-s')} ${it.fl}</button>` : ''}<button class="btn btn-sm btn-green" data-xbuy="${it.id}" data-k="gems" ${save.gems < it.gems ? 'disabled' : ''}>${ico('gem')} ${fmt(it.gems)}</button>`}</div>
          </article>`; }).join('')}</div>`;
    },
    _paintShop(cv, id, save) {
      const F = this._fit(cv); if (!F) return; const { ctx, w, h } = F;
      ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#1c3a6e'], [0.7, '#4a78a8'], [0.7, '#eef5fc'], [1, '#c8dcef']]); ctx.fillRect(0, 0, w, h);
      const fac = (G.factions[save.faction] || {}).castleStyle || 'evropa';
      const drawCastleAt = (x, k) => { const img = A.castleImage('player', 'vanocni', 4, 2, fac); ctx.save(); ctx.translate(x, h * 0.86); ctx.scale(k, k); A.drawCastle(ctx, img, img.w / 2, 0, 1, performance.now() / 1000, 1, '#2f62b8'); ctx.restore(); };
      if (id === 'castle') return drawCastleAt(w / 2, (h * 0.8) / 420);
      if (id === 'decor') { const img = A.castleImage('player', save.skins.castle || 'kralovsky', 4, 2, fac, { decor: { xm_vyzdoba: true }, emblem: 'lilie' }); const k = (h * 0.8) / 420; ctx.save(); ctx.translate(w / 2, h * 0.86); ctx.scale(k, k); A.drawCastle(ctx, img, img.w / 2, 0, 1, 0.3, 1, '#2f62b8'); ctx.restore(); return; }
      const roles = id === 'bundle' ? ROLES : [id.slice(4)];
      const GHs = G.gearHelpers;
      const units = id === 'bundle' ? roles.map(r => unitsOf(r).find(u => G.units[u].faction === save.faction) || unitsOf(r)[0]) : unitsOf(roles[0]);
      if (id === 'bundle') drawCastleAt(w * 0.5, (h * 0.7) / 420);
      units.forEach((uid, i) => {
        if (!uid) return; const role = G.units[uid].roleKey;
        const fake = { skins: { unit: { [uid]: XA[role] }, weapon: { [uid]: xWeapon(uid) || 'w_zakladni' }, own: {}, ownW: {} } };
        const lk = GHs.look(fake, uid), pal = GHs.palette('player', XA[role], G.units[uid].faction, lk);
        const n = units.length, k = h / 118 * (pal.mount ? 0.62 : 0.8) * (id === 'bundle' ? 0.8 : 1);
        ctx.save(); ctx.translate(w * ((i + 0.5) / n) - (pal.mount ? 8 : 0), h * 0.93); ctx.scale(k, k);
        Art.drawUnit(ctx, GHs.drawDef(G.units[uid], lk), pal, { x: 0, y: 0, facing: 1, t: 0.8 + i });
        ctx.restore();
      });
    },
    _bindShop(App, c, close) {
      const save = App.save, S = state(save);
      c.querySelectorAll('canvas[data-xshop]').forEach(cv => requestAnimationFrame(() => this._paintShop(cv, cv.dataset.xshop, save)));
      c.querySelectorAll('[data-xbuy]').forEach(b => b.addEventListener('click', () => {
        const it = this._shopItems().find(x => x.id === b.dataset.xbuy); if (!it || this._owned(save, it)) return;
        const k = b.dataset.k;
        if (k === 'fl') { if (S.fl < it.fl) return; S.fl -= it.fl; } else { if (save.gems < it.gems) { App.toast(t('not_enough')); return; } save.gems -= it.gems; }
        let got = [];
        const add = r => { got = got.concat(grant(App, r)); };
        if (it.role) add({ set: it.role, a: 1, w: 1 });
        if (it.id === 'castle' || it.id === 'bundle') add({ castle: 1 });
        if (it.id === 'decor' || it.id === 'bundle') add({ decor: 1 });
        if (it.id === 'bundle') ROLES.forEach(r => { got = got.concat(grant(App, { set: r, a: 1, w: 1 }, true)); });
        App.persist(); App.refreshTop();
        this._rewards(App, it.name, got, () => this.open(App, 'shop'));
      }));
    },
    /* ---------- upozornění v Android aplikaci (id 201–224) ---------- */
    async notify() {
      const SI = window.Sireni, LN = SI && SI._ln && SI._ln(); if (!LN) return;
      try {
        const p = await LN.checkPermissions(); if (!p || p.display !== 'granted') return;
        const ids = []; for (let i = 201; i <= 224; i++) ids.push({ id: i });
        await LN.cancel({ notifications: ids }).catch(() => {});
        if (!active()) return;
        const next = today().d + 1; if (next > 24) return;
        const at = new Date(); at.setDate(at.getDate() + 1); at.setHours(18, 0, 0, 0);
        await LN.schedule({ notifications: [{ id: 200 + next, title: L('🎄 Dnešní adventní okénko je připravené', '🎄 Today’s advent door is ready'),
          body: L(`Otevři okénko č. ${next} a vyzvedni si vánoční dárek.`, `Open door no. ${next} and claim your Christmas gift.`), schedule: { at } }] });
      } catch (e) { /* nic */ }
    }
  };

  /* ---------- obchod a editor hradu: vánoční zboží jen pro majitele ---------- */
  function hideFor(App, el) {
    const save = App.save; if (!save || !el) return;
    const ownC = (save.skins.ownedCastle || []).includes('vanocni'), ownD = (save.ownedDecor || []).includes('xm_vyzdoba');
    if (!ownC) el.querySelectorAll('[data-skincastle="vanocni"],[data-mat="vanocni"],[data-matcv="vanocni"]').forEach(n => { const a = n.closest('article,.mat'); (a || n).remove(); });
    if (!ownD) {
      el.querySelectorAll('[data-deccv="xm_vyzdoba"],[data-dbuy="xm_vyzdoba"],[data-buydecor="xm_vyzdoba"],[data-decor="xm_vyzdoba"]').forEach(n => { const a = n.closest('article,.dec-row'); (a || n).remove(); });
    }
  }
  window.addEventListener('load', () => {
    const SC = window.Screens, App = window.App;
    if (SC) ['obchod', 'stavitel'].forEach(k => { const f = SC[k]; if (typeof f === 'function') SC[k] = function (App2) { const r = f.apply(this, arguments); try { hideFor(App2, App2.screenEl); } catch (e) { /* nic */ } return r; }; });
    if (App && App.current && App.current !== 'hrad' && App.screenEl) hideFor(App, App.screenEl);
    document.addEventListener('visibilitychange', () => { if (document.hidden && active()) V.notify(); });
    if (App && App.save) petRegister(App.save);
  });
  window.Vanoce = V;
})();
