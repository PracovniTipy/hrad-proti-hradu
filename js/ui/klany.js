/* =========================================================================
   KLANY (Clans)
   - jen registrovaní hráči (hosté dostanou pozvánku k registraci)
   - Můj klan · Hledat · Žebříček (okno s kartami)
   - klanový týden: skóre = součet výher členů od vstupu do klanu, truhly 50/150/300,
     odměny za umístění klanu se vyzvednou příští týden
   - pokladna: dary zlata → úroveň klanu → +2 % zlata z bitev za úroveň (max +10 %)
   - chat jen z předpřipravených zpráv a emocí (bezpečné, bez moderace)
   - vlajka klanu na hradu v bitvě
   Pravda je na serveru (RPC hra_klan_*, migrace supabase/migrations/…_hra_klany.sql).
   Na herních portálech (window.CW_PORTAL) se nic nezobrazuje. Bez internetu se ukáže
   uložený klan (save.klan) a vlajka i bonus fungují dál.
   ========================================================================= */
(function () {
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;   // překlad: js/i18n_l.js
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const portal = () => !!window.CW_PORTAL;
  const online = () => !!window.Ucet && navigator.onLine !== false;
  const reg = () => !!(window.Ucet && Ucet.logged() && !Ucet.guest());
  const MAX = 30, GOALS = [50, 150, 300], LVL = [0, 10000, 30000, 75000, 150000, 300000], DON = 5000;
  const CHEST = [{ gold: 1000, gems: 20 }, { gold: 2000, gems: 40 }, { gold: 4000, gems: 80 }];
  const icon = n => `<i class="kl-i">${window.ico ? ico(n) : ''}</i>`;

  const EMBLEMS = [
    ['lilie', 'Lilie', 'Lily'], ['lev', 'Lev', 'Lion'], ['orel', 'Orel', 'Eagle'], ['kriz', 'Kříž', 'Cross'],
    ['slunce', 'Slunce', 'Sun'], ['hvezda', 'Hvězda', 'Star'], ['havran', 'Havran', 'Raven'], ['sekery', 'Sekery', 'Axes'],
    ['lebka', 'Lebka', 'Skull'], ['koruna', 'Koruna', 'Crown'], ['mec', 'Meč', 'Sword'], ['vez', 'Věž', 'Tower']
  ];
  const COLORS = ['#c0392b', '#2f62b8', '#2e7d4a', '#c9962a', '#6a3fb5', '#1f8a8a', '#d35400', '#2a2a33', '#8a1e3c', '#3d4a5c', '#b03a8a', '#5a3a1e'];
  /* rychlé zprávy – server zná jen kódy (hra._klan_codes) */
  const QUICK = {
    hi: ['Ahoj všichni! 👋', 'Hi everyone! 👋'], gg: ['Dobrá bitva!', 'Good game!'], gl: ['Hodně štěstí!', 'Good luck!'],
    thx: ['Díky!', 'Thanks!'], gj: ['Skvělá práce!', 'Great job!'], attack: ['Do útoku! ⚔️', 'Attack! ⚔️'],
    push: ['Ještě pár výher do truhly!', 'A few more wins for the chest!'], chest: ['Truhla je naše! 🎁', 'The chest is ours! 🎁'],
    welcome: ['Vítej v klanu!', 'Welcome to the clan!'], gn: ['Dobrou noc!', 'Good night!'], wow: ['Páni!', 'Wow!'],
    haha: ['Haha 😄', 'Haha 😄'], help: ['Kdo přispěje do pokladny?', 'Who can chip in to the treasury?'], ready: ['Jsem připraven!', 'Ready for battle!'],
    donate: ['Přispěl jsem do pokladny!', 'I donated to the treasury!'], sorry: ['Promiň!', 'Sorry!']
  };
  const EMO = { e_sword: '⚔️', e_shield: '🛡️', e_fire: '🔥', e_crown: '👑', e_trophy: '🏆', e_muscle: '💪', e_party: '🎉', e_laugh: '😂', e_heart: '❤️', e_thumb: '👍', e_castle: '🏰', e_skull: '💀' };
  const QUICK_BAR = ['hi', 'gg', 'attack', 'push', 'thx', 'welcome', 'gj', 'chest', 'gl', 'ready', 'donate', 'help', 'wow', 'haha', 'sorry', 'gn'];

  const ERRS = {
    klan_guest: ['Klany jsou jen pro registrované hráče.', 'Clans are for registered players only.'],
    klan_already: ['Už jsi v klanu.', 'You are already in a clan.'],
    klan_name_invalid: ['Jméno klanu musí mít 3–20 znaků (písmena, čísla, mezera, - _ .).', 'Clan name must be 3–20 characters (letters, digits, space, - _ .).'],
    klan_tag_invalid: ['Zkratka musí mít 2–4 písmena nebo číslice.', 'The tag must be 2–4 letters or digits.'],
    klan_descr_invalid: ['Popis může mít nejvýš 120 znaků.', 'The description can be at most 120 characters.'],
    klan_name_bad: ['Tohle jméno nejde použít. Zkus jiné.', 'This name cannot be used. Try another one.'],
    klan_descr_bad: ['Popis obsahuje nevhodná slova.', 'The description contains inappropriate words.'],
    klan_emblem_invalid: ['Vyber znak a barvu.', 'Pick an emblem and a colour.'],
    klan_name_taken: ['Klan s tímto jménem už existuje.', 'A clan with this name already exists.'],
    klan_tag_taken: ['Tahle zkratka je už obsazená.', 'This tag is already taken.'],
    klan_slow: ['Pomaleji – zkus to za chvilku.', 'Slow down – try again in a moment.'],
    klan_cooldown: ['Po odchodu z klanu počkej 30 minut, než vstoupíš do dalšího.', 'After leaving a clan, wait 30 minutes before joining another.'],
    klan_none: ['Klan už neexistuje.', 'This clan no longer exists.'],
    klan_full: ['Klan je plný (30/30).', 'The clan is full (30/30).'],
    klan_requests: ['Najednou můžeš mít nejvýš 5 žádostí.', 'You can have at most 5 pending requests.'],
    klan_rights: ['Na to nemáš oprávnění.', 'You do not have permission for that.'],
    klan_officers: ['Klan může mít nejvýš 6 důstojníků.', 'A clan can have at most 6 officers.'],
    klan_amount: ['Daruj 100 až 5 000 zlata.', 'Donate 100 to 5,000 gold.'],
    klan_cap: ['Dnes už jsi daroval maximum (5 000 zlata).', 'You have reached today’s donation limit (5,000 gold).'],
    session_invalid: ['Přihlas se prosím znovu.', 'Please log in again.'],
    network: ['Jsi offline – zkus to, až budeš online.', 'You are offline – try again when online.']
  };
  const errText = e => { const k = (e && e.msg && Object.keys(ERRS).find(x => String(e.msg).includes(x))) || (e && e.code === 'session_invalid' ? 'session_invalid' : 'network'); const v = ERRS[k]; return L(v[0], v[1]); };

  /* ---------- nové znaky (koruna, meč, věž) do Art.drawEmblem ---------- */
  if (window.Art && Art.drawEmblem) {
    const prev = Art.drawEmblem, TAU = Math.PI * 2;
    Art.drawEmblem = function (ctx, id, cx, cy, r, col) {
      if (id !== 'koruna' && id !== 'mec' && id !== 'vez') return prev.apply(this, arguments);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(r / 12, r / 12); ctx.fillStyle = col;
      if (id === 'koruna') {
        ctx.beginPath(); ctx.moveTo(-11, 5); ctx.lineTo(-11, -6); ctx.lineTo(-5.5, -0.5); ctx.lineTo(0, -9); ctx.lineTo(5.5, -0.5); ctx.lineTo(11, -6); ctx.lineTo(11, 5); ctx.closePath(); ctx.fill();
        ctx.fillRect(-11, 6.8, 22, 3.6);
        for (const [x, y] of [[-11, -7.6], [0, -10.6], [11, -7.6]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill(); }
        ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 1.6, 2, 0, TAU); ctx.fill();
      } else if (id === 'mec') {
        ctx.beginPath(); ctx.moveTo(0, -12.5); ctx.lineTo(2.6, -9); ctx.lineTo(2.6, 3.6); ctx.lineTo(-2.6, 3.6); ctx.lineTo(-2.6, -9); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-9, 3.6); ctx.lineTo(9, 3.6); ctx.lineTo(7.6, 6.4); ctx.lineTo(-7.6, 6.4); ctx.closePath(); ctx.fill();
        ctx.fillRect(-1.4, 6.4, 2.8, 4.4); ctx.beginPath(); ctx.arc(0, 11.6, 2.1, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out'; ctx.fillRect(-0.5, -8, 1, 10);
      } else {
        ctx.fillRect(-6.5, -4.5, 13, 16); ctx.fillRect(-8.5, -8, 17, 4.4);
        for (const x of [-8.5, -1.8, 4.9]) ctx.fillRect(x, -11.5, 3.6, 4);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.moveTo(-2.6, 11.5); ctx.lineTo(-2.6, 7); ctx.arc(0, 7, 2.6, Math.PI, 0); ctx.lineTo(2.6, 11.5); ctx.closePath(); ctx.fill();
        ctx.fillRect(-1, -2, 2, 4);
      }
      ctx.restore();
    };
  }

  /* ---------- erb klanu (štít v barvě klanu, zlatý lem, znak) → dataURL v mezipaměti ---------- */
  const shade = (hex, k) => {   // k > 0 zesvětlí, k < 0 ztmaví
    const n = parseInt(String(hex).slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k));
    r = f(r); g = f(g); b = f(b); return `rgb(${r},${g},${b})`;
  };
  function shieldPath(x, w, h, ox, oy) {
    x.beginPath(); x.moveTo(ox + w * 0.1, oy + h * 0.06); x.lineTo(ox + w * 0.9, oy + h * 0.06);
    x.quadraticCurveTo(ox + w * 0.92, oy + h * 0.64, ox + w * 0.5, oy + h * 0.96);
    x.quadraticCurveTo(ox + w * 0.08, oy + h * 0.64, ox + w * 0.1, oy + h * 0.06); x.closePath();
  }
  /* znak na vlastní vrstvě (některé znaky „vykrajují“ destination-out a prorazily by štít) */
  function emblemLayer(emblem, r, col) {
    const n = Math.ceil(r * 2.4), d = 2, c = document.createElement('canvas'); c.width = c.height = n * d;
    const x = c.getContext('2d'); x.scale(d, d);
    if (window.Art && Art.drawEmblem) Art.drawEmblem(x, emblem, n / 2, n / 2, r, col);
    return { c, n };
  }
  function drawCrest(x, emblem, color, s) {
    shieldPath(x, s, s, 0, 0);
    const rim = x.createLinearGradient(0, 0, 0, s); rim.addColorStop(0, '#fff1b8'); rim.addColorStop(0.35, '#e8b84a'); rim.addColorStop(0.7, '#9a6a1c'); rim.addColorStop(1, '#e8b84a');
    x.fillStyle = rim; x.fill();
    const i = s * 0.075; shieldPath(x, s - i * 2, s - i * 2.1, i, i * 1.05);
    const g = x.createLinearGradient(0, 0, s * 0.6, s); g.addColorStop(0, shade(color, 0.28)); g.addColorStop(0.55, color); g.addColorStop(1, shade(color, -0.45));
    x.fillStyle = g; x.fill();
    x.save(); x.clip();
    const sh = x.createLinearGradient(0, 0, s, s * 0.5); sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); x.fillStyle = sh; x.fillRect(0, 0, s, s * 0.55);
    x.restore();
    x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = s * 0.04; x.shadowOffsetY = s * 0.02;
    const L1 = emblemLayer(emblem, s * 0.25, '#fbe9b8'); x.drawImage(L1.c, s / 2 - L1.n / 2, s * 0.45 - L1.n / 2, L1.n, L1.n);
    x.restore();
  }
  const _crest = {};
  function crest(emblem, color, px) {
    const k = emblem + color + px;
    if (_crest[k]) return _crest[k];
    try {
      const d = 2, c = document.createElement('canvas'); c.width = c.height = px * d;
      const x = c.getContext('2d'); x.scale(d, d); drawCrest(x, emblem || 'lilie', color || COLORS[1], px);
      return (_crest[k] = c.toDataURL('image/png'));
    } catch (e) { return ''; }
  }
  const crestImg = (k, px, cls) => `<img class="kl-crest ${cls || ''}" src="${crest(k.emblem, k.color, px)}" width="${px}" height="${px}" alt="">`;
  const lvlOf = t => { let l = 1; for (let i = 1; i < LVL.length; i++) if (t >= LVL[i]) l = i + 1; return l; };
  const bonusOf = l => Math.min(10, Math.max(0, (l - 1) * 2));
  const ago = ts => {
    if (!ts) return L('dávno', 'long ago');
    const m = (Date.now() - new Date(ts)) / 60000;
    if (m < 5) return '';
    if (m < 60) return L(`před ${Math.round(m)} min`, `${Math.round(m)} min ago`);
    if (m < 1440) return L(`před ${Math.round(m / 60)} h`, `${Math.round(m / 60)} h ago`);
    return L(`před ${Math.round(m / 1440)} d`, `${Math.round(m / 1440)} d ago`);
  };
  const left = ends => { const ms = Math.max(0, new Date(ends) - Date.now()), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24; return L(`${d} d ${h} h`, `${d}d ${h}h`); };
  const ROLE = { leader: ['Vůdce', 'Leader'], officer: ['Důstojník', 'Officer'], member: ['Člen', 'Member'] };
  const roleName = r => L((ROLE[r] || ROLE.member)[0], (ROLE[r] || ROLE.member)[1]);
  const roleIco = r => r === 'leader' ? '<b class="kl-role kl-role-l" title="">♛</b>' : r === 'officer' ? '<b class="kl-role kl-role-o">★</b>' : '';

  const BTN_SVG = `<svg viewBox="0 0 120 100"><path d="M26 6v88" stroke="#1a0e06" stroke-width="7" stroke-linecap="round"/><path d="M26 6v88" stroke="#d9a646" stroke-width="3.4" stroke-linecap="round"/><circle cx="26" cy="7" r="6" fill="#ffd24a" stroke="#1a0e06" stroke-width="3"/><path d="M30 14h60l-9 17 9 17H30z" fill="#2f62b8" stroke="#1a0e06" stroke-width="4" stroke-linejoin="round"/><path d="M30 14h60l-3 6H30z" fill="#6ea8ff" opacity=".55"/><path d="M45 37V24l7 6 6-9 6 9 7-6v13z" fill="#ffd24a" stroke="#1a0e06" stroke-width="2.6" stroke-linejoin="round"/><path d="M56 62l14 5v10c0 9-6 14-14 17-8-3-14-8-14-17V67z" fill="#d6453c" stroke="#1a0e06" stroke-width="3.4" stroke-linejoin="round"/><path d="M84 58l14 5v10c0 9-6 14-14 17-8-3-14-8-14-17V63z" fill="#2e7d4a" stroke="#1a0e06" stroke-width="3.4" stroke-linejoin="round"/><path d="M70 66l14 5v10c0 9-6 14-14 17-8-3-14-8-14-17V71z" fill="#ffd24a" stroke="#1a0e06" stroke-width="3.4" stroke-linejoin="round"/><path d="M70 74v14M64 80h12" stroke="#8a5a10" stroke-width="3" stroke-linecap="round"/></svg>`;

  const Klany = {
    info: null, infoAt: 0, _p: null,
    available() { return !portal() && !!window.Ucet; },
    /* uložený klan (offline, vlajka v bitvě, bonus zlata) */
    cached(App) { const k = App && App.save && App.save.klan; return k && k.id && (Date.now() - (k.ts || 0) < 14 * 864e5) ? k : null; },
    _cache(App, k) {
      if (!App || !App.save) return;
      const old = JSON.stringify(App.save.klan || null);
      App.save.klan = k ? { id: k.id, name: k.name, tag: k.tag, emblem: k.emblem, color: k.color, level: k.level || 1, role: k.role, ts: Date.now() } : null;
      const now = JSON.stringify(App.save.klan || null);
      if (old.replace(/"ts":\d+/, '') !== now.replace(/"ts":\d+/, '') || !k) App.persist();
    },
    async load(App, force) {
      if (!this.available() || !reg() || !online()) return this.info;
      if (!force && this.info && Date.now() - this.infoAt < 20000) return this.info;
      if (this._p) return this._p;
      this._p = Ucet.klan('info').then(r => { this.info = r; this.infoAt = Date.now(); this._cache(App, r && r.klan); return r; })
        .finally(() => { this._p = null; });
      return this._p;
    },
    claimable(i) { i = i || this.info; return !!(i && i.reward && (i.reward.gold > 0 || i.reward.gems > 0)); },
    badge(i) { i = i || this.info; return this.claimable(i) || !!(i && i.klan && i.klan.role !== 'member' && (i.klan.requests || []).length); },

    /* ---------- domovská obrazovka ---------- */
    homeButton(App, el) {
      if (!this.available()) return;
      const host = el.querySelector('.hero-live'); if (!host || host.querySelector('.klan-btn')) return;
      const b = document.createElement('button');
      b.className = 'daily-btn klan-btn'; b.id = 'klanBtn';
      b.setAttribute('aria-label', L('Klan', 'Clan'));
      const draw = () => {
        const k = this.cached(App);
        b.innerHTML = `<span class="daily-chest">${BTN_SVG}</span>${k ? `<img class="klan-btn-crest" src="${crest(k.emblem, k.color, 30)}" alt="">` : ''}<span class="daily-lbl">${L('Klan', 'Clan')}</span>${this.badge() ? '<i class="daily-dot">!</i>' : ''}`;
      };
      draw();
      b.addEventListener('click', () => this.open(App));
      host.appendChild(b);
      this.load(App).then(() => { if (b.isConnected) draw(); }).catch(() => {});
    },
    refreshHome(App) { const b = document.querySelector('#screen .klan-btn'); if (b) { b.remove(); if (App.current === 'hrad' && !App.battle) this.homeButton(App, App.screenEl); } },

    /* ---------- po bitvě (main.js): bonus zlata z úrovně klanu + bod pro klan ---------- */
    onBattleEnd(App, cfg, res, goldDelta) {
      const out = { rewards: [] }, k = this.cached(App);
      if (!k || portal() || !cfg || cfg.film) return out;
      const pct = bonusOf(k.level || 1), add = goldDelta > 0 ? Math.round(goldDelta * pct / 100) : 0;
      if (add > 0) { App.save.gold += add; out.rewards.push(`<span class="pill kl-pill">${icon('coin')} +${fmt(add)} · ${L('klan', 'clan')} ${esc(k.tag)}</span>`); }
      if (res && res.win && reg() && online()) out.rewards.push(`<span class="pill kl-pill"><img src="${crest(k.emblem, k.color, 22)}" alt=""> +1 ${L('pro klan', 'for clan')}</span>`);
      this.infoAt = 0;   // příště načíst čerstvé skóre
      return out;
    },

    /* ---------- vlajka klanu na hradu v bitvě ---------- */
    _flag: null,
    flagCanvas(k) {
      const key = k.emblem + k.color;
      if (this._flag && this._flag.key === key) return this._flag.cv;
      const W = 30, H = 44, d = 2, cv = document.createElement('canvas'); cv.width = W * d; cv.height = H * d;
      const x = cv.getContext('2d'); x.scale(d, d);
      x.beginPath(); x.moveTo(1, 0); x.lineTo(W - 1, 0); x.lineTo(W - 1, H - 2); x.lineTo(W / 2, H - 10); x.lineTo(1, H - 2); x.closePath();
      const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, shade(k.color, -0.35)); g.addColorStop(0.45, shade(k.color, 0.15)); g.addColorStop(1, shade(k.color, -0.3));
      x.fillStyle = g; x.fill(); x.lineWidth = 1.6; x.strokeStyle = '#1a0e06'; x.stroke();
      x.fillStyle = '#e8b84a'; x.fillRect(1, 2, W - 2, 2); x.fillRect(1, H - 16, W - 2, 1.4);
      const L1 = emblemLayer(k.emblem, 8.5, '#fbe9b8'); x.drawImage(L1.c, W / 2 - L1.n / 2, 15 - L1.n / 2, L1.n, L1.n);
      this._flag = { key, cv };
      return cv;
    },
    drawFlag(b, ctx, side, t) {
      const k = this.cached(window.App); if (!k || portal() || !side || !side.castleImg) return;
      const img = side.castleImg, gy = (window.GameData && GameData.battleConfig && GameData.battleConfig.groundY) || 0;
      const x0 = side.castle.front - img.w + 2;
      let fx = x0 + img.w * 0.5, fy = gy - img.h + 10;
      if (img.flags && img.flags.length) { const f = img.flags.reduce((a, c) => (c.y < a.y ? c : a), img.flags[0]); fx = x0 + f.x; fy = gy - img.h + f.y; }
      const s = Math.max(1, Math.min(1.8, img.h / 300)), top = fy - 30 - 52 * s;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(fx, fy - 24); ctx.lineTo(fx, top); ctx.lineWidth = 3.2; ctx.strokeStyle = '#1a0e06'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx, fy - 24); ctx.lineTo(fx, top); ctx.lineWidth = 1.6; ctx.strokeStyle = '#c9a050'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx - 17 * s, top + 3); ctx.lineTo(fx + 17 * s, top + 3); ctx.lineWidth = 2.6; ctx.strokeStyle = '#1a0e06'; ctx.stroke();
      ctx.beginPath(); ctx.arc(fx, top - 1, 3, 0, Math.PI * 2); ctx.fillStyle = '#ffd24a'; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
      const cv = this.flagCanvas(k), w = 30 * s, h = 44 * s;
      ctx.translate(fx, top + 4); ctx.transform(1, 0, Math.sin(t * 2.2) * 0.06, 1, 0, 0);
      ctx.drawImage(cv, -w / 2, 0, w, h);
      ctx.restore();
    },

    /* ---------- okno ---------- */
    open(App, tab) {
      if (!this.available()) return;
      this._tab = tab || (this.cached(App) || (this.info && this.info.klan) ? 'muj' : (reg() ? 'muj' : 'muj'));
      this._view = null;
      App.modal(`<div class="kl-root" data-kl>
          <header class="kl-head">
            <div class="kl-title"><span class="eyebrow">${L('Klany', 'Clans')}</span><h2>${L('Síň klanů', 'Clan Hall')}</h2></div>
            <nav class="kl-tabs" role="tablist">
              <button role="tab" data-kt="muj">${L('Můj klan', 'My clan')}</button>
              <button role="tab" data-kt="hledat">${L('Hledat', 'Search')}</button>
              <button role="tab" data-kt="zebricek">${L('Žebříček', 'Leaderboard')}</button>
            </nav>
            <button class="kl-x" data-close aria-label="${L('Zavřít', 'Close')}">✕</button>
          </header>
          <div class="kl-body" data-kb></div>
        </div>`, (c, close) => {
        const root = c.querySelector('[data-kl]');
        this._root = root; this._close = close; this._App = App;
        root.querySelectorAll('[data-kt]').forEach(b => b.addEventListener('click', () => { this._tab = b.dataset.kt; this._view = null; this.render(); }));
        this.render();
        clearInterval(this._poll);
        this._poll = setInterval(() => {
          if (!root.isConnected) { clearInterval(this._poll); if (App.current === 'hrad') this.refreshHome(App); return; }
          if (this._tab === 'muj' && !this._view && document.visibilityState === 'visible') this.render(true);
        }, 15000);
      });
      if (window.Stat) try { Stat.ev('klan_open', { p: reg() ? 'reg' : 'guest' }); } catch (e) { /* nic */ }
    },
    _body() { return this._root && this._root.isConnected ? this._root.querySelector('[data-kb]') : null; },
    _setTabs() { this._root.querySelectorAll('[data-kt]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.kt === this._tab))); },
    async render(quiet) {
      const body = this._body(); if (!body) return;
      this._setTabs();
      if (this._view === 'create' || this._view === 'edit') return this.renderForm(body);
      if (this._tab === 'hledat') return this.renderSearch(body, quiet);
      if (this._tab === 'zebricek') return this.renderBoard(body, quiet);
      return this.renderMine(body, quiet);
    },
    _loading(body) { body.innerHTML = `<div class="kl-load"><span class="kl-spin"></span>${L('Načítám…', 'Loading…')}</div>`; },
    _offline(body, extra) {
      const k = this.cached(this._App);
      body.innerHTML = `<div class="kl-empty">
          ${k ? crestImg(k, 72, 'kl-crest-xl') : '<div class="kl-empty-art">' + BTN_SVG + '</div>'}
          ${k ? `<h3>${esc(k.name)} <span class="kl-tag">[${esc(k.tag)}]</span></h3>` : ''}
          <p class="muted">${extra || L('Jsi offline. Klan se načte, až budeš zase online. Vlajka i bonus klanu fungují dál.', 'You are offline. Your clan loads when you are back online. Your banner and clan bonus keep working.')}</p>
          <button class="btn" data-kretry>${L('Zkusit znovu', 'Try again')}</button>
        </div>`;
      body.querySelector('[data-kretry]').addEventListener('click', () => this.render());
    },
    _perks() {
      return `<ul class="kl-perks">
          <li><span>🎁</span><div><b>${L('Klanové truhly', 'Clan chests')}</b><small>${L('Společně 50 / 150 / 300 výher za týden', '50 / 150 / 300 team wins per week')}</small></div></li>
          <li><span>🏆</span><div><b>${L('Klanový turnaj', 'Clan tournament')}</b><small>${L('Až 500 drahokamů každému členovi', 'Up to 500 gems for every member')}</small></div></li>
          <li><span>💰</span><div><b>${L('Bonus zlata', 'Gold bonus')}</b><small>${L('Až +10 % zlata z každé bitvy', 'Up to +10% gold from every battle')}</small></div></li>
          <li><span>🚩</span><div><b>${L('Vlajka na hradu', 'Banner on your castle')}</b><small>${L('Erb klanu vlaje v každé bitvě', 'Your clan crest flies in every battle')}</small></div></li>
        </ul>`;
    },
    _guest(body) {
      body.innerHTML = `<div class="kl-hero">
          <div class="kl-hero-art">${['lev', 'orel', 'koruna'].map((e, i) => `<img src="${crest(e, COLORS[[0, 1, 3][i]], 84)}" alt="">`).join('')}</div>
          <div class="kl-hero-txt">
            <h3>${L('Spoj síly s dalšími veliteli', 'Join forces with other commanders')}</h3>
            <p class="muted">${L('Klany jsou pro registrované hráče. Registrace je zdarma, zabere chvilku – a tvůj postup bude v bezpečí na serveru.', 'Clans are for registered players. Registration is free and takes a moment – and your progress stays safe on the server.')}</p>
            ${this._perks()}
            <div class="kl-row"><button class="btn btn-gold" data-kreg>${L('Zaregistrovat se zdarma', 'Register for free')}</button>
            <button class="btn" data-kt2="hledat">${L('Prohlédnout klany', 'Browse clans')}</button></div>
          </div>
        </div>`;
      body.querySelector('[data-kreg]').addEventListener('click', () => { this._close(); UcetUI.open(this._App, 'register'); });
      body.querySelector('[data-kt2]').addEventListener('click', () => { this._tab = 'hledat'; this.render(); });
    },

    /* ---------- Můj klan ---------- */
    async renderMine(body, quiet) {
      if (!reg()) return this._guest(body);
      if (!online()) return this._offline(body);
      if (!quiet && !this.info) this._loading(body);
      let i;
      try { i = await this.load(this._App, true); } catch (e) { if (!quiet) this._offline(body, e && e.code !== 'network' ? errText(e) : null); return; }
      if (body !== this._body() || this._tab !== 'muj' || this._view) return;
      const keepChat = body.querySelector('.kl-chat-list'), atBottom = !keepChat || keepChat.scrollTop + keepChat.clientHeight >= keepChat.scrollHeight - 30;
      if (!i || !i.klan) return this._noClan(body, i);
      const k = i.klan, App = this._App, me = k.role, w = k.week || {}, sc = w.score || 0;
      const lv = k.level || lvlOf(k.treasury), nextT = LVL[lv] || null, prevT = LVL[lv - 1] || 0;
      const lp = nextT ? Math.min(100, (k.treasury - prevT) / (nextT - prevT) * 100) : 100;
      const rw = i.reward || {}, chestP = Math.min(100, sc / GOALS[2] * 100);
      const reqs = me !== 'member' ? (k.requests || []) : [];
      const members = k.members || [];
      body.innerHTML = `<div class="kl-mine">
        <section class="kl-card kl-id">
          ${crestImg(k, 76, 'kl-crest-xl')}
          <div class="kl-id-txt">
            <h3>${esc(k.name)} <span class="kl-tag">[${esc(k.tag)}]</span></h3>
            <div class="kl-chips"><span class="kl-chip kl-chip-gold">${L('Úroveň', 'Level')} ${lv}</span><span class="kl-chip">👥 ${members.length}/${MAX}</span><span class="kl-chip">${k.open ? L('🔓 Otevřený', '🔓 Open') : L('🔒 Na žádost', '🔒 By request')}</span><span class="kl-chip">${roleIco(me)} ${roleName(me)}</span></div>
            ${k.descr ? `<p class="kl-descr">${esc(k.descr)}</p>` : ''}
          </div>
          ${me === 'leader' ? `<button class="btn btn-sm kl-edit" data-kedit>✎ ${L('Upravit', 'Edit')}</button>` : ''}
        </section>
        ${this.claimable(i) ? `<section class="kl-card kl-claim">
          <div class="kl-claim-ico">🎁</div>
          <div><b>${rw.items.some(x => x.kind === 'rank') ? L('Odměna za klanový turnaj!', 'Clan tournament reward!') : L('Klanová truhla je připravená!', 'Your clan chest is ready!')}</b>
          <small>${rw.items.map(x => x.kind === 'rank' ? L(`${x.rank}. místo minulý týden`, `#${x.rank} last week`) : L(`Truhla ${x.tier} (${GOALS[x.tier - 1]} výher)`, `Chest ${x.tier} (${GOALS[x.tier - 1]} wins)`)).join(' · ')}</small></div>
          <div class="kl-claim-r">${rw.gold ? `<span class="kl-amt">${icon('coin')} ${fmt(rw.gold)}</span>` : ''}${rw.gems ? `<span class="kl-amt">${icon('gem')} ${fmt(rw.gems)}</span>` : ''}
          <button class="btn btn-gold" data-kclaim>${L('Vyzvednout', 'Claim')}</button></div>
        </section>` : ''}
        <div class="kl-grid">
          <section class="kl-card kl-week">
            <div class="kl-sec-h"><h4>${L('Klanový týden', 'Clan week')}</h4><small>⏳ ${left(w.ends)}</small></div>
            <div class="kl-week-top"><div class="kl-big">${fmt(sc)}<small>${L('výher', 'wins')}</small></div>${w.rank ? `<div class="kl-rank">#${w.rank}<small>${L('v žebříčku', 'ranking')}</small></div>` : ''}</div>
            <div class="kl-track"><div class="kl-fill" style="width:${chestP}%"></div>
              ${GOALS.map((g, n) => `<div class="kl-goal ${sc >= g ? 'on' : ''}" style="left:${g / GOALS[2] * 100}%"><span class="kl-chest">${sc >= g ? '🎁' : '🔒'}</span><b>${g}</b></div>`).join('')}
            </div>
            <p class="kl-hint">${sc >= GOALS[2] ? L('Všechny truhly odemčené – skvělá práce!', 'All chests unlocked – amazing work!') : L(`Do další truhly chybí <b>${GOALS.find(g => g > sc) - sc}</b> výher. Každá tvoje výhra se počítá!`, `<b>${GOALS.find(g => g > sc) - sc}</b> wins to the next chest. Every win counts!`)}</p>
          </section>
          <section class="kl-card kl-bank">
            <div class="kl-sec-h"><h4>${L('Pokladna', 'Treasury')}</h4><small>+${bonusOf(lv)} % ${L('zlata', 'gold')}</small></div>
            <div class="kl-lvl"><span class="kl-lvl-n">${lv}</span><div class="kl-lvl-bar"><div style="width:${lp}%"></div></div><span class="kl-lvl-n kl-lvl-next">${nextT ? lv + 1 : '★'}</span></div>
            <p class="kl-hint">${icon('coin')} ${fmt(k.treasury)}${nextT ? ` / ${fmt(nextT)} · ${L(`úroveň ${lv + 1} = +${bonusOf(lv + 1)} % zlata z bitev`, `level ${lv + 1} = +${bonusOf(lv + 1)}% battle gold`)}` : ` · ${L('maximální úroveň!', 'max level!')}`}</p>
            <div class="kl-don">${[500, 1000, 5000].map(a => `<button class="btn btn-sm" data-kdon="${a}" ${a > k.don_left || a > (App.save.gold || 0) ? 'disabled' : ''}>${icon('coin')} ${fmt(a)}</button>`).join('')}</div>
            <small class="muted">${L(`Dnes můžeš darovat ještě ${fmt(k.don_left)} zlata.`, `You can donate ${fmt(k.don_left)} more gold today.`)}</small>
          </section>
        </div>
        <div class="kl-grid kl-grid-2">
          <section class="kl-card kl-members">
            <div class="kl-sec-h"><h4>${L('Členové', 'Members')} <small>${members.length}/${MAX}</small></h4><small>${L('výhry tento týden', 'wins this week')}</small></div>
            ${reqs.length ? `<div class="kl-reqs"><b>${L('Žádosti o vstup', 'Join requests')}</b>${reqs.map(r => `<div class="kl-req"><span>${esc(r.name)}</span><small>⚔ ${r.wins}</small><button class="btn btn-sm btn-green" data-kacc="${esc(r.id)}">✓</button><button class="btn btn-sm" data-krej="${esc(r.id)}">✕</button></div>`).join('')}</div>` : ''}
            <ol class="kl-mlist">${members.map((m, n) => {
              const on = !ago(m.seen), mine = m.id === k.me;
              const can = !mine && (me === 'leader' || (me === 'officer' && m.role === 'member'));
              return `<li class="${mine ? 'me' : ''} ${can ? 'can' : ''}" ${can ? `data-kmem="${esc(m.id)}" tabindex="0" role="button"` : ''}>
                <span class="kl-pos">${n + 1}</span><span class="kl-dot ${on ? 'on' : ''}"></span>
                <span class="kl-mname">${roleIco(m.role)}${esc(m.name)}${mine ? ` <i>(${L('ty', 'you')})</i>` : ''}<small>${on ? L('online', 'online') : ago(m.seen)}</small></span>
                <b class="kl-mwins">⚔ ${m.wins}</b>${can ? '<span class="kl-more">⋯</span>' : ''}</li>`;
            }).join('')}</ol>
          </section>
          <section class="kl-card kl-chat">
            <div class="kl-sec-h"><h4>${L('Klanový pokřik', 'Clan chat')}</h4><small>${L('rychlé zprávy', 'quick messages')}</small></div>
            <div class="kl-chat-list">${(k.chat || []).map(z => this._msg(z)).join('') || `<p class="muted kl-chat-empty">${L('Pozdrav svůj klan!', 'Say hi to your clan!')}</p>`}</div>
            <div class="kl-quick">${QUICK_BAR.map(c => `<button data-kq="${c}">${esc(L(QUICK[c][0], QUICK[c][1]))}</button>`).join('')}</div>
            <div class="kl-emo">${Object.keys(EMO).map(c => `<button data-kq="${c}" aria-label="${c.slice(2)}">${EMO[c]}</button>`).join('')}</div>
          </section>
        </div>
        <div class="kl-foot"><button class="kl-link kl-danger" data-kleave>${L('Opustit klan', 'Leave clan')}</button></div>
      </div>`;
      const list = body.querySelector('.kl-chat-list');
      if (list && (atBottom || !quiet)) list.scrollTop = list.scrollHeight;
      if (window.applyIcons) applyIcons(body);
      this._bindMine(body, i);
    },
    _msg(z) {
      if (z.kind === 'sys') {
        const n = '<b>' + esc(z.name || z.arg || '') + '</b>', a = esc(z.arg || '');
        const T = {
          created: L(`${n} založil klan 🏰`, `${n} founded the clan 🏰`), join: L(`${n} se přidal ke klanu 👋`, `${n} joined the clan 👋`),
          leave: L(`${n} opustil klan`, `${n} left the clan`), kick: L(`${n} byl z klanu vyloučen`, `${n} was removed from the clan`),
          officer: L(`${n} je nový důstojník ★`, `${n} is a new officer ★`), leader: L(`${n} je nový vůdce ♛`, `${n} is the new leader ♛`),
          donate: L(`<b>${esc(z.name || '')}</b> daroval ${fmt(+a)} zlata do pokladny 💰`, `<b>${esc(z.name || '')}</b> donated ${fmt(+a)} gold 💰`),
          level: L(`Klan dosáhl úrovně ${a}! Bonus zlata +${bonusOf(+a)} % ✨`, `The clan reached level ${a}! Gold bonus +${bonusOf(+a)}% ✨`),
          chest: L(`Klanová truhla ${a} odemčena! (${GOALS[+a - 1] || ''} výher) 🎁`, `Clan chest ${a} unlocked! (${GOALS[+a - 1] || ''} wins) 🎁`)
        };
        return `<div class="kl-sys">${T[z.code] || ''}</div>`;
      }
      const txt = EMO[z.code] ? `<span class="kl-big-emo">${EMO[z.code]}</span>` : esc(QUICK[z.code] ? L(QUICK[z.code][0], QUICK[z.code][1]) : '');
      const tm = new Date(z.at), hh = String(tm.getHours()).padStart(2, '0') + ':' + String(tm.getMinutes()).padStart(2, '0');
      return `<div class="kl-msg ${z.mine ? 'mine' : ''} ${EMO[z.code] ? 'emo' : ''}"><small>${z.mine ? '' : esc(z.name || '?') + ' · '}${hh}</small><span>${txt}</span></div>`;
    },
    async _act(btn, fn, args, ok) {
      if (btn) btn.disabled = true;
      try { const r = await Ucet.klan(fn, args); if (ok) await ok(r); this.infoAt = 0; return r; }
      catch (e) { this._App.toast(errText(e)); if (btn) btn.disabled = false; return null; }
    },
    _bindMine(body, i) {
      const App = this._App, k = i.klan;
      const ed = body.querySelector('[data-kedit]'); if (ed) ed.addEventListener('click', () => { this._view = 'edit'; this.render(); });
      const cl = body.querySelector('[data-kclaim]');
      if (cl) cl.addEventListener('click', () => this._act(cl, 'claim', {}, r => {
        if (!r || (!r.gold && !r.gems)) return this.render();
        App.save.gold += r.gold | 0; App.save.gems += r.gems | 0; App.persist();
        if (window.Zvuk && Zvuk.play) try { Zvuk.play('coin', 1); } catch (e) { /* nic */ }
        this._celebrate(r);
        if (window.Stat) try { Stat.ev('klan_claim', { p: r.items.length }); } catch (e) { /* nic */ }
      }));
      body.querySelectorAll('[data-kdon]').forEach(b => b.addEventListener('click', () => {
        const a = +b.dataset.kdon;
        if ((App.save.gold || 0) < a) return App.toast(L('Nemáš dost zlata.', 'Not enough gold.'));
        this._act(b, 'donate', { p_amount: a }, r => {
          App.save.gold -= a; App.persist();
          App.toast(L(`Díky! Daroval jsi ${fmt(a)} zlata do pokladny.`, `Thanks! You donated ${fmt(a)} gold.`));
          if (r && r.level > (k.level || 1)) App.toast(L(`Klan dosáhl úrovně ${r.level}! 🎉`, `Your clan reached level ${r.level}! 🎉`));
          return this.render(true);
        });
      }));
      body.querySelectorAll('[data-kq]').forEach(b => b.addEventListener('click', () => {
        if (this._sendLock) return; this._sendLock = true; setTimeout(() => { this._sendLock = false; }, 3000);
        body.querySelectorAll('[data-kq]').forEach(x => x.classList.add('cool'));
        setTimeout(() => body.querySelectorAll('[data-kq]').forEach(x => x.classList.remove('cool')), 3000);
        this._act(null, 'send', { p_code: b.dataset.kq }, () => this.render(true));
      }));
      body.querySelectorAll('[data-kacc],[data-krej]').forEach(b => b.addEventListener('click', () => {
        const acc = !!b.dataset.kacc;
        this._act(b, 'answer', { p_acc: b.dataset.kacc || b.dataset.krej, p_accept: acc }, () => this.render(true));
      }));
      body.querySelectorAll('[data-kmem]').forEach(li => {
        const go = () => this._memberMenu(li.dataset.kmem, k);
        li.addEventListener('click', go); li.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      });
      body.querySelector('[data-kleave]').addEventListener('click', () => this._confirm(
        L('Opustit klan?', 'Leave the clan?'),
        k.role === 'leader' && (k.members || []).length > 1 ? L('Vedení převezme nejstarší důstojník nebo člen. Do dalšího klanu můžeš vstoupit za 30 minut.', 'Leadership passes to the most senior officer or member. You can join another clan in 30 minutes.')
          : L('Do dalšího klanu můžeš vstoupit za 30 minut. Odměny za tento týden ti zůstanou.', 'You can join another clan in 30 minutes. This week’s rewards stay yours.'),
        L('Opustit', 'Leave'), () => this._act(null, 'leave', {}, () => { this.info = null; this._cache(App, null); this.render(); })));
    },
    _confirm(title, text, okLbl, ok) {
      const body = this._body(); if (!body) return;
      const ov = document.createElement('div'); ov.className = 'kl-sheet';
      ov.innerHTML = `<div class="kl-sheet-card"><h4>${title}</h4><p class="muted">${text}</p><div class="kl-row"><button class="btn" data-no>${L('Zpět', 'Back')}</button><button class="btn kl-btn-danger" data-yes>${okLbl}</button></div></div>`;
      this._root.appendChild(ov);
      ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-no]')) ov.remove(); });
      ov.querySelector('[data-yes]').addEventListener('click', () => { ov.remove(); ok(); });
    },
    _memberMenu(id, k) {
      const m = (k.members || []).find(x => x.id === id); if (!m) return;
      const me = k.role, ov = document.createElement('div'); ov.className = 'kl-sheet';
      const acts = [];
      if (me === 'leader' && m.role === 'member') acts.push(['officer', L('★ Povýšit na důstojníka', '★ Promote to officer'), '']);
      if (me === 'leader' && m.role === 'officer') acts.push(['member', L('Sesadit na člena', 'Demote to member'), '']);
      if (me === 'leader') acts.push(['leader', L('♛ Předat vedení klanu', '♛ Make clan leader'), '']);
      acts.push(['kick', L('Vyloučit z klanu', 'Remove from clan'), 'kl-btn-danger']);
      ov.innerHTML = `<div class="kl-sheet-card"><h4>${roleIco(m.role)} ${esc(m.name)}</h4><p class="muted">${roleName(m.role)} · ⚔ ${m.wins} ${L('výher tento týden', 'wins this week')} · ${icon('coin')} ${fmt(m.donated)}</p>
        <div class="kl-col">${acts.map(a => `<button class="btn ${a[2]}" data-ma="${a[0]}">${a[1]}</button>`).join('')}<button class="btn" data-no>${L('Zpět', 'Back')}</button></div></div>`;
      this._root.appendChild(ov);
      if (window.applyIcons) applyIcons(ov);
      ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-no]')) ov.remove(); });
      ov.querySelectorAll('[data-ma]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.ma; ov.remove();
        const run = () => a === 'kick' ? this._act(null, 'kick', { p_acc: id }, () => this.render(true)) : this._act(null, 'role', { p_acc: id, p_role: a }, () => this.render(true));
        if (a === 'kick') this._confirm(L(`Vyloučit hráče ${esc(m.name)}?`, `Remove ${esc(m.name)}?`), L('Hráč bude moct požádat o vstup znovu.', 'The player can ask to join again.'), L('Vyloučit', 'Remove'), run);
        else if (a === 'leader') this._confirm(L(`Předat vedení hráči ${esc(m.name)}?`, `Make ${esc(m.name)} the leader?`), L('Ty se staneš důstojníkem.', 'You will become an officer.'), L('Předat', 'Confirm'), run);
        else run();
      }));
    },
    _celebrate(r) {
      const ov = document.createElement('div'); ov.className = 'kl-sheet kl-cele';
      ov.innerHTML = `<div class="kl-sheet-card"><div class="kl-cele-chest">🎁</div><h4>${L('Odměna klanu!', 'Clan reward!')}</h4>
        <div class="kl-cele-row">${r.gold ? `<span class="kl-amt">${icon('coin')} +${fmt(r.gold)}</span>` : ''}${r.gems ? `<span class="kl-amt">${icon('gem')} +${fmt(r.gems)}</span>` : ''}</div>
        <button class="btn btn-gold" data-no>${L('Super!', 'Great!')}</button></div>`;
      this._root.appendChild(ov);
      if (window.applyIcons) applyIcons(ov);
      ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-no]')) { ov.remove(); this.render(true); } });
    },
    _noClan(body, i) {
      const cd = i && i.cooldown ? Math.max(1, Math.ceil((new Date(i.cooldown) - Date.now()) / 60000)) : 0;
      const rw = i && i.reward;
      body.innerHTML = `<div class="kl-hero">
          <div class="kl-hero-art">${['sekery', 'hvezda', 'vez'].map((e, n) => `<img src="${crest(e, COLORS[[2, 4, 0][n]], 84)}" alt="">`).join('')}</div>
          <div class="kl-hero-txt">
            <h3>${L('Zatím nejsi v žádném klanu', 'You are not in a clan yet')}</h3>
            <p class="muted">${L('Přidej se k ostatním velitelům, nebo založ vlastní klan a pozvi kamarády.', 'Join other commanders, or found your own clan and invite friends.')}</p>
            ${this._perks()}
            ${cd ? `<p class="kl-note">⏳ ${L(`Do dalšího klanu můžeš vstoupit za ${cd} min.`, `You can join another clan in ${cd} min.`)}</p>` : ''}
            ${(i && i.requested && i.requested.length) ? `<p class="kl-note">✉️ ${L(`Čekáš na schválení žádosti (${i.requested.length}).`, `Waiting for approval (${i.requested.length} request${i.requested.length > 1 ? 's' : ''}).`)}</p>` : ''}
            ${this.claimable(i) ? `<p class="kl-note">🎁 ${L(`Máš nevyzvednutou odměnu z klanu: ${rw.gold ? fmt(rw.gold) + ' zlata ' : ''}${rw.gems ? fmt(rw.gems) + ' drahokamů' : ''}`, `Unclaimed clan reward: ${rw.gold ? fmt(rw.gold) + ' gold ' : ''}${rw.gems ? fmt(rw.gems) + ' gems' : ''}`)} <button class="btn btn-sm btn-gold" data-kclaim>${L('Vyzvednout', 'Claim')}</button></p>` : ''}
            <div class="kl-row"><button class="btn btn-gold" data-kt2="hledat">${L('Najít klan', 'Find a clan')}</button><button class="btn" data-kcreate>${L('Založit klan', 'Found a clan')}</button></div>
          </div>
        </div>`;
      body.querySelector('[data-kt2]').addEventListener('click', () => { this._tab = 'hledat'; this.render(); });
      body.querySelector('[data-kcreate]').addEventListener('click', () => { this._view = 'create'; this.render(); });
      const cl = body.querySelector('[data-kclaim]');
      if (cl) cl.addEventListener('click', () => this._act(cl, 'claim', {}, r => { if (r && (r.gold || r.gems)) { this._App.save.gold += r.gold | 0; this._App.save.gems += r.gems | 0; this._App.persist(); this._celebrate(r); } }));
    },

    /* ---------- založení / úprava ---------- */
    renderForm(body) {
      const edit = this._view === 'edit', k0 = edit && this.info && this.info.klan;
      const st = this._form = this._form && this._form.edit === edit ? this._form : { edit, emblem: k0 ? k0.emblem : EMBLEMS[Math.floor(Math.random() * EMBLEMS.length)][0], color: k0 ? k0.color : COLORS[Math.floor(Math.random() * COLORS.length)], open: k0 ? k0.open : true };
      body.innerHTML = `<div class="kl-form">
          <div class="kl-form-prev kl-card">
            <img data-kprev src="${crest(st.emblem, st.color, 120)}" width="120" height="120" alt="">
            <b data-kpname>${esc(k0 ? k0.name : L('Tvůj klan', 'Your clan'))}</b><span class="kl-tag" data-kptag>[${esc(k0 ? k0.tag : 'TAG')}]</span>
            <small class="muted">${L('Takhle bude vlajka vlát na tvém hradu.', 'This banner will fly on your castle.')}</small>
          </div>
          <div class="kl-form-f">
            <h3>${edit ? L('Upravit klan', 'Edit clan') : L('Založit klan', 'Found a clan')}</h3>
            ${edit ? '' : `<div class="kl-f2"><label>${L('Jméno klanu', 'Clan name')}<input data-kname maxlength="20" placeholder="${L('např. Rytíři Severu', 'e.g. Knights of the North')}" autocomplete="off" spellcheck="false"></label>
              <label class="kl-ftag">${L('Zkratka', 'Tag')}<input data-ktag maxlength="4" placeholder="RS" autocomplete="off" autocapitalize="characters" spellcheck="false"></label></div>`}
            <div class="kl-flbl">${L('Znak', 'Emblem')}</div>
            <div class="kl-emb">${EMBLEMS.map(e => `<button data-kemb="${e[0]}" class="${e[0] === st.emblem ? 'on' : ''}" title="${esc(L(e[1], e[2]))}"><img src="${crest(e[0], st.color, 40)}" alt="${esc(L(e[1], e[2]))}"></button>`).join('')}</div>
            <div class="kl-flbl">${L('Barva', 'Colour')}</div>
            <div class="kl-col-sw">${COLORS.map(c => `<button data-kcol="${c}" class="${c === st.color ? 'on' : ''}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div>
            <label>${L('Popis (nepovinné)', 'Description (optional)')}<input data-kdesc maxlength="120" value="${esc(k0 ? k0.descr : '')}" placeholder="${L('např. Hrajeme každý den, přidej se!', 'e.g. We play daily, join us!')}" autocomplete="off"></label>
            <div class="kl-open"><button data-kopen="1" class="${st.open ? 'on' : ''}">🔓 ${L('Otevřený – kdokoli vstoupí', 'Open – anyone can join')}</button><button data-kopen="0" class="${st.open ? '' : 'on'}">🔒 ${L('Na žádost – schvaluješ ty', 'By request – you approve')}</button></div>
            <p class="kl-err" data-kerr></p>
            <div class="kl-row"><button class="btn" data-kback>${L('Zpět', 'Back')}</button><button class="btn btn-gold" data-ksave>${edit ? L('Uložit', 'Save') : L('Založit klan', 'Found clan')}</button></div>
            ${edit ? '' : `<small class="muted">${L('Jméno a zkratka musí být slušné a jedinečné. Nevhodná jména odmítneme.', 'Name and tag must be decent and unique. Inappropriate names are rejected.')}</small>`}
          </div>
        </div>`;
      const prev = body.querySelector('[data-kprev]'), nm = body.querySelector('[data-kname]'), tg = body.querySelector('[data-ktag]');
      const upd = () => {
        prev.src = crest(st.emblem, st.color, 120);
        body.querySelectorAll('[data-kemb]').forEach(b => { b.classList.toggle('on', b.dataset.kemb === st.emblem); b.querySelector('img').src = crest(b.dataset.kemb, st.color, 40); });
        body.querySelectorAll('[data-kcol]').forEach(b => b.classList.toggle('on', b.dataset.kcol === st.color));
        body.querySelectorAll('[data-kopen]').forEach(b => b.classList.toggle('on', (b.dataset.kopen === '1') === st.open));
      };
      body.querySelectorAll('[data-kemb]').forEach(b => b.addEventListener('click', () => { st.emblem = b.dataset.kemb; upd(); }));
      body.querySelectorAll('[data-kcol]').forEach(b => b.addEventListener('click', () => { st.color = b.dataset.kcol; upd(); }));
      body.querySelectorAll('[data-kopen]').forEach(b => b.addEventListener('click', () => { st.open = b.dataset.kopen === '1'; upd(); }));
      if (nm) nm.addEventListener('input', () => { body.querySelector('[data-kpname]').textContent = nm.value.trim() || L('Tvůj klan', 'Your clan'); });
      if (tg) tg.addEventListener('input', () => { tg.value = tg.value.toUpperCase().replace(/[^A-Z0-9ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, ''); body.querySelector('[data-kptag]').textContent = '[' + (tg.value || 'TAG') + ']'; });
      body.querySelector('[data-kback]').addEventListener('click', () => { this._view = null; this._form = null; this.render(); });
      const err = body.querySelector('[data-kerr]'), save = body.querySelector('[data-ksave]');
      save.addEventListener('click', async () => {
        err.textContent = '';
        const d = body.querySelector('[data-kdesc]').value.trim();
        if (!edit) {
          const n = nm.value.trim().replace(/\s+/g, ' '), t = tg.value.trim();
          if (n.length < 3 || n.length > 20) { err.textContent = errText({ msg: 'klan_name_invalid' }); return nm.focus(); }
          if (t.length < 2) { err.textContent = errText({ msg: 'klan_tag_invalid' }); return tg.focus(); }
        }
        if (!online()) { err.textContent = errText({ code: 'network' }); return; }
        save.disabled = true;
        try {
          if (edit) await Ucet.klan('edit', { p_emblem: st.emblem, p_color: st.color, p_descr: d, p_open: st.open });
          else {
            await Ucet.klan('create', { p_name: nm.value, p_tag: tg.value, p_emblem: st.emblem, p_color: st.color, p_descr: d, p_open: st.open });
            if (window.Stat) try { Stat.ev('klan_create', {}); } catch (e) { /* nic */ }
            this._App.toast(L('Klan založen! Pozvi kamarády ⚔️', 'Clan founded! Invite your friends ⚔️'));
          }
          this._view = null; this._form = null; this._tab = 'muj'; this.infoAt = 0; this.render();
        } catch (e) { err.textContent = errText(e); save.disabled = false; }
      });
    },

    /* ---------- Hledat ---------- */
    async renderSearch(body) {
      const q0 = this._q || '';
      body.innerHTML = `<div class="kl-search">
          <div class="kl-sbar"><input data-kq0 value="${esc(q0)}" maxlength="20" placeholder="${L('Jméno nebo zkratka klanu', 'Clan name or tag')}" autocomplete="off" spellcheck="false"><button class="btn btn-gold" data-kgo>${L('Hledat', 'Search')}</button>
          ${reg() && !(this.info && this.info.klan) ? `<button class="btn" data-kcreate>+ ${L('Založit', 'Found')}</button>` : ''}</div>
          <div data-kres class="kl-res"></div>
        </div>`;
      const inp = body.querySelector('[data-kq0]'), res = body.querySelector('[data-kres]');
      const go = async () => {
        this._q = inp.value.trim();
        if (!online()) { res.innerHTML = `<p class="muted kl-c">${L('Hledání funguje jen online.', 'Search works only online.')}</p>`; return; }
        res.innerHTML = `<div class="kl-load"><span class="kl-spin"></span>${L('Hledám…', 'Searching…')}</div>`;
        try {
          if (reg() && !this.info) await this.load(this._App).catch(() => {});
          const list = await Ucet.klan('search', { p_q: this._q }, true);
          if (body !== this._body() || this._tab !== 'hledat') return;
          this._results(res, list || []);
        } catch (e) { res.innerHTML = `<p class="muted kl-c">${errText(e)}</p>`; }
      };
      body.querySelector('[data-kgo]').addEventListener('click', go);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      const cr = body.querySelector('[data-kcreate]'); if (cr) cr.addEventListener('click', () => { this._tab = 'muj'; this._view = 'create'; this.render(); });
      go();
    },
    _results(res, list) {
      const i = this.info || {}, mine = i.klan, reqd = i.requested || [];
      if (!list.length) {
        res.innerHTML = `<div class="kl-empty"><p class="muted">${this._q ? L('Žádný klan nenalezen.', 'No clan found.') : L('Zatím tu žádné klany nejsou – buď první!', 'No clans yet – be the first!')}</p>${reg() && !mine ? `<button class="btn btn-gold" data-kcreate2>${L('Založit klan', 'Found a clan')}</button>` : ''}</div>`;
        const c = res.querySelector('[data-kcreate2]'); if (c) c.addEventListener('click', () => { this._tab = 'muj'; this._view = 'create'; this.render(); });
        return;
      }
      res.innerHTML = list.map(k => {
        const full = k.members >= MAX, isMine = mine && mine.id === k.id, req = reqd.includes(k.id);
        const btn = isMine ? `<span class="kl-chip kl-chip-gold">${L('Tvůj klan', 'Your clan')}</span>`
          : mine ? '' : full ? `<span class="kl-chip">${L('Plný', 'Full')}</span>`
          : req ? `<button class="btn btn-sm" data-kcancel="${k.id}">✉️ ${L('Zrušit žádost', 'Cancel request')}</button>`
          : `<button class="btn btn-sm ${k.open ? 'btn-gold' : ''}" data-kjoin="${k.id}" data-open="${k.open ? 1 : 0}">${k.open ? L('Vstoupit', 'Join') : L('Požádat', 'Request')}</button>`;
        return `<article class="kl-item ${isMine ? 'mine' : ''}">${crestImg(k, 52)}
          <div class="kl-item-t"><b>${esc(k.name)} <span class="kl-tag">[${esc(k.tag)}]</span></b>
            <div class="kl-chips"><span class="kl-chip kl-chip-gold">${L('Úr.', 'Lv')} ${k.level}</span><span class="kl-chip">👥 ${k.members}/${MAX}</span><span class="kl-chip">⚔ ${fmt(k.score)}</span><span class="kl-chip">${k.open ? '🔓' : '🔒'}</span></div>
            ${k.descr ? `<small>${esc(k.descr)}</small>` : ''}</div>
          <div class="kl-item-a">${btn}</div></article>`;
      }).join('');
      res.querySelectorAll('[data-kjoin]').forEach(b => b.addEventListener('click', () => {
        if (!reg()) return this._regPrompt();
        this._act(b, 'join', { p_klan: +b.dataset.kjoin }, async r => {
          if (r && r.joined) { this._App.toast(L('Vítej v klanu! ⚔️', 'Welcome to the clan! ⚔️')); this._tab = 'muj'; if (window.Stat) try { Stat.ev('klan_join', {}); } catch (e) { /* nic */ } return this.render(); }
          if (r && r.gone) { this._App.toast(errText({ msg: 'klan_none' })); return this.render(); }
          if (r && r.requested) { this._App.toast(L('Žádost odeslána. Vůdce klanu ji brzy schválí.', 'Request sent. The clan leader will review it soon.')); await this.load(this._App, true).catch(() => {}); this._results(res, list); }
        });
      }));
      res.querySelectorAll('[data-kcancel]').forEach(b => b.addEventListener('click', () => this._act(b, 'cancel', { p_klan: +b.dataset.kcancel }, async () => { await this.load(this._App, true).catch(() => {}); this._results(res, list); })));
    },
    _regPrompt() {
      this._confirm(L('Klany jsou pro registrované', 'Clans need an account'),
        L('Zaregistruj se zdarma – zabere to chvilku, postup se ti uloží na server a můžeš vstoupit do klanu.', 'Register for free – it takes a moment, your progress is saved on the server and you can join a clan.'),
        L('Zaregistrovat', 'Register'), () => { this._close(); UcetUI.open(this._App, 'register'); });
    },

    /* ---------- Žebříček ---------- */
    async renderBoard(body) {
      body.innerHTML = `<div class="kl-board">
          <div class="kl-prizes"><span>🥇 500</span><span>🥈🥉 300</span><span>4–10: 150</span><span>11–50: 50</span><em>${icon('gem')} ${L('každému členovi, který přispěl', 'for every member who contributed')}</em></div>
          <div data-kbl><div class="kl-load"><span class="kl-spin"></span>${L('Načítám…', 'Loading…')}</div></div>
        </div>`;
      if (window.applyIcons) applyIcons(body);
      const box = body.querySelector('[data-kbl]');
      if (!online()) { box.innerHTML = `<p class="muted kl-c">${L('Žebříček se načte, až budeš online.', 'The leaderboard loads when you are online.')}</p>`; return; }
      try {
        const b = await Ucet.klan('board', {}, true);
        if (body !== this._body() || this._tab !== 'zebricek') return;
        const me = b.me, top = b.top || [];
        const row = (k, n) => `<li class="${n < 3 ? 'top top' + (n + 1) : ''} ${me && me.id === k.id ? 'me' : ''}"><span class="kl-pos">${n < 3 ? ['🥇', '🥈', '🥉'][n] : n + 1}</span>${crestImg(k, 34)}<b>${esc(k.name)} <span class="kl-tag">[${esc(k.tag)}]</span></b><small>👥 ${k.members}</small><i>⚔ ${fmt(k.score)}</i></li>`;
        box.innerHTML = `<p class="kl-c kl-left">⏳ ${L('Do konce týdne', 'Week ends in')} ${left(b.ends)} · ${L('skóre = výhry členů za týden', 'score = members’ wins this week')}</p>
          <ol class="kl-blist">${top.map(row).join('') || `<li class="muted kl-c">${L('Tento týden zatím žádný klan nebojoval – buďte první!', 'No clan has fought this week yet – be the first!')}</li>`}</ol>
          ${me && me.rank && me.rank > top.length && this.cached(this._App) ? `<ol class="kl-blist kl-blist-me" start="${me.rank}">${row(Object.assign({}, this.cached(this._App), { members: (this.info && this.info.klan && this.info.klan.members || []).length, score: me.score }), me.rank - 1)}</ol>` : ''}`;
      } catch (e) { box.innerHTML = `<p class="muted kl-c">${errText(e)}</p>`; }
    }
  };

  /* vlajka na hradu hráče – po vykreslení hradů (Battle.render volá _castleFire hned po drawCastle) */
  if (window.Battle && Battle.prototype._castleFire) {
    const orig = Battle.prototype._castleFire;
    Battle.prototype._castleFire = function (ctx, side, facing, t) {
      if (side === this.side.player && facing === 1) { try { Klany.drawFlag(this, ctx, side, t); } catch (e) { /* nic */ } }
      return orig.apply(this, arguments);
    };
  }

  window.Klany = Klany;
})();
