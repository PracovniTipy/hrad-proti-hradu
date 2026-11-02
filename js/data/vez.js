/* =========================================================================
   CASTLE TOWER – NEKONEČNÁ VĚŽ (1000+ pater)
   Každé patro = samostatné království s vlastním hradem, generálem,
   prostředím, podmínkami a odměnou. Patra se generují z čísla patra
   (seedovaný generátor) → každé patro je pokaždé stejné a postup jde uložit.
   Obtížnost roste hlavně INTELIGENCÍ generála (dovednost, osobnost, kouzla,
   obránci, podmínky), čísla síly rostou jen mírně.
   ========================================================================= */
window.GameData = window.GameData || {};
(function () {
  const G = GameData;
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;

  /* deterministický generátor náhody pro patro */
  function rng(seed) {
    let a = (seed * 2654435761) >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  /* ---------------- TIERY ---------------- */
  const TIERS = [
    { from: 1, to: 50, cs: 'Základní generálové', en: 'Basic Generals', color: '#9fd4ff' },
    { from: 51, to: 150, cs: 'Zkušení velitelé', en: 'Seasoned Commanders', color: '#7fe08a' },
    { from: 151, to: 300, cs: 'Elitní stratégové', en: 'Elite Strategists', color: '#c07cff' },
    { from: 301, to: 500, cs: 'Legendární generálové', en: 'Legendary Generals', color: '#ffcf4a' },
    { from: 501, to: 750, cs: 'Mistři války', en: 'Masters of War', color: '#ff8a4a' },
    { from: 751, to: 999, cs: 'Nejnebezpečnější protivníci', en: 'The Deadliest Foes', color: '#ff4a5a' },
    { from: 1000, to: Infinity, cs: 'Absolutní výzvy', en: 'Absolute Challenges', color: '#ff5a8a' }
  ];
  const tierOf = n => TIERS.findIndex(t => n >= t.from && n <= t.to);

  /* ---------------- JMÉNA ---------------- */
  const NAMES = {
    kralovstvi: { first: ['Aldric', 'Bertold', 'Cedric', 'Dietrich', 'Edmund', 'Falk', 'Godfrey', 'Hartmut', 'Ivo', 'Konrád', 'Leopold', 'Matyáš', 'Oldřich', 'Přemysl', 'Roderik', 'Sigmund', 'Tristan', 'Vilém', 'Zikmund', 'Bořivoj'],
      title: [['Baron', 'Baron'], ['Hrabě', 'Count'], ['Vévoda', 'Duke'], ['Maršál', 'Marshal'], ['Lord', 'Lord'], ['Rytíř', 'Sir'], ['Kastelán', 'Castellan']],
      epit: [['Železný', 'the Iron'], ['Černý', 'the Black'], ['Neústupný', 'the Unyielding'], ['Lstivý', 'the Cunning'], ['Krvavý', 'the Bloody'], ['Moudrý', 'the Wise'], ['Lví srdce', 'Lionheart'], ['Šedý', 'the Grey']],
      realm: [['Kamenné', 'Stone'], ['Stříbrné', 'Silver'], ['Rudé', 'Red'], ['Jestřábí', 'Hawk'], ['Mlžné', 'Misty'], ['Zlaté', 'Golden'], ['Dubové', 'Oaken'], ['Vraní', 'Raven']] },
    samurajove: { first: ['Hideo', 'Kenshin', 'Masamune', 'Nobuo', 'Ryōma', 'Shingen', 'Takeda', 'Yoshiro', 'Hanzō', 'Kagetora', 'Musashi', 'Tadakatsu', 'Ujiyasu', 'Yukimura'],
      title: [['Daimjó', 'Daimyō'], ['Šógun', 'Shōgun'], ['Taišó', 'Taishō'], ['Rónin', 'Rōnin'], ['Hatamoto', 'Hatamoto']],
      epit: [['Tichý', 'the Silent'], ['Bouřlivý', 'the Storm'], ['Rudý drak', 'Red Dragon'], ['Měsíční', 'of the Moon'], ['Nezlomný', 'the Unbroken'], ['Stínový', 'the Shadow']],
      realm: [['Sakurové', 'Sakura'], ['Bambusové', 'Bamboo'], ['Hromové', 'Thunder'], ['Měsíční', 'Moon'], ['Ohnivé', 'Fire'], ['Jadeitové', 'Jade']] },
    vikingove: { first: ['Ulfr', 'Bjorn', 'Halvar', 'Ragnar', 'Sigurd', 'Thorkell', 'Eirik', 'Gunnar', 'Ivar', 'Knut', 'Leif', 'Orm', 'Sven', 'Hrolf'],
      title: [['Jarl', 'Jarl'], ['Náčelník', 'Chieftain'], ['Konung', 'King'], ['Hersir', 'Hersir']],
      epit: [['Krvavá sekera', 'Bloodaxe'], ['Bezkostý', 'the Boneless'], ['Vlčí zub', 'Wolftooth'], ['Ledový', 'the Frozen'], ['Hromovládce', 'Thunderlord'], ['Jednooký', 'One-Eye']],
      realm: [['Fjordové', 'Fjord'], ['Ledové', 'Frost'], ['Vlčí', 'Wolf'], ['Bouřné', 'Storm'], ['Havraní', 'Raven'], ['Runové', 'Rune']] },
    demoni: { first: ['Azrakel', 'Belzar', 'Grimor', 'Mordrak', 'Xul', 'Vorgath', 'Nekhar', 'Zarath'],
      title: [['Pán pekel', 'Hell Lord'], ['Arcidémon', 'Archdemon'], ['Kníže popela', 'Ash Prince']],
      epit: [['Nesmrtelný', 'the Undying'], ['Požírač', 'the Devourer'], ['Z popela', 'of Ash'], ['Bez tváře', 'the Faceless']],
      realm: [['Popelavé', 'Ash'], ['Sirné', 'Brimstone'], ['Ohnivé', 'Burning']] }
  };
  const MOTIVE = [
    ['Přísahal Pánu věže, že žádný vetřelec nepostoupí výš.', 'He swore to the Tower Lord that no intruder would climb higher.'],
    ['Brání své patro, protože pod ním leží hroby jeho předků.', 'He guards his floor because the graves of his ancestors lie beneath it.'],
    ['Věž mu slíbila svobodu, pokud zastaví sto vyzyvatelů.', 'The Tower promised him freedom if he stops a hundred challengers.'],
    ['Kdysi sám šplhal věží. Prohrál a od té doby slouží.', 'Once he climbed the Tower himself. He lost, and has served ever since.'],
    ['Hledá soupeře, který ho konečně porazí – a čeká na tebe.', 'He seeks the rival who will finally defeat him – and he waits for you.'],
    ['Jeho lid žije ve stínu věže. Prohra by je odsoudila.', 'His people live in the Tower’s shadow. Defeat would doom them.'],
    ['Věří, že Pán věže je bůh, a ty jsi kacíř.', 'He believes the Tower Lord is a god, and you are a heretic.'],
    ['Nenávidí krále, který tě poslal. Je to osobní.', 'He hates the king who sent you. It is personal.'],
    ['Sbírá prapory poražených. Tvůj mu chybí.', 'He collects the banners of the defeated. Yours is missing.'],
    ['Byl to nejlepší stratég své země. Věž ho ukradla i s hradem.', 'He was the finest strategist of his land. The Tower stole him, castle and all.']
  ];
  const HISTORY = [
    ['Jeho hrad stál kdysi na hranici dvou říší a nikdy nepadl.', 'His castle once stood on the border of two empires and never fell.'],
    ['Vyrostl jako sirotek v kasárnách a dobyl svůj titul mečem.', 'He grew up an orphan in the barracks and won his title by the sword.'],
    ['V mládí prohrál jedinou bitvu – a od té doby studuje každého soupeře.', 'He lost a single battle in his youth – and has studied every foe since.'],
    ['Vede vojsko, které ho následuje i do pekla. Doslova.', 'He leads an army that follows him into hell. Literally.'],
    ['Říká se, že čte myšlenky. Ve skutečnosti jen dobře poslouchá.', 'They say he reads minds. In truth he just listens well.'],
    ['Jeho předkové postavili tohle patro věže kámen po kameni.', 'His ancestors built this floor of the Tower stone by stone.']
  ];

  /* ---------------- VELCÍ GENERÁLOVÉ (každých 50 pater) ---------------- */
  const MAJORS = {
    10: { name: ['Kastelán Bořek Šedý', 'Castellan Borek the Grey'], persona: 'zed', faction: 'kralovstvi', story: ['Strážce brány věže. První, kdo tě vezme vážně.', 'Keeper of the Tower gate. The first to take you seriously.'] },
    25: { name: ['Liška Morgana', 'Morgana the Fox'], persona: 'liska', faction: 'kralovstvi', story: ['Žádná bitva s ní není taková, jak vypadá.', 'No battle with her is what it seems.'] },
    50: { name: ['Jarl Ulfr Krvavá sekera', 'Jarl Ulfr Bloodaxe'], persona: 'berserk', faction: 'vikingove', story: ['Přišel z ledových pater a nikdy necouvá.', 'He came from the frozen floors and never retreats.'] },
    100: { name: ['Šógun Kagetora', 'Shōgun Kagetora'], persona: 'strateg', faction: 'samurajove', story: ['Sto pater vede armády věže. Zná každý trik.', 'For a hundred floors he has led the Tower’s armies. He knows every trick.'] },
    150: { name: ['Baronka Hedvika z Jestřábí', 'Baroness Hedvika of Hawkmoor'], persona: 'baron', faction: 'kralovstvi', story: ['Její jízda je rychlejší než zprávy o ní.', 'Her cavalry is faster than the news of it.'] },
    200: { name: ['Hanzō Stín', 'Hanzō the Shadow'], persona: 'liska', faction: 'samurajove', story: ['Nikdo ho neviděl přicházet. Nikdo ho neviděl odejít.', 'No one saw him come. No one saw him leave.'] },
    250: { name: ['Mordrak z Popela', 'Mordrak of Ash'], persona: 'bourlivak', faction: 'demoni', unit: 'demonkral', story: ['První démon věže. Strážce poloviny cesty.', 'The Tower’s first demon. Warden of the halfway mark.'] },
    300: { name: ['Vévoda Leopold Neústupný', 'Duke Leopold the Unyielding'], persona: 'zed', faction: 'kralovstvi', story: ['Jeho hradby přežily tisíc obléhání.', 'His walls have survived a thousand sieges.'] },
    350: { name: ['Sigurd Hromovládce', 'Sigurd Thunderlord'], persona: 'bourlivak', faction: 'vikingove', story: ['Bouře poslouchá jeho rozkazy.', 'The storm obeys his commands.'] },
    400: { name: ['Musashi Dvou mečů', 'Musashi of Two Swords'], persona: 'lovec', faction: 'samurajove', story: ['Hledá tvou slabinu. A najde ji.', 'He hunts for your weakness. And he will find it.'] },
    450: { name: ['Kněžna Ludmila Vraní', 'Princess Ludmila of Ravens'], persona: 'ostrel', faction: 'kralovstvi', story: ['Její lučištníci zakryjí slunce.', 'Her archers blot out the sun.'] },
    500: { name: ['Azrakel Nesmrtelný', 'Azrakel the Undying'], persona: 'berserk', faction: 'demoni', unit: 'demonkral', story: ['Polovina věže. Kdo ho porazí, uvidí pravdu.', 'Halfway up the Tower. Whoever defeats him will see the truth.'] },
    600: { name: ['Konung Ragnar Bezkostý', 'King Ragnar the Boneless'], persona: 'baron', faction: 'vikingove', story: ['Vládl sedmi fjordům, než ho věž pohltila.', 'He ruled seven fjords before the Tower swallowed him.'] },
    700: { name: ['Šógun Masamune Jednooký', 'Shōgun Masamune One-Eye'], persona: 'strateg', faction: 'samurajove', story: ['Jedním okem vidí víc než jiní dvěma.', 'With one eye he sees more than others with two.'] },
    750: { name: ['Belzar Požírač', 'Belzar the Devourer'], persona: 'lovec', faction: 'demoni', unit: 'demonkral', story: ['Pamatuje si každého, kdo kdy vstoupil do věže.', 'He remembers everyone who ever entered the Tower.'] },
    800: { name: ['Maršál Přemysl Lví srdce', 'Marshal Přemysl Lionheart'], persona: 'strateg', faction: 'kralovstvi', story: ['Kdysi hrdina tvé země. Teď stráž věže.', 'Once a hero of your land. Now a guard of the Tower.'] },
    900: { name: ['Xul Bez tváře', 'Xul the Faceless'], persona: 'liska', faction: 'demoni', unit: 'demonkral', story: ['Má tvář každého, koho porazil.', 'He wears the face of everyone he defeated.'] },
    999: { name: ['Stín Pána věže', 'Shadow of the Tower Lord'], persona: 'lovec', faction: 'demoni', unit: 'demonkral', story: ['Poslední stráž před vrcholem.', 'The last guard before the summit.'] },
    1000: { name: ['Pán věže', 'The Tower Lord'], persona: 'strateg', faction: 'demoni', unit: 'demonkral', story: ['Ten, kdo postavil věž z ukradených království. Čeká na vrcholu od počátku věků.', 'The one who built the Tower from stolen kingdoms. He has waited at the summit since the dawn of time.'] }
  };

  /* ---------------- PODMÍNKY PATER ---------------- */
  const MODS = {
    hradby: { cs: 'Silné hradby', en: 'Strong walls', d: ['Nepřátelský hrad má o 50 % víc životů.', 'The enemy castle has 50% more health.'], from: 3 },
    obranci: { cs: 'Strážní věže', en: 'Watchtowers', d: ['Na hradbách stojí o 2 obránce víc.', 'Two extra defenders stand on the walls.'], from: 5 },
    olej: { cs: 'Vroucí olej', en: 'Boiling oil', d: ['Kdo se přiblíží k bráně, toho opaří olej.', 'Anyone who nears the gate is scalded by oil.'], from: 8 },
    jizda: { cs: 'Jízdní země', en: 'Horse lords', d: ['Nepřítel posílá hlavně jízdu.', 'The enemy sends mostly cavalry.'], from: 2 },
    strelci: { cs: 'Lučištnický národ', en: 'Nation of archers', d: ['Nepřítel posílá hlavně střelce.', 'The enemy sends mostly archers.'], from: 2 },
    bez_kouzel: { cs: 'Bez magie', en: 'No magic', d: ['Nikdo nesmí použít speciální útoky.', 'No one may use special attacks.'], from: 12 },
    bohatstvi: { cs: 'Bohatá země', en: 'Rich lands', d: ['Obě strany mají o 30 % víc mincí.', 'Both sides earn 30% more coins.'], from: 1 },
    chudoba: { cs: 'Hladomor', en: 'Famine', d: ['Obě strany mají o 25 % méně mincí.', 'Both sides earn 25% fewer coins.'], from: 6 },
    souboj: { cs: 'Souboj generálů', en: 'Duel of generals', d: ['Generál vyjde z věže hned na začátku.', 'The general leaves the tower right at the start.'], from: 4 },
    stred: { cs: 'Posvátný střed', en: 'Sacred center', d: ['Obsazení středu dává dvojnásobný bonus.', 'Holding the center gives a double bonus.'], from: 7 },
    pevnost: { cs: 'Pevnost', en: 'Fortress', d: ['Nepřítel brání velkou pevnost s 10 obránci.', 'The enemy defends a great fortress with 10 defenders.'], from: 40 },
    zocelení: { cs: 'Zocelení', en: 'Hardened', d: ['Nepřátelští vojáci mají o 15 % víc životů.', 'Enemy soldiers have 15% more health.'], from: 20 }
  };
  const MOD_IDS = Object.keys(MODS);
  const THEME = { kralovstvi: 'evropa', samurajove: 'japonsko', vikingove: 'sever', demoni: 'peklo' };
  const CSKINS = ['kralovsky', 'pisecna', 'temna', 'ledova', 'mramor'];
  const USKINS = ['zakladni', 'lesni', 'pulnoc', 'stinovy', 'rudy_drak', 'zlaty', 'ledovy', 'smaragd'];

  /* ---------------- PATRO ---------------- */
  const cache = {};
  function floor(n) {
    n = Math.max(1, Math.floor(n));
    if (cache[n]) return cache[n];
    const r = rng(n * 7919 + 13);
    const tier = tierOf(n), T = TIERS[tier];
    const major = MAJORS[n] || (n > 1000 && n % 100 === 0 ? { name: ['Absolutní strážce ' + n, 'Absolute Warden ' + n], persona: pick(r, G.generalAI_ids || ['strateg', 'lovec']), faction: 'demoni', unit: 'demonkral', story: ['Za vrcholem věže začíná nekonečno. Tihle strážci nemají jméno.', 'Beyond the summit lies infinity. These wardens have no name.'] } : null);
    // národ: střídá se po úsecích, aby šly „krajiny“ věže za sebou
    const facPool = n < 30 ? ['kralovstvi', 'kralovstvi', 'vikingove', 'samurajove'] : ['kralovstvi', 'samurajove', 'vikingove', n > 200 ? 'demoni' : 'vikingove'];
    const faction = major ? major.faction : (n % 25 === 0 && n >= 100 ? 'demoni' : pick(r, facPool));
    const NM = NAMES[faction];
    const ti = pick(r, NM.title), ep = pick(r, NM.epit), first = pick(r, NM.first), realm = pick(r, NM.realm);
    const name = major ? major.name : [`${ti[0]} ${first} ${ep[0]}`, `${ti[1]} ${first} ${ep[1]}`];
    const realmName = [`${realm[0]} království`, `${realm[1]} Kingdom`];
    const personaIds = ['berserk', 'strateg', 'liska', 'zed', 'lovec', 'bourlivak', 'baron', 'ostrel'];
    const persona = major ? major.persona : pick(r, personaIds);
    // inteligence roste plynule, síla jen mírně
    const skill = Math.min(0.98, 0.12 + 0.86 * (1 - Math.exp(-n / 330)) + (major ? 0.06 : 0));
    const diff = 0.6 + 1.85 * (1 - Math.exp(-n / 260)) + (n > 1000 ? Math.min(0.5, (n - 1000) / 2000) : 0) + (major ? 0.08 : 0);
    const power = Math.min(1.6, 0.25 + n / 400 + (major ? 0.35 : 0));
    // podmínky: 0–2 podle patra (každých 10 pater aspoň jedna)
    const avail = MOD_IDS.filter(id => n >= MODS[id].from);
    const nMods = n < 3 ? 0 : (n % 10 === 0 ? 2 : r() < Math.min(0.85, 0.3 + n / 300) ? (r() < n / 800 ? 2 : 1) : 0);
    const mods = [];
    while (mods.length < nMods && avail.length) { const m = pick(r, avail); if (!mods.includes(m) && !(m === 'bohatstvi' && mods.includes('chudoba')) && !(m === 'chudoba' && mods.includes('bohatstvi')) && !(m === 'jizda' && mods.includes('strelci')) && !(m === 'strelci' && mods.includes('jizda'))) mods.push(m); else if (r() < 0.2) break; }
    // hrad
    const castleSkin = faction === 'demoni' ? 'temna' : pick(r, CSKINS.slice(0, 2 + Math.min(3, Math.floor(n / 60))));
    const castleLevel = Math.min(10, 2 + Math.floor(n / 25) + Math.floor(r() * 2));
    const decorAll = ['pochodne', 'prapory', 'stity', 'zahrada', 'zlato', 'sochy', 'ohne', 'prikop', 'brectan', 'balisty', 'hroty', 'zbrojnice'];
    const decor = {}; decorAll.forEach(d => { if (r() < 0.12 + Math.min(0.5, n / 600)) decor[d] = true; });
    const emblems = ['lilie', 'lev', 'orel', 'kriz', 'slunce', 'hvezda', 'sakura', 'havran', 'sekery'];
    const banners = ['#a8262a', '#6b3fa0', '#2e7d4a', '#2a2a33', '#c9962a', '#2b8a8f', '#d2691e'];
    const big = mods.includes('pevnost') || (major && n >= 100);
    // obránci na hradbách podle síly patra
    const st = Math.min(1, n / 500);
    // odměny
    const gold = Math.round((180 + n * 22 + (major ? 1500 : 0)) / 10) * 10;
    const gems = (n % 5 === 0 ? 10 + Math.floor(n / 10) : 0) + (major ? 100 + Math.floor(n / 5) : 0);
    const reward = { gold: Math.min(60000, gold), gems };
    if (n % 50 === 0) reward.random = { odds: n >= 300 ? [0, 0, 0.4, 0.6] : [0, 0.2, 0.6, 0.2], count: n >= 500 ? 2 : 1 };
    if (n === 1000) reward.gems += 20000;
    const lines = major ? { intro: L(major.story[0], major.story[1]) } : null;
    const f = {
      n, tier, tierName: L(T.cs, T.en), tierColor: T.color, major: !!major,
      name: L(name[0], name[1]), realm: L(realmName[0], realmName[1]), faction, theme: THEME[faction],
      persona, personaName: L((G.generalPersonaNames || {})[persona] ? G.generalPersonaNames[persona][0] : persona, (G.generalPersonaNames || {})[persona] ? G.generalPersonaNames[persona][1] : persona),
      skill, diff, power, mods,
      story: major ? L(major.story[0], major.story[1]) : L(pick(r, HISTORY)[0], pick(r, HISTORY)[1]),
      motive: L(pick(r, MOTIVE)[0], pick(r, MOTIVE)[1]),
      castleSkin, castleLevel, unitSkin: pick(r, USKINS.slice(0, 2 + Math.min(6, Math.floor(n / 40)))),
      castleCfg: { emblem: pick(r, emblems), banner: pick(r, banners), decor, big },
      defense: G.enemyDefenseFor(st + (mods.includes('obranci') ? 0.35 : 0), big),
      unit: major && major.unit ? major.unit : null,
      reward, lines, seed: n * 31 + 7
    };
    cache[n] = f;
    return f;
  }

  /* obránci na hradbách soupeře podle síly (0 = slabý … 1+ = nejsilnější) */
  G.enemyDefenseFor = (strength, big) => {
    const s = Math.max(0, strength || 0);
    const max = big ? 10 : 5;
    const n = Math.min(max, Math.max(1, Math.round(1 + s * (big ? 9 : 4))));
    const slots = [];
    const els = ['ohen', 'led', 'blesk', 'jed', 'voda'];
    for (let i = 0; i < n; i++) {
      let kind = 'lucistnik';
      if (s > 0.25 && i % 3 === 1) kind = 'kuse';
      if (s > 0.5 && i % 4 === 2) kind = 'katapult';
      if (s > 0.85 && i % 3 === 0 && i > 0) kind = 'kuse';
      slots.push({ kind, el: els[(i + Math.floor(s * 7)) % els.length] });
    }
    return { slots, vez: Math.min(10, Math.round(2 + s * 8)), catLvl: Math.min(5, 1 + Math.floor(s * 4)) };
  };

  /* ---------------- KRONIKA VĚŽE (příběh se odhaluje postupem) ---------------- */
  const LORE = [
    { at: 1, cs: ['Věž bez konce', 'Na severu se jednoho rána objevila věž, kterou nikdo nepostavil. Její vrchol mizí v mracích. Králové posílají své nejlepší velitele, aby zjistili, co skrývá. Ty jsi další.'], en: ['The Endless Tower', 'One morning in the north a tower appeared that no one had built. Its peak vanishes into the clouds. Kings send their finest commanders to learn what it hides. You are next.'] },
    { at: 10, cs: ['Ukradená království', 'Každé patro je celá země – s lidmi, hrady i nebem. Kastelán Bořek ti před smrtí řekl, že jeho hrad kdysi stál u řeky Vltavy. Věž ho prostě vzala.'], en: ['Stolen Kingdoms', 'Every floor is a whole land – with people, castles and sky. Before he fell, Castellan Borek told you his castle once stood by a river. The Tower simply took it.'] },
    { at: 25, cs: ['Přísaha generálů', 'Generálové nebojují ze zlé vůle. Každý složil přísahu Pánu věže: kdo ubrání své patro, jeho lid přežije. Kdo prohraje, jeho země zmizí ve tmě.'], en: ['The Generals’ Oath', 'The generals do not fight out of malice. Each swore an oath to the Tower Lord: whoever holds their floor, their people survive. Whoever loses, their land fades into darkness.'] },
    { at: 50, cs: ['Led a krev', 'Za padesátým patrem začínají ledová království. Jarl Ulfr tvrdil, že věž roste – každý poražený vyzyvatel přidá nové patro. Kolik jich už je?'], en: ['Ice and Blood', 'Past the fiftieth floor the frozen kingdoms begin. Jarl Ulfr claimed the Tower grows – every defeated challenger adds a new floor. How many are there already?'] },
    { at: 100, cs: ['Šógunova pravda', 'Kagetora ti ukázal mapu: věž stojí na místě, kde se kdysi střetly tři říše. Rytíři, samurajové a vikingové. Pán věže je všechny porazil – a pak je všechny spolkl.'], en: ['The Shōgun’s Truth', 'Kagetora showed you a map: the Tower stands where three empires once clashed. Knights, samurai and vikings. The Tower Lord defeated them all – and then swallowed them all.'] },
    { at: 150, cs: ['Zrádce mezi námi', 'Baronka Hedvika věděla o tvém plánu dřív, než jsi zaútočil. Někdo z tvého království posílá zprávy nahoru. Kdo?'], en: ['A Traitor Among Us', 'Baroness Hedvika knew your plan before you attacked. Someone from your kingdom sends word upward. Who?'] },
    { at: 250, cs: ['První démon', 'Mordrak nebyl člověk. Z jeho popela se ozval hlas: „Pán věže nepotřebuje armády. Potřebuje vítěze.“ Proč by stavitel věže chtěl, aby ji někdo zdolal?'], en: ['The First Demon', 'Mordrak was no man. From his ashes a voice spoke: “The Tower Lord needs no armies. He needs a victor.” Why would the builder want anyone to conquer it?'] },
    { at: 300, cs: ['Hradby bez konce', 'Vévoda Leopold byl kdysi vyzyvatel jako ty. Došel až sem, prohrál a věž z něj udělala strážce. Pochopil jsi: každý generál nad tebou byl jednou tebou.'], en: ['Walls Without End', 'Duke Leopold was once a challenger like you. He made it this far, lost, and the Tower made him a guardian. You understand now: every general above you was once you.'] },
    { at: 400, cs: ['Lov na slabiny', 'Musashi ti před pádem prozradil, že věž si pamatuje, jak bojuješ. Generálové výš už znají tvoje triky. Musíš se měnit, nebo zůstaneš navždy.'], en: ['Hunting Weaknesses', 'Before falling, Musashi revealed that the Tower remembers how you fight. The generals above already know your tricks. You must change, or stay forever.'] },
    { at: 500, cs: ['Polovina cesty', 'Azrakel se směje, i když umírá. „Myslíš, že stoupáš? Věž je studna. Čím výš jdeš, tím hlouběji padáš.“ Pod tebou se ozývají zvony ztracených království.'], en: ['Halfway', 'Azrakel laughs even as he dies. “You think you climb? The Tower is a well. The higher you go, the deeper you fall.” Below you ring the bells of lost kingdoms.'] },
    { at: 600, cs: ['Sedm fjordů', 'Ragnar ti dal svůj prsten: „Až dojdeš nahoru, vrať ho mému lidu.“ Poprvé chápeš, že každé vítězství někoho osvobozuje.'], en: ['Seven Fjords', 'Ragnar gave you his ring: “When you reach the top, return it to my people.” For the first time you understand that every victory frees someone.'] },
    { at: 750, cs: ['Požírač vzpomínek', 'Belzar zná tvé jméno, tvůj hrad i tvé první vítězství. Věž o tobě ví všechno. Ale ty teď víš něco o ní: bojí se tě.'], en: ['Devourer of Memories', 'Belzar knows your name, your castle and your first victory. The Tower knows everything about you. But now you know something about it: it fears you.'] },
    { at: 800, cs: ['Hrdina, který zůstal', 'Maršál Přemysl – legenda tvé země – stál proti tobě. „Odpusť mi,“ řekl. Byl to on, kdo posílal zprávy nahoru. Aby ochránil tvé království před věží.'], en: ['The Hero Who Stayed', 'Marshal Přemysl – a legend of your land – stood against you. “Forgive me,” he said. He was the one sending word upward. To shield your kingdom from the Tower.'] },
    { at: 900, cs: ['Tisíc tváří', 'Xul měl tvou tvář. Pochopil jsi poslední tajemství: Pán věže hledá nástupce. Toho, kdo porazí všechny generály – a sám se stane věží.'], en: ['A Thousand Faces', 'Xul wore your face. You understood the last secret: the Tower Lord seeks a successor. The one who defeats every general – and becomes the Tower.'] },
    { at: 1000, cs: ['Vrchol', 'Pán věže padl. Věž se chvěje, patra se rozpadají a ukradená království se vracejí na svá místa. Nebo ne? Nad tebou se otevírá nové schodiště. Nekonečno začíná.'], en: ['The Summit', 'The Tower Lord has fallen. The Tower trembles, floors crumble and the stolen kingdoms return to their places. Or do they? Above you a new stair opens. Infinity begins.'] }
  ];

  /* ---------------- HODNOSTI A ÚSPĚCHY ---------------- */
  const RANKS = [
    { at: 0, cs: 'Panoš', en: 'Squire' }, { at: 10, cs: 'Zbrojnoš', en: 'Man-at-arms' }, { at: 25, cs: 'Rytíř', en: 'Knight' },
    { at: 50, cs: 'Kapitán', en: 'Captain' }, { at: 100, cs: 'Velitel', en: 'Commander' }, { at: 150, cs: 'Lord', en: 'Lord' },
    { at: 300, cs: 'Vévoda', en: 'Duke' }, { at: 500, cs: 'Král', en: 'King' }, { at: 750, cs: 'Císař', en: 'Emperor' },
    { at: 1000, cs: 'Pán věže', en: 'Tower Lord' }, { at: 1500, cs: 'Věčný', en: 'Eternal' }
  ];
  const ACH = [
    { id: 'f1', cs: ['První krok', 'Zdolej 1. patro.'], en: ['First Step', 'Clear floor 1.'], test: T => T.best >= 1, gems: 20 },
    { id: 'f10', cs: ['Strážce brány', 'Zdolej 10. patro.'], en: ['Gatekeeper', 'Clear floor 10.'], test: T => T.best >= 10, gems: 50 },
    { id: 'f50', cs: ['Ledová cesta', 'Zdolej 50. patro.'], en: ['Frozen Road', 'Clear floor 50.'], test: T => T.best >= 50, gems: 150 },
    { id: 'f100', cs: ['Stovka', 'Zdolej 100. patro.'], en: ['Centurion', 'Clear floor 100.'], test: T => T.best >= 100, gems: 300 },
    { id: 'f250', cs: ['Démonobijce', 'Zdolej 250. patro.'], en: ['Demonslayer', 'Clear floor 250.'], test: T => T.best >= 250, gems: 600 },
    { id: 'f500', cs: ['Polovina věže', 'Zdolej 500. patro.'], en: ['Halfway Up', 'Clear floor 500.'], test: T => T.best >= 500, gems: 1200 },
    { id: 'f1000', cs: ['Vrchol', 'Zdolej 1000. patro.'], en: ['The Summit', 'Clear floor 1000.'], test: T => T.best >= 1000, gems: 5000 },
    { id: 'g1', cs: ['Pád generála', 'Zabij generála v souboji na bojišti.'], en: ['A General Falls', 'Slay a general on the battlefield.'], test: T => (T.genKills || 0) >= 1, gems: 40 },
    { id: 'g25', cs: ['Lovec generálů', 'Zabij 25 generálů na bojišti.'], en: ['General Hunter', 'Slay 25 generals on the battlefield.'], test: T => (T.genKills || 0) >= 25, gems: 250 },
    { id: 'fast', cs: ['Blesková válka', 'Zdolej patro za méně než 2 minuty.'], en: ['Blitzkrieg', 'Clear a floor in under 2 minutes.'], test: T => T.fastest && T.fastest < 120, gems: 80 },
    { id: 'clean', cs: ['Nedotčené hradby', 'Zdolej patro 20+ s hradem nad 90 % životů.'], en: ['Untouched Walls', 'Clear floor 20+ with your castle above 90% health.'], test: T => !!T.clean, gems: 100 },
    { id: 'nomagic', cs: ['Bez kouzel', 'Zdolej patro s podmínkou Bez magie.'], en: ['No Magic Needed', 'Clear a floor with the No magic condition.'], test: T => !!T.nomagic, gems: 80 },
    { id: 'streak10', cs: ['Neporazitelný', 'Vyhraj 10 pater v řadě bez prohry.'], en: ['Unbeatable', 'Win 10 floors in a row without a loss.'], test: T => (T.bestStreak || 0) >= 10, gems: 200 }
  ];

  /* ---------------- TÝDENNÍ VÝZVA (sezónní) ---------------- */
  const weekKey = () => { const d = new Date(); const j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-w' + Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7); };
  function weekly(best) {
    const k = weekKey();
    let h = 7; k.split('').forEach(c => (h = (h * 31 + c.charCodeAt(0)) >>> 0));
    const n = Math.max(5, Math.min(1200, (best || 1) + 15 + (h % 20)));   // o kus výš, než kam hráč došel
    const base = floor(n);
    const r = rng(h);
    const extra = MOD_IDS.filter(id => !base.mods.includes(id));
    const CONF = [['jizda', 'strelci'], ['bohatstvi', 'chudoba']];
    const mods = base.mods.slice(0, 1);
    for (let k = 0; k < 8 && mods.length < 3; k++) { const m = pick(r, extra); if (!mods.includes(m) && !CONF.some(c => c.includes(m) && mods.some(x => c.includes(x) && x !== m))) mods.push(m); }
    return Object.assign({}, base, { weekly: true, week: k, mods, name: base.name, reward: { gold: base.reward.gold * 2, gems: 150 + Math.floor(n / 4) }, skill: Math.min(0.99, base.skill + 0.08) });
  }

  G.tower = {
    TIERS, MODS, LORE, RANKS, ACH, MAJORS,
    floor, weekly, weekKey, tierOf,
    rankOf: best => RANKS.filter(r => (best || 0) >= r.at).pop(),
    state(save) {
      const T = save.tower = save.tower || {};
      T.cur = T.cur || 1; T.best = T.best || 0; T.wins = T.wins || 0; T.losses = T.losses || 0;
      T.genKills = T.genKills || 0; T.time = T.time || 0; T.streak = T.streak || 0; T.bestStreak = T.bestStreak || 0;
      T.ach = T.ach || {}; T.rivals = T.rivals || {}; T.lore = T.lore || {}; T.weekDone = T.weekDone || {};
      return T;
    },
    /* nastavení bitvy pro patro (propojení s existujícím enginem) */
    battleCfg(save, f) {
      const F = G.factions[f.faction] || G.factions.kralovstvi;
      const fu = G.factionUnits(f.faction);
      let units = fu;
      if (f.mods.includes('jizda')) units = fu.filter(id => ['jizda', 'tezka', 'pech', 'velitel'].includes(G.units[id].roleKey));
      if (f.mods.includes('strelci')) units = fu.filter(id => ['strelec', 'mag', 'pech', 'kopi'].includes(G.units[id].roleKey));
      // na nízkých patrech menší výběr jednotek (učí se hrát)
      if (f.n < 15) units = units.filter(id => ['pech', 'strelec', 'kopi', 'tezka'].includes(G.units[id].roleKey));
      if (!units.length) units = fu;
      const T = this.state(save);
      const es = G.calc.enemyStats(f.diff);
      if (f.mods.includes('zocelení')) es.hpMult = 1.15;
      return {
        mode: 'tower', title: (window.I18N && I18N.lang === 'cs' ? 'Patro ' : 'Floor ') + f.n + ' · ' + f.realm, difficulty: f.diff,
        enemyUnits: units, enemyName: f.name, enemyFaction: f.faction, theme: f.theme,
        enemyCastleSkin: f.castleSkin, enemyUnitSkin: f.unitSkin, enemyCastleLevel: f.castleLevel, enemyCastleCfg: f.castleCfg,
        enemyCastleHpMult: f.mods.includes('hradby') ? 1.5 : 1, enemyDefense: f.defense, enemyOil: f.mods.includes('olej') ? 40 + f.n * 0.4 : 0,
        enemyStats: es, noSkills: f.mods.includes('bez_kouzel'),
        general: { id: 'v' + f.n, name: f.name, field: true, persona: f.persona, skill: f.skill, power: f.power, unit: f.unit, early: f.mods.includes('souboj'), rival: (T.rivals[f.n] || 0) > 0, lines: f.lines },
        floor: f,
        tweak: b => {
          if (f.mods.includes('bohatstvi')) { b.side.player.income *= 1.3; b.side.enemy.baseIncome *= 1.3; }
          if (f.mods.includes('chudoba')) { b.side.player.income *= 0.75; b.side.enemy.baseIncome *= 0.75; }
          if (f.mods.includes('stred')) b.cpDouble = true;
        }
      };
    }
  };
})();
