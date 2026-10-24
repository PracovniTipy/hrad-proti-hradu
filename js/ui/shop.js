/* =========================================================================
   OBCHOD: Nabídky (balíčky za 29 Kč, denní a týdenní truhly) a Zbrojnice
   (zbraně a brnění pro role vojáků). Ostatní záložky obchodu jsou
   v screens.js (skiny, hrady, dekorace, drahokamy).
   ========================================================================= */
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('cs-CZ');
  const GH = () => GameData.gearHelpers;
  const ROLES = ['pech', 'strelec', 'kopi', 'jizda', 'tezka', 'mag', 'velitel'];
  const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const weekKey = () => { const d = new Date(); const j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-w' + Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7); };

  function ensure(save) {
    save.gear = save.gear || { owned: [], eq: {} };
    save.gear.owned = save.gear.owned || [];
    save.gear.eq = save.gear.eq || {};
    save.purchases = save.purchases || {};
    save.chests = save.chests || {};
    save.skins.weapon = save.skins.weapon || {};
    save.skins.ownedWeapon = save.skins.ownedWeapon || ['w_zakladni'];
    return save;
  }
  const roleName = r => t('role_' + r);
  const shopNation = save => (window.App && App.shopNation) || save.faction;
  const priceHtml = p => p.czk ? `${p.czk} Kč` : p.gems ? `${ico('gem')} ${fmt(p.gems)}` : `${ico('coin')} ${fmt(p.gold)}`;
  const canAfford = (save, p) => p.czk ? true : p.gems ? save.gems >= p.gems : save.gold >= p.gold;
  const rarityTag = tier => `<span class="rar" style="color:${GH().rarityColor[tier]}">${t('rar_' + tier)}</span>`;
  const bonusText = b => {
    const out = [];
    if (b.dmg) out.push(`+${Math.round(b.dmg * 100)} % ${t('b_dmg')}`);
    if (b.hp) out.push(`+${Math.round(b.hp * 100)} % ${t('b_hp')}`);
    if (b.armor) out.push(`+${Math.round(b.armor * 100)} % ${t('b_armor')}`);
    if (b.crit) out.push(`${Math.round(b.crit * 100)} % ${t('b_crit')}`);
    return out.join(' · ');
  };

  /* ---------- udělení odměny a okno s odměnami ---------- */
  function randomGear(slot, minTier, odds) {
    let tier = minTier || 0;
    if (odds) { let r = Math.random(), acc = 0; for (let i = 0; i < odds.length; i++) { acc += odds[i]; if (r <= acc) { tier = i; break; } } }
    const pool = GameData.gear.filter(g => g.tier === tier && (!slot || g.slot === slot));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function grant(App, give) {
    const save = ensure(App.save);
    const got = [];
    if (give.gold) { save.gold += give.gold; got.push({ kind: 'gold', n: give.gold }); }
    if (give.gems) { save.gems += give.gems; got.push({ kind: 'gems', n: give.gems }); }
    const gearIds = (give.gear || []).slice();
    if (give.randomGear) gearIds.push(randomGear(give.randomGear.slot, give.randomGear.minTier, give.randomGear.odds).id);
    gearIds.forEach(id => {
      const g = GameData.gearById(id);
      if (save.gear.owned.includes(id)) { const comp = 300 * (g.tier + 1); save.gold += comp; got.push({ kind: 'dup', gear: g, n: comp }); }
      else { save.gear.owned.push(id); got.push({ kind: 'gear', gear: g }); }
    });
    (give.skins || []).forEach(id => { if (!save.skins.ownedUnit.includes(id)) save.skins.ownedUnit.push(id); got.push({ kind: 'skin', id }); });
    if (give.bigCastle) { save.bigCastle = true; save.castleType = 'velky'; got.push({ kind: 'big' }); }
    (give.decor || []).forEach(id => { if (!save.ownedDecor.includes(id)) { save.ownedDecor.push(id); save.castleCfg.decor = save.castleCfg.decor || {}; save.castleCfg.decor[id] = true; } got.push({ kind: 'decor', id }); });
    App.persist();
    return got;
  }
  function rewardsModal(App, title, got, chest) {
    const item = r => {
      if (r.kind === 'gold') return `<div class="rw"><span class="rw-ico">${ico('coin')}</span><b>+${fmt(r.n)}</b><small>${t('gold')}</small></div>`;
      if (r.kind === 'gems') return `<div class="rw"><span class="rw-ico">${ico('gem')}</span><b>+${fmt(r.n)}</b><small>${t('gems')}</small></div>`;
      if (r.kind === 'gear' || r.kind === 'dup') return `<div class="rw rw-gear" style="--rc:${GH().rarityColor[r.gear.tier]}"><canvas data-rwgear="${r.gear.id}"></canvas><b>${esc(r.gear.name)}</b><small>${roleName(r.gear.role)}${r.kind === 'dup' ? ` · ${t('dup_comp', { n: fmt(r.n) })}` : ''}</small></div>`;
      if (r.kind === 'skin') { const s = GameData.unitSkins.find(x => x.id === r.id); return `<div class="rw"><span class="rw-ico">${ico('brush')}</span><b>${esc(s.name)}</b><small>${t('skin')}</small></div>`; }
      if (r.kind === 'big') return `<div class="rw"><span class="rw-ico">${ico('castle')}</span><b>${t('big_name')}</b><small>${t('big_short')}</small></div>`;
      if (r.kind === 'decor') { const d = GameData.castleCustom.decorations.find(x => x.id === r.id); return `<div class="rw"><span class="rw-ico">${ico('castle')}</span><b>${esc(d.name)}</b><small>${t('decor_word')}</small></div>`; }
      return '';
    };
    App.modal(`
      ${chest ? `<div class="chest-open"><div class="chest-art ${chest}">${chestSvg(chest)}</div><div class="chest-rays"></div></div>` : ''}
      <h2 style="text-align:center">${esc(title)}</h2>
      <div class="rw-grid">${got.map(item).join('')}</div>
      <div class="modal-actions"><button class="btn btn-gold btn-big" data-close>${t('great')}</button></div>`, c => {
      c.querySelectorAll('canvas[data-rwgear]').forEach(cv => paintGear(cv, GameData.gearById(cv.dataset.rwgear), App.save));
    });
  }

  /* ---------- obrázky ---------- */
  function chestSvg(kind) {
    const gold = kind === 'tydenni';
    const wood = gold ? '#5a2a7a' : '#8a5a32', woodD = gold ? '#3a1650' : '#5a3a1e', band = gold ? '#ffd77a' : '#c9d3e0';
    return `<svg viewBox="0 0 120 100"><ellipse cx="60" cy="92" rx="46" ry="6" fill="rgba(0,0,0,.4)"/>
      <path d="M14 46h92v40a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="${wood}" stroke="#1a0e06" stroke-width="3"/>
      <path class="lid" d="M14 46c0-20 20-30 46-30s46 10 46 30z" fill="${woodD}" stroke="#1a0e06" stroke-width="3"/>
      <path d="M14 46h92" stroke="${band}" stroke-width="6"/><path d="M30 18v74M90 18v74" stroke="${band}" stroke-width="6" opacity=".9"/>
      <rect x="50" y="40" width="20" height="22" rx="3" fill="${band}" stroke="#1a0e06" stroke-width="2.4"/><circle cx="60" cy="50" r="3.4" fill="#1a0e06"/>
      <path d="M22 30c6-6 14-8 22-9" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35" fill="none"/></svg>`;
  }
  function offerArt(kind) {
    const map = { chest: chestSvg('denni'), gold: `<div class="art-stack">${ico('coin').repeat(3)}</div>`, gems: `<div class="art-stack">${ico('gem').repeat(3)}</div>`,
      weapon: `<span class="art-big">${Icons.swords}</span>`, armor: `<span class="art-big">${Icons.shield}</span>`, skin: `<span class="art-big">${Icons.brush}</span>`,
      castle: `<span class="art-big">${Icons.castle}</span>`, crown: `<span class="art-big">${Icons.crown.replace('class="crown"', '')}</span>` };
    return map[kind] || map.chest;
  }
  function paintGear(cv, g, save) {
    const role = g.role;
    const uid = GameData.unitForRole(shopNation(save), role);
    const def = GameData.units[uid];
    const fake = { gear: { eq: { [role]: { [g.slot]: g.id } } }, skins: save.skins };
    const lk = GH().look(fake, uid);
    const pal = GH().palette('player', save.skins.unit[uid], def.faction, lk);
    // zbraň samotná, zbroj na dřevěné figuríně – bez postavy
    if (g.slot === 'weapon') Art.renderWeaponIcon(cv, uid, pal);
    else Art.renderArmorIcon(cv, uid, GH().drawDef(def, lk), pal);
  }

  /* ---------- záložka NABÍDKY ---------- */
  function bodyOffers(App) {
    const save = ensure(App.save);
    const C = GameData.chests;
    const chestCard = ch => {
      const used = save.chests[ch.id] === (ch.period === 'day' ? dayKey() : weekKey());
      return `<article class="panel chest-card ${ch.id}">
        <div class="chest-art ${ch.id}">${chestSvg(ch.id)}</div>
        <div class="chest-body">
          <div class="eyebrow">${ch.period === 'day' ? t('chest_daily') : t('chest_weekly')}</div>
          <h3>${esc(ch.name)}</h3>
          <p class="muted">${ico('coin')} ${fmt(ch.gold[0])}–${fmt(ch.gold[1])} · ${ico('gem')} ${ch.gems[0]}–${ch.gems[1]}<br>${ch.gearChance >= 1 ? t('chest_gear_sure', { n: ch.gearCount || 1 }) : t('chest_gear_chance', { n: Math.round(ch.gearChance * 100) })}</p>
          <button class="link-btn" data-odds="${ch.id}">${t('odds')}</button>
        </div>
        <button class="btn ${used ? '' : 'btn-gold'} buy-czk" data-chest="${ch.id}" ${used ? 'disabled' : ''}>${used ? t('chest_again') : `${ch.czk} Kč`}</button>
      </article>`;
    };
    const offers = GameData.offers.map(o => {
      const n = save.purchases[o.id] || 0;
      const sold = o.limit && n >= o.limit;
      return `<article class="panel offer ${sold ? 'sold' : ''}">
        ${o.badge ? `<span class="offer-badge">${esc(o.badge)}</span>` : ''}
        <div class="offer-art">${offerArt(o.art)}</div>
        <h3>${esc(o.name)}</h3>
        <p>${esc(o.desc)}</p>
        <div class="offer-give">${o.give.gold ? `<span>${ico('coin')} ${fmt(o.give.gold)}</span>` : ''}${o.give.gems ? `<span>${ico('gem')} ${fmt(o.give.gems)}</span>` : ''}</div>
        ${o.limit ? `<small class="muted">${t('limit_n', { n: o.limit })}</small>` : ''}
        <button class="btn ${sold ? '' : 'btn-green'} buy-czk" data-offer="${o.id}" ${sold ? 'disabled' : ''}>${sold ? t('bought') : `${o.czk} Kč`}</button>
      </article>`;
    }).join('');
    return `
      <div class="sec-head"><h2>${t('chests')}</h2><span class="muted">${t('chests_sub')}</span></div>
      <div class="chest-row">${chestCard(C.denni)}${chestCard(C.tydenni)}</div>
      <div class="sec-head"><h2>${t('offers')}</h2><span class="muted">${t('offers_sub')}</span></div>
      <div class="offer-grid">${offers}</div>
      ${Platby.available() ? '' : `<div class="notice"><div>${t('pay_demo_short')}</div></div>`}`;
  }
  function bindOffers(App, el) {
    const save = ensure(App.save);
    el.querySelectorAll('[data-offer]').forEach(b => b.addEventListener('click', () => {
      const o = GameData.offers.find(x => x.id === b.dataset.offer);
      if (o.limit && (save.purchases[o.id] || 0) >= o.limit) return;
      Platby.buy(App, { id: o.id, name: o.name, czk: o.czk }, () => {
        save.purchases[o.id] = (save.purchases[o.id] || 0) + 1;
        const got = grant(App, o.give);
        App.go('obchod', { keepScroll: true });
        rewardsModal(App, o.name, got);
      });
    }));
    el.querySelectorAll('[data-chest]').forEach(b => b.addEventListener('click', () => {
      const ch = GameData.chests[b.dataset.chest];
      const key = ch.period === 'day' ? dayKey() : weekKey();
      if (save.chests[ch.id] === key) return;
      Platby.buy(App, { id: 'chest_' + ch.id, name: ch.name, czk: ch.czk }, () => {
        save.chests[ch.id] = key;
        const r = (a, b2) => Math.round(a + Math.random() * (b2 - a));
        const give = { gold: Math.round(r(ch.gold[0], ch.gold[1]) / 10) * 10, gems: r(ch.gems[0], ch.gems[1]), gear: [] };
        for (let i = 0; i < (ch.gearCount || 1); i++) if (Math.random() < ch.gearChance) give.gear.push(randomGear(null, 0, ch.tierOdds).id);
        const got = grant(App, give);
        App.go('obchod', { keepScroll: true });
        rewardsModal(App, ch.name, got, ch.id);
      });
    }));
    el.querySelectorAll('[data-odds]').forEach(b => b.addEventListener('click', () => {
      const ch = GameData.chests[b.dataset.odds];
      App.modal(`<h2>${esc(ch.name)} · ${t('odds')}</h2>
        <dl class="kv">
          <dt>${t('gold')}</dt><dd>${fmt(ch.gold[0])}–${fmt(ch.gold[1])}</dd>
          <dt>${t('gems')}</dt><dd>${ch.gems[0]}–${ch.gems[1]}</dd>
          <dt>${t('gear_word')}</dt><dd>${ch.gearChance >= 1 ? t('chest_gear_sure', { n: ch.gearCount || 1 }) : `${Math.round(ch.gearChance * 100)} %`}</dd>
          ${ch.tierOdds.map((p, i) => p ? `<dt style="color:${GH().rarityColor[i]}">${t('rar_' + i)}</dt><dd>${Math.round(p * 1000) / 10} %</dd>` : '').join('')}
        </dl>
        <p class="muted" style="margin:0;font-size:13px">${t('odds_note')}</p>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`);
    }));
  }

  /* ---------- záložka ZBROJNICE ---------- */
  function bodyArmory(App, opts) {
    const save = ensure(App.save);
    const role = ROLES.includes(opts.role) ? opts.role : (App.armoryRole || 'tezka');
    App.armoryRole = role;
    const E = save.gear.eq[role] || {};
    const uid = GameData.unitForRole(shopNation(save), role);
    const b = GH().bonus(save, uid);
    const card = g => {
      const owned = save.gear.owned.includes(g.id);
      const on = E[g.slot] === g.id;
      return `<article class="panel gear-card ${on ? 'equipped' : ''}" style="--rc:${GH().rarityColor[g.tier]}">
        <canvas data-gear="${g.id}"></canvas>
        <div class="gear-body">
          <h3>${esc(g.name)}</h3>${rarityTag(g.tier)}
          <p class="gear-bonus">${bonusText(g.bonus)}</p>
          <p class="muted">${esc(g.desc)}</p>
        </div>
        ${on ? `<button class="btn btn-sm" data-unequip="${g.slot}">${t('take_off')}</button>`
          : owned ? `<button class="btn btn-sm btn-blue" data-gequip="${g.id}">${t('use')}</button>`
          : `<button class="btn btn-sm ${g.price.czk ? 'btn-green' : 'btn-gold'}" data-gbuy="${g.id}" ${canAfford(save, g.price) ? '' : 'disabled'}>${priceHtml(g.price)}</button>`}
      </article>`;
    };
    const list = slot => GameData.gear.filter(g => g.role === role && g.slot === slot).map(card).join('');
    return `
      <div class="chips" role="tablist">
        ${ROLES.map(r => { const id = GameData.unitForRole(shopNation(save), r); return `<button class="chip" role="tab" data-role="${r}" aria-selected="${r === role}"><canvas data-chip="${id}"></canvas>${roleName(r)}</button>`; }).join('')}
      </div>
      <div class="armory-line"><b>${esc(GameData.units[uid].name)}</b> <span class="gear-bonus">${bonusText(b) || t('no_bonus')}</span></div>
      <div class="sec-head"><h2>${t('weapons')}</h2></div>
      <div class="gear-grid">${list('weapon')}</div>
      <div class="sec-head"><h2>${t('armors')}</h2></div>
      <div class="gear-grid">${list('armor')}</div>`;
  }
  function bindArmory(App, el) {
    const save = ensure(App.save);
    const role = App.armoryRole;
    const uid = GameData.unitForRole(shopNation(save), role);
    el.querySelectorAll('canvas[data-chip]').forEach(c => Art.renderUnitIcon(c, c.dataset.chip, 'player', save.skins.unit[c.dataset.chip], { headshot: true, noShadow: true }));
    el.querySelectorAll('canvas[data-gear]').forEach(c => paintGear(c, GameData.gearById(c.dataset.gear), save));
    el.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => App.go('obchod', { tab: 'zbrojnice', role: b.dataset.role, keepScroll: true })));
    const equip = id => { const g = GameData.gearById(id); save.gear.eq[role] = save.gear.eq[role] || {}; save.gear.eq[role][g.slot] = id; App.persist(); App.go('obchod', { tab: 'zbrojnice', keepScroll: true }); };
    el.querySelectorAll('[data-gequip]').forEach(b => b.addEventListener('click', () => equip(b.dataset.gequip)));
    el.querySelectorAll('[data-unequip]').forEach(b => b.addEventListener('click', () => { delete (save.gear.eq[role] || {})[b.dataset.unequip]; App.persist(); App.go('obchod', { tab: 'zbrojnice', keepScroll: true }); }));
    el.querySelectorAll('[data-gbuy]').forEach(b => b.addEventListener('click', () => {
      const g = GameData.gearById(b.dataset.gbuy);
      const done = () => { if (!save.gear.owned.includes(g.id)) save.gear.owned.push(g.id); App.toast(t('t_bought', { name: g.name })); equip(g.id); };
      if (g.price.czk) return Platby.buy(App, { id: g.id, name: `${g.name} · ${roleName(g.role)}`, czk: g.price.czk }, done);
      if (g.price.gems) { if (save.gems < g.price.gems) return; save.gems -= g.price.gems; }
      else { if (save.gold < g.price.gold) return; save.gold -= g.price.gold; }
      done();
    }));
    // animovaný náhled vojáka ve výbavě
    const pv = el.querySelector('#armoryPrev');
    if (!pv) return;
    const def = GameData.units[uid];
    const lk = GH().look(save, uid);
    const ddef = GH().drawDef(def, lk), pal = GH().palette('player', save.skins.unit[uid], def.faction, lk);
    const anim = () => {
      if (!pv.isConnected) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = pv.clientWidth, h = pv.clientHeight;
      if (pv.width !== Math.round(w * dpr)) { pv.width = w * dpr; pv.height = h * dpr; }
      const ctx = pv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createRadialGradient(w / 2, h * 0.75, 10, w / 2, h * 0.6, w * 0.7);
      g.addColorStop(0, '#5a4214'); g.addColorStop(1, '#141a26'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.9, w * 0.28, 8, 0, 0, Math.PI * 2); ctx.fill();
      const tm = performance.now() / 1000, ph = tm % 3.2, atk = ph > 2 ? (ph - 2) / 1.2 : -1;
      const sc = h / 125;
      ctx.save(); ctx.translate(w / 2 - 6 * sc, h * 0.9); ctx.scale(sc, sc);
      Art.drawUnit(ctx, ddef, pal, { x: 0, y: 0, facing: 1, t: tm, atk, ring: false });
      ctx.restore();
      App.previewRaf = requestAnimationFrame(anim);
    };
    cancelAnimationFrame(App.previewRaf);
    anim();
  }

  window.Shop = {
    tabs: ['nabidky', 'zbrojnice'],
    body(App, tab, opts) { return tab === 'zbrojnice' ? bodyArmory(App, opts || {}) : bodyOffers(App); },
    bind(App, tab, el) { if (tab === 'zbrojnice') bindArmory(App, el); else bindOffers(App, el); },
    grant, rewardsModal, ensure, bonusText, bindOffers
  };
})();
