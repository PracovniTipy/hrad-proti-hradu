/* =========================================================================
   DENNÍ ÚKOLY: každý den 3 nové úkoly, za splnění zlato a drahokamy,
   za všechny tři bonus. Plní se v jakékoli bitvě (příběh, souboj, trénink).
   ========================================================================= */
(function () {
  const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const POOL = [
    { id: 'sent30', m: 'sent', goal: 30, gold: 600, cs: 'Vyšli do boje {g} vojáků', en: 'Send {g} soldiers into battle' },
    { id: 'sent60', m: 'sent', goal: 60, gold: 1000, gems: 10, cs: 'Vyšli do boje {g} vojáků', en: 'Send {g} soldiers into battle' },
    { id: 'kill40', m: 'kills', goal: 40, gold: 700, cs: 'Poraz {g} nepřátel', en: 'Defeat {g} enemies' },
    { id: 'kill100', m: 'kills', goal: 100, gold: 1200, gems: 15, cs: 'Poraz {g} nepřátel', en: 'Defeat {g} enemies' },
    { id: 'win2', m: 'wins', goal: 2, gold: 800, gems: 10, cs: 'Vyhraj {g} bitvy', en: 'Win {g} battles' },
    { id: 'win3', m: 'wins', goal: 3, gold: 1000, gems: 20, cs: 'Vyhraj {g} bitvy', en: 'Win {g} battles' },
    { id: 'skill5', m: 'skills', goal: 5, gold: 600, gems: 10, cs: 'Použij {g}× speciální útok', en: 'Use a special attack {g} times' },
    { id: 'story1', m: 'story', goal: 1, gold: 800, gems: 15, cs: 'Vyhraj úroveň v příběhu', en: 'Win a story level' },
    { id: 'cp2', m: 'cp', goal: 2, gold: 700, gems: 10, cs: 'Obsaď {g}× střed bojiště', en: 'Capture the centre {g} times' },
    { id: 'pvp1', m: 'pvp', goal: 1, gold: 700, gems: 15, cs: 'Vyhraj souboj', en: 'Win a duel' },
    { id: 'star3', m: 'star3', goal: 1, gold: 900, gems: 20, cs: 'Získej 3 hvězdy v úrovni příběhu', en: 'Get 3 stars in a story level' },
    { id: 'archer', m: 'ranged', goal: 15, gold: 600, cs: 'Vyšli {g} střelců', en: 'Send {g} archers' }
  ];
  const BONUS = { gems: 40, gold: 1000 };
  const L = (c, e) => I18N.lang === 'cs' ? c : e;

  const Ukoly = {
    state(save) {
      const k = dayKey();
      if (!save.quests || save.quests.day !== k) {
        // stejné úkoly pro celý den (podle data), ale jiné každý den
        let seed = k.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 233280;
        const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        const pick = [], metrics = new Set();
        while (pick.length < 3) { const q = POOL[Math.floor(rnd() * POOL.length)]; if (!metrics.has(q.m)) { metrics.add(q.m); pick.push(q.id); } }
        save.quests = { day: k, ids: pick, prog: {}, claimed: {}, bonus: false };
      }
      return save.quests;
    },
    list(save) { const Q = this.state(save); return Q.ids.map(id => { const q = POOL.find(x => x.id === id); return Object.assign({}, q, { p: Math.min(q.goal, Q.prog[id] || 0), done: (Q.prog[id] || 0) >= q.goal, claimed: !!Q.claimed[id] }); }); },
    ready(save) { const l = this.list(save); return l.filter(q => q.done && !q.claimed).length + (l.every(q => q.claimed) && !save.quests.bonus ? 1 : 0); },
    /* zápis po bitvě */
    onBattle(save, cfg, res, stars) {
      const Q = this.state(save), st = res.st || {};
      const ranged = Object.keys(st.sent || {}).reduce((a, id) => a + (GameData.units[id] && GameData.units[id].ranged ? st.sent[id] : 0), 0);
      const add = { sent: res.sent || 0, kills: res.kills || 0, wins: res.win ? 1 : 0, skills: st.skills || 0, story: res.win && cfg.mode === 'campaign' ? 1 : 0,
        cp: st.cp ? 1 : 0, pvp: res.win && cfg.mode === 'pvp' ? 1 : 0, star3: stars === 3 ? 1 : 0, ranged };
      Q.ids.forEach(id => { const q = POOL.find(x => x.id === id); Q.prog[id] = (Q.prog[id] || 0) + (add[q.m] || 0); });
      return this.list(save).filter(q => q.done && !q.claimed).length;
    },
    open(App) {
      const save = App.save;
      const render = () => {
        const l = this.list(save), all = l.every(q => q.claimed);
        return `<div class="eyebrow">${L('Každý den nové', 'New every day')}</div><h2>${L('Denní úkoly', 'Daily quests')}</h2>
          <div class="quest-list">${l.map(q => `<div class="quest ${q.done ? 'done' : ''} ${q.claimed ? 'claimed' : ''}">
              <div class="q-txt"><b>${L(q.cs, q.en).replace('{g}', q.goal)}</b>
                <span class="q-bar"><i style="width:${q.p / q.goal * 100}%"></i></span><small>${q.p} / ${q.goal}</small></div>
              <div class="q-rew">${q.gold ? `${ico('coin')} ${q.gold}` : ''} ${q.gems ? `${ico('gem')} ${q.gems}` : ''}</div>
              ${q.claimed ? `<span class="q-ok">✓</span>` : `<button class="btn btn-sm ${q.done ? 'btn-gold' : ''}" data-q="${q.id}" ${q.done ? '' : 'disabled'}>${L('Vyzvednout', 'Claim')}</button>`}
            </div>`).join('')}
          <div class="quest bonus ${all ? 'done' : ''} ${save.quests.bonus ? 'claimed' : ''}">
            <div class="q-txt"><b>${L('Bonus za všechny tři úkoly', 'Bonus for all three quests')}</b></div>
            <div class="q-rew">${ico('coin')} ${BONUS.gold} ${ico('gem')} ${BONUS.gems}</div>
            ${save.quests.bonus ? `<span class="q-ok">✓</span>` : `<button class="btn btn-sm ${all ? 'btn-gold' : ''}" data-q="bonus" ${all ? '' : 'disabled'}>${L('Vyzvednout', 'Claim')}</button>`}
          </div></div>
          <p class="muted" style="margin:0;font-size:13px">${L('Úkoly se plní v příběhu, soubojích i tréninku. Nové přijdou o půlnoci.', 'Quests progress in story, duels and training. New ones arrive at midnight.')}</p>
          <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`;
      };
      App.modal(render(), (c) => {
        const bind = () => c.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
          const id = b.dataset.q, Q = save.quests;
          if (id === 'bonus') { if (Q.bonus) return; Q.bonus = true; save.gold += BONUS.gold; save.gems += BONUS.gems; }
          else { const q = this.list(save).find(x => x.id === id); if (!q || !q.done || q.claimed) return; Q.claimed[id] = true; save.gold += q.gold || 0; save.gems += q.gems || 0; }
          if (window.Zvuk) Zvuk.play('coin', 1);
          App.persist(); c.innerHTML = render(); bind();
          const dot = document.querySelector('#questBtn .daily-dot'); if (dot && !this.ready(save)) dot.remove();
        }));
        bind();
      });
    }
  };
  window.Ukoly = Ukoly;
})();
