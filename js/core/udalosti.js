/* =========================================================================
   UDÁLOSTI TÝDNE – každý týden jiná živá událost (mimo prosinec, kdy běží Vánoce)
   1. 🌕 Krvavý měsíc   – rudá noc, nepřátelé zuří (+12 % zranění), každý padlý
                          nepřítel = krvavý krystal.
   2. 🐉 Dračí invaze   – nad bojištěm přelétá drak a shazuje vejce. Klepni na vejce
                          a seber ho; když ho necháš ležet, vylíhne se dráček a spálí
                          nepřátele kolem.
   3. 💰 Zlatá horečka  – z nebe padají zlaté valouny (klepni = mince + nugety),
                          každá výhra +60 zlata navíc.
   4. 👻 Noc duchů      – přes bojiště plují bludičky; klepnutím je vysvobodíš,
                          vybuchnou duchovním světlem a omráčí nepřátele kolem.
   Žetony události → stezka 12 odměn (zlato, drahokamy, na konci trofej události
   do Síně trofejí). Denní bonus: první výhra dne +10 žetonů.
   Postup se nemaže: nevyzvednuté odměny z minulého týdne se při změně týdne
   připíšou samy, trofeje zůstávají navždy (App.save.udalosti).
   Test: localStorage['cw-udalost'] = '0'..'3' (vynutí událost), 'off' (vypne).
   ========================================================================= */
