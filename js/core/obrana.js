/* =========================================================================
   OBRANA HRADU – místa na hradbách pro lučištníky, kušiníky a katapulty
   Počet míst roste s úrovní Strážní věže: 1 místo za každé 2 úrovně,
   po vylepšení na maximum (10) je jich 5.
   Na každé místo si hráč dá:
     lucistnik – rychlé šípy
     kuse      – pomalejší, silný šíp, který probije až 2 nepřátele
     katapult  – odemkne se až od 6. úrovně věže; druh střely:
                 ohen (hoření), led (zpomalení), blesk (přeskočí na další),
                 voda (odhodí zpět), jed (jedovatý mrak)
   Obranu je vidět na hradě v bitvě i na hlavní stránce.
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.defense = {
  maxSlots: 5,
  bigSlots: 10,                    // Velká pevnost z obchodu: až 10 obránců
  slotsFor: (vez, big) => big ? Math.min(10, vez || 0) : Math.min(5, Math.ceil((vez || 0) / 2)),
  maxFor: save => GameData.isBigCastle(save) ? 10 : 5,
  unlockAt: (i, big) => big ? i + 1 : i * 2 + 1,
  catapultFrom: 6,                 // úroveň Strážní věže, od které jde postavit katapult
  kinds: {
    lucistnik: { name: 'Lučištník', desc: 'Rychle střílí šípy na nepřátele u hradu.', price: { gold: 0 }, interval: 1.35, range: 430, dmg: vez => 6 + vez * 2.4 },
    kuse: { name: 'Kušiník', desc: 'Pomalejší, ale silný šíp, který probije až 2 nepřátele.', price: { gold: 1200 }, interval: 2.6, range: 540, dmg: vez => 15 + vez * 5.5 },
    katapult: { name: 'Katapult', desc: 'Těžká střela s účinkem podle druhu. Odemkne se od 6. úrovně Strážní věže.', price: { gold: 2500 }, interval: 4.4, range: 900, dmg: lvl => 38 + lvl * 16 }
  }
};
/* Hráč má dva druhy hradu: malý (základní) a Velkou pevnost (koupí se v obchodě) */
GameData.isBigCastle = save => !!(save && save.bigCastle && save.castleType !== 'maly');

GameData.catapult = {
  elements: [
    { id: 'ohen', name: 'Ohnivý', desc: 'Zraní všechny v okolí a zapálí je.', color: '#ff7a2a', glow: '#ffd27a', price: { gold: 0 } },
    { id: 'led', name: 'Ledový', desc: 'Zraní a na 2,5 s zpomalí nepřátele na polovinu.', color: '#7fd3ff', glow: '#e6f8ff', price: { gold: 2200 } },
    { id: 'blesk', name: 'Bleskový', desc: 'Blesk zasáhne cíl a přeskočí na další 3 nepřátele.', color: '#ffe14a', glow: '#fffbe0', price: { gems: 150 } },
    { id: 'voda', name: 'Vodní', desc: 'Vodní vlna zraní a odhodí nepřátele zpět.', color: '#3d9bff', glow: '#bfe2ff', price: { gold: 2600 } },
    { id: 'jed', name: 'Jedovatý', desc: 'Jedovatý mrak na 4 s zraňuje každého, kdo v něm stojí.', color: '#7be04a', glow: '#e2ffcc', price: { gems: 200 } }
  ],
  maxLevel: 5,
  upgradeCost: lvl => 900 * lvl
};
GameData.catapultEl = id => id === 'kamen' ? { id: 'kamen', name: 'Kámen', color: '#8a7a68', glow: '#d8ccb8' } : (GameData.catapult.elements.find(e => e.id === id) || GameData.catapult.elements[0]);

/* Obrana hráče z uloženého postupu → { slots: [{kind, el}], vez, catLvl } */
GameData.defenseOf = save => {
  const d = save.defense || {};
  const vez = save.buildings.vez || 0;
  const n = GameData.defense.slotsFor(vez, GameData.isBigCastle(save));
  const slots = [];
  for (let i = 0; i < n; i++) {
    let kind = (d.slots || [])[i] || 'lucistnik';
    if (kind === 'kuse' && !(d.ownedKinds || []).includes('kuse')) kind = 'lucistnik';
    if (kind === 'katapult' && (vez < GameData.defense.catapultFrom || !(d.ownedKinds || []).includes('katapult'))) kind = 'lucistnik';
    slots.push({ kind, el: (d.slotEl || [])[i] && (d.ownedEl || ['ohen']).includes(d.slotEl[i]) ? d.slotEl[i] : 'ohen' });
  }
  return { slots, vez, catLvl: d.catLvl || 1 };
};

