/* =========================================================================
   PROFIL HRÁČE A UKLÁDÁNÍ
   Prototyp ukládá postup do localStorage tohoto prohlížeče.
   V online verzi se tento objekt bude načítat ze serveru (viz README).
   ========================================================================= */
/* Nastavení vydání: v ostré verzi nejde nic získat zdarma.
   Vývojářský režim (tester, zkušební nákupy) jen s ?dev=1 v adrese. */
window.HraConfig = (function () {
  let dev = false;
  try { if (/[?&]dev=1/.test(location.search)) sessionStorage.setItem('hrad-dev', '1'); dev = sessionStorage.getItem('hrad-dev') === '1'; } catch (e) { /* nic */ }
  return { dev, release: !dev };
})();
(function () {
  const KEY = 'hrad-proti-hradu-save-v1';

  function defaults() {
    const equipped = {};
    Object.keys(GameData.units).forEach(u => (equipped[u] = 'zakladni'));
    const buildings = {};
    GameData.buildings.forEach(b => (buildings[b.id] = 0));
    return {
      version: 1,
      name: 'Velitel',
      avatar: 'rytir',
      faction: 'kralovstvi',
      seenPrologue: {},
      seenScenes: {},
      castleCfg: { banner: null, roof: 'auto', emblem: null, decor: {} },
      ownedDecor: [],
      lastDaily: '',
      lang: null,
      tut: {},
      gold: 1500,
      gems: 150,
      trophies: 0,
      stats: { wins: 0, losses: 0, pvpWins: 0, pvpLosses: 0, unitsSent: 0, kills: 0 },
      buildings,
      campaign: { cleared: {} },
      pvp: { season: 1, opponents: [], attacks: {} },
      skins: {
        ownedUnit: ['zakladni'],
        ownedCastle: ['kralovsky'],
        unit: equipped,
        castle: 'kralovsky'
      },
      settings: { speed: 1, auto: {} },
      gear: { owned: [], eq: {} },
      purchases: {},
      chests: {},
      defense: { slots: [], slotEl: [], ownedKinds: [], ownedEl: ['ohen'], catLvl: 1 }
    };
  }

  /* Doplní chybějící klíče (kvůli budoucím verzím uložené hry) */
  function merge(def, saved) {
    if (typeof def !== 'object' || def === null || Array.isArray(def)) return saved === undefined ? def : saved;
    const out = {};
    for (const k of Object.keys(def)) out[k] = merge(def[k], saved ? saved[k] : undefined);
    if (saved && typeof saved === 'object') for (const k of Object.keys(saved)) if (!(k in out)) out[k] = saved[k];
    return out;
  }

  window.Save = {
    data: null,
    /* Postup se při aktualizaci hry NIKDY nemaže: nové verze jen doplní chybějící
       klíče (merge). Navíc se drží záloha posledního dobrého uložení. */
    load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
      if (!parsed) {
        // poškozené nebo chybějící uložení → obnovit ze zálohy
        try { const b = localStorage.getItem(KEY + '-zaloha'); parsed = b ? JSON.parse(b) : null; } catch (e) { parsed = null; }
        if (raw && !parsed) try { localStorage.setItem(KEY + '-poskozene-' + Date.now(), raw); } catch (e) { /* nic */ }
      }
      try { this.data = parsed ? merge(defaults(), parsed) : defaults(); }
      catch (e) { this.data = defaults(); }
      if (parsed) try { localStorage.setItem(KEY + '-zaloha', JSON.stringify(parsed)); } catch (e) { /* nic */ }
      return this.data;
    },
    save() {
      // testovací režim: neomezené zlato a drahokamy
      if (this.data && this.data.tester && HraConfig.dev) { this.data.gold = Math.max(this.data.gold, 9999999); this.data.gems = Math.max(this.data.gems, 9999999); }
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* prohlížeč ukládání nepovolil */ }
      if (window.Ucet) Ucet.queue();
      clearTimeout(this._bt);
      this._bt = setTimeout(() => { try { localStorage.setItem(KEY + '-zaloha', JSON.stringify(this.data)); } catch (e) { /* nic */ } }, 3000);
    },
    /* Nahradí postup jiným (z účtu nebo ze zálohy). Původní postup se nikdy
       nezahodí – uloží se jako samostatná záloha v prohlížeči. */
    replace(obj, tag) {
      try { localStorage.setItem(KEY + '-pred-' + (tag || 'nahradou') + '-' + Date.now(), JSON.stringify(this.data)); } catch (e) { /* nic */ }
      this.data = merge(defaults(), obj);
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); localStorage.setItem(KEY + '-zaloha', JSON.stringify(this.data)); } catch (e) { /* nic */ }
      return this.data;
    },
    /* Kolik toho hráč má odehráno – podle toho se porovnávají dva postupy */
    score(d) {
      if (!d) return 0;
      const cl = Object.keys((d.campaign && d.campaign.cleared) || {}).length;
      const bl = Object.values(d.buildings || {}).reduce((a, b) => a + (b || 0), 0);
      const st = d.stats || {};
      return cl * 1000 + bl * 300 + (d.trophies || 0) + ((st.wins || 0) + (st.pvpWins || 0)) * 50 + ((d.gear && d.gear.owned) || []).length * 200;
    },
    reset() {
      this.data = defaults();
      this.save();
      return this.data;
    }
  };
})();
