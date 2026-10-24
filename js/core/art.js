/* =========================================================================
   GRAFIKA – vše je kreslené vektorově na <canvas>, proto je ostré na
   jakémkoli displeji. Postavy se skládají z dílů podle unit.look:
     helmet:  kettle | hood | nasal | great
     weapon:  sword | longsword | bow | spear
     shield:  round | kite | null
     armor:   mail | leather | plate
   ========================================================================= */
(function () {
  const OUT = '#121419';
  const TAU = Math.PI * 2;

  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function shade(hex, amt) {
    const c = parseInt(hex.slice(1), 16);
    let r = c >> 16, g = (c >> 8) & 255, b = c & 255;
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
    else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
  }
  /* Stínování postav: každý vyplněný díl dostane světlo zleva shora a stín
     vpravo dole (v prostoru celé postavy), takže postava působí plasticky. */
  const SH = { on: false, root: null, grad: null, f: 1 };
  function fs(ctx, fill, lw = 1.8) {
    if (fill) {
      ctx.fillStyle = fill; ctx.fill();
      if (SH.on) {
        ctx.save(); ctx.clip();
        ctx.setTransform(SH.root);
        if (!SH.grad) {
          const f = SH.f;
          const g = ctx.createLinearGradient(-15 * f, -86, 15 * f, -4);
          g.addColorStop(0, 'rgba(255,255,255,.26)'); g.addColorStop(0.38, 'rgba(255,255,255,.04)');
          g.addColorStop(0.62, 'rgba(0,0,0,.04)'); g.addColorStop(1, 'rgba(0,0,0,.30)');
          SH.grad = g;
        }
        ctx.fillStyle = SH.grad; ctx.fillRect(-60, -140, 120, 150);
        ctx.restore();
      }
    }
    if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  }
  /* Ruka v pěst s prsty a palcem */
  function fist(ctx, x, y, color, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    rr(ctx, -3.6, -3.1, 7.2, 6.4, 2.6); fs(ctx, color, 1.4);
    ctx.lineWidth = 0.75; ctx.strokeStyle = shade(color, -0.4);
    for (const fx of [-1.3, 0.6, 2.3]) { ctx.beginPath(); ctx.moveTo(fx, -0.8); ctx.lineTo(fx, 3.1); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-3.4, 0.4); ctx.lineTo(3.4, 0.4); ctx.lineWidth = 0.6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-3, -1.8, 1.5, 2.3, -0.5, 0, TAU); fs(ctx, shade(color, 0.06), 1);
    ctx.restore();
  }
  /* Obličej s okem, obočím, nosem, ústy, uchem a vlasy */
  function face(ctx, pal, L) {
    const hair = pal.hair || '#5a3a22';
    // vlasy vzadu (vykukují pod helmou)
    if (L.helmet !== 'bear') {
      ctx.beginPath(); ctx.ellipse(-1.8, -60.5, 7.6, 8.6, 0.15, 0, TAU); fs(ctx, hair, 1.5);
      ctx.lineWidth = 0.7; ctx.strokeStyle = shade(hair, 0.25);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-5 + i * 1.5, -66); ctx.quadraticCurveTo(-7 + i, -60, -6 + i * 1.3, -54); ctx.stroke(); }
    }
    // hlava
    ctx.beginPath(); ctx.arc(1.8, -62, 8.4, 0, TAU);
    const g = ctx.createRadialGradient(4.5, -65, 1, 2, -62, 9);
    g.addColorStop(0, shade(pal.skin, 0.12)); g.addColorStop(1, shade(pal.skin, -0.12));
    fs(ctx, g, 1.8);
    // ucho
    ctx.beginPath(); ctx.ellipse(-1.2, -61.2, 2, 2.9, 0.1, 0, TAU); fs(ctx, shade(pal.skin, -0.08), 1.1);
    ctx.beginPath(); ctx.arc(-1, -61.2, 1, -1.2, 1.4); ctx.lineWidth = 0.7; ctx.strokeStyle = shade(pal.skin, -0.4); ctx.stroke();
    // kotlety
    ctx.beginPath(); ctx.moveTo(1.2, -67); ctx.quadraticCurveTo(2.8, -62, 1.8, -58); ctx.lineWidth = 1.6; ctx.strokeStyle = hair; ctx.stroke();
    // oko
    ctx.beginPath(); ctx.ellipse(6.5, -62.6, 1.9, 1.35, 0, 0, TAU); ctx.fillStyle = '#fbf7f0'; ctx.fill();
    ctx.lineWidth = 0.6; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.arc(7.1, -62.6, 1.05, 0, TAU); ctx.fillStyle = pal.eyes === '#1b1b1b' ? (pal.iris || '#3d5f86') : pal.eyes; ctx.fill();
    ctx.beginPath(); ctx.arc(7.2, -62.6, 0.55, 0, TAU); ctx.fillStyle = '#111'; ctx.fill();
    ctx.beginPath(); ctx.arc(7.5, -63, 0.32, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
    // obočí
    ctx.beginPath(); ctx.moveTo(4.4, -65.2); ctx.quadraticCurveTo(6.6, -66.4, 8.8, -65.4); ctx.lineWidth = 1.3; ctx.strokeStyle = shade(hair, -0.2); ctx.stroke();
    // nos
    ctx.beginPath(); ctx.moveTo(9.2, -63.4); ctx.quadraticCurveTo(10.9, -60.6, 9.3, -59.7); ctx.lineWidth = 0.9; ctx.strokeStyle = shade(pal.skin, -0.45); ctx.stroke();
    // ústa
    ctx.beginPath(); ctx.moveTo(6.6, -57.4); ctx.quadraticCurveTo(7.8, -57, 8.9, -57.7); ctx.lineWidth = 0.9; ctx.strokeStyle = '#7a3a2e'; ctx.stroke();
    // tvář
    ctx.beginPath(); ctx.ellipse(5.4, -59.6, 1.8, 1.1, 0, 0, TAU); ctx.fillStyle = 'rgba(220,110,90,.2)'; ctx.fill();
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  /* Tlustá čára s obrysem (paže, násady) */
  function limb(ctx, x1, y1, x2, y2, w, color) {
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.lineWidth = w + 3.4; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke();
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  /* ---------------------------------------------------------------------
     PALETY
     --------------------------------------------------------------------- */
  function unitPalette(team, skinId, faction) {
    const f = GameData.factions && GameData.factions[faction || 'kralovstvi'];
    const base = Object.assign({}, GameData.teamPalettes[team], f && f.palettes ? f.palettes[team] : {});
    const skin = GameData.unitSkins.find(s => s.id === skinId) || GameData.unitSkins[0];
    const p = Object.assign({}, base, skin.palette || {});
    p.ornament = skin.ornament || null;
    p.glow = skin.glow || null;
    p.mount = skin.mount || null;
    return p;
  }
  function castlePalette(team, skinId, cfg) {
    const skin = GameData.castleSkins.find(s => s.id === skinId) || GameData.castleSkins[0];
    const t = GameData.teamCastleColors[team];
    const p = Object.assign({}, skin.palette);
    p.roof = p.roof || t.roof;
    p.roofDark = p.roofDark || t.roofDark;
    p.banner = t.banner;
    p.emblem = t.emblem;
    p.skinId = skin.id;
    p.emblemId = 'lilie';
    if (cfg) {
      if (cfg.banner) { p.banner = cfg.banner; if (skin.id === 'kralovsky' && (!cfg.roof || cfg.roof === 'auto')) { p.roof = cfg.banner; p.roofDark = shade(cfg.banner, -0.38); } }
      if (cfg.roof && cfg.roof !== 'auto') { p.roof = cfg.roof; p.roofDark = shade(cfg.roof, -0.38); p.roofCustom = true; }
      if (cfg.emblem) p.emblemId = cfg.emblem;
    }
    return p;
  }

  /* ---------------------------------------------------------------------
     POSTAVA
     st = { x, y, facing (1|-1), walk (fáze), moving, atk (-1 | 0..1),
            dead (0..1), ring, shieldFx }
     --------------------------------------------------------------------- */
  function drawUnit(ctx, def, pal, st) {
    const L = def.look;
    const s = (L.scale || 1) * (st.scaleMul || 1);
    ctx.save();
    ctx.translate(st.x, st.y);

    const deadK = st.dead ? Math.min(1, st.dead * 1.8) : 0;
    const alpha = st.dead ? Math.max(0, 1 - Math.max(0, st.dead - 0.55) * 2.2) : 1;
    ctx.globalAlpha = alpha;

    if (!st.noShadow) {
      ctx.beginPath(); ctx.ellipse(0, 0, 17 * s, 4.6 * s, 0, 0, TAU);
      ctx.fillStyle = 'rgba(0,0,0,.33)'; ctx.fill();
      if (st.ring && !st.dead) { ctx.lineWidth = 2; ctx.strokeStyle = pal.teamRing; ctx.stroke(); }
    }
    if (st.shieldFx && !st.dead) {
      ctx.beginPath(); ctx.ellipse(0, -34 * s, 24 * s, 42 * s, 0, 0, TAU);
      ctx.fillStyle = 'rgba(120,190,255,.16)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(150,210,255,.75)'; ctx.stroke();
    }

    ctx.scale((st.facing || 1) * s, s);
    if (deadK) { ctx.rotate(-deadK * 1.4); ctx.translate(-deadK * 6, 0); }
    const prevSH = SH.on;
    SH.on = !st.flat; SH.root = ctx.getTransform(); SH.grad = null; SH.f = 1;

    const moving0 = st.moving && !st.dead;
    const moving = pal.mount ? false : moving0;   // na koni jde kůň, jezdec sedí
    const w = st.walk || 0;
    const swing = moving ? Math.sin(w) * 0.5 : 0;
    const bob = moving ? -Math.abs(Math.cos(w)) * 2.2 : 0;
    const atk = st.atk == null ? -1 : st.atk;
    let mountBob = 0;
    if (pal.mount) {
      mountBob = moving0 ? -Math.abs(Math.sin(w)) * 2.4 : 0;
      ctx.translate(0, mountBob);
      drawHorse(ctx, pal.mount, w, moving0, st.t || 0, 'back');
      ctx.translate(-6, -27);
    }

    const legCol = (L.armor === 'plate' || L.armor === 'hellplate') ? pal.metal : (pal.legs || pal.tunicDark);
    const bootCol = (L.armor === 'plate' || L.armor === 'hellplate') ? pal.metalDark : (pal.boots || pal.leatherDark);
    const P = window.ArtParts || {};

    // Věci na zádech (praporek sašimono apod.)
    if (P.back) P.back(ctx, L, pal, st, moving, w, bob);

    // Plášť (za tělem)
    if (L.cape) {
      const flow = moving ? Math.sin(w * 0.9) * 3 : Math.sin((st.t || 0) * 2) * 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, -52 + bob);
      ctx.quadraticCurveTo(-18 - flow, -34, -20 - flow * 1.5, -12);
      ctx.lineTo(-8 - flow, -14);
      ctx.quadraticCurveTo(-6, -30, 2, -50 + bob);
      ctx.closePath();
      fs(ctx, L.capeColor || pal.cape);
      ctx.beginPath(); ctx.moveTo(-10 - flow * 0.5, -40); ctx.quadraticCurveTo(-14 - flow, -28, -15 - flow * 1.2, -15);
      ctx.lineWidth = 1.2; ctx.strokeStyle = shade(pal.cape, -0.35); ctx.stroke();
    }

    // Toulec (lučištník)
    if (L.weapon === 'bow' || L.weapon === 'yumi') {
      ctx.save(); ctx.translate(-8, -52 + bob); ctx.rotate(-0.45);
      rr(ctx, -4, 0, 8, 22, 2); fs(ctx, pal.leather);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-2 + i * 2, 0); ctx.lineTo(-3 + i * 2.4, -7); ctx.lineTo(-0.5 + i * 2.2, -5); ctx.closePath();
        fs(ctx, '#e8e2d0', 1);
      }
      ctx.restore();
    }

    // Nohy
    drawLeg(ctx, -2, -swing, shade(legCol, -0.22), shade(bootCol, -0.2));
    drawLeg(ctx, 3, swing, legCol, bootCol);

    ctx.save();
    ctx.translate(0, bob);

    // Zadní paže u kopiníka
    if (L.weapon === 'spear' || L.weapon === 'yari' || L.weapon === 'trident') {
      const tx = atk >= 0 ? Math.sin(atk * Math.PI) * 16 : 0;
      limb(ctx, -2, -48, -4 + tx, -43, 5.2, shade(L.armor === 'mail' ? pal.metal : ((L.armor === 'bare' || L.armor === 'demon') ? pal.skin : pal.tunic), -0.25));
    }

    // Sukně / tasety
    if (P.skirt && P.skirt[L.armor]) P.skirt[L.armor](ctx, L, pal); else {
    ctx.beginPath();
    ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(12.5, -21); ctx.lineTo(-12, -21); ctx.closePath();
    fs(ctx, L.armor === 'plate' ? pal.tunic : (L.armor === 'leather' ? pal.leather : pal.tunic));
    ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(0,0,0,.28)';
    for (const fx of [-6, -1, 4.5]) { ctx.beginPath(); ctx.moveTo(fx, -33); ctx.lineTo(fx + (fx > 0 ? 1.2 : -0.8), -23); ctx.stroke(); }
    if (L.armor !== 'leather') {
      ctx.beginPath(); ctx.moveTo(-12, -22.5); ctx.lineTo(12.5, -22.5);
      ctx.lineWidth = 2; ctx.strokeStyle = pal.trim; ctx.stroke();
    }
    }

    // Trup
    if (P.torso && P.torso[L.armor]) P.torso[L.armor](ctx, L, pal);
    else if (L.armor === 'plate') {
      rr(ctx, -10.5, -54, 21, 22, 7);
      const g = ctx.createLinearGradient(-10, -54, 10, -32);
      g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(0.55, pal.metal); g.addColorStop(1, pal.metalDark);
      fs(ctx, g);
      ctx.beginPath(); ctx.moveTo(1, -53); ctx.lineTo(1, -34); ctx.lineWidth = 1.2; ctx.strokeStyle = pal.metalDark; ctx.stroke();
      // tabard
      rr(ctx, -5.5, -48, 11, 16, 2); fs(ctx, pal.tunic, 1.4);
      ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, -36); ctx.moveTo(-3.2, -42); ctx.lineTo(3.2, -42);
      ctx.lineWidth = 2; ctx.strokeStyle = pal.trim; ctx.stroke();
    } else if (L.armor === 'mail') {
      rr(ctx, -10, -53, 20, 21, 6); fs(ctx, pal.metal);
      ctx.fillStyle = pal.metalDark;
      for (let yy = -50; yy < -34; yy += 3.2) for (let xx = -8; xx < 9; xx += 3.2) {
        ctx.beginPath(); ctx.arc(xx + ((yy / 3.2) % 2 ? 1.6 : 0), yy, 0.75, 0, TAU); ctx.fill();
      }
      rr(ctx, -6, -51, 12, 19, 2); fs(ctx, pal.tunic, 1.4);
      ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(3, -44); ctx.lineTo(0, -40); ctx.lineTo(-3, -44); ctx.closePath();
      ctx.fillStyle = pal.trim; ctx.fill();
    } else {
      rr(ctx, -9.5, -53, 19, 21, 6); fs(ctx, pal.tunic);
      ctx.beginPath(); ctx.moveTo(-9, -50); ctx.lineTo(-3, -50); ctx.lineTo(-1, -33); ctx.lineTo(-9, -33); ctx.closePath();
      fs(ctx, pal.leather, 1.3);
      ctx.beginPath(); ctx.moveTo(9, -50); ctx.lineTo(4, -50); ctx.lineTo(2, -33); ctx.lineTo(9, -33); ctx.closePath();
      fs(ctx, pal.leather, 1.3);
      // popruh toulce
      ctx.beginPath(); ctx.moveTo(-8, -52); ctx.lineTo(8, -35); ctx.lineWidth = 2.6; ctx.strokeStyle = pal.leatherDark; ctx.stroke();
    }
    // Opasek
    if (!(P.noBelt && P.noBelt[L.armor])) {
      rr(ctx, -11, -37, 22, 4.6, 1.5); fs(ctx, pal.belt || pal.leatherDark, 1.4);
      rr(ctx, -1.5, -37.6, 5, 5.8, 1); fs(ctx, pal.trim, 1.1);
    }

    // Hlava
    drawHead(ctx, L, pal, st);

    // Zbraň a paže (skin zbraně mění barvy čepele, dřeva a záři)
    const palMain = pal;
    if (pal.wpn) pal = Object.assign({}, pal, pal.wpn);
    if (P.weapon && P.weapon[L.weapon]) P.weapon[L.weapon](ctx, L, pal, atk, w, moving);
    else if (L.weapon === 'sword' || L.weapon === 'longsword') drawSwordArm(ctx, L, pal, atk, w, moving);
    else if (L.weapon === 'bow') drawBow(ctx, L, pal, atk);
    else if (L.weapon === 'spear') drawSpear(ctx, L, pal, atk, moving, w);
    pal = palMain;

    // Štít (před tělem) – při bloku zvednutý před obličej
    ctx.save();
    if (st.block) ctx.translate(5, -9);
    if (P.shield && P.shield[L.shield]) P.shield[L.shield](ctx, L, pal, atk);
    else if (L.shield === 'round') {
      const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0;
      ctx.beginPath(); ctx.arc(8 + sx, -41, 11, 0, TAU); fs(ctx, pal.tunic, 2);
      ctx.beginPath(); ctx.arc(8 + sx, -41, 8.4, 0, TAU); ctx.lineWidth = 2.2; ctx.strokeStyle = pal.trim; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8 + sx, -49); ctx.lineTo(8 + sx, -33); ctx.moveTo(0 + sx, -41); ctx.lineTo(16 + sx, -41);
      ctx.lineWidth = 1.4; ctx.strokeStyle = shade(pal.tunic, -0.35); ctx.stroke();
      ctx.beginPath(); ctx.arc(8 + sx, -41, 3.2, 0, TAU); fs(ctx, pal.metal, 1.4);
    } else if (L.shield === 'kite') {
      const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0;
      ctx.save(); ctx.translate(sx, 0);
      ctx.beginPath();
      ctx.moveTo(1.5, -55); ctx.lineTo(18.5, -55);
      ctx.quadraticCurveTo(19.5, -38, 10, -24);
      ctx.quadraticCurveTo(0.5, -38, 1.5, -55);
      ctx.closePath(); fs(ctx, pal.tunic, 2.2);
      ctx.beginPath();
      ctx.moveTo(4, -52.5); ctx.lineTo(16, -52.5);
      ctx.quadraticCurveTo(16.6, -39, 10, -28.5);
      ctx.quadraticCurveTo(3.4, -39, 4, -52.5);
      ctx.closePath(); ctx.lineWidth = 1.8; ctx.strokeStyle = pal.trim; ctx.stroke();
      // znak: kříž s lilií
      ctx.beginPath(); ctx.moveTo(10, -50); ctx.lineTo(10, -33); ctx.moveTo(5.5, -45); ctx.lineTo(14.5, -45);
      ctx.lineWidth = 2.6; ctx.strokeStyle = pal.trim; ctx.stroke();
      ctx.beginPath(); ctx.arc(10, -45, 2.2, 0, TAU); ctx.fillStyle = pal.trim; ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    // Ozdoby skinu na ramenou
    if (pal.ornament === 'crystal') {
      ctx.beginPath(); ctx.moveTo(-4, -52); ctx.lineTo(-7, -60); ctx.lineTo(-1, -54); ctx.lineTo(1, -61); ctx.lineTo(3, -53); ctx.closePath();
      fs(ctx, '#dff4ff', 1.2);
    }
    if (pal.mount) { ctx.translate(6, 27); drawHorse(ctx, pal.mount, w, moving0, st.t || 0, 'front'); }

    SH.on = prevSH;
    ctx.restore();
    ctx.restore();
  }

  /* Válečný kůň pod velitelem. layer 'back' = nohy, ocas, tělo, krk a hlava;
     'front' = čabraka a sedlo přes nohy jezdce. Kůň hledí doprava (facing řeší drawUnit). */
  function drawHorse(ctx, M, w, moving, t, layer) {
    const coat = M.coat, dark = M.coatDark || shade(coat, -0.3);
    if (layer === 'back') {
      const g = moving ? w : 0;
      const leg = (x, ph, col) => {
        const a = moving ? Math.sin(g + ph) * 0.5 : 0, k = moving ? Math.max(0, Math.sin(g + ph + 1.2)) * 0.6 : 0;
        ctx.save(); ctx.translate(x, -34); ctx.rotate(a);
        rr(ctx, -4, -2, 8, 18, 3.4); fs(ctx, col);
        ctx.translate(0, 15); ctx.rotate(-k);
        rr(ctx, -2.8, 0, 5.6, 17, 2.4); fs(ctx, col);
        rr(ctx, -3.6, 14, 7.6, 5, 1.6); fs(ctx, '#2a2420', 1.4);
        ctx.restore();
      };
      // vzdálené nohy
      leg(-20, Math.PI, dark); leg(20, 0, dark);
      // ocas
      const sw = Math.sin(t * 3 + w) * 3;
      ctx.beginPath(); ctx.moveTo(-32, -50); ctx.quadraticCurveTo(-46 - sw, -44, -42 - sw, -18);
      ctx.quadraticCurveTo(-38, -30, -30, -44); ctx.closePath(); fs(ctx, M.mane, 1.8);
      // tělo
      ctx.beginPath(); ctx.ellipse(0, -46, 34, 14, 0, 0, TAU); fs(ctx, coat, 2.2);
      ctx.beginPath(); ctx.ellipse(-2, -41, 28, 7, 0, 0, Math.PI); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fill();
      // krk a hlava
      const nod = moving ? Math.sin(w * 2) * 1.5 : Math.sin(t * 1.5) * 0.8;
      ctx.beginPath(); ctx.moveTo(18, -56); ctx.lineTo(34, -80 + nod); ctx.lineTo(46, -76 + nod); ctx.lineTo(32, -42); ctx.closePath(); fs(ctx, coat, 2.2);
      ctx.save(); ctx.translate(44, -76 + nod); ctx.rotate(0.55);
      rr(ctx, -6, -6, 26, 12, 6); fs(ctx, coat, 2);
      ctx.beginPath(); ctx.ellipse(18, 1, 5, 5.5, 0, 0, TAU); fs(ctx, shade(coat, -0.15), 1.4);
      ctx.beginPath(); ctx.arc(19, 2, 1.1, 0, TAU); ctx.fillStyle = '#1b1b1b'; ctx.fill();
      ctx.beginPath(); ctx.arc(3, -2, 1.8, 0, TAU); ctx.fillStyle = '#1b1b1b'; ctx.fill();
      // uzda
      ctx.beginPath(); ctx.moveTo(12, -6); ctx.lineTo(12, 6); ctx.moveTo(0, -5); ctx.lineTo(14, 4); ctx.lineWidth = 1.6; ctx.strokeStyle = M.bardingTrim || '#c9a06a'; ctx.stroke();
      ctx.restore();
      // ucho a hříva
      ctx.beginPath(); ctx.moveTo(38, -84 + nod); ctx.lineTo(41, -93 + nod); ctx.lineTo(44, -83 + nod); ctx.closePath(); fs(ctx, coat, 1.6);
      ctx.beginPath(); ctx.moveTo(16, -58); ctx.quadraticCurveTo(24, -78 + nod, 38, -84 + nod); ctx.lineTo(33, -74 + nod); ctx.quadraticCurveTo(26, -64, 22, -54); ctx.closePath(); fs(ctx, M.mane, 1.6);
      // blízké nohy
      leg(-14, 0, coat); leg(26, Math.PI, coat);
    } else {
      // čabraka a sedlo – zakryje nohy jezdce
      const b = M.barding, tr = M.bardingTrim || '#e8b84a';
      ctx.beginPath(); ctx.moveTo(-24, -56); ctx.quadraticCurveTo(-4, -60, 16, -56);
      ctx.lineTo(20, -30); ctx.quadraticCurveTo(-2, -24, -26, -30); ctx.closePath(); fs(ctx, b, 2);
      ctx.beginPath(); ctx.moveTo(-26, -32); ctx.quadraticCurveTo(-2, -26, 20, -32); ctx.lineWidth = 3; ctx.strokeStyle = tr; ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-14 + i * 12, -40, 2.4, 0, TAU); ctx.fillStyle = tr; ctx.fill(); }
      rr(ctx, -16, -61, 26, 7, 3); fs(ctx, '#5a3a1e', 1.6);
      // třmen
      ctx.beginPath(); ctx.moveTo(-2, -54); ctx.lineTo(-2, -26); ctx.lineWidth = 1.4; ctx.strokeStyle = '#3a2414'; ctx.stroke();
      rr(ctx, -6, -27, 9, 3.4, 1.2); fs(ctx, '#9aa3b0', 1.2);
    }
  }

  function drawLeg(ctx, x, ang, col, boot) {
    ctx.save(); ctx.translate(x, -31); ctx.rotate(ang);
    rr(ctx, -4, -2, 8.4, 23, 3.4); fs(ctx, col);
    // koleno a záhyb látky
    ctx.beginPath(); ctx.moveTo(-2.6, 9); ctx.quadraticCurveTo(0.5, 11, 3.4, 9.2); ctx.lineWidth = 0.8; ctx.strokeStyle = shade(col, -0.35); ctx.stroke();
    rr(ctx, -4.6, 18, 11.6, 8, 3); fs(ctx, boot);
    // manžeta boty a podrážka
    ctx.beginPath(); ctx.moveTo(-4.4, 20.2); ctx.lineTo(4.4, 20.2); ctx.lineWidth = 1; ctx.strokeStyle = shade(boot, 0.25); ctx.stroke();
    rr(ctx, -4.8, 24.4, 12, 2, 1); ctx.fillStyle = shade(boot, -0.45); ctx.fill();
    ctx.restore();
  }

  function drawHead(ctx, L, pal, st) {
    // krk
    rr(ctx, -2.5, -57, 7, 6, 2); fs(ctx, shade(pal.skin, -0.12), 1.2);
    if (L.helmet === 'great') {
      // velká helma zakrývá obličej
      rr(ctx, -7.5, -74, 18, 21, 6);
      const g = ctx.createLinearGradient(-7, -74, 10, -54);
      g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
      fs(ctx, g, 2);
      ctx.fillStyle = '#0d0f14'; rr(ctx, 1.5, -66.5, 9, 2.6, 1); ctx.fill();
      ctx.fillStyle = pal.eyes === '#1b1b1b' ? '#0d0f14' : pal.eyes;
      if (pal.eyes !== '#1b1b1b') { rr(ctx, 4, -66.2, 5, 2, 1); ctx.fill(); }
      ctx.fillStyle = '#0d0f14';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(6 + i * 1.6, -60, 0.6, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(1, -73); ctx.lineTo(1, -54); ctx.lineWidth = 1.1; ctx.strokeStyle = pal.metalDark; ctx.stroke();
      // chochol
      if (pal.ornament !== 'horns') {
        const sway = Math.sin((st.t || 0) * 4 + (st.walk || 0)) * 1.5;
        ctx.beginPath(); ctx.moveTo(0, -74); ctx.bezierCurveTo(-4, -84, -14 + sway, -82, -18 + sway, -70);
        ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = OUT; ctx.stroke();
        ctx.lineWidth = 5; ctx.strokeStyle = pal.plume; ctx.stroke();
      }
    } else {
      // obličej
      face(ctx, pal, L);
      const PH = window.ArtParts || {};
      if (L.beard && PH.beard) PH.beard(ctx, L, pal);
      if (PH.helmet && PH.helmet[L.helmet]) PH.helmet[L.helmet](ctx, L, pal, st);
      else if (L.helmet === 'kettle') {
        ctx.beginPath(); ctx.arc(1.8, -66, 9.4, Math.PI, 0); ctx.closePath();
        const g = ctx.createLinearGradient(-8, -75, 10, -65);
        g.addColorStop(0, shade(pal.metal, 0.3)); g.addColorStop(1, pal.metalDark);
        fs(ctx, g, 1.8);
        ctx.beginPath(); ctx.ellipse(1.8, -66, 13.5, 2.6, 0, 0, TAU); fs(ctx, pal.metalDark, 1.6);
        ctx.beginPath(); ctx.moveTo(1.8, -75); ctx.lineTo(1.8, -67); ctx.lineWidth = 1; ctx.strokeStyle = shade(pal.metal, 0.4); ctx.stroke();
      } else if (L.helmet === 'nasal') {
        ctx.beginPath();
        ctx.moveTo(-8, -63); ctx.quadraticCurveTo(-7, -74, 1.5, -77); ctx.quadraticCurveTo(10, -74, 11, -63); ctx.closePath();
        const g = ctx.createLinearGradient(-8, -77, 11, -63);
        g.addColorStop(0, shade(pal.metal, 0.3)); g.addColorStop(1, pal.metalDark);
        fs(ctx, g, 1.8);
        rr(ctx, -8.5, -65, 20, 3.4, 1.2); fs(ctx, pal.metalDark, 1.3);
        rr(ctx, 8, -64, 2.4, 8, 1); fs(ctx, pal.metalDark, 1.1);
      } else if (L.helmet === 'hood') {
        // kapuce: temeno a záda, obličej zůstává volný
        ctx.beginPath();
        ctx.arc(1.2, -63, 10.6, -0.35, 2.1, true);
        ctx.lineTo(-11, -51); ctx.lineTo(-3, -51.5);
        ctx.quadraticCurveTo(-2, -63, 9, -69.5);
        ctx.closePath();
        fs(ctx, pal.hood || pal.tunic, 1.8);
        ctx.beginPath(); ctx.moveTo(-8, -66); ctx.quadraticCurveTo(-15, -64, -16, -55); ctx.lineTo(-10, -59); ctx.closePath();
        fs(ctx, shade(pal.hood || pal.tunic, -0.2), 1.4);
      }
    }
    // Ozdoby helmy
    if (pal.ornament === 'horns') {
      const top = L.helmet === 'great' ? -70 : -68;
      ctx.beginPath(); ctx.moveTo(-4, top); ctx.quadraticCurveTo(-14, top - 4, -12, top - 14); ctx.quadraticCurveTo(-9, top - 6, -1, top - 3); ctx.closePath();
      fs(ctx, '#e9e2cf', 1.5);
      ctx.beginPath(); ctx.moveTo(6, top); ctx.quadraticCurveTo(14, top - 5, 12, top - 15); ctx.quadraticCurveTo(10, top - 6, 3, top - 3); ctx.closePath();
      fs(ctx, '#e9e2cf', 1.5);
    } else if (pal.ornament === 'crown') {
      const top = L.helmet === 'great' ? -74 : (L.helmet === 'nasal' ? -76 : -72);
      ctx.beginPath();
      ctx.moveTo(-5, top + 2); ctx.lineTo(-5, top - 4); ctx.lineTo(-2, top - 1); ctx.lineTo(1.5, top - 6); ctx.lineTo(5, top - 1); ctx.lineTo(8, top - 4); ctx.lineTo(8, top + 2); ctx.closePath();
      fs(ctx, '#f5d36b', 1.3);
    } else if (pal.ornament === 'crystal') {
      const top = L.helmet === 'great' ? -74 : -72;
      ctx.beginPath();
      ctx.moveTo(-4, top + 2); ctx.lineTo(-2, top - 8); ctx.lineTo(1, top); ctx.lineTo(3, top - 11); ctx.lineTo(5.5, top + 1); ctx.lineTo(8, top - 6); ctx.lineTo(8.5, top + 2); ctx.closePath();
      fs(ctx, '#e6f7ff', 1.3);
    }
  }

  function drawSwordArm(ctx, L, pal, atk, w, moving) {
    const idle = 5.6 + (moving ? Math.sin(w) * 0.12 : 0);
    let ang = idle;
    if (atk >= 0) {
      if (atk < 0.42) ang = lerp(idle, 2.55, ease(atk / 0.42));
      else if (atk < 0.66) ang = lerp(2.55, 5.45, ease((atk - 0.42) / 0.24));
      else ang = lerp(5.45, idle, (atk - 0.66) / 0.34);
    }
    const sleeve = L.armor === 'plate' ? pal.metal : (L.armor === 'mail' ? pal.metal : pal.tunic);
    ctx.save();
    ctx.translate(1, -50);
    ctx.rotate(ang);
    // paže
    rr(ctx, -3.6, -2, 7.2, 18, 3.4); fs(ctx, sleeve, 1.8);
    fist(ctx, 0, 17, L.armor === 'plate' ? pal.metalDark : pal.leather, -0.55);
    // meč (zápěstí lehce ohnuté dopředu)
    ctx.translate(0, 17); ctx.rotate(-0.55);
    const long = L.weapon === 'longsword';
    const bl = long ? 38 : 28, bw = long ? 2.9 : 2.4;
    if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 10; }
    ctx.beginPath(); ctx.moveTo(-bw, 5); ctx.lineTo(-bw, 5 + bl); ctx.lineTo(0, 9 + bl); ctx.lineTo(bw, 5 + bl); ctx.lineTo(bw, 5); ctx.closePath();
    const g = ctx.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, '#f6f8fb'); g.addColorStop(1, '#9aa3b0');
    fs(ctx, pal.glow ? shade(pal.metal, 0.5) : g, 1.6);
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 3 + bl); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(80,90,105,.8)'; ctx.stroke();
    rr(ctx, -7, 2.5, 14, 3.4, 1.4); fs(ctx, pal.trim, 1.4);
    rr(ctx, -1.6, -4, 3.2, 7, 1); fs(ctx, pal.leatherDark, 1.2);
    ctx.beginPath(); ctx.arc(0, -4.5, 2.1, 0, TAU); fs(ctx, pal.trim, 1.1);
    ctx.restore();
    if (L.armor === 'plate') {
      ctx.beginPath(); ctx.ellipse(1, -50, 7.5, 6, -0.2, Math.PI, TAU + 0.2); ctx.closePath();
      fs(ctx, shade(pal.metal, 0.12), 1.8);
    }
  }

  function drawBow(ctx, L, pal, atk) {
    let pull = 0.15;
    if (atk >= 0) pull = atk < 0.6 ? ease(atk / 0.6) : 0;
    const cx = 3, cy = -47, r = 18;
    const tipTop = [cx + r * Math.cos(-1.12), cy + r * Math.sin(-1.12)];
    const tipBot = [cx + r * Math.cos(1.12), cy + r * Math.sin(1.12)];
    const px = tipTop[0] - pull * 15, py = cy;
    // zadní (natahující) paže
    limb(ctx, -2, -50, px, py, 5, shade(pal.tunic, -0.2));
    fist(ctx, px, py, pal.leather, 1.57);
    // tětiva
    ctx.beginPath(); ctx.moveTo(tipTop[0], tipTop[1]); ctx.lineTo(px, py); ctx.lineTo(tipBot[0], tipBot[1]);
    ctx.lineWidth = 1.1; ctx.strokeStyle = pal.string; ctx.stroke();
    // šíp
    if (atk < 0 || atk < 0.6) {
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 27, py);
      ctx.lineWidth = 3.4; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#d8c39a'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + 27, py - 3); ctx.lineTo(px + 32, py); ctx.lineTo(px + 27, py + 3); ctx.closePath(); fs(ctx, '#c9ced6', 1.1);
      ctx.beginPath(); ctx.moveTo(px + 1, py); ctx.lineTo(px - 3, py - 3); ctx.lineTo(px + 4, py); ctx.lineTo(px - 3, py + 3); ctx.closePath(); fs(ctx, '#f2f2f2', 0.9);
    }
    // přední paže a luk
    limb(ctx, 1, -50, cx + r - 1, cy, 5.2, pal.tunic);
    if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 8; }
    ctx.beginPath(); ctx.arc(cx, cy, r, -1.12, 1.12);
    ctx.lineWidth = 5.6; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 3.2; ctx.strokeStyle = pal.glow ? pal.metal : pal.wood; ctx.stroke();
    ctx.shadowBlur = 0;
    rr(ctx, cx + r - 2.5, cy - 4, 5, 8, 1.5); fs(ctx, pal.leatherDark, 1.2);
    fist(ctx, cx + r, cy, pal.skin, 0);
  }

  function drawSpear(ctx, L, pal, atk, moving, w) {
    const tx = atk >= 0 ? Math.sin(atk * Math.PI) * 16 : 0;
    const ang = atk >= 0 ? -0.02 : -0.16 + (moving ? Math.sin(w) * 0.03 : 0);
    ctx.save();
    ctx.translate(-4 + tx, -44);
    ctx.rotate(ang);
    if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 8; }
    limb(ctx, -18, 0, 46, 0, 2.6, pal.glow ? pal.metalDark : pal.wood);
    ctx.beginPath(); ctx.moveTo(45, -3.6); ctx.quadraticCurveTo(54, -2, 60, 0); ctx.quadraticCurveTo(54, 2, 45, 3.6); ctx.closePath();
    fs(ctx, shade(pal.metal, 0.25), 1.5);
    ctx.shadowBlur = 0;
    rr(ctx, 42, -2.4, 4, 4.8, 1); fs(ctx, pal.trim, 1);
    ctx.restore();
    // přední paže
    const hx = -4 + tx + 16 * Math.cos(ang), hy = -44 + 16 * Math.sin(ang);
    limb(ctx, 2, -49, hx, hy, 5.4, L.armor === 'mail' ? pal.metal : pal.tunic);
    fist(ctx, hx, hy, pal.leather, -1.57);
  }

  /* ---------------------------------------------------------------------
     HRAD – kreslí se jednou do skrytého plátna (cache), pak se jen
     vykresluje jako obrázek. Šířka 320, výška 380, patka dole.
     --------------------------------------------------------------------- */
  const CASTLE_W = 320, CASTLE_H = 380;
  const castleCache = new Map();

  function stoneBlock(ctx, x, y, w, h, pal, rand, opts = {}) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, shade(pal.stone, 0.08)); g.addColorStop(0.6, pal.stone); g.addColorStop(1, pal.stoneDark);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const rowH = opts.rowH || 11;
    let row = 0;
    for (let yy = y; yy < y + h; yy += rowH, row++) {
      const off = row % 2 ? 0 : -10;
      for (let xx = x + off; xx < x + w; xx += 20) {
        const t = rand();
        if (t < 0.18) { ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(xx + 1, yy + 1, 18, rowH - 2); }
        else if (t > 0.86) { ctx.fillStyle = 'rgba(0,0,0,.10)'; ctx.fillRect(xx + 1, yy + 1, 18, rowH - 2); }
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(xx, yy, 1.2, rowH);
      }
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, yy, w, 1.2);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, yy + 1.2, w, 1);
    }
    // stín u paty
    const sg = ctx.createLinearGradient(0, y + h - 40, 0, y + h);
    sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = sg; ctx.fillRect(x, y + h - 40, w, 40);
    ctx.restore();
    ctx.lineWidth = 2.4; ctx.strokeStyle = OUT; ctx.strokeRect(x, y, w, h);
  }
  function crenels(ctx, x, y, w, pal, size = 12) {
    const n = Math.max(2, Math.round(w / (size * 1.6)));
    const step = w / n;
    for (let i = 0; i < n; i++) {
      const bx = x + i * step + step * 0.12;
      ctx.beginPath(); ctx.rect(bx, y - size, step * 0.62, size); fs(ctx, pal.stoneLight, 2);
    }
    ctx.beginPath(); ctx.rect(x - 4, y - 2, w + 8, 7); fs(ctx, pal.stone, 2);
  }
  function roof(ctx, cx, baseY, w, h, pal) {
    ctx.beginPath(); ctx.moveTo(cx - w / 2 - 6, baseY); ctx.lineTo(cx, baseY - h); ctx.lineTo(cx + w / 2 + 6, baseY); ctx.closePath();
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, shade(pal.roof, 0.18)); g.addColorStop(0.5, pal.roof); g.addColorStop(1, pal.roofDark);
    fs(ctx, g, 2.4);
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.2;
    for (let i = 1; i < 6; i++) {
      const yy = baseY - (h * i) / 6;
      ctx.beginPath(); ctx.moveTo(cx - w, yy); ctx.lineTo(cx + w, yy); ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); ctx.rect(cx - w / 2 - 8, baseY - 2, w + 16, 6); fs(ctx, pal.roofDark, 2);
  }
  function windowSlit(ctx, x, y, w, h, pal) {
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
    if (pal.glowWindows) { ctx.save(); ctx.shadowColor = pal.window; ctx.shadowBlur = 12; fs(ctx, pal.window, 2); ctx.restore(); }
    else fs(ctx, pal.window, 2);
  }
  function banner(ctx, x, y, w, h, pal) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w / 2, y + h - 12); ctx.lineTo(x, y + h); ctx.closePath();
    fs(ctx, pal.banner, 2);
    ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + w - 3, y + 3); ctx.lineTo(x + w - 3, y + h - 5); ctx.lineTo(x + w / 2, y + h - 16); ctx.lineTo(x + 3, y + h - 5); ctx.closePath();
    ctx.lineWidth = 1.6; ctx.strokeStyle = pal.emblem; ctx.stroke();
    // erb (znak hradu)
    const cx = x + w / 2, cy = y + h * 0.42;
    if (window.Art && Art.drawEmblem) Art.drawEmblem(ctx, pal.emblemId || 'lilie', cx, cy, Math.min(w * 0.5, 14), pal.emblem);
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + w + 4, y); ctx.lineWidth = 4; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = pal.trim; ctx.stroke();
  }

  /* Vrátí {canvas, flags:[{x,y}], towerTop:{x,y}} – hrad čelem doprava */
  function castleImage(team, skinId, level, res = 2, style = 'evropa', cfg = null) {
    if (cfg && cfg.big) return bigCastleImage(team, skinId, level, res, style, cfg);
    if (cfg && cfg.small) return smallCastleImage(team, skinId, level, res, style, cfg);
    const key = team + '|' + skinId + '|' + Math.min(level, 10) + '|' + res + '|' + style + '|' + (cfg ? JSON.stringify(cfg) : '');
    if (castleCache.has(key)) return castleCache.get(key);
    const pal = castlePalette(team, skinId, cfg);
    const cv = document.createElement('canvas');
    const PT0 = window.ArtThemes || {};
    const dim = (PT0.castleSize && PT0.castleSize[style]) || { w: CASTLE_W, h: CASTLE_H };
    cv.width = dim.w * res; cv.height = dim.h * res;
    const ctx = cv.getContext('2d');
    ctx.scale(res, res);
    const PT = window.ArtThemes || {};
    if (style !== 'evropa' && PT.castle && PT.castle[style]) {
      const r = PT.castle[style](ctx, pal, level, rng(skinId.length * 31 + level * 7 + (team === 'player' ? 3 : 9)));
      const out = Object.assign({ canvas: cv, w: dim.w, h: dim.h, pal, cfg }, r);
      if (cfg && window.Art.decorateCastle) Art.decorateCastle(ctx, out, cfg, style);
      if (cfg && cfg.banner) out.flagColor = cfg.banner;
      castleCache.set(key, out);
      return out;
    }
    const rand = rng(skinId.length * 97 + level * 13 + (team === 'player' ? 1 : 7));
    const flags = [];
    const B = CASTLE_H; // patka

    // zadní levá věž
    stoneBlock(ctx, 14, 92, 62, B - 92, pal, rand);
    crenels(ctx, 14, 92, 62, pal, 10);
    roof(ctx, 45, 82, 62, 78, pal); flags.push({ x: 45, y: 4 });
    windowSlit(ctx, 38, 130, 14, 30, pal);
    windowSlit(ctx, 38, 200, 14, 30, pal);

    // hlavní palác (keep)
    stoneBlock(ctx, 70, 118, 120, B - 118, pal, rand);
    crenels(ctx, 70, 118, 120, pal, 12);
    windowSlit(ctx, 92, 150, 16, 34, pal);
    windowSlit(ctx, 152, 150, 16, 34, pal);
    banner(ctx, 116, 128, 28, 82, pal);

    // zadní pravá věž
    stoneBlock(ctx, 184, 132, 54, B - 132, pal, rand);
    crenels(ctx, 184, 132, 54, pal, 10);
    roof(ctx, 211, 122, 54, 64, pal); flags.push({ x: 211, y: 58 });
    windowSlit(ctx, 205, 165, 12, 26, pal);

    // úroveň 4+: malá vížka na hradbách
    if (level >= 4) {
      stoneBlock(ctx, 2, 214, 34, B - 214, pal, rand, { rowH: 10 });
      roof(ctx, 19, 206, 34, 40, pal); flags.push({ x: 19, y: 166 });
    }

    // přední hradba
    stoneBlock(ctx, 0, 246, 248, B - 246, pal, rand);
    crenels(ctx, 0, 246, 248, pal, 12);

    // brána – věž u brány
    stoneBlock(ctx, 236, 178, 82, B - 178, pal, rand);
    crenels(ctx, 236, 178, 82, pal, 12);
    windowSlit(ctx, 268, 205, 14, 28, pal);
    // brána
    ctx.beginPath(); ctx.moveTo(252, B); ctx.lineTo(252, 316); ctx.arc(277, 316, 25, Math.PI, 0); ctx.lineTo(302, B); ctx.closePath();
    fs(ctx, '#1a1712', 2.5);
    ctx.save(); ctx.clip();
    ctx.strokeStyle = '#4a4036'; ctx.lineWidth = 3;
    for (let xx = 256; xx < 302; xx += 9) { ctx.beginPath(); ctx.moveTo(xx, 285); ctx.lineTo(xx, B); ctx.stroke(); }
    for (let yy = 300; yy < B; yy += 12) { ctx.beginPath(); ctx.moveTo(250, yy); ctx.lineTo(304, yy); ctx.stroke(); }
    ctx.restore();
    // klenák
    ctx.beginPath(); ctx.arc(277, 316, 29, Math.PI, 0); ctx.lineWidth = 7; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 4.5; ctx.strokeStyle = pal.stoneLight; ctx.stroke();

    // úroveň 7+: zlaté pásy na hradbách
    if (level >= 7) {
      ctx.beginPath(); ctx.rect(0, 262, 318, 5); fs(ctx, pal.trim, 1.5);
      banner(ctx, 18, 262, 22, 58, pal);
      banner(ctx, 200, 262, 22, 58, pal);
    }

    const out = { canvas: cv, w: CASTLE_W, h: CASTLE_H, flags, towerTop: { x: 277, y: 170 }, pal, cfg };
    if (cfg && window.Art.decorateCastle) Art.decorateCastle(ctx, out, cfg, style);
    if (cfg && cfg.banner) out.flagColor = cfg.banner;
    castleCache.set(key, out);
    return out;
  }

  /* MALÝ HRAD (základní hrad hráče): stejný hrad zmenšený na 75 %. */
  function smallCastleImage(team, skinId, level, res, style, cfg) {
    const key = 'SMALL|' + team + '|' + skinId + '|' + Math.min(level, 10) + '|' + res + '|' + style + '|' + JSON.stringify(cfg);
    if (castleCache.has(key)) return castleCache.get(key);
    const base = castleImage(team, skinId, level, res, style, Object.assign({}, cfg, { small: false }));
    const S = 0.75, W = Math.round(base.w * S), H = Math.round(base.h * S);
    const cv = document.createElement('canvas');
    cv.width = W * res; cv.height = H * res;
    cv.getContext('2d').drawImage(base.canvas, 0, 0, W * res, H * res);
    const out = Object.assign({}, base, {
      canvas: cv, w: W, h: H,
      flags: (base.flags || []).map(f => ({ x: f.x * S, y: f.y * S })),
      towerTop: base.towerTop ? { x: base.towerTop.x * S, y: base.towerTop.y * S } : null,
      gates: base.gates ? base.gates.map(g => Object.assign({}, g, { x: g.x * S })) : base.gates,
      big: { S, ox: 0, oy: 0, extra: [] }, small: true
    });
    castleCache.set(key, out);
    return out;
  }

  /* VELKÁ PEVNOST (z obchodu): původní hrad zvětšený o 20 % a za ním
     mohutný donjon se dvěma nárožními věžemi. Má místo pro 10 obránců. */
  function bigCastleImage(team, skinId, level, res, style, cfg) {
    const key = 'BIG|' + team + '|' + skinId + '|' + Math.min(level, 10) + '|' + res + '|' + style + '|' + JSON.stringify(cfg);
    if (castleCache.has(key)) return castleCache.get(key);
    const base = castleImage(team, skinId, level, res, style, Object.assign({}, cfg, { big: false }));
    const S = 1.2, bw = base.w * S, bh = base.h * S;
    const W = Math.round(bw + 30), H = Math.round(bh + 70), ox = W - bw, oy = H - bh;
    const cv = document.createElement('canvas');
    cv.width = W * res; cv.height = H * res;
    const ctx = cv.getContext('2d'); ctx.scale(res, res);
    const pal = base.pal, rand = rng(skinId.length * 53 + level * 11);
    // donjon a nárožní věže za hradem
    const dx = ox + bw * 0.36, dw = 120, dy = 40;
    stoneBlock(ctx, dx - 70, dy + 70, 52, H - dy - 70, pal, rand);
    crenels(ctx, dx - 70, dy + 70, 52, pal, 10);
    roof(ctx, dx - 44, dy + 62, 52, 52, pal);
    stoneBlock(ctx, dx + dw + 18, dy + 84, 52, H - dy - 84, pal, rand);
    crenels(ctx, dx + dw + 18, dy + 84, 52, pal, 10);
    roof(ctx, dx + dw + 44, dy + 76, 52, 48, pal);
    stoneBlock(ctx, dx, dy, dw, H - dy, pal, rand);
    crenels(ctx, dx, dy, dw, pal, 12);
    windowSlit(ctx, dx + 24, dy + 34, 14, 30, pal);
    windowSlit(ctx, dx + dw - 38, dy + 34, 14, 30, pal);
    banner(ctx, dx + dw / 2 - 16, dy + 22, 32, 74, pal);
    ctx.drawImage(base.canvas, ox, oy, bw, bh);
    const out = Object.assign({}, base, {
      canvas: cv, w: W, h: H,
      flags: (base.flags || []).map(f => ({ x: ox + f.x * S, y: oy + f.y * S })).concat([{ x: dx - 44, y: dy + 10 }, { x: dx + dw + 44, y: dy + 28 }]),
      towerTop: base.towerTop ? { x: ox + base.towerTop.x * S, y: oy + base.towerTop.y * S } : null,
      gates: base.gates ? base.gates.map(g => Object.assign({}, g, { x: ox + g.x * S })) : base.gates,
      // pro obranu: přepočet míst původního hradu + 5 nových míst na donjonu a hradbách
      big: { S, ox, oy, extra: [[dx + 22, dy + 18], [dx + dw / 2, dy + 18], [dx + dw - 22, dy + 18], [dx - 44, dy + 88], [dx + dw + 44, dy + 102]] }
    });
    castleCache.set(key, out);
    return out;
  }

  /* Vykreslí hrad do scény. front = x souřadnice brány, groundY = patka. */
  function drawCastle(ctx, img, front, groundY, facing, t, hpRatio, flagColor) {
    flagColor = img.flagColor || flagColor;
    const x0 = facing === 1 ? front - img.w + 2 : front - 2;
    const dec = (img.cfg && img.cfg.decor) || {};
    ctx.save();
    if (facing === 1) ctx.drawImage(img.canvas, x0, groundY - img.h, img.w, img.h);
    else {
      ctx.translate(front - 2 + img.w, groundY - img.h);
      ctx.scale(-1, 1);
      ctx.drawImage(img.canvas, 0, 0, img.w, img.h);
    }
    ctx.restore();
    // vlající vlajky
    for (const f of img.flags) {
      const fx = facing === 1 ? x0 + f.x : front - 2 + (img.w - f.x);
      const fy = groundY - img.h + f.y;
      ctx.beginPath(); ctx.moveTo(fx, fy + 4); ctx.lineTo(fx, fy - 26);
      ctx.lineWidth = 2.4; ctx.strokeStyle = OUT; ctx.stroke();
      if (dec.zlato) { ctx.beginPath(); ctx.arc(fx, fy - 28, 3.2, 0, TAU); fs(ctx, '#f2c94c', 1.4); }
      const dir = facing;
      ctx.beginPath(); ctx.moveTo(fx, fy - 26);
      for (let i = 0; i <= 8; i++) {
        const px = fx + dir * i * 3.2, py = fy - 26 + Math.sin(t * 6 + i * 0.7) * 1.6 * (i / 8);
        ctx.lineTo(px, py);
      }
      for (let i = 8; i >= 0; i--) {
        const px = fx + dir * i * 3.2, py = fy - 14 + Math.sin(t * 6 + i * 0.7) * 1.6 * (i / 8) - i * 0.5;
        ctx.lineTo(px, py);
      }
      ctx.closePath(); fs(ctx, flagColor, 1.6);
    }
    // pochodně u brány (dekorace)
    if (dec.pochodne) {
      for (const lx of [244, 310]) {
        const tx = facing === 1 ? x0 + lx : front - 2 + (img.w - lx), ty = groundY - img.h + 298;
        const gl = ctx.createRadialGradient(tx, ty - 10, 2, tx, ty - 10, 34);
        gl.addColorStop(0, 'rgba(255,200,90,.45)'); gl.addColorStop(1, 'rgba(255,160,60,0)');
        ctx.fillStyle = gl; ctx.fillRect(tx - 36, ty - 46, 72, 72);
        ctx.beginPath(); ctx.moveTo(tx - 3, ty + 12); ctx.lineTo(tx + 3, ty + 12); ctx.lineTo(tx + 4, ty - 2); ctx.lineTo(tx - 4, ty - 2); ctx.closePath(); fs(ctx, '#4a3424', 1.4);
        const fl = Math.sin(t * 13 + lx) * 1.6, fh = 13 + Math.sin(t * 9 + lx * 0.3) * 2.5;
        ctx.beginPath(); ctx.moveTo(tx - 5, ty - 2); ctx.quadraticCurveTo(tx - 6 + fl, ty - fh * 0.6, tx + fl, ty - fh); ctx.quadraticCurveTo(tx + 6 + fl, ty - fh * 0.5, tx + 5, ty - 2); ctx.closePath();
        ctx.fillStyle = '#ff8a2a'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(tx - 2.5, ty - 2); ctx.quadraticCurveTo(tx - 2 + fl * 0.5, ty - fh * 0.45, tx + fl * 0.6, ty - fh * 0.75); ctx.quadraticCurveTo(tx + 3, ty - fh * 0.4, tx + 2.5, ty - 2); ctx.closePath();
        ctx.fillStyle = '#ffe9a0'; ctx.fill();
      }
    }
    // praskliny při poškození
    if (hpRatio < 0.66) {
      ctx.save();
      ctx.strokeStyle = 'rgba(20,16,12,.85)'; ctx.lineWidth = 2;
      const cx = facing === 1 ? x0 + 140 : front + img.w - 140;
      const draw = (sx, sy, segs) => { ctx.beginPath(); ctx.moveTo(sx, sy); let x = sx, y = sy; for (const [dx, dy] of segs) { x += dx * facing; y += dy; ctx.lineTo(x, y); } ctx.stroke(); };
      draw(cx, groundY - 250, [[8, 14], [-6, 12], [10, 16], [-4, 10]]);
      if (hpRatio < 0.4) {
        draw(cx + 90 * facing, groundY - 180, [[-10, 12], [6, 14], [-8, 12]]);
        draw(cx - 70 * facing, groundY - 120, [[6, 10], [-8, 12], [5, 14]]);
      }
      ctx.restore();
    }
  }

  /* ---------------------------------------------------------------------
     POZADÍ BOJIŠTĚ (vykreslí se jednou)
     --------------------------------------------------------------------- */
  function pine(ctx, x, y, h, col, dark) {
    const w = h * 0.42;
    ctx.fillStyle = col;
    for (let i = 0; i < 3; i++) {
      const ty = y - h + i * h * 0.26, bw = w * (0.55 + i * 0.25);
      ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x + bw, ty + h * 0.42); ctx.lineTo(x - bw, ty + h * 0.42); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w * 1.05, y - h * 0.06); ctx.lineTo(x, y - h * 0.06); ctx.closePath(); ctx.fill();
  }
  function mountains(ctx, W, baseY, peakMin, peakMax, step, col, snow, rand) {
    const pts = [];
    for (let x = -50; x <= W + 50; x += step * (0.6 + rand() * 0.8)) {
      pts.push([x, baseY - (peakMin + rand() * (peakMax - peakMin))]);
    }
    ctx.beginPath(); ctx.moveTo(-60, baseY + 200);
    pts.forEach(([x, y], i) => { if (i % 2) ctx.lineTo(x, y); else ctx.lineTo(x, y + (baseY - y) * 0.45); });
    ctx.lineTo(W + 60, baseY + 200); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    if (snow) {
      ctx.fillStyle = snow;
      pts.forEach(([x, y], i) => {
        if (!(i % 2)) return;
        const prev = pts[i - 1], next = pts[i + 1] || [x + 60, y + 60];
        const py = prev[1] + (baseY - prev[1]) * 0.45, ny = next[1] + (baseY - next[1]) * 0.45;
        const k = 0.28;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x + (next[0] - x) * k, y + (ny - y) * k);
        ctx.lineTo(x + (next[0] - x) * k * 0.5, y + (ny - y) * k * 0.8);
        ctx.lineTo(x - (x - prev[0]) * k * 0.4, y + (py - y) * k * 0.9);
        ctx.lineTo(x - (x - prev[0]) * k, y + (py - y) * k);
        ctx.closePath(); ctx.fill();
      });
    }
  }

  function drawBattleBackground(ctx, W, H, seed, theme, layer) {
    const PT = window.ArtThemes || {};
    if (theme && PT.battle && PT.battle[theme]) return PT.battle[theme](ctx, W, H, seed, layer);
    const rand = rng(seed || 7);
    const C = GameData.battleConfig;
    // nebe
    const sky = ctx.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, '#3f86d6'); sky.addColorStop(0.55, '#8cc4ef'); sky.addColorStop(1, '#d9eef8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // slunce
    const sun = ctx.createRadialGradient(1120, 120, 10, 1120, 120, 220);
    sun.addColorStop(0, 'rgba(255,248,220,.95)'); sun.addColorStop(0.15, 'rgba(255,244,200,.55)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, 400);
    // mraky
    for (let i = 0; i < 9; i++) {
      const cx = rand() * W, cy = 70 + rand() * 120, s = 0.6 + rand() * 0.9;
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let j = 0; j < 5; j++) {
        ctx.beginPath(); ctx.ellipse(cx + (j - 2) * 26 * s, cy + Math.abs(j - 2) * 5 * s, 34 * s, 16 * s, 0, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = 'rgba(160,190,220,.35)';
      ctx.beginPath(); ctx.ellipse(cx, cy + 12 * s, 70 * s, 6 * s, 0, 0, TAU); ctx.fill();
    }
    // hory
    mountains(ctx, W, 330, 120, 220, 110, '#8aa6c8', '#f4f8fc', rand);
    mountains(ctx, W, 360, 70, 150, 90, '#6d8bb0', '#e6eef7', rand);
    // opar
    const haze = ctx.createLinearGradient(0, 280, 0, 380);
    haze.addColorStop(0, 'rgba(220,236,248,0)'); haze.addColorStop(1, 'rgba(220,236,248,.6)');
    ctx.fillStyle = haze; ctx.fillRect(0, 280, W, 100);
    // vzdálené lesy
    for (let x = -10; x < W + 10; x += 9 + rand() * 6) pine(ctx, x, 392 + rand() * 6, 26 + rand() * 18, '#3c6a62', '#2f554f');
    // kopce
    ctx.fillStyle = '#6ea04a';
    ctx.beginPath(); ctx.moveTo(0, 410);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 398 + Math.sin(x * 0.006) * 10 + Math.sin(x * 0.017) * 5);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    for (let x = -10; x < W + 10; x += 14 + rand() * 12) pine(ctx, x, 428 + rand() * 10, 36 + rand() * 26, '#2f6b3a', '#24552d');
    // louka
    const gr = ctx.createLinearGradient(0, 430, 0, H);
    gr.addColorStop(0, '#7fb24c'); gr.addColorStop(1, '#4f8a33');
    ctx.fillStyle = gr; ctx.fillRect(0, 438, W, H - 438);
    // cesta (bojová linie)
    const road = ctx.createLinearGradient(0, C.laneTop - 16, 0, C.laneBottom + 16);
    road.addColorStop(0, '#b89566'); road.addColorStop(0.5, '#a5814f'); road.addColorStop(1, '#8f6d40');
    ctx.fillStyle = road;
    ctx.beginPath(); ctx.moveTo(0, C.laneTop - 14);
    for (let x = 0; x <= W; x += 50) ctx.lineTo(x, C.laneTop - 14 + Math.sin(x * 0.02) * 3);
    for (let x = W; x >= 0; x -= 50) ctx.lineTo(x, C.laneBottom + 14 + Math.sin(x * 0.015) * 4);
    ctx.closePath(); ctx.fill();
    // stopy a kamínky na cestě
    for (let i = 0; i < 260; i++) {
      const x = rand() * W, y = C.laneTop - 8 + rand() * (C.laneBottom - C.laneTop + 16);
      ctx.fillStyle = rand() < 0.5 ? 'rgba(90,64,34,.35)' : 'rgba(230,205,160,.35)';
      ctx.beginPath(); ctx.ellipse(x, y, 2 + rand() * 4, 1 + rand() * 1.5, 0, 0, TAU); ctx.fill();
    }
    // tráva v popředí
    for (let i = 0; i < 520; i++) {
      const x = rand() * W;
      let y = 444 + rand() * (H - 444);
      if (y > C.laneTop - 18 && y < C.laneBottom + 18) continue;
      const h = 5 + rand() * 9;
      ctx.strokeStyle = rand() < 0.5 ? '#3e7a2a' : '#94c45a'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 2, y - h * 0.6, x + 4 - rand() * 8, y - h); ctx.stroke();
    }
    // kytičky
    for (let i = 0; i < 70; i++) {
      const x = rand() * W, y = 446 + rand() * 20;
      ctx.fillStyle = ['#f6e27a', '#ffffff', '#e57373'][i % 3];
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
    }
    // kameny v popředí
    for (let i = 0; i < 10; i++) {
      const x = 300 + rand() * (W - 600), y = C.laneBottom + 28 + rand() * 20, r = 8 + rand() * 12;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, 0, Math.PI, TAU); ctx.closePath(); fs(ctx, '#8b8f96', 2);
      ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.5, r * 0.6, r * 0.25, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
    }
  }

  /* ---------------------------------------------------------------------
     MAPA PŘÍBĚHU (tři oblasti: údolí dole, hory uprostřed, led nahoře)
     --------------------------------------------------------------------- */
  function drawStoryMap(ctx, W, H, theme) {
    const PT = window.ArtThemes || {};
    if (theme && PT.map && PT.map[theme]) return PT.map[theme](ctx, W, H);
    const rand = rng(42);
    // moře
    ctx.fillStyle = '#1d4f73'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) {
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1.5;
      const x = rand() * W, y = rand() * H;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 3, x + 12, y); ctx.stroke();
    }
    // pevnina
    const land = (fill, y0, y1, wob) => {
      ctx.beginPath(); ctx.moveTo(W * 0.06, y1);
      for (let y = y1; y >= y0; y -= 20) ctx.lineTo(W * 0.04 + Math.sin(y * 0.03) * wob, y);
      for (let y = y0; y <= y1; y += 20) ctx.lineTo(W * 0.96 + Math.sin(y * 0.025) * wob, y);
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    };
    land('#e8f1f7', H * 0.0, H * 0.34, 10);
    land('#4b4350', H * 0.3, H * 0.66, 12);
    land('#5f9a3c', H * 0.62, H * 1.0, 10);
    // přechody
    const blend = (y, c1, c2) => { const g = ctx.createLinearGradient(0, y - 30, 0, y + 30); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(W * 0.05, y - 30, W * 0.9, 60); };
    blend(H * 0.32, '#e8f1f7', '#4b4350');
    blend(H * 0.64, '#4b4350', '#5f9a3c');
    // led – zasněžené vrcholky
    for (let i = 0; i < 26; i++) {
      const x = W * (0.08 + rand() * 0.84), y = H * (0.04 + rand() * 0.27), s = 14 + rand() * 18;
      ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.7); ctx.lineTo(x, y - s * 0.7); ctx.lineTo(x + s, y + s * 0.7); ctx.closePath();
      fs(ctx, '#9fc3dc', 1.4);
      ctx.beginPath(); ctx.moveTo(x - s * 0.35, y - s * 0.2); ctx.lineTo(x, y - s * 0.7); ctx.lineTo(x + s * 0.35, y - s * 0.2); ctx.closePath();
      ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    // hory – tmavé vrcholy a láva
    for (let i = 0; i < 26; i++) {
      const x = W * (0.08 + rand() * 0.84), y = H * (0.34 + rand() * 0.28), s = 14 + rand() * 20;
      ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.7); ctx.lineTo(x, y - s * 0.75); ctx.lineTo(x + s, y + s * 0.7); ctx.closePath();
      fs(ctx, i % 5 === 0 ? '#6b3a2e' : '#625a6a', 1.4);
      if (i % 5 === 0) { ctx.beginPath(); ctx.arc(x, y - s * 0.7, 3.5, 0, TAU); ctx.fillStyle = '#ff7a2f'; ctx.fill(); }
    }
    // údolí – lesy a pole
    for (let i = 0; i < 70; i++) {
      const x = W * (0.07 + rand() * 0.86), y = H * (0.66 + rand() * 0.32);
      pine(ctx, x, y, 14 + rand() * 10, '#2f6b3a', '#24552d');
    }
    for (let i = 0; i < 6; i++) {
      const x = W * (0.1 + rand() * 0.75), y = H * (0.7 + rand() * 0.25);
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.3 + rand() * 0.6);
      ctx.fillStyle = i % 2 ? '#c9b25a' : '#8fbf4a'; ctx.fillRect(-18, -10, 36, 20);
      ctx.restore();
    }
    // řeka
    ctx.beginPath(); ctx.moveTo(W * 0.96, H * 0.72);
    ctx.bezierCurveTo(W * 0.7, H * 0.78, W * 0.62, H * 0.9, W * 0.4, H * 0.95);
    ctx.lineTo(W * 0.38, H * 1.0);
    ctx.lineWidth = 9; ctx.strokeStyle = '#3d86b8'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.stroke();
  }

  /* Malý obrázek jednotky do tlačítka / karty */
  function renderUnitIcon(canvas, unitId, team, skinId, opts = {}) {
    const faction = opts.faction || (GameData.units[unitId] && GameData.units[unitId].faction);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth || canvas.width, ch = canvas.clientHeight || canvas.height;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    const def = opts.def || GameData.units[unitId];
    const sk0 = GameData.unitSkins.find(x => x.id === skinId);
    let s = (opts.zoom || 1) * Math.min(cw / 70, ch / 92) * (sk0 && sk0.mount && !opts.headshot ? 0.66 : 1);
    ctx.save();
    if (opts.headshot) { s = ch / 27; ctx.translate(cw / 2 - 2 * s - (sk0 && sk0.mount ? 6 * s : 0), ch / 2 + (64 + (sk0 && sk0.mount ? 27 : 0)) * s); }
    else ctx.translate(cw / 2 - 2 * s, ch - (opts.pad || 6) * s);
    ctx.scale(s, s);
    drawUnit(ctx, def, opts.pal || unitPalette(team, skinId, faction), { x: 0, y: 0, facing: 1, walk: opts.walk || 0, moving: !!opts.moving, atk: opts.atk == null ? -1 : opts.atk, t: opts.t || 0, noShadow: !!opts.noShadow });
    ctx.restore();
  }

  function renderCastleIcon(canvas, team, skinId, level, style) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth || canvas.width, ch = canvas.clientHeight || canvas.height;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    const img = castleImage(team, skinId, level || 1, 2, style || 'evropa');
    const s = Math.min(cw / (img.w + 30), ch / (img.h + 40));
    const fx = cw / 2 + (img.w * s) / 2;
    ctx.save();
    ctx.scale(s, s);
    drawCastle(ctx, img, fx / s, ch / s - 4, 1, 0.5, 1, GameData.teamCastleColors[team].banner);
    ctx.restore();
  }

  window.Art = {
    OUT, rng, shade, fs, rr, limb, ease, lerp, fist, face, SH, drawSwordArm, drawBow, drawSpear, stoneBlock, crenels, windowSlit, banner, CASTLE_W, CASTLE_H,
    unitPalette, castlePalette, drawUnit, castleImage, drawCastle,
    drawBattleBackground, drawStoryMap, renderUnitIcon, renderCastleIcon, pine, mountains
  };
})();
