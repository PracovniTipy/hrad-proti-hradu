/* =========================================================================
   BATTLE PAS – SEZÓNA „VLČÍ ZIMA“ (listopad 2026 – duben 2027, půl roku)
   - 20 úrovní, zkušenosti (XP) za každou bitvu a za denní úkoly.
   - Zdarma: zlato a drahokamy na každé úrovni.
   - Prémiový pas (za skutečné peníze): hned celý Vlčí set pro pěšáky všech
     národů, na úrovních 5/10/15/20 Vlčí set pro lučištníky a kopiníky
     a víc zlata a drahokamů.
   - Vlčí sady pro ostatní (těžká jednotka, jízda, mágové, velitelé)
     se kupují v obchodě za skutečné peníze.
   - Skiny se nikdy neberou zpět – po konci sezóny zůstávají hráči.
   ========================================================================= */
(function () {
  const G = GameData;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('cs-CZ');
  const L = (c, e) => (window.I18N && I18N.lang === 'en') ? e : c;

  /* ---------------- VLČÍ SET (epický, mění tvar: vlčí límec, kožešinový plášť, nárameníky, mrazivá aura) ---------------- */
  const WOLF_PAL = { tunic: '#2a3a52', tunicDark: '#18243a', trim: '#bfe6ff', metal: '#dfe9f5', metalDark: '#7a8aa8', cape: '#e8eef6', plume: '#bfe6ff',
    hood: '#2a3a52', hat: '#2a3a52', robe: '#2a3a52', lace: '#bfe6ff', mask: '#dfe9f5', sashi: '#2a3a52', mon: '#bfe6ff', crest: '#bfe6ff', fur: '#e8eef6', bear: '#d8dee6' };
  G.unitSkins.push({
    id: 'vlk', only: null, name: 'Vlčí zima', rarity: 'Epický', palette: WOLF_PAL,
    feat: { collar: 'wolf', furColor: '#e8eef6', cape: 'pelt', capeColor: '#e8eef6', pauldron: 'fur', aura: 'frost', chest: 'star', emblemColor: '#bfe6ff' },
    desc: 'Ledová ocel, bílá vlčí kožešina přes záda, vlčí límec a mrazivá aura. Sezónní set Vlčí zima.',
    en: { name: 'Wolf Winter', desc: 'Ice steel, a white wolf pelt over the back, a wolf collar and a frost aura. Wolf Winter season set.' },
    codeOnly: true, season: 's1', glow: '#9fd8ff', bonus: { hp: 0.07 }, cost: {}
  });
  const WW = (id, name, cat, model, desc, en) => ({ id, name, rarity: 'Epický', cat, model: Object.assign({ cat }, model), desc, en, codeOnly: true, season: 's1', bonus: { dmg: 0.07 }, cost: {} });
  G.weaponSkins.push(
    WW('w_vlk', 'Vlčí čepel', 'melee', { id: 'runovy', blade: '#eef6ff', dark: '#6a84b0', edge: '#ffffff', glow: '#9fd8ff', guard: '#bfe6ff', grip: '#2a3a52', pommel: '#bfe6ff', gem: '#7fc8ff' }, 'Ledová čepel s vlčími runami. Sezónní set Vlčí zima.', { name: 'Wolf Blade', desc: 'An ice blade with wolf runes. Wolf Winter season set.' }),
    WW('k_vlk', 'Vlčí kopí', 'pole', { id: 'partyzana', blade: '#eef6ff', dark: '#6a84b0', edge: '#ffffff', glow: '#9fd8ff', wood: '#2a3a52', guard: '#bfe6ff' }, 'Široký ledový hrot na tmavé násadě. Sezónní set Vlčí zima.', { name: 'Wolf Spear', desc: 'A broad ice head on a dark shaft. Wolf Winter season set.' }),
    WW('l_vlk', 'Vlčí luk', 'bow', { id: 'runovy', wood: '#dfe9f5', string: '#ffffff', glow: '#9fd8ff', gem: '#7fc8ff', arrow: '#eef6ff', tip: '#9fd8ff' }, 'Bílý luk s mrazivými runami a ledovými šípy. Sezónní set Vlčí zima.', { name: 'Wolf Bow', desc: 'A white bow with frost runes and ice arrows. Wolf Winter season set.' }),
    WW('h_vlk', 'Vlčí hůl', 'staff', { id: 'krystal', glow: '#9fd8ff' }, 'Ledový krystal v drápech bílého vlka. Sezónní set Vlčí zima.', { name: 'Wolf Staff', desc: 'An ice crystal in a white wolf’s claws. Wolf Winter season set.' })
  );
  const WOLF_W = ['w_vlk', 'k_vlk', 'l_vlk', 'h_vlk'];

  /* ---------------- SEZÓNA ---------------- */
  const S = G.season = {
    id: 's1', name: 'Vlčí zima', en: 'Wolf Winter',
    start: new Date(2026, 10, 1), end: new Date(2027, 4, 1),   // do konce dubna 2027
    levels: 20, xpLevel: 150, czk: 99,
    xp: { win: 40, loss: 15, train: 20, quest: 25 }
  };
  /* sady za skutečné peníze v obchodě */
  G.wolfSets = [
    { role: 'tezka', czk: 29 }, { role: 'jizda', czk: 29 }, { role: 'mag', czk: 29 }, { role: 'velitel', czk: 29 }
  ];
  const giftSet = role => ({ role, a: 'vlk', ws: WOLF_W });
  /* odměny úrovní: f = zdarma, p = prémiový pas */
  S.rewards = [
    { f: { gold: 500 }, p: { gems: 100 } },
    { f: { gems: 30 }, p: { gold: 2000 } },
    { f: { gold: 600 }, p: { gems: 150 } },
    { f: { gems: 40 }, p: { gold: 3000 } },
    { f: { gold: 800 }, p: { gift: [{ role: 'strelec', a: 'vlk' }] } },
    { f: { gems: 50 }, p: { gems: 200 } },
    { f: { gold: 1000 }, p: { gold: 4000 } },
    { f: { gems: 60 }, p: { gems: 250 } },
    { f: { gold: 1200 }, p: { gold: 5000 } },
    { f: { gems: 80 }, p: { gift: [{ role: 'strelec', ws: WOLF_W }] } },
    { f: { gold: 1500 }, p: { gems: 300 } },
    { f: { gems: 90 }, p: { gold: 6000 } },
    { f: { gold: 1800 }, p: { gems: 350 } },
    { f: { gems: 100 }, p: { gold: 7000 } },
    { f: { gold: 2000 }, p: { gift: [{ role: 'kopi', a: 'vlk' }] } },
    { f: { gems: 120 }, p: { gems: 400 } },
    { f: { gold: 2500 }, p: { gold: 8000 } },
    { f: { gems: 150 }, p: { gems: 500 } },
    { f: { gold: 3000 }, p: { gold: 10000 } },
    { f: { gems: 200 }, p: { gems: 1000, gift: [{ role: 'kopi', ws: WOLF_W }] } }
  ];

  Object.assign(I18N.D, {
    tab_pas: ['Battle pas', 'Battle Pass'],
    shop_hint_pas: ['Hraj bitvy a plň denní úkoly – dostaneš zkušenosti a odměny na 20 úrovních. Prémiový pas přidá celé epické sety.', 'Play battles and complete daily quests to earn XP and rewards across 20 levels. The premium pass adds full epic sets.'],
    pas_title: ['Battle pas · Vlčí zima', 'Battle Pass · Wolf Winter'],
    pas_ends: ['Sezóna končí za {n} dní', 'Season ends in {n} days'],
    pas_over: ['Sezóna skončila – brzy začne nová', 'The season has ended – a new one starts soon'],
    pas_lvl: ['Úroveň {n}', 'Level {n}'],
    pas_max: ['Maximální úroveň!', 'Max level!'],
    pas_xp_how: ['Výhra +{w} XP · prohra +{l} XP · trénink +{t} XP · denní úkol +{q} XP', 'Win +{w} XP · loss +{l} XP · training +{t} XP · daily quest +{q} XP'],
    pas_free: ['Zdarma', 'Free'],
    pas_prem: ['Prémiový', 'Premium'],
    pas_buy: ['Koupit prémiový pas', 'Buy the premium pass'],
    pas_have: ['Prémiový pas aktivní', 'Premium pass active'],
    pas_buy_note: ['Hned dostaneš celý epický Vlčí set (zbroj + zbraň) pro pěšáky všech tří národů. Na úrovních 5, 10, 15 a 20 Vlčí set pro lučištníky a kopiníky a k tomu přes 20 000 zlata a 3 000 drahokamů navíc.', 'Get the full epic Wolf set (armor + weapon) for the infantry of all three nations right away. Levels 5, 10, 15 and 20 unlock the Wolf set for archers and spearmen, plus 20,000+ gold and 3,000 gems extra.'],
    pas_claim_all: ['Vyzvednout vše', 'Claim all'],
    pas_claim: ['Vyzvednout', 'Claim'],
    pas_got: ['Odměny z battle pasu', 'Battle Pass rewards'],
    pas_sets: ['Vlčí sady pro další vojáky', 'Wolf sets for other soldiers'],
    pas_sets_sub: ['Epická zbroj i zbraň Vlčí zima pro všechny tři národy. Pěšáci, lučištníci a kopiníci ji mají v battle pasu.', 'Epic Wolf Winter armor and weapon for all three nations. Infantry, archers and spearmen get it from the Battle Pass.'],
    pas_set_name: ['Vlčí sada: {r}', 'Wolf set: {r}'],
    pas_set_desc: ['Epická zbroj Vlčí zima a vlčí zbraň pro {r} všech tří národů (+7 % životy, +7 % útok).', 'Epic Wolf Winter armor and wolf weapon for {r} of all three nations (+7% health, +7% attack).'],
    pas_owned: ['Máš', 'Owned'],
    pas_xp_gain: ['Battle pas +{n} XP', 'Battle Pass +{n} XP'],
    pas_lvl_up: ['Battle pas: úroveň {n}!', 'Battle Pass: level {n}!'],
    pas_armor_for: ['Vlčí zbroj · {r}', 'Wolf armor · {r}'],
    pas_weapon_for: ['Vlčí zbraň · {r}', 'Wolf weapon · {r}'],
    pas_set_for: ['Vlčí set · {r}', 'Wolf set · {r}'],
    skin_season: ['Sezóna', 'Season'],
    buy_real: ['Koupit', 'Buy']
  });
  const ROLE_PL = { pech: ['pěšáky', 'infantry'], strelec: ['lučištníky', 'archers'], kopi: ['kopiníky', 'spearmen'], tezka: ['těžké jednotky', 'heavy units'], jizda: ['jízdu', 'cavalry'], mag: ['mágy', 'mages'], velitel: ['velitele', 'commanders'] };
  const ROLE_N = { pech: ['Pěšáci', 'Infantry'], strelec: ['Lučištníci', 'Archers'], kopi: ['Kopiníci', 'Spearmen'], tezka: ['Těžká jednotka', 'Heavy units'], jizda: ['Jízda', 'Cavalry'], mag: ['Mágové', 'Mages'], velitel: ['Velitelé', 'Commanders'] };
  const rp = r => L(ROLE_PL[r][0], ROLE_PL[r][1]);
  const rn = r => L(ROLE_N[r][0], ROLE_N[r][1]);

  /* ---------------- STAV ---------------- */
  const Pas = {
    state(save) {
      if (!save.pass || save.pass.s !== S.id) save.pass = { s: S.id, xp: 0, prem: false, cf: {}, cp: {} };
      const P = save.pass; P.cf = P.cf || {}; P.cp = P.cp || {};
      return P;
    },
    level(save) { return Math.min(S.levels, Math.floor(this.state(save).xp / S.xpLevel)); },
    daysLeft() { return Math.max(0, Math.ceil((S.end - Date.now()) / 864e5)); },
    active() { return Date.now() < S.end; },
    ready(save) {
      const P = this.state(save), lv = this.level(save);
      let n = 0;
      for (let i = 1; i <= lv; i++) { if (!P.cf[i]) n++; if (P.prem && !P.cp[i]) n++; }
      return n;
    },
    addXp(save, n) {
      if (!this.active() || !n) return 0;
      const P = this.state(save), before = this.level(save);
      P.xp = Math.min(S.levels * S.xpLevel, P.xp + n);
      return this.level(save) - before;
    },
    /* XP za bitvu – volá main.js po skončení bitvy */
    onBattle(save, cfg, res) {
      if (res.reason === 'spojeni') return { xp: 0, up: 0 };
      const X = S.xp, train = !['campaign', 'pvp', 'online'].includes(cfg.mode);
      const xp = train ? (res.win ? X.train : 0) : (res.win ? X.win : X.loss);
      return { xp, up: this.addXp(save, xp) };
    },
    onQuest(save) { this.addXp(save, S.xp.quest); },
    setOwned(save, role) { const O = G.skinOwn; O.ensure(save); return O.unitsOfRole(role).every(u => O.has(save, u, 'vlk')); },
    /* doručení nákupu za skutečné peníze (volá Platby.deliver) */
    deliver(App, pid) {
      const save = App.save;
      if (pid === 'pass') {
        const P = this.state(save); P.prem = true;
        return { title: L('Prémiový battle pas', 'Premium Battle Pass'), got: Shop.grant(App, { gift: [giftSet('pech')] }) };
      }
      if (pid.startsWith('sada_')) {
        const role = pid.slice(5); if (!ROLE_N[role]) return null;
        return { title: t('pas_set_name', { r: rn(role) }), got: Shop.grant(App, { gift: [giftSet(role)] }) };
      }
      if (pid === 'skin_e' || pid === 'skin_l') {
        const rar = pid === 'skin_e' ? 'Epický' : 'Legendární';
        const want = save.pendingSkin; save.pendingSkin = null;
        const O = G.skinOwn; O.ensure(save);
        let give;
        if (want && G.units[want.uid]) {
          const item = want.k === 'w' ? G.weaponSkins.find(w => w.id === want.id) : G.unitSkins.find(s => s.id === want.id);
          const owned = want.k === 'w' ? O.hasW(save, want.uid, want.id) : O.has(save, want.uid, want.id);
          if (item && item.rarity === rar && !owned) give = { items: [{ k: want.k, id: want.id, unit: want.uid }] };
        }
        if (!give) give = { random: { odds: rar === 'Epický' ? [0, 0, 1, 0] : [0, 0, 0, 1] } };
        const got = Shop.grant(App, give);
        if (give.items) { const it = give.items[0]; if (it.k === 'w') save.skins.weapon[it.unit] = it.id; else save.skins.unit[it.unit] = it.id; App.persist(); }
        const first = got.find(x => x.kind === 'skinA' || x.kind === 'skinW');
        const nm = first ? (first.kind === 'skinW' ? G.weaponSkinById(first.id) : G.unitSkins.find(s => s.id === first.id)).name : L('Skin', 'Skin');
        return { title: nm, got };
      }
      return null;
    },
    rewardText(r) {
      const out = [];
      if (r.gold) out.push(`${ico('coin')} ${fmt(r.gold)}`);
      if (r.gems) out.push(`${ico('gem')} ${fmt(r.gems)}`);
      (r.gift || []).forEach(g => out.push(`<b>${esc(t(g.a && g.ws ? 'pas_set_for' : g.a ? 'pas_armor_for' : 'pas_weapon_for', { r: rn(g.role) }))}</b>`));
      return out.join('<br>');
    },
    claim(App, which) {
      const save = App.save, P = this.state(save), lv = this.level(save);
      const give = { gold: 0, gems: 0, gift: [] };
      const add = r => { give.gold += r.gold || 0; give.gems += r.gems || 0; (r.gift || []).forEach(g => give.gift.push(g)); };
      for (let i = 1; i <= lv; i++) {
        const R = S.rewards[i - 1];
        if ((which === 'all' || which === 'f' + i) && !P.cf[i]) { P.cf[i] = 1; add(R.f); }
        if (P.prem && (which === 'all' || which === 'p' + i) && !P.cp[i]) { P.cp[i] = 1; add(R.p); }
      }
      if (!give.gold) delete give.gold; if (!give.gems) delete give.gems;
      const got = Shop.grant(App, give);
      if (window.Zvuk) Zvuk.play('coin', 1);
      return got;
    },

    /* ---------------- UI: záložka obchodu ---------------- */
    body(App) {
      const save = App.save, P = this.state(save), lv = this.level(save);
      const into = P.xp - lv * S.xpLevel, maxed = lv >= S.levels;
      const X = S.xp;
      const cell = (i, kind) => {
        const R = S.rewards[i - 1][kind], done = kind === 'f' ? P.cf[i] : P.cp[i];
        const lock = kind === 'p' && !P.prem;
        const can = !done && !lock && i <= lv;
        const skin = (R.gift || [])[0];
        return `<div class="bp-cell ${kind} ${done ? 'done' : ''} ${can ? 'can' : ''} ${lock ? 'lock' : ''} ${skin ? 'skin' : ''}">
          ${skin ? `<canvas data-bpskin="${skin.role}|${skin.a ? 'a' : 'w'}"></canvas>` : ''}
          <div class="bp-rw">${this.rewardText(R)}</div>
          ${done ? '<span class="bp-ok">✓</span>' : lock ? `<span class="bp-lock">${ico('lock')}</span>` : can ? `<button class="btn btn-sm btn-gold" data-bpc="${kind}${i}">${t('pas_claim')}</button>` : ''}
        </div>`;
      };
      const cols = Array.from({ length: S.levels }, (_, k) => k + 1).map(i => `
        <div class="bp-col ${i <= lv ? 'reached' : ''} ${i === lv + 1 ? 'next' : ''}">
          <div class="bp-num">${i}</div>${cell(i, 'f')}${cell(i, 'p')}
        </div>`).join('');
      const sets = G.wolfSets.map(W => {
        const own = this.setOwned(save, W.role);
        return `<article class="panel bp-set">
          <canvas data-bpset="${W.role}"></canvas>
          <h3>${esc(t('pas_set_name', { r: rn(W.role) }))}</h3>
          <p class="muted">${esc(t('pas_set_desc', { r: rp(W.role) }))}</p>
          <button class="btn btn-sm ${own ? '' : 'btn-green'} buy-czk" data-bpset-buy="${W.role}" ${own ? 'disabled' : ''}>${own ? '✓ ' + t('pas_owned') : Platby.price(W.czk)}</button>
        </article>`;
      }).join('');
      const n = this.ready(save);
      return `
        <section class="panel bp-head">
          <canvas id="bpHero"></canvas>
          <div class="bp-info">
            <div class="eyebrow">${this.active() ? t('pas_ends', { n: this.daysLeft() }) : t('pas_over')}</div>
            <h2>${t('pas_title')}</h2>
            <div class="bp-lv"><b>${maxed ? t('pas_max') : t('pas_lvl', { n: lv })}</b>${maxed ? '' : `<span class="bp-bar"><i style="width:${into / S.xpLevel * 100}%"></i></span><small>${into} / ${S.xpLevel} XP</small>`}</div>
            <p class="muted bp-how">${t('pas_xp_how', { w: X.win, l: X.loss, t: X.train, q: X.quest })}</p>
            <div class="bp-actions">
              ${P.prem ? `<span class="bp-have">★ ${t('pas_have')}</span>` : (Platby.on() ? `<button class="btn btn-green btn-big buy-czk" id="bpBuy">${t('pas_buy')} · ${Platby.price(S.czk)}</button>` : '')}
              ${n ? `<button class="btn btn-gold" id="bpAll">${t('pas_claim_all')} (${n})</button>` : ''}
            </div>
            ${P.prem ? '' : `<p class="bp-note">${t('pas_buy_note')}</p>`}
          </div>
        </section>
        <div class="bp-track-wrap"><div class="bp-legend"><span class="f">${t('pas_free')}</span><span class="p">★ ${t('pas_prem')}</span></div>
          <div class="bp-track">${cols}</div></div>
        ${Platby.on() ? `<div class="sec-head"><h2>${t('pas_sets')}</h2><span class="muted">${t('pas_sets_sub')}</span></div><div class="bp-sets">${sets}</div>` : ''}`;
    },
    /* vykreslení vojáka ve vlčím setu */
    drawUnit(cv, uid, armor, weapon, opts) {
      const GH = G.gearHelpers, def = G.units[uid];
      const W = weapon ? WOLF_W.map(x => G.weaponSkins.find(y => y.id === x)).find(x => G.weaponSkinFits(x, uid)) : null;
      const fake = { skins: { unit: { [uid]: armor ? 'vlk' : 'zakladni' }, weapon: { [uid]: W ? W.id : null }, own: {}, ownW: {} } };
      const lk = GH.look(fake, uid);
      if (opts && opts.icon) {
        if (armor) Art.renderUnitIcon(cv, uid, 'player', 'vlk', { zoom: 0.95, def: GH.drawDef(def, lk) });
        else { const pal = Art.unitPalette('player', 'zakladni', def.faction); pal.wmodel = W.model; Art.renderWeaponIcon(cv, uid, pal); }
        return;
      }
      return { def: GH.drawDef(def, lk), pal: GH.palette('player', 'vlk', def.faction, lk) };
    },
    paintScene(cv, units) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = w * dpr; cv.height = h * dpr;
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1d3354'); g.addColorStop(0.7, '#0e1a2c'); g.addColorStop(0.7, '#dfe9f5'); g.addColorStop(1, '#a9bcd4');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // měsíc a sníh
      ctx.fillStyle = 'rgba(230,242,255,.9)'; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.2, h * 0.09, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 40; i++) { const x = (i * 97.3) % w, y = (i * 53.7) % (h * 0.7); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x, y, 2, 2); }
      units.forEach((u, i) => {
        const d = this.drawUnit(null, u, true, true);
        const k = h / 120 * (i === Math.floor(units.length / 2) ? 1.02 : 0.9);
        ctx.save(); ctx.translate(w * ((i + 0.5) / units.length) - 6, h * 0.92); ctx.scale(k, k);
        if (d.pal.mount) ctx.scale(0.78, 0.78);
        Art.drawUnit(ctx, d.def, d.pal, { x: 0, y: 0, facing: 1, t: 1.2 + i, atk: -1 });
        ctx.restore();
      });
    },
    bind(App, el) {
      const save = App.save;
      const hero = el.querySelector('#bpHero');
      if (hero) this.paintScene(hero, ['pesak', 'asigaru', 'valecnik']);
      el.querySelectorAll('canvas[data-bpset]').forEach(cv => this.paintScene(cv, G.skinOwn.unitsOfRole(cv.dataset.bpset)));
      el.querySelectorAll('canvas[data-bpskin]').forEach(cv => {
        const [role, k] = cv.dataset.bpskin.split('|');
        const uid = G.skinOwn.unitsOfRole(role)[0];
        this.drawUnit(cv, uid, k === 'a', k === 'w', { icon: true });
      });
      const after = got => { App.go('obchod', { tab: 'pas', keepScroll: true }); if (got.length) Shop.rewardsModal(App, t('pas_got'), got); App.refreshTop && App.refreshTop(); };
      el.querySelectorAll('[data-bpc]').forEach(b => b.addEventListener('click', () => after(this.claim(App, b.dataset.bpc))));
      const all = el.querySelector('#bpAll'); if (all) all.addEventListener('click', () => after(this.claim(App, 'all')));
      const buy = el.querySelector('#bpBuy');
      if (buy) buy.addEventListener('click', () => { if (this.state(save).prem) return; Platby.buy(App, { id: 'pass', name: t('pas_title'), czk: S.czk }); });
      el.querySelectorAll('[data-bpset-buy]').forEach(b => b.addEventListener('click', () => {
        const role = b.dataset.bpsetBuy, W = G.wolfSets.find(x => x.role === role);
        if (this.setOwned(save, role)) return;
        Platby.buy(App, { id: 'sada_' + role, name: t('pas_set_name', { r: rn(role) }), czk: W.czk });
      }));
      const tr = el.querySelector('.bp-track');
      if (tr) { const nx = tr.querySelector('.bp-col.next') || tr.querySelector('.bp-col.reached:last-child'); if (nx) tr.scrollLeft = Math.max(0, nx.offsetLeft - tr.clientWidth / 2); }
    }
  };
  /* ceny jednotlivých skinů za skutečné peníze */
  Pas.skinCzk = rarity => rarity === 'Legendární' ? 29 : rarity === 'Epický' ? 19 : 0;
  window.Pas = Pas;
})();
