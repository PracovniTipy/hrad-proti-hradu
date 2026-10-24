/* =========================================================================
   PROFIL HRÁČE A UKLÁDÁNÍ
   Prototyp ukládá postup do localStorage tohoto prohlížeče.
   V online verzi se tento objekt bude načítat ze serveru (viz README).
   ========================================================================= */
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
      trophies: 1200,
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
      settings: { speed: 1, auto: {} }
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
    load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
      try { this.data = raw ? merge(defaults(), JSON.parse(raw)) : defaults(); }
      catch (e) { this.data = defaults(); }
      return this.data;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* prohlížeč ukládání nepovolil */ }
    },
    reset() {
      this.data = defaults();
      this.save();
      return this.data;
    }
  };
})();
