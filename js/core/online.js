/* =========================================================================
   ONLINE HRA – místnosti s kódem, lobby a synchronizace bitvy
   Přenos: Supabase Realtime (broadcast přes WebSocket, bez knihovny).
   Model: HOSTITEL (kdo místnost založil) počítá celou bitvu. Ostatní hráči
   posílají jen rozkazy (pošli vojáka, speciální útok, formace) a hostitel
   jim ~8× za sekundu posílá stav. Klient si mezitím bitvu dopočítává sám,
   aby byla plynulá, a podle hostitele se opravuje.
   Hráč na druhé straně vidí bojiště zrcadlově – svůj hrad má vždy vlevo.
   ========================================================================= */
(function () {
  const REF = 'smjplqxwqyraphfeqsyk';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtanBscXh3cXlyYXBoZmVxc3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MjA3NzMsImV4cCI6MjEwODQ5Njc3M30.X6VUO5NSdJFG4E00aAALSDkW39JqANjQmk0dees_Q78';
  const WSURL = `wss://${REF}.supabase.co/realtime/v1/websocket?apikey=${KEY}&vsn=1.0.0`;
  const SNAP = 0.125;          // jak často hostitel posílá stav (s)
  const CAP = { '1v1': 2, '2v2': 4, coop: 2 };
  const PER_TEAM = { '1v1': 1, '2v2': 2, coop: 2 };
  const R = (v) => Math.round(v);

  /* ---------- kanál (Phoenix protokol Supabase Realtime) ---------- */
  class Kanal {
    constructor(topic) {
      this.topic = 'realtime:' + topic; this.h = {}; this.ref = 1; this.q = []; this.closed = false;
      this._connect();
    }
    _connect() {
      let ws;
      try { ws = this.ws = new WebSocket(WSURL); } catch (e) { setTimeout(() => this._emit('_fail'), 0); return; }
      ws.onopen = () => {
        this._send({ event: 'phx_join', payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } } });
        this.q.splice(0).forEach(m => ws.send(m));
        clearInterval(this.hb);
        this.hb = setInterval(() => this._raw({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(this.ref++) }), 25000);
        this._emit('_open');
      };
      ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch (_) { return; }
        if (m.event === 'broadcast' && m.payload) this._emit(m.payload.event, m.payload.payload);
      };
      ws.onclose = () => {
        clearInterval(this.hb);
        if (this.closed) return;
        this._emit('_drop');
        setTimeout(() => { if (!this.closed) this._connect(); }, 1500);
      };
      ws.onerror = () => {};
    }
    _raw(o) {
      const m = JSON.stringify(o);
      if (this.ws && this.ws.readyState === 1) this.ws.send(m); else if (this.q.length < 60) this.q.push(m);
    }
    _send(o) { this._raw(Object.assign({ topic: this.topic, ref: String(this.ref++), join_ref: '1' }, o)); }
    send(ev, data) { this._send({ event: 'broadcast', payload: { type: 'broadcast', event: ev, payload: data } }); }
    on(ev, fn) { (this.h[ev] = this.h[ev] || []).push(fn); }
    off(ev) { delete this.h[ev]; }
    _emit(ev, d) { (this.h[ev] || []).slice().forEach(f => { try { f(d); } catch (e) { console.error(e); } }); }
    close() {
      this.closed = true; clearInterval(this.hb);
      try { this._send({ event: 'phx_leave', payload: {} }); } catch (_) { /* nic */ }
      try { this.ws && this.ws.close(); } catch (_) { /* nic */ }
    }
  }

  const rid = n => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < n; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };

  /* ---------- co o sobě hráč pošle (armáda, hrad, síla) ---------- */
  function prepOf(save, fac) {
    const G = GameData, isU = Screens.isUnitUnlocked;
    const units = G.factionUnits(fac).filter(id => isU(save, G.units[id]));
    const bonus = {};
    units.forEach(id => { try { const b = G.gearHelpers.bonus(save, id); if (b && (b.hp || b.dmg || b.armor || b.crit)) bonus[id] = { hp: b.hp || 0, dmg: b.dmg || 0, armor: b.armor || 0, crit: b.crit || 0 }; } catch (_) { /* nic */ } });
    const cfg = Object.assign({}, Screens.castleCfg(save));
    if (!(save.castleCfg || {}).emblem) cfg.emblem = G.defaultEmblem[fac] || cfg.emblem;
    return {
      name: save.name, tro: save.trophies || 0, fac, units, abil: G.skillsOf(save).eq.slice(),
      stats: G.calc.battleStats(save), castle: { skin: save.skins.castle, level: G.calc.castleLevel(save), cfg },
      bonus, def: G.defenseOf(save)
    };
  }

  /* ---------- ONLINE: místnost a lobby ---------- */
  const Online = {
    pid: rid(10),
    room: null,          // { code, host, mode, level, players:[{pid,name,tro,fac,team}], ... }
    listeners: {},
    on(ev, fn) { this.listeners[ev] = fn; },
    _fire(ev, d) { const f = this.listeners[ev]; if (f) try { f(d); } catch (e) { console.error(e); } },

    canOnline() { return typeof WebSocket !== 'undefined'; },

    /* založení místnosti */
    create(mode) {
      this.leave();
      const save = App.save;
      const code = rid(4);
      const fac = this._defFac();
      const me = { pid: this.pid, name: save.name, tro: save.trophies || 0, fac, team: 'A', host: true };
      const room = this.room = { code, host: true, mode, level: null, players: [me], preps: { [this.pid]: prepOf(save, fac) }, seen: {}, ch: new Kanal('cw-' + code) };
      if (mode === 'coop') room.level = this._defLevel();
      this._wire();
      room.ch.on('_open', () => this._bcastLobby());
      this._lobbyTimer = setInterval(() => { if (this.room && this.room.host && !this.room.inBattle) this._bcastLobby(); this._dropSilent(); }, 2000);
      this._fire('lobby');
      return code;
    },

    /* připojení kódem */
    join(code) {
      this.leave();
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 4) return false;
      const save = App.save, fac = this._defFac();
      const room = this.room = { code, host: false, mode: null, level: null, players: [], ch: new Kanal('cw-' + code), joining: true, fac };
      this._wire();
      const hi = () => { if (this.room === room) room.ch.send('hi', { pid: this.pid, name: save.name, tro: save.trophies || 0, fac: room.fac, prep: prepOf(save, room.fac) }); };
      room.ch.on('_open', hi);
      this._hiTimer = setInterval(() => { if (this.room !== room) return clearInterval(this._hiTimer); if (room.joining) hi(); else room.ch.send('png', { p: this.pid }); this._hostSilent(); }, 2000);
      clearTimeout(this._joinTo);
      this._joinTo = setTimeout(() => { if (this.room === room && room.joining) { this.leave(); this._fire('error', 'onl_not_found'); } }, 9000);
      this._fire('lobby');
      return true;
    },

    leave() {
      const r = this.room;
      clearInterval(this._lobbyTimer); clearInterval(this._hiTimer); clearTimeout(this._joinTo);
      if (!r) return;
      try { r.ch.send('bye', { pid: this.pid }); } catch (_) { /* nic */ }
      const ch = r.ch;
      setTimeout(() => ch.close(), 150);
      this.room = null;
      this._fire('lobby');
    },

    /* nastavení v lobby */
    setFac(f) {
      const r = this.room; if (!r) return;
      const save = App.save;
      if (!GameData.campaignHelpers.factionUnlocked(save, f)) return;
      if (r.host) { const me = r.players[0]; me.fac = f; r.preps[this.pid] = prepOf(save, f); this._bcastLobby(); this._fire('lobby'); }
      else { r.fac = f; r.ch.send('set', { pid: this.pid, fac: f, prep: prepOf(save, f) }); }
    },
    switchTeam() {
      const r = this.room; if (!r) return;
      if (r.host) this._switch(this.pid); else r.ch.send('set', { pid: this.pid, sw: 1 });
    },
    setMode(m) {
      const r = this.room; if (!r || !r.host || r.players.length > CAP[m]) return false;
      r.mode = m;
      if (m === 'coop') { r.level = r.level || this._defLevel(); r.players.forEach(p => (p.team = 'A')); }
      else this._rebalance();
      this._bcastLobby(); this._fire('lobby');
      return true;
    },
    setLevel(id) { const r = this.room; if (!r || !r.host) return; r.level = id; this._bcastLobby(); this._fire('lobby'); },
    full() { const r = this.room; return !!r && r.players.length === CAP[r.mode]; },
    ready() {
      const r = this.room; if (!r || !r.mode) return false;
      if (r.players.length !== CAP[r.mode]) return false;
      if (r.mode === 'coop') return !!r.level;
      const a = r.players.filter(p => p.team === 'A').length;
      return a === PER_TEAM[r.mode] && r.players.length - a === PER_TEAM[r.mode];
    },

    _defFac() {
      const s = App.save;
      return GameData.campaignHelpers.factionUnlocked(s, s.faction) ? s.faction : 'kralovstvi';
    },
    /* úrovně, které může hostitel hrát ve dvou (odemčené, bez spojenectví) */
    coopLevels() {
      const H = GameData.campaignHelpers, s = App.save;
      return H.allLevels().filter(l => !l.alliance && H.isUnlocked(s, l.id));
    },
    _defLevel() {
      const L = this.coopLevels(), H = GameData.campaignHelpers, cur = H.currentLevel(App.save);
      return (cur && L.find(l => l.id === cur.id) ? cur.id : (L.length ? L[L.length - 1].id : null));
    },

    _rebalance() {
      const r = this.room, per = PER_TEAM[r.mode];
      let a = 0, b = 0;
      r.players.forEach((p, i) => {
        if (i === 0) { p.team = 'A'; a++; return; }
        if (p.team === 'A' && a < per) { a++; return; }
        if (p.team === 'B' && b < per) { b++; return; }
        if (b < per) { p.team = 'B'; b++; } else { p.team = 'A'; a++; }
      });
    },
    _switch(pid) {
      const r = this.room; if (!r || r.mode === 'coop') return;
      const p = r.players.find(x => x.pid === pid); if (!p) return;
      const other = p.team === 'A' ? 'B' : 'A';
      if (r.players.filter(x => x.team === other).length >= PER_TEAM[r.mode]) return;
      p.team = other;
      this._bcastLobby(); this._fire('lobby');
    },
    _bcastLobby() {
      const r = this.room; if (!r || !r.host) return;
      r.ch.send('lob', { code: r.code, mode: r.mode, level: r.level, players: r.players.map(p => ({ pid: p.pid, name: p.name, tro: p.tro, fac: p.fac, team: p.team, host: !!p.host })) });
    },
    _dropSilent() {
      const r = this.room; if (!r || !r.host || r.inBattle) return;
      const now = Date.now();
      const before = r.players.length;
      r.players = r.players.filter(p => p.host || now - (r.seen[p.pid] || now) < 9000);
      if (r.players.length !== before) { this._bcastLobby(); this._fire('lobby'); }
    },
    _hostSilent() {
      const r = this.room; if (!r || r.host || r.joining || r.inBattle) return;
      if (Date.now() - (r.hostSeen || Date.now()) > 12000) { this.leave(); this._fire('error', 'onl_host_left'); }
    },

    _wire() {
      const r = this.room, ch = r.ch;
      ch.on('_fail', () => { if (this.room === r) { this.leave(); this._fire('error', 'onl_no_conn'); } });
      if (r.host) {
        ch.on('hi', d => {
          if (!d || !d.pid) return;
          r.seen[d.pid] = Date.now();
          let p = r.players.find(x => x.pid === d.pid);
          if (!p) {
            if (r.inBattle || r.players.length >= CAP[r.mode]) { ch.send('full', { pid: d.pid }); return; }
            p = { pid: d.pid, name: String(d.name || '?').slice(0, 20), tro: d.tro | 0, fac: d.fac, team: 'A' };
            r.players.push(p);
            if (r.mode !== 'coop') { p.team = r.players.filter(x => x.team === 'A').length > r.players.filter(x => x.team === 'B').length ? 'B' : 'A'; this._rebalance(); }
            if (window.Zvuk) Zvuk.play('horn', 0.6);
          }
          if (d.prep) r.preps[d.pid] = d.prep;
          if (d.fac) p.fac = d.fac;
          this._bcastLobby(); this._fire('lobby');
        });
        ch.on('set', d => {
          const p = d && r.players.find(x => x.pid === d.pid); if (!p) return;
          r.seen[d.pid] = Date.now();
          if (d.fac) { p.fac = d.fac; if (d.prep) r.preps[d.pid] = d.prep; this._bcastLobby(); this._fire('lobby'); }
          if (d.sw) this._switch(d.pid);
        });
        ch.on('png', d => { if (d && d.p) { r.seen[d.p] = Date.now(); if (r.net) r.net.seen[d.p] = Date.now(); } });
        ch.on('bye', d => {
          if (!d) return;
          if (r.net) { r.net.gone[d.pid] = true; return; }
          r.players = r.players.filter(x => x.pid !== d.pid);
          this._bcastLobby(); this._fire('lobby');
        });
        ch.on('cmd', d => { if (r.net) r.net.onCmd(d); });
      } else {
        ch.on('lob', d => {
          if (!d) return;
          r.hostSeen = Date.now();
          if (!d.players.some(p => p.pid === this.pid)) { if (!r.joining) { this.leave(); this._fire('error', 'onl_kicked'); } return; }
          r.joining = false; clearTimeout(this._joinTo);
          r.mode = d.mode; r.level = d.level; r.players = d.players;
          this._fire('lobby');
        });
        ch.on('full', d => { if (d && d.pid === this.pid && r.joining) { this.leave(); this._fire('error', 'onl_full'); } });
        ch.on('bye', d => {
          const hp = r.players.find(p => p.host);
          if (d && hp && d.pid === hp.pid && !r.net) { this.leave(); this._fire('error', 'onl_host_left'); }
        });
        ch.on('go', d => { r.hostSeen = Date.now(); if (d && d.teams && (d.teams.A.includes(this.pid) || d.teams.B.includes(this.pid))) this._begin(d); });
        ch.on('st', d => { r.hostSeen = Date.now(); if (r.net) r.net.onState(d); });
        ch.on('end', d => { r.hostSeen = Date.now(); if (r.net) r.net.onEndMsg(d); });
      }
    },

    /* ---------- start bitvy ---------- */
    start() {
      const r = this.room;
      if (!r || !r.host || !this.ready()) return false;
      // tým hostitele je vždy „A“ (u hostitele je to strana „player“)
      const meT = r.players[0].team;
      const A = r.players.filter(p => p.team === meT).map(p => p.pid);
      const B = r.players.filter(p => p.team !== meT).map(p => p.pid);
      A.sort((x, y) => (x === this.pid ? -1 : y === this.pid ? 1 : 0));
      const preps = {};
      A.concat(B).forEach(pid => { preps[pid] = r.preps[pid] || prepOf(App.save, 'kralovstvi'); });
      const G = GameData, cfg = G.battleConfig;
      const side = (team) => {
        const lead = preps[team[0]], st = lead.stats;
        const big = lead.castle.cfg && lead.castle.cfg.big ? 1.25 : 1;
        const mult = team.reduce((a, pid) => a + preps[pid].stats.unitMult, 0) / team.length;
        return { hp: R(st.castleHp * big * (team.length > 1 ? 1.5 : 1)), tower: st.towerDmg || 0, oil: 0, income: st.income, mult, coins: st.startCoins || cfg.startCoins, extra: team.length > 1 };
      };
      const go = { mode: r.mode, code: r.code, host: this.pid, seed: 1 + Math.floor(Math.random() * 9999), teams: { A, B }, preps, sides: { A: side(A) } };
      if (r.mode === 'coop') {
        const lv = G.campaignHelpers.find(r.level);
        const es = G.calc.enemyStats(lv.diff);
        const hostSt = preps[A[0]].stats, def = preps[A[0]].def;
        go.sides.A.hp = R(hostSt.castleHp * (preps[A[0]].castle.cfg.big ? 1.25 : 1) * 1.2);
        go.sides.A.tower = def && def.slots && def.slots.length ? 0 : hostSt.towerDmg;
        go.sides.A.oil = hostSt.oilDmg || 0;
        go.sides.B = { hp: R(es.castleHp * (lv.megaCastle ? 1.5 : 1) * 1.5), tower: es.towerDmg, oil: 0, income: es.income * 1.55, mult: 1.1, coins: cfg.startCoins, extra: false };
        go.level = lv.id;
        go.theme = lv.theme || G.factions[lv.enemy].theme;
      } else {
        go.sides.B = side(B);
        go.theme = G.factions[preps[B[0]].fac].theme;
      }
      r.ch.send('go', go);
      setTimeout(() => r.ch.send('go', go), 400);   // pro jistotu podruhé
      this._begin(go);
      return true;
    },

    _begin(go) {
      const r = this.room;
      if (!r || r.inBattle) return;
      r.inBattle = true;
      const me = this.pid;
      const myTeam = go.teams.A.includes(me) ? 'A' : 'B';
      const other = myTeam === 'A' ? 'B' : 'A';
      const mirror = myTeam === 'B';
      const P = go.preps, lead = P[go.teams[myTeam][0]], foe = P[go.teams[other][0]], mine = P[me];
      const G = GameData, cfg = G.battleConfig;
      const net = new NetBattle(this, go, myTeam, mirror);
      r.net = net;
      const names = t => go.teams[t].map(pid => P[pid].name).join(' + ');
      const bc = {
        mode: 'online', online: go.mode, net, code: go.code, title: go.mode === 'coop' ? null : `${names('A')} × ${names('B')}`,
        playFaction: mine.fac, theme: go.theme, seed: go.seed, enemyName: names(other),
        battleOpts: {
          net, mode: 'online', difficulty: 1, speed: 1, theme: go.theme, seed: go.seed,
          playerFaction: lead.fac, playerUnits: mine.units,
          netSides: { player: go.sides[myTeam], enemy: go.sides[other] },
          player: { stats: lead.stats, castleSkin: lead.castle.skin, castleLevel: lead.castle.level, castleCfg: lead.castle.cfg, defense: null },
          enemyFaction: foe ? foe.fac : 'kralovstvi', enemyCastleSkin: foe ? foe.castle.skin : 'kralovsky', enemyCastleLevel: foe ? foe.castle.level : 3, enemyCastleCfg: foe ? foe.castle.cfg : null,
          enemyStats: { castleHp: 1, income: 0, hpMult: go.sides[other].mult, dmgMult: go.sides[other].mult, towerDmg: 0, maxCoins: Infinity },
          enemyUnits: [], boss: null, hostages: 0, world: null, enemyCastleStyle: null, enemyCastleHpMult: 1, allyFactions: null
        },
        abil: mine.abil
      };
      if (go.mode === 'coop') {
        const lv = G.campaignHelpers.find(go.level);
        const EF = G.factions[lv.enemy];
        let eu = lv.roles.map(x => G.unitForRole(lv.enemy, x));
        if (lv.mix) eu = eu.concat(lv.mix.roles.map(x => G.unitForRole(lv.mix.faction, x)));
        const host = P[go.teams.A[0]];
        Object.assign(bc.battleOpts, {
          difficulty: lv.diff, enemyUnits: eu, enemyFaction: lv.enemy, enemyCastleSkin: lv.castleSkin, enemyUnitSkin: lv.unitSkin, enemyCastleLevel: Math.round(lv.diff * 4), enemyCastleCfg: null,
          enemyStats: null, boss: net.role === 'host' && typeof lv.boss === 'string' ? lv.boss : null, hostages: lv.hostages || 0,
          ...(lv.megaCastle ? { enemyCastleStyle: 'peklo3', world: { worldW: cfg.worldW + 640 } } : {})
        });
        bc.battleOpts.player.defense = host.def || null;
        bc.enemyName = lv.name; bc.title = `${lv.label} ${lv.name}`; bc.level = lv; bc.coop = true;
        net.ai = net.role === 'host';
      }
      this._fire('start', bc);
    },

    /* po bitvě se všichni vrátí do lobby té samé místnosti */
    afterBattle() {
      const r = this.room; if (!r) return;
      r.inBattle = false; r.net = null; r.hostSeen = Date.now();
      if (r.host) { const now = Date.now(); r.players.forEach(p => (r.seen[p.pid] = now)); this._bcastLobby(); }
    }
  };

  /* ---------- synchronizace jedné bitvy ---------- */
  class NetBattle {
    constructor(O, go, myTeam, mirror) {
      this.O = O; this.go = go; this.ch = O.room.ch;
      this.me = O.pid; this.role = go.host === O.pid ? 'host' : 'client';
      this.myTeam = myTeam; this.mirror = mirror;
      this.ai = false; this.events = []; this.acc = 0; this.seq = 0; this.pending = []; this.acks = {};
      this.seen = {}; this.gone = {}; this.last = Date.now(); this.b = null; this.ended = false;
      this.pingT = 0;
    }
    attach(b) {
      this.b = b; this.W = b.W;
      if (this.role === 'host') {
        // hostitel v pozadí (jiná karta / aplikace): prohlížeč zastaví kreslení,
        // bitva ale musí běžet dál pro ostatní – dopočítá se po kouscích
        let lastReal = performance.now();
        this._bg = setInterval(() => {
          const now = performance.now(), el = Math.min(1, (now - lastReal) / 1000);
          lastReal = now;
          if (!this.b || this.b.over || !document.hidden) return;
          for (let k = 0; k < el / 0.05; k++) this.b.update(0.05);
        }, 250);
        // vzdálení hráči: tým, peněženka a bonusy výbavy
        this.roles = {};
        const now = Date.now();
        ['A', 'B'].forEach(T => this.go.teams[T].forEach((pid, i) => {
          if (pid === this.me) return;
          const team = T === 'A' ? 'player' : 'enemy', s = b.side[team];
          this.roles[pid] = { team, w: i === 0 ? s : s.extra, owner: { pid, bonus: (this.go.preps[pid] || {}).bonus || {} } };
          this.seen[pid] = now;
        }));
      }
    }
    mx(x) { return this.mirror ? this.W - x : x; }
    /* tým z pohledu hostitele ('p' = tým A) → můj místní tým */
    lt(ht) { const T = ht === 'p' ? 'A' : 'B'; return T === this.myTeam ? 'player' : 'enemy'; }

    /* ---- klient: rozkazy ---- */
    cmd(c) { c.p = this.me; c.n = ++this.seq; this.ch.send('cmd', c); }
    pend(cost) { this.pending.push({ n: this.seq + 1, c: cost, at: Date.now() }); }

    tick(dt) {
      const b = this.b; if (!b) return;
      if (this.role === 'host') {
        this.acc += dt;
        if (this.acc >= SNAP) { this.acc = 0; this._flush(); }
        // soupeř, který zmizel, prohrává (jen v souboji)
        this._chk = (this._chk || 0) - dt;
        if (this._chk <= 0 && this.go.mode !== 'coop' && !b.over) {
          this._chk = 1;
          const now = Date.now();
          const lostB = this.go.teams.B.every(pid => this.gone[pid] || now - (this.seen[pid] || now) > 20000);
          if (lostB) { b.side.enemy.castle.hp = 0; this.forfeit = true; }
        }
      } else {
        this.pingT -= dt;
        if (this.pingT <= 0) { this.pingT = 2; this.ch.send('png', { p: this.me }); }
        const quiet = Date.now() - this.last;
        if (this.O._fire) this.O._fire('wait', quiet > 4000);
        if (quiet > 30000 && !b.over && !this.ended) { this.ended = true; b.over = false; this._finish(false, 'spojeni'); }
      }
    }

    /* ---- hostitel ---- */
    onSpawn(u) {
      this.events.push(['s', u.id, u.def.id, u.team === 'player' ? 'p' : 'e', R(u.x), R(u.y), u.owner || '', R(u.hp), R(u.maxHp)]);
    }
    onAbility(team, id, owner) {
      this.events.push(['a', id, team === 'player' ? 'p' : 'e', owner ? owner.pid : (team === 'player' ? this.me : '')]);
    }
    onCmd(d) {
      const b = this.b; if (!b || b.over || !d || !this.roles) return;
      const r = this.roles[d.p]; if (!r) return;
      this.seen[d.p] = Date.now();
      if (d.n > (this.acks[d.p] || 0)) this.acks[d.p] = d.n;
      const run = fn => {
        const s = b.side[r.team], w = r.w;
        const keep = { coins: s.coins, cooldowns: s.cooldowns, abilityCd: s.abilityCd };
        if (w !== s) { s.coins = w.coins; s.cooldowns = w.cooldowns; s.abilityCd = w.abilityCd; }
        b._owner = r.owner;
        try { return fn(); } finally {
          b._owner = null;
          if (w !== s) { w.coins = s.coins; s.coins = keep.coins; s.cooldowns = keep.cooldowns; s.abilityCd = keep.abilityCd; }
        }
      };
      if (d.k === 'sp' && GameData.units[d.u]) run(() => b.spawn(r.team, d.u));
      else if (d.k === 'ab' && GameData.abilities[d.a]) run(() => b.useAbility(r.team, d.a));
      else if (d.k === 'fm' && /^(utok|formace|ustup)$/.test(d.m)) { b._forceFm = true; b.setFormation(r.team, d.m, d.x == null ? null : +d.x); b._forceFm = false; }
      else if (d.k === 'q') this.gone[d.p] = true;
    }
    _flush() {
      const b = this.b, u = [];
      for (const x of b.units) u.push(x.id, R(x.x), R(x.y), Math.ceil(x.hp), x.dead ? 1 : 0);
      const w = {};
      const now = b.time;
      const rem = o => { const r = {}; for (const k in o) { const v = o[k] - now; if (v > 0.05) r[k] = Math.round(v * 10) / 10; } return r; };
      for (const pid in this.roles) { const ww = this.roles[pid].w; if (ww) w[pid] = [Math.floor(ww.coins), rem(ww.cooldowns), rem(ww.abilityCd)]; }
      const P = b.side.player, E = b.side.enemy;
      const st = {
        e: this.events, u, w, k: this.acks,
        c: [Math.ceil(P.castle.hp), Math.ceil(E.castle.hp)],
        f: [P.formation, R(P.flagX), E.formation, R(E.flagX)],
        cp: [Math.round(b.cp.v * 100) / 100, b.cp.owner === 'player' ? 'p' : b.cp.owner === 'enemy' ? 'e' : '']
      };
      this.events = [];
      this.ch.send('st', st);
    }
    onEnd(win, reason) {
      this._flush();
      const msg = { w: win ? 'p' : 'e', r: this.forfeit ? 'odpojeni' : reason };
      this.ch.send('end', msg);
      setTimeout(() => this.ch.send('end', msg), 500);
      setTimeout(() => this.ch.send('end', msg), 1500);
      if (this.forfeit && this.b) this.b._forfeit = true;
    }

    /* ---- klient: stav od hostitele ---- */
    onState(d) {
      const b = this.b; if (!b || b.over || !d) return;
      this.last = Date.now();
      // nejdřív události (noví vojáci, speciální útoky)
      for (const e of d.e || []) {
        if (e[0] === 's') {
          if (b.units.some(x => x.id === e[1]) || !GameData.units[e[2]]) continue;
          b._force = { id: e[1], x: this.mx(e[4]), y: e[5], o: e[6], mine: e[6] === this.me, hp: e[7], mh: e[8] };
          try { b.spawn(this.lt(e[3]), e[2], true); } finally { b._force = null; }
        } else if (e[0] === 'a') {
          b._forceAb = { mine: e[3] === this.me };
          try { b.useAbility(this.lt(e[2]), e[1]); } finally { b._forceAb = null; }
        }
      }
      // potvrzené rozkazy
      const ack = (d.k || {})[this.me] || 0;
      this.pending = this.pending.filter(p => p.n > ack && Date.now() - p.at < 4000);
      // vojáci
      const map = new Map(); for (const x of b.units) map.set(x.id, x);
      const seen = new Set(), U = d.u || [];
      for (let i = 0; i < U.length; i += 5) {
        const id = U[i], x = map.get(id); seen.add(id);
        if (!x) continue;
        const hx = this.mx(U[i + 1]), hy = U[i + 2], dx = hx - x.x;
        if (Math.abs(dx) > 90) x.x = hx; else x.x += dx * 0.4;
        x.y += (hy - x.y) * 0.4;
        if (!x.dead) x.hp = Math.min(x.maxHp, U[i + 3]);
        if (U[i + 4] && !x.dead) this._kill(x);
      }
      for (const x of b.units) if (!x.dead && !seen.has(x.id) && b.time - (x.born || 0) > 2) { x.dead = 0.001; x.atk = -1; }
      // hrady
      const cP = d.c[this.myTeam === 'A' ? 0 : 1], cE = d.c[this.myTeam === 'A' ? 1 : 0];
      b.side.player.castle.hp = Math.max(1, cP); b.side.enemy.castle.hp = Math.max(1, cE);
      // formace stran
      const fA = [d.f[0], d.f[1]], fB = [d.f[2], d.f[3]];
      const myF = this.myTeam === 'A' ? fA : fB, foF = this.myTeam === 'A' ? fB : fA;
      const P = b.side.player, E = b.side.enemy;
      if (P.formation !== myF[0]) { P.formation = myF[0]; if (b.o.onFormation) b.o.onFormation(myF[0]); }
      P.flagX = this.mx(myF[1]); E.formation = foF[0]; E.flagX = this.mx(foF[1]);
      // střed bojiště
      const v = this.myTeam === 'A' ? d.cp[0] : -d.cp[0];
      b.cp.v = v;
      if (d.cp[1]) { const own = this.lt(d.cp[1]); if (b.cp.owner !== own) b.cp.owner = own; }
      // moje peněženka
      const w = (d.w || {})[this.me];
      if (w) {
        const pend = this.pending.reduce((a, p) => a + p.c, 0);
        P.coins = Math.max(0, w[0] - pend);
        for (const k in w[1]) P.cooldowns[k] = Math.max(P.cooldowns[k] || 0, b.time + w[1][k]);
        for (const k in w[2]) P.abilityCd[k] = Math.max(P.abilityCd[k] || 0, b.time + w[2][k]);
      }
    }
    _kill(x) {
      const b = this.b;
      x.dead = 0.001; x.atk = -1; x.hp = 0;
      if (window.Zvuk) Zvuk.at('death', x.x, b, 0.6);
      if (x === b.hero) b.releaseHero(true);
      if (x.team === 'enemy') {
        const from = x.lastHit;
        if (from && from.owner === this.me) {
          b.kills++;
          if (from.def) b.st.kills[from.def.id] = (b.st.kills[from.def.id] || 0) + 1;
          b.texts.push({ x: x.x, y: x.y - 100 * 1.45, txt: '+' + Math.round(x.def.cost * GameData.battleConfig.killRewardRatio), color: '#ffd54f', t: 0, life: 1.1, coin: true });
        }
      }
      if (x.def.boss) {
        b.texts.push({ x: x.x, y: 330, txt: t('boss_fell', { name: x.def.name }), color: '#ffd77a', t: 0, life: 3, big: true });
        for (let i = 0; i < 6; i++) b._explode(x.x - 100 + Math.random() * 200, GameData.battleConfig.groundY - Math.random() * 200);
      }
    }
    onEndMsg(d) {
      const b = this.b; if (!b || this.ended || !d) return;
      this.ended = true;
      const win = (d.w === 'p') === (this.myTeam === 'A');
      this._finish(win, d.r);
    }
    _finish(win, reason) {
      const b = this.b;
      if (reason !== 'spojeni') { (win ? b.side.enemy : b.side.player).castle.hp = 0; }
      if (reason === 'odpojeni') b._forfeit = true;
      b.over = false;
      b._end(win, reason);
    }
    /* volá se při zavření bitvy – kanál zůstává (lobby) */
    close() {
      clearInterval(this._bg);
      if (this.role === 'client' && this.b && !this.ended) { this.cmd({ k: 'q' }); }
      this.b = null;
    }
  }

  window.Online = Online;
  window.NetBattle = NetBattle;
})();
