/* =========================================================================
   VÝBAVA, SKINY S BONUSY A NABÍDKY OBCHODU
   - Zbraně a brnění: kupují se pro roli vojáka (pěchota, střelci, kopiníci,
     těžká jednotka) a platí pro tuto roli u všech národů. Mění vzhled
     vojáka i na bojišti a přidávají bonusy.
   - Skiny vojáků přidávají malé bonusy (viz bonus).
   - Nabídky za skutečné peníze (cena v Kč) jdou přes Platby (js/core/platby.js).
   Rarita: 0 běžná, 1 vzácná, 2 epická, 3 legendární
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.roleNames = { pech: 'Pěchota', strelec: 'Střelci', kopi: 'Kopiníci', tezka: 'Těžká jednotka' };

/* ---- Úrovně zbraní a brnění (vzhled + bonus) ---- */
GameData.gearTiers = {
  weapon: [
    { tier: 0, name: 'Kalená ocel', desc: 'Lépe kalená čepel a hrot.', bonus: { dmg: 0.08 }, price: { gold: 900 },
      look: { metal: '#e8edf4' } },
    { tier: 1, name: 'Runová zbraň', desc: 'Runy na čepeli modře září.', bonus: { dmg: 0.15 }, price: { gems: 120 },
      look: { glow: '#7fc8ff' } },
    { tier: 2, name: 'Dračí oheň', desc: 'Čepel kovaná v dračím ohni. Plane oranžově.', bonus: { dmg: 0.22, crit: 0.1 }, price: { czk: 59 },
      look: { glow: '#ff8a3a' }, upgrade: true },
    { tier: 3, name: 'Hvězdná ocel', desc: 'Legendární zbraň ze spadlé hvězdy. Září zlatem.', bonus: { dmg: 0.3, crit: 0.15 }, price: { czk: 99 },
      look: { glow: '#ffe28a' }, upgrade: true }
  ],
  armor: [
    { tier: 0, name: 'Kroužková vesta', desc: 'Pevná kroužková vesta pod tunikou.', bonus: { hp: 0.1 }, price: { gold: 900 },
      look: { metal: '#dfe5ee', metalDark: '#8b96a6' } },
    { tier: 1, name: 'Ocelová zbroj', desc: 'Leštěná ocel s modrým lemem.', bonus: { hp: 0.18, armor: 0.04 }, price: { gems: 140 },
      look: { metal: '#eef3fa', metalDark: '#7d8ea8', trim: '#9fc4ff' } },
    { tier: 2, name: 'Stínová zbroj', desc: 'Černá ocel s rohatou přilbou a pláštěm.', bonus: { hp: 0.25, armor: 0.07 }, price: { czk: 59 },
      look: { metal: '#4d4857', metalDark: '#29252f', trim: '#c4262e', cape: '#5a1014', plume: '#c4262e' }, ornament: 'horns', cape: true },
    { tier: 3, name: 'Zbroj krále', desc: 'Zlatá zbroj s korunou a královským pláštěm.', bonus: { hp: 0.35, armor: 0.1 }, price: { czk: 99 },
      look: { metal: '#e8c45c', metalDark: '#a47a24', trim: '#fff1b8', cape: '#7a1414', plume: '#ffffff' }, ornament: 'crown', cape: true }
  ]
};

/* Všechny předměty: 4 role × 2 sloty × 4 úrovně */
GameData.gear = [];
['pech', 'strelec', 'kopi', 'tezka'].forEach(role => {
  ['weapon', 'armor'].forEach(slot => {
    GameData.gearTiers[slot].forEach(T => GameData.gear.push(Object.assign({ id: `${slot}_${role}_${T.tier}`, slot, role }, T)));
  });
});
GameData.gearById = id => GameData.gear.find(g => g.id === id);

