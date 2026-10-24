/* =========================================================================
   NOVÉ JEDNOTKY KAŽDÉHO NÁRODA: jezdec na koni, mág a velitel
   Každý národ má teď 7 vojáků: pěšák, lučištník, kopiník, těžká jednotka,
   jezdec (kůň), mág a velitel. Odemykají se postupně v příběhu – už u rytířů.
     jizda   – rychlý jezdec; první úder po rozjezdu (náraz) dává dvojnásobné zranění
     mag     – kouzelná koule zraní cíl a trochu i nepřátele okolo
     velitel – odolný; vojáci v jeho okolí mají +15 % útok (aura velení)
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.roles.jizda = { name: 'Jízda' };
GameData.roles.mag = { name: 'Mág' };
GameData.roles.velitel = { name: 'Velitel' };

const U = (o) => Object.assign({ armor: 0, ranged: false, unlock: null }, o);
Object.assign(GameData.units, {
  /* ---------- KRÁLOVSTVÍ ---------- */
  jezdec: U({ id: 'jezdec', faction: 'kralovstvi', roleKey: 'jizda', name: 'Rytířský jezdec', role: 'Jízda',
    desc: 'Rytíř na koni s kopím. Nejrychlejší voják – první náraz dává dvojnásobné zranění.',
    cost: 140, hp: 300, dmg: 26, attackInterval: 1.1, range: 52, speed: 82, armor: 0.18, spawnCooldown: 3.0, charge: 2,
    look: { helmet: 'nasal', weapon: 'spear', shield: 'kite', armor: 'mail', scale: 1.02, mount: { coat: '#f2efe8', coatDark: '#c9c2b4', mane: '#d9d2c4' } } }),
  mag: U({ id: 'mag', faction: 'kralovstvi', roleKey: 'mag', name: 'Dvorní mág', role: 'Mág',
    desc: 'Metá modré kouzelné koule. Zraní cíl i nepřátele hned vedle něj.',
    cost: 120, hp: 90, dmg: 24, attackInterval: 1.8, range: 210, speed: 44, spawnCooldown: 2.4, ranged: true, projectile: 'magic', projectileSpeed: 420, splash: 0.5,
    look: { helmet: 'wizard', weapon: 'staff', shield: null, armor: 'robe', scale: 1, magic: '#7fc8ff' } }),
  velitel: U({ id: 'velitel', faction: 'kralovstvi', roleKey: 'velitel', name: 'Velitel', role: 'Velitel',
    desc: 'Velitel Lví koruny s palcátem. Odolný, a vojáci kolem něj mají +15 % útok.',
    cost: 220, hp: 520, dmg: 34, attackInterval: 1.1, range: 32, speed: 44, armor: 0.3, spawnCooldown: 6, aura: 0.15,
    look: { helmet: 'great', weapon: 'longsword', meleeModel: 'palcat', shield: 'kite', armor: 'plate', cape: true, scale: 1.18,
      feat: { cape: 'royal', pauldron: 'gold', chest: 'lion', crest: 'plume' } } }),
  /* ---------- SAMURAJOVÉ ---------- */
  kiba: U({ id: 'kiba', faction: 'samurajove', roleKey: 'jizda', name: 'Jízdní samuraj', role: 'Jízda',
    desc: 'Samuraj na vraníkovi s kopím jari. Rychlý a silný při nárazu.',
    cost: 140, hp: 290, dmg: 27, attackInterval: 1.05, range: 52, speed: 84, armor: 0.16, spawnCooldown: 3.0, charge: 2,
    look: { helmet: 'kabuto', weapon: 'yari', shield: null, armor: 'do', sashimono: true, scale: 1.0, mount: { coat: '#2a2420', coatDark: '#16120f', mane: '#0e0b09' } } }),
  onmyoji: U({ id: 'onmyoji', faction: 'samurajove', roleKey: 'mag', name: 'Onmjódži', role: 'Mág',
    desc: 'Dvorní kouzelník s lišejí ohněm. Jeho koule zasáhnou i nepřátele okolo.',
    cost: 120, hp: 85, dmg: 25, attackInterval: 1.75, range: 215, speed: 46, spawnCooldown: 2.4, ranged: true, projectile: 'magic', projectileSpeed: 440, splash: 0.5,
    look: { helmet: 'eboshi', weapon: 'staff', shield: null, armor: 'robe', scale: 0.98, magic: '#ff8ab0', staffWood: '#2a1a1a' } }),
  taisho: U({ id: 'taisho', faction: 'samurajove', roleKey: 'velitel', name: 'Taišó', role: 'Velitel',
    desc: 'Generál klanu s rohy kuwagata a mečem. Vojáci kolem něj mají +15 % útok.',
    cost: 220, hp: 500, dmg: 36, attackInterval: 1.0, range: 32, speed: 46, armor: 0.27, spawnCooldown: 6, aura: 0.15,
    look: { helmet: 'kabuto', weapon: 'katana2', meleeModel: 'katana', shield: null, armor: 'do', sashimono: true, scale: 1.16,
      feat: { crest: 'kuwagata', pauldron: 'samurai', chest: 'mon', cape: 'royal' } } }),
  /* ---------- VIKINGOVÉ ---------- */
  jezdec_sever: U({ id: 'jezdec_sever', faction: 'vikingove', roleKey: 'jizda', name: 'Jezdec fjordů', role: 'Jízda',
    desc: 'Viking na silném hnědákovi se sekerou. Rychlý a tvrdý při nárazu.',
    cost: 140, hp: 320, dmg: 25, attackInterval: 1.1, range: 30, speed: 80, armor: 0.14, spawnCooldown: 3.0, charge: 2,
    look: { helmet: 'viking', weapon: 'axe', shield: 'vround', armor: 'fur', beard: true, scale: 1.02, mount: { coat: '#8a5a32', coatDark: '#5a3a1e', mane: '#2e2018' } } }),
  volva: U({ id: 'volva', faction: 'vikingove', roleKey: 'mag', name: 'Völva', role: 'Mág',
    desc: 'Věštkyně se seiðem. Zelené koule kouzla zasáhnou i nepřátele okolo.',
    cost: 120, hp: 95, dmg: 23, attackInterval: 1.8, range: 205, speed: 44, spawnCooldown: 2.4, ranged: true, projectile: 'magic', projectileSpeed: 410, splash: 0.5,
    look: { helmet: 'seidhood', weapon: 'staff', shield: null, armor: 'robe', beard: false, scale: 0.98, magic: '#7be0a0', staffWood: '#5a4a3a' } }),
  jarl: U({ id: 'jarl', faction: 'vikingove', roleKey: 'velitel', name: 'Jarl', role: 'Velitel',
    desc: 'Vůdce válečníků ve vlčí kožešině se sekerou. Vojáci kolem něj mají +15 % útok.',
    cost: 220, hp: 560, dmg: 33, attackInterval: 1.1, range: 34, speed: 46, armor: 0.2, spawnCooldown: 6, aura: 0.15,
    look: { helmet: 'viking', weapon: 'axe', meleeModel: 'sekera', shield: 'vround', armor: 'fur', mail: true, beard: true, cape: true, capeColor: '#6b7380', scale: 1.18,
      feat: { collar: 'wolf', cape: 'pelt', furColor: '#9aa0aa', pauldron: 'fur', chest: 'rune', emblemColor: '#7fd3ff' } } })
});

