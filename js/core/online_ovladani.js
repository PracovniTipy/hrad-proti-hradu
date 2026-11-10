/* =========================================================================
   ONLINE OVLÁDÁNÍ – oddíl a ovládání jednoho vojáka i v online bitvě
   Hostitel bitvu počítá, ostatní hráči mu posílají rozkazy:
     hc  = převezmi vojáka (id)        hr = pusť vojáka
     hi  = pohyb/útok/blok ovládaného vojáka
     sq  = oddíl (id vojáků, rozkaz, prapor)   sqd = rozpusť oddíl
   Klient si vše předpovídá i u sebe, hostitel posílá opravy polohy.
   ========================================================================= */
(function () {
  function hook() {
    if (!window.Battle || !window.NetBattle) return false;
    const B = Battle.prototype, N = NetBattle.prototype;
    if (B._onlCtl) return true;
    B._onlCtl = true;
    const client = b => b.net && b.net.role === 'client';

    /* ---------- KLIENT: rozkazy hostiteli ---------- */
    const oTake = B.takeControl;
    B.takeControl = function (u) {
      oTake.call(this, u);
      if (client(this) && this.hero === u) { this.net.cmd({ k: 'hc', id: u.id }); this._ctlSent = ''; }
    };
    const oRel = B.releaseHero;
    B.releaseHero = function (died) {
      const had = this.hero;
      oRel.call(this, died);
      if (had && client(this) && !died) this.net.cmd({ k: 'hr' });
    };
    const sendSquad = b => {
      if (!client(b)) return;
      if (!b.squad) { b.net.cmd({ k: 'sqd' }); return; }
      const ids = b.units.filter(u => u.squad && !u.dead).map(u => u.id);
      b.net.cmd({ k: 'sq', ids, m: b.squad.mode, x: b.net.mx(b.squad.flagX) });
    };
    const oSet = B.setSquad;
    B.setSquad = function (mode, flagX) { oSet.call(this, mode, flagX); sendSquad(this); };
    const oDis = B.disbandSquad;
    B.disbandSquad = function () { const had = !!this.squad; oDis.call(this); if (had) sendSquad(this); };

    // pohyb ovládaného vojáka posílá klient ~12× za sekundu (jen při změně)
    const oTick = N.tick;
    N.tick = function (dt) {
      oTick.call(this, dt);
      const b = this.b;
      if (!b || this.role !== 'client' || !b.hero || b.over) return;
      this._ctT = (this._ctT || 0) - dt;
      if (this._ctT > 0) return;
      this._ctT = 0.08;
      const c = b.ctrl || {}, mx = (c.mx || 0) * (this.mirror ? -1 : 1);
      const key = [mx, c.my || 0, c.attack ? 1 : 0, c.block ? 1 : 0].join(',');
      if (key === b._ctlSent && (this._ctKeep = (this._ctKeep || 0) + 1) % 12) return;   // občas zopakovat
      b._ctlSent = key;
      this.cmd({ k: 'hi', mx, my: c.my || 0, a: c.attack ? 1 : 0, bl: c.block ? 1 : 0, id: b.hero.id });
    };

    /* ---------- HOSTITEL: provedení rozkazů ---------- */
    N.onCtl = function (d, r) {
      const b = this.b; if (!b) return;
      const mine = u => u && !u.dead && u.team === r.team && (!u.owner || u.owner === d.p);
      b.rctrl = b.rctrl || {}; b.rsq = b.rsq || {};
      if (d.k === 'hc') {
        const u = b.units.find(x => x.id === d.id);
        if (!mine(u) || u === b.hero) return;
        for (const x of b.units) if (x.rctl === d.p) { x.rctl = null; x.controlled = false; }
        u.rctl = d.p; u.controlled = true; u.squad = false; u.rsq = null; u.slotX = null; u.face = u.face || u.dir;
        b.rctrl[d.p] = { mx: 0, my: 0, attack: false, block: false };
      } else if (d.k === 'hr') {
        for (const x of b.units) if (x.rctl === d.p) { x.rctl = null; x.controlled = false; x.blocking = false; }
        delete b.rctrl[d.p];
      } else if (d.k === 'hi') {
        const c = b.rctrl[d.p]; if (!c) return;
        c.mx = Math.max(-1, Math.min(1, +d.mx || 0)); c.my = Math.max(-1, Math.min(1, +d.my || 0));
        c.attack = !!d.a; c.block = !!d.bl;
      } else if (d.k === 'sq') {
        if (!/^(utok|formace|ustup)$/.test(d.m) || !Array.isArray(d.ids)) return;
        const set = new Set(d.ids.slice(0, 400));
        for (const x of b.units) if (x.rsq === d.p) x.rsq = null;
        let n = 0;
        for (const x of b.units) if (set.has(x.id) && mine(x) && !x.controlled) { x.rsq = d.p; x.slotX = null; n++; }
        if (!n) { delete b.rsq[d.p]; return; }
        const cfg = GameData.battleConfig, fx = d.x == null ? b.side[r.team].flagX : +d.x;
        b.rsq[d.p] = { team: r.team, mode: d.m, flagX: Math.max(cfg.playerFront + 90, Math.min(cfg.enemyFront - 90, fx)) };
        b._assignSlots(r.team);
      } else if (d.k === 'sqd') {
        for (const x of b.units) if (x.rsq === d.p) x.rsq = null;
        delete b.rsq[d.p];
        b._assignSlots(r.team);
      }
    };

    // oddíly vzdálených hráčů: vlastní rozkaz i místo v šiku
    const oMode = B.modeOf;
    B.modeOf = function (u) {
      if (u.rsq && this.rsq && this.rsq[u.rsq]) return this.rsq[u.rsq].mode;
      return oMode.call(this, u);
    };
    const oAssign = B._assignSlots;
    B._assignSlots = function (team) {
      const R = this.rsq;
      if (!R || !Object.keys(R).some(k => R[k].team === team)) return oAssign.call(this, team);
      const hid = this.units.filter(u => u.team === team && !u.dead && !u.controlled && u.rsq && R[u.rsq]);
      hid.forEach(u => (u.controlled = true));
      try { oAssign.call(this, team); } finally { hid.forEach(u => (u.controlled = false)); }
      for (const pid in R) {
        const q = R[pid]; if (q.team !== team) continue;
        const list = hid.filter(u => u.rsq === pid);
        if (!list.length) { delete R[pid]; continue; }
        this._assignList(team, list, q.mode, q.flagX);
      }
    };
    // oddíl vzdáleného hráče se musí přeskupovat i při útoku zbytku armády
    const oUpd = B.update;
    B.update = function (dt) {
      oUpd.call(this, dt);
      if (this.rsq && this.net && this.net.role === 'host') {
        this._rsqT = (this._rsqT || 0) - dt;
        if (this._rsqT <= 0) { this._rsqT = 0.5; ['player', 'enemy'].forEach(tm => { if (Object.keys(this.rsq).some(k => this.rsq[k].team === tm)) this._assignSlots(tm); }); }
      }
    };
    return true;
  }
  if (!hook()) window.addEventListener('load', hook);
})();
