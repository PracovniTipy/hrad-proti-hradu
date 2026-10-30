/* =========================================================================
   OBCHOD: Nabídky (balíčky za 29 Kč, denní a týdenní truhly) a Zbrojnice
   (zbraně a brnění pro role vojáků). Ostatní záložky obchodu jsou
   v screens.js (skiny, hrady, dekorace, drahokamy).
   ========================================================================= */
(function () {
  Object.assign(I18N.D, {
    tab_codes: ['Kódy', 'Codes'],
    shop_hint_kody: ['Máš kód? Zadej ho a dostaneš odměnu. Každý kód jde použít jen jednou na účet.', 'Got a code? Enter it to get a reward. Each code works once per account.'],
    codes_title: ['Uplatnit kód', 'Redeem a code'],
    codes_ph: ['Zadej kód', 'Enter code'],
    codes_btn: ['Uplatnit', 'Redeem'],
    codes_history: ['Použité kódy', 'Used codes'],
    codes_where: ['Kódy najdeš u tvůrce hry, na jeho sítích a při akcích.', 'Codes come from the game’s creator, their channels and events.'],
    code_e_invalid: ['Takový kód neexistuje nebo už neplatí.', 'This code does not exist or has expired.'],
    code_e_used: ['Tenhle kód už jsi použil.', 'You have already used this code.'],
    code_e_spent: ['Kód už vyčerpali jiní hráči.', 'This code has been used up by other players.'],
    code_e_busy: ['Moc pokusů. Zkus to za pár minut.', 'Too many attempts. Try again in a few minutes.'],
    rar_4: ['Božský', 'Divine'],
    pay_launch: ['Platby za skutečné peníze právě spouštíme. Nabídky už vidíš, zaplatit půjde, jakmile je napojíme – dáme vědět ve hře.', 'Real-money payments are launching. You can already see the offers; paying will work as soon as they are connected – we will let you know in the game.'],
    pay_opening: ['Otevírám bezpečnou platební stránku…', 'Opening the secure payment page…'],
    pay_ok_wait: ['Platba proběhla – nákup ti za chvíli přijde.', 'Payment done – your purchase is on its way.'],
    pay_more: ['Tvoje nákupy', 'Your purchases'],
    acc_rescue: ['Záchranný kód', 'Recovery code'],
    acc_rescue_hint: ['Záchranný kód ti vrátí účet, když zapomeneš heslo. Vytvoř si ho a ulož.', 'A recovery code gets your account back if you forget your password. Create one and keep it safe.'],
    acc_rescue_q: ['Vytvoříme ti nový záchranný kód. Starý kód (pokud nějaký máš) přestane platit.', 'We will create a new recovery code. Your old code (if any) will stop working.'],
    acc_rescue_make: ['Vytvořit kód', 'Create code'],
    acc_rescue_save: ['Opiš si ho nebo vyfoť a ulož na bezpečné místo. Ukážeme ho jen teď. S ním a jménem si nastavíš nové heslo.', 'Write it down or take a photo and keep it safe. We show it only now. With it and your name you can set a new password.'],
    acc_rescue_copy: ['Zkopírovat', 'Copy'],
    acc_rescue_copied: ['Zkopírováno', 'Copied'],
    acc_rescue_done: ['Mám uložený', 'Saved it'],
    acc_forgot: ['Zapomněl jsi heslo?', 'Forgot your password?'],
    acc_forgot_note: ['Zadej jméno nebo e-mail, svůj záchranný kód a nové heslo.', 'Enter your name or e-mail, your recovery code and a new password.'],
    acc_forgot_go: ['Nastavit heslo', 'Set password'],
    acc_forgot_ok: ['Heslo změněno – jsi přihlášený.', 'Password changed – you are signed in.'],
    acc_new_pass: ['Nové heslo', 'New password'],
    acc_e_rescue: ['Jméno nebo záchranný kód nesedí.', 'The name or recovery code is wrong.'],
    itch_consent: ['Souhlasím s {link} a chci věci dodat hned. Beru na vědomí, že tím ztrácím právo odstoupit od nákupu do 14 dnů.', 'I agree to the {link} and want the items delivered now. I understand I lose the 14-day right of withdrawal.'],
    itch_terms: ['obchodními podmínkami', 'terms of sale'],
    itch_need_ok: ['Nejdřív zaškrtni souhlas s podmínkami.', 'Please tick the consent box first.'],
    terms_link: ['Obchodní podmínky', 'Terms of sale'],
    itch_buy: ['Koupit na itch.io', 'Buy on itch.io'],
    itch_how: ['1. Klikni na „Koupit na itch.io“ a zaplať (kartou nebo PayPalem).<br>2. Po zaplacení zkopíruj adresu stránky ke stažení – najdeš ji i v e-mailu od itch.io.<br>3. Vlož ji sem a stiskni Uplatnit. Věci dostaneš hned.', '1. Press “Buy on itch.io” and pay (card or PayPal).<br>2. After paying, copy the address of your download page – it is also in the e-mail from itch.io.<br>3. Paste it here and press Redeem. You get your items right away.'],
    itch_ph: ['Odkaz ze stránky ke stažení', 'Download page link'],
    itch_redeem: ['Uplatnit', 'Redeem'],
    itch_invalid: ['Tenhle odkaz nebo klíč jsme na itch.io nenašli. Zkopíruj celou adresu stránky ke stažení.', 'We could not find this link or key on itch.io. Copy the full address of your download page.'],
    itch_used: ['Tenhle nákup už byl uplatněný.', 'This purchase has already been redeemed.'],
    itch_soon: ['Nákupy přes itch.io se právě spouštějí – zkus to prosím za chvíli.', 'itch.io purchases are just being switched on – please try again shortly.'],
    itch_note: ['Platí se bezpečně přes itch.io. Nákup se uloží k tvému účtu ve hře.', 'You pay securely through itch.io. The purchase is saved to your game account.'],
    pay_soon: ['Platby za skutečné peníze právě spouštíme. Tenhle nákup půjde dokončit, jakmile platby napojíme.', 'Real-money payments are launching. You will be able to complete this purchase as soon as they are connected.'],
    div_title: ['Božské sety', 'Divine sets'],
    div_sub: ['Kompletní zbroj a zbraň pro všech 21 vojáků všech tří národů. +20 % útok a +20 % životy za zbroj i za zbraň – dvakrát víc než legendární.', 'Full armor and weapon for all 21 soldiers of all three nations. +20% attack and +20% health for armor and for weapon – twice a legendary.'],
    div_owned: ['Máš kompletní', 'Complete'],
    div_andel_d: ['Černozlatá zbroj, obří černá křídla, rudá svatozář a aura. Meč, kopí, luk a hůl padlého anděla.', 'Black-gold armor, huge black wings, a crimson halo and aura. The fallen angel’s sword, spear, bow and staff.'],
    div_kral_d: ['Bílozlatá zbroj s korunou, zlatá křídla a sluneční svatozář. Meč, kopí, luk a žezlo Božího krále.', 'White-gold armor with a crown, golden wings and a sun halo. The God-King’s sword, spear, bow and scepter.'],
    ai_retreat: ['Nepřítel ustupuje za hradby!', 'The enemy retreats behind the walls!'],
    rw_skill: ['Speciální útok', 'Special attack'],
    rw_all_skills: ['Všech {n} útoků', 'All {n} attacks'],
    big_bought: ['Velká pevnost je tvoje! Hrad se zvětšil.', 'The Great Fortress is yours! Your castle has grown.'],
    ord_retreat: ['Ústup', 'Retreat'], ord_walls: ['Hradby', 'Walls'], ord_center: ['Střed', 'Center'], ord_attack: ['Útok', 'Attack'],
    walls_hint: ['Obrana hradeb: armáda se postaví před bránu, kde ji kryjí obránci na hradbách.', 'Defend the walls: the army forms up in front of the gate, covered by the wall defenders.'],
    center_hint: ['Obsadit střed: armáda drží střed bojiště (+35 % mincí a +10 % útok, když ho obsadíš).', 'Hold the center: the army holds the middle of the field (+35% coins and +10% attack once captured).'],
    map_order_hint: ['Klepni na bojiště a armáda tam půjde – funguje i když ovládáš vojáka.', 'Tap the battlefield and the army goes there – even while you control a soldier.'],
    sub_armor: ['Brnění', 'Armor'],
    no_bonus: ['Bez bonusu', 'No bonus'],
    skin_for_units: ['pro: {u}', 'for: {u}'],
    skin_one_unit: ['Skin platí jen pro vybraného vojáka: {u}', 'The skin is only for the selected soldier: {u}']
  });
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
  const priceHtml = p => p.czk ? Platby.price(p.czk) : p.gems ? `${ico('gem')} ${fmt(p.gems)}` : `${ico('coin')} ${fmt(p.gold)}`;
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
  const FULL_COMP = 2500;
  const RARS = ['Základní', 'Vzácný', 'Epický', 'Legendární', 'Božský'];
  const unlockedUnits = save => GameData.factionOrder.filter(f => !GameData.factions[f].enemyOnly && GameData.campaignHelpers.factionUnlocked(save, f)).flatMap(f => GameData.factionUnits(f));
  function grant(App, give) {
    const save = ensure(App.save);
    const O = GameData.skinOwn;
    const got = [];
    const items = {};   // seskupení: jeden skin → víc vojáků
    const put = (k, uid, id) => {
      const added = k === 'a' ? O.add(save, uid, id) : O.addW(save, uid, id);
      if (!added) return false;
      // nový skin se rovnou nasadí, když voják nosí výchozí
      if (k === 'a' && (!save.skins.unit[uid] || save.skins.unit[uid] === 'zakladni')) save.skins.unit[uid] = id;
      if (k === 'w' && (!save.skins.weapon[uid] || save.skins.weapon[uid] === 'w_zakladni')) save.skins.weapon[uid] = id;
      const key = k + ':' + id; (items[key] = items[key] || { kind: k === 'a' ? 'skinA' : 'skinW', id, units: [] }).units.push(uid);
      return true;
    };
    if (give.unlimited) { save.unlimited = true; got.push({ kind: 'gold', n: 9999999 }, { kind: 'gems', n: 9999999 }); App._unl && App._unl(); }
    if (give.gold) { save.gold += give.gold; got.push({ kind: 'gold', n: give.gold }); }
    if (give.gems) { save.gems += give.gems; got.push({ kind: 'gems', n: give.gems }); }
    // dárky pro roli (všechny národy): konkrétní skin, nebo náhodný dané vzácnosti
    (give.gift || []).forEach(g => {
      let any = false;
      O.unitsOfRole(g.role).forEach(uid => {
        if (g.a || g.ar) {
          const want = g.a && GameData.unitSkins.find(x => x.id === g.a);
          let s = want && GameData.skinFits(want, uid) ? want : null;
          if (!s) { const pool = O.armorFor(uid, g.ar || (want && want.rarity) || 'Vzácný').filter(x => !O.has(save, uid, x.id)); s = pool.sort((a, b) => (b.only ? 1 : 0) - (a.only ? 1 : 0))[0]; }
          if (s && put('a', uid, s.id)) any = true;
        }
        if (g.w || g.wr) {
          const want = g.w && GameData.weaponSkins.find(x => x.id === g.w);
          let w = want && GameData.weaponSkinFits(want, uid) ? want : null;
          if (!w) w = O.weaponFor(uid, g.wr || (want && want.rarity) || 'Vzácný').filter(x => !O.hasW(save, uid, x.id))[0];
          if (w && put('w', uid, w.id)) any = true;
        }
      });
      if (!any) { save.gold += FULL_COMP; got.push({ kind: 'gold', n: FULL_COMP }); }
    });
    // náhodný skin, který hráč ještě nemá (když má všechno → 2 500 zlata)
    const rnd = give.random ? [].concat(give.random) : [];
    rnd.forEach(R => {
      for (let n = 0; n < (R.count || 1); n++) {
        const r = GameData.randomSkin(save, R.odds || [0.3, 0.45, 0.2, 0.05], unlockedUnits(save), R.kind);
        if (r) put(r.k, r.uid, r.id); else { save.gold += FULL_COMP; got.push({ kind: 'gold', n: FULL_COMP }); }
      }
    });
    // položky z kódu: { k: 'a'|'w', id, unit } nebo { k, id, role }
    (give.items || []).forEach(it => {
      const uids = it.unit ? [it.unit] : O.unitsOfRole(it.role || 'pech');
      uids.forEach(uid => put(it.k === 'w' ? 'w' : 'a', uid, it.id));
    });
    // celý set (např. Božský padlý anděl)
    if (give.set && GameData.codeSets[give.set]) GameData.codeSets[give.set](save).forEach(r => { const key = r.k + ':' + r.id; (items[key] = items[key] || { kind: r.k === 'a' ? 'skinA' : 'skinW', id: r.id, units: [] }).units.push(r.uid); });
    // speciální útoky: seznam id nebo 'all'
    if (give.skills) {
      const SK = GameData.skillsOf(save);
      const ids = give.skills === 'all' ? GameData.skills.filter(k => k.kind !== 'gold').map(k => k.id) : give.skills;
      let n = 0; ids.forEach(id => { if (GameData.skillById(id) && !SK.owned.includes(id)) { SK.owned.push(id); n++; } });
      if (give.skills === 'all') got.push({ kind: 'skills', n: ids.length });
      else ids.forEach(id => got.push({ kind: 'skill', id }));
      if (!n && give.skills === 'all') { save.gems += 1500; got.push({ kind: 'gems', n: 1500 }); }
    }
    if (give.allDecor) give = Object.assign({}, give, { decor: GameData.castleCustom.decorations.map(d => d.id) });
    if (give.bigCastle) { save.bigCastle = true; save.castleType = 'velky'; got.push({ kind: 'big' }); }
    (give.decor || []).forEach(id => { if (!save.ownedDecor.includes(id)) { save.ownedDecor.push(id); save.castleCfg.decor = save.castleCfg.decor || {}; save.castleCfg.decor[id] = true; } got.push({ kind: 'decor', id }); });
    Object.values(items).forEach(x => got.push(x));
    App.persist();
    return got;
  }
  function paintSkinItem(cv, r) {
    const uid = r.units[0], def = GameData.units[uid];
    if (r.kind === 'skinA') Art.renderUnitIcon(cv, uid, 'player', r.id, { zoom: 0.95, def: GameData.gearHelpers.drawDef(def, GameData.gearHelpers.look({ skins: { unit: { [uid]: r.id }, weapon: {} } }, uid)) });
    else { const W = GameData.weaponSkinById(r.id); const pal = Art.unitPalette('player', 'zakladni', def.faction); pal.wmodel = W.model; Art.renderWeaponIcon(cv, uid, pal); }
  }
  function rewardsModal(App, title, got, chest) {
    const item = (r, i) => {
      if (r.kind === 'gold') return `<div class="rw"><span class="rw-ico">${ico('coin')}</span><b>+${fmt(r.n)}</b><small>${t('gold')}</small></div>`;
      if (r.kind === 'gems') return `<div class="rw"><span class="rw-ico">${ico('gem')}</span><b>+${fmt(r.n)}</b><small>${t('gems')}</small></div>`;
      if (r.kind === 'skinA' || r.kind === 'skinW') {
        const S = r.kind === 'skinA' ? GameData.unitSkins.find(x => x.id === r.id) : GameData.weaponSkinById(r.id);
        const names = [...new Set(r.units.map(u => GameData.units[u].name))].join(', ');
        return `<div class="rw rw-gear" style="--rc:${GameData.rarityColors[S.rarity]}"><canvas data-rwi="${i}"></canvas><b>${esc(S.name)}</b><small>${t('skin_for_units', { u: esc(names) })}</small></div>`;
      }
      if (r.kind === 'skill') { const k = GameData.skillById(r.id); return `<div class="rw"><span class="rw-ico">${GameData.skillIcon ? GameData.skillIcon(k) : '⚡'}</span><b>${esc(k.name)}</b><small>${t('rw_skill')}</small></div>`; }
      if (r.kind === 'skills') return `<div class="rw"><span class="rw-ico">⚡</span><b>${t('rw_all_skills', { n: r.n })}</b><small>${t('rw_skill')}</small></div>`;
      if (r.kind === 'big') return `<div class="rw"><span class="rw-ico">${ico('castle')}</span><b>${t('big_name')}</b><small>${t('big_short')}</small></div>`;
      if (r.kind === 'decor') { const d = GameData.castleCustom.decorations.find(x => x.id === r.id); return `<div class="rw"><span class="rw-ico">${ico('castle')}</span><b>${esc(d.name)}</b><small>${t('decor_word')}</small></div>`; }
      return '';
    };
    App.modal(`
      ${chest ? `<div class="chest-open"><div class="chest-art ${chest}">${chestSvg(chest)}</div><div class="chest-rays"></div></div>` : ''}
      <h2 style="text-align:center">${esc(title)}</h2>
      <div class="rw-grid">${got.map(item).join('')}</div>
      <div class="modal-actions"><button class="btn btn-gold btn-big" data-close>${t('great')}</button></div>`, c => {
      c.querySelectorAll('canvas[data-rwi]').forEach(cv => paintSkinItem(cv, got[+cv.dataset.rwi]));
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
          <p class="muted">${ico('coin')} ${fmt(ch.gold[0])}–${fmt(ch.gold[1])}<br>${ch.gearChance >= 1 ? t('chest_gear_sure', { n: ch.gearCount || 1 }) : t('chest_gear_chance', { n: Math.round(ch.gearChance * 100) })}</p>
          <button class="link-btn" data-odds="${ch.id}">${t('odds')}</button>
        </div>
        <button class="btn ${used ? '' : 'btn-gold'} buy-czk" data-chest="${ch.id}" ${used ? 'disabled' : ''}>${used ? t('chest_again') : `${ico('gem')} ${fmt(ch.gemsPrice)}`}</button>
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
        <button class="btn ${sold ? '' : 'btn-green'} buy-czk" data-offer="${o.id}" ${sold ? 'disabled' : ''}>${sold ? t('bought') : Platby.price(o.czk)}</button>
      </article>`;
    }).join('');
    const DS = GameData.divineSets;
    const divCard = id => {
      const D = DS[id], own = GameData.divineOwned(save, id);
      return `<article class="panel div-card div-${id}">
        <canvas data-divcv="${id}"></canvas>
        <div class="div-body"><div class="eyebrow" style="color:${GameData.rarityColors['Božský']}">${t('rar_4')}</div>
          <h3>${esc(I18N.lang === 'cs' ? D.name : D.en)}</h3><p class="muted">${t('div_' + id + '_d')}</p>
          <p class="gear-bonus">+20 % ${t('b_dmg')} · +20 % ${t('b_hp')}</p>
          <button class="btn ${own ? '' : 'btn-green'} btn-big buy-czk" data-divbuy="${id}" ${own ? 'disabled' : ''}>${own ? '✓ ' + t('div_owned') : Platby.price(D.price.czk)}</button></div>
      </article>`;
    };
    return `
      <div class="sec-head"><h2>${t('div_title')}</h2><span class="muted">${t('div_sub')}</span></div>
      <div class="div-row">${divCard('andel')}${divCard('kral')}</div>
      <div class="sec-head"><h2>${t('chests')}</h2><span class="muted">${t('chests_sub')}</span></div>
      <div class="chest-row">${chestCard(C.denni)}${chestCard(C.tydenni)}</div>
      ${Platby.on() ? `<div class="sec-head"><h2>${t('offers')}</h2><span class="muted">${t('offers_sub')}</span></div>
      <div class="offer-grid">${offers}</div>
      ${Platby.available() ? '' : `<div class="notice"><div>${t('pay_launch')}</div></div>`}` : ''}`;
  }
  function paintDivine(cv, id) {
    const D = GameData.divineSets[id];
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createRadialGradient(w / 2, h * 0.7, 10, w / 2, h * 0.6, w * 0.7);
    g.addColorStop(0, id === 'kral' ? '#7a5a14' : '#4a0a18'); g.addColorStop(1, '#0d121c'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const GH = GameData.gearHelpers;
    ['rytir', 'samuraj', 'berserk'].forEach((u, i) => {
      const def = GameData.units[u];
      const W = D.weapons.map(x => GameData.weaponSkins.find(y => y.id === x)).find(x => GameData.weaponSkinFits(x, u));
      const fake = { skins: { unit: { [u]: D.armor }, weapon: { [u]: W ? W.id : null }, own: { [u]: [D.armor] }, ownW: { [u]: W ? [W.id] : [] } } };
      const lk = GH.look(fake, u), pal = GH.palette('player', D.armor, def.faction, lk);
      const k = h / 120 * (i === 1 ? 1.05 : 0.92);
      ctx.save(); ctx.translate(w * (0.24 + i * 0.27), h * (i === 1 ? 0.95 : 0.9)); ctx.scale(k, k);
      Art.drawUnit(ctx, GH.drawDef(def, lk), pal, { x: 0, y: 0, facing: 1, t: 1.2 + i, atk: -1 });
      ctx.restore();
    });
  }
  function bindOffers(App, el) {
    const save = ensure(App.save);
    el.querySelectorAll('canvas[data-divcv]').forEach(cv => paintDivine(cv, cv.dataset.divcv));
    el.querySelectorAll('[data-divbuy]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.divbuy, D = GameData.divineSets[id], nm = I18N.lang === 'cs' ? D.name : D.en;
      if (GameData.divineOwned(save, id)) return;
      Platby.buy(App, { id: 'set_' + id, name: nm, czk: D.price.czk }, () => {
        save.purchases[ 'set_' + id] = (save.purchases['set_' + id] || 0) + 1;
        const got = grant(App, { set: id });
        App.go('obchod', { tab: 'nabidky', keepScroll: true });
        rewardsModal(App, nm, got, 'tydenni');
      });
    }));
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
      if (save.gems < ch.gemsPrice) { App.toast(t('t_no_gems')); return; }
      (() => {
        save.gems -= ch.gemsPrice;
        save.chests[ch.id] = key;
        const r = (a, b2) => Math.round(a + Math.random() * (b2 - a));
        const give = { gold: Math.round(r(ch.gold[0], ch.gold[1]) / 10) * 10, random: [] };
        for (let i = 0; i < (ch.gearCount || 1); i++) if (Math.random() < ch.gearChance) give.random.push({ odds: ch.tierOdds });
        const got = grant(App, give);
        App.go('obchod', { keepScroll: true });
        rewardsModal(App, ch.name, got, ch.id);
      })();
    }));
    el.querySelectorAll('[data-odds]').forEach(b => b.addEventListener('click', () => {
      const ch = GameData.chests[b.dataset.odds];
      App.modal(`<h2>${esc(ch.name)} · ${t('odds')}</h2>
        <dl class="kv">
          <dt>${t('gold')}</dt><dd>${fmt(ch.gold[0])}–${fmt(ch.gold[1])}</dd>
          <dt>${t('gear_word')}</dt><dd>${ch.gearChance >= 1 ? t('chest_gear_sure', { n: ch.gearCount || 1 }) : `${Math.round(ch.gearChance * 100)} %`}</dd>
          ${ch.tierOdds.map((p, i) => p ? `<dt style="color:${GH().rarityColor[i]}">${t('rar_' + i)}</dt><dd>${Math.round(p * 1000) / 10} %</dd>` : '').join('')}
        </dl>
        <p class="muted" style="margin:0;font-size:13px">${t('odds_note')}</p>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`);
    }));
  }

  /* ---------- záložka KÓDY ---------- */
  function bodyCodes(App) {
    const save = ensure(App.save);
    const used = save.codes || [];
    return `<section class="panel code-box">
        <div class="eyebrow">${t('codes_title')}</div>
        <div class="code-row"><input id="codeIn" maxlength="300" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('codes_ph')}"><button class="btn btn-gold" id="codeGo">${t('codes_btn')}</button></div>
        <label class="itch-ok" id="codeOkRow" hidden><input type="checkbox" id="codeOk"> <span>${t('itch_consent', { link: `<a href="${Platby.terms}" target="_blank" rel="noopener">${t('itch_terms')}</a>` })}</span></label>
        <p class="muted" id="codeMsg">${t('codes_where')}</p>
      </section>
      ${used.length ? `<div class="sec-head"><h2>${t('codes_history')}</h2></div><div class="code-list">${used.slice().reverse().map(u => `<div class="code-used"><b>${esc(u.c)}</b><small>${new Date(u.at).toLocaleDateString()}</small></div>`).join('')}</div>` : ''}`;
  }
  function bindCodes(App, el) {
    const save = ensure(App.save);
    const inp = el.querySelector('#codeIn'), btn = el.querySelector('#codeGo'), msg = el.querySelector('#codeMsg');
    const isItch = v => /itch\.io|\/download\//i.test(v) || v.length > 24;
    inp.addEventListener('input', () => { if (!isItch(inp.value)) inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); el.querySelector('#codeOkRow').hidden = !isItch(inp.value); });
    const go = async () => {
      const code = inp.value.trim(); if (code.length < 3 || btn.disabled) return;
      btn.disabled = true; msg.textContent = '…';
      if (isItch(code) && !el.querySelector('#codeOk').checked) { el.querySelector('#codeOkRow').hidden = false; msg.textContent = t('itch_need_ok'); msg.classList.add('err'); btn.disabled = false; return; }
      if (isItch(code)) {
        const r = await Platby.redeemItch(App, code);
        if (r.ok) { save.codes = (save.codes || []).concat([{ c: 'itch.io: ' + r.title, at: Date.now() }]); App.persist(); App.go('obchod', { tab: 'kody', keepScroll: true }); Platby.showGot(App, r); }
        else { msg.textContent = t(r.err); msg.classList.add('err'); btn.disabled = false; }
        return;
      }
      try {
        const reward = await Ucet.redeem(code);
        save.codes = (save.codes || []).concat([{ c: code, at: Date.now() }]);
        const got = grant(App, reward || {});
        App.go('obchod', { tab: 'kody', keepScroll: true });
        rewardsModal(App, code, got, 'tydenni');
      } catch (e) {
        msg.textContent = t((e && e.code && e.code.startsWith('code_')) ? 'code_e_' + e.code.slice(5) : 'acc_e_net');
        msg.classList.add('err'); btn.disabled = false;
      }
    };
    btn.addEventListener('click', go);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  window.Shop = {
    tabs: ['nabidky', 'kody'],
    body(App, tab, opts) { return tab === 'kody' ? bodyCodes(App) : bodyOffers(App); },
    bind(App, tab, el) { if (tab === 'kody') bindCodes(App, el); else bindOffers(App, el); },
    grant, rewardsModal, ensure, bonusText, bindOffers
  };
})();
