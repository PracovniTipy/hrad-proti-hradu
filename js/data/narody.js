/* =========================================================================
   NÁRODY (FRAKCE) – Království, Samurajové, Vikingové
   Každý národ má:
     units        – své 4 jednotky (role: pech, strelec, kopi, tezka)
     roles        – převod role → id jednotky (kampaně a AI pracují s rolemi)
     palettes     – týmové barvy postav (já / nepřítel)
     theme        – vzhled bojiště a mapy příběhu
     castleStyle  – styl hradu
     organization – struktura armády (zobrazí se na obrazovce Hrad)
   Nový národ přidáte dalším záznamem + jednotkami v GameData.units.
   ========================================================================= */
window.GameData = window.GameData || {};

/* Role jednotek: kampaně a AI pracují s rolemi, takže stejná úroveň
   může obsahovat vojáky kteréhokoli národa. */
GameData.roles = {
  pech: { name: 'Pěchota' },
  strelec: { name: 'Střelec' },
  kopi: { name: 'Proti těžkým' },
  tezka: { name: 'Těžká jednotka' }
};

/* ---- Doplnění jednotek Království (role a národ) ---- */
Object.assign(GameData.units.pesak, { faction: 'kralovstvi', roleKey: 'pech' });
Object.assign(GameData.units.lucistnik, { faction: 'kralovstvi', roleKey: 'strelec' });
Object.assign(GameData.units.kopinik, { faction: 'kralovstvi', roleKey: 'kopi', bonusVs: { tezka: 2.0 } });
Object.assign(GameData.units.rytir, { faction: 'kralovstvi', roleKey: 'tezka' });

/* ---- SAMURAJOVÉ ---- */
Object.assign(GameData.units, {
  asigaru: {
    id: 'asigaru', faction: 'samurajove', roleKey: 'pech',
    name: 'Ašigaru', role: 'Pěchota',
    desc: 'Pěší voják v lakovaném plátu a klobouku džingasa. Rychlý a levný.',
    cost: 50, hp: 125, dmg: 16, attackInterval: 0.85, range: 24, speed: 56, armor: 0.06, spawnCooldown: 1.0, ranged: false,
    look: { helmet: 'jingasa', weapon: 'katana', shield: null, armor: 'ashi', sashimono: true, scale: 0.98 },
    unlock: null
  },
  jumi: {
    id: 'jumi', faction: 'samurajove', roleKey: 'strelec',
    name: 'Jumi-ašigaru', role: 'Lučištník',
    desc: 'Střílí z vysokého luku jumi. Má nejdelší dostřel ze všech lučištníků.',
    cost: 75, hp: 75, dmg: 16, attackInterval: 1.5, range: 235, speed: 46, armor: 0, spawnCooldown: 1.6, ranged: true,
    projectile: 'arrow', projectileSpeed: 600,
    look: { helmet: 'jingasa', weapon: 'yumi', shield: null, armor: 'ashi', sashimono: true, scale: 0.98 },
    unlock: null
  },
  jari: {
    id: 'jari', faction: 'samurajove', roleKey: 'kopi',
    name: 'Jari-ašigaru', role: 'Kopiník',
    desc: 'Dlouhé kopí jari drží nepřítele v odstupu. Těžkým jednotkám dává dvojnásobné zranění.',
    cost: 100, hp: 160, dmg: 22, attackInterval: 1.05, range: 48, speed: 50, armor: 0.1, spawnCooldown: 2.0, ranged: false,
    bonusVs: { tezka: 2.0 },
    look: { helmet: 'jingasa', weapon: 'yari', shield: null, armor: 'ashi', sashimono: true, scale: 1.0 },
    unlock: { campaign: 's1-3', text: 'Odemkne se po splnění úrovně 1-3 v Aktu II.' }
  },
  samuraj: {
    id: 'samuraj', faction: 'samurajove', roleKey: 'tezka',
    name: 'Samuraj', role: 'Elitní válečník',
    desc: 'Mistr meče v zbroji ó-jorój. První úder (iaidó) je dvojnásobný. Rychlejší než rytíř, ale méně obrněný.',
    cost: 160, hp: 360, dmg: 38, attackInterval: 1.0, range: 30, speed: 48, armor: 0.25, spawnCooldown: 3.2, ranged: false,
    firstStrike: 2.0,
    look: { helmet: 'kabuto', weapon: 'katana2', shield: null, armor: 'do', sashimono: true, scale: 1.1 },
    unlock: null
  }
});

