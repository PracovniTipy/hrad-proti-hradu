/* =========================================================================
   DÉMONI – nepřátelský národ závěrečného aktu příběhu
   Hráč za ně nehraje: posílá je jen umělá inteligence. Mají vlastní hrad
   (styl 'peklo'), bojiště a mapu (téma 'peklo').
   demonkral – boss: objeví se jen v závěrečné bitvě (viz Battle, opts.boss).
   ========================================================================= */
window.GameData = window.GameData || {};

Object.assign(GameData.units, {
  bes: {
    id: 'bes', faction: 'demoni', roleKey: 'pech',
    name: 'Běs', role: 'Pekelná havěť',
    desc: 'Malý rohatý démon s drápy. Rychlý a levný, útočí v hejnech.',
    cost: 45, hp: 120, dmg: 15, attackInterval: 0.75, range: 22, speed: 64, armor: 0, spawnCooldown: 0.9, ranged: false,
    look: { helmet: 'demon', weapon: 'claws', shield: null, armor: 'demon', tail: true, scale: 0.9 },
    unlock: null
  },
  chrlic: {
    id: 'chrlic', faction: 'demoni', roleKey: 'strelec',
    name: 'Ohnivý chrlič', role: 'Vrhač ohně',
    desc: 'Metá ohnivé koule. Má o něco kratší dostřel než lučištník, ale pálí silněji.',
    cost: 75, hp: 85, dmg: 18, attackInterval: 1.5, range: 195, speed: 48, armor: 0.05, spawnCooldown: 1.6, ranged: true,
    projectile: 'fire', projectileSpeed: 430,
    look: { helmet: 'demon', weapon: 'fireball', shield: null, armor: 'demon', tail: true, wings: 'small', scale: 0.96 },
    unlock: null
  },
  rohac: {
    id: 'rohac', faction: 'demoni', roleKey: 'kopi',
    name: 'Rohatý strážce', role: 'Kopiník s trojzubcem',
    desc: 'Trojzubec drží nepřítele v odstupu a těžkým jednotkám dává 1,8× zranění.',
    cost: 100, hp: 190, dmg: 21, attackInterval: 1.1, range: 46, speed: 50, armor: 0.15, spawnCooldown: 2.0, ranged: false,
    bonusVs: { tezka: 1.8 },
    look: { helmet: 'demon', weapon: 'trident', shield: null, armor: 'demon', tail: true, scale: 1.04 },
    unlock: null
  },
  zatracenec: {
    id: 'zatracenec', faction: 'demoni', roleKey: 'tezka',
    name: 'Zatracený rytíř', role: 'Pekelný rytíř',
    desc: 'Padlý rytíř v černé zbroji s plamenným mečem. Velmi odolný.',
    cost: 170, hp: 480, dmg: 36, attackInterval: 1.2, range: 30, speed: 42, armor: 0.32, spawnCooldown: 3.4, ranged: false,
    look: { helmet: 'hellhelm', weapon: 'flamesword', shield: null, armor: 'hellplate', cape: true, capeColor: '#3a0d0d', scale: 1.14 },
    unlock: null
  },
  demonkral: {
    id: 'demonkral', faction: 'demoni', roleKey: 'tezka', boss: true,
    name: 'Pekelný generál', role: 'Generál pekelných legií',
    desc: 'Azgaroth, Pekelný generál. Obrovský, jeho plamenný meč zasáhne až pět nepřátel najednou.',
    cost: 0, hp: 5200, dmg: 70, attackInterval: 1.5, range: 58, speed: 30, armor: 0.3, spawnCooldown: 0, ranged: false,
    cleave: 5,
    look: { helmet: 'hellhelm', weapon: 'flamesword', shield: null, armor: 'demon', wings: 'big', tail: true, cape: true, capeColor: '#2a0606', scale: 1.85 },
    unlock: null
  }
});

