/* =========================================================================
   SKINY – POUZE KOSMETIKA
   Skin mění jen barvy a ozdoby. Na statistiky jednotek ani hradu nemá vliv.
   Nový skin přidáte novým záznamem do pole – nic dalšího se měnit nemusí.
     palette  – přepíše barvy z týmové palety (viz teamPalettes)
     ornament – volitelná ozdoba helmy: 'horns' | 'crown' | 'crystal'
     glow     – volitelná barva záře zbraně
   ========================================================================= */
window.GameData = window.GameData || {};

/* Výchozí týmové barvy (modrá = já, červená = nepřítel) */
GameData.teamPalettes = {
  player: {
    teamRing: 'rgba(80,150,255,.75)',
    tunic: '#2f62b8', tunicDark: '#1c3d7a', trim: '#e9c35a',
    metal: '#cfd4dc', metalDark: '#7b8592',
    leather: '#7a5233', leatherDark: '#4c321e',
    skin: '#f0c9a0', cape: '#234a9c', plume: '#4b8df0',
    wood: '#8a5a32', string: '#e9e4d6', eyes: '#1b1b1b', hair: '#6b4426', iris: '#3d6a96'
  },
  enemy: {
    teamRing: 'rgba(240,70,60,.75)',
    tunic: '#a8262a', tunicDark: '#6b1417', trim: '#d9b04a',
    metal: '#c3c6cc', metalDark: '#6f7580',
    leather: '#6b4630', leatherDark: '#43291b',
    skin: '#e6b98f', cape: '#7d1a1d', plume: '#e53935',
    wood: '#7a4c2a', string: '#e9e4d6', eyes: '#1b1b1b', hair: '#2e2018', iris: '#5a3a22'
  }
};

GameData.unitSkins = [
  {
    id: 'zakladni', name: 'Týmová zbroj', rarity: 'Základní', price: 0,
    desc: 'Klasické barvy tvého království.',
    palette: {}
  },
  {
    id: 'lesni', name: 'Lesní hraničáři', rarity: 'Vzácný', price: 60,
    desc: 'Zelené pláště a bronzové kování.',
    palette: { tunic: '#3d7a3a', tunicDark: '#264f27', trim: '#c79a3f', cape: '#2e5d2b', plume: '#8bc34a', metal: '#c9b48a', metalDark: '#86704a' }
  },
  {
    id: 'stinovy', name: 'Stínová legie', rarity: 'Epický', price: 150,
    desc: 'Černá ocel, rudé oči a rohaté helmy.',
    palette: { tunic: '#2b1e30', tunicDark: '#170f1a', trim: '#c4262e', metal: '#4d4857', metalDark: '#29252f', cape: '#7a1218', plume: '#c4262e', eyes: '#ff3b30', skin: '#c9a08a' },
    ornament: 'horns'
  },
  {
    id: 'zlaty', name: 'Zlatý paladin', rarity: 'Legendární', price: 250,
    desc: 'Bílý plášť a zlacená zbroj.',
    palette: { tunic: '#f1ede2', tunicDark: '#c9c1ad', trim: '#f5d36b', metal: '#e8c45c', metalDark: '#a47a24', cape: '#f4efe0', plume: '#ffffff' },
    ornament: 'crown', glow: '#ffe28a'
  },
  {
    id: 'ledovy', name: 'Ledová stráž', rarity: 'Legendární', price: 250,
    desc: 'Krystalová zbroj z věčného ledu.',
    palette: { tunic: '#3a7cc2', tunicDark: '#245890', trim: '#e6f6ff', metal: '#bfe6ff', metalDark: '#6aa4d4', cape: '#5aa9e6', plume: '#dff4ff' },
    ornament: 'crystal', glow: '#7fd3ff'
  }
];

/* Skiny hradů */
GameData.castleSkins = [
  {
    id: 'kralovsky', name: 'Královský hrad', rarity: 'Základní', price: 0,
    desc: 'Šedý kámen a střechy v barvě tvého týmu.',
    palette: { stone: '#a3a9b2', stoneDark: '#6b717b', stoneLight: '#c7ccd3', roof: null, roofDark: null, window: '#1b2030', trim: '#e0b84e' }
  },
  {
    id: 'pisecna', name: 'Pouštní pevnost', rarity: 'Vzácný', price: 80,
    desc: 'Pískovec a měděné střechy.',
    palette: { stone: '#d2b483', stoneDark: '#9c7d4f', stoneLight: '#ead2a5', roof: '#b8662e', roofDark: '#7d401a', window: '#2a1c12', trim: '#f0c35a' }
  },
  {
    id: 'temna', name: 'Temná tvrz', rarity: 'Epický', price: 180,
    desc: 'Čedič, rudé střechy a fialově žhnoucí okna.',
    palette: { stone: '#4b4855', stoneDark: '#2c2a33', stoneLight: '#66626f', roof: '#8e1c22', roofDark: '#560f13', window: '#b25cff', trim: '#c4262e', glowWindows: true }
  },
  {
    id: 'ledova', name: 'Ledová citadela', rarity: 'Legendární', price: 280,
    desc: 'Modrobílý led, který se třpytí.',
    palette: { stone: '#cfe6f5', stoneDark: '#8db6d3', stoneLight: '#f1f9ff', roof: '#3d8fd8', roofDark: '#225f99', window: '#2a6aa8', trim: '#e6f6ff', glowWindows: true }
  }
];

/* Barvy týmu pro střechy a prapory, pokud je skin nemá vlastní */
GameData.teamCastleColors = {
  player: { roof: '#2f62b8', roofDark: '#1c3d7a', banner: '#2f62b8', emblem: '#f2c94c' },
  enemy: { roof: '#a8262a', roofDark: '#6b1417', banner: '#a8262a', emblem: '#f2c94c' }
};

GameData.rarityColors = {
  'Základní': '#9aa6bb',
  'Vzácný': '#5fb85a',
  'Epický': '#b27cff',
  'Legendární': '#f2b440'
};
