/* =========================================================================
   ZBRANĚ A OZDOBY ZBROJÍ – skutečné tvary, ne jen barvy
   Modely zbraní (meče, katany, sekery, kladiva, kopí, trojzubce, halapartny,
   luky…) a tvarové prvky skinů (nárameníky, pláště, hermelín, znaky na hrudi,
   chocholy, rohy kuwagata, aury). Volá je Art.drawUnit.

   Model zbraně: pal.wmodel = { id, ...barvy } (ze skinu zbraně nebo výbavy)
   Prvky zbroje:  pal.feat = { cape, collar, chest, pauldron, crest, aura }
   ========================================================================= */
(function () {
  const TAU = Math.PI * 2;
  const A = window.Art;
  const fs = (ctx, fill, lw) => A.fs(ctx, fill, lw);
  const OUT = A.OUT || '#121419';
  const shade = A.shade;
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };

  /* ---------------- kategorie zbraní podle vzhledu jednotky ---------------- */
  const CAT = { sword: 'melee', longsword: 'melee', katana: 'melee', katana2: 'melee', axe: 'melee', daneaxe: 'melee', flamesword: 'melee',
    spear: 'pole', yari: 'pole', trident: 'pole', bow: 'bow', yumi: 'bow', staff: 'staff' };
  const weaponCat = w => CAT[w] || null;

  /* barvy modelu: z modelu, jinak z palety jednotky */
  function colors(pal, M) {
    M = M || {};
    return {
      blade: M.blade || pal.wpnBlade || '#eef2f7', dark: M.dark || '#7d8a9c', edge: M.edge || '#ffffff',
      guard: M.guard || pal.trim || '#d9b04a', grip: M.grip || pal.leatherDark || '#3a2414', pommel: M.pommel || M.guard || pal.trim || '#d9b04a',
      glow: M.glow || pal.glow || null, gem: M.gem || null, wood: M.wood || pal.wood || '#8a5a32', string: M.string || pal.string || '#e9e4d6'
    };
  }
  function bladeFill(ctx, c, x0, x1) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, c.edge); g.addColorStop(0.45, c.blade); g.addColorStop(1, c.dark);
    return g;
  }
  function glowOn(ctx, c, b) { if (c.glow) { ctx.shadowColor = c.glow; ctx.shadowBlur = b || 12; } }
  function glowOff(ctx) { ctx.shadowBlur = 0; }
  function gem(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); fs(ctx, col, 1.1); ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill(); }

  /* jílec: rukojeť, záštita, hlavice (společné pro meče) */
  function hilt(ctx, c, guardW, style) {
    // rukojeť s omotávkou
    rr(ctx, -1.9, -6, 3.8, 9, 1.2); fs(ctx, c.grip, 1.2);
    ctx.strokeStyle = shade(c.grip, 0.35); ctx.lineWidth = 0.7;
    for (let y = -5; y < 3; y += 2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1.2); ctx.stroke(); }
    // záštita
    if (style === 'tsuba') {
      ctx.beginPath(); ctx.ellipse(0, 3.6, 5.6, 2.2, 0, 0, TAU); fs(ctx, c.guard, 1.3);
    } else if (style === 'royal') {
      ctx.beginPath(); ctx.moveTo(-guardW, -1); ctx.quadraticCurveTo(-guardW * 0.5, 5.5, 0, 3.4); ctx.quadraticCurveTo(guardW * 0.5, 5.5, guardW, -1);
      ctx.lineTo(guardW - 1.5, 2); ctx.quadraticCurveTo(guardW * 0.4, 7.5, 0, 6.2); ctx.quadraticCurveTo(-guardW * 0.4, 7.5, -guardW + 1.5, 2); ctx.closePath();
      fs(ctx, c.guard, 1.4);
      gem(ctx, 0, 4.6, 2, c.gem || '#d6243a');
    } else {
      rr(ctx, -guardW, 2.2, guardW * 2, 3.4, 1.5); fs(ctx, c.guard, 1.4);
      ctx.beginPath(); ctx.arc(-guardW, 3.9, 2, 0, TAU); fs(ctx, c.guard, 1.1);
      ctx.beginPath(); ctx.arc(guardW, 3.9, 2, 0, TAU); fs(ctx, c.guard, 1.1);
    }
    // hlavice
    if (style !== 'tsuba') { ctx.beginPath(); ctx.arc(0, -7, 2.7, 0, TAU); fs(ctx, c.pommel, 1.2); if (c.gem) gem(ctx, 0, -7, 1.3, c.gem); }
    else { rr(ctx, -2.2, -9, 4.4, 3, 1); fs(ctx, c.guard, 1); }
  }

  /* ------------ MODELY ZBRANÍ NA BLÍZKO (rukojeť v 0, čepel ve směru +y) ------------ */
  const MELEE = {
    AXE_SIDE: -1, HEAD_ROT: -1.7,
    // jednoruční meč: široká čepel s žlábkem
    mec(ctx, c) {
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(-3.6, 5); ctx.lineTo(-3.2, 34); ctx.lineTo(0, 40); ctx.lineTo(3.2, 34); ctx.lineTo(3.6, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -3.6, 3.6), 1.6); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 32); ctx.lineWidth = 1.2; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      hilt(ctx, c, 8);
    },
    // dlouhý meč
    dlouhy(ctx, c) {
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(-3.9, 5); ctx.lineTo(-3.4, 40); ctx.lineTo(0, 47); ctx.lineTo(3.4, 40); ctx.lineTo(3.9, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -3.9, 3.9), 1.6); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 38); ctx.lineWidth = 1.3; ctx.strokeStyle = shade(c.dark, -0.15); ctx.stroke();
      hilt(ctx, c, 10);
      rr(ctx, -1.9, -12, 3.8, 6, 1.2); fs(ctx, c.grip, 1.1);
      ctx.beginPath(); ctx.arc(0, -13, 2.8, 0, TAU); fs(ctx, c.pommel, 1.2);
    },
    // plamenný meč (flamberk): vlnité ostří
    plamen(ctx, c) {
      glowOn(ctx, c, 16);
      ctx.beginPath(); ctx.moveTo(-3.8, 5);
      for (let y = 5; y <= 38; y += 4.2) ctx.quadraticCurveTo(-5.6 + ((y / 4.2) % 2 ? 3.2 : 0), y + 2.1, -3.4 + ((y / 4.2) % 2 ? 0.8 : 0), y + 4.2);
      ctx.lineTo(0, 46);
      for (let y = 38; y >= 5; y -= 4.2) ctx.quadraticCurveTo(5.6 - ((y / 4.2) % 2 ? 3.2 : 0), y - 2.1, 3.4 - ((y / 4.2) % 2 ? 0.8 : 0), y - 4.2);
      ctx.closePath(); fs(ctx, bladeFill(ctx, c, -4, 4), 1.6); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 38); ctx.lineWidth = 1.2; ctx.strokeStyle = c.glow || shade(c.dark, -0.2); ctx.stroke();
      hilt(ctx, c, 10);
    },
    // runový meč: široká čepel se zářícími runami
    runovy(ctx, c) {
      glowOn(ctx, c, 8);
      ctx.beginPath(); ctx.moveTo(-4.8, 5); ctx.lineTo(-4.4, 33); ctx.lineTo(0, 41); ctx.lineTo(4.4, 33); ctx.lineTo(4.8, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -4.8, 4.8), 1.7); glowOff(ctx);
      ctx.save(); ctx.shadowColor = c.glow || '#7fc8ff'; ctx.shadowBlur = 8; ctx.strokeStyle = c.glow || '#7fc8ff'; ctx.lineWidth = 1.2;
      for (const y of [11, 19, 27]) { ctx.beginPath(); ctx.moveTo(-1.6, y); ctx.lineTo(1.6, y + 2.5); ctx.moveTo(1.6, y); ctx.lineTo(0, y + 4); ctx.stroke(); }
      ctx.restore();
      hilt(ctx, c, 9);
    },
    // královský meč: zlatá záštita s drahokamem
    kral(ctx, c) {
      glowOn(ctx, c, 10);
      ctx.beginPath(); ctx.moveTo(-4.4, 6); ctx.lineTo(-3.8, 38); ctx.lineTo(0, 45); ctx.lineTo(3.8, 38); ctx.lineTo(4.4, 6); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -4.4, 4.4), 1.6); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 34); ctx.lineWidth = 2; ctx.strokeStyle = c.guard; ctx.stroke();
      hilt(ctx, c, 11, 'royal');
    },
    // hvězdná ocel: tmavá čepel s hvězdami
    hvezda(ctx, c) {
      const cc = Object.assign({}, c, { blade: '#3a3f6a', dark: '#1a1c3a', edge: '#cfd8ff' });
      glowOn(ctx, c, 14);
      ctx.beginPath(); ctx.moveTo(-4.2, 5); ctx.lineTo(-3.6, 38); ctx.lineTo(0, 46); ctx.lineTo(3.6, 38); ctx.lineTo(4.2, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, cc, -4.2, 4.2), 1.6); glowOff(ctx);
      ctx.fillStyle = '#fff6c4'; for (const [x, y] of [[-1, 12], [1.4, 20], [-1.2, 28], [0.8, 35]]) { ctx.beginPath(); ctx.arc(x, y, 0.9, 0, TAU); ctx.fill(); }
      hilt(ctx, c, 10, 'royal');
    },
    // krystalová čepel (led)
    krystal(ctx, c) {
      glowOn(ctx, c, 14);
      ctx.beginPath(); ctx.moveTo(-3, 5); ctx.lineTo(-5.5, 16); ctx.lineTo(-3, 26); ctx.lineTo(-4.6, 34); ctx.lineTo(0, 46); ctx.lineTo(4.6, 34); ctx.lineTo(3, 26); ctx.lineTo(5.5, 16); ctx.lineTo(3, 5); ctx.closePath();
      ctx.globalAlpha = 0.92; fs(ctx, bladeFill(ctx, c, -5, 5), 1.5); ctx.globalAlpha = 1; glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(-2, 16); ctx.lineTo(0, 26); ctx.lineTo(-1.6, 34); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
      hilt(ctx, c, 8);
    },
    // kostěný / stínový meč: zubaté ostří
    kostena(ctx, c) {
      glowOn(ctx, c, 12);
      ctx.beginPath(); ctx.moveTo(-3.6, 5);
      for (let y = 8; y < 36; y += 5) { ctx.lineTo(-6.4, y); ctx.lineTo(-3.4, y + 2.5); }
      ctx.lineTo(0, 44); ctx.lineTo(4, 36); ctx.lineTo(4, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -5, 4), 1.6); glowOff(ctx);
      hilt(ctx, c, 8);
    },
    // šavle: zahnutá čepel rozšířená ke špičce
    savle(ctx, c) {
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(-2.8, 5); ctx.quadraticCurveTo(-2, 24, -8, 36); ctx.quadraticCurveTo(-4, 44, 2, 40); ctx.quadraticCurveTo(4, 22, 3, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -6, 3), 1.6); glowOff(ctx);
      hilt(ctx, c, 7);
    },
    // katana: štíhlá zahnutá čepel, kulatá tsuba
    katana(ctx, c) {
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(-2, 5); ctx.quadraticCurveTo(-1, 28, -6, 44); ctx.lineTo(-3, 46); ctx.quadraticCurveTo(3.4, 28, 2.4, 5); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, -4, 2.4), 1.5); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(1.2, 7); ctx.quadraticCurveTo(2, 28, -3, 43); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      rr(ctx, -1.9, -11, 3.8, 14, 1.2); fs(ctx, c.grip, 1.2);
      ctx.fillStyle = shade(c.grip, 0.5); for (let y = -10; y < 2; y += 2.6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1.6, y + 1.3); ctx.lineTo(0, y + 2.6); ctx.lineTo(-1.6, y + 1.3); ctx.closePath(); ctx.fill(); }
      hilt(ctx, c, 6, 'tsuba');
    },
    // sekera: vikingská „vousatá“ sekera – rovná horní hrana, dlouhé ostří a vous
    // zatažený dolů k topůrku. SIDE = na kterou stranu míří ostří (dopředu).
    sekera(ctx, c) {
      const S = MELEE.AXE_SIDE;
      rr(ctx, -1.8, -10, 3.6, 52, 1.4); fs(ctx, c.wood, 1.4);
      ctx.strokeStyle = shade(c.wood, -0.3); ctx.lineWidth = 0.7; for (let y = -6; y < 4; y += 2.2) { ctx.beginPath(); ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y + 1); ctx.stroke(); }
      glowOn(ctx, c);
      ctx.beginPath();
      ctx.moveTo(S * 1.6, 31);                       // horní hrana u topůrka
      ctx.lineTo(S * 15, 28.5);                      // horní roh ostří
      ctx.quadraticCurveTo(S * 17.5, 37, S * 14, 47); // zahnuté ostří
      ctx.quadraticCurveTo(S * 7, 44, S * 4.5, 38.5); // vous
      ctx.lineTo(S * 1.6, 37.5);
      ctx.closePath();
      fs(ctx, bladeFill(ctx, c, S > 0 ? 1 : -17, S > 0 ? 17 : -1), 1.6); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(S * 14.6, 29.5); ctx.quadraticCurveTo(S * 16.6, 37, S * 13.4, 45.5); ctx.lineWidth = 1.2; ctx.strokeStyle = c.edge; ctx.stroke();
      rr(ctx, -2.8, 29.5, 5.6, 9, 1.2); fs(ctx, c.dark, 1.2);   // oko sekery
    },
    // válečné kladivo s hrotem
    kladivo(ctx, c) {
      rr(ctx, -1.8, -8, 3.6, 44, 1.4); fs(ctx, c.wood, 1.4);
      glowOn(ctx, c);
      rr(ctx, -2, 30, 13, 11, 2); fs(ctx, bladeFill(ctx, c, -2, 11), 1.6);
      ctx.beginPath(); ctx.moveTo(-2, 32); ctx.lineTo(-11, 35.5); ctx.lineTo(-2, 39); ctx.closePath(); fs(ctx, c.dark, 1.3);
      glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 41); ctx.lineTo(0, 47); ctx.lineWidth = 2.4; ctx.strokeStyle = c.dark; ctx.stroke();
    },
    // palcát s břity
    palcat(ctx, c) {
      rr(ctx, -1.8, -8, 3.6, 40, 1.4); fs(ctx, c.grip, 1.4);
      glowOn(ctx, c);
      ctx.beginPath(); ctx.ellipse(0, 37, 4.6, 6.4, 0, 0, TAU); fs(ctx, bladeFill(ctx, c, -5, 5), 1.6);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 2.4, 37 + Math.sin(a) * 2.4); ctx.lineTo(Math.cos(a) * 7, 37 + Math.sin(a) * 7.6); ctx.lineWidth = 2.6; ctx.strokeStyle = c.dark; ctx.stroke(); }
      glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(0, 43); ctx.lineTo(0, 46); ctx.lineWidth = 2; ctx.strokeStyle = c.dark; ctx.stroke();
    }
  };

  /* ------------ HROTY NA KOPÍ (násada podél +x, hrot od x = 46) ------------ */
  const POLE = {
    kopi(ctx, c) {
      glowOn(ctx, c); ctx.beginPath(); ctx.moveTo(45, -4.4); ctx.quadraticCurveTo(56, -4, 64, 0); ctx.quadraticCurveTo(56, 4, 45, 4.4); ctx.closePath(); fs(ctx, bladeFill(ctx, c, 45, 64), 1.5); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(60, 0); ctx.lineWidth = 0.9; ctx.strokeStyle = c.dark; ctx.stroke();
      rr(ctx, 41, -2.6, 5, 5.2, 1); fs(ctx, c.guard, 1);
    },
    trojzubec(ctx, c) {
      glowOn(ctx, c);
      rr(ctx, 44, -8, 4, 16, 1.4); fs(ctx, c.blade, 1.4);
      for (const y of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(47, y - 1.6); ctx.lineTo(y ? 59 : 64, y - 1.2); ctx.lineTo(y ? 63 : 68, y); ctx.lineTo(y ? 59 : 64, y + 1.2); ctx.lineTo(47, y + 1.6); ctx.closePath(); fs(ctx, bladeFill(ctx, c, 47, 66), 1.3); }
      ctx.beginPath(); ctx.moveTo(57, -8.4); ctx.lineTo(60, -11); ctx.lineTo(59, -7); ctx.closePath(); fs(ctx, c.blade, 1); ctx.beginPath(); ctx.moveTo(57, 8.4); ctx.lineTo(60, 11); ctx.lineTo(59, 7); ctx.closePath(); fs(ctx, c.blade, 1);
      glowOff(ctx);
      rr(ctx, 40, -3, 5, 6, 1); fs(ctx, c.guard, 1);
    },
    halapartna(ctx, c) {
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(44, -2); ctx.lineTo(70, 0); ctx.lineTo(44, 2); ctx.closePath(); fs(ctx, bladeFill(ctx, c, 44, 70), 1.3);
      ctx.beginPath(); ctx.moveTo(46, 1.5); ctx.quadraticCurveTo(50, 14, 58, 15); ctx.quadraticCurveTo(57, 6, 56, 1.5); ctx.closePath(); fs(ctx, bladeFill(ctx, c, 46, 58), 1.5);
      ctx.beginPath(); ctx.moveTo(48, -1.5); ctx.lineTo(44, -10); ctx.lineTo(52, -1.5); ctx.closePath(); fs(ctx, c.dark, 1.2);
      glowOff(ctx); rr(ctx, 40, -2.8, 5, 5.6, 1); fs(ctx, c.guard, 1);
    },
    glefa(ctx, c) { // glefa / naginata: dlouhá zahnutá čepel
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(45, -3); ctx.quadraticCurveTo(62, -5, 72, -12); ctx.quadraticCurveTo(68, -2, 45, 3.4); ctx.closePath(); fs(ctx, bladeFill(ctx, c, 45, 72), 1.5);
      glowOff(ctx); ctx.beginPath(); ctx.ellipse(44, 0, 2.4, 5, 0, 0, TAU); fs(ctx, c.guard, 1.2);
    },
    partyzana(ctx, c) {
      glowOn(ctx, c);
      ctx.beginPath(); ctx.moveTo(45, -3); ctx.lineTo(49, -10); ctx.lineTo(52, -4); ctx.lineTo(70, 0); ctx.lineTo(52, 4); ctx.lineTo(49, 10); ctx.lineTo(45, 3); ctx.closePath(); fs(ctx, bladeFill(ctx, c, 45, 70), 1.5);
      glowOff(ctx); ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(64, 0); ctx.lineWidth = 1; ctx.strokeStyle = c.dark; ctx.stroke();
      rr(ctx, 40, -3, 5, 6, 1); fs(ctx, c.guard, 1);
      if (c.gem) gem(ctx, 47.5, 0, 1.8, c.gem);
    },
    drak(ctx, c) { // dračí kopí: zubatý hrot a dračí hlava u násady
      glowOn(ctx, c, 12);
      ctx.beginPath(); ctx.moveTo(48, -3); ctx.lineTo(52, -7); ctx.lineTo(54, -3.4); ctx.lineTo(58, -6); ctx.lineTo(60, -2.6); ctx.lineTo(70, 0); ctx.lineTo(60, 2.6); ctx.lineTo(58, 6); ctx.lineTo(54, 3.4); ctx.lineTo(52, 7); ctx.lineTo(48, 3); ctx.closePath();
      fs(ctx, bladeFill(ctx, c, 48, 70), 1.5); glowOff(ctx);
      ctx.beginPath(); ctx.moveTo(40, -4); ctx.lineTo(49, -2); ctx.lineTo(49, 2); ctx.lineTo(40, 4); ctx.closePath(); fs(ctx, c.guard, 1.3);
      ctx.beginPath(); ctx.arc(45, -1, 0.9, 0, TAU); ctx.fillStyle = '#ff3a2a'; ctx.fill();
    },
    hvezdne(ctx, c) { POLE.partyzana(ctx, Object.assign({}, c, { blade: '#3a3f6a', dark: '#1a1c3a', edge: '#cfd8ff', gem: '#ffe28a' })); }
  };

  /* ------------ LUKY: tvar ramen ------------ */
  /* LUKY: všechny mají tvar klasického dlouhého luku – jeden plynulý oblouk,
     zesílený úchop uprostřed a ramena zužující se ke koncům. Samurajský jumi
     je největší (úchop o kousek níž) a černě lakovaný. Skiny mění barvy a ozdoby. */
  const BOW = { yumi: [46, 32], dlouhy: [34, 31], reflex: [34, 31], draci: [35, 32], elfi: [34, 31], hvezdny: [35, 32], kost: [34, 31], mesic: [34, 31] };
  A.bowSize = id => BOW[id] || [52, 50];
  function drawBowLimbs(ctx, id, c, gx, gy, big) {
    const [top, bot] = big ? BOW.yumi : (BOW[id] || [52, 50]);
    const yumi = id === 'yumi';
    const bend = (top + bot) * 0.2;                     // hloubka oblouku
    const T = [gx - bend * 0.95, gy - top], B = [gx - bend * 0.95, gy + bot];
    // bod na oblouku: k = 0 horní konec, 1 dolní konec (kvadratická křivka přes úchop)
    const cx = 2 * gx - (T[0] + B[0]) / 2 + 0.0, cy = 2 * gy - (T[1] + B[1]) / 2;
    const at = k => [(1 - k) * (1 - k) * T[0] + 2 * (1 - k) * k * cx + k * k * B[0], (1 - k) * (1 - k) * T[1] + 2 * (1 - k) * k * cy + k * k * B[1]];
    const wood = yumi && (!c.wood || c.wood === '#8a5a32') ? '#1c1a1e' : c.wood;
    // zužující se ramena: kreslí se po kouscích s měnící se tloušťkou
    const N = 26;
    glowOn(ctx, c, 10);
    for (const pass of [0, 1]) {
      for (let i = 0; i < N; i++) {
        const k0 = i / N, k1 = (i + 1) / N, km = (k0 + k1) / 2;
        const tw = 1.8 + 2.6 * Math.sin(Math.PI * km);   // tenké konce, silný střed
        const a = at(k0), b = at(k1);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineCap = 'round';
        ctx.lineWidth = pass ? tw : tw + 3; ctx.strokeStyle = pass ? wood : OUT; ctx.stroke();
      }
      if (!pass) glowOff(ctx);
    }
    // lesk dřeva
    ctx.beginPath(); for (let i = 2; i <= N - 2; i++) { const p = at(i / N); i === 2 ? ctx.moveTo(p[0] - 0.8, p[1]) : ctx.lineTo(p[0] - 0.8, p[1]); }
    ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.stroke();
    // jumi: bílé ratanové omotávky
    if (yumi) for (let k = 0.08; k < 0.95; k += 0.075) { if (Math.abs(k - 0.5) < 0.08) continue; const p = at(k); ctx.beginPath(); ctx.moveTo(p[0] - 2.4, p[1]); ctx.lineTo(p[0] + 2.4, p[1]); ctx.lineWidth = 1.1; ctx.strokeStyle = '#efe6cf'; ctx.stroke(); }
    // ozdoby skinů
    if (id === 'elfi') for (const k of [0.2, 0.8]) { const p = at(k); ctx.beginPath(); ctx.ellipse(p[0] - 3, p[1], 4, 1.6, k < 0.5 ? 0.6 : -0.6, 0, TAU); fs(ctx, '#9be07a', 0.8); }
    if (id === 'draci') for (const k of [0.15, 0.3, 0.7, 0.85]) { const p = at(k); ctx.beginPath(); ctx.moveTo(p[0], p[1] - 2); ctx.lineTo(p[0] - 6, p[1]); ctx.lineTo(p[0], p[1] + 2); ctx.closePath(); fs(ctx, c.blade, 0.9); }
    if (A.bowDecor && A.bowDecor[id]) A.bowDecor[id](ctx, at, c, T, B, gem);
    if (id === 'hvezdny' || id === 'mesic') for (const k of [0.3, 0.7]) { const p = at(k); gem(ctx, p[0], p[1], 1.9, c.gem || '#bfd0ff'); }
    if (id === 'kost') for (const k of [0.15, 0.3, 0.7, 0.85]) { const p = at(k); ctx.beginPath(); ctx.arc(p[0], p[1], 2, 0, TAU); fs(ctx, '#efe6cf', 0.8); }
    // konce ramen (rohové špičky) a kožený úchop
    for (const p of [T, B]) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, TAU); fs(ctx, yumi ? '#d9b04a' : '#e8dcc0', 1); }
    const g = at(0.5);
    rr(ctx, g[0] - 2.8, g[1] - 5.5, 5.6, 11, 2); fs(ctx, yumi ? '#a8262a' : '#5a3a1e', 1.3);
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.8; for (let y = g[1] - 4; y < g[1] + 5; y += 2.4) { ctx.beginPath(); ctx.moveTo(g[0] - 3.2, y); ctx.lineTo(g[0] + 3.2, y + 1.2); ctx.stroke(); }
    return [T, B];
  }

  /* ------------ PRVKY ZBROJE ------------ */
  function cape(ctx, F, pal, t, moving, w) {
    const flow = moving ? Math.sin(w * 0.9) * 3 : Math.sin(t * 2) * 1.2;
    const col = F.capeColor || pal.cape;
    if (F.cape === 'royal' || F.cape === 'ermine') {
      ctx.beginPath(); ctx.moveTo(-9, -54); ctx.quadraticCurveTo(-24 - flow, -30, -27 - flow * 1.6, -3); ctx.lineTo(-6 - flow, -2); ctx.quadraticCurveTo(-4, -30, 6, -54); ctx.closePath();
      const g = ctx.createLinearGradient(0, -54, 0, -2); g.addColorStop(0, shade(col, 0.15)); g.addColorStop(1, shade(col, -0.35));
      fs(ctx, g, 2);
      // zlatý lem a vzor
      ctx.beginPath(); ctx.moveTo(-27 - flow * 1.6, -3); ctx.lineTo(-6 - flow, -2); ctx.lineWidth = 3; ctx.strokeStyle = F.trim || pal.trim; ctx.stroke();
      ctx.fillStyle = F.trim || pal.trim;
      for (const [x, y] of [[-14, -30], [-18, -18], [-11, -12]]) { ctx.beginPath(); ctx.moveTo(x - flow * 0.6, y - 2.4); ctx.lineTo(x + 1.6 - flow * 0.6, y); ctx.lineTo(x - flow * 0.6, y + 2.4); ctx.lineTo(x - 1.6 - flow * 0.6, y); ctx.closePath(); ctx.fill(); }
      if (F.cape === 'ermine') { // hermelínová podšívka na okraji
        ctx.beginPath(); ctx.moveTo(-6 - flow, -2); ctx.quadraticCurveTo(-4, -30, 6, -54); ctx.lineWidth = 4.5; ctx.strokeStyle = '#fbf8f0'; ctx.stroke();
        ctx.fillStyle = '#121214'; for (const [x, y] of [[-4.6, -14], [-3, -30], [1, -45]]) { ctx.beginPath(); ctx.moveTo(x, y - 1.6); ctx.lineTo(x + 0.9, y + 1.4); ctx.lineTo(x - 0.9, y + 1.4); ctx.closePath(); ctx.fill(); }
      }
    } else if (F.cape === 'tattered') {
      ctx.beginPath(); ctx.moveTo(-7, -53); ctx.quadraticCurveTo(-20 - flow, -30, -22 - flow * 1.4, -12);
      for (let i = 0; i < 5; i++) ctx.lineTo(-22 + i * 3.6 - flow * 1.2, -12 + (i % 2 ? -5 : 2));
      ctx.quadraticCurveTo(-5, -30, 3, -52); ctx.closePath(); fs(ctx, col, 1.8);
    } else if (F.cape === 'short') {
      ctx.beginPath(); ctx.moveTo(-8, -54); ctx.quadraticCurveTo(-17 - flow, -42, -16 - flow, -30); ctx.lineTo(-4, -32); ctx.quadraticCurveTo(-3, -44, 5, -53); ctx.closePath(); fs(ctx, col, 1.8);
    } else if (F.cape === 'pelt') { // vlčí kožešina přes záda
      ctx.beginPath(); ctx.moveTo(-8, -56); ctx.quadraticCurveTo(-20 - flow, -40, -18 - flow, -22); ctx.lineTo(-13 - flow, -26); ctx.lineTo(-9 - flow, -20); ctx.quadraticCurveTo(-4, -40, 5, -55); ctx.closePath();
      fs(ctx, F.furColor || '#8a8e96', 1.8);
    }
  }
  function aura(ctx, F, t) {
    if (!F.aura) return;
    ctx.save();
    if (F.aura === 'holy') {
      const g = ctx.createRadialGradient(0, -40, 4, 0, -40, 46); g.addColorStop(0, 'rgba(255,240,170,.35)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g; ctx.fillRect(-46, -90, 92, 92);
      ctx.beginPath(); ctx.ellipse(0, -86, 9, 2.6, 0, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,230,140,.9)'; ctx.stroke();
    } else if (F.aura === 'flame') {
      for (let i = 0; i < 6; i++) { const x = -14 + i * 5.6, h = 10 + Math.abs(Math.sin(t * 7 + i * 1.3)) * 10; ctx.beginPath(); ctx.moveTo(x - 3, 0); ctx.quadraticCurveTo(x, -h * 1.2, x + 3, 0); ctx.fillStyle = i % 2 ? 'rgba(255,140,40,.75)' : 'rgba(255,210,90,.75)'; ctx.fill(); }
    } else if (F.aura === 'frost') {
      ctx.strokeStyle = 'rgba(210,240,255,.85)'; ctx.lineWidth = 1.1;
      for (let i = 0; i < 5; i++) { const a = t * 1.4 + i * 1.26, x = Math.cos(a) * 20, y = -40 + Math.sin(a * 1.3) * 26; for (let k = 0; k < 3; k++) { const b = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(b) * 3, y - Math.sin(b) * 3); ctx.lineTo(x + Math.cos(b) * 3, y + Math.sin(b) * 3); ctx.stroke(); } }
    } else if (F.aura === 'shadow') {
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(Math.sin(t * 1.5 + i) * 10, -6 - i * 8, 14 - i, 5, 0, 0, TAU); ctx.fillStyle = 'rgba(30,10,40,.22)'; ctx.fill(); }
    } else if (F.aura === 'petals') {
      for (let i = 0; i < 6; i++) { const a = t * 0.9 + i, x = Math.sin(a * 1.7) * 22, y = -70 + ((t * 20 + i * 15) % 70); ctx.beginPath(); ctx.ellipse(x, y, 2.4, 1.3, a, 0, TAU); ctx.fillStyle = 'rgba(255,190,215,.9)'; ctx.fill(); }
    } else if (F.aura === 'storm') {
      ctx.strokeStyle = 'rgba(255,245,150,.9)'; ctx.lineWidth = 1.4;
      if (Math.sin(t * 9) > 0.6) { ctx.beginPath(); ctx.moveTo(-16, -70); ctx.lineTo(-10, -58); ctx.lineTo(-14, -56); ctx.lineTo(-8, -44); ctx.stroke(); }
      if (Math.sin(t * 7 + 2) > 0.6) { ctx.beginPath(); ctx.moveTo(18, -66); ctx.lineTo(13, -55); ctx.lineTo(17, -53); ctx.lineTo(11, -42); ctx.stroke(); }
    } else if (F.aura === 'aurora') {
      const g = ctx.createLinearGradient(-30, -90, 30, -20); g.addColorStop(0, 'rgba(120,255,200,0)'); g.addColorStop(0.5, 'rgba(120,255,200,.22)'); g.addColorStop(1, 'rgba(160,120,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -48, 30, 44, Math.sin(t) * 0.2, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  function chest(ctx, F, pal) {
    if (!F.chest) return;
    const col = F.emblemColor || pal.trim, x = 0.5, y = -44;
    ctx.save();
    if (F.chest === 'lion') {
      ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; const r = k % 2 ? 4.6 : 6.2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); fs(ctx, col, 1.2);
      ctx.beginPath(); ctx.arc(x, y, 3.1, 0, TAU); fs(ctx, shade(col, 0.2), 0.9);
      ctx.fillStyle = OUT; ctx.fillRect(x - 1.6, y - 1, 0.9, 0.9); ctx.fillRect(x + 0.7, y - 1, 0.9, 0.9);
    } else if (F.chest === 'sun') {
      ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; const r = k % 2 ? 3.4 : 6.4; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); fs(ctx, col, 1);
    } else if (F.chest === 'skull') {
      ctx.beginPath(); ctx.arc(x, y - 1, 4, 0, TAU); fs(ctx, '#efe6cf', 1); ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x - 1.5, y - 1.2, 1, 0, TAU); ctx.arc(x + 1.5, y - 1.2, 1, 0, TAU); ctx.fill();
    } else if (F.chest === 'moon') {
      ctx.beginPath(); ctx.arc(x, y, 5, 0.6, TAU - 0.6); ctx.arc(x + 2.4, y, 3.8, TAU - 0.9, 0.9, true); ctx.closePath(); fs(ctx, col, 1);
    } else if (F.chest === 'cross') {
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.moveTo(x - 4.4, y - 2); ctx.lineTo(x + 4.4, y - 2); ctx.lineWidth = 4.2; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = col; ctx.stroke();
    } else if (F.chest === 'mon') { // japonský erb
      ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); fs(ctx, col, 1); ctx.beginPath(); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU - Math.PI / 2; ctx.moveTo(x, y); ctx.arc(x, y, 3.6, a, a + 1.2); } ctx.fillStyle = shade(col, -0.45); ctx.fill();
    } else if (F.chest === 'rune') {
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(x - 2.5, y - 5); ctx.lineTo(x - 2.5, y + 5); ctx.moveTo(x - 2.5, y - 4); ctx.lineTo(x + 2.5, y - 1); ctx.lineTo(x - 2.5, y + 2); ctx.lineWidth = 1.8; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
    } else if (F.chest === 'star') {
      ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2; const r = k % 2 ? 2.6 : 6; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); fs(ctx, col, 1);
    } else if (F.chest === 'dragon') {
      ctx.beginPath(); ctx.moveTo(x - 5, y + 4); ctx.quadraticCurveTo(x - 4, y - 6, x + 3, y - 5); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x + 2, y - 2); ctx.quadraticCurveTo(x - 1, y + 1, x + 3, y + 5); ctx.closePath(); fs(ctx, col, 1);
    }
    ctx.restore();
  }
  function collar(ctx, F) {
    if (!F.collar) return;
    if (F.collar === 'ermine' || F.collar === 'fur' || F.collar === 'wolf') {
      const c = F.collar === 'ermine' ? '#fbf8f0' : (F.furColor || (F.collar === 'wolf' ? '#9aa0aa' : '#8a6a4a'));
      ctx.beginPath(); ctx.moveTo(-11, -52); ctx.quadraticCurveTo(-6, -60, 1, -58); ctx.quadraticCurveTo(9, -60, 12, -52); ctx.quadraticCurveTo(1, -47, -11, -52); ctx.closePath(); fs(ctx, c, 1.6);
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 0.8; for (let k = -8; k < 10; k += 3) { ctx.beginPath(); ctx.moveTo(k, -56); ctx.lineTo(k + 1, -52); ctx.stroke(); }
      if (F.collar === 'ermine') { ctx.fillStyle = '#121214'; for (const xx of [-7, -2, 4, 9]) { ctx.beginPath(); ctx.moveTo(xx, -55.5); ctx.lineTo(xx + 0.9, -52.6); ctx.lineTo(xx - 0.9, -52.6); ctx.closePath(); ctx.fill(); } }
      if (F.collar === 'wolf') { // vlčí hlava na rameni
        ctx.beginPath(); ctx.moveTo(-14, -56); ctx.lineTo(-10, -64); ctx.lineTo(-7, -58); ctx.lineTo(-3, -63); ctx.lineTo(-2, -55); ctx.closePath(); fs(ctx, c, 1.3);
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(-8, -58.5, 0.9, 0, TAU); ctx.fill();
      }
    } else if (F.collar === 'chain') {
      ctx.beginPath(); ctx.moveTo(-8, -54); ctx.quadraticCurveTo(1, -44, 10, -54); ctx.lineWidth = 2.2; ctx.strokeStyle = '#ffd77a'; ctx.stroke();
      ctx.beginPath(); ctx.arc(1, -47, 2.2, 0, TAU); fs(ctx, '#ffd77a', 1);
    }
  }
  function pauldron(ctx, F, pal) {
    if (!F.pauldron) return;
    const m = F.pauldronColor || pal.metal, tr = F.trim || pal.trim;
    ctx.save(); ctx.translate(-1, -50.5);
    if (F.pauldron === 'samurai') { // sode: pásy pancíře
      for (let k = 0; k < 3; k++) { rr(ctx, -6, -2 + k * 4.2, 13, 4.6, 1.2); fs(ctx, k % 2 ? shade(m, -0.15) : m, 1.2); }
      ctx.beginPath(); ctx.moveTo(-6, 10.5); ctx.lineTo(7, 10.5); ctx.lineWidth = 1.6; ctx.strokeStyle = tr; ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(-8, -6, 8, 6); g.addColorStop(0, shade(m, 0.4)); g.addColorStop(1, shade(m, -0.3));
      ctx.beginPath(); ctx.ellipse(0, 0, 7.6, 6, -0.2, Math.PI * 0.95, TAU + 0.15); ctx.closePath(); fs(ctx, g, 1.6);
      ctx.beginPath(); ctx.ellipse(0, 2, 8, 4.4, -0.2, Math.PI * 0.95, TAU + 0.15); ctx.lineWidth = 1.6; ctx.strokeStyle = tr; ctx.stroke();
      if (F.pauldron === 'spiky') for (const [x, y] of [[-5, -4], [0, -6.5], [5, -5]]) { ctx.beginPath(); ctx.moveTo(x - 2, y + 1.5); ctx.lineTo(x + 0.5, y - 6); ctx.lineTo(x + 2.4, y + 1.6); ctx.closePath(); fs(ctx, F.spikeColor || shade(m, -0.3), 1.1); }
      if (F.pauldron === 'gold') { gem(ctx, 0, -1.6, 1.5, F.gem || '#d6243a'); ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, -0.2, Math.PI, TAU); ctx.lineWidth = 1; ctx.strokeStyle = shade(tr, 0.3); ctx.stroke(); }
      if (F.pauldron === 'fur') { ctx.beginPath(); ctx.ellipse(0, 1, 10, 6.5, -0.2, Math.PI * 0.9, TAU + 0.2); ctx.lineWidth = 3; ctx.strokeStyle = F.furColor || '#8a6a4a'; ctx.stroke(); }
    }
    ctx.restore();
  }
  function crest(ctx, F, pal, t, L) {
    if (!F.crest) return;
    const top = L.helmet === 'great' ? -74 : L.helmet === 'kabuto' ? -73 : -72;
    const sway = Math.sin(t * 4) * 1.4;
    ctx.save();
    if (F.crest === 'plume' || F.crest === 'royalplume') {
      for (const [w, col] of [[9, OUT], [6, F.plumeColor || pal.plume]]) { ctx.beginPath(); ctx.moveTo(1, top); ctx.bezierCurveTo(-2, top - 14, -14 + sway, top - 16, -22 + sway, top - 2); ctx.lineCap = 'round'; ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); }
      if (F.crest === 'royalplume') { ctx.beginPath(); ctx.moveTo(1, top - 1); ctx.bezierCurveTo(0, top - 10, -8 + sway, top - 13, -14 + sway, top - 6); ctx.lineWidth = 2.4; ctx.strokeStyle = '#ffd77a'; ctx.stroke(); }
      rr(ctx, -2, top - 3, 6, 4, 1); fs(ctx, F.trim || pal.trim, 1);
    } else if (F.crest === 'wings') {
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(1 + d * 4, top + 6); ctx.quadraticCurveTo(1 + d * 14, top - 6, 1 + d * 12, top - 12); ctx.quadraticCurveTo(1 + d * 8, top - 2, 1 + d * 2, top + 4); ctx.closePath(); fs(ctx, F.wingColor || '#ffffff', 1.4); }
    } else if (F.crest === 'mohawk') {
      ctx.beginPath(); ctx.moveTo(-8, top + 4); for (let k = 0; k < 7; k++) ctx.lineTo(-8 + k * 2.6, top - 5 - (k % 2 ? 2 : 0)); ctx.lineTo(9, top + 4); ctx.closePath(); fs(ctx, F.plumeColor || '#d6243a', 1.4);
    } else if (F.crest === 'kuwagata') { // zlaté rohy samurajského generála
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(1 + d * 2, top + 4); ctx.quadraticCurveTo(1 + d * 4, top - 8, 1 + d * 10, top - 16); ctx.lineTo(1 + d * 11.5, top - 14.5); ctx.quadraticCurveTo(1 + d * 6.5, top - 6, 1 + d * 4.4, top + 4); ctx.closePath(); fs(ctx, F.trim || '#e8b84a', 1.3); }
      ctx.beginPath(); ctx.arc(1, top + 2, 2.6, 0, TAU); fs(ctx, '#d6243a', 1);
    } else if (F.crest === 'dragon') {
      ctx.beginPath(); ctx.moveTo(-6, top + 3); ctx.quadraticCurveTo(-2, top - 10, 8, top - 8); ctx.lineTo(12, top - 4); ctx.lineTo(7, top - 3); ctx.quadraticCurveTo(2, top - 2, 6, top + 4); ctx.closePath(); fs(ctx, F.trim || '#e8b84a', 1.3);
      ctx.beginPath(); ctx.arc(8, top - 6.5, 0.8, 0, TAU); ctx.fillStyle = '#d6243a'; ctx.fill();
    } else if (F.crest === 'antlers') {
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(1 + d * 4, top + 4); ctx.lineTo(1 + d * 9, top - 10); ctx.moveTo(1 + d * 7, top - 4); ctx.lineTo(1 + d * 13, top - 7); ctx.moveTo(1 + d * 8, top - 8); ctx.lineTo(1 + d * 5, top - 14); ctx.lineCap = 'round'; ctx.lineWidth = 3.6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#d8c39a'; ctx.stroke(); }
    } else if (F.crest === 'feather') {
      ctx.beginPath(); ctx.moveTo(-3, top + 2); ctx.quadraticCurveTo(-10, top - 8, -6, top - 18); ctx.quadraticCurveTo(-2, top - 8, -1, top + 2); ctx.closePath(); fs(ctx, F.plumeColor || '#2a8a4a', 1.2);
    }
    ctx.restore();
  }
  /* layer: 'back' (aura a plášť za tělem), 'chest' (límec a znak na hrudi), 'top' (nárameník a chochol) */
  function drawFeatures(ctx, L, pal, st, layer, moving, w) {
    const F = pal.feat; if (!F) return;
    const t = st.t || 0;
    if (layer === 'back') { aura(ctx, F, t); cape(ctx, F, pal, t, moving, w); }
    else if (layer === 'chest') { chest(ctx, F, pal); collar(ctx, F); }
    else if (layer === 'top') { pauldron(ctx, F, pal); crest(ctx, F, pal, t, L); }
  }

  /* výchozí model podle zbraně jednotky (meče teď vypadají jako opravdové meče) */
  const DEFAULT = { sword: 'mec', longsword: 'dlouhy' };
  /* sekery, kladiva a palcáty se drží hlavicí NAHORU (ne obráceně jako meč) */
  const HEADED = { sekera: 1, kladivo: 1, palcat: 1 };
  const FLIP = { katana: 1, savle: 1 };
  /* zbraně se kreslí výrazně větší a širší, aby byly v bitvě jasně vidět */
  function drawMelee(ctx, id, pal, M, icon) { ctx.save(); if (HEADED[id] && !icon) { ctx.rotate(MELEE.HEAD_ROT); ctx.translate(0, 4); } ctx.scale(FLIP[id] ? -1.0 : 1.0, 0.92); (MELEE[id === 'dvojsekera' ? 'sekera' : id] || MELEE.mec)(ctx, colors(pal, M)); ctx.restore(); }
  function drawPole(ctx, id, pal, M) { ctx.save(); ctx.translate(44, 0); ctx.scale(0.95, 1.05); ctx.translate(-44, 0); (POLE[id] || POLE.kopi)(ctx, colors(pal, M)); ctx.restore(); }

  Object.assign(A, { weaponCat, drawMelee, drawPole, drawBowLimbs, drawFeatures, weaponColors: colors, defaultMeleeModel: w => DEFAULT[w] || null,
    MELEE_REF: MELEE, POLE_REF: POLE, BOW_REF: BOW, HEADED_REF: HEADED, FLIP_REF: FLIP, bladeFill, glowOn, glowOff, gemDot: gem, hiltDraw: hilt, meleeModels: Object.keys(MELEE).filter(k => k !== 'AXE_SIDE' && k !== 'HEAD_ROT'), poleModels: Object.keys(POLE) });
})();

