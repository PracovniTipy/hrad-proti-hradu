/* =========================================================================
   SKINY NÁRODŮ: velitel, lučištník, mečník a velitel na koni
   + SKINY ZBRANÍ (meče, sekery, katany, luky, kopí)
   Každý národ (rytíři, samurajové, vikingové) má vlastní skiny pro:
     velitele (těžká jednotka), luk (střelec), meč (pěchota) a velitele na koni.
   only   – skin jde nasadit jen těmto jednotkám
   mount  – velitel jede na koni (barva srsti, hřívy a čabraky)
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.unitSkins.push(
  /* ---------- RYTÍŘI ---------- */
  { id: 'r_velitel', only: ['rytir'], name: 'Velitel Lví gardy', rarity: 'Epický', price: 280, bonus: { hp: 0.08, dmg: 0.06 },
    desc: 'Rudozlatá plátová zbroj a koruna velitele královské gardy.',
    en: { name: 'Lion Guard Commander', desc: 'Red-gold plate armor and the crown of the royal guard commander.' },
    palette: { tunic: '#9c1c22', tunicDark: '#5e0f13', trim: '#ffd77a', metal: '#e8c45c', metalDark: '#9a6e1c', cape: '#7a1218', plume: '#fff3c4' }, ornament: 'crown', glow: '#ffe28a' },
  { id: 'r_luk', only: ['lucistnik'], name: 'Královský lukostřelec', rarity: 'Vzácný', price: 160, bonus: { dmg: 0.07 },
    desc: 'Bílá tunika se zlatým lemem a luk z tisu.',
    en: { name: 'Royal Longbowman', desc: 'White tunic with gold trim and a yew bow.' },
    palette: { tunic: '#f1ede2', tunicDark: '#c9c1ad', trim: '#e0a83a', leather: '#8a5a32', cape: '#2f62b8', plume: '#2f62b8' } },
  { id: 'r_mec', only: ['pesak'], name: 'Mečník z Avalonu', rarity: 'Epický', price: 0, czk: 49, bonus: { hp: 0.06, dmg: 0.06 },
    desc: 'Stříbrná zbroj s tyrkysovým pláštěm a zářící čepelí.',
    en: { name: 'Swordsman of Avalon', desc: 'Silver armor, a turquoise cloak and a shining blade.' },
    palette: { tunic: '#1f8a8a', tunicDark: '#135a5a', trim: '#e6f6ff', metal: '#eef3fa', metalDark: '#8b9db0', cape: '#2ab0a8', plume: '#bff7ef' }, glow: '#9ff7ec' },
  { id: 'r_kun', only: ['rytir'], mount: { coat: '#f2efe8', coatDark: '#c9c2b4', mane: '#d9d2c4', barding: '#2f62b8', bardingTrim: '#ffd77a' },
    name: 'Rytíř na bělouši', rarity: 'Legendární', price: 0, czk: 99, bonus: { hp: 0.12, dmg: 0.08 },
    desc: 'Velitel na bílém koni v modrozlaté čabrace. Nejvznešenější pohled na bojišti.',
    en: { name: 'Knight on a White Steed', desc: 'The commander on a white horse in a blue-gold caparison.' },
    palette: { metal: '#eef3fa', metalDark: '#8b96a6', trim: '#ffd77a', cape: '#234a9c', plume: '#ffffff' }, ornament: 'crown' },

  /* ---------- SAMURAJOVÉ ---------- */
  { id: 's_velitel', only: ['samuraj'], name: 'Šógunův generál', rarity: 'Epický', price: 280, bonus: { hp: 0.08, dmg: 0.06 },
    desc: 'Černozlatá lakovaná zbroj a rohy na přilbě kabuto.',
    en: { name: 'Shogun’s General', desc: 'Black-gold lacquered armor and horns on the kabuto helmet.' },
    palette: { tunic: '#1e1a1c', tunicDark: '#0e0c0d', trim: '#e8b84a', metal: '#2a2528', metalDark: '#141113', cape: '#8a1414', plume: '#e8b84a' }, ornament: 'horns', glow: '#ffcf6a' },
  { id: 's_luk', only: ['jumi'], name: 'Lukostřelkyně sakury', rarity: 'Vzácný', price: 160, bonus: { dmg: 0.07 },
    desc: 'Růžová zbroj a luk zdobený květy sakury.',
    en: { name: 'Sakura Archer', desc: 'Pink armor and a bow decorated with cherry blossoms.' },
    palette: { tunic: '#e87aa0', tunicDark: '#b0466c', trim: '#fff0f5', metal: '#f4d6e2', metalDark: '#b0809a', cape: '#f4b3c8', plume: '#ffd6e6' } },
  { id: 's_mec', only: ['asigaru'], name: 'Stráž nefritového chrámu', rarity: 'Epický', price: 0, czk: 49, bonus: { hp: 0.06, dmg: 0.06 },
    desc: 'Nefritově zelená zbroj a katana, která září jako měsíc.',
    en: { name: 'Jade Temple Guard', desc: 'Jade-green armor and a katana that glows like the moon.' },
    palette: { tunic: '#2a8a5a', tunicDark: '#16593a', trim: '#e6d38a', metal: '#cfe8da', metalDark: '#6a9a80', cape: '#3aa874', plume: '#e6d38a' }, glow: '#c8ffe0' },
  { id: 's_kun', only: ['samuraj'], mount: { coat: '#2a2420', coatDark: '#16120f', mane: '#0e0b09', barding: '#a8262a', bardingTrim: '#e8b84a' },
    name: 'Samuraj na vraníkovi', rarity: 'Legendární', price: 0, czk: 99, bonus: { hp: 0.12, dmg: 0.08 },
    desc: 'Generál na černém válečném koni v rudé čabrace se zlatým lemem.',
    en: { name: 'Samurai on a Black Charger', desc: 'The general on a black war horse in a red, gold-trimmed caparison.' },
    palette: { trim: '#e8b84a', metal: '#2a2528', metalDark: '#141113', cape: '#8a1414', plume: '#e8b84a' }, ornament: 'horns' },

  /* ---------- VIKINGOVÉ ---------- */
  { id: 'v_velitel', only: ['berserk'], name: 'Vlčí jarl', rarity: 'Epický', price: 280, bonus: { hp: 0.1, dmg: 0.05 },
    desc: 'Šedá vlčí kožešina, válečné barvy a zlaté nátepníky jarla.',
    en: { name: 'Wolf Jarl', desc: 'Grey wolf fur, war paint and the jarl’s golden bracers.' },
    palette: { tunic: '#5a6270', tunicDark: '#363c46', trim: '#e8b84a', metal: '#d9dee6', metalDark: '#7d8694', cape: '#6b7380', hair: '#c9a06a' }, ornament: 'crown' },
  { id: 'v_luk', only: ['lovec'], name: 'Lovec polární záře', rarity: 'Vzácný', price: 160, bonus: { dmg: 0.07 },
    desc: 'Tyrkysová kožešina a luk, který září barvami polární záře.',
    en: { name: 'Aurora Hunter', desc: 'Turquoise fur and a bow glowing with the colors of the aurora.' },
    palette: { tunic: '#1f6a7a', tunicDark: '#12434d', trim: '#9dffd0', leather: '#3a5a6a', cape: '#2a8a9a', plume: '#9dffd0' }, glow: '#7dffc8' },
  { id: 'v_mec', only: ['valecnik'], name: 'Bouřný válečník', rarity: 'Epický', price: 0, czk: 49, bonus: { hp: 0.06, dmg: 0.06 },
    desc: 'Ocelově modrá zbroj a sekera nabitá bleskem.',
    en: { name: 'Storm Warrior', desc: 'Steel-blue armor and an axe charged with lightning.' },
    palette: { tunic: '#2a4a8a', tunicDark: '#182e5a', trim: '#cfe6ff', metal: '#dbe8ff', metalDark: '#6a84b0', cape: '#3a62b0', plume: '#ffe14a' }, glow: '#fff3a0' },
  { id: 'v_kun', only: ['berserk'], mount: { coat: '#8a5a32', coatDark: '#5a3a1e', mane: '#2e2018', barding: '#3a5a8a', bardingTrim: '#d9dee6' },
    name: 'Jarl na hnědákovi', rarity: 'Legendární', price: 0, czk: 99, bonus: { hp: 0.12, dmg: 0.08 },
    desc: 'Jarl na silném severském hnědákovi s modrou houní.',
    en: { name: 'Jarl on a Bay Horse', desc: 'The jarl on a strong northern bay horse with a blue saddle cloth.' },
    palette: { trim: '#e8b84a', cape: '#3a5a8a' }, ornament: 'crown' }
);