/* ---- Bonusy skinů (skin = vzhled + malý bonus pro jednotku, která ho nosí) ---- */
const SKIN_BONUS = {
  lesni: { hp: 0.05 }, pulnoc: { dmg: 0.05 }, stinovy: { dmg: 0.07 }, rudy_drak: { dmg: 0.09 },
  zlaty: { hp: 0.08, dmg: 0.04 }, ledovy: { armor: 0.06 }, smaragd: { hp: 0.1, dmg: 0.05 }
};
GameData.unitSkins.forEach(s => { if (SKIN_BONUS[s.id]) s.bonus = SKIN_BONUS[s.id]; });
/* Prémiové skiny za skutečné peníze */
GameData.unitSkins.push(
  { id: 'krvavy', name: 'Krvavý měsíc', rarity: 'Epický', price: 0, czk: 59, bonus: { dmg: 0.1 }, desc: 'Rudočerná zbroj pod krvavým měsícem.',
    palette: { tunic: '#5a0e14', tunicDark: '#33070b', trim: '#ff5a4a', metal: '#3a2a2e', metalDark: '#1a1214', cape: '#3a060a', plume: '#ff3a2a', eyes: '#ff3b30' },
    ornament: 'horns', glow: '#ff4a3a' },
  { id: 'nebesky', name: 'Nebeský strážce', rarity: 'Legendární', price: 0, czk: 99, bonus: { hp: 0.12, dmg: 0.06, armor: 0.04 }, desc: 'Bílé zlato a zářící křídla na přilbě.',
    palette: { tunic: '#e9f2ff', tunicDark: '#b8c8e0', trim: '#7fd3ff', metal: '#f4f8ff', metalDark: '#9fb4d0', cape: '#cfe4ff', plume: '#7fd3ff' },
    ornament: 'crystal', glow: '#bfe8ff' }
);

/* ---- Nabídky za 29 Kč a další balíčky ----
   give: { gold, gems, gear: [id], skins: [id], decor: [id], randomGear: { minTier } }
   limit: kolikrát jde koupit (null = bez omezení) */
GameData.offers = [
  { id: 'start', name: 'Startovní balíček', desc: 'Nejvýhodnější začátek: zlato, drahokamy a lepší zbraň pro pěchotu.', czk: 29, limit: 1, badge: '×10 hodnota',
    give: { gold: 1500, gems: 120, gear: ['weapon_pech_1'] }, art: 'chest' },
  { id: 'mesec', name: 'Měšec zlata', desc: 'Zlato na vylepšení hradu.', czk: 29, give: { gold: 2500 }, art: 'gold' },
  { id: 'hrst', name: 'Hrst drahokamů', desc: 'Drahokamy na skiny a výbavu.', czk: 29, give: { gems: 150 }, art: 'gems' },
  { id: 'kovar', name: 'Balíček kováře', desc: 'Náhodná vzácná nebo lepší zbraň a zlato.', czk: 29, give: { gold: 500, randomGear: { slot: 'weapon', minTier: 1 } }, art: 'weapon' },
  { id: 'zbrojir', name: 'Balíček zbrojíře', desc: 'Ocelová zbroj pro těžkou jednotku a zlato.', czk: 29, limit: 1, give: { gold: 500, gear: ['armor_tezka_1'] }, art: 'armor' },
  { id: 'lucist', name: 'Balíček lučištníka', desc: 'Runová zbraň pro střelce a drahokamy.', czk: 29, limit: 1, give: { gems: 60, gear: ['weapon_strelec_1'] }, art: 'weapon' },
  { id: 'valecny', name: 'Válečný balíček', desc: 'Zlato i drahokamy na další tažení.', czk: 29, give: { gold: 1500, gems: 70 }, art: 'chest' },
  { id: 'hraniceri', name: 'Balíček hraničářů', desc: 'Dva skiny vojáků: Lesní hraničáři a Půlnoční hlídka.', czk: 29, limit: 1, give: { skins: ['lesni', 'pulnoc'] }, art: 'skin' },
  { id: 'hradni', name: 'Hradní balíček', desc: 'Pochodně a velké prapory na hrad a zlato.', czk: 29, limit: 1, give: { gold: 800, decor: ['pochodne', 'prapory'] }, art: 'castle' },
  { id: 'kopinik', name: 'Balíček kopiníků', desc: 'Ocelová zbroj a runová zbraň pro kopiníky.', czk: 29, limit: 1, give: { gear: ['armor_kopi_1', 'weapon_kopi_1'] }, art: 'armor' },
  { id: 'hrdina', name: 'Balíček hrdiny', desc: 'Dračí oheň pro těžkou jednotku a drahokamy.', czk: 59, limit: 1, badge: 'Epická zbraň', give: { gems: 100, gear: ['weapon_tezka_2'] }, art: 'weapon' },
  { id: 'pevnost', name: 'Velká pevnost', desc: 'Větší hrad s donjonem: až 10 obránců na hradbách (na max. Strážní věži), +25 % životů hradu.', czk: 149, limit: 1, badge: 'Až 10 obránců', give: { bigCastle: true }, art: 'castle' },
  { id: 'kral', name: 'Královský balíček', desc: 'Zbroj krále pro těžkou jednotku, 5 000 zlata a 400 drahokamů.', czk: 149, limit: 1, badge: 'Legendární', give: { gold: 5000, gems: 400, gear: ['armor_tezka_3'] }, art: 'crown' }
];

