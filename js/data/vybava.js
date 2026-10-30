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
    { tier: 1, name: 'Ocelová zbroj', desc: 'Leštěná ocel s plátovými nárameníky.', bonus: { hp: 0.18, armor: 0.04 }, price: { gems: 140 },
      look: { metal: '#eef3fa', metalDark: '#7d8ea8', trim: '#9fc4ff' }, feat: { pauldron: 'plate' } },
    { tier: 2, name: 'Stínová zbroj', desc: 'Černá ocel, ostnaté nárameníky, roztrhaný plášť a rohatá přilba.', bonus: { hp: 0.25, armor: 0.07 }, price: { czk: 59 },
      look: { metal: '#4d4857', metalDark: '#29252f', trim: '#c4262e', cape: '#5a1014', plume: '#c4262e' }, ornament: 'horns', feat: { pauldron: 'spiky', cape: 'tattered', capeColor: '#3a0a10', aura: 'shadow', chest: 'skull' } },
    { tier: 3, name: 'Zbroj krále', desc: 'Zlacená plátová zbroj, nárameníky s rubíny, karmínový plášť s hermelínem, zlatý lev na hrudi a bílozlatý chochol.', bonus: { hp: 0.35, armor: 0.1 }, price: { czk: 99 },
      look: { metal: '#f0cf6a', metalDark: '#9a6e1c', trim: '#fff1b8', cape: '#7a0f1e', plume: '#ffffff', tunic: '#7a0f1e', tunicDark: '#4a0812' },
      feat: { cape: 'ermine', capeColor: '#7a0f1e', collar: 'ermine', chest: 'lion', emblemColor: '#ffe08a', pauldron: 'gold', gem: '#d6243a', crest: 'royalplume', plumeColor: '#ffffff', trim: '#ffe08a' } }
  ]
};

