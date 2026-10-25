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
      const M = !!(pal.mount || def.look.mount);
      const bx0 = (M ? -62 : -48) * s, by0 = (M ? -170 : -140) * s, bw = (M ? 196 : 160) * s, bh = (M ? 190 : 158) * s;
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
          coins: ps.startCoins || cfg.startCoins, income: ps.income, maxCoins: Infinity,
          hpMult: ps.unitMult, dmgMult: ps.unitMult,
          castle: { hp: ps.castleHp * (opts.player.castleCfg && opts.player.castleCfg.big ? 1.25 : 1), maxHp: ps.castleHp * (opts.player.castleCfg && opts.player.castleCfg.big ? 1.25 : 1), front: cfg.playerFront, tower: ps.towerDmg, towerTimer: 1 },
          cooldowns: {}, abilityCd: {}, shieldUntil: 0,
          formation: 'utok', flagX: cfg.playerFront + 380,
          castleImg: Art.castleImage('player', opts.player.castleSkin, opts.player.castleLevel, 2, (GameData.factions[opts.playerFaction] || {}).castleStyle || 'evropa', opts.player.castleCfg || null),
          faction: opts.playerFaction || 'kralovstvi',
          skins: opts.player.unitSkins
        },
        enemy: {
          coins: cfg.startCoins, income: es.income, baseIncome: es.income, maxCoins: Infinity,
          hpMult: es.hpMult, dmgMult: es.dmgMult,
          castle: { hp: es.castleHp * (opts.enemyCastleHpMult || 1), maxHp: es.castleHp * (opts.enemyCastleHpMult || 1), front: cfg.enemyFront, tower: es.towerDmg, towerTimer: 1.5 },
          cooldowns: {}, abilityCd: {}, shieldUntil: 0,
          formation: 'formace', flagX: cfg.enemyFront - 420,
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
      this.timers = []; this.walls = []; this.tornados = []; this.beams = []; this.spikes = []; this.shake = 0; this.blasts = []; this.flash = null; this.vfx = new VFX();
      if (this.def && this.def.slots.length) {
        this.side.player.castle.tower = 0;   // věž nahrazují obránci na hradbách
        this.def.slots.forEach((_, i) => (this.defTimer[i] = 0.6 + i * 0.35));
      }
      this.palCache = {};
      // SPOJENECTVÍ: hrady všech tří národů nad sebou, z každého vycházejí jeho vojáci
      this.allyCastles = [];
      if (opts.allyFactions && opts.allyFactions.length > 1) {
        const pf = this.side.player.faction;
        opts.allyFactions.filter(f => f !== pf).forEach((f, i) => {
          const F = GameData.factions[f];
          const img = Art.castleImage('player', 'kralovsky', opts.player.castleLevel || 3, 2, F.castleStyle || 'evropa', { emblem: GameData.defaultEmblem[f], banner: F.color, decor: {} });
          this.allyCastles.push({ f, img, k: 0.82 - i * 0.08, dy: -(26 + i * 26), dx: -(300 + i * 270) });
        });
      }
      // STŘED BOJIŠTĚ: kdo ho obsadí, má výhodu (+35 % mincí, +10 % útok)
      this.cp = { x: cfg.worldW / 2, r: 200, v: 0, owner: null };

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
          this.cam.manualUntil = this.time + 24;   // hráč má dost času prohlížet bojiště
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
          this.cam.manualUntil = this.time + 30;
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
    /* ZÁSOBNÍK: hráč může klepnout na vojáka až 50× i bez peněz.
       Vojáci se pak posílají postupně, jakmile na ně jsou mince. */
    enqueue(unitId) {
      this.queue = this.queue || [];
      if (!this.queue.length && this.spawn('player', unitId)) { if (this.o.onSpawned) this.o.onSpawned(unitId); return 'sent'; }
      if (this.queueCount(unitId) >= 50) return 'full';
      this.queue.push(unitId);
      if (this.o.onQueue) this.o.onQueue();
      return 'queued';
    }
    queueCount(unitId) { return (this.queue || []).filter(x => x === unitId).length; }
    /* zruší jednoho vojáka ze zásobníku (posledního zadaného) */
    dequeueOne(unitId) {
      const q = this.queue || [];
      const i = q.lastIndexOf(unitId);
      if (i >= 0) q.splice(i, 1);
      if (this.o.onQueue) this.o.onQueue();
    }
    clearQueue(unitId) { this.queue = (this.queue || []).filter(x => x !== unitId); if (this.o.onQueue) this.o.onQueue(); }
    _runQueue() {
      const q = this.queue;
      if (!q || !q.length) return;
      // první ve frontě má přednost; když čeká jen na obnovení, může jít další, na kterého jsou peníze
      for (let i = 0; i < Math.min(q.length, 6); i++) {
        const id = q[i], chk = this.canSpawn('player', id);
        if (chk.ok) { this.spawn('player', id); q.splice(i, 1); if (this.o.onSpawned) this.o.onSpawned(id); if (this.o.onQueue) this.o.onQueue(); return; }
        if (chk.why === 'mince') return;
      }
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
      let sy = null;
      const ac = team === 'player' && this.allyCastles.find(a => a.f === fac);
      if (ac) { sx = s.castle.front + ac.dx - 4; sy = cfg.laneTop - 4; }
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
        y: sy != null ? sy : cfg.laneTop + this.rand() * (cfg.laneBottom - cfg.laneTop),
        hp: def.hp * (def.boss ? 1 : s.hpMult), maxHp: def.hp * (def.boss ? 1 : s.hpMult),
        dmg: def.dmg * s.dmgMult,
        atkTimer: 0.2, atk: -1, atkDur: Math.min(0.55, def.attackInterval * 0.7), hitDone: false,
        walk: this.rand() * 6, moving: true, dead: 0, target: null,
        pal: def.pal ? (this.palCache[key + def.id] || (this.palCache[key + def.id] = Object.assign({}, this.palCache[key], def.pal))) : this.palCache[key], hurt: 0, born: this.time
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
      const foeTeam = team === 'player' ? 'enemy' : 'player', dir = team === 'player' ? 1 : -1, cfg = C();
      const foes = () => this.units.filter(u => u.team === foeTeam && !u.dead);
      const mine = () => this.units.filter(u => u.team === team && !u.dead);
      const midY = (cfg.laneTop + cfg.laneBottom) / 2;
      // cíl: nepřítel nejblíž mému hradu, jinak před nepřátelskou bránou
      const frontX = () => {
        const f = foes();
        if (!f.length) return this.side[foeTeam].castle.front - dir * 60;
        f.sort((p, q) => dir === 1 ? p.x - q.x : q.x - p.x);
        return f[0].x + dir * 40;
      };
      const say = (txt, color, x) => this.texts.push({ x: x == null ? this.cam.x + this.cam.viewW / 2 : x, y: 380, txt, color, t: 0, life: 1.5, big: true });
      const near = (x, r) => foes().filter(e => Math.hypot(e.x - x, (e.y - midY) * 0.7) < r);
      const ring = (x, y, col, r) => this.particles.push({ x, y, vx: 0, vy: 0, g: 0, t: 0, life: 0.5, r: r || 14, ring: true, color: col });
      const puff = (x, y, col, n, up) => { for (let i = 0; i < n; i++) { const an = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160; this.particles.push({ x: x + (Math.random() - 0.5) * 40, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - (up || 80), g: 260, t: 0, life: 0.7, r: 2 + Math.random() * 3.5, color: col }); } };
      s.coins -= a.cost;
      s.abilityCd[id] = this.time + a.cooldown;
      const tx = frontX();
      switch (a.kind) {
        case 'meteors':
          for (let i = 0; i < 7; i++) {
            const ox = (this.rand() - 0.5) * a.radius * 1.6;
            this.meteors.push({ team, x0: tx + ox - 260 * dir, y0: -60 - i * 30, x1: tx + ox, y1: cfg.laneTop + this.rand() * 60, t: -i * 0.12, dur: 0.75, done: false, dmg: a.power / 2.6, radius: a.radius * 0.55 });
          }
          break;
        case 'meteor':
          this.meteors.push({ team, x0: tx - 420 * dir, y0: -240, x1: tx + dir * 30, y1: midY, t: 0, dur: 1.15, done: false, dmg: a.power, radius: a.radius, big: true });
          break;
        case 'shield': s.shieldUntil = this.time + a.duration; break;
        case 'element': this._catImpact({ team, tx, ty: midY, dmg: a.power * (team === 'player' ? s.dmgMult : 1), el: a.el, slow: a.slow, big: true }); break;
        case 'volley': {
          const pool = near(tx, a.radius).concat(foes()).slice(0, 12);
          const ox = s.castle.front - dir * 40, oy = cfg.groundY - 260;
          for (let i = 0; i < 24; i++) {
            const tgt = pool.length ? pool[i % pool.length] : null;
            const delay = i * 0.05;
            this.later(delay, () => {
              if (tgt && !tgt.dead) {
                this._shoot(team, ox + (Math.random() - 0.5) * 60, oy + (Math.random() - 0.5) * 40, tgt, a.power, 700, null);
                const pr = this.projectiles[this.projectiles.length - 1];
                pr.arc = 180; pr.big = true; if (a.poison) pr.poison = true;
              } else {
                const x = tx + (Math.random() - 0.5) * a.radius * 2;
                this.projectiles.push({ team, kind: 'arrow', x0: ox, y0: oy, tx: x, ty: midY + (Math.random() - 0.5) * 60, target: null, castle: null, dmg: 0, from: null, t: 0, dur: 0.9, arc: 180, done: false });
              }
            });
          }
          break;
        }
        case 'storm':
          for (let i = 0; i < 6; i++) this.later(i * 0.5, () => {
            const f = foes().sort((p, q) => q.hp - p.hp)[Math.floor(Math.random() * 2)];
            if (!f) return;
            this.vfx.lightning(f.x, (this.H - this.cam.viewH) - 20, f.y - 6); this.flash = { color: '#fff6c8', t: 0, life: 0.18 }; this.shake = Math.max(this.shake, 0.3);
            near(f.x, 70).forEach(e => this._damage(e, a.power * (e === f ? 1 : 0.5), null));
          });
          break;
        case 'heal':
          mine().forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * a.power); this.vfx.rise(u.x, u.y, 'heal', 14); this.vfx.pillar(u.x, u.y, 40, 'rgba(120,255,150,.55)', 1.1); });
          break;
        case 'buff': s.hornUntil = this.time + a.duration; mine().forEach(u => { this.vfx.rise(u.x, u.y, 'gold', 16); this.vfx.explosion(u.x, u.y - 50, 40, 'gold'); }); break;
        case 'curse': this.side[foeTeam].curseUntil = this.time + a.duration; foes().forEach(u => { this.vfx.rise(u.x, u.y, 'shadow', 12); this.vfx.explosion(u.x, u.y - 40, 50, 'shadow'); }); break;
        case 'stun':
          near(tx, a.radius).forEach(e => { this._damage(e, a.power, null); e.stunUntil = this.time + (e.def.boss ? a.duration * 0.4 : a.duration); e.frozen = a.icon === 'snow' || a.icon === 'icespike'; });
          this.vfx.explosion(tx, midY, 120, 'ice'); this.vfx.iceSpikes(tx, midY, a.radius * 2, a.duration + 0.4);
          near(tx, a.radius).forEach(e => this.vfx.explosion(e.x, e.y - 30, 40, 'ice'));
          break;
        case 'quake':
          this.shake = 0.9;
          foes().forEach(e => { this._damage(e, a.power, null); e.stunUntil = this.time + (e.def.boss ? 0.5 : a.duration); this.vfx.explosion(e.x, e.y, 70, 'stone'); });
          for (let x = this.cam.x; x < this.cam.x + this.cam.viewW; x += 160) this.vfx.explosion(x + Math.random() * 80, midY + (Math.random() - 0.5) * 60, 60, 'stone');
          break;
        case 'summon': {
          const uid = GameData.unitForRole(s.faction, a.role);
          for (let i = 0; i < a.count; i++) this.later(i * 0.35, () => { this.spawn(team, uid, true); const u = this.units[this.units.length - 1]; if (u) { this.vfx.pillar(u.x, u.y, 50, 'rgba(255,240,180,.7)', 0.9); this.vfx.rise(u.x, u.y, 'holy', 12); } });
          break;
        }
        case 'repair': s.castle.hp = Math.min(s.castle.maxHp, s.castle.hp + s.castle.maxHp * a.power); for (let i = 0; i < 5; i++) this.vfx.rise(s.castle.front - dir * (40 + i * 50), cfg.groundY, 'heal', 12); this.vfx.pillar(s.castle.front - dir * 140, cfg.groundY, 160, 'rgba(160,255,180,.5)', 1.2); break;
        case 'gold': s.coins += a.power; for (let i = 0; i < 4; i++) this.vfx.explosion(s.castle.front - dir * (60 + i * 50), cfg.groundY - 150, 50, 'gold'); this.vfx.rise(s.castle.front - dir * 100, cfg.groundY - 60, 'gold', 30); break;
        case 'firearrows': s.fireArrowsUntil = this.time + a.duration; mine().filter(u => u.def.ranged).forEach(u => this.vfx.explosion(u.x, u.y - 50, 46, 'fire')); break;
        case 'barrage': {
          const f = foes().sort((p, q) => dir === 1 ? p.x - q.x : q.x - p.x).slice(0, 5);
          const ox = s.castle.front - dir * 120, oy = cfg.groundY - 220;
          for (let i = 0; i < 5; i++) this.later(i * 0.3, () => {
            const g = f[i] && !f[i].dead ? f[i] : null, x = g ? g.x : tx + dir * i * 50, y = g ? g.y : midY;
            const dist = Math.abs(x - ox);
            this.projectiles.push({ team, kind: 'cat', el: 'kamen', x0: ox, y0: oy, tx: x, ty: y, target: null, castle: null, dmg: a.power, from: null, t: 0, dur: Math.max(0.7, dist / 520), arc: Math.min(240, dist * 0.35), done: false });
          });
          break;
        }
        case 'wall': this.walls.push({ team, x: tx - dir * 30, until: this.time + a.duration, dps: a.power, tick: 0 }); for (let k = 0; k < 4; k++) this.vfx.burn(tx - dir * 30, cfg.laneTop + k * (cfg.laneBottom - cfg.laneTop) / 3, 70, a.duration); this.vfx.explosion(tx - dir * 30, midY, 110, 'fire'); break;
        case 'tornado': this.tornados.push({ team, x: s.castle.front + dir * 120, y: midY, vx: dir * 320, until: this.time + a.duration, dps: a.power, tick: 0 }); break;
        case 'holy':
          this.vfx.pillar(tx, midY, a.radius * 0.8, 'rgba(255,248,210,.85)', 1.4); this.vfx.explosion(tx, midY, 150, 'holy');
          near(tx, a.radius).forEach(e => this._damage(e, a.power, null));
          mine().filter(u => Math.abs(u.x - tx) < a.radius * 1.4).forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.3); });
          puff(tx, midY, '#fff6c4', 24, 120);
          break;
        case 'breath': {
          const lim = (this.side.player.castle.front + this.side.enemy.castle.front) / 2;
          const sx = s.castle.front - dir * 30, sy = cfg.groundY - 300;
          this.vfx.breath(sx, sy, lim, dir);
          this.later(0.45, () => { for (let x = s.castle.front + dir * 200; (x - lim) * dir < 0; x += dir * 260) this.vfx.burn(x, midY, 200, 3); });
          this.later(0.45, () => foes().filter(e => (e.x - lim) * dir < 0).forEach(e => { this._damage(e, a.power, null, true); e.dot = { until: this.time + 3, dps: a.power * 0.15, c: 'rgba(255,120,40,.45)' }; }));
          break;
        }
      }
      // VÝRAZNÉ EFEKTY: kamera se podívá na místo útoku, záblesk obrazovky,
      // velká tlaková vlna na zemi a sloup světla v barvě útoku
      const AREA = { meteors: 1, meteor: 1, element: 1, volley: 1, storm: 1, stun: 1, holy: 1, barrage: 1, wall: 1, tornado: 0, breath: 0, quake: 0 };
      const SELF = { heal: 1, buff: 1, shield: 1, repair: 1, gold: 1, summon: 1, firearrows: 1, curse: 0 };
      const col = a.color || '#ffd77a';
      if (team === 'player') {
        const camFree = this.time >= this.cam.manualUntil;   // když si hráč sám posunul kameru, nechá se být
        if (a.kind in AREA && AREA[a.kind]) {
          if (camFree) { this.cam.x = this._clampCam(tx - this.cam.viewW / 2); this.cam.manualUntil = this.time + 6; }
          const delay = a.kind === 'meteor' ? 1.1 : a.kind === 'meteors' ? 0.7 : a.kind === 'volley' ? 0.9 : a.kind === 'barrage' ? 0.8 : 0;
          this.later(delay, () => { this.shake = Math.max(this.shake, a.kind === 'meteor' ? 1 : 0.45); puff(tx, midY, col, 40, 160); });
        } else if (a.kind in SELF) {
          const my = mine(); if (my.length && camFree) { const mx = my.reduce((q, u) => q + u.x, 0) / my.length; this.cam.x = this._clampCam(mx - this.cam.viewW / 2); this.cam.manualUntil = this.time + 6; }
        } else if (a.kind === 'curse' || a.kind === 'quake') {
          foes().forEach(u => this.blasts.push({ x: u.x, y: u.y, r: 50, color: col, t: 0, life: 1.0, small: true }));
          if (a.kind === 'quake') this.shake = 1.4;
        } else if (a.kind === 'breath' || a.kind === 'tornado') this.shake = Math.max(this.shake, 0.6);
        this.flash = { color: col, t: 0, life: 0.45 };
      }
      this.later(0.05, () => this.texts.push({ x: this.cam.x + this.cam.viewW / 2, y: (this.H - this.cam.viewH) + this.cam.viewH * 0.5, txt: a.name, color: '#fff1c4', t: 0, life: 1.8, big: true, huge: true }));
      if (team === 'player' && this.o.onSkill) this.o.onSkill(a);
      return true;
    }
    /* spustí akci se zpožděním (v čase bitvy) */
    later(sec, fn) { this.timers.push({ at: this.time + sec, fn }); }

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
        s.coins = Math.min(s.maxCoins, s.coins + s.income * dt * (this.cp.owner === team ? 1.35 : 1));
      }
      this._runQueue();
      this._updateCapture(dt);
      if (this.timers.length) {
        const due = this.timers.filter(x => x.at <= this.time);
        if (due.length) { this.timers = this.timers.filter(x => x.at > this.time); due.forEach(x => x.fn()); }
      }
      this._updateSkillFx(dt);
      this.vfx.update(dt);
      // hořící vojáci: plameny na těle
      this._burnT = (this._burnT || 0) - dt;
      if (this._burnT <= 0) { this._burnT = 0.08; for (const u of this.units) if (!u.dead && u.dot && this.time < u.dot.until && /255,120/.test(u.dot.c || '')) this.vfx.flame(u.x + (Math.random() - 0.5) * 20, u.y - 20 - Math.random() * 60, 18 + Math.random() * 14, 0.4); }
      // aura velení: vojáci v okolí velitele mají vyšší útok
      this._auraT = (this._auraT || 0) - dt;
      if (this._auraT <= 0) {
        this._auraT = 0.4;
        for (const c of this.units) if (!c.dead && c.def.aura) for (const u of this.units) if (u.team === c.team && !u.dead && Math.abs(u.x - c.x) < 200) { u.inspired = this.time + 0.6; u.inspiredBy = c.def.aura; }
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
        const slowK = (u.slowUntil > this.time ? 0.5 : 1) * ((this.side[u.team].hornUntil || 0) > this.time ? 1.3 : 1);
        if (u === this.hero) { this._updateHero(u, dt); continue; }
        if (u.stunUntil > this.time) { u.moving = false; continue; }
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
        if (p.burn && !p.done && Math.random() < 0.6) { const k = Math.min(1, p.t); this.vfx.flame(p.x0 + (p.tx - p.x0) * k, p.y0 + (p.ty - p.y0) * k - p.arc * 4 * k * (1 - k), 14, 0.25); }
        if (p.t >= 1 && !p.done) {
          p.done = true;
          if (p.kind === 'fire') this._sparks(p.tx, p.ty, '#ff9a3c', 6);
          if (p.kind === 'magic') {
            const mc = (p.from && p.from.def.look.magic) || '#7fc8ff';
            this._sparks(p.tx, p.ty, mc, 10);
            this.particles.push({ x: p.tx, y: p.ty, vx: 0, vy: 0, g: 0, t: 0, life: 0.35, r: 10, ring: true, color: mc });
            const sp = p.from && p.from.def.splash;
            if (sp && p.target) for (const e of this.units) if (e.team !== p.team && !e.dead && e !== p.target && Math.abs(e.x - p.target.x) < 60) this._damage(e, p.dmg * sp, null);
          }
          if (p.kind === 'cat') { this._catImpact(p); continue; }
          if (p.pierce && p.target) {
            const second = this.units.find(e => e.team !== p.team && !e.dead && e !== p.target && Math.abs(e.x - p.target.x) < 70);
            if (second) this._damage(second, p.dmg * 0.6, null);
          }
          if (p.big && p.target) this.vfx.explosion(p.target.x, p.target.y - 30, 30, p.poison ? 'poison' : 'stone');
          if (p.target && !p.target.dead) {
            this._damage(p.target, p.dmg, p.from, p.kind === 'fire' || p.burn);
            if (p.burn && !p.target.dead) p.target.dot = { until: this.time + 3, dps: Math.max(6, p.dmg * 0.3), c: 'rgba(255,120,40,.45)' };
            if (p.poison && !p.target.dead) p.target.dot = { until: this.time + 4, dps: Math.max(6, p.dmg * 0.35), c: 'rgba(120,220,80,.45)' };
          }
          else if (p.castle) this._damageCastle(p.castle, p.dmg);
        }
      }
      this.projectiles = this.projectiles.filter(p => !p.done || p.t < 1.25);

      // meteory
      for (const m of this.meteors) {
        m.t += dt;
        if (m.t > 0 && !m.done) { const k = Math.min(1, m.t / m.dur); this.vfx.meteor({ x: m.x0 + (m.x1 - m.x0) * k, y: m.y0 + (m.y1 - m.y0) * k, big: m.big }); }
        if (!m.done && m.t >= m.dur) {
          m.done = true;
          this.vfx.explosion(m.x1, m.y1, m.big ? 190 : 90, 'fire');
          this.shake = Math.max(this.shake, m.big ? 1.2 : 0.35);
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

    /* obsazování středu bojiště */
    _updateCapture(dt) {
      const cp = this.cp;
      let p = 0, e = 0;
      for (const u of this.units) if (!u.dead && Math.abs(u.x - cp.x) < cp.r) { if (u.team === 'player') p++; else e++; }
      const d = Math.max(-4, Math.min(4, p - e));
      if (d) cp.v = Math.max(-1, Math.min(1, cp.v + d * dt * 0.05));
      const prev = cp.owner;
      cp.owner = cp.v >= 1 ? 'player' : cp.v <= -1 ? 'enemy' : (cp.owner && Math.abs(cp.v) > 0.5 ? cp.owner : null);
      if (cp.owner !== prev && cp.owner) this.texts.push({ x: cp.x, y: (this.H - this.cam.viewH) + this.cam.viewH * 0.45, txt: cp.owner === 'player' ? t('cp_ours') : t('cp_theirs'), color: cp.owner === 'player' ? '#9fd0ff' : '#ff9e9e', t: 0, life: 2.4, big: true, huge: true });
    }
    _drawCapture(ctx, t) {
      const cp = this.cp, cfg = C(), y = cfg.laneTop - 8;
      // kamenný kruh na zemi a prapor
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cp.x, (cfg.laneTop + cfg.laneBottom) / 2 + 8, cp.r, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,233,168,.10)'; ctx.fill(); ctx.setLineDash([16, 10]); ctx.lineWidth = 4;
      ctx.strokeStyle = cp.owner === 'player' ? 'rgba(80,150,255,.85)' : cp.owner === 'enemy' ? 'rgba(240,70,60,.85)' : 'rgba(255,233,168,.6)'; ctx.stroke(); ctx.setLineDash([]);
      // ukazatel obsazení
      const w = 160, bx = cp.x - w / 2, by = y - 190;
      ctx.fillStyle = 'rgba(10,12,18,.8)'; ctx.fillRect(bx - 3, by - 3, w + 6, 16);
      ctx.fillStyle = '#d6453c'; ctx.fillRect(bx, by, w / 2, 10); ctx.fillStyle = '#4b8df0'; ctx.fillRect(bx + w / 2, by, w / 2, 10);
      ctx.fillStyle = '#fff'; ctx.fillRect(bx + w / 2 + cp.v * w / 2 - 2, by - 3, 4, 16);
      ctx.restore();
      this._drawFlag(ctx, cp.x, y, cp.owner === 'player' ? '#2f62b8' : cp.owner === 'enemy' ? '#a8262a' : '#d9c9a0', t, cp.owner === 'enemy' ? -1 : 1);
    }

    /* ohnivé zdi, vichřice, paprsky a ledová kopí ze speciálních útoků */
    _updateSkillFx(dt) {
      const t = this.time;
      // jedovaté mraky
      for (const c of this.clouds) {
        c.tick -= dt;
        if (c.tick <= 0) { c.tick = 0.5; for (const e of this.units) if (e.team !== (c.team || 'player') && !e.dead && Math.abs(e.x - c.x) < c.r) this._damage(e, c.dps * 0.5, null); }
      }
      this.clouds = this.clouds.filter(c => c.until > this.time);
      for (const b of this.bolts) b.t += dt;
      this.bolts = this.bolts.filter(b => b.t < 0.35);
      for (const w of this.walls) {
        w.tick -= dt;
        if (w.tick <= 0) {
          w.tick = 0.4;
          for (const e of this.units) if (e.team !== w.team && !e.dead && Math.abs(e.x - w.x) < 46) { this._damage(e, w.dps * 0.4, null, true); e.dot = { until: t + 2, dps: w.dps * 0.25, c: 'rgba(255,120,40,.45)' }; }
        }
      }
      this.walls = this.walls.filter(w => w.until > t);
      for (const o of this.tornados) {
        o.x += o.vx * dt; o.tick -= dt;
        for (const e of this.units) if (e.team !== o.team && !e.dead && Math.abs(e.x - o.x) < 60 && !e.def.boss) { e.x += o.vx * 0.55 * dt; e.slotX = null; }
        if (o.tick <= 0) { o.tick = 0.3; for (const e of this.units) if (e.team !== o.team && !e.dead && Math.abs(e.x - o.x) < 70) this._damage(e, o.dps * 0.3, null); }
      }
      this.tornados = this.tornados.filter(o => o.until > t && o.x > 0 && o.x < this.W);
      for (const b of this.beams) b.t += dt;
      for (const b of this.blasts) b.t += dt;
      this.blasts = this.blasts.filter(b => b.t < b.life);
      if (this.flash) { this.flash.t += dt; if (this.flash.t > this.flash.life) this.flash = null; }
      this.beams = this.beams.filter(b => b.t < b.life);
      for (const k of this.spikes) k.t += dt;
      this.spikes = this.spikes.filter(k => k.t < k.life);
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    }
    /* klece s rukojmími u nepřátelské pevnosti; po vítězství se otevřou */
    _drawCages(ctx, t) {
      const cfg = C(), n = Math.min(3, Math.ceil(this.o.hostages / 2)), E = this.side.enemy;
      const freed = this.over && E.castle.hp <= 0;
      this._hpal = this._hpal || Art.unitPalette('player', 'zakladni', 'kralovstvi');
      for (let i = 0; i < n; i++) {
        const x = E.castle.front - 120 - i * 64, y = cfg.laneTop - 6;
        const prisoner = GameData.units.pesak;
        const run = freed ? Math.min(400, (this.time - (this._freeAt || (this._freeAt = this.time))) * 160) : 0;
        Art.drawUnit(ctx, prisoner, this._hpal, { x: x - run, y: y - 4, facing: freed ? -1 : (Math.sin(t * 2 + i) > 0 ? 1 : -1), t, moving: freed, walk: t * 9, scaleMul: 0.62, noShadow: true });
        if (!freed) {
          ctx.save();
          ctx.fillStyle = '#4a2e16'; ctx.fillRect(x - 26, y - 70, 52, 7); ctx.fillRect(x - 26, y - 2, 52, 7);
          ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 4;
          for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 24 + k * 9.6, y - 66); ctx.lineTo(x - 24 + k * 9.6, y); ctx.stroke(); }
          ctx.fillStyle = '#8a8a8a'; ctx.beginPath(); ctx.arc(x, y - 36, 4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    }
    _drawSkillFx(ctx, t) {
      // tlakové vlny a sloupy světla
      for (const b of this.blasts) {
        const k = b.t / b.life, a = 1 - k;
        ctx.save();
        ctx.globalAlpha = 0.7 * a;
        ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * (0.3 + k * 0.9), b.r * 0.28 * (0.3 + k * 0.9), 0, 0, Math.PI * 2);
        ctx.fillStyle = b.color; ctx.fill();
        ctx.globalAlpha = 0.95 * a; ctx.lineWidth = b.small ? 3 : 7; ctx.strokeStyle = '#ffffff'; ctx.stroke();
        if (!b.small) {
          const g = ctx.createLinearGradient(b.x, b.y - 420, b.x, b.y);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, b.color);
          ctx.globalAlpha = 0.5 * a; ctx.fillStyle = g; ctx.fillRect(b.x - b.r * 0.35 * (1 - k * 0.5), b.y - 420, b.r * 0.7 * (1 - k * 0.5), 420);
        } else {
          const g = ctx.createLinearGradient(b.x, b.y - 130, b.x, b.y);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, b.color);
          ctx.globalAlpha = 0.55 * a; ctx.fillStyle = g; ctx.fillRect(b.x - 22, b.y - 130, 44, 130);
        }
        ctx.restore();
      }
      // trvalé aury: válečný roh (zlatá), kletba (fialová), štít (modrá)
      for (const u of this.units) {
        if (u.dead) continue;
        const sd = this.side[u.team], foe = this.side[u.team === 'player' ? 'enemy' : 'player'];
        let c = null;
        if ((sd.hornUntil || 0) > t) c = 'rgba(255,190,60,'; else if ((sd.curseUntil || 0) > t) c = 'rgba(190,90,255,'; else if (sd.shieldUntil > t) c = 'rgba(120,190,255,';
        if (!c) continue;
        const pulse = 0.35 + Math.sin(t * 6 + u.id) * 0.12;
        ctx.beginPath(); ctx.ellipse(u.x, u.y - 2, 26, 8, 0, 0, Math.PI * 2); ctx.fillStyle = c + pulse + ')'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(u.x, u.y - 44, 18, 46, 0, 0, Math.PI * 2); ctx.fillStyle = c + (pulse * 0.35) + ')'; ctx.fill();
        void foe;
      }
      const cfg = C();
      for (const w of []) {
        const a = Math.min(1, (w.until - t) / 0.5);
        for (let i = 0; i < 9; i++) {
          const y = cfg.laneTop + i * (cfg.laneBottom - cfg.laneTop) / 8, fl = 110 + Math.sin(t * 9 + i * 1.7) * 30;
          const g = ctx.createLinearGradient(0, y - fl, 0, y);
          g.addColorStop(0, 'rgba(255,220,120,0)'); g.addColorStop(0.5, `rgba(255,140,40,${0.8 * a})`); g.addColorStop(1, `rgba(200,40,10,${0.9 * a})`);
          ctx.beginPath(); ctx.moveTo(w.x - 34, y); ctx.quadraticCurveTo(w.x - 24, y - fl * 0.6, w.x + Math.sin(t * 7 + i) * 6, y - fl); ctx.quadraticCurveTo(w.x + 24, y - fl * 0.6, w.x + 34, y); ctx.closePath();
          ctx.fillStyle = g; ctx.fill();
        }
      }
      for (const o of this.tornados) {
        ctx.save(); ctx.globalAlpha = 0.75;
        for (let k = 0; k < 9; k++) {
          const yy = o.y + 10 - k * 30, r = 16 + k * 9, ph = t * 12 + k;
          ctx.beginPath(); ctx.ellipse(o.x + Math.sin(ph * 0.5) * k * 2, yy, r, 6 + k * 0.6, 0, 0, Math.PI * 2);
          ctx.lineWidth = 4; ctx.strokeStyle = k % 2 ? 'rgba(200,220,235,.8)' : 'rgba(150,175,195,.8)'; ctx.stroke();
        }
        ctx.restore();
      }
      for (const b of this.beams) {
        const a = Math.sin(Math.min(1, b.t / b.life) * Math.PI);
        const g = ctx.createLinearGradient(b.x - 70, 0, b.x + 70, 0);
        g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(0.5, `rgba(255,248,210,${0.85 * a})`); g.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = g; ctx.fillRect(b.x - 70, 0, 140, cfg.laneBottom + 20);
      }
      for (const k of this.spikes) {
        const grow = Math.min(1, k.t / 0.15), fade = Math.min(1, (k.life - k.t) / 0.3), h = k.h * grow;
        ctx.save(); ctx.globalAlpha = fade;
        ctx.beginPath(); ctx.moveTo(k.x - 9, k.y); ctx.lineTo(k.x, k.y - h); ctx.lineTo(k.x + 9, k.y); ctx.closePath();
        const g = ctx.createLinearGradient(k.x, k.y - h, k.x, k.y); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#6ac0f0');
        Art.fs(ctx, g, 1.8); ctx.restore();
      }
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
      this.cam.x += (want - this.cam.x) * Math.min(1, dt * 0.45);   // pomalé, klidné sledování
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
      const kind = from && from.def && (from.def.projectile === 'fire' || from.def.projectile === 'magic') ? from.def.projectile : 'arrow';
      const burn = (this.side[team].fireArrowsUntil || 0) > this.time;
      this.projectiles.push({ burn, team, kind, x0: ox, y0: oy, tx, ty, target, castle: target ? null : castle, dmg, from, t: 0, dur: Math.max(0.25, dist / speed), arc: kind === 'fire' ? Math.min(50, dist * 0.12) : Math.min(90, dist * 0.22), done: false });
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
      if ((s.curseUntil || 0) > this.time) dmg *= 1.5;
      if (from && from.team && this.cp && this.cp.owner === from.team) dmg *= 1.1;
      if (from && from.team && (this.side[from.team].hornUntil || 0) > this.time) dmg *= 1.4;
      if (from && from.inspired > this.time) dmg *= 1 + (from.inspiredBy || 0.15);
      if (from && from.def && from.def.charge && !from.charged) { from.charged = true; dmg *= from.def.charge; this.texts.push({ x: target.x, y: target.y - 120 * US(), txt: t('charge'), color: '#ffd77a', t: 0, life: 0.9 }); }
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
      // NEPŘÍTEL ČEKÁ A SHROMAŽĎUJE VELKOU ARMÁDU: vyrazí po 1,5 / 2 / 3 minutách
      // (náhodně), takže z toho je velká bitva. Mezitím brání svou polovinu.
      const mine = this.units.filter(u => u.team === 'enemy' && !u.dead).length;
      const threat = this.units.some(u => u.team === 'player' && !u.dead && u.x > s.flagX - 320);
      const WAITS = [90, 120, 180];
      if (ai.attackAt == null) ai.attackAt = this.time + WAITS[Math.floor(this.rand() * WAITS.length)];
      if (s.formation === 'formace') {
        if (this.time >= ai.attackAt || threat) s.formation = 'utok';
      } else if (s.formation === 'utok' && mine <= 2 && !threat) {
        s.formation = 'formace';
        ai.attackAt = this.time + WAITS[Math.floor(this.rand() * WAITS.length)] * 0.75;
      }
      // čím déle bitva trvá, tím rychleji nepřítel získává mince (je to těžší a těžší)
      s.income = s.baseIncome * (1 + this.time / 300);
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
      const pos = Art.defenseSpots(P.castleImg, (GameData.factions[P.faction] || {}).castleStyle || 'evropa', P.castle.front, cfg.groundY, 1, this.def.slots);
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
    }
    _catImpact(p) {
      const t = this.time, x = p.tx, y = p.ty, dmg = p.dmg;
      const near = r => this.units.filter(e => e.team !== p.team && !e.dead && Math.hypot(e.x - x, (e.y - y) * 1.5) < r);
      const E = GameData.catapultEl(p.el);
      const burst = (n, col) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 180; this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, g: 300, t: 0, life: 0.6, r: 2 + Math.random() * 3, color: col }); } };
      const S = p.big ? 140 : 62;
      const V = this.vfx;
      if (p.el === 'ohen') V.explosion(x, y, S, 'fire');
      else if (p.el === 'led') { V.explosion(x, y, S * 0.9, 'ice'); V.iceSpikes(x, y, S * 1.6, p.big ? 2.2 : 1.2); }
      else if (p.el === 'kamen') V.explosion(x, y, S, 'stone');
      else if (p.el === 'voda') { V.explosion(x, y, S * 0.8, 'water'); V.wave(x - (p.team === 'player' ? 1 : -1) * 120, y + 10, p.team === 'player' ? 1 : -1); }
      else if (p.el === 'jed') { V.explosion(x, y, S * 0.7, 'poison'); V.poison(x, y, S * 1.2, p.big ? 5 : 4); }
      if (p.el === 'ohen') {
        burst(20, '#ff9a3c'); near(95).forEach(e => { this._damage(e, dmg, null, true); e.dot = { until: t + 3, dps: dmg * 0.18, c: 'rgba(255,120,40,.45)' }; });
      } else if (p.el === 'led') {
        burst(18, '#cfeeff'); near(p.slow ? 140 : 95).forEach(e => { this._damage(e, dmg * 0.8, null); e.slowUntil = t + (p.slow || 2.5); });
      } else if (p.el === 'kamen') {
        burst(18, '#a08a6a'); near(100).forEach(e => this._damage(e, dmg, null));
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
          this.vfx.lightning(cur.x, (this.H - this.cam.viewH) - 20, cur.y - 10);
          this._damage(cur, dmg * (n ? 0.75 : 1), null);
          px = cur.x; py = cur.y - 40;
          const from = cur;
          cur = this.units.filter(e => e.team !== p.team && !e.dead && !hit.includes(e) && Math.abs(e.x - from.x) < 170).sort((a, b) => Math.abs(a.x - from.x) - Math.abs(b.x - from.x))[0];
        }
      } else if (p.el === 'voda') {
        burst(24, '#7fc0ff'); near(115).forEach(e => { this._damage(e, dmg * 0.7, null); if (!e.def.boss) { e.x = Math.min(C().enemyFront - 20, e.x + 70); e.slotX = null; } });
      } else if (p.el === 'jed') {
        burst(10, '#9be07a'); near(90).forEach(e => this._damage(e, dmg * 0.5, null));
        this.clouds.push({ team: p.team, x, y, r: 105, until: t + (p.team === 'player' && !p.from ? 5 : 4), dps: dmg * 0.3, tick: 0.2 });
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
      const shk = this.shake > 0 ? (Math.random() - 0.5) * 14 * this.shake : 0;
      ctx.setTransform(sc, 0, 0, sc, (-this.cam.x + shk) * sc, (-viewTop + shk * 0.6) * sc);
      ctx.drawImage(this.layers.near, 0, 0, this.W, this.H);

      const t = this.time;
      const P = this.side.player, E = this.side.enemy;
      for (const ac of this.allyCastles.slice().reverse()) {
        ctx.save(); ctx.translate(P.castle.front + ac.dx, cfg.groundY + ac.dy); ctx.scale(ac.k, ac.k);
        Art.drawCastle(ctx, ac.img, 0, 0, 1, t, 1, GameData.factions[ac.f].color);
        ctx.restore();
      }
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

      this._drawCapture(ctx, t);
      this.vfx.drawBack(ctx);
      this._drawSkillFx(ctx, t);
      if (this.o.hostages) this._drawCages(ctx, t);
      // jednotky seřazené podle hloubky
      const list = this.units.slice().sort((a, b) => a.y - b.y);
      for (const u of list) {
        const shield = this.side[u.team].shieldUntil > t;
        if (u === this.hero) this._heroMarkBelow(ctx, u, t);
        if (u.def.aura && !u.dead) { ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(t * 3) * 0.05; ctx.beginPath(); ctx.ellipse(u.x, u.y, 190, 26, 0, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd77a'; ctx.stroke(); ctx.restore(); }
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
        if (p.kind === 'magic') {
          const mc = (p.from && p.from.def.look.magic) || '#7fc8ff';
          ctx.save(); ctx.shadowColor = mc; ctx.shadowBlur = 16;
          const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 9); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, mc); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x - Math.cos(a) * 10, y - Math.sin(a) * 10, 5, 0, Math.PI * 2); ctx.fillStyle = mc; ctx.fill();
          ctx.restore(); continue;
        }
        if (p.kind === 'cat') { Art.drawCatShot(ctx, x, y, p.el, this.time); continue; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); if (p.big) ctx.scale(1.8, 1.8);
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
        ctx.lineWidth = m.big ? 30 : 18; ctx.strokeStyle = g; ctx.stroke();
        const mr = m.big ? 46 : 20;
        ctx.beginPath(); ctx.arc(x, y, mr, 0, Math.PI * 2);
        const rg = ctx.createRadialGradient(x - mr * 0.3, y - mr * 0.3, 2, x, y, mr + 1);
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

      this.vfx.drawFront(ctx, t);
      // texty (zranění, mince)
      for (const tx of this.texts) {
        const a = 1 - tx.t / tx.life;
        ctx.globalAlpha = Math.max(0, Math.min(1, a * 1.5));
        const size = tx.huge ? 54 : tx.big ? 30 : (tx.coin ? 17 : 14);
        ctx.font = `800 ${size}px "Alegreya Sans", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        const y = tx.y - tx.t * (tx.big ? 20 : 34);
        ctx.lineWidth = tx.huge ? 8 : tx.big ? 5 : 3.5; ctx.strokeStyle = 'rgba(10,12,18,.9)';
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
      if (this.flash) {
        const a = 1 - this.flash.t / this.flash.life;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 0.35 * a; ctx.fillStyle = this.flash.color; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalAlpha = 1;
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
      c.fillStyle = this.cp.owner === 'player' ? '#4b8df0' : this.cp.owner === 'enemy' ? '#d6453c' : '#ffe9a8';
      c.beginPath(); c.arc(this.cp.x * sx, h * 0.25, 5, 0, Math.PI * 2); c.fill();
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
      const stunned = !u.dead && u.stunUntil > this.time;
      if (!u.dead && (u.slowUntil > this.time || stunned || (u.dot && this.time < u.dot.until))) {
        const icy = u.slowUntil > this.time || (stunned && u.frozen);
        if (stunned && !u.frozen) for (let k = 0; k < 3; k++) { const an = this.time * 5 + k * 2.1; ctx.beginPath(); ctx.arc(u.x + Math.cos(an) * 14, u.y - 96 * US() + Math.sin(an) * 4, 3, 0, Math.PI * 2); ctx.fillStyle = '#ffe14a'; ctx.fill(); }
        ctx.beginPath(); ctx.ellipse(u.x, u.y - 2, 22 * US(), 7 * US(), 0, 0, Math.PI * 2);
        ctx.fillStyle = icy ? 'rgba(127,211,255,.55)' : (u.dot && this.time < u.dot.until ? (u.dot.c || 'rgba(255,140,60,.45)') : 'rgba(255,225,74,.35)'); ctx.fill();
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