(function () {
  const TAU = Math.PI * 2;
  /* OCHOZY na hradbách (souřadnice v obrázku hradu 320×380): [x0, x1, y nohou].
     Obránci se rozmístí po ochozech podle šířky (katapult potřebuje víc místa),
     takže stojí vždy na hradbě a nepřekrývají se. */
  const SEGS = {
    evropa: [[16, 230, 248], [246, 312, 180]],
    japonsko: [[64, 258, 252]],
    sever: [[22, 230, 254], [246, 310, 186]],
    peklo: [[22, 222, 278], [246, 314, 182]]
  };
  const widthOf = sl => (sl && sl.kind === 'katapult' ? 52 : 24);
  function spots(img, style, front, groundY, facing, slots) {
    const B = img.big || { S: 1, ox: 0, oy: 0, segs: [] };
    const segs = (SEGS[style] || SEGS.evropa).map(([a, b, y]) => [B.ox + a * B.S, B.ox + b * B.S, B.oy + y * B.S]).concat(B.segs || []);
    const list = slots && slots.length ? slots : Array.from({ length: 10 }, () => ({ kind: 'lucistnik' }));
    const k = B.S;
    const used = segs.map(() => []);
    // každý obránce na ochoz s nejvíc volného místa
    list.forEach((sl, i) => {
      let best = 0, bestFree = -1e9;
      segs.forEach((sg, si) => { const free = (sg[1] - sg[0]) - used[si].reduce((a, j) => a + widthOf(list[j]) * k, 0); if (free > bestFree) { bestFree = free; best = si; } });
      used[best].push(i);
    });
    const out = [];
    used.forEach((ids, si) => {
      if (!ids.length) return;
      const [x0, x1, y] = segs[si], len = x1 - x0;
      const tot = ids.reduce((a, j) => a + widthOf(list[j]) * k, 0);
      const sq = tot > len ? len / tot : 1;                       // když se nevejdou, trochu se stisknou
      const gap = Math.max(0, (len - tot * sq) / (ids.length + 1));
      let x = x0 + gap;
      ids.forEach(j => { const wj = widthOf(list[j]) * k * sq; out[j] = [x + wj / 2, y]; x += wj + gap; });
    });
    const X = lx => facing === 1 ? front - img.w + 2 + lx : front - 2 + (img.w - lx);
    const res = out.map(([lx, ly]) => [X(lx), groundY - img.h + ly]);
    // ochozy s obránci – před ně se pak kreslí cimbuří, aby obránci stáli ZA hradbou
    res.walls = segs.filter((sg, si) => used[si].length).map(([a, b, y]) => [Math.min(X(a), X(b)) - 6, Math.max(X(a), X(b)) + 6, groundY - img.h + y]);
    return res;
  }

  /* Kušiník: helma, kroužková zbroj a kuše */
  const P = window.ArtParts;
  P.weapon.crossbow = (ctx, L, pal, atk) => {
    const pull = atk >= 0 && atk < 0.6 ? 1 : 0;
    Art.limb(ctx, -2, -49, 8, -45, 5, Art.shade(pal.metal, -0.2));
    ctx.beginPath(); ctx.rect(2, -48.5, 26, 4.4); Art.fs(ctx, pal.wood || '#8a5a32', 1.4);
    ctx.beginPath(); ctx.moveTo(26, -58); ctx.quadraticCurveTo(31, -46.5, 26, -35); ctx.lineWidth = 4.2; ctx.strokeStyle = Art.OUT; ctx.stroke();
    ctx.lineWidth = 2.4; ctx.strokeStyle = pal.metal; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, -58); ctx.lineTo(pull ? 14 : 18, -46.5); ctx.lineTo(26, -35); ctx.lineWidth = 0.9; ctx.strokeStyle = '#e9e4d6'; ctx.stroke();
    if (pull) { ctx.beginPath(); ctx.moveTo(14, -46.5); ctx.lineTo(30, -46.5); ctx.lineWidth = 1.6; ctx.strokeStyle = '#d8c39a'; ctx.stroke(); }
    Art.limb(ctx, 1, -50, 20, -45, 5.2, pal.metal);
    Art.fist(ctx, 20, -45, pal.leather, 0);
  };
  const CROSS = { id: 'obrana_kusnik', look: { helmet: 'kettle', weapon: 'crossbow', shield: null, armor: 'mail', scale: 1 } };

  /* Katapult: dřevěný rám na kolech, rameno s miskou a koulí v barvě střely */
  function drawCatapult(ctx, x, y, dir, arm, el, s, loaded) {
    const E = GameData.catapultEl(el);
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    for (const wx of [-22, 22]) {
      ctx.beginPath(); ctx.arc(wx, -9, 9, 0, TAU); Art.fs(ctx, '#6b4528', 2);
      ctx.beginPath(); ctx.arc(wx, -9, 3, 0, TAU); Art.fs(ctx, '#9aa3b0', 1.2);
      ctx.strokeStyle = '#3a2414'; ctx.lineWidth = 1.4;
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 3, -9 + Math.sin(a) * 3); ctx.lineTo(wx + Math.cos(a) * 8, -9 + Math.sin(a) * 8); ctx.stroke(); }
    }
    ctx.beginPath(); ctx.rect(-30, -20, 60, 7); Art.fs(ctx, '#8a5a32', 2);
    ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-2, -46); ctx.lineTo(4, -46); ctx.lineTo(10, -20); ctx.closePath(); Art.fs(ctx, '#7a4c2a', 2);
    ctx.beginPath(); ctx.rect(-4, -50, 10, 6); Art.fs(ctx, '#5a3a1e', 1.6);
    const ang = -2.5 + arm * 1.9;
    ctx.save(); ctx.translate(1, -44); ctx.rotate(ang);
    ctx.beginPath(); ctx.rect(-3, -3, 46, 6); Art.fs(ctx, '#a8703e', 1.8);
    ctx.beginPath(); ctx.ellipse(46, -4, 9, 6, 0, 0, Math.PI); ctx.closePath(); Art.fs(ctx, '#5a3a1e', 1.6);
    if (loaded) {
      ctx.save(); ctx.shadowColor = E.color; ctx.shadowBlur = 12;
      const g = ctx.createRadialGradient(45, -10, 1, 46, -8, 8);
      g.addColorStop(0, E.glow); g.addColorStop(1, E.color);
      ctx.beginPath(); ctx.arc(46, -8, 7, 0, TAU); ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.rect(-16, -30, 12, 10); Art.fs(ctx, '#5d6470', 1.6);
    ctx.restore();
  }

  /* Obrana na hradě. def = GameData.defenseOf(...), anim = { shot: [čas posledního výstřelu po místech] } */
  function drawDefense(ctx, img, style, front, groundY, facing, t, def, faction, team, anim) {
    if (!def || !def.slots || !def.slots.length) return;
    const P2 = spots(img, style, front, groundY, facing, def.slots);
    const F = GameData.factions[faction] || GameData.factions.kralovstvi;
    const pal = Art.unitPalette(team || 'player', 'zakladni', F.id);
    const k = img.big ? img.big.S : 1;   // obránci ve stejném měřítku jako hrad
    def.slots.forEach((sl, i) => {
      if (!P2[i]) return;
      const [x, y] = P2[i];
      const since = anim && anim.shot ? t - (anim.shot[i] == null ? -99 : anim.shot[i]) : 99;
      if (sl.kind === 'katapult') {
        const arm = since < 0.25 ? since / 0.25 : since < 1.6 ? 1 - (since - 0.25) / 1.35 : 0;
        drawCatapult(ctx, x, y, facing, Math.max(0, arm), sl.el, 0.74 * k, since > 1.2);
      } else {
        const atk = since < 0.7 ? since / 0.7 : -1;
        const def2 = sl.kind === 'kuse' ? CROSS : GameData.units[F.roles.strelec];
        Art.drawUnit(ctx, def2, pal, { x, y, facing, t, atk, scaleMul: 0.72 * k, noShadow: true });
      }
    });
    // cimbuří před obránci: kola katapultů a nohy střelců jsou schované za hradbou
    const cp = img.pal || {};
    const wood = style === 'sever';
    const st = wood ? '#8a5a32' : (cp.stone || '#a3a9b2'), stL = wood ? '#a8703e' : (cp.stoneLight || '#c7ccd3');
    (P2.walls || []).forEach(([x0, x1, y]) => {
      const size = 13 * k, step = 20 * k;
      for (let x = x0; x < x1 - 4; x += step) { ctx.beginPath(); ctx.rect(x, y - size, step * 0.62, size + 2); Art.fs(ctx, stL, 1.8); }
      ctx.beginPath(); ctx.rect(x0 - 2, y - 2, x1 - x0 + 4, 9 * k); Art.fs(ctx, st, 1.8);
    });
  }

  /* Střela katapultu */
  function drawCatShot(ctx, x, y, el, t) {
    const E = GameData.catapultEl(el);
    ctx.save();
    ctx.shadowColor = E.color; ctx.shadowBlur = 16;
    const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 11);
    g.addColorStop(0, E.glow); g.addColorStop(1, E.color);
    ctx.beginPath(); ctx.arc(x, y, 10 + Math.sin(t * 25), 0, TAU); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }

  Object.assign(Art, { drawCatapult, drawDefense, drawCatShot, defenseSpots: spots });
})();
