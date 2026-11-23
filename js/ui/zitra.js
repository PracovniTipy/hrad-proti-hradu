/* =========================================================================
   TRUHLA HRDINY – důvod vrátit se zítra (návratnost hráčů D1/D3/D7).
   Nový hráč po první výhře uvidí: „Zítra tě čeká Truhla hrdiny“.
   Když přijde další den, truhla se mu sama nabídne při spuštění hry.
   Truhly: 2. den, 3. den a 7. den od první hry. Postup se nikdy nemaže.
   ========================================================================= */
(function () {
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;
  const dayNum = d => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  const today = () => dayNum(new Date());

  /* den = kolik dní po prvním hraní; odměny přes Shop.grant */
  const CHESTS = [
    { day: 1, gems: 150, gold: 1500, random: { count: 1, odds: [0, 0.25, 0.5, 0.25] } },
    { day: 2, gems: 250, gold: 2500, random: { count: 1, odds: [0, 0, 0.55, 0.45] } },
    { day: 6, gems: 500, gold: 5000, random: { count: 2, odds: [0, 0, 0.35, 0.65] } }
  ];
  const ART = '<svg viewBox="0 0 64 56" width="72" height="63" aria-hidden="true"><path d="M6 24h52v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#8a4a1c" stroke="#1a0d05" stroke-width="3"/><path d="M6 24c0-12 10-18 26-18s26 6 26 18z" fill="#b8642a" stroke="#1a0d05" stroke-width="3"/><path d="M6 24h52v7H6z" fill="#ffd04a" stroke="#1a0d05" stroke-width="3"/><rect x="27" y="27" width="10" height="12" rx="2" fill="#ffe680" stroke="#1a0d05" stroke-width="3"/><path d="M14 8v46M50 8v46" stroke="#ffd04a" stroke-width="4" opacity=".9"/></svg>';

  function state(save) {
    const s = save.zitra = save.zitra || { start: null, got: [] };
    if (!Array.isArray(s.got)) s.got = [];
    return s;
  }
  function next(save) { const s = state(save); return CHESTS.find(c => !s.got.includes(c.day)) || null; }
  function ready(save) {
    const s = state(save); if (s.start == null) return null;
    const d = today() - s.start;
    // nevyzvednutá truhla, jejíž den už nastal (zmeškané se nepropadají)
    return CHESTS.find(c => !s.got.includes(c.day) && d >= c.day) || null;
  }
  function rewardLine(c) {
    return `<b>${c.gems}</b> 💎 · <b>${c.gold.toLocaleString()}</b> 🪙 · ${c.random.count > 1 ? c.random.count + '× ' : ''}${L('vzácná výbava', 'rare gear')}`;
  }

  const Zitra = {
    ready: save => !!ready(save),
    /* po bitvě (main.js): první den slib truhly na zítra */
    onBattleEnd(App, cfg, res) {
      if (!res || !cfg || cfg.film) return null;
      const s = state(App.save);
      if (s.start == null) { s.start = today(); }
      if (!res.win) return null;
      const n = next(App.save); if (!n) return null;
      const left = n.day - (today() - s.start);
      if (left <= 0) return { note: L('🎁 Truhla hrdiny je připravená! Otevři ji na hradě.', '🎁 Your Hero Chest is ready! Open it at your castle.') };
      if (s.toldDay === today()) return null;
      s.toldDay = today();
      const when = left === 1 ? L('zítra', 'tomorrow') : L(`za ${left} dny`, `in ${left} days`);
      return { note: L(`🎁 Truhla hrdiny se otevře ${when}: `, `🎁 A Hero Chest unlocks ${when}: `) + rewardLine(n) + L('. Přijď si pro ni!', '. Come back for it!') };
    },
    /* nabídka truhly (při spuštění hry) */
    open(App) {
      const c = ready(App.save); if (!c) return false;
      const s = state(App.save);
      const nx = CHESTS.find(x => x.day > c.day && !s.got.includes(x.day));
      App.modal(`<div class="eyebrow">Castle WARS</div>
        <h2>${L('Truhla hrdiny', 'Hero Chest')}</h2>
        <div style="display:grid;place-items:center;margin:4px 0 6px;filter:drop-shadow(0 0 14px #ffd04a)">${ART}</div>
        <p>${L('Vrátil ses – tady je tvoje odměna:', 'You came back – here is your reward:')}<br>${rewardLine(c)}</p>
        <div class="modal-actions"><button class="btn btn-gold btn-big" data-zopen>${L('Otevřít truhlu', 'Open chest')}</button></div>`, (el, close) => {
        el.querySelector('[data-zopen]').addEventListener('click', () => {
          if (s.got.includes(c.day)) return;
          s.got.push(c.day);
          const got = Shop.grant(App, { gems: c.gems, gold: c.gold, random: c.random });
          if (window.Stat) try { Stat.ev('zitra', { day: c.day }); } catch (e) {}
          App.persist ? App.persist() : Save.save();
          close();
          Shop.rewardsModal(App, L('Truhla hrdiny', 'Hero Chest'), got, 'tydenni');
          if (nx) setTimeout(() => { try { App.toast(L(`🎁 Další truhla hrdiny čeká ${nx.day - c.day === 1 ? 'zítra' : 'za ' + (nx.day - c.day) + ' dní'}!`, `🎁 Next Hero Chest in ${nx.day - c.day} day${nx.day - c.day > 1 ? 's' : ''}!`)); } catch (e) {} }, 400);
        });
      });
    }
  };
  window.Zitra = Zitra;
})();
