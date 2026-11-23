/* =========================================================================
   ÚVODNÍ PŘÍBĚH (první spuštění hry)
   Vypravěč (hlas + titulky) uvede hráče do hry přímo v bitvě:
   50 vojáků stojí před hradem → jízdní hlídka vyrazí na průzkum → vrátí se
   jediný zraněný jezdec, varuje před démony a padne → útočí velká armáda démonů.
   Hráč brání hrad (krátký návod: posily, AUTO, kamera, rozkazy, Ohnivý déšť);
   jakmile má přesilu, všichni vojáci sami vyrazí do útoku. Pak normální hra.
   Hlas: nahrávky ElevenLabs (zvuky/hlas_cs_*.mp3 a hlas_en_*.mp3, česky a anglicky);
   titulky ve všech jazycích hry (js/ui/prolog_texty.js). Bez nahrávky jen titulky.
   ========================================================================= */
(function () {
  const ORDER = ['cs', 'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja', 'tr', 'ko', 'pl'];
  const T = key => {
    const row = (window.PROLOG_TEXTY || {})[key]; if (!row) return '';
    const i = ORDER.indexOf((window.I18N && I18N.lang) || 'en');
    return row[i >= 0 ? i : 1] || row[1];
  };
  const VOICED = ['n1', 'c1', 'k1', 'sc', 'n4', 'c2', 't3', 'n5'];
  const WHO = { sc: 'w_sc', t1: 'w_tip', tc: 'w_tip', to: 'w_tip', t2: 'w_tip', t3: 'w_cmd', c1: 'w_cmd', c2: 'w_cmd', k1: 'w_king' };
  const BASE = (/^https?:$/.test(location.protocol) && !/claude|claudeusercontent|anthropic/.test(location.hostname)) ? 'zvuky/' : 'https://pracovnitipy.github.io/hrad-proti-hradu/zvuky/';

  const P = {
    active: false,

    /* ---------- hlas vypravěče (ElevenLabs nahrávky, žádný hlas prohlížeče) ---------- */
    _voice(key) {
      if (!VOICED.includes(key)) return;   // zkusí hrát hned; když prohlížeč zvuk zablokuje, rozjede se po prvním klepnutí
      try { if (window.Zvuk && Zvuk.settings && !Zvuk.settings().sfx) return; } catch (e) { /* nic */ }
      const f = 'hlas_' + (window.I18N && I18N.lang === 'cs' ? 'cs' : 'en') + '_' + key + '.mp3';
      const src = (window.CW_ZVUKY && CW_ZVUKY[f]) || (BASE + f);
      try {
        if (this.audio) { this.audio.pause(); this.audio = null; }
        const a = new Audio(src);
        let vol = 1; try { vol = Math.max(0, Math.min(1, ((Zvuk.settings().sfxVol || 100) / 100))); } catch (e) { /* nic */ }
        a.volume = vol;
        a.onerror = () => { /* nahrávka chybí – zůstanou titulky */ };
        const pr = a.play();
        this.audio = a; this.played = key;
        this._pr = pr && pr.then ? pr : null;
        if (pr && pr.catch) pr.catch(() => { if (this.audio === a) { this.played = null; this.unlocked = false; } });
      } catch (e) { /* jen titulky */ }
    },
    _stopVoice() { try { if (this.audio) this.audio.pause(); } catch (e) { /* nic */ } this.audio = null; },

    /* ---------- titulky ---------- */
    _say(key) {
      const txt = T(key);
      const w = WHO[key] ? T(WHO[key]) : '';
      const el = this.sub; if (!el) return;
      el.className = 'prolog-sub' + (key[0] === 't' && key !== 't3' ? ' tip' : '') + (key === 'sc' ? ' scout' : '');
      el.innerHTML = (w ? '<small></small>' : '') + '<span></span>';
      if (w) el.querySelector('small').textContent = w;
      el.querySelector('span').textContent = txt;
      el.hidden = false;
      this.cur = key;
      this._voice(key);
    },
    /* zlatá skákající šipka, která ukazuje na tlačítko (sleduje ho i při změně velikosti okna) */
    _point(sel, ms) {
      const el = document.querySelector(sel); if (!el) return;
      const ar = document.createElement('div');
      ar.className = 'prolog-arrow';
      ar.innerHTML = '<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M14 2h12v24h11L20 46 3 26h11z"/></svg>';
      document.body.appendChild(ar);
      const place = () => {
        const r = el.getBoundingClientRect();
        if (!r.width) { ar.style.display = 'none'; return; }
        ar.style.display = '';
        const up = r.top + r.height / 2 < innerHeight / 2;          // tlačítko nahoře → šipka pod ním míří nahoru
        ar.classList.toggle('up', up);
        ar.style.left = (r.left + r.width / 2 - 22) + 'px';
        ar.style.top = (up ? r.bottom + 6 : r.top - 58) + 'px';
      };
      place();
      const iv = setInterval(place, 200);
      setTimeout(() => { clearInterval(iv); ar.remove(); }, ms);
      (this.marks = this.marks || []).push(() => { clearInterval(iv); ar.remove(); });
    },
    /* ruka, která táhne po bojišti doleva a doprava (ukázka posunu kamery) */
    _swipe(ms) {
      const h = document.createElement('div');
      h.className = 'prolog-swipe';
      h.innerHTML = '<span class="pl">◀</span><span class="hand">👆</span><span class="pr">▶</span>';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), ms);
      (this.marks = this.marks || []).push(() => h.remove());
    },
    /* počká na klepnutí na prvek (nebo vyprší čas) a pak zavolá done – jen jednou */
    _waitFor(sel, ms, done) {
      let fired = false;
      const fin = () => { if (fired) return; fired = true; document.removeEventListener('pointerdown', on, true); clearTimeout(tm); if (this.active) done(); };
      const on = e => { if (e.target && e.target.closest && e.target.closest(sel)) setTimeout(fin, 0); };
      document.addEventListener('pointerdown', on, true);
      const tm = setTimeout(fin, ms);
    },
    /* velké blikající šipky směru přes bojiště (odkud jdou démoni / kam útočit) */
    _dir(where, label, ms) {
      const d = document.createElement('div');
      d.className = 'prolog-dir ' + where;
      d.innerHTML = '<i>›</i><i>›</i><i>›</i>' + (label ? '<b></b>' : '');
      if (label) d.querySelector('b').textContent = label;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), ms);
      (this.marks = this.marks || []).push(() => d.remove());
    },
    _clearMarks() { (this.marks || []).forEach(f => { try { f(); } catch (e) { /* nic */ } }); this.marks = []; },
    _hl(sel, ms) {
      const el = document.querySelector(sel); if (!el) return;
      el.classList.add('prolog-hl');
      setTimeout(() => el.classList.remove('prolog-hl'), ms);
    },

    /* ---------- spuštění ---------- */
    start(App) {
      const save = App.save;
      save.tut = save.tut || {};
      save.tut.battle = true; save.tut.quick = 1; Save.save();   // starý návod se už nespouští
      this.active = true; this.App = App; this._hinted = false;
      this.unlocked = !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
      const unlock = () => {
        if (!this.active) return;
        this.unlocked = true;
        if (this.active && this.cur && this.played !== this.cur) this._voice(this.cur);   // hlas se rozjede po prvním klepnutí
      };
      document.addEventListener('pointerdown', unlock, { capture: true });
      document.addEventListener('keydown', unlock, { capture: true });
      if (window.Stat) try { Stat.ev('prolog_start'); } catch (e) { /* nic */ }
      App.startBattle({
        mode: 'prolog', prolog: true, title: T('title'),
        playFaction: 'kralovstvi', enemyFaction: 'demoni', enemyName: T('demons'),
        enemyUnits: ['bes', 'chrlic', 'rohac', 'zatracenec'], difficulty: 0.6, theme: 'evropa',
        enemyCastleLevel: 3, enemyCastleStyle: 'peklo',
        battleOpts: { noAI: true, world: { worldW: 4600, enemyFront: 4130 }, enemyCastleHpMult: 3, onUpdate: dt => this._tick(dt) },
        tweak: b => this._setup(App, b)
      });
    },

    _setup(App, b) {
      this.App = App; this.b = b;
      this.spawned = 0; this.total = 0; this.played = null; this.cur = null; this.allIn = false; this.attacked = false; this.ending = false; this.tipFire = false; this.tutDone = false;
      const hint = document.getElementById('bHint'); if (hint) hint.hidden = true;
      // titulky
      const B = document.getElementById('battle');
      let el = document.getElementById('prologSub');
      if (!el) { el = document.createElement('div'); el.id = 'prologSub'; B.appendChild(el); }
      el.hidden = true; this.sub = el;
      const cfg = GameData.battleConfig, s = b.side.player;
      // 50 vojáků seřazených před hradem
      const flagX = cfg.playerFront + 640;
      b.setFormation('player', 'formace', flagX);
      const army = [['pesak', 20], ['kopinik', 10], ['lucistnik', 15], ['rytir', 5]];
      // královská garda: modrá se zlatou zbrojí; král v rudém se zlatou korunou
      const G = { trim: '#f5d36b', metal: '#e8c45c', metalDark: '#a47a24' };
      const guardPal = def => Object.assign(Art.unitPalette('player', 'zakladni', 'kralovstvi'), def.pal || {}, G);
      army.forEach(([id, n]) => { for (let i = 0; i < n; i++) if (b.spawn('player', id, true)) { const u = b.units[b.units.length - 1]; u.pal = guardPal(u.def); } });
      // jízdní hlídka stojí od začátku před šikem
      this.riders = [];
      for (let i = 0; i < 5; i++) {
        if (!b.spawn('player', 'jezdec', true)) continue;
        const u = b.units[b.units.length - 1];
        u.x = flagX + 230 + (i % 2) * 40; u.y = cfg.laneTop + 18 + i * ((cfg.laneBottom - cfg.laneTop - 36) / 4);
        u.script = v => { v.moving = false; v.face = 1; };
        this.riders.push(u);
      }
      // král na koni se zlatou korunou stojí před gardou
      if (b.spawn('player', 'jezdec', true)) {
        const k = b.units[b.units.length - 1];
        k.pal = Object.assign(Art.unitPalette('player', 'zakladni', 'kralovstvi'), k.def.pal || {}, G, { tunic: '#8a1a2a', tunicDark: '#5a0f1a', cape: '#8a1a2a', ornament: 'crown', glow: '#ffe28a' });
        k.x = flagX + 360; k.y = (cfg.laneTop + cfg.laneBottom) / 2; k.hp = k.maxHp = 1e9;
        k.script = v => { v.moving = false; v.face = -1; v.hp = v.maxHp; };   // král čelem ke gardě
        this.king = k;
      }
      // celé vojsko hned srovnané v šiku (žádné pobíhání z brány)
      b._assignSlots('player');
      for (const u of b.units) if (u.team === 'player' && !u.script && u.slotX != null) { u.x = u.slotX; u.y = u.slotY; u.moving = false; u.face = 1; }
      this.flagX = flagX;
      b.camFocus = flagX + 60;
      // vypravěč začne hned; když prohlížeč nepustí zvuk bez klepnutí, příběh jede dál s titulky
      const timeline = () => {
        b.later(6.4, () => this._say('c1'));          // velitel gardy se ptá krále
        b.later(15.8, () => this._say('k1'));         // král posílá jezdce
        b.later(17.8, () => this._riders());
      };
      this._pr = null;
      this._say('n1');
      const pr = this._pr;
      if (!pr) { timeline(); return; }
      pr.then(timeline, () => {
        // prohlížeč nepustil zvuk bez klepnutí → příběh běží hned dál (titulky),
        // hlas se zapne od prvního dotyku hráče (žádné čekací tlačítko – hráči odcházeli)
        timeline();
        const un = () => { this.unlocked = true; this.played = null; if (this.active && this.cur) this._voice(this.cur); };
        document.addEventListener('pointerdown', un, { once: true, capture: true });
        (this.marks = this.marks || []).push(() => document.removeEventListener('pointerdown', un, { capture: true }));
      });
    },

    /* jízdní hlídka vyráží na průzkum */
    _riders() {
      const b = this.b, cfg = GameData.battleConfig;
      const riders = this.riders || [];
      riders.forEach(u => {
        u.script = (v, dt) => {
          const sp = v.def.speed * (cfg.speedScale || 1) * 2.6;
          v.x += sp * dt; v.face = 1; v.moving = true; v.walk += dt * v.def.speed * 0.17;
          if (v.x > this.flagX + 1250) v._gone = true;   // zmizí v lese
        };
      });
      if (window.Zvuk) try { Zvuk.at('horse', this.flagX, b, 0.8); } catch (e) { /* nic */ }
      const follow = () => {
        if (!this.active || this.b !== b) return;
        const lead = riders.filter(r => !r._gone);
        if (lead.length) { b.camFocus = Math.max(...lead.map(r => r.x)); b.later(0.1, follow); return; }
        riders.forEach(r => { r.script = null; r.dead = 9; });   // hlídka zmizela v lese (mrtvé = vypadnou i z hledání cílů)
        b.camFocus = this.flagX + 200;
        b.later(1.0, () => this._scout());
      };
      b.later(0.3, follow);
    },

    /* vrací se jediný zraněný jezdec */
    _scout() {
      const b = this.b, cfg = GameData.battleConfig;
      if (!b.spawn('player', 'jezdec', true)) { this._demons(); return; }
      const u = b.units[b.units.length - 1];
      u.x = this.flagX + 1250; u.y = (cfg.laneTop + cfg.laneBottom) / 2; u.hp = u.maxHp * 0.12; u.hurt = 0.4;
      const stopX = this.flagX + 300;
      let arrived = false;
      u.script = (v, dt) => {
        if (v.x > stopX) {
          const sp = v.def.speed * (cfg.speedScale || 1) * 1.8;
          v.x -= sp * dt; v.face = -1; v.moving = true; v.walk += dt * v.def.speed * 0.17;
          b.camFocus = v.x;
          if (Math.random() < dt * 3) b.particles.push({ x: v.x, y: v.y - 30, vx: 0, vy: -10, g: 300, t: 0, life: 0.6, r: 2.5, color: '#b0101a' });
        } else {
          v.moving = false; v.face = -1;
          if (!arrived) {
            arrived = true;
            this._say('sc');
            b.later(4.2, () => {
              if (!v.dead) { v.script = null; b._damage(v, 1e7); }
              b.later(1.4, () => this._demons());
            });
          }
        }
      };
    },

    /* útok jedné armády démonů */
    _demons() {
      const b = this.b, cfg = GameData.battleConfig;
      this._say('n4');
      this._dir('foe', I18N.L('Démoni!', 'Demons!'), 6000);
      // král se stáhne za vojsko k hradu
      const k = this.king, home = GameData.battleConfig.playerFront + 70;
      if (k && !k.dead) k.script = (v, dt) => { v.hp = v.maxHp; if (v.x > home) { v.x -= v.def.speed * (GameData.battleConfig.speedScale || 1) * 1.6 * dt; v.face = -1; v.moving = true; v.walk += dt * v.def.speed * 0.17; } else { v.moving = false; v.face = 1; } };
      b.later(4.6, () => { if (!this.attacked) this._say('c2'); });   // velitel: Do zbraně!
      b.setFormation('enemy', 'utok');   // démoni jdou rovnou na hrad
      const groups = [
        [['bes', 10], ['chrlic', 3]],
        [['bes', 10], ['rohac', 4], ['chrlic', 3]],
        [['bes', 10], ['chrlic', 4], ['rohac', 4]],
        [['bes', 8], ['rohac', 4], ['zatracenec', 3]],
        [['bes', 8], ['chrlic', 4], ['zatracenec', 2]]
      ];
      groups.forEach(g => g.forEach(([, n]) => { this.total += n; }));
      groups.forEach((g, gi) => b.later(gi * 4, () => {
        g.forEach(([id, n]) => { for (let i = 0; i < n; i++) {
          if (!b.spawn('enemy', id, true)) continue;
          const u = b.units[b.units.length - 1];
          u.x = cfg.enemyFront - 260 - Math.random() * 360; u.y = cfg.laneTop + Math.random() * (cfg.laneBottom - cfg.laneTop);
          this.spawned++;
        } });
        if (gi === groups.length - 1) this.allIn = true;
      }));
      // kamera ukáže démony, pak se vrátí k vlastní frontě
      const show = t0 => {
        if (!this.active || this.b !== b) return;
        let ex = null; for (const u of b.units) if (!u.dead && u.team === 'enemy') ex = ex == null ? u.x : Math.min(ex, u.x);
        if (ex != null) b.camFocus = ex;
        if (b.time - t0 < 4.5) b.later(0.1, () => show(t0)); else b.camFocus = null;
      };
      b.later(0.4, () => show(b.time));
      // krátký návod krok za krokem – každý krok ukáže šipku a počká, až to hráč udělá (nebo chvíli uplyne)
      const autoOn = () => {
        try {
          b.setAuto('kralovstvi', true);
          const btn = document.querySelector('#bUnits [data-auto="kralovstvi"]');
          if (btn) { btn.setAttribute('aria-pressed', true); const g = btn.closest('.ugrp'); if (g) g.classList.add('auto-on'); }
        } catch (e) { /* nic */ }
      };
      const step3 = () => {
        this._say('to'); this._hl('#bOrders', 9000); this._point('#bOrders [data-order="utok"]', 9000);
        this._waitFor('#bOrders [data-order]', 9000, () => { this._clearMarks(); this.tutDone = true; this._tFire = b.time + 1.5; });
      };
      const step2 = () => {
        this._say('tc'); this._swipe(9000);
        const m0 = b.cam.manualReal || 0;
        const t0 = performance.now();
        const watch = () => {
          if (!this.active) return;
          if ((b.cam.manualReal || 0) !== m0 || performance.now() - t0 > 8000) { this._clearMarks(); setTimeout(step3, 700); return; }
          setTimeout(watch, 150);
        };
        watch();
      };
      b.later(7.5, () => {
        this._say('t1');
        this._hl('#bUnits', 10000);
        this._point('#bUnits [data-spawn]', 10000);
        this._waitFor('#bUnits [data-spawn]', 10000, () => { this._clearMarks(); autoOn(); setTimeout(step2, 900); });
      });
      this._tFire = 0;
    },

    /* každý snímek: Ohnivý déšť, útok při přesile, konec */
    _tick() {
      const b = this.b; if (!this.active || !b || b.over) return;
      const pc = b.side.player.castle;
      if (pc.hp < pc.maxHp * 0.45) pc.hp = pc.maxHp * 0.45;   // úvod se nedá prohrát
      if (!this.spawned) return;
      if (!this.tipFire && this._tFire && b.time > this._tFire) {
        const st = b.abilityState ? b.abilityState('player', 'ohen') : null;
        if (!st || st.affordable || b.time > this._tFire + 6) {
          this.tipFire = true;
          if (!this.attacked) this._say('t2');
          this._hl('#bAbil [data-abil]', 7000);
          this._point('#bAbil [data-abil]', 7000);
        }
      }
      let pa = 0, ea = 0;
      for (const u of b.units) if (!u.dead) { if (u.team === 'player') pa++; else ea++; }
      if (this.allIn && this.tutDone && this.tipFire && !this.attacked && ea > 0 && (pa >= ea * 1.6 || ea <= 6)) {
        this.attacked = true;
        b.setFormation('player', 'utok');
        if (this.App && this.App._formUi) this.App._formUi('utok');
        this._clearMarks();
        this._say('t3');
        this._dir('go', I18N.L('Do útoku!', 'Attack!'), 4500);
      }
      if (this.allIn && ea === 0 && !this.ending) {
        this.ending = true;
        this._say('n5');
        b.later(4.4, () => { if (!b.over) b._end(true, 'prolog'); });
      }
    },

    /* po bitvě: odměna a normální hra */
    finish(App, res) {
      this.active = false; this._clearMarks();
      this._stopVoice();
      if (this.sub) this.sub.hidden = true;
      const save = App.save;
      save.stats.wins = (save.stats.wins || 0) + 1;
      save.stats.kills = (save.stats.kills || 0) + (res.kills || 0);
      save.gold += 300;
      save.tut.prolog = 1;
      App.persist();
      if (window.Stat) try { Stat.ev('prolog_win'); } catch (e) { /* nic */ }
      App.modal(`<div class="rs prolog-end">
          <h2>${T('end_h')}</h2>
          <p class="muted">${T('end_p')}</p>
          <p class="prolog-rew">+300 🪙</p>
          <div class="modal-actions"><button class="btn btn-gold btn-big" data-close>${T('cont')}</button></div>
        </div>`, m => {
        m.classList.add('res-simple');
        m.querySelector('[data-close]').addEventListener('click', () => { App._closeBattle(); App.go('hrad'); }, { once: true });
      });
    }
  };
  window.Prolog = P;
})();