/* ---- Truhly za skutečné peníze (obsah je náhodný, šance jsou zveřejněné) ---- */
GameData.chests = {
  denni: { id: 'denni', name: 'Denní truhla', czk: 29, period: 'day', desc: 'Jednou denně.',
    gold: [400, 900], gems: [25, 70], gearChance: 0.35, tierOdds: [0.6, 0.3, 0.08, 0.02] },
  tydenni: { id: 'tydenni', name: 'Týdenní truhla', czk: 99, period: 'week', desc: 'Jednou týdně. Vždy obsahuje zbraň nebo brnění.',
    gold: [3000, 6000], gems: [180, 350], gearChance: 1, gearCount: 2, tierOdds: [0, 0.55, 0.35, 0.1] }
};

/* ---- Drahokamy za skutečné peníze ---- */
GameData.gemPacks = [
  { id: 'g1', gems: 150, czk: 29 },
  { id: 'g2', gems: 550, czk: 99, badge: '+10 %' },
  { id: 'g3', gems: 1500, czk: 249, badge: '+20 %' },
  { id: 'g4', gems: 3300, czk: 499, badge: '+30 %' }
];

/* ---------------------------------------------------------------------
   VÝPOČTY: výbava + skin → bonusy a vzhled vojáka
   --------------------------------------------------------------------- */
