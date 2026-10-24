/* =========================================================================
   GRAFIKA NÁRODŮ – samurajové a vikingové
   ArtParts  = díly postav (helmy, zbroje, zbraně, štíty, věci na zádech)
   ArtThemes = hrady, bojiště a mapy příběhu podle národa
   Vše kreslené vektorově, stejně jako zbytek hry.
   ========================================================================= */
(function () {
  const { OUT, shade, fs, rr, limb, ease, lerp, rng, fist } = Art;
  const TAU = Math.PI * 2;

  /* =======================================================================
     DÍLY POSTAV
     ======================================================================= */
  const P = { skirt: {}, torso: {}, helmet: {}, weapon: {}, shield: {}, noBelt: {} };

  /* ---------- praporek sašimono na zádech (samurajové) ---------- */
  P.back = (ctx, L, pal, st, moving, w, bob) => {
    if (!L.sashimono) return;
    const sway = Math.sin((st.t || 0) * 3 + (w || 0) * 0.5) * 1.5;
    ctx.save();
    ctx.translate(0, bob);
    ctx.beginPath(); ctx.moveTo(-7, -38); ctx.lineTo(-9, -104);
    ctx.lineWidth = 3.6; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 1.8; ctx.strokeStyle = '#3a2a1a'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, -102); ctx.lineTo(-24 + sway, -102); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-9, -101); ctx.lineTo(-23 + sway, -101); ctx.lineTo(-22 + sway * 1.3, -72); ctx.lineTo(-9, -72); ctx.closePath();
    fs(ctx, pal.sashi || pal.tunic, 1.6);
    // znak klanu (mon)
    ctx.beginPath(); ctx.arc(-15.5 + sway * 0.6, -88, 4.2, 0, TAU); fs(ctx, pal.mon || pal.trim, 1.1);
    ctx.beginPath(); ctx.arc(-15.5 + sway * 0.6, -88, 1.6, 0, TAU); ctx.fillStyle = pal.sashi || pal.tunic; ctx.fill();
    ctx.restore();
  };

  /* ---------- vous a cop (vikingové) ---------- */
  P.beard = (ctx, L, pal) => {
    const hc = pal.hair || '#c9a25a';
    // cop vzadu
    ctx.beginPath(); ctx.moveTo(-6, -62); ctx.quadraticCurveTo(-11, -54, -9, -46); ctx.lineTo(-6, -47); ctx.quadraticCurveTo(-8, -54, -3, -60); ctx.closePath();
    fs(ctx, shade(hc, -0.1), 1.3);
    // plnovous
    ctx.beginPath();
    ctx.moveTo(-1, -61); ctx.quadraticCurveTo(-2, -52, 3, -48); ctx.lineTo(6, -44); ctx.lineTo(8, -50);
    ctx.quadraticCurveTo(11, -55, 10.2, -60); ctx.quadraticCurveTo(6, -57, 3, -59); ctx.closePath();
    fs(ctx, hc, 1.5);
    ctx.beginPath(); ctx.moveTo(4, -56); ctx.quadraticCurveTo(7, -54.5, 9.6, -57); ctx.lineWidth = 1.6; ctx.strokeStyle = shade(hc, -0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5.5, -49); ctx.lineTo(6.5, -46); ctx.lineWidth = 1.2; ctx.strokeStyle = pal.trim; ctx.stroke();
  };

  /* ---------- SUKNĚ ---------- */
  // samurajské kusazuri – šněrované plátky
  P.skirt.do = (ctx, L, pal) => {
    for (let i = 0; i < 3; i++) {
      const x0 = -12 + i * 8.2;
      rr(ctx, x0, -35, 8, 14, 1.5); fs(ctx, pal.metal, 1.5);
      for (let r = 0; r < 3; r++) {
        ctx.beginPath(); ctx.moveTo(x0 + 0.8, -32 + r * 4); ctx.lineTo(x0 + 7.2, -32 + r * 4);
        ctx.lineWidth = 1.8; ctx.strokeStyle = pal.lace || pal.tunic; ctx.stroke();
      }
    }
  };
  P.skirt.ashi = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(12, -22); ctx.lineTo(-11.5, -22); ctx.closePath();
    fs(ctx, pal.tunic);
    ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0.5, -22); ctx.moveTo(-5.5, -35); ctx.lineTo(-6, -22); ctx.moveTo(5.5, -35); ctx.lineTo(6.2, -22);
    ctx.lineWidth = 1; ctx.strokeStyle = shade(pal.tunic, -0.35); ctx.stroke();
  };
  P.skirt.fur = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(12.5, -21); ctx.lineTo(-12, -21); ctx.closePath();
    fs(ctx, pal.tunic);
    ctx.beginPath(); ctx.moveTo(-12, -23);
    for (let i = 0; i <= 8; i++) ctx.lineTo(-12 + i * 3.1, -23 + (i % 2 ? 2.5 : 0));
    ctx.lineWidth = 2.2; ctx.strokeStyle = pal.trim; ctx.stroke();
  };
  P.skirt.bare = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-10, -35); ctx.lineTo(10, -35); ctx.lineTo(12.5, -21); ctx.lineTo(-12, -21); ctx.closePath();
    fs(ctx, pal.legs || '#5e4a36');
    // kožešinová bederní zástěra
    ctx.beginPath(); ctx.moveTo(-9, -35); ctx.lineTo(9, -35); ctx.lineTo(8, -24); ctx.lineTo(4, -20); ctx.lineTo(0, -24); ctx.lineTo(-4, -20); ctx.lineTo(-9, -25); ctx.closePath();
    fs(ctx, pal.bear || '#5a3f2a', 1.4);
  };

  /* ---------- TRUP ---------- */
  // samurajská zbroj dó – lakované plátky se šněrováním (odoši)
  P.torso.do = (ctx, L, pal) => {
    rr(ctx, -10.5, -54, 21, 22, 5);
    const g = ctx.createLinearGradient(-10, -54, 10, -32);
    g.addColorStop(0, shade(pal.metal, 0.25)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g);
    for (let yy = -50; yy <= -36; yy += 3.6) {
      ctx.beginPath(); ctx.moveTo(-9.5, yy); ctx.lineTo(9.5, yy);
      ctx.lineWidth = 2.2; ctx.strokeStyle = pal.lace || pal.tunic; ctx.stroke();
    }
    ctx.fillStyle = pal.trim;
    for (let yy = -48.2; yy <= -36; yy += 3.6) for (let xx = -7; xx <= 7; xx += 3.5) { ctx.fillRect(xx - 0.5, yy - 0.5, 1, 1); }
    rr(ctx, -7, -55.5, 14, 4, 1.5); fs(ctx, pal.metalDark, 1.3);
    // znak na hrudi
    ctx.beginPath(); ctx.arc(1.5, -45, 2.6, 0, TAU); ctx.fillStyle = pal.mon || pal.trim; ctx.fill();
  };
  P.noBelt.do = true;
  // ašigaru – jednoduchý lakovaný plát okegawa
  P.torso.ashi = (ctx, L, pal) => {
    rr(ctx, -9.5, -53, 19, 21, 5); fs(ctx, pal.tunic);
    rr(ctx, -8, -52, 16, 15, 4);
    const g = ctx.createLinearGradient(-8, -52, 8, -38);
    g.addColorStop(0, shade(pal.metal, 0.3)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.6);
    ctx.beginPath(); ctx.moveTo(-7.5, -46); ctx.lineTo(7.5, -46); ctx.moveTo(-7.5, -41.5); ctx.lineTo(7.5, -41.5);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0.5, -47.5, 2.8, 0, TAU); fs(ctx, pal.mon || pal.trim, 1);
  };
  // viking – vlněná tunika, kožešinový límec
  P.torso.fur = (ctx, L, pal) => {
    rr(ctx, -10, -53, 20, 21, 6); fs(ctx, pal.tunic);
    ctx.beginPath(); ctx.moveTo(2, -52); ctx.lineTo(-1, -40); ctx.lineWidth = 1.2; ctx.strokeStyle = shade(pal.tunic, -0.4); ctx.stroke();
    // výšivka
    ctx.beginPath(); ctx.moveTo(-9, -36.5); ctx.lineTo(9, -36.5); ctx.lineWidth = 0;
    // kožešinový límec
    ctx.beginPath(); ctx.moveTo(-11, -53);
    const pts = [[-8, -48], [-6, -52], [-3, -47], [0, -51.5], [3, -47], [6, -51.5], [9, -47.5], [11, -53]];
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(9, -57); ctx.lineTo(-9, -57); ctx.closePath();
    fs(ctx, pal.fur || '#8a6f52', 1.5);
    if (L.mail) {
      ctx.fillStyle = 'rgba(30,30,40,.35)';
      for (let yy = -44; yy < -37; yy += 3) for (let xx = -8; xx < 9; xx += 3) { ctx.beginPath(); ctx.arc(xx, yy, 0.7, 0, TAU); ctx.fill(); }
    }
  };
  // berserk – holá hruď, tetování, popruhy
  P.torso.bare = (ctx, L, pal) => {
    rr(ctx, -10.5, -54, 21, 22, 7);
    const g = ctx.createLinearGradient(-10, -54, 10, -32);
    g.addColorStop(0, shade(pal.skin, 0.12)); g.addColorStop(1, shade(pal.skin, -0.18));
    fs(ctx, g);
    ctx.lineWidth = 1; ctx.strokeStyle = shade(pal.skin, -0.35);
    ctx.beginPath(); ctx.moveTo(-6, -46); ctx.quadraticCurveTo(-1, -43, 1, -47); ctx.moveTo(8, -46); ctx.quadraticCurveTo(4, -43, 2, -47);
    ctx.moveTo(1.5, -41); ctx.lineTo(1.5, -35); ctx.moveTo(-3, -39); ctx.lineTo(6, -39);
    ctx.stroke();
    // tetování (modré runové linky)
    ctx.lineWidth = 1.3; ctx.strokeStyle = '#2f5d9a';
    ctx.beginPath(); ctx.moveTo(-8, -51); ctx.quadraticCurveTo(-5, -48, -8, -44); ctx.moveTo(-6, -50); ctx.lineTo(-4, -47);
    ctx.stroke();
    // popruh přes hruď
    ctx.beginPath(); ctx.moveTo(-9, -53); ctx.lineTo(9, -36); ctx.lineWidth = 3.4; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = pal.leather; ctx.stroke();
    // medvědí kožešina na ramenou
    ctx.beginPath(); ctx.moveTo(-12, -50); ctx.quadraticCurveTo(-6, -58, 4, -56); ctx.quadraticCurveTo(10, -55, 11, -50);
    ctx.quadraticCurveTo(4, -52, -2, -50); ctx.closePath();
    fs(ctx, pal.bear || '#5a3f2a', 1.5);
  };

  /* ---------- HELMY ---------- */
  // ašigaru – plochý kuželový klobouk džingasa
  P.helmet.jingasa = (ctx, L, pal) => {
    ctx.beginPath(); ctx.moveTo(-1, -61); ctx.lineTo(9, -56); ctx.lineWidth = 1; ctx.strokeStyle = OUT; ctx.stroke(); // podbradník
    ctx.beginPath();
    ctx.moveTo(-14, -63); ctx.quadraticCurveTo(1.8, -80, 18, -63);
    ctx.quadraticCurveTo(2, -66.5, -14, -63); ctx.closePath();
    const g = ctx.createLinearGradient(-14, -76, 18, -63);
    g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.beginPath(); ctx.arc(2, -69.5, 2.6, 0, TAU); fs(ctx, pal.mon || pal.trim, 1);
  };
  // samuraj – přilba kabuto s rohy kuwagata a maskou menpó
  P.helmet.kabuto = (ctx, L, pal) => {
    // maska menpó (spodní část obličeje)
    ctx.beginPath(); ctx.moveTo(-2, -61); ctx.lineTo(10.4, -61.5); ctx.quadraticCurveTo(10, -54, 4, -53.5); ctx.quadraticCurveTo(-1, -55, -2, -61); ctx.closePath();
    fs(ctx, pal.mask || '#9b2a22', 1.4);
    ctx.beginPath(); ctx.moveTo(5, -58); ctx.lineTo(9.5, -58); ctx.lineWidth = 1; ctx.strokeStyle = '#f2e6c9'; ctx.stroke();
    // šikoro – chránič krku z plátků
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-6 + i * 0.5, -66 + i * 4.2);
      ctx.quadraticCurveTo(-13 - i * 2, -64 + i * 4.2, -15 - i * 2.6, -59 + i * 4.2);
      ctx.lineTo(-11 - i * 2.2, -57 + i * 4.2);
      ctx.quadraticCurveTo(-8, -60 + i * 4.2, -4, -62 + i * 4.2); ctx.closePath();
      fs(ctx, i % 2 ? pal.metalDark : pal.metal, 1.4);
      ctx.beginPath(); ctx.moveTo(-6, -63.5 + i * 4.2); ctx.lineTo(-13 - i * 2.4, -59.5 + i * 4.2);
      ctx.lineWidth = 1.3; ctx.strokeStyle = pal.lace || pal.tunic; ctx.stroke();
    }
    // miska přilby
    ctx.beginPath(); ctx.arc(1.8, -64, 9.8, Math.PI * 1.02, -0.02); ctx.closePath();
    const g = ctx.createLinearGradient(-8, -74, 11, -64);
    g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,.3)';
    for (let a = -2.6; a <= -0.6; a += 0.5) { ctx.beginPath(); ctx.moveTo(1.8, -64); ctx.lineTo(1.8 + Math.cos(a) * 9.5, -64 + Math.sin(a) * 9.5); ctx.stroke(); }
    // fukigaeši – ohnuté boční klapky
    ctx.beginPath(); ctx.moveTo(8, -66); ctx.lineTo(13, -67); ctx.lineTo(12, -62); ctx.lineTo(8.5, -63); ctx.closePath(); fs(ctx, pal.lace || pal.tunic, 1.2);
    // rohy kuwagata
    ctx.beginPath();
    ctx.moveTo(4, -72); ctx.quadraticCurveTo(-2, -82, -4, -91); ctx.quadraticCurveTo(1, -84, 6, -74);
    ctx.quadraticCurveTo(12, -83, 17, -90); ctx.quadraticCurveTo(14, -80, 8, -72); ctx.closePath();
    fs(ctx, pal.crest || '#f2c94c', 1.4);
    ctx.beginPath(); ctx.arc(6, -72.5, 2.2, 0, TAU); fs(ctx, pal.crest || '#f2c94c', 1.1);
  };
  // viking – kulatá přilba s brýlovým chráničem
  P.helmet.viking = (ctx, L, pal) => {
    ctx.beginPath(); ctx.arc(1.8, -64, 9.8, Math.PI, 0); ctx.closePath();
    const g = ctx.createLinearGradient(-8, -74, 11, -64);
    g.addColorStop(0, shade(pal.metal, 0.35)); g.addColorStop(1, pal.metalDark);
    fs(ctx, g, 1.8);
    ctx.beginPath(); ctx.moveTo(1.8, -74); ctx.lineTo(1.8, -64); ctx.moveTo(-8, -64.5); ctx.lineTo(11.6, -64.5);
    ctx.lineWidth = 2.2; ctx.strokeStyle = pal.metalDark; ctx.stroke();
    // brýlový chránič
    ctx.lineWidth = 3.4; ctx.strokeStyle = OUT;
    ctx.beginPath(); ctx.arc(6.2, -62, 2.6, Math.PI * 1.1, Math.PI * 0.1); ctx.stroke();
    ctx.lineWidth = 1.8; ctx.strokeStyle = pal.metal; ctx.stroke();
    rr(ctx, 8.4, -64, 2.4, 8, 1); fs(ctx, pal.metal, 1.1);
  };
  // viking lovec – kožešinová kapuce
  P.helmet.furhood = (ctx, L, pal) => {
    const c = pal.fur || '#8a6f52';
    ctx.beginPath();
    ctx.arc(1.2, -63, 11, -0.35, 2.1, true);
    ctx.lineTo(-12, -50); ctx.lineTo(-3, -51.5);
    ctx.quadraticCurveTo(-2, -63, 9, -70);
    ctx.closePath(); fs(ctx, c, 1.8);
    // chlupatý okraj kolem obličeje
    ctx.beginPath(); ctx.moveTo(-3, -51.5);
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = (1 - t) * (1 - t) * -3 + 2 * (1 - t) * t * -2 + t * t * 9, y = (1 - t) * (1 - t) * -51.5 + 2 * (1 - t) * t * -63 + t * t * -70;
      ctx.lineTo(x + (i % 2 ? 1.6 : 0), y);
    }
    ctx.lineWidth = 2.2; ctx.strokeStyle = shade(c, 0.35); ctx.stroke();
  };
  // berserk – medvědí hlava přes přilbu
  P.helmet.bear = (ctx, L, pal) => {
    const c = pal.bear || '#5a3f2a';
    // kožešina po zádech
    ctx.beginPath(); ctx.moveTo(-6, -72); ctx.quadraticCurveTo(-16, -66, -14, -50); ctx.lineTo(-6, -52); ctx.quadraticCurveTo(-8, -62, -2, -66); ctx.closePath();
    fs(ctx, shade(c, -0.15), 1.6);
    // lebka
    ctx.beginPath(); ctx.ellipse(1, -69, 10.5, 7, -0.1, 0, TAU); fs(ctx, c, 1.8);
    // uši
    ctx.beginPath(); ctx.arc(-5, -75, 3, 0, TAU); fs(ctx, c, 1.4);
    ctx.beginPath(); ctx.arc(2, -76.5, 3, 0, TAU); fs(ctx, c, 1.4);
    // čenich dopředu
    ctx.beginPath(); ctx.moveTo(6, -73); ctx.quadraticCurveTo(15, -73, 17, -68); ctx.quadraticCurveTo(15, -64, 8, -65); ctx.closePath();
    fs(ctx, shade(c, 0.08), 1.6);
    ctx.beginPath(); ctx.arc(16, -69.5, 1.6, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
    ctx.beginPath(); ctx.arc(7.5, -71.5, 1.2, 0, TAU); ctx.fillStyle = '#e8c55a'; ctx.fill();
    // zuby
    ctx.beginPath(); ctx.moveTo(9, -65); ctx.lineTo(10, -63); ctx.lineTo(11, -65); ctx.moveTo(12.5, -65.3); ctx.lineTo(13.4, -63.4); ctx.lineTo(14.2, -65.5);
    ctx.lineWidth = 1; ctx.strokeStyle = '#f2ead6'; ctx.stroke();
  };

  /* ---------- ZBRANĚ ---------- */
  function armAngle(atk, w, moving) {
    const idle = 5.6 + (moving ? Math.sin(w) * 0.12 : 0);
    if (atk < 0) return idle;
    if (atk < 0.42) return lerp(idle, 2.55, ease(atk / 0.42));
    if (atk < 0.66) return lerp(2.55, 5.45, ease((atk - 0.42) / 0.24));
    return lerp(5.45, idle, (atk - 0.66) / 0.34);
  }
  function arm(ctx, L, pal, ang, sleeve) {
    ctx.translate(1, -50);
    ctx.rotate(ang);
    rr(ctx, -3.6, -2, 7.2, 18, 3.4); fs(ctx, sleeve, 1.8);
    fist(ctx, 0, 17, L.armor === 'bare' ? pal.skin : (L.armor === 'do' ? pal.metalDark : pal.leather), -0.55);
    ctx.translate(0, 17);
  }
  function sleeveOf(L, pal) {
    if (L.armor === 'bare') return pal.skin;
    if (L.armor === 'do') return pal.metal;
    if (L.armor === 'ashi') return shade(pal.tunic, -0.1);
    return pal.tunic;
  }
  function soDe(ctx, L, pal) {
    // ramenní plát sode (samurajové)
    if (L.armor !== 'do') return;
    ctx.save(); ctx.translate(1, -50); ctx.rotate(-0.15);
    rr(ctx, -6, -3, 11, 12, 1.5); fs(ctx, pal.metal, 1.6);
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-5, 0.5 + i * 3.4); ctx.lineTo(4, 0.5 + i * 3.4); ctx.lineWidth = 1.6; ctx.strokeStyle = pal.lace || pal.tunic; ctx.stroke(); }
    ctx.restore();
  }
  // katana – zakřivená čepel, kulatá cuba, dlouhá omotaná rukojeť
  function katana(long) {
    return (ctx, L, pal, atk, w, moving) => {
      ctx.save();
      arm(ctx, L, pal, armAngle(atk, w, moving), sleeveOf(L, pal));
      ctx.rotate(-0.55);
      const bl = long ? 40 : 30;
      if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 10; }
      ctx.beginPath();
      ctx.moveTo(-1.9, 4); ctx.quadraticCurveTo(-1.2, 4 + bl * 0.6, 3.6, 5 + bl);
      ctx.quadraticCurveTo(2.2, 4 + bl * 0.55, 1.9, 4); ctx.closePath();
      const g = ctx.createLinearGradient(-2, 0, 3, 0);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a3adbb');
      fs(ctx, pal.glow ? shade(pal.metal, 0.5) : g, 1.5);
      ctx.shadowBlur = 0;
      // hamon – linka kalení
      ctx.beginPath(); ctx.moveTo(1.2, 6); ctx.quadraticCurveTo(1.6, 4 + bl * 0.55, 3.2, 3 + bl); ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(120,130,150,.8)'; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 3, 4.4, 1.7, 0, 0, TAU); fs(ctx, '#2a2420', 1.2);
      rr(ctx, -1.8, -9, 3.6, 11, 1.2); fs(ctx, '#1f1b22', 1.2);
      ctx.fillStyle = '#f2ead6';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, -8 + i * 2.6); ctx.lineTo(1.2, -6.8 + i * 2.6); ctx.lineTo(0, -5.6 + i * 2.6); ctx.lineTo(-1.2, -6.8 + i * 2.6); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      soDe(ctx, L, pal);
    };
  }
  P.weapon.katana = katana(false);
  P.weapon.katana2 = katana(true);
  // sekera – vousatá vikingská sekera, nebo dlouhá dánská sekera
  function axe(big) {
    return (ctx, L, pal, atk, w, moving) => {
      ctx.save();
      arm(ctx, L, pal, armAngle(atk, w, moving), sleeveOf(L, pal));
      ctx.rotate(-0.55);
      const hl = big ? 44 : 26;
      if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 8; }
      limb(ctx, 0, big ? -8 : -3, 0, hl, big ? 2.8 : 2.4, pal.wood || '#8a5a32');
      // hlava sekery (ostří dopředu = ve směru úderu)
      const y0 = hl - (big ? 14 : 10);
      ctx.beginPath();
      ctx.moveTo(-1, y0); ctx.lineTo(-1, y0 + (big ? 9 : 7));
      ctx.quadraticCurveTo(big ? -11 : -8, y0 + (big ? 16 : 12), big ? -16 : -12, y0 + (big ? 13 : 10));
      ctx.quadraticCurveTo(big ? -13 : -10, y0 + 4, big ? -15 : -11, y0 - (big ? 6 : 4));
      ctx.quadraticCurveTo(big ? -8 : -6, y0 - 1, -1, y0); ctx.closePath();
      const g = ctx.createLinearGradient(-14, 0, 0, 0);
      g.addColorStop(0, '#f1f4f8'); g.addColorStop(1, '#8e97a4');
      fs(ctx, pal.glow ? shade(pal.metal, 0.5) : g, 1.6);
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(big ? -14 : -10.5, y0 - (big ? 4 : 3)); ctx.quadraticCurveTo(big ? -12 : -9, y0 + 4, big ? -14.5 : -10.8, y0 + (big ? 11 : 8.5));
      ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      rr(ctx, -1.8, y0 - 1, 3.6, big ? 11 : 8, 1); fs(ctx, pal.metalDark, 1);
      ctx.restore();
    };
  }
  P.weapon.axe = axe(false);
  P.weapon.daneaxe = axe(true);
  // jumi – vysoký asymetrický japonský luk
  P.weapon.yumi = (ctx, L, pal, atk) => {
    let pull = 0.15;
    if (atk >= 0) pull = atk < 0.6 ? ease(atk / 0.6) : 0;
    const gx = 19, gy = -46;           // úchop (níže než střed luku)
    const top = [9, -88], bot = [10, -26];
    const px = 7 - pull * 15, py = gy;
    limb(ctx, -2, -50, px, py, 5, shade(pal.tunic, -0.2));
    fist(ctx, px, py, pal.leather, 1.57);
    ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(px, py); ctx.lineTo(bot[0], bot[1]);
    ctx.lineWidth = 1.1; ctx.strokeStyle = pal.string || '#e9e4d6'; ctx.stroke();
    if (atk < 0.6) {
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 30, py);
      ctx.lineWidth = 3.4; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#d8c39a'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + 30, py - 2.6); ctx.lineTo(px + 35, py); ctx.lineTo(px + 30, py + 2.6); ctx.closePath(); fs(ctx, '#c9ced6', 1.1);
    }
    limb(ctx, 1, -50, gx - 1, gy, 5.2, sleeveOf(L, pal));
    if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 8; }
    ctx.beginPath(); ctx.moveTo(top[0], top[1]);
    ctx.quadraticCurveTo(28, -70, gx, gy);
    ctx.quadraticCurveTo(24, -34, bot[0], bot[1]);
    ctx.lineWidth = 5.4; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = pal.glow ? pal.metal : '#3a2418'; ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#c9a24a'; ctx.stroke();
    ctx.shadowBlur = 0;
    fist(ctx, gx, gy, pal.skin, 0);
  };
  // jari – rovné kopí s dlouhým hrotem a střapcem
  P.weapon.yari = (ctx, L, pal, atk, w, moving) => {
    const tx = atk >= 0 ? Math.sin(atk * Math.PI) * 18 : 0;
    const ang = atk >= 0 ? -0.02 : -0.16 + (moving ? Math.sin(w) * 0.03 : 0);
    ctx.save();
    ctx.translate(-4 + tx, -44); ctx.rotate(ang);
    if (pal.glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 8; }
    limb(ctx, -20, 0, 50, 0, 2.4, '#2a1f1a');
    ctx.beginPath(); ctx.moveTo(49, -2.4); ctx.lineTo(64, 0); ctx.lineTo(49, 2.4); ctx.closePath();
    fs(ctx, '#e9edf2', 1.4);
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(46, 1); ctx.quadraticCurveTo(44, 8, 41, 10); ctx.lineWidth = 3; ctx.strokeStyle = pal.lace || pal.tunic; ctx.stroke();
    rr(ctx, 45.5, -2.4, 4, 4.8, 1); fs(ctx, pal.trim, 1);
    ctx.restore();
    const hx = -4 + tx + 16 * Math.cos(ang), hy = -44 + 16 * Math.sin(ang);
    limb(ctx, 2, -49, hx, hy, 5.4, sleeveOf(L, pal));
    fist(ctx, hx, hy, pal.leather, -1.57);
  };

  /* ---------- ŠTÍTY ---------- */
  // vikingský kulatý dřevěný štít s malovanými pruhy
  P.shield.vround = (ctx, L, pal, atk) => {
    const sx = atk >= 0 && atk < 0.6 ? -1.5 : 0;
    const cx = 8 + sx, cy = -41, r = 13;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.closePath();
    fs(ctx, pal.tunic, 2.2);
    ctx.save(); ctx.clip();
    ctx.fillStyle = pal.shield2 || '#e9dcc0';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, i * Math.PI / 2 + 0.25, i * Math.PI / 2 + Math.PI / 4 + 0.25); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
    for (let x = cx - r; x < cx + r; x += 4.5) { ctx.beginPath(); ctx.moveTo(x, cy - r); ctx.lineTo(x, cy + r); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r - 1.2, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = pal.leatherDark || '#4c321e'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 3.8, 0, TAU);
    const g = ctx.createRadialGradient(cx - 1, cy - 1, 0.5, cx, cy, 4);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, pal.metalDark || '#6f7580');
    fs(ctx, g, 1.4);
    ctx.restore();
  };

  window.ArtParts = P;

  /* =======================================================================
     HRADY NÁRODŮ (kreslí se do 320 × 380, brána vpravo, patka dole)
     ======================================================================= */
  const T = { castle: {}, battle: {}, map: {} };
  const B = 380;

  /* ---------- JAPONSKÝ HRAD (tenšu) ---------- */
  function ishigaki(ctx, x0, x1, top, bottom, inset, pal, rand) {
    // kamenná podnož se zakřivenými stěnami
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    ctx.quadraticCurveTo(x0 + inset * 0.2, top + (bottom - top) * 0.4, x0 + inset, top);
    ctx.lineTo(x1 - inset, top);
    ctx.quadraticCurveTo(x1 - inset * 0.2, top + (bottom - top) * 0.4, x1, bottom);
    ctx.closePath();
    ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, shade(pal.stone, 0.06)); g.addColorStop(1, pal.stoneDark);
    ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, bottom - top);
    // nepravidelné kameny
    for (let y = top; y < bottom; y += 9 + rand() * 4) {
      let x = x0 - rand() * 10;
      while (x < x1) {
        const w = 12 + rand() * 16, h = 8 + rand() * 4;
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, TAU);
        ctx.fillStyle = rand() < 0.3 ? 'rgba(255,255,255,.12)' : (rand() < 0.5 ? 'rgba(0,0,0,.1)' : 'rgba(0,0,0,0)');
        ctx.fill();
        ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.stroke();
        x += w + 1;
      }
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    ctx.quadraticCurveTo(x0 + inset * 0.2, top + (bottom - top) * 0.4, x0 + inset, top);
    ctx.lineTo(x1 - inset, top);
    ctx.quadraticCurveTo(x1 - inset * 0.2, top + (bottom - top) * 0.4, x1, bottom);
    ctx.lineWidth = 2.4; ctx.strokeStyle = OUT; ctx.stroke();
  }
  function plasterWall(ctx, x, y, w, h, pal, wins) {
    rr(ctx, x, y, w, h, 1); fs(ctx, pal.plaster, 2.2);
    // tmavé dřevěné obložení dole (šitami)
    ctx.beginPath(); ctx.rect(x, y + h * 0.62, w, h * 0.38); fs(ctx, pal.wood, 1.8);
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
    for (let xx = x + 6; xx < x + w; xx += 6) { ctx.beginPath(); ctx.moveTo(xx, y + h * 0.62); ctx.lineTo(xx, y + h); ctx.stroke(); }
    // okna s mřížkou
    for (let i = 0; i < wins; i++) {
      const wx = x + (w / (wins + 1)) * (i + 1) - 6, wy = y + h * 0.18;
      rr(ctx, wx, wy, 12, h * 0.32, 1); fs(ctx, pal.glowWindows ? pal.window : '#2a2420', 1.4);
      ctx.strokeStyle = pal.wood; ctx.lineWidth = 1.2;
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(wx + k * 3, wy); ctx.lineTo(wx + k * 3, wy + h * 0.32); ctx.stroke(); }
    }
  }
  function jRoof(ctx, cx, y, halfW, h, pal, gable) {
    // zakřivená střecha s vytaženými rohy
    ctx.beginPath();
    ctx.moveTo(cx - halfW - 10, y + 2);
    ctx.quadraticCurveTo(cx - halfW + 6, y - 3, cx - halfW + 14, y - h);
    ctx.lineTo(cx + halfW - 14, y - h);
    ctx.quadraticCurveTo(cx + halfW - 6, y - 3, cx + halfW + 10, y + 2);
    ctx.quadraticCurveTo(cx, y - 1, cx - halfW - 10, y + 2);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y - h, 0, y);
    g.addColorStop(0, shade(pal.jroof, 0.15)); g.addColorStop(1, pal.jroofDark);
    fs(ctx, g, 2.2);
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
    for (let xx = cx - halfW - 10; xx < cx + halfW + 10; xx += 4) { ctx.beginPath(); ctx.moveTo(xx, y - h); ctx.lineTo(xx + (xx - cx) * 0.08, y + 2); ctx.stroke(); }
    ctx.restore();
    // bílá linka okapu
    ctx.beginPath(); ctx.moveTo(cx - halfW - 8, y + 1); ctx.quadraticCurveTo(cx, y - 2, cx + halfW + 8, y + 1);
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
    if (gable) {
      // štít čidori-hafu se zlatým zdobením
      ctx.beginPath(); ctx.moveTo(cx - 18, y - h * 0.15); ctx.lineTo(cx, y - h - 14); ctx.lineTo(cx + 18, y - h * 0.15); ctx.closePath();
      fs(ctx, pal.plaster, 1.8);
      ctx.beginPath(); ctx.moveTo(cx - 22, y - h * 0.1); ctx.lineTo(cx, y - h - 18); ctx.lineTo(cx + 22, y - h * 0.1);
      ctx.lineWidth = 4.4; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = pal.jroofDark; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, y - h * 0.55, 3, 0, TAU); fs(ctx, '#e8c55a', 1);
    }
  }
  function shachi(ctx, x, y, dir) {
    // zlatá ryba šačihoko na hřebeni
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dir * 2, y - 10, x + dir * 7, y - 14);
    ctx.quadraticCurveTo(x + dir * 3, y - 7, x + dir * 6, y - 2); ctx.closePath();
    fs(ctx, '#f2c94c', 1.3);
  }
  T.castle.japonsko = (ctx, pal, level, rand) => {
    const jp = Object.assign({}, pal);
    jp.plaster = pal.skinId === 'kralovsky' ? '#f3efe6' : shade(pal.stoneLight, 0.35);
    jp.wood = pal.skinId === 'temna' ? '#1c1a22' : '#3a2a20';
    jp.jroof = pal.skinId === 'kralovsky' ? '#3d4757' : pal.roof;
    jp.jroofDark = pal.skinId === 'kralovsky' ? '#262d38' : pal.roofDark;
    const flags = [];
    // kamenná podnož
    ishigaki(ctx, 22, 236, 236, B, 22, pal, rand);
    // 1. patro
    plasterWall(ctx, 56, 196, 148, 44, jp, 4);
    jRoof(ctx, 130, 196, 82, 20, jp, true);
    // 2. patro
    plasterWall(ctx, 78, 146, 104, 36, jp, 3);
    jRoof(ctx, 130, 146, 62, 18, jp, false);
    // karahafu – zakřivený štít uprostřed
    ctx.beginPath(); ctx.moveTo(108, 146); ctx.quadraticCurveTo(130, 118, 152, 146); ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = jp.jroofDark; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(118, 144); ctx.quadraticCurveTo(130, 128, 142, 144); ctx.lineWidth = 1.6; ctx.strokeStyle = '#e8c55a'; ctx.stroke();
    // 3. patro
    plasterWall(ctx, 98, 98, 64, 32, jp, 2);
    jRoof(ctx, 130, 98, 42, 22, jp, false);
    // hřeben a šačihoko
    ctx.beginPath(); ctx.rect(104, 72, 52, 5); fs(ctx, jp.jroofDark, 1.6);
    shachi(ctx, 104, 74, -1); shachi(ctx, 156, 74, 1);
    flags.push({ x: 130, y: 72 });
    if (level >= 4) {
      // malá věž jagura vlevo
      ishigaki(ctx, 0, 52, 300, B, 8, pal, rand);
      plasterWall(ctx, 6, 266, 40, 32, jp, 1);
      jRoof(ctx, 26, 266, 22, 14, jp, false);
      flags.push({ x: 26, y: 250 });
    }
    // brána – kamenné bloky a strážnice jagura-mon
    ishigaki(ctx, 228, 320, 286, B, 6, pal, rand);
    plasterWall(ctx, 236, 248, 80, 36, jp, 2);
    jRoof(ctx, 276, 248, 44, 16, jp, false);
    // průchod brány
    ctx.beginPath(); ctx.rect(254, 318, 46, 62); fs(ctx, '#2a1d14', 2.4);
    ctx.beginPath(); ctx.rect(256, 320, 21, 60); fs(ctx, '#6b4a2e', 1.4);
    ctx.beginPath(); ctx.rect(277, 320, 21, 60); fs(ctx, '#6b4a2e', 1.4);
    ctx.fillStyle = '#c9a24a';
    for (let yy = 330; yy < 378; yy += 10) for (const xx of [261, 271, 282, 292]) { ctx.beginPath(); ctx.arc(xx, yy, 1.3, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.rect(250, 312, 54, 7); fs(ctx, '#3a2a20', 1.6);
    flags.push({ x: 276, y: 232 });
    if (level >= 7) {
      // zlaté zdobení
      ctx.beginPath(); ctx.moveTo(48, 197); ctx.lineTo(212, 197); ctx.lineWidth = 2.4; ctx.strokeStyle = '#e8c55a'; ctx.stroke();
    }
    return { flags, towerTop: { x: 276, y: 262 }, flagStyle: 'nobori' };
  };

  /* ---------- VIKINGSKÁ PEVNOST (palisáda a dlouhý dům) ---------- */
  function logs(ctx, x0, x1, top, bottom, pal, rand, pointed = true) {
    for (let x = x0; x < x1; x += 13) {
      const w = 13, h = bottom - top + (rand() * 10 - 5);
      const y = bottom - h;
      ctx.beginPath();
      ctx.moveTo(x, bottom); ctx.lineTo(x, y + 8);
      if (pointed) ctx.lineTo(x + w / 2, y - 4); else ctx.lineTo(x + w / 2, y + 4);
      ctx.lineTo(x + w, y + 8); ctx.lineTo(x + w, bottom); ctx.closePath();
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, shade(pal.wood, 0.15)); g.addColorStop(0.6, pal.wood); g.addColorStop(1, shade(pal.wood, -0.3));
      fs(ctx, g, 1.8);
      ctx.beginPath(); ctx.moveTo(x + 4, y + 20); ctx.lineTo(x + 4, bottom - 10); ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.stroke();
      if (pal.frost) { ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + w / 2, y - 4); ctx.lineTo(x + w, y + 8); ctx.lineWidth = 2.4; ctx.strokeStyle = '#f4fbff'; ctx.stroke(); }
    }
  }
  function dragonHead(ctx, x, y, dir) {
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dir * 4, y - 14, x + dir * 12, y - 18);
    ctx.lineTo(x + dir * 17, y - 15); ctx.lineTo(x + dir * 12, y - 13); ctx.quadraticCurveTo(x + dir * 7, y - 8, x + dir * 5, y + 2); ctx.closePath();
    fs(ctx, '#5a3a22', 1.5);
    ctx.beginPath(); ctx.arc(x + dir * 11, y - 16, 1, 0, TAU); ctx.fillStyle = '#e8c55a'; ctx.fill();
  }
  function hungShield(ctx, x, y, c1, c2) {
    ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); fs(ctx, c1, 1.8);
    ctx.save(); ctx.clip(); ctx.fillStyle = c2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 9, i * Math.PI / 2, i * Math.PI / 2 + Math.PI / 4); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); fs(ctx, '#c9ced6', 1);
  }
  T.castle.sever = (ctx, pal, level, rand) => {
    const vp = Object.assign({}, pal);
    vp.wood = pal.skinId === 'kralovsky' ? '#7a5434' : (pal.skinId === 'temna' ? '#3a2e2a' : shade(pal.stone, -0.25));
    vp.frost = pal.skinId === 'ledova';
    const roofC = pal.skinId === 'kralovsky' ? '#5d6e3a' : pal.roof;
    const roofD = pal.skinId === 'kralovsky' ? '#3e4a25' : pal.roofDark;
    const flags = [];
    // dlouhý dům (síň) za palisádou
    ctx.beginPath(); ctx.rect(36, 176, 176, 90);
    fs(ctx, shade(vp.wood, -0.1), 2.2);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
    for (let y = 184; y < 266; y += 8) { ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(212, y); ctx.stroke(); }
    // střecha (drn/šindel) ve tvaru převrácené lodi
    ctx.beginPath();
    ctx.moveTo(20, 184); ctx.quadraticCurveTo(124, 196, 228, 184);
    ctx.lineTo(196, 104); ctx.quadraticCurveTo(124, 96, 52, 104); ctx.closePath();
    const g = ctx.createLinearGradient(0, 100, 0, 190);
    g.addColorStop(0, shade(roofC, 0.15)); g.addColorStop(1, roofD);
    fs(ctx, g, 2.4);
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.2;
    for (let y = 112; y < 190; y += 7) { ctx.beginPath(); ctx.moveTo(10, y); ctx.quadraticCurveTo(124, y + 6, 240, y); ctx.stroke(); }
    if (vp.frost || pal.skinId === 'ledova') { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(0, 96, 260, 18); }
    ctx.restore();
    // zkřížená štítová prkna s dračími hlavami
    dragonHead(ctx, 52, 104, -1); dragonHead(ctx, 196, 104, 1);
    flags.push({ x: 124, y: 98 });
    // dveře síně
    ctx.beginPath(); ctx.moveTo(112, 266); ctx.lineTo(112, 236); ctx.quadraticCurveTo(124, 226, 136, 236); ctx.lineTo(136, 266); ctx.closePath(); fs(ctx, '#2a1d14', 1.8);
    // palisáda
    logs(ctx, 0, 236, 248, B, vp, rand);
    ctx.beginPath(); ctx.rect(0, 300, 236, 7); fs(ctx, shade(vp.wood, -0.35), 1.6);
    ctx.beginPath(); ctx.rect(0, 350, 236, 7); fs(ctx, shade(vp.wood, -0.35), 1.6);
    // štíty na palisádě
    const sc = [[pal.banner, '#efe3c6'], ['#e8c55a', pal.banner], [pal.banner, '#2a2a2a']];
    for (let i = 0; i < 5; i++) hungShield(ctx, 24 + i * 44, 280, sc[i % 3][0], sc[i % 3][1]);
    if (level >= 4) {
      // runový kámen u zdi
      ctx.beginPath(); ctx.moveTo(4, B); ctx.lineTo(6, 330); ctx.quadraticCurveTo(14, 316, 24, 330); ctx.lineTo(26, B); ctx.closePath(); fs(ctx, '#8b8f96', 1.8);
      ctx.beginPath(); ctx.moveTo(11, 340); ctx.lineTo(17, 350); ctx.moveTo(17, 340); ctx.lineTo(11, 360); ctx.lineWidth = 1.4; ctx.strokeStyle = '#c4262e'; ctx.stroke();
    }
    // strážní věž u brány
    ctx.beginPath(); ctx.rect(236, 190, 80, 190); fs(ctx, vp.wood, 2.2);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
    for (let x = 246; x < 316; x += 10) { ctx.beginPath(); ctx.moveTo(x, 190); ctx.lineTo(x, B); ctx.stroke(); }
    // ochoz
    ctx.beginPath(); ctx.rect(228, 180, 96, 12); fs(ctx, shade(vp.wood, -0.3), 2);
    logs(ctx, 230, 322, 158, 182, vp, rand, false);
    // stříška věže
    ctx.beginPath(); ctx.moveTo(224, 160); ctx.lineTo(276, 118); ctx.lineTo(328, 160); ctx.closePath(); fs(ctx, roofD, 2.2);
    flags.push({ x: 276, y: 118 });
    // brána
    ctx.beginPath(); ctx.rect(252, 306, 52, 74); fs(ctx, '#2a1d14', 2.4);
    ctx.beginPath(); ctx.rect(255, 309, 46, 71); fs(ctx, '#6b4a2e', 1.4);
    ctx.strokeStyle = '#2f2a28'; ctx.lineWidth = 3.6;
    for (const yy of [322, 348, 368]) { ctx.beginPath(); ctx.moveTo(255, yy); ctx.lineTo(301, yy); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(278, 309); ctx.lineTo(278, 380); ctx.lineWidth = 1.4; ctx.strokeStyle = '#2a1d14'; ctx.stroke();
    if (level >= 7) { hungShield(ctx, 262, 230, '#e8c55a', pal.banner); hungShield(ctx, 292, 230, pal.banner, '#e8c55a'); }
    return { flags, towerTop: { x: 276, y: 168 }, flagStyle: 'raven' };
  };

  /* =======================================================================
     BOJIŠTĚ
     ======================================================================= */
  const C = () => GameData.battleConfig;

  function road(ctx, W, top, bottom, c1, c2, c3, rand, dots) {
    const g = ctx.createLinearGradient(0, top - 16, 0, bottom + 16);
    g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, top - 14);
    for (let x = 0; x <= W; x += 50) ctx.lineTo(x, top - 14 + Math.sin(x * 0.02) * 3);
    for (let x = W; x >= 0; x -= 50) ctx.lineTo(x, bottom + 14 + Math.sin(x * 0.015) * 4);
    ctx.closePath(); ctx.fill();
    for (let i = 0; i < W / 6; i++) {
      const x = rand() * W, y = top - 8 + rand() * (bottom - top + 16);
      ctx.fillStyle = rand() < 0.5 ? dots[0] : dots[1];
      ctx.beginPath(); ctx.ellipse(x, y, 2 + rand() * 4, 1 + rand() * 1.5, 0, 0, TAU); ctx.fill();
    }
  }
  function sakuraTree(ctx, x, y, s, rand) {
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y); ctx.quadraticCurveTo(x - 2 * s, y - 25 * s, x - 10 * s, y - 42 * s);
    ctx.lineTo(x - 6 * s, y - 44 * s); ctx.quadraticCurveTo(x + 2 * s, y - 30 * s, x + 6 * s, y - 46 * s);
    ctx.lineTo(x + 9 * s, y - 44 * s); ctx.quadraticCurveTo(x + 4 * s, y - 24 * s, x + 4 * s, y); ctx.closePath();
    fs(ctx, '#4a2e2a', 1.4 * s);
    const cols = ['#f7c6d6', '#f1a8c0', '#fbd9e4', '#e98fae'];
    for (let i = 0; i < 26; i++) {
      const a = rand() * TAU, r = rand() * 26 * s;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.3, y - 48 * s + Math.sin(a) * r * 0.7, (6 + rand() * 6) * s, 0, TAU);
      ctx.fillStyle = cols[i % 4]; ctx.fill();
    }
  }
  function jpPine(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x - 2 * s, y); ctx.quadraticCurveTo(x + 6 * s, y - 20 * s, x - 4 * s, y - 40 * s); ctx.lineTo(x, y - 41 * s); ctx.quadraticCurveTo(x + 10 * s, y - 20 * s, x + 3 * s, y); ctx.closePath();
    ctx.fillStyle = '#3b2a26'; ctx.fill();
    ctx.fillStyle = '#2f5a3e';
    for (const [dx, dy, w] of [[-14, -22, 18], [10, -30, 16], [-6, -42, 14], [4, -14, 12]]) {
      ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, w * s, 5 * s, 0, 0, TAU); ctx.fill();
    }
  }
  function torii(ctx, x, y, s) {
    const red = '#c8382c';
    ctx.lineJoin = 'round';
    for (const dx of [-16, 16]) { ctx.beginPath(); ctx.rect(x + dx * s - 2.5 * s, y - 46 * s, 5 * s, 46 * s); fs(ctx, red, 1.4); }
    ctx.beginPath(); ctx.rect(x - 22 * s, y - 38 * s, 44 * s, 4 * s); fs(ctx, red, 1.4);
    ctx.beginPath(); ctx.moveTo(x - 28 * s, y - 46 * s); ctx.quadraticCurveTo(x, y - 50 * s, x + 28 * s, y - 46 * s); ctx.lineTo(x + 30 * s, y - 52 * s); ctx.quadraticCurveTo(x, y - 56 * s, x - 30 * s, y - 52 * s); ctx.closePath();
    fs(ctx, '#2a2626', 1.4);
  }
  function pagoda(ctx, x, y, s, col) {
    ctx.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const w = (26 - i * 4) * s, yy = y - i * 14 * s;
      ctx.fillRect(x - w * 0.5, yy - 10 * s, w, 10 * s);
      ctx.beginPath(); ctx.moveTo(x - w * 0.8, yy - 9 * s); ctx.quadraticCurveTo(x, yy - 16 * s, x + w * 0.8, yy - 9 * s); ctx.lineTo(x + w * 0.9, yy - 7 * s); ctx.lineTo(x - w * 0.9, yy - 7 * s); ctx.closePath(); ctx.fill();
    }
    ctx.fillRect(x - 1 * s, y - 86 * s, 2 * s, 16 * s);
  }
  function lantern(ctx, x, y) {
    ctx.beginPath(); ctx.rect(x - 3, y - 18, 6, 18); fs(ctx, '#9a9a94', 1.4);
    ctx.beginPath(); ctx.rect(x - 7, y - 30, 14, 12); fs(ctx, '#b0b0aa', 1.4);
    ctx.beginPath(); ctx.rect(x - 3.5, y - 27, 7, 6); ctx.fillStyle = '#ffcf6a'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 11, y - 30); ctx.lineTo(x, y - 38); ctx.lineTo(x + 11, y - 30); ctx.closePath(); fs(ctx, '#8a8a84', 1.4);
  }

  T.battle.japonsko = (ctx, W, H, seed, layer) => {
    const rand = rng(seed || 3);
    const cfg = C();
    const FAR = layer !== 'near', NEAR = layer !== 'far';
    if (FAR) {
    // nebe – západ slunce
    const sky = ctx.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, '#3d4f9a'); sky.addColorStop(0.45, '#c8708a'); sky.addColorStop(0.75, '#f4a46a'); sky.addColorStop(1, '#ffdca8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // velké slunce
    const sx = W * 0.62;
    const sg = ctx.createRadialGradient(sx, 250, 20, sx, 250, 260);
    sg.addColorStop(0, 'rgba(255,120,70,.55)'); sg.addColorStop(1, 'rgba(255,140,90,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, 420);
    ctx.beginPath(); ctx.arc(sx, 230, 70, 0, TAU); ctx.fillStyle = '#e8573c'; ctx.fill();
    // pruhy mraků
    for (let i = 0; i < 10; i++) {
      const y = 60 + rand() * 190, x = rand() * W, w = 140 + rand() * 260;
      ctx.fillStyle = 'rgba(255,230,220,.35)';
      ctx.beginPath(); ctx.ellipse(x, y, w, 5 + rand() * 4, 0, 0, TAU); ctx.fill();
    }
    // posvátná hora se sněhovou čepicí
    const fx = W * 0.42, fb = 380;
    const mg = ctx.createLinearGradient(0, 100, 0, fb);
    mg.addColorStop(0, '#6c78a6'); mg.addColorStop(1, '#8e8fb3');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.moveTo(fx - 520, fb); ctx.quadraticCurveTo(fx - 160, 210, fx - 60, 112); ctx.lineTo(fx + 60, 112); ctx.quadraticCurveTo(fx + 160, 210, fx + 520, fb); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f7f4f6';
    ctx.beginPath(); ctx.moveTo(fx - 60, 112); ctx.lineTo(fx + 60, 112); ctx.lineTo(fx + 110, 170);
    for (let i = 0; i <= 10; i++) ctx.lineTo(fx + 110 - i * 22, 170 + (i % 2 ? 26 : 6) + rand() * 8);
    ctx.closePath(); ctx.fill();
    // vzdálené kopce v mlze
    for (const [base, col, amp] of [[330, '#9a8fb6', 40], [360, '#7d7aa4', 50], [395, '#5f6b8f', 40]]) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 30) ctx.lineTo(x, base - Math.abs(Math.sin(x * 0.004 + base)) * amp - rand() * 8);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    // pagody na kopcích
    pagoda(ctx, W * 0.18, 330, 0.9, '#4b4a6e');
    pagoda(ctx, W * 0.8, 340, 0.75, '#4b4a6e');
    // mlha
    const haze = ctx.createLinearGradient(0, 330, 0, 420);
    haze.addColorStop(0, 'rgba(255,220,200,0)'); haze.addColorStop(1, 'rgba(255,225,205,.45)');
    ctx.fillStyle = haze; ctx.fillRect(0, 330, W, 90);
    }
    if (!NEAR) return;
    for (let i = 0; i < 400; i++) rand();
    // bambusové háje a borovice
    for (let x = -10; x < W; x += 40 + rand() * 60) {
      if (rand() < 0.45) {
        for (let k = 0; k < 6; k++) {
          const bx = x + k * 5 + rand() * 3, top = 330 + rand() * 30;
          ctx.strokeStyle = k % 2 ? '#5f8f3a' : '#4b7a2e'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(bx, 440); ctx.lineTo(bx + 2, top); ctx.stroke();
          ctx.fillStyle = '#6fa848';
          for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(bx + 6, top + 6 + j * 14, 8, 2, -0.4, 0, TAU); ctx.fill(); }
        }
      } else jpPine(ctx, x + 10, 440, 0.9 + rand() * 0.5);
    }
    // louka
    const gr = ctx.createLinearGradient(0, 430, 0, H);
    gr.addColorStop(0, '#9ab65a'); gr.addColorStop(1, '#5c8a3a');
    ctx.fillStyle = gr; ctx.fillRect(0, 436, W, H - 436);
    // sakury a torii za cestou
    for (let x = 120; x < W - 100; x += 230 + rand() * 200) sakuraTree(ctx, x, 452, 0.9 + rand() * 0.4, rand);
    torii(ctx, W * 0.5, 456, 1.1);
    // cesta – světlý štěrk
    road(ctx, W, cfg.laneTop, cfg.laneBottom, '#e2d3ad', '#d3c194', '#bba878', rand, ['rgba(120,100,70,.3)', 'rgba(255,250,235,.45)']);
    // kamenné lucerny
    for (let x = 400; x < W - 300; x += 420) lantern(ctx, x, cfg.laneTop - 16);
    // tráva a okvětní lístky na zemi
    for (let i = 0; i < W / 3; i++) {
      const x = rand() * W, y = 444 + rand() * (H - 444);
      if (y > cfg.laneTop - 18 && y < cfg.laneBottom + 18) continue;
      ctx.strokeStyle = rand() < 0.5 ? '#4e7a2e' : '#a6c862'; ctx.lineWidth = 1.6;
      const h = 5 + rand() * 8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 2, y - h * 0.6, x + 4 - rand() * 8, y - h); ctx.stroke();
    }
    for (let i = 0; i < W / 8; i++) {
      ctx.fillStyle = rand() < 0.5 ? '#f7c6d6' : '#f1a8c0';
      ctx.beginPath(); ctx.ellipse(rand() * W, 440 + rand() * (H - 440), 2.4, 1.4, rand() * 3, 0, TAU); ctx.fill();
    }
  };

  function snowPine(ctx, x, y, h) {
    Art.pine(ctx, x, y, h, '#24493f', '#1a3a32');
    ctx.fillStyle = '#f4fbff';
    for (let i = 0; i < 3; i++) {
      const ty = y - h + i * h * 0.26, bw = h * 0.42 * (0.55 + i * 0.25);
      ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x + bw * 0.6, ty + h * 0.22); ctx.lineTo(x - bw * 0.6, ty + h * 0.22); ctx.closePath(); ctx.fill();
    }
  }
  function longship(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-60, -6); ctx.quadraticCurveTo(0, 14, 60, -6); ctx.lineTo(70, -26); ctx.quadraticCurveTo(66, -10, 52, -10); ctx.quadraticCurveTo(0, 0, -52, -10); ctx.quadraticCurveTo(-66, -10, -70, -26); ctx.closePath();
    fs(ctx, '#4a3022', 1.6);
    for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.arc(i * 11, -8, 4.4, 0, TAU); ctx.fillStyle = i % 2 ? '#e8c55a' : col; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -70); ctx.lineWidth = 3; ctx.strokeStyle = '#3a2418'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-26, -66); ctx.lineTo(26, -66); ctx.lineTo(30, -22); ctx.lineTo(-30, -22); ctx.closePath(); fs(ctx, '#efe6d2', 1.4);
    ctx.save(); ctx.clip(); ctx.fillStyle = col;
    for (let i = -30; i < 30; i += 12) ctx.fillRect(i, -70, 6, 50);
    ctx.restore();
    ctx.restore();
  }
  T.battle.sever = (ctx, W, H, seed, layer) => {
    const rand = rng(seed || 5);
    const cfg = C();
    const FAR = layer !== 'near', NEAR = layer !== 'far';
    if (FAR) {
    const sky = ctx.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, '#0e1a36'); sky.addColorStop(0.55, '#24456e'); sky.addColorStop(1, '#a9c9dc');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // hvězdy
    for (let i = 0; i < W / 6; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.6})`; ctx.fillRect(rand() * W, rand() * 200, 1.4, 1.4); }
    // polární záře
    for (let b = 0; b < 3; b++) {
      const y0 = 70 + b * 38;
      ctx.beginPath();
      for (let x = -40; x <= W + 40; x += 30) ctx.lineTo(x, y0 + Math.sin(x * 0.004 + b * 2) * 34 + Math.sin(x * 0.011) * 10);
      ctx.lineWidth = 44 - b * 8;
      ctx.strokeStyle = ['rgba(90,255,170,.20)', 'rgba(80,220,200,.16)', 'rgba(150,120,255,.12)'][b];
      ctx.stroke();
      ctx.lineWidth = 8; ctx.strokeStyle = ['rgba(150,255,200,.25)', 'rgba(120,240,220,.2)', 'rgba(190,160,255,.18)'][b]; ctx.stroke();
    }
    // strmé skály fjordu se sněhem
    Art.mountains(ctx, W, 360, 150, 250, 100, '#6a7f9c', '#f2f7fb', rand);
    Art.mountains(ctx, W, 386, 90, 170, 80, '#41566f', '#e4eef6', rand);
    const mist = ctx.createLinearGradient(0, 330, 0, 390);
    mist.addColorStop(0, 'rgba(170,200,220,0)'); mist.addColorStop(1, 'rgba(170,200,220,.45)');
    ctx.fillStyle = mist; ctx.fillRect(0, 330, W, 60);
    // fjord – voda
    const wg = ctx.createLinearGradient(0, 380, 0, 432);
    wg.addColorStop(0, '#5b86a6'); wg.addColorStop(1, '#2f5672');
    ctx.fillStyle = wg; ctx.fillRect(0, 380, W, 56);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < W / 20; i++) { const x = rand() * W, y = 386 + rand() * 44; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 + rand() * 20, y); ctx.stroke(); }
    longship(ctx, W * 0.3, 410, 0.55, '#a8262a');
    longship(ctx, W * 0.72, 404, 0.42, '#2f62b8');
    }
    if (!NEAR) return;
    for (let i = 0; i < 400; i++) rand();
    // zasněžené lesy
    for (let x = -10; x < W + 10; x += 12 + rand() * 12) snowPine(ctx, x, 446 + rand() * 6, 34 + rand() * 26);
    // sněhová pláň
    const sn = ctx.createLinearGradient(0, 440, 0, H);
    sn.addColorStop(0, '#e9f2f8'); sn.addColorStop(1, '#bfd3e2');
    ctx.fillStyle = sn; ctx.fillRect(0, 444, W, H - 444);
    // rozbahněná cesta
    road(ctx, W, cfg.laneTop, cfg.laneBottom, '#9a8a76', '#7d6a55', '#6a5846', rand, ['rgba(60,45,30,.35)', 'rgba(240,248,255,.6)']);
    // runové kameny a balvany se sněhem
    for (let x = 500; x < W - 400; x += 640) {
      const y = cfg.laneTop - 14;
      ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x - 9, y - 40); ctx.quadraticCurveTo(x, y - 54, x + 9, y - 40); ctx.lineTo(x + 10, y); ctx.closePath(); fs(ctx, '#8b8f96', 1.8);
      ctx.beginPath(); ctx.moveTo(x - 4, y - 36); ctx.lineTo(x + 3, y - 26); ctx.moveTo(x + 3, y - 36); ctx.lineTo(x - 4, y - 16); ctx.moveTo(x - 5, y - 12); ctx.lineTo(x + 5, y - 12);
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#b8322c'; ctx.stroke();
    }
    for (let i = 0; i < 14; i++) {
      const x = 300 + rand() * (W - 600), y = cfg.laneBottom + 28 + rand() * 20, r = 8 + rand() * 12;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, 0, Math.PI, TAU); ctx.closePath(); fs(ctx, '#7d838c', 2);
      ctx.beginPath(); ctx.ellipse(x, y - r * 0.75, r * 1.1, r * 0.35, 0, Math.PI, TAU); ctx.fillStyle = '#f4fbff'; ctx.fill();
    }
    // sníh na zemi
    for (let i = 0; i < W / 4; i++) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(rand() * W, 446 + rand() * (H - 446), 1 + rand() * 1.6, 0, TAU); ctx.fill(); }
  };

  /* Ambientní částice na bojišti (lístky sakury, sníh) */
  T.ambient = {
    japonsko: { count: 46, color: ['#f7c6d6', '#f1a8c0', '#fbd9e4'], vx: [-40, -14], vy: [18, 40], size: [2.2, 3.4], petal: true },
    sever: { count: 80, color: ['#ffffff', '#e8f2ff'], vx: [-16, 10], vy: [26, 60], size: [1.2, 2.6], petal: false }
  };

  /* =======================================================================
     MAPY PŘÍBĚHU
     ======================================================================= */
  function seigaiha(ctx, W, H) {
    ctx.fillStyle = '#1f3b6e'; ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1.2;
    const r = 16;
    for (let y = 0, row = 0; y < H + r; y += r * 0.5, row++) {
      for (let x = (row % 2) * r; x < W + r; x += r * 2) {
        for (let k = 3; k >= 1; k--) {
          ctx.beginPath(); ctx.arc(x, y, r * k / 3, Math.PI, 0);
          ctx.strokeStyle = k === 3 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.07)'; ctx.stroke();
        }
      }
    }
  }
  function island(ctx, pts, fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i], [px, py] = pts[i - 1];
      ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
  }
  T.map.japonsko = (ctx, W, H) => {
    const rand = rng(77);
    seigaiha(ctx, W, H);
    // hlavní ostrov – úzký a protažený
    const pts = [[0.12, 0.98], [0.06, 0.82], [0.12, 0.66], [0.06, 0.5], [0.14, 0.34], [0.08, 0.16], [0.2, 0.02], [0.6, 0.0], [0.94, 0.06], [0.9, 0.24], [0.96, 0.4], [0.88, 0.56], [0.95, 0.72], [0.86, 0.9], [0.62, 1.0], [0.3, 1.0]].map(([x, y]) => [x * W, y * H]);
    island(ctx, pts, '#7fae5a');
    // rýžová pole – terasy
    for (let i = 0; i < 16; i++) {
      const x = W * (0.16 + rand() * 0.66), y = H * (0.7 + rand() * 0.26);
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.25 + rand() * 0.5);
      ctx.fillStyle = i % 3 ? '#a8c96a' : '#7fb0a8'; ctx.fillRect(-16, -8, 32, 16);
      ctx.strokeStyle = 'rgba(60,80,30,.4)'; ctx.lineWidth = 1; ctx.strokeRect(-16, -8, 32, 16);
      ctx.restore();
    }
    // sakury v údolí
    for (let i = 0; i < 18; i++) {
      const x = W * (0.16 + rand() * 0.68), y = H * (0.66 + rand() * 0.3);
      ctx.beginPath(); ctx.arc(x, y, 6 + rand() * 4, 0, TAU); ctx.fillStyle = i % 2 ? '#f4b3c8' : '#eb94b0'; ctx.fill();
    }
    // hory Kurama
    for (let i = 0; i < 22; i++) {
      const x = W * (0.16 + rand() * 0.7), y = H * (0.36 + rand() * 0.26), s = 14 + rand() * 18;
      ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.7); ctx.lineTo(x, y - s * 0.8); ctx.lineTo(x + s, y + s * 0.7); ctx.closePath();
      fs(ctx, i % 4 === 0 ? '#5f7a8f' : '#6b8a5e', 1.4);
      ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.4); ctx.lineTo(x, y - s * 0.8); ctx.lineTo(x + s * 0.3, y - s * 0.4); ctx.closePath(); ctx.fillStyle = '#f4f6f8'; ctx.fill();
    }
    // posvátná hora
    const fx = W * 0.55, fy = H * 0.36;
    ctx.beginPath(); ctx.moveTo(fx - 60, fy + 30); ctx.lineTo(fx - 12, fy - 34); ctx.lineTo(fx + 12, fy - 34); ctx.lineTo(fx + 60, fy + 30); ctx.closePath(); fs(ctx, '#7c88b0', 1.8);
    ctx.beginPath(); ctx.moveTo(fx - 12, fy - 34); ctx.lineTo(fx + 12, fy - 34); ctx.lineTo(fx + 26, fy - 14); ctx.lineTo(fx + 10, fy - 18); ctx.lineTo(fx, fy - 10); ctx.lineTo(fx - 12, fy - 18); ctx.lineTo(fx - 26, fy - 14); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    // hlavní město – město a palác
    for (let i = 0; i < 14; i++) {
      const x = W * (0.2 + rand() * 0.62), y = H * (0.08 + rand() * 0.2);
      ctx.fillStyle = '#efe6d2'; ctx.fillRect(x - 6, y - 4, 12, 8);
      ctx.beginPath(); ctx.moveTo(x - 9, y - 3); ctx.quadraticCurveTo(x, y - 10, x + 9, y - 3); ctx.closePath(); ctx.fillStyle = '#3d4757'; ctx.fill();
    }
    pagoda(ctx, W * 0.72, H * 0.2, 0.55, '#3d4757');
    torii(ctx, W * 0.3, H * 0.62, 0.6);
    // řeka
    ctx.beginPath(); ctx.moveTo(W * 0.9, H * 0.6); ctx.bezierCurveTo(W * 0.66, H * 0.68, W * 0.5, H * 0.78, W * 0.34, H * 1.0);
    ctx.lineWidth = 7; ctx.strokeStyle = '#4f8cc4'; ctx.stroke();
  };

  T.map.sever = (ctx, W, H) => {
    const rand = rng(91);
    // moře
    ctx.fillStyle = '#16314d'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 140; i++) { const x = rand() * W, y = rand() * H; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 3, x + 12, y); ctx.stroke(); }
    // pevnina s hluboce zaříznutými fjordy
    ctx.beginPath(); ctx.moveTo(W * 0.04, H);
    for (let y = H; y >= 0; y -= H / 26) ctx.lineTo(W * (0.05 + (Math.floor(y / (H / 26)) % 3 === 0 ? 0.18 : 0.02) + rand() * 0.04), y);
    ctx.lineTo(W * 0.98, 0);
    for (let y = 0; y <= H; y += H / 22) ctx.lineTo(W * (0.95 - (Math.floor(y / (H / 22)) % 4 === 1 ? 0.2 : 0) - rand() * 0.04), y);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#eef5fa'); g.addColorStop(0.33, '#d9e6ef'); g.addColorStop(0.36, '#6c7f63'); g.addColorStop(0.64, '#5e7d52'); g.addColorStop(0.67, '#7a9a5a'); g.addColorStop(1, '#6f9150');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke();
    // zasněžené hory nahoře
    for (let i = 0; i < 22; i++) {
      const x = W * (0.12 + rand() * 0.74), y = H * (0.05 + rand() * 0.26), s = 14 + rand() * 18;
      ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.7); ctx.lineTo(x, y - s * 0.75); ctx.lineTo(x + s, y + s * 0.7); ctx.closePath(); fs(ctx, '#a9c2d6', 1.4);
      ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.2); ctx.lineTo(x, y - s * 0.75); ctx.lineTo(x + s * 0.4, y - s * 0.2); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    }
    // lesy
    for (let i = 0; i < 80; i++) {
      const x = W * (0.12 + rand() * 0.74), y = H * (0.38 + rand() * 0.6);
      Art.pine(ctx, x, y, 12 + rand() * 9, '#2a5a40', '#1f4532');
    }
    // osady (dlouhé domy)
    for (let i = 0; i < 8; i++) {
      const x = W * (0.2 + rand() * 0.6), y = H * (0.7 + rand() * 0.25);
      ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.quadraticCurveTo(x, y + 3, x + 10, y); ctx.lineTo(x + 7, y - 8); ctx.quadraticCurveTo(x, y - 9, x - 7, y - 8); ctx.closePath(); fs(ctx, '#6b5a3a', 1.2);
    }
    // lodě na moři
    longship(ctx, W * 0.1, H * 0.55, 0.22, '#a8262a');
    longship(ctx, W * 0.9, H * 0.82, 0.2, '#2f62b8');
    longship(ctx, W * 0.92, H * 0.3, 0.18, '#3a6e8f');
  };

  window.ArtThemes = T;
})();
