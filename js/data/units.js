/* =========================================================================
   DATA JEDNOTEK A SCHOPNOSTÍ
   Novou jednotku přidáte tak, že:
     1) přidáte záznam do GameData.units (statistiky + "look" = vzhled),
     2) přidáte její id do GameData.unitOrder (pořadí tlačítek),
     3) volitelně nastavíte "unlock" (např. po splnění úrovně kampaně).
   Kreslení postavy se řídí polem "look" – není potřeba psát novou grafiku,
   pokud nová jednotka kombinuje existující helmy/zbraně/štíty.
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.units = {
  pesak: {
    id: 'pesak',
    name: 'Pěšák',
    role: 'Pěchota',
    desc: 'Levný bojovník s mečem a štítem. Drží frontu a kryje lučištníky.',
    cost: 50,
    hp: 140,
    dmg: 15,
    attackInterval: 0.9,
    range: 24,
    speed: 52,
    armor: 0.10,
    spawnCooldown: 1.0,
    ranged: false,
    look: { helmet: 'kettle', weapon: 'sword', shield: 'round', armor: 'mail', cape: false, scale: 1 },
    unlock: null
  },
  lucistnik: {
    id: 'lucistnik',
    name: 'Lučištník',
    role: 'Střelec',
    desc: 'Střílí šípy z velké dálky. Má málo životů, potřebuje krytí.',
    cost: 70,
    hp: 80,
    dmg: 14,
    attackInterval: 1.4,
    range: 210,
    speed: 46,
    armor: 0,
    spawnCooldown: 1.5,
    ranged: true,
    projectile: 'arrow',
    projectileSpeed: 560,
    look: { helmet: 'hood', weapon: 'bow', shield: null, armor: 'leather', cape: false, scale: 0.97 },
    unlock: null
  },
  kopinik: {
    id: 'kopinik',
    name: 'Kopiník',
    role: 'Proti rytířům',
    desc: 'Dlouhé kopí mu dává dosah. Způsobuje rytířům dvojnásobné zranění.',
    cost: 100,
    hp: 170,
    dmg: 20,
    attackInterval: 1.1,
    range: 40,
    speed: 48,
    armor: 0.15,
    spawnCooldown: 2.0,
    ranged: false,
    bonusVs: { rytir: 2.0 },
    look: { helmet: 'nasal', weapon: 'spear', shield: null, armor: 'mail', cape: false, scale: 1.02 },
    unlock: { campaign: '1-3', text: 'Odemkne se po splnění úrovně 1-3 v Aktu I.' }
  },
  rytir: {
    id: 'rytir',
    name: 'Rytíř',
    role: 'Těžká jednotka',
    desc: 'Plátová zbroj pohltí třetinu zranění. Pomalý, ale ničivý.',
    cost: 160,
    hp: 420,
    dmg: 34,
    attackInterval: 1.25,
    range: 28,
    speed: 40,
    armor: 0.35,
    spawnCooldown: 3.5,
    ranged: false,
    look: { helmet: 'great', weapon: 'longsword', shield: 'kite', armor: 'plate', cape: true, scale: 1.14 },
    unlock: null
  }
};

/* Pořadí tlačítek v boji a v nabídkách */
GameData.unitOrder = ['pesak', 'lucistnik', 'kopinik', 'rytir'];

/* Schopnosti v boji (platí se mincemi z boje) */
GameData.abilities = {
  ohen: {
    id: 'ohen',
    name: 'Ohnivý déšť',
    desc: 'Na nejbližší skupinu nepřátel dopadnou ohnivé koule.',
    cost: 150,
    cooldown: 14,
    damage: 120,
    radius: 130
  },
  stit: {
    id: 'stit',
    name: 'Štít víry',
    desc: 'Tvoji vojáci dostávají 6 sekund o polovinu menší zranění.',
    cost: 200,
    cooldown: 24,
    duration: 6,
    reduction: 0.5
  }
};

/* FORMACE – rozkazy pro celou armádu
   utok    = všichni postupují na nepřátelský hrad
   formace = vojáci se seřadí u praporu (rytíři vpředu, lučištníci vzadu) a drží linii
   ustup   = vojáci se stáhnou k vlastnímu hradu a seřadí se tam */
GameData.formations = {
  utok:    { id: 'utok', name: 'Útok', desc: 'Všichni na nepřítele!' },
  formace: { id: 'formace', name: 'Formace', desc: 'Seřadit se u praporu a držet linii. Klepnutím na bojiště přesuneš prapor.' },
  ustup:   { id: 'ustup', name: 'Ústup', desc: 'Stáhnout se k hradu a přeskupit.' }
};
/* Pořadí v šiku: menší číslo = blíž k nepříteli */
GameData.formationRank = { rytir: 0, pesak: 1, kopinik: 2, lucistnik: 3 };
GameData.formationConfig = { rows: 4, colSpacing: 40 };

/* Základní nastavení souboje */
GameData.battleConfig = {
  worldW: 2600,         // delší bojiště
  worldH: 600,
  viewTop: 60,          // horní okraj viditelné scény (nebe nad ním se ořízne)
  groundY: 492,         // úroveň patky hradů
  laneTop: 474,         // rozsah "hloubky", kde chodí vojáci
  laneBottom: 540,
  playerFront: 262,     // čelo (brána) mého hradu
  enemyFront: 2338,     // čelo nepřátelského hradu (worldW - 262)
  timeLimit: 300,       // sekund (5 minut)
  startCoins: 120,
  killRewardRatio: 0.3, // podíl ceny jednotky, který dostaneš za zabití
  unitScale: 1.45,      // velikost postav na bojišti
  rangeScale: 1.3,      // dosah se násobí kvůli velikosti postav
  speedScale: 1.2       // rychlost chůze se násobí
};
