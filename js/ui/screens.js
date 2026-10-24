/* =========================================================================
   OBRAZOVKY: Hrad, Příběh, Souboj (PvP), Žebříček, Skiny, Profil
   Každá obrazovka je funkce, která vykreslí HTML do #screen.
   ========================================================================= */
(function () {
  const fmt = n => Math.round(n).toLocaleString('cs-CZ');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BLD_ICONS = { hradby: 'wall', pokladnice: 'chest', kasarna: 'barracks', vez: 'tower', zbrojnice: 'armory' };

  function isUnitUnlocked(save, u) {
    if (!u.unlock) return true;
    if (u.unlock.campaign) return !!save.campaign.cleared[u.unlock.campaign];
    return true;
  }
  function stars(diff) {
    const n = Math.max(1, Math.min(5, Math.round(diff * 2.5)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  /* --------------------------------------------------------------- HRAD */
  const bgCache = {};
  function themeBg(theme) {
    if (bgCache[theme]) return bgCache[theme];
    const off = document.createElement('canvas'); off.width = 1400; off.height = 600;
    Art.drawBattleBackground(off.getContext('2d'), 1400, 600, 21, theme);
    return (bgCache[theme] = off);
  }
  function drawHomeScene(cv, save) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const F = GameData.factions[save.faction];
    const bg = themeBg(F.theme);
    // výřez pozadí: od nebe po trávu před cestou
    const srcH = 470, srcW = Math.min(1400, srcH * (w / h));
    const sx = (1400 - srcW) / 2;
    ctx.drawImage(bg, sx, 0, srcW, srcH, 0, 0, w, h);
    const level = GameData.calc.castleLevel(save);
    const img = Art.castleImage('player', save.skins.castle, level, 2, F.castleStyle);
    const s = Math.min((h * 0.8) / img.h, (w * 0.5) / img.w);
    ctx.save();
    ctx.scale(s, s);
    Art.drawCastle(ctx, img, (w / 2 + img.w * s / 2) / s, (h * 0.93) / s, 1, performance.now() / 1000, 1, F.color);
    ctx.restore();
    // stráže před hradem
    const g = F.roles;
    [[g.tezka, 0.22], [g.pech, 0.78]].forEach(([id, fx]) => {
      ctx.save(); ctx.translate(w * fx, h * 0.95); const k = h / 190; ctx.scale(k, k);
      Art.drawUnit(ctx, GameData.units[id], Art.unitPalette('player', save.skins.unit[id], save.faction), { x: 0, y: 0, facing: fx < 0.5 ? 1 : -1, t: 0, ring: true });
      ctx.restore();
    });
  }
  function paintFactionCard(cv, f, save) {
    const F = GameData.factions[f];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = themeBg(F.theme);
    const srcH = 300, srcW = srcH * (w / h);
    ctx.drawImage(bg, 700 - srcW / 2, 260, srcW, srcH, 0, 0, w, h);
    const img = Art.castleImage('player', 'kralovsky', 3, 2, F.castleStyle);
    const s = (h * 0.78) / img.h;
    ctx.save(); ctx.scale(s, s);
    Art.drawCastle(ctx, img, (w * 0.42) / s, (h * 0.86) / s, 1, 0, 1, F.color);
    ctx.restore();
    ctx.save(); ctx.translate(w * 0.72, h * 0.95); const k = h / 105; ctx.scale(k, k);
    Art.drawUnit(ctx, GameData.units[F.roles.tezka], Art.unitPalette('player', 'zakladni', f), { x: 0, y: 0, facing: -1, t: 0, ring: true });
    ctx.restore();
    ctx.save(); ctx.translate(w * 0.88, h * 0.97); const k2 = h / 120; ctx.scale(k2, k2);
    Art.drawUnit(ctx, GameData.units[F.roles.strelec], Art.unitPalette('player', 'zakladni', f), { x: 0, y: 0, facing: -1, t: 0, ring: true });
    ctx.restore();
  }

  /* Obrázek aktu ságy: krajina, hrad a hrdinové (u Aktu IV Pekelný generál) */
  function paintActCard(cv, act, locked) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ally = act.faction === 'spojenectvi';
    const F = GameData.factions[ally ? 'demoni' : act.faction];
    const bg = themeBg(F.theme);
    const srcH = 300, srcW = srcH * (w / h);
    ctx.drawImage(bg, 700 - srcW / 2, 250, srcW, srcH, 0, 0, w, h);
    const img = Art.castleImage(ally ? 'enemy' : 'player', ally ? 'temna' : 'kralovsky', 4, 2, F.castleStyle);
    const s = (h * 0.8) / img.h;
    ctx.save(); ctx.scale(s, s);
    if (ally) Art.drawCastle(ctx, img, (w * 0.62) / s, (h * 0.9) / s, -1, 0, 1, '#7a1410');
    else Art.drawCastle(ctx, img, (w * 0.4) / s, (h * 0.9) / s, 1, 0, 1, F.color);
    ctx.restore();
    const put = (id, f, team, x, k, dir) => {
      ctx.save(); ctx.translate(w * x, h * 0.97); const sc = h / k; ctx.scale(sc, sc);
      Art.drawUnit(ctx, GameData.units[id], Art.unitPalette(team, 'zakladni', f), { x: 0, y: 0, facing: dir, t: 0, ring: true });
      ctx.restore();
    };
    if (ally) {
      put('rytir', 'kralovstvi', 'player', 0.12, 118, 1); put('samuraj', 'samurajove', 'player', 0.26, 118, 1); put('berserk', 'vikingove', 'player', 0.4, 118, 1);
      put('demonkral', 'demoni', 'enemy', 0.82, 150, -1);
    } else {
      put(F.roles.tezka, act.faction, 'player', 0.72, 105, -1);
      put(F.roles.strelec, act.faction, 'player', 0.88, 120, -1);
    }
    if (locked) { ctx.fillStyle = 'rgba(8,10,16,.4)'; ctx.fillRect(0, 0, w, h); }
  }

  function orgHtml(F, save, st) {
    const node = n => {
      const u = n.unit ? GameData.units[n.unit] : null;
      const locked = u && !isUnitUnlocked(save, u);
      return `<div class="org-node panel ${n.you ? 'you' : ''} ${u ? 'has-unit' : ''}">
        ${u ? `<canvas data-orgunit="${u.id}"></canvas>` : ''}
        <div class="org-txt">
          <b>${esc(n.title)}</b>${n.you ? ` <span class="tag tag-demo">${t('you')}</span>` : ''}
          ${n.sub ? `<small>${esc(n.sub)}</small>` : ''}
          ${n.desc ? `<p>${esc(n.desc)}</p>` : (u ? `<p>${esc(u.desc)}</p>` : '')}
          ${u ? `<div class="stats"><span>${ico('coin')} ${u.cost}</span><span>${t('hp')} ${Math.round(u.hp * st.unitMult)}</span><span>${t('atk')} ${Math.round(u.dmg * st.unitMult)}</span>${locked ? `<span style="color:var(--gold-hi)">${t('locked')}</span>` : ''}</div>` : ''}
        </div>
      </div>`;
    };
    return `<div class="org">${F.organization.map(n => `
      <div class="org-row">${node(n)}</div>
      ${n.children ? `<div class="org-row org-kids">${n.children.map(node).join('')}</div>` : ''}`).join('')}</div>`;
  }

  /* Nastavení hradu hráče (znak, barvy, zapnuté a koupené dekorace) */
  function castleCfg(save) {
    const c = save.castleCfg || {};
    const decor = {};
    Object.keys(c.decor || {}).forEach(k => { if (c.decor[k] && (save.ownedDecor || []).includes(k)) decor[k] = true; });
    return { banner: c.banner || null, roof: c.roof || 'auto', emblem: c.emblem || GameData.defaultEmblem[save.faction] || 'lilie', decor, big: GameData.isBigCastle(save), small: !GameData.isBigCastle(save) };
  }

  /* ŽIVÁ SCÉNA – hrad v krajině národa: parallax, mraky, vlajky, stráže,
     hlídka na cestě a částice (lístky / sníh). Používá ji hlavní stránka
     i úprava hradu. Vrací funkci, která animaci zastaví. */
  const sceneLayers = {};
  function liveScene(cv, getState) {
    let raf = 0, t0 = performance.now(), stopped = false;
    const parts = [];
    const frame = now => {
      if (stopped || !cv.isConnected) return;
      const st = getState();
      const F = GameData.factions[st.faction];
      const theme = F.theme;
      if (!sceneLayers[theme]) sceneLayers[theme] = Art.makeLayers(1400, 600, 21, theme, 1);
      const L = sceneLayers[theme];
      const t = (now - t0) / 1000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) { raf = requestAnimationFrame(frame); return; }
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const ctx = cv.getContext('2d');
      // výřez světa: od nebe po trávu pod cestou
      // trochu z větší dálky, aby byl vidět celý hrad i se špičkami věží
      let bottom = 560;
      let top = 30;
      let sc = h / (bottom - top);
      if (w / sc > 1400) { sc = w / 1400; top = bottom - h / sc; }
      // úzká obrazovka (telefon na výšku): celý hrad se musí vejít na šířku,
      // nad krajinou pokračuje obloha
      if (w / sc < 470) { sc = w / 470; bottom = 600; top = bottom - h / sc; }
      const viewW = w / sc;
      const camX = Math.max(0, Math.min(1400 - viewW, 700 - viewW / 2 + Math.sin(t * 0.08) * Math.min(60, (1400 - viewW) / 2)));
      const k = sc * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (!L.skyTop) { const sx = L.far.getContext('2d').getImageData(4, 2, 1, 1).data; L.skyTop = `rgb(${sx[0]},${sx[1]},${sx[2]})`; }
      ctx.fillStyle = top < 0 ? L.skyTop : '#0d121c'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(k, 0, 0, k, -(camX * 0.55) * k, -top * k);
      if (top < 0) {
        // vysoká obloha nad krajinou: přechod do sytější modři a další mraky
        const sg = ctx.createLinearGradient(0, top, 0, 60);
        sg.addColorStop(0, '#1e4f9c'); sg.addColorStop(1, L.skyTop);
        ctx.fillStyle = sg; ctx.fillRect(-200, top - 10, 1900, 80 - top);
      }
      ctx.drawImage(L.far, 0, 0, 1400, 600);
      if (top < 0) {
        const fade = ctx.createLinearGradient(0, -2, 0, 150);
        fade.addColorStop(0, L.skyTop); fade.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = fade; ctx.globalAlpha = 1; ctx.fillRect(-200, -2, 1900, 152);
        ctx.restore();
        ctx.save(); ctx.translate(0, Math.max(top + 30, -260)); Art.drawClouds(ctx, L.clouds, t * 0.7 + 40, 1400); ctx.restore();
      }
      Art.drawClouds(ctx, L.clouds, t, 1400);
      ctx.setTransform(k, 0, 0, k, -camX * k, -top * k);
      ctx.drawImage(L.near, 0, 0, 1400, 600);
      // hrad
      const img = Art.castleImage('player', st.castleSkin, st.level, 2, F.castleStyle, st.cfg);
      const cs = 1.12 * (img.small ? 1 : img.big ? 0.84 : 1);
      ctx.save(); ctx.translate(885 - img.w * cs, 0); ctx.scale(cs, cs);
      Art.drawCastle(ctx, img, img.w, 492 / cs, 1, t, 1, F.color);
      if (window.App && App.save) Art.drawDefense(ctx, img, F.castleStyle, img.w, 492 / cs, 1, t, GameData.defenseOf(App.save), st.faction, 'player', null);
      ctx.restore();
      // stráže a hlídka
      const GHs = GameData.gearHelpers, sv = window.App && App.save;
      const lkOf = id => (sv ? GHs.look(sv, id) : null);
      const pal = id => sv ? GHs.palette('player', st.skins[id] || 'zakladni', st.faction, lkOf(id)) : Art.unitPalette('player', st.skins[id] || 'zakladni', st.faction);
      const dd = id => sv ? GHs.drawDef(GameData.units[id], lkOf(id)) : GameData.units[id];
      const U = GameData.units;
      const guard = (id, x, y, f) => Art.drawUnit(ctx, dd(id), pal(id), { x, y, facing: f, t, ring: false, scaleMul: 1.45, walk: 0 });
      guard(F.roles.tezka, 700 + 210, 508, -1);
      guard(F.roles.kopi, 700 - 236, 506, 1);
      // hlídka chodí po cestě sem a tam
      const span = 520, period = 26;
      const ph = (t % period) / period;
      const pos = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      const px = 700 - span / 2 + pos * span;
      Art.drawUnit(ctx, dd(F.roles.pech), pal(F.roles.pech), { x: px, y: 530, facing: ph < 0.5 ? 1 : -1, moving: true, walk: t * 7, t, ring: false, scaleMul: 1.45 });
      Art.drawUnit(ctx, dd(F.roles.strelec), pal(F.roles.strelec), { x: px - (ph < 0.5 ? 46 : -46), y: 524, facing: ph < 0.5 ? 1 : -1, moving: true, walk: t * 7 + 1.5, t, ring: false, scaleMul: 1.45 });
      // částice
      const amb = (window.ArtThemes.ambient || {})[theme];
      if (amb) {
        while (parts.length < amb.count * 0.6) parts.push({ x: camX + Math.random() * viewW, y: top + Math.random() * 300, vx: amb.vx[0] + Math.random() * (amb.vx[1] - amb.vx[0]), vy: amb.vy[0] + Math.random() * (amb.vy[1] - amb.vy[0]), s: amb.size[0] + Math.random() * (amb.size[1] - amb.size[0]), c: amb.color[Math.floor(Math.random() * amb.color.length)], r: Math.random() * 6, ph: Math.random() * 6 });
        for (const p of parts) {
          p.ph += 0.03; p.x += (p.vx + Math.sin(p.ph) * 12) / 60; p.y += p.vy / 60; p.r += 0.03;
          if (p.y > 560 || p.x < camX - 40) { p.x = camX + Math.random() * (viewW + 100); p.y = top - 10; }
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.beginPath();
          if (amb.petal) ctx.ellipse(0, 0, p.s * 1.6, p.s * 0.9, 0, 0, Math.PI * 2); else ctx.arc(0, 0, p.s, 0, Math.PI * 2);
          ctx.fill(); ctx.restore();
        }
      }
      // jemná vinětace
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const vg = ctx.createLinearGradient(0, cv.height * 0.6, 0, cv.height);
      vg.addColorStop(0, 'rgba(13,18,28,0)'); vg.addColorStop(1, 'rgba(13,18,28,.55)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, cv.width, cv.height);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }
  function sceneState(save, over) {
    return Object.assign({ faction: save.faction, castleSkin: save.skins.castle, level: GameData.calc.castleLevel(save), cfg: castleCfg(save), skins: save.skins.unit }, over || {});
  }
  function emblemCanvas(cv, id, color, bg) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || 40, h = cv.clientHeight || 40;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (bg) {
      ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.08); ctx.lineTo(w * 0.88, h * 0.08); ctx.quadraticCurveTo(w * 0.92, h * 0.62, w / 2, h * 0.95); ctx.quadraticCurveTo(w * 0.08, h * 0.62, w * 0.12, h * 0.08); ctx.closePath();
      ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#e8b84a'; ctx.stroke();
    }
    Art.drawEmblem(ctx, id, w / 2, h * (bg ? 0.46 : 0.5), Math.min(w, h) * (bg ? 0.27 : 0.38), color);
  }

  /* ---------- OBRANA HRADU (ve Vylepšení) ---------- */
  function defenseHtml(save) {
    const D = GameData.defense, d = save.defense || {}, vez = save.buildings.vez || 0;
    const def = GameData.defenseOf(save);
    const n = def.slots.length;
    const owned = k => k === 'lucistnik' || (d.ownedKinds || []).includes(k);
    const price = p => p.gems ? `${ico('gem')} ${fmt(p.gems)}` : `${ico('coin')} ${fmt(p.gold)}`;
    const slot = i => {
      if (i >= n) return `<article class="panel def-slot locked"><div class="def-lock">${ico('lock')}</div><b>${t('def_slot', { n: i + 1 })}</b><small>${t('def_unlock_at', { n: D.unlockAt(i, GameData.isBigCastle(save)) })}</small></article>`;
      const sl = def.slots[i];
      const kinds = ['lucistnik', 'kuse', 'katapult'].map(k => {
        const K = D.kinds[k];
        const lockedLvl = k === 'katapult' && vez < D.catapultFrom;
        const on = sl.kind === k;
        return `<button class="def-kind ${on ? 'on' : ''}" data-dslot="${i}" data-dkind="${k}" ${lockedLvl ? 'disabled' : ''}>
          <span>${t('def_' + k)}</span>
          <small>${lockedLvl ? `${ico('lock')} ${t('def_from_lvl', { n: D.catapultFrom })}` : owned(k) ? (on ? t('in_use') : t('use')) : price(K.price)}</small>
        </button>`;
      }).join('');
      const els = sl.kind === 'katapult' ? `<div class="def-els">${GameData.catapult.elements.map(e => {
        const ownedEl = (d.ownedEl || ['ohen']).includes(e.id);
        return `<button class="def-el ${sl.el === e.id ? 'on' : ''}" style="--ec:${e.color}" data-dslot="${i}" data-del="${e.id}" title="${esc(e.desc)}"><i></i><span>${esc(e.name)}</span><small>${ownedEl ? '' : price(e.price)}</small></button>`;
      }).join('')}</div>` : '';
      return `<article class="panel def-slot"><canvas data-defcv="${i}"></canvas><b>${t('def_slot', { n: i + 1 })}</b><div class="def-kinds">${kinds}</div>${els}</article>`;
    };
    const catOn = def.slots.some(s => s.kind === 'katapult');
    const cl = d.catLvl || 1, cmax = GameData.catapult.maxLevel;
    return `
      <div class="sec-head"><h2>${t('def_title')}</h2><span class="muted">${t('def_sub', { n, m: D.maxFor(save) })}</span></div>
      <p class="muted" style="margin:-6px 0 0;font-size:14px">${t('def_note', { n: D.catapultFrom })}${GameData.isBigCastle(save) ? '' : ` <a href="#" data-gobig class="big-link">${t('big_more')}</a>`}</p>
      <div class="def-grid">${Array.from({ length: D.maxFor(save) }, (_, i) => slot(i)).join('')}</div>
      ${catOn ? `<section class="panel def-cat"><div><b>${t('def_katapult')} · ${t('level_of', { a: cl, b: cmax })}</b><small class="muted">${t('def_dmg', { n: GameData.defense.kinds.katapult.dmg(cl) })}</small></div>
        <button class="btn btn-gold btn-sm" data-catup ${cl >= cmax || save.gold < GameData.catapult.upgradeCost(cl) ? 'disabled' : ''}>${cl >= cmax ? t('max_level') : `${t('upgrade')} · ${ico('coin')} ${fmt(GameData.catapult.upgradeCost(cl))}`}</button></section>` : ''}`;
  }
  function bindDefense(App, el) {
    const save = App.save;
    const d = save.defense || (save.defense = {});
    d.slots = d.slots || []; d.slotEl = d.slotEl || []; d.ownedKinds = d.ownedKinds || []; d.ownedEl = d.ownedEl || ['ohen'];
    const def = GameData.defenseOf(save);
    const F = GameData.factions[save.faction];
    el.querySelectorAll('canvas[data-defcv]').forEach(cv => {
      const i = +cv.dataset.defcv, sl = def.slots[i];
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createRadialGradient(w / 2, h * 0.8, 4, w / 2, h * 0.7, w * 0.7);
      g.addColorStop(0, sl.kind === 'katapult' ? GameData.catapultEl(sl.el).color + '66' : '#4a5a7866'); g.addColorStop(1, '#0d121c'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const one = { slots: [sl], vez: def.vez, catLvl: def.catLvl };
      const fake = { w: 320, h: 380 };
      // vykresli obránce do středu náhledu
      const s = h / (sl.kind === 'katapult' ? 70 : 92);
      ctx.save(); ctx.translate(w / 2, h - 6); ctx.scale(s, s);
      if (sl.kind === 'katapult') Art.drawCatapult(ctx, 0, 0, 1, 0, sl.el, 1, true);
      else Art.drawDefense(ctx, fake, 'evropa', fake.w - 2 - 258, 380 - 196, 1, 0, one, F.id, 'player', null);
      ctx.restore();
    });
    const pay = (p, done) => {
      if (p.gems) { if (save.gems < p.gems) { App.toast(t('not_enough')); return; } save.gems -= p.gems; }
      else if (p.gold) { if (save.gold < p.gold) { App.toast(t('not_enough')); return; } save.gold -= p.gold; }
      done();
    };
    el.querySelectorAll('[data-dkind]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.dslot, k = b.dataset.dkind;
      const set = () => { d.slots[i] = k; App.persist(); App.go('sprava', { keepScroll: true }); };
      if (k === 'lucistnik' || d.ownedKinds.includes(k)) return set();
      pay(GameData.defense.kinds[k].price, () => { d.ownedKinds.push(k); App.toast(t('t_bought', { name: t('def_' + k) })); set(); });
    }));
    const gb = el.querySelector('[data-gobig]');
    if (gb) gb.addEventListener('click', e => { e.preventDefault(); App.go('obchod', { tab: 'hrady' }); });
    el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.dslot, id = b.dataset.del, E = GameData.catapultEl(id);
      const set = () => { d.slotEl[i] = id; App.persist(); App.go('sprava', { keepScroll: true }); };
      if (d.ownedEl.includes(id)) return set();
      pay(E.price, () => { d.ownedEl.push(id); App.toast(t('t_bought', { name: E.name })); set(); });
    }));
    const up = el.querySelector('[data-catup]');
    if (up) up.addEventListener('click', () => {
      const cl = d.catLvl || 1, cost = GameData.catapult.upgradeCost(cl);
      if (cl >= GameData.catapult.maxLevel || save.gold < cost) return;
      save.gold -= cost; d.catLvl = cl + 1; App.persist(); App.go('sprava', { keepScroll: true });
    });
  }

  /* HRAD = jen živá scéna přes celou obrazovku (první, co hráč po spuštění uvidí).
     SPRÁVA = pokračování příběhu, sága, vylepšení hradu a organizace armády. */
  function screenSprava(App, opts = {}) { return screenHrad(App, Object.assign({}, opts, { sprava: true })); }
  function screenHrad(App, opts = {}) {
    const sprava = !!opts.sprava;
    const save = App.save;
    const F = GameData.factions[save.faction];
    const lvl = GameData.calc.castleLevel(save);
    const cur = GameData.campaignHelpers.currentLevel(save);
    const st = GameData.calc.battleStats(save);
    const cfg = castleCfg(save);
    const R = GameData.pvpRules;
    const attacksLeft = (save.pvp.opponents || []).reduce((a, id) => a + Math.max(0, R.maxAttacks - (save.pvp.attacks[id] || []).length), 0);
    const el = App.screenEl;
    el.innerHTML = sprava ? '' : `
      <div class="scr scr-home">
        <section class="hero-live">
          <canvas id="homeCv" aria-label="Tvůj hrad v krajině"></canvas>
          <div class="hero-badge">
            <canvas class="crest" id="crestCv"></canvas>
            <div>
              <div class="eyebrow">${esc(F.people)}</div>
              <h1>${esc(save.name)}</h1>
              <div class="lvl">${t('castle_level', { n: lvl })}</div>
            </div>
          </div>
          <button class="btn btn-sm hero-edit" data-go="stavitel">${ico('brush')} ${t('edit_castle')}</button>
          <button class="daily-btn" id="dailyBtn" aria-label="${t('daily_title')}">
            <span class="daily-chest">${Icons.navObchod ? '' : ''}<svg viewBox="0 0 120 100"><path d="M14 46h92v40a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="#8a5a32" stroke="#1a0e06" stroke-width="4"/><path d="M14 46c0-20 20-30 46-30s46 10 46 30z" fill="#5a3a1e" stroke="#1a0e06" stroke-width="4"/><path d="M14 46h92" stroke="#ffd77a" stroke-width="7"/><path d="M30 18v74M90 18v74" stroke="#ffd77a" stroke-width="7"/><rect x="49" y="39" width="22" height="24" rx="3" fill="#ffd77a" stroke="#1a0e06" stroke-width="3"/></svg></span>
            <span class="daily-lbl">${t('daily_short')}</span>
            ${Denni.available(save) ? '<i class="daily-dot">!</i>' : ''}
          </button>
        </section>
      </div>`;
    if (!sprava) {
      el.classList.add('home-mode');
      App._stopLive = liveScene(el.querySelector('#homeCv'), () => sceneState(save));
      emblemCanvas(el.querySelector('#crestCv'), cfg.emblem, '#f2c94c', cfg.banner || F.color);
      el.querySelector('#dailyBtn').addEventListener('click', () => Denni.open(App));
      return;
    }
    el.innerHTML = `
      <div class="scr">
        <div class="sec-head"><h1>${t('nav_sprava')}</h1><span class="muted">${t('castle_level', { n: lvl })}</span></div>
        <div class="act-grid">
          ${cur ? `<button class="act act-main" data-act="story">
              <span class="act-ico">${ico('swords')}</span>
              <span><b>${t('continue_story')}</b><small>${cur.label} · ${esc(cur.name)}</small></span>
            </button>` : `<button class="act act-main" data-go="pribeh"><span class="act-ico">${ico('map')}</span><span><b>${t('story_done')}</b><small>${t('replay_levels')}</small></span></button>`}
          <button class="act" data-act="training"><span class="act-ico">${ico('helmet')}</span><span><b>${t('training')}</b><small>${t('quick_battle')}</small></span></button>
          <button class="act" data-go="pvp"><span class="act-ico">${ico('trophy')}</span><span><b>${t('nav_pvp')}</b><small>${attacksLeft ? t('attacks_left', { n: attacksLeft }) : t('attacks_none')}</small></span></button>
          <button class="act" data-go="obchod"><span class="act-ico">${ico('shop')}</span><span><b>${t('nav_obchod')}</b><small>${t('shop_sub')}</small></span></button>
        </div>

        <div class="sec-head"><h2>${t('saga_title')}</h2><span class="muted">${t('saga_sub')}</span></div>
        <div class="saga-strip">
          ${GameData.saga.map((x, i) => {
            const H = GameData.campaignHelpers;
            const un = H.actUnlocked(save, x.id), done = H.actDone(save, x.id), here = H.currentAct(save) === x.id && !done;
            const p = H.progress(save, x.id);
            const nm = x.faction === 'spojenectvi' ? t('saga_finale') : GameData.factions[x.faction].name;
            const state = done ? `${ico('crown')} ${t('saga_done')}` : here ? t('saga_now') : un ? t('completed_of', { a: p.done, b: p.total }) : `${ico('lock')} ${t('saga_locked')}`;
            return `${i ? '<div class="saga-arrow" aria-hidden="true">➜</div>' : ''}
            <button class="saga-act ${done ? 'done' : ''} ${here ? 'here' : ''} ${un ? '' : 'locked'}" data-saga="${x.id}" ${un ? '' : 'aria-disabled="true"'}>
              <canvas data-actcv="${x.id}"></canvas>
              <span class="saga-num">${t('act_n', { n: x.n })}</span>
              <span class="saga-nm">${esc(nm)}</span>
              <span class="saga-st">${state}</span>
              <span class="saga-bar"><i style="width:${p.done / p.total * 100}%"></i></span>
            </button>`;
          }).join('')}
        </div>

        <div class="sec-head"><h2>${t('upgrades')}</h2><span class="muted">${t('upgrades_sub')}</span></div>
        <div class="grid-cards">
          ${GameData.buildings.map(b => {
            const l = save.buildings[b.id] || 0;
            const max = l >= b.maxLevel;
            const cost = GameData.calc.buildingCost(b, l);
            return `<article class="panel bld">
              <div class="bld-ico">${ico(BLD_ICONS[b.id])}</div>
              <div><h3>${b.name}</h3><div class="lv">${t('level_of', { a: l, b: b.maxLevel })}</div><p>${b.desc}</p></div>
              <div class="lvbar"><i style="width:${(l / b.maxLevel) * 100}%"></i></div>
              <div class="eff"><b>${GameData.calc.effectText(b.id, l)}</b>${max ? '' : `<span class="arrow">→</span><span>${GameData.calc.effectText(b.id, l + 1)}</span>`}</div>
              <button class="btn ${max ? '' : 'btn-gold'}" data-up="${b.id}" ${max || save.gold < cost ? 'disabled' : ''}>
                ${max ? t('max_level') : `${t('upgrade')} · ${ico('coin')} ${fmt(cost)}`}
              </button>
            </article>`;
          }).join('')}
        </div>

        ${defenseHtml(save)}

        <div class="sec-head"><h2>${t('organization')}</h2><span class="muted">${esc(F.name)} · ${t('army_power', { n: Math.round((st.unitMult - 1) * 100) })}</span></div>
        ${orgHtml(F, save, st)}
      </div>`;
    el.querySelectorAll('canvas[data-actcv]').forEach(c => { const a = GameData.campaignHelpers.act(c.dataset.actcv); paintActCard(c, a, !GameData.campaignHelpers.actUnlocked(save, a.id)); });
    el.querySelectorAll('[data-saga]').forEach(b => b.addEventListener('click', () => {
      if (!GameData.campaignHelpers.actUnlocked(save, b.dataset.saga)) { App.toast(t('t_nation_locked')); return; }
      App.go('pribeh', { act: b.dataset.saga });
    }));
    el.querySelectorAll('canvas[data-orgunit]').forEach(c => Art.renderUnitIcon(c, c.dataset.orgunit, 'player', save.skins.unit[c.dataset.orgunit]));
    el.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => {
      const bd = GameData.buildings.find(x => x.id === b.dataset.up);
      const l = save.buildings[bd.id] || 0;
      const cost = GameData.calc.buildingCost(bd, l);
      if (save.gold < cost || l >= bd.maxLevel) return;
      save.gold -= cost;
      save.buildings[bd.id] = l + 1;
      App.persist();
      App.toast(t('t_upgraded', { name: bd.name, n: l + 1 }));
      App.go('sprava', { keepScroll: true });
    }));
    bindDefense(App, el);
    const story = el.querySelector('[data-act="story"]');
    if (story) story.addEventListener('click', () => App.openLevel(cur.id));
    el.querySelector('[data-act="training"]').addEventListener('click', () => App.startTraining());
  }

  /* --------------------------------------------------------------- ÚPRAVA HRADU */
  function screenStavitel(App) {
    const save = App.save;
    const F = GameData.factions[save.faction];
    const CC = GameData.castleCustom;
    const c = save.castleCfg;
    const cfg = castleCfg(save);
    const el = App.screenEl;
    const sw = (group, items, current) => items.map(it => `<button class="swatch ${it.id === current ? 'on' : ''}" data-${group}="${it.id}" title="${esc(it.name)}" aria-label="${esc(it.name)}" aria-pressed="${it.id === current}" style="--c:${it.id === 'auto' ? 'transparent' : it.id}">${it.id === 'auto' ? t('auto') : ''}</button>`).join('');
    el.innerHTML = `
      <div class="scr">
        <div class="sec-head"><h1>${t('editor')}</h1><button class="btn btn-sm" data-go="hrad">${t('done')}</button></div>
        <section class="hero-live small"><canvas id="buildCv" aria-label="Náhled hradu"></canvas></section>
        <div class="build-grid">
          <section class="panel opt">
            <h3>${t('banner_color')}</h3>
            <div class="swatches">${sw('banner', CC.colors, c.banner || F.color)}</div>
          </section>
          <section class="panel opt">
            <h3>${t('emblem')}</h3>
            <div class="emblems">${CC.emblems.map(e => `<button class="emb ${e.id === cfg.emblem ? 'on' : ''}" data-emblem="${e.id}" aria-pressed="${e.id === cfg.emblem}"><canvas data-embcv="${e.id}"></canvas><span>${esc(e.name)}</span></button>`).join('')}</div>
          </section>
          <section class="panel opt">
            <h3>${t('roof_color')}</h3>
            <div class="swatches">${sw('roof', CC.roofs, c.roof || 'auto')}</div>
          </section>
          <section class="panel opt">
            <h3>${t('castle_look')}</h3>
            <div class="mats">${GameData.castleSkins.map(s => {
              const owned = save.skins.ownedCastle.includes(s.id);
              const on = save.skins.castle === s.id;
              return `<button class="mat ${on ? 'on' : ''}" data-mat="${s.id}" ${owned ? '' : 'data-locked="1"'}><canvas data-matcv="${s.id}"></canvas><span>${esc(s.name)}</span>${owned ? '' : `<small>${ico('gem')} ${s.price}</small>`}</button>`;
            }).join('')}</div>
          </section>
          <section class="panel opt wide">
            <h3>${t('decorations')}</h3>
            <div class="decor">${CC.decorations.map(d => {
              const owned = (save.ownedDecor || []).includes(d.id);
              const on = owned && c.decor && c.decor[d.id];
              return `<div class="dec-row">
                <div><b>${esc(d.name)}</b><small>${esc(d.desc)}</small></div>
                ${owned ? `<button class="toggle ${on ? 'on' : ''}" data-decor="${d.id}" aria-pressed="${!!on}"><i></i>${on ? t('on') : t('off')}</button>`
                  : `<button class="btn btn-sm btn-gold" data-buydecor="${d.id}" ${save.gold < d.price ? 'disabled' : ''}>${ico('coin')} ${fmt(d.price)}</button>`}
              </div>`;
            }).join('')}</div>
          </section>
        </div>
      </div>`;
    App._stopLive = liveScene(el.querySelector('#buildCv'), () => sceneState(save));
    el.querySelectorAll('canvas[data-embcv]').forEach(cv => emblemCanvas(cv, cv.dataset.embcv, '#f2c94c', c.banner || F.color));
    el.querySelectorAll('canvas[data-matcv]').forEach(cv => Art.renderCastleIcon(cv, 'player', cv.dataset.matcv, 3, F.castleStyle));
    const redo = () => { App.persist(); App.go('stavitel', { keepScroll: true }); };
    el.querySelectorAll('[data-banner]').forEach(b => b.addEventListener('click', () => { c.banner = b.dataset.banner; redo(); }));
    el.querySelectorAll('[data-roof]').forEach(b => b.addEventListener('click', () => { c.roof = b.dataset.roof; redo(); }));
    el.querySelectorAll('[data-emblem]').forEach(b => b.addEventListener('click', () => { c.emblem = b.dataset.emblem; redo(); }));
    el.querySelectorAll('[data-mat]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.locked) { App.toast(t('buy_first')); App.go('obchod', { tab: 'hrady' }); return; }
      save.skins.castle = b.dataset.mat; redo();
    }));
    el.querySelectorAll('[data-decor]').forEach(b => b.addEventListener('click', () => { c.decor = c.decor || {}; c.decor[b.dataset.decor] = !c.decor[b.dataset.decor]; redo(); }));
    el.querySelectorAll('[data-buydecor]').forEach(b => b.addEventListener('click', () => {
      const d = CC.decorations.find(x => x.id === b.dataset.buydecor);
      if (save.gold < d.price) return;
      save.gold -= d.price; save.ownedDecor.push(d.id); c.decor = c.decor || {}; c.decor[d.id] = true;
      App.toast(t('t_bought', { name: d.name })); redo();
    }));
  }

  /* --------------------------------------------------------------- OBCHOD */
  function dayIndex() { const d = new Date(); return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); }
  function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
  function dealOfDay(save) {
    const pool = GameData.unitSkins.filter(s => s.price > 0 && !save.skins.ownedUnit.includes(s.id));
    if (!pool.length) return null;
    const s = pool[dayIndex() % pool.length];
    return { skin: s, price: Math.round(s.price * 0.7) };
  }
  function screenObchod(App, opts = {}) {
    const save = App.save;
    const F = GameData.factions[save.faction];
    const tab = opts.tab || App.shopTab || 'nabidky';
    App.shopTab = tab;
    const fUnits = GameData.factionUnits(save.faction);
    let unitSel = opts.unit || App.skinUnit;
    if (!fUnits.includes(unitSel)) unitSel = fUnits[3];
    App.skinUnit = unitSel;
    const deal = dealOfDay(save);
    const rarClass = r => ({ 'Základní': 'r0', 'Vzácný': 'r1', 'Epický': 'r2', 'Legendární': 'r3' }[r] || 'r0');
    const rar = r => `<span class="rar" style="color:${GameData.rarityColors[r]}">${t('rar_' + ['Základní', 'Vzácný', 'Epický', 'Legendární'].indexOf(r))}</span>`;
    let body = '';
    if (Shop.tabs.includes(tab)) {
      body = Shop.body(App, tab, opts);
    } else if (tab === 'vojaci') {
      body = `
        <div class="chips" role="tablist">
          ${fUnits.map(id => `<button class="chip" role="tab" data-sel="${id}" aria-selected="${id === unitSel}"><canvas data-chip="${id}"></canvas>${GameData.units[id].name}</button>`).join('')}
        </div>
        <section class="panel skin-preview"><canvas id="skinPrev" aria-label="Náhled jednotky"></canvas></section>
        <div class="skin-grid">
          ${GameData.unitSkins.filter(s => (!s.exclusive || save.skins.ownedUnit.includes(s.id)) && GameData.skinFits(s, unitSel))
            .sort((a, b) => (b.only ? 1 : 0) - (a.only ? 1 : 0)).map(s => {
            const owned = save.skins.ownedUnit.includes(s.id);
            const onlyFor = s.exclusive && save.loyalSkinUnit && save.loyalSkinUnit !== unitSel ? save.loyalSkinUnit : null;
            const eq = save.skins.unit[unitSel] === s.id;
            const price = deal && deal.skin.id === s.id ? deal.price : s.price;
            return `<article class="panel skin ${rarClass(s.rarity)} ${eq ? 'equipped' : ''} ${s.only ? 'nat' : ''}">
              ${s.only ? `<span class="skin-tag">${s.mount ? t('skin_mount') : t('skin_nation')}</span>` : ''}
              <canvas data-skinunit="${s.id}"></canvas>
              <h3>${s.name}</h3>${rar(s.rarity)}<p>${s.desc}</p>
              ${s.bonus ? `<p class="gear-bonus">${Shop.bonusText(s.bonus)}</p>` : ''}
              ${eq ? `<button class="btn btn-sm" disabled>${t('in_use')}</button>`
                : onlyFor ? `<button class="btn btn-sm" disabled>${t('only_for', { name: esc(GameData.units[onlyFor].name) })}</button>`
                : owned ? `<button class="btn btn-sm btn-blue" data-equip="${s.id}">${t('use')}</button>`
                : s.czk ? `<button class="btn btn-sm btn-green" data-skinczk="${s.id}">${s.czk} Kč</button>`
                : `<button class="btn btn-sm btn-gold" data-buy="${s.id}" data-price="${price}" ${save.gems < price ? 'disabled' : ''}>${t('buy')} ${ico('gem')} ${price}</button>`}
            </article>`;
          }).join('')}
        </div>
        <button class="btn" id="equipAll">${t('equip_all')}</button>
        <div class="sec-head" style="margin-top:18px"><h2>${t('weapon_skins')}</h2><span class="muted">${esc(GameData.units[unitSel].name)}</span></div>
        <div class="skin-grid">
          ${GameData.weaponSkins.filter(w => w.roles.includes(GameData.units[unitSel].roleKey)).map(w => {
            const ownedW = (save.skins.ownedWeapon || ['w_zakladni']).includes(w.id) || w.id === 'w_zakladni';
            const eqW = ((save.skins.weapon || {})[unitSel] || 'w_zakladni') === w.id;
            return `<article class="panel skin ${rarClass(w.rarity)} ${eqW ? 'equipped' : ''}">
              <canvas data-wskin="${w.id}"></canvas>
              <h3>${esc(w.name)}</h3>${rar(w.rarity)}${w.desc ? `<p>${esc(w.desc)}</p>` : ''}
              ${w.bonus ? `<p class="gear-bonus">${Shop.bonusText(w.bonus)}</p>` : ''}
              ${eqW ? `<button class="btn btn-sm" disabled>${t('in_use')}</button>`
                : ownedW ? `<button class="btn btn-sm btn-blue" data-wequip="${w.id}">${t('use')}</button>`
                : w.czk ? `<button class="btn btn-sm btn-green" data-wczk="${w.id}">${w.czk} Kč</button>`
                : `<button class="btn btn-sm btn-gold" data-wbuy="${w.id}" ${save.gems < w.price ? 'disabled' : ''}>${t('buy')} ${ico('gem')} ${w.price}</button>`}
            </article>`;
          }).join('')}
        </div>`;
    } else if (tab === 'hrady') {
      const big = save.bigCastle, useBig = GameData.isBigCastle(save);
      body = `<div class="sec-head"><h2>${t('castle_types')}</h2></div>
        <div class="ctype-grid">
        <section class="panel big-offer small ${!useBig ? 'owned' : ''}">
          <canvas id="smallCv"></canvas>
          <div class="big-txt"><div class="eyebrow">${t('small_eyebrow')}</div><h3>${t('small_name')}</h3><p>${t('small_desc')}</p>
            ${!useBig ? `<button class="btn btn-sm" disabled>✓ ${t('in_use')}</button>` : `<button class="btn btn-blue" data-ctype="maly">${t('use')}</button>`}</div>
        </section>
        <section class="panel big-offer ${useBig ? 'owned' : ''}">
          <canvas id="bigCv"></canvas>
          <div class="big-txt"><div class="eyebrow">${t('big_eyebrow')}</div><h3>${t('big_name')}</h3><p>${t('big_desc')}</p>
            ${useBig ? `<button class="btn btn-sm" disabled>✓ ${t('in_use')}</button>` : big ? `<button class="btn btn-blue" data-ctype="velky">${t('use')}</button>` : `<button class="btn btn-gold" data-offer="pevnost">${t('buy')} · 149 Kč</button>`}</div>
        </section>
        </div>
        <div class="sec-head"><h2>${t('castle_looks')}</h2></div>
        <div class="skin-grid">
          ${GameData.castleSkins.map(s => {
            const owned = save.skins.ownedCastle.includes(s.id);
            const eq = save.skins.castle === s.id;
            return `<article class="panel skin castle ${rarClass(s.rarity)} ${eq ? 'equipped' : ''}">
              <canvas data-skincastle="${s.id}"></canvas>
              <h3>${s.name}</h3>${rar(s.rarity)}<p>${s.desc}</p>
              ${eq ? `<button class="btn btn-sm" disabled>${t('in_use')}</button>`
                : owned ? `<button class="btn btn-sm btn-blue" data-cequip="${s.id}">${t('use')}</button>`
                : `<button class="btn btn-sm btn-gold" data-cbuy="${s.id}" ${save.gems < s.price ? 'disabled' : ''}>${t('buy')} ${ico('gem')} ${s.price}</button>`}
            </article>`;
          }).join('')}
        </div>`;
    } else if (tab === 'dekorace') {
      body = `<div class="skin-grid">
          ${GameData.castleCustom.decorations.map(d => {
            const owned = (save.ownedDecor || []).includes(d.id);
            return `<article class="panel skin castle r1 ${owned ? 'equipped' : ''}">
              <canvas data-deccv="${d.id}"></canvas>
              <h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p>
              ${owned ? `<button class="btn btn-sm btn-blue" data-go="stavitel">${t('set_in_editor')}</button>`
                : `<button class="btn btn-sm btn-gold" data-dbuy="${d.id}" ${save.gold < d.price ? 'disabled' : ''}>${t('buy')} ${ico('coin')} ${fmt(d.price)}</button>`}
            </article>`;
          }).join('')}
        </div>`;
    } else {
      const G = GameData.gemOffers;
      const claimed = save.lastDaily === todayKey();
      body = `
        <section class="panel daily">
          <div><div class="eyebrow">${t('daily')}</div><h3>${ico('gem')} ${G.daily.gems} &nbsp; ${ico('coin')} ${G.daily.gold}</h3><p class="muted">${t('daily_once')}</p></div>
          <button class="btn ${claimed ? '' : 'btn-green'} btn-big" id="daily" ${claimed ? 'disabled' : ''}>${claimed ? t('claimed') : t('claim')}</button>
        </section>
        <div class="sec-head"><h2>${t('exchange')}</h2><span class="muted">${t('exchange_sub')}</span></div>
        <div class="skin-grid">
          ${G.exchange.map(x => `<article class="panel skin r2">
            <div class="gem-art">${ico('gem')}<b>${x.gems}</b></div>
            <h3>${t('gems_n', { n: x.gems })}</h3>
            <button class="btn btn-sm btn-gold" data-ex="${x.id}" ${save.gold < x.gold ? 'disabled' : ''}>${ico('coin')} ${fmt(x.gold)}</button>
          </article>`).join('')}
        </div>
        <div class="sec-head"><h2>${t('packs')}</h2></div>
        <div class="skin-grid">
          ${GameData.gemPacks.map(x => `<article class="panel skin r3">${x.badge ? `<span class="offer-badge">${x.badge}</span>` : ''}<div class="gem-art">${ico('gem')}<b>${x.gems}</b></div><h3>${t('gems_n', { n: x.gems })}</h3><button class="btn btn-sm btn-green" data-gempack="${x.id}">${x.czk} Kč</button></article>`).join('')}
        </div>
        ${Platby.available() ? '' : `<div class="notice"><div>${t('pay_demo_short')}</div></div>`}`;
    }
    const el = App.screenEl;
    el.innerHTML = `
      <div class="scr">
        <div class="sec-head"><h1>${t('nav_obchod')}</h1><span class="muted">${t('shop_note')}</span></div>
        ${deal && tab === 'vojaci' ? `<section class="panel deal">
          <canvas id="dealCv"></canvas>
          <div class="deal-body">
            <div class="eyebrow">${t('deal')}</div>
            <h2>${esc(deal.skin.name)}</h2>
            <p class="muted">${esc(deal.skin.desc)}</p>
            <div class="deal-price"><s>${ico('gem')} ${deal.skin.price}</s> <b>${ico('gem')} ${deal.price}</b></div>
            <button class="btn btn-gold" data-buy="${deal.skin.id}" data-price="${deal.price}" ${save.gems < deal.price ? 'disabled' : ''}>Koupit pro ${esc(GameData.units[unitSel].name.toLowerCase())}e</button>
          </div>
        </section>` : ''}
        <div class="tabs" role="tablist">
          ${[['nabidky', t('tab_offers')], ['zbrojnice', t('tab_armory')], ['vojaci', t('tab_units')], ['hrady', t('tab_castles')], ['dekorace', t('tab_decor')], ['drahokamy', t('tab_gems')]].map(([id, n]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="${tab === id}">${n}</button>`).join('')}
        </div>
        ${body}
      </div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => App.go('obchod', { tab: b.dataset.tab, keepScroll: true })));
    if (Shop.tabs.includes(tab)) { Shop.bind(App, tab, el); return; }
    if (deal && tab === 'vojaci') {
      const cv = el.querySelector('#dealCv');
      const draw = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth, h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const g = ctx.createRadialGradient(w / 2, h * 0.7, 10, w / 2, h * 0.6, w * 0.7);
        g.addColorStop(0, '#5a4214'); g.addColorStop(1, '#151b28'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        fUnits.forEach((id, i) => {
          ctx.save(); const k = h / 125; ctx.translate(w * (0.16 + i * 0.22), h * 0.93); ctx.scale(k, k);
          Art.drawUnit(ctx, GameData.units[id], Art.unitPalette('player', deal.skin.id, save.faction), { x: 0, y: 0, facing: 1, t: 0, ring: false });
          ctx.restore();
        });
      };
      draw();
    }
    const buySkin = (id, price) => {
      const s = GameData.unitSkins.find(x => x.id === id);
      if (save.gems < price || save.skins.ownedUnit.includes(id)) return;
      save.gems -= price; save.skins.ownedUnit.push(id); save.skins.unit[unitSel] = id;
      App.persist(); App.toast(`Skin „${s.name}“ koupen`); App.go('obchod', { keepScroll: true });
    };
    el.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buySkin(b.dataset.buy, +b.dataset.price)));
    if (tab === 'vojaci') {
      el.querySelectorAll('canvas[data-chip]').forEach(c => Art.renderUnitIcon(c, c.dataset.chip, 'player', save.skins.unit[c.dataset.chip], { headshot: true, noShadow: true }));
      el.querySelectorAll('canvas[data-skinunit]').forEach(c => Art.renderUnitIcon(c, unitSel, 'player', c.dataset.skinunit));
      Shop.ensure(save);
      el.querySelectorAll('canvas[data-wskin]').forEach(c => {
        const p = Art.unitPalette('player', save.skins.unit[unitSel], save.faction);
        p.wpn = GameData.weaponSkinById(c.dataset.wskin).wpal;
        Art.renderUnitIcon(c, unitSel, 'player', save.skins.unit[unitSel], { pal: p, atk: 0.35 });
      });
      const wset = id => { save.skins.weapon[unitSel] = id; App.persist(); App.go('obchod', { keepScroll: true }); };
      el.querySelectorAll('[data-wequip]').forEach(b => b.addEventListener('click', () => wset(b.dataset.wequip)));
      el.querySelectorAll('[data-wbuy]').forEach(b => b.addEventListener('click', () => {
        const w = GameData.weaponSkinById(b.dataset.wbuy);
        if (save.gems < w.price) return;
        save.gems -= w.price; save.skins.ownedWeapon.push(w.id); App.toast(t('t_bought', { name: w.name })); App.refreshTop(); wset(w.id);
      }));
      el.querySelectorAll('[data-wczk]').forEach(b => b.addEventListener('click', () => {
        const w = GameData.weaponSkinById(b.dataset.wczk);
        Platby.buy(App, { id: 'wskin_' + w.id, name: w.name, czk: w.czk }, () => { if (!save.skins.ownedWeapon.includes(w.id)) save.skins.ownedWeapon.push(w.id); App.toast(t('t_bought', { name: w.name })); wset(w.id); });
      }));
      el.querySelectorAll('[data-sel]').forEach(b => b.addEventListener('click', () => App.go('obchod', { unit: b.dataset.sel, keepScroll: true })));
      el.querySelectorAll('[data-equip]').forEach(b => b.addEventListener('click', () => { save.skins.unit[unitSel] = b.dataset.equip; App.persist(); App.go('obchod', { keepScroll: true }); }));
      el.querySelectorAll('[data-skinczk]').forEach(b => b.addEventListener('click', () => {
        const sk = GameData.unitSkins.find(x => x.id === b.dataset.skinczk);
        Platby.buy(App, { id: 'skin_' + sk.id, name: sk.name, czk: sk.czk }, () => {
          if (!save.skins.ownedUnit.includes(sk.id)) save.skins.ownedUnit.push(sk.id);
          save.skins.unit[unitSel] = sk.id; App.persist(); App.toast(t('t_bought', { name: sk.name })); App.go('obchod', { keepScroll: true });
        });
      }));
      el.querySelector('#equipAll').addEventListener('click', () => {
        const sk = save.skins.unit[unitSel];
        const skd = GameData.unitSkins.find(x => x.id === sk) || {};
        if (skd.exclusive || skd.only) { App.toast(t('only_for', { name: GameData.units[unitSel].name })); return; }
        Object.keys(GameData.units).forEach(u => (save.skins.unit[u] = sk));
        App.persist(); App.toast(t('equip_all')); App.go('obchod', { keepScroll: true });
      });
      const pv = el.querySelector('#skinPrev');
      const anim = () => {
        if (!pv.isConnected) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = pv.clientWidth, h = pv.clientHeight;
        if (pv.width !== Math.round(w * dpr)) { pv.width = w * dpr; pv.height = h * dpr; }
        const ctx = pv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#2c3a55'); g.addColorStop(0.74, '#1b2436'); g.addColorStop(0.74, '#7a5f3e'); g.addColorStop(1, '#5a4329');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        const t = performance.now() / 1000;
        const def = GameData.units[unitSel];
        const sc = h / 150;
        const phase = t % 4;
        const attacking = phase > 2.4;
        const atk = attacking ? ((phase - 2.4) / 0.8) % 1 : -1;
        ctx.save(); ctx.translate(w / 2 - 30 * sc, h * 0.88); ctx.scale(sc, sc);
        const pPal = Art.unitPalette('player', save.skins.unit[unitSel], save.faction);
        const wsk = (save.skins.weapon || {})[unitSel]; if (wsk && GameData.weaponSkinById) pPal.wpn = GameData.weaponSkinById(wsk).wpal;
        if (pPal.mount) { ctx.translate(-10, 0); ctx.scale(0.78, 0.78); }
        Art.drawUnit(ctx, def, pPal, { x: 0, y: 0, facing: 1, walk: t * 8, moving: !attacking, atk, t, ring: true });
        ctx.restore();
        ctx.save(); ctx.translate(w / 2 + 70 * sc, h * 0.88); ctx.scale(sc * 0.85, sc * 0.85);
        Art.drawUnit(ctx, def, Art.unitPalette('enemy', 'zakladni', save.faction), { x: 0, y: 0, facing: -1, t, ring: true });
        ctx.restore();
        App.previewRaf = requestAnimationFrame(anim);
      };
      cancelAnimationFrame(App.previewRaf);
      anim();
    } else if (tab === 'hrady') {
      // oba druhy hradu ve stejném měřítku, aby byl vidět rozdíl ve velikosti
      const bigImg = Art.castleImage('player', save.skins.castle, 10, 2, F.castleStyle, Object.assign(castleCfg(save), { big: true, small: false }));
      [['#smallCv', false], ['#bigCv', true]].forEach(([sel, isBig]) => {
        const bc = el.querySelector(sel);
        if (!bc) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2), w = bc.clientWidth, h = bc.clientHeight;
        bc.width = w * dpr; bc.height = h * dpr;
        const ctx = bc.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cfg = Object.assign(castleCfg(save), { big: isBig, small: !isBig });
        const img = Art.castleImage('player', save.skins.castle, isBig ? 10 : GameData.calc.castleLevel(save), 2, F.castleStyle, cfg);
        const s = Math.min(w / (bigImg.w + 20), h / (bigImg.h + 10));
        ctx.save(); ctx.scale(s, s);
        const fr = (w / 2 + img.w * s / 2) / s, gy = h / s - 4;
        Art.drawCastle(ctx, img, fr, gy, 1, 0.3, 1, F.color);
        const demo = { slots: Array.from({ length: isBig ? 10 : 5 }, (_, i) => ({ kind: i === 2 || i === 7 ? 'katapult' : i % 3 === 1 ? 'kuse' : 'lucistnik', el: ['ohen', 'led', 'blesk', 'voda', 'jed'][i % 5] })), vez: 10, catLvl: 1 };
        Art.drawDefense(ctx, img, F.castleStyle, fr, gy, 1, 0, demo, F.id, 'player', null);
        ctx.restore();
      });
      el.querySelectorAll('[data-ctype]').forEach(b => b.addEventListener('click', () => { save.castleType = b.dataset.ctype; App.persist(); App.go('obchod', { keepScroll: true }); }));
      if (window.Shop && Shop.bindOffers) Shop.bindOffers(App, el);
      el.querySelectorAll('canvas[data-skincastle]').forEach(c => Art.renderCastleIcon(c, 'player', c.dataset.skincastle, GameData.calc.castleLevel(save), F.castleStyle));
      el.querySelectorAll('[data-cequip]').forEach(b => b.addEventListener('click', () => { save.skins.castle = b.dataset.cequip; App.persist(); App.go('obchod', { keepScroll: true }); }));
      el.querySelectorAll('[data-cbuy]').forEach(b => b.addEventListener('click', () => {
        const s = GameData.castleSkins.find(x => x.id === b.dataset.cbuy);
        if (save.gems < s.price) return;
        save.gems -= s.price; save.skins.ownedCastle.push(s.id); save.skins.castle = s.id;
        App.persist(); App.toast(`Vzhled „${s.name}“ koupen`); App.go('obchod', { keepScroll: true });
      }));
    } else if (tab === 'dekorace') {
      el.querySelectorAll('canvas[data-deccv]').forEach(cv => {
        const cfg = castleCfg(save); cfg.decor = { [cv.dataset.deccv]: true };
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth, h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const img = Art.castleImage('player', save.skins.castle, GameData.calc.castleLevel(save), 2, F.castleStyle, cfg);
        const s = Math.min(w / (img.w + 20), h / (img.h + 20));
        ctx.save(); ctx.scale(s, s); Art.drawCastle(ctx, img, (w / 2 + img.w * s / 2) / s, h / s - 4, 1, 0.3, 1, F.color); ctx.restore();
      });
      el.querySelectorAll('[data-dbuy]').forEach(b => b.addEventListener('click', () => {
        const d = GameData.castleCustom.decorations.find(x => x.id === b.dataset.dbuy);
        if (save.gold < d.price) return;
        save.gold -= d.price; save.ownedDecor.push(d.id); save.castleCfg.decor = save.castleCfg.decor || {}; save.castleCfg.decor[d.id] = true;
        App.persist(); App.toast(t('t_bought', { name: d.name })); App.go('obchod', { keepScroll: true });
      }));
    } else {
      const G = GameData.gemOffers;
      const d = el.querySelector('#daily');
      if (d) d.addEventListener('click', () => {
        if (save.lastDaily === todayKey()) return;
        save.lastDaily = todayKey(); save.gems += G.daily.gems; save.gold += G.daily.gold;
        App.persist(); App.toast(`+${G.daily.gems} 💎  +${G.daily.gold}`); App.go('obchod', { keepScroll: true });
      });
      el.querySelectorAll('[data-gempack]').forEach(b => b.addEventListener('click', () => {
        const x = GameData.gemPacks.find(o => o.id === b.dataset.gempack);
        Platby.buy(App, { id: 'gems_' + x.id, name: t('gems_n', { n: x.gems }), czk: x.czk }, () => {
          const got = Shop.grant(App, { gems: x.gems }); App.go('obchod', { keepScroll: true }); Shop.rewardsModal(App, t('gems_n', { n: x.gems }), got);
        });
      }));
      el.querySelectorAll('[data-ex]').forEach(b => b.addEventListener('click', () => {
        const x = G.exchange.find(o => o.id === b.dataset.ex);
        if (save.gold < x.gold) return;
        save.gold -= x.gold; save.gems += x.gems;
        App.persist(); App.toast(`+${t('gems_n', { n: x.gems })}`); App.go('obchod', { keepScroll: true });
      }));
    }
  }

  /* --------------------------------------------------------------- PŘÍBĚH */
  function screenPribeh(App, opts = {}) {
    const save = App.save;
    const H = GameData.campaignHelpers;
    const curAct = H.currentAct(save);
    let a = opts.act || App.storyAct || curAct;
    if (!H.actUnlocked(save, a)) a = curAct;
    App.storyAct = a;
    const act = H.act(a);
    const chapters = H.chapters(a);
    const all = H.allLevels(a);
    const prog = H.progress(save, a);
    const total = H.progress(save);
    const cur = H.currentLevel(save);
    const curHere = cur && cur.act === a ? cur : null;
    const curCh = curHere ? chapters.find(c => c.id === curHere.chapter) : chapters[chapters.length - 1];
    const chDone = curCh.levels.filter(l => save.campaign.cleared[l.id]).length;
    const actName = x => x.faction === 'spojenectvi' ? t('alliance') : GameData.factions[x.faction].name;
    const people = act.faction === 'spojenectvi' ? GameData.factionOrder.map(f => GameData.factions[f].name).join(' · ') : GameData.factions[act.faction].people;
    const el = App.screenEl;
    el.innerHTML = `
      <div class="scr">
        <div class="sec-head"><h1>${t('story')}</h1><span class="muted">${t('saga_progress', { a: total.done, b: total.total })}</span></div>
        <div class="act-tabs" role="tablist" aria-label="${t('story')}">
          ${H.acts().map(x => {
            const un = H.actUnlocked(save, x.id), done = H.actDone(save, x.id);
            return `<button class="act-tab ${done ? 'done' : ''}" role="tab" data-act-tab="${x.id}" aria-selected="${x.id === a}" ${un ? '' : 'disabled'}>
              <span class="act-num">${x.n}</span><span class="act-nm">${esc(actName(x))}</span>${un ? (done ? ico('crown') : '') : ico('lock')}
            </button>`;
          }).join('<i class="act-arrow">›</i>')}
        </div>
        <div class="story-wrap">
          <section class="panel story-map" id="storyMap">
            <canvas id="storyCv"></canvas>
            ${chapters.map(ch => `<div class="region-label" style="top:${ch.label.top}%;${ch.label.left != null ? 'left:' + ch.label.left : 'right:' + ch.label.right}%">${t('chapter', { n: ch.id })} · ${esc(ch.name)}</div>`).join('')}
            ${all.map(l => {
              const cleared = !!save.campaign.cleared[l.id];
              const unlocked = H.isUnlocked(save, l.id);
              const isCur = cur && cur.id === l.id;
              const cls = ['node', l.boss ? 'boss' : '', l.boss === 'demonkral' ? 'final' : '', cleared ? 'cleared' : '', isCur ? 'current' : '', unlocked ? '' : 'lockednode'].join(' ');
              return `<button class="${cls}" style="left:${l.pos[0]}%;top:${l.pos[1]}%" data-lv="${l.id}" aria-label="${l.label} ${esc(l.name)}${cleared ? ' ✓' : ''}">
                ${cleared || isCur ? ico('crown') : ''}${unlocked ? l.label : ico('lock')}
              </button>`;
            }).join('')}
          </section>
          <div style="display:grid;gap:12px;align-content:start">
            <section class="panel chapter-card">
              <div class="grow">
                <div class="eyebrow" style="color:#6d4f1a">${t('act_n', { n: act.n })} · ${t('chapter', { n: curCh.id })}</div>
                <h3>${esc(curCh.name)}</h3>
                <div style="font-size:14px">${esc(curCh.intro)}</div>
                <div class="bar"><i style="width:${(chDone / curCh.levels.length) * 100}%"></i></div>
                <div style="font-size:13px;font-weight:800;margin-top:3px">${chDone} / ${curCh.levels.length}</div>
              </div>
              ${curHere ? `<button class="btn btn-red" data-lv="${curHere.id}" aria-label="${t('to_battle')} ${curHere.label}">${ico('swords').replace('<svg', '<svg width="26" height="26"')}</button>` : ''}
            </section>
            <section class="panel act-info">
              <div class="act-crests">${(act.faction === 'spojenectvi' ? GameData.factionOrder : [act.faction]).map(f => `<canvas data-crest="${f}"></canvas>`).join('')}</div>
              <div>
                <div class="eyebrow">${t('act_n', { n: act.n })} · ${esc(people)}</div>
                <b>${esc(actName(act))}</b>
                <div class="muted" style="font-size:13px">${t('completed_of', { a: prog.done, b: prog.total })}</div>
              </div>
              <button class="btn btn-sm" data-scene="${act.scene}">${ico('map')} ${t('replay_scene')}</button>
            </section>
            <section class="panel saga-help">
              <p class="muted" style="margin:0">${t('saga_help')}</p>
            </section>
          </div>
        </div>
      </div>`;
    const map = el.querySelector('#storyMap');
    const cv = el.querySelector('#storyCv');
    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = map.clientWidth, h = map.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      Art.drawStoryMap(ctx, w, h, act.mapTheme);
      ctx.setLineDash([2, 8]); ctx.lineCap = 'round';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(20,16,10,.55)';
      ctx.beginPath(); all.forEach((l, i) => { const x = l.pos[0] / 100 * w, y = l.pos[1] / 100 * h; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      ctx.lineWidth = 3.5; ctx.strokeStyle = '#fff3cf';
      ctx.beginPath();
      let started = false;
      all.forEach(l => {
        if (!H.isUnlocked(save, l.id)) return;
        const x = l.pos[0] / 100 * w, y = l.pos[1] / 100 * h;
        started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true;
      });
      ctx.stroke(); ctx.setLineDash([]);
    };
    paint();
    App.onResize = paint;
    el.querySelectorAll('canvas[data-crest]').forEach(c => { const F = GameData.factions[c.dataset.crest]; emblemCanvas(c, GameData.defaultEmblem[c.dataset.crest] || F.emblem, '#f2c94c', F.color); });
    el.querySelectorAll('[data-lv]').forEach(b => b.addEventListener('click', () => App.openLevel(b.dataset.lv)));
    el.querySelectorAll('[data-act-tab]').forEach(b => b.addEventListener('click', () => App.go('pribeh', { act: b.dataset.actTab })));
    el.querySelector('[data-scene]').addEventListener('click', () => App.playScene(act.scene, null, true));
  }

  /* --------------------------------------------------------------- PVP */
  function screenPvp(App) {
    const save = App.save, R = GameData.pvpRules, P = GameData.pvpHelpers;
    if (!save.pvp.opponents.length) { save.pvp.opponents = P.pickOpponents(save.trophies, save.pvp.season); App.persist(); }
    const el = App.screenEl;
    el.innerHTML = `
      <div class="scr">
        <div class="sec-head"><h1>${t('pvp_title')}</h1><span class="tag tag-demo">${t('demo_data')}</span></div>
        <div class="notice"><div>${t('pvp_notice')}</div></div>
        <div class="muted" style="font-size:14px">${t('pvp_rules', { n: R.maxAttacks, l: R.trophyLoss })}</div>
        <div class="opp-list">
          ${save.pvp.opponents.map(id => {
            const o = P.byId(id);
            const hist = save.pvp.attacks[id] || [];
            const used = hist.length;
            const left = R.maxAttacks - used;
            const diffNext = used < R.maxAttacks ? P.difficulty(o, used) : null;
            return `<article class="panel opp">
              <div class="opp-top">
                <canvas data-castle="${o.castleSkin}" data-lvl="${o.castleLevel}" data-style="${GameData.factions[o.faction].castleStyle}"></canvas>
                <div>
                  <h3>${esc(o.name)}</h3>
                  <div class="tro">${ico('trophy')} <span class="num">${fmt(o.trophies)}</span></div>
                  <div class="muted" style="font-size:13px">${esc(GameData.factions[o.faction].name)} · ${t('castle_short', { n: o.castleLevel })} · ×${P.basePower(o).toFixed(2).replace('.', ',')}</div>
                </div>
              </div>
              <div class="fights">
                ${[0, 1, 2].map(i => {
                  const h = hist[i];
                  const cls = ['fight', 'f' + (i + 1), h ? 'used' : '', !h && i === used ? 'next' : ''].join(' ');
                  return `<div class="${cls}">${t('fight_n', { n: i + 1 })}<small>${ico('trophy')} +${R.trophyReward[i]}</small>${h ? `<span class="res">${h === 'win' ? t('win') : t('loss')}</span>` : ''}</div>`;
                }).join('')}
              </div>
              <div class="opp-info">
                ${diffNext ? `<span>${t('next_attack', { n: used + 1, d: t('diff_' + used) })} <span class="stars">${stars(diffNext)}</span></span>
                <span><b>${t('reward_win', { t: R.trophyReward[used], g: R.goldReward[used] })}</b></span>` : `<span>${t('attacks_used')}</span>`}
              </div>
              <div class="left-count"><span>${t('can_attack')}</span><span class="n num">${left} / ${R.maxAttacks}</span></div>
              <button class="btn btn-green btn-big" data-attack="${id}" ${left <= 0 ? 'disabled' : ''}>${left > 0 ? t('attack') : t('no_attacks')}</button>
            </article>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn" id="newSeason">${t('new_season')}</button>
          <span class="muted" style="font-size:14px">#${save.pvp.season}</span>
        </div>
      </div>`;
    el.querySelectorAll('canvas[data-castle]').forEach(c => Art.renderCastleIcon(c, 'enemy', c.dataset.castle, +c.dataset.lvl, c.dataset.style));
    el.querySelectorAll('[data-attack]').forEach(b => b.addEventListener('click', () => App.startPvp(b.dataset.attack)));
    el.querySelector('#newSeason').addEventListener('click', () => {
      save.pvp.season++;
      save.pvp.attacks = {};
      save.pvp.opponents = P.pickOpponents(save.trophies, save.pvp.season);
      App.persist();
      App.toast(t('new_season'));
      App.go('pvp');
    });
  }

  /* --------------------------------------------------------------- ŽEBŘÍČEK */
  function screenZebricek(App) {
    const save = App.save;
    const me = { id: 'me', name: save.name, trophies: save.trophies, castleLevel: GameData.calc.castleLevel(save), unitSkin: (GameData.avatars.find(a => a.id === save.avatar) || {}).skin || 'zakladni', avatar: (GameData.avatars.find(a => a.id === save.avatar) || {}).unit || 'rytir', me: true };
    const list = GameData.demoPlayers.map(p => Object.assign({ avatar: GameData.factionUnits(p.faction)[[3, 0, 1, 2][p.id.charCodeAt(2) % 4]] }, p)).concat([me]);
    list.sort((a, b) => b.trophies - a.trophies);
    const myRank = list.findIndex(p => p.me) + 1;
    const row = (p, i) => `<div class="lb-row ${p.me ? 'me' : ''}">
        <div class="rank ${i < 3 ? 'r' + (i + 1) : ''}">${i + 1}</div>
        <canvas data-av="${p.avatar}" data-skin="${p.unitSkin}" data-team="${p.me ? 'player' : 'enemy'}"></canvas>
        <div class="lb-name"><b>${esc(p.name)}${p.me ? ' ' + t('you_suffix') : ''}</b><small>${esc(GameData.factions[p.faction || save.faction].name)} · ${t('castle_short', { n: p.castleLevel })}</small></div>
        <div class="lb-tro">${ico('trophy')}${fmt(p.trophies)}</div>
      </div>`;
    const el = App.screenEl;
    el.innerHTML = `
      <div class="scr" style="max-width:720px">
        <div class="sec-head"><h1>${t('nav_zebricek')}</h1><span class="tag tag-demo">${t('demo_data')}</span></div>
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" aria-selected="true">TOP 10</button>
          <button class="tab" role="tab" disabled >${t('friends_online')}</button>
          <button class="tab" role="tab" disabled >${t('world_online')}</button>
        </div>
        <section class="panel lb">
          ${list.slice(0, 10).map(row).join('')}
          ${myRank > 10 ? `<div class="lb-gap">• • •</div>${row(me, myRank - 1)}` : ''}
        </section>
        <div class="notice"><div>${t('lb_notice')}</div></div>
      </div>`;
    el.querySelectorAll('canvas[data-av]').forEach(c => Art.renderUnitIcon(c, c.dataset.av, c.dataset.team, c.dataset.skin, { headshot: true, noShadow: true }));
  }

  /* --------------------------------------------------------------- PROFIL */
  function screenProfil(App) {
    const save = App.save, s = save.stats;
    const prog = GameData.campaignHelpers.progress(save);
    const el = App.screenEl;
    el.innerHTML = `
      <div class="scr" style="max-width:760px">
        <div class="sec-head"><h1>${t('profile')}</h1></div>
        <section class="panel profile-head">
          <canvas id="profAv"></canvas>
          <div class="field">
            <label for="nameInput">${t('commander_name')}</label>
            <input id="nameInput" maxlength="16" value="${esc(save.name)}" autocomplete="off">
          </div>
        </section>
        <section class="panel" style="padding:12px 14px;display:grid;gap:8px">
          <b>${t('portrait')}</b>
          <div class="av-pick">
            ${GameData.avatars.map(a => `<button data-avatar="${a.id}" aria-pressed="${save.avatar === a.id}" aria-label="${esc(a.name)}"><canvas data-avc="${a.id}"></canvas></button>`).join('')}
          </div>
        </section>
        <div class="stat-grid">
          <div class="panel stat"><small>${t('trophies')}</small><b>${fmt(save.trophies)}</b></div>
          <div class="panel stat"><small>${t('castle_level', { n: '' })}</small><b>${GameData.calc.castleLevel(save)}</b></div>
          <div class="panel stat"><small>${t('story')}</small><b>${prog.done}/${prog.total}</b></div>
          <div class="panel stat"><small>${t('wins_losses')}</small><b>${s.wins} / ${s.losses}</b></div>
          <div class="panel stat"><small>PvP · ${t('wins_losses')}</small><b>${s.pvpWins} / ${s.pvpLosses}</b></div>
          <div class="panel stat"><small>${t('kills')}</small><b>${fmt(s.kills)}</b></div>
          <div class="panel stat"><small>${t('sent')}</small><b>${fmt(s.unitsSent)}</b></div>
          <div class="panel stat"><small>${t('tab_decor')}</small><b>${save.skins.ownedUnit.length + save.skins.ownedCastle.length}</b></div>
        </div>
        <section class="panel" style="padding:12px 14px;display:grid;gap:10px">
          <b>${t('settings')}</b>
          <div class="field"><label for="langSel">${t('language')}</label>
            <select id="langSel" class="sel">${I18N.LANGS.map(l => `<option value="${l.id}" ${l.id === I18N.lang ? 'selected' : ''}>${l.name}${l.id !== 'en' && l.id !== 'cs' ? ' · ' + l.en : ''}</option>`).join('')}</select></div>
          <p class="muted" style="margin:0;font-size:13px">${t('lang_note')}</p>
          <button class="btn" id="tutAgain">${t('replay_tutorials')}</button>
          <div id="resetBox"><button class="btn btn-red" id="resetBtn">${t('reset')}</button></div>
        </section>
      </div>`;
    const drawAv = () => {
      App.paintAvatar(el.querySelector('#profAv'), save.avatar);
      el.querySelectorAll('canvas[data-avc]').forEach(c => App.paintAvatar(c, c.dataset.avc));
    };
    drawAv();
    el.querySelector('#nameInput').addEventListener('change', e => {
      const v = e.target.value.trim().slice(0, 16);
      save.name = v || 'Velitel'; App.persist(); App.refreshTop(); App.toast(t('done'));
    });
    el.querySelectorAll('[data-avatar]').forEach(b => b.addEventListener('click', () => {
      save.avatar = b.dataset.avatar; save.avatarChosen = true; App.persist(); App.refreshTop();
      el.querySelectorAll('[data-avatar]').forEach(x => x.setAttribute('aria-pressed', x === b));
      drawAv();
    }));
    el.querySelector('#langSel').addEventListener('change', e => App.setLang(e.target.value));
    el.querySelector('#tutAgain').addEventListener('click', () => { save.tut = {}; App.persist(); App.go('hrad'); });
    el.querySelector('#resetBtn').addEventListener('click', () => {
      el.querySelector('#resetBox').innerHTML = `<div style="display:grid;gap:8px"><b style="color:#ff8a80">${t('reset_q')}</b>
        <div class="modal-actions"><button class="btn btn-red" id="resetYes">${t('yes_delete')}</button><button class="btn" id="resetNo">${t('no')}</button></div></div>`;
      el.querySelector('#resetYes').addEventListener('click', () => { const lang = App.save.lang; App.save = Save.reset(); App.save.lang = lang; App.persist(); App.refreshTop(); App.toast(t('done')); App.go('hrad'); });
      el.querySelector('#resetNo').addEventListener('click', () => App.go('profil'));
    });
  }

  window.Screens = { hrad: screenHrad, sprava: screenSprava, pribeh: screenPribeh, pvp: screenPvp, zebricek: screenZebricek, skiny: screenObchod, obchod: screenObchod, stavitel: screenStavitel, castleCfg, profil: screenProfil, isUnitUnlocked, stars, fmt, esc };
})();
