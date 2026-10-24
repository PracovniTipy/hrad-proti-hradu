/* =========================================================================
   OBCHOD A ÚPRAVA HRADU
   - nabídka skinů je v skins.js (unitSkins, castleSkins)
   - zde jsou dekorace hradu, barvy, znaky a nabídky drahokamů
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.castleCustom = {
  colors: [
    { id: '#2f62b8', name: 'Královská modř' }, { id: '#a8262a', name: 'Šarlat' }, { id: '#2e7d4a', name: 'Smaragd' },
    { id: '#6b3fa0', name: 'Purpur' }, { id: '#c9962a', name: 'Zlato' }, { id: '#2a2a33', name: 'Noc' },
    { id: '#e9e4d6', name: 'Slonovina' }, { id: '#2b8a8f', name: 'Tyrkys' }, { id: '#d2691e', name: 'Jantar' }
  ],
  roofs: [
    { id: 'auto', name: 'Podle vzhledu hradu' }, { id: '#4a5260', name: 'Břidlice' }, { id: '#a5523a', name: 'Cihla' },
    { id: '#2f62b8', name: 'Modrá' }, { id: '#a8262a', name: 'Rudá' }, { id: '#2e7d4a', name: 'Zelená' },
    { id: '#c9962a', name: 'Zlatá' }, { id: '#2a2a33', name: 'Černá' }
  ],
  emblems: [
    { id: 'lilie', name: 'Lilie' }, { id: 'lev', name: 'Lev' }, { id: 'orel', name: 'Orel' }, { id: 'kriz', name: 'Kříž' },
    { id: 'slunce', name: 'Slunce' }, { id: 'hvezda', name: 'Hvězda' }, { id: 'sakura', name: 'Sakura' },
    { id: 'havran', name: 'Havran' }, { id: 'sekery', name: 'Sekery' }
  ],
  decorations: [
    { id: 'pochodne', name: 'Pochodně u brány', desc: 'Dvě planoucí pochodně, které osvětlují bránu.', price: 400 },
    { id: 'prapory', name: 'Velké prapory', desc: 'Dlouhé prapory se znakem hradu na hradbách.', price: 500 },
    { id: 'stity', name: 'Erbovní štíty', desc: 'Řada štítů se znakem podél hradeb.', price: 600 },
    { id: 'zahrada', name: 'Zahrada', desc: 'Keře a květiny kolem paty hradu.', price: 350 },
    { id: 'zlato', name: 'Zlacení', desc: 'Zlaté pásy, okraje brány a zlaté špice na stožárech.', price: 900 }
  ]
};

/* Výchozí znak podle národa */
GameData.defaultEmblem = { kralovstvi: 'lilie', samurajove: 'sakura', vikingove: 'havran' };

/* Drahokamy – v prototypu jen za zlato nebo denní odměnu (žádné skutečné platby) */
GameData.gemOffers = {
  daily: { gems: 25, gold: 300 },
  exchange: [
    { id: 'x1', gold: 1000, gems: 40 },
    { id: 'x2', gold: 2400, gems: 110 },
    { id: 'x3', gold: 5000, gems: 260 }
  ],
  realMoney: [
    { name: 'Hrst drahokamů', gems: 100, price: '49 Kč' },
    { name: 'Truhla drahokamů', gems: 550, price: '199 Kč' },
    { name: 'Královská pokladnice', gems: 1200, price: '399 Kč' }
  ]
};

/* Nové skiny do obchodu */
GameData.unitSkins.push(
  { id: 'pulnoc', name: 'Půlnoční hlídka', rarity: 'Vzácný', price: 90, desc: 'Temně modrá a stříbro.',
    palette: { tunic: '#1f2f5c', tunicDark: '#141e3c', trim: '#c9d3e0', metal: '#d8dee8', metalDark: '#8692a4', cape: '#1a284f', plume: '#9fb8e8', lace: '#c9d3e0' } },
  { id: 'rudy_drak', name: 'Rudý drak', rarity: 'Epický', price: 180, desc: 'Karmínová zbroj se zlatým drakem.',
    palette: { tunic: '#8a1c1c', tunicDark: '#561010', trim: '#f2c94c', metal: '#5a2a24', metalDark: '#2e1512', cape: '#6e1414', plume: '#f2c94c', lace: '#f2c94c', mask: '#f2c94c' },
    ornament: 'horns' },
  { id: 'smaragd', name: 'Smaragdový strážce', rarity: 'Legendární', price: 300, desc: 'Zelené kování a zářící zbraně.',
    palette: { tunic: '#1f6b4a', tunicDark: '#124430', trim: '#f2d36b', metal: '#cfe8d8', metalDark: '#6fa58a', cape: '#18573c', plume: '#7ee0a8', lace: '#f2d36b' },
    ornament: 'crown', glow: '#7ee0a8' }
);
GameData.castleSkins.push(
  { id: 'mramor', name: 'Mramorový palác', rarity: 'Legendární', price: 320, desc: 'Bílý mramor a zlaté střechy.',
    palette: { stone: '#e8e4dc', stoneDark: '#b9b2a4', stoneLight: '#fbf9f4', roof: '#d4a83a', roofDark: '#8f6a17', window: '#2a3a5a', trim: '#f2c94c' } }
);
