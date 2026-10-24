/* =========================================================================
   BOJOVÝ ENGINE
   Herní logika (update) je oddělená od vykreslování (render), takže se dá
   později přenést na server (autoritativní simulace pro online PvP).
   ========================================================================= */
(function () {
  const C = () => GameData.battleConfig;
  const US = () => C().unitScale || 1;

  /* Mezipaměť snímků postav: každá póza (krok chůze, fáze útoku, pád)
     se vykreslí jen jednou a pak se jen kopíruje. Hra tak zůstane plynulá
     i se stovkou detailních vojáků. */
  class SpriteCache {
    constructor(max) { this.map = new Map(); this.max = max || 280; this.r = 1; }
    setRes(r) {
      r = Math.round(Math.max(0.8, Math.min(1.8, r)) * 10) / 10;
      if (r !== this.r) { this.r = r; this.map.clear(); }
    }
    get(def, pal, palKey, frame, st, scaleMul) {
      const key = def.id + '|' + palKey + '|' + frame;
      let e = this.map.get(key);
      if (e) { this.map.delete(key); this.map.set(key, e); return e; }
      const s = (def.look.scale || 1) * scaleMul;
      const M = !!pal.mount;
      const bx0 = (M ? -62 : -40) * s, by0 = (M ? -170 : -132) * s, bw = (M ? 172 : 130) * s, bh = (M ? 186 : 148) * s;
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(bw * this.r); cv.height = Math.ceil(bh * this.r);
      const c = cv.getContext('2d');
      c.scale(this.r, this.r); c.translate(-bx0, -by0);
      Art.drawUnit(c, def, pal, Object.assign({ x: 0, y: 0, facing: 1, scaleMul, ring: true, t: 0 }, st));
      e = { cv, bx0, by0, bw, bh };
      this.map.set(key, e);
      if (this.map.size > this.max) this.map.delete(this.map.keys().next().value);
      return e;
    }
  }

  class Battle {
    /**
     * opts = {
     *   canvas, mode: 'campaign'|'pvp'|'training', difficulty,
     *   enemyUnits: ['pesak',...], enemyName, enemyCastleSkin, enemyUnitSkin, enemyCastleLevel,
     *   player: { stats (z GameData.calc.battleStats), unitSkins, castleSkin, castleLevel },
     *   onUpdateHud(state), onEnd(result)
     * }
     */
    constructor(opts) {
      this.o = opts;
      // bitva může mít jiné rozměry bojiště (finále: obří pevnost)
      if (opts.world) { this._baseCfg = GameData.battleConfig; GameData.battleConfig = Object.assign({}, this._baseCfg, opts.world); }
      this.canvas = opts.canvas;
      this.ctx = this.canvas.getContext('2d');
      const cfg = C();
      this.W = cfg.worldW; this.H = cfg.worldH;
      this.time = 0;
      this.timeLeft = cfg.timeLimit;
      this.speed = opts.speed || 1;
      this.paused = false;
      this.over = false;
      this.units = [];
      this.projectiles = [];
      this.particles = [];
      this.texts = [];
      this.meteors = [];
      this.nextId = 1;
      this.kills = 0;
      this.sent = 0;
      this.rand = Math.random;

      const ps = opts.player.stats;
      const es = GameData.calc.enemyStats(opts.difficulty);
      this.side = {
        player: {
          coins: cfg.startCoins, income: ps.income, maxCoins: ps.maxCoins,
          hpMult: ps.unitMult, dmgMult: ps.unitMult,
          castle: { hp: ps.castleHp * (opts.player.castleCfg && opts.player.castleCfg.big ? 1.25 : 1), maxHp: ps.castleHp * (opts.player.castleCfg && opts.player.castleCfg.big ? 1.25 : 1), front: cfg.playerFront, tower: ps.towerDmg, towerTimer: 1 },
          cooldowns: {}, abilityCd: {}, shieldUntil: 0,
          formation: 'utok', flagX: cfg.playerFront + 380,
          castleImg: Art.castleImage('player', opts.player.castleSkin, opts.player.castleLevel, 2, (GameData.factions[opts.playerFaction] || {}).castleStyle || 'evropa', opts.player.castleCfg || null),
          faction: opts.playerFaction || 'kralovstvi',
          skins: opts.player.unitSkins
        },
        enemy: {
          coins: cfg.startCoins, income: es.income, maxCoins: es.maxCoins,
          hpMult: es.hpMult, dmgMult: es.dmgMult,
          castle: { hp: es.castleHp * (opts.enemyCastleHpMult || 1), maxHp: es.castleHp * (opts.enemyCastleHpMult || 1), front: cfg.enemyFront, tower: es.towerDmg, towerTimer: 1.5 },
          cooldowns: {}, abilityCd: {}, shieldUntil: 0,
          formation: 'formace', flagX: cfg.enemyFront - 200,
          castleImg: Art.castleImage('enemy', opts.enemyCastleSkin || 'kralovsky', opts.enemyCastleLevel || 3, opts.enemyCastleStyle ? 1.5 : 2, opts.enemyCastleStyle || (GameData.factions[opts.enemyFaction] || {}).castleStyle || 'evropa'),
          faction: opts.enemyFaction || 'kralovstvi',
          skins: null
        }
      };
      // AI sbírá vojáky do vlny a pak zaútočí
      this.ai = { next: null, think: 0, gatherStart: 0, wave: Math.min(9, Math.round(3 + opts.difficulty * 2.5)) };
      // automatické vysílání hráčových vojáků – každý národ má vlastní přepínač
      this.playerUnits = opts.playerUnits || [];
      this.auto = {};
      this.autoState = {};
      this.bossPlan = opts.boss ? { id: opts.boss, at: 18, spawned: false } : null;
      // obrana hradu hráče (lučištníci, kušiníci, katapulty na hradbách)
      this.def = opts.player.defense || null;
      this.defShot = []; this.defTimer = [];
      this.clouds = []; this.bolts = [];
      if (this.def && this.def.slots.length) {
        this.side.player.castle.tower = 0;   // věž nahrazují obránci na hradbách
        this.def.slots.forEach((_, i) => (this.defTimer[i] = 0.6 + i * 0.35));
      }
      this.palCache = {};

      // pozadí
      this.theme = opts.theme || 'evropa';
      const dprRes = Math.min(window.devicePixelRatio || 1, 2) > 1.5 ? 1.5 : 1.15;
      this.layers = Art.makeLayers(this.W, this.H, opts.seed || 11, this.theme, dprRes);
      // ambientní částice (sakura, sníh)
      this.ambient = [];
      const amb = (window.ArtThemes && ArtThemes.ambient || {})[this.theme];
      if (amb) for (let i = 0; i < amb.count; i++) this.ambient.push(this._ambientP(amb, true));

      this.sprites = new SpriteCache(300);
      // kamera
      this.cam = { x: 0, scale: 1, manualUntil: 0, viewW: this.W };
      this._bindInput();
      this.resize();
      this._loop = this._loop.bind(this);
      this._last = performance.now();
      this.raf = requestAnimationFrame(this._loop);
    }

    /* ---------------- vstup a kamera ---------------- */
    _bindInput() {
      let drag = null;
      const toWorld = (cx, cy) => {
        const r = this.canvas.getBoundingClientRect();
        return [this.cam.x + (cx - r.left) / this.cam.scale, (this.H - this.cam.viewH) + (cy - r.top) / this.cam.scale];
      };
      this._toWorld = toWorld;
      this._onDown = e => {
        drag = { x: e.clientX, y: e.clientY, cam: this.cam.x, moved: false, sel: !!this.selectMode };
        if (drag.sel) { const w = toWorld(e.clientX, e.clientY); this.selRect = { x0: w[0], y0: w[1], x1: w[0], y1: w[1] }; }
        // podržení prstu = začátek výběru oddílu
        clearTimeout(this._lp);
        if (!drag.sel && !this.hero) this._lp = setTimeout(() => {
          if (!drag || drag.moved || this.over) return;
          drag.sel = true;
          const w = toWorld(drag.x, drag.y); this.selRect = { x0: w[0], y0: w[1], x1: w[0], y1: w[1] };
          if (navigator.vibrate) try { navigator.vibrate(15); } catch (_) {}
        }, 380);
      };
      this._onMove = e => {
        if (!drag) return;
        if (drag.sel) {
          const w = toWorld(e.clientX, e.clientY);
          this.selRect.x1 = w[0]; this.selRect.y1 = w[1];
          if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) drag.moved = true;
          return;
        }
        const dx = (e.clientX - drag.x) / this.cam.scale;
        if (Math.abs(dx) > 6) { drag.moved = true; clearTimeout(this._lp); }
        if (drag.moved) {
          this.cam.x = this._clampCam(drag.cam - dx);
          this.cam.manualUntil = this.time + 4;
        }
      };
      this._onUp = e => {
        clearTimeout(this._lp);
        if (drag && drag.sel) {
          if (this.selRect) this._selectSquad(this.selRect);
          this.selRect = null; drag = null;
          return;
        }
        // krátké klepnutí: na vlastního vojáka = převzít ovládání, jinak přesun praporu
        if (drag && !drag.moved && e.target === this.canvas && !this.over) {
          const r = this.canvas.getBoundingClientRect();
          const wx = this.cam.x + (e.clientX - r.left) / this.cam.scale;
          const wy = (this.H - this.cam.viewH) + (e.clientY - r.top) / this.cam.scale;
          const u = this.unitAt(wx, wy);
          if (u) this.takeControl(u);
          else if (!this.hero) {
            if (this.squad && this.active === 'squad') this.setSquad('formace', wx);
            else this.setFormation('player', 'formace', wx);
          }
        }
        drag = null;
      };
      this.canvas.addEventListener('pointerdown', this._onDown);
      window.addEventListener('pointermove', this._onMove);
      window.addEventListener('pointerup', this._onUp);
      if (this.o.mini) {
        this._onMini = e => {
          const r = this.o.mini.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width * this.W;
          this.cam.x = this._clampCam(x - this.cam.viewW / 2);
          this.cam.manualUntil = this.time + 5;
        };
        this.o.mini.addEventListener('pointerdown', this._onMini);
        this.o.mini.addEventListener('pointermove', e => { if (e.buttons) this._onMini(e); });
      }
      this._onResize = () => this.resize();
      window.addEventListener('resize', this._onResize);
    }
    _clampCam(x) { return Math.max(0, Math.min(this.W - this.cam.viewW, x)); }

    resize() {
      const r = this.canvas.parentElement.getBoundingClientRect();
      const cw = Math.max(50, r.width), ch = Math.max(50, r.height);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(cw * this.dpr);
      this.canvas.height = Math.round(ch * this.dpr);
      this.canvas.style.width = cw + 'px';
      this.canvas.style.height = ch + 'px';
      const cfg = C();
      // nízké bojiště (telefon na šířku): ořízni víc nebe, ať jsou vojáci větší
      const viewH = ch < 330 ? 390 : this.H - cfg.viewTop;
      let scale = ch / viewH;
      // celé bojiště se vejde na šířku? pak ho roztáhni na šířku
      if (this.W * scale < cw) scale = cw / this.W;
      // na úzkém displeji (na výšku) ukazuj aspoň ~720 jednotek světa
      if (cw / scale < 500) scale = Math.max(cw / 500, cw / this.W);
      // vysoké bojiště (tablet na výšku): nenechávej prázdné nebe, raději posouvej
      if (ch / scale > this.H) scale = ch / this.H;
      this.cam.scale = scale;
      this.cam.viewW = Math.min(this.W, cw / scale);
      this.cam.viewH = ch / scale;
      this.cw = cw; this.ch = ch;
      this.cam.x = this._clampCam(this.cam.x);
      this.panEnabled = this.cam.viewW < this.W - 1;
      if (this.sprites) this.sprites.setRes(scale * this.dpr);
    }

    /* ---------------- akce hráče ---------------- */
    canSpawn(team, unitId) {
      const s = this.side[team], def = GameData.units[unitId];
      if (this.over) return { ok: false, why: 'konec' };
      if (s.coins < def.cost) return { ok: false, why: 'mince' };
      if ((s.cooldowns[unitId] || 0) > this.time) return { ok: false, why: 'cooldown' };
      return { ok: true };
    }
    spawn(team, unitId, free) {
      const chk = free ? { ok: !this.over } : this.canSpawn(team, unitId);
      if (!chk.ok) return false;
      const s = this.side[team], def = GameData.units[unitId], cfg = C();
      if (!free) {
        s.coins -= def.cost;
        s.cooldowns[unitId] = this.time + def.spawnCooldown;
      }
      const dir = team === 'player' ? 1 : -1;
      const skin = team === 'player' ? (s.skins[unitId] || 'zakladni') : (this.o.enemyUnitSkin || 'zakladni');
      const fac = def.faction || s.faction;
      // výbava a skin hráče: bonusy a vzhled
      const L = team === 'player' && this.o.player.loadout ? this.o.player.loadout(unitId) : null;
      const key = team + skin + fac + (L ? L.lk.key : '');
      if (!this.palCache[key]) this.palCache[key] = L ? GameData.gearHelpers.palette(team, skin, fac, L.lk) : Art.unitPalette(team, skin, fac);
      // pevnost s více branami: vojáci vycházejí postupně ze všech bran
      let sx = s.castle.front + dir * (8 + this.rand() * 10);
      const gates = s.castleImg.gates;
      if (gates && gates.length) {
        s.gateTurn = ((s.gateTurn || 0) + 1) % gates.length;
        const g = gates[s.gateTurn];
        const img = s.castleImg;
        sx = dir === 1 ? s.castle.front - img.w + g.x : s.castle.front - 2 + (img.w - g.x);
        sx += (this.rand() - 0.5) * 20;
        for (let i = 0; i < 5; i++) this.particles.push({ x: sx + (this.rand() - 0.5) * 40, y: C().laneTop + this.rand() * 40, vx: (this.rand() - 0.5) * 40, vy: -40 - this.rand() * 50, g: 0, t: 0, life: 0.7, r: 3 + this.rand() * 3, color: this.rand() < 0.5 ? '#ff7a2a' : '#ffd27a' });
      }
      const u = {
        id: this.nextId++, team, def, dir,
        x: sx,
        y: cfg.laneTop + this.rand() * (cfg.laneBottom - cfg.laneTop),
        hp: def.hp * (def.boss ? 1 : s.hpMult), maxHp: def.hp * (def.boss ? 1 : s.hpMult),
        dmg: def.dmg * s.dmgMult,
        atkTimer: 0.2, atk: -1, atkDur: Math.min(0.55, def.attackInterval * 0.7), hitDone: false,
        walk: this.rand() * 6, moving: true, dead: 0, target: null,
        pal: this.palCache[key], hurt: 0, born: this.time
      };
      if (L) {
        const b = L.bonus;
        u.hp *= 1 + (b.hp || 0); u.maxHp = u.hp; u.dmg *= 1 + (b.dmg || 0);
        u.armorBonus = b.armor || 0; u.crit = b.crit || 0;
        u.drawDef = GameData.gearHelpers.drawDef(def, L.lk);
      }
      this.units.push(u);
      if (def.boss) {
        this.bossUnit = u;
        this.texts.push({ x: u.x - 60, y: 360, txt: t('boss_enters', { name: def.name }), color: '#ff7a4a', t: 0, life: 2.6, big: true });
        for (let i = 0; i < 3; i++) this._explode(u.x - 20 + i * 20, u.y - 20);
      }
      if (team === 'player') this.sent++;
      this._dust(u.x, u.y);
      return true;
    }
    abilityState(team, id) {
      const s = this.side[team], a = GameData.abilities[id];
      const cdLeft = Math.max(0, (s.abilityCd[id] || 0) - this.time);
      return { cdLeft, cdTotal: a.cooldown, affordable: s.coins >= a.cost, ready: cdLeft <= 0 && s.coins >= a.cost && !this.over };
    }
    useAbility(team, id) {
      const st = this.abilityState(team, id);
      if (!st.ready) return false;
      const s = this.side[team], a = GameData.abilities[id];
      const foeTeam = team === 'player' ? 'enemy' : 'player';
      if (id === 'ohen') {
        // cíl: nepřítel nejblíže mému hradu, jinak před nepřátelskou bránou
        const foes = this.units.filter(u => u.team === foeTeam && !u.dead);
        let tx;
        if (foes.length) {
          foes.sort((p, q) => team === 'player' ? p.x - q.x : q.x - p.x);
          tx = foes[0].x + (team === 'player' ? 40 : -40);
        } else tx = this.side[foeTeam].castle.front + (team === 'player' ? -60 : 60);
        s.coins -= a.cost;
        s.abilityCd[id] = this.time + a.cooldown;
        for (let i = 0; i < 7; i++) {
          const ox = (this.rand() - 0.5) * a.radius * 1.6;
          this.meteors.push({ team, x0: tx + ox - 260, y0: -60 - i * 30, x1: tx + ox, y1: C().laneTop + this.rand() * 60, t: -i * 0.12, dur: 0.75, done: false, dmg: a.damage / 2.6, radius: a.radius * 0.55 });
        }
        this.texts.push({ x: tx, y: 380, txt: t('fire_rain'), color: '#ffb347', t: 0, life: 1.4, big: true });
        return true;
      }
      if (id === 'stit') {
        s.coins -= a.cost;
        s.abilityCd[id] = this.time + a.cooldown;
        s.shieldUntil = this.time + a.duration;
        this.texts.push({ x: this.cam.x + this.cam.viewW / 2, y: 380, txt: t('shield_faith'), color: '#9fd4ff', t: 0, life: 1.4, big: true });
        return true;
      }
      return false;
    }

    /* Rozkaz pro armádu: 'utok' | 'formace' | 'ustup' */
    setFormation(team, mode, flagX) {
      const s = this.side[team], cfg = C();
      s.formation = mode;
      if (team === 'player') this.active = 'main';
      if (flagX != null) {
        const lo = team === 'player' ? cfg.playerFront + 90 : cfg.playerFront + 400;
        const hi = team === 'player' ? cfg.enemyFront - 400 : cfg.enemyFront - 90;
        s.flagX = Math.max(lo, Math.min(hi, flagX));
      }
      if (team === 'player' && this.o.onFormation) this.o.onFormation(mode);
    }

    /* ---------------- ODDÍL (výběr tažením prstu) ----------------
       Hráč tažením označí vojáky. Ti dostanou vlastní rozkaz (oddíl),
       ostatní dál plní hlavní rozkaz armády. */
    setSelectMode(v) { this.selectMode = v == null ? !this.selectMode : v; if (this.o.onSelectMode) this.o.onSelectMode(this.selectMode); }
    _selectSquad(r) {
      const x0 = Math.min(r.x0, r.x1) - 14, x1 = Math.max(r.x0, r.x1) + 14;
      const y0 = Math.min(r.y0, r.y1), y1 = Math.max(r.y0, r.y1);
      const wide = (x1 - x0) < 40;   // jen klepnutí → vezme vojáky v okolí
      const pick = this.units.filter(u => u.team === 'player' && !u.dead && !u.controlled &&
        (wide ? Math.abs(u.x - r.x0) < 90 : (u.x >= x0 && u.x <= x1 && u.y - 90 * US() <= y1 + 10 && u.y >= y0 - 10)));
      this.setSelectMode(false);
      if (!pick.length) return;
      for (const u of this.units) if (u.team === 'player') u.squad = false;
      pick.forEach(u => { u.squad = true; u.slotX = null; });
      const cx = pick.reduce((a, u) => a + u.x, 0) / pick.length;
      this.squad = { mode: 'formace', flagX: 0 };
      this.active = 'squad';
      this.setSquad('formace', cx);
      this.texts.push({ x: cx, y: Math.min(...pick.map(u => u.y)) - 110 * US(), txt: t('squad_n', { n: pick.length }), color: '#9dffb0', t: 0, life: 1.4, big: true });
    }
    setSquad(mode, flagX) {
      if (!this.squad) return;
      const cfg = C();
      this.squad.mode = mode;
      if (flagX != null) this.squad.flagX = Math.max(cfg.playerFront + 90, Math.min(cfg.enemyFront - 400, flagX));
      this.active = 'squad';
      this._assignSlots('player');
      if (this.o.onSquad) this.o.onSquad(this.squadCount(), mode);
    }
    disbandSquad() {
      for (const u of this.units) u.squad = false;
      this.squad = null; this.active = 'main';
      this._assignSlots('player');
      if (this.o.onSquad) this.o.onSquad(0, null);
    }
    squadCount() { return this.units.filter(u => u.squad && !u.dead).length; }
    modeOf(u) { return u.squad && this.squad ? this.squad.mode : this.side[u.team].formation; }

    /* ---------------- OVLÁDANÝ HRDINA ---------------- */
    unitAt(wx, wy) {
      let best = null, bd = 1e9;
      for (const u of this.units) {
        if (u.team !== 'player' || u.dead) continue;
        const dx = Math.abs(u.x - wx);
        if (dx > 34 * US() || wy < u.y - 100 * US() || wy > u.y + 20) continue;
        if (dx < bd) { bd = dx; best = u; }
      }
      return best;
    }
    takeControl(u) {
      if (this.hero === u) return;
      if (this.hero) this.hero.controlled = false;
      this.hero = u;
      u.controlled = true;
      u.face = u.face || u.dir;
      u.slotX = null;
      this.ctrl = { mx: 0, my: 0, attack: false, block: false };
      this.cam.manualUntil = 0;
      this.texts.push({ x: u.x, y: u.y - 120 * US(), txt: t('controlling', { name: u.def.name }), color: '#ffd77a', t: 0, life: 1.5, big: true });
      if (this.o.onHero) this.o.onHero(u);
    }
    releaseHero(died) {
      if (!this.hero) return;
      this.hero.controlled = false;
      this.hero.blocking = false;
      this.hero = null;
      if (this.o.onHero) this.o.onHero(null, died);
    }
    _updateHero(u, dt) {
      const c = this.ctrl, cfg = C();
      const sp = u.def.speed * (cfg.speedScale || 1) * 1.15;
      u.blocking = c.block && u.atk < 0;
      if (!u.blocking && (c.mx || c.my)) {
        u.x = Math.max(cfg.playerFront + 10, Math.min(cfg.enemyFront - 10, u.x + c.mx * sp * dt));
        u.y = Math.max(cfg.laneTop, Math.min(cfg.laneBottom, u.y + c.my * sp * 0.7 * dt));
        u.moving = true;
        u.walk += dt * u.def.speed * 0.17;
        if (c.mx) u.face = Math.sign(c.mx);
      } else u.moving = false;
      if (u.atkTimer > 0) u.atkTimer -= dt;
      if (c.attack && !u.blocking && u.atk < 0 && u.atkTimer <= 0) {
        u.atk = 0; u.hitDone = false; u.atkTimer = u.def.attackInterval * 0.85;
      }
      if (u.atk >= 0) {
        u.atk += dt / u.atkDur;
        if (!u.hitDone && u.atk >= (u.def.ranged ? 0.6 : 0.55)) { u.hitDone = true; this._heroStrike(u); }
        if (u.atk >= 1) u.atk = -1;
      }
    }
    /* Úder hrdiny: směrem, kam se dívá. Meč zasáhne až 3 nepřátele, hrdina má +25 % útok. */
    _heroStrike(u) {
      const f = u.face || u.dir, cfg = C();
      const reach = u.def.range * (cfg.rangeScale || 1) + 26;
      const dmg = u.dmg * 1.25;
      const foes = this.units.filter(e => e.team !== u.team && !e.dead)
        .map(e => ({ e, d: (e.x - u.x) * f }))
        .filter(o => o.d > -12 && o.d <= reach && (u.def.ranged || Math.abs(o.e.y - u.y) < 46))
        .sort((a, b) => a.d - b.d);
      const foeCastle = this.side.enemy.castle;
      const castleD = (foeCastle.front - u.x) * f;
      if (u.def.ranged) {
        const ox = u.x + f * 30 * US(), oy = u.y - 47 * US();
        if (foes.length) this._shoot(u.team, ox, oy, foes[0].e, dmg * this._bonus(u, foes[0].e), u.def.projectileSpeed, u);
        else if (f === 1 && castleD <= reach) this._shoot(u.team, ox, oy, null, dmg, u.def.projectileSpeed, u, foeCastle);
        else {
          const tx = u.x + f * reach, ty = u.y - 10;
          this.projectiles.push({ team: u.team, x0: ox, y0: oy, tx, ty, target: null, castle: null, dmg: 0, from: u, t: 0, dur: reach / u.def.projectileSpeed, arc: reach * 0.2, done: false });
        }
        return;
      }
      if (foes.length) foes.slice(0, 3).forEach(o => this._damage(o.e, dmg * this._bonus(u, o.e), u));
      else if (f === 1 && castleD <= reach) this._damageCastle(foeCastle, dmg, u);
      else this._sparks(u.x + f * 30, u.y - 40, '#ffffff', 2);
    }

    /* Spočítá místo každého vojáka v šiku */
    _assignSlots(team) {
      if (team === 'player' && this.squad) {
        const all = this.units.filter(u => u.team === team && !u.dead && !u.controlled);
        this._assignList(team, all.filter(u => !u.squad), this.side[team].formation, this.side[team].flagX);
        this._assignList(team, all.filter(u => u.squad), this.squad.mode, this.squad.flagX);
        return;
      }
      const s = this.side[team];
      this._assignList(team, this.units.filter(u => u.team === team && !u.dead && !u.controlled), s.formation, s.flagX);
    }
    _assignList(team, units, mode, flagX) {
      const s = this.side[team], cfg = C(), FC = GameData.formationConfig, R = GameData.formationRank;
      const dir = team === 'player' ? 1 : -1;
      const anchor = mode === 'ustup' ? s.castle.front + dir * 70 : flagX;
      const list = units
        .sort((a, b) => (R[a.def.roleKey] ?? 1) - (R[b.def.roleKey] ?? 1) || a.id - b.id);
      const rows = FC.rows, lane = cfg.laneBottom - cfg.laneTop - 10;
      let col = 0, row = 0, prevRank = null;
      for (const u of list) {
        const rk = R[u.def.roleKey] ?? 1;
        // každý druh jednotky začíná nový sloupec (rytíři vpředu, lučištníci vzadu)
        if (prevRank != null && rk !== prevRank && row > 0) { col++; row = 0; }
        prevRank = rk;
        u.slotX = anchor - dir * col * FC.colSpacing;
        u.slotY = cfg.laneTop + 5 + (rows === 1 ? lane / 2 : (row / (rows - 1)) * lane) + (col % 2 ? 6 : 0);
        row++;
        if (row >= rows) { row = 0; col++; }
      }
    }

    togglePause(v) { this.paused = v == null ? !this.paused : v; this._last = performance.now(); }
    setSpeed(v) { this.speed = v; }

    destroy() {
      cancelAnimationFrame(this.raf);
      clearTimeout(this._lp);
      if (this._baseCfg) { GameData.battleConfig = this._baseCfg; this._baseCfg = null; }
      this.destroyed = true;
      this.over = true;
      this.canvas.removeEventListener('pointerdown', this._onDown);
      window.removeEventListener('pointermove', this._onMove);
      window.removeEventListener('pointerup', this._onUp);
      window.removeEventListener('resize', this._onResize);
    }

    /* ---------------- smyčka ---------------- */
    _loop(now) {
      let dt = Math.min(0.05, (now - this._last) / 1000);
      this._last = now;
      this._rt = (this._rt || 0) + dt;
      if (!this.paused && !this.over) {
        const steps = this.speed;
        for (let i = 0; i < steps; i++) this.update(dt);
      } else if (this.over) {
        this._updateFx(dt);
      }
      this.render();
      if (this.o.onUpdateHud) this.o.onUpdateHud(this);
      if (!this.destroyed) this.raf = requestAnimationFrame(this._loop);
    }

    /* Herní logika – jeden krok simulace */
    update(dt) {
      if (this.over) return;
      this.time += dt;
      this.timeLeft -= dt;
      const cfg = C();

      for (const team of ['player', 'enemy']) {
        const s = this.side[team];
        s.coins = Math.min(s.maxCoins, s.coins + s.income * dt);
      }
      this._ai(dt);
      this._autoPlayer(dt);
      this._updateDefense(dt);
      if (this.bossPlan && !this.bossPlan.spawned && this.time >= this.bossPlan.at) {
        this.bossPlan.spawned = true;
        this.spawn('enemy', this.bossPlan.id, true);
      }
      this._slotTimer = (this._slotTimer || 0) - dt;
      if (this._slotTimer <= 0) {
        this._slotTimer = 0.25;
        if (this.squad && !this.squadCount()) this.disbandSquad();
        for (const team of ['player', 'enemy']) if (this.side[team].formation !== 'utok' || (team === 'player' && this.squad && this.squad.mode !== 'utok')) this._assignSlots(team);
      }

      // jednotky
      for (const u of this.units) {
        if (u.dead) { u.dead += dt; continue; }
        if (u.hurt > 0) u.hurt -= dt;
        if (u.dot && this.time < u.dot.until) {
          u.dotTick = (u.dotTick || 0) - dt;
          if (u.dotTick <= 0) { u.dotTick = 0.5; this._damage(u, u.dot.dps * 0.5, null, true); if (u.dead) continue; }
        }
        const slowK = u.slowUntil > this.time ? 0.5 : 1;
        if (u === this.hero) { this._updateHero(u, dt); continue; }
        const foeTeam = u.team === 'player' ? 'enemy' : 'player';
        const reach = u.def.range * (C().rangeScale || 1) + 18;
        // najdi nejbližšího nepřítele před sebou
        let best = null, bestD = 1e9;
        for (const e of this.units) {
          if (e.team === u.team || e.dead) continue;
          const d = (e.x - u.x) * u.dir;
          if (d < -30) continue;
          const ad = Math.abs(e.x - u.x);
          if (ad <= reach && ad < bestD) { best = e; bestD = ad; }
        }
        let target = best;
        let castleTarget = false;
        if (!target) {
          const front = this.side[foeTeam].castle.front;
          const d = (front - u.x) * u.dir;
          if (d <= u.def.range * (C().rangeScale || 1) + 10) { castleTarget = true; }
        }
        if (target || castleTarget) {
          u.moving = false;
          u.target = target;
          u.castleTarget = castleTarget;
          if (u.atk < 0) {
            u.atkTimer -= dt;
            if (u.atkTimer <= 0) { u.atk = 0; u.hitDone = false; u.atkTimer = u.def.attackInterval; }
          }
        } else {
          u.target = null; u.castleTarget = false;
          const sp = u.def.speed * (C().speedScale || 1) * slowK;
          const mode = this.modeOf(u);
          if (mode !== 'utok' && u.slotX != null) {
            // pochod na své místo v šiku
            const dx = u.slotX - u.x, dy = u.slotY - u.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 4) {
              const k = Math.min(1, (sp * (mode === 'ustup' ? 1.25 : 1) * dt) / dist);
              u.x += dx * k; u.y += dy * k;
              u.moving = true;
              u.face = Math.abs(dx) > 2 ? Math.sign(dx) : u.dir;
              u.walk += dt * u.def.speed * 0.17;
            } else { u.moving = false; u.face = u.dir; }
          } else {
            u.moving = true;
            u.face = u.dir;
            u.x += sp * u.dir * dt;
            u.walk += dt * u.def.speed * 0.17;
          }
          if (u.atkTimer > 0) u.atkTimer -= dt;
        }
        if (target || castleTarget) u.face = u.dir;
        // průběh animace útoku
        if (u.atk >= 0) {
          u.atk += dt / u.atkDur;
          const hitAt = u.def.ranged ? 0.6 : 0.55;
          if (!u.hitDone && u.atk >= hitAt) {
            u.hitDone = true;
            this._strike(u);
          }
          if (u.atk >= 1) u.atk = -1;
        }
      }
      // odstranění mrtvých
      this.units = this.units.filter(u => !u.dead || u.dead < 1.2);

      // věže hradů
      for (const team of ['player', 'enemy']) {
        const s = this.side[team];
        if (!s.castle.tower || s.castle.hp <= 0) continue;
        s.castle.towerTimer -= dt;
        if (s.castle.towerTimer <= 0) {
          const dir = team === 'player' ? 1 : -1;
          const foes = this.units.filter(e => e.team !== team && !e.dead && Math.abs(e.x - s.castle.front) < 330);
          if (foes.length) {
            foes.sort((a, b) => Math.abs(a.x - s.castle.front) - Math.abs(b.x - s.castle.front));
            const t = foes[0];
            const img = s.castleImg;
            const ox = dir === 1 ? s.castle.front - img.w + img.towerTop.x : s.castle.front + img.w - img.towerTop.x;
            const oy = cfg.groundY - img.h + img.towerTop.y;
            this._shoot(team, ox, oy, t, s.castle.tower, 620, null);
            s.castle.towerTimer = 1.25;
          } else s.castle.towerTimer = 0.3;
        }
      }

      // projektily
      for (const p of this.projectiles) {
        p.t += dt / p.dur;
        if (p.t >= 1 && !p.done) {
          p.done = true;
          if (p.kind === 'fire') this._sparks(p.tx, p.ty, '#ff9a3c', 6);
          if (p.kind === 'cat') { this._catImpact(p); continue; }
          if (p.pierce && p.target) {
            const second = this.units.find(e => e.team !== p.team && !e.dead && e !== p.target && Math.abs(e.x - p.target.x) < 70);
            if (second) this._damage(second, p.dmg * 0.6, null);
          }
          if (p.target && !p.target.dead) this._damage(p.target, p.dmg, p.from, p.kind === 'fire');
          else if (p.castle) this._damageCastle(p.castle, p.dmg);
        }
      }
      this.projectiles = this.projectiles.filter(p => !p.done || p.t < 1.25);

      // meteory
      for (const m of this.meteors) {
        m.t += dt;
        if (!m.done && m.t >= m.dur) {
          m.done = true;
          this._explode(m.x1, m.y1);
          for (const e of this.units) {
            if (e.team === m.team || e.dead) continue;
            if (Math.hypot(e.x - m.x1, (e.y - m.y1) * 1.6) < m.radius) this._damage(e, m.dmg, null, true);
          }
        }
      }
      this.meteors = this.meteors.filter(m => !m.done);

      this._updateFx(dt);
      this._camera(dt);

      // konec hry
      const pc = this.side.player.castle, ec = this.side.enemy.castle;
      if (ec.hp <= 0) this._end(true, 'hrad');
      else if (pc.hp <= 0) this._end(false, 'hrad');
      else if (this.timeLeft <= 0) {
        const pr = pc.hp / pc.maxHp, er = ec.hp / ec.maxHp;
        this._end(pr > er, 'cas');
      }
    }

    _ambientP(a, anywhere) {
      const r = (lo, hi) => lo + Math.random() * (hi - lo);
      return {
        x: anywhere ? Math.random() * this.W : this.cam.x + Math.random() * (this.cam.viewW + 300),
        y: anywhere ? Math.random() * this.H : (a.rise ? this.H - 30 - Math.random() * 120 : (this.H - (this.cam.viewH || this.H)) - 10),
        vx: r(a.vx[0], a.vx[1]), vy: r(a.vy[0], a.vy[1]), s: r(a.size[0], a.size[1]),
        c: a.color[Math.floor(Math.random() * a.color.length)], rot: Math.random() * 6, ph: Math.random() * 6, petal: a.petal
      };
    }

    _updateFx(dt) {
      if (this.ambient && this.ambient.length) {
        const a = ArtThemes.ambient[this.theme];
        for (let i = 0; i < this.ambient.length; i++) {
          const p = this.ambient[i];
          p.ph += dt * 2; p.x += (p.vx + Math.sin(p.ph) * 12) * dt; p.y += p.vy * dt; p.rot += dt * 2;
          if (p.y > this.H || p.y < -20 || p.x < this.cam.x - 60 || p.x > this.cam.x + this.cam.viewW + 400) this.ambient[i] = this._ambientP(a, false);
        }
      }
      for (const p of this.particles) {
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt;
      }
      this.particles = this.particles.filter(p => p.t < p.life);
      for (const t of this.texts) t.t += dt;
      this.texts = this.texts.filter(t => t.t < t.life);
    }

    _camera(dt) {
      if (!this.panEnabled || this.time < this.cam.manualUntil) return;
      if (this.hero) {
        const want = this._clampCam(this.hero.x - this.cam.viewW * 0.45);
        this.cam.x += (want - this.cam.x) * Math.min(1, dt * 4);
        return;
      }
      // sleduj frontu: nejvzdálenější můj voják, nebo nejbližší nepřítel
      let fx = null;
      for (const u of this.units) {
        if (u.dead) continue;
        if (u.team === 'player') fx = fx == null ? u.x : Math.max(fx, u.x);
      }
      let ex = null;
      for (const u of this.units) if (!u.dead && u.team === 'enemy') ex = ex == null ? u.x : Math.min(ex, u.x);
      let focus = fx != null ? fx : (ex != null ? ex : C().playerFront + 200);
      if (this.side.player.formation === 'formace' && (ex == null || ex > this.side.player.flagX + 500)) focus = this.side.player.flagX + 120;
      if (ex != null && fx != null) focus = (fx + Math.min(ex, fx + 300)) / 2;
      const want = this._clampCam(focus - this.cam.viewW * 0.55);
      this.cam.x += (want - this.cam.x) * Math.min(1, dt * 2.2);
    }

    _strike(u) {
      const foeTeam = u.team === 'player' ? 'enemy' : 'player';
      if (u.def.ranged) {
        const ox = u.x + u.dir * 30 * (u.def.look.scale || 1) * US(), oy = u.y - 47 * US();
        if (u.target && !u.target.dead) this._shoot(u.team, ox, oy, u.target, u.dmg * this._bonus(u, u.target), u.def.projectileSpeed, u);
        else if (u.castleTarget) this._shoot(u.team, ox, oy, null, u.dmg, u.def.projectileSpeed, u, this.side[foeTeam].castle);
      } else {
        if (u.target && !u.target.dead && u.def.cleave) {
          const reach = u.def.range * (C().rangeScale || 1) + 26;
          const foes = this.units.filter(e => e.team !== u.team && !e.dead && Math.abs(e.x - u.x) <= reach && (e.x - u.x) * u.dir > -20)
            .sort((a, b) => Math.abs(a.x - u.x) - Math.abs(b.x - u.x)).slice(0, u.def.cleave);
          foes.forEach(e => this._damage(e, u.dmg * this._bonus(u, e), u));
          this._sparks(u.x + u.dir * 50, u.y - 30, '#ff9a3c', 10);
        } else if (u.target && !u.target.dead) this._damage(u.target, u.dmg * this._bonus(u, u.target), u);
        else if (u.castleTarget) this._damageCastle(this.side[foeTeam].castle, u.dmg * (u.def.rage && u.hp < u.maxHp * 0.5 ? u.def.rage : 1), u);
      }
    }
    _bonus(u, t) {
      let k = (u.def.bonusVs && (u.def.bonusVs[t.def.roleKey] || u.def.bonusVs[t.def.id])) || 1;
      // berserk: zuřivost pod polovinou životů
      if (u.def.rage && u.hp < u.maxHp * 0.5) k *= u.def.rage;
      // samuraj: první úder iaidó
      if (u.def.firstStrike && !u.struck) { u.struck = true; k *= u.def.firstStrike; this.texts.push({ x: u.x, y: u.y - 110 * US(), txt: 'Iaidó!', color: '#ffd77a', t: 0, life: 0.9 }); }
      return k;
    }

    _shoot(team, ox, oy, target, dmg, speed, from, castle) {
      const cfg = C();
      let tx, ty;
      if (target) { tx = target.x; ty = target.y - 32 * US(); }
      else { tx = castle.front + (team === 'player' ? 30 : -30); ty = cfg.groundY - 120 - this.rand() * 80; }
      const dist = Math.hypot(tx - ox, ty - oy);
      const kind = from && from.def && from.def.projectile === 'fire' ? 'fire' : 'arrow';
      this.projectiles.push({ team, kind, x0: ox, y0: oy, tx, ty, target, castle: target ? null : castle, dmg, from, t: 0, dur: Math.max(0.25, dist / speed), arc: kind === 'fire' ? Math.min(50, dist * 0.12) : Math.min(90, dist * 0.22), done: false });
    }

    _damage(target, raw, from, fire) {
      const s = this.side[target.team];
      let dmg = raw * (1 - Math.min(0.8, target.def.armor + (target.armorBonus || 0)));
      if (from && from.crit && this.rand() < from.crit) {
        dmg *= 1.8;
        this.texts.push({ x: target.x, y: target.y - 120 * US(), txt: t('crit'), color: '#ffb347', t: 0, life: 0.8 });
      }
      if (target.blocking) {
        dmg *= 0.2;
        if (!target._blkTxt || this.time - target._blkTxt > 0.6) {
          target._blkTxt = this.time;
          this.texts.push({ x: target.x, y: target.y - 104 * US(), txt: t('blocked'), color: '#9fd4ff', t: 0, life: 0.7 });
        }
      }
      if (s.shieldUntil > this.time) dmg *= 1 - GameData.abilities.stit.reduction;
      target.hp -= dmg;
      target.hurt = 0.15;
      this._sparks(target.x, target.y - 34 * US(), fire ? '#ff9a3c' : '#fff1b0', 5);
      this.texts.push({ x: target.x + (Math.random() - 0.5) * 10, y: target.y - 82 * US(), txt: Math.round(dmg), color: target.team === 'player' ? '#ff8a80' : '#ffffff', t: 0, life: 0.8 });
      if (target.hp <= 0 && !target.dead) {
        target.dead = 0.001;
        target.atk = -1;
        if (target === this.hero) this.releaseHero(true);
        if (target.def.boss) this._bossDown(target);
        const killer = target.team === 'player' ? 'enemy' : 'player';
        const reward = Math.round(target.def.cost * C().killRewardRatio);
        const ks = this.side[killer];
        ks.coins = Math.min(ks.maxCoins, ks.coins + reward);
        if (killer === 'player') {
          this.kills++;
          this.texts.push({ x: target.x, y: target.y - 100 * US(), txt: '+' + reward, color: '#ffd54f', t: 0, life: 1.1, coin: true });
        }
      }
    }

    _damageCastle(castle, dmg, from) {
      if (castle.hp <= 0) return;
      castle.hp = Math.max(0, castle.hp - dmg);
      const x = castle.front + (castle === this.side.player.castle ? -20 : 20);
      this._debris(x, C().groundY - 60 - Math.random() * 120);
    }

    _ai(dt) {
      const s = this.side.enemy, ai = this.ai;
      ai.think -= dt;
      if (ai.think > 0) return;
      ai.think = 0.4;
      const allowed = (this.o.enemyUnits && this.o.enemyUnits.length) ? this.o.enemyUnits : ['pesak'];
      if (!ai.next) ai.next = this._pickFor('enemy', allowed);
      if (this.canSpawn('enemy', ai.next).ok) {
        this.spawn('enemy', ai.next);
        ai.next = null;
      }
      // vlny: shromáždit u praporu → zaútočit → po ztrátách znovu shromáždit
      const mine = this.units.filter(u => u.team === 'enemy' && !u.dead).length;
      const threat = this.units.some(u => u.team === 'player' && !u.dead && u.x > s.flagX - 260);
      if (s.formation === 'formace') {
        if (!ai.gatherStart) ai.gatherStart = this.time;
        if (mine >= ai.wave || threat || (this.time - ai.gatherStart > 26 && mine >= 2)) { s.formation = 'utok'; ai.gatherStart = 0; }
      } else if (s.formation === 'utok' && mine <= 1 && !threat) {
        s.formation = 'formace';
        ai.wave = Math.min(12, ai.wave + 1);
      }
      // na vyšší obtížnost používá i ohnivý déšť
      if (this.o.difficulty >= 1.25 && s.coins > 420) {
        const near = this.units.filter(u => u.team === 'player' && !u.dead && u.x > C().enemyFront - 500).length;
        if (near >= 4) this.useAbility('enemy', 'ohen');
      }
    }
    /* ---------------- AUTOMATICKÉ VYSÍLÁNÍ (přepínač AUTO) ---------------- */
    setAuto(faction, on) {
      this.auto[faction] = !!on;
      if (on) this.autoState[faction] = { next: null, think: 0 };
    }
    _autoPlayer(dt) {
      const on = Object.keys(this.auto).filter(f => this.auto[f]);
      if (!on.length) return;
      this._autoThink = (this._autoThink || 0) - dt;
      if (this._autoThink > 0) return;
      this._autoThink = 0.3;
      // národy se střídají, aby si mince rozdělily spravedlivě
      this._autoTurn = (this._autoTurn || 0) % on.length;
      for (let k = 0; k < on.length; k++) {
        const f = on[(this._autoTurn + k) % on.length];
        const st = this.autoState[f] || (this.autoState[f] = { next: null });
        const allowed = this.playerUnits.filter(id => GameData.units[id].faction === f);
        if (!allowed.length) continue;
        if (!st.next || !allowed.includes(st.next)) st.next = this._pickFor('player', allowed);
        // čeká na obnovení? vyber jinou jednotku a pusť na řadu další národ
        if ((this.side.player.cooldowns[st.next] || 0) > this.time) { st.next = null; continue; }
        if (this.spawn('player', st.next)) {
          st.next = null;
          this._autoTurn = (this._autoTurn + k + 1) % on.length;
          if (this.o.onAutoSpawn) this.o.onAutoSpawn(f);
        }
        return; // na řadě je tento národ – šetří mince, dokud nebude mít dost
      }
    }
    /* Výběr jednotky podle složení nepřátelské armády (používá AI i AUTO) */
    _pickFor(team, allowed) {
      const foes = this.units.filter(u => u.team !== team && !u.dead);
      const role = r => foes.filter(u => u.def.roleKey === r).length;
      const w = { pech: 4, strelec: 3, kopi: 2, tezka: 1.6 };
      if (role('strelec') >= 3) { w.tezka += 3; w.pech += 2; }
      if (role('tezka') >= 2 || foes.some(u => u.def.boss)) w.kopi += 4;
      if (role('pech') >= 4) w.strelec += 3;
      const pool = allowed.map(id => [id, w[(GameData.units[id] || {}).roleKey] || 1]);
      const sum = pool.reduce((a, [, x]) => a + x, 0);
      let r = this.rand() * sum;
      for (const [id, x] of pool) { if ((r -= x) <= 0) return id; }
      return allowed[0];
    }
    /* ---------------- OBRANA HRADU ---------------- */
    _updateDefense(dt) {
      if (!this.def || !this.def.slots.length) return;
      const P = this.side.player, cfg = C(), K = GameData.defense.kinds;
      if (P.castle.hp <= 0) return;
      const pos = Art.defenseSpots(P.castleImg, (GameData.factions[P.faction] || {}).castleStyle || 'evropa', P.castle.front, cfg.groundY, 1);
      this.def.slots.forEach((sl, i) => {
        this.defTimer[i] -= dt;
        if (this.defTimer[i] > 0) return;
        const k = K[sl.kind];
        const foes = this.units.filter(e => e.team === 'enemy' && !e.dead && e.x - P.castle.front < k.range);
        if (!foes.length) { this.defTimer[i] = 0.3; return; }
        this.defTimer[i] = k.interval;
        this.defShot[i] = this.time;
        const [ox, oy] = pos[i];
        if (sl.kind === 'katapult') {
          // cíl: místo, kde je nejvíc nepřátel
          let best = foes[0], bestN = 0;
          for (const f of foes) { const n = foes.filter(g => Math.abs(g.x - f.x) < 110).length; if (n > bestN) { bestN = n; best = f; } }
          const tx = best.x + 20, ty = best.y - 4;
          const dist = Math.hypot(tx - ox, ty - oy);
          this.projectiles.push({ team: 'player', kind: 'cat', el: sl.el, x0: ox, y0: oy - 40, tx, ty, target: null, castle: null, dmg: k.dmg(this.def.catLvl) * P.dmgMult, from: null, t: 0, dur: Math.max(0.7, dist / 480), arc: Math.min(220, dist * 0.35), done: false });
        } else {
          foes.sort((a, b) => a.x - b.x);
          const dmg = k.dmg(this.def.vez);
          this._shoot('player', ox + 14, oy - 46, foes[0], dmg, sl.kind === 'kuse' ? 760 : 620, null);
          if (sl.kind === 'kuse') this.projectiles[this.projectiles.length - 1].pierce = true;
        }
      });
      // jedovaté mraky
      for (const c of this.clouds) {
        c.tick -= dt;
        if (c.tick <= 0) { c.tick = 0.5; for (const e of this.units) if (e.team === 'enemy' && !e.dead && Math.abs(e.x - c.x) < c.r) this._damage(e, c.dps * 0.5, null); }
      }
      this.clouds = this.clouds.filter(c => c.until > this.time);
      for (const b of this.bolts) b.t += dt;
      this.bolts = this.bolts.filter(b => b.t < 0.35);
    }
    _catImpact(p) {
      const t = this.time, x = p.tx, y = p.ty, dmg = p.dmg;
      const near = r => this.units.filter(e => e.team !== p.team && !e.dead && Math.hypot(e.x - x, (e.y - y) * 1.5) < r);
      const E = GameData.catapultEl(p.el);
      const burst = (n, col) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 180; this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, g: 300, t: 0, life: 0.6, r: 2 + Math.random() * 3, color: col }); } };
      this.particles.push({ x, y, vx: 0, vy: 0, g: 0, t: 0, life: 0.4, r: 12, ring: true, color: E.color });
      if (p.el === 'ohen') {
        burst(20, '#ff9a3c'); near(95).forEach(e => { this._damage(e, dmg, null, true); e.dot = { until: t + 3, dps: dmg * 0.18, c: 'rgba(255,120,40,.45)' }; });
      } else if (p.el === 'led') {
        burst(18, '#cfeeff'); near(95).forEach(e => { this._damage(e, dmg * 0.8, null); e.slowUntil = t + 2.5; });
      } else if (p.el === 'blesk') {
        burst(12, '#fffbe0');
        let cur = near(110).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
        const hit = [];
        let px = x, py = y - 260;
        for (let n = 0; cur && n < 4; n++) {
          hit.push(cur);
          const pts = [[px, py]];
          for (let k = 1; k < 6; k++) pts.push([px + (cur.x - px) * k / 6 + (Math.random() - 0.5) * 24, py + (cur.y - 40 - py) * k / 6 + (Math.random() - 0.5) * 18]);
          pts.push([cur.x, cur.y - 40]);
          this.bolts.push({ pts, t: 0 });
          this._damage(cur, dmg * (n ? 0.75 : 1), null);
          px = cur.x; py = cur.y - 40;
          const from = cur;
          cur = this.units.filter(e => e.team !== p.team && !e.dead && !hit.includes(e) && Math.abs(e.x - from.x) < 170).sort((a, b) => Math.abs(a.x - from.x) - Math.abs(b.x - from.x))[0];
        }
      } else if (p.el === 'voda') {
        burst(24, '#7fc0ff'); near(115).forEach(e => { this._damage(e, dmg * 0.7, null); if (!e.def.boss) { e.x = Math.min(C().enemyFront - 20, e.x + 70); e.slotX = null; } });
      } else if (p.el === 'jed') {
        burst(10, '#9be07a'); near(90).forEach(e => this._damage(e, dmg * 0.5, null));
        this.clouds.push({ x, y, r: 105, until: t + 4, dps: dmg * 0.3, tick: 0.2 });
      }
    }

    _bossDown(u) {
      const ec = this.side.enemy.castle;
      const dmg = ec.maxHp * 0.3;
      ec.hp = Math.max(1, ec.hp - dmg);
      this.texts.push({ x: u.x, y: 330, txt: t('boss_fell', { name: u.def.name }), color: '#ffd77a', t: 0, life: 3, big: true });
      for (let i = 0; i < 10; i++) this._explode(ec.front + 20 + Math.random() * 220, C().groundY - Math.random() * 260);
      if (this.o.onBossDown) this.o.onBossDown(u);
    }

    _end(win, reason) {
      if (this.over) return;
      this.over = true;
      const loser = win ? this.side.enemy.castle : this.side.player.castle;
      for (let i = 0; i < 8; i++) this._explode(loser.front + (win ? 1 : -1) * (40 + Math.random() * 200), C().groundY - Math.random() * 220);
      const pc = this.side.player.castle, ec = this.side.enemy.castle;
      const res = { win, reason, time: this.time, kills: this.kills, sent: this.sent, playerHp: pc.hp / pc.maxHp, enemyHp: ec.hp / ec.maxHp };
      setTimeout(() => this.o.onEnd && this.o.onEnd(res), 1400);
    }

    /* ---------------- efekty ---------------- */
    _sparks(x, y, color, n) {
      for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120, g: 380, t: 0, life: 0.35 + Math.random() * 0.2, r: 1.6 + Math.random() * 1.4, color });
    }
    _dust(x, y) {
      for (let i = 0; i < 6; i++) this.particles.push({ x, y: y - 2, vx: (Math.random() - 0.5) * 60, vy: -10 - Math.random() * 20, g: 0, t: 0, life: 0.6, r: 5 + Math.random() * 4, color: 'rgba(200,170,120,.45)', soft: true });
    }
    _debris(x, y) {
      for (let i = 0; i < 4; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 140, vy: -40 - Math.random() * 120, g: 520, t: 0, life: 0.7, r: 2 + Math.random() * 2.5, color: '#8b8f96', rect: true });
    }
    _explode(x, y) {
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 200;
        this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, g: 260, t: 0, life: 0.5 + Math.random() * 0.4, r: 2 + Math.random() * 3, color: i % 3 ? '#ff9a3c' : '#ffe08a' });
      }
      for (let i = 0; i < 6; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 30, y: y - 10, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 30, g: 0, t: 0, life: 1.1, r: 12 + Math.random() * 10, color: 'rgba(70,60,55,.45)', soft: true });
      this.particles.push({ x, y, vx: 0, vy: 0, g: 0, t: 0, life: 0.35, r: 10, ring: true, color: '#ffd27a' });
    }

    /* ---------------- vykreslení ---------------- */
    render() {
      const ctx = this.ctx, cfg = C();
      const sc = this.cam.scale * this.dpr;
      const viewTop = this.H - this.cam.viewH; // zarovnání ke spodku (zem je vždy vidět)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#3f86d6';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // vzdálená vrstva se posouvá pomaleji (hloubka), mraky plují
      const par = this.cam.x * 0.45;
      ctx.setTransform(sc, 0, 0, sc, -(this.cam.x - par) * sc, -viewTop * sc);
      ctx.drawImage(this.layers.far, 0, 0, this.W, this.H);
      Art.drawClouds(ctx, this.layers.clouds, (this._rt || 0), this.W);
      ctx.setTransform(sc, 0, 0, sc, -this.cam.x * sc, -viewTop * sc);
      ctx.drawImage(this.layers.near, 0, 0, this.W, this.H);

      const t = this.time;
      const P = this.side.player, E = this.side.enemy;
      Art.drawCastle(ctx, P.castleImg, P.castle.front, cfg.groundY, 1, t, P.castle.hp / P.castle.maxHp, '#2f62b8');
      Art.drawCastle(ctx, E.castleImg, E.castle.front, cfg.groundY, -1, t, E.castle.hp / E.castle.maxHp, '#a8262a');
      this._castleFire(ctx, P, 1, t);
      this._castleFire(ctx, E, -1, t);
      if (this.def && this.def.slots.length) Art.drawDefense(ctx, P.castleImg, (GameData.factions[P.faction] || {}).castleStyle || 'evropa', P.castle.front, cfg.groundY, 1, t, this.def, P.faction, 'player', { shot: this.defShot });
      // jedovaté mraky
      for (const c of this.clouds) {
        const a = Math.min(1, (c.until - t) / 0.6);
        for (let k = 0; k < 6; k++) {
          const ox = Math.sin(t * 1.3 + k * 1.7) * c.r * 0.55, oy = Math.cos(t * 1.1 + k) * 10;
          ctx.globalAlpha = 0.28 * a; ctx.beginPath(); ctx.ellipse(c.x + ox, c.y - 18 + oy, c.r * 0.45, 22, 0, 0, Math.PI * 2); ctx.fillStyle = k % 2 ? '#7be04a' : '#4aa02a'; ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // prapory formací
      for (const team of ['player', 'enemy']) {
        const sd = this.side[team];
        if (sd.formation !== 'formace') continue;
        if (team === 'enemy' && !this.o.showEnemyFlag) continue;
        this._drawFlag(ctx, sd.flagX, cfg.laneTop - 6, team === 'player' ? '#2f62b8' : '#a8262a', t, team === 'player' ? 1 : -1);
      }
      if (this.squad && this.squad.mode === 'formace') this._drawFlag(ctx, this.squad.flagX, cfg.laneTop - 6, '#2f9a4a', t, 1);
      // značky vojáků v oddílu
      for (const u of this.units) {
        if (!u.squad || u.dead || !this.squad) continue;
        ctx.beginPath(); ctx.ellipse(u.x, u.y, 22 * US(), 6 * US(), 0, 0, Math.PI * 2);
        ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(120,255,150,.85)'; ctx.stroke();
      }
      // obdélník výběru
      if (this.selRect) {
        const r = this.selRect, x = Math.min(r.x0, r.x1), y = Math.min(r.y0, r.y1), w = Math.abs(r.x1 - r.x0), h = Math.abs(r.y1 - r.y0);
        ctx.save();
        ctx.fillStyle = 'rgba(120,255,150,.14)'; ctx.fillRect(x, y, w, h);
        ctx.setLineDash([10, 6]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 3; ctx.strokeStyle = '#9dffb0'; ctx.strokeRect(x, y, w, h);
        ctx.restore();
      }

      // jednotky seřazené podle hloubky
      const list = this.units.slice().sort((a, b) => a.y - b.y);
      for (const u of list) {
        const shield = this.side[u.team].shieldUntil > t;
        if (u === this.hero) this._heroMarkBelow(ctx, u, t);
        const age = t - (u.born || 0);
        const pop = age < 0.25 ? 0.6 + 0.4 * Art.ease(age / 0.25) : 1;
        this._drawUnitSprite(ctx, u, pop, shield);
        if (u === this.hero) this._heroMarkAbove(ctx, u, t);
        else if (!u.dead && u.hp < u.maxHp) this._hpBar(ctx, u);
      }

      // blesky
      for (const b of this.bolts) {
        ctx.globalAlpha = Math.max(0, 1 - b.t / 0.35);
        ctx.beginPath(); ctx.moveTo(b.pts[0][0], b.pts[0][1]);
        for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
        ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,240,150,.5)'; ctx.stroke();
        ctx.lineWidth = 2.4; ctx.strokeStyle = '#fffbe0'; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // projektily
      for (const p of this.projectiles) {
        if (p.done) continue;
        const k = Math.min(1, p.t);
        const x = p.x0 + (p.tx - p.x0) * k;
        const y = p.y0 + (p.ty - p.y0) * k - p.arc * 4 * k * (1 - k);
        const dx = (p.tx - p.x0), dy = (p.ty - p.y0) - p.arc * 4 * (1 - 2 * k);
        const a = Math.atan2(dy, dx);
        if (p.kind === 'fire') { Art.drawFireball(ctx, x, y, a, this.time); continue; }
        if (p.kind === 'cat') { Art.drawCatShot(ctx, x, y, p.el, this.time); continue; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(8, 0); ctx.lineWidth = 3.2; ctx.strokeStyle = Art.OUT; ctx.stroke();
        ctx.lineWidth = 1.6; ctx.strokeStyle = '#e1cfa6'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(13, 0); ctx.lineTo(8, 3); ctx.closePath(); Art.fs(ctx, '#cfd4dc', 1);
        ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-17, -3); ctx.lineTo(-10, 0); ctx.lineTo(-17, 3); ctx.closePath(); Art.fs(ctx, p.team === 'player' ? '#8fc1ff' : '#ff9e9e', 0.8);
        ctx.restore();
      }

      // meteory
      for (const m of this.meteors) {
        if (m.t < 0) continue;
        const k = Math.min(1, m.t / m.dur);
        const x = m.x0 + (m.x1 - m.x0) * k, y = m.y0 + (m.y1 - m.y0) * k;
        const g = ctx.createLinearGradient(x - 70, y - 90, x, y);
        g.addColorStop(0, 'rgba(255,120,40,0)'); g.addColorStop(1, 'rgba(255,170,60,.85)');
        ctx.beginPath(); ctx.moveTo(x - 80, y - 110); ctx.lineTo(x - 6, y - 8); ctx.lineTo(x + 6, y + 4); ctx.closePath();
        ctx.lineWidth = 12; ctx.strokeStyle = g; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2);
        const rg = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 12);
        rg.addColorStop(0, '#fff4c2'); rg.addColorStop(0.5, '#ffb347'); rg.addColorStop(1, '#e2531c');
        Art.fs(ctx, rg, 2);
      }

      // částice
      for (const p of this.particles) {
        const a = 1 - p.t / p.life;
        ctx.globalAlpha = Math.max(0, a);
        if (p.ring) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + p.t * 260, 0, Math.PI * 2);
          ctx.lineWidth = 4; ctx.strokeStyle = p.color; ctx.stroke();
        } else if (p.rect) {
          ctx.fillStyle = p.color; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.soft ? p.r * (1 + p.t) : p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // texty (zranění, mince)
      for (const tx of this.texts) {
        const a = 1 - tx.t / tx.life;
        ctx.globalAlpha = Math.max(0, Math.min(1, a * 1.5));
        const size = tx.big ? 30 : (tx.coin ? 17 : 14);
        ctx.font = `800 ${size}px "Alegreya Sans", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        const y = tx.y - tx.t * (tx.big ? 20 : 34);
        ctx.lineWidth = tx.big ? 5 : 3.5; ctx.strokeStyle = 'rgba(10,12,18,.9)';
        ctx.strokeText(tx.txt, tx.x, y);
        ctx.fillStyle = tx.color; ctx.fillText(tx.txt, tx.x, y);
      }
      ctx.globalAlpha = 1;
      // ambientní částice v popředí
      if (this.ambient) for (const p of this.ambient) {
        if (p.x < this.cam.x - 10 || p.x > this.cam.x + this.cam.viewW + 10) continue;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        if (p.petal) ctx.ellipse(0, 0, p.s * 1.6, p.s * 0.9, 0, 0, Math.PI * 2); else ctx.arc(0, 0, p.s, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      this._renderMini();
    }

    /* Minimapa (zobrazuje se při držení telefonu na výšku) */
    _renderMini() {
      const m = this.o.mini;
      if (!m || !m.offsetParent) return;
      const w = m.clientWidth, h = m.clientHeight;
      if (!w || !h) return;
      const dpr = this.dpr;
      if (m.width !== Math.round(w * dpr)) { m.width = Math.round(w * dpr); m.height = Math.round(h * dpr); }
      const c = m.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = '#20301c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#8f6d40'; c.fillRect(0, h * 0.42, w, h * 0.32);
      const sx = w / this.W;
      const P = this.side.player.castle, E = this.side.enemy.castle;
      c.fillStyle = '#3d7fe0'; c.fillRect(0, 4, P.front * sx, h - 8);
      c.fillStyle = '#d6453c'; c.fillRect(E.front * sx, 4, w - E.front * sx, h - 8);
      c.fillStyle = 'rgba(0,0,0,.45)';
      c.fillRect(0, 4, P.front * sx, (h - 8) * (1 - P.hp / P.maxHp));
      c.fillRect(E.front * sx, 4, w - E.front * sx, (h - 8) * (1 - E.hp / E.maxHp));
      const cfg = C();
      for (const u of this.units) {
        if (u.dead) continue;
        c.fillStyle = u.team === 'player' ? '#9fd0ff' : '#ff9e9e';
        const y = h * 0.42 + (u.y - cfg.laneTop) / (cfg.laneBottom - cfg.laneTop) * h * 0.32;
        c.beginPath(); c.arc(u.x * sx, y, u.def.boss ? 6 : (u.def.roleKey === 'tezka' ? 3.6 : 2.6), 0, Math.PI * 2); c.fill();
      }
      const pf = this.side.player;
      if (pf.formation !== 'utok') {
        const fx = (pf.formation === 'ustup' ? pf.castle.front + 70 : pf.flagX) * sx;
        c.fillStyle = '#ffd77a'; c.fillRect(fx - 1.5, 2, 3, h - 4);
      }
      if (this.squad && this.squad.mode !== 'utok') {
        const fx = (this.squad.mode === 'ustup' ? pf.castle.front + 70 : this.squad.flagX) * sx;
        c.fillStyle = '#7dff9a'; c.fillRect(fx - 1.5, 2, 3, h - 4);
      }
      c.lineWidth = 2; c.strokeStyle = '#ffd77a';
      c.strokeRect(this.cam.x * sx + 1, 2, this.cam.viewW * sx - 2, h - 4);
    }

    _drawUnitSprite(ctx, u, pop, shield) {
      let frame, st;
      if (u.dead) { const q = Math.min(7, Math.floor(u.dead / 1.2 * 8)); frame = 'd' + q; st = { dead: (q + 0.5) / 8 * 1.2 }; }
      else if (u.atk >= 0) { const q = Math.min(9, Math.floor(u.atk * 10)); frame = 'a' + q; st = { atk: (q + 0.5) / 10 }; }
      else if (u.blocking) { frame = 'b'; st = { block: true }; }
      else if (u.moving) { const q = Math.floor(((u.walk % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2) * 10); frame = 'w' + q; st = { moving: true, walk: q / 10 * Math.PI * 2 }; }
      else { frame = 'i'; st = {}; }
      const palKey = u.team + (u.pal.__k || (u.pal.__k = Math.random().toString(36).slice(2)));
      const e = this.sprites.get(u.drawDef || u.def, u.pal, palKey, frame, st, US());
      if (!u.dead && (u.slowUntil > this.time || (u.dot && this.time < u.dot.until))) {
        const icy = u.slowUntil > this.time;
        ctx.beginPath(); ctx.ellipse(u.x, u.y - 2, 22 * US(), 7 * US(), 0, 0, Math.PI * 2);
        ctx.fillStyle = icy ? 'rgba(127,211,255,.45)' : (u.dot.c || 'rgba(255,140,60,.45)'); ctx.fill();
      }
      const f = u.face || u.dir;
      if (shield && !u.dead) {
        const s = US() * (u.def.look.scale || 1);
        ctx.beginPath(); ctx.ellipse(u.x, u.y - 34 * s, 24 * s, 42 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120,190,255,.16)'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(150,210,255,.75)'; ctx.stroke();
      }
      ctx.save();
      ctx.translate(u.x, u.y); ctx.scale(f * pop, pop);
      ctx.drawImage(e.cv, e.bx0, e.by0, e.bw, e.bh);
      ctx.restore();
    }

    _heroMarkBelow(ctx, u, t) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(u.x, u.y, 30 * US() * 0.8, 8 * US() * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,122,.22)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#ffd77a'; ctx.stroke();
      ctx.restore();
    }
    _heroMarkAbove(ctx, u, t) {
      const s = US() * (u.def.look.scale || 1);
      const y = u.y - 104 * s - Math.abs(Math.sin(t * 4)) * 6;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(u.x - 9, y - 12); ctx.lineTo(u.x + 9, y - 12); ctx.lineTo(u.x, y); ctx.closePath();
      Art.fs(ctx, '#ffd77a', 2);
      // životy hrdiny
      const w = 50, h = 6, x = u.x - w / 2, by = y - 24;
      ctx.fillStyle = 'rgba(10,12,18,.85)'; ctx.fillRect(x - 1.5, by - 1.5, w + 3, h + 3);
      ctx.fillStyle = '#6fcf5a'; ctx.fillRect(x, by, w * Math.max(0, u.hp / u.maxHp), h);
      if (u.blocking) {
        const f = u.face || u.dir;
        ctx.beginPath(); ctx.arc(u.x + f * 4, u.y - 45 * s, 48 * s, f === 1 ? -1.0 : Math.PI - 1.0, f === 1 ? 1.0 : Math.PI + 1.0);
        ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(159,212,255,.85)'; ctx.stroke();
      }
      ctx.restore();
    }

    _drawFlag(ctx, x, y, color, t, dir) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(x, y + 2, 10, 3, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y - 120);
      ctx.lineWidth = 5; ctx.strokeStyle = Art.OUT; ctx.stroke();
      ctx.lineWidth = 2.6; ctx.strokeStyle = '#8a5a32'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 118);
      for (let i = 0; i <= 10; i++) ctx.lineTo(x + dir * i * 5, y - 118 + Math.sin(t * 5 + i * 0.6) * 2.5 * (i / 10));
      for (let i = 10; i >= 0; i--) ctx.lineTo(x + dir * i * 5, y - 82 + Math.sin(t * 5 + i * 0.6) * 2.5 * (i / 10) - (i === 10 ? 8 : 0));
      ctx.closePath(); Art.fs(ctx, color, 2);
      ctx.beginPath(); ctx.arc(x + dir * 22, y - 100, 6, 0, Math.PI * 2); ctx.fillStyle = '#f2c94c'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - 122, 4, 0, Math.PI * 2); Art.fs(ctx, '#f2c94c', 1.5);
      ctx.restore();
    }

    _hpBar(ctx, u) {
      const w = 42, h = 7, x = u.x - w / 2, y = u.y - 88 * (u.def.look.scale || 1) * US();
      const r = h / 2;
      const pill = (px, py, pw, ph, pr) => { ctx.beginPath(); ctx.moveTo(px + pr, py); ctx.arcTo(px + pw, py, px + pw, py + ph, pr); ctx.arcTo(px + pw, py + ph, px, py + ph, pr); ctx.arcTo(px, py + ph, px, py, pr); ctx.arcTo(px, py, px + pw, py, pr); ctx.closePath(); };
      // rám: tmavý okraj a jemná zlatá linka
      pill(x - 2, y - 2, w + 4, h + 4, r + 2); ctx.fillStyle = 'rgba(8,6,4,.88)'; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(232,184,74,.55)'; ctx.stroke();
      u.hpShow = u.hpShow == null ? u.hp : u.hpShow + (u.hp - u.hpShow) * 0.12;
      const kShow = Math.max(0, u.hpShow / u.maxHp), k = Math.max(0, u.hp / u.maxHp);
      if (kShow > k) { pill(x, y, Math.max(h, w * kShow), h, r); ctx.fillStyle = 'rgba(255,236,180,.85)'; ctx.fill(); }
      if (k > 0) {
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        if (u.team === 'player') { g.addColorStop(0, '#bfe0ff'); g.addColorStop(0.45, '#4f9bff'); g.addColorStop(1, '#1d4a9a'); }
        else { g.addColorStop(0, '#ffd0c8'); g.addColorStop(0.45, '#ef5350'); g.addColorStop(1, '#8a1612'); }
        pill(x, y, Math.max(h, w * k), h, r); ctx.fillStyle = g; ctx.fill();
        // lesk
        pill(x + 2, y + 1, Math.max(2, w * k - 4), h * 0.38, h * 0.2); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fill();
      }
    }

    _castleFire(ctx, side, facing, t) {
      const r = side.castle.hp / side.castle.maxHp;
      if (r > 0.45) return;
      const n = r < 0.2 ? 4 : 2;
      const img = side.castleImg;
      for (let i = 0; i < n; i++) {
        const lx = [120, 210, 60, 270][i];
        const ly = [250, 300, 220, 200][i];
        const x = facing === 1 ? side.castle.front - img.w + lx : side.castle.front + img.w - lx;
        const y = C().groundY - img.h + ly;
        for (let k = 0; k < 3; k++) {
          const f = (t * 3 + k * 0.33 + i * 0.21) % 1;
          ctx.globalAlpha = 1 - f;
          ctx.beginPath(); ctx.arc(x + Math.sin(t * 5 + k) * 4, y - f * 40, 9 * (1 - f) + 3, 0, Math.PI * 2);
          ctx.fillStyle = k === 0 ? '#ffd27a' : '#ff7a2f'; ctx.fill();
          ctx.globalAlpha = (1 - f) * 0.4;
          ctx.beginPath(); ctx.arc(x + Math.sin(t * 2 + k) * 8, y - 40 - f * 70, 10 + f * 16, 0, Math.PI * 2);
          ctx.fillStyle = '#4a4440'; ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  window.Battle = Battle;
})();
