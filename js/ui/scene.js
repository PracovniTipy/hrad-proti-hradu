/* =========================================================================
   PŘÍBĚHOVÉ SCÉNY – rozhovory mezi akty (GameData.scenes)
   Story.play(id, onDone): celoobrazovková scéna s pozadím, portrétem mluvčího
   a textem. Klepnutí kamkoli = další strana, tlačítko Přeskočit = konec.
   ========================================================================= */
(function () {
  const bgCache = {};
  function themeBg(theme) {
    if (bgCache[theme]) return bgCache[theme];
    const off = document.createElement('canvas'); off.width = 1300; off.height = 600;
    Art.drawBattleBackground(off.getContext('2d'), 1300, 600, 31, theme);
    return (bgCache[theme] = off);
  }

  function paintBg(cv, theme) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const img = themeBg(theme);
    // krajina pokryje horních ~65 % obrazovky, zbytek patří textu
    ctx.fillStyle = '#07090f'; ctx.fillRect(0, 0, w, h);
    const sw = 1300, sh = 600;
    const k = Math.max(w / sw, (h * 0.68) / sh);
    ctx.drawImage(img, 0, 0, sw, sh, (w - sw * k) / 2, 0, sw * k, sh * k);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(5,7,12,.25)'); g.addColorStop(1, 'rgba(5,7,12,.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  function paintPortrait(cv, who) {
    const c = GameData.cast[who] || {};
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!c.unit) {
      // vypravěč: otevřená kniha se svíčkou
      ctx.save(); ctx.translate(w / 2, h * 0.62); const k = Math.min(w, h) / 120; ctx.scale(k, k);
      ctx.beginPath(); ctx.moveTo(-44, 0); ctx.quadraticCurveTo(-22, -10, 0, 0); ctx.quadraticCurveTo(22, -10, 44, 0); ctx.lineTo(44, 26); ctx.quadraticCurveTo(22, 16, 0, 26); ctx.quadraticCurveTo(-22, 16, -44, 26); ctx.closePath();
      Art.fs(ctx, '#efe2c2', 2);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(80,60,30,.5)';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-38, 6 + i * 4.5); ctx.lineTo(-8, 6 + i * 4.5); ctx.moveTo(8, 6 + i * 4.5); ctx.lineTo(38, 6 + i * 4.5); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineWidth = 1.6; ctx.strokeStyle = '#8a6a3a'; ctx.stroke();
      ctx.beginPath(); ctx.rect(30, -30, 8, 26); Art.fs(ctx, '#f4ead2', 1.5);
      const g = ctx.createRadialGradient(34, -38, 1, 34, -38, 20);
      g.addColorStop(0, 'rgba(255,220,130,.9)'); g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g; ctx.fillRect(14, -58, 40, 40);
      ctx.beginPath(); ctx.moveTo(31, -32); ctx.quadraticCurveTo(34, -44, 34, -46); ctx.quadraticCurveTo(37, -40, 37, -32); ctx.closePath(); ctx.fillStyle = '#ffb347'; ctx.fill();
      ctx.restore();
      return;
    }
    const def = GameData.units[c.unit];
    const pal = Art.unitPalette(c.team || 'player', c.skin || 'zakladni', c.faction || def.faction);
    // poprsí: od temene (včetně rohů) po pás
    const sc = def.look.scale || 1;
    const top = (def.look.helmet === 'demonking' ? 98 : 84) * sc, bottom = 30 * sc;
    const s = h / (top - bottom);
    ctx.save();
    ctx.translate(w / 2 - 3 * sc * s, top * s);
    ctx.scale(s, s);
    Art.drawUnit(ctx, def, pal, { x: 0, y: 0, facing: 1, t: 0, noShadow: true });
    ctx.restore();
  }

  const Story = {
    active: false,
    play(id, onDone) {
      const sc = GameData.scenes[id];
      if (!sc || this.active) { if (onDone) onDone(); return; }
      this.active = true;
      const ov = document.createElement('div');
      ov.className = 'scene';
      ov.innerHTML = `
        <canvas class="scene-bg"></canvas>
        <div class="scene-title"><span>${sc.title}</span></div>
        <div class="scene-box" role="dialog" aria-live="polite">
          <div class="scene-por"><canvas></canvas></div>
          <div class="scene-txt"><b></b><p></p><small></small></div>
        </div>
        <button class="tut-skip scene-skip"></button>`;
      document.body.appendChild(ov);
      const bg = ov.querySelector('.scene-bg');
      const por = ov.querySelector('.scene-por canvas');
      const skip = ov.querySelector('.scene-skip');
      skip.textContent = t('tut_skip');
      let i = 0;
      const show = () => {
        const pg = sc.pages[i];
        const c = GameData.cast[pg.who] || {};
        ov.querySelector('.scene-txt b').textContent = c.name || '';
        ov.querySelector('.scene-txt p').textContent = pg.text;
        ov.querySelector('.scene-txt small').textContent = (i === sc.pages.length - 1 ? t('tut_end') : t('tut_tap')) + `  ·  ${i + 1}/${sc.pages.length}`;
        ov.querySelector('.scene-box').classList.toggle('foe', c.team === 'enemy');
        const box = ov.querySelector('.scene-box');
        box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
        requestAnimationFrame(() => paintPortrait(por, pg.who));
      };
      const finish = () => {
        ov.classList.add('out');
        setTimeout(() => ov.remove(), 300);
        this.active = false;
        window.removeEventListener('resize', onRs);
        if (onDone) onDone();
      };
      const onRs = () => { paintBg(bg, sc.theme); paintPortrait(por, sc.pages[i].who); };
      ov.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        if (e.target === skip) { finish(); return; }
        i++;
        if (i >= sc.pages.length) finish(); else show();
      });
      window.addEventListener('resize', onRs);
      requestAnimationFrame(() => { paintBg(bg, sc.theme); show(); });
    }
  };
  window.Story = Story;
})();
