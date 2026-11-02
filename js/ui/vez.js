/* =========================================================================
   OBRAZOVKA: CASTLE TOWER (Věž) – mezi Soubojem a Příběhem
   - aktuální patro: království, hrad, generál (jméno, titul, osobnost,
     historie, důvod obrany), podmínky, odměny, rivalita
   - pás pater (posun), Kronika věže (příběh), hodnost a úspěchy,
     týdenní výzva, globální žebříček věže
   ========================================================================= */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('cs-CZ');
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  Object.assign(I18N.D, {
    nav_vez: ['Věž', 'Tower'],
    vez_title: ['Castle Tower', 'Castle Tower'],
    vez_sub: ['Nekonečná věž – přes 1000 pater, každé je jiné království s vlastním generálem.', 'The endless tower – over 1000 floors, each a different kingdom with its own general.'],
    vez_floor: ['Patro {n}', 'Floor {n}'],
    vez_fight: ['Do boje', 'To battle'],
    vez_general: ['Generál', 'General'],
    vez_style: ['Styl boje', 'Fighting style'],
    vez_story: ['Historie', 'History'],
    vez_motive: ['Proč brání patro', 'Why he defends'],
    vez_conds: ['Podmínky patra', 'Floor conditions'],
    vez_none: ['Žádné zvláštní podmínky.', 'No special conditions.'],
    vez_reward: ['Odměna za vítězství', 'Victory reward'],
    vez_skin: ['skin ze truhly', 'skin from a chest'],
    vez_rank: ['Hodnost', 'Rank'],
    vez_best: ['Nejvyšší patro', 'Highest floor'],
    vez_gens: ['Poražení generálové', 'Generals defeated'],
    vez_kills: ['Generálové zabití v boji', 'Generals slain in battle'],
    vez_rate: ['Úspěšnost', 'Win rate'],
    vez_fast: ['Nejrychlejší patro', 'Fastest floor'],
    vez_lore: ['Kronika věže', 'Tower Chronicle'],
    vez_lore_locked: ['Odemkne se na patře {n}', 'Unlocks at floor {n}'],
    vez_ach: ['Úspěchy', 'Achievements'],
    vez_lb: ['Žebříček věže', 'Tower leaderboard'],
    vez_week: ['Výzva týdne', 'Weekly challenge'],
    vez_week_d: ['Zvláštní patro s extra podmínkami. Nejrychlejší vítězové týdne jsou v žebříčku.', 'A special floor with extra conditions. The fastest winners of the week make the leaderboard.'],
    vez_week_done: ['Splněno tento týden', 'Done this week'],
    vez_rival: ['Rival: porazil tě {n}×', 'Rival: beat you {n}×'],
    vez_won: ['Patro {n} dobyto!', 'Floor {n} conquered!'],
    vez_lost: ['Generál ubránil patro.', 'The general held the floor.'],
    vez_newlore: ['Nová kapitola Kroniky věže!', 'A new chapter of the Tower Chronicle!'],
    vez_newach: ['Nový úspěch: {n}', 'New achievement: {n}'],
    vez_gen_slain: ['Generál padl v boji: +{n} drahokamů', 'The general fell in battle: +{n} gems'],
    vez_tier: ['Úroveň', 'Tier'],
    vez_lb_floor: ['Patro', 'Floor'], vez_lb_gens: ['Generálové', 'Generals'], vez_lb_fast: ['Rychlost', 'Speed'], vez_lb_week: ['Týden', 'Week'],
    vez_lb_reg: ['Do žebříčku se dostaneš, až si nastavíš jméno a heslo účtu.', 'Set a name and password for your account to appear on the leaderboard.'],
    vez_major: ['Velký generál', 'Great General'],
    vez_prev: ['‹ Předchozí', '‹ Previous'], vez_next_f: ['Další ›', 'Next ›'],
    vez_replay: ['Zopakovat patro', 'Replay floor'],
    vez_locked: ['Nejdřív dobyj patro {n}.', 'Conquer floor {n} first.']
  });

  const PER_D = {
    berserk: ['Útočí neustále a nikdy necouvá. Osobně vede každý útok.', 'Attacks relentlessly and never retreats. Leads every charge in person.'],
    strateg: ['Vyvážený a trpělivý. Čeká na tvé chyby a pak tvrdě trestá.', 'Balanced and patient. Waits for your mistakes, then punishes hard.'],
    liska: ['Mistr léček a návnad. Nic není takové, jak vypadá.', 'Master of ambushes and lures. Nothing is what it seems.'],
    zed: ['Brání hradby pod věžemi a čeká na protiúder.', 'Defends the walls under his towers and waits to counter.'],
    lovec: ['Učí se tvůj styl a útočí na slabiny tvé armády.', 'Learns your style and strikes the weaknesses of your army.'],
    bourlivak: ['Spoléhá na mágy a ničivá kouzla.', 'Relies on mages and devastating spells.'],
    baron: ['Rychlá jízda, nájezdy na tvůj hrad, když odejdeš.', 'Fast cavalry, raids on your castle when you leave it.'],
    ostrel: ['Lučištníci a pomalý postup za štítem pěchoty.', 'Archers and a slow advance behind a shield of infantry.']
  };

  const Vez = {
    view: null, lbSort: 'floor', tab: 'patro',
    open(App) { App.go('vez'); },
    rewardHtml(r) {
      return `${r.gold ? `<span>${ico('coin')} ${fmt(r.gold)}</span>` : ''}${r.gems ? `<span>${ico('gem')} ${fmt(r.gems)}</span>` : ''}${r.random ? `<span>${ico('chest')} ${r.random.count || 1}× ${t('vez_skin')}</span>` : ''}`;
    },
    modsHtml(f) {
      const M = GameData.tower.MODS;
      return f.mods.length ? f.mods.map(id => `<div class="vz-mod"><b>${esc(L(M[id].cs, M[id].en))}</b><small>${esc(L(M[id].d[0], M[id].d[1]))}</small></div>`).join('') : `<p class="muted" style="margin:0">${t('vez_none')}</p>`;
    },
    screen(App) {
      const save = App.save, TW = GameData.tower, T = TW.state(save);
      const n = Math.max(1, Math.min(T.cur, this.view || T.cur));
      this.view = n;
      const f = TW.floor(n);
      const rank = TW.rankOf(T.best);
      const tot = T.wins + T.losses;
      const strip = [];
      for (let i = Math.max(1, n - 4); i <= n + 5; i++) {
        const F = TW.floor(i), done = i < T.cur, cur = i === T.cur;
        strip.push(`<button class="vz-step ${done ? 'done' : ''} ${cur ? 'cur' : ''} ${i === n ? 'sel' : ''} ${F.major ? 'major' : ''}" data-vf="${i}" ${i > T.cur ? 'disabled' : ''} style="--tc:${F.tierColor}"><b>${i}</b><small>${done ? '✓' : F.major ? '★' : i > T.cur ? '🔒' : '⚔'}</small></button>`);
      }
      const el = App.screenEl;
      el.innerHTML = `
        <div class="scr vz">
          <div class="sec-head"><h1>${t('vez_title')}</h1><span class="muted">${t('vez_sub')}</span></div>
          <div class="tabs vz-tabs" role="tablist">
            ${[['patro', t('vez_floor', { n: T.cur }), 'castle'], ['kronika', t('vez_lore'), 'map'], ['uspechy', t('vez_ach'), 'trophy'], ['zebricek', t('vez_lb'), 'podium']].map(([id, nm, ic]) => `<button class="tab" role="tab" data-vt="${id}" aria-selected="${this.tab === id}">${ico(ic)}<span>${esc(nm)}</span></button>`).join('')}
          </div>
          <section class="panel vz-stats">
            <div class="vz-rank"><small>${t('vez_rank')}</small><b>${esc(L(rank.cs, rank.en))}</b></div>
            <div><small>${t('vez_best')}</small><b>${fmt(T.best)}</b></div>
            <div><small>${t('vez_gens')}</small><b>${fmt(T.wins)}</b></div>
            <div><small>${t('vez_kills')}</small><b>${fmt(T.genKills)}</b></div>
            <div><small>${t('vez_rate')}</small><b>${tot ? Math.round(T.wins / tot * 100) : 0} %</b></div>
            <div><small>${t('vez_fast')}</small><b>${T.fastest ? Math.floor(T.fastest / 60) + ':' + String(Math.floor(T.fastest % 60)).padStart(2, '0') : '–'}</b></div>
          </section>
          <div id="vzBody">${this.tab === 'kronika' ? this.loreHtml(T) : this.tab === 'uspechy' ? this.achHtml(T) : this.tab === 'zebricek' ? `<section class="panel lb" id="vzLb"><div class="lb-load muted">${t('lb_loading')}</div></section>` : `
          <div class="vz-strip">${strip.join('')}</div>
          <section class="panel vz-floor ${f.major ? 'major' : ''}" style="--tc:${f.tierColor}">
            <div class="vz-scene"><canvas id="vzCastle"></canvas><canvas id="vzGen"></canvas>
              <div class="vz-tier"><small>${t('vez_tier')}</small> ${esc(f.tierName)}</div></div>
            <div class="vz-info">
              <div class="eyebrow">${t('vez_floor', { n: f.n })} · ${esc(f.realm)} ${f.major ? `<span class="tag tag-major">★ ${t('vez_major')}</span>` : ''}</div>
              <h2>${esc(f.name)}</h2>
              ${(T.rivals[f.n] || 0) ? `<div class="vz-rival">⚔ ${t('vez_rival', { n: T.rivals[f.n] })}</div>` : ''}
              <dl class="vz-kv">
                <dt>${t('vez_style')}</dt><dd><b>${esc(f.personaName)}</b> – ${esc(L(PER_D[f.persona][0], PER_D[f.persona][1]))}</dd>
                <dt>${t('vez_story')}</dt><dd>${esc(f.story)}</dd>
                <dt>${t('vez_motive')}</dt><dd>${esc(f.motive)}</dd>
              </dl>
              <div class="vz-sub">${t('vez_conds')}</div>
              <div class="vz-mods">${this.modsHtml(f)}</div>
              <div class="vz-sub">${t('vez_reward')}</div>
              <div class="offer-give vz-rew">${this.rewardHtml(f.reward)}</div>
              <div class="vz-acts">
                ${n > 1 ? `<button class="btn" data-vf="${n - 1}">${t('vez_prev')}</button>` : ''}
                <button class="btn btn-gold btn-big" id="vzGo">${n < T.cur ? t('vez_replay') : t('vez_fight')} ⚔</button>
                ${n < T.cur ? `<button class="btn" data-vf="${n + 1}">${t('vez_next_f')}</button>` : ''}
              </div>
            </div>
          </section>
`}
          </div>
        </div>`;
      el.querySelectorAll('[data-vt]').forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.vt; App.go('vez', { keepScroll: true }); }));
      el.querySelectorAll('[data-vf]').forEach(b => b.addEventListener('click', () => { this.view = +b.dataset.vf; App.go('vez', { keepScroll: true }); }));
      const go = el.querySelector('#vzGo'); if (go) go.addEventListener('click', () => App.startTower(n));
      if (this.tab === 'patro') this.paint(el, f);
      if (this.tab === 'zebricek') this.loadLb(App, el);
      const st = el.querySelector('.vz-step.sel'); if (st) st.scrollIntoView({ block: 'nearest', inline: 'center' });
    },
    paint(el, f) {
      const cv = el.querySelector('#vzCastle');
      if (cv) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const sky = { evropa: ['#6a9bd8', '#cfe3f5'], japonsko: ['#e88a6a', '#f6d2b0'], sever: ['#1d3354', '#7a98c0'], peklo: ['#3a0a06', '#a8301a'] }[f.theme] || ['#6a9bd8', '#cfe3f5'];
        const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = f.theme === 'peklo' ? '#2a0a06' : f.theme === 'sever' ? '#dfe9f5' : '#6a8a3a'; ctx.fillRect(0, h * 0.86, w, h);
        const style = (GameData.factions[f.faction] || {}).castleStyle || 'evropa';
        const img = Art.castleImage('enemy', f.castleSkin, f.castleLevel, 2, style, f.castleCfg);
        const s = Math.min(w / (img.w + 30), (h * 0.9) / (img.h + 10));
        ctx.save(); ctx.scale(s, s);
        const fr = (w / 2 - img.w * s / 2) / s, gy = (h * 0.88) / s;
        Art.drawCastle(ctx, img, fr, gy, -1, 0.3, 1, '#a8262a');
        if (f.defense && Art.drawDefense) try { Art.drawDefense(ctx, img, style, fr, gy, -1, 0, f.defense, f.faction, 'enemy', null); } catch (e) { /* nic */ }
        ctx.restore();
      }
      const gv = el.querySelector('#vzGen');
      if (gv) {
        const uid = f.unit || (GameData.factions[f.faction] || GameData.factions.kralovstvi).roles.velitel || 'velitel';
        Art.renderUnitIcon(gv, uid, 'enemy', f.unitSkin, { zoom: 1 });
      }
    },
    loreHtml(T) {
      return `<div class="vz-lore">${GameData.tower.LORE.map(c => {
        const open = T.best >= c.at || c.at === 1;
        const tx = L(c.cs, c.en);
        return `<section class="panel vz-ch ${open ? '' : 'locked'}"><div class="eyebrow">${t('vez_floor', { n: c.at })}</div><h3>${open ? esc(tx[0]) : '???'}</h3><p>${open ? esc(tx[1]) : t('vez_lore_locked', { n: c.at })}</p></section>`;
      }).join('')}</div>`;
    },
    achHtml(T) {
      return `<div class="vz-ach">${GameData.tower.ACH.map(a => { const ok = !!T.ach[a.id], tx = L(a.cs, a.en); return `<div class="panel vz-a ${ok ? 'ok' : ''}"><span class="vz-a-i">${ok ? '🏆' : '🔒'}</span><div><b>${esc(tx[0])}</b><small>${esc(tx[1])}</small></div><span class="vz-a-r">${ico('gem')} ${a.gems}</span></div>`; }).join('')}</div>`;
    },
    loadLb(App, el) {
      const box = el.querySelector('#vzLb');
      const sorts = [['floor', t('vez_lb_floor')], ['generals', t('vez_lb_gens')], ['fastest', t('vez_lb_fast')]];
      const head = `<div class="tabs vz-lbt">${sorts.map(([k, nm]) => `<button class="tab" data-lbs="${k}" aria-selected="${this.lbSort === k}">${nm}</button>`).join('')}</div>`;
      box.insertAdjacentHTML('beforebegin', head);
      el.querySelectorAll('[data-lbs]').forEach(b => b.addEventListener('click', () => { this.lbSort = b.dataset.lbs; App.go('vez', { keepScroll: true }); }));
      if (!Ucet.logged() || Ucet.guest()) box.insertAdjacentHTML('afterend', `<div class="notice"><div>${t('vez_lb_reg')}</div></div><button class="btn btn-green" data-acc="register">${t('acc_set')}</button>`);
      UcetUI.bind(App, el);
      const wk = GameData.tower.weekKey();
      Ucet.towerBoard(this.lbSort).then(rows => {
        if (App.current !== 'vez') return;
        let list = rows || [];
        if (this.lbSort === 'week') list = list.filter(r => r.week === wk && r.week_best).sort((a, b) => a.week_best - b.week_best);
        const mine = Ucet.logged() ? Ucet.s.username : null;
        const val = r => this.lbSort === 'generals' ? fmt(r.generals) : this.lbSort === 'fastest' ? (r.fastest ? Math.floor(r.fastest / 60) + ':' + String(r.fastest % 60).padStart(2, '0') : '–') : this.lbSort === 'week' ? Math.floor(r.week_best / 60) + ':' + String(r.week_best % 60).padStart(2, '0') : fmt(r.best_floor);
        box.innerHTML = list.length ? list.map((r, i) => {
          const rk = GameData.tower.rankOf(r.best_floor);
          return `<div class="lb-row ${r.username === mine ? 'me' : ''}"><div class="rank ${i < 3 ? 'r' + (i + 1) : ''}">${i + 1}</div>
            <div class="lb-name"><b>${esc(r.username)}${r.username === mine ? ' ' + t('you_suffix') : ''}</b><small>${esc(L(rk.cs, rk.en))} · ${t('vez_floor', { n: r.best_floor })} · ${fmt(r.wins)}/${fmt(r.wins + r.losses)}</small></div>
            <div class="lb-tro">${val(r)}</div></div>`;
        }).join('') : `<div class="lb-load muted">${t('lb_empty')}</div>`;
      }).catch(() => { box.innerHTML = `<div class="lb-load muted">${t('acc_e_net')}</div>`; });
    },

    /* ---------------- VÝSLEDEK BITVY VE VĚŽI ---------------- */
    onEnd(App, cfg, res) {
      const save = App.save, TW = GameData.tower, T = TW.state(save), f = cfg.floor;
      const out = { rewards: [], notes: [] };
      const genKilled = res.st && res.st.genKilled;
      if (genKilled) T.genKills++;
      if (res.win) {
        T.wins++; T.streak++; T.bestStreak = Math.max(T.bestStreak, T.streak);
        T.time += Math.round(res.time);
        if (!T.fastest || res.time < T.fastest) T.fastest = Math.round(res.time);
        if (f.n >= 20 && res.playerHp > 0.9) T.clean = true;
        if (f.mods.includes('bez_kouzel')) T.nomagic = true;
        const firstClear = cfg.weekly ? !T.weekDone[f.week] : f.n >= T.cur;
        if (cfg.weekly) { T.weekDone[f.week] = Math.round(res.time); T.weeks = (T.weeks || 0) + 1; T.weekBest = T.weekBest && T.weekBest.w === f.week ? { w: f.week, t: Math.min(T.weekBest.t, Math.round(res.time)) } : { w: f.week, t: Math.round(res.time) }; }
        else if (f.n >= T.cur) { T.cur = f.n + 1; T.best = Math.max(T.best, f.n); }
        const give = firstClear ? Object.assign({}, f.reward) : { gold: Math.round(f.reward.gold * 0.25) };
        if (genKilled) give.gems = (give.gems || 0) + 10 + Math.floor(f.n / 20);
        const got = Shop.grant(App, give);
        got.forEach(r => {
          if (r.kind === 'gold') out.rewards.push(`<span class="pill">${ico('coin')} +${fmt(r.n)}</span>`);
          else if (r.kind === 'gems') out.rewards.push(`<span class="pill">${ico('gem')} +${fmt(r.n)}</span>`);
          else if (r.kind === 'skinA' || r.kind === 'skinW') { const S = r.kind === 'skinA' ? GameData.unitSkins.find(x => x.id === r.id) : GameData.weaponSkinById(r.id); out.rewards.push(`<span class="pill">✦ ${esc(S.name)}</span>`); }
        });
        out.notes.push(`🏰 ${t('vez_won', { n: f.n })}`);
        if (!cfg.weekly && GameData.tower.LORE.some(c => c.at === f.n)) out.notes.push(`📜 ${t('vez_newlore')}`);
        this.view = T.cur;
      } else {
        T.losses++; T.streak = 0; T.rivals[f.n] = (T.rivals[f.n] || 0) + 1;
        out.notes.push(t('vez_lost'));
      }
      // úspěchy
      GameData.tower.ACH.forEach(a => {
        if (!T.ach[a.id] && a.test(T)) { T.ach[a.id] = Date.now(); save.gems += a.gems; out.notes.push(`🏆 ${t('vez_newach', { n: L(a.cs[0], a.en[0]) })} (${ico('gem')} +${a.gems})`); }
      });
      App.persist();
      this.report(T);
      return out;
    },
    report(T) {
      if (!window.Ucet || !Ucet.logged()) return;
      Ucet.towerReport(T).catch(() => { /* nic – zkusí se příště */ });
    }
  };
  window.Vez = Vez;
  window.Screens.vez = App => Vez.screen(App);
})();