/* =========================================================================
   MÁGOVÉ: hůl s magickou koulí a klobouky (čarodějný klobouk, eboši, kápě völvy)
   ========================================================================= */
(function () {
  const A = window.Art, P = window.ArtParts, TAU = Math.PI * 2, OUT = A.OUT;
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  P.weapon.staff = (ctx, L, pal, atk, w, moving) => {
    const mc = L.magic || '#7fc8ff';
    const raise = atk >= 0 ? Math.sin(Math.min(1, atk / 0.6) * Math.PI * 0.5) : 0;
    const back = atk >= 0.6 ? (atk - 0.6) / 0.4 : 0;
    const hx = 12 + raise * 6 - back * 6, hy = -46 - raise * 8 + back * 8;
    // hůl
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.12 - raise * 0.5 + back * 0.5);
    ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(0, -30); ctx.lineCap = 'round'; ctx.lineWidth = 5.4; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = L.staffWood || '#7a4c2a'; ctx.stroke();
    // hlavice hole: podle skinu (krystal, lebka, had, strom, slunce, měsíc) nebo vidlice s koulí
    const SM = pal.wmodel && pal.wmodel.cat === 'staff' ? pal.wmodel : null;
    A.staffHead(ctx, SM ? SM.id : 'koule', -35, (SM && SM.glow) || mc, pal.trim, raise, SM);
    ctx.restore();
    // paže
    A.limb(ctx, 1, -50, hx - 1, hy + 2, 5.2, pal.tunic);
    A.fist(ctx, hx, hy + 2, pal.skin, 0);
  };
  // čarodějný klobouk
  P.helmet.wizard = (ctx, L, pal) => {
    const c = pal.hat || pal.tunic;
    ctx.beginPath(); ctx.ellipse(1, -68, 15, 3.6, -0.08, 0, TAU); fs(ctx, A.shade(c, -0.15), 1.6);
    ctx.beginPath(); ctx.moveTo(-8, -69); ctx.quadraticCurveTo(-6, -84, -12, -96); ctx.quadraticCurveTo(2, -88, 10, -69); ctx.closePath(); fs(ctx, c, 1.8);
    ctx.beginPath(); ctx.moveTo(-7.5, -71.5); ctx.quadraticCurveTo(1, -73.5, 9.5, -71.5); ctx.lineWidth = 2.4; ctx.strokeStyle = pal.trim; ctx.stroke();
    ctx.fillStyle = pal.trim;
    for (const [x, y] of [[-3, -80], [2, -76]]) { ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 0.9 : 2.2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
  };
  // eboši: vysoký černý klobouk dvorního mága
  P.helmet.eboshi = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-7, -69); ctx.quadraticCurveTo(-9, -82, -4, -90); ctx.quadraticCurveTo(4, -92, 8, -86); ctx.quadraticCurveTo(9, -76, 8, -69); ctx.closePath(); fs(ctx, '#1a1618', 1.6);
    ctx.beginPath(); ctx.moveTo(-7, -71); ctx.lineTo(8, -71); ctx.lineWidth = 2; ctx.strokeStyle = pal.trim; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6.5, -60); ctx.lineTo(-7, -69); ctx.lineWidth = 1; ctx.strokeStyle = OUT; ctx.stroke();
  };
  // kápě völvy s kožešinou a havraními pery
  P.helmet.seidhood = (ctx, L, pal) => {
    const c = pal.hood || pal.tunic;
    ctx.beginPath(); ctx.arc(1.2, -63, 11.4, -0.35, 2.1, true); ctx.lineTo(-12, -50); ctx.lineTo(-3, -51.5); ctx.quadraticCurveTo(-2, -63, 9.6, -69.8); ctx.closePath(); fs(ctx, c, 1.8);
    ctx.beginPath(); ctx.arc(1.2, -63, 11.6, -1.1, -2.6, true); ctx.lineWidth = 4; ctx.strokeStyle = '#d8d2c4'; ctx.stroke();
    for (const [x, a] of [[-7, -0.9], [-4, -0.6]]) { ctx.save(); ctx.translate(x, -73); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -5, 1.8, 6, 0, 0, TAU); fs(ctx, '#1a1a22', 1); ctx.restore(); }
  };
})();
/* róba mága: dlouhá suknice až k zemi a halena se zlatým lemem */
(function () {
  const A = window.Art, P = window.ArtParts;
  const fs = (ctx, f, lw) => A.fs(ctx, f, lw);
  P.skirt = P.skirt || {}; P.torso = P.torso || {};
  P.skirt.robe = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(15, -6); ctx.quadraticCurveTo(1, -3, -14, -6); ctx.closePath();
    const g = ctx.createLinearGradient(-14, 0, 15, 0); g.addColorStop(0, A.shade(pal.robe || pal.tunic, 0.1)); g.addColorStop(1, A.shade(pal.robe || pal.tunic, -0.3));
    fs(ctx, g, 1.8);
    ctx.beginPath(); ctx.moveTo(-14, -7.5); ctx.quadraticCurveTo(1, -4.5, 15, -7.5); ctx.lineWidth = 2.4; ctx.strokeStyle = pal.trim; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, -34); ctx.lineTo(1, -5); ctx.lineWidth = 1.6; ctx.strokeStyle = pal.trim; ctx.stroke();
  };
  P.noBelt = P.noBelt || {}; P.noBelt.robe = true;
  P.torso.robe = (ctx, L, pal) => {
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-9.5, -54, 19, 22, 6) : ctx.rect(-9.5, -54, 19, 22); fs(ctx, pal.robe || pal.tunic, 1.8);
    ctx.beginPath(); ctx.moveTo(-6, -54); ctx.lineTo(1, -44); ctx.lineTo(8, -54); ctx.lineWidth = 2.2; ctx.strokeStyle = pal.trim; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, -36); ctx.lineTo(10, -36); ctx.lineWidth = 3; ctx.strokeStyle = pal.sash || pal.trim; ctx.stroke();
  };
})();

