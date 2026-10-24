/* =========================================================================
   DENNÍ ODMĚNY ZDARMA – 14 dní v kuse
   Každý den si hráč vyzvedne odměnu. Když vynechá den, řada začne znovu.
   14. den získá exkluzivní skin „Věrný strážce“, který se jinak nedá získat,
   a sám si vybere, které postavě ho dá.
   ========================================================================= */
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('cs-CZ');
  const key = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const today = () => key(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return key(d); };

  /* Exkluzivní skin (nedá se koupit) */
  GameData.unitSkins.push({
    id: 'verny', name: 'Věrný strážce', rarity: 'Vzácný', price: 0, exclusive: true,
    bonus: { hp: 0.08, dmg: 0.06 },
    desc: 'Odměna za 14 dní hraní v kuse. Nedá se koupit.',
    palette: { tunic: '#4a2a7a', tunicDark: '#2e1850', trim: '#ffd77a', metal: '#dcd4ef', metalDark: '#7a6ea0', cape: '#3a1f66', plume: '#b98cff', lace: '#ffd77a', mask: '#ffd77a' },
    ornament: 'crystal', glow: '#c9a0ff'
  });

  /* Odměny pro dny 1–14 */
  const DAYS = [
    { gold: 300 }, { gems: 20 }, { gold: 500 }, { randomGear: { minTier: 0 } }, { gems: 40 }, { gold: 800 },
    { randomGear: { minTier: 1 }, gems: 30 }, { gold: 1000 }, { gems: 50 }, { gold: 1200 }, { randomGear: { minTier: 1 } },
    { gems: 80 }, { gold: 2000, gems: 50 }, { skin: 'verny' }
  ];

  const Denni = {
    DAYS,
    state(save) {
      const L = save.login || (save.login = { last: '', streak: 0, lastClaim: '' });
      // vynechaný den → řada začíná znovu
      if (L.lastClaim && L.lastClaim !== today() && L.lastClaim !== yesterday()) { L.streak = 0; }
      if (L.streak >= 14 && L.lastClaim !== today()) L.streak = 0; // po 14. dni nové kolo
      return { streak: L.streak, claimedToday: L.lastClaim === today(), day: L.lastClaim === today() ? L.streak : L.streak + 1 };
    },
    available(save) { return !this.state(save).claimedToday; },

    /* Okno s kalendářem */
    open(App) {
      const save = App.save;
      const st = this.state(save);
      const cell = (r, i) => {
        const d = i + 1;
        const done = d <= st.streak;
        const now = d === st.day && !st.claimedToday;
        const ico2 = r.skin ? '' : r.randomGear ? ico('swords') : r.gems ? ico('gem') : ico('coin');
        const txt = r.skin ? '' : r.randomGear ? (r.randomGear.minTier ? t('rar_1') : t('rar_0')) : r.gems ? `${r.gems}${r.gold ? '' : ''}` : fmt(r.gold);
        return `<div class="dd ${done ? 'done' : ''} ${now ? 'now' : ''} ${r.skin ? 'big' : ''}">
          <small>${t('day_n', { n: d })}</small>
          ${r.skin ? `<canvas id="ddSkin"></canvas><b>${esc(GameData.unitSkins.find(s => s.id === r.skin).name)}</b>` : `<span class="dd-ico">${ico2}</span><b>${txt}${r.gold && r.gems ? ` + ${r.gems}` : ''}</b>`}
          ${done ? '<i class="dd-check">✓</i>' : ''}
        </div>`;
      };
      App.modal(`
        <div class="eyebrow">${t('daily_free')}</div>
        <h2>${t('daily_title')}</h2>
        <p class="muted" style="margin:0">${t('daily_rule')}</p>
        <div class="dd-grid">${DAYS.map(cell).join('')}</div>
        <div class="dd-streak">${t('streak_n', { n: st.streak })}</div>
        <div class="modal-actions">
          ${st.claimedToday ? `<button class="btn" disabled>${t('daily_tomorrow')}</button>` : `<button class="btn btn-gold btn-big" id="ddClaim">${t('claim')}</button>`}
          <button class="btn" data-close>${t('back')}</button>
        </div>`, (c, close) => {
        const cv = c.querySelector('#ddSkin');
        if (cv) requestAnimationFrame(() => Art.renderUnitIcon(cv, GameData.factions[save.faction].roles.tezka, 'player', 'verny', { zoom: 0.9 }));
        const btn = c.querySelector('#ddClaim');
        if (btn) btn.addEventListener('click', () => { close(); this.claim(App); });
      });
    },

    claim(App) {
      const save = App.save;
      const st = this.state(save);
      if (st.claimedToday) return;
      const day = st.streak + 1;
      const r = DAYS[day - 1];
      save.login.streak = day;
      save.login.lastClaim = today();
      if (r.skin) {
        App.persist();
        const owned = save.skins.ownedUnit.includes(r.skin);
        if (owned) { // skin už má → místo něj drahokamy
          const got = Shop.grant(App, { gems: 150 });
          Shop.rewardsModal(App, t('day_n', { n: day }), got, 'tydenni');
        } else this.pickUnit(App, r.skin);
      } else {
        const got = Shop.grant(App, r);
        Shop.rewardsModal(App, t('day_n', { n: day }), got, 'denni');
      }
      App.refreshTop();
      if (App.current === 'hrad') App.go('hrad');
    },

    /* 14. den: hráč vybere postavu, které skin dá */
    pickUnit(App, skinId) {
      const save = App.save;
      const sk = GameData.unitSkins.find(s => s.id === skinId);
      const units = GameData.factionOrder.filter(f => GameData.campaignHelpers.factionUnlocked(save, f)).flatMap(f => GameData.factionUnits(f));
      App.modal(`
        <div class="eyebrow">${t('day_n', { n: 14 })} · ${t('exclusive')}</div>
        <h2>${esc(sk.name)}</h2>
        <p class="muted" style="margin:0">${t('pick_unit')}</p>
        <div class="pick-grid">${units.map(id => `<button class="pick-u" data-pick="${id}"><canvas data-pcv="${id}"></canvas><b>${esc(GameData.units[id].name)}</b></button>`).join('')}</div>`, (c, close) => {
        c.querySelectorAll('canvas[data-pcv]').forEach(cv => Art.renderUnitIcon(cv, cv.dataset.pcv, 'player', skinId, { zoom: 0.95 }));
        c.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
          const id = b.dataset.pick;
          if (!save.skins.ownedUnit.includes(skinId)) save.skins.ownedUnit.push(skinId);
          save.loyalSkinUnit = id;
          save.skins.unit[id] = skinId;
          App.persist(); close();
          App.toast(t('skin_given', { name: sk.name, unit: GameData.units[id].name }));
          if (App.current === 'hrad') App.go('hrad');
        }));
      });
    }
  };
  window.Denni = Denni;
})();