/* Jednotky národů (7) a jejich odemykání v příběhu */
const ADD = { kralovstvi: { jizda: 'jezdec', mag: 'mag', velitel: 'velitel' }, samurajove: { jizda: 'kiba', mag: 'onmyoji', velitel: 'taisho' }, vikingove: { jizda: 'jezdec_sever', mag: 'volva', velitel: 'jarl' } };
const ORDER = ['pech', 'strelec', 'kopi', 'jizda', 'tezka', 'mag', 'velitel'];
for (const f of Object.keys(ADD)) {
  const F = GameData.factions[f];
  Object.assign(F.roles, ADD[f]);
  F.units = ORDER.map(r => F.roles[r]);
}
const UNL = (id, lvl, act) => { GameData.units[id].unlock = { campaign: lvl, text: `Odemkne se po splnění úrovně ${lvl.replace(/^[a-z]/, '')} v Aktu ${act}.` }; };
// Rytíři: pěšák od začátku, pak postupně všichni ostatní
UNL('lucistnik', '1-1', 'I'); UNL('kopinik', '1-3', 'I'); UNL('jezdec', '1-5', 'I'); UNL('rytir', '2-2', 'I'); UNL('mag', '2-5', 'I'); UNL('velitel', '3-3', 'I');
UNL('jari', 's1-3', 'II'); UNL('kiba', 's1-5', 'II'); UNL('onmyoji', 's2-3', 'II'); UNL('taisho', 's3-2', 'II');
UNL('stitonos', 'v1-3', 'III'); UNL('jezdec_sever', 'v1-5', 'III'); UNL('volva', 'v2-3', 'III'); UNL('jarl', 'v3-2', 'III');
GameData.unitOrder = GameData.factionOrder.flatMap(f => GameData.factions[f].units);

/* pořadí v šiku podle role: menší číslo = blíž k nepříteli */
GameData.formationRank = { tezka: 0, jizda: 0, velitel: 1, pech: 1, kopi: 2, strelec: 3, mag: 3 };

/* anglické texty nových jednotek */
const UEN = {
  jezdec: ['Knight Rider', 'Cavalry', 'A mounted knight with a lance. The fastest soldier – the first impact deals double damage.'],
  mag: ['Court Mage', 'Mage', 'Hurls blue magic orbs that hurt the target and enemies right next to it.'],
  velitel: ['Commander', 'Commander', 'Commander of the Lion Crown. Tough, and soldiers around him get +15% attack.'],
  kiba: ['Mounted Samurai', 'Cavalry', 'A samurai on a black horse with a yari. Fast and strong on impact.'],
  onmyoji: ['Onmyōji', 'Mage', 'A court sorcerer. His orbs also hit nearby enemies.'],
  taisho: ['Taishō', 'Commander', 'A clan general with kuwagata horns. Soldiers around him get +15% attack.'],
  jezdec_sever: ['Fjord Rider', 'Cavalry', 'A Viking on a strong bay horse with an axe. Fast and hard on impact.'],
  volva: ['Völva', 'Mage', 'A seeress of seiðr. Her green orbs also hit nearby enemies.'],
  jarl: ['Jarl', 'Commander', 'Leader of warriors in a wolf pelt. Soldiers around him get +15% attack.']
};
Object.keys(UEN).forEach(id => { const e = UEN[id]; GameData.units[id].en = { name: e[0], role: e[1], desc: e[2] }; });
