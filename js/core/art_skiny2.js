/* =========================================================================
   DALŠÍ TVARY PRO SKINY (balíček 3)
   Na blízko: dvoubřitá sekera (obousekera), flamberk (vlnitý obouruční meč), nodači
   (extra dlouhý samurajský meč), sax (vikingský nůž-meč), šestipér.
   Kopí: okřídlené kopí, válečné kladivo na tyči, ómi jari (široký list).
   Luky: kostěný, ledový, ohnivý. Hole: plamen, oko, runový kámen.
   ========================================================================= */
(function () {
  const A = window.Art, TAU = Math.PI * 2, OUT = A.OUT;
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  const shade = A.shade;
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const M = A.MELEE_REF, PO = A.POLE_REF, BF = A.bladeFill, GO = A.glowOn, GF = A.glowOff, hilt = A.hiltDraw, gem = A.gemDot;

  /* ---------------- NA BLÍZKO (rukojeť v 0, čepel ve směru +y) ---------------- */
  Object.assign(M, {
    // dvoubřitá sekera: dvě půlměsícová ostří na krátké násadě
    obousekera(ctx, c) {
      rr(ctx, -1.9, -10, 3.8, 46, 1.4); fs(ctx, c.wood || '#5a3a1e', 1.4);
      ctx.strokeStyle = shade(c.wood || '#5a3a1e', -0.3); ctx.lineWidth = 0.7;
      for (let y = -8; y < 4; y += 2.2) { ctx.beginPath(); ctx.moveTo(-1.9, y); ctx.lineTo(1.9, y + 1); ctx.stroke(); }
      GO(ctx, c);
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(d * 1.6, 26); ctx.quadraticCurveTo(d * 6, 25, d * 13, 18); ctx.quadraticCurveTo(d * 17, 29, d * 13, 41); ctx.quadraticCurveTo(d * 6, 34, d * 1.6, 34); ctx.closePath();
        fs(ctx, BF(ctx, c, d * 1.6, d * 17), 1.6);
        ctx.beginPath(); ctx.moveTo(d * 13.2, 19.5); ctx.quadraticCurveTo(d * 16.4, 29, d * 13.2, 39.5); ctx.lineWidth = 1.1; ctx.strokeStyle = c.edge || '#ffffff'; ctx.stroke();
      }
      GF(ctx);
      rr(ctx, -2.6, 24, 5.2, 11, 1.2); fs(ctx, c.dark, 1.1);
      if (c.gem) gem(ctx, 0, 29.5, 1.5, c.gem);
      ctx.beginPath(); ctx.moveTo(-1.6, 36); ctx.lineTo(0, 42); ctx.lineTo(1.6, 36); ctx.closePath(); fs(ctx, c.dark, 1);
    },
    // flamberk: dlouhý obouruční meč s vlnitou (plamennou) čepelí
    flamberk(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(-3.4, 6);
      for (let y = 6; y <= 46; y += 4) ctx.lineTo(-3.4 + Math.sin(y * 0.55) * 1.4 + (y / 46) * 0.6, y);
      ctx.lineTo(0, 54);
      for (let y = 46; y >= 6; y -= 4) ctx.lineTo(3.4 + Math.sin(y * 0.55) * 1.4 - (y / 46) * 0.6, y);
      ctx.closePath(); fs(ctx, BF(ctx, c, -4.5, 4.5), 1.6); GF(ctx);
      ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 44); ctx.lineWidth = 1.1; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      // parírovací háčky nad záštitou
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 3.4, 9); ctx.quadraticCurveTo(d * 7.5, 11, d * 6.5, 15); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 1.6; ctx.strokeStyle = c.guard; ctx.stroke(); }
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 3.6); ctx.quadraticCurveTo(d * 8, 1, d * 13, 5); ctx.lineCap = 'round'; ctx.lineWidth = 4.4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = c.guard; ctx.stroke(); ctx.beginPath(); ctx.arc(d * 13, 5, 1.8, 0, TAU); fs(ctx, c.guard, 0.9); }
      rr(ctx, -1.9, -17, 3.8, 19, 1.2); fs(ctx, c.grip, 1.2);
      ctx.strokeStyle = shade(c.grip, 0.35); ctx.lineWidth = 0.7; for (let y = -16; y < 1; y += 2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1.2); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(0, -18.5, 3.2, 2.6, 0, 0, TAU); fs(ctx, c.pommel || c.guard, 1.2);
      if (c.gem) gem(ctx, 0, -18.5, 1.3, c.gem);
    },
    // nodači: extra dlouhý samurajský meč s dlouhou rukojetí
    nodachi(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(-2, 5); ctx.quadraticCurveTo(1, 36, -8, 60); ctx.lineTo(-5, 62); ctx.quadraticCurveTo(5, 36, 2.4, 5); ctx.closePath();
      fs(ctx, BF(ctx, c, -6, 2.4), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(1.2, 7); ctx.quadraticCurveTo(3.4, 36, -5, 59); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      ctx.beginPath(); for (let y = 8; y < 54; y += 3) ctx.lineTo(-0.3 - (y / 54) * 4 + (y % 6 ? 0.9 : -0.4), y); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke();
      rr(ctx, -1.9, -20, 3.8, 23, 1.2); fs(ctx, c.grip, 1.2);
      ctx.fillStyle = shade(c.grip, 0.5); for (let y = -19; y < 2; y += 2.6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1.6, y + 1.3); ctx.lineTo(0, y + 2.6); ctx.lineTo(-1.6, y + 1.3); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(0, 3.6, 6.4, 2.8, 0, 0, TAU); fs(ctx, c.guard, 1.3);
      rr(ctx, -2.2, -22, 4.4, 3, 1); fs(ctx, c.guard, 1);
      if (c.gem) gem(ctx, 0, 3.6, 1.2, c.gem);
    },
    // sax: vikingský jednobřitý nůž-meč s lomeným hřbetem
    sax(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(-2.6, 5); ctx.lineTo(-3.2, 26); ctx.lineTo(-1.2, 34); ctx.lineTo(3.4, 22); ctx.lineTo(3.2, 5); ctx.closePath();
      fs(ctx, BF(ctx, c, -3.2, 3.4), 1.5); GF(ctx);
      ctx.beginPath(); ctx.moveTo(1.6, 7); ctx.lineTo(1.8, 21); ctx.lineWidth = 0.9; ctx.strokeStyle = shade(c.dark, -0.2); ctx.stroke();
      // tepaný vzor na čepeli
      ctx.strokeStyle = c.edge || '#ffffff'; ctx.lineWidth = 0.6; for (let y = 9; y < 20; y += 3) { ctx.beginPath(); ctx.moveTo(-1.6, y); ctx.lineTo(0.4, y + 1.5); ctx.stroke(); }
      rr(ctx, -3.8, 3, 7.6, 2.6, 1); fs(ctx, c.guard, 1.1);
      rr(ctx, -1.8, -9, 3.6, 12, 1.2); fs(ctx, c.grip, 1.2);
      ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(3, -9); ctx.lineTo(0, -13); ctx.closePath(); fs(ctx, c.pommel || c.guard, 1.1);
    },
    // šestipér: palcát s šesti ostrými listy
    sestiper(ctx, c) {
      rr(ctx, -1.8, -10, 3.6, 40, 1.4); fs(ctx, c.wood || '#4a3a2a', 1.4);
      GO(ctx, c);
      for (let k = 0; k < 6; k++) {
        const a = k / 6 * TAU, ca = Math.cos(a);
        ctx.beginPath(); ctx.moveTo(ca * 1.5, 26); ctx.quadraticCurveTo(ca * 7.5, 28, ca * 6.5, 33); ctx.lineTo(ca * 6, 40); ctx.quadraticCurveTo(ca * 3, 37, ca * 1.5, 40); ctx.closePath();
        fs(ctx, BF(ctx, c, -7, 7), 1.2);
      }
      GF(ctx);
      ctx.beginPath(); ctx.arc(0, 42, 2.4, 0, TAU); fs(ctx, c.dark, 1);
      rr(ctx, -2.4, 23, 4.8, 3, 1); fs(ctx, c.guard || c.dark, 1);
      if (c.gem) gem(ctx, 0, 32, 1.3, c.gem);
    }
  });
  Object.assign(A.HEADED_REF, { obousekera: 1, sestiper: 1 });
  Object.assign(A.FLIP_REF, { nodachi: 1 });

  /* ---------------- KOPÍ (násada podél +x, hrot od x ≈ 44) ---------------- */
  Object.assign(PO, {
    // okřídlené kopí: listový hrot a dvě „křídla“ pod ním (zastaví nepřítele)
    kridla(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(46, -2.6); ctx.quadraticCurveTo(60, -6, 75, 0); ctx.quadraticCurveTo(60, 6, 46, 2.6); ctx.closePath(); fs(ctx, BF(ctx, c, 46, 75), 1.4);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(43, d * 2); ctx.lineTo(46, d * 9); ctx.lineTo(48.5, d * 2); ctx.closePath(); fs(ctx, BF(ctx, c, 43, 49), 1.2); }
      GF(ctx);
      ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(71, 0); ctx.lineWidth = 0.8; ctx.strokeStyle = c.dark; ctx.stroke();
      rr(ctx, 36, -2.6, 7, 5.2, 1); fs(ctx, c.guard || c.dark, 1);
      if (c.gem) gem(ctx, 39.5, 0, 1.4, c.gem);
    },
    // válečné kladivo na tyči (lucernské kladivo): kladivo, zobec a dlouhý bodec
    tyckladivo(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(52, -2); ctx.lineTo(74, 0); ctx.lineTo(52, 2); ctx.closePath(); fs(ctx, BF(ctx, c, 52, 74), 1.3);
      rr(ctx, 46, -9, 8, 18, 1.6); fs(ctx, BF(ctx, c, 46, 54), 1.5);
      // kladivová hlava se čtyřmi hroty
      for (const y of [-12, -9.5]) { ctx.beginPath(); ctx.moveTo(47, y + 3); ctx.lineTo(48.5, y); ctx.lineTo(50, y + 3); ctx.closePath(); fs(ctx, c.dark, 0.8); }
      // zobec na druhé straně
      ctx.beginPath(); ctx.moveTo(48, 8); ctx.quadraticCurveTo(51, 15, 47, 21); ctx.quadraticCurveTo(52, 15, 52.5, 8); ctx.closePath(); fs(ctx, BF(ctx, c, 47, 53), 1.3);
      GF(ctx);
      for (const x of [40, 44]) { rr(ctx, x, -2.8, 2.4, 5.6, 0.8); fs(ctx, c.guard || c.dark, 0.9); }
    },
    // ómi jari: samurajské kopí se širokým dlouhým listem
    omi(ctx, c) {
      GO(ctx, c);
      ctx.beginPath(); ctx.moveTo(45, -3.6); ctx.quadraticCurveTo(66, -6.4, 80, 0); ctx.quadraticCurveTo(66, 6.4, 45, 3.6); ctx.closePath(); fs(ctx, BF(ctx, c, 45, 80), 1.5);
      GF(ctx);
      ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(76, 0); ctx.lineWidth = 0.9; ctx.strokeStyle = c.dark; ctx.stroke();
      // lakovaná objímka se šňůrou
      rr(ctx, 37, -3.2, 8.4, 6.4, 1.4); fs(ctx, c.guard || '#1a1a1a', 1.1);
      ctx.beginPath(); ctx.moveTo(38, 3); ctx.quadraticCurveTo(36, 10, 39, 14); ctx.lineWidth = 1.4; ctx.strokeStyle = c.gem || '#c8262a'; ctx.stroke();
    }
  });

  /* ---------------- LUKY ---------------- */
  Object.assign(A.BOW_REF, { lebka: [35, 32], ledovy: [35, 32], ohnivy: [35, 32] });
  Object.assign(A.bowDecor, {
    // kostěný luk: obratle po ramenou a lebka uprostřed
    lebka(ctx, at) {
      for (let k = 0.12; k < 0.92; k += 0.09) { if (Math.abs(k - 0.5) < 0.1) continue; const p = at(k); ctx.beginPath(); ctx.ellipse(p[0], p[1], 2.6, 1.6, 0, 0, TAU); fs(ctx, '#ece3cc', 0.8); }
      const m = at(0.5); ctx.beginPath(); ctx.arc(m[0] - 1, m[1], 3.4, 0, TAU); fs(ctx, '#ece3cc', 1);
      ctx.fillStyle = OUT; for (const d of [-1.2, 1.2]) { ctx.beginPath(); ctx.arc(m[0] - 2, m[1] + d, 0.8, 0, TAU); ctx.fill(); }
    },
    // ledový luk: ledové krystaly vyrůstající z ramen
    ledovy(ctx, at, c) {
      ctx.save(); ctx.shadowColor = c.glow || '#9fe0ff'; ctx.shadowBlur = 6;
      for (const k of [0.1, 0.24, 0.38, 0.62, 0.76, 0.9]) {
        const p = at(k), up = k < 0.5 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(p[0] - 1, p[1] - 1.4); ctx.lineTo(p[0] - 7, p[1] + up * 3.4); ctx.lineTo(p[0] - 1, p[1] + 1.4); ctx.closePath();
        const g = ctx.createLinearGradient(p[0], p[1], p[0] - 7, p[1]); g.addColorStop(0, '#e6f8ff'); g.addColorStop(1, c.glow || '#7fd3ff');
        fs(ctx, g, 0.8);
      }
      ctx.restore();
    },
    // ohnivý luk: plameny šlehající z ramen
    ohnivy(ctx, at, c, T, B) {
      ctx.save(); ctx.shadowColor = '#ff7a2a'; ctx.shadowBlur = 8;
      for (const k of [0.14, 0.3, 0.7, 0.86]) {
        const p = at(k);
        ctx.beginPath(); ctx.moveTo(p[0] - 1, p[1] - 2); ctx.quadraticCurveTo(p[0] - 9, p[1] - 4, p[0] - 7, p[1] - 9); ctx.quadraticCurveTo(p[0] - 4, p[1] - 4, p[0] - 1, p[1] + 2); ctx.closePath();
        fs(ctx, '#ff8a2a', 0.8);
        ctx.beginPath(); ctx.moveTo(p[0] - 1.5, p[1] - 1); ctx.quadraticCurveTo(p[0] - 6, p[1] - 3, p[0] - 5, p[1] - 6); ctx.quadraticCurveTo(p[0] - 3.5, p[1] - 3, p[0] - 1.5, p[1] + 1); ctx.closePath();
        ctx.fillStyle = '#ffe07a'; ctx.fill();
      }
      for (const q of [T, B]) { ctx.beginPath(); ctx.arc(q[0], q[1], 2.4, 0, TAU); fs(ctx, '#ff5a1a', 0.9); }
      ctx.restore();
    }
  });

  /* ---------------- HOLE MÁGŮ ---------------- */
  const prevHead = A.staffHead;
  A.staffHead = (ctx, id, y, mc, trim, raise, Mo) => {
    raise = raise || 0;
    const glow = (Mo && Mo.glow) || mc;
    if (id === 'plamen') { // živý plamen v železném koši
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 1.2, y + 8); ctx.quadraticCurveTo(d * 7, y + 5, d * 6, y - 2); ctx.lineWidth = 2; ctx.strokeStyle = trim || '#5a5a5a'; ctx.stroke(); }
      ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 12 + raise * 14;
      const fl = (s, col) => { ctx.beginPath(); ctx.moveTo(-5 * s, y + 4); ctx.quadraticCurveTo(-7 * s, y - 6 * s, 0, y - 16 * s - raise * 3); ctx.quadraticCurveTo(7 * s, y - 6 * s, 5 * s, y + 4); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
      fl(1, glow); fl(0.6, '#ffe9a0'); ctx.restore();
    } else if (id === 'oko') { // oko v kamenném prstenci
      ctx.beginPath(); ctx.arc(0, y - 2, 8, 0, TAU); fs(ctx, '#5a5650', 1.4);
      ctx.beginPath(); ctx.ellipse(0, y - 2, 6.2, 3.8, 0, 0, TAU); fs(ctx, '#fff6e8', 1);
      ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 8 + raise * 12;
      ctx.beginPath(); ctx.arc(0, y - 2, 2.8 + raise * 0.6, 0, TAU); ctx.fillStyle = glow; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, y - 2, 0.9, 2.4, 0, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
    } else if (id === 'runa') { // runový kámen svázaný řemínky
      ctx.beginPath(); ctx.moveTo(-5, y + 6); ctx.lineTo(-6, y - 6); ctx.lineTo(0, y - 12); ctx.lineTo(6, y - 6); ctx.lineTo(5, y + 6); ctx.closePath(); fs(ctx, '#8a8f99', 1.4);
      ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 8 + raise * 12; ctx.strokeStyle = glow; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, y - 8); ctx.lineTo(0, y + 3); ctx.moveTo(0, y - 6); ctx.lineTo(3, y - 3); ctx.moveTo(0, y - 2); ctx.lineTo(-3, y + 1); ctx.stroke(); ctx.restore();
      for (const yy of [y + 4, y - 4]) { ctx.beginPath(); ctx.moveTo(-6, yy); ctx.lineTo(6, yy + 1); ctx.lineWidth = 1.2; ctx.strokeStyle = '#6b4528'; ctx.stroke(); }
    } else return prevHead(ctx, id, y, mc, trim, raise, Mo);
  };
})();
