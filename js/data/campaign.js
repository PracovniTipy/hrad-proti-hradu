/* =========================================================================
   PŘÍBĚH – JEDNA SÁGA VE ČTYŘECH AKTECH
     Akt I   Království Lví koruny  (hraješ za rytíře)
     Akt II  Samurajové Kazehana    (hraješ za samuraje)
     Akt III Vikingové Bouřného fjordu (hraješ za vikingy)
     Akt IV  Spojenectví             (vojáci všech tří národů proti démonům)
   Úrovně jdou za sebou: další akt se odemkne až po dokončení předchozího.

   Úroveň:
     id        – jedinečné id (ukládá se do postupu)
     enemy     – národ nepřítele (jeho jednotky, hrad a barvy)
     roles     – které role nepřítel posílá (pech, strelec, kopi, tezka)
     mix       – volitelně: { faction, roles } – přimíchaní vojáci jiného národa
     theme     – bojiště (evropa | japonsko | sever | peklo)
     castleSkin, unitSkin – vzhled nepřítele
     pos       – pozice na mapě v % (x, y)
     boss      – závěrečná úroveň kapitoly; boss: 'demonkral' = finále
   Akt (GameData.saga):
     id, faction (za koho hráč hraje, nebo 'spojenectvi'), mapTheme,
     scene – příběhová scéna před první úrovní aktu (GameData.scenes)
   ========================================================================= */
window.GameData = window.GameData || {};

const R1 = ['pech'], R2 = ['pech', 'strelec'], R3 = ['pech', 'strelec', 'tezka'], R4 = ['pech', 'strelec', 'kopi', 'tezka'], R5 = ['pech', 'strelec', 'kopi'];
const DEM = r => ({ faction: 'demoni', roles: r });
const R6 = ['pech', 'strelec', 'kopi', 'jizda', 'tezka'], R7 = ['pech', 'strelec', 'kopi', 'jizda', 'tezka', 'mag'];

GameData.saga = [
  { id: 'kralovstvi', n: 'I', faction: 'kralovstvi', mapTheme: 'evropa', scene: 'prolog', name: 'Lví koruna' },
  { id: 'samurajove', n: 'II', faction: 'samurajove', mapTheme: 'japonsko', scene: 'akt2', name: 'Klan Kazehana' },
  { id: 'vikingove', n: 'III', faction: 'vikingove', mapTheme: 'sever', scene: 'akt3', name: 'Bouřný fjord' },
  { id: 'spojenectvi', n: 'IV', faction: 'spojenectvi', mapTheme: 'peklo', scene: 'akt4', name: 'Spojenectví' },
  { id: 'risedemonu', n: 'V', faction: 'spojenectvi', mapTheme: 'peklo', scene: 'akt5', name: 'Démonská říše', huge: true }
];

