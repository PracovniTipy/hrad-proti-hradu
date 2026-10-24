/* =========================================================================
   SPRÁVA HRADU – BUDOVY A VYLEPŠENÍ
   Každá budova má úroveň 0..maxLevel. Efekty se počítají v GameData.calc.
   Novou budovu přidáte záznamem do pole a jejím efektem v calc.battleStats.
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.buildings = [
  { id: 'hradby', name: 'Hradby', desc: 'Silnější zdi = více životů hradu.', maxLevel: 10, baseCost: 250, growth: 1.55 },
  { id: 'pokladnice', name: 'Pokladnice', desc: 'Rychlejší příjem mincí během boje.', maxLevel: 10, baseCost: 300, growth: 1.6 },
  { id: 'kasarna', name: 'Kasárna', desc: '+6 % životů a útoku všech vojáků za úroveň.', maxLevel: 10, baseCost: 350, growth: 1.62 },
  { id: 'vez', name: 'Strážní věž', desc: 'Lučištníci na věži střílí na nepřátele u brány.', maxLevel: 10, baseCost: 280, growth: 1.58 },
  { id: 'zbrojnice', name: 'Zbrojnice', desc: 'Víc mincí hned na začátku boje.', maxLevel: 8, baseCost: 220, growth: 1.5 }
];

GameData.calc = {
  buildingCost(b, level) {
    return Math.round(b.baseCost * Math.pow(b.growth, level) / 10) * 10;
  },
  castleHp: (l) => 2000 + l * 350,
  income: (l) => 16 + l * 2.2,
  unitMult: (l) => 1 + l * 0.06,
  towerDmg: (l) => (l > 0 ? 8 + l * 5 : 0),
  maxCoins: (l) => 600 + l * 100,
  startCoins: (l) => 120 + l * 60,     // Zbrojnice: mince na začátku boje (v boji už žádný strop)

  /* Popis efektu budovy pro danou úroveň */
  effectText(id, l) {
    const c = GameData.calc;
    switch (id) {
      case 'hradby': return t('eff_hp', { n: c.castleHp(l).toLocaleString('cs-CZ') });
      case 'pokladnice': return t('eff_income', { n: c.income(l).toFixed(1) });
      case 'kasarna': return t('eff_power', { n: Math.round((c.unitMult(l) - 1) * 100) });
      case 'vez': return l > 0 ? t('eff_tower', { n: c.towerDmg(l) }) : t('eff_tower0');
      case 'zbrojnice': return t('eff_limit', { n: c.startCoins(l) });
      default: return '';
    }
  },

  /* Úroveň hradu = souhrn úrovní budov */
  castleLevel(save) {
    const sum = Object.values(save.buildings).reduce((a, b) => a + b, 0);
    return 1 + Math.floor(sum / 3);
  },

  /* Statistiky hráče do boje odvozené z budov */
  battleStats(save) {
    const b = save.buildings, c = GameData.calc;
    return {
      castleHp: c.castleHp(b.hradby || 0),
      income: c.income(b.pokladnice || 0),
      unitMult: c.unitMult(b.kasarna || 0),
      towerDmg: c.towerDmg(b.vez || 0),
      maxCoins: Infinity,
      startCoins: c.startCoins(b.zbrojnice || 0)
    };
  },

  /* Statistiky nepřítele podle obtížnosti (1,0 = vyrovnaný soupeř) */
  enemyStats(diff) {
    return {
      castleHp: Math.round(2000 * (0.7 + 0.3 * diff) / 50) * 50,
      income: 16 * (0.72 + 0.28 * diff),
      hpMult: diff,
      dmgMult: 0.6 + 0.4 * diff,
      towerDmg: diff >= 1.2 ? Math.round(6 + diff * 7) : 0,
      maxCoins: 900
    };
  }
};