/* GENERÁLOVÉ DÉMONSKÉ ŘÍŠE (Akt V) a DÉMONICKÝ KRÁL – bossové. pal = vlastní barvy */
(function () {
  const base = GameData.units.demonkral;
  const gen = (id, name, desc, pal, extra) => (GameData.units[id] = Object.assign({}, base, {
    id, name, role: extra && extra.role || 'Generál pekelných legií', desc, pal, look: Object.assign({}, base.look, extra && extra.look || {})
  }, extra && extra.stats || {}));
  gen('g_popel', 'Skarnath', 'Generál popela. Kde projde, zůstane jen popel.',
    { skin: '#4a4448', tunic: '#1a1618', metal: '#2a2628', metalDark: '#100e10', fire: '#ff8a3a', wing: '#2a2426', cape: '#1a1416', trim: '#ff7a2a' },
    { stats: { hp: 5600, dmg: 74 } });
  gen('g_mor', 'Vargul', 'Generál moru. Jeho dech otravuje celé armády.',
    { skin: '#5a7a3a', tunic: '#1e2a14', metal: '#3a4a2a', metalDark: '#1a2410', fire: '#9be07a', wing: '#2e4a1e', cape: '#1e3014', trim: '#9be07a', eyes: '#c8ff6a' },
    { stats: { hp: 6200, dmg: 78 }, look: { weapon: 'trident' } });
  gen('g_krev', 'Belzar', 'Generál krve. Nejsilnější z Malakorových generálů.',
    { skin: '#8a0e14', tunic: '#3a0408', metal: '#5a0a10', metalDark: '#2a0206', fire: '#ff3a3a', wing: '#4a0408', cape: '#3a0206', trim: '#ff4a4a' },
    { stats: { hp: 7000, dmg: 86 } });
  gen('g_mraz', 'Hrimgar', 'Generál mrazu. Jeho meč mrazí krev v žilách.',
    { skin: '#5a8ab0', tunic: '#1a2a3a', metal: '#bfe6ff', metalDark: '#4a7aa0', fire: '#9fe0ff', wing: '#2a4a6a', cape: '#1a3048', trim: '#dff4ff', eyes: '#e6f8ff' },
    { stats: { hp: 7600, dmg: 90 } });
  gen('demonvladce', 'Malakor', 'Démonický král, vůdce všech démonů. Obrovský a téměř nezničitelný.',
    { skin: '#2a0a0a', tunic: '#120404', metal: '#1a1214', metalDark: '#080506', fire: '#ffd23f', wing: '#1a0606', cape: '#5a0a0a', trim: '#ffd23f', eyes: '#ffffff' },
    { role: 'Vládce všech démonů', stats: { hp: 11000, dmg: 110, cleave: 6 }, look: { helmet: 'demonking', scale: 2.25, capeColor: '#5a0a0a' } });
})();

GameData.factions.demoni = {
  id: 'demoni', name: 'Démoni', people: 'Legie Pekelného generála',
  desc: 'Běsi, ohniví chrliči a zatracení rytíři z Ohnivé hory.',
  strengths: 'Rychlí běsi, ohnivé koule, odolní pekelní rytíři.',
  theme: 'peklo', castleStyle: 'peklo', mapTheme: 'peklo',
  units: ['bes', 'chrlic', 'rohac', 'zatracenec'],
  roles: { pech: 'bes', strelec: 'chrlic', kopi: 'rohac', tezka: 'zatracenec' },
  color: '#8f1d14', emblem: 'lebka', enemyOnly: true,
  palettes: {
    player: { skin: '#b83a2c', hair: '#1a0d0d', eyes: '#ffd23f', tunic: '#2a1414', tunicDark: '#180909', trim: '#ff8a2a', metal: '#3a3438', metalDark: '#17141a', leather: '#3a1f18', leatherDark: '#200f0b', legs: '#7e2018', boots: '#1d0f0c', horn: '#e8dcc0', wing: '#5a1410', fire: '#ffb347', cape: '#3a0d0d', plume: '#ff5a2a' },
    enemy: { skin: '#b83a2c', hair: '#1a0d0d', eyes: '#ffd23f', tunic: '#2a1414', tunicDark: '#180909', trim: '#ff8a2a', metal: '#3a3438', metalDark: '#17141a', leather: '#3a1f18', leatherDark: '#200f0b', legs: '#7e2018', boots: '#1d0f0c', horn: '#e8dcc0', wing: '#5a1410', fire: '#ffb347', cape: '#3a0d0d', plume: '#ff5a2a' }
  },
  prologue: 'Před tisíci lety zapečetily tři národy Pekelného generála Azgarotha pod Ohnivou horou. Pečeť slábne.',
  organization: []
};
