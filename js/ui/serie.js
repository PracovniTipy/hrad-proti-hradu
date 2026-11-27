/* =========================================================================
   SÉRIE BITEV – odměna za víc bitev v jednom hraní (delší doba hraní).
   Každá dohraná bitva (výhra i prohra) posune sérii. Po 2., 3., 5. a 8. bitvě
   v jednom hraní padne odměna. Série se nuluje po 30 min bez bitvy.
   Postup hráče se nikdy nemaže – jde jen o bonus navíc.
   ========================================================================= */
(function () {
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;
  const STEPS = [
    { n: 2, gold: 150, gems: 10 },
    { n: 3, gold: 400, gems: 25 },
    { n: 5, gold: 800, gems: 50, random: { count: 1, odds: [0.2, 0.5, 0.3, 0] } },
    { n: 8, gold: 1500, gems: 100, random: { count: 1, odds: [0, 0.2, 0.5, 0.3] } }
  ];
  const GAP = 30 * 60 * 1000;
  let count = 0, last = 0;

  function dots(c) {
    const max = STEPS[STEPS.length - 1].n;
    let h = '';
    for (let i = 1; i <= max; i++) {
      const st = STEPS.find(s => s.n === i);
      h += `<span class="sr-d${i <= c ? ' on' : ''}${st ? ' gift' : ''}">${st ? '🎁' : ''}</span>`;
    }
    return `<span class="sr-dots">${h}</span>`;
  }

  window.Serie = {
    onBattleEnd(App, cfg, res) {
      if (!res || !cfg || cfg.film || cfg.prolog || cfg.net) return null;
      const now = Date.now();
      if (now - last > GAP) count = 0;
      last = now; count++;
      const hit = STEPS.find(s => s.n === count);
      const rewards = [];
      if (hit) {
        const give = { gold: hit.gold, gems: hit.gems };
        if (hit.random) give.random = hit.random;
        try { Shop.grant(App, give); } catch (e) { /* nic */ }
        rewards.push(`<span class="pill">🪙 +${hit.gold.toLocaleString()}</span>`, `<span class="pill">💎 +${hit.gems}</span>`);
        if (hit.random) rewards.push(`<span class="pill">🎁 ${L('výbava', 'gear')}</span>`);
        if (window.Stat) try { Stat.ev('serie', { n: count }); } catch (e) { /* nic */ }
      }
      const nx = STEPS.find(s => s.n > count);
      const head = hit ? L(`🔥 Série ${count} bitev – odměna!`, `🔥 ${count}-battle streak – reward!`)
        : L(`🔥 Série bitev: ${count}`, `🔥 Battle streak: ${count}`);
      const tail = nx ? L(` · další odměna po ${nx.n}. bitvě`, ` · next reward after battle ${nx.n}`) : '';
      return { rewards, note: `<span class="sr">${head}${tail}<br>${dots(count)}</span>` };
    }
  };
})();
