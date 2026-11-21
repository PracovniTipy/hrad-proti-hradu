/* =========================================================================
   ÚVODNÍ PŘÍBĚH (první spuštění hry)
   Vypravěč (hlas + titulky) uvede hráče do hry přímo v bitvě:
   50 vojáků stojí před hradem → jízdní hlídka vyrazí na průzkum → vrátí se
   jediný zraněný jezdec, varuje před démony a padne → útočí jedna armáda démonů.
   Hráč brání hrad (krátký návod: posily, AUTO, Ohnivý déšť); jakmile má přesilu,
   všichni vojáci sami vyrazí do útoku. Po porážce démonů začne normální hra.
   Hlas: Web Speech API (zdarma, bez souborů); titulky jsou vždy.
   ========================================================================= */
(function () {
  const L = (cs, en) => (window.I18N && I18N.L) ? I18N.L(cs, en) : (window.I18N && I18N.lang === 'cs' ? cs : en);
  const isCs = () => window.I18N && I18N.lang === 'cs';

  const LINES = {
    n1: ['Hranice Království Lví koruny. Padesát věrných mužů stráží hrad.', 'The border of the Lion Crown kingdom. Fifty loyal men guard the castle.'],
    n2: ['Velitel vyslal jízdní hlídku, aby prozkoumala temný les.', 'The commander sent a cavalry patrol to scout the dark forest.'],
    n3: ['Čekali dlouho. Les utichl… až příliš.', 'They waited for a long time. The forest fell silent… far too silent.'],
    sc: ['Pane… přepadli nás! Démoni… táhnou sem… celá armáda…', 'My lord… we were ambushed! Demons… they are coming… a whole army…'],
    n4: ['Z lesa vyrazila armáda démonů. Braň hrad!', 'A demon army bursts out of the forest. Defend the castle!'],
    t1: ['Klepni na vojáka dole a pošli posily. Noví vojáci se přidávají i sami.', 'Tap a soldier below to send reinforcements. New soldiers also join on their own.'],
    t2: ['Klepni na 🔥 Ohnivý déšť a spal skupinu démonů!', 'Tap 🔥 Fire Rain to burn a group of demons!'],
    t3: ['Máme přesilu! Všichni do útoku!', 'We outnumber them! Everyone, attack!'],
    n5: ['Démoni padli a hrad stojí… ale tohle je teprve začátek.', 'The demons have fallen and the castle stands… but this is only the beginning.']
  };
  const who = { sc: ['Zvěd', 'Scout'], t1: ['Návod', 'Tip'], t2: ['Návod', 'Tip'], t3: ['Velitel', 'Commander'] };

  const P = {
    active: false,

    /* ---------- hlas vypravěče ---------- */
    _voiceOk() {
      try { return !!window.speechSynthesis && (!window.Zvuk || !Zvuk.settings || Zvuk.settings().sfx !== false); } catch (e) { return false; }
    },
    _speak(txt, kind) {
      if (!this.unlocked || !this._voiceOk()) return;
      try {
        const S = window.speechSynthesis;
        S.cancel();
        const u = new SpeechSynthesisUtterance(txt.replace(/[🔥]/g, ''));
        const lang = isCs() ? 'cs-CZ' : 'en-US';
        u.lang = lang;
        const vs = S.getVoices().filter(v => String(v.lang || '').toLowerCase().replace('_', '-').startsWith(lang.slice(0, 2)));
        if (vs.length) u.voice = vs.find(v => /male|muž|daniel|jakub|david|guy|george|google/i.test(v.name) && !/female|žena|zuzana|samantha/i.test(v.name)) || vs[0];
        const scout = kind === 'sc';
        u.pitch = scout ? 1.15 : 0.72; u.rate = scout ? 1.08 : 0.9; u.volume = 1;
        S.speak(u);
      } catch (e) { /* bez hlasu – titulky stačí */ }
    },

    /* ---------- titulky ---------- */
    _say(key) {
      const [cs, en] = LINES[key];
      const txt = L(cs, en);
      const w = who[key] ? L(who[key][0], who[key][1]) : '';
      const el = this.sub; if (!el) return;
      el.className = 'prolog-sub' + (key[0] === 't' ? ' tip' : '') + (key === 'sc' ? ' scout' : '');
      el.innerHTML = (w ? `<small>${w}</small>` : '') + `<span></span>`;
      el.querySelector('span').textContent = txt;
      el.hidden = false;
      this.cur = { txt, key };
      if (key[0] !== 't') this._speak(txt, key);   // návod jen titulkem, příběh i hlasem
    },
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
      this.active = true;
      this.unlocked = false;
      const unlock = () => {
        if (this.unlocked) return;
        this.unlocked = true;
        if (this.cur && this.cur.key[0] !== 't' && this.active) this._speak(this.cur.txt, this.cur.key);
      };
      document.addEventListener('pointerdown', unlock, { capture: true, once: true });
      document.addEventListener('keydown', unlock, { capture: true, once: true });
      try { window.speechSynthesis && speechSynthesis.getVoices(); } catch (e) { /* nic */ }
      if (window.Stat) try { Stat.ev('prolog_start'); } catch (e) { /* nic */ }
      App.startBattle({
        mode: 'prolog', prolog: true, title: L('Obrana hranice', 'Defend the border'),
        playFaction: 'kralovstvi', enemyFaction: 'demoni', enemyName: L('Démoni', 'Demons'),
        enemyUnits: ['bes', 'chrlic', 'rohac', 'zatracenec'], difficulty: 0.6, theme: 'evropa',
        enemyCastleLevel: 3, enemyCastleStyle: 'peklo',
        battleOpts: { noAI: true, world: { worldW: 4600, enemyFront: 4130 }, enemyCastleHpMult: 3, onUpdate: dt => this._tick(dt) },
        tweak: b => this._setup(App, b)
      });
    },

    _setup(App, b) {
      this.App = App; this.b = b;
      this.spawned = 0; this.total = 0; this.allIn = false; this.attacked = false; this.ending = false; this.tipFire = false;
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
      army.forEach(([id, n]) => { for (let i = 0; i < n; i++) {
        if (!b.spawn('player', id, true)) continue;
        const u = b.units[b.units.length - 1];
        u.x = flagX - 40 - Math.random() * 520; u.y = cfg.laneTop + Math.random() * (cfg.laneBottom - cfg.laneTop);
      } });
      this.flagX = flagX;
      b.camFocus = flagX - 120;
      b.later(0.6, () => this._say('n1'));
      b.later(5.6, () => this._riders());
    },

    /* jízdní hlídka vyráží na průzkum */
    _riders() {
      const b = this.b, cfg = GameData.battleConfig;
      this._say('n2');
      const riders = [];
      for (let i = 0; i < 5; i++) {
        if (!b.spawn('player', 'jezdec', true)) continue;
        const u = b.units[b.units.length - 1];
        u.x = this.flagX + 40 + i * 26; u.y = cfg.laneTop + 20 + i * ((cfg.laneBottom - cfg.laneTop - 40) / 4);
        u.script = (v, dt) => {
          const sp = v.def.speed * (cfg.speedScale || 1) * 2.6;
          v.x += sp * dt; v.face = 1; v.moving = true; v.walk += dt * v.def.speed * 0.17;
          if (v.x > this.flagX + 1250) v._gone = true;   // zmizí v lese
        };
        riders.push(u);
      }
      const follow = () => {
        if (!this.active || this.b !== b) return;
        const lead = riders.filter(r => !r._gone);
        if (lead.length) { b.camFocus = Math.max(...lead.map(r => r.x)); b.later(0.1, follow); return; }
        b.units = b.units.filter(u => !u._gone);   // hlídka zmizela v lese
        b.camFocus = this.flagX + 200;
        this._say('n3');
        b.later(2.6, () => this._scout());
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
      b.setFormation('enemy', 'utok');   // démoni jdou rovnou na hrad
      const groups = [
        [['bes', 7], ['chrlic', 2]],
        [['bes', 6], ['rohac', 3], ['chrlic', 2]],
        [['bes', 6], ['chrlic', 3], ['rohac', 2]],
        [['zatracenec', 2], ['bes', 5], ['rohac', 2]]
      ];
      groups.forEach(g => g.forEach(([, n]) => { this.total += n; }));
      groups.forEach((g, gi) => b.later(gi * 4.5, () => {
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
      // krátký návod: posily + AUTO
      b.later(6.5, () => {
        this._say('t1');
        this._hl('#bUnits', 9000);
        try {
          b.setAuto('kralovstvi', true);
          const btn = document.querySelector('#bUnits [data-auto="kralovstvi"]');
          if (btn) { btn.setAttribute('aria-pressed', true); const g = btn.closest('.ugrp'); if (g) g.classList.add('auto-on'); }
        } catch (e) { /* nic */ }
      });
    },

    /* každý snímek: Ohnivý déšť, útok při přesile, konec */
    _tick() {
      const b = this.b; if (!this.active || !b || b.over) return;
      const pc = b.side.player.castle;
      if (pc.hp < pc.maxHp * 0.45) pc.hp = pc.maxHp * 0.45;   // úvod se nedá prohrát
      if (!this.spawned) return;
      if (!this.tipFire && b.time > (this._t1 || (this._t1 = b.time)) + 13) {
        const st = b.abilityState ? b.abilityState('player', 'ohen') : null;
        if (!st || st.affordable) {
          this.tipFire = true;
          if (!this.attacked) this._say('t2');
          this._hl('#bAbil [data-abil]', 7000);
        }
      }
      let pa = 0, ea = 0;
      for (const u of b.units) if (!u.dead) { if (u.team === 'player') pa++; else ea++; }
      if (this.allIn && !this.attacked && ea > 0 && (pa >= ea * 1.6 || ea <= 6)) {
        this.attacked = true;
        b.setFormation('player', 'utok');
        if (this.App && this.App._formUi) this.App._formUi('utok');
        this._say('t3');
      }
      if (this.allIn && ea === 0 && !this.ending) {
        this.ending = true;
        this._say('n5');
        b.later(4.4, () => { if (!b.over) b._end(true, 'prolog'); });
      }
    },

    /* po bitvě: odměna a normální hra */
    finish(App, res) {
      this.active = false;
      try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* nic */ }
      if (this.sub) this.sub.hidden = true;
      const save = App.save;
      save.stats.wins = (save.stats.wins || 0) + 1;
      save.stats.kills = (save.stats.kills || 0) + (res.kills || 0);
      save.gold += 300;
      save.tut.prolog = 1;
      App.persist();
      if (window.Stat) try { Stat.ev('prolog_win'); } catch (e) { /* nic */ }
      App.modal(`<div class="rs prolog-end">
          <h2>${L('Hrad ubráněn!', 'Castle defended!')}</h2>
          <p class="muted">${L('Démoni se stáhli. Velitel ti svěřil hrad – vylepšuj ho, najímej vojáky a pokračuj v příběhu.', 'The demons retreated. The commander entrusted you with the castle – upgrade it, recruit soldiers and continue the story.')}</p>
          <p class="prolog-rew">+300 🪙</p>
          <div class="modal-actions"><button class="btn btn-gold btn-big" data-close>${L('Pokračovat', 'Continue')}</button></div>
        </div>`, m => {
        m.classList.add('res-simple');
        m.querySelector('[data-close]').addEventListener('click', () => { App._closeBattle(); App.go('hrad'); }, { once: true });
      });
    }
  };
  window.Prolog = P;
})();
