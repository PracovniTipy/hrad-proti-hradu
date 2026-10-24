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

/* ---------- SKINY ZBRANÍ ----------
   roles – pro které druhy jednotek se zbraň hodí (pech = meč/sekera, strelec = luk,
   kopi = kopí, tezka = zbraň velitele). wpal – barvy čepele, dřeva a záře. */
GameData.weaponSkins = [
  { id: 'w_zakladni', name: 'Původní zbraň', rarity: 'Základní', price: 0, roles: ['pech', 'strelec', 'kopi', 'tezka'], wpal: {},
    en: { name: 'Original Weapon' } },
  { id: 'w_plamen', name: 'Plamenná čepel', rarity: 'Epický', price: 140, roles: ['pech', 'kopi', 'tezka'], bonus: { dmg: 0.04 },
    wpal: { metal: '#ffb27a', metalDark: '#a8401a', glow: '#ff7a2a' }, desc: 'Čepel rozžhavená do ruda.',
    en: { name: 'Flame Blade', desc: 'A blade heated red-hot.' } },
  { id: 'w_led', name: 'Ledová čepel', rarity: 'Epický', price: 140, roles: ['pech', 'kopi', 'tezka'], bonus: { dmg: 0.04 },
    wpal: { metal: '#d6f2ff', metalDark: '#5a9ac8', glow: '#7fd3ff' }, desc: 'Krystalová ocel z věčného ledu.',
    en: { name: 'Frost Blade', desc: 'Crystal steel of eternal ice.' } },
  { id: 'w_stin', name: 'Stínová čepel', rarity: 'Epický', price: 0, czk: 29, roles: ['pech', 'kopi', 'tezka'], bonus: { dmg: 0.05 },
    wpal: { metal: '#4d4857', metalDark: '#1a161e', glow: '#b25cff' }, desc: 'Černá ocel s fialovou září.',
    en: { name: 'Shadow Blade', desc: 'Black steel with a violet glow.' } },
  { id: 'w_zlato', name: 'Zlatá zbraň krále', rarity: 'Legendární', price: 0, czk: 59, roles: ['pech', 'kopi', 'tezka'], bonus: { dmg: 0.07 },
    wpal: { metal: '#ffe08a', metalDark: '#a47a24', glow: '#ffe28a' }, desc: 'Ryzí zlato a drahokamy v jílci.',
    en: { name: 'King’s Golden Weapon', desc: 'Pure gold with jewels in the hilt.' } },
  { id: 'w_hrom', name: 'Hromová zbraň', rarity: 'Legendární', price: 0, czk: 59, roles: ['pech', 'kopi', 'tezka'], bonus: { dmg: 0.07 },
    wpal: { metal: '#f4f8ff', metalDark: '#7a8ab0', glow: '#fff36a' }, desc: 'Zbraň, ve které hřmí bouře.',
    en: { name: 'Thunder Weapon', desc: 'A weapon with a storm rumbling inside.' } },
  { id: 'l_elfi', name: 'Elfí luk', rarity: 'Vzácný', price: 120, roles: ['strelec'], bonus: { dmg: 0.04 },
    wpal: { wood: '#cfe8a0', metal: '#e6f6d0', metalDark: '#7a9a50', string: '#f4ffe6', glow: '#b8ff8a' }, desc: 'Světlé dřevo a tětiva z vlasů lesní víly.',
    en: { name: 'Elven Bow', desc: 'Pale wood and a string spun from a forest fairy’s hair.' } },
  { id: 'l_drak', name: 'Dračí luk', rarity: 'Epický', price: 0, czk: 29, roles: ['strelec'], bonus: { dmg: 0.05 },
    wpal: { wood: '#7a1a14', metal: '#ff9a5a', metalDark: '#8a2a10', string: '#ffd2a0', glow: '#ff6a2a' }, desc: 'Luk z dračí kosti, šípy hoří.',
    en: { name: 'Dragon Bow', desc: 'A bow of dragon bone; its arrows burn.' } },
  { id: 'l_mesic', name: 'Měsíční luk', rarity: 'Legendární', price: 0, czk: 59, roles: ['strelec'], bonus: { dmg: 0.07 },
    wpal: { wood: '#dfe6ff', metal: '#f4f8ff', metalDark: '#8a9ad0', string: '#ffffff', glow: '#bfd0ff' }, desc: 'Stříbrný luk, který svítí jako úplněk.',
    en: { name: 'Moon Bow', desc: 'A silver bow that shines like the full moon.' } }
];
GameData.weaponSkinById = id => GameData.weaponSkins.find(w => w.id === id) || GameData.weaponSkins[0];
GameData.skinFits = (s, unitId) => !s.only || s.only.includes(unitId);
