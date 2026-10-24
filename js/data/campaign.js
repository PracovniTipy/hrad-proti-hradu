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

GameData.saga = [
  { id: 'kralovstvi', n: 'I', faction: 'kralovstvi', mapTheme: 'evropa', scene: 'prolog', name: 'Lví koruna' },
  { id: 'samurajove', n: 'II', faction: 'samurajove', mapTheme: 'japonsko', scene: 'akt2', name: 'Klan Kazehana' },
  { id: 'vikingove', n: 'III', faction: 'vikingove', mapTheme: 'sever', scene: 'akt3', name: 'Bouřný fjord' },
  { id: 'spojenectvi', n: 'IV', faction: 'spojenectvi', mapTheme: 'peklo', scene: 'akt4', name: 'Spojenectví' }
];

GameData.campaigns = {
  /* ------------------------------------------------------------ AKT I: KRÁLOVSTVÍ */
  kralovstvi: [
    {
      id: 1, name: 'Zelené údolí', label: { top: 63.5, right: 3 },
      intro: 'Hraniční vesnice hoří. Z moře připluli vikingští nájezdníci – ale zdá se, že před něčím utíkají.',
      outro: 'Zajatý náčelník Ulf přiznal, že jeho lid vyhnal z domova Hrafn Krutý se svými černými runami. V horách mezitím povstala Stínová legie.',
      levels: [
        { id: '1-1', name: 'Hraniční brod', diff: 0.55, enemy: 'vikingove', roles: R1, theme: 'evropa', reward: { gold: 250, gems: 10 }, castleSkin: 'kralovsky', pos: [22, 92], story: 'Hlídka nájezdníků drží brod u vesnice. Vyžeň je zpátky k lodím.' },
        { id: '1-2', name: 'Mlýn u řeky', diff: 0.62, enemy: 'vikingove', roles: R2, theme: 'evropa', reward: { gold: 300, gems: 10 }, castleSkin: 'kralovsky', pos: [48, 87], story: 'Nájezdníci obsadili mlýn a jejich lovci střílí z věže.' },
        { id: '1-3', name: 'Lesní stezka', diff: 0.7, enemy: 'vikingove', roles: R2, theme: 'evropa', reward: { gold: 350, gems: 15 }, castleSkin: 'kralovsky', pos: [74, 82], story: 'V lese číhají přepadové oddíly. Po vítězství se k tobě přidají kopiníci.' },
        { id: '1-4', name: 'Strážní pahorek', diff: 0.78, enemy: 'vikingove', roles: R3, theme: 'evropa', reward: { gold: 420, gems: 15 }, castleSkin: 'pisecna', pos: [56, 74], story: 'Na pahorek dorazili první berserkové. Drž formaci!' },
        { id: '1-5', name: 'Tábor Vranov', diff: 0.88, enemy: 'vikingove', roles: R3, theme: 'evropa', reward: { gold: 600, gems: 30 }, castleSkin: 'pisecna', pos: [30, 70], boss: true, story: 'Náčelník Ulf Černá runa postavil u Vranova palisádu. Zbourej ji a zažeň nájezdníky na moře.' }
      ]
    },
    {
      id: 2, name: 'Temné hory', label: { top: 43, left: 3 },
      intro: 'V horách se probouzí Stínová legie zrádného vévody Morvana.',
      outro: 'Morvan padl. V jeho tvrzi jsi našel dopisy zapečetěné rohatou korunou – znakem Pekelného generála. Legie táhne na hlavní město!',
      levels: [
        { id: '2-1', name: 'Průsmyk vran', diff: 0.95, enemy: 'kralovstvi', roles: R5, reward: { gold: 650, gems: 20 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [18, 58], story: 'Úzký průsmyk hlídají kopiníci Stínové legie.' },
        { id: '2-2', name: 'Opuštěný důl', diff: 1.02, enemy: 'kralovstvi', roles: R5, reward: { gold: 700, gems: 20 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [42, 54], story: 'V dole se kuje černá ocel. Zastav výrobu zbraní.' },
        { id: '2-3', name: 'Kamenný most', diff: 1.1, enemy: 'kralovstvi', roles: R4, reward: { gold: 780, gems: 25 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [68, 50], story: 'Jediná cesta dál vede přes most nad propastí.' },
        { id: '2-4', name: 'Sopečná brána', diff: 1.18, enemy: 'kralovstvi', roles: R4, reward: { gold: 860, gems: 25 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [80, 41], story: 'Brána do srdce hor stojí na úbočí sopky. Z puklin stoupá sirný dým.' },
        { id: '2-5', name: 'Tvrz Černý zub', diff: 1.26, enemy: 'kralovstvi', roles: R4, reward: { gold: 1100, gems: 50 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [56, 37], boss: true, story: 'Vévoda Morvan, Temný lord, vede legii osobně. Tohle bude těžká bitva.' }
      ]
    },
    {
      id: 3, name: 'Obležená koruna', label: { top: 1.2, left: 3 },
      intro: 'Zbytky Stínové legie a první běsi z pekla obléhají hlavní město krále Aldrika.',
      outro: 'Démoni zmizeli v ohni, ale jejich velitel stihl vykřiknout jméno: Azgaroth. Král tě posílá na východ za klanem Kazehana, strážci druhé pečeti.',
      levels: [
        { id: '3-1', name: 'Hořící pole', diff: 1.3, enemy: 'kralovstvi', roles: R4, reward: { gold: 1150, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [30, 28], story: 'Legie pálí pole kolem hlavního města. Zastav ji, než obránci vyhladoví.' },
        { id: '3-2', name: 'Klášter na kopci', diff: 1.36, enemy: 'kralovstvi', roles: R2, mix: DEM(R1), reward: { gold: 1250, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [14, 18], story: 'Mniši hlásí, že ze sklepení lezou malé rohaté bytosti. Vyčisti klášter.' },
        { id: '3-3', name: 'Městské hradby', diff: 1.42, enemy: 'kralovstvi', roles: R4, reward: { gold: 1350, gems: 35 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [40, 13], story: 'Nepřítel obsadil vnější hradby. Získej je zpátky.' },
        { id: '3-4', name: 'Královská zahrada', diff: 1.48, enemy: 'kralovstvi', roles: R5, mix: DEM(R2), reward: { gold: 1450, gems: 40 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [66, 16], story: 'Zrádci otevřeli tajnou bránu v zahradě a běsi s chrliči jdou s nimi. Zastav je dřív, než proniknou do paláce.' },
        { id: '3-5', name: 'Trůnní sál', diff: 1.55, enemy: 'demoni', roles: R3, theme: 'evropa', reward: { gold: 1900, gems: 80 }, castleSkin: 'temna', pos: [84, 7], boss: true, story: 'V trůnním sále se otevřela pekelná brána. Poprvé stojíš proti skutečným démonům!' }
      ]
    }
  ],

  /* ------------------------------------------------------------ AKT II: SAMURAJOVÉ */
  samurajove: [
    {
      id: 1, name: 'Provincie Kiri', label: { top: 63.5, left: 3 },
      intro: 'Rudá křídla klanu Akabane plení mlžné údolí Kiri. Maršál Lví koruny bojuje po boku mladého daimjóa Rjúa.',
      outro: 'Pán Akabane se vzdal. Prý ho k válce navedl regent Kurogane – a regent prý v noci rozmlouvá s ohněm.',
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
      intro: 'Ve vysokých horách se skrývají zbytky Akabane, horští mniši a regentův bratr.',
      outro: 'Generál Kurogane umíral se slovy: „Můj bratr už není člověk.“ Cesta do hlavního města je volná.',
      levels: [
        { id: 's2-1', name: 'Průsmyk mlhy', diff: 1.26, enemy: 'samurajove', roles: R5, reward: { gold: 1350, gems: 25 }, castleSkin: 'pisecna', unitSkin: 'lesni', pos: [82, 58], story: 'Mlha je tak hustá, že nepřítele uslyšíš dřív, než ho uvidíš.' },
        { id: 's2-2', name: 'Klášter válečných mnichů', diff: 1.32, enemy: 'samurajove', roles: R5, reward: { gold: 1400, gems: 25 }, castleSkin: 'pisecna', unitSkin: 'lesni', pos: [58, 54], story: 'Mniši sóhei se přidali k nepříteli. Ukaž jim sílu klanu Kazehana.' },
        { id: 's2-3', name: 'Most přes Rudou řeku', diff: 1.38, enemy: 'samurajove', roles: R4, reward: { gold: 1450, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [32, 50], story: 'Na mostě se objevují stínoví samurajové regenta Kuroganeho.' },
        { id: 's2-4', name: 'Pevnost v oblacích', diff: 1.44, enemy: 'samurajove', roles: R4, reward: { gold: 1500, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [20, 41], story: 'Hrad nad mraky hlídá jedinou cestu do hlavního města.' },
        { id: 's2-5', name: 'Generál Kurogane', diff: 1.5, enemy: 'samurajove', roles: R4, reward: { gold: 1800, gems: 50 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [44, 37], boss: true, story: 'Regentův bratr velí stínové armádě. Poraz ho a cesta bude volná.' }
      ]
    },
    {
      id: 3, name: 'Cesta do hlavního města', label: { top: 1.2, right: 3 },
      intro: 'Regent Kurogane drží císaře v zajetí a pod palácem slábne druhá pečeť.',
      outro: 'Z regenta spadla maska démona óni. Císař je volný a klan Kazehana přísahá věrnost spojenectví. Poslední pečeť leží na dalekém severu.',
      levels: [
        { id: 's3-1', name: 'Silnice Tókaidó', diff: 1.55, enemy: 'samurajove', roles: R4, reward: { gold: 1900, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [70, 28], story: 'Po hlavní silnici táhnou regentovy posily.' },
        { id: 's3-2', name: 'Sakurový průsmyk', diff: 1.6, enemy: 'samurajove', roles: R4, reward: { gold: 2000, gems: 30 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [86, 18], story: 'Mezi kvetoucími sakurami se rozhodne, kdo projde.' },
        { id: 's3-3', name: 'Noční útok', diff: 1.66, enemy: 'samurajove', roles: R5, mix: DEM(R1), reward: { gold: 2100, gems: 35 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [60, 13], story: 'Regent zaútočil v noci – a s jeho vojáky běží rohaté stíny. Drž formaci.' },
        { id: 's3-4', name: 'Brány paláce', diff: 1.72, enemy: 'samurajove', roles: R4, reward: { gold: 2200, gems: 40 }, castleSkin: 'temna', unitSkin: 'zlaty', pos: [34, 16], story: 'Zlatá garda regenta brání vnější brány paláce.' },
        { id: 's3-5', name: 'Regent Kurogane', diff: 1.8, enemy: 'samurajove', roles: R4, mix: DEM(R2), reward: { gold: 2800, gems: 80 }, castleSkin: 'temna', unitSkin: 'stinovy', pos: [16, 7], boss: true, story: 'Regent nosí masku démona óni a velí stínovým samurajům i běsům. Osvoboď císaře.' }
      ]
    }
  ],

  /* ------------------------------------------------------------ AKT III: VIKINGOVÉ */
  vikingove: [
    {
      id: 1, name: 'Domovské fjordy', label: { top: 63.5, right: 3 },
      intro: 'Jarl Hrafn Krutý přísahal věrnost Mrazivé koruně a podmaňuje fjordy. Jarlka Sigrun potřebuje tvou pomoc.',
      outro: 'Hrafn padl. Jeho černá runa se rozpadla na popel a vítr ho odnesl na sever, k Ledové pustině.',
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
      intro: 'Za fjordy leží Ledová pustina. Hlídá ji ledová stráž – padlí rytíři dávné výpravy, oživení mrazem.',
      outro: 'Ledová brána padla. Za ní se tyčí citadela Mrazivé koruny a nebe nad ní hoří rudě.',
      levels: [
        { id: 'v2-1', name: 'Zamrzlé jezero', diff: 1.56, enemy: 'kralovstvi', roles: R5, theme: 'sever', reward: { gold: 2100, gems: 25 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [20, 58], story: 'Led praská pod nohama. Postupuj opatrně.' },
        { id: 'v2-2', name: 'Sněžná hlídka', diff: 1.62, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 2200, gems: 25 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [44, 54], story: 'Hlídka ledové stráže tě už vyhlíží.' },
        { id: 'v2-3', name: 'Křišťálová rokle', diff: 1.68, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 2300, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [70, 50], story: 'Rokle plná krystalů odráží každý šíp.' },
        { id: 'v2-4', name: 'Bouřná výšina', diff: 1.74, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 2400, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [82, 41], story: 'Vichr a sníh. Nepřítel má výhodu výšky.' },
        { id: 'v2-5', name: 'Ledová brána', diff: 1.8, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 2900, gems: 55 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [58, 37], boss: true, story: 'Velitel ledové stráže brání jedinou bránu do srdce pustiny.' }
      ]
    },
    {
      id: 3, name: 'Ragnarök', label: { top: 1.2, left: 3 },
      intro: 'Mrazivá koruna, Azgarothův posel, láme poslední pečeť. Začíná soumrak bohů.',
      outro: 'Mrazivá koruna se roztříštila. Tři národy stojí poprvé po tisíci letech spolu – ale poslední pečeť praskla.',
      levels: [
        { id: 'v3-1', name: 'Konec světa', diff: 1.85, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 3000, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [28, 28], story: 'Na kraji známého světa stojí první ledová pevnost.' },
        { id: 'v3-2', name: 'Duhový most', diff: 1.9, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 3100, gems: 30 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [12, 18], story: 'Pod polární září se most mezi světy chvěje.' },
        { id: 'v3-3', name: 'Ledoví obři', diff: 1.95, enemy: 'kralovstvi', roles: R4, theme: 'sever', reward: { gold: 3200, gems: 35 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [40, 12], story: 'Rytíři ledové stráže jsou silní jako obři ze ság.' },
        { id: 'v3-4', name: 'Bouřné moře', diff: 2.0, enemy: 'kralovstvi', roles: R5, mix: DEM(R2), theme: 'sever', reward: { gold: 3300, gems: 40 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [66, 16], story: 'Zamrzlým mořem se k ledové stráži přidávají démoni.' },
        { id: 'v3-5', name: 'Citadela Mrazivé koruny', diff: 2.05, enemy: 'kralovstvi', roles: R4, mix: DEM(R3), theme: 'sever', reward: { gold: 4000, gems: 90 }, castleSkin: 'ledova', unitSkin: 'ledovy', pos: [84, 7], boss: true, story: 'Poraz Mrazivou korunu a zastav Ragnarök.' }
      ]
    }
  ],

  /* ------------------------------------------------------------ AKT IV: SPOJENECTVÍ */
  spojenectvi: [
    {
      id: 1, name: 'Brána pekel', label: { top: 56, right: 3 },
      intro: 'Spojené armády tří národů táhnou přes spálené pláně k Ohnivé hoře.',
      outro: 'Pekelná brána je dobytá. Na vrcholu Ohnivé hory čeká Azgaroth.',
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
      outro: 'Azgaroth padl. Ohnivá hora utichla.',
      levels: [
        { id: 'd2-1', name: 'Sirné prameny', diff: 2.1, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4300, gems: 50 }, castleSkin: 'temna', pos: [60, 50], story: 'Jedovatý dým a vroucí prameny. Chrliči útočí ze skal.' },
        { id: 'd2-2', name: 'Řetězový most', diff: 2.16, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4400, gems: 50 }, castleSkin: 'temna', pos: [32, 44], story: 'Most visí na řetězech nad propastí plnou ohně.' },
        { id: 'd2-3', name: 'Síň zatracených', diff: 2.22, enemy: 'demoni', roles: R3, alliance: true, reward: { gold: 4500, gems: 55 }, castleSkin: 'temna', pos: [18, 32], story: 'Zatracení rytíři kdysi sloužili Lví koruně. Dnes slouží peklu.' },
        { id: 'd2-4', name: 'Kráter', diff: 2.28, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 4600, gems: 55 }, castleSkin: 'temna', pos: [40, 25], story: 'Okraj kráteru. Pod tebou bublá láva, před tebou celá Azgarothova legie.' },
        { id: 'd2-5', name: 'Trůn Pekelného generála', diff: 2.3, enemy: 'demoni', roles: R4, alliance: true, reward: { gold: 8000, gems: 200 }, castleSkin: 'temna', pos: [50, 15], boss: 'demonkral', megaCastle: true, story: 'Závěrečná bitva. Obří pekelná pevnost má tři brány a démoni vycházejí ze všech najednou. Azgaroth sám vstoupí na bojiště. Až padne, jeho pevnost se otřese.' }
      ]
    }
  ]
};

/* Zpětná kompatibilita */
GameData.campaign = GameData.campaigns.kralovstvi;

/* ---------------------------------------------------------------------
   PŘÍBĚHOVÉ SCÉNY – rozhovory mezi akty. who = id postavy (GameData.cast)
   --------------------------------------------------------------------- */
GameData.cast = {
  vypravec: { name: 'Vypravěč', unit: null },
  aldrik: { name: 'Král Aldrik', unit: 'rytir', faction: 'kralovstvi', skin: 'zlaty' },
  rju: { name: 'Daimjó Rjú', unit: 'samuraj', faction: 'samurajove' },
  sigrun: { name: 'Jarlka Sigrun', unit: 'berserk', faction: 'vikingove' },
  azgaroth: { name: 'Azgaroth', unit: 'demonkral', faction: 'demoni', team: 'enemy' }
};
GameData.scenes = {
  prolog: {
    title: 'Prolog', theme: 'peklo',
    pages: [
      { who: 'vypravec', text: 'Před tisíci lety sestoupil z Ohnivé hory Azgaroth, Pekelný generál. Rytíři, samurajové a vikingové ho tehdy společně porazili a zapečetili třemi pečetěmi.' },
      { who: 'vypravec', text: 'Národy pak na spojenectví zapomněly. Pečeti slábnou a Azgarothův šepot znovu rozeštvává vládce.' },
      { who: 'aldrik', text: 'Maršále! Na hranicích hoří vesnice a v horách se probouzí Stínová legie. Ubraň království, než bude pozdě.' }
    ]
  },
  akt2: {
    title: 'Akt II · Klan Kazehana', theme: 'japonsko',
    pages: [
      { who: 'aldrik', text: 'Temný lord Morvan nesloužil sám sobě. Na jeho pečeti je znak Pekelného generála. Druhou pečeť střeží klan Kazehana na východě.' },
      { who: 'vypravec', text: 'Maršál se plaví přes moře do Země vycházejícího slunce. Tam ho přivítá mladý daimjó Rjú – jeho země je ale rozdělená válkou.' },
      { who: 'rju', text: 'Pomůžeme vám, rytíři, až sjednotíme provincie. Regent Kurogane se zavřel v hlavním městě a od té doby mluví hlasem, který není jeho.' }
    ]
  },
  akt3: {
    title: 'Akt III · Bouřný fjord', theme: 'sever',
    pages: [
      { who: 'rju', text: 'Regent nosil masku démona óni. Pečeť pod palácem je rozbitá. Zbývá ta poslední – na dalekém severu.' },
      { who: 'vypravec', text: 'Rytíři a samurajové připlouvají k Bouřnému fjordu. Jarlka Sigrun je přijme jen tehdy, když jí pomohou porazit Hrafna Krutého.' },
      { who: 'sigrun', text: 'Hrafn přísahal věrnost Mrazivé koruně. Skaldové zpívají, že je to Azgarothův posel. Sekery vzhůru!' }
    ]
  },
  akt4: {
    title: 'Akt IV · Spojenectví', theme: 'peklo',
    pages: [
      { who: 'sigrun', text: 'Mrazivá koruna padla, ale poslední pečeť praskla. Azgaroth je volný.' },
      { who: 'aldrik', text: 'Lví koruna, klan Kazehana a Bouřný fjord. Tři národy, jedna armáda. Táhneme k Ohnivé hoře!' },
      { who: 'vypravec', text: 'V bitvách spojenectví posíláš vojáky všech tří národů najednou. Každé království má vlastní přepínač AUTO – zapni ho a jeho vojáci budou vyrážet sami.' }
    ]
  },
  finale: {
    title: 'Trůn Pekelného generála', theme: 'peklo',
    pages: [
      { who: 'azgaroth', text: 'Tři národy… stejně jako před tisíci lety. Tentokrát vás spálím všechny.' },
      { who: 'rju', text: 'Až Pekelný generál padne, jeho pevnost se otřese. Pak udeřte všichni najednou!' }
    ]
  },
  epilog: {
    title: 'Epilog', theme: 'evropa',
    pages: [
      { who: 'vypravec', text: 'Azgaroth padl a Ohnivá hora utichla. Tři národy obnovily pečeť – tentokrát jedinou, společnou, kterou nerozbije žádný svár.' },
      { who: 'sigrun', text: 'Skaldové o téhle bitvě budou zpívat tisíc let.' },
      { who: 'aldrik', text: 'Spojenectví vydrží, dokud si budeme pamatovat tento den. Děkuji, maršále.' },
      { who: 'azgaroth', text: 'Hlupáci… Já byl jen jeden z generálů pekla. Mí bratři už drží vaše země – a vaše lidi.' },
      { who: 'vypravec', text: 'Démoni ovládli kraj za krajem a odvlekli zajatce. Spojené národy se vydávají osvobodit zemi území po území, porazit pekelné generály a zachránit rukojmí. Pokračování brzy…' }
    ]
  }
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
    return GameData.saga.some(s => s.faction === f) && this.actUnlocked(save, f);
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
