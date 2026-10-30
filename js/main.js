/* =========================================================================
   APLIKACE – navigace mezi obrazovkami, spuštění bitev a odměny
   ========================================================================= */
(function () {
  const $ = s => document.querySelector(s);
  const { fmt, esc, stars, isUnitUnlocked } = Screens;

  const App = {
    save: Save.load(),
    screenEl: $('#screen'),
    current: 'hrad',
    battle: null,
    onResize: null,

    persist() { this._unl(); Save.save(); this.refreshTop(); },
    /* vývojářský kód: neomezené mince a drahokamy – zásoba se pořád doplňuje */
    _unl() { const s = this.save; if (s && s.unlimited) { if (s.gold < 9999999) s.gold = 9999999; if (s.gems < 9999999) s.gems = 9999999; } },

    refreshTop() {
      this._unl();
      const s = this.save;
      $('#pName').textContent = s.name;
      $('#pTrophies').textContent = fmt(s.trophies);
      $('#pLevel').textContent = t('castle_level', { n: GameData.calc.castleLevel(s) });
      const tst = s.tester && HraConfig.dev;
      if (tst) { s.gold = Math.max(s.gold, 9999999); s.gems = Math.max(s.gems, 9999999); }
      $('#rGold').textContent = tst ? '∞' : fmt(s.gold);
      $('#rGems').textContent = tst ? '∞' : fmt(s.gems);
      App.paintAvatar($('#avatarCv'), s.avatar);
    },

    go(name, opts = {}) {
      const scroll = this.screenEl.scrollTop;
      this.current = name;
      this.onResize = null;
      cancelAnimationFrame(this.previewRaf);
      if (this._stopLive) { this._stopLive(); this._stopLive = null; }
      if (name === 'skiny') name = 'obchod';
      if (name !== 'online' && window.Online && Online.room && !this.battle) Online.leave();
      const navName = name === 'stavitel' ? 'hrad' : name;
      document.querySelectorAll('#nav [data-go]').forEach(b => {
        if (b.dataset.go === navName) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
      this.screenEl.classList.remove('home-mode');
      Screens[name](this, opts);
      applyIcons(this.screenEl);
      // tutoriály při první návštěvě
      const tut = this.save.tut || (this.save.tut = {});
      if (this.save.lang && !Tutorial.active) {
        if (name === 'hrad' && !tut.home) { tut.home = true; Save.save(); setTimeout(() => Tutorial.run(Tutorial.HOME), 600); }
        if (name === 'stavitel' && !tut.editor) { tut.editor = true; Save.save(); setTimeout(() => Tutorial.run(Tutorial.EDITOR), 500); }
      }
      this.screenEl.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => this.go(b.dataset.go)));
      this.screenEl.scrollTop = opts.keepScroll ? scroll : 0;
      if (location.hash.slice(1) !== name) { try { history.replaceState(null, '', '#' + name); } catch (e) { /* nic */ } }
    },

    /* Profilový obrázek: portrét s pozadím podle tématu */
    paintAvatar(cv, id, size) {
      const A = GameData.avatars.find(a => a.id === id) || GameData.avatars[0];
      const def = GameData.units[A.unit];
      if (!def) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth || size || 44, h = cv.clientHeight || size || 44;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 2, w * 0.5, h * 0.5, w * 0.75);
      g.addColorStop(0, A.bg[0]); g.addColorStop(1, A.bg[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // paprsky v pozadí
      ctx.save(); ctx.globalAlpha = 0.18; ctx.translate(w / 2, h * 0.4);
      for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-w * 0.08, -w); ctx.lineTo(w * 0.08, -w); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); }
      ctx.restore();
      const sc = def.look.scale || 1, top = (def.look.helmet === 'demonking' ? 98 : 86) * sc, bottom = 40 * sc;
      const k = h / (top - bottom);
      ctx.save(); ctx.translate(w / 2 - 3 * sc * k, top * k); ctx.scale(k, k);
      const team = A.team || 'player';
      Art.drawUnit(ctx, def, Art.unitPalette(team, A.skin || 'zakladni', def.faction), { x: 0, y: 0, facing: 1, t: 0, noShadow: true });
      ctx.restore();
    },
    pickAvatar() {
      const s = this.save;
      this.modal(`
        <div class="eyebrow">${t('profile')}</div>
        <h2>${t('pick_avatar')}</h2>
        <div class="av-grid">${GameData.avatars.map(a => `<button class="av-opt ${s.avatar === a.id ? 'on' : ''}" data-av="${a.id}"><canvas></canvas><small>${esc(a.name)}</small></button>`).join('')}</div>
        <div class="modal-actions"><button class="btn" id="avProfile">${t('profile')}</button><button class="btn" data-close>${t('back')}</button></div>`, (c, close) => {
        c.querySelectorAll('[data-av]').forEach(b => {
          requestAnimationFrame(() => this.paintAvatar(b.querySelector('canvas'), b.dataset.av));
          b.addEventListener('click', () => { s.avatar = b.dataset.av; s.avatarChosen = true; this.persist(); close(); });
        });
        c.querySelector('#avProfile').addEventListener('click', () => { close(); this.go('profil'); });
      });
    },

    toast(msg) {
      const t = $('#toast');
      t.textContent = msg; t.hidden = false;
      clearTimeout(this._tt);
      this._tt = setTimeout(() => (t.hidden = true), 2200);
    },

    modal(html, onMount) {
      const m = $('#modal'), c = $('#modalCard');
      c.innerHTML = html;
      applyIcons(c);
      m.hidden = false;
      const close = () => { m.hidden = true; c.innerHTML = ''; };
      c.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
      if (onMount) onMount(c, close);
      const first = c.querySelector('.btn:not([disabled])');
      if (first) first.focus();
      return close;
    },

    /* ---------------- KAMPAŇ ---------------- */
    /* Přepnutí národa (při prvním výběru se ukáže prolog) */
    setFaction(f, opts = {}) {
      const s = this.save;
      if (!GameData.factions[f] || GameData.factions[f].enemyOnly) return;
      if (!GameData.campaignHelpers.factionUnlocked(s, f)) { this.toast(t('t_nation_locked')); return; }
      const changed = s.faction !== f;
      s.faction = f;
      if (!s.avatarChosen && !GameData.factionUnits(f).includes(s.avatar)) s.avatar = GameData.factions[f].roles.tezka;
      this.persist();
      if (changed && !opts.silent) this.toast(t('t_playing', { name: GameData.factions[f].name }));
      if (changed && window.Zvuk && !this.battle) Zvuk.music(f, 'menu');
      if (opts.go) this.go(opts.go, { keepScroll: true });
    },

    /* Příběhová scéna (jen poprvé, pokud force není true) */
    playScene(id, onDone, force) {
      const seen = this.save.seenScenes || (this.save.seenScenes = {});
      if (!force && seen[id]) { if (onDone) onDone(); return; }
      seen[id] = true; Save.save();
      Story.play(id, onDone);
    },

    /* Malá scéna národa: bojiště, hrad a těžká jednotka */
    _paintFactionScene(cv, f) {
      const F = GameData.factions[f];
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = 900, Hh = 600;
      const off = document.createElement('canvas'); off.width = W; off.height = Hh;
      Art.drawBattleBackground(off.getContext('2d'), W, Hh, 9, F.theme);
      const sc = Math.max(w / 560, h / 260);
      ctx.drawImage(off, 0, 300, 560, 260, 0, 0, 560 * sc, 260 * sc);
      ctx.save(); ctx.scale(sc * 0.62, sc * 0.62);
      const img = Art.castleImage('player', this.save.skins.castle, GameData.calc.castleLevel(this.save), 2, F.castleStyle, Object.assign(Screens.castleCfg(this.save), { emblem: (this.save.castleCfg || {}).emblem || GameData.defaultEmblem[f] }));
      Art.drawCastle(ctx, img, 300, h / (sc * 0.62) - 6, 1, 0, 1, F.color);
      ctx.restore();
      const units = F.units;
      units.forEach((id, i) => {
        ctx.save(); ctx.translate(w * (0.56 + i * 0.11), h - 10); const k = h / 120; ctx.scale(k, k);
        Art.drawUnit(ctx, GameData.units[id], Art.unitPalette('player', this.save.skins.unit[id], f), { x: 0, y: 0, facing: 1, t: 0, ring: true });
        ctx.restore();
      });
    },

    openLevel(id) {
      const H = GameData.campaignHelpers;
      const lv = H.find(id);
      if (!lv) return;
      const ch = H.chapters(lv.act).find(c => c.id === lv.chapter);
      const act = H.act(lv.act);
      if (!H.isUnlocked(this.save, id)) { this.toast(t('t_prev_first')); return; }
      // první úroveň aktu: nejdřív příběhová scéna
      if (H.isFirstOfAct(id) && !(this.save.seenScenes || {})[act.scene]) { this.playScene(act.scene, () => this.openLevel(id)); return; }
      if (lv.faction !== 'spojenectvi' && this.save.faction !== lv.faction && GameData.campaignHelpers.factionUnlocked(this.save, lv.faction)) this.setFaction(lv.faction, { silent: true });
      const EF = GameData.factions[lv.enemy];
      lv.enemyUnits = lv.roles.map(r => GameData.unitForRole(lv.enemy, r));
      if (lv.mix) lv.enemyUnits = lv.enemyUnits.concat(lv.mix.roles.map(r => GameData.unitForRole(lv.mix.faction, r)));
      const cleared = !!this.save.campaign.cleared[id];
      const gold = cleared ? Math.round(lv.reward.gold * 0.25) : lv.reward.gold;
      const gems = cleared ? 0 : lv.reward.gems;
      const allyF = lv.alliance ? GameData.factionOrder : [lv.faction];
      this.modal(`
        <div class="eyebrow">${t('act_n', { n: act.n })} · ${t('chapter', { n: ch.id })} · ${esc(ch.name)}</div>
        <h2>${lv.label} ${esc(lv.name)}${lv.boss ? ' <span class="tag tag-demo">Boss</span>' : ''}</h2>
        <p class="muted" style="margin:0">${esc(lv.story)}</p>
        ${lv.alliance ? `<div class="ally-note">${GameData.factionOrder.map(f => `<span class="ally-chip" style="--c:${GameData.factions[f].color}">${esc(GameData.factions[f].name)}</span>`).join('')}<small>${t('alliance_note')}</small></div>` : ''}
        <dl class="kv">
          <dt>${t('difficulty')}</dt><dd><span class="stars">${stars(lv.diff)}</span> ×${lv.diff.toFixed(2).replace('.', ',')}</dd>
          <dt>${t('reward')}</dt><dd>${ico('coin')} ${fmt(gold)}${gems ? ` · ${ico('gem')} ${gems}` : ''}${cleared ? ' ' + t('replay_tag') : ''}</dd>
          <dt>${t('you_play')}</dt><dd>${allyF.map(f => esc(GameData.factions[f].name)).join(' + ')}</dd>
          <dt>${t('enemy')}</dt><dd>${esc(EF.name)}${lv.mix ? ' + ' + esc(GameData.factions[lv.mix.faction].name) : ''}</dd>
          <dt>${t('status')}</dt><dd>${cleared ? t('cleared') : t('not_cleared')}</dd>
        </dl>
        <div><div class="eyebrow" style="margin-bottom:6px">${t('enemy_units')}</div><div class="enemy-icons">${lv.enemyUnits.concat(typeof lv.boss === 'string' ? [lv.boss] : []).map(u => `<canvas data-eu="${u}" title="${GameData.units[u].name}"></canvas>`).join('')}</div></div>
        <div class="modal-actions">
          <button class="btn btn-green btn-big" id="goFight">${t('to_battle')}</button>
          <button class="btn" data-close>${t('back')}</button>
        </div>`, (c, close) => {
        c.querySelectorAll('canvas[data-eu]').forEach(cv => Art.renderUnitIcon(cv, cv.dataset.eu, 'enemy', GameData.units[cv.dataset.eu].faction === lv.enemy ? (lv.unitSkin || 'zakladni') : 'zakladni', { zoom: GameData.units[cv.dataset.eu].boss ? 0.55 : 1 }));
        c.querySelector('#goFight').addEventListener('click', () => {
          close();
          const go = () => this.startBattle({
            mode: 'campaign', title: `${lv.label} ${lv.name}`, difficulty: lv.diff, enemyUnits: lv.enemyUnits,
            enemyFaction: lv.enemy, theme: lv.theme || EF.theme,
            enemyName: lv.name, enemyCastleSkin: lv.castleSkin, enemyUnitSkin: lv.unitSkin, enemyCastleLevel: Math.round(lv.diff * 4),
            alliance: !!lv.alliance, playFaction: lv._pf || lv.faction, boss: typeof lv.boss === 'string' ? lv.boss : null,
            ...(lv.megaCastle ? { enemyCastleStyle: 'peklo3', enemyCastleHpMult: 1.5, world: { worldW: GameData.battleConfig.worldW + 640 } } : {}),
            hostages: lv.hostages || 0,
            level: lv
          });
          // po dokončení příběhu samurajů si hráč v každém zápase vybere armádu
          const pick = !lv.alliance && H.actDone(this.save, 'samurajove');
          const go2 = pick ? () => this.pickArmy(pf => { lv._pf = pf; go(); }) : go;
          if (lv.scene && GameData.scenes[lv.scene]) this.playScene(lv.scene, go2); else go2();
        });
      });
    },

    /* Mimo příběh se hra vždy zeptá, za jakou armádu chceš bojovat */
    pickArmy(onPick) {
      const save = this.save, H = GameData.campaignHelpers;
      this.modal(`
        <div class="eyebrow">${t('pick_army_eyebrow')}</div>
        <h2>${t('pick_army')}</h2>
        <div class="army-grid">${GameData.factionOrder.map(f => {
          const F = GameData.factions[f], un = H.factionUnlocked(save, f);
          return `<button class="army-card" data-army="${f}" ${un ? '' : 'disabled'} style="--c:${F.color}">
            <canvas data-armycv="${f}"></canvas>
            <b>${esc(F.name)}</b><small>${un ? esc(F.people || '') : t('locked_story')}</small>
          </button>`;
        }).join('')}</div>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`, (c, close) => {
        c.querySelectorAll('canvas[data-armycv]').forEach(cv => Art.renderUnitIcon(cv, GameData.factions[cv.dataset.armycv].roles.tezka, 'player', save.skins.unit[GameData.factions[cv.dataset.armycv].roles.tezka], { zoom: 0.9 }));
        c.querySelectorAll('[data-army]').forEach(b => b.addEventListener('click', () => { if (b.disabled) return; close(); onPick(b.dataset.army); }));
      });
    },

    startTraining() {
      this.pickArmy(pf => this._startTraining(pf));
    },
    _startTraining(pf) {
      const f = this.save.faction, F = GameData.factions[f];
      this.startBattle({ playFaction: pf,
        mode: 'training', title: t('training'), difficulty: 0.8, enemyUnits: ['pech', 'strelec', 'tezka'].map(r => F.roles[r]),
        enemyFaction: f, theme: F.theme,
        enemyName: t('training'), enemyCastleSkin: 'kralovsky', enemyUnitSkin: 'zakladni', enemyCastleLevel: 2
      });
    },

    /* ---------------- PVP ---------------- */
    startPvp(oppId) {
      const R = GameData.pvpRules, P = GameData.pvpHelpers;
      const o = P.byId(oppId);
      const hist = this.save.pvp.attacks[oppId] || [];
      if (hist.length >= R.maxAttacks) return;
      const i = hist.length;
      this.pickArmy(pf => this.startBattle({ playFaction: pf,
        mode: 'pvp', title: `${o.name} · ${i + 1}. boj`, difficulty: P.difficulty(o, i),
        enemyUnits: GameData.factionUnits(o.faction), enemyName: o.name,
        enemyFaction: o.faction, theme: GameData.factions[o.faction].theme,
        enemyCastleSkin: o.castleSkin, enemyUnitSkin: o.unitSkin, enemyCastleLevel: o.castleLevel,
        opp: o, attackIndex: i
      }));
    },

    /* ---------------- BITVA ---------------- */
    startBattle(cfg) {
      const save = this.save;
      if (window.Stat) Stat.ev('battle', { p: cfg.mode || 'x' });
      if (this._stopLive) { this._stopLive(); this._stopLive = null; }
      cancelAnimationFrame(this.previewRaf);
      $('#app').hidden = true;
      const B = $('#battle');
      B.hidden = false;
      $('#foeName').textContent = cfg.enemyName || t('enemy');
      $('#bBanner').innerHTML = cfg.mode === 'pvp'
        ? `<span class="tag tag-demo">${t('bot')}</span>${esc(cfg.title)} · ${t('diff_' + cfg.attackIndex)}`
        : cfg.mode === 'online' ? `<span class="tag tag-online">ONLINE</span>${esc(cfg.title || '')}` : esc(cfg.title);
      B.classList.toggle('net', !!cfg.net);
      $('#bWait').hidden = true;
      $('#bPauseMenu').hidden = true;
      if (window.Zvuk) Zvuk.music(cfg.alliance ? 'kralovstvi' : (cfg.playFaction && cfg.playFaction !== 'spojenectvi' ? cfg.playFaction : save.faction), 'battle');
      this._sndBtns();

      // tlačítka jednotek – po národech, každý národ má svůj přepínač AUTO
      const facs = cfg.alliance ? GameData.factionOrder.slice() : [cfg.playFaction && cfg.playFaction !== 'spojenectvi' ? cfg.playFaction : save.faction];
      const groups = facs.map(f => ({ f, units: GameData.factionUnits(f).filter(id => isUnitUnlocked(save, GameData.units[id])) }));
      const units = groups.flatMap(g => g.units);
      let k = 0;
      const autoPref = save.settings.auto || (save.settings.auto = {});
      $('#bUnits').classList.toggle('ally', facs.length > 1);
      document.querySelector('#battle .b-bar').classList.toggle('ally', facs.length > 1);
      $('#bUnits').innerHTML = groups.map(g => {
        const F = GameData.factions[g.f];
        return `<div class="ugrp ${g === groups[0] ? 'open' : ''}" style="--c:${F.color}" data-grp="${g.f}">
          <div class="ugrp-h"><b class="ugrp-pick">${esc(F.name)}</b>
            <button class="auto-tg" data-auto="${g.f}" aria-pressed="false" aria-label="${t('auto_for', { name: esc(F.name) })}"><i></i><span>AUTO</span></button></div>
          <div class="ugrp-b">${g.units.map(id => `
            <button class="ubtn" data-spawn="${id}" aria-label="${esc(GameData.units[id].name)} · ${GameData.units[id].cost}">
              <canvas></canvas><span class="key">${++k <= 9 ? k : ''}</span><i class="cd"></i>
              <span class="cost">${ico('coin')}${GameData.units[id].cost}</span>
            </button>`).join('')}</div>
        </div>`;
      }).join('');
      // 3 speciální útoky, které si hráč vybral v obchodě
      $('#bAbil').innerHTML = (cfg.abil || GameData.skillsOf(save).eq).filter(id => GameData.abilities[id]).map(id => GameData.abilities[id]).map(a => `
        <button class="abtn skill" style="--ac:${a.color}" data-abil="${a.id}" aria-label="${a.name}, cena ${a.cost}" title="${a.name} – ${GameData.skillInfo(a).zoneName}: ${GameData.skillInfo(a).range}. ${t('sk_pow')}: ${GameData.skillInfo(a).dmg}">
          ${GameData.skillIcon(a, 46)}<i class="cd"></i>${a.range && /volley|barrage|breath/.test(a.kind) ? `<span class="rng">${Math.round(a.range / 10)} m</span>` : ''}
          <span class="cost">${a.cost ? ico('coin') + a.cost : t('free')}</span>
        </button>`).join('');
      applyIcons(B);

      const hint = $('#bHint');
      const portrait = window.innerHeight > window.innerWidth;
      hint.textContent = t('hint_battle');
      const banner = $('#bBanner');
      // nápověda jen v prvních třech bitvách, ať nezakrývá bojiště
      save.hintCount = (save.hintCount || 0) + 1;
      const showHint = save.hintCount <= 3;
      hint.hidden = !showHint; hint.style.opacity = showHint ? 1 : 0; banner.hidden = false; banner.style.opacity = 1;
      clearTimeout(this._ht);
      this._ht = setTimeout(() => {
        hint.style.opacity = 0; banner.style.opacity = 0;
        setTimeout(() => { hint.hidden = true; banner.hidden = true; }, 600);
      }, 3500);

      const stats = GameData.calc.battleStats(save);
      let lastHud = {};
      $('#bBoss').hidden = true;
      const bopts = {
        canvas: $('#bCanvas'), mini: $('#bMini'),
        mode: cfg.mode, difficulty: cfg.difficulty, enemyUnits: cfg.enemyUnits,
        world: facs.length > 1 ? Object.assign({}, cfg.world || {}, { playerFront: GameData.battleConfig.playerFront + 560 }) : (cfg.world || null), enemyCastleStyle: cfg.enemyCastleStyle || null, enemyCastleHpMult: cfg.enemyCastleHpMult || 1,
        playerUnits: units, boss: cfg.boss || null, hostages: cfg.hostages || 0, allyFactions: facs.length > 1 ? facs : null,
        playerFaction: (cfg.playFaction && cfg.playFaction !== 'spojenectvi') ? cfg.playFaction : save.faction, enemyFaction: cfg.enemyFaction || 'kralovstvi', theme: cfg.theme || 'evropa',
        enemyCastleSkin: cfg.enemyCastleSkin, enemyUnitSkin: cfg.enemyUnitSkin, enemyCastleLevel: cfg.enemyCastleLevel,
        speed: save.settings.speed || 1,
        seed: (cfg.title || '').length * 31 + 7,
        player: { stats, unitSkins: save.skins.unit, castleSkin: save.skins.castle, castleLevel: GameData.calc.castleLevel(save), castleCfg: Screens.castleCfg(save),
          loadout: id => ({ bonus: GameData.gearHelpers.bonus(save, id), lk: GameData.gearHelpers.look(save, id) }),
          defense: GameData.defenseOf(save) },
        onUpdateHud: b => this._hud(b, lastHud),
        onEnd: res => this._battleEnd(cfg, res),
        onFormation: mode => this._formUi(mode),
        onSpawned: () => { save.stats.unitsSent++; },
        onSquad: (n, mode) => this._squadUi(n, mode),
        onSelectMode: on => { $('#bSelect').setAttribute('aria-pressed', on); $('#bSelHint').hidden = !on; },
        onHero: (u, died) => this._heroUi(u, died),
        onAutoSpawn: () => { save.stats.unitsSent++; }
      };
      // online: nastavení od hostitele (strany, hrady, síla) přepíše místní
      if (cfg.battleOpts) {
        const pl = Object.assign({}, bopts.player, cfg.battleOpts.player || {});
        Object.assign(bopts, cfg.battleOpts, { player: pl });
      }
      const battle = new Battle(bopts);
      if (cfg.net) cfg.net.attach(battle);
      this.battle = battle;
      if (!(save.tut || {}).battle && !cfg.net) {
        save.tut = save.tut || {}; save.tut.battle = true; Save.save();
        battle.togglePause(true);
        setTimeout(() => Tutorial.run(Tutorial.BATTLE, () => battle.togglePause(false)), 450);
      }
      this._formUi('utok');
      this._squadUi(0, null);
      $('#bSelect').setAttribute('aria-pressed', false); $('#bSelHint').hidden = true;
      this._heroUi(null);
      $('#bSpeed').textContent = '×' + battle.speed;

      // ikony jednotek do tlačítek
      requestAnimationFrame(() => {
        B.querySelectorAll('[data-spawn]').forEach(btn => {
          const id = btn.dataset.spawn, def = GameData.units[id], GHp = GameData.gearHelpers, lk = GHp.look(save, id);
          Art.renderUnitIcon(btn.querySelector('canvas'), id, 'player', save.skins.unit[id], { zoom: 0.92, pad: 3, def: GHp.drawDef(def, lk), pal: GHp.palette('player', save.skins.unit[id], def.faction, lk) });
        });
        battle.resize();
      });
      // klepnutí = přidat do zásobníku (až 50×), podržení = vyprázdnit zásobník toho vojáka
      B.querySelectorAll('[data-spawn]').forEach(btn => {
        let lp = null;
        btn.addEventListener('pointerdown', e => {
          e.preventDefault();
          if (battle.over) return;
          // klepnutí na odznak ×N = zrušit jednoho vojáka ze zásobníku
          if (e.target.closest('.qn')) { e.stopPropagation(); battle.dequeueOne(btn.dataset.spawn); return; }
          const r = battle.enqueue(btn.dataset.spawn);
          if (r === 'full') this._flash(btn);
          clearTimeout(lp);
          lp = setTimeout(() => { battle.clearQueue(btn.dataset.spawn); this.toast(t('queue_cleared')); }, 650);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, () => clearTimeout(lp)));
      });
      // spojenectví: vojáci jednoho národa najednou, klepnutím na jméno národa se přepne
      B.querySelectorAll('.ugrp-pick').forEach(n => n.addEventListener('pointerdown', e => {
        e.preventDefault();
        B.querySelectorAll('.ugrp').forEach(g => g.classList.toggle('open', g === n.closest('.ugrp')));
        requestAnimationFrame(() => B.querySelectorAll('.ugrp.open [data-spawn]').forEach(btn => {
          const id = btn.dataset.spawn, def = GameData.units[id], GHp = GameData.gearHelpers, lk = GHp.look(save, id);
          Art.renderUnitIcon(btn.querySelector('canvas'), id, 'player', save.skins.unit[id], { zoom: 0.92, pad: 3, def: GHp.drawDef(def, lk), pal: GHp.palette('player', save.skins.unit[id], def.faction, lk) });
        }));
      }));
      B.querySelectorAll('[data-auto]').forEach(btn => {
        const f = btn.dataset.auto;
        const setUi = on => { btn.setAttribute('aria-pressed', on); btn.closest('.ugrp').classList.toggle('auto-on', on); };
        if (autoPref[f]) { battle.setAuto(f, true); setUi(true); }
        btn.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          const on = !battle.auto[f];
          battle.setAuto(f, on); setUi(on);
          autoPref[f] = on; Save.save();
          this.toast(t(on ? 't_auto_on' : 't_auto_off', { name: GameData.factions[f].name }));
        });
      });
      B.querySelectorAll('[data-abil]').forEach(btn => btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (battle.useAbility('player', btn.dataset.abil)) return;
        this._flash(btn);
        const st = battle.abilityState('player', btn.dataset.abil), a = GameData.abilities[btn.dataset.abil];
        if (!st.inRange && st.cdLeft <= 0) battle.texts.push({ x: battle.cam.x + battle.cam.viewW / 2, y: (battle.H - battle.cam.viewH) + battle.cam.viewH * 0.42, txt: t('sk_out', { n: Math.round(a.range / 10) }), color: '#ffd27a', t: 0, life: 2, big: true });
      }));
    },

    _heroUi(u, died) {
      const p = $('#bHero');
      p.hidden = !u;
      p.querySelectorAll('.on').forEach(b => b.classList.remove('on'));
      if (u) $('#heroName').textContent = u.def.name;
      if (died) this.toast(t('t_hero_fell'));
    },

    _squadUi(n, mode) {
      const p = $('#bSquad');
      p.hidden = !n;
      $('#sqCount').textContent = n;
      p.querySelectorAll('[data-sq]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sq === mode));
    },

    _formUi(kind) {
      document.querySelectorAll('#bOrders [data-order]').forEach(b => b.setAttribute('aria-pressed', b.dataset.order === kind));
    },

    _flash(btn) {
      btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 });
    },

    _hud(b, last) {
      const P = b.side.player, E = b.side.enemy;
      const set = (k, v, fn) => { if (last[k] !== v) { last[k] = v; fn(v); } };
      set('hpMe', Math.ceil(P.castle.hp), v => { $('#hpMe').style.width = $('#hpMeT').style.width = (v / P.castle.maxHp * 100) + '%'; $('#hpMeNum').textContent = `${fmt(v)} / ${fmt(P.castle.maxHp)}`; });
      set('hpFoe', Math.ceil(E.castle.hp), v => { $('#hpFoe').style.width = $('#hpFoeT').style.width = (v / E.castle.maxHp * 100) + '%'; $('#hpFoeNum').textContent = `${fmt(v)} / ${fmt(E.castle.maxHp)}`; });
      const tl = Math.floor(b.time);   // ukazuje, jak dlouho bitva trvá (bez časového limitu)
      if (b.bossUnit) {
        const u = b.bossUnit, alive = !u.dead;
        set('bossOn', alive, v => { $('#bBoss').hidden = !v; if (v) $('#bossName').textContent = u.def.name; });
        if (alive) set('bossHp', Math.round(u.hp / u.maxHp * 200), v => ($('#bossHp').style.width = (v / 2) + '%'));
      }
      if (b.hero) { const r = Math.max(0, b.hero.hp / b.hero.maxHp); set('heroHp', Math.round(r * 100), v => ($('#heroHp').style.width = v + '%')); }
      set('time', tl, v => { const el = $('#bTimer'); el.textContent = `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`; el.classList.remove('low'); });
      const coins = Math.floor(P.coins);
      set('coins', coins, v => { $('#bCoinNum').textContent = v; $('#bCoins').style.setProperty('--p', ((v % 500) / 5) + '%'); });
      const alive = b.units.filter(u => u.team === 'player' && !u.dead).length;
      set('alive', alive, v => ($('#bAlive').textContent = v));
      const qn = (b.queue || []).length;
      set('max', qn, v => ($('#bCoinMax').textContent = v ? t('queue_n', { n: v }) : ''));
      document.querySelectorAll('#bUnits [data-spawn]').forEach(btn => {
        const n = b.queueCount(btn.dataset.spawn);
        set('q' + btn.dataset.spawn, n, v => {
          let q = btn.querySelector('.qn');
          if (!q) { q = document.createElement('b'); q.className = 'qn'; btn.appendChild(q); }
          q.innerHTML = v ? `×${v}<i class="qx">✕</i>` : ''; q.hidden = !v;
        });
      });
      document.querySelectorAll('#bUnits [data-spawn]').forEach(btn => {
        const def = GameData.units[btn.dataset.spawn];
        const cdEnd = P.cooldowns[def.id] || 0;
        const cd = Math.max(0, (cdEnd - b.time) / def.spawnCooldown);
        const key = 'u' + def.id;
        const val = (P.coins >= def.cost ? 1 : 0) + '|' + Math.round(cd * 40);
        set(key, val, () => {
          btn.classList.toggle('poor', P.coins < def.cost);
          btn.querySelector('.cd').style.setProperty('--cd', cd.toFixed(3));
        });
      });
      document.querySelectorAll('#bAbil [data-abil]').forEach(btn => {
        const st = b.abilityState('player', btn.dataset.abil);
        const val = (st.affordable ? 1 : 0) + '|' + (st.inRange ? 1 : 0) + '|' + Math.round(st.cdLeft / st.cdTotal * 40);
        set('a' + btn.dataset.abil, val, () => {
          btn.classList.toggle('poor', !st.affordable);
          btn.classList.toggle('far', !st.inRange);
          btn.querySelector('.cd').style.setProperty('--cd', (st.cdLeft / st.cdTotal).toFixed(3));
        });
      });
    },

    /* přepínače zvuku a hudby v pauze */
    _sndBtns() {
      const box = $('#bSnd'); if (!box || !window.Zvuk) return;
      const st = Zvuk.settings();
      box.innerHTML = `<button class="btn btn-sm" data-snd="sfx">${st.sfx ? '🔊' : '🔇'} ${t('snd_sfx')}</button><button class="btn btn-sm" data-snd="music">${st.music ? '🎵' : '🔇'} ${t('snd_music')}</button>`;
      box.querySelectorAll('[data-snd]').forEach(b => b.addEventListener('click', () => { Zvuk.toggle(b.dataset.snd); this._sndBtns(); }));
    },

    _closeBattle() {
      if (this.battle) { this.battle.destroy(); this.battle = null; }
      if (window.Zvuk) Zvuk.music(this.save.faction, 'menu');
      $('#battle').hidden = true;
      $('#app').hidden = false;
    },

    /* Vyhodnocení bitvy a odměny */
    _battleEnd(cfg, res) {
      const save = this.save, R = GameData.pvpRules;
      if (!this.battle) return;
      if (window.Stat) Stat.ev(res.win ? 'win' : 'loss', { p: cfg.mode || 'x' });
      save.stats.kills += res.kills;
      if (res.win) save.stats.wins++; else save.stats.losses++;
      const rewards = [];
      let note = '', stars = 0;
      const coopLocked = cfg.coop && !GameData.campaignHelpers.isUnlocked(save, cfg.level.id);
      if (cfg.coop && res.reason === 'spojeni') note = t('onl_conn_lost');
      else if (coopLocked) {
        if (res.win) { const g = Math.round(cfg.level.reward.gold * 0.5); save.gold += g; rewards.push(`<span class="pill">${ico('coin')} +${fmt(g)}</span>`); }
        note = t('onl_coop_locked');
      } else if (cfg.mode === 'campaign' || cfg.coop) {
        const lv = cfg.level;
        const first = !save.campaign.cleared[lv.id];
        if (res.win) {
          // hvězdy podle toho, kolik zůstalo z tvého hradu: 80 % a víc = 3, 50 % a víc = 2, jinak 1
          stars = res.playerHp >= 0.8 ? 3 : res.playerHp >= 0.5 ? 2 : 1;
          save.campaign.stars = save.campaign.stars || {};
          const prevStars = save.campaign.stars[lv.id] || (first ? 0 : 1);
          if (stars > prevStars) {
            save.campaign.stars[lv.id] = stars;
            if (stars === 3) { save.gems += 15; rewards.push(`<span class="pill">${ico('gem')} +15 · ★★★</span>`); }
          }
          const gold = first ? lv.reward.gold : Math.round(lv.reward.gold * 0.25);
          const gems = first ? lv.reward.gems : 0;
          save.gold += gold; save.gems += gems;
          rewards.push(`<span class="pill">${ico('coin')} +${fmt(gold)}</span>`);
          if (gems) rewards.push(`<span class="pill">${ico('gem')} +${gems}</span>`);
          if (first) {
            save.campaign.cleared[lv.id] = true;
            const unlockedUnit = GameData.unitOrder.map(id => GameData.units[id]).find(u => u.unlock && u.unlock.campaign === lv.id);
            if (unlockedUnit) note = t('unit_unlocked', { name: `<b>${unlockedUnit.name}</b>` });
            const H = GameData.campaignHelpers;
            const ch = H.chapters(lv.act).find(c => c.id === lv.chapter);
            if (lv.boss && ch.outro) note += (note ? '<br>' : '') + `<i class="outro">${esc(ch.outro)}</i>`;
            const next = H.currentLevel(save);
            if (next && next.act !== lv.act) {
              const na = H.act(next.act);
              this.storyAct = next.act;
              note += (note ? '<br>' : '') + `<b>${t('act_done', { n: H.act(lv.act).n })}</b> ` + t('act_unlocked', { n: na.n, name: esc(na.huge ? na.name : na.faction === 'spojenectvi' ? t('alliance') : GameData.factions[na.faction].name) });
            } else if (next) note += (note ? '<br>' : '') + t('level_unlocked', { name: `<b>${next.label} ${esc(next.name)}</b>` });
            else { note += (note ? '<br>' : '') + `<b>${t('campaign_done')}</b>`; }
            if (lv.afterScene) cfg.afterScene = lv.afterScene;
            if (lv.hostages) { save.gems += lv.hostages * 10; note += (note ? '<br>' : '') + t('hostages_saved', { n: lv.hostages, g: lv.hostages * 10 }); }
          }
        } else note = t('note_tip');
      } else if (cfg.mode === 'pvp') {
        const id = cfg.opp.id;
        save.pvp.attacks[id] = (save.pvp.attacks[id] || []).concat([res.win ? 'win' : 'loss']);
        const i = cfg.attackIndex;
        if (res.win) {
          save.trophies += R.trophyReward[i]; save.gold += R.goldReward[i]; save.stats.pvpWins++;
          rewards.push(`<span class="pill">${ico('trophy')} +${R.trophyReward[i]}</span>`, `<span class="pill">${ico('coin')} +${R.goldReward[i]}</span>`);
        } else {
          save.trophies = Math.max(0, save.trophies - R.trophyLoss); save.stats.pvpLosses++;
          rewards.push(`<span class="pill">${ico('trophy')} −${R.trophyLoss}</span>`);
        }
        const left = R.maxAttacks - save.pvp.attacks[id].length;
        note = left > 0 ? t('pvp_left', { name: esc(cfg.opp.name), n: left }) : t('pvp_none', { name: esc(cfg.opp.name) });
      } else if (cfg.mode === 'online') {
        const duo = cfg.online === '2v2';
        if (res.reason === 'spojeni') note = t('onl_conn_lost');
        else if (res.win) {
          const tr = duo ? 20 : 30, g = duo ? 250 : 300;
          save.trophies += tr; save.gold += g; save.stats.pvpWins++;
          rewards.push(`<span class="pill">${ico('trophy')} +${tr}</span>`, `<span class="pill">${ico('coin')} +${g}</span>`);
          if (res.reason === 'odpojeni') note = t('onl_foe_left');
        } else {
          const tl = duo ? 10 : 15;
          save.trophies = Math.max(0, save.trophies - tl); save.gold += 50; save.stats.pvpLosses++;
          rewards.push(`<span class="pill">${ico('trophy')} −${tl}</span>`, `<span class="pill">${ico('coin')} +50</span>`);
        }
      } else {
        if (res.win) { save.gold += 100; rewards.push(`<span class="pill">${ico('coin')} +100</span>`); }
        note = t('note_training');
      }
      const qDone = window.Ukoly ? Ukoly.onBattle(save, cfg, res, stars) : 0;
      if (qDone) note += (note ? '<br>' : '') + `${ico('crown')} ${t('quests_ready', { n: qDone })}`;
      this.persist();
      // nejlepší jednotka bitvy (MVP) a přehled podle druhu vojáka
      const ST = res.st || { dmg: {}, kills: {}, sent: {} };
      const ids = Object.keys(Object.assign({}, ST.sent, ST.dmg)).filter(id => GameData.units[id]);
      ids.sort((a, b) => (ST.dmg[b] || 0) - (ST.dmg[a] || 0));
      const mvp = ids[0] && (ST.dmg[ids[0]] || 0) > 0 ? ids[0] : null;
      const statsHtml = ids.length ? `<div class="bstats">
          ${mvp ? `<div class="mvp"><canvas data-mvp="${mvp}"></canvas><div><small>${t('mvp')}</small><b>${esc(GameData.units[mvp].name)}</b><span>${fmt(ST.dmg[mvp] || 0)} ${t('dmg_word')} · ${ST.kills[mvp] || 0} ${t('kills_word')}</span></div></div>` : ''}
          <table class="bst"><tr><th></th><th>${t('sent')}</th><th>${t('dmg_word')}</th><th>${t('kills_word')}</th></tr>
          ${ids.slice(0, 7).map(id => `<tr><td>${esc(GameData.units[id].name)}</td><td>${ST.sent[id] || 0}</td><td>${fmt(ST.dmg[id] || 0)}</td><td>${ST.kills[id] || 0}</td></tr>`).join('')}</table>
        </div>` : '';
      const reason = res.reason === 'cas' ? t('r_time') : res.reason === 'spojeni' ? t('onl_conn_lost') : res.reason === 'odpojeni' ? t('onl_foe_left') : res.reason === 'vzdal' ? t('onl_you_quit') : (res.win ? t('r_enemy') : t('r_you'));
      const back = cfg.net ? 'online' : cfg.mode === 'pvp' ? 'pvp' : (cfg.mode === 'campaign' ? 'pribeh' : 'hrad');
      this.modal(`
        <div class="result-title ${res.win ? 'win' : 'loss'}">${res.win ? t('victory') : t('defeat')}</div>
        ${stars ? `<div class="res-stars">${[1, 2, 3].map(i => `<i class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</i>`).join('')}</div><p class="muted res-stars-note">${t('stars_note')}</p>` : ''}
        <p style="text-align:center;margin:0" class="muted">${reason}</p>
        ${rewards.length ? `<div class="reward-row">${rewards.join('')}</div>` : ''}
        <dl class="kv">
          <dt>${t('battle_lbl')}</dt><dd>${esc(cfg.title)}</dd>
          <dt>${t('duration')}</dt><dd>${Math.floor(res.time / 60)}:${String(Math.floor(res.time % 60)).padStart(2, '0')}</dd>
          <dt>${t('kills')}</dt><dd>${res.kills}</dd>
          <dt>${t('sent')}</dt><dd>${res.sent}</dd>
          <dt>${t('your_castle')}</dt><dd>${Math.round(res.playerHp * 100)} %</dd>
        </dl>
        ${statsHtml}
        ${note ? `<div class="notice"><div>${note}</div></div>` : ''}
        <div class="modal-actions">
          <button class="btn btn-gold" id="resBack">${t('continue')}</button>
        </div>`, (c, close) => {
        const mc = c.querySelector('canvas[data-mvp]');
        if (mc) Art.renderUnitIcon(mc, mc.dataset.mvp, 'player', save.skins.unit[mc.dataset.mvp], { headshot: true, noShadow: true });
        c.querySelector('#resBack').addEventListener('click', () => {
          close(); this._closeBattle(); if (cfg.net && window.Online) Online.afterBattle(); this.go(back);
          if (cfg.afterScene && !cfg.net) this.playScene(cfg.afterScene, null, true);
        });
      });
    },

    /* Změna jazyka (ze startu nebo z profilu) */
    setLang(l) {
      this.save.lang = l;
      I18N.set(l); I18N.localizeData(); I18N.apply(document);
      this.persist();
      if (!this.battle) this.go(this.current || 'hrad', { keepScroll: true });
    },

    init() {
      if (window.Platby && Platby.init) Platby.init(this);
      // POJISTKA KLIKNUTÍ: když prohlížeč stisk tlačítka „spolkne“ (prst/myš se při stisku
      // trochu posune, označí se text, okno nebylo aktivní…), tlačítko se stejně spustí.
      (() => {
        const SEL = 'button, .btn, [data-close], [data-go], a[href]';
        let downEl = null, pending = null;
        document.addEventListener('pointerdown', e => { downEl = e.button === 0 ? e.target.closest(SEL) : null; }, true);
        document.addEventListener('pointerup', e => {
          const el = e.target.closest && e.target.closest(SEL);
          const tgt = el && el === downEl ? el : null; downEl = null;
          if (!tgt || tgt.disabled || tgt.closest('#battle')) return;
          const tok = pending = {};
          setTimeout(() => { if (pending === tok && tgt.isConnected && !tgt.disabled) { pending = null; tgt.click(); } }, 350);
        }, true);
        document.addEventListener('click', () => { pending = null; }, true);
        document.addEventListener('selectstart', e => { if (!e.target.closest || !e.target.closest('input, textarea, [contenteditable], .rescue-code')) e.preventDefault(); }, true);
      })();
      // skin s omezením (např. jezdecký) nasazený na jinou jednotku → vrátit základní
      Object.keys(this.save.skins.unit || {}).forEach(u => { const sk = GameData.unitSkins.find(x => x.id === this.save.skins.unit[u]); if (sk && sk.only && !sk.only.includes(u)) this.save.skins.unit[u] = 'zakladni'; });
      // hra je jen na šířku – na telefonu zkusí celou obrazovku a zamknout orientaci
      const lockLand = () => {
        if (!matchMedia('(pointer: coarse)').matches) return;
        const de = document.documentElement;
        const lock = () => { try { const p = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (p && p.catch) p.catch(() => {}); } catch (_) {} };
        try {
          if (!document.fullscreenElement && de.requestFullscreen) de.requestFullscreen({ navigationUI: 'hide' }).then(lock).catch(lock);
          else lock();
        } catch (_) { lock(); }
      };
      lockLand();
      document.addEventListener('pointerdown', lockLand, { once: true, capture: true });
      // bez zapojených plateb se věci za skutečné peníze v obchodě neukazují
      document.body.classList.toggle('paid-off', !Platby.on());
      // trofeje se počítají od nuly – kdo ještě nehrál souboj, nemá mít darované trofeje
      const stt = this.save.stats || {};
      if (!this.save.mig_tro0) {
        if (this.save.trophies === 1200 && !(stt.pvpWins || 0) && !(stt.pvpLosses || 0)) { this.save.trophies = 0; this.save.pvp.opponents = []; }
        this.save.mig_tro0 = 1; Save.save();
      }
      // skiny 2.0: skiny po jednotkách, Zbrojnice převedená na skiny (jednou, nic se neztratí)
      if (GameData.skinMigrate && GameData.skinMigrate(this.save)) Save.save();
      if (GameData.andelUpgrade && GameData.andelUpgrade(this.save)) Save.save();
      // národ, který ještě není odemčený příběhem, nelze hrát
      if (!GameData.campaignHelpers.factionUnlocked(this.save, this.save.faction)) { this.save.faction = 'kralovstvi'; this.save.avatar = 'rytir'; }
      I18N.set(this.save.lang || (navigator.language || 'cs').slice(0, 2));
      I18N.localizeData();
      I18N.apply(document);
      applyIcons(document);
      this.refreshTop();
      document.querySelectorAll('#nav [data-go]').forEach(b => b.addEventListener('click', () => this.go(b.dataset.go)));
      $('#avatarBtn').addEventListener('click', () => this.pickAvatar());
      $('#profileName').addEventListener('click', () => this.go('profil'));
      // tajný testovací režim: 7× rychle klepnout na zlato = neomezené zlato a drahokamy (znovu 7× = vypnout)
      let taps = [];
      $('#rGold').parentElement.addEventListener('click', () => {
        const now = Date.now(); taps = taps.filter(x => now - x < 2500); taps.push(now);
        if (taps.length >= 7 && HraConfig.dev) {
          taps = []; this.save.tester = !this.save.tester;
          if (!this.save.tester) { this.save.gold = 50000; this.save.gems = 5000; }
          this.persist(); this.toast(this.save.tester ? t('tester_on') : t('tester_off'));
          if (this.current) this.go(this.current, { keepScroll: true });
        }
      });
      $('#bPause').addEventListener('click', () => { if (!this.battle || this.battle.over) return; this.battle.togglePause(true); $('#bPauseMenu').hidden = false; });
      $('#bResume').addEventListener('click', () => { $('#bPauseMenu').hidden = true; this.battle && this.battle.togglePause(false); });
      $('#bQuit').addEventListener('click', () => {
        $('#bPauseMenu').hidden = true;
        const b = this.battle;
        if (!b) return;
        b.togglePause(false);
        if (b.net && b.net.role === 'client') {
          // klient se vzdá: hostitel to dostane, místně je to prohra
          if (!b.net.ended) { b.net.cmd({ k: 'q' }); b.net.ended = true; b.side.player.castle.hp = 0; b._end(false, 'vzdal'); }
          return;
        }
        b.side.player.castle.hp = 0;   // vzdání = prohra
      });
      $('#bSelect').addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        if (this.battle && !this.battle.over) this.battle.setSelectMode();
      });
      document.querySelectorAll('#bSquad [data-sq]').forEach(btn => btn.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        if (this.battle && !this.battle.over) this.battle.setSquad(btn.dataset.sq);
      }));
      $('#sqDisband').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (this.battle) this.battle.disbandSquad(); });
      document.querySelectorAll('#bOrders [data-order]').forEach(btn => btn.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        if (!this.battle || this.battle.over) return;
        const k = btn.dataset.order;
        this.battle.order(k);
        if (k === 'ustup') this.toast(t('retreat_hint'));
        else if (k === 'hradby') this.toast(t('walls_hint'));
        else if (k === 'stred') this.toast(t('center_hint'));
      }));
      // ovládání hrdiny – držení tlačítek
      const ctrlSet = () => {
        const b = this.battle; if (!b || !b.ctrl) return;
        const on = k => document.querySelector(`#bHero [data-mv="${k}"]`).classList.contains('on') || this._keys[k];
        b.ctrl.mx = (on('right') ? 1 : 0) - (on('left') ? 1 : 0);
        b.ctrl.my = (on('down') ? 1 : 0) - (on('up') ? 1 : 0);
        b.ctrl.attack = document.querySelector('#bHero [data-hact="attack"]').classList.contains('on') || !!this._keys.attack;
        b.ctrl.block = document.querySelector('#bHero [data-hact="block"]').classList.contains('on') || !!this._keys.block;
      };
      this._keys = {};
      this._ctrlSet = ctrlSet;
      document.querySelectorAll('#bHero .pb, #bHero .hb').forEach(btn => {
        const down = e => { e.preventDefault(); e.stopPropagation(); try { btn.setPointerCapture(e.pointerId); } catch (x) { /* nic */ } btn.classList.add('on'); ctrlSet(); };
        const up = e => { btn.classList.remove('on'); ctrlSet(); };
        btn.addEventListener('pointerdown', down);
        btn.addEventListener('pointerup', up);
        btn.addEventListener('pointercancel', up);
        btn.addEventListener('lostpointercapture', up);
        btn.addEventListener('contextmenu', e => e.preventDefault());
      });
      $('#heroExit').addEventListener('click', () => { if (this.battle) this.battle.releaseHero(); });
      const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', x: 'attack', X: 'attack', c: 'block', C: 'block' };
      window.addEventListener('keydown', e => {
        if (!this.battle || !this.battle.hero) return;
        if (e.key === 'Escape') { this.battle.releaseHero(); return; }
        const k = keyMap[e.key]; if (!k) return;
        e.preventDefault(); this._keys[k] = true; ctrlSet();
      });
      window.addEventListener('keyup', e => { const k = keyMap[e.key]; if (k) { this._keys[k] = false; ctrlSet(); } });
      $('#bSpeed').addEventListener('click', () => {
        if (!this.battle) return;
        const v = this.battle.speed === 1 ? 2 : 1;
        this.battle.setSpeed(v); this.save.settings.speed = v; Save.save();
        $('#bSpeed').textContent = '×' + v;
      });
      window.addEventListener('keydown', e => {
        const b = this.battle;
        if (!b || $('#battle').hidden) return;
        if (e.code === 'Space') { e.preventDefault(); $('#bPause').click(); return; }
        const n = parseInt(e.key, 10);
        const btns = document.querySelectorAll('#bUnits [data-spawn]');
        if (n >= 1 && n <= btns.length && !b.paused) b.enqueue(btns[n - 1].dataset.spawn);
        const ab = document.querySelectorAll('#bAbil [data-abil]'), ki = { q: 0, w: 1, e: 2 }[e.key.toLowerCase()];
        if (ki != null && ab[ki]) b.useAbility('player', ab[ki].dataset.abil);
        const fk = { d: 'utok', a: 'ustup', s: 'hradby', f: 'stred' }[e.key.toLowerCase()];
        if (fk) b.order(fk);
      });
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (this.onResize) this.onResize(); else if (this.current === 'hrad' && !this.battle) this.go('hrad', { keepScroll: true }); }, 150); });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.battle && !this.battle.over) { this.battle.togglePause(true); $('#bPauseMenu').hidden = false; }
      });
      if (window.Online) {
        Online.on('lobby', () => { if (this.current === 'online' && !this.battle) this.go('online', { keepScroll: true }); });
        Online.on('error', k => { this.toast(t(k)); if (this.current === 'online' && !this.battle) this.go('online', { keepScroll: true }); });
        Online.on('start', bc => { $('#modal').hidden = true; this.startBattle(bc); });
        Online.on('wait', on => { const w = $('#bWait'); if (w && w.hidden === !!on) w.hidden = !on; });
      }
      const start = location.hash.slice(1);
      // výběr jazyka: při prvním spuštění a jednou po přejmenování na Castle WARS (postup zůstává)
      if (!this.save.lang || !this.save.langAsked2) {
        this.go('hrad');
        Tutorial.pickLanguage(l => { this.save.langAsked2 = 1; this.setLang(l); });
      } else {
        this.go('hrad');   // po spuštění vždy hrad
        // denní odměna zdarma: hráč, který už má tutoriál za sebou, ji uvidí hned
        if ((this.save.tut || {}).home && Denni.available(this.save)) setTimeout(() => { if (!this.battle && !Tutorial.active) Denni.open(this); }, 700);
      }
      // fonty se načítají asynchronně – po načtení překresli plátna s textem
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!this.battle) this.go(this.current, { keepScroll: true }); });
    }
  };

  window.App = App;
  App.init();
})();
