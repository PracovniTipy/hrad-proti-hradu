/* =========================================================================
   NOVÉ TVARY PRO SKINY – každý skin mění TVAR, ne jen barvu
   Zbraně na blízko: gladius, tesák, obouruční claymore, tači, řemdih,
   cep, čakan. Kopí: píka, sudlice, bardiš, válečná kosa, křížové kopí
   džúmondži. Luky: kompozitní, trnový, runový, sakurový, zlatý.
   Hole mágů: krystal, lebka, had, strom, slunce, měsíc.
   Přilby: bascinet („psí čumák“), salát, spangenhelm, zunari kabuto.
   Štíty: pavéza, erbový štít s krokví, vikingský štít se spirálou.
   ========================================================================= */
(function () {
  const A = window.Art, P = window.ArtParts, TAU = Math.PI * 2, OUT = A.OUT;
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  const shade = A.shade;
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const M = A.MELEE_REF, PO = A.POLE_REF, BF = A.bladeFill, GO = A.glowOn, GF = A.glowOff, hilt = A.hiltDraw, gem = A.gemDot;
  const spikes = (ctx, x, y, r, n, len, col) => {
    for (let k = 0; k < n; k++) {
      const a = k / n * TAU, ca = Math.cos(a), sa = Math.sin(a), pa = a + Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(x + ca * r + Math.cos(pa) * 1.6, y + sa * r + Math.sin(pa) * 1.6); ctx.lineTo(x + ca * (r + len), y + sa * (r + len)); ctx.lineTo(x + ca * r - Math.cos(pa) * 1.6, y + sa * r - Math.sin(pa) * 1.6); ctx.closePath();
      fs(ctx, col, 1);
    }
  };

  /* ---------------- ZBRANĚ NA BLÍZKO (rukojeť v 0, čepel ve směru +y) ---------------- */
  Object.assign(M, {
    // gladius: krátký široký římský meč s listovou čepelí a velkou hlavicí
    gladius(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(-3.2, 5); ctx.quadraticCurveTo(-5, 20, -3.6, 28); ctx.lineTo(0, 35); ctx.lineTo(3.6, 28); ctx.quadraticCurveTo(5, 20, 3.2, 5); ctx.closePath();
      fs(ctx, BF(ctx, c, -5, 5), 1.6); GF(ctx);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 27); ctx.lineWidth = 1.1; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      rr(ctx, -5, 2, 10, 3.4, 1.6); fs(ctx, c.guard, 1.3);
      rr(ctx, -2, -6, 4, 8, 1.4); fs(ctx, c.grip, 1.2);
      ctx.beginPath(); ctx.ellipse(0, -8, 4.2, 3, 0, 0, TAU); fs(ctx, c.pommel, 1.3);
      if (c.gem) gem(ctx, 0, -8, 1.4, c.gem);
    },
    // tesák (falchion): jednobřitá čepel, která se ke špičce rozšiřuje a má useknutý hrot
    tesak(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(2.8, 5); ctx.lineTo(3.2, 33); ctx.lineTo(0.5, 41); ctx.quadraticCurveTo(-5.5, 37, -7.2, 30); ctx.quadraticCurveTo(-4.4, 16, -3, 5); ctx.closePath();
      fs(ctx, BF(ctx, c, -7, 3), 1.6); GF(ctx);
      ctx.beginPath(); ctx.moveTo(1.6, 7); ctx.lineTo(1.9, 31); ctx.lineWidth = 1; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke();
      hilt(ctx, c, 7);
    },
    // claymore: dlouhý obouruční meč, ramena záštity skloněná k čepeli s trojlístky
    claymore(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(-3.8, 6); ctx.lineTo(-3.2, 46); ctx.lineTo(0, 53); ctx.lineTo(3.2, 46); ctx.lineTo(3.8, 6); ctx.closePath();
      fs(ctx, BF(ctx, c, -3.8, 3.8), 1.6); GF(ctx);
      ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 42); ctx.lineWidth = 1.2; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      // ramena záštity
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(d * 12, 10); ctx.lineCap = 'round'; ctx.lineWidth = 4.6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = c.guard; ctx.stroke();
        for (const [ox, oy] of [[0, 0], [1.6, 1.2], [-0.6, 2]]) { ctx.beginPath(); ctx.arc(d * 12 + d * ox, 10 + oy, 1.6, 0, TAU); fs(ctx, c.guard, 0.9); }
      }
      rr(ctx, -2.6, 1.5, 5.2, 4.4, 1.4); fs(ctx, c.guard, 1.2);
      rr(ctx, -1.9, -16, 3.8, 18, 1.2); fs(ctx, c.grip, 1.2);
      ctx.strokeStyle = shade(c.grip, 0.35); ctx.lineWidth = 0.7; for (let y = -15; y < 1; y += 2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1.2); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, -17.5, 3, 0, TAU); fs(ctx, c.pommel, 1.2);
      if (c.gem) gem(ctx, 0, -17.5, 1.4, c.gem);
    },
    // tači: delší a víc zahnutý samurajský meč s ozdobnou zlatou tsubou
    tachi(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(-2, 5); ctx.quadraticCurveTo(0, 30, -9, 50); ctx.lineTo(-6, 52); ctx.quadraticCurveTo(4, 30, 2.4, 5); ctx.closePath();
      fs(ctx, BF(ctx, c, -6, 2.4), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(1.2, 7); ctx.quadraticCurveTo(2.6, 30, -6, 49); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      // vlnitá linie kalení (hamon)
      ctx.beginPath(); for (let y = 8; y < 44; y += 3) ctx.lineTo(-0.3 - (y / 44) * 4 + (y % 6 ? 0.8 : -0.4), y); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke();
      rr(ctx, -1.9, -13, 3.8, 16, 1.2); fs(ctx, c.grip, 1.2);
      ctx.fillStyle = shade(c.grip, 0.5); for (let y = -12; y < 2; y += 2.6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1.6, y + 1.3); ctx.lineTo(0, y + 2.6); ctx.lineTo(-1.6, y + 1.3); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, r = k % 2 ? 4.6 : 6.4; ctx.lineTo(Math.cos(a) * r, 3.6 + Math.sin(a) * r * 0.42); } ctx.closePath(); fs(ctx, c.guard, 1.3);
      rr(ctx, -2.2, -15, 4.4, 3, 1); fs(ctx, c.guard, 1);
    },
    // řemdih (morgenstern): násada s ostnatou koulí
    morgenstern(ctx, c) {
      rr(ctx, -1.8, -10, 3.6, 44, 1.4); fs(ctx, c.wood, 1.4);
      ctx.strokeStyle = shade(c.wood, -0.3); ctx.lineWidth = 0.7; for (let y = -8; y < 4; y += 2.2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1); ctx.stroke(); }
      GO(ctx, c);
      spikes(ctx, 0, 39, 6, 8, 4.4, c.dark);
      ctx.beginPath(); ctx.arc(0, 39, 6.4, 0, TAU); fs(ctx, BF(ctx, c, -6, 6), 1.6);
      GF(ctx);
      rr(ctx, -2.6, 30, 5.2, 3, 1); fs(ctx, c.dark, 1);
    },
    // cep: krátká násada, řetěz a ostnatá koule
    cep(ctx, c) {
      rr(ctx, -1.8, -10, 3.6, 33, 1.4); fs(ctx, c.wood, 1.4);
      rr(ctx, -2.6, 21, 5.2, 3, 1); fs(ctx, c.dark, 1);
      ctx.strokeStyle = OUT; ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(-1.2 * k, 26 + k * 3.2, 1.4, 2.1, 0.3, 0, TAU); ctx.fillStyle = c.dark; ctx.fill(); ctx.stroke(); }
      GO(ctx, c);
      spikes(ctx, -5.4, 42, 5, 8, 3.6, c.dark);
      ctx.beginPath(); ctx.arc(-5.4, 42, 5.2, 0, TAU); fs(ctx, BF(ctx, c, -10, 0), 1.5);
      GF(ctx);
    },
    // čakan (válečný krumpáč): dlouhý zahnutý bodec a malé kladívko naproti
    cakan(ctx, c) {
      const S = M.AXE_SIDE;
      rr(ctx, -1.8, -10, 3.6, 50, 1.4); fs(ctx, c.wood, 1.4);
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(S * 2, 32); ctx.quadraticCurveTo(S * 12, 32, S * 19, 41); ctx.quadraticCurveTo(S * 10, 36.5, S * 2, 37.5); ctx.closePath(); fs(ctx, BF(ctx, c, S > 0 ? 0 : -19, S > 0 ? 19 : 0), 1.5);
      rr(ctx, S > 0 ? -8 : 2, 31.5, 6, 6.4, 1.2); fs(ctx, c.dark, 1.2);
      GF(ctx);
      rr(ctx, -2.8, 30, 5.6, 9, 1.2); fs(ctx, c.guard, 1.2);
      ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 45); ctx.lineWidth = 2.2; ctx.strokeStyle = c.dark; ctx.stroke();
    }
  });
  Object.assign(A.HEADED_REF, { morgenstern: 1, cep: 1, cakan: 1 });
  Object.assign(A.FLIP_REF, { tachi: 1, tesak: 1 });

  /* ---------------- HROTY NA KOPÍ (násada podél +x, hrot od x ≈ 44) ---------------- */
  Object.assign(PO, {
    // píka: dlouhý úzký čtyřhranný hrot s kovovými pásy na násadě
    pika(ctx, c) {
      GO(ctx, c); ctx.beginPath(); ctx.moveTo(45, -2.4); ctx.lineTo(77, 0); ctx.lineTo(45, 2.4); ctx.closePath(); fs(ctx, BF(ctx, c, 45, 77), 1.3); GF(ctx);
      ctx.beginPath(); ctx.moveTo(46, 0); ctx.lineTo(72, 0); ctx.lineWidth = 0.8; ctx.strokeStyle = c.dark; ctx.stroke();
      rr(ctx, 32, -2, 14, 4, 1); fs(ctx, c.dark, 1);
    },
    // sudlice: husitská zbraň – dlouhá čepel s bočním hákem u kořene
    sudlice(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(45, -3); ctx.lineTo(74, -0.6); ctx.lineTo(76, 0); ctx.lineTo(74, 0.6); ctx.lineTo(45, 3); ctx.closePath(); fs(ctx, BF(ctx, c, 45, 76), 1.4);
      ctx.beginPath(); ctx.moveTo(48, 2.4); ctx.quadraticCurveTo(52, 9, 58, 11); ctx.lineTo(55, 4); ctx.lineTo(52, 2.6); ctx.closePath(); fs(ctx, BF(ctx, c, 48, 58), 1.3);
      GF(ctx); rr(ctx, 40, -3, 6, 6, 1); fs(ctx, c.guard, 1);
    },
    // bardiš: velké půlměsícové ostří připevněné podél násady
    bardisa(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(30, -2); ctx.quadraticCurveTo(27, -13, 37, -18); ctx.lineTo(60, -15); ctx.quadraticCurveTo(68, -8, 62, -1.6); ctx.lineTo(70, -0.4); ctx.lineTo(56, 1.6); ctx.closePath();
      fs(ctx, BF(ctx, c, 30, 70), 1.6); GF(ctx);
      ctx.beginPath(); ctx.moveTo(36, -16.4); ctx.lineTo(60, -13.6); ctx.lineWidth = 1.2; ctx.strokeStyle = c.edge; ctx.stroke();
      for (const x of [34, 50]) { rr(ctx, x, -3, 3, 6, 1); fs(ctx, c.guard, 1); }
    },
    // válečná kosa: čepel kosy narovnaná do osy násady (husitská zbraň)
    kosa(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(44, -2.4); ctx.quadraticCurveTo(62, -3.4, 78, -9); ctx.quadraticCurveTo(70, 1.6, 44, 3); ctx.closePath(); fs(ctx, BF(ctx, c, 44, 78), 1.5);
      GF(ctx);
      ctx.beginPath(); ctx.moveTo(46, -1.6); ctx.quadraticCurveTo(62, -2.6, 76, -8); ctx.lineWidth = 1; ctx.strokeStyle = c.edge; ctx.stroke();
      for (const x of [38, 42]) { rr(ctx, x, -3, 2.6, 6, 1); fs(ctx, c.dark, 1); }
    },
    // džúmondži jari: křížové kopí se dvěma bočními čepelemi
    jumonji(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(45, -2.8); ctx.lineTo(73, 0); ctx.lineTo(45, 2.8); ctx.closePath(); fs(ctx, BF(ctx, c, 45, 73), 1.4);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(46, d * 2); ctx.quadraticCurveTo(47, d * 12, 54, d * 15); ctx.quadraticCurveTo(50, d * 8, 51, d * 2); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 54), 1.3); }
      GF(ctx);
      ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(68, 0); ctx.lineWidth = 0.8; ctx.strokeStyle = c.dark; ctx.stroke();
      rr(ctx, 40, -3, 6, 6, 1); fs(ctx, c.guard, 1);
      if (c.gem) gem(ctx, 43, 0, 1.6, c.gem);
    }
  });

  /* ---------------- LUKY: ozdoby a tvar konců ---------------- */
  Object.assign(A.BOW_REF, { kompozit: [33, 30], trny: [35, 32], runovy: [35, 32], sakura: [34, 31], zlaty: [35, 32] });
  A.bowDecor = {
    // kompozitní luk: konce ramen stočené dopředu (reflexní špičky)
    kompozit(ctx, at, c, T, B) {
      for (const [p, d] of [[T, -1], [B, 1]]) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(p[0] + 6, p[1] + d * 1, p[0] + 7, p[1] - d * 5); ctx.lineCap = 'round'; ctx.lineWidth = 4.6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = c.wood; ctx.stroke(); }
      for (const k of [0.3, 0.7]) { const p = at(k); ctx.beginPath(); ctx.moveTo(p[0] - 2.6, p[1]); ctx.lineTo(p[0] + 2.6, p[1]); ctx.lineWidth = 1.6; ctx.strokeStyle = '#e8dcc0'; ctx.stroke(); }
    },
    // trnový luk: ostré trny po celé délce
    trny(ctx, at, c) {
      for (let k = 0.1; k < 0.95; k += 0.11) { if (Math.abs(k - 0.5) < 0.09) continue; const p = at(k); ctx.beginPath(); ctx.moveTo(p[0] - 1, p[1] - 1.6); ctx.lineTo(p[0] - 7, p[1] + (k < 0.5 ? -2 : 2)); ctx.lineTo(p[0] - 1, p[1] + 1.6); ctx.closePath(); fs(ctx, c.blade || '#3a2a1a', 0.8); }
    },
    // runový luk: zářící runy na ramenou
    runovy(ctx, at, c) {
      ctx.save(); ctx.shadowColor = c.glow || '#7fc8ff'; ctx.shadowBlur = 6; ctx.strokeStyle = c.glow || '#7fc8ff'; ctx.lineWidth = 1.2;
      for (const k of [0.18, 0.32, 0.68, 0.82]) { const p = at(k); ctx.beginPath(); ctx.moveTo(p[0] - 1.2, p[1] - 2); ctx.lineTo(p[0] + 1.2, p[1]); ctx.lineTo(p[0] - 1.2, p[1] + 2); ctx.stroke(); }
      ctx.restore();
    },
    // sakurový luk: květy třešně na ramenou
    sakura(ctx, at) {
      for (const k of [0.16, 0.3, 0.7, 0.84]) {
        const p = at(k);
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.ellipse(p[0] - 3 + Math.cos(a) * 1.8, p[1] + Math.sin(a) * 1.8, 1.5, 1, a, 0, TAU); ctx.fillStyle = '#ffc2d8'; ctx.fill(); }
        ctx.beginPath(); ctx.arc(p[0] - 3, p[1], 0.8, 0, TAU); ctx.fillStyle = '#e0457a'; ctx.fill();
      }
    },
    // zlatý luk: zlaté hlavice konců a rytý pás
    zlaty(ctx, at, c, T, B, gemFn) {
      for (const p of [T, B]) { ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, TAU); fs(ctx, '#ffd24a', 1.1); }
      for (const k of [0.25, 0.75]) { const p = at(k); ctx.beginPath(); ctx.ellipse(p[0], p[1], 3.2, 2, 0, 0, TAU); fs(ctx, '#ffd24a', 0.9); gemFn(ctx, p[0], p[1], 1.1, c.gem || '#d6243a'); }
    }
  };

  /* ---------------- HOLE MÁGŮ: tvar hlavice ---------------- */
  /* x, y = střed hlavice; mc = barva kouzla; raise 0–1 (zvednutí při kouzlení) */
  A.staffHead = (ctx, id, y, mc, trim, raise, M) => {
    raise = raise || 0;
    const glow = (M && M.glow) || mc;
    const orb = (cx, cy, r) => {
      ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 10 + raise * 14;
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0.5, cx, cy, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, glow); g.addColorStop(1, shade(glow, -0.4));
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    };
    if (id === 'krystal') { // vysoký šestiboký krystal v kovových drápech
      ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 12 + raise * 12;
      ctx.beginPath(); ctx.moveTo(0, y - 13); ctx.lineTo(4.4, y - 5); ctx.lineTo(3.6, y + 5); ctx.lineTo(0, y + 8); ctx.lineTo(-3.6, y + 5); ctx.lineTo(-4.4, y - 5); ctx.closePath();
      const g = ctx.createLinearGradient(-4, y - 13, 4, y + 8); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, glow); g.addColorStop(1, shade(glow, -0.35));
      fs(ctx, g, 1.3); ctx.restore();
      ctx.beginPath(); ctx.moveTo(0, y - 13); ctx.lineTo(0, y + 8); ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 1.2, y + 9); ctx.quadraticCurveTo(d * 6, y + 6, d * 5, y - 1); ctx.lineWidth = 2; ctx.strokeStyle = trim; ctx.stroke(); }
    } else if (id === 'lebka') { // lebka se zářícíma očima
      ctx.beginPath(); ctx.arc(0, y - 1, 5.6, 0, TAU); fs(ctx, '#ece3cc', 1.4);
      rr(ctx, -3.4, y + 2.6, 6.8, 4, 1.2); fs(ctx, '#ece3cc', 1.2);
      ctx.fillStyle = OUT; for (const x of [-1.8, 0, 1.8]) ctx.fillRect(x - 0.4, y + 3.4, 0.8, 2.6);
      ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 8 + raise * 10; ctx.fillStyle = glow;
      for (const x of [-2.2, 2.2]) { ctx.beginPath(); ctx.arc(x, y - 1, 1.5, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-0.8, y + 1.6); ctx.lineTo(0.8, y + 1.6); ctx.lineTo(0, y + 0.2); ctx.closePath(); ctx.fillStyle = OUT; ctx.fill();
    } else if (id === 'had') { // had obtočený kolem hole drží kouli v tlamě
      ctx.beginPath(); ctx.moveTo(0, y + 12); ctx.bezierCurveTo(-7, y + 8, 7, y + 3, -2, y - 2); ctx.quadraticCurveTo(-5, y - 6, 1, y - 8);
      ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#3f8a3a'; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(3, y - 9, 4, 2.6, -0.4, 0, TAU); fs(ctx, '#4fa046', 1.2);
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(3.6, y - 10, 0.8, 0, TAU); ctx.fill();
      orb(7, y - 12, 3.4);
    } else if (id === 'strom') { // pokroucené větve s listy a malou koulí uprostřed
      ctx.lineCap = 'round';
      for (const [x2, y2] of [[-6, -9], [0, -12], [6, -8]]) { ctx.beginPath(); ctx.moveTo(0, y + 6); ctx.quadraticCurveTo(x2 * 0.2, y, x2, y + y2); ctx.lineWidth = 3.4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 1.8; ctx.strokeStyle = '#6b4528'; ctx.stroke(); }
      for (const [x2, y2, a] of [[-6, -9, -0.6], [0, -12, 0], [6, -8, 0.6], [-4, -3, -1], [4, -2, 1]]) { ctx.beginPath(); ctx.ellipse(x2, y + y2 - 1.6, 1.8, 3, a, 0, TAU); fs(ctx, '#5fb84a', 0.8); }
      orb(0, y - 2, 3.4);
    } else if (id === 'slunce') { // zlatý sluneční kotouč s paprsky
      ctx.save(); ctx.shadowColor = '#ffd24a'; ctx.shadowBlur = 10 + raise * 12;
      ctx.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, r = k % 2 ? 6 : 10; ctx.lineTo(Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); fs(ctx, '#ffd24a', 1.2);
      ctx.restore();
      orb(0, y, 4.4);
    } else if (id === 'mesic') { // srpek měsíce kolem koule
      ctx.beginPath(); ctx.arc(0, y, 8.4, 0.35, TAU - 0.35); ctx.arc(2.6, y, 6.4, TAU - 0.7, 0.7, true); ctx.closePath(); fs(ctx, '#dfe6ff', 1.3);
      orb(-0.6, y, 3.6);
      ctx.fillStyle = '#fff'; for (const [x2, y2] of [[7, -9], [9, 6]]) { ctx.beginPath(); ctx.arc(x2, y + y2, 0.9, 0, TAU); ctx.fill(); }
    } else if (id === 'andel') { // dvě černá křídla svírají rudou kouli
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, y + 6); ctx.quadraticCurveTo(d * 4, y - 2, d * 12, y - 12); ctx.quadraticCurveTo(d * 9, y - 6, d * 11, y - 3); ctx.quadraticCurveTo(d * 7, y - 2, d * 8, y + 2); ctx.quadraticCurveTo(d * 4, y + 2, 0, y + 7); ctx.closePath();
        fs(ctx, '#1a1418', 1.3); ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 0.8; ctx.stroke();
      }
      orb(0, y - 3, 4.6 + raise * 1.2);
      ctx.beginPath(); ctx.ellipse(0, y - 12, 5, 1.6, 0, 0, TAU); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,60,90,.9)'; ctx.stroke();
    } else { // výchozí: vidlice držící kouli
      ctx.beginPath(); ctx.moveTo(-5, y + 5); ctx.quadraticCurveTo(-6, y - 3, 0, y - 5); ctx.quadraticCurveTo(6, y - 3, 5, y + 5); ctx.lineWidth = 2.2; ctx.strokeStyle = trim; ctx.stroke();
      orb(0, y, 5 + raise * 1.5);
    }
  };

  /* ---------------- PŘILBY ---------------- */
  // bascinet s hledím „psí čumák“ a kroužkovým límcem (Evropa, 14. století)
  P.helmet.bascinet = (ctx, L, pal) => {
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(-6 + k * 2.6, -54.5, 1.6, 0, TAU); fs(ctx, pal.metalDark, 0.7); }
    ctx.beginPath(); ctx.moveTo(-8.5, -57); ctx.quadraticCurveTo(-9, -72, -2, -80); ctx.quadraticCurveTo(8, -74, 10, -66); ctx.lineTo(10, -57); ctx.closePath();
    const g = ctx.createLinearGradient(-8, -80, 10, -57); g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    // hledí vystupující dopředu
    ctx.beginPath(); ctx.moveTo(2, -70); ctx.quadraticCurveTo(12, -69, 17, -63); ctx.quadraticCurveTo(12, -57.5, 2, -57); ctx.closePath();
    fs(ctx, shade(pal.metal, 0.12), 1.6);
    ctx.fillStyle = '#0d0f14'; rr(ctx, 5, -66.4, 8, 1.6, 0.8); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(9 + i * 1.5, -60.6, 0.55, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(2.6, -63.5, 1.3, 0, TAU); fs(ctx, pal.trim, 0.8);
  };
  // salát: zakulacená přilba s dlouhým ocasem vzadu a průzorem
  P.helmet.sallet = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-17, -58); ctx.quadraticCurveTo(-12, -62, -8, -64); ctx.quadraticCurveTo(-6, -77, 2, -77); ctx.quadraticCurveTo(10, -76, 11, -64); ctx.lineTo(11, -62); ctx.lineTo(-7, -60.5); ctx.quadraticCurveTo(-12, -58.5, -17, -58); ctx.closePath();
    const g = ctx.createLinearGradient(-17, -77, 11, -58); g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.fillStyle = '#0d0f14'; rr(ctx, 2.4, -67, 8.4, 2, 0.8); ctx.fill();
    // bradový chránič (bevor)
    ctx.beginPath(); ctx.moveTo(-1, -60); ctx.quadraticCurveTo(10, -61, 11, -56); ctx.quadraticCurveTo(5, -52.5, -1, -54); ctx.closePath(); fs(ctx, pal.metalDark, 1.4);
    ctx.beginPath(); ctx.moveTo(-5, -75); ctx.quadraticCurveTo(2, -79, 9, -73); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
  };
  // spangenhelm: kónická přilba z plátů s nýty, nánosník a kroužkový závěs
  P.helmet.spangen = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-9, -57); ctx.quadraticCurveTo(-11, -60, -9, -64); ctx.lineTo(-13, -54); ctx.lineTo(-4, -52); ctx.closePath(); fs(ctx, pal.metalDark, 1.2);
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-11 + k * 1.8, -55 + (k % 2), 1.1, 0, TAU); fs(ctx, pal.metal, 0.6); }
    ctx.beginPath(); ctx.moveTo(-8.5, -63); ctx.quadraticCurveTo(-6, -76, 2, -80); ctx.quadraticCurveTo(9, -75, 11, -63); ctx.closePath();
    const g = ctx.createLinearGradient(-8, -80, 11, -63); g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.lineWidth = 2; ctx.strokeStyle = pal.trim;
    for (const x of [-3, 6]) { ctx.beginPath(); ctx.moveTo(2, -79); ctx.lineTo(x, -63.5); ctx.stroke(); }
    rr(ctx, -9, -65, 21, 3.2, 1.2); fs(ctx, pal.trim, 1.2);
    ctx.fillStyle = OUT; for (let x = -6; x < 11; x += 4) { ctx.beginPath(); ctx.arc(x, -63.4, 0.6, 0, TAU); ctx.fill(); }
    rr(ctx, 8.4, -64, 2.6, 9, 1); fs(ctx, pal.trim, 1.1);
  };
  // zunari kabuto s celoobličejovou maskou menpó a zlatým srpkem měsíce
  P.helmet.zunari = (ctx, L, pal) => {
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-6, -66 + i * 4.4); ctx.quadraticCurveTo(-14 - i * 2, -64 + i * 4.4, -16 - i * 2.4, -58 + i * 4.4); ctx.lineTo(-11 - i * 2, -56.5 + i * 4.4); ctx.quadraticCurveTo(-8, -60 + i * 4.4, -4, -62 + i * 4.4); ctx.closePath(); fs(ctx, i % 2 ? pal.metalDark : pal.metal, 1.3); }
    // maska přes celý obličej s knírem
    ctx.beginPath(); ctx.moveTo(-1.5, -67); ctx.quadraticCurveTo(10, -68, 11.4, -62); ctx.quadraticCurveTo(11, -54.5, 4, -53); ctx.quadraticCurveTo(-1, -55, -1.5, -67); ctx.closePath();
    fs(ctx, pal.mask || '#2a2226', 1.5);
    ctx.fillStyle = pal.eyes === '#1b1b1b' ? '#e8b84a' : pal.eyes; rr(ctx, 4.6, -65, 4.6, 1.4, 0.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -59); ctx.quadraticCurveTo(7, -60.5, 10.4, -58.4); ctx.lineWidth = 1.4; ctx.strokeStyle = '#f2ecdc'; ctx.stroke();
    // vysoká plochá miska zunari
    ctx.beginPath(); ctx.moveTo(-8.6, -66); ctx.lineTo(-7.6, -75); ctx.quadraticCurveTo(2, -78.5, 11, -75); ctx.lineTo(11.4, -66); ctx.closePath();
    const g = ctx.createLinearGradient(-8, -78, 11, -66); g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.beginPath(); ctx.moveTo(-8, -70); ctx.lineTo(11.2, -70); ctx.lineWidth = 1.1; ctx.strokeStyle = pal.lace || pal.trim; ctx.stroke();
    // srpek měsíce (maedate)
    ctx.beginPath(); ctx.arc(2, -82, 11, 0.25 * Math.PI, 0.75 * Math.PI, false); ctx.arc(2, -86, 10.4, 0.7 * Math.PI, 0.3 * Math.PI, true); ctx.closePath();
    fs(ctx, pal.crest || '#f2c94c', 1.3);
  };

  /* ---------------- ŠTÍTY ---------------- */
  // pavéza: vysoký obdélníkový štít s hřbetem a malovaným znakem (husité)
  P.shield.pavise = (ctx, L, pal, atk) => {
    const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0;
    ctx.save(); ctx.translate(sx, 0);
    ctx.beginPath(); ctx.moveTo(1, -64); ctx.lineTo(20, -64); ctx.lineTo(21, -20); ctx.lineTo(0, -20); ctx.closePath(); fs(ctx, pal.tunic, 2.2);
    rr(ctx, 8.4, -64, 4.2, 44, 1.5); fs(ctx, shade(pal.tunic, -0.25), 1.2);
    ctx.beginPath(); ctx.moveTo(3, -61.5); ctx.lineTo(18, -61.5); ctx.lineTo(18.8, -22.5); ctx.lineTo(2.2, -22.5); ctx.closePath(); ctx.lineWidth = 1.6; ctx.strokeStyle = pal.trim; ctx.stroke();
    // kalich / znak
    const F = pal.feat || {};
    ctx.beginPath(); ctx.moveTo(5.5, -52); ctx.quadraticCurveTo(10.5, -42, 15.5, -52); ctx.closePath(); fs(ctx, F.emblemColor || pal.trim, 1.1);
    rr(ctx, 9.6, -45, 1.8, 7, 0.6); fs(ctx, F.emblemColor || pal.trim, 0.8);
    rr(ctx, 6.5, -38.5, 8, 2, 0.8); fs(ctx, F.emblemColor || pal.trim, 0.8);
    ctx.restore();
  };
  // erbový štít s krokví
  P.shield.heater = (ctx, L, pal, atk) => {
    const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0;
    ctx.save(); ctx.translate(sx, 0);
    const path = () => { ctx.beginPath(); ctx.moveTo(1, -56); ctx.lineTo(20, -56); ctx.lineTo(20, -44); ctx.quadraticCurveTo(19, -30, 10.5, -24); ctx.quadraticCurveTo(2, -30, 1, -44); ctx.closePath(); };
    path(); fs(ctx, pal.tunic, 2.2);
    ctx.save(); path(); ctx.clip();
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(10.5, -46); ctx.lineTo(21, -30); ctx.lineTo(21, -24); ctx.lineTo(10.5, -40); ctx.lineTo(0, -24); ctx.closePath(); fs(ctx, (pal.feat && pal.feat.emblemColor) || pal.trim, 1.2);
    ctx.restore();
    path(); ctx.lineWidth = 1.6; ctx.strokeStyle = shade(pal.trim, 0.2); ctx.stroke();
    ctx.restore();
  };
  // vikingský kulatý štít se spirálou a kovovou puklicí
  P.shield.spiral = (ctx, L, pal, atk) => {
    const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0, x = 8 + sx, y = -41;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); fs(ctx, pal.tunic, 2);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.clip();
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x, y); for (let a = 0; a < 2.4; a += 0.2) ctx.lineTo(x + Math.cos(a + k * 2.09) * a * 4.8, y + Math.sin(a + k * 2.09) * a * 4.8); ctx.lineWidth = 3; ctx.strokeStyle = (pal.feat && pal.feat.emblemColor) || pal.trim; ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, 11.5, 0, TAU); ctx.lineWidth = 1.6; ctx.strokeStyle = pal.metalDark; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); fs(ctx, pal.metal, 1.4);
  };
  /* ---------------- BOŽSKÝ PADLÝ ANDĚL ---------------- */
  // meč: černá čepel se zlatým ostřím, záštita z křídel a rudý drahokam
  M.andel = (ctx, c) => {
    GO(ctx, c, 16);
    ctx.beginPath(); ctx.moveTo(-4.4, 6); ctx.lineTo(-4, 40); ctx.lineTo(0, 50); ctx.lineTo(4, 40); ctx.lineTo(4.4, 6); ctx.closePath();
    fs(ctx, BF(ctx, c, -4.4, 4.4), 1.7); GF(ctx);
    ctx.beginPath(); ctx.moveTo(-3.6, 8); ctx.lineTo(-3.2, 40); ctx.lineTo(0, 48); ctx.lineTo(3.2, 40); ctx.lineTo(3.6, 8); ctx.lineWidth = 1; ctx.strokeStyle = c.edge; ctx.stroke();
    ctx.save(); ctx.shadowColor = c.glow; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 40); ctx.lineWidth = 1.4; ctx.strokeStyle = c.glow; ctx.stroke(); ctx.restore();
    for (const d of [-1, 1]) { // záštita: dvě křídla
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.quadraticCurveTo(d * 8, 0, d * 15, 6); ctx.quadraticCurveTo(d * 11, 6, d * 13, 9); ctx.quadraticCurveTo(d * 8, 7, d * 9, 10); ctx.quadraticCurveTo(d * 5, 7, 0, 7); ctx.closePath(); fs(ctx, c.guard, 1.3);
    }
    rr(ctx, -1.9, -9, 3.8, 12, 1.2); fs(ctx, c.grip, 1.2);
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(3.4, -10.5); ctx.lineTo(0, -8); ctx.lineTo(-3.4, -10.5); ctx.closePath(); fs(ctx, c.guard, 1.2);
    gem(ctx, 0, 5.6, 2, c.gem);
  };
  // kopí: okřídlený černý hrot se zlatým ostřím
  PO.andel = (ctx, c) => {
    GO(ctx, c, 14);
    ctx.beginPath(); ctx.moveTo(46, -3.4); ctx.quadraticCurveTo(62, -4.4, 76, 0); ctx.quadraticCurveTo(62, 4.4, 46, 3.4); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 76), 1.5);
    ctx.beginPath(); ctx.moveTo(48, -2.4); ctx.quadraticCurveTo(62, -3.2, 73, 0); ctx.quadraticCurveTo(62, 3.2, 48, 2.4); ctx.lineWidth = 0.9; ctx.strokeStyle = c.edge; ctx.stroke();
    GF(ctx);
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(47, d * 2); ctx.quadraticCurveTo(44, d * 10, 38, d * 14); ctx.quadraticCurveTo(42, d * 8, 39, d * 7); ctx.quadraticCurveTo(43, d * 5, 41, d * 3); ctx.closePath(); fs(ctx, c.guard, 1.2); }
    gem(ctx, 45, 0, 2, c.gem);
  };
  A.BOW_REF.andel = [36, 33];
  A.bowDecor.andel = (ctx, at, c, T, B, gemFn) => {
    for (let k = 0.08; k < 0.95; k += 0.09) { if (Math.abs(k - 0.5) < 0.1) continue; const p = at(k); ctx.save(); ctx.translate(p[0] - 2, p[1]); ctx.rotate(k < 0.5 ? -0.5 : 0.5); ctx.beginPath(); ctx.ellipse(-4, 0, 5, 1.8, 0, 0, TAU); fs(ctx, '#1a1418', 0.8); ctx.restore(); }
    for (const p of [T, B]) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, TAU); fs(ctx, '#ffd24a', 1); }
    gemFn(ctx, at(0.5)[0] - 3.4, at(0.5)[1], 1.6, c.gem || '#ff2a4a');
  };
  // obří černá křídla na zádech a rudá aura padlého anděla
  function fallenWings(ctx, F, t, moving, w) {
    const flap = Math.sin(t * 2.2) * 0.06 + (moving ? Math.sin((w || 0) * 0.6) * 0.04 : 0);
    const col = F.wingColor || '#1a1418';
    ctx.save(); ctx.translate(-3, -52);
    for (const [sc, alpha, rot] of [[1, 0.75, -0.18], [0.92, 1, 0.02]]) {
      ctx.save(); ctx.rotate(rot - flap); ctx.scale(sc, sc); ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-18, -34, -46, -40); ctx.quadraticCurveTo(-38, -30, -44, -22);
      for (let k = 0; k < 6; k++) { const x = -44 + k * 6.4, y = -22 + k * 5.4; ctx.quadraticCurveTo(x + 1, y + 6, x + 4.6, y + 3.4); }
      ctx.quadraticCurveTo(-8, 8, 0, 0); ctx.closePath();
      const g = ctx.createLinearGradient(-46, -40, 0, 10); g.addColorStop(0, A.shade(col, 0.25)); g.addColorStop(1, col);
      fs(ctx, g, 1.6);
      ctx.strokeStyle = 'rgba(255,60,90,.55)'; ctx.lineWidth = 0.8;
      for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-4 - k * 2, -4 - k * 3); ctx.lineTo(-40 + k * 6.4, -18 + k * 5.4); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  }
  function fallenAura(ctx, t) {
    ctx.save();
    const g = ctx.createRadialGradient(0, -40, 4, 0, -40, 48); g.addColorStop(0, 'rgba(255,40,80,.22)'); g.addColorStop(1, 'rgba(255,40,80,0)');
    ctx.fillStyle = g; ctx.fillRect(-48, -92, 96, 96);
    for (let i = 0; i < 6; i++) { const a = t * 1.3 + i * 1.05, x = Math.sin(a * 1.4) * 20, y = -((t * 26 + i * 14) % 80); ctx.beginPath(); ctx.arc(x, y, 1.1 + (i % 2) * 0.6, 0, TAU); ctx.fillStyle = i % 2 ? 'rgba(255,90,120,.9)' : 'rgba(255,210,122,.9)'; ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(1, -86, 9, 2.6, 0, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,60,90,.85)'; ctx.stroke();
    ctx.restore();
  }
  const drawF0 = A.drawFeatures;
  A.drawFeatures = (ctx, L, pal, st, layer, moving, w) => {
    const F = pal.feat;
    if (F && layer === 'back') {
      if (F.aura === 'fallen') fallenAura(ctx, st.t || 0);
      if (F.wings === 'fallen') fallenWings(ctx, F, st.t || 0, moving, w);
      if (F.aura === 'fallen' || F.wings) { const F2 = Object.assign({}, F, { aura: F.aura === 'fallen' ? null : F.aura }); return drawF0(ctx, L, Object.assign({}, pal, { feat: F2 }), st, layer, moving, w); }
    }
    return drawF0(ctx, L, pal, st, layer, moving, w);
  };

  // VÁLEČNÉ KLADIVO: zřetelné kladivo – hranatá palice dopředu, bodec dozadu a hrot nahoře
  M.kladivo = (ctx, c) => {
    const S = M.AXE_SIDE;
    rr(ctx, -1.8, -8, 3.6, 46, 1.4); fs(ctx, c.wood, 1.4);
    ctx.strokeStyle = shade(c.wood, -0.3); ctx.lineWidth = 0.7; for (let y = -6; y < 4; y += 2.2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1); ctx.stroke(); }
    GO(ctx, c);
    // palice (hlava kladiva) – hranatý blok s rýhovanou plochou
    rr(ctx, S > 0 ? 3 : -13, 30, 10, 10, 1.6); fs(ctx, BF(ctx, c, S > 0 ? 3 : -13, S > 0 ? 13 : -3), 1.6);
    ctx.strokeStyle = shade(c.dark, -0.2); ctx.lineWidth = 0.8;
    const fx = S > 0 ? 12.4 : -12.4; for (let y = 31.5; y < 39; y += 2.4) { ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx - S * 2, y + 1.2); ctx.stroke(); }
    // bodec dozadu
    ctx.beginPath(); ctx.moveTo(-S * 3, 31.5); ctx.lineTo(-S * 14, 36); ctx.lineTo(-S * 3, 38.5); ctx.closePath(); fs(ctx, c.dark, 1.3);
    GF(ctx);
    rr(ctx, -3.2, 29, 6.4, 12, 1.4); fs(ctx, c.guard || c.dark, 1.3);
    ctx.beginPath(); ctx.moveTo(-1.6, 41); ctx.lineTo(0, 48); ctx.lineTo(1.6, 41); ctx.closePath(); fs(ctx, c.dark, 1.1);
  };
})();