/* ---- VIKINGOVÉ ---- */
Object.assign(GameData.units, {
  valecnik: {
    id: 'valecnik', faction: 'vikingove', roleKey: 'pech',
    name: 'Válečník', role: 'Pěchota',
    desc: 'Svobodný karl se sekerou a kulatým štítem. Vydrží víc než pěšák, ale je pomalejší.',
    cost: 55, hp: 165, dmg: 15, attackInterval: 0.95, range: 24, speed: 50, armor: 0.1, spawnCooldown: 1.1, ranged: false,
    look: { helmet: 'viking', weapon: 'axe', shield: 'vround', armor: 'fur', beard: true, scale: 1.02 },
    unlock: null
  },
  lovec: {
    id: 'lovec', faction: 'vikingove', roleKey: 'strelec',
    name: 'Lovec', role: 'Lučištník',
    desc: 'Lovec ze severních lesů. Střílí rychleji, ale na kratší vzdálenost.',
    cost: 65, hp: 85, dmg: 12, attackInterval: 1.15, range: 190, speed: 48, armor: 0, spawnCooldown: 1.4, ranged: true,
    projectile: 'arrow', projectileSpeed: 540,
    look: { helmet: 'furhood', weapon: 'bow', shield: null, armor: 'fur', beard: true, scale: 0.98 },
    unlock: null
  },
  stitonos: {
    id: 'stitonos', faction: 'vikingove', roleKey: 'kopi',
    name: 'Štítonoš', role: 'Štítová hradba',
    desc: 'Kopí a velký štít. Odolný (zbroj 25 %) a těžkým jednotkám dává 1,8× zranění.',
    cost: 100, hp: 210, dmg: 18, attackInterval: 1.15, range: 42, speed: 44, armor: 0.25, spawnCooldown: 2.0, ranged: false,
    bonusVs: { tezka: 1.8 },
    look: { helmet: 'viking', weapon: 'spear', shield: 'vround', armor: 'fur', mail: true, beard: true, scale: 1.04 },
    unlock: { campaign: 'v1-3', text: 'Odemkne se po splnění úrovně 1-3 v Aktu III.' }
  },
  berserk: {
    id: 'berserk', faction: 'vikingove', roleKey: 'tezka',
    name: 'Berserk', role: 'Zuřivý válečník',
    desc: 'Bojuje v medvědí kůži s dánskou sekerou. Nemá zbroj, ale pod polovinou životů propadne zuřivosti (+60 % útok).',
    cost: 160, hp: 470, dmg: 34, attackInterval: 1.1, range: 34, speed: 50, armor: 0, spawnCooldown: 3.2, ranged: false,
    rage: 1.6,
    look: { helmet: 'bear', weapon: 'daneaxe', shield: null, armor: 'bare', beard: true, cape: true, capeColor: '#5a3f2a', scale: 1.16 },
    unlock: null
  }
});

