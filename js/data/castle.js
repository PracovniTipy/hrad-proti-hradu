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
  { id: 'zbrojnice', name: 'Zbrojnice', desc: 'Víc mincí hned na začátku boje.', maxLevel: 8, baseCost: 220, growth: 1.5 },
  { id: 'olej', name: 'Vroucí olej', desc: 'Obrana na blízko: z hradeb se lije vroucí olej na nepřátele přímo u brány (do 30 m). Zraní a zapálí je.', maxLevel: 5, baseCost: 600, growth: 1.75 }
];

GameData.calc = {
  buildingCost(b, level) {
    return Math.round(b.baseCost * Math.pow(b.growth, level) / 10) * 10;
  },
  castleHp: (l) => 2000 + l * 350,
  income: (l) => (16 + l * 2.2) * 0.95,   // o 5 % pomalejší příjem mincí
  unitMult: (l) => 1 + l * 0.06,
  towerDmg: (l) => (l > 0 ? 8 + l * 5 : 0),
  maxCoins: (l) => 600 + l * 100,
  startCoins: (l) => 120 + l * 60,
  oilDmg: (l) => (l > 0 ? 45 + l * 30 : 0),   // Vroucí olej: zranění každému u brány každých 7 s     // Zbrojnice: mince na začátku boje (v boji už žádný strop)

  /* Popis efektu budovy pro danou úroveň */
  effectText(id, l) {
    const c = GameData.calc;
    switch (id) {
      case 'hradby': return t('eff_hp', { n: c.castleHp(l).toLocaleString('cs-CZ') });
      case 'pokladnice': return t('eff_income', { n: c.income(l).toFixed(1) });
      case 'kasarna': return t('eff_power', { n: Math.round((c.unitMult(l) - 1) * 100) });
      case 'vez': return l > 0 ? t('eff_tower', { n: c.towerDmg(l) }) : t('eff_tower0');
      case 'zbrojnice': return t('eff_limit', { n: c.startCoins(l) });
      case 'olej': return l > 0 ? t('eff_oil', { n: c.oilDmg(l) }) : t('eff_oil0');
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
      startCoins: c.startCoins(b.zbrojnice || 0),
      oilDmg: c.oilDmg(b.olej || 0)
    };
  },

  /* Statistiky nepřítele podle obtížnosti.
     Nepřátelští vojáci jsou STEJNĚ silní jako základní vojáci hráče stejného druhu
     (lučištník = lučištník). Obtížnost dělá jen příjem mincí nepřítele, velikost
     jeho vln, životy hradu a věž – rozhoduje strategie. */
  enemyStats(diff) {
    return {
      castleHp: Math.round(2000 * (0.75 + 0.25 * diff) / 50) * 50,
      income: 16 * 0.95 * (0.8 + 0.2 * diff),
      hpMult: 1,
      dmgMult: 1,
      towerDmg: diff >= 1.2 ? Math.round(6 + diff * 7) : 0,
      maxCoins: 900
    };
  }
};

/* Logika protivníků: kopí zastaví jízdu, jízda rozpráší střelce, mág zraňuje skupiny */
Object.values(GameData.units).forEach(u => {
  if (u.roleKey === 'kopi') u.bonusVs = Object.assign({ jizda: 2.0 }, u.bonusVs || {});
  if (u.roleKey === 'jizda') u.bonusVs = Object.assign({ strelec: 1.6, mag: 1.6 }, u.bonusVs || {});
  if (u.roleKey === 'strelec') u.bonusVs = Object.assign({ pech: 1.25 }, u.bonusVs || {});
});