(function () {
  const G = window.GameData;
  if (!G) return;
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const ico = n => (window.ico ? window.ico(n) : '');
  const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const TAU = Math.PI * 2;

  const EVENTS = [
    { id: 'krev', art: '🌕', tok: '🔴', color: '#ff4a4a', bg: 'linear-gradient(135deg,#3a0408,#120206 60%,#2a0a10)',
      name: ['Krvavý měsíc', 'Blood Moon'], tokN: ['krvavé krystaly', 'blood crystals'],
      lore: ['Jednou za sto let vyjde nad říší rudý měsíc. Jeho světlo dohání nepřátele k zuřivosti – bijí silněji, ale z každého padlého zůstane krvavý krystal plný síly. Odvážní velitelé vyrážejí právě teď.',
        'Once a century a red moon rises over the realm. Its light drives enemies into a frenzy – they hit harder, but every fallen foe leaves a blood crystal full of power. Bold commanders march out right now.'],
      rule: ['Nepřátelé +12 % zranění · každý padlý nepřítel = 🔴', 'Enemies +12% damage · every fallen foe = 🔴'] },
    { id: 'drak', art: '🐉', tok: '🥚', color: '#ff8a2a', bg: 'linear-gradient(135deg,#3a1604,#120804 60%,#3a1a06)',
      name: ['Dračí invaze', 'Dragon Invasion'], tokN: ['dračí vejce', 'dragon eggs'],
      lore: ['Z Dračích hor přilétá matka draků a nad bojišti klade vejce. Kdo je posbírá, získá vzácné odměny. A kdo je nechá ležet? Vylíhne se dráček – a ten nepřátele rozhodně nešetří.',
        'The dragon mother flies in from the Dragon Peaks and lays eggs over the battlefields. Whoever gathers them earns rare rewards. And whoever leaves them? A hatchling emerges – and it shows enemies no mercy.'],
      rule: ['Klepni na vejce = 🥚 + mince · nesebrané vejce se vylíhne a spálí nepřátele', 'Tap an egg = 🥚 + coins · an uncollected egg hatches and burns enemies'] },
    { id: 'zlato', art: '💰', tok: '🟡', color: '#ffd24a', bg: 'linear-gradient(135deg,#3a2a04,#141004 60%,#3a2e08)',
      name: ['Zlatá horečka', 'Gold Rush'], tokN: ['zlaté valouny', 'gold nuggets'],
      lore: ['V horách našli horníci žílu tak bohatou, že zlato padá i z nebe – kupci ho shazují z balonů, aby ho dovezli dřív než konkurence. Kdo je rychlejší, ten bohatne.',
        'Miners found a vein so rich that gold is falling from the sky – merchants drop it from balloons to beat their rivals to market. The quickest get rich.'],
      rule: ['Klepni na padající zlato = 🟡 + mince · každá výhra +60 zlata navíc', 'Tap falling gold = 🟡 + coins · every win +60 extra gold'] },
    { id: 'duchove', art: '👻', tok: '💠', color: '#8fe8ff', bg: 'linear-gradient(135deg,#06243a,#04101a 60%,#0a2a3a)',
      name: ['Noc duchů', 'Night of Spirits'], tokN: ['duše', 'spirit orbs'],
      lore: ['Duše padlých hrdinů bloudí nad bojišti a hledají cestu domů. Vysvoboď je dotykem – vděčně se rozzáří a jejich světlo omráčí nepřátele kolem.',
        'The souls of fallen heroes wander above the battlefields looking for the way home. Free them with a touch – they blaze with gratitude and their light stuns nearby enemies.'],
      rule: ['Klepni na bludičku = 💠 + omráčení nepřátel kolem', 'Tap a wisp = 💠 + stuns nearby enemies'] }
  ];
  const TIERS = [10, 25, 45, 70, 100, 140, 190, 250, 320, 400, 500, 650];
  const REW = [{ gold: 500 }, { gems: 10 }, { gold: 1200 }, { gems: 20 }, { gold: 2500 }, { gems: 35 }, { gold: 4000 }, { gems: 50 }, { gold: 6000 }, { gems: 80 }, { gold: 10000 }, { gems: 150, trophy: true }];

  /* ---------- kdy a jaká událost ---------- */
  const W0 = Date.UTC(2026, 0, 5);
  function weekStart(d) { const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (new Date(t).getUTCDay() + 6) % 7; return t - wd * 864e5; }
  function current() {
    const f = ls('cw-udalost');
    if (f === 'off') return null;
    const now = new Date(), ws = weekStart(now);
    if (f == null && (now.getMonth() === 11)) return null;   // prosinec patří Vánocům
    const idx = f != null && /^[0-3]$/.test(f) ? +f : (((Math.round((ws - W0) / (7 * 864e5)) + 2) % 4) + 4) % 4;
    const endLocal = new Date(new Date(ws).getUTCFullYear(), new Date(ws).getUTCMonth(), new Date(ws).getUTCDate() + 7);
    return { ev: EVENTS[idx], idx, wk: new Date(ws).toISOString().slice(0, 10), ends: endLocal };
  }
  const leftTxt = d => { const ms = d - Date.now(); if (!(ms > 0)) return '0 h'; const dd = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4); return dd ? `${dd} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`; };
  const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  /* ---------- stav hráče ---------- */
  function state(save) {
    const c = current();
    const S = save.udalosti || (save.udalosti = { wk: null, id: null, tok: 0, got: 0, day: null, trofeje: {} });
    S.trofeje = S.trofeje || {};
    if (c && S.wk !== c.wk) {
      // nevyzvednuté odměny z minulé události se připíšou samy (nic se neztratí)
      if (S.wk && S.id) grantReached(save, S, EVENTS.find(e => e.id === S.id));
      S.wk = c.wk; S.id = c.ev.id; S.tok = 0; S.got = 0; S.day = null;
    }
    return S;
  }
  function grantReached(save, S, ev) {
    let g = 0, m = 0;
    TIERS.forEach((t, i) => { if (S.tok >= t && !(S.got & (1 << i))) { const r = REW[i]; g += r.gold || 0; m += r.gems || 0; if (r.trophy && ev) S.trofeje[ev.id] = (S.trofeje[ev.id] || 0) + 1; S.got |= 1 << i; } });
    save.gold += g; save.gems += m;
    return { gold: g, gems: m };
  }
  function addTok(save, n) { const S = state(save); S.tok += Math.max(0, n | 0); return S.tok; }
  const claimable = S => TIERS.some((t, i) => S.tok >= t && !(S.got & (1 << i)));

  /* ======================= BITVA ======================= */
  const okBattle = b => b && b.o && !b.net && !b.film && b.o.mode !== 'online' && b.o.mode !== 'pvp' && b.o.klanBoss == null && !!current() && !!(window.App && App.save);
  const PICK_R = 52;
  function init(b) {
    const c = current();
    const X = { ev: c.ev, items: [], t: 6 + Math.random() * 6, got: 0, coins: 0, flyer: null };
    b._ud = X;
    b._udDown = e => {
      if (!b._ud || !b._ud.items.length || b.over || b.paused) return;
      const w = b._toWorld ? b._toWorld(e.clientX, e.clientY) : null; if (!w) return;
      const r = Math.max(PICK_R, 44 / Math.max(0.2, b.cam.scale || 1));
      const it = b._ud.items.find(q => q.ready && Math.abs(q.x - w[0]) < r && Math.abs(q.y - 18 - w[1]) < r * 1.2);
      if (!it) return;
      e.stopImmediatePropagation(); e.preventDefault();
      collect(b, it);
    };
    b.canvas.addEventListener('pointerdown', b._udDown, true);
    return X;
  }
  function collect(b, it) {
    const X = b._ud; X.items = X.items.filter(q => q !== it);
    const me = b.side.player, coins = it.coins || 25, tok = it.tok || 2;
    me.coins = Math.min(me.maxCoins, me.coins + coins); X.got += tok; X.coins += coins;
    b.texts.push({ x: it.x, y: it.y - 50, txt: `+${tok} ${X.ev.tok}`, color: X.ev.color, t: 0, life: 1.5, big: true });
    b.texts.push({ x: it.x, y: it.y - 26, txt: `+${coins}`, color: '#ffd54f', t: 0, life: 1.1, coin: true });
    if (X.ev.id === 'duchove') {   // duchovní světlo omráčí nepřátele kolem
      b.units.filter(e => e.team === 'enemy' && !e.dead && Math.abs(e.x - it.x) < 170).forEach(e => { e.stunUntil = Math.max(e.stunUntil || 0, b.time + (e.def.boss ? 0.6 : 2)); });
      if (b.vfx) b.vfx.explosion(it.x, it.y - 10, 60, 'ice');
    } else if (b.vfx) for (let i = 0; i < 14; i++) b.vfx.spark(it.x, it.y - 14, (Math.random() - 0.5) * 220, -60 - Math.random() * 160, 0.8, 2.6, [X.ev.color, '#ffffff', '#ffd24a'][i % 3], 300);
    if (window.Zvuk) try { Zvuk.play('coin', 0.9); } catch (e) { /* nic */ }
  }
  function update(b, dt) {
    const X = b._ud || init(b), C = G.battleConfig, ev = X.ev;
    const viewTop = b.H - (b.cam.viewH || b.H), lane = () => C.laneTop + 8 + Math.random() * (C.laneBottom - C.laneTop - 16);
    const midX = () => Math.max(C.playerFront + 140, Math.min(C.enemyFront - 220, b.cam.x + b.cam.viewW * (0.3 + Math.random() * 0.45)));
    X.t -= dt;
    if (X.t <= 0 && X.items.length < 4) {
      if (ev.id === 'drak') { X.flyer = { t: 0, dur: 6, x0: b.cam.x + b.cam.viewW + 260, x1: b.cam.x - 260, dropped: false }; X.t = 20 + Math.random() * 10; }
      else if (ev.id === 'zlato') { X.items.push({ kind: 'zlato', x: midX(), y: viewTop + 40, ty: lane(), vy: 0, ready: false, t: 0, tok: 2, coins: 35 }); X.t = 12 + Math.random() * 8; }
      else if (ev.id === 'duchove') { const fromL = Math.random() < 0.5; X.items.push({ kind: 'duch', x: fromL ? b.cam.x + 60 : b.cam.x + b.cam.viewW - 60, y: lane() - 70, vx: fromL ? 38 : -38, ready: true, t: 0, tok: 3, coins: 20, ph: Math.random() * 6 }); X.t = 13 + Math.random() * 8; }
      else X.t = 999;
    }
    if (X.flyer) {
      const f = X.flyer; f.t += dt; const k = f.t / f.dur;
      f.x = f.x0 + (f.x1 - f.x0) * k; f.y = viewTop + 120 + Math.sin(f.t * 2) * 10;
      if (!f.dropped && k > 0.45) { f.dropped = true; X.items.push({ kind: 'vejce', x: Math.max(C.playerFront + 140, Math.min(C.enemyFront - 220, f.x)), y: f.y + 30, ty: lane(), ready: false, t: 0, tok: 3, coins: 30 }); }
      if (k >= 1) X.flyer = null;
    }
    for (const it of X.items) {
      it.t += dt;
      if (it.kind === 'vejce' || it.kind === 'zlato') { if (!it.ready) { it.y += (it.kind === 'zlato' ? 140 : 100) * dt; if (it.y >= it.ty) { it.y = it.ty; it.ready = true; it.t = 0; } } }
      if (it.kind === 'duch') { it.x += it.vx * dt; it.y += Math.sin(it.t * 2 + it.ph) * 12 * dt; }
    }
    // vejce, které nikdo nesebral, se vylíhne a dráček spálí nepřátele kolem
    X.items = X.items.filter(it => {
      if (it.kind === 'vejce' && it.ready && it.t > 9) {
        b.units.filter(e => e.team === 'enemy' && !e.dead && Math.abs(e.x - it.x) < 200).forEach(e => { b._damage(e, 80, null, true); e.dot = { until: b.time + 3, dps: 12, c: 'rgba(255,120,40,.45)' }; });
        if (b.vfx) b.vfx.explosion(it.x, it.y - 6, 70, 'fire');
        b.texts.push({ x: it.x, y: it.y - 60, txt: '🐲', color: '#ff8a2a', t: 0, life: 1.4, big: true });
        return false;
      }
      if (it.kind === 'zlato' && it.ready && it.t > 10) return false;
      if (it.kind === 'duch' && (it.t > 16 || it.x < b.cam.x - 80 || it.x > b.cam.x + b.cam.viewW + 80)) return false;
      return true;
    });
  }
  function drawWorld(b, ctx, t) {
    const X = b._ud; if (!X) return;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (X.flyer) {
      const f = X.flyer; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(-1, 1); ctx.font = '86px serif'; ctx.globalAlpha = 0.95; ctx.fillText('🐉', 0, 0); ctx.restore();
    }
    for (const it of X.items) {
      const bob = it.ready ? Math.sin(t * 4 + it.x) * 3 : 0;
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(it.x, (it.ty || it.y + 20) + 4, 16, 5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      // zář = vidět, že se na to dá klepnout
      if (it.ready) { const g = ctx.createRadialGradient(it.x, it.y - 18, 2, it.x, it.y - 18, 34); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, it.y - 18, 34, 0, TAU); ctx.fill(); }
      ctx.save();
      ctx.font = it.kind === 'duch' ? '40px serif' : '38px serif';
      if (it.kind === 'duch') ctx.globalAlpha = 0.75 + Math.sin(t * 5 + it.ph) * 0.2;
      if (it.kind === 'vejce' && it.ready && it.t > 6) ctx.translate(Math.sin(t * 40) * 1.6, 0);   // vejce se třese – brzy se vylíhne
      ctx.fillText(it.kind === 'vejce' ? '🥚' : it.kind === 'zlato' ? '🪙' : '👻', it.x, it.y - 18 + bob);
      ctx.restore();
    }
    ctx.restore();
  }
  function drawScreen(b, ctx) {
    const X = b._ud; if (!X || X.ev.id !== 'krev') return;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(w * 0.5, h * 0.4, h * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(120,0,10,0.06)'); g.addColorStop(1, 'rgba(70,0,8,0.32)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (window.Battle) {
    const P = Battle.prototype;
    const U0 = P.update;
    P.update = function (dt) { U0.call(this, dt); if (this.over || !okBattle(this)) return; try { update(this, dt); } catch (e) { /* nic */ } };
    const WF0 = P._drawWorldFx;
    P._drawWorldFx = function (ctx, t) { if (WF0) WF0.call(this, ctx, t); if (this._ud) try { drawWorld(this, ctx, t); } catch (e) { /* nic */ } };
    const SF0 = P._drawScreenFx;
    P._drawScreenFx = function (ctx) { if (SF0) SF0.call(this, ctx); if (this._ud) try { drawScreen(this, ctx); } catch (e) { /* nic */ } };
    const D0 = P._damage;
    P._damage = function (target, raw, from, fire) {
      if (from && from.team === 'enemy' && this._ud && this._ud.ev.id === 'krev') raw *= 1.12;
      return D0.call(this, target, raw, from, fire);
    };
    const DS0 = P.destroy;
    P.destroy = function () { if (this._udDown) { try { this.canvas.removeEventListener('pointerdown', this._udDown, true); } catch (e) { /* nic */ } this._udDown = null; } return DS0.apply(this, arguments); };
  }

  /* ======================= OKNO UDÁLOSTI ======================= */
  const Udalosti = {
    EVENTS, TIERS, current, state,
    active() { return !!current(); },
    open(App) {
      const c = current(); if (!c) return;
      const S = state(App.save), ev = c.ev, tok = S.tok, nextI = TIERS.findIndex(t => tok < t);
      const rwTxt = r => [r.gold ? `${ico('coin')} ${fmt(r.gold)}` : '', r.gems ? `${ico('gem')} ${fmt(r.gems)}` : '', r.trophy ? '🏆' : ''].filter(Boolean).join(' ');
      const troph = Object.keys(S.trofeje || {});
      App.modal(`<div class="ud" style="--ec:${ev.color};--ebg:${ev.bg}">
        <header class="ud-hero">
          <div class="ud-art">${ev.art}</div>
          <div><span class="eyebrow">${L('Událost týdne', 'Event of the week')} · ⏳ ${leftTxt(c.ends)}</span>
          <h2>${esc(L(ev.name[0], ev.name[1]))}</h2>
          <p class="ud-lore">${esc(L(ev.lore[0], ev.lore[1]))}</p>
          <div class="ud-rule">⚔️ ${esc(L(ev.rule[0], ev.rule[1]))}</div></div>
        </header>
        <div class="ud-tok"><span class="ud-tok-n">${ev.tok} <b>${fmt(tok)}</b></span><small>${esc(L(ev.tokN[0], ev.tokN[1]))}${nextI >= 0 ? ' · ' + L(`do další odměny ${TIERS[nextI] - tok}`, `${TIERS[nextI] - tok} to the next reward`) : ' · ' + L('stezka dokončena!', 'path complete!')}</small>
          ${claimable(S) ? `<button class="btn btn-gold" data-udclaim>${L('Vyzvednout odměny', 'Claim rewards')}</button>` : ''}</div>
        <ol class="ud-path">${TIERS.map((t, i) => {
          const on = tok >= t, got = !!(S.got & (1 << i)), r = REW[i];
          return `<li class="${on ? 'on' : ''} ${got ? 'got' : ''} ${r.trophy ? 'big' : ''}"><span class="ud-t">${ev.tok} ${t}</span><span class="ud-r">${rwTxt(r)}</span><i>${got ? '✓' : on ? '🎁' : '🔒'}</i></li>`;
        }).join('')}</ol>
        <div class="ud-how">
          <div><b>🏰 ${L('Jak získat', 'How to earn')} ${ev.tok}</b><span>${L('Každá bitva (mimo online souboje): sbírej na bojišti, výhra +4, prohra +1, první výhra dne +10.', 'Every battle (except online duels): collect on the battlefield, win +4, loss +1, first win of the day +10.')}</span></div>
          <div><b>🏆 ${L('Síň trofejí', 'Trophy hall')}</b><span>${troph.length ? troph.map(id => { const e = EVENTS.find(x => x.id === id); return e ? `${e.art} ${esc(L(e.name[0], e.name[1]))}${S.trofeje[id] > 1 ? ' ×' + S.trofeje[id] : ''}` : ''; }).join(' · ') : L('Dokonči stezku a získej trofej události navždy.', 'Complete the path to earn the event trophy forever.')}</span></div>
        </div>
        <div class="ud-next">${[1, 2, 3].map(d => { const e = EVENTS[(c.idx + d) % 4]; return `<span style="--ec:${e.color}">${e.art} ${esc(L(e.name[0], e.name[1]))}<small>${L('za', 'in')} ${d} ${L(d === 1 ? 'týden' : 'týdny', d === 1 ? 'week' : 'weeks')}</small></span>`; }).join('')}</div>
        <div class="ud-go"><button class="btn btn-gold btn-big" data-udgo>⚔️ ${L('Do bitvy', 'To battle')}</button><button class="btn" data-close>${L('Zavřít', 'Close')}</button></div>
      </div>`, (el, close) => {
        if (window.applyIcons) applyIcons(el);
        const cb = el.querySelector('[data-udclaim]');
        if (cb) cb.addEventListener('click', () => {
          const r = grantReached(App.save, S, ev); App.persist();
          if (window.Zvuk) try { Zvuk.play('coin', 1); } catch (e) { /* nic */ }
          App.toast(L(`Odměny události: +${fmt(r.gold)} zlata, +${fmt(r.gems)} drahokamů`, `Event rewards: +${fmt(r.gold)} gold, +${fmt(r.gems)} gems`));
          this.refreshHome(App); this.open(App);
        });
        el.querySelector('[data-udgo]').addEventListener('click', () => {
          close();
          const lv = G.campaignHelpers && G.campaignHelpers.currentLevel(App.save);
          if (lv && App.openLevel) App.openLevel(lv.id); else if (App.go) App.go('pribeh');
        });
      });
    },
    homeButton(App, el) {
      const c = current(); if (!c) return;
      const host = el.querySelector('.hero-live'); if (!host || host.querySelector('.ud-btn')) return;
      const S = state(App.save);
      const b = document.createElement('button');
      b.className = 'daily-btn ud-btn'; b.style.setProperty('--ec', c.ev.color);
      b.setAttribute('aria-label', L(c.ev.name[0], c.ev.name[1]));
      b.innerHTML = `<span class="ud-btn-art">${c.ev.art}</span><span class="daily-lbl">${L('Událost', 'Event')}</span>${claimable(S) ? '<i class="daily-dot">!</i>' : ''}`;
      b.addEventListener('click', () => this.open(App));
      host.appendChild(b);
    },
    refreshHome(App) { const b = document.querySelector('#screen .ud-btn'); if (b) { b.remove(); if (App.current === 'hrad' && !App.battle) this.homeButton(App, App.screenEl); } },
    /* po bitvě (main.js) */
    onBattleEnd(App, cfg, res) {
      const c = current();
      if (!c || !cfg || cfg.film || cfg.net || cfg.mode === 'online' || cfg.mode === 'pvp' || cfg.klanBoss != null || res.reason === 'spojeni') return null;
      const save = App.save, S = state(save), b = App.battle, X = b && b._ud;
      let tok = (X ? X.got : 0) + (res.win ? 4 : 1);
      if (c.ev.id === 'krev') tok += Math.floor((res.kills || 0) / 2);
      let bonusNote = '';
      if (res.win && S.day !== dayKey()) { S.day = dayKey(); tok += 10; bonusNote = L(' (první výhra dne +10)', ' (first win of the day +10)'); }
      const out = { rewards: [] };
      if (c.ev.id === 'zlato' && res.win) { const g = 60; save.gold += g; out.rewards.push(`<span class="pill">${ico('coin')} +${g} · ${esc(L(c.ev.name[0], c.ev.name[1]))}</span>`); }
      const before = S.tok; addTok(save, tok);
      out.rewards.push(`<span class="pill ud-pill" style="--ec:${c.ev.color}">${c.ev.tok} +${tok}${bonusNote}</span>`);
      if (TIERS.some(t => before < t && S.tok >= t)) out.note = L(`${c.ev.art} Na stezce události čeká nová odměna!`, `${c.ev.art} A new reward is waiting on the event path!`);
      return out;
    }
  };
  window.Udalosti = Udalosti;
})();