GameData.gearHelpers = {
  equipped(save, role) {
    const e = (save.gear && save.gear.eq && save.gear.eq[role]) || {};
    return { weapon: e.weapon ? GameData.gearById(e.weapon) : null, armor: e.armor ? GameData.gearById(e.armor) : null };
  },
  /* Celkové bonusy jednotky (hp, dmg, armor, crit) */
  bonus(save, unitId) {
    const def = GameData.units[unitId];
    const b = { hp: 0, dmg: 0, armor: 0, crit: 0 };
    const add = x => { if (!x) return; for (const k in x) b[k] = (b[k] || 0) + x[k]; };
    const E = this.equipped(save, def.roleKey);
    add(E.weapon && E.weapon.bonus); add(E.armor && E.armor.bonus);
    const sk = GameData.unitSkins.find(s => s.id === (save.skins.unit[unitId] || 'zakladni'));
    if (sk && GameData.skinFits(sk, unitId)) add(sk.bonus);
    const ws = (save.skins.weapon || {})[unitId];
    if (ws && GameData.weaponSkinById) add(GameData.weaponSkinById(ws).bonus);
    return b;
  },
  /* Úpravy vzhledu: barvy (paleta), ozdoba, plášť, delší zbraň */
  look(save, unitId) {
    const def = GameData.units[unitId];
    const E = this.equipped(save, def.roleKey);
    const pal = {}, look = {};
    let key = '';
    if (E.armor) { Object.assign(pal, E.armor.look); if (E.armor.ornament) pal.ornament = E.armor.ornament; if (E.armor.cape && !def.look.cape) { look.cape = true; look.capeColor = E.armor.look.cape; } key += 'a' + E.armor.tier; }
    if (E.weapon) {
      if (E.weapon.look.glow) pal.glow = E.weapon.look.glow;
      if (E.weapon.look.metal && !E.armor) pal.metal = E.weapon.look.metal;
      if (E.weapon.upgrade && def.look.weapon === 'sword') look.weapon = 'longsword';
      key += 'w' + E.weapon.tier;
    }
    const ws = (save.skins.weapon || {})[unitId];
    if (ws && ws !== 'w_zakladni' && GameData.weaponSkinById) { pal.wpn = GameData.weaponSkinById(ws).wpal; key += 'ws' + ws; }
    return { pal, look, key };
  },
  /* Upravená definice pro kreslení (statistiky zůstávají v původní) */
  drawDef(def, lk) {
    if (!lk || !Object.keys(lk.look).length) return def;
    this._cache = this._cache || {};
    const id = def.id + '#' + lk.key;
    return this._cache[id] || (this._cache[id] = Object.assign({}, def, { id, look: Object.assign({}, def.look, lk.look) }));
  },
  palette(team, skinId, faction, lk) {
    const p = Art.unitPalette(team, skinId, faction);
    if (lk) { Object.assign(p, lk.pal); }
    return p;
  },
  rarityName: ['Běžná', 'Vzácná', 'Epická', 'Legendární'],
  rarityColor: ['#c9ced6', '#5aa9ff', '#c07cff', '#ffcf4a']
};

/* ---- Profilové obrázky: lidé i mýtické bytosti ---- */
GameData.avatars = [
  { id: 'rytir', unit: 'rytir', name: 'Rytíř', bg: ['#4f8fe8', '#122a5a'] },
  { id: 'paladin', unit: 'rytir', skin: 'zlaty', name: 'Paladin', bg: ['#ffe9a0', '#7a5410'] },
  { id: 'lucistnik', unit: 'lucistnik', name: 'Lučištnice', bg: ['#7fc06a', '#1d4a20'] },
  { id: 'pesak', unit: 'pesak', name: 'Strážný', bg: ['#9aa3b0', '#2a2f3a'] },
  { id: 'samuraj', unit: 'samuraj', name: 'Samuraj', bg: ['#ff8a7a', '#5a0e0a'] },
  { id: 'asigaru', unit: 'asigaru', name: 'Ašigaru', bg: ['#f4b3c8', '#5a2a40'] },
  { id: 'berserk', unit: 'berserk', name: 'Berserk', bg: ['#c9a07a', '#3a2414'] },
  { id: 'lovec', unit: 'lovec', name: 'Lovec', bg: ['#9fd0ff', '#173a5a'] },
  { id: 'ledovy', unit: 'rytir', skin: 'ledovy', name: 'Ledový rytíř', bg: ['#e6f8ff', '#245890'] },
  { id: 'stin', unit: 'pesak', skin: 'stinovy', name: 'Stínový válečník', bg: ['#8a6aa8', '#120a1a'] },
  { id: 'bes', unit: 'bes', name: 'Běs', bg: ['#ff9a4a', '#3a0a06'] },
  { id: 'chrlic', unit: 'chrlic', name: 'Okřídlený chrlič', bg: ['#ffcf6a', '#5a1410'] },
  { id: 'rohac', unit: 'rohac', name: 'Rohatý strážce', bg: ['#e15a4f', '#2a0606'] },
  { id: 'zatracenec', unit: 'zatracenec', name: 'Zatracený rytíř', bg: ['#ff6a3a', '#120404'] },
  { id: 'demonkral', unit: 'demonkral', name: 'Pekelný generál', bg: ['#ff3a2a', '#1a0202'] },
  { id: 'smaragd', unit: 'samuraj', skin: 'smaragd', name: 'Smaragdový duch', bg: ['#7ee0a8', '#0e3a24'] }
];
