/* =========================================================================
   GRAFIKA DÉMONŮ A PEKLA
   - díly postav: rohy, drápy, trojzubec, plamenný meč, ohnivá koule,
     netopýří křídla, ocas, černá pekelná zbroj, koruna Démonického krále
   - hrad 'peklo' (obsidiánová pevnost), bojiště 'peklo', mapa 'peklo'
   ========================================================================= */
(function () {
  const { OUT, shade, fs, rr, limb, ease, lerp, rng, fist } = Art;
  const TAU = Math.PI * 2;
  const P = window.ArtParts;
  const T = window.ArtThemes;

  /* ---------------- křídla a ocas (za tělem) ---------------- */
  const prevBack = P.back;
  P.back = (ctx, L, pal, st, moving, w, bob) => {
    if (L.wings) wings(ctx, L, pal, st, moving, w, bob);
    if (L.tail) tail(ctx, pal, st, moving, w);
    if (prevBack) prevBack(ctx, L, pal, st, moving, w, bob);
  };
  function wings(ctx, L, pal, st, moving, w, bob) {
    const big = L.wings === 'big';
    const k = big ? 1 : 0.62;
    const flap = moving ? Math.sin(w * 1.3) * 0.12 : Math.sin((st.t || 0) * 2.4) * 0.05;
    const col = pal.wing || '#5a1410';
    ctx.save();
    ctx.translate(-3, -50 + bob);
    ctx.rotate(-0.12 + flap);
    // kostra křídla: rameno → loket → tři prsty
    const elbow = [-14 * k, -26 * k], tips = [[-34 * k, -40 * k], [-36 * k, -16 * k], [-30 * k, 6 * k]];
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(elbow[0], elbow[1]); ctx.lineTo(tips[0][0], tips[0][1]);
    ctx.quadraticCurveTo(-28 * k, -24 * k, tips[1][0], tips[1][1]);
    ctx.quadraticCurveTo(-26 * k, -6 * k, tips[2][0], tips[2][1]);
    ctx.quadraticCurveTo(-14 * k, 0, 0, 10 * k);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -40 * k, -30 * k, 10 * k);
    g.addColorStop(0, shade(col, 0.15)); g.addColorStop(1, shade(col, -0.35));
    fs(ctx, g, 1.6);
    ctx.lineWidth = 1.7; ctx.strokeStyle = shade(col, -0.55);
    for (const tp of tips) { ctx.beginPath(); ctx.moveTo(elbow[0], elbow[1]); ctx.lineTo(tp[0], tp[1]); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(elbow[0], elbow[1]); ctx.lineWidth = 2.6; ctx.stroke();
    // dráp na kloubu
    ctx.beginPath(); ctx.moveTo(elbow[0], elbow[1]); ctx.lineTo(elbow[0] - 2 * k, elbow[1] - 6 * k); ctx.lineTo(elbow[0] + 2, elbow[1] - 1); ctx.closePath(); fs(ctx, pal.horn || '#e8dcc0', 1);
    ctx.restore();
  }
  function tail(ctx, pal, st, moving, w) {
    const sw = moving ? Math.sin(w) * 3 : Math.sin((st.t || 0) * 3) * 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, -30);
    ctx.bezierCurveTo(-20, -24, -20 + sw, -6, -30 + sw, -10);
    ctx.lineWidth = 5.6; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = shade(pal.skin, -0.12); ctx.stroke();
    // šípovitá špička
    ctx.save(); ctx.translate(-30 + sw, -10); ctx.rotate(-2.6);
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(7, 0); ctx.lineTo(0, 5); ctx.lineTo(2, 0); ctx.closePath(); fs(ctx, shade(pal.skin, -0.3), 1.2);
    ctx.restore();
  }

  /* ---------------- trup a bedra ---------------- */
  P.torso.demon = (ctx, L, pal) => {
    rr(ctx, -10.5, -54, 21, 22, 7);
    const g = ctx.createLinearGradient(-10, -54, 10, -32);
    g.addColorStop(0, shade(pal.skin, 0.18)); g.addColorStop(1, shade(pal.skin, -0.25));
    fs(ctx, g);
    // svaly: prsa a břicho
    ctx.lineWidth = 1; ctx.strokeStyle = shade(pal.skin, -0.45);
    ctx.beginPath(); ctx.moveTo(-6, -46); ctx.quadraticCurveTo(-1, -43, 1, -47); ctx.quadraticCurveTo(3, -43, 8, -46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, -44); ctx.lineTo(1, -34); ctx.stroke();
    for (const yy of [-41, -37.5]) { ctx.beginPath(); ctx.moveTo(-3.5, yy); ctx.lineTo(5.5, yy); ctx.stroke(); }
    // runové jizvy, které žhnou
    ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(255,170,60,.85)';
    ctx.beginPath(); ctx.moveTo(-7, -51); ctx.lineTo(-4, -48); ctx.lineTo(-7, -45); ctx.stroke();
    // kostěný nárameník
    ctx.beginPath(); ctx.moveTo(-6, -55); ctx.quadraticCurveTo(0, -60, 7, -55); ctx.lineTo(5, -51); ctx.quadraticCurveTo(0, -54, -4, -51); ctx.closePath(); fs(ctx, pal.horn || '#e8dcc0', 1.3);
    for (const sx of [-2, 3]) { ctx.beginPath(); ctx.moveTo(sx - 1.5, -57); ctx.lineTo(sx, -62); ctx.lineTo(sx + 1.5, -57); ctx.closePath(); fs(ctx, pal.horn || '#e8dcc0', 1); }
  };
  P.skirt.demon = (ctx, L, pal) => {
    // rozedraná bederní rouška
    ctx.beginPath();
    ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(11, -26); ctx.lineTo(8, -20); ctx.lineTo(5, -25); ctx.lineTo(2, -18); ctx.lineTo(-1, -24); ctx.lineTo(-5, -19); ctx.lineTo(-8, -25); ctx.lineTo(-11, -22); ctx.closePath();
    fs(ctx, pal.tunic, 1.6);
    ctx.beginPath(); ctx.moveTo(-10, -32); ctx.lineTo(10, -32); ctx.lineWidth = 1.4; ctx.strokeStyle = pal.trim; ctx.stroke();
  };
  P.torso.hellplate = (ctx, L, pal) => {
    rr(ctx, -10.5, -54, 21, 22, 7);
    const g = ctx.createLinearGradient(-10, -54, 10, -32);
    g.addColorStop(0, shade(pal.metal, 0.3)); g.addColorStop(0.55, pal.metal); g.addColorStop(1, pal.metalDark);
    fs(ctx, g);
    // žhnoucí praskliny ve zbroji
    ctx.save(); ctx.shadowColor = '#ff6a1a'; ctx.shadowBlur = 5;
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#ff9a3c';
    ctx.beginPath(); ctx.moveTo(-6, -50); ctx.lineTo(-3, -45); ctx.lineTo(-5, -40); ctx.lineTo(-1, -35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -49); ctx.lineTo(4, -44); ctx.lineTo(7, -39); ctx.stroke();
    ctx.restore();
    // lebka na hrudi
    ctx.beginPath(); ctx.arc(1, -45, 3.4, 0, TAU); fs(ctx, '#d9cfb6', 1.1);
    ctx.fillStyle = '#1a0d0d'; ctx.beginPath(); ctx.arc(-0.2, -45.4, 0.9, 0, TAU); ctx.arc(2.2, -45.4, 0.9, 0, TAU); ctx.fill();
    // ostnaté nárameníky
    ctx.beginPath(); ctx.ellipse(1, -51, 8.5, 5.5, -0.2, Math.PI, TAU + 0.2); ctx.closePath(); fs(ctx, shade(pal.metal, 0.1), 1.6);
    for (const sx of [-4, 1, 6]) { ctx.beginPath(); ctx.moveTo(sx - 1.6, -55); ctx.lineTo(sx - 1, -61); ctx.lineTo(sx + 1.6, -55); ctx.closePath(); fs(ctx, pal.metalDark, 1); }
  };
  P.skirt.hellplate = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(12.5, -21); ctx.lineTo(-12, -21); ctx.closePath();
    fs(ctx, pal.metalDark, 1.8);
    ctx.lineWidth = 1; ctx.strokeStyle = shade(pal.metal, 0.3);
    for (const yy of [-30, -25]) { ctx.beginPath(); ctx.moveTo(-11, yy); ctx.lineTo(11.5, yy); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-12, -22.5); ctx.lineTo(12.5, -22.5); ctx.lineWidth = 2; ctx.strokeStyle = pal.trim; ctx.stroke();
  };

  /* ---------------- hlavy ---------------- */
  function glowEye(ctx, pal, x, y) {
    ctx.save();
    ctx.shadowColor = pal.eyes || '#ffd23f'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.ellipse(x, y, 2.2, 1.4, -0.15, 0, TAU); ctx.fillStyle = pal.eyes || '#ffd23f'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(x + 0.5, y, 0.5, 1.2, 0, 0, TAU); ctx.fillStyle = '#1a0606'; ctx.fill();
  }
  function horn(ctx, x, y, dx, dy, w, col) {
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x + dx * 0.2 - w, y + dy * 0.7, x + dx, y + dy);
    ctx.quadraticCurveTo(x + dx * 0.3 + w, y + dy * 0.5, x + w, y);
    ctx.closePath();
    const g = ctx.createLinearGradient(x, y, x + dx, y + dy);
    g.addColorStop(0, shade(col, -0.25)); g.addColorStop(1, shade(col, 0.2));
    fs(ctx, g, 1.4);
    ctx.lineWidth = 0.7; ctx.strokeStyle = shade(col, -0.45);
    for (let i = 1; i <= 3; i++) { const t = i / 4; ctx.beginPath(); ctx.moveTo(x - w * (1 - t) + dx * t * 0.25, y + dy * t * 0.55); ctx.lineTo(x + w * (1 - t) + dx * t * 0.35, y + dy * t * 0.5); ctx.stroke(); }
  }
  function demonFace(ctx, pal) {
    // zamračené čelo, žhnoucí oko, tesáky a špičaté ucho
    ctx.beginPath(); ctx.moveTo(3.5, -66.6); ctx.lineTo(9.4, -64.4); ctx.lineTo(9.6, -65.8); ctx.lineTo(4, -68); ctx.closePath(); fs(ctx, shade(pal.skin, -0.35), 1);
    glowEye(ctx, pal, 6.8, -62.6);
    ctx.fillStyle = '#fbf3df';
    ctx.beginPath(); ctx.moveTo(6.6, -57.6); ctx.lineTo(7.3, -55.3); ctx.lineTo(8, -57.6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8.4, -57.7); ctx.lineTo(8.9, -56); ctx.lineTo(9.4, -57.8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2.6, -63.5); ctx.lineTo(-8.5, -69.5); ctx.lineTo(-0.6, -59.4); ctx.closePath(); fs(ctx, shade(pal.skin, -0.08), 1.2);
  }
  P.helmet.demon = (ctx, L, pal) => {
    demonFace(ctx, pal);
    const hc = pal.horn || '#e8dcc0';
    horn(ctx, -2, -68.5, -9, -11, 2.4, hc);
    horn(ctx, 4, -69.5, 5, -13, 2.6, hc);
  };
  P.helmet.demonking = (ctx, L, pal) => {
    demonFace(ctx, pal);
    const hc = '#2a2224';
    // zahnuté beraní rohy
    ctx.beginPath();
    ctx.moveTo(-3, -67); ctx.bezierCurveTo(-16, -76, -18, -60, -9, -58); ctx.bezierCurveTo(-13, -63, -9, -69, -1, -64); ctx.closePath();
    fs(ctx, hc, 1.6);
    horn(ctx, 4, -69.5, 8, -18, 3, hc);
    horn(ctx, -1, -70, -8, -16, 2.8, hc);
    // železná koruna s plameny
    ctx.beginPath();
    ctx.moveTo(-5, -67); ctx.lineTo(-5, -73); ctx.lineTo(-2, -70); ctx.lineTo(1.5, -76); ctx.lineTo(5, -70); ctx.lineTo(8, -73); ctx.lineTo(8, -67); ctx.closePath();
    fs(ctx, '#3a3034', 1.3);
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 8;
    for (const [x, y] of [[-5, -73], [1.5, -76], [8, -73]]) { ctx.beginPath(); ctx.arc(x, y - 1, 1.6, 0, TAU); ctx.fillStyle = '#ffb347'; ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(1.5, -69.4, 1.4, 0, TAU); ctx.fillStyle = '#ff3a2a'; ctx.fill();
  };
  P.helmet.hellhelm = (ctx, L, pal) => {
    // uzavřená černá helma s rohy (obličej je schovaný)
    rr(ctx, -7.5, -74, 18, 21, 6);
    const g = ctx.createLinearGradient(-7, -74, 10, -54);
    g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 2);
    ctx.save(); ctx.shadowColor = '#ff4a1a'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#ff7a2a'; rr(ctx, 2, -66.4, 8.4, 2.2, 1); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#0d0f14';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(5 + i * 1.8, -61); ctx.lineTo(5.6 + i * 1.8, -57); ctx.lineWidth = 0.9; ctx.strokeStyle = '#0d0f14'; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(1, -73); ctx.lineTo(1, -54); ctx.lineWidth = 1.1; ctx.strokeStyle = pal.metalDark; ctx.stroke();
    horn(ctx, -4, -71, -10, -9, 2.4, '#2a2224');
    horn(ctx, 6, -72, 7, -10, 2.4, '#2a2224');
  };

  /* ---------------- zbraně ---------------- */
  function armAngle(atk, w, moving) {
    const idle = 5.6 + (moving ? Math.sin(w) * 0.12 : 0);
    if (atk < 0) return idle;
    if (atk < 0.42) return lerp(idle, 2.55, ease(atk / 0.42));
    if (atk < 0.66) return lerp(2.55, 5.45, ease((atk - 0.42) / 0.24));
    return lerp(5.45, idle, (atk - 0.66) / 0.34);
  }
  const sleeveOf = (L, pal) => L.armor === 'hellplate' ? pal.metal : pal.skin;
  function claw(ctx, pal) {
    ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, TAU); fs(ctx, pal.skin, 1.3);
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(i * 2.2 - 1, 2); ctx.quadraticCurveTo(i * 3, 7, i * 3.6 + 1.5, 9); ctx.lineTo(i * 2.2 + 1, 2.5); ctx.closePath();
      fs(ctx, pal.horn || '#e8dcc0', 0.9);
    }
  }
  P.weapon.claws = (ctx, L, pal, atk, w, moving) => {
    ctx.save(); ctx.translate(1, -50); ctx.rotate(armAngle(atk, w, moving) - 0.3);
    rr(ctx, -3.6, -2, 7.2, 17, 3.4); fs(ctx, pal.skin, 1.8);
    ctx.translate(0, 17); claw(ctx, pal);
    if (atk > 0.42 && atk < 0.7) {
      ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.strokeStyle = '#ffd27a';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-8, 2, 14 + i * 3, -0.3, 1.1); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };
  P.weapon.trident = (ctx, L, pal, atk, w, moving) => {
    const tx = atk >= 0 ? Math.sin(atk * Math.PI) * 16 : 0;
    const ang = atk >= 0 ? -0.02 : -0.16 + (moving ? Math.sin(w) * 0.03 : 0);
    ctx.save();
    ctx.translate(-4 + tx, -44); ctx.rotate(ang);
    limb(ctx, -18, 0, 46, 0, 2.6, '#2a2224');
    // trojzubec
    ctx.beginPath();
    ctx.moveTo(44, -7); ctx.lineTo(44, 7); ctx.lineTo(47, 7); ctx.lineTo(47, 1.4); ctx.lineTo(56, 1.4); ctx.lineTo(60, 0); ctx.lineTo(56, -1.4); ctx.lineTo(47, -1.4); ctx.lineTo(47, -7); ctx.closePath();
    fs(ctx, '#8e8a90', 1.4);
    for (const yy of [-7, 7]) { ctx.beginPath(); ctx.moveTo(44, yy); ctx.lineTo(54, yy); ctx.lineTo(57, yy * 0.7); ctx.lineTo(52, yy * 0.6); ctx.lineTo(47, yy * 0.6); ctx.closePath(); fs(ctx, '#a7a2a8', 1.2); }
    ctx.restore();
    const hx = -4 + tx + 16 * Math.cos(ang), hy = -44 + 16 * Math.sin(ang);
    limb(ctx, 2, -49, hx, hy, 5.4, sleeveOf(L, pal));
    ctx.save(); ctx.translate(hx, hy); claw(ctx, pal); ctx.restore();
  };
  P.weapon.flamesword = (ctx, L, pal, atk, w, moving) => {
    ctx.save();
    ctx.translate(1, -50);
    ctx.rotate(armAngle(atk, w, moving));
    rr(ctx, -3.6, -2, 7.2, 18, 3.4); fs(ctx, sleeveOf(L, pal), 1.8);
    fist(ctx, 0, 17, L.armor === 'hellplate' ? pal.metalDark : pal.skin, -0.55);
    ctx.translate(0, 17); ctx.rotate(-0.55);
    const bl = 40, bw = 3.2;
    // plameny kolem čepele
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(-bw - 2.5, 6);
    for (let i = 0; i <= 6; i++) ctx.lineTo(-bw - 2.5 - (i % 2 ? 2.4 : 0), 6 + i * bl / 6);
    ctx.lineTo(0, 12 + bl);
    for (let i = 6; i >= 0; i--) ctx.lineTo(bw + 2.5 + (i % 2 ? 2.4 : 0), 6 + i * bl / 6);
    ctx.closePath(); ctx.fillStyle = 'rgba(255,120,40,.75)'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-bw, 5); ctx.lineTo(-bw * 0.6, 5 + bl); ctx.lineTo(0, 9 + bl); ctx.lineTo(bw * 0.6, 5 + bl); ctx.lineTo(bw, 5); ctx.closePath();
    const g = ctx.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, '#3a2a2a'); g.addColorStop(0.5, '#1a1010'); g.addColorStop(1, '#2a1c1c');
    fs(ctx, g, 1.6);
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 3 + bl); ctx.lineWidth = 1.2; ctx.strokeStyle = '#ffb347'; ctx.stroke();
    // záštita ve tvaru křídel
    ctx.beginPath(); ctx.moveTo(-9, 1); ctx.quadraticCurveTo(-4, 6, 0, 3); ctx.quadraticCurveTo(4, 6, 9, 1); ctx.lineTo(7, 5.5); ctx.lineTo(-7, 5.5); ctx.closePath(); fs(ctx, '#3a3034', 1.3);
    rr(ctx, -1.6, -4, 3.2, 7, 1); fs(ctx, '#2a1410', 1.2);
    ctx.beginPath(); ctx.arc(0, -4.5, 2.1, 0, TAU); fs(ctx, '#ff3a2a', 1.1);
    ctx.restore();
  };
  P.weapon.fireball = (ctx, L, pal, atk, w, moving) => {
    // napřáhnutí (0–0,55) a hod (0,55–0,7)
    let ang = 4.3 + (moving ? Math.sin(w) * 0.1 : 0);
    if (atk >= 0) {
      if (atk < 0.55) ang = lerp(4.3, 3.0, ease(atk / 0.55));
      else if (atk < 0.72) ang = lerp(3.0, 5.6, ease((atk - 0.55) / 0.17));
      else ang = lerp(5.6, 4.3, (atk - 0.72) / 0.28);
    }
    ctx.save(); ctx.translate(1, -50); ctx.rotate(ang);
    rr(ctx, -3.6, -2, 7.2, 17, 3.4); fs(ctx, pal.skin, 1.8);
    ctx.translate(0, 18);
    if (atk < 0 || atk < 0.6) {
      const r = atk < 0 ? 5 : 5 + ease(Math.min(1, atk / 0.55)) * 2.5;
      const g = ctx.createRadialGradient(0, 3, 0.5, 0, 3, r + 3);
      g.addColorStop(0, '#fff4c2'); g.addColorStop(0.45, '#ffb347'); g.addColorStop(0.8, '#ff5a1a'); g.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.beginPath(); ctx.arc(0, 3, r + 3, 0, TAU); ctx.fillStyle = g; ctx.fill();
    }
    claw(ctx, pal);
    ctx.restore();
  };

  /* ---------------- obsidiánová pevnost ---------------- */
  const B = 380;
  function obsidianWall(ctx, x, y, w, h, rand) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#3a3240'); g.addColorStop(0.6, '#2a2430'); g.addColorStop(1, '#17131c');
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.2;
    for (let yy = y + 14; yy < y + h; yy += 14 + rand() * 6) {
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy + (rand() - 0.5) * 4); ctx.stroke();
    }
    // žhnoucí žíly lávy
    ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 6; ctx.strokeStyle = '#ff7a2a'; ctx.lineWidth = 1.6;
    for (let i = 0; i < Math.max(1, w / 50); i++) {
      let px = x + rand() * w, py = y + rand() * h * 0.5;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 0; k < 5; k++) { px += (rand() - 0.5) * 14; py += 8 + rand() * 10; ctx.lineTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.lineWidth = 2.2; ctx.strokeStyle = OUT; ctx.stroke();
  }
  function spikes(ctx, x, y, w, n, h) {
    for (let i = 0; i < n; i++) {
      const sx = x + (i + 0.5) * w / n;
      ctx.beginPath(); ctx.moveTo(sx - w / n * 0.42, y); ctx.lineTo(sx, y - h); ctx.lineTo(sx + w / n * 0.42, y); ctx.closePath();
      fs(ctx, '#2a2430', 1.6);
    }
  }
  function spire(ctx, cx, top, base, w) {
    ctx.beginPath(); ctx.moveTo(cx - w / 2, base); ctx.lineTo(cx - w * 0.12, top); ctx.lineTo(cx + w * 0.12, top); ctx.lineTo(cx + w / 2, base); ctx.closePath();
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, '#463c4c'); g.addColorStop(1, '#16121a');
    fs(ctx, g, 2.2);
  }
  function skull(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 10, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(6, 9); ctx.lineTo(-6, 9); ctx.closePath(); fs(ctx, '#d9cfb6', 1.6);
    ctx.save(); ctx.shadowColor = '#ff4a1a'; ctx.shadowBlur = 8; ctx.fillStyle = '#ff7a2a';
    ctx.beginPath(); ctx.ellipse(-4, 1, 2.8, 3.2, 0, 0, TAU); ctx.ellipse(4, 1, 2.8, 3.2, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(-1.5, 7); ctx.lineTo(1.5, 7); ctx.closePath(); ctx.fillStyle = '#1a0d0d'; ctx.fill();
    ctx.restore();
  }
  T.castle.peklo = (ctx, pal, level, rand) => {
    const flags = [];
    // lávová záře u paty
    const glow = ctx.createLinearGradient(0, B - 80, 0, B);
    glow.addColorStop(0, 'rgba(255,90,30,0)'); glow.addColorStop(1, 'rgba(255,90,30,.35)');
    ctx.fillStyle = glow; ctx.fillRect(0, B - 80, 320, 80);
    // zadní věže – ostré jehly
    spire(ctx, 46, 36, B, 54); flags.push({ x: 46, y: 36 });
    spire(ctx, 132, 6, B, 74); flags.push({ x: 132, y: 6 });
    obsidianWall(ctx, 80, 150, 104, B - 150, rand);
    spikes(ctx, 80, 150, 104, 6, 16);
    // okna s ohněm
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 10; ctx.fillStyle = '#ff8a2a';
    for (const [x, y] of [[40, 160], [40, 230], [126, 110], [126, 190], [104, 230], [150, 230]]) {
      ctx.beginPath(); ctx.moveTo(x, y + 22); ctx.lineTo(x, y + 6); ctx.quadraticCurveTo(x + 6, y - 2, x + 12, y + 6); ctx.lineTo(x + 12, y + 22); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // hradba s bránou
    obsidianWall(ctx, 0, 270, 236, B - 270, rand);
    spikes(ctx, 0, 270, 236, 9, 14);
    // přední strážní věž
    obsidianWall(ctx, 236, 176, 82, B - 176, rand);
    spikes(ctx, 230, 176, 94, 4, 22);
    spire(ctx, 277, 100, 176, 60); flags.push({ x: 277, y: 100 });
    // brána – tlama s tesáky
    ctx.beginPath(); ctx.moveTo(250, B); ctx.lineTo(250, 318); ctx.quadraticCurveTo(277, 286, 304, 318); ctx.lineTo(304, B); ctx.closePath();
    const gg = ctx.createRadialGradient(277, 350, 4, 277, 350, 60);
    gg.addColorStop(0, '#ffb347'); gg.addColorStop(0.4, '#c8361a'); gg.addColorStop(1, '#2a0a06');
    fs(ctx, gg, 2.4);
    ctx.fillStyle = '#e8dcc0';
    for (let i = 0; i < 6; i++) { const x = 254 + i * 8.6; ctx.beginPath(); ctx.moveTo(x, 312 + Math.abs(2.5 - i) * 2); ctx.lineTo(x + 4.3, 326); ctx.lineTo(x + 8.6, 312 + Math.abs(2.5 - i) * 2); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = OUT; ctx.stroke(); }
    skull(ctx, 277, 270, 1.3);
    skull(ctx, 60, 300, 0.9); skull(ctx, 160, 300, 0.9);
    if (level >= 5) { skull(ctx, 110, 300, 0.9); skull(ctx, 210, 300, 0.9); }
    // řetězy
    ctx.strokeStyle = '#6a6470'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(244, 200); ctx.quadraticCurveTo(256, 250, 252, 300); ctx.moveTo(312, 200); ctx.quadraticCurveTo(300, 250, 302, 300); ctx.stroke();
    return { flags, towerTop: { x: 277, y: 170 }, flagStyle: 'raven', flagColor: '#7a1410' };
  };


  /* ---------------- OBŘÍ PEKELNÁ PEVNOST (finále) – 3× širší, tři brány ---------------- */
  const MW = 960, MH = 440;
  T.castleSize = T.castleSize || {};
  T.castleSize.peklo3 = { w: MW, h: MH };
  function hellGate(ctx, cx, w, h) {
    // tlama brány s tesáky a žhnoucím nitrem
    const x0 = cx - w / 2, top = MH - h;
    ctx.beginPath(); ctx.moveTo(x0, MH); ctx.lineTo(x0, top + w * 0.35); ctx.quadraticCurveTo(cx, top - w * 0.25, x0 + w, top + w * 0.35); ctx.lineTo(x0 + w, MH); ctx.closePath();
    const g = ctx.createRadialGradient(cx, MH - h * 0.3, 4, cx, MH - h * 0.3, h);
    g.addColorStop(0, '#ffe08a'); g.addColorStop(0.3, '#ff7a2a'); g.addColorStop(0.7, '#a8261a'); g.addColorStop(1, '#2a0a06');
    fs(ctx, g, 3);
    ctx.fillStyle = '#e8dcc0';
    const n = 7;
    for (let i = 0; i < n; i++) {
      const x = x0 + 4 + i * (w - 8) / n, tw = (w - 8) / n;
      const y = top + w * 0.3 + Math.abs((n - 1) / 2 - i) * 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tw / 2, y + 20); ctx.lineTo(x + tw, y); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, MH); ctx.lineTo(x + tw / 2, MH - 14); ctx.lineTo(x + tw, MH); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  T.castle.peklo3 = (ctx, pal, level, rand) => {
    const flags = [];
    const glow = ctx.createLinearGradient(0, MH - 110, 0, MH);
    glow.addColorStop(0, 'rgba(255,90,30,0)'); glow.addColorStop(1, 'rgba(255,90,30,.4)');
    ctx.fillStyle = glow; ctx.fillRect(0, MH - 110, MW, 110);
    // zadní jehly a trůnní věž uprostřed
    for (const [x, top, w] of [[70, 70, 60], [250, 40, 70], [700, 50, 70], [880, 90, 56]]) { spire(ctx, x, top, MH - 120, w); flags.push({ x, y: top }); }
    obsidianWall(ctx, 380, 90, 200, MH - 90, rand);
    spikes(ctx, 380, 90, 200, 8, 22);
    spire(ctx, 480, 0, 92, 120); flags.push({ x: 480, y: 4 });
    // trůnní okno s rudým světlem
    ctx.save(); ctx.shadowColor = '#ff3a1a'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.moveTo(452, 210); ctx.lineTo(452, 150); ctx.quadraticCurveTo(480, 118, 508, 150); ctx.lineTo(508, 210); ctx.closePath(); ctx.fillStyle = '#ff5a2a'; ctx.fill();
    ctx.restore();
    skull(ctx, 480, 112, 1.6);
    // boční paláce
    obsidianWall(ctx, 150, 170, 160, MH - 170, rand); spikes(ctx, 150, 170, 160, 6, 16);
    obsidianWall(ctx, 650, 170, 160, MH - 170, rand); spikes(ctx, 650, 170, 160, 6, 16);
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 10; ctx.fillStyle = '#ff8a2a';
    for (const [x, y] of [[180, 200], [270, 200], [680, 200], [770, 200], [410, 240], [530, 240], [180, 260], [770, 260]]) {
      ctx.beginPath(); ctx.moveTo(x, y + 26); ctx.lineTo(x, y + 8); ctx.quadraticCurveTo(x + 7, y - 2, x + 14, y + 8); ctx.lineTo(x + 14, y + 26); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // hradba přes celou šířku
    obsidianWall(ctx, 0, 300, MW, MH - 300, rand);
    spikes(ctx, 0, 300, MW, 30, 16);
    // tři strážní věže s branami
    const gates = [];
    for (const [cx, tw] of [[120, 150], [480, 170], [850, 160]]) {
      obsidianWall(ctx, cx - tw / 2, 220, tw, MH - 220, rand);
      spikes(ctx, cx - tw / 2 - 6, 220, tw + 12, 5, 26);
      hellGate(ctx, cx, tw * 0.58, 150);
      skull(ctx, cx, 250, 1.4);
      gates.push({ x: cx });
    }
    // řetězy a lebky na hradbě
    for (let x = 220; x < MW - 100; x += 120) skull(ctx, x, 340, 0.8);
    ctx.strokeStyle = '#6a6470'; ctx.lineWidth = 2.4;
    for (const cx of [120, 480, 850]) { ctx.beginPath(); ctx.moveTo(cx - 60, 236); ctx.quadraticCurveTo(cx - 50, 290, cx - 46, 330); ctx.moveTo(cx + 60, 236); ctx.quadraticCurveTo(cx + 50, 290, cx + 46, 330); ctx.stroke(); }
    return { flags, gates, towerTop: { x: 850, y: 214 }, flagStyle: 'raven', flagColor: '#7a1410' };
  };

  /* ---------------- bojiště 'peklo' ---------------- */
  const C = () => GameData.battleConfig;
  T.battle.peklo = (ctx, W, H, seed, layer) => {
    const rand = rng(seed || 66);
    const cfg = C();
    const FAR = layer !== 'near', NEAR = layer !== 'far';
    if (FAR) {
      const sky = ctx.createLinearGradient(0, 0, 0, 420);
      sky.addColorStop(0, '#12060a'); sky.addColorStop(0.45, '#4a0f12'); sky.addColorStop(0.8, '#a8321a'); sky.addColorStop(1, '#f07a2a');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // rudý měsíc
      const mx = W * 0.22;
      const mg = ctx.createRadialGradient(mx, 120, 10, mx, 120, 120);
      mg.addColorStop(0, 'rgba(255,90,60,.45)'); mg.addColorStop(1, 'rgba(255,90,60,0)');
      ctx.fillStyle = mg; ctx.fillRect(mx - 130, 0, 260, 260);
      ctx.beginPath(); ctx.arc(mx, 120, 40, 0, TAU); ctx.fillStyle = '#d6452a'; ctx.fill();
      ctx.beginPath(); ctx.arc(mx + 10, 112, 36, 0, TAU); ctx.fillStyle = 'rgba(80,10,10,.35)'; ctx.fill();
      // popelavá mračna
      for (let i = 0; i < 14; i++) {
        const y = 40 + rand() * 170, x = rand() * W, w = 160 + rand() * 280;
        ctx.fillStyle = `rgba(30,10,12,${0.25 + rand() * 0.3})`;
        ctx.beginPath(); ctx.ellipse(x, y, w, 10 + rand() * 12, 0, 0, TAU); ctx.fill();
      }
      // Ohnivá hora – sopka uprostřed
      const vx = W * 0.6, vb = 400;
      ctx.beginPath(); ctx.moveTo(vx - 620, vb); ctx.quadraticCurveTo(vx - 200, 230, vx - 70, 108); ctx.lineTo(vx + 70, 108); ctx.quadraticCurveTo(vx + 200, 230, vx + 620, vb); ctx.closePath();
      const vg = ctx.createLinearGradient(0, 100, 0, vb);
      vg.addColorStop(0, '#2a1a1e'); vg.addColorStop(1, '#3e2026');
      ctx.fillStyle = vg; ctx.fill();
      // lávové proudy po svahu
      ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 14;
      for (const [sx, ex, ww] of [[-30, -170, 7], [10, 60, 6], [40, 230, 8], [-10, -40, 5]]) {
        ctx.beginPath(); ctx.moveTo(vx + sx, 110);
        ctx.bezierCurveTo(vx + sx + (ex - sx) * 0.3, 200, vx + ex * 0.8, 300, vx + ex, vb);
        ctx.lineWidth = ww; ctx.strokeStyle = '#ff7a2a'; ctx.stroke();
        ctx.lineWidth = ww * 0.4; ctx.strokeStyle = '#ffe08a'; ctx.stroke();
      }
      ctx.restore();
      // záře a dým z kráteru
      const cg = ctx.createRadialGradient(vx, 100, 6, vx, 100, 150);
      cg.addColorStop(0, 'rgba(255,200,90,.85)'); cg.addColorStop(0.3, 'rgba(255,100,40,.45)'); cg.addColorStop(1, 'rgba(255,80,30,0)');
      ctx.fillStyle = cg; ctx.fillRect(vx - 160, -60, 320, 260);
      for (let i = 0; i < 9; i++) {
        ctx.beginPath(); ctx.arc(vx - 20 + rand() * 40 + i * 6, 80 - i * 14, 16 + i * 5, 0, TAU);
        ctx.fillStyle = `rgba(40,20,22,${0.55 - i * 0.05})`; ctx.fill();
      }
      // vzdálené jehlové věže a skály
      for (const [base, col, amp] of [[350, '#2a1418', 50], [385, '#1e0e12', 40]]) {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 24) ctx.lineTo(x, base - Math.abs(Math.sin(x * 0.006 + base)) * amp - (rand() < 0.08 ? 60 + rand() * 50 : rand() * 10));
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      }
      // řeka lávy za bojištěm
      const lg = ctx.createLinearGradient(0, 398, 0, 440);
      lg.addColorStop(0, '#ffb347'); lg.addColorStop(0.5, '#f05a1e'); lg.addColorStop(1, '#8a1e0e');
      ctx.fillStyle = lg; ctx.fillRect(0, 398, W, 44);
      ctx.strokeStyle = 'rgba(255,240,180,.55)'; ctx.lineWidth = 1.6;
      for (let i = 0; i < W / 18; i++) { const x = rand() * W, y = 402 + rand() * 34; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y - 3, x + 18 + rand() * 18, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(30,8,8,.6)';
      for (let i = 0; i < W / 40; i++) { ctx.beginPath(); ctx.ellipse(rand() * W, 404 + rand() * 32, 8 + rand() * 18, 3 + rand() * 3, 0, 0, TAU); ctx.fill(); }
    }
    if (!NEAR) return;
    for (let i = 0; i < 400; i++) rand();
    // obsidiánové balvany a ostny na břehu
    for (let x = -10; x < W; x += 30 + rand() * 50) {
      const h = 16 + rand() * 40;
      ctx.beginPath(); ctx.moveTo(x, 446); ctx.lineTo(x + 6 + rand() * 6, 446 - h); ctx.lineTo(x + 14 + rand() * 10, 446); ctx.closePath();
      fs(ctx, rand() < 0.5 ? '#241c26' : '#2e2430', 1.6);
    }
    // spálená zem
    const gr = ctx.createLinearGradient(0, 436, 0, H);
    gr.addColorStop(0, '#3a2a28'); gr.addColorStop(1, '#1e1416');
    ctx.fillStyle = gr; ctx.fillRect(0, 440, W, H - 440);
    // cesta z popela se žhnoucími prasklinami
    const top = cfg.laneTop, bottom = cfg.laneBottom;
    const rg = ctx.createLinearGradient(0, top - 16, 0, bottom + 16);
    rg.addColorStop(0, '#5a4440'); rg.addColorStop(0.5, '#4a3836'); rg.addColorStop(1, '#3a2a2a');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.moveTo(0, top - 14);
    for (let x = 0; x <= W; x += 50) ctx.lineTo(x, top - 14 + Math.sin(x * 0.02) * 3);
    for (let x = W; x >= 0; x -= 50) ctx.lineTo(x, bottom + 14 + Math.sin(x * 0.015) * 4);
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 6;
    for (let i = 0; i < W / 70; i++) {
      let x = rand() * W, y = top - 10 + rand() * (bottom - top + 20);
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += 6 + rand() * 14; y += (rand() - 0.5) * 8; ctx.lineTo(x, y); }
      ctx.lineWidth = 1.4; ctx.strokeStyle = '#ff7a2a'; ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < W / 6; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(20,10,10,.4)' : 'rgba(150,120,110,.25)';
      ctx.beginPath(); ctx.ellipse(rand() * W, top - 8 + rand() * (bottom - top + 16), 2 + rand() * 4, 1 + rand() * 1.5, 0, 0, TAU); ctx.fill();
    }
    // ohnivé koše a kostěné hromady podél cesty
    for (let x = 420; x < W - 300; x += 460) {
      const y = top - 18;
      ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x - 2, y - 30); ctx.lineTo(x + 2, y - 30); ctx.lineTo(x + 3, y); ctx.closePath(); fs(ctx, '#2a2224', 1.4);
      ctx.beginPath(); ctx.moveTo(x - 10, y - 30); ctx.lineTo(x + 10, y - 30); ctx.lineTo(x + 6, y - 38); ctx.lineTo(x - 6, y - 38); ctx.closePath(); fs(ctx, '#3a3034', 1.4);
      const fg = ctx.createRadialGradient(x, y - 44, 2, x, y - 44, 40);
      fg.addColorStop(0, 'rgba(255,200,90,.6)'); fg.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = fg; ctx.fillRect(x - 40, y - 84, 80, 80);
      ctx.beginPath(); ctx.moveTo(x - 7, y - 38); ctx.quadraticCurveTo(x - 6, y - 52, x, y - 58); ctx.quadraticCurveTo(x + 7, y - 50, x + 7, y - 38); ctx.closePath(); ctx.fillStyle = '#ff8a2a'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 3, y - 38); ctx.quadraticCurveTo(x - 2, y - 46, x, y - 50); ctx.quadraticCurveTo(x + 3, y - 45, x + 3, y - 38); ctx.closePath(); ctx.fillStyle = '#ffe9a0'; ctx.fill();
    }
    for (let i = 0; i < 10; i++) {
      const x = 300 + rand() * (W - 600), y = bottom + 30 + rand() * 18;
      skull(ctx, x, y, 0.6 + rand() * 0.3);
    }
  };

  T.ambient.peklo = { count: 60, color: ['#ffb347', '#ff7a2a', '#ffd27a', '#c8361a'], vx: [-12, 12], vy: [-46, -18], size: [1.2, 2.6], petal: false, rise: true };

  /* ---------------- mapa 'peklo' – cesta k Ohnivé hoře ---------------- */
  T.map.peklo = (ctx, W, H) => {
    const rand = rng(666);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#2a0a0c'); bg.addColorStop(0.5, '#3a1a18'); bg.addColorStop(1, '#2e2a24');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // spálené pláně – praskliny
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 6;
    for (let i = 0; i < 40; i++) {
      let x = rand() * W, y = H * (0.1 + rand() * 0.8);
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (rand() - 0.5) * 30; y += (rand() - 0.5) * 20; ctx.lineTo(x, y); }
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,120,40,.55)'; ctx.stroke();
    }
    ctx.restore();
    // řeka lávy přes celou mapu
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(0, H * 0.58); ctx.bezierCurveTo(W * 0.3, H * 0.48, W * 0.6, H * 0.68, W, H * 0.52);
    ctx.lineWidth = 16; ctx.strokeStyle = '#e8501c'; ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = '#ffd27a'; ctx.stroke();
    ctx.restore();
    // ostré skály
    for (let i = 0; i < 40; i++) {
      const x = W * (0.04 + rand() * 0.92), y = H * (0.2 + rand() * 0.72), s = 8 + rand() * 14;
      ctx.beginPath(); ctx.moveTo(x - s * 0.6, y + s * 0.5); ctx.lineTo(x, y - s); ctx.lineTo(x + s * 0.6, y + s * 0.5); ctx.closePath(); fs(ctx, i % 3 ? '#2a2026' : '#3a2a2e', 1.2);
    }
    // Ohnivá hora nahoře
    const vx = W * 0.5, vy = H * 0.12;
    ctx.beginPath(); ctx.moveTo(vx - W * 0.42, H * 0.34); ctx.lineTo(vx - 26, vy); ctx.lineTo(vx + 26, vy); ctx.lineTo(vx + W * 0.42, H * 0.34); ctx.closePath();
    const mg = ctx.createLinearGradient(0, vy, 0, H * 0.34);
    mg.addColorStop(0, '#2a1416'); mg.addColorStop(1, '#4a2420');
    fs(ctx, mg, 2);
    ctx.save(); ctx.shadowColor = '#ff5a1a'; ctx.shadowBlur = 12;
    for (const ex of [-0.22, -0.05, 0.14, 0.3]) {
      ctx.beginPath(); ctx.moveTo(vx + ex * 60, vy + 2); ctx.quadraticCurveTo(vx + ex * W * 0.5, H * 0.22, vx + ex * W * 0.9, H * 0.33);
      ctx.lineWidth = 3.4; ctx.strokeStyle = '#ff8a2a'; ctx.stroke();
    }
    const cg = ctx.createRadialGradient(vx, vy, 2, vx, vy, 70);
    cg.addColorStop(0, 'rgba(255,220,120,.9)'); cg.addColorStop(1, 'rgba(255,90,30,0)');
    ctx.fillStyle = cg; ctx.fillRect(vx - 70, vy - 70, 140, 140);
    ctx.restore();
    // trůn – černá pevnost na úpatí
    ctx.save(); ctx.translate(vx, H * 0.17);
    for (const [dx, h, w] of [[-18, 26, 10], [0, 40, 14], [18, 26, 10]]) { ctx.beginPath(); ctx.moveTo(dx - w / 2, 0); ctx.lineTo(dx, -h); ctx.lineTo(dx + w / 2, 0); ctx.closePath(); fs(ctx, '#17131c', 1.4); }
    ctx.restore();
    // tábor spojenců dole – tři prapory
    const cols = ['#2f62b8', '#c8382c', '#3a6e8f'];
    for (let i = 0; i < 3; i++) {
      const x = W * (0.3 + i * 0.2), y = H * 0.96;
      ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x, y - 16); ctx.lineTo(x + 12, y); ctx.closePath(); fs(ctx, '#d9c9a0', 1.3);
      ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x, y - 34); ctx.lineWidth = 1.8; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 14, y - 30); ctx.lineTo(x, y - 25); ctx.closePath(); fs(ctx, cols[i], 1.2);
    }
    // kouř a popel
    for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,${120 + rand() * 80},60,${0.2 + rand() * 0.5})`; ctx.fillRect(rand() * W, rand() * H, 1.6, 1.6); }
  };

  /* ---------------- znak 'lebka' pro démonský hrad ---------------- */
  const prevEmblem = Art.drawEmblem;
  Art.drawEmblem = function (ctx, id, cx, cy, r, col) {
    if (id !== 'lebka') return prevEmblem(ctx, id, cx, cy, r, col);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(r / 12, r / 12);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, -1, 9, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(5, 8); ctx.lineTo(-5, 8); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.ellipse(-3.4, 0, 2.4, 2.8, 0, 0, TAU); ctx.ellipse(3.4, 0, 2.4, 2.8, 0, 0, TAU); ctx.fill();
    ctx.restore();
  };

  /* ---------------- ohnivá střela (vykresluje Battle) ---------------- */
  Art.drawFireball = function (ctx, x, y, a, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    const tg = ctx.createLinearGradient(-30, 0, 0, 0);
    tg.addColorStop(0, 'rgba(255,90,30,0)'); tg.addColorStop(1, 'rgba(255,150,60,.85)');
    ctx.beginPath(); ctx.moveTo(-30, -3); ctx.quadraticCurveTo(-10, -8, 0, -6); ctx.lineTo(0, 6); ctx.quadraticCurveTo(-10, 8, -30, 3); ctx.closePath(); ctx.fillStyle = tg; ctx.fill();
    const g = ctx.createRadialGradient(1, -1, 1, 0, 0, 9);
    g.addColorStop(0, '#fff4c2'); g.addColorStop(0.5, '#ffb347'); g.addColorStop(1, '#e2531c');
    ctx.beginPath(); ctx.arc(0, 0, 7 + Math.sin(t * 30) * 0.8, 0, TAU); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  };
})();
