/* =========================================================================
   MAZLÍČCI A SÍŇ SLÁVY (okna z hlavní stránky)
   - Mazlíček: výběr z 8 mazlíčků, odemykají se vítězstvími.
   - Síň slávy: trofeje z bossů, generálů a za velké činy (+1 % mincí za každou).
   ========================================================================= */
(function () {
  const G = GameData, TAU = Math.PI * 2;
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wins = save => ((save.stats && save.stats.wins) || 0) + ((save.stats && save.stats.pvpWins) || 0);

  function paintPet(cv, id, locked) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 120, h = cv.clientHeight || 100;
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = c.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w * 0.6); g.addColorStop(0, locked ? '#2a2f3a' : '#3a5a8a'); g.addColorStop(1, locked ? '#14161c' : '#16223a');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.save(); c.translate(w / 2, h / 2 + 4); const k = Math.min(w, h) / 70; c.scale(k, k);
    if (locked) c.filter = 'grayscale(.85) brightness(.6)';
    G.drawPet(c, id, performance.now() / 1000, false);
    c.restore();
  }

  /* trofej: jednoduchá vektorová ikona podle typu */
  function paintTrophy(cv, T, owned) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 80, h = cv.clientHeight || 80;
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const col = owned ? (T.col || '#ffd24a') : '#3a3f4a', dark = owned ? '#1a1410' : '#22252c';
    // podstavec
    c.fillStyle = owned ? '#5a3a1e' : '#2a2c32'; c.fillRect(w * 0.2, h * 0.82, w * 0.6, h * 0.1);
    c.save(); c.translate(w / 2, h * 0.5); const s = Math.min(w, h) / 64; c.scale(s, s);
    c.lineWidth = 2; c.strokeStyle = dark; c.fillStyle = col;
    const P = (f) => { c.beginPath(); f(); c.fill(); c.stroke(); };
    switch (T.type) {
      case 'helm': P(() => { c.moveTo(-16, 10); c.quadraticCurveTo(-18, -18, 0, -20); c.quadraticCurveTo(18, -18, 16, 10); c.closePath(); }); c.fillStyle = dark; c.fillRect(-10, -6, 20, 4); c.fillStyle = owned ? '#d6243a' : '#444'; P(() => { c.moveTo(0, -20); c.quadraticCurveTo(-6, -32, 8, -30); c.closePath(); }); break;
      case 'prapor': c.fillStyle = owned ? '#8a6a3a' : '#333'; c.fillRect(-14, -24, 3, 46); c.fillStyle = col; P(() => { c.moveTo(-11, -22); c.lineTo(18, -18); c.lineTo(12, -6); c.lineTo(18, 6); c.lineTo(-11, 2); c.closePath(); }); break;
      case 'mec': c.save(); c.rotate(-0.6); P(() => { c.moveTo(-3, 14); c.lineTo(-3, -24); c.lineTo(0, -30); c.lineTo(3, -24); c.lineTo(3, 14); c.closePath(); }); c.fillStyle = owned ? '#c99a2a' : '#333'; P(() => { c.rect(-11, 12, 22, 4); }); P(() => { c.rect(-2, 16, 4, 10); }); c.restore(); break;
      case 'koruna': P(() => { c.moveTo(-18, 10); c.lineTo(-18, -10); c.lineTo(-9, 0); c.lineTo(0, -16); c.lineTo(9, 0); c.lineTo(18, -10); c.lineTo(18, 10); c.closePath(); }); c.fillStyle = owned ? '#d6243a' : '#444'; [[-9, 4], [0, 2], [9, 4]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 2.6, 0, TAU); c.fill(); }); break;
      case 'lebka': P(() => { c.arc(0, -4, 14, Math.PI, 0); c.lineTo(10, 12); c.lineTo(-10, 12); c.closePath(); }); c.fillStyle = dark; [[-5, -2], [5, -2]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3.6, 0, TAU); c.fill(); }); break;
      case 'roh': P(() => { c.moveTo(-18, 8); c.quadraticCurveTo(-4, -24, 18, -18); c.quadraticCurveTo(4, -10, -8, 14); c.closePath(); }); c.fillStyle = owned ? '#c99a2a' : '#333'; P(() => { c.rect(-20, 6, 12, 6); }); break;
      case 'stit': P(() => { c.moveTo(-16, -18); c.lineTo(16, -18); c.quadraticCurveTo(16, 8, 0, 20); c.quadraticCurveTo(-16, 8, -16, -18); c.closePath(); }); c.fillStyle = owned ? '#ffffff' : '#444'; c.fillRect(-2, -14, 4, 26); c.fillRect(-12, -6, 24, 4); break;
      default: P(() => { c.arc(0, 4, 10, 0, TAU); }); c.beginPath(); c.moveTo(-10, -6); c.quadraticCurveTo(0, -24, 10, -6); c.lineWidth = 2.4; c.strokeStyle = owned ? '#c99a2a' : '#333'; c.stroke(); c.fillStyle = owned ? '#ffffff' : '#555'; c.beginPath(); c.arc(-3, 1, 3, 0, TAU); c.fill();
    }
    c.restore();
    if (!owned) { c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '900 22px sans-serif'; c.textAlign = 'center'; c.fillText('?', w / 2, h * 0.58); }
  }

  const Sin = window.Sin = {
    openPets(App) {
      const save = App.save, W = wins(save);
      const render = () => {
        const cur = G.petOf(save).id;
        return `<div class="eyebrow">${L('Tvůj věrný pomocník v bitvě', 'Your loyal battle companion')}</div><h2>${L('Mazlíček', 'Pet')}</h2>
          <p class="muted" style="margin:0 0 8px">${L('Mazlíček létá nad tvou armádou, sbírá padlé mince (+1 za zabití) a sám používá svou schopnost. Noví se odemykají vítězstvími.', 'Your pet flies above your army, collects fallen coins (+1 per kill) and uses its own ability. New pets unlock with victories.')} <b>${L('Vítězství', 'Victories')}: ${W}</b></p>
          <div class="pet-grid">${G.pets.map(p => {
            const un = G.petUnlocked(save, p), on = cur === p.id;
            return `<button class="pet-card ${on ? 'on' : ''} ${un ? '' : 'locked'}" data-pet="${p.id}" ${un ? '' : 'disabled'}>
              <canvas data-petcv="${p.id}"></canvas>
              <b>${esc(L(p.cs, p.en))}</b>
              <small>${esc(L(p.d[0], p.d[1]))}</small>
              <span class="pet-st">${on ? '✓ ' + L('S tebou v bitvě', 'With you in battle') : un ? L('Vybrat', 'Choose') : ico('lock') + ' ' + L('{n} vítězství', '{n} victories').replace('{n}', p.wins)}</span>
            </button>`;
          }).join('')}</div>
          <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`;
      };
      App.modal(render(), (c) => {
        let raf = 0; const anim = () => { if (!c.isConnected || document.getElementById('modal').hidden) return; c.querySelectorAll('canvas[data-petcv]').forEach(cv => { const p = G.pets.find(x => x.id === cv.dataset.petcv); paintPet(cv, p.id, !G.petUnlocked(save, p)); }); raf = setTimeout(() => requestAnimationFrame(anim), 60); };
        const bind = () => { anim(); c.querySelectorAll('[data-pet]').forEach(b => b.addEventListener('click', () => { const p = G.pets.find(x => x.id === b.dataset.pet); if (!G.petUnlocked(save, p)) return; save.pet = p.id; App.persist(); if (window.Zvuk) Zvuk.play('coin', 0.8); c.innerHTML = render(); applyIconsSafe(c); bind(); })); };
        bind();
      });
    },
    /* SEKCE MAZLÍČKŮ: velká scéna s vybraným mazlíčkem a mřížka všech 20 */
    screen(App, opts) {
      const save = App.save, el = App.screenEl;
      let sel = (opts && opts.pet) || G.petOf(save).id;
      const needTxt = p => { const N = G.petNeed(p), have = G.petProgress(save, p);
        if (N.k === 'gems') return `${ico('gem')} ${N.n}`;
        const lbl = { wins: L('vítězství', 'victories'), kills: L('zabití', 'kills'), trophies: L('trofejí', 'trophies'), refs: L('pozvaných přátel', 'invited friends') }[N.k];
        return `${Math.min(have, N.n)} / ${N.n} ${lbl}`; };
      const render = () => {
        const P = G.pets.find(x => x.id === sel), un = G.petUnlocked(save, P), on = G.petOf(save).id === P.id, N = G.petNeed(P);
        const nOwn = G.pets.filter(p => G.petUnlocked(save, p)).length;
        el.innerHTML = `<div class="scr scr-pets">
          <div class="sec-head"><h1>${L('Mazlíčci', 'Pets')}</h1><span class="muted">${nOwn} / ${G.pets.length} ${L('odemčeno', 'unlocked')}</span></div>
          <section class="panel pet-hero">
            <canvas id="petStage"></canvas>
            <div class="pet-info">
              <div class="eyebrow"><span class="pet-rtag" style="--rc:${G.petRarities[P.rar][2]}">${L(G.petRarities[P.rar][0], G.petRarities[P.rar][1])}</span> · ${L('Schopnost každých', 'Ability every')} ${P.cd} s</div>
              <h2>${esc(L(P.cs, P.en))}</h2>
              <p>${esc(L(P.d[0], P.d[1]))}</p>
              <p class="muted" style="font-size:13px">${L('Každý mazlíček navíc sbírá padlé mince: +1 za každé zabití.', 'Every pet also collects fallen coins: +1 per kill.')}</p>
              <div class="pet-actions">
                ${on ? `<span class="bp-have">✓ ${L('S tebou v bitvě', 'With you in battle')}</span>`
                  : un ? `<button class="btn btn-gold btn-big" id="petUse">${L('Vzít do bitvy', 'Take into battle')}</button>`
                  : N.k === 'gems' ? `<button class="btn btn-green btn-big" id="petBuy" ${save.gems < N.n ? 'disabled' : ''}>${L('Koupit', 'Buy')} ${ico('gem')} ${N.n}</button>`
                  : `<span class="pet-lock">${ico('lock')} ${L('Odemkne se', 'Unlocks at')}: ${needTxt(P)}</span>`}
              </div>
            </div>
          </section>
          ${['legendary', 'epic', 'rare', 'common'].map(rk => { const R = G.petRarities[rk], list = G.pets.filter(p => p.rar === rk);
            return `<div class="sec-head pet-rar" style="--rc:${R[2]}"><h2>${L(R[0], R[1])}</h2><span class="muted">${list.filter(p => G.petUnlocked(save, p)).length} / ${list.length}</span></div>
            <div class="pet-grid big">${list.map(p => { const u = G.petUnlocked(save, p);
            return `<button class="pet-card r-${p.rar} ${p.id === sel ? 'sel' : ''} ${G.petOf(save).id === p.id ? 'on' : ''} ${u ? '' : 'locked'}" data-psel="${p.id}" style="--rc:${R[2]}">
              <canvas data-petcv="${p.id}"></canvas><b>${esc(L(p.cs, p.en).split(',')[0])}</b>
              <span class="pet-st">${G.petOf(save).id === p.id ? '✓ ' + L('V bitvě', 'In battle') : u ? L('Odemčeno', 'Unlocked') : needTxt(p)}</span></button>`; }).join('')}</div>`; }).join('')}
        </div>`;
        applyIconsSafe(el);
        el.querySelectorAll('[data-psel]').forEach(b => b.addEventListener('click', () => { sel = b.dataset.psel; const sc = el.scrollTop; render(); el.scrollTop = sc; }));
        const use = el.querySelector('#petUse'); if (use) use.addEventListener('click', () => { save.pet = sel; App.persist(); if (window.Zvuk) Zvuk.play('coin', 0.8); render(); });
        const buy = el.querySelector('#petBuy'); if (buy) buy.addEventListener('click', () => { const p = G.pets.find(x => x.id === sel), n = G.petNeed(p).n; if (save.gems < n) return; save.gems -= n; save.petsOwned = (save.petsOwned || []).concat(p.id); save.pet = p.id; App.persist(); if (window.Zvuk) Zvuk.play('coin', 1); App.refreshTop && App.refreshTop(); render(); });
      };
      render();
      // živá scéna: mazlíček poletuje nad malým bojištěm a jednou za čas použije schopnost
      let stop = false, last = 0;
      const anim = now => {
        if (stop || !el.isConnected || App.current !== 'mazlicci') return;
        if (now - last > 33) {
          last = now; const t = now / 1000;
          const cv = el.querySelector('#petStage');
          if (cv) {
            const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
            if (w && h) {
              if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
              const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
              const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a4a7a'); g.addColorStop(0.72, '#8ab8e0'); g.addColorStop(0.72, '#5a8a3a'); g.addColorStop(1, '#3a6a2a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
              for (let i = 0; i < 4; i++) { const x = ((t * 12 + i * 160) % (w + 200)) - 100, y = 30 + i * 18; c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(x, y, 18, 0, TAU); c.arc(x + 20, y + 4, 14, 0, TAU); c.arc(x - 18, y + 5, 12, 0, TAU); c.fill(); }
              const act = (t % 4) > 3.1, k = Math.min(w, h) / 90;
              c.save(); c.translate(w / 2 + Math.sin(t * 0.8) * w * 0.12, h * 0.45 + Math.sin(t * 2) * 8); c.scale(k * (Math.cos(t * 0.8) >= 0 ? 1 : -1), k);
              c.beginPath(); c.ellipse(0, 40, 18, 4, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
              G.drawPet(c, sel, t, act); c.restore();
            }
          }
          el.querySelectorAll('canvas[data-petcv]:not([data-done])').forEach(cv2 => { const p = G.pets.find(x => x.id === cv2.dataset.petcv); paintPet(cv2, p.id, !G.petUnlocked(save, p)); cv2.dataset.done = 1; });
        }
        requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    },
    openHall(App) {
      const save = App.save, R = save.relics || {};
      const boss = Object.keys(R).filter(k => k.startsWith('b_')).map(k => Object.assign({ id: k, cs: R[k].name, en: R[k].name, d: [R[k].boss ? 'Trofej z poraženého bosse.' : 'Trofej z poraženého generála.', R[k].boss ? 'Trophy from a defeated boss.' : 'Trophy from a defeated general.'] }, R[k]));
      const all = G.trophyAch.concat(boss);
      const n = Object.keys(R).length, bonus = Math.round(G.trophyBonus(save) * 100);
      App.modal(`<div class="eyebrow">${L('Tvoje největší činy', 'Your greatest deeds')}</div><h2>${L('Síň slávy', 'Hall of Fame')}</h2>
        <p class="muted" style="margin:0 0 8px">${L('Trofeje padají z bossů a generálů a dostaneš je za velké činy v bitvě. Každá trofej dává +1 % mincí v bitvě (nejvýš +20 %).', 'Trophies drop from bosses and generals and are earned for great deeds in battle. Each trophy gives +1% coins in battle (up to +20%).')}
        <b>${L('Trofeje', 'Trophies')}: ${n} · ${L('bonus', 'bonus')} +${bonus} %</b></p>
        <div class="troph-grid">${all.map(T => { const own = !!R[T.id]; return `<div class="troph ${own ? 'on' : ''}"><canvas data-trcv="${T.id}"></canvas><b>${own ? esc(L(T.cs, T.en)) : '???'}</b><small>${esc(L(T.d[0], T.d[1]))}</small></div>`; }).join('')}</div>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`, (c) => {
        c.querySelectorAll('canvas[data-trcv]').forEach(cv => { const T = all.find(x => x.id === cv.dataset.trcv); paintTrophy(cv, T, !!R[T.id]); });
      });
    },
    /* mazlíček poletuje kolem hradu na hlavní stránce */
    drawHome(ctx, t, save) {
      if (!save || !G.drawPet) return;
      const p = G.petOf(save);
      const x = 700 + Math.sin(t * 0.35) * 240, y = 250 + Math.sin(t * 0.9) * 26, dir = Math.cos(t * 0.35) >= 0 ? 1 : -1;
      ctx.save(); ctx.translate(x, y); ctx.scale(dir * 1.5, 1.5); G.drawPet(ctx, p.id, t, false); ctx.restore();
    }
  };
  if (window.Screens) Screens.mazlicci = (App, opts) => Sin.screen(App, opts);
  function applyIconsSafe(c) { try { if (window.applyIcons) applyIcons(c); } catch (e) {} }
})();