/* ---------- další skiny: kopiníci (trojzubce!) a nové podoby velitelů ---------- */
GameData.unitSkins.push(
  { id: 'r_kopi', only: ['kopinik'], name: 'Strážce brány', rarity: 'Vzácný', price: 150, bonus: { hp: 0.06 },
    desc: 'Plátové nárameníky, krátký plášť a znak lva na hrudi.', en: { name: 'Gate Warden', desc: 'Plate pauldrons, a short cloak and a lion on the chest.' },
    palette: { tunic: '#1f3a6a', tunicDark: '#122444', trim: '#e0c060', cape: '#7a1414', plume: '#e0c060' } },
  { id: 'r_templar', only: ['rytir'], name: 'Templář', rarity: 'Epický', price: 260, bonus: { hp: 0.08, armor: 0.03 },
    desc: 'Bílý plášť s rudým křížem a široké nárameníky.', en: { name: 'Templar', desc: 'A white cloak with a red cross and broad pauldrons.' },
    palette: { tunic: '#f1ede2', tunicDark: '#c9c1ad', trim: '#c8262a', cape: '#f4efe0', plume: '#c8262a' } },
  { id: 's_kopi', only: ['jari'], name: 'Mnich sóhei', rarity: 'Vzácný', price: 150, bonus: { hp: 0.06 },
    desc: 'Bílá kápě válečného mnicha, zbroj sode a mon na hrudi.', en: { name: 'Sōhei Monk', desc: 'The white hood of a warrior monk, sode armor and a mon on the chest.' },
    palette: { tunic: '#e8e2d6', tunicDark: '#b8b0a0', trim: '#7a1414', metal: '#3a3438', metalDark: '#1a1618', cape: '#e8e2d6', plume: '#7a1414' } },
  { id: 's_ronin', only: ['samuraj'], name: 'Toulavý rónin', rarity: 'Epický', price: 260, bonus: { dmg: 0.09 },
    desc: 'Samuraj bez pána: roztrhaný plášť a rudé rohy kuwagata.', en: { name: 'Wandering Rōnin', desc: 'A masterless samurai: a torn cloak and red kuwagata horns.' },
    palette: { tunic: '#4a3a5a', tunicDark: '#2a2034', trim: '#c8262a', metal: '#4a4048', metalDark: '#201a20', cape: '#3a2a4a', plume: '#c8262a' } },
  { id: 'v_kopi', only: ['stitonos'], name: 'Štítonoš Valhaly', rarity: 'Vzácný', price: 150, bonus: { hp: 0.06 },
    desc: 'Kožešinový límec, runa na hrudi a křídla na přilbě.', en: { name: 'Valhalla Shieldbearer', desc: 'A fur collar, a rune on the chest and wings on the helmet.' },
    palette: { tunic: '#3a5a7a', tunicDark: '#24384c', trim: '#e0c060', cape: '#2a4a6a', plume: '#ffffff' } },
  { id: 'v_medved', only: ['berserk'], name: 'Medvědí berserk', rarity: 'Epický', price: 260, bonus: { hp: 0.1, dmg: 0.04 },
    desc: 'Hnědá medvědí kůže přes záda, kožešinové nárameníky a válečné barvy.', en: { name: 'Bear Berserker', desc: 'A brown bear hide over the back, fur pauldrons and war paint.' },
    palette: { tunic: '#5a3a24', tunicDark: '#3a2414', trim: '#c9a06a', cape: '#5a3a24' } }
);