GameData.factions = {
  kralovstvi: {
    id: 'kralovstvi', name: 'Království', people: 'Rytíři Lví koruny',
    desc: 'Těžce obrnění rytíři, disciplinovaná pěchota a kamenné hrady.',
    strengths: 'Nejlepší zbroj, silní rytíři.',
    theme: 'evropa', castleStyle: 'evropa', mapTheme: 'evropa',
    units: ['pesak', 'lucistnik', 'kopinik', 'rytir'],
    roles: { pech: 'pesak', strelec: 'lucistnik', kopi: 'kopinik', tezka: 'rytir' },
    color: '#2f62b8', emblem: 'lily',
    palettes: { player: {}, enemy: {} },
    prologue: 'Království Lví koruny žilo léta v míru. Teď na hranicích hoří vesnice, ze severu připlouvají nájezdníci a v horách se probouzí Stínová legie. Jako maršál krále musíš království ubránit.',
    organization: [
      { title: 'Král', sub: 'Vládce Lví koruny', desc: 'Vyhlašuje válku a sídlí v hlavním hradě.' },
      { title: 'Maršál', sub: 'Ty – velitel polního vojska', desc: 'Řídí formace, posílá jednotky a vede bitvy.', you: true },
      { title: 'Rytíři', unit: 'rytir', desc: 'Šlechtici v plátové zbroji. Úderná síla armády.' },
      { title: 'Seržanti', sub: 'Velitelé pěších oddílů', desc: 'Drží šik pěchoty a kopiníků pohromadě.',
        children: [{ title: 'Pěšáci', unit: 'pesak' }, { title: 'Kopiníci', unit: 'kopinik' }] },
      { title: 'Lučištníci', unit: 'lucistnik', desc: 'Svobodní sedláci s dlouhými luky. Kryjí frontu zezadu.' }
    ]
  },
  samurajove: {
    id: 'samurajove', name: 'Samurajové', people: 'Klan Kazehana',
    desc: 'Rychlí mistři meče, ašigaru s kopími jari a luky s největším dostřelem.',
    strengths: 'Nejdelší dostřel, rychlé jednotky, silný první úder.',
    theme: 'japonsko', castleStyle: 'japonsko', mapTheme: 'japonsko',
    units: ['asigaru', 'jumi', 'jari', 'samuraj'],
    roles: { pech: 'asigaru', strelec: 'jumi', kopi: 'jari', tezka: 'samuraj' },
    color: '#2a3f7a', emblem: 'sakura',
    palettes: {
      player: { tunic: '#2a3f7a', tunicDark: '#1a2852', trim: '#d9b24a', metal: '#3b3f4c', metalDark: '#1d2028', lace: '#3d63c8', leather: '#5a3b26', leatherDark: '#3a2618', legs: '#262a38', boots: '#e8e2d2', mask: '#9b2a22', sashi: '#2a3f7a', mon: '#f3ead2', crest: '#f2c94c', skin: '#efc9a0', hair: '#1b1b1b', cape: '#2a3f7a', plume: '#3d63c8' },
      enemy: { tunic: '#a3262a', tunicDark: '#5f1214', trim: '#d9b24a', metal: '#2e2a2c', metalDark: '#151314', lace: '#d8423a', leather: '#4a3020', leatherDark: '#2e1d12', legs: '#3a1e1e', boots: '#e8e2d2', mask: '#262626', sashi: '#a3262a', mon: '#f3ead2', crest: '#e8c55a', skin: '#e6bd95', hair: '#1b1b1b', cape: '#a3262a', plume: '#d8423a' }
    },
    prologue: 'Země vycházejícího slunce je rozdělená. Klan Akabane pálí rýžová pole v provincii Kiri a regent Kurogane v hlavním městě touží po moci šóguna. Jako mladý daimjó klanu Kazehana musíš sjednotit provincie a ochránit císaře.',
    organization: [
      { title: 'Šógun', sub: 'Vojenský vládce země', desc: 'Daimjóové mu přísahají věrnost. Jeho místo chce regent Kurogane.' },
      { title: 'Daimjó', sub: 'Ty – pán klanu Kazehana', desc: 'Vládne provincii, hradu a armádě klanu.', you: true },
      { title: 'Karó', sub: 'Hlavní rádci', desc: 'Velí křídlům armády a radí v taktice.' },
      { title: 'Samurajové', unit: 'samuraj', desc: 'Šlechtičtí válečníci vázaní kodexem bušidó.' },
      { title: 'Ašigaru-gašira', sub: 'Velitelé ašigaru', desc: 'Vedou oddíly pěších vojáků v sevřeném šiku.',
        children: [{ title: 'Ašigaru', unit: 'asigaru' }, { title: 'Jari-ašigaru', unit: 'jari' }, { title: 'Jumi-ašigaru', unit: 'jumi' }] }
    ]
  },
  vikingove: {
    id: 'vikingove', name: 'Vikingové', people: 'Jarlové Bouřného fjordu',
    desc: 'Odolní válečníci se sekerami, štítové hradby a zuřiví berserkové.',
    strengths: 'Nejvíc životů, levná odolná pěchota, berserkové.',
    theme: 'sever', castleStyle: 'sever', mapTheme: 'sever',
    units: ['valecnik', 'lovec', 'stitonos', 'berserk'],
    roles: { pech: 'valecnik', strelec: 'lovec', kopi: 'stitonos', tezka: 'berserk' },
    color: '#3a6e8f', emblem: 'axes',
    palettes: {
      player: { tunic: '#3a6e8f', tunicDark: '#244a61', trim: '#d6b25a', metal: '#a2abb5', metalDark: '#5f6873', leather: '#6b4a2f', leatherDark: '#43301e', legs: '#6e5c47', boots: '#4a3624', fur: '#9a7d5c', hair: '#dcb66c', cape: '#2f5873', plume: '#5aa0c8', skin: '#f2cfae', shield2: '#efe3c6', bear: '#5a3f2a', wood: '#8a5a32' },
      enemy: { tunic: '#8f2b22', tunicDark: '#5a1813', trim: '#c9a24a', metal: '#9aa0a8', metalDark: '#575d66', leather: '#5e3f28', leatherDark: '#3a2618', legs: '#4f3f30', boots: '#3a2a1c', fur: '#5e4632', hair: '#b5562a', cape: '#6b1d17', plume: '#d8423a', skin: '#ecc5a2', shield2: '#2a2a2a', bear: '#3e2b1d', wood: '#6b4528' }
    },
    prologue: 'Jarl Hrafn Krutý zabral půlku fjordů a na jihu sílí Království. Na dalekém severu se navíc probouzí Mrazivá koruna a skaldové zpívají o Ragnaröku. Jako mladý jarl Bouřného fjordu musíš sjednotit klany a napsat vlastní ságu.',
    organization: [
      { title: 'Thing', sub: 'Sněm svobodných mužů', desc: 'Rozhoduje spory a volí krále. Jarl musí mít jeho podporu.' },
      { title: 'Jarl', sub: 'Ty – vládce Bouřného fjordu', desc: 'Vede nájezdy, rozděluje kořist a velí válečníkům.', you: true },
      { title: 'Hirð', sub: 'Osobní družina huskarlů', desc: 'Nejvěrnější válečníci, přísahali jarlovi život.',
        children: [{ title: 'Berserkové', unit: 'berserk' }, { title: 'Štítonoši', unit: 'stitonos' }] },
      { title: 'Karlové', sub: 'Svobodní sedláci a válečníci', desc: 'Jádro vojska, za kořist táhnou do bitvy.',
        children: [{ title: 'Válečníci', unit: 'valecnik' }, { title: 'Lovci', unit: 'lovec' }] },
      { title: 'Thrallové', sub: 'Nevolníci', desc: 'Nebojují. Veslují na lodích a starají se o osady.' }
    ]
  }
};

GameData.factionOrder = ['kralovstvi', 'samurajove', 'vikingove'];
GameData.unitOrder = GameData.factionOrder.flatMap(f => GameData.factions[f].units);
GameData.factionUnits = f => (GameData.factions[f] || GameData.factions.kralovstvi).units;
GameData.unitForRole = (f, role) => (GameData.factions[f] || GameData.factions.kralovstvi).roles[role];

/* Pořadí v šiku podle role: menší číslo = blíž k nepříteli */
GameData.formationRank = { tezka: 0, pech: 1, kopi: 2, strelec: 3 };
