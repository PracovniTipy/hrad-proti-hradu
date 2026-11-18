/* =========================================================================
   KLANY 2 – KLANOVÝ BOSS a VÁLKA O ŘÍŠI (rozšiřuje js/ui/klany.js)
   - Klanový boss: každý týden jiná bestie (4 v rotaci). Celý klan jí ubírá
     společné životy: každá výhra člena = 150 zranění, Nájezd na bosse
     (speciální bitva, 3× denně) = zranění, které boss v bitvě dostal.
     Fáze 25 / 50 / 75 / 100 % → odměny pro každého, kdo přispěl.
     Každý boss má slabinu (druh vojáka, který mu dává 1,6× zranění)
     a vlastní ničivý útok v bitvě.
   - Válka o říši: mapa 9 provincií. Vůdce/důstojník určí cíl, každá výhra
     člena = 1 bod vlivu. V neděli o půlnoci provincii drží klan s nejvíc
     vlivem → 40 drahokamů každému, kdo přispěl, za každou drženou provincii.
   Server: supabase/migrations/20261119010000_hra_klan_boss_valka.sql
   Na herních portálech (window.CW_PORTAL) se nic z toho neukazuje (Klany.available()).
   ========================================================================= */
(function () {
  const G = window.GameData, K = window.Klany;
  if (!G || !K) return;
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const coin = () => (window.ico ? `<i class="kl-i">${ico('coin')}</i>` : '🪙');
  const gem = () => (window.ico ? `<i class="kl-i">${ico('gem')}</i>` : '💎');
  const left = iso => { const ms = new Date(iso) - Date.now(); if (!(ms > 0)) return '0 h'; const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4); return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`; };

  /* ======================= BESTIE ======================= */
  const ROLE_N = { pech: ['pěchota', 'infantry'], strelec: ['lučištníci a střelci', 'archers'], kopi: ['kopiníci', 'spearmen'], tezka: ['těžká pěchota', 'heavy infantry'], jizda: ['jízda', 'cavalry'], mag: ['mágové', 'mages'] };
  const BOSSES = [
    { id: 'kb_pyrogor', name: ['Pyrogor, Pán popela', 'Pyrogor, Lord of Ash'], sub: ['Ohnivý tyran z Popelavých plání', 'Fire tyrant of the Ashen Plains'],
      lore: ['Probudil se pod sopkou Karrag a jeho křídla zatemnila slunce. Kudy táhne, hoří vesnice i lesy. Jeho šupiny taví meče – jen šípy dokážou proletět mezerami v jeho pancíři.',
        'He woke beneath Mount Karrag and his wings blotted out the sun. Where he marches, villages and forests burn. His scales melt swords – only arrows can slip through the gaps in his armour.'],
      weak: 'strelec', theme: 'peklo', color: '#ff7a2a', art: '🔥',
      special: ['Ohnivý déšť: každých 14 s sešle plameny na tvé vojáky.', 'Rain of Fire: every 14 s he hurls flames at your troops.'],
      pal: { skin: '#5a1a0a', tunic: '#2a0a04', metal: '#7a2a10', metalDark: '#3a0e04', fire: '#ffb02a', wing: '#4a1206', cape: '#2a0804', trim: '#ffcf4a', eyes: '#fff2a0' } },
    { id: 'kb_hrimtur', name: ['Hrimtur, Ledový obr', 'Hrimtur, the Frost Giant'], sub: ['Strážce Věčné zimy', 'Warden of the Eternal Winter'],
      lore: ['Spal tisíc let v ledovci nad fjordy. Teď sestoupil a s každým krokem zamrzají řeky. Mráz z něj vysává sílu obyčejných vojáků – jen těžká pěchota vydrží jeho chlad a rozbije led na jeho zbroji.',
        'He slept a thousand years in the glacier above the fjords. Now he has come down and rivers freeze with each step. His frost drains ordinary soldiers – only heavy infantry can endure the cold and shatter the ice on his armour.'],
      weak: 'tezka', theme: 'sever', color: '#7fd0ff', art: '❄️',
      special: ['Ledový dech: každých 14 s zmrazí tvou první linii.', 'Frost Breath: every 14 s he freezes your front line.'],
      pal: { skin: '#5a8ab0', tunic: '#16263a', metal: '#cfeeff', metalDark: '#4a7aa0', fire: '#bfeeff', wing: '#2a4a6a', cape: '#16304a', trim: '#e6f8ff', eyes: '#ffffff' } },
    { id: 'kb_morvath', name: ['Morvath, Morový chřtán', 'Morvath, the Plague Maw'], sub: ['Bestie z Hnilobných bažin', 'Beast of the Rotting Marsh'],
      lore: ['Vylezl z bažin, kde se dřív topily celé armády. Jeho dech otráví vše živé a jeho kůže se hojí rychleji, než ji meč stihne rozseknout. Kopiníci ho ale udrží na dálku a probodnou mu jedové žlázy.',
        'He crawled out of the marshes where whole armies once drowned. His breath poisons all that lives and his hide heals faster than a sword can cut. Spearmen, though, can keep him at bay and pierce his venom glands.'],
      weak: 'kopi', theme: 'evropa', color: '#9be07a', art: '☠️',
      special: ['Morový mrak: každých 14 s otráví tvé vojáky v okolí.', 'Plague Cloud: every 14 s he poisons your nearby troops.'],
      pal: { skin: '#4a6a2a', tunic: '#1a2410', metal: '#3a5a22', metalDark: '#16220c', fire: '#b8ff6a', wing: '#2a4016', cape: '#1a2a10', trim: '#c8ff6a', eyes: '#eaff9a' } },
    { id: 'kb_nyx', name: ['Nyx, Královna stínů', 'Nyx, Queen of Shadows'], sub: ['Paní Bezměsíčné noci', 'Mistress of the Moonless Night'],
      lore: ['Když zhasne měsíc, vychází z trhliny mezi světy. Její stíny se mění v bojovníky a mizí dřív, než je zasáhneš. Rychlá pěchota je ale dokáže rozprášit a dostat se až k ní.',
        'When the moon goes dark, she steps out of the rift between worlds. Her shadows become warriors and vanish before you can strike them. Swift infantry, however, can scatter them and reach her.'],
      weak: 'pech', theme: 'peklo', color: '#b98aff', art: '🌑',
      special: ['Stínové klony: každých 14 s vyvolá stínové bojovníky.', 'Shadow Clones: every 14 s she summons shadow warriors.'],
      pal: { skin: '#2a1a3a', tunic: '#120a1e', metal: '#3a2a5a', metalDark: '#140a24', fire: '#c89aff', wing: '#24143a', cape: '#1a0a2e', trim: '#d8b8ff', eyes: '#ffffff' } }
  ];
  const RAID_HP = 12000;
  (function defineBosses() {
    const base = G.units && G.units.demonkral; if (!base) return;
    BOSSES.forEach((b, i) => {
      G.units[b.id] = Object.assign({}, base, {
        id: b.id, name: L(b.name[0], b.name[1]).split(',')[0], role: L(b.sub[0], b.sub[1]), desc: L(b.lore[0], b.lore[1]), pal: b.pal,
        hp: RAID_HP, maxHp: RAID_HP, dmg: 64, cleave: 5, speed: 26, armor: 0.28,
        look: Object.assign({}, base.look, { scale: 2.15, capeColor: b.pal.cape }, i === 1 ? { wings: null, helmet: 'hellhelm', weapon: 'flamesword' } : i === 2 ? { weapon: 'trident' } : {})
      });
    });
  })();
  const bossIdx = () => { const w0 = Date.UTC(2026, 0, 5), now = new Date(), d = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()); const wd = (new Date(d).getUTCDay() + 6) % 7; return (((Math.floor((d - wd * 864e5 - w0) / (7 * 864e5))) % 4) + 4) % 4; };

  /* portrét bosse (vykreslený z jednotky) */
  function portrait(b, size) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size * 2; cv.style.width = cv.style.height = size + 'px';
    try { if (window.Art && Art.renderUnitIcon) Art.renderUnitIcon(cv, b.id, 'enemy', 'zakladni', { zoom: 0.5 }); } catch (e) { /* nic */ }
    return cv;
  }

  /* ======================= PROVINCIE ======================= */
  const PROV = [
    { n: ['Zlaté doly', 'Golden Mines'], x: 18, y: 22, ico: '⛏️' }, { n: ['Královské město', 'Royal City'], x: 50, y: 18, ico: '🏰' }, { n: ['Ledové fjordy', 'Frozen Fjords'], x: 82, y: 20, ico: '🧊' },
    { n: ['Šeptající hvozd', 'Whispering Woods'], x: 16, y: 52, ico: '🌲' }, { n: ['Srdce říše', 'Heart of the Realm'], x: 50, y: 50, ico: '👑' }, { n: ['Dračí hory', 'Dragon Peaks'], x: 84, y: 50, ico: '🐉' },
    { n: ['Rybářský přístav', 'Fishers’ Harbour'], x: 20, y: 82, ico: '⚓' }, { n: ['Pšeničné pláně', 'Wheat Plains'], x: 52, y: 82, ico: '🌾' }, { n: ['Popelavá poušť', 'Ashen Desert'], x: 82, y: 82, ico: '🏜️' }
  ];

  /* ======================= OKNO KLANU: nové karty ======================= */
  const open0 = K.open, render0 = K.render, msg0 = K._msg;
  K.open = function (App, tab) {
    open0.call(this, App, tab === 'boss' || tab === 'valka' ? 'muj' : tab);
    const nav = this._root && this._root.querySelector('.kl-tabs');
    if (nav && !nav.querySelector('[data-kt="boss"]')) {
      const mk = (id, txt) => { const b = document.createElement('button'); b.setAttribute('role', 'tab'); b.dataset.kt = id; b.innerHTML = txt; b.addEventListener('click', () => { this._tab = id; this._view = null; this.render(); }); return b; };
      const z = nav.querySelector('[data-kt="zebricek"]');
      nav.insertBefore(mk('boss', '🐉 ' + L('Boss', 'Boss')), z);
      nav.insertBefore(mk('valka', '⚔️ ' + L('Válka', 'War')), z);
    }
    if (tab === 'boss' || tab === 'valka') { this._tab = tab; this.render(); }
  };
  K.render = function (quiet) {
    const body = this._body(); if (!body) return;
    if ((this._tab === 'boss' || this._tab === 'valka') && !this._view) {
      this._setTabs();
      return this._tab === 'boss' ? renderBoss.call(this, body, quiet) : renderValka.call(this, body, quiet);
    }
    return render0.call(this, quiet);
  };
  K._msg = function (z) {
    if (z.kind === 'sys' && (z.code === 'boss' || z.code === 'raid' || z.code === 'cil')) {
      const a = esc(z.arg || ''), B = BOSSES[bossIdx()], bn = L(B.name[0], B.name[1]).split(',')[0];
      const T = {
        boss: +a >= 4 ? L(`${B.art} ${bn} padl! Celý klan si může vyzvednout kořist 🏆`, `${B.art} ${bn} has fallen! The whole clan can claim the loot 🏆`)
          : L(`${B.art} ${bn} ztratil ${a * 25} % životů! Odměna fáze ${a} je připravená 🎁`, `${B.art} ${bn} lost ${a * 25}% of his life! Phase ${a} reward is ready 🎁`),
        raid: L(`<b>${esc(z.name || '')}</b> zasadil bossovi ${fmt(+a)} zranění v jednom nájezdu! ⚔️`, `<b>${esc(z.name || '')}</b> dealt ${fmt(+a)} damage to the boss in one raid! ⚔️`),
        cil: L(`<b>${esc(z.name || '')}</b> vyhlásil útok na provincii ${PROV[+a - 1] ? PROV[+a - 1].ico + ' ' + PROV[+a - 1].n[0] : ''} 🚩`, `<b>${esc(z.name || '')}</b> ordered an attack on ${PROV[+a - 1] ? PROV[+a - 1].ico + ' ' + PROV[+a - 1].n[1] : ''} 🚩`)
      };
      return `<div class="kl-sys kl-sys-${z.code}">${T[z.code]}</div>`;
    }
    return msg0.call(this, z);
  };
  const badge0 = K.badge;
  K.badge = function (i) { return badge0.call(this, i) || !!(this._boss && this._boss.reward && (this._boss.reward.gold > 0 || this._boss.reward.gems > 0)); };

  /* ---------- karta Boss ---------- */
  async function renderBoss(body, quiet) {
    const App = this._App;
    if (!window.Ucet || !Ucet.logged() || Ucet.guest()) return this._guest(body);
    if (navigator.onLine === false) return this._offline(body);
    if (!quiet) this._loading(body);
    let s;
    try { s = this._boss = await Ucet.klan('boss'); } catch (e) { this._offline(body); return; }
    if (body !== this._body() || this._tab !== 'boss') return;
    const rw = s.reward || {};
    const claimHtml = (rw.gold > 0 || rw.gems > 0) ? `<section class="kl-card kl-claim kb-claim">
        <div class="kl-claim-ico">🏆</div>
        <div><b>${L('Kořist z bosse a války je tvoje!', 'Boss and war loot is yours!')}</b>
        <small>${(rw.items || []).map(x => x.kind === 'valka' ? L(`Válka o říši: ${x.held} provincie`, `Realm war: ${x.held} province(s)`) : x.phase === 4 ? L('Boss poražen', 'Boss defeated') : L(`Fáze ${x.phase}`, `Phase ${x.phase}`)).join(' · ')}</small></div>
        <div class="kl-claim-r">${rw.gold ? `<span class="kl-amt">${coin()} ${fmt(rw.gold)}</span>` : ''}${rw.gems ? `<span class="kl-amt">${gem()} ${fmt(rw.gems)}</span>` : ''}
        <button class="btn btn-gold" data-kbclaim>${L('Vyzvednout', 'Claim')}</button></div></section>` : '';
    if (!s.klan) {
      body.innerHTML = `<div class="kl-empty">${claimHtml}<div class="kb-teaser">${BOSSES.map(b => `<span style="--bc:${b.color}">${b.art}</span>`).join('')}</div>
        <h3>${L('Klanový boss', 'Clan boss')}</h3><p class="muted">${L('Každý týden se probudí nová bestie. Přidej se ke klanu a porazte ji společně – kořist dostane každý, kdo pomohl.', 'Every week a new beast awakens. Join a clan and defeat it together – everyone who helped gets the loot.')}</p>
        <button class="btn btn-gold" data-kt3="hledat">${L('Najít klan', 'Find a clan')}</button></div>`;
      const h = body.querySelector('[data-kt3]'); if (h) h.addEventListener('click', () => { this._tab = 'hledat'; this.render(); });
      bindClaim.call(this, body); return;
    }
    const B = BOSSES[s.boss | 0], hp = s.hp, dmg = Math.min(hp, s.dmg), pct = Math.min(100, dmg / hp * 100), dead = dmg >= hp;
    const phases = [1, 2, 3, 4].map(i => ({ i, at: i * 25, on: pct >= i * 25, rw: [[1500, 20], [2500, 30], [4000, 50], [6000, 120]][i - 1] }));
    const top = s.top || [];
    body.innerHTML = `<div class="kb" style="--bc:${B.color}">
      ${claimHtml}
      <section class="kl-card kb-hero kb-${B.id}">
        <div class="kb-art" data-kbart></div>
        <div class="kb-txt">
          <span class="eyebrow">${L('Bestie tohoto týdne', 'Beast of the week')} · ⏳ ${left(s.ends)}</span>
          <h3>${B.art} ${esc(L(B.name[0], B.name[1]))}</h3>
          <i class="kb-sub">${esc(L(B.sub[0], B.sub[1]))}</i>
          <p class="kb-lore">${esc(L(B.lore[0], B.lore[1]))}</p>
          <div class="kb-tags"><span class="kb-weak">🎯 ${L('Slabina', 'Weakness')}: <b>${esc(L(ROLE_N[B.weak][0], ROLE_N[B.weak][1]))}</b> ×1,6</span><span class="kb-spec">⚡ ${esc(L(B.special[0], B.special[1]))}</span></div>
        </div>
      </section>
      <section class="kl-card kb-hp">
        <div class="kl-sec-h"><h4>${dead ? L('Bestie padla! 🏆', 'The beast has fallen! 🏆') : L('Životy bestie', 'Beast health')}</h4><small>${fmt(Math.max(0, hp - dmg))} / ${fmt(hp)}</small></div>
        <div class="kb-bar"><div class="kb-fill" style="width:${100 - pct}%"></div>${phases.map(p => `<div class="kb-ph ${p.on ? 'on' : ''}" style="left:${100 - p.at}%"><span>${p.on ? '🎁' : '🔒'}</span><b>${100 - p.at} %</b></div>`).join('')}</div>
        <div class="kb-rws">${phases.map(p => `<div class="kb-rw ${p.on ? 'on' : ''}"><b>${p.i === 4 ? L('Poražení', 'Kill') : L(`Fáze ${p.i}`, `Phase ${p.i}`)}</b><span>${coin()} ${fmt(p.rw[0])}</span><span>${gem()} ${p.rw[1]}</span></div>`).join('')}</div>
        <p class="kl-hint">${L('Každá tvoje výhra v jakékoli bitvě = <b>150 zranění</b>. Nájezd na bosse = tolik, kolik mu v bitvě ubereš (až 12 000).', 'Each of your wins in any battle = <b>150 damage</b>. A boss raid = as much as you take from him in battle (up to 12,000).')}</p>
      </section>
      <div class="kl-grid">
        <section class="kl-card kb-raid">
          <div class="kl-sec-h"><h4>⚔️ ${L('Nájezd na bosse', 'Boss raid')}</h4><small>${L('dnes zbývá', 'left today')} ${s.raids_left}/3</small></div>
          <p class="kl-hint">${L('Vyraz s armádou přímo proti bestii. Démoní hordy ji chrání – prober se k ní a uber jí co nejvíc životů. Vyhrát nemusíš, počítá se každé zranění!', 'March your army straight at the beast. Demon hordes guard it – fight through and take as much life as you can. You do not have to win, every point of damage counts!')}</p>
          <div class="kb-mine"><span>${L('Tvoje zranění tento týden', 'Your damage this week')}<b>${fmt(s.mine)}</b></span><span>${L('Nejlepší nájezd', 'Best raid')}<b>${fmt(s.best)}</b></span></div>
          <button class="btn btn-gold btn-big" data-kbraid ${s.raids_left > 0 && !dead ? '' : 'disabled'}>${dead ? L('Bestie je poražená', 'The beast is defeated') : s.raids_left > 0 ? '⚔️ ' + L('Vyrazit na nájezd', 'Start the raid') : L('Další nájezdy zítra', 'More raids tomorrow')}</button>
        </section>
        <section class="kl-card kb-top">
          <div class="kl-sec-h"><h4>${L('Hrdinové klanu', 'Clan heroes')}</h4><small>${L('zranění', 'damage')}</small></div>
          <ol class="kl-mlist">${top.map((m, n) => `<li class="${m.mine ? 'me' : ''}"><span class="kl-pos">${n < 3 ? ['🥇', '🥈', '🥉'][n] : n + 1}</span><span class="kl-mname">${esc(m.name)}<small>${m.raids ? L(`${m.raids}× nájezd`, `${m.raids} raid(s)`) : ''}</small></span><b class="kl-mwins">${fmt(m.dmg)}</b></li>`).join('') || `<p class="muted">${L('Zatím nikdo nezaútočil. Buď první!', 'Nobody has attacked yet. Be the first!')}</p>`}</ol>
        </section>
      </div>
      <section class="kl-card kb-next"><div class="kl-sec-h"><h4>${L('Příští týdny', 'Coming weeks')}</h4></div>
        <div class="kb-cycle">${[1, 2, 3].map(d => { const N = BOSSES[((s.boss | 0) + d) % 4]; return `<div style="--bc:${N.color}"><span>${N.art}</span><b>${esc(L(N.name[0], N.name[1]).split(',')[0])}</b><small>${L('za', 'in')} ${d} ${L(d === 1 ? 'týden' : 'týdny', d === 1 ? 'week' : 'weeks')}</small></div>`; }).join('')}</div></section>
    </div>`;
    const art = body.querySelector('[data-kbart]'); if (art) art.appendChild(portrait(Object.assign({}, B, { id: B.id }), 150));
    if (window.applyIcons) applyIcons(body);
    bindClaim.call(this, body);
    const rb = body.querySelector('[data-kbraid]');
    if (rb) rb.addEventListener('click', () => { this._close(); startRaid(App, s.boss | 0); });
  }
  function bindClaim(body) {
    const App = this._App, cl = body.querySelector('[data-kbclaim]');
    if (!cl) return;
    cl.addEventListener('click', async () => {
      cl.disabled = true;
      try {
        const r = await Ucet.klan('boss_claim');
        if (r && (r.gold || r.gems)) {
          App.save.gold += r.gold | 0; App.save.gems += r.gems | 0; App.persist();
          if (window.Zvuk && Zvuk.play) try { Zvuk.play('coin', 1); } catch (e) { /* nic */ }
          App.toast(L(`Kořist vyzvednuta: +${fmt(r.gold)} zlata, +${fmt(r.gems)} drahokamů`, `Loot claimed: +${fmt(r.gold)} gold, +${fmt(r.gems)} gems`));
        }
      } catch (e) { App.toast(L('Nepodařilo se vyzvednout – zkus to znovu.', 'Could not claim – try again.')); }
      this._boss = null; this.render();
    });
  }

  /* ---------- Nájezd: bitva proti bestii ---------- */
  function startRaid(App, idx) {
    const B = BOSSES[idx], save = App.save;
    const lvl = Math.max(1, Math.min(14, G.calc.castleLevel(save)));
    App.pickArmy(pf => App.startBattle({
      playFaction: pf, mode: 'training', klanBoss: idx,
      title: L(`Nájezd: ${B.name[0].split(',')[0]}`, `Raid: ${B.name[1].split(',')[0]}`),
      difficulty: Math.min(1.7, 0.85 + lvl * 0.06), enemyUnits: G.factionUnits('demoni'), enemyFaction: 'demoni', theme: B.theme,
      enemyName: L(B.name[0], B.name[1]).split(',')[0], enemyCastleSkin: 'temna', enemyCastleLevel: Math.max(2, lvl), boss: B.id,
      tweak: b => { b.o.klanBoss = idx; if (b.bossPlan) b.bossPlan.at = 8; }
    }));
  }
  if (window.Battle) {
    const P = Battle.prototype;
    const D0 = P._damage;
    P._damage = function (target, raw, from, fire) {
      if (this.o && this.o.klanBoss != null && target && target.def && target.def.boss && from && from.def) {
        const B = BOSSES[this.o.klanBoss]; if (B && from.def.roleKey === B.weak) raw *= 1.6;
      }
      return D0.call(this, target, raw, from, fire);
    };
    const U0 = P.update;
    P.update = function (dt) {
      U0.call(this, dt);
      if (this.over || !this.o || this.o.klanBoss == null) return;
      try { bossSpecial(this, dt); } catch (e) { /* nic */ }
    };
  }
  function bossSpecial(b, dt) {
    const u = b.bossUnit; if (!u || u.dead) return;
    b._kbT = (b._kbT == null ? 9 : b._kbT) - dt; if (b._kbT > 0) return;
    b._kbT = 14;
    const idx = b.o.klanBoss, B = BOSSES[idx];
    const mine = b.units.filter(e => e.team === 'player' && !e.dead && Math.abs(e.x - u.x) < 520).sort((a, c) => Math.abs(a.x - u.x) - Math.abs(c.x - u.x)).slice(0, 10);
    b.texts.push({ x: u.x, y: u.y - 150, txt: L(B.special[0], B.special[1]).split(':')[0], color: B.color, t: 0, life: 1.8 });
    if (idx === 0) { mine.forEach((e, i) => b.later(i * 0.08, () => { if (e.dead) return; b._damage(e, 55, null); if (b.vfx) b.vfx.explosion(e.x, e.y - 10, 34, 'fire'); })); }
    else if (idx === 1) { mine.slice(0, 6).forEach(e => { b._damage(e, 30, null); e.stunUntil = Math.max(e.stunUntil || 0, b.time + 2.2); e.frozen = true; if (b.vfx) b.vfx.explosion(e.x, e.y - 10, 30, 'ice'); }); }
    else if (idx === 2) { mine.forEach(e => { e.dot = { dps: 9, until: b.time + 5, c: 'rgba(155,224,122,.8)' }; b._damage(e, 18, null); if (b.vfx) for (let i = 0; i < 4; i++) b.vfx.spark(e.x, e.y - 20, (Math.random() - 0.5) * 60, -40 - Math.random() * 40, 0.8, 3, '#9be07a', 40); }); }
    else { for (let i = 0; i < 3; i++) b.later(i * 0.25, () => { if (!b.over) try { b.spawn('enemy', 'bes', true); } catch (e) { /* nic */ } }); }
    if (b.shake != null) b.shake = Math.max(b.shake, 0.25);
    if (window.Zvuk) try { Zvuk.play(idx === 1 ? 'magic' : 'boom', 0.5); } catch (e) { /* nic */ }
  }
  /* po bitvě: zranění bosse → server */
  const end0 = K.onBattleEnd;
  K.onBattleEnd = function (App, cfg, res, goldDelta) {
    const out = end0.call(this, App, cfg, res, goldDelta) || { rewards: [] };
    if (cfg && cfg.klanBoss != null && App.battle) {
      const u = App.battle.bossUnit, dmg = u ? Math.round(Math.max(0, (u.maxHp || RAID_HP) - Math.max(0, u.hp))) : 0;
      const B = BOSSES[cfg.klanBoss];
      out.rewards.push(`<span class="pill kl-pill" style="--bc:${B.color}">${B.art} ${fmt(dmg)} ${L('zranění bossovi', 'damage to the boss')}</span>`);
      out.note = dmg >= RAID_HP ? L(`Porazil jsi ${B.name[0].split(',')[0]} v jediném nájezdu! Tvůj klan to uvidí v kronice.`, `You defeated ${B.name[1].split(',')[0]} in a single raid! Your clan will see it in the chronicle.`)
        : L('Každé zranění se počítá do společného boje klanu.', 'Every point of damage counts towards your clan’s fight.');
      Ucet.klan('boss_raid', { p_dmg: dmg }).then(() => { this._boss = null; }).catch(e => {
        App.toast(e && String(e.msg || '').includes('klan_boss_raids') ? L('Dnešní nájezdy už jsou vyčerpané.', 'No raids left today.') : L('Zranění se nepodařilo odeslat – jsi offline?', 'Could not send the damage – are you offline?'));
      });
    }
    return out;
  };

  /* ---------- karta Válka o říši ---------- */
  async function renderValka(body, quiet) {
    if (!quiet) this._loading(body);
    let v;
    try { v = await Ucet.klan('valka', {}, true); } catch (e) { this._offline(body); return; }
    if (body !== this._body() || this._tab !== 'valka') return;
    const crest = k => window.Klany && K._crestSrc ? K._crestSrc(k, 36) : '';
    const can = v.klan && (v.role === 'leader' || v.role === 'officer');
    const held = v.klan ? (v.provincie || []).filter(p => p.top[0] && p.top[0].id === v.klan).length : 0;
    body.innerHTML = `<div class="kw">
      <section class="kl-card kw-head">
        <div><span class="eyebrow">${L('Válka o říši', 'War for the Realm')} · ⏳ ${left(v.ends)}</span>
        <h3>${L('Kdo bude vládnout devíti provinciím?', 'Who will rule the nine provinces?')}</h3>
        <p class="kl-hint">${L('Každá výhra člena klanu = <b>1 bod vlivu</b> v provincii, kterou určí vůdce. V neděli o půlnoci provincii získá klan s nejvíc vlivem a každý, kdo pomáhal, dostane <b>40 drahokamů</b> za každou drženou provincii.', 'Every win by a clan member = <b>1 influence</b> in the province your leader picks. At Sunday midnight the clan with the most influence takes the province and everyone who helped gets <b>40 gems</b> per province held.')}</p></div>
        ${v.klan ? `<div class="kw-me"><b>${held}</b><small>${L('provincií teď držíte', 'provinces held now')}</small></div>` : ''}
      </section>
      <div class="kw-map">
        <svg class="kw-roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${[[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8]].map(([a, c]) => `<line x1="${PROV[a].x}" y1="${PROV[a].y}" x2="${PROV[c].x}" y2="${PROV[c].y}"/>`).join('')}</svg>
        ${(v.provincie || []).map(p => {
          const P2 = PROV[p.id - 1], own = p.top[0], mineT = v.klan && v.cil === p.id, ours = own && own.id === v.klan;
          return `<button class="kw-prov ${ours ? 'ours' : own ? 'taken' : ''} ${mineT ? 'target' : ''}" style="left:${P2.x}%;top:${P2.y}%;${own ? `--oc:${esc(own.color)}` : ''}" data-kwp="${p.id}">
            <span class="kw-ico">${P2.ico}</span><b>${esc(L(P2.n[0], P2.n[1]))}</b>
            <small>${own ? `[${esc(own.tag)}] ${fmt(own.body)}` : L('nikdo', 'nobody')}</small>
            ${mineT ? `<i class="kw-flag">🚩</i>` : ''}</button>`;
        }).join('')}
      </div>
      <section class="kl-card kw-detail" data-kwd><p class="muted">${L('Klepni na provincii pro podrobnosti.', 'Tap a province for details.')}</p></section>
    </div>`;
    const show = id => {
      const p = (v.provincie || []).find(x => x.id === id), P2 = PROV[id - 1], d = body.querySelector('[data-kwd]');
      if (!p || !d) return;
      d.innerHTML = `<div class="kl-sec-h"><h4>${P2.ico} ${esc(L(P2.n[0], P2.n[1]))}</h4>${p.last ? `<small>${L('minulý týden', 'last week')}: [${esc(p.last.tag)}] ${esc(p.last.name)}</small>` : ''}</div>
        <ol class="kl-mlist">${p.top.map((c, n) => `<li class="${c.id === v.klan ? 'me' : ''}"><span class="kl-pos">${['👑', '2', '3'][n]}</span><span class="kl-mname">[${esc(c.tag)}] ${esc(c.name)}</span><b class="kl-mwins">${fmt(c.body)}</b></li>`).join('') || `<p class="muted">${L('Provincii zatím nikdo nedobývá – snadná kořist!', 'Nobody is fighting for this province yet – easy prey!')}</p>`}</ol>
        ${v.klan ? (v.cil === id ? `<p class="kl-hint">🚩 ${L('Sem teď míří všechny výhry tvého klanu.', 'All your clan’s wins now go here.')}</p>`
          : can ? `<button class="btn btn-gold" data-kwset="${id}">🚩 ${L('Zaútočit na tuto provincii', 'Attack this province')}</button>` : `<p class="kl-hint">${L('Cíl války určuje vůdce nebo důstojník.', 'The leader or an officer picks the war target.')}</p>`) : ''}`;
      const sb = d.querySelector('[data-kwset]');
      if (sb) sb.addEventListener('click', async () => { sb.disabled = true; try { await Ucet.klan('cil', { p_prov: id }); this._App.toast(L('Klan vyrazil do války! 🚩', 'Your clan marches to war! 🚩')); } catch (e) { this._App.toast(L('Nepodařilo se – zkus to znovu.', 'Failed – try again.')); } this.render(); });
    };
    body.querySelectorAll('[data-kwp]').forEach(b => b.addEventListener('click', () => { body.querySelectorAll('.kw-prov.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); show(+b.dataset.kwp); }));
    if (v.cil) show(v.cil);
    void crest;
  }

  window.KlanyBoss = { BOSSES, PROV, bossIdx, startRaid };
})();