/* Úrovně se stejnými id jako dřív – uložený postup hráčů zůstává platný. */
GameData.campaigns = {
  /* ------------------------------------------------------------ AKT I: LVÍ KORUNA
     Rytíři proti rytířům. Hráč je mladý rytíř z pohraničí a probojuje se na trůn. */
  kralovstvi: [
    {
      id: 1, name: 'Zelené údolí', label: { top: 63.5, right: 3 },
      intro: 'Starý král Aldrik zemřel bez dědice a baroni se perou o Lví korunu. Baron Rodrik Kančí hlava plení tvé rodné údolí.',
      outro: 'Baron Rodrik před tebou poklekl a jeho rytíři ti přísahali věrnost. Lidé v údolí ti začínají říkat „pane“.',
      en: { name: 'Green Valley', intro: 'Old King Aldric died without an heir and the barons fight over the Lion Crown. Baron Rodrik Boar-Head is plundering your home valley.', outro: 'Baron Rodrik knelt before you and his knights swore loyalty. The valley folk start calling you “my lord”.' },
      levels: [
        { id: '1-1', name: 'Hraniční brod', diff: 0.55, enemy: 'kralovstvi', roles: R1, theme: 'evropa', reward: { gold: 250, gems: 10 }, castleSkin: 'kralovsky', pos: [22, 92], story: 'Rodrikovi žoldnéři drží brod u tvé vesnice. Vyžeň je.', en: { name: 'Border Ford', story: 'Rodrik’s sellswords hold the ford by your village. Drive them off.' } },
        { id: '1-2', name: 'Mlýn u řeky', diff: 0.62, enemy: 'kralovstvi', roles: R2, theme: 'evropa', reward: { gold: 300, gems: 10 }, castleSkin: 'kralovsky', pos: [48, 87], story: 'Baronovi lučištníci obsadili mlýn a střílí z jeho věže.', en: { name: 'River Mill', story: 'The baron’s archers took the mill and shoot from its tower.' } },
        { id: '1-3', name: 'Lesní stezka', diff: 0.7, enemy: 'kralovstvi', roles: R2, theme: 'evropa', reward: { gold: 350, gems: 15 }, castleSkin: 'kralovsky', pos: [74, 82], story: 'V lese číhají přepadové oddíly. Po vítězství se k tobě přidají kopiníci.', en: { name: 'Forest Path', story: 'Ambush parties lurk in the forest. After victory, spearmen will join you.' } },
        { id: '1-4', name: 'Strážní pahorek', diff: 0.78, enemy: 'kralovstvi', roles: R3, theme: 'evropa', reward: { gold: 420, gems: 15 }, castleSkin: 'pisecna', pos: [56, 74], story: 'Na pahorek dorazili Rodrikovi těžcí rytíři. Drž formaci!', en: { name: 'Watch Hill', story: 'Rodrik’s heavy knights have reached the hill. Hold the formation!' } },
        { id: '1-5', name: 'Kančí hrad', diff: 0.88, enemy: 'kralovstvi', roles: R3, theme: 'evropa', reward: { gold: 600, gems: 30 }, castleSkin: 'pisecna', pos: [30, 70], boss: true, story: 'Baron Rodrik Kančí hlava se zavřel na svém hradě. Dobyj ho a údolí bude tvoje.', en: { name: 'Boar Castle', story: 'Baron Rodrik Boar-Head has locked himself in his castle. Take it and the valley is yours.' } }
      ]
    },
    {
      id: 2, name: 'Temné hory', label: { top: 43, left: 3 },
      intro: 'V horách vládne vévoda Morvan se svou Stínovou legií. Chce Lví korunu pro sebe.',
      outro: 'Morvan se vzdal a odevzdal ti svůj meč. Rytíři severních krajů se přidávají k tobě. V hlavním městě se ale na trůn posadil uzurpátor.',
      en: { name: 'Dark Mountains', intro: 'Duke Morvan and his Shadow Legion rule the mountains. He wants the Lion Crown for himself.', outro: 'Morvan surrendered and handed you his sword. The knights of the northern shires join you. But a usurper has taken the throne in the capital.' },
      levels: [
        { id: '2-1', name: 'Průsmyk vran', diff: 0.95, enemy: 'kralovstvi', roles: R5, reward: { gold: 650, gems: 20 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [18, 58], story: 'Úzký průsmyk hlídají kopiníci Stínové legie.' },
        { id: '2-2', name: 'Opuštěný důl', diff: 1.02, enemy: 'kralovstvi', roles: R5, reward: { gold: 700, gems: 20 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [42, 54], story: 'V dole se kuje černá ocel pro Morvanovy rytíře. Zastav výrobu zbraní.' },
        { id: '2-3', name: 'Kamenný most', diff: 1.1, enemy: 'kralovstvi', roles: R4, reward: { gold: 780, gems: 25 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [68, 50], story: 'Jediná cesta dál vede přes most nad propastí.' },
        { id: '2-4', name: 'Horská brána', diff: 1.18, enemy: 'kralovstvi', roles: R6, reward: { gold: 860, gems: 25 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [80, 41], story: 'Brána do srdce hor je vytesaná do skály. Morvanovi strážci ji neopustí bez boje.', en: { name: 'Mountain Gate', story: 'The gate to the heart of the mountains is carved into the rock. Morvan’s guards will not leave it without a fight.' } },
        { id: '2-5', name: 'Tvrz Černý zub', diff: 1.26, enemy: 'kralovstvi', roles: R6, reward: { gold: 1100, gems: 50 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [56, 37], boss: true, story: 'Vévoda Morvan vede Stínovou legii osobně. Tohle bude těžká bitva.', en: { name: 'Black Fang Keep', story: 'Duke Morvan leads the Shadow Legion himself. This will be a hard battle.' } }
      ]
    },
    {
      id: 3, name: 'Boj o trůn', label: { top: 1.2, left: 3 },
      intro: 'V hlavním městě se na trůn posadil lord Valdemar Zlatý se svou Zlatou gardou. Kdo dobude trůnní sál, bude králem.',
      outro: 'Valdemar padl. Rytíři všech krajů tě v trůnním sále provolali králem Lví koruny!',
      en: { name: 'Battle for the Throne', intro: 'In the capital Lord Valdemar the Golden and his Golden Guard have seized the throne. Whoever takes the throne room will be king.', outro: 'Valdemar has fallen. The knights of every shire proclaim you King of the Lion Crown in the throne room!' },
      levels: [
        { id: '3-1', name: 'Hořící pole', diff: 1.3, enemy: 'kralovstvi', roles: R4, reward: { gold: 1150, gems: 30 }, castleSkin: 'kralovsky', unitSkin: 'zlaty', pos: [30, 28], story: 'Valdemarova garda pálí pole kolem města, aby ti nezbylo jídlo. Zastav ji.', en: { name: 'Burning Fields', story: 'Valdemar’s guard burns the fields around the city to starve you. Stop it.' } },
        { id: '3-2', name: 'Klášter na kopci', diff: 1.36, enemy: 'kralovstvi', roles: R2, reward: { gold: 1250, gems: 30 }, castleSkin: 'kralovsky', unitSkin: 'zlaty', pos: [14, 18], story: 'Mniši ukrývají korunovační klenoty. Valdemarovi muži je chtějí ukrást.', en: { name: 'Hilltop Monastery', story: 'The monks hide the crown jewels. Valdemar’s men want to steal them.' } },
        { id: '3-3', name: 'Městské hradby', diff: 1.42, enemy: 'kralovstvi', roles: R7, reward: { gold: 1350, gems: 35 }, castleSkin: 'kralovsky', unitSkin: 'zlaty', pos: [40, 13], story: 'Zlatá garda drží vnější hradby. Získej je.', en: { name: 'City Walls', story: 'The Golden Guard holds the outer walls. Take them.' } },
        { id: '3-4', name: 'Královská zahrada', diff: 1.48, enemy: 'kralovstvi', roles: R6, reward: { gold: 1450, gems: 40 }, castleSkin: 'kralovsky', unitSkin: 'zlaty', pos: [66, 16], story: 'Věrní služebníci ti otevřeli tajnou bránu v zahradě. Pronikni k paláci.', en: { name: 'Royal Garden', story: 'Loyal servants opened the secret garden gate for you. Break through to the palace.' } },
        { id: '3-5', name: 'Trůnní sál', diff: 1.55, enemy: 'kralovstvi', roles: R7, theme: 'evropa', reward: { gold: 1900, gems: 80 }, castleSkin: 'kralovsky', unitSkin: 'zlaty', pos: [84, 7], boss: true, story: 'Valdemar Zlatý brání trůn s celou Zlatou gardou. Poraz ho a staneš se králem!', en: { name: 'Throne Room', story: 'Valdemar the Golden defends the throne with his whole Golden Guard. Defeat him and you will be king!' } }
      ]
    }
  ],

  /* ------------------------------------------------------------ AKT II: SAMURAJOVÉ */
  samurajove: [
    {
      id: 1, name: 'Provincie Kiri', label: { top: 63.5, left: 3 },
      intro: 'Nový král Lví koruny připlouvá na východ. Země samurajů je rozdělená válkou klanů a mladý daimjó Rjú tě prosí, abys vedl jeho vojsko.',
      outro: 'Pán Akabane se vzdal. K válce ho navedl regent Kurogane, který chce vládnout celé zemi.',
      en: { name: 'Kiri Province', intro: 'The new King of the Lion Crown sails east. The land of the samurai is torn by clan wars and young daimyō Ryū asks you to lead his army.', outro: 'Lord Akabane surrendered. Regent Kurogane, who wants to rule the whole land, drove him to war.' },
      levels: [
        { id: 's1-1', name: 'Rýžová pole', diff: 0.95, enemy: 'samurajove', roles: R1, reward: { gold: 900, gems: 15 }, castleSkin: 'kralovsky', pos: [78, 92], story: 'Ašigaru klanu Akabane kradou úrodu. Rolníci prosí o pomoc.' },
        { id: 's1-2', name: 'Bambusový háj', diff: 1.0, enemy: 'samurajove', roles: R2, reward: { gold: 950, gems: 15 }, castleSkin: 'kralovsky', pos: [52, 87], story: 'V bambusovém háji se schovávají lučištníci jumi.' },
        { id: 's1-3', name: 'Brána torii', diff: 1.06, enemy: 'samurajove', roles: R2, reward: { gold: 1000, gems: 20 }, castleSkin: 'kralovsky', pos: [26, 82], story: 'Nepřítel znesvětil svatyni. Po vítězství se ti přidají kopiníci jari.' },
        { id: 's1-4', name: 'Horský chrám', diff: 1.12, enemy: 'samurajove', roles: R3, reward: { gold: 1050, gems: 20 }, castleSkin: 'pisecna', pos: [44, 74], story: 'U chrámu tě čekají první samurajové klanu Akabane.' },
        { id: 's1-5', name: 'Hrad Akabane', diff: 1.2, enemy: 'samurajove', roles: R3, reward: { gold: 1300, gems: 40 }, castleSkin: 'pisecna', pos: [70, 70], boss: true, story: 'Pán Akabane Hidemasa se zavřel na svém hradě. Dobyj ho a sjednoť Kiri.' }
      ]
    },
    {
      id: 2, name: 'Hory Kurama', label: { top: 43, right: 3 },
      intro: 'Ve vysokých horách se skrývají zbytky Akabane, horští mniši a regentův bratr, generál Kurogane.',
      outro: 'Generál Kurogane padl v souboji. Cesta do hlavního města je volná.',
      en: { name: 'Kurama Mountains', intro: 'Akabane remnants, mountain monks and the regent’s brother, General Kurogane, hide in the high peaks.', outro: 'General Kurogane fell in a duel. The road to the capital is open.' },
      levels: [
        { id: 's2-1', name: 'Průsmyk mlhy', diff: 1.26, enemy: 'samurajove', roles: R5, reward: { gold: 1350, gems: 25 }, castleSkin: 'pisecna', unitSkin: 'lesni', pos: [82, 58], story: 'Mlha je tak hustá, že nepřítele uslyšíš dřív, než ho uvidíš.' },
        { id: 's2-2', name: 'Klášter válečných mnichů', diff: 1.32, enemy: 'samurajove', roles: R5, reward: { gold: 1400, gems: 25 }, castleSkin: 'pisecna', unitSkin: 'lesni', pos: [58, 54], story: 'Mniši sóhei se přidali k nepříteli. Ukaž jim sílu klanu Kazehana.' },
        { id: 's2-3', name: 'Most přes Rudou řeku', diff: 1.38, enemy: 'samurajove', roles: R4, reward: { gold: 1450, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [32, 50], story: 'Na mostě se objevují černí samurajové regenta Kuroganeho.', en: { name: 'Red River Bridge', story: 'The black samurai of Regent Kurogane appear on the bridge.' } },
        { id: 's2-4', name: 'Pevnost v oblacích', diff: 1.44, enemy: 'samurajove', roles: R6, reward: { gold: 1500, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [20, 41], story: 'Hrad nad mraky hlídá jedinou cestu do hlavního města.' },
        { id: 's2-5', name: 'Generál Kurogane', diff: 1.5, enemy: 'samurajove', roles: R6, reward: { gold: 1800, gems: 50 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [44, 37], boss: true, story: 'Regentův bratr velí černé armádě. Poraz ho a cesta bude volná.', en: { name: 'General Kurogane', story: 'The regent’s brother commands the black army. Defeat him and the road will be open.' } }
      ]
    },
    {
      id: 3, name: 'Cesta do hlavního města', label: { top: 1.2, right: 3 },
      intro: 'Regent Kurogane drží císaře v zajetí a vládne v jeho jménu.',
      outro: 'Regent padl a císař je volný. Rjú se stal šógunem a klan Kazehana přísahá věrnost králi Lví koruny.',
      en: { name: 'Road to the Capital', intro: 'Regent Kurogane holds the emperor captive and rules in his name.', outro: 'The regent has fallen and the emperor is free. Ryū became shōgun and the Kazehana clan swears loyalty to the King of the Lion Crown.' },
      levels: [
        { id: 's3-1', name: 'Silnice Tókaidó', diff: 1.55, enemy: 'samurajove', roles: R4, reward: { gold: 1900, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [70, 28], story: 'Po hlavní silnici táhnou regentovy posily.' },
        { id: 's3-2', name: 'Sakurový průsmyk', diff: 1.6, enemy: 'samurajove', roles: R4, reward: { gold: 2000, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [86, 18], story: 'Mezi kvetoucími sakurami se rozhodne, kdo projde.' },
        { id: 's3-3', name: 'Noční útok', diff: 1.66, enemy: 'samurajove', roles: R6, reward: { gold: 2100, gems: 35 }, castleSkin: 'temna', unitSkin: 'pulnoc', pos: [60, 13], story: 'Regent zaútočil v noci se svými stínovými bojovníky. Drž formaci.', en: { name: 'Night Attack', story: 'The regent attacked at night with his shadow warriors. Hold the formation.' } },
        { id: 's3-4', name: 'Brány paláce', diff: 1.72, enemy: 'samurajove', roles: R7, reward: { gold: 2200, gems: 40 }, castleSkin: 'temna', unitSkin: 'zlaty', pos: [34, 16], story: 'Zlatá garda regenta brání vnější brány paláce.' },
        { id: 's3-5', name: 'Regent Kurogane', diff: 1.8, enemy: 'samurajove', roles: R7, reward: { gold: 2800, gems: 80 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [16, 7], boss: true, story: 'Regent velí svým nejlepším samurajům. Osvoboď císaře.', en: { name: 'Regent Kurogane', story: 'The regent commands his finest samurai. Free the emperor.' } }
      ]
    }
  ],

  /* ------------------------------------------------------------ AKT III: VIKINGOVÉ */
  vikingove: [
    {
      id: 1, name: 'Domovské fjordy', label: { top: 63.5, right: 3 },
      intro: 'Na severu si král Ragnvald Mrazivá koruna podmaňuje všechny klany. Jeho jarl Hrafn Krutý dobývá fjordy a jarlka Sigrun prosí o pomoc.',
      outro: 'Hrafn padl. Jeho muži utekli na sever do Ledové pustiny, kde sídlí Ragnvald.',
      en: { name: 'Home Fjords', intro: 'In the north King Ragnvald Frost-Crown subdues every clan. His jarl Hrafn the Cruel conquers the fjords and Jarl Sigrun asks for help.', outro: 'Hrafn has fallen. His men fled north into the Frozen Wastes where Ragnvald rules.' },
      levels: [
        { id: 'v1-1', name: 'Rybářská osada', diff: 1.25, enemy: 'vikingove', roles: R1, reward: { gold: 1500, gems: 20 }, castleSkin: 'kralovsky', pos: [26, 92], story: 'Hrafnovi muži přepadli rybáře. Zažeň je.' },
        { id: 'v1-2', name: 'Zamrzlý brod', diff: 1.3, enemy: 'vikingove', roles: R2, reward: { gold: 1550, gems: 20 }, castleSkin: 'kralovsky', pos: [52, 88], story: 'Brod přes řeku hlídají Hrafnovi lovci.' },
        { id: 'v1-3', name: 'Runový kámen', diff: 1.36, enemy: 'vikingove', roles: R2, reward: { gold: 1600, gems: 25 }, castleSkin: 'kralovsky', pos: [78, 82], story: 'U runového kamene přísahají věrnost ti, kdo zvítězí. Pak se ti přidají štítonoši.' },
        { id: 'v1-4', name: 'Vlčí les', diff: 1.42, enemy: 'vikingove', roles: R3, reward: { gold: 1650, gems: 25 }, castleSkin: 'pisecna', pos: [58, 74], story: 'Hrafn poslal své berserky. Ve vlčím lese bude krev.' },
        { id: 'v1-5', name: 'Hrafnova síň', diff: 1.5, enemy: 'vikingove', roles: R3, reward: { gold: 2000, gems: 45 }, castleSkin: 'temna', pos: [32, 70], boss: true, story: 'Hrafn Krutý čeká ve své síni. Kdo zvítězí, bude vládnout fjordům.' }
      ]
    },
    {
      id: 2, name: 'Ledová pustina', label: { top: 43, left: 3 },
      intro: 'Za fjordy leží Ledová pustina. Hlídá ji Ledová stráž – Ragnvaldovi nejvěrnější válečníci v bílých kožešinách.',
      outro: 'Ledová brána padla. Za ní se tyčí citadela Mrazivé koruny.',
      en: { name: 'Frozen Wastes', intro: 'Beyond the fjords lie the Frozen Wastes, guarded by the Ice Guard – Ragnvald’s most loyal warriors in white furs.', outro: 'The Ice Gate has fallen. Beyond it rises the citadel of the Frost Crown.' },
      levels: [
        { id: 'v2-1', name: 'Zamrzlé jezero', diff: 1.56, enemy: 'vikingove', roles: R5, theme: 'sever', reward: { gold: 2100, gems: 25 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [20, 58], story: 'Led praská pod nohama. Postupuj opatrně.' },
        { id: 'v2-2', name: 'Sněžná hlídka', diff: 1.62, enemy: 'vikingove', roles: R4, theme: 'sever', reward: { gold: 2200, gems: 25 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [44, 54], story: 'Hlídka Ledové stráže tě už vyhlíží.' },
        { id: 'v2-3', name: 'Křišťálová rokle', diff: 1.68, enemy: 'vikingove', roles: R4, theme: 'sever', reward: { gold: 2300, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [70, 50], story: 'Rokle plná krystalů odráží každý šíp.' },
        { id: 'v2-4', name: 'Bouřná výšina', diff: 1.74, enemy: 'vikingove', roles: R6, theme: 'sever', reward: { gold: 2400, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [82, 41], story: 'Vichr a sníh. Nepřítel má výhodu výšky.' },
        { id: 'v2-5', name: 'Ledová brána', diff: 1.8, enemy: 'vikingove', roles: R6, theme: 'sever', reward: { gold: 2900, gems: 55 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [58, 37], boss: true, story: 'Velitel Ledové stráže brání jedinou bránu do srdce pustiny.' }
      ]
    },
    {
      id: 3, name: 'Mrazivá koruna', label: { top: 1.2, left: 3 },
      intro: 'Ragnvald svolal všechny klany severu do poslední bitvy. Skaldové jí říkají Ragnarök.',
      outro: 'Ragnvald padl a Sigrun je královnou severu. Tři národy poprvé po tisíci letech uzavírají spojenectví – a právě včas.',
      en: { name: 'The Frost Crown', intro: 'Ragnvald has called every clan of the north to the last battle. The skalds call it Ragnarök.', outro: 'Ragnvald has fallen and Sigrun is queen of the north. For the first time in a thousand years three nations form an alliance – just in time.' },
      levels: [
        { id: 'v3-1', name: 'Konec světa', diff: 1.85, enemy: 'vikingove', roles: R4, theme: 'sever', reward: { gold: 3000, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [28, 28], story: 'Na kraji známého světa stojí první Ragnvaldova pevnost.', en: { name: 'End of the World', story: 'Ragnvald’s first fortress stands at the edge of the known world.' } },
        { id: 'v3-2', name: 'Duhový most', diff: 1.9, enemy: 'vikingove', roles: R4, theme: 'sever', reward: { gold: 3100, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [12, 18], story: 'Pod polární září se most mezi světy chvěje.' },
        { id: 'v3-3', name: 'Obři severu', diff: 1.95, enemy: 'vikingove', roles: R7, theme: 'sever', reward: { gold: 3200, gems: 35 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [40, 12], story: 'Ragnvaldovi berserkové jsou silní jako obři ze ság.', en: { name: 'Giants of the North', story: 'Ragnvald’s berserkers are as strong as giants from the sagas.' } },
        { id: 'v3-4', name: 'Bouřné moře', diff: 2.0, enemy: 'vikingove', roles: R6, theme: 'sever', reward: { gold: 3300, gems: 40 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [66, 16], story: 'Zamrzlým mořem připlouvají Ragnvaldovy dračí lodě.', en: { name: 'Stormy Sea', story: 'Ragnvald’s dragon ships sail across the frozen sea.' } },
        { id: 'v3-5', name: 'Citadela Mrazivé koruny', diff: 2.05, enemy: 'vikingove', roles: R7, theme: 'sever', reward: { gold: 4000, gems: 90 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [84, 7], boss: true, story: 'Poraz krále Ragnvalda a sjednoť sever.', en: { name: 'Citadel of the Frost Crown', story: 'Defeat King Ragnvald and unite the north.' } }
      ]
    }
  ],

  /* ------------------------------------------------------------ AKT IV: SPOJENECTVÍ PROTI PEKELNÉMU GENERÁLOVI */
  spojenectvi: [
    {
      id: 1, name: 'Brána pekel', label: { top: 56, right: 3 },
      intro: 'Z Ohnivé hory vystoupil Pekelný generál Azgaroth. Spojené armády tří národů táhnou přes spálené pláně.',
      outro: 'Pekelná brána je dobytá. Na vrcholu Ohnivé hory čeká Azgaroth.',
      en: { name: 'Gate of Hell', intro: 'Azgaroth the Hell General has risen from the Fire Mountain. The united armies of three nations march across the scorched plains.', outro: 'The Gate of Hell is taken. Azgaroth waits at the summit of the Fire Mountain.' },
      levels: [
        { id: 'd1-1', name: 'Spálená pláň', diff: 1.75, enemy: 'demoni', roles: R2, alliance: true, reward: { gold: 3200, gems: 40 }, castleSkin: 'temna', pos: [50, 90], story: 'Z prasklin v zemi lezou první démoni. Vyzkoušej vojáky všech tří národů najednou.' },
        { id: 'd1-2', name: 'Lávová řeka', diff: 1.82, enemy: 'demoni', roles: R2, alliance: true, reward: { gold: 3300, gems: 40 }, castleSkin: 'temna', pos: [24, 82], story: 'Přes řeku lávy vede jediný kamenný most. Chrliči ho kryjí ohněm.' },
        { id: 'd1-3', name: 'Kostěný les', diff: 1.9, enemy: 'demoni', roles: R5, alliance: true, reward: { gold: 3400, gems: 45 }, castleSkin: 'temna', pos: [44, 72], story: 'Les z kostí a ostnů. Zapni AUTO u národa, který chceš nechat bojovat samostatně.' },
        { id: 'd1-4', name: 'Tábor běsů', diff: 1.98, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 3500, gems: 45 }, castleSkin: 'temna', pos: [72, 74], story: 'Hejna běsů se valí ze všech stran.' },
        { id: 'd1-5', name: 'Brána pekel', diff: 2.06, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4200, gems: 90 }, castleSkin: 'temna', pos: [82, 62], boss: true, story: 'Obří brána z obsidiánu. Za ní začíná Azgarothova říše.' }
      ]
    },
    {
      id: 2, name: 'Ohnivá hora', label: { top: 1.2, left: 3 },
      intro: 'Poslední výstup k trůnu Pekelného generála.',
      outro: 'Azgaroth padl. Ohnivá hora utichla – ale za ní se otevřela brána do obrovské Démonské říše.',
      en: { name: 'Fire Mountain', intro: 'The last climb to the Hell General’s throne.', outro: 'Azgaroth has fallen. The Fire Mountain is silent – but beyond it a gate to the vast Demon Realm has opened.' },
      levels: [
        { id: 'd2-1', name: 'Sirné prameny', diff: 2.1, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4300, gems: 50 }, castleSkin: 'temna', pos: [60, 50], story: 'Jedovatý dým a vroucí prameny. Chrliči útočí ze skal.' },
        { id: 'd2-2', name: 'Řetězový most', diff: 2.16, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4400, gems: 50 }, castleSkin: 'temna', pos: [32, 44], story: 'Most visí na řetězech nad propastí plnou ohně.' },
        { id: 'd2-3', name: 'Síň zatracených', diff: 2.22, enemy: 'demoni', roles: R3, alliance: true, reward: { gold: 4500, gems: 55 }, castleSkin: 'temna', pos: [18, 32], story: 'Zatracení rytíři kdysi sloužili Lví koruně. Dnes slouží peklu.' },
        { id: 'd2-4', name: 'Kráter', diff: 2.28, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4600, gems: 55 }, castleSkin: 'temna', pos: [40, 25], story: 'Okraj kráteru. Pod tebou bublá láva, před tebou celá Azgarothova legie.' },
        { id: 'd2-5', name: 'Trůn Pekelného generála', diff: 2.3, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 8000, gems: 200 }, castleSkin: 'temna', pos: [50, 15], boss: 'demonkral', megaCastle: true, scene: 'finale', afterScene: 'epilog', story: 'Obří pekelná pevnost má tři brány a démoni vycházejí ze všech najednou. Azgaroth sám vstoupí na bojiště. Až padne, jeho pevnost se otřese.', en: { name: 'Throne of the Hell General', story: 'The giant hell fortress has three gates and demons pour out of all of them. Azgaroth himself enters the field. When he falls, his fortress will shake.' } }
      ]
    }
  ]
};

/* ------------------------------------------------------------ AKT V: DÉMONSKÁ ŘÍŠE
   Obrovská mapa: 5 krajů po 10 bitvách. Každá 10. bitva = pekelný generál
   (poslední = Démonický král Malakor, vůdce všech démonů). Bojuje se vždy
   se všemi třemi královstvími najednou. V některých bitvách se zachraňují rukojmí. */
(function () {
  const REG = [
    { name: 'Popelavé pláně', en: 'Ashen Plains', gen: 'g_popel', genName: 'Skarnath, Generál popela',
      intro: 'Za Ohnivou horou leží pláně pokryté popelem. Démoni tu drží zajaté vesničany.', outro: 'Skarnath padl a popel se usadil. Z jeho tvrze jste vyvedli stovky zajatců.',
      enI: 'Beyond the Fire Mountain lie plains covered in ash. The demons hold captured villagers here.', enO: 'Skarnath has fallen and the ash has settled. You led hundreds of captives out of his keep.',
      places: ['Spálený statek', 'Popelová cesta', 'Kostěná věž', 'Vyprahlá studna', 'Ohořelý les', 'Tábor otroků', 'Struskové pole', 'Pekelná hlídka', 'Brána popela'],
      placesEn: ['Burnt Farmstead', 'Ash Road', 'Bone Tower', 'Dry Well', 'Charred Forest', 'Slave Camp', 'Slag Field', 'Hell Watch', 'Ash Gate'] },
    { name: 'Morová bažina', en: 'Plague Marsh', gen: 'g_mor', genName: 'Vargul, Generál moru',
      intro: 'Jedovatá bažina, kde se z bahna zvedají páry moru. Vargul tu vězní zajaté rytíře.', outro: 'Vargul se rozpadl v hnilobu. Bažina se začíná čistit.',
      enI: 'A poisonous marsh where plague vapours rise from the mud. Vargul imprisons captured knights here.', enO: 'Vargul rotted away. The marsh begins to clear.',
      places: ['Shnilý most', 'Mlžný ostrov', 'Utopená vesnice', 'Jedovatý pramen', 'Klec v bahně', 'Morový hřbitov', 'Kořenová stezka', 'Zelená mlha', 'Vargulův ostrov'],
      placesEn: ['Rotten Bridge', 'Misty Isle', 'Drowned Village', 'Poison Spring', 'Cage in the Mud', 'Plague Graveyard', 'Root Path', 'Green Fog', 'Vargul’s Isle'] },
    { name: 'Krvavé hory', en: 'Blood Mountains', gen: 'g_krev', genName: 'Belzar, Generál krve',
      intro: 'Rudé skály a řeky barvy krve. Belzar zde drží zajaté samuraje.', outro: 'Belzar padl a hory utichly. Samurajové jsou volní.',
      enI: 'Red cliffs and rivers the colour of blood. Belzar holds captured samurai here.', enO: 'Belzar has fallen and the mountains are silent. The samurai are free.',
      places: ['Rudý průsmyk', 'Krvavý vodopád', 'Kostěný most', 'Jeskyně zajatců', 'Řetězová skála', 'Obětní kámen', 'Rudá řeka', 'Orlí hnízdo', 'Belzarova tvrz'],
      placesEn: ['Red Pass', 'Blood Falls', 'Bone Bridge', 'Captives’ Cave', 'Chain Rock', 'Altar Stone', 'Red River', 'Eagle’s Nest', 'Belzar’s Keep'] },
    { name: 'Věčná zima', en: 'Eternal Winter', gen: 'g_mraz', genName: 'Hrimgar, Generál mrazu',
      intro: 'Pekelný mráz zmrazil celý kraj. Hrimgar uvěznil vikingské klany v ledu.', outro: 'Hrimgar se roztříštil. Led taje a vikingové se vracejí domů.',
      enI: 'Hellish frost has frozen the whole land. Hrimgar has trapped the Viking clans in ice.', enO: 'Hrimgar shattered. The ice melts and the Vikings return home.',
      places: ['Černý led', 'Zamrzlá flotila', 'Sněžná past', 'Ledové vězení', 'Mrazivý vítr', 'Zrcadlové jezero', 'Ledový labyrint', 'Kost a led', 'Hrimgarův trůn'],
      placesEn: ['Black Ice', 'Frozen Fleet', 'Snow Trap', 'Ice Prison', 'Frost Wind', 'Mirror Lake', 'Ice Maze', 'Bone and Ice', 'Hrimgar’s Throne'] },
    { name: 'Srdce pekla', en: 'Heart of Hell', gen: 'demonvladce', genName: 'Malakor, Démonický král',
      intro: 'Nejhlubší kraj Démonské říše. Na obsidiánovém trůnu sedí Malakor, Démonický král – vůdce všech démonů.', outro: 'Malakor padl. Démonská říše se hroutí a tři národy slaví vítězství, o kterém se bude zpívat navěky.',
      enI: 'The deepest land of the Demon Realm. On an obsidian throne sits Malakor, the Demon King – leader of all demons.', enO: 'Malakor has fallen. The Demon Realm collapses and three nations celebrate a victory that will be sung forever.',
      places: ['Ohnivá brána', 'Most duší', 'Obsidiánová cesta', 'Klece králů', 'Síň řetězů', 'Plamenné jezero', 'Brána prokletých', 'Démonská zbrojnice', 'Předsíň trůnu'],
      placesEn: ['Fire Gate', 'Bridge of Souls', 'Obsidian Road', 'Cages of Kings', 'Hall of Chains', 'Lake of Flame', 'Gate of the Damned', 'Demon Armory', 'Throne Antechamber'] }
  ];
  const ROLES = [R2, R5, R4, R3, R4, R4, R5, R4, R4];
  let n = 0;
  GameData.campaigns.risedemonu = REG.map((rg, ci) => {
    const levels = [];
    for (let k = 0; k < 10; k++) {
      n++;
      const boss = k === 9;
      const hostages = !boss && (k === 4 || k === 7 || (k === 2 && ci % 2 === 1)) ? 3 + ci : 0;
      // klikatá cesta po vysoké mapě: zdola nahoru
      const y = 98.5 - (n - 1) * (97 / 49);
      const x = 50 + Math.sin(n * 0.9) * 32 + Math.sin(n * 0.31) * 6;
      const name = boss ? rg.genName.split(',')[0] + (rg.gen === 'demonvladce' ? ' – trůn' : ' – tvrz') : rg.places[k];
      const nameEn = boss ? rg.genName.split(',')[0] + (rg.gen === 'demonvladce' ? ' – Throne' : ' – Keep') : rg.placesEn[k];
      const story = boss
        ? (rg.gen === 'demonvladce' ? 'Poslední bitva. Malakor, Démonický král, vyjde ze své obří pevnosti. Poraz ho a zachraň všechny tři národy.' : `${rg.genName} brání svou pevnost. Až padne, kraj ${rg.name} bude svobodný.`)
        : hostages ? `Démoni tu drží ${hostages} zajatce v klecích. Dobyj jejich tvrz a zachraň rukojmí!` : `Spojené armády postupují krajem ${rg.name}. Vyčisti další území od démonů.`;
      const storyEn = boss
        ? (rg.gen === 'demonvladce' ? 'The last battle. Malakor, the Demon King, leaves his giant fortress. Defeat him and save all three nations.' : `${rg.genName.split(',')[0]} defends his fortress. When he falls, the ${rg.en} will be free.`)
        : hostages ? `The demons hold ${hostages} captives in cages here. Take their keep and rescue the hostages!` : `The united armies advance through the ${rg.en}. Clear another territory of demons.`;
      levels.push({
        id: 'p' + n, name, diff: Math.round((2.34 + n * 0.03) * 100) / 100, enemy: 'demoni', roles: boss ? R4 : ROLES[k % ROLES.length], alliance: true, theme: 'peklo',
        reward: { gold: 4600 + n * 140, gems: boss ? 150 + ci * 50 : 45 + ci * 5 }, castleSkin: 'temna', pos: [Math.round(x * 10) / 10, Math.round(y * 10) / 10],
        boss: boss ? rg.gen : undefined, megaCastle: boss || undefined, hostages: hostages || undefined,
        scene: boss ? 'gen' + (ci + 1) : undefined, afterScene: boss && ci === 4 ? 'konec' : undefined,
        story, en: { name: nameEn, story: storyEn }
      });
    }
    return { id: ci + 1, name: rg.name, label: { top: Math.max(0.6, 100 - (ci + 1) * 20 + 2), left: ci % 2 ? 3 : undefined, right: ci % 2 ? undefined : 3 }, intro: rg.intro, outro: rg.outro, en: { name: rg.en, intro: rg.enI, outro: rg.enO }, levels };
  });
})();

/* Zpětná kompatibilita */
GameData.campaign = GameData.campaigns.kralovstvi;

/* ---------------------------------------------------------------------
   PŘÍBĚHOVÉ SCÉNY – rozhovory mezi akty. who = id postavy (GameData.cast)
   --------------------------------------------------------------------- */
GameData.cast = {
  vypravec: { name: 'Vypravěč', unit: null },
  kancler: { name: 'Kancléř Edmund', unit: 'rytir', faction: 'kralovstvi', skin: 'zlaty' },
  aldrik: { name: 'Král Aldrik', unit: 'rytir', faction: 'kralovstvi', skin: 'zlaty' },
  rju: { name: 'Šógun Rjú', unit: 'samuraj', faction: 'samurajove' },
  sigrun: { name: 'Královna Sigrun', unit: 'berserk', faction: 'vikingove' },
  azgaroth: { name: 'Azgaroth', unit: 'demonkral', faction: 'demoni', team: 'enemy' },
  malakor: { name: 'Malakor', unit: 'demonvladce', faction: 'demoni', team: 'enemy' }
};
GameData.scenes = {
  prolog: {
    title: 'Prolog', theme: 'evropa',
    pages: [
      { who: 'vypravec', text: 'Starý král Aldrik zemřel bez dědice. Lví koruna leží na prázdném trůnu a baroni se o ni perou mečem.' },
      { who: 'kancler', text: 'Podle starého zákona vládne ten, kdo sjednotí rytíře všech krajů. Jsi jen mladý rytíř z pohraničí – ale lidé za tebou půjdou.' },
      { who: 'vypravec', text: 'Začíná tvá cesta: z prostého rytíře králem Lví koruny.' }
    ]
  },
  akt2: {
    title: 'Akt II · Klan Kazehana', theme: 'japonsko',
    pages: [
      { who: 'kancler', text: 'Vaše Veličenstvo, království je sjednocené. Z východu ale přišli poslové: země samurajů je v plamenech občanské války.' },
      { who: 'vypravec', text: 'Král se plaví přes moře do Země vycházejícího slunce. Mladý daimjó Rjú z klanu Kazehana mu nabídne velení nad svým vojskem.' },
      { who: 'rju', text: 'Pomozte mi sjednotit provincie a samurajové budou navždy přáteli Lví koruny. Regent Kurogane drží císaře v zajetí.' }
    ]
  },
  akt3: {
    title: 'Akt III · Bouřný fjord', theme: 'sever',
    pages: [
      { who: 'rju', text: 'Země samurajů má zase mír. Na severu ale král Ragnvald Mrazivá koruna podmaňuje jeden klan za druhým.' },
      { who: 'vypravec', text: 'Rytíři a samurajové připlouvají k Bouřnému fjordu. Jarlka Sigrun je přijme jen tehdy, když jí pomohou porazit Ragnvaldovy jarly.' },
      { who: 'sigrun', text: 'Povedeš mé vikingy, cizinče. Když porazíme Mrazivou korunu, sever bude svobodný. Sekery vzhůru!' }
    ]
  },
  akt4: {
    title: 'Akt IV · Spojenectví', theme: 'peklo',
    pages: [
      { who: 'vypravec', text: 'V den, kdy padla Mrazivá koruna, se zatřásla země. Z Ohnivé hory vystoupil Azgaroth, Pekelný generál, a za ním legie démonů.' },
      { who: 'sigrun', text: 'Rytíři, samurajové a vikingové. Tři národy, jedna armáda. Táhneme k Ohnivé hoře!' },
      { who: 'vypravec', text: 'V bitvách spojenectví posíláš vojáky všech tří národů najednou. Každé království má vlastní přepínač AUTO – zapni ho a jeho vojáci budou vyrážet sami.' }
    ]
  },
  finale: {
    title: 'Trůn Pekelného generála', theme: 'peklo',
    pages: [
      { who: 'azgaroth', text: 'Tři národy… Myslíte, že mě zastavíte? Spálím vás všechny.' },
      { who: 'rju', text: 'Až Pekelný generál padne, jeho pevnost se otřese. Pak udeřte všichni najednou!' }
    ]
  },
  epilog: {
    title: 'Pád Pekelného generála', theme: 'peklo',
    pages: [
      { who: 'vypravec', text: 'Azgaroth padl a Ohnivá hora utichla.' },
      { who: 'azgaroth', text: 'Hlupáci… Já byl jen jeden z generálů. Démonický král Malakor už drží vaše země – a vaše lidi.' },
      { who: 'vypravec', text: 'Za Ohnivou horou se otevřela obrovská Démonská říše. Spojené národy ji musí osvobodit kraj po kraji, porazit pekelné generály a zachránit rukojmí.' }
    ]
  },
  akt5: {
    title: 'Akt V · Démonská říše', theme: 'peklo',
    pages: [
      { who: 'vypravec', text: 'Před vámi leží obrovská mapa Démonské říše: pět krajů, padesát bitev. Každou desátou bitvu vás čeká pekelný generál.' },
      { who: 'kancler', text: 'V táborech démonů jsou zajatí naši lidé. Kdekoli uvidíte klece, osvoboďte je!' },
      { who: 'malakor', text: 'Pojďte jen. Na konci cesty na vás čekám já – Malakor, Démonický král.' }
    ]
  },
  gen1: { title: 'Skarnath, Generál popela', theme: 'peklo', pages: [{ who: 'vypravec', text: 'Z popela se zvedá obří postava s hořícím mečem. Skarnath, první z Malakorových generálů.' }] },
  gen2: { title: 'Vargul, Generál moru', theme: 'peklo', pages: [{ who: 'vypravec', text: 'Bažina zezelená a zasmrádne. Vargul, Generál moru, vychází ze své shnilé tvrze.' }] },
  gen3: { title: 'Belzar, Generál krve', theme: 'peklo', pages: [{ who: 'vypravec', text: 'Řeky zrudnou. Belzar, Generál krve, je nejsilnější z Malakorových generálů.' }] },
  gen4: { title: 'Hrimgar, Generál mrazu', theme: 'sever', pages: [{ who: 'sigrun', text: 'Hrimgar uvěznil mé lidi v ledu. Dnes za to zaplatí!' }] },
  gen5: { title: 'Malakor, Démonický král', theme: 'peklo', pages: [{ who: 'malakor', text: 'Porazili jste mé generály. Ale mě neporazí nikdo. Jsem Malakor, vládce všech démonů!' }, { who: 'rju', text: 'Tři národy, jedna armáda. Do posledního dechu!' }] },
  konec: {
    title: 'Konec', theme: 'evropa',
    pages: [
      { who: 'vypravec', text: 'Malakor padl a Démonská říše se zhroutila. Rukojmí se vracejí domů.' },
      { who: 'sigrun', text: 'Skaldové o téhle válce budou zpívat tisíc let.' },
      { who: 'kancler', text: 'Králi Lví koruny, dokázal jsi nemožné. Tři národy budou žít v míru, dokud si budeme pamatovat tento den.' }
    ]
  }
};
/* anglické texty scén */
GameData.scenesEn = {
  prolog: { title: 'Prologue', pages: ['Old King Aldric died without an heir. The Lion Crown lies on an empty throne and the barons fight for it with swords.', 'By ancient law, whoever unites the knights of every shire shall rule. You are only a young knight from the borderlands – but people will follow you.', 'Your journey begins: from a simple knight to King of the Lion Crown.'] },
  akt2: { title: 'Act II · Kazehana Clan', pages: ['Your Majesty, the kingdom is united. But envoys came from the east: the land of the samurai burns in civil war.', 'The king sails across the sea to the Land of the Rising Sun. Young daimyō Ryū of the Kazehana clan offers him command of his army.', 'Help me unite the provinces and the samurai will forever be friends of the Lion Crown. Regent Kurogane holds the emperor captive.'] },
  akt3: { title: 'Act III · Storm Fjord', pages: ['The land of the samurai is at peace again. But in the north King Ragnvald Frost-Crown conquers one clan after another.', 'Knights and samurai sail to the Storm Fjord. Jarl Sigrun will accept them only if they help her defeat Ragnvald’s jarls.', 'You will lead my Vikings, stranger. When we defeat the Frost Crown, the north will be free. Axes up!'] },
  akt4: { title: 'Act IV · Alliance', pages: ['On the day the Frost Crown fell, the earth shook. Azgaroth the Hell General rose from the Fire Mountain with a legion of demons behind him.', 'Knights, samurai and Vikings. Three nations, one army. We march to the Fire Mountain!', 'In alliance battles you send soldiers of all three nations at once. Each kingdom has its own AUTO switch – turn it on and its soldiers will march out on their own.'] },
  finale: { title: 'Throne of the Hell General', pages: ['Three nations… You think you can stop me? I will burn you all.', 'When the Hell General falls, his fortress will shake. Then strike all together!'] },
  epilog: { title: 'Fall of the Hell General', pages: ['Azgaroth has fallen and the Fire Mountain is silent.', 'Fools… I was only one of the generals. Malakor the Demon King already holds your lands – and your people.', 'Beyond the Fire Mountain the vast Demon Realm has opened. The united nations must free it land by land, defeat the hell generals and rescue the hostages.'] },
  akt5: { title: 'Act V · Demon Realm', pages: ['Before you lies the vast map of the Demon Realm: five lands, fifty battles. Every tenth battle a hell general awaits.', 'Our people are held captive in the demon camps. Wherever you see cages, free them!', 'Come then. At the end of the road I wait for you – Malakor, the Demon King.'] },
  gen1: { title: 'Skarnath, General of Ash', pages: ['A giant figure with a burning sword rises from the ash. Skarnath, the first of Malakor’s generals.'] },
  gen2: { title: 'Vargul, General of Plague', pages: ['The marsh turns green and foul. Vargul, General of Plague, leaves his rotten keep.'] },
  gen3: { title: 'Belzar, General of Blood', pages: ['The rivers turn red. Belzar, General of Blood, is the strongest of Malakor’s generals.'] },
  gen4: { title: 'Hrimgar, General of Frost', pages: ['Hrimgar trapped my people in ice. Today he will pay!'] },
  gen5: { title: 'Malakor, the Demon King', pages: ['You defeated my generals. But no one defeats me. I am Malakor, lord of all demons!', 'Three nations, one army. To the last breath!'] },
  konec: { title: 'The End', pages: ['Malakor has fallen and the Demon Realm has collapsed. The hostages are coming home.', 'The skalds will sing of this war for a thousand years.', 'King of the Lion Crown, you achieved the impossible. Three nations will live in peace as long as we remember this day.'] }
};

/* ---------------------------------------------------------------------
   POMOCNÉ FUNKCE – jedna lineární sága
   --------------------------------------------------------------------- */
GameData.campaignHelpers = {
  acts() { return GameData.saga; },
  act(a) { return GameData.saga.find(x => x.id === a) || GameData.saga[0]; },
  chapters(a) { return GameData.campaigns[a] || GameData.campaigns.kralovstvi; },
  /* úrovně jednoho aktu (nebo celé ságy, když a chybí) */
  allLevels(a) {
    if (!a) return GameData.saga.flatMap(s => this.allLevels(s.id));
    const act = this.act(a);
    return this.chapters(a).flatMap(ch => ch.levels.map(l => Object.assign({ chapter: ch.id, act: a, faction: act.faction, label: l.id.replace(/^[a-z]/, '') }, l)));
  },
  isUnlocked(save, levelId) {
    const all = this.allLevels();
    const i = all.findIndex(l => l.id === levelId);
    if (i <= 0) return true;
    return !!save.campaign.cleared[all[i - 1].id];
  },
  actUnlocked(save, a) {
    const first = this.allLevels(a)[0];
    return this.isUnlocked(save, first.id);
  },
  actDone(save, a) { return this.allLevels(a).every(l => save.campaign.cleared[l.id]); },
  /* národ je hratelný (Hrad, Souboj, Trénink) až po odemčení jeho aktu */
  factionUnlocked(save, f) {
    if (f === 'kralovstvi') return true;
    // samurajové i vikingové se pro volné hraní odemknou až po dokončení příběhu samurajů
    if (!GameData.saga.some(s => s.faction === f)) return false;
    return this.actDone(save, 'samurajove') && this.actUnlocked(save, f);
  },
  progress(save, a) {
    const all = this.allLevels(a);
    return { done: all.filter(l => save.campaign.cleared[l.id]).length, total: all.length };
  },
  currentLevel(save) {
    return this.allLevels().find(l => !save.campaign.cleared[l.id]) || null;
  },
  /* akt, na kterém hráč právě je */
  currentAct(save) {
    const c = this.currentLevel(save);
    return c ? c.act : GameData.saga[GameData.saga.length - 1].id;
  },
  find(levelId) { return this.allLevels().find(x => x.id === levelId) || null; },
  isFirstOfAct(levelId) { return GameData.saga.some(s => this.allLevels(s.id)[0].id === levelId); }
};