/* TVAROVÉ PRVKY SKINŮ – skiny mění tvar, ne jen barvy:
   plášť (royal/ermine/tattered/short/pelt), límec (ermine/fur/wolf/chain), znak na hrudi,
   nárameníky (plate/spiky/gold/samurai/fur), chochol/rohy/křídla na přilbě a aura. */
const FEAT = {
  lesni: { cape: 'short', collar: 'fur', crest: 'feather', plumeColor: '#4a8a3a' },
  pulnoc: { cape: 'royal', capeColor: '#1a2a5a', chest: 'moon', pauldron: 'plate', trim: '#c9d8ff' },
  stinovy: { pauldron: 'spiky', cape: 'tattered', capeColor: '#2a0a10', aura: 'shadow', chest: 'skull' },
  zlaty: { crest: 'wings', pauldron: 'gold', chest: 'sun', cape: 'royal', capeColor: '#f4efe0', aura: 'holy' },
  ledovy: { pauldron: 'spiky', spikeColor: '#e6f8ff', collar: 'fur', furColor: '#f4f8ff', aura: 'frost', chest: 'star', emblemColor: '#dff4ff' },
  smaragd: { pauldron: 'plate', chest: 'dragon', emblemColor: '#7be0a0', cape: 'short' },
  rudy_drak: { pauldron: 'spiky', chest: 'dragon', crest: 'dragon', aura: 'flame' },
  krvavy: { pauldron: 'spiky', chest: 'skull', aura: 'flame', cape: 'tattered', capeColor: '#3a060a' },
  nebesky: { crest: 'wings', pauldron: 'gold', aura: 'holy', cape: 'royal', capeColor: '#cfe4ff', chest: 'star' },
  verny: { cape: 'royal', capeColor: '#3a1f66', collar: 'chain', chest: 'star', pauldron: 'gold', crest: 'royalplume', plumeColor: '#b98cff' },
  r_velitel: { cape: 'ermine', capeColor: '#7a1218', collar: 'ermine', chest: 'lion', pauldron: 'gold', crest: 'royalplume', plumeColor: '#ffffff' },
  r_luk: { cape: 'short', capeColor: '#2f62b8', crest: 'feather', plumeColor: '#e0a83a', chest: 'lion' },
  r_mec: { pauldron: 'plate', chest: 'cross', emblemColor: '#bff7ef', cape: 'short', capeColor: '#2ab0a8', aura: 'frost' },
  r_kopi: { pauldron: 'plate', chest: 'lion', cape: 'short', crest: 'mohawk', plumeColor: '#e0c060' },
  r_templar: { pauldron: 'plate', chest: 'cross', emblemColor: '#c8262a', cape: 'royal', capeColor: '#f4efe0', trim: '#c8262a', crest: 'plume', plumeColor: '#ffffff' },
  r_kun: { cape: 'ermine', capeColor: '#234a9c', collar: 'ermine', chest: 'lion', pauldron: 'gold', crest: 'royalplume' },
  s_velitel: { crest: 'kuwagata', pauldron: 'samurai', chest: 'mon', cape: 'royal', capeColor: '#8a1414' },
  s_luk: { aura: 'petals', crest: 'feather', plumeColor: '#ff9ac0', chest: 'mon', emblemColor: '#fff0f5' },
  s_mec: { pauldron: 'samurai', chest: 'mon', crest: 'kuwagata', trim: '#e6d38a' },
  s_kopi: { pauldron: 'samurai', chest: 'mon', emblemColor: '#7a1414', collar: 'fur', furColor: '#f4f0e8' },
  s_ronin: { cape: 'tattered', capeColor: '#3a2a4a', crest: 'kuwagata', trim: '#c8262a', pauldron: 'samurai' },
  s_kun: { crest: 'kuwagata', pauldron: 'samurai', chest: 'mon', cape: 'royal', capeColor: '#8a1414' },
  v_velitel: { collar: 'wolf', cape: 'pelt', furColor: '#9aa0aa', pauldron: 'fur', chest: 'rune', emblemColor: '#7fd3ff' },
  v_luk: { aura: 'aurora', collar: 'fur', furColor: '#cfe8e8', chest: 'rune', emblemColor: '#9dffd0', crest: 'feather', plumeColor: '#9dffd0' },
  v_mec: { aura: 'storm', pauldron: 'plate', chest: 'rune', emblemColor: '#ffe14a', crest: 'wings' },
  v_kopi: { collar: 'fur', chest: 'rune', emblemColor: '#e0c060', crest: 'wings', pauldron: 'plate' },
  v_medved: { cape: 'pelt', furColor: '#6a4428', pauldron: 'fur', furColor2: '#6a4428', collar: 'fur', crest: 'antlers' },
  v_kun: { collar: 'wolf', cape: 'pelt', furColor: '#9aa0aa', pauldron: 'fur', chest: 'rune' }
};
GameData.unitSkins.forEach(s => {
  if (FEAT[s.id]) s.feat = FEAT[s.id];
  // královské skiny už nemají korunu – vznešenost dělá plášť, hermelín a zlato
  if (['r_velitel', 'v_velitel', 'r_kun', 'v_kun', 'zlaty'].includes(s.id) && s.ornament === 'crown') s.ornament = null;
});

