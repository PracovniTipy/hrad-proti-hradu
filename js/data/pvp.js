/* =========================================================================
   PVP A ŽEBŘÍČEK – UKÁZKOVÁ DATA
   !!! Tito hráči jsou vymyšlení. V prototypu proti nim hraje počítač (bot),
   který používá jejich hrad, skin a sílu. Skutečné online PvP vyžaduje
   server – viz ONLINE_ARCHITEKTURA.md.
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.pvpRules = {
  maxAttacks: 3,
  /* Násobič obtížnosti pro 1., 2. a 3. útok na stejného soupeře */
  attackDifficulty: [1.0, 1.3, 1.65],
  attackLabels: ['Normální', 'Těžká', 'Velmi těžká'],
  trophyReward: [30, 45, 70],
  goldReward: [150, 250, 400],
  trophyLoss: 10,
  opponentsPerSeason: 5
};

GameData.demoPlayers = [
  { id: 'd01', name: 'DarkLord', trophies: 3245, castleLevel: 14, castleSkin: 'temna', unitSkin: 'stinovy' },
  { id: 'd02', name: 'BlazeKing', trophies: 3180, castleLevel: 13, castleSkin: 'pisecna', unitSkin: 'zlaty' },
  { id: 'd03', name: 'Shadow', trophies: 3120, castleLevel: 13, castleSkin: 'temna', unitSkin: 'stinovy' },
  { id: 'd04', name: 'WarriorCZ', trophies: 3010, castleLevel: 12, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd05', name: 'IceQueen', trophies: 2980, castleLevel: 12, castleSkin: 'ledova', unitSkin: 'ledovy' },
  { id: 'd06', name: 'KnightPro', trophies: 2940, castleLevel: 12, castleSkin: 'kralovsky', unitSkin: 'zlaty' },
  { id: 'd07', name: 'Ragnar', trophies: 2880, castleLevel: 11, castleSkin: 'pisecna', unitSkin: 'lesni' },
  { id: 'd08', name: 'Samurai', trophies: 2760, castleLevel: 11, castleSkin: 'temna', unitSkin: 'zakladni' },
  { id: 'd09', name: 'DragonSlayer', trophies: 2700, castleLevel: 10, castleSkin: 'kralovsky', unitSkin: 'stinovy' },
  { id: 'd10', name: 'Titan', trophies: 2650, castleLevel: 10, castleSkin: 'ledova', unitSkin: 'zakladni' },
  { id: 'd11', name: 'Vojvoda', trophies: 2380, castleLevel: 9, castleSkin: 'pisecna', unitSkin: 'zakladni' },
  { id: 'd12', name: 'StříbrnýŠíp', trophies: 2120, castleLevel: 8, castleSkin: 'kralovsky', unitSkin: 'lesni' },
  { id: 'd13', name: 'Bořivoj', trophies: 1860, castleLevel: 7, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd14', name: 'Morana', trophies: 1640, castleLevel: 6, castleSkin: 'temna', unitSkin: 'stinovy' },
  { id: 'd15', name: 'Hradník', trophies: 1490, castleLevel: 6, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd16', name: 'Lesana', trophies: 1360, castleLevel: 5, castleSkin: 'pisecna', unitSkin: 'lesni' },
  { id: 'd17', name: 'Kovář', trophies: 1250, castleLevel: 5, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd18', name: 'Ledoborec', trophies: 1140, castleLevel: 4, castleSkin: 'ledova', unitSkin: 'ledovy' },
  { id: 'd19', name: 'Zbyhněv', trophies: 1020, castleLevel: 4, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd20', name: 'Vrána', trophies: 910, castleLevel: 3, castleSkin: 'temna', unitSkin: 'zakladni' },
  { id: 'd21', name: 'Rytíř Jan', trophies: 820, castleLevel: 3, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd22', name: 'Panoš', trophies: 700, castleLevel: 2, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd23', name: 'Mlynář', trophies: 560, castleLevel: 2, castleSkin: 'pisecna', unitSkin: 'zakladni' },
  { id: 'd24', name: 'Lovec', trophies: 430, castleLevel: 2, castleSkin: 'kralovsky', unitSkin: 'lesni' },
  { id: 'd25', name: 'Strážný', trophies: 310, castleLevel: 1, castleSkin: 'kralovsky', unitSkin: 'zakladni' },
  { id: 'd26', name: 'Učeň', trophies: 190, castleLevel: 1, castleSkin: 'pisecna', unitSkin: 'zakladni' },
  { id: 'd27', name: 'Nováček', trophies: 80, castleLevel: 1, castleSkin: 'kralovsky', unitSkin: 'zakladni' }
];

/* Národ ukázkových hráčů (podle hradu) */
GameData.demoPlayers.forEach((p, i) => {
  p.faction = ['kralovstvi', 'samurajove', 'vikingove'][[0, 1, 2, 1, 2, 0, 2, 1, 0, 2, 1, 0, 0, 2, 1, 2, 0, 2, 1, 2, 0, 1, 0, 2, 0, 1, 0][i] || 0];
});

GameData.pvpHelpers = {
  /* Základní síla soupeře podle jeho trofejí (0,7 – 1,9) */
  basePower(opp) {
    return Math.max(0.7, Math.min(1.9, 0.6 + opp.trophies / 2600));
  },
  difficulty(opp, attackIndex) {
    return this.basePower(opp) * GameData.pvpRules.attackDifficulty[attackIndex];
  },
  /* Vybere soupeře s podobným počtem trofejí */
  pickOpponents(trophies, seed) {
    const n = GameData.pvpRules.opponentsPerSeason;
    const sorted = GameData.demoPlayers.slice().sort((a, b) => Math.abs(a.trophies - trophies) - Math.abs(b.trophies - trophies));
    const pool = sorted.slice(0, n + 3);
    // jednoduché deterministické promíchání podle sezóny
    let s = (seed * 9301 + 49297) % 233280;
    for (let i = pool.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, n).sort((a, b) => b.trophies - a.trophies).map(p => p.id);
  },
  byId(id) {
    return GameData.demoPlayers.find(p => p.id === id);
  }
};