/* =========================================================================
   OBCHOD: obrázek samotné zbraně (bez postavy) a zbroj na dřevěné figuríně
   ========================================================================= */
(function () {
  const A = window.Art, TAU = Math.PI * 2;
  const DEF = { sword: 'mec', longsword: 'dlouhy', katana: 'katana', katana2: 'katana', axe: 'sekera', daneaxe: 'sekera', flamesword: 'plamen',
    spear: 'kopi', yari: 'kopi', trident: 'trojzubec', bow: 'dlouhy', yumi: 'yumi' };
  function prep(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || cv.width, h = cv.clientHeight || cv.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }
  /* unitId = komu zbraň patří (podle toho druh zbraně), pal.wmodel = konkrétní model */
  function renderWeaponIcon(cv, unitId, pal) {
    const { ctx, w, h } = prep(cv);
    const def = GameData.units[unitId], L = def.look;
    const cat = A.weaponCat(L.weapon) || (L.weapon === 'staff' ? 'staff' : 'melee');
    const M = pal.wmodel && (pal.wmodel.cat === cat) ? pal.wmodel : null;
    const id = (M && M.id) || (cat === 'melee' ? (L.meleeModel || DEF[L.weapon] || 'mec') : DEF[L.weapon]) || 'kopi';
    // jemná záře za zbraní
    const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, Math.max(w, h) * 0.6);
    g.addColorStop(0, (M && M.glow) || pal.glow ? 'rgba(255,240,200,.18)' : 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save();
    if (cat === 'melee') {
      const s = Math.min(w, h) / 92;
      ctx.translate(w * 0.3, h * 0.76); ctx.scale(s, s); ctx.rotate(-Math.PI * 0.75);
      A.drawMelee(ctx, id, pal, M, true);
    } else if (cat === 'pole') {
      const s = w / 130;
      ctx.translate(w * 0.14, h * 0.82); ctx.scale(s, s); ctx.rotate(-0.62);
      A.limb(ctx, -10, 0, 46, 0, 3.6, (M && M.wood) || pal.wood);
      A.drawPole(ctx, id, pal, M);
    } else if (cat === 'bow') {
      const c = A.weaponColors(pal, M);
      const BB = L.weapon === 'yumi' ? A.bowSize('yumi') : A.bowSize(id), tall = BB[0] + BB[1] + 14, s = h / tall;
      ctx.translate(w * 0.56, (BB[0] + 7) * s); ctx.scale(s, s);
      const tips = A.drawBowLimbs(ctx, id, c, 0, 0, L.weapon === 'yumi');
      ctx.beginPath(); ctx.moveTo(tips[0][0], tips[0][1]); ctx.lineTo(tips[1][0], tips[1][1]); ctx.lineWidth = 1.3; ctx.strokeStyle = c.string; ctx.stroke();
      // šíp přes luk
      ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(16, 0); ctx.lineWidth = 3.6; ctx.strokeStyle = A.OUT; ctx.stroke(); ctx.lineWidth = 1.8; ctx.strokeStyle = (M && M.arrow) || '#d8c39a'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(16, -3.4); ctx.lineTo(23, 0); ctx.lineTo(16, 3.4); ctx.closePath(); A.fs(ctx, (M && M.tip) || '#c9ced6', 1.1);
    } else { // hůl mága
      const s = h / 128, mc = L.magic || '#7fc8ff';
      ctx.translate(w / 2 - 6 * s, h * 0.95); ctx.scale(s, s); ctx.rotate(0.25);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -78); ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = A.OUT; ctx.stroke(); ctx.lineWidth = 3.4; ctx.strokeStyle = L.staffWood || '#7a4c2a'; ctx.stroke();
      ctx.save(); ctx.translate(0, -84); ctx.scale(1.5, 1.5);
      A.staffHead(ctx, M ? M.id : 'koule', 0, (M && M.glow) || pal.glow || mc, pal.trim || '#e8b84a', 0.4, M);
      ctx.restore();
    }
    ctx.restore();
  }
  /* zbroj na dřevěné figuríně: postava bez obličeje a bez zbraně */
  function renderArmorIcon(cv, unitId, def, pal) {
    const { ctx, w, h } = prep(cv);
    const wood = '#b08a5a';
    const p = Object.assign({}, pal, { skin: wood, eyes: wood, iris: wood, hair: '#8a6a40', lace: pal.lace });
    const s = Math.min(w / 78, h / 104);
    // podstavec
    ctx.save(); ctx.translate(w / 2, h - 6);
    ctx.beginPath(); ctx.ellipse(0, 0, 26 * s, 5 * s, 0, 0, TAU); A.fs(ctx, '#5a3a1e', 1.6);
    ctx.restore();
    ctx.save(); ctx.translate(w / 2 - 2 * s, h - 8); ctx.scale(s, s);
    A.drawUnit(ctx, Object.assign({}, def, { look: Object.assign({}, def.look, { mount: null, sashimono: false }) }), Object.assign(p, { mount: null }), { x: 0, y: 0, facing: 1, t: 0.3, noShadow: true, noWeapon: true, mannequin: true });
    ctx.restore();
  }
  Object.assign(A, { renderWeaponIcon, renderArmorIcon });
})();