/* ---------- SKINY ZBRANÍ ----------
   Každý skin zbraně má vlastní TVAR (model) – meč, katanu, sekeru, kladivo,
   trojzubec, halapartnu, luk… cat = druh zbraně (melee = meče a sekery,
   pole = kopí, bow = luky). Hodí se jen jednotkám se stejným druhem zbraně. */
const WS = (id, name, rarity, price, cat, model, bonus, desc, en) => Object.assign({ id, name, rarity, cat, model: Object.assign({ cat }, model), bonus, desc, en }, price);
GameData.weaponSkins = [
  { id: 'w_zakladni', name: 'Původní zbraň', rarity: 'Základní', price: 0, cat: 'any', model: null, en: { name: 'Original Weapon' } },
  /* meče, šavle, katany, sekery, kladiva */
  WS('w_rytirsky', 'Rytířský meč', 'Základní', { price: 0, gold: 1500 }, 'melee', { id: 'mec', guard: '#c9ced6', pommel: '#c9ced6', grip: '#2a3a6a' }, { dmg: 0.02 }, 'Poctivý široký meč se záštitou a žlábkem.', { name: 'Knight’s Sword', desc: 'An honest broad sword with a crossguard and fuller.' }),
  WS('w_dlouhy', 'Obouruční meč', 'Vzácný', { price: 0, gold: 3000 }, 'melee', { id: 'dlouhy', guard: '#8a8f99', grip: '#4a2a14' }, { dmg: 0.04 }, 'Dlouhá čepel pro obě ruce.', { name: 'Greatsword', desc: 'A long blade for both hands.' }),
  WS('w_savle', 'Pouštní šavle', 'Vzácný', { price: 0, gold: 2500 }, 'melee', { id: 'savle', guard: '#e0a83a', grip: '#7a1a14' }, { dmg: 0.04 }, 'Zahnutá čepel, rychlá jako vítr.', { name: 'Desert Sabre', desc: 'A curved blade, quick as the wind.' }),
  WS('w_katana', 'Katana mistra', 'Vzácný', { price: 120 }, 'melee', { id: 'katana', guard: '#2a2a2a', grip: '#7a1414' }, { dmg: 0.05 }, 'Štíhlá zahnutá čepel s tsubou a omotanou rukojetí.', { name: 'Master’s Katana', desc: 'A slender curved blade with tsuba and wrapped grip.' }),
  WS('w_sekera', 'Bojová sekera', 'Vzácný', { price: 0, gold: 2800 }, 'melee', { id: 'sekera', wood: '#6b4528', guard: '#8a8f99' }, { dmg: 0.04 }, 'Těžká sekera s půlměsícovým ostřím.', { name: 'Battle Axe', desc: 'A heavy axe with a crescent edge.' }),
  WS('w_palcat', 'Palcát', 'Vzácný', { price: 0, gold: 3500 }, 'melee', { id: 'palcat', grip: '#3a2414' }, { dmg: 0.05 }, 'Ocelová hlava s břity drtí zbroj.', { name: 'Flanged Mace', desc: 'A flanged steel head that crushes armor.' }),
  WS('w_kladivo', 'Válečné kladivo', 'Epický', { price: 160 }, 'melee', { id: 'kladivo', wood: '#5a3a1e' }, { dmg: 0.06 }, 'Kladivo s bodcem prorazí každou přilbu.', { name: 'War Hammer', desc: 'A spiked hammer that breaks any helm.' }),
  WS('w_runovy', 'Runový meč', 'Epický', { price: 180 }, 'melee', { id: 'runovy', glow: '#7fc8ff', guard: '#9aa3b0' }, { dmg: 0.06 }, 'Široká čepel s modře zářícími runami.', { name: 'Rune Sword', desc: 'A broad blade with glowing blue runes.' }),
  WS('w_plamen', 'Plamenný meč', 'Epický', { price: 0, czk: 29 }, 'melee', { id: 'plamen', blade: '#ffd2a0', dark: '#a8401a', edge: '#fff2d8', glow: '#ff7a2a', guard: '#5a1a0a' }, { dmg: 0.06 }, 'Vlnitá čepel flamberku rozžhavená do ruda.', { name: 'Flame Sword', desc: 'A wavy flamberge blade heated red-hot.' }),
  WS('w_led', 'Ledová čepel', 'Epický', { price: 200 }, 'melee', { id: 'krystal', blade: '#d6f2ff', dark: '#5a9ac8', glow: '#7fd3ff', guard: '#bfe6ff' }, { dmg: 0.06 }, 'Krystalová čepel z věčného ledu.', { name: 'Frost Blade', desc: 'A crystal blade of eternal ice.' }),
  WS('w_stin', 'Stínová čepel', 'Epický', { price: 0, czk: 29 }, 'melee', { id: 'kostena', blade: '#5a5068', dark: '#1a161e', edge: '#c8b8e8', glow: '#b25cff', guard: '#2a2030' }, { dmg: 0.06 }, 'Zubatá černá čepel s fialovou září.', { name: 'Shadow Blade', desc: 'A jagged black blade with a violet glow.' }),
  WS('w_hrom', 'Hromová sekera', 'Legendární', { price: 0, czk: 59 }, 'melee', { id: 'sekera', blade: '#f4f8ff', dark: '#7a8ab0', glow: '#fff36a', wood: '#2a3a5a', guard: '#ffe14a' }, { dmg: 0.08 }, 'Sekera, ve které hřmí bouře.', { name: 'Thunder Axe', desc: 'An axe with a storm rumbling inside.' }),
  WS('w_zlato', 'Meč krále', 'Legendární', { price: 0, czk: 59 }, 'melee', { id: 'kral', guard: '#ffd24a', pommel: '#ffd24a', gem: '#d6243a', grip: '#5a0a14', glow: '#ffe28a' }, { dmg: 0.08 }, 'Zlatá záštita, rubín v jílci a čepel, která nikdy netupí.', { name: 'King’s Sword', desc: 'A golden guard, a ruby in the hilt and a blade that never dulls.' }),
  WS('w_hvezda', 'Hvězdná čepel', 'Legendární', { price: 0, czk: 99 }, 'melee', { id: 'hvezda', guard: '#cfd8ff', gem: '#7fd3ff', glow: '#bfd0ff' }, { dmg: 0.1, crit: 0.05 }, 'Čepel ukovaná ze spadlé hvězdy.', { name: 'Star Blade', desc: 'A blade forged from a fallen star.' }),
  /* kopí, trojzubce, halapartny */
  WS('k_kopi', 'Okřídlené kopí', 'Základní', { price: 0, gold: 1500 }, 'pole', { id: 'kopi', wood: '#7a4c2a' }, { dmg: 0.02 }, 'Široký listovitý hrot.', { name: 'Winged Spear', desc: 'A broad leaf-shaped head.' }),
  WS('k_trojzubec', 'Trojzubec', 'Vzácný', { price: 150 }, 'pole', { id: 'trojzubec', wood: '#5a3a1e' }, { dmg: 0.05 }, 'Tři hroty drží nepřítele v odstupu.', { name: 'Trident', desc: 'Three prongs keep the enemy at bay.' }),
  WS('k_morsky', 'Trojzubec moří', 'Epický', { price: 0, czk: 29 }, 'pole', { id: 'trojzubec', blade: '#9fe8e0', dark: '#2a7a8a', glow: '#5adfe0', wood: '#1f4a5a', guard: '#e0c060' }, { dmg: 0.06 }, 'Trojzubec mořského boha, září jako vlny.', { name: 'Sea Trident', desc: 'The sea god’s trident, shining like waves.' }),
  WS('k_halapartna', 'Halapartna', 'Vzácný', { price: 0, gold: 3000 }, 'pole', { id: 'halapartna', wood: '#6b4528' }, { dmg: 0.05 }, 'Sekera, hrot a hák v jedné zbrani.', { name: 'Halberd', desc: 'Axe, spike and hook in one weapon.' }),
  WS('k_glefa', 'Glefa', 'Vzácný', { price: 0, gold: 3500 }, 'pole', { id: 'glefa', wood: '#5a3a1e', guard: '#9aa3b0' }, { dmg: 0.05 }, 'Dlouhá zahnutá čepel na násadě.', { name: 'Glaive', desc: 'A long curved blade on a pole.' }),
  WS('k_naginata', 'Naginata', 'Epický', { price: 150 }, 'pole', { id: 'glefa', wood: '#2a1a1a', guard: '#e8b84a', glow: '#ffd2e0' }, { dmg: 0.06 }, 'Zbraň samurajských mnichů s lakovanou násadou.', { name: 'Naginata', desc: 'The weapon of samurai monks with a lacquered shaft.' }),
  WS('k_partyzana', 'Partyzána', 'Epický', { price: 140 }, 'pole', { id: 'partyzana', wood: '#4a2e18', guard: '#c9a06a' }, { dmg: 0.06 }, 'Široký hrot s křidélky.', { name: 'Partisan', desc: 'A broad head with side wings.' }),
  WS('k_drak', 'Dračí kopí', 'Legendární', { price: 0, czk: 59 }, 'pole', { id: 'drak', blade: '#ffb27a', dark: '#8a2a10', glow: '#ff6a2a', wood: '#3a1208', guard: '#e8b84a' }, { dmg: 0.08 }, 'Zubatý hrot z dračího zubu a dračí hlava u násady.', { name: 'Dragon Spear', desc: 'A jagged dragon-tooth head with a dragon’s head at the shaft.' }),
  WS('k_zlate', 'Zlaté kopí krále', 'Legendární', { price: 0, czk: 59 }, 'pole', { id: 'partyzana', blade: '#ffe08a', dark: '#a47a24', glow: '#ffe28a', wood: '#5a0a14', guard: '#ffd24a', gem: '#d6243a' }, { dmg: 0.08 }, 'Partyzána z ryzího zlata s rubínem.', { name: 'King’s Golden Spear', desc: 'A partisan of pure gold with a ruby.' }),
  /* luky */
  WS('l_reflex', 'Reflexní luk', 'Základní', { price: 0, gold: 2200 }, 'bow', { id: 'reflex', wood: '#6b3a1e' }, { dmg: 0.03 }, 'Ramena stočená dopředu – silnější výstřel.', { name: 'Recurve Bow', desc: 'Limbs curved forward – a stronger shot.' }),
  WS('l_dlouhy', 'Dlouhý luk', 'Vzácný', { price: 0, gold: 2600 }, 'bow', { id: 'dlouhy', wood: '#8a5a32' }, { dmg: 0.04 }, 'Vysoký tisový luk s velkým dostřelem.', { name: 'Longbow', desc: 'A tall yew bow with great range.' }),
  WS('l_elfi', 'Elfí luk', 'Vzácný', { price: 120 }, 'bow', { id: 'elfi', wood: '#cfe8a0', string: '#f4ffe6', glow: '#b8ff8a' }, { dmg: 0.04 }, 'Světlé dřevo, listy na ramenou a tětiva z vlasů lesní víly.', { name: 'Elven Bow', desc: 'Pale wood, leaves on the limbs and a string of fairy hair.' }),
  WS('l_kost', 'Kostěný luk', 'Epický', { price: 140 }, 'bow', { id: 'kost', wood: '#e8dcc0', string: '#c9b48a' }, { dmg: 0.05 }, 'Luk z obratlů dávné bestie.', { name: 'Bone Bow', desc: 'A bow made from the vertebrae of an ancient beast.' }),
  WS('l_drak', 'Dračí luk', 'Epický', { price: 0, czk: 29 }, 'bow', { id: 'draci', wood: '#7a1a14', blade: '#ff9a5a', string: '#ffd2a0', glow: '#ff6a2a', arrow: '#ff9a3c', tip: '#ffd27a' }, { dmg: 0.06 }, 'Luk z dračí kosti s ostny, šípy hoří.', { name: 'Dragon Bow', desc: 'A spiked bow of dragon bone; its arrows burn.' }),
  WS('l_mesic', 'Měsíční luk', 'Legendární', { price: 0, czk: 59 }, 'bow', { id: 'reflex', wood: '#dfe6ff', string: '#ffffff', glow: '#bfd0ff', gem: '#bfd0ff' }, { dmg: 0.08 }, 'Stříbrný luk, který svítí jako úplněk.', { name: 'Moon Bow', desc: 'A silver bow that shines like the full moon.' }),
  WS('l_hvezdny', 'Hvězdný luk', 'Legendární', { price: 0, czk: 99 }, 'bow', { id: 'hvezdny', wood: '#2a2f5a', string: '#cfd8ff', glow: '#bfd0ff', gem: '#ffe28a', arrow: '#cfd8ff', tip: '#ffe28a' }, { dmg: 0.1, crit: 0.05 }, 'Luk z nebeské oceli s hvězdnými drahokamy.', { name: 'Star Bow', desc: 'A bow of heavenly steel with star gems.' })
];
GameData.weaponSkinById = id => GameData.weaponSkins.find(w => w.id === id) || GameData.weaponSkins[0];
GameData.skinFits = (s, unitId) => !s.only || s.only.includes(unitId);
/* hodí se skin zbraně této jednotce? (podle druhu její zbraně) */
GameData.weaponSkinFits = (w, unitId) => w.cat === 'any' || (window.Art && Art.weaponCat && Art.weaponCat(GameData.units[unitId].look.weapon) === w.cat);