/* Všechny předměty: 4 role × 2 sloty × 4 úrovně */
GameData.gear = [];
['pech', 'strelec', 'kopi', 'tezka', 'jizda', 'mag', 'velitel'].forEach(role => {
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
const ALLROLES = ['pech', 'strelec', 'kopi', 'tezka', 'jizda', 'mag', 'velitel'];
GameData.offers = [
  { id: 'start', name: 'Startovní balíček', desc: 'Nejvýhodnější začátek: 15 000 zlata, 1 500 drahokamů, epická zbroj pro těžké jednotky a skin Lesní hraničáři s tesákem pro pěchotu všech národů.', czk: 29, limit: 1, badge: '×30 hodnota',
    give: { gold: 15000, gems: 1500, gift: [{ role: 'pech', a: 'lesni' }, { role: 'pech', w: 'w_tesak' }, { role: 'tezka', ar: 'Epický' }] }, art: 'chest' },
  { id: 'mesec', name: 'Měšec zlata', desc: '20 000 zlata na vylepšení hradu.', czk: 29, give: { gold: 20000 }, art: 'gold' },
  { id: 'hrst', name: 'Hrst drahokamů', desc: '800 drahokamů na skiny a útoky – skoro dvakrát víc než běžný balíček.', czk: 29, limit: 1, badge: 'Jen jednou', give: { gems: 800 }, art: 'gems' },
  { id: 'kovar', name: 'Balíček kováře', desc: 'Dva epické nebo legendární skiny zbraní, které ještě nemáš, k tomu 6 000 zlata a 300 drahokamů.', czk: 29, give: { gold: 6000, gems: 300, random: { kind: 'w', count: 2, odds: [0, 0, 0.6, 0.4] } }, art: 'weapon' },
  { id: 'zbrojir', name: 'Balíček zbrojíře', desc: 'Epická zbroj pro těžké jednotky i pěchotu všech národů a 8 000 zlata.', czk: 29, limit: 1, give: { gold: 8000, gift: [{ role: 'tezka', ar: 'Epický' }, { role: 'pech', ar: 'Epický' }] }, art: 'armor' },
  { id: 'lucist', name: 'Balíček lučištníka', desc: 'Dračí luk a epická zbroj pro všechny střelce a 600 drahokamů.', czk: 29, limit: 1, give: { gems: 600, gift: [{ role: 'strelec', w: 'l_drak' }, { role: 'strelec', ar: 'Epický' }] }, art: 'weapon' },
  { id: 'valecny', name: 'Válečný balíček', desc: '15 000 zlata a 700 drahokamů na další tažení.', czk: 29, give: { gold: 15000, gems: 700 }, art: 'chest' },
  { id: 'hraniceri', name: 'Balíček hraničářů', desc: 'Tři skiny pro pěchotu: Lesní hraničáři, Půlnoční hlídka a Stínová legie + 500 drahokamů.', czk: 29, limit: 1, give: { gift: [{ role: 'pech', a: 'lesni' }, { role: 'pech', a: 'pulnoc' }, { role: 'pech', a: 'stinovy' }], gems: 500 }, art: 'skin' },
  { id: 'hradni', name: 'Hradní balíček', desc: 'Pochodně, velké prapory a erbovní štíty na hrad a 12 000 zlata.', czk: 29, limit: 1, give: { gold: 12000, decor: ['pochodne', 'prapory', 'stity'] }, art: 'castle' },
  { id: 'kopinik', name: 'Balíček kopiníků', desc: 'Epická zbroj a dračí kopí pro kopiníky a 6 000 zlata.', czk: 29, limit: 1, give: { gold: 6000, gift: [{ role: 'kopi', ar: 'Epický' }, { role: 'kopi', w: 'k_drak' }] }, art: 'armor' },
  { id: 'hrdina', name: 'Balíček hrdiny', desc: 'Legendární Hvězdná čepel a legendární zbroj pro těžké jednotky, 20 000 zlata a 1 500 drahokamů.', czk: 59, limit: 1, badge: 'Legendární', give: { gems: 1500, gold: 20000, gift: [{ role: 'tezka', w: 'w_hvezda' }, { role: 'tezka', ar: 'Legendární' }] }, art: 'weapon' },
  { id: 'drak', name: 'Dračí pán', desc: 'Tři nejničivější útoky – Dračí dech, Obří meteor a Ohnivá zeď – k tomu 25 000 zlata a 2 500 drahokamů.', czk: 99, limit: 1, badge: '3 útoky', give: { skills: ['drak', 'meteor', 'zed'], gold: 25000, gems: 2500 }, art: 'crown' },
  { id: 'pevnost', name: 'Velká pevnost', desc: 'Velký hrad (až 10 obránců na hradbách, +25 % životů hradu), Kamenní strážci a Ohně na hradbách, 30 000 zlata a 3 000 drahokamů.', czk: 149, limit: 1, badge: 'Až 10 obránců', give: { bigCastle: true, decor: ['sochy', 'ohne'], gold: 30000, gems: 3000 }, art: 'castle' },
  { id: 'kral', name: 'Královský balíček', desc: 'Legendární zbroj a Meč krále pro těžké jednotky, legendární zbroj pěchoty a Hvězdný luk, 50 000 zlata a 5 000 drahokamů.', czk: 149, limit: 1, badge: 'Legendární', give: { gold: 50000, gems: 5000, gift: [{ role: 'tezka', ar: 'Legendární' }, { role: 'tezka', w: 'w_zlato' }, { role: 'pech', ar: 'Legendární' }, { role: 'strelec', w: 'l_hvezdny' }] }, art: 'crown' },
  { id: 'kniha', name: 'Kniha všech útoků', desc: 'Odemkne naráz všechny speciální útoky ve hře a přidá 3 000 drahokamů.', czk: 149, limit: 1, badge: 'Všechny útoky', give: { skills: 'all', gems: 3000 }, art: 'gems' },
  { id: 'legie', name: 'Legendární legie', desc: 'Legendární zbroj pro všechny vojáky všech národů – 21 jednotek naráz! K tomu 40 000 zlata a 4 000 drahokamů.', czk: 199, limit: 1, badge: '21 vojáků', give: { gold: 40000, gems: 4000, gift: ALLROLES.map(role => ({ role, ar: 'Legendární' })) }, art: 'armor' },
  { id: 'arzenal', name: 'Arzenál legend', desc: 'Legendární zbraň pro každého vojáka všech národů a 5 000 drahokamů.', czk: 199, limit: 1, badge: '21 zbraní', give: { gems: 5000, gift: ALLROLES.map(role => ({ role, wr: 'Legendární' })) }, art: 'weapon' },
  { id: 'cisar', name: 'Císařský poklad', desc: 'Úplně všechno: Velká pevnost, všechny dekorace hradu, všechny útoky, legendární zbroj i zbraň pro všech 21 vojáků, 150 000 zlata a 20 000 drahokamů.', czk: 499, limit: 1, badge: 'MEGA ×50', give: { bigCastle: true, allDecor: true, skills: 'all', gold: 150000, gems: 20000, gift: ALLROLES.map(role => ({ role, ar: 'Legendární', wr: 'Legendární' })) }, art: 'crown' }
];

/* ---- Truhly za drahokamy (herní měna, ne přímo skutečné peníze; šance jsou zveřejněné) ---- */
GameData.chests = {
  denni: { id: 'denni', name: 'Denní truhla', gemsPrice: 145, period: 'day', desc: 'Jednou denně.',
    gold: [2500, 4500], gems: [0, 0], gearChance: 0.7, tierOdds: [0.3, 0.45, 0.2, 0.05] },  /* gearChance = šance na skin */
  tydenni: { id: 'tydenni', name: 'Týdenní truhla', gemsPrice: 720, period: 'week', desc: 'Jednou týdně. Vždy obsahuje 3 skiny zbraní nebo zbroje.',
    gold: [14000, 22000], gems: [0, 0], gearChance: 1, gearCount: 3, tierOdds: [0, 0.4, 0.4, 0.2] }
};

/* ---- Drahokamy za skutečné peníze ---- */
GameData.gemPacks = [
  { id: 'g1', gems: 450, czk: 29 },
  { id: 'g2', gems: 2000, czk: 99, badge: '+30 %' },
  { id: 'g3', gems: 5500, czk: 249, badge: '+40 %' },
  { id: 'g4', gems: 13000, czk: 499, badge: '+65 %' },
  { id: 'g5', gems: 30000, czk: 999, badge: '+90 %' }
];

/* ---------------------------------------------------------------------
   VÝPOČTY: výbava + skin → bonusy a vzhled vojáka
   --------------------------------------------------------------------- */
GameData.gearHelpers = {
  equipped(save, role) {
    const e = (save.gear && save.gear.eq && save.gear.eq[role]) || {};
    return { weapon: e.weapon ? GameData.gearById(e.weapon) : null, armor: e.armor ? GameData.gearById(e.armor) : null };
  },
  /* Celkové bonusy jednotky (hp, dmg, armor, crit): skin zbroje + skin zbraně této jednotky.
     (Stará výbava ze Zbrojnice se převedla na skiny – viz skiny_nove.js.) */
  bonus(save, unitId) {
    const b = { hp: 0, dmg: 0, armor: 0, crit: 0 };
    const add = x => { if (!x) return; for (const k in x) b[k] = (b[k] || 0) + x[k]; };
    const O = GameData.skinOwn;
    const sid = save.skins.unit[unitId] || 'zakladni';
    const sk = GameData.unitSkins.find(s => s.id === sid);
    if (sk && GameData.skinFits(sk, unitId) && (!O || O.has(save, unitId, sid))) add(sk.bonus);
    const ws = (save.skins.weapon || {})[unitId];
    if (ws && GameData.weaponSkinById && (!O || O.hasW(save, unitId, ws))) { const W = GameData.weaponSkinById(ws); if (GameData.weaponSkinFits(W, unitId)) add(W.bonus); }
    return b;
  },
  /* Úpravy vzhledu: model zbraně ze skinu zbraně, přilba a štít ze skinu zbroje */
  look(save, unitId) {
    const def = GameData.units[unitId];
    const pal = {}, look = {};
    let key = '';
    const cat = window.Art && Art.weaponCat ? Art.weaponCat(def.look.weapon) : null;
    const sid = save.skins.unit[unitId] || 'zakladni';
    const sk = GameData.unitSkins.find(s => s.id === sid);
    if (sk && sk.look && GameData.skinFits(sk, unitId)) {
      const P = window.ArtParts || {};
      if (sk.look.helmet) { look.helmet = sk.look.helmet; key += 'h' + sk.look.helmet; }
      // štít jen jednotkám, které štít nosí
      if (sk.look.shield && def.look.shield) { look.shield = sk.look.shield; key += 's' + sk.look.shield; }
      void P;
    }
    const ws = (save.skins.weapon || {})[unitId];
    if (ws && ws !== 'w_zakladni' && GameData.weaponSkinById) {
      const W = GameData.weaponSkinById(ws);
      if (W.model && (W.cat === cat) && GameData.weaponSkinFits(W, unitId)) { pal.wmodel = W.model; key += 'ws' + ws; }
    }
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
    const sf = p.feat;
    if (lk) { Object.assign(p, lk.pal); if (lk.pal.feat) p.feat = Object.assign({}, sf || {}, lk.pal.feat); }
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