/* VZÁCNOST = SÍLA: legendární > epický > vzácný > základní.
   Bonus každého skinu se srovná podle vzácnosti (poměr útok/životy zůstává). */
(function () {
  const TOTAL = { 'Základní': 0.03, 'Vzácný': 0.07, 'Epický': 0.12, 'Legendární': 0.2 };
  const norm = (b, total) => {
    const keys = Object.keys(b || {}); const sum = keys.reduce((a, k) => a + b[k], 0);
    if (!sum) return { hp: total / 2, dmg: total / 2 };
    const o = {}; keys.forEach(k => (o[k] = Math.round(b[k] / sum * total * 100) / 100)); return o;
  };
  GameData.unitSkins.forEach(s => {
    if (s.id === 'zakladni') { s.bonus = null; return; }
    let t = TOTAL[s.rarity] || 0.05;
    if (s.mount) t += 0.04;          // jezdecký skin je nejvzácnější
    if (s.exclusive) t = TOTAL['Legendární'];
    s.bonus = norm(s.bonus, t);
  });
  const WT = { 'Základní': 0.03, 'Vzácný': 0.06, 'Epický': 0.09, 'Legendární': 0.13 };
  GameData.weaponSkins.forEach(w => {
    if (!w.model) return;
    w.bonus = { dmg: WT[w.rarity] || 0.05 };
    if (w.rarity === 'Legendární') w.bonus.crit = 0.05;
  });
  // obchod řadí od nejslabšího k nejsilnějšímu
  const R = { 'Základní': 0, 'Vzácný': 1, 'Epický': 2, 'Legendární': 3 };
  GameData.rarityRank = r => R[r] ?? 0;
})();
